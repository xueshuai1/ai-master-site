import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-013",
    title: "集成学习：Bagging, Boosting, Stacking",
    category: "ml",
    tags: ["集成学习", "Bagging", "Boosting"],
    summary: "三个臭皮匠顶个诸葛亮，掌握模型组合的艺术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么集成有效：偏差-方差分解",
            body: `集成学习（Ensemble Learning）的核心直觉很简单：把多个「不太完美」的模型组合起来，往往能得到一个更强的模型。这就像投资决策——不要把全部资金押在一只股票上，分散投资可以降低整体风险。

从数学上看，任何模型的期望泛化误差都可以分解为三个部分：偏差（Bias）、方差（Variance）和不可约噪声（Irreducible Noise）。偏差衡量模型预测值与真实值之间的系统性偏离，高偏差意味着欠拟合。方差衡量模型对训练数据变化的敏感程度，高方差意味着过拟合。**集成学习的魅力在于，它能在不牺牲偏差的前提下显著降低方差，或者在保持方差的同时降低偏差**。

Condorcet 陪审团定理从概率论角度证明了这一点：**如果每个基模型正确率略高于 50%，且判断相互独立，那么多数表决的正确率会趋近于 100%**。这就是集成的理论基础——即使每个模型只是「略好于随机猜测」，大量独立模型的集体智慧也能逼近完美。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt

def bias_variance_decomposition():
    """可视化偏差-方差分解"""
    np.random.seed(42)

    # 真实函数
    def true_function(x):
        return np.sin(1.5 * x)

    # 生成多组训练集，训练不同复杂度模型
    n_datasets = 50
    x_range = np.linspace(-3, 3, 200)
    y_true = true_function(x_range)

    fig, axes = plt.subplots(1, 3, figsize=(15, 4))

    for idx, (degree, title) in enumerate([
        (1, "高偏差（欠拟合）"),
        (3, "均衡（良好）"),
        (15, "高方差（过拟合）")
    ]):
        predictions = np.zeros((n_datasets, len(x_range)))

        for i in range(n_datasets):
            # 每次用不同随机样本训练
            X_train = np.random.uniform(-3, 3, 20)
            noise = np.random.normal(0, 0.3, 20)
            y_train = true_function(X_train) + noise
            coeffs = np.polyfit(X_train, y_train, degree)
            predictions[i] = np.polyval(coeffs, x_range)

        avg_prediction = np.mean(predictions, axis=0)
        variance = np.var(predictions, axis=0)
        bias_sq = (avg_prediction - y_true) ** 2

        ax = axes[idx]
        ax.plot(x_range, y_true, 'k-', linewidth=2, label='真实函数')
        for i in range(min(10, n_datasets)):
            ax.plot(x_range, predictions[i], 'b-', alpha=0.15)
        ax.plot(x_range, avg_prediction, 'r--', linewidth=2,
                label='平均预测')
        ax.set_title(f"{title}\\nBias^2={np.mean(bias_sq):.3f}, "
                     f"Var={np.mean(variance):.3f}")
        ax.legend()
        ax.set_ylim(-3, 3)

    plt.tight_layout()
    plt.show()

bias_variance_decomposition()`,
                },
                {
                    lang: "python",
                    code: `import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.tree import DecisionTreeRegressor
from sklearn.datasets import make_friedman1

# 验证集成如何降低方差
X, y = make_friedman1(n_samples=2000, noise=0.5, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42)

# 单棵深树（高方差）
single_tree = DecisionTreeRegressor(max_depth=15, random_state=42)
single_tree.fit(X_train, y_train)
single_mse = mean_squared_error(y_test, single_tree.predict(X_test))

# 集成：多棵树的平均预测
n_estimators = 100
ensemble_preds = np.zeros(len(y_test))
for i in range(n_estimators):
    bootstrap_idx = np.random.choice(
        len(X_train), len(X_train), replace=True)
    X_boot, y_boot = X_train[bootstrap_idx], y_train[bootstrap_idx]
    tree = DecisionTreeRegressor(max_depth=15, random_state=i)
    tree.fit(X_boot, y_boot)
    ensemble_preds += tree.predict(X_test) / n_estimators

ensemble_mse = mean_squared_error(y_test, ensemble_preds)

print(f"单棵深树 MSE:  {single_mse:.4f}")
print(f"集成 {n_estimators} 棵树 MSE: {ensemble_mse:.4f}")
print(f"方差降低比例: {(1 - ensemble_mse/single_mse)*100:.1f}%")`,
                },
            ],
            table: {
                headers: ["误差分量", "定义", "高意味着", "降低方法"],
                rows: [
                    ["偏差 (Bias)", "E[f(x)] - y_true", "欠拟合，模型太简单", "增加模型复杂度、减少正则化"],
                    ["方差 (Variance)", "E[(f(x) - E[f(x)])^2]", "过拟合，模型太敏感", "集成学习、正则化、更多数据"],
                    ["不可约噪声", "sigma^2", "数据本身的噪声", "无法降低，是理论下限"],
                    ["总误差", "Bias^2 + Variance + Noise", "泛化能力差", "偏差-方差权衡"],
                ],
            },
            mermaid: `graph TD
    A["期望泛化误差"] --> B["偏差平方 Bias^2"]
    A --> C["方差 Variance"]
    A --> D["不可约噪声"]
    B --> E["欠拟合 → 增加复杂度"]
    C --> F["过拟合 → 集成/正则化"]
    D --> G["无法消除"]
    E --> H["偏差-方差权衡"]
    F --> H
    H --> I["找到最优模型复杂度"]`,
            tip: "理解偏差-方差分解是掌握所有集成方法的钥匙。Bagging 主攻方差，Boosting 主攻偏差，Stacking 兼顾两者——记住这个对应关系，后续学习会非常清晰。",
        },
        {
            title: "2. Bagging：Bootstrap 采样 + 投票",
            body: `Bagging（Bootstrap Aggregating）由 Leo Breiman 在 1996 年提出，是最直观的集成方法。它的核心思想分两步：首先用 Bootstrap 采样（有放回随机抽样）从训练集中生成多个子数据集；然后在每个子数据集上训练一个基模型，最后通过投票（分类）或平均（回归）得到最终预测。

Bootstrap 采样的数学性质很有趣：**当样本量 n 趋于无穷大时，每次 Bootstrap 采样大约有 63.2% 的原始样本会被选中，剩余 36.8% 成为「袋外样本」（OOB）**。OOB 样本天然构成了一个验证集，可以用来评估模型性能而无需额外的交叉验证。

**Bagging 最有效的场景是高方差模型——比如未剪枝的决策树**。因为每棵树在略有不同的数据上训练，它们的错误方向各不相同，投票时这些错误会相互抵消。相反，如果基模型本身是高偏差的（如浅层决策树），Bagging 的效果有限，因为所有模型都会犯相同的系统性错误。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

class SimpleBaggingClassifier:
    """从零实现 Bagging 分类器——理解核心逻辑"""

    def __init__(self, n_estimators=50, max_depth=None, random_state=42):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.random_state = random_state
        self.trees = []
        self.oob_scores = []

    def fit(self, X, y):
        np.random.seed(self.random_state)
        self.trees = []
        n = len(X)

        for i in range(self.n_estimators):
            # Bootstrap 采样（有放回）
            indices = np.random.choice(n, n, replace=True)
            X_boot, y_boot = X[indices], y[indices]

            # 训练决策树
            tree = DecisionTreeClassifier(
                max_depth=self.max_depth, random_state=i)
            tree.fit(X_boot, y_boot)
            self.trees.append(tree)

            # 计算 OOB 分数
            oob_mask = np.ones(n, dtype=bool)
            oob_mask[np.unique(indices)] = False
            if oob_mask.sum() > 0:
                oob_score = tree.score(X[oob_mask], y[oob_mask])
                self.oob_scores.append(oob_score)

        print(f"OOB 平均准确率: "
              f"{np.mean(self.oob_scores):.4f}")

    def predict(self, X):
        # 多数表决
        predictions = np.array(
            [tree.predict(X) for tree in self.trees])
        return np.round(predictions.mean(axis=0)).astype(int)`,
                },
                {
                    lang: "python",
                    code: `from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import numpy as np

# 生成非线性数据
X, y = make_moons(n_samples=500, noise=0.3, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42)

# 训练 Bagging 分类器
bagging = SimpleBaggingClassifier(n_estimators=50, max_depth=5)
bagging.fit(X_train, y_train)

# 绘制决策边界
def plot_decision_boundary(model, X, y, title):
    x_min, x_max = X[:, 0].min() - 0.5, X[:, 0].max() + 0.5
    y_min, y_max = X[:, 1].min() - 0.5, X[:, 1].max() + 0.5
    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, 200),
        np.linspace(y_min, y_max, 200))
    Z = model.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)

    plt.contourf(xx, yy, Z, alpha=0.3, cmap='viridis')
    plt.scatter(X[:, 0], X[:, 1], c=y, cmap='viridis',
                edgecolors='k', s=30)
    plt.title(title)
    plt.show()

# 对比单棵树 vs Bagging
single_tree = DecisionTreeClassifier(max_depth=5, random_state=42)
single_tree.fit(X_train, y_train)
print(f"单棵树准确率: {single_tree.score(X_test, y_test):.4f}")
print(f"Bagging 准确率: {bagging.score(X_test, y_test):.4f}")

plot_decision_boundary(single_tree, X_test, y_test, "单棵决策树")
plot_decision_boundary(bagging, X_test, y_test, "Bagging (50 棵树)")`,
                },
            ],
            table: {
                headers: ["特性", "单棵决策树", "Bagging 集成"],
                rows: [
                    ["方差", "高（对数据敏感）", "低（平均效应）"],
                    ["偏差", "低（深树拟合力强）", "与单树相近"],
                    ["训练方式", "一次训练", "并行训练 N 棵"],
                    ["验证集", "需额外划分", "OOB 样本自带验证"],
                    ["过拟合倾向", "容易", "显著降低"],
                ],
            },
            mermaid: `graph LR
    A["训练集 D"] --> B["Bootstrap 采样"]
    B --> C["D1 (63.2％ 样本)"]
    B --> D["D2 (63.2％ 样本)"]
    B --> E["DN (63.2％ 样本)"]
    C --> F["模型 M1"]
    D --> G["模型 M2"]
    E --> H["模型 MN"]
    F --> I["投票/平均"]
    G --> I
    H --> I
    I --> J["最终预测"]`,
            warning: "Bagging 对高偏差模型效果甚微。如果你的基模型本身就欠拟合（比如最大深度为 2 的决策树），集成再多也救不回来——先解决偏差问题，再用 Bagging 降低方差。",
        },
        {
            title: "3. Boosting：AdaBoost 与梯度提升",
            body: `Boosting 与 Bagging 的哲学完全不同：**Bagging 是「民主投票」，每个模型独立训练、平等投票；Boosting 是「接力赛」，每个新模型都专注于前一个模型犯错的样本**。

AdaBoost（Adaptive Boosting）是最经典的 Boosting 算法。它维护一个样本权重分布，初始时所有样本权重相等。每轮训练后，被错误分类的样本权重增加，正确分类的样本权重减少。下一轮的模型会更关注那些之前被分错的「困难样本」。最终预测时，每个模型根据其准确率获得不同的投票权重——越准确的模型话语权越大。

梯度提升（Gradient Boosting）将 Boosting 的思想推广到任意可微损失函数。**它不再调整样本权重，而是让每棵新树拟合前一轮的残差（负梯度）**。这相当于在函数空间中做梯度下降：每一棵树都是沿着损失函数下降方向迈出的一步。XGBoost、LightGBM、CatBoost 等现代竞赛利器，都是梯度提升的优化变体。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from sklearn.tree import DecisionTreeClassifier

class SimpleAdaBoost:
    """从零实现 AdaBoost——理解权重更新机制"""

    def __init__(self, n_estimators=50):
        self.n_estimators = n_estimators
        self.stumps = []
        self.alpha = []  # 每个模型的投票权重

    def fit(self, X, y):
        n = len(X)
        # 初始权重均匀分布
        w = np.ones(n) / n

        for t in range(self.n_estimators):
            # 训练一个浅层决策树（桩）
            stump = DecisionTreeClassifier(max_depth=1)
            stump.fit(X, y, sample_weight=w)
            predictions = stump.predict(X)

            # 计算加权错误率
            error = np.sum(w[predictions != y]) / np.sum(w)
            error = np.clip(error, 1e-10, 1 - 1e-10)

            # 计算模型权重
            alpha_t = 0.5 * np.log((1 - error) / error)

            # 更新样本权重：分错的样本权重增加
            w *= np.exp(-alpha_t * y * (2 * predictions - 1))
            w /= np.sum(w)

            self.stumps.append(stump)
            self.alpha.append(alpha_t)

    def predict(self, X):
        # 加权投票
        predictions = np.zeros(len(X))
        for stump, alpha in zip(self.stumps, self.alpha):
            predictions += alpha * stump.predict(X)
        return np.sign(predictions)`,
                },
                {
                    lang: "python",
                    code: `from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import numpy as np

# 梯度提升的逐步学习过程
X, y = make_classification(n_samples=1000, n_features=10,
                           n_informative=5, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42)

# 不同树数量的效果
n_estimators_range = [1, 3, 5, 10, 20, 50, 100, 200]
train_scores = []
test_scores = []

for n_est in n_estimators_range:
    gb = GradientBoostingClassifier(
        n_estimators=n_est, max_depth=3,
        learning_rate=0.1, random_state=42)
    gb.fit(X_train, y_train)
    train_scores.append(gb.score(X_train, y_train))
    test_scores.append(gb.score(X_test, y_test))

plt.figure(figsize=(8, 5))
plt.plot(n_estimators_range, train_scores, 'b-o',
         label='训练集准确率')
plt.plot(n_estimators_range, test_scores, 'r-o',
         label='测试集准确率')
plt.xlabel('树的数量')
plt.ylabel('准确率')
plt.title('梯度提升：树数量 vs 性能')
plt.legend()
plt.grid(alpha=0.3)
plt.show()

# 找到最佳树数量
best_idx = np.argmax(test_scores)
print(f"最佳树数量: {n_estimators_range[best_idx]}")
print(f"最高测试准确率: {test_scores[best_idx]:.4f}")`,
                },
            ],
            table: {
                headers: ["特性", "AdaBoost", "梯度提升 (GBDT)", "XGBoost"],
                rows: [
                    ["基模型", "决策树桩 (depth=1)", "浅层决策树 (3-8)", "浅层决策树"],
                    ["优化目标", "指数损失", "任意可微损失", "正则化目标函数"],
                    ["并行化", "❌ 顺序训练", "❌ 顺序训练", "✅ 特征级并行"],
                    ["学习率", "隐式（由 alpha 控制）", "显式参数 (0.01-0.3)", "显式 + 自适应"],
                    ["正则化", "无", "树深度/数量", "L1/L2 + 列采样"],
                ],
            },
            mermaid: `graph TD
    A["Boosting 迭代流程"] --> B["训练模型 M_t"]
    B --> C["评估错误"]
    C --> D["关注错误样本"]
    D --> E{"达到迭代次数？"}
    E -->|否| B
    E -->|是| F["加权组合所有模型"]
    F --> G["最终预测"]
    class F s1
    class D s0
    classDef s0 fill:#7c2d12
    classDef s1 fill:#14532d`,
            tip: "梯度提升的学习率（learning_rate）和树数量（n_estimators）是一对需要联合调优的超参数。小学习率（0.01-0.05）配合更多树通常比大学习率配合少量树效果更好、更稳定。",
        },
        {
            title: "4. Stacking：元学习器的智慧",
            body: `Stacking（Stacked Generalization）是 Wolpert 在 1992 年提出的集成策略，它比 Bagging 和 Boosting 更进一步：**不是简单地投票或加权平均，而是训练一个「元学习器」来学习如何最佳地组合基模型的预测**。

具体流程分两层：第一层用多种不同类型的模型（比如决策树、SVM、KNN、逻辑回归）在训练集上训练，每个模型对训练集做 K 折交叉验证预测，得到「元特征」。第二层用一个简单的模型（通常是逻辑回归或线性模型）以这些元特征为输入、真实标签为目标进行训练。

**Stacking 的优势在于它能学习基模型之间的互补关系**。比如当决策树在某些区域表现好而 SVM 在另一些区域表现好时，元学习器会自动学会「在区域 A 信任决策树，在区域 B 信任 SVM」。这比简单的多数表决灵活得多。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import cross_val_predict, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 生成数据
X, y = make_classification(n_samples=2000, n_features=15,
                           n_informative=8, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42)

# 第一层：多个不同类型的基模型
level1_models = {
    'rf': RandomForestClassifier(n_estimators=50, random_state=42),
    'svm': SVC(probability=True, random_state=42),
    'knn': KNeighborsClassifier(n_neighbors=7),
}

# 用交叉验证生成元特征
kf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
meta_features_train = np.zeros((len(X_train), len(level1_models)))
meta_features_test = np.zeros((len(X_test), len(level1_models)))

for i, (name, model) in enumerate(level1_models.items()):
    # 训练集上的 OOF 预测
    meta_features_train[:, i] = cross_val_predict(
        model, X_train, y_train, cv=kf, method='predict_proba')[:, 1]
    # 在完整训练集上训练后预测测试集
    model.fit(X_train, y_train)
    meta_features_test[:, i] = model.predict_proba(X_test)[:, 1]
    print(f"{name} 单独准确率: "
          f"{accuracy_score(y_test, model.predict(X_test)):.4f}")

# 第二层：元学习器
meta_learner = LogisticRegression(random_state=42)
meta_learner.fit(meta_features_train, y_train)
stacking_pred = meta_learner.predict(meta_features_test)
print(f"\\nStacking 集成准确率: "
      f"{accuracy_score(y_test, stacking_pred):.4f}")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification

# 可视化元学习器如何组合基模型
np.random.seed(42)

# 模拟 3 个基模型的预测概率
n_samples = 500
model_a_pred = np.clip(
    np.random.beta(3, 2, n_samples), 0.01, 0.99)
model_b_pred = np.clip(
    np.random.beta(2, 3, n_samples), 0.01, 0.99)
model_c_pred = np.clip(
    np.random.beta(2.5, 2.5, n_samples), 0.01, 0.99)

meta_X = np.column_stack(
    [model_a_pred, model_b_pred, model_c_pred])
meta_y = (model_a_pred * 0.5 + model_b_pred * 0.3
          + model_c_pred * 0.2 + np.random.normal(0, 0.05, n_samples) > 0.5
          ).astype(int)

meta_learner = LogisticRegression()
meta_learner.fit(meta_X, meta_y)

print("元学习器学到的权重:")
for name, weight in zip(
        ['模型 A', '模型 B', '模型 C'], meta_learner.coef_[0]):
    print(f"  {name}: {weight:.4f}")

# 不同组合策略对比
strategies = {
    '等权平均': (model_a_pred + model_b_pred + model_c_pred) / 3 > 0.5,
    'Stacking': meta_learner.predict(meta_X),
    '只看模型 A': model_a_pred > 0.5,
}
for name, pred in strategies.items():
    acc = np.mean(pred == meta_y)
    print(f"{name:>12s}: {acc:.4f}")`,
                },
            ],
            table: {
                headers: ["集成策略", "组合方式", "优点", "缺点", "计算成本"],
                rows: [
                    ["Bagging", "投票/平均", "简单、并行、降方差", "忽略模型差异", "中等"],
                    ["Boosting", "加权求和", "降偏差、精度高", "顺序训练慢、易过拟合", "高"],
                    ["Stacking", "元学习器", "灵活、学习互补性", "实现复杂、可能过拟合", "最高"],
                    ["Voting", "硬/软投票", "最简单", "等权不够灵活", "低"],
                ],
            },
            mermaid: `graph TD
    A["训练集"] --> B["基模型 1: 随机森林"]
    A --> C["基模型 2: SVM"]
    A --> D["基模型 3: KNN"]
    B --> E["交叉验证预测"]
    C --> E
    D --> E
    E --> F["元特征矩阵"]
    F --> G["元学习器: 逻辑回归"]
    G --> H["最终预测"]
    class G s1
    class F s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            warning: "Stacking 最容易犯的错误是用基模型在训练集上的预测直接训练元学习器——这会导致严重的数据泄露和过拟合。必须使用 K 折交叉验证（Out-of-Fold）来生成元特征。",
        },
        {
            title: "5. 多样性设计：为什么模型不能太相似",
            body: `**集成学习的核心前提是「多样性」**。如果所有基模型都一模一样，那么集成后的结果和单个模型没有任何区别——10 个完全相同的专家一起投票，和 1 个专家单独决策的效果完全等价。

