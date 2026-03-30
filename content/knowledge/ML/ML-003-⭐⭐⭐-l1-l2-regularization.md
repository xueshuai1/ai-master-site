# 生成数据

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`ML` `深度学习` `机器学习` `神经网络` `损失函数`

**摘要**: summary: "L1 和 L2 正则化是最常用的正则化技术，考察候选人对正则化原理和特征选择的理解"

---
---
order: 3
summary: "L1 和 L2 正则化是最常用的正则化技术，考察候选人对正则化原理和特征选择的理解"
title: "L1 vs L2 Regularization (L1 与 L2 正则化对比)"
category: "ML"
roles: [算法工程师，数据科学家，机器学习工程师]
zones: [模型优化，特征工程]
difficulty: "⭐⭐⭐"
tags: [L1 Regularization, L2 Regularization, Lasso, Ridge, Feature Selection]
source: "https://www.interviewbit.com/machine-learning-interview-questions/, https://www.edureka.co/blog/interview-questions/machine-learning-interview-questions/"
createdAt: "2026-03-29"
---

## 题目描述
请详细解释 L1 正则化 (Lasso) 和 L2 正则化 (Ridge) 的区别。它们的数学原理是什么？各有什么优缺点？在什么场景下应该选择 L1 或 L2？

## 参考答案

### 数学原理

**原始损失函数：**
```
Loss = MSE = Σ(y_i - ŷ_i)²
```

**L2 正则化 (Ridge)：**
```
Loss = MSE + λ * Σ(w_j)²
     = Σ(y_i - ŷ_i)² + λ * ||w||₂²
```

**L1 正则化 (Lasso)：**
```
Loss = MSE + λ * Σ|w_j|
     = Σ(y_i - ŷ_i)² + λ * ||w||₁
```

**Elastic Net (L1 + L2)：**
```
Loss = MSE + λ₁ * Σ|w_j| + λ₂ * Σ(w_j)²
```

### 代码对比

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import Ridge, Lasso, ElasticNet, LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_regression

# 生成数据
X, y = make_regression(n_samples=100, n_features=20, 
                       n_informative=5, noise=10, random_state=42)

# 标准化
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 训练不同正则化模型
alpha = 0.1

linear = LinearRegression()
ridge = Ridge(alpha=alpha)
lasso = Lasso(alpha=alpha)
elastic = ElasticNet(alpha=alpha, l1_ratio=0.5)

linear.fit(X_scaled, y)
ridge.fit(X_scaled, y)
lasso.fit(X_scaled, y)
elastic.fit(X_scaled, y)

# 比较系数
plt.figure(figsize=(14, 5))

plt.subplot(1, 2, 1)
plt.plot(linear.coef_, 'o-', label='Linear', alpha=0.7)
plt.plot(ridge.coef_, 's-', label='Ridge (L2)', alpha=0.7)
plt.plot(lasso.coef_, '^-', label='Lasso (L1)', alpha=0.7)
plt.plot(elastic.coef_, 'd-', label='ElasticNet', alpha=0.7)
plt.xlabel('Feature Index')
plt.ylabel('Coefficient Value')
plt.title('Coefficient Comparison')
plt.legend()
plt.grid(True, alpha=0.3)

plt.subplot(1, 2, 2)
plt.bar(['Linear', 'Ridge', 'Lasso', 'ElasticNet'], 
        [np.sum(linear.coef_ != 0), 
         np.sum(ridge.coef_ != 0), 
         np.sum(lasso.coef_ != 0), 
         np.sum(elastic.coef_ != 0)])
