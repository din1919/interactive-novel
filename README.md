# Interactive Novel Participation Engine · 互动小说参与引擎

[English](#english) | [中文](#中文)

---

## English

### What is Interactive Novel?

**Interactive Novel** is a narrative participation engine that transforms any novel excerpt into a living, interactive story world. Instead of passively reading, you **step into** the story as a character — making decisions, speaking dialogue, observing the world, and influencing the plot in real time, while the system faithfully maintains the original author's writing style, world physics, and character consistency.

Think of it as a **narrator + game master** hybrid: you control your character's actions and choices; the system controls how the world, NPCs, and plot lines react. The engine never "grabs the steering wheel" — your agency is absolute.

### Core Philosophy: **Separation of Agency**

```
You (the player)      →  Character decisions, actions, dialogue, observations, thoughts
System (the engine)   →  World reactions, NPC behavior, plot advancement, environmental consequences
```

The system will never describe what your character **does**, **says**, or **thinks**. It only describes what your character **perceives**. The rest is yours.

### Key Features

| Feature | Description |
|---|---|
| **World State Extraction** | Automatically parses source text into structured world state — characters, settings, active plot lines, foreshadowing elements, and writing style profiles. |
| **Character Psychoanalysis** | A unique four-layer model (Desire / Sensibility / Intellect / Reason) to deeply profile every character's personality, dominant traits, speech patterns, and inner conflicts — ensuring NPCs stay true to themselves. |
| **Style Matching** | Analyzes the original author's narrative perspective, text density, dialogue style, pacing, figurative language, and emotional tone — then mirrors it in every response. |
| **Branching Narrative** | Every player choice creates meaningful divergence. Plot lines can be resolved, abandoned, or rewritten entirely — the story adapts organically. |
| **Butterfly Effect Tracking** | In fanfic mode, tracks how deviations from canon cascade through the world. In original mode, tracks divergence from the system's inferred most-likely path. Consequences appear gradually through environmental cues. |
| **Four-Tier Memory** | Hot (last 5 turns, full text), Warm (turns 6–20, compressed decisions+outcomes), Cold (all state variables as structured key-value), Archive (original text, retrieval only). |
| **World Autonomous Events** | The world doesn't wait for the player. NPCs act independently, environment shifts, plot ripples resurface, and random encounters occur — on a cadence tuned to the world's tension level. |
| **Emotional Contagion & Atmosphere Drift** | Character emotions infect each other (weighted by relationship and status), and scene atmosphere decays or intensifies over time — driving descriptive tone and NPC behavior. |
| **Consistency Engine** | Every response passes 7 pre-flight checks: setting consistency, character voice matching, timeline integrity, plot-line tracking, butterfly effect accumulation, emotional consistency, and world autonomous event plausibility. |
| **Dual-Panel Output** | Every system reply uses the mandatory `【World Response】` + `【Your Situation】` format — never merged, never replaced. |
| **Session Persistence** | Full save/load support with state snapshots, session summaries, and "Previously on..." recaps. |

### Full Pipeline (11 Stages)

```
Stage 0: Context Assessment → intake strategy based on text volume
Stage 1: World State Extraction → characters, setting, plot, style
Stage 2: State Compression → compact structured state block
Stage 3: Role Anchoring → user selects character, knowledge boundary set
Stage 4: Interaction Loop → the core engine (per-turn state update)
  ├─ Stage 4A: World Autonomous Events → NPC actions, environment shifts, random encounters
  └─ Stage 4B: Emotional Contagion & Atmosphere Drift → emotion spread, mood decay/intensification
Stage 5: Memory Management → hot/warm/cold/archive tiers
Stage 6: Consistency Engine → 7 pre-response validations
Stage 7: NSFW Protocol → explicit content generation guidelines
Stage 8: Session Management → save, load, resume, recap
```

### Trigger Conditions

The skill activates when the user:
- Pastes a novel excerpt and expresses desire to "enter", "participate", or "role-play"
- Says "I want to enter this story", "Let me be character X", "Start from this scene"
- Discusses a novel with "If I were X, I would..."
- Mentions "interactive fiction", "text adventure", "role-playing", "immersive reading", "IF", "AVG"

### Reference Documents

Located in `references/`:
- `pipeline-details.md` — Complete 11-stage documentation with edge cases and advanced techniques
- `prompt-templates.md` — Ready-to-use prompt templates for each stage
- `state-schema.md` — Structured state format specification (including emotional matrix and atmosphere values)
- `style-matching-guide.md` — Writing style matching operations guide
- `character-psychoanalysis.md` — Four-layer character psychoanalysis model
- `nsfw-guidelines.md` — NSFW content generation protocol

Also available:
- `state-helper.js` — CLI/programmatic state helper (save/load, emotional contagion calculation, consistency checks)

---

## 中文

### 什么是互动小说引擎？

**互动小说参与引擎** 是一个可以将任意小说段落转化为可互动叙事体验的系统。你不是被动的读者，而是 **走进** 故事，成为其中的一个角色——做出决定、说出对白、观察世界、实时影响剧情走向，而系统则忠实维护原作者的文风、世界规则和角色一致性。

可以把它理解为一个 **叙述者 + 游戏主持** 的混合体：你控制角色的行动与选择，系统控制世界、NPC 和情节线的反应。引擎绝不会"抢你的方向盘"——你的主体性是绝对的。

### 核心设计理念：**权限分离**

```
你（玩家）           →  角色的决策、行动、对话、观察、思考
系统（引擎）         →  世界反应、NPC 行为、情节推进、环境后果
```

系统绝不描述你的角色 **做了什么、说了什么、想了什么**。它只描述你的角色 **感知到了什么**。其余的，全由你来。

### 核心特性

| 特性 | 说明 |
|---|---|
| **世界状态提取** | 自动从原文解析结构化世界状态——角色、场景、活跃情节线、伏笔元素和文风画像。 |
| **角色精神分析** | 独特的四层次模型（欲望/感性/知性/理性），深度剖析每个角色的性格、主导特质、说话风格和内在冲突——确保 NPC 始终忠于自身。 |
| **文风匹配** | 分析原作的叙事视角、文字密度、对话风格、节奏、比喻偏好和情感基调——并在每一次回复中镜像呈现。 |
| **分支叙事** | 每一个玩家的选择都会产生有意义的剧情分叉。情节线可以被完成、被放弃、或被彻底改写——故事有机地适应变化。 |
| **蝴蝶效应追踪** | 同人模式：追踪偏离原著的连锁后果；原创模式：追踪偏离系统推断最可能走向的涟漪。通过环境描写逐步呈现。 |
| **四层记忆架构** | 热记忆（最近 5 轮全文）、温记忆（6-20 轮压缩为决策+结果）、冷记忆（全量状态变量结构化键值对）、归档（原始文本，按需检索）。 |
| **世界自主事件** | 世界不等待玩家。NPC 自主行动、环境变迁、情节回响、随机遭遇——按照世界紧张度调节触发频率。 |
| **情绪传染与氛围漂移** | 角色情绪互相传染（按关系和地位加权），场景氛围随时间衰减或强化——驱动描写色调和 NPC 行为。 |
| **一致性引擎** | 每轮回复前运行 7 项校验：设定一致性、角色声音匹配、时间线完整性、情节线追踪、蝴蝶效应累积、情绪一致性、世界自主事件合理性。 |
| **双段输出格式** | 每条系统回复强制使用 `【世界回应】` + `【你的处境】` 双段格式——不可缺段、不可合并、不可替换。 |
| **会话持久化** | 完整的存/读档支持，包含状态快照、会话摘要和"前情提要"回顾。 |

### 完整流水线（11 个阶段）

```
Stage 0: 预检 → 根据文本量决定摄入策略
Stage 1: 世界状态提取 → 角色、设定、情节、文风
Stage 2: 状态压缩 → 紧凑的结构化状态块
Stage 3: 角色锚定 → 用户选定角色，建立知识边界
Stage 4: 交互循环 → 核心引擎（每轮状态更新）
  ├─ Stage 4A: 世界自主事件 → NPC 行动、环境变化、随机遭遇
  └─ Stage 4B: 情绪传染与氛围漂移 → 情绪扩散、氛围衰减/强化
Stage 5: 记忆管理 → 热/温/冷/归档四层
Stage 6: 一致性引擎 → 7 项响应前校验
Stage 7: NSFW 协议 → 性内容生成规范
Stage 8: 会话管理 → 存/读档/续档/回顾
```

### 触发生效条件

以下任一条件满足时加载此 Skill：
- 用户粘贴小说原文并表示想"进入""参与""扮演""体验"
- 用户说"我想进这个故事""让我当 XX 角色""从这个场景开始玩"
- 用户在讨论小说时说"如果我是 XX，我会..."
- 用户提及"互动小说""文字冒险""角色扮演""沉浸式阅读""IF""AVG"等概念

### 参考文档

位于 `references/` 目录：
- `pipeline-details.md` — 完整 11 阶段详细文档，含边缘情况和进阶技巧
- `prompt-templates.md` — 各阶段的即用提示词模板
- `state-schema.md` — 结构化状态格式规范（含情绪矩阵和氛围值）
- `style-matching-guide.md` — 文风匹配操作指南（含核心风格规范）
- `character-psychoanalysis.md` — 角色精神分析四层次模型与情节构建规范
- `nsfw-guidelines.md` — NSFW 内容生成协议

其他工具：
- `state-helper.js` — CLI/编程状态助手（存/读档、情绪传染计算、一致性校验）

---

## Output Format

Every system reply follows this mandatory structure:

```
【世界回应】  /  [World Response]
{Environmental description, NPC reactions, plot advancement}

【你的处境】  /  [Your Situation]
{What your character perceives right now}
{Natural observation of available directions — never numbered options}
{Status: location, companions, mood, known threats/opportunities}

---
📍 {Current Location} | 🕐 {Story Time} | 🔄 Turn {N}
```

This format is **non-negotiable** and checked before every response. Any reply that violates it is considered invalid.

---

## Interactive Novel Skill 互动小说引擎

> Step into the story. Become the character. Change the narrative.
>
> 走进故事。成为角色。改变叙事。
