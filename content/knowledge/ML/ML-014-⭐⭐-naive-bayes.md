# 生成数据

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`ML` `机器学习` `AI`

**摘要**: summary: "贝叶斯定理在机器学习中的应用，考察候选人对概率模型的理解"

---
---
order: 14
summary: "贝叶斯定理在机器学习中的应用，考察候选人对概率模型的理解"
title: "Naive Bayes (朴素贝叶斯)"
category: "ML"
roles: [算法工程师，数据科学家，机器学习工程师]
zones: [监督学习，概率模型]
difficulty: "⭐⭐"
tags: [Naive Bayes, Bayes Theorem, Classification, Probability, Text Classification]
source: "https://www.interviewbit.com/machine-learning-interview-questions/"
createdAt: "2026-03-29"
---

## 题目描述
请解释朴素贝叶斯分类器的原理。为什么叫"朴素"？有哪些变体？适用场景是什么？有什么优缺点？

## 参考答案

### 贝叶斯定理

**公式：**
```
P(Y|X) = P(X|Y) × P(Y) / P(X)

P(Y|X): 后验概率
P(X|Y): 似然
P(Y): 先验概率
P(X): 证据
```

```python
import numpy as np
from sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB
from sklearn.datasets import make_classification

# 生成数据
X, y = make_classification(n_samples=200, n_features=5, random_state=42)

# 高斯朴素贝叶斯（连续特征）
gnb = GaussianNB()
gnb.fit(X, y)
y_pred = gnb.predict(X)

print(f"Accuracy: {gnb.score(X, y):.4f}")
print(f"Class prior: {gnb.class_prior_}")
```

### "朴素"的含义

**朴素假设：** 所有特征相互独立

```python
# 联合概率分解
# P(X1, X2, ..., Xn | Y) = P(X1|Y) × P(X2|Y) × ... × P(Xn|Y)

# 这个假设在现实中很少成立
# 但朴素贝叶斯在实践中效果很好

# 为什么有效？
# 1. 分类只依赖概率大小关系，不依赖精确值
# 2. 特征依赖关系可能相互抵消
# 3. 简单模型泛化好
```

### 变体对比

```python
from sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB, ComplementNB

# 1. Gaussian NB: 连续特征，假设正态分布
gnb = GaussianNB()

# 2. Multinomial NB: 离散计数（文本分类）
# 适合词频特征
mnb = MultinomialNB(alpha=1.0)  # Laplace 平滑

# 3. Bernoulli NB: 二元特征
# 适合词是否出现
bnb = BernoulliNB(alpha=1.0)

# 4. Complement NB: 处理不平衡数据
cnb = ComplementNB()

# 文本分类示例
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.pipeline import Pipeline

texts = [
    "I love this movie",
    "This is terrible",
    "Great film",
    "Worst movie ever"
]
labels = [1, 0, 1, 0]  # 1: 正面，0: 负面

# Multinomial NB pipeline
pipeline = Pipeline([
    ('vectorizer', CountVectorizer()),
    ('clf', MultinomialNB())
])
pipeline.fit(texts, labels)

# 预测
test_texts = ["I love it", "Terrible movie"]
predictions = pipeline.predict(test_texts)
probas = pipeline.predict_proba(test_texts)

for text, pred, proba in zip(test_texts, predictions, probas):
    print(f"'{text}' -> {pred} (prob: {proba[pred]:.4f})")
```

### 优缺点

| 优点 | 缺点 |
|------|------|
| 简单快速 | 特征独立假设不现实 |
| 小数据表现好 | 需要特征独立或低相关 |
| 适合高维稀疏数据 | 概率估计不准确 |
| 多分类支持 | 对输入数据分布敏感 |
| 可解释性强 | 无法学习特征交互 |

## 考察重点
- ✅ 理解贝叶斯定理
- ✅ 掌握"朴素"假设的含义
- ✅ 了解不同变体的适用场景
- ✅ 能够应用朴素贝叶斯
- ✅ 理解优缺点

## 延伸题目
- [[贝叶斯网络]](./ML-037-bayesian-networks.md)
- [[文本分类技术]](./ML-038-text-classification.md)
- [[概率图模型]](./ML-039-pgm.md)

## 更新历史
- v1 (2026-03-29): 初始版本