多样性-误差分解定理（Ambiguity Decomposition）给出了精确的数学刻画：**集成模型的误差 = 基模型的平均误差 - 基模型之间的多样性**。这意味着，即使单个模型的准确率不高，只要它们的错误方向不同（高多样性），集成的效果也会很好。

创造多样性的常见策略有五种：数据多样性（Bootstrap 采样如 Bagging）、特征多样性（随机选择特征子集如随机森林）、模型多样性（使用不同类型的算法如 Stacking）、参数多样性（不同的超参数设置）、以及随机性注入（dropout、噪声扰动）。随机森林同时使用了前三种策略，这也是它在实践中如此强大的原因。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

def analyze_ensemble_diversity():
    """分析集成中多样性和准确率的关系"""
    np.random.seed(42)
    n_models = 20
    n_samples = 1000

    # 模拟不同多样性水平下的集成效果
    diversities = np.linspace(0.1, 0.9, 20)
    ensemble_errors = []

    for div in diversities:
        # 模拟 n_models 个基模型的预测
        individual_error = 0.3  # 每个模型 30% 错误率

        # 多样性越高，错误重叠越少
        overlap = 1 - div
        errors_per_model = np.random.binomial(
            1, individual_error, (n_models, n_samples))

        # 通过重叠度控制模型间错误相关性
        for i in range(1, n_models):
            correlated = np.random.binomial(1, overlap, n_samples)
            independent = np.random.binomial(
                1, individual_error, n_samples)
            errors_per_model[i] = correlated * errors_per_model[0] + \
                (1 - correlated) * independent

        # 多数表决
        ensemble_pred = np.round(
            errors_per_model.mean(axis=0)).astype(int)
        ensemble_error = np.mean(ensemble_pred)
        ensemble_errors.append(ensemble_error)

    plt.figure(figsize=(8, 5))
    plt.plot(diversities, ensemble_errors, 'b-o', linewidth=2)
    plt.xlabel('多样性水平')
    plt.ylabel('集成错误率')
    plt.title('多样性 vs 集成性能')
    plt.grid(alpha=0.3)
    plt.axhline(y=0.3, color='r', linestyle='--',
                label='单模型错误率 (30%)')
    plt.legend()
    plt.show()

