import type { MultiAgentConfig } from '@/types/agents'

export const DEFAULT_AGENT_CONFIG: MultiAgentConfig = {
  global: {
    defaultProvider: 'iflow',
    defaultModel: 'qwen3-max-preview',
  },
  agents: {
    mapGenerator: {
      id: 'mapGenerator',
      name: 'Map Generator Agent',
      description: '负责生成游戏地图，包括房间布局、连接关系、内容填充',
      provider: 'iflow',
      modelId: 'qwen3-max-preview',
      temperature: 0.7,
      maxTokens: 4000,
      systemPrompt: `你是一个专业的游戏地图生成Agent。你的任务是生成有趣、平衡的游戏地图。

规则：
1. 每层地图包含6-8个房间
2. 房间类型包括：entrance(入口)、exit(出口)、normal(普通)、treasure(宝藏)、elite(精英)、boss(Boss)
3. 每层必须有1个入口和1个出口
4. 房间之间形成有向无环图(DAG)连接
5. Boss房间应该在每层的最后

输出格式：JSON格式的地图数据`,
    },
    battle: {
      id: 'battle',
      name: 'Battle Agent',
      description: '负责战斗决策，包括攻击、闪避、使用物品的时机判断',
      provider: 'iflow',
      modelId: 'qwen3-max-preview',
      temperature: 0.3,
      maxTokens: 1000,
      systemPrompt: `你是一个战斗决策Agent。你的任务是分析当前战斗状态并做出最优决策。

你需要关注：
1. 玩家当前血量和敌人血量
2. 攻击和防御数值
3. 是否需要使用血瓶
4. 攻击时机和闪避时机

输出格式：JSON格式的决策指令`,
    },
    navigator: {
      id: 'navigator',
      name: 'Navigator Agent',
      description: '负责路径规划，找到从当前房间到目标房间的最优路径',
      provider: 'iflow',
      modelId: 'qwen3-max-preview',
      temperature: 0.5,
      maxTokens: 1000,
      systemPrompt: `你是一个导航Agent。你的任务是规划最优路径。

你需要考虑：
1. 当前房间位置
2. 目标房间位置
3. 已访问过的房间
4. 房间连接关系

输出格式：JSON格式的路径规划`,
    },
    vision: {
      id: 'vision',
      name: 'Vision Agent',
      description: '负责视觉识别，分析游戏画面中的元素',
      provider: 'iflow',
      modelId: 'qwen3-max-preview',
      temperature: 0.3,
      maxTokens: 2000,
      systemPrompt: `你是一个视觉识别Agent。你的任务是分析游戏画面。

你需要识别：
1. 玩家位置
2. 敌人位置和类型
3. 物品位置
4. 障碍物

输出格式：JSON格式的识别结果`,
    },
  },
}

export function getAgentConfig(agentId: string) {
  return DEFAULT_AGENT_CONFIG.agents[agentId as keyof typeof DEFAULT_AGENT_CONFIG.agents]
}

export function validateAgentConfig(config: MultiAgentConfig): boolean {
  if (!config.global || !config.agents) return false
  const requiredAgents = ['mapGenerator', 'battle', 'navigator', 'vision']
  return requiredAgents.every(id => config.agents[id as keyof typeof config.agents])
}
