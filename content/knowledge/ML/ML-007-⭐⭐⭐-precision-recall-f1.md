# 示例

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`ML` `机器学习` `AI`

**摘要**: summary: "精确率、召回率、F1 分数是分类问题的核心评估指标，考察候选人对模型评估的深入理解"

---
---
order: 7
summary: "精确率、召回率、F1 分数是分类问题的核心评估指标，考察候选人对模型评估的深入理解"
title: "Precision, Recall, and F1 Score (精确率、召回率与 F1 分数)"
category: "ML"
roles: [算法工程师，数据科学家，机器学习工程师]
zones: [模型评估，分类问题]
difficulty: "⭐⭐⭐"
tags: [Precision, Recall, F1 Score, Classification Metrics, Confusion Matrix]
source: "https://www.interviewbit.com/machine-learning-interview-questions/, https://www.upgrad.com/blog/machine-learning-interview-questions-answers/"
createdAt: "2026-03-29"
---

## 题目描述
请详细解释 Precision（精确率）、Recall（召回率）和 F1 Score 的定义、计算方法和应用场景。在什么情况下应该优先优化 Precision？什么情况下应该优先优化 Recall？如何权衡两者？

## 参考答案

### 混淆矩阵 (Confusion Matrix)

```
                    预测
                正例    负例
实际    正例    TP      FN
        负例    FP      TN

TP (True Positive): 真正例 - 实际为正，预测为正
FN (False Negative): 假负例 - 实际为正，预测为负
FP (False Positive): 假正例 - 实际为负，预测为正
TN (True Negative): 真负例 - 实际为负，预测为负
```

### 核心指标定义

```python
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix, classification_report
import matplotlib.pyplot as plt

def calculate_metrics(y_true, y_pred):
    """计算分类指标"""
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    
    # 精确率 (Precision): 预测为正的样本中有多少是真的正
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    
    # 召回率 (Recall): 实际为正的样本中有多少被正确预测
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    
    # F1 Score: 精确率和召回率的调和平均
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    # 准确率 (Accuracy)
    accuracy = (tp + tn) / (tp + tn + fp + fn)
    
    print(f"Confusion Matrix:")
    print(f"  TP={tp}, FP={fp}")
    print(f"  FN={fn}, TN={tn}\n")
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}  ← 预测为正中有多少是真的")
    print(f"Recall:    {recall:.4f}  ← 实际正中有多少被找到")
    print(f"F1 Score:  {f1:.4f}  ← 精确率和召回率的平衡")
    
    return precision, recall, f1, accuracy

# 示例
y_true = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]
y_pred = [1, 1, 0, 1, 0, 0, 0, 1, 0, 0]

calculate_metrics(y_true, y_pred)
```

### 指标对比表

| 指标 | 公式 | 关注点 | 适用场景 |
|------|------|--------|----------|
| **Accuracy** | (TP+TN)/(TP+TN+FP+FN) | 整体正确率 | 类别平衡 |
| **Precision** | TP/(TP+FP) | 预测质量 | 假阳性成本高 |
| **Recall** | TP/(TP+FN) | 查全率 | 假阴性成本高 |
| **F1 Score** | 2×(P×R)/(P+R) | 平衡 P 和 R | 类别不平衡 |

### 实际场景分析

#### 场景 1: 垃圾邮件检测 → 优先 Precision

```python
# 假阳性成本高：重要邮件被误判为垃圾邮件
# 宁可放过垃圾邮件，不能误杀正常邮件

from sklearn.metrics import precision_recall_curve

# 提高阈值，减少 FP
threshold = 0.7  # 默认 0.5
y_pred = (y_proba >= threshold).astype(int)

# 结果：Precision 提高，Recall 降低
# 正常邮件很少被误判，但部分垃圾邮件可能漏掉
```

#### 场景 2: 疾病诊断 → 优先 Recall

