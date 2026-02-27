'use client'

import { motion } from 'framer-motion'

interface ParticleFieldProps {
  className?: string
  particleCount?: number
}

export function ParticleField({ className = '', particleCount = 100 }: ParticleFieldProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* 星空粒子 */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 0.5}px`,
            height: `${Math.random() * 2 + 0.5}px`,
            backgroundColor: Math.random() > 0.5 ? '#00f5d4' : '#9d4edd',
            opacity: Math.random() * 0.5 + 0.1,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 10 - 5, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}
      
      {/* 光晕 */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(0, 245, 212, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(157, 78, 221, 0.08) 0%, transparent 50%)',
        }}
      />
    </div>
  )
}
