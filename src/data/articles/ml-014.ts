import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-014",
    title: "LightGBM：高效梯度提升",
    category: "ml",
    tags: ["LightGBM", "梯度提升", "XGBoost"],
    summary: "从直方图近似到 Leaf-wise 生长，理解最快的梯度提升框架",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. XGBoost 的瓶颈：为什么需要更快的 GBDT",
            body: `XGBoost 曾是 Kaggle 竞赛的绝对王者，但在大数据场景下它的性能瓶颈日益凸显。XGBoost 采用 Level-wise 生长策略，每层节点统一分裂，虽然实现简单且不易过拟合，却导致大量不必要的计算——许多叶节点分裂增益极小却仍被计算。更致命的是，XGBoost 需要遍历所有特征的所有可能分割点，对于连续特征需要先排序再计算增益，时间复杂度与数据量成线性关系。当特征维度超过数千、样本量达到百万级时，训练时间从分钟级膨胀到小时级。此外，XGBoost 的预排序算法需要存储每个特征的排序索引，内存消耗巨大，单机往往无法容纳。微软团队正是在这样的背景下开发了 LightGBM，它通过一系列算法创新，在保持模型精度的同时将训练速度提升了数十倍。理解 XGBoost 的局限性，是深入学习 LightGBM 创新设计的前提。`,
            code: [
                {
                    lang: "python",
                    code: `import xgboost as xgb
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=100000, n_features=50, random_state=42)
dtrain = xgb.DMatrix(X, label=y)

params = {
    "objective": "binary:logistic",
    "max_depth": 6,
    "learning_rate": 0.1,
    "tree_method": "hist"  # 近似算法，仍比 LightGBM 慢
}
model = xgb.train(params, dtrain, num_boost_round=100)
# 百万级样本 + 50 特征：约 30-60 秒`
                },
                {
                    lang: "python",
                    code: `# 预排序模式的内存消耗分析
import sys
import numpy as np

n_samples = 1_000_000
n_features = 200
X = np.random.randn(n_samples, n_features)

# XGBoost 预排序需要额外存储排序索引
# 每个特征排序索引 = n_samples * 4 bytes (int32)
mem_per_feature = n_samples * 4 / 1024 / 1024  # ~3.8 MB
total_index_mem = mem_per_feature * n_features   # ~763 MB
print(f"排序索引内存: {total_index_mem:.0f} MB")
# 加上原始数据和梯度统计，单机 16GB 内存捉襟见肘`
                }
            ],
            table: {
                headers: ["维度", "XGBoost (pre-sort)", "XGBoost (approx)", "LightGBM"],
                rows: [
                    ["时间复杂度", "O(T * d * n)", "O(T * d * n * bucket)", "O(T * d * n * bucket)"],
                    ["内存消耗", "高（排序索引）", "中", "低（直方图）"],
                    ["百万数据训练", "3-5 分钟", "1-2 分钟", "10-30 秒"],
                    ["生长策略", "Level-wise", "Level-wise", "Leaf-wise"]
                ]
            },
            mermaid: `graph LR
    A["大规模训练数据"] --> B["XGBoost 预排序瓶颈"]
    B --> C["排序索引内存过大"]
    B --> D["Level-wise 无效分裂"]
    C --> E["需要分布式训练"]
    D --> F["训练速度慢"]
    E --> G["LightGBM 解决方案"]
    F --> G
    G --> H["直方图 + Leaf-wise + GOSS + EFB"]`,
            tip: "当你的数据集超过 50 万行且特征数 > 100 时，就该考虑从 XGBoost 迁移到 LightGBM 了",
            warning: "XGBoost 的 tree_method='exact' 在百万级数据上会导致 OOM，生产环境务必使用 'hist' 或 'approx'"
        },
        {
            title: "2. 直方图近似算法：从连续到离散的智慧",
            body: `LightGBM 最核心的创新之一就是直方图近似算法（Histogram-based Algorithm）。它将连续特征值离散化为固定数量的桶（默认 255 个），然后基于桶而非原始值寻找最优分裂点。这个过程大幅降低了计算和存储复杂度：首先，直方图将特征值映射到整数桶索引，计算分裂增益时只需遍历桶而非遍历每个样本，时间复杂度从 O(n) 降至 O(bucket)，其中 bucket 通常取 255。其次，直方图做差法是一个精妙优化——父节点的直方图减去左子节点的直方图即可得到右子节点的直方图，无需重新计算，这将计算量减半。第三，离散化后只需要存储桶索引（uint8 类型），内存消耗从 float64 的 8 字节降至 1 字节，节省约 87.5% 的内存。直方图算法的另一个好处是天然支持类别特征的高效处理，LightGBM 可以直接对类别特征计算最优分组而无需独热编码。`,
            code: [
                {
                    lang: "python",
                    code: `import lightgbm as lgb
import numpy as np

# 直方图构建过程演示
np.random.seed(42)
feature = np.random.randn(10000)

# LightGBM 将连续值离散化为 255 个桶
n_bins = 255
bin_edges = np.linspace(feature.min(), feature.max(), n_bins + 1)
bins = np.digitize(feature, bin_edges) - 1

# 每个桶累积梯度和海森量
gradient = np.random.randn(10000)
hessian = np.abs(np.random.randn(10000))

bin_grad = np.zeros(n_bins)
bin_hess = np.zeros(n_bins)
for b in range(n_bins):
    mask = bins == b
    bin_grad[b] = gradient[mask].sum()
    bin_hess[b] = hessian[mask].sum()

print(f"原始样本: {len(feature)}, 桶数: {n_bins}")
print(f"加速比: {len(feature) / n_bins:.1f}x")`
                },
                {
                    lang: "python",
                    code: `# 直方图做差法（Histogram Subtraction）
def compute_child_histograms(parent_grad, parent_hess,
                              left_grad, left_hess, n_bins):
    """父节点直方图减去左子节点 = 右子节点直方图"""
    right_grad = np.zeros(n_bins)
    right_hess = np.zeros(n_bins)
    for i in range(n_bins):
        right_grad[i] = parent_grad[i] - left_grad[i]
        right_hess[i] = parent_hess[i] - left_hess[i]
    return right_grad, right_hess

# 验证
parent_g = np.array([10.0, 8.0, 6.0, 4.0, 2.0])
parent_h = np.array([10.0, 8.0, 6.0, 4.0, 2.0])
left_g = np.array([3.0, 2.0, 1.0, 0.5, 0.2])
left_h = np.array([3.0, 2.0, 1.0, 0.5, 0.2])

rg, rh = compute_child_histograms(parent_g, parent_h, left_g, left_h, 5)
print(f"右子节点梯度: {rg}")
print(f"右子节点海森: {rh}")
# 无需遍历右子节点样本，计算量直接减半`
                }
            ],
            table: {
                headers: ["特性", "精确算法", "直方图算法"],
                rows: [
                    ["分割点数量", "n（每个样本）", "255（桶数）"],
                    ["内存/特征", "8 * n 字节", "n + 255 * 8 字节"],
                    ["缓存友好性", "差（随机访问）", "优（顺序扫描）"],
                    ["做差优化", "不支持", "支持（计算量减半）"],
                    ["精度损失", "无", "可忽略（255 桶足够）"]
                ]
            },
            mermaid: `graph TD
    A["连续特征值 x"] --> B["分桶映射"]
    B --> C["bin_edges: linspace"]
    C --> D["digitize -> 桶索引"]
    D --> E["累积 bin_grad/bin_hess"]
    E --> F["遍历 255 个桶找最优分裂"]
    F --> G["左子节点直方图"]
    F --> H["右子节点 = 父 - 左"]
    G --> I["递归分裂"]
    H --> I`,
            tip: "max_bin 默认 255 是精度与速度的最佳平衡点，小数据集可以降到 127 进一步加速",
            warning: "max_bin 过低（< 63）会导致信息损失严重，模型精度显著下降"
        },
        {
            title: "3. Leaf-wise 生长策略：精准分裂的艺术",
            body: `XGBoost 采用 Level-wise（按层生长）策略，每轮迭代对所有叶节点同时分裂。这种策略实现简单、易于并行化，但效率低下——它平等对待每个节点，无论分裂增益大小。LightGBM 引入 Leaf-wise（按叶生长）策略：每次只选择当前所有叶节点中分裂增益最大的那个节点进行分裂。这就像贪心搜索中的最优选择，每一步都朝收益最大的方向前进，因此可以用更少的分裂次数达到相同的损失降低。实验表明，Leaf-wise 策略在相同叶子数下比 Level-wise 策略损失更低，或者说达到相同精度所需的叶子数更少。然而 Leaf-wise 有一个显著风险：如果不加限制，树可能无限向一个方向生长，导致严重的过拟合。LightGBM 通过 max_depth 和 num_leaves 双重约束来控制这个问题。num_leaves 限制了树的总叶子数，而 max_depth 限制了树的最大深度，两者结合既保留了 Leaf-wise 的效率优势，又防止了过拟合。`,
            code: [
                {
                    lang: "python",
                    code: `import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=50000, n_features=30, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2)

train_data = lgb.Dataset(X_train, label=y_train)
val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)

# Leaf-wise 核心参数
params = {
    "objective": "binary",
    "num_leaves": 31,        # 最大叶子数 (关键! 替代 max_depth)
    "max_depth": 6,           # 防止过拟合的深度上限
    "learning_rate": 0.05,
    "min_data_in_leaf": 20,   # 每叶最小样本数
    "min_gain_to_split": 0.0, # 最小分裂增益阈值
    "verbose": -1
}

model = lgb.train(
    params, train_data,
    valid_sets=[val_data],
    num_boost_round=200,
    callbacks=[lgb.early_stopping(20)]
)
print(f"最佳迭代: {model.best_iteration}")`
                },
                {
                    lang: "python",
                    code: `# Level-wise vs Leaf-wise 可视化对比
class Node:
    def __init__(self, gain=0.0):
        self.gain = gain
        self.left = None
        self.right = None

def simulate_leaf_wise(gains, max_leaves):
    """模拟 Leaf-wise 生长"""
    nodes = [Node(g) for g in gains]  # 初始叶节点
    splits = []
    while len(splits) < max_leaves - 1:
        # 选增益最大的节点分裂
        best_idx = max(range(len(nodes)), key=lambda i: nodes[i].gain)
        best = nodes.pop(best_idx)
        splits.append(f"分裂增益={best.gain:.3f}")
        # 分裂产生两个新叶节点
        nodes.append(Node(best.gain * 0.6))
        nodes.append(Node(best.gain * 0.4))
    return splits

gains = [5.2, 3.1, 2.8, 1.5, 0.9]
result = simulate_leaf_wise(gains, max_leaves=7)
for s in result:
    print(s)
# Leaf-wise 总是先分裂增益最大的节点`
                }
            ],
            table: {
                headers: ["策略", "Level-wise", "Leaf-wise"],
                rows: [
                    ["分裂方式", "每层全部节点", "选最优增益节点"],
                    ["精度效率", "较低（冗余分裂）", "较高（精准分裂）"],
                    ["过拟合风险", "低", "高（需限制深度）"],
                    ["关键参数", "max_depth", "num_leaves + max_depth"],
                    ["适用场景", "小数据、高噪声", "大数据、追求精度"]
                ]
            },
            mermaid: `graph TD
    A["Root: gain=10.0"] --> B["L1: gain=6.0"]
    A --> C["R1: gain=4.0"]
    B --> D["L2: gain=3.5"]
    B --> E["R2: gain=2.5"]
    C --> F["L3: gain=2.0"]
    C --> G["R3: gain=2.0"]

    style A fill:#ff6b6b,color:#1e293b
    style B fill:#ffd93d,color:#1e293b
    style C fill:#6bcb77,color:#1e293b
    style D fill:#4d96ff,color:#1e293b
    style E fill:#374151
    style F fill:#374151
    style G fill:#374151`,
            tip: "Leaf-wise 模式下 num_leaves 是最重要的超参数，建议从 31 开始，逐步增大到 63、127 观察验证集表现",
            warning: "Leaf-wise 不加 max_depth 约束时，树会疯狂向一侧生长，导致训练集完美拟合但验证集性能极差"
        },
        {
            title: "4. GOSS 梯度采样：用少样本做大事的秘诀",
            body: `GOSS（Gradient-based One-Side Sampling）是 LightGBM 独创的采样算法，它巧妙地利用了梯度信息来指导数据采样。核心洞察是：梯度大的样本对模型训练的贡献更大，因为它们距离当前模型的预测较远，包含更多需要学习的信息。GOSS 的做法是：首先对所有样本按梯度绝对值排序，保留梯度最大的 top a% 样本（大梯度采样）；然后对剩余样本随机采样 b%（小梯度采样）；最后，在计算信息增益时，对小梯度样本的梯度乘以一个权重系数 (1-a)/b 来补偿采样偏差。这种策略在保证精度的同时大幅减少了每轮迭代参与训练的样本量。当数据集达到百万级时，GOSS 可以将有效训练样本压缩到 20%-30%，训练速度提升 3-5 倍，而 AUC 损失通常不到 1%。GOSS 特别适合数据冗余高的场景——大量样本已经被当前模型很好地预测，梯度很小，重复训练它们的边际收益极低。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

def goss_sample(gradients, labels, top_rate=0.2, random_rate=0.1, seed=42):
    """GOSS 梯度采样实现"""
    np.random.seed(seed)
    n = len(gradients)
    abs_grad = np.abs(gradients)
    sorted_idx = np.argsort(abs_grad)[::-1]

    top_k = int(n * top_rate)
    random_k = int(n * random_rate)

    # 大梯度样本全部保留
    top_idx = sorted_idx[:top_k]
    # 小梯度样本随机采样
    remain_idx = sorted_idx[top_k:]
    random_idx = np.random.choice(remain_idx, random_k, replace=False)

    # 合并采样索引
    sample_idx = np.concatenate([top_idx, random_idx])

    # 计算权重补偿
    weight = np.ones(len(sample_idx))
    weight[top_k:] = (1.0 - top_rate) / random_rate  # 补偿因子

    return sample_idx, weight, labels[sample_idx]

# 演示
grad = np.random.randn(10000)
labels = np.random.randint(0, 2, 10000)
idx, w, sample_labels = goss_sample(grad, labels)
print(f"原始样本: {len(grad)}, 采样后: {len(idx)}")
print(f"压缩率: {len(idx)/len(grad)*100:.1f}%")`
                },
                {
                    lang: "python",
                    code: `# GOSS 在 LightGBM 中的实际使用
import lightgbm as lgb

params = {
    "objective": "binary",
    "boosting_type": "gbdt",
    "num_leaves": 63,
    "max_depth": -1,          # 不限制深度，让 GOSS 控制过拟合
    "learning_rate": 0.05,
    # GOSS 相关参数
    "boost_from_average": True,
    # 注意：LightGBM 默认使用 full data
    # 要启用类似 GOSS 的效果，使用 bagging
    "bagging_fraction": 0.8,      # 每轮使用 80% 样本
    "bagging_freq": 1,            # 每轮都采样
    "feature_fraction": 0.8,      # 每轮使用 80% 特征
    "verbose": -1
}

# 注意：GOSS 是 LightGBM 内部优化
# 用户通过 bagging_fraction 间接控制采样率
# 更激进的采样（如 0.3）适用于超大数据集
print("GOSS 参数配置完成")`
                }
            ],
            table: {
                headers: ["采样策略", "样本利用率", "速度提升", "精度损失", "适用场景"],
                rows: [
                    ["全量数据", "100%", "基准", "0%", "小数据集"],
                    ["随机采样", "20-50%", "2-5x", "1-3%", "数据冗余高"],
                    ["GOSS", "20-40%", "3-5x", "0.5-1%", "梯度分布不均"],
                    ["特征采样", "100%", "1.2-1.5x", "0-0.5%", "高维特征"]
                ]
            },
            mermaid: `graph LR
    A["全部样本梯度"] --> B["按绝对值排序"]
    B --> C["Top 20% 全部保留"]
    B --> D["Bottom 80% 随机采样 10%"]
    C --> E["合并样本集"]
    D --> E
    E --> F["小梯度样本权重补偿"]
    F --> G["计算信息增益"]
    G --> H["构建决策树"]`,
            tip: "GOSS 的 top_rate 设为 0.2、random_rate 设为 0.1 是论文推荐的默认值，多数场景下无需调整",
            warning: "GOSS 不适合小数据集（< 10000 样本），采样带来的方差会超过计算收益"
        },
        {
            title: "5. EFB 特征捆绑：高维稀疏特征的降维利器",
            body: `EFB（Exclusive Feature Bundling）是 LightGBM 处理高维稀疏特征的核心创新。在推荐系统、NLP 等场景中，独热编码后的特征矩阵往往有数百万列，但每个样本只有极少数非零值。EFB 的核心洞察是：如果两个特征几乎不会同时非零（即互斥），就可以安全地将它们捆绑成一个特征。具体来说，EFB 分为两步：首先构建特征冲突图，节点是特征，边的权重是两个特征同时非零的次数；然后用贪心算法将冲突小的特征分组捆绑；最后通过偏移值（offset）将捆绑后的特征合并为一个，确保原始特征信息不丢失。例如特征 A 取值 [0, 1, 0] 和特征 B 取值 [0, 0, 1] 几乎互斥，可以捆绑为新特征 C：A 的值保持，B 的值加上一个偏移量（如 max_A + 1），直方图构建时仍能正确区分 A 和 B 的取值。对于稀疏度 99% 的数据，EFB 可以将特征数减少 50-90%，训练时间和内存消耗同步降低。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from scipy.sparse import csr_matrix

def compute_conflict_matrix(sparse_X):
    """计算特征间冲突度（同时非零的次数）"""
    # 将稀疏矩阵转为二进制（是否非零）
    binary_X = (sparse_X > 0).astype(np.float64)
    # 冲突矩阵 = X^T @ X，每个元素是两特征同时非零的样本数
    conflict = binary_X.T @ binary_X
    np.fill_diagonal(conflict, 0)  # 自身冲突为 0
    return conflict

def greedy_bundle(conflict_matrix, max_conflict=5):
    """贪心特征捆绑"""
    n_features = conflict_matrix.shape[0]
    bundles = []
    used = set()

    for i in range(n_features):
        if i in used:
            continue
        bundle = [i]
        for j in range(i + 1, n_features):
            if j in used:
                continue
            # 检查与 bundle 中所有特征的冲突
            max_c = max(conflict_matrix[i, j] for i in bundle)
            if max_c <= max_conflict:
                bundle.append(j)
        bundles.append(bundle)
        used.update(bundle)
    return bundles

# 模拟稀疏数据
np.random.seed(42)
X = csr_matrix(np.random.binomial(1, 0.01, (1000, 50)))
conflict = compute_conflict_matrix(X)
bundles = greedy_bundle(conflict, max_conflict=2)
print(f"原始特征: 50, 捆绑后: {len(bundles)} 组")`
                },
                {
                    lang: "python",
                    code: `# EFB 在 LightGBM 中的使用
import lightgbm as lgb
from sklearn.datasets import load_svmlight_file

# 高维稀疏数据示例（如 Criteo 广告数据集）
params = {
    "objective": "binary",
    "num_leaves": 63,
    "learning_rate": 0.05,
    # EFB 相关参数
    "max_bin": 255,
    "min_data_in_bin": 3,       # 每桶最小样本
    "feature_pre_filter": True, # 预过滤零值特征
    "enable_bundle": True,      # 启用 EFB（默认开启）
    "max_conflict_rate": 0.0,   # 最大冲突率（0=严格互斥）
    "is_enable_sparse": True,   # 启用稀疏优化
    "zero_as_missing": True,    # 零值视为缺失
    "verbose": -1
}

# 对于独热编码数据，EFB 自动识别并捆绑互斥特征
# 例如 1000 个类别的独热编码 → 实际只捆绑为少数特征组
print("EFB 参数配置完成，自动处理高维稀疏特征")`
                }
            ],
            table: {
                headers: ["场景", "原始特征数", "EFB 后特征数", "压缩比", "训练加速"],
                rows: [
                    ["推荐系统", "2,000,000", "200,000", "10x", "5-8x"],
                    ["NLP 词袋", "100,000", "15,000", "6.7x", "4-6x"],
                    ["广告点击", "5,000,000", "500,000", "10x", "6-10x"],
                    ["密集数值特征", "500", "480", "1.04x", "~1x"]
                ]
            },
            mermaid: `graph TD
    A["原始稀疏特征矩阵"] --> B["计算特征冲突图"]
    B --> C["贪心特征分组"]
    C --> D["组内添加偏移值"]
    D --> E["合并为捆绑特征"]
    E --> F["构建直方图"]
    F --> G["分裂增益计算"]

    A -. "50 列" .-> B
    B -. "冲突矩阵 50x50" .-> C
    C -. "8 组" .-> D
    D -. "偏移合并" .-> E
    E -. "8 列" .-> F`,
            tip: "EFB 在独热编码数据上效果最好，确保 enable_bundle=True（默认开启），一般不需要手动调整 max_conflict_rate",
            warning: "max_conflict_rate 设为非零值会放宽互斥条件，可能导致特征信息混淆，除非你清楚自己在做什么"
        },
        {
            title: "6. 三强争霸：LightGBM vs XGBoost vs CatBoost",
            body: `GBDT 领域三大框架各有千秋。XGBoost 是开创者，生态系统最成熟，支持最丰富的目标函数和评估指标，API 设计优雅，文档完善。但当数据规模增长时，它的预排序算法和 Level-wise 策略成为性能瓶颈。CatBoost 由 Yandex 开发，最大亮点是原生类别特征支持和有序提升（Ordered Boosting）技术，有效解决了传统 GBDT 中的目标编码泄露问题。它的预测速度极快，因为推理时使用了无分支树结构（Oblivious Trees），但训练速度在大数据集上不如 LightGBM。LightGBM 则是三者中训练速度最快的，直方图 + Leaf-wise + GOSS + EFB 的组合拳让它在百万级数据上比 XGBoost 快 10-20 倍，同时精度几乎不损失。选择建议：小数据集（< 10 万行）用 XGBoost 或 CatBoost 均可；包含大量类别特征优先考虑 CatBoost；追求训练速度和资源效率选 LightGBM；需要极致模型解释性用 XGBoost（特征重要性更稳定）。`,
            code: [
                {
                    lang: "python",
                    code: `# 三框架统一 API 对比（使用 sklearn 接口）
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification
from sklearn.metrics import accuracy_score

X, y = make_classification(n_samples=100000, n_features=20, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# XGBoost
import xgboost as xgb
xgb_model = xgb.XGBClassifier(
    n_estimators=200, max_depth=6, learning_rate=0.1,
    tree_method="hist", random_state=42
)
xgb_model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
xgb_acc = accuracy_score(y_test, xgb_model.predict(X_test))

# LightGBM
import lightgbm as lgb
lgb_model = lgb.LGBMClassifier(
    n_estimators=200, num_leaves=31, learning_rate=0.1,
    max_depth=6, random_state=42, verbose=-1
)
lgb_model.fit(X_train, y_train)
lgb_acc = accuracy_score(y_test, lgb_model.predict(X_test))

# CatBoost
from catboost import CatBoostClassifier
cb_model = CatBoostClassifier(
    iterations=200, depth=6, learning_rate=0.1,
    random_seed=42, verbose=False
)
cb_model.fit(X_train, y_train)
cb_acc = accuracy_score(y_test, cb_model.predict(X_test))

print(f"XGBoost: {xgb_acc:.4f} | LightGBM: {lgb_acc:.4f} | CatBoost: {cb_acc:.4f}")`
                },
                {
                    lang: "python",
                    code: `# 训练速度对比基准测试
import time
import lightgbm as lgb
import xgboost as xgb
from sklearn.datasets import make_classification

results = {}
for n_samples in [100_000, 500_000, 1_000_000]:
    X, y = make_classification(n_samples=n_samples, n_features=50, random_state=42)

    # LightGBM
    start = time.time()
    lgb.LGBMClassifier(n_estimators=100, num_leaves=31, verbose=-1).fit(X, y)
    lgb_time = time.time() - start

    # XGBoost
    start = time.time()
    xgb.XGBClassifier(n_estimators=100, max_depth=6, tree_method="hist").fit(X, y)
    xgb_time = time.time() - start

    results[n_samples] = {"lgb": lgb_time, "xgb": xgb_time, "ratio": xgb_time / lgb_time}

for n, r in results.items():
    print(f"{n:>10,} 样本: LGB={r['lgb']:.1f}s, XGB={r['xgb']:.1f}s, 加速={r['ratio']:.1f}x")
# 典型结果：100万样本 LightGBM ~15s, XGBoost ~120s, 加速约 8x`
                }
            ],
            table: {
                headers: ["维度", "LightGBM", "XGBoost", "CatBoost"],
                rows: [
                    ["训练速度", "最快", "中等", "最慢"],
                    ["内存占用", "最低", "中等", "最高"],
                    ["类别特征", "需编码", "需编码", "原生支持"],
                    ["小数据精度", "良好", "优秀", "优秀"],
                    ["大数据精度", "优秀", "优秀", "良好"],
                    ["预测速度", "快", "快", "最快"],
                    ["生态成熟度", "成熟", "最成熟", "较成熟"],
                    ["推理部署", "ONNX/TREELITE", "ONNX/TREELITE", "CatBoost Runtime"]
                ]
            },
            mermaid: `graph TD
    A["选择 GBDT 框架"] --> B{"数据规模?"}
    B -->|" < 10 万"| C{"有类别特征?"}
    B -->|"10 万 - 100 万"| D["LightGBM / XGBoost"]
    B -->|" > 100 万"| E["LightGBM"]
    C -->|"是"| F["CatBoost"]
    C -->|"否"| G["XGBoost"]
    D --> H["需要速度: LightGBM"]
    D --> I["需要生态: XGBoost"]
    E --> H`,
            tip: "Kaggle 竞赛中最常见的策略：LightGBM + XGBoost + CatBoost 三模型融合，通常能带来 0.5-1% 的分数提升",
            warning: "不要盲目追求训练速度——在验证集上的精度才是最终裁判，速度只是工程约束"
        },
        {
            title: "7. Kaggle 实战：LightGBM 调参完全指南",
            body: `在 Kaggle 竞赛中，LightGBM 是最常用的单模型之一，掌握其调参技巧至关重要。调参应遵循"先粗后细"的原则：第一阶段确定基础架构——num_leaves（树复杂度）、learning_rate（学习率）、n_estimators（迭代次数），三者联动调整。第二阶段优化正则化——min_data_in_leaf（叶节点最小样本）、min_sum_hessian_in_leaf（叶节点最小海森和）、lambda_l1/lambda_l2（L1/L2 正则），防止过拟合。第三阶段引入采样——feature_fraction（特征采样）、bagging_fraction（数据采样）、bagging_freq（采样频率），进一步提升泛化能力和训练速度。关键经验：学习率越小，需要的迭代次数越多，但精度越高；num_leaves 与 max_depth 要配合使用，num_leaves = 2^max_depth 是理论上限，实际取 2^(max_depth-1) 更合理；早停（Early Stopping）是防止过拟合的最佳实践。Optuna 自动化调参可以将手动调参数天缩短到数小时。`,
            code: [
                {
                    lang: "python",
                    code: `import lightgbm as lgb
import optuna
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score

def objective(trial, X, y):
    params = {
        "objective": "binary",
        "metric": "auc",
        "verbosity": -1,
        "num_leaves": trial.suggest_int("num_leaves", 20, 300),
        "max_depth": trial.suggest_int("max_depth", 3, 12),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
        "feature_fraction": trial.suggest_float("feature_fraction", 0.4, 1.0),
        "bagging_fraction": trial.suggest_float("bagging_fraction", 0.4, 1.0),
        "bagging_freq": trial.suggest_int("bagging_freq", 1, 10),
        "min_data_in_leaf": trial.suggest_int("min_data_in_leaf", 10, 200),
        "lambda_l1": trial.suggest_float("lambda_l1", 1e-8, 10.0, log=True),
        "lambda_l2": trial.suggest_float("lambda_l2", 1e-8, 10.0, log=True),
    }

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = []
    for train_idx, val_idx in skf.split(X, y):
        train_data = lgb.Dataset(X[train_idx], y[train_idx])
        val_data = lgb.Dataset(X[val_idx], y[val_idx], reference=train_data)
        model = lgb.train(
            params, train_data, num_boost_round=1000,
            valid_sets=[val_data], callbacks=[lgb.early_stopping(50), lgb.log_evaluation(0)]
        )
        preds = model.predict(X[val_idx])
        scores.append(roc_auc_score(y[val_idx], preds))
    return sum(scores) / len(scores)

# study = optuna.create_study(direction="maximize")
# study.optimize(lambda t: objective(t, X, y), n_trials=100)
print("Optuna 调参框架已就绪，取消注释即可运行")`
                },
                {
                    lang: "python",
                    code: `# Kaggle 金牌参数模板（分类任务）
import lightgbm as lgb
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score
import numpy as np

def train_lgb_kfold(X, y, X_test, n_splits=5):
    """5 折 Stratified K-Fold 训练"""
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    oof_preds = np.zeros(len(y))
    test_preds = np.zeros(len(X_test))
    models = []

    params = {
        "objective": "binary",
        "metric": "auc",
        "boosting_type": "gbdt",
        "num_leaves": 127,
        "max_depth": 8,
        "learning_rate": 0.02,
        "feature_fraction": 0.75,
        "bagging_fraction": 0.75,
        "bagging_freq": 5,
        "min_data_in_leaf": 50,
        "lambda_l1": 0.5,
        "lambda_l2": 1.0,
        "verbose": -1,
        "seed": 42
    }

    for fold, (tr_idx, va_idx) in enumerate(skf.split(X, y)):
        tr_data = lgb.Dataset(X[tr_idx], y[tr_idx])
        va_data = lgb.Dataset(X[va_idx], y[va_idx], reference=tr_data)

        model = lgb.train(
            params, tr_data, num_boost_round=3000,
            valid_sets=[va_data],
            callbacks=[
                lgb.early_stopping(100),
                lgb.log_evaluation(500)
            ]
        )
        oof_preds[va_idx] = model.predict(X[va_idx])
        test_preds += model.predict(X_test) / n_splits
        models.append(model)

        auc = roc_auc_score(y[va_idx], oof_preds[va_idx])
        print(f"Fold {fold+1}: AUC = {auc:.5f}")

    print(f"Overall OOF AUC: {roc_auc_score(y, oof_preds):.5f}")
    return oof_preds, test_preds, models`
                }
            ],
            table: {
                headers: ["参数", "推荐范围", "调参方向", "过拟合信号"],
                rows: [
                    ["num_leaves", "31-255", "从小到大", "增大→OOF上升但CV下降"],
                    ["learning_rate", "0.01-0.1", "从大到小", "减小→需要更多迭代"],
                    ["min_data_in_leaf", "20-200", "从小到大", "增大→欠拟合风险"],
                    ["feature_fraction", "0.4-0.9", "从大到小", "减小→方差降低"],
                    ["bagging_fraction", "0.5-0.9", "从大到小", "减小→训练变慢"],
                    ["lambda_l1", "0-10", "从小到大", "增大→特征稀疏化"],
                    ["lambda_l2", "0-10", "从小到大", "增大→权重收缩"]
                ]
            },
            mermaid: `graph TD
    A["Kaggle 调参流程"] --> B["Baseline: 默认参数"]
    B --> C["OOF AUC 评估"]
    C --> D{"过拟合?"}
    D -->|"是"| E["增加正则化"]
    D -->|"否"| F["增加模型复杂度"]
    E --> G["min_data_in_leaf ↑"]
    E --> H["lambda_l1/l2 ↑"]
    E --> I["feature_fraction ↓"]
    F --> J["num_leaves ↑"]
    F --> K["max_depth ↑"]
    G --> L["Optuna 自动搜索"]
    H --> L
    I --> L
    J --> L
    K --> L
    L --> M["最佳参数 + Early Stopping"]
    M --> N["5-Fold 最终训练"]`,
            tip: "Kaggle 竞赛黄金法则：learning_rate=0.02 + num_boost_round=3000 + early_stopping=100 是万金油组合，适用于绝大多数表格数据",
            warning: "不要只看单折分数！必须看 5 折交叉验证的均值和方差，单折高分可能是运气"
        }
    ],
};
