import { Article } from '../knowledge';

export const article: Article = {
  id: "math-002",
  title: "矩阵分解：SVD 与特征分解",
  category: "math",
  tags: ["矩阵分解", "SVD", "特征值"],
  summary: "从特征分解到奇异值分解，理解矩阵分解的核心方法",
  date: "2026-04-12",
  readTime: "18 min",
  level: "进阶",
  content: [
    {
      title: "1. 特征值与特征向量回顾",
      body: `特征值和特征向量是线性代数中最核心的概念之一。对于一个方阵 A，如果存在非零向量 v 和标量 lambda，使得 Av = lambda * v 成立，那么 v 就是 A 的特征向量，lambda 是对应的特征值。这个等式的几何含义是：矩阵 A 对特征向量 v 做线性变换时，v 的方向不变，只发生了伸缩变换，伸缩比例就是特征值。

特征值的求解通过特征方程 det(A - lambda * I) = 0 来完成，这是一个关于 lambda 的多项式方程，其根就是特征值。对于 n 阶矩阵，最多有 n 个特征值（计入重数）。特征向量则通过将每个特征值代入 (A - lambda * I)v = 0 来求解。特征值的大小和符号揭示了矩阵变换的关键性质：正特征值表示方向不变，负特征值表示方向反转，零特征值意味着矩阵是奇异的。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

# 构造一个 3x3 矩阵
A = np.array([[4, 1, 0],
              [1, 3, 1],
              [0, 1, 2]])

# 计算特征值和特征向量
eigenvalues, eigenvectors = np.linalg.eig(A)

print("特征值:", eigenvalues)
print("对应的特征向量:")
for i in range(len(eigenvalues)):
    print(f"  lambda_{i+1} = {eigenvalues[i]:.4f}")
    print(f"  v_{i+1} = {eigenvectors[:, i]}")`
        },
        {
          lang: "python",
          code: `# 验证特征方程 Av = lambda * v
for i in range(len(eigenvalues)):
    v = eigenvectors[:, i]
    lam = eigenvalues[i]
    Av = A @ v
    lv = lam * v
    error = np.linalg.norm(Av - lv)
    print(f"验证 lambda_{i+1}: ||Av - lambda*v|| = {error:.2e}")

# 特征值之和等于矩阵的迹
print(f"特征值之和: {np.sum(eigenvalues):.4f}")
print(f"矩阵的迹:   {np.trace(A):.4f}")`
        }
      ],
      table: {
        headers: ["特征值性质", "含义", "实例"],
        rows: [
          ["lambda > 0", "变换后方向不变，向量被拉伸或压缩", "lambda = 5 表示放大 5 倍"],
          ["lambda < 0", "变换后方向反转", "lambda = -2 表示反转并放大 2 倍"],
          ["lambda = 0", "向量被压缩到零空间", "矩阵不满秩，存在零空间"],
          ["|lambda| > 1", "迭代系统发散", "幂迭代法收敛到最大特征值"]
        ]
      },
      mermaid: `graph TD
    A["方阵 A"] --> B["特征方程 det(A-lambda*I)=0"]
    B --> C["求解特征值 lambda"]
    C --> D["代入 (A-lambda*I)v=0"]
    D --> E["求解特征向量 v"]
    E --> F["验证 Av = lambda*v"]
    F --> G["得到完整的特征系统"]`,
      tip: "对于对称矩阵，特征值一定是实数，特征向量两两正交，这是非常重要的性质。",
      warning: "数值计算中，当矩阵接近奇异时，特征值的计算可能不稳定，建议使用 np.linalg.eigh 处理对称矩阵。"
    },
    {
      title: "2. 特征分解（对角化）",
      body: `特征分解是将一个方阵分解为 A = P * D * P^(-1) 的形式，其中 D 是对角矩阵，对角线上的元素就是特征值，P 的列是对应的特征向量。特征分解存在的前提是矩阵 A 有 n 个线性无关的特征向量，这样的矩阵称为可对角化矩阵。

对角化的核心意义在于简化矩阵的幂运算和指数运算。当 A = PDP^(-1) 时，A 的 k 次幂等于 P * D^k * P^(-1)，而对角矩阵的幂运算非常简单，只需将对角线上的每个元素做 k 次幂即可。这在马尔可夫链、动力系统分析等领域有广泛应用。此外，矩阵指数 exp(A) 也可以通过特征分解高效计算为 P * exp(D) * P^(-1)。对于实对称矩阵，P 是正交矩阵，此时 P^(-1) 等于 P 的转置，分解形式简化为 A = PDP^T。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

# 可对角化的矩阵
A = np.array([[5, 2],
              [2, 3]])

# 特征分解
eigenvalues, P = np.linalg.eig(A)
D = np.diag(eigenvalues)

# 验证 A = P * D * P^(-1)
P_inv = np.linalg.inv(P)
A_reconstructed = P @ D @ P_inv

print("原始矩阵 A:")
print(A)
print("重构矩阵 PDP^(-1):")
print(np.round(A_reconstructed, 10))
print("重构误差:", np.linalg.norm(A - A_reconstructed))`
        },
        {
          lang: "python",
          code: `# 利用特征分解计算矩阵的幂
A = np.array([[5, 2],
              [2, 3]])

eigenvalues, P = np.linalg.eig(A)
D = np.diag(eigenvalues)
P_inv = np.linalg.inv(P)

# 计算 A^10
k = 10
D_k = np.diag(eigenvalues ** k)
A_k = P @ D_k @ P_inv

print(f"A^10 (通过特征分解):")
print(np.round(A_k, 4))
print(f"A^10 (直接计算):")
print(np.round(np.linalg.matrix_power(A, k), 4))
print("误差:", np.linalg.norm(A_k - np.linalg.matrix_power(A, k)))`
        }
      ],
      table: {
        headers: ["矩阵类型", "可对角化条件", "分解形式"],
        rows: [
          ["一般方阵", "有 n 个线性无关特征向量", "A = PDP^(-1)"],
          ["实对称矩阵", "一定可对角化", "A = PDP^T"],
          ["正规矩阵", "AA^T = A^T*A", "A = UDU^H"],
          ["亏损矩阵", "特征向量不足 n 个", "不可对角化，需 Jordan 分解"]
        ]
      },
      mermaid: `graph LR
    A["方阵 A"] --> B["可对角化?"]
    B -->|是| C["A = PDP^(-1)"]
    B -->|否| D["Jordan 标准型"]
    C --> E["A^k = PD^kP^(-1)"]
    C --> F["exp(A) = P*exp(D)*P^(-1)"]
    E --> G["简化计算"]
    F --> G`,
      tip: "实际编程中，对于对称矩阵使用 np.linalg.eigh 而非 np.linalg.eig，前者利用对称性更高效且数值更稳定。",
      warning: "不是所有矩阵都可对角化。典型的反例是 Jordan 块矩阵 [[1,1],[0,1]]，它只有一个特征值 1 和一个线性无关的特征向量。"
    },
    {
      title: "3. 奇异值分解 SVD",
      body: `奇异值分解是线性代数中最强大的分解方法之一。与特征分解只适用于方阵不同，SVD 可以作用于任意形状的矩阵。对于 m 行 n 列的矩阵 A，SVD 将其分解为三个矩阵的乘积：A = U * Sigma * V^T，其中 U 是 m 行 m 列的正交矩阵，Sigma 是 m 行 n 列的对角矩阵，V 是 n 行 n 列的正交矩阵。

Sigma 对角线上的元素称为奇异值，它们都是非负实数，按从大到小的顺序排列。奇异值的平方等于 A^T * A 的特征值。U 的列向量称为左奇异向量，是 A * A^T 的特征向量；V 的列向量称为右奇异向量，是 A^T * A 的特征向量。SVD 的普适性使其成为数据分析、信号处理、推荐系统等领域的基础工具。任意矩阵都存在 SVD，这是它比特征分解更具优势的关键所在。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

# 任意形状的矩阵 (4x3)
A = np.array([[3, 1, 1],
              [1, 3, 1],
              [1, 1, 3],
              [0, 2, 2]])

# SVD 分解
U, sigma, VT = np.linalg.svd(A, full_matrices=False)

print("左奇异向量 U 的形状:", U.shape)
print("奇异值:", sigma)
print("右奇异向量 V^T 的形状:", VT.shape)

# 验证 A = U * Sigma * V^T
Sigma = np.diag(sigma)
A_reconstructed = U @ Sigma @ VT
print("重构误差:", np.linalg.norm(A - A_reconstructed))`
        },
        {
          lang: "python",
          code: `# 奇异值与特征值的关系
A = np.array([[3, 1, 1],
              [1, 3, 1],
              [1, 1, 3],
              [0, 2, 2]])

# 通过 A^T * A 的特征值求奇异值
ATA = A.T @ A
eigenvalues_ATA = np.linalg.eigvalsh(ATA)
singular_values_from_eigen = np.sqrt(np.abs(eigenvalues_ATA[::-1]))

# 直接 SVD
_, sigma, _ = np.linalg.svd(A, full_matrices=False)

print("通过特征值计算的奇异值:", singular_values_from_eigen)
print("直接 SVD 的奇异值:     ", sigma)
print("误差:", np.linalg.norm(singular_values_from_eigen - sigma))`
        }
      ],
      table: {
        headers: ["对比维度", "特征分解", "奇异值分解 SVD"],
        rows: [
          ["适用矩阵", "仅方阵", "任意形状矩阵"],
          ["分解结果", "P * D * P^(-1)", "U * Sigma * V^T"],
          ["对角元素", "可能为负或复数", "非负实数，降序排列"],
          ["正交性", "一般不正交（对称矩阵除外）", "U 和 V 都是正交矩阵"],
          ["存在性", "不一定存在", "任何矩阵都存在"]
        ]
      },
      mermaid: `graph TD
    A["任意矩阵 A (mxn)"] --> B["计算 A^T*A"]
    A --> C["计算 A*A^T"]
    B --> D["A^T*A 的特征向量 -> V"]
    B --> E["A^T*A 的特征值开方 -> Sigma"]
    C --> F["A*A^T 的特征向量 -> U"]
    D --> G["A = U * Sigma * V^T"]
    E --> G
    F --> G`,
      tip: "紧凑 SVD（full_matrices=False）只计算必要的奇异向量，节省内存和计算时间，推荐在大多数场景使用。",
      warning: "当矩阵条件数很大时（最大奇异值/最小奇异值），矩阵接近奇异，SVD 结果可能对数值误差敏感。"
    },
    {
      title: "4. SVD 的几何解释",
      body: `从几何角度看，SVD 揭示了线性变换最本质的结构。任何线性变换都可以分解为三个连续的简单变换：首先是旋转或反射（V^T），然后是沿坐标轴方向的伸缩（Sigma），最后是另一个旋转或反射（U）。这种分解将复杂的线性变换拆解为我们容易理解的基本操作。

具体来说，对于一个二维空间中的单位圆，经过 V^T 变换后仍然是单位圆（正交变换不改变长度），经过 Sigma 变换后变成了椭圆，椭圆的半轴长度就是奇异值，最后经过 U 变换，椭圆被旋转到最终位置。这意味着任何线性变换都可以理解为旋转-伸缩-旋转的组合。奇异值的大小直接反映了变换在各个主方向上的拉伸程度，最大的奇异值对应最大的拉伸方向。这种几何理解对于理解条件数、矩阵秩、数据降维等概念至关重要。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

# 构造变换矩阵
A = np.array([[3, 1],
              [1, 2]])

# SVD 分解
U, sigma, VT = np.linalg.svd(A)

print("第一步 V^T (旋转):")
print(np.round(VT, 4))
print("第二步 Sigma (伸缩):")
print(np.diag(sigma))
print("第三步 U (旋转):")
print(np.round(U, 4))

# 验证每个步骤的几何性质
print(f"V^T 是正交矩阵: {np.allclose(VT @ VT.T, np.eye(2))}")
print(f"U 是正交矩阵: {np.allclose(U @ U.T, np.eye(2))}")`
        },
        {
          lang: "python",
          code: `# 用单位圆演示 SVD 的几何意义
theta = np.linspace(0, 2 * np.pi, 100)
circle = np.array([np.cos(theta), np.sin(theta)])  # 单位圆

A = np.array([[3, 1], [1, 2]])
U, sigma, VT = np.linalg.svd(A)

# 逐步变换
step1 = VT @ circle          # V^T: 旋转
step2 = np.diag(sigma) @ step1  # Sigma: 伸缩
step3 = U @ step2            # U: 旋转

print("单位圆上的点经 V^T 变换后仍为单位圆")
print("  最大半径:", np.max(np.linalg.norm(step1, axis=0)))
print("经 Sigma 伸缩后变为椭圆")
print("  长轴:", sigma[0])
print("  短轴:", sigma[1])
print("经 U 旋转后得到最终椭圆")
print("  中心不变，主轴方向由 U 的列向量决定")`
        }
      ],
      table: {
        headers: ["变换步骤", "矩阵", "几何效果", "保持不变的量"],
        rows: [
          ["第一步", "V^T", "旋转或反射", "向量长度和夹角"],
          ["第二步", "Sigma", "沿坐标轴伸缩", "坐标轴方向"],
          ["第三步", "U", "旋转或反射", "向量长度和夹角"],
          ["整体效果", "U*Sigma*V^T", "任意线性变换", "无（一般情况）"]
        ]
      },
      mermaid: `graph LR
    A["单位圆"] -->|"V^T 旋转"| B["单位圆"]
    B -->|"Sigma 伸缩"| C["椭圆 轴长=sigma"]
    C -->|"U 旋转"| D["最终椭圆"]
    class D s2
    class C s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12
    classDef s2 fill:#14532d`,
      tip: "奇异值的比值（最大/最小）就是矩阵的条件数，条件数越大，线性方程组求解越不稳定。",
      warning: "当最小奇异值为零时，矩阵是奇异的，线性方程组要么无解要么有无穷多解。"
    },
    {
      title: "5. PCA 与 SVD 的关系",
      body: `主成分分析（PCA）是最经典的降维方法，而 SVD 是实现 PCA 最常用且最稳定的数值方法。PCA 的目标是找到数据中方差最大的方向，将高维数据投影到低维子空间，同时保留尽可能多的信息。具体来说，PCA 寻找的是数据协方差矩阵的主要特征向量。

SVD 与 PCA 的关系非常紧密：对中心化后的数据矩阵 X 进行 SVD 分解得到 X = U * Sigma * V^T，那么 V 的列就是 PCA 的主成分方向，Sigma 的平方除以 (n-1) 就是协方差矩阵的特征值，也就是各主成分的方差。使用 SVD 而非直接计算协方差矩阵的特征分解的优势在于数值稳定性：SVD 避免了显式计算 X^T * X，而后者在条件数较大时会损失数值精度。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np
from sklearn.decomposition import PCA

# 生成示例数据
np.random.seed(42)
X = np.random.randn(100, 5)
X = X @ np.array([[2, 0, 0, 0, 0],
                  [0, 1.5, 0, 0, 0],
                  [0, 0, 1, 0, 0],
                  [0, 0, 0, 0.5, 0],
                  [0, 0, 0, 0, 0.2]])

# 方法一: 使用 sklearn 的 PCA
pca = PCA()
pca.fit(X)
print("sklearn PCA 主成分方差比:", pca.explained_variance_ratio_)

# 方法二: 使用 SVD
X_centered = X - X.mean(axis=0)
U, sigma, VT = np.linalg.svd(X_centered, full_matrices=False)

# 方差 = sigma^2 / (n-1)
variances = sigma**2 / (X.shape[0] - 1)
variance_ratio = variances / variances.sum()
print("SVD 方法方差比:         ", np.round(variance_ratio, 4))`
        },
        {
          lang: "python",
          code: `# 使用 SVD 进行数据降维
X_centered = X - X.mean(axis=0)
U, sigma, VT = np.linalg.svd(X_centered, full_matrices=False)

# 选择前 k 个主成分
k = 3
V_k = VT[:k, :]           # 前 k 个主成分方向
X_projected = X_centered @ V_k.T  # 投影到 k 维空间

print("原始数据形状:", X.shape)
print("降维后形状:", X_projected.shape)

# 重构数据（近似）
X_reconstructed = X_projected @ V_k + X.mean(axis=0)
reconstruction_error = np.linalg.norm(X - X_reconstructed)
print("重构误差:", reconstruction_error)

# 保留的方差比例
retained_variance = sigma[:k]**2 / sigma.sum()**2
print(f"前 {k} 个主成分保留的方差比例: {retained_variance:.4f}")`
        }
      ],
      table: {
        headers: ["方法", "计算方式", "数值稳定性", "适用场景"],
        rows: [
          ["协方差矩阵特征分解", "计算 X^T*X 再分解", "条件数大时不稳定", "低维数据"],
          ["SVD 方法", "直接分解 X", "数值稳定，推荐", "高维数据，通用"],
          ["随机 SVD", "近似 SVD", "对超大数据友好", "矩阵非常大时"],
          ["增量 PCA", "分批处理", "内存效率高", "数据无法全部载入内存"]
        ]
      },
      mermaid: `graph TD
    A["数据中心化 X"] --> B["SVD: X = U*S*V^T"]
    B --> C["V 的列 = 主成分方向"]
    B --> D["sigma^2/(n-1) = 主成分方差"]
    B --> E["U*S = 投影坐标"]
    C --> F["选择前 k 个主成分"]
    D --> F
    E --> F
    F --> G["降维完成"]`,
      tip: "实际应用中，推荐使用 SVD 方法实现 PCA，数值稳定性远优于直接计算协方差矩阵的特征分解。",
      warning: "PCA 前必须对数据中心化（减去均值），否则第一主成分可能只是均值方向而非最大方差方向。"
    },
    {
      title: "6. 矩阵分解的应用：推荐系统与图像压缩",
      body: `矩阵分解在工业界有着广泛的应用。在推荐系统中，用户-物品评分矩阵通常是非常稀疏的大矩阵，大部分元素缺失。通过矩阵分解（如 SVD 或其变种），可以将这个稀疏矩阵分解为低秩的用户特征矩阵和物品特征矩阵的乘积，从而预测缺失的评分值。这就是著名的协同过滤方法的核心思想。Netflix Prize 竞赛中的获胜方案就大量使用了矩阵分解技术。

在图像压缩中，SVD 提供了一种优雅的降维方案。一张灰度图片可以看作一个矩阵，对其进行 SVD 分解后，只保留前 k 个最大的奇异值及其对应的奇异向量，就可以用远少于原始数据的存储量来近似重构图像。奇异值衰减越快，压缩效果越好。这种方法被称为低秩近似，是 Eckart-Young 定理的直接应用：SVD 给出了 Frobenius 范数意义下的最优低秩近似。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

# 推荐系统: 矩阵分解预测评分
# 用户-物品评分矩阵 (部分已知)
R = np.array([[5, 3, 0, 1],
              [4, 0, 0, 1],
              [1, 1, 0, 5],
              [1, 0, 0, 4],
              [0, 1, 5, 4]], dtype=float)

# 用 SVD 做低秩近似 (忽略零值仅为演示)
U, sigma, VT = np.linalg.svd(R, full_matrices=False)

# 保留前 2 个奇异值
k = 2
R_approx = U[:, :k] @ np.diag(sigma[:k]) @ VT[:k, :]

print("原始评分矩阵:")
print(R)
print("低秩近似 (k=2):")
print(np.round(R_approx, 2))
print("预测用户1对物品3的评分:", round(R_approx[0, 2], 2))`
        },
        {
          lang: "python",
          code: `import numpy as np

# 图像压缩示例
# 模拟一张 100x100 的灰度图像
np.random.seed(42)
image = np.random.rand(100, 100)

# 添加结构使其更像真实图像
x = np.linspace(0, 4*np.pi, 100)
X, Y = np.meshgrid(x, x)
image = np.sin(X) * np.cos(Y) * 0.5 + 0.5

# SVD 分解
U, sigma, VT = np.linalg.svd(image, full_matrices=False)

# 不同 k 值下的压缩效果
for k in [5, 10, 20, 50]:
    compressed = U[:, :k] @ np.diag(sigma[:k]) @ VT[:k, :]
    error = np.linalg.norm(image - compressed) / np.linalg.norm(image)
    original_size = image.size
    compressed_size = k * (U.shape[0] + 1 + VT.shape[1])
    ratio = compressed_size / original_size * 100
    
    print(f"k={k:2d}: 相对误差={error:.4f}, 存储比例={ratio:.1f}%")`
        }
      ],
      table: {
        headers: ["应用场景", "矩阵含义", "分解目的", "关键技术"],
        rows: [
          ["推荐系统", "用户-物品评分矩阵", "预测缺失评分", "SVD/矩阵补全"],
          ["图像压缩", "像素矩阵", "降低存储需求", "低秩近似"],
          ["自然语言处理", "词-文档矩阵", "发现语义主题", "LSA/LSI"],
          ["信号处理", "观测数据矩阵", "分离信号与噪声", "PCA/子空间方法"]
        ]
      },
      mermaid: `graph TD
    A["原始大矩阵"] --> B["SVD 分解"]
    B --> C["保留前 k 个奇异值"]
    C --> D["低秩近似"]
    D --> E["推荐: 预测评分"]
    D --> F["压缩: 近似重构"]
    D --> G["降维: 提取特征"]`,
      tip: "Eckart-Young 定理保证了 SVD 低秩近似是最优的，没有其他秩-k 矩阵能以更小的误差逼近原矩阵。",
      warning: "推荐系统中直接使用 SVD 处理稀疏矩阵效果有限，实际推荐使用 ALS 或 SGD 优化的矩阵分解模型。"
    },
    {
      title: "7. NumPy 实战：SVD 分解与图像压缩",
      body: `本节通过完整的 NumPy 实战，演示如何使用 SVD 进行图像压缩。我们将一张灰度图像（以 Lenna 图像的经典结构为灵感，用程序生成测试图案）进行 SVD 分解，观察不同数量的奇异值对图像质量的影响。

SVD 图像压缩的核心思想是：奇异值按照从大到小的顺序排列，前几个奇异值通常包含了图像的主要信息（整体结构和明暗分布），后面的奇异值则对应细节和噪声。通过选择合适的 k 值，可以在图像质量和压缩率之间取得平衡。对于自然图像，奇异值通常衰减很快，这意味着用很少的奇异值就能获得不错的视觉效果。我们将从 SVD 分解开始，逐步展示低秩近似、压缩率计算、图像质量评估等完整流程。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

# 生成测试图像 (模拟带有条纹和渐变效果)
def generate_test_image(size=256):
    x = np.linspace(0, 1, size)
    y = np.linspace(0, 1, size)
    X, Y = np.meshgrid(x, y)
    
    # 组合多个频率成分
    img = (0.3 * np.sin(6 * np.pi * X) * np.cos(4 * np.pi * Y) +
           0.2 * np.sin(10 * np.pi * X + Y) +
           0.15 * np.cos(8 * np.pi * Y) +
           0.35 * (X + Y) / 2)
    img = (img - img.min()) / (img.max() - img.min())
    return img

image = generate_test_image(256)
print(f"图像大小: {image.shape}")
print(f"像素值范围: [{image.min():.3f}, {image.max():.3f}]")
print(f"原始存储量: {image.size} 个浮点数")`
        },
        {
          lang: "python",
          code: `# SVD 图像压缩完整流程
U, sigma, VT = np.linalg.svd(image, full_matrices=False)

print("奇异值分布:")
print(f"  最大奇异值: {sigma[0]:.4f}")
print(f"  最小奇异值: {sigma[-1]:.6f}")
print(f"  条件数: {sigma[0]/sigma[-1]:.2e}")
print(f"  前10个奇异值占总能量: {np.sum(sigma[:10]**2)/np.sum(sigma**2)*100:.2f}%")

# 不同 k 值的压缩效果
print("\\n压缩效果对比:")
print(f"{'k':>4} | {'相对误差':>8} | {'压缩率':>6} | {'PSNR':>6}")
print("-" * 40)

for k in [5, 10, 20, 50, 100]:
    approx = U[:, :k] @ np.diag(sigma[:k]) @ VT[:k, :]
    
    # 相对误差
    rel_error = np.linalg.norm(image - approx) / np.linalg.norm(image)
    
    # 压缩率
    original = image.size
    compressed = k * (U.shape[0] + 1 + VT.shape[1])
    ratio = compressed / original * 100
    
    # PSNR (峰值信噪比)
    mse = np.mean((image - approx)**2)
    psnr = 10 * np.log10(1.0 / mse) if mse > 0 else float('inf')
    
    print(f"{k:4d} | {rel_error:8.4f} | {ratio:5.1f}% | {psnr:6.1f}dB")`
        }
      ],
      table: {
        headers: ["k 值", "相对误差", "压缩率", "视觉效果"],
        rows: [
          ["5", "较大 (0.1+)", "< 5%", "只能看到模糊的整体轮廓"],
          ["10", "中等 (0.05)", "~ 8%", "主要结构可见，细节丢失"],
          ["20", "较小 (0.02)", "~ 15%", "质量可接受，部分模糊"],
          ["50", "很小 (0.005)", "~ 40%", "肉眼几乎看不出差异"],
          ["100", "极小 (< 0.001)", "~ 78%", "几乎无损"]
        ]
      },
      mermaid: `graph TD
    A["原始图像"] --> B["SVD 分解"]
    B --> C["分析奇异值分布"]
    C --> D["选择 k 值"]
    D --> E["低秩近似重构"]
    E --> F{"质量达标?"}
    F -->|否| D
    F -->|是| G["保存压缩结果"]`,
      tip: "对于彩色图像，可以对 R、G、B 三个通道分别进行 SVD 压缩，或者先转换到 YUV 空间后对亮度通道使用更大的 k 值。",
      warning: "SVD 压缩是无损分解但有损近似，与 JPEG 的 DCT 压缩不同，SVD 不是标准的图像压缩格式，不适合直接用于存储。"
    }
  ],
};
