import { NextRequest, NextResponse } from 'next/server'
import { createGameAgent, type AgentConfig } from '@/lib/agents/langchain'
import { PROVIDER_CONFIGS } from '@/lib/agents/langchain/providers/types'
import type { Perception } from '@/lib/agents/langchain/schemas/decisionSchema'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { perception, providerId, modelId } = body as {
      perception: Perception
      providerId: string
      modelId: string
    }

    if (!perception || !providerId || !modelId) {
      return NextResponse.json(
        { error: 'Missing required fields: perception, providerId, modelId' },
        { status: 400 }
      )
    }

    const providerConfig = PROVIDER_CONFIGS[providerId]
    if (!providerConfig) {
      return NextResponse.json(
        { error: `Unknown provider: ${providerId}. Available: ${Object.keys(PROVIDER_CONFIGS).join(', ')}` },
        { status: 400 }
      )
    }

    const apiKey = process.env[providerConfig.envKey]
    if (!apiKey) {
      console.error(`[Decide V2] API key not found for provider: ${providerId}`)
      return NextResponse.json(
        { error: `API key not configured for provider: ${providerId}` },
        { status: 500 }
      )
    }

    console.log(`[Decide V2] Using ${providerId}/${modelId} with LangChain`)

    const agentConfig: AgentConfig = {
      providerId,
      modelId,
      apiKey,
      maxRetries: 2,
      fallbackToRules: true,
    }

    const agent = createGameAgent(agentConfig)
    const result = await agent.run(perception)

    console.log(`[Decide V2] Result: ${result.action.type} (fallback: ${result.usedFallback})`)

    return NextResponse.json({
      success: true,
      decision: result.decision,
      action: result.action,
      reasoning: result.reasoning,
      usedFallback: result.usedFallback,
      perceptionSummary: result.perceptionSummary,
      provider: providerId,
      model: modelId,
    })
  } catch (error) {
    console.error('[Decide V2] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
