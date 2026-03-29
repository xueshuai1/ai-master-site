# Temporal Difference 学习

## 1. 概述

Temporal Difference（TD）学习是强化学习的核心突破，它结合了 Monte Carlo 方法和动态规划的优点。TD 学习通过**自举（Bootstrap）**机制，无需等待 episode 结束即可更新，也无需环境模型。

**核心思想**：用当前估计来更新当前估计，基于相邻时间步的预测差异（TD 误差）进行学习。

**TD 的关键贡献**：
- Sutton (1988) 首次系统提出
- 成为现代 RL 算法的基础
- Q-Learning、SARSA、Actor-Critic 都基于 TD

### 1.1 与 MC 和 DP 的关系

```
TD = MC 的采样 + DP 的 Bootstrap
```

| 方面 | Monte Carlo | DP | TD |
|------|-------------|-----|-----|
| 采样 | 是 | 否 | 是 |
| Bootstrap | 否 | 是 | 是 |
| 模型 | 无需 | 需要 | 无需 |
| 更新时机 | Episode 后 | 同步 | 每步 |

### 1.2 应用场景

- 连续任务（无明确终点）
- 在线学习（实时决策）
- 大规模问题（无法等待 episode）
- 现代深度 RL（DQN、A3C 等）

## 2. 算法原理

### 2.1 TD 误差

TD 误差是 TD 学习的核心：

```
δ_t = R_{t+1} + γ V(S_{t+1}) - V(S_t)
```

**含义**：
- `R_{t+1} + γ V(S_{t+1})`：TD 目标（更好的估计）
- `V(S_t)`：当前估计
- `δ_t`：预测误差（ surprise）

**直观理解**：
- δ > 0：结果比预期好，增加 V(S_t)
- δ < 0：结果比预期差，减少 V(S_t)

### 2.2 TD(0) 算法

最基础的 TD 算法：

```
V(S_t) ← V(S_t) + α [R_{t+1} + γ V(S_{t+1}) - V(S_t)]
```

其中α是学习率。

**TD(0) 的特点**：
- 单步更新（只 lookahead 一步）
- 在线学习（每步更新）
- 收敛到 V^π（对于固定策略）

### 2.3 SARSA（On-policy TD 控制）

SARSA 学习动作价值 Q(s,a)：

```
Q(S_t, A_t) ← Q(S_t, A_t) + α [R_{t+1} + γ Q(S_{t+1}, A_{t+1}) - Q(S_t, A_t)]
```

**名称来源**：(S_t, A_t, R_{t+1}, S_{t+1}, A_{t+1})

**On-policy**：学习的是当前执行策略的价值

### 2.4 Q-Learning（Off-policy TD 控制）

Q-Learning 学习最优动作价值：

```
Q(S_t, A_t) ← Q(S_t, A_t) + α [R_{t+1} + γ max_a Q(S_{t+1}, a) - Q(S_t, A_t)]
```

**Off-policy**：
- 行为策略：ε-贪婪（用于探索）
- 目标策略：贪婪（用于学习）

## 3. 算法流程

### 3.1 TD(0) 预测算法

```mermaid
flowchart TD
    Start([开始]) --> Init[初始化 V(s)]
    Init --> Reset[开始新 episode]
    Reset --> GetS[获取初始状态 S]
    GetS --> Loop{对于每步 t}
    Loop --> TakeAction[执行动作 A]
    TakeAction --> Observe[观察 R, S']
    Observe --> CalcTD[计算δ = R + γV(S') - V(S)]
    CalcTD --> Update[V(S) ← V(S) + αδ]
    Update --> Next{S'终止？}
    Next -->|否 | S[S ← S']
    S --> Loop
    Next -->|是 | Check{收敛？}
    Check -->|否 | Reset
    Check -->|是 | End([输出 V])
    
    style Start fill:#c8e6c9
    style End fill:#ffcdd2
```

### 3.2 Q-Learning 算法

```
初始化 Q(s,a) 任意
对于每个 episode：
    初始化 S
    对于每步 t：
        选择 A（如ε-贪婪）
        执行 A，观察 R, S'
        Q(S,A) ← Q(S,A) + α[R + γ max_a Q(S',a) - Q(S,A)]
        S ← S'
        如果 S 终止，跳出
```

## 4. 代码实现

