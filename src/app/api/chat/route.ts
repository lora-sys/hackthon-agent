import { NextRequest, NextResponse } from 'next/server'
import type { ParsedIntent, ChatMessage } from '@/types/chat'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history } = body as { message: string; history?: ChatMessage[] }

    const apiKey = process.env.IFLOW_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const systemPrompt = `你是 ArtFlow 游戏助手。分析用户的意图并执行相应操作。

支持的操作类型：
1. generate - 生成地图
   参数: style(风格: dungeon/space/forest等), layers(层数1-5), roomsPerLayer(每层房间数3-10), difficulty(easy/medium/hard)
   
2. switch_mode - 切换游戏模式
   参数: mode(player/agent)
   
3. query - 查询游戏状态
   参数: target(status/map/player/room)
   
4. control - 控制角色(仅在agent模式下)
   参数: action(move/attack/use_item/dodge), direction(up/down/left/right), target, itemId
   
5. help - 显示帮助信息

风格列表: dungeon(地牢), space(太空站), forest(森林), factory(工厂), battlefield(战场), island(海岛), volcano(火山), circus(马戏团), alien(外星), roman(古罗马)

返回JSON格式：
{
  "intent": "操作类型",
  "params": {参数对象},
  "confidence": 0.0-1.0,
  "response": "给用户的友好回复"
}

示例：
用户: "生成一个简单的地牢"
返回: {"intent":"generate","params":{"style":"dungeon","difficulty":"easy"},"confidence":0.95,"response":"好的，我来为你生成一个简单的地牢地图！"}

用户: "让AI来玩"
返回: {"intent":"switch_mode","params":{"mode":"agent"},"confidence":0.98,"response":"已切换到 Agent 自动游玩模式，AI 将控制角色进行游戏。"}

用户: "现在什么状态"
返回: {"intent":"query","params":{"target":"status"},"confidence":0.9,"response":"让我查看一下当前游戏状态..."}

只返回JSON，不要有其他内容。`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-5).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://apis.iflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen3-max-preview',
        messages,
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API error:', errorText)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await response.json()
    const aiContent = data.choices?.[0]?.message?.content || ''

    let parsedIntent: ParsedIntent
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedIntent = JSON.parse(jsonMatch[0])
      } else {
        parsedIntent = {
          intent: 'unknown',
          params: {},
          confidence: 0,
          response: aiContent,
        }
      }
    } catch {
      parsedIntent = {
        intent: 'unknown',
        params: {},
        confidence: 0,
        response: aiContent,
      }
    }

    const action = await executeAction(parsedIntent)

    return NextResponse.json({
      response: parsedIntent.response,
      intent: parsedIntent.intent,
      action,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function executeAction(intent: ParsedIntent) {
  const action = {
    type: intent.intent,
    params: intent.params,
    result: undefined as { success: boolean; data?: unknown; error?: string } | undefined,
  }

  if (intent.confidence < 0.5) {
    action.result = {
      success: false,
      error: '意图识别置信度过低',
    }
    return action
  }

  switch (intent.intent) {
    case 'generate':
      try {
        const { style = 'dungeon', layers = 3, roomsPerLayer = 6, difficulty = 'medium' } = intent.params
        const response = await fetch('http://localhost:3000/api/map/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ style, layers, roomsPerLayer, difficulty }),
        })
        const data = await response.json()
        action.result = {
          success: response.ok,
          data: { mapId: data.id, roomCount: data.layers?.reduce((acc: number, l: { rooms: unknown[] }) => acc + l.rooms.length, 0) },
          error: response.ok ? undefined : data.error,
        }
      } catch {
        action.result = { success: false, error: '地图生成失败' }
      }
      break

    case 'switch_mode':
      action.result = {
        success: true,
        data: { mode: intent.params.mode },
      }
      break

    case 'query':
      action.result = {
        success: true,
        data: { target: intent.params.target },
      }
      break

    case 'help':
      action.result = {
        success: true,
        data: {
          commands: [
            '生成地图: "生成一个[简单/中等/困难]的[风格]地图"',
            '切换模式: "让AI来玩" / "我自己玩"',
            '查询状态: "现在什么状态"',
            '风格列表: 地牢、太空站、森林、工厂、战场、海岛、火山、马戏团、外星、古罗马',
          ],
        },
      }
      break

    default:
      action.result = { success: true }
  }

  return action
}
