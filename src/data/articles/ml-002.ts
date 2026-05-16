import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-002",
    title: "决策树与随机森林实战",
    category: "ml",
    tags: ["监督学习", "集成学习", "分类"],
    summary: "从信息增益到基尼系数，掌握决策树的分裂策略与随机森林的集成思想",
    date: "2026-04-08",
    readTime: "22 min",
    level: "入门",
    content: [
      {
        title: "1. 决策树：像人类一样做决策",
        body: `决策树是最直观的机器学习算法之一。它的核心思想是模拟人类的决策过程：通过一系列 if-then 规则，逐步将数据划分到不同的类别或预测不同的数值。

想象你在判断一个人是否会购买某款产品：首先看年龄（>30 岁？），然后看收入（>50K？），最后看是否之前购买过类似产品。每一步都在缩小候选集，直到得出最终判断。

决策树的优势在于：完全可解释（可以画出树形图展示每个决策路径）、不需要特征标准化、能处理数值和类别特征、对非线性关系天然友好。缺点是容易过拟合，一棵完全生长的树会记住训练集的每个细节。`,
        mermaid: `graph TD
    A["年龄 > 30?"] -->|"是"| B["收入 > 50K?"]
    A -->|"否"| C["有学生优惠?"]
    B -->|"是"| D["购买过类似产品?"]
    B -->|"否"| E["不购买"]
    C -->|"是"| F["购买"]
    C -->|"否"| E
    D -->|"是"| F
    D -->|"否"| G["可能购买"]`,
        tip: "决策树是理解更复杂算法（随机森林、梯度提升树）的基础。先理解一棵树如何生长，再理解多棵树如何协作。",
      },
      {
        title: "2. 如何选择最佳分裂点：信息增益与基尼系数",
        body: `决策树的核心问题是：在每个节点，应该选择哪个特征、哪个阈值来分裂数据？答案取决于纯度这个关键概念。一个好的分裂应该让子节点中的数据尽可能纯净（即属于同一类别）。

信息增益（Information Gain）基于信息论中的熵（Entropy）。熵衡量一个数据集的不确定性：H(S) = -Σ pᵢ log₂(pᵢ)。当一个节点中所有样本属于同一类别时，熵为 0（完全纯净）；当类别均匀分布时，熵最大。信息增益 = 父节点熵 - 子节点加权熵。选择信息增益最大的特征进行分裂，就是 ID3 算法的核心思想。

基尼系数（Gini Impurity）是另一种纯度度量：Gini(S) = 1 - Σ pᵢ²。它计算的是随机抽取两个样本属于不同类别的概率。基尼系数计算比熵更快（没有对数运算），是 CART 算法的默认选择。

对于回归树，使用方差减少（Variance Reduction）作为分裂标准：选择使子节点方差之和最小的分裂点。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def entropy(labels):
    """计算熵: H(S) = -Σ p_i log_2(p_i)"""
    _, counts = np.unique(labels, return_counts=True)
    probs = counts / len(labels)
    return -np.sum(probs * np.log2(probs + 1e-10))

def gini_impurity(labels):
    """计算基尼系数: G(S) = 1 - Σ p_i²"""
    _, counts = np.unique(labels, return_counts=True)
    probs = counts / len(labels)
    return 1 - np.sum(probs  2)

# 示例：二分类问题
labels_pure = np.array([1, 1, 1, 1, 1])
labels_mixed = np.array([1, 1, 0, 0, 0])
labels_balanced = np.array([1, 1, 1, 0, 0, 0])

print("=== 纯度对比 ===")
print(f"完全纯净  - Entropy: {entropy(labels_pure):.4f}, Gini: {gini_impurity(labels_pure):.4f}")
print(f"3:2 混合  - Entropy: {entropy(labels_mixed):.4f}, Gini: {gini_impurity(labels_mixed):.4f}")
print(f"3:3 均衡  - Entropy: {entropy(labels_balanced):.4f}, Gini: {gini_impurity(labels_balanced):.4f}")`,
          },
        ],
        table: {
          headers: ["分裂标准", "公式", "特点", "代表算法"],
          rows: [
            ["信息增益", "H(父) - Σ(nᵢ/n)H(子ᵢ)", "偏向多值特征", "ID3"],
            ["信息增益率", "IG / SplitInfo", "修正信息增益偏差", "C4.5"],
            ["基尼系数", "1 - Σpᵢ²", "计算快，效果类似熵", "CART"],
            ["方差减少", "Var(父) - Σ(nᵢ/n)Var(子ᵢ)", "用于回归树", "CART 回归"],
          ],
        },
      },
      {
        title: "3. 从零实现决策树",
        body: `理解决策树最好的方式就是手写一棵。下面是一个简化版的 CART 分类树实现：递归地选择最佳分裂点，直到达到停止条件（最大深度、最小样本数、或节点纯度达标）。`,
        code: [
          {
            lang: "python",
            code: `class DecisionNode:
    """决策树节点"""
    def __init__(self, feature=None, threshold=None,
                 left=None, right=None, value=None):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value  # 叶子节点的预测值

class DecisionTreeClassifier:
    """简化版 CART 分类树"""

    def __init__(self, max_depth=5, min_samples_split=2):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.root = None

    def _gini(self, y):
        if len(y) == 0:
            return 0
        probs = np.bincount(y) / len(y)
        return 1 - np.sum(probs  2)

    def _best_split(self, X, y):
        best_gain = -1
        best_feature = None
        best_threshold = None
        n_samples, n_features = X.shape
        parent_gini = self._gini(y)

        for feature in range(n_features):
            thresholds = np.unique(X[:, feature])
            for threshold in thresholds:
                left_mask = X[:, feature] <= threshold
                right_mask = ~left_mask
                if left_mask.sum() == 0 or right_mask.sum() == 0:
                    continue
                n_left = left_mask.sum()
                n_right = right_mask.sum()
                weighted_gini = (n_left * self._gini(y[left_mask]) +
                                 n_right * self._gini(y[right_mask])) / n_samples
                gain = parent_gini - weighted_gini
                if gain > best_gain:
                    best_gain = gain
                    best_feature = feature
                    best_threshold = threshold

        return best_feature, best_threshold, best_gain

    def _build_tree(self, X, y, depth):
        if (depth >= self.max_depth or
            len(y) < self.min_samples_split or
            self._gini(y) == 0):
            return DecisionNode(value=np.bincount(y).argmax())

        feature, threshold, gain = self._best_split(X, y)
        if feature is None or gain <= 0:
            return DecisionNode(value=np.bincount(y).argmax())

        left_mask = X[:, feature] <= threshold
        left = self._build_tree(X[left_mask], y[left_mask], depth + 1)
        right = self._build_tree(X[~left_mask], y[~left_mask], depth + 1)
        return DecisionNode(feature, threshold, left, right)

    def fit(self, X, y):
        self.root = self._build_tree(X, y, depth=0)
        return self

    def _predict_one(self, x, node):
        if node.value is not None:
            return node.value
        if x[node.feature] <= node.threshold:
            return self._predict_one(x, node.left)
        return self._predict_one(x, node.right)

    def predict(self, X):
        return np.array([self._predict_one(x, self.root) for x in X])`,
          },
        ],
      },
      {
        title: "4. 剪枝：控制过拟合",
        body: `一棵不受限制的决策树会不断分裂直到每个叶子节点只有一个样本，这意味着它在记忆训练数据而非学习规律。剪枝（Pruning）是控制决策树复杂度的核心手段。

预剪枝（Pre-pruning）：在树生长过程中提前停止。常见策略包括：限制最大深度（max_depth）、要求节点最少样本数（min_samples_split）、要求叶子节点最少样本数（min_samples_leaf）。

后剪枝（Post-pruning）：先让树完全生长，然后自底向上地合并那些对验证集性能没有帮助的节点。代价复杂度剪枝是最经典的后剪枝方法，它引入了一个复杂度参数 alpha，在树的拟合度和复杂度之间做权衡。

实践中，预剪枝更常用（计算效率高），而后剪枝通常效果更好但更耗时。sklearn 的 DecisionTreeClassifier 默认不剪枝，所以实际使用时必须手动设置 max_depth 等参数。`,
        list: [
          "max_depth：限制树的最大深度（最常用的预剪枝参数）",
          "min_samples_split：节点分裂所需的最小样本数（默认 2）",
          "min_samples_leaf：叶子节点的最小样本数（防止极端分裂）",
          "max_features：每步考虑的最大特征数（增加随机性）",
          "ccp_alpha：代价复杂度剪枝参数（后剪枝）",
          "交叉验证选择最佳超参数组合",
        ],
        warning: "sklearn 决策树默认不剪枝！如果你用默认参数训练，几乎一定会过拟合。至少设置 max_depth 或 min_samples_leaf。",
      },
      {
        title: "5. 随机森林：集成的力量",
        body: `随机森林（Random Forest）通过构建多棵决策树并将它们的结果聚合起来，大幅提升预测性能。它的核心思想是群体的智慧——每棵树独立做判断，然后投票决定最终结果。

随机森林通过两种随机性来确保树之间的多样性：Bootstrap 采样（有放回抽样），每棵树使用不同的训练子集；特征随机选择，在每个分裂点只从随机选择的 k 个特征中寻找最佳分裂。

这种设计使得随机森林几乎不会过拟合（随着树的数量增加，泛化误差收敛到一个下界）、不需要剪枝、对异常值鲁棒、可以并行训练。而且它天然支持特征重要性评估。`,
        mermaid: `graph TD
    A["原始训练集"] --> B["Bootstrap 采样 1"]
    A --> C["Bootstrap 采样 2"]
    A --> D["Bootstrap 采样 N"]
    B --> E["决策树 1"]
    C --> F["决策树 2"]
    D --> G["决策树 N"]
    E --> H["投票/平均"]
    F --> H
    G --> H
    H --> I["最终预测"]`,
        code: [
          {
            lang: "python",
            code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=1000, n_features=20,
                           n_informative=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

rf = RandomForestClassifier(
    n_estimators=100,        # 树的数量
    max_depth=10,            # 每棵树的最大深度
    min_samples_split=5,     # 最小分裂样本数
    min_samples_leaf=2,      # 叶子最小样本数
    max_features="sqrt",     # 每步考虑的特征数
    random_state=42,
    n_jobs=-1                # 并行训练
)
rf.fit(X_train, y_train)

print(f"训练集准确率: {rf.score(X_train, y_train):.4f}")
print(f"测试集准确率: {rf.score(X_test, y_test):.4f}")

# 特征重要性
importances = rf.feature_importances_
top_features = np.argsort(importances)[::-1][:5]
print("Top 5 重要特征:")
for i, feat_idx in enumerate(top_features):
    print(f"  特征 {feat_idx}: {importances[feat_idx]:.4f}")`,
          },
        ],
        table: {
          headers: ["算法", "单树/集成", "过拟合风险", "可解释性", "训练速度"],
          rows: [
            ["单棵决策树", "单树", "高", "完全可解释", "快"],
            ["随机森林", "集成 (Bagging)", "低", "特征重要性", "中等（可并行）"],
            ["Gradient Boosting", "集成 (Boosting)", "中", "特征重要性", "慢（串行）"],
            ["XGBoost", "集成 (Boosting+)", "中", "特征重要性", "快（优化版）"],
          ],
        },
        tip: "随机森林的 n_estimators（树的数量）越大越好——不会过拟合，只会让结果更稳定。通常 100-500 棵树已经足够。",
      },
      {
        title: "6. 特征重要性与模型解释",
        body: `随机森林不仅能做出准确预测，还能告诉你哪些特征最重要。特征重要性有两种主流计算方法：

基于不纯度（Impurity-based）：对每棵树，计算每个特征在所有分裂中带来的不纯度减少总量（加权平均），然后对所有树取平均。这是 sklearn 默认的方法，计算高效。但它有一个已知偏差：偏向于具有高基数（唯一值多）的特征，因为这样的特征有更多候选分裂点。

基于排列（Permutation-based）：训练好模型后，随机打乱某个特征的值，观察模型性能下降多少。下降越多说明该特征越重要。这种方法没有基数偏差，而且可以在验证集上计算，反映的是泛化重要性而非训练集上的拟合程度。

SHAP（SHapley Additive exPlanations）值是最前沿的特征归因方法，基于博弈论中的 Shapley 值。它为每个样本的每个特征分配一个贡献值，保证加和等于模型预测值与基准值的差。SHAP 值同时支持全局重要性和局部解释（为什么这个样本被预测为某类）。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=1000, n_features=20,
                           n_informative=10, n_redundant=5,
                           random_state=42)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X, y)

# 方法一：基于不纯度的特征重要性
impurity_imp = rf.feature_importances_
print("=== 不纯度重要性 (Top 5) ===")
for i in np.argsort(impurity_imp)[::-1][:5]:
    print(f"  特征 {i:2d}: {impurity_imp[i]:.4f}")

# 方法二：排列重要性（更可靠）
result = permutation_importance(rf, X, y, n_repeats=10,
                                random_state=42, n_jobs=-1)
perm_imp = result.importances_mean
print("\\n=== 排列重要性 (Top 5) ===")
for i in np.argsort(perm_imp)[::-1][:5]:
    print(f"  特征 {i:2d}: {perm_imp[i]:.4f} "
          f"(±{result.importances_std[i]:.4f})")`,
          },
        ],
        table: {
          headers: ["方法", "原理", "偏差", "计算开销", "推荐场景"],
          rows: [
            ["不纯度重要性", "分裂时不纯度减少量", "偏向高基数特征", "低（训练时免费）", "快速探索"],
            ["排列重要性", "打乱特征后性能下降", "无明显偏差", "中（需多次预测）", "最终报告"],
            ["SHAP 值", "博弈论 Shapley 值", "理论最优", "高（需大量采样）", "精细解释"],
          ],
        },
      },
      {
        title: "7. 实际应用场景与最佳实践",
        body: `决策树和随机森林在工业界有着广泛的应用，尤其是当可解释性很重要时。

信用风险评估：银行使用决策树来评估贷款申请。监管机构要求银行能解释为什么拒绝某个申请——决策树的决策路径完美满足这个要求。

医疗诊断：根据患者症状、化验结果预测疾病。决策树可以生成清晰的诊断流程，医生可以直接理解和验证。

客户流失预测：电信、金融行业用随机森林预测哪些客户可能流失。随机森林能处理混合类型特征（数值、类别），而且不需要复杂的特征工程。

在实际项目中，建议先用随机森林建立一个强基线。如果随机森林已经能达到业务要求的准确率，就不必急着上更复杂的模型。如果不够好，再考虑梯度提升树（XGBoost、LightGBM）或深度学习。`,
        list: [
          "信用评估：可解释的决策路径满足监管要求",
          "医疗诊断：生成清晰的诊断流程",
          "客户流失：随机森林处理混合特征，无需复杂工程",
          "特征选择：用随机森林特征重要性做预筛选",
          "异常检测：孤立森林（Isolation Forest）的变体",
        ],
        mermaid: `graph LR
    A["原始数据集"] --> B["随机森林基线"]
    B --> C["排列重要性筛选"]
    C --> D["Top-K 特征子集"]
    D --> E["SHAP 可解释性分析"]
    E --> F["业务决策报告"]
    class F s2
    class C s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
        tip: "实战建议：拿到新数据集，先跑随机森林基线 → 排列重要性筛特征 → SHAP 生成可解释性报告。这套流程适用于 80% 的表格数据场景。",
      },
    ],
  };
