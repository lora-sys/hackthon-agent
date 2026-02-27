'use client'

import type { DebateCaseSeed, PlannerSeed, StrategySeed } from '@/lib/ai/objectSchemas'

interface AIResponse {
  content: string
  action?: string
  target?: string
}

export interface ObjectDecision<T> {
  object: T
  source: 'model' | 'fallback' | 'cache' | 'dedupe'
  model?: string
  elapsedMs?: number | null
  task?: 'debate' | 'planner' | 'strategy'
}

export async function getAIResponseStream(
  agentName: string,
  userInput: string,
  worldView: string,
  agentStatus: string,
  onChunk?: (chunk: string) => void
): Promise<AIResponse> {
  const rolePrompts: Record<string, { role: string; personality: string }> = {
    ALEX: { role: 'Builder', personality: '勤劳、务实、擅长建造和修复' },
    NOVA: { role: 'Explorer', personality: '好奇、勇敢、善于发现新资源' },
    ZETA: { role: 'Commander', personality: '冷静、有战略眼光、善于协调团队' },
  }
  
  const agent = rolePrompts[agentName] || { role: 'Unknown', personality: '中立' }
  
  const systemPrompt = `你是一个AI角色，名字叫${agentName}，角色是${agent.role}。
性格特点：${agent.personality}
当前世界观：${worldView}
当前状态：${agentStatus}

用户向你发出了指令：${userInput}

请以这个角色的性格特点来回应。回复要简短（不超过30字），符合角色设定。
可以包含：
- 对指令的理解
- 接下来的行动计划
- 观察到的情况

只回复角色的话术，不要有其他解释。`

  try {
    const response = await fetch('/api/agent/think', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        temperature: 0.8,
        maxTokens: 200,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error('AI request failed')
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let content = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '))
      
      for (const line of lines) {
        const data = line.slice(6).trim()
        if (data && data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data)
            const text = parsed.choices?.[0]?.delta?.content || ''
            if (text) {
              content += text
              onChunk?.(text)
            }
          } catch {
            // Try parsing as raw content
          }
        }
      }
    }

    return { content: content || getFallbackResponse(agentName) }
  } catch (error) {
    console.error('AI response error:', error)
    return { content: getFallbackResponse(agentName) }
  }
}

export async function getAIResponse(
  agentName: string,
  userInput: string,
  worldView: string,
  agentStatus: string
): Promise<AIResponse> {
  return getAIResponseStream(agentName, userInput, worldView, agentStatus)
}

function getFallbackResponse(agentName: string): string {
  const fallbacks: Record<string, string[]> = {
    ALEX: ['收到指令，开始建造', '需要更多资源', '正在加固结构'],
    NOVA: ['发现新区域', '正在探索中', '找到有用物资'],
    ZETA: ['收到，正在规划', '分析当前形势', '协调团队分工'],
  }
  const options = fallbacks[agentName] || ['收到指令']
  return options[Math.floor(Math.random() * options.length)]
}

export async function getAIThoughts(
  agentName: string,
  worldView: string,
  otherAgents: string[]
): Promise<string> {
  const rolePrompts: Record<string, { role: string; personality: string }> = {
    ALEX: { role: 'Builder', personality: '勤劳、务实、擅长建造和修复' },
    NOVA: { role: 'Explorer', personality: '好奇、勇敢、善于发现新资源' },
    ZETA: { role: 'Commander', personality: '冷静、有战略眼光、善于协调团队' },
  }
  
  const agent = rolePrompts[agentName] || { role: 'Unknown', personality: '中立' }
  
  const systemPrompt = `你是一个AI角色，名字叫${agentName}，角色是${agent.role}。
性格特点：${agent.personality}
当前世界观：${worldView}
团队成员：${otherAgents.join(', ')}

作为AI，你正在思考/观察周围的情况。请以角色的视角说一句简短的内心独白（不超过20字）。
可以描述：
- 发现的情况
- 想到的计划
- 对团队的观察
- 当前的感受

只回复独白内容，不要有其他解释。`

  try {
    const response = await fetch('/api/agent/think', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: '请说一句你现在的想法' }
        ],
        temperature: 0.9,
        maxTokens: 100,
      }),
    })

    if (!response.ok) throw new Error('AI request failed')
    const data = await response.json()
    return data.content || getFallbackThought(agentName)
  } catch (error) {
    console.error('[getAIThoughts] Error:', error)
    return getFallbackThought(agentName)
  }
}

function getFallbackThought(agentName: string): string {
  const thoughts: Record<string, string[]> = {
    ALEX: ['庇护所需要加固', '木材不够了', '今天能完成'],
    NOVA: ['前方有情况', '发现新资源', '需要回去汇报'],
    ZETA: ['团队配合不错', '资源还够用', '明天分工一下'],
  }
  const options = thoughts[agentName] || ['正在思考']
  return options[Math.floor(Math.random() * options.length)]
}

