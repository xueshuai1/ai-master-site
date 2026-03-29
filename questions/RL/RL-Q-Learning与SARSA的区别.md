---
title: "Q-Learning 与 SARSA 的区别"
category: "RL"
difficulty: "⭐⭐⭐⭐"
tags: ["Q-Learning", "SARSA", "时序差分", "Value-Based"]
source: "强化学习面试题整理"
sourceUrl: ""
collectedAt: "2026-03-29"
---

## 题目描述
Q-Learning 和 SARSA 都是基于时序差分的强化学习算法，请说明它们的核心区别是什么？各自适用于什么场景？

**来源：** 强化学习面试题整理
**标签：** Q-Learning, SARSA, 时序差分，Value-Based

## 参考答案

**核心区别：**

1. **策略类型：**
   - Q-Learning: Off-policy（异策略），学习最优策略，但使用ε-greedy 探索
   - SARSA: On-policy（同策略），学习并遵循当前策略

2. **更新公式：**
   - Q-Learning: Q(s,a) ← Q(s,a) + α[r + γ·max_a'Q(s',a') - Q(s,a)]
   - SARSA: Q(s,a) ← Q(s,a) + α[r + γ·Q(s',a') - Q(s,a)]
   
   关键区别：Q-Learning 使用下一状态的最大 Q 值，SARSA 使用实际执行的下一动作的 Q 值

3. **行为特点：**
   - Q-Learning 更激进，直接学习最优策略
   - SARSA 更保守，考虑了探索策略的影响

**适用场景：**
- Q-Learning: 环境安全，可以承受探索风险
- SARSA: 环境危险，需要考虑探索带来的风险（如悬崖行走问题）

## 考察重点
- On-policy 与 Off-policy 的理解
- 时序差分学习原理
- 算法选择的能力

## 延伸追问
### 追问 1: 收敛性
**问题：** Q-Learning 和 SARSA 都能收敛到最优策略吗？
**答案：** Q-Learning 在满足条件下可收敛到最优策略；SARSA 收敛到当前探索策略下的最优策略。

### 追问 2: 实际应用
**问题：** 在机器人控制中，应该选择 Q-Learning 还是 SARSA？为什么？
**答案：** 通常选择 SARSA，因为机器人探索时需要考虑安全，SARSA 会将探索策略的风险纳入学习。

## 深入理解
理解 On-policy 和 Off-policy 的区别对于选择正确的 RL 算法至关重要。

## 更新历史
- v1 (2026-03-29): 初始版本
