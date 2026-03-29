---
title: "解码策略对比：Greedy vs Sampling vs Beam Search"
category: "LLM"
difficulty: "⭐⭐"
tags: ["解码", "采样", "束搜索", "生成策略"]

collectedAt: "2026-03-29"
---

## 题目描述
请对比 Greedy Search、Sampling 和 Beam Search 三种解码策略，包括原理、优缺点和适用场景。

**标签：** 解码，采样，束搜索，生成策略

## 参考答案

**解码目标：**
从模型输出的概率分布 P(y|x) 中生成高质量文本序列。

**三种策略对比：**

| 策略 | 确定性 | 多样性 | 计算成本 | 质量 |
|------|--------|--------|---------|------|
| Greedy | 是 | 低 | 最低 | 一般 |
| Sampling | 否 | 高 | 低 | 好 |
| Beam Search | 是 | 中 | 中 | 好 |

**1. Greedy Search（贪婪搜索）：**
```python
# 每步选择概率最高的 token
for step in range(max_length):
    probs = model(input_ids)
    next_token = argmax(probs[-1])
    input_ids = concat(input_ids, next_token)
```
- **优点：** 简单、快速、可复现
- **缺点：** 容易陷入局部最优，重复度高
- **适用：** 代码生成、翻译等确定性任务

**2. Sampling（随机采样）：**
```python
# 从概率分布中采样
for step in range(max_length):
    probs = model(input_ids)
    
    # Temperature 调节
    probs = softmax(log(probs) / temperature)
    
    # Top-k 过滤
    top_k_probs, top_k_indices = topk(probs, k=50)
    
    # Top-p (nucleus) 过滤
    sorted_probs, sorted_indices = sort(probs, descending=True)
    cumsum = cumulative_sum(sorted_probs)
    mask = cumsum < p  # p=0.9
    filtered_probs = sorted_probs[mask]
    
    # 采样
    next_token = multinomial(filtered_probs)
```
- **Temperature：** 高→随机，低→确定
- **Top-k：** 限制采样范围
- **Top-p：** 动态选择最小 token 集
- **优点：** 多样性好，适合创意任务
- **缺点：** 不可复现，可能生成低质内容

**3. Beam Search（束搜索）：**
```python
# 维护 k 个候选序列
beams = [(empty_sequence, 0.0)]

for step in range(max_length):
    candidates = []
    for seq, score in beams:
        probs = model(seq)
        for token_idx in topk(probs, k=beam_width):
            new_score = score + log(probs[token_idx])
            candidates.append((seq + [token_idx], new_score))
    
    # 选择 top-k 序列
    beams = sorted(candidates, key=lambda x: x[1], reverse=True)[:beam_width]
```
- **优点：** 平衡质量和多样性
- **缺点：** 计算成本高，可能生成通用内容
- **适用：** 摘要、翻译等任务

**推荐配置：**
```python
# 创意写作
temperature=0.8, top_p=0.9, top_k=50

# 代码生成
temperature=0.2, do_sample=False  # 接近 greedy

# 问答
temperature=0.7, top_p=0.9

# 翻译
beam_size=5, length_penalty=0.6
```

## 考察重点
- **知识：** 各种解码策略的原理
- **能力：** 根据任务选择合适的解码配置
- **思维：** 理解确定性与多样性的权衡

## 延伸追问（25 分）
1. Temperature 如何影响输出分布？（5 分）
2. Top-p 和 Top-k 的区别是什么？（5 分）
3. 为什么 Beam Search 可能生成通用内容？（5 分）
4. 什么是 Contrastive Search？（5 分）
5. 如何评估生成文本的多样性？（5 分）

## 深入理解
解码策略直接影响生成质量，是 LLM 应用的关键调优参数。

## 更新历史
- v1 (2026-03-29): 初始版本
