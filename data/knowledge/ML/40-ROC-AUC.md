# ROC-AUC 曲线

## 1. 概述

ROC（Receiver Operating Characteristic）曲线和 AUC（Area Under Curve）是**二分类模型评估**的重要指标，衡量模型区分正负样本的能力。

**核心思想：** "区分能力"——真正例率 vs 假正例率。

### 1.1 核心概念

```
真正例率 (TPR) = TP / (TP + FN)  # 灵敏度
假正例率 (FPR) = FP / (FP + TN)  # 1 - 特异度
```

### 1.2 ROC 曲线

- X 轴：FPR（假正例率）
- Y 轴：TPR（真正例率）
- 对角线：随机猜测（AUC=0.5）
- 左上角：完美分类（AUC=1.0）

### 1.3 AUC 解释

| AUC | 解释 |
|-----|------|
| 0.5 | 随机猜测 |
| 0.7-0.8 | 可接受 |
| 0.8-0.9 | 优秀 |
| >0.9 | 卓越 |

## 2. Python 代码实现

```python
from sklearn.metrics import roc_curve, roc_auc_score
import matplotlib.pyplot as plt

y_true = [0, 1, 0, 1, 1, 0, 1, 0, 1, 1]
y_proba = [0.1, 0.9, 0.2, 0.4, 0.8, 0.3, 0.7, 0.2, 0.9, 0.6]

# 计算 AUC
auc = roc_auc_score(y_true, y_proba)
print(f"AUC: {auc:.4f}")

# ROC 曲线
fpr, tpr, thresholds = roc_curve(y_true, y_proba)

plt.figure(figsize=(8, 6))
plt.plot(fpr, tpr, label=f'ROC (AUC = {auc:.2f})')
plt.plot([0, 1], [0, 1], 'k--', label='随机猜测')
plt.xlabel('假正例率 (FPR)')
plt.ylabel('真正例率 (TPR)')
plt.title('ROC 曲线')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 最佳阈值
best_idx = (tpr - fpr).argmax()
best_threshold = thresholds[best_idx]
print(f"最佳阈值：{best_threshold:.4f}")
```

## 3. 总结

ROC-AUC 是分类评估标准：

**核心价值：**
1. 衡量区分能力
2. 阈值无关
3. 类别不平衡鲁棒
4. 直观可视化

**最佳实践：**
- AUC>0.8 为优秀
- 结合 PR 曲线
- 多分类用 One-vs-Rest
- 报告置信区间
