'use client'

import { motion } from 'framer-motion'

interface NebulaFlowProps {
  fromPosition: { x: number; y: number }
  toPosition: { x: number; y: number }
  color: string
  intensity: number
  isActive: boolean
}

export function NebulaFlow({ fromPosition, toPosition, color, intensity, isActive }: NebulaFlowProps) {
  if (!isActive || intensity < 0.1) return null

  const midX = (fromPosition.x + toPosition.x) / 2
  const midY = (fromPosition.y + toPosition.y) / 2 - 5

  const controlPoint1 = { x: fromPosition.x + (midX - fromPosition.x) * 0.5, y: fromPosition.y - 10 }
  const controlPoint2 = { x: midX + (toPosition.x - midX) * 0.5, y: toPosition.y - 10 }

  const gradientId = `nebula-${(color || 'fff').replace('#', '')}-${fromPosition.x}-${toPosition.x}`

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity={intensity * 0.6} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Nebula path background */}
      <motion.path
        d={`M ${fromPosition.x} ${fromPosition.y} Q ${controlPoint1.x} ${controlPoint1.y} ${midX} ${midY} Q ${controlPoint2.x} ${controlPoint2.y} ${toPosition.x} ${toPosition.y}`}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={8 * intensity}
        strokeLinecap="round"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: intensity }}
        transition={{ duration: 1 }}
      />

      {/* Flowing particles */}
      {isActive && (
        <>
          {[...Array(Math.floor(intensity * 5) + 2)].map((_, i) => (
            <motion.circle
              key={i}
              r={2 + intensity * 2}
              fill={color}
              filter="url(#glow)"
              initial={{ opacity: 0 }}
            >
              <animateMotion
                dur={`${2 + i * 0.3}s`}
                repeatCount="Infinity"
                begin={`${i * 0.4}s`}
                path={`M ${fromPosition.x} ${fromPosition.y} Q ${controlPoint1.x} ${controlPoint1.y} ${midX} ${midY} Q ${controlPoint2.x} ${controlPoint2.y} ${toPosition.x} ${toPosition.y}`}
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur={`${2 + i * 0.3}s`}
                repeatCount="Infinity"
                begin={`${i * 0.4}s`}
              />
            </motion.circle>
          ))}
        </>
      )}

      {/* Energy pulses */}
      {isActive && intensity > 0.5 && (
        <motion.circle
          r={4}
          fill={color}
          filter="url(#glow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <animateMotion
            dur="3s"
            repeatCount="Infinity"
            path={`M ${fromPosition.x} ${fromPosition.y} Q ${controlPoint1.x} ${controlPoint1.y} ${midX} ${midY} Q ${controlPoint2.x} ${controlPoint2.y} ${toPosition.x} ${toPosition.y}`}
          />
        </motion.circle>
      )}
    </svg>
  )
}
