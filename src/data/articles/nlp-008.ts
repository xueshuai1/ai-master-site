import { Article } from '../knowledge';

export const article: Article = {
    id: "nlp-008",
    title: "文本生成：语言模型与解码策略",
    category: "nlp",
    tags: ["文本生成", "语言模型", "解码"],
    summary: "从贪心搜索到核采样，掌握文本生成的解码技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 语言模型基础：N-gram → RNN → Transformer",
            body: `语言模型（Language Model, LM）的核心任务是估计一个词序列的概率 P(w₁, w₂, ..., wₙ)。这看似简单的问题却是整个 NLP 的基石——机器翻译、文本摘要、对话系统、代码生成，本质上都是「在给定上下文的条件下，预测下一个词」。

N-gram 模型是最早的语言模型，基于马尔可夫假设：当前词的概率只依赖于前 n-1 个词。Bigram 假设 P(w₃ | w₁, w₂) ≈ P(w₃ | w₂)，Trigram 则依赖前两个词。概率通过计数频率估计：P(wᵢ | wᵢ₋₁) = count(wᵢ₋₁, wᵢ) / count(wᵢ₋₁)。N-gram 的问题是稀疏性——n 越大，需要的训练数据呈指数增长，且无法捕捉长距离依赖。

神经网络语言模型（NNLM）由 Bengio 在 2003 年提出，用词嵌入替代离散的 one-hot 表示，通过 MLP 建模词序列的概率。随后 RNN/LSTM 语言模型（2010s）利用循环结构天然处理变长序列，能捕捉比 N-gram 更远的上下文依赖。

**Transformer** 语言模型（2017）彻底改变了范式。GPT 系列采用仅解码器（Decoder-only）架构，通过自回归方式建模 P(wᵢ | w_{<i}) = ∏ P(wᵢ | w₁, ..., wᵢ₋₁)，其中每一步的注意力都通过因果掩码（Causal Mask）确保只能关注前面的词。这种架构的并行训练效率和可扩展性远超 RNN，直接催生了 GPT-3（175B 参数）到 **GPT-4** 的大语言模型时代。`,
            code: [
                {
                    lang: "python",
                    code: `# N-gram 语言模型：计数、平滑与困惑度
from collections import Counter, defaultdict
import math

class NgramLM:
    """N-gram 语言模型（带加 K 平滑）"""
    
    def __init__(self, n=3, k=0.1):
        self.n = n
        self.k = k  # 拉普拉斯平滑参数
        self.ngram_counts = Counter()
        self.context_counts = Counter()
        self.vocab_size = 0
    
    def fit(self, sentences):
        """训练 N-gram 模型"""
        for sent in sentences:
            tokens = ["<s>"] * (self.n - 1) + sent + ["</s>"]
            for i in range(len(tokens) - self.n + 1):
                ngram = tuple(tokens[i:i + self.n])
                context = ngram[:-1]
                self.ngram_counts[ngram] += 1
                self.context_counts[context] += 1
        self.vocab_size = len(set(t for s in sentences for t in s)) + 2  # +2 for <s> </s>
    
    def prob(self, word, context):
        """P(word | context) 带加 K 平滑"""
        count = self.ngram_counts[context + (word,)]
        total = self.context_counts[context]
        return (count + self.k) / (total + self.k * self.vocab_size)
    
    def perplexity(self, sentences):
        """计算模型在测试集上的困惑度"""
        log_prob_sum = 0
        total_tokens = 0
        for sent in sentences:
            tokens = ["<s>"] * (self.n - 1) + sent + ["</s>"]
            for i in range(self.n - 1, len(tokens)):
                context = tuple(tokens[i - self.n + 1:i])
                p = self.prob(tokens[i], context)
                log_prob_sum += math.log2(max(p, 1e-10))
                total_tokens += 1
        return 2  (-log_prob_sum / total_tokens)

# 训练与评估
corpus = [
    ["i", "love", "machine", "learning"],
    ["machine", "learning", "is", "amazing"],
    ["i", "love", "natural", "language", "processing"],
]
model = NgramLM(n=3, k=0.5)
model.fit(corpus)
print(f"Trigram 困惑度: {model.perplexity(corpus):.2f}")`,
                },
                {
                    lang: "python",
                    code: `# Transformer 因果语言模型（简化版）
import torch
import torch.nn as nn
import math

class CausalTransformerLM(nn.Module):
    """仅解码器的因果语言模型"""
    
    def __init__(self, vocab_size=50257, d_model=768, n_layers=12,
                 n_heads=12, d_ff=3072, max_len=1024, dropout=0.1):
        super().__init__()
        self.d_model = d_model
        self.token_embed = nn.Embedding(vocab_size, d_model)
        self.pos_embed = nn.Embedding(max_len, d_model)
        self.dropout = nn.Dropout(dropout)
        
        # Transformer 解码器层
        decoder_layer = nn.TransformerDecoderLayer(
            d_model=d_model, nhead=n_heads,
            dim_feedforward=d_ff, dropout=dropout,
            batch_first=True
        )
        self.transformer = nn.TransformerDecoder(decoder_layer, num_layers=n_layers)
        self.lm_head = nn.Linear(d_model, vocab_size)
    
    def forward(self, input_ids):
        batch_size, seq_len = input_ids.shape
        positions = torch.arange(seq_len, device=input_ids.device).unsqueeze(0).expand(batch_size, -1)
        
        # 词嵌入 + 位置嵌入
        x = self.token_embed(input_ids) + self.pos_embed(positions)
        x = self.dropout(x)
        
        # 因果掩码：禁止关注未来位置
        causal_mask = torch.triu(
            torch.ones(seq_len, seq_len, device=input_ids.device), diagonal=1
        ).bool()
        causal_mask = causal_mask.unsqueeze(0).unsqueeze(0)  # (1, 1, seq, seq)
        
        # Transformer 解码
        memory = torch.zeros_like(x)  # 编码器-解码器架构需要，这里用零填充
        output = self.transformer(x, memory, tgt_mask=causal_mask)
        
        # 输出词表概率分布
        logits = self.lm_head(output)  # (batch, seq, vocab)
        return logits
    
    def generate_probs(self, input_ids):
        """获取下一个词的概率分布"""
        logits = self.forward(input_ids)
        next_token_logits = logits[:, -1, :]  # 取最后一个位置
        probs = torch.softmax(next_token_logits, dim=-1)
        return probs  # (batch, vocab_size)`,
                },
            ],
            table: {
                headers: ["模型类型", "年份", "上下文建模方式", "参数规模 (典型)", "困惑度 (Penn Treebank)", "局限性"],
                rows: [
                    ["N-gram", "1990s", "前 n-1 个词的计数", "无参数 (计数表)", "~100-200", "稀疏性、无法捕捉长依赖"],
                    ["NNLM (Bengio)", "2003", "MLP 处理固定窗口", "~10⁵-10⁶", "~150", "窗口大小固定"],
                    ["RNN/LSTM", "2010s", "循环隐藏状态传递", "~10⁷-10⁸", "~60-80", "训练慢、梯度消失"],
                    ["Transformer (GPT)", "2018", "自注意力 + 因果掩码", "~10⁸-10¹¹", "~20-30", "O(N²) 计算复杂度"],
                    ["GPT-4 级别", "2023", "多模态 + 混合专家", "~10¹²", "<20", "训练成本极高"],
                ],
            },
            mermaid: `graph TD
    A["N-gram
计数频率"] -->|"马尔可夫假设
局部上下文"| B["NNLM
词嵌入 + MLP"]
    B -->|"词向量表示
窗口扩展"| C["RNN/LSTM
循环隐藏状态"]
    C -->|"长程依赖
但训练慢"| D["Transformer
自注意力"]
    D -->|"因果掩码
并行训练"| E["GPT 系列
仅解码器"]
    E -->|"规模化定律
175B+ 参数"| F["大语言模型
涌现能力"]
    class F s3
    class E s2
    class C s1
    class A s0
    classDef s0 fill:#7f1d1d
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87`,
            tip: "语言模型的演进遵循一个核心趋势：从离散计数 → 连续表示 → 注意力全局建模。理解这个脉络，就能理解为什么 Transformer 能够「涌现」出 N-gram 和 RNN 无法实现的能力（如思维链推理）。",
            warning: "N-gram 模型虽然古老，但它仍然是评估神经语言模型的重要基线。不要跳过 N-gram 直接学 Transformer——理解平滑（Smoothing）、回退（Backoff）和困惑度（Perplexity）这些概念，是理解现代语言模型的基础。",
        },
        {
            title: "2. 贪心搜索与 Beam Search：确定性解码",
            body: `语言模型训练完成后，如何用模型生成文本？解码策略（Decoding Strategy）决定了模型从概率分布中选择下一个词的方式，直接影响生成文本的质量、多样性和一致性。

贪心搜索（Greedy Search） 是最直观的解码策略：在每一步选择概率最高的词作为输出。形式化表示为 wₜ = argmax_w P(w | w_{<t})。贪心搜索的优势是计算简单、确定性强（相同输入总是产生相同输出），但它有一个严重缺陷：局部最优不等于全局最优。在第一步选择概率最高的词，可能导致后续所有步骤都被迫走低概率路径，最终生成的整体序列概率反而不是最高的。

Beam Search（束搜索） 是贪心搜索的扩展，维护一个大小为 k 的候选序列集合（称为 beam）。在每一步，对 beam 中每个候选序列，计算所有可能扩展的概率，然后保留概率最高的 k 个序列。当 k=1 时，Beam Search 退化为贪心搜索；k 越大，搜索空间越广，但计算开销也越大。

长度归一化（Length Normalization） 是 Beam Search 的关键改进。因为概率连乘会随着序列长度指数衰减，长序列的得分天然偏低。标准做法是对序列得分除以长度的幂次：score = log P(sequence) / length^α，其中 α 通常取 0.6-0.7。这平衡了长短序列的得分，避免模型倾向于生成过短的文本。`,
            code: [
                {
                    lang: "python",
                    code: `# 贪心搜索实现
import torch
import torch.nn.functional as F

def greedy_decode(model, prompt_ids, max_length=50, eos_token_id=2):
    """
    贪心搜索解码
    model: 语言模型，接受 input_ids 返回 logits
    prompt_ids: (1, prompt_len) 提示词 token IDs
    返回: 生成的完整 token IDs
    """
    input_ids = prompt_ids.clone()
    
    for _ in range(max_length):
        # 获取模型输出
        with torch.no_grad():
            logits = model(input_ids)  # (1, seq_len, vocab_size)
        
        # 取最后一个位置的 logits
        next_token_logits = logits[:, -1, :]  # (1, vocab_size)
        
        # 贪心选择概率最高的词
        next_token_id = torch.argmax(next_token_logits, dim=-1)  # (1,)
        
        # 追加到序列
        input_ids = torch.cat([input_ids, next_token_id.unsqueeze(0)], dim=1)
        
        # 遇到 EOS 停止
        if next_token_id.item() == eos_token_id:
            break
    
    return input_ids

# 贪心搜索的问题演示
print("=== 贪心搜索的问题 ===")
print("贪心搜索在每一步做局部最优选择:")
print("  Step 1: P('the') = 0.40 → 选择 'the' ✓")
print("  Step 2: P('cat') = 0.35 → 选择 'cat' ✓")
print("  Step 3: P('is')  = 0.60 → 选择 'is'  ✓")
print("  但全局最优可能是:")
print("  Step 1: P('a')   = 0.30 (非最优)")
print("  Step 2: P('beautiful') = 0.25 (非最优)")
print("  Step 3: P('sunset') = 0.45 → 整体概率可能更高!")
print("贪心搜索会错过这个全局更优的路径。")`,
                },
                {
                    lang: "python",
                    code: `# Beam Search 完整实现
import torch
import torch.nn.functional as F
import heapq

def beam_search_decode(model, prompt_ids, beam_size=4, max_length=50,
                       eos_token_id=2, length_penalty=0.6):
    """
    Beam Search 解码
    model: 语言模型
    prompt_ids: (1, prompt_len)
    beam_size: 束宽度
    length_penalty: 长度归一化指数
    """
    # 初始化 beam: [(score, sequence, is_done)]
    beams = [(0.0, prompt_ids.clone(), False)]
    completed = []
    
    for step in range(max_length):
        candidates = []
        
        for score, seq, is_done in beams:
            if is_done:
                candidates.append((score, seq, True))
                continue
            
            with torch.no_grad():
                logits = model(seq)
                next_logits = logits[:, -1, :]  # (1, vocab)
                log_probs = F.log_softmax(next_logits, dim=-1).squeeze(0)
            
            # 取 top-k 候选
            top_k_probs, top_k_ids = torch.topk(log_probs, beam_size)
            
            for prob, token_id in zip(top_k_probs, top_k_ids):
                new_score = score + prob.item()
                new_seq = torch.cat([seq, token_id.unsqueeze(0).unsqueeze(0)], dim=1)
                is_finished = token_id.item() == eos_token_id
                
                if is_finished:
                    # 长度归一化
                    norm_score = new_score / (new_seq.shape[1]  length_penalty)
                    completed.append((norm_score, new_seq))
                else:
                    candidates.append((new_score, new_seq, False))
        
        # 保留 top-k 候选
        beams = heapq.nlargest(beam_size, candidates, key=lambda x: x[0])
        
        if not beams:
            break
    
    # 合并已完成和未完成的序列
    all_seqs = completed + [(s / (seq.shape[1]  length_penalty), seq)
                            for s, seq, _ in beams]
    all_seqs.sort(key=lambda x: x[0], reverse=True)
    
    return all_seqs  # [(score, seq), ...] 按分数排序

# 对比演示
print("=== Beam Search vs 贪心搜索 ===")
print("Beam Size = 4 时的搜索空间:")
print("  Step 1: 评估整个词表 → 保留 top-4")
print("  Step 2: 每个候选扩展 top-4 → 4×4=16 个候选 → 保留 top-4")
print("  Step 3: 同上 → 16 个候选 → 保留 top-4")
print("  ...")
print("  相比贪心搜索，Beam Search 探索了 4^N 倍的路径空间")`,
                },
            ],
            table: {
                headers: ["解码策略", "计算复杂度", "确定性", "多样性", "适用场景"],
                rows: [
                    ["贪心搜索", "O(V)", "完全确定", "极低 (1 条路径)", "代码生成、结构化输出"],
                    ["Beam Search (k=4)", "O(k×V)", "完全确定", "低 (k 条路径)", "翻译、摘要"],
                    ["Beam Search (k=20)", "O(k×V)", "完全确定", "中", "需要高质量候选时"],
                    ["采样 (随机)", "O(V)", "非确定", "高", "创意写作、对话"],
                    ["核采样 (top-p)", "O(V)", "非确定", "自适应", "通用文本生成"],
                ],
            },
            mermaid: `graph TD
    A["输入提示"] --> B{"解码策略?"}
    B -->|"贪心"| C["选概率最高词"]
    B -->|"Beam Search"| D["维护 k 个候选序列"]
    B -->|"采样"| E["从概率分布随机采样"]
    
    C --> F["单一路径
局部最优"]
    D --> G["多路径并行
长度归一化"]
    G --> H["选得分最高序列"]
    E --> I["多样性输出
可能产生低概率词"]
    
    F --> J["生成文本"]
    H --> J
    I --> J
    class I s2
    class G s1
    class C s0
    classDef s0 fill:#7f1d1d
    classDef s1 fill:#14532d
    classDef s2 fill:#1e3a5f`,
            tip: "翻译任务中 Beam Search 的默认 beam_size=4 是一个经验值。beam_size 从 1 增加到 4 通常显著提升 BLEU 分数，但超过 10 后收益递减甚至下降——因为过大的 beam 倾向于选择短而安全的翻译。",
            warning: "Beam Search 生成的文本往往比采样更「保守」——它倾向于选择高概率但乏味的表达。在需要创意或多样性的任务（如故事生成、对话）中，纯 Beam Search 可能导致重复、无聊的输出。此时应切换到采样策略。",
        },
        {
            title: "3. 采样策略：温度、top-k 与 top-p",
            body: `采样策略的核心思想是：不总是选择概率最高的词，而是按照模型预测的概率分布随机选择下一个词。这引入了可控的随机性，使生成文本更具多样性和创造性。

温度采样（Temperature Sampling） 是最基础的采样控制方法。在 softmax 之前，将 logits 除以温度参数 T：P(w) = softmax(logits / T)。当 T < 1 时，概率分布变得更尖锐（peaky），模型更倾向于选择高概率词，生成的文本更确定、更保守。当 T > 1 时，概率分布变得更平坦，低概率词被选中的机会增加，生成的文本更多样、更有创意但可能不够连贯。T → 0 时趋近贪心搜索，T → ∞ 时趋近均匀随机。

Top-k 采样 在采样前只保留概率最高的 k 个词，将其他词的概率设为零，然后重新归一化。这避免了对极低概率词（通常是噪声或无意义词）的采样。k=50 是一个常用默认值——既保留了足够的候选空间，又过滤了尾部噪声。

Top-p 采样（Nucleus Sampling） 由 Holtzman 等人在 2019 年提出。它不按固定数量截断，而是按累积概率截断：选择最小的词集合 V_p，使得 Σ_{w∈V_p} P(w) ≥ p。这意味着在不同上下文中，候选词数量会自适应调整——当模型很确定时（如生成 "The capital of France is ..."），候选集可能只有 2-3 个词；当上下文模糊时，候选集可能包含几十个词。这比固定 top-k 更灵活。`,
            code: [
                {
                    lang: "python",
                    code: `# 温度采样详解
import torch
import torch.nn.functional as F

def temperature_sampling(logits, temperature=1.0):
    """温度采样：控制生成的随机性程度"""
    scaled_logits = logits / temperature
    probs = F.softmax(scaled_logits, dim=-1)
    return torch.multinomial(probs, num_samples=1)

# 温度对概率分布的影响
logits = torch.tensor([5.0, 3.0, 1.0, 0.5, -1.0, -2.0])
words = ["the", "a", "one", "this", "that", "some"]

print("=== 温度对概率分布的影响 ===")
print(f"{'词':<8} {'Logits':>8}", end="")
for t in [0.1, 0.5, 1.0, 2.0, 5.0]:
    print(f" {f'T={t:.1f}':>10}", end="")
print()

for word, logit in zip(words, logits):
    print(f"{word:<8} {logit:>8.1f}", end="")
    for t in [0.1, 0.5, 1.0, 2.0, 5.0]:
        p = F.softmax(logit.unsqueeze(0) / t, dim=-1).item()
        print(f" {p:>10.4f}", end="")
    print()

print("\\n观察:")
print("  T=0.1: 几乎 100% 选择 'the' (贪心搜索)")
print("  T=0.5: 'the' 占主导，但 'a' 也有机会")
print("  T=1.0: 原始分布，概率自然衰减")
print("  T=2.0: 分布变平，低概率词机会增加")
print("  T=5.0: 接近均匀分布，几乎随机")`,
                },
                {
                    lang: "python",
                    code: `# Top-k 与 Top-p 采样对比
import torch
import torch.nn.functional as F

def top_k_sampling(logits, k=50):
    """Top-k 采样：只从概率最高的 k 个词中采样"""
    top_k_values, top_k_indices = torch.topk(logits, k)
    # 将非 top-k 的 logits 设为负无穷
    filtered_logits = torch.full_like(logits, float('-inf'))
    filtered_logits.scatter_(0, top_k_indices, top_k_values)
    probs = F.softmax(filtered_logits, dim=-1)
    return torch.multinomial(probs, num_samples=1)

def top_p_sampling(logits, p=0.9):
    """Top-p (Nucleus) 采样：按累积概率截断"""
    sorted_logits, sorted_indices = torch.sort(logits, descending=True)
    cumulative_probs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)
    
    # 找到累积概率首次 >= p 的位置
    remove_mask = cumulative_probs > p
    # 保留第一个超过 p 的词（确保概率和 >= p）
    remove_mask[1:] = remove_mask[:-1].clone()
    remove_mask[0] = False
    
    # 移除低概率词
    filtered_logits = sorted_logits.masked_fill(remove_mask, float('-inf'))
    # 恢复原始顺序
    original_order = torch.argsort(sorted_indices)
    restored_logits = filtered_logits[original_order]
    
    probs = F.softmax(restored_logits, dim=-1)
    return torch.multinomial(probs, num_samples=1)

# 对比两种策略
logits = torch.randn(1000)  # 模拟 1000 个候选词的 logits

# Top-k: 固定保留 50 个词
top_k_candidates = torch.topk(logits, 50)
print(f"Top-k=50: 始终保留 {len(top_k_candidates.values)} 个候选词")

# Top-p: 自适应保留
sorted_probs = F.softmax(torch.sort(logits, descending=True).values, dim=-1)
cum_probs = torch.cumsum(sorted_probs, dim=-1)
top_p_count = (cum_probs <= 0.9).sum().item() + 1
print(f"Top-p=0.9: 保留 {top_p_count} 个候选词 (自适应)")

print("\\nTop-k vs Top-p 的关键区别:")
print("  Top-k: 固定数量，不考虑概率分布形状")
print("    → 确定上下文 vs 模糊上下文都保留 50 个词")
print("  Top-p: 按累积概率，自适应调整候选数量")
print("    → 确定上下文可能只保留 3 个词")
print("    → 模糊上下文可能保留 100 个词")`,
                },
            ],
            table: {
                headers: ["参数", "典型值", "效果", "调优建议"],
                rows: [
                    ["温度 T=0.1-0.3", "极低", "几乎确定性输出", "代码生成、数学推导"],
                    ["温度 T=0.5-0.7", "低-中", "适度随机性", "技术写作、摘要"],
                    ["温度 T=0.8-1.0", "中", "标准随机性", "对话、创意写作"],
                    ["温度 T=1.2-2.0", "高", "高度随机", "诗歌、故事、头脑风暴"],
                    ["Top-k = 5-20", "严格", "候选空间小", "需要控制输出范围"],
                    ["Top-k = 40-100", "宽松", "候选空间大", "需要多样性"],
                    ["Top-p = 0.7-0.85", "保守", "候选集紧凑", "高质量生成"],
                    ["Top-p = 0.9-0.95", "宽松", "候选集较大", "创意生成"],
                ],
            },
            mermaid: `graph TD
    A["模型输出 logits"] --> B["除以温度 T"]
    B --> C["Softmax → 概率分布"]
    C --> D{"采样策略?"}
    D -->|"Top-k"| E["保留 top-k 个词
归一化后采样"]
    D -->|"Top-p"| F["累积概率 ≥ p 的词
归一化后采样"]
    D -->|"两者结合"| G["先 top-k 过滤
再 top-p 截断"]
    E --> H["随机采样一个词"]
    F --> H
    G --> H
    H --> I["追加到生成序列"]
    I --> A
    class H s2
    class C s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d`,
            tip: "实际应用中，top-k 和 top-p 经常结合使用：先 top-k=50 过滤掉尾部噪声词，再 top-p=0.9 自适应调整候选集大小。这比单独使用任何一种策略都更稳健。",
            warning: "温度参数对生成质量的影响是非线性的。T 从 0.7 增加到 0.8 的影响，可能比从 1.0 增加到 1.1 大得多。调参时建议以 0.1 为步长进行精细搜索，而不是粗调。",
        },
        {
            title: "4. 核采样（Nucleus Sampling）深度解析",
            body: `核采样（Nucleus Sampling），即 top-p 采样，是 Holtzman 等人在论文「The Curious Case of Neural Text Degeneration」中提出的解码策略。这篇论文揭示了一个重要发现：传统的贪心搜索和 Beam Search 生成的文本往往存在「退化」（degeneration）问题——重复、乏味、缺乏信息量。

核采样的数学原理： 给定词汇表 V 和概率分布 P(w)，定义核集合 V_p = {w₁, w₂, ..., w_k}，其中 w₁, w₂, ..., w_k 是按概率降序排列的词，k 是最小的满足 Σ_{i=1}^{k} P(w_i) ≥ p 的整数。然后在 V_p 上重新归一化概率分布进行采样。

为什么核采样比 top-k 更好？ 考虑两个场景：(1) 上下文是 "The capital of France is"，模型高度确定下一个词是 "Paris"（概率 0.8），其次是 "Lyon"（0.05）。此时 top-k=50 会保留 50 个候选词，其中 48 个几乎不可能被选中，但它们的存在仍然增加了采样到噪声词的风险。而 top-p=0.9 只会保留 "Paris" 和 "Lyon"（累积概率 0.85），再加一两个词就达到 0.9，候选集自然很小。(2) 上下文是 "It was a very"，模型不确定后面接什么——可能是形容词（"good", "bad", "interesting"）、名词短语或其他结构。此时 top-p=0.9 会自动扩大候选集到几十甚至上百个词。

与温度采样的组合**： 核采样通常与温度采样组合使用：先用温度调整 logits 的分布形状，再用 top-p 截断候选集。OpenAI 的 GPT 系列模型默认使用 temperature=1.0 + top_p=0.9（或 top_p=1.0），这是一个经过大量实验验证的稳健组合。`,
            code: [
                {
                    lang: "python",
                    code: `# 核采样的可视化分析
import torch
import torch.nn.functional as F

def nucleus_sampling_analysis(logits, p_values=[0.5, 0.7, 0.9, 0.95, 0.99]):
    """分析不同 top-p 值对候选集大小的影响"""
    probs = F.softmax(logits, dim=-1)
    sorted_probs, _ = torch.sort(probs, descending=True)
    cum_probs = torch.cumsum(sorted_probs, dim=-1)
    
    print("=== 核采样候选集分析 ===")
    print(f"{'top-p':>6} {'候选词数':>8} {'累积概率':>8} {'最高词概率':>10}")
    print("-" * 40)
    
    for p in p_values:
        # 找到最小 k 使得累积概率 >= p
        k = (cum_probs < p).sum().item() + 1
        cum_at_k = cum_probs[k - 1].item()
        top_prob = sorted_probs[0].item()
        print(f"{p:>6.2f} {k:>8} {cum_at_k:>8.4f} {top_prob:>10.4f}")
    
    return k

# 场景 1: 高确定性上下文
print("场景 1: 「The capital of France is ___」")
logits_certain = torch.tensor([8.0, 2.0, 1.0, 0.5, 0.0, -1.0, -1.5, -2.0])
nucleus_sampling_analysis(logits_certain)

# 场景 2: 低确定性上下文
print("\\n场景 2: 「The movie was very ___」")
logits_uncertain = torch.tensor([3.0, 2.8, 2.7, 2.5, 2.4, 2.3, 2.2, 2.1])
nucleus_sampling_analysis(logits_uncertain)

print("\\n关键发现:")
print("  高确定性: top-p=0.9 可能只保留 1-2 个词")
print("  低确定性: top-p=0.9 可能保留全部 8 个词")
print("  → 核采样根据上下文不确定性自动调节候选集大小")`,
                },
                {
                    lang: "python",
                    code: `# 核采样与 Beam Search 生成质量对比
import torch
import torch.nn.functional as F

def compare_decoding_strategies():
    """对比不同解码策略的生成结果特征"""
    strategies = {
        "贪心搜索": {
            "优点": ["确定性", "计算高效", "适合结构化输出"],
            "缺点": ["容易重复", "缺乏多样性", "局部最优陷阱"],
            "典型输出": "这是一个非常好的产品。这是一个非常好的产品。",
        },
        "Beam Search (k=4)": {
            "优点": ["质量稳定", "翻译效果好", "长度可控"],
            "缺点": ["保守乏味", "缺乏惊喜", "可能重复"],
            "典型输出": "该产品具有良好的性能和出色的用户体验。",
        },
        "Top-k (k=50)": {
            "优点": ["避免尾部噪声", "适度多样性", "实现简单"],
            "缺点": ["候选集大小固定", "不考虑概率分布形状"],
            "典型输出": "这个产品真的很棒，使用体验超出预期。",
        },
        "Top-p (p=0.9)": {
            "优点": ["自适应候选集", "自然多样", "论文推荐"],
            "缺点": ["计算略复杂", "需要调 p 值"],
            "典型输出": "用了这款产品之后，感觉生活品质都提升了。",
        },
        "Temperature (T=0.7)": {
            "优点": ["简单直观", "连续可调", "与 top-p 兼容"],
            "缺点": ["全局影响分布", "不区分上下文确定性"],
            "典型输出": "这款产品的表现确实让人印象深刻。",
        },
    }
    
    for name, info in strategies.items():
        print(f"\\n{'='*40}")
        print(f"策略: {name}")
        print(f"{'='*40}")
        print(f"  优点: {', '.join(info['优点'])}")
        print(f"  缺点: {', '.join(info['缺点'])}")
        print(f"  示例: {info['典型输出']}")

compare_decoding_strategies()

# 推荐组合
print("\\n\\n=== 推荐解码组合 ===")
print("代码生成: temperature=0.2 + top_p=1.0 (确定性优先)")
print("技术写作: temperature=0.7 + top_p=0.9 (平衡质量与多样性)")
print("创意写作: temperature=1.0 + top_p=0.95 (多样性优先)")
print("对话系统: temperature=0.8 + top_p=0.9 (自然流畅)")
print("翻译任务: beam_size=4-6 (确定性最佳) 或 top_p=0.95 (多样性) ")`,
                },
            ],
            table: {
                headers: ["实验条件", "人类评分 (1-5)", "重复率", "词汇多样性 (MTLD)", "信息密度", "连贯性"],
                rows: [
                    ["贪心搜索", "2.8", "高 (15%)", "低", "低", "高"],
                    ["Beam Search (k=10)", "3.1", "高 (12%)", "低-中", "中", "高"],
                    ["Top-k (k=50)", "3.6", "中 (5%)", "中-高", "中-高", "中-高"],
                    ["Top-p (p=0.9)", "3.9", "低 (3%)", "高", "高", "高"],
                    ["Top-p (p=0.95) + T=0.7", "4.1", "低 (2%)", "高", "高", "高"],
                ],
            },
            mermaid: `graph TD
    A["模型 logits"] --> B["温度缩放
logits / T"]
    B --> C["Softmax → 概率"]
    C --> D["按概率降序排序"]
    D --> E["计算累积概率"]
    E --> F["找到最小 k
使 ΣP ≥ p"]
    F --> G["截断: 只保留 top-k 个词"]
    G --> H["重新归一化"]
    H --> I["多项式采样"]
    I --> J["生成的词"]
    class J s2
    class F s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d`,
            tip: "Holtzman 等人的实验发现，top-p=0.9 在大多数任务上都能取得接近最优的人类评分。如果你不确定该用什么参数，从 temperature=1.0 + top_p=0.9 开始，然后根据生成效果微调。",
            warning: "top-p 设置过低（如 p<0.7）会过度限制候选集，导致生成文本缺乏多样性——这与 Beam Search 的「保守乏味」问题类似。top-p 设置过高（如 p>0.98）则几乎等同于无截断的随机采样，可能产生无意义的内容。",
        },
        {
            title: "5. 重复与一致性控制",
            body: `语言模型生成的一个经典问题是「重复退化」（Repetition Degeneration）：模型陷入循环，反复生成相同或相似的短语。例如：「The cat sat on the mat. The cat sat on the mat. The cat sat on the mat...」。这种现象在贪心搜索和 Beam Search 中尤为常见，但在采样策略下也可能出现。

重复的根源： 语言模型在训练时学习的是局部条件概率 P(w_t | w_{<t})。当模型生成了一段文本后，这段文本成为后续生成的上下文。如果上下文本身就是重复的（如 "The cat sat on the mat"），模型会倾向于继续重复这个模式，因为这在训练数据中是常见的（如歌词、诗歌、修辞重复）。更糟糕的是，重复一旦开始，后续的生成就被锁死在这个循环中，因为每一步的上下文都越来越强化这个模式。

重复惩罚（Repetition Penalty） 由 Keskar 等人在 2019 年提出，是最简单有效的解决方案。其核心思想是：如果一个词已经出现在生成的文本中，就降低它在下一步被选中的概率。具体做法是在 logits 层面进行操作：如果词 w 已经出现在历史中，将其 logits 除以惩罚因子 γ（γ > 1）；如果 w 未出现，保持不变。这等价于 P'(w) = P(w)^{1/γ}（对已出现词），γ 越大，惩罚越强。

N-gram 阻塞（N-gram Blocking） 是另一种策略：禁止生成已经在历史中出现过的特定 n-gram 序列。例如 no_repeat_ngram_size=3 意味着任何已经出现过的 3-gram 都不能再次生成。这比词级重复惩罚更强硬，但可能导致生成的文本不自然——因为有些重复（如代词、功能词）是完全合理的。`,
            code: [
                {
                    lang: "python",
                    code: `# 重复惩罚（Repetition Penalty）实现
import torch
import torch.nn.functional as F

def apply_repetition_penalty(logits, generated_ids, penalty=1.2):
    """
    应用重复惩罚到 logits
    logits: (1, vocab_size) 下一步的 logits
    generated_ids: (seq_len,) 已经生成的词 IDs
    penalty: 惩罚因子 γ (γ > 1 表示惩罚)
    """
    for token_id in generated_ids:
        if logits[0, token_id] > 0:
            # 正 logits → 除以惩罚因子 (减小)
            logits[0, token_id] /= penalty
        else:
            # 负 logits → 乘以惩罚因子 (更负)
            logits[0, token_id] *= penalty
    
    return logits

# 演示重复惩罚的效果
vocab_words = ["the", "cat", "sat", "on", "mat", "and", "slept", "peacefully"]
logits = torch.tensor([5.0, 4.0, 3.5, 3.0, 2.5, 1.0, 0.5, 0.0])
generated = torch.tensor([0, 1, 2, 0, 3, 4])  # 已生成: "the cat sat the on mat"

print("=== 重复惩罚效果 ===")
print("原始概率分布:")
probs_before = F.softmax(logits, dim=-1)
for word, prob in zip(vocab_words, probs_before):
    print(f"  {word:<12} {prob:.4f}")

# 应用重复惩罚
penalized_logits = apply_repetition_penalty(logits.clone(), generated, penalty=1.5)
probs_after = F.softmax(penalized_logits, dim=-1)

print("\\n应用重复惩罚后 (γ=1.5):")
for word, prob in zip(vocab_words, probs_after):
    marker = " ⚠️ 已出现" if int(vocab_words.index(word)) in generated.tolist() else ""
    print(f"  {word:<12} {prob:.4f}{marker}")

print("\\n观察: 'the'(0)、'cat'(1)、'sat'(2)、'on'(3)、'mat'(4) 的概率都被降低")
print("模型更可能选择 'and'、'slept' 等新词，打破重复循环")`,
                },
                {
                    lang: "python",
                    code: `# N-gram 阻塞与生成多样性增强
import torch
import torch.nn.functional as F
from collections import Counter

def get_ngrams(token_ids, n):
    """提取序列中的所有 n-gram"""
    return [tuple(token_ids[i:i+n]) for i in range(len(token_ids) - n + 1)]

def apply_ngram_blocking(logits, generated_ids, no_repeat_ngram_size=3):
    """
    N-gram 阻塞: 禁止生成会导致重复 n-gram 的词
    """
    if len(generated_ids) < no_repeat_ngram_size - 1:
        return logits  # 生成的词太少，无法构成 n-gram
    
    # 提取最近的 (n-1)-gram
    prefix = tuple(generated_ids[-(no_repeat_ngram_size - 1):])
    
    # 提取所有已出现的 n-gram
    all_ngrams = get_ngrams(generated_ids.tolist(), no_repeat_ngram_size)
    
    # 找到不允许接在 prefix 后面的词
    forbidden = set()
    for ngram in all_ngrams:
        if ngram[:-1] == prefix:
            forbidden.add(ngram[-1])
    
    # 将禁止词的 logits 设为负无穷
    for token_id in forbidden:
        logits[0, token_id] = float('-inf')
    
    return logits

# 多样性增强策略汇总
print("=== 生成多样性增强策略 ===\\n")

strategies = {
    "重复惩罚 (Repetition Penalty)": {
        "参数": "penalty=1.0-2.0",
        "原理": "对已出现词的 logits 除以惩罚因子",
        "效果": "词级去重，温和",
        "推荐": "通用场景，γ=1.2"
    },
    "N-gram 阻塞": {
        "参数": "no_repeat_ngram_size=2-4",
        "原理": "禁止生成已出现的 n-gram 序列",
        "效果": "n-gram 级去重，强硬",
        "推荐": "需要严格避免重复时"
    },
    "多样性惩罚 (Diverse Beam Search)": {
        "参数": "num_beam_groups, diversity_penalty",
        "原理": "Beam Search 分多组，组间施加多样性惩罚",
        "效果": "一组内相似，组间差异大",
        "推荐": "需要多个不同候选时"
    },
    "对比搜索 (Contrastive Search)": {
        "参数": "alpha (惩罚权重), k (候选数)",
        "原理": "在概率高且与历史差异大的词中选择",
        "效果": "平衡流畅度和多样性",
        "推荐": "2022 年论文推荐，优于 top-p"
    },
}

for name, info in strategies.items():
    print(f"策略: {name}")
    for key, val in info.items():
        print(f"  {key}: {val}")
    print()`,
                },
            ],
            table: {
                headers: ["策略", "控制粒度", "实现复杂度", "对流畅度的影响", "适用场景"],
                rows: [
                    ["重复惩罚 (γ)", "词级", "低 (一行代码)", "轻微", "通用默认"],
                    ["N-gram 阻塞", "n-gram 级", "低", "可能影响流畅度", "严格去重"],
                    ["Diverse Beam Search", "序列级", "中", "无影响", "多候选生成"],
                    ["对比搜索", "词级+上下文", "中", "提升", "高质量生成"],
                    ["熵正则化", "分布级", "高", "需调参", "研究场景"],
                ],
            },
            mermaid: `graph TD
    A["生成文本"] --> B{"检测重复?"}
    B -->|"词重复"| C["重复惩罚
logits / γ"]
    B -->|"n-gram 重复"| D["N-gram 阻塞
logits = -∞"]
    B -->|"无重复"| E["正常采样"]
    C --> F["修正后的 logits"]
    D --> F
    E --> G["采样下一个词"]
    F --> G
    G --> A
    class G s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d`,
            tip: "重复惩罚的 γ 参数对不同类型的文本影响不同。技术文档（如 API 文档）中重复是合理的（如反复提及函数名），建议 γ=1.0-1.1；创意写作中重复应该避免，建议 γ=1.2-1.5。",
            warning: `N-gram 阻塞过于强硬可能导致生成不自然的文本。例如，如果阻塞 3-gram，模型可能无法生成 "I think that I..." 这样的合理结构（因为 "I think that" 已经出现过）。建议从 no_repeat_ngram_size=4 开始，根据效果调整。`,
        },
        {
            title: "6. 评估指标：Perplexity、BLEU 与人工评估",
            body: `评估文本生成质量是 NLP 中最具挑战性的任务之一。与分类任务（准确率一目了然）不同，生成任务的答案不是唯一的——同一个意思可以用无数种方式表达。因此，我们需要多维度的评估指标。

困惑度（Perplexity, PPL） 是语言模型最基础的评估指标，定义为 PPL = 2^{H(p,q)}，其中 H(p,q) 是交叉熵。直觉上，困惑度衡量了模型对下一个词的「困惑程度」：PPL=100 意味着模型在每一步平均有 100 个候选词无法区分。困惑度越低，模型越好。但困惑度只衡量模型拟合测试数据的能力，不直接反映生成文本的质量——一个低困惑度的模型可能生成语法正确但语义无意义的文本。

BLEU（Bilingual Evaluation Understudy） 最初为机器翻译设计，通过计算生成文本与参考文本的 n-gram 重叠度来评估质量。BLEU 的优势是自动、快速、可重复，但它有严重局限：只考虑精确匹配，忽略同义词和语义等价；对词序变化过于敏感；且需要高质量的参考文本。

人工评估 仍然是文本生成质量的金标准。通常从三个维度打分：流畅性（Fluency）——文本是否自然流畅；一致性（Coherence）——逻辑是否连贯；有用性（Usefulness）——是否满足任务需求。人工评估的缺点是昂贵、耗时、且不同评估者之间可能存在分歧。近年来，基于大语言模型的自动评估（LLM-as-a-Judge）逐渐兴起——用 **GPT-4** 等强大模型作为评估者，在多个任务上展现出与人类评估高度一致的结果。`,
            code: [
                {
                    lang: "python",
                    code: `# 困惑度计算与解读
import torch
import torch.nn.functional as F
import math

def compute_perplexity(model, data_loader, device='cpu'):
    """计算语言模型在数据集上的困惑度"""
    model.eval()
    total_loss = 0
    total_tokens = 0
    
    with torch.no_grad():
        for batch in data_loader:
            input_ids = batch['input_ids'].to(device)
            labels = batch['labels'].to(device)
            
            outputs = model(input_ids, labels=labels)
            loss = outputs.loss  # 交叉熵损失
            
            total_loss += loss.item() * labels.numel()
            total_tokens += labels.numel()
    
    avg_loss = total_loss / total_tokens
    perplexity = math.exp(avg_loss)
    return perplexity

# 困惑度的直观理解
print("=== 困惑度的直观理解 ===\\n")
ppl_values = {
    10: "极好 - 模型几乎确定了每个词（接近完美）",
    20: "很好 - 每步约 20 个候选（高质量语言模型）",
    50: "不错 - 每步约 50 个候选（可用水平）",
    100: "一般 - 每步约 100 个候选（基线水平）",
    200: "较差 - 模型困惑度较高（需要改进）",
    500: "很差 - 模型几乎在随机猜测",
    1000: "失败 - 模型未学到有效语言模式",
}

for ppl, desc in sorted(ppl_values.items()):
    marker = "★" if ppl <= 50 else "  "
    print(f"  PPL = {ppl:<5} {marker} {desc}")

print("\\n注意: 困惑度的绝对值取决于词表大小!")
print("  词表=10K: PPL=50 可能已经很好")
print("  词表=50K: PPL=50 可能还不够好")
print("  比较困惑度时，必须在相同词表和数据集上比较")`,
                },
                {
                    lang: "python",
                    code: `# LLM-as-a-Judge: 用大模型评估生成质量
import json

def llm_judge_evaluation():
    """模拟 LLM-as-a-Judge 评估流程"""
    evaluation_prompt = """
请评估以下生成文本的质量，从 1-10 分打分：

【参考文本】
{reference}

【生成文本】
{generated}

请从以下维度评分：
1. 流畅性 (Fluency): 文本是否自然流畅，语法是否正确？
2. 一致性 (Coherence): 逻辑是否连贯，前后是否矛盾？
3. 信息完整性 (Informativeness): 是否包含了参考文本的关键信息？
4. 简洁性 (Conciseness): 是否简洁明了，没有冗余？

请以 JSON 格式输出评分：
{{"fluency": X, "coherence": X, "informativeness": X, "conciseness": X, "overall": X}}
"""

    # 评估示例
    examples = [
        {
            "reference": "Transformer 架构完全基于注意力机制，摒弃了传统的循环结构。",
            "generated": "Transformer 模型的核心是注意力机制，它不再使用循环神经网络。",
            "expected_scores": {"fluency": 9, "coherence": 9, "informativeness": 8, "conciseness": 9, "overall": 8.75}
        },
        {
            "reference": "深度学习需要大量标注数据和计算资源。",
            "generated": "深度学习需要数据和计算。深度学习需要数据和计算。",
            "expected_scores": {"fluency": 5, "coherence": 4, "informativeness": 6, "conciseness": 3, "overall": 4.5}
        },
    ]

    print("=== LLM-as-a-Judge 评估示例 ===\\n")
    for i, ex in enumerate(examples):
        print(f"示例 {i + 1}:")
        print(f"  参考: {ex['reference']}")
        print(f"  生成: {ex['generated']}")
        print(f"  预期评分: {ex['expected_scores']}")
        print()

    print("LLM-as-a-Judge 的优势:")
    print("  1. 自动化，可扩展")
    print("  2. 与人类评估相关性高 (0.7-0.9)")
    print("  3. 可评估语义质量，不仅 n-gram 匹配")
    print("  4. 支持多维度细粒度评估")
    print("\\n局限性:")
    print("  1. 评估模型自身可能存在偏见")
    print("  2. 不同评估模型之间结果可能不一致")
    print("  3. 计算成本较高（每次评估需要推理）")

llm_judge_evaluation()`,
                },
            ],
            table: {
                headers: ["评估方法", "自动化程度", "成本", "与人类相关性", "适用阶段", "局限性"],
                rows: [
                    ["困惑度 (PPL)", "全自动", "极低", "间接相关", "模型训练/选择", "不直接衡量生成质量"],
                    ["BLEU/ROUGE", "全自动", "极低", "0.3-0.6", "快速验证", "忽略语义、同义词"],
                    ["BERTScore", "全自动", "低", "0.6-0.8", "中期评估", "需要预训练模型"],
                    ["LLM-as-a-Judge", "全自动", "中", "0.7-0.9", "最终评估", "评估模型偏见"],
                    ["人工评估", "手动", "高", "1.0 (金标准)", "最终验证", "昂贵、耗时、不一致"],
                ],
            },
            mermaid: `graph TD
    A["生成的文本"] --> B{"评估方式?"}
    B -->|"自动指标"| C["困惑度 PPL"]
    B -->|"n-gram 重叠"| D["BLEU / ROUGE"]
    B -->|"语义相似度"| E["BERTScore"]
    B -->|"LLM 评估"| F["GPT-4-as-a-Judge"]
    B -->|"人工评估"| G["人工打分"]
    
    C --> H["模型拟合能力"]
    D --> I["表面匹配度"]
    E --> J["语义匹配度"]
    F --> K["多维度质量评分"]
    G --> L["金标准"]
    
    H --> M["综合评估报告"]
    I --> M
    J --> M
    K --> M
    L --> M
    class M s2
    class G s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#7f1d1d
    classDef s2 fill:#14532d`,
            tip: "在论文或项目报告中，建议同时报告自动指标（BLEU、BERTScore）和人工评估结果。自动指标用于快速迭代，人工评估用于最终验证。如果两者结果一致，结论更可靠；如果两者冲突，需要深入分析原因。",
            warning: "不要过度优化 BLEU 分数。一个 BLEU 分数很高的模型，生成文本可能枯燥乏味——因为它学会了迎合 BLEU 的偏好（n-gram 精确匹配），而不是真正提高文本质量。BLEU 是评估工具，不是优化目标。",
        },
        {
            title: "7. HuggingFace 生成实战：从 API 到高级控制",
            body: `**HuggingFace** 的 **Transformer**s 库提供了最完善的文本生成 API，支持所有主流解码策略。本节从最简单的 pipeline 开始，逐步深入到 generate() 方法的高级参数控制，最后展示如何实现自定义的解码逻辑。

Pipeline 接口是最简单的使用方式：一行代码完成模型加载、分词和生成。适合快速原型开发和简单任务。但 pipeline 隐藏了很多细节，对于需要精细控制解码策略的场景，应该直接使用 model.generate() 方法。

model.generate() 是核心生成方法，支持数十个参数控制生成行为。最关键的参数包括：max_new_tokens（最大生成 token 数）、temperature（温度）、top_k（top-k 采样）、top_p（核采样）、do_sample（是否启用采样）、num_return_sequences（生成候选数量）、repetition_penalty（重复惩罚）、no_repeat_ngram_size（n-gram 阻塞）、eos_token_id（结束 token）。这些参数可以组合使用，实现各种解码策略。

高级技巧： (1) 使用 GenerateConfig 统一管理参数，避免参数传递混乱；(2) 使用 LogitsProcessor 在生成过程中动态修改 logits，实现自定义解码逻辑（如强制包含/排除特定词、长度控制等）；(3) 使用 generate() 的 streamer 参数实现流式输出，在交互式应用中提供更好的用户体验。`,
            code: [
                {
                    lang: "python",
                    code: `# HuggingFace 文本生成：从入门到精通
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer
import torch

# === 方式 1: Pipeline (最简单) ===
print("=== 方式 1: Pipeline ===")
generator = pipeline("text-generation", model="gpt2")
result = generator(
    "人工智能的未来发展",
    max_new_tokens=50,
    do_sample=True,
    temperature=0.7,
    top_p=0.9,
    num_return_sequences=1,
)
print(f"生成结果: {result[0]['generated_text']}")

# === 方式 2: model.generate() (推荐) ===
print("\\n=== 方式 2: model.generate() ===")
model_name = "gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

prompt = "人工智能的未来发展"
inputs = tokenizer(prompt, return_tensors="pt")

# 贪心搜索
greedy_output = model.generate(
    inputs,
    max_new_tokens=50,
    do_sample=False,  # 贪心搜索
)
print(f"贪心搜索: {tokenizer.decode(greedy_output[0], skip_special_tokens=True)}")

# Beam Search
beam_output = model.generate(
    inputs,
    max_new_tokens=50,
    num_beams=5,
    early_stopping=True,
)
print(f"Beam Search: {tokenizer.decode(beam_output[0], skip_special_tokens=True)}")

# 核采样 + 温度
sampled_output = model.generate(
    **inputs,
    max_new_tokens=50,
    do_sample=True,
    temperature=0.7,
    top_p=0.9,
    repetition_penalty=1.2,
)
print(f"核采样: {tokenizer.decode(sampled_output[0], skip_special_tokens=True)}")`,
                },
                {
                    lang: "python",
                    code: `# 高级生成控制：自定义 LogitsProcessor
from transformers import (
    AutoModelForCausalLM, AutoTokenizer,
    LogitsProcessor, LogitsProcessorList,
    GenerationConfig
)
import torch

class KeywordForcingProcessor(LogitsProcessor):
    """强制生成包含特定关键词的文本"""
    
    def __init__(self, keyword_ids, min_step=10):
        self.keyword_ids = set(keyword_ids)
        self.min_step = min_step  # 至少生成 min_step 步后才开始强制
    
    def __call__(self, input_ids, scores):
        step = input_ids.shape[1]
        if step < self.min_step:
            # 降低非关键词的概率
            mask = torch.ones_like(scores, dtype=torch.bool)
            mask[:, list(self.keyword_ids)] = False
            scores[mask] -= 10.0  # 大幅降低非关键词概率
        return scores

class LengthControlProcessor(LogitsProcessor):
    """控制生成长度：接近目标长度时提高 EOS 概率"""
    
    def __init__(self, target_length, eos_token_id, scale=5.0):
        self.target_length = target_length
        self.eos_token_id = eos_token_id
        self.scale = scale
    
    def __call__(self, input_ids, scores):
        current_length = input_ids.shape[1]
        if current_length >= self.target_length * 0.8:
            # 接近目标长度时，逐渐提高 EOS 概率
            progress = (current_length - self.target_length * 0.8) / (self.target_length * 0.2)
            scores[:, self.eos_token_id] += self.scale * progress
        return scores

# === 使用 GenerationConfig 管理参数 ===
print("=== GenerationConfig 最佳实践 ===\\n")

config = GenerationConfig(
    max_new_tokens=100,
    do_sample=True,
    temperature=0.7,
    top_p=0.9,
    top_k=50,
    repetition_penalty=1.2,
    no_repeat_ngram_size=3,
    num_return_sequences=3,
    return_dict_in_generate=True,
    output_scores=True,
)

print(f"生成配置:")
for key, value in vars(config).items():
    if not key.startswith('_') and value is not None:
        print(f"  {key}: {value}")

# === 解码策略速查表 ===
print("\\n=== 解码策略参数速查 ===")
strategies = {
    "贪心搜索": {"do_sample": False},
    "Beam Search": {"num_beams": 5, "early_stopping": True},
    "Top-k 采样": {"do_sample": True, "top_k": 50, "temperature": 0.7},
    "Top-p 采样": {"do_sample": True, "top_p": 0.9, "temperature": 0.7},
    "对比搜索": {"penalty_alpha": 0.6, "top_k": 4},
    "多样 Beam Search": {"num_beams": 5, "num_beam_groups": 5, "diversity_penalty": 1.0},
}

for name, params in strategies.items():
    params_str = ", ".join(f"{k}={v}" for k, v in params.items())
    print(f"  {name}: {params_str}")`,
                },
            ],
            table: {
                headers: ["参数", "默认值", "作用", "推荐值"],
                rows: [
                    ["max_new_tokens", "20", "最大生成 token 数", "50-200 (根据任务)"],
                    ["do_sample", "False", "启用随机采样", "True (非翻译任务)"],
                    ["temperature", "1.0", "控制随机性", "0.3-0.7 (技术), 0.8-1.2 (创意)"],
                    ["top_k", "50", "Top-k 候选数", "40-100"],
                    ["top_p", "1.0", "Top-p 累积概率", "0.9-0.95"],
                    ["repetition_penalty", "1.0", "重复惩罚因子", "1.1-1.5"],
                    ["no_repeat_ngram_size", "0", "禁止重复的 n-gram 大小", "3-4"],
                    ["num_return_sequences", "1", "生成候选数量", "1-5"],
                    ["num_beams", "1", "Beam Search 宽度", "4-6 (翻译/摘要)"],
                ],
            },
            mermaid: `graph TD
    A["输入提示"] --> B["Tokenizer 编码"]
    B --> C["model.generate()"]
    C --> D{"解码策略配置"}
    
    D -->|"贪心"| E["do_sample=False"]
    D -->|"Beam"| F["num_beams=5"]
    D -->|"采样"| G["do_sample=True
+ temperature/top_p"]
    
    E --> H["LogitsProcessor 链"]
    F --> H
    G --> H
    
    H --> I["重复惩罚"]
    H --> J["N-gram 阻塞"]
    H --> K["自定义处理器"]
    
    I --> L["采样/选择下一个词"]
    J --> L
    K --> L
    L --> M{"达到停止条件?"}
    M -->|"否"| C
    M -->|"是"| N["输出序列"]
    N --> O["Tokenizer 解码"]
    O --> P["生成文本"]
    class P s2
    class D s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d`,
            tip: "在交互式应用（如聊天机器人）中，使用 streamer 参数实现流式输出：`generate(..., streamer=TextStreamer(tokenizer))`。这样用户可以在生成过程中实时看到文本输出，而不是等待全部生成完成。这对于长文本生成（如文章、故事）的用户体验提升极大。",
            warning: "使用 generate() 时最常见的错误是：忘记设置 pad_token（GPT 系列模型的 pad_token 默认是 None），导致 batch 生成时报错。解决方法：`tokenizer.pad_token = tokenizer.eos_token`。另一个常见错误是混合使用互斥参数（如同时设置 do_sample=False 和 temperature=0.7），这会导致不可预期的行为。",
        },
    ],
};