analyze_ensemble_diversity()`,
                },
                {
                    lang: "python",
                    code: `from sklearn.ensemble import (
    RandomForestClassifier, VotingClassifier, BaggingClassifier)
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 对比不同多样性策略的效果
X, y = make_classification(n_samples=2000, n_features=20,
                           n_informative=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42)

# 策略 1：同质模型（低多样性）
same_trees = [
    DecisionTreeClassifier(max_depth=5, random_state=i)
    for i in range(10)
]
voting_same = VotingClassifier(
    estimators=[(f'tree_{i}', m) for i, m in enumerate(same_trees)],
    voting='soft')
voting_same.fit(X_train, y_train)

# 策略 2：异构模型（高多样性）
diverse_models = [
    ('rf', RandomForestClassifier(n_estimators=20, random_state=42)),
    ('dt', DecisionTreeClassifier(max_depth=8, random_state=42)),
    ('knn', BaggingClassifier(
        DecisionTreeClassifier(max_depth=8),
        n_estimators=20, random_state=42)),
]
voting_diverse = VotingClassifier(
    estimators=diverse_models, voting='soft')
voting_diverse.fit(X_train, y_train)

print(f"同质模型集成准确率: "
      f"{accuracy_score(y_test, voting_same.predict(X_test)):.4f}")