plt.ylabel('Non-zero Coefficients')
plt.title('Feature Selection (Sparsity)')
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 打印非零系数数量
print(f"Lasso non-zero coefficients: {np.sum(lasso.coef_ != 0)}/20")
print(f"True informative features: 5")
```

### L1 vs L2 对比表

| 特性 | L1 (Lasso) | L2 (Ridge) |
|------|-----------|-----------|
| **惩罚项** | |w|₁ = Σ\|w_j\| | |w|₂² = Σw_j² |
| **稀疏性** | ✅ 产生稀疏解（特征选择） | ❌ 系数小但不为零 |
| **特征选择** | ✅ 自动进行 | ❌ 需要额外步骤 |
| **多重共线性** | 选择一个特征 | 平均分配权重 |
| **计算效率** | 需要特殊优化 (坐标下降) | 有解析解，计算快 |
| **几何解释** | 菱形约束，易在顶点相交 | 圆形约束，不易在轴上相交 |
| **适用场景** | 高维稀疏数据，特征选择 | 一般回归，防止过拟合 |

### 几何解释

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import minimize

# 绘制等高线和约束区域
def plot_regularization_geometry():
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    
    # 生成损失函数等高线
    w1 = np.linspace(-2, 2, 100)
    w2 = np.linspace(-2, 2, 100)
    W1, W2 = np.meshgrid(w1, w2)
    
    # 假设最优解在 (0.8, 0.6)
    loss = (W1 - 0.8)**2 + (W2 - 0.6)**2
    
    # L1 约束 (菱形)
    ax1 = axes[0]
    ax1.contour(W1, W2, loss, levels=20, cmap='Blues', alpha=0.6)
    
    # L1 约束区域
    l1_constraint = np.abs(W1) + np.abs(W2)
    ax1.contour(W1, W2, l1_constraint, levels=[1], colors='red', linewidths=3)
    ax1.plot([1, 0, -1, 0, 1], [0, 1, 0, -1, 0], 'r-', linewidth=2, label='L1 Constraint')
    ax1.set_title('L1 Regularization (Lasso)')
    ax1.set_xlabel('w1')
    ax1.set_ylabel('w2')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax1.set_aspect('equal')
    
    # L2 约束 (圆形)
    ax2 = axes[1]
    ax2.contour(W1, W2, loss, levels=20, cmap='Blues', alpha=0.6)
    
    # L2 约束区域
    l2_constraint = W1**2 + W2**2
    ax2.contour(W1, W2, l2_constraint, levels=[1], colors='red', linewidths=3)
    circle = plt.Circle((0, 0), 1, color='red', fill=False, linewidth=2, label='L2 Constraint')
    ax2.add_artist(circle)
    ax2.set_title('L2 Regularization (Ridge)')
    ax2.set_xlabel('w1')
    ax2.set_ylabel('w2')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    ax2.set_aspect('equal')
    
    plt.tight_layout()
    plt.show()

plot_regularization_geometry()
```

### 实际应用场景

#### 场景 1: 高维基因数据（特征 >> 样本）

```python
from sklearn.linear_model import LassoCV

# 基因数据：10000 个基因，100 个样本
# 只有少数基因与疾病相关

lasso_cv = LassoCV(
    alphas=np.logspace(-4, 2, 100),
    cv=5,
    max_iter=10000,
    random_state=42
)
lasso_cv.fit(X_gene, y_disease)

# 选择重要基因
selected_genes = np.where(lasso_cv.coef_ != 0)[0]
print(f"Selected {len(selected_genes)} important genes")
```

**选择 L1 原因：** 需要特征选择，识别关键基因

#### 场景 2: 房价预测（多重共线性）

```python
from sklearn.linear_model import RidgeCV

# 房屋特征：面积、房间数、卫生间数等高度相关

ridge_cv = RidgeCV(
    alphas=np.logspace(-4, 4, 100),
    cv=5,
    store_cv_values=True
)
ridge_cv.fit(X_house, y_price)

print(f"Best alpha: {ridge_cv.alpha_}")
print(f"All coefficients are non-zero: {np.all(ridge_cv.coef_ != 0)}")
```

**选择 L2 原因：** 特征都重要，需要处理共线性

#### 场景 3: Elastic Net（两者结合）

```python
from sklearn.linear_model import ElasticNetCV

# 相关特征组：选择整个组而非单个特征

elastic_cv = ElasticNetCV(
    l1_ratio=[0.1, 0.3, 0.5, 0.7, 0.9],
    alphas=np.logspace(-4, 2, 100),
    cv=5,
    random_state=42
)
elastic_cv.fit(X, y)

print(f"Best l1_ratio: {elastic_cv.l1_ratio_}")
print(f"Best alpha: {elastic_cv.alpha_}")
```

**选择 Elastic Net 原因：** 有相关特征组，需要分组选择

## 考察重点
- ✅ 理解 L1 和 L2 的数学原理
- ✅ 掌握稀疏性的几何解释
- ✅ 能够根据场景选择合适的正则化
- ✅ 了解 Elastic Net 的优势
- ✅ 具备实际调参和实现能力

## 延伸题目
- [[正则化路径分析]](./ML-006-regularization-path.md)
- [[特征选择方法对比]](./ML-007-feature-selection.md)
- [[超参数调优技巧]](./ML-008-hyperparameter-tuning.md)

## 延伸追问

### 追问 1: 为什么 L1 会产生稀疏解而 L2 不会？

**问题：** 从数学和几何角度解释 L1 的稀疏性。

**答案：**

**几何解释：**
- L1 约束区域是菱形，有尖角在坐标轴上
- 损失函数等高线与约束区域相切时，容易在尖角（坐标轴）处相交
- 在坐标轴上意味着某个 w_j = 0

**数学解释：**
- L1 的次梯度在 w_j = 0 处不连续
- 优化过程中，w_j 可能直接被推到 0
- L2 的梯度是连续的，w_j 只会趋近 0 但不等于 0

