# One-Hot 编码（独热编码）

## 1. 概述

One-Hot 编码是将**类别特征转换为二进制向量**的编码方法，每个类别对应一个独立的二进制特征。

**核心思想：** "一个类别一个特征"——将类别转换为数值。

### 1.1 编码示例

```
原始：[红，绿，蓝，红]
One-Hot:
红：[1, 0, 0]
绿：[0, 1, 0]
蓝：[0, 0, 1]
```

### 1.2 适用场景

- 名义类别（无顺序）
- 线性模型
- 神经网络
- 类别数较少

### 1.3 优缺点

**优点：**
- 简单直观
- 无顺序假设
- 广泛支持

**缺点：**
- 维度灾难
- 稀疏矩阵
- 类别多时不适用

## 2. Python 代码实现

```python
import numpy as np
from sklearn.preprocessing import OneHotEncoder
import pandas as pd

# 原始数据
data = [['红'], ['绿'], ['蓝'], ['红']]

# One-Hot 编码
encoder = OneHotEncoder(sparse_output=False)
X_encoded = encoder.fit_transform(data)
print(f"编码后形状：{X_encoded.shape}")
print(f"类别：{encoder.categories_}")

# pandas 实现
df = pd.DataFrame({'color': ['红', '绿', '蓝', '红']})
df_encoded = pd.get_dummies(df, columns=['color'])
print(df_encoded)
```

## 3. 总结

One-Hot 编码是基础编码方法：

**核心价值：**
1. 类别转数值
2. 无顺序假设
3. 简单通用
4. 广泛支持

**适用场景：**
- 名义类别
- 类别数少
- 线性模型