print(f"异构模型集成准确率: "
      f"{accuracy_score(y_test, voting_diverse.predict(X_test)):.4f}")

# 随机森林：特征多样性
rf = RandomForestClassifier(
    n_estimators=100, max_features='sqrt', random_state=42)
rf.fit(X_train, y_train)
print(f"随机森林 (特征多样性): "
      f"{accuracy_score(y_test, rf.predict(X_test)):.4f}")`,
                },
            ],
            table: {
                headers: ["多样性策略", "实现方式", "代表算法", "多样性来源"],
                rows: [
                    ["数据多样性", "Bootstrap 采样", "Bagging", "训练数据不同"],
                    ["特征多样性", "随机选特征子集", "随机森林", "每个节点看不同特征"],
                    ["模型多样性", "不同算法", "Stacking", "归纳偏置不同"],
                    ["参数多样性", "不同超参数", "网格搜索集成", "决策边界不同"],
                    ["随机性注入", "Dropout/噪声", "深度集成", "训练过程随机"],
                ],
            },
            mermaid: `graph TD
    A["创造多样性"] --> B["数据层"]
    A --> C["特征层"]
    A --> D["模型层"]
    A --> E["参数层"]
    B --> F["Bootstrap 采样"]
    C --> G["Random Subspace"]
    D --> H["不同算法类型"]
    E --> I["超参数扰动"]
    F --> J["高多样性 = 低集成误差"]
    G --> J
    H --> J
    I --> J`,
            tip: "随机森林是多样性设计的教科书案例：Bootstrap 采样（数据多样性）+ 随机特征选择（特征多样性）+ 不剪枝的深树（参数多样性）。单一策略就能提升集成效果，三重叠加则产生质变。",
        },
        {
            title: "6. 集成 vs 单一模型：什么时候需要集成",
            body: `集成学习几乎总是能提高性能，但它不是免费的午餐。我们需要权衡性能提升与额外成本。

