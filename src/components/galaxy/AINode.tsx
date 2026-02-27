'use client'

import { motion } from 'framer-motion'

interface AINodeProps {
  name: string
  role: string
  color: string
  energy: number
  progress: number
  isActive: boolean
  position: { x: number; y: number }
}

export function AINode({ name, role, color, energy, progress, isActive, position }: AINodeProps) {
  const size = 40 + (energy / 100) * 30
  const glowIntensity = energy / 100
  const pulseSpeed = isActive ? 1.5 : 3
  
  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Orbital ring for progress */}
      <motion.svg
        className="absolute"
        style={{ width: size * 2.5, height: size * 2.5 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {/* Background ring */}
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke={`${color}20`}
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        {/* Progress arc */}
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={`${progress * 2.83} 283`}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
        {/* Orbiting particle */}
        <circle r="3" fill={color}>
          <animateMotion
            dur={`${10 - progress / 15}s`}
            repeatCount="Infinity"
            path={`M 50% 5% A 45% 45% 0 1 1 49% 5%`}
          />
        </circle>
      </motion.svg>

      {/* Main star body */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{
          width: size,
          height: size,
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: pulseSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size * 1.5,
            height: size * 1.5,
            background: `radial-gradient(circle, ${color}40 0%, ${color}10 50%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: pulseSpeed,
            repeat: Infinity,
          }}
        />

        {/* Inner core */}
        <motion.div
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: size * 0.7,
            height: size * 0.7,
            background: `radial-gradient(circle at 30% 30%, ${color}, ${color}80)`,
            boxShadow: `
              0 0 ${20 * glowIntensity}px ${color}60,
              0 0 ${40 * glowIntensity}px ${color}30,
              inset 0 0 20px rgba(255,255,255,0.3)
            `,
          }}
        >
          {/* Star letter */}
          <span className="text-lg font-bold text-black/80">{name[0]}</span>

          {/* Rotating outer ring */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: `${color}50` }}
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.div>

        {/* Sparkle particles */}
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: color,
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: Math.cos((i * 60 * Math.PI) / 180) * (size * 0.8),
                  y: Math.sin((i * 60 * Math.PI) / 180) * (size * 0.8),
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Name and role label */}
      <motion.div
        className="absolute -bottom-8 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-sm font-bold" style={{ color }}>
          {name}
        </span>
        <span className="text-[10px] text-[#6b6b8a] uppercase tracking-wider">
          {role}
        </span>
      </motion.div>
    </motion.div>
  )
}
