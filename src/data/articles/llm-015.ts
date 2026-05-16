import { Article } from '../knowledge';

export const article: Article = {
  id: "llm-015",
  title: "LLM 推理加速实战：从 KV Cache 优化到推测解码",
  category: "llm",
  tags: ["推理加速", "KV Cache", "推测解码", "vLLM", "TensorRT-LLM", "Medusa", "PagedAttention"],
  summary: "系统梳理 LLM 推理加速的核心技术——KV Cache 管理、PagedAttention、推测解码、连续批处理，掌握生产环境推理优化的决策框架和工具链",
  date: "2026-04-16",
  readTime: "22 min",
  level: "进阶",
  content: [
    {
      title: "1. 为什么 LLM 推理加速是瓶颈？",
      body: `大语言模型的推理过程可以分为两个截然不同的阶段：预填充（Prefill）和解码（Decode）。理解这两个阶段的差异，是推理加速的起点。

预填充阶段：模型一次性处理用户的整个 prompt。这是一个计算密集型（Compute-bound）任务——GPU 的矩阵乘法单元可以满负荷运转，因为输入 token 全部已知，可以高度并行化处理。对于一个 2048 token 的 prompt，预填充可能在几十毫秒内完成。

解码阶段：模型逐个生成输出 token。这是一个内存带宽密集型（Memory-bandwidth-bound）任务——每生成一个 token，都需要从显存中加载整个模型的权重（对于 70B 模型约 140GB），但只做一个 token 的前向传播。GPU 的计算单元大部分时间在空转，等待数据从显存搬运过来。

关键指标：

| 阶段 | 瓶颈 | GPU 利用率 | 优化方向 |
|------|------|-----------|---------|
| 预填充 | 计算能力 | 70-90% | 并行化、张量并行 |
| 解码 | 显存带宽 | 10-30% | 减少内存搬运、批处理 |

对于大多数对话场景，解码阶段占据了 90% 以上的推理时间。因此，LLM 推理加速的核心战场在解码阶段的优化。

2025-2026 年是 LLM 推理加速技术爆发的年份。**vLLM** 的 PagedAttention、**NVIDIA** 的 TensorRT-LLM、推测解码（Speculative Decoding）、连续批处理（Continuous Batching）等技术，构成了一个完整的推理加速工具链。理解它们的原理和适用场景，是每个 AI 工程师的必修课。`,
      mermaid: `flowchart LR
    A["用户 Prompt"] --> B["预填充阶段 Compute-bound GPU 利用率 70-90％"]
    B --> C["KV Cache 初始化"]
    C --> D["解码阶段 Memory-bound GPU 利用率 10-30％"]
    D --> E["Token 1"]
    E --> F["Token 2"]
    F --> G["..."]
    G --> H["Token N + EOS"]
    subgraph 加速战场
    D
    E
    F
    G
    end`,
    },
    {
      title: "2. KV Cache：推理加速的核心数据结构",
      body: `KV Cache 是 LLM 推理加速最重要的优化技术。它的核心思想非常简单：在解码阶段，不需要重复计算已处理 token 的 Key 和 Value。

工作原理：Transformer 的自注意力机制需要每个 token 的 Key 和 Value 向量来计算注意力分数。在预填充阶段，模型为 prompt 中的每个 token 计算 K 和 V。在解码阶段，每生成一个新 token，只需要计算这个新 token 的 K 和 V，然后将其追加到已有 KV Cache 中，再与历史 K/V 一起计算注意力。

KV Cache 的内存开销：对于一个 70B 参数模型，使用 FP16 精度，KV Cache 的内存开销约为：
对于 Llama-3-70B（80 层，64 个 head，head_dim=128），当 seq_len=4096、batch_size=1 时，KV Cache 约需 4GB。当 batch_size=128 时，KV Cache 约需 512GB——这已经超过单张 H100 的显存容量。

KV Cache 的管理挑战：
- 内存碎片化：不同请求的 sequence length 不同，导致显存中出现大量碎片
- 动态增长：解码过程中 KV Cache 持续增长，无法预先分配固定大小
- 多租户隔离：多个并发请求需要独立的 KV Cache，但又希望共享有限的显存资源

这就是 **vLLM** 提出 PagedAttention 的原因。`,
      code: [
        {
          lang: "python",
          code: `# KV Cache 内存估算
def estimate_kv_cache_memory(
    num_layers: int,
    num_heads: int,
    head_dim: int,
    seq_len: int,
    batch_size: int,
    dtype_bytes: int = 2,  # FP16 = 2 bytes
) -> float:
    """估算 KV Cache 的显存占用（字节）"""
    # Key + Value = 2 倍
    return 2 * num_layers * num_heads * head_dim * seq_len * batch_size * dtype_bytes

# Llama-3-70B 示例
params = {
    "num_layers": 80,
    "num_heads": 64,
    "head_dim": 128,
    "seq_len": 4096,
    "batch_size": 1,
}

cache_bytes = estimate_kv_cache_memory(params)
print(f"KV Cache (batch=1): {cache_bytes / 1e9:.1f} GB")  # ~4.3 GB

params["batch_size"] = 128
cache_bytes = estimate_kv_cache_memory(params)
print(f"KV Cache (batch=128): {cache_bytes / 1e9:.1f} GB")  # ~550 GB`,
        },
      ],
    },
    {
      title: "3. PagedAttention：像操作系统管理虚拟内存一样管理 KV Cache",
      body: `PagedAttention 是 **vLLM** 的核心创新，灵感来自操作系统的虚拟内存和分页机制。它彻底解决了 KV Cache 的内存碎片化问题。

核心思想：将 KV Cache 分成固定大小的块（Block），每个块存储固定数量 token 的 K 和 V。就像操作系统将内存分页一样，vLLM 将 KV Cache 分块。请求的 KV Cache 不需要在物理显存中连续存储，只需维护一个逻辑到物理的映射表（Block Table）。

PagedAttention 的优势：
- 零碎片化：固定大小的块可以被任意分配到显存的任何位置
- 高效共享：多个请求可以共享相同的 KV Cache 块（例如 parallel sampling 场景）
- 动态扩展：需要更多 KV Cache 时，只需分配新块并更新映射表
- 内存超卖（Memory Overcommitment）：像操作系统一样，可以承诺比实际物理显存更多的 KV Cache 空间，因为并非所有请求都会同时达到最大长度

Block 大小选择：vLLM 默认使用 block_size=16。较小的 block 减少内部碎片（块内未使用的空间），但增加映射表的管理开销。较大的 block 减少映射开销，但增加内部碎片。16 是经验上的最佳平衡点。

性能提升：相比传统的连续 KV Cache 管理，PagedAttention 可以将推理吞吐量提升 2-4 倍，因为它允许更高的 batch size 而不会 OOM（Out Of Memory）。`,
      code: [
        {
          lang: "python",
          code: `# vLLM 部署示例：PagedAttention 推理服务
from vllm import LLM, SamplingParams

# 初始化模型——vLLM 自动启用 PagedAttention
llm = LLM(
    model="meta-llama/Llama-3-8B",
    gpu_memory_utilization=0.9,   # 使用 90% GPU 显存
    max_model_len=8192,            # 最大序列长度
    block_size=16,                 # PagedAttention 块大小
    max_num_seqs=256,              # 最大并发请求数
    tensor_parallel_size=1,        # 多 GPU 时设置
)

# 采样参数
sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=512,
)

# 批量推理——vLLM 自动进行连续批处理
prompts = [
    "解释一下 Transformer 的自注意力机制",
    "Python 中装饰器的原理和应用场景",
    "比较 REST API 和 GraphQL 的优劣",
] * 50  # 150 个并发请求

outputs = llm.generate(prompts, sampling_params)

for output in outputs[:3]:
    print(f"Prompt: {output.prompt[:50]}...")
    print(f"Generated: {output.outputs[0].text[:100]}...")
    print(f"Tokens generated: {len(output.outputs[0].token_ids)}")
    print()

# vLLM 吞吐量：在单张 H100 上，Llama-3-8B 可达 10,000+ tokens/s`,
        },
      ],
    },
    {
      title: "4. 连续批处理（Continuous Batching）：告别传统静态批处理",
      body: `传统推理服务使用静态批处理（Static Batching）：收集 N 个请求，组成一个 batch，一起送入模型推理。这有两个严重问题：

问题一：短请求等长请求。如果一个请求只需要生成 10 个 token，而 batch 中另一个请求需要生成 500 个 token，短请求必须等长请求完成后才能释放。这导致 GPU 算力浪费——短请求的 slot 在等待期间产生大量 padding。

问题二：新请求等旧请求。当 batch 正在运行时，新的请求到来，必须等整个 batch 完成后才能被处理。这增加了新请求的排队延迟。

连续批处理（Continuous Batching / Iteration-level Scheduling）的解决方案：在每个解码步骤（iteration）检查 batch 中的请求状态。如果某个请求已完成（生成 EOS token），立即将其从 batch 中移除，并用队列中的新请求填补空位。

核心优势：
- 减少 padding：已完成的请求立即退出，不再占用 batch slot
- 降低延迟：新请求无需等待整个 batch 完成
- 提高吞吐量：GPU 始终保持较高的利用率

vLLM 的实现：vLLM 在 PagedAttention 的基础上实现了连续批处理。因为 KV Cache 是分块管理的，添加或移除请求只需更新 Block Table，不需要重新组织显存。这使得 iteration-level 的调度成为可能。

性能数据：在混合长度请求场景下（短 prompt + 长生成），连续批处理相比静态批处理可将吞吐量提升 1.5-3 倍，同时 p99 延迟降低 50% 以上。`,
      mermaid: `flowchart TD
    A["请求队列"] --> B["调度器"]
    B --> C["GPU Batch"]
    C --> D{"Iteration 完成?"}
    D -->|是| E["检查每个请求"]
    E --> F{"已生成 EOS?"}
    F -->|是| G["从 batch 移除 输出结果"]
    F -->|否| H["继续下一个 iteration"]
    G --> I["从队列取新请求"]
    I --> H
    H --> C
    G --> J["返回客户端"]`,
    },
    {
      title: "5. 推测解码（Speculative Decoding）：用空间换时间的推理加速",
      body: `推测解码是 2023-2026 年最重要的推理加速创新之一。它的核心洞察非常简单：大模型生成文本时，大量 token 是可以被小模型准确预测的。

传统解码：大模型逐 token 生成。每个 token 需要一次完整的大模型前向传播（加载全部权重、计算注意力、FFN）。对于 70B 模型，这意味着每次 token 生成都需要从显存搬运 140GB 数据。

推测解码：使用一个小草稿模型（Draft Model）快速生成多个候选 token（比如 5 个），然后用大模型一次性验证这些 token。对于验证通过的 token，大模型不需要重新计算——它们直接被接受。只有在验证失败的位置，大模型才重新生成。

加速原理：假设草稿模型的接受率为 70%，即每生成 5 个候选 token，平均有 3.5 个被接受。那么：
- 传统方式：生成 3.5 个 token 需要 3.5 次大模型前向传播
- 推测方式：生成 3.5 个 token 需要 1 次草稿模型前向传播（很快）+ 1 次大模型验证
- 加速比 ≈ 3.5x（理论上）

2026 年的重要进展——DFlash：z-lab 提出的 DFlash（Block Diffusion for Flash Speculative Decoding） 将块扩散技术引入推测解码，进一步降低了验证阶段的计算开销。DFlash 的核心创新是用扩散模型的方式并行验证多个候选序列，而不是逐个 token 串行验证。在实际测试中，DFlash 比传统推测解码额外带来 20-40% 的加速。

推测解码的适用场景：
- ✅ 代码生成（重复性高，草稿模型准确率高）
- ✅ 翻译（结构化的 token 序列）
- ✅ 摘要（可预测的文本模式）
- ❌ 创意写作（不可预测，接受率低）
- ❌ 数学推理（草稿模型难以准确预测）`,
      code: [
        {
          lang: "python",
          code: `# 推测解码示例：使用 vLLM 的 speculative decoding
from vllm import LLM, SamplingParams

llm = LLM(
    model="meta-llama/Llama-3-70B",        # 大目标模型
    speculative_model="meta-llama/Llama-3-8B",  # 小草稿模型
    num_speculative_tokens=5,               # 草稿模型一次生成 5 个 token
    gpu_memory_utilization=0.9,
)

sampling_params = SamplingParams(
    temperature=0.7,
    max_tokens=256,
)

# 代码生成场景——推测解码效果最佳
prompt = """def quick_sort(arr):
    \"\"\"实现快速排序算法\"\"\"
"""

output = llm.generate([prompt], sampling_params)
print(output[0].outputs[0].text)

# 性能对比（Llama-3-70B，代码生成场景）：
# 无推测解码: ~15 tokens/s
# 推测解码 (8B draft, 5 tokens): ~45 tokens/s (3x 加速)
# DFlash: ~60 tokens/s (4x 加速)`,
        },
      ],
      tip: "推测解码的关键是草稿模型的选择。理想情况下，草稿模型应该是目标模型的缩小版（同架构、少层数），这样两者的 token 分布最接近，接受率最高。不同架构的模型组合会导致接受率大幅下降。",
    },
    {
      title: "6. Medusa：多头推测解码——不需要草稿模型的加速方案",
      body: `Medusa 是推测解码的一个变种，它不需要独立的草稿模型，而是在目标模型的头部添加多个额外的解码头（Decoding Heads）。

核心思想：在标准 LLM 的顶部添加 K 个额外的线性层（Decoding Head）。每个头负责预测未来第 k 个 token：
- Head 0：预测下一个 token（标准 LM head）
- Head 1：预测下下个 token
- Head 2：预测下下下个 token
- ...
- Head K-1：预测未来第 K 个 token

训练方式：Medusa 的训练只需要在预训练模型的基础上进行轻量微调——冻结主模型权重，只训练额外的解码头。训练数据就是模型自身的输出：对于每个位置，Head k 的 target 是 k 步之后的 token。

优势：
- 不需要额外的草稿模型：减少了模型加载的显存开销
- 训练成本低：只训练额外的解码头，通常只需几小时
- 推理开销小：额外的解码头只是线性层，计算量很小

局限：
- 接受率通常低于独立草稿模型方案（因为解码头共享相同的上下文表示）
- 需要重新训练（虽然只是轻量微调）
- 对不同任务的泛化能力取决于训练数据的多样性

2026 年的进展：Eagle 和 Eagle-2 进一步改进了 Medusa 的思路，引入特征预测而非直接的 token 预测——解码头预测的是未来 token 的 hidden state，而不是直接输出 token 分布。这种方式大幅提高了接受率，因为在 hidden state 空间中，模型可以更好地利用多层表示来预测未来。`,
      mermaid: `flowchart TD
    A["输入 Token Embeddings"] --> B["Transformer Layers 1 ~ N"]
    B --> C["Hidden State H"]
    C --> D["Head 0: Next Token"]
    C --> E["Head 1: Token +2"]
    C --> F["Head 2: Token +3"]
    C --> G["Head K: Token +K+1"]
    D --> H["验证: 全部通过?"]
    E --> H
    F --> H
    G --> H
    H -->|是| I["接受所有 Token 加速 K+1 倍"]
    H -->|否| J["回退到标准解码 从第一个失败位置继续"]`,
    },
    {
      title: "7. 张量并行与流水线并行：多 GPU 推理策略",
      body: `当模型大到单张 GPU 无法容纳时（如 70B 模型在 80GB 显存的 H100 上刚好能放，但几乎没有剩余空间给 KV Cache），需要多 GPU 并行推理。

张量并行（Tensor Parallelism, TP）：将模型的计算图沿张量维度切分到多个 GPU 上。每个 GPU 持有模型的一部分权重，在前向传播时通过 All-Reduce 通信同步中间结果。

TP 的切分方式：
- 列并行（Column Parallelism）：将线性层的权重矩阵按列切分，每个 GPU 计算一部分输出，然后拼接
- 行并行（Row Parallelism）：将线性层的权重矩阵按行切分，每个 GPU 计算一部分输入，然后通过 All-Reduce 求和
- 注意力头切分：将 Multi-Head Attention 的不同头分配到不同 GPU

流水线并行（Pipeline Parallelism, PP）：将模型的层切分到多个 GPU 上。GPU 0 处理 layer 0-19，GPU 1 处理 layer 20-39，以此类推。每个样本数据在 GPU 之间传递。

选择指南：
- TP 优先：当延迟是关键指标时（TP 在每个 iteration 都能并行处理，PP 需要等待数据在 GPU 之间传递）
- PP 辅助：当 TP 无法满足显存需求时，可以 TP + PP 组合使用
- TP=2 或 TP=4 是最常见的配置（在 2 张或 4 张 GPU 上切分模型）

通信开销：TP 的主要瓶颈是 GPU 之间的通信带宽。在 NVLink 连接的 GPU 上（如 H100 NVL），TP 的通信开销约为 10-20%；在 PCIe 连接的 GPU 上，通信开销可能高达 40-60%。因此，尽量使用 NVLink 连接的 GPU 进行张量并行。`,
      code: [
        {
          lang: "bash",
          code: `# vLLM 多 GPU 张量并行
# TP=2: 在 2 张 GPU 上切分模型
python -c "
from vllm import LLM
llm = LLM(
    model='meta-llama/Llama-3-70B',
    tensor_parallel_size=2,  # 使用 2 张 GPU
    gpu_memory_utilization=0.95,
)
# 70B 模型在 2x H100 80GB 上：
# 每张 GPU 约 35GB 权重 + ~40GB KV Cache 空间
"

# TensorRT-LLM 多 GPU
# 需要先构建引擎
trtllm-build \\
    --checkpoint_dir ./llama-3-70B \\
    --tp_size 4 \\
    --pp_size 1 \\
    --max_batch_size 128 \\
    --max_input_len 4096 \\
    --max_output_len 2048 \\
    --output_dir ./engine_tp4

# 运行推理
mpirun -n 4 \\
    python run.py \\
    --engine_dir ./engine_tp4`,
        },
      ],
    },
    {
      title: "8. FP8 推理：精度与速度的新平衡点",
      body: `FP8 是 2024-2026 年推理加速的重要趋势。与量化为 INT8/INT4 不同，FP8 使用 8 位浮点数，在保持浮点数动态范围的同时，将内存占用减半。

FP8 的格式：
- E4M3（4 位指数 + 3 位尾数）：适合前向传播，范围约 ±448，精度约 1 位十进制
- E5M2（5 位指数 + 2 位尾数）：适合梯度计算，范围更大但精度更低

FP8 vs INT8：
- FP8 保留了浮点数的动态范围，对于激活值中的异常值（outliers）更鲁棒
- INT8 在权重上表现更好（权重分布更接近正态分布）
- 最佳实践：权重用 INT8，激活用 FP8

硬件支持：
- **NVIDIA** H100：原生支持 FP8 Tensor Core，FP8 推理速度比 FP16 快约 1.5-1.8 倍
- **NVIDIA** H200/B200：进一步优化 FP8，支持 FP4（4 位浮点数）
- 消费级 GPU：RTX 4090 等不支持 FP8 Tensor Core，需要使用 FP16/INT8

TensorRT-LLM 的 FP8 支持：TensorRT-LLM 是 NVIDIA 官方的 LLM 推理引擎，对 FP8 提供了最完善的支持。在 H100 上，使用 TensorRT-LLM + FP8 的 Llama-3-70B 推理速度可以达到 FP16 的 2.5-3 倍。`,
      code: [
        {
          lang: "python",
          code: `# TensorRT-LLM FP8 推理
import tensorrt_llm
from tensorrt_llm import LLM, SamplingParams

# FP8 推理（需要 H100 或更新硬件）
llm = LLM(
    model="meta-llama/Llama-3-70B",
    dtype="fp8",             # 使用 FP8 精度
    kv_cache_dtype="fp8",    # KV Cache 也使用 FP8
    tensor_parallel_size=2,
)

# 或者使用预构建的 FP8 引擎
# trtllm-build --quantization fp8 ...

# 性能对比 (H100, Llama-3-70B):
# FP16: ~8 tokens/s
# INT8: ~14 tokens/s
# FP8: ~20 tokens/s  (2.5x vs FP16)

# 精度损失 (MMLU):
# FP16: 79.5%
# FP8:  78.9%  (-0.6pp)
# INT8: 78.2%  (-1.3pp)`,
        },
      ],
      warning: "FP8 只在 NVIDIA Hopper 架构（H100/H200）及更新的 GPU 上有硬件加速支持。在 Ampere 架构（A100）上，FP8 会被降级到 FP16 计算，不会带来速度提升。消费级 RTX 4090 也不支持 FP8 Tensor Core。",
    },
    {
      title: "9. 推理引擎选择：vLLM vs TensorRT-LLM vs llama.cpp",
      body: `2026 年，三大推理引擎各有定位：

**vLLM**：
- 定位：通用推理服务，最适合云端部署
- 优势：PagedAttention + 连续批处理、易用性（pip install 即可）、活跃的社区
- 最佳场景：多用户并发推理服务、API 后端
- 吞吐量：单张 H100 上 Llama-3-8B 可达 10,000+ tokens/s
- 局限：极致优化不如 TensorRT-LLM

TensorRT-LLM：
- 定位：极致性能的 NVIDIA GPU 推理引擎
- 优势：FP8 支持、内核融合、针对 NVIDIA GPU 深度优化
- 最佳场景：延迟敏感的生产部署、FP8 推理
- 吞吐量：通常比 vLLM 高 20-50%（在相同硬件上）
- 局限：构建流程复杂、只支持 NVIDIA GPU

llama.cpp：
- 定位：消费级硬件上的本地推理
- 优势：CPU 推理、Apple Silicon 支持、GGUF 格式、极低内存占用
- 最佳场景：本地运行、边缘设备、Mac 用户
- 吞吐量：M2 Max 上 Llama-3-8B Q4_K_M 约 30-50 tokens/s
- 局限：不支持 GPU 级并行和连续批处理

选择决策树：
1. 需要多用户并发服务？→ **vLLM** 或 TensorRT-LLM
2. 需要极致性能且用 **NVIDIA** GPU？→ TensorRT-LLM
3. 需要快速部署和社区支持？→ vLLM
4. 在 Mac 或 CPU 上运行？→ llama.cpp
5. 在消费级 GPU 上运行？→ llama.cpp（CUDA）或 vLLM`,
      mermaid: `flowchart TD
    A["推理引擎选择"] --> B{"部署环境?"}
    B -->|"云端 GPU 服务器"| C{"GPU 类型?"}
    B -->|"本地 / 边缘设备"| D["llama.cpp CPU / Apple Silicon"]
    C -->|"NVIDIA H100/H200"| E{"性能要求?"}
    C -->|"NVIDIA A100/RTX"| F["vLLM 通用最佳选择"]
    E -->|"极致延迟/吞吐量"| G["TensorRT-LLM FP8 + 内核融合"]
    E -->|"快速部署/社区"| H["vLLM PagedAttention + 连续批处理"]
    D --> I["GGUF 格式 Q4_K_M 最佳平衡"]
    G --> J["~2.5x FP16 速度"]
    H --> K["~2x FP16 速度"]
    F --> L["~1.8x FP16 速度"]`,
    },
    {
      title: "10. 生产部署决策与性能调优",
      body: `在生产环境中部署 LLM 推理服务，需要建立一套完整的性能评估和调优体系。

性能评估指标：
- TTFT（Time To First Token）：用户等待第一个 token 的时间。直接影响用户体验，目标 < 500ms。
- TPOT（Time Per Output Token）：每个后续 token 的生成间隔。直接影响阅读流畅度，目标 < 50ms（约 20 tokens/s）。
- 吞吐量（Throughput）：每秒处理的请求数或 token 数。影响服务成本和并发能力。
- P99 延迟：99% 的请求在多少时间内完成。影响 SLA。

调优清单：

1. KV Cache 管理
- 使用 **vLLM** 时，调整 \`gpu_memory_utilization\`（通常 0.9-0.95）
- 调整 \`max_num_seqs\` 控制最大并发请求数
- 监控 KV Cache 使用率，避免 OOM

2. 批处理策略
- 启用连续批处理（**vLLM** 默认启用）
- 对于延迟敏感场景，降低 \`max_num_batched_tokens\`
- 对于吞吐量优先场景，增加 batch size

3. 推测解码
- 代码生成场景必开推测解码
- 草稿模型选择与目标模型同架构的缩小版
- 调整 \`num_speculative_tokens\`（通常 3-6 最佳）

4. 量化
- INT4 量化可以大幅增加 batch size（KV Cache 更小）
- FP8 在 H100 上提供最佳的性能/精度平衡
- 量化 + 推测解码可以叠加使用

5. 多 GPU 策略
- 优先使用 TP（张量并行）而非 PP（流水线并行）
- 确保 GPU 之间使用 NVLink 连接
- TP=2 或 TP=4 是常见的最佳配置`,
      code: [
        {
          lang: "python",
          code: `# 生产级 LLM 推理服务配置
from vllm import LLM, SamplingParams
import asyncio
import time

class ProductionLLMService:
    """生产级 LLM 推理服务"""

    def __init__(
        self,
        model: str = "meta-llama/Llama-3-70B",
        tensor_parallel_size: int = 2,
        gpu_memory_utilization: float = 0.95,
        max_model_len: int = 8192,
        max_num_seqs: int = 256,
        # 推测解码（可选）
        speculative_model: str = None,
        num_speculative_tokens: int = 5,
        # 量化（可选）
        quantization: str = None,  # "fp8", "awq", "gptq"
    ):
        llm_kwargs = {
            "model": model,
            "tensor_parallel_size": tensor_parallel_size,
            "gpu_memory_utilization": gpu_memory_utilization,
            "max_model_len": max_model_len,
            "max_num_seqs": max_num_seqs,
        }

        if speculative_model:
            llm_kwargs["speculative_model"] = speculative_model
            llm_kwargs["num_speculative_tokens"] = num_speculative_tokens

        if quantization:
            llm_kwargs["quantization"] = quantization

        self.llm = LLM(**llm_kwargs)

        # 性能监控
        self.metrics = {
            "total_requests": 0,
            "total_tokens": 0,
            "total_ttft_ms": 0.0,
        }

    async def generate(
        self,
        prompt: str,
        max_tokens: int = 512,
        temperature: float = 0.7,
    ) -> dict:
        """异步生成并记录性能指标"""
        start = time.monotonic()

        sampling_params = SamplingParams(
            temperature=temperature,
            max_tokens=max_tokens,
        )

        # vLLM 支持异步生成
        result = await self.llm.generate_async(
            [prompt], sampling_params
        )

        ttft_ms = (time.monotonic() - start) * 1000
        num_tokens = len(result[0].outputs[0].token_ids)

        self.metrics["total_requests"] += 1
        self.metrics["total_tokens"] += num_tokens
        self.metrics["total_ttft_ms"] += ttft_ms

        return {
            "text": result[0].outputs[0].text,
            "num_tokens": num_tokens,
            "ttft_ms": ttft_ms,
            "tpot_ms": (result[0].outputs[0].elapsed_time * 1000 - ttft_ms) / max(num_tokens - 1, 1),
        }

    def get_metrics(self) -> dict:
        """获取性能指标"""
        n = self.metrics["total_requests"]
        return {
            "total_requests": n,
            "avg_ttft_ms": self.metrics["total_ttft_ms"] / n if n else 0,
            "avg_tokens_per_request": self.metrics["total_tokens"] / n if n else 0,
        }

# 使用示例
# service = ProductionLLMService(
#     model="meta-llama/Llama-3-70B",
#     tensor_parallel_size=2,
#     speculative_model="meta-llama/Llama-3-8B",
#     quantization="fp8",
# )`,
        },
      ],
      tip: "推理优化的黄金法则：先用 vLLM 默认配置建立基线，然后根据瓶颈逐一调优。最常见的瓶颈顺序是：KV Cache 容量不足 → batch size 过小 → 未启用推测解码 → 未使用量化。每次只改一个参数，记录性能变化。",
    },
    {
      title: "11. 2026 年推理加速前沿趋势",
      body: `2026 年，LLM 推理加速领域出现了多个值得关注的趋势：

1. 块扩散推测解码（DFlash）
z-lab 提出的 DFlash 将块扩散技术引入推测解码，在验证阶段实现更高的并行度。相比传统逐个 token 验证，DFlash 可以批量验证候选序列，额外带来 20-40% 的加速。

2. 特征预测推测解码（Eagle-2）
Eagle-2 不再直接预测 token 分布，而是预测未来 token 的 hidden state。这种方式利用了 **Transformer** 多层表示的丰富信息，接受率从 Medusa 的 ~50% 提升到 ~70%。

3. FP4 推理
**NVIDIA** B200 引入 FP4（4 位浮点数）支持，将推理精度进一步压缩。在适当校准下，FP4 的精度损失可控制在 1% 以内，同时推理速度比 FP8 再提升 50%。

4. 端侧推理优化
MLC-LLM、llama.cpp 和 Apple Core ML 的进步，使得 7B-13B 模型在消费级硬件上的推理速度接近实时。M2 Max 上 Llama-3-8B Q4_K_M 可达 30-50 tokens/s。

5. 推理 + 量化 + 推测解码的叠加优化
最新研究表明，量化（INT4）+ 推测解码（8B draft）+ 连续批处理可以叠加使用，在 70B 模型上实现 8-10 倍 的端到端加速，同时精度损失控制在 2% 以内。

6. AI Agent 推理优化
随着 AI Agent 的普及，推理模式发生了变化：Agent 通常发送大量短 prompt（工具调用、状态检查），而非传统的大段对话。这要求推理引擎优化短请求的 TTFT 和吞吐量，而非单纯的大批量处理。**vLLM** 的 \`prefix_caching\` 功能在这个场景下尤其重要——它缓存了 system prompt 的 KV Cache，避免重复计算。`,
      mermaid: `flowchart LR
    A["FP16 基线 1x"] --> B["INT4 量化 ~2x"]
    B --> C["+ 连续批处理 ~3x"]
    C --> D["+ 推测解码 ~6x"]
    D --> E["+ DFlash/Eagle-2 ~8x"]
    E --> F["+ FP8 (H100) ~10x"]
    class F s1
    class A s0
    classDef s0 fill:#333,stroke:#666
    classDef s1 fill:#14532d,stroke:#16a34a`,
    },
  ],
};
