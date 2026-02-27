import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

export const zhipu = createOpenAICompatible({
  name: 'Zhipu',
  apiKey: process.env.ZHIPU_API_KEY || '',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
})

export const ZHIPU_MODELS = {
  'glm-4-plus': { name: 'GLM-4 Plus', maxTokens: 128000, supportsVision: true },
  'glm-4-flash': { name: 'GLM-4 Flash', maxTokens: 128000, supportsVision: false },
  'glm-4v-plus': { name: 'GLM-4V Plus', maxTokens: 128000, supportsVision: true },
}
