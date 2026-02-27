'use client'

import { motion } from 'framer-motion'

interface ScanFrameProps {
  children: React.ReactNode
  className?: string
}

export function ScanFrame({ children, className = '' }: ScanFrameProps) {
  return (
    <div className={`relative ${className}`}>
      {/* 扫描波纹效果 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 245, 212, 0.05) 30%, rgba(0, 245, 212, 0.1) 60%, transparent 100%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* 边框 - 上 */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f5d4] to-transparent"
        animate={{
          opacity: [0.3, 1, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* 边框 - 下 */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f5d4] to-transparent"
        animate={{
          opacity: [0.3, 1, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />
      
      {/* 边框 - 左 */}
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-[#00f5d4] to-transparent"
        animate={{
          opacity: [0.3, 1, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      
      {/* 边框 - 右 */}
      <motion.div
        className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-[#00f5d4] to-transparent"
        animate={{
          opacity: [0.3, 1, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
      />
      
      {/* 角落装饰 - 左上 */}
      <div className="absolute -top-px -left-px w-8 h-8 border-l-2 border-t-2 border-[#00f5d4] rounded-tl-lg" />
      
      {/* 角落装饰 - 右上 */}
      <div className="absolute -top-px -right-px w-8 h-8 border-r-2 border-t-2 border-[#00f5d4] rounded-tr-lg" />
      
      {/* 角落装饰 - 左下 */}
      <div className="absolute -bottom-px -left-px w-8 h-8 border-l-2 border-b-2 border-[#00f5d4] rounded-bl-lg" />
      
      {/* 角落装饰 - 右下 */}
      <div className="absolute -bottom-px -right-px w-8 h-8 border-r-2 border-b-2 border-[#00f5d4] rounded-br-lg" />
      
      {/* 内容 */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
