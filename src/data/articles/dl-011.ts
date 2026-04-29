import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-011",
    title: "注意力机制：从 Seq2Seq 到 Transformer",
    category: "dl",
    tags: ["注意力", "Seq2Seq", "Transformer"],
    summary: "从编码器-解码器到自注意力，理解注意力机制的演进",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. Seq2Seq 编码器-解码器架构",
            body: `Seq2Seq（Sequence-to-Sequence）模型是 2014 年由 Sutskever 等人和 Cho 等人几乎同时提出的革命性架构，它将一个可变长度的输入序列映射到另一个可变长度的输出序列。其核心思想是用两个 RNN 协同工作：编码器（Encoder）逐个读取输入 token，将全部语义压缩到一个固定维度的上下文向量中；解码器（Decoder）则基于这个向量逐步生成输出序列。

编码器的隐藏状态 hₜ = f(xₜ, hₜ₋₁) 随时间步更新，最终的隐藏状态 hₙ 被作为上下文向量 c 传递给解码器。解码器以自回归方式工作：每一步将上一步的输出 yₜ₋₁ 和上下文向量 c 作为输入，生成当前步的输出 yₜ，直到产生结束符。

这种架构在机器翻译、文本摘要、对话系统等任务上取得了突破性成果。它最大的贡献是证明了「固定维度的隐向量可以承载变长序列的语义」，为后续的注意力机制埋下了伏笔。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class Encoder(nn.Module):
    """LSTM 编码器：将输入序列压缩为上下文向量"""
    def __init__(self, vocab_size, embed_dim, hidden_dim, n_layers=2, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, num_layers=n_layers,
                            batch_first=True, dropout=dropout)
    
    def forward(self, src):
        # src: (batch, seq_len)
        embedded = self.embedding(src)  # (batch, seq_len, embed_dim)
        outputs, (hidden, cell) = self.lstm(embedded)
        return hidden, cell  # hidden: (n_layers, batch, hidden_dim)


class Decoder(nn.Module):
    """LSTM 解码器：基于上下文向量逐步生成输出"""
    def __init__(self, vocab_size, embed_dim, hidden_dim, n_layers=2, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, num_layers=n_layers,
                            batch_first=True, dropout=dropout)
        self.fc_out = nn.Linear(hidden_dim, vocab_size)
    
    def forward(self, input_token, hidden, cell):
        # input_token: (batch, 1)
        embedded = self.embedding(input_token)  # (batch, 1, embed_dim)
        output, (hidden, cell) = self.lstm(embedded, (hidden, cell))
        prediction = self.fc_out(output.squeeze(1))  # (batch, vocab_size)
        return prediction, hidden, cell`,
                },
                {
                    lang: "python",
                    code: `class Seq2Seq(nn.Module):
    """完整 Seq2Seq 模型：编码器 + 解码器"""
    def __init__(self, encoder, decoder, device):
        super().__init__()
        self.encoder = encoder
        self.decoder = decoder
        self.device = device
    
    def forward(self, src, trg, teacher_forcing_ratio=0.5):
        """
        src: (batch, src_len)
        trg: (batch, trg_len)
        """
        batch_size = src.shape[0]
        trg_len = trg.shape[1]
        trg_vocab_size = self.decoder.fc_out.out_features
        outputs = torch.zeros(batch_size, trg_len, trg_vocab_size).to(self.device)
        
        hidden, cell = self.encoder(src)  # 编码整个输入序列
        decoder_input = trg[:, 0].unsqueeze(1)  # 以 <sos> 开始
        
        for t in range(1, trg_len):
            output, hidden, cell = self.decoder(decoder_input, hidden, cell)
            outputs[:, t] = output
            
            # Teacher forcing: 50% 概率使用真实标签作为下一步输入
            top1 = output.argmax(1)
            use_teacher = torch.rand(1).item() < teacher_forcing_ratio
            decoder_input = trg[:, t].unsqueeze(1) if use_teacher else top1.unsqueeze(1)
        
        return outputs

# 构建模型
SRC_VOCAB = 10000
TRG_VOCAB = 10000
EMB_DIM = 256
HID_DIM = 512
N_LAYERS = 2

enc = Encoder(SRC_VOCAB, EMB_DIM, HID_DIM, N_LAYERS)
dec = Decoder(TRG_VOCAB, EMB_DIM, HID_DIM, N_LAYERS)
model = Seq2Seq(enc, dec, device=torch.device("cpu"))
print(f"参数总量: {sum(p.numel() for p in model.parameters()):,}")`,
                },
            ],
            table: {
                headers: ["组件", "输入", "输出", "关键作用"],
                rows: [
                    ["编码器", "(batch, src_len)", "(n_layers, batch, hidden)", "将变长输入压缩为固定向量"],
                    ["解码器", "(batch, 1) + 上下文向量", "(batch, vocab_size)", "自回归生成输出序列"],
                    ["Teacher Forcing", "真实标签 yₜ", "解码器输入", "加速收敛，防止误差累积"],
                    ["嵌入层", "token IDs", "(batch, seq_len, embed_dim)", "将离散符号映射为稠密向量"],
                    ["线性输出层", "hidden state", "(batch, vocab_size)", "将隐藏状态映射为词表概率"],
                ],
            },
            mermaid: `graph LR
    subgraph "编码器"
        X1["x₁"] --> E1["Encoder h₁"]
        X2["x₂"] --> E2["Encoder h₂"]
        X3["x₃"] --> E3["Encoder h₃"]
        Xn["xₙ"] --> En["Encoder hₙ"]
        E1 --> E2 --> E3 --> En
    end
    
    subgraph "上下文"
        En --> C["上下文向量 c"]
    end
    
    subgraph "解码器"
        C --> D1["Decoder y₁"]
        D1 --> D2["Decoder y₂"]
        D2 --> D3["Decoder y₃"]
        D3 --> DM["Decoder yₘ"]
    end
    class En s1
    class C s0
    classDef s0 fill:#7c2d12
    classDef s1 fill:#14532d`,
            tip: "动手实验：用 PyTorch 实现一个 mini Seq2Seq，在 toy 数据集上（如反转字符串）训练，观察编码器是否真正学会了「压缩语义」。尝试用不同长度的输入测试，看看压缩瓶颈在哪里显现。",
        },
        {
            title: "2. 瓶颈问题与注意力引入",
            body: `Seq2Seq 模型看似优雅，却有一个致命的结构缺陷：无论输入序列多长，编码器都必须将所有信息压缩到一个固定维度的上下文向量 c 中。对于短句子这没有问题，但当输入达到数百个 token 时，一个几百维的向量根本无法承载如此丰富的语义。

2014 年底，Bahdanau 等人提出了「注意力机制」（Attention Mechanism），从根本上解决了这个瓶颈问题。核心思路极其直观：解码器在生成每个输出 token 时，不应该只看一个固定的上下文向量，而是应该「回头看」编码器所有时间步的隐藏状态，动态地决定关注输入的哪些部分。

注意力机制的本质是一个「软查找」过程。对于解码器的每个时间步，模型计算输入序列中每个位置与当前解码状态的「相关度」，将这些相关度归一化为权重（注意力分布），然后用这些权重对编码器的所有隐藏状态加权求和，得到当前时间步专用的上下文向量。

这一改动带来了两个深远影响：翻译质量大幅提升（尤其对长句）；更重要的是，注意力权重提供了可解释的可视化——我们可以直接看到模型在翻译每个词时「看」的是输入中的哪些词。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class Attention(nn.Module):
    """加性注意力（Additive Attention）—— Bahdanau 风格"""
    def __init__(self, hidden_dim):
        super().__init__()
        self.attn = nn.Linear(hidden_dim * 2, hidden_dim)
        self.v = nn.Linear(hidden_dim, 1, bias=False)
    
    def forward(self, hidden, encoder_outputs):
        """
        hidden: (batch, hidden_dim) — 解码器当前隐藏状态
        encoder_outputs: (batch, src_len, hidden_dim) — 编码器全部输出
        返回: (batch, src_len) — 注意力权重
        """
        batch_size, src_len, _ = encoder_outputs.size()
        
        # 将 hidden 复制 src_len 份，与每个 encoder_output 拼接
        hidden = hidden.unsqueeze(1).repeat(1, src_len, 1)  # (batch, src_len, hidden_dim)
        combined = torch.cat([hidden, encoder_outputs], dim=2)  # (batch, src_len, hidden_dim*2)
        
        # 计算注意力能量
        energy = torch.tanh(self.attn(combined))  # (batch, src_len, hidden_dim)
        attention_scores = self.v(energy).squeeze(2)  # (batch, src_len)
        
        # softmax 归一化
        return F.softmax(attention_scores, dim=1)`,
                },
                {
                    lang: "python",
                    code: `class AttentionDecoder(nn.Module):
    """带注意力的解码器"""
    def __init__(self, vocab_size, embed_dim, hidden_dim, attention, n_layers=1):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.attention = attention
        self.lstm = nn.LSTM(embed_dim + hidden_dim, hidden_dim,
                            num_layers=n_layers, batch_first=True)
        self.fc_out = nn.Linear(hidden_dim * 2, vocab_size)
    
    def forward(self, input_token, hidden, cell, encoder_outputs):
        """
        encoder_outputs: (batch, src_len, hidden_dim)
        """
        input_emb = self.embedding(input_token)  # (batch, 1, embed_dim)
        
        # 计算注意力权重
        attn_weights = self.attention(hidden[-1], encoder_outputs)  # (batch, src_len)
        attn_weights = attn_weights.unsqueeze(1)  # (batch, 1, src_len)
        
        # 加权求和得到上下文向量
        context = torch.bmm(attn_weights, encoder_outputs)  # (batch, 1, hidden_dim)
        
        # 将上下文向量与嵌入拼接后送入 LSTM
        rnn_input = torch.cat([input_emb, context], dim=2)  # (batch, 1, embed_dim+hidden_dim)
        output, (hidden, cell) = self.lstm(rnn_input, (hidden, cell))
        
        # 拼接输出和上下文向量做最终预测
        prediction = self.fc_out(torch.cat([output.squeeze(1), context.squeeze(1)], dim=1))
        return prediction, hidden, cell, attn_weights.squeeze(1)`,
                },
            ],
            table: {
                headers: ["特性", "基础 Seq2Seq", "带注意力的 Seq2Seq"],
                rows: [
                    ["上下文向量", "单一固定向量 c", "每步动态计算 cₜ"],
                    ["编码器信息利用", "仅用最终隐藏状态", "使用所有时间步隐藏状态"],
                    ["长序列性能", "严重下降", "显著改善"],
                    ["可解释性", "黑盒", "注意力权重提供可视化"],
                    ["计算复杂度", "O(src_len + trg_len)", "O(src_len × trg_len)"],
                    ["BLEU 提升 (En-De)", "~26", "~28-30"],
                ],
            },
            mermaid: `graph LR
    subgraph "编码器"
        H1["h₁"]
        H2["h₂"]
        H3["h₃"]
        H4["h₄"]
        Hn["hₙ"]
    end
    
    subgraph "注意力计算"
        H1 --> A1["α₁"]
        H2 --> A2["α₂"]
        H3 --> A3["α₃"]
        H4 --> A4["α₄"]
        Hn --> An["αₙ"]
        A1 & A2 & A3 & A4 & An --> S["加权求和"]
    end
    
    subgraph "解码器 t=2"
        D2["s₂"] -->|查询| A1 & A2 & A3 & A4 & An
        S -->|"c₂"| D2
    end
    class D2 s1
    class S s0
    classDef s0 fill:#7c2d12
    classDef s1 fill:#14532d`,
            tip: "理解注意力的关键是「查询-键-值」范式：解码器的当前状态是 query，编码器的所有隐藏状态既是 key 也是 value。这个范式后来成为了所有注意力变体的统一框架。",
        },
        {
            title: "3. Bahdanau 注意力详解",
            body: `Bahdanau 注意力（也称加性注意力或拼接注意力）是注意力机制的第一个具体实现，由 Dzmitry Bahdanau 等人在 2014 年的论文《Neural Machine Translation by Jointly Learning to Align and Translate》中提出。这篇论文的重要性不仅在于提出了注意力机制，更在于它第一次将「对齐」（alignment）和「翻译」放在同一个可训练框架中联合学习。

加性注意力的核心公式为：eᵢⱼ = vᵀ · tanh(W · [sⱼ₋₁; hᵢ] + b)，其中 sⱼ₋₁ 是解码器上一步的隐藏状态（query），hᵢ 是编码器第 i 个时间步的隐藏状态（key），v 和 W 是可学习的参数。计算完所有 eᵢⱼ 后，用 softmax 归一化得到注意力权重 αᵢⱼ，最终上下文向量 cⱼ = Σᵢ αᵢⱼ · hᵢ。

相比于简单的点积注意力，加性注意力通过一个单隐藏层神经网络来建模 query 和 key 之间的关系，具有更强的表达能力。但这也带来了额外的参数和计算量。2015 年，Luong 等人提出了乘性注意力（点积注意力），用简单的矩阵点积代替了神经网络，计算效率更高，成为了后来 Transformer 中注意力机制的前身。

注意力权重的可解释性是该方法最迷人的特性之一。可视化 attention matrix（src_len × trg_len 的矩阵）后，我们可以清楚地看到：翻译 "the cat" 时，模型主要关注 "猫"；翻译 "on the mat" 时，关注转移到了 "垫子上"。这几乎就是传统统计机器翻译中「对齐」概念的神经化版本。`,
            code: [
                {
                    lang: "python",
                    code: `class BahdanauAttention(nn.Module):
    """完整 Bahdanau 注意力实现"""
    def __init__(self, hidden_dim):
        super().__init__()
        self.W_s = nn.Linear(hidden_dim, hidden_dim, bias=False)  # 解码器状态变换
        self.W_h = nn.Linear(hidden_dim, hidden_dim, bias=False)  # 编码器状态变换
        self.v = nn.Linear(hidden_dim, 1, bias=False)
    
    def forward(self, decoder_hidden, encoder_outputs, mask=None):
        """
        decoder_hidden: (batch, hidden_dim)
        encoder_outputs: (batch, src_len, hidden_dim)
        mask: (batch, src_len) padding 掩码
        返回: context (batch, 1, hidden_dim), attn_weights (batch, src_len)
        """
        # 变换到同一空间
        s = self.W_s(decoder_hidden).unsqueeze(1)  # (batch, 1, hidden_dim)
        h = self.W_h(encoder_outputs)              # (batch, src_len, hidden_dim)
        
        # 广播相加 + tanh
        energy = torch.tanh(s + h)  # (batch, src_len, hidden_dim)
        scores = self.v(energy).squeeze(2)  # (batch, src_len)
        
        # 应用 padding mask
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e10)
        
        attn_weights = F.softmax(scores, dim=1)  # (batch, src_len)
        context = torch.bmm(attn_weights.unsqueeze(1), encoder_outputs)
        return context, attn_weights`,
                },
                {
                    lang: "python",
                    code: `import matplotlib.pyplot as plt
import numpy as np

def visualize_attention(attn_weights, src_tokens, trg_tokens, ax=None):
    """可视化注意力矩阵"""
    if ax is None:
        fig, ax = plt.subplots(figsize=(8, 6))
    
    # 转为 numpy 并截取有效部分
    attn = attn_weights.detach().cpu().numpy()  # (src_len, trg_len) or (1, src_len, trg_len)
    if attn.ndim == 3:
        attn = attn[0]  # 取第一个 batch
    
    im = ax.imshow(attn.T, cmap='viridis', aspect='auto', vmin=0, vmax=1)
    ax.set_xticks(range(len(src_tokens)))
    ax.set_yticks(range(len(trg_tokens)))
    ax.set_xticklabels(src_tokens, rotation=45, ha='right')
    ax.set_yticklabels(trg_tokens)
    ax.set_xlabel("Source")
    ax.set_ylabel("Target")
    ax.set_title("Attention Weights")
    plt.colorbar(im, ax=ax)
    return ax

# 模拟示例注意力矩阵
np.random.seed(42)
src = ["Je", "suis", "un", "étudiant"]
trg = ["I", "am", "a", "student", "</s>"]
# 模拟对角占优的注意力（翻译任务中很常见）
sim_attn = np.eye(4, 5) * 0.7 + np.random.rand(4, 5) * 0.3
sim_attn /= sim_attn.sum(axis=0, keepdims=True)

fig, ax = plt.subplots(figsize=(8, 6))
visualize_attention(torch.tensor(sim_attn.T), src, trg, ax)
plt.tight_layout()
plt.savefig("attention_viz.png", dpi=150)
print("已保存 attention_viz.png")`,
                },
            ],
            table: {
                headers: ["注意力类型", "评分函数 score(s, h)", "参数量", "计算效率", "表达能力"],
                rows: [
                    ["Bahdanau (加性)", "vᵀ tanh(W[s;h] + b)", "O(hidden²)", "较慢", "强"],
                    ["Luong (点积)", "sᵀ · h", "0", "极快", "中等"],
                    ["Luong (广义点积)", "sᵀ · W · h", "O(hidden²)", "快", "强"],
                    ["Luong (拼接)", "vᵀ tanh(W[s;h])", "O(hidden²)", "较慢", "强"],
                    ["Scaled Dot-Product", "sᵀh / √d", "0", "极快", "中等（多层弥补）"],
                ],
            },
            mermaid: `graph TD
    subgraph "Bahdanau 注意力计算流程"
        S["解码器状态 sₜ₋₁"] --> Concat
        H["编码器状态 hᵢ (∀i)"] --> Concat
        Concat["拼接 [sₜ₋₁; hᵢ]"] --> W["线性变换 W"]
        W --> Tanh["tanh 激活"]
        Tanh --> V["线性变换 v"]
        V --> E["能量值 eₜᵢ"]
        E --> Softmax["Softmax 归一化"]
        Softmax --> Alpha["注意力权重 αₜᵢ"]
        Alpha --> Sum["加权求和 Σαₜᵢ·hᵢ"]
        Sum --> C["上下文向量 cₜ"]
    end
    class C s2
    class H s1
    class S s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
            warning: "Bahdanau 注意力的一个常见实现陷阱：别忘了 padding mask！输入序列通常会被 padding 到相同长度，如果不 mask 掉 padding 位置的注意力分数，softmax 会给无效位置分配非零权重，导致模型学习到错误信号。",
        },
        {
            title: "4. 多头自注意力（Multi-Head Self-Attention）",
            body: `2017 年，Vaswani 等人在《Attention Is All You Need》中提出了 Transformer 架构，其中最核心的创新是「多头自注意力」（Multi-Head Self-Attention）。与之前只在编码器和解码器之间计算注意力不同，自注意力让序列中的每个位置都能直接「看到」序列中的所有其他位置，无论距离多远。

自注意力的计算遵循著名的 QKV（Query-Key-Value）范式。对于输入序列 X，首先通过三个不同的线性变换得到 Q = XW_Q、K = XW_K、V = XW_V。然后计算注意力分数 Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V。这里的缩放因子 √d_k 至关重要——当 d_k 较大时，QKᵀ 的点积值会非常大，softmax 会进入梯度接近零的饱和区，缩放可以稳定梯度。

「多头」意味着将 Q、K、V 分别拆成 h 个头（head），每个头独立计算注意力，最后将结果拼接并通过一个线性变换融合。这相当于让模型在多个不同的「子空间」中同时关注不同的信息模式：一个头可能关注语法关系（如主谓一致），另一个头可能关注语义相似性，第三个头可能关注长距离依赖。

多头自注意力的时间复杂度为 O(n² · d)，其中 n 是序列长度，d 是模型维度。这意味着它对所有位置对的计算是并行的，不像 RNN 那样受限于序列的因果顺序，这也是 Transformer 训练速度远超 RNN 的根本原因。`,
            code: [
                {
                    lang: "python",
                    code: `class MultiHeadAttention(nn.Module):
    """从零实现多头自注意力"""
    def __init__(self, d_model=512, n_heads=8, dropout=0.1):
        super().__init__()
        assert d_model % n_heads == 0, "d_model 必须能被 n_heads 整除"
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads  # 每个头的维度
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, query, key, value, mask=None):
        batch_size = query.size(0)
        
        # 线性变换并分头: (batch, n_heads, seq_len, d_k)
        Q = self.W_q(query).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_k(key).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_v(value).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        
        # Scaled Dot-Product Attention
        scores = Q @ K.transpose(-2, -1) / (self.d_k ** 0.5)  # (batch, n_heads, q_len, k_len)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e10)
        
        attn_weights = F.softmax(scores, dim=-1)
        attn_weights = self.dropout(attn_weights)
        
        context = attn_weights @ V  # (batch, n_heads, q_len, d_k)
        
        # 拼接多头
        context = context.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        return self.W_o(context), attn_weights`,
                },
                {
                    lang: "python",
                    code: `# 分析多头注意力的「角色分工」
