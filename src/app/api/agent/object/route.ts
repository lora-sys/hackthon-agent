import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { z } from 'zod'
import {
  debateCaseSchema,
  plannerSchema,
  strategySchema,
} from '@/lib/ai/objectSchemas'

export const dynamic = 'force-dynamic'

const siliconflowApiKey = process.env.SILICONFLOW_API_KEY || process.env.ILICONFLOW_API_KEY || ''

const iflowProvider = createOpenAICompatible({
  name: 'iflow',
  baseURL: 'https://apis.iflow.cn/v1',
  apiKey: process.env.IFLOW_API_KEY || '',
  supportsStructuredOutputs: true,
})

const siliconflowProvider = createOpenAICompatible({
  name: 'siliconflow',
  baseURL: 'https://api.siliconflow.cn/v1',
  apiKey: siliconflowApiKey,
  supportsStructuredOutputs: true,
})

const objectTaskSchema = z.object({
  task: z.enum(['debate', 'strategy', 'planner']),
  worldView: z.string().default(''),
  trigger: z.string().optional(),
  resources: z.object({
    energy: z.number(),
    wood: z.number(),
    stone: z.number(),
    food: z.number(),
    water: z.number(),
  }).optional(),
  threatLevel: z.string().optional(),
  feedback: z.string().optional(),
})

type TaskType = z.infer<typeof objectTaskSchema>['task']
type ProviderRuntime = {
  id: 'siliconflow' | 'iflow'
  chatModel: (modelId: string) => ReturnType<typeof iflowProvider.chatModel>
  models: Record<TaskType, string[]>
}

const inflight = new Map<string, Promise<unknown>>()
const cache = new Map<string, { at: number; data: unknown }>()

const minIntervalMs: Record<TaskType, number> = {
  debate: 5000,
  strategy: 15000,
  planner: 3500,
}

const taskTimeoutMs: Record<TaskType, number> = {
  debate: 9000,
  strategy: 9000,
  planner: 12000,
}

const plannerLooseActionSchema = z.object({
  owner: z.string().optional(),
  title: z.string().optional(),
  priority: z.number().optional(),
  tool: z.unknown().optional(),
  fallbackTool: z.unknown().optional(),
  compensation: z.unknown().optional(),
  predictedImpact: z.record(z.string(), z.number()).optional(),
  rationale: z.string().optional(),
})

const plannerLooseSchema = z.object({
  summary: z.string().optional(),
  actions: z.array(plannerLooseActionSchema).optional(),
  overallImpact: z.record(z.string(), z.number()).optional(),
})

const debateLooseSchema = z.object({
  title: z.string().optional(),
  trigger: z.string().optional(),
  debate: z.array(z.object({
    agent: z.string().optional(),
    stance: z.string().optional(),
    summary: z.string().optional(),
    confidence: z.number().optional(),
  })).optional(),
  voteReasons: z.object({
    yes: z.array(z.string()).optional(),
    no: z.array(z.string()).optional(),
    abstain: z.array(z.string()).optional(),
  }).optional(),
  tasks: z.array(z.object({
    owner: z.string().optional(),
    title: z.string().optional(),
  })).optional(),
  outcome: z.string().optional(),
  impact: z.record(z.string(), z.number()).optional(),
})

const strategyLooseSchema = z.object({
  goal: z.object({
    title: z.string().optional(),
    horizon: z.string().optional(),
    successMetric: z.string().optional(),
  }).optional(),
  plan: z.array(z.object({
    owner: z.string().optional(),
    title: z.string().optional(),
    note: z.string().optional(),
  })).optional(),
})

const toolNames = ['fetchResource', 'buildModule', 'surveyArea', 'optimizeEnergy', 'treatInjuries'] as const
const agentOrder = ['ALEX', 'NOVA', 'ZETA'] as const

function pickOwner(input: unknown, index: number): (typeof agentOrder)[number] {
  if (typeof input === 'string') {
    const upper = input.toUpperCase()
    if (upper.includes('ALEX')) return 'ALEX'
    if (upper.includes('NOVA')) return 'NOVA'
    if (upper.includes('ZETA')) return 'ZETA'
  }
  return agentOrder[index % agentOrder.length]
}

