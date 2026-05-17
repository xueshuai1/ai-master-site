import { Article } from '../knowledge';

export const article: Article = {
    id: "rl-004",
    title: "Deep Q-Network DQN",
    category: "rl",
    tags: ["DQN", "深度强化学习", "Atari"],
    summary: "从 Q-Learning 到 DQN，理解深度强化学习的突破性进展",
    date: "2026-04-12",
    readTime: "20 min",
    level: "进阶",
    content: [
        {
            title: "1. Q-Learning 的局限与连续状态困境",
            body: `Q-Learning 是强化学习中最经典的无模型算法，它通过迭代更新 Q 值表来学习最优策略。然而 Q 值表方法有一个致命的假设：状态空间和动作空间都是离散且有限的。当状态是连续向量时，比如机器人的关节角度或自动驾驶的传感器读数，我们无法为每个可能的状态维护一个 Q 值。

最直接的状态离散化方案面临维度灾难：每个维度分成 10 个区间，10 个维度就是 10^10 个状态，远超内存和计算能力。另一种方案是使用线性函数近似 Q(s,a) = w^T * phi(s,a)，但线性模型的表达能力有限，无法捕获复杂的非线性状态-动作关系。这正是 DQN 出现的核心动机：用深度神经网络作为 Q 函数的非线性函数近似器。`,
            code: [
                {
                    lang: "python",
                    code: `# Q-Learning 的表格方法与维度灾难

import numpy as np

class TableQLearning:
    def __init__(self, n_states, n_actions, alpha=0.1, gamma=0.99, epsilon=0.1):
        self.Q = np.zeros((n_states, n_actions))
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon

    def choose_action(self, state):
        if np.random.random() < self.epsilon:
            return np.random.randint(self.Q.shape[1])
        return np.argmax(self.Q[state])

    def update(self, s, a, r, s_next, done):
        target = r if done else r + self.gamma * np.max(self.Q[s_next])
        self.Q[s, a] += self.alpha * (target - self.Q[s, a])

# 维度灾难演示：4 维状态，每维离散化为 20 个区间
dims = [20, 20, 20, 20]
n_states = np.prod(dims)
print(f"离散化后状态数: {n_states:,}")  # 160,000

# 如果是 8 维状态呢？
dims_8d = [20] * 8
print(f"8维离散化状态数: {np.prod(dims_8d):,}")  # 25,600,000,000`
                },
                {
                    lang: "python",
                    code: `# 线性函数近似 Q-Learning

class LinearQLearning:
    def __init__(self, n_features, n_actions, alpha=0.01, gamma=0.99):
        self.W = np.zeros((n_features, n_actions))
        self.alpha = alpha
        self.gamma = gamma

    def extract_features(self, state):
        return np.concatenate([state, state**2, np.sin(state)])

    def get_q_values(self, state):
        phi = self.extract_features(state)
        return phi @ self.W

    def choose_action(self, state, epsilon=0.1):
        if np.random.random() < epsilon:
            return np.random.randint(self.W.shape[1])
        return np.argmax(self.get_q_values(state))

    def update(self, state, action, reward, next_state, done):
        phi = self.extract_features(state)
        q_values = self.get_q_values(state)
        if done:
            target = reward
        else:
            next_q = np.max(self.get_q_values(next_state))
            target = reward + self.gamma * next_q
        td_error = target - q_values[action]
        self.W[:, action] += self.alpha * td_error * phi

# 线性模型的局限
agent = LinearQLearning(n_features=12, n_actions=4)
state = np.array([0.5, -0.3, 0.1, 0.2])
print(f"Q 值: {agent.get_q_values(state)}")
print("线性模型无法拟合复杂的 Q 函数曲面")`
                }
            ],
            table: {
                headers: ["方法", "状态表示", "参数数量", "表达能力", "适用场景"],
                rows: [
                    ["表格 Q-Learning", "离散索引", "S * A", "精确但有限", "小型离散环境"],
                    ["线性近似", "手工特征", "n_features * A", "线性可分", "特征工程好的场景"],
                    ["多项式近似", "多项式特征", "随阶数爆炸", "低阶非线性", "简单非线性问题"],
                    ["神经网络近似", "原始输入", "网络权重数", "强非线性", "图像、高维连续状态"],
                    ["核方法", "原始输入", "样本数", "无限维映射", "小到中等数据集"],
                ]
            },
            mermaid: `graph TD
    A["Q-Learning"] --> B{"状态离散还是连续？"}
    B -->|离散小空间| C["表格 Q 值"]
    B -->|连续/高维| D["需要函数近似"]
    D --> E["线性近似"]
    D --> F["非线性近似"]
    E --> G["表达能力有限"]
    F --> H["神经网络 = DQN"]
    H --> I["端到端学习"]
    class I s2
    class H s1
    class C s0
    classDef s0 fill:#14532d
    classDef s1 fill:#7c2d12
    classDef s2 fill:#0c4a6e`,
            tip: "理解 DQN 的关键：它不是发明了新算法，而是用神经网络替换了 Q 值表。核心创新在于解决了神经网络与 Q-Learning 结合时的稳定性问题。",
            warning: "直接上神经网络替换 Q 值表会发散！原因是 Q 值的自举更新与神经网络的非线性拟合相互放大误差，导致训练不稳定。DQN 的两大技术正是为了解决这个问题。"
        },
        {
            title: "2. DQN 架构：CNN + Q 网络的端到端学习",
            body: `DeepMind 在 2013 年和 2015 年的两篇论文中提出了 DQN，这是第一个直接从像素输入学习控制策略的强化学习算法。DQN 的核心架构是一个卷积神经网络，它以 Atari 游戏的原始像素帧作为输入，输出每个可能动作的 Q 值。

网络结构设计为三层卷积层加两层全连接层。输入是 4 帧 84x84 的灰度图像堆叠（捕获时间信息），经过卷积层提取空间特征，最终输出一个大小为动作数目的向量，每个元素对应一个动作的 Q 值估计。这种架构的精妙之处在于：从原始像素到动作选择完全端到端学习，不需要任何手工特征工程。`,
            code: [
                {
                    lang: "python",
                    code: `# DQN 网络架构（PyTorch 风格）

import numpy as np

class DQN:
    def __init__(self, input_shape=(4, 84, 84), n_actions=18):
        # 第一层卷积：32个8x8卷积核，步长4
        self.conv1_out_channels = 32
        self.conv1_kernel = 8
        self.conv1_stride = 4
        # 84 -> (84 - 8) / 4 + 1 = 20
        self.conv1_out_h = 20

        # 第二层卷积：64个4x4卷积核，步长2
        self.conv2_out_channels = 64
        self.conv2_kernel = 4
        self.conv2_stride = 2
        # 20 -> (20 - 4) / 2 + 1 = 9
        self.conv2_out_h = 9

        # 第三层卷积：64个3x3卷积核，步长1
        self.conv3_out_channels = 64
        self.conv3_kernel = 3
        self.conv3_stride = 1
        # 9 -> (9 - 3) / 1 + 1 = 7
        self.conv3_out_h = 7

        # 全连接层
        fc_input_size = self.conv3_out_channels * self.conv3_out_h * self.conv3_out_h
        self.fc_hidden_size = 512
        self.n_actions = n_actions

        # 初始化权重
        self._init_weights(fc_input_size)
        print(f"FC 输入维度: {fc_input_size}")
        print(f"FC 输出维度: {n_actions}")

    def _init_weights(self, fc_input_size):
        scale_conv = np.sqrt(2.0 / (self.conv1_kernel**2 * input_shape[0]))
        self.conv1 = np.random.randn(
            self.conv1_out_channels, input_shape[0],
            self.conv1_kernel, self.conv1_kernel
        ) * scale_conv
        self.fc1 = np.random.randn(fc_input_size, self.fc_hidden_size) * 0.01
        self.fc2 = np.random.randn(self.fc_hidden_size, self.n_actions) * 0.01`
                },
                {
                    lang: "python",
                    code: `# 前向传播模拟（简化版）

import numpy as np

class SimplifiedDQN:
    def __init__(self, n_features=4, n_actions=2, hidden_size=128):
        self.W1 = np.random.randn(n_features, hidden_size) * np.sqrt(2.0 / n_features)
        self.b1 = np.zeros(hidden_size)
        self.W2 = np.random.randn(hidden_size, hidden_size) * np.sqrt(2.0 / hidden_size)
        self.b2 = np.zeros(hidden_size)
        self.W3 = np.random.randn(hidden_size, n_actions) * 0.01
        self.b3 = np.zeros(n_actions)

    def forward(self, state):
        h1 = np.maximum(0, state @ self.W1 + self.b1)  # ReLU
        h2 = np.maximum(0, h1 @ self.W2 + self.b2)     # ReLU
        q_values = h2 @ self.W3 + self.b3               # 线性输出
        return q_values

    def choose_action(self, state, epsilon=0.05):
        if np.random.random() < epsilon:
            return np.random.randint(self.W3.shape[1])
        q_values = self.forward(state)
        return np.argmax(q_values)

# CartPole 输入：4 维连续状态 -> 2 个动作 Q 值
dqn = SimplifiedDQN(n_features=4, n_actions=2)
state = np.array([0.1, -0.2, 0.05, 0.15])
q_values = dqn.forward(state)
print(f"Q 值: {q_values}")
print(f"选择动作: {np.argmax(q_values)}")`
                }
            ],
            table: {
                headers: ["网络层", "操作", "输入形状", "输出形状", "激活函数"],
                rows: [
                    ["Conv1", "32 个 8x8, stride=4", "(4,84,84)", "(32,20,20)", "ReLU"],
                    ["Conv2", "64 个 4x4, stride=2", "(32,20,20)", "(64,9,9)", "ReLU"],
                    ["Conv3", "64 个 3x3, stride=1", "(64,9,9)", "(64,7,7)", "ReLU"],
                    ["FC1", "全连接", "3136", "512", "ReLU"],
                    ["FC2", "全连接", "512", "n_actions", "线性"],
                ]
            },
            mermaid: `graph LR
    A["4帧原始像素"] --> B["84x84 预处理"]
    B --> C["Conv1: 32@8x8,s=4"]
    C --> D["Conv2: 64@4x4,s=2"]
    D --> E["Conv3: 64@3x3,s=1"]
    E --> F["展平 3136 维"]
    F --> G["FC1: 512 ReLU"]
    G --> H["FC2: n_actions 线性"]
    H --> I["Q(s, a1)...Q(s, an)"]
    class I s1
    class A s0
    classDef s0 fill:#7f1d1d
    classDef s1 fill:#14532d`,
            tip: "DQN 输出所有动作的 Q 值而不是单个 Q(s,a)。这样一次前向传播就能评估所有动作，大幅提高效率。",
            warning: "原始 Atari 游戏的帧率是 60fps，DQN 每 4 帧执行一次动作（frame skip=4）。这既加速训练也保持了时序信息的连贯性。"
        },
        {
            title: "3. 经验回放：打破数据相关性的关键",
            body: `Q-Learning 使用自举更新时，连续的样本之间存在强烈的时间相关性。今天采样的数据与昨天高度相关，用这些相关数据训练神经网络会导致梯度更新方向不稳定，类似于用同一批数据反复训练监督学习模型会严重过拟合。

经验回放通过一个巨大的回放缓冲区来解决这个问题。智能体与环境交互产生的每条经验 (s, a, r, s_next, done) 都存入缓冲区。训练时从缓冲区中随机采样一个小批量（mini-batch），随机采样打破了时间相关性，使数据近似独立同分布，满足神经网络训练的统计假设。此外，经验回放还提高了样本效率，每条经验可以被多次使用。`,
            code: [
                {
                    lang: "python",
                    code: `# 经验回放缓冲区

import numpy as np
from collections import deque
import random

class ReplayBuffer:
    def __init__(self, capacity=100000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size=32):
        batch = random.sample(self.buffer, batch_size)
        states = np.array([t[0] for t in batch], dtype=np.float32)
        actions = np.array([t[1] for t in batch], dtype=np.int64)
        rewards = np.array([t[2] for t in batch], dtype=np.float32)
        next_states = np.array([t[3] for t in batch], dtype=np.float32)
        dones = np.array([t[4] for t in batch], dtype=np.float32)
        return states, actions, rewards, next_states, dones

    def __len__(self):
        return len(self.buffer)

# 使用示例
buffer = ReplayBuffer(capacity=50000)
for i in range(1000):
    s = np.random.randn(4)
    a = np.random.randint(2)
    r = np.random.randn()
    s_next = np.random.randn(4)
    done = np.random.random() < 0.02
    buffer.push(s, a, r, s_next, done)

print(f"缓冲区大小: {len(buffer)}")
states, actions, rewards, next_states, dones = buffer.sample(batch_size=32)
print(f"采样 batch 形状: states={states.shape}, rewards={rewards.shape}")`
                },
                {
                    lang: "python",
                    code: `# DQN 训练循环：经验回放 + 梯度下降

class DQNTrainer:
    def __init__(self, n_features, n_actions, lr=0.001, gamma=0.99,
                 buffer_capacity=100000, batch_size=32, learn_start=1000):
        self.gamma = gamma
        self.batch_size = batch_size
        self.learn_start = learn_start
        self.buffer = ReplayBuffer(capacity=buffer_capacity)
        self.q_network = SimplifiedDQN(n_features, n_actions)
        self.optimizer_lr = lr

    def compute_td_targets(self, states, actions, rewards, next_states, dones):
        next_q = self.q_network.forward(next_states)  # 简化：应该用目标网络
        max_next_q = np.max(next_q, axis=1)
        targets = rewards + self.gamma * max_next_q * (1 - dones)
        return targets

    def train_step(self):
        if len(self.buffer) < self.learn_start:
            return None
        states, actions, rewards, next_states, dones = self.buffer.sample(self.batch_size)
        targets = self.compute_td_targets(states, actions, rewards, next_states, dones)
        # 模拟梯度更新
        current_q = self.q_network.forward(states)
        q_predicted = current_q[np.arange(self.batch_size), actions]
        td_error = targets - q_predicted
        return {
            "mean_td_error": np.mean(np.abs(td_error)),
            "max_td_error": np.max(np.abs(td_error)),
            "mean_q": np.mean(q_predicted),
        }

trainer = DQNTrainer(n_features=4, n_actions=2)
for _ in range(1000):
    trainer.buffer.push(np.random.randn(4), np.random.randint(2),
                        np.random.randn(), np.random.randn(4), False)
result = trainer.train_step()
print(f"TD 误差: mean={result['mean_td_error']:.3f}, max={result['max_td_error']:.3f}")`
                }
            ],
            table: {
                headers: ["缓冲区参数", "典型值", "影响", "权衡"],
                rows: [
                    ["容量", "10万-100万", "越大历史经验越多", "内存消耗增大"],
                    ["Batch size", "32-256", "越大梯度估计越稳定", "计算开销增大"],
                    ["开始学习步数", "1000-50000", "填满缓冲区后再学", "前期浪费样本"],
                    ["采样策略", "均匀随机", "打破时间相关性", "可能采样到无用经验"],
                    ["优先级", "PER（优先经验回放）", "优先采样高 TD 误差", "额外计算开销"],
                ]
            },
            mermaid: `graph TD
    A["环境交互"] --> B["经验 (s,a,r,s',done)"]
    B --> C["存入回放缓冲区"]
    C --> D{"缓冲区够大？"}
    D -->|否| A
    D -->|是| E["随机采样 mini-batch"]
    E --> F["计算 TD 目标"]
    F --> G["梯度下降更新 Q 网络"]
    G --> A
    class E s1
    class C s0
    classDef s0 fill:#14532d
    classDef s1 fill:#7c2d12`,
            tip: "经验回放容量不必设置过大。对于简单环境如 CartPole，50000 容量已经足够。Atari 游戏建议 100 万以上。",
            warning: "开始学习前必须让缓冲区积累足够多的经验。如果缓冲区太小就开始训练，会导致采样到高度相关的数据，违背了经验回放的初衷。"
        },
        {
            title: "4. 目标网络：稳定训练的定海神针",
            body: `即使有了经验回放，DQN 训练仍然可能不稳定。根本原因在于 Q 值更新中的自举：我们用 Q(s_next, a_next) 来构建 TD 目标，而 Q 网络本身在不断更新。这相当于移动的目标，导致训练像追逐一个不断跑动的靶子。

目标网络（Target Network）的解决方案非常优雅：创建一个与 Q 网络结构相同但参数独立的目标网络 Q_target，专门用来计算 TD 目标。目标网络的参数每隔 C 步才从 Q 网络复制一次。这意味着在 C 步之内，TD 目标是固定的，梯度下降有了稳定的学习方向。原始论文中 C = 10000 步。`,
            code: [
                {
                    lang: "python",
                    code: `# 目标网络实现

class DQNWithTargetNetwork:
    def __init__(self, n_features, n_actions, target_update_freq=1000):
        self.q_network = SimplifiedDQN(n_features, n_actions)
        self.target_network = SimplifiedDQN(n_features, n_actions)
        # 初始化时同步权重
        self._copy_weights()
        self.target_update_freq = target_update_freq
        self.step_count = 0

    def _copy_weights(self):
        self.target_network.W1 = self.q_network.W1.copy()
        self.target_network.b1 = self.q_network.b1.copy()
        self.target_network.W2 = self.q_network.W2.copy()
        self.target_network.b2 = self.q_network.b2.copy()
        self.target_network.W3 = self.q_network.W3.copy()
        self.target_network.b3 = self.q_network.b3.copy()

    def soft_update(self, tau=0.005):
        for q_w, t_w in [
            (self.q_network.W1, self.target_network.W1),
            (self.q_network.W2, self.target_network.W2),
            (self.q_network.W3, self.target_network.W3),
        ]:
            t_w[:] = tau * q_w + (1 - tau) * t_w

    def compute_targets(self, rewards, next_states, dones, gamma=0.99):
        next_q = self.target_network.forward(next_states)
        max_next_q = np.max(next_q, axis=1)
        return rewards + gamma * max_next_q * (1 - dones)

    def step(self, states, actions, rewards, next_states, dones):
        self.step_count += 1
        targets = self.compute_targets(rewards, next_states, dones)
        current_q = self.q_network.forward(states)
        q_predicted = current_q[np.arange(len(actions)), actions]
        td_error = targets - q_predicted

        if self.step_count % self.target_update_freq == 0:
            self._copy_weights()
            print(f"Step {self.step_count}: 目标网络已更新")

        return td_error`
                },
                {
                    lang: "python",
                    code: `# 硬更新 vs 软更新的对比

def compare_target_update_strategies():
    np.random.seed(42)
    q_weights = np.random.randn(10)
    target_weights_hard = q_weights.copy()
    target_weights_soft = q_weights.copy()
    tau = 0.005

    history_hard = []
    history_soft = []

    for step in range(5000):
        q_weights += np.random.randn(10) * 0.01
        if (step + 1) % 100 == 0:
            target_weights_hard = q_weights.copy()
        target_weights_soft = tau * q_weights + (1 - tau) * target_weights_soft
        history_hard.append(np.linalg.norm(target_weights_hard - q_weights))
        history_soft.append(np.linalg.norm(target_weights_soft - q_weights))

    print(f"硬更新 - 最后同步时误差: {history_hard[99]:.4f}, 同步前误差: {history_hard[199]:.4f}")
    print(f"软更新 - 平均误差: {np.mean(history_soft):.4f}")
    print(f"软更新 - 最大误差: {np.max(history_soft):.4f}")

compare_target_update_strategies()`
                }
            ],
            table: {
                headers: ["更新策略", "公式", "平滑性", "稳定性", "常见参数"],
                rows: [
                    ["硬更新", "theta_target = theta_Q 每 C 步", "不连续跳跃", "中等", "C=10000"],
                    ["软更新", "theta_target = tau*theta_Q + (1-tau)*theta_target", "连续平滑", "高", "tau=0.005"],
                    ["不更新", "theta_target 固定", "完全固定", "低（欠拟合）", "不推荐"],
                    ["逐步更新", "tau 从大到小衰减", "前期快后期稳", "较高", "tau: 0.1->0.001"],
                    ["自适应更新", "基于 TD 误差动态调整", "自动调参", "最高", "复杂"],
                ]
            },
            mermaid: `graph TD
    A["当前 Q 网络"] --> B["前向传播 Q(s,a)"]
    A --> C["每 C 步复制参数"]
    C --> D["目标网络 Q_target"]
    D --> E["计算 TD 目标"]
    E --> B
    F["TD 目标"] --> G["损失: (目标 - Q)^2"]
    G --> H["梯度下降"]
    H --> A
    class D s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12`,
            tip: "软更新（Polyak averaging）通常比硬更新更稳定。tau=0.005 意味着目标网络每次只吸收 Q 网络 0.5% 的新信息，变化非常平滑。",
            warning: "如果不使用目标网络，直接用同一个网络计算 Q 值和 TD 目标，DQN 在大多数 Atari 游戏上都会发散。目标网络不是可选优化，而是 DQN 能工作的必要条件。"
        },
        {
            title: "5. Double DQN：消除 Q 值高估偏差",
            body: `标准 DQN 存在一个系统性问题：Q 值倾向于被高估。这是因为 TD 目标中使用了 max 操作符 max_a Q(s_next, a)，当 Q 值估计存在随机误差时，max 操作倾向于选择误差为正的动作，导致 TD 目标系统性地偏高。这种高估偏差会随着训练逐步累积，最终导致学习次优策略。

Double DQN 巧妙地解耦了动作选择和价值评估。动作选择仍然用当前 Q 网络（选择哪个动作），但价值评估用目标网络（这个动作值多少）。即 TD 目标变为 r + gamma * Q_target(s_next, argmax_a Q(s_next, a))。这个微小的改动显著降低了 Q 值高估，在多数 Atari 游戏上提升了最终性能。`,
            code: [
                {
                    lang: "python",
                    code: `# DQN vs Double DQN 的 TD 目标对比

def dqn_target(reward, next_state, gamma, q_network, target_network, done):
    """标准 DQN: 目标网络选择+评估"""
    if done:
        return reward
    next_q = target_network.forward(next_state)
    return reward + gamma * np.max(next_q)

def double_dqn_target(reward, next_state, gamma, q_network, target_network, done):
    """Double DQN: 当前网络选择, 目标网络评估"""
    if done:
        return reward
    # 当前 Q 网络选择最佳动作
    next_q_current = q_network.forward(next_state)
    best_action = np.argmax(next_q_current)
    # 目标网络评估该动作的价值
    next_q_target = target_network.forward(next_state)
    return reward + gamma * next_q_target[best_action]

# 高估偏差的数值演示
def demonstrate_overestimation():
    np.random.seed(42)
    n_actions = 10
    true_q = np.zeros(n_actions)  # 真实 Q 值全为 0
    n_estimates = 1000
    estimates = np.random.randn(n_estimates, n_actions) * 0.5
    max_values = np.max(estimates, axis=1)
    print(f"真实最大 Q 值: {np.max(true_q):.3f}")
    print(f"估计最大 Q 值的均值: {np.mean(max_values):.3f}")
    print(f"高估偏差: {np.mean(max_values) - np.max(true_q):.3f}")

demonstrate_overestimation()`
                },
                {
                    lang: "python",
                    code: `# Double DQN 训练器完整实现

class DoubleDQNTrainer:
    def __init__(self, n_features, n_actions, lr=0.001, gamma=0.99,
                 target_update_freq=1000, buffer_capacity=100000):
        self.gamma = gamma
        self.target_update_freq = target_update_freq
        self.q_network = SimplifiedDQN(n_features, n_actions)
        self.target_network = SimplifiedDQN(n_features, n_actions)
        self._copy_weights()
        self.buffer = ReplayBuffer(capacity=buffer_capacity)
        self.step_count = 0

    def _copy_weights(self):
        for attr in ["W1", "b1", "W2", "b2", "W3", "b3"]:
            setattr(self.target_network, attr,
                    getattr(self.q_network, attr).copy())

    def train_step(self, batch_size=32):
        if len(self.buffer) < 1000:
            return None
        self.step_count += 1
        states, actions, rewards, next_states, dones = self.buffer.sample(batch_size)
        # Double DQN 核心：解耦选择与评估
        next_q_current = self.q_network.forward(next_states)
        best_actions = np.argmax(next_q_current, axis=1)
        next_q_target = self.target_network.forward(next_states)
        next_q_values = next_q_target[np.arange(batch_size), best_actions]
        targets = rewards + self.gamma * next_q_values * (1 - dones)
        current_q = self.q_network.forward(states)
        q_predicted = current_q[np.arange(batch_size), actions]
        td_error = targets - q_predicted

        if self.step_count % self.target_update_freq == 0:
            self._copy_weights()
        return np.mean(np.abs(td_error))`
                }
            ],
            table: {
                headers: ["算法", "TD 目标公式", "Q 值偏差", "性能影响"],
                rows: [
                    ["DQN", "r + gamma * max_a Q_target(s',a)", "高估", "基准"],
                    ["Double DQN", "r + gamma * Q_target(s', argmax_a Q(s',a))", "降低", "提升 10-50%"],
                    ["Clipped DQN", "r + gamma * clip(Q_target)", "部分降低", "中等提升"],
                    ["Averaged DQN", "r + gamma * mean of N Q-targets", "显著降低", "计算开销大"],
                    ["C51 (分布式)", "r + gamma * 价值分布", "无点估计偏差", "大幅提升"],
                ]
            },
            mermaid: `graph TD
    A["s, a, r, s', done"] --> B["从缓冲区采样"]
    B --> C{"选择 Double DQN？"}
    C -->|标准 DQN| D["max_a Q_target(s', a)"]
    C -->|Double DQN| E["argmax_a Q(s', a)"]
    E --> F["Q_target(s', best_action)"]
    D --> G["TD 目标"]
    F --> G
    G --> H["计算 TD 误差"]
    H --> I["更新 Q 网络"]
    class F s1
    class E s0
    classDef s0 fill:#14532d
    classDef s1 fill:#14532d`,
            tip: "Double DQN 只需修改一行代码就能从标准 DQN 升级。将 TD 目标中的 max Q_target 改为 Q_target(argmax Q) 即可。",
            warning: "Double DQN 并不总是优于标准 DQN。在某些环境中，适度的高估反而有助于探索。建议在具体任务上对比实验。"
        },
        {
            title: "6. Dueling DQN：分离状态价值与动作优势",
            body: `Dueling DQN 的核心洞察是：在许多状态下，动作的选择对最终结果影响很小。比如自动驾驶中前方无车时，微小的转向调整对长期奖励几乎无影响。但在关键状态（比如前方突然出现障碍物）下，动作选择至关重要。

Dueling 架构将 Q 网络分成两个输出头：一个估计状态价值 V(s)，另一个估计每个动作的优势 A(s,a)。最终 Q(s,a) = V(s) + (A(s,a) - mean(A(s)))。减均值操作是为了保证 V(s) 在数学上确实是状态价值（Q 值对动作取平均等于 V(s)）。这种架构让网络能更高效地学习：V(s) 头专注于评估状态本身的价值，A(s,a) 头专注于学习哪些动作比平均水平更好。`,
            code: [
                {
                    lang: "python",
                    code: `# Dueling DQN 网络架构

class DuelingDQN:
    def __init__(self, n_features, n_actions, hidden_size=128):
        # 共享特征提取层
        self.W_shared = np.random.randn(n_features, hidden_size) * np.sqrt(2.0 / n_features)
        self.b_shared = np.zeros(hidden_size)
        # 状态价值头 V(s)
        self.W_value = np.random.randn(hidden_size, 1) * 0.01
        self.b_value = np.zeros(1)
        # 动作优势头 A(s,a)
        self.W_advantage = np.random.randn(hidden_size, n_actions) * 0.01
        self.b_advantage = np.zeros(n_actions)
        self.n_actions = n_actions

    def forward(self, state):
        shared = np.maximum(0, state @ self.W_shared + self.b_shared)
        value = shared @ self.W_value + self.b_value
        advantage = shared @ self.W_advantage + self.b_advantage
        # Q(s,a) = V(s) + (A(s,a) - mean(A(s)))
        q_values = value + (advantage - np.mean(advantage))
        return q_values.squeeze()

    def choose_action(self, state, epsilon=0.05):
        if np.random.random() < epsilon:
            return np.random.randint(self.n_actions)
        q_values = self.forward(state)
        return np.argmax(q_values)

# 对比标准 DQN
dueling = DuelingDQN(n_features=4, n_actions=2)
state = np.array([0.1, -0.2, 0.05, 0.15])
print(f"Dueling Q 值: {dueling.forward(state)}")`
                },
                {
                    lang: "python",
                    code: `# Dueling 架构的优势可视化

def visualize_dueling_decomposition():
    np.random.seed(42)
    dueling = DuelingDQN(n_features=4, n_actions=4, hidden_size=64)
    states = np.array([
        [0.0, 0.0, 0.0, 0.0],    # 中性状态
        [1.0, 0.0, 0.0, 0.0],    # 关键状态
        [-1.0, 0.0, 0.0, 0.0],   # 另一关键状态
    ])

    for i, state in enumerate(states):
        shared = np.maximum(0, state @ dueling.W_shared + dueling.b_shared)
        value = float(shared @ dueling.W_value + dueling.b_value)
        advantage = (shared @ dueling.W_advantage + dueling.b_advantage).squeeze()
        q_values = dueling.forward(state)

        print(f"状态 {i}:")
        print(f"  V(s) = {value:.4f}")
        print(f"  A(s,a) = {advantage}")
        print(f"  Q(s,a) = {q_values}")
        print(f"  动作优势范围: {np.max(advantage) - np.min(advantage):.4f}")
        print()

visualize_dueling_decomposition()`
                }
            ],
            table: {
                headers: ["网络头", "输出", "物理含义", "学习重点"],
                rows: [
                    ["共享特征层", "h(s)", "状态的一般表示", "通用特征提取"],
                    ["价值头 V(s)", "标量", "状态 s 的总体价值", "评估当前状态好坏"],
                    ["优势头 A(s,a)", "n_actions 向量", "每个动作的相对优势", "区分动作的细微差异"],
                    ["Q(s,a)", "n_actions 向量", "V(s) + A(s,a) 归一化", "最终动作选择依据"],
                    ["标准 DQN Q(s,a)", "n_actions 向量", "直接估计", "混合了状态价值和动作优势"],
                ]
            },
            mermaid: `graph TD
    A["状态 s"] --> B["共享特征层 h(s)"]
    B --> C["价值头 V(s)"]
    B --> D["优势头 A(s,a)"]
    C --> E["Q(s,a) = V + A - mean(A)"]
    D --> E
    E --> F["选择 argmax Q(s,a)"]
    G["标准 DQN"] -->|"直接输出 Q(s,a)"| F
    H["Dueling DQN"] --> B
    class H s2
    class D s1
    class C s0
    classDef s0 fill:#14532d
    classDef s1 fill:#7c2d12
    classDef s2 fill:#0c4a6e`,
            tip: "Dueling 架构在动作重要性差异大的环境中效果最好。在 CartPole 这种简单环境中提升不明显，但在 Atari 的复杂场景中提升可达 20%。",
            warning: "减均值操作 Q = V + A - mean(A) 是关键。如果不减均值，网络会有无限多个等价的参数组合（V 加一个常数，A 减同一个常数），导致训练不稳定。"
        },
        {
            title: "7. Gymnasium 实战：从 CartPole 到 Atari",
            body: `Gymnasium（原 OpenAI Gym 的社区维护分支）是强化学习的标准环境库。我们用它来实战训练 DQN 智能体。CartPole 是最简单的入门环境，Atari 系列则提供了完整的像素级视觉输入，是检验 DQN 能力的标准测试。

从 CartPole 到 Atari 的关键区别在于：CartPole 的 4 维状态可以直接输入全连接网络，而 Atari 的 210x160x3 像素帧需要先经过预处理（灰度化、缩放、帧差）再输入卷积网络。Atari 训练通常需要数百万步，需要 GPU 加速。本节提供两套代码：CartPole 快速验证和 Atari 完整训练框架。`,
            code: [
                {
                    lang: "python",
                    code: `# CartPole + DQN 完整训练

import numpy as np
import gymnasium as gym

class CartPoleDQN:
    def __init__(self, n_features=4, n_actions=2, hidden_size=128,
                 lr=0.001, gamma=0.99, buffer_capacity=50000,
                 batch_size=32, target_update_freq=200, learn_start=1000):
        self.gamma = gamma
        self.batch_size = batch_size
        self.target_update_freq = target_update_freq
        self.learn_start = learn_start
        self.epsilon_start = 1.0
        self.epsilon_end = 0.01
        self.epsilon_decay = 0.995
        self.epsilon = self.epsilon_start
        self.step_count = 0

        self.q_network = SimplifiedDQN(n_features, n_actions, hidden_size)
        self.target_network = SimplifiedDQN(n_features, n_actions, hidden_size)
        self._copy_weights()
        self.buffer = ReplayBuffer(capacity=buffer_capacity)

    def _copy_weights(self):
        for attr in ["W1", "b1", "W2", "b2", "W3", "b3"]:
            setattr(self.target_network, attr,
                    getattr(self.q_network, attr).copy())

    def choose_action(self, state):
        if np.random.random() < self.epsilon:
            return np.random.randint(self.q_network.W3.shape[1])
        q = self.q_network.forward(state)
        return np.argmax(q)

    def store(self, s, a, r, s_next, done):
        self.buffer.push(s, a, r, s_next, done)

    def learn(self):
        if len(self.buffer) < self.learn_start:
            return
        self.step_count += 1
        states, actions, rewards, next_states, dones = self.buffer.sample(self.batch_size)
        next_q_target = self.target_network.forward(next_states)
        targets = rewards + self.gamma * np.max(next_q_target, axis=1) * (1 - dones)
        current_q = self.q_network.forward(states)
        td_error = targets - current_q[np.arange(self.batch_size), actions]
        if self.step_count % self.target_update_freq == 0:
            self._copy_weights()
        self.epsilon = max(self.epsilon_end, self.epsilon * self.epsilon_decay)

    def train(self, episodes=500):
        env = gym.make("CartPole-v1")
        history = []
        for ep in range(episodes):
            state, _ = env.reset()
            total = 0
            while True:
                action = self.choose_action(state)
                next_state, reward, term, trunc, _ = env.step(action)
                done = term or trunc
                self.store(state, action, reward, next_state, done)
                self.learn()
                total += reward
                state = next_state
                if done:
                    break
            history.append(total)
            if ep % 50 == 0 and ep > 0:
                avg = np.mean(history[-50:])
                print(f"Ep {ep:4d} | reward={total:4d} | avg_50={avg:6.1f} | eps={self.epsilon:.3f}")
            if np.mean(history[-100:]) >= 195:
                print(f"Solved at episode {ep}!")
                break
        env.close()
        return history`
                },
                {
                    lang: "python",
                    code: `# Atari 训练框架（含帧预处理）

class AtariDQN:
    def __init__(self, n_actions=18, lr=0.00025, gamma=0.99,
                 buffer_capacity=1000000, batch_size=32):
        self.gamma = gamma
        self.batch_size = batch_size
        self.epsilon = 1.0
        self.epsilon_final = 0.01
        self.epsilon_decay_steps = 1000000
        self.step_count = 0
        self.buffer = ReplayBuffer(capacity=buffer_capacity)
        # 简化 CNN Q 网络（实际需要 PyTorch/JAX 实现）
        self.n_actions = n_actions

    def preprocess_frame(self, frame):
        gray = 0.2989 * frame[:,:,0] + 0.5870 * frame[:,:,1] + 0.1140 * frame[:,:,2]
        resized = gray[::2, ::2]  # 简单缩放
        normalized = resized / 255.0
        return normalized

    def get_epsilon(self):
        return max(self.epsilon_final,
                   1.0 - self.step_count / self.epsilon_decay_steps)

    def train_atari(self, env_name="BreakoutNoFrameskip-v4",
                    total_steps=10000000):
        env = gym.make(env_name)
        state, _ = env.reset()
        state = self.preprocess_frame(state)

        for step in range(total_steps):
            self.step_count += 1
            epsilon = self.get_epsilon()
            action = np.random.randint(self.n_actions) if np.random.random() < epsilon else 0

            next_frame, reward, term, trunc, _ = env.step(action)
            next_state = self.preprocess_frame(next_frame)
            done = term or trunc

            self.buffer.push(state.flatten(), action, reward, next_state.flatten(), done)
            state = next_state
            if done:
                state, _ = env.reset()
                state = self.preprocess_frame(state)

            if step % 100000 == 0:
                print(f"Step {step:,} | epsilon = {epsilon:.3f}")

        env.close()`
                }
            ],
            table: {
                headers: ["环境", "状态维度", "动作数", "典型奖励", "训练步数"],
                rows: [
                    ["CartPole-v1", "4 维连续", "2", "每步 +1", "~50k"],
                    ["MountainCar-v0", "2 维连续", "3", "每步 -1", "~100k"],
                    ["LunarLander-v2", "8 维连续", "4", "-100 到 +200", "~500k"],
                    ["Breakout", "4x84x84 像素", "4", "0 到 +742", "~10M"],
                    ["Pong", "4x84x84 像素", "6", "-21 到 +21", "~5M"],
                ]
            },
            mermaid: `graph TD
    A["初始化 DQN 智能体"] --> B["设置 epsilon=1.0"]
    B --> C["与环境交互"]
    C --> D["选择动作 (epsilon-greedy)"]
    D --> E["执行动作, 获取奖励"]
    E --> F["存储经验到缓冲区"]
    F --> G{"缓冲区 >= learn_start?"}
    G -->|是| H["采样 batch 训练"]
    G -->|否| C
    H --> I["更新 epsilon"]
    I --> J{"达到目标奖励?"}
    J -->|否| C
    J -->|是| K["保存模型"]
    class K s2
    class H s1
    class D s0
    classDef s0 fill:#7c2d12
    classDef s1 fill:#14532d
    classDef s2 fill:#0c4a6e`,
            tip: "CartPole 是验证 DQN 实现是否正确的首选环境。如果 CartPole 不能在 200 个 episode 内达到 195+ 的平均奖励，说明代码有 bug。",
            warning: "Atari 训练需要大量计算资源。原版 DQN 在单块 GPU 上训练 Breakout 需要数天时间。建议使用 Gymnasium 的 wrapper（如 AtariPreprocessing）来简化预处理。"
        }
    ],
};
