// LLM 预训练：数据准备与训练策略全流程

import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-022",
    title: "LLM 预训练（一）：数据准备与训练策略",
    category: "llm",
    tags: ["预训练", "数据工程", "训练策略", "数据清洗", "混合精度", "分布式训练", "学习率调度", "损失曲线"],
    summary: "从零开始构建大语言模型预训练全流程。深入解析数据收集、清洗、去重、分词的完整数据工程管线，以及学习率调度、混合精度训练、分布式策略、梯度累积等核心训练技术，包含完整的 PyTorch 实战代码实现和训练监控方案。",
    date: "2026-05-05",
    readTime: "28 min",
    level: "高级",
  learningPath: {
    routeId: "pretraining-series",
    phase: 1,
    order: 1,
    nextStep: "dl-015",
    prevStep: null,
  },
    content: [
        {
            title: "1. 什么是 LLM 预训练：从随机权重到语言理解",
            body: `大语言模型预训练（Pre-training）是构建现代 LLM 的第一步，也是最资源密集型的阶段。它的核心目标非常直接：让模型在海量无标注文本数据上学习语言的统计规律和世界的知识结构。

预训练的本质是自监督学习（Self-supervised Learning）。模型不需要人工标注的标签，而是通过预测下一个 token（Next Token Prediction）这个任务，从原始文本中自我学习。给定一个 token 序列 [t₁, t₂, ..., tₙ]，模型的任务是最大化条件概率 P(tₙ₊₁ | t₁, t₂, ..., tₙ)。

听起来简单？但正是这个看似朴素的目标函数，让模型学会了语法、语义、常识推理、甚至部分数学能力。Scaling Laws 告诉我们：在足够大的数据规模和参数量下，next token prediction 会涌现出远超语言建模本身的能力。

预训练与后续阶段的关系：预训练是 LLM 生命周期的地基。后续的所有优化——指令微调（**SFT**）、人类偏好对齐（**RLHF**/**DPO**）、领域适配（Domain Adaptation）——都建立在预训练获得的通用语言能力之上。如果预训练的质量不够，后续的所有努力都会受到上限约束。

预训练的核心挑战可以归结为三个维度：

**数据维度**：如何从互联网上收集、清洗、组织高质量、多样化、去重的训练数据？数据质量直接决定了模型的知识上限和偏见程度。

**计算维度**：如何在数千张 GPU上高效训练数百亿到数万亿参数的模型？这涉及分布式策略、混合精度、显存优化、故障恢复等一系列工程难题。

**策略维度**：如何设计学习率曲线、batch size 调度、数据混合比例？这些超参数的选择会显著影响模型的收敛速度和最终性能。

预训练的三个子阶段：

**阶段一**：基础预训练（Base Pre-training）。在超大规模通用语料上训练，让模型获得广泛的语言能力和世界知识。这个阶段通常消耗最多的计算资源——GPT-3 的基础预训练消耗了约 3640 PFLOPs-day 的算力。

**阶段二**：继续预训练（Continued Pre-training）。在基础模型上，使用特定领域或特定质量的数据继续训练，提升模型在目标领域的表现。这一步的计算成本远低于基础预训练，但收益可能非常显著。

**阶段三**： annealing（学习率退火）。在预训练的最后阶段，使用极低的学习率和高质量数据进行微调，让模型的损失曲线进一步下降，提升整体输出的流畅度和准确性。`,
            tip: `最佳实践：
预训练不是一次性的过程。现代 LLM 团队通常采用迭代式预训练策略——先在小规模数据上快速验证数据管线和训练配置，确认损失曲线正常后，再扩展到全量数据。这可以避免在错误配置下浪费数周的计算资源。`,
            warning: `常见误区：
很多人认为「数据越多越好」——这是一个危险的误解。在预训练中，数据质量远比数量重要。一份被广泛引用的研究表明，用 1% 的高质量精选数据训练的模型，性能可以超过用 100% 原始数据训练的模型。垃圾数据不仅浪费算力，还会引入系统性偏见和事实错误。`,
            mermaid: `graph TD
    A["预训练数据管线"] --> B["数据收集"]
    A --> C["数据清洗"]
    A --> D["去重"]
    A --> E["分词"]
    A --> F["训练 Ready"]

    B --> B1["Common Crawl"]
    B --> B2["维基百科"]
    B --> B3["GitHub 代码"]
    B --> B4["学术文献"]

    C --> C1["语言检测"]
    C --> C2["HTML 提取"]
    C --> C3["质量评分"]

    D --> D1["精确去重 MD5"]
    D --> D2["模糊去重 MinHash"]
    D --> D3["评估集保护"]

    E --> E1["BPE / WordPiece"]
    E --> E2["词表大小权衡"]
    E --> E3["特殊 Token 设计"]

    style A fill:#7c3aed,stroke:#6d28d9,color:#f1f5f9
    style F fill:#047857,stroke:#064e3b,color:#f1f5f9`,
        },
        {
            title: "2. 数据工程：从原始网页到训练-ready 语料",
            body: `预训练数据工程是整个 LLM 开发流程中最容易被低估、但影响最深远的环节。一个优秀的预训练数据管线，需要完成从原始网页抓取到训练-ready token 序列的完整转换。

### 2.1 数据收集的五大来源

**来源一**：Common Crawl 网页快照。这是最核心的预训练数据来源。Common Crawl 每月抓取数十亿网页，提供原始 WARC 格式的网页快照。但原始网页中充满了HTML 标签、广告、导航栏、JavaScript 代码——真正有价值的正文内容可能只占原始数据的 5-10%。

**来源二**：维基百科与百科类数据。维基百科提供了高质量、多语言、结构化的知识内容。虽然数据量相对较小（英文版约 20GB 纯文本），但信息密度极高，是模型获得事实性知识的重要来源。

**来源三**：GitHub 代码仓库。代码数据对于提升模型的逻辑推理能力和结构化输出能力至关重要。代码是一种高度结构化的语言，模型学习代码后，其推理链的构建能力会显著提升。但需要注意许可证合规和敏感信息过滤。

**来源四**：学术文献与书籍。arXiv、PubMed 等学术数据库提供了高质量的专业文本。这些数据帮助模型掌握科学术语、学术写作风格和专业领域的推理能力。

**来源五**：对话与论坛数据。Reddit、Stack Exchange 等平台的多轮对话数据有助于模型学习交互式语言模式和问答能力。但这类数据通常噪声较大，需要更严格的过滤。

### 2.2 数据清洗的核心管线

**第一步**：语言检测与过滤。使用 fastText 语言识别模型或 CLD3，将非目标语言的页面直接剔除。对于多语言模型，需要保留多种语言，但每种语言需要独立的质量控制。

**第二步**：HTML 到文本提取。使用 trafilatura、readability-lxml 或 JusText 等工具，从原始 HTML 中提取正文内容。这个过程需要处理编码问题、嵌套标签、动态加载内容等复杂情况。

**第三步**：质量评分与过滤。这是最关键的一步。常用的质量评分方法包括：

启发式规则过滤：删除过短文档（< 50 词）、高重复率文档（> 70% n-gram 重复）、低信息密度文档（标点符号占比异常）。

基于分类器的过滤：训练一个二分类模型（高质量 vs 低质量），使用维基百科文章作为正样本、随机网页作为负样本。这个分类器可以自动识别垃圾内容、机器生成文本、低质量论坛帖子等。

**困惑度过滤**：用一个小语言模型计算每篇文档的困惑度（Perplexity），过滤掉困惑度过高（语言模型认为「不合理」）的文本。这可以有效去除拼写混乱、语法错误严重的内容。

### 2.3 去重：防止数据污染的防御机制

数据去重在预训练中扮演着双重角色：

**角色一**：防止过拟合。如果训练数据中存在大量重复内容，模型会过度记忆这些内容，导致泛化能力下降。研究表明，Common Crawl 原始数据中约 30-40% 的内容是重复的。

**角色二**：防止评估数据泄漏。如果评估基准（如 MMLU、GSM8K）的内容出现在训练数据中，模型的评估分数会虚高，但真实能力并没有提升。这被称为数据污染（Data Contamination）。

去重的两个层次：

精确去重（Exact Deduplication）：对文档计算 MD5 或 SHA-256 哈希值，删除哈希值相同的文档。这种方法计算效率高，但只能去除完全相同的重复。

模糊去重（Fuzzy Deduplication）：使用 MinHash + LSH（局部敏感哈希）技术，找出高度相似但不完全相同的文档对。这种方法可以去除微小修改后的重复（如改了几个词的抄袭文章），但计算成本显著更高。

**评估集保护**：在去重之前，需要先将所有评估基准的数据加入排除列表（Exclude List），确保这些内容绝对不会出现在训练集中。这一步至关重要——即使是一小部分评估数据的泄漏，也可能导致评估结果的系统性偏差。`,
            tip: `阅读建议：
推荐阅读 Raffel et al. (2020) 的 C4 数据集论文和 Gao et al. (2020) 的 Pile 数据集论文，这两篇论文详细描述了工业级预训练数据管线的设计思路和实践经验。它们是理解现代 LLM 数据工程的必读文献。`,
            warning: `深度警告：
不要在去重之前就做分词！去重应该在原始文本层面完成，而不是在 token 层面。因为不同的分词器会产生不同的 token 序列，在 token 层面去重会漏掉大量重复内容。正确的流程是：原始文本 → 清洗 → 去重 → 分词 → 训练。`,
        },
        {
            title: "3. 分词器设计：从文本到 token 的映射",
            body: `分词器（Tokenizer）是连接原始文本和神经网络的桥梁。它将人类可读的字符串转换为模型可处理的整数序列，这个看似简单的步骤实际上对模型的最终性能有深远影响。

### 3.1 主流分词算法对比

BPE（Byte-Pair Encoding）：这是最广泛使用的分词算法，由 GPT-2 引入。BPE 的核心思想是从字符级别开始，迭代合并最高频的字符对。例如，如果 "th" 出现的频率最高，就将 "t" 和 "h" 合并为一个新的 token；然后在新的词表中继续寻找最高频的字符对，重复这个过程，直到词表大小达到预设值。

WordPiece：由 BERT 使用，与 BPE 非常相似，但合并策略基于似然度增益（Likelihood Gain）而非简单的频率计数。WordPiece 倾向于选择那些能最大程度提升训练数据似然度的合并操作。

Unigram：由 SentencePiece 实现，采用自顶向下的策略——从一个大词表开始，迭代地移除对似然度影响最小的 token。这种方法能产生更均衡的词表分布。

Tiktoken：由 **OpenAI** 开发，基于 BPE 但针对代码和混合语言进行了优化。**GPT-4** 使用的 cl100k_base 词表包含 100,256 个 token，对代码 token 的覆盖特别充分。

### 3.2 词表大小的权衡

词表大小是一个关键超参数，需要在编码效率和模型容量之间做出权衡：

大词表（≥ 100K token）：优点是编码效率高——常见词和短语可以直接映射为单个 token，减少了序列长度。缺点是embedding 层参数量大——一个 100K 词表、4096 维 embedding 的层需要约 1.6GB 参数，占总参数的相当比例。此外，大词表中大量低频 token的 embedding 很难被充分训练。

小词表（≤ 32K token）：优点是embedding 层轻量，所有 token 的 embedding 都能得到更充分的训练。缺点是编码效率低——一个英文单词可能需要 2-4 个 token 来表示，增加了序列长度和计算量。

**经验法则**：对于纯英文模型，32K-50K 词表通常是合理的选择。对于多语言模型（特别是包含中文、日文等字符集大的语言），建议 100K+ 词表，否则单字符被拆分成多个 token 会严重影响编码效率。

### 3.3 特殊 token 的设计

预训练模型需要为特殊用途预留 token：

[PAD]：填充 token，用于batch 内序列长度对齐。
[EOS]：文档结束标记，标记一篇文档的结尾。
[BOS]：文档开始标记（某些架构使用）。
[UNK]：未知 token，用于词表外的字符或字节序列。

这些特殊 token 的数量和用途需要在分词器设计阶段就确定下来，因为后续的微调阶段可能会引入更多特殊 token（如对话格式标记、工具调用标记等），如果词表空间不足，会导致冲突和性能下降。`,
            tip: `实用建议：
如果你的模型是从头预训练，建议使用 SentencePiece 或 Tiktoken 的分词器训练工具，在目标训练语料上重新训练分词器。不要直接复用其他模型的预训练分词器——因为不同语料的最优分词方式不同，复用会导致编码效率下降 10-20%。`,
            warning: `潜在风险：
注意 Unicode 标准化（Unicode Normalization）的问题。同一个字符可能有多种编码形式（如 "é" 可以是单个码点 U+00E9，也可以是 "e" + "◌́" 两个码点）。如果不在分词前进行 NFC 标准化，同一个词可能被编码为不同的 token 序列，严重影响模型的学习效果。`,
        },
        {
            title: "4. 训练策略一：学习率调度与优化器选择",
            body: `学习率（Learning Rate）是预训练中最重要的超参数——它比模型架构的任何细节都更能影响最终性能。一个精心设计的学习率调度方案，可以让模型在相同的计算预算下获得显著更好的结果。

### 4.1 余弦衰减调度（Cosine Annealing）

余弦衰减是现代 LLM 预训练的标准学习率调度方案。它的核心公式是：

lr(t) = lr_min + 0.5 × (lr_max - lr_min) × (1 + cos(π × t / T))

其中 t 是当前训练步数，T 是总训练步数，lr_max 是峰值学习率，lr_min 是最小学习率。

余弦衰减的优势在于：训练初期学习率快速上升（配合 warmup），让模型迅速离开随机初始化的区域；中期学习率缓慢下降，让模型在损失曲面的平坦区域精细搜索；末期学习率趋近于最小值，让模型稳定收敛到一个好的局部最优解。

Warmup 的必要性：在训练开始时，模型参数是随机初始化的，梯度可能非常大且不稳定。如果一开始就用高峰值学习率，模型可能会剧烈震荡甚至发散。因此，需要在前 1-5% 的训练步数中，将学习率从 0 线性增加到 lr_max，这个过程称为 warmup。

### 4.2 AdamW 优化器

AdamW 是 LLM 预训练中的标准优化器，它是 Adam 优化器的改进版本，关键区别在于权重衰减（Weight Decay）的实现方式：

Adam：权重衰减被合并到梯度更新中，等价于 L2 正则化，在自适应学习率下效果不理想。
AdamW：权重衰减被直接应用到参数上，与梯度更新解耦，在理论上更正确，在实践中效果也显著更好。

AdamW 的关键超参数：

β₁（一阶动量衰减率）：默认值 0.9。控制梯度一阶动量的衰减速度。较大的 β₁ 使更新更平滑，但可能响应过慢。

β₂（二阶动量衰减率）：默认值 0.95 或 0.999。对于 LLM 预训练，较大的 β₂（0.95） 通常更好——因为梯度的二阶统计量在大规模训练中变化较慢，需要更长的记忆窗口来准确估计。

ε（数值稳定性常数）：默认值 1e-8。防止除以零。在某些架构中（如 T5），使用 1e-6 可以获得更好的数值稳定性。

**权重衰减系数**：通常在 0.01 到 0.1 之间。对于大模型（> 10B 参数），建议使用较小的权重衰减（0.01-0.02），因为大模型本身就有很强的正则化效应（隐式的）。

### 4.3 学习率与 batch size 的线性缩放法则

线性缩放法则（Linear Scaling Rule）指出：当 batch size 增大 k 倍时，学习率也应该增大 k 倍，以保持每个参数的更新幅度一致。

但这条法则在超大 batch size下会失效。研究表明，当 batch size 超过某个临界值后，继续增大学习率会导致泛化能力下降——模型在训练集上损失降低更快，但在评估集上表现变差。这被称为泛化间隙（Generalization Gap）。

**实用建议**：在确定 batch size 后，使用小规模实验（如 1% 的数据）来扫描学习率——从 1e-5 到 1e-2，以 10 倍步长测试，找到损失下降最快且不发散的学习率，然后以此为基准进行微调。`,
            tip: `调参建议：
在正式预训练之前，务必做一个 learning rate range test——在 100-200 步内，让学习率从 1e-7 指数增长到 1e-1，记录每一步的损失。找到损失开始稳定下降的学习率范围，这个范围的上限就是安全的峰值学习率。这个方法由 Leslie Smith 提出，是深度学习调参的标准流程。`,
            warning: `常见陷阱：
不要使用固定的学习率（constant learning rate）做预训练！即使是中等规模的模型，固定学习率也会导致训练后期震荡——当损失曲面变平坦时，固定的学习率仍然在大步跳跃，无法精细收敛。这可能导致最终模型的困惑度高出 5-10%。`,
        },
        {
            title: "5. 训练策略二：分布式训练与混合精度",
            body: `当模型参数达到数十亿到数万亿级别时，单张 GPU 的显存和算力远远不够。分布式训练不是「可选项」，而是必选项。理解各种分布式策略的原理和适用场景，是高效利用计算资源的关键。

### 5.1 数据并行（Data Parallelism）

数据并行是最直观的分布式策略：将同一个模型复制到多张 GPU上，每张 GPU 处理不同的数据子集（mini-batch），然后聚合梯度来更新模型参数。

**优点**：实现简单，PyTorch DDP（DistributedDataParallel）一行代码即可启用。适合模型能装入单张 GPU 显存的场景。

**缺点**：每张 GPU 都需要保存完整的模型副本，当模型大到无法装入单张 GPU时，数据并行就无能为力了。

DDP 的工作流程：
1. 每张 GPU 初始化相同的模型（通过相同的随机种子）
2. 每张 GPU 读取不同的数据分片
3. 各自计算前向传播和损失
4. 执行 All-Reduce 操作，聚合所有 GPU 的梯度
5. 每张 GPU 用聚合后的梯度更新参数（保证所有 GPU 的参数保持一致）

### 5.2 张量并行（Tensor Parallelism）

张量并行由 Megatron-LM 提出，核心思想是：将模型中的大矩阵运算（如注意力层的 QKV 矩阵乘法、MLP 层的大矩阵）拆分到多张 GPU上并行计算。

**具体做法**：对于一个 d × d 的大矩阵，将其按列拆分为 d/n × d 的 n 个子矩阵，分配到 n 张 GPU 上。每张 GPU 计算自己的子矩阵乘法，然后通过 All-Gather 操作拼接结果。

**优点**：可以训练单张 GPU 无法容纳的大模型。

**缺点**：GPU 之间需要频繁的通信（每层都要 All-Gather），通信开销可能成为性能瓶颈。因此，张量并行通常在单机多卡（NVLink 连接）的场景下效果最好。

### 5.3 流水线并行（Pipeline Parallelism）

流水线并行将模型的不同层分配到不同 GPU上。例如，一个 100 层的 **Transformer**，可以将前 25 层放在 GPU0，26-50 层放在 GPU1，以此类推。数据像流水线一样，依次经过各个 GPU。

**优点**：显存和计算都分布在多张 GPU上，适合训练极大规模的模型。

**缺点**：存在流水线气泡（Pipeline Bubble）——当 GPU0 在处理 batch 1 时，GPU1 可能空闲等待。需要使用 1F1B（One-Forward-One-Backward）或 Interleaved Pipeline 等调度策略来最小化气泡。

### 5.4 混合精度训练（Mixed Precision Training）

混合精度训练的核心思想是：在前向传播和反向传播中使用 FP16 或 BF16（半精度）来加速计算和减少显存占用，但在参数更新时使用 FP32（全精度）来保证数值稳定性。

BF16 vs FP16：

FP16：16 位浮点数，5 位指数 + 10 位尾数。动态范围较小，在梯度很大或很小时容易发生溢出或下溢。需要使用损失缩放（Loss Scaling）技术来缓解。

BF16：16 位浮点数，8 位指数 + 7 位尾数。动态范围与 FP32 相同，只是精度较低。不需要损失缩放，在 LLM 预训练中已经成为标准选择。

混合精度训练的关键技巧：

Master Weights：维护一份 FP32 的主权重副本，每次更新时用 FP32 计算，然后转换为 BF16 用于前向传播。

**梯度缩放**：在 FP16 训练中，梯度可能小到低于 FP16 的最小可表示值（约 6e-8），导致梯度消失。通过将损失乘以一个缩放因子（如 1024），可以将梯度放大到 FP16 的可表示范围内，然后再在更新前除以缩放因子。

自动混合精度（AMP）：PyTorch 的 torch.cuda.amp 模块可以自动管理哪些操作用 FP16/BF16，哪些用 FP32。对于大多数场景，AMP 的默认策略已经足够好，不需要手动指定。`,
            tip: `部署建议：
如果你的硬件支持（A100/H100/B200），优先使用 BF16而非 FP16。BF16 的动态范围与 FP32 完全相同，不会出现溢出问题，可以省去损失缩配的麻烦。而且现代 GPU 的 Tensor Core 对 BF16 的支持与 FP16 一样高效。`,
            warning: `数值稳定性警告：
在混合精度训练中，softmax 操作特别容易溢出。即使使用 BF16，softmax 的指数运算也可能产生无穷大。解决方案是始终使用数值稳定的 softmax 实现（减去最大值后再取指数），这在 PyTorch 的 nn.functional.softmax 中已经是默认行为。`,
        },
        {
            title: "6. 训练策略三：数据混合与课程学习",
            body: `当你的训练数据来自多个来源（网页、代码、维基百科、学术论文等），如何混合这些数据以获得最佳训练效果？这不是一个简单的「按比例混合」问题，而是一个需要精心设计和实验验证的复杂决策。

### 6.1 数据混合的基本原则

**比例设计**：不同来源的数据应该按照其对模型能力的贡献来分配比例，而不是简单地按数据量大小分配。

高质量数据应该被过采样（Oversampled）。维基百科、学术论文等信息密度高的数据，虽然总量不大，但对模型的事实性知识和推理能力贡献显著。研究表明，将高质量数据的采样权重提高到 3-5 倍，可以显著提升模型的下游任务表现。

低质量数据应该被欠采样（Undersampled）。Common Crawl 中的大量低质量网页，虽然数量庞大，但对模型能力的贡献边际递减。将它们的采样权重降低到 0.3-0.5 倍，可以在不损失性能的前提下大幅减少训练成本。

### 6.2 DoReMi：基于参考模型的数据权重优化

DoReMi（Domain Reweighting with Meta-gradients）是一种自动学习数据混合比例的方法。它的核心思路是：

训练一个小型参考模型（Proxy Model），分别在每个数据域上评估其损失下降的速度。如果一个域的损失下降很快，说明模型从这个域学到很多东西，应该增加该域的权重；如果损失下降缓慢，说明该域的信息已经被模型掌握，可以降低权重。

**具体步骤**：

1. 训练一个小型参考模型（如 350M 参数），在所有数据域上各训练若干步
2. 对于每个域，计算参考模型的梯度范数或损失下降率
3. 使用元梯度优化（Meta-gradient Optimization）更新各域的采样权重
4. 将优化后的权重应用于大规模预训练

DoReMi 的实际效果：在 GPT-NeoX 的实验中，使用 DoReMi 优化数据混合比例后，模型的平均困惑度降低了 2.3，相当于节省了约 15% 的训练计算量。

### 6.3 课程学习（Curriculum Learning）

课程学习的核心思想是：让模型先学简单的、后学复杂的，模仿人类的学习过程。在 LLM 预训练中，课程学习可以有多种实现方式：

长度课程（Length Curriculum）：训练初期使用较短的序列（如 512 token），随着训练进行逐渐增加序列长度（到 2048、4096 甚至 8192）。这样做的好处是前期训练速度更快（短序列计算量小），后期再让模型学习长距离依赖关系。

难度课程（Difficulty Curriculum）：训练初期使用更高质量、更结构化的数据（如维基百科、教科书），让模型先掌握基础的语言能力和知识；后期再引入更多样化、更嘈杂的数据（如网页、论坛），提升模型的鲁棒性和泛化能力。

多阶段训练策略：

阶段一（10% 训练步数）：高质量数据 + 短序列 + 低学习率 → 建立基础语言能力
阶段二（80% 训练步数）：混合数据 + 标准序列 + 余弦衰减学习率 → 大规模知识学习
阶段三（10% 训练步数）：高质量数据 + 长序列 + 极低学习率（annealing）→ 精细调优`,
            tip: `实操建议：
在数据混合比例的设计上，可以参考 Llama 3 的技术报告中的公开数据：代码数据约占 5-7%，数学数据约占 3-5%，多语言数据约占 10-15%，其余为通用英文网页数据。这些比例是经过大量实验验证的经验值。`,
            warning: `数据混合陷阱：
不同数据源的分词效率差异巨大。代码数据的平均 token 长度（每个 token 代表的字符数）通常比自然语言短 30-50%——这意味着同样数量的 token，代码数据包含的实际信息量更少。如果不做调整直接混合，代码数据在训练中的实际占比会低于预期。建议在混合时按 token 数而非文档数来计算比例。`,
        },
        {
            title: "7. 训练监控：损失曲线解读与异常检测",
            body: `预训练通常持续数周到数月，期间需要持续监控训练状态。一个有经验的工程师可以通过损失曲线的形状，判断训练是否正常进行、是否需要调整超参数、甚至是否可以提前终止。

### 7.1 正常损失曲线的特征

**第一阶段**：快速下降期（前 1-5% 步数）。损失从随机初始化的极高值（通常 > 10）快速下降到合理范围（通常 3-5，取决于词表大小）。这个阶段曲线陡峭且平滑，说明模型正在快速学习基本的语言统计规律。

**第二阶段**：稳定下降期（5%-90% 步数）。损失以近似线性的速度（在对数坐标下）持续下降。这个阶段的曲线应该是单调递减的，偶尔有小幅波动是正常的（由于 batch 间的数据差异）。

**第三阶段**：收敛平台期（90%-100% 步数）。损失下降显著变慢，曲线趋于平坦。这是正常的收敛行为——模型已经学到了数据中大部分可学习的模式，继续训练的边际收益递减。

### 7.2 异常损失曲线的诊断

损失突然飙升（Loss Spike）：损失在少数几步内突然上升 1-2 个数量级，然后可能恢复或持续高位。

**可能原因**：训练数据中出现了异常样本（如包含极端长序列或特殊字符的文档）、学习率过高导致参数更新过大、或数值溢出（在混合精度训练中尤其常见）。

**应对策略**：检查最近几个 batch 的数据，看是否有异常；降低学习率；检查 gradient norm 是否出现异常峰值。

损失长期不降（Loss Plateau）：损失在数百步甚至数千步内几乎没有变化。

**可能原因**：学习率过低（模型更新太慢）、batch size 过大（梯度估计过于平滑，缺乏方向性）、或数据质量有问题（数据中没有足够的可学习信号）。

**应对策略**：适当增大学习率（但不超过 learning rate range test 的上限）；减小 batch size；检查数据的多样性和信息密度。

损失震荡（Loss Oscillation）：损失在两个值之间来回跳动，没有持续下降的趋势。

**可能原因**：学习率过高，模型在最优解附近来回跳跃；或不同数据域之间的梯度冲突——模型在一个域上优化的方向与另一个域相反。

**应对策略**：降低学习率；检查数据混合比例，减少冲突域的权重；使用梯度裁剪（Gradient Clipping）限制单次更新的最大幅度。

### 7.3 关键监控指标

除了训练损失（Training Loss），还需要监控以下指标：

验证损失（Validation Loss）：在预留的验证集上定期（每 100-1000 步）评估。验证损失应该与训练损失同步下降。如果验证损失开始上升而训练损失继续下降，说明模型开始过拟合。

梯度范数（Gradient Norm）：反映梯度更新的幅度。正常情况下，梯度范数应该持续减小。如果梯度范数突然增大，可能预示着训练不稳定。

GPU 利用率（GPU Utilization）：理想情况下应该在 80-95% 之间。如果利用率持续低于 50%，说明训练流程中存在I/O 瓶颈（数据加载太慢）或通信瓶颈（分布式同步开销过大）。

数据加载时间（Data Loading Time）：每步的数据加载时间应该远小于前向+反向传播的时间。如果数据加载成为瓶颈，需要使用多进程数据加载（PyTorch DataLoader 的 num_workers 参数）或预分词并缓存数据。`,
            mermaid: `graph LR
    A["训练监控仪表板"] --> B["训练损失"]
    A --> C["验证损失"]
    A --> D["学习率曲线"]
    A --> E["梯度范数"]
    A --> F["GPU 利用率"]
    A --> G["数据加载耗时"]

    B --> B1["正常: 单调下降"]
    B --> B2["异常: 飙升/震荡"]
    C --> C1["正常: 同步下降"]
    C --> C2["异常: 上升=过拟合"]
    D --> D1["余弦衰减"]
    E --> E1["应持续减小"]
    F --> F1["目标: 80-95％"]
    G --> G1["应 << 前向传播"]

    style A fill:#7c3aed,stroke:#6d28d9,color:#f1f5f9
    style B2 fill:#991b1b,stroke:#7f1d1d,color:#f1f5f9
    style C2 fill:#991b1b,stroke:#7f1d1d,color:#f1f5f9
    style F1 fill:#047857,stroke:#064e3b,color:#f1f5f9`,
            tip: `监控建议：
使用 **Weights & Biases** 或 TensorBoard 建立实时训练仪表板，至少展示以下曲线：训练损失、验证损失、学习率、梯度范数、GPU 利用率、每步耗时。将这些曲线设置为每 10-50 步更新一次，确保你可以及时发现问题而不被过多的数据点淹没。`,
            warning: `严重警告：
不要在训练过程中仅依赖训练损失来判断模型质量！训练损失可以持续下降（模型在训练集上越来越拟合），但模型的真实能力可能已经停止提升甚至下降。定期（每 1000-5000 步）在验证集上评估，才是判断训练进度的可靠方法。`,
        },
        {
            title: "8. 实战实现一：完整的预训练数据管线",
            body: `本节提供一个完整的预训练数据管线实现，涵盖从原始文本到训练-ready PyTorch Dataset 的全流程。这个实现基于真实工业级管线的设计模式，可以直接用于中小规模模型的预训练。

管线分为三个核心模块：数据清洗与分词、分片存储、PyTorch Dataset 实现。`,
            code: [
                {
                    lang: "python",
                    code: `# ============================================================
# 模块一：数据清洗与分词
# ============================================================
import re
import hashlib
from typing import Iterator
from transformers import AutoTokenizer

class TextCleaner:
    """文本清洗器：执行去重、过滤、规范化"""

    def __init__(self, min_length: int = 50,
                 max_repetition: float = 0.7):
        self.min_length = min_length
        self.max_repetition = max_repetition
        self._seen_hashes = set()

    def _normalize(self, text: str) -> str:
        """Unicode 标准化 + 空白字符规范化"""
        import unicodedata
        # NFC 标准化：确保相同字符有相同编码
        text = unicodedata.normalize('NFC', text)
        # 规范化空白字符
        text = re.sub(r'\\s+', ' ', text).strip()
        return text

    def _check_repetition(self, text: str) -> bool:
        """检查 n-gram 重复率是否超过阈值"""
        words = text.split()
        if len(words) < 20:
            return True  # 太短的文档直接保留
        # 计算 5-gram 的重复率
        n = 5
        ngrams = [tuple(words[i:i+n]) for i in range(len(words)-n+1)]
        if not ngrams:
            return True
        unique_ngrams = set(ngrams)
        repetition = 1.0 - len(unique_ngrams) / len(ngrams)
        return repetition <= self.max_repetition

    def process(self, text: str) -> str | None:
        """处理单篇文档，返回清洗后的文本或 None"""
        # 1. Unicode 标准化
        text = self._normalize(text)

        # 2. 长度过滤
        if len(text.split()) < self.min_length:
            return None

        # 3. 重复率过滤
        if not self._check_repetition(text):
            return None

        # 4. 精确去重
        doc_hash = hashlib.md5(text.encode()).hexdigest()
        if doc_hash in self._seen_hashes:
            return None
        self._seen_hashes.add(doc_hash)

        return text


class TokenizerDataset:
    """将清洗后的文本分词并保存为训练数据"""

    def __init__(self, tokenizer_name: str):
        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

    def tokenize_and_save(self, texts: Iterator[str],
                          output_dir: str,
                          seq_length: int = 2048,
                          chunk_size: int = 10000):
        """分批分词并保存"""
        import numpy as np
        import os
        os.makedirs(output_dir, exist_ok=True)

        all_tokens = []
        chunk_id = 0

        for text in texts:
            tokens = self.tokenizer.encode(text, add_special_tokens=False)
            all_tokens.extend(tokens)

            # 当累积的 token 数足够时，切分为固定长度序列
            while len(all_tokens) >= seq_length:
                chunk = all_tokens[:seq_length]
                # 添加 EOS token 标记文档边界
                chunk.append(self.tokenizer.eos_token_id)
                all_tokens = all_tokens[seq_length:]

                # 累积到 chunk_size 个序列后保存
                if len(all_tokens) >= chunk_size * seq_length:
                    pass  # 实际实现中这里会保存到文件

        print(f"处理完成，剩余 token 数：{len(all_tokens)}")`,
                    title: "数据清洗与分词管线"
                },
                {
                    lang: "python",
                    code: `# ============================================================
# 模块二：PyTorch Dataset 实现
# ============================================================
import torch
from torch.utils.data import Dataset, DataLoader
import numpy as np
import os

class PretrainDataset(Dataset):
    """预训练数据集：从二进制文件读取固定长度 token 序列"""

    def __init__(self, data_dir: str, seq_length: int = 2048,
                 max_samples: int = None):
        self.seq_length = seq_length
        self.data_files = sorted([
            os.path.join(data_dir, f)
            for f in os.listdir(data_dir)
            if f.endswith('.bin')
        ])

        # 构建索引：记录每个序列在文件中的偏移量
        self.index_map = []
        for file_path in self.data_files:
            file_size = os.path.getsize(file_path)
            num_sequences = file_size // (seq_length * 2)  # int16 = 2 bytes
            for i in range(num_sequences):
                self.index_map.append((file_path, i))
                if max_samples and len(self.index_map) >= max_samples:
                    break
            if max_samples and len(self.index_map) >= max_samples:
                break

        print(f"数据集加载完成：{len(self.index_map)} 个序列")

    def __len__(self):
        return len(self.index_map)

    def __getitem__(self, idx: int):
        file_path, offset = self.index_map[idx]

        # 使用 memmap 高效读取，避免全量加载到内存
        data = np.memmap(file_path, dtype=np.int32, mode='r')
        start = offset * self.seq_length
        end = start + self.seq_length

        tokens = torch.tensor(data[start:end], dtype=torch.long)

        # 输入和标签：标签是输入右移一位
        input_ids = tokens[:-1]
        labels = tokens[1:]

        return {"input_ids": input_ids, "labels": labels}


# ============================================================
# 模块三：训练循环示例
# ============================================================
def create_dataloader(data_dir: str, batch_size: int = 32,
                      seq_length: int = 2048,
                      num_workers: int = 4):
    """创建预训练 DataLoader"""
    dataset = PretrainDataset(data_dir, seq_length)
    dataloader = DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True,
        drop_last=True,
    )
    return dataloader


# 训练循环骨架
def training_loop(model, dataloader, optimizer, scheduler,
                  num_epochs: int = 1, device: str = "cuda"):
    """预训练循环（简化版）"""
    from torch.cuda.amp import autocast, GradScaler

    model.to(device)
    scaler = GradScaler()  # FP16 混合精度

    global_step = 0
    for epoch in range(num_epochs):
        model.train()
        for batch in dataloader:
            input_ids = batch["input_ids"].to(device)
            labels = batch["labels"].to(device)

            optimizer.zero_grad()

            # 混合精度前向传播
            with autocast(dtype=torch.bfloat16):
                outputs = model(input_ids=input_ids, labels=labels)
                loss = outputs.loss

            # 缩放梯度并反向传播
            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            scaler.step(optimizer)
            scaler.update()

            scheduler.step()
            global_step += 1

            if global_step % 100 == 0:
                print(f"Step {global_step}, Loss: {loss.item():.4f}, "
                      f"LR: {scheduler.get_last_lr()[0]:.2e}")`,
                    title: "预训练 Dataset 和训练循环"
                },
            ],
            tip: `工程建议：
在真实的工业级预训练中，不要使用 PyTorch DataLoader 的默认行为来加载数据。对于 TB 级别的训练数据，建议使用 内存映射文件（mmap） 或 LMDB 来存储预分词的数据，这样可以避免每次训练启动都重新分词，同时实现随机访问以支持多进程数据加载。`,
            warning: `性能陷阱：
在 __getitem__ 中不要做动态分词！分词应该在数据准备阶段一次性完成，训练阶段只做二进制读取和张量转换。如果在 __getitem__ 中调用 tokenizer.encode()，数据加载速度会下降 10-50 倍，GPU 利用率会跌到 10% 以下。`,
        },
        {
            title: "9. 实战实现二：学习率调度与分布式训练配置",
            body: `本节提供学习率调度器的完整实现和分布式训练的配置代码，覆盖从单机单卡到多机多卡的完整配置方案。`,
            code: [
                {
                    lang: "python",
                    code: `# ============================================================
# 模块一：Cosine Warmup 学习率调度器
# ============================================================
import math
from torch.optim.lr_scheduler import LambdaLR

def get_cosine_schedule_with_warmup(optimizer, num_warmup_steps,
                                     num_total_steps, lr_min_ratio=0.1):
    """
    余弦衰减 + 线性 Warmup 学习率调度器

    参数：
        optimizer: 优化器实例
        num_warmup_steps: warmup 步数（通常为总步数的 1-5%）
        num_total_steps: 总训练步数
        lr_min_ratio: 最小学习率与峰值学习率的比值
    """
    def lr_lambda(current_step):
        if current_step < num_warmup_steps:
            # Warmup 阶段：线性增长
            return float(current_step) / float(max(1, num_warmup_steps))
        else:
            # 余弦衰减阶段
            progress = float(current_step - num_warmup_steps) / \\
                       float(max(1, num_total_steps - num_warmup_steps))
            return lr_min_ratio + (1.0 - lr_min_ratio) * \\
                   0.5 * (1.0 + math.cos(math.pi * progress))

    return LambdaLR(optimizer, lr_lambda)


# ============================================================
# 模块二：AdamW 优化器配置
# ============================================================
from torch.optim import AdamW

def create_optimizer(model, lr: float = 3e-4,
                     weight_decay: float = 0.01,
                     beta1: float = 0.9,
                     beta2: float = 0.95,
                     eps: float = 1e-8):
    """
    为 Transformer 模型创建 AdamW 优化器

    关键设计：对 LayerNorm 和 bias 参数不做权重衰减
    """
    # 分离需要和不需要权重衰减的参数
    decay_params = []
    no_decay_params = []

    for name, param in model.named_parameters():
        if not param.requires_grad:
            continue
        # LayerNorm 和 bias 不做权重衰减
        if param.ndim <= 1 or "ln" in name.lower() or "bias" in name.lower():
            no_decay_params.append(param)
        else:
            decay_params.append(param)

    optim_groups = [
        {"params": decay_params, "weight_decay": weight_decay},
        {"params": no_decay_params, "weight_decay": 0.0},
    ]

    optimizer = AdamW(
        optim_groups,
        lr=lr,
        betas=(beta1, beta2),
        eps=eps,
        fused=True,  # 使用 fused kernel 加速（需要 PyTorch >= 2.0）
    )

    print(f"优化器配置：lr={lr}, wd={weight_decay}, "
          f"β=({beta1}, {beta2})")
    print(f"衰减参数组：{len(decay_params)} 个张量")
    print(f"无衰减参数组：{len(no_decay_params)} 个张量")

    return optimizer


# ============================================================
# 模块三：分布式训练初始化（DDP）
# ============================================================
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

def setup_distributed():
    """初始化分布式训练环境"""
    # 从环境变量读取分布式配置
    rank = int(os.environ.get("RANK", 0))
    world_size = int(os.environ.get("WORLD_SIZE", 1))
    local_rank = int(os.environ.get("LOCAL_RANK", 0))

    if world_size > 1:
        dist.init_process_group(
            backend="nccl",
            init_method="env://",
            rank=rank,
            world_size=world_size,
        )
        torch.cuda.set_device(local_rank)

    return rank, world_size, local_rank


def wrap_model_ddp(model, local_rank: int):
    """将模型包装为 DDP 模式"""
    model = model.cuda(local_rank)
    model = DDP(model, device_ids=[local_rank],
                output_device=local_rank,
                find_unused_parameters=False)  # 设为 True 会显著降低性能
    return model`,
                    title: "学习率调度与分布式训练配置"
                },
                {
                    lang: "bash",
                    code: `# ============================================================
# 分布式训练启动脚本
# ============================================================

# 单机 8 卡训练
torchrun \\
    --nproc_per_node=8 \\
    --master_port=29500 \\
    train.py \\
    --batch_size 4 \\
    --seq_length 2048 \\
    --num_epochs 3

# 多机多卡训练（2 台机器，每台 8 卡）
# 机器 0（主节点）：
torchrun \\
    --nnodes=2 \\
    --nproc_per_node=8 \\
    --node_rank=0 \\
    --master_addr=10.0.0.1 \\
    --master_port=29500 \\
    train.py

# 机器 1（工作节点）：
torchrun \\
    --nnodes=2 \\
    --nproc_per_node=8 \\
    --node_rank=1 \\
    --master_addr=10.0.0.1 \\
    --master_port=29500 \\
    train.py

# 计算总 batch size：
# batch_size × nproc_per_node × nnodes
# 4 × 8 × 2 = 64（全局 batch size）`,
                    title: "分布式训练启动命令"
                },
            ],
            tip: `分布式训练建议：
使用 torchrun 而非 python -m torch.distributed.launch 启动分布式训练。torchrun 是 PyTorch 官方推荐的启动方式，支持自动容错（elastic mode）——当某个 GPU 进程崩溃时，可以自动重启而无需重新开始整个训练。这对于持续数周的预训练来说是一个关键特性。`,
            warning: `DDP 性能陷阱：
在 DDP 模式下，find_unused_parameters=True 会显著降低性能（可能慢 20-40%）。只有当模型中存在不参与损失计算的参数时才需要设为 True。对于标准的 Transformer 预训练模型，所有参数都会参与梯度计算，应该设为 False。如果你不确定，可以先设为 True 跑几步，检查是否有警告信息。`,
        },
        {
            title: "10. 注意事项与最佳实践总结",
            body: `预训练是一个高度复杂、高度资源密集的过程。基于工业界的实践经验，以下是最关键的注意事项和最佳实践，可以帮助你在预训练中避免常见陷阱。

**第一**：从小规模开始验证。不要一开始就用全量数据和全量参数做预训练。先在 1% 的数据上训练一个小规模模型（如 350M 参数），验证数据管线、学习率、batch size、分布式配置是否正确。只有当小规模实验的损失曲线符合预期时，才扩展到全量训练。这一步可能看起来「浪费时间」，但它可以帮你避免在错误配置下浪费数周的 GPU 时间。

**第二**：定期检查点保存。预训练过程中，每隔 500-2000 步保存一次检查点（checkpoint）。这不仅是为了容灾恢复，更是为了后续的分析工作——你可以从不同阶段的检查点出发，做指令微调的对比实验，找到最优的训练停止点。

**第三**：数据版本控制。使用 DVC（Data Version Control）或类似工具，对训练数据进行版本管理。当模型表现不如预期时，你需要能够回溯到特定的数据版本，排查是否是数据质量的问题。不要手动管理数据文件——这几乎一定会导致数据版本混乱。

**第四**：梯度裁剪是必须的。在预训练中，梯度爆炸是一个真实存在的问题。设置 max_norm=1.0 的梯度裁剪，可以防止单次过大的参数更新破坏模型已经学到的知识。这个值不是绝对的——对于特别大的模型（> 100B），可能需要更小的裁剪值（如 0.3-0.5）。

**第五**：监控 GPU 通信效率。在多 GPU 训练中，All-Reduce 通信可能成为性能瓶颈。使用 NCCL 的调试工具（NCCL_DEBUG=INFO）检查通信带宽是否达到了硬件的理论上限。如果通信效率低下，可能是网络拓扑（如 PCIe vs NVLink）或 NCCL 配置的问题。

**第六**：不要忽视数据加载的性能。在预训练中，数据加载应该不是瓶颈。使用 PyTorch DataLoader 的多进程模式（num_workers=4-8）、预分词并缓存、以及 memmap 格式存储，确保数据加载速度远快于 GPU 的计算速度。一个简单的检查方法：监控 GPU 利用率——如果持续低于 70%，很可能数据加载是瓶颈。

**第七**：记录所有超参数和配置。使用 Weights & Biases 或 MLflow 记录每一次实验的所有超参数——学习率、batch size、数据混合比例、随机种子、模型配置等。当你在两周后回顾实验时，你会感谢现在的自己做了这些记录。`,
            tip: `最终建议：
预训练不是一门精确的科学，而是一门工程艺术。最好的学习方式不是读完所有论文，而是自己动手做一次完整的预训练——从数据收集到最终模型。即使只是训练一个 100M 参数的小模型，你也能获得对预训练全流程的深刻理解，这种理解是任何论文都无法替代的。`,
            warning: `最大风险：
预训练的最大风险不是技术失败，而是成本失控。一个中等规模（7B 参数）的预训练任务，在 A100 集群上可能需要数万美元的计算成本。在启动预训练之前，确保你已经充分验证了所有配置，并且有明确的预算和回滚计划。永远不要在「不确定」的状态下启动大规模预训练。`,
        },
        {
            title: "11. 扩展阅读与前沿方向",
            body: `预训练是一个快速发展的领域。以下是值得持续关注的研究方向和推荐阅读材料，帮助你保持对前沿技术的了解。

**前沿方向一**：高效预训练（Efficient Pre-training）。研究者正在探索如何用更少的计算资源训练同样强大的模型。关键技术包括：数据选择（只训练最有价值的 10-20% 数据）、模型初始化策略（从已有模型扩展而非从头训练）、和知识蒸馏（用大模型指导小模型训练）。Dolma 和 FineWeb 数据集项目在这个方向做出了重要贡献。

**前沿方向二**：多语言预训练。当前的 LLM 主要是英文主导的，多语言模型的质量显著低于英文模型。如何在有限的计算预算下，平衡多种语言的训练比例，是一个尚未完全解决的问题。关键挑战包括：低资源语言的数据稀缺、跨语言的知识迁移、和不同语言的分词效率差异。

**前沿方向三**：持续学习（Continual Learning）。如何让已经训练好的模型持续学习新知识，而不遗忘已有的能力？这被称为灾难性遗忘（Catastrophic Forgetting）问题。当前的解决方案包括：弹性权重固化（EWC）、回放缓冲（Replay Buffer）、和参数隔离（Parameter Isolation）。

**前沿方向四**：合成数据预训练。随着高质量人类文本数据的逐渐耗尽，研究者开始探索使用其他模型生成的合成数据来训练新模型。这被称为模型自吃（Model Self-Consumption）或合成数据预训练。关键问题是：合成数据的质量如何保证？多轮合成数据训练是否会导致模型崩溃（Model Collapse）？

**推荐阅读**：
- Raffel et al. (2020) - "Exploring the Limits of Transfer Learning with a Unified Text-to-Text **Transformer**"（C4 数据集）
- Gao et al. (2020) - "The Pile: An 800GB Dataset of Diverse Text for Language Modeling"
- Kaplan et al. (2020) - "Scaling Laws for Neural Language Models"
- Hoffmann et al. (2022) - "Training Compute-Optimal Large Language Models"（Chinchilla 论文）
- Li et al. (2023) - "DoReMi: Optimizing Data Mixtures for Language Model Pre-training"
- Gunasekar et al. (2023) - "Textbooks Are All You Need"（高质量数据的重要性）
- Touvron et al. (2023) - "**LLaMA**: Open and Efficient Foundation Language Models"（技术报告）`,
            tip: `学习路径：
如果你想深入理解 LLM 预训练，建议按以下顺序学习：1) 先跑通一个小规模的预训练实验（使用 NanoGPT 或 lit-gpt 等开源项目）；2) 阅读 Chinchilla 论文理解计算最优的缩放法则；3) 研究 LLaMA 技术报告了解工业级的实践细节；4) 尝试自己构建数据管线并做数据质量分析。`,
            warning: `研究局限性：
当前预训练研究的大多数结论都是基于 Transformer 架构和 next token prediction 目标函数得出的。如果未来出现新的架构（如状态空间模型 SSM、RWKV 等）或新的训练目标，这些结论可能需要重新评估。保持开放的心态，不要将当前的最佳实践视为永恒的真理。`,
        },
    ],
};