```python
# 假阴性成本高：漏诊可能导致生命危险
# 宁可误诊，不能漏诊

# 降低阈值，增加敏感度
threshold = 0.3
y_pred = (y_proba >= threshold).astype(int)

# 结果：Recall 提高，Precision 降低
# 几乎所有患者都被检出，但部分健康人被误判
```

#### 场景 3: 欺诈检测 → 平衡 F1

```python
# 既要减少漏检（Recall），也要减少误报（Precision）
# 使用 F1 Score 或 F-beta Score

from sklearn.metrics import fbeta_score

# F2 Score: 更重视 Recall
f2 = fbeta_score(y_true, y_pred, beta=2)

# F0.5 Score: 更重视 Precision
f05 = fbeta_score(y_true, y_pred, beta=0.5)

print(f"F2 Score (Recall 重要): {f2:.4f}")
print(f"F0.5 Score (Precision 重要): {f05:.4f}")
```

### 阈值选择策略

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import precision_recall_curve, roc_curve

# 获取不同阈值下的 Precision 和 Recall
precision, recall, thresholds = precision_recall_curve(y_true, y_proba)

# 可视化
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.plot(thresholds, precision[:-1], label='Precision')
plt.plot(thresholds, recall[:-1], label='Recall')
plt.xlabel('Threshold')
plt.ylabel('Score')
plt.title('Precision and Recall vs Threshold')
plt.legend()
plt.grid(True, alpha=0.3)

plt.subplot(1, 2, 2)
plt.plot(recall, precision)
plt.xlabel('Recall')
plt.ylabel('Precision')
plt.title('Precision-Recall Curve')
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 自动选择最佳阈值
# 方法 1: F1 最大
f1_scores = 2 * (precision[:-1] * recall[:-1]) / (precision[:-1] + recall[:-1])
best_idx = np.argmax(f1_scores)
best_threshold_f1 = thresholds[best_idx]
print(f"Best threshold (max F1): {best_threshold_f1:.4f}")

# 方法 2: 业务驱动
def find_optimal_threshold(y_true, y_proba, cost_fn=10, cost_fp=1):
    """根据成本找到最佳阈值"""
    thresholds = np.arange(0.1, 0.9, 0.05)
    best_cost = float('inf')
    best_thresh = 0.5
    
    for thresh in thresholds:
        y_pred = (y_proba >= thresh).astype(int)
        tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
        cost = fn * cost_fn + fp * cost_fp
        if cost < best_cost:
            best_cost = cost
            best_thresh = thresh
    
    return best_thresh, best_cost

optimal_thresh, min_cost = find_optimal_threshold(y_true, y_proba)
print(f"Cost-based optimal threshold: {optimal_thresh:.4f}")
```

### 类别不平衡时的指标选择

```python
from sklearn.datasets import make_classification
from imblearn.over_sampling import SMOTE

# 创建不平衡数据
X, y = make_classification(
    n_samples=1000, n_features=20,
    n_classes=2, weights=[0.95, 0.05],  # 95% vs 5%
    random_state=42
)

# ❌ Accuracy 会误导
# 全部预测为多数类，Accuracy = 95%，但模型无用

# ✅ 使用 Precision, Recall, F1
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier()
scores = cross_val_score(model, X, y, cv=5, scoring='f1')
print(f"F1 Score: {scores.mean():.4f} (+/- {scores.std()*2:.4f})")

# 或者使用 AUC-PR (Precision-Recall AUC)
from sklearn.metrics import average_precision_score
from sklearn.model_selection import cross_val_predict

