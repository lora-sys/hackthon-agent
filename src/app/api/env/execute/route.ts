import { NextRequest, NextResponse } from 'next/server'
import { getEnvAdapter } from '@/lib/env/adapters'
import type { ExecutePayload } from '@/lib/env/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ExecutePayload
    const adapter = getEnvAdapter()
    const validation = adapter.validate(payload)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.reason || 'Invalid payload' }, { status: 400 })
    }

    const result = await adapter.execute(payload)
    if (adapter.compensate && !result.success) {
      await adapter.compensate(payload, result)
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