从性能角度看，**集成模型在结构化数据（表格数据）上几乎无敌**。在 Kaggle 竞赛中，XGBoost + LightGBM + CatBoost 的 Stacking 组合常年占据榜首。但在深度学习领域，情况有所不同——一个精心调优的大型神经网络往往能匹敌多个模型的集成。

成本方面，集成模型需要更多的训练时间和内存。Bagging 可以并行训练，但 Boosting 必须顺序训练。推理时，集成模型需要运行多个基模型，延迟是单个模型的 N 倍。在实时性要求极高的场景（如高频交易、在线广告竞价），单一模型可能是更好的选择。

模型复杂度也是一个考量。集成模型通常是「黑箱中的黑箱」——每个基模型已经难以解释，集成后更难追溯决策逻辑。**在医疗、金融等需要可解释性的领域，有时单一可解释模型比高精度集成更合适**。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import (
    RandomForestClassifier, GradientBoostingClassifier,
    VotingClassifier)
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
import time

# 性能 vs 成本对比实验
X, y = make_classification(n_samples=10000, n_features=30,
                           n_informative=15, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42)

models = {
    "逻辑回归": LogisticRegression(max_iter=1000),
    "决策树": DecisionTreeClassifier(random_state=42),
    "随机森林 (50)": RandomForestClassifier(
        n_estimators=50, random_state=42),
    "随机森林 (200)": RandomForestClassifier(
        n_estimators=200, random_state=42),
    "梯度提升 (100)": GradientBoostingClassifier(
        n_estimators=100, random_state=42),
    "集成投票": VotingClassifier([
        ('rf', RandomForestClassifier(n_estimators=50, random_state=42)),
        ('gb', GradientBoostingClassifier(n_estimators=50, random_state=42)),
        ('lr', LogisticRegression(max_iter=1000))
    ], voting='soft'),
}

