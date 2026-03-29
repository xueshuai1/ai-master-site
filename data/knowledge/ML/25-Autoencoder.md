# Autoencoder 自编码器

## 1. 概述

Autoencoder（自编码器）是一种**神经网络降维算法**，通过编码器 - 解码器结构学习数据的压缩表示。

**核心思想：** "学习压缩"——通过重构任务学习有效表示。

### 1.1 结构

```
输入 → 编码器 → 潜在表示 → 解码器 → 重构输出
```

### 1.2 适用场景

- 非线性降维
- 特征学习
- 去噪
- 异常检测
- 生成模型

## 2. Python 代码实现

```python
import numpy as np
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.datasets import load_digits
import matplotlib.pyplot as plt

# 加载数据
digits = load_digits()
X = digits.data / 255.0  # 归一化

# 构建自编码器
input_dim = X.shape[1]
encoding_dim = 10

# 编码器
encoder = keras.Sequential([
    layers.Dense(64, activation='relu', input_shape=(input_dim,)),
    layers.Dense(encoding_dim, activation='relu')
])

# 解码器
decoder = keras.Sequential([
    layers.Dense(64, activation='relu', input_shape=(encoding_dim,)),
    layers.Dense(input_dim, activation='sigmoid')
])

# 自编码器
autoencoder = keras.Sequential([encoder, decoder])
autoencoder.compile(optimizer='adam', loss='mse')

# 训练
autoencoder.fit(X, X, epochs=50, batch_size=32, validation_split=0.2)

# 降维
X_encoded = encoder.predict(X)

# 重构
X_reconstructed = autoencoder.predict(X)

# 可视化
fig, axes = plt.subplots(2, 5, figsize=(12, 3))
for i, ax in enumerate(axes[0]):
    ax.imshow(X[i].reshape(8, 8), cmap='gray')
for i, ax in enumerate(axes[1]):
    ax.imshow(X_reconstructed[i].reshape(8, 8), cmap='gray')
plt.show()
```

## 3. 变体

- **Denoising Autoencoder**：去噪自编码器
- **Variational Autoencoder**：变分自编码器
- **Convolutional Autoencoder**：卷积自编码器

## 4. 优缺点

**优点：**
- 非线性降维
- 端到端学习
- 灵活架构
- 可扩展

**缺点：**
- 需要大量数据
- 训练时间长
- 需要调参
- 黑盒模型

## 5. 总结

Autoencoder 是神经网络降维方法：

**核心价值：**
1. 非线性降维
2. 端到端学习
3. 灵活架构
4. 多种变体

**适用场景：**
- 非线性降维
- 特征学习
- 去噪
- 异常检测
