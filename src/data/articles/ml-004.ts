import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-004",
    title: "朴素贝叶斯：概率分类器",
    category: "ml",
    tags: ["概率", "分类", "贝叶斯定理"],
    summary: "从贝叶斯定理到文本分类，理解最优雅的概率分类算法",
    date: "2026-04-12",
    readTime: "16 min",
    level: "入门",
    content: [
      {
        title: "1. 贝叶斯定理：从直觉到公式",
        body: `贝叶斯定理是概率论中最优雅也最反直觉的结论之一。它的核心思想很简单：当我们观察到新的证据时，应该如何更新我们对某个假设的信念？

想象你在医院做体检，检测结果呈阳性。你第一反应可能是"我得了这个病"。但贝叶斯告诉我们，正确的推理需要考虑两个因素：先验概率（这个病在人群中的发病率）和检测的准确性（假阳性率）。如果一种病发病率是万分之一，即使检测准确率 99%，阳性结果下你真的患病的概率也只有不到 1%。

形式化地，贝叶斯定理表达为：P(A|B) = P(B|A) × P(A) / P(B)。在机器学习中，A 是类别标签，B 是观测特征。我们要计算的是：给定特征 B 的情况下，样本属于类别 A 的概率。`,
        code: [
          {
            lang: "python",
            code: `# 贝叶斯定理的直觉演示
def bayes_theorem(prior, likelihood, evidence):
    """
    P(A|B) = P(B|A) * P(A) / P(B)
    prior: P(A) 先验概率
    likelihood: P(B|A) 似然
    evidence: P(B) 证据概率
    """
    posterior = likelihood * prior / evidence
    return posterior

# 医疗检测案例
# 疾病发病率 0.01%，检测灵敏度 99%，假阳性率 1%
p_disease = 0.0001          # 先验：发病率
p_positive_given_disease = 0.99  # 灵敏度
p_positive = (0.99 * 0.0001 + 0.01 * 0.9999)  # 全概率

p_disease_given_positive = bayes_theorem(
    prior=p_disease,
    likelihood=p_positive_given_disease,
    evidence=p_positive
)
print(f"检测阳性后患病概率: {p_disease_given_positive:.4f} ({p_disease_given_positive*100:.2f}%)")
# 输出: 检测阳性后患病概率: 0.0098 (0.98%)`,
          },
          {
            lang: "python",
            code: `# 可视化：先验如何影响后验
import numpy as np
import matplotlib.pyplot as plt

priors = np.linspace(0.001, 0.5, 100)
likelihood = 0.99
evidence_factor = 0.01  # 假阳性率

posteriors = []
for p in priors:
    evidence = likelihood * p + evidence_factor * (1 - p)
    post = bayes_theorem(p, likelihood, evidence)
    posteriors.append(post)

plt.figure(figsize=(10, 6))
plt.plot(priors, posteriors, 'b-', linewidth=2)
plt.plot([0, 1], [0, 1], 'r--', alpha=0.5, label='对角线')
plt.xlabel('先验概率 P(A)')
plt.ylabel('后验概率 P(A|B)')
plt.title('先验概率如何影响后验概率')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()`,
          },
        ],
        table: {
          headers: ["概念", "符号", "含义", "例子"],
          rows: [
            ["先验概率", "P(A)", "看到证据前的信念", "疾病发病率 0.01%"],
            ["似然", "P(B|A)", "假设成立时观察到证据的概率", "患者检测阳性的概率 99%"],
            ["证据概率", "P(B)", "观察到证据的总概率", "所有人中检测阳性的比例"],
            ["后验概率", "P(A|B)", "看到证据后更新的信念", "阳性者真正患病的概率 0.98%"],
          ],
        },
        mermaid: `graph TD
    A["先验信念 P(A)"] --> C["贝叶斯公式"]
    B["新证据 B"] --> D["似然 P(B|A)"]
    D --> C
    C --> E["后验信念 P(A|B)"]
    E -.->|"作为新的先验"| A`,
        tip: "学习贝叶斯思维的关键是：永远不要只看检测结果的准确性，要先问'这件事本身有多常见'。",
      },
      {
        title: "2. 从贝叶斯定理到朴素贝叶斯分类器",
        body: `把贝叶斯定理应用到分类任务上，我们需要计算 P(Y|X)——给定特征 X 的情况下样本属于类别 Y 的概率。根据贝叶斯定理：P(Y|X) = P(X|Y) × P(Y) / P(X)。

对于分类任务，P(X) 对所有类别都一样，所以我们只需要比较 P(X|Y) × P(Y)。但问题来了：如果 X 有 n 个特征，P(X|Y) = P(X₁,X₂,...,Xₙ|Y) 是联合概率分布，需要估计指数级数量的参数。

朴素贝叶斯的"朴素"在于它做了一个极强的假设：所有特征在给定类别下相互独立。即 P(X₁,X₂,...,Xₙ|Y) = P(X₁|Y) × P(X₂|Y) × ... × P(Xₙ|Y)。这样我们只需要估计每个特征的条件概率 P(Xᵢ|Y)，参数数量从指数级降到线性级。

这个假设在现实中几乎从不成立——想想邮件分类任务中，"免费"和"中奖"两个词显然不是独立的。但令人惊讶的是，即使特征间存在强相关性，朴素贝叶斯往往仍然表现很好。这是因为我们只需要比较不同类别的得分，而不需要精确的概率值。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from collections import Counter

class NaiveBayesClassifier:
    """从零实现朴素贝叶斯分类器"""

    def __init__(self):
        self.classes = None
        self.class_priors = {}
        self.conditional_probs = {}

    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.classes = np.unique(y)

        for c in self.classes:
            X_c = X[y == c]
            # 先验概率 P(Y=c)
            self.class_priors[c] = len(X_c) / n_samples
            # 条件概率 P(X_i|Y=c) - 假设特征服从高斯分布
            self.conditional_probs[c] = {
                'mean': X_c.mean(axis=0),
                'var': X_c.var(axis=0)
            }

    def _likelihood(self, x, mean, var, eps=1e-6):
        """高斯概率密度函数"""
        coeff = 1.0 / np.sqrt(2 * np.pi * var + eps)
        exponent = np.exp(-(x - mean) ** 2 / (2 * var + eps))
        return coeff * exponent

    def predict(self, X):
        predictions = []
        for x in X:
            posteriors = {}
            for c in self.classes:
                # log P(Y=c) + Σ log P(X_i|Y=c)
                log_prior = np.log(self.class_priors[c])
                means = self.conditional_probs[c]['mean']
                variances = self.conditional_probs[c]['var']
                log_likelihood = np.sum(
                    np.log(self._likelihood(x, means, variances))
                )
                posteriors[c] = log_prior + log_likelihood
            predictions.append(max(posteriors, key=posteriors.get))
        return np.array(predictions)`,
          },
          {
            lang: "python",
            code: `# 用 sklearn 验证我们的实现
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score

# 生成测试数据
X, y = make_classification(
    n_samples=1000, n_features=10, n_informative=5,
    n_redundant=2, n_classes=2, random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 我们的实现
my_nb = NaiveBayesClassifier()
my_nb.fit(X_train, y_train)
my_pred = my_nb.predict(X_test)
print(f"我的实现准确率: {accuracy_score(y_test, my_pred):.4f}")

# sklearn 实现
sklearn_nb = GaussianNB()
sklearn_nb.fit(X_train, y_train)
sk_pred = sklearn_nb.predict(X_test)
print(f"sklearn 准确率: {accuracy_score(y_test, sk_pred):.4f}")`,
          },
        ],
        table: {
          headers: ["朴素贝叶斯变体", "特征假设", "适用场景", "优缺点"],
          rows: [
            ["高斯朴素贝叶斯", "连续特征服从正态分布", "数值特征分类", "简单快速，但正态假设可能不成立"],
            ["多项式朴素贝叶斯", "离散计数特征", "文本分类（词频）", "文本分类首选，但对零频敏感"],
            ["伯努利朴素贝叶斯", "二元特征", "文档存在性分类", "只关心特征是否出现，不关心次数"],
            ["补码朴素贝叶斯", "补充类别信息", "不平衡文本分类", "缓解类别不平衡问题"],
          ],
        },
        mermaid: `graph LR
    A["输入特征 X"] --> B["特征独立性假设"]
    B --> C["P(X|Y) = ΠP(Xᵢ|Y)"]
    C --> D["P(Y|X) ∝ P(Y) × ΠP(Xᵢ|Y)"]
    D --> E["选择最大后验概率的类别"]
    E --> F["预测结果"]`,
        warning: "特征独立性假设是朴素贝叶斯最大的弱点。当特征间高度相关时，分类器会过度计数相关特征的影响。",
      },
      {
        title: "3. 拉普拉斯平滑：处理零频问题",
        body: `多项式朴素贝叶斯在文本分类中有一个致命缺陷：如果某个词在训练集的某个类别中从未出现，那么 P(词|类别) = 0。由于概率是连乘的，一个 0 就会让整个乘积变成 0。这意味着即使其他所有证据都强烈指向某个类别，只要有一个词从未在该类别中出现过，该类别的概率就永远是 0。

拉普拉斯平滑（加一平滑）通过在分子分母上同时加上一个常数来解决这个问题：P(wᵢ|c) = (Nᵢc + α) / (Nc + α × |V|)，其中 Nᵢc 是词 wᵢ 在类别 c 中的出现次数，Nc 是类别 c 的总词数，|V| 是词表大小，α 是平滑参数（通常为 1）。

**平滑的直觉是**：我们给每个词一个微小的"基础概率"，即使它在训练集中没出现过。这相当于假设我们在训练集之外还看到了一些"虚拟样本"。α 越大，平滑效果越强，模型越保守。`,
        code: [
          {
            lang: "python",
            code: `class MultinomialNaiveBayes:
    """多项式朴素贝叶斯（带拉普拉斯平滑）"""

    def __init__(self, alpha=1.0):
        self.alpha = alpha  # 平滑参数
        self.class_log_prior = {}
        self.feature_log_prob = {}

    def fit(self, X, y):
        """X: 词频矩阵 (n_samples, n_features), y: 类别标签"""
        n_samples, n_features = X.shape
        self.classes = np.unique(y)
        self.n_features = n_features

        for c in self.classes:
            X_c = X[y == c]
            # 先验概率（对数）
            self.class_log_prior[c] = np.log(
                np.sum(y == c) / n_samples
            )
            # 条件概率（对数）+ 拉普拉斯平滑
            smoothed_counts = X_c.sum(axis=0) + self.alpha
            smoothed_total = smoothed_counts.sum()
            self.feature_log_prob[c] = np.log(
                smoothed_counts / smoothed_total
            )

    def predict(self, X):
        log_probs = {}
        for c in self.classes:
            log_probs[c] = (
                self.class_log_prior[c]
                + X @ self.feature_log_prob[c]
            )
        return self.classes[np.argmax(
            np.column_stack([log_probs[c] for c in self.classes]),
            axis=1
        )]`,
          },
          {
            lang: "python",
            code: `# 演示拉普拉斯平滑的效果
import numpy as np

# 词表：['免费', '优惠', '会议', '报告', '中奖']
# 类别：垃圾邮件(0)、正常邮件(1)

# 训练集词频
spam_counts = np.array([5, 3, 0, 0, 2])    # 垃圾邮件
ham_counts = np.array([0, 1, 4, 6, 0])     # 正常邮件

vocab_size = len(spam_counts)

def laplace_smooth(counts, alpha=1.0):
    """拉普拉斯平滑"""
    smoothed = counts + alpha
    total = smoothed.sum()
    return smoothed / total

# 无平滑（有零值）
spam_prob_raw = spam_counts / spam_counts.sum()
print(f"无平滑-垃圾邮件: {spam_prob_raw}")

# 拉普拉斯平滑
spam_prob_smooth = laplace_smooth(spam_counts, alpha=1.0)
print(f"平滑后-垃圾邮件: {spam_prob_smooth.round(4)}")

# 新邮件词频：[免费=2, 中奖=1]
new_email = np.array([2, 0, 0, 0, 1])

# 无平滑会得到 0（'中奖'在正常邮件中没出现过）
ham_prob_raw = ham_counts / ham_counts.sum()
score_ham_raw = np.sum(new_email * np.log(ham_prob_raw + 1e-10))
print(f"无平滑-正常邮件得分: {score_ham_raw:.4f}")

# 平滑后所有词都有正概率
ham_prob_smooth = laplace_smooth(ham_counts, alpha=1.0)
score_ham_smooth = np.sum(new_email * np.log(ham_prob_smooth))
print(f"平滑后-正常邮件得分: {score_ham_smooth:.4f}")`,
          },
        ],
        table: {
          headers: ["平滑方法", "公式", "特点", "适用场景"],
          rows: [
            ["拉普拉斯(加一)", "(Nᵢ+1)/(N+|V|)", "简单，给所有词加 1", "小规模数据集"],
            ["Lidstone", "(Nᵢ+α)/(N+α|V|)", "可调参数 α，更灵活", "需要根据数据调优"],
            ["Good-Turing", "基于出现频率的重估", "对未见词更合理", "大规模语料库"],
            ["Kneser-Ney", "基于上下文回退", "考虑低阶 n-gram", "语言模型"],
          ],
        },
        mermaid: `graph TD
    A["词频统计"] --> B{"是否有零频?"}
    B -->|是| C["应用拉普拉斯平滑"]
    B -->|否| D["直接使用频率"]
    C --> E["P(w|c) = (Nᵢc+α)/(Nc+α|V|)"]
    D --> F["P(w|c) = Nᵢc/Nc"]
    E --> G["计算后验概率"]
    F --> G`,
        tip: "α=1 是默认值，但在大规模文本分类中，较小的 α（如 0.1 或 0.01）往往效果更好——因为词表很大，加一会过度平滑。",
      },
      {
        title: "4. 对数概率：避免数值下溢",
        body: `朴素贝叶斯的核心计算是多个概率的连乘：P(Y|X) ∝ P(Y) × P(X₁|Y) × P(X₂|Y) × ... × P(Xₙ|Y)。当特征数量很多时（比如文本分类中有上万个词），这个乘积会变得极其微小，超出浮点数的表示范围——这就是数值下溢问题。

解决方案是对所有概率取对数。根据对数运算法则，log(a × b) = log(a) + log(b)，所以连乘变成求和：log P(Y|X) = log P(Y) + log P(X₁|Y) + log P(X₂|Y) + ... + log P(Xₙ|Y)。对数变换不仅解决了下溢问题，还将乘法运算变成了更快的加法运算。

需要注意的是，对数函数是单调递增的，所以比较对数概率的大小等价于比较原始概率的大小。我们不需要还原回原始概率——分类只需要知道哪个类别的得分最高。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# 演示数值下溢问题
def naive_multiply(probs):
    """直接连乘（会下溢）"""
    result = 1.0
    for p in probs:
        result *= p
    return result

def log_sum(probs):
    """对数求和（避免下溢）"""
    return np.sum(np.log(probs))

# 1000 个概率值（每个约 0.5）
probs = np.random.uniform(0.3, 0.7, 1000)

naive_result = naive_multiply(probs)
log_result = log_sum(probs)

print(f"直接连乘: {naive_result}")  # 输出 0.0（下溢）
print(f"对数求和: {log_result:.4f}")  # 正常输出

# 验证：log(a*b) = log(a) + log(b)
a, b = 0.3, 0.7
print(f"log(a*b) = {np.log(a*b):.6f}")
print(f"log(a)+log(b) = {np.log(a)+np.log(b):.6f}")`,
          },
        ],
        table: {
          headers: ["方法", "运算", "数值范围", "计算复杂度"],
          rows: [
            ["直接乘法", "Π P(Xᵢ|Y)", "可能下溢到 0", "O(n) 乘法"],
            ["对数求和", "Σ log P(Xᵢ|Y)", "安全的负数范围", "O(n) 加法+log"],
            ["log-sum-exp", "log(Σ exp(xᵢ))", "最数值稳定", "O(n) exp+log"],
          ],
        },
        mermaid: `graph LR
    A["P(Y) × Π P(Xᵢ|Y)"] --> B["取对数"]
    B --> C["log P(Y) + Σ log P(Xᵢ|Y)"]
    C --> D["比较各类别得分"]
    D --> E["选最大得分类别"]`,
        warning: "在实现朴素贝叶斯时，永远使用对数概率。即使训练集规模不大，直接乘法也可能在推理阶段因为输入特征多而下溢。",
      },
      {
        title: "5. 实战：垃圾邮件分类器",
        body: `朴素贝叶斯最经典的應用是垃圾邮件过滤。SpamAssassin 等工业级垃圾邮件系统早期核心算法就是朴素贝叶斯。它的工作流程很直观：将邮件分词，统计每个词在垃圾邮件和正常邮件中的出现频率，然后根据一封新邮件的词分布来判断它属于哪一类。

关键点在于特征提取。最简单的方法是使用词袋模型（Bag of Words）——只关心每个词出现的次数，不关心顺序。更精细的方法包括：使用 TF-IDF 替代简单词频、考虑 n-gram（连续的 2-3 个词作为一个特征）、提取非文本特征（发件人域、邮件长度、是否有附件等）。

朴素贝叶斯在文本分类中的优势：训练和推理都极快（一次遍历训练集即可完成训练）；对高维稀疏数据天然友好；只需要很少的训练数据就能得到合理结果；容易解释（可以查看哪些词对分类贡献最大）。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# 示例数据
emails = [
    "免费优惠！中奖了！点击链接领取奖品",
    "紧急通知：您的账户需要验证，请立即登录",
    "恭喜您获得万元大奖，限时领取",
    "明天下午三点开会，请准备季度报告",
    "项目进度更新：已完成 80%，下周交付",
    "周末聚餐，大家方便吗",
    "限时秒杀！全场一折起！先到先得",
    "请查收附件中的会议记录和行动计划",
    "双十一大促！满 100 减 50！",
    "技术分享会通知：周三下午 2 点，301 会议室",
]
labels = [1, 1, 1, 0, 0, 0, 1, 0, 1, 0]  # 1=垃圾, 0=正常

# 分词（中文需要特殊处理，这里用字符级 n-gram）
vectorizer = CountVectorizer(ngram_range=(1, 2), analyzer='char_wb')
X = vectorizer.fit_transform(emails)

# 训练
nb = MultinomialNB(alpha=0.1)
nb.fit(X, labels)

# 预测新邮件
new_emails = [
    "您好，关于下周会议安排",
    "紧急！您已被选为幸运用户",
]
X_new = vectorizer.transform(new_emails)
preds = nb.predict(X_new)
probs = nb.predict_proba(X_new)

for email, pred, prob in zip(new_emails, preds, probs):
    label = "垃圾邮件" if pred == 1 else "正常邮件"
    print(f"'{email}' → {label} (置信度: {max(prob):.2%})")`,
          },
          {
            lang: "python",
            code: `# 分析哪些词对分类影响最大
import numpy as np

# 获取特征名
feature_names = vectorizer.get_feature_names_out()

# 垃圾邮件类最显著的词
spam_log_prob = nb.feature_log_prob_[1]
spam_top_indices = np.argsort(-spam_log_prob)[:15]
print("垃圾邮件最显著的词:")
for idx in spam_top_indices:
    print(f"  '{feature_names[idx]}': {np.exp(spam_log_prob[idx]):.4f}")

# 正常邮件类最显著的词
ham_log_prob = nb.feature_log_prob_[0]
ham_top_indices = np.argsort(-ham_log_prob)[:15]
print("\\n正常邮件最显著的词:")
for idx in ham_top_indices:
    print(f"  '{feature_names[idx]}': {np.exp(ham_log_prob[idx]):.4f}")`,
          },
        ],
        table: {
          headers: ["特征类型", "表示方式", "维度", "效果"],
          rows: [
            ["Unigram", "单个词", "高", "基线方法"],
            ["Bigram", "连续两个词", "极高", "捕获短语搭配"],
            ["TF-IDF", "词频×逆文档频率", "高", "降低常见词权重"],
            ["字符 n-gram", "字符序列", "极高", "处理未登录词"],
          ],
        },
        mermaid: `graph TD
    A["原始邮件文本"] --> B["分词"]
    B --> C["特征提取\n词频/TF-IDF"]
    C --> D["朴素贝叶斯分类器"]
    D --> E["P(垃圾|邮件)"]
    D --> F["P(正常|邮件)"]
    E --> G{"比较概率"}
    F --> G
    G -->|"P(垃圾) > P(正常)"| H["标记为垃圾"]
    G -->|否则| I["标记为正常"]`,
        tip: "中文文本分类需要先分词（用 jieba 或 PKUSEG），不能直接用空格分割。字符级 n-gram 是分词的替代方案。",
      },
      {
        title: "6. 朴素贝叶斯的优缺点分析",
        body: `朴素贝叶斯之所以经久不衰，不是因为它是"最强"的分类器，而是因为它是性价比最高的分类器之一。它的优势不在于精度——在现代 ML 场景中，随机森林和梯度提升树几乎总是比朴素贝叶斯更准确——而在于它的独特定位：极快、极简单、对数据要求极低。

**优势一**：训练速度极快。朴素贝叶斯只需要遍历一次训练集，统计每个类别的先验概率和每个特征的条件概率。即使有上百万条数据，训练也只需要几秒。相比之下，SVM 需要解二次规划，随机森林需要构建多棵树，神经网络需要多轮迭代。

**优势二**：天然支持增量学习。新数据到来时，只需更新计数统计，不需要重新训练整个模型。这对流式数据和在线学习场景非常有用。

**优势三**：对缺失值不敏感。某个特征缺失时，只需在连乘中跳过它即可，不像有些算法需要填充策略。

**但劣势也很明显**：特征独立性假设在现实中很少成立；对连续特征需要假设分布（通常是高斯分布）；对输入数据的表示非常敏感（比如文本分类中分词质量直接影响效果）。`,
        code: [
          {
            lang: "python",
            code: `# 对比多种分类器的性能和速度
import time
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import cross_val_score
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC

X, y = make_classification(
    n_samples=5000, n_features=20, n_informative=10,
    n_redundant=5, random_state=42
)

classifiers = {
    'Naive Bayes': GaussianNB(),
    'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
    'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
    'SVM': SVC(probability=True, random_state=42),
}

for name, clf in classifiers.items():
    start = time.time()
    scores = cross_val_score(clf, X, y, cv=5, scoring='accuracy')
    elapsed = time.time() - start
    print(f"{name:25s} | 准确率: {scores.mean():.4f} ± {scores.std():.4f} | 耗时: {elapsed:.3f}s")`,
          },
        ],
        table: {
          headers: ["分类器", "训练速度", "预测速度", "准确率", "可解释性", "数据需求"],
          rows: [
            ["朴素贝叶斯", "⚡ 极快", "⚡ 极快", "中等", "高", "低"],
            ["逻辑回归", "快", "快", "中等", "高", "中等"],
            ["随机森林", "中等", "中等", "高", "中等", "中等"],
            ["梯度提升树", "慢", "中等", "很高", "中等", "较多"],
            ["SVM", "很慢", "慢", "高", "低", "中等"],
            ["深度学习", "极慢", "中等", "很高", "很低", "大量"],
          ],
        },
        mermaid: `graph TD
    A["选择分类器的考量"] --> B{"数据规模?"}
    B -->|小| C["朴素贝叶斯/逻辑回归"]
    B -->|中| D["随机森林/XGBoost"]
    B -->|大| E["深度学习"]
    C --> F{"需要可解释性?"}
    F -->|是| G["朴素贝叶斯 ✅"]
    F -->|否| H["随机森林"]`,
        tip: "当数据量小（<1000 条）或者需要快速原型验证时，先用朴素贝叶斯跑个基线，再考虑更复杂的模型。",
      },
      {
        title: "7. 总结与扩展阅读",
        body: `朴素贝叶斯是机器学习中少有的"理论优雅、实践有效"的算法。它基于贝叶斯定理这一坚实的概率论基础，通过特征独立性假设将复杂的联合概率估计简化为简单的条件概率估计。虽然这个假设在现实中很少成立，但在很多实际场景（尤其是文本分类）中，朴素贝叶斯的表现令人惊讶地好。

从历史角度看，朴素贝叶斯可以追溯到 18 世纪的贝叶斯定理，但它在计算机时代才找到大规模应用场景。20 世纪 90 年代的垃圾邮件过滤是它的第一个杀手级应用，至今很多邮件系统仍然使用朴素贝叶斯或其变种作为基础组件。

学习朴素贝叶斯后，自然的下一步是学习半朴素贝叶斯方法——尝试放松特征独立性假设。One-Dependence Estimators（ODE）允许每个特征依赖于另一个特征（而不仅仅是类别），Tree-Augmented Naive Bayes（TAN）构建特征之间的树形依赖结构。这些方法在保持朴素贝叶斯简洁性的同时，在一定程度上缓解了独立性假设的局限。`,
        code: [
          {
            lang: "python",
            code: `# 半朴素贝叶斯：AODE (Average One-Dependence Estimators) 简化版
import numpy as np
from collections import defaultdict

class AODEClassifier:
    """AODE 简化实现：每个特征可以依赖于一个父特征"""

    def __init__(self, min_freq=2):
        self.min_freq = min_freq  # 父特征最小出现频率

    def fit(self, X, y):
        self.classes = np.unique(y)
        n_samples, n_features = X.shape

        # 预计算：找出出现频率足够高的特征作为候选父特征
        self.parent_candidates = []
        for j in range(n_features):
            if np.bincount(X[:, j]).max() >= self.min_freq:
                self.parent_candidates.append(j)

        # 计算联合统计量 P(X_i, X_j, Y)
        self.joint_counts = {}
        for parent_idx in self.parent_candidates:
            for feat_idx in range(n_features):
                if feat_idx == parent_idx:
                    continue
                for c in self.classes:
                    mask = y == c
                    for xj in np.unique(X[:, feat_idx]):
                        for xp in np.unique(X[:, parent_idx]):
                            count = np.sum(
                                (X[mask, feat_idx] == xj) &
                                (X[mask, parent_idx] == xp)
                            )
                            key = (parent_idx, feat_idx, xj, xp, c)
                            self.joint_counts[key] = count + 1  # 平滑

    def predict(self, X):
        # 简化的预测逻辑
        return np.zeros(X.shape[0], dtype=int)  # 实际实现需要完整的概率计算

print("AODE 是半朴素贝叶斯的一个实例，通过引入特征间依赖提升分类精度")`,
          },
        ],
        table: {
          headers: ["贝叶斯方法", "依赖假设", "参数量", "典型精度", "典型场景"],
          rows: [
            ["朴素贝叶斯", "特征条件独立", "O(C×F)", "中等", "文本分类基线"],
            ["半朴素贝叶斯 TAN", "树形依赖", "O(C×F²)", "较好", "中等规模数据"],
            ["半朴素贝叶斯 AODE", "一对多依赖", "O(C×F³)", "好", "大规模数据"],
            ["贝叶斯网络", "自定义 DAG", "可变", "取决于结构", "复杂因果关系"],
          ],
        },
        mermaid: `graph TD
    A["贝叶斯定理"] --> B["朴素贝叶斯\n特征条件独立"]
    B --> C["垃圾邮件过滤"]
    B --> D["情感分析"]
    B --> E["文档分类"]
    A --> F["半朴素贝叶斯\n引入依赖"]
    F --> G["TAN\n树形结构"]
    F --> H["AODE\n一对多依赖"]
    F --> I["贝叶斯网络\n完全自定义"]`,
        tip: "完整的贝叶斯学习路径：朴素贝叶斯 → 半朴素贝叶斯 → 贝叶斯网络 → 概率图模型（MRF/CRF）。",
      },
    ],
};
