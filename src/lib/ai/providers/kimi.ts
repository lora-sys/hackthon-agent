import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

export const kimi = createOpenAICompatible({
  name: 'Kimi',
  apiKey: process.env.KIMI_API_KEY || '',
  baseURL: 'https://api.moonshot.cn/v1',
})

export const KIMI_MODELS = {
  'kimi-k2-5': { name: 'Kimi K2.5', maxTokens: 200000, supportsVision: true },
  'kimi-k1-5': { name: 'Kimi K1.5', maxTokens: 128000, supportsVision: false },
  'kimi-plus': { name: 'Kimi Plus', maxTokens: 128000, supportsVision: false },
}
