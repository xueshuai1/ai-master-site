import { Article } from '../knowledge';

export const article: Article = {
    id: "math-005",
    title: "统计推断",
    category: "math",
    tags: ["统计", "MLE", "贝叶斯推断"],
    summary: "从极大似然到贝叶斯推断，掌握统计推断的核心方法",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
      {
        title: "1. 样本与总体：统计推断的起点",
        body: `**统计推断的核心目标是**：通过有限的样本来了解无限的总体。我们永远无法观测到总体中的每一个个体，但我们可以精心抽取一个代表性样本，用这个样本的信息去推断总体的特征。

总体（Population）是研究对象的全体，由一个概率分布描述。样本（Sample）是从总体中独立抽取的一组观测值 X₁, X₂, ..., Xₙ，它们被称为独立同分布（i.i.d.）的随机变量。样本统计量（如样本均值、样本方差）是随机变量，而总体参数（如总体均值 μ、总体方差 σ²）是固定但未知的常数。

理解样本与总体的关系是统计推断的基石。样本均值 X̄ 是总体均值 μ 的无偏估计，样本方差 S² 用 n-1 做分母才能成为 σ² 的无偏估计（Bessel 校正）。这些看似细微的区别，背后是大数定律和中心极限定理在支撑。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# 从正态总体中抽样
np.random.seed(42)
population_mean = 100
population_std = 15
sample_size = 30

sample = np.random.normal(population_mean, population_std, sample_size)
sample_mean = np.mean(sample)
sample_var = np.var(sample, ddof=1)  # Bessel 校正
print(f"样本均值: {sample_mean:.2f}, 样本方差: {sample_var:.2f}")`
          },
          {
            lang: "python",
            code: `import scipy.stats as stats

# 验证中心极限定理
n_simulations = 10000
sample_means = []
for _ in range(n_simulations):
    s = np.random.exponential(scale=2, size=50)
    sample_means.append(np.mean(s))

# 样本均值的分布应近似正态
mean_of_means = np.mean(sample_means)
std_of_means = np.std(sample_means)
print(f"CLT 验证: 均值={mean_of_means:.4f}, 标准差={std_of_means:.4f}")`
          }
        ],
        table: {
          headers: ["概念", "符号", "性质"],
          rows: [
            ["总体均值", "μ", "固定但未知"],
            ["样本均值", "X̄", "随机变量, E[X̄]=μ"],
            ["总体方差", "σ²", "固定但未知"],
            ["样本方差", "S²", "E[S²]=σ² (ddof=1)"],
            ["样本大小", "n", "影响估计精度"]
          ]
        },
        mermaid: `graph TD
    A["总体 Population"] -->|"随机抽样"| B["样本 Sample"]
    B --> C["计算统计量 X̄, S²"]
    C --> D["推断总体参数 μ, σ²"]
    D -->|"评估精度"| E["标准误 SE = σ/√n"]`,
        tip: "实际工作中，永远先检查样本是否具有代表性。抽样偏差会导致所有后续推断失去意义，无论方法多么精巧。",
        warning: "样本量 n 较小时，样本均值的标准误差很大，此时做出的推断可靠性很低。一般建议 n≥30 才能较好利用中心极限定理。"
      },
      {
        title: "2. 参数估计：点估计与估计量的性质",
        body: `参数估计是统计推断的第一大类问题：给定样本数据，我们如何估计总体的未知参数 θ？最直接的方法是构造一个估计量 θ̂ = f(X₁, ..., Xₙ)，用它作为 θ 的近似值。

一个好的估计量需要满足几个关键性质。无偏性（Unbiasedness）要求 E[θ̂] = θ，即估计量的期望等于真实参数。一致性（Consistency）要求当样本量 n→∞ 时，θ̂ 依概率收敛到 θ。有效性（Efficiency）则比较两个无偏估计量的方差，方差越小越有效。此外，充分统计量包含了样本中关于 θ 的全部信息，是构造最优估计量的关键。

矩估计法是最直观的构造估计量的方法：用样本矩替代总体矩来解出参数。虽然简单，但矩估计量往往不是最优的——极大似然估计通常具有更好的统计性质。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# 矩估计 vs 样本统计量
data = np.array([12.5, 14.2, 11.8, 13.6, 15.1, 12.9, 14.7, 13.3])

# 一阶矩估计 = 样本均值
theta_hat_mean = np.mean(data)
# 二阶矩估计方差
theta_hat_var = np.mean((data - theta_hat_mean) ** 2)
# 无偏方差（Bessel 校正）
theta_hat_var_unbiased = np.var(data, ddof=1)

print(f"矩估计均值: {theta_hat_mean:.3f}")
print(f"矩估计方差: {theta_hat_var:.3f}")
print(f"无偏方差:   {theta_hat_var_unbiased:.3f}")`
          },
          {
            lang: "python",
            code: `from scipy import stats

# 评估估计量的无偏性和有效性
def simulate_estimator(n, true_theta, n_sims=5000):
    estimates = []
    for _ in range(n_sims):
        sample = np.random.exponential(scale=1/true_theta, size=n)
        estimates.append(1 / np.mean(sample))  # 指数分布λ的MLE
    return {
        "bias": np.mean(estimates) - true_theta,
        "variance": np.var(estimates),
        "mse": np.mean((np.array(estimates) - true_theta)**2)
    }

result = simulate_estimator(n=20, true_theta=2.0)
print(f"偏差: {result['bias']:.4f}, 方差: {result['variance']:.4f}, MSE: {result['mse']:.4f}")`
          }
        ],
        table: {
          headers: ["性质", "数学定义", "直观含义"],
          rows: [
            ["无偏性", "E[θ̂] = θ", "平均来说猜得准"],
            ["一致性", "θ̂ → θ (n→∞)", "数据越多越准"],
            ["有效性", "Var(θ̂₁) < Var(θ̂₂)", "估计量波动小"],
            ["充分性", "f(X|θ̂,θ) = f(X|θ̂)", "不丢失参数信息"],
            ["渐近正态性", "√n(θ̂-θ) → N(0,V)", "大样本下近似正态"]
          ]
        },
        mermaid: `graph LR
    A["样本数据"] --> B["构造估计量 θ̂"]
    B --> C{"评估性质"}
    C -->|期望| D["无偏性"]
    C -->|方差| E["有效性"]
    C -->|收敛| F["一致性"]
    D --> G["最优估计量"]
    E --> G
    F --> G`,
        tip: "矩估计法虽然简单易懂，但实践中更推荐使用极大似然估计，因为 MLE 在正则条件下自动具有一致性和渐近有效性。",
        warning: "有偏估计量不一定差！Ridge 回归的估计量是有偏的，但通过引入偏差来减小方差，整体 MSE 反而更低。"
      },
      {
        title: "3. 极大似然估计 MLE：最经典的参数估计方法",
        body: `极大似然估计（Maximum Likelihood Estimation, MLE）是统计学中最重要的参数估计方法之一。其核心思想很直观：既然我们已经观测到了数据，那就找到一组参数，使得这组参数下观测到当前数据的概率（似然）最大化。

似然函数 L(θ) = P(X₁, ..., Xₙ | θ) = Π f(xᵢ | θ) 是参数 θ 的函数。由于连乘在数值计算上容易导致下溢，通常取对数得到对数似然函数 ℓ(θ) = Σ log f(xᵢ | θ)。对 ℓ(θ) 求导并令导数为零，即可得到 MLE 的解析解或数值解。

MLE 具有优良的渐近性质：它是一致的、渐近正态的，并且在所有无偏估计量中达到 Cramér-Rao 下界（渐近有效）。这意味着当样本量足够大时，MLE 是最优的估计方法。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from scipy.optimize import minimize

# 正态分布 MLE（解析解 vs 数值解）
data = np.random.normal(loc=5, scale=2, size=200)

# 解析解：MLE 均值 = 样本均值, MLE 方差 = 样本方差(n 分母)
mu_mle = np.mean(data)
sigma2_mle = np.mean((data - mu_mle)**2)
print(f"解析解: μ={mu_mle:.3f}, σ²={sigma2_mle:.3f}")

# 数值优化求解
def neg_log_likelihood(params):
    mu, sigma = params
    if sigma <= 0:
        return 1e10
    n = len(data)
    return n/2 * np.log(2*np.pi*sigma2) + np.sum((data-mu)2)/(2*sigma**2)

result = minimize(neg_log_likelihood, x0=[0, 1], method="Nelder-Mead")
print(f"数值解: μ={result.x[0]:.3f}, σ={result.x[1]:.3f}")`
          },
          {
            lang: "python",
            code: `# 伯努利分布的 MLE：估计硬币正面概率
def bernoulli_mle(data):
    """二项分布中成功概率 p 的 MLE = 样本均值"""
    return np.mean(data)

# 模拟：抛 100 次硬币，正面 62 次
coin_flips = np.concatenate([np.ones(62), np.zeros(38)])
p_hat = bernoulli_mle(coin_flips)
print(f"MLE 估计正面概率: {p_hat:.3f}")

# Fisher 信息量
I_n = len(coin_flips) / (p_hat * (1 - p_hat))
print(f"Fisher 信息量: {I_n:.2f}")
print(f"渐近方差: {1/I_n:.6f}")`
          }
        ],
        table: {
          headers: ["分布", "参数 θ", "MLE 公式 θ̂"],
          rows: [
            ["正态 N(μ,σ²)", "μ", "X̄ = (1/n)Σxᵢ"],
            ["正态 N(μ,σ²)", "σ²", "(1/n)Σ(xᵢ-X̄)²"],
            ["伯努利 Ber(p)", "p", "(1/n)Σxᵢ"],
            ["指数 Exp(λ)", "λ", "1/X̄"],
            ["泊松 Pois(λ)", "λ", "X̄"]
          ]
        },
        mermaid: `graph TD
    A["观测数据 X"] --> B["构建似然函数 L(θ)"]
    B --> C["取对数 ℓ(θ) = log L(θ)"]
    C --> D["求导 dℓ/dθ = 0"]
    D --> E{"有解析解?"}
    E -->|是| F["直接求解 θ̂"]
    E -->|否| G["数值优化"]
    G --> H["梯度下降/Nelder-Mead"]
    F --> I["MLE θ̂_MLE"]
    H --> I`,
        tip: "对于指数族分布，MLE 有闭式解。记住常见分布的 MLE 公式，可以大大加快推导速度。",
        warning: "MLE 在小样本下可能有严重偏差。例如正态方差的 MLE 用 n 做分母而非 n-1，是有偏的。样本量小时要谨慎使用。"
      },
      {
        title: "4. 最大后验估计 MAP：引入先验知识的贝叶斯方法",
        body: `最大后验估计（Maximum A Posteriori, MAP）是贝叶斯框架下的参数估计方法。与 MLE 不同，MAP 不仅考虑数据提供的信息，还融入了我们对参数的先验信念。

**根据贝叶斯公式**：P(θ | X) ∝ P(X | θ) · P(θ)，后验分布正比于似然乘以先验。MAP 估计就是找到使后验概率最大的参数值：θ̂_MAP = argmax_θ P(θ | X) = argmax_θ [log P(X | θ) + log P(θ)]。可以看到，MAP 在 MLE 的对数似然基础上增加了一个对数先验项 log P(θ)。

当先验取高斯分布时，MAP 等价于 L2 正则化（Ridge）；当先验取拉普拉斯分布时，MAP 等价于 L1 正则化（Lasso）。这为机器学习中的正则化提供了深刻的贝叶斯解释。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from scipy.stats import norm

# 正态先验下的 MAP 估计
# 数据: X ~ N(θ, σ²), 先验: θ ~ N(μ₀, τ²)
data = np.array([3.2, 4.1, 2.8, 3.9, 4.5, 3.1, 3.7, 4.3])
sigma2 = 1.0   # 已知数据方差
mu0 = 0.0      # 先验均值
tau2 = 10.0    # 先验方差（大=弱先验）

# MAP 解析解: θ̂ = (n·X̄/σ² + μ₀/τ²) / (n/σ² + 1/τ²)
n = len(data)
x_bar = np.mean(data)
theta_map = (n * x_bar / sigma2 + mu0 / tau2) / (n / sigma2 + 1 / tau2)
theta_mle = x_bar

print(f"MLE: {theta_mle:.3f}")
print(f"MAP: {theta_map:.3f}")
print(f"先验越强(MAP越靠近μ₀)，tau2 越小效果越明显")`
          },
          {
            lang: "python",
            code: `# MAP 与正则化的等价性：Logistic 回归
from sklearn.linear_model import LogisticRegression
import numpy as np

np.random.seed(42)
X = np.random.randn(200, 5)
w_true = np.array([2, -1, 0.5, 0, 0])
y = (X @ w_true + np.random.randn(200) * 0.5 > 0).astype(int)

# L2 正则化 = 高斯先验的 MAP
model_l2 = LogisticRegression(penalty="l2", C=1.0, solver="lbfgs")
model_l2.fit(X, y)

# 无正则化 = MLE
model_mle = LogisticRegression(penalty=None, solver="lbfgs")
model_mle.fit(X, y)

print("MAP(L2) 系数:", np.round(model_l2.coef_[0], 3))
print("MLE 系数:   ", np.round(model_mle.coef_[0], 3))`
          }
        ],
        table: {
          headers: ["方法", "目标函数", "先验分布", "等价正则化"],
          rows: [
            ["MLE", "max log P(X|θ)", "无（均匀先验）", "无正则化"],
            ["MAP (高斯先验)", "max log P(X|θ) - λθ²/2", "θ ~ N(0, σ₀²)", "L2 (Ridge)"],
            ["MAP (拉普拉斯先验)", "max log P(X|θ) - λ|θ|", "θ ~ Laplace(0, b)", "L1 (Lasso)"],
            ["MAP (Student-t)", "max log P(X|θ) + Σlog(1+θ²/ν)", "重尾先验", "非凸正则化"]
          ]
        },
        mermaid: `graph LR
    A["先验 P(θ)"] --> C["贝叶斯公式"]
    B["似然 P(X|θ)"] --> C
    C --> D["后验 P(θ|X)"]
    D --> E["MAP: argmax P(θ|X)"]
    E --> F["θ̂_MAP"]
    B --> G["MLE: argmax P(X|θ)"]
    G --> H["θ̂_MLE"]
    F -.->|先验→均匀| H`,
        tip: "当你有可靠的领域知识时，用 MAP 替代 MLE 可以显著提升小样本下的估计质量。先验方差 τ² 的大小控制了你对外部知识的信任程度。",
        warning: "MAP 只返回后验的众数（一个点），忽略了后验分布的不确定性。如果需要完整的量化分析，应该使用完整的贝叶斯推断而非 MAP。"
      },
      {
        title: "5. 置信区间：估计的不确定性量化",
        body: `点估计给出的是一个具体的数值，但现实是我们永远无法知道真实参数的精确值。置信区间（Confidence Interval）提供了一种表达估计不确定性的方式：它给出一个区间 [L, U]，并声称该区间以一定的置信水平（如 95%）覆盖真实参数。

**关键理解**：95% 置信区间的正确解释是，如果我们重复抽样 100 次，每次构建一个 95% 置信区间，那么大约有 95 个区间会包含真实参数。这并不意味着某一个具体的区间有 95% 的概率包含参数——在频率学派框架下，参数是固定的，区间才是随机的。

构造置信区间的常用方法包括：基于正态近似的大样本方法、t 分布的小样本方法、以及 Bootstrap 重采样方法。选择哪种方法取决于样本量和总体分布的已知程度。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import scipy.stats as stats

# t 分布置信区间（小样本，σ 未知）
data = np.array([23.1, 25.4, 22.8, 24.6, 26.1, 23.9, 25.2, 24.3, 23.7, 25.8])
n = len(data)
x_bar = np.mean(data)
s = np.std(data, ddof=1)
alpha = 0.05

# t 临界值
t_crit = stats.t.ppf(1 - alpha/2, df=n-1)
margin = t_crit * s / np.sqrt(n)
ci_lower = x_bar - margin
ci_upper = x_bar + margin

print(f"95% CI: [{ci_lower:.3f}, {ci_upper:.3f}]")
print(f"点估计: {x_bar:.3f} ± {margin:.3f}")`
          },
          {
            lang: "python",
            code: `# Bootstrap 置信区间（无分布假设）
def bootstrap_ci(data, n_bootstrap=10000, alpha=0.05):
    """Bootstrap 百分位数法计算置信区间"""
    boot_means = []
    for _ in range(n_bootstrap):
        resample = np.random.choice(data, size=len(data), replace=True)
        boot_means.append(np.mean(resample))
    
    lower = np.percentile(boot_means, 100 * alpha / 2)
    upper = np.percentile(boot_means, 100 * (1 - alpha / 2))
    return lower, upper

data = np.array([12, 15, 8, 22, 18, 11, 25, 14, 19, 16, 13, 21])
ci = bootstrap_ci(data)
print(f"Bootstrap 95% CI: [{ci[0]:.3f}, {ci[1]:.3f}]")
print(f"传统 95% CI: 请对比与 t 分布方法的差异")`
          }
        ],
        table: {
          headers: ["方法", "适用场景", "假设条件", "公式/策略"],
          rows: [
            ["正态近似", "大样本 (n≥30)", "σ 已知", "X̄ ± z·σ/√n"],
            ["t 分布", "小样本", "σ 未知, 正态总体", "X̄ ± t·s/√n"],
            ["Bootstrap", "任意分布", "i.i.d. 样本", "重采样百分位数"],
            ["Wilson 区间", "比例估计", "二项分布", "修正 Wald 区间"]
          ]
        },
        mermaid: `graph TD
    A["样本数据"] --> B{"σ 已知?"}
    B -->|是| C["正态 z 区间"]
    B -->|否| D{"n≥30?"}
    D -->|是| E["大样本 z 近似"]
    D -->|否| F["t 分布区间"]
    A --> G{"不满足正态假设?"}
    G -->|是| H["Bootstrap 方法"]
    C --> I["置信区间 [L, U]"]
    E --> I
    F --> I
    H --> I`,
        tip: "Bootstrap 方法几乎不需要分布假设，是现代统计学中最强大的工具之一。当你对总体分布不确定时，优先使用 Bootstrap。",
        warning: "置信区间的宽度与样本量的平方根成反比。想要将区间宽度减半，需要将样本量增加到 4 倍。设计实验时提前做好功效分析。"
      },
      {
        title: "6. 假设检验：用数据做决策",
        body: `假设检验是统计推断的第二大核心问题。与参数估计不同，假设检验不关心参数的精确值，而是回答一个二值问题：某个关于参数的陈述是否成立？

**检验的基本框架是**：首先设定零假设 H₀ 和备择假设 H₁，然后构造一个检验统计量，在 H₀ 成立的条件下计算 p 值（观察到当前数据或更极端数据的概率）。如果 p 值小于预设的显著性水平 α（通常为 0.05），则拒绝 H₀。

**两种错误需要权衡**：第一类错误（弃真）是 H₀ 为真时错误地拒绝它，概率为 α；第二类错误（取伪）是 H₀ 为假时没有拒绝它，概率为 β。检验的功效（Power = 1 - β）衡量了正确拒绝错误 H₀ 的能力。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import scipy.stats as stats

# 单样本 t 检验：新药平均效果是否 ≠ 0
np.random.seed(42)
drug_effects = np.array([2.3, -0.5, 1.8, 3.1, 0.9, -1.2, 2.7, 1.5, 0.3, 2.9])

t_stat, p_value = stats.ttest_1samp(drug_effects, popmean=0)
print(f"t 统计量: {t_stat:.4f}")
print(f"p 值: {p_value:.4f}")
print(f"α=0.05 下: {'拒绝 H₀' if p_value < 0.05 else '不拒绝 H₀'}")

# 效应量 (Cohen's d)
cohens_d = np.mean(drug_effects) / np.std(drug_effects, ddof=1)
print(f"Cohen's d: {cohens_d:.3f}")`
          },
          {
            lang: "python",
            code: `# 功效分析：需要多少样本？
from statsmodels.stats.power import TTestIndPower

analysis = TTestIndPower()

# 计算功效（已知效应量和样本量）
effect_size = 0.5  # 中等效应
n_per_group = 64
power = analysis.power(effect_size=effect_size, nobs1=n_per_group, alpha=0.05)
print(f"效应量={effect_size}, 每组 n={n_per_group}, 功效={power:.3f}")

# 计算所需样本量（已知期望功效）
n_needed = analysis.solve_power(effect_size=effect_size, power=0.8, alpha=0.05)
print(f"达到 80% 功效需要每组 n={int(np.ceil(n_needed))}")`
          }
        ],
        table: {
          headers: ["检验类型", "H₀", "检验统计量", "适用场景"],
          rows: [
            ["单样本 t 检验", "μ = μ₀", "t = (X̄-μ₀)/(s/√n)", "比较均值与已知值"],
            ["双样本 t 检验", "μ₁ = μ₂", "t = (X̄₁-X̄₂)/SE", "两组均值比较"],
            ["卡方检验", "独立/拟合优度", "χ² = Σ(O-E)²/E", "分类变量关联"],
            ["ANOVA", "μ₁=μ₂=...=μₖ", "F = MSB/MSW", "多组均值比较"],
            ["Z 检验（比例）", "p = p₀", "z = (p̂-p₀)/SE", "大样本比例检验"]
          ]
        },
        mermaid: `graph TD
    A["提出假设 H₀ vs H₁"] --> B["选择检验方法"]
    B --> C["计算检验统计量"]
    C --> D["计算 p 值"]
    D --> E{"p < α?"}
    E -->|是| F["拒绝 H₀ (显著)"]
    E -->|否| G["不拒绝 H₀"]
    F --> H["计算效应量"]
    G --> I["检查功效是否足够"]
    I --> J["可能需要更多数据"]`,
        tip: "永远报告效应量（如 Cohen's d）而不只是 p 值。大样本下微小的差异也会产生极小的 p 值，但可能完全没有实际意义。",
        warning: "p 值不是 H₀ 为真的概率，也不是研究假设为真的概率。它只是在 H₀ 成立的前提下，观察到当前或更极端数据的概率。这是最常见的统计学误解。"
      },
      {
        title: "7. 贝叶斯推断实战：A/B 测试与贝叶斯线性回归",
        body: `贝叶斯推断将参数视为随机变量，通过贝叶斯公式从先验分布出发，结合观测数据得到后验分布。与频率学派不同，贝叶斯方法直接给出参数的完整概率分布，而非单一的点估计或区间。

在 A/B 测试中，贝叶斯方法的优势尤为突出：我们可以直接计算 P(版本 B 优于版本 A | 数据)，而不需要依赖 p 值和显著性水平的二元判断。通过 Beta-Binomial 共轭先验，转化率的后验分布有解析解，计算高效且结果直观。

贝叶斯线性回归则将权重视为随机变量，引入高斯先验后得到权重的后验分布。预测时对新数据做后验预测积分，自然得到了预测的不确定性区间。这种方法在小数据集上表现尤为出色。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from scipy import stats

# 贝叶斯 A/B 测试：Beta-Binomial 共轭
# 版本 A: 1200 次展示, 96 次转化; 版本 B: 1350 次展示, 128 次转化
alpha_prior, beta_prior = 1, 1  # 均匀先验 Beta(1,1)

# 后验参数
alpha_a = alpha_prior + 96
beta_a = beta_prior + 1200 - 96
alpha_b = alpha_prior + 128
beta_b = beta_prior + 1350 - 128

# Monte Carlo 估计 P(B > A)
samples_a = np.random.beta(alpha_a, beta_a, 100000)
samples_b = np.random.beta(alpha_b, beta_b, 100000)
prob_b_better = np.mean(samples_b > samples_a)
lift = np.mean(samples_b - samples_a)

print(f"P(B > A | 数据) = {prob_b_better:.4f}")
print(f"转化率提升: {lift:.4f} ({lift/np.mean(samples_a)*100:.1f}%)")
print(f"A 的后验均值: {stats.beta.mean(alpha_a, beta_a):.4f}")
print(f"B 的后验均值: {stats.beta.mean(alpha_b, beta_b):.4f}")`
          },
          {
            lang: "python",
            code: `# 贝叶斯线性回归
np.random.seed(42)
n_train = 30
X = np.linspace(0, 10, n_train).reshape(-1, 1)
X_design = np.column_stack([np.ones(n_train), X])
y = 2 * X.flatten() + 1 + np.random.randn(n_train) * 2

# 先验: w ~ N(0, σ_w²·I), 噪声: y|X,w ~ N(Xw, σ²)
sigma2 = 4.0
sigma_w2 = 10.0
w_prior_mean = np.zeros(2)
w_prior_cov = sigma_w2 * np.eye(2)

# 后验: w|X,y ~ N(w_n, Σ_n)
XtX = X_design.T @ X_design
w_post_cov = np.linalg.inv(np.linalg.inv(w_prior_cov) + XtX / sigma2)
w_post_mean = w_post_cov @ (
    np.linalg.inv(w_prior_cov) @ w_prior_mean + X_design.T @ y / sigma2
)

print(f"后验权重: w₀={w_post_mean[0]:.3f}, w₁={w_post_mean[1]:.3f}")

# 预测不确定性
x_new = np.array([[1, 5.5]])
pred_mean = x_new @ w_post_mean
pred_var = x_new @ w_post_cov @ x_new.T + sigma2
print(f"x=5.5 预测: {pred_mean[0]:.3f} ± {1.96*np.sqrt(pred_var[0,0]):.3f}")`
          }
        ],
        table: {
          headers: ["对比维度", "频率学派 A/B 测试", "贝叶斯 A/B 测试"],
          rows: [
            ["结果解释", "p 值: 在 H₀ 下数据的极端程度", "P(B>A|数据): B 确实优于 A 的概率"],
            ["提前停止", "需要校正（多次检验问题）", "自然支持（后验实时更新）"],
            ["样本量", "需事先确定（功效分析）", "可以随时查看后验"],
            ["小样本表现", "可能功效不足", "先验提供稳定性"],
            ["决策依据", "拒绝/不拒绝的二元判断", "直接量化期望损失/收益"]
          ]
        },
        mermaid: `graph TD
    A["先验分布 P(θ)"] --> C["贝叶斯更新"]
    B["观测数据 D"] --> C
    C --> D["后验分布 P(θ|D)"]
    D --> E["A/B 测试"]
    D --> F["贝叶斯回归"]
    E --> G["P(B>A|D)"]
    F --> H["后验预测分布"]
    G --> I["业务决策"]
    H --> I`,
        tip: "实际做 A/B 测试时，建议用历史数据设定一个信息量合理的先验（而非完全无信息的均匀先验），这样在小流量实验阶段就能得到有意义的推断。",
        warning: "贝叶斯方法并非没有主观性——先验分布的选择会影响结果。务必做敏感性分析，尝试多个合理的先验来确认结论的稳健性。"
      }
    ],
};
