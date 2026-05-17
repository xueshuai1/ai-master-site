import { Article } from '../knowledge';

export const article: Article = {
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
        body: `现代大语言模型的训练是一个多阶段的复杂工程，每个阶段解决不同维度的问题，环环相扣。理解整个训练流程是掌握 LLM 技术的关键——你不能只关注某一个阶段而忽略其他环节。

训练流程的核心路径可以分为五个阶段：数据准备是基石，决定了模型知识的广度和质量上限；预训练是核心，让模型从海量文本中学习语言规律和世界知识，产出基座模型（Base Model）；有监督微调（SFT）让基座模型学会遵循指令，从"会说话"变成"能帮忙"；奖励模型训练用人类偏好数据训练一个评判者；强化学习对齐（RLHF/DPO）则用奖励模型或直接偏好优化来微调模型，使其输出与人类价值观一致。

值得注意的是，并非所有模型都走完整流程。一些开源项目（如 LLaMA 系列）只做到预训练或 SFT 阶段，而商业模型（如 GPT-4、Claude）通常走完全流程。此外，DPO（Direct Preference Optimization）的兴起为 RLHF 提供了一个更简单、更稳定的替代方案——它不需要单独训练奖励模型，直接利用偏好数据优化策略模型。`,
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
        body: `数据质量直接决定模型能力的上限，这句话在 LLM 训练中是铁律。一个模型的参数再多、架构再先进，如果训练数据充满噪声和偏见，最终表现也会大打折扣。这就是为什么数据工程占据了 LLM 开发团队 60% 以上的工作量。

现代 LLM 的训练数据是高度混合的：网页文本（如 Common Crawl）提供了最广覆盖的语言知识，但噪声最大；代码数据（如 GitHub）对模型的逻辑推理能力有显著提升；书籍提供了结构化的长文本，有助于模型学习深层推理和叙事结构；学术论文则注入专业领域的精确知识。每种数据源都有其独特的价值，但也需要针对性的清洗策略。

数据清洗是整个管线中最关键也最容易被低估的环节。去重（Deduplication）防止模型记忆训练数据，常用的 MinHash 算法可以在 O(n) 复杂度内检测近似重复；质量过滤通过语言分类器、困惑度（Perplexity）阈值、以及启发式规则筛除低质量文本；PII 去除则是合规性要求，需要识别并抹除个人身份信息。这些步骤看似繁琐，但直接决定了模型是否会"背诵"训练数据、输出有害内容或泄露隐私。`,
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
        body: `分词（Tokenization）是连接人类语言和模型数学表示的桥梁。模型不直接理解字符或单词，而是通过一个固定大小的词汇表（Vocabulary）将文本映射为整数序列。这个映射方式的选择深刻影响着模型的效率和表现。

现代 LLM 主要使用 Byte-Pair Encoding（BPE） 或其变种（如 SentencePiece、Unigram LM）。BPE 的核心思想是从字符级别开始，迭代合并出现频率最高的字符对，逐步构建出子词单元（Subword）。这种方法在处理常见词时效率高（整个词是一个 token），在处理罕见词时也能退化到字符级别，避免了传统分词中的 OOV（Out-of-Vocabulary）问题。

词汇表大小是一个需要仔细权衡的设计决策。词汇表太小会导致常见词也被拆分成多个 token，增加序列长度和计算开销；词汇表太大则 Embedding 层参数量激增（参数量 = 词汇表大小 × hidden_size），占用大量 GPU 显存。Llama 系列从 32K 逐步扩展到 128K，正是为了更好地支持多语言。对于中文，由于汉字数量庞大且组合灵活，分词效率尤为关键——"人工智能"四个字可能被编码为 2-4 个 token，直接影响推理速度和成本。`,
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
        body: `预训练（Pre-training）是 LLM 训练中最耗资源、最核心的阶段。在这个阶段，模型通过自监督学习（Self-supervised Learning）从海量无标注文本中掌握语言规律、世界知识和推理能力。训练目标非常简洁：给定前面的 token 序列，预测下一个 token。这个看似简单的任务，在大规模数据和参数的加持下，涌现出了令人惊叹的能力。

预训练的工程挑战是巨大的。以训练一个 70B 参数的模型为例，它需要处理 2T 以上的 token 数据，消耗约 100 万 GPU 小时。为了在合理时间内完成训练，必须依赖一系列分布式训练和优化技术：混合精度训练（BF16/FP16）用低精度浮点数减少显存占用和计算量；ZeRO（Zero Redundancy Optimizer） 将模型参数、梯度和优化器状态跨 GPU 切分，极大降低单卡显存需求；激活值检查点（Activation Checkpointing）通过在前向传播时不保存激活值、在反向传播时重新计算的方式，用计算换显存；Flash Attention 则通过 IO 感知的算法优化，将注意力机制的计算速度和显存效率提升了数倍。

学习率调度策略也是预训练成功的关键。通常采用 Cosine Decay 配合 Warmup 阶段：先线性增加学习率到峰值，再按余弦曲线衰减。Warmup 帮助模型在训练初期稳定梯度，避免早期的大梯度更新破坏随机初始化的参数。`,
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
        body: `预训练得到的基座模型（Base Model）虽然拥有广泛的语言知识和世界知识，但它只会"续写"文本——你给它一个开头，它会接着往下写，但它不理解"指令"和"回答"的概念。SFT（Supervised Fine-Tuning）阶段的核心使命就是教会模型理解并执行用户指令。

SFT 的本质是监督学习：给定一组（指令，期望回答）的数据对，通过标准的多类别交叉熵损失函数微调模型。但这里的关键不在于算法本身，而在于数据质量。指令数据的质量直接决定了模型的行为表现——10,000 条精心构造的高质量指令数据，效果远胜于 100,000 条从网络爬取的噪声数据。

高质量的指令数据需要满足几个标准：多样性——覆盖问答、摘要、翻译、代码生成、数学推理、创意写作等多种任务类型；复杂度——包含从简单事实查询到多步推理的不同难度层次；格式规范——使用标准化的对话模板（如 ChatML、Alpaca 格式）确保模型能区分系统提示、用户指令和助手回答；安全性——包含拒绝训练样本，教模型识别并拒绝有害、违法或不道德的请求。SFT 的学习率通常比预训练低 1-2 个数量级（如 2e-5 vs 3e-4），以避免灾难性遗忘（Catastrophic Forgetting）——即模型在学习新任务的同时忘记了预训练阶段学到的知识。`,
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
        body: `RLHF（Reinforcement Learning from Human Feedback）是让 LLM 的输出与人类价值观和偏好对齐的核心技术。它解决了预训练和 SFT 无法回答的一个根本问题：什么样的回答才是"好"的回答？不同的回答可能都语法正确、事实准确，但在 helpfulness（有用性）、honesty（诚实性）和 harmlessness（无害性）上存在差异。RLHF 就是要让模型学会区分这些微妙的差别。

传统的 RLHF 流程包含三个步骤：首先，让 SFT 模型对同一指令生成多个回答，由人类标注者对这些回答进行排序（偏好标注）；然后，用这些排序数据训练一个奖励模型（Reward Model），让它学会给任意回答打分；最后，使用 PPO（Proximal Policy Optimization） 算法，以奖励模型的评分为优化目标，微调策略模型。PPO 的优势在于它限制了每次更新的幅度，避免策略模型为了获得高分而"走捷径"——比如生成极端讨好的回答而牺牲事实准确性。

近年来，DPO（Direct Preference Optimization） 成为 RLHF 的重要替代方案。DPO 的突破在于它绕过了奖励模型训练这一步骤，直接用偏好数据优化策略模型。从数学上看，DPO 将 RLHF 的两步优化（训练 RM + PPO 微调）合并为一个闭式解，大幅简化了训练流程并提高了稳定性。2024 年发布的 Zephyr、Mistral 等模型都采用了 DPO 方案，证明了其有效性。此外，ORPO（Odds Ratio Preference Optimization） 进一步将 SFT 和 DPO 合并为单阶段训练，更加高效。`,
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
        body: `模型训练完成后，评估和部署是将学术成果转化为实际产品的关键环节。评估不仅是"考一考模型"那么简单，而是系统性地检验模型在各个维度上的能力边界，为后续的迭代优化提供数据支撑。

评估体系通常分为多个维度：知识理解用 MMLU（Massive Multitask Language Understanding）测试模型在 57 个学科上的表现；数学推理用 GSM8K 测试模型解决小学到初中数学题的能力；代码能力用 HumanEval 测试模型生成正确 Python 函数的能力；指令遵循用 IFEval 测试模型是否能严格遵守格式约束；安全性用 TruthfulQA 和 ToxiGen 测试模型是否会产生虚假或有害内容。综合这些指标，才能对模型的能力有一个全面的认识。

部署阶段的核心挑战是在保证服务质量的前提下最大化推理效率。现代 LLM 推理服务依赖于多种优化技术：KV Cache 缓存注意力计算中的键值对，避免重复计算，将推理速度提升 2-5 倍；vLLM 的 PagedAttention 将 KV Cache 像操作系统的虚拟内存一样分页管理，大幅提升显存利用率和并发吞吐量；量化（INT8/INT4）将模型权重从 FP16 压缩到低精度，减少显存占用和计算量，其中 GPTQ 和 AWQ 是两种主流的量化方法；投机解码（Speculative Decoding）用小模型快速生成候选 token，大模型并行验证，在保持输出质量的同时加速 2-3 倍。`,
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
  };
