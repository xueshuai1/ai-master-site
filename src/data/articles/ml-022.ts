import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-022",
    title: "类别不平衡处理：SMOTE, 代价敏感学习",
    category: "ml",
    tags: ["类别不平衡", "SMOTE", "代价敏感"],
    summary: "从过采样到代价敏感学习，掌握处理不平衡数据的系统方法",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 类别不平衡问题定义与影响",
            body: `类别不平衡是机器学习中最常见也最容易被忽视的问题之一。当训练数据中某一类的样本数量远多于其他类时，模型会倾向于预测多数类，导致少数类的召回率极低。例如在欺诈检测中，欺诈交易可能仅占总量的 0.1%，但漏检的代价远高于误报。类别不平衡的本质不是数量差异本身，而是少数类样本不足以让模型学习到其决策边界。当样本比例超过 10:1 时，传统分类器的性能就会显著下降。不平衡会导致模型在训练集上获得很高的准确率，但这种高准确率是虚假的，因为它完全由多数类主导。解决这一问题需要从数据层面和算法层面同时入手，单一策略往往不足以应对复杂场景。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from sklearn.datasets import make_classification

X, y = make_classification(
    n_samples=10000, n_features=20,
    weights=[0.98, 0.02],  # 2% 正样本
    flip_y=0.05, random_state=42
)
print(f"类别分布: {np.bincount(y)}")  # [9800, 200]
ratio = np.bincount(y)[0] / np.bincount(y)[1]
print(f"不平衡比: {ratio:.1f}:1")  # 49.0:1`
                },
                {
                    lang: "python",
                    code: `from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

clf = RandomForestClassifier(random_state=42)
# 直接训练会偏向多数类
scores = cross_val_score(clf, X, y, cv=5, scoring="accuracy")
print(f"准确率: {scores.mean():.4f}")  # ~0.98，但少数类全错

from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)
clf.fit(X_train, y_train)
print(classification_report(y_test, clf.predict(X_test)))`
                }
            ],
            table: {
                headers: ["场景", "多数类占比", "少数类", "误判代价"],
                rows: [
                    ["欺诈检测", "99.9%", "欺诈交易", "极高"],
                    ["疾病诊断", "95%", "罕见病", "致命"],
                    ["工业缺陷", "98%", "缺陷品", "高"],
                    ["垃圾邮件", "90%", "垃圾邮件", "低"]
                ]
            },
            mermaid: `graph LR
    A["原始数据"] --> B{"检查分布"}
    B -->|平衡| C["直接训练"]
    B -->|不平衡| D["需要处理"]
    D --> E["数据层方法"]
    D --> F["算法层方法"]
    D --> G["集成方法"]`,
            tip: "在探索性分析阶段就计算类别分布比例，不要等到模型表现差才发现问题",
            warning: "准确率在不平衡数据集上是误导性指标，必须看精确率、召回率和 AUC-PR"
        },
        {
            title: "2. 重采样方法：过采样与欠采样",
            body: `重采样是最直观的类别不平衡处理手段，核心思路是通过调整训练集的类别分布来平衡模型学习。欠采样通过减少多数类样本来降低比例，优点是可以减少训练时间和存储开销，缺点是可能丢失多数类的重要信息。随机欠采样简单地随机删除多数类样本，容易导致信息损失。过采样通过复制少数类样本来增加其权重，但简单复制会导致过拟合，因为模型会反复看到完全相同的样本。因此，更智能的过采样方法（如 SMOTE）通过合成新样本而非简单复制来扩充少数类。在实际应用中，过采样通常优于欠采样，因为保留更多信息对模型学习更有利。最佳实践是先将数据集划分为训练集和测试集，然后仅对训练集进行重采样，确保测试集反映真实分布。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.datasets import load_breast_cancer
from imblearn.under_sampling import RandomUnderSampler

X, y = load_breast_cancer(return_X_y=True)
# 人为制造不平衡
y_imbalanced = np.where(y == 0, 0, np.random.choice([0, 1], size=len(y), p=[0.85, 0.15]))
print(f"原始分布: {np.bincount(y_imbalanced)}")

# 随机欠采样
rus = RandomUnderSampler(random_state=42)
X_rus, y_rus = rus.fit_resample(X, y_imbalanced)
print(f"欠采样后: {np.bincount(y_rus)}")  # 两类数量相等`
                },
                {
                    lang: "python",
                    code: `from imblearn.over_sampling import RandomOverSampler

# 随机过采样
ros = RandomOverSampler(random_state=42)
X_ros, y_ros = ros.fit_resample(X, y_imbalanced)
print(f"过采样后: {np.bincount(y_ros)}")

# 关键：先 split 再采样
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_imbalanced, stratify=y_imbalanced, random_state=42
)
# 只对训练集采样
X_train_res, y_train_res = ros.fit_resample(X_train, y_train)
print(f"测试集保持原始: {np.bincount(y_test)}")`
                }
            ],
            table: {
                headers: ["方法", "原理", "优点", "缺点"],
                rows: [
                    ["随机欠采样", "删除多数类", "减少训练时间", "丢失信息"],
                    ["随机过采样", "复制少数类", "保留全部信息", "容易过拟合"],
                    ["SMOTE", "合成新样本", "避免过拟合", "可能引入噪声"],
                    ["Tomek Links", "清理边界样本", "改善决策边界", "效果有限"]
                ]
            },
            mermaid: `graph TD
    A["原始不平衡数据"] --> B{"重采样策略"}
    B --> C["欠采样"]
    B --> D["过采样"]
    C --> C1["随机删除"]
    C --> C2["Tomek Links"]
    C --> C3["NearMiss"]
    D --> D1["随机复制"]
    D --> D2["SMOTE"]
    D --> D3["ADASYN"]`,
            tip: "过采样后务必用交叉验证确认没有过拟合，比较过采样前后的泛化性能",
            warning: "永远不要在测试集上做重采样，测试集必须反映真实世界的类别分布"
        },
        {
            title: "3. SMOTE 及其变种算法",
            body: `SMOTE（Synthetic Minority Over-sampling Technique）是最经典的智能过采样算法。它的核心思想是在少数类样本之间进行线性插值来生成新的合成样本。具体来说，对于每个少数类样本，找到其 K 个最近邻的少数类样本，然后随机选择其中一个邻居，在两点之间的连线上随机生成新样本。这种方法避免了简单复制带来的过拟合问题，因为每个合成样本都是独一无二的。然而，原始 SMOTE 也有局限：它对所有少数类样本一视同仁，包括噪声样本和边界样本，这可能导致合成样本位于重叠区域。Borderline-SMOTE 改进了这一点，它只对位于决策边界附近的少数类样本进行插值，因为边界样本对分类器的学习最为关键。ADASYN 则更进一步，根据样本周围的分布密度自适应地调整合成样本的数量，密度越低的区域生成越多样本，使模型更加关注难以学习的区域。`,
            code: [
                {
                    lang: "python",
                    code: `from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y_imbalanced, stratify=y_imbalanced, random_state=42
)

# 标准 SMOTE
smote = SMOTE(k_neighbors=5, random_state=42)
X_smote, y_smote = smote.fit_resample(X_train, y_train)
print(f"SMOTE 后分布: {np.bincount(y_smote)}")

# 验证合成样本质量
from sklearn.neighbors import NearestNeighbors
nn = NearestNeighbors(n_neighbors=3).fit(X_smote[y_smote == 1])
distances, _ = nn.kneighbors()
print(f"平均合成样本距离: {distances.mean():.4f}")`
                },
                {
                    lang: "python",
                    code: `from imblearn.over_sampling import BorderlineSMOTE, ADASYN

# Borderline-SMOTE: 只对边界样本插值
bsmote = BorderlineSMOTE(
    k_neighbors=5, m_neighbors=10,
    kind="borderline-1", random_state=42
)
X_bsmote, y_bsmote = bsmote.fit_resample(X_train, y_train)
print(f"Borderline-SMOTE: {np.bincount(y_bsmote)}")

# ADASYN: 自适应密度加权合成
adasyn = ADASYN(n_neighbors=5, random_state=42)
X_adasyn, y_adasyn = adasyn.fit_resample(X_train, y_train)
print(f"ADASYN 后分布: {np.bincount(y_adasyn)}")

# ADASYN 生成的样本数与局部密度成反比
print(f"ADASYN 自适应比例: {adasyn.nns_:_.shape[0]} 个样本参与密度计算")`
                }
            ],
            table: {
                headers: ["变体", "策略", "适用场景", "计算开销"],
                rows: [
                    ["SMOTE", "均匀插值", "一般不平衡", "低"],
                    ["Borderline-SMOTE", "边界插值", "类别重叠", "中"],
                    ["ADASYN", "密度加权", "少数类聚集", "中"],
                    ["SMOTE-NC", "支持类别特征", "混合数据类型", "高"]
                ]
            },
            mermaid: `graph LR
    A["少数类样本"] --> B["找 K 近邻"]
    B --> C{"SMOTE 变体"}
    C -->|标准| D["随机选邻居插值"]
    C -->|Borderline| E["边界样本插值"]
    C -->|ADASYN| F["按密度加权生成"]
    D --> G["合成样本"]
    E --> G
    F --> G`,
            tip: "高维数据中使用 SMOTE 前先用 PCA 降维，否则距离度量在稀疏空间中失效",
            warning: "SMOTE 不能处理类别特征，需要使用 SMOTE-NC 变体或先进行编码"
        },
        {
            title: "4. 代价敏感学习",
            body: `代价敏感学习（Cost-Sensitive Learning）从算法层面解决类别不平衡问题，而不是修改数据分布。其核心思想是为不同类别的误分类分配不同的代价权重。在不平衡场景中，将少数类误分为多数类的代价远高于反向错误。通过调整类别权重，模型在优化损失函数时会更加重视少数类的分类正确性。在 scikit-learn 中，大多数分类器都支持 class_weight 参数，可以设置为 "balanced" 自动根据类别频率计算权重，权重公式为 n_samples / (n_classes * np.bincount(y))。代价矩阵是一种更精细的控制方式，可以为每一对类别组合指定不同的误分类代价。例如在医疗诊断中，将癌症患者误诊为健康人的代价（假阴性）可能比将健康人误诊为癌症患者的代价（假阳性）高出一个数量级。代价敏感学习的优势在于不需要修改数据，因此不会引入合成样本的噪声，但缺点是对代价矩阵的设定非常敏感。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression

# 自动平衡权重
clf_lr = LogisticRegression(
    class_weight="balanced", random_state=42, max_iter=1000
)
clf_lr.fit(X_train, y_train)
print(f"自动权重: {clf_lr.class_weight_}")

# 自定义权重
clf_custom = LogisticRegression(
    class_weight={0: 1, 1: 50},  # 少数类权重 50 倍
    random_state=42, max_iter=1000
)
clf_custom.fit(X_train, y_train)
print(f"自定义权重下的召回率: {recall_score(y_test, clf_custom.predict(X_test)):.4f}")`
                },
                {
                    lang: "python",
                    code: `from sklearn.metrics import recall_score, precision_score, fbeta_score

# 比较不同策略
strategies = {
    "baseline": LogisticRegression(random_state=42, max_iter=1000),
    "balanced": LogisticRegression(class_weight="balanced", random_state=42, max_iter=1000),
    "custom_10": LogisticRegression(class_weight={0:1, 1:10}, random_state=42, max_iter=1000),
    "custom_50": LogisticRegression(class_weight={0:1, 1:50}, random_state=42, max_iter=1000),
}

for name, clf in strategies.items():
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    rec = recall_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    f2 = fbeta_score(y_test, y_pred, beta=2)
    print(f"{name:12s} | Recall={rec:.3f} Prec={prec:.3f} F2={f2:.3f}")`
                }
            ],
            table: {
                headers: ["权重策略", "少数类召回率", "精确率", "F2-Score"],
                rows: [
                    ["无权重 (baseline)", "0.150", "0.500", "0.180"],
                    ["balanced 自动", "0.720", "0.350", "0.520"],
                    ["自定义 1:10", "0.800", "0.280", "0.570"],
                    ["自定义 1:50", "0.920", "0.180", "0.580"]
                ]
            },
            mermaid: `graph TD
    A["误分类代价"] --> B["代价矩阵"]
    B --> C["FN 代价 >> FP 代价"]
    C --> D["调整 class_weight"]
    D --> E["模型优化偏向少数类"]
    E --> F["召回率提升"]
    F --> G["精确率可能下降"]
    G --> H["用 F2 权衡"]`,
            tip: "使用 F2-Score 而不是 F1 来评估代价敏感模型，因为 F2 更重视召回率",
            warning: "过高的类别权重会导致模型过度关注少数类，反而降低整体性能"
        },
        {
            title: "5. 集成方法：EasyEnsemble 与 BalanceCascade",
            body: `集成方法将重采样与多个模型的组合结合起来，是目前处理类别不平衡最强大的策略之一。EasyEnsemble 的核心思想是从多数类中多次随机抽样，每次抽取的样本量与少数类相当，然后用每个子集与完整的少数类训练一个基分类器，最终将所有基分类器的预测结果进行集成。这种方法既保留了多数类的全部信息（通过多次抽样覆盖），又保持了每个子分类器的训练效率。BalanceCascade 采用更聪明的策略：它从多数类中抽样训练分类器后，会将正确分类的多数类样本移除，因为分类器已经能够处理这些容易的样本。然后对剩余的困难样本继续抽样训练下一个分类器。这种级联方式使得每个基分类器专注于不同的困难区域。RUSBoost 则是另一种流行的集成方法，它将随机欠采样嵌入到 AdaBoost 的每一轮迭代中，使提升过程天然适应不平衡数据。`,
            code: [
                {
                    lang: "python",
                    code: `from imblearn.ensemble import EasyEnsembleClassifier, BalancedBaggingClassifier

# EasyEnsemble: 多次抽样 + 集成
eec = EasyEnsembleClassifier(
    n_estimators=10,
    sampling_strategy="auto",
    random_state=42
)
eec.fit(X_train, y_train)
y_pred = eec.predict(X_test)
print(f"EasyEnsemble 结果:")
print(f"  Recall: {recall_score(y_test, y_pred):.4f}")
print(f"  Precision: {precision_score(y_test, y_pred):.4f}")

# BalancedBagging: 每个基学习器使用平衡采样
bbc = BalancedBaggingClassifier(
    n_estimators=50,
    sampling_strategy="auto",
    replacement=False,
    random_state=42
)
bbc.fit(X_train, y_train)`
                },
                {
                    lang: "python",
                    code: `from imblearn.ensemble import RUSBoostClassifier
from sklearn.ensemble import GradientBoostingClassifier

# RUSBoost: 欠采样 + AdaBoost
rusboost = RUSBoostClassifier(
    n_estimators=200,
    random_state=42,
    learning_rate=0.1
)
rusboost.fit(X_train, y_train)

# 特征重要性分析（集成方法的优势）
importances = rusboost.feature_importances_
top_features = np.argsort(importances)[-5:]
for feat_idx in top_features:
    print(f"特征 {feat_idx}: {importances[feat_idx]:.4f}")

# 概率校准
from sklearn.calibration import CalibratedClassifierCV
calibrated = CalibratedClassifierCV(rusboost, cv=5, method="isotonic")
calibrated.fit(X_train, y_train)`
                }
            ],
            table: {
                headers: ["集成方法", "原理", "优点", "适用场景"],
                rows: [
                    ["EasyEnsemble", "多次抽样集成", "保留全部信息", "高度不平衡"],
                    ["BalanceCascade", "级联移除易分类", "聚焦困难样本", "中等不平衡"],
                    ["RUSBoost", "欠采样+提升", "迭代优化", "任意不平衡度"],
                    ["BalancedBagging", "平衡子采样装袋", "减少方差", "高维数据"]
                ]
            },
            mermaid: `graph TD
    A["多数类"] --> B["EasyEnsemble"]
    A --> C["BalanceCascade"]
    A --> D["RUSBoost"]
    B --> B1["抽样子集1"]
    B --> B2["抽样子集2"]
    B --> B3["抽样子集N"]
    B1 --> E["基分类器1"]
    B2 --> F["基分类器2"]
    B3 --> G["基分类器N"]
    E --> H["投票集成"]
    F --> H
    G --> H`,
            tip: "集成方法计算开销大，可以先用 SMOTE + 单模型建立基线，再考虑集成",
            warning: "EasyEnsemble 的 n_estimators 过大时训练时间线性增长，建议从 10 开始"
        },
        {
            title: "6. 评估指标选择：AUC-PR, F2, F-beta",
            body: `选择正确的评估指标是处理类别不平衡的关键环节。准确率在不平衡数据集上完全不可靠，一个将所有样本预测为多数类的分类器可以获得 99% 的准确率，却对少数类一无所知。ROC-AUC 虽然比准确率好，但在极度不平衡的数据集上仍然会产生误导，因为大量的真负例（True Negatives）会使曲线看起来很好。AUC-PR（Precision-Recocall Curve 下的面积）是更合适的选择，它只关注精确率和召回率，不受大量负例的影响。当正例非常稀少时，AUC-PR 比 ROC-AUC 更能反映模型的实际性能。F-beta Score 是精确率和召回率的加权调和平均，其中 beta 控制两者的相对重要性。F2（beta=2）赋予召回率更高权重，适合少数类漏检代价高的场景。在实际应用中，应该同时报告 AUC-PR 和 F2-Score，前者评估整体区分能力，后者评估在特定偏好下的综合表现。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.metrics import (
    roc_auc_score, average_precision_score,
    precision_recall_curve, fbeta_score
)

# 获取预测概率
y_proba = clf.predict_proba(X_test)[:, 1]

# ROC-AUC（在不平衡数据上可能误导）
roc_auc = roc_auc_score(y_test, y_proba)
print(f"ROC-AUC: {roc_auc:.4f}")

# AUC-PR（更适合不平衡数据）
ap_score = average_precision_score(y_test, y_proba)
print(f"AUC-PR: {ap_score:.4f}")

# F2-Score（重视召回率）
y_pred = clf.predict(X_test)
f2 = fbeta_score(y_test, y_pred, beta=2)
print(f"F2-Score: {f2:.4f}")`
                },
                {
                    lang: "python",
                    code: `import matplotlib.pyplot as plt

# 绘制 PR 曲线
precision, recall, thresholds = precision_recall_curve(y_test, y_proba)
fig, ax = plt.subplots(figsize=(8, 6))
ax.plot(recall, precision, label=f"AP={ap_score:.3f}", linewidth=2)
ax.set_xlabel("Recall", fontsize=12)
ax.set_ylabel("Precision", fontsize=12)
ax.set_title("Precision-Recall Curve", fontsize=14)
ax.legend()
ax.grid(True, alpha=0.3)
plt.show()

# 选择最佳阈值（最大化 F2）
f2_scores = []
for t in thresholds:
    y_pred_t = (y_proba >= t).astype(int)
    f2_t = fbeta_score(y_test, y_pred_t, beta=2, zero_division=0)
    f2_scores.append(f2_t)

best_threshold = thresholds[np.argmax(f2_scores)]
print(f"最佳阈值 (F2 最大): {best_threshold:.4f}")
print(f"最佳 F2: {max(f2_scores):.4f}")`
                }
            ],
            table: {
                headers: ["指标", "关注点", "不平衡适用性", "阈值敏感"],
                rows: [
                    ["准确率", "整体正确", "不适用", "是"],
                    ["ROC-AUC", "TPR vs FPR", "一般", "否"],
                    ["AUC-PR", "精确率 vs 召回", "非常适合", "否"],
                    ["F2-Score", "召回优先", "非常适合", "是"]
                ]
            },
            mermaid: `graph LR
    A["模型输出"] --> B["概率分数"]
    B --> C["ROC-AUC"]
    B --> D["AUC-PR"]
    B --> E["调整阈值"]
    E --> F["F-beta 评估"]
    D --> G["综合性能"]
    F --> H["最优阈值"]
    G --> I["模型选择"]
    H --> I`,
            tip: "AUC-PR 的基线值是正例比例，如果模型 AUC-PR 接近正例比例，说明模型没有学到有效信息",
            warning: "不要仅用单一指标做决策，至少同时查看 AUC-PR 和 F2-Score"
        },
        {
            title: "7. imbalanced-learn 实战：完整流程",
            body: `imbalanced-learn（imblearn）是处理类别不平衡的标准 Python 库，它与 scikit-learn 无缝集成，提供了从重采样到评估的完整工具链。实战中的最佳实践是构建一个可扩展的 Pipeline，将重采样、特征缩放和分类器组合在一起。Pipeline 确保在交叉验证的每一折中，重采样只在训练折上进行，避免数据泄露。PipelineSampler 是一个关键组件，它确保采样操作在 Pipeline 内部正确执行。除了前面介绍的 SMOTE 和集成方法，imblearn 还提供了 Pipeline 与 cross_val_predict 的配合使用、模型选择（GridSearchCV）等功能。一个完整的流程应该包括：数据探索与可视化、基线模型建立、重采样策略比较、代价敏感模型对比、集成方法测试、最终模型选择与评估。在每个步骤中都要记录关键指标，形成可复现的实验流程。`,
            code: [
                {
                    lang: "python",
                    code: `from imblearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

# 构建完整 Pipeline（避免数据泄露）
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("smote", SMOTE(random_state=42)),
    ("clf", RandomForestClassifier(n_estimators=100, random_state=42))
])

# 交叉验证（Pipeline 确保每折独立采样）
from sklearn.model_selection import cross_validate
from sklearn.metrics import make_scorer

scoring = {
    "ap": "average_precision",
    "recall": "recall",
    "f2": make_scorer(fbeta_score, beta=2)
}
results = cross_validate(pipeline, X, y_imbalanced, cv=5, scoring=scoring)
for metric, scores in results.items():
    if metric.startswith("test_"):
        print(f"{metric}: {scores.mean():.4f} (+/- {scores.std():.4f})")`
                },
                {
                    lang: "python",
                    code: `from imblearn.model_selection import StratifiedShuffleSplit
from sklearn.model_selection import GridSearchCV

# 网格搜索最佳参数
param_grid = {
    "smote__k_neighbors": [3, 5, 7],
    "clf__n_estimators": [50, 100, 200],
    "clf__max_depth": [None, 5, 10],
}

cv = StratifiedShuffleSplit(n_splits=3, random_state=42)
grid = GridSearchCV(
    pipeline, param_grid, cv=cv,
    scoring="average_precision", n_jobs=-1
)
grid.fit(X_train, y_train)
print(f"最佳参数: {grid.best_params_}")
print(f"最佳 AUC-PR: {grid.best_score_:.4f}")

# 最终评估
best_model = grid.best_estimator_
y_proba = best_model.predict_proba(X_test)[:, 1]
print(f"测试集 AUC-PR: {average_precision_score(y_test, y_proba):.4f}")`
                }
            ],
            table: {
                headers: ["Pipeline 步骤", "作用", "可选方案"],
                rows: [
                    ["StandardScaler", "特征标准化", "MinMaxScaler, RobustScaler"],
                    ["SMOTE", "过采样", "BorderlineSMOTE, ADASYN"],
                    ["RandomForest", "分类器", "XGBoost, LightGBM, SVM"],
                    ["CalibratedClassifier", "概率校准", "Platt, Isotonic"]
                ]
            },
            mermaid: `graph TD
    A["原始数据"] --> B["探索性分析"]
    B --> C["建立基线"]
    C --> D{"选择策略"}
    D -->|数据层| E["SMOTE / 重采样"]
    D -->|算法层| F["代价敏感学习"]
    D -->|集成层| G["EasyEnsemble"]
    E --> H["Pipeline 组合"]
    F --> H
    G --> H
    H --> I["网格搜索"]
    I --> J["AUC-PR 评估"]
    J --> K["部署模型"]`,
            tip: "将 imblearn Pipeline 与 Optuna 结合进行超参数优化，比 GridSearchCV 更高效",
            warning: "Pipeline 中的重采样步骤不能在测试集上执行，确保 predict 前没有 fit_resample"
        }
    ],
};
