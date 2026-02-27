'use client'

import { motion } from 'framer-motion'

interface EmergenceCoreProps {
  className?: string
}

export function EmergenceCore({ className = '' }: EmergenceCoreProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 外圈 - 旋转 */}
      <motion.div
        className="absolute w-48 h-48"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(0, 245, 212, 0.2)"
            strokeWidth="0.5"
            strokeDasharray="2 4"
          />
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="rgba(157, 78, 221, 0.15)"
            strokeWidth="0.5"
            strokeDasharray="1 3"
          />
        </svg>
      </motion.div>
      
      {/* 扫描波纹 */}
      <motion.div
        className="absolute w-40 h-40 rounded-full border-2 border-[#00f5d4]/30"
        animate={{
          scale: [0.5, 1.5, 0.5],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full border border-[#00f5d4]/40"
        animate={{
          scale: [0.5, 1.3, 0.5],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className="absolute w-24 h-24 rounded-full border border-[#9d4edd]/30"
        animate={{
          scale: [0.5, 1.1, 0.5],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: 2 }}
      />
      
      {/* 核心 */}
      <motion.div
        className="relative w-16 h-16"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* 核心发光 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00f5d4] to-[#9d4edd] rounded-full opacity-80 blur-md" />
        
        {/* 核心本体 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00f5d4] to-[#9d4edd] rounded-full flex items-center justify-center">
          <motion.div
            className="w-2 h-2 bg-white rounded-full"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
        
        {/* 光晕 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00f5d4] to-[#9d4edd] rounded-full blur-xl opacity-50" />
      </motion.div>
      
      {/* 粒子环绕 */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-[#00f5d4] rounded-full"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            transformOrigin: 'center',
          }}
        >
          <motion.div
            className="w-full h-full"
            animate={{
              x: Math.cos((i * 60 * Math.PI) / 180) * 60,
              y: Math.sin((i * 60 * Math.PI) / 180) * 60,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
