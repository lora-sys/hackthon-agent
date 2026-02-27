import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

export const iflow = createOpenAICompatible({
  name: 'iFlow',
  apiKey: process.env.IFLOW_API_KEY || '',
  baseURL: 'https://apis.iflow.cn/v1',
})

export const IFLOW_MODELS = {
  'qwen3-max-preview': { name: 'Qwen3 Max Preview', maxTokens: 128000, supportsVision: false },
  'qwen3-coder-plus': { name: 'Qwen3 Coder Plus', maxTokens: 128000, supportsVision: false },
  'kimi-k2-0905': { name: 'Kimi K2 0905', maxTokens: 200000, supportsVision: true },
  'glm-4.6': { name: 'GLM-4.6', maxTokens: 128000, supportsVision: true },
}
