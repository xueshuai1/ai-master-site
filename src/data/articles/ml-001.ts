import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-001",
    title: "机器学习基础：从线性模型到决策树",
    category: "ml",
    tags: ["线性回归", "逻辑回归", "决策树", "SVM", "KNN", "机器学习基础"],
    summary: "机器学习入门必读。涵盖线性回归、逻辑回归、决策树、KNN、SVM 等核心算法，从数学原理到 Python 实战，配合对比表格和可视化图解，帮你建立完整的 ML 知识框架。",
    date: "2026-04-22",
    readTime: "20 min",
    level: "入门",
    content: [
      {
        title: "1. 什么是机器学习",
        body: `机器学习（Machine Learning, ML）是人工智能的核心分支，它研究如何通过数据让计算机自动"学习"规律，而不是依靠人类手动编写规则。Arthur Samuel 在 1959 年给出的经典定义至今仍被广泛引用：机器学习是"在不显式编程的情况下赋予计算机学习能力的研究领域"。

更形式化地说，Tom Mitchell（1997）给出了一个精确的定义：如果一个程序在某类任务 T 上的性能 P，随着经验 E 的增加而提高，那么这个程序就是从经验 E 中学习的。这里的"经验"通常指训练数据，"任务"可以是分类、回归、聚类等，"性能"则用准确率、误差等指标衡量。

机器学习的核心范式可以概括为三个要素：模型（Model）、策略（Strategy）和算法（Algorithm）。模型是假设空间——我们假设数据遵循某种数学形式（如线性函数、决策树、神经网络）；策略是如何评估模型的好坏（如最小化损失函数、最大化似然）；算法是具体的求解方法（如梯度下降、牛顿法、EM 算法）。

机器学习的应用已经渗透到我们生活的方方面面：手机里的人脸解锁、邮箱里的垃圾邮件过滤、电商平台的推荐系统、医疗影像的辅助诊断、自动驾驶的感知模块……每一个背后都有机器学习算法在默默工作。`,
        mermaid: `graph TD
    A["数据收集"] --> B["数据预处理"]
    B --> C["特征工程"]
    C --> D["模型训练"]
    D --> E["模型评估"]
    E -->|"效果不佳"| F["调参/换模型"]
    F --> D
    E -->|"效果满意"| G["模型部署"]
    G --> H["持续监控与更新"]

    classDef data fill:#0c4a6e
    classDef process fill:#7c2d12
    classDef decision fill:#14532d
    class A,B,C data
    class D,E,G,H process
    class F decision`,
      },
      {
        title: "机器学习的三大范式",
        body: `根据学习过程中是否有标签信息，机器学习可以分为三大范式，每种范式解决不同类别的问题，适用不同的场景。

监督学习（Supervised Learning） 是最常见的范式。训练数据包含输入 x 和对应的标签 y（目标值），模型的目标是学习一个映射 f: X → Y，使得对新输入的预测尽可能准确。典型的监督学习任务包括分类（标签是离散类别，如垃圾邮件/正常邮件）和回归（标签是连续值，如房价预测）。常见的监督学习算法有线性回归、逻辑回归、决策树、随机森林、支持向量机、K 近邻等。

无监督学习（Unsupervised Learning） 的训练数据只有输入 x，没有标签 y。模型的目标是发现数据内在的结构和模式。典型的无监督学习任务包括聚类（将数据自动分组，如客户分群）、降维（将高维数据压缩到低维，如 PCA、t-SNE）、密度估计和异常检测。无监督学习在探索性数据分析和特征学习中扮演重要角色。

强化学习（Reinforcement Learning） 则是一种截然不同的范式。智能体（Agent）通过与环境（Environment）交互来学习，它不依赖标注好的数据集，而是通过试错获得奖励（Reward）信号来逐步优化策略（Policy）。强化学习在机器人控制、游戏 AI（如 AlphaGo）、自动驾驶决策等领域取得了突破性成果。

除了这三大范式，还有半监督学习（少量标注 + 大量未标注数据）、自监督学习（从数据自身生成监督信号）和迁移学习（将在一个领域学到的知识迁移到另一个领域）等新兴方向。`,
        table: {
          headers: ["范式", "数据形式", "典型任务", "代表算法"],
          rows: [
            ["监督学习", "带标签 (x, y)", "分类、回归", "线性回归、SVM、决策树"],
            ["无监督学习", "无标签 (x)", "聚类、降维", "K-Means、PCA、DBSCAN"],
            ["强化学习", "状态-动作-奖励", "序列决策", "Q-Learning、PPO、DQN"],
          ],
        },
      },
      {
        title: "2. 线性回归：拟合数据的直线",
        body: `线性回归（Linear Regression）是机器学习中最基础的回归算法，也是理解所有监督学习的起点。它的假设非常简单：目标变量 y 与输入特征 x₁, x₂, ..., xₚ 之间存在线性关系。

对于单个特征的情况（简单线性回归），模型形式为：ŷ = w·x + b，其中 w 是斜率（权重），b 是截距（偏置）。当有多个特征时，模型扩展为多元线性回归：ŷ = w₁x₁ + w₂x₂ + ... + wₚxₚ + b，写成矩阵形式即 ŷ = Xw + b。

训练线性回归模型的核心是找到最优的 w 和 b，使得预测值 ŷ 尽可能接近真实值 y。这通过最小化损失函数来实现，最常用的损失函数是均方误差（Mean Squared Error, MSE）。

MSE 损失函数的数学表达为：L(w, b) = (1/n) Σᵢ(yᵢ - ŷᵢ)² = (1/n) Σᵢ(yᵢ - w·xᵢ - b)²。选择 MSE 的原因有三：其一，它对大误差的惩罚更大（平方项），使得模型更关注 outliers；其二，MSE 是凸函数，保证了优化过程中不会陷入局部最优；其三，在误差服从正态分布的假设下，最小化 MSE 等价于极大似然估计。

求解线性回归有两种主要方法：解析法（正规方程）和数值法（梯度下降）。正规方程通过求导令梯度为零，直接得到闭式解：w* = (XᵀX)⁻¹Xᵀy。这种方法计算精确，但当特征维度很高时矩阵求逆的计算复杂度为 O(p³)，效率很低。梯度下降则通过迭代更新参数：w ← w - α·∂L/∂w，其中 α 是学习率。虽然需要更多迭代，但梯度下降可以处理大规模数据集，也是深度学习优化的基础。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt

# ===== 1. 生成模拟数据 =====
np.random.seed(42)
n = 100
X = 2 * np.random.rand(n, 1)  # 特征: [0, 2] 均匀分布
y = 4 + 3 * X + np.random.randn(n, 1)  # 真实关系: y = 4 + 3x + noise

# ===== 2. 正规方程求解 =====
X_b = np.c_[np.ones((n, 1)), X]  # 添加偏置列 x₀ = 1
w_best = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y
print(f"正规方程解: 截距={w_best[0][0]:.4f}, 斜率={w_best[1][0]:.4f}")

# ===== 3. 梯度下降求解 =====
alpha = 0.1  # 学习率
n_iterations = 1000
w = np.random.randn(2, 1)  # 随机初始化

for iteration in range(n_iterations):
    gradients = (2/n) * X_b.T @ (X_b @ w - y)
    w = w - alpha * gradients

print(f"梯度下降解: 截距={w[0][0]:.4f}, 斜率={w[1][0]:.4f}")

# ===== 4. 可视化 =====
plt.scatter(X, y, alpha=0.5, label='训练数据')
plt.plot(X, X_b @ w_best, 'r-', linewidth=2, label='正规方程')
plt.plot(X, X_b @ w, 'g--', linewidth=2, label='梯度下降')
plt.xlabel('x'); plt.ylabel('y')
plt.legend(); plt.title('线性回归对比')
plt.show()`,
          },
        ],
        tip: "正规方程和梯度下降在小数据集上给出几乎相同的结果。但当样本量超过 10 万时，梯度下降是唯一可行的方案。这也是为什么深度学习几乎全部使用梯度下降及其变体。",
      },
      {
        title: "3. 逻辑回归：分类的利器",
        body: `逻辑回归（Logistic Regression）虽然名字里带"回归"，但它实际上是一种分类算法，主要用于二分类问题（也可以扩展到多分类）。它是线性回归的自然延伸：既然线性回归输出连续值，那我们能不能把它"压缩"到 [0, 1] 区间，解释为属于某个类别的概率呢？

逻辑回归的核心是 Sigmoid 函数（也叫 Logistic 函数）：σ(z) = 1 / (1 + e⁻ᶻ)。这个函数具有完美的性质：输入 z 可以是任意实数，输出 σ(z) 始终在 (0, 1) 之间；当 z → +∞ 时 σ(z) → 1，当 z → -∞ 时 σ(z) → 0；在 z = 0 时 σ(z) = 0.5。

**逻辑回归的模型形式为**：P(y=1|x) = σ(w·x + b) = 1 / (1 + e⁻⁽ʷ·ˣ⁺ᵇ⁾)。模型输出的是样本属于正类的概率，我们通常以 0.5 为阈值：如果 P(y=1|x) ≥ 0.5，则预测为类别 1；否则预测为类别 0。这个决策边界对应于 w·x + b = 0，本质上是一个超平面。

逻辑回归使用对数似然（Log-Likelihood）作为优化目标，等价于最小化二元交叉熵损失（Binary Cross-Entropy）：L = -(1/n) Σᵢ[yᵢ·log(ŷᵢ) + (1-yᵢ)·log(1-ŷᵢ)]。这个损失函数有一个优雅的数学性质：它的梯度形式与线性回归的 MSE 梯度非常相似——∂L/∂w = (1/n) Σᵢ(ŷᵢ - yᵢ)·xᵢ，只是这里的 ŷᵢ 经过了 Sigmoid 变换。

**逻辑回归的优势在于**：模型简单、计算高效、输出概率可直接用于风险评估、特征权重具有良好的可解释性。尽管它只能学习线性决策边界，但通过特征工程（如添加多项式特征、交叉特征），逻辑回归可以拟合相当复杂的边界。在工业界，逻辑回归仍然是 CTR 预估、信用评分、医学诊断等领域的主力算法。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

# ===== 1. 生成二分类数据 =====
X, y = make_classification(
    n_samples=1000, n_features=10, n_informative=5,
    n_redundant=2, n_classes=2, random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ===== 2. 训练逻辑回归模型 =====
model = LogisticRegression(max_iter=1000, random_state=42)
model.fit(X_train, y_train)

# ===== 3. 评估 =====
y_pred = model.predict(X_test)
print(f"准确率: {accuracy_score(y_test, y_pred):.4f}")
print("\\n分类报告:")
print(classification_report(y_test, y_pred))

# ===== 4. 查看特征重要性 =====
print("\\n特征权重:")
for i, w in enumerate(model.coef_[0]):
    print(f"  特征 {i}: {w:+.4f}")`,
          },
        ],
        mermaid: `graph LR
    A["输入特征 x"] --> B["线性组合 z = w·x + b"]
    B --> C["Sigmoid: σ(z) = 1/(1+e⁻ᶻ)"]
    C --> D["概率 p ∈ (0,1)"]
    D --> E{"p ≥ 0.5?"}
    E -->|"是"| F["预测类别 1"]
    E -->|"否"| G["预测类别 0"]

    classDef func fill:#0c4a6e
    class B,C,D func`,
      },
      {
        title: "4. 决策树：像人类一样做决策",
        body: `决策树（Decision Tree）是最直观的机器学习算法之一。它的思维过程与人类做决策的方式高度一致：通过一系列"如果-那么"规则，逐步缩小范围，最终得出结论。

决策树是一种树形结构，由三种节点组成：根节点（包含全部训练数据）、内部节点（对某个特征进行测试）和叶节点（给出最终的预测结果）。从根到叶的每一条路径，就对应一条分类规则。

决策树的构建是一个递归的过程，核心问题有两个：第一，如何选择当前节点的最优划分特征？第二，何时停止生长（防止过拟合）？

对于第一个问题，决策树使用"不纯度"（Impurity）来衡量一个节点中样本的混杂程度。最常用的不纯度指标有两种：信息增益（Information Gain）和基尼不纯度（Gini Impurity）。信息增益基于信息论中的熵（Entropy）概念：H(D) = -Σₖ pₖ·log₂(pₖ)，其中 pₖ 是第 k 类样本在数据集 D 中的比例。熵越大，数据越混乱；熵为零，说明数据完全纯净。信息增益定义为划分前的熵减去划分后的条件熵：IG(D, A) = H(D) - Σᵥ(|Dᵥ|/|D|)·H(Dᵥ)。我们选择信息增益最大的特征进行划分。

基尼不纯度的计算更简单：Gini(D) = 1 - Σₖ pₖ²。它反映了从数据集中随机抽取两个样本，它们属于不同类别的概率。ID3 和 C4.5 算法使用信息增益（C4.5 还引入了信息增益率来克服信息增益偏向多值特征的缺陷），CART 算法使用基尼不纯度。

第二个问题——何时停止生长——涉及剪枝（Pruning）策略。如果不加限制，决策树会生长到每个叶节点只包含一个样本，导致严重的过拟合。剪枝分为预剪枝（Pre-pruning）和后剪枝（Post-pruning）。预剪枝在树生长过程中设置限制条件：最大深度、叶节点最小样本数、划分所需的最小信息增益等。后剪枝则先让树充分生长，然后自底向上地剪去不重要的子树，用验证集评估剪枝前后的效果。`,
        mermaid: `graph TD
    A["全部样本
性别?"] -->|"男"| B["年龄 ≥ 30?"]
    A -->|"女"| C["收入 ≥ 50k?"]
    B -->|"是"| D["购买 ✓"]
    B -->|"否"| E["不购买 ✗"]
    C -->|"是"| F["购买 ✓"]
    C -->|"否"| G["年龄段?"]
    G -->|"18-35"| H["购买 ✓"]
    G -->|"其他"| I["不购买 ✗"]

    classDef root fill:#c2410c,color:#fff
    classDef internal fill:#166534,color:#fff
    classDef leaf_yes fill:#1d4ed8,color:#fff
    classDef leaf_no fill:#374151,color:#fff
    class A root
    class B,C,G internal
    class D,F,H leaf_yes
    class E,I leaf_no`,
      },
      {
        title: "5. KNN：近朱者赤，近墨者黑",
        body: `K 近邻算法（K-Nearest Neighbors, KNN）可能是最简单的机器学习算法——它几乎没有"训练"过程。KNN 的核心思想可以概括为一句古话："近朱者赤，近墨者黑"。当需要对一个新样本进行分类时，我们只需在训练集中找到与它最相似的 K 个样本，然后让这 K 个"邻居"投票决定它的类别。

KNN 的关键技术细节有三点。第一，距离度量。最常用的是欧氏距离（Euclidean Distance）：d(x, x') = √Σⱼ(xⱼ - x'ⱼ)²。此外还有曼哈顿距离（L1 范数）、闵可夫斯基距离（泛化形式）和余弦相似度（适用于高维文本数据）。选择哪种距离度量取决于数据的特性：对于图像数据，欧氏距离通常效果不错；对于文本数据，余弦相似度更合适。

第二，K 值的选择。K 值过小（如 K=1），模型对噪声极其敏感，容易过拟合；K 值过大，决策边界会变得过于平滑，可能欠拟合。实践中常用交叉验证来选择最优 K 值。一个经验法则是取 K = √n（n 为训练样本数），然后根据验证集效果微调。

第三，计算效率。KNN 在预测阶段需要计算新样本与所有训练样本的距离，时间复杂度为 O(n·p)，其中 n 是样本数，p 是特征数。对于大规模数据集，这会成为瓶颈。常用的加速方法包括 KD 树、Ball 树和局部敏感哈希（LSH）。此外，KNN 对特征的尺度非常敏感，使用前必须进行标准化（Standardization）或归一化（Normalization）。

尽管 KNN 简单，但它有一个强大的理论保证：当训练样本趋于无穷大时，KNN 的误差率不会超过贝叶斯最优误差率的两倍。这使得 KNN 在许多实际场景中表现出色，尤其是在数据分布复杂、难以用参数模型捕捉的情况下。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from collections import Counter
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score

# ===== 1. 从零实现 KNN =====
class MyKNN:
    def __init__(self, k=3):
        self.k = k
    
    def fit(self, X, y):
        self.X_train = X
        self.y_train = y
    
    def _distance(self, x1, x2):
        return np.sqrt(np.sum((x1 - x2) ** 2))  # 欧氏距离
    
    def predict(self, X):
        predictions = []
        for x in X:
            # 计算到所有训练样本的距离
            distances = [self._distance(x, x_train) for x_train in self.X_train]
            # 取最近的 k 个邻居
            k_indices = np.argsort(distances)[:self.k]
            k_labels = [self.y_train[i] for i in k_indices]
            # 投票
            most_common = Counter(k_labels).most_common(1)[0][0]
            predictions.append(most_common)
        return np.array(predictions)

# ===== 2. 在 Iris 数据集上测试 =====
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42
)

# 标准化（KNN 对尺度敏感！）
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# 自实现 KNN
my_knn = MyKNN(k=5)
my_knn.fit(X_train, y_train)
y_pred = my_knn.predict(X_test)
print(f"自实现 KNN 准确率: {accuracy_score(y_test, y_pred):.4f}")

# scikit-learn KNN
sk_knn = KNeighborsClassifier(n_neighbors=5)
sk_knn.fit(X_train, y_train)
print(f"sklearn KNN 准确率: {accuracy_score(y_test, sk_knn.predict(X_test)):.4f}")`,
          },
        ],
        tip: "KNN 的'训练'时间为 O(1)，但预测时间为 O(n·p)。如果你的应用场景需要低延迟预测，KNN 可能不是最佳选择。但对于快速原型验证和小数据集，KNN 是一个非常实用的基线模型。",
      },
      {
        title: "6. SVM：最大间隔分类器",
        body: `支持向量机（Support Vector Machine, SVM）是机器学习中最优雅的算法之一。它的核心思想可以用一句话概括：在所有能正确分类训练数据的超平面中，找到离两类样本都最远的那一个。这个"最远"的距离被称为间隔（Margin），SVM 寻找的就是最大间隔超平面。

为什么最大间隔很重要？直观上，间隔越大的分类器对新样本的泛化能力越强。想象两类数据之间有一条分界线，如果分界线紧贴着某一类的样本，那么新来的样本稍有偏差就可能被错误分类；而如果分界线离两类样本都很远，分类的鲁棒性就大大提高了。统计学习理论（Vapnik, 1995）严格证明了：最大间隔分类器的泛化误差上界与间隔大小成反比。

SVM 的数学模型可以表述为一个凸二次规划问题：最小化 (1/2)||w||²，约束条件为 yᵢ(w·xᵢ + b) ≥ 1（对所有训练样本）。求解这个问题后，我们发现一个关键事实：最优超平面只由一小部分训练样本决定，这些样本恰好位于间隔边界上，被称为"支持向量"（Support Vectors）。其他样本不影响最终的分类器——这就是 SVM 名称的由来。

SVM 最强大的特性是核技巧（Kernel Trick）。对于线性不可分的数据，SVM 可以通过核函数将数据隐式映射到高维特征空间，在高维空间中寻找线性分离超平面。常用的核函数包括：线性核 K(x, x') = x·x'（适用于线性可分或高维稀疏数据）、多项式核 K(x, x') = (γ·x·x' + r)ᵈ（适合图像分类）、径向基函数（RBF）核 K(x, x') = exp(-γ||x-x'||²)（最通用，适用于大多数场景）和 Sigmoid 核 K(x, x') = tanh(γ·x·x' + r)（在某些神经网络替代场景中有效）。

SVM 的超参数主要有两个：正则化参数 C（控制间隔最大化与分类错误之间的权衡，C 越大越不允许错分，但也可能过拟合）和核函数参数（如 RBF 核的 γ，控制单个样本的影响范围）。这两个参数通常通过网格搜索（Grid Search）结合交叉验证来选择。`,
        mermaid: `graph TD
    A["输入数据"] --> B{"线性可分?"}
    B -->|"是"| C["线性核 SVM"]
    B -->|"否"| D["选择核函数"]
    D --> E["多项式核"]
    D --> F["RBF 核"]
    D --> G["Sigmoid 核"]
    C --> H["求解凸二次规划"]
    E --> H
    F --> H
    G --> H
    H --> I["得到支持向量"]
    I --> J["构建最大间隔超平面"]
    J --> K["预测新样本"]

    classDef decision fill:#c2410c,color:#fff
    class B decision`,
      },
      {
        title: "7. 算法全面对比",
        body: `在实际项目中，选择哪种机器学习算法取决于数据规模、特征类型、可解释性需求、计算资源等多个因素。下面从多个维度对上述五种经典算法进行全面对比，帮助你建立直觉性的选择指南。

需要注意的是，没有"最好的"算法——只有最适合当前问题的算法。著名的"没有免费午餐定理"（No Free Lunch Theorem, Wolpert, 1996）严格证明了：在所有可能的问题上，所有算法的平均性能是相同的。这意味着算法的优劣是相对于具体问题而言的。

对于初学者，建议的学习路径是：先掌握线性回归和逻辑回归（理解损失函数和梯度下降），再学习决策树和 KNN（直观易懂），最后学习 SVM（数学要求较高但理论深刻）。在实践中，建议先用逻辑回归和随机森林作为基线，再根据具体需求选择更复杂的模型。`,
        table: {
          headers: ["算法", "任务类型", "时间复杂度", "可解释性", "对异常值敏感度", "适用场景"],
          rows: [
            ["线性回归", "回归", "训练 O(np²), 预测 O(p)", "★★★★★", "高（MSE 放大异常值）", "连续目标变量、特征与目标近似线性"],
            ["逻辑回归", "分类", "训练 O(np·iterations), 预测 O(p)", "★★★★★", "中等", "二分类、需要概率输出、特征工程充分"],
            ["决策树", "分类/回归", "训练 O(np·log n), 预测 O(log n)", "★★★★", "中等（剪枝后）", "非线性关系、需要可解释规则、混合特征类型"],
            ["KNN", "分类/回归", "训练 O(1), 预测 O(np)", "★★★", "低（局部投票）", "小数据集、复杂决策边界、快速原型验证"],
            ["SVM", "分类/回归", "训练 O(n²p)~O(n³p), 预测 O(SV·p)", "★★", "中等（软间隔）", "中小数据集、高维特征、核技巧处理非线性"],
          ],
        },
      },
      {
        title: "8. Python 实战：scikit-learn 完整工作流",
        body: `理论知识需要实践来巩固。下面我们将使用 scikit-learn 完成一个完整的机器学习工作流，包括数据加载、预处理、模型训练、交叉验证、超参数调优和模型评估。这个工作流适用于大多数监督学习任务，掌握它你就掌握了机器学习项目的基本套路。

scikit-learn 是 Python 生态中最流行的机器学习库，它提供了统一的 API 设计：所有模型都遵循 fit()（训练）、predict()（预测）、transform()（转换）三件套。这种一致性使得你可以轻松地在不同模型之间切换，只需改一行代码就能从逻辑回归换到 SVM。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from sklearn.datasets import load_breast_cancer, load_wine
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import warnings
warnings.filterwarnings('ignore')

# ===== 1. 加载数据 =====
data = load_breast_cancer()
X, y = data.data, data.target
print(f"数据集: {len(X)} 样本, {X.shape[1]} 特征")
print(f"类别分布: 良性={sum(y==1)}, 恶性={sum(y==0)}")

# ===== 2. 划分训练集/测试集 =====
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ===== 3. 标准化 =====
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ===== 4. 训练多个模型并对比 =====
models = {
    "逻辑回归": LogisticRegression(max_iter=1000, random_state=42),
    "决策树": DecisionTreeClassifier(random_state=42),
    "KNN (k=5)": KNeighborsClassifier(n_neighbors=5),
    "SVM (RBF)": SVC(kernel='rbf', random_state=42),
    "随机森林": RandomForestClassifier(n_estimators=100, random_state=42),
}

print("\\n" + "="*60)
print(f"{'模型':<15} {'交叉验证准确率':<18} {'测试集准确率':<15}")
print("="*60)

results = {}
for name, model in models.items():
    # 交叉验证
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
    # 训练和测试
    model.fit(X_train_scaled, y_train)
    test_acc = accuracy_score(y_test, model.predict(X_test_scaled))
    results[name] = (cv_scores.mean(), test_acc)
    print(f"{name:<15} {cv_scores.mean():.4f} (±{cv_scores.std():.4f})    {test_acc:.4f}")

# ===== 5. 对最优模型进行超参数调优 =====
best_model_name = max(results, key=lambda k: results[k][0])
print(f"\\n最佳模型（按 CV）: {best_model_name}")

if best_model_name == "SVM (RBF)":
    param_grid = {'C': [0.1, 1, 10], 'gamma': [0.001, 0.01, 0.1]}
    grid = GridSearchCV(SVC(random_state=42), param_grid, cv=5, scoring='accuracy')
    grid.fit(X_train_scaled, y_train)
    print(f"最优参数: {grid.best_params_}")
    print(f"最优 CV 准确率: {grid.best_score_:.4f}")
    print(f"\\n测试集详细报告:")
    print(classification_report(y_test, grid.predict(X_test_scaled), target_names=data.target_names))`,
          },
        ],
      },
      {
        title: "9. 模型选择指南",
        body: `面对一个新的机器学习问题，如何选择合适的算法？以下是一个实用的决策框架：

第一步，明确任务类型。是预测连续值（回归）还是离散类别（分类）？如果是分类，是二分类、多分类还是多标签分类？

第二步，评估数据规模。小数据集（< 10,000 样本）适合 SVM、KNN、逻辑回归；中等数据集适合决策树、随机森林、XGBoost；大数据集（> 100,000 样本）建议使用线性模型（SGDClassifier）、随机森林或梯度提升树。

第三步，考虑可解释性需求。如果需要向业务方解释模型决策，优先选择逻辑回归（特征权重直观）或决策树（规则清晰）。如果只需要预测精度，可以使用集成方法或 SVM。

第四步，分析特征类型。数值特征为主时，大多数算法都适用；类别特征较多时，决策树和随机森林天然支持；文本数据通常先用 TF-IDF 或词嵌入向量化，然后用逻辑回归或 SVM。

第五步，建立基线。无论最终选择什么复杂模型，都应该先用一个简单的基线模型（如逻辑回归或均值预测）作为参照。如果复杂模型不能显著超越基线，说明可能数据本身的信息量有限，或者特征工程需要改进。

**最后记住一条黄金法则**：特征工程 > 模型选择。好的特征（领域知识驱动的特征构造、合理的特征选择、恰当的特征变换）比模型本身的微小改进更有价值。在深度学习的时代，这条法则仍然成立。`,
        tip: "机器学习项目的成功公式：好的数据 + 好的特征 + 合适的模型 + 严谨的验证 = 可靠的预测。不要跳过任何一环。",
        warning: "常见陷阱：1）没有划分独立的测试集，用训练集评估导致过于乐观的结果；2）在特征选择或标准化之前划分数据，导致数据泄露；3）忽略类别不平衡问题，准确率虚高但实际模型偏向多数类；4）不做交叉验证，单次划分的结果可能受随机性影响。",
      },
    ],
};
