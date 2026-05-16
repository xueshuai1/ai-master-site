import { Article } from '../knowledge';

export const article: Article = {
    id: "nlp-002",
    title: "BERT 预训练模型深度解析",
    category: "nlp",
    tags: ["BERT", "预训练", "微调"],
    summary: "解析 BERT 的 MLM 和 NSP 预训练任务，以及下游任务的微调方法",
    date: "2026-04-02",
    readTime: "18 min",
    level: "进阶",
    content: [
      {
        title: "1. 预训练范式的革命：从静态词向量到上下文感知表示",
        body: `在 BERT（2018）之前，NLP 的词表示经历了从 one-hot → Word2Vec/GloVe → ELMo 的演进，每一次都在解决前一代的根本缺陷。

One-hot 编码的问题是维度灾难和语义真空——"猫"和"狗"的向量正交，毫无相似性可言。Word2Vec 和 GloVe 通过分布式表示让语义相近的词在向量空间中靠近，但它们生成的向量是静态的：无论上下文如何，"bank" 在 "river bank" 和 "bank account" 中是同一个向量。

ELMo（2018）首次引入了上下文感知表示：用双向 LSTM 编码器，同一个词在不同语境中得到不同的向量。但 LSTM 的序列处理是顺序的，无法像 **Transformer** 那样并行计算所有位置之间的关系。

BERT 的革命性在于：它首次将 **Transformer** 编码器大规模应用于预训练，通过双向自注意力机制，让每个词都能同时看到左右两侧的完整上下文。更重要的是，它提出了"预训练+微调"的范式——先在海量无标注文本上学习通用语言理解能力，再在具体任务上做少量微调。这一范式彻底改变了 NLP 的研究方向。`,
        code: [
          {
            lang: "python",
            code: `# 对比静态词向量 vs 上下文感知表示
from transformers import BertTokenizer, BertModel
import torch

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

# 同一个词 "bank" 在不同语境中的向量不同
sentences = [
    "I deposited money at the bank",
    "We sat on the river bank",
    "The pilot had to bank the plane",
]

for sent in sentences:
    inputs = tokenizer(sent, return_tensors="pt")
    with torch.no_grad():
        outputs = model(inputs)
    
    # 找到 "bank" 的位置
    tokens = tokenizer.tokenize(sent)
    bank_idx = tokens.index("bank") + 1  # +1 for [CLS]
    bank_vector = outputs.last_hidden_state[0, bank_idx]
    print(f"'bank' in '{sent}':")
    print(f"  向量均值: {bank_vector.mean().item():.6f}, L2范数: {bank_vector.norm().item():.4f}")`,
          },
          {
            lang: "python",
            code: `# Word2Vec 静态表示 vs BERT 上下文表示对比
import numpy as np

# 模拟 Word2Vec：同一个向量表示所有语境
word2vec_bank = np.random.randn(300)

sentences = [
    "river bank is muddy",
    "bank account balance",
    "plane started to bank",
]

print("=== Word2Vec (静态) ===")
for i, sent in enumerate(sentences):
    sim = np.dot(word2vec_bank, word2vec_bank) / (
        np.linalg.norm(word2vec_bank)  2
    )
    print(f"  '{sent}': 向量完全相同 (sim={sim:.4f})")

print("\\n=== BERT (上下文感知) ===")
# 模拟 BERT 输出：不同语境下向量不同
bert_vectors = [np.random.randn(768) * (1 + 0.1 * i) for i in range(3)]
for i, (sent, vec) in enumerate(zip(sentences, bert_vectors)):
    sim = np.dot(bert_vectors[0], vec) / (
        np.linalg.norm(bert_vectors[0]) * np.linalg.norm(vec)
    )
    print(f"  '{sent}': 与句子0的余弦相似度 = {sim:.4f}")`,
          },
          {
            lang: "python",
            code: `# BERT 预训练+微调范式示意图代码
from transformers import BertForSequenceClassification, Trainer, TrainingArguments
from datasets import load_dataset

# 第 1 步：预训练模型已经包含了通用语言理解能力
# （由 Google 在 Wikipedia + BooksCorpus 上训练）
model = BertForSequenceClassification.from_pretrained(
    'bert-base-uncased',
    num_labels=2  # 二分类
)
print(f"预训练参数数量: {model.num_parameters():,}")

# 第 2 步：用下游任务数据微调（只需少量标注数据）
# dataset = load_dataset('glue', 'mrpc')
# training_args = TrainingArguments(
#     output_dir='./results',
#     num_train_epochs=3,
#     per_device_train_batch_size=16,
#     learning_rate=2e-5,
# )
print("预训练权重已加载，可直接在下游任务上微调")`,
          },
        ],
        table: {
          headers: ["模型", "年份", "架构", "上下文感知", "双向性", "参数量"],
          rows: [
            ["Word2Vec", "2013", "浅层神经网络", "❌ 静态向量", "N/A", "~300维"],
            ["GloVe", "2014", "全局矩阵分解", "❌ 静态向量", "N/A", "~300维"],
            ["ELMo", "2018", "双向 LSTM", "✅ 动态", "弱双向", "~94M"],
            ["BERT-base", "2018", "Transformer 编码器", "✅ 动态", "强双向", "~110M"],
            ["BERT-large", "2018", "Transformer 编码器", "✅ 动态", "强双向", "~340M"],
          ],
        },
        mermaid: `graph LR
    A["One-Hot"] -->|"语义空白"| B["Word2Vec/GloVe"]
    B -->|"静态向量"| C["ELMo"]
    C -->|"LSTM 顺序处理"| D["BERT"]
    D -->|"Transformer 双向自注意力"| E["预训练+微调范式"]
    E --> F["11 项 NLP 任务 SOTA"]
    class F s5
    class E s4
    class D s3
    class C s2
    class B s1
    class A s0
    classDef s0 fill:#7f1d1d
    classDef s1 fill:#7c2d12
    classDef s2 fill:#713f12
    classDef s3 fill:#14532d
    classDef s4 fill:#1e3a5f
    classDef s5 fill:#581c87`,
        tip: "理解 BERT 的关键不是记住架构细节，而是理解它解决的核心问题：如何让模型在阅读一个词的同时，同时看到它左边和右边的所有上下文。这就是'双向'的真正含义。",
        warning: "BERT 的'双向'并非真正自由的双向——MLM 预训练中存在 'seen token leak' 问题（微调时能看到所有词，预训练时 [MASK] 位置看不到真实词）。这种预训练-微调不一致在后续研究中被 RoBERTa 等人修正。",
      },
      {
        title: "2. Transformer 编码器架构：Self-Attention 的力量",
        body: `BERT 的核心是 **Transformer** 的编码器（Encoder）部分。与解码器不同，编码器只包含自注意力机制和前馈网络，没有自回归的掩码。

Self-Attention（自注意力）是 **Transformer** 的灵魂。对于输入序列中的每个位置，它同时计算与所有其他位置的关系强度。具体地，每个词的嵌入被投影为三个向量：查询向量 Q（Query）、键向量 K（Key）、值向量 V（Value）。注意力分数 = softmax(QKᵀ / √dₖ)V，其中 √dₖ 是缩放因子，防止点积过大导致 softmax 饱和。

多头注意力（Multi-Head Attention）将 Q、K、V 分别拆成 h 组（BERT 中 h=12），每组在不同的子空间中独立计算注意力，然后拼接。这相当于让模型同时从多个"视角"理解词与词之间的关系——有的头关注语法结构，有的关注语义角色，有的关注指代关系。

位置编码（Positional Encoding）解决了 Transformer 天生的位置无关问题。BERT 使用可学习的位置嵌入（Learned Positional Embedding），每个位置有一个独立的向量，与词嵌入相加。最大支持 512 个位置。

前馈网络（Feed-Forward Network, FFN）是一个两层 MLP，中间维度是隐藏维度的 4 倍（BERT-base 中 768→3072→768），使用 GELU 激活函数。它独立处理每个位置，相当于对每个词的表示做非线性变换。`,
        code: [
          {
            lang: "python",
            code: `# 从零实现 Self-Attention
import numpy as np

def softmax(x):
    e_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e_x / e_x.sum(axis=-1, keepdims=True)

def self_attention(Q, K, V):
    """缩放点积注意力"""
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)
    attn_weights = softmax(scores)
    output = attn_weights @ V
    return output, attn_weights

# 示例：3 个词，每个词 4 维
np.random.seed(42)
W_q = np.random.randn(4, 4)
W_k = np.random.randn(4, 4)
W_v = np.random.randn(4, 4)

embeddings = np.array([
    [1.0, 0.5, 0.2, 0.1],   # "我"
    [0.8, 1.2, 0.3, 0.5],   # "爱"
    [0.3, 0.6, 1.0, 0.8],   # "学习"
])

Q = embeddings @ W_q
K = embeddings @ W_k
V = embeddings @ W_v

output, weights = self_attention(Q, K, V)
print("注意力权重矩阵:")
print(np.round(weights, 3))
print("\\n自注意力输出:")
print(np.round(output, 3))`,
          },
          {
            lang: "python",
            code: `# 多头注意力机制
import torch
import torch.nn as nn

class MultiHeadAttention(nn.Module):
    """多头注意力简化实现"""
    
    def __init__(self, d_model=768, n_heads=12):
        super().__init__()
        assert d_model % n_heads == 0
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
    
    def forward(self, x, mask=None):
        batch_size = x.size(0)
        
        # 线性投影 + 拆分成多头
        Q = self.W_q(x).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_k(x).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_v(x).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        
        # 缩放点积注意力
        scores = Q @ K.transpose(-2, -1) / (self.d_k ** 0.5)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
        attn = torch.softmax(scores, dim=-1)
        
        output = (attn @ V).transpose(1, 2).contiguous()
        output = output.view(batch_size, -1, self.d_model)
        return self.W_o(output), attn

# BERT-base 参数分析
mha = MultiHeadAttention(d_model=768, n_heads=12)
print(f"多头注意力参数量: {sum(p.numel() for p in mha.parameters()):,}")
print(f"  每个头维度: {768 // 12} = 64")
print(f"  4 个线性层 × 768 × 768 × 2 ≈ {4 * 768 * 768:,}")`,
          },
          {
            lang: "python",
            code: `# BERT 编码器完整层结构
import torch
import torch.nn as nn

class BertEncoderLayer(nn.Module):
    """单层 BERT 编码器"""
    
    def __init__(self, d_model=768, n_heads=12, d_ff=3072, dropout=0.1):
        super().__init__()
        self.self_attn = nn.MultiheadAttention(d_model, n_heads, dropout=dropout)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_ff, d_model),
            nn.Dropout(dropout),
        )
        self.ln1 = nn.LayerNorm(d_model)
        self.ln2 = nn.LayerNorm(d_model)
    
    def forward(self, x):
        # 子层 1: 多头自注意力 + 残差 + LayerNorm
        attn_out, _ = self.self_attn(x, x, x)
        x = self.ln1(x + attn_out)
        
        # 子层 2: 前馈网络 + 残差 + LayerNorm
        ffn_out = self.ffn(x)
        x = self.ln2(x + ffn_out)
        return x

# BERT-base: 12 层编码器
print("BERT-base 编码器配置:")
print(f"  隐藏维度: 768")
print(f"  注意力头数: 12")
print(f"  FFN 中间维度: 3072 (4×)")
print(f"  编码器层数: 12")
print(f"  最大序列长度: 512")
print(f"  总参数量: ~110M")

layer = BertEncoderLayer()
x = torch.randn(2, 128, 768)  # batch=2, seq=128, dim=768
out = layer(x)
print(f"\\n输入形状: {x.shape} → 输出形状: {out.shape}")`,
          },
        ],
        table: {
          headers: ["组件", "BERT-base", "BERT-large", "作用"],
          rows: [
            ["隐藏层数 (L)", "12", "24", "编码深度"],
            ["隐藏维度 (H)", "768", "1024", "表示容量"],
            ["注意力头数", "12", "16", "多视角并行"],
            ["FFN 中间维度", "3072", "4096", "非线性变换容量"],
            ["每头维度", "64", "64", "注意力细粒度"],
          ],
        },
        mermaid: `graph TD
    A["输入嵌入 + 位置嵌入"] --> B["LayerNorm"]
    B --> C["Multi-Head Self-Attention"]
    C --> D["残差连接 +"]
    D --> E["LayerNorm"]
    E --> F["Feed-Forward NN"]
    F --> G["残差连接 +"]
    G --> H["输出"]
    
    subgraph "Encoder Layer ×12"
        B
        C
        D
        E
        F
        G
    end
    class H s3
    class F s2
    class C s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12
    classDef s3 fill:#581c87`,
        tip: "注意力头可视化是理解 BERT 内部运作的最佳方式。使用 bertviz 库可以看到：某些头专门学习句法关系（如主谓一致），某些头关注局部窗口（类似 n-gram），还有些头学到长距离依赖。",
      },
      {
        title: "3. MLM 掩码语言模型：让模型学会填空",
        body: `MLM（Masked Language Model）是 BERT 的核心预训练任务。它的思想极其简单：随机遮住输入文本中的一部分词，让模型预测被遮住的词是什么。这本质上就是一个大规模的"完形填空"游戏。

15% 掩码策略是 BERT 论文中精心设计的：从输入序列中随机选择 15% 的 token 进行掩码处理。但并不是所有被选中的 token 都直接替换为 [MASK]——这里有一个精妙的 80/10/10 规则。

80% 的概率替换为 [MASK]：这是标准的完形填空。例如 "I [MASK] to school" → 预测 "go"。
10% 的概率替换为随机词：例如 "I 'elephant' to school" → 模型需要识别出 'elephant' 是错的，应该预测 "go"。这个策略迫使模型不能简单依赖 [MASK] token 的特殊表示，而是真正理解上下文语义。
10% 的概率保持不变：例如 "I love to school"（原词就是 love）→ 模型仍需预测 "love"。这缓解了预训练和微调之间的不一致——微调时没有 [MASK] token，但预训练时有。

为什么 MLM 有效？因为它强制模型学习双向的上下文表示。与从左到右的语言模型不同，MLM 的预测可以同时利用左右两侧的信息。这使得 BERT 在需要完整上下文理解的任务（如 NER、问答）上表现卓越。`,
        code: [
          {
            lang: "python",
            code: `# MLM 掩码策略实现
import numpy as np

def create_mlm_mask(tokens, mask_prob=0.15):
    """
    BERT 的 MLM 掩码策略
    80% -> [MASK], 10% -> 随机词, 10% -> 保持不变
    """
    masked_tokens = tokens.copy()
    labels = [-100] * len(tokens)  # -100 表示忽略
    
    # 随机选择 15% 的 token
    indices = np.random.choice(
        len(tokens), 
        size=max(1, int(len(tokens) * mask_prob)), 
        replace=False
    )
    
    vocab = ["the", "a", "is", "to", "of", "and", "in", "that", "it", "for"]
    
    for idx in indices:
        roll = np.random.random()
        if roll < 0.8:
            masked_tokens[idx] = "[MASK]"
        elif roll < 0.9:
            masked_tokens[idx] = np.random.choice(vocab)
        # else: 保持不变
        
        labels[idx] = tokens[idx]  # 标签始终是原词
    
    return masked_tokens, labels

# 演示
original = ["I", "love", "to", "learn", "natural", "language", "processing"]
np.random.seed(42)

for i in range(3):
    masked, labels = create_mlm_mask(original)
    print(f"原始: {' '.join(original)}")
    print(f"掩码: {' '.join(masked)}")
    print(f"标签: {[original[j] if labels[j] != -100 else '---' for j in range(len(original))]}")
    print()`,
          },
          {
            lang: "python",
            code: `# 使用 transformers 进行 MLM 推理
from transformers import pipeline

fill_mask = pipeline("fill-mask", model="bert-base-uncased")

# 测试不同的填空场景
examples = [
    "Paris is the capital of [MASK].",
    "The [MASK] is the largest planet in our solar system.",
    "Python is a popular [MASK] language.",
]

for text in examples:
    results = fill_mask(text)
    print(f"输入: {text}")
    for r in results[:3]:
        print(f"  {r['score']:.4f} → {r['sequence']}")
    print()

# 验证 80/10/10 策略的效果
# 在训练时，10% 的情况不替换为 [MASK]，这迫使模型
# 学会判断一个词是否需要被修改
print("MLM 损失计算：")
print("  只有被 mask 的位置计算损失")
print("  损失 = CrossEntropy(predictions[mask_positions], labels[mask_positions])")
print("  忽略位置 labels = -100")`,
          },
          {
            lang: "python",
            code: `# 分析 MLM 的学习过程
import torch
import torch.nn as nn

class MLMLossDemo:
    """演示 MLM 损失如何计算"""
    
    def __init__(self, vocab_size=30522):
        self.vocab_size = vocab_size
        self.criterion = nn.CrossEntropyLoss()
    
    def compute_loss(self, predictions, labels):
        """
        predictions: [batch, seq_len, vocab_size]
        labels: [batch, seq_len] (-100 表示忽略)
        """
        # 展平
        predictions = predictions.view(-1, self.vocab_size)
        labels = labels.view(-1)
        
        # 只计算被 mask 位置的损失
        mask = labels != -100
        loss = self.criterion(predictions[mask], labels[mask])
        return loss

demo = MLMLossDemo(vocab_size=1000)

# 模拟: batch=1, seq_len=10, 2个位置被 mask
predictions = torch.randn(1, 10, 1000)
labels = torch.tensor([[-100, -100, 42, -100, -100, -100, -100, 87, -100, -100]])

loss = demo.compute_loss(predictions, labels)
print(f"MLM Loss: {loss.item():.4f}")
print(f"有效位置: 2 / 10 (15% 掩码率的近似)")

# 掩码比例对训练的影响
print("\\n掩码比例实验:")
for rate in [0.05, 0.10, 0.15, 0.25, 0.50]:
    n_masked = max(1, int(10 * rate))
    print(f"  mask_rate={rate:.0%}: {n_masked}/10 个位置被掩码")`,
          },
        ],
        table: {
          headers: ["掩码策略", "训练速度", "表示质量", "预微调一致性", "采用模型"],
          rows: [
            ["100% [MASK]", "快", "好", "❌ 差", "原始 BERT"],
            ["80/10/10", "中", "最佳", "✅ 好", "原始 BERT"],
            ["动态掩码", "慢", "更好", "✅ 好", "RoBERTa"],
            ["Whole Word Masking", "中", "更好", "✅ 好", "BERT-wwm"],
            ["Span Masking", "中", "最优", "✅ 好", "ELECTRA/SpanBERT"],
          ],
        },
        mermaid: `graph TD
    A["输入文本"] --> B["随机选择 15％ token"]
    B --> C{"随机数 roll"}
    C -->|"80％"| D["替换为 [MASK]"]
    C -->|"10％"| E["替换为随机词"]
    C -->|"10％"| F["保持原词不变"]
    D --> G["BERT 编码器"]
    E --> G
    F --> G
    G --> H["预测被 mask 位置的词"]
    H --> I["CrossEntropy Loss"]
    class I s3
    class G s2
    class C s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#7f1d1d`,
        tip: "如果你想在自定义数据上继续预训练 BERT，MLM 是唯一需要的任务。准备纯文本语料，用 DataCollatorForLanguageModeling 自动处理掩码，无需任何标注。",
        warning: "MLM 的一个局限是无法生成文本——因为它同时看到左右上下文，无法用于自回归生成。这就是为什么 BERT 适合理解任务（分类、NER、问答），但不适合生成任务（翻译、摘要）。生成任务需要 GPT 这样的解码器架构。",
      },
      {
        title: "4. NSP 下一句预测：设计、作用与争议",
        body: `NSP（Next Sentence Prediction）是 BERT 的第二个预训练任务，旨在让模型理解句子之间的关系。任务设计很简单：给模型两个句子 A 和 B，让模型判断 B 是否是 A 的真实下一句（二分类问题）。

训练数据构造：50% 的正样本——从同一文档中取连续的两个句子；50% 的负样本——从不同文档中随机取一个句子作为 B。模型在 [CLS] token 的输出上加一个分类头，输出 IsNext / NotNext 的概率。

NSP 的初衷是帮助 BERT 理解句子级别的推理能力，这对问答（判断答案是否来自给定段落）和自然语言推理（判断两个句子的逻辑关系）等任务很重要。BERT 论文报告 NSP 对 QA 和 NLI 任务有正向贡献。

然而，后续研究对 NSP 的有效性提出了质疑。RoBERTa 论文发现：去掉 NSP 任务后，模型在大多数下游任务上的表现反而略有提升。ALBERT 论文进一步指出：NSP 任务太简单了，模型可以通过主题一致性等浅层线索轻松区分正负样本，学到的并不是真正的句子间推理能力。

更合理的替代方案是 SOP（Sentence Order Prediction）：正样本是连续的两句话，负样本是把同一对句子调换顺序。这迫使模型真正理解句序逻辑，而不仅仅是主题区分。`,
        code: [
          {
            lang: "python",
            code: `# NSP 训练数据构造
import random

def create_nsp_pairs(sentences_by_doc, n_pairs=5):
    """构造 NSP 训练样本"""
    docs = list(sentences_by_doc.values())
    pairs = []
    
    for _ in range(n_pairs):
        doc = random.choice(docs)
        
        if random.random() < 0.5 and len(doc) >= 2:
            # 正样本：同一文档中的连续句子
            i = random.randint(0, len(doc) - 2)
            sent_a = doc[i]
            sent_b = doc[i + 1]
            label = 1  # IsNext
        else:
            # 负样本：不同文档的随机句子
            doc_a = random.choice(docs)
            doc_b = random.choice([d for d in docs if d != doc_a])
            sent_a = random.choice(doc_a)
            sent_b = random.choice(doc_b)
            label = 0  # NotNext
        
        pairs.append((sent_a, sent_b, label))
    
    return pairs

# 示例
corpus = {
    "doc1": ["BERT was published in 2018.", "It revolutionized NLP.", "Many variants followed."],
    "doc2": ["The weather is nice today.", "Let's go for a walk.", "The park is beautiful."],
    "doc3": ["Neural networks use backpropagation.", "Gradient descent updates weights.", "Learning rate is crucial."],
}

random.seed(42)
pairs = create_nsp_pairs(corpus, n_pairs=5)
for a, b, label in pairs:
    status = "IsNext" if label else "NotNext"
    print(f"[{status}] A: '{a}'")
    print(f"        B: '{b}'")
    print()`,
          },
          {
            lang: "python",
            code: `# NSP 分类头实现
import torch
import torch.nn as nn
from transformers import BertModel

class BertNSP(nn.Module):
    """BERT + NSP 分类头"""
    
    def __init__(self, model_name='bert-base-uncased'):
        super().__init__()
        self.bert = BertModel.from_pretrained(model_name)
        # NSP 分类头: [CLS] 输出 → 2 类
        self.classifier = nn.Sequential(
            nn.Linear(self.bert.config.hidden_size, 2),
        )
    
    def forward(self, input_ids, token_type_ids=None, attention_mask=None):
        outputs = self.bert(
            input_ids,
            token_type_ids=token_type_ids,
            attention_mask=attention_mask
        )
        # [CLS] token 的输出 (第一个 token)
        cls_output = outputs.pooler_output
        logits = self.classifier(cls_output)
        return logits

# 使用示例
model = BertNSP()
tokenizer = torch.hub.load('huggingface/pytorch-transformers', 'tokenizer', 'bert-base-uncased')

# 模拟输入：两个句子
text_a = "The cat sat on the mat."
text_b = "It was very comfortable."

encoded = tokenizer(
    text_a, text_b,
    return_tensors="pt",
    padding=True,
    truncation=True,
    max_length=128
)

with torch.no_grad():
    logits = model(
        encoded["input_ids"],
        token_type_ids=encoded.get("token_type_ids"),
        attention_mask=encoded["attention_mask"]
    )
    probs = torch.softmax(logits, dim=-1)
    pred = torch.argmax(logits, dim=-1).item()
    
print(f"预测: {'IsNext' if pred == 1 else 'NotNext'}")
print(f"概率: IsNext={probs[0][1]:.4f}, NotNext={probs[0][0]:.4f}")`,
          },
          {
            lang: "python",
            code: `# 对比 NSP vs SOP (Sentence Order Prediction)
"""
NSP (原始 BERT):
  正样本: 同一文档的连续句子 A, B
  负样本: 不同文档的随机句子 A, B'
  问题: 模型可通过主题区分,而非学习句序逻辑

SOP (ALBERT 提出):
  正样本: 同一文档的连续句子 A, B
  负样本: 同一文档的连续句子 B, A (顺序调换)
  优点: 必须理解句序逻辑,无法靠主题作弊
"""

def create_sop_pairs(doc_sentences, n_pairs=3):
    """SOP 训练数据构造"""
    pairs = []
    for _ in range(n_pairs):
        idx = random.randint(0, len(doc_sentences) - 2)
        a, b = doc_sentences[idx], doc_sentences[idx + 1]
        
        if random.random() < 0.5:
            pairs.append((a, b, 1))  # 正确顺序
        else:
            pairs.append((b, a, 0))  # 调换了顺序
    
    return pairs

doc = [
    "First, we collect the data.",
    "Then, we preprocess it.",
    "Finally, we train the model.",
]

random.seed(42)
pairs = create_sop_pairs(doc)
for a, b, label in pairs:
    order = "正确→" if label else "←调换"
    print(f"[{order}] '{a}' → '{b}'")`,
          },
        ],
        table: {
          headers: ["模型", "句子间任务", "负样本策略", "结论"],
          rows: [
            ["BERT", "NSP", "不同文档随机句", "对 QA/NLI 有贡献"],
            ["RoBERTa", "无", "N/A", "去掉 NSP 表现更好"],
            ["ALBERT", "SOP", "同文档调换顺序", "SOP 优于 NSP"],
            ["ELECTRA", "无", "N/A", "被 replaced token detection 替代"],
            ["DeBERTa", "无", "N/A", "使用 disentangled attention"],
          ],
        },
        mermaid: `graph LR
    A["NSP 任务"] --> B{"是否有效?"}
    B -->|"BERT 论文: 是"| C["对 QA/NLI 有帮助"]
    B -->|"RoBERTa: 否"| D["去掉后表现更好"]
    B -->|"ALBERT: 太简单"| E["提出 SOP 替代"]
    
    C --> F["主题差异可作弊"]
    D --> F
    E --> G["SOP: 调换顺序"]
    G --> H["必须理解句序逻辑"]
    class H s3
    class E s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87`,
        tip: "现代 BERT 变体（RoBERTa、ELECTRA 等）都已弃用 NSP。如果你从头预训练 BERT，直接去掉 NSP，把省下来的计算资源用于更多 MLM 训练步数——RoBERTa 证明了这样效果更好。",
        warning: "NSP 任务太简单并不意味着句子间建模不重要。相反，它意味着 NSP 作为一个训练信号不够强。像 SOP、文档级 MLM（Whole Document Masking）等更难的句子间任务仍然值得研究。",
      },
      {
        title: "5. 下游任务微调：从通用到专用",
        body: `预训练模型的真正价值在于微调（Fine-tuning）。BERT 在大规模无标注语料上学习了通用语言理解能力后，只需要在具体任务的少量标注数据上微调几轮，就能达到该任务的 SOTA 水平。

微调的核心思路极其简洁：在预训练的 BERT 之上添加一个任务特定的输出层，然后用该任务的标注数据端到端地训练整个模型（包括 BERT 本身的参数）。与特征提取方法（冻结 BERT，只训练输出层）不同，微调让所有参数都能适应目标任务。

文本分类：在 [CLS] token 的输出上加一个线性分类层。这是最简单的微调方式，适用于情感分析、主题分类、垃圾邮件检测等任务。

NER 命名实体识别：在每个 token 的输出上加一个线性层，预测该 token 的 BIO 标签（Begin-Inside-Outside）。需要 token 级别的预测能力。

问答系统（SQuAD）：在 [CLS] 基础上添加两个向量，分别预测答案的起始位置和结束位置。模型需要理解问题与段落的关系。

文本相似度：将两个句子拼接输入 BERT（用 [SEP] 分隔），在 [CLS] 输出上加分类层，判断两个句子是否语义相似。`,
        code: [
          {
            lang: "python",
            code: `# 文本分类微调
from transformers import BertForSequenceClassification, Trainer, TrainingArguments
from datasets import load_dataset, DatasetDict

# 加载数据集（以 IMDB 情感分析为例）
# dataset = load_dataset("imdb")

# 加载预训练 BERT + 分类头
model = BertForSequenceClassification.from_pretrained(
    'bert-base-uncased',
    num_labels=2  # 正面/负面
)

# 训练参数
training_args = TrainingArguments(
    output_dir='./bert-imdb',
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=64,
    learning_rate=2e-5,
    weight_decay=0.01,
    warmup_ratio=0.06,
    fp16=True,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
)

# trainer = Trainer(
#     model=model,
#     args=training_args,
#     train_dataset=dataset['train'],
#     eval_dataset=dataset['test'],
# )
# trainer.train()

print("分类微调配置:")
print(f"  模型: bert-base-uncased")
print(f"  分类头: Linear(768, 2)")
print(f"  学习率: 2e-5 (比预训练小 100 倍)")
print(f"  总可训练参数: {model.num_parameters():,}")`,
          },
          {
            lang: "python",
            code: `# NER 命名实体识别微调
from transformers import BertForTokenClassification
import torch

# 标签集合（BIO 标注方案）
ner_labels = [
    "O",                    # 非实体
    "B-PER", "I-PER",       # 人名
    "B-ORG", "I-ORG",       # 组织
    "B-LOC", "I-LOC",       # 地点
    "B-MISC", "I-MISC",     # 其他
]

model = BertForTokenClassification.from_pretrained(
    'bert-base-uncased',
    num_labels=len(ner_labels)
)

# 模拟推理
from transformers import BertTokenizer

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
text = "John works at Google in New York"

inputs = tokenizer(text, return_tensors="pt")
with torch.no_grad():
    outputs = model(**inputs)
    predictions = torch.argmax(outputs.logits, dim=-1)

tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
pred_labels = [ner_labels[p] for p in predictions[0]]

print(f"文本: {text}")
print(f"Token\t\t预测标签")
print("-" * 30)
for token, label in zip(tokens[1:-1], pred_labels[1:-1]):  # 去掉 [CLS] 和 [SEP]
    print(f"{token:<16} {label}")`,
          },
          {
            lang: "python",
            code: `# 问答系统微调（SQuAD 风格）
from transformers import BertForQuestionAnswering, BertTokenizer
import torch

model = BertForQuestionAnswering.from_pretrained('bert-base-uncased')
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

# 推理
context = "BERT was introduced by Google AI in 2018."
question = "Who introduced BERT?"

inputs = tokenizer(question, context, return_tensors="pt")

with torch.no_grad():
    outputs = model(inputs)
    start_logits = outputs.start_logits
    end_logits = outputs.end_logits
    
    start_idx = torch.argmax(start_logits)
    end_idx = torch.argmax(end_logits)
    
    answer_tokens = inputs["input_ids"][0][start_idx:end_idx+1]
    answer = tokenizer.decode(answer_tokens)

print(f"问题: {question}")
print(f"上下文: {context}")
print(f"答案: {answer.strip()}")

# 文本相似度微调
from transformers import BertForSequenceClassification

sim_model = BertForSequenceClassification.from_pretrained(
    'bert-base-uncased',
    num_labels=2  # 相似/不相似
)

sent1 = "The cat is on the mat"
sent2 = "A feline sits on a rug"

inputs = tokenizer(sent1, sent2, return_tensors="pt")
with torch.no_grad():
    outputs = sim_model(inputs)
    probs = torch.softmax(outputs.logits, dim=-1)

print(f"\\n句子1: {sent1}")
print(f"句子2: {sent2}")
print(f"相似度概率: {probs[0][1]:.4f}")`,
          },
        ],
        table: {
          headers: ["任务类型", "输出层", "标注需求", "典型数据集", "BERT-base 准确率"],
          rows: [
            ["文本分类", "Linear([CLS], num_labels)", "句子级标签", "IMDB, SST-2", "~93% (SST-2)"],
            ["NER", "Linear(token, num_labels)", "Token 级 BIO 标签", "CoNLL-2003", "~92% F1"],
            ["问答", "Linear(token, 2) start/end", "答案起止位置", "SQuAD 1.1", "~88% F1"],
            ["文本相似度", "Linear([CLS], 2)", "句子对标签", "MRPC, QQP", "~87% (MRPC)"],
            ["自然语言推理", "Linear([CLS], 3)", "句子对 entail/neutral/contradict", "MNLI", "~84%"],
          ],
        },
        mermaid: `graph TD
    A["预训练 BERT"] --> B{"下游任务?"}
    B -->|"文本分类"| C["[CLS] → Linear → 类别"]
    B -->|"NER"| D["Token → Linear → BIO"]
    B -->|"问答"| E["Token → Linear → Start/End"]
    B -->|"相似度"| F["[CLS] → Linear → 相似/不相似"]
    
    C --> G["微调所有参数"]
    D --> G
    E --> G
    F --> G
    G --> H["任务特定模型"]
    class H s3
    class G s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87`,
        tip: "微调学习率建议 2e-5 ~ 5e-5，比预训练学习率（1e-4）小一个数量级。BERT 预训练权重已经很好，太大的学习率会破坏已有的语言表示。训练轮数通常 2-4 轮就够，多了会过拟合。",
        warning: "微调时一定要注意学习率！2e-5 是经验值，如果你发现模型在验证集上迅速过拟合，尝试降低到 1e-5 或增加 warmup 比例。另外，batch size 会影响效果——大的 batch size 通常需要更大的学习率。",
      },
      {
        title: "6. BERT 变体对比：百花齐放的后 BERT 时代",
        body: `BERT 发布后，学术界和工业界掀起了一场"变体竞赛"。每个变体都在尝试改进 BERT 的某个方面：训练策略、模型效率、架构设计。

RoBERTa（2019，Facebook）是 BERT 最直接的改进。它的核心发现是：BERT 并没有被充分训练。RoBERTa 做了四件事：(1) 去掉 NSP 任务，(2) 使用动态掩码（每次 epoch 重新生成掩码），(3) 更大的 batch size 和更多的训练数据（160GB vs BERT 的 16GB），(4) 更长的序列。结果是在几乎所有下游任务上都超过了 BERT。

ALBERT（2019，Google）专注于参数效率。它提出了两个关键技术：(1) 跨层参数共享——所有编码器层共享同一组权重，参数量减少 80%；(2) 嵌入因子分解——将词嵌入矩阵分解为小嵌入 → 大投影两步，进一步压缩参数。ALBERT-xxlarge 参数只有 BERT-large 的 1/10，但性能更好。

DistilBERT（2019，Hugging Face）通过知识蒸馏将 BERT 压缩为 6 层（原 12 层），保留了 97% 的性能，但推理速度提升 60%，模型大小减少 40%。这对部署场景意义重大。

DeBERTa（2020，**Microsoft**）在架构层面做了根本改进：解耦注意力机制（Disentangled Attention），将内容和位置信息分开计算注意力；增强型解码器，在预测层引入位置信息。DeBERTa-v3 在 SuperGLUE 上首次超越了人类水平。`,
        code: [
          {
            lang: "python",
            code: `# 对比不同 BERT 变体
from transformers import AutoModel, AutoTokenizer

variants = {
    "bert-base": "bert-base-uncased",
    "roberta-base": "roberta-base",
    "albert-base": "albert-base-v2",
    "distilbert": "distilbert-base-uncased",
    "deberta-base": "microsoft/deberta-base",
}

print(f"{'模型':<20} {'参数量':>12} {'层数':>6} {'隐藏维':>8}")
print("-" * 50)

configs = [
    ("bert-base",     "~110M", 12, 768),
    ("roberta-base",  "~125M", 12, 768),
    ("albert-base",   "~12M",  12, 768),  # 参数共享
    ("distilbert",    "~66M",  6,  768),
    ("deberta-base",  "~86M",  12, 768),
    ("bert-large",    "~340M", 24, 1024),
    ("albert-xxlarge","~18M",  12, 4096), # 参数共享
]

for name, params, layers, hidden in configs:
    print(f"{name:<20} {params:>12} {layers:>6} {hidden:>8}")

# 加载并测试推理速度
import time

text = "The quick brown fox jumps over the lazy dog."

for name, model_name in variants.items():
    try:
        tok = AutoTokenizer.from_pretrained(model_name)
        model = AutoModel.from_pretrained(model_name)
        
        inputs = tok(text, return_tensors="pt")
        
        # 预热
        with torch.no_grad():
            model(inputs)
        
        # 计时
        start = time.time()
        for _ in range(10):
            with torch.no_grad():
                model(inputs)
        elapsed = (time.time() - start) / 10
        
        print(f"{name}: {elapsed*1000:.1f}ms/次")
    except Exception as e:
        print(f"{name}: 加载失败 ({e})")`,
          },
          {
            lang: "python",
            code: `# 知识蒸馏：将 BERT 压缩为 DistilBERT
import torch
import torch.nn as nn
import torch.nn.functional as F

class DistilBertStudent(nn.Module):
    """简化的 DistilBERT 学生模型"""
    
    def __init__(self, teacher_hidden=768, student_hidden=768, n_layers=6):
        super().__init__()
        self.student_layers = nn.ModuleList([
            nn.TransformerEncoderLayer(
                d_model=student_hidden,
                nhead=12,
                dim_feedforward=3072,
                dropout=0.1
            ) for _ in range(n_layers)
        ])
        # 投影层：学生隐藏维 → 教师隐藏维
        self.proj = nn.Linear(student_hidden, teacher_hidden)
    
    def forward(self, x):
        for layer in self.student_layers:
            x = layer(x)
        return x

class KnowledgeDistillationLoss(nn.Module):
    """蒸馏损失：CE + KL(软标签)"""
    
    def __init__(self, temperature=2.0, alpha=0.5):
        super().__init__()
        self.temperature = temperature
        self.alpha = alpha
        self.ce_loss = nn.CrossEntropyLoss()
        self.kl_loss = nn.KLDivLoss(reduction="batchmean")
    
    def forward(self, student_logits, teacher_logits, hard_labels):
        # 硬标签损失（标准交叉熵）
        ce = self.ce_loss(student_logits, hard_labels)
        
        # 软标签损失（KL 散度）
        T = self.temperature
        soft_student = F.log_softmax(student_logits / T, dim=-1)
        soft_teacher = F.softmax(teacher_logits / T, dim=-1)
        kl = self.kl_loss(soft_student, soft_teacher) * (T ** 2)
        
        return self.alpha * ce + (1 - self.alpha) * kl

print("知识蒸馏原理:")
print("  教师: BERT-base (12 层, 110M 参数)")
print("  学生: DistilBERT (6 层, 66M 参数)")
print("  损失 = α·CE(hard) + (1-α)·KL(soft)")
print("  温度 T 控制软标签的平滑度")
print("  结果: 97% 性能, 60% 速度提升, 40% 大小减少")`,
          },
          {
            lang: "python",
            code: `# DeBERTa 解耦注意力机制
import torch
import torch.nn as nn
import math

class DisentangledSelfAttention(nn.Module):
    """DeBERTa 的解耦注意力（简化版）
    
    传统自注意力: A_ij = (q_i · k_j) / sqrt(d)
    解耦注意力: A_ij = (q_c_i · k_c_j + q_c_i · k_p_j + q_p_i · k_c_j) / sqrt(d)
    
    q_c: 内容查询向量
    q_p: 位置查询向量  
    k_c: 内容键向量
    k_p: 位置键向量
    """
    
    def __init__(self, d_model=768, n_heads=12):
        super().__init__()
        self.d_k = d_model // n_heads
        self.n_heads = n_heads
        
        # 内容投影
        self.W_qc = nn.Linear(d_model, d_model)
        self.W_kc = nn.Linear(d_model, d_model)
        # 位置投影
        self.W_qp = nn.Linear(d_model, d_model)
        self.W_kp = nn.Linear(d_model, d_model)
        # 值投影
        self.W_v = nn.Linear(d_model, d_model)
        
        self.pos_bias = nn.Embedding(512, d_model)
        self.out_proj = nn.Linear(d_model, d_model)
    
    def forward(self, x, pos_ids):
        # 内容向量
        qc = self.W_qc(x)
        kc = self.W_kc(x)
        # 位置向量
        pos_emb = self.pos_bias(pos_ids)
        qp = self.W_qp(pos_emb)
        kp = self.W_kp(pos_emb)
        
        # 三项注意力分数（简化）
        v = self.W_v(x)
        # 实际实现需要考虑相对位置偏移
        output = x  # 简化
        return self.out_proj(output)

print("DeBERTa 解耦注意力 vs 传统自注意力:")
print("  传统: Q·K 统一计算")
print("  解耦: 内容-内容 + 内容-位置 + 位置-内容 三项分开")
print("  优势: 更好地建模相对位置关系")
print("  结果: SuperGLUE 超越人类水平")`,
          },
        ],
        table: {
          headers: ["模型", "关键改进", "参数量", "训练数据", "SuperGLUE"],
          rows: [
            ["BERT-base", "基线", "110M", "16GB", "—"],
            ["RoBERTa-base", "动态掩码, 无 NSP, 更多数据", "125M", "160GB", "+2.1"],
            ["ALBERT-xxlarge", "参数共享, 嵌入分解", "18M", "16GB+Wiki", "+3.5"],
            ["DistilBERT", "知识蒸馏 (12→6 层)", "66M", "—", "97% BERT"],
            ["DeBERTa-v3", "解耦注意力, 增强解码器", "86M", "160GB", "人类水平+"],
            ["ELECTRA", "判别式预训练 (RTD)", "110M", "Wikipedia", "+1.8"],
          ],
        },
        mermaid: `graph LR
    A["BERT 2018"] --> B["RoBERTa 2019"]
    A --> C["ALBERT 2019"]
    A --> D["DistilBERT 2019"]
    A --> E["ELECTRA 2020"]
    A --> F["DeBERTa 2020"]
    
    B -->|"更多数据, 动态掩码"| G["更鲁棒的表示"]
    C -->|"参数共享"| H["更高参数效率"]
    D -->|"知识蒸馏"| I["更小更快"]
    E -->|"判别式训练"| J["更高效的预训练"]
    F -->|"解耦注意力"| K["超越人类水平"]
    class F s4
    class D s3
    class C s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#14532d
    classDef s3 fill:#7c2d12
    classDef s4 fill:#581c87`,
        tip: "实际项目中，DistilBERT 通常是性价比最高的选择——97% 的性能、40% 的模型大小、60% 的速度提升。除非你的任务非常难（如复杂推理），否则没必要用 full BERT。",
        warning: "ALBERT 的参数共享虽然减少了参数量，但也限制了模型的表达能力。在需要深层语义理解的任务上（如复杂问答、多跳推理），ALBERT 可能不如同等规模的独立层模型。选择模型时要考虑任务特性。",
      },
      {
        title: "7. 代码实战：从加载到微调再到推理",
        body: `这一章我们将 BERT 的理论知识付诸实践，完成一个完整的文本分类微调流程：加载预训练模型、准备数据集、配置训练参数、执行微调、保存模型、进行推理。

我们将使用 Hugging Face 的 transformers 库，它是目前最流行的 BERT 使用方式。整个流程只需要几十行代码，但背后蕴含了前面六章的所有概念：**Transformer** 编码器、MLM 预训练权重、任务特定的分类头、端到端微调。

关键要点：(1) 学习率要小（2e-5），因为预训练权重已经很好；(2) 使用 warmup 让学习率从 0 逐渐上升，避免初始大步破坏预训练表示；(3) 早停（Early Stopping）防止过拟合，通常 2-4 轮就够；(4) 保存最佳模型而非最后一轮的模型。`,
        code: [
          {
            lang: "python",
            code: `# 完整的 BERT 文本分类微调流程
from transformers import (
    BertTokenizer,
    BertForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding,
)
from datasets import load_dataset
import numpy as np
import evaluate

# === 第 1 步：加载数据集 ===
# dataset = load_dataset("glue", "sst2")
# label_list = dataset["train"].features["label"].names
label_list = ["negative", "positive"]

# === 第 2 步：加载分词器和模型 ===
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    num_labels=2,
    id2label={0: "negative", 1: "positive"},
    label2id={"negative": 0, "positive": 1},
)

# === 第 3 步：预处理 ===
# def tokenize(examples):
#     return tokenizer(examples["sentence"], truncation=True, max_length=128)
# 
# tokenized_datasets = dataset.map(tokenize, batched=True)
# data_collator = DataCollatorWithPadding(tokenizer)

# === 第 4 步：评估指标 ===
# metric = evaluate.load("accuracy")
# def compute_metrics(eval_pred):
#     logits, labels = eval_pred
#     predictions = np.argmax(logits, axis=-1)
#     return metric.compute(predictions=predictions, references=labels)

print("BERT 文本分类微调流程:")
print("  ✅ 加载预训练 BERT + 分类头")
print("  ✅ 设置训练参数（小学习率 + warmup）")
print("  ✅ 端到端微调所有参数")
print("  ✅ 早停防止过拟合")
print("  ✅ 保存最佳模型")`,
          },
          {
            lang: "python",
            code: `# 训练参数详解
from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir="./bert-classifier",
    
    # 训练轮数：2-4 轮足够，多了过拟合
    num_train_epochs=3,
    
    # Batch size：越大训练越快，但需要更多显存
    per_device_train_batch_size=16,
    per_device_eval_batch_size=64,
    
    # 学习率：比预训练小 100 倍
    learning_rate=2e-5,
    
    # Warmup：前 6% 的步骤学习率从 0 线性上升到峰值
    warmup_ratio=0.06,
    
    # 权重衰减：L2 正则化
    weight_decay=0.01,
    
    # 混合精度训练：加速 + 减少显存
    fp16=True,
    
    # 评估和保存策略
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    
    # 日志
    logging_steps=50,
    report_to="none",
)

# 学习率调度器可视化
print("学习率调度（Warmup + Linear Decay）：")
total_steps = 1000
warmup_steps = int(total_steps * 0.06)

for step in [0, 30, 60, 100, 200, 500, 800, 1000]:
    if step <= warmup_steps:
        lr = 2e-5 * (step / warmup_steps)
    else:
        lr = 2e-5 * (1 - (step - warmup_steps) / (total_steps - warmup_steps))
    bar = "█" * int(lr / 2e-5 * 20)
    print(f"  Step {step:4d}: {bar} ({lr:.1e})")`,
          },
          {
            lang: "python",
            code: `# 推理：使用微调后的模型
from transformers import pipeline

# 加载微调后的模型
classifier = pipeline(
    "sentiment-analysis",
    model="./bert-classifier",
    tokenizer="./bert-classifier",
    device=0  # GPU
)

# 批量推理
texts = [
    "This movie was absolutely brilliant! The acting was superb.",
    "Terrible waste of time. The plot made no sense.",
    "An average film with some good moments but also flaws.",
    "I couldn't stop watching. Best movie of the year!",
    "Boring, predictable, and overpriced.",
]

results = classifier(texts)

for text, result in zip(texts, results):
    label = result["label"]
    score = result["score"]
    emoji = "😊" if "positive" in label.lower() else "😞"
    print(f"{emoji} {label.upper():10s} ({score:.1%})")
    print(f"   {text[:60]}...")
    print()

# 不通过 pipeline 的底层推理
from transformers import BertTokenizer, BertForSequenceClassification
import torch

model = BertForSequenceClassification.from_pretrained("./bert-classifier")
tokenizer = BertTokenizer.from_pretrained("./bert-classifier")

text = "I love this product so much!"
inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=128)

with torch.no_grad():
    outputs = model(**inputs)
    probs = torch.softmax(outputs.logits, dim=-1)
    pred = torch.argmax(outputs.logits, dim=-1)

print(f"文本: {text}")
print(f"预测: {model.config.id2label[pred.item()]}")
print(f"置信度: {probs[0][pred].item():.4f}")`,
          },
          {
            lang: "python",
            code: `# 高级技巧：梯度累积 + 多 GPU + 模型压缩
"""
当显存不足时使用梯度累积模拟大 batch size
"""

# 方法 1：梯度累积
# 等效 batch = per_device_batch × gradient_accumulation_steps × n_gpus
# 例如：16 × 4 × 2 = 128

training_args = TrainingArguments(
    output_dir="./bert-accumulated",
    per_device_train_batch_size=8,
    gradient_accumulation_steps=4,  # 每 4 步更新一次
    learning_rate=2e-5,
    num_train_epochs=3,
    fp16=True,
)

# 方法 2：模型量化（推理加速）
from transformers import BertForSequenceClassification
import torch

model = BertForSequenceClassification.from_pretrained("./bert-classifier")

# INT8 量化
from optimum.int8 import INT8Quantizer

quantizer = INT8Quantizer.from_pretrained(model)
# quantized_model = quantizer.quantize()

print("模型压缩选项:")
print("  1. 知识蒸馏: BERT → DistilBERT (66M → 40% 大小)")
print("  2. 模型剪枝: 移除不重要的注意力头和 FFN 神经元")
print("  3. INT8 量化: 32-bit → 8-bit (4× 压缩)")
print("  4. 梯度累积: 模拟大 batch size 而不需要大显存")
print("  5. ONNX 导出: 转换为 ONNX 格式加速推理")

# 方法 3：ONNX 导出
# from optimum.onnxruntime import ORTModelForSequenceClassification
# model = ORTModelForSequenceClassification.from_pretrained(
#     "./bert-classifier",
#     export=True
# )
# model.save_pretrained("./bert-onnx")`,
          },
        ],
        table: {
          headers: ["场景", "推荐配置", "学习率", "Batch Size", "训练时间"],
          rows: [
            ["快速原型", "bert-base + 1 GPU", "3e-5", "32", "~30 min"],
            ["生产部署", "distilbert + ONNX", "3e-5", "32", "~15 min"],
            ["最高精度", "bert-large + 4 GPU", "1e-5", "64", "~4 hours"],
            ["显存受限", "bert-base + 梯度累积", "2e-5", "8×4", "~2 hours"],
            ["大规模数据", "roberta-base + 8 GPU", "1e-5", "128", "~6 hours"],
          ],
        },
        mermaid: `graph TD
    A["预训练 BERT 权重"] --> B["添加任务特定头"]
    B --> C["准备标注数据"]
    C --> D["设置训练参数"]
    D --> E{"学习率 2e-5"}
    E --> F["Warmup + Linear Decay"]
    F --> G["微调训练 2-4 epochs"]
    G --> H{"早停检查"}
    H -->|"未收敛"| G
    H -->|"已收敛"| I["保存最佳模型"]
    I --> J["推理部署"]
    J --> K["ONNX 量化加速"]
    class K s4
    class I s3
    class G s2
    class D s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87
    classDef s4 fill:#7c2d12`,
        tip: "实战中最有用的技巧：先用 distilbert 跑通全流程，确认 pipeline 没问题后再换 bert-base 追求精度。distilbert 的训练速度是 bert-base 的 2 倍，能快速验证你的数据预处理和训练逻辑是否正确。",
        warning: "常见的微调陷阱：(1) 忘记设置 truncation=True，超长序列会报错；(2) 学习率用太大（如 1e-3），直接破坏预训练权重；(3) 训练太多轮（>10），严重过拟合；(4) 没有早停，保存的是过拟合的最后一轮而非最佳轮次。",
      },
    ],
  };
