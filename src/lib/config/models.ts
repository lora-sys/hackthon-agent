import type { ProviderConfig, ModelDefinition } from '@/types/agents'

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'iflow',
    name: 'iFlow AI',
    envKey: 'IFLOW_API_KEY',
    baseUrl: 'https://apis.iflow.cn/v1',
    models: [
      { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'iflow', maxTokens: 64000, supportsVision: false, supportsStreaming: true },
      { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'iflow', maxTokens: 64000, supportsVision: false, supportsStreaming: true },
      { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'iflow', maxTokens: 64000, supportsVision: false, supportsStreaming: true },
      { id: 'qwen3-max', name: 'Qwen3 Max', provider: 'iflow', maxTokens: 1000000, supportsVision: false, supportsStreaming: true },
      { id: 'qwen3-32b', name: 'Qwen3 32B', provider: 'iflow', maxTokens: 131000, supportsVision: false, supportsStreaming: true },
      { id: 'qwen3-coder-plus', name: 'Qwen3 Coder Plus', provider: 'iflow', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
      { id: 'iflow-rome-30ba3b', name: 'iFlow Rome', provider: 'iflow', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
      { id: 'kimi-k2', name: 'Kimi K2', provider: 'iflow', maxTokens: 200000, supportsVision: true, supportsStreaming: true },
      { id: 'glm-4.6', name: 'GLM-4.6', provider: 'iflow', maxTokens: 128000, supportsVision: true, supportsStreaming: true },
    ]
  },
  {
    id: 'commonstack',
    name: 'CommonStack',
    envKey: 'COMMONSTACK_API_KEY',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'commonstack', maxTokens: 128000, supportsVision: true, supportsStreaming: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'commonstack', maxTokens: 128000, supportsVision: true, supportsStreaming: true },
    ]
  },
  {
    id: 'kimi',
    name: '月之暗面 (Kimi)',
    envKey: 'KIMI_API_KEY',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: [
      { id: 'kimi-k2-5', name: 'Kimi K2.5', provider: 'kimi', maxTokens: 200000, supportsVision: true, supportsStreaming: true },
      { id: 'kimi-k1-5', name: 'Kimi K1.5', provider: 'kimi', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
      { id: 'kimi-plus', name: 'Kimi Plus', provider: 'kimi', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
    ]
  },
  {
    id: 'youware',
    name: 'Youware',
    envKey: 'YOUWARE_API_KEY',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'youware', maxTokens: 128000, supportsVision: true, supportsStreaming: true },
    ]
  },
  {
    id: 'qiniu',
    name: '七牛云 (Qiniu)',
    envKey: 'QINIU_API_KEY',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen-max', name: 'Qwen Max', provider: 'qiniu', maxTokens: 32000, supportsVision: false, supportsStreaming: true },
      { id: 'qwen-plus', name: 'Qwen Plus', provider: 'qiniu', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
      { id: 'qwen-turbo', name: 'Qwen Turbo', provider: 'qiniu', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
    ]
  },
  {
    id: 'zhipu',
    name: '智谱 (Zhipu)',
    envKey: 'ZHIPU_API_KEY',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'glm-4.5-flash', name: 'GLM-4.5 Flash (Free)', provider: 'zhipu', maxTokens: 128000, supportsVision: true, supportsStreaming: true },
      { id: 'glm-4-flash', name: 'GLM-4 Flash (Free)', provider: 'zhipu', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
      { id: 'glm-4-plus', name: 'GLM-4 Plus', provider: 'zhipu', maxTokens: 128000, supportsVision: true, supportsStreaming: true },
      { id: 'glm-4v-plus', name: 'GLM-4V Plus', provider: 'zhipu', maxTokens: 128000, supportsVision: true, supportsStreaming: true },
    ]
  },
  {
    id: 'siliconflow',
    name: '硅基流动 (SiliconFlow)',
    envKey: 'SILICONFLOW_API_KEY',
    baseUrl: 'https://api.siliconflow.cn/v1',
    models: [
      { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen2.5 7B (Free)', provider: 'siliconflow', maxTokens: 32000, supportsVision: false, supportsStreaming: true },
      { id: 'Qwen/Qwen2.5-Coder-7B-Instruct', name: 'Qwen2.5 Coder 7B (Free)', provider: 'siliconflow', maxTokens: 32000, supportsVision: false, supportsStreaming: true },
      { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4 9B (Free)', provider: 'siliconflow', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
      { id: 'Qwen/Qwen3-8B', name: 'Qwen3 8B', provider: 'siliconflow', maxTokens: 131000, supportsVision: false, supportsStreaming: true },
      { id: 'deepseek-ai/DeepSeek-V3.2', name: 'DeepSeek V3.2', provider: 'siliconflow', maxTokens: 160000, supportsVision: false, supportsStreaming: true },
      { id: 'Pro/deepseek-ai/DeepSeek-V3.2', name: 'DeepSeek V3.2 Pro', provider: 'siliconflow', maxTokens: 160000, supportsVision: false, supportsStreaming: true },
      { id: 'Pro/zai-org/GLM-4.7', name: 'GLM-4.7 Pro', provider: 'siliconflow', maxTokens: 128000, supportsVision: true, supportsStreaming: true },
      { id: 'sf-deepseek-r1-7b', name: 'DeepSeek R1 7B', provider: 'siliconflow', maxTokens: 32000, supportsVision: false, supportsStreaming: true },
    ]
  },
  {
    id: 'stepfun',
    name: '阶越星辰',
    envKey: 'STEPFUN_API_KEY',
    baseUrl: 'https://api.stepfun.com/v1',
    models: [
      { id: 'step-1-v', name: 'Step 1V', provider: 'stepfun', maxTokens: 128000, supportsVision: true, supportsStreaming: true },
      { id: 'step-2', name: 'Step 2', provider: 'stepfun', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    envKey: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'anthropic', maxTokens: 200000, supportsVision: true, supportsStreaming: true },
      { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', provider: 'anthropic', maxTokens: 200000, supportsVision: true, supportsStreaming: true },
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    envKey: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', maxTokens: 128000, supportsVision: true, supportsStreaming: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', maxTokens: 128000, supportsVision: true, supportsStreaming: true },
      { id: 'o1', name: 'O1', provider: 'openai', maxTokens: 200000, supportsVision: false, supportsStreaming: false },
    ]
  },
  {
    id: 'google',
    name: 'Google',
    envKey: 'GOOGLE_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      { id: 'gemini-2-0-flash', name: 'Gemini 2.0 Flash', provider: 'google', maxTokens: 1000000, supportsVision: true, supportsStreaming: true },
      { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'google', maxTokens: 2000000, supportsVision: true, supportsStreaming: true },
    ]
  },
]

export function getProviderById(id: string): ProviderConfig | undefined {
  return PROVIDERS.find(p => p.id === id)
}

export function getModelsByProvider(providerId: string): ModelDefinition[] {
  const provider = getProviderById(providerId)
  return provider?.models || []
}

export function getModelById(providerId: string, modelId: string): ModelDefinition | undefined {
  const models = getModelsByProvider(providerId)
  return models.find(m => m.id === modelId)
}
