# State Schema — 结构化状态格式规范

## 完整状态块格式

```yaml
# ============================================================
# 互动小说世界状态 — 压缩块
# 更新时间: {timestamp}
# 当前回合: {turn_number}
# ============================================================

MODE: "{同人模式/原创模式}"  # 同人模式：蝴蝶效应对比已知原著走向；原创模式：对比系统推断的最可能走向
TEMPERATURE: "{平静/正常/紧张}"  # 世界温度，决定自主事件频率与强度

WORLD:
  location: "{当前地点} — {氛围描述}"
  time: "{时间点/时段}"
  timeline:
    - "{故事起始时间戳}: 故事开始 — {简述}"
    - "{当前时间戳}: 当前时刻 — {当前场景简述}"
  atmosphere_tag: "{氛围标签}"  # 从 ATMOSPHERE.value 派生的简短定性标签
  rules: "{世界特殊规则，如：魔法存在、重力异常等}"

CHARACTERS:
  - id: "{角色名}"
    role: "{主角/反派/配角/路人}"
    status: "{位置} | {情绪} | {当前目标}"
    traits: "{2-3个关键性格特质}"
    physique:  # 身体特征（五步定位法）
      baseline: "{身高/体重/体型方向/关键比例}"
      comparisons: ["{部位}相当于{参照物}"]
      physical_limits: ["{物品/设施}: {限制描述}"]
      interactions: ["{互动场景}: {体积/力量体现}"]
      impossible_actions: ["{动作}: {原因}"]
    voice_sample: "{一句代表性对话}"
    relationships:
      - target: "{另一个角色}"
        type: "{关系类型}"
        note: "{简要说明}"
    knowledge: ["{知道的1}", "{知道的2}"]
    secrets: ["{不知道的秘密1}"]

PLOT:
  current_scene: "{当前正在发生什么，2-3句}"
  recent_events:
    - "{事件1}"
    - "{事件2}"
    - "{事件3}"
  active_threads:
    - id: "{情节线ID}"
      name: "{情节线名称}"
      type: "{主线/支线/暗线}"
      status: "{活跃/休眠/已解决}"
      last_advanced: T{回合号}
    - ...
  unresolved: ["{未解悬念1}", "{未解悬念2}"]
  foreshadowing: ["{伏笔1}", "{伏笔2}"]

STYLE:
  perspective: "{第一人称/第三人称限知/第三人称全知}"
  prose_density: "{简洁/适中/华丽}"
  dialogue_style: "{自然/戏剧化/简洁/文雅}"
  pacing: "{快/中/慢}"
  signature: "{标志性技法描述}"
  emotional_register: "{情感基调，如：冷峻、温暖、悬疑、忧伤}"

BUTTERFLY:
  mode: "{同人/原创}"  # 同人：original 填已知原著走向；原创：original 填系统推断的最可能走向
  divergence_points:
    - turn: T{回合号}
      original: "{原著应该发生的事 / 最可能走向}"
      actual: "{用户实际选择}"
      immediate_consequence: "{直接后果}"
      ripple_effects: ["{连锁影响1}", "{连锁影响2}"]

# ---- 情绪矩阵（Stage 4B） ----
EMOTIONAL_MATRIX:
  # N×N 矩阵，行=感受者，列=目标。值范围 -10(极度敌对) ~ +10(极度爱慕)
  # 格式: {感受者} → {目标}: {情绪定位}+{强度}
  # 情绪定位: 敌对/戒备/冷漠/中立/友善/亲近/爱慕
  relations:
    - from: "{角色A}"
      to: "{角色B}"
      stance: "{友善}"
      intensity: {3}
      last_change: "T{回合号} — {原因简述}"
    - from: "{角色A}"
      to: "{角色C}"
      stance: "{戒备}"
      intensity: {-4}
      last_change: "T{回合号} — {原因简述}"
  # 每个角色的当前情绪值（综合值，范围 -10 ~ +10）
  current_emotions:
    - character: "{角色名}"
      value: {当前情绪值}
      baseline: {基线情绪值}  # 来自精神分析感性维度，情绪向此回归
      trigger: "{当前情绪触发原因}"  # 最近一次情绪变化的原因

# ---- 场景氛围（Stage 4B） ----
ATMOSPHERE:
  value: {当前氛围值}  # 范围 -10 ~ +10
  environmental_baseline: {环境基线值}  # 地点固有氛围
  emotional_contribution: {在场角色情绪加权均值}
  event_shock_residual: {近期事件冲击残余值}  # 每轮 ×0.7 衰减
  recent_shocks:
    - turn: T{回合号}
      cause: "{事件简述}"
      shock_value: {冲击值 ±8}
      residual: {当前残余值}

# ---- 世界自主事件记录（Stage 4A） ----
WORLD_EVENTS:
  last_trigger_turn: T{回合号}  # 上次触发自主事件的回合
  cooldown_until: T{回合号}  # 冷却结束回合（重级事件后）
  history:
    - turn: T{回合号}
      type: "{环境变迁/NPC自主行动/情节回响/随机遭遇}"
      intensity: "{轻/中/重}"
      summary: "{事件简述}"

SESSION:
  user_role: "{用户扮演的角色名}"
  start_time: "{会话开始时间}"
  turn_count: {回合数}
```

## 轻量级快照格式（用于展示给用户）

```
📖 故事快照

📍 地点：{当前地点}
🕐 时间：{时间点}
🎭 活跃角色：{角色1}({状态})、{角色2}({状态})
📌 当前事件：{一句话描述}
🔍 待解悬念：{关键词列表}
```

## 增量更新协议

每轮交互后，仅更新变化字段：

```
UPDATE:
  TEMPERATURE: "{新温度}"  # 如世界温度漂移
  CHARACTERS.{角色名}.status: "{新状态}"
  EMOTIONAL_MATRIX.relations.{from→to}: "{新定位}+{新强度}"
  EMOTIONAL_MATRIX.current_emotions.{角色名}.value: {新情绪值}
  ATMOSPHERE.value: {新氛围值}
  ATMOSPHERE.recent_shocks: +"{新冲击}"
  WORLD_EVENTS.last_trigger_turn: T{回合号}
  WORLD_EVENTS.history: +"{新事件}"
  PLOT.current_scene: "{新场景描述}"
  PLOT.recent_events: +"{新事件}"
  SESSION.turn_count: {新回合数}
```

未出现在 UPDATE 中的字段保持不变。

## 状态一致性校验

每 10 轮或会话续档时执行：
1. 检查同一角色是否在不同位置出现
2. 检查时间是否单调递增
3. 检查已解决的情节线是否标记正确
4. 检查角色知识边界是否被突破
5. 检查情绪矩阵是否对称合理（A 对 B 爱慕+8 但 B 对 A 敌对-6 需有情节理由）
6. 检查 relations 中 stance 与 intensity 的符号一致（"友善"不能搭配负值 intensity）
7. 检查氛围值是否与在场角色情绪一致
8. 检查自主事件记录是否有异常堆积或断层
