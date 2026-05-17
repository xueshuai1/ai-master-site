import { Article } from '../knowledge';

export const article: Article = {
    id: "ethics-002",
    title: "模型可解释性",
    category: "ethics",
    tags: ["可解释性", "SHAP", "LIME"],
    summary: "从特征重要性到 SHAP 值，理解模型如何做决策",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
      {
        title: "1. 为什么需要可解释性",
        body: `模型可解释性（Interpretability）回答的是一个朴素但核心的问题：这个模型为什么做出这个预测？对于线性回归或决策树等简单模型，我们可以直接阅读参数或规则来理解其决策逻辑。但对于随机森林、梯度提升树和深度神经网络等复杂模型，它们的决策过程如同一个黑箱——输入数据进去，预测结果出来，中间发生了什么却无从知晓。

可解释性的第一个驱动力来自合规要求。欧盟 GDPR 第 22 条赋予用户 "获得解释的权利"——当自动化决策对个人产生重大影响时，用户有权了解决策的依据。在医疗诊断、信贷审批和司法判决等高风险领域，监管机构越来越要求模型提供方解释其预测逻辑，而不能简单地以 "这是算法的决定" 作为回应。

第二个驱动力是调试和改进。一个不可解释的模型出了问题时，你很难定位根因。是可训练数据中存在泄露？是某个特征被模型过度依赖？还是模型学习到了虚假的相关性？可解释性工具帮助我们打开黑箱，发现这些隐藏的问题。

第三个驱动力是建立信任。即使模型准确率很高，如果用户和利益相关者不理解它如何做决策，就很难在实际业务中采纳它。可解释性是 AI 系统从实验室走向生产环境的桥梁。`,
        code: [
          {
            lang: "python",
            code: `# 对比可解释模型和黑箱模型的决策透明度
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

# 线性模型：可以直接查看权重
lr = LogisticRegression()
lr.fit(X_train, y_train)
for feat, coef in zip(feature_names, lr.coef_[0]):
    print(f"  {feat}: {coef:+.4f}")

# 随机森林：无法直接读取规则
rf = RandomForestClassifier(n_estimators=100)
rf.fit(X_train, y_train)
print(f"  树数量: {rf.n_estimators}, 最大深度: {rf.max_depth_}")
print("  无法直接理解单棵树的决策规则")`
          },
          {
            lang: "python",
            code: `# 评估模型可解释性需求的决策框架
def assess_explainability_need(domain, impact_level, stakeholder):
    """评估场景对可解释性的需求等级"""
    risk_matrix = {
        "medical": {"high": "必须", "medium": "必须", "low": "推荐"},
        "finance": {"high": "必须", "medium": "推荐", "low": "可选"},
        "marketing": {"high": "推荐", "medium": "可选", "low": "可选"},
        "judicial": {"high": "必须", "medium": "必须", "low": "必须"},
    }
    need = risk_matrix.get(domain, {}).get(impact_level, "可选")
    print(f"领域: {domain}, 影响级别: {impact_level}")
    print(f"利益相关者: {stakeholder}")
    print(f"可解释性需求: {need}")
    return need

assess_explainability_need("medical", "high", "患者和医生")`
          }
        ],
        table: {
          headers: ["驱动因素", "具体原因", "典型场景", "解决方案"],
          rows: [
            ["合规要求", "GDPR 解释权, 行业监管", "信贷审批, 医疗诊断", "使用可解释模型或事后解释"],
            ["调试改进", "发现数据泄露, 识别虚假相关", "模型开发阶段", "特征重要性, 依赖图"],
            ["建立信任", "用户采纳, 利益相关者沟通", "所有生产环境", "可视化解释, 自然语言解释"],
            ["伦理审计", "检测偏见, 验证公平性", "司法, 招聘", "SHAP 公平性分析"],
          ]
        },
        mermaid: `graph TD
    A["黑箱模型"] --> B{"需要可解释性?"}
    B -->|"合规要求"| C["必须解释"]
    B -->|"调试需要"| D["推荐解释"]
    B -->|"内部实验"| E["可选解释"]
    C --> F["选择解释方法"]
    D --> F
    E --> G["直接部署"]
    F --> H["全局解释"]
    F --> I["局部解释"]
    H --> J["特征重要性/PDP"]
    I --> K["LIME/SHAP"]`,
        tip: "建议在项目初期就评估可解释性需求等级，而不是等模型开发完成后再补救。选择解释方法的决策应该在模型选择阶段就确定下来。",
        warning: "陷阱：可解释性和模型性能往往存在权衡。不要为了满足可解释性要求而过度牺牲性能，也不要为了追求性能而完全放弃可解释性——找到合适的平衡点才是关键。"
      },
      {
        title: "2. 全局解释 vs 局部解释",
        body: `可解释性方法可以按照解释的范围分为两大类：全局解释和局部解释。理解这两者的区别和互补关系，是选择合适解释方法的前提。

全局解释（Global Interpretability）回答的问题是：模型整体上是如何做决策的？它试图揭示模型对所有输入的通用决策规则。例如，"收入" 特征在信用评分模型中总体上是正向影响还是负向影响？全局解释给出的是宏观视角，帮助我们理解模型学到的整体模式。

局部解释（Local Interpretability）回答的问题是：模型为什么对这个特定样本做出这个预测？它关注单个预测的决策依据。例如，为什么张三的贷款申请被拒绝？局部解释给出的是微观视角，帮助我们理解模型对个体案例的推理过程。

这两类解释互为补充：全局解释可能掩盖个体层面的异常行为，而局部解释可能无法反映模型的整体趋势。实践中，我们需要同时使用两种解释来获得完整的理解。`,
        code: [
          {
            lang: "python",
            code: `# 全局解释：特征重要性（所有样本的平均贡献）
from sklearn.ensemble import GradientBoostingClassifier
import numpy as np

model = GradientBoostingClassifier(n_estimators=100)
model.fit(X_train, y_train)

# 全局特征重要性
importances = model.feature_importances_
for feat, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
    print(f"  {feat}: {imp:.4f}")

# 这告诉我们哪些特征"总体上"最重要
# 但无法解释对单个样本的预测`
          },
          {
            lang: "python",
            code: `# 局部解释：为什么这个特定样本被预测为正例？
def explain_single_prediction(model, x_instance, feature_names):
    """为单个样本生成本地解释（简化版）"""
    base_pred = model.predict_proba(x_instance.reshape(1, -1))[0][1]
    explanations = []
    for i in range(x_instance.shape[0]):
        x_perturbed = x_instance.copy()
        x_perturbed[i] = np.median(X_train[:, i])
        perturbed_pred = model.predict_proba(x_perturbed.reshape(1, -1))[0][1]
        contribution = base_pred - perturbed_pred
        explanations.append((feature_names[i], contribution))
    explanations.sort(key=lambda x: -abs(x[1]))
    for feat, contrib in explanations[:5]:
        direction = "+" if contrib > 0 else "-"
        print(f"  {direction} {feat}: |{contrib:.4f}|")
    return explanations`
          }
        ],
        table: {
          headers: ["维度", "全局解释", "局部解释", "组合使用"],
          rows: [
            ["解释范围", "模型整体行为", "单个样本预测", "全局趋势 + 个体异常"],
            ["典型方法", "特征重要性, PDP", "LIME, SHAP 单样本", "SHAP summary + force plot"],
            ["适用对象", "数据科学家, 审计人员", "最终用户, 业务人员", "所有利益相关者"],
            ["局限性", "可能掩盖局部模式", "可能不具代表性", "计算成本高"],
          ]
        },
        mermaid: `graph LR
    A["可解释性"] --> B["全局解释"]
    A --> C["局部解释"]
    B --> D["模型整体规则"]
    B --> E["特征全局重要性"]
    C --> F["单样本预测原因"]
    C --> G["个体特征贡献"]
    D --> H["决策树规则提取"]
    E --> I["Permutation Importance"]
    F --> J["LIME"]
    G --> K["SHAP values"]`,
        tip: "建议先用全局解释了解模型的整体行为模式，再用局部解释深入分析感兴趣的个体案例。这种由宏观到微观的分析路径最为高效。",
        warning: "陷阱：全局特征重要性排序可能与局部解释中的特征贡献排序完全不同。一个在全局排名靠后的特征，可能在某个特定样本的预测中起到决定性作用。不要仅依赖全局解释来判断特征价值。"
      },
      {
        title: "3. 特征重要性：置换重要性",
        body: `置换重要性（Permutation Importance）是一种模型无关的全局解释方法，由 Breiman 在 2001 年提出。它的核心思想简洁而优雅：如果打乱某个特征的值后模型性能显著下降，说明这个特征对模型的预测很重要；如果性能几乎不变，说明模型并不依赖这个特征。

与基于树模型的内置特征重要性（基于不纯度减少）不同，置换重要性适用于任何模型——线性模型、神经网络、支持向量机都可以使用。它不依赖模型的内部结构，只关注输入输出关系，因此更加通用和可靠。

置换重要性的一个关键优势是它能够检测冗余特征。当两个特征高度相关时，基于不纯度的方法可能只给其中一个高重要性（因为 splits 被第一特征抢走了），而置换重要性可以通过多次随机置换更公平地评估每个特征的贡献。

不过，置换重要性也有局限性：当特征之间存在强相关性时，随机置换可能产生不现实的数据组合（例如把一个人的身高打乱但保留体重不变），导致重要性估计产生偏差。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.inspection import permutation_importance
from sklearn.ensemble import RandomForestClassifier
import matplotlib.pyplot as plt

# 训练模型
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# 计算置换重要性（在测试集上）
result = permutation_importance(
    model, X_test, y_test,
    n_repeats=30,
    random_state=42,
    scoring="accuracy"
)

# 排序并可视化
sorted_idx = result.importances_mean.argsort()
plt.boxplot(result.importances[sorted_idx].T,
            vert=False, labels=feature_names[sorted_idx])
plt.title("Permutation Importances (test set)")
plt.show()

for feat, imp, std in sorted(
    zip(feature_names, result.importances_mean, result.importances_std),
    key=lambda x: -x[1]
)[:5]:
    print(f"  {feat}: {imp:.4f} (+/- {std:.4f})")`
          },
          {
            lang: "python",
            code: `# 置换重要性 vs 内置重要性：对比分析
from sklearn.inspection import permutation_importance

def compare_importance_methods(model, X_train, y_train, X_test, y_test, names):
    """对比内置特征重要性和置换重要性"""
    if hasattr(model, "feature_importances_"):
        built_in = model.feature_importances_
    else:
        built_in = np.zeros(len(names))
    perm_result = permutation_importance(
        model, X_test, y_test, n_repeats=20, random_state=42
    )
    perm_imp = perm_result.importances_mean
    comparison = pd.DataFrame({
        "内置重要性": built_in,
        "置换重要性": perm_imp,
        "差异": np.abs(built_in - perm_imp)
    }, index=names).sort_values("置换重要性", ascending=False)
    print(comparison.to_string())
    return comparison

compare_importance_methods(rf, X_train, y_train, X_test, y_test, feature_names)`
          }
        ],
        table: {
          headers: ["方法", "适用模型", "计算成本", "处理相关特征", "可靠性"],
          rows: [
            ["内置重要性（不纯度）", "仅树模型", "低", "偏向高基数特征", "中"],
            ["置换重要性", "任何模型", "中（需重复评估）", "更公平", "高"],
            ["SHAP 重要性", "任何模型", "高", "理论基础扎实", "最高"],
            ["系数绝对值", "线性模型", "最低", "受量纲影响大", "低"],
          ]
        },
        mermaid: `graph TD
    A["训练好的模型"] --> B["选择特征 X"]
    B --> C["打乱 X 的值"]
    C --> D["重新评估模型"]
    D --> E["性能下降?"]
    E -->|"大幅下降"| F["X 很重要"]
    E -->|"变化很小"| G["X 不重要"]
    E -->|"性能反而上升"| H["X 引入噪声"]
    F --> I["排序所有特征"]
    G --> I
    H --> I
    I --> J["特征重要性排序"]`,
        tip: "建议在测试集上计算置换重要性，而不是训练集。训练集上的置换重要性可能高估特征贡献，因为模型可能已经过拟合了训练数据。",
        warning: "陷阱：当特征之间存在强共线性时，置换重要性可能低估相关特征的重要性。因为打乱其中一个特征后，模型仍然可以通过另一个相关特征获取信息。此时建议结合 SHAP 值进行交叉验证。"
      },
      {
        title: "4. LIME：局部代理模型",
        body: `LIME（Local Interpretable Model-agnostic Explanations）由 Ribeiro 等人在 2016 年提出，是最著名的局部解释方法之一。LIME 的核心哲学是：虽然复杂模型的全局行为难以理解，但在单个样本的局部邻域内，模型的行为可以用一个简单的可解释模型来近似。

LIME 的工作流程非常直观：对于需要解释的样本，LIME 在其周围生成大量扰动样本（对连续特征加噪声，对离散特征随机替换），然后用原始模型对这些扰动样本进行预测。接下来，LIME 用一个简单的可解释模型（通常是稀疏线性模型）来拟合这些扰动样本的预测结果，同时给距离原始样本更近的扰动样本更高的权重。

最终，这个局部代理模型的参数就是解释——它告诉我们哪些特征对当前预测贡献最大，以及贡献的方向（正向或负向）。LIME 的优势在于它完全模型无关，可以解释任何黑箱模型，并且生成的解释对人类友好。

但 LIME 也有明显局限：解释的稳定性依赖于随机采样的质量，不同次运行可能产生略有不同的解释；另外，局部线性近似在模型行为高度非线性的区域可能不够准确。`,
        code: [
          {
            lang: "python",
            code: `import lime
import lime.lime_tabular
from sklearn.ensemble import RandomForestClassifier

# 训练黑箱模型
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# 创建 LIME 解释器
explainer = lime.lime_tabular.LimeTabularExplainer(
    X_train,
    feature_names=feature_names,
    class_names=["拒绝", "批准"],
    mode="classification",
    discretize_continuous=True
)

# 解释单个样本
idx = 42
explanation = explainer.explain_instance(
    X_test[idx],
    model.predict_proba,
    num_features=5,
    num_samples=5000
)

print(f"样本 {idx} 的预测: {model.predict_proba([X_test[idx]])}")
for feat, contrib in explanation.as_list():
    print(f"  {feat}: {contrib:+.4f}")`
          },
          {
            lang: "python",
            code: `# LIME 解释稳定性分析
def lime_stability_check(explainer, model, x_instance, n_runs=10):
    """检查 LIME 解释的稳定性（多次运行）"""
    all_explanations = []
    for i in range(n_runs):
        exp = explainer.explain_instance(
            x_instance, model.predict_proba,
            num_features=5, num_samples=5000
        )
        all_explanations.append(dict(exp.as_list()))
    all_feats = set()
    for exp in all_explanations:
        all_feats.update(exp.keys())
    for feat in all_feats:
        contributions = [exp.get(feat, 0) for exp in all_explanations]
        mean_c = np.mean(contributions)
        std_c = np.std(contributions)
        stability = "稳定" if std_c < 0.05 else "不稳定"
        print(f"  {feat}: mean={mean_c:+.4f}, std={std_c:.4f} [{stability}]")
    return all_explanations

lime_stability_check(explainer, model, X_test[42])`
          }
        ],
        table: {
          headers: ["参数", "默认值", "作用", "调优建议"],
          rows: [
            ["num_samples", "5000", "扰动样本数量", "越大越稳定，但更慢"],
            ["num_features", "10", "解释中显示的特征数", "5-8 个最适合人类阅读"],
            ["kernel_width", "sqrt(n_features)", "局部邻域宽度", "越小越局部，越大越全局"],
            ["discretize_continuous", "True", "是否离散化连续特征", "离散化后解释更直观"],
          ]
        },
        mermaid: `graph TD
    A["待解释样本 x"] --> B["生成扰动样本"]
    B --> C["用黑箱模型预测"]
    C --> D["计算距离权重"]
    D --> E["拟合稀疏线性模型"]
    E --> F["提取特征权重"]
    F --> G["生成局部解释"]
    B -.->|"加噪声/随机替换"| B
    D -.->|"距离 x 越近权重越高"| D
    E -.->|"Lasso 回归"| E`,
        tip: "建议对关键样本多次运行 LIME 并检查解释的一致性。如果解释在不同运行间波动很大，说明该样本处于模型决策边界附近，解释可信度较低。",
        warning: "陷阱：LIME 的扰动采样可能生成不现实的数据点（例如负年龄、超高温度的体温）。当原始样本位于数据分布的边缘时，扰动样本可能严重偏离真实数据分布，导致解释失效。"
      },
      {
        title: "5. SHAP：Shapley 值解释",
        body: `SHAP（SHapley Additive exPlanations）由 Lundberg 和 Lee 在 2017 年提出，基于博弈论中的 Shapley 值概念。Shapley 值最初用于解决合作博弈中如何公平分配收益的问题——如果把模型预测看作是所有特征合作产生的结果，那么每个特征应该分得多少功劳？

SHAP 的核心公式是：对于每个特征，计算它在所有可能的特征子集中的边际贡献的平均值。具体来说，考虑特征 i 在所有可能的特征组合 S 中的加入效果：f(S 并 i) - f(S)，然后对所有组合取加权平均。这个平均值就是特征 i 的 SHAP 值。

SHAP 相比 LIME 有几个关键优势：一是理论基础坚实，Shapley 值是唯一满足效率、对称性、dummy 和可加性四个公理的分配方案；二是一致性，当模型对某个特征的依赖增强时，SHAP 值也会相应增大；三是可以统一全局和局部解释——单个样本的 SHAP 值提供局部解释，所有样本 SHAP 值的平均提供全局解释。

计算精确 SHAP 值的时间复杂度是 O(2 的 M 次方乘以 T)，其中 M 是特征数量，T 是模型评估时间。对于特征较多的场景，需要使用近似算法（如 TreeSHAP 对树模型的优化、KernelSHAP 对任意模型的采样近似）。`,
        code: [
          {
            lang: "python",
            code: `import shap

# 使用 TreeSHAP（专为树模型优化，精确且快速）
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# 全局摘要图（所有样本所有特征）
shap.summary_plot(shap_values, X_test, feature_names=feature_names)

# 单样本 Force Plot（瀑布图）
shap.force_plot(
    explainer.expected_value[1],
    shap_values[1][0],
    X_test[0],
    feature_names=feature_names
)

# 依赖图：特征值 vs SHAP 值
shap.dependence_plot("income", shap_values[1], X_test,
                     feature_names=feature_names)`
          },
          {
            lang: "python",
            code: `# KernelSHAP：适用于任何模型的 SHAP 近似
# 当没有专用 explainer 时使用（如 SVM、神经网络）

import shap

# 创建 KernelSHAP 解释器
explainer = shap.KernelExplainer(model.predict_proba, X_train[:100])
# background data 使用训练集子集

# 计算 SHAP 值
shap_values = explainer.shap_values(X_test[:5], nsamples=1000)

# 解释单个样本
idx = 0
shap.force_plot(
    explainer.expected_value[1],
    shap_values[1][idx],
    X_test[idx],
    feature_names=feature_names,
    matplotlib=True
)

# shap_values[1] 对应正类的 SHAP 值矩阵
print(f"SHAP values shape: {shap_values[1].shape}")`
          }
        ],
        table: {
          headers: ["Explainer 类型", "适用模型", "精确度", "计算速度", "推荐场景"],
          rows: [
            ["TreeExplainer", "树模型（RF, XGBoost, LightGBM）", "精确", "极快", "树模型首选"],
            ["DeepExplainer", "深度学习（TensorFlow, PyTorch）", "近似", "快", "神经网络"],
            ["KernelExplainer", "任何模型", "近似", "慢", "无专用 Explainer 时"],
            ["LinearExplainer", "线性模型", "精确", "极快", "线性模型"],
            ["PartitionExplainer", "树模型", "精确", "快", "TreeExplainer 替代"],
          ]
        },
        mermaid: `graph TD
    A["所有特征集合"] --> B["遍历所有子集 S"]
    B --> C["计算边际贡献"]
    C --> D["f(S + i) - f(S)"]
    D --> E["加权平均"]
    E --> F["特征 i 的 SHAP 值"]
    F --> G{"对所有特征重复"}
    G --> B
    G -->|"完成"| H["SHAP 值矩阵"]
    H --> I["全局摘要图"]
    H --> J["局部 Force Plot"]
    H --> K["依赖图"]`,
        tip: "对于树模型（随机森林、XGBoost、LightGBM），始终优先使用 TreeExplainer——它计算精确 SHAP 值且速度极快。KernelExplainer 仅在没有专用 Explainer 时使用。",
        warning: "陷阱：KernelExplainer 的计算成本随特征数量指数增长。当特征超过 20 个时，计算时间可能变得不可接受。此时可以考虑减少 background data 样本量或使用采样近似。"
      },
      {
        title: "6. 部分依赖图 PDP 与 ICE",
        body: `部分依赖图（Partial Dependence Plot, PDP）和个体条件期望图（Individual Conditional Expectation, ICE）是两种互补的全局解释工具，用于展示特征与模型预测之间的函数关系。

PDP 的核心思想是：固定某个特征的值，让其他特征保持原样，然后计算模型预测的平均值。通过在特征的不同取值上重复这个过程，我们得到了一条曲线，展示了该特征对模型预测的平均边际效应。PDP 回答的问题是：当特征 X 从低到高变化时，模型预测平均如何变化？

ICE 图是 PDP 的细化版本。与 PDP 不同，ICE 不计算平均值，而是为每个样本单独绘制一条曲线。这样我们可以看到特征效应是否存在个体差异——也许对于大部分样本，收入增加会提高信用评分，但对于某些特定群体，这种效应可能完全相反。

PDP 和 ICE 图特别适合检测非线性关系和阈值效应。例如，你可能会发现某个特征在某个阈值以下对预测几乎没有影响，但超过阈值后影响急剧增大。这种信息对于业务决策非常有价值。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.inspection import PartialDependenceDisplay
import matplotlib.pyplot as plt

# PDP 图：展示单个特征的边际效应
fig, ax = plt.subplots(figsize=(8, 5))
PartialDependenceDisplay.from_estimator(
    model, X_test, features=["income"],
    kind="average",
    ax=ax,
    feature_names=feature_names
)
ax.set_title("Partial Dependence: Income")
plt.show()

# PDP + ICE 组合图
fig, ax = plt.subplots(figsize=(8, 5))
PartialDependenceDisplay.from_estimator(
    model, X_test, features=["income"],
    kind="both",
    ax=ax,
    feature_names=feature_names,
    subsample=50
)
plt.show()`
          },
          {
            lang: "python",
            code: `# 二维 PDP：展示两个特征的交互效应
from sklearn.inspection import PartialDependenceDisplay

features = [("income", "debt_ratio"), ("age", "credit_history")]
fig, ax = plt.subplots(1, 2, figsize=(14, 5))

for i, feat_pair in enumerate(features):
    PartialDependenceDisplay.from_estimator(
        model, X_test,
        features=feat_pair,
        kind="average",
        ax=ax[i],
        feature_names=feature_names,
        grid_resolution=50
    )
    ax[i].set_title(f"2D PDP: {feat_pair[0]} x {feat_pair[1]}")

plt.tight_layout()
plt.show()`
          }
        ],
        table: {
          headers: ["方法", "展示内容", "检测能力", "局限性"],
          rows: [
            ["PDP", "特征的平均边际效应", "非线性关系, 阈值效应", "掩盖个体异质性"],
            ["ICE", "每个样本的条件期望", "个体差异, 交互效应", "曲线重叠时难以阅读"],
            ["PDP + ICE 组合", "平均趋势 + 个体曲线", "全面展示", "计算成本翻倍"],
            ["2D PDP", "两个特征的联合效应", "特征交互", "仅能展示两两交互"],
          ]
        },
        mermaid: `graph TD
    A["选定特征 X"] --> B["在 X 的网格点上遍历"]
    B --> C["对每个网格点 x_j"]
    C --> D["替换所有样本的 X = x_j"]
    D --> E["计算模型预测"]
    E --> F["PDP: 取平均"]
    E --> G["ICE: 保留每条线"]
    F --> H["PDP 曲线"]
    G --> I["ICE 曲线族"]
    H --> J["平均趋势"]
    I --> K["个体差异"]`,
        tip: "建议先用 PDP 了解特征的整体趋势，再用 ICE 检查是否存在显著的个体异质性。如果 ICE 曲线之间存在交叉，说明特征效应因样本而异，此时单独看 PDP 可能产生误导。",
        warning: "陷阱：PDP 假设特征之间相互独立。当特征之间存在强相关性时，PDP 会在不现实的数据点上计算预测。对于相关特征，建议使用累积局部效应图（ALE Plot）作为替代。"
      },
      {
        title: "7. SHAP 与 LIME 实战：模型解释与可视化",
        body: `理论理解之后，我们需要将 SHAP 和 LIME 应用到真实场景中。本节通过一个完整的信用评分案例，展示如何使用这些工具进行模型解释和可视化。

我们使用一个包含收入、负债比、信用历史长度等特征的信用评分数据集，训练一个 XGBoost 分类器，然后用 SHAP 和 LIME 进行全方位解释。SHAP 提供全局和局部的一致性解释，LIME 提供对单个案例的直观理解。两者结合使用，可以获得最全面的模型洞察。

SHAP 的可视化生态非常丰富：summary plot 展示全局特征重要性和方向，force plot 展示单样本预测的推力图，dependence plot 揭示特征值与 SHAP 值的关系，decision plot 展示从基础值到最终预测的完整决策路径。

LIME 的可视化则更侧重于单样本解释的直观呈现：它将特征贡献用绿色（推动预测向正类）和红色（推动预测向负类）的条形图展示，即使是非技术人员也能理解模型为什么做出这个决策。`,
        code: [
          {
            lang: "python",
            code: `import shap
import lime.lime_tabular
import xgboost as xgb

# 1. 训练 XGBoost 模型
model = xgb.XGBClassifier(n_estimators=200, max_depth=5, random_state=42)
model.fit(X_train, y_train)

# 2. SHAP 全局解释
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Summary plot（蜜蜂图）
shap.summary_plot(shap_values, X_test, feature_names=feature_names,
                   plot_type="dot", show=False)

# SHAP 特征重要性排序
shap.summary_plot(shap_values, X_test, feature_names=feature_names,
                   plot_type="bar", show=False)

# 3. LIME 局部解释
lime_explainer = lime.lime_tabular.LimeTabularExplainer(
    X_train, feature_names=feature_names,
    class_names=["拒绝", "批准"], mode="classification"
)
rejected_idx = np.where(model.predict(X_test) == 0)[0][0]
exp = lime_explainer.explain_instance(
    X_test[rejected_idx], model.predict_proba,
    num_features=6, num_samples=5000
)
exp.show_in_notebook()`
          },
          {
            lang: "python",
            code: `# SHAP 高级可视化：决策图和依赖图

# Decision plot：展示从基础值到预测的完整路径
shap.decision_plot(
    explainer.expected_value[1],
    shap_values[1][:10],
    X_test[:10],
    feature_names=feature_names,
    link="logit"
)

# Dependence plot：收入对 SHAP 值的影响
shap.dependence_plot(
    "income", shap_values[1], X_test,
    feature_names=feature_names,
    interaction_index="debt_ratio",
    show=False
)

# 生成解释报告
def generate_explanation_report(model, X_sample, idx):
    shap_val = shap_values[1][idx]
    base_val = explainer.expected_value[1]
    pred = model.predict_proba([X_sample[idx]])[0][1]
    report = f"预测概率: {pred:.2%}\\n"
    report += f"基础值: {base_val:.4f}\\n"
    report += "--- 特征贡献 (SHAP) ---\\n"
    for feat, val in sorted(zip(feature_names, shap_val), key=lambda x: -abs(x[1]))[:5]:
        direction = "+" if val > 0 else "-"
        report += f"  {direction} {feat}: {val:+.4f}\\n"
    return report

print(generate_explanation_report(model, X_test, 0))`
          }
        ],
        table: {
          headers: ["可视化类型", "工具", "解释维度", "适用场景"],
          rows: [
            ["Summary Plot（蜜蜂图）", "SHAP", "全局", "特征重要性和方向"],
            ["Force Plot", "SHAP", "局部", "单样本特征推力"],
            ["Decision Plot", "SHAP", "局部", "多样本决策路径对比"],
            ["Dependence Plot", "SHAP", "全局", "特征值-SHAP 关系"],
            ["LIME 条形图", "LIME", "局部", "单样本直观解释"],
          ]
        },
        mermaid: `graph TD
    A["训练好的模型"] --> B["SHAP 解释"]
    A --> C["LIME 解释"]
    B --> D["全局 Summary Plot"]
    B --> E["局部 Force Plot"]
    B --> F["Dependence Plot"]
    B --> G["Decision Plot"]
    C --> H["LIME 条形图"]
    C --> I["LIME 文本解释"]
    D --> J["全局洞察报告"]
    E --> K["单样本解释报告"]
    F --> J
    G --> K
    H --> K
    I --> K
    J --> L["模型审计报告"]
    K --> L`,
        tip: "建议将 SHAP summary plot 作为模型解释的标准输出——它一张图同时展示了特征重要性和影响方向，是向利益相关者汇报最有效的可视化工具。",
        warning: "陷阱：SHAP 的 Force Plot 在特征数量较多时可能难以阅读。建议限制在 top 5-8 个特征，或者使用 Decision Plot 来展示更清晰的决策路径。另外，SHAP 值解释的是模型行为而非因果关系。"
      },
    ],
};
