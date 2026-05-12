import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-005",
    title: "XGBoost 原理与调参指南",
    category: "ml",
    tags: ["集成学习", "梯度提升", "调参"],
    summary: "深入 XGBoost 的目标函数推导、正则化策略和实用调参技巧",
    date: "2026-03-28",
    readTime: "18 min",
    level: "进阶",
    content: [
      {
        title: "1. XGBoost 简介与优势",
        body: `XGBoost（eXtreme Gradient Boosting）是陈天奇于 2014 年提出的梯度提升框架，一经推出就横扫 Kaggle 竞赛——在 2015 年的 29 个获胜方案中，有 17 个使用了 XGBoost。它不仅是一个库，更是梯度提升决策树（GBDT）算法的系统性工程优化。

XGBoost 相比传统 GBDT 的核心优势体现在三个层面：算法层面，它使用二阶泰勒展开近似损失函数，比仅用一阶导数的 GBDT 收敛更快；工程层面，它实现了列块（Block）并行存储、缓存感知访问和外部排序，使得训练速度比 GBDT 快 10 倍以上；正则化层面，它在目标函数中显式加入了树复杂度的惩罚项（L1/L2），有效防止过拟合。

为什么 XGBoost 如此受欢迎？因为它兼顾了精度、速度和易用性。对数据科学家来说，它几乎是一个"默认选择"——拿到结构化数据，先跑一个 XGBoost baseline，往往就能击败大部分其他模型。即使在深度学习统治图像和 NLP 的时代，XGBoost 在表格数据（tabular data）上仍然难以被超越。`,
        code: [
          {
            lang: "python",
            code: `import xgboost as xgb
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 加载数据
data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.2, random_state=42
)

# 最简配置即可使用
model = xgb.XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3,
    random_state=42
)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, preds):.4f}")`,
          },
        ],
        table: {
          headers: ["特性", "传统 GBDT", "XGBoost"],
          rows: [
            ["损失近似", "一阶导数（梯度）", "二阶泰勒展开（梯度+Hessian）"],
            ["正则化", "无显式正则化", "L1/L2 + 树复杂度惩罚"],
            ["缺失值处理", "需手动填充", "自动学习最优分裂方向"],
            ["并行计算", "树级别串行", "特征粒度并行（Block 结构）"],
            ["列采样", "不支持", "支持 colsample_bytree"],
            ["自定义目标函数", "困难", "只需提供一阶和二阶导数"],
          ],
        },
        mermaid: `graph TD
    A["GBDT"] --> B["一阶导数近似"]
    A --> C["无正则化"]
    A --> D["串行构建树"]
    E["XGBoost"] --> F["二阶泰勒展开"]
    E --> G["L1/L2 正则化"]
    E --> H["特征并行 + 缓存优化"]
    F -. 更精确的牛顿步 -> I["更快收敛"]
    G -. 控制树复杂度 -> J["更强泛化能力"]
    H -. 工程优化 -> K["10x 训练速度提升"]`,
        tip: "XGBoost 对结构化数据几乎总是首选 baseline。即使最终选择其他模型，先跑一个 XGBoost 也能帮你理解数据的重要特征分布。",
      },
      {
        title: "2. 目标函数推导",
        body: `XGBoost 的核心创新在于它的目标函数设计。理解这个推导，你就理解了 XGBoost 的灵魂。

在第 t 轮迭代时，模型的预测为 ŷᵢ⁽ᵗ⁾ = ŷᵢ⁽ᵗ⁻¹⁾ + fₜ(xᵢ)，其中 fₜ 是本轮要学习的决策树。目标函数为：Obj⁽ᵗ⁾ = sumᵢ l(yᵢ, ŷᵢ⁽ᵗ⁻¹⁾ + fₜ(xᵢ)) + Omega(fₜ) + constant。这里 l 是损失函数，Omega 是正则化项。

关键步骤是对损失函数做二阶泰勒展开：l(y, ŷ⁽ᵗ⁻¹⁾ + fₜ) ≈ l(y, ŷ⁽ᵗ⁻¹⁾) + gᵢ·fₜ(xᵢ) + (1/2)hᵢ·fₜ(xᵢ)^2，其中 gᵢ = ∂l/∂ŷ⁽ᵗ⁻¹⁾ 是一阶导数，hᵢ = ∂^2l/∂ŷ^2⁽ᵗ⁻¹⁾ 是二阶导数。去掉常数项后得到：Obj⁽ᵗ⁾ ≈ sumᵢ [gᵢ·fₜ(xᵢ) + (1/2)hᵢ·fₜ(xᵢ)^2] + Omega(fₜ)。

定义树 fₜ 的结构为 q: ℝᵈ → {1,...,T}，叶子权重为 w ∈ ℝᵀ，则 fₜ(x) = w_{q(x)}。正则化项定义为 Omega(fₜ) = gamma*T + (1/2)lambda*sum(w_j^2)ⱼ wⱼ^2，其中 T 是叶子数，gamma 控制树的复杂度，lambda 是 L2 正则化系数。

将叶子样本集合 Iⱼ = {i | q(xᵢ) = j}，定义 Gⱼ = sumᵢ∈Iⱼ gᵢ 和 Hⱼ = sumᵢ∈Iⱼ hᵢ，目标函数可以改写为关于 w 的二次函数：Obj⁽ᵗ⁾ = sumⱼ [(Gⱼ)wⱼ + (1/2)(Hⱼ + lambda)wⱼ^2] + gamma*T。

对 wⱼ 求导并令导数为零，得到最优叶子权重：wⱼ* = -Gⱼ/(Hⱼ + lambda)。代入目标函数得到最优值：Obj* = -(1/2) sumⱼ Gⱼ^2/(Hⱼ + lambda) + gamma*T。这个公式就是 XGBoost 的分裂评估标准——增益（Gain）。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def xgb_optimal_leaf_weights(g, h, lambd=1.0):
    """
    计算 XGBoost 最优叶子权重: w* = -G / (H + lambda)
    
    g: 一阶梯度数组 (G_j = sumg_i)
    h: 二阶梯度数组 (H_j = sumh_i)
    lambd: L2 正则化系数
    """
    G = np.sum(g)
    H = np.sum(h)
    w_star = -G / (H + lambd)
    
    # 最优目标函数值: -1/2 * G^2/(H+lambda)
    obj_star = -0.5 * G**2 / (H + lambd)
    
    return w_star, obj_star

# 示例：二元分类，使用对数损失
# 假设某个叶子节点包含 5 个样本
y_true = np.array([1, 1, 0, 1, 0])
y_pred_prev = np.array([0.3, 0.6, 0.4, 0.7, 0.2])  # 上一轮预测

# 对数损失的梯度和 Hessian
g = y_pred_prev - y_true          # 一阶导数
h = y_pred_prev * (1 - y_pred_prev)  # 二阶导数

w, obj = xgb_optimal_leaf_weights(g, h, lambd=1.0)
print(f"最优叶子权重 w* = {w:.4f}")
print(f"该节点的最优目标值 Obj* = {obj:.4f}")`,
          },
        ],
        mermaid: `graph TD
    A["目标函数: Obj = suml + Omega"] --> B["二阶泰勒展开"]
    B --> C["Obj ≈ sum(g·f + (1/2)h·f^2) + Omega"]
    C --> D["定义叶子权重 w 和结构 q"]
    D --> E["Omega = gamma*T + (1/2)lambda*sum(w_j^2)^2"]
    E --> F["按叶子分组: G_j, H_j"]
    F --> G["对 w 求导 = 0"]
    G --> H["w* = -G/(H+lambda)"]
    H --> I["Obj* = -(1/2)sumG^2/(H+lambda) + gamma*T"]
    I -.-> J["这就是分裂评估的 Gain 公式"]`,
        warning: "二阶泰勒展开是 XGBoost 比 GBDT 快的根本原因。GBDT 只用一阶导数（梯度下降），而 XGBoost 同时使用一阶和二阶导数（牛顿法），相当于知道了曲率信息，每一步都更接近最优解。",
      },
      {
        title: "3. 分裂查找算法",
        body: `知道如何评估一个分裂的好坏之后，下一个问题是：如何高效地找到最优分裂点？XGBoost 提供了两种算法。

精确贪心算法（Exact Greedy Algorithm）枚举特征的所有可能取值作为候选分裂点，对每个候选点计算 Gain，选择 Gain 最大的那个。这种方法在数据量不大时效果最好，但当数据量达到百万级别时，枚举所有候选点的代价太高。

近似算法（Approximate Algorithm）通过加权分位数草图（Weighted Quantile Sketch）来筛选候选分裂点。核心思想是：不是每个样本值都值得尝试作为分裂点，我们可以根据 Hessian 值（二阶导数）对样本加权，然后只在分位数位置尝试分裂。具体来说，对每个特征，计算所有样本的 Hessian 累积和，然后在累积和的分位点（如 25%、50%、75%）处选择候选分裂点。

近似算法的好处是：候选分裂点数量可控，大幅减少计算量；而且它天然支持分布式计算和外部存储——因为分位数草图可以增量合并。这也是 XGBoost 能处理海量数据的关键。

对于连续特征，XGBoost 会先排序然后扫描；对于稀疏数据，XGBoost 会自动学习缺失值的最优分裂方向——在每个节点，算法分别尝试将缺失样本分到左子树和右子树，选择 Gain 更大的方向。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def calculate_split_gain(G_left, H_left, G_right, H_right, G_total, H_total, lambd=1.0, gamma=0.0):
    """
    计算分裂增益:
    Gain = 1/2 * [G_L^2/(H_L+lambda) + G_R^2/(H_R+lambda) - (G_L+G_R)^2/(H_L+H_R+lambda)] - gamma
    """
    gain_left = G_left**2 / (H_left + lambd)
    gain_right = G_right**2 / (H_right + lambd)
    gain_parent = (G_left + G_right)**2 / (H_left + H_right + lambd)
    return 0.5 * (gain_left + gain_right - gain_parent) - gamma

# 模拟精确贪心算法：扫描所有候选分裂点
def find_best_split_exact(X, g, h, feature_idx, lambd=1.0, gamma=0.0):
    """精确贪心算法：尝试特征的所有唯一值"""
    sorted_indices = np.argsort(X[:, feature_idx])
    g_sorted = g[sorted_indices]
    h_sorted = h[sorted_indices]
    
    G_total = np.sum(g)
    H_total = np.sum(h)
    
    best_gain = -np.inf
    best_threshold = None
    
    G_left, H_left = 0.0, 0.0
    unique_vals = np.unique(X[:, feature_idx])
    
    for val in unique_vals[:-1]:  # 最后一个值不能作为分裂点
        mask = X[:, feature_idx] == val
        G_left += np.sum(g_sorted[:np.sum(X[:, feature_idx] <= val)])
        H_left += np.sum(h_sorted[:np.sum(X[:, feature_idx] <= val)])
        
        G_right = G_total - G_left
        H_right = H_total - H_left
        
        gain = calculate_split_gain(G_left, H_left, G_right, H_right,
                                     G_total, H_total, lambd, gamma)
        if gain > best_gain:
            best_gain = gain
            best_threshold = val
    
    return best_threshold, best_gain

print("精确贪心算法会扫描所有唯一值作为候选分裂点")
print("当数据量很大时，改用近似算法（分位数草图）")`,
          },
        ],
        table: {
          headers: ["算法", "候选分裂点", "时间复杂度", "适用场景", "精度"],
          rows: [
            ["精确贪心", "所有唯一值", "O(数据量×特征数)", "小数据集", "⭐⭐⭐⭐⭐ 最优"],
            ["近似算法", "分位数候选", "O(候选数×特征数)", "大数据集/分布式", "⭐⭐⭐⭐ 近似最优"],
            ["直方图近似", "bin 边界", "O(bins×特征数)", "LightGBM 使用", "⭐⭐⭐⭐ 近似最优"],
          ],
        },
        tip: "实际使用中不需要手动选择算法——XGBoost 的 tree_method 参数会自动处理：'exact' 用于小数据集，'approx' 用于大数据集，'hist' 使用直方图优化。推荐默认使用 'hist'，它在绝大多数情况下又快又好。",
      },
      {
        title: "4. 正则化策略",
        body: `XGBoost 的正则化是其区别于传统 GBDT 的标志性特性。传统 GBDT 的目标函数只包含损失项，没有任何对模型复杂度的约束，这使得它容易过拟合。XGBoost 在目标函数中显式加入了正则化项：Omega(f) = gamma*T + (1/2)*lambda*sum(w_j^2)。

这个正则化项包含两个部分：gamma*T 惩罚叶子的数量——每多一个叶子，就增加 gamma 的惩罚。这直接控制了树的"宽度"，防止树生长得过于复杂。(1/2)lambda*sum(w_j^2)ⱼ^2 是 L2 正则化，它惩罚叶子权重的大小——倾向于让权重更小、更平滑。

除了目标函数中的显式正则化，XGBoost 还提供了一系列隐式正则化手段：max_depth 限制树的最大深度（控制"高度"）；min_child_weight 规定子节点所需的最小 Hessian 和（防止分裂出只含少数样本的叶子）；subsample 对样本进行随机采样（类似随机森林的 Bagging）；colsample_bytree 对特征进行随机采样（减少每棵树对特定特征的依赖）。

正则化参数的选择是一门艺术。太弱的正则化导致过拟合（训练集表现好、验证集差），太强的正则化导致欠拟合（训练集和验证集都差）。实践中建议从较小的正则化开始，逐步增加，同时监控验证集性能。`,
        code: [
          {
            lang: "python",
            code: `import xgboost as xgb
import numpy as np
from sklearn.model_selection import cross_val_score

# 对比不同正则化强度的效果
params_grid = {
    "无正则化": {"gamma": 0, "reg_alpha": 0, "reg_lambda": 1, "max_depth": 6},
    "轻度正则化": {"gamma": 0.1, "reg_alpha": 0.01, "reg_lambda": 1, "max_depth": 5},
    "中度正则化": {"gamma": 0.5, "reg_alpha": 0.1, "reg_lambda": 5, "max_depth": 4},
    "强度正则化": {"gamma": 1.0, "reg_alpha": 1.0, "reg_lambda": 10, "max_depth": 3},
}

for name, params in params_grid.items():
    model = xgb.XGBClassifier(
        n_estimators=200,
        learning_rate=0.05,
        **params,
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
    print(f"{name}: {scores.mean():.4f} (+/- {scores.std():.4f})")`,
          },
        ],
        table: {
          headers: ["参数", "作用", "正则化类型", "默认值", "调参方向"],
          rows: [
            ["gamma (min_split_loss)", "分裂需要的最小 Gain", "结构正则化", "0", "↑ 更保守"],
            ["reg_alpha (L1)", "叶子权重 L1 正则", "权重稀疏化", "0", "↑ 更多零权重"],
            ["reg_lambda (L2)", "叶子权重 L2 正则", "权重平滑", "1", "↑ 权重更小"],
            ["max_depth", "树最大深度", "结构限制", "6", "↓ 更简单"],
            ["min_child_weight", "最小 Hessian 和", "防小叶子", "1", "↑ 更大叶子"],
            ["subsample", "样本采样率", "随机性", "1.0", "↓ 更多随机性"],
          ],
        },
        mermaid: `graph TD
    A["正则化策略"] --> B["显式正则化"]
    A --> C["隐式正则化"]
    B --> D["gamma·T: 惩罚叶子数"]
    B --> E["(1/2)lambda*sum(w_j^2)^2: L2 权重惩罚"]
    C --> F["max_depth: 限制树高"]
    C --> G["min_child_weight: 防小叶子"]
    C --> H["subsample: 样本采样"]
    C --> I["colsample: 特征采样"]
    D --> J["目标函数中的正则化项"]
    E --> J
    F --> K["树生长控制"]
    G --> K
    H --> L["随机性控制"]
    I --> L`,
        warning: "L1 正则化（reg_alpha）会让部分叶子权重精确为零，这在某些场景下有助于特征选择，但也会降低模型表达能力。建议先调 L2 和 gamma，再考虑是否加入 L1。",
      },
      {
        title: "5. 实用调参技巧",
        body: `XGBoost 参数众多，但并非所有参数都同等重要。掌握调参的优先级和策略，比穷举所有组合更高效。

**第一优先级**：learning_rate（eta）和 n_estimators。这两个参数紧密相关——学习率越小，需要的树越多，但模型通常更稳健。经验法则：从 learning_rate=0.1、n_estimators=100 开始，如果验证集还在改善，可以降低学习率到 0.05 或 0.01，同时增加树的数量。学习率和树数量的乘积大致决定了模型的总拟合能力。

**第二优先级**：max_depth 和 min_child_weight。max_depth 控制树的复杂度，典型值为 3-10。min_child_weight 与 min_child_weight 决定了叶子节点所需的最小样本权重和，防止过度分裂。这两个参数通常一起调整：较大的 max_depth 需要较大的 min_child_weight 来配合。

**第三优先级**：subsample 和 colsample_bytree。subsample 控制每棵树使用的样本比例（0.5-1.0），colsample_bytree 控制每棵树使用的特征比例（0.5-1.0）。它们通过引入随机性来防止过拟合，同时也能加快训练速度。

调参策略推荐使用两阶段法：第一阶段用较大的学习率（0.1）和较少的树（100-200）快速探索参数空间；第二阶段固定树结构参数，用较小的学习率（0.01-0.05）和更多的树进行精细调优。`,
        code: [
          {
            lang: "python",
            code: `import xgboost as xgb
from sklearn.model_selection import GridSearchCV, train_test_split

# 第一阶段：确定树结构参数
param_grid_stage1 = {
    'max_depth': [3, 5, 7],
    'min_child_weight': [1, 3, 5],
    'subsample': [0.7, 0.8, 1.0],
    'colsample_bytree': [0.7, 0.8, 1.0],
}

model = xgb.XGBClassifier(
    n_estimators=200,
    learning_rate=0.1,
    gamma=0,
    reg_alpha=0,
    reg_lambda=1,
    random_state=42,
    use_label_encoder=False,
    eval_metric='logloss'
)

grid = GridSearchCV(
    model, param_grid_stage1,
    cv=3, scoring='accuracy',
    n_jobs=-1, verbose=1
)
grid.fit(X_train, y_train)
print(f"最佳参数: {grid.best_params_}")
print(f"最佳分数: {grid.best_score_:.4f}")

# 第二阶段：精细调优（学习率 + 树数量）
best_model = xgb.XGBClassifier(
    **grid.best_params_,
    learning_rate=0.01,
    n_estimators=1000,
    random_state=42,
    use_label_encoder=False,
    eval_metric='logloss'
)

# 使用早停防止过拟合
best_model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    early_stopping_rounds=50,
    verbose=False
)
print(f"最优迭代轮数: {best_model.best_iteration}")
print(f"测试集准确率: {best_model.score(X_test, y_test):.4f}")`,
          },
        ],
        table: {
          headers: ["参数组合", "learning_rate", "n_estimators", "预期效果", "训练时间"],
          rows: [
            ["快速实验", "0.3", "50", "粗糙 baseline", "⚡ 极快"],
            ["标准配置", "0.1", "200", "良好起点", "🏃 快"],
            ["精细调优", "0.05", "500", "较好性能", "🚶 中等"],
            ["竞赛级别", "0.01", "2000+", "极致性能", "🐢 慢"],
          ],
        },
        tip: "早停（Early Stopping）是 XGBoost 最实用的功能之一。设置 early_stopping_rounds=50，当验证集性能连续 50 轮不提升时自动停止训练。这比手动选择 n_estimators 更可靠。",
      },
      {
        title: "6. XGBoost vs LightGBM vs CatBoost",
        body: `XGBoost 并不是梯度提升树的唯一选择。LightGBM（微软，2017）和 CatBoost（Yandex，2017）是两个重要的竞争对手。理解它们的差异，能帮助你在不同场景下做出最优选择。

XGBoost 是最成熟的框架，社区最大、文档最全、集成学习技巧最丰富。它的精确贪心算法和直方图优化在中小数据集上表现优异。缺点是训练速度在大数据集上不如 LightGBM，且对类别特征需要手动编码。

LightGBM 采用直方图算法（Histogram-based）和 Leaf-wise 生长策略。Leaf-wise 每次选择增益最大的叶子进行分裂（而非 Level-wise 逐层生长），这使得它在大数据集上训练速度极快。但它对小数据集容易过拟合，需要配合 max_depth 使用。

CatBoost 的最大优势是对类别特征的原生支持——它使用 Ordered Target Encoding，无需手动进行 one-hot 或 label encoding。它还实现了 Ordered Boosting，解决了传统 GBDT 中的预测偏移（Prediction Shift）问题。在包含大量类别特征的数据集上，CatBoost 往往表现最好。`,
        code: [
          {
            lang: "python",
            code: `# 三个框架的 API 对比

# XGBoost
import xgboost as xgb
xgb_model = xgb.XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42
)

# LightGBM
import lightgbm as lgb
lgb_model = lgb.LGBMClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42
)

# CatBoost（注意类别特征处理）
from catboost import CatBoostClassifier
cat_model = CatBoostClassifier(
    iterations=100,
    learning_rate=0.1,
    depth=5,
    cat_features=['category_col1', 'category_col2'],  # 原生支持！
    random_state=42,
    verbose=False
)`,
          },
        ],
        table: {
          headers: ["特性", "XGBoost", "LightGBM", "CatBoost"],
          rows: [
            ["生长策略", "Level-wise", "Leaf-wise", "Level-wise"],
            ["候选分裂", "精确/直方图", "直方图", " Oblivious Tree"],
            ["类别特征", "需编码", "需编码", "✅ 原生支持"],
            ["缺失值", "✅ 自动处理", "✅ 自动处理", "✅ 自动处理"],
            ["训练速度", "中等", "🚀 最快", "中等"],
            ["小数据集", "✅ 好", "⚠️ 易过拟合", "✅ 好"],
            ["内存占用", "中等", "最低", "较高"],
            ["社区生态", "🌟 最大", "大", "中等"],
          ],
        },
        mermaid: `graph TD
    A["选择哪个框架？"] --> B{"数据集规模？"}
    B -->|"小（<10万）"| C["XGBoost 或 CatBoost"]
    B -->|"大（>100万）"| D["LightGBM"]
    A --> E{"有类别特征？"}
    E -->|是| F["CatBoost 原生支持"]
    E -->|否| G["XGBoost 或 LightGBM"]
    A --> H{"需要最快训练？"}
    H -->|是| I["LightGBM"]
    H -->|否| J["XGBoost（最成熟稳定）"]`,
        tip: "竞赛选手的经验法则：先用 XGBoost 建立 baseline，再用 LightGBM 加速训练，最后用 CatBoost 处理类别特征。如果时间允许，将三个模型的预测结果做加权集成（stacking），往往能拿到更好的成绩。",
      },
      {
        title: "7. 代码实战：完整项目",
        body: `理论已经足够，让我们用一个完整的端到端项目来实践 XGBoost。我们将使用经典的加州房价数据集，完成从数据探索到模型部署的全流程。

这个项目将涵盖：数据加载与探索、特征工程、模型训练与交叉验证、超参数调优、特征重要性分析、以及模型保存与加载。每一步都是真实项目中的标准流程。

值得注意的是，XGBoost 对特征缩放不敏感（树模型基于分裂点而非距离），所以不需要标准化。但它对缺失值敏感——虽然 XGBoost 能自动处理 NaN，但理解缺失模式有助于特征工程。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt

# ========== 1. 数据加载与探索 ==========
california = fetch_california_housing()
X = pd.DataFrame(california.data, columns=california.feature_names)
y = california.target

print(f"数据集: {X.shape[0]} 样本, {X.shape[1]} 特征")
print(f"目标范围: {y.min():.2f} - {y.max():.2f}")
print(f"缺失值:\\n{X.isnull().sum()}")

# 特征工程：创建交互特征
X['Rooms_per_House'] = X['AveRooms'] / X['AveOccup']
X['Bedrooms_ratio'] = X['AveBedrms'] / X['AveRooms']
X['Population_density'] = X['Population'] / X['HouseAge'].clip(lower=1)

# ========== 2. 数据划分 ==========
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ========== 3. 模型训练（带早停） ==========
model = xgb.XGBRegressor(
    n_estimators=1000,
    learning_rate=0.05,
    max_depth=5,
    min_child_weight=3,
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=0.1,
    reg_alpha=0.1,
    reg_lambda=5,
    random_state=42,
    tree_method='hist',
    early_stopping_rounds=50,
)

model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=False
)

# ========== 4. 模型评估 ==========
y_pred = model.predict(X_test)
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.4f}")
print(f"R^2: {r2_score(y_test, y_pred):.4f}")
print(f"最优迭代轮数: {model.best_iteration}")

# 交叉验证
cv_scores = cross_val_score(
    xgb.XGBRegressor(
        n_estimators=model.best_iteration,
        learning_rate=0.05,
        max_depth=5,
        random_state=42
    ),
    X_train, y_train, cv=5,
    scoring='neg_root_mean_squared_error'
)
print(f"CV RMSE: {-cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

# ========== 5. 特征重要性 ==========
importance = model.feature_importances_
feat_imp = pd.Series(importance, index=X.columns)
feat_imp = feat_imp.sort_values(ascending=False)
print("\\n前5重要特征:")
print(feat_imp.head())

# ========== 6. 模型保存与加载 ==========
model.save_model('xgb_california_model.json')

loaded_model = xgb.XGBRegressor()
loaded_model.load_model('xgb_california_model.json')
print("\\n模型已保存并可重新加载！")`,
          },
        ],
        table: {
          headers: ["步骤", "操作", "关键点"],
          rows: [
            ["数据探索", "查看分布、缺失值", "XGBoost 对特征缩放不敏感"],
            ["特征工程", "交互特征、比率特征", "树模型能自动捕获非线性交互，但好的特征仍然重要"],
            ["模型训练", "带早停的交叉验证", "early_stopping_rounds 防止过拟合"],
            ["超参数调优", "网格搜索或随机搜索", "先调树结构，再调学习率"],
            ["特征重要性", "gain/weight/cover", "gain 反映特征对预测的贡献"],
            ["模型保存", "JSON 格式", "比 pickle 更轻量、更安全"],
          ],
        },
        warning: "XGBoost 的 feature_importances_ 默认使用 'gain'（信息增益），它衡量每个特征对模型预测的贡献度。但如果特征之间存在强相关性，重要性可能被分散。建议在特征选择时使用 SHAP 值进行更准确的解释。",
        tip: "完整项目的通用模板：数据探索 → 特征工程 → 基线模型 → 交叉验证 → 超参数调优 → 特征重要性 → 模型保存。这个流程不仅适用于 XGBoost，也适用于任何机器学习项目。",
      },
    ],
  };
