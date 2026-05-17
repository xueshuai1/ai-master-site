import { Article } from '../knowledge';

export const article: Article = {
  id: "rl-011",
  title: "世界模型与 Model-Based RL：从预测到自进化",
  category: "rl",
  tags: ["世界模型", "Model-Based RL", "Model-Free RL", "环境建模", "自进化 Agent", "预测模型"],
  summary: "世界模型是 AI Agent 理解环境动态变化的核心能力。本文系统介绍世界模型的概念、三级能力分类（预测器、模拟器、自进化器）、Model-Based 与 Model-Free 强化学习的对比，以及 2026 年 Agentic World Modeling 的最新理论框架。",
  date: "2026-04-28",
  updatedAt: "2026-05-17",
  readTime: "24 分钟",
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

世界模型的核心价值在于：它让 Agent 能够在「想象」中规划，而不是盲目试错。**这种「想象式规划」在计算效率上的优势是巨大的**——假设一个任务需要 10 步行动，每步有 3 个可选动作，那么暴力搜索的空间是 3^10 = 59049 种可能。通过世界模型在「脑海」中推演，Agent 可以快速筛选出最优路径，而不需要实际执行所有可能的行动序列。`,
    },
    {
      title: "2. Model-Based vs Model-Free 强化学习",
      body: `强化学习的两大范式对世界模型的态度截然不同。

Model-Free RL（无模型强化学习）：不学习环境模型，直接通过大量试错来学习策略。Q-Learning、Policy Gradient、PPO 等方法都属于此类。

优点：不需要准确的模型，适用范围广。缺点：样本效率低，需要海量交互数据。在真实的物理环境中（如机器人控制、自动驾驶），每次试错都有实际成本——时间成本、能源成本和安全风险。因此，**Model-Free RL 在仿真环境中效果很好，但在真实物理世界中的应用受到样本效率的严重限制**。

Model-Based RL（基于模型的强化学习）：先学习环境模型（世界模型），然后在模型中规划最优策略。代表方法包括 MBPO、Dreamer、MuZero 等。

优点：样本效率高，能在「想象」中训练。缺点：模型误差会累积，可能导致规划偏差。**世界模型的误差每多一步，预测的准确性就指数级下降——这就是所谓的「模型误差累积效应」**。如何在学习准确世界模型的同时保持规划效率，是 Model-Based RL 的核心挑战。

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

L1 — Predictor（预测器）：学习单步局部转移算子。给定当前状态和动作，预测下一步的状态和奖励。这是最基础的世界模型能力。预测器的训练目标是最小化预测误差——即预测状态与真实状态之间的距离。

典型方法：学习一个神经网络 f(s, a) → (s', r)，使其预测的下一步状态和奖励尽可能接近真实值。这种方法的局限性在于它只能预测下一步，无法处理长期规划问题。

L2 — Simulator（模拟器）：将单步预测组合成多步、动作条件的推演，并尊重领域规律。它不仅能预测下一步，还能预测整个未来轨迹。

Simulator 的关键在于**多步一致性**——每一步的预测误差都会累积到后续步骤中。因此，Simulator 的训练不能简单地将单步预测器串联，而需要专门的训练方法（如 teacher forcing、课程学习等）来保证多步推演的稳定性。

L3 — Evolver（自进化器）：当预测与新证据不符时，自主修订自身模型。这是最高级的世界模型能力——模型能够自我更新、自我纠正。

核心特征：自主检测预测失败、自动调整模型参数或结构、持续学习新的环境规律。L3 Evolver 的核心挑战是如何区分「暂时性的预测失败」（如环境噪声）和「结构性的模型错误」（如环境规律发生了变化）。`,
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

代表性工作包括 World Models、DreamerV3 和 MuZero。其中 DreamerV3 在 2023 年实现了潜空间世界模型的重大突破——它不再直接在高维观察空间（如图像像素）中建模，而是先将观察压缩到低维潜空间，然后在潜空间中学习动态模型。这种方式大幅降低了建模难度和计算开销。

5.2 基于物理的模型

利用已知的物理方程作为世界模型。适用于机器人控制、自动驾驶等物理环境。例如，在无人机控制中，牛顿运动方程就是一个天然的世界模型——给定当前的速度、位置和推力，可以精确预测下一步的状态。

5.3 混合方法

结合学习方法和先验知识。这是目前最有前景的方向——用物理约束引导神经网络的学习，或用符号逻辑约束预测输出。SANA-WM 就是这种混合方法的典型代表：它利用物理引擎生成的仿真数据作为训练基础，同时用真实机器人数据进行 fine-tuning。`,
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

**数字 Agent 的世界模型具有独特的挑战**：数字环境（如网页、软件界面）的视觉变化和内部状态变化之间存在复杂的映射关系。同一个按钮在不同上下文中可能产生完全不同的效果。这意味着数字世界模型不仅需要理解视觉信号，还需要理解应用的业务逻辑和状态转换规则。

6.2 机器人控制

机器人通过世界模型预测「如果以这个力度抓取物体，物体会如何移动」。MuZero 的思想被广泛应用于实体机器人。SANA-WM 的 2.6B 参数模型代表了当前机器人世界模型的最高水平——它不仅能预测物体的运动轨迹，还能预测触觉反馈和力矩变化。

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
    {
      title: "11. 更新于 2026-05-17：NVIDIA SANA-WM 与世界模型新进展",
      body: `2026 年 5 月，世界模型领域出现了标志性进展，值得更新到本文。

**NVIDIA SANA-WM 2.6B 世界模型**

NVIDIA 发布了 **SANA-WM**（Scalable Agent Navigation Architecture - World Model），这是一个 2.6B 参数的世界模型，专为**物理 AI（Physical AI）**和机器人控制设计。

SANA-WM 的核心创新：

- **2.6B 参数规模**：远超此前大多数世界模型的参数量级（通常在 100M-500M 级别），这意味着更强的环境建模能力
- **多模态输入**：同时接受视觉、深度、触觉和本体感受（proprioception）信号，而非仅依赖视觉输入
- **实时预测**：在 NVIDIA Jetson 边缘计算平台上实现 < 10ms 的单步预测延迟，满足机器人实时控制需求
- **跨域泛化**：在仿真环境中训练的世界模型，能够直接部署到真实机器人上，无需额外的 domain adaptation

SANA-WM 的意义在于：它将世界模型从「强化学习的辅助工具」提升为**「物理 AI 的认知基础设施」**。在此之前，世界模型主要用于提高强化学习的样本效率；SANA-WM 展示了世界模型可以直接作为机器人控制的核心组件——机器人通过世界模型「想象」物理环境的下一步状态，然后基于想象结果做出控制决策。

**世界模型与具身智能的融合趋势**

2026 年上半年的行业趋势表明，世界模型正在从「强化学习研究领域」走向「具身智能（Embodied AI）的核心组件」：

| 时间 | 里程碑 | 意义 |
|------|--------|------|
| 2018 | World Models (Ha & Schmidhuber) | 世界模型概念首次提出 |
| 2020 | MuZero | 世界模型 + 蒙特卡洛树搜索 |
| 2023 | DreamerV3 | 潜空间世界模型的里程碑 |
| 2026.04 | Agentic World Modeling 论文 | 「Levels × Laws」分类框架 |
| 2026.05 | NVIDIA SANA-WM | 世界模型成为物理 AI 基础设施 |

**与本文的关联**：

SANA-WM 本质上是 Agentic World Modeling 框架中 **L2（Simulator）** 到 **L3（Evolver）** 之间的实现。它不仅能多步推演物理环境的未来状态（L2），还通过在线学习机制持续更新世界模型参数（接近 L3）。

此外，SANA-WM 主要处理**物理领域（Physical）**的规律建模，与本文第四节描述的四种规律领域框架完全对应。这进一步验证了 Agentic World Modeling 分类框架的实用价值。

**SANA-WM 与 DreamerV3 的技术对比**：

DreamerV3（2023 年发布）是潜空间世界模型的里程碑，它在 100M-500M 参数量级上实现了出色的环境建模能力。但 DreamerV3 的核心设计目标是通用强化学习——在 Atari、DeepMind Control Suite 等标准基准上追求 SOTA 性能。它的参数量受限于**强化学习训练的数据效率要求**——模型太大意味着需要更多的交互数据才能收敛。

SANA-WM 突破了这一限制：2.6B 的参数规模意味着它需要海量的训练数据才能有效训练。NVIDIA 的解决方案是**合成数据增强**——在仿真环境中生成大量的物理交互数据，同时引入真实机器人数据作为 fine-tuning。这种「仿真+真实」的混合训练策略使得大规模世界模型的训练成为可能。

**技术细节对比**：

| 维度 | DreamerV3 | SANA-WM 2.6B |
|------|-----------|-------------|
| 参数量 | ~100M | 2.6B |
| 训练数据 | 真实交互 | 仿真+真实混合 |
| 多模态输入 | 仅视觉 | 视觉+深度+触觉+本体感受 |
| 部署平台 | GPU 服务器 | Jetson 边缘设备 |
| 预测延迟 | ~100ms | < 10ms |
| 目标场景 | 通用 RL 基准 | 机器人物理控制 |

SANA-WM 的 < 10ms 预测延迟是一个工程上的重大突破。在机器人控制中，10ms 意味着 100Hz 的控制频率——这是工业级机器人控制的最低要求。此前的世界模型（包括 DreamerV3）通常需要 100ms 以上的推理时间，只能用于离线训练或低频控制场景。

**未来展望**：

- 世界模型的参数规模将继续增长，预计 2026 年底将出现 10B+ 参数的世界模型
- 世界模型将从单领域（物理/数字）向跨领域（物理+数字+社会）融合方向发展
- **世界模型 + Agent 记忆层**（参见 agent-062）的结合将是下一代 Agent 架构的核心——世界模型负责预测未来，记忆层负责回顾过去，两者结合构成 Agent 的完整「时间认知」能力
- 世界模型的开源化趋势：SANA-WM 的部分预训练权重预计将在 2026 年下半年开放，这将极大加速世界模型在学术界和工业界的普及`,
      mermaid: `graph TD
    A["世界模型演进路线"] --> B["2018: World Models\n概念提出"]
    B --> C["2020: MuZero\n规划 + 搜索"]
    C --> D["2023: DreamerV3\n潜空间建模"]
    D --> E["2026.04: Agentic WM\n分类框架"]
    E --> F["2026.05: SANA-WM 2.6B\n物理 AI 基础设施"]
    F --> G["2026H2: 10B+ WM\n跨领域融合"]
    
    style A fill:#1e3a5f,stroke:#2563eb,color:#fff
    style F fill:#047857,stroke:#059669,color:#fff
    style G fill:#b91c1c,stroke:#dc2626,color:#fff`,
      tip: "世界模型正在从学术研究快速走向工业应用。如果你在做机器人、自动驾驶、工业控制等物理 AI 相关项目，现在就开始关注世界模型技术——它不再是纯学术课题，而是正在改变行业的技术基础设施。SANA-WM 的开源化趋势意味着你可以直接在 Jetson 设备上测试世界模型能力，而不需要从头训练。",
      warning: "SANA-WM 虽然展示了强大的世界建模能力，但它主要面向 NVIDIA 硬件生态。在非 NVIDIA 平台（如 AMD GPU、Apple Silicon）上部署世界模型，目前仍面临工具链和性能优化的挑战。选型时需评估硬件锁定风险。"
    },
  ],
};
