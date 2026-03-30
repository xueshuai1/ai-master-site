# 动量的作用：

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`ML` `RNN` `深度学习` `机器学习` `激活函数`

**摘要**: summary: "梯度下降是机器学习的核心优化算法，考察候选人对模型训练和优化原理的理解"

---
---
order: 9
summary: "梯度下降是机器学习的核心优化算法，考察候选人对模型训练和优化原理的理解"
title: "Gradient Descent and Variants (梯度下降及其变体)"
category: "ML"
roles: [算法工程师，数据科学家，机器学习工程师]
zones: [优化算法，模型训练]
difficulty: "⭐⭐⭐⭐"
tags: [Gradient Descent, SGD, Adam, Optimization, Learning Rate]
source: "https://www.upgrad.com/blog/machine-learning-interview-questions-answers/, https://www.simplilearn.com/tutorials/machine-learning-tutorial/machine-learning-interview-questions"
createdAt: "2026-03-29"
---

## 题目描述
请详细解释梯度下降 (Gradient Descent) 的原理。Batch GD、Stochastic GD、Mini-batch GD 有什么区别？Adam、RMSprop 等自适应优化算法的原理是什么？如何选择学习率？

## 参考答案

### 梯度下降原理

**核心思想：** 沿损失函数梯度的反方向更新参数，逐步找到最小值。

**更新公式：**
```
θ = θ - α × ∇J(θ)

θ: 模型参数
α: 学习率 (learning rate)
∇J(θ): 损失函数关于参数的梯度
```

### 三种梯度下降对比

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import SGDRegressor
from sklearn.preprocessing import StandardScaler