import torch

def analyze_head_diversity(attn_weights, n_heads=8):
    """分析不同注意力头的行为差异"""
    # attn_weights: (batch, n_heads, seq_len, seq_len)
    # 计算每个头的注意力集中度（熵越低越集中）
    batch_size, n_h, seq_len, _ = attn_weights.shape
    
    head_entropy = []
    for h in range(n_h):
        # 对每个位置的注意力分布计算熵
        probs = attn_weights[0, h]  # (seq_len, seq_len)
        entropy = -torch.sum(probs * torch.log(probs + 1e-10), dim=-1)  # (seq_len)
        head_entropy.append(entropy.mean().item())
    
    print("各头注意力熵（越低越集中）:")
    for h, ent in enumerate(head_entropy):
        bar = "█" * int(ent * 3)
        print(f"  Head {h}: {ent:.3f} {bar}")
    
    # 计算头之间的相似度
    print("\\n头间相似度矩阵:")
    probs = attn_weights[0]  # (n_heads, seq_len, seq_len)
    probs_flat = probs.view(n_h, -1)
    probs_flat = F.normalize(probs_flat, p=2, dim=1)
    similarity = probs_flat @ probs_flat.T
    print(f"  平均相似度: {similarity.mean().item():.3f}")
    print(f"  最大非对角相似度: {similarity[similarity < 0.999].max().item():.3f}")
    return head_entropy

