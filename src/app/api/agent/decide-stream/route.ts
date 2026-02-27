import { NextRequest } from 'next/server'

export const maxDuration = 30

const GAME_MASTER_SYSTEM = `你是游戏 AI，自动游玩地牢探险游戏。

你的职责：
1. 感知当前游戏状态
2. 分析最优行动
3. 返回决策指令

核心原则：
1. 生存第一 - 低血量时使用血瓶
2. 效率探索 - 快速通关
3. 资源管理 - 合理使用血瓶

可用动作：
- move: 移动 (direction: up/down/left/right)
- attack: 攻击敌人
- use_potion: 使用血瓶
- collect: 拾取宝物
- enter_door: 进入房间
- wait: 等待

根据当前状态，返回最优决策。简洁回复，只说做什么和为什么。
格式: [动作] [方向/目标] - [理由]
例如: move right - 靠近宝物
例如: attack - 敌人在攻击范围内
例如: use_potion - 血量过低`

const PROVIDER_CONFIG: Record<string, { baseUrl: string; envKey: string }> = {
  iflow: { baseUrl: 'https://apis.iflow.cn/v1', envKey: 'IFLOW_API_KEY' },
  kimi: { baseUrl: 'https://api.moonshot.cn/v1', envKey: 'KIMI_API_KEY' },
  zhipu: { baseUrl: 'https://open.bigmodel.cn/api/paas/v4', envKey: 'ZHIPU_API_KEY' },
  siliconflow: { baseUrl: 'https://api.siliconflow.cn/v1', envKey: 'SILICONFLOW_API_KEY' },
  stepfun: { baseUrl: 'https://api.stepfun.com/v1', envKey: 'STEPFUN_API_KEY' },
  openai: { baseUrl: 'https://api.openai.com/v1', envKey: 'OPENAI_API_KEY' },
}

interface DecisionOutput {
  action: 'move' | 'attack' | 'use_potion' | 'collect' | 'enter_door' | 'wait'
  direction?: 'up' | 'down' | 'left' | 'right'
  targetId?: string
  reasoning: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { perception, providerId, modelId } = body

    if (!perception || !providerId || !modelId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const config = PROVIDER_CONFIG[providerId]
    if (!config) {
      return new Response(JSON.stringify({ error: `Unknown provider: ${providerId}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const apiKey = process.env[config.envKey]
    if (!apiKey) {
      return new Response(JSON.stringify({ error: `API key not configured` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: GAME_MASTER_SYSTEM },
          { role: 'user', content: perception },
        ],
        temperature: 0.7,
        max_tokens: 200,
        stream: true,
      }),
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `API error: ${response.status}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const encoder = new TextEncoder()
    const reader = response.body?.getReader()
    
    if (!reader) {
      return new Response(JSON.stringify({ error: 'No response body' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let fullText = ''
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'))
            
            for (const line of lines) {
              const data = line.replace('data:', '').trim()
              if (data === '[DONE]') continue
              
              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content || ''
                if (content) {
                  fullText += content
                  controller.enqueue(encoder.encode(JSON.stringify({ type: 'token', content }) + '\n'))
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
          
          const decision = parseDecisionFromText(fullText)
          controller.enqueue(encoder.encode(JSON.stringify({ 
            type: 'done', 
            text: fullText, 
            decision 
          }) + '\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

function parseDecisionFromText(text: string): DecisionOutput {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('attack') || lowerText.includes('攻击')) {
    return { action: 'attack', reasoning: '⚔️ AI: 攻击敌人' }
  }
  if (lowerText.includes('potion') || lowerText.includes('血瓶') || lowerText.includes('恢复') || lowerText.includes('治疗')) {
    return { action: 'use_potion', reasoning: '💊 AI: 使用血瓶恢复' }
  }
  if (lowerText.includes('collect') || lowerText.includes('拾取') || lowerText.includes('宝物') || lowerText.includes('金币')) {
    return { action: 'collect', reasoning: '💰 AI: 拾取宝物' }
  }
  if (lowerText.includes('enter') || lowerText.includes('进入') || lowerText.includes('门')) {
    return { action: 'enter_door', reasoning: '🚪 AI: 进入房间' }
  }
  if (lowerText.includes('up') || lowerText.includes('上')) {
    return { action: 'move', direction: 'up', reasoning: '🚶 AI: 向上移动' }
  }
  if (lowerText.includes('down') || lowerText.includes('下')) {
    return { action: 'move', direction: 'down', reasoning: '🚶 AI: 向下移动' }
  }
  if (lowerText.includes('left') || lowerText.includes('左')) {
    return { action: 'move', direction: 'left', reasoning: '🚶 AI: 向左移动' }
  }
  if (lowerText.includes('right') || lowerText.includes('右')) {
    return { action: 'move', direction: 'right', reasoning: '🚶 AI: 向右移动' }
  }
  
  const directions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right']
  const randomDir = directions[Math.floor(Math.random() * directions.length)]
  return { action: 'move', direction: randomDir, reasoning: '🔍 AI: 探索移动' }
}
