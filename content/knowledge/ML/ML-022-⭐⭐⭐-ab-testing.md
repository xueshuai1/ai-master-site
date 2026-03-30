# 实验设计要素

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐

`ML` `机器学习` `AI`

**摘要**: summary: "A/B 测试是评估模型业务价值的关键，考察候选人对实验设计的理解"

---
---
order: 22
summary: "A/B 测试是评估模型业务价值的关键，考察候选人对实验设计的理解"
title: "A/B Testing for ML (机器学习 A/B 测试)"
category: "ML"
roles: [算法工程师，数据科学家，ML 产品经理]
zones: [实验设计，业务评估]
difficulty: "⭐⭐⭐"
tags: [A/B Testing, Experiment Design, Statistical Significance, Business Metrics]
source: "https://www.simplilearn.com/tutorials/machine-learning-tutorial/machine-learning-interview-questions"
createdAt: "2026-03-29"
---

## 题目描述
如何设计 A/B 测试来评估机器学习模型？如何确定样本量？如何分析结果？

## 参考答案

### A/B 测试设计

```python
# 实验设计要素
experiment_design = """
1. 假设
   - H0 (零假设): 新旧模型无差异
   - H1 (备择假设): 新模型更好

2. 指标
   - 主要指标：业务核心指标
   - 次要指标：辅助指标
   - 护栏指标：确保无负面影响

3. 分组
   - 随机分配
   - 样本量计算
   - 分层随机化

4. 时长
   - 考虑季节性
   - 学习期排除
   - 统计功效
"""
```

### 样本量计算

```python
from statsmodels.stats.power import TTestIndPower
from statsmodels.stats.proportion import proportions_ztest
import numpy as np

def calculate_sample_size(baseline_rate, mde, alpha=0.05, power=0.8):
    """
    计算 A/B 测试所需样本量
    
    baseline_rate: 基线转化率
    mde: 最小可检测效应 (相对提升)
    alpha: 显著性水平
    power: 统计功效
    """
    # 效应大小 (Cohen's h)
    new_rate = baseline_rate * (1 + mde)
    h = 2 * np.arcsin(np.sqrt(new_rate)) - 2 * np.arcsin(np.sqrt(baseline_rate))
    
    # 计算样本量
    analysis = TTestIndPower()
    n_per_group = analysis.solve_power(effect_size=h, alpha=alpha, power=power)
    
    return int(np.ceil(n_per_group))

# 示例
baseline = 0.10  # 10% 转化率
mde = 0.10       # 检测 10% 相对提升
n = calculate_sample_size(baseline, mde)
print(f"Required sample size per group: {n:,}")
print(f"Total sample size: {2*n:,}")
```

### 结果分析

```python
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest

def analyze_ab_test(conversions_control, n_control, conversions_treatment, n_treatment):
    """分析 A/B 测试结果"""
    
    # 转化率
    rate_control = conversions_control / n_control
    rate_treatment = conversions_treatment / n_treatment
    relative_lift = (rate_treatment - rate_control) / rate_control
    
    # 统计检验
    stat, p_value = proportions_ztest(
        [conversions_treatment, conversions_control],
        [n_treatment, n_control],
        alternative='larger'  # 单侧检验
    )
    
    # 置信区间
    from statsmodels.stats.proportion import proportion_confint
    ci_low, ci_high = proportion_confint(
        conversions_treatment, n_treatment, alpha=0.05, method='wilson'
    )
    
    # 结果
    significant = p_value < 0.05
    winner = 'treatment' if (significant and relative_lift > 0) else 'control'
    
    return {
        'rate_control': rate_control,
        'rate_treatment': rate_treatment,
        'relative_lift': relative_lift,
        'p_value': p_value,
        'significant': significant,
        'confidence_interval': (ci_low, ci_high),
        'winner': winner
    }

# 示例
result = analyze_ab_test(
    conversions_control=950,
    n_control=10000,
    conversions_treatment=1050,
    n_treatment=10000
)

print(f"Control rate: {result['rate_control']:.4f}")
print(f"Treatment rate: {result['rate_treatment']:.4f}")
print(f"Relative lift: {result['relative_lift']:.2%}")
print(f"P-value: {result['p_value']:.4f}")
print(f"Significant: {result['significant']}")
print(f"Winner: {result['winner']}")
```

### 常见陷阱

```python
pitfalls = """
1. P-hacking
   - 多次查看结果
   - 解决方案：固定样本量，预先注册

2. 多重检验
   - 同时测试多个指标
   - 解决方案：Bonferroni 校正

3. 选择偏差
   - 非随机分组
   - 解决方案：严格随机化

4. 新奇效应
   - 用户因新鲜感而改变行为
   - 解决方案：延长测试时间

5. 网络效应
   - 用户之间相互影响
   - 解决方案：集群随机化

6. 辛普森悖论
   - 分组趋势与总体相反
   - 解决方案：分层分析
"""
print(pitfalls)
```

## 考察重点
- ✅ 理解 A/B 测试设计
- ✅ 掌握样本量计算
- ✅ 能够分析实验结果
- ✅ 了解常见陷阱
- ✅ 具备统计思维

## 更新历史
- v1 (2026-03-29): 初始版本
