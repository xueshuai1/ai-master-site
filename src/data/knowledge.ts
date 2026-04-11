// Knowledge base data - AI learning articles

export interface ArticleSection {
  title: string;
  body?: string;
  code?: { lang: string; code: string; filename?: string }[];
  table?: { headers: string[]; rows: string[][] };
  mermaid?: string;
  list?: string[];
  tip?: string;
  warning?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  date: string;
  readTime: string;
  level: "入门" | "进阶" | "高级";
  content?: ArticleSection[];
}

export const categories = [
  { key: "all", label: "全部", icon: "📋" },
  { key: "ml", label: "机器学习", icon: "📊" },
  { key: "dl", label: "深度学习", icon: "🧠" },
  { key: "nlp", label: "自然语言处理", icon: "💬" },
  { key: "cv", label: "计算机视觉", icon: "👁️" },
  { key: "llm", label: "大语言模型", icon: "🤖" },
  { key: "agent", label: "AI Agent", icon: "🦾" },
];

export const articles: Article[] = [
  // 机器学习
  {
    id: "ml-001",
    title: "线性回归：机器学习的第一课",
    category: "ml",
    tags: ["监督学习", "回归", "基础"],
    summary: "从最小二乘法到梯度下降，理解线性回归的数学原理与实现",
    date: "2026-04-10",
    readTime: "8 min",
    level: "入门",
  },
  {
    id: "ml-002",
    title: "决策树与随机森林实战",
    category: "ml",
    tags: ["监督学习", "集成学习", "分类"],
    summary: "从信息增益到基尼系数，掌握决策树的分裂策略与随机森林的集成思想",
    date: "2026-04-08",
    readTime: "12 min",
    level: "入门",
  },
  {
    id: "ml-003",
    title: "SVM 支持向量机详解",
    category: "ml",
    tags: ["监督学习", "分类", "核方法"],
    summary: "理解最大间隔分类器、核技巧与软间隔 SVM 的完整推导",
    date: "2026-04-05",
    readTime: "15 min",
    level: "进阶",
  },
  {
    id: "ml-004",
    title: "K-Means 聚类算法深入剖析",
    category: "ml",
    tags: ["无监督学习", "聚类"],
    summary: "从距离度量到 K 值选择，全面掌握 K-Means 及其变种算法",
    date: "2026-04-03",
    readTime: "10 min",
    level: "入门",
  },
  {
    id: "ml-005",
    title: "XGBoost 原理与调参指南",
    category: "ml",
    tags: ["集成学习", "梯度提升", "调参"],
    summary: "深入 XGBoost 的目标函数推导、正则化策略和实用调参技巧",
    date: "2026-03-28",
    readTime: "18 min",
    level: "进阶",
  },
  // 深度学习
  {
    id: "dl-001",
    title: "神经网络基础：从感知机到多层网络",
    category: "dl",
    tags: ["反向传播", "激活函数", "基础"],
    summary: "理解神经元、激活函数、反向传播和梯度消失问题",
    date: "2026-04-09",
    readTime: "12 min",
    level: "入门",
  },
  {
    id: "dl-002",
    title: "CNN 卷积神经网络完全指南",
    category: "dl",
    tags: ["CNN", "图像识别", "架构"],
    summary: "从 LeNet 到 ResNet，梳理 CNN 架构演进与核心组件",
    date: "2026-04-07",
    readTime: "20 min",
    level: "进阶",
  },
  {
    id: "dl-003",
    title: "RNN 与 LSTM：处理序列数据",
    category: "dl",
    tags: ["RNN", "LSTM", "序列建模"],
    summary: "理解循环神经网络的记忆机制与 LSTM 的门控设计",
    date: "2026-04-04",
    readTime: "15 min",
    level: "进阶",
  },
  {
    id: "dl-004",
    title: "注意力机制与 Transformer 架构",
    category: "dl",
    tags: ["Attention", "Transformer", "自注意力"],
    summary: "详解 Self-Attention、Multi-Head Attention 和 Transformer 的编码器-解码器结构",
    date: "2026-04-01",
    readTime: "25 min",
    level: "高级",
    content: [
      {
        title: "1. 为什么需要注意力机制？",
        body: "在 Transformer 出现之前，序列建模主要依赖 RNN 和 LSTM。这些模型按顺序处理序列，导致两个核心问题：一是无法并行计算，训练速度慢；二是长距离依赖问题——序列开头的信息传到末尾时已经严重衰减。注意力机制（Attention）的核心思想是：让模型在处理每个位置时，都能\"看到\"序列中所有其他位置的信息，并根据相关性分配不同的权重。",
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
      },
      {
        title: "2. Scaled Dot-Product Attention 详解",
        body: "Transformer 使用的核心注意力机制是 Scaled Dot-Product Attention。其计算公式为：Attention(Q, K, V) = softmax(QK^T / √d_k) V。其中除以 √d_k 是为了防止点积结果过大导致 softmax 梯度消失。Q（Query）、K（Key）、V（Value）都是从输入通过线性变换得到的矩阵。",
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k: int):
        super().__init__()
        self.d_k = d_k
        self.dropout = nn.Dropout(0.1)
    
    def forward(self, Q, K, V, mask=None):
        # Q, K, V shape: (batch, heads, seq_len, d_k)
        scores = torch.matmul(Q, K.transpose(-2, -1))
        scores = scores / math.sqrt(self.d_k)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
        
        attention_weights = torch.softmax(scores, dim=-1)
        attention_weights = self.dropout(attention_weights)
        
        output = torch.matmul(attention_weights, V)
        return output, attention_weights

# 示例使用
d_k = 64
attention = ScaledDotProductAttention(d_k)
Q = torch.randn(2, 8, 10, d_k)  # batch=2, heads=8, seq=10
K = torch.randn(2, 8, 10, d_k)
V = torch.randn(2, 8, 10, d_k)
output, weights = attention(Q, K, V)
print(f"输出形状: {output.shape}")  # (2, 8, 10, 64)`,
          },
        ],
      },
      {
        title: "3. Multi-Head Attention：多视角并行",
        body: "Multi-Head Attention 的核心思想是：与其让模型用一个注意力头去捕捉所有类型的依赖关系，不如用多个注意力头各自学习不同的表示子空间。每个头独立计算注意力，然后将结果拼接并通过线性变换融合。这就像从多个不同的角度理解同一段文本——一个头可能关注语法关系，另一个关注语义关联，第三个关注长距离依赖。",
        code: [
          {
            lang: "python",
            code: `class MultiHeadAttention(nn.Module):
    def __init__(self, d_model: int, num_heads: int):
        super().__init__()
        assert d_model % num_heads == 0
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        self.attention = ScaledDotProductAttention(self.d_k)
    
    def forward(self, Q, K, V, mask=None):
        batch_size = Q.size(0)
        
        # 线性变换并分头
        Q = self.W_q(Q).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(K).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(V).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        # 多头注意力
        attn_output, weights = self.attention(Q, K, V, mask)
        
        # 拼接所有头
        attn_output = attn_output.transpose(1, 2).contiguous() \\
            .view(batch_size, -1, self.d_model)
        
        return self.W_o(attn_output), weights`,
          },
        ],
      },
      {
        title: "4. Transformer 整体架构",
        body: "完整的 Transformer 由编码器和解码器堆叠而成。编码器由 N=6 个相同层组成，每层包含两个子层：多头自注意力和前馈神经网络（FFN）。解码器同样由 N 层组成，但每层包含三个子层：带掩码的多头自注意力（防止看到未来信息）、交叉注意力（关注编码器输出）和前馈网络。每个子层都使用残差连接和层归一化（LayerNorm）。",
        mermaid: `graph TB
    subgraph "编码器 (Encoder)"
        A["输入 Embedding"] --> B["位置编码 Positional Encoding"]
        B --> C["Multi-Head Self-Attention"]
        C --> D["Add & LayerNorm"]
        D --> E["Feed Forward NN"]
        E --> F["Add & LayerNorm"]
    end
    
    subgraph "解码器 (Decoder)"
        G["输出 Embedding"] --> H["位置编码"]
        H --> I["Masked Multi-Head Self-Attention"]
        I --> J["Add & LayerNorm"]
        J --> K["Multi-Head Cross-Attention"]
        F -.-> K
        K --> L["Add & LayerNorm"]
        L --> M["Feed Forward NN"]
        M --> N["Add & LayerNorm"]
    end
    
    N --> O["Linear + Softmax"]
    O --> P["输出概率分布"]`,
      },
      {
        title: "5. 位置编码：让模型感知顺序",
        body: "由于 Transformer 完全基于注意力机制，没有 RNN 的时序概念，因此需要显式地注入位置信息。原始 Transformer 使用正弦/余弦函数的位置编码：PE(pos, 2i) = sin(pos / 10000^(2i/d_model))，PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))。这种设计使得模型能够学习到相对位置关系，因为对于固定偏移量 k，PE(pos+k) 可以表示为 PE(pos) 的线性变换。",
        code: [
          {
            lang: "python",
            code: `class PositionalEncoding(nn.Module):
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
        return x + self.pe[:, :x.size(1)]`,
          },
        ],
      },
      {
        title: "6. Transformer 与 RNN/CNN 对比",
        table: {
          headers: ["特性", "RNN/LSTM", "CNN", "Transformer"],
          rows: [
            ["并行计算", "❌ 顺序处理", "✅ 完全并行", "✅ 完全并行"],
            ["长距离依赖", "⚠️ 随距离衰减", "⚠️ 受感受野限制", "✅ 全局注意力"],
            ["计算复杂度", "O(n·d²)", "O(k·n·d²)", "O(n²·d)"],
            ["训练速度", "慢", "快", "快（但内存消耗大）"],
            ["典型应用", "机器翻译(旧)", "图像分类", "LLM/翻译/摘要"],
            ["参数量", "中等", "中等", "较大"],
          ],
        },
      },
      {
        title: "7. 从 Transformer 到大语言模型",
        body: "Transformer 架构是现代大语言模型的基石。GPT 系列采用 Decoder-only 架构，BERT 采用 Encoder-only 架构，而 T5/BART 则使用完整的 Encoder-Decoder。理解 Transformer 是理解所有现代 LLM 的基础。后续的重要改进包括：RoPE 旋转位置编码、Flash Attention 加速、GQA 分组查询注意力、MoE 混合专家架构等。",
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
  },
  {
    id: "dl-005",
    title: "GAN 生成对抗网络原理与应用",
    category: "dl",
    tags: ["GAN", "生成模型", "图像生成"],
    summary: "从原始 GAN 到 StyleGAN，探索生成对抗网络的发展脉络",
    date: "2026-03-25",
    readTime: "16 min",
    level: "进阶",
  },
  // NLP
  {
    id: "nlp-001",
    title: "词嵌入：从 Word2Vec 到 GloVe",
    category: "nlp",
    tags: ["词向量", "表示学习", "基础"],
    summary: "理解分布式表示的核心思想，对比 CBOW 与 Skip-gram 模型",
    date: "2026-04-06",
    readTime: "12 min",
    level: "入门",
  },
  {
    id: "nlp-002",
    title: "BERT 预训练模型深度解析",
    category: "nlp",
    tags: ["BERT", "预训练", "微调"],
    summary: "解析 BERT 的 MLM 和 NSP 预训练任务，以及下游任务的微调方法",
    date: "2026-04-02",
    readTime: "18 min",
    level: "进阶",
  },
  // 计算机视觉
  {
    id: "cv-001",
    title: "目标检测：从 R-CNN 到 YOLO",
    category: "cv",
    tags: ["目标检测", "YOLO", "实时检测"],
    summary: "梳理两阶段与单阶段检测器的设计差异，对比 YOLO 系列各版本性能",
    date: "2026-04-05",
    readTime: "20 min",
    level: "进阶",
  },
  {
    id: "cv-002",
    title: "图像分割：语义分割与实例分割",
    category: "cv",
    tags: ["分割", "FCN", "Mask R-CNN"],
    summary: "从 FCN 到 Mask R-CNN，理解像素级预测的核心技术",
    date: "2026-03-30",
    readTime: "16 min",
    level: "进阶",
  },
  // 大语言模型
  {
    id: "llm-001",
    title: "大语言模型训练全流程",
    category: "llm",
    tags: ["预训练", "SFT", "RLHF"],
    summary: "从数据采集到预训练、指令微调到人类反馈强化学习的完整管线",
    date: "2026-04-10",
    readTime: "25 min",
    level: "高级",
    content: [
      {
        title: "1. 训练流程全景图",
        body: "现代大语言模型的训练是一个多阶段的复杂工程。从数万亿 token 的原始文本采集，到大规模分布式预训练，再到指令微调和人类反馈强化学习，每个阶段都需要精心设计。整个流程可以概括为：数据准备 → 预训练（Pre-training）→ 有监督微调（SFT）→ 奖励模型训练（RM）→ 强化学习对齐（RLHF/DPO）。",
        mermaid: `graph LR
    A["原始文本数据"] --> B["数据清洗与过滤"]
    B --> C["分词 Tokenization"]
    C --> D["预训练 Pre-training"]
    D --> E["基座模型 Base Model"]
    E --> F["指令数据构造"]
    F --> G["有监督微调 SFT"]
    G --> H["指令模型 SFT Model"]
    H --> I["偏好数据标注"]
    I --> J["奖励模型 RM"]
    J --> K["RLHF / DPO 对齐"]
    K --> L["最终产品模型"]`,
      },
      {
        title: "2. 数据准备：训练质量的基石",
        body: "数据质量直接决定模型能力的上限。现代 LLM 训练数据包含多个来源：网页文本（Common Crawl）、书籍（Books3）、代码（GitHub）、学术论文（arXiv）、对话数据等。关键步骤包括：重复数据去重（MinHash/SimHash）、质量过滤（语言分类器、困惑度过滤）、PII 去除、以及精心构造的指令数据。",
        code: [
          {
            lang: "python",
            code: `# 数据清洗示例：使用 datatrove 处理 Common Crawl
from datatrove.pipeline.readers import WarcReader
from datatrove.pipeline.filters import (
    LanguageFilter,
    UnigramLogProbFilter,
    URLFilter,
)
from datatrove.pipeline.dedup import MinhashDedup

pipeline = [
    WarcReader("s3://commoncrawl/crawl-data/CC-2024-10/"),
    LanguageFilter(language="en", threshold=0.65),
    UnigramLogProbFilter(threshold=-12.0),
    URLFilter(),
    MinhashDedup(n_grams=5, num_buckets=1000),
]

for doc in pipeline:
    process(doc)`,
          },
        ],
        table: {
          headers: ["数据源", "占比", "说明"],
          rows: [
            ["网页文本", "~60%", "Common Crawl，需大规模清洗过滤"],
            ["代码", "~10%", "GitHub 开源代码，提升推理能力"],
            ["书籍", "~5%", "高质量长文本，增强理解深度"],
            ["学术", "~5%", "arXiv 论文，提升专业知识"],
            ["Wikipedia", "~3%", "百科全书，提供结构化知识"],
            ["指令数据", "~2%", "SFT 阶段使用，量小但关键"],
            ["其他", "~15%", "对话、论坛、社交媒体等"],
          ],
        },
      },
      {
        title: "3. 分词（Tokenization）",
        body: "分词是将文本转换为模型可处理的 token 序列的关键步骤。现代 LLM 主要使用 Byte-Pair Encoding (BPE) 或其变种。分词器的词汇表大小直接影响模型效率和表现：词汇表太小会导致序列过长，太大则增加 Embedding 层参数量。Llama 使用 32K-128K 词汇表，GPT-4 使用约 100K。",
        code: [
          {
            lang: "python",
            code: `# 使用 tiktoken（OpenAI 的分词库）
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
text = "Hello, world! 你好世界！"
tokens = enc.encode(text)
print(f"Token IDs: {tokens}")
print(f"Token count: {len(tokens)}")
print(f"Decoded: {enc.decode(tokens)}")

# 中文分词效率分析
texts = ["人工智能", "机器学习", "深度学习"]
for t in texts:
    tokens = enc.encode(t)
    print(f"'{t}' → {len(tokens)} tokens: {tokens}")`,
          },
        ],
      },
      {
        title: "4. 预训练（Pre-training）",
        body: "预训练是 LLM 训练中最耗资源的阶段。模型在海量无标注文本上学习语言模型目标：给定前面的 token，预测下一个 token。关键技术包括：混合精度训练（FP16/BF16）、ZeRO 分布式优化、激活值检查点（Activation Checkpointing）、以及 Flash Attention 加速。训练一个 70B 参数的模型需要数万 GPU 小时。",
        code: [
          {
            lang: "python",
            code: `# 预训练配置示例（基于 Llama 架构）
model_config = {
    "vocab_size": 32000,
    "hidden_size": 4096,
    "intermediate_size": 11008,
    "num_hidden_layers": 32,
    "num_attention_heads": 32,
    "num_key_value_heads": 32,
    "max_position_embeddings": 4096,
    "rms_norm_eps": 1e-5,
    "rope_theta": 10000,
    "hidden_act": "silu",
    "use_flash_attention": True,
}

# 训练超参数
training_config = {
    "learning_rate": 3e-4,
    "warmup_steps": 2000,
    "lr_scheduler": "cosine",
    "weight_decay": 0.1,
    "batch_size": 4096 * 4096,
    "max_grad_norm": 1.0,
    "precision": "bf16-mixed",
}`,
          },
        ],
        table: {
          headers: ["模型规模", "参数量", "预训练数据", "GPU 小时（约）"],
          rows: [
            ["Llama 7B", "7B", "1T tokens", "~100K"],
            ["Llama 13B", "13B", "1T tokens", "~200K"],
            ["Llama 70B", "70B", "2T tokens", "~1M"],
            ["GPT-4", "~1.8T", "~13T tokens", "未知"],
            ["Claude 3", "未知", "未知", "未知"],
          ],
        },
        tip: "Chinchilla 定律：最优训练是在给定计算预算下，让模型大小和训练 token 数按固定比例扩展。过小模型过多训练或过大模型过少训练都是低效的。",
      },
      {
        title: "5. 有监督微调（SFT）",
        body: "预训练模型虽然掌握了语言知识，但不能很好地遵循指令。SFT 阶段使用高质量的指令-响应对数据微调模型，使其学会遵循指令、进行对话、完成任务。",
        code: [
          {
            lang: "python",
            code: `# SFT 微调示例（使用 Hugging Face TRL）
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3-8B",
    torch_dtype="auto",
    device_map="auto",
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3-8B")

dataset = load_dataset("HuggingFaceH4/ultrachat_200k", split="train_sft")

training_args = SFTConfig(
    output_dir="llama-3-8b-sft",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-5,
    lr_scheduler_type="cosine",
    warmup_ratio=0.05,
    fp16=True,
    logging_steps=10,
    max_seq_length=2048,
)

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    args=training_args,
)
trainer.train()`,
          },
        ],
        list: [
          "指令数据质量远比数量重要：10K 高质量样本 > 100K 低质量样本",
          "覆盖多任务：问答、摘要、翻译、代码、数学推理、创意写作",
          "包含拒绝训练：教模型识别并拒绝有害请求",
          "格式统一：使用标准化的对话模板（如 ChatML、Alpaca 格式）",
          "避免灾难性遗忘：学习率通常比预训练低 1-2 个数量级",
        ],
      },
      {
        title: "6. RLHF：让人类偏好对齐模型",
        body: "RLHF（Reinforcement Learning from Human Feedback）是让 LLM 输出与人类价值观对齐的关键技术。流程：收集人类偏好标注 → 训练奖励模型 → 使用 PPO 微调模型。",
        mermaid: `graph LR
    A["SFT 模型"] --> B["生成多个回答"]
    B --> C["人类标注偏好"]
    C --> D["训练奖励模型 RM"]
    D --> E["PPO 强化学习"]
    A --> E
    E --> F["对齐后的模型"]`,
        code: [
          {
            lang: "python",
            code: `# DPO（Direct Preference Optimization）示例
from trl import DPOTrainer, DPOConfig
from datasets import load_dataset

dataset = load_dataset("Anthropic/hh-rlhf", split="train")

dpo_config = DPOConfig(
    output_dir="llama-3-8b-dpo",
    learning_rate=5e-7,
    beta=0.1,
    max_length=1024,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
)

trainer = DPOTrainer(
    model=model,
    ref_model=ref_model,
    args=dpo_config,
    train_dataset=dataset,
    tokenizer=tokenizer,
)
trainer.train()`,
          },
        ],
        table: {
          headers: ["对齐方法", "优点", "缺点", "代表工作"],
          rows: [
            ["RLHF (PPO)", "对齐效果好，灵活", "复杂，训练不稳定", "InstructGPT, Claude"],
            ["DPO", "简单稳定，无需 RM", "效果略逊于 RLHF", "Zephyr, Mistral"],
            ["ORPO", "单阶段训练，高效", "较新方法，验证不足", "ORPO"],
            ["RLAIF", "用 AI 替代人类标注", "AI 标注质量依赖基座", "Constitutional AI"],
          ],
        },
      },
      {
        title: "7. 评估与部署",
        body: "训练完成后，模型需要全面评估（MMLU、GSM8K、HumanEval）和推理优化（KV Cache、vLLM 并行、量化加速）。",
        code: [
          {
            lang: "bash",
            code: `# 使用 vLLM 高性能推理服务
pip install vllm

# 启动 API 服务（Tensor 并行 4 GPU）
vllm serve meta-llama/Llama-3-8B \\
    --tensor-parallel-size 4 \\
    --max-model-len 8192 \\
    --gpu-memory-utilization 0.9`,
          },
        ],
        table: {
          headers: ["优化技术", "速度提升", "内存节省", "质量损失"],
          rows: [
            ["KV Cache", "2-5x", "-", "无"],
            ["vLLM PagedAttention", "10-24x", "显著", "无"],
            ["INT8 量化", "1.5-2x", "~50%", "微小"],
            ["INT4 量化", "2-3x", "~75%", "轻微"],
            ["Speculative Decoding", "2-3x", "-", "无"],
          ],
        },
      },
    ],
  },
  {
    id: "llm-002",
    title: "Prompt Engineering 最佳实践",
    category: "llm",
    tags: ["Prompt", "技巧", "实战"],
    summary: "系统学习 CoT、Few-shot、ReAct 等 Prompt 设计模式与技巧",
    date: "2026-04-08",
    readTime: "15 min",
    level: "入门",
  },
  {
    id: "llm-003",
    title: "RAG 检索增强生成架构指南",
    category: "llm",
    tags: ["RAG", "向量数据库", "知识库"],
    summary: "如何结合外部知识库增强 LLM 的准确性和时效性",
    date: "2026-04-06",
    readTime: "18 min",
    level: "进阶",
  },
  // AI Agent
  {
    id: "agent-001",
    title: "AI Agent 入门：从概念到实现",
    category: "agent",
    tags: ["Agent", "规划", "工具使用"],
    summary: "理解 AI Agent 的核心组件：感知、规划、记忆和工具调用",
    date: "2026-04-09",
    readTime: "15 min",
    level: "入门",
  },
  {
    id: "agent-002",
    title: "Multi-Agent 系统设计与协作",
    category: "agent",
    tags: ["Multi-Agent", "协作", "架构"],
    summary: "探索多智能体系统的通信协议、角色分配和任务协调机制",
    date: "2026-04-07",
    readTime: "20 min",
    level: "高级",
  },
];
