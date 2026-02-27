'use client'

import { create } from 'zustand'
import { getAIResponse, getAIThoughts, streamDebateCase, streamNextPlan, streamStrategyPlan } from '@/lib/ai/agent'

function getDefaultMessage(index: number): string {
  const defaults = [
    '正在检查空间站结构',
    '发现新的资源舱室',
    '正在分析系统状态'
  ]
  return defaults[index]
}

function extractTask(content: string): string {
  const tasks = [
    '检查空间站结构',
    '探索新区域',
    '分析系统状态'
  ]
  const keywords = ['建造', '修复', '检查', '维护']
  for (const kw of keywords) {
    if (content.includes(kw)) return content.substring(0, 15)
  }
  return tasks[Math.floor(Math.random() * tasks.length)]
}


export interface Agent {
  id: string
  name: string
  role: 'builder' | 'explorer' | 'commander'
  status: 'idle' | 'working' | 'exploring' | 'resting'
  energy: number
  task: string
  progress: number
}

export interface Intervention {
  id: string
  content: string
  timestamp: string
  status: 'pending' | 'executing' | 'completed'
  response?: string
}

export interface NeuralMessage {
  id: string
  speaker: string
  content: string
  timestamp: string
  status: 'sending' | 'receiving' | 'received'
}

type Stance = 'support' | 'oppose' | 'caution'

export interface DebatePoint {
  agentId: string
  agentName: string
  stance: Stance
  summary: string
  confidence: number
}

export interface VoteResult {
  yes: string[]
  no: string[]
  abstain: string[]
  decision: 'approved' | 'rejected'
  note: string
}

export interface TaskItem {
  id: string
  title: string
  ownerId: string
  ownerName: string
  status: 'queued' | 'running' | 'done'
  progress: number
}

export interface StrategyGoal {
  title: string
  horizon: string
  successMetric: string
  progress: number
  status: 'active' | 'completed'
  updatedAt: string
}

export interface PlanStep {
  id: string
  title: string
  ownerId: string
  ownerName: string
  status: 'pending' | 'active' | 'done'
  progress: number
  note: string
}

export interface PlannerAction {
  id: string
  title: string
  ownerId: string
  ownerName: string
  priority: number
  tool: {
    name: 'fetchResource' | 'buildModule' | 'surveyArea' | 'optimizeEnergy' | 'treatInjuries'
    params: Record<string, string | number>
  }
  fallbackTool?: {
    name: 'fetchResource' | 'buildModule' | 'surveyArea' | 'optimizeEnergy' | 'treatInjuries'
    params: Record<string, string | number>
  }
  compensation?: {
    name: 'optimizeEnergy' | 'treatInjuries' | 'surveyArea'
    params: Record<string, string | number>
  }
  predictedImpact: Partial<WorldState['resources']>
  rationale: string
  outcome?: string
  status: 'queued' | 'running' | 'done' | 'failed'
  progress: number
}

export interface DecisionEvent {
  id: string
  time: string
  task: 'debate' | 'planner' | 'strategy' | 'execute'
  source: 'model' | 'fallback' | 'cache' | 'dedupe'
  model?: string
  latencyMs?: number | null
  note: string
}

export interface CollaborationCase {
  id: string
  title: string
  trigger: string
  createdAt: string
  status: 'debate' | 'vote' | 'execution' | 'resolved'
  debate: DebatePoint[]
  vote?: VoteResult
  voteReasons?: {
    yes: string[]
    no: string[]
    abstain: string[]
  }
  tasks: TaskItem[]
  outcome?: string
  impact?: Partial<WorldState['resources']>
  heat: number
}

interface WorldState {
  day: number
  time: string
  worldView: string
  resources: {
    energy: number
    wood: number
    stone: number
    food: number
    water: number
  }
  threatLevel: 'low' | 'medium' | 'high'
  llmStatus: 'idle' | 'thinking' | 'ready' | 'error'
  llmError?: string
  
  agents: Agent[]
  messages: NeuralMessage[]
  interventions: Intervention[]
  cases: CollaborationCase[]
  goal: StrategyGoal | null
  plan: PlanStep[]
  plannerStatus: 'idle' | 'planning' | 'ready' | 'error'
  plannerError?: string
  plannerSummary?: string
  plannerActions: PlannerAction[]
  decisionEvents: DecisionEvent[]
  plannerImpact?: Partial<WorldState['resources']>
  plannerFeedback: string[]
  executorStatus: 'idle' | 'running' | 'error'
  executorError?: string
  isPaused: boolean
  lastPlanAt: number
  nextPlanAt: number
  plannerBackoffMs: number
  consecutiveFailures: number
  coolingDownUntil: number
  lastRequestAt: number
  plannerRequestInFlight: boolean
  agentMode: 'model' | 'degraded'
  lastDebateSource?: 'model' | 'fallback' | 'cache' | 'dedupe'
  lastDebateModel?: string
  lastPlannerSource?: 'model' | 'fallback' | 'cache' | 'dedupe'
  lastPlannerModel?: string
  lastStrategySource?: 'model' | 'fallback' | 'cache' | 'dedupe'
  lastStrategyModel?: string
  modelStats: {
    debate: { total: number; model: number; fallback: number; avgLatencyMs: number; lastLatencyMs: number }
    planner: { total: number; model: number; fallback: number; avgLatencyMs: number; lastLatencyMs: number }
    strategy: { total: number; model: number; fallback: number; avgLatencyMs: number; lastLatencyMs: number }
  }
  
