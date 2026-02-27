'use client'

import { motion } from 'framer-motion'

interface ModelStat {
  total: number
  model: number
  fallback: number
  avgLatencyMs: number
  lastLatencyMs: number
}

interface ModelStatsPanelProps {
  debate: ModelStat
  planner: ModelStat
  strategy: ModelStat
  lastDebateSource?: string
  lastDebateModel?: string
  lastPlannerSource?: string
  lastPlannerModel?: string
  lastStrategySource?: string
  lastStrategyModel?: string
  lastError?: string
}

function StatRow({
  label,
  stat,
  source,
  model,
  error,
}: {
  label: string
  stat: ModelStat
  source?: string
  model?: string
  error?: string
}) {
  const successRate = stat.total > 0 ? Math.round((stat.model / stat.total) * 100) : 0
  const isHealthy = successRate >= 50
  const isModel = source === 'model'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-[#6b6b8a] uppercase">{label}</span>
        <div className="flex items-center gap-2">
          {model && <span className="text-[#4a4a5a]">{model}</span>}
          <span className={isHealthy ? 'text-[#00ff87]' : 'text-[#ff4d6d]'}>
            {successRate}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isHealthy
                ? 'linear-gradient(90deg, #00f5d4, #00ff87)'
                : 'linear-gradient(90deg, #ff4d6d, #ff9500)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${successRate}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-[9px]">
        <span className={isModel ? 'text-[#00f5d4]' : 'text-[#ff9500]'}>
          {source?.toUpperCase() || 'N/A'}
        </span>
        <span className="text-[#4a4a5a]">
          {stat.lastLatencyMs > 0 ? `${stat.lastLatencyMs}ms` : '--'} / avg{' '}
          {stat.avgLatencyMs > 0 ? `${stat.avgLatencyMs}ms` : '--'}
        </span>
      </div>
      {error && (
        <div className="text-[9px] text-[#ff4d6d] truncate" title={error}>
          ✕ {error}
        </div>
      )}
    </div>
  )
}

export function ModelStatsPanel({
  debate,
  planner,
  strategy,
  lastDebateSource,
  lastDebateModel,
  lastPlannerSource,
  lastPlannerModel,
  lastStrategySource,
  lastStrategyModel,
  lastError,
}: ModelStatsPanelProps) {
  const totalCalls = debate.total + planner.total + strategy.total
  const modelCalls = debate.model + planner.model + strategy.model
  const overallSuccess = totalCalls > 0 ? Math.round((modelCalls / totalCalls) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#9aa0aa] uppercase tracking-wider">
          Model Health
        </span>
        <div className="flex items-center gap-2">
          <motion.span
            className="text-[10px]"
            style={{
              color: overallSuccess >= 50 ? '#00ff87' : '#ff4d6d',
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {overallSuccess}%
          </motion.span>
        </div>
      </div>

      <div className="space-y-3">
        <StatRow
          label="Debate"
          stat={debate}
          source={lastDebateSource}
          model={lastDebateModel}
          error={lastError?.includes('debate') ? lastError : undefined}
        />
        <StatRow
          label="Strategy"
          stat={strategy}
          source={lastStrategySource}
          model={lastStrategyModel}
          error={lastError?.includes('strategy') ? lastError : undefined}
        />
        <StatRow
          label="Planner"
          stat={planner}
          source={lastPlannerSource}
          model={lastPlannerModel}
          error={lastError?.includes('planner') ? lastError : undefined}
        />
      </div>

      {totalCalls > 0 && (
        <div className="pt-2 border-t border-white/10">
          <div className="text-[9px] text-[#4a4a5a]">
            Total: {modelCalls}/{totalCalls} model calls · Avg latency:{' '}
            {Math.round((debate.avgLatencyMs + planner.avgLatencyMs + strategy.avgLatencyMs) / 3) || '--'}ms
          </div>
        </div>
      )}
    </motion.div>
  )
}
