import { Article } from '../knowledge';

export const article: Article = {
    id: "math-008",
    title: "数值计算进阶：优化算法的数学基础",
    category: "math",
    tags: ["数值优化", "收敛性", "条件数"],
    summary: "从条件数到收敛速率，深入理解优化算法的数学原理",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
      {
        title: "1. 条件数与病态问题",
        body: `条件数（Condition Number）是衡量线性系统或优化问题对输入扰动敏感程度的核心指标。对于对称正定矩阵 H，其条件数定义为最大特征值与最小特征值之比：kappa(H) = lambda_max / lambda_min。当条件数接近 1 时，问题称为良态（Well-conditioned），输入的小扰动只会引起输出的小变化。当条件数很大时，问题称为病态（Ill-conditioned），输入的微小误差会被显著放大。

在二次优化问题 f(x) = 0.5 * x^T H x - b^T x 中，条件数直接决定了梯度下降的收敛速度。等高线呈狭长椭圆时（条件数大），梯度方向与最优方向偏差极大，导致梯度下降呈现剧烈的锯齿形震荡路径。每次迭代只能在最短轴方向取得进展，而长轴方向的误差几乎不减少。这就是为什么条件数大的问题，梯度下降需要极多步才能收敛。

病态问题的数值根源在于浮点运算的有限精度。即使问题本身数学上是良定义的，当条件数超过机器精度的倒数时（FP32 中约为 1e7），计算结果的有效数字将大量丢失。预处理（Preconditioning）是解决病态问题的标准手段：找到一个变换矩阵 P，使得 P^T H P 的条件数接近 1，从而将病态问题转化为良态问题。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from numpy.linalg import cond, eigvalsh

# 构造病态二次问题
H = np.array([[1000.0, 0.0],
              [0.0,   1.0]])
print(f"条件数: {cond(H):.1f}")  # 1000.0

# 特征值分析
eigenvalues = eigvalsh(H)
print(f"特征值: {eigenvalues}")  # [1.0, 1000.0]

# 最速下降法的收敛率
kappa = cond(H)
conv_rate = ((kappa - 1) / (kappa + 1)) ** 2
print(f"每步误差缩减因子: {conv_rate:.4f}")  # ~0.996，极慢`
          },
          {
            lang: "python",
            code: `# 预处理对角缩放
H = np.array([[1000.0, 500.0],
              [500.0,   1.0]])
print(f"原始条件数: {cond(H):.2e}")

# 对角预处理
D_inv = np.diag(1.0 / np.sqrt(np.diag(H)))
H_pre = D_inv @ H @ D_inv
print(f"预处理后条件数: {cond(H_pre):.2f}")

# 特征值分布对比
print(f"原始特征值: {eigvalsh(H)}")
print(f"预处理特征值: {eigvalsh(H_pre)}")
# 预处理将特征值压缩到更集中的区间`
          }
        ],
        table: {
          headers: ["条件数范围", "问题状态", "梯度下降步数估计", "数值稳定性", "建议"],
          rows: [
            ["1-10", "良态", "O(1)", "优秀", "直接求解"],
            ["10-1000", "中等", "O(10-100)", "良好", "标准方法即可"],
            ["1000-1e6", "病态", "O(1000+)", "需注意", "需要预处理"],
            [">1e6", "严重病态", "极慢或不收敛", "FP32 失效", "必须预处理或换 FP64"],
          ]
        },
        mermaid: `graph TD
    A["高条件数"] --> B["狭长椭圆等高线"]
    B --> C["梯度方向偏差大"]
    C --> D["锯齿形震荡"]
    D --> E["收敛极慢"]
    A --> F["预处理 P"]
    F --> G["条件数降低"]
    G --> H["近似圆等高线"]
    H --> I["快速收敛"]`,
        tip: "在训练前计算 Hessian 的近似条件数，如果超过 1e4，优先使用 Adam 或添加预处理",
        warning: "当条件数超过机器精度倒数时，即使数学上正确的算法也会因浮点误差而失效"
      },
      {
        title: "2. 收敛速率：线性、超线性与二次",
        body: `收敛速率是评价优化算法效率的核心度量。设 x_k 为第 k 次迭代的参数，x* 为最优解，误差为 e_k = ||x_k - x*||。如果存在常数 mu in (0, 1) 使得 e_{k+1} <= mu * e_k，则称为线性收敛（Linear Convergence），误差以固定比例指数衰减。线性收敛是大多数一阶优化算法（如梯度下降、SGD）在强凸假设下的收敛速率。

如果 e_{k+1} / e_k 趋于 0（即 mu 可以任意小），则称为超线性收敛（Superlinear Convergence）。拟牛顿法（如 BFGS、L-BFGS）和共轭梯度法通常达到超线性收敛。超线性收敛意味着随着迭代推进，每一步的改善幅度越来越大，这在后期比线性收敛快得多。

二次收敛（Quadratic Convergence）是最快的收敛速率：e_{k+1} <= C * e_k^2。这意味着每迭代一次，有效数字的位数大致翻倍。牛顿法在满足一定条件时达到二次收敛。直观理解：如果当前误差是 0.01，二次收敛的下一次误差将是约 0.0001，再下一次是 0.00000001。从 10^{-2} 到 10^{-16} 只需要 4 步。但牛顿法每次迭代需要计算和求逆 Hessian 矩阵，代价极高，通常只在迭代后期使用。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def simulate_convergence(e0, rate_type, steps=10):
    """模拟不同收敛速率的误差衰减"""
    errors = [e0]
    e = e0
    for _ in range(steps):
        if rate_type == "linear":
            e *= 0.5  # mu = 0.5
        elif rate_type == "superlinear":
            e *= 0.5 / (1 + len(errors) * 0.1)  # 逐渐加速
        elif rate_type == "quadratic":
            e = 0.5 * e ** 2
        errors.append(max(e, 1e-18))
    return errors

# 从初始误差 0.1 开始比较
e0 = 0.1
for rt in ["linear", "superlinear", "quadratic"]:
    errs = simulate_convergence(e0, rt, 8)
    print(f"{rt}: {[f'{e:.2e}' for e in errs]}")`
          },
          {
            lang: "python",
            code: `# 实际优化算法的收敛速率验证
def rosenbrock(x):
    """Rosenbrock 函数，经典非凸测试函数"""
    return (1 - x[0])2 + 100 * (x[1] - x[0]2)**2

def rosenbrock_grad(x):
    dx = -2*(1 - x[0]) - 400*x[0]*(x[1] - x[0]**2)
    dy = 200*(x[1] - x[0]**2)
    return np.array([dx, dy])

def rosenbrock_hess(x):
    h11 = 2 - 400*x[1] + 1200*x[0]**2
    h12 = -400*x[0]
    h22 = 200
    return np.array([[h11, h12], [h12, h22]])

# 牛顿法一步求解（二次函数精确解）
x0 = np.array([-1.0, 1.0])
H = rosenbrock_hess(x0)
g = rosenbrock_grad(x0)
x_new = x0 - np.linalg.solve(H, g)
print(f"牛顿法一步: x = {x_new}")
print(f"f(x_new) = {rosenbrock(x_new):.6e}")`
          }
        ],
        table: {
          headers: ["收敛类型", "误差递推", "有效数字增长", "代表算法", "每步代价"],
          rows: [
            ["线性", "e_{k+1} <= mu * e_k", "常数增长", "梯度下降, SGD", "低"],
            ["超线性", "e_{k+1}/e_k -> 0", "加速增长", "BFGS, L-BFGS", "中"],
            ["二次", "e_{k+1} <= C * e_k^2", "指数翻倍", "牛顿法", "高"],
            ["次线性", "e_{k+1} <= e_k - C/k", "对数增长", "次梯度法", "极低"],
          ]
        },
        mermaid: `graph TD
    A["初始误差 e0"] --> B{"收敛类型"}
    B -->|"线性"| C["e_k = mu^k * e0"]
    B -->|"超线性"| D["e_{k+1}/e_k -> 0"]
    B -->|"二次"| E["e_k = C * e_{k-1}^2"]
    C --> F["稳定但慢"]
    D --> G["后期加速"]
    E --> H["极速收敛"]`,
        tip: "实践中常用 L-BFGS：它近似牛顿法但只存储最近 m 步的历史，内存代价从 O(n^2) 降到 O(mn)",
        warning: "牛顿法的二次收敛只在最优解附近的一个邻域内保证，远离最优解时可能发散"
      },
      {
        title: "3. Lipschitz 连续与光滑性",
        body: `Lipschitz 连续是优化理论中最基础的分析工具之一。一个函数 f 是 L-Lipschitz 连续的，如果对于任意 x 和 y 都有 |f(x) - f(y)| <= L * ||x - y||。对于梯度而言，如果梯度是 L-Lipschitz 连续的（即 ||nabla f(x) - nabla f(y)|| <= L * ||x - y||），我们称 f 是 L-光滑的。这意味着梯度的变化有上界，函数不会过于剧烈地弯曲。

Lipschitz 常数 L 在优化中有着直接的实际意义。对于梯度下降法，学习率必须小于 2/L 才能保证收敛，最优学习率为 1/L。如果 L 很大（函数变化剧烈），学习率就必须很小，收敛自然就慢。这就是为什么归一化（Normalization）在深度学习中如此重要：它将数据的尺度约束在合理范围内，间接地控制了 Lipschitz 常数。

光滑性与二阶导数密切相关。对于二次可微函数，梯度的 Lipschitz 常数 L 等于 Hessian 矩阵谱范数的上界。在神经网络中，激活函数的 Lipschitz 常数直接影响整体网络的 Lipschitz 常数。ReLU 的 Lipschitz 常数为 1，Tanh 为 1，而带有大权重矩阵的线性层的 Lipschitz 常数等于其最大奇异值。控制这些常数是谱归一化（Spectral Normalization）和 Lipschitz 约束优化的理论基础。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# 估计函数的 Lipschitz 常数
def estimate_lipschitz(f_grad, x0, num_samples=1000):
    """通过采样估计梯度的 Lipschitz 常数 L"""
    n = len(x0)
    max_L = 0.0
    for _ in range(num_samples):
        dx = np.random.randn(n) * 0.01
        x1 = x0 + dx
        grad_diff = f_grad(x1) - f_grad(x0)
        L_est = np.linalg.norm(grad_diff) / np.linalg.norm(dx)
        max_L = max(max_L, L_est)
    return max_L

# 测试二次函数 f(x) = 0.5 * x^T H x
H = np.array([[4.0, 1.0], [1.0, 2.0]])
f_grad = lambda x: H @ x
L_est = estimate_lipschitz(f_grad, np.zeros(2), 5000)
L_exact = np.linalg.norm(H, 2)  # 谱范数
print(f"估计 L: {L_est:.4f}, 精确 L: {L_exact:.4f}")`
          },
          {
            lang: "python",
            code: `# Lipschitz 常数与最优学习率的关系
def gradient_descent(f_grad, x0, L, steps=100):
    """梯度下降，学习率 = 1/L"""
    x = x0.copy()
    lr = 1.0 / L
    history = [np.linalg.norm(x)]
    for _ in range(steps):
        x = x - lr * f_grad(x)
        history.append(np.linalg.norm(x))
    return history, x

# 不同 L 值的影响
H = np.diag([10.0, 1.0])  # 条件数 = 10
f_grad = lambda x: H @ x
x0 = np.array([1.0, 1.0])

L = np.linalg.norm(H, 2)
print(f"最优学习率: {1/L:.4f}")

hist, x_final = gradient_descent(f_grad, x0, L, 50)
print(f"初始误差: {hist[0]:.4f}, 最终误差: {hist[-1]:.6f}")

# 学习率过大导致发散
hist_bad, _ = gradient_descent(f_grad, x0, L, 20)
# 如果用 lr = 3/L 而非 1/L，可能发散`
          }
        ],
        table: {
          headers: ["概念", "数学定义", "物理意义", "优化中的角色"],
          rows: [
            ["函数 Lipschitz", "|f(x)-f(y)| <= L||x-y||", "函数变化速率上界", "误差界分析"],
            ["梯度 Lipschitz", "||grad f(x)-grad f(y)|| <= L||x-y||", "曲率/弯曲程度上界", "学习率选择"],
            ["Hessian 界", "||nabla^2 f(x)|| <= L", "二阶变化上界", "牛顿法分析"],
            ["谱归一化", "sigma_max(W) = 1", "控制网络 Lipschitz", "GAN 稳定性"],
          ]
        },
        mermaid: `graph TD
    A["Lipschitz 常数 L"] --> B["L 大 = 函数陡峭"]
    B --> C["学习率需小"]
    C --> D["收敛慢"]
    A --> E["L 小 = 函数平坦"]
    E --> F["学习率可大"]
    F --> G["收敛快"]
    B -.归一化.-> H["降低 L"]`,
        tip: "在训练中使用学习率 warmup 来安全地探索 Lipschitz 常数，初期用小学习率逐步增大",
        warning: "Lipschitz 常数是全局上界，局部可能远小于 L，因此 1/L 的学习率可能过于保守"
      },
      {
        title: "4. 强凸性与 Polyak-Lojasiewicz 条件",
        body: `强凸性（Strong Convexity）是保证优化问题有唯一全局最优解且梯度下降线性收敛的关键条件。函数 f 是 mu-强凸的，如果 f(x) - 0.5 * mu * ||x||^2 是凸函数。等价地，对于二次可微函数，Hessian 矩阵满足 nabla^2 f(x) >= mu * I（即所有特征值不小于 mu）。强凸参数 mu 和光滑参数 L 一起定义了函数的条件数 kappa = L / mu。

然而，强凸性在实际机器学习问题中往往不成立。神经网络的损失函数通常是非凸的，且由于参数对称性和过参数化，存在大量等价的全局最优解。幸运的是，Polyak-Lojasiewicz（PL）条件提供了一个更弱但仍然足以保证线性收敛的条件：||nabla f(x)||^2 >= 2 * mu * (f(x) - f*)。PL 条件不要求函数是凸的，只需要梯度的范数能够控制函数值与最优值的差距。

PL 条件的意义在于它解释了为什么梯度下降可以在非凸问题上仍然有效。许多过参数化的神经网络满足 PL 条件：虽然损失面非凸，但在优化路径上梯度的大小总是与当前次优程度成正比。这使得梯度下降即使不进入任何凸区域，也能保证线性收敛到全局最优。这是理解深度学习优化行为的重要理论工具。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# 验证强凸性：检查 Hessian 的最小特征值
def check_strong_convexity(hess_func, x, num_dirs=100):
    """通过随机方向检查 Hessian 正定性"""
    n = len(x)
    min_eigenval = np.inf
    for _ in range(num_dirs):
        H = hess_func(x)
        eigvals = np.linalg.eigvalsh(H)
        min_eigenval = min(min_eigenval, eigvals[0])
    return min_eigenval

# 二次函数: Hessian 恒定
H = np.array([[4.0, 1.0], [1.0, 3.0]])
hess_func = lambda x: H
mu = np.linalg.eigvalsh(H)[0]
L = np.linalg.eigvalsh(H)[-1]
print(f"强凸参数 mu = {mu:.4f}")
print(f"光滑参数 L = {L:.4f}")
print(f"条件数 kappa = {L/mu:.2f}")`
          },
          {
            lang: "python",
            code: `# 验证 PL 条件
def check_pl_condition(f, f_grad, f_opt, xs, num_samples=500):
    """检查 PL 条件是否成立，估计 mu_PL"""
    min_ratio = np.inf
    for _ in range(num_samples):
        idx = np.random.randint(len(xs))
        x = xs[idx]
        grad_norm_sq = np.sum(f_grad(x)**2)
        func_gap = f(x) - f_opt
        if func_gap > 1e-10:
            ratio = grad_norm_sq / (2 * func_gap)
            min_ratio = min(min_ratio, ratio)
    return min_ratio

# 简单凸函数测试
f = lambda x: x[0]2 + 2*x[1]2
f_grad = lambda x: np.array([2*x[0], 4*x[1]])
xs = [np.random.randn(2) * 2 for _ in range(100)]
mu_pl = check_pl_condition(f, f_grad, 0.0, xs)
print(f"PL 常数估计: {mu_pl:.4f}")
print(f"理论值: 2.0 (min eigenval = 2)")`
          }
        ],
        table: {
          headers: ["条件", "数学表述", "蕴含关系", "是否要求凸性", "收敛保证"],
          rows: [
            ["强凸", "nabla^2 f >= mu*I", "最强", "是", "线性收敛到唯一最优"],
            ["PL 条件", "||grad f||^2 >= 2*mu*(f-f*)", "弱于强凸", "否", "线性收敛到全局最优"],
            ["弱凸", "nabla^2 f >= -epsilon*I", "不蕴含线性收敛", "否", "次线性收敛"],
            ["Kurdyka-Lojasiewicz", "phi'(f-f*) * ||grad f|| >= 1", "最弱", "否", "收敛到临界点"],
          ]
        },
        mermaid: `graph TD
    A["强凸性"] -->|"蕴含"| B["PL 条件"]
    B -->|"蕴含"| C["K-L 不等式"]
    C -->|"蕴含"| D["收敛到临界点"]
    B -.不要求凸.-> E["非凸也可线性收敛"]
    A -.要求凸.-> F["唯一全局最优"]`,
        tip: "过参数化神经网络常满足 PL 条件，这解释了为什么简单的 SGD 就能找到全局最优",
        warning: "PL 条件保证了全局最优，但不保证唯一性，非凸函数可能有多个等价最优解"
      },
      {
        title: "5. 线搜索方法：Wolfe 条件",
        body: `线搜索（Line Search）是优化算法中选择步长的经典策略。给定当前点 x_k 和搜索方向 d_k（通常是负梯度方向），线搜索的目标是找到最优步长 alpha_k 使得 f(x_k + alpha_k * d_k) 尽可能小。精确线搜索需要求解一维优化问题，代价过高。因此在实际中广泛使用不精确线搜索，其中 Wolfe 条件是最主流的选择。

Wolfe 条件由两个不等式组成。第一个是充分下降条件（Armijo 条件）：f(x_k + alpha * d_k) <= f(x_k) + c1 * alpha * nabla f(x_k)^T d_k，其中 c1 通常取 1e-4。它确保步长不会太小，函数值必须有足够的下降。第二个是曲率条件：nabla f(x_k + alpha * d_k)^T d_k >= c2 * nabla f(x_k)^T d_k，其中 c2 通常取 0.9（牛顿法）或 0.1（非线性共轭梯度）。它确保步长不会太大，梯度方向已经发生了足够的变化。

强 Wolfe 条件进一步要求 |nabla f(x_k + alpha * d_k)^T d_k| <= c2 * |nabla f(x_k)^T d_k|，防止步长选在梯度方向已经反转的位置。回溯线搜索（Backtracking Line Search）是 Wolfe 条件的简化版本：从一个较大的初始步长开始，每次乘以一个衰减因子 rho（如 0.5），直到满足 Armijo 条件。它实现简单，在拟牛顿法和牛顿法中广泛使用。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def backtracking_line_search(f, f_grad, x, direction, alpha=1.0,
                              c1=1e-4, rho=0.5, max_iter=50):
    """回溯线搜索（仅 Armijo 条件）"""
    fx = f(x)
    slope = np.dot(f_grad(x), direction)
    for _ in range(max_iter):
        if f(x + alpha * direction) <= fx + c1 * alpha * slope:
            return alpha
        alpha *= rho
    return alpha

# 测试
f = lambda x: x[0]2 + 10*x[1]2
f_grad = lambda x: np.array([2*x[0], 20*x[1]])
x = np.array([3.0, 2.0])
d = -f_grad(x)  # 最速下降方向
alpha = backtracking_line_search(f, f_grad, x, d)
print(f"回溯线搜索步长: {alpha:.6f}")
x_new = x + alpha * d
print(f"改进: f({x}) = {f(x):.2f} -> f({x_new}) = {f(x_new):.2f}")`
          },
          {
            lang: "python",
            code: `def strong_wolfe_line_search(f, f_grad, x, direction,
                               c1=1e-4, c2=0.9, alpha_max=10.0):
    """强 Wolfe 条件的线搜索（简化版）"""
    alpha_lo, alpha_hi = 0.0, alpha_max
    alpha = 1.0
    fx = f(x)
    slope = np.dot(f_grad(x), direction)

    for _ in range(30):
        x_new = x + alpha * direction
        fx_new = f(x_new)
        grad_new = f_grad(x_new)
        slope_new = np.dot(grad_new, direction)

        # Armijo 条件
        armijo_ok = fx_new <= fx + c1 * alpha * slope
        # 强曲率条件
        curvature_ok = abs(slope_new) <= c2 * abs(slope)

        if armijo_ok and curvature_ok:
            return alpha

        if not armijo_ok or fx_new >= fx:
            alpha_hi = alpha
        else:
            if slope_new >= 0:
                alpha_hi = alpha
            else:
                alpha_lo = alpha
        alpha = (alpha_lo + alpha_hi) / 2.0

    return alpha

# 测试
alpha = strong_wolfe_line_search(f, f_grad, x, d)
print(f"强 Wolfe 步长: {alpha:.6f}")`
          }
        ],
        table: {
          headers: ["线搜索策略", "条件", "计算代价", "适用场景", "参数设置"],
          rows: [
            ["回溯线搜索", "仅 Armijo", "低", "牛顿法, BFGS", "c1=1e-4, rho=0.5"],
            ["Wolfe", "Armijo + 曲率", "中", "共轭梯度法", "c1=1e-4, c2=0.1"],
            ["强 Wolfe", "Armijo + 强曲率", "中", "一般用途", "c1=1e-4, c2=0.9"],
            ["精确线搜索", "最小化一维函数", "高", "理论分析", "N/A"],
          ]
        },
        mermaid: `graph TD
    A["初始步长 alpha=1"] --> B["计算 f(x+alpha*d)"]
    B --> C{"Armijo 条件?"}
    C -->|满足| D{"曲率条件?"}
    C -->|不满足| E["alpha *= rho"]
    E --> B
    D -->|满足| F["返回 alpha"]
    D -->|不满足| G["插值搜索"]
    G --> B`,
        tip: "对于牛顿法使用较大的 c2（0.9），对于梯度法使用较小的 c2（0.1），以匹配不同的步长需求",
        warning: "回溯线搜索可能选择过大的步长（只满足 Armijo），在不光滑的函数上会导致震荡"
      },
      {
        title: "6. 信赖域方法",
        body: `信赖域方法（Trust Region Methods）是与线搜索并列的另一类经典优化策略。与线搜索先选方向再选步长不同，信赖域方法同时确定方向和步长：在当前点 x_k 附近定义一个半径为 Delta_k 的信赖域，在这个区域内用一个简单的模型（通常是二次模型）近似目标函数，然后求解这个子问题得到步长。

信赖域子问题的标准形式是：最小化 m_k(p) = f_k + g_k^T p + 0.5 * p^T B_k p，满足 ||p|| <= Delta_k。其中 B_k 是 Hessian 或其近似。这个子问题有高效的精确解法（如 Steihaug 共轭梯度法），即使在不精确求解的情况下也能保证收敛性。

信赖域方法的核心在于自适应调整信赖域半径。计算实际下降与预测下降的比率 rho_k = (f(x_k) - f(x_k + p_k)) / (m_k(0) - m_k(p_k))。如果 rho_k 接近 1，说明二次模型很准确，增大信赖域；如果 rho_k 很小甚至为负，说明模型不准确，缩小信赖域并拒绝这一步。这种自适应机制使信赖域方法在全局收敛性和局部收敛速度之间取得了优秀的平衡。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def trust_region_step(g, B, Delta):
    """求解信赖域子问题（简化：只考虑负梯度方向）"""
    # Cauchy 点（沿负梯度方向的最优点）
    g_norm = np.linalg.norm(g)
    if g_norm < 1e-12:
        return np.zeros_like(g)

    # 如果负梯度方向上的最小值在信赖域内
    alpha = g_norm ** 3 / (g.T @ B @ g)
    if alpha * g_norm <= Delta:
        p = -alpha * g  # Cauchy 点
    else:
        p = -(Delta / g_norm) * g  # 边界点

    return p

# 测试
g = np.array([2.0, 4.0])
B = np.array([[4.0, 1.0], [1.0, 3.0]])
Delta = 1.0
p = trust_region_step(g, B, Delta)
print(f"信赖域步长: {p}")
print(f"步长范数: {np.linalg.norm(p):.4f} <= Delta={Delta}")`
          },
          {
            lang: "python",
            code: `def trust_region_method(f, f_grad, f_hess, x0,
                        Delta=1.0, eta=0.1, max_iter=100):
    """完整信赖域优化"""
    x = x0.copy()
    history = [f(x)]

    for _ in range(max_iter):
        g = f_grad(x)
        B = f_hess(x)

        if np.linalg.norm(g) < 1e-8:
            break

        # 求解子问题
        p = trust_region_step(g, B, Delta)
        f_new = f(x + p)

        # 计算比率
        actual = f(x) - f_new
        predicted = -(g.T @ p + 0.5 * p.T @ B @ p)
        rho = actual / (predicted + 1e-12)

        # 更新
        if rho > eta:
            x = x + p
        # 调整信赖域
        if rho > 0.75:
            Delta = min(2.0 * Delta, 10.0)
        elif rho < 0.25:
            Delta *= 0.25

        history.append(f(x))

    return x, history

# 测试
f = lambda x: x[0]2 + 10*x[1]2
f_grad = lambda x: np.array([2*x[0], 20*x[1]])
f_hess = lambda x: np.array([[2.0, 0.0], [0.0, 20.0]])
x_opt, hist = trust_region_method(f, f_grad, f_hess, np.array([5.0, 5.0]))
print(f"最优解: {x_opt}")
print(f"迭代次数: {len(hist)}")`
          }
        ],
        table: {
          headers: ["特性", "信赖域方法", "线搜索方法", "适用场景"],
          rows: [
            ["策略", "先定区域再找方向步长", "先定方向再找步长", "不同思路"],
            ["子问题", "二次模型约束优化", "一维搜索", "复杂度相当"],
            ["全局收敛", "有保证", "需 Wolfe 条件", "两者皆可"],
            ["病态问题", "鲁棒性强", "需要预处理", "信赖域更稳定"],
            ["非凸", "天然支持", "需要修改", "信赖域优势明显"],
          ]
        },
        mermaid: `graph TD
    A["当前点 x_k"] --> B["构建二次模型 m_k(p)"]
    B --> C["求解子问题 ||p|| <= Delta"]
    C --> D["计算比率 rho"]
    D --> E{"rho > eta?"}
    E -->|是| F["接受 x_{k+1} = x_k + p"]
    E -->|否| G["拒绝，保持 x_k"]
    F --> H{"rho 大小"}
    H -->|大| I["扩大 Delta"]
    H -->|小| J["缩小 Delta"]
    G --> J`,
        tip: "对于高度非凸的问题（如神经网络训练初期），信赖域方法比纯线搜索更稳定",
        warning: "信赖域子问题的精确求解在高维下代价高昂，需要使用近似方法（如 Steihaug CG）"
      },
      {
        title: "7. 实战：不同优化算法收敛性对比",
        body: `将前面讨论的理论工具应用到实际优化问题中，比较不同算法在相同条件下的收敛行为。我们选择一个具有明确条件数的二次优化问题作为基准，分别测试梯度下降、动量法、牛顿法和 BFGS 四种算法。二次问题的好处是它有解析解和精确的收敛速率理论，因此实验结果可以直接与理论预测对比。

梯度下降的收敛速率由条件数 kappa 决定：每步误差缩减因子为 ((kappa - 1) / (kappa + 1))^2。当 kappa = 100 时，这个因子约为 0.96，意味着每步只能消除约 4% 的误差。动量法（Polyak 重球法）的最优动量参数为 beta = ((sqrt(kappa) - 1) / (sqrt(kappa) + 1))^2，可以将收敛速率从 O(kappa) 提升到 O(sqrt(kappa))。对于 kappa = 100，动量法每步消除约 18% 的误差，是梯度下降的 4.5 倍。

牛顿法和 BFGS 展示了二阶方法的优势。牛顿法利用精确的 Hessian 信息，在二次问题上一步即可收敛（因为二次模型的近似是精确的）。BFGS 通过迭代近似 Hessian 的逆，在几次迭代后就能达到超线性收敛。然而在实际的深度学习问题中，Hessian 的维度可能达到数百万甚至数十亿，直接计算和存储是不可能的。这就是为什么 Adam（一阶方法 + 自适应学习率）成为了深度学习的主流选择：它在计算效率和收敛速度之间取得了实用的平衡。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def compare_optimizers(n=10, kappa=100, max_iter=200):
    """比较不同优化算法在二次问题上的收敛性"""
    # 构造病态二次问题
    eigenvalues = np.logspace(0, np.log10(kappa), n)
    Q = np.diag(eigenvalues)
    x_star = np.ones(n)
    f = lambda x: 0.5 * x.T @ Q @ x
    grad = lambda x: Q @ x
    hess = lambda x: Q

    methods = {}

    # 1. 梯度下降
    x_gd = np.random.randn(n) * 5
    lr = 1.0 / eigenvalues[-1]
    hist_gd = [f(x_gd) - f(x_star)]
    for _ in range(max_iter):
        x_gd -= lr * grad(x_gd)
        hist_gd.append(f(x_gd) - f(x_star))
    methods["Gradient Descent"] = hist_gd

    # 2. 动量法
    x_mom = x_gd.copy()
    v = np.zeros(n)
    beta = ((np.sqrt(kappa) - 1) / (np.sqrt(kappa) + 1)) ** 2
    hist_mom = [f(x_mom) - f(x_star)]
    for _ in range(max_iter):
        v = beta * v - lr * grad(x_mom)
        x_mom += v
        hist_mom.append(max(f(x_mom) - f(x_star), 1e-18))
    methods["Momentum"] = hist_mom

    return methods

results = compare_optimizers()
for name, hist in results.items():
    print(f"{name}: 初始={hist[0]:.2e}, 最终={hist[-1]:.2e}")`
          },
          {
            lang: "python",
            code: `def compare_newton_bfgs(n=5, max_iter=30):
    """比较牛顿法和 BFGS"""
    eigenvalues = np.array([1.0, 2.0, 5.0, 10.0, 50.0])
    Q = np.diag(eigenvalues)
    x_star = np.ones(n)
    f = lambda x: 0.5 * x.T @ Q @ x
    grad = lambda x: Q @ x
    hess = lambda x: Q

    x0 = np.array([10.0, -5.0, 3.0, -8.0, 6.0])

    # 牛顿法
    x_newton = x0.copy()
    hist_newton = [f(x_newton) - f(x_star)]
    for _ in range(max_iter):
        p = np.linalg.solve(hess(x_newton), grad(x_newton))
        x_newton -= p
        err = f(x_newton) - f(x_star)
        hist_newton.append(max(err, 1e-18))
        if err < 1e-16:
            break

    # BFGS
    x_bfgs = x0.copy()
    B_inv = np.eye(n)
    hist_bfgs = [f(x_bfgs) - f(x_star)]
    for _ in range(max_iter):
        g = grad(x_bfgs)
        p = B_inv @ g
        x_new = x_bfgs - p
        s = x_new - x_bfgs
        y = grad(x_new) - g
        rho = 1.0 / (y.T @ s + 1e-12)
        I = np.eye(n)
        B_inv = (I - rho * np.outer(s, y)) @ B_inv @ (I - rho * np.outer(y, s)) + rho * np.outer(s, s)
        x_bfgs = x_new
        err = f(x_bfgs) - f(x_star)
        hist_bfgs.append(max(err, 1e-18))
        if err < 1e-16:
            break

    print(f"牛顿法 {len(hist_newton)-1} 步收敛")
    print(f"BFGS {len(hist_bfgs)-1} 步收敛")

compare_newton_bfgs()`
          }
        ],
        table: {
          headers: ["算法", "收敛速率", "每步代价", "条件数依赖", "适用规模", "深度学习适用性"],
          rows: [
            ["梯度下降", "线性 O(kappa)", "O(n)", "强依赖", "任意", "低（太慢）"],
            ["动量法", "线性 O(sqrt(kappa))", "O(n)", "中等依赖", "任意", "中（SGD+Momentum）"],
            ["BFGS", "超线性", "O(n^2)", "弱依赖", "n<10000", "低（内存太大）"],
            ["牛顿法", "二次", "O(n^3)", "无依赖", "n<1000", "几乎不可用"],
            ["Adam", "线性（自适应）", "O(n)", "自动适应", "任意", "高（主流选择）"],
          ]
        },
        mermaid: `graph TD
    A["选择优化算法"] --> B{"问题规模?"}
    B -->|"n < 1000"| C["牛顿法 (二次收敛)"]
    B -->|"n < 10000"| D["L-BFGS (超线性)"]
    B -->|"n > 10000"| E{"条件数大?"}
    E -->|是| F["Adam (自适应)"]
    E -->|否| G["SGD + Momentum"]
    C --> H["精度要求极高"]
    D --> I["中等规模 ML"]
    F --> J["深度学习首选"]
    G --> K["经典凸优化"]`,
        tip: "在实际深度学习中，AdamW（Adam + 权重衰减）通常是首选起点，配合余弦退火学习率调度",
        warning: "不要在小批量随机梯度上直接应用牛顿法：随机梯度的噪声会使 Hessian 估计完全不可靠"
      },
    ],
};
