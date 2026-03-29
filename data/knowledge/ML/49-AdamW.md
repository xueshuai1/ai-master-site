# AdamW 自适应矩估计权重衰减

## 1. 概述

AdamW 是 Adam 的改进版本，**正确实现权重衰减**，在深度学习中表现优于 Adam。

**核心思想：** "解耦权重衰减"——权重衰减不与自适应学习率耦合。

### 1.1 与 Adam 区别

| 特性 | Adam | AdamW |
|------|------|-------|
| L2 正则 | 耦合 | 解耦 |
| 泛化能力 | 好 | 更好 |
| 推荐度 | 中 | 高 |

### 1.2 核心改进

**Adam（错误实现）：**
```
θ = θ - α × (m_hat / (sqrt(v_hat) + ε) + λ × θ)
```

**AdamW（正确实现）：**
```
θ = θ - α × (m_hat / (sqrt(v_hat) + ε)) - α × λ × θ
```

### 1.3 适用场景

- 深度学习
- Transformer
- 需要权重衰减
- 提高泛化

## 2. Python 代码实现

```python
import numpy as np

def adamw(X, y, learning_rate=0.001, weight_decay=0.01, 
          beta1=0.9, beta2=0.999, epsilon=1e-8, n_epochs=100):
    """AdamW 优化器"""
    n_samples, n_features = X.shape
    theta = np.zeros(n_features)
    
    m = np.zeros(n_features)
    v = np.zeros(n_features)
    t = 0
    
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
        
        # AdamW 更新（解耦权重衰减）
        theta -= learning_rate * (m_hat / (np.sqrt(v_hat) + epsilon) + weight_decay * theta)
    
    return theta

# 测试
X = np.random.randn(1000, 2)
y = X[:, 0] * 2 + X[:, 1] * 3 + np.random.randn(1000) * 0.1

theta = adamw(X, y, weight_decay=0.01)
print(f"最优参数：{theta}")
```

## 3. 总结

AdamW 是改进版 Adam：

**核心价值：**
1. 正确权重衰减
2. 更好泛化
3. Transformer 标配
4. 推荐使用

**最佳实践：**
- weight_decay 通常 0.01
- 其他参数同 Adam
- 深度学习首选
- 配合学习率调度
