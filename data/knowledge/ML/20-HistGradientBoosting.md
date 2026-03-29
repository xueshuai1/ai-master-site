# HistGradientBoosting 直方图梯度提升

## 1. 概述

HistGradientBoosting 是 scikit-learn 0.21+ 引入的**基于直方图的梯度提升算法**，灵感来自 LightGBM。它将连续特征离散化为直方图 bins，大幅提升训练速度，特别适合大规模数据。

**核心思想：** "离散化加速"——用直方图近似替代精确分裂点搜索。

### 1.1 主要特性

| 特性 | 说明 |
|------|------|
| 直方图算法 | 特征离散化为 bins |
| 原生缺失值 | 自动处理缺失值 |
| 无外部依赖 | scikit-learn 内置 |
| 内存高效 | 降低内存消耗 |
| 快速训练 | 比传统 GBDT 快 |

### 1.2 适用场景

- 大规模数据
- 需要快速训练
- scikit-learn 生态
- 内存受限
- 快速原型

## 2. 算法原理

### 2.1 直方图构建

将连续特征值映射到固定数量的 bins：

```
原始值：[0.1, 0.5, 1.2, 3.4, 5.6, ...]
Bins:    [0,  1,  2,  3,  4,  ...]  (假设 256 bins)
```

**优势：**
- 分裂点搜索从 O(n) 降到 O(bins)
- 内存消耗降低
- 支持并行优化

### 2.2 缺失值处理

缺失值自动学习分裂方向：

```
if 特征值 缺失:
    走向左子树  # 或右子树，由学习决定
else:
    正常分裂
```

## 3. Python 代码实现

```python
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
from sklearn.datasets import make_classification, make_regression

# ============ 分类 ============
X, y = make_classification(n_samples=10000, n_features=20, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# 创建模型
hgb_clf = HistGradientBoostingClassifier(
    max_iter=100,
    learning_rate=0.1,
    max_depth=None,       # None 表示不限制
    max_leaf_nodes=31,    # 限制叶子数
    min_samples_leaf=20,
    l2_regularization=0,
    random_state=42
)

hgb_clf.fit(X_train, y_train)
y_pred = hgb_clf.predict(X_test)
print(f"准确率：{accuracy_score(y_test, y_pred):.4f}")

# ============ 回归 ============
X_reg, y_reg = make_regression(n_samples=10000, n_features=10)
X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(X_reg, y_reg, test_size=0.2)

hgb_reg = HistGradientBoostingRegressor(max_iter=100, random_state=42)
hgb_reg.fit(X_train_reg, y_train_reg)
y_pred_reg = hgb_reg.predict(X_test_reg)
print(f"MSE: {mean_squared_error(y_test_reg, y_pred_reg):.4f}")

# ============ 处理缺失值 ============
X_with_nan = X.copy()
X_with_nan[np.random.random(X.shape) < 0.1] = np.nan  # 10% 缺失

hgb_nan = HistGradientBoostingClassifier(random_state=42)
hgb_nan.fit(X_with_nan, y)  # 自动处理缺失值！
print(f"含缺失值准确率：{hgb_nan.score(X_with_nan, y):.4f}")
```

## 4. 超参数

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `max_iter` | 迭代次数 | 100-500 |
| `learning_rate` | 学习率 | 0.01-0.3 |
| `max_leaf_nodes` | 最大叶子数 | 31-255 |
| `min_samples_leaf` | 叶最小样本 | 20-100 |
| `l2_regularization` | L2 正则化 | 0-10 |
| `max_bins` | 最大 bins 数 | 255 |

## 5. 优缺点

**优点：**
- 训练速度快
- 内存消耗低
- 原生缺失值处理
- scikit-learn 内置

**缺点：**
- 功能相对简单
- 精度略低于 XGBoost
- 类别特征需编码

## 6. 总结

HistGradientBoosting 是 scikit-learn 的高效 GBDT 实现：

**核心价值：**
1. 直方图加速训练
2. 原生缺失值处理
3. 无外部依赖
4. 内存高效

**适用场景：**
- 大规模数据
- scikit-learn 生态
- 快速原型
- 内存受限