# 随机生成模拟数据测试
torch.manual_seed(42)
mock_attn = torch.rand(1, 8, 32, 32)
mock_attn = F.softmax(mock_attn, dim=-1)
analyze_head_diversity(mock_attn, n_heads=8)`,
                },
            ],
            table: {
                headers: ["组件", "作用", "矩阵形状", "学习参数"],
                rows: [
                    ["W_Q (Query)", "定义「我在找什么」", "(d_model, d_model)", "d_model²"],
                    ["W_K (Key)", "定义「我有什么」", "(d_model, d_model)", "d_model²"],
                    ["W_V (Value)", "定义「我提供什么信息」", "(d_model, d_model)", "d_model²"],
                    ["缩放因子 √d_k", "防止点积过大导致 softmax 饱和", "标量", "无（固定值）"],
                    ["W_O (输出投影)", "融合多头的信息", "(d_model, d_model)", "d_model²"],
                    ["每个头维度 d_k", "控制单个注意力的粒度", "d_model / n_heads", "无"],
                ],
            },
            mermaid: `graph LR
    subgraph "输入"
        X["X (seq_len, d_model)"]
    end
    
    subgraph "QKV 投影"
        X -->|"W_Q"| Q["Q"]
        X -->|"W_K"| K["K"]
        X -->|"W_V"| V["V"]
    end
    
    subgraph "拆分多头 (h=8)"
        Q -->|"split"| Qh["Q₁...Q₈"]
        K -->|"split"| Kh["K₁...K₈"]
        V -->|"split"| Vh["V₁...V₈"]
    end
    
    subgraph "并行注意力"
        Qh & Kh & Vh -->|"SDPA × 8"| Oh["O₁...O₈"]
    end
    
    subgraph "融合输出"
        Oh -->|"concat + W_O"| Out["Output (seq_len, d_model)"]
    end
    class Out s1
    class X s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d`,
            tip: "多头注意力的头数 n_heads 通常设为 8 或 16，每个头的维度 d_k 保持在 64 左右效果最佳。这不是硬性规定，但大量实验表明：头太少则表达能力不足，头太多则每个头分到的参数太少，容易退化为冗余。",
        },
        {
            title: "5. 位置编码：让 Transformer 感知顺序",
            body: `自注意力有一个根本性的结构缺陷：它本质上是「排列不变」（permutation-equivariant）的。如果打乱输入序列中 token 的顺序，自注意力的输出也只会相应地打乱，而不会改变 token 之间的关系。这意味着，如果没有额外的位置信息，Transformer 无法区分 "the cat sat on the mat" 和 "mat the on sat cat the"——这显然是不可接受的。