print(f"{'模型':<20s} | {'准确率':>8s} | {'训练时间':>8s} | {'推理时间':>10s}")
print("-" * 55)

for name, model in models.items():
    t0 = time.time()
    model.fit(X_train, y_train)
    train_time = time.time() - t0

    t0 = time.time()
    model.predict(X_test)
    infer_time = time.time() - t0

    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"{name:<20s} | {acc:>7.4f} | {train_time:>7.3f}s | "
          f"{infer_time*1000:>9.1f}ms")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt

def analyze_model_scaling():
    """分析模型数量增加时的性能收益递减"""
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.datasets import make_classification
    from sklearn.model_selection import train_test_split

    X, y = make_classification(n_samples=5000, n_features=20,
                               n_informative=10, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42)

    n_estimators_list = [1, 2, 5, 10, 20, 50, 100, 200, 500]
    accuracies = []

    for n in n_estimators_list:
        rf = RandomForestClassifier(
            n_estimators=n, random_state=42)
        rf.fit(X_train, y_train)
        acc = rf.score(X_test, y_test)
        accuracies.append(acc)
        print(f"n_estimators={n:>4d}: 准确率={acc:.4f}")

    plt.figure(figsize=(8, 5))
    plt.plot(n_estimators_list, accuracies, 'b-o', linewidth=2)
    plt.xscale('log')
    plt.xlabel('树的数量 (对数尺度)')
    plt.ylabel('测试集准确率')
    plt.title('模型数量 vs 性能收益递减')
    plt.grid(alpha=0.3)
    plt.show()

