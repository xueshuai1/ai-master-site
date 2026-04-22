import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-017",
    title: "模型评估与选择：交叉验证、AUC-ROC",
    category: "ml",
    tags: ["模型评估", "交叉验证", "AUC-ROC"],
    summary: "从准确率到 AUC-ROC，掌握模型评估的完整体系",
    date: "2026-04-12",
    readTime: "16 min",
    level: "入门",
    content: [
      {
        title: "1. 训练集/验证集/测试集：为什么要划分数据",
        body: `模型评估的第一步是正确划分数据。将数据集拆分为训练集、验证集和测试集，是防止过拟合、客观评估模型泛化能力的基石。

训练集用于学习模型参数，验证集用于调参和选择模型，测试集用于最终评估——三者职责不可混淆。最经典的划分比例是 60/20/20 或 80/10/10，具体取决于数据总量。当数据量极少时，验证集的牺牲会直接影响调参质量；当数据量极大时，甚至可以不用验证集，直接用训练集的一个子集代替。

关键原则：测试集必须在整个建模过程中"保持纯洁"——不能用于任何参数调整、特征选择或模型比较。一旦测试集参与了决策过程，它就变成了验证集，最终的泛化估计将产生乐观偏差。这就是为什么竞赛中会有"公开排行榜"和"私有排行榜"的区别。

数据划分不是随意切分。如果数据有时间序列特性，必须按时间顺序划分（先前的做训练，后面的做测试），否则会发生"未来信息泄露"。如果数据存在类别不平衡，必须使用分层抽样，确保每个子集的类别比例与原始数据一致。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification

# 生成示例数据
X, y = make_classification(n_samples=1000, n_features=20, 
                            n_informative=15, random_state=42)

# 经典三分法：先分出测试集，再从剩余中分出验证集
X_temp, X_test, y_temp, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.25, random_state=42, stratify=y_temp
)  # 0.25 × 0.8 = 0.2 → 最终 60/20/20

print(f"训练集: {X_train.shape[0]} 样本")
print(f"验证集: {X_val.shape[0]} 样本")
print(f"测试集: {X_test.shape[0]} 样本")`,
          },
          {
            lang: "python",
            code: `import numpy as np
from sklearn.model_selection import train_test_split

# 时间序列数据：必须按时间顺序划分
np.random.seed(42)
n = 1000
dates = np.arange(n)
X = np.random.randn(n, 5)
y = X[:, 0] * 2 + np.random.randn(n) * 0.5

# ❌ 错误做法：随机划分会泄露未来信息
# X_train, X_test = train_test_split(X, y, test_size=0.2)

# ✅ 正确做法：按时间顺序切割
split_idx = int(n * 0.8)
X_train, X_test = X[:split_idx], X[split_idx:]
y_train, y_test = y[:split_idx], y[split_idx:]

print(f"训练集时间范围: 0 ~ {split_idx}")
print(f"测试集时间范围: {split_idx} ~ {n}")
print(f"训练集 MSE 模拟: {np.mean((y_train[:100] - X_train[:100, 0]*2)**2):.4f}")`,
          },
        ],
        table: {
          headers: ["数据子集", "用途", "占比", "使用次数"],
          rows: [
            ["训练集", "学习模型参数", "60%-80%", "每次迭代都使用"],
            ["验证集", "调参、选模型", "10%-20%", "调参过程多次使用"],
            ["测试集", "最终泛化评估", "10%-20%", "仅用一次"],
          ],
        },
        mermaid: `graph LR
    A["原始数据集"] --> B["按 60/20/20 划分"]
    B --> C["训练集 60%"]
    B --> D["验证集 20%"]
    B --> E["测试集 20%"]
    C --> F["训练模型"]
    F --> G["在验证集上调参"]
    G --> H["选择最佳模型"]
    H --> I["在测试集上最终评估"]
    style E fill:#7f1d1d
    I -.->|不可回流| G`,
        tip: "数据量较小时（< 1000 样本），优先考虑交叉验证而不是固定划分，以充分利用有限数据。",
        warning: "测试集一旦使用过就不能再用于调参，否则评估结果会产生乐观偏差。",
      },
      {
        title: "2. 交叉验证：K 折、分层与留一法",
        body: `当数据量不足以支撑独立的验证集时，交叉验证（Cross-Validation）成为模型评估的黄金标准。其核心思想是：让每个样本都有机会既做训练又做验证，从而充分利用每一行数据。

K 折交叉验证将数据随机分为 K 份（通常 K=5 或 10），依次取其中一份做验证、其余 K-1 份做训练，最终取 K 次评估结果的平均值。K=10 是最常用的选择，它在偏差和方差之间取得了良好平衡。

分层交叉验证（Stratified CV）是 K 折的改进版——在分类任务中，它确保每一折中各类别比例与原始数据一致。这对类别不平衡问题尤为关键，否则某些折中可能出现少数类样本过少甚至完全缺失的情况。

留一法（Leave-One-Out, LOO）是 K 折的极端情况：K=n，每次只留一个样本做验证。LOO 的偏差最小（训练集几乎等于全量数据），但计算成本极高，且方差较大——因为相邻折的训练集几乎完全相同，导致评估结果高度相关。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.model_selection import (
    KFold, StratifiedKFold, LeaveOneOut, cross_val_score
)
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
import numpy as np

X, y = make_classification(n_samples=500, n_features=10, 
                            n_informative=8, n_classes=3, random_state=42)
model = RandomForestClassifier(n_estimators=50, random_state=42)

# K 折交叉验证
kfold = KFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model, X, y, cv=kfold, scoring="accuracy")
print(f"5 折 CV 准确率: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")

# 分层交叉验证（推荐用于分类）
skfold = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
strat_scores = cross_val_score(model, X, y, cv=skfold, scoring="accuracy")
print(f"分层 5 折 CV 准确率: {strat_scores.mean():.4f} (+/- {strat_scores.std()*2:.4f})")

# 留一法（仅适用于小数据集）
loo = LeaveOneOut()
loo_scores = cross_val_score(model, X[:100], y[:100], cv=loo, scoring="accuracy")
print(f"留一法 CV 准确率: {loo_scores.mean():.4f} (+/- {loo_scores.std()*2:.4f})")`,
          },
          {
            lang: "python",
            code: `from sklearn.model_selection import cross_validate
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
import numpy as np

X, y = make_classification(n_samples=300, n_features=15, random_state=42)
model = LogisticRegression(max_iter=1000, random_state=42)

# cross_validate 返回多个指标，更全面
cv_results = cross_validate(
    model, X, y, cv=5,
    scoring=["accuracy", "f1_macro", "roc_auc"],
    return_train_score=True
)

print("=== 交叉验证结果 ===")
for metric in ["test_accuracy", "test_f1_macro", "test_roc_auc"]:
    scores = cv_results[metric]
    print(f"{metric}: {scores.mean():.4f} (+/- {scores.std()*2:.4f})")

# 对比训练分数和测试分数，检查过拟合
train_acc = cv_results["train_accuracy"].mean()
test_acc = cv_results["test_accuracy"].mean()
print(f"\\n训练集准确率: {train_acc:.4f}")
print(f"验证集准确率: {test_acc:.4f}")
print(f"过拟合程度 (差值): {train_acc - test_acc:.4f}")`,
          },
        ],
        table: {
          headers: ["方法", "折数 K", "偏差", "方差", "计算成本", "适用场景"],
          rows: [
            ["K 折", "5 或 10", "中等", "中等", "低", "通用场景"],
            ["分层 K 折", "5 或 10", "中等", "中等", "低", "分类/类别不平衡"],
            ["留一法 LOO", "n", "最小", "较大", "极高", "小数据集 (<200)"],
            ["重复 K 折", "5-10 × r", "较小", "最小", "中等", "追求稳定性"],
          ],
        },
        mermaid: `graph TD
    A["原始数据集"] --> B["随机打乱"]
    B --> C["分为 K 份"]
    C --> D["第1次: Fold1 做验证"]
    C --> E["第2次: Fold2 做验证"]
    C --> F["..."]
    C --> G["第K次: FoldK 做验证"]
    D --> H["Score1"]
    E --> I["Score2"]
    F --> J["..."]
    G --> K["ScoreK"]
    H --> L["平均得分"]
    I --> L
    J --> L
    K --> L
    L --> M["最终评估结果"]`,
        tip: "实际项目中推荐 StratifiedKFold(n_splits=5) 作为默认选择——兼顾效率和准确性。",
        warning: "交叉验证前一定要先打乱数据（shuffle=True），否则有序数据会导致每折分布不均匀。",
      },
      {
        title: "3. 分类指标：精确率、召回率与 F1 分数",
        body: `准确率（Accuracy）是最直观的分类指标，但在类别不平衡时极具欺骗性——一个将 99% 的样本都预测为多数类的分类器，准确率可达 99%，却毫无实用价值。

精确率（Precision）回答的问题是：在所有被模型预测为正类的样本中，有多少是真的正类？召回率（Recall）回答的是：在所有真实正类中，模型找出了多少？两者往往此消彼长——提高阈值会增加精确率但降低召回率，降低阈值则相反。

F1 分数是精确率和召回率的调和平均数：F1 = 2 × Precision × Recall / (Precision + Recall)。选择调和平均而非算术平均的原因是：调和平均对极端值更敏感——当精确率和召回率差距悬殊时，F1 会显著降低，这正符合我们的期望：一个"偏科"的分类器不应该得到高分。

根据业务场景不同，我们还可以使用 Fβ 分数来调整权重。当假阴性代价更高时（如疾病筛查），选择 F2 更重视召回率；当假阳性代价更高时（如垃圾邮件过滤），选择 F0.5 更重视精确率。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.metrics import (
    precision_score, recall_score, f1_score, fbeta_score,
    classification_report, confusion_matrix
)
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np

# 创建类别不平衡数据集（正类仅 10%）
X, y = make_classification(n_samples=1000, n_features=10, 
                            weights=[0.9, 0.1], random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

# 完整分类报告
print(classification_report(y_test, y_pred, target_names=["负类", "正类"]))

# Fβ 分数：更重视召回率（医疗场景）
f2 = fbeta_score(y_test, y_pred, beta=2.0)
print(f"F2 分数（重视召回率）: {f2:.4f}")

# Fβ 分数：更重视精确率（垃圾邮件场景）
f05 = fbeta_score(y_test, y_pred, beta=0.5)
print(f"F0.5 分数（重视精确率）: {f05:.4f}")`,
          },
          {
            lang: "python",
            code: `from sklearn.metrics import precision_recall_curve
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np

# 获取预测概率而非类别标签
X, y = make_classification(n_samples=1000, n_features=10,
                            weights=[0.8, 0.2], random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

model = GradientBoostingClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
y_prob = model.predict_proba(X_test)[:, 1]

# 精确率-召回率曲线数据
precisions, recalls, thresholds = precision_recall_curve(y_test, y_prob)

# 寻找最佳阈值（F1 最大化）
f1_scores = 2 * (precisions * recalls) / (precisions + recalls + 1e-10)
best_idx = np.argmax(f1_scores)
best_threshold = thresholds[best_idx] if best_idx < len(thresholds) else 0.5

print(f"最佳阈值: {best_threshold:.4f}")
print(f"对应精确率: {precisions[best_idx]:.4f}")
print(f"对应召回率: {recalls[best_idx]:.4f}")
print(f"最佳 F1: {f1_scores[best_idx]:.4f}")

# 不同阈值下的指标对比
for t in [0.3, 0.5, 0.7]:
    y_pred_t = (y_prob >= t).astype(int)
    p = precision_score(y_test, y_pred_t, zero_division=0)
    r = recall_score(y_test, y_pred_t, zero_division=0)
    print(f"阈值 {t}: Precision={p:.3f}, Recall={r:.3f}")`,
          },
        ],
        table: {
          headers: ["指标", "公式", "关注点", "适用场景"],
          rows: [
            ["精确率", "TP/(TP+FP)", "预测为正的准确性", "垃圾邮件、误报成本高"],
            ["召回率", "TP/(TP+FN)", "正类的覆盖率", "疾病筛查、漏报成本高"],
            ["F1 分数", "2PR/(P+R)", "精确率与召回率平衡", "类别不平衡通用评估"],
            ["Fβ 分数", "(1+β²)PR/(β²P+R)", "可调节权重的平衡", "根据业务需求定制"],
          ],
        },
        mermaid: `graph LR
    A["预测为正类"] --> B{"真实标签?"}
    B -->|是正类| C["TP 真正例"]
    B -->|是负类| D["FP 假正例"]
    E["真实正类"] --> F{"模型预测?"}
    F -->|预测为正| C
    F -->|预测为负| G["FN 假负例"]
    C --> H["Precision = TP/(TP+FP)"]
    C --> I["Recall = TP/(TP+FN)"]
    D --> H
    G --> I
    H --> J["F1 = 2PR/(P+R)"]
    I --> J`,
        tip: "类别不平衡时永远不要只看准确率——精确率和召回率才能反映模型的真实表现。",
        warning: "F1 分数对精确率和召回率同等重视，但很多业务场景中两者代价不同，应使用 Fβ 调整权重。",
      },
      {
        title: "4. AUC-ROC：超越单一阈值的评估能力",
        body: `AUC-ROC（Area Under the Receiver Operating Characteristic Curve）是二分类任务中最全面的评估指标之一。它的核心优势在于：不依赖特定分类阈值，而是评估模型在所有可能阈值下的整体表现。

ROC 曲线以假正率（FPR = FP/(FP+TN)）为横轴、真正率（TPR = Recall）为纵轴，描绘了当阈值从最高降到最低时，模型在"捕捉正类"和"误判负类"之间的权衡过程。一条随机猜测的模型的 ROC 曲线是对角线（AUC=0.5），完美分类器的 ROC 曲线经过左上角（AUC=1.0）。

AUC 的物理含义非常优雅：它等于随机选取一个正类样本和一个负类样本时，模型给正类样本打分高于负类样本的概率。AUC=0.85 意味着模型有 85% 的概率将正类排在负类前面。这个解释让 AUC 变得直观且不受类别分布影响。

在极端不平衡的场景中（如欺诈检测），ROC 曲线可能过于乐观，因为大量负类样本使得 FPR 变化缓慢。此时 PR 曲线（Precision-Recall 曲线）是更好的选择，它直接关注正类的表现，对少数类的变化更加敏感。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.metrics import roc_curve, auc, roc_auc_score
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np

# 生成数据
X, y = make_classification(n_samples=2000, n_features=15,
                            weights=[0.7, 0.3], random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

model = GradientBoostingClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
y_prob = model.predict_proba(X_test)[:, 1]

# 计算 ROC 曲线和 AUC
fpr, tpr, thresholds = roc_curve(y_test, y_prob)
roc_auc = auc(fpr, tpr)

print(f"AUC-ROC: {roc_auc:.4f}")
print(f"AUC 解读: 模型有 {roc_auc*100:.1f}% 的概率将正类排在负类前面")

# 不同 FPR 下对应的 TPR
for fpr_target in [0.01, 0.05, 0.10]:
    idx = np.argmin(np.abs(fpr - fpr_target))
    print(f"FPR={fpr_target:.2f} 时, TPR={tpr[idx]:.4f}, 阈值={thresholds[idx]:.4f}")`,
          },
          {
            lang: "python",
            code: `from sklearn.metrics import roc_auc_score, average_precision_score
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification
import numpy as np

# 极端不平衡数据（正类仅 2%）
X, y = make_classification(n_samples=5000, n_features=20,
                            weights=[0.98, 0.02], random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

models = {
    "逻辑回归": LogisticRegression(max_iter=1000, random_state=42),
    "朴素贝叶斯": GaussianNB(),
    "随机森林": RandomForestClassifier(n_estimators=100, random_state=42),
}

print("=== 模型对比 (AUC-ROC vs AUC-PR) ===")
print(f"{'模型':<15} {'AUC-ROC':<12} {'AUC-PR':<12}")
print("-" * 40)

for name, model in models.items():
    model.fit(X_train, y_train)
    y_prob = model.predict_proba(X_test)[:, 1]
    roc_auc = roc_auc_score(y_test, y_prob)
    pr_auc = average_precision_score(y_test, y_prob)
    print(f"{name:<12} {roc_auc:<12.4f} {pr_auc:<12.4f}")

print("\\n注意: AUC-PR 基线 = 正类比例 = 0.02")
print("AUC-ROC 基线始终 = 0.5, 而 AUC-PR 基线随类别比例变化")`,
          },
        ],
        table: {
          headers: ["指标", "取值范围", "基线值", "类别不平衡敏感性", "解读"],
          rows: [
            ["AUC-ROC", "[0, 1]", "0.5", "不敏感", "整体排序能力"],
            ["AUC-PR", "[0, 1]", "正类比例", "敏感", "正类识别能力"],
            ["准确率", "[0, 1]", "多数类比例", "高度敏感", "整体正确率"],
            ["F1 分数", "[0, 1]", "无固定基线", "中等敏感", "精确-召回平衡"],
          ],
        },
        mermaid: `graph TD
    A["分类器输出概率"] --> B["遍历所有阈值"]
    B --> C["每个阈值计算 TPR 和 FPR"]
    C --> D["绘制 ROC 曲线"]
    D --> E["计算曲线下面积 AUC"]
    E --> F{"AUC 值判断"}
    F -->|0.9-1.0| G["优秀"]
    F -->|0.8-0.9| H["良好"]
    F -->|0.7-0.8| I["一般"]
    F -->|0.5-0.7| J["较差"]
    F -->|0.5| K["随机猜测"]`,
        tip: "AUC-ROC 是模型排序能力的度量——即使概率值不够校准，只要排序正确，AUC 依然很高。",
        warning: "在极端不平衡数据中（正类 < 5%），AUC-ROC 可能误导，应同时查看 AUC-PR。",
      },
      {
        title: "5. 回归指标：MSE、MAE 与 R² 评分",
        body: `回归任务的评估指标体系与分类任务截然不同。回归模型输出连续值，我们需要衡量预测值与真实值之间的"距离"。最常用的三个指标是 MSE、MAE 和 R²，它们从不同角度刻画模型的预测质量。

均方误差（MSE）是最经典的回归指标，它对大误差给予平方级惩罚，因此对异常值非常敏感。均方根误差（RMSE）是 MSE 的平方根，好处是量纲与目标变量一致，更容易解释——RMSE=5 意味着预测值平均偏离真实值约 5 个单位。

平均绝对误差（MAE）对所有误差一视同仁，对异常值鲁棒，但不可导的特性使其不适合作为优化目标。R² 决定系数则提供了一个相对评估：它衡量模型相比"直接用均值预测"这个最朴素的基线，解释了多少方差。R²=0.85 意味着模型解释了 85% 的目标变量方差。

三个指标的选用原则：如果异常值代表重要信号（如金融风控中的极端亏损），选 MSE；如果异常值是噪声，选 MAE；如果需要直观的可解释性和跨数据集比较，选 R²。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    mean_absolute_percentage_error
)
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
import numpy as np

# 生成回归数据（含异常值）
X, y = make_regression(n_samples=500, n_features=10, noise=10, random_state=42)
# 注入异常值
y[::50] += np.random.RandomState(42).randn(10) * 100

X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

model = GradientBoostingRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

# 计算所有回归指标
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
mape = mean_absolute_percentage_error(y_test, y_pred)

print(f"MSE:  {mse:.2f}")
print(f"RMSE: {rmse:.2f}")
print(f"MAE:  {mae:.2f}")
print(f"R²:   {r2:.4f}")
print(f"MAPE: {mape*100:.2f}%")`,
          },
          {
            lang: "python",
            code: `from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.linear_model import Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score
from sklearn.datasets import fetch_california_housing
import numpy as np

# 加载真实数据集
data = fetch_california_housing()
X, y = data.data, data.target

models = {
    "岭回归": Ridge(alpha=1.0),
    "Lasso": Lasso(alpha=0.1),
    "随机森林": RandomForestRegressor(n_estimators=50, random_state=42),
}

print("=== 回归模型对比（5 折交叉验证）===")
print(f"{'模型':<15} {'MSE':<15} {'MAE':<15} {'R²':<10}")
print("-" * 55)

for name, model in models.items():
    neg_mse = cross_val_score(model, X, y, cv=5, 
                               scoring="neg_mean_squared_error")
    neg_mae = cross_val_score(model, X, y, cv=5,
                               scoring="neg_mean_absolute_error")
    r2 = cross_val_score(model, X, y, cv=5, scoring="r2")
    
    print(f"{name:<12} {(-neg_mse.mean()):<15.4f} "
          f"{(-neg_mae.mean()):<15.4f} {r2.mean():<10.4f}")

# 朴素基线：永远预测均值
baseline_mse = np.var(y)
print(f"\\n基线 MSE (预测均值): {baseline_mse:.4f}")
print(f"基线 R²: 0.0000（定义）")`,
          },
        ],
        table: {
          headers: ["指标", "公式", "量纲", "异常值敏感性", "适用场景"],
          rows: [
            ["MSE", "(1/n)Σ(y-ŷ)²", "平方单位", "高", "大误差需重点惩罚"],
            ["RMSE", "√MSE", "与原数据相同", "高", "需要可解释的误差值"],
            ["MAE", "(1/n)Σ|y-ŷ|", "与原数据相同", "低", "数据含噪声/异常值"],
            ["R²", "1-SS_res/SS_tot", "无量纲 [0,1]", "中", "跨数据集比较"],
          ],
        },
        mermaid: `graph LR
    A["真实值 y"] --> C["残差 = y - ŷ"]
    B["预测值 ŷ"] --> C
    C --> D["MSE = 均值(残差²)"]
    C --> E["MAE = 均值(|残差|)"]
    D --> F["RMSE = √MSE"]
    D --> G["R² = 1 - SS_res/SS_tot"]
    E --> H["MAPE = 均值(|残差/y|)"]
    F --> I["报告最终结果"]
    G --> I
    H --> I`,
        tip: "R² 可能为负——当模型比直接用均值预测还差时，说明模型完全没有学到有用的信息。",
        warning: "MSE 对异常值极其敏感——一个极端值可能主导整个损失，训练前务必做异常值检测。",
      },
      {
        title: "6. 混淆矩阵与阈值选择：从概率到决策",
        body: `混淆矩阵是理解分类器行为的最佳起点。它将预测结果与真实标签交叉排列成矩阵，四个格子清晰展示了 TP、FP、TN、FN 的数量分布。通过混淆矩阵，你可以一眼看出模型在哪里犯错——是把正类误判为负类，还是把负类误判为正类。

分类器本质上输出的是概率值（0 到 1 之间的连续值），而非直接的类别标签。默认情况下，sklearn 使用 0.5 作为分类阈值——概率大于 0.5 判为正类，否则判为负类。但 0.5 并不总是最佳选择。

在医疗诊断中，漏诊（假阴性）的代价远高于误诊（假阳性），因此应该降低阈值到 0.3 甚至 0.2，宁可多做一些检查也不能放过任何可疑病例。在反欺诈系统中，误判正常用户为欺诈用户会导致用户体验下降甚至法律纠纷，因此应该提高阈值到 0.7 或 0.8，确保拦截的几乎都是真欺诈。

阈值选择不是纯技术问题，而是业务决策。你需要与领域专家一起量化假阳性和假阴性的实际成本，然后在 ROC 或 PR 曲线上找到使总成本最小的阈值点。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.metrics import (
    confusion_matrix, ConfusionMatrixDisplay, 
    classification_report, matthews_corrcoef
)
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np

# 模拟医疗诊断场景（正类 = 患病）
X, y = make_classification(n_samples=1000, n_features=10,
                            weights=[0.85, 0.15], random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 获取混淆矩阵
y_pred = model.predict(X_test)
cm = confusion_matrix(y_test, y_pred)
print("=== 混淆矩阵 ===")
print(f"              预测负  预测正")
print(f"真实负类  {cm[0][0]:>6}  {cm[0][1]:>6}")
print(f"真实正类  {cm[1][0]:>6}  {cm[1][1]:>6}")

# 计算不同阈值下的混淆矩阵
y_prob = model.predict_proba(X_test)[:, 1]
for threshold in [0.3, 0.5, 0.7]:
    y_pred_t = (y_prob >= threshold).astype(int)
    cm_t = confusion_matrix(y_test, y_pred_t)
    tp, fn = cm_t[1][1], cm_t[1][0]
    fp, tn = cm_t[0][1], cm_t[0][0]
    mcc = matthews_corrcoef(y_test, y_pred_t)
    print(f"\\n阈值 {threshold}: TP={tp}, FN={fn}, FP={fp}, TN={tn}, MCC={mcc:.4f}")`,
          },
          {
            lang: "python",
            code: `from sklearn.metrics import confusion_matrix, roc_curve
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np

# 模拟反欺诈场景（正类 = 欺诈）
X, y = make_classification(n_samples=5000, n_features=15,
                            weights=[0.97, 0.03], random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

model = LogisticRegression(max_iter=1000, random_state=42)
model.fit(X_train, y_train)
y_prob = model.predict_proba(X_test)[:, 1]

# 假设业务成本：误判正常用户损失 ￥50，漏掉欺诈损失 ￥5000
cost_fp = 50    # 假阳性成本
cost_fn = 5000  # 假阴性成本

print("=== 基于业务成本的最优阈值搜索 ===")
print(f"{'阈值':<8} {'TP':<6} {'FP':<6} {'TN':<6} {'FN':<6} {'总成本':<12}")
print("-" * 50)

best_threshold = 0.5
min_total_cost = float("inf")

for threshold in np.arange(0.01, 0.99, 0.01):
    y_pred_t = (y_prob >= threshold).astype(int)
    cm = confusion_matrix(y_test, y_pred_t)
    tn, fp, fn, tp = cm.ravel()
    total_cost = fp * cost_fp + fn * cost_fn
    
    if total_cost < min_total_cost:
        min_total_cost = total_cost
        best_threshold = threshold
        best_cm = (tn, fp, fn, tp)
    
    if threshold in [0.1, 0.3, 0.5, 0.7, 0.9]:
        print(f"{threshold:<8.2f} {tp:<6} {fp:<6} {tn:<6} {fn:<6} ￥{total_cost:<11,.0f}")

print(f"\\n最优阈值: {best_threshold:.2f}")
print(f"最低总成本: ￥{min_total_cost:,.0f}")
print(f"对应混淆矩阵: TN={best_cm[0]}, FP={best_cm[1]}, FN={best_cm[2]}, TP={best_cm[3]}")`,
          },
        ],
        table: {
          headers: ["业务场景", "假阳性成本", "假阴性成本", "推荐阈值", "关注指标"],
          rows: [
            ["医疗诊断", "中（误诊检查）", "极高（漏诊致死）", "0.2-0.3", "召回率优先"],
            ["垃圾邮件", "高（误删重要邮件）", "中（漏过垃圾）", "0.6-0.8", "精确率优先"],
            ["反欺诈", "高（误判正常用户）", "极高（漏过欺诈）", "0.5-0.7", "F1/成本最优"],
            ["推荐系统", "低（多推荐内容）", "低（少推荐内容）", "0.5", "AUC-ROC"],
          ],
        },
        mermaid: `graph TD
    A["模型输出概率"] --> B{"选择阈值 t"}
    B -->|p ≥ t| C["预测正类"]
    B -->|p < t| D["预测负类"]
    C --> E{"真实标签?"}
    D --> F{"真实标签?"}
    E -->|正类| G["TP ✓"]
    E -->|负类| H["FP ✗"]
    F -->|正类| I["FN ✗"]
    F -->|负类| J["TN ✓"]
    G --> K["计算业务成本"]
    H --> K
    I --> K
    J --> K
    K --> L["遍历 t 找最小成本"]`,
        tip: "在业务场景中，MCC（Matthews 相关系数）是衡量二分类质量的单一指标，在类别不平衡时比 F1 更可靠。",
        warning: "不要盲目使用 0.5 作为默认阈值——它是统计学上的分界点，但不一定是业务上的最优选择。",
      },
      {
        title: "7. 学习曲线与验证曲线：诊断模型状态",
        body: `学习曲线和验证曲线是诊断模型问题的两大核心工具。它们帮你回答两个关键问题：模型是欠拟合还是过拟合？增加数据量或调整超参数能否带来提升？

学习曲线展示了模型在不同训练集大小下的表现。横轴是训练样本数量，纵轴是评估分数。通常绘制两条线：训练集得分和验证集得分。如果两条线都偏低且接近——欠拟合，需要更复杂的模型或更好的特征。如果训练集得分高但验证集得分低，且两者之间存在明显差距——过拟合，需要更多数据、正则化或简化模型。

验证曲线则关注单一超参数变化对模型性能的影响。它可以帮助你找到欠拟合和过拟合之间的甜蜜点——比如决策树的最大深度、正则化强度、神经网络层数等。

一个实用的策略是：先看学习曲线判断偏差-方差状态，再用验证曲线调整对应超参数，最后用交叉验证确认结果。这套组合拳比盲目调参高效得多。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.model_selection import learning_curve
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import make_classification
import numpy as np
import warnings
warnings.filterwarnings("ignore")

# 生成数据
X, y = make_classification(n_samples=1000, n_features=15,
                            n_informative=10, random_state=42)

model = GradientBoostingClassifier(n_estimators=50, random_state=42)

# 计算学习曲线
train_sizes, train_scores, val_scores = learning_curve(
    model, X, y, cv=5,
    train_sizes=np.linspace(0.1, 1.0, 10),
    scoring="accuracy", n_jobs=-1
)

train_mean = train_scores.mean(axis=1)
train_std = train_scores.std(axis=1)
val_mean = val_scores.mean(axis=1)
val_std = val_scores.std(axis=1)

print("=== 学习曲线 ===")
print(f"{'样本数':<10} {'训练得分':<15} {'验证得分':<15} {'差距':<10}")
print("-" * 50)

for i, size in enumerate(train_sizes):
    gap = train_mean[i] - val_mean[i]
    print(f"{int(size):<10} {train_mean[i]:<15.4f} {val_mean[i]:<15.4f} {gap:<10.4f}")

# 诊断
final_gap = train_mean[-1] - val_mean[-1]
final_val = val_mean[-1]
if final_val < 0.7:
    print(f"\\n诊断: 欠拟合（验证得分 {final_val:.2f} 偏低）")
    print("建议: 使用更复杂模型、增加特征、减少正则化")
elif final_gap > 0.1:
    print(f"\\n诊断: 过拟合（训练-验证差距 {final_gap:.2f} 较大）")
    print("建议: 增加训练数据、增强正则化、减少模型复杂度")
else:
    print(f"\\n诊断: 拟合良好（差距 {final_gap:.2f} 较小，验证得分 {final_val:.2f}）")`,
          },
          {
            lang: "python",
            code: `from sklearn.model_selection import validation_curve
from sklearn.svm import SVC
from sklearn.datasets import make_classification
import numpy as np
import warnings
warnings.filterwarnings("ignore")

X, y = make_classification(n_samples=500, n_features=10, random_state=42)

# 验证曲线：探索 SVM 正则化参数 C 的影响
param_range = np.logspace(-3, 3, 7)
train_scores, val_scores = validation_curve(
    SVC(kernel="rbf", random_state=42), X, y,
    param_name="C", param_range=param_range,
    cv=5, scoring="accuracy", n_jobs=-1
)

train_mean = train_scores.mean(axis=1)
val_mean = val_scores.mean(axis=1)

print("=== 验证曲线（SVM 参数 C）===")
print(f"{'C 值':<12} {'训练得分':<15} {'验证得分':<15} {'过拟合':<10}")
print("-" * 55)

best_c = param_range[np.argmax(val_mean)]

for i, c in enumerate(param_range):
    gap = train_mean[i] - val_mean[i]
    flag = "⚠ 过拟合" if gap > 0.1 else "✓ 正常"
    print(f"{c:<12.4f} {train_mean[i]:<15.4f} {val_mean[i]:<15.4f} {flag:<10}")

print(f"\\n最优 C 值: {best_c:.4f}")
print(f"最优验证得分: {val_mean.max():.4f}")

# 用最优参数重新训练
model = SVC(C=best_c, kernel="rbf", random_state=42)
model.fit(X, y)
print(f"模型已用最优参数 C={best_c:.4f} 重新训练")`,
          },
        ],
        table: {
          headers: ["诊断信号", "训练得分", "验证得分", "差距", "解决方案"],
          rows: [
            ["欠拟合", "低 (<0.7)", "低", "小", "更复杂模型/更多特征"],
            ["过拟合", "高 (>0.9)", "低", "大", "更多数据/正则化/简化"],
            ["拟合良好", "高", "高", "小", "模型已接近最优"],
            ["高方差", "很高", "中等", "很大", "强正则化/集成方法"],
          ],
        },
        mermaid: `graph TD
    A["训练模型"] --> B{"学习曲线分析"}
    B -->|训练低, 验证低| C["欠拟合"]
    B -->|训练高, 验证低| D["过拟合"]
    B -->|训练高, 验证高| E["拟合良好"]
    C --> F["增加模型复杂度"]
    C --> G["增加特征工程"]
    D --> H["增加训练数据"]
    D --> I["增强正则化"]
    D --> J["减少模型复杂度"]
    E --> K["模型已达上限"]
    F --> L["验证曲线调参"]
    G --> L
    H --> L
    I --> L
    J --> L
    L --> M["交叉验证确认"]`,
        tip: "先画学习曲线判断偏差/方差状态，再做针对性优化——这比随机搜索超参数效率高一个数量级。",
        warning: "学习曲线中如果增加数据量后验证得分不再提升，说明模型容量已达上限，需要换更复杂的模型。",
      },
    ],
};
