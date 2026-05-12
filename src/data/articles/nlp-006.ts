import { Article } from '../knowledge';

export const article: Article = {
    id: "nlp-006",
    title: "机器翻译：从 Seq2Seq 到 Transformer",
    category: "nlp",
    tags: ["机器翻译", "Seq2Seq", "Transformer"],
    summary: "从 RNN 编码器解码器到纯注意力机制，梳理机器翻译的技术演进",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
      {
        title: "1. 机器翻译任务定义与 BLEU 评估",
        body: `机器翻译（Machine Translation, MT）的核心目标是将源语言句子自动转换为目标语言句子，同时保持语义等值和语法正确性。从形式化角度看，翻译是在给定源句子 X = (x₁, x₂, ..., xₙ) 的条件下，寻找最优目标句子 Y = (y₁, y₂, ..., yₘ)，使得条件概率 P(Y | X) 最大化。

机器翻译经历了三个发展阶段：基于规则的方法（Rule-based MT）依赖人工编写的语言学规则和双语词典；基于统计的方法（Statistical MT）通过平行语料自动学习翻译模型和语言模型；神经网络方法（Neural MT, NMT）用端到端的深度神经网络直接建模源语言到目标语言的映射。NMT 的优势在于：无需人工设计特征，能捕捉长距离依赖，且生成更流畅自然的译文。

BLEU（Bilingual Evaluation Understudy） 是机器翻译最常用的自动评估指标，由 IBM 研究者 Papineni 等人在 2002 年提出。BLEU 的核心思想是将机器翻译的输出与参考翻译进行 n-gram 重叠比较，计算修正的 n-gram 精度（Modified Precision），并引入简短惩罚（Brevity Penalty）防止系统倾向于生成过短的翻译。BLEU 分数范围 0-100，越高越好，通常 BLEU > 30 认为翻译质量可接受，BLEU > 50 认为接近人类水平。

尽管 BLEU 广泛应用，但它也有明显局限：只考虑 n-gram 精确匹配，忽略同义词替换和语义等价，且对词序变化过于敏感。近年来，COMET、BERTScore 等基于预训练模型的评估指标逐渐受到关注。`,
        code: [
          {
            lang: "python",
            code: `# BLEU 分数计算详解
from collections import Counter
import math

def compute_bleu(candidate, references, max_n=4):
    """手动实现 BLEU 分数计算"""
    # 计算各阶 n-gram 修正精度
    precisions = []
    for n in range(1, max_n + 1):
        cand_ngrams = Counter()
        ref_ngram_counts = [Counter() for _ in references]
        
        # 提取候选 n-gram
        for i in range(len(candidate) - n + 1):
            ngram = tuple(candidate[i:i + n])
            cand_ngrams[ngram] += 1
        
        # 提取参考 n-gram
        for ref_idx, ref in enumerate(references):
            for i in range(len(ref) - n + 1):
                ngram = tuple(ref[i:i + n])
                ref_ngram_counts[ref_idx][ngram] += 1
        
        # 修正精度：裁剪候选 n-gram 计数
        clipped_count = 0
        total_count = 0
        for ngram, count in cand_ngrams.items():
            max_ref_count = max(ref_counts.get(ngram, 0)
                                for ref_counts in ref_ngram_counts)
            clipped_count += min(count, max_ref_count)
            total_count += count
        
        precision = clipped_count / total_count if total_count > 0 else 0
        precisions.append(precision)
    
    # 简短惩罚 (Brevity Penalty)
    cand_len = len(candidate)
    ref_lens = [len(ref) for ref in references]
    closest_ref_len = min(ref_lens, key=lambda x: abs(x - cand_len))
    bp = 1.0 if cand_len > closest_ref_len else math.exp(1 - closest_ref_len / cand_len)
    
    # 几何平均
    if 0 in precisions:
        return 0.0
    geo_mean = math.exp(sum(math.log(p) for p in precisions) / max_n)
    return bp * geo_mean * 100

# 测试
candidate = ["the", "cat", "is", "on", "the", "mat"]
refs = [
    ["the", "cat", "is", "sitting", "on", "the", "mat"],
    ["there", "is", "a", "cat", "on", "the", "mat"],
]
bleu = compute_bleu(candidate, refs)
print(f"BLEU-4 分数: {bleu:.2f}")`,
          },
          {
            lang: "python",
            code: `# BLEU vs COMET 对比分析
import math

print("=== 自动评估指标对比 ===\\n")

# 场景 1: 同义词替换
print("场景 1: 同义词替换")
candidate = ["the", "child", "is", "playing", "outside"]
ref1 = ["the", "kid", "is", "playing", "outdoors"]
ref2 = ["the", "child", "is", "playing", "outside"]
refs = [ref1, ref2]
print(f"  候选: {' '.join(candidate)}")
print(f"  参考1: {' '.join(ref1)}")
print(f"  参考2: {' '.join(ref2)}")
print(f"  BLEU-4 (vs ref1): {compute_bleu(candidate, [ref1]):.2f}")
print(f"  BLEU-4 (vs ref2): {compute_bleu(candidate, [ref2]):.2f}")
print(f"  BLEU-4 (双参考):  {compute_bleu(candidate, refs):.2f}")
print(f"  → BLEU 因 'child' vs 'kid' 的精确匹配差异而评分不同")

# 场景 2: 词序变化
print("\\n场景 2: 词序变化")
c1 = ["i", "eat", "an", "apple"]
c2 = ["an", "apple", "i", "eat"]
ref = ["i", "eat", "an", "apple"]
print(f"  候选1: {' '.join(c1)} (BLEU: {compute_bleu(c1, [ref]):.2f})")
print(f"  候选2: {' '.join(c2)} (BLEU: {compute_bleu(c2, [ref]):.2f})")
print(f"  → BLEU 对词序变化极度敏感")

# BLEU 的优势与局限
print("\\n=== BLEU 总结 ===")
print("优势: 计算快速、可重复、与人类判断有一定相关性")
print("局限: 忽略语义等价、对词序敏感、不考虑句法正确性")
print("替代方案: COMET (基于预训练模型), BERTScore (基于 BERT 语义相似度)")`,
          },
        ],
        table: {
          headers: ["评估指标", "原理", "范围", "与人类相关性", "计算速度", "适用场景"],
          rows: [
            ["BLEU", "n-gram 精确匹配", "0-100", "0.5-0.7", "极快", "快速评估、论文对比"],
            ["TER", "最小编辑距离", "0-100 (越低越好)", "0.6-0.7", "快", "需要词序敏感评估"],
            ["METEOR", "同义词+词干+语序", "0-1", "0.7-0.8", "中等", "需要语义等价识别"],
            ["COMET", "预训练模型打分", "0-1", "0.8-0.9", "慢", "高质量评估"],
            ["BERTScore", "BERT 语义相似度", "0-1", "0.75-0.85", "中等", "语义质量评估"],
          ],
        },
        mermaid: `graph TD
    A["源语言句子 X"] --> B["机器翻译系统"]
    B --> C["候选翻译 Y"]
    C --> D{"评估指标"}
    D -->|"n-gram 匹配"| E["BLEU"]
    D -->|"编辑距离"| F["TER"]
    D -->|"同义词+语序"| G["METEOR"]
    D -->|"预训练模型"| H["COMET / BERTScore"]
    E --> I["分数 0-100"]
    F --> I
    G --> I
    H --> I
    I --> J["翻译质量判断"]`,
        tip: "BLEU 计算时建议使用多个参考翻译（至少 2-4 个），因为同一句话可能有多种正确的翻译方式。单个参考翻译会低估翻译系统的实际质量。",
        warning: "BLEU 不能替代人工评估。在论文或产品报告中，自动评估指标应与人工评估（如 MQM、A/B 测试）结合使用。BLEU 分数差异小于 1 分通常没有统计显著性。",
      },
      {
        title: "2. RNN Seq2Seq 基础：编码器-解码器架构",
        body: `Seq2Seq（Sequence-to-Sequence）是神经网络机器翻译的奠基性架构，由 Sutskever 等人在 2014 年提出。其核心思想极其优雅：用两个 RNN（通常是 LSTM 或 GRU）分别充当编码器（Encoder）和解码器（Decoder），编码器将源句子压缩为一个固定长度的上下文向量，解码器根据该向量生成目标句子。

编码器（Encoder）： 读取源句子的每个词 x₁, x₂, ..., xₙ，在每一步更新隐藏状态 h_t = RNN(x_t, h_{t-1})。编码器最后一个时间步的隐藏状态 hₙ（或整个隐藏状态序列）被用作源句子的「语义摘要」，即上下文向量 c = hₙ。

解码器（Decoder）： 以自回归方式生成目标句子。在第 t 步，解码器接收上一时刻的隐藏状态 s_{t-1} 和上一时刻生成的词 y_{t-1}，计算当前隐藏状态 s_t = RNN(Embed(y_{t-1}), s_{t-1})，然后通过 softmax 输出下一个词的概率分布 P(y_t | y_{<t}, c) = softmax(W · s_t + b)。

**训练方式**： 使用教师强制（Teacher Forcing）策略——训练时，解码器的输入是参考翻译的真实词序列（而非模型自己生成的词），这加速了收敛但也带来了暴露偏差（Exposure Bias）：训练时看到的全是正确的词，推理时却要基于自己生成的（可能错误的）词来预测下一步。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class EncoderRNN(nn.Module):
    """RNN 编码器：将源句子编码为上下文向量"""
    
    def __init__(self, vocab_size, embed_dim, hidden_dim, n_layers=2, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.rnn = nn.LSTM(embed_dim, hidden_dim, n_layers,
                           dropout=dropout if n_layers > 1 else 0,
                           batch_first=True)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, src, src_lengths):
        """
        src: (batch, src_len) 源句子索引
        src_lengths: (batch,) 每个源句子的实际长度
        返回: (outputs, hidden, cell) 用于解码器
        """
        embedded = self.dropout(self.embedding(src))  # (batch, src_len, embed)
        
        # pack_padded_sequence 处理变长序列
        packed = nn.utils.rnn.pack_padded_sequence(
            embedded, src_lengths.cpu(), batch_first=True, enforce_sorted=False
        )
        outputs, (hidden, cell) = self.rnn(packed)
        outputs, _ = nn.utils.rnn.pad_packed_sequence(outputs, batch_first=True)
        
        # outputs: (batch, src_len, hidden_dim)
        # hidden: (n_layers, batch, hidden_dim)
        # cell: (n_layers, batch, hidden_dim)
        return outputs, hidden, cell`,
          },
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import random

class DecoderRNN(nn.Module):
    """RNN 解码器：根据上下文向量生成目标句子"""
    
    def __init__(self, vocab_size, embed_dim, hidden_dim, n_layers=2, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.rnn = nn.LSTM(embed_dim, hidden_dim, n_layers,
                           dropout=dropout if n_layers > 1 else 0)
        self.fc_out = nn.Linear(hidden_dim, vocab_size)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, input_token, hidden, cell):
        """
        input_token: (batch,) 当前输入词索引
        hidden: (n_layers, batch, hidden_dim)
        cell: (n_layers, batch, hidden_dim)
        返回: output, hidden, cell
        """
        input_token = input_token.unsqueeze(1)  # (batch, 1)
        embedded = self.dropout(self.embedding(input_token))  # (batch, 1, embed)
        embedded = embedded.transpose(0, 1)  # (1, batch, embed)
        
        output, (hidden, cell) = self.rnn(embedded, (hidden, cell))
        prediction = self.fc_out(output.squeeze(0))  # (batch, vocab_size)
        return prediction, hidden, cell

class Seq2Seq(nn.Module):
    """完整的 Seq2Seq 翻译模型"""
    
    def __init__(self, encoder, decoder, device, teacher_forcing_ratio=0.5):
        super().__init__()
        self.encoder = encoder
        self.decoder = decoder
        self.device = device
        self.teacher_forcing_ratio = teacher_forcing_ratio
    
    def forward(self, src, src_lengths, trg):
        """训练时的前向传播"""
        batch_size = src.shape[0]
        trg_len = trg.shape[1]
        trg_vocab_size = self.decoder.fc_out.out_features
        
        outputs = torch.zeros(batch_size, trg_len, trg_vocab_size).to(self.device)
        encoder_outputs, hidden, cell = self.encoder(src, src_lengths)
        
        # 解码器输入从 <sos> 开始
        input_token = trg[:, 0]  # (batch,)
        
        for t in range(1, trg_len):
            output, hidden, cell = self.decoder(input_token, hidden, cell)
            outputs[:, t] = output
            # Teacher Forcing: 以一定概率使用真实词作为下一步输入
            top1 = output.argmax(1)
            teacher_force = random.random() < self.teacher_forcing_ratio
            input_token = trg[:, t] if teacher_force else top1
        
        return outputs`,
          },
        ],
        table: {
          headers: ["组件", "输入", "输出", "维度", "作用"],
          rows: [
            ["词嵌入层", "词索引 (batch, len)", "嵌入向量 (batch, len, d)", "d=embed_dim", "将离散词映射到连续空间"],
            ["编码器 LSTM", "嵌入序列 (batch, src_len, d)", "outputs (batch, src_len, h), hidden (L, batch, h)", "h=hidden_dim", "编码源句子语义"],
            ["上下文向量 c", "h_N (L, batch, h)", "固定维度向量 (L, batch, h)", "h=hidden_dim", "源句子的压缩表示"],
            ["解码器 LSTM", "Embed(y_{t-1}) + hidden, cell", "output (1, batch, h), hidden, cell", "h=hidden_dim", "自回归生成目标词"],
            ["线性输出层", "decoder output (batch, h)", "logits (batch, vocab_size)", "vocab_size", "计算每个词的概率"],
          ],
        },
        mermaid: `graph TD
    A["源句: 我 爱 自 然 语 言 处 理"] --> B["编码器 LSTM"]
    B --> C["h₁ h₂ h₃ h₄ h₅ h₆ h₇ h₈"]
    C --> D["上下文向量 c = h₈"]
    D --> E["解码器 LSTM"]
    E --> F["<sos>"]
    F --> G["I"]
    G --> H["love"]
    H --> I["natural"]
    I --> J["language"]
    J --> K["processing"]
    K --> L["<eos>"]
    class L s4
    class E s3
    class D s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#713f12
    classDef s3 fill:#7c2d12
    classDef s4 fill:#7f1d1d`,
        tip: "Teacher Forcing Ratio 应从 1.0 逐渐衰减到接近 0，这叫做 Scheduled Sampling。训练初期依赖教师强制加速收敛，后期减少依赖以缓解暴露偏差，使模型更适应推理时的自回归生成。",
        warning: "固定长度上下文向量是 Seq2Seq 架构的「信息瓶颈」——无论源句子多长，编码器都必须将所有信息压缩到一个固定维度的向量中。当源句子超过 30 个词时，编码器会严重丢失信息，导致翻译质量急剧下降。",
      },
      {
        title: "3. 注意力机制突破：打破信息瓶颈",
        body: `注意力机制（Attention Mechanism）是 Bahdanau 等人在 2014 年提出的 Seq2Seq 扩展，直接解决了固定长度上下文向量的信息瓶颈问题。其核心思想不再是「把整个源句子压缩成一个向量」，而是让解码器在生成每个目标词时，能够「关注」源句子的不同部分。

计算过程分为三步：

第一步，对齐分数计算（Alignment Score）：在解码器第 t 步，对编码器的每个隐藏状态 h_j（j = 1, ..., N），计算对齐分数 e_{tj} = a(s_{t-1}, h_j)。Bahdanau 使用加性注意力：e_{tj} = v^T tanh(W_s · s_{t-1} + W_h · h_j)，其中 W_s, W_h 是可学习矩阵，v 是注意力权重向量。

第二步，注意力权重归一化：α_{tj} = softmax(e_{tj}) = exp(e_{tj}) / Σ_k exp(e_{tk})。这些权重表示在生成第 t 个目标词时，对源句子第 j 个位置的关注程度。

第三步，上下文向量加权求和：c_t = Σ_j α_{tj} · h_j。注意这里的 c_t 不再是固定的，而是随解码步骤 t 动态变化。

Luong 注意力（2015）提出了更简洁的点积注意力：e_{tj} = s_t^T · h_j，以及多种注意力变体（global、local、monotonic）。注意力的引入使机器翻译在长句子上的 BLEU 分数提升了 10 分以上，并且可以可视化注意力权重矩阵来理解模型的翻译对齐行为。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class BahdanauAttention(nn.Module):
    """Bahdanau 加性注意力"""
    
    def __init__(self, hidden_dim):
        super().__init__()
        self.attn = nn.Linear(hidden_dim * 2, hidden_dim)  # W_s · s + W_h · h
        self.v = nn.Linear(hidden_dim, 1, bias=False)  # 注意力权重向量
    
    def forward(self, hidden, encoder_outputs):
        """
        hidden: (batch, hidden_dim) 解码器上一时刻隐藏状态
        encoder_outputs: (batch, src_len, hidden_dim) 编码器输出
        返回: context (batch, hidden_dim), attn_weights (batch, src_len)
        """
        src_len = encoder_outputs.shape[1]
        
        # 重复 hidden 以匹配源序列长度
        hidden = hidden.unsqueeze(1).repeat(1, src_len, 1)  # (batch, src_len, hidden)
        
        # 计算对齐分数: e = v^T tanh(W·[s;h])
        energy = torch.tanh(self.attn(torch.cat([hidden, encoder_outputs], dim=2)))
        attention = self.v(energy).squeeze(2)  # (batch, src_len)
        
        # 注意力权重归一化
        attn_weights = F.softmax(attention, dim=1)  # (batch, src_len)
        
        # 上下文向量: 加权和
        context = torch.bmm(attn_weights.unsqueeze(1), encoder_outputs).squeeze(1)
        
        return context, attn_weights`,
          },
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class AttentionDecoderRNN(nn.Module):
    """带注意力的解码器"""
    
    def __init__(self, vocab_size, embed_dim, hidden_dim, n_layers=2, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.attention = BahdanauAttention(hidden_dim)
        # 拼接: [Embed(y) + 注意力上下文] → RNN 输入
        self.rnn = nn.LSTM(embed_dim + hidden_dim, hidden_dim, n_layers,
                           dropout=dropout if n_layers > 1 else 0)
        self.fc_out = nn.Linear(embed_dim + hidden_dim * 2, vocab_size)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, input_token, hidden, cell, encoder_outputs):
        """
        input_token: (batch,) 当前输入词
        hidden/cell: (n_layers, batch, hidden_dim)
        encoder_outputs: (batch, src_len, hidden_dim)
        """
        input_token = input_token.unsqueeze(1)  # (batch, 1)
        embedded = self.dropout(self.embedding(input_token))  # (batch, 1, embed)
        
        # 注意力计算
        context, attn_weights = self.attention(hidden[-1], encoder_outputs)
        # context: (batch, hidden_dim)
        # attn_weights: (batch, src_len)
        
        # 拼接嵌入和上下文向量
        rnn_input = torch.cat([embedded, context.unsqueeze(1)], dim=2)
        rnn_input = rnn_input.transpose(0, 1)  # (1, batch, embed+hidden)
        
        output, (hidden, cell) = self.rnn(rnn_input, (hidden, cell))
        
        # 拼接: [嵌入, 上下文, 解码器输出] → 预测
        output = torch.cat([embedded.squeeze(1), context, output.squeeze(0)], dim=1)
        prediction = self.fc_out(output)  # (batch, vocab_size)
        
        return prediction, hidden, cell, attn_weights`,
          },
        ],
        table: {
          headers: ["注意力类型", "对齐分数公式", "参数量", "计算复杂度", "特点"],
          rows: [
            ["Bahdanau (加性)", "v^T tanh(W[s;h])", "O(d²)", "O(src_len × d²)", "参数多但表达能力强"],
            ["Luong (点积)", "s^T h", "无额外参数", "O(src_len × d)", "简洁高效，Transformer 前身"],
            ["Luong (通用)", "s^T W h", "O(d²)", "O(src_len × d²)", "带线性变换的点积"],
            ["Scaled Dot-Product", "softmax(s^T h / √d)", "无额外参数", "O(src_len × d)", "数值稳定，Transformer 使用"],
            ["Local Attention", "仅关注局部窗口", "同全局", "O(window × d)", "减少计算，适合长序列"],
          ],
        },
        mermaid: `graph TD
    A["解码器隐藏状态 s_t"] --> B["注意力计算"]
    C["编码器输出 h₁"] --> B
    D["编码器输出 h₂"] --> B
    E["编码器输出 h₃"] --> B
    F["编码器输出 hₙ"] --> B
    B --> G["注意力权重 α₁ α₂ α₃ ... αₙ"]
    G --> H["加权求和 c_t = Σαⱼhⱼ"]
    H --> I["拼接 [Embed; c_t]"]
    I --> J["LSTM 更新"]
    J --> K["输出 y_t 概率"]
    class K s3
    class G s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#7c2d12`,
        tip: "训练时保存注意力权重矩阵，用热力图可视化对齐关系。好的注意力图应该呈现对角线模式（源词和目标词按顺序对齐），这对调试翻译模型非常有帮助。",
        warning: "注意力机制的计算复杂度为 O(src_len × d²)，当源句子很长时（如超过 100 词），每步解码都要计算对所有源位置的对齐分数。这是后续 Transformer 需要解决的问题——但先有了注意力突破，才有后面的架构革命。",
      },
      {
        title: "4. Transformer 架构：纯注意力机制革命",
        body: `**Transformer** 由 Vaswani 等人在 2017 年提出，彻底摒弃了 RNN 的循环结构，完全基于注意力机制构建。这不仅是机器翻译的突破，更是整个 NLP 领域的范式转变——BERT、GPT、T5 等大语言模型都建立在 **Transformer** 之上。

**核心设计思想**： RNN 的串行计算限制了训练速度，且长距离依赖建模困难。Transformer 用自注意力（Self-Attention）替代循环，使序列中任意两个位置的交互都只需一步计算，路径长度为 O(1) 而非 RNN 的 O(N)。

多头自注意力（Multi-Head Self-Attention）： 将查询（Query）、键（Key）、值（Value）分别通过不同的线性投影到多个子空间，在每个子空间独立计算注意力，然后拼接并线性变换。多头机制让模型可以同时关注不同位置的不同表示子空间——一个头可能关注语法关系，另一个头关注语义关系。

位置编码（Positional Encoding）： 由于自注意力本身不包含位置信息（它是置换不变的），**Transformer** 通过向词嵌入注入位置编码来保留顺序信息。原始论文使用正弦/余弦函数：PE(pos, 2i) = sin(pos / 10000^{2i/d})，PE(pos, 2i+1) = cos(pos / 10000^{2i/d})。

编码器-解码器结构： 编码器由 N 层相同的子层堆叠（自注意力 + FFN），解码器也在自注意力层之间插入编码器-解码器交叉注意力层，使解码器既能关注自身已生成的词，也能关注源句子。残差连接和层归一化贯穿始终，确保梯度稳定流动。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import math

class MultiHeadAttention(nn.Module):
    """多头自注意力机制"""
    
    def __init__(self, d_model=512, n_heads=8, dropout=0.1):
        super().__init__()
        assert d_model % n_heads == 0
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads  # 每个头的维度
        
        # 线性投影矩阵
        self.W_Q = nn.Linear(d_model, d_model)
        self.W_K = nn.Linear(d_model, d_model)
        self.W_V = nn.Linear(d_model, d_model)
        self.W_O = nn.Linear(d_model, d_model)
        
        self.dropout = nn.Dropout(dropout)
        self.scale = math.sqrt(self.d_k)
    
    def forward(self, query, key, value, mask=None):
        """
        query/key/value: (batch, seq_len, d_model)
        mask: (batch, 1, 1, seq_len) 或 (batch, seq_len, seq_len)
        """
        batch_size = query.shape[0]
        
        # 线性投影并分头: (batch, n_heads, seq_len, d_k)
        Q = self.W_Q(query).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_K(key).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_V(value).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        
        # Scaled Dot-Product Attention
        attn_scores = torch.matmul(Q, K.transpose(-2, -1)) / self.scale
        
        if mask is not None:
            attn_scores = attn_scores.masked_fill(mask == 0, -1e9)
        
        attn_probs = torch.softmax(attn_scores, dim=-1)
        attn_probs = self.dropout(attn_probs)
        
        # 加权求和
        context = torch.matmul(attn_probs, V)  # (batch, n_heads, seq_len, d_k)
        
        # 拼接头并线性变换
        context = context.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        output = self.W_O(context)
        
        return output, attn_probs`,
          },
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class PositionalEncoding(nn.Module):
    """正弦位置编码"""
    
    def __init__(self, d_model=512, max_len=5000, dropout=0.1):
        super().__init__()
        self.dropout = nn.Dropout(dropout)
        
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * 
                            (-math.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)  # 偶数维度用 sin
        pe[:, 1::2] = torch.cos(position * div_term)  # 奇数维度用 cos
        
        pe = pe.unsqueeze(0)  # (1, max_len, d_model)
        self.register_buffer('pe', pe)
    
    def forward(self, x):
        """x: (batch, seq_len, d_model)"""
        x = x + self.pe[:, :x.size(1), :]
        return self.dropout(x)

