'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MapGenerationLoaderProps {
  style: string
  onProgress?: (message: string) => void
}

const GENERATION_STEPS = [
  { message: '🎨 分析关卡风格...', duration: 1500 },
  { message: '🗺️ 设计地图布局...', duration: 2000 },
  { message: '👾 配置敌人分布...', duration: 1500 },
  { message: '💰 放置宝藏和道具...', duration: 1000 },
  { message: '📖 编写关卡故事...', duration: 1500 },
  { message: '✅ 生成完成！', duration: 500 },
]

const STYLE_NAMES: Record<string, string> = {
  dungeon: '地牢',
  space: '太空站',
  forest: '森林',
  factory: '工厂',
  battlefield: '战场',
  island: '海岛',
  volcano: '火山',
  circus: '马戏团',
  alien: '外星文明',
  roman: '古罗马',
}

function getStyleName(style: string): string {
  return STYLE_NAMES[style] || style
}

function TypewriterText({ text, delay }: { text: string; delay: number }) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    let index = 0
    setDisplayText('')
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
      }
    }, delay)

    return () => clearInterval(timer)
  }, [text, delay])

  return (
    <span>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export function MapGenerationLoader({ style, onProgress }: MapGenerationLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (currentStep >= GENERATION_STEPS.length) return

    const { message, duration } = GENERATION_STEPS[currentStep]
    onProgress?.(message)

    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1)
    }, duration)

    return () => clearTimeout(timer)
  }, [currentStep, onProgress])

  const progress = (currentStep / GENERATION_STEPS.length) * 100

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-800"
      >
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-4xl mb-2"
          >
            🎮
          </motion.div>
          <h2 className="text-xl font-bold text-white">AI 正在设计关卡</h2>
          <p className="text-gray-400 text-sm mt-1">风格: {getStyleName(style)}</p>
        </div>

        <div className="mb-6">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-gray-400 text-xs mt-2 text-right">{Math.round(progress)}%</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p className="text-white">
              {GENERATION_STEPS[Math.min(currentStep, GENERATION_STEPS.length - 1)]?.message}
              {currentStep < GENERATION_STEPS.length && dots}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 bg-gray-800 rounded-lg p-4 h-24 overflow-hidden">
          <p className="text-gray-500 text-xs mb-2">AI 思考过程</p>
          <div className="text-gray-400 text-sm">
            <TypewriterText
              text={`正在创建 ${getStyleName(style)} 风格的${Math.floor(Math.random() * 3) + 3}层地牢...`}
              delay={50}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
