'use client'

import { motion } from 'framer-motion'
import type { CollaborationCase, DebatePoint } from '@/stores/worldStore'

const stanceStyles: Record<DebatePoint['stance'], { color: string }> = {
  support: { color: '#00ff87' },
  oppose: { color: '#ff4d6d' },
  caution: { color: '#ffd166' },
}

function getDebateNode(caseData: CollaborationCase | undefined, agentId: string) {
  return caseData?.debate.find((point) => point.agentId === agentId)
}

export function DebateField({ latestCase }: { latestCase?: CollaborationCase }) {
  const alex = getDebateNode(latestCase, 'alex')
  const nova = getDebateNode(latestCase, 'nova')
  const zeta = getDebateNode(latestCase, 'zeta')

  return (
    <div className="relative h-full min-h-[160px] border border-white/10 rounded-lg bg-[#050508]/70 overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(0,245,212,0.25), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,77,109,0.2), transparent 50%)'
      }} />
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="50" y1="15" x2="18" y2="80" stroke="#2a2a3a" strokeWidth="0.6" />
          <line x1="50" y1="15" x2="82" y2="80" stroke="#2a2a3a" strokeWidth="0.6" />
          <line x1="18" y1="80" x2="82" y2="80" stroke="#2a2a3a" strokeWidth="0.6" />
        </svg>
      </div>

      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#00f5d4]/20" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-[#00f5d4]/10" />
      </motion.div>

      <DebateNode position="top" name="ALEX" point={alex} />
      <DebateNode position="left" name="NOVA" point={nova} />
      <DebateNode position="right" name="ZETA" point={zeta} />

      {!latestCase && (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] text-[#6b6b8a]">
          正在生成争论结构
        </div>
      )}

      <div className="absolute bottom-3 left-3 text-[10px] text-[#6b6b8a] uppercase tracking-[0.2em]">
        Debate Field
      </div>
      {latestCase && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[11px] text-[#e8e8f0]">
          争论热度 {latestCase.heat}%
        </div>
      )}
    </div>
  )
}

function DebateNode({
  position,
  name,
  point,
}: {
  position: 'top' | 'left' | 'right'
  name: string
  point?: DebatePoint
}) {
  const color = point ? stanceStyles[point.stance].color : '#00f5d4'
  const positions = {
    top: 'left-1/2 top-2',
    left: 'left-4 bottom-4',
    right: 'right-4 bottom-4',
  }

  return (
    <motion.div
      className={`absolute ${positions[position]} flex flex-col items-center gap-2`}
      style={position === 'top' ? { transform: 'translate(-60%, 0)' } : undefined}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-9 h-9 rounded-full border flex items-center justify-center text-[12px] font-bold"
        style={{ borderColor: `${color}99`, color }}
      >
        {name[0]}
      </div>
      <div className="text-[9px] text-[#e8e8f0]">{name}</div>
      <div className="text-[10px]" style={{ color }}>
        {point ? (point.stance === 'support' ? '支持' : point.stance === 'oppose' ? '反对' : '观望') : '等待'}
      </div>
    </motion.div>
  )
}
