---
title: "模型架构演进：从 BERT 到 GPT 到 LLaMA"
category: "LLM"
difficulty: "⭐⭐⭐"
tags: ["架构演进", "BERT", "GPT", "LLaMA"]

collectedAt: "2026-03-29"
---

## 题目描述
请梳理 LLM 架构的演进历程，从 BERT 到 GPT 系列再到 LLaMA，关键改进有哪些？

**标签：** 架构演进，BERT，GPT，LLaMA

## 参考答案

**架构演进时间线：**

**2018: BERT（Encoder-only）**
```
架构：Encoder × 12/24
注意力：双向
预训练：MLM + NSP
用途：理解任务（分类、NER）
局限：不能直接生成
```

**2018-2020: GPT 系列（Decoder-only）**
```
GPT-1: 117M, Decoder × 12
GPT-2: 1.5B, Decoder × 48, 零样本学习
GPT-3: 175B, Decoder × 96, 少样本学习

架构改进：
- Pre-Norm（GPT-3）
- 更大的词表和上下文
- 更密集的注意力
```

**2022-2023: LLaMA 系列**
```
LLaMA (2023):
- SwiGLU 激活函数
- RoPE 位置编码
- RMSNorm 归一化
- 无偏置项

LLaMA 2 (2023):
- 更大上下文（4k）
- 更好的对齐
- 开源可用

LLaMA 3 (2024):
- 更大词表（128k）
- 更大上下文（8k）
- 改进的注意力
```

**关键改进对比：**

| 组件 | BERT | GPT | LLaMA |
|------|------|-----|-------|
| 架构 | Encoder | Decoder | Decoder |
| 注意力 | 双向 | 因果 | 因果 + GQA |
| 激活 | GeLU | GeLU | SwiGLU |
| 归一化 | LayerNorm | LayerNorm | RMSNorm |
| 位置编码 | 可学习 | 可学习 | RoPE |
| 偏置 | 有 | 有 | 无 |

**技术细节：**

**SwiGLU 激活：**
```python
# 替代 GeLU
SwiGLU(x) = Swish(xW) ⊗ (xV)
# 效果更好，计算略贵
```

**RMSNorm：**
```python
# 简化 LayerNorm
RMSNorm(x) = x / RMS(x) * γ
# 移除均值计算，加速训练
```

**Grouped-Query Attention (GQA)：**
```python
# Q 多头，K/V 分组
num_query_groups = 8  # LLaMA 2 70B
# 平衡 MQA 的效率和 MHA 的效果
```

**设计趋势：**
1. **简化：** 移除偏置、简化归一化
2. **高效：** GQA、RoPE、SwiGLU
3. **规模化：** 更大模型、更长上下文
4. **开源：** LLaMA 推动开源生态

**为什么 Decoder-only 成为主流？**
- 统一架构（理解 + 生成）
- 推理简单（自回归）
- 规模化效果好
- 指令微调自然

## 考察重点
- **知识：** 主流模型架构的演进
- **能力：** 理解设计改进的动机
- **思维：** 从演进看技术趋势

## 延伸追问（25 分）
1. 为什么 BERT 不适合生成任务？（5 分）
2. SwiGLU 相比 GeLU 的优势？（5 分）
3. RMSNorm 为什么能加速训练？（5 分）
4. GQA 如何平衡效率和质量？（5 分）
5. 未来架构可能的演进方向？（5 分）

## 深入理解
架构演进反映了社区对效率、效果和可扩展性的持续追求。

## 更新历史
- v1 (2026-03-29): 初始版本
