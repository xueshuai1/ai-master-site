import { Article } from '../knowledge';

export const article: Article = {
    id: "nlp-005",
    title: "文本摘要：抽取式与生成式",
    category: "nlp",
    tags: ["文本摘要", "生成式", "NLP"],
    summary: "从 TextRank 到 BART，掌握自动文本摘要的两种范式",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
      {
        title: "1. 摘要任务定义与评估指标",
        body: `文本摘要（Text Summarization）是 NLP 的核心任务之一：给定一篇或多篇源文档，生成一段简洁的摘要，保留原文的核心信息。根据生成方式，摘要分为两大范式：

抽取式摘要（Extractive Summarization） 从原文中挑选最重要的句子或片段，直接拼接成摘要。优点是保证语法正确性和事实忠实性；缺点是缺乏信息压缩和改写能力，摘要可能不够连贯。

生成式摘要（Abstractive Summarization） 理解原文后，用全新的语言重新表达核心内容。类似于人类阅读后「用自己的话概括」。优点是可以压缩信息、改写句式、融合多源信息；缺点是可能产生幻觉（hallucination）或事实错误。

评估指标 ROUGE（Recall-Oriented Understudy for Gisting Evaluation） 由 Lin（2004）提出，通过计算生成摘要与参考摘要之间的 n-gram 重叠来衡量质量：
- ROUGE-N：n-gram 召回率、精确率和 F1 值
- ROUGE-L：基于最长公共子序列（LCS），捕捉句子级结构匹配
- ROUGE-SU：跳过式 bigram，允许中间有间隔

**ROUGE 的局限**：只衡量表面重叠，不评估语义等价性。两个语义相同但用词不同的摘要，ROUGE 得分可能很低。因此需要结合人工评估或基于嵌入的语义相似度指标（如 BERTScore）。`,
        code: [
          {
            lang: "python",
            code: `# ROUGE 评估计算
from rouge_score import rouge_scorer

# 参考摘要（人工编写）
reference = "苹果公司发布了新一代 iPhone，搭载 A17 芯片，性能提升 20%，售价 799 美元起"

# 生成摘要 A（抽取式）
candidate_a = "苹果公司发布了新一代 iPhone 搭载 A17 芯片 性能提升 20%"

# 生成摘要 B（生成式，语义相同但表达不同）
candidate_b = "iPhone 15 系列正式亮相，新处理器性能大幅增强，起售价 799 刀"

scorer = rouge_scorer.RougeScorer(
    ["rouge1", "rouge2", "rougeL"],
    use_stemmer=False
)

for name, cand in [("抽取式 A", candidate_a), ("生成式 B", candidate_b)]:
    scores = scorer.score(reference, cand)
    print(f"=== {name} ===")
    for metric, result in scores.items():
        print(f"  {metric:>10}: P={result.precision:.4f} "
              f"R={result.recall:.4f} F1={result.fmeasure:.4f}")`,
          },
          {
            lang: "python",
            code: `# BERTScore：基于语义相似度的评估
from bert_score import score as bert_score

references = [
    "苹果公司发布了新一代 iPhone，搭载 A17 芯片，性能提升 20%，售价 799 美元起",
]
candidates = [
    "iPhone 15 系列正式亮相，新处理器性能大幅增强，起售价 799 刀",
]

# BERTScore 使用预训练 BERT 的上下文嵌入计算余弦相似度
P, R, F1 = bert_score(candidates, references, lang="zh", verbose=True)

print(f"=== BERTScore ===")
print(f"  Precision: {P.mean().item():.4f}")
print(f"  Recall:    {R.mean().item():.4f}")
print(f"  F1:        {F1.mean().item():.4f}")

# 对比 ROUGE 与 BERTScore
# ROUGE: 基于词重叠 → 对同义词替换不敏感
# BERTScore: 基于语义嵌入 → 能捕捉语义等价性
print("\\nROUGE vs BERTScore:")
print("  ROUGE 看「词是否相同」")
print("  BERTScore 看「意思是否相同」")
print("  生成式摘要推荐使用 BERTScore 补充评估")`,
          },
        ],
        table: {
          headers: ["指标", "计算方式", "捕捉能力", "局限性"],
          rows: [
            ["ROUGE-1", "Unigram 重叠", "关键词覆盖", "忽略词序和语义"],
            ["ROUGE-2", "Bigram 重叠", "短语匹配", "对改写极度敏感"],
            ["ROUGE-L", "最长公共子序列", "句子级结构", "不评估语义等价"],
            ["ROUGE-SU", "跳过式 bigram", "灵活短语匹配", "计算开销较大"],
            ["BERTScore", "上下文嵌入余弦", "语义相似性", "依赖预训练模型质量"],
          ],
        },
        mermaid: `graph TD
    A["源文档"] --> B{"摘要类型?"}
    B -->|"抽取式"| C["挑选重要句子"]
    B -->|"生成式"| D["理解并重新表达"]
    C --> E["拼接成摘要"]
    D --> F["生成新文本"]
    E --> G{"评估"}
    F --> G
    G --> H["ROUGE-N/L/SU"]
    G --> I["BERTScore"]
    G --> J["人工评估"]`,
        tip: "评估生成式摘要时，不要只看 ROUGE。生成式摘要经常用同义词替换或句式变换，ROUGE 会低估其质量。推荐同时报告 ROUGE-L 和 BERTScore F1，二者互补。",
        warning: "ROUGE 对摘要长度非常敏感——过长的摘要（几乎复制原文）可能获得很高的 ROUGE 分数，但这不是好摘要。实际评估时应先对生成摘要做长度归一化，或使用压缩率惩罚项。",
      },
      {
        title: "2. 抽取式方法：TextRank、Lead-k 与聚类",
        body: `抽取式摘要是最早的自动摘要方法，核心假设是：原文中最重要的句子直接包含摘要所需的信息。

Lead-k 基线 最简单的抽取式方法：直接取文章的前 k 个句子作为摘要。这听起来很朴素，但在新闻类文本上效果惊人——新闻写作通常遵循「倒金字塔」结构，最重要的信息放在开头。Lead-3 在 CNN/DailyMail 数据集上的 ROUGE-L 甚至超过了早期的复杂模型。

TextRank 算法 由 Mihalcea（2004）提出，灵感来自 PageRank。将每个句子视为图中的一个节点，句子之间的相似度（通常用词重叠的余弦相似度）作为边的权重。然后通过迭代计算每个句子的 PageRank 分数，排名最高的句子被选入摘要。

TextRank 的核心公式：S(V_i) = (1-d) + d × Σ_{V_j ∈ In(V_i)} [w_{ji} / Σ_{V_k ∈ Out(V_j)} w_{jk}] × S(V_j)
其中 d 是阻尼系数（通常 0.85），w_{ji} 是句子 j 到句子 i 的相似度权重。

聚类方法 将句子聚类后，从每个簇中挑选代表性句子。常用 K-means 或层次聚类，确保摘要覆盖原文的多个主题方面，而不是只集中在某一个话题上。这种方法特别适合多文档摘要。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import networkx as nx
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def textrank_summarize(text, num_sentences=3):
    """TextRank 抽取式摘要实现"""
    # 分句
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 10]
    if len(sentences) <= num_sentences:
        return text

    # 构建 TF-IDF 矩阵
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(sentences)

    # 计算句子相似度矩阵
    sim_matrix = cosine_similarity(tfidf_matrix)

    # 构建图
    G = nx.Graph()
    for i in range(len(sentences)):
        G.add_node(i)
        for j in range(i + 1, len(sentences)):
            if sim_matrix[i, j] > 0.1:  # 阈值过滤
                G.add_edge(i, j, weight=sim_matrix[i, j])

    # PageRank
    scores = nx.pagerank(G, weight='weight')

    # 选择得分最高的句子
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_indices = sorted([idx for idx, _ in ranked[:num_sentences]])

    summary = '. '.join(sentences[i] for i in top_indices)
    return summary

# 测试
sample_text = (
    "人工智能正在改变各行各业. "
    "在医疗领域, AI 已经能够辅助诊断疾病. "
    "深度学习模型在影像识别上达到专家水平. "
    "自然语言处理技术也取得了巨大进步. "
    "大语言模型能够理解和生成人类语言. "
    "这些技术的进步得益于计算能力的提升. "
    "GPU 和 TPU 的广泛应用使训练大规模模型成为可能. "
    "但 AI 也带来了伦理和隐私问题."
)
result = textrank_summarize(sample_text, num_sentences=3)
print(f"摘要: {result}")`,
          },
          {
            lang: "python",
            code: `# Lead-k vs TextRank vs 聚类方法对比
import numpy as np
from sklearn.cluster import KMeans

def lead_k(text, k=3):
    """Lead-k 基线"""
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 10]
    return '. '.join(sentences[:k])

def cluster_summarize(text, num_clusters=3):
    """聚类抽取式摘要"""
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 10]
    if len(sentences) <= num_clusters:
        return text

    # TF-IDF 向量化
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(sentences)

    # K-means 聚类
    kmeans = KMeans(n_clusters=min(num_clusters, len(sentences)), random_state=42)
    kmeans.fit(tfidf_matrix)

    # 从每个簇中选最靠近中心点的句子
    summary_sentences = []
    for cluster_id in range(kmeans.n_clusters):
        cluster_indices = np.where(kmeans.labels_ == cluster_id)[0]
        center = kmeans.cluster_centers_[cluster_id]
        cluster_vectors = tfidf_matrix[cluster_indices]
        distances = np.array([
            np.linalg.norm(cluster_vectors[i].toarray() - center)
            for i in range(len(cluster_indices))
        ])
        best_idx = cluster_indices[np.argmin(distances)]
        summary_sentences.append(sentences[best_idx])

    # 按原文顺序排列
    ordered = sorted(
        [(sentences.index(s), s) for s in summary_sentences if s in sentences],
        key=lambda x: x[0]
    )
    return '. '.join(s for _, s in ordered)

# 对比
sample = (
    "气候变化的影响日益严重. "
    "全球平均温度在过去百年上升了 1.1 摄氏度. "
    "极端天气事件频率增加. "
    "海平面上升威胁沿海城市. "
    "冰川融化导致淡水资源减少. "
    "各国正在采取措施减少碳排放. "
    "可再生能源投资持续增长. "
    "但进展仍然不够快."
)
print("Lead-3:", lead_k(sample, 3))
print("聚类:", cluster_summarize(sample, 3))`,
          },
        ],
        table: {
          headers: ["方法", "原理", "优点", "缺点", "适用场景"],
          rows: [
            ["Lead-k", "取前 k 句", "极简、快速", "依赖倒金字塔结构", "新闻摘要"],
            ["TextRank", "PageRank 图排序", "无需训练数据", "忽略句子位置信息", "单文档摘要"],
            ["TF-IDF 排序", "关键词覆盖度", "实现简单", "忽略句子间关系", "快速原型"],
            ["K-means 聚类", "主题覆盖最大化", "保证多样性", "需指定簇数量", "多文档摘要"],
            ["层次聚类", "树状句子分组", "不需预设簇数", "计算复杂度高", "长文档"],
          ],
        },
        mermaid: `graph TD
    A["源文档"] --> B["分句"]
    B --> C{"选择策略?"}
    C -->|"Lead-k"| D["取前 k 句"]
    C -->|"TextRank"| E["构建句子图"]
    C -->|"聚类"| F["句子聚类"]
    E --> G["PageRank 排序"]
    F --> H["每簇选代表句"]
    D --> I["摘要"]
    G --> I
    H --> I
    class H s2
    class G s1
    class D s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#713f12`,
        tip: "在新闻摘要任务中，Lead-3 是一个极强的基线。任何新模型都应该先和 Lead-3 比较——如果超不过它，说明模型还没有真正学到摘要能力，只是在拟合位置偏好。",
        warning: "TextRank 的计算复杂度为 O(n²)（n 为句子数），长文档（>500 句）会很慢。此时可以用 Maximal Marginal Relevance（MMR）代替，它在保证信息量的同时控制冗余。",
      },
      {
        title: "3. 生成式方法：Seq2Seq + Attention",
        body: `生成式摘要的本质是序列到序列（Seq2Seq）的翻译任务：将「长文本」翻译为「短文本」。

经典 Seq2Seq 架构 由编码器（Encoder）和解码器（Decoder）组成。编码器读取源文本的每个词，将其编码为一个固定长度的上下文向量 c；解码器以 c 为条件，逐步生成摘要的每个词。

****核心问题****：固定长度的上下文向量 c 是信息瓶颈。当源文本很长时（如 1000 个词），编码器必须将所有信息压缩到一个固定维度的向量中，这必然导致信息损失。

注意力机制（Attention） 由 Bahdanau（2015）提出，打破了固定长度瓶颈。在解码的每一步 t，解码器不是只看单一的上下文向量 c，而是动态计算源文本每个位置的注意力权重 α_{t,i}，得到一个与当前解码步相关的上下文向量 c_t = Σ α_{t,i} h_i，其中 h_i 是编码器第 i 个位置的隐藏状态。

**注意力的直观理解**：生成摘要的第 t 个词时，模型应该「关注」源文本中最相关的部分。例如生成摘要中的「苹果」时，注意力应集中在原文提到「苹果」的句子；生成「iPhone」时，注意力应转移到描述产品的段落。

Copy 机制 由 See 等人（2017）在 Pointer-Generator 网络中提出：对于专有名词（人名、地名、品牌名），模型可以选择直接从源文本复制，而不是从词汇表中生成。这显著改善了生成式摘要中命名实体缺失的问题。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class AttentionSeq2Seq(nn.Module):
    """带注意力机制的 Seq2Seq 摘要模型"""
    
    def __init__(self, vocab_size, embed_dim, hidden_dim):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.encoder = nn.LSTM(embed_dim, hidden_dim, bidirectional=True,
                               batch_first=True)
        # 注意力: 计算 decoder hidden 与每个 encoder hidden 的相关性
        self.attn = nn.Linear(hidden_dim * 4, hidden_dim * 2)
        self.attn_combine = nn.Linear(hidden_dim * 4, hidden_dim * 2)
        self.decoder = nn.LSTM(embed_dim + hidden_dim * 2, hidden_dim,
                               batch_first=True)
        self.fc_out = nn.Linear(hidden_dim * 3, vocab_size)
    
    def forward(self, src, tgt):
        """src: (batch, src_len), tgt: (batch, tgt_len)"""
        # 编码
        src_emb = self.embedding(src)  # (batch, src_len, embed)
        enc_outputs, (enc_h, enc_c) = self.encoder(src_emb)
        # enc_outputs: (batch, src_len, hidden*2)
        
        # 解码
        batch_size = src.size(0)
        tgt_len = tgt.size(1)
        hidden = (enc_h[0:1] + enc_h[1:2], enc_c[0:1] + enc_c[1:2])
        dec_input = self.embedding(tgt[:, 0])  # 第一个词
        
        outputs = []
        for t in range(tgt_len):
            # 注意力计算
            attn_weights = self._calc_attn(hidden[0], enc_outputs)
            context = torch.bmm(attn_weights.unsqueeze(1), enc_outputs)
            
            # 拼接 decoder 输入
            dec_input = torch.cat([dec_input, context.squeeze(1)], dim=1)
            dec_output, hidden = self.decoder(dec_input.unsqueeze(1), hidden)
            
            # 输出预测
            out = torch.cat([dec_output.squeeze(1), context.squeeze(1),
                             dec_input[:, :hidden[0].size(1)]], dim=1)
            pred = self.fc_out(out)
            outputs.append(pred)
            
            # 教师强制：使用真实 tgt 作为下一步输入
            dec_input = self.embedding(tgt[:, t]) if t < tgt_len - 1 else None
        
        return torch.stack(outputs, dim=1)  # (batch, tgt_len, vocab)
    
    def _calc_attn(self, hidden, enc_outputs):
        """Bahdanau 注意力"""
        # hidden: (batch, 1, hidden*2), enc_outputs: (batch, src_len, hidden*2)
        batch, src_len, _ = enc_outputs.size()
        hidden_exp = hidden.expand(-1, src_len, -1)
        energy = torch.tanh(self.attn(
            torch.cat([hidden_exp, enc_outputs], dim=2)
        ))
        energy = energy.sum(dim=2)  # (batch, src_len)
        return F.softmax(energy, dim=1)  # (batch, src_len)`,
          },
          {
            lang: "python",
            code: `# Pointer-Generator 网络（Copy 机制）
import torch
import torch.nn as nn
import torch.nn.functional as F

class PointerGenerator(nn.Module):
    """带 Copy 机制的生成式摘要模型"""
    
    def __init__(self, vocab_size, embed_dim, hidden_dim):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.encoder = nn.LSTM(embed_dim, hidden_dim, bidirectional=True,
                               batch_first=True)
        self.decoder = nn.LSTM(embed_dim, hidden_dim, batch_first=True)
        # 生成概率: p_gen ∈ [0, 1]
        self.p_gen_linear = nn.Linear(hidden_dim * 2 + embed_dim + hidden_dim * 2, 1)
        # 输出层: 词汇表上的概率分布
        self.vocab_dist = nn.Linear(hidden_dim * 4, vocab_size)
    
    def forward(self, src, tgt, src_mask=None):
        """
        src: (batch, src_len) 源文本
        tgt: (batch, tgt_len) 目标摘要
        返回: (batch, tgt_len, vocab_size) 词汇表概率 + 复制概率的混合
        """
        src_emb = self.embedding(src)
        enc_out, (enc_h, _) = self.encoder(src_emb)
        # 双向 encoder: 拼接两个方向
        enc_states = torch.cat([enc_h[0], enc_h[1]], dim=0)  # (2, batch, hidden)
        
        batch, src_len, hidden2 = enc_out.size()
        dec_input = self.embedding(tgt[:, 0])
        dec_h = (enc_h[0:1] + enc_h[1:2], 
                 torch.zeros_like(enc_h[0:1]))
        
        outputs = []
        for t in range(tgt.size(1)):
            dec_out, dec_h = self.decoder(dec_input.unsqueeze(1), dec_h)
            dec_out = dec_out.squeeze(1)  # (batch, hidden)
            
            # 注意力上下文
            attn_weights = self._attn(dec_h[0], enc_out)
            context = torch.bmm(attn_weights.unsqueeze(1), enc_out).squeeze(1)
            
            # 生成概率 p_gen
            p_gen_input = torch.cat([dec_out, context,
                                     dec_h[0].squeeze(0),
                                     attn_weights], dim=1)
            p_gen = torch.sigmoid(self.p_gen_linear(p_gen_input))
            
            # 词汇表分布
            vocab_input = torch.cat([dec_out, context], dim=1)
            vocab_dist = F.softmax(self.vocab_dist(vocab_input), dim=1)
            
            # 混合分布: p_gen * P_vocab + (1 - p_gen) * P_copy
            final_dist = p_gen * vocab_dist + (1 - p_gen) * attn_weights
            
            outputs.append(final_dist)
            dec_input = self.embedding(tgt[:, t]) if t < tgt.size(1) - 1 else None
        
        return torch.stack(outputs, dim=1)
    
    def _attn(self, hidden, enc_outputs):
        scores = torch.bmm(hidden.transpose(1, 2), enc_outputs.transpose(1, 2))
        return F.softmax(scores.squeeze(1), dim=1)`,
          },
        ],
        table: {
          headers: ["组件", "作用", "维度变化", "关键设计"],
          rows: [
            ["编码器", "理解源文本", "(batch, src_len, embed) → (batch, src_len, 2h)", "双向 LSTM 捕获上下文"],
            ["注意力", "动态聚焦", "(batch, src_len) 权重", "Bahdanau / Luong 两种变体"],
            ["解码器", "逐步生成", "(batch, 1, embed+h) → (batch, 1, h)", "教师强制训练"],
            ["生成概率", "生成 vs 复制", "(batch, 1) sigmoid", "p_gen 控制 OOV 处理"],
            ["混合输出", "融合分布", "(batch, vocab+src_len)", "Pointer-Generator 核心"],
          ],
        },
        mermaid: `graph TD
    A["源文本: 苹果发布 iPhone"] --> B["编码器 LSTM"]
    B --> C["隐藏状态 h_1...h_n"]
    C --> D["注意力层"]
    
    E["解码器 LSTM"] --> D
    D --> F["上下文向量 c_t"]
    F --> G{"p_gen 门控"}
    G -->|"p_gen"| H["词汇表生成"]
    G -->|"1-p_gen"| I["从源文本复制"]
    H --> J["最终输出分布"]
    I --> J
    J --> K["输出词: 新一代"]
    K --> E
    class J s3
    class I s2
    class H s1
    class G s0
    classDef s0 fill:#713f12
    classDef s1 fill:#14532d
    classDef s2 fill:#1e3a5f
    classDef s3 fill:#7f1d1d`,
        tip: "注意力可视化是调试 Seq2Seq 摘要模型的利器。将 α_{t,i} 矩阵画成热力图，可以直观看到模型在生成每个摘要词时关注源文本的哪些部分。如果注意力过于分散或集中在无关位置，说明模型没有学会正确对齐。",
        warning: "Seq2Seq 模型在训练中容易暴露偏差（Exposure Bias）：训练时使用教师强制（真实前一个词作为输入），但推理时使用模型自己的输出。这会导致误差累积——模型遇到自己生成的错误词时无法恢复。解决方法：Scheduled Sampling（逐步减少教师强制比例）或强化学习训练。",
      },
      {
        title: "4. BERT 抽取式摘要",
        body: `BERT（2018）的出现不仅革新了生成式 NLP 任务，也极大提升了抽取式摘要的性能。核心思路：用 BERT 编码每个句子的语义表示，然后分类每个句子「是否应该被选入摘要」。

Sentence-BERT 方法 将每篇文章的句子通过 BERT 编码，得到每个句子的 [CLS] 向量表示。然后接一个句子分类器，输出每个句子被选中的概率。训练时使用二元交叉熵损失，标签由参考摘要中的句子确定。

MatchSum（Zhong 等，2020） 提出了一种无需标注句子级别标签的训练方法。它不预测每个句子是否被选中，而是直接优化选出句子的组合与参考摘要之间的 ROUGE 分数。具体来说，从候选句子组合中选出与参考摘要 ROUGE 最高的组合，然后用对比学习训练模型，使得模型对高分组合的打分高于低分组合。

BERT 抽取式的优势：（1）利用预训练语言模型的深层语义理解，远超传统的 TF-IDF 或 TextRank；（2）可以捕捉句子间的语义关系和上下文依赖；（3）支持多语言（使用多语言 BERT）。

****局限性****：仍然是抽取式，无法压缩信息、改写句式或融合多个句子的信息。当原文信息冗余或需要跨句推理时，抽取式方法的上限较低。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
from transformers import BertTokenizer, BertModel

class BertExtractiveSummarizer(nn.Module):
    """基于 BERT 的抽取式摘要模型"""
    
    def __init__(self, model_name="bert-base-chinese"):
        super().__init__()
        self.bert = BertModel.from_pretrained(model_name)
        hidden_size = self.bert.config.hidden_size
        # 句子分类器: 判断句子是否应入选
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_size // 2, 1),
        )
    
    def forward(self, input_ids, attention_mask, sentence_mask):
        """
        input_ids: (batch, max_len) 整个文档的 token ids
        attention_mask: (batch, max_len)
        sentence_mask: (batch, max_sentences) 标记每个 token 属于哪个句子
        """
        # BERT 编码
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        token_embeddings = outputs.last_hidden_state  # (batch, seq_len, hidden)
        
        # 按句子池化: 对每个句子的 token 做 mean pooling
        batch_size, seq_len, hidden = token_embeddings.size()
        
        # 获取每个句子的 [CLS] 位置或使用 mean pooling
        sentence_embeddings = []
        for b in range(batch_size):
            sent_embeds = []
            for s in range(sentence_mask.size(1)):
                mask = sentence_mask[b, s]  # (seq_len,) bool mask
                if mask.any():
                    sent_emb = token_embeddings[b][mask].mean(dim=0)
                else:
                    sent_emb = torch.zeros(hidden)
                sent_embeds.append(sent_emb)
            sentence_embeddings.append(torch.stack(sent_embeds))
        
        # 句子分类
        sentence_embeddings = torch.stack(sentence_embeddings)  # (batch, n_sents, hidden)
        logits = self.classifier(sentence_embeddings).squeeze(-1)  # (batch, n_sents)
        
        return logits  # 每个句子的入选分数
    
    def extract_summary(self, text, num_sentences=3):
        """推理: 提取 num_sentences 个最重要的句子"""
        sentences = [s.strip() for s in text.split('。') if len(s.strip()) > 5]
        # ... 省略 tokenization 细节
        # logits = self.forward(...)
        # top_indices = torch.topk(logits, num_sentences).indices
        # 按原文顺序返回
        pass`,
          },
          {
            lang: "python",
            code: `# MatchSum: 基于对比学习的抽取式摘要
import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import BertTokenizer, BertModel

class MatchSumModel(nn.Module):
    """MatchSum: 直接优化 ROUGE 的抽取式摘要"""
    
    def __init__(self, model_name="bert-base-uncased"):
        super().__init__()
        self.bert = BertModel.from_pretrained(model_name)
        hidden = self.bert.config.hidden_size
        self.proj = nn.Linear(hidden, hidden)
        self.cos_sim = nn.CosineSimilarity(dim=1)
    
    def encode_text(self, input_ids, attention_mask):
        """将文本编码为固定维度向量"""
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls = outputs.last_hidden_state[:, 0, :]  # [CLS] token
        return self.proj(cls)
    
    def forward(self, candidate_ids, candidate_masks, ref_ids, ref_masks):
        """
        candidate_ids: (batch, k, seq_len) k 个候选句子组合
        ref_ids: (batch, seq_len) 参考摘要
        """
        batch, k, seq_len = candidate_ids.size()
        
        # 编码所有候选组合
        cand_flat = candidate_ids.view(batch * k, seq_len)
        cand_mask_flat = candidate_masks.view(batch * k, seq_len)
        cand_embeds = self.encode_text(cand_flat, cand_mask_flat)
        cand_embeds = cand_embeds.view(batch, k, -1)
        
        # 编码参考摘要
        ref_embeds = self.encode_text(ref_ids, ref_masks)  # (batch, hidden)
        
        # 计算每个候选与参考的余弦相似度
        scores = []
        for i in range(batch):
            sim = self.cos_sim(cand_embeds[i], ref_embeds[i].unsqueeze(0))
            scores.append(sim)
        scores = torch.stack(scores)  # (batch, k)
        
        return scores
    
    def contrastive_loss(self, scores, target_idx=0):
        """对比学习损失: 目标候选（最高 ROUGE）得分应最高"""
        # 使用 InfoNCE 损失
        target_scores = scores[:, target_idx]
        margin = 0.1
        loss = 0
        for i in range(scores.size(1)):
            if i != target_idx:
                loss += F.relu(margin - target_scores + scores[:, i]).mean()
        return loss

# 训练流程
print("MatchSum 训练流程:")
print("1. 从每篇文章采样 k 个句子组合")
print("2. 计算每个组合与参考摘要的 ROUGE 分数")
print("3. ROUGE 最高的组合作为正样本")
print("4. 用对比学习训练，使模型对高分组合打分更高")
print("5. 推理时: 对 C(n, m) 个候选组合打分，选最高分的")`,
          },
        ],
        table: {
          headers: ["模型", "预训练模型", "训练方式", "CNN/DM ROUGE-L", "特点"],
          rows: [
            ["BERTSumExt", "BERT-base", "句子分类", "40.9", "首个 BERT 抽取式"],
            ["MatchSum", "RoBERTa", "对比学习", "41.4", "直接优化 ROUGE"],
            ["Sentence-BERT", "BERT-base", "句对匹配", "39.5", "语义句子表示"],
            ["HIBERT", "Transformer", "层级编码", "41.0", "文档层级建模"],
            ["TextRank (基线)", "无", "无监督", "35.5", "无需训练"],
          ],
        },
        mermaid: `graph TD
    A["源文档"] --> B["分句 S_1...S_n"]
    B --> C["BERT 编码每个句子"]
    C --> D["[CLS] 向量表示"]
    D --> E{"模型选择"}
    E -->|"BERTSumExt"| F["句子分类器"]
    E -->|"MatchSum"| G["对比学习"]
    F --> H["句子分数"]
    G --> H
    H --> I["Top-k 选择"]
    I --> J["按原文顺序拼接"]
    J --> K["抽取式摘要"]
    class I s3
    class G s2
    class F s1
    class C s0
    classDef s0 fill:#14532d
    classDef s1 fill:#1e3a5f
    classDef s2 fill:#713f12
    classDef s3 fill:#7f1d1d`,
        tip: "MatchSum 的核心洞察是：传统的句子分类方法优化的是「每个句子是否重要」，但摘要评价的是「一组句子的整体质量」。对比学习直接优化组合质量，更符合摘要任务的本质。",
        warning: "BERT 的最大序列长度通常限制为 512 token，而一篇新闻文章可能有 1000+ token。处理长文档时需要截断、分段编码或使用长文本变体（如 Longformer、BigBird）。截断会丢失文章后半部分的信息。",
      },
      {
        title: "5. BART/T5 生成式摘要",
        body: `BART（2019）和 T5（2019）是预训练 Seq2Seq 模型的两大里程碑，将生成式摘要推向了新的高度。

BART（Bidirectional and Auto-Regressive **Transformer**s） 由 Facebook AI 提出，结合了 BERT 的双向编码能力和 GPT 的自回归解码能力。BART 的预训练采用「去噪自编码器」范式：对输入文本施加各种噪声（token 删除、句子打乱、文本填充等），然后训练模型恢复原文。这种预训练方式使 BART 天然擅长文本生成任务。

**预训练噪声策略**：（1）Token 删除：随机删除部分 token，模型需预测被删除的内容；（2）句子打乱：将文章句子随机排列，模型需恢复正确顺序；（3）文本填充：用 [MASK] 替换连续 span，模型需生成被替换的文本。

BART 在摘要任务上的微调方式极其简单：将源文档作为编码器输入，参考摘要作为解码器目标，直接最大化条件似然 P(y|x)。由于预训练已经学会了「从损坏文本恢复信息」的能力，微调只需少量数据即可适应摘要任务。

T5（Text-To-Text Transfer **Transformer**） 由 Google 提出，将所有 NLP 任务统一为文本到文本的格式。对于摘要任务，输入是「summarize: {source text}」，输出是摘要文本。T5 使用 Span Corruption 预训练：随机选择连续的 token span 替换为单个 [MASK] token，模型需预测被替换的 span 内容。

T5 的规模从 T5-small（60M 参数）到 T5-11B（110 亿参数），模型规模与摘要质量正相关。T5 的多任务预训练使其具有强大的零样本和少样本摘要能力。`,
        code: [
          {
            lang: "python",
            code: `# BART 摘要微调
from transformers import (
    BartTokenizer, BartForConditionalGeneration,
    Seq2SeqTrainingArguments, Seq2SeqTrainer, DataCollatorForSeq2Seq
)
import torch

# 加载预训练 BART
model_name = "facebook/bart-large-cnn"
tokenizer = BartTokenizer.from_pretrained(model_name)
model = BartForConditionalGeneration.from_pretrained(model_name)

# 准备数据
train_texts = [
    "苹果公司今天发布了新一代 iPhone 15，搭载全新 A17 Pro 芯片。"
    "该芯片采用 3 纳米工艺，性能比上一代提升 20%。"
    "新机型还支持 USB-C 接口，告别了使用多年的 Lightning 接口。"
    "起售价 799 美元，将于本月底正式发售。",
]
train_summaries = ["苹果发布 iPhone 15，搭载 A17 Pro 芯片，性能提升 20%，支持 USB-C"]

# Tokenization
train_encodings = tokenizer(
    train_texts, truncation=True, padding="max_length", max_length=512
)
train_labels = tokenizer(
    train_summaries, truncation=True, padding="max_length", max_length=128
)

class SummaryDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels
    
    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels["input_ids"][idx])
        return item
    
    def __len__(self):
        return len(self.labels["input_ids"])

train_dataset = SummaryDataset(train_encodings, train_labels)

# 训练配置
training_args = Seq2SeqTrainingArguments(
    output_dir="./bart-summarizer",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=3e-5,
    predict_with_generate=True,
    fp16=True,
    logging_steps=10,
    save_steps=500,
)

trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    tokenizer=tokenizer,
    data_collator=DataCollatorForSeq2Seq(tokenizer),
)

# trainer.train()
print("BART 微调完成后可直接推理:")
print("  输入: 长文档")
print("  输出: 模型生成的摘要")`,
          },
          {
            lang: "python",
            code: `# T5 零样本与少样本摘要
from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch

# 加载 T5
tokenizer = T5Tokenizer.from_pretrained("t5-large")
model = T5ForConditionalGeneration.from_pretrained("t5-large")

def summarize_t5(text, max_length=128, min_length=30):
    """T5 摘要推理"""
    # T5 需要任务前缀
    input_text = f"summarize: {text}"
    input_ids = tokenizer.encode(input_text, return_tensors="pt",
                                 max_length=512, truncation=True)
    
    output = model.generate(
        input_ids,
        max_length=max_length,
        min_length=min_length,
        length_penalty=2.0,
        num_beams=4,
        early_stopping=True,
        no_repeat_ngram_size=3,
    )
    return tokenizer.decode(output[0], skip_special_tokens=True)

# 零样本测试（无需微调）
text = (
    "据新华社报道，2024 年全球可再生能源装机容量突破 5000 吉瓦，"
    "其中太阳能和风能占比超过 70%。中国以 1500 吉瓦的装机容量"
    "位居全球第一，美国紧随其后为 800 吉瓦。"
    "国际能源署预测，到 2030 年可再生能源将占全球电力供应的 60%。"
    "这一增长主要得益于太阳能光伏成本的持续下降，"
    "过去十年光伏组件价格下降了约 80%。"
)

summary = summarize_t5(text)
print(f"原文: {text[:80]}...")
print(f"摘要: {summary}")

# 生成参数解析
print("\\n=== 生成参数说明 ===")
print("  max_length=128:      最大生成长度")
print("  min_length=30:       最小生成长度（避免过短）")
print("  length_penalty=2.0:  长度惩罚（>1 鼓励更长摘要）")
print("  num_beams=4:         Beam Search 宽度")
print("  early_stopping=True: 所有 beam 完成后立即停止")
print("  no_repeat_ngram_size=3: 禁止 3-gram 重复（减少复读）")`,
          },
        ],
        table: {
          headers: ["模型", "参数规模", "预训练任务", "CNN/DM ROUGE-2", "特点"],
          rows: [
            ["BART-base", "140M", "去噪自编码", "41.6", "轻量快速"],
            ["BART-large", "406M", "去噪自编码", "44.2", "摘要质量最佳"],
            ["BART-large-CNN", "406M", "去噪 + CNN/DM 微调", "44.7", "预微调版"],
            ["T5-base", "220M", "Span Corruption", "40.3", "多任务统一"],
            ["T5-large", "770M", "Span Corruption", "43.5", "零样本能力强"],
            ["T5-11B", "11B", "Span Corruption", "45.2", "最强但极慢"],
          ],
        },
        mermaid: `graph TD
    A["原始文本"] --> B{"模型选择?"}
    B -->|"BART"| C["去噪自编码器预训练"]
    B -->|"T5"| D["Span Corruption 预训练"]
    C --> E["编码器: 双向 Transformer"]
    D --> F["编码器-解码器: Text-to-Text"]
    E --> G["解码器: 自回归生成"]
    F --> G
    G --> H["摘要文本"]
    H --> I["ROUGE 评估"]
    class G s3
    class E s2
    class D s1
    class C s0
    classDef s0 fill:#14532d
    classDef s1 fill:#1e3a5f
    classDef s2 fill:#713f12
    classDef s3 fill:#7f1d1d`,
        tip: "使用 BART-large-CNN 或 T5-large 作为起点——这些是官方在 CNN/DailyMail 数据集上预微调的版本，开箱即用效果远好于基础版。如果你的领域特殊（如医疗、法律），再用领域数据微调。",
        warning: "BART/T5 生成的摘要可能包含「幻觉」——模型生成的内容在源文档中不存在。这是生成式摘要最严重的问题。解决方案：（1）使用 Pointer-Generator 混合机制；（2）训练时加入事实一致性惩罚；（3）后处理阶段用 NLI 模型检测幻觉。",
      },
      {
        title: "6. 长文本摘要挑战",
        body: `大多数预训练模型（BERT 512、BART 1024、T5 512）的输入长度有限，而现实中的文档（学术论文、法律文件、财报）往往长达数千甚至数万 token。长文本摘要是摘要领域的核心挑战之一。

****挑战一****：位置编码限制。 **Transformer** 使用绝对位置编码或旋转位置编码（RoPE），训练时最大位置是固定的（如 2048）。推理时处理更长序列需要外推，而位置编码的外推性能通常很差。

****挑战二****：注意力复杂度。 标准自注意力的计算复杂度为 O(n²)，其中 n 是序列长度。处理 10000 token 的文档需要计算 1 亿对注意力权重，显存和计算都不可接受。

****挑战三****：信息压缩。 即使模型能处理长文本，从 10000 token 压缩到 200 token 的摘要，信息损失率高达 98%。模型需要在极低的压缩率下保留最关键的信息。

****主流解决方案****：
- 分段-合并（Map-Reduce）：将长文档分为多个段，分别摘要后合并。代表方法：MapReduce Summarization。
- 稀疏注意力（Sparse Attention）：只计算部分 token 对的注意力，降低复杂度到 O(n√n) 或 O(n log n)。代表模型：Longformer、BigBird、Reformer。
- 层次编码（Hierarchical Encoding）：先在句子级别编码，再在段落级别聚合，最后在文档级别摘要。代表模型：Hierarchical **Transformer**。
**- 滑动窗口摘要**：用滚动窗口逐步处理长文档，维护上下文状态。代表方法：LED（Longformer-Encoder-Decoder）。`,
        code: [
          {
            lang: "python",
            code: `# Map-Reduce 长文本摘要
from transformers import pipeline

def map_reduce_summarize(long_text, chunk_size=1000, overlap=100,
                         final_max_length=300):
    """分段摘要 + 合并"""
    # 分块（带重叠以避免边界信息丢失）
    chunks = []
    start = 0
    while start < len(long_text):
        end = start + chunk_size
        chunk = long_text[start:end]
        chunks.append(chunk)
        start = end - overlap  # 重叠部分
    
    # Map: 每段独立摘要
    summarizer = pipeline("summarization",
                          model="facebook/bart-large-cnn")
    chunk_summaries = []
    for i, chunk in enumerate(chunks):
        if len(chunk) < 50:
            continue
        result = summarizer(chunk, max_length=150, min_length=30,
                           do_sample=False)
        chunk_summaries.append(result[0]["summary_text"])
        print(f"  段落 {i+1}/{len(chunks)} 摘要: "
              f"{result[0]['summary_text'][:50]}...")
    
    # Reduce: 合并摘要再摘要
    combined = " ".join(chunk_summaries)
    if len(combined) > 512:
        final = summarizer(combined, max_length=final_max_length,
                          min_length=50, do_sample=False)
        return final[0]["summary_text"]
    return combined

# 测试
long_text = "段落1" * 200 + "段落2" * 200 + "段落3" * 200
# result = map_reduce_summarize(long_text)
print("Map-Reduce 摘要流程:")
print("  1. 长文档 → 分块 (chunk_size=1000, overlap=100)")
print("  2. 每块 → BART 摘要 (max_length=150)")
print("  3. 合并摘要 → 再次摘要 (max_length=300)")
print("  4. 输出最终摘要")`,
          },
          {
            lang: "python",
            code: `# Longformer 稀疏注意力
from transformers import LongformerTokenizer, LongformerModel
import torch

# Longformer 使用三种注意力模式：
# 1. 局部窗口注意力: 每个 token 只关注附近的 w 个 token (O(n*w))
# 2. 全局注意力: 指定 token (如 [CLS]) 关注所有位置
# 3. 混合: 大部分 token 用局部注意力，关键 token 用全局注意力

tokenizer = LongformerTokenizer.from_pretrained("allenai/longformer-base-4096")
model = LongformerModel.from_pretrained("allenai/longformer-base-4096")

# 构造 4096 token 的输入
long_text = "这是一篇很长的文章。" * 500  # 约 4000+ 字符
inputs = tokenizer(long_text, return_tensors="pt",
                   max_length=4096, truncation=True)

# 设置全局注意力（让 [CLS] token 有全局视野）
attention_mask = inputs["attention_mask"]
global_attention_mask = torch.zeros_like(attention_mask)
global_attention_mask[:, 0] = 1  # [CLS] 有全局注意力

outputs = model(
    input_ids=inputs["input_ids"],
    attention_mask=attention_mask,
    global_attention_mask=global_attention_mask,
)

print(f"输入 token 数: {inputs['input_ids'].size(1)}")
print(f"输出 hidden states: {outputs.last_hidden_state.size()}")
print(f"参数量: {sum(p.numel() for p in model.parameters()):,}")

# 注意力复杂度对比
print("\\n=== 注意力复杂度对比 ===")
seq_lens = [512, 1024, 2048, 4096, 8192]
for n in seq_lens:
    full_attn = n * n  # 标准注意力
    longformer_attn = n * 512  # w=512 窗口
    ratio = full_attn / longformer_attn
    print(f"  序列长度 {n:>5}: 标准 O(n²)={full_attn:>10,}  "
          f"Longformer O(nw)={longformer_attn:>10,}  加速 {ratio:.0f}x")`,
          },
        ],
        table: {
          headers: ["方法", "最大长度", "复杂度", "显存需求", "摘要质量"],
          rows: [
            ["Map-Reduce", "无限", "O(n/w)", "低（逐段处理）", "中等（信息分散）"],
            ["Longformer", "4096", "O(nw)", "中等", "好"],
            ["BigBird", "4096", "O(n)", "中等", "好"],
            ["LED", "16384", "O(nw)", "较高", "很好"],
            ["GPT-4 上下文", "128K", "O(n²)", "极高", "最好（但慢）"],
            ["Oracle（理想）", "无限", "O(n²)", "无限", "上界"],
          ],
        },
        mermaid: `graph TD
    A["长文档 10000+ token"] --> B{"处理策略?"}
    B -->|"分段"| C["Map-Reduce"]
    B -->|"稀疏注意力"| D["Longformer/BigBird"]
    B -->|"层次编码"| E["Hierarchical"]
    B -->|"滑动窗口"| F["LED"]
    C --> G["每段摘要 → 合并摘要"]
    D --> H["局部窗口 + 全局 token"]
    E --> I["句子→段落→文档"]
    F --> J["滚动窗口编码"]
    G --> K["最终摘要"]
    H --> K
    I --> K
    J --> K
    class F s3
    class E s2
    class D s1
    class C s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#713f12
    classDef s3 fill:#581c87`,
        tip: "对于超过 4096 token 的文档，LED（Longformer-Encoder-Decoder）是目前性价比最高的选择——它支持 16384 token 输入，且在 CNN/DailyMail 上达到了接近 BART-large 的 ROUGE 分数。",
        warning: "Map-Reduce 方法的最大问题是信息碎片化：每段的摘要可能丢失跨段落的重要关联。如果文档有明确的章节结构（如论文），按章节分段比固定长度分段效果好得多。",
      },
      {
        title: "7. HuggingFace 实战：端到端摘要流水线",
        body: `**HuggingFace** 的 transformers 库提供了最易用的摘要工具链，从开箱即用的 pipeline 到可定制的训练循环，覆盖了从快速原型到生产部署的全流程。

Pipeline 模式 一行代码实现摘要：pipeline("summarization", model="facebook/bart-large-cnn") 会自动加载分词器、模型和后处理逻辑。适合快速验证想法或处理少量文档。

自定义训练 使用 Seq2SeqTrainer 可以灵活控制训练的每个细节：数据加载、损失函数、评估指标、学习率调度等。这是实际项目中最常用的方式。

****模型选择指南****：
****- 中文摘要****：推荐使用 cnled 系列（Longformer 中文）、mT5（多语言 T5）或 ChatGLM/Baichuan 等国产大模型
****- 英文摘要****：BART-large-CNN、Pegasus-xsum、T5-large 是经典选择
****- 多语言****：mBART、mT5 支持 100+ 语言
****- 超长文档****：LED、LongT5、BigBird-Pegasus

****部署优化****： 生产环境需要考虑推理速度和显存占用。量化（INT8/INT4）可以将模型体积压缩 4 倍，速度提升 2-3 倍。对于高并发场景，可以使用 **vLLM** 或 TensorRT-LLM 等推理引擎。`,
        code: [
          {
            lang: "python",
            code: `# 完整的中文摘要实战
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import torch

class ChineseSummarizer:
    """中文摘要服务"""
    
    def __init__(self, model_name="fnlp/bart-base-chinese"):
        print(f"加载模型: {model_name}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        
        # 如果 GPU 可用
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)
        print(f"设备: {self.device}")
    
    def summarize(self, text, max_length=128, min_length=30,
                  do_sample=False, num_beams=4):
        """生成摘要"""
        # Tokenize
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding="max_length"
        ).to(self.device)
        
        # Generate
        with torch.no_grad():
            output_ids = self.model.generate(
                inputs["input_ids"],
                max_length=max_length,
                min_length=min_length,
                num_beams=num_beams,
                length_penalty=2.0,
                no_repeat_ngram_size=3,
                early_stopping=True,
            )
        
        summary = self.tokenizer.decode(output_ids[0],
                                        skip_special_tokens=True)
        return summary
    
    def batch_summarize(self, texts, batch_size=4):
        """批量摘要"""
        results = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            for text in batch:
                results.append(self.summarize(text))
        return results

# 使用示例
summarizer = ChineseSummarizer()

text = (
    "据中国科学技术部发布的数据，2024 年中国研发投入达到 3.6 万亿元人民币，"
    "同比增长 8.2%，占 GDP 比重 2.64%。其中基础研究经费增长 15.3%，"
    "企业研发投入占比超过 77%。全国高新技术企业数量突破 40 万家，"
    "技术合同成交额达到 4.8 万亿元。"
    "人工智能、量子计算、生物制造等前沿领域取得重大突破。"
)

summary = summarizer.summarize(text, max_length=80, min_length=20)
print(f"原文: {text[:60]}...")
print(f"摘要: {summary}")`,
          },
          {
            lang: "python",
            code: `# 模型量化与部署优化
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from transformers import BitsAndBytesConfig
import torch

print("=== 摘要模型部署优化方案 ===\\n")

# 方案 1: 8-bit 量化
bnb_config_8bit = BitsAndBytesConfig(load_in_8bit=True)
print("方案 1: 8-bit 量化 (bitsandbytes)")
print("  显存节省: ~50%")
print("  速度损失: ~10%")
print("  精度损失: < 1%")
print("  适用: GPU 显存有限")

# 方案 2: 4-bit 量化
bnb_config_4bit = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)
print("\\n方案 2: 4-bit 量化 (NF4)")
print("  显存节省: ~75%")
print("  速度损失: ~20%")
print("  精度损失: 1-3%")
print("  适用: 消费级 GPU (RTX 3060/4060)")

# 方案 3: ONNX 导出
print("\\n方案 3: ONNX Runtime 推理")
print("  显存节省: 无（仍需加载模型）")
print("  速度提升: 2-3x")
print("  精度损失: 0%")
print("  适用: CPU 推理、边缘设备")

# 方案 4: vLLM 推理引擎
print("\\n方案 4: vLLM 推理引擎")
print("  吞吐量提升: 10-24x")
print("  延迟: 低")
print("  适用: 高并发 API 服务")

# 方案 5: TensorRT-LLM
print("\\n方案 5: TensorRT-LLM (NVIDIA)")
print("  吞吐量提升: 3-8x")
print("  延迟: 最低")
print("  适用: NVIDIA GPU 生产环境")

# 对比
print("\\n=== 模型选型决策树 ===")
print("需求是中文摘要? → cnled / BART-Chinese / mT5")
print("  文档 < 512 token? → BART / T5")
print("  文档 512-4096? → Longformer / LED")
print("  文档 > 4096? → LED / Map-Reduce / GPT-4")
print("需要 GPU? → 是: BART-large / 否: 量化版 / API")
print("实时性要求高? → vLLM / TensorRT-LLM")
print("预算有限? → T5-small 量化 / 开源模型")`,
          },
        ],
        table: {
          headers: ["模型", "语言", "最大长度", "参数量", "显存 (FP16)", "适用场景"],
          rows: [
            ["BART-base-Chinese", "中文", "512", "140M", "280MB", "短文本快速摘要"],
            ["BART-large-CNN", "英文", "1024", "406M", "812MB", "英文新闻摘要"],
            ["mT5-base", "多语言", "512", "300M", "600MB", "多语言摘要"],
            ["LED-base-16k", "英文", "16384", "176M", "352MB", "长文档摘要"],
            ["cnled-wiki-3072", "中文", "3072", "176M", "352MB", "中文长文本"],
            ["Pegasus-xsum", "英文", "512", "568M", "1.1GB", "极短摘要 (XSum)"],
          ],
        },
        mermaid: `graph TD
    A["新摘要项目"] --> B{"中文还是英文?"}
    B -->|"中文"| C["cnled / BART-Chinese"]
    B -->|"英文"| D["BART-large-CNN / T5"]
    C --> E{"文档长度?"}
    D --> E
    E -->|"< 512"| F["标准 BART/T5"]
    E -->|"512-4096"| G["Longformer / LED"]
    E -->|"> 4096"| H["LED / Map-Reduce"]
    F --> I{"部署环境?"}
    G --> I
    H --> I
    I -->|"GPU 充足"| J["FP16 全精度"]
    I -->|"GPU 有限"| K["8-bit/4-bit 量化"]
    I -->|"CPU / 边缘"| L["ONNX Runtime"]
    I -->|"高并发 API"| M["vLLM / TensorRT-LLM"]
    class M s4
    class K s3
    class J s2
    class D s1
    class C s0
    classDef s0 fill:#14532d
    classDef s1 fill:#1e3a5f
    classDef s2 fill:#713f12
    classDef s3 fill:#7f1d1d
    classDef s4 fill:#581c87`,
        tip: "中文摘要推荐优先尝试 cnled-wiki-3072（复旦 NLP 团队开源），它基于 Longformer 架构，支持 3072 token 输入，在中文 LCSTS 数据集上表现优秀。如果是极短摘要需求（一句话概括），Pegasus 的 XSum 变体效果更好。",
        warning: "生产部署前一定要做事实一致性检测！生成式模型的幻觉问题是真实存在的。建议在 pipeline 中加入 NLI（自然语言推理）后处理步骤：用预训练 NLI 模型检查摘要中的每个事实声明是否被源文档蕴含。如果不蕴含，标记为潜在幻觉并人工审核。",
      },
    ],
};
