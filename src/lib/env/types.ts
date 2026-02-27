export type ToolName =
  | 'fetchResource'
  | 'buildModule'
  | 'surveyArea'
  | 'optimizeEnergy'
  | 'treatInjuries'

export interface ToolCall {
  name: ToolName
  params: Record<string, string | number>
}

export interface ExecutePayload {
  action: { title: string; owner: string; priority: number }
  tool: ToolCall
  fallbackTool?: ToolCall
  compensation?: ToolCall
  resources: {
    energy: number
    wood: number
    stone: number
    food: number
    water: number
  }
}

export interface ExecuteResult {
  success: boolean
  outcome: string
  appliedImpact: Partial<ExecutePayload['resources']>
  threatShift: 'up' | 'down' | 'stable'
  usedTool: ToolName
}

export interface EnvAdapter {
  validate(payload: ExecutePayload): { ok: boolean; reason?: string }
  execute(payload: ExecutePayload): Promise<ExecuteResult>
  compensate?(payload: ExecutePayload, result: ExecuteResult): Promise<void>
}
