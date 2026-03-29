# Temporal Difference 学习面试题（5 道）

## 题目 1：基础概念
**问题：** 什么是 TD 学习？它如何结合 Monte Carlo 和动态规划的优点？

**参考答案：**
**TD 学习定义**：
Temporal Difference 学习通过自举（Bootstrap）机制，基于相邻时间步的预测差异进行学习，无需环境模型。

**结合 MC 和 DP 的优点**：

```
TD = MC 的采样 + DP 的 Bootstrap
```

| 特性 | Monte Carlo | DP | TD |
|------|-------------|-----|-----|
| 采样 | ✓ | ✗ | ✓ |
| Bootstrap | ✗ | ✓ | ✓ |
| 无需模型 | ✓ | ✗ | ✓ |
| 在线更新 | ✗ | ✓ | ✓ |

**具体结合方式**：
1. **像 MC 一样采样**：
   - 从实际经验学习
   - 无需环境模型 P(s'|s,a)

2. **像 DP 一样 Bootstrap**：
   - 用当前估计更新当前估计
   - 无需等待 episode 结束

**TD 误差**：
```
δ = R + γV(S') - V(S)
   ↑           ↑
  MC 部分     DP 部分
```

**优势**：
- 比 MC 方差低（Bootstrap）
- 比 DP 适用性广（无模型）
- 可以在线学习

**评分要点：** 说出"采样 +Bootstrap"得基本分，详细对比得高分

---

## 题目 2：TD 误差
**问题：** 写出 TD 误差的公式，并解释其含义。TD 误差在 RL 中有什么作用？

**参考答案：**
**TD 误差公式**：
```
δ_t = R_{t+1} + γ V(S_{t+1}) - V(S_t)
```

**各项含义**：
- `R_{t+1}`：即时奖励
- `γ V(S_{t+1})`：折扣的未来价值估计
- `R_{t+1} + γ V(S_{t+1})`：TD 目标（更好的估计）
- `V(S_t)`：当前估计
- `δ_t`：预测误差

**直观含义**：
- δ > 0：结果比预期好（surprise 正向）
- δ = 0：预测准确
- δ < 0：结果比预期差（surprise 负向）

**在 RL 中的作用**：

1. **学习信号**：
   - 驱动价值函数更新
   - V(S) ← V(S) + α δ

2. **优势估计**：
   - A(s,a) ≈ δ（在 Actor-Critic 中）
   - 指导策略更新

3. **收敛判断**：
   - δ → 0 表示收敛
   - 平均 TD 误差监控学习进度

4. **优先级采样**：
   - |δ| 大表示"意外"
   - 优先经验回放用|δ|排序

**神经科学联系**：
- 多巴胺神经元编码 TD 误差
- 正向δ→多巴胺释放
- 负向δ→多巴胺抑制

**评分要点：** 写出公式得基本分，提到多巴胺得高分

---

## 题目 3：SARSA vs Q-Learning
**问题：** 比较 SARSA 和 Q-Learning 的区别，它们各适用什么场景？

**参考答案：**
**核心区别**：

| 方面 | SARSA | Q-Learning |
|------|-------|------------|
| **策略类型** | On-policy | Off-policy |
| **TD 目标** | R + γQ(S',A') | R + γ max_a Q(S',a) |
| **学习对象** | 当前策略的价值 | 最优策略的价值 |
| **探索影响** | 考虑探索代价 | 忽略探索代价 |
| **安全性** | 更安全 | 可能过于乐观 |

**更新公式对比**：
```
SARSA: Q(S,A) ← Q + α[R + γQ(S',A') - Q]
              A'是实际执行的下一步动作

Q-Learning: Q(S,A) ← Q + α[R + γ max_a Q(S',a) - Q]
                   假设下一步选最优动作
```

**示例场景（悬崖行走）**：
```
S --- 危险 --- G
 \           /
  \--安全--/

SARSA：学会走安全路线（因为考虑ε-贪婪的探索）
Q-Learning：学会走最短路线（假设总是最优），但实际执行可能掉崖
```

**适用场景**：

**SARSA 适合**：
- 在线控制（策略即学习对象）
- 安全关键应用
- 探索有代价的场景

**Q-Learning 适合**：
- 学习最优策略
- 可以从历史数据学习
- 探索成本低的场景

**评分要点：** 说出 On/Off-policy 得基本分，用悬崖行走示例得高分

---

## 题目 4：收敛性
**问题：** TD(0) 算法在什么条件下收敛？为什么 TD 可以收敛？

**参考答案：**
**收敛条件**：

对于**固定策略π**，TD(0) 收敛到 V^π 的条件：

1. **学习率条件**（Robbins-Monro）：
   ```
   Σ_t α_t = ∞  （充分探索）
   Σ_t α_t² < ∞ （减少波动）
   ```
   如：α_t = 1/t

2. **充分访问**：
   - 所有状态被无限次访问
   - 或通过ε-贪婪保证探索

3. **有限 MDP**：
   - 有限状态和动作空间
   - 有界奖励

**为什么 TD 可以收敛**：

**1. 期望更新分析**：
```
E[V_{t+1}(s) | V_t] = V_t(s) + α E[δ_t | V_t]
```

**2. Bellman 方程联系**：
```
E[TD 目标] = E[R + γV(S')]
           = Σ P(s'|s,a)[R + γV(s')]
           = (T^π V)(s)  （Bellman 算子）
```

**3. 收缩映射**：
- Bellman 算子 T^π 是γ-收缩的
- TD 是 T^π 的随机近似
- 随机近似理论保证收敛

**4. 直观理解**：
- TD 误差的期望是 Bellman 残差
- 更新方向指向 V^π
- 学习率适当时收敛

**Q-Learning 收敛**：
- 额外需要：所有 (s,a) 无限次访问
- 收敛到 Q*（最优动作价值）

**评分要点：** 说出学习率条件得基本分，解释收缩映射得高分

---

## 题目 5：代码实现
**问题：** 请实现 Q-Learning 的核心更新函数，并解释与 SARSA 的区别。

**参考答案：**
```python
import numpy as np
from collections import defaultdict

class QLearning:
    def __init__(self, n_actions, alpha=0.1, gamma=0.99, epsilon=0.1):
        self.n_actions = n_actions
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.Q = defaultdict(lambda: np.zeros(n_actions))
    
    def get_action(self, state):
        """ε-贪婪策略"""
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)
        return np.argmax(self.Q[state])
    
    def update(self, state, action, reward, next_state, done):
        """
        Q-Learning 更新
        
        Q(S,A) ← Q(S,A) + α[R + γ max_a Q(S',a) - Q(S,A)]
        """
        if done:
            td_target = reward
        else:
            # 关键：max_a Q(S',a)
            td_target = reward + self.gamma * np.max(self.Q[next_state])
        
        td_error = td_target - self.Q[state][action]
        self.Q[state][action] += self.alpha * td_error
        
        return td_error

class Sarsa:
    def __init__(self, n_actions, alpha=0.1, gamma=0.99, epsilon=0.1):
        self.n_actions = n_actions
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.Q = defaultdict(lambda: np.zeros(n_actions))
    
    def get_action(self, state):
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)
        return np.argmax(self.Q[state])
    
    def update(self, state, action, reward, next_state, next_action, done):
        """
        SARSA 更新
        
        Q(S,A) ← Q(S,A) + α[R + γQ(S',A') - Q(S,A)]
        """
        if done:
            td_target = reward
        else:
            # 关键：Q(S',A')，使用实际执行的下一个动作
            td_target = reward + self.gamma * self.Q[next_state][next_action]
        
        td_error = td_target - self.Q[state][action]
        self.Q[state][action] += self.alpha * td_error
        
        return td_error

# 训练循环对比
def train_qlearning(agent, env, n_episodes):
    for ep in range(n_episodes):
        state = env.reset()
        while True:
            action = agent.get_action(state)
            next_state, reward, done, _ = env.step(action)
            agent.update(state, action, reward, next_state, done)
            if done:
                break
            state = next_state

def train_sarsa(agent, env, n_episodes):
    for ep in range(n_episodes):
        state = env.reset()
        action = agent.get_action(state)  # 需要先选动作
        while True:
            next_state, reward, done, _ = env.step(action)
            next_action = agent.get_action(next_state) if not done else None
            agent.update(state, action, reward, next_state, next_action, done)
            if done:
                break
            state = next_state
            action = next_action  # 更新动作用于下一步
```

**关键区别**：
1. Q-Learning 更新不需要 next_action
2. SARSA 需要先获取 next_action 再更新
3. Q-Learning 用 max，SARSA 用实际动作

**评分要点：** 代码正确得基本分，解释区别得高分

---
