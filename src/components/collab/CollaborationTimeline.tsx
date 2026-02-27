'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { CollaborationCase, DebatePoint, TaskItem } from '@/stores/worldStore'

const statusStyles: Record<CollaborationCase['status'], { label: string; color: string }> = {
  debate: { label: '争论中', color: '#ffb703' },
  vote: { label: '投票中', color: '#00f5d4' },
  execution: { label: '执行中', color: '#9d4edd' },
  resolved: { label: '已落地', color: '#00ff87' },
}

const stanceStyles: Record<DebatePoint['stance'], { label: string; color: string }> = {
  support: { label: '支持', color: '#00ff87' },
  oppose: { label: '反对', color: '#ff4d6d' },
  caution: { label: '观望', color: '#ffd166' },
}

const stageOrder: CollaborationCase['status'][] = ['debate', 'vote', 'execution', 'resolved']

function stageIndex(status: CollaborationCase['status']) {
  return stageOrder.indexOf(status)
}

function StageRail({ status }: { status: CollaborationCase['status'] }) {
  const activeIndex = stageIndex(status)
  return (
    <div className="flex flex-col items-center gap-3">
      {stageOrder.map((stage, index) => {
        const isActive = index <= activeIndex
        const color = isActive ? statusStyles[stage].color : '#2a2a3a'
        return (
          <div key={stage} className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            {index < stageOrder.length - 1 && (
              <div className="w-px h-10" style={{ background: color, opacity: 0.4 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function formatImpact(impact?: CollaborationCase['impact']) {
  if (!impact) return []
  return Object.entries(impact).map(([key, value]) => ({
    key: key.toUpperCase(),
    value: typeof value === 'number' ? value : 0,
  }))
}

function computeRiskShift(impact?: CollaborationCase['impact']) {
  if (!impact) return { label: 'RISK STABLE', color: '#6b6b8a' }
  const total = Object.values(impact).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0)
  if (total >= 3) return { label: 'RISK DOWN', color: '#00ff87' }
  if (total <= -3) return { label: 'RISK UP', color: '#ff4d6d' }
  return { label: 'RISK STABLE', color: '#ffd166' }
}

function TaskRow({ task }: { task: TaskItem }) {
  return (
    <div className="flex items-center justify-between text-xs text-[#a1a1aa] border-b border-white/5 pb-2">
      <div className="flex items-center gap-2">
        <span className="text-[#00f5d4]">◈</span>
        <span>{task.title}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[#6b6b8a]">{task.ownerName}</span>
        <span className={`px-2 py-0.5 rounded-full border text-[10px] ${
          task.status === 'done'
            ? 'border-[#00ff87]/40 text-[#00ff87]'
            : task.status === 'running'
              ? 'border-[#00f5d4]/40 text-[#00f5d4]'
              : 'border-[#ffd166]/40 text-[#ffd166]'
        }`}>
          {task.status === 'done' ? '完成' : task.status === 'running' ? '执行' : '等待'}
        </span>
      </div>
    </div>
  )
}

function ReasonsPopover({
  title,
  reasons,
  color,
}: {
  title: string
  reasons: string[]
  color: string
}) {
  if (!reasons || reasons.length === 0) return null
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-[#6b6b8a]">{title}</div>
      {reasons.slice(0, 3).map((reason, index) => (
        <div key={`${title}-${index}`} className="text-[11px] text-[#9aa0aa] flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          <span>{reason}</span>
        </div>
      ))}
    </div>
  )
}

export function CollaborationTimeline({ cases }: { cases: CollaborationCase[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reasonsOpenId, setReasonsOpenId] = useState<string | null>(null)
  const [extraOpenId, setExtraOpenId] = useState<string | null>(null)
  const reasonsAnchorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (cases.length > 0) {
      setExpandedId(cases[0].id)
    }
  }, [cases])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!reasonsAnchorRef.current) return
      if (!reasonsAnchorRef.current.contains(event.target as Node)) {
        setReasonsOpenId(null)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  if (cases.length === 0) {
    return (
      <div className="text-[11px] text-[#6b6b8a]">
        等待第一个协作争论被触发
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cases.map((collabCase, index) => {
        const status = statusStyles[collabCase.status]
        const impacts = formatImpact(collabCase.impact)
        const expanded = expandedId === collabCase.id
        return (
          <motion.div
            key={collabCase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="relative bg-[#0a0a12]/80 border border-white/10 rounded-lg p-4"
          >
            <div className="absolute inset-y-0 left-0 w-1" style={{ background: status.color }} />

            <div className="flex gap-4">
              <StageRail status={collabCase.status} />

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#e8e8f0]">{collabCase.title}</h3>
                    <p className="text-xs text-[#6b6b8a] mt-1">{collabCase.trigger}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#6b6b8a] block">{collabCase.createdAt}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] mt-2 px-2 py-1 rounded-full border" style={{ color: status.color, borderColor: `${status.color}55` }}>
                      ◉ {status.label}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 items-center text-[11px]">
                  {collabCase.vote && (
                    <span className="px-2 py-1 rounded-full border border-[#00f5d4]/40 text-[#00f5d4]">
                      支持 {collabCase.vote.yes.length} · 反对 {collabCase.vote.no.length} · 观望 {collabCase.vote.abstain.length}
                    </span>
                  )}
                  {impacts.slice(0, 2).map((item) => (
                    <span key={item.key} className={`px-2 py-1 rounded-full border ${
                      item.value >= 0 ? 'border-[#00ff87]/40 text-[#00ff87]' : 'border-[#ff4d6d]/40 text-[#ff4d6d]'
                    }`}>
                      {item.key} {item.value >= 0 ? '+' : ''}{item.value}
                    </span>
                  ))}
                  <button
                    onClick={() => setExpandedId(expanded ? null : collabCase.id)}
                    className="ml-auto text-[10px] text-[#6b6b8a] hover:text-[#00f5d4] transition-colors"
                  >
                    {expanded ? '收起详情' : '展开详情'}
                  </button>
                </div>

                {expanded && (
                  <div className="mt-4 max-h-[340px] overflow-y-auto pr-1 space-y-4">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div className="border border-white/10 rounded-md p-3">
                        <div className="text-xs text-[#6b6b8a] mb-2">投票结果</div>
                        {collabCase.vote ? (
                          <>
                            <div className="flex items-center gap-2 text-xs text-[#e8e8f0]">
                              <span className="text-[#00ff87]">支持 {collabCase.vote.yes.length}</span>
                              <span className="text-[#ff4d6d]">反对 {collabCase.vote.no.length}</span>
                              <span className="text-[#ffd166]">观望 {collabCase.vote.abstain.length}</span>
                            </div>
                            <p className="text-[11px] text-[#9aa0aa] mt-2">{collabCase.vote.note}</p>
                            {collabCase.voteReasons && (
                              <div className="mt-3 relative">
                                <button
                                  onClick={() => setReasonsOpenId(reasonsOpenId === collabCase.id ? null : collabCase.id)}
                                  className="text-[10px] text-[#6b6b8a] hover:text-[#00f5d4] transition-colors"
                                >
                                  {reasonsOpenId === collabCase.id ? '收起投票理由' : '查看投票理由'}
                                </button>
                                {reasonsOpenId === collabCase.id && (
                                  <div
                                    ref={reasonsAnchorRef}
                                    className="absolute z-10 mt-2 w-64 rounded-md border border-[#00f5d4]/20 bg-[#0a0a12]/95 p-3 shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                                  >
                                    <ReasonsPopover title="支持理由" reasons={collabCase.voteReasons.yes} color="#00ff87" />
                                    <ReasonsPopover title="反对理由" reasons={collabCase.voteReasons.no} color="#ff4d6d" />
                                    <ReasonsPopover title="观望理由" reasons={collabCase.voteReasons.abstain} color="#ffd166" />
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-[11px] text-[#6b6b8a]">等待表决形成</p>
                        )}
                      </div>
                      <div className="border border-white/10 rounded-md p-3">
                        <div className="text-xs text-[#6b6b8a] mb-2">影响</div>
                        {impacts.length > 0 ? (
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {impacts.map((item) => (
                              <span key={item.key} className={`px-2 py-1 rounded-full border ${
                                item.value >= 0 ? 'border-[#00ff87]/40 text-[#00ff87]' : 'border-[#ff4d6d]/40 text-[#ff4d6d]'
                              }`}>
                                {item.key} {item.value >= 0 ? '+' : ''}{item.value}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-[#6b6b8a]">暂无结构性影响</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-[#6b6b8a]">立场与执行细节</div>
                      <button
                        onClick={() => setExtraOpenId(extraOpenId === collabCase.id ? null : collabCase.id)}
                        className="text-[10px] text-[#6b6b8a] hover:text-[#00f5d4] transition-colors"
                      >
                        {extraOpenId === collabCase.id ? '收起细节' : '展开细节'}
                      </button>
                    </div>

                    {extraOpenId === collabCase.id && (
                      <>
                        <div className="grid grid-cols-3 gap-3">
                          {collabCase.debate.map((point) => {
                            const stance = stanceStyles[point.stance]
                            return (
                              <div key={point.agentId} className="border border-white/10 rounded-md p-3 bg-[#050508]/40">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-[#e8e8f0]">{point.agentName}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ color: stance.color, borderColor: `${stance.color}55` }}>
                                    {stance.label}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#9aa0aa] mt-2 leading-relaxed">{point.summary}</p>
                                <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${Math.round(point.confidence * 100)}%`, background: stance.color }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="border border-white/10 rounded-md p-3">
                          <div className="text-xs text-[#6b6b8a] mb-3">执行链</div>
                          <div className="space-y-2">
                            {collabCase.tasks.map((task) => (
                              <TaskRow key={task.id} task={task} />
                            ))}
                          </div>
                        </div>

                        <div className="border border-white/10 rounded-md p-3">
                          <div className="text-xs text-[#6b6b8a] mb-3">因果标记线</div>
                          <div className="flex items-center gap-3 text-[11px] text-[#9aa0aa]">
                            <span className="px-2 py-1 rounded-full border border-[#00f5d4]/40 text-[#00f5d4]">任务执行</span>
                            <span className="text-[#6b6b8a]">→</span>
                            <span className="px-2 py-1 rounded-full border border-[#9d4edd]/40 text-[#9d4edd]">资源变化</span>
                            <span className="text-[#6b6b8a]">→</span>
                            {(() => {
                              const risk = computeRiskShift(collabCase.impact)
                              return (
                                <span className="px-2 py-1 rounded-full border" style={{ borderColor: `${risk.color}55`, color: risk.color }}>
                                  {risk.label}
                                </span>
                              )
                            })()}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="text-[11px] text-[#9aa0aa]">
                      <span className="text-[#6b6b8a]">结果：</span>
                      {collabCase.outcome || '正在整理结果'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