class TransformerBlock(nn.Module):
    """单个 Transformer 编码器块"""
    
    def __init__(self, d_model=512, n_heads=8, ff_dim=2048, dropout=0.1):
        super().__init__()
        self.self_attn = MultiHeadAttention(d_model, n_heads, dropout)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, ff_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(ff_dim, d_model),
            nn.Dropout(dropout),
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.dropout1 = nn.Dropout(dropout)
        self.dropout2 = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        """
        x: (batch, seq_len, d_model)
        """
        # 自注意力 + 残差 + 层归一化
        attn_output, _ = self.self_attn(x, x, x, mask)
        x = self.norm1(x + self.dropout1(attn_output))
        
        # FFN + 残差 + 层归一化
        ffn_output = self.ffn(x)
        x = self.norm2(x + self.dropout2(ffn_output))
        
        return x`,
          },
        ],
        table: {
          headers: ["架构", "序列建模方式", "路径长度", "并行性", "位置感知", "参数量 (典型)"],
          rows: [
            ["RNN", "循环隐藏状态传递", "O(N)", "无法并行 (时间步串行)", "隐式 (RNN 结构)", "~50M"],
            ["Seq2Seq + Attention", "循环 + 动态注意力", "O(N)", "解码器串行", "隐式", "~100M"],
            ["Transformer", "自注意力 (全连接)", "O(1)", "完全并行", "显式 (位置编码)", "~65M (Base)"],
            ["Transformer-Large", "更大 d_model, 更多头", "O(1)", "完全并行", "显式", "~213M"],
            ["ConvS2Seq", "深度卷积", "O(log N)", "完全并行", "隐式 (卷积感受野)", "~100M"],
          ],
        },
        mermaid: `graph TD
    A["输入词嵌入 + 位置编码"] --> B["Multi-Head Self-Attention"]
    B --> C["Add & Norm"]
    C --> D["Position-wise FFN"]
    D --> E["Add & Norm"]
    E --> F["输出 (batch, seq, d_model)"]
    
    B -.-> G["Q K V 投影"]
    G -.-> H["Scaled Dot-Product"]
    H -.-> I["Concat Heads"]
    I -.-> B
    class F s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d`,
        tip: "Transformer 的位置编码设计极其精妙——正弦函数的特性使得模型可以学习相对位置关系：PE(pos+k) 可以表示为 PE(pos) 的线性函数。这解释了为什么 Transformer 在训练时未见过的句子长度上也能泛化。",
        warning: "Transformer 的自注意力计算复杂度为 O(N²·d)，其中 N 是序列长度。当 N 超过 4096 时，内存和计算开销急剧增长。对于超长序列（如文档级翻译），需要使用 Sparse Attention、Linformer 或 Longformer 等变体。",
      },
      {
        title: "5. 多语言翻译：mBART 与 NLLB",
        body: `单语言对翻译模型（如英-中、英-法）在资源充足的语言对上表现优异，但全球有 7000+ 种语言，不可能为每对语言训练一个独立模型。多语言翻译（Multilingual MT）的目标是用一个模型支持多种语言间的翻译，实现语言间的知识迁移（Transfer Learning）。

