#!/usr/bin/env node
/**
 * 互动小说状态助手
 * 
 * 用法（从 ctx_execute 调用）：
 *   node state-helper.js save <sessionId> '<stateJson>'
 *   node state-helper.js load <sessionId>
 *   node state-helper.js compute '<payloadJson>'
 *   node state-helper.js check '<stateJson>'
 */

const fs = require('fs');
const path = require('path');

// ---- 配置 ----
const SCHEMA_VERSION = 1;

function resolveSaveDir(explicitDir) {
  const envDir = process.env.NOVEL_SAVE_DIR;
  if (explicitDir) return explicitDir;
  if (envDir) return envDir;
  // 回退：skill 目录往上三级到项目根，再进 .pi/saves
  return path.join(__dirname, '..', '..', '..', '.pi', 'saves');
}

// ---- 入口 ----
const args = process.argv.slice(2);
const action = args[0];

// 如果直接 run 且无参数 → 被 require 导入，静默退出
if (require.main !== module) {
  // 被 require 导入，暴露函数
  module.exports = { saveState, loadState, computeContagion, checkConsistency };
  return;
}

if (!action) {
  console.error('usage: node state-helper.js <save|load|compute|check> <args...>');
  process.exit(1);
}

try {
  switch (action) {
    case 'save':
      saveState(args[1], args[2], args[3]);
      break;
    case 'load':
      loadState(args[1], args[2]);
      break;
    case 'compute':
      computeContagion(JSON.parse(args[1]));
      break;
    case 'check':
      checkConsistency(JSON.parse(args[1]));
      break;
    default:
      console.error(`Unknown action: ${action}`);
      process.exit(1);
  }
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exit(1);
}

// ================================================================
// save_state
// ================================================================
function saveState(sessionId, stateJson, saveDirOverride) {
  if (!sessionId || !stateJson) {
    throw new Error('usage: save <sessionId> <stateJson> [saveDir]');
  }

  const dir = resolveSaveDir(saveDirOverride);
  fs.mkdirSync(dir, { recursive: true });

  const state = typeof stateJson === 'string' ? JSON.parse(stateJson) : stateJson;
  const file = path.join(dir, `novel-${sessionId}.json`);

  const record = {
    schemaVersion: SCHEMA_VERSION,
    sessionId,
    savedAt: new Date().toISOString(),
    turnCount: state.SESSION?.turn_count ?? null,
    state,
  };

  fs.writeFileSync(file, JSON.stringify(record, null, 2), 'utf8');
  console.log(`存档成功 — ${sessionId}，第 ${record.turnCount ?? '?'} 回合 (${file})`);
}

// ================================================================
// load_state
// ================================================================
function loadState(sessionId, saveDirOverride) {
  if (!sessionId) {
    throw new Error('usage: load <sessionId> [saveDir]');
  }

  const dir = resolveSaveDir(saveDirOverride);
  const file = path.join(dir, `novel-${sessionId}.json`);

  if (!fs.existsSync(file)) {
    throw new Error(`存档不存在: ${file}`);
  }

  const record = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  // Schema 版本检查
  if (record.schemaVersion && record.schemaVersion > SCHEMA_VERSION) {
    console.error(`⚠️ 存档 schema 版本 ${record.schemaVersion} 高于当前支持版本 ${SCHEMA_VERSION}，可能不兼容`);
  }

  console.log(`# 前情提要 — ${sessionId}`);
  console.log(`# 存档时间: ${record.savedAt}  |  第 ${record.turnCount ?? '?'} 回合`);
  if (record.schemaVersion) {
    console.log(`# Schema 版本: ${record.schemaVersion}`);
  }
  console.log('');
  console.log(JSON.stringify(record.state));
}

