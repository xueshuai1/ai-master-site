# 公平性指标

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`ML` `机器学习` `正则化`

**摘要**: summary: "伦理和公平是 AI 重要议题，考察候选人对负责任 AI 的理解"

---
---
order: 27
summary: "伦理和公平是 AI 重要议题，考察候选人对负责任 AI 的理解"
title: "ML Ethics and Fairness (机器学习伦理与公平)"
category: "ML"
roles: [算法工程师，数据科学家，AI 产品经理]
zones: [AI 伦理，公平性]
difficulty: "⭐⭐⭐"
tags: [AI Ethics, Fairness, Bias, Responsible AI, Transparency]
source: "https://www.simplilearn.com/tutorials/machine-learning-tutorial/machine-learning-interview-questions"
createdAt: "2026-03-29"
---

## 题目描述
机器学习中的伦理问题有哪些？如何检测和缓解偏见？什么是公平性？

## 参考答案

### 伦理问题类型

```python
ethics_issues = """
机器学习伦理问题：

1. 偏见和歧视
   - 数据偏见
   - 算法偏见
   - 历史偏见延续

2. 隐私
   - 数据收集
   - 模型反推
   - 成员推断攻击

3. 透明度
   - 黑盒决策
   - 缺乏解释
   - 责任追溯困难

4. 责任
   - 错误决策责任
   - 自动化后果
   - 人类监督

5. 滥用风险
   - 深度伪造
   - 自动化武器
   - 监控滥用
"""
print(ethics_issues)
```

### 偏见检测

```python
import numpy as np
from sklearn.metrics import confusion_matrix

# 公平性指标
def fairness_metrics(y_true, y_pred, sensitive_attribute):
    """
    计算公平性指标
    
    sensitive_attribute: 敏感属性（如性别、种族）
    """
    groups = np.unique(sensitive_attribute)
    metrics = {}
    
    for group in groups:
        mask = sensitive_attribute == group
        y_group = y_true[mask]
        pred_group = y_pred[mask]
        
        # 各组性能
        tn, fp, fn, tp = confusion_matrix(y_group, pred_group).ravel()
        
        metrics[f'group_{group}'] = {
            'accuracy': (tp + tn) / (tp + tn + fp + fn),
            'precision': tp / (tp + fp) if (tp + fp) > 0 else 0,
            'recall': tp / (tp + fn) if (tp + fn) > 0 else 0,
            'fpr': fp / (fp + tn) if (fp + tn) > 0 else 0
        }
    
    return metrics

# 公平性定义
fairness_definitions = """
公平性定义：

1. 人口统计 parity
   - P(Ŷ=1|A=0) = P(Ŷ=1|A=1)
   - 各组通过率相同

2. 等机会 (Equal Opportunity)
   - P(Ŷ=1|Y=1,A=0) = P(Ŷ=1|Y=1,A=1)
   - 各组真正例率相同

3. 等几率 (Equalized Odds)
   - 同时满足 TPR 和 FPR 相等
   - P(Ŷ=1|Y=y,A=0) = P(Ŷ=1|Y=y,A=1)

4. 个体公平性
   - 相似个体得到相似预测
"""
print(fairness_definitions)
```

### 偏见缓解

```python
bias_mitigation = """
偏见缓解方法：

1. 预处理
   - 重采样平衡数据
   - 去除敏感属性代理
   - 数据增强

2. 处理中
   - 公平性约束
   - 对抗去偏
   - 正则化

3. 后处理
   - 调整决策阈值
   - 校准预测
   - 拒绝选项

4. 持续监控
   - 定期公平性审计
   - 用户反馈
   - 外部审查
"""
print(bias_mitigation)

# 代码示例：阈值调整
def adjust_threshold_for_fairness(y_proba, y_true, sensitive_attribute, target_tpr=0.8):
    """调整阈值以实现等机会"""
    groups = np.unique(sensitive_attribute)
    thresholds = {}
    
    for group in groups:
        mask = sensitive_attribute == group
        proba_group = y_proba[mask]
        y_group = y_true[mask]
        
        # 找到达到目标 TPR 的阈值
        for thresh in np.arange(0.1, 0.9, 0.01):
            pred = (proba_group >= thresh).astype(int)
            tn, fp, fn, tp = confusion_matrix(y_group, pred).ravel()
            tpr = tp / (tp + fn) if (tp + fn) > 0 else 0
            
            if tpr >= target_tpr:
                thresholds[group] = thresh
                break
    
    return thresholds
```

## 考察重点
- ✅ 理解 ML 伦理问题
- ✅ 掌握偏见检测方法
- ✅ 了解公平性定义
- ✅ 能够缓解偏见
- ✅ 具备责任意识

## 更新历史
- v1 (2026-03-29): 初始版本