  setWorldView: (world: string) => void
  addAIMessage: (speaker: string, userInput?: string) => Promise<void>
  addMessage: (message: Omit<NeuralMessage, 'id' | 'timestamp' | 'status'>) => void
  updateMessageStatus: (id: string, status: NeuralMessage['status']) => void
  addIntervention: (content: string) => Promise<void>
  updateInterventionStatus: (id: string, status: Intervention['status'], response?: string) => void
  addCase: (collabCase: CollaborationCase) => void
  updateCase: (id: string, updates: Partial<CollaborationCase>) => void
  updateAgentStatus: (agentId: string, updates: Partial<Agent>) => void
  updateResource: (resource: keyof WorldState['resources'], delta: number) => void
  requestPlannerTick: () => Promise<void>
  executePlannerAction: () => Promise<void>
  advanceExecution: () => void
  togglePause: () => void
  tick: () => void
}

function getCaseTemplates(worldView: string) {
  const worldHint = worldView ? `(${worldView})` : ''
  return [
    {
      title: `资源优先级争议 ${worldHint}`.trim(),
      trigger: '资源消耗超出预期，需要决定优先保障哪一项',
      debate: [
        { agentId: 'alex', agentName: 'ALEX', stance: 'support' as const, summary: '优先防护和储备，否则基础设施会崩。', confidence: 0.72 },
        { agentId: 'nova', agentName: 'NOVA', stance: 'oppose' as const, summary: '必须扩展探索，否则会被动消耗。', confidence: 0.66 },
        { agentId: 'zeta', agentName: 'ZETA', stance: 'caution' as const, summary: '分阶段执行，先稳住消耗曲线。', confidence: 0.81 },
      ],
      tasks: [
        { id: 't1', title: '建立资源缓冲与配给方案', ownerId: 'zeta', ownerName: 'ZETA' },
        { id: 't2', title: '加固关键设施', ownerId: 'alex', ownerName: 'ALEX' },
        { id: 't3', title: '快速侦测周边高价值点', ownerId: 'nova', ownerName: 'NOVA' },
      ],
      impact: { energy: 6, food: 4, wood: -6 },
      outcome: '执行双轨策略，短期稳定消耗并开始补给扩展。',
    },
    {
      title: `危险处置路径 ${worldHint}`.trim(),
      trigger: '发现潜在威胁，需要决定立即处理还是延后观察',
      debate: [
        { agentId: 'alex', agentName: 'ALEX', stance: 'caution' as const, summary: '先构建防线，避免直接冲突。', confidence: 0.7 },
        { agentId: 'nova', agentName: 'NOVA', stance: 'support' as const, summary: '趁早侦察与标记，否则会失控。', confidence: 0.77 },
        { agentId: 'zeta', agentName: 'ZETA', stance: 'support' as const, summary: '先收集情报，保持机动性。', confidence: 0.82 },
      ],
      tasks: [
        { id: 't1', title: '建立临时防御节点', ownerId: 'alex', ownerName: 'ALEX' },
        { id: 't2', title: '侦察威胁源与路径', ownerId: 'nova', ownerName: 'NOVA' },
        { id: 't3', title: '制定应急处置预案', ownerId: 'zeta', ownerName: 'ZETA' },
      ],
      impact: { energy: -4, water: -3, wood: -2 },
      outcome: '形成预警机制并标记威胁路线。',
    },
    {
      title: `协作效率争论 ${worldHint}`.trim(),
      trigger: '协作效率降低，需决定是否调整分工与节奏',
      debate: [
        { agentId: 'alex', agentName: 'ALEX', stance: 'oppose' as const, summary: '频繁调整会打断建造效率。', confidence: 0.64 },
        { agentId: 'nova', agentName: 'NOVA', stance: 'support' as const, summary: '短期混乱换来长期效率。', confidence: 0.73 },
        { agentId: 'zeta', agentName: 'ZETA', stance: 'support' as const, summary: '需要明确责任边界与节奏。', confidence: 0.86 },
      ],
      tasks: [
        { id: 't1', title: '重排职责与协作节点', ownerId: 'zeta', ownerName: 'ZETA' },
        { id: 't2', title: '建造关键瓶颈模块', ownerId: 'alex', ownerName: 'ALEX' },
        { id: 't3', title: '探索新的补给路径', ownerId: 'nova', ownerName: 'NOVA' },
      ],
      impact: { energy: 3, wood: -4, stone: -3 },
      outcome: '建立稳定分工模板，降低协作摩擦。',
    },
  ]
}

function buildVote(debate: DebatePoint[]): VoteResult {
  const yes = debate.filter(p => p.stance === 'support').map(p => p.agentName)
  const no = debate.filter(p => p.stance === 'oppose').map(p => p.agentName)
  const abstain = debate.filter(p => p.stance === 'caution').map(p => p.agentName)
  const decision = yes.length >= no.length ? 'approved' : 'rejected'
  return {
    yes,
    no,
    abstain,
    decision,
    note: decision === 'approved' ? '共识形成，进入执行阶段' : '争议过大，暂缓执行',
  }
}

function buildStrategy(worldView: string): { goal: StrategyGoal; plan: PlanStep[] } {
  const horizon = '3 DAY CYCLE'
  const baseGoal = worldView ? `在「${worldView}」建立可持续协作秩序` : '建立可持续协作秩序'
  const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return {
    goal: {
      title: baseGoal,
      horizon,
      successMetric: '资源稳定 + 风险可控 + 执行链连续',
      progress: 28,
      status: 'active',
      updatedAt: now,
    },
    plan: [
      {
        id: `plan-${Date.now()}-1`,
        title: '稳定关键资源与补给路线',
        ownerId: 'nova',
        ownerName: 'NOVA',
        status: 'active',
        progress: 30,
        note: '优先锁定高价值节点',
      },
      {
        id: `plan-${Date.now()}-2`,
        title: '构建防护与基础设施',
        ownerId: 'alex',
        ownerName: 'ALEX',
        status: 'pending',
        progress: 10,
        note: '等待资源缓冲',
      },
      {
        id: `plan-${Date.now()}-3`,
        title: '建立协作节奏与应急预案',
        ownerId: 'zeta',
        ownerName: 'ZETA',
        status: 'pending',
        progress: 6,
        note: '准备进入统筹阶段',
      },
    ],
  }
}

