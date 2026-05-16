import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-003",
    title: "SVM 支持向量机详解",
    category: "ml",
    tags: ["监督学习", "分类", "核方法"],
    summary: "理解最大间隔分类器、核技巧与软间隔 SVM 的完整推导",
    date: "2026-04-05",
    readTime: "20 min",
    level: "进阶",
    content: [
      {
        title: "1. SVM 的核心直觉：最大间隔分类器",
        body: `支持向量机（Support Vector Machine, SVM）是机器学习中最优雅、理论最完备的分类算法之一。它的核心思想可以用一句话概括：在所有能将两类数据分开的超平面中，选择离两类数据都最远的那个。

想象你在两张桌子之间放一块木板，把两堆球分开。你可以倾斜木板，可以前后移动——但只要能把球分开，从数学上说都是"可行"的分类器。但 SVM 会问：哪种摆放方式最稳健？答案是：让木板到最近的红球和最近的蓝球的距离都最大化。这个距离就是间隔（Margin），而距离木板最近的那些球就是支持向量（Support Vectors）——它们"支撑"着最优超平面的位置。

为什么最大化间隔是好事？从统计学习理论（VC 维）的角度，间隔越大，模型的泛化能力越强。直觉上也很合理：如果你的分类边界离数据点很远，那么即使新数据略有扰动，也不太会跨越边界被分错类。`,
        mermaid: `graph LR
    A["训练数据"] --> B["寻找分类超平面"]
    B --> C["计算每个候选超平面的间隔"]
    C --> D["选择最大间隔超平面"]
    D --> E["支持向量确定边界"]
    E --> F["新样本分类"]
    class F s2
    class D s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
        tip: "关键洞察：SVM 的最终决策只依赖于支持向量（那些离边界最近的样本），与远离边界的样本无关。这意味着 SVM 对异常值有一定的鲁棒性——只要异常值不是支持向量。",
      },
      {
        title: "2. 数学推导：从几何间隔到优化问题",
        body: `SVM 的数学推导是机器学习中教科书级别的优化问题。我们一步步来看。

首先定义超平面：w·x + b = 0，其中 w 是法向量，b 是偏置。样本 (xᵢ, yᵢ)，yᵢ ∈ {-1, +1}。分类正确的条件是 yᵢ(w·xᵢ + b) > 0。

点 xᵢ 到超平面的几何距离是 |w·xᵢ + b| / ||w||。我们要求所有样本都被正确分类且间隔至少为 γ，即 yᵢ(w·xᵢ + b) / ||w|| ≥ γ。通过缩放 w 和 b（不改变超平面），可以令函数间隔 yᵢ(w·xᵢ + b) = 1，此时几何间隔 γ = 1/||w||。

最大化间隔 γ = 1/||w|| 等价于最小化 ||w||，等价于最小化 (1/2)||w||²。为什么要加 1/2？因为求导时 2 会被消掉，让后续推导更简洁。

这就得到了 SVM 的原始优化问题：min (1/2)||w||²，subject to yᵢ(w·xᵢ + b) ≥ 1, ∀i。这是一个凸二次规划问题，有唯一的全局最优解。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from scipy.optimize import minimize

class SVMFromScratch:
    """从零实现线性 SVM（使用凸优化求解器）"""
    
    def __init__(self, C=1.0):
        self.C = C
        self.w = None
        self.b = None
        self.support_vectors = None
    
    def _objective(self, params, X, y):
        """目标函数: (1/2)||w||^2 + C * Σhinge_loss"""
        n_features = X.shape[1]
        w = params[:n_features]
        b = params[n_features]
        
        # 正则化项
        reg = 0.5 * np.dot(w, w)
        
        # Hinge loss: max(0, 1 - y_i(w·x_i + b))
        margins = y * (X @ w + b)
        hinge = np.maximum(0, 1 - margins)
        
        return reg + self.C * np.sum(hinge)
    
    def _gradient(self, params, X, y):
        """目标函数的梯度"""
        n_features = X.shape[1]
        w = params[:n_features]
        b = params[n_features]
        
        grad_w = w.copy()
        grad_b = 0.0
        
        margins = y * (X @ w + b)
        violated = margins < 1  # hinge loss 非零的样本
        
        grad_w -= self.C * np.sum(
            (y[violated] * X[violated].T), axis=1
        )
        grad_b -= self.C * np.sum(y[violated])
        
        return np.append(grad_w, grad_b)
    
    def fit(self, X, y):
        n_samples, n_features = X.shape
        params = np.zeros(n_features + 1)
        
        result = minimize(
            self._objective, params,
            args=(X, y),
            jac=self._gradient,
            method='L-BFGS-B'
        )
        
        self.w = result.x[:n_features]
        self.b = result.x[n_features]
        
        # 找出支持向量（间隔 ≈ 1 的样本）
        margins = np.abs(y * (X @ self.w + self.b))
        sv_mask = margins < 1.01
        self.support_vectors = X[sv_mask]
        
        return self
    
    def predict(self, X):
        return np.sign(X @ self.w + self.b)
    
    def decision_function(self, X):
        """返回到超平面的距离（符号表示类别）"""
        return X @ self.w + self.b

# 测试
from sklearn.datasets import make_classification
X, y = make_classification(n_samples=200, n_features=2,
                           n_redundant=0, random_state=42)
y = y * 2 - 1  # 转换为 {-1, +1}

svm = SVMFromScratch(C=1.0)
svm.fit(X, y)
print(f"支持向量数量: {len(svm.support_vectors)}")
print(f"权重 w: {svm.w}")
print(f"偏置 b: {svm.b:.4f}")`,
          },
        ],
      },
      {
        title: "3. 对偶问题与 KKT 条件",
        body: `为什么要求解对偶问题？有三个关键原因：第一，对偶问题将优化变量的数量从样本维度转换为样本数量，当特征维度很高时（如文本分类），对偶问题更高效；第二，对偶问题天然地引入了核技巧（Kernel Trick），让我们能够处理非线性分类；第三，对偶问题的解直接揭示了哪些样本是支持向量。

使用拉格朗日乘子法，引入乘子 αᵢ ≥ 0，构造拉格朗日函数：L(w, b, α) = (1/2)||w||² - Σαᵢ[yᵢ(w·xᵢ + b) - 1]。

对 w 和 b 分别求偏导并令其为零，得到：w = Σαᵢyᵢxᵢ 和 Σαᵢyᵢ = 0。代回拉格朗日函数，消去 w 和 b，得到对偶问题：

max Σαᵢ - (1/2)ΣΣαᵢαⱼyᵢyⱼ(xᵢ·xⱼ)，subject to αᵢ ≥ 0, Σαᵢyᵢ = 0。

注意 xᵢ·xⱼ 只以内积形式出现——这就是核技巧的入口！如果我们将 xᵢ·xⱼ 替换为 K(xᵢ, xⱼ)，就等价于在高维特征空间中做线性 SVM，而无需显式计算高维映射。

KKT 互补松弛条件告诉我们：αᵢ > 0 当且仅当 yᵢ(w·xᵢ + b) = 1，即该样本恰好落在间隔边界上——它就是支持向量。`,
        code: [
          {
            lang: "python",
            code: `# 使用 SMO（Sequential Minimal Optimization）简化求解
# SMO 的核心思想：每次只优化两个 α，解析求解

def smo_svm(X, y, C=1.0, tol=1e-3, max_passes=20):
    """简化版 SMO 算法"""
    n = len(y)
    alphas = np.zeros(n)
    b = 0.0
    passes = 0
    
    def kernel(xi, xj):
        return np.dot(xi, xj)  # 线性核
    
    def compute_E(i):
        """计算预测误差"""
        return sum(
            alphas[j] * y[j] * kernel(X[j], X[i])
            for j in range(n)
        ) + b - y[i]
    
    while passes < max_passes:
        num_changed = 0
        
        for i in range(n):
            Ei = compute_E(i)
            
            # 检查是否违反 KKT 条件
            if ((y[i] * Ei < -tol and alphas[i] < C) or
                (y[i] * Ei > tol and alphas[i] > 0)):
                
                # 选择第二个 α
                j = np.random.randint(0, n)
                while j == i:
                    j = np.random.randint(0, n)
                
                Ej = compute_E(j)
                alpha_i_old, alpha_j_old = alphas[i], alphas[j]
                
                # 计算 L 和 H 边界
                if y[i] != y[j]:
                    L = max(0, alphas[j] - alphas[i])
                    H = min(C, C + alphas[j] - alphas[i])
                else:
                    L = max(0, alphas[i] + alphas[j] - C)
                    H = min(C, alphas[i] + alphas[j])
                
                if L == H:
                    continue
                
                # 计算最优 α_j
                eta = (2 * kernel(X[i], X[j]) -
                       kernel(X[i], X[i]) -
                       kernel(X[j], X[j]))
                if eta >= 0:
                    continue
                
                alphas[j] -= y[j] * (Ei - Ej) / eta
                alphas[j] = np.clip(alphas[j], L, H)
                
                if abs(alphas[j] - alpha_j_old) < 1e-5:
                    continue
                
                alphas[i] += y[i] * y[j] * (alpha_j_old - alphas[j])
                num_changed += 1
        
        passes = passes + 1 if num_changed == 0 else 0
    
    return alphas, b

# 测试
X = np.array([[1, 2], [2, 3], [3, 3], [2, 1], [3, 2]])
y = np.array([1, 1, 1, -1, -1])
alphas, b = smo_svm(X, y, C=1.0)
print(f"Alpha: {alphas}")
print(f"支持向量索引: {np.where(alphas > 1e-3)[0]}")
print(f"b = {b:.4f}")`,
          },
        ],
        table: {
          headers: ["概念", "含义", "在 SVM 中的作用"],
          rows: [
            ["拉格朗日乘子 αᵢ", "每个约束的权重", "αᵢ > 0 的样本是支持向量"],
            ["对偶问题", "原问题的等价变形", "引入核技巧，降低维度"],
            ["KKT 互补松弛", "αᵢ·(约束余量) = 0", "识别支持向量的理论依据"],
            ["SMO 算法", "每次优化两个 α", "高效求解大规模 SVM"],
          ],
        },
      },
      {
        title: "4. 核技巧：从线性到非线性的魔法",
        body: `核技巧是 SVM 最强大的特性。它的核心洞察是：如果我们在优化问题中只看到数据的内积 xᵢ·xⱼ，那么我们可以用任何一个核函数 K(xᵢ, xⱼ) 来替代内积，这等价于先将数据映射到一个高维（甚至无限维）特征空间 φ(x)，然后在那个空间中做线性 SVM。

数学表达：K(xᵢ, xⱼ) = φ(xᵢ)·φ(xⱼ)。关键在于，我们不需要知道 φ 具体是什么——只要 K 满足 Mercer 条件（对应的核矩阵半正定），就存在对应的 φ。

常用核函数：线性核 K(x,z) = x·z（等价于原始线性 SVM）；多项式核 K(x,z) = (γx·z + r)^d（能捕捉特征间的交互作用）；RBF（径向基函数）核 K(x,z) = exp(-γ||x-z||²)（将数据映射到无限维空间，是最常用的核函数）；Sigmoid 核 K(x,z) = tanh(γx·z + r)（类似两层神经网络的激活）。

RBF 核为何如此强大？直观理解：它在每个训练样本周围放置一个高斯"小山包"，新的样本根据与各个训练样本的距离获得不同的"高度"。这意味着 RBF SVM 实际上在做某种形式的模板匹配——新样本离哪个类别的训练样本更近，就更可能被分入该类别。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.svm import SVC
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split

# 生成非线性可分数据
X, y = make_moons(n_samples=300, noise=0.15, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 对比不同核函数
kernels = {
    'linear': SVC(kernel='linear', C=1.0),
    'poly (d=3)': SVC(kernel='poly', degree=3, C=1.0),
    'rbf': SVC(kernel='rbf', C=1.0, gamma='scale'),
    'sigmoid': SVC(kernel='sigmoid', C=1.0, gamma='scale'),
}

print("不同核函数在 Moon 数据集上的表现：")
print("-" * 45)
for name, model in kernels.items():
    model.fit(X_train, y_train)
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    n_sv = model.n_support_.sum()
    print(f"{name:12s} | 训练: {train_acc:.3f} | "
          f"测试: {test_acc:.3f} | 支持向量: {n_sv}")

# RBF 核的 gamma 参数影响
print("\\nRBF 核 gamma 参数影响：")
for gamma in [0.1, 1.0, 10.0, 100.0]:
    svm = SVC(kernel='rbf', gamma=gamma, C=1.0)
    svm.fit(X_train, y_train)
    print(f"  gamma={gamma:6.1f} | "
          f"训练: {svm.score(X_train, y_train):.3f} | "
          f"测试: {svm.score(X_test, y_test):.3f} | "
          f"SV: {svm.n_support_.sum()}")`,
          },
        ],
        table: {
          headers: ["核函数", "公式", "超参数", "适用场景", "计算复杂度"],
          rows: [
            ["线性核", "x·z", "无", "线性可分、高维稀疏数据", "O(d)"],
            ["多项式核", "(γx·z+r)^d", "d, γ, r", "图像识别、文本分类", "O(d)"],
            ["RBF 核", "exp(-γ||x-z||²)", "γ", "通用、非线性分类", "O(d)"],
            ["Sigmoid 核", "tanh(γx·z+r)", "γ, r", "神经网络替代", "O(d)"],
          ],
        },
        warning: "核函数选择的经验法则：如果特征数 >> 样本数（如文本分类），用线性核；如果样本数 >> 特征数，用 RBF 核；不确定时，先试 RBF 核，它几乎总是比线性核好。",
      },
      {
        title: "5. 软间隔 SVM：处理非完美可分数据",
        body: `真实世界的数据几乎从来不是完美线性可分的。硬间隔 SVM 要求所有样本都满足 yᵢ(w·xᵢ + b) ≥ 1，这在有噪声或重叠的数据中是不可能的——优化问题无解。

软间隔 SVM 通过引入松弛变量 ξᵢ ≥ 0 来解决这个问题：允许某些样本违反间隔约束，但要付出代价。优化问题变为：

min (1/2)||w||² + C·Σξᵢ，subject to yᵢ(w·xᵢ + b) ≥ 1 - ξᵢ, ξᵢ ≥ 0。

参数 C 是关键：C 很大时，模型倾向于减少 ξᵢ（减少误分类），间隔变窄，容易过拟合；C 很小时，模型允许更多的 ξᵢ（容忍误分类），间隔变宽，泛化能力更强但可能有更多训练误差。

这本质上是在偏差-方差之间做权衡。C 是 SVM 最重要的超参数，通常通过交叉验证在 {0.001, 0.01, 0.1, 1, 10, 100} 的网格中搜索。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import load_breast_cancer

# 加载数据
X, y = load_breast_cancer(return_X_y=True)
y = y * 2 - 1  # 转换为 {-1, +1}

# 标准化（SVM 对量纲敏感！）
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 网格搜索最佳 C 和 gamma
param_grid = {
    'C': [0.01, 0.1, 1, 10, 100],
    'kernel': ['rbf', 'linear'],
    'gamma': ['scale', 'auto', 0.001, 0.01, 0.1],
}

grid = GridSearchCV(
    SVC(), param_grid,
    cv=5, scoring='accuracy',
    n_jobs=-1, verbose=1
)
grid.fit(X_scaled, y)

print(f"最佳参数: {grid.best_params_}")
print(f"最佳 CV 准确率: {grid.best_score_:.4f}")

# 不同 C 值的决策边界变化
print("\\nC 值对模型的影响：")
for C_val in [0.01, 0.1, 1, 10, 100]:
    svm = SVC(kernel='rbf', C=C_val, gamma='scale')
    svm.fit(X_scaled, y)
    print(f"  C={C_val:5.2f} | "
          f"准确率: {svm.score(X_scaled, y):.4f} | "
          f"支持向量: {svm.n_support_.sum()}")`,
          },
        ],
      },
      {
        title: "6. SVM 与其他分类算法对比",
        body: `SVM 并不是在所有场景下都是最优选择。理解它与其他算法的优缺点对比，能帮助你在实际问题中做出正确的选择。

相比逻辑回归：SVM 只关注支持向量（边界附近的样本），而逻辑回归考虑所有样本。当数据有明显的边界时，SVM 往往更好；当需要概率输出时，逻辑回归更合适。SVM 通过核技巧能处理非线性，而逻辑回归需要手动构造非线性特征。

相比神经网络：SVM 在小数据集（< 10K 样本）上通常优于神经网络，因为它有坚实的理论保证和凸优化保证（全局最优）。但在大数据集上，神经网络的可扩展性和表示能力远超 SVM。现代深度学习中，SVM 主要被用作最后一层的分类器（替代 softmax），这被称为 SVM 头。`,
        table: {
          headers: ["算法", "数据规模", "非线性能力", "可解释性", "训练速度", "内存"],
          rows: [
            ["逻辑回归", "大", "弱（需手工特征）", "高（系数即权重）", "快", "低"],
            ["SVM (线性)", "中", "弱", "中（支持向量解释）", "快", "中"],
            ["SVM (RBF)", "中", "强（自动）", "低", "中", "O(n²) 存储核矩阵"],
            ["决策树", "中-大", "强", "高", "快", "低"],
            ["随机森林", "大", "强", "中（特征重要性）", "中（可并行）", "中"],
            ["神经网络", "大-超大", "极强", "低（黑盒）", "慢（需 GPU）", "高"],
          ],
        },
        list: [
          "样本量 < 10K，SVM 通常优于神经网络",
          "高维稀疏数据（文本），线性 SVM 是最好的基线之一",
          "需要概率输出时，用 Platt Scaling 或校准后的 SVM",
          "大数据场景下，用 LinearSVC 或 SGDClassifier 替代传统 SVM",
          "SVM 对特征标准化非常敏感——训练前必须 StandardScaler",
        ],
      },
      {
        title: "7. SVM 的实际应用场景",
        body: `尽管深度学习在很多领域占据主导地位，SVM 在以下场景中仍然是首选或强竞争力的方案。

文本分类：高维稀疏的文本数据（TF-IDF 特征）是线性 SVM 的"甜点"。SVM 在高维空间中的表现非常优秀，且不会因为维度灾难而退化。在垃圾邮件检测、情感分析、新闻分类等任务中，线性 SVM 常常达到或接近深度学习模型的效果，但训练速度快几个数量级。

生物信息学：基因表达数据分析、蛋白质分类、DNA 序列分析。这些场景通常样本量小（几十到几百）、特征维度高（数千到数万），正是 SVM 的优势区间。

图像分类（小样本）：当标注数据有限时，SVM + 手工特征（HOG、SIFT）仍然是可靠的方案。在工业检测、医疗影像等数据获取成本高的领域，SVM 配合迁移学习的特征提取器效果很好。`,
        mermaid: `graph TD
    A["选择分类器"] --> B{"数据规模？"}
    B -->|< 10K| C{"特征类型？"}
    B -->|> 100K| D["深度学习 / 集成学习"]
    C -->|高维稀疏| E["线性 SVM"]
    C -->|低维稠密| F{"需要概率？"}
    F -->|是| G["逻辑回归 / 校准 SVM"]
    F -->|否| H["RBF-SVM / 随机森林"]
    E --> I["文本分类、基因分析"]
    D --> J["图像、语音、NLP"]
    G --> K["金融风控、医疗诊断"]
    H --> L["通用分类任务"]`,
        tip: "实用建议：在 Kaggle 等数据科学竞赛中，先用线性 SVM 跑一个基线——如果效果已经很好，就不需要更复杂的模型。如果不够好，再尝试 RBF-SVM 或神经网络。",
      },
    ],
  };
