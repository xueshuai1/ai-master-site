# Q-Learning 变体

> **分类**: 强化学习 | **编号**: 009 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`RL` `强化学习` `卷积`

**摘要**: Q-Learning 自 1989 年提出以来，出现了许多改进变体，解决了原始算法的各种局限性。

---
## 1. 概述

Q-Learning 自 1989 年提出以来，出现了许多改进变体，解决了原始算法的各种局限性。这些变体在稳定性、样本效率、探索策略等方面进行了优化，推动了强化学习的发展。

**Q-Learning 的核心问题**：
- 最大化偏差（Maximization Bias）
- 探索 - 利用权衡
- 连续状态空间处理
- 样本效率低

**主要变体分类**：
1. 偏差修正：Double Q-Learning
2. 探索改进：Bootstrapped DQN
3. 函数近似：Deep Q-Network
4. 优先级采样：Prioritized Experience Replay

## 2. 算法原理

### 2.1 Double Q-Learning

**问题**：标准 Q-Learning 存在最大化偏差

```
标准 Q-Learning: Q(S,A) ← Q + α[R + γ max_a Q(S',a) - Q]
                        ↑
                   用同一个 Q 选择并评估
```

**最大化偏差来源**：
```
E[max_a Q(s,a)] ≥ max_a E[Q(s,a)]
```
由于 max 是凸函数，由 Jensen 不等式，估计会偏高。

**Double Q-Learning 解决方案**：
维护两个 Q 网络 Q1 和 Q2，交替更新：

```
以 0.5 概率：
    Q1(S,A) ← Q1 + α[R + γ Q2(S, argmax_a Q1(S',a)) - Q1]

以 0.5 概率：
    Q2(S,A) ← Q2 + α[R + γ Q1(S, argmax_a Q2(S',a)) - Q2]
```

**关键思想**：
- 用一个网络选择动作
- 用另一个网络评估价值
- 解耦选择和评估，减少偏差

### 2.2 Dueling DQN

**问题**：某些状态下动作价值差异很小

**解决方案**：分离状态价值和优势函数

```
Q(s,a; θ,α,β) = V(s; θ,β) + A(s,a; θ,α) - mean_a A(s,a; θ,α)
```

其中：
- `V(s)`：状态价值（与动作无关）
- `A(s,a)`：优势函数（动作相对于平均的好坏）
- 减去均值保证可识别性

**网络结构**：
```
输入 → 共享层 → 价值流 → V(s)
              → 优势流 → A(s,a)
```

### 2.3 Prioritized Experience Replay

**问题**：均匀采样效率低

**解决方案**：根据 TD 误差优先级采样

**优先级定义**：
```
P(i) = (|δ_i| + ε)^α
```

其中：
- δ_i：样本 i 的 TD 误差
- ε：小常数（保证所有样本有概率）
- α：优先级程度（0=均匀，1=完全优先）

**重要性采样权重**（纠正偏差）：
```
w_i = (1/N · 1/P(i))^β
```

### 2.4 Distributional DQN

**问题**：Q 值是期望，丢失分布信息

**解决方案**：学习回报的完整分布

```
Z(s,a) = 随机变量（回报分布）
Q(s,a) = E[Z(s,a)]
```

**C51 算法**：
- 将分布离散化为 N 个原子
- 学习每个原子的概率
- 用 KL 散度作为损失

## 3. 算法流程

### 3.1 Double DQN 算法

```mermaid
flowchart TD
    Start([开始]) --> Init[初始化 Q 和 Q']
    Init --> Replay[从回放缓冲区采样]
    Replay --> Select[A* = argmax_a Q(S',a)]
    Select --> Evaluate[Q_target = R + γQ'(S',A*)]
    Evaluate --> Update[Q(S,A) ← Q + α(Q_target - Q)]
    Update --> Periodic{每 C 步？}
    Periodic -->|是 | Copy[Q' ← Q]
    Copy --> Replay
    Periodic -->|否 | Replay
    
    style Start fill:#c8e6c9
    style Update fill:#fff9c4
```

### 3.2 Dueling DQN 前向传播

```
1. 输入状态 s
2. 通过共享卷积层
3. 分支 1（价值流）：
   - 全连接层 → V(s)（标量）
4. 分支 2（优势流）：
   - 全连接层 → A(s,a)（|A|维向量）
5. 合并：
   Q(s,a) = V(s) + A(s,a) - mean(A(s,·))
```

## 4. 代码实现

