'use client'

import { motion } from 'framer-motion'
import type { PlannerAction } from '@/stores/worldStore'

export function ExecutionBoard({
  actions,
  executorStatus,
  feedback,
  agentMode,
}: {
  actions: PlannerAction[]
  executorStatus: 'idle' | 'running' | 'error'
  feedback: string[]
  agentMode: 'model' | 'degraded'
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] text-[#6b6b8a]">
        <span>执行状态</span>
        <span className={executorStatus === 'running' ? 'text-[#00f5d4]' : executorStatus === 'error' ? 'text-[#ff4d6d]' : 'text-[#6b6b8a]'}>
          {executorStatus === 'running' ? '运行中' : executorStatus === 'error' ? '异常' : '空闲'}
        </span>
      </div>

      <div className="space-y-2">
        {agentMode === 'degraded' && actions.length === 0 && (
          <div className="border border-[#ff9500]/25 rounded-md p-2 bg-[#2a1a0b]/30">
            <div className="text-[10px] text-[#ff9500] mb-2">DEGRADED 可见进度</div>
            <div className="space-y-1.5">
              <motion.div
                className="h-1.5 rounded bg-[#ff9500]/20"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <motion.div
                className="h-1.5 rounded bg-[#ff9500]/15 w-4/5"
                animate={{ opacity: [0.25, 0.7, 0.25] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="h-1.5 rounded bg-[#ff9500]/10 w-3/5"
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.35 }}
              />
            </div>
          </div>
        )}
        {actions.length === 0 && (
          <div className="text-[11px] text-[#6b6b8a]">等待 Planner 下发动作</div>
        )}
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-white/10 rounded-md p-2 bg-[#050508]/40"
          >
            <div className="flex items-center justify-between text-[11px] text-[#e8e8f0]">
              <span>{action.title}</span>
              <span className="text-[10px] text-[#6b6b8a]">P{action.priority} · {action.tool.name}</span>
            </div>
            <div className="mt-1 text-[10px] text-[#6b6b8a]">{action.ownerName} · {action.rationale}</div>
            <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${action.progress}%`, background: action.status === 'done' ? '#00ff87' : action.status === 'failed' ? '#ff4d6d' : '#00f5d4' }}
              />
            </div>
            {action.outcome && (
              <div className="mt-1 text-[10px] text-[#9aa0aa]">结果：{action.outcome}</div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-2">
        <div className="text-[11px] text-[#6b6b8a] mb-2">最新反馈</div>
        {feedback.length === 0 && (
          <div className="text-[11px] text-[#6b6b8a]">等待执行反馈</div>
        )}
        {feedback.slice(-2).map((item, index) => (
          <div key={`${item}-${index}`} className="text-[10px] text-[#9aa0aa] mb-1">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
