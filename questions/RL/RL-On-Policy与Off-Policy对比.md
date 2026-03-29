---
title: "On-Policy 与 Off-Policy 对比"
category: "RL"
difficulty: "⭐⭐⭐⭐"
tags: ["On-Policy", "Off-Policy", "策略类型", "算法分类"]
source: "强化学习面试题整理"
sourceUrl: ""
collectedAt: "2026-03-29"
---

## 题目描述
强化学习算法可以分为 On-Policy 和 Off-Policy，请解释两者的区别、优缺点和典型算法。

**来源：** 强化学习面试题整理
**标签：** On-Policy, Off-Policy, 策略类型，算法分类

## 参考答案

**定义：**

- **On-Policy（同策略）：** 学习的策略和行为策略相同
  - 从当前策略采样，更新当前策略
  - 不能用旧数据更新

- **Off-Policy（异策略）：** 学习的策略和行为策略不同
  - 可以从任意策略采样的数据学习
  - 可以用旧数据更新

**典型算法：**

| On-Policy | Off-Policy |
|-----------|------------|
| REINFORCE | Q-Learning |
| SARSA | DQN |
| PPO | DDPG |
| A3C/A2C | TD3 |
| TRPO | SAC |

**优缺点对比：**

| 维度 | On-Policy | Off-Policy |
|------|-----------|------------|
| 样本效率 | 低 | 高 |
| 训练稳定性 | 好 | 较差 |
| 实现难度 | 简单 | 复杂 |
| 数据复用 | 不能 | 可以 |
| 收敛保证 | 强 | 较弱 |

**选择建议：**
- 样本昂贵：Off-Policy（可复用数据）
- 追求稳定：On-Policy（如 PPO）
- 连续控制：Off-Policy（SAC、TD3）
- 离散控制：On-Policy（PPO）

**重要性采样：**
Off-policy 学习需要重要性采样校正：
ρ = π(a|s) / b(a|s)

## 考察重点
- On/Off-Policy 的理解
- 算法分类
- 选择能力

## 延伸追问
### 追问 1: 为什么 Off-Policy 样本效率高？
**问题：** Off-Policy 为什么样本效率更高？
**答案：** 可以复用历史数据，不需要每次更新都重新采样。

### 追问 2: PPO 是 On 还是 Off？
**问题：** PPO 是 On-Policy 还是 Off-Policy？
**答案：** 本质是 On-Policy，但用重要性采样可以在小范围内复用数据。

## 深入理解
On/Off-Policy 是 RL 算法的基本分类，理解它对算法选择至关重要。

## 更新历史
- v1 (2026-03-29): 初始版本