function pickStance(input: unknown, index: number): 'support' | 'oppose' | 'caution' {
  if (typeof input === 'string') {
    const raw = input.toLowerCase()
    if (raw.includes('support') || raw.includes('支持')) return 'support'
    if (raw.includes('oppose') || raw.includes('反对')) return 'oppose'
    if (raw.includes('caution') || raw.includes('observe') || raw.includes('观望')) return 'caution'
  }
  return index === 0 ? 'support' : index === 1 ? 'oppose' : 'caution'
}

function pickToolName(input: unknown, fallback: (typeof toolNames)[number]): (typeof toolNames)[number] {
  if (typeof input === 'string') {
    const raw = input.toLowerCase()
    if (raw.includes('fetch') || raw.includes('gather') || raw.includes('food') || raw.includes('water')) return 'fetchResource'
    if (raw.includes('build') || raw.includes('module') || raw.includes('construct')) return 'buildModule'
    if (raw.includes('survey') || raw.includes('scan') || raw.includes('threat') || raw.includes('route')) return 'surveyArea'
    if (raw.includes('energy') || raw.includes('solar') || raw.includes('power')) return 'optimizeEnergy'
    if (raw.includes('treat') || raw.includes('heal') || raw.includes('injur')) return 'treatInjuries'
  }
  if (typeof input === 'object' && input && 'name' in input) {
    const name = (input as { name?: unknown }).name
    if (typeof name === 'string') {
      if ((toolNames as readonly string[]).includes(name)) return name as (typeof toolNames)[number]
      return pickToolName(name, fallback)
    }
  }
  return fallback
}

function pickParams(input: unknown): Record<string, string | number> {
  if (typeof input === 'object' && input && 'params' in input) {
    const params = (input as { params?: unknown }).params
    if (params && typeof params === 'object' && !Array.isArray(params)) {
      return Object.entries(params as Record<string, unknown>).reduce<Record<string, string | number>>((acc, [key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          acc[key] = value
        }
        return acc
      }, {})
    }
  }
  return {}
}

function pickImpact(input: unknown): Record<'energy' | 'wood' | 'stone' | 'food' | 'water', number> {
  const base = { energy: 0, wood: 0, stone: 0, food: 0, water: 0 }
  if (!input || typeof input !== 'object') return base
  for (const key of Object.keys(base) as Array<keyof typeof base>) {
    const value = (input as Record<string, unknown>)[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      base[key] = Math.round(value)
    }
  }
  return base
}

function normalizePlannerOutput(rawObject: unknown): z.infer<typeof plannerSchema> {
  const parsed = plannerLooseSchema.safeParse(rawObject)
  const raw = parsed.success ? parsed.data : {}
  const rawActions = Array.isArray(raw.actions) ? raw.actions : []

  const actions = Array.from({ length: 3 }).map((_, index) => {
    const input = rawActions[index] || {}
    const owner = pickOwner(input.owner, index)
    const primaryToolName = pickToolName(input.tool, index === 0 ? 'buildModule' : index === 1 ? 'fetchResource' : 'surveyArea')
    const fallbackToolName = pickToolName(input.fallbackTool, 'surveyArea')
    const compensationToolName = pickToolName(input.compensation, 'surveyArea')
    return {
      owner,
      title: typeof input.title === 'string' && input.title.trim().length > 0 ? input.title.trim().slice(0, 80) : `动作-${index + 1}`,
      priority: Math.max(1, Math.min(3, Math.round(typeof input.priority === 'number' ? input.priority : index + 1))),
      tool: { name: primaryToolName, params: pickParams(input.tool) },
      fallbackTool: { name: fallbackToolName, params: pickParams(input.fallbackTool) },
      compensation: {
        name: compensationToolName === 'fetchResource' || compensationToolName === 'buildModule' ? 'surveyArea' : compensationToolName,
        params: pickParams(input.compensation),
      },
      predictedImpact: pickImpact(input.predictedImpact),
      rationale: typeof input.rationale === 'string' && input.rationale.trim().length > 0 ? input.rationale.trim().slice(0, 140) : '根据当前资源与风险做出的执行建议',
    }
  })

  const candidate = {
    summary: typeof raw.summary === 'string' && raw.summary.trim().length > 0 ? raw.summary.trim().slice(0, 120) : 'Planner 已输出下一轮动作',
    actions,
    overallImpact: pickImpact(raw.overallImpact),
  }

  return plannerSchema.parse(candidate)
}

