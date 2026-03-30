# 生成数据

> **分类**: 机器学习 | **编号**: 000 | **更新时间**: 2026-03-30 | **难度**: ⭐⭐

`ML` `机器学习` `AI`

**摘要**: summary: "决策树是基础且重要的算法，考察候选人对树模型和特征选择的理觧"

---
---
order: 13
summary: "决策树是基础且重要的算法，考察候选人对树模型和特征选择的理觧"
title: "Decision Tree (决策树)"
category: "ML"
roles: [算法工程师，数据科学家，机器学习工程师]
zones: [监督学习，树模型]
difficulty: "⭐⭐⭐"
tags: [Decision Tree, Gini, Entropy, Information Gain, Pruning]
source: "https://www.interviewbit.com/machine-learning-interview-questions/"
createdAt: "2026-03-29"
---

## 题目描述
请详细解释决策树的原理。信息增益、基尼指数如何计算？如何防止过拟合？ID3、C4.5、CART 有什么区别？

## 参考答案

### 决策树原理

**核心思想：** 通过一系列 if-then 规则对数据进行划分，形成树状结构。

**关键概念：**
- **根节点：** 包含所有样本
- **内部节点：** 特征测试
- **叶节点：** 最终预测
- **分裂：** 根据特征将数据分为子集

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.datasets import make_classification
from sklearn.model_selection import cross_val_score

# 生成数据
X, y = make_classification(n_samples=200, n_features=4, n_informative=3, 
                           n_redundant=0, random_state=42)

# 训练决策树
clf = DecisionTreeClassifier(
    criterion='gini',      # 或 'entropy'
    max_depth=3,           # 最大深度
    min_samples_split=10,  # 内部节点再划分所需最小样本数
    min_samples_leaf=5,    # 叶节点最小样本数
    random_state=42
)
clf.fit(X, y)

# 可视化
plt.figure(figsize=(16, 8))
plot_tree(clf, feature_names=[f'Feature {i}' for i in range(4)], 
          class_names=['Class 0', 'Class 1'], filled=True, fontsize=10)
plt.title('Decision Tree')
plt.tight_layout()
plt.show()

# 特征重要性
importances = clf.feature_importances_
print(f"Feature importances: {importances}")
```

### 分裂准则

#### 1. 信息增益 (ID3, C4.5)

```python
def entropy(y):
    """计算熵"""
    _, counts = np.unique(y, return_counts=True)
    probs = counts / len(y)
    return -np.sum(probs * np.log2(probs + 1e-10))

def information_gain(y, y_left, y_right):
    """计算信息增益"""
    n = len(y)
    n_left, n_right = len(y_left), len(y_right)
    
    parent_entropy = entropy(y)
    child_entropy = (n_left / n) * entropy(y_left) + (n_right / n) * entropy(y_right)
    
    return parent_entropy - child_entropy

# 示例
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])
y_left = np.array([0, 0, 0, 0])
y_right = np.array([1, 1, 1, 1])

ig = information_gain(y, y_left, y_right)
print(f"Information Gain: {ig:.4f}")  # 完美分裂，IG = 1.0
```

#### 2. 基尼指数 (CART)

```python
def gini(y):
    """计算基尼指数"""
    _, counts = np.unique(y, return_counts=True)
    probs = counts / len(y)
    return 1 - np.sum(probs ** 2)

def gini_gain(y, y_left, y_right):
    """计算基尼增益"""
    n = len(y)
    n_left, n_right = len(y_left), len(y_right)
    
    parent_gini = gini(y)
    child_gini = (n_left / n) * gini(y_left) + (n_right / n) * gini(y_right)
    
    return parent_gini - child_gini

# 对比
print(f"Entropy: {entropy(y):.4f}")
print(f"Gini: {gini(y):.4f}")

# 通常 Gini 和 Entropy 结果相似
# Gini 计算更快（无对数）
# Entropy 倾向于更平衡的树
```

### 防止过拟合

```python
from sklearn.tree import DecisionTreeClassifier

# 预剪枝（限制树生长）
clf_pruned = DecisionTreeClassifier(
    max_depth=5,              # 最大深度
    min_samples_split=20,     # 分裂所需最小样本
    min_samples_leaf=10,      # 叶节点最小样本
    max_features='sqrt',      # 最大特征数
    max_leaf_nodes=10,        # 最大叶节点数
    random_state=42
)

# 后剪枝（生长后剪枝）
# sklearn 不直接支持，可用 cost_complexity_pruning_path

clf = DecisionTreeClassifier(random_state=42)
path = clf.cost_complexity_pruning_path(X, y)
ccp_alphas = path.ccp_alphas

# 不同 alpha 的对比
clfs = []
for ccp_alpha in ccp_alphas[::10]:  # 采样
    clf = DecisionTreeClassifier(random_state=42, ccp_alpha=ccp_alpha)
    clf.fit(X, y)
    clfs.append(clf)

# 可视化
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.plot(ccp_alphas, [clf.tree_.node_count for clf in clfs], 'o-')
plt.xlabel('ccp_alpha')
plt.ylabel('Number of Nodes')
plt.title('Nodes vs Alpha')
plt.grid(True, alpha=0.3)

