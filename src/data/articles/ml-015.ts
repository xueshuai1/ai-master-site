import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-015",
    title: "CatBoost：类别特征处理专家",
    category: "ml",
    tags: ["CatBoost", "类别特征", "梯度提升"],
    summary: "从有序 boosting 到目标编码，掌握 CatBoost 的核心创新",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 类别特征的挑战：One-Hot vs Target Encoding",
            body: `在实际机器学习任务中，类别特征（Categorical Features）无处不在——城市名称、商品类别、用户等级等。传统梯度提升树（如 XGBoost）无法直接处理类别特征，必须进行编码转换。

One-Hot 编码是最直观的方法：将一个有 K 个取值的类别特征扩展为 K 个二值列。但当 K 很大时（例如城市名有上千种），会导致特征维度爆炸，树分裂效率急剧下降，且引入大量稀疏列，浪费内存和计算资源。

Target Encoding 用类别对应的目标变量均值替代原始类别，例如将"北京"替换为北京样本的平均房价。这种方法保持了单一特征维度，但存在严重的目标泄露（Target Leakage）问题——用包含自身的统计量编码训练样本，导致模型在训练集上过拟合，泛化能力下降。

CatBoost 的出现正是为了解决这个两难困境：既不增加维度，又不泄露信息。`,
            code: [
                {
                    lang: "python",
                    code: `import pandas as pd
import numpy as np

# 构造含高基数类别特征的模拟数据
np.random.seed(42)
n_samples = 10000
n_cities = 500

df = pd.DataFrame({
    "city": np.random.choice([f"city_{i}" for i in range(n_cities)], n_samples),
    "category": np.random.choice(["A", "B", "C", "D"], n_samples),
    "age": np.random.randint(18, 70, n_samples),
})
# 目标变量：与城市和类别相关
df["target"] = (
    df["city"].map({f"city_{i}": np.random.randn() for i in range(n_cities)})
    + df["category"].map({"A": 1.2, "B": 0.5, "C": -0.3, "D": -1.0})
    + np.random.randn(n_samples) * 0.5
)`
                },
                {
                    lang: "python",
                    code: `from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
import category_encoders as ce

X = df[["city", "category", "age"]]
y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# One-Hot 编码：维度爆炸
ohe = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
X_train_ohe = ohe.fit_transform(X_train)
print(f"One-Hot 后维度: {X_train_ohe.shape[1]}")

# Target Encoding：简单但有泄露风险
te = ce.TargetEncoder(cols=["city", "category"])
X_train_te = te.fit_transform(X_train, y_train)
X_test_te = te.transform(X_test)
print(f"Target Encoding 后维度: {X_train_te.shape[1]}")`
                }
            ],
            table: {
                headers: ["编码方式", "维度变化", "泄露风险", "适用场景"],
                rows: [
                    ["One-Hot", "K 倍膨胀", "无", "低基数（K < 50）"],
                    ["Target Encoding", "不变", "高", "需谨慎交叉验证"],
                    ["Label Encoding", "不变", "中", "有序类别"],
                    ["CatBoost 内置", "不变", "极低", "任意基数"],
                ]
            },
            mermaid: `graph TD
    A["原始类别特征"] --> B{"基数大小？"}
    B -->|"低基数 K<50"| C["One-Hot 编码"]
    B -->|"高基数 K>50"| D["Target Encoding"]
    D --> E["目标泄露风险"]
    C --> F["维度爆炸"]
    E --> G["CatBoost 有序编码"]
    F --> G
    G --> H["安全高效"]`,
            tip: "高基数类别特征（如城市、商品 ID）优先选择 CatBoost 内置处理，而非手动编码",
            warning: "简单 Target Encoding 在训练集上的 RMSE 可能远低于测试集，这是典型的目标泄露信号"
        },
        {
            title: "2. 有序目标编码（Ordered Target Encoding）",
            body: `CatBoost 的核心创新之一是有序目标编码（Ordered Target Encoding），它巧妙地解决了传统 Target Encoding 的目标泄露问题。

传统方法的泄露根源在于：编码时用了包含当前样本自身在内的全部训练数据的统计量。CatBoost 的做法是——对于每个样本，只用它"之前"出现的样本来计算统计量。具体而言，CatBoost 会在训练时对数据进行随机排列（permutation），然后对于排列中的第 i 个样本，仅用前 i-1 个样本的统计量来编码。

这种"向前看"的策略保证了编码过程不使用当前样本或未来样本的信息，从根本上消除了目标泄露。数学表达为：对于样本 i，其类别 c 的编码值为前 i-1 个样本中类别为 c 的目标均值，加上一个先验项（prior）以增强小样本类别的稳定性。

先验项的引入是另一个精妙设计：当某个类别出现次数很少时，编码值会被拉向全局均值，避免极端值造成的过拟合。这相当于贝叶斯估计中的先验分布，样本量越大，编码值越接近真实的条件均值。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

class OrderedTargetEncoder:
    """从零实现有序目标编码——理解 CatBoost 核心机制"""

    def __init__(self, prior_count=1.0, prior_value=None):
        self.prior_count = prior_count  # 先验样本数（平滑参数）
        self.prior_value = prior_value  # 先验值（全局均值）

    def fit_transform(self, X_col, y):
        """对单列类别特征进行有序目标编码"""
        n = len(y)
        self.prior_value = np.mean(y)
        encoded = np.zeros(n, dtype=np.float64)

        # 累计统计量
        count_sum = {}   # 类别 -> 出现次数累计
        target_sum = {}  # 类别 -> 目标值累计

        for i in range(n):
            cat = X_col.iloc[i]
            if cat not in count_sum:
                count_sum[cat] = 0
                target_sum[cat] = 0.0

            count = count_sum[cat]
            t_sum = target_sum[cat]

            # 有序编码 = 累计均值 + 先验平滑
            encoded[i] = (t_sum + self.prior_value * self.prior_count) / \
                         (count + self.prior_count)

            # 更新累计统计量（在当前样本编码之后！）
            count_sum[cat] += 1
            target_sum[cat] += y.iloc[i]

        return encoded

# 使用示例
X_train_copy = X_train.copy()
encoder = OrderedTargetEncoder(prior_count=1.0)
X_train_copy["city_encoded"] = encoder.fit_transform(X_train["city"], y_train)`
                },
                {
                    lang: "python",
                    code: `# CatBoost 内置的有序编码（生产环境应直接使用）
from catboost import CatBoostRegressor, Pool

# 声明类别特征列
cat_features = ["city", "category"]

train_pool = Pool(
    data=X_train,
    label=y_train,
    cat_features=cat_features
)

model = CatBoostRegressor(
    iterations=500,
    learning_rate=0.05,
    depth=6,
    # CatBoost 自动对 cat_features 使用有序目标编码
    verbose=100,
    random_seed=42
)
model.fit(train_pool)

# 评估
test_pool = Pool(data=X_test, cat_features=cat_features)
preds = model.predict(test_pool)
mse = np.mean((preds - y_test) ** 2)
print(f"测试集 MSE: {mse:.4f}")
print(f"测试集 RMSE: {np.sqrt(mse):.4f}")`
                }
            ],
            table: {
                headers: ["参数", "作用", "默认值", "调优方向"],
                rows: [
                    ["prior_count", "先验样本数（平滑强度）", "1.0", "高基数增大，低基数减小"],
                    ["one_hot_max_size", "低于此值使用 One-Hot", "2", "小类别多时增大"],
                    ["max_ctr_complexity", "最大特征组合深度", "4", "过拟合时减小"],
                    ["has_time", "数据有时序性", "False", "时间序列设为 True"],
                ]
            },
            mermaid: `graph LR
    A["样本排列"] --> B["遍历样本 i"]
    B --> C["用前 i-1 个样本计算统计量"]
    C --> D["编码 = 累计均值 + 先验"]
    D --> E["更新累计统计量"]
    E --> B
    B -->|"遍历完"| F["编码完成"]
    class F s1
    class D s0
    classDef s0 fill:#78350f,color:#f1f5f9
    classDef s1 fill:#064e3b,color:#f1f5f9`,
            tip: "prior_count 越大编码越平滑，对稀有类别效果更好；一般从 1.0 开始调优",
            warning: "有序编码的结果依赖于排列顺序，CatBoost 默认使用多个排列取平均来降低方差"
        },
        {
            title: "3. 有序 Boosting：防止数据泄露",
            body: `CatBoost 的另一个核心创新是有序 Boosting（Ordered Boosting），它从 boosting 过程本身的角度进一步防止了目标泄露。

在传统的梯度提升算法中（如 XGBoost、LightGBM），每棵树都是在全量训练集上拟合残差。这意味着第 t 棵树的训练数据中包含了之前所有树见过的样本，残差的计算使用了全局信息。当数据中存在目标泄露的编码特征时，这种全量训练模式会放大泄露效应。

CatBoost 的有序 Boosting 采用了与有序编码相同的思想：对于每个样本，在计算其残差时，只使用排列中它"之前"的样本来计算梯度。具体来说，对于第 t 棵树和排列中的第 i 个样本，残差的计算基于前 i-1 个样本在第 t-1 棵树上的预测值。这确保了每棵树的训练都不使用当前样本或未来样本的信息。

这种双重保护机制——有序编码加有序 Boosting——使得 CatBoost 在面对高基数类别特征时，能够真正做到既利用丰富信息，又避免数据泄露。代价是计算速度有所降低，但在精度上的提升往往远超速度损失。`,
            code: [
                {
                    lang: "python",
                    code: `# 对比传统 Boosting vs 有序 Boosting 的残差计算
import numpy as np

class TraditionalBoostingResidual:
    """传统 Boosting：全量训练集计算残差"""

    def __init__(self, n_estimators=10):
        self.n_estimators = n_estimators

    def compute_residuals(self, y_true, y_preds_history):
        """第 t 轮残差 = y - 前 t-1 棵树的累积预测（使用全部训练数据）"""
        residuals_per_tree = []
        cumulative_pred = np.zeros(len(y_true))
        for t in range(self.n_estimators):
            # 传统方式：每棵树用全局累积预测计算残差
            residuals = y_true - cumulative_pred
            residuals_per_tree.append(residuals)
            # 模拟当前树的预测（实际由树模型给出）
            tree_pred = np.random.randn(len(y_true)) * 0.3
            cumulative_pred += tree_pred
        return residuals_per_tree

class OrderedBoostingResidual:
    """有序 Boosting：每个样本只用前面样本的信息"""

    def __init__(self, n_estimators=10):
        self.n_estimators = n_estimators

    def compute_residuals(self, y_true, permutation):
        n = len(y_true)
        residuals = np.zeros((self.n_estimators, n))

        for t in range(self.n_estimators):
            pred_before = np.zeros(n)
            for idx in range(n):
                pos = permutation[idx]
                if idx > 0:
                    # 只用前面样本的预测均值
                    pred_before[pos] = np.mean(pred_before[:idx])
            residuals[t] = y_true - pred_before
        return residuals`
                },
                {
                    lang: "python",
                    code: `# CatBoost 的 boosting_type 参数对比
from catboost import CatBoostRegressor
from sklearn.metrics import mean_squared_error

train_pool = Pool(X_train, y_train, cat_features=["city", "category"])
test_pool = Pool(X_test, y_test, cat_features=["city", "category"])

# 默认：有序 Boosting（最安全）
model_ordered = CatBoostRegressor(
    iterations=300,
    learning_rate=0.03,
    depth=6,
    boosting_type="Ordered",  # 显式指定
    verbose=False,
    random_seed=42
)
model_ordered.fit(train_pool)

# Plain 模式（类似 XGBoost，更快但可能泄露）
model_plain = CatBoostRegressor(
    iterations=300,
    learning_rate=0.03,
    depth=6,
    boosting_type="Plain",
    verbose=False,
    random_seed=42
)
model_plain.fit(train_pool)

# 对比训练集和测试集性能，观察过拟合程度
for name, model in [("Ordered", model_ordered), ("Plain", model_plain)]:
    train_pred = model.predict(train_pool)
    test_pred = model.predict(test_pool)
    train_mse = mean_squared_error(y_train, train_pred)
    test_mse = mean_squared_error(y_test, test_pred)
    print(f"{name}: Train MSE={train_mse:.4f}, Test MSE={test_mse:.4f}, "
          f"Gap={test_mse - train_mse:.4f}")`
                }
            ],
            table: {
                headers: ["Boosting 模式", "数据泄露风险", "训练速度", "适用场景"],
                rows: [
                    ["Ordered", "极低", "较慢", "高基数类别特征、小数据集"],
                    ["Plain", "中等", "快", "数值特征为主、大数据集"],
                    ["XGBoost", "高（需手动处理类别）", "快", "无类别特征时"],
                    ["LightGBM", "中等（leaf-wise 更易过拟合）", "最快", "大规模数据"],
                ]
            },
            mermaid: `graph TD
    A["训练开始"] --> B{"选择 Boosting 模式"}
    B -->|"Ordered"| C["排列数据"]
    B -->|"Plain"| D["全量训练"]
    C --> E["每个样本只看前面"]
    E --> F["无目标泄露"]
    D --> G["使用全局信息"]
    G --> H["可能有泄露"]
    F --> I["泛化能力强"]
    H --> J["训练集过拟合"]
    class H s1
    class F s0
    classDef s0 fill:#064e3b,color:#f1f5f9
    classDef s1 fill:#7f1d1d,color:#f1f5f9`,
            tip: "数据集小于 5000 条且有高基数类别特征时，优先使用 Ordered 模式",
            warning: "Ordered 模式在大数据集上训练速度明显慢于 Plain，超过 50 万样本建议切换"
        },
        {
            title: "4. 对称树结构（Oblivious Trees）",
            body: `CatBoost 使用的树结构与其他梯度提升库截然不同——它采用了对称树（Oblivious / Symmetric Tree），即同一层的所有节点使用相同的分裂特征和分裂阈值。

在 XGBoost 和 LightGBM 中，每棵树是普通的决策树：不同节点可以使用不同特征、不同阈值进行分裂，这种非对称结构表达能力更强，但也更容易过拟合，因为每个节点都可以独立地拟合局部噪声。

对称树的约束——每层统一分裂规则——实际上起到了正则化的作用。假设树深度为 6，非对称树可能有 2^6-1=63 个独立的分裂规则，而对称树只需要 6 个。这大幅减少了模型自由度，天然抑制了过拟合。

从工程角度，对称树也有独特的优势：由于每层分裂规则统一，推断时可以用位运算替代条件判断——将样本在每个分裂条件上的结果（0 或 1）拼接成一个整数，直接作为叶子索引。这使得 CatBoost 的推理速度极快，比 XGBoost 快数倍。

当然，约束也意味着表达能力受限。但 CatBoost 通过增加树的数量（而非树的深度）来补偿，实践证明这种策略在大多数表格数据任务中表现优异。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

class SymmetricTreeDemo:
    """对称树 vs 非对称树的结构对比"""

    def __init__(self, depth=3):
        self.depth = depth

    def show_symmetric_structure(self):
        """对称树：每层同一分裂规则"""
        print("对称树结构（Oblivious Tree）:")
        for level in range(self.depth):
            n_nodes = 2  level
            # 该层所有节点使用相同特征和阈值
            feature = f"f_{level % 5}"
            threshold = round(np.random.uniform(-1, 1), 2)
            print(f"  Level {level}: {n_nodes} 个节点, "
                  f"分裂: {feature} <= {threshold}")
        print(f"  总分裂规则数: {self.depth}")
        print(f"  叶子节点数: {2  self.depth}")

    def show_asymmetric_structure(self):
        """非对称树：每个节点独立分裂"""
        print("\\n非对称树结构（XGBoost/LightGBM）:")
        total_splits = 0
        for level in range(self.depth):
            n_nodes = 2  level
            for node in range(n_nodes):
                feature = f"f_{np.random.randint(0, 10)}"
                threshold = round(np.random.uniform(-1, 1), 2)
                print(f"  Level {level}, Node {node}: "
                      f"{feature} <= {threshold}")
                total_splits += 1
        print(f"  总分裂规则数: {total_splits}")
        print(f"  叶子节点数: 不确定（取决于剪枝）")

tree = SymmetricTreeDemo(depth=3)
tree.show_symmetric_structure()
tree.show_asymmetric_structure()`
                },
                {
                    lang: "python",
                    code: `# CatBoost 中的对称树配置
from catboost import CatBoostClassifier

model = CatBoostClassifier(
    iterations=1000,
    learning_rate=0.03,
    # depth 控制对称树的深度（默认 6，范围 1-16）
    depth=6,
    # l2_leaf_reg 控制 L2 正则化强度
    l2_leaf_reg=3.0,
    # CatBoost 默认就是对称树，无法关闭
    # 这是与 XGBoost/LightGBM 的根本区别之一
    cat_features=["city", "category"],
    verbose=False,
    random_seed=42
)
model.fit(train_pool)

# 查看树的结构信息
print(f"树数量: {model.tree_count_}")
print(f"树深度: {model.get_param('depth')}")
print(f"L2 正则化: {model.get_param('l2_leaf_reg')}")

# 导出单棵树的可视化
# model.plot_tree(tree_idx=0, pool=train_pool)`
                }
            ],
            table: {
                headers: ["特性", "CatBoost（对称树）", "XGBoost（非对称树）", "LightGBM（leaf-wise）"],
                rows: [
                    ["分裂规则", "每层统一", "每节点独立", "每次选最优叶子分裂"],
                    ["正则化", "结构自带", "需手动调参", "容易过拟合"],
                    ["推理速度", "极快（位运算）", "中等", "快"],
                    ["过拟合倾向", "低", "中", "高（leaf-wise）"],
                    ["表达能力", "中等", "强", "强"],
                    ["叶子索引", "位运算直接定位", "遍历树路径", "遍历树路径"],
                ]
            },
            mermaid: `graph TD
    A["对称树 depth=3"] --> B["L0: feature_0 <= t0"]
    B --> C["L1: feature_2 <= t1"]
    C --> D["L2: feature_5 <= t2"]
    D --> E["8 个叶子"]

    F["非对称树 depth=3"] --> G["Root: f3 <= 0.5"]
    G --> H["L1-N0: f1 <= 0.3"]
    G --> I["L1-N1: f7 <= 0.8"]
    H --> J["L2-N0: f2 <= 0.1"]
    H --> K["L2-N1: f9 <= 0.6"]
    I --> L["L2-N2: f4 <= 0.4"]
    I --> M["L2-N3: f6 <= 0.2"]
    class D s1
    class E s0
    classDef s0 fill:#064e3b,color:#f1f5f9
    classDef s1 fill:#78350f,color:#f1f5f9`,
            tip: "对称树深度 4-10 通常是最佳范围，配合较多树数量（500-2000）效果最佳",
            warning: "对称树的表达能力受限，在极其复杂的数据集上可能不如 XGBoost 的非对称树"
        },
        {
            title: "5. 与 LightGBM / XGBoost 对比",
            body: `CatBoost、LightGBM 和 XGBoost 是当前表格数据任务的三大梯度提升框架。理解它们的差异，有助于在具体场景中做出正确选择。

XGBoost 是最早流行的梯度提升库，以其稳定性和丰富的功能著称。但它不原生支持类别特征，必须手动进行 One-Hot 或 Target Encoding，这在高基数场景下要么维度爆炸，要么泄露风险严重。XGBoost 使用非对称树（level-wise 或 hist 模式），表达能力强但需要仔细调参防止过拟合。

LightGBM 引入了 leaf-wise 生长策略和直方图优化，训练速度在三者中最快。leaf-wise 在大数据集上表现优秀，但小数据集上极易过拟合。LightGBM 原生支持类别特征（通过基于直方图的分裂策略），但处理方式不如 CatBoost 的有序编码精细。

CatBoost 的核心优势在于类别特征的原生处理——有序目标编码加有序 Boosting 的双重保护，使得它在含大量类别特征的数据集上几乎总是表现最佳。对称树结构带来了极快的推理速度。代价是训练速度较慢（尤其是 Ordered 模式）。在 Kaggle 表格数据竞赛中，CatBoost 经常是夺冠方案的关键组件。`,
            code: [
                {
                    lang: "python",
                    code: `# 三框架对比实验
import time
from catboost import CatBoostRegressor
from sklearn.metrics import mean_squared_error, r2_score

cat_features = ["city", "category"]

# ========== CatBoost ==========
t0 = time.time()
cb = CatBoostRegressor(
    iterations=500, learning_rate=0.05, depth=6,
    cat_features=cat_features, verbose=False, random_seed=42
)
cb.fit(X_train, y_train)
cb_time = time.time() - t0
cb_pred = cb.predict(X_test)
cb_mse = mean_squared_error(y_test, cb_pred)
cb_r2 = r2_score(y_test, cb_pred)

# ========== XGBoost（需手动编码） ==========
from xgboost import XGBRegressor
from sklearn.preprocessing import LabelEncoder

X_train_xgb = X_train.copy()
X_test_xgb = X_test.copy()
for col in cat_features:
    le = LabelEncoder()
    X_train_xgb[col] = le.fit_transform(X_train_xgb[col].astype(str))
    X_test_xgb[col] = le.transform(X_test_xgb[col].astype(str))

t0 = time.time()
xgb = XGBRegressor(
    n_estimators=500, learning_rate=0.05, max_depth=6,
    random_state=42, verbosity=0
)
xgb.fit(X_train_xgb, y_train)
xgb_time = time.time() - t0
xgb_pred = xgb.predict(X_test_xgb)
xgb_mse = mean_squared_error(y_test, xgb_pred)
xgb_r2 = r2_score(y_test, xgb_pred)

# ========== LightGBM ==========
from lightgbm import LGBMRegressor

X_train_lgb = X_train.copy()
X_test_lgb = X_test.copy()
for col in cat_features:
    X_train_lgb[col] = X_train_lgb[col].astype("category")
    X_test_lgb[col] = X_test_lgb[col].astype("category")

t0 = time.time()
lgb = LGBMRegressor(
    n_estimators=500, learning_rate=0.05, max_depth=6,
    random_state=42, verbose=-1
)
lgb.fit(X_train_lgb, y_train)
lgb_time = time.time() - t0
lgb_pred = lgb.predict(X_test_lgb)
lgb_mse = mean_squared_error(y_test, lgb_pred)
lgb_r2 = r2_score(y_test, lgb_pred)

print(f"{'模型':<12} {'时间(s)':>8} {'MSE':>10} {'R2':>8}")
print(f"{'CatBoost':<12} {cb_time:>8.2f} {cb_mse:>10.4f} {cb_r2:>8.4f}")
print(f"{'XGBoost':<12} {xgb_time:>8.2f} {xgb_mse:>10.4f} {xgb_r2:>8.4f}")
print(f"{'LightGBM':<12} {lgb_time:>8.2f} {lgb_mse:>10.4f} {lgb_r2:>8.4f}")`
                },
                {
                    lang: "python",
                    code: `# 特征重要性分析对比
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 3, figsize=(15, 5))

# CatBoost 特征重要性
importances_cb = cb.get_feature_importance(train_pool)
feature_names = X_train.columns.tolist()
sorted_idx = np.argsort(importances_cb)
axes[0].barh([feature_names[i] for i in sorted_idx],
             importances_cb[sorted_idx])
axes[0].set_title("CatBoost Feature Importance")

# XGBoost 特征重要性
importances_xgb = xgb.feature_importances_
sorted_idx = np.argsort(importances_xgb)
axes[1].barh(feature_names, importances_xgb)
axes[1].set_title("XGBoost Feature Importance")

# LightGBM 特征重要性
importances_lgb = lgb.feature_importances_
sorted_idx = np.argsort(importances_lgb)
axes[2].barh(feature_names, importances_lgb)
axes[2].set_title("LightGBM Feature Importance")

plt.tight_layout()
plt.savefig("feature_importance_comparison.png", dpi=150)
plt.show()`
                }
            ],
            table: {
                headers: ["对比维度", "CatBoost", "XGBoost", "LightGBM"],
                rows: [
                    ["类别特征处理", "原生有序编码", "需手动编码", "原生（直方图）"],
                    ["树结构", "对称树（Oblivious）", "非对称（level-wise）", "非对称（leaf-wise）"],
                    ["训练速度", "慢", "中", "快"],
                    ["推理速度", "极快", "中", "快"],
                    ["防止过拟合", "强（双重保护）", "中（需调参）", "弱（leaf-wise 易过拟合）"],
                    ["小数据集表现", "优秀", "良好", "一般"],
                    ["大数据集表现", "良好", "优秀", "优秀"],
                    ["内存消耗", "中", "高", "低"],
                ]
            },
            mermaid: `graph LR
    A["选择梯度提升框架"] --> B{"数据特征？"}
    B -->|"大量类别特征"| C["CatBoost"]
    B -->|"纯数值特征"| D{"数据量？"}
    D -->|"小 < 10万"| E["CatBoost / XGBoost"]
    D -->|"大 > 50万"| F["LightGBM"]
    C --> G["精度优先"]
    E --> H["均衡选择"]
    F --> I["速度优先"]
    class F s1
    class C s0
    classDef s0 fill:#78350f,color:#f1f5f9
    classDef s1 fill:#064e3b,color:#f1f5f9`,
            tip: "表格数据竞赛首选 CatBoost，生产大数据集首选 LightGBM，需要精细控制选 XGBoost",
            warning: "不要在含大量类别特征的数据集上直接用 XGBoost 而不做类别编码处理"
        },
        {
            title: "6. 超参数调优指南",
            body: `CatBoost 的超参数数量较多，但大部分有合理的默认值。掌握核心参数的调优策略，比盲目网格搜索更高效。

第一梯队（必须调）：iterations（树数量）和 learning_rate（学习率）是最关键的参数对。两者的关系是：learning_rate 越小，需要的 iterations 越多，但模型更精确。经典策略是使用 early_stopping_rounds 自动确定最优 iterations。depth（树深度）控制模型复杂度，对称树模式下 4-10 是合理范围。

第二梯队（强烈建议调）：l2_leaf_reg 控制 L2 正则化强度，值越大模型越简单；random_strength 控制分裂时随机性，增加它可以降低过拟合；bagging_temperature 控制采样温度，影响每棵树的训练数据多样性。

第三梯队（按需调）**：one_hot_max_size 决定低于多少基数的类别使用 One-Hot 编码（默认 2）；max_ctr_complexity 控制特征组合的最大复杂度；min_data_in_leaf 控制叶子最小样本数。

CatBoost 的内置交叉验证和 early stopping 功能非常实用，推荐使用 CatBoost 原生的 CV 工具而非 sklearn 的 cross_val_score，因为前者可以利用 GPU 加速且与 CatBoost 的评估指标无缝集成。`,
            code: [
                {
                    lang: "python",
                    code: `from catboost import CatBoostRegressor, cv, Pool

train_pool = Pool(X_train, y_train, cat_features=["city", "category"])

# ========== 策略一：Early Stopping ==========
model_es = CatBoostRegressor(
    iterations=5000,           # 设一个很大的值
    learning_rate=0.03,
    depth=6,
    l2_leaf_reg=3.0,
    random_strength=1.0,
    early_stopping_rounds=50,  # 连续 50 轮无改善则停止
    eval_metric="RMSE",
    verbose=100,
    random_seed=42
)
model_es.fit(
    train_pool,
    eval_set=(X_test, y_test),  # 用验证集监控
    cat_features=["city", "category"]
)
print(f"最优迭代次数: {model_es.get_best_iteration()}")
print(f"最优验证 RMSE: {model_es.get_best_score()['validation']['RMSE']:.4f}")`
                },
                {
                    lang: "python",
                    code: `# ========== 策略二：内置交叉验证 ==========
from catboost import cv

params = {
    "iterations": 300,
    "learning_rate": 0.05,
    "depth": 6,
    "l2_leaf_reg": 3.0,
    "loss_function": "RMSE",
    "random_seed": 42,
    "verbose": False
}

# CatBoost 原生 CV（支持 GPU 加速）
cv_data = cv(
    Pool(X_train, y_train, cat_features=["city", "category"]),
    params,
    fold_count=5,
    plot=False,
    stratified=False
)

# 输出每折的结果
print("CV 结果:")
for metric in cv_data.columns:
    mean_val = cv_data[metric].mean()
    std_val = cv_data[metric].std()
    print(f"  {metric}: {mean_val:.4f} +/- {std_val:.4f}")

# ========== 策略三：网格搜索 ==========
from catboost import CatBoostRegressor

grid = {
    "depth": [4, 6, 8],
    "learning_rate": [0.01, 0.05, 0.1],
    "l2_leaf_reg": [1, 3, 5],
    "random_strength": [0.5, 1.0, 2.0],
}

model_grid = CatBoostRegressor(
    iterations=300,
    cat_features=["city", "category"],
    verbose=False,
    random_seed=42
)
model_grid.grid_search(
    grid,
    train_pool,
    cv=3,
    plot=False,
    verbose=False
)
print(f"最优参数: {model_grid.get_params()}")`
                }
            ],
            table: {
                headers: ["参数", "默认值", "推荐范围", "影响"],
                rows: [
                    ["iterations", "1000", "500-5000", "↑ 精度 ↑，速度 ↓"],
                    ["learning_rate", "0.03", "0.01-0.1", "↓ 需要更多 iterations"],
                    ["depth", "6", "4-10", "↑ 复杂度 ↑，过拟合风险 ↑"],
                    ["l2_leaf_reg", "3.0", "1-10", "↑ 正则化 ↑，欠拟合风险 ↑"],
                    ["random_strength", "1.0", "0-10", "↑ 随机性 ↑，方差 ↑"],
                    ["bagging_temperature", "1.0", "0-5", "↑ 数据多样性 ↑"],
                    ["one_hot_max_size", "2", "2-10", "↑ 更多类别用 One-Hot"],
                    ["min_data_in_leaf", "1", "1-100", "↑ 叶子更保守"],
                ]
            },
            mermaid: `graph TD
    A["开始调参"] --> B["设定 learning_rate = 0.03"]
    B --> C["设定 iterations = 5000"]
    C --> D["加入 early_stopping_rounds = 50"]
    D --> E["获得最优 iterations"]
    E --> F["调 depth: 4, 6, 8"]
    F --> G["调 l2_leaf_reg: 1, 3, 5"]
    G --> H["调 random_strength"]
    H --> I["最终验证"]
    class I s1
    class D s0
    classDef s0 fill:#78350f,color:#f1f5f9
    classDef s1 fill:#064e3b,color:#f1f5f9`,
            tip: "先调 learning_rate 和 iterations 确定规模，再调 depth 和 l2_leaf_reg 控制过拟合，最后微调 random_strength",
            warning: "不要同时大幅调整多个参数——每次只改一个或两个，否则无法判断是哪个参数产生了效果"
        },
        {
            title: "7. 实战：含类别特征的完整流程",
            body: `前面已经深入理解了 CatBoost 的核心机制。现在让我们在一个完整的实战流程中把这些知识串联起来。

我们将使用一个模拟的客户流失预测场景：数据集包含客户基本信息（年龄、收入）、行为数据（使用频率、最近活跃天数）和多个类别特征（城市、产品类别、订阅等级、获客渠道）。这个场景的典型特征是类别特征数量多且基数差异大——城市可能有数百种，而订阅等级只有三四种。

完整的机器学习流程包括：数据探索与预处理 → 特征工程 → 模型训练与调优 → 模型评估与解释 → 生产部署。CatBoost 的内置类别特征处理大大简化了前两步，我们不需要手动设计编码策略，只需声明哪些列是类别特征即可。

这个实战流程展示了 CatBoost 在真实业务场景中的价值：减少手动编码的错误风险，提升模型精度，同时保持代码的简洁性和可维护性。对于生产环境，我们还会演示如何使用 CatBoost 的模型导出功能（CoreML / ONNX）实现高效部署。`,
            code: [
                {
                    lang: "python",
                    code: `import pandas as pd
import numpy as np
from catboost import CatBoostClassifier, Pool, cv
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import matplotlib.pyplot as plt

# ========== Step 1: 数据准备 ==========
np.random.seed(42)
n = 20000
data = pd.DataFrame({
    "age": np.random.randint(18, 70, n),
    "income": np.random.lognormal(10, 0.5, n),
    "usage_freq": np.random.poisson(10, n),
    "days_since_active": np.random.exponential(30, n),
    "city": np.random.choice([f"city_{i}" for i in range(200)], n),
    "product_type": np.random.choice(["Basic", "Pro", "Enterprise"], n,
                                      p=[0.6, 0.3, 0.1]),
    "subscription": np.random.choice(["Monthly", "Yearly", "Lifetime"], n),
    "acquisition_channel": np.random.choice(
        ["Organic", "Paid", "Referral", "Social"], n,
        p=[0.4, 0.3, 0.2, 0.1]
    ),
})

# 目标变量：流失概率（与城市、产品类别、活跃度相关）
churn_prob = (
    1 / (1 + np.exp(-(
        -2.0
        + 0.02 * data["days_since_active"]
        - 0.03 * data["usage_freq"]
        + data["product_type"].map({"Basic": 0.8, "Pro": 0.0, "Enterprise": -0.5})
        + data["subscription"].map({"Monthly": 0.5, "Yearly": -0.3, "Lifetime": -0.8})
        + np.random.randn(n) * 0.3
    )))
)
data["churn"] = (np.random.rand(n) < churn_prob).astype(int)
print(f"流失率: {data['churn'].mean():.2%}")`
                },
                {
                    lang: "python",
                    code: `# ========== Step 2: 模型训练 ==========
features = ["age", "income", "usage_freq", "days_since_active",
            "city", "product_type", "subscription", "acquisition_channel"]
cat_features = ["city", "product_type", "subscription", "acquisition_channel"]

X = data[features]
y = data["churn"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

train_pool = Pool(X_train, y_train, cat_features=cat_features)
test_pool = Pool(X_test, y_test, cat_features=cat_features)

model = CatBoostClassifier(
    iterations=1000,
    learning_rate=0.05,
    depth=6,
    l2_leaf_reg=3.0,
    random_strength=1.0,
    early_stopping_rounds=50,
    eval_metric="AUC",
    auto_class_weights="Balanced",
    verbose=200,
    random_seed=42
)
model.fit(train_pool, eval_set=test_pool)

# ========== Step 3: 评估 ==========
y_pred = model.predict(test_pool)
y_prob = model.predict_proba(test_pool)[:, 1]

print("\\n=== 分类报告 ===")
print(classification_report(y_test, y_pred))
print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
print(f"最优迭代: {model.get_best_iteration()}")

# ========== Step 4: 特征重要性 ==========
importances = model.get_feature_importance(train_pool)
feat_imp = pd.DataFrame({
    "feature": features,
    "importance": importances
}).sort_values("importance", ascending=False)

print("\\n=== 特征重要性 Top 10 ===")
print(feat_imp.head(10).to_string(index=False))

plt.figure(figsize=(10, 6))
plt.barh(feat_imp["feature"], feat_imp["importance"])
plt.gca().invert_yaxis()
plt.xlabel("Feature Importance")
plt.title("CatBoost Feature Importance")
plt.tight_layout()
plt.savefig("catboost_feature_importance.png", dpi=150)

# ========== Step 5: 模型导出 ==========
model.save_model("churn_model.cbm")
model.save_model("churn_model.onnx", format="onnx")
print("\\n模型已导出: churn_model.cbm (原生) / churn_model.onnx (通用)")`
                }
            ],
            table: {
                headers: ["步骤", "关键操作", "CatBoost 优势", "注意事项"],
                rows: [
                    ["数据准备", "声明类别特征列", "无需手动编码", "确保类型正确"],
                    ["数据划分", "分层抽样", "原生支持 Pool 对象", "类别特征保持类型"],
                    ["模型训练", "fit + early stopping", "有序编码自动处理泄露", "监控验证集指标"],
                    ["评估", "AUC + 分类报告", "内置评估指标丰富", "注意类别不平衡"],
                    ["特征重要性", "get_feature_importance", "对类别特征也有效", "使用 SHAP 做局部解释"],
                    ["模型导出", "cbm / onnx / CoreML", "多格式支持", "ONNX 便于跨平台部署"],
                    ["生产部署", "预测 API 集成", "推理速度极快", "监控数据漂移"],
                ]
            },
            mermaid: `graph LR
    A["原始数据"] --> B["声明类别特征"]
    B --> C["CatBoost Pool"]
    C --> D["有序编码"]
    D --> E["有序 Boosting 训练"]
    E --> F["对称树集成"]
    F --> G["Early Stopping"]
    G --> H["评估: AUC/RMSE"]
    H --> I["特征重要性"]
    I --> J["模型导出"]
    J --> K["生产部署"]
    class K s2
    class E s1
    class D s0
    classDef s0 fill:#78350f,color:#f1f5f9
    classDef s1 fill:#78350f,color:#f1f5f9
    classDef s2 fill:#064e3b,color:#f1f5f9`,
            tip: "生产环境中使用 eval_set 和 early_stopping，而不是固定 iterations——这样能自动适应不同数据分布",
            warning: "导出 ONNX 模型时，CatBoost 的类别特征处理逻辑可能不完全保留，部署前务必验证预测一致性"
        },
    ],
};
