import { Article } from '../knowledge';

export const article: Article = {
    id: "rl-001",
    title: "强化学习入门：MDP 与 Bellman 方程",
    category: "rl",
    tags: ["强化学习", "MDP", "Bellman"],
    summary: "从马尔可夫决策过程到值迭代，理解强化学习的数学基础",
    date: "2026-04-12",
    readTime: "18 min",
    level: "入门",
    content: [
      {
        title: "1. 强化学习 vs 监督学习：范式之争",
        body: `强化学习（Reinforcement Learning, RL）与监督学习是机器学习中两大核心范式。监督学习依赖标注好的训练数据，模型从输入-输出对中学习映射关系，比如用图片分类训练一个猫狗识别器。强化学习则完全不同：没有现成的答案，只有一个智能体（Agent）在环境（Environment）中通过试错来学习最优策略。

关键区别在于反馈信号。监督学习中每个样本都有明确的"标准答案"（label），损失函数直接告诉模型"你错了多少"。强化学习中只有延迟的标量奖励（Reward），智能体必须自己判断哪个动作导致了后续的高奖励。这被称为信用分配问题（Credit Assignment Problem），是强化学习最核心的挑战之一。`,
        code: [
          {
            lang: "python",
            code: `# 监督学习 vs 强化学习的训练循环对比

# 监督学习：有明确标签，直接计算损失
def supervised_train(model, X, y):
    predictions = model.predict(X)
    loss = mean_squared_error(y, predictions)
    model.backward(loss)  # 有标准答案直接回传

# 强化学习：只有延迟奖励，需要策略评估
def rl_train(agent, env, episodes=100):
    for ep in range(episodes):
        state = env.reset()
        done = False
        total_reward = 0
        while not done:
            action = agent.choose_action(state)
            next_state, reward, done, _ = env.step(action)
            agent.update(state, action, reward, next_state)
            state = next_state
            total_reward += reward`,
          },
          {
            lang: "python",
            code: `# 信用分配问题示例：智能体走了10步才吃到奖励
# 哪一步是关键动作？需要 Bellman 方程来解答

rewards = [0, 0, 0, 0, 0, 0, 0, 0, 0, +10]  # 第10步才有奖励

# 朴素方法：把所有奖励平均分配给每个动作（不推荐）
def naive_credit_assign(rewards):
    avg = sum(rewards) / len(rewards)
    return [avg] * len(rewards)

# 折扣回报：越近的动作权重越大
def discounted_return(rewards, gamma=0.9):
    returns = []
    G = 0
    for r in reversed(rewards):
        G = r + gamma * G
        returns.insert(0, G)
    return returns

print(naive_credit_assign(rewards))     # [1.0, 1.0, ..., 1.0]
print(discounted_return(rewards, 0.9))  # 越后面的值越大`,
          },
        ],
        table: {
          headers: ["维度", "监督学习", "强化学习"],
          rows: [
            ["数据来源", "标注数据集（静态）", "环境交互（动态生成）"],
            ["反馈信号", "每个样本的标准答案", "延迟的标量奖励"],
            ["学习目标", "最小化预测误差", "最大化累积奖励"],
            ["时间关联", "样本独立同分布", "状态序列存在时序依赖"],
            ["典型场景", "分类、回归、识别", "游戏、机器人控制、推荐"],
          ],
        },
        mermaid: `graph TD
    A["监督学习"] --> B["输入 X + 标签 Y"]
    B --> C["模型 f(X) 预测"]
    C --> D["计算 Loss"]
    D --> E["梯度更新"]

    F["强化学习"] --> G["Agent 选择动作"]
    G --> H["Environment 返回状态+奖励"]
    H --> I["Agent 更新策略"]
    I --> G`,
        tip: "学习建议：先理解监督学习的基本流程，再对比强化学习的交互循环，差异一目了然。",
      },
      {
        title: "2. 马尔可夫决策过程（MDP）：形式化框架",
        body: `马尔可夫决策过程（Markov Decision Process, MDP）是强化学习的数学基础。几乎所有强化学习问题都可以被建模为一个 MDP。它由五元组 (S, A, P, R, gamma) 构成：状态空间 S、动作空间 A、状态转移概率 P、奖励函数 R 和折扣因子 gamma。

MDP 的核心假设是马尔可夫性（Markov Property）：下一状态只取决于当前状态和当前动作，与历史无关。即 P(s_{t+1} | s_t, a_t, s_{t-1}, ...) = P(s_{t+1} | s_t, a_t)。这个假设看似强，但通过精心设计状态表示（比如把速度信息编码进状态），大多数实际问题都能满足马尔可夫性。`,
        code: [
          {
            lang: "python",
            code: `# 简单的 MDP 示例：学生日常生活决策
# 状态: 上课/刷手机/学习/通过考试
# 动作: 认真听/走神/复习/放弃

class SimpleMDP:
    def __init__(self):
        self.states = ["上课", "刷手机", "学习", "通过考试", "挂科"]
        self.actions = ["认真听", "走神", "复习", "放弃"]
        # 状态转移概率 P[s][a] = [(prob, next_s, reward), ...]
        self.P = {
            "上课": {
                "认真听": [(0.8, "学习", 2), (0.2, "刷手机", -1)],
                "走神": [(0.7, "刷手机", -1), (0.3, "学习", 1)],
            },
            "刷手机": {
                "复习": [(0.6, "学习", 3), (0.4, "刷手机", -1)],
                "放弃": [(1.0, "挂科", -10)],
            },
            "学习": {
                "复习": [(0.9, "通过考试", 10), (0.1, "学习", 0)],
                "放弃": [(0.5, "刷手机", -1), (0.5, "学习", 0)],
            },
        }
        self.gamma = 0.9  # 折扣因子

    def step(self, state, action):
        transitions = self.P[state][action]
        probs, next_states, rewards = zip(*transitions)
        idx = np.random.choice(len(probs), p=probs)
        return next_states[idx], rewards[idx]`,
          },
          {
            lang: "python",
            code: `# 马尔可夫性验证：下一状态是否只依赖当前状态和动作？

import numpy as np

def check_markov_property(history_data):
    """检查历史数据是否满足马尔可夫性
    比较 P(s'|s,a) 和 P(s'|s,a,history) 是否一致
    """
    # 构建条件概率分布
    p_given_current = {}   # P(s'|s,a)
    p_given_history = {}   # P(s'|s,a,s_prev)

    for h in history_data:
        s_prev, s_curr, action, s_next = h
        key_current = (s_curr, action)
        key_history = (s_prev, s_curr, action)

        p_given_current.setdefault(key_current, {})
        p_given_current[key_current][s_next] = \
            p_given_current[key_current].get(s_next, 0) + 1

        p_given_history.setdefault(key_history, {})
        p_given_history[key_history][s_next] = \
            p_given_history[key_history].get(s_next, 0) + 1

    # 如果两种条件下概率分布差异大，说明不满足马尔可夫性
    return p_given_current, p_given_history`,
          },
        ],
        table: {
          headers: ["MDP 元素", "符号", "含义", "学生示例"],
          rows: [
            ["状态空间", "S", "所有可能的状态", "上课、刷手机、学习、通过、挂科"],
            ["动作空间", "A", "可选择的动作集合", "认真听、走神、复习、放弃"],
            ["转移概率", "P", "状态转移的不确定性", "认真听有 80% 概率进入学习"],
            ["奖励函数", "R", "每个转移的即时反馈", "通过考试 +10，挂科 -10"],
            ["折扣因子", "gamma", "未来奖励的折现率", "0.9 表示更看重近期奖励"],
          ],
        },
        mermaid: `graph LR
    A["状态 S"] --> B["选择动作 A"]
    B --> C["环境响应"]
    C --> D["新状态 S'"]
    C --> E["奖励 R"]
    D --> B
    class E s3
    class D s2
    class B s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12
    classDef s2 fill:#0c4a6e
    classDef s3 fill:#881337`,
        warning: "MDP 建模的关键在于状态设计。如果状态不包含足够信息（比如缺少历史），马尔可夫性就不成立，算法效果会大打折扣。",
      },
      {
        title: "3. 策略、值函数与奖励：RL 的三大核心",
        body: `强化学习围绕三个核心概念展开：策略（Policy）、值函数（Value Function）和奖励（Reward）。策略是智能体的行为准则，决定了在每个状态下选择哪个动作；值函数评估状态或状态-动作对的长期价值；奖励是环境给出的即时反馈信号。

策略分为确定性策略和随机性策略。确定性策略 pi(s) 直接输出动作，适合状态空间较小的场景。随机性策略 pi(a|s) 输出动作的概率分布，在需要探索的场景中更加灵活。值函数则分为状态值函数 V(s) 和动作值函数 Q(s,a)，前者评估"到达这个状态有多好"，后者评估"在这个状态下采取这个动作有多好"。`,
        code: [
          {
            lang: "python",
            code: `# 策略与值函数的实现

import numpy as np

class Policy:
    """随机策略：每个动作有固定概率"""
    def __init__(self, n_actions):
        self.probs = np.ones(n_actions) / n_actions  # 均匀初始

    def choose_action(self, state):
        return np.random.choice(len(self.probs), p=self.probs)

    def update(self, state, action, advantage, lr=0.1):
        """REINFORCE 风格的策略更新"""
        self.probs[action] += lr * advantage
        self.probs = np.clip(self.probs, 1e-6, None)
        self.probs /= self.probs.sum()  # 重新归一化


class ValueFunction:
    """状态值函数 V(s)"""
    def __init__(self, n_states):
        self.V = np.zeros(n_states)

    def update(self, state, td_error, lr=0.1):
        """时序差分更新：V(s) += alpha * (r + gamma*V(s') - V(s))"""
        self.V[state] += lr * td_error

    def get_value(self, state):
        return self.V[state]`,
          },
          {
            lang: "python",
            code: `# Q 函数：评估状态-动作对的长期价值

class QFunction:
    """动作值函数 Q(s, a)"""
    def __init__(self, n_states, n_actions):
        self.Q = np.zeros((n_states, n_actions))

    def choose_action(self, state, epsilon=0.1):
        """epsilon-greedy 策略：大部分时间选最优，偶尔探索"""
        if np.random.random() < epsilon:
            return np.random.randint(self.Q.shape[1])
        return np.argmax(self.Q[state])

    def update(self, state, action, reward, next_state, gamma=0.9, lr=0.1):
        """Q-learning 更新规则"""
        best_next = np.max(self.Q[next_state])
        td_target = reward + gamma * best_next
        td_error = td_target - self.Q[state, action]
        self.Q[state, action] += lr * td_error
        return td_error

    def get_q(self, state, action):
        return self.Q[state, action]`,
          },
        ],
        table: {
          headers: ["概念", "符号", "含义", "依赖"],
          rows: [
            ["策略", "pi(a|s)", "在状态 s 选择动作 a 的概率", "是智能体唯一需要学习的东西"],
            ["状态值函数", "V_pi(s)", "从状态 s 开始按策略 pi 的期望回报", "评估状态的好坏"],
            ["动作值函数", "Q_pi(s,a)", "在状态 s 采取动作 a 后按策略 pi 的期望回报", "评估状态-动作对的好坏"],
            ["即时奖励", "R(s,a,s')", "执行动作后环境的即时反馈", "由环境定义，不可修改"],
            ["折扣回报", "G_t", "未来所有奖励的折现和", "G_t = R_{t+1} + gamma*R_{t+2} + ..."],
          ],
        },
        mermaid: `graph TD
    A["策略 pi"] --> B["选择动作 a"]
    B --> C["环境给出奖励 r"]
    C --> D["值函数 V/Q 评估"]
    D --> E["更新策略 pi"]
    E --> A
    F["奖励 R"] -.->|即时反馈| C
    G["值函数 V/Q"] -.->|长期评估| D`,
        tip: "理解 V(s) 和 Q(s,a) 的区别是入门关键：V 只看状态好不好，Q 还看在该状态下做什么动作好。Q 更具体但更复杂。",
      },
      {
        title: "4. Bellman 方程：强化学习的基石",
        body: `Bellman 方程是强化学习最核心的数学工具，由数学家 Richard Bellman 在 1950 年代提出。它将一个状态的值函数分解为即时奖励和未来状态的折现值之和，从而建立了当前与未来之间的递归关系。

Bellman 期望方程描述了在给定策略下值函数的递归结构：V_pi(s) = sum_a pi(a|s) * sum_{s',r} P(s',r|s,a) * [r + gamma * V_pi(s')]。这个方程告诉我们，一个状态的值等于在该状态下采取各个动作的概率乘以对应动作能带来的即时奖励和未来值的期望。Bellman 最优方程则更进一步，它不依赖固定策略，而是直接寻找最优策略下的值函数。`,
        code: [
          {
            lang: "python",
            code: `# Bellman 期望方程：计算给定策略下的状态值

def bellman_expectation(V, state, policy, P, R, gamma=0.9):
    """
    V(s) = sum_a pi(a|s) * sum_{s'} P(s'|s,a) * [R(s,a,s') + gamma * V(s')]
    """
    v = 0.0
    for action, prob_a in enumerate(policy[state]):
        for next_state, prob_s in P[state][action].items():
            reward = R[state][action].get(next_state, 0)
            v += prob_a * prob_s * (reward + gamma * V[next_state])
    return v

# 迭代计算值函数直到收敛
def compute_value_function(policy, P, R, gamma=0.9, theta=1e-6):
    n_states = len(policy)
    V = np.zeros(n_states)
    while True:
        delta = 0
        for s in range(n_states):
            v_old = V[s]
            V[s] = bellman_expectation(V, s, policy, P, R, gamma)
            delta = max(delta, abs(v_old - V[s]))
        if delta < theta:
            break
    return V`,
          },
          {
            lang: "python",
            code: `# Bellman 最优方程：寻找最优策略下的值函数

def bellman_optimality(V, state, P, R, gamma=0.9):
    """
    V*(s) = max_a sum_{s'} P(s'|s,a) * [R(s,a,s') + gamma * V*(s')]
    """
    q_values = {}
    for action in P[state]:
        q = 0.0
        for next_state, prob_s in P[state][action].items():
            reward = R[state][action].get(next_state, 0)
            q += prob_s * (reward + gamma * V[next_state])
        q_values[action] = q
    return max(q_values.values())  # 取最优动作的 Q 值

# 策略提取：给定最优值函数，提取最优策略
def extract_optimal_policy(V_star, P, R, gamma=0.9):
    n_states = len(V_star)
    n_actions = len(P[0])
    policy = np.zeros((n_states, n_actions))
    for s in range(n_states):
        q_values = []
        for a in range(n_actions):
            q = 0.0
            for sp, prob in P[s][a].items():
                r = R[s][a].get(sp, 0)
                q += prob * (r + gamma * V_star[sp])
            q_values.append(q)
        best_action = np.argmax(q_values)
        policy[s, best_action] = 1.0
    return policy`,
          },
        ],
        table: {
          headers: ["方程类型", "公式", "用途", "未知量"],
          rows: [
            ["Bellman 期望（V）", "V_pi = R_pi + gamma*P_pi*V_pi", "评估给定策略", "V_pi"],
            ["Bellman 期望（Q）", "Q_pi = R + gamma*P*pi*Q_pi", "评估策略的动作值", "Q_pi"],
            ["Bellman 最优（V*）", "V*(s) = max_a Q*(s,a)", "寻找最优值函数", "V*"],
            ["Bellman 最优（Q*）", "Q*(s,a) = R + gamma*max_a' Q*(s',a')", "直接求最优动作值", "Q*"],
            ["策略提取", "pi*(s) = argmax_a Q*(s,a)", "从最优 Q 得到策略", "pi*"],
          ],
        },
        mermaid: `graph TD
    A["Bellman 期望方程"] --> B["评估固定策略"]
    A --> C["策略评估"]

    D["Bellman 最优方程"] --> E["寻找最优策略"]
    D --> F["值迭代/策略迭代"]

    B --> G["值函数 V_pi"]
    F --> H["最优值函数 V*"]
    H --> I["最优策略 pi*"]`,
        warning: "Bellman 最优方程中的 max 操作使其成为非线性方程，没有解析解。必须通过迭代算法（值迭代、策略迭代或 Q-learning）来求解。",
      },
      {
        title: "5. 值迭代与策略迭代：动态规划求解",
        body: `知道了 Bellman 方程，接下来的问题是如何求解它。动态规划（Dynamic Programming, DP）提供了两种经典算法：值迭代（Value Iteration）和策略迭代（Policy Iteration）。两者都假设环境的转移概率和奖励函数完全已知——这是 DP 方法的前提条件。

策略迭代分为两步交替进行：策略评估（Policy Evaluation）计算当前策略下的值函数，策略改进（Policy Improvement）基于值函数更新策略为贪婪策略。值迭代则将这两步合并为一步：每次直接用 Bellman 最优方程更新值函数，同时隐含地改进策略。策略迭代通常收敛更快（更少的迭代次数），但每次迭代需要做完整的策略评估；值迭代每步计算量小，但可能需要更多迭代。`,
        code: [
          {
            lang: "python",
            code: `# 策略迭代算法：策略评估 + 策略改进

def policy_iteration(P, R, gamma=0.9, theta=1e-6):
    n_states = len(P)
    n_actions = len(P[0])
    V = np.zeros(n_states)
    policy = np.ones((n_states, n_actions)) / n_actions  # 随机初始策略

    while True:
        # === 策略评估 ===
        while True:
            delta = 0
            for s in range(n_states):
                v_old = V[s]
                V[s] = sum(
                    policy[s][a] * sum(
                        prob * (R[s][a].get(sp, 0) + gamma * V[sp])
                        for sp, prob in P[s][a].items()
                    )
                    for a in range(n_actions)
                )
                delta = max(delta, abs(v_old - V[s]))
            if delta < theta:
                break

        # === 策略改进 ===
        policy_stable = True
        for s in range(n_states):
            old_action = np.argmax(policy[s])
            q_values = np.zeros(n_actions)
            for a in range(n_actions):
                q_values[a] = sum(
                    prob * (R[s][a].get(sp, 0) + gamma * V[sp])
                    for sp, prob in P[s][a].items()
                )
            best_action = np.argmax(q_values)
            policy[s] = np.eye(n_actions)[best_action]
            if old_action != best_action:
                policy_stable = False

        if policy_stable:
            break
    return V, policy`,
          },
          {
            lang: "python",
            code: `# 值迭代算法：更简洁的替代方案

def value_iteration(P, R, gamma=0.9, theta=1e-6):
    """值迭代：每步直接用 Bellman 最优方程更新"""
    n_states = len(P)
    n_actions = len(P[0])
    V = np.zeros(n_states)

    while True:
        delta = 0
        for s in range(n_states):
            v_old = V[s]
            # 对每个动作计算 Q 值，取最大
            q_values = np.zeros(n_actions)
            for a in range(n_actions):
                for sp, prob in P[s][a].items():
                    reward = R[s][a].get(sp, 0)
                    q_values[a] += prob * (reward + gamma * V[sp])
            V[s] = np.max(q_values)
            delta = max(delta, abs(v_old - V[s]))
        if delta < theta:
            break

    # 从最优值函数提取最优策略
    policy = np.zeros((n_states, n_actions))
    for s in range(n_states):
        q_values = np.zeros(n_actions)
        for a in range(n_actions):
            for sp, prob in P[s][a].items():
                reward = R[s][a].get(sp, 0)
                q_values[a] += prob * (reward + gamma * V[sp])
        best = np.argmax(q_values)
        policy[s, best] = 1.0
    return V, policy`,
          },
        ],
        table: {
          headers: ["对比维度", "策略迭代", "值迭代"],
          rows: [
            ["迭代结构", "策略评估 + 策略改进交替", "直接 Bellman 最优更新"],
            ["每次计算量", "大（需完整评估策略）", "小（一次 Bellman 更新）"],
            ["收敛速度", "通常更少迭代次数", "可能需要更多迭代"],
            ["空间复杂度", "需要存储策略和值函数", "只需存储值函数"],
            ["适用场景", "状态空间不大，需要精确解", "状态空间较大，快速近似"],
          ],
        },
        mermaid: `graph LR
    A["策略迭代"] --> B["策略评估"]
    B --> C["策略改进"]
    C -->|未收敛| B
    C -->|收敛| D["最优策略"]

    E["值迭代"] --> F["Bellman 最优更新"]
    F -->|未收敛| F
    F -->|收敛| G["最优值函数"]
    G --> H["提取最优策略"]`,
        tip: "实际应用中，值迭代代码更简洁，策略迭代收敛更快。小型 MDP 用策略迭代，大型 MDP 用值迭代。",
      },
      {
        title: "6. 实战：Frozen Lake 冻结湖环境",
        body: `Frozen Lake 是 OpenAI Gymnasium 中最经典的强化学习环境之一。场景是一个 4x4 的网格，智能体需要从起点 S 走到终点 G，途中要避免掉进冰洞 H。格子 F 表示冻结的安全冰面。这是一个部分可观测的环境，因为冰面是滑的——智能体想往右走，但可能滑到上方或下方。

这个环境完美展示了强化学习的核心挑战：探索与利用的权衡。智能体必须尝试不同路径来发现安全路线（探索），同时也要利用已经学到的知识（利用）。更妙的是，环境的转移概率不完全由智能体控制，这种随机性正是真实世界的写照。`,
        code: [
          {
            lang: "python",
            code: `import gymnasium as gym

# 创建 Frozen Lake 环境
env = gym.make("FrozenLake-v1", desc=None, map_name="4x4", is_slippery=True)

# 查看环境信息
print(f"状态空间: {env.observation_space}")  # Discrete(16)
print(f"动作空间: {env.action_space}")        # Discrete(4): 上下左右

# 渲染地图
# SFFF       (S: 起点, 安全)
# FHFH       (F: 冻结冰面, 安全)
# FFFH       (H: 冰洞, 危险)
# HFFG       (G: 终点, 目标)

# 随机策略试玩
state, info = env.reset()
total_reward = 0
done = False
while not done:
    action = env.action_space.sample()  # 随机动作
    state, reward, terminated, truncated, info = env.step(action)
    done = terminated or truncated
    total_reward += reward
    env.render()

print(f"总奖励: {total_reward}")  # 到达终点=1.0，掉洞=0.0`,
          },
          {
            lang: "python",
            code: `# 用值迭代求解 Frozen Lake

def solve_frozen_lake(env, gamma=0.99, theta=1e-8):
    n_states = env.observation_space.n
    n_actions = env.action_space.n

    # 提取转移概率 P[s][a] = [(prob, next_s, reward, done), ...]
    P = {}
    R = {}
    for s in range(n_states):
        P[s] = {}
        R[s] = {}
        for a in range(n_actions):
            P[s][a] = {}
            R[s][a] = {}
            for prob, next_s, reward, done in env.unwrapped.P[s][a]:
                P[s][a][next_s] = prob
                R[s][a][next_s] = reward

    # 值迭代
    V = np.zeros(n_states)
    while True:
        delta = 0
        for s in range(n_states):
            v_old = V[s]
            q_vals = np.zeros(n_actions)
            for a in range(n_actions):
                for sp, prob in P[s][a].items():
                    r = R[s][a].get(sp, 0)
                    q_vals[a] += prob * (r + gamma * V[sp])
            V[s] = np.max(q_vals)
            delta = max(delta, abs(v_old - V[s]))
        if delta < theta:
            break

    # 提取策略
    policy = np.zeros(n_states, dtype=int)
    for s in range(n_states):
        q_vals = np.zeros(n_actions)
        for a in range(n_actions):
            for sp, prob in P[s][a].items():
                r = R[s][a].get(sp, 0)
                q_vals[a] += prob * (r + gamma * V[sp])
        policy[s] = np.argmax(q_vals)
    return V, policy

V_star, pi_star = solve_frozen_lake(env)
print(f"最优值函数 (起点): {V_star[0]:.4f}")
print(f"最优策略 (起点): {pi_star[0]} (0=左,1=下,2=右,3=上)")`,
          },
        ],
        table: {
          headers: ["格子", "含义", "到达奖励", "是否终止"],
          rows: [
            ["S (0,0)", "起点", "0", "否"],
            ["F (安全冰面)", "可安全行走", "0", "否"],
            ["H (冰洞)", "掉入即结束", "0", "是，失败"],
            ["G (4,3)", "终点", "+1", "是，成功"],
            ["随机滑移", "动作有 1/3 概率偏移", "无额外奖励", "取决于落点"],
          ],
        },
        mermaid: `graph TD
    A["创建环境"] --> B["提取 MDP 参数"]
    B --> C["运行值迭代"]
    C --> D["得到 V* 和 pi*"]
    D --> E["验证策略"]
    E -->|成功率<目标| C
    E -->|成功| F["部署策略"]

    G["环境 P[a,b,c,d]"] -.->|转移概率| B
    H["环境 R"] -.->|奖励| B`,
        warning: "Frozen Lake 的 is_slippery 参数默认为 True，意味着动作有 1/3 概率随机偏移。关闭滑移后求解会变简单，但失去了随机 MDP 的学习价值。",
      },
      {
        title: "7. Gymnasium 环境交互：从理论到实践",
        body: `Gymnasium（原 OpenAI Gym）是强化学习最流行的环境接口库。它定义了一套标准 API：reset() 初始化环境，step(action) 执行动作并返回 (observation, reward, terminated, truncated, info)。理解这套接口是与任何 RL 环境交互的第一步。

terminated 表示环境到达终态（如游戏结束），truncated 表示环境因外部原因终止（如步数上限）。两者的区分很重要：terminated 时值函数应该学习最终奖励，truncated 时值函数应该继续估计未来可能的奖励。Gymnasium v0.26+ 将原来的 done 拆分为这两个布尔值，这是 RL 实践中一个重要的改进。`,
        code: [
          {
            lang: "python",
            code: `import gymnasium as gym

# 标准交互循环（推荐写法）
def run_episode(env, policy, render=False):
    """运行一集，返回总奖励和轨迹"""
    state, info = env.reset()
    trajectory = []  # 记录 (s, a, r, s') 用于后续学习
    total_reward = 0
    terminated = False
    truncated = False

    while not (terminated or truncated):
        action = policy(state)  # 策略决定动作
        next_state, reward, terminated, truncated, info = env.step(action)
        trajectory.append((state, action, reward, next_state))
        total_reward += reward
        state = next_state
        if render:
            env.render()

    env.close()
    return total_reward, trajectory


# epsilon-greedy 策略：平衡探索与利用
def epsilon_greedy_policy(Q, state, epsilon=0.1):
    n_actions = Q.shape[1] if hasattr(Q, 'shape') else 4
    if np.random.random() < epsilon:
        return np.random.randint(n_actions)
    return np.argmax(Q[state])`,
          },
          {
            lang: "python",
            code: `# 完整的 Q-learning 训练循环

def q_learning_train(env, episodes=1000, alpha=0.1, gamma=0.99, epsilon=0.1):
    """Q-learning 训练：无需模型，直接通过与环境交互学习"""
    n_states = env.observation_space.n
    n_actions = env.action_space.n
    Q = np.zeros((n_states, n_actions))
    rewards_per_episode = []

    for ep in range(episodes):
        state, _ = env.reset()
        total_reward = 0
        terminated = False
        truncated = False

        while not (terminated or truncated):
            # epsilon-greedy 选择动作
            if np.random.random() < epsilon:
                action = np.random.randint(n_actions)
            else:
                action = np.argmax(Q[state])

            next_state, reward, terminated, truncated, _ = env.step(action)

            # Q-learning 核心更新
            best_next_q = np.max(Q[next_state]) if not terminated else 0
            td_target = reward + gamma * best_next_q
            Q[state, action] += alpha * (td_target - Q[state, action])

            state = next_state
            total_reward += reward

        rewards_per_episode.append(total_reward)

        # 逐渐减少探索
        epsilon = max(0.01, epsilon * 0.999)

    return Q, rewards_per_episode

# 训练并验证
env = gym.make("FrozenLake-v1", is_slippery=True)
Q_star, history = q_learning_train(env, episodes=2000)
print(f"最终 Q 表形状: {Q_star.shape}")
print(f"最近 100 集平均奖励: {np.mean(history[-100:]):.3f}")`,
          },
        ],
        table: {
          headers: ["API 方法", "返回值", "说明", "注意事项"],
          rows: [
            ["reset()", "(obs, info)", "重置环境到初始状态", "每次新episode前必须调用"],
            ["step(action)", "(obs, r, term, trunc, info)", "执行动作获取反馈", "terminated 和 truncated 需分别处理"],
            ["render()", "None", "渲染环境画面", "需设置 render_mode 参数"],
            ["close()", "None", "释放环境资源", "训练结束后调用"],
            ["action_space", "Space 对象", "动作空间定义", "用 .n 或 .shape 获取维度"],
          ],
        },
        mermaid: `graph LR
    A["env.reset()"] --> B["获取初始状态"]
    B --> C["策略选择动作"]
    C --> D["env.step(action)"]
    D --> E["obs, reward, terminated, truncated"]
    E -->|未完成| C
    E -->|完成| F["记录总奖励"]
    F --> G["更新 Q 表"]
    G --> A`,
        tip: "训练时设置随机种子 env.reset(seed=42) 保证结果可复现。调试阶段先用小 episode 数验证代码正确性，再跑完整训练。",
      },
    ],
};