mBART（Multilingual BART） 由 Facebook AI 在 2020 年提出，是一个基于 **Transformer** 的多语言预训练模型。它在 25 种语言的维基百科语料上训练了两种任务：(1) 去噪自动编码——随机遮盖部分输入词，让模型重建；(2) 文档翻译——输入一种语言的句子，输出另一种语言的翻译。mBART 预训练后，可以通过微调适配新的语言对，即使某些语言在预训练时没有出现。

NLLB（No Language Left Behind） 是 Meta 在 2022 年发布的里程碑式项目，目标是让 AI 翻译覆盖所有语言，包括大量低资源语言。NLLB-200 支持 200 种语言间的互译，使用 MoE（Mixture of Experts）架构：模型包含多个「专家」子网络，每个输入路由到最合适的几个专家，既扩大了模型容量（54B 参数），又保持了推理效率（实际使用 3-6 个专家）。

NLLB 的关键创新包括：(1) 使用 FLORES-200 基准数据集，涵盖 200 种语言的平行语料；(2) 引入语言标签作为输入前缀，告诉模型源语言和目标语言；(3) 采用迭代知识蒸馏压缩模型到 3.3B 和 1.3B 版本，使其可以在消费级 GPU 上运行。`,
        code: [
          {
            lang: "python",
            code: `from transformers import MBartForConditionalGeneration, MBart50TokenizerFast

