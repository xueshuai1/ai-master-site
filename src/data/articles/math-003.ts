import { Article } from '../knowledge';

export const article: Article = {
  id: "math-003",
  title: "概率论基础",
  category: "math",
  tags: ["概率论", "随机变量", "贝叶斯"],
  summary: "从随机事件到贝叶斯定理，掌握 AI 所需的概率论基础",
  date: "2026-04-12",
  readTime: "18 min",
  level: "入门",
  content: [
    {
      title: "1. 随机事件与概率",
      body: `概率论是研究随机现象数量规律的数学分支，也是 AI 和机器学习的数学基石。在机器学习中，我们处理的几乎所有问题都带有不确定性：数据有噪声、模型有误差、预测有置信度。理解概率论，就是理解如何量化不确定性。

从最基本的概念出发，随机试验是指在相同条件下可以重复进行、每次结果不确定但所有可能结果已知的实验。例如掷一枚骰子，我们知道结果必然是 1 到 6 之一，但具体是哪一面则是随机的。样本空间是所有可能结果的集合，记作 Omega。随机事件是样本空间的子集，比如掷骰子得到偶数点就是一个事件。概率则是度量事件发生可能性大小的数值，满足非负性、规范性和可列可加性三条公理。

在编程实践中，我们经常需要模拟随机过程来验证理论结论，或者用蒙特卡洛方法估算复杂概率。理解这些基础概念是后续学习条件概率、分布和贝叶斯定理的前提。`,
      code: [
        {
          lang: "python",
          code: `import random

# 模拟掷骰子实验
def simulate_dice(n: int = 10000) -> dict[int, float]:
    counts = {i: 0 for i in range(1, 7)}
    for _ in range(n):
        counts[random.randint(1, 6)] += 1
    return {k: v / n for k, v in counts.items()}

print(simulate_dice(10000))`,
        },
        {
          lang: "python",
          code: `# 蒙特卡洛方法估算圆周率 pi
import random

def estimate_pi(n: int = 100000) -> float:
    inside = 0
    for _ in range(n):
        x, y = random.random(), random.random()
        if x2 + y2 <= 1:
            inside += 1
    return 4 * inside / n

print(f"Pi ≈ {estimate_pi()}")`,
        },
      ],
      table: {
        headers: ["概念", "数学符号", "示例"],
        rows: [
          ["随机试验", "E", "掷骰子、抛硬币"],
          ["样本空间", "Ω", "{1, 2, 3, 4, 5, 6}"],
          ["随机事件", "A ⊆ Ω", "掷出偶数 = {2, 4, 6}"],
          ["必然事件", "Ω", "掷出 1~6 点"],
          ["不可能事件", "∅", "掷出 7 点"],
        ],
      },
      mermaid: `graph TD
    A["随机试验"] --> B["样本空间 Ω"]
    B --> C["事件 A ⊆ Ω"]
    C --> D["概率 P(A)"]
    D --> E["0 ≤ P(A) ≤ 1"]
    D --> F["P(Ω) = 1"]
    D --> G["可列可加性"]`,
      tip: "建议用 Python 的 random 模块动手模拟，直观感受频率趋近于概率的过程",
      warning: "概率为 0 的事件不一定是不可能事件，在连续概率空间中需要区分这两个概念",
    },
    {
      title: "2. 条件概率与独立性",
      body: `条件概率是概率论中最实用的概念之一。它回答的问题是：在已知事件 B 发生的前提下，事件 A 发生的概率是多少？记作 P(A|B)，计算公式为 P(A|B) = P(A∩B) / P(B)。这个看似简单的公式蕴含着深刻的洞察力，它告诉我们新信息如何改变我们对不确定性的判断。

全概率公式和贝叶斯公式是条件概率的两个重要推论。全概率公式允许我们将一个复杂事件的概率分解为多个互斥条件下的概率之和。贝叶斯公式则实现了逆向推断：从 P(B|A) 推导 P(A|B)，这正是机器学习中参数推断的核心思想。

两个事件 A 和 B 独立意味着 P(A∩B) = P(A) × P(B)，即知道 B 发生与否不影响 A 的概率。独立性假设极大地简化了计算，朴素贝叶斯分类器就是建立在特征条件独立假设之上的。但现实中特征往往不独立，这就是朴素贝叶斯虽然简单却常常有效的原因——它抓住了主要矛盾。`,
      code: [
        {
          lang: "python",
          code: `# 条件概率计算：医学检测示例
# 已知：疾病患病率 1%，检测灵敏度 99%，假阳性率 5%
def bayes_medical():
    p_disease = 0.01          # 先验概率
    p_positive_given_disease = 0.99   # 灵敏度
    p_positive_given_healthy = 0.05   # 假阳性率
    p_healthy = 1 - p_disease
    
    # 全概率公式求 P(阳性)
    p_positive = (p_positive_given_disease * p_disease +
                  p_positive_given_healthy * p_healthy)
    
    # 贝叶斯公式
    p_disease_given_positive = (
        p_positive_given_disease * p_disease / p_positive
    )
    return p_disease_given_positive

print(f"P(患病|阳性) = {bayes_medical():.4f}")`,
        },
        {
          lang: "python",
          code: `# 验证独立性：掷两枚骰子
import random

def check_independence(n: int = 100000):
    a_and_b = 0  # 两枚都是6
    a_count = 0   # 第一枚是6
    b_count = 0   # 第二枚是6
    
    for _ in range(n):
        d1 = random.randint(1, 6)
        d2 = random.randint(1, 6)
        if d1 == 6: a_count += 1
        if d2 == 6: b_count += 1
        if d1 == 6 and d2 == 6: a_and_b += 1
    
    p_a = a_count / n
    p_b = b_count / n
    p_ab = a_and_b / n
    print(f"P(A) = {p_a:.4f}")
    print(f"P(B) = {p_b:.4f}")
    print(f"P(A∩B) = {p_ab:.4f}")
    print(f"P(A)*P(B) = {p_a * p_b:.4f}")
    print(f"独立? {abs(p_ab - p_a * p_b) < 0.01}")

check_independence()`,
        },
      ],
      table: {
        headers: ["公式名称", "表达式", "用途"],
        rows: [
          ["条件概率", "P(A|B) = P(A∩B) / P(B)", "已知 B 求 A"],
          ["乘法公式", "P(A∩B) = P(A) × P(B|A)", "联合概率分解"],
          ["全概率公式", "P(A) = Σ P(A|Bi)P(Bi)", "分解复杂事件"],
          ["贝叶斯公式", "P(A|B) = P(B|A)P(A)/P(B)", "逆向推断"],
          ["独立性", "P(A∩B) = P(A)P(B)", "简化联合概率"],
        ],
      },
      mermaid: `graph LR
    A["先验概率 P(A)"] --> B["贝叶斯公式"]
    C["似然度 P(B|A)"] --> B
    D["证据 P(B)"] --> B
    B --> E["后验概率 P(A|B)"]
    E --> F["更新信念"]`,
      tip: "理解贝叶斯公式的直觉：后验概率正比于先验概率乘以似然度，这是所有贝叶斯方法的核心",
      warning: "条件概率不满足交换律，P(A|B) 通常不等于 P(B|A)，这是很多人常犯的逻辑错误",
    },
    {
      title: "3. 随机变量与分布",
      body: `随机变量是将随机试验的结果映射到实数的函数。它让我们能用数学工具来描述和分析随机现象。随机变量分为离散型和连续型两大类：离散型随机变量取值是可数集合，比如掷骰子的点数；连续型随机变量取值是区间或整个实数轴，比如测量一个人的身高。

描述随机变量的核心工具是分布。离散型随机变量用概率质量函数 PMF 描述，连续型随机变量用概率密度函数 PDF 描述。累积分布函数 CDF 则对两者都适用，定义为 F(x) = P(X ≤ x)，它完整刻画了随机变量的统计性质。

期望值描述了随机变量的平均水平，方差描述了波动程度。在机器学习中，损失函数的期望就是风险，我们训练模型的过程本质上就是在最小化期望风险。理解随机变量及其分布，是理解数据分布假设和模型设计的基础。`,
      code: [
        {
          lang: "python",
          code: `# 离散随机变量：二项分布模拟
import numpy as np

def binomial_simulation(n: int = 10, p: float = 0.5, trials: int = 10000):
    samples = np.random.binomial(n, p, trials)
    pmf = {}
    for k in samples:
        pmf[k] = pmf.get(k, 0) + 1
    pmf = {k: v / trials for k, v in sorted(pmf.items())}
    
    print(f"理论均值: {n * p}")
    print(f"样本均值: {np.mean(samples):.4f}")
    print(f"理论方差: {n * p * (1 - p)}")
    print(f"样本方差: {np.var(samples):.4f}")
    return pmf

binomial_simulation()`,
        },
        {
          lang: "python",
          code: `# 连续随机变量：正态分布 PDF 和 CDF
import numpy as np
from scipy.stats import norm

def normal_distribution_analysis():
    mu, sigma = 0, 1  # 标准正态分布
    x = np.linspace(-4, 4, 200)
    
    pdf = norm.pdf(x, mu, sigma)
    cdf = norm.cdf(x, mu, sigma)
    
    # 68-95-99.7 法则验证
    print(f"P(|X| < 1σ) = {norm.cdf(1) - norm.cdf(-1):.4f}")
    print(f"P(|X| < 2σ) = {norm.cdf(2) - norm.cdf(-2):.4f}")
    print(f"P(|X| < 3σ) = {norm.cdf(3) - norm.cdf(-3):.4f}")
    
    # 分位数计算
    print(f"95% 分位数: {norm.ppf(0.95):.4f}")

normal_distribution_analysis()`,
        },
      ],
      table: {
        headers: ["类型", "描述函数", "关键性质"],
        rows: [
          ["离散型", "PMF: P(X=x)", "Σ P(X=x) = 1"],
          ["连续型", "PDF: f(x)", "∫ f(x)dx = 1"],
          ["通用", "CDF: F(x)=P(X≤x)", "单调非减, F(-∞)=0"],
          ["离散型", "期望: Σ x·P(X=x)", "加权平均"],
          ["连续型", "期望: ∫ x·f(x)dx", "加权积分"],
        ],
      },
      mermaid: `graph TD
    A["随机变量 X"] --> B["离散型"]
    A --> C["连续型"]
    B --> D["PMF 概率质量函数"]
    B --> E["二项分布/泊松分布"]
    C --> F["PDF 概率密度函数"]
    C --> G["正态分布/均匀分布"]
    D --> H["CDF 累积分布函数"]
    F --> H`,
      tip: "CDF 是最通用的描述方式，离散和连续都适用，且 F(x) 的导数就是 PDF",
      warning: "PDF 的值可以大于 1，它不是概率而是概率密度，真正的概率是 PDF 在区间上的积分",
    },
    {
      title: "4. 期望与方差",
      body: `期望值是随机变量的加权平均，权重就是概率。它代表了随机变量的中心位置，是长期平均的意义。方差则度量了随机变量偏离期望值的程度，方差越大说明数据越分散。标准差是方差的平方根，与原始数据有相同的量纲，在实际应用中更直观。

**期望运算具有线性性质**：E(aX + bY) = aE(X) + bE(Y)，无论 X 和 Y 是否独立都成立。但方差不是线性的：当 X 和 Y 独立时，Var(aX + bY) = a²Var(X) + b²Var(Y)。这个区别非常重要，在组合多个随机变量时必须注意。

协方差和相关系数度量了两个随机变量之间的线性关系。协方差的正负号表示方向，相关系数标准化到了 -1 到 1 之间。在机器学习中，协方差矩阵是主成分分析 PCA 的核心，它帮助我们找到数据变化最大的方向。切比雪夫不等式则给出了一个通用的概率上界，无论分布形状如何都成立。`,
      code: [
        {
          lang: "python",
          code: `# 期望和方差的计算与验证
import numpy as np

def expectation_and_variance():
    # 模拟：掷两个骰子之和
    n = 1000000
    d1 = np.random.randint(1, 7, n)
    d2 = np.random.randint(1, 7, n)
    S = d1 + d2  # 两枚骰子之和
    
    # 理论值
    e_d = 3.5
    var_d = 35/12  # 单个骰子方差
    e_s_theory = 2 * e_d  # 期望的线性性质
    var_s_theory = 2 * var_d  # 独立时方差可加
    
    print(f"E(S) 理论={e_s_theory:.4f}, 样本={np.mean(S):.4f}")
    print(f"Var(S) 理论={var_s_theory:.4f}, 样本={np.var(S):.4f}")
    
    # 验证线性性：E(X+Y) = E(X) + E(Y)
    print(f"E(X)+E(Y) = {np.mean(d1) + np.mean(d2):.4f}")

expectation_and_variance()`,
        },
        {
          lang: "python",
          code: `# 协方差矩阵与 PCA 的关系
import numpy as np

def covariance_demo():
    np.random.seed(42)
    # 生成相关数据
    x = np.random.randn(200)
    y = 0.5 * x + np.random.randn(200) * 0.3
    
    # 计算协方差矩阵
    cov_matrix = np.cov(x, y)
    corr_matrix = np.corrcoef(x, y)
    
    print(f"协方差矩阵:\n{cov_matrix}")
    print(f"相关系数矩阵:\n{corr_matrix}")
    
    # 特征值分解
    eigenvalues = np.linalg.eigvals(cov_matrix)
    print(f"特征值: {np.sort(eigenvalues)[::-1]}")
    print(f"第一主成分解释方差比: {max(eigenvalues)/sum(eigenvalues):.4f}")

covariance_demo()`,
        },
      ],
      table: {
        headers: ["概念", "公式", "意义"],
        rows: [
          ["期望 E(X)", "Σ x·P(X=x) 或 ∫ x·f(x)dx", "中心位置"],
          ["方差 Var(X)", "E[(X-μ)²]", "离散程度"],
          ["标准差 σ", "√Var(X)", "同量纲的离散度"],
          ["协方差 Cov(X,Y)", "E[(X-μx)(Y-μy)]", "线性关系方向"],
          ["相关系数 ρ", "Cov(X,Y)/(σx·σy)", "标准化线性关系"],
        ],
      },
      mermaid: `graph LR
    A["随机变量 X"] --> B["期望 E(X)"]
    A --> C["方差 Var(X)"]
    B --> D["中心趋势"]
    C --> E["离散程度"]
    A --> F["随机变量 Y"]
    A --> G["协方差 Cov(X,Y)"]
    F --> G
    G --> H["相关系数 ρ"]`,
      tip: "期望的线性性质是概率论中最强大的工具之一，无论变量是否相关都成立",
      warning: "方差不具有线性性质，只有独立时 Var(X+Y) = Var(X) + Var(Y)，相关时必须加上 2Cov(X,Y) 项",
    },
    {
      title: "5. 常见分布",
      body: `在概率论和统计学中，有几个分布因其重要性和广泛出现而成为必须掌握的基础知识。伯努利分布是最简单的离散分布，描述单次二元试验的结果。二项分布是 n 次独立伯努利试验中成功次数的分布。泊松分布描述单位时间内随机事件发生的次数。正态分布则是最重要的连续分布，它出现在自然科学和社会科学的几乎每一个角落。

正态分布之所以如此重要，不仅因为中心极限定理保证了大量独立随机变量之和趋向正态分布，更因为它具有优美的数学性质：两个正态分布的线性组合仍是正态分布，正态分布的样本均值和样本方差相互独立。

在机器学习中，正态分布无处不在：高斯朴素贝叶斯假设特征服从正态分布，线性回归假设误差项服从正态分布，高斯过程直接将函数空间建模为多元正态分布。理解这些分布的性质和适用场景，是选择正确模型的关键。`,
      code: [
        {
          lang: "python",
          code: `# 三大离散分布对比
import numpy as np
from scipy.stats import bernoulli, binom, poisson

def discrete_distributions():
    # 伯努利分布
    p = 0.3
    print(f"伯努利: P(X=1) = {bernoulli.pmf(1, p):.3f}")
    
    # 二项分布
    n, p_bin = 20, 0.3
    k_values = list(range(n + 1))
    pmf_bin = binom.pmf(k_values, n, p_bin)
    mode_bin = np.argmax(pmf_bin)
    print(f"二项 B({n},{p_bin}): 众数={mode_bin}, 均值={n*p_bin}")
    
    # 泊松分布
    lam = 6
    k_pois = list(range(15))
    pmf_pois = poisson.pmf(k_pois, lam)
    print(f"泊松 λ={lam}: P(X=6) = {pmf_pois[6]:.3f}")
    print(f"泊松均值={lam}, 方差={lam}")

discrete_distributions()`,
        },
        {
          lang: "python",
          code: `# 正态分布的性质可视化
import numpy as np
from scipy.stats import norm

def normal_properties():
    # 不同参数的正态分布
    params = [(0, 1), (0, 2), (2, 1)]
    x = np.linspace(-6, 8, 300)
    
    for mu, sigma in params:
        pdf = norm.pdf(x, mu, sigma)
        peak = norm.pdf(mu, mu, sigma)
        print(f"N({mu}, {sigma}²): 峰值 f(μ) = {peak:.4f}")
        print(f"  P(μ-σ < X < μ+σ) = {norm.cdf(mu+sigma, mu, sigma) - norm.cdf(mu-sigma, mu, sigma):.4f}")
    
    # 标准正态分布的尾部概率
    print(f"P(Z > 1.96) = {1 - norm.cdf(1.96):.4f}")
    print(f"P(Z > 2.58) = {1 - norm.cdf(2.58):.4f}")

normal_properties()`,
        },
      ],
      table: {
        headers: ["分布", "PMF/PDF", "期望", "方差"],
        rows: [
          ["伯努利 B(p)", "p^x(1-p)^(1-x)", "p", "p(1-p)"],
          ["二项 B(n,p)", "C(n,k)p^k(1-p)^(n-k)", "np", "np(1-p)"],
          ["泊松 P(λ)", "e^(-λ)λ^k/k!", "λ", "λ"],
          ["正态 N(μ,σ²)", "1/(σ√2π)exp(-(x-μ)²/2σ²)", "μ", "σ²"],
          ["均匀 U(a,b)", "1/(b-a)", "(a+b)/2", "(b-a)²/12"],
        ],
      },
      mermaid: `graph TD
    A["伯努利分布"] -->|"n次独立"| B["二项分布"]
    B -->|"n→∞, p→0, np=λ"| C["泊松分布"]
    B -->|"n→∞"| D["正态分布"]
    C -->|"λ→∞"| D
    D --> E["标准正态 N(0,1)"]
    E --> F["z 分数转换"]`,
      tip: "记住正态分布的 68-95-99.7 法则：约 68% 的数据在 μ±σ 内，95% 在 μ±2σ 内，99.7% 在 μ±3σ 内",
      warning: "二项分布近似为正态分布的条件是 np > 5 且 n(1-p) > 5，否则近似效果很差",
    },
    {
      title: "6. 大数定律与中心极限定理",
      body: `大数定律和中心极限定理是概率论中最重要的两个定理，它们构成了统计推断的理论基础，也是 AI 模型能够从有限数据中学习泛化的数学保证。

**大数定律告诉我们**：当独立重复试验次数趋向无穷时，样本均值以概率收敛于期望值。这意味着只要你收集足够多的数据，样本统计量就能准确反映总体参数。这给了我们信心：数据越多，估计越准。大数定律有弱形式和强形式之分，弱大数定律说的是依概率收敛，强大数定律说的是几乎处处收敛。

**中心极限定理更加神奇**：无论原始分布是什么形状，只要样本量足够大，样本均值的分布就趋近于正态分布。这解释了为什么正态分布在自然界中如此普遍——很多现象都是大量微小独立因素叠加的结果。在机器学习中，这意味着我们可以用正态分布来近似各种统计量的分布，从而进行假设检验和置信区间估计。`,
      code: [
        {
          lang: "python",
          code: `# 大数定律的可视化验证
import numpy as np

def law_of_large_numbers():
    n_max = 100000
    true_mean = 0.5  # 均匀分布 U(0,1) 的期望
    
    # 生成样本并计算累积均值
    samples = np.random.uniform(0, 1, n_max)
    cumulative_mean = np.cumsum(samples) / np.arange(1, n_max + 1)
    
    # 验证收敛性
    for n in [100, 1000, 10000, 100000]:
        err = abs(cumulative_mean[n-1] - true_mean)
        print(f"n={n:>7d}: 样本均值={cumulative_mean[n-1]:.6f}, 误差={err:.6f}")
    
    print(f"\n真实期望: {true_mean}")
    print(f"大数定律: 样本均值 → 理论期望")

law_of_large_numbers()`,
        },
        {
          lang: "python",
          code: `# 中心极限定理演示：任意分布的样本均值趋向正态
import numpy as np
from scipy.stats import norm, kstest

def central_limit_theorem():
    np.random.seed(42)
    sample_size = 50  # 每组样本量
    n_groups = 10000   # 组数
    
    # 用指数分布（明显非正态）
    group_means = []
    for _ in range(n_groups):
        sample = np.random.exponential(scale=2, size=sample_size)
        group_means.append(np.mean(sample))
    
    sample_means = np.array(group_means)
    theoretical_mean = 2  # 指数分布均值
    theoretical_std = 2 / np.sqrt(sample_size)
    
    # KS 检验正态性
    z_scores = (sample_means - theoretical_mean) / theoretical_std
    ks_stat, p_value = kstest(z_scores, "norm")
    
    print(f"样本均值分布: mean={np.mean(sample_means):.4f}, std={np.std(sample_means):.4f}")
    print(f"理论值: mean={theoretical_mean}, std={theoretical_std:.4f}")
    print(f"KS 检验 p={p_value:.4f} (>0.05 则接受正态假设)")

central_limit_theorem()`,
        },
      ],
      table: {
        headers: ["定理", "核心结论", "应用"],
        rows: [
          ["弱大数定律", "样本均值依概率收敛于期望", "频率估计概率"],
          ["强大数定律", "样本均值几乎处处收敛于期望", "严格理论保证"],
          ["中心极限定理", "样本均值分布趋向正态", "置信区间、假设检验"],
          ["切比雪夫不等式", "P(|X-μ|≥kσ) ≤ 1/k²", "通用概率上界"],
          ["棣莫弗-拉普拉斯", "二项分布的正态近似", "大样本二项推断"],
        ],
      },
      mermaid: `graph TD
    A["独立同分布样本 X1,...,Xn"] --> B["样本均值 X̄n"]
    B --> C["大数定律"]
    B --> D["中心极限定理"]
    C --> E["X̄n → μ (n→∞)"]
    D --> F["√n(X̄n-μ)/σ → N(0,1)"]
    E --> G["估计的一致性"]
    F --> H["正态近似推断"]`,
      tip: "中心极限定理要求样本独立同分布，样本量一般建议 n ≥ 30，但如果原始分布严重偏态则需要更大的样本",
      warning: "中心极限定理说的是样本均值的分布趋向正态，不是说原始数据本身变正态了，这是常见的误解",
    },
    {
      title: "7. 贝叶斯定理实战",
      body: `贝叶斯定理是概率论中最具哲学深度和实用价值的公式。它描述了我们如何在获得新证据后更新信念：后验概率正比于先验概率乘以似然度。这个简洁的公式统一了频率学派和贝叶斯学派的方法论，也是现代 AI 中不确定性建模的核心工具。

在医疗检测中，贝叶斯定理揭示了一个反直觉的事实：即使检测准确率高达 99%，对于罕见疾病，阳性结果真正患病的概率可能仍然很低。这是因为先验概率（患病率）太低了。这个结论对公共卫生决策和个体健康判断都有深远影响。

在自然语言处理的拼写纠正中，贝叶斯方法通过计算 P(正确拼写|观测到的错误拼写) 来推断用户真正想输入的单词。谷歌的拼写纠正系统就使用了贝叶斯方法，结合语言模型（先验）和编辑距离模型（似然度），实现了高效的自动纠错。朴素贝叶斯分类器更是文本分类的经典算法，在垃圾邮件过滤和情感分析中广泛应用。`,
      code: [
        {
          lang: "python",
          code: `# 贝叶斯定理：医疗检测的完整分析
from typing import NamedTuple

class TestResult(NamedTuple):
    sensitivity: float    # 真阳性率
    specificity: float    # 真阴性率
    prevalence: float     # 患病率

def bayes_analysis(test: TestResult) -> dict:
    p_d = test.prevalence
    p_h = 1 - p_d
    sens = test.sensitivity
    spec = test.specificity
    
    # 全概率
    p_pos = sens * p_d + (1 - spec) * p_h
    p_neg = (1 - sens) * p_d + spec * p_h
    
    # 贝叶斯
    ppv = sens * p_d / p_pos      # 阳性预测值
    npv = spec * p_h / p_neg      # 阴性预测值
    
    return {"PPV": ppv, "NPV": npv, "P(pos)": p_pos}

# 案例1：罕见病检测
rare = TestResult(0.99, 0.95, 0.001)
print(f"罕见病: PPV={bayes_analysis(rare)['PPV']:.4f}")

# 案例2：常见病检测
common = TestResult(0.99, 0.95, 0.3)
print(f"常见病: PPV={bayes_analysis(common)['PPV']:.4f}")`,
        },
        {
          lang: "python",
          code: `# 贝叶斯拼写纠正器
import re
from collections import Counter

class SpellCorrector:
    def __init__(self, corpus: str):
        words = re.findall(r"\\w+", corpus.lower())
        self.word_freq = Counter(words)
        self.total = len(words)
        self.alphabet = "abcdefghijklmnopqrstuvwxyz"
    
    def P(self, word: str) -> float:
        """先验概率：词在语料中的频率"""
        return self.word_freq.get(word, 1) / self.total
    
    def edits(self, word: str) -> set[str]:
        """编辑距离为1的候选词"""
        splits = [(word[:i], word[i:]) for i in range(len(word)+1)]
        deletes = [L+R[1:] for L,R in splits if R]
        inserts = [L+c+R for L,R in splits for c in self.alphabet]
        return set(deletes + inserts)
    
    def correct(self, word: str) -> str:
        """贝叶斯：argmax P(c|w) ∝ P(w|c)·P(c)"""
        word = word.lower()
        if word in self.word_freq:
            return word
        candidates = self.edits(word) & set(self.word_freq)
        if not candidates:
            return word
        return max(candidates, key=self.P)

corpus = "this is a simple test corpus with some common english words and the word spelling is very important"
sc = SpellCorrector(corpus)
print(f"corect → {sc.correct('corect')}")
print(f"importnt → {sc.correct('importnt')}")`,
        },
      ],
      table: {
        headers: ["概念", "符号", "含义"],
        rows: [
          ["先验概率", "P(H)", "看到证据前的信念"],
          ["似然度", "P(E|H)", "假设成立时证据出现的概率"],
          ["证据", "P(E)", "证据的边际概率"],
          ["后验概率", "P(H|E)", "看到证据后的更新信念"],
          ["贝叶斯因子", "P(E|H)/P(E|¬H)", "证据对假设的支持强度"],
        ],
      },
      mermaid: `graph LR
    A["先验信念 P(H)"] --> B["观察到证据 E"]
    B --> C["计算似然 P(E|H)"]
    C --> D["贝叶斯公式"]
    D --> E["后验信念 P(H|E)"]
    E --> F["新一轮证据"]
    F --> B
    A --> G["成为下一轮的先验"]`,
      tip: "贝叶斯更新的精髓在于迭代：今天的后验就是明天的先验，持续用新数据更新你的信念",
      warning: "贝叶斯方法对先验的选择敏感，不当的先验会导致有偏的后验。在实际应用中需要做敏感性分析",
    },
  ],
};
