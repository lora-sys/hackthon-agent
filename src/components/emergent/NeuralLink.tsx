'use client'

import { motion } from 'framer-motion'

interface NeuralMessage {
  id: string
  speaker: string
  content: string
  timestamp: string
  status: 'sending' | 'receiving' | 'received'
}

interface NeuralLinkProps {
  messages: NeuralMessage[]
  className?: string
}

export function NeuralLink({ messages, className = '' }: NeuralLinkProps) {
  const colors: Record<string, string> = {
    ALEX: '#00f5d4',
    NOVA: '#9d4edd',
    ZETA: '#ff9500',
  }

  return (
    <div className={`relative h-full ${className}`}>
      {/* 背景网格效果 */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,245,212,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,212,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#00f5d4] animate-pulse">◈</span>
        <span className="text-xs font-title tracking-widest text-[#00f5d4] uppercase">
          Neural Link
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#00f5d4]/50 to-transparent" />
      </div>

      {/* 对话区域 */}
      <div className="space-y-3 max-h-[calc(100%-40px)] overflow-y-auto pr-2">
        {messages.map((msg, index) => (
          <NeuralMessageBubble 
            key={msg.id} 
            message={msg} 
            index={index}
            colors={colors}
          />
        ))}
      </div>

      {/* 装饰角标 */}
      <div className="absolute bottom-0 right-0 w-6 h-6 border-r border-b border-[#00f5d4]/20" />
    </div>
  )
}

function NeuralMessageBubble({ 
  message, 
  index,
  colors 
}: { 
  message: NeuralMessage
  index: number
  colors: Record<string, string>
}) {
  const color = colors[message.speaker] || '#00f5d4'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* 发送时的粒子流效果 */}
      {message.status === 'sending' && (
        <motion.div
          className="absolute -left-4 top-1/2 -translate-y-1/2"
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: [1, 0], x: -30 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <DataParticles color={color} />
        </motion.div>
      )}

      {/* 消息气泡 */}
      <div 
        className="relative p-3 rounded border"
        style={{ 
          borderColor: `${color}30`,
          background: `linear-gradient(135deg, rgba(10,10,18,0.9) 0%, ${color}10 100%)`
        }}
      >
        {/* 扫描线效果 */}
        <motion.div
          className="absolute inset-0 rounded overflow-hidden pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 50%, rgba(0,245,212,0.05) 50%)',
            backgroundSize: '100% 4px'
          }}
        />

        {/* 头部 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* 头像 */}
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ 
                background: `linear-gradient(135deg, ${color}40, ${color}20)`,
                border: `1px solid ${color}50`
              }}
            >
              {message.speaker[0]}
            </div>
            <span className="text-xs font-bold" style={{ color }}>
              {message.speaker}
            </span>
            {/* 角色标签 */}
            <span className="text-[10px] text-[#6b6b8a] uppercase">
              {message.speaker === 'ALEX' && 'Builder'}
              {message.speaker === 'NOVA' && 'Explorer'}
              {message.speaker === 'ZETA' && 'Commander'}
            </span>
          </div>
          <span className="text-[10px] text-[#6b6b8a] font-data">
            {message.timestamp}
          </span>
        </div>

        {/* 内容 */}
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          {message.content}
        </p>

        {/* 声波动画 - 当正在发送时 */}
        {message.status === 'sending' && (
          <motion.div
            className="absolute bottom-2 right-2 flex items-end gap-0.5 h-3"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-0.5 rounded-full"
                style={{ backgroundColor: color }}
                animate={{
                  height: [4, 8, 4, 12, 4],
                }}
                transition={{
                  duration: 0.4,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}

        {/* 接收动画 */}
        {message.status === 'receiving' && (
          <motion.div
            className="absolute inset-0 rounded border-2"
            style={{ borderColor: color }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* 已接收标记 */}
        {message.status === 'received' && (
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px]" style={{ color }}>✓</span>
          </div>
        )}
      </div>

      {/* 接收时的粒子效果 */}
      {message.status === 'receiving' && (
        <motion.div
          className="absolute -right-2 top-1/2 -translate-y-1/2"
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: [1, 0], x: 20 }}
          transition={{ duration: 0.8 }}
        >
          <ReceiveParticles color={color} />
        </motion.div>
      )}
    </motion.div>
  )
}

function DataParticles({ color }: { color: string }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            y: [0, -5, 0],
            opacity: [1, 0.3, 1],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  )
}

function ReceiveParticles({ color }: { color: string }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: [0.5, 1.5, 0.5],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  )
}

// 默认消息数据
export const defaultMessages: NeuralMessage[] = [
  { id: '1', speaker: 'ALEX', content: '资源充足，庇护所建造进度 60%', timestamp: '13:42', status: 'received' },
  { id: '2', speaker: 'NOVA', content: '发现新材料区域，准备出发', timestamp: '13:43', status: 'received' },
  { id: '3', speaker: 'ZETA', content: '建议优先提升仓储容量', timestamp: '13:44', status: 'received' },
]
