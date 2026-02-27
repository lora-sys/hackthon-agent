'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PanelProps {
  title: string
  children: ReactNode
  className?: string
  icon?: string
}

export function Panel({ title, children, className = '', icon }: PanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-[#0a0a12]/80 backdrop-blur-sm border border-[#00f5d4]/20 rounded-lg overflow-hidden ${className}`}
    >
      {/* 面板头部 */}
      <div className="px-4 py-2 border-b border-[#00f5d4]/10 flex items-center gap-2">
        {icon && <span className="text-[#00f5d4]">{icon}</span>}
        <h3 className="text-xs font-title tracking-widest text-[#00f5d4] uppercase">
          {title}
        </h3>
        
        {/* 装饰线 */}
        <div className="flex-1 h-px bg-gradient-to-r from-[#00f5d4]/30 to-transparent" />
        
        {/* 角落装饰 */}
        <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-[#00f5d4]/30" />
      </div>
      
      {/* 内容区 */}
      <div className="p-4">
        {children}
      </div>
      
      {/* 呼吸发光效果 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0, 245, 212, 0.03)',
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.div>
  )
}
