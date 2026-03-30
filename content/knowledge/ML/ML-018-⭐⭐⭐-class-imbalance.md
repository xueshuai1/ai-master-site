# 创建不平衡数据

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐

`ML` `机器学习` `AI`

**摘要**: summary: "类别不平衡是常见问题，考察候选人对采样技术和评估指标的理解"

---
---
order: 18
summary: "类别不平衡是常见问题，考察候选人对采样技术和评估指标的理解"
title: "Class Imbalance Handling (类别不平衡处理)"
category: "ML"
roles: [算法工程师，数据科学家，机器学习工程师]
zones: [数据预处理，分类问题]
difficulty: "⭐⭐⭐"
tags: [Class Imbalance, SMOTE, Sampling, Evaluation Metrics, Fraud Detection]
source: "https://www.upgrad.com/blog/machine-learning-interview-questions-answers/"
createdAt: "2026-03-29"
---

## 题目描述
如何处理类别不平衡问题？有哪些采样技术？应该用什么评估指标？

## 参考答案

### 类别不平衡问题

**定义：** 不同类别的样本数量差异很大（如 99:1）

**问题：** Accuracy 会误导（全部预测多数类即可得高分）

```python
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import cross_val_score

# 创建不平衡数据
X, y = make_classification(
    n_samples=1000,
    n_features=20,
    n_informative=10,
    n_classes=2,
    weights=[0.99, 0.01],  # 99% vs 1%
    random_state=42
)

print(f"Class distribution: {np.bincount(y)}")
print(f"Ratio: {np.bincount(y)[0] / np.bincount(y)[1]:.1f}:1")

# ❌ Accuracy 误导
from sklearn.dummy import DummyClassifier
dummy = DummyClassifier(strategy='most_frequent')
score = cross_val_score(dummy, X, y, cv=5, scoring='accuracy').mean()
print(f"Dummy accuracy (always predict majority): {score:.4f}")  # 0.99!
```

### 采样技术

```python
from imblearn.over_sampling import SMOTE, RandomOverSampler, ADASYN
from imblearn.under_sampling import RandomUnderSampler, NearMiss
from imblearn.combine import SMOTETomek

# 1. 过采样（增加少数类）
ros = RandomOverSampler(random_state=42)
X_ros, y_ros = ros.fit_resample(X, y)

# 2. SMOTE（合成少数类）
smote = SMOTE(random_state=42)
X_smote, y_smote = smote.fit_resample(X, y)

# 3. 欠采样（减少多数类）
rus = RandomUnderSampler(random_state=42)
X_rus, y_rus = rus.fit_resample(X, y)

# 4. 组合方法
smote_tomek = SMOTETomek(random_state=42)
X_st, y_st = smote_tomek.fit_resample(X, y)

print(f"Original: {np.bincount(y)}")
print(f"Over-sampled: {np.bincount(y_ros)}")
print(f"SMOTE: {np.bincount(y_smote)}")
print(f"Under-sampled: {np.bincount(y_rus)}")
```

### 类别权重

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

# 自动平衡权重
clf_balanced = RandomForestClassifier(
    class_weight='balanced',  # 根据频率自动调整
    random_state=42
)

# 手动设置权重
clf_weighted = RandomForestClassifier(
    class_weight={0: 1, 1: 100},  # 少数类权重高
    random_state=42
)

# 权重计算公式
# weight_i = n_samples / (n_classes * n_samples_i)
```

### 评估指标

```python
from sklearn.metrics import (
    classification_report, confusion_matrix,
    precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score,
    precision_recall_curve
)

# 不用 Accuracy，使用：

# 1. Precision, Recall, F1
print(classification_report(y_test, y_pred))

# 2. ROC-AUC
roc_auc = roc_auc_score(y_test, y_proba)
print(f"ROC-AUC: {roc_auc:.4f}")

# 3. PR-AUC (更适合不平衡)
pr_auc = average_precision_score(y_test, y_proba)
print(f"PR-AUC: {pr_auc:.4f}")

# 4. 特定阈值下的指标
threshold = 0.3  # 降低阈值提高 Recall
y_pred_custom = (y_proba >= threshold).astype(int)
print(f"Recall at threshold {threshold}: {recall_score(y_test, y_pred_custom):.4f}")
```

### 实际场景

```python
# 场景：欺诈检测（0.1% 欺诈率）

from sklearn.pipeline import Pipeline
from imblearn.pipeline import Pipeline as ImbPipeline

# 方案 1: SMOTE + 分类器
pipeline = ImbPipeline([
    ('smote', SMOTE(random_state=42)),
    ('clf', RandomForestClassifier(class_weight='balanced'))
])

# 方案 2: 只用类别权重
pipeline = Pipeline([
    ('clf', RandomForestClassifier(
        class_weight='balanced',
        min_samples_leaf=10  # 防止过拟合少数类
    ))
])

# 方案 3: 阈值调整
clf = RandomForestClassifier(class_weight='balanced')
clf.fit(X_train, y_train)
y_proba = clf.predict_proba(X_test)[:, 1]

# 根据业务成本选择阈值
cost_fp = 1   # 误报成本
cost_fn = 100  # 漏报成本
optimal_threshold = cost_fp / (cost_fp + cost_fn)
y_pred = (y_proba >= optimal_threshold).astype(int)
```

## 考察重点
- ✅ 理解类别不平衡问题
- ✅ 掌握采样技术
- ✅ 了解合适的评估指标
- ✅ 能够应用类别权重
- ✅ 具备业务思维（成本敏感）

## 更新历史
- v1 (2026-03-29): 初始版本