# 加载预训练的 mBART-50 模型
model_name = "facebook/mbart-large-50-many-to-many-mmt"
model = MBartForConditionalGeneration.from_pretrained(model_name)
tokenizer = MBart50TokenizerFast.from_pretrained(model_name)

# 翻译: 英文 → 中文
text = "Machine translation has made tremendous progress."
tokenizer.src_lang = "en_XX"  # 设置源语言
encoded = tokenizer(text, return_tensors="pt")

generated_tokens = model.generate(
    **encoded,
    forced_bos_token_id=tokenizer.lang_code_to_id["zh_CN"],  # 目标语言
    max_length=50,
    num_beams=5,
)
translation = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
print(f"原文: {text}")
print(f"翻译: {translation[0]}")

# 查看支持的语言列表
print(f"\\n支持的语言数: {len(tokenizer.lang_code_to_id)}")
langs = list(tokenizer.lang_code_to_id.keys())[:10]
print(f"示例: {langs}")`,
          },
          {
            lang: "python",
            code: `# NLLB 多语言翻译实战
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# 加载 NLLB-200 精简版 (3.3B 参数)
model_name = "facebook/nllb-200-distilled-600M"  # 轻量版，600M 参数
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# 多语言翻译演示
translations = {
    ("eng_Latn", "zho_Hans"): "The quick brown fox jumps over the lazy dog.",
    ("eng_Latn", "jpn_Jpan"): "The quick brown fox jumps over the lazy dog.",
    ("eng_Latn", "spa_Latn"): "The quick brown fox jumps over the lazy dog.",
    ("eng_Latn", "fra_Latn"): "The quick brown fox jumps over the lazy dog.",
    ("eng_Latn", "ara_Arab"): "The quick brown fox jumps over the lazy dog.",
}

