import { Article } from '../knowledge';

export const article: Article = {
  id: "math-004",
  title: "信息论基础",
  category: "math",
  tags: ["信息论", "熵", "KL散度"],
  summary: "从信息熵到 KL 散度，理解信息论在 AI 中的核心应用",
  date: "2026-04-12",
  readTime: "18 min",
  level: "进阶",
  content: [
    {
      title: "1. 信息的度量——从不确定性的减少说起",
      body: `信息论由香农于 1948 年创立，其核心思想是将信息量化。一个事件的信息量与其发生概率成反比：越不可能发生的事件，发生时带来的信息量越大。具体来说，事件 x 的自信息定义为 I(x) = -log P(x)。当底数取 2 时，单位为比特（bit）；取 e 时，单位为纳特（nat）。举例来说，抛一枚均匀硬币，正面朝上的信息量为 -log2(0.5) = 1 bit；而投掷一个均匀六面骰子，出现 3 点的信息量为 -log2(1/6) ≈ 2.585 bit。信息量的可加性是其重要性质：两个独立事件同时发生的信息量等于各自信息量之和。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np\n\ndef self_information(prob: float, base: float = 2) -> float:\n    """计算单个事件的自信息"""\n    if prob <= 0 or prob > 1:\n        raise ValueError("Probability must be in (0, 1]")\n    return -np.log(prob) / np.log(base)\n\nprint(f"公平硬币正面: {self_information(0.5):.3f} bits")\nprint(f"骰子出现3点: {self_information(1/6):.3f} bits")`
        },
        {
          lang: "python",
          code: `# 独立事件信息量的可加性验证\ndef joint_information(p1: float, p2: float, base: float = 2) -> tuple:\n    i1 = self_information(p1, base)\n    i2 = self_information(p2, base)\n    i_joint = self_information(p1 * p2, base)\n    return i1, i2, i_joint, i1 + i2\n\ni1, i2, i_joint, i_sum = joint_information(0.5, 0.25)\nprint(f"I(x)+I(y)={i_sum:.3f}, I(x,y)={i_joint:.3f}")\nassert abs(i_sum - i_joint) < 1e-10  # 可加性成立`
        }
      ],
      table: {
        headers: ["事件", "概率", "信息量 (bits)"],
        rows: [
          ["公平硬币正面", "0.5", "1.000"],
          ["骰子出现3点", "1/6", "2.585"],
          ["双色球头奖", "1/1772万", "≈24.08"],
          ["太阳从东边升起", "≈1", "≈0"]
        ]
      },
      mermaid: `graph LR
    A["不确定事件"] --> B["概率分布"]
    B --> C["自信息 I(x) = -log P(x)"]
    C --> D["单位: bit / nat"]
    C --> E["独立事件可加"]`,
      tip: "理解自信息是理解信息论所有后续概念的基石。",
      warning: "概率为 0 的事件信息量无穷大，计算时需做数值截断。"
    },
    {
      title: "2. 信息熵——不确定性的平均度量",
      body: `信息熵是信息论中最核心的概念，它衡量一个随机变量的平均不确定性。熵的定义为 H(X) = -Σ P(x) log P(x)，即所有可能事件自信息的期望值。熵越大，系统的不确定性越高；熵为零表示系统完全确定。对于伯努利分布（如抛硬币），当 p = 0.5 时熵最大，为 1 bit。多元随机变量的联合熵 H(X,Y) 衡量两个变量联合的不确定性，而条件熵 H(Y|X) 衡量已知 X 后 Y 的剩余不确定性。熵的链式法则 H(X,Y) = H(X) + H(Y|X) 是推导许多信息论恒等式的基础。在机器学习中，交叉熵损失函数正是源于对信息熵的扩展应用。`,
      code: [
        {
          lang: "python",
          code: `def entropy(probs: list[float], base: float = 2) -> float:\n    """计算离散分布的信息熵"""\n    probs = np.array(probs)\n    assert np.isclose(probs.sum(), 1.0), "Probabilities must sum to 1"\n    probs = probs[probs > 0]  # 过滤零概率\n    return -np.sum(probs * np.log(probs) / np.log(base))\n\n# 伯努利分布的熵\nprint(f"p=0.5: H={entropy([0.5, 0.5]):.3f} bits")\nprint(f"p=0.9: H={entropy([0.9, 0.1]):.3f} bits")\nprint(f"p=1.0: H={entropy([1.0, 0.0]):.3f} bits")`
        },
        {
          lang: "python",
          code: `# 验证: 均匀分布的熵最大\ndef max_entropy_check(n_categories: int) -> float:\n    uniform = [1.0 / n_categories] * n_categories\n    skewed = [0.9] + [0.1 / (n_categories - 1)] * (n_categories - 1)\n    return entropy(uniform), entropy(skewed)\n\nfor n in [2, 4, 10, 100]:\n    h_uni, h_ske = max_entropy_check(n)\n    print(f"n={n}: 均匀={h_uni:.3f}, 偏斜={h_ske:.3f}, 理论=log2({n})={np.log2(n):.3f}")`
        }
      ],
      table: {
        headers: ["分布类型", "参数", "熵公式", "最大值"],
        rows: [
          ["伯努利", "p", "-p log p - (1-p) log (1-p)", "1 bit (p=0.5)"],
          ["均匀分布", "n 类", "log2(n)", "log2(n)"],
          ["泊松分布", "λ", "≈ 0.5 log(2πeλ)", "随 λ 增长"]
        ]
      },
      mermaid: `graph TD
    A["随机变量 X"] --> B["概率分布 P(x)"]
    B --> C["自信息 -log P(x)"]
    C --> D["期望: H(X) = E[-log P(x)]"]
    D --> E["熵值越大, 不确定性越高"]
    E --> F["均匀分布时熵最大"]`,
      tip: "记住: 熵不是关于某个具体值的不确定性，而是整个分布的平均不确定性。",
      warning: "实际计算中 log(0) 会返回 -inf，务必先过滤零概率项。"
    },
    {
      title: "3. 交叉熵——衡量用错误分布编码的代价",
      body: `交叉熵 H(P, Q) = -Σ P(x) log Q(x) 衡量用分布 Q 来编码服从分布 P 的数据所需的平均比特数。当 Q = P 时，交叉熵退化为信息熵 H(P)。当 Q 与 P 差异越大时，交叉熵越大，意味着编码效率越低。交叉熵与信息熵和 KL 散度之间存在关系 H(P, Q) = H(P) + D_KL(P || Q)。在机器学习中，交叉熵是最常用的分类损失函数。对于二分类问题，二元交叉熵为 -[y log p + (1-y) log (1-p)]，其中 y 是真实标签，p 是模型预测的概率。多分类问题中，交叉熵衡量模型预测的概率分布与真实独热编码分布之间的差距。`,
      code: [
        {
          lang: "python",
          code: `def cross_entropy(p_true: list[float], q_pred: list[float]) -> float:\n    """计算两个分布之间的交叉熵"""\n    p = np.array(p_true)\n    q = np.array(q_pred)\n    q = np.clip(q, 1e-15, 1.0)  # 数值稳定\n    return -np.sum(p * np.log(q))\n\n# 真实分布 vs 预测分布\np_true = [0.7, 0.2, 0.1]\nq_good = [0.65, 0.25, 0.10]  # 接近真实\nq_bad  = [0.2, 0.3, 0.5]     # 偏离真实\nprint(f"H(P,Q_good)={cross_entropy(p_true, q_good):.4f}")\nprint(f"H(P,Q_bad)={cross_entropy(p_true, q_bad):.4f}")`
        },
        {
          lang: "python",
          code: `# 二分类交叉熵损失\ndef binary_cross_entropy(y_true: float, y_pred: float) -> float:\n    eps = 1e-15\n    y_pred = np.clip(y_pred, eps, 1 - eps)\n    return -(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))\n\n# 不同预测质量的损失\nfor pred in [0.5, 0.7, 0.9, 0.99]:\n    loss = binary_cross_entropy(1.0, pred)\n    print(f"y=1, p={pred:.2f}, BCE={loss:.4f}")`
        }
      ],
      table: {
        headers: ["场景", "P(真实)", "Q(预测)", "交叉熵"],
        rows: [
          ["完美预测", "[1,0,0]", "[1,0,0]", "0.000"],
          ["接近预测", "[0.7,0.2,0.1]", "[0.65,0.25,0.10]", "0.693"],
          ["错误预测", "[0.7,0.2,0.1]", "[0.2,0.3,0.50]", "1.446"]
        ]
      },
      mermaid: `graph LR
    A["真实分布 P"] --> C["交叉熵 H(P,Q)"]
    B["预测分布 Q"] --> C
    C --> D["H(P,Q) = H(P) + D_KL(P||Q)"]
    D --> E["Q越接近P, 代价越小"]
    D --> F["Q=P时, H(P,Q)=H(P)"]`,
      tip: "训练神经网络时，最小化交叉熵等价于最大化数据的对数似然。",
      warning: "交叉熵不对称: H(P,Q) ≠ H(Q,P)，注意参数的顺序。"
    },
    {
      title: "4. KL 散度（相对熵）——分布差异的度量",
      body: `KL 散度 D_KL(P || Q) = Σ P(x) log(P(x)/Q(x)) 衡量用分布 Q 近似真实分布 P 时所损失的信息量。它是交叉熵与熵之差：D_KL(P || Q) = H(P, Q) - H(P)。KL 散度具有非负性（吉布斯不等式），当且仅当 P = Q 时为零。然而 KL 散度不是距离度量，因为它不满足对称性和三角不等式。在机器学习中，KL 散度广泛应用于变分推断（VAE）、策略优化（PPO 中的 KL 约束）、知识蒸馏等领域。JS 散度是 KL 散度的对称化版本，定义为 JS(P||Q) = 0.5 D_KL(P||M) + 0.5 D_KL(Q||M)，其中 M = (P+Q)/2。`,
      code: [
        {
          lang: "python",
          code: `def kl_divergence(p: list[float], q: list[float]) -> float:\n    """计算 KL 散度 D_KL(P || Q)"""\n    p = np.array(p)\n    q = np.clip(np.array(q), 1e-15, 1.0)\n    return np.sum(p * np.log(p / q))\n\np = [0.5, 0.3, 0.2]\nq1 = [0.5, 0.3, 0.2]  # 相同\nq2 = [0.3, 0.4, 0.3]  # 不同\nprint(f"D_KL(P||P) = {kl_divergence(p, p):.6f}")\nprint(f"D_KL(P||Q) = {kl_divergence(p, q2):.6f}")\nprint(f"D_KL(Q||P) = {kl_divergence(q2, p):.6f}")`
        },
        {
          lang: "python",
          code: `# JS 散度——对称化的分布差异度量\ndef js_divergence(p: list[float], q: list[float]) -> float:\n    p, q = np.array(p), np.array(q)\n    m = 0.5 * (p + q)\n    return 0.5 * kl_divergence(p, m) + 0.5 * kl_divergence(q, m)\n\n# 比较 KL 散度的非对称性与 JS 散度的对称性\nprint(f"KL(P||Q)={kl_divergence(p,q2):.4f}, KL(Q||P)={kl_divergence(q2,p):.4f}")\nprint(f"JS(P||Q)={js_divergence(p,q2):.4f} (对称)")`
        }
      ],
      table: {
        headers: ["性质", "KL 散度", "JS 散度", "欧氏距离"],
        rows: [
          ["非负性", "是 (≥0)", "是 (≥0)", "是 (≥0)"],
          ["对称性", "否", "是", "是"],
          ["三角不等式", "否", "否", "是"],
          ["为零条件", "P=Q", "P=Q", "P=Q"]
        ]
      },
      mermaid: `graph TD
    A["KL 散度 D_KL(P||Q)"] --> B["非负: D_KL ≥ 0"]
    A --> C["非对称: D_KL(P||Q) ≠ D_KL(Q||P)"]
    A --> D["D_KL = H(P,Q) - H(P)"]
    A --> E["Q 近似 P 的信息损失"]
    C --> F["JS 散度: 对称化版本"]`,
      tip: "PPO 算法中用 KL 散度约束新旧策略的差异，防止策略更新过大导致崩溃。",
      warning: "当 Q(x)=0 而 P(x)>0 时，KL 散度为无穷大，训练中需确保 Q 的支撑集覆盖 P。"
    },
    {
      title: "5. 互信息——变量间的统计依赖关系",
      body: `互信息 I(X;Y) = Σ P(x,y) log(P(x,y) / (P(x)P(y))) 衡量两个随机变量之间的相互依赖程度。它可以理解为知道 Y 后 X 不确定性的减少量：I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X)。互信息也是联合分布与边缘分布乘积之间的 KL 散度：I(X;Y) = D_KL(P(X,Y) || P(X)P(Y))。当 X 与 Y 独立时，互信息为零；依赖越强，互信息越大。归一化互信息 NMI = I(X;Y) / sqrt(H(X)H(Y)) 将互信息映射到 [0,1] 区间。在特征选择中，互信息用于衡量特征与目标变量的相关性，比皮尔逊相关系数更通用，因为它能捕捉非线性关系。`,
      code: [
        {
          lang: "python",
          code: `def mutual_information(joint: np.ndarray) -> float:\n    """从联合分布计算互信息"""\n    joint = joint / joint.sum()  # 归一化\n    p_x = joint.sum(axis=1)\n    p_y = joint.sum(axis=0)\n    outer = np.outer(p_x, p_y)\n    mi = 0.0\n    for i in range(joint.shape[0]):\n        for j in range(joint.shape[1]):\n            if joint[i,j] > 0 and outer[i,j] > 0:\n                mi += joint[i,j] * np.log2(joint[i,j] / outer[i,j])\n    return mi\n\njoint = np.array([[0.4, 0.1], [0.1, 0.4]])\nprint(f"I(X;Y) = {mutual_information(joint):.4f} bits")`
        },
        {
          lang: "python",
          code: `# 互信息与熵的关系验证\ndef conditional_entropy(joint: np.ndarray, axis: int = 1) -> float:\n    joint = joint / joint.sum()\n    marginal = joint.sum(axis=axis, keepdims=True)\n    cond = np.where(joint > 0, joint * np.log2(joint / marginal), 0)\n    return -cond.sum()\n\njoint = np.array([[0.4, 0.1], [0.1, 0.4]])\nh_x = entropy(joint.sum(axis=1))\nh_xy = entropy(joint.flatten())\nh_y_given_x = conditional_entropy(joint)\nprint(f"H(X)={h_x:.3f}, H(X,Y)={h_xy:.3f}")\nprint(f"I(X;Y)=H(X)-H(X|Y)={h_x - h_y_given_x:.3f}")`
        }
      ],
      table: {
        headers: ["关系", "公式", "含义"],
        rows: [
          ["互信息定义", "I(X;Y) = H(X) - H(X|Y)", "Y 减少 X 的不确定性"],
          ["对称性", "I(X;Y) = I(Y;X)", "相互的信息量相同"],
          ["KL 散度视角", "D_KL(P(X,Y)||P(X)P(Y))", "联合分布与独立假设的偏差"],
          ["链式法则", "I(X;Y,Z) = I(X;Z) + I(X;Y|Z)", "多变量互信息分解"]
        ]
      },
      mermaid: `graph LR
    A["联合分布 P(X,Y)"] --> B["互信息 I(X;Y)"]
    C["独立假设 P(X)P(Y)"] --> B
    B --> D["I = H(X) - H(X|Y)"]
    B --> E["I = H(X) + H(Y) - H(X,Y)"]
    B --> F["I = D_KL(P(X,Y)||P(X)P(Y))"]`,
      tip: "互信息能捕捉任意形式的统计依赖，而不仅仅是线性关系，这在特征选择中非常有用。",
      warning: "互信息的估计在高维空间中非常困难，样本量不足时容易高估。"
    },
    {
      title: "6. 交叉熵在分类中的应用——从理论到实践",
      body: `交叉熵是分类任务中最常用的损失函数。在二分类中，Sigmoid 输出配合二元交叉熵损失构成标准配置。在多分类中，Softmax 输出配合分类交叉熵损失是最常见的组合。交叉熵损失的梯度形式简洁：对于 softmax + 交叉熵，梯度恰好等于预测概率与真实标签的差值 (p - y)，这使得反向传播极为高效。标签平滑（Label Smoothing）是一种正则化技术，将独热编码的硬标签替换为软化标签，例如将 [1, 0, 0] 替换为 [0.9, 0.05, 0.05]，这可以防止模型过度自信并提升泛化能力。加权交叉熵则用于处理类别不平衡问题，给少数类赋予更高的损失权重。`,
      code: [
        {
          lang: "python",
          code: `def softmax_cross_entropy(logits: np.ndarray, labels: np.ndarray) -> tuple:\n    """Softmax + 交叉熵损失，返回损失和梯度"""\n    exp_logits = np.exp(logits - np.max(logits))  # 数值稳定\n    probs = exp_logits / exp_logits.sum()\n    loss = -np.sum(labels * np.log(probs + 1e-15))\n    grad = probs - labels  # 简洁的梯度形式\n    return loss, grad\n\nlogits = np.array([2.0, 1.0, 0.1])\nlabels = np.array([1.0, 0.0, 0.0])\nloss, grad = softmax_cross_entropy(logits, labels)\nprint(f"Loss: {loss:.4f}")\nprint(f"Gradient: {grad}")`
        },
        {
          lang: "python",
          code: `# 标签平滑实现\ndef label_smoothing(labels: np.ndarray, alpha: float = 0.1) -> np.ndarray:\n    """将独热编码标签平滑化"""\n    k = len(labels)\n    return (1 - alpha) * labels + alpha / k\n\noriginal = np.array([1.0, 0.0, 0.0])\nsmoothed = label_smoothing(original, alpha=0.1)\nprint(f"原始: {original}")\nprint(f"平滑: {smoothed}")\nprint(f"平滑后交叉熵: {cross_entropy(smoothed, [0.8, 0.1, 0.1]):.4f}")`
        }
      ],
      table: {
        headers: ["损失函数变体", "适用场景", "特点"],
        rows: [
          ["二元交叉熵", "二分类", "Sigmoid + BCE"],
          ["分类交叉熵", "多分类", "Softmax + CCE"],
          ["加权交叉熵", "类别不平衡", "少数类权重更高"],
          ["标签平滑交叉熵", "防止过拟合", "软化硬标签"]
        ]
      },
      mermaid: `graph TD
    A["Logits"] --> B["Softmax"]
    B --> C["预测概率 P"]
    D["真实标签 Y"] --> E["交叉熵损失"]
    C --> E
    E --> F["梯度: P - Y"]
    F --> G["反向传播更新权重"]`,
      tip: "Softmax + 交叉熵的组合梯度极其简洁，这就是为什么它成为分类任务的标准配置。",
      warning: "极端类别不平衡时，标准交叉熵会被多数类主导，需要使用 Focal Loss 或加权交叉熵。"
    },
    {
      title: "7. 实战——计算信息量与决策树信息增益",
      body: `信息增益是决策树算法（如 ID3、C4.5）的核心分裂标准。信息增益 IG = H(D) - Σ |Dv|/|D| H(Dv)，即用特征分裂后熵的减少量。信息增益越大，说明该特征对分类越有效。C4.5 使用信息增益比来克服信息增益偏向多值特征的缺陷。基尼不纯度是另一种常用的分裂标准，与熵在形式上不同但目的一致。在实战中，我们首先计算数据集的总熵，然后对每个候选特征计算条件熵，信息增益最大的特征被选为分裂节点。这个过程递归进行直到满足停止条件。理解这些概念对于深入理解决策树、随机森林等集成方法至关重要。`,
      code: [
        {
          lang: "python",
          code: `from collections import Counter\n\ndef calc_entropy(labels: list) -> float:\n    """计算数据集的经验熵"""\n    total = len(labels)\n    counts = Counter(labels)\n    probs = [c / total for c in counts.values()]\n    return entropy(probs)\n\ndef information_gain(labels: list, feature: list) -> float:\n    """计算特征的信息增益"""\n    h_parent = calc_entropy(labels)\n    total = len(labels)\n    feature_vals = set(feature)\n    h_children = 0.0\n    for val in feature_vals:\n        subset = [labels[i] for i in range(total) if feature[i] == val]\n        h_children += (len(subset) / total) * calc_entropy(subset)\n    return h_parent - h_children\n\n# 示例数据集\nlabels =   ["Y","Y","Y","N","N","Y","Y","N","N","N"]\nfeature1 = ["A","A","A","A","B","B","B","B","B","B"]\nprint(f"IG(feature1) = {information_gain(labels, feature1):.4f}")`
        },
        {
          lang: "python",
          code: `# 信息增益 vs 信息增益比\ndef gain_ratio(labels: list, feature: list) -> float:\n    ig = information_gain(labels, feature)\n    split_info = calc_entropy(feature)  # 特征本身的熵\n    return ig / split_info if split_info > 0 else 0.0\n\n# 比较多值特征 vs 少值特征\nhigh_card = [f"x{i}" for i in range(10)]  # 10个唯一值\nbinary_feat = ["A","A","A","A","A","B","B","B","B","B"]\n\nprint(f"高基数: IG={information_gain(labels, high_card):.4f}, GR={gain_ratio(labels, high_card):.4f}")\nprint(f"二值: IG={information_gain(labels, binary_feat):.4f}, GR={gain_ratio(labels, binary_feat):.4f}")`
        }
      ],
      table: {
        headers: ["分裂标准", "公式", "优点", "缺点"],
        rows: [
          ["信息增益", "H(D) - H(D|A)", "直观", "偏向多值特征"],
          ["增益比", "IG / H(A)", "修正偏向", "可能偏向少值特征"],
          ["基尼不纯度", "1 - Σ p^2", "计算快", "对极端概率不敏感"]
        ]
      },
      mermaid: `graph TD
    A["数据集 D"] --> B["计算总熵 H(D)"]
    B --> C["对每个特征 A"]
    C --> D["计算条件熵 H(D|A)"]
    D --> E["信息增益 IG = H(D) - H(D|A)"]
    E --> F["选择 IG 最大的特征分裂"]
    F --> G["递归构建子树"]`,
      tip: "实际应用中 C4.5 和 CART 的增益比和基尼指数比单纯信息增益更稳健。",
      warning: "信息增益对唯一值特征（如 ID）会给出最大值，但这会导致严重的过拟合。"
    }
  ],
};
