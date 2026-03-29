---
title: "Tokenization 方法详解"
category: "LLM"
difficulty: "⭐⭐"
tags: ["Tokenization", "BPE", "WordPiece", "SentencePiece"]

collectedAt: "2026-03-29"
---

## 题目描述
什么是 Tokenization？请比较 Word-Level、Character-Level、Subword 三种方法，并解释 BPE 和 WordPiece 的原理。

**标签：** Tokenization，BPE，WordPiece，SentencePiece

## 参考答案

**Tokenization 定义：**
将原始文本切分为模型可处理的离散单元（token）的过程。

**三种方法对比：**

| 方法 | 优点 | 缺点 | 代表 |
|------|------|------|------|
| Word-Level | 语义完整 | 词表过大、OOV 问题 | 早期 NLP |
| Character-Level | 无 OOV、词表小 | 序列过长、语义弱 | Char-RNN |
| Subword | 平衡效率和语义 | 实现复杂 | BERT/GPT |

**BPE（Byte-Pair Encoding）：**
```python
# 训练过程
1. 将词拆分为字符序列
2. 统计相邻符号对频率
3. 合并最频繁的符号对
4. 重复直到达到目标词表大小
```
- GPT 系列使用
- 从字符开始自底向上合并

**WordPiece：**
```python
# 与 BPE 类似，但合并标准不同
选择能最大化语言模型似然的符号对
```
- BERT 使用
- 用##前缀标识词中位置

**SentencePiece：**
- 直接对原始句子进行 BPE
- 无需预分词，支持多语言
- 被 T5、LLaMA 采用

**Unigram LM：**
- 从大词表开始，迭代删除低贡献 token
- SentencePiece 支持的另一算法

**应用实践：**
- 英文：BPE/WordPiece（30k-50k 词表）
- 中文：字符级或专门分词
- 多语言：SentencePiece（50k+ 词表）

## 考察重点
- **知识：** 各种 Tokenization 方法的原理和区别
- **能力：** 根据场景选择合适的分词方案
- **思维：** 理解词表大小与序列长度的权衡

## 延伸追问（25 分）
1. BPE 如何处理未登录词（OOV）？（5 分）
2. 为什么 GPT-4 词表大小增加到 100k+？（5 分）
3. 中文 Tokenization 有什么特殊考虑？（5 分）
4. 什么是 Byte-Level BPE？优势是什么？（5 分）
5. Tokenization 如何影响模型的多语言能力？（5 分）

## 深入理解
Tokenization 是 LLM 的第一道工序，直接影响模型效率和效果。

## 更新历史
- v1 (2026-03-29): 初始版本
