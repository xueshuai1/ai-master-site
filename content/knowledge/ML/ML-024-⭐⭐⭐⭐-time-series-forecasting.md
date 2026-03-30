# 时间序列组件

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`ML` `LSTM` `深度学习`

**摘要**: summary: "时间序列预测是重要应用场景，考察候选人对时序数据的理解"

---
---
order: 24
summary: "时间序列预测是重要应用场景，考察候选人对时序数据的理解"
title: "Time Series Forecasting (时间序列预测)"
category: "ML"
roles: [算法工程师，数据科学家，预测分析师]
zones: [时间序列，预测]
difficulty: "⭐⭐⭐⭐"
tags: [Time Series, ARIMA, LSTM, Forecasting, Stationarity]
source: "https://www.simplilearn.com/tutorials/machine-learning-tutorial/machine-learning-interview-questions"
createdAt: "2026-03-29"
---

## 题目描述
时间序列预测有哪些方法？如何处理非平稳序列？ARIMA 的原理是什么？

## 参考答案

### 时间序列特点

```python
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

# 时间序列组件
components = """
时间序列 = 趋势 (Trend) + 季节性 (Seasonality) + 周期性 (Cycle) + 噪声 (Noise)

1. 趋势：长期方向（上升/下降/平稳）
2. 季节性：固定周期内的模式
3. 周期性：非固定周期的波动
4. 噪声：随机波动
"""
print(components)

# 分解示例
from statsmodels.tsa.seasonal import seasonal_decompose

# 生成示例数据
dates = pd.date_range('2020-01-01', periods=365, freq='D')
trend = np.linspace(100, 150, 365)
seasonal = 20 * np.sin(2 * np.pi * np.arange(365) / 365 * 12)
noise = np.random.randn(365) * 5
series = trend + seasonal + noise

ts = pd.Series(series, index=dates)

# 分解
decomposition = seasonal_decompose(ts, model='additive', period=30)
fig = decomposition.plot()
fig.suptitle('Time Series Decomposition', fontsize=16)
plt.tight_layout()
plt.show()
```

### 平稳性检验

```python
from statsmodels.tsa.stattools import adfuller, kpss

def test_stationarity(series):
    """检验时间序列平稳性"""
    
    # ADF 检验 (零假设：有单位根，非平稳)
    adf_result = adfuller(series)
    print("ADF Test:")
    print(f"  ADF Statistic: {adf_result[0]:.4f}")
    print(f"  p-value: {adf_result[1]:.4f}")
    print(f"  Stationary: {adf_result[1] < 0.05}")
    
    # KPSS 检验 (零假设：平稳)
    kpss_result = kpss(series)
    print("\nKPSS Test:")
    print(f"  KPSS Statistic: {kpss_result[0]:.4f}")
    print(f"  p-value: {kpss_result[1]:.4f}")
    print(f"  Stationary: {kpss_result[1] > 0.05}")
    
    return adf_result[1] < 0.05

# 使序列平稳的方法
# 1. 差分
series_diff = ts.diff().dropna()

# 2. 对数变换
series_log = np.log(ts)

# 3. 去趋势
from scipy.signal import detrend
series_detrended = detrend(ts)
```

### ARIMA 模型

```python
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf

# ACF 和 PACF 图
fig, axes = plt.subplots(1, 2, figsize=(14, 4))
plot_acf(ts, lags=40, ax=axes[0])
axes[0].set_title('ACF')
plot_pacf(ts, lags=40, ax=axes[1])
axes[1].set_title('PACF')
plt.tight_layout()
plt.show()

# ARIMA(p, d, q)
# p: AR 阶数 (自回归)
# d: 差分阶数
# q: MA 阶数 (移动平均)

# 拟合模型
model = ARIMA(ts, order=(1, 1, 1))
results = model.fit()

print(results.summary())

# 预测
forecast = results.forecast(steps=30)

# 可视化
plt.figure(figsize=(12, 5))
plt.plot(ts.index, ts.values, label='Historical')
plt.plot(pd.date_range(ts.index[-1], periods=31, freq='D')[1:], forecast, 
         label='Forecast', color='red')
plt.xlabel('Date')
plt.ylabel('Value')
plt.title('ARIMA Forecast')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

### 深度学习时序模型

```python
from tensorflow import keras
from tensorflow.keras import layers

# LSTM 模型
def create_lstm_model(input_shape, forecast_horizon):
    model = keras.Sequential([
        layers.LSTM(64, return_sequences=True, input_shape=input_shape),
        layers.Dropout(0.2),
        layers.LSTM(32),
        layers.Dropout(0.2),
        layers.Dense(forecast_horizon)
    ])
    model.compile(optimizer='adam', loss='mse')
    return model

# 准备数据
def create_sequences(data, seq_length, forecast_horizon):
    X, y = [], []
    for i in range(len(data) - seq_length - forecast_horizon + 1):
        X.append(data[i:i+seq_length])
        y.append(data[i+seq_length:i+seq_length+forecast_horizon])
    return np.array(X), np.array(y)

# 训练
seq_length = 30
forecast_horizon = 7
X, y = create_sequences(ts.values, seq_length, forecast_horizon)
X = X.reshape(-1, seq_length, 1)

model = create_lstm_model((seq_length, 1), forecast_horizon)
model.fit(X, y, epochs=50, batch_size=32, validation_split=0.2)
```

## 考察重点
- ✅ 理解时间序列特点
- ✅ 掌握平稳性检验
- ✅ 了解 ARIMA 原理
- ✅ 能够应用深度学习
- ✅ 具备预测评估能力

## 更新历史
- v1 (2026-03-29): 初始版本