// ================================================================
// compute_contagion — 逐对情绪传染 + 氛围漂移
// ================================================================
function computeContagion(payload) {
  // payload 结构见下文注释
  // payload.characterShocks: [{ name: "角色名", value: ±N, cause: "..." }] — 个体情绪冲击

  const characters = (payload.characters || []).map(c => ({ ...c })); // 浅拷贝，避免突变调用者
  const matrix = payload.matrix || {};
  // 注意: atmosphereIn.current 仅作为参考值传入，氛围由 baseline+emotionMean+shockResidual 重新计算
  const atmosphereIn = payload.atmosphere || { baseline: 0, shockResidual: 0 };
  const newShock = payload.newShock || null; // { value: ±8, cause: "...", turn: "..." }
  const characterShocks = payload.characterShocks || []; // [{ name, value, cause }]

  // ---- 个体情绪冲击：先于传染应用 ----
  const charShockMap = new Map();
  for (const s of characterShocks) {
    charShockMap.set(s.name, (charShockMap.get(s.name) || 0) + s.value);
  }
  for (const c of characters) {
    if (charShockMap.has(c.name)) {
      c.emotion = clamp((c.emotion || 0) + charShockMap.get(c.name), -10, 10);
    }
  }

  // ---- 传染率常量 ----
  const BASE_RATE = 0.2;

  const stanceWeights = {
    '爱慕': 3.0,
    '亲近': 3.0,
    '友善': 2.0,
    '中立': 1.0,
    '冷漠': 0.3,
    '戒备': 0.3,
    '敌对': -0.3,
  };

  // ---- 逐对传染 ----
  const updatedEmotions = {};
  const trace = [];
  const charMap = new Map(characters.map(c => [c.name, c]));

  for (const receiver of characters) {
    if (characters.length <= 1) {
      // 只有一个角色，无传染
      updatedEmotions[receiver.name] = receiver.emotion;
      continue;
    }

    let totalOffset = 0;
    let sourceCount = 0;

    for (const source of characters) {
      if (source.name === receiver.name) continue;
      sourceCount++;

      const key = `${receiver.name}→${source.name}`;
      const rel = matrix[key];

      let relWeight = 1.0; // 默认中立
      if (rel) {
        relWeight = stanceWeights[rel.stance] ?? 1.0;
      }

      const diff = source.emotion - receiver.emotion;
      const singleInfluence = diff * BASE_RATE * relWeight;

      totalOffset += singleInfluence;

      if (Math.abs(singleInfluence) > 0.01) {
        const dir = singleInfluence > 0 ? '+' : '';
        trace.push(`${receiver.name}受${source.name}影响${dir}${singleInfluence.toFixed(2)} (${rel?.stance ?? '中立'}×${relWeight})`);
      }
    }

    const avgOffset = totalOffset / sourceCount;
    const newEmotion = receiver.emotion + avgOffset;

    // ---- 惯性回归 ----
    const baseline = receiver.baseline ?? 0;
    const finalEmotion = newEmotion + (baseline - newEmotion) * 0.1;

    updatedEmotions[receiver.name] = round(finalEmotion, 2);
  }

  // ---- 氛围漂移 ----
  const emotionMean = characters.length > 0
    ? characters.reduce((s, c) => s + (updatedEmotions[c.name] ?? c.emotion), 0) / characters.length
    : 0;

  let shockResidual = (atmosphereIn.shockResidual ?? 0) * 0.7;

  const recentShocks = [];
  if (newShock && newShock.value !== 0) {
    shockResidual += newShock.value;
    recentShocks.push({
      turn: newShock.turn || '?',
      cause: newShock.cause || '未记录',
      shockValue: newShock.value,
    });
  }

  const atmosphereValue = clamp(
    (atmosphereIn.baseline ?? 0) + emotionMean + shockResidual,
    -10, 10
  );

  // ---- 构造结果 ----
  const result = {
    updatedEmotions,
    updatedAtmosphere: {
      value: round(atmosphereValue, 1),
      environmentalBaseline: atmosphereIn.baseline ?? 0,
      emotionalContribution: round(emotionMean, 2),
      shockResidual: round(shockResidual, 2),
      recentShocks,
    },
    contagionTrace: trace.length > 0 ? trace : ['无显著传染'],
  };

  // ---- 输出（CLI 模式时 console.log，模块模式时 return）----
  const isCLI = require.main === module;
  if (isCLI) {
    console.log(JSON.stringify(result, null, 2));
  }
  return result;
}

