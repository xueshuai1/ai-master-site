# Monte Carlo 方法

## 1. 概述

Monte Carlo（MC）方法是强化学习中最基础的学习方法之一，它通过从经验中采样学习，不需要环境模型。MC 方法的核心思想是：**用实际获得的回报来估计价值函数**。

**核心特点**：
- **无模型**：不需要知道 P(s'|s,a) 和 R(s,a)
- **基于采样**：从实际或模拟的经验中学习
- **完整 episode**：需要等到 episode 结束才能更新
- **高方差**：但无偏估计

### 1.1 与动态规划的区别

| 方面 | 动态规划 | Monte Carlo |
|------|----------|-------------|
| 模型需求 | 需要完整模型 | 无需模型 |
| 更新时机 | 同步备份 | 异步采样 |
| Bootstrap | 使用其他估计 | 使用实际回报 |
| 适用场景 | 规划 | 学习/控制 |

### 1.2 应用场景

- 棋类游戏（围棋、象棋）
-  episodic 任务（有明确终点）
- 模拟环境（可以重置）
- 批量学习（从历史数据学习）

## 2. 算法原理

### 2.1 价值估计

MC 方法用平均回报估计价值：

```
V(s) ≈ 平均(G_t | S_t = s)
```

其中 G_t = R_{t+1} + γR_{t+2} + ... + γ^{T-1}R_T 是实际回报。

**两种更新方式**：

**首次访问 MC（First-visit MC）**：
- 只使用 episode 中第一次访问 s 的回报
- 无偏估计

**每次访问 MC（Every-visit MC）**：
- 使用 episode 中每次访问 s 的回报
- 有偏但方差可能更低

### 2.2 动作价值估计

对于控制问题，需要估计 Q(s,a)：

```
Q(s,a) ≈ 平均(G_t | S_t = s, A_t = a)
```

**探索问题**：
- 如果策略是确定性的，某些 (s,a) 可能永远不会被访问
- 解决方案：使用ε-贪婪策略

### 2.3 收敛性

MC 方法依概率 1 收敛到最优：
- 大数定律保证估计收敛到期望
- 需要充分探索（如ε-贪婪）
- 收敛速度 O(1/√N)

## 3. 算法流程

### 3.1 MC 策略评估

```mermaid
flowchart TD
    Start([开始]) --> Init[初始化 V(s)=0, Returns(s)=[]]
    Init --> Gen[生成 episode: S₀,A₀,R₁,...,S_T]
    Gen --> CalcG[计算回报 G_t]
    CalcG --> Loop{对于每个状态 S_t?}
    Loop -->|首次访问 | Add[Returns(S_t).append(G_t)]
    Add --> Update[V(S_t) = 平均(Returns(S_t))]
    Update --> Next{还有状态？}
    Next -->|是 | Loop
    Next -->|否 | Check{收敛？}
    Check -->|否 | Gen
    Check -->|是 | End([输出 V])
    
    style Start fill:#c8e6c9
    style End fill:#ffcdd2
```

### 3.2 MC 控制（Q-Learning 的 MC 版本）

```
初始化 Q(s,a) 任意，π 任意
重复：
    用ε-贪婪策略π生成 episode
    对于 episode 中每个 (s,a)：
        计算回报 G
        Q(s,a) ← Q(s,a) + α[G - Q(s,a)]
    改进策略：π(s) = argmax_a Q(s,a)
```

## 4. 代码实现

```python
import numpy as np
from collections import defaultdict

class MonteCarloAgent:
    """Monte Carlo 控制算法"""
    
    def __init__(self, n_actions, gamma=0.99, epsilon=0.1, alpha=0.1):
        self.n_actions = n_actions
        self.gamma = gamma
        self.epsilon = epsilon
        self.alpha = alpha
        
        # Q 值表
        self.Q = defaultdict(lambda: np.zeros(n_actions))
        # 访问计数（用于平均）
        self.returns_sum = defaultdict(lambda: np.zeros(n_actions))
        self.returns_count = defaultdict(lambda: np.zeros(n_actions))
    
    def get_action(self, state, training=True):
        """ε-贪婪策略"""
        if training and np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)
        else:
            return np.argmax(self.Q[state])
    
    def update(self, episode):
        """
        用首次访问 MC 更新 Q 值
        
        episode: [(s0, a0, r0), (s1, a1, r1), ..., (sT, aT, rT)]
        """
        # 计算回报 G_t
        G = 0
        returns = []
        
        # 从后向前计算回报
        for s, a, r in reversed(episode):
            G = r + self.gamma * G
            returns.insert(0, (s, a, G))
        
        # 首次访问更新
        visited = set()
        for s, a, G in returns:
            if (s, a) not in visited:
                visited.add((s, a))
                
                # 增量更新（等价于平均）
                self.returns_sum[(s, a)] += G
                self.returns_count[(s, a)] += 1
                self.Q[s][a] = self.returns_sum[(s, a)] / self.returns_count[(s, a)]
                
                # 或用学习率更新：
                # self.Q[s][a] += self.alpha * (G - self.Q[s][a])
    
    def train(self, env, n_episodes):
        """训练循环"""
        for ep in range(n_episodes):
            episode = []
            state = env.reset()
            
            while True:
                action = self.get_action(state)
                next_state, reward, done, _ = env.step(action)
                episode.append((state, action, reward))
                
                if done:
                    break
                
                state = next_state
            
            self.update(episode)
            
            # 衰减ε
            self.epsilon = max(0.01, self.epsilon * 0.995)
            
            if (ep + 1) % 100 == 0:
                print(f"Episode {ep+1}, ε={self.epsilon:.3f}")

# 增量 MC 更新（无需存储所有回报）
class IncrementalMC:
    """增量式 Monte Carlo"""
    
    def __init__(self, gamma=0.99, alpha=None):
        self.gamma = gamma
        self.alpha = alpha  # None 表示用 1/n
        self.Q = defaultdict(lambda: np.zeros(0))
        self.counts = defaultdict(lambda: np.zeros(0))
    
    def update(self, episode):
        """增量更新"""
        G = 0
        for t in reversed(range(len(episode))):
            s, a, r = episode[t]
            G = self.gamma * G + r
            
            # 确保 Q 向量足够长
            if len(self.Q[s]) <= a:
                old_len = len(self.Q[s])
                self.Q[s] = np.resize(self.Q[s], a + 1)
                self.Q[s][old_len:] = 0
                self.counts[s] = np.resize(self.counts[s], a + 1)
            
            # 更新
            self.counts[s][a] += 1
            n = self.counts[s][a]
            
            if self.alpha is None:
                alpha = 1 / n
            else:
                alpha = self.alpha
            
            self.Q[s][a] += alpha * (G - self.Q[s][a])
```

## 5. 应用场景

### 5.1 Blackjack（21 点）

经典 MC 应用：
- 状态：玩家点数、庄家明牌、是否有可用 A
- 动作：要牌、停牌
- 奖励：赢 +1、输 -1、平 0

### 5.2 围棋

- 状态：棋盘配置
- 动作：落子位置
- MC 评估：随机模拟到终局

### 5.3 机器人仿真

- 在仿真中收集大量经验
- 用 MC 学习价值函数
- 迁移到真实机器人

## 6. 高级技术

### 6.1 重要度采样

用于离策略学习（从行为策略 b 学习目标策略π）：

```
V^π(s) ≈ E_b[ρ_{t:T-1} · G_t | S_t = s]
```

其中重要性权重：
```
ρ_{t:T-1} = Π_{k=t}^{T-1} π(A_k|S_k) / b(A_k|S_k)
```

### 6.2 加权重要度采样

```
V(s) ≈ Σ_{i=1}^n ρ_i G_i / Σ_{i=1}^n ρ_i
```

### 6.3 n-step MC

结合 MC 和 TD：
```
G_{t:t+n} = R_{t+1} + γR_{t+2} + ... + γ^{n-1}R_{t+n} + γ^n V(S_{t+n})
```

## 7. 总结

Monte Carlo 方法是 RL 的基础：

1. **无模型学习**：从经验直接学习
2. **简单直观**：平均回报估计价值
3. **无需 Bootstrap**：使用实际回报
4. **需要完整 episode**：不适用于连续任务
5. **高方差**：但可以通过基线减少

MC 是理解更高级算法（如 Actor-Critic）的基础。

## 附录：Mermaid 图表

### MC 与 TD 对比

```mermaid
graph LR
    subgraph MC
        M1[完整 episode] --> M2[计算 G_t]
        M2 --> M3[更新 V(s)]
    end
    
    subgraph TD
        T1[一步] --> T2[计算 r+γV(s')]
        T2 --> T3[更新 V(s)]
    end
    
    style MC fill:#e3f2fd
    style TD fill:#fff3e0
```