analyze_model_scaling()`,
                },
            ],
            table: {
                headers: ["场景", "推荐策略", "理由"],
                rows: [
                    ["Kaggle 竞赛", "XGBoost + LightGBM + Stacking", "精度优先，不计成本"],
                    ["生产环境（离线）", "随机森林 / 梯度提升", "精度与速度的平衡"],
                    ["实时推理 (<10ms)", "单棵浅树 / 逻辑回归", "延迟要求严格"],
                    ["医疗/金融合规", "单模型（可解释）", "需要追溯决策逻辑"],
                    ["数据量极大 (百万级)", "LightGBM / 单深度模型", "训练效率优先"],
                ],
            },
            mermaid: `graph TD
    A["是否需要集成？"] --> B{"性能要求？"}
    B -->|极致精度| C["✅ 使用集成"]
    B -->|足够好| D{"延迟敏感？"}
    D -->|是| E["❌ 用单一模型"]
    D -->|否| F{"可解释性要求？"}
    F -->|是| E
    F -->|否| C
    C --> G["选择集成策略"]
    E --> H["选择单一模型"]
    G --> I["Bagging/Boosting/Stacking"]
    H --> J["树/线性/深度学习"]`,
            warning: "集成不是越多越好。从 1 棵树到 50 棵树可能带来 5% 的准确率提升，但从 200 棵到 500 棵可能只有 0.1%。学会识别收益递减点，在性能和成本之间找到最优平衡。",
        },
        {
            title: "7. 实战：VotingClassifier 与 StackingClassifier",
            body: `scikit-learn 提供了两个高级集成 API：VotingClassifier（投票分类器）和 StackingClassifier（堆叠分类器）。掌握这两个工具，你就可以在几行代码内构建强大的集成模型。

VotingClassifier 支持两种模式：硬投票（hard voting）是多数表决，每个模型投一票，选出票数最多的类别；软投票（soft voting）是概率平均，每个模型输出各类别的概率，取平均后选概率最大的类别。**软投票通常效果更好，但要求所有基模型都支持 predict_proba**。

