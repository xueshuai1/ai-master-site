import { Article } from '../knowledge';

export const article: Article = {
    id: "math-006",
    title: "凸优化基础",
    category: "math",
    tags: ["凸优化", "KKT", "拉格朗日"],
    summary: "从凸集到 KKT 条件，理解优化理论在 AI 中的核心应用",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
        {
            title: "1. 凸集与凸函数",
            body: `凸优化的根基在于凸集和凸函数。一个集合 C 是凸集，当且仅当任意两点 x, y 属于 C 时，它们的连线也完全包含在 C 中。形式化地说，对任意 theta 属于 [0, 1]，都有 theta * x + (1 - theta) * y 属于 C。这个看似简单的几何性质，实际上保证了优化过程中不会陷入局部最优——因为可行域没有凹坑或空洞。

凸函数的定义同样优雅：f 是凸函数当且仅当其定义域是凸集，且对任意 x, y 和 theta 属于 [0, 1]，满足 f(theta * x + (1 - theta) * y) <= theta * f(x) + (1 - theta) * f(y)。直观理解就是函数图像上任意两点之间的弦总在图像上方。二次可微时，凸函数等价于 Hessian 矩阵半正定。常见的凸函数包括二次函数 x^T Q x（Q 半正定）、指数函数、对数函数的负值 -log(x)，以及范数函数。凸函数的一个重要性质是：局部最小值就是全局最小值，这为算法设计提供了坚实的理论保障。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

def is_convex_set(points, test_points, tol=1e-10):
    """验证一个点集是否满足凸集性质"""
    n = len(points)
    for _ in range(1000):
        i, j = np.random.randint(0, n, 2)
        theta = np.random.uniform(0, 1)
        convex_comb = theta * points[i] + (1 - theta) * points[j]
        # 检查凸组合是否在 test_points 形成的集合内
        dists = np.linalg.norm(test_points - convex_comb, axis=1)
        if np.min(dists) > tol:
            return False
    return True

# 测试单位圆盘是否为凸集
theta_vals = np.linspace(0, 2 * np.pi, 100)
disk = np.column_stack([np.cos(theta_vals), np.sin(theta_vals)])
print(f"单位圆盘凸性: {is_convex_set(disk, disk)}")`
                },
                {
                    lang: "python",
                    code: `def check_hessian_psd(f_hessian, x):
    """通过 Hessian 矩阵判断函数凸性"""
    H = f_hessian(x)
    eigvals = np.linalg.eigvalsh(H)
    is_psd = np.all(eigvals >= -1e-10)
    print(f"Hessian 特征值: {eigvals}")
    print(f"是否半正定 (凸函数): {is_psd}")
    return is_psd

# 检查 f(x,y) = x^2 + 2y^2 的凸性
def hessian_quadratic(x):
    return np.array([[2, 0], [0, 4]])

check_hessian_psd(hessian_quadratic, np.array([1.0, 1.0]))`
                }
            ],
            table: {
                headers: ["函数", "定义域", "凸性", "Hessian 特征"],
                rows: [
                    ["x^2", "R", "严格凸", "2 > 0"],
                    ["exp(x)", "R", "严格凸", "exp(x) > 0"],
                    ["-log(x)", "x > 0", "严格凸", "1/x^2 > 0"],
                    ["|x|", "R", "凸 (非严格)", "不可微点存在"],
                    ["x^3", "R", "非凸", "6x 可负"],
                ]
            },
            mermaid: `graph LR
    A["凸集定义"] --> B["凸函数定义"]
    B --> C["一阶条件"]
    B --> D["二阶条件"]
    C --> E["f(y) >= f(x) + grad*f(y-x)"]
    D --> F["Hessian >= 0"]
    F --> G["局部最优 = 全局最优"]`,
            tip: "判断函数凸性最快的方法是计算 Hessian 矩阵并检查半正定性",
            warning: "凸函数的和仍是凸函数，但凸函数的复合未必是凸函数，需要验证单调性条件"
        },
        {
            title: "2. 凸优化问题形式化",
            body: `一个标准形式的凸优化问题可以简洁地写为：最小化 f_0(x)，满足 f_i(x) <= 0（i = 1, ..., m）和 Ax = b。这里目标函数 f_0 和不等式约束函数 f_i 都是凸函数，等式约束是仿射的。这种结构之所以重要，是因为它保证了任何局部最优解都是全局最优解——这是非凸优化无法提供的保证。

可行域是由所有约束条件交集定义的区域。凸优化的可行域必然是凸集，因为凸函数的下水平集是凸集，仿射集的交集也是凸集。最优值 p* 是目标函数在可行域上的下确界。如果可行域为空，问题不可行，p* = 无穷大。如果目标函数在可行域上无下界，p* = 负无穷。理解这些基本概念后，我们就可以进入更强大的对偶理论。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from scipy.optimize import minimize

# 最小化 f(x) = (x1-3)^2 + (x2+1)^2
# 满足 x1 + x2 <= 2, x1 >= 0
def objective(x):
    return (x[0] - 3)2 + (x[1] + 1)2

constraints = [
    {"type": "ineq", "fun": lambda x: 2 - x[0] - x[1]},  # x1 + x2 <= 2
    {"type": "ineq", "fun": lambda x: x[0]},              # x1 >= 0
    {"type": "ineq", "fun": lambda x: x[1]},              # x2 >= 0
]

result = minimize(objective, x0=[1.0, 1.0], constraints=constraints)
print(f"最优解: x = {result.x}")
print(f"最优值: f* = {result.fun:.4f}")
print(f"成功: {result.success}")`
                },
                {
                    lang: "python",
                    code: `# 线性规划示例: min c^T x, s.t. Ax <= b
from scipy.optimize import linprog

c = [-1, -2]  # 最大化 x1 + 2x2 (linprog 做最小化)
A = [
    [1, 1],    # x1 + x2 <= 4
    [2, 1],    # 2x1 + x2 <= 5
    [-1, 0],   # -x1 <= 0 (x1 >= 0)
    [0, -1],   # -x2 <= 0 (x2 >= 0)
]
b = [4, 5, 0, 0]

result = linprog(c, A_ub=A, b_ub=b, method="highs")
print(f"最优解: {result.x}")
print(f"最优值: {-result.fun:.4f}")`
                }
            ],
            table: {
                headers: ["问题类型", "目标函数", "约束", "典型应用"],
                rows: [
                    ["线性规划 LP", "线性 c^T x", "线性不等式/等式", "资源分配"],
                    ["二次规划 QP", "二次 x^T Q x", "线性", "SVM, 投资组合"],
                    ["二阶锥 SOCP", "线性", "二阶锥", "鲁棒优化"],
                    ["半定规划 SDP", "线性 Tr(CX)", "矩阵半正定", "控制理论"],
                    ["几何规划 GP", "Posynomial", "Posynomial", "电路设计"],
                ]
            },
            mermaid: `graph TD
    A["优化问题"] --> B["凸优化"]
    A --> C["非凸优化"]
    B --> D["线性规划 LP"]
    B --> E["二次规划 QP"]
    B --> F["SOCP"]
    B --> G["SDP"]
    D --> H["单纯形法/内点法"]
    E --> I["有效集法"]
    F --> J["内点法"]
    G --> K["原始对偶内点法"]`,
            tip: "将非凸问题转化为凸近似是工程实践中最常见的技巧，比如用 l1 范数近似 l0 范数",
            warning: "等式约束必须是仿射的（Ax = b），非线性等式约束会破坏凸性"
        },
        {
            title: "3. 拉格朗日对偶",
            body: `拉格朗日对偶是凸优化理论中最强大的工具之一。核心思想是将约束优化问题转化为无约束问题：通过引入拉格朗日乘子 lambda >= 0 和 nu，构造拉格朗日函数 L(x, lambda, nu) = f_0(x) + sum(lambda_i * f_i(x)) + sum(nu_j * h_j(x))。拉格朗日对偶函数 g(lambda, nu) 定义为 L 关于 x 的下确界。对偶函数总是凹函数，无论原问题是否为凸。

弱对偶性表明对偶最优值 d* 总是不超过原问题最优值 p*，即 d* <= p*。两者的差值称为对偶间隙。当对偶间隙为零时（d* = p*），我们称强对偶成立。Slater 条件给出了强对偶成立的一个充分条件：如果存在一个严格可行点（所有不等式约束严格小于零），则强对偶成立。强对偶的意义在于，我们可以通过求解对偶问题来获得原问题的最优值。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

# 计算拉格朗日对偶函数
# 原问题: min x^2, s.t. x >= 1 (即 1 - x <= 0)
def lagrangian(x, lam):
    """L(x, lambda) = x^2 + lambda * (1 - x)"""
    return x**2 + lam * (1 - x)

def dual_function(lam):
    """g(lambda) = inf_x L(x, lambda)"""
    # 对 x 求导: 2x - lambda = 0 -> x* = lambda/2
    x_star = lam / 2
    return lagrangian(x_star, lam)

# 对偶问题: max g(lambda), s.t. lambda >= 0
lambdas = np.linspace(0, 4, 100)
dual_vals = [dual_function(l) for l in lambdas]
best_idx = np.argmax(dual_vals)
print(f"对偶最优值: d* = {dual_vals[best_idx]:.4f}")
print(f"最优乘子: lambda* = {lambdas[best_idx]:.4f}")
print(f"原问题最优值: p* = 1.0 (x*=1)")`
                },
                {
                    lang: "python",
                    code: `# 验证 Slater 条件
def check_slater(feasible_points, inequality_funcs):
    """检查是否存在严格可行点"""
    for x in feasible_points:
        if all(f(x) < 0 for f in inequality_funcs):
            print(f"Slater 条件满足，严格可行点: x = {x}")
            return True
    print("未找到严格可行点")
    return False

# f1(x) = x1^2 + x2^2 - 4 <= 0 (圆盘)
# f2(x) = -x1 + 1 <= 0 (x1 >= 1)
f1 = lambda x: x[0]2 + x[1]2 - 4
f2 = lambda x: -x[0] + 1

candidates = [
    np.array([1.5, 0.0]),
    np.array([2.0, 0.0]),
    np.array([1.0, 0.0]),
]
check_slater(candidates, [f1, f2])`
                }
            ],
            table: {
                headers: ["概念", "定义", "性质"],
                rows: [
                    ["拉格朗日函数", "L = f_0 + sum(lambda_i f_i) + sum(nu_j h_j)", "关于 x 不一定凸"],
                    ["对偶函数", "g(lambda,nu) = inf_x L(x,lambda,nu)", "总是凹函数"],
                    ["弱对偶", "d* <= p*", "恒成立"],
                    ["强对偶", "d* = p*", "需 Slater 条件"],
                    ["对偶间隙", "p* - d*", "衡量对偶质量"],
                ]
            },
            mermaid: `graph LR
    A["原问题 Primal"] --> B["拉格朗日函数 L"]
    B --> C["对偶函数 g"]
    C --> D["对偶问题 Dual"]
    D --> E["max g(lambda,nu)"]
    E --> F{"强对偶?"}
    F -->|Slater 条件满足| G["d* = p*"]
    F -->|不满足| H["d* < p*"]`,
            tip: "对偶问题往往比原问题更容易求解，因为对偶函数天然凹且约束通常更简单",
            warning: "对偶乘子 lambda 必须非负，忽略这个约束会导致错误的对偶问题"
        },
        {
            title: "4. KKT 条件",
            body: `Karush-Kuhn-Tucker 条件是凸优化中最优解的充分必要条件（在约束规范成立时）。KKT 条件包含四个部分：首先是平稳性条件，即拉格朗日函数关于 x 的梯度为零；其次是原始可行性，x 必须满足所有原始约束；第三是对偶可行性，拉格朗日乘子 lambda >= 0；最后是互补松弛条件 lambda_i * f_i(x) = 0，这意味着要么约束是活跃的（f_i(x) = 0），要么对应的乘子为零。

互补松弛条件的直觉非常深刻：如果一个约束没有真正限制最优解（非活跃约束），那么它对最优值没有影响，对应的乘子必然为零。反之，如果乘子大于零，说明该约束是活跃的，正在把最优解推离无约束情况下的最优位置。KKT 条件不仅是最优性的判据，也是许多算法设计的理论基础。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from scipy.optimize import minimize

# min x1^2 + x2^2, s.t. x1 + x2 >= 1
# KKT 解析解:
# 平稳性: 2x1 - lambda = 0, 2x2 - lambda = 0
# 互补松弛: lambda * (1 - x1 - x2) = 0
# 情况1: lambda = 0 -> x1 = x2 = 0, 但不满足 x1+x2 >= 1
# 情况2: x1 + x2 = 1 -> x1 = x2 = 1/2, lambda = 1
x_star = np.array([0.5, 0.5])
lam_star = 1.0
print(f"KKT 解: x* = {x_star}, lambda* = {lam_star}")
print(f"互补松弛验证: {lam_star} * (1 - {x_star.sum()}) = 0")`
                },
                {
                    lang: "python",
                    code: `# 数值验证 KKT 条件
def verify_kkt(x, lam, grad_f0, grad_f, h_funcs):
    """验证 KKT 四个条件"""
    # 平稳性
    grad_L = grad_f0(x) + sum(l * gf for l, gf in zip(lam, grad_f(x)))
    stationarity = np.linalg.norm(grad_L) < 1e-6
    # 原始可行性
    primal_feas = all(h(x) <= 1e-6 for h in h_funcs)
    # 对偶可行性
    dual_feas = all(l >= -1e-6 for l in lam)
    # 互补松弛
    comp_slack = all(abs(l * h(x)) < 1e-6 for l, h in zip(lam, h_funcs))
    return {
        "平稳性": stationarity,
        "原始可行": primal_feas,
        "对偶可行": dual_feas,
        "互补松弛": comp_slack,
    }

# 测试 x1^2 + x2^2, x1+x2 >= 1
grad_f0 = lambda x: np.array([2*x[0], 2*x[1]])
grad_f = lambda x: [np.array([-1.0, -1.0])]  # 1-x1-x2 <= 0
h_funcs = [lambda x: 1 - x[0] - x[1]]
x_kkt = np.array([0.5, 0.5])
result = verify_kkt(x_kkt, [1.0], grad_f0, grad_f, h_funcs)
for k, v in result.items():
    print(f"  {k}: {v}")`
                }
            ],
            table: {
                headers: ["KKT 条件", "数学表达式", "物理含义"],
                rows: [
                    ["平稳性", "grad_x L = 0", "最优点处梯度平衡"],
                    ["原始可行", "f_i(x*) <= 0, h_j(x*) = 0", "解在可行域内"],
                    ["对偶可行", "lambda* >= 0", "乘子非负"],
                    ["互补松弛", "lambda_i* f_i(x*) = 0", "约束活跃则乘子非零"],
                ]
            },
            mermaid: `graph TD
    A["优化问题"] --> B["构造 KKT 条件"]
    B --> C["平稳性: grad L = 0"]
    B --> D["原始可行性"]
    B --> E["对偶可行性: lambda >= 0"]
    B --> F["互补松弛: lambda*f = 0"]
    C --> G["联立求解"]
    D --> G
    E --> G
    F --> G
    G --> H{"找到 x*, lambda*"}
    H -->|凸问题| I["全局最优解"]`,
            tip: "求解 KKT 方程组时，先枚举互补松弛的各种情况（哪些约束活跃），逐一验证",
            warning: "非凸问题中 KKT 条件只是必要条件而非充分条件，满足 KKT 不一定是全局最优"
        },
        {
            title: "5. 梯度下降法",
            body: `梯度下降法是优化中最基础也最常用的算法。核心更新规则是 x_{k+1} = x_k - alpha * grad f(x_k)，即沿着梯度的反方向（函数下降最快的方向）迈一步。步长 alpha 的选择至关重要：太大可能发散，太小收敛极慢。理论保证要求步长满足 0 < alpha <= 1/L，其中 L 是梯度 Lipschitz 常数（即 Hessian 的最大特征值上界）。

对于强凸且光滑的目标函数，梯度下降以线性速率收敛：f(x_k) - f* <= C * (1 - mu/L)^k，其中 mu 是强凸参数，L 是 Lipschitz 常数。条件数 kappa = L/mu 决定了收敛速度——条件数越大收敛越慢。在实际应用中，精确线搜索（通过最小化 f(x_k - alpha * grad f(x_k)) 确定最优步长）和回溯线搜索（Armijo 准则）是两种常见的步长选择策略。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

def gradient_descent(grad_f, x0, alpha=0.01, tol=1e-8, max_iter=10000):
    """基础梯度下降"""
    x = x0.copy()
    history = [x.copy()]
    for k in range(max_iter):
        g = grad_f(x)
        if np.linalg.norm(g) < tol:
            break
        x = x - alpha * g
        history.append(x.copy())
    return x, np.array(history)

# 测试: f(x) = x1^2 + 10*x2^2 (条件数大)
grad_f = lambda x: np.array([2*x[0], 20*x[1]])
x0 = np.array([5.0, 5.0])
alpha = 0.04  # 1/L = 1/20 = 0.05，取稍小值保证稳定
x_star, hist = gradient_descent(grad_f, x0, alpha)
print(f"迭代 {len(hist)} 次, 解: {x_star}")
print(f"f(x*) = {x_star[0]2 + 10*x_star[1]2:.8f}")`
                },
                {
                    lang: "python",
                    code: `def backtracking_line_search(f, grad_f, x, direction, alpha=1.0, 
                             c=1e-4, rho=0.5, max_iter=50):
    """回溯线搜索 (Armijo 准则)"""
    fx = f(x)
    slope = grad_f(x).dot(direction)
    for _ in range(max_iter):
        if f(x + alpha * direction) <= fx + c * alpha * slope:
            return alpha
        alpha *= rho
    return alpha

# 在梯度下降中使用回溯线搜索
f = lambda x: (x[0]-3)2 + 5*(x[1]+2)2
grad_f = lambda x: np.array([2*(x[0]-3), 10*(x[1]+2)])

x = np.array([0.0, 0.0])
for k in range(50):
    g = grad_f(x)
    if np.linalg.norm(g) < 1e-8:
        break
    alpha = backtracking_line_search(f, grad_f, x, -g)
    x = x - alpha * g
print(f"回溯线搜索 GD: x* = {x}, f* = {f(x):.8f}")`
                }
            ],
            table: {
                headers: ["步长策略", "特点", "适用场景"],
                rows: [
                    ["固定步长", "简单但需知道 L", "理论分析"],
                    ["回溯线搜索", "自适应，Armijo 准则", "最常用"],
                    ["精确线搜索", "每步最优但计算量大", "二次函数"],
                    ["衰减步长", "alpha_k = a/(b+k)", "随机梯度下降"],
                    ["Barzilai-Borwein", "近似逆 Hessian 信息", "大规模问题"],
                ]
            },
            mermaid: `graph LR
    A["初始点 x0"] --> B["计算梯度 grad f(x)"]
    B --> C{"||grad|| < tol?"}
    C -->|是| D["收敛, 返回 x"]
    C -->|否| E["确定步长 alpha"]
    E --> F["x = x - alpha * grad"]
    F --> B`,
            tip: "对于条件数大的问题，考虑预处理梯度下降或使用 Adam 等自适应方法",
            warning: "梯度下降在非凸函数中可能收敛到局部最优或鞍点，需要配合动量或随机性"
        },
        {
            title: "6. 牛顿法与拟牛顿法",
            body: `牛顿法利用二阶信息，更新规则为 x_{k+1} = x_k - H^{-1}(x_k) * grad f(x_k)，其中 H 是 Hessian 矩阵。与梯度下降只利用一阶信息不同，牛顿法在最优解附近具有二次收敛速度——这意味着每次迭代的有效精度位数大约翻倍。代价是每步需要计算和求逆 n * n 的 Hessian 矩阵，时间复杂度 O(n^3)，对大规模问题不可行。

拟牛顿法通过近似 Hessian 或其逆矩阵来避免直接计算二阶导数。BFGS 是最经典的拟牛顿算法，通过梯度差分信息迭代更新 Hessian 近似，保持了正定性且超线性收敛。L-BFGS 是 BFGS 的有限内存版本，只存储最近 m 次迭代的梯度差分，空间复杂度 O(mn)，适合大规模机器学习。在实际应用中，L-BFGS-B 还支持简单边界约束，是 SciPy 中最受欢迎的优化器之一。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

def newton_method(f, grad_f, hess_f, x0, tol=1e-10, max_iter=50):
    """牛顿法"""
    x = x0.copy()
    for k in range(max_iter):
        g = grad_f(x)
        if np.linalg.norm(g) < tol:
            break
        H = hess_f(x)
        # 确保 Hessian 正定 (加正则化)
        eigvals = np.linalg.eigvalsh(H)
        if eigvals[0] < 1e-10:
            H += (abs(eigvals[0]) + 1e-6) * np.eye(len(x))
        d = np.linalg.solve(H, g)
        x = x - d
        print(f"  迭代 {k+1}: ||grad|| = {np.linalg.norm(g):.2e}")
    return x

# Rosenbrock 函数 (banana 函数)
f = lambda x: (1-x[0])2 + 100*(x[1]-x[0]2)**2
grad_f = lambda x: np.array([-2*(1-x[0]) - 400*x[0]*(x[1]-x[0]2), 200*(x[1]-x[0]2)])
hess_f = lambda x: np.array([
    [2 - 400*x[1] + 1200*x[0]**2, -400*x[0]],
    [-400*x[0], 200]
])

x_star = newton_method(f, grad_f, hess_f, np.array([0.0, 0.0]))
print(f"牛顿法解: x* = {x_star}")`
                },
                {
                    lang: "python",
                    code: `from scipy.optimize import minimize

# 比较多种优化算法
f = lambda x: (1-x[0])2 + 100*(x[1]-x[0]2)**2
x0 = np.array([0.0, 0.0])

methods = ["BFGS", "L-BFGS-B", "Newton-CG", "Nelder-Mead"]
for method in methods:
    result = minimize(f, x0, method=method)
    print(f"{method:>12s}: iter={result.nit:>3d}, "
          f"f*={result.fun:.6f}, success={result.success}")

# BFGS 手动实现
def bfgs(grad_f, x0, max_iter=100):
    n = len(x0)
    H = np.eye(n)  # 初始 Hessian 逆近似
    x = x0.copy()
    for k in range(max_iter):
        g = grad_f(x)
        if np.linalg.norm(g) < 1e-10:
            break
        d = -H @ g
        # 简单线搜索
        alpha = 0.01
        while f(x + alpha * d) > f(x) + 1e-4 * alpha * g @ d:
            alpha *= 0.5
        s = alpha * d
        y = grad_f(x + s) - g
        if s @ y > 1e-10:
            rho = 1.0 / (s @ y)
            H = (np.eye(n) - rho * np.outer(s, y)) @ H @ (np.eye(n) - rho * np.outer(y, s)) + rho * np.outer(s, s)
        x = x + s
    return x

print(f"BFGS 手动: {bfgs(grad_f, x0)}")`
                }
            ],
            table: {
                headers: ["算法", "收敛速度", "每步复杂度", "存储"],
                rows: [
                    ["梯度下降", "线性 O((1-mu/L)^k)", "O(n)", "O(n)"],
                    ["牛顿法", "二次", "O(n^3)", "O(n^2)"],
                    ["BFGS", "超线性", "O(n^2)", "O(n^2)"],
                    ["L-BFGS", "超线性", "O(mn)", "O(mn)"],
                    ["共轭梯度", "线性", "O(nnz)", "O(n)"],
                ]
            },
            mermaid: `graph TD
    A["牛顿法"] --> B["计算 Hessian H"]
    A --> C["求解 H*d = grad"]
    B --> D["O(n^3) 复杂度"]
    C --> E["二次收敛"]
    A --> F["大规模不适用"]
    F --> G["拟牛顿法"]
    G --> H["BFGS 更新"]
    G --> I["L-BFGS 有限内存"]
    H --> J["超线性收敛 O(n^2)"]
    I --> K["适合机器学习 O(mn)"]`,
            tip: "L-BFGS 是深度学习之外最常用的优化器，SciPy 中 minimize(method='L-BFGS-B') 即可调用",
            warning: "牛顿法在 Hessian 非正定时可能朝上升方向走，必须做正定修正"
        },
        {
            title: "7. SciPy 实战：约束优化",
            body: `SciPy 提供了丰富的优化接口，scipy.optimize.minimize 是统一入口，支持多种算法。处理约束优化时，约束以字典列表形式传入，每个字典指定类型（ineq 或 eq）、约束函数和雅可比。对于大规模问题，trust-constr 算法支持完整的 Hessian 信息，而 SLSQP 是经典的序列二次规划方法。

实际工程中，约束优化的关键技巧包括：将复杂约束分解为简单的不等式组、提供约束的雅可比矩阵以加速收敛、选择适合问题规模的算法。对于机器学习中的投影梯度下降，也可以利用 SciPy 的投影算子将解拉回可行域。掌握这些工具后，你就可以将理论上的凸优化知识转化为解决实际问题的能力。`,
            code: [
                {
                    lang: "python",
                    code: `from scipy.optimize import minimize
import numpy as np

# 投资组合优化: 最小化风险, 满足期望收益 >= target
# min x^T Sigma x, s.t. mu^T x >= target, sum(x) = 1, x >= 0
Sigma = np.array([
    [0.04, 0.006, 0.012],
    [0.006, 0.09, 0.018],
    [0.012, 0.018, 0.16],
])
mu = np.array([0.08, 0.12, 0.15])
target = 0.11

def portfolio_risk(x):
    return x @ Sigma @ x

def portfolio_grad(x):
    return 2 * Sigma @ x

constraints = [
    {"type": "ineq", "fun": lambda x: mu @ x - target, 
     "jac": lambda x: mu},        # mu^T x >= target
    {"type": "eq", "fun": lambda x: np.sum(x) - 1, 
     "jac": lambda x: np.ones(3)}, # sum(x) = 1
]
bounds = [(0, 1) for _ in range(3)]  # 0 <= x_i <= 1

result = minimize(portfolio_risk, x0=np.array([1/3, 1/3, 1/3]),
                  jac=portfolio_grad, method="SLSQP",
                  bounds=bounds, constraints=constraints)
print(f"最优权重: {result.x}")
print(f"最小风险: {result.fun:.6f}")
print(f"期望收益: {mu @ result.x:.4f}")`
                },
                {
                    lang: "python",
                    code: `# trust-constr 方法处理更复杂的约束
from scipy.optimize import NonlinearConstraint, LinearConstraint, Bounds

# 示例: min (x1-1)^2 + (x2-2.5)^2
# s.t. x1 - 2*x2 + 2 >= 0, -x1 - 2*x2 + 6 >= 0, -x1 + 2*x2 + 2 >= 0
def obj(x):
    return (x[0]-1)2 + (x[1]-2.5)2

def grad_obj(x):
    return np.array([2*(x[0]-1), 2*(x[1]-2.5)])

def hess_obj(x, v):
    return v * 2 * np.eye(2)

linear_constr = LinearConstraint(
    A=[[-1, 2], [1, 2], [1, -2]],  # 注意符号翻转
    lb=[-np.inf, -6.0, -2.0],
    ub=[2.0, np.inf, np.inf],
)

bounds = Bounds([0, 0], [np.inf, np.inf])

result = minimize(obj, x0=[2, 0], jac=grad_obj,
                  hess=hess_obj, method="trust-constr",
                  bounds=bounds, constraints=[linear_constr])
print(f"最优解: {result.x}")
print(f"最优值: {result.fun:.6f}")
print(f"迭代次数: {result.nit}")`
                }
            ],
            table: {
                headers: ["SciPy 方法", "适用场景", "约束支持", "推荐度"],
                rows: [
                    ["SLSQP", "中小规模", "等式/不等式/边界", "五星"],
                    ["trust-constr", "中等规模", "线性/非线性", "四星"],
                    ["L-BFGS-B", "大规模无约束", "仅边界约束", "五星 (无约束)"],
                    ["COBYLA", "不可导问题", "不等式约束", "三星"],
                    ["Nelder-Mead", "黑箱优化", "无约束", "二星"],
                ]
            },
            mermaid: `graph TD
    A["实际优化问题"] --> B{"有约束?"}
    B -->|无| C["L-BFGS-B / Newton-CG"]
    B -->|有| D{"约束类型?"}
    D -->|边界约束| E["L-BFGS-B"]
    D -->|线性+边界| F["SLSQP"]
    D -->|非线性约束| G["trust-constr"]
    D -->|不可导| H["COBYLA"]
    C --> I["求解"]
    E --> I
    F --> I
    G --> I
    H --> I
    I --> J["验证 KKT 条件"]`,
            tip: "总是提供梯度（jac）和 Hessian（hess）信息，可以大幅提升收敛速度",
            warning: "SLSQP 对初始点敏感，如果失败尝试不同的 x0 或切换到 trust-constr"
        },
    ],
};
