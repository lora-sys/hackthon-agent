'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

function AgentNode({ name, role, color }: { name: string; role: string; color: string }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      whileHover={{ scale: 1.1 }}
    >
      <motion.div
        className="relative w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}10)`,
          border: `2px solid ${color}60`,
          boxShadow: `0 0 20px ${color}40, inset 0 0 20px ${color}20`,
        }}
        animate={{
          boxShadow: [
            `0 0 15px ${color}40`,
            `0 0 30px ${color}60`,
            `0 0 15px ${color}40`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-lg font-bold" style={{ color }}>{name[0]}</span>
        
        {/* 外圈光环 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid ${color}30` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
      
      <motion.span
        className="mt-2 text-xs font-bold"
        style={{ color }}
      >
        {name}
      </motion.span>
      <span className="text-[8px] text-[#6b6b8a] uppercase tracking-wider">
        {role}
      </span>
    </motion.div>
  )
}

function CentralCore() {
  return (
    <motion.div
      className="relative w-20 h-20"
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
    >
      {/* 外环 */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="rgba(0, 245, 212, 0.2)"
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />
        <circle
          cx="50" cy="50" r="35"
          fill="none"
          stroke="rgba(157, 78, 221, 0.15)"
          strokeWidth="0.5"
          strokeDasharray="1 3"
        />
      </svg>
      
      {/* 核心 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f5d4] to-[#9d4edd] blur-md" />
        <div className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-[#00f5d4] to-[#9d4edd]" />
      </motion.div>
    </motion.div>
  )
}

function ConnectionLines() {
  const colors = ['#00f5d4', '#9d4edd', '#ff9500']
  
  return (
    <>
      {/* ALEX -> NOVA */}
      <motion.line
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        transition={{ duration: 2, delay: 1 }}
        x1="20%" y1="25%" x2="80%" y2="25%"
        stroke={colors[0]}
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      {/* ALEX -> ZETA */}
      <motion.line
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        transition={{ duration: 2, delay: 1.2 }}
        x1="20%" y1="25%" x2="50%" y2="70%"
        stroke={colors[2]}
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      {/* NOVA -> ZETA */}
      <motion.line
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        transition={{ duration: 2, delay: 1.4 }}
        x1="80%" y1="25%" x2="50%" y2="70%"
        stroke={colors[1]}
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      
      {/* 脉冲点 */}
      <circle r="3" fill={colors[0]}>
        <animateMotion dur="2s" repeatCount="Infinity" path="M 20% 25% L 80% 25%" />
      </circle>
      <circle r="3" fill={colors[2]}>
        <animateMotion dur="2s" repeatCount="Infinity" path="M 20% 25% L 50% 70%" />
      </circle>
      <circle r="3" fill={colors[1]}>
        <animateMotion dur="2s" repeatCount="Infinity" path="M 80% 25% L 50% 70%" />
      </circle>
    </>
  )
}

function NeuralNetworkBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const nodes = [
    { id: 0, x: 10, y: 15, size: 1.5, delay: 0 },
    { id: 1, x: 25, y: 30, size: 2, delay: 0.3 },
    { id: 2, x: 40, y: 10, size: 1.2, delay: 0.6 },
    { id: 3, x: 55, y: 45, size: 1.8, delay: 0.9 },
    { id: 4, x: 70, y: 20, size: 1.3, delay: 1.2 },
    { id: 5, x: 85, y: 35, size: 2.2, delay: 1.5 },
    { id: 6, x: 15, y: 55, size: 1.6, delay: 0.2 },
    { id: 7, x: 30, y: 70, size: 1.4, delay: 0.5 },
    { id: 8, x: 50, y: 60, size: 1.9, delay: 0.8 },
    { id: 9, x: 65, y: 75, size: 1.1, delay: 1.1 },
    { id: 10, x: 80, y: 55, size: 1.7, delay: 1.4 },
    { id: 11, x: 20, y: 85, size: 2.1, delay: 0.4 },
    { id: 12, x: 45, y: 80, size: 1.5, delay: 0.7 },
    { id: 13, x: 60, y: 90, size: 1.3, delay: 1.0 },
    { id: 14, x: 75, y: 85, size: 1.8, delay: 1.3 },
    { id: 15, x: 35, y: 50, size: 1.2, delay: 0.1 },
    { id: 16, x: 90, y: 70, size: 1.6, delay: 0.4 },
    { id: 17, x: 5, y: 40, size: 2.0, delay: 0.7 },
    { id: 18, x: 95, y: 10, size: 1.4, delay: 1.0 },
    { id: 19, x: 12, y: 75, size: 1.9, delay: 1.3 },
  ]
  
  return (
    <div className="absolute inset-0 opacity-30">
      <svg className="w-full h-full">
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.size}
            fill="#00f5d4"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: node.delay,
            }}
          />
        ))}
        
        {/* 连接小节点 */}
        {nodes.slice(0, 10).map((node, i) => (
          nodes.slice(i + 1, i + 3).map((other, j) => (
            <motion.line
              key={`${node.id}-${other.id}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${other.x}%`}
              y2={`${other.y}%`}
              stroke="#00f5d4"
              strokeWidth="0.3"
              strokeOpacity="0.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, delay: node.delay + j * 0.5 }}
            />
          ))
        ))}
      </svg>
    </div>
  )
}

export { AgentNode, CentralCore, ConnectionLines, NeuralNetworkBackground }