```python
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

class DoubleDQN:
    """Double DQN 实现"""
    
    def __init__(self, state_dim, action_dim, gamma=0.99, alpha=0.001):
        self.gamma = gamma
        self.action_dim = action_dim
        
        # 两个 Q 网络
        self.q1 = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, action_dim)
        )
        self.q2 = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, action_dim)
        )
        
        # 目标网络
        self.q1_target = self._clone(self.q1)
        self.q2_target = self._clone(self.q2)
        
        self.optimizer = torch.optim.Adam(
            list(self.q1.parameters()) + list(self.q2.parameters()),
            lr=alpha
        )
    
    def _clone(self, network):
        clone = type(network)(*[])
        clone.load_state_dict(network.state_dict())
        return clone
    
    def select_action(self, state, epsilon=0.1):
        if np.random.random() < epsilon:
            return np.random.randint(self.action_dim)
        
        with torch.no_grad():
            state = torch.FloatTensor(state).unsqueeze(0)
            q1 = self.q1(state).squeeze()
            return torch.argmax(q1).item()
    
    def update(self, batch_states, batch_actions, batch_rewards, 
               batch_next_states, batch_dones):
        """Double DQN 更新"""
        states = torch.FloatTensor(batch_states)
        actions = torch.LongTensor(batch_actions).unsqueeze(1)
        rewards = torch.FloatTensor(batch_rewards)
        next_states = torch.FloatTensor(batch_next_states)
        dones = torch.FloatTensor(batch_dones)
        
        # Q1 选择，Q2 评估
        with torch.no_grad():
            # 用 Q1 选择动作
            next_actions = torch.argmax(self.q1(next_states), dim=1, keepdim=True)
            # 用 Q2 评估
            next_q = self.q2_target(next_states).gather(1, next_actions).squeeze()
            targets = rewards + self.gamma * next_q * (1 - dones)
        
        # Q1 更新
        current_q1 = self.q1(states).gather(1, actions).squeeze()
        loss1 = F.mse_loss(current_q1, targets)
        
        # Q2 选择，Q1 评估
        with torch.no_grad():
            next_actions = torch.argmax(self.q2(next_states), dim=1, keepdim=True)
            next_q = self.q1_target(next_states).gather(1, next_actions).squeeze()
            targets = rewards + self.gamma * next_q * (1 - dones)
        
        # Q2 更新
        current_q2 = self.q2(states).gather(1, actions).squeeze()
        loss2 = F.mse_loss(current_q2, targets)
        
        # 联合优化
        loss = loss1 + loss2
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        return loss.item()
    
    def update_target(self):
        """更新目标网络"""
        self.q1_target.load_state_dict(self.q1.state_dict())
        self.q2_target.load_state_dict(self.q2.state_dict())

class DuelingDQN(nn.Module):
    """Dueling DQN 网络"""
    
    def __init__(self, state_dim, action_dim):
        super().__init__()
        
        # 共享层
        self.shared = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU()
        )
        
        # 价值流
        self.value_stream = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1)
        )
        
        # 优势流
        self.advantage_stream = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim)
        )
    
    def forward(self, x):
        # 共享表示
        x = self.shared(x)
        
        # 价值
        value = self.value_stream(x)  # (batch, 1)
        
        # 优势
        advantage = self.advantage_stream(x)  # (batch, |A|)
        
        # 合并：Q = V + A - mean(A)
        q_values = value + (advantage - advantage.mean(dim=1, keepdim=True))
        
        return q_values

class PrioritizedReplayBuffer:
    """优先级经验回放"""
    
    def __init__(self, capacity, alpha=0.6, beta=0.4):
        self.capacity = capacity
        self.alpha = alpha
        self.beta = beta
        self.buffer = []
        self.priorities = np.zeros(capacity)
        self.pos = 0
    
    def push(self, transition, priority=1.0):
        """添加经验"""
        if len(self.buffer) < self.capacity:
            self.buffer.append(transition)
        else:
            self.buffer[self.pos] = transition
        
        # 新样本最大优先级
        self.priorities[self.pos] = priority ** self.alpha
        self.pos = (self.pos + 1) % self.capacity
    
    def sample(self, batch_size):
        """优先级采样"""
        # 计算采样概率
        priorities = self.priorities[:len(self.buffer)]
        probs = priorities / priorities.sum()
        
        # 采样索引
        indices = np.random.choice(len(self.buffer), batch_size, p=probs)
        
        # 重要性采样权重
        weights = (len(self.buffer) * probs[indices]) ** (-self.beta)
        weights /= weights.max()  # 归一化
        
        # 获取样本
        samples = [self.buffer[i] for i in indices]
        
        return samples, indices, weights
    
    def update_priorities(self, indices, priorities):
        """更新优先级"""
        for idx, priority in zip(indices, priorities):
            self.priorities[idx] = priority ** self.alpha
```

## 5. 应用场景

### 5.1 Atari 游戏

- DQN：突破性的深度 RL
- Double DQN：减少高估
- Dueling DQN：更好价值估计
- Prioritized Replay：样本高效

### 5.2 机器人控制

- 连续动作空间
- 需要稳定学习
- Double DQN 减少偏差

### 5.3 推荐系统

- 大规模状态空间
- Dueling DQN 分离价值和优势
- 优先级采样重要经验

## 6. 其他变体

### 6.1 Noisy DQN

用参数噪声替代ε-贪婪探索：
```
W = μ + σ ⊙ ε,  ε ~ N(0,1)
```

### 6.2 Rainbow DQN

整合多种改进：
- Double DQN
- Dueling DQN
- Prioritized Replay
- Noisy Nets
- N-step returns
- Distributional RL

### 6.3 Categorical DQN (C51)

学习回报分布：
```
Z(s,a) ∈ {z_1, ..., z_N} 离散分布
```

## 7. 总结

Q-Learning 变体解决了原始算法的局限：

1. **Double Q-Learning**：减少最大化偏差
2. **Dueling DQN**：分离价值和优势
3. **Prioritized Replay**：提高样本效率
4. **Distributional RL**：学习完整分布
5. **Rainbow**：整合多种改进

这些变体构成了现代深度 RL 的基础。

## 附录：Mermaid 图表

### Double Q-Learning 流程

```mermaid
graph LR
    subgraph 选择
        Q1[Q1 网络] --> Argmax[argmax_a Q1(S',a)]
    end
    
    subgraph 评估
        Argmax --> Q2[Q2 目标网络]
        Q2 --> Target[Q_target]
    end
    
    style Q1 fill:#e3f2fd
    style Q2 fill:#fff3e0
```

### Dueling DQN 架构

```mermaid
flowchart TB
    Input[状态 s] --> Shared[共享层]
    Shared --> Value[价值流 V(s)]
    Shared --> Advantage[优势流 A(s,a)]
    Value --> Merge[合并：V + A - mean(A)]
    Advantage --> Merge
    Merge --> Output[Q(s,a)]
    
    style Value fill:#c8e6c9
    style Advantage fill:#ffcdd2
```
