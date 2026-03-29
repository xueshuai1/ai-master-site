---
title: "长上下文处理技术"
category: "LLM"
difficulty: "⭐⭐⭐"
tags: ["长上下文", "位置编码", "窗口注意力", "上下文扩展"]
source: "LLM 面试题整理"
sourceUrl: ""
collectedAt: "2026-03-29"
---

## 题目描述
LLM 如何处理长上下文（100k+ tokens）？请介绍位置编码外推、窗口注意力等技术。

**来源：** LLM 面试题整理
**标签：** 长上下文，位置编码，窗口注意力，上下文扩展

## 参考答案

**长上下文挑战：**
- 训练长度有限（通常 2k-8k）
- 推理时需要处理更长序列
- 注意力复杂度 O(n²) 成为瓶颈

**解决方案：**

**1. 位置编码外推：**

**RoPE 外推：**
```python
# 原始 RoPE
q_rotated = rotate(q, position)

# 外推：缩放位置
scale = train_length / inference_length
q_rotated = rotate(q, position * scale)

# NTK 感知缩放
freqs = base_freq ** (2 * arange(d/2) / d)
freqs_scaled = freqs * (scale ** (d / (d-2)))
```

**ALiBi（无位置编码）：**
```python
# 注意力分数加线性偏置
attention_scores = Q @ K.T / sqrt(d)
attention_scores += bias_matrix  # bias[i,j] = -m * |i-j|

# 推理时自然支持任意长度
```

**2. 窗口注意力（Sliding Window）：**
```python
# 只关注局部窗口
for i in range(seq_len):
    start = max(0, i - window_size)
    attention[i] = softmax(Q[i] @ K[start:i].T) @ V[start:i]

# 复杂度：O(n·window_size) 而非 O(n²)
# Mistral 7B 使用 4k 窗口
```

**3. 稀疏注意力：**
```python
# 固定稀疏模式
- 局部窗口：每个 token 关注邻近 token
- 全局 token：特殊 token 关注所有位置
- 膨胀注意力：间隔采样

# 典型：Longformer、BigBird
```

**4. 分块处理：**
```python
# 将长序列分块处理
chunks = split(document, chunk_size=4096)

# 方案 1：独立处理
results = [process(chunk) for chunk in chunks]

# 方案 2：重叠处理（保留上下文）
chunks = split_with_overlap(document, chunk_size=4096, overlap=256)

# 方案 3：层次处理
summary = summarize(chunks)
final_result = process(summary)
```

**5. 记忆机制：**
```python
# 维护压缩的记忆
memory = compress(previous_context)
current_output = model(current_input, memory)
memory = update(memory, current_output)
```

**主流模型方案：**

| 模型 | 上下文长度 | 技术方案 |
|------|-----------|---------|
| GPT-4 Turbo | 128k | 未知（推测外推 + 稀疏） |
| Claude 3 | 200k | 未知 |
| LLaMA 3 | 8k | RoPE 外推 |
| Mistral | 32k | 滑动窗口 + RoPE |
| Yi | 200k | 窗口 + 外推 |

**实践建议：**
```python
# 选择策略
if context_length < 8k:
    # 直接使用
    output = model.generate(prompt)
elif context_length < 32k:
    # 窗口注意力
    output = model.generate(prompt, attention_window=4096)
else:
    # 分块 + 摘要
    chunks = split_with_overlap(prompt, 4096, 256)
    summaries = [summarize(chunk) for chunk in chunks]
    output = model.generate("\n".join(summaries))
```

## 考察重点
- **知识：** 长上下文处理的各种技术
- **能力：** 根据场景选择合适方案
- **思维：** 理解长度 - 效率 - 效果的权衡

## 延伸追问（25 分）
1. RoPE 外推为什么有效？（5 分）
2. 滑动窗口会丢失什么信息？（5 分）
3. 什么是 YaRN？与 NTK 缩放的区别？（5 分）
4. 如何评估长上下文模型的质量？（5 分）
5. 长上下文训练的 challenges 是什么？（5 分）

## 深入理解
长上下文是 LLM 处理长文档、长对话的关键能力。

## 更新历史
- v1 (2026-03-29): 初始版本