def compare_gradient_descent_variants(X, y, n_iterations=100):
    """比较三种梯度下降变体"""
    
    # 1. Batch Gradient Descent (批量梯度下降)
    # 使用全部数据计算梯度
    def batch_gd(X, y, lr=0.01, n_iter=100):
        m, n = X.shape
        theta = np.zeros(n)
        losses = []
        
        for i in range(n_iter):
            gradients = (2/m) * X.T.dot(X.dot(theta) - y)
            theta = theta - lr * gradients
            loss = np.mean((X.dot(theta) - y)**2)
            losses.append(loss)
        
        return theta, losses
    
    # 2. Stochastic Gradient Descent (随机梯度下降)
    # 每次用一个样本更新
    def sgd(X, y, lr=0.01, n_iter=100):
        m, n = X.shape
        theta = np.zeros(n)
        losses = []
        
        for i in range(n_iter):
            idx = np.random.randint(m)
            gradient = 2 * X[idx].T.dot(X[idx].dot(theta) - y[idx])
            theta = theta - lr * gradient
            loss = np.mean((X.dot(theta) - y)**2)
            losses.append(loss)
        
        return theta, losses
    
    # 3. Mini-batch Gradient Descent (小批量梯度下降)
    # 每次用一小批样本更新
    def mini_batch_gd(X, y, batch_size=32, lr=0.01, n_iter=100):
        m, n = X.shape
        theta = np.zeros(n)
        losses = []
        
        for i in range(n_iter):
            indices = np.random.choice(m, batch_size, replace=False)
            X_batch, y_batch = X[indices], y[indices]
            gradients = (2/len(indices)) * X_batch.T.dot(X_batch.dot(theta) - y_batch)
            theta = theta - lr * gradients
            loss = np.mean((X.dot(theta) - y)**2)
            losses.append(loss)
        
        return theta, losses
    
    # 运行比较
    theta_batch, losses_batch = batch_gd(X, y, n_iter=n_iterations)
    theta_sgd, losses_sgd = sgd(X, y, n_iter=n_iterations)
    theta_mini, losses_mini = mini_batch_gd(X, y, n_iter=n_iterations)
    
    # 可视化
    plt.figure(figsize=(14, 5))
    
    plt.subplot(1, 2, 1)
    plt.plot(losses_batch, label='Batch GD', linewidth=2)
    plt.plot(losses_sgd, label='SGD', alpha=0.7)
    plt.plot(losses_mini, label='Mini-batch GD', alpha=0.7)
    plt.xlabel('Iteration')
    plt.ylabel('Loss')
    plt.title('Loss Convergence Comparison')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.subplot(1, 2, 2)
    plt.semilogy(losses_batch, label='Batch GD', linewidth=2)
    plt.semilogy(losses_sgd, label='SGD', alpha=0.7)
    plt.semilogy(losses_mini, label='Mini-batch GD', alpha=0.7)
    plt.xlabel('Iteration')
    plt.ylabel('Loss (log scale)')
    plt.title('Loss Convergence (Log Scale)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()
    
    return theta_batch, theta_sgd, theta_mini
```

### 对比表

| 特性 | Batch GD | SGD | Mini-batch GD |
|------|---------|-----|---------------|
| **每次更新样本数** | 全部 (m) | 1 | 批量 (通常 32-512) |
| **收敛速度** | 慢 | 快（初期） | 中等 |
| **收敛稳定性** | 稳定 | 震荡 | 较稳定 |
| **内存需求** | 高 | 低 | 中等 |
| **向量化优化** | 是 | 否 | 是 |
| **适用场景** | 小数据集 | 大数据集 | 一般情况（默认） |

### 自适应优化算法

#### 1. Momentum (动量法)

```python
def gradient_descent_with_momentum(X, y, lr=0.01, momentum=0.9, n_iter=100):
    """带动量的梯度下降"""
    m, n = X.shape
    theta = np.zeros(n)
    velocity = np.zeros(n)  # 速度（累积梯度）
    losses = []
    
    for i in range(n_iter):
        gradients = (2/m) * X.T.dot(X.dot(theta) - y)
        
        # 更新速度
        velocity = momentum * velocity - lr * gradients
        
        # 更新参数
        theta = theta + velocity
        
        loss = np.mean((X.dot(theta) - y)**2)
        losses.append(loss)
    
    return theta, losses

# 动量的作用：
# 1. 加速收敛（累积同方向梯度）
# 2. 减少震荡（平滑更新方向）
# 3. 帮助跳出局部最优
```

#### 2. RMSprop

```python
def rmsprop(X, y, lr=0.001, decay=0.9, epsilon=1e-8, n_iter=100):
    """RMSprop 优化器"""
    m, n = X.shape
    theta = np.zeros(n)
    cache = np.zeros(n)  # 梯度平方的指数加权平均
    losses = []
    
    for i in range(n_iter):
        gradients = (2/m) * X.T.dot(X.dot(theta) - y)
        
        # 更新缓存
        cache = decay * cache + (1 - decay) * gradients**2
        
        # 自适应学习率更新
        theta = theta - lr * gradients / (np.sqrt(cache) + epsilon)
        
        loss = np.mean((X.dot(theta) - y)**2)
        losses.append(loss)
    
    return theta, losses

# RMSprop 的特点：
# 1. 自适应学习率（梯度大的方向学习率小）
# 2. 适合非平稳目标
# 3. 对 RNN 特别有效
```

#### 3. Adam (Adaptive Moment Estimation)

```python
def adam(X, y, lr=0.001, beta1=0.9, beta2=0.999, epsilon=1e-8, n_iter=100):
    """Adam 优化器"""
    m, n = X.shape
    theta = np.zeros(n)
    first_moment = np.zeros(n)   # 梯度的一阶矩（均值）
    second_moment = np.zeros(n)  # 梯度的二阶矩（未中心化的方差）
    losses = []
    
    for t in range(1, n_iter + 1):
        gradients = (2/m) * X.T.dot(X.dot(theta) - y)
        
        # 更新一阶矩
        first_moment = beta1 * first_moment + (1 - beta1) * gradients
        
        # 更新二阶矩
        second_moment = beta2 * second_moment + (1 - beta2) * gradients**2
        
        # 偏差修正
        first_moment_corrected = first_moment / (1 - beta1**t)
        second_moment_corrected = second_moment / (1 - beta2**t)
        
        # 更新参数
        theta = theta - lr * first_moment_corrected / (np.sqrt(second_moment_corrected) + epsilon)
        
        loss = np.mean((X.dot(theta) - y)**2)
        losses.append(loss)
    
    return theta, losses

# Adam 的特点：
# 1. 结合 Momentum 和 RMSprop
# 2. 自适应学习率 + 动量
# 3. 默认参数通常就很好
# 4. 最常用的深度学习优化器
```

### 使用 sklearn 和 TensorFlow

```python
from sklearn.linear_model import SGDRegressor
from tensorflow import keras
from tensorflow.keras import optimizers

# sklearn SGD
sgd_reg = SGDRegressor(
    penalty='l2',           # 正则化
    alpha=0.0001,           # 正则化强度
    max_iter=1000,
    tol=1e-3,
    learning_rate='adaptive',  # 学习率策略
    eta0=0.01,              # 初始学习率
    random_state=42
)

# TensorFlow/Keras 优化器
model = keras.Sequential([
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dense(1)
])

# SGD with Momentum
model.compile(optimizer=optimizers.SGD(learning_rate=0.01, momentum=0.9),
              loss='mse')

# RMSprop
model.compile(optimizer=optimizers.RMSprop(learning_rate=0.001),
              loss='mse')

# Adam (默认推荐)
model.compile(optimizer=optimizers.Adam(learning_rate=0.001),
              loss='mse')

# AdamW (Adam with Weight Decay)
model.compile(optimizer=optimizers.AdamW(learning_rate=0.001, weight_decay=0.01),
              loss='mse')
```

### 学习率选择策略

```python
from sklearn.model_selection import learning_curve

# 方法 1: 学习率搜索
def find_optimal_learning_rate(model, X, y, lr_range=(1e-5, 1e0), n_points=20):
    """搜索最佳学习率"""
    lrs = np.logspace(np.log10(lr_range[0]), np.log10(lr_range[1]), n_points)
    losses = []
    
    for lr in lrs:
        model.set_params(learning_rate='constant', eta0=lr)
        model.fit(X, y)
        loss = np.mean((model.predict(X) - y)**2)
        losses.append(loss)
    
    plt.figure(figsize=(10, 4))
    plt.semilogx(lrs, losses, 'o-')
    plt.xlabel('Learning Rate')
    plt.ylabel('Loss')
    plt.title('Learning Rate vs Loss')
    plt.grid(True, alpha=0.3)
    
    best_lr = lrs[np.argmin(losses)]
    plt.axvline(x=best_lr, color='r', linestyle='--', label=f'Best: {best_lr:.6f}')
    plt.legend()
    plt.tight_layout()
    plt.show()
    
    return best_lr

# 方法 2: 学习率调度
from tensorflow.keras.callbacks import LearningRateScheduler, ReduceLROnPlateau

# 时间衰减
def time_decay(epoch, lr):
    return lr * (1 / (1 + 0.01 * epoch))

# 指数衰减
def exp_decay(epoch, lr):
    return lr * np.exp(-0.01 * epoch)

# 分段常数
def step_decay(epoch, lr):
    if epoch < 10:
        return 0.1
    elif epoch < 20:
        return 0.01
    else:
        return 0.001

# 回调
lr_scheduler = LearningRateScheduler(time_decay)
reduce_lr = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=5,
    min_lr=1e-7,
    verbose=1
)

