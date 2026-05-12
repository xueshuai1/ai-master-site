import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-008",
    title: "上下文窗口扩展：RoPE, ALiBi",
    category: "llm",
    tags: ["上下文窗口", "RoPE", "位置编码"],
    summary: "突破长度限制，理解大模型如何扩展到超长上下文",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
        {
            title: "1. 位置编码基础：绝对 vs 相对",
            body: `**Transformer** 的自注意力机制本身不具备位置感知能力——它本质上是集合上的排列不变操作。如果不引入位置信息，「猫追狗」和「狗追猫」会得到完全相同的表示。位置编码的任务就是为每个 token 注入其序列中的位置信息，使模型能够区分排列。

最早的绝对位置编码（Absolute Positional Encoding）在原始 **Transformer** 中使用正弦/余弦函数生成固定向量，或通过训练获得可学习的位置嵌入。绝对位置编码的公式为 PE(pos,2i) = sin(pos/10000^(2i/d))，其中 pos 是位置索引，i 是维度索引。这种方法的优点是简单直观，但缺陷明显：它只能外推到训练时见过的最大位置，超出范围的泛化能力极差。

相对位置编码（Relative Positional Encoding）则不同——它不关心 token 的绝对位置，而是编码 token 之间的距离。注意力分数不再只取决于 query 和 key 的内容，还取决于它们之间的距离：A(i,j) = f(Q_i, K_j, i-j)。这种方式更符合语言理解的自然直觉——我们关心的是「两个词相距多远」而非「它们在第几个位置」。相对位置编码具有更好的外推性质，是后续 RoPE 和 ALiBi 的思想源头。`,
            code: [
                {
                    lang: "python",
                    code: `# 绝对位置编码（正弦/余弦方案）
import numpy as np

def get_sinusoidal_pe(seq_len: int, d_model: int) -> np.ndarray:
    """生成正弦绝对位置编码矩阵 [seq_len, d_model]"""
    pe = np.zeros((seq_len, d_model))
    position = np.arange(seq_len)[:, np.newaxis]
    div_term = np.exp(np.arange(0, d_model, 2) *
                      -(np.log(10000.0) / d_model))
    pe[:, 0::2] = np.sin(position * div_term)
    pe[:, 1::2] = np.cos(position * div_term)
    return pe

# 可学习的位置嵌入
import torch
learned_pe = torch.nn.Embedding(num_embeddings=4096,
                                embedding_dim=4096)`
                },
                {
                    lang: "python",
                    code: `# 相对位置编码（Shaw et al. 方案）
import torch

class RelativeAttention(torch.nn.Module):
    def __init__(self, d_model: int, max_rel_pos: int = 128):
        super().__init__()
        self.max_rel_pos = max_rel_pos
        # 相对位置的可学习嵌入
        self.rel_k_emb = torch.nn.Embedding(
            2 * max_rel_pos - 1, d_model)
        self.rel_v_emb = torch.nn.Embedding(
            2 * max_rel_pos - 1, d_model)

    def forward(self, q: torch.Tensor, k: torch.Tensor,
                v: torch.Tensor) -> torch.Tensor:
        # 裁剪相对位置到 [-max_rel_pos+1, max_rel_pos-1]
        rel_pos = self.get_relative_positions(q)
        rel_k = self.rel_k_emb(rel_pos)
        rel_v = self.rel_v_emb(rel_pos)
        # 内容-内容注意力 + 内容-位置注意力
        scores = torch.matmul(q, k.transpose(-2, -1))
        scores += torch.matmul(q, rel_k.transpose(-2, -1))
        weights = torch.softmax(scores, dim=-1)
        return torch.matmul(weights, v + rel_v)`
                }
            ],
            table: {
                headers: ["编码类型", "外推性", "计算复杂度", "代表模型"],
                rows: [
                    ["绝对位置编码", "差", "O(1)", "原始 Transformer, GPT-2"],
                    ["相对位置编码", "好", "O(N²)", "T5, Transformer-XL"],
                    ["RoPE", "较好", "O(N)", "LLaMA, PaLM, GPT-NeoX"],
                    ["ALiBi", "极好", "O(1)", "MPT, BLOOM"]
                ]
            },
            mermaid: `graph TD
    A["输入序列"] --> B["Embedding 层"]
    B --> C["位置编码注入"]
    C --> D["绝对位置: PE + Token"]
    C --> E["相对位置: Attention + (i-j)"]
    C --> F["RoPE: 旋转 Query/Key"]
    C --> G["ALiBi: 注意力偏置"]
    D --> H["自注意力"]
    E --> H
    F --> H
    G --> H
    H --> I["输出表示"]`,
            tip: "理解位置编码的关键问题是：它如何影响 attention score 的计算方式？绝对编码修改输入表示，相对编码修改注意力计算过程。",
            warning: "绝对位置编码在超过训练长度时表现急剧下降——这就是为什么 GPT-2 的 1024 上下文窗口很难通过简单外推突破。"
        },
        {
            title: "2. RoPE 旋转位置编码详解",
            body: `RoPE（Rotary Positional Embedding）由 Su 等人在 2021 年提出，是目前 LLM 领域最主流的位置编码方案。它的核心思想非常优雅：将位置编码设计为对 query 和 key 向量的旋转变换，使得两个 token 的注意力分数仅依赖于它们的相对位置。

具体来说，RoPE 将 d 维向量划分为 d/2 对二维子空间，在每个子空间中应用旋转操作。对于位置 m 和 n 的 token，其 query 和 key 经过旋转后，内积结果仅依赖于差值 m-n：(R_q * x_m)^T (R_k * x_n) = g(x_m, x_n, m-n)。这正是相对位置编码的理想性质。旋转角度的选择也至关重要——RoPE 使用几何级数 θ_i = base^(-2(i-1)/d)，其中 base 默认为 10000。这种设计使得不同维度捕获不同尺度的位置关系，低频维度关注远距离依赖，高频维度关注局部关系。

**RoPE 的优势在于**：它不增加额外的参数，推理时只需在每层的 attention 前对 Q 和 K 应用旋转矩阵即可；同时它天然支持流式推理（streaming inference），因为新 token 只需要根据自身位置旋转，无需重新计算全局位置。这使得 RoPE 成为 LLaMA、PaLM 等主流模型的首选方案。`,
            code: [
                {
                    lang: "python",
                    code: `# RoPE 核心实现
import torch

def apply_rotary_emb(
    x: torch.Tensor,          # [batch, heads, seq_len, head_dim]
    freqs_cis: torch.Tensor   # [seq_len, head_dim//2, 2]
) -> torch.Tensor:
    """对 x 应用旋转位置编码"""
    # 将 x 的最后一个维度拆分为实部和虚部对
    x_ = x.float().reshape(*x.shape[:-1], -1, 2)
    # 复数乘法 = 旋转变换
    x_complex = torch.view_as_complex(x_)
    freqs_cis = freqs_cis.view_as_complex()
    x_out = torch.view_as_real(x_complex * freqs_cis)
    return x_out.flatten(3).type_as(x)

# 预计算旋转频率
def precompute_freqs_cis(dim: int, end: int,
                         base: float = 10000.0):
    freqs = 1.0 / (base ** (
        torch.arange(0, dim, 2)[: (dim // 2)].float() / dim))
    t = torch.arange(end, dtype=freqs.dtype)
    freqs = torch.outer(t, freqs).float()
    return torch.polar(torch.ones_like(freqs), freqs)`
                },
                {
                    lang: "python",
                    code: `# RoPE 与注意力结合的完整流程
class RotaryAttention(torch.nn.Module):
    def __init__(self, dim: int, n_heads: int,
                 base: float = 10000.0):
        super().__init__()
        self.n_heads = n_heads
        self.head_dim = dim // n_heads
        self.q_proj = torch.nn.Linear(dim, dim)
        self.k_proj = torch.nn.Linear(dim, dim)
        self.v_proj = torch.nn.Linear(dim, dim)
        self.o_proj = torch.nn.Linear(dim, dim)
        self.freqs_cis = precompute_freqs_cis(
            self.head_dim, 4096, base)

    def forward(self, x, positions=None):
        bsz, seq_len, _ = x.shape
        q, k, v = self.q_proj(x), self.k_proj(x), self.v_proj(x)
        q = q.view(bsz, seq_len, self.n_heads, self.head_dim)
        k = k.view(bsz, seq_len, self.n_heads, self.head_dim)
        # 应用旋转
        q = apply_rotary_emb(q, self.freqs_cis[positions])
        k = apply_rotary_emb(k, self.freqs_cis[positions])
        # 标准缩放点积注意力
        scores = (q @ k.transpose(-2, -1)) / (
            self.head_dim ** 0.5)
        weights = torch.softmax(scores, dim=-1)
        out = (weights @ v).view(bsz, seq_len, -1)
        return self.o_proj(out)`
                }
            ],
            table: {
                headers: ["参数", "说明", "LLaMA 默认值", "影响"],
                rows: [
                    ["base (θ)", "旋转频率的底数", "10000", "越大则高频衰减越慢，远程位置区分度越高"],
                    ["head_dim", "每个注意力头的维度", "128 (70B: 64)", "决定旋转子空间的数量"],
                    ["max_seq_len", "预计算的最大长度", "2048/4096", "超过此长度需插值或外推"],
                    ["缩放因子 s", "长度缩放系数", "1.0", "s>1 压缩位置，s<1 拉伸位置"]
                ]
            },
            mermaid: `graph LR
    A["Token 序列"] --> B["Q K V 投影"]
    B --> C["RoPE 旋转 Q"]
    B --> D["RoPE 旋转 K"]
    C --> E["Q^T · K 注意力分数"]
    D --> E
    E --> F["Softmax + 权重"]
    F --> G["加权 V"]
    C -. "仅依赖相对位置差" .-> D`,
            tip: "RoPE 的复数实现比显式旋转矩阵更高效——torch.polar 和复数乘法在 GPU 上高度优化。",
            warning: "RoPE 的 base 参数对外推能力影响巨大。LLaMA-2 的 base=10000 在 4K 训练长度下表现良好，但扩展到 32K+ 时高频分量会混叠，需要配合 NTK-aware 插值或 YaRN。"
        },
        {
            title: "3. ALiBi 线性注意力偏置",
            body: `ALiBi（Attention with Linear Biases）由 Press 等人在 2022 年提出，是一种完全不同的位置编码思路。与 RoPE 修改输入表示不同，ALiBi 直接在注意力分数上添加一个线性偏置项：A(i,j) = Q_i · K_j + m · (j-i)，其中 m 是一个负斜率（每个注意力头有不同的斜率）。

这个设计看似简单，实则精妙。线性偏置本质上实现了一种「距离衰减」——位置越远的 token，其注意力分数被压低得越多。不同的头使用不同的斜率，使得有些头专注于局部上下文（大斜率，快速衰减），有些头可以关注更远距离（小斜率，缓慢衰减）。这种多头差异化策略与 **Transformer** 的自然学习模式高度吻合。

ALiBi 最大的优势是零外推成本。因为它不依赖预定义的位置嵌入或旋转频率，理论上可以处理任意长度的序列——无论训练时见过的最大长度是多少。这在实践中得到了验证：MPT-7B 模型使用 ALiBi 在 2K 长度上训练，却能直接处理 65K 的上下文而无需任何微调。但 ALiBi 也有代价：它引入了位置信息的归纳偏置，可能限制了模型学习更复杂位置关系的能力。`,
            code: [
                {
                    lang: "python",
                    code: `# ALiBi 注意力偏置矩阵
import torch

def get_alibi_slopes(n_heads: int) -> torch.Tensor:
    """计算每个头的 ALiBi 斜率"""
    # 斜率按几何级数分配: 1/2^(8/n) 的幂次
    def get_slopes_power_of_2(n):
        start = 2  (-(2  -(
            torch.log2(torch.tensor(n)) - 3)))
        ratio = start
        return start * ratio ** torch.arange(n)

    if torch.log2(torch.tensor(n_heads)).is_integer():
        return get_slopes_power_of_2(n_heads)
    # 非 2 的幂时，从最近的 2 的幂中选取
    closest = 2 ** int(torch.log2(
        torch.tensor(n_heads)).floor())
    extra = n_heads - closest
    slopes = get_slopes_power_of_2(2 * closest)
    return slopes[1::2][:extra].tolist() + slopes[:closest]

# 构建偏置矩阵
def build_alibi_bias(seq_len: int, n_heads: int):
    slopes = get_alibi_slopes(n_heads)
    # 相对位置矩阵: j - i
    rel_pos = torch.arange(seq_len).unsqueeze(0) - \\
              torch.arange(seq_len).unsqueeze(1)
    # 每个头乘以各自的斜率
    return rel_pos.unsqueeze(0) * slopes.view(-1, 1, 1)`
                },
                {
                    lang: "python",
                    code: `# ALiBi + 注意力完整实现
class AlibiAttention(torch.nn.Module):
    def __init__(self, dim: int, n_heads: int):
        super().__init__()
        self.n_heads = n_heads
        self.head_dim = dim // n_heads
        self.scale = self.head_dim ** -0.5
        self.q_proj = torch.nn.Linear(dim, dim)
        self.k_proj = torch.nn.Linear(dim, dim)
        self.v_proj = torch.nn.Linear(dim, dim)
        self.register_buffer(
            "alibi_bias", None, persistent=False)

    def _ensure_alibi(self, seq_len: int):
        if (self.alibi_bias is None or
                self.alibi_bias.shape[-1] < seq_len):
            self.alibi_bias = build_alibi_bias(
                seq_len, self.n_heads).to(
                    self.q_proj.weight.device)

    def forward(self, x):
        bsz, seq_len, _ = x.shape
        self._ensure_alibi(seq_len)
        q = self.q_proj(x).view(
            bsz, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        k = self.k_proj(x).view(
            bsz, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        v = self.v_proj(x).view(
            bsz, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        scores = (q @ k.transpose(-2, -1)) * self.scale
        # 关键：添加 ALiBi 偏置
        scores = scores + self.alibi_bias[:, :seq_len, :seq_len]
        weights = torch.softmax(scores, dim=-1)
        return (weights @ v).transpose(1, 2).reshape(bsz, seq_len, -1)`
                }
            ],
            table: {
                headers: ["特性", "RoPE", "ALiBi"],
                rows: [
                    ["位置编码方式", "旋转变换 Q/K", "注意力分数线性偏置"],
                    ["额外参数", "无", "无（仅预计算斜率）"],
                    ["训练长度外推", "需要插值/微调", "天然支持"],
                    ["归纳偏置强度", "弱（仅编码相对位置）", "强（强制距离衰减）"],
                    ["流式推理", "支持", "支持"],
                    ["长程注意力", "靠高频维度", "靠小斜率头"],
                    ["采用模型", "LLaMA, PaLM, Qwen", "MPT, BLOOM, GLM"]
                ]
            },
            mermaid: `graph TD
    A["Q · K 注意力分数"] --> B["构建相对位置矩阵"]
    B --> C["各头斜率: 2^(-8/n_heads)"]
    C --> D["线性偏置: m × (j-i)"]
    D --> E["Score + Bias"]
    E --> F["Softmax"]
    F --> G["注意力权重"]
    C -. "头1: 大斜率→局部" .-> D
    C -. "头N: 小斜率→全局" .-> D`,
            tip: "ALiBi 的斜率分配遵循 2^(-8/n_heads) 的几何级数，确保不同注意力头覆盖不同尺度的距离衰减。",
            warning: "ALiBi 的强归纳偏置在短上下文任务上可能表现不如 RoPE——因为它强制距离衰减，可能干扰模型学习「远距离但强相关」的模式。"
        },
        {
            title: "4. 上下文窗口外推：为什么不能直接用",
            body: `当我们在 2048 长度上训练了一个模型，直接让它处理 8192 长度的输入会发生什么？答案取决于位置编码类型，但几乎所有方案都会遇到某种形式的外推问题。理解这些问题的根源，是选择正确扩展策略的前提。

对于 RoPE，问题出在旋转频率上。预计算的 freqs_cis 覆盖了 [0, max_seq_len) 范围内的位置。当输入超出这个范围时，要么 freqs_cis 数组越界，要么需要动态计算新位置的旋转。但即使是动态计算，模型也没有学习过这些高频/低频组合下的注意力模式——因为旋转角度是几何级数分布的，超过训练范围的角度对应着模型从未见过的「位置距离」。具体来说，模型学到的注意力模式是 f(θ_m - θ_n)，当 m-n 超出训练范围时，这个函数的行为是未知的。

对于绝对位置编码，问题更为直接——位置嵌入表中没有超出训练长度的条目。即使使用可学习的位置编码，模型也只学到了有限位置范围内的映射。对于 ALiBi 虽然理论上支持任意长度，但模型在训练中只见过有限距离的偏置模式，极端长距离下的注意力分布可能偏离预期。外推问题不是某个方案的缺陷，而是所有有限训练数据的固有挑战。`,
            code: [
                {
                    lang: "python",
                    code: `# 外推问题可视化：RoPE 频率混叠
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

def visualize_extrapolation(base=10000, d=128,
                            train_len=2048, test_len=8192):
    """展示 RoPE 在外推时的频率问题"""
    dim = 0  # 第一个维度（最高频）
    freq = 1.0 / (base ** (2 * dim / d))

    train_positions = np.arange(train_len)
    test_positions = np.arange(test_len)

    # 旋转角度
    train_angles = train_positions * freq * 2 * np.pi
    test_angles = test_positions * freq * 2 * np.pi

    plt.figure(figsize=(12, 4))
    plt.plot(train_positions, np.sin(train_angles),
             label="训练范围", alpha=0.7)
    plt.plot(test_positions, np.sin(test_angles),
             label="外推范围", alpha=0.7)
    plt.axvline(train_len, color="red", ls="--",
                label="训练边界")
    plt.legend()
    plt.title("RoPE 旋转角度外推示意")
    plt.savefig("rope_extrapolation.png")

# 注意力模式外推误差
def extrapolation_error(model, seq_len):
    """测量模型在外推长度上的性能衰减"""
    ppl_train = evaluate_ppl(model, seq_len=2048)
    ppl_test = evaluate_ppl(model, seq_len=seq_len)
    degradation = (ppl_test - ppl_train) / ppl_train
    print(f"长度 {seq_len}: 困惑度衰减 {degradation:.1%}")`
                },
                {
                    lang: "python",
                    code: `# 外推性 benchmark：PassKey Retrieval
import torch

def passkey_retrieval_test(model, tokenizer,
                           context_len: int,
                           key_pos_ratio: float = 0.5):
    """测试模型在指定长度下检索隐藏 key 的能力"""
    noise = "The grass is green. " * (context_len // 6)
    key = f"PassKey = {torch.randint(0, 10000, (1,)).item()}"
    prompt = noise + key + noise

    inputs = tokenizer(prompt, return_tensors="pt",
                       truncation=True,
                       max_length=context_len)
    with torch.no_grad():
        outputs = model.generate(
            inputs.input_ids,
            max_new_tokens=10,
            do_sample=False)
    return tokenizer.decode(outputs[0])

# 评估不同长度
for length in [2048, 4096, 8192, 16384, 32768]:
    result = passkey_retrieval_test(model, tok, length)
    print(f"长度 {length}: 检索准确率 = {'PassKey' in result}")`
                }
            ],
            table: {
                headers: ["外推策略", "原理", "是否需要微调", "典型扩展倍率"],
                rows: [
                    ["直接外推", "动态计算新位置", "不需要", "1-1.5x（性能急剧下降）"],
                    ["线性插值", "压缩位置索引", "不需要", "2-4x"],
                    ["NTK-aware 插值", "动态调整 base 参数", "不需要", "2-8x"],
                    ["YaRN", "注意力感知的非线性缩放", "需要少量微调", "4-16x"],
                    ["PI", "位置索引缩放", "不需要", "2-4x"],
                    ["ALiBi 原生", "无预计算限制", "不需要", "理论上无限"]
                ]
            },
            mermaid: `graph TD
    A["训练长度: 2048"] --> B{"推理长度"}
    B -->|"≤ 2048"| C["✅ 正常推理"]
    B -->|"> 2048"| D["❓ 外推"]
    D --> E["RoPE: 频率混叠"]
    D --> F["绝对编码: 表越界"]
    D --> G["ALiBi: 分布偏移"]
    E --> H["需要插值/微调"]
    F --> H
    G --> I["可能直接工作"]`,
            tip: "评估外推能力时不要只看困惑度——用 PassKey Retrieval 或 Needle-in-Haystack 测试更能反映实际长上下文理解能力。",
            warning: "直接外推（不修改任何参数）几乎总是失败。LLaMA-2-7B 在 8192 长度上的困惑度可能比 2048 长度高 10 倍以上。"
        },
        {
            title: "5. NTK-aware 插值：免微调的长度扩展",
            body: `NTK-aware 插值（Neural Tangent Kernel-aware Interpolation）是一种巧妙的外推方法，它不需要任何微调就能将上下文窗口扩展数倍。其核心洞察来自对 RoPE 频率的分析：当我们要处理更长的序列时，真正的问题不是「位置超出范围」，而是「模型学到的注意力模式无法泛化到新的频率组合」。

NTK 分析表明，神经网络对不同频率的信号有不同的泛化能力——低频信号容易泛化，高频信号困难。基于这个洞察，NTK-aware 插值通过增大 base 参数来「重新分配」频率空间：s_base = base * scale^(dim/(dim-2))。这样做的效果是，高频维度的旋转角度被压缩，使得模型在更长的序列范围内看到的相对位置变化模式与训练时相似。

具体来说，对于缩放因子 s=4（将 2K 扩展到 8K），base 从 10000 增大到约 160000。这使得不同维度以不同比例压缩——低频维度几乎不变，高频维度被大幅压缩。这种非均匀压缩恰好匹配了 NTK 理论预测的泛化能力分布，因此在实践中取得了很好的效果。但 NTK-aware 插值也有局限：当扩展倍率超过 8x 时，性能仍会显著下降，因为模型终究没有学习过这些极端位置的注意力模式。`,
            code: [
                {
                    lang: "python",
                    code: `# NTK-aware 插值实现
import torch
from typing import Tuple

def get_ntk_aware_freqs_cis(
    dim: int, end: int, base: float = 10000.0,
    scale_factor: float = 1.0
) -> torch.Tensor:
    """NTK-aware 缩放的频率计算"""
    # 动态调整 base 参数
    # s_base = base * scale^(dim/(dim-2))
    adjusted_base = base * (scale_factor ** (dim / (dim - 2)))

    freqs = 1.0 / (adjusted_base ** (
        torch.arange(0, dim, 2)[: (dim // 2)].float() / dim))

    # 位置索引也被缩放
    t = torch.arange(end, dtype=freqs.dtype) / scale_factor
    freqs = torch.outer(t, freqs).float()

    return torch.polar(torch.ones_like(freqs), freqs)

# 使用示例：将 LLaMA 2048 扩展到 8192
scale = 4.0  # 4x 扩展
new_freqs = get_ntk_aware_freqs_cis(
    dim=128, end=8192, base=10000.0, scale_factor=scale)
print(f"原始 base=10000, 调整后 base={10000.0 * 4**(128/126):.0f}")`
                },
                {
                    lang: "python",
                    code: `# NTK 插值 vs 线性插值对比
def compare_interpolation_methods(
    model, tokenizer, test_seq_len: int = 8192
):
    """比较不同插值方法的性能"""
    results = {}

    # 方法1: 线性插值（所有维度均匀缩放）
    linear_freqs = get_linear_interp_freqs_cis(
        dim=128, end=test_seq_len,
        base=10000.0, scale=4.0)
    results["linear"] = evaluate_ntk(model, linear_freqs)

    # 方法2: NTK-aware 插值
    ntk_freqs = get_ntk_aware_freqs_cis(
        dim=128, end=test_seq_len,
        base=10000.0, scale_factor=4.0)
    results["ntk_aware"] = evaluate_ntk(model, ntk_freqs)

    # 方法3: Dynamic NTK（根据序列长度动态调整）
    for s in [2.0, 4.0, 6.0, 8.0]:
        dyn_freqs = get_ntk_aware_freqs_cis(
            dim=128, end=test_seq_len,
            base=10000.0, scale_factor=s)
        results[f"dynamic_s={s}"] = evaluate_ntk(model, dyn_freqs)

    for method, ppl in results.items():
        print(f"{method:20s}: PPL = {ppl:.2f}")
    return results`
                }
            ],
            table: {
                headers: ["缩放因子 s", "调整后 base", "2K→长度", "PPL 衰减", "推荐场景"],
                rows: [
                    ["s=2", "40000", "4096", "<5%", "小幅扩展，几乎无损"],
                    ["s=4", "~160000", "8192", "5-10%", "常用扩展，效果良好"],
                    ["s=8", "~640000", "16384", "10-20%", "大幅扩展，可接受"],
                    ["s=16", "~2560000", "32768", ">25%", "极限扩展，建议微调"]
                ]
            },
            mermaid: `graph LR
    A["训练 base=10000"] --> B["目标扩展 s 倍"]
    B --> C["计算 base' = base × s^(d/(d-2))"]
    C --> D["低频维度: 微调"]
    C --> E["高频维度: 大幅压缩"]
    D --> F["位置索引 ÷ s"]
    E --> F
    F --> G["新 freqs_cis"]
    G --> H["无需微调，直接推理"]`,
            tip: "NTK-aware 插值可以在不修改模型权重的情况下直接应用，是快速扩展上下文窗口的首选方法。推荐使用 scale 在 2-4 之间。",
            warning: "base 调整公式中的指数 dim/(dim-2) 在 head_dim 很小时（如 32）会变得非常大，可能导致数值不稳定。建议 head_dim ≥ 64 时使用。"
        },
        {
            title: "6. YaRN 与 Position Interpolation 进阶",
            body: `YaRN（Yet another RoPE extensioN method）和 Position Interpolation（PI）代表了两种不同的上下文扩展哲学。PI（Chen et al., 2023）的思路极为简单：直接将位置索引除以一个缩放因子，然后查预计算的频率表。如果训练时最大位置是 2048，现在要处理 8192 的输入，就把位置 8192 映射为 8192/4 = 2048，直接复用训练范围内的频率。

PI 的优势是极简——只需修改一行代码，不需要重新计算频率，不需要调整 base。但它的问题是粗暴的线性映射破坏了原始的位置关系结构。位置 100 和位置 200 的相对距离从 100 变成了 25，这种压缩改变了模型学到的距离-注意力关系。在 4x 扩展内 PI 表现尚可，但超过这个倍率，信息损失就变得显著。

YaRN 则更加精细。它结合了 NTK-aware 的动态频率调整和注意力感知的缩放策略。关键创新在于引入了一个注意力感知的缩放函数：对于高频维度使用更大的缩放因子（因为这些维度对长距离不敏感），对低频维度使用较小的缩放因子（因为它们携带关键的位置信息）。此外，YaRN 建议配合少量微调（仅 1000 步）来校准扩展后的注意力模式，这使得它能够在 16x 甚至 32x 扩展下保持高质量输出。YaRN 的频率计算还引入了温度参数 t 和动态窗口函数，进一步优化了长距离注意力的分布。`,
            code: [
                {
                    lang: "python",
                    code: `# Position Interpolation 实现
def apply_position_interpolation(
    positions: torch.Tensor,
    scale_factor: float,
    max_train_len: int = 2048
) -> torch.Tensor:
    """简单但有效的位置索引缩放"""
    # 将实际位置线性映射到训练范围
    interpolated = positions / scale_factor
    # 截断到训练范围内
    interpolated = torch.clamp(interpolated,
                                0, max_train_len - 1)
    return interpolated

# 在推理中使用
original_positions = torch.arange(8192)
interp_positions = apply_position_interpolation(
    original_positions, scale_factor=4.0)
# 然后使用 interp_positions 查询预计算的 freqs_cis
q = apply_rotary_emb(q, freqs_cis[interp_positions])
k = apply_rotary_emb(k, freqs_cis[interp_positions])`
                },
                {
                    lang: "python",
                    code: `# YaRN 频率计算（完整实现）
import torch
import math

def get_yarn_freqs_cis(
    dim: int, end: int, base: float = 10000.0,
    scale_factor: float = 1.0,
    original_max_position: int = 2048,
    beta_fast: float = 32,
    beta_slow: float = 1,
    mscale: float = 1.0,
) -> torch.Tensor:
    """YaRN: Yet another RoPE extensioN"""
    # 计算每个维度的频率
    pos_freqs = base ** (
        torch.arange(0, dim, 2).float() / dim)

    # 维度感知的动态缩放
    # 高频维度 (大 index) → 大缩放
    # 低频维度 (小 index) → 小缩放
    extrapolation_factor = scale_factor
    dim_factors = torch.maximum(
        torch.log(torch.ones(1) * scale_factor),
        torch.zeros(1))

    # 注意力感知缩放
    yarn_factor = torch.where(
        pos_freqs < beta_slow,
        torch.ones_like(pos_freqs),
        torch.where(
            pos_freqs > beta_fast,
            extrapolation_factor * torch.ones_like(pos_freqs),
            (pos_freqs - beta_slow) / (beta_fast - beta_slow) *
            (extrapolation_factor - 1) + 1
        )
    )

    inv_freq = 1.0 / (pos_freqs * yarn_factor)
    t = torch.arange(end, dtype=inv_freq.dtype)
    freqs = torch.outer(t, inv_freq)

    # 幅度缩放（YaRN 的温度修正）
    freqs = freqs * mscale
    return torch.polar(torch.ones_like(freqs), freqs)`
                }
            ],
            table: {
                headers: ["方法", "代码改动", "需要微调", "最大扩展", "性能保持"],
                rows: [
                    ["线性插值", "1行", "不需要", "4x", "80-90%"],
                    ["NTK-aware", "修改 base", "不需要", "8x", "85-95%"],
                    ["Dynamic NTK", "动态 base", "不需要", "8x", "85-95%"],
                    ["YaRN", "新频率计算", "推荐1000步", "16-32x", "95%+"],
                    ["YaRN (免微调)", "新频率计算", "不需要", "8x", "90%+"],
                    ["PI", "位置索引/s", "不需要", "4x", "80-90%"]
                ]
            },
            mermaid: `graph TD
    A["原始 freqs: base^(-2i/d)"] --> B{"扩展策略"}
    B -->|"PI"| C["pos → pos/s"]
    B -->|"NTK"| D["base → base × s^(d/(d-2))"]
    B -->|"YaRN"| E["动态维度缩放"]
    E --> F["低频: 不变"]
    E --> G["中频: 线性过渡"]
    E --> H["高频: 全缩放"]
    C --> I["查原表"]
    D --> J["新频率"]
    F --> J
    G --> J
    H --> J
    J --> K["扩展后的 freqs_cis"]`,
            tip: "YaRN 的 beta_fast/beta_slow 参数控制了频率过渡的边界。对于 LLaMA，beta_fast=32 和 beta_slow=1 是经验良好的默认值。",
            warning: "YaRN 的 mscale 参数如果设置不当会导致注意力分数分布偏移。mscale = 0.1 * ln(s) + 1.0 是一个经验公式，其中 s 是缩放因子。"
        },
        {
            title: "7. 实战：扩展 LLaMA 到 32K 上下文",
            body: `理论终究要落到代码上。本节将演示如何将一个训练在 4096 上下文上的 **LLaMA** 模型扩展到 32K 上下文（8x 扩展）。我们采用渐进式策略：先用 NTK-aware 插值快速验证，再考虑 YaRN + 少量微调以获得最佳效果。

第一步是修改 RoPE 的频率计算。对于 8x 扩展，我们使用 NTK-aware 插值，将 base 从 10000 调整到约 10000 * 8^(128/126) ≈ 80000。同时位置索引除以 8 进行缩放。在 **Transformer**s 库中，这可以通过修改 RotarianEmbedding 类或使用 LlamaLinearScalingRotaryEmbedding 来实现。对于 YaRN 方案，还需要替换频率计算函数并调整注意力缩放。

第二步是处理 KV Cache。扩展上下文后，KV Cache 的内存占用线性增长。在 32K 长度下，**LLaMA**-7B 的 KV Cache 可能需要 8-16GB 额外显存（取决于 batch size）。这意味着原来能在单卡 A100 上跑的 4096 长度推理，在 32K 下可能需要 KV Cache 量化或 offloading。第三步是验证——使用 Needle-in-Haystack 测试确保模型在扩展长度下仍然能够准确定位和检索信息。`,
            code: [
                {
                    lang: "python",
                    code: `# 实战：修改 Transformers 的 LLaMA RoPE
from transformers import LlamaConfig, LlamaForCausalLM
from transformers.models.llama.modeling_llama import (
    LlamaRotaryEmbedding,
    LlamaLinearScalingRotaryEmbedding,
    LlamaDynamicNTKScalingRotaryEmbedding,
)

# 方案1: 线性缩放（PI）
config = LlamaConfig.from_pretrained("meta-llama/Llama-2-7b")
config.rope_scaling = {
    "type": "linear",
    "factor": 8.0,  # 4096 → 32768
}
model = LlamaForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b", config=config)

# 方案2: Dynamic NTK（推荐）
config.rope_scaling = {
    "type": "dynamic",
    "factor": 8.0,
    "original_max_position_embeddings": 4096,
}
model = LlamaForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b", config=config)`
                },
                {
                    lang: "python",
                    code: `# 实战：KV Cache 内存估算与优化
def estimate_kv_cache_gb(
    n_layers: int = 32, n_heads: int = 32,
    head_dim: int = 128, seq_len: int = 32768,
    batch_size: int = 1, dtype_bytes: int = 2
) -> float:
    """估算 KV Cache 的显存占用（GB）"""
    # 每层: 2(K+V) × batch × heads × seq × head_dim × dtype
    per_layer = 2 * batch_size * n_heads * seq_len * head_dim
    total_bytes = per_layer * n_layers * dtype_bytes
    return total_bytes / (1024 ** 3)

# LLaMA-7B @ 32K
ppl_mem = estimate_kv_cache_gb(seq_len=32768)
print(f"LLaMA-7B @ 32K: KV Cache ≈ {ppl_mem:.1f} GB")
# 输出: ~8.0 GB（FP16, batch=1）

# KV Cache 量化到 INT8 可减半
int8_mem = estimate_kv_cache_gb(seq_len=32768, dtype_bytes=1)
print(f"LLaMA-7B @ 32K (INT8): KV Cache ≈ {int8_mem:.1f} GB")
# 输出: ~4.0 GB

# Needle-in-Haystack 验证
def needle_in_haystack_test(
    model, tokenizer, context_len: int = 32768,
    n_rounds: int = 10
) -> float:
    """验证扩展后的长上下文检索能力"""
    correct = 0
    for _ in range(n_rounds):
        needle = f"{{'answer': {torch.randint(0,100,(1,)).item()}}}"
        haystack = "The sky is blue. " * (context_len // 4)
        prompt = haystack + needle + haystack
        # ... 生成并检查是否找到 needle
    return correct / n_rounds`
                }
            ],
            table: {
                headers: ["模型", "训练长度", "扩展目标", "推荐方法", "KV Cache (FP16)", "最低显存"],
                rows: [
                    ["LLaMA-7B", "4096", "8192 (2x)", "Linear/Dynamic NTK", "1 GB", "16 GB"],
                    ["LLaMA-7B", "4096", "16384 (4x)", "Dynamic NTK", "4 GB", "24 GB"],
                    ["LLaMA-7B", "4096", "32768 (8x)", "YaRN + 微调", "8 GB", "40 GB"],
                    ["LLaMA-13B", "4096", "32768 (8x)", "YaRN + 微调", "16 GB", "80 GB"],
                    ["LLaMA-70B", "4096", "32768 (8x)", "YaRN + 微调", "64 GB", "多卡"]
                ]
            },
            mermaid: `graph TD
    A["LLaMA-7B (4096 ctx)"] --> B["选择扩展策略"]
    B --> C["NTK-aware 插值"]
    B --> D["YaRN"]
    C --> E["修改 base 参数"]
    C --> F["缩放位置索引"]
    D --> G["计算动态频率"]
    D --> H["调整注意力缩放"]
    E --> I["加载模型"]
    F --> I
    G --> I
    H --> I
    I --> J["估算 KV Cache"]
    J --> K["Needle-in-Haystack 验证"]
    K --> L["32K 上下文就绪"]`,
            tip: "Transformers ≥4.36 原生支持 rope_scaling 配置，直接修改 config 即可，无需手动修改模型代码。推荐先用 dynamic NTK 快速验证，再决定是否上 YaRN 微调。",
            warning: "扩展到 32K 后，KV Cache 可能成为显存瓶颈。对于 7B 模型，32K 上下文下的 KV Cache 约 8GB（FP16），加上 14GB 模型权重，单张 24GB 显卡勉强可用。如需更大的 batch size，务必开启 KV Cache 量化或使用 PagedAttention。"
        }
    ],
};