```python
# 可视化 L1 的次梯度
def l1_subgradient(w, lambda_):
    """L1 正则化的次梯度"""
    if w > 0:
        return lambda_
    elif w < 0:
        return -lambda_
    else:  # w = 0
        return [-lambda_, lambda_]  # 次梯度是一个区间

def l2_gradient(w, lambda_):
    """L2 正则化的梯度"""
    return 2 * lambda_ * w

# 在 w=0 附近
w_values = np.linspace(-1, 1, 100)
l1_grad = [l1_subgradient(w, 1)[0] if w != 0 else 0 for w in w_values]
l2_grad = [l2_gradient(w, 1) for w in w_values]

plt.figure(figsize=(10, 4))
plt.plot(w_values, l1_grad, label='L1 Subgradient', linewidth=2)
plt.plot(w_values, l2_grad, label='L2 Gradient', linewidth=2)
plt.axhline(y=0, color='k', linestyle='--', alpha=0.3)
plt.axvline(x=0, color='k', linestyle='--', alpha=0.3)
plt.xlabel('w')
plt.ylabel('Gradient')
plt.title('L1 vs L2 Gradient at w=0')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

### 追问 2: 如何选择正则化参数 λ (alpha)？

**问题：** 正则化强度的最佳实践是什么？

**答案：**

```python
from sklearn.linear_model import LassoCV, RidgeCV
import numpy as np

# 方法 1: 交叉验证 (推荐)
lasso_cv = LassoCV(
    alphas=None,  # 自动生成
    n_alphas=100,
    cv=5,
    random_state=42
)
lasso_cv.fit(X_train, y_train)
print(f"Best alpha: {lasso_cv.alpha_:.6f}")

# 方法 2: 网格搜索
from sklearn.model_selection import GridSearchCV

param_grid = {'alpha': np.logspace(-4, 4, 50)}
grid_search = GridSearchCV(Lasso(), param_grid, cv=5, scoring='neg_mean_squared_error')
grid_search.fit(X_train, y_train)
print(f"Best alpha: {grid_search.best_params_['alpha']:.6f}")

# 方法 3: 正则化路径可视化
alphas = np.logspace(-4, 2, 100)
coefs = []
for a in alphas:
    lasso = Lasso(alpha=a, max_iter=10000)
    lasso.fit(X_scaled, y)
    coefs.append(lasso.coef_)

plt.figure(figsize=(12, 6))
plt.plot(alphas, coefs)
plt.xscale('log')
plt.xlabel('Alpha (log scale)')
plt.ylabel('Coefficients')
plt.title('Lasso Regularization Path')
plt.axvline(x=lasso_cv.alpha_, color='red', linestyle='--', label='Best Alpha')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

### 追问 3: L1 正则化在深度学习中如何使用？

**问题：** 神经网络中如何实现 L1 正则化？

**答案：**

```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import regularizers

# 在 Keras 中使用 L1 正则化
model = keras.Sequential([
    keras.layers.Dense(
        128, 
        activation='relu',
        kernel_regularizer=regularizers.l1(0.001),  # L1 正则化
        bias_regularizer=regularizers.l1(0.001)
    ),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(
        64,
        activation='relu',
        kernel_regularizer=regularizers.l1_l2(l1=0.001, l2=0.001)  # L1+L2
    ),
    keras.layers.Dense(num_classes, activation='softmax')
])

# 自定义正则化
class SparseRegularizer(keras.regularizers.Regularizer):
    def __init__(self, l1_factor=0.01, l2_factor=0.01):
        self.l1_factor = l1_factor
        self.l2_factor = l2_factor
    
    def __call__(self, x):
        l1_norm = self.l1_factor * tf.reduce_sum(tf.abs(x))
        l2_norm = self.l2_factor * tf.reduce_sum(tf.square(x))
        return l1_norm + l2_norm

# 使用自定义正则化
model.add(keras.layers.Dense(64, activation='relu', 
                              kernel_regularizer=SparseRegularizer(0.001, 0.001)))

# 查看稀疏性
for layer in model.layers:
    if hasattr(layer, 'kernel'):
        weights = layer.get_weights()[0]
        sparsity = np.sum(weights == 0) / weights.size
        print(f"{layer.name}: {sparsity:.2%} sparse")
```

## 深入理解

**L1 和 L2 的本质区别：**

1. **L1 是特征选择器**：自动识别并剔除不重要的特征
2. **L2 是权重压缩器**：让所有权重都变小但不为零

**选择指南：**

| 场景 | 推荐 | 理由 |
|------|------|------|
| 特征选择 | L1 | 自动稀疏 |
| 预测精度优先 | L2 | 更稳定 |
| 特征相关 | Elastic Net | 分组选择 |
| 高维数据 | L1 | 降维 + 选择 |
| 深度学习 | L2 或 Dropout | L1 在 DL 中效果有限 |

## 更新历史
- v1 (2026-03-29): 初始版本，包含数学原理、代码示例和延伸追问
