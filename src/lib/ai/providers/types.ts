import type { LanguageModel } from 'ai'

export interface ProviderInfo {
  id: string
  name: string
  envKey: string
  baseUrl: string
  models: ModelInfo[]
}

export interface ModelInfo {
  id: string
  name: string
  maxTokens: number
  supportsVision: boolean
}

export interface ProviderConfig {
  providerId: string
  modelId: string
}

export type ModelGetter = (providerId: string, modelId: string) => LanguageModel
