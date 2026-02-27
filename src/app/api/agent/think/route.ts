import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const siliconflowApiKey = process.env.SILICONFLOW_API_KEY || process.env.ILICONFLOW_API_KEY || ''
const useSiliconOnly =
  process.env.AGENT_PROVIDER_FORCE === 'siliconflow' ||
  (Boolean(siliconflowApiKey) && process.env.ALLOW_IFLOW_FALLBACK !== '1')

interface ProviderConfig {
  id: string
  baseURL: string
  apiKey: string
  models: string[]
}

const providers: ProviderConfig[] = [
  {
    id: 'siliconflow',
    baseURL: 'https://api.siliconflow.cn/v1',
    apiKey: siliconflowApiKey,
    models: ['Qwen/Qwen2.5-7B-Instruct', 'deepseek-ai/DeepSeek-V3'],
  },
  {
    id: 'iflow',
    baseURL: 'https://apis.iflow.cn/v1',
    apiKey: process.env.IFLOW_API_KEY || '',
    models: ['qwen3-max-preview', 'qwen3-coder-plus'],
  },
  {
    id: 'qiniu',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: process.env.QINIU_API_KEY || '',
    models: ['qwen-turbo'],
  },
  {
    id: 'zhipu',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: process.env.ZHIPU_API_KEY || '',
    models: ['glm-4-flash'],
  },
]
  .filter(p => p.apiKey)
  .filter(p => !(useSiliconOnly && p.id === 'iflow'))

const DEFAULT_MODEL = 'Qwen/Qwen2.5-7B-Instruct'

interface ChatPayloadMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

async function callProvider(
  provider: ProviderConfig,
  model: string,
  messages: ChatPayloadMessage[],
  temperature?: number,
  maxTokens?: number,
  stream?: boolean
) {
  const response = await fetch(`${provider.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 4000,
      stream: stream || false,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`Provider ${provider.id} failed: ${response.status}`)
  }
  
  return response
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider: requestedProvider, modelId, messages, temperature, maxTokens, stream } = body as {
      provider?: string
      modelId?: string
      messages: ChatPayloadMessage[]
      temperature?: number
      maxTokens?: number
      stream?: boolean
    }

    // Smart provider selection with fallback
    const providersToTry = requestedProvider && requestedProvider !== 'auto'
      ? providers.filter(p => p.id === requestedProvider)
      : providers

    if (providersToTry.length === 0) {
      return NextResponse.json({ error: 'No providers available' }, { status: 500 })
    }

    let lastError: Error | null = null
    
    for (const provider of providersToTry) {
      const model = modelId || provider.models[0] || DEFAULT_MODEL
      
      try {
        const fetchResponse = await callProvider(provider, model, messages, temperature, maxTokens, stream)

        // Handle streaming
        if (stream) {
          const streamResult = new ReadableStream({
            async start(controller) {
              const reader = fetchResponse.body?.getReader()
              if (!reader) {
                controller.close()
                return
              }
              try {
                while (true) {
                  const { done, value } = await reader.read()
                  if (done) break
                  controller.enqueue(value)
                }
              } catch {
                // Ignore errors
              } finally {
                controller.close()
              }
            },
          })
          
          return new NextResponse(streamResult, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
              'X-Provider': provider.id,
            },
          })
        }

        const data = await fetchResponse.json()
        const content = data.choices?.[0]?.message?.content || ''

        return NextResponse.json({ content, provider: provider.id, model })
      } catch (error) {
        lastError = error as Error
        console.error(`Provider ${provider.id} failed, trying next...`, error)
        continue
      }
    }

    // All providers failed
    return NextResponse.json(
      { error: `All providers failed. Last error: ${lastError?.message}` },
      { status: 503 }
    )
  } catch (error) {
    console.error('AI think error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
