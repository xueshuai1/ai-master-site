import { Article } from '../knowledge';

export const article: Article = {
    id: "rl-002",
    title: "Q-Learning：表格型强化学习",
    category: "rl",
    tags: ["Q-Learning", "强化学习", "值迭代"],
    summary: "从 Q 表到最优策略，理解最经典的强化学习算法",
    date: "2026-04-12",
    readTime: "18 min",
    level: "入门",
    content: [
        {
            title: "1. 值函数与 Q 函数：评估状态-动作对",
            body: `在强化学习中，评估状态好不好和动作好不好是两个不同层次的问题。状态值函数 V(s) 回答的是处于状态 s 有多好，它只关注状态本身的长期价值。但在实际决策中，我们需要知道更精细的信息：在当前状态下，每个可选动作分别有多好。这正是 Q 函数（动作值函数）存在的意义。

Q 函数 Q(s,a) 定义为：从状态 s 出发，采取动作 a 之后，遵循某个策略 pi 所能获得的期望折扣回报。它比 V(s) 多了一个动作维度，因此信息更丰富。两者之间的关系是 V_pi(s) = sum_a pi(a|s) * Q_pi(s,a)，即状态值等于各动作值的加权平均。在确定性最优策略下，V*(s) = max_a Q*(s,a)。理解 Q 函数是理解 Q-Learning 的第一步。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

# V 函数 vs Q 函数的数据结构对比

class ValueFunction:
    """状态值函数 V(s)：每个状态一个值"""
    def __init__(self, n_states: int):
        self.V = np.zeros(n_states)

    def get_value(self, state: int) -> float:
        return self.V[state]

    def update(self, state: int, td_error: float, lr: float = 0.1):
        """TD 更新：V(s) += alpha * delta"""
        self.V[state] += lr * td_error


class QFunction:
    """动作值函数 Q(s,a)：每个状态-动作对一个值"""
    def __init__(self, n_states: int, n_actions: int):
        self.Q = np.zeros((n_states, n_actions))

    def get_q(self, state: int, action: int) -> float:
        return self.Q[state, action]

    def best_action(self, state: int) -> int:
        """返回最优动作（贪婪选择）"""
        return int(np.argmax(self.Q[state]))`
                },
                {
                    lang: "python",
                    code: `# Q 函数如何指导决策：从值到策略

def derive_policy(Q: np.ndarray) -> np.ndarray:
    """从 Q 表提取确定性贪婪策略"""
    n_states = Q.shape[0]
    policy = np.zeros(n_states, dtype=int)
    for s in range(n_states):
        policy[s] = np.argmax(Q[s])
    return policy


# 示例：3 状态 2 动作的小环境
Q_example = np.array([
    [1.5, 2.3],  # 状态 0: 动作 1 更好
    [0.8, 0.8],  # 状态 1: 两个动作等价
    [3.1, 1.2],  # 状态 2: 动作 0 更好
])
V_example = np.max(Q_example, axis=1)  # 最优策略下 V*(s) = max_a Q*(s,a)
pi_example = derive_policy(Q_example)
print(f"最优策略: {pi_example}")  # [1 0 0]
print(f"最优值函数: {V_example}")  # [2.3 0.8 3.1]`
                }
            ],
            table: {
                headers: ["概念", "符号", "维度", "决策能力"],
                rows: [
                    ["状态值函数", "V(s)", "每个状态 1 个值", "只能评估状态好坏"],
                    ["动作值函数", "Q(s,a)", "每对 (s,a) 一个值", "直接比较动作优劣"],
                    ["优势函数", "A(s,a)=Q-V", "衡量动作相对优势", "判断某动作比平均水平好多少"],
                    ["最优状态值", "V*(s)=max_a Q*(s,a)", "每个状态 1 个值", "最优策略下的状态价值"],
                    ["最优动作值", "Q*(s,a)", "每对 (s,a) 一个值", "最优策略下的动作价值"],
                ]
            },
            mermaid: `graph TD
    A["状态 s"] --> B["V(s) 评估状态"]
    A --> C["Q(s,a) 评估状态+动作"]
    C --> D["比较各动作的 Q 值"]
    D --> E["选择 argmax Q(s,a)"]
    B --> F["只知道状态价值"]
    E --> G["直接得到最优动作"]
    style E fill:#c8e6c9
    style F fill:#ffcdd2
    style G fill:#c8e6c9`,
            tip: "学习 Q 函数时，先想象一个简单的网格世界，在每个格子标出上下左右四个方向的 Q 值，直观理解为什么 Q 比 V 更适合做决策。",
            warning: "Q 表的空间复杂度是 |S| x |A|，当状态或动作空间很大时，表格法会遭遇维度灾难。这也是后续需要深度 Q 网络（DQN）的原因。"
        },
        {
            title: "2. Bellman 最优方程：Q-Learning 的理论根基",
            body: `Bellman 最优方程是 Q-Learning 算法的理论根基。它将 Q*(s,a) 分解为即时奖励加上从下一状态出发能获得的最大未来回报。这种递归结构让算法可以从局部更新中逐步收敛到全局最优解。

Bellman 最优 Q 方程的完整形式为：Q*(s,a) = sum_s' P(s'|s,a) * [R(s,a,s') + gamma * max_a' Q*(s',a')]。这个方程揭示了 Q-Learning 的核心思想：当前状态-动作对的价值，等于即时奖励加上未来可能获得的最大回报的折现值。关键在于 max 操作，它不依赖任何特定策略，而是假设从下一状态开始智能体永远采取最优动作。这种离线（off-policy）特性是 Q-Learning 最强大的地方。`,
            code: [
                {
                    lang: "python",
                    code: `# Bellman 最优 Q 方程的直观实现

def bellman_optimal_Q(state: int, action: int, Q: np.ndarray,
                      P: dict, R: dict, gamma: float = 0.9) -> float:
    """
    Q*(s,a) = sum_s' P(s'|s,a) * [R(s,a,s') + gamma * max_a' Q*(s',a')]
    """
    q_value = 0.0
    for next_state, prob in P[state][action].items():
        reward = R[state][action].get(next_state, 0.0)
        # 从下一状态出发，取最优动作的 Q 值
        best_future_q = np.max(Q[next_state])
        q_value += prob * (reward + gamma * best_future_q)
    return q_value


def synchronous_value_update(Q: np.ndarray, P: dict, R: dict,
                              gamma: float = 0.9) -> np.ndarray:
    """同步更新：用旧的 Q 计算所有新的 Q 值（理论推导用）"""
    n_states, n_actions = Q.shape
    Q_new = np.zeros_like(Q)
    for s in range(n_states):
        for a in range(n_actions):
            Q_new[s, a] = bellman_optimal_Q(s, a, Q, P, R, gamma)
    return Q_new`
                },
                {
                    lang: "python",
                    code: `# 从 Bellman 最优方程到值迭代（表格法）

def value_iteration_q(P: dict, R: dict, n_states: int, n_actions: int,
                      gamma: float = 0.9, theta: float = 1e-6) -> np.ndarray:
    """用 Bellman 最优方程迭代求解 Q*"""
    Q = np.zeros((n_states, n_actions))

    iteration = 0
    while True:
        Q_new = synchronous_value_update(Q, P, R, gamma)
        delta = np.max(np.abs(Q_new - Q))
        Q = Q_new.copy()
        iteration += 1

        if iteration % 50 == 0:
            print(f"迭代 {iteration}: max delta = {delta:.6f}")

        if delta < theta:
            print(f"收敛于迭代 {iteration}")
            break

    return Q`
                }
            ],
            table: {
                headers: ["方程要素", "符号", "物理意义", "示例值"],
                rows: [
                    ["即时奖励", "R(s,a,s')", "执行动作后立即获得的反馈", "到达终点 +10，每步 -0.1"],
                    ["状态转移", "P(s'|s,a)", "动作导致的不确定性结果", "向右走有 80% 成功"],
                    ["折扣因子", "gamma", "未来价值的折现率", "0.9 表示更看重近期"],
                    ["未来最优值", "max_a' Q*(s',a')", "从下一状态出发能获得的最大回报", "取决于后续状态的 Q 值"],
                    ["递归结构", "Q* = R + gamma * max Q*", "当前价值依赖未来价值", "通过迭代求解"],
                ]
            },
            mermaid: `graph LR
    A["Q*(s,a)"] --> B["即时奖励 R(s,a,s')"]
    A --> C["gamma * max_a' Q*(s',a')"]
    B --> D["当前步的反馈"]
    C --> E["未来最优回报"]
    D --> F["Q*"]
    E --> F
    C -.->|递归| A
    style A fill:#e1f5fe
    style F fill:#c8e6c9`,
            tip: "理解 Bellman 方程的最好方式是手动算一个小例子：画 2x2 格子，给每个格子标 Q 值，然后用方程更新一次，观察值的变化方向。",
            warning: "Bellman 最优方程中的 max 操作假设模型已知（P 和 R 已知）。Q-Learning 的伟大之处在于：它不需要知道 P 和 R，仅通过采样就能逼近最优 Q 值。"
        },
        {
            title: "3. Q-Learning 算法：离线策略学习的核心",
            body: `Q-Learning 由 Chris Watkins 在 1989 年提出，是强化学习领域最重要的算法之一。它的核心更新规则极其简洁：Q(s,a) += alpha * [r + gamma * max_a' Q(s',a') - Q(s,a)]。这个公式中，方括号内的部分称为 TD 误差（Temporal Difference Error），它衡量了当前 Q 值估计与新的目标值之间的差距。

Q-Learning 是离线策略（off-policy）算法，这意味着它学习的目标策略（贪婪策略）和行为策略（实际采取动作的策略）可以不同。具体来说，Q 表的更新总是使用 max_a' Q(s',a') 作为目标，这对应于贪婪策略；但实际探索时可以使用 epsilon-greedy 等策略来保证探索。这种解耦是 Q-Learning 的强大之处：即使探索策略很随机，学到的 Q 表仍然收敛到最优。`,
            code: [
                {
                    lang: "python",
                    code: `# Q-Learning 核心更新：一步步拆解

def q_learning_update(Q: np.ndarray, state: int, action: int,
                       reward: float, next_state: int, done: bool,
                       alpha: float = 0.1, gamma: float = 0.99) -> float:
    """
    Q(s,a) <- Q(s,a) + alpha * [r + gamma * max_a' Q(s',a') - Q(s,a)]
    """
    if done:
        # 终止状态：没有未来回报
        td_target = reward
    else:
        # 非终止：即时奖励 + 折现后的最优未来值
        td_target = reward + gamma * np.max(Q[next_state])

    # TD 误差：目标值 - 当前估计
    td_error = td_target - Q[state, action]

    # 更新 Q 表
    Q[state, action] += alpha * td_error

    return td_error`
                },
                {
                    lang: "python",
                    code: `# 完整的 Q-Learning 训练框架

def q_learning(env, episodes: int = 1000, alpha: float = 0.1,
               gamma: float = 0.99, epsilon: float = 0.1) -> tuple:
    """Q-Learning 训练循环"""
    n_states = env.observation_space.n
    n_actions = env.action_space.n
    Q = np.zeros((n_states, n_actions))
    history = []

    for ep in range(episodes):
        state, _ = env.reset()
        total_reward = 0.0
        done = False
        truncated = False

        while not (done or truncated):
            # epsilon-greedy 选择动作
            if np.random.random() < epsilon:
                action = env.action_space.sample()
            else:
                action = int(np.argmax(Q[state]))

            # 执行动作，获取反馈
            next_state, reward, done, truncated, _ = env.step(action)

            # Q-Learning 更新（离线策略：用 max Q 做目标）
            if done:
                td_target = reward
            else:
                td_target = reward + gamma * np.max(Q[next_state])

            td_error = td_target - Q[state, action]
            Q[state, action] += alpha * td_error

            state = next_state
            total_reward += reward

        history.append(total_reward)

    return Q, history`
                }
            ],
            table: {
                headers: ["步骤", "操作", "公式/代码", "说明"],
                rows: [
                    ["1. 观察状态", "s = env.reset()", "获取当前状态", "每集开始时调用"],
                    ["2. 选择动作", "epsilon-greedy", "以 epsilon 概率随机选择", "保证探索"],
                    ["3. 执行动作", "s', r, done = step(a)", "环境返回新状态和奖励", "交互的核心"],
                    ["4. 计算目标", "r + gamma * max Q(s')", "TD 目标值", "Q-Learning 用 max"],
                    ["5. 更新 Q 表", "Q(s,a) += alpha * (target - Q)", "向目标值靠近", "学习率的控制"],
                ]
            },
            mermaid: `graph TD
    A["开始 Episode"] --> B["观察状态 s"]
    B --> C["epsilon-greedy 选动作 a"]
    C --> D["执行动作，获取 s', r"]
    D --> E["计算 TD 目标 = r + gamma*max Q(s')"]
    E --> F["TD 误差 = 目标 - Q(s,a)"]
    F --> G["Q(s,a) += alpha * TD 误差"]
    G --> H{"终止?"}
    H -->|"否"| B
    H -->|"是"| I["记录总奖励"]
    I --> J{"更多 Episode?"}
    J -->|"是"| A
    J -->|"否"| K["输出 Q 表"]
    style E fill:#fff3e0
    style G fill:#c8e6c9`,
            tip: "Q-Learning 的离线策略特性意味着你可以用任意策略收集数据（甚至人类演示），然后用 Q-Learning 更新 Q 表，最终学到最优策略。",
            warning: "Q-Learning 容易高估 Q 值，因为 max 操作倾向于选择被高估计的动作。在复杂环境中，这种高估会累积。Double Q-Learning 通过解耦选择和评估来缓解这个问题。"
        },
        {
            title: "4. epsilon-greedy 探索：平衡探索与利用",
            body: `epsilon-greedy 是 Q-Learning 中最常用的探索策略。它的思想极其简单：以概率 epsilon 随机选择一个动作（探索），以概率 1-epsilon 选择当前 Q 表中最好的动作（利用）。这种策略在简单性和有效性之间取得了很好的平衡。

探索与利用的权衡是强化学习的核心难题。如果完全不探索（epsilon=0），智能体可能陷入局部最优，永远发现不了更好的策略。如果过度探索（epsilon=1），智能体就变成了随机游走，无法有效利用已学到的知识。实践中通常采用衰减策略：训练初期 epsilon 较大（如 0.3），鼓励广泛探索；随着训练进行逐渐减小 epsilon（如衰减到 0.01），让智能体更多利用已学到的知识。`,
            code: [
                {
                    lang: "python",
                    code: `# epsilon-greedy 策略的完整实现

class EpsilonGreedyPolicy:
    """带衰减的 epsilon-greedy 策略"""

    def __init__(self, n_actions: int, epsilon_start: float = 1.0,
                 epsilon_end: float = 0.01, decay_rate: float = 0.995):
        self.n_actions = n_actions
        self.epsilon = epsilon_start
        self.epsilon_start = epsilon_start
        self.epsilon_end = epsilon_end
        self.decay_rate = decay_rate

    def choose_action(self, Q: np.ndarray, state: int) -> int:
        """根据当前 Q 表和 epsilon 选择动作"""
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)  # 探索
        return int(np.argmax(Q[state]))  # 利用

    def decay(self):
        """衰减 epsilon"""
        self.epsilon = max(self.epsilon_end,
                          self.epsilon * self.decay_rate)`
                },
                {
                    lang: "python",
                    code: `# 不同探索策略对比

class SoftmaxPolicy:
    """Softmax/Boltzmann 探索：按 Q 值的概率分布选择动作"""

    def __init__(self, n_actions: int, temperature: float = 1.0):
        self.n_actions = n_actions
        self.temperature = temperature

    def choose_action(self, Q: np.ndarray, state: int) -> int:
        q_values = Q[state] / self.temperature
        # 数值稳定性：减去最大值
        q_values = q_values - np.max(q_values)
        probs = np.exp(q_values) / np.sum(np.exp(q_values))
        return np.random.choice(self.n_actions, p=probs)


def compare_exploration_strategies(Q: np.ndarray, state: int,
                                    n_trials: int = 1000):
    """比较 epsilon-greedy 和 Softmax 的动作选择分布"""
    n_actions = Q.shape[1]

    # epsilon-greedy (epsilon=0.1)
    eg_counts = np.zeros(n_actions)
    for _ in range(n_trials):
        if np.random.random() < 0.1:
            eg_counts[np.random.randint(n_actions)] += 1
        else:
            eg_counts[np.argmax(Q[state])] += 1

    # Softmax
    sm_policy = SoftmaxPolicy(n_actions, temperature=0.5)
    sm_counts = np.zeros(n_actions)
    for _ in range(n_trials):
        sm_counts[sm_policy.choose_action(Q, state)] += 1

    print(f"Q 值: {Q[state]}")
    print(f"Epsilon-greedy: {eg_counts / n_trials}")
    print(f"Softmax:        {sm_counts / n_trials}")`
                }
            ],
            table: {
                headers: ["策略", "原理", "优点", "缺点"],
                rows: [
                    ["epsilon-greedy", "以固定概率随机选择", "简单高效，易于实现", "探索时完全随机，不利用 Q 值信息"],
                    ["衰减 epsilon", "epsilon 随训练递减", "初期探索多，后期利用多", "需要调衰减率和最小值"],
                    ["Softmax", "按 Q 值概率分布选择", "高质量动作被选概率更大", "需要调温度参数"],
                    ["UCB", "基于置信上界选择", "理论保证，自适应探索", "计算复杂，需要访问计数"],
                    ["Thompson Sampling", "基于后验采样", "贝叶斯框架，自然平衡", "需要维护后验分布"],
                ]
            },
            mermaid: `graph TD
    A["选择动作"] --> B{"随机数 < epsilon?"}
    B -->|"是"| C["随机选择动作"]
    B -->|"否"| D["选择 argmax Q(s,a)"]
    C --> E["探索：发现新知识"]
    D --> F["利用：使用已有知识"]
    E --> G["epsilon 衰减"]
    G --> A
    style C fill:#fff3e0
    style D fill:#c8e6c9`,
            tip: "对于 FrozenLake 这种小环境，epsilon 从 0.3 衰减到 0.01、衰减率 0.999 是一个不错的起点。大环境需要更长的探索时间。",
            warning: "epsilon 衰减过快会导致智能体还没充分探索就锁定在次优策略上。如果发现训练奖励停滞不前，尝试减缓衰减或增大初始 epsilon。"
        },
        {
            title: "5. 学习率与折扣因子：Q-Learning 的超参数",
            body: `Q-Learning 有两个关键超参数：学习率 alpha 和折扣因子 gamma。学习率控制 Q 值更新的步长，决定了算法对新信息的信任程度。折扣因子则决定了智能体对未来奖励的重视程度，本质上是在及时行乐和延迟满足之间做选择。

学习率 alpha 在 (0,1] 范围内。alpha=1 意味着完全相信新的 TD 目标，丢弃旧的 Q 值估计；alpha 接近 0 意味着几乎不更新，学习极其缓慢。理论上，要保证 Q-Learning 收敛，alpha 需要满足 Robbins-Monro 条件：sum alpha_t = 无穷 且 sum alpha_t^2 < 无穷。实践中常使用固定小值（如 0.1）或逐渐衰减的学习率。折扣因子 gamma 同样在 [0,1] 范围内。gamma=0 表示只看即时奖励（短视），gamma 接近 1 表示非常看重长期回报（远见）。`,
            code: [
                {
                    lang: "python",
                    code: `# 学习率衰减策略对比

import numpy as np

def constant_lr(t: int, alpha0: float = 0.1) -> float:
    """固定学习率"""
    return alpha0

def decay_lr(t: int, alpha0: float = 0.5, k: float = 100) -> float:
    """衰减学习率：alpha_t = alpha0 * k / (k + t)"""
    return alpha0 * k / (k + t)

def step_lr(t: int, alpha0: float = 0.1,
            decay_steps: int = 500, decay_rate: float = 0.5) -> float:
    """阶梯式衰减"""
    return alpha0 * (decay_rate ** (t // decay_steps))


# 可视化不同学习率策略
total_steps = 2000
steps = np.arange(total_steps)
lr_constant = [constant_lr(t) for t in steps]
lr_decay = [decay_lr(t) for t in steps]
lr_step = [step_lr(t) for t in steps]

print(f"初始: {lr_constant[0]:.3f}, {lr_decay[0]:.3f}, {lr_step[0]:.3f}")
print(f"500步: {lr_constant[500]:.3f}, {lr_decay[500]:.3f}, {lr_step[500]:.3f}")
print(f"2000步:{lr_constant[1999]:.3f}, {lr_decay[1999]:.3f}, {lr_step[1999]:.3f}")`
                },
                {
                    lang: "python",
                    code: `# 折扣因子对策略选择的影响分析

def analyze_gamma_impact(P: dict, R: dict, n_states: int,
                          n_actions: int) -> dict:
    """分析不同 gamma 对最优策略的影响"""
    gammas = [0.0, 0.5, 0.9, 0.99, 0.999]
    results = {}

    for gamma in gammas:
        Q = np.zeros((n_states, n_actions))

        # 值迭代求解 Q*
        for _ in range(1000):
            Q_new = Q.copy()
            for s in range(n_states):
                for a in range(n_actions):
                    q = 0.0
                    for sp, prob in P[s][a].items():
                        r = R[s][a].get(sp, 0)
                        q += prob * (r + gamma * np.max(Q[sp]))
                    Q_new[s, a] = q
            if np.max(np.abs(Q_new - Q)) < 1e-6:
                break
            Q = Q_new

        policy = np.argmax(Q, axis=1)
        results[gamma] = {"policy": policy.tolist(), "V_start": float(np.max(Q[0]))}
        print(f"gamma={gamma:.3f}: 策略={policy.tolist()}, 起点值={np.max(Q[0]):.3f}")

    return results`
                }
            ],
            table: {
                headers: ["超参数", "典型范围", "过大的影响", "过小的影响"],
                rows: [
                    ["学习率 alpha", "0.01 ~ 0.5", "Q 值震荡，不收敛", "学习极慢，需要极多样本"],
                    ["折扣因子 gamma", "0.9 ~ 0.999", "远期不确定性放大", "短视，忽略长期回报"],
                    ["初始 epsilon", "0.3 ~ 1.0", "过多随机探索", "可能陷入局部最优"],
                    ["epsilon 衰减率", "0.99 ~ 0.9999", "epsilon 快速归零", "长期持续探索，效率低"],
                    ["最小 epsilon", "0.01 ~ 0.05", "后期仍有过量探索", "完全停止探索，可能次优"],
                ]
            },
            mermaid: `graph LR
    A["学习率 alpha"] --> B["更新步长"]
    A --> C["收敛速度"]
    D["折扣因子 gamma"] --> E["长期 vs 短期"]
    D --> F["有效视野深度"]
    B --> G["alpha 大: 快但不稳"]
    B --> H["alpha 小: 慢但稳定"]
    E --> I["gamma 大: 目光长远"]
    E --> J["gamma 小: 只顾眼前"]
    style B fill:#e1f5fe
    style E fill:#fff3e0`,
            tip: "FrozenLake 环境中，alpha=0.1、gamma=0.99 是比较稳健的选择。alpha 不宜过大，因为环境有随机性，需要平滑噪声。",
            warning: "gamma 非常接近 1 时（如 0.999），Q 值可能变得很大，导致数值不稳定。在长 episode 环境中，考虑使用 gamma=0.99 或 0.95。"
        },
        {
            title: "6. Q-Learning 收敛性：理论与实践",
            body: `Q-Learning 的收敛性是其最重要的理论性质之一。Watkins 和 Dayan 在 1992 年证明了：在有限 MDP 中，如果所有状态-动作对被无限次访问，且学习率满足 Robbins-Monro 条件，Q-Learning 几乎必然收敛到最优 Q 函数 Q*。

这个收敛性定理有几个关键前提。第一，状态和动作空间必须是有限的（表格法的核心假设）。第二，探索必须充分，每个状态-动作对都要被访问无限次。第三，学习率不能衰减太快也不能太慢。在实际应用中，这些条件往往无法严格满足，但 Q-Learning 仍然能在大多数情况下给出近似最优的解。理解收敛条件有助于诊断训练问题：如果 Q 值不收敛，通常是因为探索不足或学习率设置不当。`,
            code: [
                {
                    lang: "python",
                    code: `# 监控 Q-Learning 收敛过程

def monitor_convergence(env, episodes: int = 5000, alpha: float = 0.1,
                         gamma: float = 0.99, epsilon: float = 0.3) -> dict:
    """监控 Q-Learning 的收敛行为"""
    n_states = env.observation_space.n
    n_actions = env.action_space.n
    Q = np.zeros((n_states, n_actions))

    metrics = {
        "episode_rewards": [],
        "max_q_changes": [],
        "state_visit_counts": np.zeros(n_states),
    }

    for ep in range(episodes):
        state, _ = env.reset()
        total_reward = 0.0
        max_q_change = 0.0
        done = False
        truncated = False

        while not (done or truncated):
            if np.random.random() < epsilon:
                action = np.random.randint(n_actions)
            else:
                action = int(np.argmax(Q[state]))

            next_state, reward, done, truncated, _ = env.step(action)
            metrics["state_visit_counts"][state] += 1

            if done:
                td_target = reward
            else:
                td_target = reward + gamma * np.max(Q[next_state])

            old_q = Q[state, action]
            td_error = td_target - old_q
            Q[state, action] += alpha * td_error
            max_q_change = max(max_q_change, abs(td_error))

            state = next_state
            total_reward += reward

        metrics["episode_rewards"].append(total_reward)
        metrics["max_q_changes"].append(max_q_change)

    return metrics`
                },
                {
                    lang: "python",
                    code: `# 验证 Robbins-Monro 条件

def check_robbins_monro(alpha_fn, max_steps: int = 100000) -> dict:
    """
    检查学习率函数是否满足 Robbins-Monro 条件:
    1. sum(alpha_t) = 无穷（足够大的更新）
    2. sum(alpha_t^2) < 无穷（方差趋于零）
    """
    sum_alpha = 0.0
    sum_alpha_sq = 0.0

    for t in range(1, max_steps + 1):
        alpha = alpha_fn(t)
        sum_alpha += alpha
        sum_alpha_sq += alpha ** 2

    converged = {
        "sum_alpha_diverges": sum_alpha > 100,
        "sum_alpha_sq_converges": sum_alpha_sq < 100,
    }
    return converged


# 测试不同学习率策略
def lr_classic(t: int) -> float:
    return 1.0 / t  # 经典 RM 学习率

def lr_fixed(t: int) -> float:
    return 0.1  # 固定学习率

print("=== 学习率 1/t ===")
r1 = check_robbins_monro(lr_classic)
print(f"满足 RM 条件: {r1}")
print("\\n=== 固定学习率 0.1 ===")
r2 = check_robbins_monro(lr_fixed)
print(f"满足 RM 条件: {r2}")`
                }
            ],
            table: {
                headers: ["收敛条件", "数学表达", "物理意义", "违反的后果"],
                rows: [
                    ["充分探索", "N(s,a) -> 无穷", "每个状态-动作对被无限次访问", "部分 Q 值未更新，次优策略"],
                    ["学习率和发散", "sum alpha_t = 无穷", "累积更新量足够大", "无法充分学习，停在初始值"],
                    ["学习率平方和收敛", "sum alpha_t^2 < 无穷", "更新的方差趋于零", "Q 值持续震荡，不稳定"],
                    ["有限 MDP", "|S| < 无穷, |A| < 无穷", "表格可枚举", "维度灾难，表格法失效"],
                    ["有界奖励", "|R| < 无穷", "奖励不会爆炸", "Q 值无界，数值溢出"],
                ]
            },
            mermaid: `graph TD
    A["Q-Learning 收敛性"] --> B["有限 MDP"]
    A --> C["充分探索"]
    A --> D["Robbins-Monro 学习率"]

    B --> E["状态/动作空间有限"]
    C --> F["每个 (s,a) 无限次访问"]
    D --> G["sum alpha = 无穷"]
    D --> H["sum alpha^2 < 无穷"]

    E --> I["Q -> Q* 几乎必然收敛"]
    F --> I
    G --> I
    H --> I

    style I fill:#c8e6c9
    style A fill:#e1f5fe`,
            tip: "实践中固定学习率（如 0.1）虽然不满足 Robbins-Monro 条件，但在小环境中效果很好。如果 Q 值震荡，可以尝试衰减学习率。",
            warning: "在随机环境（如 FrozenLake with slippery=True）中，即使 Q 表已收敛，策略的成功率也不是 100%，因为环境本身有随机性。这是正常的，不代表算法有问题。"
        },
        {
            title: "7. Gymnasium 实战：FrozenLake 环境完整训练",
            body: `现在我们把所有理论整合起来，在 Gymnasium 的 FrozenLake 环境中完整训练一个 Q-Learning 智能体。FrozenLake 是一个 4x4 的网格世界：起点在左上角 S，终点在右下角 G，中间的 H 是冰洞（掉进去游戏结束），F 是安全的冻结冰面。关键是冰面是滑的，智能体选择的方向只有 1/3 概率成功执行。

这个环境看似简单，但完美覆盖了 Q-Learning 的所有关键要素：离散状态和动作空间、随机转移、稀疏奖励（只有到达终点才有 +1）、探索与利用的权衡。我们将从零搭建训练循环、监控收敛过程、提取最优策略，并评估最终性能。这是表格型强化学习最完整的实战演练。`,
            code: [
                {
                    lang: "python",
                    code: `import gymnasium as gym
import numpy as np

class QLearningAgent:
    """完整的 Q-Learning 智能体"""

    def __init__(self, n_states: int, n_actions: int,
                 alpha: float = 0.1, gamma: float = 0.99,
                 epsilon: float = 0.3, epsilon_min: float = 0.01,
                 epsilon_decay: float = 0.999):
        self.Q = np.zeros((n_states, n_actions))
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.n_actions = n_actions

    def choose_action(self, state: int) -> int:
        """epsilon-greedy 策略选择动作"""
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)
        return int(np.argmax(self.Q[state]))

    def update(self, state: int, action: int, reward: float,
               next_state: int, done: bool) -> float:
        """Q-Learning 更新"""
        if done:
            td_target = reward
        else:
            td_target = reward + self.gamma * np.max(self.Q[next_state])

        td_error = td_target - self.Q[state, action]
        self.Q[state, action] += self.alpha * td_error
        return td_error

    def decay_epsilon(self):
        """衰减 epsilon"""
        self.epsilon = max(self.epsilon_min,
                          self.epsilon * self.epsilon_decay)

    def get_policy(self) -> np.ndarray:
        """提取最优策略"""
        return np.argmax(self.Q, axis=1)`
                },
                {
                    lang: "python",
                    code: `# 完整训练流程 + 评估

def train_and_evaluate(env, agent: QLearningAgent,
                        train_episodes: int = 5000,
                        eval_episodes: int = 100) -> dict:
    """训练 Q-Learning 智能体并评估"""
    rewards_history = []
    window = 100  # 滑动窗口

    # 训练阶段
    for ep in range(train_episodes):
        state, _ = env.reset()
        total_reward = 0.0
        done = False
        truncated = False

        while not (done or truncated):
            action = agent.choose_action(state)
            next_state, reward, done, truncated, _ = env.step(action)
            agent.update(state, action, reward, next_state, done or truncated)
            state = next_state
            total_reward += reward

        agent.decay_epsilon()
        rewards_history.append(total_reward)

        if (ep + 1) % window == 0:
            recent = rewards_history[-window:]
            success_rate = np.mean(recent)
            print(f"Episode {ep+1}/{train_episodes} | "
                  f"epsilon={agent.epsilon:.3f} | "
                  f"成功率={success_rate:.1%}")

    # 评估阶段（关闭探索）
    epsilon_save = agent.epsilon
    agent.epsilon = 0.0
    eval_rewards = []
    for _ in range(eval_episodes):
        state, _ = env.reset()
        total_reward = 0.0
        done = False
        truncated = False
        while not (done or truncated):
            action = agent.choose_action(state)
            state, reward, done, truncated, _ = env.step(action)
            total_reward += reward
        eval_rewards.append(total_reward)
    agent.epsilon = epsilon_save

    eval_success = np.mean(eval_rewards)
    policy = agent.get_policy()
    action_names = ["左", "下", "右", "上"]
    print(f"评估成功率: {eval_success:.1%}")
    print(f"最优策略: {[action_names[a] for a in policy]}")

    return {"Q": agent.Q, "policy": policy, "eval_success_rate": eval_success}`
                }
            ],
            table: {
                headers: ["阶段", "操作", "关键参数", "预期输出"],
                rows: [
                    ["初始化", "创建环境和 Q 表", "alpha=0.1, gamma=0.99", "16x4 的零矩阵"],
                    ["训练", "epsilon-greedy 交互 + Q 更新", "epsilon 从 0.3 衰减", "Q 表逐渐收敛"],
                    ["收敛监控", "每 100 集统计成功率", "滑动窗口 100", "成功率从 0% 上升"],
                    ["评估", "关闭探索，纯贪婪策略", "100 集评估", "成功率 70%+（滑冰面）"],
                    ["策略提取", "argmax Q 得到动作", "无额外参数", "16 个状态的最优动作"],
                ]
            },
            mermaid: `graph TD
    A["创建 FrozenLake 环境"] --> B["初始化 Q 表 16x4"]
    B --> C["训练 5000 集"]
    C --> D["epsilon 从 0.3 衰减到 0.01"]
    D --> E["Q 表收敛到 Q*"]
    E --> F["评估: 关闭探索"]
    F --> G["成功率 >= 70%"]
    G --> H["提取最优策略"]
    H --> I["可视化策略网格"]

    J["每 100 集监控"] -.-> C
    K["TD 误差下降"] -.-> E

    style A fill:#e1f5fe
    style E fill:#c8e6c9
    style G fill:#c8e6c9`,
            tip: "FrozenLake 4x4 滑冰面环境下，Q-Learning 的成功率通常在 60%-80% 之间，这是理论上限（因为环境随机性）。如果想达到 100%，可以切换到 4x4 非滑冰面版本。",
            warning: "训练结果每次运行可能不同，因为环境有随机性且 Q-Learning 的探索也是随机的。设置随机种子 env.reset(seed=42) 和 np.random.seed(42) 可以保证可复现性。"
        },
    ],
};