# 方法 3: 学习率热身 (Warmup)
def warmup_cosine_decay(epoch, lr, warmup_epochs=5, max_lr=0.1):
    if epoch < warmup_epochs:
        return max_lr * (epoch + 1) / warmup_epochs
    else:
        from math import cos, pi
        return max_lr * 0.5 * (1 + cos(pi * (epoch - warmup_epochs) / 100))
```

## 考察重点
- ✅ 理解梯度下降的数学原理
- ✅ 掌握三种 GD 变体的区别
- ✅ 了解自适应优化算法的原理
- ✅ 能够选择合适的学习率
- ✅ 具备调参和优化能力

## 延伸题目
- [[学习率调度策略]](./ML-023-learning-rate-scheduling.md)
- [[优化算法对比]](./ML-024-optimizer-comparison.md)
- [[二阶优化方法]](./ML-025-second-order-optimization.md)

## 延伸追问

### 追问 1: Adam 为什么需要偏差修正？

**问题：** Adam 中的偏差修正项有什么作用？

**答案：**

```python
# 偏差修正的原因：
# 初始时刻，一阶矩和二阶矩都初始化为 0
# 这会导致早期的估计偏向 0

# 示例
beta1 = 0.9
gradients = [1.0, 1.0, 1.0]  # 恒定梯度

