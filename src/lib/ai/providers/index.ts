import type { LanguageModel } from 'ai'
import { iflow } from './iflow'
import { kimi } from './kimi'
import { zhipu } from './zhipu'
import { siliconflow } from './siliconflow'
import type { ProviderInfo, ModelInfo } from './types'
import { IFLOW_MODELS } from './iflow'
import { KIMI_MODELS } from './kimi'
import { ZHIPU_MODELS } from './zhipu'
import { SILICONFLOW_MODELS } from './siliconflow'

export const PROVIDERS: ProviderInfo[] = [
  {
    id: 'iflow',
    name: 'iFlow AI',
    envKey: 'IFLOW_API_KEY',
    baseUrl: 'https://apis.iflow.cn/v1',
    models: Object.entries(IFLOW_MODELS).map(([id, info]) => ({
      id,
      name: info.name,
      maxTokens: info.maxTokens,
      supportsVision: info.supportsVision,
    })),
  },
  {
    id: 'kimi',
    name: '月之暗面 (Kimi)',
    envKey: 'KIMI_API_KEY',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: Object.entries(KIMI_MODELS).map(([id, info]) => ({
      id,
      name: info.name,
      maxTokens: info.maxTokens,
      supportsVision: info.supportsVision,
    })),
  },
  {
    id: 'zhipu',
    name: '智谱 (Zhipu)',
    envKey: 'ZHIPU_API_KEY',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: Object.entries(ZHIPU_MODELS).map(([id, info]) => ({
      id,
      name: info.name,
      maxTokens: info.maxTokens,
      supportsVision: info.supportsVision,
    })),
  },
  {
    id: 'siliconflow',
    name: '硅基流动',
    envKey: 'SILICONFLOW_API_KEY',
    baseUrl: 'https://api.siliconflow.cn/v1',
    models: Object.entries(SILICONFLOW_MODELS).map(([id, info]) => ({
      id,
      name: info.name,
      maxTokens: info.maxTokens,
      supportsVision: info.supportsVision,
    })),
  },
]

const providers: Record<string, (modelId: string) => LanguageModel> = {
  iflow,
  kimi,
  zhipu,
  siliconflow,
}

export function getModel(providerId: string, modelId: string): LanguageModel {
  const provider = providers[providerId]
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`)
  }
  return provider(modelId)
}

export function getProviderById(id: string): ProviderInfo | undefined {
  return PROVIDERS.find((p) => p.id === id)
}

export function getModelsByProvider(providerId: string): ModelInfo[] {
  const provider = getProviderById(providerId)
  return provider?.models || []
}

export * from './types'
export { iflow, kimi, zhipu, siliconflow }
