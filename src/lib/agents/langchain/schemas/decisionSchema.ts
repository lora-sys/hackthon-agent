import { z } from 'zod'

export const PerceptionSchema = z.object({
  worldView: z.string(),
  resources: z.object({
    energy: z.number(),
    wood: z.number(),
    stone: z.number(),
    food: z.number(),
    water: z.number(),
  }),
  threatLevel: z.enum(['low', 'medium', 'high']),
  agents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    status: z.string(),
    energy: z.number(),
  })),
  currentTask: z.string().optional(),
  teamMessages: z.array(z.object({
    speaker: z.string(),
    content: z.string(),
    timestamp: z.string(),
  })),
})

export const DecisionSchema = z.object({
  action: z.object({
    type: z.enum(['move', 'build', 'gather', 'rest', 'explore', 'defend']),
    target: z.string().optional(),
    parameters: z.record(z.string(), z.any()).optional(),
  }),
  reasoning: z.string(),
  priority: z.number().min(1).max(3),
  estimatedDuration: z.number(),
})

export const AgentResultSchema = z.object({
  decision: DecisionSchema,
  action: z.object({
    type: z.string(),
    target: z.string().optional(),
    parameters: z.record(z.string(), z.any()).optional(),
  }),
  reasoning: z.string(),
  usedFallback: z.boolean(),
  perceptionSummary: z.string(),
})

export type Perception = z.infer<typeof PerceptionSchema>
export type Decision = z.infer<typeof DecisionSchema>
export type AgentResult = z.infer<typeof AgentResultSchema>