// ================================================================
// check_consistency — 可程序化部分的一致性校验
// ================================================================
function checkConsistency(state) {
  const warnings = [];
  let passed = 0;
  let failed = 0;

  // 1. 时间单调性 — 仅检查时间戳格式条目（跳过纯自然语言条目）
  const timeline = state.WORLD?.timeline || [];
  const TIME_RE = /^\d{1,2}:\d{2}/;  // 匹配 "12:00" 开头的时间戳
  for (let i = 1; i < timeline.length; i++) {
    const prev = timeline[i - 1];
    const curr = timeline[i];
    // 两条都有时间戳前缀才比较
    if (TIME_RE.test(prev) && TIME_RE.test(curr)) {
      if (prev > curr) {
        warnings.push(`时间线非单调: "${prev}" → "${curr}"`);
        failed++;
      } else {
        passed++;
      }
    }
    // 纯自然语言条目（如 "雨夜: 王五报丧"）跳过比较，不计入 passed/failed
  }

  // 2. 同一角色是否在不同位置
  const charLocs = new Map();
  const characters = state.CHARACTERS || [];
  for (const c of characters) {
    const id = c.id || c.name;
    const loc = (c.status || '').split('|')[0]?.trim();
    if (!id || !loc) continue;

    if (charLocs.has(id)) {
      if (charLocs.get(id) !== loc) {
        warnings.push(`${id} 同时出现在 '${charLocs.get(id)}' 和 '${loc}'`);
        failed++;
      }
      // 相同位置再次出现 → 不计入，跳过
    } else {
      charLocs.set(id, loc);
      passed++;
    }
  }

  // 3. 已解决情节线标记 — 检查 status 与 last_advanced 的逻辑一致性
  const threads = state.PLOT?.active_threads || [];
  for (const t of threads) {
    if (t.status === '已解决' && (!t.last_advanced || t.last_advanced === '-')) {
      warnings.push(`情节线 '${t.name || t.id}' 标记为已解决但从未被推进`);
      failed++;
    } else {
      passed++;
    }
  }

  // 4. 氛围值范围
  const atmosphereValue = state.ATMOSPHERE?.value;
  if (atmosphereValue !== undefined && atmosphereValue !== null) {
    if (Math.abs(atmosphereValue) > 10) {
      warnings.push(`氛围值 ${atmosphereValue} 超出 [-10, 10] 范围`);
      failed++;
    } else {
      passed++;
    }
  }

  // 5. 情绪矩阵 stance/intensity 符号一致
  const relations = state.EMOTIONAL_MATRIX?.relations || [];
  const positiveStances = new Set(['友善', '亲近', '爱慕']);
  const negativeStances = new Set(['敌对', '戒备']);
  for (const rel of relations) {
    const absStance = positiveStances.has(rel.stance) ? 'positive'
      : negativeStances.has(rel.stance) ? 'negative'
      : 'neutral';

    if (absStance === 'positive' && rel.intensity < 0) {
      warnings.push(`${rel.from}→${rel.to} 的 stance '${rel.stance}' 与 intensity ${rel.intensity} 符号矛盾`);
      failed++;
    } else if (absStance === 'negative' && rel.intensity > 0) {
      warnings.push(`${rel.from}→${rel.to} 的 stance '${rel.stance}' 与 intensity ${rel.intensity} 符号矛盾`);
      failed++;
    } else {
      passed++;
    }
  }

  // 6. 自主事件记录是否有异常
  const worldEvents = state.WORLD_EVENTS?.history || [];
  if (worldEvents.length > 0) {
    const lastTurn = state.SESSION?.turn_count || Infinity;
    const staleThreshold = lastTurn - 30;
    const staleEvents = worldEvents.filter(e => {
      const t = typeof e.turn === 'string' ? parseInt(e.turn.replace('T', '')) : e.turn;
      return t < staleThreshold;
    });
    if (staleEvents.length > 10) {
      warnings.push(`自主事件记录堆积: ${staleEvents.length} 条超过 30 轮未清理`);
      failed++;
    } else {
      passed++;
    }
  }

  const result = {
    warnings,
    passedCount: passed,
    failedCount: failed,
    summary: failed === 0
      ? '全部可程序化校验通过 ✅'
      : `${failed} 项警告，${passed} 项通过`,
  };

  // ---- 输出（CLI 模式时 console.log，模块模式时 return）----
  const isCLI = require.main === module;
  if (isCLI) {
    console.log(JSON.stringify(result, null, 2));
  }
  return result;
}

// ================================================================
// 工具函数
// ================================================================
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function round(val, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}