function normalizeDebateOutput(rawObject: unknown, task: z.infer<typeof objectTaskSchema>): z.infer<typeof debateCaseSchema> {
  const parsed = debateLooseSchema.safeParse(rawObject)
  const raw = parsed.success ? parsed.data : {}
  const rawDebate = Array.isArray(raw.debate) ? raw.debate : []
  const rawTasks = Array.isArray(raw.tasks) ? raw.tasks : []
  const title = typeof raw.title === 'string' && raw.title.trim().length > 0
    ? raw.title.trim().slice(0, 80)
    : `协作议题：${(task.worldView || '未知世界').slice(0, 18)}`
  const trigger = typeof raw.trigger === 'string' && raw.trigger.trim().length > 0
    ? raw.trigger.trim().slice(0, 140)
    : task.trigger || '系统预警：需要新的协作决策'

  return debateCaseSchema.parse({
    title,
    trigger,
    debate: Array.from({ length: 3 }).map((_, index) => {
      const input = rawDebate[index] || {}
      return {
        agent: pickOwner(input.agent, index),
        stance: pickStance(input.stance, index),
        summary: typeof input.summary === 'string' && input.summary.trim().length > 0
          ? input.summary.trim().slice(0, 140)
          : index === 0 ? '建议先稳定核心设施。' : index === 1 ? '资源边界偏紧，应先补给。' : '建议先小规模验证。',
        confidence: Math.max(0, Math.min(1, typeof input.confidence === 'number' ? input.confidence : 0.72 - index * 0.04)),
      }
    }),
    voteReasons: {
      yes: raw.voteReasons?.yes?.length ? raw.voteReasons.yes.slice(0, 3) : ['保证系统连续性'],
      no: raw.voteReasons?.no?.length ? raw.voteReasons.no.slice(0, 3) : ['资源代价较高'],
      abstain: raw.voteReasons?.abstain?.length ? raw.voteReasons.abstain.slice(0, 3) : ['需要更多数据'],
    },
    tasks: Array.from({ length: 3 }).map((_, index) => {
      const input = rawTasks[index] || {}
      return {
        owner: pickOwner(input.owner, index),
        title: typeof input.title === 'string' && input.title.trim().length > 0
          ? input.title.trim().slice(0, 80)
          : index === 0 ? '加固关键基础模块' : index === 1 ? '补充关键资源补给' : '执行风险巡检',
      }
    }),
    outcome: typeof raw.outcome === 'string' && raw.outcome.trim().length > 0
      ? raw.outcome.trim().slice(0, 180)
      : '形成阶段性共识，进入执行验证。',
    impact: pickImpact(raw.impact),
  })
}

function normalizeStrategyOutput(rawObject: unknown, task: z.infer<typeof objectTaskSchema>): z.infer<typeof strategySchema> {
  const parsed = strategyLooseSchema.safeParse(rawObject)
  const raw = parsed.success ? parsed.data : {}
  const rawPlan = Array.isArray(raw.plan) ? raw.plan : []
  return strategySchema.parse({
    goal: {
      title: typeof raw.goal?.title === 'string' && raw.goal.title.trim().length > 0
        ? raw.goal.title.trim().slice(0, 90)
        : `在「${task.worldView || '未知世界'}」建立可持续协作秩序`,
      horizon: typeof raw.goal?.horizon === 'string' && raw.goal.horizon.trim().length > 0
        ? raw.goal.horizon.trim().slice(0, 32)
        : '3 DAY CYCLE',
      successMetric: typeof raw.goal?.successMetric === 'string' && raw.goal.successMetric.trim().length > 0
        ? raw.goal.successMetric.trim().slice(0, 120)
        : '资源稳定 + 风险可控 + 执行链连续',
    },
    plan: Array.from({ length: 3 }).map((_, index) => {
      const input = rawPlan[index] || {}
      return {
        owner: pickOwner(input.owner, index),
        title: typeof input.title === 'string' && input.title.trim().length > 0
          ? input.title.trim().slice(0, 80)
          : index === 0 ? '构建防护与基础设施' : index === 1 ? '稳定关键资源与补给路线' : '建立协作节奏与应急预案',
        note: typeof input.note === 'string' && input.note.trim().length > 0
          ? input.note.trim().slice(0, 120)
          : index === 0 ? '优先保障基础生存与能源稳定' : index === 1 ? '围绕食物与水源建立安全补给' : '保持威胁监测与应急响应',
      }
    }),
  })
}

