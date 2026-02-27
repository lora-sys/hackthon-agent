import { z } from 'zod'

const resourceImpactSchema = z.object({
  energy: z.number().int().optional(),
  wood: z.number().int().optional(),
  stone: z.number().int().optional(),
  food: z.number().int().optional(),
  water: z.number().int().optional(),
})

export const debateCaseSchema = z.object({
  title: z.string().min(4).max(80),
  trigger: z.string().min(4).max(140),
  debate: z.array(z.object({
    agent: z.enum(['ALEX', 'NOVA', 'ZETA']),
    stance: z.enum(['support', 'oppose', 'caution']),
    summary: z.string().min(4).max(140),
    confidence: z.number().min(0).max(1),
  })).min(3).max(3),
  voteReasons: z.object({
    yes: z.array(z.string()).min(1),
    no: z.array(z.string()).min(1),
    abstain: z.array(z.string()).min(1),
  }),
  tasks: z.array(z.object({
    owner: z.enum(['ALEX', 'NOVA', 'ZETA']),
    title: z.string().min(4).max(80),
  })).min(3).max(3),
  outcome: z.string().min(4).max(180),
  impact: resourceImpactSchema,
})

export const strategySchema = z.object({
  goal: z.object({
    title: z.string().min(4).max(90),
    horizon: z.string().min(2).max(32),
    successMetric: z.string().min(4).max(120),
  }),
  plan: z.array(z.object({
    owner: z.enum(['ALEX', 'NOVA', 'ZETA']),
    title: z.string().min(4).max(80),
    note: z.string().min(4).max(120),
  })).min(3).max(3),
})

const toolNameSchema = z.enum([
  'fetchResource',
  'buildModule',
  'surveyArea',
  'optimizeEnergy',
  'treatInjuries',
])

export const plannerSchema = z.object({
  summary: z.string().min(4).max(120),
  actions: z.array(z.object({
    owner: z.enum(['ALEX', 'NOVA', 'ZETA']),
    title: z.string().min(4).max(80),
    priority: z.number().int().min(1).max(3),
    tool: z.object({
      name: toolNameSchema,
      params: z.record(z.string(), z.union([z.string(), z.number()])),
    }),
    fallbackTool: z.object({
      name: toolNameSchema,
      params: z.record(z.string(), z.union([z.string(), z.number()])),
    }),
    compensation: z.object({
      name: z.enum(['optimizeEnergy', 'treatInjuries', 'surveyArea']),
      params: z.record(z.string(), z.union([z.string(), z.number()])),
    }),
    predictedImpact: resourceImpactSchema,
    rationale: z.string().min(4).max(140),
  })).length(3),
  overallImpact: resourceImpactSchema,
})

export type DebateCaseSeed = z.infer<typeof debateCaseSchema>
export type StrategySeed = z.infer<typeof strategySchema>
export type PlannerSeed = z.infer<typeof plannerSchema>
