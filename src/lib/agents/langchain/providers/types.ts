export interface ProviderConfig {
  id: string
  name: string
  envKey: string
  baseUrl: string
  models: string[]
  defaultModel: string
}

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  iflow: {
    id: 'iflow',
    name: 'iFlow AI',
    envKey: 'IFLOW_API_KEY',
    baseUrl: 'https://apis.iflow.cn/v1',
    models: ['qwen3-max-preview', 'qwen3-plus'],
    defaultModel: 'qwen3-max-preview',
  },
  kimi: {
    id: 'kimi',
    name: '月之暗面',
    envKey: 'KIMI_API_KEY',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k'],
    defaultModel: 'moonshot-v1-8k',
  },
  zhipu: {
    id: 'zhipu',
    name: '智谱 AI',
    envKey: 'ZHIPU_API_KEY',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4-flash', 'glm-4-plus'],
    defaultModel: 'glm-4-flash',
  },
  siliconflow: {
    id: 'siliconflow',
    name: '硅基流动',
    envKey: 'SILICONFLOW_API_KEY',
    baseUrl: 'https://api.siliconflow.cn/v1',
    models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-7B-Instruct'],
    defaultModel: 'deepseek-ai/DeepSeek-V3',
  },
}