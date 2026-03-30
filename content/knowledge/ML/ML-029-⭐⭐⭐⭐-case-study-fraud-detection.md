# 1. 数据处理

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`ML` `LSTM` `深度学习` `神经网络` `损失函数`

**摘要**: summary: "案例分析考察综合应用能力，考察候选人解决实际问题的思路"

---
---
order: 29
summary: "案例分析考察综合应用能力，考察候选人解决实际问题的思路"
title: "ML Case Study - Fraud Detection (欺诈检测案例分析)"
category: "ML"
roles: [算法工程师，数据科学家，风控工程师]
zones: [案例分析，实际应用]
difficulty: "⭐⭐⭐⭐"
tags: [Case Study, Fraud Detection, Imbalanced Learning, Real-time Scoring]
source: "https://www.simplilearn.com/tutorials/machine-learning-tutorial/machine-learning-interview-questions"
createdAt: "2026-03-29"
---

## 题目描述
设计一个信用卡欺诈检测系统。欺诈率 0.1%，要求实时检测，如何设计？

## 参考答案

### 问题分析

```python
problem_analysis = """
欺诈检测特点：

1. 极度不平衡 (0.1% 欺诈率)
2. 实时性要求 (<100ms)
3. 代价不对称
   - 漏检：直接损失
   - 误报：用户体验

4. 概念漂移
   - 欺诈模式演变
   - 需要持续更新

5. 可解释性
   - 需要解释拒绝原因
   - 合规要求
"""
print(problem_analysis)
```

### 解决方案

```python
# 1. 数据处理
data_pipeline = """
数据管道：

1. 特征工程
   - 交易特征：金额、时间、地点
   - 用户特征：历史行为、习惯
   - 设备特征：IP、设备指纹
   - 聚合特征：过去 N 笔统计

2. 实时特征
   - 滑动窗口统计
   - 流式计算 (Flink/Spark)
   - 特征存储 (Redis)
"""

# 2. 模型选择
model_selection = """
模型选择：

1. 第一阶段：规则引擎
   - 快速过滤明显欺诈
   - 可解释性强

2. 第二阶段：ML 模型
   - XGBoost/LightGBM
   - 处理不平衡
   - 特征重要性

3. 第三阶段：深度学习
   - 异常检测
   - 序列模式 (LSTM)
   - 图神经网络 (关联)
"""

# 3. 处理不平衡
handling_imbalance = """
不平衡处理：

1. 采样
   - SMOTE 过采样
   - 欠采样多数类

2. 代价敏感
   - class_weight='balanced'
   - 自定义损失函数

3. 阈值调整
   - 根据代价优化
   - Precision-Recall 权衡

4. 评估指标
   - AUC-PR (不是 ROC)
   - Recall@K
   - 业务指标 (损失减少)
"""
```

### 系统架构

```python
system_architecture = """
系统架构：

┌────────────────────────────────────────────────────┐
│                  Transaction                        │
│                     Stream                          │
└────────────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────┐
│              Real-time Feature Engine               │
│         (Flink/Spark Streaming + Redis)             │
└────────────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────┐
│              ML Scoring Service                     │
│         (XGBoost + Rules + Anomaly Detection)       │
└────────────────────────────────────────────────────┘
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
       ┌────────┐  ┌────────┐  ┌────────┐
       │ < 0.1  │  │0.1-0.8 │  │ > 0.8  │
       │ Pass   │  │ Review │  │ Block  │
       └────────┘  └────────┘  └────────┘
"""
```

### 代码示例

```python
from sklearn.ensemble import IsolationForest
from xgboost import XGBClassifier
import numpy as np

class FraudDetectionSystem:
    def __init__(self):
        # 规则引擎
        self.rules = self._load_rules()
        
        # ML 模型
        self.model = XGBClassifier(
            scale_pos_weight=999,  # 处理不平衡
            max_depth=6,
            learning_rate=0.1,
            n_estimators=100
        )
        
        # 异常检测
        self.anomaly_detector = IsolationForest(
            contamination=0.001,
            random_state=42
        )
    
    def predict(self, transaction):
        # 1. 规则过滤
        rule_score = self._apply_rules(transaction)
        if rule_score > 0.9:
            return 'BLOCK', 0.99
        
        # 2. ML 评分
        features = self._extract_features(transaction)
        ml_score = self.model.predict_proba([features])[0][1]
        
        # 3. 异常检测
        anomaly_score = self.anomaly_detector.score_samples([features])[0]
        
        # 4. 融合
        final_score = 0.6 * ml_score + 0.3 * rule_score + 0.1 * (1 - anomaly_score)
        
        # 5. 决策
        if final_score > 0.8:
            return 'BLOCK', final_score
        elif final_score > 0.3:
            return 'REVIEW', final_score
        else:
            return 'PASS', final_score
    
    def _extract_features(self, transaction):
        # 特征工程
        features = [
            transaction['amount'],
            transaction['time_of_day'],
            transaction['distance_from_home'],
            # ... 更多特征
        ]
        return np.array(features)
```

## 考察重点
- ✅ 能够分析业务问题
- ✅ 设计完整解决方案
- ✅ 考虑实际约束
- ✅ 具备工程实现能力
- ✅ 理解业务指标

## 更新历史
- v1 (2026-03-29): 初始版本
