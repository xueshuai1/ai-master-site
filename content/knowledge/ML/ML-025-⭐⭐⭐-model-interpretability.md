# 训练模型

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`ML` `AI` `面试`

**摘要**: summary: "模型可解释性是生产环境刚需，考察候选人对解释方法的理解"

---
---
order: 25
summary: "模型可解释性是生产环境刚需，考察候选人对解释方法的理解"
title: "Model Interpretability (模型可解释性)"
category: "ML"
roles: [算法工程师，数据科学家，AI 产品经理]
zones: [模型解释，可解释 AI]
difficulty: "⭐⭐⭐"
tags: [Interpretability, SHAP, LIME, Feature Importance, Explainable AI]
source: "https://www.simplilearn.com/tutorials/machine-learning-tutorial/machine-learning-interview-questions"
createdAt: "2026-03-29"
---

## 题目描述
为什么模型可解释性重要？有哪些解释方法？SHAP 和 LIME 的原理是什么？

## 参考答案

### 可解释性重要性

```python
interpretability_importance = """
为什么需要可解释性？

1. 监管合规
   - GDPR: 解释权
   - 金融：模型审查
   - 医疗：责任追溯

2. 业务信任
   - 决策者需要理解
   - 用户需要透明度
   - 调试和改进模型

3. 公平性检测
   - 发现偏见
   - 确保公平
   - 避免歧视

4. 模型改进
   - 发现错误模式
   - 特征工程指导
   - 异常检测
"""
print(interpretability_importance)
```

### 全局解释

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance, PartialDependenceDisplay

# 训练模型
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 1. 特征重要性
importances = model.feature_importances_
indices = np.argsort(importances)[::-1]

plt.figure(figsize=(10, 6))
plt.bar(range(len(importances)), importances[indices])
plt.xlabel('Feature')
plt.ylabel('Importance')
plt.title('Feature Importances')
plt.xticks(range(len(importances)), feature_names, rotation=90)
plt.tight_layout()
plt.show()

# 2. 置换重要性 (更可靠)
perm_importance = permutation_importance(
    model, X_test, y_test,
    n_repeats=10, random_state=42
)

# 3. 部分依赖图
fig, ax = plt.subplots(figsize=(10, 6))
PartialDependenceDisplay.from_estimator(
    model, X_train, features=[0, 1],
    kind='both', subsample=50,
    ax=ax
)
plt.tight_layout()
plt.show()
```

### SHAP 值

```python
import shap

# TreeExplainer (树模型)
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# 摘要图
plt.figure(figsize=(10, 6))
shap.summary_plot(shap_values, X_test, feature_names=feature_names)
plt.show()

# 依赖图
shap.dependence_summary(shap_values, X_test, feature_names=feature_names)

# 力导图 (单个预测)
shap.force_plot(
    explainer.expected_value,
    shap_values[0],
    X_test.iloc[0],
    feature_names=feature_names
)

# 原理
shap_principle = """
SHAP (SHapley Additive exPlanations)

基于博弈论的 Shapley 值：
- 每个特征是一个"玩家"
- 预测是"收益"
- Shapley 值公平分配贡献

性质：
1. 局部准确性：解释之和 = 预测值
2. 缺失性：缺失特征贡献为 0
3. 一致性：特征贡献单调

计算：
φ_i = Σ [ |S|!(M-|S|-1)! / M! ] × [f(S∪{i}) - f(S)]
      S⊆M\{i}
"""
print(shap_principle)
```

### LIME

```python
import lime
import lime.lime_tabular

# 创建解释器
explainer = lime.lime_tabular.LimeTabularExplainer(
    X_train.values,
    feature_names=feature_names,
    class_names=['Class 0', 'Class 1'],
    mode='classification'
)

# 解释单个预测
instance = X_test.iloc[0]
explanation = explainer.explain_instance(
    instance.values,
    model.predict_proba,
    num_features=10
)

# 可视化
explanation.show_in_notebook()
explanation.as_pyplot_figure()

# 原理
lime_principle = """
LIME (Local Interpretable Model-agnostic Explanations)

核心思想：
1. 在目标样本附近扰动生成新样本
2. 用黑盒模型预测新样本
3. 用可解释模型（如线性）局部拟合
4. 可解释模型的系数即为解释

优点：
- 模型无关
- 局部准确
- 直观易懂

缺点：
- 局部解释
- 采样不稳定
- 参数敏感
"""
print(lime_principle)
```

## 考察重点
- ✅ 理解可解释性重要性
- ✅ 掌握全局解释方法
- ✅ 了解 SHAP 原理
- ✅ 了解 LIME 原理
- ✅ 能够应用解释工具

## 更新历史
- v1 (2026-03-29): 初始版本
