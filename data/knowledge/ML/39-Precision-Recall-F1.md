# Precision/Recall/F1

## 1. 概述

Precision（精确率）、Recall（召回率）和 F1 是**分类模型评估**的核心指标，特别适用于不平衡数据。

**核心思想：** "查准与查全"——平衡精确和召回。

### 1.1 定义

```
精确率 (Precision) = TP / (TP + FP)
  - 预测为正的样本中有多少真正

召回率 (Recall) = TP / (TP + FN)
  - 真实为正的样本中有多少被找出

F1 分数 = 2 × P × R / (P + R)
  - 精确率和召回率的调和平均
```

### 1.2 权衡关系

- 高精确率 → 低召回率
- 高召回率 → 低精确率
- F1 平衡两者

### 1.3 适用场景

| 场景 | 优先指标 |
|------|----------|
| 垃圾邮件 | 精确率 |
| 疾病诊断 | 召回率 |
| 平衡 | F1 |

## 2. Python 代码实现

```python
from sklearn.metrics import precision_score, recall_score, f1_score, precision_recall_curve
import matplotlib.pyplot as plt

y_true = [0, 1, 0, 1, 1, 0, 1, 0, 1, 1]
y_pred = [0, 1, 0, 0, 1, 1, 1, 0, 1, 0]
y_proba = [0.1, 0.9, 0.2, 0.4, 0.8, 0.3, 0.7, 0.2, 0.9, 0.6]

# 计算指标
precision = precision_score(y_true, y_pred)
recall = recall_score(y_true, y_pred)
f1 = f1_score(y_true, y_pred)

print(f"精确率：{precision:.4f}")
print(f"召回率：{recall:.4f}")
print(f"F1 分数：{f1:.4f}")

# PR 曲线
precisions, recalls, thresholds = precision_recall_curve(y_true, y_proba)
plt.plot(recalls, precisions)
plt.xlabel('Recall')
plt.ylabel('Precision')
plt.title('PR 曲线')
plt.show()
```

## 3. 总结

P/R/F1 是分类核心指标：

**核心价值：**
1. 评估分类质量
2. 处理不平衡
3. 权衡查准查全
4. F1 综合评估

**最佳实践：**
- 不平衡数据看 F1
- 根据业务选择重点
- 结合多个指标
- 使用 PR 曲线