解决方案是位置编码（Positional Encoding）：为每个位置 i 生成一个与词嵌入维度相同的向量 PE(i)，然后将其加到词嵌入上。这样，每个 token 的表示就同时包含了「内容信息」（词嵌入）和「位置信息」（位置编码）。

Transformer 原文使用的是基于正弦和余弦函数的固定位置编码：PE(pos, 2i) = sin(pos / 10000^(2i/d))，PE(pos, 2i+1) = cos(pos / 10000^(2i/d))。这个设计有几个精妙之处：不同维度对应不同频率的正弦波，低频维度编码粗粒度位置，高频维度编码细粒度位置；更重要的是，对于任意固定偏移 k，PE(pos + k) 可以表示为 PE(pos) 的线性变换，这使得模型有可能学到「相对位置」的关系。

除了固定正弦编码，可学习的位置编码（Learned Positional Embedding）也是一种常见方案——直接将每个位置视为一个可训练的嵌入向量。两种方式各有优劣：正弦编码可以泛化到训练时未见过的序列长度；可学习编码可能在训练数据范围内拟合更好，但无法外推到更长的序列。近年来，RoPE（旋转位置编码）和 ALiBi（线性偏置注意力）等相对位置编码方案进一步提升了模型的位置感知能力。`,
            code: [
                {
                    lang: "python",
                    code: `class SinusoidalPositionalEncoding(nn.Module):
    """正弦位置编码——Transformer 原始方案"""
    def __init__(self, d_model, max_len=5000, dropout=0.1):
        super().__init__()
        self.dropout = nn.Dropout(dropout)
        
        pe = torch.zeros(max_len, d_model)  # (max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * 
                             (-torch.log(torch.tensor(10000.0)) / d_model))
        
        # 偶数维度用 sin，奇数维度用 cos
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)  # (1, max_len, d_model)
        self.register_buffer('pe', pe)  # 不作为模型参数更新
    
    def forward(self, x):
        """x: (batch, seq_len, d_model)"""
        x = x + self.pe[:, :x.size(1)]
        return self.dropout(x)


