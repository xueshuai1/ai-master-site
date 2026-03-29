---
title: "自注意力机制计算过程"
category: "LLM"
difficulty: "⭐⭐⭐"
tags: ["自注意力", "计算", "复杂度", "优化"]

collectedAt: "2026-03-29"
---

## 题目描述
请逐步推导自注意力机制的计算过程，包括矩阵维度、时间复杂度，以及可能的优化方法。

**标签：** 自注意力，计算，复杂度，优化

## 参考答案

**输入输出：**
- 输入：X ∈ R^(n×d)，n 为序列长度，d 为隐藏维度
- 输出：O ∈ R^(n×d)

**计算步骤：**

**Step 1: 线性变换**
```python
Q = X · W_Q  # W_Q ∈ R^(d×d_k), Q ∈ R^(n×d_k)
K = X · W_K  # W_K ∈ R^(d×d_k), K ∈ R^(n×d_k)
V = X · W_V  # W_V ∈ R^(d×d_v), V ∈ R^(n×d_v)
```

**Step 2: 注意力分数**
```python
# 矩阵乘法：每对 token 的相关性
Scores = Q · K^T  # Scores ∈ R^(n×n)
# Scores[i,j] = Q[i] · K[j]
```

**Step 3: 缩放**
```python
Scores = Scores / √d_k
# 防止内积过大导致 softmax 梯度消失
```

**Step 4: Softmax 归一化**
```python
# 每行独立 softmax
Attention_Weights = softmax(Scores, dim=1)  # ∈ R^(n×n)
# 每行和为 1，表示对其他 token 的注意力分布
```

**Step 5: 加权求和**
```python
Output = Attention_Weights · V  # ∈ R^(n×d_v)
# 每个 token 的输出是所有 V 的加权和
```

**Step 6: 输出变换**
```python
Output = Output · W_O  # W_O ∈ R^(d_v×d)
```

**复杂度分析：**
- **时间：** O(n²·d_k + n·d_k·d + n·d_v·d) ≈ O(n²·d)
- **空间：** O(n²) 存储注意力矩阵

**优化方法：**

**1. 稀疏注意力：**
```python
# 只计算局部窗口或固定模式
Sparse_Attention = attention(Q, K, V, mask=sparse_mask)
# 复杂度：O(n·√n) 或 O(n·log n)
```

**2. 线性注意力：**
```python
# 使用核函数近似 softmax
Attention = φ(Q) · (φ(K)^T · V)
# 复杂度：O(n·d²)
```

**3. Flash Attention：**
- IO 感知算法
- 减少 HBM 访问
- 实际加速 2-3 倍

**4. 分块计算：**
```python
# 将 n×n 矩阵分块处理
for i in range(num_blocks):
    block_output = compute_block(Q[i], K, V)
```

## 考察重点
- **知识：** 自注意力的完整计算流程
- **能力：** 复杂度分析和优化思路
- **思维：** 从数学到工程的转化

## 延伸追问（25 分）
1. 为什么缩放因子是√d_k 而不是 d_k？（5 分）
2. 多头注意力的总复杂度是多少？（5 分）
3. Flash Attention 的核心思想是什么？（5 分）
4. 如何实现因果掩码（Causal Mask）？（5 分）
5. 自注意力如何处理变长序列？（5 分）

## 深入理解
深入理解自注意力计算是优化 LLM 推理的基础。

## 更新历史
- v1 (2026-03-29): 初始版本
