# EMERGENCE - 涌现

## AI 协作生存模拟器

---

## 1. 项目概述

**项目名称**: EMERGENCE (涌现)  
**项目类型**: AI Agent 协作模拟 + 实时交互  
**核心功能**: 观察3个AI角色在陌生世界中协作生存，实时干预AI决策  
**演示场景**: 黑客松现场展示 + 观众互动

### 核心特性

1. **AI协作生存**: 3个AI角色各有性格，协作在荒岛生存
2. **No Man's Sky风格UI**: 扫描探测界面，全息投影效果
3. **上帝视角干预**: 实时发布任务、建议、命令、投票
4. **实时可视化**: 扫描波纹、神经连接、数据流动画

### 设计理念

**核心概念**: AI文明从无到有的"涌现"过程 - 就像观察一个胚胎发育、一个星系诞生、一个文明崛起

**视觉风格**: No Man's Sky的扫描探测 × 生物有机感 × 数据流动

---

## 2. 技术栈

### 技术选型

| 模块 | 技术 | 版本 | 文档链接 |
|------|------|------|----------|
| **前端框架** | Next.js | 16 | [Next.js 16 Docs](https://nextjs.org/docs) |
| **状态管理** | Zustand | 5.x | [Zustand Docs](https://zustand-demo.pmnd.rs/) |
| **AI SDK** | Vercel AI SDK | 4.x | [AI SDK Docs](https://sdk.vercel.ai/docs) |
| **样式** | Tailwind CSS | 3.x | [Tailwind CSS Docs](https://tailwindcss.com/docs) |
| **动画** | Framer Motion | 11.x | [Framer Motion Docs](https://www.framer.com/motion/) |

### 核心依赖

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "zustand": "^5.0.0",
    "framer-motion": "^11.0.0",
    "ai": "^4.0.0",
    "@ai-sdk/anthropic": "^4.0.0",
    "@ai-sdk/openai": "^4.0.0",
    "@ai-sdk/openai-compatible": "^2.0.0",
    "tailwindcss": "^3.4.0",
    "zod": "^4.0.0"
  }
}
```

---

## 3. UI/UX 设计

### 3.1 完整界面设计

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                                      │
│                                        ╭────────────────────────────────────────────────────────────────────╮           │
│                                        │                              ✦ EMERGENCE ✦                             │           │
│                                        │                         ──────── ◈ ────────                           │           │
│                                        │                        THE BIRTH OF AI CIVILIZATION                  │           │
│                                        ╰────────────────────────────────────────────────────────────────────╯           │
│                                                                                                                      │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │     ╭────────────────────────────────────────────────────────────────────────────────────────────────╮   │   │
│   │     │                            ╭──────────────────────────────────────────────╮                        │   │   │
│   │     │                            │           EMERGENCE ZONE                    │                        │   │   │
│   │     │                            │                                            │                        │   │   │
│   │     │                            │    AI CLUSTER - 3个AI可视化                │                        │   │   │
│   │     │                            │    - 连接线动画                           │                        │   │   │
│   │     │                            │    - 扫描波纹效果                         │                        │   │   │
│   │     │                            │    - 资源点标记                           │                        │   │   │
│   │     │                            ╰──────────────────────────────────────────────╯                        │   │   │
│   │     ╰────────────────────────────────────────────────────────────────────────────────────────────────╯   │   │
│   └───────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                                      │
│   ┌────────────────────────────┐    ┌─────────────────────────────────────────────────────────────────────────┐    │
│   │     ◉ CLUSTER STATUS       │    │     ◉ NEURAL LINK                                                     │    │
│   │                            │    │                                                                         │    │
│   │  ◈ ENTITY: 3              │    │     [ALEX] 构造者 - "资源充足，庇护所建造进度 60%"                 │    │
│   │  ◈ STATUS: ACTIVE         │    │     [NOVA] 探索者 - "发现新材料区域，准备出发"                    │    │
│   │  ◈ COHESION: 87%          │    │     [ZETA] 指挥官 - "建议优先提升仓储容量"                         │    │
│   │                            │    │                                                                         │    │
│   │  ─────────────────────     │    │     ───────────────────────────────────────────────────────           │    │
│   │                            │    │     [EVENT] 系统事件: AI-02 提议 → AI-01 同意                      │    │
│   │  ◈ ENERGY    ████░░ 72%  │    └─────────────────────────────────────────────────────────────────────────┘    │
│   │  ◈ WOOD      ███░░░ 45%  │                                                                                │
│   │  ◈ STONE     ██░░░░ 30%  │    ┌─────────────────────────────────────────────────────────────────────────┐    │
│   │  ◈ FOOD      █████░ 85%  │    │     ◉ EXECUTION QUEUE                                               │    │
│   │  ◈ WATER     ████░░ 70%  │    │                                                                         │    │
│   │                            │    │   [NOVA] 前往森林采集 ─────────────────████████░░░░                 │    │
│   │  ◉ THREAT LEVEL: LOW      │    │   [ALEX] 建造庇护所 ───────────────██████░░░░░░░░░                 │    │
│   │  ◉ DAY CYCLE: 03:14:32    │    │   [ZETA] 规划明日任务 ────────────████░░░░░░░░░░░░░                 │    │
│   └────────────────────────────┘    └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                                      │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │   ◉ GOD MODE INTERVENTION                    [▶ LIVE] [⏸ PAUSE] [⏪ REWIND]                              │   │
│   │   ════════════════════════════════════════════════════════════════════════════════                        │   │
│   │   >  [                                    ] [◉ EXECUTE]                                                  │   │
│   │                                                                                                            │   │
│   │      [📋 MISSION] [💡 SUGGEST] [⚡ COMMAND] [🗳️ VOTE] [🔧 ADJUST]                                     │   │
│   └───────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 配色方案

```css
:root {
  /* 背景 - 深层宇宙 */
  --bg-void: #050508;
  --bg-deep: #0a0a12;
  --bg-panel: rgba(12, 12, 24, 0.85);
  
  /* 主色调 - 生物荧光 */
  --bio-cyan: #00f5d4;
  --bio-green: #00ff87;
  --bio-purple: #9d4edd;
  --bio-pink: #ff006e;
  --bio-orange: #ff9500;
  
  /* 扫描线 */
  --scan-cyan: #00f5d4;
  --scan-blue: #00b4d8;
  
  /* 文字 */
  --text-primary: #e8e8f0;
  --text-secondary: #6b6b8a;
  --text-highlight: #00f5d4;
  
  /* 发光效果 */
  --glow-cyan: 0 0 20px rgba(0, 245, 212, 0.6);
  --glow-pulse: 0 0 40px rgba(0, 245, 212, 0.3);
}
```

### 3.3 动画效果

| 动画 | 描述 | 实现方式 |
|------|------|----------|
| **扫描波纹** | 圆形从中心向外扩散 | CSS animation + SVG |
| **数据流入** | 文字/数据滑入效果 | Framer Motion |
| **呼吸边框** | 边框亮度周期性变化 | CSS keyframes |
| **粒子背景** | 星星/数据点漂浮 | Canvas 2D |
| **脉冲提示** | 重要信息闪烁 | Framer Motion |
| **全息闪烁** | 整个界面轻微闪烁 | CSS animation |

---

## 4. 核心系统架构

### 4.1 系统架构图

```
┌────────────────────────────────────────────────────────────────────────┐
│                              前端 (Next.js 16)                         │
├────────────────────────────────────────────────────────────────────────┤
│  UI 层 (React + Tailwind + Framer Motion)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐    │
│  │ Emergence │ │ Resource  │ │ Neural   │ │ Intervention        │    │
│  │ Core      │ │ Panel     │ │ Link     │ │ Panel               │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘    │
│                               │                                       │
│  ┌───────────────────────────┴───────────────────────────────────┐    │
│  │              动画层 (Framer Motion)                          │    │
│  │  ScanWave | DataFlow | ParticleBackground | PulseGlow      │    │
│  └─────────────────────────────────────────────────────────────┘    │
├────────────────────────────────────────────────────────────────────────┤
│                              状态层 (Zustand)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐    │
│  │ WorldStore│ │AgentStore │ │UIStore   │ │ MessageStore       │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘    │
├────────────────────────────────────────────────────────────────────────┤
│                              逻辑层 (TypeScript)                       │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐     │
│  │ WorldSimulator │ │ AgentBrain    │ │ CollaborationEngine  │     │
│  └────────────────┘ └────────────────┘ └────────────────────────┘     │
├────────────────────────────────────────────────────────────────────────┤
│                              AI 层 (Vercel AI SDK)                    │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐     │
│  │ LLMProvider   │ │ PromptEngine  │ │ ResponseParser        │     │
│  └────────────────┘ └────────────────┘ └────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2 核心模块

#### WorldSimulator (世界模拟器)

```typescript
interface WorldSimulator {
  initialize(): WorldState;
  tick(): WorldState;
  updateResources(locationId: string, delta: ResourceDelta): void;
  triggerEvent(event: WorldEvent): EventResult;
  calculateActionResult(agentId: string, action: AIAction): ActionResult;
}

interface WorldState {
  time: number;
  day: number;
  weather: Weather;
  resources: ResourceMap;
  locations: Location[];
  buildings: Building[];
  events: WorldEvent[];
}
```

#### AgentBrain (AI大脑)

```typescript
interface AgentBrain {
  perceive(worldState: WorldState, otherAgents: Agent[]): Perception;
  think(perception: Perception): Thought;
  decide(thought: Thought): Decision;
  execute(decision: Decision): Action;
}

interface Agent {
  id: string;
  name: string;
  role: 'builder' | 'explorer' | 'commander';
  personality: string;
  energy: number;
  status: 'idle' | 'working' | 'exploring' | 'resting';
}
```

#### CollaborationEngine (协作引擎)

```typescript
interface CollaborationEngine {
  initiateDiscussion(topic: string, agents: string[]): Discussion;
  addMessage(discussionId: string, message: ChatMessage): void;
  reachConsensus(discussionId: string): Consensus;
  vote(discussionId: string, agentId: string, option: string): void;
}
```

---

## 5. 数据结构

### 5.1 世界状态

```typescript
interface WorldState {
  id: string;
  day: number;
  time: number;
  weather: 'sunny' | 'rainy' | 'stormy';
  resources: {
    energy: number;
    wood: number;
    stone: number;
    food: number;
    water: number;
  };
  locations: Location[];
  buildings: Building[];
  events: WorldEvent[];
}

interface Location {
  id: string;
  name: string;
  type: 'forest' | 'rock' | 'water' | 'cave' | 'beach';
  position: { x: number; y: number };
  resources: ResourceMap;
  discovered: boolean;
  visitedBy: string[];
}
```

### 5.2 AI角色

```typescript
interface AIAgent {
  id: string;
  name: string;
  avatar: string;
  role: 'builder' | 'explorer' | 'commander';
  personality: string;
  energy: number;
  status: 'idle' | 'working' | 'exploring' | 'resting' | 'dead';
  skills: {
    building: number;
    exploring: number;
    combat: number;
  };
  relationships: Record<string, number>;
}

interface ChatMessage {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: number;
  type: 'statement' | 'question' | 'agreement' | 'disagreement' | 'command';
}
```

### 5.3 干预命令

```typescript
interface Intervention {
  id: string;
  type: 'mission' | 'suggest' | 'command' | 'vote' | 'adjust';
  content: string;
  timestamp: number;
  status: 'pending' | 'executing' | 'completed' | 'rejected';
  response?: string;
}
```

---

## 6. 文件结构

```
emergence/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 主页面
│   │   ├── layout.tsx                  # 布局
│   │   ├── globals.css                 # 全局样式
│   │   └── api/
│   │       └── agent/
│   │           └── think/route.ts     # AI思考API
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── ScanFrame.tsx          # 扫描边框
│   │   │   ├── GlowingBorder.tsx      # 发光边框
│   │   │   ├── DataStream.tsx        # 数据流
│   │   │   ├── StatusBar.tsx         # 状态条
│   │   │   ├── PulseText.tsx         # 脉冲文字
│   │   │   └── ParticleField.tsx     # 粒子背景
│   │   │
│   │   ├── emergent/
│   │   │   ├── EmergenceCore.tsx     # 中央核心
│   │   │   ├── NeuralNetwork.tsx     # 神经连接
│   │   │   └── ScanWave.tsx          # 扫描波纹
│   │   │
│   │   ├── panels/
│   │   │   ├── ClusterStatus.tsx      # 集群状态
│   │   │   ├── NeuralLink.tsx        # 神经链接
│   │   │   ├── Intervention.tsx      # 干预面板
│   │   │   └── ExecutionQueue.tsx    # 执行队列
│   │   │
│   │   └── agent/
│   │       ├── AgentCard.tsx          # AI卡片
│   │       └── AgentAvatar.tsx       # AI头像
│   │
│   ├── lib/
│   │   ├── core/
│   │   │   ├── WorldSimulator.ts     # 世界模拟器
│   │   │   ├── AgentBrain.ts         # AI大脑
│   │   │   └── CollaborationEngine.ts # 协作引擎
│   │   │
│   │   ├── ai/
│   │   │   ├── providers/
│   │   │   │   └── index.ts          # AI提供商
│   │   │   └── prompts/
│   │   │       └── system.ts         # 系统提示词
│   │   │
│   │   └── utils/
│   │       └── constants.ts           # 常量
│   │
│   ├── stores/
│   │   ├── worldStore.ts             # 世界状态
│   │   ├── agentStore.ts             # AI状态
│   │   ├── messageStore.ts           # 消息
│   │   └── uiStore.ts                # UI状态
│   │
│   └── types/
│       ├── world.ts                   # 世界类型
│       ├── agent.ts                   # AI类型
│       └── action.ts                  # 行动类型
│
├── public/
│   └── fonts/                        # 字体
│
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## 7. 开发准则

### 7.1 开发环境

**包管理器**: 使用 `bun`

**安装依赖**:
```bash
bun install
```

**运行开发服务器**:
```bash
bun run dev
```

**访问测试**:
```
http://localhost:3000
```

### 7.2 测试命令

```bash
# 启动开发服务器
bun run dev

# 编译检查
bun run build

# 类型检查
bun tsc --noEmit
```

### 7.3 开发阶段

**每一阶段完成后必须测试UI是否符合要求**

| 阶段 | 任务 | 验收标准 |
|------|------|----------|
| **Phase 1** | 项目初始化 + 基础样式 + 粒子背景 | 页面加载无错误，背景动画流畅 |
| **Phase 2** | 扫描边框 + 面板基础样式 | 边框动画正确，面板布局正确 |
| **Phase 3** | Emergence Core + 扫描波纹 | 核心动画震撼，波纹效果流畅 |
| **Phase 4** | 资源面板 + 状态条 | 数据展示正确，进度条动画 |
| **Phase 5** | 神经链接 + AI对话 | 对话动画流畅，连接线动画 |
| **Phase 6** | 干预面板 + 执行队列 | 干预功能正常，队列动画 |
| **Phase 7** | AI模拟逻辑 + 完整流程 | 演示流程完整 |
| **Phase 8** | Bug修复 + UI微调 | 整体效果完美 |

### 7.4 日志记录

每个任务完成后记录到 logging.json：
```json
{
  "taskId": "1.1",
  "timestamp": "2024-01-01T10:00:00Z",
  "type": "start|complete|error|decision",
  "title": "任务标题",
  "description": "详细描述",
  "approach": "采取的方法/策略",
  "errors": ["错误1"],
  "solutions": ["解决方案1"]
}
```

---

## 8. 演示流程 (5分钟)

```
⏱️ 00:00 - 开场 (15秒)
    炫酷扫描动画 + 标题出现
    "EMERGENCE - AI 文明的涌现"
    
⏱️ 00:15 - 介绍 (30秒)
    扫描显示3个AI角色
    每个AI头像+性格介绍
    
⏱️ 00:45 - 场景1 (60秒)
    人类发布任务："我们需要建造庇护所"
    扫描波纹显示
    看AI讨论过程
    
⏱️ 01:45 - 场景2 (60秒)
    资源告急
    红色警告扫描
    看AI如何分配
    
⏱️ 02:45 - 场景3 (60秒)
    人类干预
    看AI响应
    
⏱️ 03:45 - 场景4 (45秒)
    突发事件
    扫描显示警告
    
⏱️ 04:30 - 总结 (30秒)
    "这就是未来AI协作 - EMERGENCE"
```

---

## 9. 注意事项

### 9.1 UI要求

- 震撼级别视觉效果
- No Man's Sky 扫描界面风格
- 粒子背景 + 扫描波纹
- 呼吸发光边框
- 数据流动画

### 9.2 性能考虑

- 使用 Framer Motion 实现流畅动画
- 粒子系统使用 Canvas 优化
- 状态更新使用 Zustand

### 9.3 稳定性

- AI 调用使用流式响应
- 异常处理保证不崩溃
- 超时自动下一步

---

## 10. AI Provider 配置

项目使用 Vercel AI SDK，支持多家提供商：

| 提供商 | API Key 环境变量 |
|--------|-----------------|
| iFlow | `IFLOW_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Kimi | `KIMI_API_KEY` |
| Zhipu | `ZHIPU_API_KEY` |
| SiliconFlow | `SILICONFLOW_API_KEY` |

---

## 11. 开发计划

### Day 1: 视觉基础
- [ ] 项目初始化 + Tailwind配置
- [ ] 配色 + 字体设置
- [ ] 粒子背景
- [ ] 扫描边框
- [ ] 基础面板布局

### Day 2: 核心功能
- [ ] Emergence Core
- [ ] Neural Network
- [ ] AI对话系统
- [ ] 干预系统

### Day 3: 完善 + 演示
- [ ] 动画细节
- [ ] 完整流程
- [ ] Bug修复
- [ ] 演示

---

## 12. 项目启动

```bash
# 1. 安装依赖
bun install

# 2. 复制环境变量
cp .dev.vars.example .dev.vars

# 3. 配置API Key
# 编辑 .dev.vars 添加你的 API Key

# 4. 启动开发服务器
bun run dev

# 5. 访问 http://localhost:3000
```