function buildFallbackDebate(worldView: string, trigger: string): DebateCaseSeed {
  return {
    title: `协作议题：${(worldView || '未知环境').slice(0, 18)}`,
    trigger: trigger || '系统预警：需要新的协作决策',
    debate: [
      { agent: 'ALEX', stance: 'support', summary: '建议先保住核心基础设施，避免系统级故障。', confidence: 0.74 },
      { agent: 'NOVA', stance: 'oppose', summary: '当前资源边界偏紧，应先补给再扩建。', confidence: 0.69 },
      { agent: 'ZETA', stance: 'caution', summary: '建议小规模试运行后再全面推进。', confidence: 0.77 },
    ],
    voteReasons: {
      yes: ['生存基础能力必须优先保障'],
      no: ['资源压力会影响其他关键系统'],
      abstain: ['需要更多现场数据再决策'],
    },
    tasks: [
      { owner: 'ALEX', title: '评估并修复关键基础模块' },
      { owner: 'NOVA', title: '补充关键资源并建立补给点' },
      { owner: 'ZETA', title: '执行风险巡检并输出预案' },
    ],
    outcome: '形成阶段性共识，进入执行验证阶段。',
    impact: { energy: 2, food: 1, water: 1 },
  }
}

function buildFallbackStrategy(worldView: string): StrategySeed {
  return {
    goal: {
      title: `在「${worldView || '未知世界'}」建立可持续协作秩序`,
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

function buildFallbackPlan(
  resources: { energy: number; wood: number; stone: number; food: number; water: number },
  threatLevel: string
): PlannerSeed {
  const needsFood = resources.food < 50
  const needsWater = resources.water < 50
  const needsEnergy = resources.energy < 50

  return {
    summary: '本轮 Planner 由本地策略生成（LLM 暂不可用）',
    actions: [
      {
        owner: 'ALEX',
        title: needsEnergy ? '优化能源供给' : '扩建基础庇护模块',
        priority: 1,
        tool: needsEnergy
          ? { name: 'optimizeEnergy', params: { mode: 'storage' } }
          : { name: 'buildModule', params: { module: 'shelter', wood: 3, stone: 2 } },
        fallbackTool: { name: 'surveyArea', params: { focus: 'resource' } },
        compensation: { name: 'surveyArea', params: { focus: 'route' } },
        predictedImpact: needsEnergy ? { energy: 3 } : { wood: -3, stone: -2, energy: 1 },
        rationale: needsEnergy ? '能源偏低，需要先稳住供给' : '保障长期生存能力',
      },
      {
        owner: 'NOVA',
        title: needsFood ? '优先补给食物' : needsWater ? '补给水源' : '补充基础资源',
        priority: 2,
        tool: needsFood
          ? { name: 'fetchResource', params: { resource: 'food', amount: 4 } }
          : needsWater
            ? { name: 'fetchResource', params: { resource: 'water', amount: 4 } }
            : { name: 'fetchResource', params: { resource: 'wood', amount: 3 } },
        fallbackTool: { name: 'surveyArea', params: { focus: 'resource' } },
        compensation: { name: 'treatInjuries', params: { severity: 'low', food: 1, water: 1 } },
        predictedImpact: needsFood
          ? { food: 4 }
          : needsWater
            ? { water: 4 }
            : { wood: 3 },
        rationale: '资源供给要先稳定',
      },
      {
        owner: 'ZETA',
        title: threatLevel === 'HIGH' ? '优先侦测威胁' : '巡查路线与风险',
        priority: 3,
        tool: { name: 'surveyArea', params: { focus: threatLevel === 'HIGH' ? 'threat' : 'route' } },
        fallbackTool: { name: 'optimizeEnergy', params: { mode: 'solar' } },
        compensation: { name: 'surveyArea', params: { focus: 'threat' } },
        predictedImpact: { energy: -1 },
        rationale: '维持情报与风险监控',
      },
    ],
    overallImpact: {
      energy: needsEnergy ? 3 : 1,
      wood: needsEnergy ? 0 : -3,
      stone: needsEnergy ? 0 : -2,
      food: needsFood ? 4 : 0,
      water: needsWater ? 4 : 0,
    },
  }
}


export async function getDebateCase(
  worldView: string,
  trigger: string
): Promise<DebateCaseSeed | null> {
  try {
    const response = await fetch('/api/agent/object', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'debate',
        worldView,
        trigger,
      }),
    })
    if (!response.ok) throw new Error('debate object request failed')
    const data = await response.json()
    if (data?.object) return data.object as DebateCaseSeed
  } catch (error) {
    console.error('[streamDebateCase] Error:', error)
  }
  return buildFallbackDebate(worldView, trigger)
}

