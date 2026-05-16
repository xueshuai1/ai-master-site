import { Article } from '../knowledge';

export const article: Article = {
    id: "nlp-010",
    title: "NLP 评估指标：BLEU, ROUGE, METEOR",
    category: "nlp",
    tags: ["评估指标", "NLP", "BLEU"],
    summary: "从 BLEU 到 BERTScore，掌握 NLP 任务的评估体系",
    date: "2026-04-12",
    readTime: "16 min",
    level: "入门",
    content: [
      {
        title: "1. 为什么需要评估指标：NLP 任务的度量体系",
        body: `在 NLP 领域，评估指标不仅仅是打分工具，更是推动技术迭代的核心驱动力。想象一下：你训练了一个机器翻译模型，翻译质量看起来不错——但不错是多少？比上一个版本好多少？和竞品比处于什么水平？没有量化指标，这些问题都无法回答。

评估指标的核心作用有三个。第一，模型选择——在多个候选模型中，用统一标准选出最优者。第二，超参数调优——改变学习率、网络层数等参数后，需要指标告诉我们改进还是退步了。第三，研究进展追踪——学术界用共享指标在论文间横向对比，推动整个领域前进。

NLP 评估的独特挑战在于自然语言具有多解性。同一个意思可以用无数种方式表达。例如中文「今天天气真好」可以译为 "The weather is great today" 或 "It's a beautiful day today"——两者都正确。这与图像分类截然不同，一张图要么是猫要么不是。因此 NLP 评估指标必须在精确匹配和语义等价之间找到平衡。

自动评估 vs 人工评估：最可靠的方式是人工评估，让标注员对翻译质量打分，但这极其昂贵且不可扩展。自动评估指标用算法快速评分，是实际工程中的首选。但自动指标有局限：它们通常基于表面匹配，不真正理解语义。近年来，基于语义模型的评估正在弥补这一差距。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# 人工评估 vs 自动评估的对比模拟
print("=== NLP 评估方法对比 ===\\n")

manual_eval = {
    "cost_per_sample": "$0.50 - $2.00",
    "throughput": "~500 samples/hour (per annotator)",
    "reliability": "high (but subjective)",
    "inter_annotator_agreement": "usually 0.6-0.8 (Kappa)",
}

auto_eval = {
    "cost_per_sample": "$0.001 (compute cost)",
    "throughput": "~100,000 samples/second",
    "reliability": "medium (depends on metric)",
    "correlation_with_human": "BLEU: 0.3-0.6, BERTScore: 0.5-0.8",
}

print("Human Evaluation:")
for k, v in manual_eval.items():
    print(f"  {k}: {v}")

print("\\nAutomatic Evaluation:")
for k, v in auto_eval.items():
    print(f"  {k}: {v}")

# Why multiple metrics?
print("\\n=== Why Multiple Metrics? ===")
print("No single metric fully captures NLP quality:")
print("  - BLEU fits MT, not dialogue generation")
print("  - ROUGE fits summarization, not translation")
print("  - Perplexity fits LM, not generation quality")
print("  - BERTScore is general but expensive")
print("Best practice: use 2-3 complementary metrics")`,
          },
          {
            lang: "python",
            code: `import numpy as np

# n-gram overlap: the core concept of NLP auto-evaluation
def get_ngrams(text, n):
    """Extract n-grams from text"""
    tokens = text.lower().split()
    return [tuple(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]

def ngram_overlap(reference, hypothesis, n):
    """Calculate n-gram overlap ratio"""
    ref_ngrams = get_ngrams(reference, n)
    hyp_ngrams = get_ngrams(hypothesis, n)

    if not hyp_ngrams:
        return 0.0

    ref_counts = {}
    for ng in ref_ngrams:
        ref_counts[ng] = ref_counts.get(ng, 0) + 1

    matched = 0
    for ng in hyp_ngrams:
        if ref_counts.get(ng, 0) > 0:
            matched += 1
            ref_counts[ng] -= 1

    return matched / len(hyp_ngrams)

# Demo
ref = "the cat sat on the mat"
hyp1 = "the cat is sitting on the mat"
hyp2 = "the dog played in the yard"

print("=== n-gram Overlap Demo ===")
for n in [1, 2, 3]:
    s1 = ngram_overlap(ref, hyp1, n)
    s2 = ngram_overlap(ref, hyp2, n)
    print(f"  {n}-gram: good_trans={s1:.3f}, bad_trans={s2:.3f}")

# Higher n = stricter match, lower score
# BLEU combines multiple n-gram scores`,
          },
        ],
        table: {
          headers: ["评估类型", "代表指标", "适用任务", "优点", "缺点"],
          rows: [
            ["表面匹配", "BLEU, ROUGE", "翻译/摘要", "快速、可复现", "忽略语义等价"],
            ["编辑距离", "METEOR, TER", "翻译/摘要", "考虑同义词", "需要外部词典"],
            ["概率模型", "Perplexity", "语言模型", "理论严谨", "不可跨模型比较"],
            ["语义嵌入", "BERTScore", "通用", "捕捉语义", "计算成本高"],
            ["人工评估", "MQM, Likert", "所有任务", "最可靠", "昂贵、不可扩展"],
          ],
        },
        mermaid: `graph TD
    A["NLP Model Output"] --> B{"Evaluation Method?"}
    B -->|"Auto"| C["Surface Match"]
    B -->|"Auto"| D["Semantic"]
    B -->|"Human"| E["Annotator Score"]
    C --> C1["BLEU -> MT"]
    C --> C2["ROUGE -> Summarization"]
    C --> C3["METEOR -> Improved BLEU"]
    D --> D1["BERTScore -> Semantic Sim"]
    D --> D2["BARTScore -> Generative"]
    E --> E1["MQM -> Multi-dim Quality"]
    E --> E2["Likert -> 1-5 Scale"]`,
        tip: "入门建议：先掌握 BLEU 和 ROUGE——它们是 NLP 领域最经典、最广泛使用的两个指标，理解了它们就等于理解了自动评估的核心思想（n-gram 重叠）。",
        warning: "不要用一个指标下结论！BLEU 得分高的模型在人工评估中不一定更好。指标只是辅助工具，最终要看模型在实际场景中的表现。",
      },
      {
        title: "2. BLEU：机器翻译的黄金标准",
        body: `BLEU（Bilingual Evaluation Understudy）由 Papineni 等人于 2002 年提出，是 NLP 历史上最有影响力的评估指标之一。它的设计初衷很直观：用算法自动评估机器翻译的质量，替代昂贵的人工评估。

BLEU 的核心思想是：比较机器翻译（候选译文）与人工翻译（参考译文）之间的 n-gram 重叠程度。n-gram 越长，匹配越难——1-gram 匹配只要求词相同，4-gram 匹配要求连续四个词完全一致。BLEU 综合 1-gram 到 4-gram 的匹配率，用几何平均得到一个综合得分。

精度修正（Modified Precision）是关键设计。直接用 n-gram 精度有漏洞：假设参考译文是「the cat is on the mat」，候选译文是「the the the the the the」——精度是 100%！BLEU 的修正方法：每个 n-gram 在候选中的出现次数，不超过它在参考译文中出现的最大次数。

简短惩罚（Brevity Penalty）防止模型输出过短译文。公式为 BP = exp(1 - r/c)，当候选长度 c 小于参考长度 r 时给予惩罚。BLEU 得分范围 0 到 100，经验法则：小于 10 不可用，20-30 良好，30-40 很好，大于 50 接近人类水平。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from collections import Counter

def get_ngrams(tokens, n):
    """Extract n-gram list"""
    return [tuple(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]

def modified_precision(reference, hypothesis, n):
    """Modified n-gram precision (BLEU core)"""
    ref_ngrams = Counter(get_ngrams(reference, n))
    hyp_ngrams = Counter(get_ngrams(hypothesis, n))

    # Clip: count in hyp cannot exceed count in ref
    clipped_count = sum(
        min(hyp_count, ref_ngrams.get(ng, 0))
        for ng, hyp_count in hyp_ngrams.items()
    )
    total_count = sum(hyp_ngrams.values())

    return clipped_count / total_count if total_count > 0 else 0

def compute_bleu(reference, hypothesis, max_n=4):
    """Calculate BLEU score (simplified)"""
    ref_tokens = reference.split()
    hyp_tokens = hypothesis.split()

    precisions = []
    for n in range(1, max_n + 1):
        p = modified_precision(ref_tokens, hyp_tokens, n)
        precisions.append(p)
        print(f"  {n}-gram precision: {p:.4f}")

    # Geometric mean
    log_avg = np.mean([np.log(max(p, 1e-10)) for p in precisions])
    geom_mean = np.exp(log_avg)

    # Brevity penalty
    ref_len = len(ref_tokens)
    hyp_len = len(hyp_tokens)
    bp = np.exp(1 - ref_len / hyp_len) if hyp_len < ref_len else 1.0

    bleu = bp * geom_mean
    print(f"  BP = {bp:.4f}, Geometric Mean = {geom_mean:.4f}")
    return bleu

ref = "the cat sat on the mat"
print("=== BLEU Calculation Demo ===")
print("\\nHypothesis 1: 'the cat is sitting on the mat'")
s1 = compute_bleu(ref, "the cat is sitting on the mat")
print(f"  BLEU = {s1:.4f}\\n")

print("Hypothesis 2: 'the dog played in the yard'")
s2 = compute_bleu(ref, "the dog played in the yard")
print(f"  BLEU = {s2:.4f}")`,
          },
          {
            lang: "python",
            code: `# BLEU score interpretation
import numpy as np

print("=== BLEU Score Interpretation ===\\n")

bleu_guide = [
    (0, 10, "Unusable", "Translation barely understandable"),
    (10, 20, "Understandable", "Can guess meaning, many errors"),
    (20, 30, "Good", "Mostly fluent, some errors"),
    (30, 40, "Very Good", "High quality, minor issues"),
    (40, 50, "Excellent", "Near professional level"),
    (50, 100, "Human Level", "Indistinguishable from human"),
]

print("BLEU Score Reference:")
for low, high, level, desc in bleu_guide:
    print(f"  {low:3d}-{high:3d}: {level:<15} - {desc}")

# Multi-reference BLEU
print("\\n=== Multi-reference BLEU ===")
print("In practice, each source sentence has multiple reference")
print("translations. BLEU takes the best match across references.")
print()
print("Example:")
print("  Source: 'The cat sat on the mat'")
print("  Ref 1:  'Le chat etait assis sur le tapis'")
print("  Ref 2:  'Le chat s'est assis sur le paillasson'")
print("  Hyp:    'Le chat etait sur le tapis'")
print("  -> Ref 2 gives better match for 'sur le'")
print("  -> Multi-ref BLEU is fairer than single-ref")`,
          },
        ],
        table: {
          headers: ["n-gram 阶数", "匹配含义", "典型精度", "BLEU 中的权重"],
          rows: [
            ["1-gram (unigram)", "单个词匹配", "0.5-0.8", "1/4 (几何平均)"],
            ["2-gram (bigram)", "连续两个词匹配", "0.3-0.6", "1/4 (几何平均)"],
            ["3-gram (trigram)", "连续三个词匹配", "0.1-0.4", "1/4 (几何平均)"],
            ["4-gram", "连续四个词匹配", "0.05-0.3", "1/4 (几何平均)"],
            ["BP (简短惩罚)", "长度惩罚因子", "0.5-1.0", "乘法因子"],
          ],
        },
        mermaid: `graph TD
    A["Hypothesis"] --> B["Extract 1-4 grams"]
    C["Reference"] --> D["Extract 1-4 grams"]
    B --> E["Modified Precision"]
    D --> E
    E --> F["Geometric Mean"]
    G["Length Compare"] --> H["Brevity Penalty BP"]
    F --> I["BLEU = BP x GeomMean"]
    H --> I
    I --> J["Score 0-100"]
    class J s2
    class C s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7f1d1d`,
        tip: "BLEU 的几何平均设计很巧妙——任何一个 n-gram 阶数为 0，整个 BLEU 就为 0。这迫使模型必须在各个粒度上都有一定表现。",
        warning: "BLEU 对词序变化极其敏感。'the cat on mat sat the' 和 'the cat sat on the mat' 的 4-gram 匹配几乎为零，尽管词完全一样。",
      },
      {
        title: "3. ROUGE：文本摘要的评估利器",
        body: `ROUGE（Recall-Oriented Understudy for Gisting Evaluation）由 Lin 和 Och 于 2004 年提出，专门用于评估自动文本摘要的质量。与 BLEU 不同，ROUGE 以召回率（Recall）为核心——它更关心参考摘要中有多少内容被生成摘要覆盖了。

为什么摘要评估要用召回率而非精度？想象一个极端的摘要生成器：它只输出「今天天气很好」这六个字。如果参考摘要确实包含这句话，BLEU 会给它很高的精度分——但这根本不是合格的摘要！摘要评估的核心是覆盖率：参考摘要中的关键信息，自动摘要是否都包含了？

ROUGE 有多个变体：ROUGE-N 计算 n-gram 召回率；ROUGE-L 基于最长公共子序列（LCS），不要求 n-gram 连续匹配，只要求词的相对顺序一致；ROUGE-W 是 ROUGE-L 的加权版本，给连续匹配更高的权重；ROUGE-S 基于跳跃双词，允许中间有间隔的词对匹配。

摘要任务通常有多个参考摘要。ROUGE 取与最佳参考摘要的匹配得分。ROUGE 得分范围也是 0 到 1，在新闻摘要任务中，ROUGE-1 达到 40-50 通常表示模型质量不错。`,
        code: [
          {
            lang: "python",
            code: `from collections import Counter

def rouge_n(reference, hypothesis, n):
    """Calculate ROUGE-N recall, precision and F1"""
    ref_tokens = reference.split()
    hyp_tokens = hypothesis.split()

    ref_ngrams = Counter(
        tuple(ref_tokens[i:i+n]) for i in range(len(ref_tokens) - n + 1)
    )
    hyp_ngrams = Counter(
        tuple(hyp_tokens[i:i+n]) for i in range(len(hyp_tokens) - n + 1)
    )

    # Overlap count (take min)
    overlap = sum(
        min(ref_ngrams[ng], hyp_ngrams[ng]) for ng in hyp_ngrams
    )

    ref_total = sum(ref_ngrams.values())
    recall = overlap / ref_total if ref_total > 0 else 0

    hyp_total = sum(hyp_ngrams.values())
    precision = overlap / hyp_total if hyp_total > 0 else 0

    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    return recall, precision, f1

# Demo
ref = "the cat sat on the mat and the dog played in the yard"
hyp = "the cat was sitting on the mat the dog was playing outside"

print("=== ROUGE-N Calculation ===")
for n in [1, 2, 3]:
    r, p, f1 = rouge_n(ref, hyp, n)
    print(f"  ROUGE-{n}: R={r:.4f}, P={p:.4f}, F1={f1:.4f}")`,
          },
          {
            lang: "python",
            code: `def lcs_length(X, Y):
    """Calculate Longest Common Subsequence length"""
    m, n = len(X), len(Y)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if X[i-1] == Y[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])

    return dp[m][n]

def rouge_l(reference, hypothesis):
    """Calculate ROUGE-L based on LCS"""
    ref_tokens = reference.split()
    hyp_tokens = hypothesis.split()

    lcs_len = lcs_length(ref_tokens, hyp_tokens)

    recall = lcs_len / len(ref_tokens) if ref_tokens else 0
    precision = lcs_len / len(hyp_tokens) if hyp_tokens else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    return recall, precision, f1, lcs_len

# Demo: ROUGE-L advantage
ref = "the cat sat on the mat"
hyp = "the cat is sitting on the mat"

print("=== ROUGE-L vs ROUGE-N ===")
print(f"Ref: '{ref}'")
print(f"Hyp: '{hyp}'\\n")

rl_r, rl_p, rl_f1, lcs_len = rouge_l(ref, hyp)
print(f"ROUGE-L: LCS_len={lcs_len}, R={rl_r:.4f}, P={rl_p:.4f}, F1={rl_f1:.4f}")

r2_r, r2_p, r2_f1 = rouge_n(ref, hyp, 2)
print(f"ROUGE-2: R={r2_r:.4f}, P={r2_p:.4f}, F1={r2_f1:.4f}")

print("\\nROUGE-L captures 'the cat _ _ on the mat' as LCS (5 words)")
print("Even with insertions, ROUGE-L still finds core content coverage")`,
          },
        ],
        table: {
          headers: ["ROUGE 变体", "核心方法", "连续性要求", "适用场景"],
          rows: [
            ["ROUGE-N", "n-gram 召回率", "严格连续", "标准摘要评估"],
            ["ROUGE-L", "最长公共子序列", "相对顺序", "灵活评估，容忍插入"],
            ["ROUGE-W", "加权 LCS", "加权连续", "鼓励更长连续匹配"],
            ["ROUGE-S", "跳跃双词", "允许间隔", "捕捉远距离关联"],
            ["ROUGE-SU", "SU = S + Unigram", "允许间隔", "最全面的 ROUGE 变体"],
          ],
        },
        mermaid: `graph TD
    A["Reference Summary"] --> B["Extract n-gram / LCS"]
    C["Generated Summary"] --> D["Extract n-gram / LCS"]
    B --> E["Compute Overlap"]
    D --> E
    E --> F["Recall = overlap/ref"]
    E --> G["Precision = overlap/hyp"]
    F --> H["F1 = 2PR/(P+R)"]
    G --> H
    H --> I["ROUGE Score"]
    class I s2
    class C s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7f1d1d`,
        tip: "实际使用中，ROUGE-1、ROUGE-2 和 ROUGE-L 三个指标通常一起报告。ROUGE-1 反映词覆盖率，ROUGE-2 反映短语覆盖率，ROUGE-L 反映整体结构覆盖——三者互补。",
        warning: "ROUGE 和 BLEU 有相同的根本局限：基于表面匹配，不真正理解语义。如果生成摘要用同义词替换了参考摘要中的词，ROUGE 会判为不匹配，尽管语义完全正确。",
      },
      {
        title: "4. METEOR：改进 BLEU 的精准评估",
        body: `METEOR（Metric for Evaluation of Translation with Explicit ORdering）由 Banerjee 和 Lavie 于 2005 年提出，直接针对 BLEU 的几个关键缺陷进行改进。

METEOR 的三大改进：第一，同义词匹配——内置 WordNet 词库，能将 "big" 和 "large" 识别为同义匹配，而 BLEU 要求完全相同的字符串。第二，词干匹配——"running" 和 "run" 可以被识别为匹配，这对形态丰富的语言非常重要。第三，显式词序惩罚——METEOR 不仅考虑匹配了多少词，还考虑匹配词的顺序是否一致。

计算流程分为四步：对齐时将候选和参考中的词进行匹配，优先级为精确匹配大于词干匹配大于同义词匹配；计算修正的精度和召回率；用调和平均计算 F-mean，其中召回率权重设为精度的 9 倍；计算词序惩罚，匹配词的碎片越多说明词序越混乱。

多项研究表明，METEOR 与人工评估的 Spearman 相关系数通常比 BLEU 高 0.1-0.2。这是因为 METEOR 通过同义词和词干匹配，更贴近人类理解意思而非匹配字符串的评估方式。`,
        code: [
          {
            lang: "python",
            code: `from collections import Counter
import numpy as np

# Mini synonym dictionary (real METEOR uses WordNet)
SYNONYMS = {
    "big": {"large", "huge", "enormous"},
    "small": {"little", "tiny", "mini"},
    "good": {"great", "excellent", "fine"},
    "cat": {"feline", "kitty", "kitten"},
    "dog": {"canine", "puppy", "pooch"},
    "happy": {"glad", "joyful", "cheerful"},
}

def meteor_match(ref_word, hyp_word):
    """METEOR match: exact > stem > synonym"""
    if ref_word == hyp_word:
        return "exact"

    # Simple stem match
    ref_stem = ref_word.rstrip("ingsed")
    hyp_stem = hyp_word.rstrip("ingsed")
    if ref_stem == hyp_stem and len(ref_stem) > 2:
        return "stem"

    # Synonym match
    syn_ref = SYNONYMS.get(ref_word, set())
    syn_hyp = SYNONYMS.get(hyp_word, set())
    if hyp_word in syn_ref or ref_word in syn_hyp:
        return "synonym"

    return None

def compute_meteor(reference, hypothesis):
    """Simplified METEOR calculation"""
    ref_tokens = reference.lower().split()
    hyp_tokens = hypothesis.lower().split()

    # Greedy alignment
    matched_ref = set()
    matched_hyp = set()

    for i, hyp_w in enumerate(hyp_tokens):
        for j, ref_w in enumerate(ref_tokens):
            if j in matched_ref or i in matched_hyp:
                continue
            if meteor_match(ref_w, hyp_w):
                matched_ref.add(j)
                matched_hyp.add(i)
                break

    precision = len(matched_hyp) / len(hyp_tokens) if hyp_tokens else 0
    recall = len(matched_ref) / len(ref_tokens) if ref_tokens else 0

    # F-mean with alpha=9 (recall weighted 9x)
    alpha = 9
    f_mean = (1 + alpha**3) * precision * recall / \\
             (alpha**3 * precision + recall) if (precision + recall) > 0 else 0

    # Chunk penalty
    chunks = 1
    sorted_hyp = sorted(matched_hyp)
    for i in range(1, len(sorted_hyp)):
        if sorted_hyp[i] != sorted_hyp[i-1] + 1:
            chunks += 1

    penalty = 0.5 * (chunks / max(len(matched_hyp), 1)) ** 3
    score = f_mean * (1 - penalty)

    return score, precision, recall, chunks

ref = "the big cat sat on the mat"
hyp1 = "the large feline sat on the mat"
hyp2 = "the big mat on sat the cat"

print("=== METEOR Calculation ===")
for hyp, label in [(hyp1, "Synonym"), (hyp2, "Word Reorder")]:
    score, p, r, ch = compute_meteor(ref, hyp)
    print(f"  {label}: METEOR={score:.3f}, P={p:.3f}, R={r:.3f}, chunks={ch}")`,
          },
          {
            lang: "python",
            code: `# BLEU vs METEOR comparison
import numpy as np

def simple_bleu(reference, hypothesis, max_n=4):
    """Simplified BLEU"""
    from collections import Counter
    ref_tokens = reference.lower().split()
    hyp_tokens = hypothesis.lower().split()

    precisions = []
    for n in range(1, max_n + 1):
        ref_ng = Counter(
            tuple(ref_tokens[i:i+n]) for i in range(len(ref_tokens)-n+1)
        )
        hyp_ng = Counter(
            tuple(hyp_tokens[i:i+n]) for i in range(len(hyp_tokens)-n+1)
        )
        clipped = sum(
            min(c, ref_ng.get(ng, 0)) for ng, c in hyp_ng.items()
        )
        total = sum(hyp_ng.values())
        precisions.append(clipped / total if total > 0 else 0)

    log_avg = np.mean([np.log(max(p, 1e-10)) for p in precisions])
    rl, hl = len(ref_tokens), len(hyp_tokens)
    bp = np.exp(1 - rl/hl) if hl < rl else 1.0
    return bp * np.exp(log_avg)

print("=== BLEU vs METEOR ===\\n")

test_cases = [
    ("the cat sat on the mat", "the cat sat on the mat", "Exact match"),
    ("the cat sat on the mat", "the feline sat on the mat", "Synonym"),
    ("the cat sat on the mat", "the cat was sitting on mat", "Stem variant"),
    ("the cat sat on the mat", "on the mat sat the cat", "Reorder"),
    ("the cat sat on the mat", "the dog played in the yard", "Different"),
]

for ref, hyp, desc in test_cases:
    bleu = simple_bleu(ref, hyp)
    met, p, r, ch = compute_meteor(ref, hyp)
    arrow = "  ^ METEOR higher (more tolerant)" if met > bleu else "  BLEU higher or equal"
    print(f"{desc}:")
    print(f"  BLEU={bleu:.4f}, METEOR={met:.4f}")
    print(f"{arrow}\\n")`,
          },
        ],
        table: {
          headers: ["特性", "BLEU", "METEOR"],
          rows: [
            ["匹配方式", "精确字符串匹配", "精确+词干+同义词"],
            ["评估核心", "精度为主导", "召回率为主导"],
            ["词序处理", "隐式（高阶 n-gram）", "显式（碎片惩罚）"],
            ["语言资源", "不需要", "WordNet + 词干提取器"],
            ["与人工相关性", "0.3-0.6", "0.4-0.7"],
            ["计算复杂度", "低", "中等（需词典查询）"],
            ["多参考支持", "是", "是（取最佳匹配）"],
          ],
        },
        mermaid: `graph TD
    A["Hypothesis"] --> B["Word Alignment"]
    C["Reference"] --> B
    B --> D{"Match Type?"}
    D -->|"Exact"| E["Exact Match"]
    D -->|"Stem"| F["Stem Match"]
    D -->|"Synonym"| G["Synonym Match"]
    E --> H["Precision & Recall"]
    F --> H
    G --> H
    H --> I["F-mean (alpha=9)"]
    I --> J["Chunk Penalty"]
    J --> K["METEOR Score"]
    class K s1
    class B s0
    classDef s0 fill:#713f12
    classDef s1 fill:#7f1d1d`,
        tip: "如果你的任务涉及丰富的同义词替换（如文学翻译、创意写作），METEOR 比 BLEU 更能反映真实质量。",
        warning: "METEOR 依赖外部语言资源（WordNet、词干提取器），这对低资源语言可能不可用。此时 BLEU 反而是更实际的选择。",
      },
      {
        title: "5. Perplexity：语言模型的内在度量",
        body: `Perplexity（困惑度）是语言模型最经典的评估指标。与 BLEU 和 ROUGE 不同，Perplexity 不比较生成文本与参考文本的匹配程度，而是直接衡量模型对测试数据的惊讶程度——模型对测试文本预测得越好，Perplexity 越低。

直觉理解：假设你的语言模型像一个猜词游戏玩家。给定上文 "Today is a beautiful"，模型需要预测下一个词。如果模型正确地给 "day" 分配了很高的概率（如 0.8），说明它不困惑；如果它给 "day" 的概率很低（如 0.001），说明它很困惑。Perplexity 就是对这种困惑程度的量化。

数学定义：Perplexity = exp(-(1/N) * Σ log P(w_i | context))，等价于 2 的交叉熵次方。可以理解为等效的随机选择数量——PP = 100 意味着模型在每个位置上相当于从 100 个词中等概率随机选择。

典型 Perplexity 值：在 Penn Treebank 上，n-gram 模型 PP 约 100-200，RNN 约 50-100，**Transformer** 约 10-30，**GPT-4** 等超大模型可降至 5 以下。PP 越低越好，但不同测试集上的 PP 不可比较。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def compute_perplexity(model_probs, smooth=1e-10):
    """Calculate perplexity from model probabilities
    model_probs: list of probabilities assigned to correct words
    """
    N = len(model_probs)
    if N == 0:
        return float('inf')

    # Cross-entropy (natural log)
    log_probs = [np.log(max(p, smooth)) for p in model_probs]
    cross_entropy = -np.mean(log_probs)

    # Perplexity = exp(cross_entropy)
    perplexity = np.exp(cross_entropy)
    return perplexity

sentence = ["the", "cat", "sat", "on", "the", "mat"]

# Model A: n-gram (moderate)
probs_a = [0.3, 0.4, 0.2, 0.5, 0.8, 0.6]
pp_a = compute_perplexity(probs_a)

# Model B: random (uniform over 10000 vocab)
probs_b = [1/10000] * 6
pp_b = compute_perplexity(probs_b)

# Model C: Transformer (excellent)
probs_c = [0.7, 0.8, 0.6, 0.9, 0.95, 0.85]
pp_c = compute_perplexity(probs_c)

print("=== Perplexity Calculation ===")
print(f"  Model A (n-gram):    PP = {pp_a:.2f}")
print(f"  Model B (random):    PP = {pp_b:.2f}")
print(f"  Model C (Transform): PP = {pp_c:.2f}")

print(f"\\nInterpretation:")
print(f"  PP={pp_b:.0f}: like choosing from {pp_b:.0f} words randomly")
print(f"  PP={pp_a:.1f}: like choosing from {pp_a:.1f} words")
print(f"  PP={pp_c:.1f}: like choosing from {pp_c:.1f} words")`,
          },
          {
            lang: "python",
            code: `import numpy as np

print("=== Perplexity vs Cross-Entropy ===\\n")

# PP = 2^H (base 2) or exp(H) (base e)
# Each 1-bit reduction in cross-entropy halves perplexity

print(f"{'Cross-Ent H':<14} {'PP (base 2)':<14} {'PP (base e)':<14} {'Quality'}")
print("-" * 55)

for h in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]:
    pp2 = 2 ** h
    ppe = np.exp(h)
    if h <= 4:
        desc = "Good"
    elif h <= 7:
        desc = "Fair"
    else:
        desc = "Poor"
    print(f"{h:<14} {pp2:<14.1f} {ppe:<14.1f} {desc}")

print("\\nKey relationship:")
print("  PP = 2^H  <=>  H = log2(PP)")
print("  Each 1-bit CE reduction halves PP")
print("  CE 7->6: PP 128->64 (big improvement)")
print("  CE 4->3: PP 16->8 (same improvement)")

print("\\n=== Perplexity Limitations ===")
print("1. Only comparable on SAME test set")
print("2. Cannot compare across datasets")
print("3. Low PP != good generation (may overfit)")
print("4. PP only evaluates probability, not coherence")
print("5. Sensitive to vocabulary size")`,
          },
        ],
        table: {
          headers: ["模型类型", "典型 PP (PTB)", "典型 PP (WikiText-103)", "参数量", "特点"],
          rows: [
            ["n-gram (5-gram)", "~140", "N/A", "几百万", "简单、快速、瓶颈明显"],
            ["RNN (LSTM)", "~55", "~65", "几千万", "能捕获长距离依赖"],
            ["Transformer (base)", "~30", "~25", "100M", "并行训练、效果好"],
            ["GPT-2 (1.5B)", "~18", "~16", "1.5B", "大规模预训练"],
            ["GPT-3 (175B)", "~4-8", "~4-6", "175B", "超强语言理解"],
          ],
        },
        mermaid: `graph TD
    A["Test Text W"] --> B["LM predicts P(w_i|ctx)"]
    B --> C["Compute log P(w_i)"]
    C --> D["Avg: -(1/N) * sum(log P)"]
    D --> E["exp(avg log prob)"]
    E --> F["Perplexity"]

    F --> G{"PP Value?"}
    G -->|"PP < 20"| H["Excellent"]
    G -->|"20-50"| I["Good"]
    G -->|"50-100"| J["Fair"]
    G -->|"> 100"| K["Poor"]
    class F s0
    classDef s0 fill:#7f1d1d`,
        tip: "训练语言模型时，Perplexity 是最重要的监控指标。验证集 PP 持续下降但测试集 PP 上升说明过拟合——需要早停或增加正则化。",
        warning: "低 Perplexity 的模型可能生成重复或无聊的文本（因为过度偏好高频词）。PP 只是概率预测的度量，不直接衡量生成质量。",
      },
      {
        title: "6. BERTScore：基于语义的革命性评估",
        body: `BERTScore 由 Zhang 等人于 2020 年提出，代表了 NLP 评估指标的一次范式转变——从基于表面匹配到基于语义理解。

核心思想：用预训练语言模型（如 BERT、RoBERTa）将候选文本和参考文本中的每个词映射为上下文感知的嵌入向量，然后计算两个文本之间嵌入向量的余弦相似度。与 BLEU 不同，BERTScore 不要求词完全相同——"feline" 和 "cat" 在 BERT 的嵌入空间中天然相近，因此能获得高相似度。

计算流程：用 BERT 对候选和参考分别编码，得到每个 token 的上下文嵌入；对候选中的每个 token，在参考中找到余弦相似度最高的 token，反之亦然；候选到参考的匹配率是精度，参考到候选是召回率；调和平均得到最终 BERTScore。

研究表明，BERTScore 与人工评估的相关性显著高于 BLEU 和 METEOR。在 WMT 翻译评估任务中，BERTScore 与人工评估的 Kendall tau 相关系数约 0.45-0.55，而 BLEU 只有 0.3-0.4。这是因为 BERTScore 真正理解了语义。后续方法如 BLEURT 和 COMET 进一步提升了与人工评估的相关性。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def cosine_sim(a, b):
    """Cosine similarity"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10)

def greedy_match(ref_embeds, hyp_embeds):
    """Greedy matching: each token finds best match"""
    ref_to_hyp = []
    for ref_emb in ref_embeds:
        sims = [cosine_sim(ref_emb, h) for h in hyp_embeds]
        ref_to_hyp.append(max(sims))

    hyp_to_ref = []
    for hyp_emb in hyp_embeds:
        sims = [cosine_sim(r, hyp_emb) for r in ref_embeds]
        hyp_to_ref.append(max(sims))

    return np.mean(hyp_to_ref), np.mean(ref_to_hyp)

def bert_score_simulated(reference, hypothesis):
    """Simulated BERTScore computation"""
    np.random.seed(42)

    ref_words = reference.split()
    hyp_words = hypothesis.split()

    # Simulated BERT embeddings (semantically similar = closer vectors)
    emb = {}
    base_cat = np.random.randn(768)
    emb["cat"] = base_cat
    emb["feline"] = base_cat * 0.85 + np.random.randn(768) * 0.15
    emb["kitten"] = base_cat * 0.75 + np.random.randn(768) * 0.2
    emb["dog"] = np.random.randn(768)
    emb["sat"] = np.random.randn(768)
    emb["sitting"] = emb["sat"] * 0.8 + np.random.randn(768) * 0.2
    emb["the"] = np.random.randn(768)
    emb["on"] = np.random.randn(768)
    emb["mat"] = np.random.randn(768)

    ref_e = [emb.get(w, np.random.randn(768)) for w in ref_words]
    hyp_e = [emb.get(w, np.random.randn(768)) for w in hyp_words]

    precision, recall = greedy_match(ref_e, hyp_e)
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    return precision, recall, f1

ref = "the cat sat on the mat"
hyp1 = "the feline was sitting on the mat"
hyp2 = "the dog played in the yard"

print("=== BERTScore (Simulated) ===")
for hyp, label in [(hyp1, "Synonym replace"), (hyp2, "Completely different")]:
    p, r, f1 = bert_score_simulated(ref, hyp)
    print(f"  {label}: P={p:.4f}, R={r:.4f}, F1={f1:.4f}")`,
          },
          {
            lang: "python",
            code: `# Real BERTScore usage (requires bert-score library)
print("=== Real BERTScore Usage ===\\n")

print("# Install:")
print("  pip install bert-score\\n")

print("# Basic usage:")
print("from bert_score import score")
print()
print("cands = ['the cat is sitting on the mat']")
print("refs = ['the cat sat on the mat']")
print("P, R, F1 = score(cands, refs, lang='en', verbose=True)")
print("print(f'P={P.mean():.4f}, R={R.mean():.4f}, F1={F1.mean():.4f}')")
print()

print("# Batch evaluation:")
print("cands = [")
print("    'the cat is sitting on the mat',")
print("    'the dog played in the yard',")
print("]")
print("refs = ['the cat sat on the mat'] * 2")
print("P, R, F1 = score(cands, refs, lang='en')")
print()

print("# Multi-language support:")
print("score(cands, refs, lang='zh')  # Chinese")
print("score(cands, refs, lang='fr')  # French")
print()

print("=== BLEU vs BERTScore ===")
print("BLEU:")
print("  + Fast (no GPU needed)")
print("  + Simple implementation")
print("  - No semantic understanding")
print("  - Sensitive to word order")
print("  - Lower human correlation")
print()
print("BERTScore:")
print("  + Captures semantic equivalence")
print("  + High human correlation")
print("  + Multi-language native support")
print("  - Needs GPU and pretrained model")
print("  - Expensive (~50ms/sentence on GPU)")`,
          },
        ],
        table: {
          headers: ["指标", "语义理解", "计算速度", "与人工相关性", "GPU 需求", "多语言"],
          rows: [
            ["BLEU", "无", "极快", "0.3-0.4", "不需要", "需要分词"],
            ["ROUGE", "无", "极快", "0.3-0.5", "不需要", "需要分词"],
            ["METEOR", "有限（词典）", "快", "0.4-0.6", "不需要", "需要词典"],
            ["BERTScore", "深度语义", "中等", "0.5-0.7", "推荐", "原生支持"],
            ["BLEURT", "微调语义", "慢", "0.55-0.75", "必需", "原生支持"],
            ["COMET", "交叉编码器", "慢", "0.6-0.8", "必需", "原生支持"],
          ],
        },
        mermaid: `graph TD
    A["Candidate Text"] --> B["BERT/RoBERTa Encode"]
    C["Reference Text"] --> D["BERT/RoBERTa Encode"]
    B --> E["Token Embeddings"]
    D --> F["Token Embeddings"]
    E --> G["Greedy Match: max cos_sim"]
    F --> G
    G --> H["Precision: hyp -> ref"]
    G --> I["Recall: ref -> hyp"]
    H --> J["F1 = 2PR/(P+R)"]
    I --> J
    J --> K["BERTScore"]
    class K s2
    class D s1
    class B s0
    classDef s0 fill:#581c87
    classDef s1 fill:#581c87
    classDef s2 fill:#7f1d1d`,
        tip: "如果项目有 GPU 资源且对评估质量要求高，BERTScore 是当前最佳选择。没有 GPU 可用 distilbert-base 来平衡速度和准确性。",
        warning: "BERTScore 不是万能的。生成文本中添加了无关但语义合理的句子，BERTScore 可能反而上升。需要结合 BLEU 等基于匹配的指标综合判断。",
      },
      {
        title: "7. 实战：sacrebleu 与 evaluate 库工具链",
        body: `理论学完了，现在进入实战。在实际工程中，我们很少手写 BLEU 或 ROUGE 计算——而是使用成熟的工具库。本节介绍两个最主流的工具：sacrebleu（BLEU 的标准实现）和 evaluate（Hugging Face 的统一评估框架）。

sacrebleu 的设计哲学是可复现性。传统 BLEU 实现有很多变体（分词方式不同、平滑方法不同、是否大小写敏感等），导致同一组翻译用不同工具算出的 BLEU 分数不同。sacrebleu 通过标准化所有细节来确保：同样的输入一定得到同样的输出。

sacrebleu 的核心特性包括：自动分词支持 131 种语言；统一的平滑处理；内置标准测试集如 WMT；直接输出带签名的 BLEU 分数包含所有配置信息；支持多参考和段级评分。

evaluate 库是 Hugging Face 推出的统一评估框架。它用一个简洁的 API 封装了 50 多种评估指标——BLEU、ROUGE、METEOR、BERTScore 等——全部用同一个接口调用。最佳实践：论文中报告 BLEU 用 sacrebleu，实验对比用 evaluate，需要语义评估用 BERTScore，最终决策结合多个指标综合判断。`,
        code: [
          {
            lang: "python",
            code: `# sacrebleu practical usage
print("=== sacrebleu Practical Guide ===\\n")

print("# Install: pip install sacrebleu")
print()
print("import sacrebleu")
print()

print("# 1. Basic BLEU calculation:")
print("refs = ['the cat sat on the mat', 'a cat is sitting on the mat']")
print("hyps = ['the cat sat on the mat']")
print("bleu = sacrebleu.corpus_bleu(hyps, [refs])")
print("print(bleu.score)  # Output: 100.0")
print()

print("# 2. Signed output (required for papers):")
print("print(bleu.format())")
print("# BLEU = 45.23 67.8/48.9/38.2/30.1 (BP = 1.000 ratio = 1.05)")
print()

print("# 3. Built-in test sets:")
print("# Command line: sacrebleu -t wmt17 -l zh-en < hyp.txt")
print()

print("# 4. chrF: character-level F-score")
print("# Better for morphologically rich languages")
print("chrf = sacrebleu.corpus_chrf(hyps, [refs])")
print()

print("# 5. TER: Translation Edit Rate")
print("# Lower is better (measures edit distance)")
print("ter = sacrebleu.corpus_ter(hyps, [refs])")`,
          },
          {
            lang: "python",
            code: `# Hugging Face evaluate library
print("=== evaluate Library ===\\n")

print("from evaluate import load")
print()

print("# 1. Load metrics:")
print("bleu = load('bleu')")
print("rouge = load('rouge')")
print("meteor = load('meteor')")
print("bertscore = load('bertscore')")
print()

print("# 2. Unified API:")
print("predictions = ['the cat sat on the mat']")
print("references = ['the cat sat on the mat']")
print()

print("bleu_result = bleu.compute(")
print("    predictions=predictions,")
print("    references=references")
print(")")
print("print(bleu_result)  # {'bleu': 100.0, ...}")
print()

print("# 3. Batch evaluation:")
print("for name in ['bleu', 'rouge', 'meteor']:")
print("    metric = load(name)")
print("    score = metric.compute(")
print("        predictions=test_preds,")
print("        references=test_refs")
print("    )")
print("    results[name] = score")
print()

print("# 4. Model comparison:")
print("models = ['gpt2', 'gpt2-medium', 'gpt2-large']")
print("for model_name in models:")
print("    bleu = load('bleu')")
print("    score = bleu.compute(predictions=preds, references=refs)")
print("    print(f'{model_name}: BLEU={score[\"bleu\"]:.2f}')")`,
          },
        ],
        table: {
          headers: ["工具", "支持指标", "安装", "主要优势", "适用场景"],
          rows: [
            ["sacrebleu", "BLEU, chrF, TER", "pip install", "可复现、内置测试集", "论文报告 BLEU"],
            ["evaluate", "50+ 指标", "pip install evaluate", "统一 API、易用", "实验对比"],
            ["nltk.translate", "BLEU, METEOR", "pip install nltk", "轻量、无外部依赖", "快速原型"],
            ["rouge-score", "ROUGE", "pip install rouge-score", "Google 官方实现", "摘要评估"],
            ["bert-score", "BERTScore", "pip install bert-score", "语义评估", "高质量评估"],
          ],
        },
        mermaid: `graph TD
    A["Model Output"] --> B{"Choose Tool?"}
    B -->|"Paper"| C["sacrebleu"]
    B -->|"Experiment"| D["evaluate"]
    B -->|"Semantic"| E["bert-score"]
    B -->|"Prototype"| F["nltk.translate"]

    C --> G["BLEU + Signature"]
    D --> H["Multi-metric Dict"]
    E --> I["P/R/F1 Similarity"]
    F --> J["BLEU/METEOR"]

    G --> K["Final Report"]
    H --> K
    I --> K
    J --> K
    class K s1
    class B s0
    classDef s0 fill:#713f12
    classDef s1 fill:#581c87`,
        tip: "论文中报告 BLEU 分数时，一定要用 sacrebleu 并附上签名输出。这确保了其他研究者可以用你的配置复现结果——这是学术诚信的基本要求。",
        warning: "不要在论文中报告自己手写的 BLEU 实现结果。不同实现之间的差异可能导致 1-3 分的 BLEU 差距，足以改变结论。始终使用 sacrebleu。",
      },
    ],
};