function normalizeStrategySeed(seed: { goal: { title: string; horizon: string; successMetric: string }; plan: Array<{ owner: string; title: string; note: string }> }): { goal: StrategyGoal; plan: PlanStep[] } {
  const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return {
    goal: {
      title: seed.goal.title,
      horizon: seed.goal.horizon,
      successMetric: seed.goal.successMetric,
      progress: 22,
      status: 'active',
      updatedAt: now,
    },
    plan: seed.plan.map((step, index) => ({
      id: `plan-${Date.now()}-${index}`,
      title: step.title,
      ownerId: mapAgentId(step.owner),
      ownerName: step.owner.toUpperCase(),
      status: index === 0 ? 'active' : 'pending',
      progress: index === 0 ? 24 : 8,
      note: step.note,
    })),
  }
}

type ModelTaskKey = 'debate' | 'planner' | 'strategy'
type ModelSource = 'model' | 'fallback' | 'cache' | 'dedupe'

function nextModelStats(
  current: WorldState['modelStats'],
  task: ModelTaskKey,
  source: ModelSource,
  elapsedMs?: number | null
): WorldState['modelStats'] {
  const prev = current[task]
  const total = prev.total + 1
  const model = prev.model + (source === 'model' ? 1 : 0)
  const fallback = prev.fallback + (source === 'model' ? 0 : 1)
  const latency = typeof elapsedMs === 'number' ? elapsedMs : prev.lastLatencyMs
  const avgLatencyMs = prev.total === 0
    ? latency
    : Math.round((prev.avgLatencyMs * prev.total + latency) / total)

  return {
    ...current,
    [task]: {
      total,
      model,
      fallback,
      avgLatencyMs,
      lastLatencyMs: latency,
    },
  }
}

function clampResource(value: number) {
  return Math.max(0, Math.min(100, value))
}

function shiftThreat(level: WorldState['threatLevel'], shift: 'up' | 'down' | 'stable'): WorldState['threatLevel'] {
  if (shift === 'stable') return level
  if (shift === 'up') {
    return level === 'low' ? 'medium' : 'high'
  }
  return level === 'high' ? 'medium' : 'low'
}

function deriveThreat(resources: WorldState['resources']): WorldState['threatLevel'] {
  const average = (resources.energy + resources.food + resources.water + resources.wood + resources.stone) / 5
  if (average < 35) return 'high'
  if (average < 55) return 'medium'
  return 'low'
}

function normalizeTasks(tasks: Array<{ id: string; title: string; ownerId: string; ownerName: string }>): TaskItem[] {
  return tasks.map((t, index) => ({
    ...t,
    id: `${t.ownerId}-${Date.now()}-${index}`,
    status: 'queued' as const,
    progress: Math.floor(Math.random() * 20),
  }))
}

function mapAgentId(name: string) {
  const upper = name.toUpperCase()
  if (upper === 'ALEX') return 'alex'
  if (upper === 'NOVA') return 'nova'
  if (upper === 'ZETA') return 'zeta'
  return 'alex'
}

function normalizeSeed(seed: {
  title: string
  trigger: string
  debate: Array<{ agent: string; stance: Stance; summary: string; confidence: number }>
  voteReasons?: { yes: string[]; no: string[]; abstain: string[] }
  tasks: Array<{ owner: string; title: string }>
  outcome: string
  impact?: CollaborationCase['impact']
}): Omit<CollaborationCase, 'id' | 'createdAt' | 'status' | 'heat'> {
  const voteReasons = seed.voteReasons || { yes: [], no: [], abstain: [] }
  return {
    title: seed.title,
    trigger: seed.trigger,
    debate: seed.debate.map((point) => ({
      agentId: mapAgentId(point.agent),
      agentName: point.agent.toUpperCase(),
      stance: point.stance,
      summary: point.summary,
      confidence: Math.max(0.4, Math.min(0.95, point.confidence || 0.7)),
    })),
    voteReasons,
    tasks: normalizeTasks(
      seed.tasks.map((task, index) => ({
        id: `seed-${index}`,
        title: task.title,
        ownerId: mapAgentId(task.owner),
        ownerName: task.owner.toUpperCase(),
      }))
    ),
    outcome: seed.outcome,
    impact: seed.impact,
  }
}

function createCaseFromInput(worldView: string, input?: string): CollaborationCase {
  const templates = getCaseTemplates(worldView)
  const base = templates[Math.floor(Math.random() * templates.length)]
  const trigger = input ? `用户介入: ${input}` : base.trigger
  const title = input ? `协作争议: ${input.substring(0, 12)}` : base.title
  const createdAt = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  const tasks = normalizeTasks(base.tasks)
  return {
    id: Date.now().toString(),
    title,
    trigger,
    createdAt,
    status: 'debate',
    debate: base.debate,
    tasks,
    outcome: base.outcome,
    impact: base.impact,
    heat: Math.floor(Math.random() * 30) + 60,
  }
}

