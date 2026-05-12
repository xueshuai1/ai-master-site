import { Article } from '../knowledge';

export const article: Article = {
  id: "math-001",
  title: "线性代数：向量与矩阵",
  category: "math",
  tags: ["线性代数", "向量", "矩阵"],
  summary: "从向量空间到矩阵运算，掌握 AI 所需的线性代数基础",
  date: "2026-04-12",
  readTime: "18 min",
  level: "入门",
  content: [
    {
      title: "1. 向量与向量空间",
      body: `向量是线性代数的基本构建单元。一个向量可以看作是一组有序的数字，既可以表示空间中的方向和大小，也可以表示数据的特征。例如二维向量 [3, 4] 代表从原点出发，沿 x 轴走 3 个单位、沿 y 轴走 4 个单位到达的点。

向量空间（也叫线性空间）是一组向量的集合，满足加法和数乘封闭性。也就是说，空间内任意两个向量相加、任意向量乘以标量后，结果仍然在这个空间内。理解向量空间是后续学习线性变换、特征值等概念的基础。在机器学习中，每个样本的特征就是一个向量，整个数据集构成一个高维向量空间。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

# 创建向量
v1 = np.array([3, 4])
v2 = np.array([1, -2])

print(f"v1 = {v1}")
print(f"v2 = {v2}")
print(f"维度: {v1.shape}")`
        },
        {
          lang: "python",
          code: `# 向量空间的基
e1 = np.array([1, 0, 0])  # x 轴单位向量
e2 = np.array([0, 1, 0])  # y 轴单位向量
e3 = np.array([0, 0, 1])  # z 轴单位向量

# 任意三维向量可表示为基的线性组合
v = 3*e1 + 4*e2 + 5*e3
print(f"线性组合结果: {v}")`
        }
      ],
      table: {
        headers: ["概念", "数学表示", "物理意义"],
        rows: [
          ["标量", "a = 5", "只有大小，没有方向"],
          ["向量", "v = [3, 4]", "有大小和方向"],
          ["向量空间", "R^n", "满足线性封闭的向量集合"],
          ["基向量", "e1, e2, ..., en", "张成整个空间的最小向量组"]
        ]
      },
      mermaid: `graph TD
    A["标量 5"] --> B["向量 [3,4]"]
    B --> C["向量空间 R^2"]
    C --> D["基 e1=[1,0]"]
    C --> E["基 e2=[0,1]"]
    B --> F["线性组合 3e1+4e2"]`,
      tip: "把向量想象成箭头——起点在原点，终点坐标就是向量的分量。这种几何直觉对理解后续概念至关重要。",
      warning: "初学者常混淆向量的 '维度' 和 '模长'。维度是分量的个数，模长是向量的大小（长度）。"
    },
    {
      title: "2. 向量运算：加减、点积与叉积",
      body: `向量运算是线性代数的核心操作。向量加法遵循平行四边形法则：将两个向量的起点放在一起，以它们为邻边画平行四边形，对角线就是和向量。向量减法可以看作加上反向向量。

点积（内积）是两向量对应分量乘积之和，结果是一个标量。点积的几何意义是：a·b = |a||b|cos(θ)，其中 θ 是两向量夹角。当点积为零时，两向量正交（垂直）。点积在机器学习中无处不在——余弦相似度、注意力机制的核心都是点积运算。

叉积仅在三维空间中有定义，结果是垂直于两个输入向量的新向量，其模长等于两向量构成的平行四边形面积。叉积在计算机图形学中用于计算法向量。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# 向量加减
print(f"a + b = {a + b}")   # [5 7 9]
print(f"a - b = {a - b}")   # [-3 -3 -3]

# 点积（内积）
dot = np.dot(a, b)
print(f"a · b = {dot}")     # 32`
        },
        {
          lang: "python",
          code: `# 叉积
cross = np.cross(a, b)
print(f"a × b = {cross}")

# 夹角计算（通过点积）
cos_theta = dot / (np.linalg.norm(a) * np.linalg.norm(b))
theta = np.arccos(cos_theta)
print(f"夹角: {np.degrees(theta):.2f} 度")

# 余弦相似度
similarity = dot / (np.linalg.norm(a) * np.linalg.norm(b))
print(f"余弦相似度: {similarity:.4f}")`
        }
      ],
      table: {
        headers: ["运算", "输入", "输出类型", "几何意义"],
        rows: [
          ["加法", "v1 + v2", "向量", "平行四边形对角线"],
          ["减法", "v1 - v2", "向量", "从 v2 指向 v1 的向量"],
          ["点积", "a · b", "标量", "|a||b|cos(θ)"],
          ["叉积", "a × b", "向量", "垂直于 a 和 b 的向量"]
        ]
      },
      mermaid: `graph LR
    A["向量 a"] --> B["点积 a·b"]
    C["向量 b"] --> B
    B --> D["标量 32"]
    A --> E["叉积 a×b"]
    C --> E
    E --> F["向量 [-3,6,-3]"]`,
      tip: "在 NLP 中，词向量的相似度计算就是通过点积（或余弦相似度）完成的。两个语义相近的词，其向量点积结果更大。",
      warning: "叉积只适用于三维向量。对高维向量使用叉积会报错，需要改用外积（outer product）。"
    },
    {
      title: "3. 矩阵与矩阵运算",
      body: `矩阵是排列成矩形阵列的数字集合，可以看作向量的推广——矩阵的每一行或每一列都是一个向量。一个 m×n 的矩阵有 m 行 n 列。矩阵在计算机科学中极为重要：图像就是一个像素矩阵，神经网络的权重也是矩阵。

矩阵加法要求两个矩阵维度相同，对应位置元素相加。矩阵乘法（这里指逐元素乘法，也称 Hadamard 积）同样要求维度匹配。但更常用的矩阵乘法是行乘列的方式，一个 m×n 矩阵乘 n×p 矩阵得到 m×p 矩阵。

矩阵转置是将行变列、列变行的操作，记作 A^T。对称矩阵满足 A = A^T，即关于主对角线对称。单位矩阵 I 是对角线为 1、其余为 0 的方阵，它在矩阵乘法中的作用类似于标量中的 1。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# 矩阵加法
print(f"A + B =\n{A + B}")

# 矩阵转置
print(f"A 的转置 =\n{A.T}")

# 单位矩阵
I = np.eye(2)
print(f"单位矩阵 =\n{I}")`
        },
        {
          lang: "python",
          code: `# 逐元素乘法（Hadamard 积）
print(f"A * B =\n{A * B}")

# 标量乘法
print(f"3 * A =\n{3 * A}")

# 矩阵形状
print(f"A 的形状: {A.shape}")  # (2, 2)
print(f"A 的行数: {A.shape[0]}")
print(f"A 的列数: {A.shape[1]}")`
        }
      ],
      table: {
        headers: ["运算", "维度要求", "结果维度", "示例"],
        rows: [
          ["加法 A+B", "同维度 m×n", "m×n", "[1]+[2]=[3]"],
          ["转置 A^T", "任意 m×n", "n×m", "[[1,2]]^T=[[1],[2]]"],
          ["逐元素乘 A*B", "同维度 m×n", "m×n", "[2]*[3]=[6]"],
          ["标量乘 kA", "任意", "不变", "2*[1,2]=[2,4]"]
        ]
      },
      mermaid: `graph TD
    A["矩阵 A (2×2)"] --> B["转置 A^T (2×2)"]
    A --> C["A + B (2×2)"]
    A --> D["3A (2×2)"]
    A --> E["A * B (2×2)"]`,
      tip: "处理图像数据时，一张 28×28 的灰度图就是一个 28×28 矩阵。每个像素值就是矩阵的一个元素。",
      warning: "矩阵加法不满足维度不同的操作。一个 2×3 矩阵和一个 3×2 矩阵无法相加，会抛出 shape mismatch 错误。"
    },
    {
      title: "4. 矩阵乘法与线性变换",
      body: `矩阵乘法是线性代数中最重要的运算之一。矩阵 A（m×n）乘以矩阵 B（n×p）得到矩阵 C（m×p），其中 C 的第 i 行第 j 列元素等于 A 的第 i 行与 B 的第 j 列的点积。注意矩阵乘法不满足交换律：AB 通常不等于 BA。

矩阵乘法的几何意义是线性变换。任何矩阵都可以看作对空间的变换操作：旋转、缩放、剪切、投影等。例如，一个 2×2 矩阵可以将平面上的所有点映射到新的位置。深度学习中的全连接层本质上就是矩阵乘法加上偏置向量。

矩阵与向量相乘（A×v）表示对向量 v 施加线性变换 A。这是神经网络中数据流经每一层的核心操作——输入向量被权重矩阵变换，生成新的向量表示。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# 矩阵乘法
C = np.matmul(A, B)
# 或 C = A @ B
print(f"A @ B =\n{C}")

# 验证不满足交换律
print(f"B @ A =\n{B @ A}")
print(f"A@B == B@A: {np.array_equal(A@B, B@A)}")  # False`
        },
        {
          lang: "python",
          code: `# 矩阵作为线性变换：旋转 90 度
theta = np.pi / 2
R = np.array([
    [np.cos(theta), -np.sin(theta)],
    [np.sin(theta),  np.cos(theta)]
])

v = np.array([1, 0])
v_rotated = R @ v
print(f"原向量: {v}")
print(f"旋转后: {v_rotated}")  # 近似 [0, 1]`
        }
      ],
      table: {
        headers: ["变换类型", "2×2 矩阵", "效果"],
        rows: [
          ["恒等变换", "[[1,0],[0,1]]", "不改变向量"],
          ["旋转 90°", "[[0,-1],[1,0]]", "逆时针旋转 90 度"],
          ["缩放 2 倍", "[[2,0],[0,2]]", "所有方向放大 2 倍"],
          ["剪切变换", "[[1,1],[0,1]]", "x 方向沿 y 方向偏移"]
        ]
      },
      mermaid: `graph LR
    A["输入向量 v"] --> B["权重矩阵 W"]
    B --> C["输出向量 Wv"]
    C --> D["激活函数"]
    D --> E["下一层输入"]
    class B s0
    classDef s0 fill:#7c2d12,stroke:#333`,
      tip: "使用 @ 运算符进行矩阵乘法比 np.matmul 更简洁，且是 Python 3.5+ 的标准写法。",
      warning: "矩阵乘法要求左矩阵的列数等于右矩阵的行数。维度不匹配时会报错，调试时先 print(shape) 检查维度。"
    },
    {
      title: "5. 行列式与逆矩阵",
      body: `行列式是方阵的一个标量属性，记作 det(A) 或 |A|。它描述了线性变换对空间的缩放因子。行列式为 1 表示变换保持体积不变（如旋转）；行列式为 0 表示变换将空间压缩到了更低维度（如投影到一条线）；行列式为负数表示变换包含反射操作。

逆矩阵 A^{-1} 是满足 A×A^{-1} = I 的矩阵。只有行列式非零的方阵才可逆。逆矩阵在解线性方程组 Ax = b 中至关重要：x = A^{-1}b。在机器学习中，线性回归的解析解 (X^T X)^{-1} X^T y 就用到了逆矩阵。

实际计算中，直接求逆往往效率低下且数值不稳定。通常使用 LU 分解、Cholesky 分解等数值方法来间接求解。NumPy 的 np.linalg.solve 比先求逆再相乘更推荐。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

A = np.array([[1, 2], [3, 4]])

# 行列式
det = np.linalg.det(A)
print(f"det(A) = {det:.2f}")  # -2.00

# 逆矩阵
A_inv = np.linalg.inv(A)
print(f"A 的逆 =\n{A_inv}")

# 验证 A × A_inv = I
print(f"A @ A_inv =\n{np.round(A @ A_inv, 10)}")`
        },
        {
          lang: "python",
          code: `# 解线性方程组 Ax = b
b = np.array([5, 11])
x = np.linalg.solve(A, b)
print(f"解 x = {x}")  # [1. 2.]

# 验证
print(f"A @ x = {A @ x}")  # [ 5. 11.]

# 奇异矩阵（不可逆）
S = np.array([[1, 2], [2, 4]])
print(f"det(S) = {np.linalg.det(S):.2f}")  # 0.00，不可逆`
        }
      ],
      table: {
        headers: ["行列式值", "几何意义", "可逆性", "方程组解"],
        rows: [
          ["det ≠ 0", "空间体积非零缩放", "可逆", "唯一解"],
          ["det = 0", "空间被压缩", "不可逆", "无解或无穷多解"],
          ["det = 1", "体积不变（旋转等）", "可逆", "唯一解"],
          ["det < 0", "包含反射", "可逆", "唯一解"]
        ]
      },
      mermaid: `graph TD
    A["方阵 A"] --> B{"det(A) = 0?"}
    B -->|"是"| C["不可逆（奇异）"]
    B -->|"否"| D["可逆"]
    D --> E["A^{-1} 存在"]
    E --> F["Ax=b 有唯一解"]
    C --> G["Ax=b 无解或无穷解"]`,
      tip: "解线性方程组时，优先使用 np.linalg.solve 而不是 np.linalg.inv。前者数值稳定性更好，速度也更快。",
      warning: "浮点运算中，接近零的行列式（如 1e-15）可能是数值误差导致的。这种情况下矩阵称为 '病态矩阵'，求逆结果可能极不准确。"
    },
    {
      title: "6. 特征值与特征向量",
      body: `特征值和特征向量是线性代数中最优雅也最重要的概念之一。对于方阵 A，如果存在非零向量 v 和标量 λ 使得 Av = λv，则 λ 是特征值，v 是对应的特征向量。几何上，特征向量是经过线性变换后方向不变的向量，特征值描述了沿该方向的缩放因子。

求特征值需要解特征方程 det(A- λI) = 0。这是一个关于 λ 的多项式方程，n 阶矩阵有 n 个特征值（可能有重根）。特征值分解在 PCA（主成分分析）中扮演核心角色——数据的协方差矩阵的最大特征值对应的特征向量，就是数据方差最大的方向。

对称矩阵的特征值都是实数，且特征向量两两正交。这些性质使得对称矩阵的特征值分解在机器学习中有广泛应用，包括谱聚类、图神经网络等领域。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

A = np.array([[4, 1], [2, 3]])

# 特征值分解
eigenvalues, eigenvectors = np.linalg.eig(A)
print(f"特征值: {eigenvalues}")
print(f"特征向量:\n{eigenvectors}")

# 验证 Av = λv
v = eigenvectors[:, 0]
lam = eigenvalues[0]
print(f"A @ v = {A @ v}")
print(f"λ * v = {lam * v}")`
        },
        {
          lang: "python",
          code: `# 特征值分解重构矩阵
D = np.diag(eigenvalues)  # 特征值对角矩阵
P = eigenvectors            # 特征向量矩阵

# A = P D P^{-1}
A_reconstructed = P @ D @ np.linalg.inv(P)
print(f"重构矩阵:\n{np.round(A_reconstructed, 10)}")

# 迹 = 特征值之和
print(f"迹: {np.trace(A)} = {sum(eigenvalues)}")
# 行列式 = 特征值之积
print(f"det: {np.linalg.det(A):.2f} = {np.prod(eigenvalues):.2f}")`
        }
      ],
      table: {
        headers: ["性质", "公式", "说明"],
        rows: [
          ["特征方程", "Av = λv", "v 经 A 变换后方向不变"],
          ["特征多项式", "det(A - λI) = 0", "求特征值的方程"],
          ["迹的关系", "tr(A) = Σλ_i", "矩阵迹等于特征值之和"],
          ["行列式关系", "det(A) = Πλ_i", "矩阵行列式等于特征值之积"]
        ]
      },
      mermaid: `graph TD
    A["矩阵 A"] --> B["特征方程 det(A-λI)=0"]
    B --> C["求解 λ"]
    C --> D["特征值 λ1, λ2"]
    D --> E["求解 (A-λI)v=0"]
    E --> F["特征向量 v1, v2"]
    F --> G["PCA 降维"]`,
      tip: "在 PCA 中，你只需计算协方差矩阵的特征值和特征向量。最大特征值对应的特征向量就是数据的主成分方向。",
      warning: "np.linalg.eig 对非对称矩阵可能返回复数特征值。如果你处理的是对称矩阵，使用 np.linalg.eigh 更高效且保证实数结果。"
    },
    {
      title: "7. NumPy 实战：向量与矩阵操作",
      body: `理论学完后，让我们用 NumPy 把线性代数的核心操作串联起来。NumPy 是 Python 科学计算的基石，几乎所有 AI 框架（PyTorch、TensorFlow）的数组操作都沿用了 NumPy 的接口设计。熟练掌握 NumPy 的线性代数操作是进入 AI 领域的必备技能。

我们将演示从基础的向量创建到高级的特征值分解的完整流程。重点掌握广播机制（broadcasting）——它允许不同维度的数组进行运算，是 NumPy 强大表达力的来源。例如一个 (3,) 的向量可以和一个 (3, 3) 的矩阵逐行相加，无需显式循环。

最后通过一个完整的特征分解示例，展示如何将理论应用到实际问题中。这是理解 PCA、SVD 等高级算法的第一步。记住，在深度学习中，每一个前向传播和反向传播的过程，底层都是这些基础的矩阵运算在高速执行。`,
      code: [
        {
          lang: "python",
          code: `import numpy as np

# 综合演练：向量与矩阵操作
# 1. 创建各种向量和矩阵
v = np.array([1, 2, 3])
M = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

# 2. 广播机制
print(f"v + 10 = {v + 10}")         # 标量广播
print(f"M + v =\n{M + v}")          # 向量逐行广播

# 3. 范数计算
print(f"||v|| = {np.linalg.norm(v):.2f}")  # L2 范数
print(f"||v||_1 = {np.linalg.norm(v, 1):.2f}")  # L1 范数`
        },
        {
          lang: "python",
          code: `# 4. 完整的特征分解实战
# 创建对称正定矩阵（确保实数特征值）
A = np.array([[4, 2], [2, 3]])
eigenvalues, eigenvectors = np.linalg.eig(A)

print(f"特征值: {eigenvalues}")
print(f"特征向量:\n{eigenvectors}")

# 5. PCA 降维示例
X = np.random.randn(100, 5)  # 100 个样本，5 个特征
cov_matrix = np.cov(X.T)
eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)

# 取最大的两个特征值对应的特征向量
top_2 = eigenvectors[:, -2:]
X_pca = X @ top_2
print(f"PCA 降维后形状: {X_pca.shape}")  # (100, 2)`
        }
      ],
      table: {
        headers: ["NumPy 函数", "功能", "返回值"],
        rows: [
          ["np.dot / @", "矩阵/向量乘法", "数组"],
          ["np.linalg.norm", "向量范数", "标量"],
          ["np.linalg.eig", "特征值分解", "(特征值, 特征向量)"],
          ["np.linalg.solve", "解线性方程组", "解向量"],
          ["np.cov", "协方差矩阵", "方阵"]
        ]
      },
      mermaid: `graph LR
    A["原始数据 X"] --> B["计算协方差矩阵"]
    B --> C["特征值分解"]
    C --> D["选取 Top-K 特征向量"]
    D --> E["投影降维 X_pca"]
    E --> F["可视化/下游任务"]`,
      tip: "学习 NumPy 时，多用 np.random.randn 生成随机数据做实验。动手试比只看教程记得牢。",
      warning: "np.cov 默认每行是一个变量（feature），每列是一个样本。如果数据是每行一个样本，需要传入 X.T 或设置 rowvar=False。"
    }
  ],
};
