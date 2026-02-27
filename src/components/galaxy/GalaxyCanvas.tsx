'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AINode } from './AINode'
import { NebulaFlow } from './NebulaFlow'
import { CosmicEvent, CosmicEventType } from './CosmicEvent'

interface Agent {
  id: string
  name: string
  role: string
  energy: number
  status: string
  task: string
  progress: number
}

interface GalaxyCanvasProps {
  agents: Agent[]
  worldView: string
  collaborationLevel: number
  activeEvent?: CosmicEventType | null
  onEventComplete?: () => void
}

const AGENT_COLORS: Record<string, string> = {
  ALEX: '#00f5d4',
  NOVA: '#9d4edd',
  ZETA: '#ff9500',
}

const AGENT_POSITIONS = [
  { x: 25, y: 30 },
  { x: 75, y: 30 },
  { x: 50, y: 70 },
]

export function GalaxyCanvas({
  agents,
  worldView,
  collaborationLevel = 0.5,
  activeEvent = null,
  onEventComplete,
}: GalaxyCanvasProps) {
  const [mounted, setMounted] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (agents.length > 0 && mounted) {
      setMessage(`${agents[0].task || '系统运行中'}`)
      setShowMessage(true)
      const timer = setTimeout(() => setShowMessage(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [agents, mounted])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-[#00f5d4] animate-pulse">初始化星系...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background nebula */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(ellipse at 30% 30%, rgba(0,245,212,0.1) 0%, transparent 50%)',
            'radial-gradient(ellipse at 70% 60%, rgba(157,78,221,0.1) 0%, transparent 50%)',
            'radial-gradient(ellipse at 30% 30%, rgba(0,245,212,0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Star field background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Nebula flows between agents */}
      <NebulaFlow
        fromPosition={AGENT_POSITIONS[0]}
        toPosition={AGENT_POSITIONS[1]}
        color={AGENT_COLORS[agents[0]?.name || 'ALEX']}
        intensity={collaborationLevel}
        isActive={collaborationLevel > 0.3}
      />
      <NebulaFlow
        fromPosition={AGENT_POSITIONS[0]}
        toPosition={AGENT_POSITIONS[2]}
        color={AGENT_COLORS[agents[0]?.name || 'ALEX']}
        intensity={collaborationLevel * 0.8}
        isActive={collaborationLevel > 0.4}
      />
      <NebulaFlow
        fromPosition={AGENT_POSITIONS[1]}
        toPosition={AGENT_POSITIONS[2]}
        color={AGENT_COLORS[agents[1]?.name || 'NOVA']}
        intensity={collaborationLevel * 0.6}
        isActive={collaborationLevel > 0.5}
      />

      {/* AI Nodes */}
      {agents.map((agent, index) => (
        <AINode
          key={agent.id}
          name={agent.name}
          role={agent.role}
          color={AGENT_COLORS[agent.name] || '#00f5d4'}
          energy={agent.energy}
          progress={agent.progress}
          isActive={agent.status !== 'idle'}
          position={AGENT_POSITIONS[index]}
        />
      ))}

      {/* Central pulse message */}
      {showMessage && message && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ duration: 0.5 }}
        >
          <div className="px-6 py-3 bg-[#0a0a12]/80 border border-[#00f5d4]/30 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-[#e8e8f0] text-center whitespace-nowrap">
              {message}
            </p>
          </div>
        </motion.div>
      )}

      {/* Cosmic events */}
      <CosmicEvent
        type={activeEvent}
        intensity={collaborationLevel}
        onComplete={onEventComplete}
      />

      {/* World view label */}
      {worldView && (
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="px-4 py-2 bg-[#0a0a12]/60 border border-[#9d4edd]/20 rounded-full">
            <span className="text-xs text-[#9d4edd]">
              ◈ {worldView.length > 40 ? worldView.substring(0, 40) + '...' : worldView}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
