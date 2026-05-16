import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-004",
    title: "注意力机制与 Transformer 架构",
    category: "dl",
    tags: ["Attention", "Transformer", "自注意力"],
    summary: "详解 Self-Attention、Multi-Head Attention 和 Transformer 的编码器-解码器结构",
    date: "2026-04-01",
    readTime: "30 min",
    level: "高级",
    content: [
      {
        title: "1. 为什么需要注意力机制？",
        body: `在 **Transformer** 出现之前，序列建模主要依赖 RNN 和 LSTM。这些模型按顺序处理序列，导致两个核心问题：一是无法并行计算，训练速度慢——每个时间步必须等前一步完成才能开始；二是长距离依赖问题——序列开头的信息经过数十步传递后已经严重衰减。

注意力机制（Attention Mechanism）的核心思想非常直观：让模型在处理每个位置时，都能"看到"序列中所有其他位置的信息，并根据语义相关性分配不同的权重。这就像人类阅读时的注意力分配——读到代词"他"时，你会自动回看前文找到对应的名词。

注意力机制有三大优势：第一，全局视野——每个位置直接访问所有其他位置，不受距离影响；第二，完全并行——所有位置的注意力计算可以同时进行；第三，可解释性——注意力权重可以可视化为热力图，直观展示模型"关注"了什么。

注意力机制最早在 Bahdanau 等人的神经机器翻译工作中提出（2014），用于替代 Seq2Seq 模型中的固定长度上下文向量。**Transformer**（Vaswani et al., 2017）将其推广为通用的序列建模架构，彻底改变了 NLP 乃至整个 AI 领域。`,
        mermaid: `graph LR
    A["输入序列"] --> B["Query 查询"]
    A --> C["Key 键"]
    A --> D["Value 值"]
    B --> E["Attention Score"]
    C --> E
    E --> F["Softmax 归一化"]
    D --> G["加权求和"]
    F --> G
    G --> H["输出向量"]`,
        tip: `直觉理解：注意力机制就是"查字典"——Query 是你要查的词，Key 是字典的索引，Value 是字典的内容。你根据 Query 和 Key 的匹配程度，从 Value 中加权取出信息。`,
      },
      {
        title: "2. Scaled Dot-Product Attention 详解",
        body: `**Transformer** 使用的核心注意力机制是 Scaled Dot-Product Attention。其计算公式为：

Attention(Q, K, V) = softmax(QKᵀ / √dₖ) V

其中 Q（Query）、K（Key）、V（Value）都是从输入通过线性变换得到的矩阵，dₖ 是每个头的维度。

理解这个公式需要分三步：第一步，QKᵀ 计算每个 Query 与每个 Key 的点积，得到 n×n 的注意力分数矩阵，分数越高表示两个位置越相关；第二步，除以 √dₖ 进行缩放——这是关键设计。如果不缩放，当 dₖ 较大时，点积结果会很大，导致 softmax 函数进入梯度极小的饱和区（"sharp softmax"问题），梯度几乎为零，模型无法训练；第三步，softmax 将分数归一化为概率分布（每行之和为 1），然后以此对 Value 加权求和。

点积作为注意力函数并非随意选择。当 Q 和 K 是单位向量时，点积等于余弦相似度，天然衡量方向一致性。而且点积可以用高度优化的矩阵乘法实现，计算效率远超加性注意力（Additive Attention）。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k: int, dropout: float = 0.1):
        super().__init__()
        self.d_k = d_k
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, Q, K, V, mask=None):
        """
        Args:
            Q, K, V: (batch, heads, seq_len, d_k)
            mask: (batch, 1, 1, seq_len) 或 (batch, 1, seq_len, seq_len)
        Returns:
            output: (batch, heads, seq_len, d_k)
            weights: (batch, heads, seq_len, seq_len)
        """
        scores = torch.matmul(Q, K.transpose(-2, -1))
        scores = scores / math.sqrt(self.d_k)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
        
        attention_weights = torch.softmax(scores, dim=-1)
        attention_weights = self.dropout(attention_weights)
        
        output = torch.matmul(attention_weights, V)
        return output, attention_weights

# 演示：注意力权重的含义
d_k = 64
attention = ScaledDotProductAttention(d_k)
Q = torch.randn(1, 1, 3, d_k)  # 3个位置的Query
K = Q.clone()  # 自注意力：Q=K
V = torch.randn(1, 1, 3, d_k)
output, weights = attention(Q, K, V)
print(f"注意力权重形状: {weights.shape}")
print(f"(batch=1, heads=1, 3个位置×3个位置)")
# 每行是一个位置对所有位置的注意力分布
print(f"位置0的注意力分布: {weights[0,0,0,:].detach().numpy().round(3)}")`,
          },
          {
            lang: "python",
            code: `# 缩放因子的重要性演示
import torch
import math

def softmax_without_scale(d_k=64):
    """演示不缩放时 softmax 的梯度消失问题"""
    for d in [8, 32, 64, 128, 512]:
        # 模拟点积结果（均值为0，方差为d的高斯分布）
        scores = torch.randn(1000, d)
        weights = torch.softmax(scores, dim=-1)
        # 检查最大权重（接近1表示sharp）
        max_w = weights.max(dim=-1).values.mean().item()
        # 检查梯度（softmax的Jacobian范数）
        weights.requires_grad_(True)
        loss = weights.sum()
        loss.backward()
        grad_norm = weights.grad.norm().item()
        print(f"  d_k={d:4d} | max_weight={max_w:.4f} | grad_norm={grad_norm:.6f}")

print("=== 无缩放时 softmax 的行为 ===")
softmax_without_scale()

print("\ === 有缩放 (除以 √d_k) ===")
for d in [8, 32, 64, 128, 512]:
    scores = torch.randn(1000, d) / math.sqrt(d)
    weights = torch.softmax(scores, dim=-1)
    max_w = weights.max(dim=-1).values.mean().item()
    print(f"  d_k={d:4d} | max_weight={max_w:.4f}")`,
          },
        ],
        table: {
          headers: ["注意力类型", "计算方式", "优点", "缺点", "使用场景"],
          rows: [
            ["Dot-Product", "Q·Kᵀ", "计算快（矩阵乘法）", "d_k 大时需缩放", "Transformer 标准"],
            ["Scaled Dot-Product", "Q·Kᵀ / √d_k", "解决 sharp softmax", "无", "Transformer 标准"],
            ["Additive", "W·tanh(W₁Q + W₂K)", "d_k 大时更稳定", "计算慢", "早期 Seq2Seq"],
            ["Local Attention", "只关注窗口内", "O(n·w) 而非 O(n²)", "丢失全局信息", "长序列高效处理"],
          ],
        },
      },
      {
        title: "3. Multi-Head Attention：多视角并行",
        body: `Multi-Head Attention 的核心思想是：与其让模型用一个注意力头去捕捉所有类型的依赖关系，不如用多个注意力头各自学习不同的表示子空间。每个头独立计算注意力，然后将结果拼接并通过线性变换融合。

具体来说，输入首先通过 h 组不同的线性变换（Wᵢᵠ, Wᵢᴷ, Wᵢⱽ），得到 h 组 Q/K/V。每组 Q/K/V 独立计算 Scaled Dot-Product Attention，得到 h 个输出。然后将这 h 个输出拼接（Concatenate），再通过一个最终的线性变换 Wᴼ 得到最终输出。

多头注意力的直觉理解：想象你在分析一句话中的每个词。一个注意力头可能关注语法关系（主谓一致、修饰关系），另一个关注语义关联（同义词、反义词），第三个关注长距离依赖（代词指代）。每个头专精于一种"视角"，组合起来就能获得更丰富的表示。

在原始 **Transformer** 中，h=8，d_model=512，因此每个头的维度 d_k = 512/8 = 64。多头注意力的总参数量与单头相同（因为 d_k 缩小了 h 倍），但表达能力显著增强。`,
        code: [
          {
            lang: "python",
            code: `class MultiHeadAttention(nn.Module):
    def __init__(self, d_model: int, num_heads: int, dropout: float = 0.1):
        super().__init__()
        assert d_model % num_heads == 0
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        self.attention = ScaledDotProductAttention(self.d_k, dropout)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, Q, K, V, mask=None):
        batch_size = Q.size(0)
        
        # 线性变换并分头: (batch, seq_len, d_model) -> (batch, heads, seq_len, d_k)
        Q = self.W_q(Q).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(K).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(V).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        # 多头注意力
        attn_output, weights = self.attention(Q, K, V, mask)
        
        # 拼接所有头: (batch, heads, seq_len, d_k) -> (batch, seq_len, d_model)
        attn_output = attn_output.transpose(1, 2).contiguous() \\
            .view(batch_size, -1, self.d_model)
        
        output = self.W_o(attn_output)
        return self.dropout(output), weights

# 参数量对比
d_model, num_heads = 512, 8
single_head_params = 3 * (d_model * d_model) + d_model  # Q, K, V 投影 + 输出
multi_head_params = 3 * (d_model * d_model) + d_model   # 相同！
print(f"单头参数量: {single_head_params:,}")
print(f"多头参数量: {multi_head_params:,} (相同，但表达能力更强)")`,
          },
        ],
        mermaid: `graph TD
    X["输入 X"] --> Q["W_q → Q"]
    X --> K["W_k → K"]
    X --> V["W_v → V"]
    
    Q --> S1["Split 头1"]
    Q --> S2["Split 头2"]
    Q --> S3["Split 头H"]
    K --> S1
    K --> S2
    K --> S3
    V --> S1
    V --> S2
    V --> S3
    
    S1 --> A1["Attention 1"]
    S2 --> A2["Attention 2"]
    S3 --> A3["Attention H"]
    
    A1 --> C["Concat"]
    A2 --> C
    A3 --> C
    C --> W["W_o 线性变换"]
    W --> Y["输出"]
    class W s1
    class C s0
    classDef s0 fill:#78350f,color:#f1f5f9
    classDef s1 fill:#064e3b,color:#f1f5f9`,
      },
      {
        title: "4. Transformer 整体架构",
        body: `完整的 **Transformer** 由编码器和解码器堆叠而成。原始论文使用 N=6 层，现代 LLM 使用 32-128 层。

编码器（Encoder）：由 N 个相同层堆叠。每层包含两个子层：(1) 多头自注意力（Self-Attention）——让每个位置关注序列中的所有位置；(2) 位置级前馈网络（Position-wise FFN）——一个两层 MLP，对每个位置独立处理。每个子层都使用残差连接（Residual Connection）和层归一化（LayerNorm），即 LayerNorm(x + Sublayer(x))。

解码器（Decoder）：同样由 N 层堆叠，但每层包含三个子层：(1) 带掩码的多头自注意力——防止位置 i 关注到位置 i 之后的信息（因果掩码）；(2) 交叉注意力（Cross-Attention）——Query 来自解码器，Key 和 Value 来自编码器输出，让解码器"关注"输入序列的相关信息；(3) 位置级 FFN。

残差连接是 **Transformer** 能训练很深网络的关键。它让梯度可以直接跨层传播，避免了深层网络中的梯度消失问题。层归一化则稳定了每层的输入分布，加速训练并允许更大的学习率。`,
        code: [
          {
            lang: "python",
            code: `class TransformerEncoderLayer(nn.Module):
    """Transformer 编码器单层"""
    
    def __init__(self, d_model: int, num_heads: int, d_ff: int, dropout: float = 0.1):
        super().__init__()
        self.self_attn = MultiHeadAttention(d_model, num_heads, dropout)
        self.norm1 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_ff, d_model),
        )
        self.norm2 = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        # 子层1: 自注意力 + 残差 + LayerNorm
        attn_out, _ = self.self_attn(x, x, x, mask)
        x = self.norm1(x + self.dropout(attn_out))
        # 子层2: FFN + 残差 + LayerNorm
        ffn_out = self.ffn(x)
        x = self.norm2(x + self.dropout(ffn_out))
        return x

class TransformerDecoderLayer(nn.Module):
    """Transformer 解码器单层"""
    
    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super().__init__()
        self.self_attn = MultiHeadAttention(d_model, num_heads, dropout)
        self.cross_attn = MultiHeadAttention(d_model, num_heads, dropout)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.norm3 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_ff, d_model),
        )
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, memory, src_mask=None, tgt_mask=None):
        # 子层1: 掩码自注意力
        attn_out, _ = self.self_attn(x, x, x, tgt_mask)
        x = self.norm1(x + self.dropout(attn_out))
        # 子层2: 交叉注意力
        cross_out, _ = self.cross_attn(x, memory, memory, src_mask)
        x = self.norm2(x + self.dropout(cross_out))
        # 子层3: FFN
        ffn_out = self.ffn(x)
        x = self.norm3(x + self.dropout(ffn_out))
        return x`,
          },
        ],
        mermaid: `graph TD
    subgraph "编码器 (Encoder × N)"
        A["输入 Embedding"] --> B["位置编码"]
        B --> C["Multi-Head Self-Attention"]
        C --> D["Add & LayerNorm"]
        D --> E["Feed Forward NN"]
        E --> F["Add & LayerNorm"]
    end
    
    subgraph "解码器 (Decoder × N)"
        G["输出 Embedding"] --> H["位置编码"]
        H --> I["Masked Self-Attention"]
        I --> J["Add & LayerNorm"]
        J --> K["Cross-Attention"]
        F -.->|encoder output| K
        K --> L["Add & LayerNorm"]
        L --> M["Feed Forward NN"]
        M --> N["Add & LayerNorm"]
    end
    
    N --> O["Linear + Softmax"]
    O --> P["输出概率分布"]
    class M s3
    class E s2
    class K s1
    class C s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12
    classDef s3 fill:#7c2d12`,
      },
      {
        title: "5. 位置编码：让模型感知顺序",
        body: `由于 **Transformer** 完全基于注意力机制，没有任何时序概念——打乱输入序列的顺序，自注意力的输出只会相应地打乱，但值不变。因此需要显式地注入位置信息。

原始 **Transformer** 使用正弦/余弦函数的位置编码：

PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

这种设计有三个巧妙之处：第一，不同维度使用不同频率的正弦波，低频维度编码粗粒度位置（远距离），高频维度编码细粒度位置（近距离）；第二，对于任意固定偏移量 k，PE(pos+k) 可以表示为 PE(pos) 的线性变换，这使得模型能学习到相对位置关系；第三，正弦编码可以外推到训练时未见过的序列长度。

现代 LLM 更多使用可学习的位置编码（Learned Positional Embedding）或旋转位置编码（RoPE）。RoPE 通过旋转矩阵将位置信息编码到 Q 和 K 的内积中，使得注意力分数只依赖于相对位置，且具有更好的外推性能。`,
        code: [
          {
            lang: "python",
            code: `class PositionalEncoding(nn.Module):
    """原始 Transformer 的正弦位置编码"""
    def __init__(self, d_model: int, max_len: int = 5000):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2) * 
                            -(math.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)  # (1, max_len, d_model)
        self.register_buffer('pe', pe)
    
    def forward(self, x):
        # x shape: (batch, seq_len, d_model)
        return x + self.pe[:, :x.size(1)]

# 可视化位置编码
pe = PositionalEncoding(d_model=64)
positions = pe.pe[0, :20, :].numpy()
print(f"位置编码形状: {positions.shape}")
print(f"(20个位置 × 64维)")
# 不同维度使用不同频率
print(f"\ 位置 0 的前8维: {positions[0, :8].round(3)}")
print(f"位置 5 的前8维: {positions[5, :8].round(3)}")
print(f"位置 10 的前8维: {positions[10, :8].round(3)}")`,
          },
        ],
        table: {
          headers: ["位置编码", "原理", "可外推", "相对位置", "代表模型"],
          rows: [
            ["正弦/余弦", "固定频率函数", "✅ 可以", "✅ 线性变换", "原始 Transformer"],
            ["可学习 Embedding", "查表学习", "❌ 受限于最大长度", "❌ 隐式", "BERT, GPT-2"],
            ["RoPE 旋转", "旋转矩阵编码", "✅ 优秀", "✅ 天然支持", "LLaMA, PaLM"],
            ["ALiBi", "注意力偏置线性项", "✅ 优秀", "✅ 直接", "MPT"],
          ],
        },
      },
      {
        title: "6. 前馈网络（FFN）与层归一化",
        body: `**Transformer** 的前馈网络（Feed-Forward Network, FFN）是一个简单的两层 MLP，但有几个关键设计细节值得注意。

FFN 的结构：FFN(x) = max(0, xW₁ + b₁)W₂ + b₂。第一层将维度从 d_model 扩展到 d_ff（通常是 d_model 的 4 倍），ReLU 激活后，第二层再压缩回 d_model。扩展-压缩的设计让模型有足够的容量在每个位置独立地进行非线性变换。

FFN 是"position-wise"的——它对序列中的每个位置独立应用相同的变换。这意味着 FFN 不捕捉位置间的关系（这是注意力的工作），而是对每个位置的表示进行独立的非线性处理。

层归一化（Layer Normalization）在 **Transformer** 中有两种放置方式：Post-LN（原始论文，LayerNorm 在残差连接之后）和 Pre-LN（LayerNorm 在子层之前）。Pre-LN 在训练中更稳定，是现代 Transformer 的标准选择。Post-LN 在理论上表达能力更强，但需要 warmup 学习率策略才能稳定训练。`,
        code: [
          {
            lang: "python",
            code: `class FFN(nn.Module):
    """Transformer 前馈网络"""
    def __init__(self, d_model: int, d_ff: int, dropout: float = 0.1):
        super().__init__()
        self.linear1 = nn.Linear(d_model, d_ff)
        self.linear2 = nn.Linear(d_ff, d_model)
        self.dropout = nn.Dropout(dropout)
        self.activation = nn.ReLU()
    
    def forward(self, x):
        # x: (batch, seq_len, d_model)
        return self.linear2(self.dropout(self.activation(self.linear1(x))))

# FFN 的扩展比
d_model = 512
d_ff = 2048  # 4倍扩展
print(f"d_model={d_model}, d_ff={d_ff}, 扩展比={d_ff/d_model}x")
ffn = FFN(d_model, d_ff)
x = torch.randn(2, 10, d_model)
out = ffn(x)
print(f"输入: {x.shape} -> 中间: {d_ff}维 -> 输出: {out.shape}")
print(f"FFN 参数量: {sum(p.numel() for p in ffn.parameters()):,}")`,
          },
        ],
        table: {
          headers: ["归一化方式", "放置位置", "训练稳定性", "表达能力", "需要 Warmup"],
          rows: [
            ["Post-LN", "残差之后", "❌ 需 Warmup", "✅ 更强", "✅ 需要"],
            ["Pre-LN", "子层之前", "✅ 稳定", "⚠️ 稍弱", "❌ 不需要"],
            ["DeepNorm", "加权残差", "✅ 稳定", "✅ 更强", "❌ 不需要"],
            ["RMSNorm", "子层之前", "✅ 稳定", "✅ 等同 Pre-LN", "❌ 不需要"],
          ],
        },
        warning: "Transformer 对超参数非常敏感！学习率太小训练极慢，太大直接发散。建议使用带 warmup 的余弦衰减调度器，初始学习率设为 1e-4 到 3e-4。",
      },
      {
        title: "7. Transformer 与 RNN/CNN 对比",
        body: `**Transformer** 并非在所有场景下都优于 RNN 和 CNN。理解它们的优缺点对比，能帮助你在实际问题中做出正确的架构选择。

计算复杂度是 **Transformer** 最大的瓶颈。自注意力的复杂度是 O(n²·d)，其中 n 是序列长度，d 是模型维度。当 n=4096 时，n²≈16M，这使得训练超长序列的内存和时间开销巨大。相比之下，RNN 的复杂度是 O(n·d²)，CNN 的复杂度是 O(k·n·d²)（k 是卷积核大小）。

内存瓶颈同样显著。训练时，自注意力需要存储 n×n 的注意力权重矩阵用于反向传播。对于 n=32768（32K 上下文），仅这一项就需要 32K²×4bytes ≈ 4GB 内存（单精度）。这就是为什么长上下文训练需要 Flash Attention 等优化技术。`,
        table: {
          headers: ["特性", "RNN/LSTM", "CNN", "Transformer"],
          rows: [
            ["并行计算", "❌ 顺序处理", "✅ 完全并行", "✅ 完全并行"],
            ["长距离依赖", "⚠️ 随距离衰减", "⚠️ 受感受野限制", "✅ 全局注意力"],
            ["计算复杂度/序列", "O(d²)", "O(k·d²)", "O(n·d)"],
            ["训练速度", "慢", "快", "快（但内存消耗大）"],
            ["典型应用", "流式语音、时间序列", "图像、局部模式", "LLM/翻译/摘要"],
            ["推理延迟", "低（逐 token）", "低", "高（需完整上下文）"],
          ],
        },
        mermaid: `graph TD
    A["选择序列模型"] --> B{"序列长度？"}
    B -->|< 512| C{"需要什么能力？"}
    B -->|> 4096| D["高效 Transformer Flash Attention / Linear Attn"]
    B -->|512-4096| E["标准 Transformer"]
    C -->|"流式/低延迟"| F["RNN/LSTM"]
    C -->|"局部模式"| G["CNN / Convolutions"]
    C -->|"全局依赖"| E
    D --> H["需要长上下文？"]
    H -->|是| I["RoPE + Flash Attention"]
    H -->|否| E
    F --> J["语音识别、时间序列"]
    G --> K["CV、局部 NLP 任务"]
    E --> L["翻译、摘要、LLM"]
    I --> M["长文档理解、检索增强"]`,
      },
      {
        title: "8. 从 Transformer 到大语言模型",
        body: `**Transformer** 架构是现代大语言模型的基石。理解从原始 **Transformer** 到现代 LLM 的演变路径，是理解整个 AI 发展脉络的关键。

GPT 系列采用 Decoder-only 架构，去掉了编码器，只保留解码器部分。在训练时，GPT 使用因果语言模型目标（预测下一个 token），这使得它天然适合文本生成。BERT 则采用 Encoder-only 架构，使用掩码语言模型（MLM）目标，擅长理解任务。T5 使用完整的 Encoder-Decoder 架构，将所有 NLP 任务统一为"文本到文本"格式。

从 GPT 到 **GPT-4** 的关键演进包括：更大的规模（从 1.17 亿参数到万亿级）、更好的数据质量、**RLHF**（基于人类反馈的强化学习）对齐、多模态能力。**LLaMA** 系列则证明了：精心设计的架构（RMSNorm + SwiGLU + RoPE）加上高质量数据，可以在更小规模下达到可比效果。`,
        list: [
          "GPT (2018): Decoder-only，自回归生成，开启了 LLM 时代",
          "BERT (2018): Encoder-only，掩码语言模型，NLP 预训练的里程碑",
          "T5 (2019): 统一文本到文本框架，Encoder-Decoder 架构",
          "PaLM (2022): 规模扩展到 540B 参数，验证了 scaling law",
          "LLaMA (2023): 高效开源 LLM，RMSNorm + SwiGLU + RoPE",
          "GPT-4/Claude 3 (2024): 多模态能力，百万级上下文窗口",
        ],
        tip: "学习建议：先手写一个最小 Transformer（约 200 行代码），再阅读原始论文 \"Attention Is All You Need\"，最后研究现代 LLM 中的改进（RoPE、Flash Attention、GQA 等）。",
      },
    ],
  };
