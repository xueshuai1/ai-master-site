---
title: "LLM 推理优化技术"
category: "LLM"
difficulty: "⭐⭐⭐"
tags: ["推理优化", "KV Cache", "量化", "批处理"]

collectedAt: "2026-03-29"
---

## 题目描述
列举并解释 LLM 推理阶段的主要优化技术及其原理。

**标签：** 推理优化，KV Cache，量化，批处理

## 参考答案

**1. KV Cache：**
- 缓存已计算的关键值和值向量
- 避免重复计算历史 token
- 显著降低推理延迟

**2. 量化：**
- INT8/INT4 权重量化
- 减少显存占用，加速计算
- PTQ（训练后）vs QAT（量化感知）

**3. 批处理（Batching）：**
- Continuous Batching：动态批次，请求完成即释放
- 提高 GPU 利用率
- vLLM 的 PagedAttention 实现高效批处理

**4. 投机采样（Speculative Decoding）：**
- 小模型快速生成草稿
- 大模型并行验证
- 加速 2-3 倍，保持输出分布

**5. 注意力优化：**
- FlashAttention：减少 HBM 访问
- 稀疏注意力：降低计算量

## 考察重点
- **理解深度：** 各优化技术的底层原理
- **知识广度：** 推理系统的全方位优化
- **应用能力：** 生产环境中的性能调优

## 延伸追问（25 分）
1. KV Cache 的显存占用如何计算？（5 分）
2. 量化会损失多少精度？（5 分）
3. Continuous Batching 与传统批处理的区别？（5 分）
4. 投机采样的加速比受什么影响？（5 分）
5. 解释 vLLM 的 PagedAttention 原理。（5 分）
