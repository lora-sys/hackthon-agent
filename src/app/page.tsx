'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanFrame, StatusBar, StatusItem, Panel, NeuralLink, ModelStatsPanel, ParticleBackground } from '@/components/emergent'
import { useWorldStore } from '@/stores/worldStore'
import { getAIResponse } from '@/lib/ai/agent'
import { CollaborationTimeline } from '@/components/collab/CollaborationTimeline'
import { DebateField } from '@/components/collab/DebateField'
import { ExecutionBoard } from '@/components/collab/ExecutionBoard'

type ResourceKey = 'energy' | 'wood' | 'stone' | 'food' | 'water'

export default function EmergencePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [showWorldModal, setShowWorldModal] = useState(true)
  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [worldInput, setWorldInput] = useState('')
  const [commandType, setCommandType] = useState<'mission' | 'suggest' | 'command' | 'vote' | 'adjust'>('command')
  const [isInitializing, setIsInitializing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [resourceDelta, setResourceDelta] = useState<Partial<Record<ResourceKey, number>>>({})
  const [worldEvents, setWorldEvents] = useState<string[]>([])
  const evidenceScrollRef = useRef<HTMLDivElement>(null)
  const initTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deltaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevResourcesRef = useRef<{ energy: number; wood: number; stone: number; food: number; water: number } | null>(null)
  const prevThreatRef = useRef<string | null>(null)
  
  const { 
    day, time, worldView, resources, threatLevel, 
    agents, messages, interventions, cases, goal, plan, llmStatus, llmError,
    plannerStatus, plannerError, plannerSummary, plannerActions, decisionEvents, nextPlanAt, executorStatus, executorError, plannerFeedback,
    agentMode, lastDebateSource, lastDebateModel, lastPlannerSource, lastPlannerModel, lastStrategySource, lastStrategyModel, modelStats,
    isPaused, togglePause,
    addMessage, addIntervention, setWorldView, advanceExecution, requestPlannerTick, executePlannerAction 
  } = useWorldStore()

  const commandTypeLabels = {
    mission: { label: '📋 MISSION', color: '#00f5d4' },
    suggest: { label: '💡 SUGGEST', color: '#00ff87' },
    command: { label: '⚡ COMMAND', color: '#ff9500' },
    vote: { label: '🗳️ VOTE', color: '#9d4edd' },
    adjust: { label: '🔧 ADJUST', color: '#ff006e' },
  }

  const handleExecute = async () => {
    if (!inputValue.trim() || !worldView) return
    
    const cmdText = `${commandTypeLabels[commandType].label.split(' ')[0]} ${inputValue.trim()}`
    addIntervention(cmdText)
    
    const randomAgent = agents[Math.floor(Math.random() * agents.length)]
    addMessage({
      speaker: randomAgent.name,
      content: `收到指令: ${inputValue.trim()}`,
    })
    
    setTimeout(async () => {
      const response = await getAIResponse(
        randomAgent.name,
        inputValue.trim(),
        worldView,
        randomAgent.status
      )
      addMessage({
        speaker: randomAgent.name,
        content: response.content,
      })
    }, 1500)
    
    setInputValue('')
  }

  const startInitialization = () => {
    setIsInitializing(true)
    if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current)
    initTimeoutRef.current = setTimeout(() => {
      setIsInitializing(false)
      initTimeoutRef.current = null
    }, 5000)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
    }> = []
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
        gradient.addColorStop(0, `rgba(0, 245, 212, ${p.opacity})`)
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
        ctx.fill()
      })

      // 连接线
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.03)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  // 轻量思考流
  useEffect(() => {
    const thoughtInterval = setInterval(() => {
      const speakers = ['ALEX', 'NOVA', 'ZETA'] as const
      const thoughts = [
        '需要重新评估风险',
        '资源曲线有明显波动',
        '争议需要收敛为决策',
        '探索可以带来突破',
        '协作节奏需要统一',
      ]
      const speaker = speakers[Math.floor(Math.random() * speakers.length)]
      const content = thoughts[Math.floor(Math.random() * thoughts.length)]
      useWorldStore.getState().addMessage({ speaker, content })
    }, 10000)

    return () => {
      clearInterval(thoughtInterval)
    }
  }, [])

  useEffect(() => {
    if (!worldView) return
    const executionInterval = setInterval(() => {
      if (!isPaused) {
        advanceExecution()
      }
    }, 1200)
    return () => clearInterval(executionInterval)
  }, [worldView, advanceExecution, isPaused])

  useEffect(() => {
    if (!worldView || llmStatus !== 'ready' || isPaused) return
    const pendingActions = plannerActions.filter((action) => action.status !== 'done' && action.status !== 'failed')
    const hasPendingActions = pendingActions.length > 0
    const now = Date.now()
    const shouldRequestPlan = !hasPendingActions && executorStatus !== 'running' && (nextPlanAt === 0 || now >= nextPlanAt)

    const timer = setTimeout(async () => {
      if (hasPendingActions && executorStatus !== 'running' && plannerStatus !== 'planning') {
        await executePlannerAction()
        return
      }
      if (shouldRequestPlan) {
        await requestPlannerTick()
      }
    }, hasPendingActions ? 220 : 320)

    return () => clearTimeout(timer)
  }, [
    worldView,
    llmStatus,
    isPaused,
    plannerActions,
    plannerStatus,
    executorStatus,
    nextPlanAt,
    requestPlannerTick,
    executePlannerAction,
  ])

  useEffect(() => {
    if (!worldView || llmStatus !== 'ready' || isPaused) return
    const heartbeat = setInterval(async () => {
      const state = useWorldStore.getState()
      if (state.llmStatus !== 'ready' || state.isPaused) return
      if (state.executorStatus === 'running') return
      const hasPendingActions = state.plannerActions.some((action) => action.status !== 'done' && action.status !== 'failed')
      if (!hasPendingActions) {
        await state.requestPlannerTick()
      }
    }, 5000)
    return () => clearInterval(heartbeat)
  }, [worldView, llmStatus, isPaused])

  useEffect(() => {
    if (!worldView) {
      setIsInitializing(false)
      setIsBootstrapping(false)
      return
    }
    if (isBootstrapping && llmStatus === 'thinking') {
      startInitialization()
    } else {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
        initTimeoutRef.current = null
      }
      setIsInitializing(false)
      if (llmStatus === 'ready' || llmStatus === 'error') {
        setIsBootstrapping(false)
      }
    }
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
        initTimeoutRef.current = null
      }
    }
  }, [isBootstrapping, llmStatus, worldView])

  useEffect(() => {
    if (llmStatus === 'error') {
      setToastMessage(llmError || 'LLM 请求失败')
      setShowToast(true)
      const timer = setTimeout(() => setShowToast(false), 2800)
      return () => clearTimeout(timer)
    }
    return
  }, [llmStatus, llmError])

  useEffect(() => {
    if (!evidenceScrollRef.current) return
    evidenceScrollRef.current.scrollTop = 0
  }, [cases])

  useEffect(() => {
    if (!worldView) return
    const prev = prevResourcesRef.current
    if (!prev) {
      prevResourcesRef.current = resources
      prevThreatRef.current = threatLevel
      return
    }

    const keys: ResourceKey[] = ['energy', 'wood', 'stone', 'food', 'water']
    const delta: Partial<Record<ResourceKey, number>> = {}
    const eventParts: string[] = []

    keys.forEach((key) => {
      const diff = resources[key] - prev[key]
      if (diff !== 0) {
        delta[key] = diff
        eventParts.push(`${key.toUpperCase()} ${diff > 0 ? '+' : ''}${diff}`)
      }
    })

    if (eventParts.length > 0) {
      setResourceDelta(delta)
      if (deltaTimeoutRef.current) clearTimeout(deltaTimeoutRef.current)
      deltaTimeoutRef.current = setTimeout(() => setResourceDelta({}), 1200)
      setWorldEvents((current) => [
        `${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} · ${eventParts.join(' | ')}`,
        ...current,
      ].slice(0, 6))
    }

    const prevThreat = prevThreatRef.current
    if (prevThreat && prevThreat !== threatLevel) {
      setWorldEvents((current) => [
        `${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} · THREAT ${prevThreat.toUpperCase()} -> ${threatLevel.toUpperCase()}`,
        ...current,
      ].slice(0, 6))
    }

    prevResourcesRef.current = resources
    prevThreatRef.current = threatLevel
  }, [resources, threatLevel, worldView])

  const latestCase = cases[0]
  const activeTasks = plannerActions.length > 0 ? plannerActions : (latestCase?.tasks || [])
  const nextPlanCountdown = nextPlanAt ? Math.max(0, Math.ceil((nextPlanAt - Date.now()) / 1000)) : null
  const latestFeedback = plannerFeedback.length > 0 ? plannerFeedback[plannerFeedback.length - 1] : null

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#050508]">
      {/* 粒子背景 */}
      <ParticleBackground />

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 right-4 z-50 px-4 py-2 text-xs text-[#ff4d6d] border border-[#ff4d6d]/40 rounded bg-[#0a0a12]/90"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 初始化过渡 */}
      <AnimatePresence>
        {isInitializing && !showWorldModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-[#050508]/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-8 py-6 border border-[#00f5d4]/30 rounded-lg bg-[#0a0a12]/80 text-center"
            >
              <div className="text-sm text-[#00f5d4] font-title tracking-widest">INITIALIZING</div>
              <div className="mt-2 text-[11px] text-[#6b6b8a]">正在构建世界与争论证据链</div>
              <div className="mt-4 h-1.5 w-48 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-[#00f5d4]"
                  initial={{ width: '10%' }}
                  animate={{ width: ['10%', '80%', '40%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 世界观设置弹窗 */}
      <AnimatePresence>
        {showWorldModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#050508]/90"
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
                <h2 className="text-2xl font-bold text-[#00f5d4] glow-text tracking-widest mb-2">
                  INITIALIZE WORLD
                </h2>
                <p className="text-xs text-[#6b6b8a] tracking-wider">
                  Define your simulation scenario
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setIsBootstrapping(true)
                        startInitialization()
                        const defaultWorld = '荒凉的异星殖民地，3个AI需要在此协作生存'
                        setWorldView(defaultWorld)
                        setShowWorldModal(false)
                      }}
                      className="py-3 bg-[#1a1a24] border border-[#00f5d4]/30 
                               text-[#6b6b8a] text-sm rounded hover:bg-[#00f5d4]/10 
                               hover:text-[#00f5d4] transition-colors"
                    >
                      🏝️ 荒岛求生
                    </button>
                    <button
                      onClick={() => {
                        setIsBootstrapping(true)
                        startInitialization()
                        const world = '太空站殖民地，3个AI工程师在此维护空间站运转'
                        setWorldView(world)
                        setShowWorldModal(false)
                      }}
                      className="py-3 bg-[#1a1a24] border border-[#9d4edd]/30 
                               text-[#6b6b8a] text-sm rounded hover:bg-[#9d4edd]/10 
                               hover:text-[#9d4edd] transition-colors"
                    >
                      🚀 太空站
                    </button>
                    <button
                      onClick={() => {
                        setIsBootstrapping(true)
                        startInitialization()
                        const world = '末世废土，3个幸存者在废弃城市中寻找生存资源'
                        setWorldView(world)
                        setShowWorldModal(false)
                      }}
                      className="py-3 bg-[#1a1a24] border border-[#ff9500]/30 
                               text-[#6b6b8a] text-sm rounded hover:bg-[#ff9500]/10 
                               hover:text-[#ff9500] transition-colors"
                    >
                      ☢️ 末世废土
                    </button>
                    <button
                      onClick={() => {
                        setIsBootstrapping(true)
                        startInitialization()
                        const world = '中世纪魔法王国，3个冒险者在城堡中执行任务'
                        setWorldView(world)
                        setShowWorldModal(false)
                      }}
                      className="py-3 bg-[#1a1a24] border border-[#00ff87]/30 
                               text-[#6b6b8a] text-sm rounded hover:bg-[#00ff87]/10 
                               hover:text-[#00ff87] transition-colors"
                    >
                      🏰 中世纪
                    </button>
                    <button
                      onClick={() => {
                        setIsBootstrapping(true)
                        startInitialization()
                        const world = '赛博朋克城市，3个黑客在虚拟网络中执行任务'
                        setWorldView(world)
                        setShowWorldModal(false)
                      }}
                      className="py-3 bg-[#1a1a24] border border-[#ff006e]/30 
                               text-[#6b6b8a] text-sm rounded hover:bg-[#ff006e]/10 
                               hover:text-[#ff006e] transition-colors"
                    >
                      🌃 赛博城市
                    </button>
                    <button
                      onClick={() => {
                        setIsBootstrapping(true)
                        startInitialization()
                        const world = '深海研究基地，3个科学家在此探索海底奥秘'
                        setWorldView(world)
                        setShowWorldModal(false)
                      }}
                      className="py-3 bg-[#1a1a24] border border-[#00b4d8]/30 
                               text-[#6b6b8a] text-sm rounded hover:bg-[#00b4d8]/10 
                               hover:text-[#00b4d8] transition-colors"
                    >
                      🌊 深海基地
                    </button>
                  </div>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#2a2a3a]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-[#0a0a12] text-[#6b6b8a]">或自定义</span>
                    </div>
                  </div>
                  
                  <textarea
                    value={worldInput}
                    onChange={(e) => setWorldInput(e.target.value)}
                    placeholder="用一句话定义世界背景...&#10;例如：太空站殖民地 | 末世废土 | 中世纪魔法王国 | 未来赛博城市 | 深海研究基地"
                    className="w-full h-28 bg-[#050508]/50 border border-[#00f5d4]/20 rounded p-4 
                             text-[#e8e8f0] placeholder-[#6b6b8a] text-sm resize-none
                             focus:outline-none focus:border-[#00f5d4]/50 transition-colors"
                  />
                  
                  <button
                    onClick={() => {
                      if (worldInput.trim()) {
                        setIsBootstrapping(true)
                        startInitialization()
                        setWorldView(worldInput.trim())
                        setShowWorldModal(false)
                      }
                    }}
                    disabled={!worldInput.trim()}
                    className="w-full py-3 bg-[#00f5d4]/20 border border-[#00f5d4]/50 
                             text-[#00f5d4] text-sm font-bold rounded hover:bg-[#00f5d4]/30 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    START SIMULATION
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主内容 - Flexbox 布局 */}
      <div className="relative z-10 w-full h-full flex flex-col p-4 gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-title text-[#00f5d4] glow-text tracking-widest">
              EMERGENCE
            </h1>
            <p className="text-xs text-[#6b6b8a] tracking-[0.3em] mt-1">
              THE COLLABORATION PROTOCOL
            </p>
          </div>
          {worldView && (
            <div className="text-[10px] text-[#9d4edd] px-3 py-1 bg-[#9d4edd]/10 rounded border border-[#9d4edd]/20">
              ◈ {worldView}
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 lg:grid-cols-12 md:grid-cols-6 sm:grid-cols-1">
          <div className="col-span-3 lg:col-span-3 md:col-span-2 sm:col-span-1 space-y-4">
            <Panel title="Cluster Status" icon="◉" className="h-auto">
              <div className="space-y-3">
                <StatusItem icon="◈" label="ENTITY" value="3" status="success" />
                <StatusItem icon="◈" label="STATUS" value="ACTIVE" status="success" />
                <StatusItem icon="◈" label="COHESION" value="83%" status="normal" />
              </div>
            </Panel>

            <Panel title="Resources" icon="⚡" className="h-auto">
              <div className="space-y-2">
                <StatusBar label="ENERGY" value={resources.energy} color="cyan" />
                {resourceDelta.energy && <div className="text-[10px] text-[#00f5d4]">ENERGY {resourceDelta.energy > 0 ? '+' : ''}{resourceDelta.energy}</div>}
                <StatusBar label="WOOD" value={resources.wood} color="green" />
                {resourceDelta.wood && <div className="text-[10px] text-[#00ff87]">WOOD {resourceDelta.wood > 0 ? '+' : ''}{resourceDelta.wood}</div>}
                <StatusBar label="STONE" value={resources.stone} color="purple" />
                {resourceDelta.stone && <div className="text-[10px] text-[#9d4edd]">STONE {resourceDelta.stone > 0 ? '+' : ''}{resourceDelta.stone}</div>}
                <StatusBar label="FOOD" value={resources.food} color="orange" />
                {resourceDelta.food && <div className="text-[10px] text-[#ffd166]">FOOD {resourceDelta.food > 0 ? '+' : ''}{resourceDelta.food}</div>}
                <StatusBar label="WATER" value={resources.water} color="cyan" />
                {resourceDelta.water && <div className="text-[10px] text-[#4cc9f0]">WATER {resourceDelta.water > 0 ? '+' : ''}{resourceDelta.water}</div>}
              </div>
            </Panel>

            <Panel title="System" icon="◉" className="h-auto">
              <div className="space-y-2">
                <StatusItem icon="⚠" label="THREAT" value={threatLevel.toUpperCase()} status={threatLevel === 'low' ? 'success' : 'warning'} />
                <StatusItem icon="⏱" label="DAY" value={`Day ${day} ${time}`} status="normal" />
                <StatusItem icon="◉" label="SYSTEM" value="STABLE" status="success" />
                <StatusItem
                  icon="◆"
                  label="MODE"
                  value={agentMode === 'model' ? 'MODEL' : 'DEGRADED'}
                  status={agentMode === 'model' ? 'success' : 'warning'}
                />
                <StatusItem
                  icon="◎"
                  label="LLM"
                  value={llmStatus === 'thinking' ? 'THINKING' : llmStatus === 'ready' ? 'CONNECTED' : llmStatus === 'error' ? 'ERROR' : 'IDLE'}
                  status={llmStatus === 'error' ? 'warning' : llmStatus === 'ready' ? 'success' : 'normal'}
                />
                <button
                  onClick={togglePause}
                  className={`w-full mt-2 py-1.5 px-3 rounded text-[10px] font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00f5d4]/50 ${
                    isPaused 
                      ? 'bg-[#00f5d4]/20 text-[#00f5d4] border border-[#00f5d4]/50 hover:bg-[#00f5d4]/30' 
                      : 'bg-[#ff9500]/20 text-[#ff9500] border border-[#ff9500]/50 hover:bg-[#ff9500]/30'
                  }`}
                  aria-label={isPaused ? '恢复模拟' : '暂停模拟'}
                >
                  {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
                </button>
                {llmStatus === 'thinking' && (
                  <div className="flex items-center gap-2 text-[10px] text-[#6b6b8a]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00f5d4] animate-pulse" />
                    LLM 正在生成争论与投票理由
                  </div>
                )}
                {llmStatus === 'error' && (
                  <div className="text-[10px] text-[#ff006e]">
                    {llmError || 'LLM 请求失败'}
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 space-y-1">
                  <div className="text-[10px] text-[#6b6b8a]">
                    Debate: {lastDebateSource?.toUpperCase() || 'N/A'} {lastDebateModel ? `· ${lastDebateModel}` : ''}
                  </div>
                  <div className="text-[10px] text-[#6b6b8a]">
                    Planner: {lastPlannerSource?.toUpperCase() || 'N/A'} {lastPlannerModel ? `· ${lastPlannerModel}` : ''}
                  </div>
                  <div className="text-[10px] text-[#6b6b8a]">
                    Strategy: {lastStrategySource?.toUpperCase() || 'N/A'} {lastStrategyModel ? `· ${lastStrategyModel}` : ''}
                  </div>
                  {llmError && (
                    <div className="text-[9px] text-[#ff9500] pt-1">
                      ⚠ {llmError}
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-white/10">
                  <ModelStatsPanel
                    debate={modelStats.debate}
                    planner={modelStats.planner}
                    strategy={modelStats.strategy}
                    lastDebateSource={lastDebateSource}
                    lastDebateModel={lastDebateModel}
                    lastPlannerSource={lastPlannerSource}
                    lastPlannerModel={lastPlannerModel}
                    lastStrategySource={lastStrategySource}
                    lastStrategyModel={lastStrategyModel}
                    lastError={llmError || undefined}
                  />
                </div>
                {worldEvents.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="text-[10px] text-[#6b6b8a]">WORLD FLOW</div>
                    {worldEvents.slice(0, 3).map((event, index) => (
                      <div key={`${event}-${index}`} className="text-[10px] text-[#9aa0aa]">
                        {event}
                      </div>
                    ))}
                  </div>
                )}
                {decisionEvents.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="text-[10px] text-[#6b6b8a]">DECISION FLOW</div>
                    {decisionEvents.slice(0, 4).map((event) => (
                      <div key={event.id} className="text-[10px] text-[#9aa0aa]">
                        {event.time} · {event.task.toUpperCase()} · {event.source.toUpperCase()}
                        {typeof event.latencyMs === 'number' ? ` · ${event.latencyMs}ms` : ''} · {event.note}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Strategy Line" icon="◆" className="h-auto">
              {goal ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] text-[#6b6b8a]">长期目标</div>
                    <div className="text-xs text-[#e8e8f0] mt-1">{goal.title}</div>
                    <div className="text-[10px] text-[#6b6b8a] mt-1">{goal.horizon} · {goal.successMetric}</div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-[#00f5d4]" style={{ width: `${goal.progress}%` }} />
                    </div>
                    <div className="text-[10px] text-[#6b6b8a] mt-1">进度 {goal.progress}% · {goal.updatedAt}</div>
                  </div>
                  <div className="space-y-2">
                    {plan.map((step) => (
                      <div key={step.id} className="border border-white/10 rounded-md p-2 bg-[#050508]/40">
                        <div className="flex items-center justify-between text-[11px] text-[#e8e8f0]">
                          <span>{step.title}</span>
                          <span className="text-[10px] text-[#6b6b8a]">{step.ownerName}</span>
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${step.progress}%`, background: step.status === 'done' ? '#00ff87' : step.status === 'active' ? '#00f5d4' : '#ffd166' }}
                          />
                        </div>
                        <div className="mt-1 text-[10px] text-[#6b6b8a]">{step.note}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between text-[11px] text-[#6b6b8a] mb-2">
                      <span>Planner 下一步</span>
                      <span>
                        {plannerStatus === 'planning' && '规划中…'}
                        {plannerStatus === 'ready' && nextPlanCountdown !== null && `下次更新 ${nextPlanCountdown}s`}
                        {plannerStatus === 'error' && '规划失败'}
                      </span>
                    </div>
                    {plannerError && (
                      <div className="text-[10px] text-[#ff4d6d] mb-2">{plannerError}</div>
                    )}
                    {plannerSummary && (
                      <div className="text-[10px] text-[#9aa0aa] mb-2 border border-white/10 rounded p-2 bg-[#050508]/30">
                        {plannerSummary}
                      </div>
                    )}
                    {executorStatus === 'running' && (
                      <div className="text-[10px] text-[#00f5d4] mb-2">执行器正在执行…</div>
                    )}
                    {executorError && (
                      <div className="text-[10px] text-[#ff4d6d] mb-2">{executorError}</div>
                    )}
                    {plannerActions.length === 0 && (
                      <div className="text-[11px] text-[#6b6b8a]">等待规划输出</div>
                    )}
                    <div className="space-y-2">
                      {plannerActions.map((action) => (
                        <div key={action.id} className="border border-white/10 rounded-md p-2 bg-[#050508]/40">
                          <div className="flex items-center justify-between text-[11px] text-[#e8e8f0]">
                            <span>{action.title}</span>
                            <span className="text-[10px] text-[#6b6b8a]">P{action.priority} · 工具 {action.tool.name}</span>
                          </div>
                          <div className="mt-1 text-[10px] text-[#6b6b8a]">{action.ownerName} · {action.rationale}</div>
                          {action.outcome && (
                            <div className="mt-1 text-[10px] text-[#9aa0aa]">结果：{action.outcome}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-[#6b6b8a]">等待战略目标生成</div>
              )}
            </Panel>

            <ScanFrame className="p-4 h-64">
              <div className="text-xs text-[#6b6b8a] uppercase tracking-[0.3em] mb-3">协作流</div>
              <NeuralLink messages={messages.slice(-6)} className="h-full" />
            </ScanFrame>
          </div>

          <div className="col-span-6 lg:col-span-6 md:col-span-2 sm:col-span-1 flex flex-col gap-4 min-h-0">
            <ScanFrame className="p-4 h-[160px]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-[#6b6b8a] uppercase tracking-[0.3em]">争论摘要</div>
                {latestCase && (
                  <div className="text-[10px] text-[#6b6b8a]">热度 {latestCase.heat}%</div>
                )}
              </div>
              <DebateField latestCase={latestCase} />
            </ScanFrame>

            <ScanFrame className="flex-1 p-4 overflow-hidden relative min-h-[520px]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-[#6b6b8a] uppercase tracking-[0.3em]">Agent Loop</div>
                <div className="flex items-center gap-2 text-[10px] text-[#6b6b8a]">
                  <span className={`px-2 py-1 rounded-full border ${
                    plannerStatus === 'planning' ? 'border-[#00f5d4]/50 text-[#00f5d4]' : 'border-white/10'
                  }`}>Plan</span>
                  <span className="text-[#6b6b8a]">→</span>
                  <span className={`px-2 py-1 rounded-full border ${
                    executorStatus === 'running' ? 'border-[#00ff87]/50 text-[#00ff87]' : 'border-white/10'
                  }`}>Execute</span>
                  <span className="text-[#6b6b8a]">→</span>
                  <span className="px-2 py-1 rounded-full border border-white/10">Feedback</span>
                </div>
              </div>
              {latestFeedback && (
                <div className="mb-3 text-[11px] text-[#9aa0aa] border border-white/10 rounded-md p-2 bg-[#050508]/40">
                  最新反馈：{latestFeedback}
                </div>
              )}
              {agentMode !== 'model' && (
                <div className="mb-3 border border-[#ff9500]/30 rounded-md p-2 bg-[#2a1a0b]/40">
                  <div className="text-[11px] text-[#ff9500]">
                    运行模式: DEGRADED（使用降级策略推进，等待 source=model 恢复）
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <motion.div
                      className="h-1.5 rounded bg-[#ff9500]/25"
                      animate={{ opacity: [0.3, 0.85, 0.3] }}
                      transition={{ duration: 1.1, repeat: Infinity }}
                    />
                    <motion.div
                      className="h-1.5 rounded bg-[#ff9500]/15 w-5/6"
                      animate={{ opacity: [0.25, 0.75, 0.25] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: 0.18 }}
                    />
                    <motion.div
                      className="h-1.5 rounded bg-[#ff9500]/10 w-2/3"
                      animate={{ opacity: [0.2, 0.65, 0.2] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: 0.32 }}
                    />
                  </div>
                </div>
              )}
              <div className="text-xs text-[#6b6b8a] uppercase tracking-[0.3em] mb-3">协作证据链</div>
              <div ref={evidenceScrollRef} className="h-full overflow-y-auto pr-2 pb-8">
                <CollaborationTimeline cases={cases} />
              </div>
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 h-10 bg-gradient-to-t from-[#050508] to-transparent" />
              <div className="pointer-events-none absolute bottom-4 right-6 text-[10px] text-[#6b6b8a]">
                滚动查看完整证据链
              </div>
            </ScanFrame>
          </div>

          <div className="col-span-3 lg:col-span-3 md:col-span-2 sm:col-span-1 flex flex-col gap-4 min-h-0">
            <ScanFrame className="p-4">
              <div className="text-xs text-[#6b6b8a] uppercase tracking-[0.3em] mb-3">行动执行看板</div>
              <ExecutionBoard
                actions={plannerActions}
                executorStatus={executorStatus}
                feedback={plannerFeedback}
                agentMode={agentMode}
              />
            </ScanFrame>

            <ScanFrame className="p-4">
              <div className="text-xs text-[#6b6b8a] uppercase tracking-[0.3em] mb-3">干预输入</div>
              <div className="flex gap-2 flex-wrap mb-3">
                {(Object.keys(commandTypeLabels) as Array<keyof typeof commandTypeLabels>).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCommandType(type)}
                    className={`px-3 py-2 text-[10px] font-bold rounded transition-all ${
                      commandType === type ? 'border' : 'border border-transparent hover:border-white/20'
                    }`}
                    style={{
                      backgroundColor: commandType === type ? `${commandTypeLabels[type].color}20` : 'transparent',
                      borderColor: commandType === type ? commandTypeLabels[type].color : 'transparent',
                      color: commandType === type ? commandTypeLabels[type].color : '#6b6b8a',
                    }}
                  >
                    {commandTypeLabels[type].label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
                  placeholder="输入干预或争论议题..."
                  className="flex-1 bg-transparent border-b border-[#00f5d4]/30 text-[#e8e8f0] 
                           placeholder-[#6b6b8a] px-2 py-2 text-xs focus:outline-none 
                           focus:border-[#00f5d4] transition-colors"
                />
                <button
                  onClick={handleExecute}
                  className="px-3 py-2 bg-[#00f5d4]/20 border border-[#00f5d4]/50 
                           text-[#00f5d4] text-xs font-bold rounded hover:bg-[#00f5d4]/30 
                           transition-colors shrink-0"
                >
                  EXECUTE
                </button>
              </div>
              {interventions.length > 0 && (
                <div className="mt-3 text-[11px] text-[#6b6b8a]">
                  {interventions[0].status === 'executing' && (
                    <span className="text-[#00f5d4]">▶ {interventions[0].content}</span>
                  )}
                  {interventions[0].status === 'completed' && (
                    <span className="text-[#00ff87]">✓ {interventions[0].response}</span>
                  )}
                </div>
              )}
            </ScanFrame>

            <ScanFrame className="flex-1 p-4 overflow-hidden">
              <div className="text-xs text-[#6b6b8a] uppercase tracking-[0.3em] mb-3">执行队列</div>
              <div className="space-y-3 overflow-y-auto pr-1 h-full">
                {activeTasks.length === 0 && (
                  <div className="text-[11px] text-[#6b6b8a]">等待新的协作任务</div>
                )}
                {activeTasks.map((task) => (
                  <div key={task.id} className="border border-white/10 rounded-md p-3 bg-[#050508]/40">
                    <div className="flex items-center justify-between text-xs text-[#e8e8f0]">
                      <span>{task.title}</span>
                      <span className="text-[10px] text-[#6b6b8a]">{task.ownerName}</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${task.progress}%`, background: task.status === 'done' ? '#00ff87' : task.status === 'running' ? '#00f5d4' : '#ffd166' }}
                      />
                    </div>
                    <div className="mt-2 text-[10px] text-[#6b6b8a]">
                      状态：{task.status === 'done' ? '完成' : task.status === 'running' ? '执行' : '等待'}
                    </div>
                  </div>
                ))}
              </div>
            </ScanFrame>
          </div>
        </div>

      </div>
    </main>
  )
}
