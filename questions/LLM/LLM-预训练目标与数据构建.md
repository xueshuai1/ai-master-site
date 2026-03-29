---
title: "预训练目标与数据构建"
category: "LLM"
difficulty: "⭐⭐⭐"
tags: ["预训练", "语言建模", "数据清洗", "语料"]
source: "LLM 面试题整理"
sourceUrl: ""
collectedAt: "2026-03-29"
---

## 题目描述
请解释 LLM 预训练的目标函数，以及如何构建高质量的预训练数据集。

**来源：** LLM 面试题整理
**标签：** 预训练，语言建模，数据清洗，语料

## 参考答案

**预训练目标：**

**1. 因果语言建模（Causal LM）：**
```python
# 自回归预测下一个 token
L = -Σ log P(x_t | x_<t)
# GPT 系列使用
```

**2. 掩码语言建模（Masked LM）：**
```python
# 预测被掩码的 token
L = -Σ log P(x_masked | x_unmasked)
# BERT 使用，双向上下文
```

**3. 前后缀语言建模：**
```python
# 部分双向，用于 Encoder-Decoder
L = -Σ log P(x_target | x_source)
# T5、BART 使用
```

**数据构建流程：**

**Step 1: 数据收集**
```
来源：
- 网页爬取（Common Crawl）
- 书籍（Project Gutenberg）
- 维基百科
- 代码（GitHub）
- 对话数据
- 学术论文
```

**Step 2: 数据清洗**
```python
# 去重
deduplicated = deduplicate(corpus)

# 过滤低质量
filtered = [doc for doc in deduplicated 
            if quality_score(doc) > threshold]

# 过滤敏感信息
cleaned = remove_pii(filtered)

# 语言识别
multilingual = identify_language(cleaned)
```

**Step 3: 数据混合**
```python
# 按来源加权采样
data_mix = {
    'web': 0.60,
    'books': 0.15,
    'wiki': 0.10,
    'code': 0.10,
    'other': 0.05
}
```

**Step 4: Tokenization**
```python
# 使用预训练的 tokenizer
tokens = tokenizer.encode(text)
# 保存为高效格式（如 Arrow、TFRecord）
```

**数据质量关键：**
- **去重：** 减少过拟合，提升泛化
- **过滤：** 移除低质、有毒内容
- **平衡：** 多领域、多语言覆盖
- **新鲜度：** 包含最新知识

**数据规模：**
- LLaMA：1.4T tokens
- GPT-3：300B tokens
- PaLM：780B tokens

**挑战：**
- 数据隐私和版权
- 多语言不平衡
- 知识截止问题
- 偏见和毒性内容

## 考察重点
- **知识：** 预训练目标和数据处理流程
- **能力：** 设计和实施数据管道
- **思维：** 理解数据质量对模型的影响

## 延伸追问（25 分）
1. 为什么 GPT 选择因果 LM 而不是掩码 LM？（5 分）
2. 如何检测和处理训练数据污染？（5 分）
3. 数据去重有哪些方法？（5 分）
4. 如何评估预训练数据的质量？（5 分）
5. 多语言数据如何平衡？（5 分）

## 深入理解
数据是 LLM 的燃料，高质量数据是成功的关键。

## 更新历史
- v1 (2026-03-29): 初始版本
