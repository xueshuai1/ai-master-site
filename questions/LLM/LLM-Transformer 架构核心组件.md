---
title: "Transformer 架构核心组件"
category: "LLM"
difficulty: "⭐⭐"
tags: ["Transformer", "架构", "组件", "编码器解码器"]

collectedAt: "2026-03-29"
---

## 题目描述
请详细说明 Transformer 架构的核心组件，包括 Encoder 和 Decoder 的结构差异，以及各组件的作用。

**标签：** Transformer，架构，组件，编码器解码器

## 参考答案

**Transformer 整体架构：**
```
Encoder: 输入 → [Multi-Head Attention → Add&Norm → FFN → Add&Norm] × N → 编码
Decoder: 编码 → [Masked Attention → Add&Norm → Cross Attention → Add&Norm → FFN → Add&Norm] × N → 输出
```

**核心组件：**

**1. 自注意力层（Self-Attention）：**
- 捕获序列内依赖关系
- 并行计算，不受距离限制
- Encoder 和 Decoder 都有

**2. 多头注意力（Multi-Head Attention）：**
```python
# 多个注意力头并行
heads = [Attention(QW_Qᵢ, KW_Kᵢ, VW_Vᵢ) for i in range(num_heads)]
output = Concat(heads) · W_O
```
- 学习不同子空间的表示
- 增强模型表达能力

**3. 掩码注意力（Masked Attention）：**
- 仅用于 Decoder
- 防止看到未来位置
- 保证自回归生成

**4. 交叉注意力（Cross Attention）：**
- Decoder 特有
- Q 来自 Decoder，K/V 来自 Encoder
- 融合编码信息

**5. 前馈网络（FFN）：**
```python
FFN(x) = ReLU(xW₁ + b₁)W₂ + b₂
```
- 每个位置独立处理
- 引入非线性

**6. 残差连接与层归一化：**
- 缓解梯度消失
- 加速收敛

**Encoder vs Decoder：**

| 组件 | Encoder | Decoder |
|------|---------|---------|
| 自注意力 | 双向 | 掩码（单向） |
| 交叉注意力 | 无 | 有 |
| 输出 | 编码表示 | 生成分布 |

**应用：**
- **Encoder-only：** BERT（理解任务）
- **Decoder-only：** GPT（生成任务）
- **Encoder-Decoder：** T5、BART（翻译、摘要）

## 考察重点
- **知识：** Transformer 各组件的功能
- **能力：** 理解 Encoder-Decoder 差异
- **思维：** 架构设计与任务匹配

## 延伸追问（25 分）
1. 为什么 Decoder 需要掩码注意力？（5 分）
2. 多头注意力的头数如何选择？（5 分）
3. FFN 为什么用两层而不是一层？（5 分）
4. 残差连接为什么能缓解梯度消失？（5 分）
5. 为什么 GPT 只用 Decoder？（5 分）

## 深入理解
Transformer 是 LLM 的基石，理解其架构是深入大模型的基础。

## 更新历史
- v1 (2026-03-29): 初始版本