function getProviderRuntimes(): ProviderRuntime[] {
  const runtimes: ProviderRuntime[] = []
  const useSiliconOnly = process.env.AGENT_PROVIDER_FORCE === 'siliconflow' || (siliconflowApiKey && process.env.ALLOW_IFLOW_FALLBACK !== '1')

  if (siliconflowApiKey) {
    runtimes.push({
      id: 'siliconflow',
      chatModel: (modelId: string) => siliconflowProvider.chatModel(modelId),
      models: {
        debate: ['THUDM/glm-4-9b-chat', 'deepseek-ai/DeepSeek-V3'],
        planner: ['THUDM/glm-4-9b-chat', 'deepseek-ai/DeepSeek-V3'],
        strategy: ['THUDM/glm-4-9b-chat', 'deepseek-ai/DeepSeek-V3'],
      },
    })
  }

  if (process.env.IFLOW_API_KEY && !useSiliconOnly) {
    runtimes.push({
      id: 'iflow',
      chatModel: (modelId: string) => iflowProvider.chatModel(modelId),
      models: {
        debate: ['qwen3-max-preview', 'qwen3-coder-plus'],
        planner: ['qwen3-max-preview', 'qwen3-coder-plus'],
        strategy: ['qwen3-max-preview', 'qwen3-coder-plus'],
      },
    })
  }

  return runtimes
}

function buildFallbackObject(task: z.infer<typeof objectTaskSchema>) {
  if (task.task === 'debate') {
    return {
      title: `协作议题：${(task.worldView || '未知世界').slice(0, 18)}`,
      trigger: task.trigger || '系统预警：需要新的协作决策',
      debate: [
        { agent: 'ALEX', stance: 'support', summary: '建议先稳定核心设施。', confidence: 0.72 },
        { agent: 'NOVA', stance: 'oppose', summary: '资源边界偏紧，应先补给。', confidence: 0.68 },
        { agent: 'ZETA', stance: 'caution', summary: '建议先小规模验证。', confidence: 0.75 },
      ],
      voteReasons: {
        yes: ['保证系统连续性'],
        no: ['资源代价较高'],
        abstain: ['需要更多数据'],
      },
      tasks: [
        { owner: 'ALEX', title: '加固关键基础模块' },
        { owner: 'NOVA', title: '补充关键资源补给' },
        { owner: 'ZETA', title: '执行风险巡检' },
      ],
      outcome: '形成阶段性共识，进入执行验证。',
      impact: { energy: 2, food: 1, water: 1 },
    }
  }
  if (task.task === 'strategy') {
    return {
      goal: {
        title: `在「${task.worldView || '未知世界'}」建立可持续协作秩序`,
        horizon: '3 DAY CYCLE',
        successMetric: '资源稳定 + 风险可控 + 执行链连续',
      },
      plan: [
        { owner: 'ALEX', title: '构建防护与基础设施', note: '优先保障基础生存与能源稳定' },
        { owner: 'NOVA', title: '稳定关键资源与补给路线', note: '围绕食物与水源建立安全补给' },
        { owner: 'ZETA', title: '建立协作节奏与应急预案', note: '保持威胁监测与应急响应' },
      ],
    }
  }
  return {
    summary: '本轮 Planner 采用安全降级策略。',
    actions: [
      {
        owner: 'ALEX',
        title: '扩建基础庇护模块',
        priority: 1,
        tool: { name: 'buildModule', params: { module: 'shelter', wood: 3, stone: 2 } },
        fallbackTool: { name: 'surveyArea', params: { focus: 'resource' } },
        compensation: { name: 'surveyArea', params: { focus: 'route' } },
        predictedImpact: { wood: -3, stone: -2, energy: 1 },
        rationale: '保障长期生存能力',
      },
      {
        owner: 'NOVA',
        title: '补充基础资源',
        priority: 2,
        tool: { name: 'fetchResource', params: { resource: 'food', amount: 3 } },
        fallbackTool: { name: 'surveyArea', params: { focus: 'resource' } },
        compensation: { name: 'treatInjuries', params: { severity: 'low', food: 1, water: 1 } },
        predictedImpact: { food: 3 },
        rationale: '稳定资源供给',
      },
      {
        owner: 'ZETA',
        title: '巡查路线与风险',
        priority: 3,
        tool: { name: 'surveyArea', params: { focus: 'threat' } },
        fallbackTool: { name: 'optimizeEnergy', params: { mode: 'solar' } },
        compensation: { name: 'surveyArea', params: { focus: 'threat' } },
        predictedImpact: { energy: -1 },
        rationale: '维持情报与风险监控',
      },
    ],
    overallImpact: { energy: 1, food: 3, wood: -3, stone: -2 },
  }
}

