import { Article } from '../knowledge';

export const article: Article = {
    id: "rl-003",
    title: "策略梯度：REINFORCE 算法",
    category: "rl",
    tags: ["策略梯度", "REINFORCE", "强化学习"],
    summary: "从值函数到策略函数，理解直接优化策略的强化学习方法",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 策略函数表示：Softmax 策略",
            body: `策略梯度方法的第一步是选择策略的表示方式。最经典的选择是 Softmax 策略，它将参数化的偏好值 h(s,a,theta) 转换为概率分布：pi_theta(a|s) = exp(h(s,a,theta)) / sum_b exp(h(s,b,theta))。这种表示天然保证概率非负且和为 1，无需额外约束。

当使用线性函数近似时，h(s,a,theta) = theta^T * x(s,a)，其中 x(s,a) 是状态-动作的特征向量。更常见的是使用神经网络作为函数近似器，此时 theta 是网络的所有权重。对于连续动作空间，策略通常参数化为高斯分布 pi_theta(a|s) = N(mu_theta(s), sigma^2)，其中均值 mu 由网络输出，方差可以固定或学习。`,
            code: [
                {
                    lang: "python",
                    code: `# Softmax 策略：离散动作空间的经典表示

import numpy as np

class SoftmaxPolicy:
    def __init__(self, n_states, n_actions, n_features=4):
        self.theta = np.random.randn(n_actions, n_features) * 0.01

    def feature_extractor(self, state):
        return np.array([1.0, state, state**2, np.sin(state)])

    def get_preferences(self, state):
        features = self.feature_extractor(state)
        return self.theta @ features

    def get_probs(self, state):
        h = self.get_preferences(state)
        h_shifted = h - np.max(h)  # 数值稳定
        exp_h = np.exp(h_shifted)
        return exp_h / np.sum(exp_h)

    def choose_action(self, state):
        probs = self.get_probs(state)
        return np.random.choice(len(probs), p=probs)

    def log_prob(self, state, action):
        probs = self.get_probs(state)
        return np.log(probs[action] + 1e-10)`
                },
                {
                    lang: "python",
                    code: `# 神经网络策略：更强大的函数近似器

class NeuralPolicy:
    def __init__(self, n_features, n_actions, hidden_size=64):
        scale1 = np.sqrt(2.0 / (n_features + hidden_size))
        scale2 = np.sqrt(2.0 / (hidden_size + n_actions))
        self.W1 = np.random.randn(n_features, hidden_size) * scale1
        self.b1 = np.zeros(hidden_size)
        self.W2 = np.random.randn(hidden_size, n_actions) * scale2
        self.b2 = np.zeros(n_actions)

    def forward(self, state):
        hidden = np.maximum(0, state @ self.W1 + self.b1)
        logits = hidden @ self.W2 + self.b2
        logits_shifted = logits - np.max(logits)
        probs = np.exp(logits_shifted) / np.sum(np.exp(logits_shifted))
        return probs, hidden, logits

    def choose_action(self, state):
        probs, _, _ = self.forward(state)
        return np.random.choice(len(probs), p=probs)

    def log_prob(self, state, action):
        probs, _, _ = self.forward(state)
        return np.log(probs[action] + 1e-10)`
                }
            ],
            table: {
                headers: ["策略表示", "参数数量", "表达能力", "适用场景"],
                rows: [
                    ["表格策略", "S * A", "最精确", "极小离散空间"],
                    ["线性 Softmax", "A * n_features", "线性可分", "特征工程好的场景"],
                    ["浅层神经网络", "可调节", "非线性", "中等复杂度任务"],
                    ["深度神经网络", "百万级", "极强", "Atari、MuJoCo 等"],
                    ["高斯策略", "2 * n_features", "连续动作", "机器人控制"],
                ]
            },
            mermaid: `graph LR
    A["状态 s"] --> B["特征提取 x(s)"]
    B --> C["偏好值 h(s,a)"]
    C --> D["Softmax 归一化"]
    D --> E["概率 pi(a|s)"]
    E --> F["采样动作 a"]
    C -.->|"h = theta * x"| G["参数 theta"]
    C -.->|"h = NN(x)"| H["神经网络权重"]`,
            tip: "Softmax 策略中务必做数值稳定处理：h_shifted = h - max(h)。否则当偏好值较大时 exp(h) 会溢出，导致 NaN 梯度。"
        },
        {
            title: "2. 策略梯度定理：理论基础",
            body: `策略梯度定理是策略梯度方法的数学基石，由 Sutton 等人在 2000 年提出。它给出了期望累积奖励关于策略参数的梯度的精确表达式，而无需对环境转移概率求导——这是该定理最精妙之处。

定理的核心结论是：gradient J(theta) = E[gradient log pi_theta(a|s) * Q_pi(s,a)]。这个公式的直觉非常清晰：如果某个动作在某个状态下带来了高 Q 值，我们就增大该动作在该状态下的选择概率。关键是不需要知道环境如何响应动作，因为 Q_pi 已经隐含了环境的动力学特性。`,
            code: [
                {
                    lang: "python",
                    code: `# 策略梯度定理的直观理解

def policy_gradient_intuition():
    """
    策略梯度定理：
    J(theta) = E[sum_t log(pi(a_t|s_t)) * G_t]

    推导思路：
    1. J(theta) = E_pi[G_0] = sum_tau p(tau|theta) * R(tau)
    2. grad J = sum_tau grad p(tau|theta) * R(tau)
    3. 利用 grad p = p * grad log p
    4. 得到 grad J = E_tau[grad log p(tau|theta) * R(tau)]
    5. grad log p(tau) = sum_t grad log pi(a_t|s_t)
    """
    pass

def estimate_policy_gradient(states, actions, returns, agent):
    grad = np.zeros_like(agent.theta)
    for traj_s, traj_a, traj_r in zip(states, actions, returns):
        for s, a, G in zip(traj_s, traj_a, traj_r):
            probs = agent.get_probs(s)
            grad_log_pi = -probs.copy()
            grad_log_pi[a] += 1.0
            grad += np.outer(np.ones_like(agent.theta[a]), grad_log_pi * G)
    return grad / len(states)`
                },
                {
                    lang: "python",
                    code: `# 策略梯度定理的数值验证

def verify_policy_gradient_theorem():
    np.random.seed(42)
    P = np.array([
        [[0.8, 0.2], [0.3, 0.7]],
        [[0.6, 0.4], [0.5, 0.5]],
    ])
    R = np.array([[1.0, 0.0], [0.5, 2.0]])
    gamma = 0.9
    theta = np.array([[0.1, -0.1], [0.0, 0.2]])

    def softmax(theta_row):
        e = np.exp(theta_row - np.max(theta_row))
        return e / e.sum()

    def expected_return(theta):
        pi = np.array([softmax(theta[0]), softmax(theta[1])])
        P_pi = np.zeros((2, 2))
        for s in range(2):
            for a in range(2):
                P_pi[s] += pi[s, a] * P[s, a]
        eigvals, eigvecs = np.linalg.eig(P_pi.T)
        stationary = np.real(eigvecs[:, np.argmax(eigvals)])
        stationary /= stationary.sum()
        R_pi = np.array([sum(pi[s,a]*R[s,a] for a in range(2)) for s in range(2)])
        V = np.linalg.solve(np.eye(2) - gamma * P_pi, R_pi)
        return stationary @ V

    eps = 1e-5
    numerical_grad = np.zeros_like(theta)
    J0 = expected_return(theta)
    for i in range(2):
        for j in range(2):
            tp = theta.copy()
            tp[i, j] += eps
            numerical_grad[i, j] = (expected_return(tp) - J0) / eps
    print(f"数值梯度:\\n{numerical_grad}")

verify_policy_gradient_theorem()`
                }
            ],
            table: {
                headers: ["公式元素", "含义", "计算方式"],
                rows: [
                    ["J(theta)", "期望累积奖励", "E_pi[sum gamma^t * R_t]"],
                    ["grad J(theta)", "策略梯度", "E[grad log pi(a|s) * Q(s,a)]"],
                    ["grad log pi(a|s)", "策略的对数梯度", "指示函数的无偏估计"],
                    ["Q_pi(s,a)", "动作值函数", "当前策略下的期望回报"],
                    ["d_pi(s)", "稳态分布", "长期访问各状态的频率"],
                ]
            },
            mermaid: `graph TD
    A["目标 J(theta)"] --> B["E_pi[G_0]"]
    B --> C["策略梯度定理"]
    C --> D["E[grad log pi * Q]"]
    D --> E["采样轨迹估计"]
    E --> F["蒙特卡洛回报 G_t"]
    E --> G["log 概率梯度"]
    F --> H["更新 theta"]
    G --> H
    H --> A
    style C fill:#7c2d12`,
            warning: "策略梯度定理最反直觉的一点是：不需要对环境转移概率 P(s'|s,a) 求导。因为 Q(s,a) 已经包含了环境动力学信息。"
        },
        {
            title: "3. REINFORCE 算法：蒙特卡洛策略梯度",
            body: `REINFORCE 是 Williams 在 1992 年提出的经典算法，是策略梯度定理最直接的应用。它使用蒙特卡洛方法估计回报 G_t，即从时刻 t 开始到 episode 结束的所有折扣奖励之和。由于使用了完整的 episode 回报，REINFORCE 是无偏的估计，但也因此具有较高的方差。

算法流程很简洁：采样完整轨迹，计算每个时间步的回报 G_t，然后用 grad log pi(a_t|s_t) * G_t 更新策略参数。REINFORCE 只在 episode 结束后才更新，属于回合更新。这保证了回报的无偏性，但也意味着学习效率较低，特别是在长 episode 中。`,
            code: [
                {
                    lang: "python",
                    code: `# REINFORCE 算法完整实现

import numpy as np
import gymnasium as gym

class REINFORCE:
    def __init__(self, n_features, n_actions, lr=0.01, gamma=0.99):
        self.lr = lr
        self.gamma = gamma
        self.W1 = np.random.randn(n_features, 32) * 0.01
        self.b1 = np.zeros(32)
        self.W2 = np.random.randn(32, n_actions) * 0.01
        self.b2 = np.zeros(n_actions)

    def forward(self, state):
        h = np.maximum(0, state @ self.W1 + self.b1)
        logits = h @ self.W2 + self.b2
        logits -= np.max(logits)
        probs = np.exp(logits) / np.sum(np.exp(logits))
        return probs, h

    def choose_action(self, state):
        probs, _ = self.forward(state)
        return np.random.choice(len(probs), p=probs)

    def compute_returns(self, rewards):
        returns = []
        G = 0
        for r in reversed(rewards):
            G = r + self.gamma * G
            returns.insert(0, G)
        returns = np.array(returns)
        return (returns - returns.mean()) / (returns.std() + 1e-8)

    def update(self, states, actions, rewards):
        returns = self.compute_returns(rewards)
        dW1, db1, dW2, db2 = 0, 0, 0, 0
        for s, a, G in zip(states, actions, returns):
            probs, h = self.forward(s)
            d_logits = -np.eye(len(probs))[a] + probs
            d_logits *= G
            dW2 += np.outer(h, d_logits)
            db2 += d_logits
            d_h = d_logits @ self.W2.T
            d_h[h <= 0] = 0
            dW1 += np.outer(s, d_h)
            db1 += d_h
        n = len(states)
        self.W1 += self.lr * dW1 / n
        self.b1 += self.lr * db1 / n
        self.W2 += self.lr * dW2 / n
        self.b2 += self.lr * db2 / n`
                },
                {
                    lang: "python",
                    code: `# REINFORCE 训练循环

def train_reinforce(env_name="CartPole-v1", episodes=1000, lr=0.01, gamma=0.99):
    env = gym.make(env_name)
    n_features = env.observation_space.shape[0]
    n_actions = env.action_space.n
    agent = REINFORCE(n_features, n_actions, lr, gamma)
    history = []

    for ep in range(episodes):
        state, _ = env.reset()
        states, actions, rewards = [], [], []
        done = False
        total_reward = 0

        while not done:
            action = agent.choose_action(state)
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            states.append(state)
            actions.append(action)
            rewards.append(reward)
            total_reward += reward
            state = next_state

        agent.update(states, actions, rewards)
        history.append(total_reward)

        if ep % 100 == 0:
            avg = np.mean(history[-100:])
            print(f"Episode {ep}: avg_reward = {avg:.1f}")

    env.close()
    return agent, history`
                }
            ],
            table: {
                headers: ["REINFORCE 特性", "说明", "影响"],
                rows: [
                    ["估计类型", "蒙特卡洛（完整 episode）", "无偏但高方差"],
                    ["更新时机", "回合结束", "长 episode 学习慢"],
                    ["策略类型", "随机策略（on-policy）", "只能使用当前策略采样"],
                    ["收敛保证", "渐近收敛到局部最优", "步长需满足 Robbins-Monro 条件"],
                    ["样本效率", "低", "需要大量交互数据"],
                ]
            },
            mermaid: `graph LR
    A["初始化 theta"] --> B["采样完整 episode"]
    B --> C["记录 s, a, r"]
    C --> D{Episode 结束?}
    D -->|否| B
    D -->|是| E["计算回报 G_t"]
    E --> F["标准化 G_t"]
    F --> G["更新 theta"]
    G --> B
    style D fill:#7c2d12
    style E fill:#14532d`,
            tip: "实践中对回报做标准化（减均值除标准差）能显著稳定训练，这是 REINFORCE 最重要的工程技巧之一。"
        },
        {
            title: "4. 基线函数：降低方差的利器",
            body: `策略梯度定理的公式中有一个非常巧妙的自由度：我们可以从 Q_pi(s,a) 中减去任意只依赖于状态的基线函数 b(s)，而不会改变梯度的期望值。即 E[grad log pi(a|s) * (Q_pi(s,a) - b(s))] = E[grad log pi(a|s) * Q_pi(s,a)]。这个性质成立的核心原因是 E[grad log pi(a|s) * b(s)] = 0，因为 log 概率梯度的期望恰好为零。

最常用的基线函数是状态值函数 V(s)，此时 Q(s,a) - V(s) 恰好就是优势函数 A(s,a)。优势函数衡量的是在状态 s 下选择动作 a 比平均水平好多少。如果 A > 0，说明这个动作优于平均，应该增大其概率；如果 A < 0，则应该减小其概率。`,
            code: [
                {
                    lang: "python",
                    code: `# 基线函数：为什么减去基线不影响期望

def prove_baseline_property():
    """数学证明：E[grad log pi(a|s) * b(s)] = 0"""
    theta = np.array([0.5, -0.3, 0.8])
    probs = np.exp(theta) / np.sum(np.exp(theta))
    grad_log_pi = np.eye(3) - probs
    expected_grad = probs @ grad_log_pi
    print(f"E[grad log pi] = {expected_grad}")  # 接近零

class BaselineREINFORCE:
    def __init__(self, n_features, n_actions, lr=0.01, gamma=0.99):
        self.lr = lr
        self.gamma = gamma
        self.W1 = np.random.randn(n_features, 32) * 0.01
        self.b1 = np.zeros(32)
        self.W2 = np.random.randn(32, n_actions) * 0.01
        self.b2 = np.zeros(n_actions)
        self.Vw1 = np.random.randn(n_features, 16) * 0.01
        self.Vb1 = np.zeros(16)
        self.Vw2 = np.random.randn(16, 1) * 0.01
        self.Vb2 = np.zeros(1)

    def get_value(self, state):
        h = np.maximum(0, state @ self.Vw1 + self.Vb1)
        return float(h @ self.Vw2 + self.Vb2)

    def update_baseline(self, states, returns, lr_v=0.05):
        for s, G in zip(states, returns):
            V = self.get_value(s)
            td_error = G - V
            h = np.maximum(0, s @ self.Vw1 + self.Vb1)
            self.Vw2 += lr_v * td_error * h
            self.Vb2 += lr_v * td_error`
                },
                {
                    lang: "python",
                    code: `# 基线对方差的降低效果模拟

def compare_variance_with_baseline(n_samples=10000):
    np.random.seed(42)
    Q_values = np.array([1.0, 2.0, 5.0, 0.5])
    probs = np.array([0.1, 0.2, 0.5, 0.2])

    grads_no_baseline = []
    for _ in range(n_samples):
        a = np.random.choice(4, p=probs)
        grad = (np.eye(4)[a] - probs) * Q_values[a]
        grads_no_baseline.append(grad)

    V = np.sum(probs * Q_values)
    grads_with_baseline = []
    for _ in range(n_samples):
        a = np.random.choice(4, p=probs)
        advantage = Q_values[a] - V
        grad = (np.eye(4)[a] - probs) * advantage
        grads_with_baseline.append(grad)

    var_no = np.var(grads_no_baseline, axis=0).sum()
    var_with = np.var(grads_with_baseline, axis=0).sum()
    print(f"无基线方差: {var_no:.4f}")
    print(f"有基线方差: {var_with:.4f}")
    print(f"方差降低: {(1 - var_with/var_no)*100:.1f}%")

compare_variance_with_baseline()`
                }
            ],
            table: {
                headers: ["基线选择", "b(s)", "方差降低", "计算代价"],
                rows: [
                    ["零基线", "0", "无降低", "零"],
                    ["均值基线", "mean(G)", "中等降低", "低"],
                    ["状态值 V(s)", "V(s)", "显著降低", "需额外训练值网络"],
                    ["移动平均基线", "rolling_mean(G)", "较好降低", "低"],
                    ["最优基线", "E[Q^2]/E[Q]", "理论最优", "高"],
                ]
            },
            mermaid: `graph TD
    A["策略梯度"] --> B["grad log pi * Q(s,a)"]
    B --> C["高方差"]
    A --> D["减去基线 b(s)"]
    D --> E["grad log pi * (Q - b)"]
    E --> F["低方差"]
    E --> G["期望值不变"]
    H["最优基线"] --> I["b*(s) = E[Q^2]/E[Q]"]
    I --> F
    style C fill:#7f1d1d
    style F fill:#14532d`,
            warning: "实践中最简单的基线是回报的移动平均。它不需要额外的值网络，但效果已经相当不错。"
        },
        {
            title: "5. 折扣回报与优势函数：深入理解",
            body: `折扣回报 G_t = R_{t+1} + gamma*R_{t+2} + gamma^2*R_{t+3} + ... 是强化学习中衡量长期价值的核心概念。折扣因子 gamma 控制着智能体对未来的重视程度：gamma 接近 1 时更关注长期收益，gamma 接近 0 时更关注即时奖励。

优势函数 A(s,a) = Q(s,a) - V(s) 提供了一个更精确的回报估计。它衡量的是在状态 s 下选择动作 a 相对于策略 pi 的平均表现好多少。优势函数在 Actor-Critic 架构中尤为重要，其中 Critic 估计 V(s)，Actor 使用 A(s,a) 来更新策略。虽然本节聚焦 REINFORCE，但理解优势函数是通向更高级算法的关键桥梁。`,
            code: [
                {
                    lang: "python",
                    code: `# 折扣回报 vs 优势函数

class DiscountedReturns:
    def __init__(self, gamma=0.99):
        self.gamma = gamma

    def compute(self, rewards):
        returns = []
        G = 0
        for r in reversed(rewards):
            G = r + self.gamma * G
            returns.insert(0, G)
        return np.array(returns)

class AdvantageEstimator:
    def __init__(self, gamma=0.99, lambda_=0.95):
        self.gamma = gamma
        self.lambda_ = lambda_

    def compute_gae(self, rewards, values, next_values, dones):
        advantages = []
        gae = 0
        for t in reversed(range(len(rewards))):
            delta = rewards[t] + self.gamma * next_values[t] * (1 - dones[t]) - values[t]
            gae = delta + self.gamma * self.lambda_ * gae * (1 - dones[t])
            advantages.insert(0, gae)
        return np.array(advantages)

    def compute_simple(self, rewards, values):
        dr = DiscountedReturns(self.gamma)
        returns = dr.compute(rewards)
        return returns - np.array(values)`
                },
                {
                    lang: "python",
                    code: `# 折扣因子 gamma 对策略学习的影响

def analyze_gamma_impact():
    rewards = [0, 0, 0, 0, 0, 0, 0, 0, 0, 10]
    for gamma in [0.5, 0.9, 0.99, 0.999, 1.0]:
        G = 0
        for r in reversed(rewards):
            G = r + gamma * G
        print(f"gamma={gamma:.3f}: G_0 = {G:.2f}")

analyze_gamma_impact()

def analyze_gae_lambda():
    rewards = [1, 2, 3, 4, 5]
    values = [0.5, 1.5, 2.5, 3.5, 4.5]
    next_values = [1.5, 2.5, 3.5, 4.5, 0.0]
    dones = [0, 0, 0, 0, 1]
    for lam in [0.0, 0.5, 0.95, 1.0]:
        gae = AdvantageEstimator(gamma=0.99, lambda_=lam)
        advantages = gae.compute_gae(rewards, values, next_values, dones)
        print(f"lambda={lam:.2f}: advantages = {advantages}")

analyze_gae_lambda()`
                }
            ],
            table: {
                headers: ["回报估计方法", "偏差", "方差", "公式"],
                rows: [
                    ["蒙特卡洛 G_t", "无偏", "高方差", "sum gamma^k * R_{t+k}"],
                    ["TD 误差 delta_t", "有偏", "低方差", "R_t + gamma*V(s') - V(s)"],
                    ["优势 A = G - V", "无偏", "中方差", "G_t - V(s_t)"],
                    ["GAE(lambda=0)", "有偏", "低方差", "等于 TD 误差"],
                    ["GAE(lambda=1)", "无偏", "高方差", "等于蒙特卡洛优势"],
                ]
            },
            mermaid: `graph LR
    A["MC 回报 G_t"] -->|"lambda=1"| B["GAE"]
    C["TD 误差 delta"] -->|"lambda=0"| B
    B --> D["A(s,a) 估计"]
    D --> E["策略更新"]
    F["lambda 小"] -->|偏差大方差小| B
    G["lambda 大"] -->|偏差小方差大| B
    style B fill:#0c4a6e`,
            tip: "GAE 中的 lambda 是最重要的超参数之一。通常 lambda=0.95 在偏差和方差之间取得了很好的平衡。"
        },
        {
            title: "6. CartPole 环境实战：REINFORCE 完整实现",
            body: `CartPole 是强化学习的标准测试环境。场景是一辆小车在水平轨道上移动，车上倒立着一根杆子。智能体的目标是通过左右移动小车来保持杆子不倒。状态空间是 4 维连续向量（小车位置、速度、杆子角度、角速度），动作空间是 2 维离散（左移或右移）。每一步杆子不倒就获得 +1 奖励。

这个环境看似简单，但完美展示了策略梯度方法的核心能力：从连续状态到离散动作的映射学习。我们使用一个两层神经网络作为策略函数近似器，配合基线函数降低方差。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import gymnasium as gym

class CartPoleREINFORCE:
    def __init__(self, lr=0.005, gamma=0.99):
        self.gamma = gamma
        self.lr = lr
        self.p_w1 = np.random.randn(4, 64) * 0.01
        self.p_b1 = np.zeros(64)
        self.p_w2 = np.random.randn(64, 2) * 0.01
        self.p_b2 = np.zeros(2)
        self.v_w1 = np.random.randn(4, 32) * 0.01
        self.v_b1 = np.zeros(32)
        self.v_w2 = np.random.randn(32, 1) * 0.01
        self.v_b2 = np.zeros(1)

    def policy_forward(self, state):
        h = np.tanh(state @ self.p_w1 + self.p_b1)
        logits = h @ self.p_w2 + self.p_b2
        logits -= np.max(logits)
        exp_l = np.exp(logits)
        probs = exp_l / exp_l.sum()
        return probs, h

    def value_forward(self, state):
        h = np.tanh(state @ self.v_w1 + self.v_b1)
        return float(h @ self.v_w2 + self.v_b2)

    def choose_action(self, state):
        probs, _ = self.policy_forward(state)
        return np.random.choice(2, p=probs)

    def compute_returns(self, rewards):
        returns = []
        G = 0
        for r in reversed(rewards):
            G = r + self.gamma * G
            returns.insert(0, G)
        returns = np.array(returns)
        return (returns - returns.mean()) / (returns.std() + 1e-8)

    def update(self, states, actions, rewards):
        returns = self.compute_returns(rewards)
        for s, a, G in zip(states, actions, returns):
            probs, h = self.policy_forward(s)
            d_logits = -np.eye(2)[a] + probs
            d_logits *= G
            self.p_w2 += self.lr * np.outer(h, d_logits)
            self.p_b2 += self.lr * d_logits
            d_h = d_logits @ self.p_w2.T * (1 - h**2)
            self.p_w1 += self.lr * np.outer(s, d_h)
            self.p_b1 += self.lr * d_h
            V = self.value_forward(s)
            v_error = G - V
            vh = np.tanh(s @ self.v_w1 + self.v_b1)
            self.v_w2 += 0.01 * v_error * vh
            self.v_b2 += 0.01 * v_error`
                },
                {
                    lang: "python",
                    code: `# 训练与评估

def train_cartpole(episodes=500):
    env = gym.make("CartPole-v1")
    agent = CartPoleREINFORCE()
    history = []
    for ep in range(episodes):
        state, _ = env.reset()
        states, actions, rewards = [], [], []
        total_reward = 0
        while True:
            action = agent.choose_action(state)
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            states.append(state)
            actions.append(action)
            rewards.append(reward)
            total_reward += reward
            state = next_state
            if done:
                break
        agent.update(states, actions, rewards)
        history.append(total_reward)
        if ep % 50 == 0 and ep > 0:
            avg = np.mean(history[-50:])
            print(f"Ep {ep:4d} | avg_50 = {avg:6.1f}")
        if np.mean(history[-100:]) >= 195:
            print(f"Solved at episode {ep}!")
            break
    env.close()
    return agent, history

def evaluate(agent, n_episodes=10):
    env = gym.make("CartPole-v1")
    scores = []
    for _ in range(n_episodes):
        state, _ = env.reset()
        total = 0
        while True:
            probs, _ = agent.policy_forward(state)
            action = np.argmax(probs)
            state, r, term, trunc, _ = env.step(action)
            total += r
            if term or trunc:
                break
        scores.append(total)
    env.close()
    print(f"avg = {np.mean(scores):.1f}, min = {min(scores)}, max = {max(scores)}")
    return scores`
                }
            ],
            table: {
                headers: ["CartPole 维度", "范围", "物理含义", "对策略的重要性"],
                rows: [
                    ["位置 x", "[-4.8, 4.8]", "小车在轨道上的位置", "超出范围则 episode 结束"],
                    ["速度 x_dot", "[-inf, inf]", "小车的水平速度", "影响下一步位置"],
                    ["角度 theta", "[-0.418, 0.418]", "杆子偏离垂直的角度", "最关键的平衡信号"],
                    ["角速度 theta_dot", "[-inf, inf]", "杆子的旋转速度", "预测角度变化趋势"],
                    ["动作", "{0, 1}", "0=左移, 1=右移", "唯一可控制的变量"],
                ]
            },
            mermaid: `graph TD
    A["CartPole 环境"] --> B["4维状态输入"]
    B --> C["策略网络"]
    C --> D["动作概率分布"]
    D --> E["采样动作"]
    E --> F["环境反馈"]
    F --> G["记录轨迹"]
    G --> H{Episode 结束?}
    H -->|否| B
    H -->|是| I["计算回报"]
    I --> J["更新策略+基线"]
    J --> A
    K["值网络 V(s)"] -.->|基线| I
    style C fill:#14532d
    style K fill:#7c2d12`,
            warning: "CartPole 的 solved 标准是最近 100 集平均奖励 >= 195。REINFORCE 通常在 200-400 个 episode 内可以达到。"
        },
        {
            title: "7. 策略梯度 vs 值方法：全面对比与选择指南",
            body: `策略梯度和值函数方法是强化学习的两大主流范式，各有优劣。值函数方法通过学习 Q 值间接学习策略，策略梯度方法直接优化策略参数。理解两者的差异对于选择合适的算法至关重要。

值函数方法的核心优势是样本效率较高，TD 学习利用自举机制不需要等到 episode 结束就能更新，而且 TD 误差的方差通常远小于蒙特卡洛回报的方差。但值函数方法在处理连续动作空间时面临困难，且确定性策略的探索需要额外设计。策略梯度方法天然支持连续动作和随机策略，但样本效率低、方差高。现代强化学习中，Actor-Critic 架构结合了两者的优势，成为工业界的首选。`,
            code: [
                {
                    lang: "python",
                    code: `# Actor-Critic：结合值方法和策略梯度的优势

import numpy as np

class ActorCritic:
    def __init__(self, n_features, n_actions, lr_actor=0.001, lr_critic=0.005):
        self.lr_actor = lr_actor
        self.lr_critic = lr_critic
        self.gamma = 0.99
        self.actor_w1 = np.random.randn(n_features, 64) * 0.01
        self.actor_w2 = np.random.randn(64, n_actions) * 0.01
        self.critic_w1 = np.random.randn(n_features, 64) * 0.01
        self.critic_w2 = np.random.randn(64, 1) * 0.01

    def select_action(self, state):
        h = np.tanh(state @ self.actor_w1)
        logits = h @ self.actor_w2
        logits -= np.max(logits)
        probs = np.exp(logits) / np.sum(np.exp(logits))
        return np.random.choice(len(probs), p=probs)

    def learn(self, state, action, reward, next_state, done):
        V_s = self._value(state)
        V_sp = 0.0 if done else self._value(next_state)
        td_error = reward + self.gamma * V_sp - V_s
        self._update_actor(state, action, td_error)
        self._update_critic(state, td_error)
        return td_error

    def _value(self, state):
        h = np.tanh(state @ self.critic_w1)
        return float(h @ self.critic_w2)

    def _update_actor(self, state, action, td_error):
        h = np.tanh(state @ self.actor_w1)
        probs = self._probs(state)
        d_logits = -np.eye(2)[action] + probs
        self.actor_w2 += self.lr_actor * td_error * np.outer(h, d_logits)

    def _update_critic(self, state, td_error):
        h = np.tanh(state @ self.critic_w1)
        self.critic_w2 += self.lr_critic * td_error * h

    def _probs(self, state):
        h = np.tanh(state @ self.actor_w1)
        logits = h @ self.actor_w2
        logits -= np.max(logits)
        exp_l = np.exp(logits)
        return exp_l / exp_l.sum()`
                },
                {
                    lang: "python",
                    code: `# 算法选择决策树

def choose_algorithm(action_space, state_dim, need_efficiency):
    if action_space == "continuous":
        if need_efficiency:
            return ["SAC（最大熵，样本效率好）", "TD3（确定性策略梯度）"]
        return ["PPO（稳定，工业界首选）", "DDPG（基础连续控制）"]
    else:
        if state_dim > 100:
            return ["DQN/Rainbow（高维离散）", "C51（分布型 DQN）"]
        else:
            if need_efficiency:
                return ["Q-learning（表格）", "SARSA（on-policy）"]
            return ["REINFORCE（策略梯度入门）", "Actor-Critic（混合架构）"]

# 使用示例
scenarios = [
    ("continuous", 24, False, "机器人控制"),
    ("discrete", 84*84*3, True, "Atari 游戏"),
    ("discrete", 4, False, "CartPole"),
]
for action_s, state_d, eff, name in scenarios:
    recs = choose_algorithm(action_s, state_d, eff)
    print(f"\\n{name}: {recs}")`
                }
            ],
            table: {
                headers: ["对比维度", "值函数方法 (DQN)", "策略梯度 (REINFORCE)", "Actor-Critic (A2C/PPO)"],
                rows: [
                    ["样本效率", "高（TD 自举）", "低（蒙特卡洛）", "中高（Critic 辅助）"],
                    ["方差", "低", "高", "中"],
                    ["连续动作", "困难", "天然支持", "天然支持"],
                    ["随机策略", "需要额外设计", "天然支持", "天然支持"],
                    ["收敛稳定性", "较好", "较差（高方差）", "好（工业首选）"],
                    ["工业应用", "推荐系统", "较少单独使用", "首选（PPO/SAC）"],
                ]
            },
            mermaid: `graph TD
    A["算法选择"] --> B{动作空间类型?}
    B -->|离散| C{状态维度?}
    B -->|连续| D["策略梯度类算法"]
    C -->|低维| E["Q-learning / SARSA"]
    C -->|高维| F["DQN / Rainbow"]
    D --> G{样本效率需求?}
    G -->|高| H["SAC / TD3"]
    G -->|中| I["PPO / A3C"]
    J["Actor-Critic"] --> K["结合两者优势"]
    K --> L["工业界首选"]
    style J fill:#0c4a6e
    style L fill:#14532d`,
            warning: "现代强化学习中，纯 REINFORCE 已经很少单独使用。Actor-Critic 架构（特别是 PPO 和 SAC）结合了两者的优势，是工业界的首选。但理解 REINFORCE 是理解所有高级策略梯度算法的基础。"
        }
    ],
};
