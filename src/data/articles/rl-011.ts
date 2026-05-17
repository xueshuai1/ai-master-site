import { Article } from '../knowledge';

export const article: Article = {
  id: "rl-011",
  title: "世界模型与 Model-Based RL：从预测到自进化",
  category: "rl",
  tags: ["世界模型", "Model-Based RL", "Model-Free RL", "环境建模", "自进化 Agent", "预测模型"],
  summary: "世界模型是 AI Agent 理解环境动态变化的核心能力。本文系统介绍世界模型的概念、三级能力分类（预测器、模拟器、自进化器）、Model-Based 与 Model-Free 强化学习的对比，以及 2026 年 Agentic World Modeling 的最新理论框架。",
  date: "2026-04-28",
  readTime: "20 分钟",
  level: "进阶",
  content: [
    {
      title: "1. 什么是世界模型？",
      body: `世界模型（World Model）是 AI 系统对环境的内部表征——它让 Agent 能够在「脑海中」预测行动的后果，而不是每次都通过实际试错来学习。

这个概念最早由 Yann LeCun 提出：智能的核心能力之一就是预测未来。如果 AI 能够准确预测「如果我这样做，会发生什么」，它就能在不实际执行的情况下评估各种策略的优劣。

现实中的世界模型：

- 人类接球时，大脑会自动预测球的轨迹——这就是生物世界模型的体现。
- 棋手下棋时，会在脑中推演几步之后的局面——这也是世界模型。
- 自动驾驶系统预测其他车辆的行驶轨迹，同样是世界模型的应用。

世界模型的核心价值在于：它让 Agent 能够在「想象」中规划，而不是盲目试错。`,
    },
    {
      title: "2. Model-Based vs Model-Free 强化学习",
      body: `强化学习的两大范式对世界模型的态度截然不同。

Model-Free RL（无模型强化学习）：不学习环境模型，直接通过大量试错来学习策略。Q-Learning、Policy Gradient、PPO 等方法都属于此类。

优点：不需要准确的模型，适用范围广。
缺点：样本效率低，需要海量交互数据。

Model-Based RL（基于模型的强化学习）：先学习环境模型（世界模型），然后在模型中规划最优策略。代表方法包括 MBPO、Dreamer、MuZero 等。

优点：样本效率高，能在「想象」中训练。
缺点：模型误差会累积，可能导致规划偏差。

| 维度 | Model-Free | Model-Based |
|------|-----------|-------------|
| 样本效率 | 低（需大量交互） | 高（模型内规划） |
| 模型需求 | 不需要 | 需要准确的环境模型 |
| 规划能力 | 弱（仅依赖经验） | 强（可推演未来） |
| 泛化能力 | 较弱 | 较强 |
| 典型算法 | PPO, SAC, DQN | MuZero, Dreamer, MBPO |`,
      code: [
        {
          lang: "python",
          code: `# Model-Based RL 的核心循环
class ModelBasedAgent:
    def __init__(self):
        self.world_model = WorldModel()  # 环境模型
        self.policy = Policy()            # 决策策略
        self.planner = Planner()          # 规划器
    
    def train(self, env, steps):
        for step in range(steps):
            # 1. 收集真实经验
            obs, action, reward, next_obs = env.step(action)
            self.world_model.update(obs, action, next_obs, reward)
            
            # 2. 在世界模型中想象训练
            for _ in range(10):
                sim_obs = self.world_model.sample_state()
                sim_action = self.planner.plan(self.world_model, sim_obs)
                sim_next, sim_reward = self.world_model.predict(sim_obs, sim_action)
                self.policy.update(sim_obs, sim_action, sim_reward, sim_next)
            
            # 3. 选择真实动作
            action = self.planner.plan(self.world_model, obs)` }
      ]
    },
    {
      title: "3. 世界模型的三级能力分类",
      body: `2026 年 4 月，40 余位研究者联合发表的「Agentic World Modeling」论文提出了世界模型的「Levels × Laws」分类框架，这是目前最系统的世界模型理论体系。

三个能力等级：

L1 — Predictor（预测器）：学习单步局部转移算子。给定当前状态和动作，预测下一步的状态和奖励。这是最基础的世界模型能力。

典型方法：学习一个神经网络 f(s, a) → (s', r)，使其预测的下一步状态和奖励尽可能接近真实值。

L2 — Simulator（模拟器）：将单步预测组合成多步、动作条件的推演，并尊重领域规律。它不仅能预测下一步，还能预测整个未来轨迹。

关键能力：
- 多步推演：s → s' → s'' → s'''
- 尊重物理/数字/社会规律
- 能处理长期依赖关系

L3 — Evolver（自进化器）：当预测与新证据不符时，自主修订自身模型。这是最高级的世界模型能力——模型能够自我更新、自我纠正。

核心特征：
- 自主检测预测失败
- 自动调整模型参数或结构
- 持续学习新的环境规律`,
      mermaid: `graph TD
    L1["L1 Predictor
单步预测
s, a -> s', r"] --> L2["L2 Simulator
多步推演
尊重领域规律"]
    L2 --> L3["L3 Evolver
自主修正模型
预测失败时更新"]
    class L3 s2
    class L2 s1
    class L1 s0
    classDef s0 fill:#1e3a8a,stroke:#1e3a8a,color:#fff
    classDef s1 fill:#14532d,stroke:#14532d,color:#fff
    classDef s2 fill:#581c87,stroke:#581c87,color:#fff`,
    },
    {
      title: "4. 四种规律领域",
      body: `Agentic World Modeling 论文还定义了世界模型需要处理的四种规律领域：

物理领域（Physical）：对象运动、碰撞检测、重力等物理规律。机器人操作、自动驾驶需要此类模型。

数字领域（Digital）：软件环境、API 响应、网页状态变化。AI Agent 操作浏览器或调用 API 时需要此类模型。

社会领域（Social）：多智能体交互、博弈、合作与竞争。Multi-Agent 系统中的核心建模需求。

认知领域（Cognitive）：语言理解、知识推理、逻辑关系。LLM 驱动的 Agent 需要此类模型。

一个强大的通用 Agent 需要在这四个领域都有有效的世界模型。目前大多数系统只擅长其中 1-2 个领域。`,
    },
    {
      title: "5. 世界模型的经典实现方法",
      body: `5.1 基于学习的模型

用神经网络学习环境动态。核心思路：让网络预测 s_{t+1} = f(s_t, a_t)。

代表性工作：
- World Models（Ha & Schmidhuber, 2018）：用 VAE 压缩视觉输入，用 RNN 预测潜变量序列。
- DreamerV3（Hafner et al., 2023）：在潜空间中学习世界模型，并通过模型内想象训练策略。
- MuZero（Schrittwieser et al., 2020）：结合模型预测和蒙特卡洛树搜索，在 Atari、围棋、国际象棋上超越人类。

5.2 基于物理的模型

利用已知的物理方程作为世界模型。适用于机器人控制、自动驾驶等物理环境。

5.3 混合方法

结合学习方法和先验知识。例如：用物理约束引导神经网络的学习，或用符号逻辑约束预测输出。`,
      code: [
        {
          lang: "python",
          code: `# DreamerV3 风格的世界模型训练
import torch
import torch.nn as nn

class WorldModel(nn.Module):
    """潜空间世界模型"""
    def __init__(self, obs_dim, action_dim, latent_dim=64):
        super().__init__()
        # 编码器：观察 -> 潜状态
        self.encoder = nn.Sequential(
            nn.Linear(obs_dim, 256),
            nn.ReLU(),
            nn.Linear(256, latent_dim * 2)
        )
        # 动态模型：潜状态 + 动作 -> 下一个潜状态
        self.dynamics = nn.GRUCell(latent_dim + action_dim, latent_dim)
        # 奖励预测器
        self.reward_head = nn.Linear(latent_dim, 1)
        # 观察重建器
        self.decoder = nn.Linear(latent_dim, obs_dim)
    
    def imagine_trajectory(self, h, actions, horizon=10):
        """在世界模型中推演未来轨迹"""
        trajectories = []
        for t in range(horizon):
            h = self.dynamics(torch.cat([h, actions[t]], dim=-1), h)
            r = self.reward_head(h)
            trajectories.append({'state': h, 'reward': r})
        return trajectories` }
      ]
    },
    {
      title: "6. 世界模型在 Agent 中的应用",
      body: `6.1 数字 Agent（网页/软件操作）

AI Agent 在操作网页时，世界模型可以帮助预测「点击这个按钮后页面会变成什么样」。这大大减少了 Agent 需要执行的实际操作步骤。

6.2 机器人控制

机器人通过世界模型预测「如果以这个力度抓取物体，物体会如何移动」。MuZero 的思想被广泛应用于实体机器人。

6.3 多智能体协作

在 Multi-Agent 系统中，每个 Agent 需要对其他 Agent 的行为建模——这本质上是在构建一个「社会世界模型」。

6.4 LLM Agent 规划

LLM 驱动的 Agent 通过提示词中的「思维链」进行隐式世界模型推演。研究表明，给 LLM 提供明确的规划步骤可以大幅提升其在复杂任务中的表现。`,
    },
    {
      title: "7. 世界模型的挑战与前沿",
      body: `7.1 模型误差累积

多步推演中，每一步的小误差会累积放大。这是 Model-Based RL 的核心挑战。解决方案包括：
- 定期用真实经验校正模型
- 使用集成模型（ensemble）估计不确定性
- 在推演中引入保守策略

7.2 高维状态的表示学习

真实世界的观察（如图像）维度极高。如何压缩到低维潜空间同时保留关键信息，是核心难题。VAE 和对比学习是目前的主流方案。

7.3 自进化的世界模型

Agentic World Modeling 论文提出的 L3 Evolver 级别代表了最前沿：世界模型能够在预测失败时自主修正自身。这要求 Agent 不仅会预测，还要会「知道自己错了并改正」。

7.4 通用世界模型

当前的世界模型大多针对特定领域（物理/数字/社会/认知）。构建一个能同时处理多个领域的通用世界模型，是通往 AGI 的关键路径之一。`,
    },
    {
      title: "8. 实战：构建简单的 Model-Based Agent",
      body: `下面是一个简化的 Model-Based RL Agent 实现。它学习环境的动力学模型，然后在模型中规划行动。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

class SimpleModelBasedAgent:
    """简化的 Model-Based RL Agent"""
    def __init__(self, state_dim, action_dim):
        self.W = np.zeros((state_dim, state_dim + action_dim))
        self.b = np.zeros(state_dim)
        self.R = np.zeros(state_dim + action_dim)
        
    def update_world_model(self, states, actions, next_states, rewards):
        """用收集的经验更新世界模型"""
        X = np.hstack([states, actions])
        self.W = np.linalg.lstsq(X, next_states, rcond=None)[0].T
        self.b = np.mean(next_states - X @ self.W.T, axis=0)
        self.R = np.linalg.lstsq(X, rewards, rcond=None)[0]
    
    def plan(self, current_state, horizon=5, n_samples=50):
        """在世界模型中规划：随机采样动作序列，选最优"""
        best_reward = -np.inf
        best_action = 0
        for _ in range(n_samples):
            s = current_state.copy()
            total_reward = 0
            actions = []
            for _ in range(horizon):
                a = np.random.randint(0, 4)
                actions.append(a)
                a_onehot = np.zeros(4)
                a_onehot[a] = 1
                x = np.hstack([s, a_onehot])
                s = x @ self.W.T + self.b
                total_reward += x @ self.R
            if total_reward > best_reward:
                best_reward = total_reward
                best_action = actions[0]
        return best_action` }
      ]
    },
    {
      title: "9. 世界模型 vs RAG vs Fine-tuning",
      body: `三种提升 Agent 能力的技术路线有本质区别：

世界模型：学习环境的动态规律。回答「如果我这样做，会发生什么？」适用于需要与持续变化环境交互的场景。

RAG（检索增强生成）：从外部知识库检索相关信息。回答「关于这个话题，已知的信息是什么？」适用于需要准确知识的问答场景。

Fine-tuning：调整模型参数以适应特定任务。回答「如何更好地完成这类任务？」适用于需要专业化能力的场景。

| 技术 | 核心能力 | 适用场景 | 更新方式 |
|------|---------|---------|----------|
| 世界模型 | 预测未来状态 | 交互式规划 | 在线学习 |
| RAG | 检索已有知识 | 问答与推理 | 更新知识库 |
| Fine-tuning | 专业化能力 | 特定任务 | 重新训练 |`,
    },
    {
      title: "10. 总结与延伸阅读",
      body: `世界模型是 AI Agent 从「反应式」走向「规划式」的关键能力。通过构建环境的内部表征，Agent 能够在「脑海中」推演未来，大幅减少试错成本。

核心要点：

1. Model-Based RL 比 Model-Free RL 样本效率更高，但需要准确的环境模型
2. 世界模型有三个能力等级：预测器 → 模拟器 → 自进化器
3. 四种规律领域（物理、数字、社会、认知）需要不同的建模方法
4. 模型误差累积和高维表示学习是当前主要挑战
5. Agentic World Modeling 框架为理解世界模型提供了统一的理论视角

延伸阅读：

- Ha & Schmidhuber (2018): World Models
- Hafner et al. (2023): Mastering Diverse Domains through World Models (DreamerV3)
- Schrittwieser et al. (2020): Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model (MuZero)
- Chu et al. (2026): Agentic World Modeling: Foundations, Capabilities, Laws, and Beyond`,
    },
    {
        title: "架构图示",
        mermaid: `graph TD
    subgraph "World Model + Model-Based RL"
        E1["编码器<br/>观察 → 潜状态"] --> M1["世界模型<br/>预测下一状态"]
        M1 --> P1["策略网络<br/>在模型中规划"]
        P1 --> V1["价值网络<br/>状态评估"]
        V1 -->|"反馈"| P1
        P1 -->|"执行到环境"| E1
    end
    
    subgraph "学习循环"
        L1["想象环境中规划"] --> L2["选择最优行动"]
        L2 --> L3["真实环境执行"]
        L3 --> L4["观察结果"]
        L4 --> L5["更新世界模型"]
        L5 --> L1
    end
    
    style M1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style P1 fill:#b91c1c,stroke:#dc2626,color:#fff`,
    },
  ],
};
