---
title: "KV Cache 推理优化技术"
category: "LLM"
difficulty: "⭐⭐⭐"
tags: ["KV Cache", "推理优化", "显存管理", "自回归"]

collectedAt: "2026-03-29"
---

## 题目描述
请解释 KV Cache 在 LLM 推理中的作用，为什么它能加速生成，以及显存占用如何计算。

**标签：** KV Cache，推理优化，显存管理，自回归

## 参考答案

**KV Cache 原理：**
在自回归生成中，缓存已计算过的 K/V 矩阵，避免重复计算。

**问题背景：**
```python
# 生成第 t 个 token 时
# 无缓存：需要重新计算所有 t 个 token 的 K/V
# 有缓存：只需计算第 t 个 token 的 K/V，复用前 t-1 个
```

**实现方式：**
```python
# 伪代码
kv_cache = {}  # 每层缓存 K/V

for step in range(max_length):
    # 当前 token 的 QKV
    Q, K, V = linear(current_token)
    
    # 缓存 K/V
    if step > 0:
        K = concat(kv_cache[layer].K, K)
        V = concat(kv_cache[layer].V, V)
    
    # 自注意力
    output = attention(Q, K, V)
    
    # 更新缓存
    kv_cache[layer] = (K, V)
```

**加速原理：**
- 自注意力复杂度：O(n²·d)
- 无缓存：每步 O(t²)，总 O(n³)
- 有缓存：每步 O(t)，总 O(n²)
- 实际加速：2-4 倍

**显存占用计算：**
```
KV Cache 大小 = 2 × num_layers × hidden_size × seq_len × batch_size × bytes_per_param

示例（LLaMA-7B）：
- num_layers = 32
- hidden_size = 4096
- seq_len = 2048
- batch_size = 1
- bytes_per_param = 2 (FP16)

KV Cache = 2 × 32 × 4096 × 2048 × 1 × 2 = 1GB
```

**优化技术：**

1. **Multi-Query Attention (MQA)：**
   - 共享 K/V 头，减少缓存
   - 缓存减少 8 倍（8 头→1 头）

2. **Grouped-Query Attention (GQA)：**
   - Q 多头，K/V 分组
   - 平衡效果和效率

3. **Paged Attention（vLLM）：**
   - 类似操作系统分页
   - 减少显存碎片

4. **KV Cache 压缩：**
   - 量化（INT8/INT4）
   - 剪枝（保留重要 token）

**应用：**
- 所有自回归 LLM 推理引擎
- vLLM、TGI、TensorRT-LLM 等

## 考察重点
- **知识：** KV Cache 的工作原理和显存计算
- **能力：** 理解推理优化的核心思路
- **思维：** 时空权衡的工程思维

## 延伸追问（25 分）
1. 为什么 KV Cache 只适用于 Decoder？（5 分）
2. MQA 和 GQA 的区别是什么？（5 分）
3. 如何计算最大支持的 batch size？（5 分）
4. KV Cache 如何影响并发请求？（5 分）
5. 什么是 Prefix Caching？（5 分）

## 深入理解
KV Cache 是 LLM 推理优化的基石，理解它才能深入推理引擎。

## 更新历史
- v1 (2026-03-29): 初始版本
