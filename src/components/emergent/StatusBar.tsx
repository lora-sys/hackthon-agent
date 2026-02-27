'use client'

import { motion } from 'framer-motion'

interface StatusBarProps {
  label: string
  value: number
  max?: number
  color?: 'cyan' | 'green' | 'purple' | 'pink' | 'orange'
  unit?: string
}

const colorMap = {
  cyan: {
    bg: 'bg-[#00f5d4]/20',
    fill: 'bg-[#00f5d4]',
    glow: 'shadow-[0_0_10px_rgba(0,245,212,0.5)]',
  },
  green: {
    bg: 'bg-[#00ff87]/20',
    fill: 'bg-[#00ff87]',
    glow: 'shadow-[0_0_10px_rgba(0,255,135,0.5)]',
  },
  purple: {
    bg: 'bg-[#9d4edd]/20',
    fill: 'bg-[#9d4edd]',
    glow: 'shadow-[0_0_10px_rgba(157,78,221,0.5)]',
  },
  pink: {
    bg: 'bg-[#ff006e]/20',
    fill: 'bg-[#ff006e]',
    glow: 'shadow-[0_0_10px_rgba(255,0,110,0.5)]',
  },
  orange: {
    bg: 'bg-[#ff9500]/20',
    fill: 'bg-[#ff9500]',
    glow: 'shadow-[0_0_10px_rgba(255,149,0,0.5)]',
  },
}

export function StatusBar({ label, value, max = 100, color = 'cyan', unit = '' }: StatusBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const colors = colorMap[color]
  const isLow = percentage < 30

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#6b6b8a] uppercase tracking-wider font-data w-16">
        {label}
      </span>
      
      <div className="flex-1 h-2 bg-[#1a1a24] rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colors.fill} ${colors.glow}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* 流动效果 */}
          <motion.div
            className="h-full w-full opacity-50"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
              backgroundSize: '200% 100%',
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      </div>
      
      <span className={`text-xs font-data w-12 text-right ${isLow ? 'text-[#ff006e]' : 'text-[#00f5d4]'}`}>
        {value}{unit}
      </span>
    </div>
  )
}

interface StatusItemProps {
  icon?: string
  label: string
  value: string | number
  status?: 'normal' | 'warning' | 'success'
}

export function StatusItem({ icon, label, value, status = 'normal' }: StatusItemProps) {
  const statusColor = {
    normal: 'text-[#00f5d4]',
    warning: 'text-[#ff006e]',
    success: 'text-[#00ff87]',
  }

  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-sm">{icon}</span>}
      <span className="text-xs text-[#6b6b8a] uppercase tracking-wider">{label}:</span>
      <span className={`text-xs font-data ${statusColor[status]}`}>{value}</span>
    </div>
  )
}
