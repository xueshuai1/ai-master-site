# Adam 自适应矩估计

## 1. 概述

Adam（Adaptive Moment Estimation）是**自适应学习率优化算法**，结合动量和 RMSProp，是深度学习最常用的优化器。

**核心思想：** "自适应学习率"——每个参数有自己的学习率。

### 1.1 算法特点

| 特点 | 说明 |
|------|------|
| 动量 | 加速收敛 |
| 自适应 | 每参数学习率 |
| 偏差修正 | 初始阶段修正 |
| 超参数少 | 默认值通常有效 |

### 1.2 推荐默认值

```
learning_rate = 0.001
beta1 = 0.9      # 一阶矩衰减
beta2 = 0.999    # 二阶矩衰减
epsilon = 1e-8   # 数值稳定
```

### 1.3 适用场景

- 深度学习
- 大规模数据
- 稀疏梯度
- 非平稳目标

## 2. Python 代码实现

```python
import numpy as np

def adam(X, y, learning_rate=0.001, beta1=0.9, beta2=0.999, epsilon=1e-8, n_epochs=100):
    """Adam 优化器"""
    n_samples, n_features = X.shape
    theta = np.zeros(n_features)
    
    # 初始化矩估计
    m = np.zeros(n_features)  # 一阶矩
    v = np.zeros(n_features)  # 二阶矩
    t = 0  # 时间步
    
    for epoch in range(n_epochs):
        # 计算梯度
        y_pred = X.dot(theta)
        gradient = (1/n_samples) * X.T.dot(y_pred - y)
        
        t += 1
        
        # 更新矩估计
        m = beta1 * m + (1 - beta1) * gradient
        v = beta2 * v + (1 - beta2) * (gradient ** 2)
        
        # 偏差修正
        m_hat = m / (1 - beta1 ** t)
        v_hat = v / (1 - beta2 ** t)
        
        # 更新参数
        theta -= learning_rate * m_hat / (np.sqrt(v_hat) + epsilon)
    
    return theta

# 测试
X = np.random.randn(1000, 2)
y = X[:, 0] * 2 + X[:, 1] * 3 + np.random.randn(1000) * 0.1

theta = adam(X, y)
print(f"最优参数：{theta}")
```

## 3. 总结

Adam 是最常用优化器：

**核心价值：**
1. 自适应学习率
2. 动量加速
3. 默认值有效
4. 广泛使用

**最佳实践：**
- 默认参数通常有效
- 学习率可微调
- 适合深度学习
- 结合学习率调度