function buildKey(task: z.infer<typeof objectTaskSchema>) {
  return JSON.stringify(task)
}

function buildPrompt(task: z.infer<typeof objectTaskSchema>) {
  if (task.task === 'debate') {
    return {
      system: `你是多智能体协作系统的争论生成器。
输出必须严格符合 schema，且必须包含 ALEX/NOVA/ZETA 三人立场、任务、影响。`,
      prompt: `世界观：${task.worldView || '未定义'}
触发事件：${task.trigger || '系统预警：协作需要新的决策'}
请生成一条可执行的争论证据链。`,
      schema: debateLooseSchema,
    }
  }

  if (task.task === 'strategy') {
    return {
      system: '你是策略规划官。输出长期目标与三步计划，严格匹配 schema。',
      prompt: `世界观：${task.worldView || '未定义'}
请给出长期目标与三位角色各自计划。`,
      schema: strategyLooseSchema,
    }
  }

  return {
    system: `你是 Planner。请输出下一轮三项动作，严格匹配 schema。
动作必须对应 ALEX/NOVA/ZETA，各一条，并包含 tool/fallbackTool/compensation。`,
    prompt: `世界观：${task.worldView || '未定义'}
资源：energy=${task.resources?.energy ?? 0}, wood=${task.resources?.wood ?? 0}, stone=${task.resources?.stone ?? 0}, food=${task.resources?.food ?? 0}, water=${task.resources?.water ?? 0}
威胁等级：${task.threatLevel || 'low'}
最新反馈：${task.feedback || '无'}`,
    schema: plannerLooseSchema,
  }
}

async function runTask(task: z.infer<typeof objectTaskSchema>, runtimes: ProviderRuntime[]) {
  const { system, prompt, schema } = buildPrompt(task)

  let lastError: unknown
  for (const runtime of runtimes) {
    for (const modelId of runtime.models[task.task]) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(`${task.task}:${runtime.id}:${modelId} timeout`), taskTimeoutMs[task.task])
      try {
        const timedResult = await generateObject({
          model: runtime.chatModel(modelId),
          schema,
          system,
          prompt,
          temperature: task.task === 'planner' ? 0.2 : 0.5,
          abortSignal: controller.signal,
        })
        const normalizedObject =
          task.task === 'planner'
            ? normalizePlannerOutput(timedResult.object)
            : task.task === 'debate'
              ? normalizeDebateOutput(timedResult.object, task)
              : normalizeStrategyOutput(timedResult.object, task)
        return { object: normalizedObject, model: `${runtime.id}:${modelId}` }
      } catch (error) {
        lastError = error
      } finally {
        clearTimeout(timer)
      }
    }
  }

  throw lastError || new Error('Object generation failed')
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null)
  const taskParsed = objectTaskSchema.safeParse(payload)
  if (!taskParsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const parsed = taskParsed.data
  try {
    const providerRuntimes = getProviderRuntimes()
    if (providerRuntimes.length === 0) {
      return NextResponse.json({ error: 'No model provider key configured (SILICONFLOW_API_KEY/ILICONFLOW_API_KEY / IFLOW_API_KEY)' }, { status: 500 })
    }
    const key = buildKey(parsed)
    const now = Date.now()

    const cached = cache.get(key)
    if (cached && now - cached.at < minIntervalMs[parsed.task]) {
      return NextResponse.json({ object: cached.data, source: 'cache' })
    }

    const existing = inflight.get(key)
    if (existing) {
      const data = await existing
      return NextResponse.json({ object: data, source: 'dedupe' })
    }

    const promise = runTask(parsed, providerRuntimes).then((result) => {
      cache.set(key, { at: Date.now(), data: result.object })
      return result
    }).finally(() => {
      inflight.delete(key)
    })

    inflight.set(key, promise)
    const result = await promise

    return NextResponse.json({
      object: result.object,
      source: 'model',
      model: result.model,
    })
  } catch {
    return NextResponse.json({
      object: buildFallbackObject(parsed),
      source: 'fallback',
    })
  }
}
