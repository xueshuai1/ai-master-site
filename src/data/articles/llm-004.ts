import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-004",
    title: "大语言模型预训练：数据准备与训练策略",
    category: "llm",
    tags: ["预训练", "LLM", "数据"],
    summary: "从数据清洗到训练调度，揭秘大语言模型预训练全流程",
    date: "2026-04-12",
    readTime: "22 min",
    level: "高级",
    content: [
        {
            title: "1. 预训练数据规模与来源",
            body: `大语言模型的预训练数据规模通常以万亿 Token 为单位。GPT-3 使用了 3000 亿 Token，而 LLaMA 2 的预训练数据量更是达到 2 万亿 Token。数据来源极为多样，包括 Common Crawl 网页爬取数据、维基百科、GitHub 代码库、ArXiv 学术论文、StackExchange 问答社区以及各类书籍数据。Common Crawl 是最大的单一数据来源，每月爬取超过 2.5 亿个网页，原始数据量达数百 TB。然而，未经处理的 Common Crawl 数据噪声极高，包含大量重复内容、广告模板和低质量文本，必须经过严格的清洗和过滤流程才能用于预训练。数据配比也极为关键：过多的代码数据会让模型偏向编程能力而弱化自然语言理解，而纯文本数据又会导致模型缺乏逻辑推理能力。现代预训练通常采用精心设计的混合策略，确保各领域数据的均衡覆盖。`,
            code: [
                {
                    lang: "python",
                    code: `from datasets import load_dataset

# 加载多个数据源并按比例混合
cc_data = load_dataset("allenai/c4", "en", split="train")
wiki_data = load_dataset("wikipedia", "20231101.en", split="train")
github_data = load_dataset("bigcode/the-stack", split="train")

# 按 LLaMA 风格配比：67% CC + 4.5% Wiki + 4.5% 代码
mixed = interleave_datasets(
    [cc_data, wiki_data, github_data],
    probabilities=[0.67, 0.045, 0.045],
    stopping_strategy="all_exhausted"
)`
                },
                {
                    lang: "bash",
                    code: `# 估算数据规模（Token 计数）
# 假设英文 BPE 词汇表大小 ~50K
# 1TB 纯文本 ≈ 300B tokens

total_bytes=$(du -sb ./raw_data | cut -f1)
estimated_tokens=$(echo "$total_bytes * 0.3 / 1000000000" | bc)
echo "Estimated tokens: \${estimated_tokens}B"

# 常见预训练规模对照
# GPT-3:     300B tokens (~1TB text)
# PaLM:      780B tokens (~2.6TB text)
# LLaMA 2:   2.0T tokens (~6.7TB text)
# LLaMA 3:   15.0T tokens (~50TB text)`
                }
            ],
            table: {
                headers: ["模型", "数据量(Tokens)", "主要来源", "年份"],
                rows: [
                    ["GPT-3", "300B", "Common Crawl + WebText", "2020"],
                    ["PaLM", "780B", "网页 + 书籍 + 代码 + 维基百科", "2022"],
                    ["LLaMA 2", "2.0T", "CC + 代码 + 学术 + 百科", "2023"],
                    ["LLaMA 3", "15.0T", "CC 大规模精选 + 多源混合", "2024"]
                ]
            },
            mermaid: `graph LR
    A["数据采集"] --> B["质量过滤"]
    B --> C["去重去噪"]
    C --> D["配比混合"]
    D --> E["Token化"]
    E --> F["预训练数据"]`,
            tip: "数据质量比数量更重要。研究表明，1000 亿高质量 Token 的训练效果可能超过 5000 亿未过滤 Token。优先投入资源在数据清洗上。",
            warning: "Common Crawl 数据包含大量个人隐私信息和版权内容。使用前必须经过 PII 过滤和版权合规审查，否则可能面临法律风险。"
        },
        {
            title: "2. 数据清洗与去重（CC、Common Crawl）",
            body: `数据清洗是预训练管线中最耗时但最关键的环节。Common Crawl 数据通常经历多个阶段的处理：首先用语言分类器（如 fastText 或 CLD3）过滤非目标语言，再通过启发式规则去除 HTML 残片、导航模板、页脚等结构性噪声。去重是另一项核心任务——MinHash + LSH（局部敏感哈希）是工业界标准的文档级去重方案，能够以近似线性时间复杂度处理 TB 级数据。此外，URL 级去重、段落级模糊去重、以及跨语料库的去重都需要依次执行。Gopher 团队报告称，原始 12TB 的 Common Crawl 数据经过清洗后仅剩约 1TB 的高质量文本，压缩比超过 10:1。近年来出现了自动化质量分类器（如 CCNet 的质量打分、C4 的启发式规则、Fineweb 的 EduFilter），通过训练小型分类模型来替代手工规则，显著提升了清洗效率和质量一致性。`,
            code: [
                {
                    lang: "python",
                    code: `import datasketch
from datasketch import MinHash, MinHashLSH

# MinHash 去重核心流程
def compute_minhash(text, num_perm=128):
    """为文档计算 MinHash 签名"""
    m = MinHash(num_perm=num_perm)
    for word in text.split():
        m.update(word.encode('utf-8'))
    return m

# 构建 LSH 索引进行近似重复检测
lsh = MinHashLSH(threshold=0.8, num_perm=128)
for doc_id, text in enumerate(corpus):
    mh = compute_minhash(text)
    lsh.insert(doc_id, mh)

# 查询近似重复文档
query_mh = compute_minhash(query_text)
duplicates = lsh.query(query_mh)
print(f"Found {len(duplicates)} near-duplicates")`
                },
                {
                    lang: "python",
                    code: `import fasttext

# 加载语言分类器
model = fasttext.load_model("lid.176.bin")

def filter_by_quality(text, min_quality=0.6):
    """多维度质量过滤"""
    # 1. 语言过滤：只保留英语
    predictions = model.predict(text.replace('\\n', ' '))
    if predictions[0][0] != '__label__en':
        return False
    # 2. 长度过滤：太短的片段丢弃
    if len(text.split()) < 50:
        return False
    # 3. 重复行比例过滤
    lines = text.split('\\n')
    unique_ratio = len(set(lines)) / max(len(lines), 1)
    if unique_ratio < 0.3:
        return False
    return True

# 批量处理流水线
clean_corpus = [
    doc for doc in raw_corpus
    if filter_by_quality(doc)
]`
                }
            ],
            table: {
                headers: ["清洗阶段", "技术手段", "去除内容", "压缩比"],
                rows: [
                    ["语言过滤", "fastText CLD3", "非目标语言", "3:1"],
                    ["HTML 清理", "trafilatura / jusText", "标签与脚本", "1.5:1"],
                    ["URL 去重", "Exact Match", "相同 URL 重复", "2:1"],
                    ["模糊去重", "MinHash + LSH", "近似重复文档", "4:1"],
                    ["质量分类", "EduFilter 打分", "低质量/噪声", "2:1"]
                ]
            },
            mermaid: `graph TD
    A["原始 CC 数据"] --> B["语言识别"]
    B --> C["HTML 清理"]
    C --> D["长度/格式过滤"]
    D --> E["MinHash 去重"]
    E --> F["质量分类打分"]
    F --> G["PII 脱敏"]
    G --> H["干净语料"]`,
            tip: "使用 Spark 或 Dask 等分布式框架处理 TB 级数据。单机 Python 脚本在 1TB 数据上可能需要数周，分布式方案可将时间缩短到数小时。",
            warning: "过度去重可能损害模型的多样性学习能力。某些重复出现的内容（如名言、科学定律）是有意为之的，不应被当作噪声移除。"
        },
        {
            title: "3. Tokenizer 训练（BPE/SentencePiece）",
            body: `Tokenizer 是将原始文本转换为模型可理解数字序列的关键桥梁。现代 LLM 普遍采用基于 BPE（Byte-Pair Encoding）或 Unigram 语言的子词分词方案。BPE 的核心思想是从字符级词表出发，迭代合并最高频的相邻字符对，直到词表达到预设大小（通常为 32K 到 256K）。SentencePiece 是最流行的开源实现，它支持 BPE 和 Unigram 两种算法，并且直接在 UTF-8 字节序列上操作，避免了预分词带来的边界问题。词表大小的选择需要权衡：过小的词表会导致过长的序列（增加计算量），过大的词表会增加 Embedding 层的参数量并降低 OOV（未登录词）泛化能力。训练 Tokenizer 需要高质量、多样化的语料，通常从最终预训练语料中采样 10-100GB 文本。训练完成后，必须验证覆盖率、特殊 Token 处理以及跨语言的分词一致性。`,
            code: [
                {
                    lang: "python",
                    code: `import sentencepiece as spm

# 使用 SentencePiece 训练 BPE 分词器
spm.SentencePieceTrainer.train(
    input="training_corpus.txt",
    model_prefix="llm_tokenizer",
    vocab_size=50000,
    model_type="bpe",
    character_coverage=1.0,      # 完全覆盖所有字符
    max_sentence_length=16384,    # 支持长文本
    pad_id=0,
    eos_id=1,
    unk_id=2,
    bos_id=3,
    user_defined_symbols=["<|endoftext|>", "<|system|>"],
    split_by_whitespace=False,    # 不按空格分割
    byte_fallback=True            # OOV 时回退到字节
)

# 加载并使用
sp = spm.SentencePieceProcessor("llm_tokenizer.model")
tokens = sp.encode("Hello, 世界!", out_type=str)
print(tokens)  # ['▁H', 'ello', ',', '▁', '世', '界', '!']`
                },
                {
                    lang: "python",
                    code: `from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import ByteLevel

# HuggingFace Tokenizers 训练流程
tokenizer = Tokenizer(BPE(unk_token="[UNK]"))
tokenizer.pre_tokenizer = ByteLevel()

trainer = BpeTrainer(
    vocab_size=50000,
    min_frequency=2,
    special_tokens=["[PAD]", "[BOS]", "[EOS]", "[UNK]"]
)

# 从文件列表训练
files = ["corpus_part1.txt", "corpus_part2.txt", "corpus_part3.txt"]
tokenizer.train(files, trainer)

# 验证分词质量
output = tokenizer.encode("The quick brown fox")
print(f"Tokens: {output.tokens}")
print(f"IDs: {output.ids}")
print(f"Compression ratio: {len('The quick brown fox') / len(output.ids):.2f}")`
                }
            ],
            table: {
                headers: ["模型", "词表大小", "分词算法", "特殊处理"],
                rows: [
                    ["GPT-3", "50K", "BPE", "字节回退"],
                    ["LLaMA 2", "32K", "BPE (SentencePiece)", "字节回退"],
                    ["LLaMA 3", "128K", "TikToken (BPE 变种)", "字节回退"],
                    ["Mistral", "32K", "BPE (SentencePiece)", "字节回退"],
                    ["Qwen", "151K", "BPE", "多语言优化"]
                ]
            },
            mermaid: `graph LR
    A["原始语料"] --> B["预处理采样"]
    B --> C["BPE 训练"]
    C --> D["词表生成"]
    D --> E["特殊 Token 注入"]
    E --> F["覆盖率验证"]
    F --> G["Tokenizer 模型"]`,
            tip: "训练 Tokenizer 前务必从多语言、多领域语料中采样。单一来源训练出的 Tokenizer 在跨领域推理时会产生大量 OOV，严重影响模型性能。",
            warning: "修改已训练好的 Tokenizer 词表会导致预训练权重完全失效。词表大小和分词规则必须在预训练开始前就确定，中途不可更改。"
        },
        {
            title: "4. 训练架构与并行策略",
            body: `当模型参数达到数百亿甚至上万亿时，单个 GPU 的显存（即使 H100 的 80GB）也无法容纳完整的模型权重。必须采用多种并行策略的组合：数据并行（Data Parallelism）将同一模型复制到多卡上，每张卡处理不同批次的数据；张量并行（Tensor Parallelism，即 Megatron-LM 方案）将单层内的矩阵乘法拆分到多卡上执行；流水线并行（Pipeline Parallelism）将模型的不同层分配到不同的 GPU 上；而 ZeRO（Zero Redundancy Optimizer）则通过分片优化器状态、梯度和参数来消除数据并行中的冗余内存开销。现代训练框架如 Megatron-LM、DeepSpeed 和 FSDP（Fully Sharded Data Parallel）将这些策略灵活组合，实现在数千张 GPU 上高效训练万亿参数模型。选择合适的并行策略组合需要根据模型规模、GPU 显存、网络带宽等因素进行精细的调优。`,
            code: [
                {
                    lang: "python",
                    code: `# Megatron-LM 训练配置
from megatron.core import parallel_state
import torch

# 3D 并行配置示例
# 模型大小: 70B 参数, GPU: 512 × H100
config = {
    "tensor_model_parallel_size": 8,    # 张量并行: 8 卡
    "pipeline_model_parallel_size": 4,  # 流水线并行: 4 阶段
    "context_parallel_size": 2,         # 上下文并行: 2 组
    "data_parallel_size": 16,           # 数据并行: 16 组
    # 总计: 8 × 4 × 16 = 512 GPU
}

# 初始化并行环境
parallel_state.initialize_model_parallel(
    tensor_model_parallel_size=config["tensor_model_parallel_size"],
    pipeline_model_parallel_size=config["pipeline_model_parallel_size"],
    context_parallel_size=config["context_parallel_size"],
    data_parallel_size=config["data_parallel_size"]
)`
                },
                {
                    lang: "python",
                    code: `# DeepSpeed ZeRO-3 配置
import deepspeed

deepspeed_config = {
    "train_batch_size": 2048,
    "gradient_accumulation_steps": 4,
    "zero_optimization": {
        "stage": 3,
        "offload_optimizer": {
            "device": "cpu",
            "pin_memory": True
        },
        "offload_param": {
            "device": "cpu",
            "pin_memory": True
        },
        "overlap_comm": True,
        "contiguous_gradients": True,
        "sub_group_size": 1e9,
        "reduce_bucket_size": 5e8
    },
    "activation_checkpointing": {
        "partition_activations": True,
        "cpu_checkpointing": True,
        "contiguous_memory_optimization": True
    },
    "bf16": {"enabled": True},
    "gradient_clipping": 1.0
}`
                }
            ],
            table: {
                headers: ["并行策略", "分片对象", "通信开销", "适用场景"],
                rows: [
                    ["数据并行 (DDP)", "数据批次", "低（梯度同步）", "模型可放入单卡"],
                    ["张量并行", "矩阵运算", "高（层内 AllReduce）", "超大单层"],
                    ["流水线并行", "模型层", "中（气泡开销）", "深层模型"],
                    ["ZeRO-2", "优化器 + 梯度", "中", "中等规模模型"],
                    ["ZeRO-3", "参数 + 梯度 + 优化器", "高（频繁 AllGather）", "超大模型"]
                ]
            },
            mermaid: `graph TB
    A["70B 参数模型"] --> B["张量并行 ×8"]
    B --> C["流水线 ×4"]
    C --> D["数据并行 ×16"]
    D --> E["512 GPU 集群"]
    E --> F["有效批大小: 2048"]
    F --> G["训练吞吐: ~300 TFLOPS/GPU"]`,
            tip: "对于 70B 以下模型，FSDP + 激活检查点的组合通常比 Megatron-LM 更易用且效率相近。Megatron-LM 更适合千亿级以上规模。",
            warning: "流水线并行的气泡（bubble）会浪费计算资源。层数分配必须尽量均衡，否则最慢的阶段将决定整体吞吐速度。"
        },
        {
            title: "5. 学习率调度",
            body: `学习率调度是预训练中最关键的超参数之一，直接影响模型的收敛速度和最终质量。主流方案采用 Warmup + 余弦衰减（Cosine Annealing）的组合：训练初期用一个极小的学习率（如 1e-8）开始，在数千步内线性增长到峰值学习率（如 2e-4），然后按照余弦曲线缓慢衰减到接近零。Warmup 阶段的作用是防止训练初期梯度不稳定导致的发散——模型权重刚从随机初始化开始，大学习率会导致剧烈震荡。峰值学习率的选择与模型规模和批大小密切相关：根据经验法则，峰值学习率应与批大小的平方根成正比（即「学习率缩放定律」）。衰减阶段决定了模型后期的精细调优能力——衰减过快会导致模型未充分收敛，衰减过慢则浪费计算资源。部分框架还引入了学习率重启（Warm Restarts）机制，在长时间训练中周期性小幅提升学习率以帮助跳出局部最优。`,
            code: [
                {
                    lang: "python",
                    code: `from transformers import get_cosine_schedule_with_warmup

# 余弦衰减调度器
num_training_steps = 100000    # 总训练步数
num_warmup_steps = 2000        # Warmup 步数 (2%)

scheduler = get_cosine_schedule_with_warmup(
    optimizer,
    num_warmup_steps=num_warmup_steps,
    num_training_steps=num_training_steps,
    num_cycles=0.5             # 0.5 = 半个余弦周期
)

# 训练循环中使用
for step, batch in enumerate(dataloader):
    loss = model(batch).loss
    loss.backward()
    optimizer.step()
    scheduler.step()           # 更新学习率
    
    if step % 100 == 0:
        lr = scheduler.get_last_lr()[0]
        print(f"Step {step}: lr={lr:.2e}, loss={loss:.4f}")`
                },
                {
                    lang: "python",
                    code: `import math

# 自定义学习率调度器（含最小学习率约束）
def cosine_lr_with_min_lr(step, warmup_steps, total_steps,
                          peak_lr=2e-4, min_lr=2e-5):
    """带最小学习率约束的余弦衰减"""
    if step < warmup_steps:
        return peak_lr * step / warmup_steps
    progress = (step - warmup_steps) / (total_steps - warmup_steps)
    return min_lr + 0.5 * (peak_lr - min_lr) * (1 + math.cos(math.pi * progress))

# 可视化学习率曲线
steps = range(100000)
lrs = [cosine_lr_with_min_lr(s, 2000, 100000) for s in steps]
print(f"Peak LR: {max(lrs):.2e}")
print(f"Final LR: {lrs[-1]:.2e}")
print(f"Warmup ratio: {2000/100000*100:.1f}%")`
                }
            ],
            table: {
                headers: ["调度方案", "Warmup", "衰减方式", "适用场景"],
                rows: [
                    ["线性衰减", "必需", "线性下降", "短训练/快速实验"],
                    ["余弦衰减", "必需", "余弦曲线", "标准预训练"],
                    ["恒定学习率", "可选", "无衰减", "微调阶段"],
                    ["Warm Restarts", "每轮重启", "周期性余弦", "超长训练"],
                    ["Inverse Square Root", "内建", "1/√t 衰减", "早期 Transformer"]
                ]
            },
            mermaid: `graph LR
    A["初始 LR: 1e-8"] -->|线性增长| B["峰值 LR: 2e-4"]
    B -->|余弦衰减| C["中期 LR: 1e-4"]
    C -->|缓慢衰减| D["最终 LR: 2e-5"]
    D --> E["训练结束"]`,
            tip: "Warmup 步数通常设为总步数的 2%-5%。对于 10 万步的训练，2000-5000 步的 Warmup 是合理的起点。批越大，warmup 需要越长。",
            warning: "学习率设置过大是预训练失败最常见的原因之一。一旦出现 Loss 飙升，立即检查学习率配置——这往往比模型架构问题更容易被忽视。"
        },
        {
            title: "6. 训练稳定性（梯度裁剪、混合精度）",
            body: `大规模预训练过程中，训练不稳定是导致失败的常见原因。梯度爆炸是最典型的问题——当梯度的 L2 范数超过阈值时，权重更新会产生巨大跳跃，导致 Loss 瞬间发散。梯度裁剪（Gradient Clipping）是标准解决方案：在每次优化步骤中计算梯度的全局范数，如果超过预设阈值（通常为 1.0），则等比例缩放所有梯度。混合精度训练（Mixed Precision Training）使用 FP16 或 BF16 进行前向和反向传播计算，同时维护 FP32 的主权重副本用于参数更新。BF16 相比 FP16 具有更大的动态范围（与 FP32 相同的指数位），在大模型训练中越来越受欢迎。此外，损失缩放（Loss Scaling）技术通过放大 Loss 值来防止 FP16 下溢，而动态损失缩放则根据梯度直方图自动调整缩放因子。激活检查点（Activation Checkpointing）通过牺牲约 30% 的计算时间来换取约 60% 的显存节省。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
from torch.cuda.amp import autocast, GradScaler

# 混合精度训练 + 梯度裁剪
scaler = GradScaler(enabled=True)  # 动态损失缩放
max_grad_norm = 1.0

for batch in dataloader:
    optimizer.zero_grad()
    
    with autocast(dtype=torch.bfloat16):  # BF16 混合精度
        outputs = model(batch["input_ids"])
        loss = outputs.loss / gradient_accumulation_steps
    
    scaler.scale(loss).backward()
    
    # 梯度裁剪（需先 unscale）
    if (step + 1) % gradient_accumulation_steps == 0:
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(
            model.parameters(), max_grad_norm
        )
        scaler.step(optimizer)
        scaler.update()
        scheduler.step()`
                },
                {
                    lang: "python",
                    code: `# 激活检查点实现（节省显存）
from torch.utils.checkpoint import checkpoint

class CheckpointedTransformerBlock(torch.nn.Module):
    def __init__(self, dim, n_heads):
        super().__init__()
        self.attention = MultiHeadAttention(dim, n_heads)
        self.ffn = FeedForward(dim)
        self.norm1 = torch.nn.LayerNorm(dim)
        self.norm2 = torch.nn.LayerNorm(dim)
    
    def forward(self, x):
        # 用 checkpoint 包装子模块，只保存输入/输出
        x = x + checkpoint(
            self._attention_fn, x, use_reentrant=False
        )
        x = x + checkpoint(
            self._ffn_fn, x, use_reentrant=False
        )
        return x
    
    def _attention_fn(self, x):
        return self.attention(self.norm1(x))
    
    def _ffn_fn(self, x):
        return self.ffn(self.norm2(x))

# 显存对比: 不检查点 ~80GB, 检查点 ~32GB`
                }
            ],
            table: {
                headers: ["稳定性技术", "作用", "额外开销", "显存节省"],
                rows: [
                    ["梯度裁剪", "防止梯度爆炸", "~1%", "无"],
                    ["BF16 混合精度", "加速计算，减少显存", "无", "~50%"],
                    ["FP16 + 损失缩放", "加速计算", "~2%", "~50%"],
                    ["激活检查点", "减少激活值存储", "~30% 计算", "~60%"],
                    ["优化器卸载 (CPU)", "突破单卡显存限制", "PCIe 带宽", "~75%"]
                ]
            },
            mermaid: `graph TD
    A["前向传播 BF16"] --> B["计算 Loss"]
    B --> C["损失缩放"]
    C --> D["反向传播 BF16"]
    D --> E["梯度 Unscale"]
    E --> F["梯度裁剪"]
    F --> G["FP32 参数更新"]
    G --> A`,
            tip: "优先使用 BF16 而非 FP16。BF16 的指数位与 FP32 相同，不需要动态损失缩放，训练稳定性显著优于 FP16，尤其适合大模型。",
            warning: "梯度裁剪阈值设置过小会导致「有效学习率」降低——虽然看起来学习率没变，但每次梯度都被裁剪削弱了。如果发现训练极慢，检查裁剪阈值是否过小。"
        },
        {
            title: "7. 训练监控与评估",
            body: `预训练通常持续数周甚至数月，完善的监控体系是确保训练成功的最后一道防线。核心监控指标包括：训练 Loss（应平稳下降，出现尖峰可能意味着数据异常或学习率过大）、验证 Loss（在 held-out 数据集上评估泛化能力）、梯度范数（监控是否频繁触发裁剪）、学习率（验证调度器工作正常）、GPU 利用率（MFU/HFU，反映硬件利用效率）、通信带宽（检测 NCCL 通信瓶颈）。评估方面，除了困惑度（Perplexity）这一基本指标外，还需要定期进行下游任务评估（如 MMLU、HellaSwag、PIQA 等基准测试），以确保模型不仅在学习语言建模，还在积累可迁移的知识。现代训练框架集成了 WandB、TensorBoard 等可视化工具，支持实时监控和历史回溯。训练过程中如果出现 Loss 突增（Spike），需要自动回滚到上一个检查点并从较小的学习率继续训练。`,
            code: [
                {
                    lang: "python",
                    code: `import wandb
import torch

# WandB 训练监控
wandb.init(project="llm-pretrain", config={
    "model_size": "70B",
    "batch_size": 2048,
    "peak_lr": 2e-4,
    "max_steps": 100000
})

for step, batch in enumerate(dataloader):
    loss = train_step(batch)
    
    # 记录核心指标
    grad_norm = compute_grad_norm(model)
    wandb.log({
        "train_loss": loss.item(),
        "learning_rate": scheduler.get_last_lr()[0],
        "gradient_norm": grad_norm,
        "tokens_per_sec": compute_throughput(),
        "step": step
    })
    
    # 异常检测：Loss 突增
    if step > 0 and loss.item() > prev_loss * 3:
        wandb.alert(title="Loss Spike!",
                    text=f"Loss jumped from {prev_loss:.4f} to {loss.item():.4f}")
        checkpoint.rollback()
    prev_loss = loss.item()`
                },
                {
                    lang: "python",
                    code: `# 定期下游任务评估
from lm_eval import evaluator
from transformers import AutoTokenizer, AutoModelForCausalLM

def evaluate_checkpoint(model_path, step):
    """在多个基准上评估检查点"""
    model = AutoModelForCausalLM.from_pretrained(model_path)
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    
    tasks = ["mmlu", "hellaswag", "piqa", "arc_challenge"]
    results = {}
    
    for task in tasks:
        result = evaluator.simple_evaluate(
            model="hf",
            model_args=f"pretrained={model_path}",
            tasks=[task],
            num_fewshot=5,
            batch_size=16
        )
        acc = result["results"][task]["acc"]
        results[task] = acc
        print(f"  {task}: {acc:.4f}")
    
    # 记录评估结果
    results["step"] = step
    wandb.log(results)
    return results

# 每 5000 步评估一次
if step % 5000 == 0:
    ckpt_path = f"checkpoints/step_{step}"
    evaluate_checkpoint(ckpt_path, step)`
                }
            ],
            table: {
                headers: ["监控指标", "正常范围", "异常信号", "应对措施"],
                rows: [
                    ["训练 Loss", "平稳下降", "突增 > 3x", "回滚检查点"],
                    ["梯度范数", "< 1.0", "持续 > 5.0", "降低学习率"],
                    ["GPU 利用率 (MFU)", "> 40%", "< 20%", "检查通信瓶颈"],
                    ["验证 Perplexity", "持续降低", "开始上升", "可能过拟合"],
                    ["MMLU 分数", "稳步增长", "停滞/下降", "检查数据质量"]
                ]
            },
            mermaid: `graph LR
    A["训练循环"] --> B["记录 Loss/LR"]
    B --> C["每 5000 步评估"]
    C --> D["下游任务测试"]
    D --> E["可视化面板"]
    E --> F{"异常?"}
    F -->|是| G["自动回滚"]
    F -->|否| A
    G --> H["降低 LR 继续"]
    H --> A`,
            tip: "保存检查点的频率建议：每 1000-5000 步保存一次轻量检查点（仅权重），每 10000 步保存一次完整检查点（含优化器状态）。这样既保证可恢复性，又节省存储空间。",
            warning: "不要仅依赖训练 Loss 判断模型质量！Loss 持续下降不代表模型能力在提升——有时模型只是在 memorize 训练数据。定期的下游任务评估才是衡量真实能力的唯一标准。"
        }
    ],
};
