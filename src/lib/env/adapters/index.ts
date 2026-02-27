import type { EnvAdapter } from '../types'
import { localEnvAdapter } from './local'
import { externalEnvAdapter } from './external'

const adapterMap: Record<string, EnvAdapter> = {
  local: localEnvAdapter,
  external: externalEnvAdapter,
}

export function getEnvAdapter(): EnvAdapter {
  const name = process.env.ENV_ADAPTER || 'local'
  return adapterMap[name] || localEnvAdapter
}
