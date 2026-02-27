# Agent 黑客松提交文案（可直接粘贴）

## 1) 项目名称（中文）

涌现协作协议（EMERGENCE）

## 2) 一句话介绍

一个由大模型驱动的多智能体协作系统：围绕争议议题自动完成 Debate → Planner → Execute → Feedback，并把世界状态变化实时可视化。

## 3) 项目描述（可直接粘贴）

本项目聚焦“AI Agent 是否真正推动世界演化”。系统以世界观为输入，让三个角色智能体围绕同一议题进行结构化争论，输出投票理由与执行动作，再通过工具执行层回写反馈，持续改变资源、风险与长期目标。

在工程实现上，我们采用 schema 驱动的结构化输出与流式渲染，避免纯文本解析不稳定；同时加入 planner 单飞去重、事件驱动更新、降级可视化和来源透明标记（MODEL/FALLBACK/CACHE），让评审能直接看见：何时是模型决策、何时是降级保护、以及状态为什么变化。

该项目适用于“协作决策演示”“Agent 系统验证”“复杂策略可解释可视化”等场景。

## 4) 主要亮点

1. 全链路 Agent 回路：Plan → Execute → Feedback，非单轮聊天。
2. 结构化争论与证据链：投票理由、因果影响、执行反馈同屏可追踪。
3. 模型来源透明：每次决策显示 MODEL/FALLBACK/CACHE 与模型名。
4. 稳定性增强：Planner 单飞、防请求风暴、超时与降级保护。
5. Demo 友好：自动演示脚本 + GitHub Pages 展示页。

## 5) 使用场景

- Hackathon 现场演示多 Agent 协作能力
- 策略系统的可解释执行回放
- 教学/展示“从推理到执行反馈”的智能体闭环

## 6) 技术栈

- Next.js 16 + React 19 + TypeScript
- Zustand（状态编排）
- Vercel AI SDK（结构化对象输出 / 流式）
- OpenAI-compatible providers（SiliconFlow / iFlow）
- GitHub Pages（静态演示页）

## 7) 必填项填写示例（请替换仓库地址）

- 前端演示地址: https://lora-sys.github.io/hackthon-agent/
- GitHub 仓库: https://github.com/lora-sys/hackthon-agent
- 关联活动: Agent 黑客松（按平台实际选项）

## 8) 评审讲解话术（30 秒）

我们不是做一个 AI 对话框，而是做一个“可执行、可验证、可解释”的 Agent 系统。你看到的每一步争论、投票、执行、反馈都会改写世界状态。系统会明确标记决策来源和模型信息，避免黑箱。即使上游模型抖动，也能通过降级策略保持可见进度与系统稳定，不会请求风暴或整屏卡死。
