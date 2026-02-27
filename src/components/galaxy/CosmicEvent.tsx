'use client'

import { motion, AnimatePresence } from 'framer-motion'

export type CosmicEventType = 'comet' | 'supernova' | 'eclipse' | 'aurora'

interface CosmicEventProps {
  type: CosmicEventType | null
  intensity: number
  onComplete?: () => void
}

export function CosmicEvent({ type, intensity = 1, onComplete }: CosmicEventProps) {
  if (!type) return null

  const eventConfigs = {
    comet: {
      color: '#ff006e',
      duration: 2000,
      Component: CometEvent,
    },
    supernova: {
      color: '#00f5d4',
      duration: 1500,
      Component: SupernovaEvent,
    },
    eclipse: {
      color: '#6b6b8a',
      duration: 3000,
      Component: EclipseEvent,
    },
    aurora: {
      color: '#9d4edd',
      duration: 4000,
      Component: AuroraEvent,
    },
  }

  const config = eventConfigs[type]

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: config.duration / 1000 }}
        onAnimationComplete={onComplete}
      >
        <config.Component color={config.color} intensity={intensity} />
      </motion.div>
    </AnimatePresence>
  )
}

function CometEvent({ color, intensity }: { color: string; intensity: number }) {
  return (
    <motion.svg
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <defs>
        <linearGradient id="cometGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity={intensity * 0.7} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={intensity} />
        </linearGradient>
      </defs>
      
      {/* Comet tail */}
      <motion.path
        d="M -10% 20% Q 30% 35% 110% 50%"
        fill="none"
        stroke="url(#cometGradient)"
        strokeWidth={30 * intensity}
        strokeLinecap="round"
        filter={`blur(${10 * intensity}px)`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeIn' }}
      />
      
      {/* Comet core */}
      <motion.circle
        r={15 * intensity}
        fill="#ffffff"
        filter={`drop-shadow(0 0 ${20 * intensity}px ${color})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 2 }}
        transition={{ duration: 0.5 }}
      >
        <animateMotion
          dur="1s"
          path="M -10% 20% Q 30% 35% 110% 50%"
          fill="freeze"
        />
      </motion.circle>
    </motion.svg>
  )
}

function SupernovaEvent({ color, intensity }: { color: string; intensity: number }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Expanding rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            borderColor: color,
            width: 50,
            height: 50,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: 12 + intensity * 6 + i * 4,
            opacity: 0,
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.2,
            ease: 'easeOut',
          }}
        />
      ))}
      
      {/* Central burst */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          width: 100,
          height: 100,
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{
          scale: [0, 2, 3],
          opacity: [1, 1, 0],
        }}
        transition={{ duration: 1.5 }}
      />
      
      {/* Sparkles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: color,
            left: '50%',
            top: '50%',
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: Math.cos((i * 30 * Math.PI) / 180) * 200,
            y: Math.sin((i * 30 * Math.PI) / 180) * 200,
          }}
          transition={{ duration: 1, delay: i * 0.05 }}
        />
      ))}
    </motion.div>
  )
}

function EclipseEvent({ color, intensity }: { color: string; intensity: number }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: `radial-gradient(circle, transparent 30%, ${color}${Math.floor(intensity * 40).toString(16).padStart(2, '0')} 100%)`,
      }}
    >
      {/* Darkening overlay */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 * intensity }}
        exit={{ opacity: 0 }}
      />
    </motion.div>
  )
}

function AuroraEvent({ color, intensity }: { color: string; intensity: number }) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Aurora waves */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, 
              transparent 0%, 
              ${color}10 20%, 
              ${color}30 50%, 
              ${color}10 80%, 
              transparent 100%
            )`,
            maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 50 Q25 30 50 50 T100 50\' fill=\'none\' stroke=\'black\' stroke-width=\'3\'/%3E%3C/svg%3E")',
            maskSize: '200% 200%',
          }}
          animate={{
            maskPosition: ['0% 0%', '200% 0%'],
          }}
          transition={{
            duration: Math.max(4, 9 - intensity * 3) + i * 1.4,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'linear',
          }}
        />
      ))}
      
      {/* Rising particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: color,
            left: `${10 + Math.random() * 80}%`,
            bottom: 0,
          }}
          animate={{
            y: -500,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </motion.div>
  )
}
