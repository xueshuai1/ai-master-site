import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-006",
    title: "随机森林：Bagging 与特征重要性",
    category: "ml",
    tags: ["集成学习", "决策树", "Bagging"],
    summary: "从 Bagging 到特征重要性，理解随机森林的强大之处",
    date: "2026-04-12",
    readTime: "18 min",
    level: "入门",
    content: [
      {
        title: "1. 从决策树到随机森林",
        body: `决策树是直觉上最容易理解的机器学习算法——它模拟了人类做决策的方式：通过一系列"如果...那么..."的判断来分类或预测。但决策树有一个致命弱点：它太容易过拟合了。一棵充分生长的树会"记住"训练集中的每一个样本，包括噪声和异常值。

随机森林的核心洞察来自一个古老而朴素的智慧：集体的智慧胜过个人的判断。如果一棵树容易过拟合，那我们就种一片森林，让每棵树学习数据的不同切面，最后通过投票来综合所有树的判断。

但问题来了：如果所有树都看到相同的数据，它们会学到相同的东西，投票没有意义。随机森林通过两个随机化手段来解决这个问题：数据采样随机性（Bagging）——每棵树训练时从原始数据中有放回地抽取一个子集；特征采样随机性——每个节点分裂时只考虑一个随机子集的特征。这两个随机化确保了森林中的每棵树都有足够的差异性。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

X, y = make_classification(
    n_samples=1000, n_features=20, n_informative=10, random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 单棵决策树
single_tree = DecisionTreeClassifier(random_state=42)
single_tree.fit(X_train, y_train)
print(f"单棵决策树准确率: {accuracy_score(y_test, single_tree.predict(X_test)):.4f}")

# 手动实现随机森林（简化版）
class SimpleRandomForest:
    def __init__(self, n_trees=100, max_depth=10, max_features='sqrt', random_state=None):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.max_features = max_features
        self.trees = []
        self.rng = np.random.RandomState(random_state)

    def fit(self, X, y):
        n_samples = X.shape[0]
        for _ in range(self.n_trees):
            # Bagging: 有放回采样
            indices = self.rng.choice(n_samples, n_samples, replace=True)
            X_boot, y_boot = X[indices], y[indices]

            tree = DecisionTreeClassifier(
                max_depth=self.max_depth,
                max_features=self.max_features,
                random_state=self.rng.randint(0, 10000)
            )
            tree.fit(X_boot, y_boot)
            self.trees.append(tree)

    def predict(self, X):
        predictions = np.array([tree.predict(X) for tree in self.trees])
        # 投票：选择得票最多的类别
        return np.array([
            np.bincount(predictions[:, i]).argmax()
            for i in range(X.shape[0])
        ])

my_rf = SimpleRandomForest(n_trees=100, max_depth=10, random_state=42)
my_rf.fit(X_train, y_train)
print(f"随机森林准确率: {accuracy_score(y_test, my_rf.predict(X_test)):.4f}")`,
          },
        ],
        table: {
          headers: ["特性", "单棵决策树", "随机森林", "对比"],
          rows: [
            ["过拟合倾向", "高", "低（平均化减少方差）", "森林显著优于单树"],
            ["训练速度", "快", "可并行", "森林训练稍慢但可并行化"],
            ["预测速度", "快", "慢（需预测所有树）", "森林预测较慢"],
            ["特征重要性", "可用但不稳定", "稳定可靠", "森林的特征重要性更可信赖"],
          ],
        },
        mermaid: `graph TD
    A["原始训练集"] --> B["Bagging 有放回采样"]
    B --> C["子数据集 1"]
    B --> D["子数据集 2"]
    B --> E["子数据集 N"]
    C --> F["决策树 1"]
    D --> G["决策树 2"]
    E --> H["决策树 N"]
    F --> I["投票/平均"]
    G --> I
    H --> I
    I --> J["最终预测"]`,
        tip: "随机森林的树越多越好——增加树的数量不会导致过拟合，只会让预测更稳定。一般 100-500 棵树就够了。",
      },
      {
        title: "2. Bagging：Bootstrap Aggregating 的原理",
        body: `Bagging（Bootstrap Aggregating）是 Leo Breiman 在 1996 年提出的集成学习方法。它基于一个简单而深刻的统计学概念：自助法（Bootstrap）。

自助法的核心是：从原始数据中有放回地随机抽取样本，形成新的数据集。由于是有放回的，每次抽样大约会有 36.8% 的原始样本不被选中（称为 out-of-bag 样本），这些样本可以用作天然的验证集。

Bagging 为什么有效？从偏差-方差分解的角度看，模型的误差 = 偏差² + 方差 + 噪声。决策树的偏差很低（它能很好地拟合训练数据），但方差很高（数据稍有变化就会产生完全不同的树）。Bagging 通过训练多棵树并取平均，显著降低了方差，同时几乎不增加偏差。这就是随机森林比单棵树更准确的数学解释。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt

# 演示 Bagging 降低方差的原理
np.random.seed(42)
n_datasets = 50
n_samples = 100

# 生成带噪声的数据
true_func = lambda x: np.sin(2 * x)
X = np.random.uniform(-3, 3, (n_datasets, n_samples))
y = true_func(X) + np.random.normal(0, 0.5, (n_datasets, n_samples))

# 用不同深度的决策树拟合
from sklearn.tree import DecisionTreeRegressor

x_test = np.linspace(-3, 3, 200).reshape(-1, 1)
single_preds = []
bagged_preds = []

for i in range(n_datasets):
    tree = DecisionTreeRegressor(max_depth=5, random_state=i)
    tree.fit(X[i].reshape(-1, 1), y[i])
    single_preds.append(tree.predict(x_test))

single_preds = np.array(single_preds)
bagged_preds = single_preds.mean(axis=0)

plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
for i in range(10):
    plt.plot(x_test, single_preds[i], alpha=0.3, color='blue')
plt.plot(x_test, true_func(x_test), 'r-', linewidth=2, label='真实函数')
plt.title('单棵决策树（高方差）')

plt.subplot(1, 2, 2)
plt.plot(x_test, bagged_preds, 'g-', linewidth=3, label='Bagging 平均')
plt.plot(x_test, true_func(x_test), 'r--', linewidth=2, label='真实函数')
plt.title('Bagging 平均（低方差）')
plt.tight_layout()
plt.show()`,
          },
        ],
        table: {
          headers: ["抽样比例", "OOB 比例", "偏差", "方差"],
          rows: [
            ["100% 有放回", "36.8%", "与原始树相同", "降低约 1/n_trees"],
            ["无放回", "0%", "可能增加", "效果有限"],
            ["子采样 <100%", "剩余比例", "略增", "方差降低更多"],
          ],
        },
        mermaid: `graph TD
    A["偏差-方差分解"] --> B["误差 = 偏差² + 方差 + 噪声"]
    B --> C["决策树: 低偏差, 高方差"]
    B --> D["线性模型: 高偏差, 低方差"]
    C --> E["Bagging: 降低方差"]
    D --> F["Boosting: 降低偏差"]
    E --> G["随机森林"]
    F --> H["梯度提升树"]`,
        warning: "Bagging 对高方差低偏差的模型（如深决策树）效果最好。对高偏差模型（如浅树、线性模型）效果有限。",
      },
      {
        title: "3. 随机森林的两大随机化",
        body: `随机森林的"随机"体现在两个层面。第一个是数据的随机化——Bagging 的有放回采样。第二个是特征的随机化——每个节点分裂时，不是从所有特征中选最优，而是从随机抽取的一个特征子集中选最优。

这两个随机化缺一不可。如果只有数据随机化而没有特征随机化，森林中的树仍然可能高度相似——因为最强的那个特征几乎总会被所有树选中，导致所有树的结构趋同。特征随机化强制每棵树考虑不同的特征组合，增加了树的多样性。

特征子集的大小是一个关键超参数。sklearn 中用 max_features 控制：'sqrt'（分类任务默认）表示每次取 sqrt(F) 个特征；'log2' 表示取 log2(F)；1.0 表示使用所有特征（此时退化为 Bagging 的决策树集合）。较小的 max_features 增加树的多样性但可能降低单棵树的质量；较大的 max_features 反之。经验法则：分类任务用 'sqrt'，回归任务用 1/3。`,
        code: [
          {
            lang: "python",
            code: `# 探索 max_features 对随机森林性能的影响
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.datasets import make_classification

X, y = make_classification(
    n_samples=2000, n_features=50, n_informative=15,
    n_redundant=10, random_state=42
)

max_features_options = ['sqrt', 'log2', 0.3, 0.5, 0.8, 1.0]

results = []
for mf in max_features_options:
    rf = RandomForestClassifier(
        n_estimators=100, max_features=mf, random_state=42, n_jobs=-1
    )
    scores = cross_val_score(rf, X, y, cv=5, scoring='accuracy')
    results.append({
        'max_features': mf,
        'mean': scores.mean(),
        'std': scores.std()
    })

print(f"{'max_features':>12} | {'准确率':>8} | {'标准差':>8}")
print("-" * 35)
for r in results:
    mf_str = str(r['max_features'])
    print(f"{mf_str:>12} | {r['mean']:>8.4f} | {r['std']:>8.4f}")`,
          },
        ],
        table: {
          headers: ["max_features", "含义", "树的多样性", "单棵树质量", "适用场景"],
          rows: [
            ["'sqrt'", "取 sqrt(F) 个特征", "高", "中等", "分类任务（默认）"],
            ["'log2'", "取 log2(F) 个特征", "很高", "较低", "高维数据"],
            ["0.3-0.5", "固定比例", "可调", "可调", "需要调优时"],
            ["1.0", "所有特征", "低", "高", "退化为 Bagging"],
          ],
        },
        mermaid: `graph TD
    A["节点分裂"] --> B["随机选择 K 个特征"]
    B --> C["在 K 个特征中找最优分割"]
    C --> D["计算信息增益/Gini"]
    D --> E["选择最优分割点"]
    E --> F["分裂为左右子节点"]
    F -.->|递归| A`,
        tip: "如果你的数据集特征很多（>100 个），尝试 max_features='log2' 可以加速训练且通常不会降低精度。",
      },
      {
        title: "4. 特征重要性：随机森林的独特优势",
        body: `随机森林最迷人的特性之一是可以天然地给出特征重要性评估。这在很多实际场景中极其重要——你不仅想知道"预测结果是什么"，还想知道"为什么是这个结果"。

特征重要性的计算有两种主流方法。第一种是 Gini 重要性（也叫平均不纯度减少）：对于每棵树，每次用特征 X 分裂节点时，计算不纯度（Gini 或 Entropy）的减少量，然后把所有树中所有使用 X 的分裂的不纯度减少量求平均。减少量越大，特征越重要。

第二种是排列重要性（Permutation Importance）：训练好模型后，随机打乱某个特征的值，重新评估模型性能。如果打乱后性能显著下降，说明这个特征很重要；如果性能几乎不变，说明这个特征不重要。排列重要性比 Gini 重要性更可靠，因为它不依赖于训练集上的表现，而是在测试集上直接测量。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.datasets import make_classification
import matplotlib.pyplot as plt
import numpy as np

# 生成数据（10 个信息特征 + 10 个噪声特征）
X, y = make_classification(
    n_samples=1000, n_features=20, n_informative=10,
    n_redundant=0, n_repeated=0, random_state=42
)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X, y)

# 方法 1: Gini 重要性
gini_importances = rf.feature_importances_

# 方法 2: 排列重要性
perm_importance = permutation_importance(
    rf, X, y, n_repeats=10, random_state=42, n_jobs=-1
)

# 可视化对比
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

indices = np.argsort(gini_importances)[-15:]
axes[0].barh(range(len(indices)), gini_importances[indices])
axes[0].set_yticks(range(len(indices)))
axes[0].set_yticklabels([f'Feature {i}' for i in indices])
axes[0].set_title('Gini 重要性')

perm_means = perm_importance.importances_mean
perm_indices = np.argsort(perm_means)[-15:]
axes[1].barh(range(len(perm_indices)), perm_means[perm_indices])
axes[1].set_yticks(range(len(perm_indices)))
axes[1].set_yticklabels([f'Feature {i}' for i in perm_indices])
axes[1].set_title('排列重要性')
plt.tight_layout()
plt.show()`,
          },
        ],
        table: {
          headers: ["方法", "计算方式", "优点", "缺点"],
          rows: [
            ["Gini 重要性", "不纯度减少量平均", "免费（训练时计算）, 快速", "偏向高基数特征, 训练集上评估"],
            ["排列重要性", "打乱后性能下降", "更可靠, 测试集上评估", "需要额外计算"],
            ["SHAP 值", "博弈论分配", "最精确, 个体解释", "计算开销大"],
            ["Drop-column", "去掉特征重训", "最直观", "极慢（需重新训练）"],
          ],
        },
        mermaid: `graph TD
    A["随机森林训练完成"] --> B{"特征重要性方法?"}
    B -->|"Gini"| C["Σ 不纯度减少量 / 树数量"]
    B -->|"排列"| D["打乱特征 → 测性能下降"]
    B -->|"SHAP"| E["博弈论值计算"]
    C --> F["特征重要性排名"]
    D --> F
    E --> F
    F --> G["特征选择/降维"]
    F --> H["业务洞察"]`,
        warning: "Gini 重要性偏向基数高的特征（如连续变量、类别多的分类变量）。做特征选择时建议用排列重要性。",
      },
      {
        title: "5. OOB 评估：天然的交叉验证",
        body: `随机森林有一个内置的验证机制叫 OOB（Out-of-Bag）评估。由于 Bagging 是有放回采样，每棵树训练时大约只用了 63.2% 的原始样本。剩下的 36.8% 样本（即没有在这棵树的训练集中出现的样本）可以作为这棵树的天然验证集。

具体来说，对于每个样本 xᵢ，我们只使用那些训练时没有见过 xᵢ 的树来预测它，然后综合所有相关树的预测作为 xᵢ 的 OOB 预测。所有样本的 OOB 预测的准确率就是 OOB 得分。

OOB 得分是一个几乎免费的模型评估指标——它不需要额外的验证集，也不需要交叉验证的重复训练。对于大数据集，OOB 得分与 K 折交叉验证的结果高度一致。这在数据量有限时特别有用，因为你可以把所有数据都用于训练，同时仍然得到可靠的性能估计。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
import numpy as np

# 使用 OOB 评估
rf_oob = RandomForestClassifier(
    n_estimators=100, oob_score=True, random_state=42
)
rf_oob.fit(X_train, y_train)

print(f"OOB 得分: {rf_oob.oob_score_:.4f}")
print(f"测试集准确率: {rf_oob.score(X_test, y_test):.4f}")

# 用树的数量做实验，观察 OOB 得分的收敛性
n_trees_range = range(10, 500, 10)
oob_scores = []

for n in n_trees_range:
    rf = RandomForestClassifier(n_estimators=n, oob_score=True, random_state=42)
    rf.fit(X_train, y_train)
    oob_scores.append(rf.oob_score_)

import matplotlib.pyplot as plt
plt.figure(figsize=(10, 5))
plt.plot(list(n_trees_range), oob_scores, 'b-', linewidth=2)
plt.axhline(y=rf_oob.oob_score_, color='r', linestyle='--', label=f'最终 OOB: {rf_oob.oob_score_:.4f}')
plt.xlabel('树的数量')
plt.ylabel('OOB 得分')
plt.title('OOB 得分随树数量的收敛')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()`,
          },
        ],
        table: {
          headers: ["评估方法", "数据利用率", "计算开销", "可靠性"],
          rows: [
            ["训练集评估", "100% 训练", "极低", "低（过拟合乐观估计）"],
            ["OOB 评估", "100% 训练", "极低（免费）", "中高"],
            ["K 折交叉验证", "(K-1)/K 训练", "K 倍训练", "高"],
            ["留出法", "<100% 训练", "1 倍训练", "高（但浪费数据）"],
          ],
        },
        mermaid: `graph TD
    A["Bagging 采样"] --> B["63.2％ 样本在训练集中"]
    A --> C["36.8％ 样本不在训练集中 (OOB)"]
    B --> D["用这些树预测 OOB 样本"]
    C --> D
    D --> E["OOB 预测 → OOB 得分"]
    E --> F["≈ 交叉验证结果"]`,
        tip: "当你数据量不大时（<5000 条），打开 oob_score=True 可以省去额外的验证集，充分利用所有数据。",
      },
      {
        title: "6. 随机森林 vs 其他集成方法",
        body: `在集成学习的世界中，随机森林只是冰山一角。它属于 Bagging 家族，而另一个大家族是 Boosting。两者的核心区别在于：Bagging 的树是并行独立训练的（每棵树不知道其他树的存在），而 Boosting 的树是串行训练的（每棵树都在纠正前一棵树的错误）。

XGBoost、LightGBM、CatBoost 都属于 Boosting 家族，它们通常在结构化数据的预测竞赛中比随机森林表现更好。但随机森林有几个不可替代的优势：它几乎不需要调参（默认的 n_estimators=100, max_depth=None 通常就很好了）；它对异常值和噪声更鲁棒（因为每棵树只看到部分数据）；它天然支持并行训练（每棵树独立）；它的 OOB 评估提供了免费的性能估计。

选择建议：快速原型 → 随机森林；追求极致精度 → XGBoost/LightGBM；数据有类别特征 → CatBoost；需要概率估计 → 随机森林（校准后）。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import time

X, y = make_classification(
    n_samples=5000, n_features=30, n_informative=15, random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

classifiers = {
    'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
    'Gradient Boosting': GradientBoostingClassifier(
        n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42
    ),
}

for name, clf in classifiers.items():
    start = time.time()
    clf.fit(X_train, y_train)
    train_time = time.time() - start

    start = time.time()
    acc = clf.score(X_test, y_test)
    pred_time = time.time() - start

    print(f"{name:25s} | 准确率: {acc:.4f} | 训练: {train_time:.3f}s | 预测: {pred_time:.3f}s")`,
          },
        ],
        table: {
          headers: ["方法", "训练方式", "偏差-方差", "调参难度", "典型场景"],
          rows: [
            ["随机森林", "并行 Bagging", "降低方差", "低", "快速基线"],
            ["XGBoost", "串行 Boosting", "降低偏差", "高", "竞赛/生产"],
            ["LightGBM", "串行 Boosting+直方图", "降低偏差", "中", "大规模数据"],
            ["CatBoost", "串行 Boosting+有序目标", "降低偏差", "低", "类别特征多"],
          ],
        },
        mermaid: `graph LR
    A["集成学习"] --> B["Bagging"]
    A --> C["Boosting"]
    A --> D["Stacking"]
    B --> E["随机森林"]
    C --> F["AdaBoost"]
    C --> G["Gradient Boosting"]
    C --> H["XGBoost/LightGBM"]
    D --> I["元学习器组合"]`,
        warning: "随机森林不能外推。如果测试集的特征值范围超过训练集，随机森林的预测会被限制在训练集的范围内。回归任务要特别注意这一点。",
      },
      {
        title: "7. 实战：用随机森林做特征选择与建模",
        body: `在实际项目中，随机森林最常见的用途不只是最终模型，而是特征选择器。一个包含 100 个特征的数据集，用随机森林的特征重要性排序，去掉最不重要的 50% 特征，再用精化后的特征子集训练最终的模型（可以是随机森林，也可以是 XGBoost 或神经网络），这几乎是一个万能的特征选择流程。

完整的机器学习项目流程应该是：数据探索 → 预处理（缺失值处理、编码、标准化）→ 基线模型（随机森林）→ 特征选择 → 模型优化（超参数调优）→ 集成 → 评估。随机森林在这个流程中既是基线模型又是特征选择器，一石二鸟。

实战中要注意的几点：类别特征需要先编码（Label Encoding 或 One-Hot Encoding）；类别不平衡可以通过 class_weight='balanced' 或 SMOTE 处理；大规模数据可以用 sklearn 的 HistGradientBoostingClassifier 替代——它用直方图近似，速度更快。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

# 完整的随机森林建模流程
# 步骤 1: 用随机森林做特征选择
rf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)

# 选择重要性在前 60% 的特征
threshold = np.percentile(rf.feature_importances_, 40)
important_features = np.where(rf.feature_importances_ >= threshold)[0]
print(f"选择了 {len(important_features)}/{X_train.shape[1]} 个特征")

# 步骤 2: 用精选特征重新训练
X_train_sel = X_train[:, important_features]
X_test_sel = X_test[:, important_features]

# 步骤 3: 超参数调优
param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [None, 10, 20, 30],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
}

rf_grid = RandomForestClassifier(random_state=42, n_jobs=-1)
grid = GridSearchCV(rf_grid, param_grid, cv=3, scoring='accuracy', n_jobs=-1)
grid.fit(X_train_sel, y_train)

print(f"最佳参数: {grid.best_params_}")
print(f"交叉验证准确率: {grid.best_score_:.4f}")
print(f"测试集准确率: {grid.score(X_test_sel, y_test):.4f}")

# 详细报告
y_pred = grid.predict(X_test_sel)
print(classification_report(y_test, y_pred))`,
          },
        ],
        table: {
          headers: ["超参数", "作用", "推荐范围", "影响程度"],
          rows: [
            ["n_estimators", "树的数量", "100-500", "越多越好，但收益递减"],
            ["max_depth", "树的最大深度", "None/10-30", "控制过拟合"],
            ["min_samples_split", "分裂最小样本数", "2-20", "值越大树越简单"],
            ["min_samples_leaf", "叶节点最小样本数", "1-10", "控制过拟合"],
            ["max_features", "每次分裂考虑的特征数", "sqrt/log2", "控制树的多样性"],
          ],
        },
        mermaid: `graph TD
    A["原始数据集"] --> B["随机森林特征重要性"]
    B --> C["去除不重要特征"]
    C --> D["精选特征子集"]
    D --> E["超参数网格搜索"]
    E --> F["最优模型"]
    F --> G["测试集评估"]
    G --> H{"满意?"}
    H -->|否| B
    H -->|是| I["部署"]`,
        tip: "网格搜索很耗时。先用随机搜索（RandomizedSearchCV）缩小范围，再用网格搜索微调，效率更高。",
      },
    ],
};
