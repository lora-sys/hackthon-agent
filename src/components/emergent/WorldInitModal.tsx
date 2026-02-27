'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface WorldInitModalProps {
  isOpen: boolean
  onSelectWorld: (world: string) => void
}

const WORLD_PRESETS = [
  { id: 'island', emoji: '🏝️', name: '荒岛求生', desc: '荒凉的异星殖民地，3个AI需要在此协作生存' },
  { id: 'space', emoji: '🚀', name: '太空站', desc: '太空站殖民地，资源有限需要高效利用' },
  { id: 'wasteland', emoji: '☢️', name: '末世废土', desc: '辐射废土，3个AI在资源匮乏中求存' },
  { id: 'medieval', emoji: '🏰', name: '中世纪', desc: '中世纪王国，AI扮演领主与骑士' },
  { id: 'cyber', emoji: '🌃', name: '赛博城市', desc: '未来赛博城市，AI管理城市运转' },
  { id: 'ocean', emoji: '🌊', name: '深海基地', desc: '深海研究基地，AI探索海底资源' },
]

export function WorldInitModal({ isOpen, onSelectWorld }: WorldInitModalProps) {
  const [worldInput, setWorldInput] = useState('')

  if (!isOpen) return null

  const handleSelect = (world: string) => {
    onSelectWorld(world)
  }

  const handleCustomSubmit = () => {
    if (worldInput.trim()) {
      onSelectWorld(worldInput.trim())
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#050508]/90"
      role="dialog"
      aria-modal="true"
      aria-labelledby="world-modal-title"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-lg p-8 bg-[#0a0a12]/90 border border-[#00f5d4]/30 rounded-lg"
        style={{
          boxShadow: '0 0 40px rgba(0, 245, 212, 0.2)',
        }}
      >
        <div className="text-center mb-6">
          <h2 id="world-modal-title" className="text-2xl font-bold text-[#00f5d4] glow-text tracking-widest mb-2">
            INITIALIZE WORLD
          </h2>
          <p className="text-xs text-[#6b6b8a] tracking-wider">
            Define your simulation scenario
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {WORLD_PRESETS.map((world) => (
                <button
                  key={world.id}
                  onClick={() => handleSelect(world.desc)}
                  className="p-3 text-left border border-white/10 rounded-lg hover:border-[#00f5d4]/50 hover:bg-[#00f5d4]/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00f5d4]/50"
                  aria-label={`选择 ${world.name} 场景`}
                >
                  <div className="text-lg mb-1">{world.emoji}</div>
                  <div className="text-xs text-[#e8e8f0]">{world.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-[10px] text-[#6b6b8a]">或自定义</div>

          <div className="space-y-2">
            <input
              type="text"
              value={worldInput}
              onChange={(e) => setWorldInput(e.target.value)}
              placeholder="用一句话定义世界背景... 例如：太空站殖民地 | 末世废土 | 中世纪魔法王国 | 未来赛博城市 | 深海研究基地"
              className="w-full px-4 py-3 text-xs text-[#e8e8f0] bg-[#050508]/80 border border-white/10 rounded-lg placeholder:text-[#6b6b8a] focus:outline-none focus:border-[#00f5d4]/50"
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
              aria-label="自定义世界背景描述"
            />
            <button
              onClick={handleCustomSubmit}
              disabled={!worldInput.trim()}
              className="w-full py-3 text-xs font-bold text-[#050508] bg-[#00f5d4] rounded-lg hover:bg-[#00f5d4]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00f5d4]/50"
            >
              START SIMULATION
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
