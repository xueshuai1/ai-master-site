# Bootstrap 自助采样法

## 1. 概述

Bootstrap 是一种**有放回抽样**的统计方法，通过重复采样估计统计量的分布和置信区间。

**核心思想：** "重复采样"——从样本中估计总体。

### 1.1 原理

```
原始样本：n 个
Bootstrap 样本：有放回抽取 n 个
重复 B 次（通常 1000+）
计算统计量分布
```

### 1.2 应用

- 置信区间估计
- 标准误估计
- 假设检验
- Bagging 集成

### 1.3 与交叉验证对比

| 特性 | Bootstrap | 交叉验证 |
|------|-----------|----------|
| 抽样 | 有放回 | 无放回 |
| 训练集大小 | n | (K-1)n/K |
| 样本利用率 | 63.2% | 100% |

## 2. Python 代码实现

```python
import numpy as np
from sklearn.utils import resample
from scipy import stats

# 原始数据
data = np.random.randn(100)

# Bootstrap 估计均值置信区间
B = 1000
bootstrap_means = []

for _ in range(B):
    sample = resample(data, n_samples=len(data))
    bootstrap_means.append(np.mean(sample))

# 95% 置信区间
ci_lower = np.percentile(bootstrap_means, 2.5)
ci_upper = np.percentile(bootstrap_means, 97.5)
print(f"均值：{np.mean(data):.4f}")
print(f"95% CI: [{ci_lower:.4f}, {ci_upper:.4f}]")

# sklearn 中的 Bootstrap
from sklearn.ensemble import BaggingClassifier
```

## 3. 总结

Bootstrap 是统计推断工具：

**核心价值：**
1. 有放回抽样
2. 估计置信区间
3. 无需分布假设
4. Bagging 基础

**适用场景：**
- 置信区间
- 标准误估计
- 小样本推断
- 集成学习
