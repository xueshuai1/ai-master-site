import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-011",
    title: "注意力机制：从 Seq2Seq 到 Transformer",
    category: "dl",
    tags: ["注意力机制", "Seq2Seq", "Transformer", "自注意力"],
    summary: "从 Seq2Seq 的编码器-解码器范式到自注意力机制，再到 Transformer 架构的完整演进，理解注意力如何成为现代深度学习的核心组件",
    date: "2026-05-16",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. 为什么需要注意力机制：传统序列模型的瓶颈",
            body: `在注意力机制出现之前，循环神经网络（RNN）及其变体 LSTM、GRU 是处理序列数据的标准工具。RNN 的核心思想是按时间步依次处理输入，每一步的隐藏状态编码了之前所有信息。这种顺序处理范式在短序列上表现不错，但当序列长度增加时，暴露出两个致命瓶颈。

第一个瓶颈是长距离依赖丢失。理论上 LSTM 的门控机制可以保留远距离信息，但实践中，当序列超过 50 个 token 时，早期信息在隐藏状态中的信号强度急剧衰减。信息瓶颈的本质是：一个固定维度的向量（比如 512 维）无法无损压缩任意长度的序列——就像试图用 512 个字概括一整本书，必然丢失大量细节。

第二个瓶颈是无法并行计算。RNN 的第 t 步必须等待第 t-1 步的隐藏状态输出，这意味着序列长度为 N 的任务至少需要 N 次串行计算。在 GPU 高度并行化的时代，这种串行依赖让训练效率远低于 CNN 等可并行架构。即使序列只有 100 个 token，RNN 也需要 100 次矩阵乘法，而 CNN 可以用几层卷积在常数时间内完成。

注意力机制的直觉其实很简单：人类阅读时不会记住整句话再去理解每个词，而是对每个词分配不同的关注度。理解「银行」时，如果上下文中出现「存款」，你会关注金融相关词；如果出现「河岸」，你会关注地理相关词。这种动态聚焦能力正是 RNN 所缺乏的——它用一个固定向量表示全部上下文，无法根据当前解码位置调整关注重点。

注意力机制的革命性在于：它用可计算的权重分布替代了固定长度的上下文向量，让模型在每一步都能「重新看一遍」完整的输入序列，并根据需要为每个输入位置分配不同的注意力分数。这彻底打破了信息瓶颈，也开启了现代 NLP 的新纪元。`,
            mermaid: `graph TD
    A["传统 RNN/LSTM"] -->|"固定维度隐藏状态"| B["信息瓶颈"]
    B --> C["长距离信息丢失"]
    B --> D["序列越长压缩损失越大"]
    E["注意力机制"] -->|"动态权重分布"| F["每步重新关注完整序列"]
    F --> G["突破信息瓶颈"]
    F --> H["可解释的权重分配"]
    class G s1
    class C s2
    classDef s0 fill:#14532d
    classDef s1 fill:#14532d
    classDef s2 fill:#7f1d1d`,
            tip: "理解注意力机制的最佳方式是先感受 RNN 的局限性：用一个 512 维向量编码一篇 3000 字的文章摘要，然后尝试从中还原第 1 段的第 3 句话——你会发现信息已经严重压缩失真。注意力机制就是让模型在需要时能「重新阅读原文」。",
            warning: "不要将注意力机制理解为 RNN 的简单改进。它是一个完全不同的信息访问范式：RNN 是「一次性编码，逐步解码」，注意力是「全程可见，按需读取」。这种范式转换是理解后续所有 Transformer 变体的关键。",
        },
        {
            title: "2. Seq2Seq 架构回顾：编码器-解码器范式",
            body: `Seq2Seq（Sequence-to-Sequence）架构由 Sutskever 等人在 2014 年提出，是机器翻译任务的奠基性工作。其核心思想是将一个输入序列映射到一个输出序列，通过两个 RNN 组件的协作实现：编码器（Encoder）将输入序列压缩为一个上下文向量（Context Vector），解码器（Decoder）基于该向量逐步生成输出序列。

编码器的工作原理是：依次读取输入序列的每个 token，每读一个 token 就更新一次隐藏状态。当最后一个 token 处理完毕后，最终的隐藏状态（或一个特殊的 <EOS> 标记对应的状态）就成为了整个输入序列的语义摘要。这个摘要向量的维度通常与隐藏状态维度一致（如 512 或 1024）。

解码器的工作方式类似但方向相反：它以编码器输出的上下文向量作为初始隐藏状态，然后自回归地生成输出序列的每个 token。每个时间步，解码器接收上一个时间步生成的 token 作为输入，产生一个新的隐藏状态，再通过一个softmax 层预测下一个 token 的概率分布。在训练阶段，解码器的输入是教师强制（Teacher Forcing）——直接使用真实的目标序列；在推理阶段，输入是解码器自己上一步的生成结果。

编码器-解码器范式的优雅之处在于其通用性：只要输入和输出都是序列，就可以用同一套架构处理机器翻译、文本摘要、语音识别、对话生成等多种任务。然而，这种范式有一个根本性缺陷：编码器必须把所有输入信息压缩进一个固定维度的向量中。对于长度为 10 的句子这可能够用，但对于长度为 100 甚至 1000 的序列，信息压缩损失变得不可接受。

Bahdanau 注意力（2015）是第一个针对这一缺陷的改进方案。它不再让解码器只依赖单一的上下文向量，而是让解码器在每个时间步都能重新关注编码器的所有隐藏状态，并通过一个注意力模型（一个小型前馈网络）计算每个编码器隐藏状态的权重。这是注意力机制的首次亮相，也为后续的自注意力和 Transformer 铺平了道路。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class SimpleEncoder(nn.Module):
    """基于 LSTM 的编码器"""
    def __init__(self, vocab_size, embed_dim, hidden_dim, n_layers=2):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, n_layers,
                           dropout=0.3, batch_first=True)

    def forward(self, src):
        # src: (batch, seq_len)
        embedded = self.embedding(src)  # (batch, seq_len, embed_dim)
        outputs, (hidden, cell) = self.lstm(embedded)
        # outputs: (batch, seq_len, hidden_dim) — 所有时间步的隐藏状态
        # hidden: (n_layers, batch, hidden_dim) — 最终隐藏状态
        return outputs, hidden, cell`
                },
                {
                    lang: "python",
                    code: `class Seq2Seq(nn.Module):
    """完整的 Seq2Seq 模型"""
    def __init__(self, encoder, decoder):
        super().__init__()
        self.encoder = encoder
        self.decoder = decoder

    def forward(self, src, trg, teacher_forcing_ratio=0.5):
        # src: (batch, src_len), trg: (batch, trg_len)
        encoder_outputs, hidden, cell = self.encoder(src)
        outputs = self.decoder(trg, hidden, cell, encoder_outputs,
                              teacher_forcing_ratio)
        return outputs

# 使用示例
enc = SimpleEncoder(vocab_size=10000, embed_dim=256, hidden_dim=512)
dec = SimpleDecoder(vocab_size=10000, embed_dim=256, hidden_dim=512)
model = Seq2Seq(enc, dec)

src = torch.randint(1, 10000, (32, 20))   # batch=32, seq_len=20
trg = torch.randint(1, 10000, (32, 25))   # batch=32, seq_len=25
output = model(src, trg)
print(f"输出形状: {output.shape}")  # (32, 25, 10000)`
                }
            ],
            mermaid: `graph LR
    A["输入序列"] --> B["编码器 LSTM"]
    B -->|"逐 token 编码"| C["隐藏状态序列"]
    C --> D["最终隐藏状态
上下文向量"]
    D --> E["解码器 LSTM"]
    E -->|"自回归生成"| F["输出序列"]
    C -.->|"Bahdanau 注意力"| E
    class F s0
    classDef s0 fill:#14532d`,
            tip: "调试 Seq2Seq 模型时，检查编码器输出的隐藏状态序列的范数变化。如果范数随序列长度快速衰减，说明长距离信息正在丢失——这正是注意力机制要解决的问题。",
            warning: "Seq2Seq 的固定维度上下文向量是信息瓶颈的根源。当输入序列长度超过隐藏维度时（如 200 token 压缩到 512 维），必然发生信息损失。不要试图通过单纯增大隐藏维度来解决——这会增加计算成本且效果有限，应该直接引入注意力机制。",
        },
        {
            title: "3. 注意力机制的数学原理：Query-Key-Value 范式",
            body: `注意力机制的数学本质是一个软查找（Soft Lookup）操作：给定一个查询（Query），从一组键-值对（Key-Value Pairs）中检索相关信息，并以加权求和的方式返回结果。这个范式由三个核心张量构成：Query（查询向量，通常来自解码器当前状态）、Key（键向量，通常来自编码器的隐藏状态）、Value（值向量，通常也来自编码器）。

缩放点积注意力（Scaled Dot-Product Attention）是最经典的注意力计算方式。给定 Query 矩阵 Q（形状为 n_q × d_k）、Key 矩阵 K（形状为 n_k × d_k）和 Value 矩阵 V（形状为 n_k × d_v），注意力输出按以下公式计算：

首先计算 Q 和 K 的点积相似度，得到一个 n_q × n_k 的注意力分数矩阵。点积衡量了 Query 和每个 Key 的方向一致性——当两个向量方向接近时点积较大，方向垂直时接近零，方向相反时为负。然后除以缩放因子 sqrt(d_k)，这一步至关重要：当 d_k 较大时，点积的方差会放大到 sqrt(d_k) 级别，导致 softmax 函数的输入进入饱和区（极大或极小的值），使得梯度几乎为零。缩放因子将点积的方差重新归一化到 1 附近，确保 softmax 的梯度信号健康。

接下来对缩放后的分数矩阵应用 softmax 函数，沿着 Key 的维度（即最后一个维度）进行归一化。softmax 将任意实数映射到 (0, 1) 区间，且每行的和为 1，这就得到了一个概率分布——每个 Key 对应一个注意力权重。最后，用这个权重分布对 Value 矩阵进行加权求和，得到最终的注意力输出。

注意力的物理意义可以这样理解：Query 是一个「问题」，Key 是「目录索引」，Value 是「实际内容」。模型先在目录中查找与问题最相关的条目（Q·K 点积），然后根据相关性打分（softmax），最后按分数提取对应的内容（加权求和 V）。整个过程是完全可微的，可以通过标准的反向传播进行端到端训练。

注意力机制的计算复杂度为 O(n² · d)，其中 n 是序列长度，d 是特征维度。这是因为 Q 和 K 的点积产生了 n × n 的注意力矩阵。对于中等长度的序列（n < 512），这个复杂度完全可以接受；但对于超长序列（n > 10000），就需要引入稀疏注意力、线性注意力或分块注意力等优化方案。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import math

def scaled_dot_product_attention(Q, K, V, mask=None):
    """缩放点积注意力的纯 PyTorch 实现
    
    Args:
        Q: (batch, n_q, d_k) 查询矩阵
        K: (batch, n_k, d_k) 键矩阵
        V: (batch, n_k, d_v) 值矩阵
        mask: 可选的掩码矩阵，屏蔽不需要关注的位置
    
    Returns:
        output: (batch, n_q, d_v) 注意力输出
        weights: (batch, n_q, n_k) 注意力权重（可用于可视化）
    """
    d_k = Q.size(-1)
    
    # 1. 计算点积相似度: Q · K^T
    scores = torch.matmul(Q, K.transpose(-2, -1))
    # scores shape: (batch, n_q, n_k)
    
    # 2. 缩放: 除以 sqrt(d_k)
    scores = scores / math.sqrt(d_k)
    
    # 3. 应用掩码（如果有）
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    
    # 4. softmax 归一化
    weights = torch.softmax(scores, dim=-1)
    # weights shape: (batch, n_q, n_k)
    
    # 5. 加权求和
    output = torch.matmul(weights, V)
    # output shape: (batch, n_q, d_v)
    
    return output, weights`
                },
                {
                    lang: "python",
                    code: `# 缩放因子的必要性演示
import torch
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

d_k_values = [16, 64, 256, 1024]
for d_k in d_k_values:
    Q = torch.randn(1, 1, d_k)
    K = torch.randn(1, 10, d_k)
    
    # 未缩放的点积
    raw_scores = torch.matmul(Q, K.transpose(-2, -1))
    print(f"d_k={d_k:4d}: 未缩放 scores 均值={raw_scores.mean():.2f}, "
          f"标准差={raw_scores.std():.2f}")
    
    # 缩放后的点积
    scaled_scores = raw_scores / math.sqrt(d_k)
    print(f"         缩放后 scores 均值={scaled_scores.mean():.2f}, "
          f"标准差={scaled_scores.std():.2f}")
    
    # softmax 后的熵（衡量分布的均匀程度）
    raw_weights = torch.softmax(raw_scores, dim=-1)
    scaled_weights = torch.softmax(scaled_scores, dim=-1)
    
    raw_entropy = -(raw_weights * (raw_weights + 1e-10).log()).sum().item()
    scaled_entropy = -(scaled_weights * (scaled_weights + 1e-10).log()).sum().item()
    
    print(f"         未缩放 softmax 熵: {raw_entropy:.4f}")
    print(f"         缩放后 softmax 熵: {scaled_entropy:.4f}")
    print()`
                }
            ],
            table: {
                headers: ["组件", "形状", "来源", "作用"],
                rows: [
                    ["Query (Q)", "(batch, n_q, d_k)", "解码器当前状态", "要查找什么"],
                    ["Key (K)", "(batch, n_k, d_k)", "编码器隐藏状态", "可以被查到的索引"],
                    ["Value (V)", "(batch, n_k, d_v)", "编码器隐藏状态", "实际要提取的内容"],
                    ["Attention Weights", "(batch, n_q, n_k)", "softmax(Q·K^T/sqrt(d_k))", "相关性分布"],
                    ["Output", "(batch, n_q, d_v)", "Weights·V", "加权聚合结果"],
                ],
            },
            mermaid: `graph TD
    A["Query Q"] --> C["点积 Q·K^T"]
    B["Key K"] --> C
    C --> D["缩放 /sqrt(d_k)"]
    D --> E["softmax 归一化"]
    E --> F["注意力权重矩阵"]
    F --> G["加权求和"]
    V["Value V"] --> G
    G --> H["注意力输出"]
    class H s0
    classDef s0 fill:#14532d`,
            tip: "调试注意力权重时，打印 softmax 后的权重分布矩阵。如果某一行几乎只有一个位置权重接近 1、其余接近 0（one-hot 分布），说明模型在「硬选择」，这可能导致梯度消失。健康的注意力权重应该有适度的熵值——不是完全均匀，也不是极端稀疏。",
            warning: "缩放因子 sqrt(d_k) 绝不是可有可无的细节。当 d_k = 512 时，未缩放的点积标准差约为 sqrt(512) ≈ 22.6，softmax 的输入会进入极端饱和区，梯度几乎为零。务必确保缩放因子使用 d_k（Key 的维度）而不是 d_v（Value 的维度）或 d_model（模型维度）。",
        },
        {
            title: "4. 自注意力（Self-Attention）：序列内部的注意力计算",
            body: `自注意力（Self-Attention）是注意力机制的一个特殊形式：Query、Key、Value 全部来自同一个序列。换句话说，序列中的每个元素都「关注」序列中的所有其他元素（包括自身），从而捕获序列内部的全局依赖关系。这是自注意力与交叉注意力（Cross-Attention，Query 和 Key/Value 来自不同序列，如编码器-解码器之间的注意力）的根本区别。

自注意力的计算过程可以用一句话概括：序列中的每个 token 为序列中的每个 token（包括自己）生成一个相关性分数，然后根据这些分数对所有 token 的信息进行加权聚合。以一个 5 个 token 的句子为例：第 1 个 token 的 Query 会与所有 5 个 token 的 Key 做点积，得到 5 个注意力分数，然后用这 5 个分数对 5 个 token 的 Value 加权求和，得到第 1 个 token 的自注意力输出。这个过程对 5 个 token 并行执行，最终得到 5 个输出向量。

QKV 线性变换是自注意力的第一步。输入序列 X（形状为 n × d_model）经过三个独立的线性投影层（Linear Projection）分别生成 Q、K、V：Q = X · W_Q，K = X · W_K，V = X · W_V。这三个权重矩阵 W_Q、W_K、W_V 的形状都是 d_model × d_k，它们的参数在训练中学习得到。这三个投影赋予了模型灵活定义「什么算相关」的能力——W_Q 决定了如何提取查询特征，W_K 决定了如何提取键特征，W_V 决定了如何提取值特征。

多头注意力（Multi-Head Attention）是自注意力的核心增强。它将 d_model 维的特征空间拆分为 h 个子空间（每个子空间维度为 d_k = d_model / h），在每个子空间中独立计算注意力，然后将 h 个结果拼接（Concat）后再通过一个输出投影层（Output Projection）W_O。多头机制让模型能够在不同子空间中关注不同类型的关系——比如一个头关注句法依赖（动词和宾语的关系），另一个头关注语义关联（同义词之间的呼应），第三个头关注位置邻近（相邻 token 的局部关系）。

自注意力的一个关键优势是并行计算效率。与 RNN 的 O(n) 串行步骤不同，自注意力的所有 n² 个注意力分数可以同时计算（通过矩阵乘法），所有 n 个输出向量也可以同时生成。在 GPU 上，这意味着自注意力的实际运行时间几乎是常数（受限于矩阵乘法的吞吐量），而 RNN 的运行时间随序列长度线性增长。对于长度为 512 的序列，自注意力的训练速度通常是 RNN 的 10 倍以上。

然而，自注意力也有一个根本性缺陷：它不包含任何位置信息。由于自注意力对输入序列的排列是置换不变（Permutation Invariant）的——也就是说，打乱输入 token 的顺序不会改变输出的集合（只改变输出的顺序）——模型无法区分「我吃饭」和「饭吃我」这种词序不同的句子。位置编码（Positional Encoding）就是为了解决这个问题而引入的。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import math

class MultiHeadSelfAttention(nn.Module):
    """多头自注意力的完整实现"""
    def __init__(self, d_model=512, n_heads=8, dropout=0.1):
        super().__init__()
        assert d_model % n_heads == 0, "d_model 必须能被 n_heads 整除"
        
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads  # 每个头的维度
        
        # Q, K, V 的线性投影
        self.W_Q = nn.Linear(d_model, d_model)
        self.W_K = nn.Linear(d_model, d_model)
        self.W_V = nn.Linear(d_model, d_model)
        self.W_O = nn.Linear(d_model, d_model)  # 输出投影
        
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        batch_size, seq_len, _ = x.size()
        
        # 1. 线性投影 + 多头拆分
        Q = self.W_Q(x).view(batch_size, seq_len, self.n_heads, self.d_k)
        K = self.W_K(x).view(batch_size, seq_len, self.n_heads, self.d_k)
        V = self.W_V(x).view(batch_size, seq_len, self.n_heads, self.d_k)
        
        # transpose: (batch, n_heads, seq_len, d_k)
        Q = Q.transpose(1, 2)
        K = K.transpose(1, 2)
        V = V.transpose(1, 2)
        
        # 2. 缩放点积注意力
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        weights = torch.softmax(scores, dim=-1)
        weights = self.dropout(weights)
        
        # 3. 加权求和
        context = torch.matmul(weights, V)
        
        # 4. 多头拼接 + 输出投影
        context = context.transpose(1, 2).contiguous()
        context = context.view(batch_size, seq_len, self.d_model)
        output = self.W_O(context)
        
        return output, weights`
                }
            ],
            table: {
                headers: ["特性", "RNN", "CNN", "自注意力"],
                rows: [
                    ["计算复杂度", "O(n · d²)", "O(k · n · d²)", "O(n² · d)"],
                    ["并行性", "不可并行", "完全并行", "完全并行"],
                    ["最长路径", "O(n)", "O(n/k)", "O(1)"],
                    ["全局依赖", "弱（需多步传递）", "中（需多层叠加）", "强（直接建模）"],
                    ["位置感知", "天然有序", "需位置编码", "需位置编码"],
                    ["典型 n 上限", "~100", "~10000", "~4096"],
                ],
            },
            mermaid: `graph TD
    A["输入序列 X"] --> B["线性投影 W_Q"]
    A --> C["线性投影 W_K"]
    A --> D["线性投影 W_V"]
    B --> E["Query 多头拆分"]
    C --> F["Key 多头拆分"]
    D --> G["Value 多头拆分"]
    E --> H["缩放点积注意力"]
    F --> H
    G --> I["加权求和"]
    H --> I
    I --> J["多头拼接"]
    J --> K["输出投影 W_O"]
    K --> L["自注意力输出"]
    class L s0
    classDef s0 fill:#14532d`,
            tip: "多头注意力的头数选择：8 头是常见的默认值（d_model=512 时每头 64 维）。增加头数可以提升模型的表达能力，但每头的维度会减小——当 d_k < 32 时，每个头的表示能力会显著下降。经验法则是确保 d_k ≥ 64。",
            warning: "自注意力的 O(n²) 空间复杂度是其主要瓶颈。当序列长度为 4096、d_model=512 时，注意力矩阵需要 4096 × 4096 × 4 字节 ≈ 67MB（单精度），对于 batch_size=64 的情况就是 4.3GB。对于超长序列，务必考虑使用 Flash Attention 等优化实现。",
        },
        {
            title: "5. Transformer 架构详解：编码器-解码器的全新实现",
            body: `Transformer 架构由 Vaswani 等人在 2017 年的论文《Attention Is All You Need》中提出，彻底摒弃了 RNN 和 CNN，完全基于自注意力机制构建。Transformer 由两个核心组件堆叠而成：编码器堆栈（Encoder Stack）和解码器堆栈（Decoder Stack），每个堆栈包含 N 个相同的层（原始论文中 N=6）。

编码器由 N 个完全相同的编码器层组成。每个编码器层包含两个子层：多头自注意力层（Multi-Head Self-Attention）和前馈神经网络（Feed-Forward Network, FFN）。每个子层都采用了残差连接（Residual Connection）和层归一化（Layer Normalization）。残差连接的公式是：Output = LayerNorm(x + Sublayer(x))——这就是所谓的 Pre-LN 结构。残差连接确保了梯度可以直接流过整个网络，即使子层的梯度为零，梯度信号也不会完全阻断。层归一化将每个样本的特征归一化为零均值和单位方差，加速训练并提高数值稳定性。

前馈神经网络是一个简单的两层全连接网络，中间经过 ReLU 激活函数。其结构为：FFN(x) = ReLU(x · W_1 + b_1) · W_2 + b_2。值得注意的是，FFN 的中间维度（d_ff）通常是 d_model 的 4 倍（如 d_model=512 时 d_ff=2048）。这个扩展维度让 FFN 有足够的容量进行复杂的非线性变换，然后再投影回 d_model 维度。FFN 对序列中的每个位置独立且相同地应用——不同位置之间没有信息交换，信息混合完全由自注意力层负责。

解码器的结构与编码器类似，但增加了一个关键组件：掩码多头自注意力层（Masked Multi-Head Self-Attention）。掩码的作用是在训练时防止解码器「偷看」未来的 token——在自回归生成中，第 t 步只能看到第 1 到 t-1 步的 token，不能看到 t 及之后的 token。掩码通过将未来位置的注意力分数设置为 -∞（实践中是 -1e9），使得 softmax 后这些位置的权重变为零，从而实现了因果约束（Causal Constraint）。

解码器的第二个子层是交叉注意力层（Cross-Attention），其中 Query 来自解码器的上一个子层输出，而 Key 和 Value 来自编码器的最终输出。这使得解码器在生成每个 token 时都能关注输入序列的所有位置，实现了编码器-解码器之间的信息传递。解码器的第三个子层是前馈网络，与编码器中的 FFN 完全相同。

Transformer 的训练使用标签平滑（Label Smoothing）和 Adam 优化器配合学习率预热（Warmup）。原始论文使用的学习率调度策略是：前 warmup_steps 步线性增长到峰值，然后按 1/sqrt(step) 衰减。这种预热-衰减策略对 Transformer 的稳定训练至关重要——学习率初始值太大会导致训练初期梯度爆炸，而预热让模型先在小步幅下找到合适的方向，再逐步放大学习率。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class EncoderLayer(nn.Module):
    """Transformer 编码器层"""
    def __init__(self, d_model=512, n_heads=8, d_ff=2048, dropout=0.1):
        super().__init__()
        self.self_attn = MultiHeadSelfAttention(d_model, n_heads, dropout)
        self.feed_forward = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Linear(d_ff, d_model),
            nn.Dropout(dropout),
        )
        self.layer_norm1 = nn.LayerNorm(d_model)
        self.layer_norm2 = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        # 子层1: 多头自注意力 + 残差 + LayerNorm
        attn_out, _ = self.self_attn(x, mask)
        x = self.layer_norm1(x + self.dropout(attn_out))
        # 子层2: 前馈网络 + 残差 + LayerNorm
        ff_out = self.feed_forward(x)
        x = self.layer_norm2(x + self.dropout(ff_out))
        return x


class DecoderLayer(nn.Module):
    """Transformer 解码器层"""
    def __init__(self, d_model=512, n_heads=8, d_ff=2048, dropout=0.1):
        super().__init__()
        self.masked_self_attn = MultiHeadSelfAttention(d_model, n_heads, dropout)
        self.cross_attn = MultiHeadSelfAttention(d_model, n_heads, dropout)
        self.feed_forward = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Linear(d_ff, d_model),
            nn.Dropout(dropout),
        )
        self.layer_norm1 = nn.LayerNorm(d_model)
        self.layer_norm2 = nn.LayerNorm(d_model)
        self.layer_norm3 = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, enc_output, src_mask=None, tgt_mask=None):
        # 子层1: 掩码自注意力
        attn_out, _ = self.masked_self_attn(x, tgt_mask)
        x = self.layer_norm1(x + self.dropout(attn_out))
        # 子层2: 交叉注意力
        cross_out, _ = self.cross_attn(x, enc_output, src_mask)
        x = self.layer_norm2(x + self.dropout(cross_out))
        # 子层3: 前馈网络
        ff_out = self.feed_forward(x)
        x = self.layer_norm3(x + self.dropout(ff_out))
        return x`
                },
                {
                    lang: "python",
                    code: `class Transformer(nn.Module):
    """完整的 Transformer 模型"""
    def __init__(self, src_vocab, tgt_vocab, d_model=512, n_heads=8,
                 num_layers=6, d_ff=2048, max_len=5000, dropout=0.1):
        super().__init__()
        self.d_model = d_model
        
        self.src_embedding = nn.Embedding(src_vocab, d_model)
        self.tgt_embedding = nn.Embedding(tgt_vocab, d_model)
        self.positional_encoding = PositionalEncoding(d_model, max_len, dropout)
        
        self.encoder_layers = nn.ModuleList([
            EncoderLayer(d_model, n_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])
        self.decoder_layers = nn.ModuleList([
            DecoderLayer(d_model, n_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])
        
        self.output_linear = nn.Linear(d_model, tgt_vocab)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, src, tgt, src_mask=None, tgt_mask=None):
        # 嵌入 + 位置编码
        src_emb = self.dropout(self.positional_encoding(
            self.src_embedding(src) * math.sqrt(self.d_model)))
        tgt_emb = self.dropout(self.positional_encoding(
            self.tgt_embedding(tgt) * math.sqrt(self.d_model)))
        
        # 编码
        enc_output = src_emb
        for layer in self.encoder_layers:
            enc_output = layer(enc_output, src_mask)
        
        # 解码
        dec_output = tgt_emb
        for layer in self.decoder_layers:
            dec_output = layer(dec_output, enc_output, src_mask, tgt_mask)
        
        # 输出投影
        logits = self.output_linear(dec_output)
        return logits`
                }
            ],
            table: {
                headers: ["组件", "编码器层", "解码器层", "作用"],
                rows: [
                    ["自注意力", "多头自注意力", "掩码多头自注意力", "序列内部信息混合"],
                    ["交叉注意力", "无", "编码器-解码器注意力", "解码器读取编码信息"],
                    ["前馈网络", "FFN (d_model→4d→d_model)", "同编码器", "非线性特征变换"],
                    ["归一化", "Pre-LN × 2", "Pre-LN × 3", "稳定训练分布"],
                    ["残差连接", "x + Sublayer(x)", "同编码器", "梯度直接传播"],
                ],
            },
            mermaid: `graph TD
    A["输入嵌入 + 位置编码"] --> B["编码器层 1"]
    B --> C["编码器层 2"]
    C --> D["... 编码器层 N"]
    D --> E["编码器最终输出"]
    
    F["目标嵌入 + 位置编码"] --> G["解码器层 1"]
    E -.-> G
    G --> H["解码器层 2"]
    E -.-> H
    H --> I["... 解码器层 N"]
    E -.-> I
    I --> J["线性投影 → 输出 logits"]
    class J s0
    classDef s0 fill:#14532d`,
            tip: "Transformer 的层数选择：原始论文使用 6 层（d_model=512）。当增加到 12 层（d_model=768，如 BERT-base）或 24 层（d_model=1024，如 BERT-large）时，需要相应增大 d_model 和 n_heads 以保持每头的维度（d_k ≥ 64）。层数增加时建议使用 Pre-LN 结构以保证训练稳定性。",
            warning: "解码器中的掩码自注意力必须在训练和推理时都正确应用。训练时可以用下三角矩阵作为掩码（同时结合 padding mask），推理时由于自回归生成天然满足因果约束，不需要额外的掩码——但如果实现不当，可能会导致训练-推理不一致（Train-Test Mismatch）。",
        },
        {
            title: "6. 位置编码：让 Transformer 理解序列顺序",
            body: `位置编码（Positional Encoding）是 Transformer 架构中不可或缺的组件，它解决了自注意力的置换不变性问题。由于自注意力只看 token 的内容而不看 token 的位置，如果不加入位置信息，模型就无法区分「猫追狗」和「狗追猫」——两个句子的词袋完全相同，但语义截然相反。

原始 Transformer 使用的是正弦/余弦位置编码（Sinusoidal Positional Encoding）。每个位置 pos 和每个维度 i 对应一个正弦或余弦值：

PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

这个设计的精妙之处在于：不同频率的正弦/余弦函数为模型提供了丰富的位置信息。低维度对应高频振荡（对近处位置敏感），高维度对应低频振荡（对远处位置敏感）。更重要的是，这种编码方式允许模型学习相对位置关系：PE(pos + k) 可以表示为 PE(pos) 的线性变换。这意味着模型可以泛化到训练中未见过的序列长度——这是可学习位置编码（Learned Positional Embedding）所不具备的性质。

可学习位置编码是另一种常见方案：直接用一个可训练的嵌入矩阵，将位置索引映射为位置向量。这种方法在 BERT 中被使用（最大位置长度为 512）。它的优势是更灵活——模型可以学习到最适合任务的位置表示。但缺点是无法外推到更长的序列——如果训练时最大位置是 512，推理时遇到位置 600 就会索引越界或需要额外的处理策略。

旋转位置编码（Rotary Position Embedding, RoPE）是近年来最流行的位置编码方案之一，广泛应用于 LLaMA、PaLM 等大模型。RoPE 的核心思想是将位置信息通过旋转变换编码到 Query 和 Key 中，而不是直接加到嵌入向量上。具体来说，RoPE 将每个 Query/Key 向量视为复数对，然后根据位置应用一个旋转变换——位置越远，旋转角度越大。这种设计保持了相对位置感知的数学性质，同时避免了绝对位置编码的局限性。RoPE 在长文本场景中表现优异，因为它天然地保持了位置之间的相对关系，并且可以外推到任意序列长度。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import math

class PositionalEncoding(nn.Module):
    """正弦/余弦位置编码（原始 Transformer 方案）"""
    def __init__(self, d_model, max_len=5000, dropout=0.1):
        super().__init__()
        self.dropout = nn.Dropout(dropout)
        
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2, dtype=torch.float)
                            * (-math.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)  # 偶数维度：sin
        pe[:, 1::2] = torch.cos(position * div_term)  # 奇数维度：cos
        
        pe = pe.unsqueeze(0)  # (1, max_len, d_model)
        self.register_buffer('pe', pe)
    
    def forward(self, x):
        # x: (batch, seq_len, d_model)
        x = x + self.pe[:, :x.size(1), :]
        return self.dropout(x)`
                },
                {
                    lang: "python",
                    code: `# RoPE 旋转位置编码的简化实现
import torch

def rotate_half(x):
    """将向量对半拆分并旋转"""
    x1, x2 = x[..., :x.shape[-1] // 2], x[..., x.shape[-1] // 2:]
    return torch.cat((-x2, x1), dim=-1)

def apply_rope(q, k, position_ids):
    """应用 RoPE 到 Query 和 Key
    
    Args:
        q: (batch, heads, seq_len, head_dim)
        k: (batch, heads, seq_len, head_dim)
        position_ids: (batch, seq_len) 位置索引
    """
    head_dim = q.shape[-1]
    half_dim = head_dim // 2
    
    # 计算旋转角度
    inv_freq = 1.0 / (10000 ** (torch.arange(0, half_dim, 2, 
                       dtype=torch.float32) / half_dim))
    inv_freq = inv_freq.to(q.device)
    
    # (batch, seq_len, half_dim)
    freqs = position_ids.float().unsqueeze(-1) * inv_freq
    freqs = torch.cat([freqs, freqs], dim=-1)  # 扩展到 head_dim
    
    # (1, 1, seq_len, head_dim)
    freqs = freqs.unsqueeze(0).unsqueeze(0)
    
    # 旋转变换: q → q·cos + rotate_half(q)·sin
    cos = torch.cos(freqs)
    sin = torch.sin(freqs)
    
    q_embed = (q * cos) + (rotate_half(q) * sin)
    k_embed = (k * cos) + (rotate_half(k) * sin)
    
    return q_embed, k_embed`
                }
            ],
            table: {
                headers: ["编码方案", "外推能力", "相对位置", "训练开销", "典型模型"],
                rows: [
                    ["正弦/余弦", "优秀", "天然支持", "零（固定）", "原始 Transformer"],
                    ["可学习嵌入", "差", "需间接学习", "小（可训练）", "BERT, ViT"],
                    ["RoPE", "优秀", "数学保证", "小", "LLaMA, PaLM"],
                    ["ALiBi", "优秀", "天然支持", "零", "长文本模型"],
                    ["NoPE", "差", "依赖上下文", "零", "部分实验性模型"],
                ],
            },
            mermaid: `graph TD
    A["位置编码方案"] --> B{"需要外推到更长序列?"}
    B -->|是| C["正弦/余弦 或 RoPE"]
    B -->|否| D{"序列长度固定?"}
    D -->|是| E["可学习位置编码"]
    D -->|否| C
    C --> F["支持任意长度推理"]
    E --> G["仅限训练时见过的长度"]
    class F s0
    class G s2
    classDef s0 fill:#14532d
    classDef s2 fill:#7f1d1d`,
            tip: "位置编码的缩放：原始 Transformer 中将嵌入向量乘以 sqrt(d_model) 再加位置编码，这是为了平衡两者的幅度——嵌入向量的标准差约为 1/sqrt(d_model)，乘以 sqrt(d_model) 后变为 1，与位置编码的幅度（sin/cos 值在 [-1,1]）匹配。不要忽略这个缩放因子。",
            warning: "使用可学习位置编码时，如果推理序列长度超过训练时的最大长度，常见的补救方案是插值（将位置索引等比缩放）或外推（使用 RoPE 等方案）。单纯地截断或 padding 都会导致性能显著下降，尤其是在长文本理解任务中。",
        },
        {
            title: "7. 多头注意力的并行计算：语义分工与复杂度分析",
            body: `多头注意力的直觉是：不同的注意力头可以学习不同类型的关系。在机器翻译任务中，一个头可能关注主谓一致（主语和动词之间的语法关系），另一个头关注指代消解（代词与其指代的名词之间的关系），第三个头关注相邻词的局部搭配。这种语义分工不是人为设计的，而是模型在训练过程中自发涌现的行为。

研究者们通过分析注意力权重的可视化发现了一些有趣的模式：某些头呈现出对角线模式（关注相邻 token），某些头呈现出块状模式（关注特定类型的词，如所有名词），还有一些头呈现出全局模式（几乎均匀地关注所有 token）。这些模式表明多头机制确实让模型能够同时捕获多种不同粒度的依赖关系。

为什么多头有效而不是单个大头有效？数学上可以这样理解：单个头的注意力矩阵是 n × n 的秩-1 矩阵（因为它是 softmax(Q·K^T) 的结果），而 h 个头的注意力输出拼接后等效于一个更复杂的非线性变换。更重要的是，不同头可以关注不同的子空间——每个头在 d_k 维的子空间中独立计算注意力，这相当于将高维的注意力分解为多个低维的正交投影，每个投影捕获不同方向上的语义信息。

计算复杂度方面，多头注意力的总计算量与单头注意力相同（因为总维度 d_model 不变，只是拆分为 h 个 d_k 维的子空间），但多头带来了额外的参数开销（h 组独立的 W_Q/W_K/W_V 投影，以及 W_O 投影）和内存开销（需要存储 h 组注意力权重矩阵）。在实践中，多头注意力的训练和推理速度比单头注意力慢约 10％-20％（主要来自额外的矩阵乘法），但性能提升通常远超这个代价。

Flash Attention 是一种针对注意力计算的优化技术，通过分块计算（Tiling）和重计算（Recomputation）策略，将注意力计算的内存复杂度从 O(n²) 降低到 O(n)，同时保持精确的数学结果（不是近似）。Flash Attention 的核心洞察是：注意力计算中的中间矩阵（Q·K^T 和 softmax 结果）不需要全部存储在 GPU 的 HBM（高带宽内存）中——可以通过分块计算，只在 SRAM（更快的片上内存）中维护当前块的中间结果，大幅减少内存访问开销。在长序列场景下（n > 4096），Flash Attention 可以带来 2-4 倍的加速。`,
            code: [
                {
                    lang: "python",
                    code: `# 可视化多头注意力的不同模式
import torch
import torch.nn as nn
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def visualize_attention_heads(attention_weights, sentence_tokens):
    """可视化多头注意力的权重分布
    
    Args:
        attention_weights: (n_heads, seq_len, seq_len)
        sentence_tokens: list of str
    """
    n_heads = attention_weights.shape[0]
    fig, axes = plt.subplots(2, 4, figsize=(20, 8))
    axes = axes.flatten()
    
    for h in range(n_heads):
        im = axes[h].imshow(attention_weights[h], cmap='viridis',
                          aspect='auto', vmin=0, vmax=1)
        axes[h].set_title(f'Head {h+1}', fontsize=10)
        axes[h].set_xticks(range(len(sentence_tokens)))
        axes[h].set_xticklabels(sentence_tokens, rotation=45, fontsize=7)
        axes[h].set_yticks(range(len(sentence_tokens)))
        axes[h].set_yticklabels(sentence_tokens, fontsize=7)
    
    plt.colorbar(im, ax=axes, fraction=0.02)
    plt.tight_layout()
    plt.savefig('multi_head_attention.png', dpi=150)
    plt.close()


# 示例：分析一个训练好的模型
model = load_trained_transformer()
attention_weights = get_attention_weights(model, "The cat sat on the mat")
visualize_attention_heads(attention_weights[0],  # 第一层
                         ["The", "cat", "sat", "on", "the", "mat"])`
                },
                {
                    lang: "python",
                    code: `# 计算复杂度对比
def compute_complexity(seq_len, d_model, n_heads, num_layers):
    """计算 Transformer 各组件的复杂度"""
    d_k = d_model // n_heads
    
    # 自注意力: O(n² · d)
    self_attn = 4 * seq_len**2 * d_model + 2 * seq_len * d_model**2
    
    # FFN: O(n · d²)
    ffn = 8 * seq_len * d_model**2  # d_ff = 4 * d_model, 2 次矩阵乘法
    
    # 总复杂度（单层）
    per_layer = self_attn + ffn
    total = per_layer * num_layers
    
    print(f"序列长度: {seq_len}")
    print(f"d_model: {d_model}, 头数: {n_heads}, 层数: {num_layers}")
    print(f"自注意力: {self_attn/1e9:.2f} G FLOPs")
    print(f"FFN: {ffn/1e9:.2f} G FLOPs")
    print(f"单层总计: {per_layer/1e9:.2f} G FLOPs")
    print(f"模型总计: {total/1e9:.2f} G FLOPs")
    print()

# 对比不同配置
compute_complexity(512, 512, 8, 6)    # 原始 Transformer
compute_complexity(512, 768, 12, 12)  # BERT-base
compute_complexity(4096, 4096, 32, 32)  # GPT-3 小配置`
                }
            ],
            table: {
                headers: ["配置", "自注意力占比", "FFN 占比", "内存瓶颈", "GPU 利用率"],
                rows: [
                    ["短序列 (n<256)", "FFN 主导 (>60％)", "自注意力 (<40％)", "矩阵乘法", "高"],
                    ["中序列 (n=512)", "自注意力 ≈ FFN", "各占 ~50％", "注意力矩阵", "中"],
                    ["长序列 (n=4096)", "自注意力主导 (>80％)", "FFN (<20％)", "O(n²) 内存", "低"],
                    ["超长序列 (n>16K)", "Flash Attention 必须", "FFN 可忽略", "HBM 带宽", "需优化"],
                ],
            },
            mermaid: `graph TD
    A["输入 X"] --> B["拆分 h 个头"]
    B --> C["头1: d_k 维子空间"]
    B --> D["头2: d_k 维子空间"]
    B --> E["头3: d_k 维子空间"]
    B --> F["... 头h: d_k 维子空间"]
    C --> G["语法关系"]
    D --> H["语义关联"]
    E --> I["局部邻近"]
    F --> J["其他模式"]
    G --> K["拼接 Concat"]
    H --> K
    I --> K
    J --> K
    K --> L["输出投影 W_O"]
    L --> M["多头注意力输出"]
    class M s0
    classDef s0 fill:#14532d`,
            tip: "分析注意力头的语义分工时，可以使用注意力 rollout 技术：将多层注意力权重逐层相乘（而不是相加），得到输入 token 到输出 token 的全局注意力路径。这比单层注意力更能反映模型的整体关注模式。",
            warning: "多头数量不是越多越好。当 h > d_model / 64 时（即每头维度 < 64），每个头的表达能力会显著下降，整体性能反而降低。此外，过多的头会增加内存占用（需要存储 h 组注意力矩阵），在长序列场景下可能导致 OOM。",
        },
        {
            title: "8. 从 Transformer 到现代大模型：BERT、GPT 与稀疏注意力",
            body: `Transformer 的三大变体奠定了现代 NLP 的基础：编码器-only（BERT 系列）、解码器-only（GPT 系列）和编码器-解码器（T5、BART）。这三种架构的选择取决于任务性质——理解型任务（分类、命名实体识别、阅读理解）适合编码器-only，生成型任务（文本生成、对话、翻译）适合解码器-only 或编码器-解码器。

BERT（Bidirectional Encoder Representations from Transformers）使用 Transformer 编码器堆栈，通过掩码语言模型（Masked Language Model, MLM）进行预训练：随机遮蔽输入序列中 15％ 的 token，让模型预测被遮蔽的 token。这种双向上下文使得 BERT 能够充分利用左右两侧的信息，在理解型任务上表现出色。BERT-base（12 层、768 维、12 头）有 1.1 亿参数，BERT-large（24 层、1024 维、16 头）有 3.4 亿参数。

GPT（Generative Pre-trained Transformer）使用 Transformer 解码器堆栈，通过自回归语言模型进行预训练：根据前文预测下一个 token。GPT 的关键创新是缩放定律（Scaling Laws）——模型性能随模型规模、数据量和计算量的增加而持续改善，没有出现明显的饱和。这推动了模型从 GPT-1（1.17 亿参数）到 GPT-3（1750 亿参数）再到 GPT-4（万亿级参数）的指数级增长。

稀疏注意力（Sparse Attention）是对标准自注意力的重要优化，旨在降低 O(n²) 的计算和内存复杂度。核心思想是：不是所有 token 对都需要计算注意力——大多数注意力权重接近零。稀疏注意力的常见模式包括：局部窗口注意力（每个 token 只关注相邻的 w 个 token）、全局注意力（少数特殊 token 关注所有位置）、块注意力（将序列分块，块内计算全注意力）和随机注意力（随机选择一部分 token 计算注意力）。Longformer 和 BigBird 是稀疏注意力的代表性工作，它们将复杂度从 O(n²) 降低到 O(n · w)，其中 w 是窗口大小（通常为 512），使得处理数万 token 的长序列成为可能。

线性注意力（Linear Attention）是另一种降低复杂度的思路：通过修改注意力核函数（如使用 elu(x) + 1 替代 softmax），将注意力的计算形式从「先计算 n × n 注意力矩阵再乘以 V」转换为「先计算 K^T · V（形状为 d × d）再用 Q 左乘」，从而将复杂度从 O(n² · d) 降低到 O(n · d²)。当序列长度 n 远大于特征维度 d 时，线性注意力显著更高效。Performer 和 Linear Transformer 是这一方向的代表性工作。`,
            code: [
                {
                    lang: "python",
                    code: `# BERT 风格的编码器-only 模型
import torch
import torch.nn as nn

class BERTLikeModel(nn.Module):
    """类 BERT 的预训练模型"""
    def __init__(self, vocab_size, d_model=768, n_heads=12, 
                 num_layers=12, max_len=512):
        super().__init__()
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.position_embedding = nn.Embedding(max_len, d_model)
        self.segment_embedding = nn.Embedding(2, d_model)
        
        self.encoder_layers = nn.ModuleList([
            EncoderLayer(d_model, n_heads) for _ in range(num_layers)
        ])
        
        # MLM 预测头
        self.mlm_head = nn.Sequential(
            nn.Linear(d_model, d_model),
            nn.GELU(),
            nn.LayerNorm(d_model),
            nn.Linear(d_model, vocab_size)
        )
        # NSP (Next Sentence Prediction) 头
        self.nsp_head = nn.Linear(d_model, 2)
        self.pooler = nn.Linear(d_model, d_model)
    
    def forward(self, input_ids, token_type_ids=None, attention_mask=None):
        batch_size, seq_len = input_ids.shape
        positions = torch.arange(seq_len, device=input_ids.device)
        positions = positions.unsqueeze(0).expand(batch_size, -1)
        
        x = (self.token_embedding(input_ids) +
             self.position_embedding(positions))
        if token_type_ids is not None:
            x += self.segment_embedding(token_type_ids)
        
        for layer in self.encoder_layers:
            x = layer(x, attention_mask)
        
        # MLM 输出
        mlm_logits = self.mlm_head(x)
        # NSP 输出（使用 [CLS] token 的表示）
        pooled = torch.tanh(self.pooler(x[:, 0, :]))
        nsp_logits = self.nsp_head(pooled)
        
        return mlm_logits, nsp_logits`
                },
                {
                    lang: "python",
                    code: `# 稀疏注意力：局部窗口 + 全局 token
import torch

class SparseSelfAttention(nn.Module):
    """Longformer 风格的稀疏自注意力
    
    每个 token 关注:
    1. 局部窗口内的所有 token (w=512)
    2. 全局 token (如 [CLS], 段落标题等)
    """
    def __init__(self, d_model=768, n_heads=12, window_size=512):
        super().__init__()
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        self.window_size = window_size
        
        self.W_Q = nn.Linear(d_model, d_model)
        self.W_K = nn.Linear(d_model, d_model)
        self.W_V = nn.Linear(d_model, d_model)
        self.W_O = nn.Linear(d_model, d_model)
    
    def forward(self, x, global_mask=None):
        batch_size, seq_len, _ = x.size()
        half_w = self.window_size // 2
        
        Q = self.W_Q(x).view(batch_size, seq_len, self.n_heads, self.d_k)
        K = self.W_K(x).view(batch_size, seq_len, self.n_heads, self.d_k)
        V = self.W_V(x).view(batch_size, seq_len, self.n_heads, self.d_k)
        
        Q = Q.transpose(1, 2)
        K = K.transpose(1, 2)
        V = V.transpose(1, 2)
        
        # 局部窗口注意力 (简化版)
        # 实际实现中使用 sliding window 避免 O(n²)
        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.d_k  0.5)
        
        # 创建滑动窗口掩码
        window_mask = torch.ones(seq_len, seq_len, device=x.device)
        for i in range(seq_len):
            window_mask[i, :max(0, i-half_w)] = 0
            window_mask[i, i+half_w+1:] = 0
        
        # 全局 token 可以看到所有位置
        if global_mask is not None:
            window_mask[global_mask, :] = 1
            window_mask[:, global_mask] = 1
        
        scores = scores.masked_fill(window_mask == 0, -1e9)
        weights = torch.softmax(scores, dim=-1)
        
        context = torch.matmul(weights, V)
        context = context.transpose(1, 2).contiguous()
        context = context.view(batch_size, seq_len, self.d_model)
        
        return self.W_O(context)`
                }
            ],
            table: {
                headers: ["架构变体", "注意力类型", "预训练目标", "代表模型", "典型参数量"],
                rows: [
                    ["编码器-only", "双向全注意力", "MLM 遮蔽预测", "BERT, RoBERTa", "1.1 亿-3.4 亿"],
                    ["解码器-only", "掩码自注意力", "自回归下一词", "GPT-1/2/3/4", "1.17 亿-万亿级"],
                    ["编码器-解码器", "自注意力+交叉注意力", "去噪/翻译", "T5, BART", "2.2 亿-110 亿"],
                    ["稀疏注意力", "局部+全局窗口", "MLM 或自回归", "Longformer", "1.5-4 亿"],
                ],
            },
            mermaid: `graph TD
    A["Transformer 原始架构"] --> B["编码器-解码器"]
    A --> C["只保留编码器"]
    A --> D["只保留解码器"]
    B --> E["T5 / BART
翻译 摘要 生成"]
    C --> F["BERT / RoBERTa
分类 NER 问答"]
    D --> G["GPT 系列
文本生成 对话"]
    
    A --> H["引入稀疏注意力"]
    H --> I["Longformer / BigBird
长文本理解"]
    
    A --> J["引入线性注意力"]
    J --> K["Performer / Linear Transformer
超长序列"]
    
    class E s0
    class F s0
    class G s0
    class I s1
    class K s1
    classDef s0 fill:#14532d
    classDef s1 fill:#1e3a5f`,
            tip: "选择 Transformer 变体的经验法则：如果任务的输出是固定长度的标签（如分类、实体识别），使用编码器-only（BERT 风格）；如果输出是可变长度的序列（如翻译、摘要），使用编码器-解码器（T5 风格）；如果任务是纯生成（如对话、创意写作），使用解码器-only（GPT 风格）。",
            warning: "稀疏注意力虽然降低了复杂度，但也牺牲了全局建模能力。如果任务需要捕获序列中任意两个 token 之间的关系（如长文档中的跨段落推理），稀疏注意力可能不够。此时建议使用全局 token（如段落标题、[CLS] 标记）来桥接不同区域的信息。",
        },
        {
            title: "9. 注意力机制的注意事项与常见误区",
            body: `注意力权重不等于可解释性——这是注意力机制最大的误区之一。许多研究者和从业者将注意力权重矩阵直接可视化为「模型的关注区域」，并据此解释模型的决策过程。然而，多项研究表明：注意力权重与特征重要性之间的相关性远没有想象中那么强。一个注意力权重很高的位置，如果在模型的其他层中被「忽略」，最终对输出的影响可能很小；反之，一个注意力权重很低的位置，如果通过了非线性放大（如 FFN 中的 ReLU），也可能对输出产生重大影响。

注意力权重的平滑性是另一个需要关注的现象。由于 softmax 函数的特性，注意力权重往往呈现出「多数位置权重接近零、少数位置权重较大」的分布。这种分布在不同头之间可能差异很大——某些头几乎均匀分布（无意义的「背景头」），某些头集中在特定 token（「焦点头」）。在分析注意力时，应该综合考虑所有层和所有头的注意力模式，而不是只看某一层的某几个头。

计算复杂度是注意力机制在实践中的主要瓶颈。标准自注意力的 O(n²) 复杂度意味着序列长度翻倍时，计算量增加 4 倍，内存消耗也增加 4 倍。对于 8192 token 的序列，注意力矩阵需要 8192 × 8192 × 4 字节 ≈ 256MB（单精度），对于 batch_size=32 就是 8.2GB。这使得标准自注意力在长序列场景下变得不切实际，除非使用 Flash Attention、稀疏注意力或分块策略。

KV Cache（键值缓存）是 Transformer 推理阶段的关键优化技术。在自回归生成中，第 t 步生成的 token 需要关注所有之前生成的 token（0 到 t-1）。如果不使用缓存，每一步都需要重新计算所有之前 token 的 Key 和 Value——这是极大的浪费。KV Cache 的做法是：将之前所有 token 的 Key 和 Value 缓存在内存中，每一步只需计算当前 token 的 Key 和 Value，然后与缓存中的 Key 和 Value 拼接后计算注意力。这将每一步的计算复杂度从 O(t²) 降低到 O(t)，大幅加速了推理过程。但 KV Cache 的内存消耗随序列长度线性增长，当生成数千 token 时，KV Cache 可能成为显存的瓶颈。

注意力崩塌（Attention Collapse）是训练大型 Transformer 模型时可能遇到的现象：某些注意力头的权重分布逐渐趋近于均匀分布或集中在 [CLS] token 上，导致这些头实际上丧失了注意力功能。这通常发生在深度网络**的深层，原因是层归一化和残差连接的累积效应使得深层的输入信号趋于稳定，注意力机制失去了区分不同位置的能力。缓解方法包括：使用更小的学习率、增加注意力 dropout 比例、或在深层使用更强的正则化。`,
            code: [
                {
                    lang: "python",
                    code: `# KV Cache 的推理优化示例
import torch

class KVCacheTransformer:
    """带 KV Cache 的 Transformer 推理"""
    def __init__(self, model):
        self.model = model
        self.kv_cache = None
    
    def generate(self, input_ids, max_new_tokens=100, temperature=1.0):
        """自回归生成，使用 KV Cache 加速"""
        # 预填充阶段：一次性处理所有输入 token
        outputs = self.model(input_ids, use_cache=True)
        logits = outputs.logits[:, -1, :] / temperature
        self.kv_cache = outputs.past_key_values
        
        generated = input_ids
        for _ in range(max_new_tokens):
            # 采样下一个 token
            probs = torch.softmax(logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            generated = torch.cat([generated, next_token], dim=-1)
            
            if next_token.item() == self.model.config.eos_token_id:
                break
            
            # 使用 KV Cache：只传递新生成的 token
            outputs = self.model(next_token, use_cache=True,
                                past_key_values=self.kv_cache)
            logits = outputs.logits[:, -1, :] / temperature
            self.kv_cache = outputs.past_key_values
        
        return generated
    
    def get_cache_size_mb(self):
        """估算 KV Cache 的内存占用"""
        if self.kv_cache is None:
            return 0
        total_bytes = 0
        for layer_kv in self.kv_cache:
            for tensor in layer_kv:  # (key, value)
                total_bytes += tensor.numel() * tensor.element_size()
        return total_bytes / (1024 * 1024)`
                },
                {
                    lang: "python",
                    code: `# 注意力权重可解释性分析
import torch
import numpy as np

def analyze_attention_patterns(attention_weights, n_layers, n_heads):
    """分析注意力权重的统计特性
    
    Args:
        attention_weights: (batch, n_layers, n_heads, seq_len, seq_len)
    """
    results = []
    
    for layer in range(n_layers):
        for head in range(n_heads):
            weights = attention_weights[0, layer, head]
            
            # 熵：衡量注意力分布的均匀程度
            entropy = -(weights * (weights + 1e-10).log()).sum(dim=-1).mean()
            max_entropy = np.log(weights.size(-1))
            normalized_entropy = entropy / max_entropy
            
            # 集中度：有多少比例的注意力集中在 top-k 位置上
            top5_ratio = (weights.topk(5, dim=-1).values.sum(dim=-1)
                        / weights.sum(dim=-1)).mean()
            
            # 对角线倾向（自注意力权重）
            diag = torch.diag(weights).mean()
            
            results.append({
                'layer': layer, 'head': head,
                'entropy': normalized_entropy.item(),
                'top5_ratio': top5_ratio.item(),
                'diag_weight': diag.item(),
            })
    
    import pandas as pd
    df = pd.DataFrame(results)
    print("各层各头注意力统计:")
    print(df.to_string(index=False))
    return df`
                }
            ],
            table: {
                headers: ["现象", "原因", "影响", "缓解方案"],
                rows: [
                    ["注意力权重不可解释", "多层非线性变换削弱相关性", "误导性分析", "结合梯度/归因方法"],
                    ["O(n²) 复杂度", "注意力矩阵大小", "长序列 OOM", "Flash Attention/稀疏注意力"],
                    ["KV Cache 内存增长", "缓存随序列线性增长", "长生成任务显存不足", "KV Cache 压缩/量化"],
                    ["注意力崩塌", "深层信号趋同", "部分头失效", "更强的正则化/dropout"],
                    ["softmax 饱和", "点积过大/过小", "梯度消失", "适当缩放/温度调节"],
                ],
            },
            mermaid: `graph TD
    A["注意力机制常见问题"] --> B{"问题类型?"}
    B -->|可解释性| C["注意力权重 ≠ 特征重要性"]
    B -->|计算复杂度| D["O(n²) 内存和计算"]
    B -->|推理效率| E["KV Cache 内存增长"]
    B -->|训练稳定性| F["注意力崩塌"]
    C --> G["使用梯度归因分析"]
    D --> H["Flash Attention / 稀疏注意力"]
    E --> I["KV Cache 压缩/分页"]
    F --> J["增加正则化/调整学习率"]
    class G s0
    class H s0
    class I s0
    class J s0
    classDef s0 fill:#14532d`,
            tip: "评估注意力权重的实际影响力，可以使用「注意力梯度乘积」方法：将注意力权重乘以输出对注意力的梯度，得到的值比单纯的注意力权重更能反映该位置对最终输出的实际贡献。这比直接可视化注意力权重更可靠。",
            warning: "在生产环境中部署 Transformer 模型时，KV Cache 的内存管理至关重要。当 batch_size 较大且生成长文本时，KV Cache 可能占用 50％ 以上的显存。建议使用分页注意力（Paged Attention，如 vLLM 的实现）来高效管理 KV Cache 内存，避免 OOM。",
        },
        {
            title: "10. 扩展阅读与实战建议",
            body: `掌握注意力机制不仅需要理解理论，还需要动手实践。本节推荐一条从入门到进阶的学习路径，以及几个关键的实战项目，帮助你深入理解注意力机制的每一个细节。

第一阶段：实现基础注意力。从零实现缩放点积注意力和多头自注意力，不使用 PyTorch 的内置 API。重点理解 QKV 的线性投影、缩放因子的作用、softmax 的数值稳定性，以及多头拆分和拼接的维度变换。完成这一步后，你应该能够手写一个完整的自注意力层，并验证其输出与 PyTorch 的 nn.MultiheadAttention 一致。

第二阶段：实现完整 Transformer。从零实现一个完整的 Transformer 模型，包括位置编码、编码器层、解码器层、掩码自注意力和交叉注意力。使用 WMT14 英德翻译数据集进行训练，目标是在 10 个 epoch 内达到 BLEU 分数 > 25。这一步的关键挑战是：学习率调度（warmup + 衰减）、标签平滑（label smoothing）、和 梯度裁剪（gradient clipping）。这三个技术对 Transformer 的稳定训练缺一不可。

第三阶段：探索注意力变体。实现至少一种注意力优化方案：Flash Attention、稀疏注意力或线性注意力。比较它们与标准自注意力在速度和精度上的差异。对于 Flash Attention，可以使用 triton 库实现；对于稀疏注意力，可以实现 Longformer 的滑动窗口模式。这一步的目标是理解理论复杂度与实际性能之间的关系——理论上 O(n) 的算法在实践中可能因为内存访问模式不佳而不如 O(n²) 的实现快。

推荐学习资源：原始的《Attention Is All You Need》论文是必读的，但仅读论文是不够的。建议配合 The Annotated Transformer（一个逐行注释的 Transformer 实现）和 Stanford CS224N 课程的视频讲座。对于深入理解注意力的数学基础，推荐阅读《Deep Learning》（Goodfellow 等）中关于注意力的章节。对于最新进展，关注 arXiv 上每天的注意力相关论文。

实战项目建议：
1. 注意力可视化器：构建一个 Web 工具，输入句子后显示每一层每一头的注意力权重热力图。这能帮助你直观理解不同头的语义分工。
2. 长文本摘要：使用 Longformer 或 BigBird 实现一个长文档摘要系统，处理超过 4096 token 的输入。比较稀疏注意力与标准注意力的效果和速度。
3. KV Cache 优化器：实现一个带 KV Cache 的文本生成器，测量不同序列长度下的推理速度和内存占用。尝试实现分页注意力或 KV Cache 量化。
4. RoPE 位置编码实验：实现 RoPE 并与正弦位置编码和可学习位置编码进行比较，评估它们在序列长度外推任务上的表现。`,
            code: [
                {
                    lang: "python",
                    code: `# 从零实现完整的注意力层（练习框架）
import torch
import torch.nn as nn
import math

class AttentionFromScratch(nn.Module):
    """练习：从零实现自注意力层
    
    TODO: 补全以下方法的实现
    """
    def __init__(self, d_model, n_heads, dropout=0.1):
        super().__init__()
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        
        # TODO: 创建 Q, K, V 和输出投影层
        self.W_Q = None
        self.W_K = None
        self.W_V = None
        self.W_O = None
        
        self.dropout = nn.Dropout(dropout)
        self.layer_norm = nn.LayerNorm(d_model)
    
    def forward(self, x, mask=None):
        batch_size, seq_len, _ = x.size()
        
        # TODO: 1. 线性投影 Q, K, V
        # TODO: 2. 多头拆分 (view + transpose)
        # TODO: 3. 缩放点积 Q·K^T / sqrt(d_k)
        # TODO: 4. 应用掩码（如果有）
        # TODO: 5. softmax 归一化
        # TODO: 6. 加权求和 weights·V
        # TODO: 7. 多头拼接 (transpose + view)
        # TODO: 8. 输出投影
        # TODO: 9. 残差连接 + LayerNorm
        
        pass  # 替换为你的实现


# 验证你的实现是否正确
def test_attention_implementation():
    """对比从零实现与 PyTorch 内置实现"""
    torch.manual_seed(42)
    d_model, n_heads = 64, 4
    batch_size, seq_len = 2, 10
    
    x = torch.randn(batch_size, seq_len, d_model)
    
    # PyTorch 内置
    pytorch_attn = nn.MultiheadAttention(d_model, n_heads, batch_first=True)
    pytorch_out, _ = pytorch_attn(x, x, x)
    
    # 你的实现
    your_attn = AttentionFromScratch(d_model, n_heads)
    # TODO: 将 pytorch_attn 的参数复制给你的实现
    # your_out = your_attn(x)
    
    # TODO: 验证输出是否一致 (误差 < 1e-5)
    # diff = (pytorch_out - your_out).abs().max()
    # assert diff < 1e-5, f"误差过大: {diff}"
    
    print("测试框架已就绪，请完成 AttentionFromScratch 的实现")

test_attention_implementation()`
                }
            ],
            table: {
                headers: ["学习阶段", "目标", "预计时间", "关键产出"],
                rows: [
                    ["阶段一：基础注意力", "实现缩放点积 + 多头", "1-2 周", "完整的自注意力层"],
                    ["阶段二：完整 Transformer", "实现编码-解码架构", "2-4 周", "BLEU > 25 的翻译模型"],
                    ["阶段三：注意力优化", "实现 Flash/稀疏注意力", "2-3 周", "性能对比报告"],
                    ["扩展：大模型微调", "微调开源 LLM", "1-2 周", "领域适配模型"],
                ],
            },
            mermaid: `graph TD
    A["学习路径"] --> B["阶段一: 基础注意力"]
    B --> C["阶段二: 完整 Transformer"]
    C --> D["阶段三: 注意力优化"]
    D --> E["扩展: 大模型微调"]
    
    B --> F["掌握 QKV / 缩放 / softmax"]
    C --> G["掌握编码-解码 / 掩码 / 残差"]
    D --> H["掌握 Flash / 稀疏 / 线性注意力"]
    E --> I["掌握 LoRA / 指令微调"]
    
    class E s0
    class I s0
    classDef s0 fill:#14532d`,
            tip: "学习注意力机制最有效的方式是从零实现一遍完整的 Transformer。The Annotated Transformer（http://nlp.seas.harvard.edu/2018/04/03/attention.html）提供了逐行注释的 PyTorch 实现，跟着走一遍比读十篇论文都有用。",
            warning: "Transformer 的训练对超参数非常敏感。如果你从零开始训练时遇到 loss 不下降的问题，首先检查：学习率预热是否足够（建议 warmup 4000-8000 步）、学习率峰值是否合适（建议 1e-4 到 5e-4）、标签平滑是否启用（建议 0.1）、梯度裁剪是否应用（建议 max_norm=1.0）。这四个因素是 Transformer 训练失败的最常见原因。",
        },
    ],
};
