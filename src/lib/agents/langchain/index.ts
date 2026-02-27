import { ChatOpenAI } from '@langchain/openai'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import type { Perception, Decision, AgentResult } from './schemas/decisionSchema'
import { PROVIDER_CONFIGS } from './providers/types'

export interface AgentConfig {
  providerId: string
  modelId: string
  apiKey: string
  maxRetries?: number
  fallbackToRules?: boolean
}

const SYSTEM_PROMPT = `你是一个游戏AI Agent，需要根据感知做出决策。
你的目标是：在资源有限的环境中，与团队协作生存。

可用行动类型：
- move: 移动到指定位置
- build: 建造或修复设施
- gather: 收集资源
- rest: 休息恢复能量
- explore: 探索新区域
- defend: 防御威胁

决策优先级：
1. 确保生存（食物、水、能量）
2. 维护基础设施
3. 支持团队协作
4. 探索新资源

请根据当前状态做出最优决策。`

export function createGameAgent(config: AgentConfig) {
  const providerConfig = PROVIDER_CONFIGS[config.providerId]
  if (!providerConfig) {
    throw new Error(`Unknown provider: ${config.providerId}`)
  }

  const llm = new ChatOpenAI({
    configuration: {
      baseURL: providerConfig.baseUrl,
    },
    apiKey: config.apiKey,
    modelName: config.modelId,
    temperature: 0.7,
    maxRetries: config.maxRetries || 2,
    timeout: 15000,
  })

  async function run(perception: Perception): Promise<AgentResult> {
    try {
      const perceptionSummary = buildPerceptionSummary(perception)
      
      const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(perceptionSummary),
      ]

      const response = await llm.invoke(messages)
      const content = response.content as string
      
      const decision = parseDecision(content)
      
      return {
        decision,
        action: decision.action,
        reasoning: decision.reasoning,
        usedFallback: false,
        perceptionSummary,
      }
    } catch (error) {
      console.error('[GameAgent] Error:', error)
      
      if (config.fallbackToRules) {
        return createFallbackDecision(perception)
      }
      
      throw error
    }
  }

  return { run }
}

function buildPerceptionSummary(perception: Perception): string {
  const { worldView, resources, threatLevel, agents, currentTask, teamMessages } = perception
  
  return `
当前世界: ${worldView}

资源状态:
- 能量: ${resources.energy}%
- 木材: ${resources.wood}%
- 石材: ${resources.stone}%
- 食物: ${resources.food}%
- 水源: ${resources.water}%

威胁等级: ${threatLevel}

团队状态:
${agents.map(a => `- ${a.name} (${a.role}): ${a.status} 能量:${a.energy}%`).join('\n')}

当前任务: ${currentTask || '无'}

最近团队消息:
${teamMessages.slice(-3).map(m => `${m.speaker}: ${m.content}`).join('\n') || '无'}

请做出你的决策，返回JSON格式：
{
  "action": {
    "type": "行动类型",
    "target": "目标(可选)",
    "parameters": {}
  },
  "reasoning": "决策理由",
  "priority": 1-3,
  "estimatedDuration": 分钟数
}
`.trim()
}

function parseDecision(content: string): Decision {
  try {
    // 尝试从内容中提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      
      return {
        action: {
          type: parsed.action?.type || 'rest',
          target: parsed.action?.target,
          parameters: parsed.action?.parameters || {},
        },
        reasoning: parsed.reasoning || content,
        priority: parsed.priority || 2,
        estimatedDuration: parsed.estimatedDuration || 5,
      }
    }
  } catch {
    // 解析失败，使用默认值
  }
  
  // 默认决策
  return {
    action: {
      type: 'rest',
      parameters: {},
    },
    reasoning: content || '基于当前状态选择休息',
    priority: 2,
    estimatedDuration: 5,
  }
}

function createFallbackDecision(perception: Perception): AgentResult {
  const { resources, threatLevel } = perception
  let actionType: 'gather' | 'rest' | 'defend' = 'rest'
  let reasoning = '使用规则引擎做出决策'
  
  // 简单规则引擎
  if (threatLevel === 'high') {
    actionType = 'defend'
    reasoning = '威胁等级高，选择防御'
  } else if (resources.food < 30) {
    actionType = 'gather'
    reasoning = '食物不足，选择收集食物'
  } else if (resources.energy < 40) {
    actionType = 'rest'
    reasoning = '能量不足，选择休息'
  } else if (resources.wood < 30) {
    actionType = 'gather'
    reasoning = '木材不足，选择收集木材'
  }
  
  return {
    decision: {
      action: {
        type: actionType,
        parameters: {},
      },
      reasoning,
      priority: 2,
      estimatedDuration: 10,
    },
    action: {
      type: actionType,
      parameters: {},
    },
    reasoning,
    usedFallback: true,
    perceptionSummary: '使用规则引擎，未调用 LLM',
  }
}
