import { Article } from '../knowledge';

export const article: Article = {
    id: "rl-008",
    title: "多智能体强化学习 MARL",
    category: "rl",
    tags: ["MARL", "多智能体", "强化学习"],
    summary: "从独立 Q-Learning 到 MADDPG，理解多智能体强化学习的核心方法",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. 多智能体系统定义与挑战",
            body: `多智能体强化学习（Multi-Agent Reinforcement Learning, MARL）研究的是多个智能体在同一环境中交互学习的场景。与单智能体 RL 不同，MARL 环境中每个智能体的策略都会影响全局状态转移和其他智能体的奖励分布，这打破了马尔可夫决策过程中环境平稳性的核心假设。

多智能体系统面临三大核心挑战：环境非平稳性（每个智能体都在学习，环境动态持续变化）、信用分配问题（全局奖励如何归因到单个智能体的贡献）、以及可扩展性问题（智能体数量增长导致联合状态空间指数膨胀）。这些挑战使得直接将单智能体算法应用到多智能体场景往往效果不佳，需要专门设计的 MARL 算法来解决。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

class MultiAgentEnvironment:
    """多智能体环境基础定义"""
    def __init__(self, n_agents: int, state_dim: int, action_dim: int):
        self.n_agents = n_agents
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.state = np.zeros(state_dim)

    def step(self, actions: np.ndarray) -> tuple:
        # actions: shape (n_agents,), 联合动作决定下一状态
        joint_action = self._encode_joint_action(actions)
        next_state = self._transition(self.state, joint_action)
        rewards = self._compute_individual_rewards(self.state, joint_action)
        done = self._is_terminal(next_state)
        self.state = next_state
        return next_state, rewards, done, {}

    def _encode_joint_action(self, actions):
        return np.eye(self.action_dim ** self.n_agents)[0]  # 简化表示`
                },
                {
                    lang: "python",
                    code: `from enum import Enum

class MARLSetting(Enum):
    """多智能体系统分类"""
    COOPERATIVE = "cooperative"    # 所有智能体共享全局奖励
    COMPETITIVE = "competitive"    # 零和博弈，智能体相互对抗
    MIXED = "mixed"                # 混合动机，合作与竞争并存

class ObservationMode(Enum):
    FULLY_OBSERVABLE = "full"   # 全局状态完全可观测
    PARTIALLY_OBSERVABLE = "partial"  # 每个智能体只能看到局部观测

def classify_scenario(setting: MARLSetting, obs_mode: ObservationMode):
    settings = {
        (MARLSetting.COOPERATIVE, ObservationMode.FULLY_OBSERVABLE): "CTDE 或中心化方法",
        (MARLSetting.COOPERATIVE, ObservationMode.PARTIALLY_OBSERVABLE): "POMDP + CTDE",
        (MARLSetting.COMPETITIVE, ObservationMode.FULLY_OBSERVABLE): "博弈论方法",
        (MARLSetting.COMPETITIVE, ObservationMode.PARTIALLY_OBSERVABLE): "部分可观测博弈",
    }
    return settings.get((setting, obs_mode), "未知场景")`
                }
            ],
            table: {
                headers: ["场景类型", "奖励结构", "典型算法", "难度"],
                rows: [
                    ["完全合作", "共享全局奖励", "QMIX, VDN", "中"],
                    ["完全竞争", "零和博弈", "Self-Play, PSRO", "高"],
                    ["混合动机", "个体奖励", "MADDPG, COMA", "极高"],
                    ["通信受限", "局部观测+通信", "CommNet, IC3Net", "高"],
                ]
            },
            mermaid: `graph TD
    A["多智能体 RL"] --> B["合作型"]
    A --> C["竞争型"]
    A --> D["混合型"]
    B --> B1["共享奖励 QMIX"]
    B --> B2["值分解 VDN"]
    C --> C1["自我对弈"]
    C --> C2["纳什均衡求解"]
    D --> D1["MADDPG"]
    D --> D2["COMA"]`,
            tip: "从合作型场景开始学习 MARL 最为友好，QMIX 和 VDN 算法的理论相对直观",
            warning: "混合动机场景是最具挑战的，智能体既需要合作又存在竞争，收敛性难以保证"
        },
        {
            title: "2. 独立 Q-Learning：最朴素的多智能体方法",
            body: `独立 Q-Learning（Independent Q-Learning, IQL）是最直接的多智能体 RL 方法：每个智能体将其他智能体视为环境的一部分，独立运行标准 Q-Learning 算法。具体来说，每个智能体 i 维护自己的 Q 函数 Q_i(o_i, a_i)，其中 o_i 是局部观测，a_i 是自身动作。

IQL 的实现极其简单，无需智能体之间的通信或协调。然而，由于其他智能体也在不断学习，从单个智能体的视角来看，环境动态是非平稳的（non-stationary），这违背了 Q-Learning 收敛所需的马尔可夫性假设。尽管如此，IQL 在一些简单的合作任务中仍然能取得不错的效果，是理解 MARL 挑战的良好基线方法。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from collections import defaultdict

class IndependentQLearning:
    """独立 Q-Learning：每个智能体各自为战"""
    def __init__(self, obs_dim: int, action_dim: int, alpha=0.1, gamma=0.95, epsilon=0.1):
        self.action_dim = action_dim
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.q_table = defaultdict(lambda: np.zeros(action_dim))

    def select_action(self, obs: int) -> int:
        if np.random.random() < self.epsilon:
            return np.random.randint(self.action_dim)
        return int(np.argmax(self.q_table[obs]))

    def update(self, obs: int, action: int, reward: float, next_obs: int, done: bool):
        td_target = reward + (1 - done) * self.gamma * np.max(self.q_table[next_obs])
        td_error = td_target - self.q_table[obs][action]
        self.q_table[obs][action] += self.alpha * td_error`
                },
                {
                    lang: "python",
                    code: `# 多智能体 IQL 训练循环
def train_iql(env, n_agents, n_episodes, max_steps):
    agents = [IndependentQLearning(obs_dim=10, action_dim=5) for _ in range(n_agents)]

    for ep in range(n_episodes):
        obs = env.reset()
        episode_reward = np.zeros(n_agents)

        for step in range(max_steps):
            actions = [agents[i].select_action(obs[i]) for i in range(n_agents)]
            next_obs, rewards, done, _ = env.step(actions)

            for i in range(n_agents):
                agents[i].update(obs[i], actions[i], rewards[i], next_obs[i], done)
                episode_reward[i] += rewards[i]

            obs = next_obs
            if done:
                break

    return agents, episode_reward`
                }
            ],
            table: {
                headers: ["属性", "IQL 特点", "影响"],
                rows: [
                    ["算法复杂度", "O(n_agents) 独立运行", "极低"],
                    ["通信需求", "零通信", "无需额外开销"],
                    ["环境平稳性", "非平稳", "收敛性无保证"],
                    ["可扩展性", "线性扩展", "支持大量智能体"],
                ]
            },
            mermaid: `graph LR
    A["Agent 1"] --> Q1["Q1(o1, a1)"]
    B["Agent 2"] --> Q2["Q2(o2, a2)"]
    C["Agent N"] --> QN["QN(on, an)"]
    Q1 --> E["环境"]
    Q2 --> E
    QN --> E
    E -->|"reward r1"| A
    E -->|"reward r2"| B
    E -->|"reward rn"| C`,
            tip: "IQL 虽然简单，但作为 baseline 非常有价值，任何复杂的 MARL 算法都应该超越 IQL 的性能",
            warning: "IQL 在高度协调的任务中会完全失效，例如需要精确时序配合的任务"
        },
        {
            title: "3. CTDE 架构：集中训练分散执行",
            body: `CTDE（Centralized Training with Decentralized Execution）是多智能体 RL 中最成功的范式之一。核心思想是在训练阶段利用全局信息（所有智能体的观测和动作）进行学习，而在执行阶段每个智能体仅依赖局部观测做决策。

CTDE 巧妙地平衡了信息利用和执行效率之间的矛盾。训练时可以使用全局状态信息来指导策略学习，解决信用分配和非平稳性问题；执行时每个智能体只需要局部观测即可行动，保证了系统的可扩展性和鲁棒性。即使某个智能体离线，其余智能体仍能正常运作，因为它们的策略网络不依赖其他智能体的观测。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class CTDE_Mixer(nn.Module):
    """混合网络：将个体 Q 值混合为联合 Q 值"""
    def __init__(self, state_dim: int, n_agents: int, mixing_dim: int = 32):
        super().__init__()
        self.n_agents = n_agents
        self.hyper_w1 = nn.Linear(state_dim, n_agents * mixing_dim)
        self.hyper_b1 = nn.Linear(state_dim, mixing_dim)
        self.hyper_w2 = nn.Linear(state_dim, mixing_dim)
        self.hyper_b2 = nn.Linear(state_dim, 1)

    def forward(self, agent_qs: torch.Tensor, states: torch.Tensor) -> torch.Tensor:
        # agent_qs: (batch, n_agents), states: (batch, state_dim)
        w1 = torch.abs(self.hyper_w1(states))  # 保证单调性
        b1 = self.hyper_b1(states)
        w1 = w1.view(-1, self.n_agents, -1)
        b1 = b1.view(-1, 1, -1)
        hidden = F.elu(torch.bmm(agent_qs.unsqueeze(1), w1) + b1)

        w2 = torch.abs(self.hyper_w2(states))
        b2 = self.hyper_b2(states)
        y = torch.bmm(hidden, w2.unsqueeze(-1)) + b2
        return y.squeeze(-1).squeeze(-1)`
                },
                {
                    lang: "python",
                    code: `class CTDE_Agent(nn.Module):
    """分散执行：每个智能体只有局部观测网络"""
    def __init__(self, obs_dim: int, action_dim: int, hidden_dim: int = 64):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(obs_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim),
        )

    def forward(self, obs: torch.Tensor) -> torch.Tensor:
        """仅使用局部观测输出 Q 值"""
        return self.network(obs)

    def select_action(self, obs: torch.Tensor, epsilon: float) -> int:
        if torch.rand(1).item() < epsilon:
            return torch.randint(0, self.network[-1].out_features, (1,)).item()
        with torch.no_grad():
            q_values = self.forward(obs.unsqueeze(0))
            return int(q_values.argmax(dim=-1).item())`
                }
            ],
            table: {
                headers: ["阶段", "可用信息", "网络输入", "目的"],
                rows: [
                    ["训练", "全局状态 + 所有观测", "完整联合信息", "学习最优策略"],
                    ["执行", "局部观测", "个体观测 o_i", "独立行动"],
                    ["信用分配", "全局奖励 + 个体贡献", "所有 Q_i 值", "分解奖励信号"],
                ]
            },
            mermaid: `graph TB
    subgraph Training
        S["全局状态 s"] --> M["混合网络"]
        Q1["Q1(o1,a1)"] --> M
        Q2["Q2(o2,a2)"] --> M
        QN["QN(on,an)"] --> M
        M --> Qtot["Q_total(s, a)"]
        Qtot --> L["TD Loss"]
    end
    subgraph Execution
        o1["观测 o1"] --> A1["Agent 1 网络"]
        o2["观测 o2"] --> A2["Agent 2 网络"]
        on["观测 on"] --> AN["Agent N 网络"]
        A1 --> a1["动作 a1"]
        A2 --> a2["动作 a2"]
        AN --> an["动作 an"]
    end`,
            tip: "CTDE 的关键约束是混合网络需要对每个 Q_i 单调递增，这样才能保证 argmax 一致性",
            warning: "如果训练时的全局信息和执行时的局部观测差距过大，会导致策略退化"
        },
        {
            title: "4. MADDPG：多智能体深度确定性策略梯度",
            body: `MADDPG（Multi-Agent Deep Deterministic Policy Gradient）是 DDPG 在多智能体环境中的扩展，适用于连续动作空间。每个智能体拥有一个 Actor 网络和一个 Critic 网络。Actor 负责根据局部观测输出确定性动作，Critic 在训练时使用全局信息（所有智能体的观测和动作）来评估联合动作的价值。

MADDPG 的核心创新在于 Critic 的输入设计：训练时 Critic 接收所有智能体的观测 o_1, ..., o_N 和动作 a_1, ..., a_N，学习联合动作值函数 Q_i(o_1,...,o_N, a_1,...,a_N)。而 Actor 只依赖局部观测 o_i 输出动作 a_i。这种设计使得 Critic 可以学习智能体之间的交互效应，同时 Actor 在执行时保持独立性。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class MADDPG_Critic(nn.Module):
    """MADDPG Critic：使用全局信息评估联合动作"""
    def __init__(self, sum_obs_dim: int, sum_action_dim: int, hidden_dim: int = 128):
        super().__init__()
        self.q_network = nn.Sequential(
            nn.Linear(sum_obs_dim + sum_action_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1),
        )

    def forward(self, all_obs: torch.Tensor, all_actions: torch.Tensor) -> torch.Tensor:
        x = torch.cat([all_obs, all_actions], dim=-1)
        return self.q_network(x)`
                },
                {
                    lang: "python",
                    code: `class MADDPG_Actor(nn.Module):
    """MADDPG Actor：仅依赖局部观测"""
    def __init__(self, obs_dim: int, action_dim: int, action_range: float = 1.0):
        super().__init__()
        self.action_range = action_range
        self.policy = nn.Sequential(
            nn.Linear(obs_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Linear(128, action_dim),
            nn.Tanh(),  # 输出归一化到 [-1, 1]
        )

    def forward(self, obs: torch.Tensor) -> torch.Tensor:
        return self.policy(obs) * self.action_range

    def get_action_with_noise(self, obs: torch.Tensor, noise_std: float = 0.1):
        action = self(obs)
        noise = torch.randn_like(action) * noise_std
        return torch.clamp(action + noise, -self.action_range, self.action_range)`
                }
            ],
            table: {
                headers: ["组件", "输入", "输出", "训练时使用"],
                rows: [
                    ["Actor_i", "局部观测 o_i", "动作 a_i", "局部观测"],
                    ["Critic_i", "全局观测 + 所有动作", "Q_i 值", "全局信息"],
                    ["目标网络 Actor'", "局部观测 o_i", "目标动作", "局部观测"],
                    ["目标网络 Critic'", "全局观测 + 所有目标动作", "目标 Q 值", "全局信息"],
                ]
            },
            mermaid: `graph TD
    subgraph Agent_i
        A["Actor_i"] -->|"a_i = mu_i(o_i)"| E["环境"]
        C["Critic_i"] -->|"Q_i(o,a)"| U["TD 更新"]
    end
    E -->|"r_i, o_i'"| A
    E -->|"r_i"| C
    O1["o_1,...,o_N"] -.->|"全局信息"| C
    A1["a_1,...,a_N"] -.->|"联合动作"| C
    A -->|"soft update"| A_T["Target Actor_i"]
    C -->|"soft update"| C_T["Target Critic_i"]
    C_T --> U`,
            tip: "MADDPG 的目标网络 soft update（tau=0.01）对训练稳定性至关重要，不要使用硬更新",
            warning: "智能体数量增多时 Critic 输入维度线性增长，需要考虑参数共享来缓解维度灾难"
        },
        {
            title: "5. QMIX 值分解：从个体 Q 到联合 Q",
            body: `QMIX 是值分解方法中最具代表性的算法。它的核心思想是将联合动作值函数 Q_total 表示为个体 Q 值的非线性组合：Q_total = f_mix(Q_1, Q_2, ..., Q_N; s)。关键约束是混合函数 f_mix 对每个 Q_i 单调递增，即 dQ_total/dQ_i >= 0。

这个单调性约束保证了一个重要性质：每个智能体在本地选择最大化 Q_i 的动作，等价于联合动作最大化 Q_total。这使得分散执行时不需要智能体之间的协调。QMIX 使用超网络（Hypernetwork）根据全局状态 s 动态生成混合网络的参数，实现了状态依赖的非线性值分解，比线性方法（如 VDN）具有更强的表达能力。`,
            code: [
                {
                    lang: "python",
                    code: `class QMIX(nn.Module):
    """QMIX 混合网络实现"""
    def __init__(self, state_dim: int, n_agents: int, mixing_embed_dim: int = 32):
        super().__init__()
        self.n_agents = n_agents
        self.embed_dim = mixing_embed_dim

        # 超网络生成混合参数
        self.hyper_w_1 = nn.Linear(state_dim, self.embed_dim * n_agents)
        self.hyper_w_final = nn.Linear(state_dim, self.embed_dim)

        # State-dependent biases
        self.hyper_b_1 = nn.Linear(state_dim, self.embed_dim)
        self.hyper_b_final = nn.Linear(state_dim, 1)

    def forward(self, agent_qs: torch.Tensor, states: torch.Tensor) -> torch.Tensor:
        bs = agent_qs.size(0)
        agent_qs = agent_qs.view(-1, 1, self.n_agents)

        # 第一层：绝对值保证单调性
        w1 = torch.abs(self.hyper_w_1(states))
        b1 = self.hyper_b_1(states)
        w1 = w1.view(-1, self.n_agents, self.embed_dim)
        b1 = b1.view(-1, 1, self.embed_dim)
        hidden = F.elu(torch.bmm(agent_qs, w1) + b1)

        # 第二层
        w_final = torch.abs(self.hyper_w_final(states))
        w_final = w_final.view(-1, self.embed_dim, 1)
        b_final = self.hyper_b_final(states).view(-1, 1, 1)
        q_total = torch.bmm(hidden, w_final) + b_final
        return q_total.view(bs, -1, 1)`
                },
                {
                    lang: "python",
                    code: `def qmix_loss(q_total: torch.Tensor, target_q_total: torch.Tensor,
              agent_qs: torch.Tensor, target_agent_qs: torch.Tensor,
              actions: torch.Tensor, rewards: torch.Tensor,
              dones: torch.Tensor, gamma: float = 0.99) -> torch.Tensor:
    """QMIX TD 损失计算"""
    # 选择当前联合 Q 值
    chosen_q_total = torch.gather(q_total, dim=2, index=actions).squeeze(-1)

    # 计算目标 Q_total：每个智能体选择最大化个体 Q 的动作
    max_target_agent_qs = target_agent_qs.max(dim=-1, keepdim=True)[0]
    target_q_total_chosen = target_q_total.gather(
        dim=2, index=max_target_agent_qs.argmax(dim=-1)
    )

    # TD 目标
    td_target = rewards + gamma * (1 - dones) * target_q_total_chosen

    # TD 误差
    td_error = chosen_q_total - td_target.detach()
    loss = (td_error ** 2).mean()
    return loss`
                }
            ],
            table: {
                headers: ["方法", "分解方式", "表达能力", "单调性"],
                rows: [
                    ["IQL", "独立分解", "低", "无"],
                    ["VDN", "线性相加 Q_total = sum(Q_i)", "中", "天然满足"],
                    ["QMIX", "非线性混合 Q_total = f(Q_i, s)", "高", "显式约束"],
                    ["QTRAN", "通用分解", "最高", "优化保证"],
                ]
            },
            mermaid: `graph TD
    A["Q1(o1,a1)"] --> H["Hypernetwork\n(state-dependent weights)"]
    B["Q2(o2,a2)"] --> H
    C["Q3(o3,a3)"] --> H
    H -->|"|w1|, |w2|, |w3|"| M["混合层\nF.elu(dot product)"]
    M -->|"最终混合权重"| F["Q_total"]
    S["全局状态 s"] -.->|"生成参数"| H
    F -->|"最大化 argmax"| G["保证等价于\nargmax_i Q_i"]`,
            tip: "QMIX 的单调性约束虽然限制了表达能力，但保证了训练稳定性和分散执行的一致性",
            warning: "对于需要非单调协调策略的场景（如某些需要牺牲的角色），QMIX 可能不是最佳选择"
        },
        {
            title: "6. 博弈论基础：纳什均衡与 MARL",
            body: `博弈论为理解多智能体交互提供了严格的数学框架。在多智能体 RL 中，我们关注的是纳什均衡（Nash Equilibrium）：一个策略组合，使得没有任何智能体能够通过单方面改变自己的策略来获得更高收益。这是多智能体系统收敛的理论目标。

在多智能体学习中，收敛到纳什均衡远比单智能体收敛到最优策略困难。Fictitious Play 是最早的收敛算法之一：每个智能体假设对手使用历史平均策略并计算最优响应。在现代 MARL 中，PSRO（Policy Space Response Oracles）将这一思想扩展到深度强化学习领域，通过维护策略池和计算 meta-game 的近似纳什均衡来处理复杂的多智能体对抗。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from scipy.optimize import linprog

def solve_nash_equilibrium(payoff_matrix: np.ndarray) -> tuple:
    """求解 2 人零和博弈的纳什均衡（线性规划方法）"""
    n_actions = payoff_matrix.shape[0]

    # 行玩家的线性规划：最小化 v，约束为 A^T * p >= v * 1
    c = np.zeros(n_actions + 1)
    c[-1] = -1  # 最大化 v（等价于最小化 -v）

    A_ub = -np.hstack([payoff_matrix.T, np.ones((n_actions, 1))])
    b_ub = np.zeros(n_actions)

    # 概率约束：sum(p) = 1, p >= 0
    A_eq = np.zeros((1, n_actions + 1))
    A_eq[0, :-1] = 1
    b_eq = np.array([1.0])

    bounds = [(0, None)] * n_actions + [(None, None)]

    result = linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq, bounds=bounds)
    strategy = result.x[:-1]
    value = result.x[-1]
    return strategy, value`
                },
                {
                    lang: "python",
                    code: `class FictitiousPlay:
    """虚拟对局：经典博弈论学习算法"""
    def __init__(self, payoff_matrix: np.ndarray):
        self.payoff = payoff_matrix
        self.n_actions = payoff_matrix.shape[0]
        self.row_counts = np.ones(self.n_actions)  # 拉普拉斯平滑
        self.col_counts = np.ones(self.n_actions)

    def row_best_response(self) -> int:
        col_strategy = self.col_counts / self.col_counts.sum()
        expected_payoffs = self.payoff @ col_strategy
        return int(np.argmax(expected_payoffs))

    def col_best_response(self) -> int:
        row_strategy = self.row_counts / self.row_counts.sum()
        expected_costs = row_strategy @ self.payoff
        return int(np.argmin(expected_costs))

    def step(self, n_rounds: int = 1000):
        for _ in range(n_rounds):
            row_action = self.row_best_response()
            col_action = self.col_best_response()
            self.row_counts[row_action] += 1
            self.col_counts[col_action] += 1

        return self.row_counts / self.row_counts.sum(), \
               self.col_counts / self.col_counts.sum()`
                }
            ],
            table: {
                headers: ["概念", "定义", "在 MARL 中的作用"],
                rows: [
                    ["纳什均衡", "无人能通过单方面改变策略获益", "收敛目标"],
                    ["Pareto 最优", "无法让某人变好而不让别人变差", "合作任务目标"],
                    ["Fictitious Play", "对对手历史策略求平均并最优响应", "收敛性证明"],
                    ["PSRO", "策略池 + meta-game 纳什均衡", "扩展深度 MARL"],
                ]
            },
            mermaid: `graph LR
    A["博弈定义"] --> B["支付矩阵"]
    B --> C["最优响应计算"]
    C --> D["Fictitious Play"]
    D --> E{"收敛?"}
    E -->|"是"| F["纳什均衡"]
    E -->|"否"| G["循环行为"]
    G --> D
    F --> H["MARL 理论保证"]`,
            tip: "在对称博弈中，纳什均衡策略一定是对称的，可以利用这个性质简化学习",
            warning: "多智能体系统可能存在多个纳什均衡，不同初始条件会收敛到不同的均衡"
        },
        {
            title: "7. PettingZoo 实战：多智能体环境编程",
            body: `PettingZoo 是专门用于多智能体强化学习的 Python 库，由 Farama Foundation 维护。它提供了统一的多智能体环境 API，支持合作、竞争和混合场景。与 Gym 的单智能体接口不同，PettingZoo 采用 AEC（Agent Environment Cycle）模型，显式处理智能体轮流行动的场景。

PettingZoo 内置了丰富的环境：从简单的矩阵博弈（如石头剪刀布、 prisoner dilemma）到复杂的视觉任务（如 multiwalker、simple_spread），甚至包括 Atari 的多玩家版本和 Chess 等经典博弈。结合 stable-baselines3 的 PettingZoo 包装器（SB3），可以快速搭建完整的 MARL 训练流程。`,
            code: [
                {
                    lang: "python",
                    code: `from pettingzoo.mpe import simple_spread_v3
import numpy as np

# 创建多智能体环境
env = simple_spread_v3.parallel_env(
    N=3,              # 3 个智能体
    local_ratio=0.5,  # 局部观测权重
    max_cycles=25     # 最大步数
)
env.reset(seed=42)

# 获取智能体列表
agents = env.agents  # ["agent_0", "agent_1", "agent_2"]
print(f"智能体: {agents}")

# 并行交互（所有智能体同时行动）
for frame in range(100):
    # 随机动作
    actions = {
        agent: env.action_space(agent).sample()
        for agent in env.agents
    }
    observations, rewards, terminations, truncations, infos = env.step(actions)

    if all(terminations.values()) or all(truncations.values()):
        print(f"Episode 在第 {frame + 1} 步结束")
        break

env.close()`
                },
                {
                    lang: "python",
                    code: `import torch
from pettingzoo.mpe import simple_spread_v3
from supersuit import max_observation_v0, normalize_obs_v0

# 环境包装
env = simple_spread_v3.parallel_env(N=3, max_cycles=25)
env = max_observation_v0(env, frames=2)  # 帧堆叠
env = normalize_obs_v0(env)             # 观测归一化
env.reset(seed=42)

# 简单 Q 网络
class MARL_QNetwork(torch.nn.Module):
    def __init__(self, obs_dim, action_dim):
        super().__init__()
        self.net = torch.nn.Sequential(
            torch.nn.Linear(obs_dim, 64),
            torch.nn.ReLU(),
            torch.nn.Linear(64, 64),
            torch.nn.ReLU(),
            torch.nn.Linear(64, action_dim),
        )

    def forward(self, x):
        return self.net(x)

# 为每个智能体创建独立网络
nets = {
    agent: MARL_QNetwork(
        obs_dim=env.observation_space(agent).shape[0],
        action_dim=env.action_space(agent).n
    ) for agent in env.agents
}

print(f"为 {len(nets)} 个智能体创建了独立 Q 网络")
for name, net in nets.items():
    params = sum(p.numel() for p in net.parameters())
    print(f"  {name}: {params} 参数")`
                }
            ],
            table: {
                headers: ["环境", "类型", "智能体数", "观测类型"],
                rows: [
                    ["simple_spread", "合作", "2-5", "连续向量"],
                    ["simple_reference", "合作", "2", "连续向量"],
                    ["simple_tag", "混合", "4", "连续向量"],
                    ["multiwalker", "合作", "3", "连续向量"],
                ]
            },
            mermaid: `graph TD
    A["PettingZoo"] --> B["MPE 环境"]
    A --> C["Classic 环境"]
    A --> D["Atari 多玩家"]
    A --> E["SISL 环境"]
    B --> B1["simple_spread"]
    B --> B2["simple_tag"]
    C --> C1["tictactoe"]
    C --> C2["connect_four"]
    D --> D1["space_invaders"]
    E --> E1["multiwalker"]
    B1 --> F["SB3 训练"]
    B2 --> F
    E1 --> F
    F --> G["评估策略"]`,
            tip: "使用 parallel_env 而非 aec_env 可以获得更好的训练效率，因为所有智能体可以同时步进",
            warning: "PettingZoo 的 obs/reward 格式因环境而异，训练前务必检查观测空间和动作空间的定义"
        },
    ],
};