for (src_lang, tgt_lang), text in translations.items():
    tokenizer.src_lang = src_lang
    inputs = tokenizer(text, return_tensors="pt", padding=True)
    
    translated = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.lang_code_to_id[tgt_lang],
        max_length=50,
    )
    result = tokenizer.batch_decode(translated, skip_special_tokens=True)[0]
    print(f"{src_lang} → {tgt_lang}: {result}")

# NLLB 架构参数
print("\\n=== NLLB-200 架构 ===")
print("参数量: 54B (全尺寸) / 3.3B / 1.3B (蒸馏版)")
print("架构: Mixture of Experts (MoE)")
print("专家数: 64 个，每次激活 3-6 个")
print("支持语言: 200 种")
print("训练数据: 130 亿句平行语料")`,
          },
        ],
        table: {
          headers: ["模型", "参数量", "支持语言", "预训练语料", "架构", "发布日期"],
          rows: [
            ["mBART-50", "610M", "50 种", "CC100 + Wikipedia", "Transformer Seq2Seq", "2020"],
            ["mBART-200", "~6B", "200 种", "大规模网页语料", "Transformer Seq2Seq", "2022"],
            ["NLLB-200", "54B / 3.3B", "200 种", "130 亿句平行语料", "MoE Transformer", "2022"],
            ["M2M-100", "12B / 1.2B", "100 种", "Wikipedia + 平行语料", "Transformer", "2020"],
            ["Google MT (内部)", "未知", "133 种", "Google 内部数据", "Transformer GNMT", "持续更新"],
          ],
        },
        mermaid: `graph TD
    A["多语言平行语料"] --> B["预训练 mBART"]
    B -->|"去噪自编码"| C["理解多语言语义"]
    B -->|"翻译任务"| D["学习跨语言对齐"]
    C --> E["多语言预训练模型"]
    D --> E
    E -->|"微调"| F["英→中"]
    E -->|"微调"| G["英→日"]
    E -->|"微调"| H["法→德"]
    E -->|"零样本"| I["未见过的语言对"]
    F --> J["翻译结果"]
    G --> J
    H --> J
    I --> J`,
        tip: "多语言模型的「零样本翻译」能力令人惊叹——即使模型从未见过 A→B 的平行语料，它也可以通过 A→English→B 的隐式桥接实现翻译。但这种能力在低资源语言对上会大打折扣。",
        warning: "多语言模型存在「语言不平衡」问题——高资源语言（英语、中文）的表现远优于低资源语言。这是因为预训练语料中各语言的数据量差异巨大（英语语料可能是斯瓦希里语的 10000 倍）。选择模型时要注意目标语言的支持质量。",
      },
      {
        title: "6. 低资源语言翻译：挑战与解决方案",
        body: `全球约 7000 种语言中，只有约 100 种有足够的平行语料用于训练翻译模型。对于大多数语言（如非洲部落语言、东南亚少数民族语言），可用的平行句对可能只有几百到几千句。这就是低资源翻译（Low-Resource MT）的核心挑战。

