import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

const NAVIGATOR_SYSTEM = `你是导航 AI，负责探索策略。

你的职责：
1. 分析地图和房间布局
2. 决定最优探索路线
3. 识别优先探索的目标

输出格式：简洁的一句话建议
例如: "建议优先探索宝物房" 或 "建议前往下一层"`

const BATTLE_SYSTEM = `你是战斗 AI，负责战斗策略。

你的职责：
1. 分析敌人强度
2. 决定是否战斗
3. 推荐战斗方式

输出格式：简洁的一句话建议
例如: "敌人较弱，可直接攻击" 或 "建议先回避，恢复后再战"`

const PROVIDER_CONFIG: Record<string, { baseUrl: string; envKey: string }> = {
  iflow: { baseUrl: 'https://apis.iflow.cn/v1', envKey: 'IFLOW_API_KEY' },
  kimi: { baseUrl: 'https://api.moonshot.cn/v1', envKey: 'KIMI_API_KEY' },
  zhipu: { baseUrl: 'https://open.bigmodel.cn/api/paas/v4', envKey: 'ZHIPU_API_KEY' },
}

async function callAgent(
  systemPrompt: string,
  perception: string,
  providerId: string,
  modelId: string
): Promise<string> {
  const config = PROVIDER_CONFIG[providerId]
  if (!config) throw new Error(`Unknown provider: ${providerId}`)
  
  const apiKey = process.env[config.envKey]
  if (!apiKey) throw new Error(`API key not configured for ${providerId}`)

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: perception },
      ],
      temperature: 0.7,
      max_tokens: 100,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { perception, providerId, modelId } = body

    if (!perception || !providerId || !modelId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const config = PROVIDER_CONFIG[providerId]
    if (!config) {
      return NextResponse.json({ error: `Unknown provider: ${providerId}` }, { status: 400 })
    }

    const apiKey = process.env[config.envKey]
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const [navigatorResult, battleResult] = await Promise.all([
      callAgent(NAVIGATOR_SYSTEM, perception, providerId, modelId).catch(e => `导航分析失败: ${e.message}`),
      callAgent(BATTLE_SYSTEM, perception, providerId, modelId).catch(e => `战斗分析失败: ${e.message}`),
    ])

    return NextResponse.json({
      navigator: navigatorResult,
      battle: battleResult,
      provider: providerId,
      model: modelId,
    })
  } catch (error) {
    console.error('[Multi Agent] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
