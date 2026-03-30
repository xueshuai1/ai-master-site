# 简单神经网络

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`ML` `深度学习` `机器学习` `神经网络` `激活函数`

**摘要**: summary: "神经网络基础，考察候选人对反向传播和激活函数的理解"

---
---
order: 16
summary: "神经网络基础，考察候选人对反向传播和激活函数的理解"
title: "Neural Network Basics (神经网络基础)"
category: "ML"
roles: [算法工程师，数据科学家，机器学习工程师]
zones: [深度学习，神经网络]
difficulty: "⭐⭐⭐⭐"
tags: [Neural Network, Backpropagation, Activation Functions, Gradient Descent]
source: "https://www.simplilearn.com/tutorials/machine-learning-tutorial/machine-learning-interview-questions"
createdAt: "2026-03-29"
---

## 题目描述
请解释神经网络的基本原理。什么是反向传播？常用激活函数有哪些？如何初始化权重？

## 参考答案

### 神经网络结构

**组成：**
- **输入层：** 接收特征
- **隐藏层：** 特征变换
- **输出层：** 产生预测

**前向传播：**
```
z = W × x + b
a = σ(z)
```

```python
import numpy as np
import matplotlib.pyplot as plt
from tensorflow import keras
from tensorflow.keras import layers

# 简单神经网络
model = keras.Sequential([
    layers.Dense(64, activation='relu', input_shape=(10,)),
    layers.Dropout(0.3),
    layers.Dense(32, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])

model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)

model.summary()
```

### 激活函数

```python
def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def relu(x):
    return np.maximum(0, x)

def tanh(x):
    return np.tanh(x)

def leaky_relu(x, alpha=0.01):
    return np.where(x > 0, x, alpha * x)

def softmax(x):
    exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=1, keepdims=True)

# 可视化
x = np.linspace(-5, 5, 100)

plt.figure(figsize=(14, 4))

plt.subplot(1, 4, 1)
plt.plot(x, sigmoid(x))
plt.title('Sigmoid')
plt.grid(True, alpha=0.3)

plt.subplot(1, 4, 2)
plt.plot(x, relu(x))
plt.title('ReLU')
plt.grid(True, alpha=0.3)

plt.subplot(1, 4, 3)
plt.plot(x, tanh(x))
plt.title('Tanh')
plt.grid(True, alpha=0.3)

plt.subplot(1, 4, 4)
plt.plot(x, leaky_relu(x))
plt.title('Leaky ReLU')
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 选择建议：
# - 隐藏层：ReLU (默认), Leaky ReLU
# - 二分类输出：Sigmoid
# - 多分类输出：Softmax
# - 回归输出：Linear
```

### 反向传播

```python
# 链式法则
# ∂L/∂W = ∂L/∂a × ∂a/∂z × ∂z/∂W

# 简化示例
def backward_pass_simple():
    """简化的反向传播"""
    # 前向
    x = np.array([1.0, 2.0])
    W = np.array([[0.5, 0.3], [0.2, 0.4]])
    b = np.array([0.1, 0.2])
    
    z = W @ x + b
    a = sigmoid(z)
    
    # 假设损失 L = (a - y)²
    y = np.array([1.0, 0.0])
    dL_da = 2 * (a - y)
    
    # 反向
    da_dz = a * (1 - a)  # sigmoid 导数
    dL_dz = dL_da * da_dz
    
    dz_dW = x
    dL_dW = np.outer(dL_dz, dz_dW)
    
    return dL_dW

grad = backward_pass_simple()
print(f"Gradient: {grad}")
```

### 权重初始化

```python
from tensorflow.keras import initializers

# 1. 随机初始化
init_random = initializers.RandomNormal(mean=0, stddev=0.05)

# 2. Xavier/Glorot (适合 Tanh/Sigmoid)
init_xavier = initializers.GlorotUniform()

# 3. He 初始化 (适合 ReLU)
init_he = initializers.HeNormal()

# 4. LeCun 初始化
init_lecun = initializers.LecunNormal()

# 使用
layer = layers.Dense(64, activation='relu', kernel_initializer=init_he)

# 选择建议：
# - ReLU: He 初始化
# - Tanh/Sigmoid: Xavier
# - 默认：Glorot
```

## 考察重点
- ✅ 理解神经网络结构
- ✅ 掌握激活函数选择
- ✅ 了解反向传播原理
- ✅ 知道权重初始化方法
- ✅ 具备实现能力

## 更新历史
- v1 (2026-03-29): 初始版本