数据稀缺的连锁反应： 低资源语言首先面临训练数据不足，导致模型无法学习准确的翻译规则。其次，低资源语言的形态学往往很复杂（如黏着语、多式综合语），需要大量数据才能捕捉词形变化。第三，低资源语言的文本通常缺乏标准化的书写系统和分词工具。

**主要解决方案**：

(1) 迁移学习（Transfer Learning）：在高资源语言对上预训练模型，然后在低资源语言对上微调。预训练阶段学习通用的翻译能力（如句法转换、对齐模式），微调阶段适配特定语言对。

(2) 多语言联合训练（Multilingual Joint Training）：将多个语言对放在同一个模型中训练，利用高资源语言对学到的表示来帮助低资源语言。这就是所谓的「正迁移」效应——但有时也会出现「负迁移」（高资源语言主导优化方向，损害低资源语言性能）。

(3) 回译（Back-Translation）：利用已有的翻译模型将低资源语言的目标语言单语数据翻译回源语言，生成伪平行语料。这是目前最有效的低资源增强方法——即使翻译模型不够好，伪数据也能显著提升 BLEU 分数。

(4) 数据增强与混合训练：通过同义词替换、词序打乱、随机删除等方式扩增训练数据。对于形态丰富的语言，还可以利用形态学规则生成词形变体。`,
        code: [
          {
            lang: "python",
            code: `# 回译（Back-Translation）生成伪平行语料
from transformers import pipeline
import json

# 步骤 1: 加载现有的反向翻译模型（目标语言 → 源语言）
# 假设我们想训练 藏语→英语 的翻译，但只有 1000 句平行语料
# 我们还有 10 万句英语单语数据

# 模拟反向翻译
def back_translate(monolingual_tgt_sentences, reverse_model_name):
    """
    回译: 将目标语言的单语数据翻译回源语言
    monolingual_tgt_sentences: 目标语言的句子列表
    reverse_model_name: 反向翻译模型 (tgt → src)
    """
    reverse_translator = pipeline(
        "translation",
        model=reverse_model_name,
        device=0  # GPU
    )
    
    pseudo_parallel = []
    for sent in monolingual_tgt_sentences:
        result = reverse_translator(sent, max_length=200)
        pseudo_src = result[0]['translation_text']
        pseudo_parallel.append({
            "src": pseudo_src,
            "tgt": sent
        })
    
    return pseudo_parallel

# 演示
monolingual_english = [
    "The weather is beautiful today.",
    "She enjoys reading books in the library.",
    "Technology is changing our lives rapidly.",
    "Children love to play in the park.",
]

print("=== 回译演示 ===")
print("原始单语数据（目标语言=英语）:")
for sent in monolingual_english:
    print(f"  EN: {sent}")

# 伪平行语料（源语言由模型生成）
# 实际使用中需要调用真实翻译模型
print("\\n伪平行语料 (模拟回译结果):")
for i, sent in enumerate(monolingual_english):
    # 这里用简单替换模拟反向翻译
    pseudo_src = f"[反向翻译结果{i+1}]"
    print(f"  SRC: {pseudo_src} → EN: {sent}")

