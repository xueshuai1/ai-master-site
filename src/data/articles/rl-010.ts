import { Article } from '../knowledge';

export const article: Article = {
    id: "rl-010",
    title: "强化学习基础：从 Q-Learning 到 PPO",
    category: "rl",
    tags: ["强化学习", "MDP", "Q-Learning", "Policy Gradient", "PPO", "DQN"],
    summary: "强化学习系统入门。从马尔可夫决策过程出发，讲解 Q-Learning、Deep Q-Network、Policy Gradient 到 PPO 的完整技术路线，包含 CartPole 环境下的完整 Python 实现。",
    date: "2026-04-22",
    readTime: "25 min",
    level: "入门",
    content: [
        {
            title: "1. 什么是强化学习：Agent-Environment 交互范式",
            body: `强化学习（Reinforcement Learning, RL）是机器学习中与监督学习、无监督学习并列的第三大范式。它的核心思想非常直观：一个智能体（Agent）通过与环境（Environment）交互，根据环境给出的奖励信号来学习最优行为策略。

与监督学习的根本区别在于反馈信号的性质。在监督学习中，每个输入样本都有明确的"标准答案"——给一张猫的图片，标签就是"猫"，损失函数精确地告诉你错在哪里。但在强化学习中，智能体只能得到一个延迟的标量奖励（Reward），它必须自己判断"刚才哪个动作导致了后续的高奖励"——这就是著名的信用分配问题（Credit Assignment Problem）。

强化学习的交互循环非常简单但极其强大：在每一个时间步 t，智能体观察到环境的状态 s_t，选择一个动作 a_t，环境转移到新状态 s_{t+1} 并给出奖励 r_{t+1}。智能体的目标是最大化累积奖励（通常带有折扣因子 gamma），而不是眼前的即时奖励。

这个范式可以建模几乎所有序贯决策问题：下围棋（每一步落棋的选择）、机器人控制（每个关节的力矩输出）、自动驾驶（方向盘转角和油门）、甚至大语言模型的对齐训练（每个 token 的生成）。`,
            mermaid: `graph TD
    A["环境状态 s_t"] --> B["智能体观察"]
    B --> C["选择动作 a_t"]
    C --> D["环境执行动作"]
    D --> E["新状态 s_{t+1}"]
    D --> F["奖励 r_{t+1}"]
    E --> A
    F --> G["智能体更新策略"]
    G --> B
    class G s3
    class C s2
    class B s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#581c87
    classDef s2 fill:#7c2d12
    classDef s3 fill:#14532d`,
            code: [
                {
                    lang: "python",
                    code: `# 强化学习交互循环的简化模拟
import numpy as np

class SimpleEnvironment:
    """一个极简的强化学习环境：寻找宝藏
    
    状态: 0-4 共 5 个位置
    动作: 0=向左, 1=向右
    奖励: 到达位置 4 得 +10，其余位置得 -1
    """
    def __init__(self):
        self.state = 0
        self.done = False

    def reset(self):
        self.state = 0
        self.done = False
        return self.state

    def step(self, action):
        if action == 0:  # 向左
            self.state = max(0, self.state - 1)
        else:  # 向右
            self.state = min(4, self.state + 1)

        reward = 10 if self.state == 4 else -1
        self.done = (self.state == 4)
        return self.state, reward, self.done

# 演示交互
env = SimpleEnvironment()
state = env.reset()
print(f"初始状态: {state}")

# 随机策略
total_reward = 0
for step in range(20):
    action = np.random.choice([0, 1])
    next_state, reward, done = env.step(action)
    total_reward += reward
    print(f"  步 {step+1}: 动作={'←' if action==0 else '→'}, "
          f"状态={state}→{next_state}, 奖励={reward}")
    state = next_state
    if done:
        print(f"  找到宝藏！总奖励: {total_reward}")
        break`,
                },
                {
                    lang: "python",
                    code: `# 折扣累积回报计算：理解 gamma 的作用

def compute_returns(rewards, gamma=0.9):
    """计算每一步的折扣累积回报
    
    G_t = r_{t+1} + gamma*r_{t+2} + gamma^2*r_{t+3} + ...
    
    gamma 决定了"远见"程度：
    - gamma=0：只看眼前（贪婪）
    - gamma=0.99：非常长远
    - gamma=1：完全平等看待未来
    """
    returns = np.zeros(len(rewards))
    G = 0
    for t in reversed(range(len(rewards))):
        G = rewards[t] + gamma * G
        returns[t] = G
    return returns

# 不同 gamma 对回报的影响
rewards = [-1, -1, -1, -1, -1, -1, -1, -1, -1, 10]

print("不同折扣因子下的回报：")
for gamma in [0.0, 0.5, 0.9, 0.99]:
    returns = compute_returns(rewards, gamma)
    print(f"  gamma={gamma:.2f}: G_0 = {returns[0]:.2f}, G_5 = {returns[5]:.2f}")`,
                },
            ],
            table: {
                headers: ["维度", "监督学习", "强化学习", "强化学习的特点"],
                rows: [
                    ["反馈信号", "每个样本的标准答案", "延迟的标量奖励", "信号稀疏且延迟"],
                    ["数据分布", "独立同分布（IID）", "时序相关（非 IID）", "数据随策略变化"],
                    ["学习目标", "最小化预测误差", "最大化累积奖励", "长期最优而非短期最优"],
                    ["探索需求", "不需要（数据已给定）", "必须主动探索", "探索-利用权衡"],
                    ["典型场景", "分类、回归、翻译", "游戏、机器人控制、推荐", "需要序贯决策"],
                ],
            },
            tip: "理解强化学习的第一步是玩一个游戏（如 CartPole），体会'选择动作→观察结果→调整策略'的循环。这种体验比读十页公式更有助于建立直觉。",
        },
        {
            title: "2. 马尔可夫决策过程（MDP）：形式化框架",
            body: `马尔可夫决策过程（Markov Decision Process, MDP）是强化学习的数学基础。几乎所有强化学习问题都可以建模为一个 MDP，它由五元组 (S, A, P, R, gamma) 构成。

状态空间 S 是所有可能状态的集合。在棋盘游戏中，S 是所有可能的棋盘布局；在 CartPole 环境中，S 是杆的角度和角速度、小车的位置和速度的组合。状态需要满足马尔可夫性——即给定当前状态，未来的状态和奖励只取决于当前状态和当前动作，与历史无关。

动作空间 A 是智能体可以执行的所有动作。离散动作空间如 {上, 下, 左, 右}，连续动作空间如机械臂关节的力矩值（一个实数向量）。

状态转移概率 P(s'|s, a) 描述了环境的动态特性：在状态 s 执行动作 a 后，转移到状态 s' 的概率。在确定性环境中，这个概率是 0 或 1；在随机环境中，它取中间值。

奖励函数 R(s, a, s') 定义了每个转移的即时反馈。设计奖励函数是 RL 实践中最困难也最重要的环节之一——设计不当的奖励函数可能导致智能体学到意想不到的"作弊"行为。

折扣因子 gamma 决定了未来奖励的重要性。gamma 接近 0 时，智能体只关心即时奖励（短视）；gamma 接近 1 时，智能体同等看待遥远的未来奖励（长远）。`,
            mermaid: `graph LR
    A["状态空间 S 所有可能状态"] --> B["动作空间 A 可执行的动作"]
    B --> C["转移概率 P 环境动态特性"]
    C --> D["奖励函数 R 即时反馈"]
    D --> E["折扣因子 gamma 未来奖励权重"]

    A -.->|马尔可夫性| F["P(s'|s,a) 不依赖历史"]
    E -.->|"G = r + gamma*G"| G["累积折扣回报"]
    class G s3
    class D s2
    class C s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12
    classDef s2 fill:#881337
    classDef s3 fill:#14532d`,
            code: [
                {
                    lang: "python",
                    code: `# 用字典表示一个完整的 MDP：悬崖行走（Cliff Walking）
# 4×12 的网格，从左下角走到右下角，避开悬崖

class CliffWalkingMDP:
    """悬崖行走 MDP
    
    4行12列的网格世界：
    S = 起点 (3, 0)
    G = 终点 (3, 11)
    第3行中间10个格子是悬崖
    
    到达悬崖：-100 奖励，回到起点
    到达终点：0 奖励，episode 结束
    每步移动：-1 奖励
    """
    def __init__(self, rows=4, cols=12):
        self.rows = rows
        self.cols = cols
        self.actions = [0, 1, 2, 3]  # 上, 右, 下, 左
        self.action_names = ['上', '右', '下', '左']
        self.deltas = [(-1, 0), (0, 1), (1, 0), (0, -1)]
        self.cliff_rows = {rows - 1}
        self.cliff_cols = set(range(1, cols - 1))
        self.n_states = rows * cols

    def state_to_pos(self, state):
        return divmod(state, self.cols)

    def pos_to_state(self, row, col):
        return row * self.cols + col

    def step(self, state, action):
        row, col = self.state_to_pos(state)
        dr, dc = self.deltas[action]
        new_row = max(0, min(self.rows - 1, row + dr))
        new_col = max(0, min(self.cols - 1, col + dc))

        # 检查是否落入悬崖
        if new_row == self.rows - 1 and 0 < new_col < self.cols - 1:
            return self.pos_to_state(self.rows - 1, 0), -100, True

        # 检查是否到达终点
        new_state = self.pos_to_state(new_row, new_col)
        done = (new_state == self.pos_to_state(self.rows - 1, self.cols - 1))
        reward = 0 if done else -1

        return new_state, reward, done

mdp = CliffWalkingMDP()
state = mdp.pos_to_state(3, 0)  # 起点
print(f"起点状态: {state}")
next_state, reward, done = mdp.step(state, 1)  # 向右
print(f"向右走: 状态 {state} → {next_state}, 奖励={reward}")`,
                },
            ],
            table: {
                headers: ["MDP 元素", "符号", "含义", "Cliff Walking 示例"],
                rows: [
                    ["状态空间", "S", "所有可能的状态", "4×12=48 个网格位置"],
                    ["动作空间", "A", "可选择的动作", "上、右、下、左（4 个）"],
                    ["转移概率", "P(s'|s,a)", "执行动作后的状态转移", "确定性（80% 概率滑到随机方向）"],
                    ["奖励函数", "R(s,a,s')", "每个转移的即时反馈", "悬崖 -100，终点 0，每步 -1"],
                    ["折扣因子", "gamma", "未来奖励的折现率", "通常取 0.9 或 1.0"],
                ],
            },
        },
        {
            title: "3. 价值函数与 Bellman 方程",
            body: `价值函数是强化学习的核心概念之一，它回答了一个关键问题："这个状态（或状态-动作对）有多好？"这里的"好"不是指即时奖励，而是从当前时刻开始的期望累积折扣回报。

状态值函数 V_pi(s) 衡量的是：从状态 s 出发，按照策略 pi 行动的期望累积回报。它评估的是状态本身的"价值"——到达这个位置有多好。

动作值函数 Q_pi(s, a)（也叫 Q 函数）衡量的是：在状态 s 执行动作 a，之后按照策略 pi 行动的期望累积回报。它评估的是状态-动作对的"价值"——在这个状态下做这个动作有多好。

Bellman 方程建立了值函数的递归关系：一个状态的值等于即时奖励加上后续状态的折现值。这种递归结构是动态规划、值迭代、Q-learning 等所有 RL 算法的数学基础。

Bellman 期望方程描述了固定策略下的值函数递归：V_pi(s) = Σ_a pi(a|s) Σ_{s',r} P(s',r|s,a)[r + gamma·V_pi(s')]。Bellman 最优方程则直接描述最优值函数：V*(s) = max_a Σ_{s',r} P(s',r|s,a)[r + gamma·V*(s')]。两者的关键区别在于后者有 max 操作，这使得它描述的是最优策略而非任意策略。`,
            code: [
                {
                    lang: "python",
                    code: `# Bellman 方程的数值求解：值迭代

import numpy as np

def value_iteration_simple(n_states, transitions, rewards, gamma=0.9,
                           theta=1e-6, max_iter=1000):
    """值迭代求解 Bellman 最优方程
    
    transitions[s][a] = [(prob, next_state, reward), ...]
    """
    V = np.zeros(n_states)
    n_actions = len(transitions[0])

    for iteration in range(max_iter):
        delta = 0
        V_new = np.zeros(n_states)

        for s in range(n_states):
            q_values = np.zeros(n_actions)
            for a in range(n_actions):
                for prob, sp, r in transitions[s][a]:
                    q_values[a] += prob * (r + gamma * V[sp])
            V_new[s] = np.max(q_values)
            delta = max(delta, abs(V_new[s] - V[s]))

        V = V_new
        if delta < theta:
            print(f"收敛！迭代 {iteration+1} 次")
            break

    # 从最优值函数提取最优策略
    policy = np.zeros(n_states, dtype=int)
    for s in range(n_states):
        q_values = np.zeros(n_actions)
        for a in range(n_actions):
            for prob, sp, r in transitions[s][a]:
                q_values[a] += prob * (r + gamma * V[sp])
        policy[s] = np.argmax(q_values)

    return V, policy

# 简单 3 状态示例
transitions = [
    # 状态 0
    [
        [(1.0, 1, 5)],   # 动作 0: 一定到状态 1，奖励 5
        [(0.5, 0, 0), (0.5, 2, 10)]  # 动作 1: 50% 留在 0, 50% 到 2
    ],
    # 状态 1
    [
        [(1.0, 2, 3)],
        [(1.0, 0, 1)]
    ],
    # 状态 2 (终止状态)
    [
        [(1.0, 2, 0)],
        [(1.0, 2, 0)]
    ]
]

V, policy = value_iteration_simple(3, transitions, None, gamma=0.9)
print(f"最优值函数: V = {V}")
print(f"最优策略: pi = {policy}")`,
                },
            ],
            tip: "Bellman 方程的价值在于它将一个'全局优化'问题转化为'局部递归'问题——每个状态的值只依赖于相邻状态的值，这使得动态规划成为可能。",
        },
        {
            title: "4. Q-Learning：表格方法与 epsilon-greedy 策略",
            body: `Q-Learning 是强化学习中最经典、最重要的算法之一，由 Chris Watkins 在 1989 年提出。它是一种无模型的（Model-Free）时序差分（TD）学习方法，智能体不需要知道环境的转移概率 P 和奖励函数 R，只需要通过与环境交互就能学到最优策略。

Q-Learning 的核心更新规则是：Q(s, a) ← Q(s, a) + alpha × [r + gamma × max_a' Q(s', a') - Q(s, a)]。这个公式的含义是：用"即时奖励 + 下一状态的最大 Q 值"作为目标，逐步逼近真实的 Q 函数。其中 alpha 是学习率，控制更新速度；gamma 是折扣因子，控制对未来的重视程度。

Q-Learning 是"离线学习"（Off-Policy）的：它学习的是最优 Q 函数（贪婪策略），但用于选择动作的策略可以不同（如 epsilon-greedy）。这意味着智能体可以在探索（随机动作）的同时学习最优策略。

Epsilon-greedy 策略是最常用的探索策略：以 epsilon 的概率随机选择动作（探索），以 1-epsilon 的概率选择当前最优动作（利用）。训练过程中逐渐减小 epsilon，从探索为主过渡到利用为主。

Q-Learning 的收敛性已被数学证明：在有限状态-动作空间下，如果所有状态-动作对被无限次访问，且学习率满足适当衰减条件，Q-Learning 保证收敛到最优 Q 函数。但在实践中，大状态空间使得表格方法不可行，这正是 Deep Q-Network 的动机。`,
            mermaid: `graph TD
    A["观察状态 s"] --> B{"Epsilon-Greedy"}
    B -->|"概率 epsilon"| C["随机动作（探索）"]
    B -->|"概率 1-epsilon"| D["argmax Q(s,a)（利用）"]
    C --> E["执行动作 a"]
    D --> E
    E --> F["观察 r, s'"]
    F --> G["Q(s,a) += alpha * (r + gamma*max Q(s',a') - Q(s,a))"]
    G --> H["s = s'"]
    H --> A
    class G s1
    class B s0
    classDef s0 fill:#7c2d12
    classDef s1 fill:#14532d`,
            code: [
                {
                    lang: "python",
                    code: `# Q-Learning 从零实现
import numpy as np
import gymnasium as gym

def q_learning(env, episodes=1000, alpha=0.1, gamma=0.99,
               epsilon=1.0, epsilon_min=0.01, epsilon_decay=0.995):
    """Q-Learning 算法实现"""
    n_states = env.observation_space.n
    n_actions = env.action_space.n
    Q = np.zeros((n_states, n_actions))
    episode_rewards = []

    for ep in range(episodes):
        state, _ = env.reset()
        total_reward = 0
        terminated = False
        truncated = False

        while not (terminated or truncated):
            # Epsilon-greedy 选择动作
            if np.random.random() < epsilon:
                action = env.action_space.sample()  # 探索
            else:
                action = np.argmax(Q[state])  # 利用

            next_state, reward, terminated, truncated, _ = env.step(action)

            # Q-Learning 核心更新
            if terminated:
                td_target = reward  # 终止状态没有未来值
            else:
                td_target = reward + gamma * np.max(Q[next_state])

            td_error = td_target - Q[state, action]
            Q[state, action] += alpha * td_error

            state = next_state
            total_reward += reward

        episode_rewards.append(total_reward)
        epsilon = max(epsilon_min, epsilon * epsilon_decay)

        if (ep + 1) % 100 == 0:
            avg_reward = np.mean(episode_rewards[-100:])
            print(f"Episode {ep+1:5d} | Avg Reward: {avg_reward:.2f} | "
                  f"Epsilon: {epsilon:.3f}")

    return Q, episode_rewards

# 在 FrozenLake 上运行
env = gym.make("FrozenLake-v1", is_slippery=True)
Q, rewards = q_learning(env, episodes=2000, alpha=0.1)
print(f"\\nQ 表形状: {Q.shape}")
print(f"最终 100 集平均奖励: {np.mean(rewards[-100:]):.3f}")`,
                },
                {
                    lang: "python",
                    code: `# 探索-利用权衡的可视化

import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def plot_epsilon_decay():
    """展示不同 epsilon 衰减策略的效果"""
    episodes = np.arange(1, 501)

    # 三种衰减策略
    eps_fast = np.maximum(0.01, 1.0 * (0.990 ** episodes))
    eps_medium = np.maximum(0.01, 1.0 * (0.995 ** episodes))
    eps_slow = np.maximum(0.01, 1.0 * (0.998 ** episodes))

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(episodes, eps_fast, label='快速衰减 (0.990)', linewidth=2)
    ax.plot(episodes, eps_medium, label='中速衰减 (0.995)', linewidth=2)
    ax.plot(episodes, eps_slow, label='慢速衰减 (0.998)', linewidth=2)
    ax.set_xlabel('Episode')
    ax.set_ylabel('Epsilon (探索概率)')
    ax.set_title('Epsilon-Greedy 探索率衰减曲线')
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_ylim(0, 1.05)
    plt.savefig('epsilon_decay.png', dpi=100)
    print("已保存 epsilon_decay.png")

plot_epsilon_decay()`,
                },
            ],
            table: {
                headers: ["参数", "含义", "典型值", "影响"],
                rows: [
                    ["学习率 alpha", "新信息覆盖旧信息的程度", "0.01-0.2", "太大：不稳定；太小：学习慢"],
                    ["折扣因子 gamma", "未来奖励的重要性", "0.9-0.999", "越大越重视长期回报"],
                    ["初始 epsilon", "初始探索概率", "1.0（100% 探索）", "确保充分探索"],
                    ["epsilon 衰减率", "探索率下降速度", "0.99-0.999/步", "太快：探索不足；太慢：利用不够"],
                    ["最小 epsilon", "最终探索概率下限", "0.01-0.05", "保留少量探索防止陷入局部最优"],
                ],
            },
            warning: "Q-Learning 只适用于离散状态-动作空间。当状态空间很大或连续时（如图像输入、连续控制），表格方法不可行，必须使用 Deep Q-Network。",
        },
        {
            title: "5. Deep Q-Network（DQN）：用神经网络近似 Q 函数",
            body: `当状态空间很大（如 Atari 游戏的像素画面）时，Q 表格会变得巨大且稀疏，Q-Learning 无法有效工作。Deep Q-Network（DQN）由 DeepMind 在 2013 年提出，用神经网络替代 Q 表格来近似 Q 函数：Q(s, a; theta) ≈ Q*(s, a)。

DQN 的关键创新有三点：经验回放（Experience Replay）、目标网络（Target Network）和卷积编码器（Convolutional Encoder）。

经验回放解决了样本相关性问题和数据效率问题。在标准 RL 中，相邻样本高度相关（因为它们是连续时间步产生的），这违反了 SGD 的独立同分布假设，导致训练不稳定。经验回放将所有转移 (s, a, r, s') 存储在一个缓冲区中，训练时从中随机采样，打破了样本之间的相关性。同时，经验回放允许多次重用历史数据，提高了数据效率。

目标网络解决了移动目标问题。在标准 Q-learning 中，TD 目标 r + gamma × max Q(s', a'; theta) 依赖于当前的网络参数 theta，而 theta 又在不断更新，这使得学习目标不断变化（移动靶），训练难以收敛。目标网络使用一组独立的、缓慢更新的参数 theta' 来计算 TD 目标，每 C 步才将 theta 复制到 theta'，使得目标相对稳定。

卷积编码器将原始像素输入（如 Atari 游戏的 210×160 RGB 图像）编码为低维状态表示。这是 DQN 能直接从像素学习的关键。`,
            mermaid: `graph TD
    A["原始像素输入 210×160×3"] --> B["预处理 灰度+裁剪+下采样"]
    B --> C["卷积层 1 32 filters, 8×8"]
    C --> D["卷积层 2 64 filters, 4×4"]
    D --> E["卷积层 3 64 filters, 3×3"]
    E --> F["Flatten"]
    F --> G["全连接层 512"]
    G --> H["Q 值输出层 N 个动作的 Q 值"]
    class H s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            code: [
                {
                    lang: "python",
                    code: `# DQN 核心组件实现

import torch
import torch.nn as nn
import numpy as np
from collections import deque

class DQNNetwork(nn.Module):
    """简单的 DQN 网络（MLP 版本，适合离散状态空间）"""
    def __init__(self, state_dim, action_dim, hidden_dim=128):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim)
        )

    def forward(self, x):
        return self.network(x)

    def get_action(self, state, epsilon=0.1):
        """Epsilon-greedy 动作选择"""
        if np.random.random() < epsilon:
            return np.random.randint(self.network[-1].out_features)
        with torch.no_grad():
            state = torch.FloatTensor(state).unsqueeze(0)
            q_values = self.network(state)
            return q_values.argmax().item()


class ReplayBuffer:
    """经验回放缓冲区"""
    def __init__(self, capacity=10000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size=64):
        indices = np.random.choice(len(self.buffer), batch_size, replace=False)
        batch = [self.buffer[i] for i in indices]
        states, actions, rewards, next_states, dones = zip(*batch)
        return (torch.FloatTensor(states),
                torch.LongTensor(actions),
                torch.FloatTensor(rewards),
                torch.FloatTensor(next_states),
                torch.FloatTensor(dones))

    def __len__(self):
        return len(self.buffer)`,
                },
                {
                    lang: "python",
                    code: `# DQN 训练循环

def train_dqn(env, episodes=500, batch_size=64, gamma=0.99,
              lr=1e-3, target_update=10, epsilon_start=1.0,
              epsilon_end=0.01, epsilon_decay=0.995):
    """DQN 完整训练流程"""
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.n

    # 主网络和目标网络
    q_network = DQNNetwork(state_dim, action_dim)
    target_network = DQNNetwork(state_dim, action_dim)
    target_network.load_state_dict(q_network.state_dict())

    optimizer = torch.optim.Adam(q_network.parameters(), lr=lr)
    replay_buffer = ReplayBuffer(capacity=10000)
    epsilon = epsilon_start

    for ep in range(episodes):
        state, _ = env.reset()
        total_reward = 0

        while True:
            # 选择动作
            action = q_network.get_action(state, epsilon)

            # 执行动作
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated

            # 存储经验
            replay_buffer.push(state, action, reward, next_state, float(done))
            state = next_state
            total_reward += reward

            # 从缓冲区采样并训练
            if len(replay_buffer) >= batch_size:
                states, actions, rewards, next_states, dones = \
                    replay_buffer.sample(batch_size)

                # 当前 Q 值
                current_q = q_network(states).gather(
                    1, actions.unsqueeze(1)).squeeze(1)

                # 目标 Q 值（用目标网络）
                with torch.no_grad():
                    max_next_q = target_network(next_states).max(1)[0]
                    target_q = rewards + gamma * max_next_q * (1 - dones)

                # 更新
                loss = nn.MSELoss()(current_q, target_q)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

            if done:
                break

        epsilon = max(epsilon_end, epsilon * epsilon_decay)

        # 更新目标网络
        if (ep + 1) % target_update == 0:
            target_network.load_state_dict(q_network.state_dict())

        if (ep + 1) % 50 == 0:
            print(f"Episode {ep+1} | Reward: {total_reward:.1f} | "
                  f"Epsilon: {epsilon:.3f}")

    return q_network`,
                },
            ],
            table: {
                headers: ["组件", "作用", "解决的问题"],
                rows: [
                    ["经验回放", "随机采样历史经验", "打破样本相关性，提高数据效率"],
                    ["目标网络", "独立网络计算 TD 目标", "稳定训练目标，防止移动靶问题"],
                    ["卷积编码器", "像素→低维特征", "处理高维图像输入"],
                    ["梯度裁剪", "限制梯度最大范数", "防止梯度爆炸"],
                    ["Huber Loss", "鲁棒的损失函数", "减少异常 TD 误差的影响"],
                ],
            },
        },
        {
            title: "6. Policy Gradient：直接优化策略",
            body: `Q-Learning 和 DQN 属于"基于价值"的方法：先学习 Q 函数，再从中提取策略。Policy Gradient 方法则直接优化策略本身——用一个参数化的策略网络 pi(a|s; theta)，通过梯度上升来最大化期望累积奖励。

REINFORCE 算法是最基本的 Policy Gradient 方法。它的核心思想是：对于一条轨迹 (s_0, a_0, r_1, s_1, a_1, ..., s_T)，策略梯度为 ∇_theta J(theta) ≈ Σ_t G_t · ∇_theta log pi(a_t|s_t; theta)。直觉上，如果某个动作带来了高回报 G_t，就增加这个动作的概率；如果带来了低回报，就减少这个动作的概率。

基于价值的方法和基于策略的方法各有优势。基于价值的方法（如 DQN）数据效率高，但只能处理离散动作，且学习到的策略是确定性的。基于策略的方法（如 REINFORCE）可以处理连续动作，学习随机策略（天然支持探索），但方差较大、收敛慢。

Actor-Critic 方法结合了两种思路：用 Actor（策略网络）选择动作，用 Critic（价值网络）评估动作的好坏。Critic 提供的优势函数 A(s, a) = Q(s, a) - V(s) 替代了 REINFORCE 中的 G_t，大幅降低了梯度估计的方差，使得训练更加稳定。`,
            mermaid: `graph TD
    A["基于价值的方法"] --> B["学习 Q(s,a)"]
    B --> C["策略: pi = argmax Q"]
    B --> D["优点: 数据效率高"]
    B --> E["缺点: 仅离散动作"]

    F["基于策略的方法"] --> G["直接优化 pi(a|s)"]
    G --> H["优点: 连续动作, 随机策略"]
    G --> I["缺点: 高方差, 收敛慢"]

    J["Actor-Critic"] --> K["Actor: 策略网络"]
    J --> L["Critic: 价值网络"]
    K --> M["结合两者优点"]
    L --> M
    class J s2
    class F s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#581c87
    classDef s2 fill:#14532d`,
            code: [
                {
                    lang: "python",
                    code: `# REINFORCE 算法实现

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class PolicyNetwork(nn.Module):
    """策略网络：输出动作的概率分布"""
    def __init__(self, state_dim, action_dim, hidden_dim=64):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim)
        )

    def forward(self, x):
        logits = self.network(x)
        return F.softmax(logits, dim=-1)

    def select_action(self, state):
        """根据策略采样动作，同时返回 log_prob 用于训练"""
        state = torch.FloatTensor(state)
        probs = self.forward(state)
        dist = torch.distributions.Categorical(probs)
        action = dist.sample()
        return action.item(), dist.log_prob(action)


def reinforce_train(env, episodes=500, lr=1e-2, gamma=0.99):
    """REINFORCE 训练循环"""
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.n
    policy = PolicyNetwork(state_dim, action_dim)
    optimizer = torch.optim.Adam(policy.parameters(), lr=lr)

    for ep in range(episodes):
        state, _ = env.reset()
        log_probs, rewards = [], []
        total_reward = 0

        while True:
            action, log_prob = policy.select_action(state)
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated

            log_probs.append(log_prob)
            rewards.append(reward)
            total_reward += reward
            state = next_state

            if done:
                break

        # 计算折扣回报
        returns = []
        G = 0
        for r in reversed(rewards):
            G = r + gamma * G
            returns.insert(0, G)
        returns = torch.tensor(returns)

        # 标准化回报（降低方差）
        returns = (returns - returns.mean()) / (returns.std() + 1e-8)

        # 策略梯度更新
        policy_loss = torch.stack([
            -lp * ret for lp, ret in zip(log_probs, returns)
        ]).sum()

        optimizer.zero_grad()
        policy_loss.backward()
        optimizer.step()

        if (ep + 1) % 50 == 0:
            print(f"Episode {ep+1} | Reward: {total_reward:.1f}")

    return policy`,
                },
            ],
        },
        {
            title: "7. PPO：Clip 机制与优势函数",
            body: `PPO（Proximal Policy Optimization）是 **OpenAI** 在 2017 年提出的强化学习算法，目前已成为 RL 领域最广泛使用的算法之一。它的核心贡献是提出了一种简单而有效的策略更新约束机制，使得训练既稳定又高效。

在 Policy Gradient 方法中，一个关键问题是：如果策略更新步长太大，可能导致策略急剧变化，使得之前收集的数据不再有效，训练崩溃。传统的 TRPO（Trust Region Policy Optimization）用 KL 散度约束来保证每次更新不会偏离旧策略太远，但实现复杂、计算量大。

PPO 的核心创新是 Clip 机制：用 ratio = pi_new(a|s) / pi_old(a|s) 表示新旧策略的概率比，然后通过 clip(ratio, 1-epsilon, 1+epsilon) 将 ratio 限制在 [1-epsilon, 1+epsilon] 范围内。当 ratio 超过这个范围时，梯度被截断，防止策略大幅偏离。这个简单的技巧在保证训练稳定性的同时，极大地简化了实现。

PPO 的另一关键技术是 Generalized Advantage Estimation（GAE），它在偏差和方差之间提供了一个可调的平衡。GAE 用 lambda 参数控制对 TD 误差的加权程度：lambda 接近 0 时偏向低方差（使用 Critic 估计），lambda 接近 1 时偏向低偏差（使用实际回报）。通常 lambda=0.95 是一个良好的默认值。

PPO-Clip 的完整目标函数为：L^CLIP(theta) = E[min(ratio · A, clip(ratio) · A)]，其中 A 是优势函数。这个目标函数同时考虑了未裁剪和裁剪的梯度，确保更新既有效又安全。`,
            mermaid: `graph TD
    A["收集轨迹 使用旧策略 pi_old"] --> B["计算优势函数 A(s,a)"]
    B --> C["计算概率比 ratio = pi_new / pi_old"]
    C --> D["Clip ratio 到 [1-e, 1+e]"]
    D --> E["L = min(ratio*A, clip*A)"]
    E --> F["梯度上升更新策略"]
    F --> G{"KL 散度过大?"}
    G -->|是| H["减小更新步长"]
    G -->|否| I["继续下一轮"]
    H --> F
    class F s2
    class D s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12
    classDef s2 fill:#14532d`,
            code: [
                {
                    lang: "python",
                    code: `# PPO 核心组件

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class ActorCritic(nn.Module):
    """PPO 的 Actor-Critic 网络"""
    def __init__(self, state_dim, action_dim, hidden_dim=128):
        super().__init__()
        self.shared = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )
        # Actor：策略输出
        self.actor = nn.Linear(hidden_dim, action_dim)
        # Critic：状态值估计
        self.critic = nn.Linear(hidden_dim, 1)

    def forward(self, state):
        features = self.shared(state)
        action_probs = F.softmax(self.actor(features), dim=-1)
        state_value = self.critic(features)
        return action_probs, state_value

    def evaluate(self, state, action):
        """评估动作的对数概率和状态值"""
        action_probs, state_value = self.forward(state)
        dist = torch.distributions.Categorical(action_probs)
        log_prob = dist.log_prob(action)
        entropy = dist.entropy()
        return log_prob, state_value, entropy


def compute_gae(rewards, values, dones, gamma=0.99, lam=0.95):
    """广义优势估计（GAE）"""
    advantages = []
    gae = 0
    for t in reversed(range(len(rewards))):
        # TD 误差: delta = r + gamma*V(s')*not_done - V(s)
        next_value = 0.0 if t == len(rewards) - 1 else values[t + 1]
        next_value *= (1 - dones[t])
        delta = rewards[t] + gamma * next_value - values[t]
        gae = delta + gamma * lam * (1 - dones[t]) * gae
        advantages.insert(0, gae)

    advantages = torch.tensor(advantages)
    returns = advantages + torch.tensor(values)
    return advantages, returns`,
                },
                {
                    lang: "python",
                    code: `# PPO 更新步骤

def ppo_update(policy, states, actions, old_log_probs, advantages, returns,
               clip_epsilon=0.2, vf_coeff=0.5, ent_coeff=0.01,
               epochs=4, batch_size=64):
    """PPO 多轮更新：在收集的数据上做多个 epoch 的 SGD"""
    optimizer = torch.optim.Adam(policy.parameters(), lr=3e-4)
    n = len(states)

    for epoch in range(epochs):
        # 随机打乱
        indices = torch.randperm(n)
        for start in range(0, n, batch_size):
            end = start + batch_size
            batch_idx = indices[start:end]

            b_states = states[batch_idx]
            b_actions = actions[batch_idx]
            b_old_log_probs = old_log_probs[batch_idx]
            b_advantages = advantages[batch_idx]
            b_returns = returns[batch_idx]

            # 评估当前策略
            log_probs, state_values, entropy = policy.evaluate(
                b_states, b_actions)

            # 概率比
            ratio = torch.exp(log_probs - b_old_log_probs)

            # Clip 目标
            surr1 = ratio * b_advantages
            surr2 = torch.clamp(ratio, 1 - clip_epsilon, 1 + clip_epsilon) * b_advantages
            actor_loss = -torch.min(surr1, surr2).mean()

            # Critic 损失
            critic_loss = F.mse_loss(state_values.squeeze(), b_returns)

            # 熵正则化（鼓励探索）
            entropy_loss = -entropy.mean() * ent_coeff

            # 总损失
            loss = actor_loss + vf_coeff * critic_loss + entropy_loss

            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(policy.parameters(), 0.5)
            optimizer.step()`,
                },
            ],
            table: {
                headers: ["PPO 超参数", "默认值", "含义", "调整建议"],
                rows: [
                    ["clip_epsilon", "0.2", "策略更新的 Clip 范围", "0.1-0.3，小数据集用小值"],
                    ["gamma", "0.99", "折扣因子", "长任务接近 1，短任务可减小"],
                    ["GAE lambda", "0.95", "偏差-方差平衡参数", "0.9-0.99，高方差时减小"],
                    ["学习率", "3e-4", "Adam 优化器学习率", "2e-4 到 5e-4"],
                    ["Epochs", "4", "每批数据的更新轮数", "3-10，过多会导致过拟合旧数据"],
                    ["Batch Size", "64", "每次更新的样本数", "32-256，根据内存调整"],
                ],
            },
            tip: "PPO 是最容易调参的 RL 算法之一。如果训练不稳定，首先检查：学习率是否太大（降到 1e-4）、Clip epsilon 是否太大（降到 0.1）、GAE lambda 是否太大（降到 0.9）。",
        },
        {
            title: "8. 算法对比与选择指南",
            body: `强化学习领域有数十种算法，选择适合的算法是实践中的关键决策。以下对比表格和决策树帮助你做出合理选择。

Q-Learning 是最简单的起点，适合状态空间小的离散环境。当状态空间变大时，DQN 是自然的选择，它用神经网络处理高维状态输入。但如果环境有连续动作空间（如机器人控制），DQN 不再适用，需要转向 Policy Gradient 方法。

PPO 是目前最通用的算法选择：它支持连续和离散动作空间、训练稳定、实现相对简单。对于大多数实际问题，PPO 都是不错的起点。如果数据效率是关键考量（如真实机器人训练，每次交互成本很高），则应考虑 SAC（Soft Actor-Critic）等样本高效的算法。

对于大语言模型的对齐训练，**RLHF**（Reinforcement Learning from Human Feedback）使用的是 PPO 的变体。它的核心思想是：先用人类标注数据训练一个奖励模型（Reward Model），然后用 PPO 优化语言模型的策略，使其生成被奖励模型评为高质量的回复。`,
            table: {
                headers: ["算法", "类型", "动作空间", "样本效率", "稳定性", "适用场景"],
                rows: [
                    ["Q-Learning", "基于价值", "离散", "中", "高", "小状态空间离散环境"],
                    ["DQN", "基于价值", "离散", "中", "中", "高维离散环境（如 Atari）"],
                    ["REINFORCE", "基于策略", "连续/离散", "低", "低", "简单策略梯度基线"],
                    ["Actor-Critic", "混合", "连续/离散", "中", "中", "通用场景"],
                    ["PPO", "混合", "连续/离散", "中", "高", "大多数场景的默认选择"],
                    ["SAC", "混合", "连续", "高", "高", "机器人控制，需高样本效率"],
                ],
            },
            mermaid: `graph TD
    A["选择 RL 算法"] --> B{"动作空间类型"}
    B -->|"离散"| C{"状态空间大小"}
    B -->|"连续"| D["PPO 或 SAC"]

    C -->|"小 (表格可行)"| E["Q-Learning"]
    C -->|"大 (图像等)"| F["DQN 或 PPO"]

    D --> G{"样本效率要求"}
    G -->|"高"| H["SAC 样本高效"]
    G -->|"中/低"| I["PPO 通用稳定"]

    F --> J{"需要稳定性"}
    J -->|"是"| K["PPO"]
    J -->|"否"| L["DQN"]
    class K s3
    class H s2
    class E s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12
    classDef s3 fill:#14532d`,
        },
        {
            title: "9. Python 实战：CartPole 完整实现",
            body: `CartPole 是强化学习最经典的入门环境。场景是一个小车在水平轨道上运动，车上倒立着一根杆子。智能体的目标是通过左右推动小车，使杆子保持直立不倒。状态空间是 4 维连续向量（小车位置、速度、杆子角度、角速度），动作空间是 2 个离散动作（左推、右推）。每保持杆子直立一步获得 +1 奖励，episode 在杆子倾斜超过 12 度或小车移出屏幕时结束。

下面我们用 PPO 算法完整实现 CartPole 的训练。这个实现包含了 PPO 的所有核心组件：Actor-Critic 网络、GAE、多轮更新、以及训练过程中的可视化。`,
            code: [
                {
                    lang: "python",
                    code: `import gymnasium as gym
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from collections import namedtuple

# 定义经验存储结构
Transition = namedtuple('Transition',
    ['state', 'action', 'log_prob', 'reward', 'value', 'done'])

class ActorCritic(nn.Module):
    def __init__(self, state_dim=4, action_dim=2, hidden=64):
        super().__init__()
        self.backbone = nn.Sequential(
            nn.Linear(state_dim, hidden),
            nn.Tanh(),
            nn.Linear(hidden, hidden),
            nn.Tanh(),
        )
        self.actor = nn.Linear(hidden, action_dim)
        self.critic = nn.Linear(hidden, 1)

    def forward(self, x):
        h = self.backbone(x)
        return F.softmax(self.actor(h), dim=-1), self.critic(h)

    def act(self, state):
        state = torch.FloatTensor(state)
        probs, value = self.forward(state)
        dist = torch.distributions.Categorical(probs)
        action = dist.sample()
        return action.item(), dist.log_prob(action), value.item()


def ppo_cartpole(episodes=500, gamma=0.99, lam=0.95,
                 clip_eps=0.2, lr=3e-4, epochs=4, batch=32):
    """用 PPO 训练 CartPole"""
    env = gym.make("CartPole-v1")
    policy = ActorCritic()
    optimizer = torch.optim.Adam(policy.parameters(), lr=lr)
    episode_rewards = []

    for ep in range(episodes):
        state, _ = env.reset()
        transitions = []
        total_reward = 0

        # 收集一集数据
        while True:
            action, log_prob, value = policy.act(state)
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            transitions.append(Transition(
                state, action, log_prob, reward, value, float(done)
            ))
            total_reward += reward
            state = next_state
            if done:
                break

        episode_rewards.append(total_reward)

        # 计算 GAE
        rewards = [t.reward for t in transitions]
        values = [t.value for t in transitions]
        dones = [t.done for t in transitions]

        advantages, returns = compute_gae(rewards, values, dones, gamma, lam)

        # 转换为 Tensor
        states = torch.FloatTensor([t.state for t in transitions])
        actions = torch.LongTensor([t.action for t in transitions])
        old_log_probs = torch.stack([t.log_prob for t in transitions])

        # PPO 多轮更新
        for _ in range(epochs):
            log_probs, state_values, _ = policy.evaluate(states, actions)
            ratio = torch.exp(log_probs - old_log_probs)
            surr1 = ratio * advantages
            surr2 = torch.clamp(ratio, 1-clip_eps, 1+clip_eps) * advantages
            actor_loss = -torch.min(surr1, surr2).mean()
            critic_loss = F.mse_loss(state_values.squeeze(), returns)
            loss = actor_loss + 0.5 * critic_loss

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        if (ep + 1) % 50 == 0:
            avg = np.mean(episode_rewards[-50:])
            print(f"Episode {ep+1} | Avg Reward: {avg:.1f} | "
                  f"Last: {total_reward}")

    return policy, episode_rewards

# 辅助函数（需要在 ActorCritic 中添加 evaluate 方法）
print("完整代码包含 GAE 计算和 evaluate 方法，见上方 PPO 章节")
print("在本地运行需要安装: pip install gymnasium torch numpy")`,
                },
            ],
            warning: "CartPole-v1 的最大奖励是 500。如果你的训练能达到平均 450+ 以上，说明策略已经非常接近最优。如果长期在 50-100 之间停滞，检查学习率是否太大或 GAE 参数是否设置不当。",
        },
        {
            title: "10. 强化学习在 LLM 中的应用：RLHF",
            body: `**RLHF**（Reinforcement Learning from Human Feedback）是 ChatGPT 成功的关键技术之一，它将强化学习的理念应用到了大语言模型的对齐训练上。

传统的大语言模型训练是无监督的：通过预测下一个 token 来学习语言模式。这种训练产生的模型能生成流畅的文本，但不一定符合人类的偏好——它可能会生成有害的、不诚实的或不有帮助的内容。**RLHF** 通过引入人类反馈，让模型学会生成"人类希望看到"的回复。

RLHF 分为三个阶段：第一阶段，用监督微调（**SFT**）让模型学会遵循指令的基本格式；第二阶段，收集人类对不同回复的偏好排序数据，训练一个奖励模型（Reward Model），这个模型可以像"裁判"一样给任何回复打分；第三阶段，用 PPO 算法优化语言模型，使其生成的回复在奖励模型上获得高分。

RLHF 的核心挑战在于奖励黑客（Reward Hacking）：模型可能学会生成"看起来好但实际上没有用"的回复来骗取奖励模型的分数。解决方法包括：KL 散度惩罚（限制模型偏离原始 **SFT** 模型太远）、多个奖励模型的集成、以及人工审核。

RLHF 的成功证明了强化学习不仅能用于游戏和机器人控制，还能用于优化语言模型的输出质量。这也解释了为什么学习 PPO 等 RL 算法对理解现代 AI 系统至关重要。`,
            mermaid: `graph TD
    A["预训练语言模型"] --> B["SFT 监督微调"]
    B --> C["SFT 模型"]
    C --> D["收集人类偏好数据"]
    D --> E["训练奖励模型"]
    E --> F["奖励模型"]
    C --> G["PPO 优化"]
    F -->|"打分"| G
    G -->|"KL 惩罚: 防止偏离 SFT"| C
    G --> H["RLHF 对齐模型"]
    class H s3
    class F s2
    class C s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12
    classDef s3 fill:#881337`,
            tip: "理解 RLHF 不需要先精通所有 RL 算法，但掌握 PPO 的工作原理是关键。PPO 的 Clip 机制确保了语言模型在优化过程中不会偏离原始模型太远，这是防止生成质量崩溃的安全机制。",
        },
    ],
};
