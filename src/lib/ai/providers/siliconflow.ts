import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

export const siliconflow = createOpenAICompatible({
  name: 'SiliconFlow',
  apiKey: process.env.SILICONFLOW_API_KEY || '',
  baseURL: 'https://api.siliconflow.cn/v1',
})

export const SILICONFLOW_MODELS = {
  'deepseek-ai/DeepSeek-R1': { name: 'DeepSeek R1', maxTokens: 32000, supportsVision: false },
  'deepseek-ai/DeepSeek-V3': { name: 'DeepSeek V3', maxTokens: 64000, supportsVision: false },
  'Qwen/Qwen2.5-72B-Instruct': { name: 'Qwen2.5 72B', maxTokens: 32000, supportsVision: false },
}
