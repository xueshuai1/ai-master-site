import { Article } from '../knowledge';

export const article: Article = {
    id: "rl-guide",
    title: "强化学习导览",
    category: "rl",
    tags: ["强化学习", "学习导览", "Q-Learning", "DQN"],
    summary: "学习 AI 如何通过与环境交互来学习。从 MDP、Q-Learning 到策略梯度和 DQN，理解 AlphaGo、机器人控制、游戏 AI 的核心技术。",
    date: "2026-04-16",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 什么是强化学习？",
            body: `监督学习：给你答案，你学规律。
无监督学习：没答案，你找模式。
**强化学习：没答案，你试错，做对了给奖励。**

就像教狗握手——做对了给零食，做错了不给。狗自己学会。`
        },
        {
            title: "1. 学习路线",
            body: `强化学习的学习路线：

**MDP（马尔可夫决策过程）** — 状态、动作、奖励、转移概率

**Q-Learning** — 值函数、Bellman 方程

**策略梯度** — REINFORCE、Actor-Critic

**DQN（深度 Q 网络）** — 经验回放、目标网络`
        },
        {
            title: "2. 学习建议",
            body: `**实战项目：**
- 用 Q-Learning 让 Agent 学会走迷宫
- 用 DQN 玩 Atari 游戏

**前置要求：** 学过 Python、线性代数、概率论基础`
        },
        {
            title: "架构图示 1",
            mermaid: `graph TD
    A["概述"] --> B["原理"]
    B --> C["实现"]
    C --> D["应用"]
    D --> E["总结"]`,
        },
        {
            title: "架构图示 2",
            mermaid: `graph TD
    A["概述"] --> B["原理"]
    B --> C["实现"]
    C --> D["应用"]
    D --> E["总结"]`,
        },
    ]
};