first_moment = 0
for t, g in enumerate(gradients, 1):
    first_moment = beta1 * first_moment + (1 - beta1) * g
    
    # 未修正
    print(f"t={t}: first_moment = {first_moment:.4f}")
    
    # 修正后
    corrected = first_moment / (1 - beta1**t)
    print(f"t={t}: corrected = {corrected:.4f}")

# 输出：
# t=1: first_moment = 0.1000, corrected = 1.0000
# t=2: first_moment = 0.1900, corrected = 1.0000
# t=3: first_moment = 0.2710, corrected = 1.0000

# 修正后，早期估计更准确
```

### 追问 2: 为什么 Adam 是默认推荐？

**问题：** Adam 相比其他优化器有什么优势？

**答案：**

```python
# Adam 的优势：
# 1. 自适应学习率（不同参数不同学习率）
# 2. 动量加速（累积历史梯度）
# 3. 对超参数不敏感（默认参数通常有效）
# 4. 收敛快

# 对比实验
from sklearn.datasets import make_classification
from sklearn.neural_network import MLPClassifier

X, y = make_classification(n_samples=1000, n_features=20, random_state=42)
X = StandardScaler().fit_transform(X)

optimizers_to_test = ['sgd', 'adam', 'rmsprop']

for opt in optimizers_to_test:
    model = MLPClassifier(
        hidden_layer_sizes=(100,),
        solver=opt,
        max_iter=100,
        random_state=42
    )
    model.fit(X, y)
    print(f"{opt}: accuracy = {model.score(X, y):.4f}, iterations = {model.n_iter_}")

# 通常 Adam 收敛最快，性能稳定
```

### 追问 3: 梯度消失和梯度爆炸如何解决？

**问题：** 深度网络中的梯度问题如何处理？

**答案：**

```python
# 梯度消失/爆炸的原因：
# 深层网络中，梯度连乘导致指数级变化

# 解决方案：

# 1. 合适的激活函数
from tensorflow.keras.layers import ReLU, LeakyReLU, ELU

# 避免 Sigmoid/Tanh（容易饱和）
# 使用 ReLU 及其变体

# 2. 权重初始化
from tensorflow.keras.initializers import HeNormal, GlorotUniform

# He 初始化（ReLU）
layer = Dense(128, kernel_initializer=HeNormal())

# Xavier 初始化（Tanh/Sigmoid）
layer = Dense(128, kernel_initializer=GlorotUniform())

# 3. Batch Normalization
from tensorflow.keras.layers import BatchNormalization

model.add(Dense(128))
model.add(BatchNormalization())  # 标准化激活值
model.add(ReLU())

# 4. 梯度裁剪（RNN）
from tensorflow.keras.optimizers import Adam

optimizer = Adam(clipnorm=1.0)  # 限制梯度范数
# 或
optimizer = Adam(clipvalue=0.5)  # 限制梯度值

# 5. Residual Connection（残差连接）
# 让梯度直接流过
```

## 深入理解

**优化器选择指南：**
- 默认用 Adam
- 需要更好泛化用 SGD+Momentum
- RNN 用 RMSprop 或 Adam
- 大规模用 AdamW

**学习率是关键：**
- 太大：不收敛
- 太小：收敛慢
- 用调度器动态调整

## 更新历史
- v1 (2026-03-29): 初始版本