print(f"\\n回译生成了 {len(monolingual_english)} 条伪平行语料")
print("可以与真实平行语料混合训练，大幅提升低资源翻译质量")`,
          },
          {
            lang: "python",
            code: `# 低资源翻译的训练策略对比
import torch
import torch.nn as nn

print("=== 低资源翻译策略对比 ===\\n")

# 策略 1: 直接从零训练 (Zero-Shot)
print("策略 1: 从零训练 (Baseline)")
print("  数据: 1000 句平行语料")
print("  模型: Transformer Base (65M 参数)")
print("  预期 BLEU: 8-12")
print("  问题: 严重过拟合，欠拟合同时存在")

# 策略 2: 迁移学习 (Transfer Learning)
print("\\n策略 2: 迁移学习")
print("  步骤 1: 英-法 (100M 句) 预训练")
print("  步骤 2: 英-藏 (1K 句) 微调")
print("  预期 BLEU: 15-20")
print("  优势: 翻译能力迁移，只需适配语言对特定部分")

# 策略 3: 多语言联合训练
print("\\n策略 3: 多语言联合训练")
print("  数据: 英-法(100M) + 英-中(50M) + 英-藏(1K) 混合")
print("  模型: 共享编码器 + 语言特定嵌入")
print("  预期 BLEU: 18-25")
print("  优势: 正迁移，高资源语言帮助低资源语言学习")

# 策略 4: 回译增强 + 联合训练
print("\\n策略 4: 回译 + 联合训练 (最优)")
print("  步骤 1: 英→藏 模型回译 100K 藏语句 → 伪英句")
print("  步骤 2: 伪平行数据(100K) + 真实平行数据(1K) 混合")
print("  步骤 3: 多语言联合训练")
print("  预期 BLEU: 25-32")
print("  优势: 伪数据扩大训练规模，联合训练稳定学习")