class LearnedPositionalEncoding(nn.Module):
    """可学习位置编码"""
    def __init__(self, d_model, max_len=5000, dropout=0.1):
        super().__init__()
        self.dropout = nn.Dropout(dropout)
        self.pe = nn.Parameter(torch.randn(1, max_len, d_model) * 0.02)
    
    def forward(self, x):
        x = x + self.pe[:, :x.size(1)]
        return self.dropout(x)`,
                },
                {
                    lang: "python",
                    code: `import matplotlib.pyplot as plt
import numpy as np

def visualize_positional_encoding(d_model=512, max_len=100):
    """可视化位置编码的频率结构"""
    position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
    div_term = torch.exp(torch.arange(0, d_model, 2).float() * 
                         (-torch.log(torch.tensor(10000.0)) / d_model))
    
    pe_sin = torch.sin(position * div_term)
    pe_cos = torch.cos(position * div_term)
    
    # 绘制不同维度的位置编码
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    dims = [0, 1, 128, 256]
    for idx, d in enumerate(dims):
        ax = axes[idx // 2, idx % 2]
        freq = div_term[d // 2].item() if d % 2 == 0 else div_term[d // 2 - 1].item() if d > 0 else div_term[0].item()
        wave = pe_sin[:, d].numpy() if d < d_model else np.zeros(max_len)
        ax.plot(range(max_len), wave)
        ax.set_title(f"维度 d={d}, 频率={freq:.6f}")
        ax.set_xlabel("位置")
        ax.set_ylabel("PE 值")
        ax.set_ylim(-1.1, 1.1)
    
    plt.tight_layout()
    plt.savefig("positional_encoding.png", dpi=150)
    print("已保存 positional_encoding.png")
    
    # 展示相对位置线性变换性质
    print("\\n相对位置关系验证：PE(pos+k) ≈ T_k · PE(pos)")
    pos = 50
    k = 10
    # 检查低维子空间中的线性关系
    for d in [0, 2, 4]:
        pe_pos = np.array([pe_sin[pos, d].item(), pe_sin[pos, d+1].item()])
        pe_pos_k = np.array([pe_sin[pos+k, d].item(), pe_sin[pos+k, d+1].item()])
        print(f"  PE({pos})  维度{d}-{d+1}: {pe_pos}")
        print(f"  PE({pos+k}) 维度{d}-{d+1}: {pe_pos_k}")

visualize_positional_encoding()`,
                },
            ],
            table: {
                headers: ["位置编码方案", "原理", "可外推长度", "计算开销", "代表模型"],
                rows: [
                    ["正弦/余弦编码", "不同频率的正余弦函数", "✅ 可外推", "O(1) 预计算", "原始 Transformer"],
                    ["可学习编码", "每个位置一个可训练向量", "❌ 不可外推", "O(L) 参数", "BERT, ViT"],
                    ["RoPE (旋转编码)", "旋转矩阵编码相对位置", "✅ 可外推", "O(1)", "LLaMA, PaLM"],
                    ["ALiBi", "注意力分数加线性偏置", "✅ 可外推", "O(n²) 注意力内", "MPT"],
                    ["Fire (函数化)", "MLP 生成位置编码", "✅ 可外推", "O(1)", "某些长上下文模型"],
                ],
            },
            mermaid: `graph TD
    subgraph "位置编码的作用"
        I["词嵌入 X (无位置信息)"] --> Add["加"]
        P["位置编码 PE(i)"] --> Add
        Add --> E["X + PE (含位置信息)"]
        E --> SA["自注意力层"]
        SA --> O["输出 (位置感知)"]
    end
    
    subgraph "正弦编码频率结构"
        LowDim["低维度 (d=0,2,...)"] -->|高频| Detail["细粒度位置区分"]
        HighDim["高维度 (d=d-2,d)"] -->|低频| Global["粗粒度位置区分"]
    end
    class O s2
    class E s1
    class I s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
            warning: "位置编码的维度必须与词嵌入维度完全匹配！如果使用预训练的词嵌入（如 GloVe），需要确保 d_model 等于词嵌入维度，或者增加一个额外的线性投影层。另外，正弦编码在位置 0 处的编码是全零，这意味着第一个 token 的表示完全由词嵌入决定——在某些任务中可能导致信息损失。",
        },
        {
            title: "6. 注意力可视化与可解释性",
            body: `注意力机制最吸引人的特性之一是其可解释性。注意力权重本质上回答了「模型在预测某个输出时，关注了输入中的哪些部分？」这个问题。虽然注意力权重不等同于因果关系或重要性（Abnar & Zuidema, 2020），但它们确实提供了比 RNN 隐藏状态直观得多的分析窗口。

注意力可视化有三种常见形式：单层单头可视化（展示一个 Transformer 层中某一个 attention head 的注意力矩阵）、跨层热力图（将所有层和头的注意力权重聚合展示）、注意力流（Attention Flow，Jain et al. 2021，将多层注意力递归组合以追踪信息流向）。每种形式都有独特的价值：单层分析帮助我们理解单个头的学习模式；跨层聚合揭示网络整体的信息整合策略；注意力流则提供了从输入到输出的完整信息路径。

研究发现，不同层和头倾向于学习不同的模式。浅层头往往关注局部语法关系（如相邻词的依赖），深层头则捕获更抽象的语义关联。某些头甚至学会了类似句法分析树的结构，这表明 Transformer 在训练过程中自发地学习了人类语言学中的某些结构特性。

但必须警惕一个常见的误解：注意力权重高不等于因果关系强。模型可能通过 value 向量中的信息绕过注意力权重直接传递信号（Jain et al., 2020）。因此，注意力可视化是理解模型行为的有力工具，但不是唯一的分析手段。结合梯度分析、探针分类器和因果干预等方法，才能更全面地理解 Transformer 的内部机制。`,
            code: [
                {
                    lang: "python",
                    code: `def visualize_attention_heads(attn_weights, tokens, layer_idx=0, max_heads=4):
    """可视化指定层的前 max_heads 个注意力头"""
    n_heads = attn_weights.size(1)
    seq_len = attn_weights.size(-1)
    n_cols = min(max_heads, n_heads)
    n_rows = (n_heads + n_cols - 1) // n_cols
    
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(4*n_cols, 3*n_rows))
    axes = np.array(axes).flatten()
    
    for h in range(n_heads):
        ax = axes[h]
        attn = attn_weights[0, h].detach().cpu().numpy()  # (seq_len, seq_len)
        im = ax.imshow(attn, cmap='viridis', vmin=0, vmax=1, aspect='auto')
        
        step = max(1, len(tokens) // 15)
        ax.set_xticks(range(0, len(tokens), step))
        ax.set_yticks(range(0, len(tokens), step))
        ax.set_xticklabels([tokens[i] for i in range(0, len(tokens), step)], 
                          rotation=45, ha='right', fontsize=8)
        ax.set_yticklabels([tokens[i] for i in range(0, len(tokens), step)], fontsize=8)
        ax.set_title(f"Head {h}", fontsize=10)
    
    for h in range(n_heads, len(axes)):
        axes[h].axis('off')
    
    fig.suptitle(f"Layer {layer_idx} Attention Heads", fontsize=14, y=1.02)
    plt.tight_layout()
    return fig

# 模拟多层注意力分析
def analyze_attention_patterns(attn_all_layers, n_layers=6, n_heads=8):
    """分析所有层和头的注意力模式类型"""
    patterns = []
    for layer in range(n_layers):
        for head in range(n_heads):
            attn = attn_all_layers[layer][0, head].detach().cpu().numpy()
            seq_len = attn.shape[0]
            
            # 检测注意力模式
            diagonal = np.mean(np.diag(attn))           # 自注意力
            left = np.mean(attn[np.tril_indices(seq_len, -1)])  # 左侧注意力
            right = np.mean(attn[np.triu_indices(seq_len, 1)])  # 右侧注意力
            entropy = -np.sum(attn * np.log(attn + 1e-10), axis=1).mean()
            
            pattern_type = "diagonal" if diagonal > 0.3 else (
                "left" if left > right * 1.5 else "right" if right > left * 1.5 else "uniform")
            patterns.append((layer, head, pattern_type, entropy))
    
    # 统计各层模式分布
    for layer in range(n_layers):
        layer_patterns = [p for p in patterns if p[0] == layer]
        counts = {}
        for _, _, pt, _ in layer_patterns:
            counts[pt] = counts.get(pt, 0) + 1
        print(f"Layer {layer}: {dict(counts)}")
    
    return patterns`,
                },
                {
                    lang: "python",
                    code: `# 注意力流（Attention Flow）——追踪信息从输入到输出
def compute_attention_flow(attn_all_layers):
    """
    计算注意力流：将多层注意力递归组合
    返回 (n_heads_total, seq_len, seq_len) 的聚合注意力矩阵
    """
    # 初始化：第 0 层就是其自身的注意力
    flow = attn_all_layers[0].clone()  # (batch, n_heads, seq_len, seq_len)
    
    # 逐层递归组合
    for layer in range(1, len(attn_all_layers)):
        # 添加残差连接 (I + A) / 2
        residual = torch.eye(flow.size(-1), device=flow.device).unsqueeze(0).unsqueeze(0)
        flow_with_residual = (flow + residual) / 2
        
        # 与当前层注意力组合
        current_attn = attn_all_layers[layer]
        current_with_residual = (current_attn + residual) / 2
        
        # 矩阵乘法组合
        flow = torch.matmul(current_with_residual, flow_with_residual)
    
    return flow

def compute_gradient_attribution(model, input_ids, target_idx):
    """基于梯度的注意力归因分析"""
    model.eval()
    input_ids.requires_grad_(True)
    
    output = model(input_ids)
    logits = output.logits[0, target_idx]
    logits.backward()
    
    # 获取输入嵌入的梯度
    grad = input_ids.grad
    
    # 结合注意力权重的归因分数
    attribution = grad.abs().sum(dim=-1)  # (batch, seq_len)
    return attribution.detach()

# 示例使用
print("注意力流分析可以揭示信息如何跨层传播")
print("梯度归因提供了另一种理解模型决策的视角")`,
                },
            ],
            table: {
                headers: ["可视化方法", "适用场景", "信息量", "计算成本", "局限性"],
                rows: [
                    ["单层单头热力图", "分析单个头的行为", "局部", "低", "无法看到跨层整合"],
                    ["跨层聚合平均", "整体注意力分布", "全局", "低", "可能掩盖头的差异"],
                    ["注意力流 (Flow)", "信息传播路径", "全局+路径", "中", "计算量大"],
                    ["梯度归因", "token 重要性", "局部重要性", "中", "梯度可能不可靠"],
                    ["探针分类器", "语言学属性检测", "隐空间属性", "高", "需要额外训练"],
                    ["因果干预", "因果关系验证", "因果", "很高", "实现复杂"],
                ],
            },
            mermaid: `graph TD
    subgraph "注意力分析层次"
        L1["单层可视化"] -->|"观察单个头"| L2["跨层聚合"]
        L2 -->|"递归组合"| L3["注意力流"]
        L3 -->|"信息路径"| L4["因果分析"]
    end
    
    subgraph "分析方法对比"
        A1["注意力权重热力图"] -->|"直观但不充分"| R1["⚠️ 注意：高注意力 ≠ 高因果影响"]
        A2["梯度归因"] -->|"基于灵敏度"| R2["梯度可能被噪声影响"]
        A3["探针分类器"] -->|"检测编码属性"| R3["探针能力有限"]
        A4["因果干预"] -->|"真正因果测试"| R4["最可靠但最复杂"]
    end
    class R1 s1
    class L4 s0
    classDef s0 fill:#7c2d12
    classDef s1 fill:#7f1d1d`,
            tip: "实用建议：在调试 NLP 模型时，第一步应该是可视化注意力权重。如果你看到某个头完全退化为均匀分布（所有位置权重几乎相同），说明这个头可能没有学到有用的模式，可以考虑减少头数或调整学习率。",
        },
        {
            title: "7. PyTorch 实战：从零实现注意力层",
            body: `理论终究要落地为代码。本节从零开始实现一个完整的注意力模块，包括 Scaled Dot-Product Attention、Multi-Head Attention、Positional Encoding 和 Transformer 编码器层，并在一个实际任务上验证其正确性。

实现时的几个关键细节值得注意：mask 的处理——padding mask 用于屏蔽输入序列中的填充位置，causal mask（也叫 look-ahead mask）用于解码器中防止看到未来的 token；数值稳定性——softmax 之前的大负数可能导致数值溢出，PyTorch 的 softmax 在数值上是稳定的，但手动实现时需要注意；性能优化——在真实场景中，我们通常使用 PyTorch 原生的 F.scaled_dot_product_attention（2.0+ 版本），它会自动选择最优的注意力算法（Flash Attention、记忆高效注意力等）。

我们将通过一个「序列复制」任务（输入和输出相同）来验证实现的正确性。这是一个简单的自监督任务——如果注意力机制实现正确，模型应该能够轻松学会将输入复制到输出。同时，我们可以观察到注意力权重确实呈现出对角线模式（每个位置主要关注自己）。`,
            code: [
                {
                    lang: "python",
                    code: `class TransformerEncoderLayer(nn.Module):
    """从零实现 Transformer 编码器层"""
    def __init__(self, d_model=512, n_heads=8, d_ff=2048, dropout=0.1):
        super().__init__()
        self.self_attn = MultiHeadAttention(d_model, n_heads, dropout)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_ff, d_model),
            nn.Dropout(dropout),
        )
        self.dropout1 = nn.Dropout(dropout)
        self.dropout2 = nn.Dropout(dropout)
    
    def forward(self, src, src_mask=None):
        # 自注意力 + 残差 + 层归一化
        attn_output, attn_weights = self.self_attn(src, src, src, mask=src_mask)
        src = self.norm1(src + self.dropout1(attn_output))
        
        # FFN + 残差 + 层归一化
        ffn_output = self.ffn(src)
        src = self.norm2(src + self.dropout2(ffn_output))
        return src, attn_weights


class TransformerEncoder(nn.Module):
    """完整 Transformer 编码器"""
    def __init__(self, vocab_size, d_model=512, n_heads=8, n_layers=6,
                 d_ff=2048, max_len=5000, dropout=0.1):
        super().__init__()
        self.d_model = d_model
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_encoding = SinusoidalPositionalEncoding(d_model, max_len, dropout)
        self.layers = nn.ModuleList([
            TransformerEncoderLayer(d_model, n_heads, d_ff, dropout)
            for _ in range(n_layers)
        ])
        self.norm = nn.LayerNorm(d_model)
        self.scale = torch.sqrt(torch.tensor(float(d_model)))
    
    def create_padding_mask(self, src, pad_idx=0):
        return (src != pad_idx).unsqueeze(1).unsqueeze(2)  # (batch, 1, 1, seq_len)
    
    def forward(self, src, pad_idx=0):
        src_mask = self.create_padding_mask(src, pad_idx)
        
        # 嵌入 + 缩放 + 位置编码
        x = self.embedding(src) * self.scale
        x = self.pos_encoding(x)
        
        all_attn_weights = []
        for layer in self.layers:
            x, attn_weights = layer(x, src_mask)
            all_attn_weights.append(attn_weights)
        
        return self.norm(x), all_attn_weights`,
                },
                {
                    lang: "python",
                    code: `# 完整训练循环验证
import torch.optim as optim

def test_transformer_encoder():
    """在序列复制任务上测试 Transformer 编码器"""
    torch.manual_seed(42)
    
    VOCAB_SIZE = 100
    D_MODEL = 128
    N_HEADS = 4
    N_LAYERS = 3
    MAX_LEN = 20
    BATCH_SIZE = 32
    EPOCHS = 50
    
    model = TransformerEncoder(VOCAB_SIZE, D_MODEL, N_HEADS, N_LAYERS, 
                               d_ff=512, max_len=MAX_LEN, dropout=0.1)
    output_linear = nn.Linear(D_MODEL, VOCAB_SIZE)
    optimizer = optim.Adam(list(model.parameters()) + list(output_linear.parameters()), lr=1e-3)
    criterion = nn.CrossEntropyLoss()
    
    for epoch in range(EPOCHS):
        # 生成随机序列（长度 5-15）
        lengths = torch.randint(5, 16, (BATCH_SIZE,))
        src = torch.zeros(BATCH_SIZE, MAX_LEN, dtype=torch.long)
        for i, length in enumerate(lengths):
            src[i, :length] = torch.randint(1, VOCAB_SIZE, (length,))
        
        optimizer.zero_grad()
        encoded, _ = model(src)
        logits = output_linear(encoded)
        
        loss = 0
        for i, length in enumerate(lengths):
            loss += criterion(logits[i, :length], src[i, :length])
        loss /= BATCH_SIZE
        
        loss.backward()
        optimizer.step()
        
        if epoch % 10 == 0:
            # 计算准确率
            with torch.no_grad():
                preds = logits.argmax(dim=-1)
                correct = 0
                total = 0
                for i, length in enumerate(lengths):
                    correct += (preds[i, :length] == src[i, :length]).sum().item()
                    total += length
                acc = correct / total * 100
            print(f"Epoch {epoch:3d}: Loss={loss:.4f}, Acc={acc:.1f}%")
    
    print("\\n✅ Transformer 编码器测试完成！")

test_transformer_encoder()`,
                },
            ],
            table: {
                headers: ["组件", "PyTorch 原生替代", "自定义实现的优势", "何时用原生"],
                rows: [
                    ["MultiHeadAttention", "nn.MultiheadAttention", "完全控制细节，理解原理", "生产环境推荐原生"],
                    ["PositionalEncoding", "无直接等价", "必须自定义", "始终自定义"],
                    ["EncoderLayer", "nn.TransformerEncoderLayer", "灵活修改 FFN 结构", "标准架构用原生"],
                    ["LayerNorm", "nn.LayerNorm", "无", "始终用原生"],
                    ["Scaled Dot-Product", "F.scaled_dot_product_attention", "教学和调试", "生产用 Flash Attention"],
                    ["Padding Mask", "key_padding_mask 参数", "统一接口", "生产用原生"],
                ],
            },
            mermaid: `graph TD
    subgraph "Transformer 编码器完整数据流"
        Input["输入 token IDs (batch, seq_len)"] --> Embed["词嵌入 (batch, seq_len, d_model)"]
        Embed --> Scale["缩放 × √d_model"]
        Scale --> PE["+ 位置编码"]
        PE --> Dropout["Embedding Dropout"]
        Dropout --> L1["Encoder Layer 1"]
        L1 --> L2["Encoder Layer 2"]
        L2 --> LN["..."]
        LN --> L3["Encoder Layer N"]
        L3 --> Norm["LayerNorm"]
        Norm --> Output["输出 (batch, seq_len, d_model)"]
    end
    
    subgraph "单个 Encoder Layer 内部"
        L1 -->|"Multi-Head Attention"| MHA["自注意力"]
        MHA -->|"残差 + LayerNorm"| Res1["Add & Norm"]
        Res1 -->|"FFN (Linear → ReLU → Linear)"| FFN["前馈网络"]
        FFN -->|"残差 + LayerNorm"| Res2["Add & Norm"]
        Res2 --> L2
    end
    class MHA s2
    class Output s1
    class Input s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
            warning: "常见实现错误：(1) 忘了在词嵌入后乘以 √d_model——这会导致嵌入和位置编码的尺度不一致；(2) LayerNorm 的位置——原始 Transformer 使用 post-norm（残差后归一化），但 pre-norm（归一化在残差前）在深层网络中更稳定；(3) FFN 的 hidden 维度通常是 d_model 的 4 倍，不要太小；(4) 训练时务必使用 teacher forcing 或类似策略，否则自回归解码器容易崩溃。",
        },
    ],
};
