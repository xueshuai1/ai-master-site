# Monte Carlo 方法面试题（5 道）

## 题目 1：基础概念
**问题：** Monte Carlo 方法的核心思想是什么？它与动态规划有什么本质区别？

**参考答案：**
**核心思想**：
- 用实际获得的回报的平均值来估计价值函数
- V(s) ≈ E[G_t | S_t = s] ≈ 平均(G_t)
- 从采样经验中学习，无需环境模型

**与动态规划的本质区别**：

| 方面 | Monte Carlo | 动态规划 |
|------|-------------|----------|
| 模型 | 无需模型（无模型） | 需要完整模型 |
| 学习来源 | 实际/模拟经验 | Bellman 方程 |
| Bootstrap | 否（用实际回报） | 是（用其他估计） |
| 更新时机 | Episode 结束后 | 每步/同步 |
| 方差 | 高 | 低 |
| 偏差 | 无偏 | 取决于初始化 |

**关键区别**：
- MC 使用**实际回报 G_t**
- DP 使用**估计值 V(s')**（Bootstrap）

**评分要点：** 说出"用平均回报估计"得基本分，解释 Bootstrap 区别得高分

---

## 题目 2：首次访问 vs 每次访问
**问题：** 解释首次访问 MC 和每次访问 MC 的区别，各有什么优缺点？

**参考答案：**
**首次访问 MC（First-visit MC）**：
- 只使用 episode 中第一次访问状态 s 的回报
- 对于重复访问的状态，忽略后续访问

**每次访问 MC（Every-visit MC）**：
- 使用 episode 中每次访问状态 s 的回报
- 重复访问的状态会被多次计数

**区别示例**：
```
Episode: s1 → s2 → s3 → s2 → s4(结束)
回报：G1=10, G2=8, G3=5, G2'=3

首次访问：V(s2) 只用 G2=8
每次访问：V(s2) 用 (G2+G2')/2 = (8+3)/2 = 5.5
```

**优缺点对比**：

| 方面 | 首次访问 | 每次访问 |
|------|----------|----------|
| 偏差 | 无偏 | 有偏（但收敛到正确值） |
| 方差 | 较高 | 较低 |
| 数据利用 | 低 | 高 |
| 收敛速度 | 较慢 | 较快 |
| 实现复杂度 | 需跟踪访问 | 简单 |

**收敛性**：
- 两者都依概率 1 收敛到 V^π
- 首次访问理论性质更好
- 每次访问实践中可能更快

**评分要点：** 说出区别得基本分，分析收敛性得高分

---

## 题目 3：探索问题
**问题：** MC 控制方法中如何解决探索问题？ε-贪婪策略的作用是什么？

**参考答案：**
**探索问题**：
- 如果使用确定性策略，某些 (s,a) 可能永远不被访问
- 导致 Q(s,a) 无法更新，可能错过最优动作

**解决方案**：

**1.ε-贪婪策略**：
```
π(a|s) = {
    1-ε + ε/|A|  如果 a = argmax_a' Q(s,a')
    ε/|A|        其他动作
}
```
- 以 1-ε 概率选择最优动作
- 以ε概率随机探索

**2. 探索启动（Exploring Starts）**：
- 假设每个 (s,a) 都有非零概率作为起点
- 理论要求，实际难以满足

**3. 软策略（Soft Policy）**：
- 所有动作都有非零概率
- 如 Boltzmann 探索

**ε-贪婪的作用**：
1. **保证探索**：所有动作都有机会被选择
2. **利用为主**：大部分时间选择当前最优
3. **简单有效**：只有一个超参数ε
4. **渐进最优**：ε→0 时收敛到最优

**ε调度**：
- 初期ε大（多探索）
- 后期ε小（多利用）
- 如：ε = max(0.01, 0.99^episode)

**评分要点：** 说出ε-贪婪得基本分，解释探索 - 利用权衡得高分

---

## 题目 4：代码实现
**问题：** 请实现 MC 策略评估的核心更新函数。

**参考答案：**
```python
import numpy as np
from collections import defaultdict

def monte_carlo_predict(episodes, gamma=0.99):
    """
    首次访问 MC 策略评估
    
    参数:
        episodes: 列表，每个 episode 是 [(s0,a0,r0), (s1,a1,r1), ...]
        gamma: 折扣因子
    
    返回:
        V: 状态价值字典
    """
    # 存储每个状态的回报
    returns_sum = defaultdict(float)
    returns_count = defaultdict(int)
    
    for episode in episodes:
        # 计算回报（从后向前）
        G = 0
        returns = []
        for s, a, r in reversed(episode):
            G = gamma * G + r
            returns.insert(0, (s, G))
        
        # 首次访问更新
        visited = set()
        for s, G in returns:
            if s not in visited:
                visited.add(s)
                returns_sum[s] += G
                returns_count[s] += 1
    
    # 计算平均
    V = {s: returns_sum[s] / returns_count[s] 
         for s in returns_sum}
    
    return V

# 增量版本（无需存储所有回报）
def monte_carlo_incremental(V, counts, episode, gamma=0.99, alpha=None):
    """
    增量式 MC 更新
    
    V: 当前价值估计
    counts: 访问计数
    episode: 单个 episode
    """
    G = 0
    visited = set()
    
    for s, a, r in reversed(episode):
        G = gamma * G + r
        
        if s not in visited:
            visited.add(s)
            counts[s] += 1
            n = counts[s]
            
            if alpha is None:
                alpha_t = 1 / n
            else:
                alpha_t = alpha
            
            V[s] += alpha_t * (G - V[s])
    
    return V, counts
```

**关键点**：
1. 从后向前计算回报
2. 首次访问避免重复计数
3. 增量更新节省内存

**评分要点：** 代码正确得基本分，处理边界得高分

---

## 题目 5：方差分析
**问题：** 为什么 MC 方法方差高？如何减少方差？

**参考答案：**
**MC 方差高的原因**：

1. **回报是随机变量的和**：
   ```
   G_t = R_{t+1} + γR_{t+2} + ... + γ^{T-1}R_T
   Var(G_t) = Σ γ^{2k} Var(R_{t+k+1})
   ```
   - 多个随机项累加
   - 方差随序列长度增长

2. **策略随机性**：
   - 动作选择随机
   - 环境转移随机

3. **长序列**：
   - episode 越长，方差越大
   - γ接近 1 时更严重

**减少方差的方法**：

**1. 基线（Baseline）**：
```
G_t' = G_t - b(s_t)
```
- 减去状态相关的基线
- 不引入偏差（E[基线]=0）

**2. 重要度采样**：
- 用更多样化的数据
- 但可能增加方差

**3. 控制变量**：
- 利用已知信息
- 如已知某些状态的期望

**4. 增加样本**：
- 更多 episode
- 方差以 O(1/√N) 减少

**5. 结合 TD**：
- n-step MC
- 减少序列长度

**对比 TD**：
- TD 方差低（Bootstrap）
- 但 TD 有偏差
- MC 无偏但方差高

**评分要点：** 说出累加导致方差得基本分，提出减少方法得高分

---
