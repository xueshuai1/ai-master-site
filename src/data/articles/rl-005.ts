import { Article } from '../knowledge';

export const article: Article = {
    id: "rl-005",
    title: "Actor-Critic：A2C 与 A3C",
    category: "rl",
    tags: ["Actor-Critic", "A2C", "A3C"],
    summary: "结合值方法和策略梯度，理解 Actor-Critic 架构的优势",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. Actor-Critic 架构：策略网络 + 值网络",
            body: `Actor-Critic 是强化学习中将值方法和策略梯度方法融合的经典架构。它包含两个核心组件：Actor（策略网络）负责根据当前状态选择动作，本质上是一个参数化的随机策略 pi(a|s; theta)；Critic（值网络）负责评估 Actor 选择动作的好坏，通常估计状态值 V(s; w) 或动作值 Q(s,a; w)。

与纯策略梯度方法（如 REINFORCE）相比，Actor-Critic 的最大优势在于引入了 Critic 来降低梯度估计的方差。REINFORCE 依赖完整 episode 的回报，方差大、学习慢。Critic 提供了即时的评估信号，使得 Actor 可以逐步更新而非等待 episode 结束。同时，Actor-Critic 保持了策略梯度方法的天然优势：可以处理连续动作空间，并且策略本身是参数化的概率分布。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class ActorCriticNetwork(nn.Module):
    """Actor-Critic 共享特征提取网络"""
    def __init__(self, state_dim: int, action_dim: int, hidden_dim: int = 128):
        super().__init__()
        self.shared = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )
        self.actor_head = nn.Linear(hidden_dim, action_dim)
        self.critic_head = nn.Linear(hidden_dim, 1)

    def forward(self, state):
        features = self.shared(state)
        action_probs = F.softmax(self.actor_head(features), dim=-1)
        state_value = self.critic_head(features)
        return action_probs, state_value`
                },
                {
                    lang: "python",
                    code: `class ActorCriticAgent:
    def __init__(self, state_dim: int, action_dim: int, lr: float = 3e-4):
        self.network = ActorCriticNetwork(state_dim, action_dim)
        self.optimizer = torch.optim.Adam(self.network.parameters(), lr=lr)

    def select_action(self, state):
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        action_probs, state_value = self.network(state_tensor)
        dist = torch.distributions.Categorical(action_probs)
        action = dist.sample()
        return action.item(), dist.log_prob(action), state_value

    def compute_returns(self, rewards, dones, gamma=0.99):
        """Compute discounted returns for Critic evaluation"""
        returns = []
        R = 0
        for reward, done in zip(reversed(rewards), reversed(dones)):
            if done:
                R = 0
            R = reward + gamma * R
            returns.insert(0, R)
        return returns`
                }
            ],
            table: {
                headers: ["组件", "网络输出", "训练目标", "对应传统方法"],
                rows: [
                    ["Actor", "动作概率分布 pi(a|s)", "最大化优势函数加权对数概率", "策略梯度方法"],
                    ["Critic", "状态值 V(s) 或 Q(s,a)", "最小化时序差分误差", "值函数方法 (TD/Q-learning)"],
                    ["共享特征层", "状态表征向量", "被两个头的梯度共同更新", "多任务学习的共享表示"],
                    ["优势函数 A(s,a)", "由 Critic 推导", "衡量动作相对平均水平的优劣", "REINFORCE with baseline"],
                ]
            },
            mermaid: `graph TD
    S["State s"] --> F["Shared Feature Extractor"]
    F --> A["Actor Policy Head"]
    F --> C["Critic Value Head"]
    A --> P["Action Prob pi(a|s)"]
    P --> Act["Sample Action a"]
    C --> V["State Value V(s)"]
    Act --> Env["Environment"]
    Env --> R["Reward r + New State s_prime"]
    V --> TD["Compute TD Error"]
    R --> TD
    TD -->|"Update Policy"| A
    TD -->|"Update Value Function"| C`,
            tip: "共享特征提取层是 Actor-Critic 设计的关键。Actor 和 Critic 需要理解相同的环境信息，共享表示可以提高样本效率。但当两者目标差异过大时，可以考虑独立网络。",
            warning: "Actor 和 Critic 的学习速率需要仔细调节。Critic 学习太快会导致 Actor 的梯度信号不稳定；学习太慢则无法提供有效的评估反馈。通常 Critic 的学习速率略高于 Actor。"
        },
        {
            title: "2. 优势函数 Advantage：减少方差的基线技巧",
            body: `优势函数 A(s,a) 是 Actor-Critic 架构中最核心的概念之一。它的定义是：A(s,a) = Q(s,a) - V(s)，表示在状态 s 下采取动作 a 相比于该状态平均水平的优势。当 A(s,a) > 0 时，说明这个动作比平均水平好，应该增加其概率；当 A(s,a) < 0 时，说明这个动作不如平均水平，应该降低其概率。

在策略梯度定理中引入优势函数作为基线（baseline），可以显著降低梯度估计的方差。数学上，策略梯度可以写作：gradient = E[log pi(a|s) * A(s,a)]。基线的选择不影响梯度的无偏性（因为 E[log pi(a|s)] = 0），但选择合适的基线可以大幅降低方差。在实践中，V(s) 是最常用的基线估计器，通过 Critic 网络学习得到。`,
            code: [
                {
                    lang: "python",
                    code: `class AdvantageCalculator:
    """Compute different forms of advantage function"""

    @staticmethod
    def td_advantage(rewards, values, dones, gamma=0.99):
        """Single-step TD error as advantage estimate
        A(s,a) = r + gamma*V(s') - V(s) = TD error
        """
        advantages = []
        for t in range(len(rewards)):
            if dones[t]:
                adv = rewards[t] - values[t]
            else:
                adv = rewards[t] + gamma * values[t + 1] - values[t]
            advantages.append(adv)
        return advantages

    @staticmethod
    def nstep_advantage(rewards, values, dones, gamma=0.99, n=5):
        """n-step advantage: trade-off between bias and variance
        Larger n reduces bias but increases variance
        """
        advantages = []
        for t in range(len(rewards)):
            G = 0
            for i in range(n):
                if t + i >= len(rewards):
                    break
                if i > 0 and dones[t + i - 1]:
                    break
                G += (gamma ** i) * rewards[t + i]
            if t + n < len(values) and not dones[t + n - 1]:
                G += (gamma ** n) * values[t + n]
            advantages.append(G - values[t])
        return advantages`
                },
                {
                    lang: "python",
                    code: `def actor_critic_update(
    log_probs: list,
    advantages: list,
    critic_losses: list,
    optimizer: torch.optim.Optimizer,
    entropy_coef: float = 0.01
):
    """Execute one Actor-Critic update step

    Args:
        log_probs: log pi(a|s) for each step
        advantages: advantage estimate for each step
        critic_losses: Critic MSE loss for each step
        optimizer: optimizer
        entropy_coef: entropy regularization coefficient
    """
    actor_loss = -torch.stack([
        lp.detach() * adv for lp, adv in zip(log_probs, advantages)
    ]).mean()

    critic_loss = torch.stack(critic_losses).mean()

    entropy = -torch.stack([
        torch.sum(torch.exp(lp) * lp) for lp in log_probs
    ]).mean()

    total_loss = actor_loss + critic_loss - entropy_coef * entropy

    optimizer.zero_grad()
    total_loss.backward()
    torch.nn.utils.clip_grad_norm_(optimizer.param_groups[0]["params"], 0.5)
    optimizer.step()

    return actor_loss.item(), critic_loss.item(), entropy.item()`
                }
            ],
            table: {
                headers: ["优势估计方法", "公式", "偏差", "方差", "适用场景"],
                rows: [
                    ["单步 TD", "r + gamma*V(s') - V(s)", "较高", "低", "在线学习，快速更新"],
                    ["蒙特卡洛", "G_t - V(s)", "无偏", "很高", "回合结束更新"],
                    ["n 步回报", "G_t^{(n)} - V(s)", "中等", "中等", "通用，n 是可调超参"],
                    ["GAE", "加权多步 TD 误差", "可调", "可调", "最先进的 Actor-Critic 算法"],
                    ["V 作为基线", "Q(s,a) - V(s)", "依赖 Q 精度", "低于 MC", "理论推导常用"],
                ]
            },
            mermaid: `graph LR
    A["Action a"] --> B["Q(s,a) Estimate"]
    C["State s"] --> D["V(s) Estimate"]
    B --> E["A(s,a) = Q - V"]
    D --> E
    E --> F["A > 0: increase prob"]
    E --> G["A < 0: decrease prob"]
    F --> H["Policy Update"]
    G --> H
    class E s0
    classDef s0 fill:#0c4a6e`,
            tip: "优势函数比直接用回报更新策略更稳定。直觉：它告诉 Agent 这个动作是好于还是差于平均水平，而不是简单地告诉回报是多少。",
            warning: "如果 Critic 的 V(s) 估计非常不准确（比如训练初期），优势函数会引入系统性偏差。训练初期可以考虑用更大的 Critic 学习率或预热策略。"
        },
        {
            title: "3. A2C：同步优势 Actor-Critic",
            body: `A2C（Advantage Actor-Critic）是 Actor-Critic 的同步版本，由 **OpenAI** 在 2017 年提出。它的核心思想是使用多个并行的环境副本（通常是 8-32 个）同时收集经验，然后同步更新共享的 Actor-Critic 网络。

与 A3C 的异步更新不同，A2C 的每个 worker 收集固定步数的经验后，等待所有 worker 完成，然后计算平均梯度进行一次全局更新。这种同步方式避免了 A3C 中异步更新导致的策略陈旧（stale gradients）问题，在 GPU 上也能更高效地批处理。A2C 在 Atari 游戏、MuJoCo 连续控制等任务上都展现出了优秀的性能和稳定性。`,
            code: [
                {
                    lang: "python",
                    code: `class A2CAgent:
    def __init__(self, state_dim, action_dim, num_envs=8,
                 n_steps=5, lr=7e-4, gamma=0.99,
                 entropy_coef=0.01, value_coef=0.5):
        self.network = ActorCriticNetwork(state_dim, action_dim)
        self.optimizer = torch.optim.Adam(self.network.parameters(), lr=lr)
        self.num_envs = num_envs
        self.n_steps = n_steps
        self.gamma = gamma
        self.entropy_coef = entropy_coef
        self.value_coef = value_coef

    def collect_rollout(self, envs):
        """Synchronous rollout collection from multiple envs"""
        states = envs.reset()
        states_list, actions_list, rewards_list = [], [], []
        values_list, log_probs_list, dones_list = [], [], []

        for _ in range(self.n_steps):
            states_tensor = torch.FloatTensor(states)
            probs, values = self.network(states_tensor)
            values = values.squeeze(-1)

            dist = torch.distributions.Categorical(probs)
            actions = dist.sample()
            log_probs = dist.log_prob(actions)

            states_list.append(states.copy())
            actions_list.append(actions.numpy().copy())
            values_list.append(values.detach().numpy().copy())
            log_probs_list.append(log_probs.detach().numpy().copy())

            next_states, rewards, terminated, truncated, _ = envs.step(actions.numpy())
            rewards_list.append(rewards.copy())
            dones_list.append((terminated | truncated).copy())
            states = next_states

        last_values = self.network(torch.FloatTensor(states))[1]
        last_values = last_values.squeeze(-1).detach().numpy()
        return (states_list, actions_list, rewards_list,
                values_list, log_probs_list, dones_list, last_values)`
                },
                {
                    lang: "python",
                    code: `    def compute_gae(self, rewards, values, dones, last_values,
                    gamma=0.99, gae_lambda=0.95):
        """Generalized Advantage Estimation"""
        advantages = []
        gae = 0
        for t in reversed(range(len(rewards))):
            next_val = last_values if t == len(rewards) - 1 else values[t + 1]
            mask = 1.0 - dones[t]
            delta = rewards[t] + gamma * next_val * mask - values[t]
            gae = delta + gamma * gae_lambda * mask * gae
            advantages.insert(0, gae)
        advantages = np.array(advantages)
        returns = advantages + np.array(values)
        return advantages, returns

    def update(self, rollout_data):
        """Update network using collected experience"""
        states, actions, rewards, values, log_probs, dones, last_values = rollout_data
        advantages, returns = self.compute_gae(
            rewards, values, dones, last_values, self.gamma
        )

        states_t = torch.FloatTensor(np.array(states).reshape(-1, states[0].shape[-1]))
        actions_t = torch.LongTensor(np.array(actions).flatten())
        advantages_t = torch.FloatTensor(advantages.flatten())
        returns_t = torch.FloatTensor(returns.flatten())

        probs, state_values = self.network(states_t)
        dist = torch.distributions.Categorical(probs)
        new_log_probs = dist.log_prob(actions_t)
        entropy = dist.entropy().mean()

        actor_loss = -(new_log_probs * advantages_t).mean()
        critic_loss = F.mse_loss(state_values.squeeze(-1), returns_t)
        total_loss = actor_loss + self.value_coef * critic_loss - self.entropy_coef * entropy

        self.optimizer.zero_grad()
        total_loss.backward()
        torch.nn.utils.clip_grad_norm_(self.network.parameters(), 0.5)
        self.optimizer.step()

        return actor_loss.item(), critic_loss.item()`
                }
            ],
            table: {
                headers: ["超参数", "推荐值", "影响", "调节建议"],
                rows: [
                    ["n_steps", "5", "每次更新的 rollout 长度", "较小值更新频繁，较大值更接近 MC"],
                    ["num_envs", "8-16", "并行环境数量", "越多样本多样性越高，但内存消耗大"],
                    ["gamma", "0.99", "折扣因子", "长程任务用接近 1 的值"],
                    ["gae_lambda", "0.95", "GAE 的偏差-方差权衡参数", "接近 1 降低偏差但增加方差"],
                    ["entropy_coef", "0.01", "熵正则化强度", "防止过早收敛，复杂任务可增大"],
                    ["value_coef", "0.5", "Critic 损失的权重", "控制值函数学习速度"],
                ]
            },
            mermaid: `graph LR
    W1["Worker 1"] -->|"n steps exp"| G["Gradient Aggregation"]
    W2["Worker 2"] -->|"n steps exp"| G
    W3["Worker 3"] -->|"n steps exp"| G
    W4["Worker N"] -->|"n steps exp"| G
    G -->|"Avg Gradient"| U["Sync Update"]
    U -->|"New Params"| W1
    U -->|"New Params"| W2
    U -->|"New Params"| W3
    U -->|"New Params"| W4`,
            tip: "A2C 的 num_envs 选择很关键：太少会导致训练不稳定（样本方差大），太多会浪费计算资源。从 8 个开始实验，根据任务复杂度调整。",
            warning: "A2C 的同步更新意味着慢的 worker 会拖慢整体速度。确保所有环境的 episode 长度相近，否则会出现严重的等待时间浪费。"
        },
        {
            title: "4. A3C：异步优势 Actor-Critic",
            body: `A3C（Asynchronous Advantage Actor-Critic）是 DeepMind 在 2016 年提出的里程碑式算法。它的核心创新在于使用多个异步 worker，每个 worker 独立地与环境交互、计算梯度并更新全局共享网络。这种异步架构不需要 GPU，在多核 CPU 上就能高效运行。

A3C 的异步更新有一个隐含的正则化效果：不同 worker 探索环境的不同部分，它们的梯度天然具有多样性，相当于对策略更新施加了隐式的噪声。这种噪声类似于小批量 SGD 中的随机性，有助于逃离局部最优。但这也带来了策略陈旧（stale gradients）问题：当 worker 的梯度到达时，全局参数可能已经被其他 worker 更新过多次。DeepMind 建议最多使用 16 个异步 worker。`,
            code: [
                {
                    lang: "python",
                    code: `import threading

class A3CWorker(threading.Thread):
    """A3C asynchronous worker thread"""

    def __init__(self, worker_id, global_network, optimizer,
                 env_id, max_steps=1000, gamma=0.99):
        super().__init__(daemon=True)
        self.worker_id = worker_id
        self.global_network = global_network
        self.local_network = ActorCriticNetwork(
            state_dim=global_network.state_dim,
            action_dim=global_network.action_dim
        )
        self.local_network.load_state_dict(global_network.state_dict())
        self.optimizer = optimizer
        self.env = gym.make(env_id)
        self.max_steps = max_steps
        self.gamma = gamma

    def run(self):
        state, _ = self.env.reset()
        total_steps = 0
        while total_steps < self.max_steps:
            states, actions, rewards, values, log_probs = [], [], [], [], []
            done = False

            while not done:
                probs, value = self.local_network(torch.FloatTensor(state).unsqueeze(0))
                dist = torch.distributions.Categorical(probs.squeeze(0))
                action = dist.sample()

                next_state, reward, terminated, truncated, _ = self.env.step(action.item())
                done = terminated or truncated

                states.append(state)
                actions.append(action.item())
                rewards.append(reward)
                values.append(value.item())
                log_probs.append(dist.log_prob(action))
                state = next_state

            R = 0 if done else self.local_network(
                torch.FloatTensor(state).unsqueeze(0)
            )[1].item()
            returns = self._compute_returns(rewards, R)
            self._update_network(states, actions, log_probs, values, returns)
            self.local_network.load_state_dict(self.global_network.state_dict())
            total_steps += len(rewards)`
                },
                {
                    lang: "python",
                    code: `    def _compute_returns(self, rewards, last_value):
        returns = []
        R = last_value
        for r in reversed(rewards):
            R = r + self.gamma * R
            returns.insert(0, R)
        return returns

    def _update_network(self, states, actions, log_probs, values, returns):
        all_states = torch.FloatTensor(np.array(states))
        probs, state_vals = self.local_network(all_states)
        dist = torch.distributions.Categorical(probs)
        new_log_probs = dist.log_prob(torch.LongTensor(actions))

        advantages = np.array(returns) - np.array(values)
        advantages_t = torch.FloatTensor(advantages)
        returns_t = torch.FloatTensor(returns)

        actor_loss = -(new_log_probs * advantages_t).mean()
        critic_loss = F.mse_loss(state_vals.squeeze(-1), returns_t)
        entropy = dist.entropy().mean()
        total_loss = actor_loss + 0.5 * critic_loss - 0.01 * entropy

        self.local_network.zero_grad()
        total_loss.backward()

        for local_param, global_param in zip(
            self.local_network.parameters(),
            self.global_network.parameters()
        ):
            if global_param.grad is not None:
                global_param.grad = local_param.grad
            else:
                global_param._grad = local_param.grad

        self.optimizer.step()

    def stop(self):
        self.env.close()`
                }
            ],
            table: {
                headers: ["对比维度", "A3C（异步）", "A2C（同步）"],
                rows: [
                    ["更新方式", "异步独立更新全局网络", "同步收集经验后批量更新"],
                    ["硬件需求", "多核 CPU（不需要 GPU）", "GPU 友好（批量计算）"],
                    ["梯度陈旧", "存在（worker 使用旧参数）", "不存在（统一快照）"],
                    ["隐式正则化", "异步噪声相当于正则化", "需要显式熵正则化"],
                    ["代码复杂度", "高（需要线程管理、锁）", "低（标准批量训练）"],
                    ["训练效率", "CPU 集群上高效", "GPU 上更高效"],
                    ["现代地位", "已被 A2C/PPO 取代", "主流基线算法"],
                ]
            },
            mermaid: `graph TD
    G["Global Shared Network"] -->|"Param Copy"| W1["Worker 1 (Async)"]
    G -->|"Param Copy"| W2["Worker 2 (Async)"]
    G -->|"Param Copy"| W3["Worker 3 (Async)"]
    W1 -->|"Independent"| E1["Env A"]
    W2 -->|"Independent"| E2["Env B"]
    W3 -->|"Independent"| E3["Env C"]
    E1 -->|"Compute Grad"| W1
    E2 -->|"Compute Grad"| W2
    E3 -->|"Compute Grad"| W3
    W1 -->|"Async Update"| G
    W2 -->|"Async Update"| G
    W3 -->|"Async Update"| G`,
            tip: "现代强化学习中，A2C 和 PPO 已经基本取代了 A3C。了解 A3C 的价值在于理解异步训练的思想，这在分布式训练中仍然很重要。",
            warning: "A3C 的线程安全是一个常被忽略的坑。PyTorch 的 parameter.grad 在多写场景下可能导致梯度累加错误。建议使用参数锁或改用 A2C 的同步更新。"
        },
        {
            title: "5. GAE：广义优势估计",
            body: `GAE（Generalized Advantage Estimation）由 Schulman 等人在 2015 年提出，是现代 Actor-Critic 算法（PPO、A3C 等）中计算优势函数的标准方法。GAE 的核心思想是对不同步数的 TD 误差进行指数加权平均，通过一个参数 lambda 在偏差和方差之间灵活权衡。

当 lambda = 0 时，GAE 退化为单步 TD 误差，偏差大但方差小；当 lambda = 1 时，GAE 等价于蒙特卡洛回报减去值函数，无偏但方差大。通过选择 lambda 在 0.9 到 0.95 之间，GAE 能在偏差和方差之间取得极好的平衡。数学上，GAE 的公式为：A_GAE(s,a) = sum_{l=0}^{inf} (gamma * lambda)^l * delta_{t+l}，其中 delta_t = r_t + gamma * V(s_{t+1}) - V(s_t) 是 TD 误差。`,
            code: [
                {
                    lang: "python",
                    code: `def compute_gae(rewards, values, dones, last_value,
                gamma=0.99, gae_lambda=0.95):
    """Generalized Advantage Estimation (GAE)

    Args:
        rewards: T-step rewards (T,)
        values: T-step state value estimates (T,)
        dones: T-step termination flags (T,)
        last_value: V(s) estimate for the last step
        gamma: discount factor
        gae_lambda: GAE bias-variance trade-off parameter

    Returns:
        advantages: GAE advantages (T,)
        returns: return targets (T,)
    """
    T = len(rewards)
    advantages = np.zeros(T)
    gae = 0

    for t in reversed(range(T)):
        if t == T - 1:
            next_value = last_value
        else:
            next_value = values[t + 1]

        non_terminal = 1.0 - dones[t]
        delta = rewards[t] + gamma * next_value * non_terminal - values[t]
        gae = delta + gamma * gae_lambda * non_terminal * gae
        advantages[t] = gae

    returns = advantages + np.array(values)
    return advantages, returns`
                },
                {
                    lang: "python",
                    code: `def analyze_gae_tradeoff(rewards, values, dones, last_value, gamma=0.99):
    """Analyze GAE statistical properties under different lambda values"""
    lambdas = [0.0, 0.5, 0.9, 0.95, 1.0]
    results = {}

    for lam in lambdas:
        advs, _ = compute_gae(rewards, values, dones, last_value,
                              gamma=gamma, gae_lambda=lam)
        results[lam] = {
            "mean_advantage": np.mean(advs),
            "std_advantage": np.std(advs),
            "max_abs_advantage": np.max(np.abs(advs)),
            "smoothness": np.mean(np.abs(np.diff(advs))),
        }

    print(f"{'lambda':>8} | {'Mean':>10} | {'Std':>10} | {'Max|A|':>10} | {'Smooth':>10}")
    print("-" * 58)
    for lam, stats in results.items():
        print(f"{lam:>8.2f} | {stats['mean_advantage']:>10.4f} | "
              f"{stats['std_advantage']:>10.4f} | "
              f"{stats['max_abs_advantage']:>10.4f} | "
              f"{stats['smoothness']:>10.4f}")
    return results


def explain_gae():
    """Explain the mathematical intuition of GAE"""
    # lambda=0: single-step TD error only
    # A = delta_t = r_t + gamma*V(s_{t+1}) - V(s_t)
    # High bias (only looks one step ahead), low variance

    # lambda=1: full multi-step return
    # A = sum_{l=0}^{T-t-1} gamma^l * delta_{t+l}
    # Unbiased (considers all future rewards), high variance

    # lambda=0.95: exponentially decaying weights
    # A = delta_t + 0.95*gamma*delta_{t+1} + 0.95^2*gamma^2*delta_{t+2} + ...
    # Recent TD errors weighted more, distant ones decay
    # Best balance of bias and variance
    pass`
                }
            ],
            table: {
                headers: ["参数", "lambda=0", "lambda=0.5", "lambda=0.95", "lambda=1.0"],
                rows: [
                    ["偏差", "高（只看下一步）", "中等", "低", "最低（等价 MC）"],
                    ["方差", "最低", "中等", "中等偏高", "最高"],
                    ["计算效率", "最高（O(T)）", "O(T)", "O(T)", "O(T)"],
                    ["对 V 的依赖", "强（V 不准则偏差大）", "中等", "中等", "弱"],
                    ["推荐场景", "训练初期快速更新", "简单任务", "大多数复杂任务（推荐）", "对偏差极度敏感的场景"],
                ]
            },
            mermaid: `graph LR
    A["TD Error delta_t"] -->|"Weight 1"| G["GAE Weighted Sum"]
    B["TD Error delta_{t+1}"] -->|"Weight gamma*lambda"| G
    C["TD Error delta_{t+2}"] -->|"Weight (gamma*lambda)^2"| G
    D["TD Error delta_{t+3}"] -->|"Weight (gamma*lambda)^3"| G
    E["..."] -->|"Decaying weights"| G
    G --> F["Advantage A(s,a)"]
    class F s1
    class G s0
    classDef s0 fill:#7c2d12
    classDef s1 fill:#14532d`,
            tip: "GAE 的 lambda=0.95 是一个经验性的黄金值，在大多数任务中都能取得很好的效果。只有在你明确知道偏差或方差是瓶颈时，才需要调整这个参数。",
            warning: "GAE 计算中 dones 标志的处理很关键。如果 done 时没有正确截断（设置 non_terminal = 0），会导致跨 episode 的 bootstrap 污染，严重影响训练。"
        },
        {
            title: "6. 连续动作空间：从离散到连续",
            body: `前面讨论的 A2C 和 A3C 主要针对离散动作空间，输出动作的概率分布。但在许多实际控制问题中（如机器人关节控制、自动驾驶方向盘），动作是连续的。这就需要将策略网络的输出从分类分布改为连续分布，通常是多维高斯分布（Gaussian Distribution）。

连续策略 pi(a|s) 由高斯分布的参数化决定：均值 mu(s) 和标准差 sigma(s)。网络输出均值 mu（直接由线性层生成），标准差可以设为可学习参数或输入依赖。采样动作 a = mu + sigma * epsilon，其中 epsilon ~ N(0,1)。使用 reparameterization trick（重参数化技巧），可以使得采样过程可微，从而使用标准的反向传播进行梯度计算。`,
            code: [
                {
                    lang: "python",
                    code: `class ContinuousActorCriticNetwork(nn.Module):
    """Actor-Critic network for continuous action spaces"""
    def __init__(self, state_dim: int, action_dim: int,
                 hidden_dim: int = 256, log_std_init: float = -0.5):
        super().__init__()
        self.action_dim = action_dim

        self.shared = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )

        self.mu_head = nn.Linear(hidden_dim, action_dim)
        self.log_std = nn.Parameter(torch.ones(action_dim) * log_std_init)

        self.critic_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1),
        )

    def forward(self, state):
        features = self.shared(state)
        mu = self.mu_head(features)
        std = torch.exp(self.log_std).expand_as(mu)
        state_value = self.critic_head(features)
        return mu, std, state_value

    def get_action(self, state, deterministic=False):
        mu, std, value = self.forward(state)
        if deterministic:
            return mu, torch.tensor(0.0), value
        dist = torch.distributions.Normal(mu, std)
        action = dist.rsample()
        log_prob = dist.log_prob(action).sum(dim=-1)
        return torch.tanh(action), log_prob, value`
                },
                {
                    lang: "python",
                    code: `class ContinuousA2C:
    def __init__(self, state_dim, action_dim, lr=3e-4):
        self.network = ContinuousActorCriticNetwork(state_dim, action_dim)
        self.optimizer = torch.optim.Adam(self.network.parameters(), lr=lr)
        self.gamma = 0.99
        self.gae_lambda = 0.95

    def compute_loss(self, states, actions, advantages, returns):
        mu, std, values = self.network(states)
        dist = torch.distributions.Normal(mu, std)

        new_log_probs = dist.log_prob(actions).sum(dim=-1)
        actor_loss = -(new_log_probs * advantages).mean()

        critic_loss = F.mse_loss(values.squeeze(-1), returns)
        entropy = dist.entropy().sum(dim=-1).mean()
        total_loss = actor_loss + 0.5 * critic_loss - 0.005 * entropy

        self.optimizer.zero_grad()
        total_loss.backward()
        torch.nn.utils.clip_grad_norm_(self.network.parameters(), 0.5)
        self.optimizer.step()

        return actor_loss.item(), critic_loss.item(), entropy.item()

    def train_on_batch(self, batch):
        states = torch.FloatTensor(batch["states"])
        actions = torch.FloatTensor(batch["actions"])
        advantages = torch.FloatTensor(batch["advantages"])
        returns = torch.FloatTensor(batch["returns"])
        return self.compute_loss(states, actions, advantages, returns)`
                }
            ],
            table: {
                headers: ["特性", "离散动作（分类分布）", "连续动作（高斯分布）"],
                rows: [
                    ["网络输出", "动作概率（softmax）", "均值 mu + 标准差 sigma"],
                    ["动作采样", "Categorical(probs).sample()", "Normal(mu, std).rsample()"],
                    ["对数概率", "log P(a)", "log N(a; mu, sigma)"],
                    ["重参数化", "不可微（不能 backprop）", "可微（rsample 支持）"],
                    ["典型环境", "Atari, CartPole", "Pendulum, MuJoCo, Humanoid"],
                    ["探索方式", "概率分布的随机性", "标准差控制探索范围"],
                ]
            },
            mermaid: `graph TD
    S["State s"] --> NN["Neural Network"]
    NN --> MU["Mean mu(s)"]
    NN --> STD["Std sigma(s)"]
    NN --> V["Value V(s)"]
    MU -->|"N(mu,sigma)"| D["Gaussian Distribution"]
    STD -->|"N(mu,sigma)"| D
    D -->|"rsample()"| A["Action a"]
    D -->|"log_prob"| L["Log Probability"]
    A -->|"tanh clip"| TA["Clipped Action"]
    TA --> ENV["Continuous Control Env"]
    class D s0
    classDef s0 fill:#0c4a6e`,
            tip: "连续策略的标准差初始值很关键：太大导致早期探索过于随机，太小导致策略陷入局部最优。建议 log_std 初始化为 -0.5 到 0.0 之间。",
            warning: "使用 tanh 压缩动作后，需要额外的修正项来计算正确的对数概率（雅可比行列式修正）。否则策略梯度的方向可能不正确，导致训练不稳定。"
        },
        {
            title: "7. PyTorch 实战：Pendulum 环境",
            body: `Pendulum（倒立摆）是 Gymnasium 中最经典的连续控制环境之一。任务是通过施加力矩让一个摆锤从下垂状态摆动到直立状态并保持平衡。状态包含摆锤的角度（cos 和 sin 表示）、角速度；动作是施加的力矩（范围 -2 到 +2）；奖励是 -(theta^2 + 0.1*theta_dot^2 + 0.001*action^2)，越接近直立奖励越高。

我们将用 A2C 算法在 Pendulum 环境上进行完整的训练。这个实现包含环境包装（动作归一化、帧堆叠可选）、GAE 优势计算、批量更新和训练循环。Pendulum 的难度适中，A2C 通常在 1000-2000 个 episode 内可以学会基本的摆起和平衡策略。`,
            code: [
                {
                    lang: "python",
                    code: `import gymnasium as gym
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

# === Environment Setup ===
def make_env(env_id="Pendulum-v1", seed=42):
    env = gym.make(env_id)
    return env

# === Network Definition ===
class A2CPendulumNetwork(nn.Module):
    def __init__(self, state_dim=3, action_dim=1, hidden_dim=128):
        super().__init__()
        self.shared = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.Tanh(),
        )
        self.mu_head = nn.Linear(hidden_dim, action_dim)
        self.log_std = nn.Parameter(torch.zeros(action_dim))
        self.value_head = nn.Linear(hidden_dim, 1)

    def forward(self, state):
        x = self.shared(state)
        mu = 2.0 * torch.tanh(self.mu_head(x))
        std = torch.exp(self.log_std).clamp(0.1, 2.0)
        value = self.value_head(x)
        return mu, std, value

# === Agent ===
class A2CPendulumAgent:
    def __init__(self, lr=3e-4, gamma=0.99, gae_lambda=0.95):
        self.network = A2CPendulumNetwork()
        self.optimizer = torch.optim.Adam(self.network.parameters(), lr=lr)
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self.rollout_states = []
        self.rollout_actions = []
        self.rollout_rewards = []
        self.rollout_log_probs = []
        self.rollout_values = []
        self.rollout_dones = []`
                },
                {
                    lang: "python",
                    code: `    def select_action(self, state):
        state_t = torch.FloatTensor(state).unsqueeze(0)
        mu, std, value = self.network(state_t)
        dist = torch.distributions.Normal(mu, std)
        action = dist.rsample().clamp(-2.0, 2.0)
        log_prob = dist.log_prob(action).sum(-1)
        return action.squeeze(0), log_prob.item(), value.item()

    def compute_gae(self, last_value):
        rewards, values, dones = (self.rollout_rewards,
                                   self.rollout_values,
                                   self.rollout_dones)
        T = len(rewards)
        advantages = np.zeros(T)
        gae = 0
        for t in reversed(range(T)):
            next_v = last_value if t == T - 1 else values[t + 1]
            non_term = 1.0 - dones[t]
            delta = rewards[t] + self.gamma * next_v * non_term - values[t]
            gae = delta + self.gamma * self.gae_lambda * non_term * gae
            advantages[t] = gae
        returns = advantages + np.array(values)
        return advantages, returns

    def update(self):
        states = torch.FloatTensor(np.array(self.rollout_states))
        actions = torch.FloatTensor(np.array(self.rollout_actions))
        last_v = self.network(torch.FloatTensor(self.rollout_states[-1]))[2].item()
        advantages, returns = self.compute_gae(last_v)
        advantages_t = torch.FloatTensor(advantages)
        returns_t = torch.FloatTensor(returns)

        mu, std, values = self.network(states)
        dist = torch.distributions.Normal(mu, std)
        new_log_probs = dist.log_prob(actions).sum(-1)
        entropy = dist.entropy().sum(-1).mean()

        actor_loss = -(new_log_probs * advantages_t).mean()
        critic_loss = F.mse_loss(values.squeeze(-1), returns_t)
        total_loss = actor_loss + 0.5 * critic_loss - 0.005 * entropy

        self.optimizer.zero_grad()
        total_loss.backward()
        torch.nn.utils.clip_grad_norm_(self.network.parameters(), 0.5)
        self.optimizer.step()

        self.rollout_states.clear()
        self.rollout_actions.clear()
        self.rollout_rewards.clear()
        self.rollout_log_probs.clear()
        self.rollout_values.clear()
        self.rollout_dones.clear()

        return actor_loss.item(), critic_loss.item(), entropy.item()


# === Training Loop ===
def train_a2c_pendulum(episodes=1500, rollout_steps=2048, log_interval=50):
    env = make_env()
    agent = A2CPendulumAgent()
    episode_rewards = []
    state, _ = env.reset(seed=42)
    current_ep_reward = 0

    for step in range(rollout_steps * episodes // rollout_steps):
        action, log_prob, value = agent.select_action(state)
        next_state, reward, terminated, truncated, _ = env.step(action.numpy())
        done = terminated or truncated

        agent.rollout_states.append(state)
        agent.rollout_actions.append(action.numpy())
        agent.rollout_rewards.append(reward)
        agent.rollout_log_probs.append(log_prob)
        agent.rollout_values.append(value)
        agent.rollout_dones.append(float(done))

        current_ep_reward += reward
        state = next_state

        if done:
            episode_rewards.append(current_ep_reward)
            if len(episode_rewards) % log_interval == 0:
                avg = np.mean(episode_rewards[-log_interval:])
                print(f"Episode {len(episode_rewards)}, Avg Reward: {avg:.1f}")
            current_ep_reward = 0
            state, _ = env.reset()

        if len(agent.rollout_states) >= rollout_steps:
            agent.update()

    env.close()
    return episode_rewards, agent


if __name__ == "__main__":
    rewards, trained_agent = train_a2c_pendulum(episodes=1500)
    print(f"Final avg reward: {np.mean(rewards[-100:]):.1f}")`
                }
            ],
            table: {
                headers: ["训练阶段", "Episode 范围", "平均奖励", "行为特征"],
                rows: [
                    ["随机探索", "0-100", "-1600 ~ -1200", "完全随机动作，摆锤下垂"],
                    ["初期学习", "100-300", "-1200 ~ -800", "开始施加力矩，偶尔摆动"],
                    ["摆动学习", "300-600", "-800 ~ -500", "学会摆动到高位"],
                    ["平衡尝试", "600-1000", "-500 ~ -300", "能到达顶部但不稳定"],
                    ["稳定平衡", "1000+", "-300 ~ -150", "基本能保持直立平衡"],
                ]
            },
            mermaid: `graph TD
    A["Init Env and Agent"] --> B["Collect Rollout"]
    B --> C{"rollout_steps reached?"}
    C -->|"No"| B
    C -->|"Yes"| D["Compute GAE Advantage"]
    D --> E["Update Actor and Critic"]
    E --> F{"Episode Done?"}
    F -->|"No"| B
    F -->|"Yes"| G["Record Reward"]
    G --> H{"Training Done?"}
    H -->|"No"| B
    H -->|"Yes"| I["Save Model"]
    class E s1
    class D s0
    classDef s0 fill:#7c2d12
    classDef s1 fill:#14532d`,
            tip: "Pendulum 环境的状态表示使用 cos(theta) 和 sin(theta) 而非直接用角度 theta，这是为了保持周期性。这是连续控制任务中常见的状态编码技巧。",
            warning: "A2C 在 Pendulum 上可能训练不稳定，因为策略梯度方法对超参数很敏感。如果奖励没有改善，尝试降低学习率（1e-4）、增大 GAE lambda（0.98）或增加 rollout_steps（4096）。"
        }
    ],
};