StackingClassifier 实现了完整的两层堆叠流程：你只需指定基模型列表和最终估计器（final_estimator），sklearn 自动处理交叉验证生成元特征。final_estimator 默认使用逻辑回归，你也可以换成任何其他模型。cv 参数控制交叉验证折数，5 折是一个稳健的默认值。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.ensemble import (
    VotingClassifier, StackingClassifier,
    RandomForestClassifier, GradientBoostingClassifier)
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report
import numpy as np

# 加载数据
data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.25, random_state=42)

# 基模型集合
estimators = [
    ('rf', RandomForestClassifier(n_estimators=100, random_state=42)),
    ('svm', SVC(probability=True, random_state=42)),
    ('knn', KNeighborsClassifier(n_neighbors=7)),
    ('gb', GradientBoostingClassifier(n_estimators=50, random_state=42)),
]

# 硬投票
hard_voting = VotingClassifier(estimators=estimators, voting='hard')
# 软投票
soft_voting = VotingClassifier(estimators=estimators, voting='soft')
# Stacking
stacking = StackingClassifier(
    estimators=estimators,
    final_estimator=LogisticRegression(max_iter=1000),
    cv=5, stack_method='predict_proba', n_jobs=-1)

# 评估对比
for name, model in [('硬投票', hard_voting),
                     ('软投票', soft_voting),
                     ('Stacking', stacking)]:
    cv_score = cross_val_score(model, X_train, y_train, cv=5).mean()
    model.fit(X_train, y_train)
    test_score = model.score(X_test, y_test)
    print(f"{name:>10s}: CV={cv_score:.4f}, Test={test_score:.4f}")

print(f"\\nStacking 详细报告:")
print(classification_report(
    y_test, stacking.predict(X_test), target_names=data.target_names))`,
                },
                {
                    lang: "python",
                    code: `from sklearn.ensemble import (
    StackingClassifier, RandomForestClassifier,
    GradientBoostingClassifier)
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np

# 高级 Stacking：多层次的元特征分析
X, y = make_classification(n_samples=3000, n_features=20,
                           n_informative=10, n_classes=2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42)

# 第一层基模型：三种不同类型
level1 = [
    ('rf', RandomForestClassifier(n_estimators=50, random_state=42)),
    ('gb', GradientBoostingClassifier(n_estimators=50, random_state=42)),
]

# 第二层 Stacking：用 RF 做最终估计器
stacking_rf = StackingClassifier(
    estimators=level1,
    final_estimator=RandomForestClassifier(
        n_estimators=100, random_state=42),
    cv=5, n_jobs=-1)

# 对比：用逻辑回归做最终估计器（默认）
stacking_lr = StackingClassifier(
    estimators=level1,
    final_estimator=LogisticRegression(max_iter=1000),
    cv=5, n_jobs=-1)

for name, model in [('Stacking+LR', stacking_lr),
                     ('Stacking+RF', stacking_rf)]:
    model.fit(X_train, y_train)
    print(f"{name}: Train={model.score(X_train, y_train):.4f}, "
          f"Test={model.score(X_test, y_test):.4f}")

# 查看元特征重要性（仅适用于树型 final_estimator）
stacking_rf.fit(X_train, y_train)
if hasattr(stacking_rf.final_estimator_, 'feature_importances_'):
    importances = stacking_rf.final_estimator_.feature_importances_
    for i, imp in enumerate(importances):
        print(f"  基模型 {i+1} 重要性: {imp:.4f}")`,
                },
            ],
            table: {
                headers: ["API", "组合方式", "基模型要求", "推荐场景"],
                rows: [
                    ["VotingClassifier (hard)", "多数表决", "任意分类器", "快速基线"],
                    ["VotingClassifier (soft)", "概率平均", "支持 predict_proba", "大多数场景"],
                    ["StackingClassifier", "元学习器", "支持交叉验证预测", "追求最高精度"],
                    ["VotingRegressor", "平均/中位数", "任意回归器", "回归任务集成"],
                ],
            },
            mermaid: `graph TD
    A["sklearn 集成 API"] --> B["VotingClassifier"]
    A --> C["StackingClassifier"]
    B --> D["hard: 多数表决"]
    B --> E["soft: 概率平均"]
    C --> F["自定义基模型"]
    F --> G["交叉验证元特征"]
    G --> H["final_estimator"]
    H --> I["最终预测"]
    E --> I
    D --> I`,
            tip: "实战建议：先用 VotingClassifier (soft) 快速验证集成的可行性，再用 StackingClassifier 榨取最后 1-2% 的精度提升。Stacking 的 cv=5 是稳健默认值，数据量大时可降到 cv=3 节省时间。",
        },
    ],
};