```python
import numpy as np
from collections import defaultdict

class TDAgent:
    """TD(0) 预测算法"""
    
    def __init__(self, gamma=0.99, alpha=0.1):
        self.gamma = gamma
        self.alpha = alpha
        self.V = defaultdict(float)
    
    def update(self, state, reward, next_state, done):
        """TD(0) 更新"""
        if done:
            td_target = reward
        else:
            td_target = reward + self.gamma * self.V[next_state]
        
        td_error = td_target - self.V[state]
        self.V[state] += self.alpha * td_error
        
        return td_error

class SarsaAgent:
    """SARSA 控制算法"""
    
    def __init__(self, n_actions, gamma=0.99, alpha=0.1, epsilon=0.1):
        self.n_actions = n_actions
        self.gamma = gamma
        self.alpha = alpha
        self.epsilon = epsilon
        self.Q = defaultdict(lambda: np.zeros(n_actions))
    
    def get_action(self, state):
        """ε-贪婪策略"""
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)
        return np.argmax(self.Q[state])
    
    def update(self, state, action, reward, next_state, next_action, done):
        """SARSA 更新"""
        if done:
            td_target = reward
        else:
            td_target = reward + self.gamma * self.Q[next_state][next_action]
        
        td_error = td_target - self.Q[state][action]
        self.Q[state][action] += self.alpha * td_error
        
        return td_error
    
    def train(self, env, n_episodes):
        """训练循环"""
        for ep in range(n_episodes):
            state = env.reset()
            action = self.get_action(state)
            
            while True:
                next_state, reward, done, _ = env.step(action)
                next_action = self.get_action(next_state) if not done else None
                
                self.update(state, action, reward, next_state, next_action, done)
                
                if done:
                    break
                
                state = next_state
                action = next_action

class QLearningAgent:
    """Q-Learning 控制算法"""
    
    def __init__(self, n_actions, gamma=0.99, alpha=0.1, epsilon=0.1):
        self.n_actions = n_actions
        self.gamma = gamma
        self.alpha = alpha
        self.epsilon = epsilon
        self.Q = defaultdict(lambda: np.zeros(n_actions))
    
    def get_action(self, state):
        """ε-贪婪策略"""
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)
        return np.argmax(self.Q[state])
    
    def update(self, state, action, reward, next_state, done):
        """Q-Learning 更新"""
        if done:
            td_target = reward
        else:
            td_target = reward + self.gamma * np.max(self.Q[next_state])
        
        td_error = td_target - self.Q[state][action]
        self.Q[state][action] += self.alpha * td_error
        
        return td_error
    
    def train(self, env, n_episodes):
        """训练循环"""
        for ep in range(n_episodes):
            state = env.reset()
            
            while True:
                action = self.get_action(state)
                next_state, reward, done, _ = env.step(action)
                
                self.update(state, action, reward, next_state, done)
                
                if done:
                    break
                
                state = next_state
            
            # 衰减ε
            self.epsilon = max(0.01, self.epsilon * 0.995)

# 使用示例
if __name__ == "__main__":
    import gym
    
    # Q-Learning 示例
    env = gym.make('FrozenLake-v1')
    agent = QLearningAgent(env.action_space.n)
    
    for ep in range(1000):
        state = env.reset()
        total_reward = 0
        
        while True:
            action = agent.get_action(state)
            next_state, reward, done, _ = env.step(action)
            agent.update(state, action, reward, next_state, done)
            
            total_reward += reward
            state = next_state
            
            if done:
                break
        
        if (ep + 1) % 100 == 0:
            print(f"Episode {ep+1}, 平均奖励：{total_reward}")
```

## 5. 应用场景

### 5.1 在线控制

- 机器人实时控制
- 自动驾驶决策
- 游戏 AI（无需等待游戏结束）

### 5.2 连续任务

- 温度控制
- 库存管理
- 任何无明确终点的任务

### 5.3 深度强化学习

- DQN：Q-Learning + 深度网络
- A3C：Actor-Critic + TD
- 几乎所有现代深度 RL 算法

## 6. 高级主题

### 6.1 TD(λ)

TD(λ) 通过资格迹（Eligibility Traces）结合多步信息：

```
TD 误差：δ_t = R_{t+1} + γ V(S_{t+1}) - V(S_t)
资格迹：e_t(s) = γλ e_{t-1}(s) + 1{S_t = s}
更新：V(s) ← V(s) + α δ_t e_t(s)
```

- λ=0：TD(0)
- λ=1：类似 MC

### 6.2 Double Q-Learning

解决 Q-Learning 的最大化偏差：

```
Q1(S,A) ← Q1(S,A) + α[R + γ Q2(S, argmax_a Q1(S',a)) - Q1(S,A)]
```

### 6.3 Dueling DQN

分离状态价值和优势函数：

```
Q(s,a) = V(s) + A(s,a) - mean_a A(s,a)
```

## 7. 总结

TD 学习是 RL 的核心：

1. **Bootstrap**：用估计更新估计
2. **在线学习**：每步更新，无需等待
3. **无模型**：从经验学习
4. **收敛保证**：对固定策略收敛到 V^π
5. **广泛应用**：Q-Learning、Actor-Critic 等的基础

理解 TD 是掌握现代 RL 算法的关键。

## 附录：Mermaid 图表

### TD 误差来源

```mermaid
graph LR
    A[当前状态 S_t] --> B[预测 V(S_t)]
    C[下一状态 S_{t+1}] --> D[新估计 R+γV(S_{t+1})]
    B --> E[TD 误差δ]
    D --> E
    E --> F[更新 V(S_t)]
    
    style E fill:#ffcdd2
    style F fill:#c8e6c9
```

### SARSA vs Q-Learning

```mermaid
graph TB
    subgraph SARSA
        S1[S_t,A_t] --> R1[R_{t+1}]
        R1 --> S2[S_{t+1},A_{t+1}]
        S2 --> Q1[Q(S_t,A_t) ← Q + α(R+γQ(S_{t+1},A_{t+1})-Q)]
    end
    
    subgraph Q-Learning
        Q2[S_t,A_t] --> R2[R_{t+1}]
        R2 --> S3[S_{t+1}]
        S3 --> Max[max_a Q(S_{t+1},a)]
        Max --> Q3[Q(S_t,A_t) ← Q + α(R+γmax Q-Q)]
    end
    
    style SARSA fill:#e3f2fd
    style Q-Learning fill:#fff3e0
```