# 模拟训练数据量对比
print("\\n=== 训练数据量对比 ===")
strategies = {
    "从零训练": 1_000,
    "迁移学习": 1_000 + 100_000_000,  # 预训练 + 微调
    "多语言联合": 1_000 + 50_000_000,  # 低资源 + 高资源混合
    "回译+联合": 1_000 + 100_000 + 50_000_000,  # 真实 + 伪 + 高资源
}
for name, count in strategies.items():
    print(f"  {name}: {count:,} 句")`,
          },
        ],
        table: {
          headers: ["策略", "所需数据", "预期 BLEU 增益", "计算开销", "实现难度"],
          rows: [
            ["从零训练", "仅低资源平行语料", "基准 (0)", "低", "低"],
            ["迁移学习", "高资源预训练 + 低资源微调", "+5-8", "中", "中"],
            ["多语言联合训练", "多语言平行语料混合", "+8-12", "中-高", "中-高"],
            ["回译增强", "低资源单语数据", "+10-15", "中", "中"],
            ["回译 + 联合训练", "单语 + 多语言语料", "+15-20", "高", "高"],
          ],
        },
        mermaid: `graph TD
    A["低资源语言对
(1K 句平行语料)"] --> B{"增强策略?"}
    B -->|"迁移学习"| C["高资源预训练模型"]
    B -->|"回译"| D["目标语言单语数据
(100K 句)"]
    B -->|"数据增强"| E["同义词替换 / 词序变换"]
    C --> F["微调低资源语言对"]
    D --> G["反向翻译生成伪平行数据"]
    G --> F
    E --> F
    F --> H["混合训练"]
    H --> I["低资源翻译模型"]
    class I s1
    class A s0
    classDef s0 fill:#7f1d1d
    classDef s1 fill:#14532d`,
        tip: "回译是性价比最高的低资源增强方法——目标语言的单语数据通常比平行语料容易获取 100 倍以上。即使反向翻译模型质量不高，回译生成的伪数据也能提供显著的 BLEU 增益（通常 +5-10）。",
        warning: "回译的核心风险是「错误累积」——如果反向翻译模型质量差，生成的伪平行语料中会有很多错误翻译。这些错误数据会让正向翻译模型学到错误的映射关系。解决方案：(1) 使用 beam search 而非 greedy 解码生成更高质量的伪数据；(2) 对伪数据置信度打分，只保留高质量样本。",
      },
      {
        title: "7. HuggingFace 实战：训练翻译模型",
        body: `**HuggingFace** 的 **Transformer**s 库和 Trainer API 让训练机器翻译模型变得异常简单。本节从零开始，使用 MarianMT（Helsinki-NLP 在 Marian 框架上训练的大量双语翻译模型）作为基座，演示完整的翻译模型训练流程。

MarianMT 是 **HuggingFace** 上最受欢迎的开源翻译模型之一，覆盖了 2000+ 语言对。它本质上是一个 **Transformer** 编码器-解码器模型，在大规模平行语料上预训练。对于没有预训练模型的语言对，我们可以用 Marian 框架从头训练；对于有预训练模型但质量不够的语言对，我们可以用 Trainer API 进行微调。

**训练流程**： (1) 加载数据集——使用 HuggingFace Datasets 库加载平行语料（如 TED Talks、WMT）；(2) 预处理——分词（tokenization）、创建 attention mask、构建 label（带 -100 填充以忽略 pad token 的损失）；(3) 配置训练参数——学习率、batch size、梯度累积、早停；(4) 训练与评估——使用 seq2seq_trainer 和 compute_metrics 回调函数实时计算 BLEU 分数；(5) 模型导出——保存为 ONNX 格式或部署到 HuggingFace Hub。

**关键技巧**： 学习率预热（Warmup）对 Transformer 训练至关重要——先用较小的学习率（如 1e-7）训练几个 step，然后线性增长到目标学习率（如 3e-4），最后衰减。这避免了训练初期的梯度爆炸和不稳定。梯度累积（Gradient Accumulation）则允许在小显存 GPU 上模拟大 batch size 训练。`,
        code: [
          {
            lang: "python",
            code: `# HuggingFace 翻译模型微调实战
from datasets import load_dataset
from transformers import (
    AutoTokenizer, AutoModelForSeq2SeqLM,
    DataCollatorForSeq2Seq, Seq2SeqTrainingArguments,
    Seq2SeqTrainer
)
import evaluate
import numpy as np

# 1. 加载预训练模型和分词器
model_name = "Helsinki-NLP/opus-mt-en-zh"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# 2. 加载自定义平行语料 (模拟 TED Talks 格式)
# 实际使用: dataset = load_dataset("ted_talks", "en-zh")
raw_datasets = {
    "train": {
        "translation": [
            {"en": "Hello, how are you?", "zh": "你好，你好吗？"},
            {"en": "The weather is nice today.", "zh": "今天天气很好。"},
        ]
    },
    "validation": {
        "translation": [
            {"en": "Thank you very much.", "zh": "非常感谢。"},
        ]
    }
}

# 3. 预处理函数
max_input_length = 128
max_target_length = 128
source_lang = "en"
target_lang = "zh"

def preprocess_function(examples):
    inputs = [ex[source_lang] for ex in examples["translation"]]
    targets = [ex[target_lang] for ex in examples["translation"]]
    
    model_inputs = tokenizer(
        inputs, max_length=max_input_length,
        truncation=True, padding="max_length"
    )
    
    # 目标序列也需要分词
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(
            targets, max_length=max_target_length,
            truncation=True, padding="max_length"
        )
    
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

# 4. 应用预处理
# tokenized_datasets = raw_datasets.map(preprocess_function, batched=True)

print("=== 数据预处理示例 ===")
sample = {"translation": [{"en": "Machine translation is amazing.", "zh": "机器翻译太棒了。"}]}
tokenized = preprocess_function(sample)
print(f"输入 token_ids: {tokenized['input_ids'][:10]}...")
print(f"标签 token_ids: {tokenized['labels'][:10]}...")
print(f"Attention mask:  {tokenized['attention_mask'][:10]}...")`,
          },
          {
            lang: "python",
            code: `# 训练配置与执行
from transformers import Seq2SeqTrainingArguments, Seq2SeqTrainer
import evaluate

# 加载 BLEU 评估指标
bleu = evaluate.load("sacrebleu")

def compute_metrics(eval_preds):
    """评估时计算 BLEU 分数"""
    preds, labels = eval_preds
    
    # 将 token IDs 解码为文本
    decoded_preds = tokenizer.batch_decode(preds, skip_special_tokens=True)
    
    # 替换 labels 中的 -100 (pad token 忽略)
    labels = np.where(labels != -100, labels, tokenizer.pad_token_id)
    decoded_labels = tokenizer.batch_decode(labels, skip_special_tokens=True)
    
    # 计算 BLEU
    result = bleu.compute(
        predictions=decoded_preds,
        references=[[label] for label in decoded_labels]
    )
    return {"bleu": result["score"]}

# 训练配置
training_args = Seq2SeqTrainingArguments(
    output_dir="./translation-model",
    eval_strategy="epoch",
    learning_rate=3e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    weight_decay=0.01,
    save_total_limit=3,
    num_train_epochs=10,
    predict_with_generate=True,
    fp16=True,  # 混合精度训练加速
    gradient_accumulation_steps=4,  # 模拟 batch_size=64
    warmup_ratio=0.1,  # 学习率预热
    save_strategy="epoch",
    logging_steps=50,
    load_best_model_at_end=True,
    metric_for_best_model="bleu",
    greater_is_better=True,
)

print("=== 训练配置 ===")
print(f"输出目录: {training_args.output_dir}")
print(f"学习率: {training_args.learning_rate}")
print(f"每设备 batch: {training_args.per_device_train_batch_size}")
print(f"梯度累积: {training_args.gradient_accumulation_steps}")
print(f"等效 batch: {training_args.per_device_train_batch_size * training_args.gradient_accumulation_steps}")
print(f"训练轮数: {training_args.num_train_epochs}")
print(f"预热比例: {training_args.warmup_ratio}")
print(f"混合精度: {training_args.fp16}")
print(f"早停: {training_args.load_best_model_at_end}")

# 数据收集器（自动处理 padding）
data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

# 初始化 Trainer
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset="tokenized_train",
    eval_dataset="tokenized_val",
    tokenizer=tokenizer,
    data_collator=data_collator,
    compute_metrics=compute_metrics,
)

# 开始训练
# trainer.train()
print("\\n调用 trainer.train() 开始训练")
print("训练完成后调用 trainer.save_model('./final-model') 保存")`,
          },
        ],
        table: {
          headers: ["超参数", "推荐值", "说明", "调优方向"],
          rows: [
            ["learning_rate", "3e-5 ~ 5e-5", "Transformer 微调", "↓ 过拟合时减小"],
            ["batch_size", "16-32 (每设备)", "大 batch 稳定但显存高", "↑ 显存足够时增大"],
            ["gradient_accumulation", "2-4", "模拟大 batch", "↑ 小显存 GPU 时增大"],
            ["num_train_epochs", "5-10", "翻译模型收敛较快", "↓ 验证 BLEU 不再提升时停止"],
            ["warmup_ratio", "0.05-0.15", "学习率预热", "↓ 大数据集时减小"],
            ["weight_decay", "0.01", "防止过拟合", "↑ 过拟合时增大"],
            ["max_length", "128-256", "序列截断长度", "↑ 长句子翻译时增大"],
          ],
        },
        mermaid: `graph TD
    A["平行语料
(en-zh)"] --> B["加载数据集"]
    B --> C["分词预处理
Tokenize"]
    C --> D["创建 DataCollator
动态 Padding"]
    D --> E["配置 TrainingArguments
学习率/Batch/Epoch"]
    E --> F["Seq2SeqTrainer
训练循环"]
    F --> G["评估: 计算 BLEU"]
    G --> H{"验证 BLEU
提升?"}
    H -->|"是"| F
    H -->|"否"| I["保存最佳模型"]
    I --> J["导出 ONNX / 推送到 Hub"]
    J --> K["部署推理服务"]
    class K s3
    class I s2
    class F s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87`,
        tip: "训练翻译模型时，先用小规模数据（1000 句）跑通整个 pipeline，确认 loss 正常下降、BLEU 分数有意义，再用全量数据训练。这可以节省大量调试时间。",
        warning: "翻译模型微调时最容易犯的错是：(1) 忘记使用 as_target_tokenizer() 上下文管理器——不同语言的分词器可能不同；(2) 评估时没有将 label 中的 -100 替换为 pad_token_id——这会导致解码错误；(3) 训练和推理时使用不同的分词器——确保预处理和推理的分词配置完全一致。",
      },
    ],
};
