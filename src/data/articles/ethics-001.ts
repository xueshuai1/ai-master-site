import { Article } from '../knowledge';

export const article: Article = {
    id: "ethics-001",
    title: "AI 偏见与公平性",
    category: "ethics",
    tags: ["AI伦理", "公平性", "偏见"],
    summary: "从算法偏见到公平性度量，理解 AI 系统中的伦理挑战",
    date: "2026-04-12",
    readTime: "16 min",
    level: "入门",
    content: [
      {
        title: "1. 算法偏见的来源",
        body: `AI 系统的偏见并非凭空产生，它根植于现实世界的不平等之中。训练数据往往反映历史歧视：如果过去某个群体在招聘、贷款或司法系统中受到不公平对待，那么从这些数据中训练出的模型会学习并放大这种模式。

偏见的第一个来源是数据代表性不足。当某些群体在训练数据中占比过低，模型对这些群体的预测准确率会显著下降。第二个来源是标注偏见——人类标注员自身的隐性偏见会直接编码到标签中。第三个来源是特征选择偏差：即使数据本身看起来客观，选择哪些特征作为输入也可能引入歧视。

理解偏见的来源是解决它的第一步。我们需要从数据采集、标注、特征工程到模型部署的全流程进行审视，才能有效识别和缓解偏见。`,
        code: [
          {
            lang: "python",
            code: `import pandas as pd
import numpy as np

# 检查数据集中敏感属性的分布
def check_representation(df, sensitive_attr):
    """检查敏感属性在数据集中的分布"""
    dist = df[sensitive_attr].value_counts(normalize=True)
    print(f"--- {sensitive_attr} 分布 ---")
    for group, ratio in dist.items():
        print(f"  {group}: {ratio:.2%}")
    return dist

df = pd.read_csv("hiring_data.csv")
check_representation(df, "gender")`
          },
          {
            lang: "python",
            code: `# 检测标注者之间的偏见一致性
from sklearn.metrics import cohen_kappa_score

def check_annotator_bias(labels_a, labels_b):
    """计算两个标注者之间的一致性"""
    kappa = cohen_kappa_score(labels_a, labels_b)
    if kappa < 0.4:
        print(f"警告：标注一致性较低 (kappa={kappa:.3f})")
    elif kappa < 0.6:
        print(f"注意：标注一致性中等 (kappa={kappa:.3f})")
    else:
        print(f"标注一致性良好 (kappa={kappa:.3f})")
    return kappa

# 不同标注者对同一组简历的评分
kappa = check_annotator_bias(ratings_A, ratings_B)`
          }
        ],
        table: {
          headers: ["偏见类型", "产生阶段", "典型表现"],
          rows: [
            ["样本偏差", "数据采集", "某些群体数据量不足"],
            ["标注偏差", "数据标注", "人类标注者的隐性歧视"],
            ["选择偏差", "特征工程", "选择了与受保护属性相关的特征"],
            ["测量偏差", "特征定义", "同一指标对不同群体含义不同"],
            ["聚合偏差", "模型训练", "全局最优掩盖了群体差异"],
          ]
        },
        mermaid: `graph TD
    A["现实世界不平等"] --> B["历史歧视数据"]
    B --> C["训练数据集"]
    C --> D["模型学习"]
    D --> E["偏见编码"]
    E --> F["部署后的不公平决策"]
    F -.->|反馈循环| A
    C -.->|数据审计| G["检测偏见"]
    G -.->|修正| C`,
        tip: "建议在项目开始时就建立数据审计流程，在数据采集阶段识别潜在偏见，这比模型训练后再去偏成本更低。",
        warning: "陷阱：不要认为删除敏感属性就能消除偏见。模型可能通过代理变量（如邮编与种族的强相关性）间接学习到受保护属性。"
      },
      {
        title: "2. 公平性的定义",
        body: `公平性在 AI 领域并没有唯一的数学定义，不同的公平性准则之间甚至可能互相矛盾。理解这些定义之间的差异和张力，是设计公平 AI 系统的核心挑战。

统计 Parity（也称人口统计学均等）要求模型对各个群体的预测结果分布相同。例如，男性和女性的贷款通过率应该相等。这一定义最直观，但也最粗暴——它完全忽略了群体之间的基础差异。

机会均等（Equal Opportunity）要求模型在各个群体中具有相同的真正例率（TPR）。也就是说，对于"应该获得正面结果"的人，模型应该以相同的概率给出正面预测。这在司法和招聘场景中尤为重要。

预测 Parity（也称预测率均等）要求模型的阳性预测值（PPV）在各群体中相等。即被预测为正例的人中，真正为正例的比例在各群体中应该相同。这三种定义不可能同时满足，这就是公平性中的不可能定理。`,
        code: [
          {
            lang: "python",
            code: `def statistical_parity_difference(y_pred, sensitive, pos_label=1):
    """计算统计 Parity 差异"""
    groups = set(sensitive)
    rates = {}
    for g in groups:
        mask = sensitive == g
        rates[g] = np.mean(y_pred[mask] == pos_label)
    # 最大组与最小组的差异
    diff = max(rates.values()) - min(rates.values())
    print(f"各组阳性预测率: {rates}")
    print(f"统计 Parity 差异: {diff:.4f}")
    return diff, rates`
          },
          {
            lang: "python",
            code: `from sklearn.metrics import confusion_matrix

def equal_opportunity_difference(y_true, y_pred, sensitive, pos_label=1):
    """计算机会均等差异（TPR 差异）"""
    groups = set(sensitive)
    tprs = {}
    for g in groups:
        mask = sensitive == g
        tn, fp, fn, tp = confusion_matrix(
            y_true[mask], y_pred[mask], labels=[0, 1]
        ).ravel()
        tprs[g] = tp / (tp + fn) if (tp + fn) > 0 else 0
    diff = max(tprs.values()) - min(tprs.values())
    print(f"各组真正例率: {tprs}")
    print(f"机会均等差异: {diff:.4f}")
    return diff, tprs`
          }
        ],
        table: {
          headers: ["公平性定义", "数学条件", "适用场景", "局限性"],
          rows: [
            ["统计 Parity", "P(Y=1|A=0) = P(Y=1|A=1)", "整体资源分配", "忽略真实差异"],
            ["机会均等", "TPR(A=0) = TPR(A=1)", "招聘/录取", "不控制假阳性"],
            ["预测 Parity", "PPV(A=0) = PPV(A=1)", "风险评估", "要求基础率相同"],
            ["均等赔率", "FPR 和 TPR 均相等", "全面公平评估", "几乎无法同时满足"],
          ]
        },
        mermaid: `graph LR
    A["公平性目标"] --> B["统计 Parity"]
    A --> C["机会均等"]
    A --> D["预测 Parity"]
    B --> E["结果分布相同"]
    C --> F["真正例率相同"]
    D --> G["阳性预测值相同"]
    E -.->|矛盾| F
    F -.->|矛盾| G
    G -.->|矛盾| E`,
        tip: "选择公平性定义时，必须结合具体业务场景。司法场景优先考虑机会均等（减少误判），而资源分配场景可能更适合统计 Parity。",
        warning: "陷阱：Chouldechova (2017) 证明当群体间基础率不同时，统计 Parity、预测 Parity 和机会均等不可能同时满足。你必须做出权衡选择。"
      },
      {
        title: "3. 公平性度量指标",
        body: `有了公平性的理论定义，我们需要将其转化为可计算的度量指标。这些指标帮助我们在模型训练和评估过程中量化不公平程度，并为改进提供方向。

最常用的指标体系包括：群体公平性指标（比较不同群体的性能差异）、个体公平性指标（相似个体应获得相似预测）、以及校准指标（预测概率在各群体中应有相同的校准度）。

此外，还有一些复合指标试图同时捕捉多个维度的公平性。例如，Theil 指数将整体不公平分解为群体内和群体间两个部分。这些度量不是孤立的——在实践中，你需要根据业务需求选择一组互补的指标进行监控。

重要的是，没有任何单一指标能够全面刻画公平性。好的做法是建立一个指标仪表盘，同时监控多个维度的公平性表现。`,
        code: [
          {
            lang: "python",
            code: `def disparate_impact_ratio(y_pred, sensitive, pos_label=1):
    """计算差异影响比率（4/5 法则）"""
    groups = set(sensitive)
    rates = {}
    for g in groups:
        mask = sensitive == g
        rates[g] = np.mean(y_pred[mask] == pos_label)
    # 取最小值除以最大值
    sorted_rates = sorted(rates.values())
    ratio = sorted_rates[0] / sorted_rates[1] if sorted_rates[1] > 0 else 0
    print(f"差异影响比率: {ratio:.4f}")
    if ratio < 0.8:
        print("  警告：违反 4/5 法则（EEOC 标准）")
    return ratio

# 4/5 法则：若比率 < 0.8，可能存在歧视`
          },
          {
            lang: "python",
            code: `def theil_index_fairness(y_pred, y_true, sensitive, pos_label=1):
    """计算公平性的 Theil 指数分解"""
    groups = list(set(sensitive))
    # 计算各组的错误率
    error_rates = []
    for g in groups:
        mask = sensitive == g
        err = np.mean(y_pred[mask] != y_true[mask])
        error_rates.append(err)
    
    mean_err = np.mean(error_rates)
    n = len(error_rates)
    if mean_err == 0:
        return 0.0
    # Theil 指数
    theil = np.sum([e * np.log(e / mean_err) if e > 0 else 0 
                    for e in error_rates]) / (n * mean_err)
    print(f"群体间 Theil 指数: {theil:.4f}")
    return theil`
          }
        ],
        table: {
          headers: ["指标名称", "计算方式", "理想值", "适用场景"],
          rows: [
            ["统计 Parity 差异", "|P(Y=1|A=0) - P(Y=1|A=1)|", "0", "整体结果分布"],
            ["差异影响比率", "min_rate / max_rate", "> 0.8", "EEOC 合规检查"],
            ["均等赔率差异", "max TPR 差 + max FPR 差", "0", "全面公平评估"],
            ["Theil 指数", "错误率分布熵", "0", "不公平程度分解"],
            ["个体公平性", "相似样本预测差异", "0", "细粒度公平"],
          ]
        },
        mermaid: `graph TD
    A["模型预测"] --> B["群体级指标"]
    A --> C["个体级指标"]
    A --> D["校准指标"]
    B --> B1["统计 Parity 差异"]
    B --> B2["差异影响比率"]
    B --> B3["均等赔率差异"]
    C --> C1["Lipschitz 公平性"]
    C --> C2["Counterfactual 公平"]
    D --> D1["校准曲线"]
    D --> D2["Brier Score 分组"]`,
        tip: "建议建立公平性监控仪表盘，将多个指标同时可视化。单一指标可能掩盖问题，多维度监控才能全面评估。",
        warning: "陷阱：差异影响比率在阳性率接近 0 或 1 时可能失效。当总体阳性率极低时，即使很小的绝对差异也会导致比率远低于 0.8。"
      },
      {
        title: "4. 去偏方法：预处理、处理中、后处理",
        body: `去偏方法按照在机器学习流程中的位置，可以分为三大类：预处理、处理中和后处理。每种方法有不同的优缺点，选择合适的策略取决于你的具体场景和约束。

预处理方法在模型训练之前修改数据。重加权（Reweighting）为不同群体的样本分配不同的权重，使得加权后的数据分布满足公平性约束。重采样（Resampling）通过过采样少数群体或欠采样多数群体来平衡数据。表征学习（Representation Learning）学习去除了敏感属性信息的特征表示。

处理中方法在模型训练过程中加入公平性约束。对抗性去偏（Adversarial Debiasing）使用一个对抗网络来惩罚模型学习敏感属性。约束优化（Constrained Optimization）在损失函数中加入公平性正则项。

后处理方法在模型训练完成后调整预测结果。阈值调整（Threshold Adjustment）为不同群体设置不同的分类阈值。等赔率后处理（Equalized Odds Post-processing）通过随机化策略在保持精度的同时实现公平性。`,
        code: [
          {
            lang: "python",
            code: `# 预处理：重加权
import numpy as np

def compute_reweighting_weights(y, sensitive):
    """计算重加权权重"""
    classes = np.unique(y)
    groups = np.unique(sensitive)
    n = len(y)
    weights = np.ones(n)
    
    for c in classes:
        for g in groups:
            mask = (y == c) & (sensitive == g)
            n_cg = mask.sum()
            n_c = (y == c).sum()
            n_g = (sensitive == g).sum()
            if n_cg > 0 and n_c > 0 and n_g > 0:
                weights[mask] = (n_c * n_g) / (n * n_cg)
    return weights

weights = compute_reweighting_weights(y_train, sensitive_train)
model.fit(X_train, y_train, sample_weight=weights)`
          },
          {
            lang: "python",
            code: `# 后处理：阈值调整
from sklearn.metrics import roc_curve

def find_optimal_thresholds(y_true, y_score, sensitive, target_tpr=0.8):
    """为不同群体找到满足目标 TPR 的最优阈值"""
    thresholds = {}
    groups = set(sensitive)
    for g in groups:
        mask = sensitive == g
        fpr, tpr, thr = roc_curve(y_true[mask], y_score[mask])
        # 找到达到目标 TPR 的阈值
        idx = np.searchsorted(tpr, target_tpr)
        if idx < len(thr):
            thresholds[g] = thr[idx]
        else:
            thresholds[g] = thr[-1]
        print(f"  {g}: threshold={thresholds[g]:.4f}")
    return thresholds

# 使用不同阈值进行预测
for g in groups:
    mask = sensitive_test == g
    y_pred[mask] = (y_score[mask] >= thresholds[g]).astype(int)`
          }
        ],
        table: {
          headers: ["方法类型", "代表方法", "优点", "缺点"],
          rows: [
            ["预处理", "重加权/重采样", "与模型无关，简单易用", "可能丢失信息"],
            ["处理中", "对抗性去偏", "端到端优化，效果好", "训练复杂，调参难"],
            ["后处理", "阈值调整", "不改变模型，灵活", "需要单独维护阈值"],
            ["混合方法", "预处理+后处理", "互补优势", "复杂度高"],
          ]
        },
        mermaid: `graph LR
    A["原始数据"] --> B["预处理去偏"]
    B --> C["训练数据"]
    C --> D["训练模型"]
    D --> E["处理中去偏"]
    E --> F["原始预测"]
    F --> G["后处理去偏"]
    G --> H["公平预测"]
    
    B -.->|"Reweighting"| C
    E -.->|"Adversarial"| D
    G -.->|"Threshold"| H`,
        tip: "建议从后处理开始尝试——它最简单，不需要重新训练模型。如果效果不满足要求，再考虑处理中或预处理方法。",
        warning: "陷阱：预处理和去偏方法可能降低模型整体性能。你需要在公平性和准确性之间做出明确的权衡，而不是期望两者兼得。"
      },
      {
        title: "5. 案例研究：COMPAS、招聘与贷款",
        body: `现实世界中的 AI 偏见案例为我们提供了宝贵的教训。COMPAS 系统是美国广泛使用的再犯风险评估工具，ProPublica 在 2016 年的调查揭示了其系统性种族偏见：对黑人被告的误判率显著高于白人被告——黑人更可能被错误标记为高风险，而白人更可能被错误标记为低风险。

亚马逊的 AI 招聘系统同样臭名昭著。该系统基于过去十年的简历数据训练，学习到了男性主导的技术行业中的历史偏见。它开始系统性惩罚包含 "women" 一词的简历（如 "women chess club captain"），并降低女子学院毕业生的评分。亚马逊最终废弃了这个系统。

在贷款审批领域，算法歧视同样普遍。研究表明，即使控制信用评分和收入等客观因素，少数族裔申请人的贷款拒绝率仍然更高。部分原因是算法使用了与种族高度相关的代理变量，如邮编、教育背景等。这些案例共同说明了一个核心问题：技术中立是一个神话，AI 系统不可避免地承载着训练数据中的社会偏见。`,
        code: [
          {
            lang: "python",
            code: `# 模拟 COMPAS 偏见分析
import pandas as pd
from sklearn.metrics import confusion_matrix

def analyze_compas_bias(df):
    """分析 COMPAS 系统的群体差异"""
    races = df["race"].unique()
    results = {}
    for race in races:
        subset = df[df["race"] == race]
        tn, fp, fn, tp = confusion_matrix(
            subset["actual_recidivism"],
            subset["predicted_risk"],
            labels=[0, 1]
        ).ravel()
        fpr = fp / (fp + tn)  # 假阳性率
        fnr = fn / (fn + tp)  # 假阴性率
        results[race] = {"FPR": fpr, "FNR": fnr}
    return pd.DataFrame(results).T

# ProPublica 发现：黑人 FPR 更高，白人 FNR 更高`
          },
          {
            lang: "python",
            code: `# 检测贷款审批中的代理歧视
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

def detect_proxy_discrimination(X, y, sensitive, protected_features):
    """检测敏感属性是否通过代理变量间接影响预测"""
    model = RandomForestClassifier(random_state=42)
    model.fit(X, y)
    
    # 置换重要性分析
    result = permutation_importance(model, X, y, n_repeats=10)
    importances = result.importances_mean
    
    # 检查受保护属性相关的特征
    for feat, imp in zip(X.columns, importances):
        if feat in protected_features:
            print(f"  {feat}: importance={imp:.4f}")
            if imp > 0.1:
                print(f"    警告：{feat} 可能是敏感属性的代理变量")`
          }
        ],
        table: {
          headers: ["案例", "领域", "偏见类型", "影响后果", "教训"],
          rows: [
            ["COMPAS", "司法", "种族偏见", "黑人误判率更高", "需跨群体公平性审计"],
            ["亚马逊招聘", "招聘", "性别偏见", "歧视女性简历", "历史数据不可盲信"],
            ["贷款审批", "金融", "代理歧视", "少数族裔被拒率高", "代理变量难以消除"],
            ["面部识别", "安防", "种族/性别", "深色皮肤女性错误率最高", "数据多样性至关重要"],
          ]
        },
        mermaid: `graph TD
    A["历史数据"] --> B["COMPAS 训练"]
    A --> C["亚马逊简历筛选"]
    A --> D["贷款审批模型"]
    B --> E["种族偏见编码"]
    C --> F["性别偏见编码"]
    D --> G["代理歧视"]
    E --> H["不公平判决"]
    F --> I["歧视性招聘"]
    G --> J["不公平贷款拒绝"]
    H --> K["公众质疑"]
    I --> K
    J --> K
    K --> L["AI 伦理反思"]`,
        tip: "建议在部署任何高风险 AI 系统之前，进行跨群体的公平性审计。不要等到问题被媒体曝光才采取行动。",
        warning: "陷阱：COMPAS 的供应商 Northpointe 辩称系统是公平的（因为预测值相等），而 ProPublica 认为它不公平（因为错误率不同）。这恰好说明了公平性定义之间的根本矛盾。"
      },
      {
        title: "6. 公平性与性能的权衡",
        body: `公平性和模型性能之间的权衡是 AI 伦理中最核心的挑战之一。在许多情况下，追求更高的公平性意味着接受更低的整体准确率——这是一个必须面对的现实，而不是可以绕过的技术问题。

这种权衡的根源在于：如果不同群体的基础分布存在差异（例如基础阳性率不同），那么满足公平性约束就必然要求模型在某些群体上做出次优决策。数学上，这被称为公平性-准确性前沿（Fairness-Accuracy Frontier）。

在实践中，我们需要量化这种权衡：在给定公平性约束下，模型性能会下降多少？这个代价是否可接受？这不仅是技术问题，更是伦理和商业决策。在某些领域（如司法、医疗），公平性的优先级远高于微小的性能损失。

关键是要透明地呈现这种权衡，让利益相关者（包括受影响群体）参与决策，而不是由技术团队在暗室中做出选择。`,
        code: [
          {
            lang: "python",
            code: `# 绘制公平性-准确性前沿
import numpy as np
import matplotlib.pyplot as plt

def fairness_accuracy_frontier(X, y, sensitive, alphas):
    """计算不同公平性约束下的准确性前沿"""
    from sklearn.linear_model import LogisticRegression
    
    accuracies = []
    fairness_gaps = []
    
    for alpha in alphas:
        # 简化示例：使用正则化强度模拟公平性约束
        model = LogisticRegression(C=alpha, max_iter=1000)
        model.fit(X, y)
        y_pred = model.predict(X)
        
        acc = np.mean(y_pred == y)
        # 计算公平性差距
        groups = set(sensitive)
        rates = [np.mean(y_pred[sensitive == g]) for g in groups]
        gap = max(rates) - min(rates)
        
        accuracies.append(acc)
        fairness_gaps.append(gap)
    
    return accuracies, fairness_gaps`
          },
          {
            lang: "python",
            code: `# 量化公平性约束下的性能损失
def measure_fairness_cost(base_model, debiased_model, 
                          X_test, y_test, sensitive):
    """计算去偏带来的性能代价"""
    y_base = base_model.predict(X_test)
    y_debias = debiased_model.predict(X_test)
    
    acc_base = np.mean(y_base == y_test)
    acc_debias = np.mean(y_debias == y_test)
    
    # 公平性改善
    groups = set(sensitive)
    base_rates = [np.mean(y_base[sensitive == g]) for g in groups]
    debias_rates = [np.mean(y_debias[sensitive == g]) for g in groups]
    
    base_gap = max(base_rates) - min(base_rates)
    debias_gap = max(debias_rates) - min(debias_rates)
    
    print(f"准确率变化: {acc_base:.4f} -> {acc_debias:.4f} (损失: {acc_base-acc_debias:.4f})")
    print(f"公平性差距: {base_gap:.4f} -> {debias_gap:.4f} (改善: {base_gap-debias_gap:.4f})")
    return acc_base - acc_debias, base_gap - debias_gap`
          }
        ],
        table: {
          headers: ["公平性约束", "对性能的影响", "典型损失范围", "适用条件"],
          rows: [
            ["统计 Parity", "强制结果分布相同", "1%-15%", "群体基础率相近"],
            ["机会均等", "强制 TPR 相同", "0.5%-10%", "允许结果分布差异"],
            ["预测 Parity", "强制 PPV 相同", "1%-8%", "需要良好校准"],
            ["无约束", "最大化全局性能", "0%", "不要求公平性"],
          ]
        },
        mermaid: `graph LR
    A["公平性约束"] --> B["严格约束"]
    A --> C["宽松约束"]
    A --> D["无约束"]
    B --> E["公平性高"]
    B --> F["性能低"]
    C --> G["公平性中"]
    C --> H["性能中"]
    D --> I["公平性低"]
    D --> J["性能高"]
    
    E -.-> K["选择合适平衡点"]
    H -.-> K
    J -.-> K`,
        tip: "建议将公平性-性能权衡可视化地呈现给利益相关者，用帕累托前沿帮助他们理解不同选择之间的取舍。",
        warning: "陷阱：在某些极端情况下，强制满足公平性约束可能导致模型退化为随机猜测。始终检查去偏后的模型是否具有基本的预测能力。"
      },
      {
        title: "7. AIF360 实战：公平性评估与去偏",
        body: `AIF360（AI Fairness 360）是 IBM 开发的开源工具包，提供了超过 70 个公平性度量指标和多个去偏算法。它是目前最全面的公平性工具，覆盖了从数据审计到模型评估的完整流程。

AIF360 的核心概念包括：BinaryLabelDataset 用于封装带有敏感属性的数据集，ClassificationMetric 用于计算各种公平性指标，以及多种去偏算法（Reweighing、Adversarial Debiasing、Calibrated Equalized Odds 等）。

使用 AIF360 的标准流程是：首先定义受保护属性和有利/不利标签，然后用 Metric 类计算去偏前的公平性指标，接着应用去偏算法，最后重新计算指标对比效果。

掌握 AIF360 不仅让你具备技术能力，更重要的是培养一种思维习惯：在开发 AI 系统时，公平性不是事后补救，而是从头设计的原则。`,
        code: [
          {
            lang: "python",
            code: `from aif360.datasets import BinaryLabelDataset
from aif360.metrics import BinaryLabelDatasetMetric
import pandas as pd

# 1. 加载数据并定义受保护属性
df = pd.read_csv("adult_dataset.csv")
dataset = BinaryLabelDataset(
    df=df,
    label_names=["income"],
    protected_attribute_names=["race", "sex"],
    favorable_classes=[1],
    privileged_classes=[["White"], ["Male"]]
)

# 2. 计算去偏前的公平性指标
metric = BinaryLabelDatasetMetric(
    dataset,
    unprivileged_groups=[{"race": 0, "sex": 0}],
    privileged_groups=[{"race": 1, "sex": 1}]
)

print(f"统计 Parity 差异: {metric.statistical_parity_difference():.4f}")
print(f"差异影响比率: {metric.disparate_impact():.4f}")`
          },
          {
            lang: "python",
            code: `from aif360.algorithms.preprocessing import Reweighing
from aif360.metrics import ClassificationMetric
from sklearn.linear_model import LogisticRegression

# 3. 应用 Reweighing 去偏
rw = Reweighing(
    unprivileged_groups=[{"race": 0, "sex": 0}],
    privileged_groups=[{"race": 1, "sex": 1}]
)
dataset_rw = rw.fit_transform(dataset)

# 4. 训练模型
model = LogisticRegression(max_iter=1000)
model.fit(dataset_rw.features, dataset_rw.labels.ravel())
y_pred = model.predict(dataset_rw.features)

# 5. 评估去偏效果
pred_dataset = dataset_rw.copy()
pred_dataset.labels = y_pred.reshape(-1, 1)
pred_metric = ClassificationMetric(
    dataset_rw, pred_dataset,
    unprivileged_groups=[{"race": 0, "sex": 0}],
    privileged_groups=[{"race": 1, "sex": 1}]
)
print(f"去偏后统计 Parity 差异: {pred_metric.statistical_parity_difference():.4f}")
print(f"去偏后准确率: {pred_metric.accuracy():.4f}")`
          }
        ],
        table: {
          headers: ["AIF360 算法", "类型", "去偏阶段", "适用模型"],
          rows: [
            ["Reweighing", "预处理", "数据重加权", "任何模型"],
            ["Learning Fair Rep", "预处理", "表征学习", "任何模型"],
            ["Adversarial Debiasing", "处理中", "对抗训练", "神经网络"],
            ["Prejudice Remover", "处理中", "正则化", "广义线性模型"],
            ["Calibrated EqOdds", "后处理", "阈值调整", "概率模型"],
            ["Reject Option", "后处理", "决策边界调整", "任何概率模型"],
          ]
        },
        mermaid: `graph TD
    A["原始数据集"] --> B["AIF360 审计"]
    B --> C["计算公平性指标"]
    C --> D{"是否公平?"}
    D -->|"否"| E["选择去偏算法"]
    D -->|"是"| F["部署模型"]
    E --> G["预处理: Reweighing"]
    E --> H["处理中: Adversarial"]
    E --> I["后处理: Calibrated EqOdds"]
    G --> J["重新训练/预测"]
    H --> J
    I --> J
    J --> K["重新评估"]
    K --> C`,
        tip: "建议从 AIF360 的 Reweighing 算法开始——它最简单，与任何分类器兼容，且通常能带来显著的公平性改善。",
        warning: "陷阱：AIF360 的某些算法（如 Adversarial Debiasing）需要 TensorFlow 1.x 环境。使用前确认依赖兼容性，或考虑使用 AIF360 的预处理/后处理算法。"
      },
    ],
};
