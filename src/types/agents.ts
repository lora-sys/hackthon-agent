export type ProviderId =
  | 'iflow'
  | 'commonstack'
  | 'kimi'
  | 'youware'
  | 'qiniu'
  | 'zhipu'
  | 'siliconflow'
  | 'stepfun'
  | 'anthropic'
  | 'openai'
  | 'google'

export interface ModelDefinition {
  id: string
  name: string
  provider: ProviderId | string
  maxTokens: number
  supportsVision: boolean
  supportsStreaming: boolean
}

export interface ProviderConfig {
  id: ProviderId | string
  name: string
  envKey: string
  baseUrl?: string
  models: ModelDefinition[]
}

export interface AgentConfig {
  id: string
  name: string
  description: string
  provider: ProviderId | string
  modelId: string
  temperature: number
  maxTokens: number
  systemPrompt: string
}

export interface MultiAgentConfig {
  global: {
    defaultProvider: ProviderId | string
    defaultModel: string
  }
  agents: Record<string, AgentConfig>
}
