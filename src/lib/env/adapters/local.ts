import type { EnvAdapter, ExecutePayload, ExecuteResult, ToolCall } from '../types'

type ResourceKey = keyof ExecutePayload['resources']

function executeTool(tool: ToolCall, resources: ExecutePayload['resources']): ExecuteResult {
  let success = true
  let outcome = '执行完成'
  let threatShift: ExecuteResult['threatShift'] = 'stable'
  let appliedImpact: Partial<ExecutePayload['resources']> = {}

  switch (tool.name) {
    case 'fetchResource': {
      const resource = tool.params?.resource as ResourceKey
      const amount = Math.max(1, Math.min(8, Number(tool.params?.amount || 1)))
      if (!resource) {
        success = false
        outcome = '资源类型缺失'
        threatShift = 'up'
        break
      }
      appliedImpact = { [resource]: amount, energy: -1 }
      threatShift = 'down'
      break
    }
    case 'buildModule': {
      const wood = Math.max(0, Math.min(6, Number(tool.params?.wood || 0)))
      const stone = Math.max(0, Math.min(6, Number(tool.params?.stone || 0)))
      if (resources.wood < wood || resources.stone < stone) {
        success = false
        outcome = '材料不足，建造失败'
        threatShift = 'up'
        break
      }
      appliedImpact = { wood: -wood, stone: -stone, energy: 1 }
      threatShift = 'down'
      break
    }
    case 'surveyArea': {
      appliedImpact = { energy: -1, food: 1 }
      threatShift = tool.params?.focus === 'threat' ? 'down' : 'stable'
      break
    }
    case 'optimizeEnergy': {
      appliedImpact = { energy: 3, wood: -1 }
      threatShift = 'down'
      break
    }
    case 'treatInjuries': {
      const food = Math.max(0, Math.min(3, Number(tool.params?.food || 0)))
      const water = Math.max(0, Math.min(3, Number(tool.params?.water || 0)))
      if (resources.food < food || resources.water < water) {
        success = false
        outcome = '补给不足，治疗中断'
        threatShift = 'up'
        break
      }
      appliedImpact = { food: -food, water: -water, energy: 1 }
      threatShift = 'down'
      break
    }
    default: {
      success = false
      outcome = '未知工具'
      threatShift = 'up'
      break
    }
  }

  return {
    success,
    outcome,
    appliedImpact,
    threatShift,
    usedTool: tool.name,
  }
}

export const localEnvAdapter: EnvAdapter = {
  validate(payload) {
    if (!payload.tool?.name) return { ok: false, reason: '工具缺失' }
    return { ok: true }
  },
  async execute(payload) {
    const base = executeTool(payload.tool, payload.resources)
    if (base.success) return base

    if (payload.fallbackTool) {
      const fallback = executeTool(payload.fallbackTool, payload.resources)
      if (fallback.success) {
        return {
          ...fallback,
          outcome: `fallback: ${fallback.outcome}`,
        }
      }
    }

    return base
  },
  async compensate(payload, result) {
    if (!payload.compensation || result.success) return
    executeTool(payload.compensation, payload.resources)
  },
}
