# Emergence — The Collaboration Protocol

- **Realtime AI-agent debate**: Neural cases stream from SiliconFlow/iFlow planners, strategies, and debate chains with live evidence, voting, decision events, and resource impact.
- **Agent execution loop**: Strategy → Planner → Execution tooling → Feedback → Risk tracking, all orchestrated by `worldStore`.
- **Resilient LLM flow**: Streamed schema responses, single-flight planner dedupe, adaptive backoff, degraded-mode skeleton UI, and visual model stats keep the experience understandable even when providers rate-limit.
- **Design goal**: Showcase how a multi-agent debate/plan/execution system can look modern, cinematic, and data-rich without losing referential transparency.

## Quickstart

```bash
npm install
npm run dev
```

1. Point your browser to `http://localhost:3000`.
2. Pick a world-view scenario or define your own prompt.
3. Observe the debate field, collaboration evidence, action board, and resource bars react to streamed LLM decisions.
4. Use the intervention input to issue custom commands and let the agent loop drive plan/feed back/execution visuals.

## Key files

- `src/stores/worldStore.ts`: central Zustand store, decision sweep, planner execution, feedback rollouts, degraded handling.
- `src/lib/ai/agent.ts`: schema-driven object fetchers, stream parsers, fallback builders, and AI helpers.
- `src/app/api/agent/object/stream/route.ts`: iFlow/OpenAI-compatible stream endpoint with planner single-flight, adaptive timeouts, and SSE output.
- `src/app/page.tsx`: client UI wiring — timeline, planner/execution panels, strategy line, toast + initialization gating.
- `scripts/record-demo.sh`: automated agent-browser demo capture for showcasing the UX.

## Workflow helpers

- `npm run lint` → eslint `src`
- `npm run typecheck` → `tsc --noEmit`
- `npm run record:demo` → records a no-narration auto demo to `tmp/demo-stable-final.webm` (Playwright).
- Keep `.env.local` model keys ready:
  - `SILICONFLOW_API_KEY` (or `ILICONFLOW_API_KEY` alias)
  - optional `IFLOW_API_KEY` as fallback

## GitHub Pages demo

- Static demo page source lives in `docs/`
- Workflow file: `.github/workflows/pages.yml`
- After pushing `main`, enable **Settings → Pages → Source: GitHub Actions**
- Demo page contains logo, screenshot, and auto-demo video for reviewers.

---

# Emergence — 协作协议

- **实时 AI 智能体争论**：Debate/Planner/Strategy 流以结构化 schema 输出，Evidence Chain 与投票/执行影响同步流式显示。
- **Agent 执行循环**：Strategy → Planner → Execution → Feedback → 风险反馈完整链条由 `worldStore` 控制。
- **鲁棒性设计**：流式 schema、Planner 单飞防抖、适应性超时、降级骨架反馈，以及模型统计面板让系统可视可检。
- **视觉目标**：打造既具有赛博美学又能体现因果关系的 agent 体验，突出协作证据及资源影响。

## 快速启动

```bash
npm install
npm run dev
```

1. 浏览器打开 `http://localhost:3000`
2. 选择一个世界观或自定义提示词
3. 观察争论场、协作证据链、执行看板、资源条随着流式规划、执行动作变化
4. 在干预输入中下指令，让 agent 循环展示计划→执行→回馈

## 核心文件

- `src/stores/worldStore.ts`：Zustand 中枢，Planner、Execution、Feedback、降级控制全部在这里。
- `src/lib/ai/agent.ts`：schema 驱动的对象调用/流式解析/兜底生成、工具函数（AI 响应、思考）。
- `src/app/api/agent/object/stream/route.ts`：iFlow + SSE 的流式对象输出，含 Planner 单飞、adaptive timeout、cache/dedupe/meta 推送。
- `src/app/page.tsx`：前端界面与状态连接点，timeline、执行板、战略线、toast 初始态控制。
- `scripts/record-demo.sh`：自动化 agent-browser demo 录像（备用方案）。
- `scripts/record-demo-playwright.mjs`：Playwright 自动录制（默认推荐）。

## 工程辅助

- `npm run lint` → eslint `src`
- `npm run typecheck` → `tsc --noEmit`
- `npm run record:demo` → 无旁白自动录制，输出 `tmp/demo-stable-final.webm`
- `.env.local` 推荐配置：
  - `SILICONFLOW_API_KEY`（主）
  - `IFLOW_API_KEY`（可选兜底）
