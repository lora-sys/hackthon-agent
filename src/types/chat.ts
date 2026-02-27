export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ParsedIntent {
  intent: 'generate' | 'switch_mode' | 'query' | 'control' | 'help' | 'unknown'
  params: Record<string, unknown>
  confidence: number
  response: string
}
