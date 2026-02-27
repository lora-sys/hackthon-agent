'use client'

import { useState } from 'react'

type CommandType = 'mission' | 'suggest' | 'command' | 'vote' | 'adjust'

interface InterventionPanelProps {
  onExecute: (commandType: CommandType, value: string) => void
  disabled?: boolean
}

const COMMAND_TYPES: { type: CommandType; label: string; color: string }[] = [
  { type: 'mission', label: '📋 MISSION', color: '#00f5d4' },
  { type: 'suggest', label: '💡 SUGGEST', color: '#00ff87' },
  { type: 'command', label: '⚡ COMMAND', color: '#ff9500' },
  { type: 'vote', label: '🗳️ VOTE', color: '#9d4edd' },
  { type: 'adjust', label: '🔧 ADJUST', color: '#ff006e' },
]

const SUGGESTIONS = [
  '建议优先建造庇护所',
  'NOVA 去探索新区域',
  '我们需要储备更多资源',
  'ALEX 负责食物供给',
  '开会讨论下一步计划',
  '提高水资源使用效率',
]

export function InterventionPanel({ onExecute, disabled = false }: InterventionPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const [commandType, setCommandType] = useState<CommandType>('command')

  const handleExecute = () => {
    if (!inputValue.trim() || disabled) return
    onExecute(commandType, inputValue.trim())
    setInputValue('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (disabled) return
    setInputValue(suggestion)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="干预类型">
        {COMMAND_TYPES.map(({ type, label, color }) => (
          <button
            key={type}
            onClick={() => setCommandType(type)}
            disabled={disabled}
            className={`px-2 py-1 text-[10px] font-bold rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a12] ${
              commandType === type
                ? 'text-[#050508]'
                : 'text-[#6b6b8a] hover:text-[#e8e8f0]'
            }`}
            style={{
              backgroundColor: commandType === type ? color : 'transparent',
              border: commandType === type ? 'none' : `1px solid ${color}40`,
            }}
            role="tab"
            aria-selected={commandType === type}
            aria-label={label}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
          placeholder="输入干预或争论议题..."
          disabled={disabled}
          className="w-full px-3 py-2 text-xs text-[#e8e8f0] bg-[#050508]/60 border border-white/10 rounded-lg placeholder:text-[#6b6b8a] focus:outline-none focus:border-[#00f5d4]/50 disabled:opacity-50"
          aria-label="干预输入"
        />

        <div className="flex gap-2 flex-wrap">
          {SUGGESTIONS.slice(0, 3).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={disabled}
              className="px-2 py-1 text-[9px] text-[#6b6b8a] border border-white/10 rounded hover:border-[#00f5d4]/30 hover:text-[#00f5d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[#00f5d4]/50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <button
          onClick={handleExecute}
          disabled={!inputValue.trim() || disabled}
          className="w-full py-2 text-xs font-bold text-[#050508] bg-[#00f5d4] rounded-lg hover:bg-[#00f5d4]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00f5d4]/50"
        >
          EXECUTE
        </button>
      </div>
    </div>
  )
}
