'use client'

import { motion } from 'framer-motion'
import type { Agent, CollaborationCase, DebatePoint, NeuralMessage } from '@/stores/worldStore'

const stanceStyles: Record<DebatePoint['stance'], { label: string; color: string }> = {
  support: { label: '支持', color: '#00ff87' },
  oppose: { label: '反对', color: '#ff4d6d' },
  caution: { label: '观望', color: '#ffd166' },
}

function getAgentDebate(caseData: CollaborationCase | undefined, agentId: string) {
  return caseData?.debate.find((point) => point.agentId === agentId)
}

function getLatestMessage(messages: NeuralMessage[], name: string) {
  return [...messages].reverse().find((msg) => msg.speaker === name)
}

export function AgentDeck({
  agents,
  latestCase,
  messages,
}: {
  agents: Agent[]
  latestCase?: CollaborationCase
  messages: NeuralMessage[]
}) {
  return (
    <div className="space-y-3">
      {agents.map((agent, index) => {
        const debate = getAgentDebate(latestCase, agent.id)
        const stance = debate ? stanceStyles[debate.stance] : null
        const latestMessage = getLatestMessage(messages, agent.name)
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="border border-white/10 rounded-lg p-4 bg-[#050508]/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#e8e8f0]">{agent.name}</span>
                <span className="text-[10px] text-[#6b6b8a] uppercase">{agent.role}</span>
              </div>
              {stance && (
                <span className="text-[10px] px-2 py-1 rounded-full border" style={{ color: stance.color, borderColor: `${stance.color}55` }}>
                  {stance.label}
                </span>
              )}
            </div>

            <div className="mt-3 text-xs text-[#9aa0aa] leading-relaxed">
              {debate ? debate.summary : '等待新的争论议题'}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-[#6b6b8a]">
              <span>任务：{agent.task}</span>
              <span>{agent.progress}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${agent.progress}%`, background: stance?.color || '#00f5d4' }}
              />
            </div>

            <div className="mt-3 text-[11px] text-[#7c7f89] border-t border-white/5 pt-2">
              近况：{latestMessage?.content || '等待新的协作反馈'}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
