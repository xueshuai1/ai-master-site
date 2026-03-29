# SGD 随机梯度下降

## 1. 概述

SGD（Stochastic Gradient Descent，随机梯度下降）是梯度下降的变体，**每次用一个样本**更新参数，适合大规模数据。

**核心思想：** "单样本更新"——快速但不稳定。

### 1.1 与批量 GD 对比

| 特性 | 批量 GD | SGD |
|------|---------|-----|
| 每次样本 | 全部 | 1 个 |
| 收敛速度 | 慢 | 快 |
| 稳定性 | 稳定 | 震荡 |
| 内存 | 高 | 低 |

### 1.2 优点

- 训练速度快
- 内存需求低
- 可在线学习
- 跳出局部最优

### 1.3 缺点

- 收敛不稳定
- 需要学习率衰减
- 方差大

## 2. Python 代码实现

```python
import numpy as np

def sgd(X, y, learning_rate=0.01, n_epochs=50):
    """随机梯度下降"""
    n_samples, n_features = X.shape
    theta = np.zeros(n_features)
    
    for epoch in range(n_epochs):
        # 打乱数据
        indices = np.random.permutation(n_samples)
        X_shuffled = X[indices]
        y_shuffled = y[indices]
        
        for i in range(n_samples):
            # 单样本梯度
            xi, yi = X_shuffled[i:i+1], y_shuffled[i]
            y_pred = xi.dot(theta)
            gradient = xi.T.dot(y_pred - yi)
            
            # 更新
            theta -= learning_rate * gradient
        
        # 学习率衰减
        learning_rate *= 0.95
    
    return theta

# 测试
X = np.random.randn(1000, 2)
y = X[:, 0] * 2 + X[:, 1] * 3 + np.random.randn(1000) * 0.1

theta = sgd(X, y, learning_rate=0.01, n_epochs=50)
print(f"最优参数：{theta}")
```

## 3. 总结

SGD 适合大规模数据：

**核心价值：**
1. 单样本快速更新
2. 适合大数据
3. 在线学习
4. 跳出局部最优

**最佳实践：**
- 学习率衰减
- 特征缩放
- 多轮迭代
- 监控收敛