async function readStreamObject<T>(
  body: ReadableStream<Uint8Array>,
  onPartial?: (partial: Partial<T>) => void
): Promise<ObjectDecision<T> | null> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalResult: ObjectDecision<T> | null = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() || ''

    for (const rawEvent of chunks) {
      const lines = rawEvent.split('\n')
      let eventType = 'message'
      let dataText = ''

      for (const line of lines) {
        if (line.startsWith('event:')) eventType = line.slice(6).trim()
        if (line.startsWith('data:')) dataText += line.slice(5).trim()
      }

      if (!dataText) continue
      let payload: Record<string, unknown> | null = null
      try {
        payload = JSON.parse(dataText)
      } catch {
        continue
      }

      if (eventType === 'partial' && payload?.object && onPartial) {
        onPartial(payload.object as Partial<T>)
      }
      if (eventType === 'final' && payload?.object) {
        const source = payload.source
        const model = payload.model
        const elapsedMs = payload.elapsedMs
        const task = payload.task
        finalResult = {
          object: payload.object as T,
          source: source === 'model' || source === 'fallback' || source === 'cache' || source === 'dedupe' ? source : 'fallback',
          model: typeof model === 'string' ? model : undefined,
          elapsedMs: typeof elapsedMs === 'number' ? elapsedMs : null,
          task: task === 'debate' || task === 'planner' || task === 'strategy' ? task : undefined,
        }
      }
    }
  }

  return finalResult
}

export async function streamDebateCase(
  worldView: string,
  trigger: string,
  onPartial?: (partial: Partial<DebateCaseSeed>) => void
): Promise<ObjectDecision<DebateCaseSeed>> {
  try {
    const response = await fetch('/api/agent/object/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'debate',
        worldView,
        trigger,
      }),
    })
    if (!response.ok || !response.body) throw new Error('debate stream request failed')
    const result = await readStreamObject<DebateCaseSeed>(response.body, onPartial)
    if (result?.object) return result
  } catch (error) {
    console.error('[streamDebateCase] Stream error:', error)
  }
  return { object: buildFallbackDebate(worldView, trigger), source: 'fallback' }
}

export async function getStrategyPlan(worldView: string): Promise<StrategySeed | null> {
  try {
    const response = await fetch('/api/agent/object', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'strategy',
        worldView,
      }),
    })
    if (!response.ok) throw new Error('strategy object request failed')
    const data = await response.json()
    if (data?.object) return data.object as StrategySeed
  } catch {
    // ignore and fallback
  }
  return buildFallbackStrategy(worldView)
}

export async function getNextPlan(
  worldView: string,
  resources: { energy: number; wood: number; stone: number; food: number; water: number },
  threatLevel: string
  , feedback?: string
): Promise<PlannerSeed | null> {
  try {
    const response = await fetch('/api/agent/object', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'planner',
        worldView,
        resources,
        threatLevel,
        feedback: feedback || '',
      }),
    })
    if (!response.ok) throw new Error('planner object request failed')
    const data = await response.json()
    if (data?.object) return data.object as PlannerSeed
  } catch (error) {
    console.error('[getPlannerPlan] Error:', error)
  }
  return buildFallbackPlan(resources, threatLevel)
}

export async function streamNextPlan(
  worldView: string,
  resources: { energy: number; wood: number; stone: number; food: number; water: number },
  threatLevel: string,
  feedback?: string,
  onPartial?: (partial: Partial<PlannerSeed>) => void
): Promise<ObjectDecision<PlannerSeed>> {
  try {
    const response = await fetch('/api/agent/object/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'planner',
        worldView,
        resources,
        threatLevel,
        feedback: feedback || '',
      }),
    })
    if (!response.ok || !response.body) throw new Error('planner stream request failed')
    const result = await readStreamObject<PlannerSeed>(response.body, onPartial)
    if (result?.object) return result
  } catch (error) {
    console.error('[streamNextPlan] Stream error:', error)
  }
  return { object: buildFallbackPlan(resources, threatLevel), source: 'fallback' }
}

export async function streamStrategyPlan(
  worldView: string,
  onPartial?: (partial: Partial<StrategySeed>) => void
): Promise<ObjectDecision<StrategySeed>> {
  try {
    const response = await fetch('/api/agent/object/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'strategy',
        worldView,
      }),
    })
    if (!response.ok || !response.body) throw new Error('strategy stream request failed')
    const result = await readStreamObject<StrategySeed>(response.body, onPartial)
    if (result?.object) return result
  } catch (error) {
    console.error('[streamStrategyPlan] Stream error:', error)
  }
  return { object: buildFallbackStrategy(worldView), source: 'fallback' }
}
