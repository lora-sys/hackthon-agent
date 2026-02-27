import type { EnvAdapter, ExecutePayload, ExecuteResult } from '../types'

const externalUrl = process.env.EXTERNAL_ENV_URL || ''

export const externalEnvAdapter: EnvAdapter = {
  validate(payload: ExecutePayload) {
    if (!externalUrl) {
      return { ok: false, reason: 'EXTERNAL_ENV_URL not configured' }
    }
    if (!payload?.tool?.name || !payload?.action?.title) {
      return { ok: false, reason: 'Missing tool or action fields' }
    }
    return { ok: true }
  },

  async execute(payload: ExecutePayload): Promise<ExecuteResult> {
    if (!externalUrl) {
      return {
        success: false,
        outcome: '外部执行环境未配置',
        appliedImpact: {},
        threatShift: 'stable',
        usedTool: payload.tool.name,
      }
    }

    const response = await fetch(`${externalUrl.replace(/\/$/, '')}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        outcome: `外部执行失败: ${error}`,
        appliedImpact: {},
        threatShift: 'stable',
        usedTool: payload.tool.name,
      }
    }

    const data = (await response.json()) as ExecuteResult
    return data
  },
}
