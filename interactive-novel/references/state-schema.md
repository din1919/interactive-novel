# State Schema — 结构化状态格式规范

## 完整状态块格式

```yaml
# ============================================================
# 互动小说世界状态 — 压缩块
# 更新时间: {timestamp}
# 当前回合: {turn_number}
# ============================================================

MODE: "{同人模式/原创模式}"  # 同人模式：蝴蝶效应对比已知原著走向；原创模式：对比系统推断的最可能走向

WORLD:
  location: "{当前地点} — {氛围描述}"
  time: "{时间点/时段}"
  timeline:
    - "{故事起始时间戳}: 故事开始 — {简述}"
    - "{当前时间戳}: 当前时刻 — {当前场景简述}"
  atmosphere: "{整体氛围关键词}"
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
  CHARACTERS.{角色名}.status: "{新状态}"
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
