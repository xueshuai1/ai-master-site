import { Article } from '../knowledge';

export const article: Article = {
    id: "rl-007",
    title: "SAC：柔性 Actor-Critic",
    category: "rl",
    tags: ["SAC", "最大熵", "强化学习"],
    summary: "从最大熵到自动温度调节，理解 Sample Efficient 的 Actor-Critic 算法",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. 最大熵强化学习：超越累积回报",
            body: `传统强化学习的目标是最大化累积折扣回报，即选择使期望回报最大的策略。然而这种纯粹以回报为导向的优化存在明显缺陷：智能体容易陷入局部最优，探索效率低下，且训练出的策略往往过于确定性。最大熵强化学习（Maximum Entropy RL）对此进行了根本性改造。

最大熵框架在目标函数中引入了策略的熵项 H(pi) = -E[log pi(a|s)]，使得优化目标变为回报与熵的加权和。熵衡量策略的不确定性，高熵意味着策略在各状态下倾向于采取多样化的动作。这一改动带来了三个核心优势：更强的探索能力使智能体不易陷入局部最优；学习到的策略对扰动更鲁棒；智能体能自然发现多个等价的最优行为模式。在数学上，最大熵目标可以写作 J(pi) = E[sum gamma^t * (r_t + alpha * H(pi|s_t))]，其中 alpha 是温度系数，控制探索与利用的平衡。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn.functional as F

def compute_entropy(policy_logits: torch.Tensor) -> torch.Tensor:
    """计算策略分布的熵值"""
    policy_dist = torch.distributions.Categorical(logits=policy_logits)
    entropy = policy_dist.entropy()  # H = -sum(p * log p)
    return entropy.mean()

def max_ent_reward(rewards: torch.Tensor, 
                   policy_logits: torch.Tensor, 
                   alpha: float = 0.2) -> torch.Tensor:
    """最大熵回报：r + alpha * H"""
    entropy = compute_entropy(policy_logits)
    return rewards.mean() + alpha * entropy`
                },
                {
                    lang: "python",
                    code: `class MaxEntropyValueIteration:
    """最大熵值迭代算法"""
    def __init__(self, n_states: int, n_actions: int, 
                 gamma: float = 0.99, alpha: float = 0.1):
        self.V = torch.zeros(n_states)
        self.gamma = gamma
        self.alpha = alpha
        
    def soft_value(self, q_values: torch.Tensor) -> torch.Tensor:
        """软值函数：log-sum-exp 形式"""
        # V_soft(s) = alpha * log(sum(exp(Q(s,a)/alpha)))
        return self.alpha * torch.logsumexp(q_values / self.alpha, dim=-1)
    
    def update(self, rewards: torch.Tensor, 
               transitions: torch.Tensor) -> None:
        """执行一次软值迭代"""
        q_values = rewards + self.gamma * transitions @ self.V
        self.V = self.soft_value(q_values)`
                }
            ],
            table: {
                headers: ["特性", "传统 RL", "最大熵 RL"],
                rows: [
                    ["优化目标", "max E[sum r]", "max E[sum (r + alpha*H)]"],
                    ["探索方式", "需额外设计（如 epsilon-greedy）", "内生于目标函数"],
                    ["策略形态", "倾向于确定性策略", "天然随机策略"],
                    ["鲁棒性", "对扰动敏感", "对扰动更鲁棒"],
                    ["多模态发现", "易陷入单一最优", "能发现多个等价最优行为"]
                ]
            },
            mermaid: `graph TD
    A["传统 RL 目标"] --> B["max E[累积回报]"]
    C["最大熵 RL 目标"] --> D["max E[回报 + alpha * 熵]"]
    B --> E["确定性策略"]
    B --> F["需外部探索"]
    D --> G["随机策略"]
    D --> H["内建探索"]
    E --> I["易陷局部最优"]
    G --> J["更强鲁棒性"]`,
            tip: "温度系数 alpha 的选择至关重要：alpha 过大导致过度探索、收敛缓慢；alpha 过小则退化为传统 RL，失去最大熵的优势。实践中建议使用自动温度调节。",
            warning: "最大熵目标在高维动作空间中计算熵项可能代价高昂，特别是当动作分布为复杂混合分布时，需要借助变分近似或重参数化技巧。"
        },
        {
            title: "2. SAC 目标函数：软 Q 值与软价值",
            body: `Soft Actor-Critic（SAC）由 Haarnoja 等人在 2018 年提出，是最大熵强化学习在连续控制任务中的里程碑式算法。SAC 的核心思想是在 Actor-Critic 架构中引入"软" Bellman 方程，将熵正则化无缝融入值函数估计和策略更新中。

SAC 定义了三个关键函数：软 Q 函数 Q_soft(s,a) 衡量在状态 s 采取动作 a 后，遵循当前策略所能获得的期望回报加上未来熵的加权和；软状态值 V_soft(s) = E_a[Q_soft(s,a) - alpha * log pi(a|s)]，即对 Q 值减去熵惩罚后的期望；软 Bellman 方程为 Q_soft(s,a) = r + gamma * E_s'[V_soft(s')]。SAC 使用两个独立的 Q 网络来缓解 Q 值高估问题，取两者中的较小值进行训练。策略网络输出高斯分布的均值和方差，通过重参数化技巧实现低方差的梯度估计。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class SoftQNetwork(nn.Module):
    """SAC 的软 Q 网络"""
    def __init__(self, state_dim: int, action_dim: int, 
                 hidden_dim: int = 256):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim + action_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1)
        )
    
    def forward(self, state: torch.Tensor, 
                action: torch.Tensor) -> torch.Tensor:
        x = torch.cat([state, action], dim=-1)
        return self.net(x)

class GaussianPolicy(nn.Module):
    """SAC 的高斯策略网络"""
    def __init__(self, state_dim: int, action_dim: int,
                 hidden_dim: int = 256, log_std_min: float = -20,
                 log_std_max: float = 2):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )
        self.mean_head = nn.Linear(hidden_dim, action_dim)
        self.log_std_head = nn.Linear(hidden_dim, action_dim)
        self.log_std_min = log_std_min
        self.log_std_max = log_std_max
    
    def forward(self, state: torch.Tensor):
        features = self.net(state)
        mean = self.mean_head(features)
        log_std = self.log_std_head(features)
        log_std = torch.clamp(log_std, self.log_std_min, self.log_std_max)
        return mean, log_std`
                },
                {
                    lang: "python",
                    code: `def soft_q_target(rewards: torch.Tensor, 
                      next_states: torch.Tensor, 
                      dones: torch.Tensor,
                      next_actions: torch.Tensor, 
                      next_log_probs: torch.Tensor,
                      target_q1: torch.Tensor, 
                      target_q2: torch.Tensor,
                      gamma: float = 0.99, 
                      alpha: float = 0.2) -> torch.Tensor:
    """计算 SAC 软 Q 目标值"""
    # 取两个 Q 网络的较小值（缓解高估）
    min_q_next = torch.min(target_q1, target_q2)
    # 软价值：V = min(Q1, Q2) - alpha * log pi
    next_v = min_q_next - alpha * next_log_probs
    # Bellman 备份
    targets = rewards + gamma * (1 - dones) * next_v
    return targets

def sac_q_loss(q_values: torch.Tensor, 
               targets: torch.Tensor) -> torch.Tensor:
    """SAC Q 网络损失：MSE"""
    return F.mse_loss(q_values, targets.detach())`
                }
            ],
            table: {
                headers: ["组件", "输入", "输出", "训练目标"],
                rows: [
                    ["Q1 网络", "(s, a)", "Q_soft(s,a)", "min(Q1-Q_target)^2"],
                    ["Q2 网络", "(s, a)", "Q_soft(s,a)", "min(Q2-Q_target)^2"],
                    ["策略网络", "s", "N(mu, sigma)", "max E[Q - alpha*log pi]"],
                    ["目标 Q1", "(s', a')", "Q_target(s',a')", "软 Bellman 备份"],
                    ["目标 Q2", "(s', a')", "Q_target(s',a')", "软 Bellman 备份"]
                ]
            },
            mermaid: `graph LR
    S["state s"] --> Policy["GaussianPolicy"]
    Policy --> A["action a ~ N(mu,sigma)"]
    S --> S1["Q1(s,a)"]
    S --> S2["Q2(s,a)"]
    A --> S1
    A --> S2
    S1 --> Min["torch.min(Q1,Q2)"]
    S2 --> Min
    Min --> Loss["Q Loss: MSE"]
    Policy --> Entropy["-alpha * log pi"]
    Entropy --> PolicyUpdate["Policy Gradient"]
    Min --> PolicyUpdate`,
            tip: "SAC 使用两个 Q 网络是缓解 Q 值高估的关键设计。在更新时取两者的较小值，这比 DDPG 的单一 Q 网络更稳定，也比 TD3 的裁剪噪声更适合最大熵框架。",
            warning: "策略网络输出的 log_std 必须严格裁剪（通常 [-20, 2]），否则方差爆炸会导致训练崩溃。同时注意 tanh 变换后的 log_prob 需要加上雅可比修正项。"
        },
        {
            title: "3. 软策略迭代：策略评估与改进",
            body: `SAC 的训练流程遵循软策略迭代（Soft Policy Iteration）框架，由交替进行的软策略评估和软策略改进两个阶段组成。这一框架是经典策略迭代算法在最大熵设置下的推广，理论保证了对最优最大熵策略的收敛性。

软策略评估阶段固定当前策略 pi，迭代更新 Q 函数使其满足软 Bellman 方程。具体做法是收集 (s, a, r, s') 转移样本，计算软 Q 目标值，然后通过梯度下降最小化 Q 预测值与目标值之间的均方误差。软策略改进阶段固定 Q 函数，更新策略使得期望软 Q 值减去熵惩罚最大化。SAC 采用重参数化技巧实现这一优化：将动作采样写为 a = f_theta(epsilon; s)，其中 epsilon 是从固定分布（如标准正态）采样的噪声，这样梯度可以直接通过确定性变换传播到策略参数。`,
            code: [
                {
                    lang: "python",
                    code: `def soft_policy_eval(q1: SoftQNetwork, q2: SoftQNetwork,
                         policy: GaussianPolicy, 
                         states: torch.Tensor, 
                         actions: torch.Tensor,
                         rewards: torch.Tensor, 
                         next_states: torch.Tensor,
                         dones: torch.Tensor,
                         alpha: float, gamma: float = 0.99,
                         tau: float = 0.005) -> dict:
    """软策略评估：更新 Q 网络"""
    with torch.no_grad():
        # 采样下一动作
        next_mean, next_log_std = policy(next_states)
        next_std = next_log_std.exp()
        next_dist = torch.distributions.Normal(next_mean, next_std)
        next_action_raw = next_dist.rsample()
        next_action = torch.tanh(next_action_raw)
        
        # 计算熵修正
        next_log_prob = next_dist.log_prob(next_action_raw)
        next_log_prob = next_log_prob.sum(dim=-1, keepdim=True)
        # tanh 修正
        next_log_prob -= torch.log(1 - next_action**2 + 1e-6).sum(dim=-1, keepdim=True)
        
        next_q1 = q1(next_states, next_action)
        next_q2 = q2(next_states, next_action)
        next_v = torch.min(next_q1, next_q2) - alpha * next_log_prob
        
        q_targets = rewards + gamma * (1 - dones) * next_v
    
    q1_pred = q1(states, actions)
    q2_pred = q2(states, actions)
    q1_loss = F.mse_loss(q1_pred, q_targets.detach())
    q2_loss = F.mse_loss(q2_pred, q_targets.detach())
    return {"q1_loss": q1_loss, "q2_loss": q2_loss}`
                },
                {
                    lang: "python",
                    code: `def soft_policy_improvement(q1: SoftQNetwork, 
                              q2: SoftQNetwork,
                              policy: GaussianPolicy, 
                              policy_optimizer: torch.optim.Optimizer,
                              states: torch.Tensor,
                              alpha: float, n_samples: int = 10) -> dict:
    """软策略改进：更新策略网络"""
    mean, log_std = policy(states)
    std = log_std.exp()
    dist = torch.distributions.Normal(mean, std)
    
    # 重参数化采样
    z = dist.rsample()
    action = torch.tanh(z)
    
    log_prob = dist.log_prob(z)
    log_prob = log_prob.sum(dim=-1, keepdim=True)
    log_prob -= torch.log(1 - action**2 + 1e-6).sum(dim=-1, keepdim=True)
    
    # 策略目标：max E[Q - alpha * log pi]
    q1_val = q1(states, action)
    q2_val = q2(states, action)
    q_val = torch.min(q1_val, q2_val)
    
    policy_loss = (alpha * log_prob - q_val).mean()
    
    policy_optimizer.zero_grad()
    policy_loss.backward()
    policy_optimizer.step()
    
    return {"policy_loss": policy_loss.item()}`
                }
            ],
            table: {
                headers: ["阶段", "固定参数", "更新参数", "优化目标"],
                rows: [
                    ["软策略评估", "pi, target Q", "Q1, Q2", "min(Q_pred - Q_target)^2"],
                    ["软策略改进", "Q1, Q2", "pi 参数", "max E[Q - alpha*log pi]"],
                    ["目标网络更新", "无", "target Q1, Q2", "theta_target = tau*theta + (1-tau)*theta_target"],
                    ["温度更新", "Q1, Q2, pi", "alpha", "min E[-alpha*log pi - alpha*H_target]"]
                ]
            },
            mermaid: `sequenceDiagram
    participant B as Replay Buffer
    participant Q as Q Networks
    participant P as Policy Network
    participant T as Target Networks
    
    B->>Q: 采样 batch (s,a,r,s')
    Q->>P: 请求下一动作
    P->>Q: 返回 (a', log pi)
    Q->>T: 获取目标 Q 值
    T->>Q: 返回 V_soft(s')
    Q->>Q: 计算 Q 损失并更新
    Q->>P: 提供更新后的 Q 值
    P->>P: 计算策略损失并更新
    Q->>T: 软更新目标网络`,
            tip: "软策略迭代的收敛性依赖于策略评估的充分性。实践中通常每轮策略评估执行 1-2 次 Q 更新即可，过度评估会浪费计算资源。",
            warning: "重参数化技巧中的 tanh 变换必须加上正确的雅可比行列式修正，否则 log_prob 计算错误会导致策略梯度方向完全错误。这是 SAC 实现中最常见的 bug 来源。"
        },
        {
            title: "4. 自动温度调节：让 Alpha 学会自适应",
            body: `SAC 的一个关键创新是引入了自动温度调节机制，使温度系数 alpha 不再是需要手动调参的超参数，而是可以在线学习优化的变量。这大大降低了 SAC 的使用门槛，使其成为真正即插即用的 RL 算法。

自动温度调节的思路来源于对偶优化理论。在最大熵 RL 中，我们希望策略的熵不低于某个目标值 H_target（通常设为动作维度）。如果当前策略的熵过低（过于确定性），alpha 应该增大以增加探索；如果熵过高（过于随机），alpha 应该减小以加速收敛。SAC 将这个问题形式化为一个约束优化问题：最大化期望回报的同时保持熵约束。通过对偶变量 alpha 的梯度上升/下降，可以自动调整探索强度。具体而言，alpha 的梯度为 E[-alpha * (log pi(a|s) + H_target)]，通过梯度下降优化 alpha 的负对数形式保证其始终为正。`,
            code: [
                {
                    lang: "python",
                    code: `class AutoTemperature:
    """SAC 自动温度调节器"""
    def __init__(self, initial_alpha: float = 0.2, 
                 target_entropy: float = None,
                 lr: float = 3e-4, action_dim: int = None):
        self.log_alpha = torch.tensor(
            [torch.log(torch.tensor(initial_alpha))],
            requires_grad=True
        )
        self.alpha_optimizer = torch.optim.Adam(
            [self.log_alpha], lr=lr
        )
        if target_entropy is None and action_dim is not None:
            # 默认目标熵 = -动作维度
            self.target_entropy = -action_dim
        else:
            self.target_entropy = target_entropy
    
    @property
    def alpha(self) -> torch.Tensor:
        return torch.exp(self.log_alpha.detach())
    
    def update(self, log_probs: torch.Tensor) -> float:
        """更新温度系数 alpha"""
        # 目标: alpha * (log pi + H_target) = 0
        alpha_loss = -(self.log_alpha * 
                      (log_probs.detach() + self.target_entropy)).mean()
        
        self.alpha_optimizer.zero_grad()
        alpha_loss.backward()
        self.alpha_optimizer.step()
        
        return alpha_loss.item()`
                },
                {
                    lang: "python",
                    code: `def train_with_auto_alpha(replay_buffer, q1, q2, 
                           policy, alpha_controller,
                           q1_optimizer, q2_optimizer, 
                           policy_optimizer, 
                           batch_size: int = 256,
                           gamma: float = 0.99,
                           tau: float = 0.005,
                           steps: int = 100000) -> list:
    """使用自动温度调节的 SAC 训练循环"""
    losses = []
    
    for step in range(steps):
        batch = replay_buffer.sample(batch_size)
        states, actions, rewards, next_states, dones = batch
        
        # 1) 更新 Q 网络
        q_losses = soft_policy_eval(q1, q2, policy, 
                                     states, actions, rewards, 
                                     next_states, dones,
                                     alpha=alpha_controller.alpha,
                                     gamma=gamma, tau=tau)
        q1_optimizer.zero_grad()
        q_losses["q1_loss"].backward()
        q1_optimizer.step()
        q2_optimizer.zero_grad()
        q_losses["q2_loss"].backward()
        q2_optimizer.step()
        
        # 2) 更新策略
        policy_loss = soft_policy_improvement(
            q1, q2, policy, policy_optimizer,
            states, alpha=alpha_controller.alpha
        )
        
        # 3) 更新 alpha
        alpha_loss = alpha_controller.update(policy_loss["log_prob"])
        
        # 4) 软更新目标网络
        soft_target_update(q1, q1_target, tau)
        soft_target_update(q2, q2_target, tau)
        
        losses.append({
            "q1_loss": q_losses["q1_loss"].item(),
            "policy_loss": policy_loss["policy_loss"],
            "alpha": alpha_controller.alpha.item()
        })
    
    return losses`
                }
            ],
            table: {
                headers: ["alpha 设置方式", "优点", "缺点", "适用场景"],
                rows: [
                    ["手动固定", "简单直接", "需要大量调参", "简单任务、快速验证"],
                    ["预定义衰减", "无需额外优化", "不够灵活", "已知收敛特性的任务"],
                    ["自动调节（SAC）", "自适应、通用性强", "增加优化开销", "大多数连续控制任务"],
                    ["约束优化方法", "理论保证", "实现复杂", "学术研究、严格约束场景"]
                ]
            },
            mermaid: `graph TD
    A["训练开始"] --> B["采样 batch"]
    B --> C["计算当前熵 H"]
    C --> D["H < H_target?"]
    D -->|是| E["增大 alpha: 增加探索"]
    D -->|否| F["减小 alpha: 加速收敛"]
    E --> G["更新 log_alpha"]
    F --> G
    G --> H["用新 alpha 训练 Q 和 Policy"]
    H --> A`,
            tip: "自动温度调节的 target_entropy 通常设为动作维度的负值（-dim(A)），这是一个经过验证的默认设置，在大多数 MuJoCo 任务中表现良好。",
            warning: "自动温度调节会在训练初期产生较大的 alpha 波动，可能导致 Q 值估计不稳定。建议在前 1000-5000 步使用较小的学习率或预热阶段来稳定训练。"
        },
        {
            title: "5. SAC vs PPO：两种范式的全方位对比",
            body: `在连续控制任务中，SAC 和 PPO（Proximal Policy Optimization）是最主流的两种算法，但它们代表了截然不同的设计哲学。PPO 属于 on-policy 方法，每次更新都使用最新策略采集的数据，保证了数据分布的一致性，但样本效率较低。SAC 属于 off-policy 方法，利用经验回放复用历史数据，样本效率显著更高。

PPO 的核心是裁剪目标函数，通过限制新旧策略的比值范围来确保策略更新的稳定性。SAC 的核心是最大熵目标函数和软 Bellman 方程，通过熵正则化实现自动探索。在实际应用中，SAC 通常需要 5-10 倍的样本量就能达到与 PPO 相当的性能，这对环境交互成本高的场景（如机器人控制）是巨大的优势。但 PPO 的 on-policy 特性使其在某些场景下更稳定，且更容易并行化（多环境同步采集）。`,
            code: [
                {
                    lang: "python",
                    code: `def ppo_update(policy, value_net, states, actions,
               old_log_probs, advantages, returns,
               clip_ratio: float = 0.2, 
               value_coef: float = 0.5,
               entropy_coef: float = 0.01) -> dict:
    """PPO 裁剪策略更新"""
    # 新策略分布
    mean, log_std = policy(states)
    dist = torch.distributions.Normal(mean, log_std.exp())
    new_log_probs = dist.log_prob(actions).sum(dim=-1)
    
    # 重要性采样比率
    ratio = torch.exp(new_log_probs - old_log_probs)
    
    # 裁剪目标
    surr1 = ratio * advantages
    surr2 = torch.clamp(ratio, 1 - clip_ratio, 
                        1 + clip_ratio) * advantages
    policy_loss = -torch.min(surr1, surr2).mean()
    
    # 值函数损失
    values = value_net(states).squeeze()
    value_loss = F.mse_loss(values, returns)
    
    # 熵正则
    entropy = dist.entropy().mean()
    
    total_loss = policy_loss + value_coef * value_loss - entropy_coef * entropy
    return {"total_loss": total_loss.item(), 
            "policy_loss": policy_loss.item(),
            "value_loss": value_loss.item()}`
                },
                {
                    lang: "python",
                    code: `def compare_sac_ppo(env_name: str = "HalfCheetah-v4",
                    sac_steps: int = 1_000_000,
                    ppo_episodes: int = 1000) -> dict:
    """SAC vs PPO 对比实验"""
    import gymnasium as gym
    
    env = gym.make(env_name)
    results = {}
    
    # SAC: off-policy, 样本效率高
    sac_buffer = ReplayBuffer(capacity=1_000_000)
    # ... SAC 训练 ...
    sac_reward_sac = train_sac(env, sac_buffer, sac_steps)
    results["SAC"] = {
        "type": "off-policy",
        "samples": sac_steps,
        "final_reward": sac_reward_sac,
        "sample_efficiency": "high"
    }
    
    # PPO: on-policy, 每次迭代需要新数据
    # ... PPO 训练 ...
    ppo_reward_ppo = train_ppo(env, ppo_episodes)
    results["PPO"] = {
        "type": "on-policy",
        "samples": ppo_episodes * env.spec.max_episode_steps,
        "final_reward": ppo_reward_ppo,
        "sample_efficiency": "low"
    }
    
    return results`
                }
            ],
            table: {
                headers: ["维度", "SAC", "PPO"],
                rows: [
                    ["策略类型", "off-policy", "on-policy"],
                    ["数据效率", "极高（百万级步）", "中等（千万级步）"],
                    ["探索机制", "最大熵（自动）", "策略熵（手动系数）"],
                    ["稳定性", "依赖 Q 网络质量", "裁剪机制保证稳定"],
                    ["并行化", "经验回放需同步", "天然支持多环境并行"],
                    ["超参数", "较少（alpha 可自调）", "较多（clip、GAE 等）"],
                    ["适用场景", "机器人控制、仿真", "游戏、并行仿真"],
                    ["收敛速度", "快（样本高效）", "慢（需要更多交互）"]
                ]
            },
            mermaid: `graph LR
    A["连续控制任务"] --> B{"样本效率要求？"}
    B -->|"高"| C["选择 SAC"]
    B -->|"低"| D{"需要并行化？"}
    D -->|"是"| E["选择 PPO"]
    D -->|"否"| F{"探索很重要？"}
    F -->|"是"| C
    F -->|"否"| E
    C --> G["最大熵 + off-policy"]
    E --> H["裁剪 + on-policy"]`,
            tip: "如果你有 MuJoCo 或 PyBullet 仿真环境且环境交互成本高，优先选择 SAC。如果你的任务可以轻松并行化多个环境副本，PPO 的实现更简单且并行效率更高。",
            warning: "PPO 的 on-policy 特性意味着每个 episode 的数据只能使用一次。在环境交互成本高的场景（如真机机器人），PPO 的样本效率可能成为严重瓶颈。"
        },
        {
            title: "6. 连续控制任务：SAC 的杀手级应用",
            body: `SAC 在连续控制任务中展现了卓越的性能，从 MuJoCo 物理仿真到真实机器人控制都有广泛应用。连续控制问题的特点是动作空间是连续的（如关节力矩、速度指令），这与离散控制（如游戏按键）有本质区别。

SAC 处理连续控制的核心优势在于：高斯策略网络天然输出连续动作分布，通过均值和方差的参数化可以灵活调整探索强度；重参数化技巧使得梯度可以平滑地通过采样操作传播；最大熵目标鼓励智能体在连续空间中探索多样化的行为模式。在经典的 MuJoCo 基准中，SAC 在 HalfCheetah、Walker2d、Ant 等任务上均达到了 state-of-the-art 性能，且通常只需 100 万步即可收敛，而 PPO 等 on-policy 方法需要 300-500 万步。在真实机器人控制中，SAC 的样本效率优势更加突出，因为每次真实交互都意味着时间和硬件成本。`,
            code: [
                {
                    lang: "python",
                    code: `import gymnasium as gym
import torch
import numpy as np

def evaluate_sac(policy: GaussianPolicy, 
                 env_name: str = "HalfCheetah-v4",
                 n_episodes: int = 10) -> dict:
    """评估 SAC 策略在连续控制环境中的性能"""
    env = gym.make(env_name)
    returns = []
    episode_lengths = []
    
    for ep in range(n_episodes):
        state, _ = env.reset()
        ep_reward = 0.0
        done = False
        
        while not done:
            state_t = torch.tensor(state, dtype=torch.float32).unsqueeze(0)
            with torch.no_grad():
                mean, log_std = policy(state_t)
                action = torch.tanh(mean).numpy().flatten()
            
            state, reward, terminated, truncated, _ = env.step(action)
            ep_reward += reward
            done = terminated or truncated
        
        returns.append(ep_reward)
        episode_lengths.append(env.unwrapped.time if hasattr(env.unwrapped, 'time') else 0)
    
    return {
        "mean_return": np.mean(returns),
        "std_return": np.std(returns),
        "max_return": np.max(returns),
        "mean_length": np.mean(episode_lengths)
    }`
                },
                {
                    lang: "python",
                    code: `class SACAgent:
    """完整的 SAC 智能体（连续控制）"""
    def __init__(self, state_dim: int, action_dim: int,
                 action_low: np.ndarray, action_high: np.ndarray,
                 hidden_dim: int = 256, lr: float = 3e-4,
                 buffer_size: int = 1_000_000,
                 batch_size: int = 256,
                 gamma: float = 0.99, tau: float = 0.005):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.action_scale = torch.tensor(
            (action_high - action_low) / 2
        )
        self.action_bias = torch.tensor(
            (action_high + action_low) / 2
        )
        
        self.policy = GaussianPolicy(state_dim, action_dim, hidden_dim)
        self.q1 = SoftQNetwork(state_dim, action_dim, hidden_dim)
        self.q2 = SoftQNetwork(state_dim, action_dim, hidden_dim)
        self.q1_target = SoftQNetwork(state_dim, action_dim, hidden_dim)
        self.q2_target = SoftQNetwork(state_dim, action_dim, hidden_dim)
        
        self.copy_weights(self.q1, self.q1_target)
        self.copy_weights(self.q2, self.q2_target)
        
        self.replay_buffer = ReplayBuffer(buffer_size)
        self.batch_size = batch_size
        self.gamma = gamma
        self.tau = tau
        
        self.policy_optimizer = torch.optim.Adam(
            self.policy.parameters(), lr=lr)
        self.q1_optimizer = torch.optim.Adam(
            self.q1.parameters(), lr=lr)
        self.q2_optimizer = torch.optim.Adam(
            self.q2.parameters(), lr=lr)
        
        self.alpha_controller = AutoTemperature(
            initial_alpha=0.2, action_dim=action_dim)
    
    def copy_weights(self, src: nn.Module, dst: nn.Module):
        for src_p, dst_p in zip(src.parameters(), dst.parameters()):
            dst_p.data.copy_(src_p.data)`
                }
            ],
            table: {
                headers: ["MuJoCo 环境", "动作维度", "观测维度", "SAC 典型回报"],
                rows: [
                    ["HalfCheetah-v4", "6", "17", "~11000-12000"],
                    ["Walker2d-v4", "6", "17", "~4500-5000"],
                    ["Ant-v4", "8", "27", "~5000-6000"],
                    ["Hopper-v4", "3", "11", "~3000-3500"],
                    ["Humanoid-v4", "17", "376", "~5000-6000"],
                    ["Swimmer-v4", "2", "8", "~140-160"]
                ]
            },
            mermaid: `graph TD
    A["连续控制环境"] --> B["观测空间: 关节位置+速度"]
    B --> C["SAC 策略网络"]
    C --> D["输出: mu, sigma"]
    D --> E["采样: a ~ N(mu, sigma)"]
    E --> F["tanh 缩放到动作范围"]
    F --> G["环境执行动作"]
    G --> H["获得奖励+新观测"]
    H --> I["存入经验回放"]
    I --> J["SAC 更新 Q+Policy+Alpha"]
    J --> C`,
            tip: "在 MuJoCo 环境中，建议对观测进行归一化（Running Normalization），这对 SAC 的稳定性至关重要。Gymnasium 提供了 RecordEpisodeStatistics wrapper 可以自动处理。",
            warning: "连续控制任务的动作范围通常被 tanh 缩放到 [-1, 1]，如果环境的真实动作范围不是对称的（如 [0, 1]），需要额外的线性变换，否则策略输出会被裁剪在无效区域。"
        },
        {
            title: "7. PyTorch 实战：从零实现 SAC",
            body: `本节提供一个完整的、可运行的 SAC 实现，涵盖 Pendulum-v1（经典入门环境）和 MuJoCo 环境的训练。我们将展示从环境搭建、智能体初始化、训练循环到性能评估的完整流程。代码设计遵循模块化原则，每个组件独立可测试。

实现的关键要点包括：经验回放使用 deque 实现高效采样，支持固定大小循环覆盖；训练采用延迟启动策略（delayed start），先随机探索填充 buffer 再开始训练；目标网络使用 Polyak 平均软更新（tau=0.005），比硬更新更稳定；策略更新频率高于 Q 更新（q_update_interval=2）可以提升最终性能但增加训练时间。整个实现约 300 行核心代码，是一个教学级的 SAC 参考实现。`,
            code: [
                {
                    lang: "python",
                    code: `import gymnasium as gym
import numpy as np
from collections import deque

class ReplayBuffer:
    """高效经验回放缓冲区"""
    def __init__(self, capacity: int = 1_000_000):
        self.buffer = deque(maxlen=capacity)
    
    def push(self, state, action, reward, 
             next_state, done):
        self.buffer.append((state, action, reward, 
                           next_state, done))
    
    def sample(self, batch_size: int) -> tuple:
        indices = np.random.choice(len(self.buffer), 
                                   batch_size, replace=False)
        batch = [self.buffer[i] for i in indices]
        states = np.array([b[0] for b in batch])
        actions = np.array([b[1] for b in batch])
        rewards = np.array([b[2] for b in batch])
        next_states = np.array([b[3] for b in batch])
        dones = np.array([b[4] for b in batch])
        return (torch.tensor(states, dtype=torch.float32),
                torch.tensor(actions, dtype=torch.float32),
                torch.tensor(rewards, dtype=torch.float32).unsqueeze(1),
                torch.tensor(next_states, dtype=torch.float32),
                torch.tensor(dones, dtype=torch.float32).unsqueeze(1))
    
    def __len__(self):
        return len(self.buffer)

def train_sac_pendulum(total_steps: int = 100_000,
                       batch_size: int = 256,
                       start_steps: int = 10_000) -> list:
    """在 Pendulum-v1 上训练 SAC"""
    env = gym.make("Pendulum-v1")
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.shape[0]
    
    agent = SACAgent(state_dim, action_dim,
                     env.action_space.low,
                     env.action_space.high)
    
    state, _ = env.reset()
    episode_reward = 0
    training_logs = []
    
    for step in range(total_steps):
        if step < start_steps:
            action = env.action_space.sample()
        else:
            action = agent.select_action(state, deterministic=False)
        
        next_state, reward, terminated, truncated, _ = env.step(action)
        done = terminated or truncated
        agent.replay_buffer.push(state, action, reward, next_state, done)
        state = next_state
        episode_reward += reward
        
        if step >= start_steps and len(agent.replay_buffer) > batch_size:
            for _ in range(1):
                agent.update(batch_size)
        
        if done:
            state, _ = env.reset()
            training_logs.append({"step": step, "reward": episode_reward})
            episode_reward = 0
    
    env.close()
    return training_logs`
                },
                {
                    lang: "python",
                    code: `def train_sac_mujoco(env_name: str = "HalfCheetah-v4",
                       total_steps: int = 1_000_000,
                       batch_size: int = 256,
                       start_steps: int = 10_000,
                       eval_interval: int = 10_000,
                       eval_episodes: int = 5) -> dict:
    """在 MuJoCo 环境上训练 SAC"""
    import gymnasium as gym
    
    env = gym.make(env_name)
    eval_env = gym.make(env_name)
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.shape[0]
    
    agent = SACAgent(
        state_dim=state_dim,
        action_dim=action_dim,
        action_low=env.action_space.low,
        action_high=env.action_space.high,
        hidden_dim=256,
        lr=3e-4,
        gamma=0.99,
        tau=0.005,
        buffer_size=1_000_000,
        batch_size=batch_size
    )
    
    state, _ = env.reset()
    episode_reward = 0
    results = {"steps": [], "train_rewards": [], "eval_rewards": []}
    
    for step in range(total_steps):
        # 选择动作
        if step < start_steps:
            action = env.action_space.sample()
        else:
            action = agent.select_action(state, deterministic=False)
        
        next_state, reward, terminated, truncated, _ = env.step(action)
        done = terminated or truncated
        agent.replay_buffer.push(state, action, reward, next_state, done)
        state = next_state
        episode_reward += reward
        
        # 训练
        if step >= start_steps and len(agent.replay_buffer) >= batch_size:
            agent.update(batch_size)
        
        # episode 结束
        if done:
            state, _ = env.reset()
            results["train_rewards"].append(episode_reward)
            results["steps"].append(step)
            episode_reward = 0
        
        # 定期评估
        if (step + 1) % eval_interval == 0:
            eval_reward = evaluate_sac(
                agent.policy, env_name, eval_episodes
            )
            results["eval_rewards"].append(eval_reward)
            print(f"Step {step}: eval_return = {eval_reward['mean_return']:.1f}")
    
    env.close()
    eval_env.close()
    return results`
                }
            ],
            table: {
                headers: ["超参数", "Pendulum", "HalfCheetah", "Walker2d"],
                rows: [
                    ["总步数", "100,000", "1,000,000", "1,000,000"],
                    ["Batch Size", "256", "256", "256"],
                    ["Hidden Dim", "256", "256", "256"],
                    ["学习率", "3e-4", "3e-4", "3e-4"],
                    ["Gamma", "0.99", "0.99", "0.99"],
                    ["Tau", "0.005", "0.005", "0.005"],
                    ["初始 Alpha", "0.2", "0.2", "0.2"],
                    ["Buffer Size", "1,000,000", "1,000,000", "1,000,000"]
                ]
            },
            mermaid: `graph TD
    A["环境 Pendulum/MuJoCo"] --> B["SACAgent 初始化"]
    B --> C["随机探索 start_steps"]
    C --> D["填充 ReplayBuffer"]
    D --> E["开始训练循环"]
    E --> F["采样 Batch"]
    F --> G["更新 Q1 + Q2"]
    F --> H["更新 Policy"]
    F --> I["更新 Alpha"]
    G --> J["软更新 Target Q"]
    H --> J
    I --> J
    J --> K{"完成？"}
    K -->|"否"| E
    K -->|"是"| L["评估 + 保存"]`,
            tip: "Pendulum-v1 是验证 SAC 实现的绝佳测试环境：维度低（3 维观测、1 维动作）、训练快（10 万步即可收敛）、结果可视化直观（倒立摆角度）。建议先用 Pendulum 调试代码，再迁移到 MuJoCo。",
            warning: "MuJoCo 环境需要 mujoco 和 dm_control 包支持。安装时注意系统依赖：macOS 需要 brew install glfw，Linux 需要 apt install libglfw3-dev。如果环境创建失败，先检查 mujoco 许可证和路径配置。"
        }
    ],
};