plt.subplot(1, 2, 2)
plt.plot(ccp_alphas, [clf.score(X, y) for clf in clfs], 'o-', label='Train')
cv_scores = [cross_val_score(clf, X, y, cv=5).mean() for clf in clfs]
plt.plot(ccp_alphas, cv_scores, 's-', label='CV')
plt.xlabel('ccp_alpha')
plt.ylabel('Accuracy')
plt.title('Accuracy vs Alpha')
plt.legend()
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### 决策树算法对比

| 算法 | 分裂准则 | 树类型 | 特点 |
|------|---------|--------|------|
| **ID3** | 信息增益 | 多叉 | 只能处理离散特征 |
| **C4.5** | 信息增益率 | 多叉 | 处理连续特征，可剪枝 |
| **CART** | 基尼指数 | 二叉 | 支持回归，sklearn 实现 |

### 决策树优缺点

| 优点 | 缺点 |
|------|------|
| 易于理解和解释 | 容易过拟合 |
| 无需特征缩放 | 不稳定（数据变化大） |
| 处理数值和类别特征 | 偏向多值特征 |
| 可处理非线性关系 | 难以学习某些函数（XOR） |
| 白盒模型 | 单树性能有限 |

## 考察重点
- ✅ 理解决策树的分裂原理
- ✅ 掌握信息增益和基尼指数计算
- ✅ 了解剪枝方法
- ✅ 能够防止过拟合
- ✅ 具备实际应用能力

## 延伸题目
- [[随机森林详解]](./ML-005-ensemble-methods.md)
- [[梯度提升树]](./ML-035-gbt.md)
- [[XGBoost 原理]](./ML-036-xgboost-principles.md)

## 延伸追问

### 追问 1: 信息增益为什么偏向多值特征？

**问题：** 信息增益的缺陷是什么？

**答案：**

```python
# 信息增益问题：特征值越多，IG 越大
# 例如：用 ID 作为特征，IG 最大但无意义

# 解决方案：信息增益率 (C4.5)
def intrinsic_value(y_split_sizes):
    """计算固有值（IV）"""
    n = sum(y_split_sizes)
    probs = np.array(y_split_sizes) / n
    return -np.sum(probs * np.log2(probs + 1e-10))

def information_gain_ratio(ig, iv):
    """信息增益率"""
    return ig / (iv + 1e-10)

# 示例
ig = 0.5
iv_high_cardinality = 3.0  # 多值特征
iv_low_cardinality = 1.0   # 少值特征

igr_high = information_gain_ratio(ig, iv_high_cardinality)
igr_low = information_gain_ratio(ig, iv_low_cardinality)

print(f"IGR (high cardinality): {igr_high:.4f}")
print(f"IGR (low cardinality): {igr_low:.4f}")
# 增益率惩罚多值特征
```

### 追问 2: 决策树如何处理连续特征？

**问题：** 连续特征如何分裂？

**答案：**

```python
# 方法：二分法
# 1. 排序连续特征
# 2. 尝试所有可能的分裂点（相邻值中点）
# 3. 选择最佳分裂点

def find_best_split_continuous(X_feature, y):
    """找到连续特征的最佳分裂点"""
    # 排序
    sorted_idx = np.argsort(X_feature)
    X_sorted = X_feature[sorted_idx]
    y_sorted = y[sorted_idx]
    
    best_gain = 0
    best_threshold = None
    
    # 尝试所有分裂点
    for i in range(1, len(X_sorted)):
        if X_sorted[i] == X_sorted[i-1]:
            continue
        
        threshold = (X_sorted[i] + X_sorted[i-1]) / 2
        
        y_left = y_sorted[:i]
        y_right = y_sorted[i:]
        
        gain = information_gain(y_sorted, y_left, y_right)
        
        if gain > best_gain:
            best_gain = gain
            best_threshold = threshold
    
    return best_threshold, best_gain

# sklearn 自动处理
clf = DecisionTreeClassifier()
clf.fit(X_continuous, y)

# 查看分裂点
# clf.tree_.threshold 包含所有分裂阈值
```

### 追问 3: 决策树为什么不稳定？

**问题：** 如何提高决策树的稳定性？

**答案：**

```python
# 不稳定的原因：
# 1. 层次结构，上层分裂影响下层
# 2. 数据微小变化导致树结构大变化

# 解决方案：集成方法

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

# 1. 随机森林（Bagging）
rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42
)
# 通过平均多棵树减少方差

# 2. 梯度提升（Boosting）
gb = GradientBoostingClassifier(
    n_estimators=100,
    max_depth=3,  # 浅树
    learning_rate=0.1,
    random_state=42
)
# 通过逐步修正减少偏差

# 3. 交叉验证选择参数
from sklearn.model_selection import GridSearchCV

param_grid = {
    'max_depth': [3, 5, 10],
    'min_samples_split': [2, 10, 20]
}

grid_search = GridSearchCV(
    DecisionTreeClassifier(random_state=42),
    param_grid,
    cv=5
)
grid_search.fit(X, y)

# 稳定参数减少过拟合
```

## 深入理解

**决策树本质：** 基于特征的空间划分

**关键要点：**
1. 贪心算法，局部最优
2. 需要剪枝防止过拟合
3. 单树不稳定，集成更可靠
4. 可解释性强

## 更新历史
- v1 (2026-03-29): 初始版本