function createDecisionEvent(
  task: DecisionEvent['task'],
  source: DecisionEvent['source'],
  note: string,
  model?: string,
  latencyMs?: number | null
): DecisionEvent {
  return {
    id: `decision-${Date.now()}-${task}`,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    task,
    source,
    model,
    latencyMs,
    note,
  }
}

export const useWorldStore = create<WorldState>((set, get) => {
  const scheduleCaseFlow = (caseId: string) => {
    const voteDelay = 400
    const execDelay = 800

    setTimeout(() => {
      const target = get().cases.find(c => c.id === caseId)
      if (!target || target.status !== 'debate') return
      get().updateCase(caseId, {
        status: 'vote',
        vote: buildVote(target.debate),
      })
    }, voteDelay)

    setTimeout(() => {
      const target = get().cases.find(c => c.id === caseId)
      if (!target || (target.status !== 'vote' && target.status !== 'debate')) return
      get().updateCase(caseId, {
        status: 'execution',
        tasks: target.tasks.map((task) => ({
          ...task,
          status: 'queued',
          progress: Math.max(5, task.progress),
        })),
      })
    }, execDelay)
  }

  return ({
  day: 3,
  time: '03:14:32',
  worldView: '',
  resources: {
    energy: 72,
    wood: 45,
    stone: 30,
    food: 85,
    water: 70,
  },
  threatLevel: 'low',
  llmStatus: 'idle',
  llmError: undefined,
  
  agents: [
    { id: 'alex', name: 'ALEX', role: 'builder', status: 'working', energy: 80, task: '建造庇护所', progress: 60 },
    { id: 'nova', name: 'NOVA', role: 'explorer', status: 'exploring', energy: 65, task: '前往森林采集', progress: 80 },
    { id: 'zeta', name: 'ZETA', role: 'commander', status: 'idle', energy: 90, task: '规划明日任务', progress: 20 },
  ],
  
  messages: [
    { id: '1', speaker: 'ALEX', content: '资源充足，庇护所建造进度 60%', timestamp: '13:42', status: 'received' },
    { id: '2', speaker: 'NOVA', content: '发现新材料区域，准备出发', timestamp: '13:43', status: 'received' },
    { id: '3', speaker: 'ZETA', content: '建议优先提升仓储容量', timestamp: '13:44', status: 'received' },
  ],
  
  interventions: [],
  cases: [],
  goal: null,
  plan: [],
  plannerStatus: 'idle',
  plannerError: undefined,
  plannerSummary: undefined,
  plannerActions: [],
  decisionEvents: [],
  plannerImpact: undefined,
  plannerFeedback: [],
  executorStatus: 'idle',
  executorError: undefined,
  isPaused: false,
  lastPlanAt: 0,
  nextPlanAt: 0,
  plannerBackoffMs: 0,
  consecutiveFailures: 0,
  coolingDownUntil: 0,
  lastRequestAt: 0,
  plannerRequestInFlight: false,
  agentMode: 'model',
  lastDebateSource: undefined,
  lastDebateModel: undefined,
  lastPlannerSource: undefined,
  lastPlannerModel: undefined,
  lastStrategySource: undefined,
  lastStrategyModel: undefined,
  modelStats: {
    debate: { total: 0, model: 0, fallback: 0, avgLatencyMs: 0, lastLatencyMs: 0 },
    planner: { total: 0, model: 0, fallback: 0, avgLatencyMs: 0, lastLatencyMs: 0 },
    strategy: { total: 0, model: 0, fallback: 0, avgLatencyMs: 0, lastLatencyMs: 0 },
  },

  setWorldView: async (world) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    const initialMessages: NeuralMessage[] = [
      { id: '1', speaker: 'ALEX', content: getDefaultMessage(0), timestamp: time, status: 'received' },
      { id: '2', speaker: 'NOVA', content: getDefaultMessage(1), timestamp: time, status: 'received' },
      { id: '3', speaker: 'ZETA', content: getDefaultMessage(2), timestamp: time, status: 'received' },
    ]
    const roles: Array<'builder' | 'explorer' | 'commander'> = ['builder', 'explorer', 'commander']
    const statuses: Array<'idle' | 'working' | 'exploring' | 'resting'> = ['working', 'exploring', 'idle']
    const initialTasks: Agent[] = initialMessages.map((msg, i) => ({
      id: ['alex', 'nova', 'zeta'][i],
      name: msg.speaker,
      role: roles[i],
      task: extractTask(msg.content),
      progress: Math.floor(Math.random() * 60) + 20,
      status: statuses[i],
      energy: 80,
    }))
    const initialCase = createCaseFromInput(world)
    const localStrategy = buildStrategy(world)

    set({
      worldView: world,
      messages: initialMessages,
      agents: initialTasks,
      cases: [initialCase],
      goal: localStrategy.goal,
      plan: localStrategy.plan,
      llmStatus: 'thinking',
      llmError: undefined,
      plannerStatus: 'idle',
      plannerError: undefined,
      plannerSummary: undefined,
      plannerActions: [],
      decisionEvents: [],
      plannerImpact: undefined,
      plannerFeedback: [],
      executorStatus: 'idle',
      executorError: undefined,
      isPaused: false,
      lastPlanAt: 0,
      nextPlanAt: 0,
      plannerBackoffMs: 0,
      consecutiveFailures: 0,
      coolingDownUntil: 0,
      lastRequestAt: 0,
      plannerRequestInFlight: false,
      agentMode: 'model',
      lastDebateSource: undefined,
      lastDebateModel: undefined,
      lastPlannerSource: undefined,
      lastPlannerModel: undefined,
      lastStrategySource: undefined,
      lastStrategyModel: undefined,
      modelStats: {
        debate: { total: 0, model: 0, fallback: 0, avgLatencyMs: 0, lastLatencyMs: 0 },
        planner: { total: 0, model: 0, fallback: 0, avgLatencyMs: 0, lastLatencyMs: 0 },
        strategy: { total: 0, model: 0, fallback: 0, avgLatencyMs: 0, lastLatencyMs: 0 },
      },
    })

    try {
      void streamStrategyPlan(world, (partial) => {
        if (!partial.goal && (!partial.plan || partial.plan.length === 0)) return
        const current = get()
        const currentGoal = current.goal || localStrategy.goal
        const nextGoal = partial.goal
          ? {
              ...currentGoal,
              title: partial.goal.title || currentGoal.title,
              horizon: partial.goal.horizon || currentGoal.horizon,
              successMetric: partial.goal.successMetric || currentGoal.successMetric,
              updatedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            }
          : current.goal
        const nextPlan = partial.plan && partial.plan.length > 0
          ? partial.plan.map((step, index) => ({
              id: `plan-stream-${Date.now()}-${index}`,
              title: step.title || current.plan[index]?.title || `步骤 ${index + 1}`,
              ownerId: mapAgentId(step.owner || current.plan[index]?.ownerName || 'ALEX'),
              ownerName: (step.owner || current.plan[index]?.ownerName || 'ALEX').toUpperCase(),
              status: (index === 0 ? 'active' : 'pending') as PlanStep['status'],
              progress: index === 0 ? 18 : 6,
              note: step.note || current.plan[index]?.note || '流式生成中',
            }))
          : current.plan
        set({
          goal: nextGoal || current.goal || localStrategy.goal,
          plan: nextPlan,
        })
      }).then((strategyResult) => {
        const normalizedStrategy = normalizeStrategySeed(strategyResult.object)
        set((state) => ({
          goal: normalizedStrategy.goal,
          plan: normalizedStrategy.plan,
          lastStrategySource: strategyResult.source,
          lastStrategyModel: strategyResult.model,
          modelStats: nextModelStats(state.modelStats, 'strategy', strategyResult.source, strategyResult.elapsedMs),
          decisionEvents: [
            createDecisionEvent('strategy', strategyResult.source, `初始化策略生成 (${strategyResult.source})`, strategyResult.model, strategyResult.elapsedMs),
            ...state.decisionEvents,
          ].slice(0, 16),
        }))
      }).catch(() => {
        // strategy 初始化失败时保持本地 strategy 占位，不阻塞争论主流程
      })

      const debateResult = await streamDebateCase(world, '系统初始化：生成首个协作争论', (partial) => {
        get().updateCase(initialCase.id, {
          title: partial.title,
          trigger: partial.trigger,
        })
      })

      const normalizedCase = normalizeSeed(debateResult.object)
      set((state) => ({
        cases: state.cases.map((c) =>
          c.id === initialCase.id
            ? {
                ...c,
                title: normalizedCase.title,
                trigger: normalizedCase.trigger,
                debate: normalizedCase.debate,
                tasks: normalizedCase.tasks,
                outcome: normalizedCase.outcome,
                impact: normalizedCase.impact,
                voteReasons: normalizedCase.voteReasons,
                heat: Math.floor(Math.random() * 20) + 70,
              }
            : c
        ),
        lastDebateSource: debateResult.source,
        lastDebateModel: debateResult.model,
        modelStats: nextModelStats(state.modelStats, 'debate', debateResult.source, debateResult.elapsedMs),
        decisionEvents: [
          createDecisionEvent('debate', debateResult.source, `初始化争论生成 (${debateResult.source})`, debateResult.model, debateResult.elapsedMs),
          ...state.decisionEvents,
        ].slice(0, 16),
      }))

      const criticalReady = debateResult.source === 'model'
      // 即使降级也推进可视化阶段，避免界面长期停在 debate
      scheduleCaseFlow(initialCase.id)
      set({
        llmStatus: 'ready',
        llmError: criticalReady ? undefined : `初始化降级: debate=${debateResult.source}`,
        agentMode: criticalReady ? 'model' : 'degraded',
      })
    } catch (error) {
      set({
        llmStatus: 'error',
        llmError: error instanceof Error ? error.message : '初始化失败',
        agentMode: 'degraded',
      })
    }
  },

  addAIMessage: async (speaker: string, userInput?: string) => {
    const state = get()
    const agent = state.agents.find(a => a.name === speaker)
    
    let content: string
    if (userInput) {
      const response = await getAIResponse(
        speaker,
        userInput,
        state.worldView,
        agent?.status || 'idle'
      )
      content = response.content
    } else {
      const otherAgents = state.agents
        .filter(a => a.name !== speaker)
        .map(a => a.name)
      content = await getAIThoughts(speaker, state.worldView, otherAgents)
    }

    const id = Date.now().toString()
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    
    set((state) => ({
      messages: [
        ...state.messages,
        { id, speaker, content, timestamp: time, status: 'sending' as const }
      ]
    }))
    
    setTimeout(() => {
      get().updateMessageStatus(id, 'receiving')
    }, 2000)
    
    setTimeout(() => {
      get().updateMessageStatus(id, 'received')
    }, 3500)
  },

  addMessage: (message) => {
    const id = Date.now().toString()
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id, timestamp: time, status: 'sending' as const }
      ]
    }))
    
    setTimeout(() => {
      get().updateMessageStatus(id, 'receiving')
    }, 2000)
    
    setTimeout(() => {
      get().updateMessageStatus(id, 'received')
    }, 3500)
  },
  
  updateMessageStatus: (id, status) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, status } : m
      )
    }))
  },
  
  addIntervention: async (content) => {
    const id = Date.now().toString()
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    
    set((state) => ({
      interventions: [
        { id, content, timestamp: time, status: 'executing' },
        ...state.interventions
      ]
    }))
    
    const placeholderCase = createCaseFromInput(get().worldView, content)
    get().addCase(placeholderCase)

    set({ llmStatus: 'thinking', llmError: undefined })
    const result = await streamDebateCase(get().worldView, content, (partial) => {
      get().updateCase(placeholderCase.id, {
        title: partial.title,
        trigger: partial.trigger,
      })
    })
    const llmCase = normalizeSeed(result.object)
    if (llmCase) {
      get().updateCase(placeholderCase.id, {
        title: llmCase.title,
        trigger: llmCase.trigger,
        debate: llmCase.debate,
        tasks: llmCase.tasks,
        outcome: llmCase.outcome,
        impact: llmCase.impact,
        heat: Math.floor(Math.random() * 20) + 70,
        voteReasons: llmCase.voteReasons,
      })
      set({
        llmStatus: 'ready',
        llmError: result.source === 'model' ? undefined : `degraded: ${result.source}`,
        lastDebateSource: result.source,
        lastDebateModel: result.model,
        agentMode: result.source === 'model' ? 'model' : get().agentMode,
        modelStats: nextModelStats(get().modelStats, 'debate', result.source, result.elapsedMs),
        decisionEvents: [
          createDecisionEvent('debate', result.source, `干预争论生成 (${result.source})`, result.model, result.elapsedMs),
          ...get().decisionEvents,
        ].slice(0, 16),
      })
    } else {
      set({ llmStatus: 'error', llmError: '争论生成失败' })
    }
    scheduleCaseFlow(placeholderCase.id)
  },
  
  updateInterventionStatus: (id, status, response) => {
    set((state) => ({
      interventions: state.interventions.map((i) =>
        i.id === id ? { ...i, status, response } : i
      )
    }))
  },

  addCase: (collabCase) => {
    set((state) => ({
      cases: [collabCase, ...state.cases].slice(0, 6)
    }))
  },

  updateCase: (id, updates) => {
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      )
    }))
  },
  
  updateAgentStatus: (agentId, updates) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, ...updates } : a
      )
    }))
  },
  
  updateResource: (resource, delta) => {
    set((state) => ({
      resources: {
        ...state.resources,
        [resource]: Math.max(0, Math.min(100, state.resources[resource] + delta))
      }
    }))
  },

  requestPlannerTick: async () => {
    const state = get()
    if (!state.worldView) return
    if (state.llmStatus !== 'ready') return
    if (state.isPaused) return
    if (state.plannerStatus === 'planning') return
    if (state.plannerRequestInFlight) return
    
    const now = Date.now()
    
    if (state.coolingDownUntil && now < state.coolingDownUntil) {
      return
    }
    
    if (state.lastRequestAt && now - state.lastRequestAt < 6000) {
      return
    }
    
    const hasStalePlan = state.lastPlanAt && now - state.lastPlanAt > 15000
    const hasPendingActions = state.plannerActions.some((action) => action.status !== 'done' && action.status !== 'failed')
    if (state.nextPlanAt && now < state.nextPlanAt && !hasStalePlan) return
    if (hasPendingActions && !hasStalePlan) return
    if (!hasPendingActions && state.plannerActions.length > 0 && state.lastPlanAt && now - state.lastPlanAt < 5000) {
      return
    }
    if (state.plannerActions.length > 0 && (hasStalePlan || !hasPendingActions)) {
      set({
        plannerActions: [],
        plannerError: hasStalePlan ? '规划已过期，触发重规划' : undefined,
      })
    }
    set({
      plannerRequestInFlight: true,
        plannerStatus: 'planning',
        plannerError: undefined,
        plannerSummary: undefined,
        lastRequestAt: now,
      })

    try {
      const feedback = state.plannerFeedback.slice(-3).join(' / ')
      const result = await streamNextPlan(
        state.worldView,
        state.resources,
        state.threatLevel,
        feedback,
        (partial) => {
          const current = get()
          if (partial.summary && partial.summary !== current.plannerSummary) {
            set({ plannerSummary: partial.summary })
          }
          if (!partial.actions || partial.actions.length === 0) return
          const previewActions: PlannerAction[] = partial.actions.map((action, index) => ({
            id: `plan-preview-${Date.now()}-${index}`,
            title: action.title || `动作-${index + 1}`,
            ownerId: mapAgentId(action.owner || 'ALEX'),
            ownerName: (action.owner || 'ALEX').toUpperCase(),
            priority: Math.max(1, Math.min(3, action.priority || index + 1)),
            tool: action.tool || { name: 'surveyArea', params: { focus: 'resource' } },
            fallbackTool: action.fallbackTool || action.tool || { name: 'surveyArea', params: { focus: 'resource' } },
            compensation: action.compensation,
            predictedImpact: action.predictedImpact || {},
            rationale: action.rationale || '等待规划补全',
            status: 'queued',
            progress: 12 + index * 8,
          }))
          set({
            plannerActions: previewActions,
            plannerSummary: partial.summary || current.plannerSummary,
          })
        }
      )
      if (!result?.object) {
        const failures = state.consecutiveFailures + 1
        const baseBackoff = failures >= 2 ? Math.min(90000, 8000 * failures) : 5000
        const backoffMs = Math.max(baseBackoff, state.plannerBackoffMs > 0 ? state.plannerBackoffMs * 2 : baseBackoff)
        const coolingDownUntil = now + Math.min(backoffMs, 30000)
        const currentMode = get().agentMode
        set({
          plannerStatus: 'error',
          plannerError: `Planner failed (${result?.source || 'no response'})，${Math.ceil(backoffMs / 1000)}s 后重试`,
          plannerSummary: undefined,
          plannerBackoffMs: backoffMs,
          nextPlanAt: now + backoffMs,
          lastPlannerSource: result?.source,
          lastPlannerModel: result?.model,
          agentMode: currentMode === 'model' ? 'degraded' : currentMode,
          plannerActions: [],
          consecutiveFailures: failures,
          coolingDownUntil,
          modelStats: nextModelStats(
            state.modelStats,
            'planner',
            (result?.source || 'fallback') as ModelSource,
            result?.elapsedMs
          ),
          decisionEvents: [
            createDecisionEvent('planner', (result?.source || 'fallback') as DecisionEvent['source'], `规划失败，进入退避 (${result?.source || 'fallback'})`, result?.model, result?.elapsedMs),
            ...state.decisionEvents,
          ].slice(0, 16),
        })
        return
      }
      
      const planSeed = result.object
      const isFallback = result.source !== 'model'
      
      if (isFallback) {
        const failures = state.consecutiveFailures + 1
        const backoffMs = Math.min(90000, Math.max(10000, failures * 10000))
        const degradedActions: PlannerAction[] = planSeed.actions.map((action, index) => ({
          id: `plan-degraded-${Date.now()}-${index}`,
          title: action.title,
          ownerId: mapAgentId(action.owner),
          ownerName: action.owner.toUpperCase(),
          priority: Math.max(1, Math.min(3, action.priority || index + 1)),
          tool: action.tool,
          fallbackTool: action.fallbackTool || action.tool,
          compensation: action.compensation,
          predictedImpact: action.predictedImpact || {},
          rationale: `${action.rationale}（degraded）`,
          status: 'queued',
          progress: 0,
        }))
        set({
          plannerActions: degradedActions,
          plannerImpact: planSeed.overallImpact,
          plannerStatus: 'error',
          plannerSummary: planSeed.summary,
          lastPlanAt: now,
          plannerBackoffMs: backoffMs,
          nextPlanAt: now + backoffMs,
          lastPlannerSource: result.source,
          lastPlannerModel: result.model,
          agentMode: 'degraded',
          modelStats: nextModelStats(state.modelStats, 'planner', result.source, result.elapsedMs),
          plannerError: `Planner degraded (${result.source})，暂停关键推进，${Math.ceil(backoffMs / 1000)}s 后重试`,
          consecutiveFailures: failures,
          coolingDownUntil: now + Math.min(backoffMs, 30000),
          decisionEvents: [
            createDecisionEvent('planner', result.source, `规划降级，等待模型恢复 (${result.source})`, result.model, result.elapsedMs),
            ...state.decisionEvents,
          ].slice(0, 16),
        })
        return
      }
      
      const actions: PlannerAction[] = planSeed.actions.map((action, index) => ({
        id: `plan-action-${Date.now()}-${index}`,
        title: action.title,
        ownerId: mapAgentId(action.owner),
        ownerName: action.owner.toUpperCase(),
        priority: Math.max(1, Math.min(3, action.priority || index + 1)),
        tool: action.tool,
        fallbackTool: action.fallbackTool || action.tool,
        compensation: action.compensation,
        predictedImpact: action.predictedImpact || {},
        rationale: action.rationale,
        status: 'queued',
        progress: 0,
      }))

      set({
        plannerActions: actions,
        plannerImpact: planSeed.overallImpact,
        plannerStatus: 'ready',
        plannerSummary: planSeed.summary,
        lastPlanAt: now,
        plannerBackoffMs: 0,
        nextPlanAt: now + 7000,
        lastPlannerSource: result.source,
        lastPlannerModel: result.model,
        agentMode: 'model',
        modelStats: nextModelStats(state.modelStats, 'planner', result.source, result.elapsedMs),
        consecutiveFailures: 0,
        coolingDownUntil: 0,
        decisionEvents: [
          createDecisionEvent('planner', result.source, `规划完成并下发动作 (${result.source})`, result.model, result.elapsedMs),
          ...state.decisionEvents,
        ].slice(0, 16),
      })
      const latestCase = get().cases[0]
      if (latestCase && latestCase.status === 'debate') {
        scheduleCaseFlow(latestCase.id)
      }
    } finally {
      set({ plannerRequestInFlight: false })
    }
  },

  executePlannerAction: async () => {
    const state = get()
    if (!state.worldView) return
    if (state.executorStatus === 'running') return
    const target = state.plannerActions.find((action) => action.status !== 'done' && action.status !== 'failed')
    if (!target) return
    if (state.plannerStatus === 'planning') return

    const predictedImpact = target.predictedImpact || {}

    const updatedActions: PlannerAction[] = state.plannerActions.map((action) =>
      action.id === target.id ? { ...action, status: 'running', progress: 50 } : action
    )
    set({
      resources: Object.entries(predictedImpact).reduce((acc, [key, delta]) => {
        if (typeof delta !== 'number') return acc
        const typedKey = key as keyof WorldState['resources']
        return {
          ...acc,
          [typedKey]: clampResource(acc[typedKey] + delta),
        }
      }, state.resources),
      plannerActions: updatedActions,
      executorStatus: 'running',
      executorError: undefined,
    })

    try {
      const execResponse = await fetch('/api/env/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: { title: target.title, owner: target.ownerName, priority: target.priority },
          tool: target.tool,
          fallbackTool: target.fallbackTool,
          compensation: target.compensation,
          resources: state.resources,
        }),
      })

      if (!execResponse.ok) {
        throw new Error('环境执行失败')
      }

      const execData = await execResponse.json()
      const appliedImpact = execData.appliedImpact || {}
      const success = execData.success !== false
      const outcome = execData.outcome || '执行完成'
      const threatShift = execData.threatShift || 'stable'

      const feedback = `${target.ownerName} 执行「${target.title}」：${success ? outcome : '执行失败/中断'}`
      set((current) => {
        const correctedResources = { ...current.resources }
        const keys = new Set<string>([
          ...Object.keys(predictedImpact),
          ...Object.keys(appliedImpact),
        ])
        keys.forEach((key) => {
          const typedKey = key as keyof WorldState['resources']
          const predicted = typeof predictedImpact[typedKey] === 'number' ? Number(predictedImpact[typedKey]) : 0
          const applied = typeof appliedImpact[typedKey] === 'number' ? Number(appliedImpact[typedKey]) : 0
          const correction = applied - predicted
          correctedResources[typedKey] = clampResource(correctedResources[typedKey] + correction)
        })

        const nextPlannerActions = current.plannerActions.map((action) => {
          if (action.id !== target.id) return action
          const nextStatus: PlannerAction['status'] = success ? 'done' : 'failed'
          return { ...action, status: nextStatus, progress: 100, outcome }
        })
        const allFinished = nextPlannerActions.length > 0 && nextPlannerActions.every((action) => action.status === 'done')

        return {
          resources: correctedResources,
          threatLevel: shiftThreat(deriveThreat(correctedResources), success ? threatShift : 'up'),
          cases: current.cases.map((c, index) => {
            if (index !== 0) return c
            const prevImpact = c.impact || {}
            const mergedImpact: Partial<WorldState['resources']> = { ...prevImpact }
            Object.entries(appliedImpact).forEach(([key, delta]) => {
              if (typeof delta === 'number') {
                const prev = mergedImpact[key as keyof WorldState['resources']] || 0
                mergedImpact[key as keyof WorldState['resources']] = prev + delta
              }
            })
            return {
              ...c,
              status: allFinished ? 'resolved' : (success ? 'execution' : c.status),
              impact: mergedImpact,
              outcome: allFinished
                ? `已完成计划闭环：${feedback}（${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}）`
                : `${feedback}（${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}）`,
              heat: Math.max(45, Math.min(95, c.heat + (success ? 2 : -1))),
              tasks: c.tasks.map((task) => {
                const hit = nextPlannerActions.find((action) => action.ownerId === task.ownerId)
                if (!hit) return task
                return {
                  ...task,
                  status: hit.status === 'done' ? 'done' : hit.status === 'running' ? 'running' : 'queued',
                  progress: hit.progress,
                }
              }),
            }
          }),
          plannerActions: nextPlannerActions,
          plannerFeedback: [...current.plannerFeedback, feedback].slice(-6),
          decisionEvents: [
            createDecisionEvent('execute', 'model', feedback),
            ...current.decisionEvents,
          ].slice(0, 16),
          executorStatus: success ? 'idle' : 'error',
          executorError: success ? undefined : outcome,
          plannerStatus: success ? current.plannerStatus : 'error',
          plannerError: success ? current.plannerError : outcome,
        }
      })
    } catch (error) {
      set((current) => {
        const rolledBackResources = { ...current.resources }
        Object.entries(predictedImpact).forEach(([key, delta]) => {
          if (typeof delta !== 'number') return
          const typedKey = key as keyof WorldState['resources']
          rolledBackResources[typedKey] = clampResource(rolledBackResources[typedKey] - delta)
        })
        return {
          resources: rolledBackResources,
          plannerStatus: 'error',
          plannerError: '环境执行失败',
          executorStatus: 'error',
          executorError: error instanceof Error ? error.message : '环境执行失败',
          plannerActions: current.plannerActions.map((action) =>
            action.id === target.id ? { ...action, status: 'failed', outcome: '执行失败', progress: 100 } : action
          ),
          plannerFeedback: [...current.plannerFeedback, `${target.ownerName} 执行「${target.title}」失败`].slice(-6),
          decisionEvents: [
            createDecisionEvent('execute', 'fallback', `${target.ownerName} 执行「${target.title}」失败`),
            ...current.decisionEvents,
          ].slice(0, 16),
        }
      })
    }
  },

  advanceExecution: () => {
    set((state) => {
      if (!state.goal) return state

      const plan = state.plan.map((step) => {
        const linked = state.plannerActions.find((action) => action.ownerId === step.ownerId)
        if (!linked) return step
        const status: PlanStep['status'] = linked.status === 'done' ? 'done' : linked.status === 'running' ? 'active' : step.status
        const progress = Math.max(step.progress, linked.progress)
        return { ...step, status, progress, note: linked.title }
      })

      const goal = state.goal
        ? (() => {
            const finished = state.plannerActions.length > 0 && state.plannerActions.every((action) => action.status === 'done')
            const progress = Math.min(100, state.goal.progress + (finished ? 3 : 1))
            return {
              ...state.goal,
              progress,
              updatedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
              status: (progress >= 100 ? 'completed' : 'active') as StrategyGoal['status'],
            }
          })()
        : state.goal

      return {
        ...state,
        plan,
        goal,
      }
    })
  },
  
  tick: () => {
    set((state) => {
      const [hours, minutes] = state.time.split(':').map(Number)
      let newMinutes = minutes + 1
      let newHours = hours
      if (newMinutes >= 60) {
        newMinutes = 0
        newHours++
      }
      if (newHours >= 24) {
        newHours = 0
      }
      
      return {
        time: `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`,
        day: newHours === 0 && newMinutes === 0 ? state.day + 1 : state.day,
      }
    })
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }))
  },
})
})
