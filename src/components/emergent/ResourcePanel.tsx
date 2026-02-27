'use client'

interface Resource {
  energy: number
  wood: number
  stone: number
  food: number
  water: number
}

type ResourceKey = keyof Resource

interface ResourcePanelProps {
  resources: Resource
  delta?: Partial<Record<ResourceKey, number>>
}

const RESOURCE_CONFIG: { key: ResourceKey; label: string; icon: string }[] = [
  { key: 'energy', label: 'ENERGY', icon: '⚡' },
  { key: 'wood', label: 'WOOD', icon: '🌲' },
  { key: 'stone', label: 'STONE', icon: '🪨' },
  { key: 'food', label: 'FOOD', icon: '🍖' },
  { key: 'water', label: 'WATER', icon: '💧' },
]

export function ResourcePanel({ resources, delta = {} }: ResourcePanelProps) {
  return (
    <div className="space-y-2">
      {RESOURCE_CONFIG.map(({ key, label, icon }) => {
        const value = resources[key]
        const change = delta[key]
        const isPositive = change !== undefined && change > 0
        const isNegative = change !== undefined && change < 0

        return (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#6b6b8a]">{icon}</span>
              <span className="text-[10px] text-[#6b6b8a] uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              {change !== undefined && (
                <span
                  className={`text-[10px] font-bold ${
                    isPositive ? 'text-[#00ff87]' : isNegative ? 'text-[#ff4d6d]' : 'text-[#6b6b8a]'
                  }`}
                >
                  {isPositive ? '+' : ''}{change}
                </span>
              )}
              <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${value}%`,
                    backgroundColor: value > 60 ? '#00ff87' : value > 30 ? '#00f5d4' : '#ff4d6d',
                  }}
                />
              </div>
              <span className="text-[10px] text-[#e8e8f0] w-6 text-right">{value}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
