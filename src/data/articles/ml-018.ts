import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-018",
    title: "偏差-方差权衡：过拟合与欠拟合",
    category: "ml",
    tags: ["偏差-方差", "过拟合", "欠拟合"],
    summary: "理解机器学习最核心的概念——偏差与方差的平衡之道",
    date: "2026-04-12",
    readTime: "16 min",
    level: "入门",
    content: [
        {
            title: "1. 误差分解：偏差 + 方差 + 噪声",
            body: `任何机器学习模型的预测误差都可以分解为三个部分：偏差、方差和不可约噪声。理解这个分解是诊断和优化模型的第一步，也是理解过拟合与欠拟合的理论基础。

偏差衡量的是模型预测的平均值与真实值之间的差距。高偏差意味着模型做出了过于简化的假设，无法捕捉数据中的真实模式——这就是欠拟合的本质。比如用一条直线去拟合明显的曲线关系，无论训练多少次，偏差都不会消失。

方差衡量的是模型对训练集微小变化的敏感程度。高方差意味着模型对训练数据的噪声也"死记硬背"了——换一个训练集，模型给出的预测会大幅波动。这就是过拟合的本质。

不可约噪声是数据本身固有的随机性，无论模型多么完美都无法消除。识别噪声和可约误差的边界，能帮助你设定合理的性能预期——有时候"最好的模型"也不完美，这并非你的错。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

# 模拟误差分解的直观理解
np.random.seed(42)

# 真实函数
def true_function(x):
    return np.sin(x)

# 生成含噪声的观测数据
x = np.linspace(0, 2 * np.pi, 100)
y_true = true_function(x)
noise_level = 0.3
y_noisy = y_true + np.random.normal(0, noise_level, len(x))

# 不同模型的预测（模拟多次训练）
n_experiments = 50
predictions = np.zeros((n_experiments, len(x)))

for i in range(n_experiments):
    # 每次用不同噪声数据训练一个多项式模型
    sample_idx = np.random.choice(len(x), 30, replace=False)
    coeffs = np.polyfit(x[sample_idx], y_noisy[sample_idx], deg=5)
    predictions[i] = np.polyval(coeffs, x)

# 误差分解
avg_pred = predictions.mean(axis=0)
bias = np.mean((avg_pred - y_true) ** 2)
variance = np.mean(np.var(predictions, axis=0))
noise = noise_level ** 2
total_error = bias + variance + noise

print(f"偏差 (Bias):       {bias:.4f}")
print(f"方差 (Variance):   {variance:.4f}")
print(f"噪声 (Noise):      {noise:.4f}")
print(f"总误差 (分解):     {total_error:.4f}")
print(f"总误差 (直接计算): {np.mean((y_noisy - avg_pred) ** 2):.4f}")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np

# 偏差和方差的直觉：靶心图模拟
np.random.seed(42)

# 靶心位置 (真实值)
target_x, target_y = 5.0, 5.0

# 高偏差低方差：预测集中在错误位置
high_bias_preds = np.random.normal(loc=(3.0, 3.0), scale=0.3, size=(20, 2))

# 低偏差高方差：预测分散但中心接近靶心
high_var_preds = np.random.normal(loc=(5.0, 5.0), scale=1.5, size=(20, 2))

# 低偏差低方差：理想状态
ideal_preds = np.random.normal(loc=(5.0, 5.0), scale=0.3, size=(20, 2))

def calc_bias_variance(preds, target):
    mean_pred = preds.mean(axis=0)
    bias_sq = np.sum((mean_pred - target) ** 2)
    variance = np.mean(np.sum((preds - mean_pred) ** 2, axis=1))
    return bias_sq, variance

for name, preds in [("高偏差低方差", high_bias_preds),
                     ("低偏差高方差", high_var_preds),
                     ("低偏差低方差", ideal_preds)]:
    b, v = calc_bias_variance(preds, np.array([target_x, target_y]))
    print(f"{name}: 偏差={b:.2f}, 方差={v:.2f}")`,
                },
            ],
            table: {
                headers: ["误差分量", "含义", "对应问题", "能否通过更多数据降低"],
                rows: [
                    ["偏差 (Bias)", "模型平均预测与真实值的差距", "欠拟合", "不能，需要更复杂模型"],
                    ["方差 (Variance)", "模型预测随训练集变化的波动", "过拟合", "能，更多数据可稳定模型"],
                    ["噪声 (Noise)", "数据本身的随机性", "不可约", "不能，这是数据固有属性"],
                ],
            },
            mermaid: `graph TD
    A["总预测误差"] --> B["偏差 Bias"]
    A --> C["方差 Variance"]
    A --> D["噪声 Noise"]
    B --> E["模型太简单"]
    B --> F["欠拟合"]
    C --> G["模型太复杂"]
    C --> H["过拟合"]
    D --> I["数据固有随机性"]
    D --> J["不可约误差"]
    E -.->|增加模型复杂度| K["降低偏差"]
    G -.->|增加数据/正则化| L["降低方差"]`,
            tip: "偏差和方差的分解公式假设使用平方损失。对于其他损失函数，分解形式会有所不同，但直觉是通用的。",
            warning: "噪声项是你无法消除的——不要为了追求 100% 准确率而过拟合训练数据中的噪声。",
        },
        {
            title: "2. 过拟合 vs 欠拟合的直觉理解",
            body: `过拟合和欠拟合是机器学习中最常遇到的两个陷阱，它们代表了模型复杂度的两个极端。理解它们的直觉比记住定义更重要。

欠拟合就像一个只会做一道菜的新手厨师——无论你给他什么食材，他都只会炒鸡蛋。模型太简单，根本捕捉不到数据中的模式。在训练集上表现就很差，更不用说测试集了。你一眼就能发现欠拟合，因为训练误差本身就很高。

过拟合则像一个记忆力超强的学生，他把历年真题的答案一字不差地背了下来，但从不理解背后的原理。在训练集上表现完美，但一旦遇到新题就崩溃。这种模型把训练数据中的噪声和偶然模式当成了普遍规律。

判断模型状态的关键是同时观察训练误差和验证误差。如果两者都高，是欠拟合；如果训练误差低但验证误差高，是过拟合；如果两者都低且接近，恭喜你，模型拟合得刚刚好。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import warnings
warnings.filterwarnings("ignore")

# 用不同复杂度的多项式拟合数据，直观展示欠拟合和过拟合
np.random.seed(42)

# 生成带噪声的曲线数据
n_samples = 30
x = np.linspace(0, 1, n_samples)
y_true = np.sin(2 * np.pi * x)
y_noisy = y_true + np.random.normal(0, 0.3, n_samples)

# 用不同次数的多项式拟合
degrees = [1, 3, 15]  # 欠拟合、合适、过拟合

for deg in degrees:
    # 在训练集上拟合
    coeffs = np.polyfit(x, y_noisy, deg)
    y_pred = np.polyval(coeffs, x)

    # 训练误差
    train_mse = np.mean((y_noisy - y_pred) ** 2)

    # 在更多测试点上评估
    x_test = np.linspace(0, 1, 200)
    y_test_true = np.sin(2 * np.pi * x_test)
    y_test_pred = np.polyval(coeffs, x_test)
    test_mse = np.mean((y_test_true - y_test_pred) ** 2)

    label = {1: "欠拟合", 3: "拟合良好", 15: "过拟合"}[deg]
    print(f"{'='*40}")
    print(f"多项式次数={deg} ({label})")
    print(f"训练集 MSE: {train_mse:.4f}")
    print(f"测试集 MSE: {test_mse:.4f}")
    print(f"差距: {test_mse - train_mse:.4f}")`,
                },
                {
                    lang: "python",
                    code: `from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error
import numpy as np

# 用决策树深度模拟欠拟合和过拟合
np.random.seed(42)
x = np.linspace(0, 10, 100).reshape(-1, 1)
y = np.sin(x).ravel() + np.random.normal(0, 0.3, 100)

# 拆分训练和测试
x_train = x[::2]
y_train = y[::2]
x_test = x[1::2]
y_test = y[1::2]

print(f"{'深度':<6} {'训练MSE':<12} {'测试MSE':<12} {'状态'}")
print("-" * 45)

for depth in [1, 2, 3, 5, 8, 15]:
    model = DecisionTreeRegressor(max_depth=depth, random_state=42)
    model.fit(x_train, y_train)

    train_pred = model.predict(x_train)
    test_pred = model.predict(x_test)

    train_mse = mean_squared_error(y_train, train_pred)
    test_mse = mean_squared_error(y_test, test_pred)

    gap = test_mse - train_mse
    if depth <= 2:
        status = "欠拟合"
    elif depth <= 5:
        status = "拟合良好"
    else:
        status = "过拟合"

    print(f"{depth:<6} {train_mse:<12.4f} {test_mse:<12.4f} {status}")`,
                },
            ],
            table: {
                headers: ["特征", "欠拟合", "拟合良好", "过拟合"],
                rows: [
                    ["训练误差", "高", "低", "极低"],
                    ["验证误差", "高", "低", "高"],
                    ["训练-验证差距", "小", "小", "大"],
                    ["模型复杂度", "太低", "适中", "太高"],
                    ["根本原因", "模型太简单", "复杂度匹配数据", "记住了噪声"],
                ],
            },
            mermaid: `graph LR
    A["模型复杂度增加 →"] --> B["欠拟合区"]
    A --> C["最佳拟合区"]
    A --> D["过拟合区"]
    B --> E["训练误差高"]
    B --> F["验证误差高"]
    C --> G["训练误差低"]
    C --> H["验证误差低"]
    D --> I["训练误差极低"]
    D --> J["验证误差升高"]
    class D s2
    class C s1
    class B s0
    classDef s0 fill:#7f1d1d
    classDef s1 fill:#14532d
    classDef s2 fill:#7f1d1d`,
            tip: "当你不确定模型状态时，先把模型复杂度调高——如果训练误差仍然很高，说明问题不在过拟合，而在模型能力不足。",
            warning: "不要看到训练误差高就盲目增加模型复杂度——先检查数据质量和特征工程，脏数据会让任何复杂模型都表现不佳。",
        },
        {
            title: "3. 模型复杂度曲线：寻找甜蜜点",
            body: `模型复杂度与误差之间的关系是机器学习中最优美的曲线之一。它揭示了一个核心事实：并不是越复杂的模型越好，也不是越简单的模型越好——关键在于找到偏差和方差的平衡点。

当模型复杂度从零开始增加时，训练误差和验证误差都会下降。这个阶段模型从"完全不会学"到"逐渐学懂了规律"，偏差是主要矛盾。继续增加复杂度，训练误差持续下降（甚至趋近于零），但验证误差开始回升——方差成了主要矛盾。

验证误差的最低点就是模型复杂度的"甜蜜点"。在这个点上，模型既足够灵活以捕捉真实模式，又足够克制以忽略噪声。这个甜蜜点的位置取决于数据量、数据质量和噪声水平。

数据量越大，甜蜜点会向右移动（允许更复杂的模型）。这就是为什么深度学习在大数据时代崛起的根本原因——不是算法本身发生了质变，而是我们终于有了足够的"燃料"来驱动更复杂的引擎。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import warnings
warnings.filterwarnings("ignore")

# 绘制模型复杂度曲线的数值模拟
np.random.seed(42)

# 生成数据
n_train = 50
n_test = 500
x_train = np.linspace(0, 1, n_train)
y_train = np.sin(2 * np.pi * x_train) + np.random.normal(0, 0.2, n_train)
x_test = np.linspace(0, 1, n_test)
y_test = np.sin(2 * np.pi * x_test)

# 不同复杂度下的误差
degrees = range(1, 21)
train_errors = []
test_errors = []

for deg in degrees:
    coeffs = np.polyfit(x_train, y_train, deg)
    train_pred = np.polyval(coeffs, x_train)
    test_pred = np.polyval(coeffs, x_test)
    train_errors.append(np.mean((y_train - train_pred) ** 2))
    test_errors.append(np.mean((np.sin(2 * np.pi * x_test) - test_pred) ** 2))

# 找到最优复杂度
best_deg = degrees[np.argmin(test_errors)]

print("=== 模型复杂度 vs 误差 ===")
print(f"{'次数':<6} {'训练误差':<12} {'测试误差':<12}")
print("-" * 35)
for deg in degrees:
    idx = deg - 1
    marker = " <-- 最优" if deg == best_deg else ""
    print(f"{deg:<6} {train_errors[idx]:<12.6f} {test_errors[idx]:<12.6f}{marker}")

print(f"\\n最优多项式次数: {best_deg}")
print(f"最低测试误差: {min(test_errors):.6f}")`,
                },
                {
                    lang: "python",
                    code: `from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error
import numpy as np

# KNN 的 K 值也是复杂度参数：K 越小越复杂
np.random.seed(42)
n = 200
X = np.random.uniform(0, 10, (n, 1))
y = np.sin(X.ravel()) + np.random.normal(0, 0.2, n)

X_train, X_test = X[:150], X[150:]
y_train, y_test = y[:150], y[150:]

k_values = [1, 2, 3, 5, 8, 12, 20, 30, 50]

print("=== KNN: K 值与误差的关系 ===")
print(f"{'K 值':<6} {'训练MSE':<12} {'测试MSE':<12} {'状态'}")
print("-" * 42)

for k in k_values:
    model = KNeighborsRegressor(n_neighbors=k)
    model.fit(X_train, y_train)

    train_mse = mean_squared_error(y_train, model.predict(X_train))
    test_mse = mean_squared_error(y_test, model.predict(X_test))

    if k <= 2:
        status = "过拟合"
    elif k <= 8:
        status = "拟合良好"
    else:
        status = "欠拟合"

    print(f"{k:<6} {train_mse:<12.4f} {test_mse:<12.4f} {status}")`,
                },
            ],
            table: {
                headers: ["模型", "复杂度参数", "参数增大时", "最优值特征"],
                rows: [
                    ["多项式回归", "多项式次数", "更复杂→过拟合", "测试误差最小处"],
                    ["决策树", "最大深度", "更深→过拟合", "验证误差最低处"],
                    ["KNN", "K 值", "更大→更简单→欠拟合", "测试误差最小处"],
                    ["正则化模型", "正则化强度", "更强→更简单→欠拟合", "验证误差最低处"],
                ],
            },
            mermaid: `graph TD
    A["模型复杂度 →"] --> B{"误差变化"}
    B --> C["训练误差: 单调下降"]
    B --> D["验证误差: 先降后升"]
    D --> E["下降段: 欠拟合"]
    D --> F["最低点: 甜蜜点"]
    D --> G["上升段: 过拟合"]
    F --> H["最佳泛化能力"]
    E --> I["增加复杂度"]
    G --> J["降低复杂度"]
    I --> F
    J --> F`,
            tip: "复杂度曲线不是对称的——过拟合区域通常比欠拟合区域更宽，这意味着增加复杂度比减少复杂度更容易犯错误。",
            warning: "不同数据集的最优复杂度可能差异很大——不要将在一个数据集上找到的最优参数直接迁移到另一个数据集。",
        },
        {
            title: "4. 诊断方法：学习曲线与验证曲线",
            body: `知道了偏差和方差的概念还不够，你需要具体的工具来诊断模型到底处于什么状态。学习曲线和验证曲线是 scikit-learn 提供的两大诊断利器，它们能帮你精准定位问题所在。

学习曲线回答的问题是：增加训练数据能否改善模型表现？它将训练样本数量作为横轴，同时画出训练集得分和验证集得分。如果两条曲线都偏低且最终靠拢，说明增加数据无济于事——这是欠拟合的信号，需要更强大的模型或更好的特征。如果训练集得分很高但验证集得分偏低，且两者之间存在较大间隙，增加数据可能有所帮助——这是过拟合的信号。

验证曲线回答的问题是：某个超参数取什么值最合适？它固定其他所有条件不变，只改变一个超参数，同时绘制训练集和验证集上的得分。通过观察两条曲线的交叉和分离，你可以精确定位欠拟合和过拟合的边界。

这两个工具的最大价值在于：它们把"我觉得模型可能过拟合了"这种模糊的直觉，变成了"验证曲线显示当 max_depth 超过 8 时测试误差开始上升"这样精确的判断。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.model_selection import learning_curve
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
import numpy as np
import warnings
warnings.filterwarnings("ignore")

# 生成数据集
X, y = make_classification(n_samples=1000, n_features=20,
                            n_informative=15, random_state=42)

model = RandomForestClassifier(n_estimators=50, max_depth=None, random_state=42)

# 计算学习曲线
train_sizes, train_scores, val_scores = learning_curve(
    model, X, y, cv=5,
    train_sizes=np.linspace(0.1, 1.0, 8),
    scoring="accuracy", n_jobs=-1
)

train_mean = train_scores.mean(axis=1)
val_mean = val_scores.mean(axis=1)

print("=== 学习曲线数据 ===")
print(f"{'样本数':<10} {'训练得分':<12} {'验证得分':<12} {'差距':<10}")
print("-" * 48)

for i in range(len(train_sizes)):
    gap = train_mean[i] - val_mean[i]
    print(f"{int(train_sizes[i]):<10} {train_mean[i]:<12.4f} {val_mean[i]:<12.4f} {gap:<10.4f}")

# 自动诊断
final_gap = train_mean[-1] - val_mean[-1]
if train_mean[-1] < 0.75:
    print("\\n诊断: 欠拟合 - 考虑增加模型复杂度或特征工程")
elif final_gap > 0.05:
    print("\\n诊断: 过拟合 - 考虑正则化或增加训练数据")
else:
    print("\\n诊断: 拟合良好")`,
                },
                {
                    lang: "python",
                    code: `from sklearn.model_selection import validation_curve
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
import numpy as np
import warnings
warnings.filterwarnings("ignore")

X, y = make_classification(n_samples=800, n_features=20,
                            n_informative=15, random_state=42)

# 验证曲线：探索 max_depth 的影响
param_range = [1, 2, 3, 5, 8, 12, 16, 20, None]
train_scores, val_scores = validation_curve(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X, y, param_name="max_depth", param_range=param_range,
    cv=5, scoring="accuracy", n_jobs=-1
)

train_mean = train_scores.mean(axis=1)
val_mean = val_scores.mean(axis=1)

print("=== 验证曲线：max_depth ===")
print(f"{'max_depth':<12} {'训练得分':<12} {'验证得分':<12} {'过拟合':<10}")
print("-" * 50)

best_depth = param_range[np.argmax(val_mean)]

for i, depth in enumerate(param_range):
    gap = train_mean[i] - val_mean[i]
    status = "过拟合" if gap > 0.05 else "正常"
    label = str(depth) if depth is not None else "None"
    marker = " <-- 最优" if depth == best_depth else ""
    print(f"{label:<12} {train_mean[i]:<12.4f} {val_mean[i]:<12.4f} {status:<10}{marker}")

print(f"\\n最优 max_depth: {best_depth}")
print(f"最高验证得分: {val_mean.max():.4f}")`,
                },
            ],
            table: {
                headers: ["工具", "横轴", "纵轴", "解决的问题", "输出"],
                rows: [
                    ["学习曲线", "训练样本数量", "模型得分", "是否需要更多数据", "两条曲线: 训练/验证"],
                    ["验证曲线", "单个超参数值", "模型得分", "超参数取什么值", "两条曲线: 训练/验证"],
                ],
            },
            mermaid: `graph TD
    A["模型诊断需求"] --> B{"什么问题?"}
    B -->|需要更多数据吗| C["学习曲线"]
    B -->|超参数选多少| D["验证曲线"]
    C --> E{"训练和验证得分都低?"}
    E -->|是| F["欠拟合: 增加模型复杂度"]
    E -->|否| G{"训练高, 验证低?"}
    G -->|是| H["过拟合: 正则化/增数据"]
    G -->|否| I["拟合良好"]
    D --> J{"训练高验证低出现在哪?"}
    J -->|参数值大时| K["降低参数值"]
    J -->|参数值小时| L["增加参数值"]`,
            tip: "学习曲线中，如果增加数据后两条曲线仍在收敛（验证得分还在上升），说明继续收集数据确实有效。",
            warning: "验证曲线每次只能探索一个超参数——多参数联合优化需要用网格搜索或随机搜索，但不能同时可视化。",
        },
        {
            title: "5. 降低偏差的策略：对付欠拟合",
            body: `当你确认模型处于欠拟合状态时（训练集和验证集表现都很差），核心思路是让模型"学得更多"。这意味着增加模型的表达能力，让它能够捕捉数据中更复杂的模式。

最直接的方法是增加模型复杂度。对于决策树，可以增加最大深度或减少叶子节点的最小样本数。对于多项式回归，可以增加多项式次数。对于神经网络，可以增加层数或每层的神经元数量。但要注意：增加复杂度只是方向，增加多少需要通过验证曲线来确定。

特征工程往往比单纯增加模型复杂度更有效。添加交互特征（比如"面积 = 长 × 宽"）、多项式特征（比如 x^2、x^3）或领域知识特征，可以让原本简单的模型表现出更强大的拟合能力。scikit-learn 的 PolynomialFeatures 和 FeatureUnion 就是为此设计的。

减少正则化强度是另一个立竿见影的手段。如果你的模型设置了很大的 alpha 或 lambda 参数，模型会被过度"压制"，即使结构上足够复杂也无法充分拟合数据。逐步减小正则化参数，同时观察验证误差的变化，可以找到正则化和拟合能力之间的平衡。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import Ridge
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score
from sklearn.datasets import make_regression
import numpy as np

# 欠拟合场景：线性模型拟合非线性数据
X, y = make_regression(n_samples=200, n_features=5, noise=10, random_state=42)
# 加入非线性关系
y = y + 0.5 * X[:, 0] ** 2 + X[:, 1] * X[:, 2]

print("=== 降低偏差：增加多项式特征 ===")
print(f"{'多项式次数':<12} {'MSE (5折CV)':<20}")
print("-" * 35)

for degree in [1, 2, 3, 4]:
    model = make_pipeline(
        PolynomialFeatures(degree, include_bias=False),
        Ridge(alpha=1.0)
    )
    scores = cross_val_score(model, X, y, cv=5,
                              scoring="neg_mean_squared_error")
    mse = -scores.mean()
    print(f"{degree:<12} {mse:<20.2f}")`,
                },
                {
                    lang: "python",
                    code: `from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import cross_val_score
from sklearn.datasets import make_friedman1
import numpy as np

# Friedman 数据集包含非线性关系和特征交互
X, y = make_friedman1(n_samples=300, noise=1.0, random_state=42)

# 策略1: 减少正则化强度
print("=== 降低偏差：减少正则化 ===")
for alpha in [100, 10, 1, 0.1, 0.01]:
    model = Ridge(alpha=alpha)
    scores = cross_val_score(model, X, y, cv=5,
                              scoring="r2")
    print(f"alpha={alpha:<8.2f}: R2 = {scores.mean():.4f}")

# 策略2: 使用更强的模型
print("\\n=== 降低偏差：换用更强模型 ===")
models = {
    "Ridge 回归": Ridge(alpha=0.1),
    "梯度提升 (50棵树)": GradientBoostingRegressor(
        n_estimators=50, max_depth=3, random_state=42),
    "梯度提升 (200棵树)": GradientBoostingRegressor(
        n_estimators=200, max_depth=5, random_state=42),
}

for name, model in models.items():
    scores = cross_val_score(model, X, y, cv=5, scoring="r2")
    print(f"{name:<25}: R2 = {scores.mean():.4f} (+/- {scores.std()*2:.4f})")`,
                },
            ],
            table: {
                headers: ["策略", "具体操作", "适用模型", "效果"],
                rows: [
                    ["增加模型复杂度", "增加层数/深度/次数", "所有模型", "直接提升表达能力"],
                    ["多项式特征", "添加 x^2, x^3, x1*x2", "线性模型", "让线性模型拟合非线性"],
                    ["减少正则化", "降低 alpha/lambda", "Ridge/Lasso/弹性网", "释放模型拟合能力"],
                    ["特征工程", "添加交互/领域特征", "所有模型", "最有效的偏差降低方法"],
                    ["换用更强模型", "线性→树→集成", "所有场景", "从根本上提升能力"],
                ],
            },
            mermaid: `graph TD
    A["确认欠拟合"] --> B{"选择策略"}
    B --> C["增加模型复杂度"]
    B --> D["特征工程"]
    B --> E["减少正则化"]
    B --> F["换用更强模型"]
    C --> G["验证曲线确认"]
    D --> G
    E --> G
    F --> G
    G --> H{"验证得分提升?"}
    H -->|是| I["继续使用"]
    H -->|否| J["尝试其他策略"]
    J --> B`,
            tip: "特征工程通常比盲目增加模型复杂度更有效——一个好的特征胜过十层神经网络。",
            warning: "增加模型复杂度时一定要同步监控验证误差，否则可能直接从欠拟合跳到过拟合。",
        },
        {
            title: "6. 降低方差的策略：对付过拟合",
            body: `过拟合是机器学习实践中最常见的问题，尤其是当模型容量远超数据量时。降低方差的核心思路是"约束"模型——不是让它不能学，而是让它不要学得太放肆。

正则化是最经典的方差控制手段。L2 正则化（Ridge）在损失函数中加入权重的平方和，让模型倾向于使用更小、更分散的权重。L1 正则化（Lasso）加入权重的绝对值和，不仅防止过拟合还能做特征选择。弹性网（ElasticNet）结合两者，兼顾稳定性和稀疏性。

集成方法是通过"人多力量大"来降低方差的另一条路径。Bagging（如随机森林）通过训练多个模型并取平均，将方差降低了约 1/N（N 是模型数量）。Boosting 虽然主要降低偏差，但通过限制每棵树的深度（浅树）也能控制方差。

数据增强在图像和文本领域尤为有效——通过对训练数据进行随机变换（旋转、裁剪、同义词替换）人为扩大数据集，让模型看到更多变体而不增加收集成本。Dropout 则是神经网络中的"集成技巧"——每次训练随机屏蔽一部分神经元，强制网络不依赖任何单一特征通路。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.model_selection import cross_val_score
from sklearn.datasets import make_regression
import numpy as np

# 过拟合场景：高维数据 + 少量样本
X, y, coeffs = make_regression(n_samples=50, n_features=100,
                                n_informative=10, noise=10,
                                coef=True, random_state=42)

print("=== 降低方差：正则化方法对比 ===")
print(f"{'模型':<20} {'R2 (5折CV)':<15} {'非零系数':<10}")
print("-" * 48)

# 无正则化的基线
from sklearn.linear_model import LinearRegression
base = LinearRegression()
base_scores = cross_val_score(base, X, y, cv=5, scoring="r2")
nonzero = np.sum(np.abs(base.coef_) > 1e-10)
print(f"{'线性回归 (无正则)':<18} {base_scores.mean():<15.4f} {nonzero:<10}")

# 不同正则化方法
models = {
    "Ridge (alpha=1)": Ridge(alpha=1.0),
    "Ridge (alpha=10)": Ridge(alpha=10.0),
    "Lasso (alpha=0.1)": Lasso(alpha=0.1, max_iter=5000),
    "ElasticNet": ElasticNet(alpha=0.1, l1_ratio=0.5, max_iter=5000),
}

for name, model in models.items():
    scores = cross_val_score(model, X, y, cv=5, scoring="r2")
    model.fit(X, y)
    nonzero = np.sum(np.abs(model.coef_) > 1e-10)
    print(f"{name:<18} {scores.mean():<15.4f} {nonzero:<10}")`,
                },
                {
                    lang: "python",
                    code: `from sklearn.ensemble import (
    RandomForestRegressor, GradientBoostingRegressor,
    BaggingRegressor
)
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import cross_val_score
from sklearn.datasets import make_regression
import numpy as np

# 对比单一模型和集成模型的方差控制
X, y = make_regression(n_samples=300, n_features=20,
                        noise=20, random_state=42)

print("=== 降低方差：单一模型 vs 集成方法 ===")
print(f"{'模型':<25} {'R2 (5折CV)':<15} {'方差':<10}")
print("-" * 53)

models = {
    "单棵决策树 (无限制)": DecisionTreeRegressor(random_state=42),
    "单棵决策树 (max_depth=5)": DecisionTreeRegressor(
        max_depth=5, random_state=42),
    "随机森林 (100棵)": RandomForestRegressor(
        n_estimators=100, random_state=42),
    "Bagging (100棵)": BaggingRegressor(
        n_estimators=100, random_state=42),
    "梯度提升 (100棵)": GradientBoostingRegressor(
        n_estimators=100, max_depth=4, random_state=42),
}

for name, model in models.items():
    scores = cross_val_score(model, X, y, cv=5, scoring="r2")
    print(f"{name:<23} {scores.mean():<15.4f} {scores.var():<10.6f}")`,
                },
            ],
            table: {
                headers: ["方法", "原理", "适用场景", "主要效果"],
                rows: [
                    ["L2 正则化 (Ridge)", "惩罚大权重", "高维/共线性", "降低方差, 保留所有特征"],
                    ["L1 正则化 (Lasso)", "惩罚权重的绝对值", "高维稀疏", "降低方差 + 特征选择"],
                    ["随机森林 (Bagging)", "多模型投票平均", "树模型", "大幅降低方差"],
                    ["数据增强", "人为扩展训练集", "图像/文本", "降低方差, 提升泛化"],
                    ["Dropout", "随机屏蔽神经元", "神经网络", "防止神经元共适应"],
                ],
            },
            mermaid: `graph TD
    A["确认过拟合"] --> B{"选择方差控制策略"}
    B --> C["L2 正则化"]
    B --> D["L1 正则化"]
    B --> E["随机森林/Bagging"]
    B --> F["数据增强"]
    B --> G["早停 Early Stopping"]
    C --> H["验证曲线确认"]
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I{"验证误差下降?"}
    I -->|是| J["继续使用"]
    I -->|否| K["尝试其他策略"]
    K --> B`,
            tip: "随机森林几乎不需要调参就能获得不错的方差控制效果——它是过拟合问题时的首选工具。",
            warning: "正则化太强会导致欠拟合——降低方差的同时也会增加偏差，需要找到平衡点。",
        },
        {
            title: "7. sklearn 实战：偏差-方差分解可视化",
            body: `理论理解之后，让我们用 scikit-learn 来实际可视化偏差-方差分解的全过程。这将帮助你建立完整的直觉：从数据生成、模型训练、到误差分解的每一步。

scikit-learn 本身没有内置的偏差-方差分解函数（bias_variance_decomp 来自 mlxtend 库），但我们可以用多次重复实验的方式手动实现。核心思路很简单：用不同的训练集子集多次训练同一个模型，观察预测值的平均值（偏差来源）和波动程度（方差来源）。

我们将使用多项式回归作为示例模型，因为它对复杂度的控制非常直观——多项式次数就是复杂度旋钮。通过绘制不同次数下的偏差和方差分量，你可以亲眼看到经典的 U 形验证误差曲线是如何由偏差和方差两个分量合成的。

这个实战不仅能验证理论，更能培养一种思维习惯：每次建模时，都要问自己——当前的主要矛盾是偏差还是方差？答案会直接指向下一步的优化方向。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import warnings
warnings.filterwarnings("ignore")

np.random.seed(42)

# 1. 生成数据
n_samples = 100
x = np.linspace(0, 1, n_samples)
y_true = np.sin(2 * np.pi * x)
noise_std = 0.3
y = y_true + np.random.normal(0, noise_std, n_samples)

# 2. 多次重复实验计算偏差和方差
n_experiments = 200
n_test = 200
x_test = np.linspace(0, 1, n_test)
y_test_true = np.sin(2 * np.pi * x_test)

degrees = [1, 3, 5, 10, 15]
results = {}

for deg in degrees:
    all_preds = np.zeros((n_experiments, n_test))

    for i in range(n_experiments):
        # 每次随机采样训练集
        idx = np.random.choice(n_samples, 30, replace=False)
        x_train, y_train = x[idx], y[idx]

        # 训练多项式模型
        coeffs = np.polyfit(x_train, y_train, deg)
        all_preds[i] = np.polyval(coeffs, x_test)

    # 偏差-方差分解
    avg_pred = all_preds.mean(axis=0)
    bias = np.mean((avg_pred - y_test_true) ** 2)
    variance = np.mean(np.var(all_preds, axis=0))

    results[deg] = {"bias": bias, "variance": variance,
                    "total": bias + variance}

# 3. 打印结果
print("=== 偏差-方差分解结果 ===")
print(f"{'次数':<6} {'偏差':<12} {'方差':<12} {'总误差':<12}")
print("-" * 45)

for deg in degrees:
    r = results[deg]
    marker = ""
    if r["total"] == min(d["total"] for d in results.values()):
        marker = " <-- 最优"
    print(f"{deg:<6} {r['bias']:<12.4f} {r['variance']:<12.4f} {r['total']:<12.4f}{marker}")

print(f"\\n不可约噪声: {noise_std ** 2:.4f}")`,
                },
                {
                    lang: "python",
                    code: `from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_squared_error
import numpy as np
import warnings
warnings.filterwarnings("ignore")

np.random.seed(42)

# 实战：用交叉验证诊断偏差-方差状态
n_samples = 200
x = np.linspace(0, 1, n_samples).reshape(-1, 1)
y = np.sin(2 * np.pi * x.ravel()) + np.random.normal(0, 0.2, n_samples)

X_train, X_test, y_train, y_test = train_test_split(
    x, y, test_size=0.3, random_state=42
)

print("=== 偏差-方差诊断实战 ===")
print(f"{'次数':<6} {'训练R2':<10} {'验证R2':<10} {'差距':<10} {'诊断'}")
print("-" * 50)

for deg in [1, 2, 3, 5, 8, 15]:
    model = make_pipeline(PolynomialFeatures(deg), LinearRegression())
    model.fit(X_train, y_train)

    train_r2 = model.score(X_train, y_train)
    cv_r2 = cross_val_score(model, X_train, y_train, cv=5,
                             scoring="r2").mean()
    gap = train_r2 - cv_r2

    if train_r2 < 0.5:
        diagnosis = "欠拟合"
    elif gap > 0.15:
        diagnosis = "过拟合"
    else:
        diagnosis = "拟合良好"

    print(f"{deg:<6} {train_r2:<10.4f} {cv_r2:<10.4f} {gap:<10.4f} {diagnosis}")

# 最优模型在测试集上的表现
best_deg = 3
final_model = make_pipeline(PolynomialFeatures(best_deg), LinearRegression())
final_model.fit(X_train, y_train)
test_r2 = final_model.score(X_test, y_test)
print(f"\\n最优模型 (deg={best_deg}) 在测试集上: R2 = {test_r2:.4f}")`,
                },
            ],
            table: {
                headers: ["诊断结论", "偏差特征", "方差特征", "下一步行动"],
                rows: [
                    ["欠拟合", "偏差主导误差", "方差较小", "增加模型复杂度/特征工程"],
                    ["过拟合", "偏差较小", "方差主导误差", "正则化/集成/数据增强"],
                    ["拟合良好", "偏差和方差均衡", "差距小", "已达到当前条件下最优"],
                ],
            },
            mermaid: `graph TD
    A["开始建模"] --> B["训练多个候选模型"]
    B --> C["计算训练集得分"]
    B --> D["计算交叉验证得分"]
    C --> E{"训练得分高吗?"}
    D --> F{"验证得分高吗?"}
    E -->|低| G["欠拟合 → 增加复杂度"]
    F -->|低| H["检查偏差-方差差距"]
    E -->|高| H
    H --> I{"差距大吗?"}
    I -->|是| J["过拟合 → 降低方差"]
    I -->|否| K["拟合良好"]
    G --> L["回到步骤 B"]
    J --> L
    K --> M["部署模型"]`,
            tip: "建立一个固定的诊断模板：每次建模都跑一遍偏差-方差分解，形成肌肉记忆。",
            warning: "偏差-方差分解的结果依赖训练集的大小和分布——在不同数据集上得到的数值不可直接比较。",
        },
    ],
};