y_proba = cross_val_predict(model, X, y, cv=5, method='predict_proba')[:, 1]
auc_pr = average_precision_score(y, y_proba)
print(f"AUC-PR: {auc_pr:.4f}")
```

## 考察重点
- ✅ 理解 Precision、Recall、F1 的定义和计算
- ✅ 掌握不同场景下的指标选择
- ✅ 能够根据业务需求调整阈值
- ✅ 了解类别不平衡时的评估策略
- ✅ 具备实际分析和优化能力

## 延伸题目
- [[ROC 曲线与 AUC]](./ML-017-roc-auc.md)
- [[类别不平衡处理]](./ML-018-class-imbalance.md)
- [[多分类评估指标]](./ML-019-multiclass-metrics.md)

## 延伸追问

### 追问 1: 为什么 F1 使用调和平均而不是算术平均？

**问题：** F1 为什么是 2×P×R/(P+R) 而不是 (P+R)/2？

**答案：**

```python
# 调和平均 vs 算术平均

def harmonic_mean(p, r):
    return 2 * p * r / (p + r) if (p + r) > 0 else 0

def arithmetic_mean(p, r):
    return (p + r) / 2

# 示例：极端情况
p, r = 1.0, 0.0  # 完美精确率，零召回率

print(f"Precision: {p}, Recall: {r}")
print(f"Harmonic Mean (F1): {harmonic_mean(p, r):.4f}")  # 0
print(f"Arithmetic Mean: {arithmetic_mean(p, r):.4f}")   # 0.5

# 调和平均的特性：
# 1. 对极端值更敏感
# 2. P 或 R 为 0 时，F1 为 0（合理）
# 3. 鼓励 P 和 R 都高，而不是一个极高一个极低

# 示例：两个模型
model1 = (0.9, 0.1)  # P=0.9, R=0.1
model2 = (0.5, 0.5)  # P=0.5, R=0.5

print(f"\nModel 1 (不平衡): F1 = {harmonic_mean(*model1):.4f}")
print(f"Model 2 (平衡):   F1 = {harmonic_mean(*model2):.4f}")
# Model 2 的 F1 更高，鼓励平衡
```

### 追问 2: 多分类问题如何计算 Precision 和 Recall？

**问题：** 多分类场景下指标如何计算？

**答案：**

```python
from sklearn.metrics import precision_score, recall_score, f1_score

# 多分类指标计算方式
y_true = [0, 1, 2, 0, 1, 2]
y_pred = [0, 2, 2, 0, 1, 1]

# Micro: 全局计算 TP, FP, FN
precision_micro = precision_score(y_true, y_pred, average='micro')
print(f"Micro Precision: {precision_micro:.4f}")

# Macro: 各类别独立计算后平均
precision_macro = precision_score(y_true, y_pred, average='macro')
print(f"Macro Precision: {precision_macro:.4f}")

# Weighted: 各类别独立计算后加权平均（按支持度）
precision_weighted = precision_score(y_true, y_pred, average='weighted')
print(f"Weighted Precision: {precision_weighted:.4f}")

# 选择建议：
# - Micro: 关注整体性能
# - Macro: 关注各类别平等
# - Weighted: 考虑类别不平衡
```

### 追问 3: 如何向非技术人员解释 Precision 和 Recall？

**问题：** 如何用通俗语言解释这两个指标？

**答案：**

```
钓鱼比喻：

Precision (精确率):
"你钓上来的鱼中，有多少是真的鱼？"
- 高 Precision = 很少钓到垃圾

Recall (召回率):
"湖里所有的鱼中，你钓到了多少？"
- 高 Recall = 很少漏掉鱼

场景：
- 钓鱼比赛（数量重要）→ 优先 Recall
- 钓鱼食用（质量重要）→ 优先 Precision
- 正常钓鱼 → 平衡 F1

医疗比喻：
- Precision: "诊断为患病的人中，有多少真患病？"
- Recall: "所有患病的人中，有多少被诊断出来？"
```

## 深入理解

**核心要点：**
1. 没有"最好"的指标，只有"最合适"的指标
2. 指标选择取决于业务目标和成本结构
3. 阈值调整是优化指标的重要手段
4. 类别不平衡时，Accuracy 会误导

## 更新历史
- v1 (2026-03-29): 初始版本
