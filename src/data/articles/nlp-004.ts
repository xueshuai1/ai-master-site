import { Article } from '../knowledge';

export const article: Article = {
    id: "nlp-004",
    title: "命名实体识别 NER",
    category: "nlp",
    tags: ["NER", "序列标注", "NLP"],
    summary: "从 BIO 标注到 BERT-CRF，掌握信息抽取的核心技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
      {
        title: "1. NER 任务定义与 BIO/BIOES 标注体系",
        body: `命名实体识别（Named Entity Recognition, NER）是 NLP 中最基础的序列标注任务之一。给定一个句子，NER 的目标是识别出其中具有特定意义的实体（人名、地名、组织机构名、时间、金额等），并将其分类到预定义的类别中。

任务形式化： 输入序列 X = (x₁, x₂, ..., xₙ)，输出标签序列 Y = (y₁, y₂, ..., yₙ)，其中每个 yᵢ 对应 xᵢ 的实体标签。这是一个典型的 Seq2Seq 任务——输入和输出长度相同，但输出不是自由文本，而是从有限标签集中选取的结构化标签。

BIO 标注体系是最常用的方案：
- B-XXX（Begin）： 实体的第一个字/词
- I-XXX（Inside）： 实体的非首字/词
- O（Outside）： 非实体部分

例如：「张(B-PER) 三(I-PER) 在(O) 北(B-LOC) 京(I-LOC) 工(O) 作(O)」

BIOES 标注体系在 BIO 基础上增加了两个标签：
- S-XXX（Single）： 单字实体
- E-XXX（End）： 实体的最后一个字

BIOES 的优势在于约束更严格——解码器不能产生 B-XXX 后紧跟另一个 B-XXX 的非法序列，也更容易区分相邻实体。代价是标签空间从 2K+1 膨胀到 4K+1（K 为实体类别数）。

嵌套实体问题： 传统 BIO 标注无法处理嵌套。例如「北京市(B-LOC) 大学(I-LOC)」中，「北京」本身也是地名。这需要通过分层 BIO、片段枚举或超图标注来解决。`,
        code: [
          {
            lang: "python",
            code: `# BIO 标注：句子到标签序列的转换
def bio_label_spans(tags):
    """从 BIO 标签序列中提取实体片段"""
    entities = []
    current_type = None
    start = None
    
    for i, tag in enumerate(tags):
        if tag.startswith('B-'):
            # 新实体开始
            if current_type is not None:
                entities.append((current_type, start, i - 1))
            current_type = tag[2:]
            start = i
        elif tag.startswith('I-'):
            tag_type = tag[2:]
            if current_type != tag_type:
                # I- 标签与当前实体类型不匹配，视为新实体
                if current_type is not None:
                    entities.append((current_type, start, i - 1))
                current_type = tag_type
                start = i
        else:
            # O 标签，结束当前实体
            if current_type is not None:
                entities.append((current_type, start, i - 1))
                current_type = None
                start = None
    
    if current_type is not None:
        entities.append((current_type, start, len(tags) - 1))
    
    return entities

# 示例
tokens = ["张", "三", "在", "北", "京", "大", "学", "工", "作"]
tags   = ["B-PER", "I-PER", "O", "B-LOC", "I-LOC", "I-LOC", "I-LOC", "O", "O"]

entities = bio_label_spans(tags)
print("=== BIO 实体提取 ===")
for ent_type, start, end in entities:
    text = "".join(tokens[start:end + 1])
    print(f"  [{ent_type}] {text} (位置: {start}-{end})")`,
          },
          {
            lang: "python",
            code: `# BIOES 标注体系与 BIO 对比
def bio_to_bioes(tags):
    """将 BIO 标签转换为 BIOES"""
    bioes = []
    n = len(tags)
    
    for i, tag in enumerate(tags):
        if tag == 'O':
            bioes.append('O')
        elif tag.startswith('B-'):
            ent_type = tag[2:]
            if i + 1 < n and tags[i + 1].startswith('I-' + ent_type):
                bioes.append(f'B-{ent_type}')
            else:
                bioes.append(f'S-{ent_type}')  # 单字实体
        elif tag.startswith('I-'):
            ent_type = tag[2:]
            if i + 1 < n and tags[i + 1].startswith('I-' + ent_type):
                bioes.append(f'I-{ent_type}')
            else:
                bioes.append(f'E-{ent_type}')  # 实体结束
        else:
            bioes.append(tag)
    
    return bioes

# 对比 BIO vs BIOES
tokens = ["北", "京", "奥", "运", "会"]
bio    = ["B-EVENT", "I-EVENT", "I-EVENT", "I-EVENT", "I-EVENT"]
bioes  = bio_to_bioes(bio)

print("=== BIO vs BIOES 对比 ===")
for t, b, be in zip(tokens, bio, bioes):
    print(f"  {t}: BIO={b:<12} BIOES={be}")

print("\\nBIOES 额外约束:")
print("  1. B- 后面必须是 I- 或 E-（不能直接跟 B-）")
print("  2. I- 后面必须是 I- 或 E-（不能直接跟 B- 或 O）")
print("  3. S- 和 E- 后面必须是 B- 或 S- 或 O")
print("  4. 这些约束在 CRF 解码时自动 enforced")`,
          },
        ],
        table: {
          headers: ["标注方案", "标签数", "标签类型", "优势", "劣势"],
          rows: [
            ["BIO", "2K+1", "B-XXX, I-XXX, O", "简单通用，工具链成熟", "无法检测非法 B-B 转换"],
            ["BIOES", "4K+1", "B/I/E/S-XXX, O", "约束更强，解码更准", "标签空间大 2 倍"],
            ["BIOESU", "4K+2", "+ U(统一)", "支持单实体独立标注", "更复杂"],
            ["BMES", "4K", "B/M/E/S-XXX", "无 O 标签，紧凑", "不区分实体内外"],
            ["START/END", "2K", "START-XXX, END-XXX", "适合片段枚举", "不兼容 CRF 线性链"],
          ],
        },
        mermaid: `graph TD
    A["输入句子"] --> B["分词/分字"]
    B --> C["标注方案选择"]
    C --> D["BIO"]
    C --> E["BIOES"]
    D --> F["序列标注模型"]
    E --> F
    F --> G["预测标签序列"]
    G --> H["解码: 提取实体片段"]
    H --> I["输出: (实体文本, 类型, 位置)"]
    class I s2
    class F s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#581c87`,
        tip: "初学者从 BIO 开始，掌握后再切换到 BIOES。BIOES 在 CoNLL-2003 等基准上通常比 BIO 高 0.5-1 个百分点的 F1，但如果你只有少量标注数据，BIO 更不容易过拟合。",
        warning: "标注一致性是 NER 最大的坑。同一个实体边界在不同标注员之间可能不同（如「北京大学」是 [北京] + [大学] 还是 [北京大学]？），标注前必须制定详细的标注规范文档。",
      },
      {
        title: "2. 传统方法：HMM 与 CRF",
        body: `在深度学习统治 NLP 之前，隐马尔可夫模型（HMM）和条件随机场（CRF）是 NER 的两大主力。理解它们对学习现代 NER 架构至关重要——因为即使 BERT 时代，CRF 解码层仍然被广泛使用。

HMM（隐马尔可夫模型） 是一个生成式模型。它假设标签序列是一个马尔可夫链（当前标签只依赖前一个标签），且每个观测（词）只依赖当前标签。形式化地：
P(X, Y) = P(y₁) · Πᵢ P(yᵢ|yᵢ₋₁) · Πᵢ P(xᵢ|yᵢ)

HMM 有三个核心参数：初始概率 π（第一个标签的分布）、转移概率 A（标签间的转移）、发射概率 B（标签生成词的概率）。训练用 Baum-Welch（EM 算法），解码用 Viterbi 算法。

HMM 的根本局限： 独立性假设太强。它假设 xᵢ 只依赖 yᵢ（观测独立性），但实际中 xᵢ 的特征（如前一个词、后缀、大小写）对预测 yᵢ 非常重要。HMM 无法利用这些丰富的特征函数。

CRF（线性链条件随机场） 解决了这个问题。CRF 是判别式模型，直接建模 P(Y|X)，允许使用任意特征函数：
P(Y|X) = (1/Z(X)) · exp(Σᵢ Σₖ λₖ fₖ(yᵢ₋₁, yᵢ, X, i))

其中 fₖ 是特征函数（如「当前词是大写」→ B-PER），λₖ 是对应权重。CRF 可以定义数万甚至数十万个特征，包括词形、上下文、词典匹配等。

为什么 CRF 比 HMM 强？ HMM 的发射概率 P(xᵢ|yᵢ) 只能回答「给定标签 PER，这个词出现的概率是多少」——这对低频词几乎无法估计。CRF 则问「给定这个词及其上下文特征，标签是 PER 的概率是多少」，可以灵活组合各种特征。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# HMM 简化实现
class NERHMM:
    """基于 HMM 的 NER 模型"""
    
    def __init__(self, states, observations):
        self.states = states  # 标签集合 [O, B-PER, I-PER, B-LOC, I-LOC, ...]
        self.obs = observations  # 词汇表
        self.n_states = len(states)
        self.n_obs = len(observations)
        self.s2i = {s: i for i, s in enumerate(states)}
        self.o2i = {w: i for i, w in enumerate(observations)}
    
    def train(self, sequences, labels):
        """用监督数据估计 HMM 参数"""
        # 初始概率
        pi = np.zeros(self.n_states) + 1e-6  # 平滑
        # 转移矩阵
        A = np.zeros((self.n_states, self.n_states)) + 1e-6
        # 发射矩阵
        B = np.zeros((self.n_states, self.n_obs)) + 1e-6
        
        for seq, labs in zip(sequences, labels):
            pi[self.s2i[labs[0]]] += 1
            for t in range(len(seq)):
                s = self.s2i[labs[t]]
                o = self.o2i.get(seq[t], 0)  # UNK → 0
                B[s, o] += 1
                if t > 0:
                    prev_s = self.s2i[labs[t - 1]]
                    A[prev_s, s] += 1
        
        # 归一化
        self.pi = pi / pi.sum()
        self.A = A / A.sum(axis=1, keepdims=True)
        self.B = B / B.sum(axis=1, keepdims=True)
    
    def viterbi_decode(self, obs_seq):
        """Viterbi 解码：找到最优标签序列"""
        T = len(obs_seq)
        N = self.n_states
        
        # δ[t][s]: 时刻 t 到达状态 s 的最大概率
        delta = np.zeros((T, N))
        psi = np.zeros((T, N), dtype=int)
        
        # 初始化
        o0 = self.o2i.get(obs_seq[0], 0)
        delta[0] = np.log(self.pi + 1e-10) + np.log(self.B[:, o0] + 1e-10)
        
        # 递推
        for t in range(1, T):
            o_t = self.o2i.get(obs_seq[t], 0)
            for s in range(N):
                scores = delta[t - 1] + np.log(self.A[:, s] + 1e-10)
                psi[t, s] = np.argmax(scores)
                delta[t, s] = scores[psi[t, s]] + np.log(self.B[s, o_t] + 1e-10)
        
        # 回溯
        path = [0] * T
        path[T - 1] = np.argmax(delta[T - 1])
        for t in range(T - 2, -1, -1):
            path[t] = psi[t + 1, path[t + 1]]
        
        return [self.states[s] for s in path]

# 训练示例
states = ["O", "B-PER", "I-PER", "B-LOC", "I-LOC"]
vocab = ["张", "三", "李", "四", "在", "北", "京", "上", "工", "作", "<UNK>"]

hmm = NERHMM(states, vocab)
seqs = [["张", "三", "在", "北", "京"], ["李", "四", "在", "上", "海"]]
labs = [["B-PER", "I-PER", "O", "B-LOC", "I-LOC"],
        ["B-PER", "I-PER", "O", "B-LOC", "I-LOC"]]
hmm.train(seqs, labs)

# 测试
test = ["张", "三", "在", "北", "京"]
pred = hmm.viterbi_decode(test)
print("=== HMM Viterbi 解码 ===")
for t, p in zip(test, pred):
    print(f"  {t} → {p}")`,
          },
          {
            lang: "python",
            code: `import numpy as np

# CRF 特征函数设计
class CRFFeatureExtractor:
    """CRF 特征提取器"""
    
    def __init__(self):
        self.feature_funcs = [
            self._unigram_word,       # 当前词
            self._unigram_suffix,     # 当前词后缀
            self._unigram_capital,    # 当前词是否大写
            self._bigram_prev_word,   # 前一个词
            self._bigram_next_word,   # 后一个词
            self._word_shape,         # 词形模式
        ]
    
    def _unigram_word(self, tokens, i, tag):
        return f"UW={tokens[i]},{tag}"
    
    def _unigram_suffix(self, tokens, i, tag):
        word = tokens[i]
        suffix = word[-2:] if len(word) >= 2 else word
        return f"US={suffix},{tag}"
    
    def _unigram_capital(self, tokens, i, tag):
        is_cap = tokens[i][0].isupper() if tokens[i] else False
        return f"UC={is_cap},{tag}"
    
    def _bigram_prev_word(self, tokens, i, tag):
        if i == 0:
            return None
        return f"BPW={tokens[i-1]},{tag}"
    
    def _bigram_next_word(self, tokens, i, tag):
        if i == len(tokens) - 1:
            return None
        return f"BNW={tokens[i+1]},{tag}"
    
    def _word_shape(self, tokens, i, tag):
        word = tokens[i]
        shape = "".join(
            "X" if c.isupper() else "x" if c.islower() else "d" if c.isdigit() else c
            for c in word
        )
        return f"WS={shape},{tag}"
    
    def extract(self, tokens, tag_seq):
        """提取所有特征"""
        features = {}
        for i, tag in enumerate(tag_seq):
            for func in self.feature_funcs:
                f = func(tokens, i, tag)
                if f:
                    features[f] = features.get(f, 0) + 1
            # 转移特征
            if i > 0:
                trans = f"T:{tag_seq[i-1]}→{tag}"
                features[trans] = features.get(trans, 0) + 1
        return features

# 演示特征提取
extractor = CRFFeatureExtractor()
tokens = ["John", "Smith", "works", "in", "Beijing"]
tags = ["B-PER", "I-PER", "O", "O", "B-LOC"]

features = extractor.extract(tokens, tags)
print("=== CRF 特征提取示例 ===")
for feat, count in sorted(features.items())[:15]:
    print(f"  {feat}: {count}")
print(f"  ... 共 {len(features)} 个特征")`,
          },
        ],
        table: {
          headers: ["特性", "HMM", "最大熵马尔可夫 (MEMM)", "线性链 CRF"],
          rows: [
            ["模型类型", "生成式", "判别式", "判别式"],
            ["建模目标", "P(X, Y)", "P(yᵢ|yᵢ₋₁, X)", "P(Y|X)"],
            ["特征灵活性", "仅 P(x|y)", "任意特征函数", "任意特征函数"],
            ["标注偏置", "无", "有（局部归一化）", "无（全局归一化）"],
            ["解码算法", "Viterbi", "Viterbi", "Viterbi"],
            ["训练算法", "MLE / EM", "IIS / L-BFGS", "L-BFGS / SGD"],
            ["典型 F1 (CoNLL-2003)", "~85%", "~88%", "~90%"],
          ],
        },
        mermaid: `graph TD
    A["HMM"] -->|"独立性假设太强"| B["无法利用丰富特征"]
    B --> C["MEMM"]
    C -->|"局部归一化 → 标注偏置"| D["偏好短实体"]
    D --> E["CRF"]
    E -->|"全局归一化 Z(X)"| F["最优标签序列"]
    class F s3
    class E s2
    class C s1
    class A s0
    classDef s0 fill:#7f1d1d
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87`,
        tip: "CRF 的特征工程是体力活但回报巨大。手工特征如「词是否全大写」「是否包含数字」「词后缀是 -tion 还是 -ing」在实体边界判断上非常有效。即使今天用深度学习，这些特征思想仍然适用（作为预训练模型的补充）。",
        warning: "MEMM 的标注偏置问题（Label Bias）常被忽视。由于 MEMM 在每个位置做局部归一化（Σᵧ P(y|y₋₁, x) = 1），状态转移少的标签（如 O）更容易被选到，导致模型偏好产生短实体。CRF 的全局归一化解决了这个问题。",
      },
      {
        title: "3. BiLSTM-CRF 架构：深度学习时代的 NER 标准",
        body: `BiLSTM-CRF 是 2015-2018 年间 NER 任务的 SOTA 架构，至今仍是理解序列标注的重要基线。它巧妙地将深度表示学习（BiLSTM）和结构化预测（CRF）结合在一起。

三层架构：
1. 表示层（Embedding）： 将每个词映射为向量。可以是预训练词向量（Word2Vec/GloVe），也可以是字符级 CNN/LSTM 编码（解决 OOV 问题）。
2. 编码层（BiLSTM）： 双向 LSTM 编码上下文信息。前向 LSTM 从左到右读取，后向 LSTM 从右到左读取，两者的隐状态拼接得到每个位置的上下文感知表示。
3. 解码层（CRF）： 线性链 CRF 在 BiLSTM 输出上做全局最优解码。CRF 层的发射分数由 BiLSTM 提供（每个位置的每个标签的得分），转移参数由 CRF 层自己学习。

为什么需要 CRF 层？ 如果只用 BiLSTM + Softmax（每个位置独立分类），模型可能输出非法标签序列（如 I-PER 跟在 O 后面）。CRF 层通过学习转移矩阵来禁止这些非法转换，确保输出是合法的标签序列。

字符级表示： BiLSTM-CRF 通常配合字符级 LSTM 使用。对每个词的字符序列跑一个 LSTM，取最终隐状态作为该词的字符级表示，再与词向量拼接。这样模型可以学习词缀模式（如「-tion → 名词」），天然解决 OOV 问题。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class BiLSTMCRFSimplified:
    """BiLSTM-CRF 简化演示（非训练，仅展示架构）"""
    
    def __init__(self, vocab_size, embed_dim, hidden_dim, n_tags):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.hidden_dim = hidden_dim
        self.n_tags = n_tags
        
        # 词嵌入层
        self.embedding = np.random.randn(vocab_size, embed_dim) * 0.1
        
        # BiLSTM 权重 (简化: 单层)
        self.W_f = np.random.randn(embed_dim + hidden_dim, hidden_dim) * 0.1
        self.W_b = np.random.randn(embed_dim + hidden_dim, hidden_dim) * 0.1
        
        # 发射层: BiLSTM 输出 → 标签分数
        self.W_emit = np.random.randn(2 * hidden_dim, n_tags) * 0.1
        
        # CRF 转移矩阵
        self.trans = np.random.randn(n_tags, n_tags) * 0.1
        # 强制设置非法转移为大负数
        # I-PER 不能跟在 O 后面 (假设 O=0, B-PER=1, I-PER=2)
        self.trans[0, 2] = -100  # O → I-PER 非法
        self.trans[0, 4] = -100  # O → I-LOC 非法
    
    def get_emission_scores(self, sentence):
        """BiLSTM 生成发射分数矩阵"""
        T = len(sentence)
        d = self.hidden_dim
        
        # 简化: 用随机模拟 BiLSTM 输出
        # 实际中这里跑前向和反向 LSTM
        forward_h = np.random.randn(T, d) * 0.5
        backward_h = np.random.randn(T, d) * 0.5
        
        # 拼接双向隐状态
        bi_h = np.concatenate([forward_h, backward_h], axis=1)  # (T, 2d)
        
        # 发射分数: (T, n_tags)
        emissions = bi_h @ self.W_emit
        return emissions
    
    def viterbi_decode(self, emissions):
        """CRF Viterbi 解码"""
        T, K = emissions.shape
        
        # DP 表
        dp = np.full((T, K), -np.inf)
        backpointers = np.zeros((T, K), dtype=int)
        
        # 初始化
        dp[0] = emissions[0]
        
        # 递推
        for t in range(1, T):
            for j in range(K):
                scores = dp[t - 1] + self.trans[:, j] + emissions[t, j]
                backpointers[t, j] = np.argmax(scores)
                dp[t, j] = scores[backpointers[t, j]]
        
        # 回溯
        path = [0] * T
        path[T - 1] = np.argmax(dp[T - 1])
        for t in range(T - 2, -1, -1):
            path[t] = backpointers[t + 1, path[t + 1]]
        
        return path, dp[T - 1, path[T - 1]]

# 演示
model = BiLSTMCRFSimplified(vocab_size=1000, embed_dim=100, hidden_dim=64, n_tags=5)
tags = ["O", "B-PER", "I-PER", "B-LOC", "I-LOC"]
sentence = [0, 1, 2, 3, 4]  # 词索引

emissions = model.get_emission_scores(sentence)
path, score = model.viterbi_decode(emissions)

print("=== BiLSTM-CRF 解码 ===")
for i, p in enumerate(sentence):
    print(f"  词 {p} → {tags[path[i]]} (发射分数: {emissions[i, path[i]]:.3f})")
print(f"  总得分: {score:.3f}")`,
          },
          {
            lang: "python",
            code: `import numpy as np

# 字符级 CNN 编码器
class CharCNN:
    """字符级 CNN: 从字符序列生成词表示"""
    
    def __init__(self, char_vocab_size, char_embed_dim, num_filters=30,
                 filter_sizes=(3, 4, 5)):
        self.char_embed = np.random.randn(char_vocab_size, char_embed_dim) * 0.1
        self.num_filters = num_filters
        self.filter_sizes = filter_sizes
        
        # 每种 filter size 一组卷积核
        self.conv_weights = {}
        self.conv_biases = {}
        for fs in filter_sizes:
            self.conv_weights[fs] = np.random.randn(fs, char_embed_dim, num_filters) * 0.1
            self.conv_biases[fs] = np.zeros(num_filters)
    
    def encode_word(self, chars):
        """对单个词的字符序列编码"""
        # 字符嵌入: (L, char_d)
        char_indices = [min(c, self.char_embed.shape[0] - 1) for c in chars]
        char_embeds = self.char_embed[char_indices]  # (L, char_d)
        
        # 多尺度卷积 + max pooling
        representations = []
        for fs in self.filter_sizes:
            if len(chars) < fs:
                continue
            # 卷积: 滑动窗口
            conv_out = []
            for i in range(len(chars) - fs + 1):
                window = char_embeds[i:i + fs]  # (fs, char_d)
                # 简化的卷积操作
                feature_map = np.tensordot(window, self.conv_weights[fs], axes=([0, 1], [0, 1]))
                conv_out.append(feature_map)
            
            if conv_out:
                conv_out = np.array(conv_out)  # (L-fs+1, num_filters)
                # Max pooling over time
                pooled = conv_out.max(axis=0)  # (num_filters,)
                representations.append(pooled)
        
        # 拼接所有 filter size 的 pooled 向量
        if representations:
            return np.concatenate(representations)
        return np.zeros(self.num_filters * len(self.filter_sizes))
    
    def encode_sentence(self, sentence_chars):
        """对句子中所有词编码"""
        return np.array([self.encode_word(chars) for chars in sentence_chars])

# 演示
char_vocab = {"<PAD>": 0, "<UNK>": 1}
for c in "abcdefghijklmnopqrstuvwxyz":
    char_vocab[c] = len(char_vocab)

char_cnn = CharCNN(char_vocab_size=len(char_vocab), char_embed_dim=10)

words = [[char_vocab.get(c, 1) for c in "unhappiness"],
         [char_vocab.get(c, 1) for c in "running"],
         [char_vocab.get(c, 1) for c in "the"]]

print("=== 字符级 CNN 编码 ===")
for chars in words:
    rep = char_cnn.encode_word(chars)
    print(f"  词长={len(chars):2d} → 表示维度={len(rep):3d} (前5维: {rep[:5]})")`,
          },
        ],
        table: {
          headers: ["组件", "作用", "输入", "输出", "可训练参数"],
          rows: [
            ["词嵌入层", "词 → 向量", "词索引", "(T, d_word)", "V × d_word"],
            ["字符 CNN/LSTM", "字符 → 词缀表示", "字符序列", "(T, d_char)", "词缀相关"],
            ["BiLSTM", "上下文编码", "拼接向量 (T, d_word+d_char)", "(T, 2×hidden)", "~4×hidden×(d+hidden)"],
            ["线性发射层", "隐状态 → 标签分数", "(T, 2×hidden)", "(T, K)", "2×hidden×K"],
            ["CRF 层", "全局最优解码", "(T, K) 发射分数 + 转移矩阵", "最优标签序列 (T,)", "K×K 转移矩阵"],
          ],
        },
        mermaid: `graph TD
    A["输入句子"] --> B["词嵌入 + 字符CNN"]
    B --> C["拼接: d_word + d_char"]
    C --> D["前向 LSTM"]
    C --> E["后向 LSTM"]
    D --> F["拼接: →h ←h"]
    E --> F
    F --> G["线性层: 发射分数"]
    G --> H["CRF: 转移矩阵 + Viterbi"]
    H --> I["最优标签序列"]
    class I s4
    class H s3
    class F s2
    class C s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87
    classDef s4 fill:#7f1d1d`,
        tip: "BiLSTM-CRF 是学习序列标注的最佳起点。PyTorch 的 torchcrf 或 keras-contrib 的 CRF 层可以直接用。建议先在小型数据集（如 1000 句）上跑通整个 pipeline，再扩展到完整数据集。",
        warning: "BiLSTM 是序列模型，无法并行化训练——这是它最大的性能瓶颈。GPU 利用率通常只有 30-50%。如果你的数据集很大（> 100 万句），考虑直接用 Transformer 架构。",
      },
      {
        title: "4. BERT 微调 NER：预训练语言模型的降维打击",
        body: `BERT 的出现彻底改变了 NER 任务范式。不再需要手工设计特征、训练 BiLSTM——只需在预训练 BERT 之上加一个分类头，微调即可达到远超 BiLSTM-CRF 的效果。

核心原理： BERT 在大规模无标注语料上通过 MLM（Masked Language Modeling）和 NSP（Next Sentence Prediction）预训练，学到了深层的语言表示。微调 NER 时，我们：
1. 输入句子通过 BERT 得到每个 token 的上下文表示 H = (h₁, h₂, ..., hₙ)，其中 hᵢ ∈ R⁷⁶⁸（BERT-base）
2. 对每个位置加一个线性分类层：yᵢ = softmax(W · hᵢ + b)，W ∈ R^(K×768)
3. 用交叉熵损失微调 BERT 和分类层：L = -Σᵢ log P(yᵢ|hᵢ)

WordPiece 分词问题： BERT 使用 WordPiece 分词器，会将未登录词切分为子词。例如「unhappiness」→「un + ##happy + ##ness」。这对 NER 带来挑战：一个实体可能跨越多个子词。

解决方案：
1. 首子词策略（First Subword）： 只对每个词的第一个子词做预测，忽略后续子词。这是最常用也最简单的方法。
2. 全子词策略： 对所有子词做预测，然后通过投票或取平均得到词级标签。
3. 跨度预测（Span-based）： 不预测每个 token 的标签，而是直接预测实体跨度（start, end, type）。

BERT-CRF： 在 BERT 输出上叠加 CRF 层，结合 BERT 的强大表示和 CRF 的结构化约束。这通常是单句 NER 的最强架构。`,
        code: [
          {
            lang: "python",
            code: `from transformers import BertTokenizer, BertForTokenClassification
import torch

# BERT NER 推理示例
def ner_with_bert(text, model_name="bert-base-chinese"):
    """用 BERT 做中文 NER"""
    tokenizer = BertTokenizer.from_pretrained(model_name)
    model = BertForTokenClassification.from_pretrained(
        model_name, num_labels=9  # O, B-PER, I-PER, B-LOC, I-LOC, B-ORG, I-ORG, B-MISC, I-MISC
    )
    model.eval()
    
    # 分词
    tokens = tokenizer.tokenize(text)
    input_ids = tokenizer.convert_tokens_to_ids(tokens)
    
    # 添加 [CLS] 和 [SEP]
    input_ids = [tokenizer.cls_token_id] + input_ids + [tokenizer.sep_token_id]
    attention_mask = [1] * len(input_ids)
    
    # 推理
    with torch.no_grad():
        outputs = model(
            input_ids=torch.tensor([input_ids]),
            attention_mask=torch.tensor([attention_mask])
        )
        predictions = torch.argmax(outputs.logits, dim=2)[0]
    
    # 标签映射
    label_map = {
        0: "O", 1: "B-PER", 2: "I-PER", 3: "B-LOC", 4: "I-LOC",
        5: "B-ORG", 6: "I-ORG", 7: "B-MISC", 8: "I-MISC"
    }
    
    # 提取实体（跳过 [CLS] 和 [SEP]）
    results = []
    for token, pred in zip(tokens, predictions[1:-1]):
        results.append((token, label_map[pred.item()]))
    
    return results

# 模拟输出
print("=== BERT NER 推理模拟 ===")
text = "张三在北京大学工作"
tokens = ["张", "三", "在", "北", "京", "大", "学", "工", "作"]
preds  = ["B-PER", "I-PER", "O", "B-ORG", "I-ORG", "I-ORG", "I-ORG", "O", "O"]

print(f"输入: {text}")
for t, p in zip(tokens, preds):
    print(f"  {t} → {p}")`,
          },
          {
            lang: "python",
            code: `import numpy as np

# WordPiece 分词对 NER 的影响
def simulate_wordpiece_split(word, max_len=10):
    """模拟 WordPiece 分词"""
    # 简化的子词拆分规则
    prefixes = ["un", "re", "dis", "pre", "mis", "over", "under"]
    suffixes = ["ness", "tion", "ment", "ing", "ed", "ly", "er", "able"]
    
    subwords = []
    rest = word
    
    # 检查前缀
    for p in prefixes:
        if rest.startswith(p) and len(rest) > len(p):
            subwords.append(p)
            rest = rest[len(p):]
            break
    
    # 剩余部分按音节拆分
    while len(rest) > 3:
        subwords.append("##" + rest[:3])
        rest = rest[3:]
    if rest:
        subwords.append("##" + rest if subwords else rest)
    
    return subwords if subwords else [word]

# 分析 NER 标签对齐问题
print("=== WordPiece 子词对齐 ===")
words = ["unhappiness", "restructuring", "preprocessing", "Beijing"]
ner_labels = ["B-MISC", "B-MISC", "B-MISC", "B-LOC"]

for word, label in zip(words, ner_labels):
    subwords = simulate_wordpiece_split(word)
    print(f"\\n  词: {word} → {subwords}")
    print(f"  首子词策略:")
    for i, sw in enumerate(subwords):
        if i == 0:
            print(f"    {sw:<20} → {label}")
        else:
            print(f"    {sw:<20} → X (忽略)")

# 统计子词膨胀率
all_words = ["The", "quick", "brown", "fox", "unhappiness", "restructuring",
             "preprocessing", "telecommunications", "internationalization"]
total_tokens = 0
total_words = len(all_words)
for w in all_words:
    sws = simulate_wordpiece_split(w)
    total_tokens += len(sws)
print(f"\\n  词数: {total_words} → Token数: {total_tokens} (膨胀率: {total_tokens/total_words:.1f}x)")`,
          },
        ],
        table: {
          headers: ["架构", "F1 (CoNLL-2003)", "参数量", "训练时间", "优势", "劣势"],
          rows: [
            ["BiLSTM-CRF (GloVe)", "~91%", "~5M", "~30min", "轻量，可解释", "需要特征工程"],
            ["BERT-base + Softmax", "~92.5%", "~110M", "~2h", "自动特征学习", "子词对齐问题"],
            ["BERT-base + CRF", "~93%", "~110M", "~2.5h", "结构化约束", "CRF 解码慢"],
            ["BERT-large + CRF", "~93.5%", "~340M", "~6h", "最强单模型", "显存要求高"],
            ["RoBERTa-large + CRF", "~94%", "~355M", "~6h", "预训练更充分", "计算资源密集"],
          ],
        },
        mermaid: `graph TD
    A["输入句子"] --> B["WordPiece 分词"]
    B --> C["BERT 编码"]
    C --> D["每个 token 的隐状态 h_i"]
    D --> E["分类头 / CRF 层"]
    E --> F["标签预测"]
    F --> G["首子词策略合并"]
    G --> H["实体提取"]
    class H s3
    class E s2
    class C s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#713f12
    classDef s3 fill:#581c87`,
        tip: "微调 BERT 做 NER 时，学习率很关键：BERT 主体用 2e-5 ~ 5e-5，分类头用 1e-3 ~ 1e-4。两者使用不同学习率（discriminative fine-tuning）通常比统一学习率高 0.5-1 个 F1 点。",
        warning: "BERT 的最大输入长度是 512 tokens。如果你的文档很长（如法律文档、医疗记录），实体可能跨 [SEP] 截断边界。解决方案：滑动窗口切分（overlap 50-100 tokens），或者用 Longformer/BigBird 等长文档模型。",
      },
      {
        title: "5. 嵌套实体与跨句实体识别",
        body: `现实世界中的 NER 远比 CoNLL-2003 这样的基准数据集复杂。嵌套实体（Nested Entities）和跨句实体（Cross-sentence Entities）是两个最常见的挑战。

嵌套实体： 一个实体的文本是另一个实体的一部分。例如：
- 「[北京大学]」→ ORG，但其中嵌套了「[北京]」→ LOC
- 「[美国[总统]特朗普]」→ 整体是 PERSON，「总统」是 TITLE，「美国」是 LOC
- 「[新冠[病毒]]」→ 整体是 DISEASE，嵌套「病毒」是 BIO_ENTITY

传统 BIO 标注无法处理嵌套，因为每个 token 只能有一个标签。解决方案包括：
1. 分层标注： 对每层嵌套实体独立做 BIO 标注，多层叠加。
2. 片段枚举（Span-based）： 枚举所有可能的 (start, end) 片段，对每个片段做分类。
3. 超图标注（Hypergraph）： 将 NER 建模为超图上的路径搜索问题。
4. 指针网络（Pointer Network）： 用两个指针分别指向实体的起点和终点。

跨句实体： 实体信息跨越句子边界。例如：「张三是一位著名科学家。他发现了 XYZ 蛋白质。」其中「他」指代「张三」，需要结合上下文才能识别。这本质上是一个共指消解（Coreference Resolution）+ NER 的联合任务。

解决方案： 使用文档级别的上下文编码（如 DocBERT），将多个句子一起输入模型，在跨句边界上做实体预测。或者先做单句 NER，再用共指消解合并跨句实体提及。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# Span-based NER: 枚举所有可能的实体片段
def span_based_ner(tokens, max_len=10):
    """基于片段枚举的 NER（支持嵌套）"""
    n = len(tokens)
    spans = []
    
    # 枚举所有可能的 (start, end) 片段
    for start in range(n):
        for end in range(start, min(start + max_len, n)):
            spans.append((start, end))
    
    return spans

def classify_span(tokens, start, end, model=None):
    """对单个片段做实体分类"""
    span_text = "".join(tokens[start:end + 1])
    # 模拟分类
    entity_types = ["PER", "LOC", "ORG", "MISC", "NEG"]
    
    # 实际中这里用 BERT 编码 span 并分类
    # 模拟: 用长度启发式
    np.random.seed(hash(span_text) % (232))
    probs = np.random.dirichlet([1, 1, 1, 1, 3])  # 偏向 NEG
    
    best_idx = np.argmax(probs)
    return entity_types[best_idx], probs

# 演示嵌套实体识别
print("=== Span-based 嵌套 NER ===")
tokens = ["北", "京", "大", "学", "的", "计", "算", "机", "科", "学", "系"]
spans = span_based_ner(tokens, max_len=5)

print(f"句子: {''.join(tokens)}")
print(f"总片段数: {len(spans)}\\n")

# 找出可能的实体
entities = []
for start, end in spans:
    entity_type, probs = classify_span(tokens, start, end)
    if entity_type != "NEG":
        text = "".join(tokens[start:end + 1])
        confidence = probs.max()
        entities.append((entity_type, start, end, text, confidence))
        print(f"  [{entity_type}] {text} (位置: {start}-{end}, 置信度: {confidence:.2f})")

# 检测嵌套
print("\\n嵌套关系:")
for i, (t1, s1, e1, text1, _) in enumerate(entities):
    for j, (t2, s2, e2, text2, _) in enumerate(entities):
        if i < j and s1 <= s2 and e2 <= e1 and (s1 != s2 or e1 != e2):
            print(f"  [{text1}] 嵌套包含 [{text2}]")`,
          },
          {
            lang: "python",
            code: `import numpy as np

# 文档级 NER: 跨句实体识别
class DocumentNER:
    """文档级 NER - 处理跨句实体"""
    
    def __init__(self, max_doc_len=512, sentence_overlap=50):
        self.max_doc_len = max_doc_len
        self.sentence_overlap = sentence_overlap
    
    def split_document(self, sentences):
        """将文档切分为可处理的片段（带重叠）"""
        chunks = []
        current_chunk = []
        current_len = 0
        
        for sent in sentences:
            sent_len = len(sent.split())
            if current_len + sent_len > self.max_doc_len:
                # 当前 chunk 已满，保存并添加重叠
                overlap_tokens = []
                for prev_sent in reversed(current_chunk):
                    tokens = prev_sent.split()
                    overlap_tokens = tokens[-self.sentence_overlap:] + overlap_tokens
                    if len(overlap_tokens) >= self.sentence_overlap:
                        break
                
                chunks.append({
                    "tokens": current_chunk,
                    "overlap": " ".join(overlap_tokens) if overlap_tokens else "",
                })
                current_chunk = [sent]
                current_len = sent_len
            else:
                current_chunk.append(sent)
                current_len += sent_len
        
        if current_chunk:
            chunks.append({"tokens": current_chunk, "overlap": ""})
        
        return chunks
    
    def merge_entities(self, chunk_entities):
        """合并各 chunk 的实体结果，去重"""
        all_entities = {}
        
        for chunk_idx, entities in enumerate(chunk_entities):
            for ent_type, start, end, text, conf in entities:
                # 全局位置索引
                global_key = (ent_type, start, end)
                if global_key not in all_entities:
                    all_entities[global_key] = []
                all_entities[global_key].append((text, conf, chunk_idx))
        
        # 合并: 同一实体取最高置信度
        merged = []
        for (ent_type, start, end), mentions in all_entities.items():
            best_mention = max(mentions, key=lambda x: x[1])
            text, conf, _ = best_mention
            merged.append((ent_type, start, end, text, conf))
        
        return merged

# 演示
doc_ner = DocumentNER(max_doc_len=100, sentence_overlap=20)
sentences = [
    "张三毕业于北京大学计算机科学系。",
    "他在该校攻读博士学位期间发表了多篇论文。",
    "毕业后，他加入了微软亚洲研究院。",
    "张三目前主要从事自然语言处理研究。",
]

chunks = doc_ner.split_document(sentences)
print("=== 文档级 NER: 跨句实体 ===")
for i, chunk in enumerate(chunks):
    print(f"\\n  Chunk {i}:")
    print(f"    句子: {chunk['tokens']}")
    if chunk['overlap']:
        print(f"    重叠: {chunk['overlap'][:30]}...")

print("\\n  跨句实体合并:")
print("  '张三' 在句子 1 和句子 4 中都出现")
print("  '他'(句子 2) 指代 '张三' → 需要共指消解")
print("  '该校'(句子 2) 指代 '北京大学' → 需要共指消解")`,
          },
        ],
        table: {
          headers: ["方法", "嵌套支持", "跨句支持", "复杂度", "典型 F1 下降"],
          rows: [
            ["BIO (单层)", "❌", "❌", "O(T·K)", "基准"],
            ["分层 BIO", "✅ 有限", "❌", "O(T·K·L)", "-1~2%"],
            ["Span-based", "✅ 完全", "❌", "O(T²·K)", "-0.5~1%"],
            ["Pointer Network", "✅ 完全", "❌", "O(T²)", "-0.5%"],
            ["Doc-level + Coref", "✅", "✅", "O(D²)", "-2~5%"],
            ["全局指针 (GlobalPointer)", "✅ 完全", "❌", "O(T²·K)", "与 Span 相当"],
          ],
        },
        mermaid: `graph TD
    A["文档输入"] --> B["句子切分"]
    B --> C["滑动窗口分块"]
    C --> D1["Chunk 1: 句1+句2"]
    C --> D2["Chunk 2: 句2+句3 (重叠)"]
    C --> D3["Chunk 3: 句3+句4 (重叠)"]
    D1 --> E["各 Chunk NER"]
    D2 --> E
    D3 --> E
    E --> F["实体合并 + 去重"]
    F --> G["共指消解"]
    G --> H["文档级实体图"]
    class H s3
    class F s2
    class C s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87`,
        tip: "嵌套实体推荐使用 Span-based 方法。虽然复杂度是 O(T²)，但可以用 max_len 截断长片段（实体通常不超过 10 个 token），实际复杂度约 O(T·max_len)。",
        warning: "跨句实体需要共指消解的配合。如果没有共指消解模型，一个简单的启发式规则是：同一文档中相同实体名称的多次提及合并为同一实体，取第一次出现的类型和位置。",
      },
      {
        title: "6. 评估指标：精确率、召回率与 F1",
        body: `NER 的评估比简单的 token 级别准确率复杂得多。因为 NER 的输出是实体片段（span），评估必须在实体级别进行——token 级别的高准确率可能掩盖完全错误的实体边界。

实体级别评估（Entity-level Evaluation）：
- 精确率（Precision）： 模型预测为实体的片段中，有多少是真正正确的实体。P = TP / (TP + FP)
- 召回率（Recall）： 真实存在的实体中，有多少被模型正确识别。R = TP / (TP + FN)
- F1 值： P 和 R 的调和平均。F1 = 2 × P × R / (P + R)

严格匹配（Exact Match）vs 宽松匹配（Partial Match）：
- 严格匹配要求实体的类型和边界完全正确。
- 宽松匹配允许部分重叠（如预测「北京」而真实是「北京市」，算部分正确）。
- 实际研究中通常报告严格匹配的 F1，但宽松匹配有助于诊断边界错误。

混淆矩阵分析： 除了总体 F1，还应分析各类别的 F1 和类别间的混淆情况。例如，模型可能将「苹果」误分类为 ORG（苹果公司）而非 FRUIT，这反映了上下文歧义的处理能力。

交叉验证**： 小数据集上，使用 K 折交叉验证获得更可靠的性能估计。NER 数据集通常存在领域偏差，交叉验证可以评估模型的泛化能力。`,
        code: [
          {
            lang: "python",
            code: `from collections import defaultdict

class NEREvaluator:
    """NER 实体级评估器"""
    
    def __init__(self):
        self.tp = 0
        self.fp = 0
        self.fn = 0
        self.per_type = defaultdict(lambda: {"tp": 0, "fp": 0, "fn": 0})
        self.confusion = defaultdict(lambda: defaultdict(int))
    
    def evaluate(self, gold_entities, pred_entities):
        """评估一组实体的精确率/召回率/F1
        实体格式: (type, start, end) 集合
        """
        gold_set = set(gold_entities)
        pred_set = set(pred_entities)
        
        # 严格匹配
        correct = gold_set & pred_set
        self.tp += len(correct)
        self.fp += len(pred_set - gold_set)
        self.fn += len(gold_set - pred_set)
        
        # 按类型统计
        for ent_type in set(e[0] for e in gold_entities) | set(e[0] for e in pred_entities):
            gold_type = {e for e in gold_entities if e[0] == ent_type}
            pred_type = {e for e in pred_entities if e[0] == ent_type}
            self.per_type[ent_type]["tp"] += len(gold_type & pred_type)
            self.per_type[ent_type]["fp"] += len(pred_type - gold_type)
            self.per_type[ent_type]["fn"] += len(gold_type - pred_type)
        
        # 混淆矩阵
        for pred_ent in pred_entities:
            if pred_ent not in gold_set:
                # 预测错误: 找最相似的真实实体
                best_gold = self._find_best_overlap(pred_ent, gold_entities)
                if best_gold and best_gold[0] != pred_ent[0]:
                    self.confusion[best_gold[0]][pred_ent[0]] += 1
    
    def _find_best_overlap(self, pred, gold_entities):
        """找与预测实体重叠最大的真实实体"""
        best = None
        best_overlap = 0
        for g in gold_entities:
            overlap_start = max(pred[1], g[1])
            overlap_end = min(pred[2], g[2])
            overlap = max(0, overlap_end - overlap_start + 1)
            if overlap > best_overlap:
                best_overlap = overlap
                best = g
        return best
    
    def metrics(self):
        """计算所有指标"""
        def f1(tp, fp, fn):
            p = tp / (tp + fp) if (tp + fp) > 0 else 0
            r = tp / (tp + fn) if (tp + fn) > 0 else 0
            f = 2 * p * r / (p + r) if (p + r) > 0 else 0
            return p, r, f
        
        overall_p, overall_r, overall_f1 = f1(self.tp, self.fp, self.fn)
        
        per_type_metrics = {}
        for ent_type, counts in self.per_type.items():
            p, r, f = f1(counts["tp"], counts["fp"], counts["fn"])
            per_type_metrics[ent_type] = {"P": p, "R": r, "F1": f}
        
        return {
            "overall": {"P": overall_p, "R": overall_r, "F1": overall_f1},
            "per_type": per_type_metrics,
            "confusion": dict(self.confusion),
        }

# 演示评估
evaluator = NEREvaluator()
gold = [
    ("PER", 0, 1), ("LOC", 3, 4), ("ORG", 7, 10),
]
pred = [
    ("PER", 0, 1), ("LOC", 3, 5), ("ORG", 7, 9), ("MISC", 12, 13),
]

evaluator.evaluate(gold, pred)
metrics = evaluator.metrics()

print("=== NER 评估结果 ===")
print(f"总体: P={metrics['overall']['P']:.3f}, R={metrics['overall']['R']:.3f}, F1={metrics['overall']['F1']:.3f}")
print(f"  TP={evaluator.tp}, FP={evaluator.fp}, FN={evaluator.fn}")
print("\\n按类别:")
for t, m in metrics["per_type"].items():
    print(f"  {t}: P={m['P']:.3f}, R={m['R']:.3f}, F1={m['F1']:.3f}")`,
          },
          {
            lang: "python",
            code: `import numpy as np
from collections import defaultdict

# 严格匹配 vs 宽松匹配 vs Token 级评估对比
def compare_evaluation_methods(gold_entities, pred_entities, seq_len, gold_labels, pred_labels):
    """对比三种评估方式"""
    gold_set = set(gold_entities)
    pred_set = set(pred_entities)
    
    # 1. 严格匹配 (Exact Match)
    exact_tp = len(gold_set & pred_set)
    exact_fp = len(pred_set - gold_set)
    exact_fn = len(gold_set - pred_set)
    
    # 2. 宽松匹配 (Partial Match) - 只要有重叠就算 TP
    partial_tp = 0
    for p in pred_set:
        for g in gold_set:
            if p[0] == g[0]:  # 类型相同
                # 检查是否有重叠
                if max(p[1], g[1]) <= min(p[2], g[2]):
                    partial_tp += 1
                    break
    partial_fp = len(pred_set) - partial_tp
    partial_fn = len(gold_set) - partial_tp
    
    # 3. Token 级别评估
    correct_tokens = sum(1 for g, p in zip(gold_labels, pred_labels) if g == p)
    token_acc = correct_tokens / seq_len if seq_len > 0 else 0
    
    def f1(tp, fp, fn):
        p = tp / (tp + fp) if (tp + fp) > 0 else 0
        r = tp / (tp + fn) if (tp + fn) > 0 else 0
        f = 2 * p * r / (p + r) if (p + r) > 0 else 0
        return p, r, f
    
    ep, er, ef = f1(exact_tp, exact_fp, exact_fn)
    pp, pr, pf = f1(partial_tp, partial_fp, partial_fn)
    
    print("=== 三种评估方式对比 ===")
    print(f"{'评估方式':<15} {'精确率':>8} {'召回率':>8} {'F1':>8}")
    print("-" * 45)
    print(f"{'严格匹配':<12} {ep:>8.3f} {er:>8.3f} {ef:>8.3f}")
    print(f"{'宽松匹配':<12} {pp:>8.3f} {pr:>8.3f} {pf:>8.3f}")
    print(f"{'Token准确率':<11} {'':>8} {'':>8} {token_acc:>8.3f}")

# 模拟示例
gold_ents = [("PER", 0, 1), ("LOC", 4, 7)]
pred_ents = [("PER", 0, 1), ("LOC", 4, 6)]  # 边界差 1 个 token
gold_labels = ["B-PER", "I-PER", "O", "O", "B-LOC", "I-LOC", "I-LOC", "I-LOC", "O", "O"]
pred_labels = ["B-PER", "I-PER", "O", "O", "B-LOC", "I-LOC", "I-LOC", "O", "O", "O"]

compare_evaluation_methods(gold_ents, pred_ents, 10, gold_labels, pred_labels)
print("\\n分析:")
print("  宽松匹配 F1 高于严格匹配 → 边界有轻微偏差但实体基本正确")
print("  Token 准确率很高 → 但掩盖了实体边界错误")
print("  结论: 必须看严格匹配的 F1!")`,
          },
        ],
        table: {
          headers: ["评估方式", "匹配标准", "P 含义", "R 含义", "适用场景"],
          rows: [
            ["严格匹配", "类型+边界完全一致", "预测实体正确的比例", "真实实体被完全找到的比例", "标准报告指标"],
            ["宽松匹配", "类型相同且有重叠", "预测实体部分正确的比例", "真实实体被部分找到的比例", "诊断边界错误"],
            ["Token 级", "每 token 标签一致", "所有 token 中正确的比例", "等价于准确率", "快速检查"],
            ["Type-only", "只看类型不看边界", "预测类型正确的比例", "真实类型被找到的比例", "分类能力评估"],
            ["Partial-CRF1", "重叠部分加权计算", "重叠加权的精确率", "重叠加权的召回率", "细粒度分析"],
          ],
        },
        mermaid: `graph TD
    A["预测实体集合"] --> B{"与真实实体比较"}
    B -->|"完全一致"| C["True Positive"]
    B -->|"预测了不存在的实体"| D["False Positive"]
    B -->|"漏掉了真实实体"| E["False Negative"]
    C --> F["Precision = TP / (TP+FP)"]
    C --> G["Recall = TP / (TP+FN)"]
    F --> H["F1 = 2PR / (P+R)"]
    G --> H
    class H s3
    class E s2
    class D s1
    class C s0
    classDef s0 fill:#14532d
    classDef s1 fill:#7f1d1d
    classDef s2 fill:#713f12
    classDef s3 fill:#581c87`,
        tip: "汇报 NER 结果时，除了总体 F1，一定要报告每个类别的 F1。有些模型总体 F1 很高，但对罕见类别（如 PRODUCT、LAW）的召回率几乎为零。如果你的应用场景需要识别特定类别，只看总体 F1 会严重误导。",
        warning: "评估时最常见的错误：(1) 将 token 级准确率当 F1 报——token 级 95% 准确率在 NER 中可能对应 F1 < 70%；(2) 评估集包含训练集中的实体（数据泄露）；(3) 没有区分严格匹配和宽松匹配——宽松匹配 F1 通常比严格匹配高 3-8 个百分点。",
      },
      {
        title: "7. spaCy 与 HuggingFace 实战：从零构建 NER Pipeline",
        body: `理论学完后，让我们用两个最主流的工具构建完整的 NER 系统：spaCy（工业级 NLP 库）和 HuggingFace Transformers（预训练模型生态）。

spaCy 方案： 适合快速部署和生产环境。spaCy 内置了统计 NER 模型（基于 CNN + 残差连接），训练速度快，API 简洁。自定义 NER 只需提供标注数据，spaCy 自动处理训练循环、早停和模型序列化。

HuggingFace 方案： 适合追求最高精度。使用预训练 Transformer 模型（BERT、RoBERTa、DeBERTa 等），在特定领域数据上微调。 Transformers 提供了 Trainer API，一行代码启动分布式训练。

方案选择：
- 快速原型/生产部署 → spaCy
- 最高精度/学术研究 → HuggingFace
- 资源受限（CPU 推理） → spaCy 小模型
- 多语言支持 → HuggingFace XLM-RoBERTa

生产部署要点： 无论用哪种方案，都需要考虑：批量推理（batching）、模型缓存、热更新、A/B 测试、监控和回滚。spaCy 的 package 和 HuggingFace 的 ONNX 导出都支持高效部署。`,
        code: [
          {
            lang: "python",
            code: `# spaCy NER: 训练自定义 NER 模型
import spacy
from spacy.training import Example
import random

def train_spacy_ner(train_data, model_name="zh_core_web_sm", n_iter=20):
    """用 spaCy 训练自定义 NER 模型"""
    # 加载预训练模型
    try:
        nlp = spacy.load(model_name)
    except OSError:
        nlp = spacy.blank("zh")
    
    # 创建或更新 NER pipeline
    if "ner" not in nlp.pipe_names:
        ner = nlp.add_pipe("ner")
    else:
        ner = nlp.get_pipe("ner")
    
    # 添加实体标签
    for _, annotations in train_data:
        for ent in annotations.get("entities", []):
            ner.add_label(ent[2])
    
    # 训练
    optimizer = nlp.begin_training()
    
    for i in range(n_iter):
        random.shuffle(train_data)
        losses = {}
        
        for text, annotations in train_data:
            doc = nlp.make_doc(text)
            example = Example.from_dict(doc, annotations)
            nlp.update([example], drop=0.5, losses=losses)
        
        if i % 5 == 0:
            print(f"  Iteration {i:3d} | Loss: {losses.get('ner', 0):.4f}")
    
    return nlp

# 训练数据
TRAIN_DATA = [
    ("张三在北京大学工作", {"entities": [(0, 2, "PER"), (3, 7, "ORG")]}),
    ("李明是上海人", {"entities": [(0, 2, "PER"), (4, 6, "LOC")]}),
    ("腾讯总部在深圳", {"entities": [(0, 2, "ORG"), (5, 7, "LOC")]}),
    ("王五毕业于清华大学", {"entities": [(0, 2, "PER"), (5, 9, "ORG")]}),
    ("阿里巴巴在杭州", {"entities": [(0, 4, "ORG"), (5, 7, "LOC")]}),
]

print("=== spaCy NER 训练 ===")
print("（模拟输出，需要安装 spacy 和中文模型）")
for i in range(0, 20, 5):
    loss = max(0, 50 - i * 8 + random.uniform(-2, 2))
    print(f"  Iteration {i:3d} | Loss: {loss:.4f}")

print("\\n模型保存与加载:")
print("  nlp.to_disk('./ner_model')")
print("  nlp = spacy.load('./ner_model')")
print("  doc = nlp('新句子')")
print("  for ent in doc.ents:")
print("      print(ent.text, ent.label_)")`,
          },
          {
            lang: "python",
            code: `# HuggingFace Transformers: 微调 BERT 做 NER
from transformers import (
    AutoTokenizer, AutoModelForTokenClassification,
    TrainingArguments, Trainer, DataCollatorForTokenClassification
)
import numpy as np

# 1. 准备数据
def prepare_ner_dataset(tokenized_texts, tokenized_labels, label_list):
    """将文本和标签转换为 HuggingFace Dataset"""
    label2id = {label: i for i, label in enumerate(label_list)}
    id2label = {i: label for label, i in label2id.items()}
    
    # 对齐标签到 token 级别
    def align_labels(words, labels, tokens, tokenizer):
        word_ids = tokens.word_ids()
        aligned_labels = []
        previous_word_idx = None
        
        for word_idx in word_ids:
            if word_idx is None:
                aligned_labels.append(-100)  # 忽略 [CLS], [SEP]
            elif word_idx != previous_word_idx:
                aligned_labels.append(label2id[labels[word_idx]])
            else:
                # 同一词的后续子词: 继承前一个子词的标签
                aligned_labels.append(label2id[labels[word_idx]])
            previous_word_idx = word_idx
        
        return aligned_labels
    
    # 示例数据
    texts = ["张三在北京大学工作", "李明是上海人"]
    words_list = [list(t) for t in texts]
    labels_list = [
        ["B-PER", "I-PER", "O", "B-ORG", "I-ORG", "I-ORG", "I-ORG", "O", "O"],
        ["B-PER", "I-PER", "O", "B-LOC", "I-LOC", "O"],
    ]
    label_list = ["O", "B-PER", "I-PER", "B-ORG", "I-ORG", "B-LOC", "I-LOC"]
    
    tokenizer = AutoTokenizer.from_pretrained("bert-base-chinese")
    encodings = tokenizer(texts, truncation=True, padding=True, is_split_into_words=False)
    
    # 简化的标签对齐（中文字符级）
    all_labels = []
    for encoding, labels in zip(encodings.encodings, labels_list):
        # 添加 -100 给 [CLS] 和 [SEP]
        aligned = [-100] + [label2id.get(l, 0) for l in labels] + [-100]
        all_labels.append(aligned)
    
    encodings["labels"] = all_labels
    
    return encodings, label2id, id2label

# 2. 训练配置
print("=== HuggingFace NER 微调 ===")
print("训练参数:")
print("  model: bert-base-chinese")
print("  learning_rate: 2e-5")
print("  per_device_train_batch_size: 16")
print("  num_train_epochs: 3")
print("  weight_decay: 0.01")
print("  warmup_ratio: 0.1")
print("\\n代码流程:")
print("  tokenizer = AutoTokenizer.from_pretrained('bert-base-chinese')")
print("  model = AutoModelForTokenClassification.from_pretrained(")
print("      'bert-base-chinese', num_labels=7, id2label=id2label")
print("  )")
print("  trainer = Trainer(")
print("      model=model, args=training_args,")
print("      train_dataset=train_dataset,")
print("      data_collator=data_collator")
print("  )")
print("  trainer.train()")`,
          },
        ],
        table: {
          headers: ["特性", "spaCy", "HuggingFace Transformers", "Stanford NER"],
          rows: [
            ["模型架构", "CNN + 残差", "Transformer (BERT/RoBERTa)", "CRF / LSTM"],
            ["训练速度", "快 (分钟级)", "慢 (小时级)", "中等"],
            ["推理速度", "快 (CPU 友好)", "慢 (推荐 GPU)", "中等"],
            ["自定义训练", "简单 (几行代码)", "中等 (需理解 Trainer)", "复杂"],
            ["预训练模型", "内置 (14 种语言)", "50,000+ 模型", "有限"],
            ["生产部署", "优秀 (打包 + serving)", "良好 (ONNX + TensorRT)", "一般"],
            ["社区活跃度", "高", "极高", "中等"],
          ],
        },
        mermaid: `graph TD
    A["标注数据"] --> B{选择框架}
    B -->|"快速部署"| C["spaCy"]
    B -->|"最高精度"| D["HuggingFace"]
    C --> E["spacy train"]
    D --> F["Trainer.train"]
    E --> G["spaCy 模型包"]
    F --> H["PyTorch 模型"]
    G --> I["生产推理"]
    H --> I
    I --> J["监控 + A/B 测试"]
    J --> K["模型迭代"]
    K --> A
    class J s3
    class I s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87`,
        tip: "生产环境推荐 spaCy + HuggingFace 混合方案：用 HuggingFace 训练高精度模型，导出为 ONNX 格式后用 spaCy 的 pipeline 加载。这样既享受了 Transformer 的精度，又获得了 spaCy 的推理速度和工程便利。",
        warning: "标注数据的质量直接决定 NER 模型的上限。一个常见的错误是用自动标注（规则匹配或弱监督）生成大量训练数据，但标注噪声会严重损害模型性能。宁可要 1000 条人工精标数据，不要 10 万条自动标注数据。",
      },
    ],
};
