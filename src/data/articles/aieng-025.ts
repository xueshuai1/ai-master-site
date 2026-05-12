// AI 推理优化：量化、剪枝与蒸馏的系统指南

import { Article } from '../knowledge';

export const article: Article = {
  id: "aieng-025",
  title: "AI 推理优化（二）：量化、剪枝与蒸馏系统指南",
  category: "aieng",
  tags: ["模型优化", "量化", "剪枝", "知识蒸馏", "推理加速", "模型压缩", "ONNX", "TensorRT", "边缘部署", "INT8", "FP16"],
  summary: "系统讲解 AI 模型推理优化的三大核心技术：量化（Quantization）、剪枝（Pruning）和知识蒸馏（Knowledge Distillation）。从原理到实战代码，覆盖 PyTorch/TensorRT/ONNX Runtime 全流程，帮助开发者将模型体积缩小 4-16 倍、推理速度提升 2-10 倍，同时保持可接受的精度损失。",
  date: "2026-05-05",
  readTime: "25 min",
  level: "高级",
  learningPath: {
    routeId: "inference-optimization",
    phase: 2,
    order: 2,
    nextStep: "infer-001",
    prevStep: "llm-024",
  },
  content: [
    {
      title: "1. 引言：为什么推理优化是 AI 工程化的核心难题",
      mermaid: `graph LR
    A["FP32 原始模型"] --> B["量化 INT8/INT4"]
    A --> C["剪枝 50-90％"]
    A --> D["知识蒸馏"]
    B --> E["体积缩减 4-8x"]
    C --> F["体积缩减 2-10x"]
    D --> G["体积缩减 4-8x"]
    E --> H["组合优化"]
    F --> H
    G --> H
    H --> I["10-32x 总体压缩"]
    style A fill:#1a365d,stroke:#63b3ed
    style I fill:#2d3748,stroke:#68d391`,
      body: `模型训练只是 AI 开发的第一步，推理部署才是决定产品能否落地的关键环节。

**核心矛盾**：当前主流 AI 模型的参数量正在指数级增长。GPT-4 级别的大模型参数量超过 1 万亿，即使是较小的语言模型（如 Llama-3-8B）也需要 16GB 显存才能完整加载。这意味着大多数模型无法在普通设备上运行。

**推理优化的目标**：在不显著降低模型精度的前提下，缩小模型体积、降低计算量、减少内存占用，使模型能够在资源受限的环境中高效运行。

### 推理优化的经济价值

算力成本是 AI 产品最大的运营支出。以 GPT-3 级别的模型为例，每次推理的成本约为 0.01-0.03 美元。如果日请求量达到 100 万次，仅推理成本就高达 1-3 万美元/天。

通过量化将模型从 FP32 压缩到 INT8，可以在几乎不影响质量的前提下，将推理成本降低 3-4 倍。这意味着每年节省数百万美元的算力支出。

### 三大核心优化技术概览

量化（Quantization）：将模型的权重和激活值从高精度浮点数（FP32/FP16）转换为低精度数值（INT8/INT4）。这是最常用也最有效的优化手段。

剪枝（Pruning）：将模型中不重要的权重参数设为零，从而减少计算量和模型体积。可以理解为给模型做减法——去掉冗余的神经元连接。

知识蒸馏（Knowledge Distillation）：用一个大而准确的教师模型训练一个小而高效的学生模型，让学生模型学习教师模型的行为。这是模型压缩的终极武器。

这三种技术可以组合使用：先蒸馏获得小模型，再剪枝去除冗余连接，最后量化降低精度。三者叠加可以实现 10-20 倍的体积压缩。`,
      tip: "推理优化的黄金法则是：先测量基线性能（延迟、吞吐量、精度），再做优化，再做对比。没有基线的优化是盲人摸象。建议使用 torch.utils.bottleneck 或 PyTorch Profiler 获取准确的基线数据。",
      warning: "优化不是银弹。过度量化（如 INT4 以下）可能导致模型精度急剧下降，尤其是在复杂任务（如数学推理、代码生成）上。每次优化后必须在验证集上重新评估，确保精度损失在可接受范围内（通常 < 1-2％）。"
    },
    {
      title: "2. 数值精度基础：理解 FP32、FP16、BF16、INT8、INT4",
      body: `要理解量化，首先要理解数值精度的概念。不同的数据格式在精度、范围和存储效率上有显著差异。

### 2.1 浮点数格式

FP32（单精度浮点数）：32 位，8 位指数，23 位尾数。这是深度学习训练的默认精度，提供约 7 位有效数字的精度。范围约为 10^-38 到 10^38。

FP16（半精度浮点数）：16 位，5 位指数，10 位尾数。存储和计算量都是 FP32 的一半，但动态范围显著缩小，在接近零的数值上容易下溢（underflow）。

BF16（Brain Float 16）：16 位，8 位指数，7 位尾数。与 FP16 不同，BF16 保留了与 FP32 相同的指数范围，牺牲了精度。这使得 BF16 在训练稳定性上优于 FP16，被Google TPU和**NVIDIA** Ampere架构广泛采用。

### 2.2 整数量化格式

INT8（8 位整数）：将浮点数线性映射到 [-128, 127] 或 [0, 255] 的整数范围。存储量是 FP32 的 1/4，INT8 矩阵乘法在现代 GPU 上可以通过 Tensor Core 加速。

INT4（4 位整数）：将数值压缩到 [-8, 7] 或 [0, 15]。存储量是 FP32 的 1/8。这是当前量化精度的下限——低于 INT4 时，大多数模型的精度损失无法接受。

### 2.3 精度对比表

| 格式 | 位宽 | 相对存储 | 动态范围 | 适用场景 |
|------|------|----------|----------|----------|
| FP32 | 32 | 1x | 极广 | 训练、高精度推理 |
| BF16 | 16 | 2x | 广 | 训练（推荐）、推理 |
| FP16 | 16 | 2x | 中等 | 推理（需注意溢出） |
| INT8 | 8 | 4x | 有限 | 推理（最常用） |
| INT4 | 4 | 8x | 很窄 | 极致压缩推理 |

量化不是简单的精度截断，而是一个需要校准的过程。我们需要确定缩放因子（scale factor）和零点（zero point），使得量化后的数值分布尽可能接近原始分布。

### 2.4 量化中的舍入误差分析

舍入误差（Rounding Error）是量化过程中不可避免的数值偏差。当我们将一个浮点数映射到有限的整数集合时，原始数值和量化数值之间的差值就是舍入误差。

最大舍入误差取决于量化步长（quantization step size）。对于 INT8 对称量化，步长为：

step = 2 × max(|x|) / 255

最大舍入误差为 step / 2。如果原始权重的范围是 [-2, 2]，那么 INT8 量化的最大舍入误差为 2 × 2 / 255 / 2 ≈ 0.008——这是一个非常小的误差，通常不会对模型精度产生显著影响。

### 2.5 量化校准方法

校准（Calibration）是量化过程中的关键环节。它的目的是通过一个小型校准数据集，确定最佳的缩放因子和零点。

最小最大校准（Min-Max Calibration）：使用校准数据中最大值和最小值来确定缩放范围。这是最简单的方法，但对异常值敏感——一个极端值会导致整个量化范围变大，精度下降。

KL 散度校准（KL Divergence Calibration）：通过最小化量化前后分布的 KL 散度来确定最佳截断点。这是 TensorRT 和 **NVIDIA** 推荐的校准方法，对异常值鲁棒性强。

百分位数校准（Percentile Calibration）：只使用校准数据中99.9 百分位的值作为截断点，忽略极端异常值。这在大语言模型量化中效果较好，因为 LLM 的激活值分布通常有长尾特性。`,
      tip: "BF16 是 FP16 的升级版——指数位更多，不容易溢出。如果你的 GPU 支持 BF16（NVIDIA Ampere 及以后），优先用 BF16 替代 FP16 进行训练，稳定性大幅提升。",
      warning: "INT8 量化的核心难点是激活值（activation）的动态范围远大于权重（weight）。权重的分布相对稳定，但激活值在不同输入下变化很大。如果不做校准（calibration），直接量化激活值会导致大量信息丢失。"
    },
    {
      title: "3. 量化（Quantization）：原理与实战",
      body: `量化是推理优化中最立竿见影的技术。它的核心思想很简单：用更少的比特表示相同的信息。

### 3.1 量化的基本原理

**线性量化公式**：

对于浮点数 x，量化后的整数 q 为：

q = round(x / scale) + zero_point

其中 scale 是缩放因子，zero_point 是零点偏移。反量化（dequantization）公式为：

x ≈ (q - zero_point) × scale

scale 的计算方式决定了量化质量。最常用的方法是对称量化和非对称量化。

**对称量化**：zero_point = 0，数值范围 [-max_abs, max_abs] 映射到 [-127, 127]。公式：

scale = max(|x|) / 127

**非对称量化**：zero_point ≠ 0，数值范围 [min(x), max(x)] 映射到 [0, 255]。适用于激活值的量化，因为激活值通常不对称（如 ReLU 后只有正值）。

### 3.2 量化粒度

逐层量化（Per-Tensor）：整个张量使用同一个 scale。实现简单，但精度损失较大。

逐通道量化（Per-Channel）：每个输出通道使用独立的 scale。这是卷积层量化的标准做法，精度显著优于逐层量化。

逐组量化（Per-Group）：将权重分成多个组（如每 128 个权重的组），每组使用独立的 scale。这是大语言模型量化的主流方法（如 AWQ、GPTQ）。



### 3.5 混合精度量化（Mixed-Precision Quantization）

混合精度量化是一种智能量化策略——不是所有层都用相同精度，而是根据层的重要性分配不同的量化精度。

敏感层（如注意力层、分类头）使用 FP16 保持精度，不敏感层（如 MLP 中间层）使用 INT8 或 INT4 实现压缩。这种方法可以在几乎不损失精度的前提下，实现 3-5 倍的模型压缩。

### 3.3 量化策略对比

| 策略 | 精度损失 | 加速比 | 实现难度 | 适用场景 |
|------|----------|--------|----------|----------|
| FP16 推理 | < 0.1％ | 1.5-2x | 极低 | 通用推理 |
| PTQ-INT8 | 0.5-2％ | 2-3x | 低 | CNN、BERT |
| QAT-INT8 | 0.1-0.5％ | 2-3x | 中 | 对精度要求高的场景 |
| INT4（AWQ） | 1-3％ | 3-5x | 中 | 大语言模型 |
| INT4（GGUF） | 2-5％ | 2-4x | 低 | 本地 LLM 部署 |

PTQ（Post-Training Quantization）：训练后量化，不需要重新训练模型。只需要一个校准数据集（calibration dataset），通常是 100-1000 条样本。

QAT（Quantization-Aware Training）：量化感知训练，在训练过程中模拟量化噪声，使模型学会适应低精度。精度损失更小，但需要重新训练。

### 3.4 大语言模型量化方案

AWQ（Activation-aware Weight Quantization）：当前 LLM 量化的 SOTA 方法。核心思想是保护激活值敏感的重要权重，只量化不重要的权重。AWQ 在 INT4 精度下，精度损失仅 1-3％，远优于传统量化方法。

GPTQ（Generative Pre-trained **Transformer** Quantization）：通过逐层优化的方式确定量化参数。它在校准数据上运行一次前向传播，然后对每一层独立求解最优量化参数。GPTQ 的优点是自动化程度高，不需要手动调参。

GGUF（GPT-Generated Unified Format）：llama.cpp 使用的量化格式。支持 Q2 到 Q8 多种精度级别。Q4_K_M（4 位中等质量）是最常用的格式，在 7B 模型上可以在 8GB 内存的 CPU 上运行。`,
      tip: "对于 CNN 和 BERT 类模型，优先使用 PTQ-INT8（训练后量化），通常只需 100 条校准数据，精度损失 < 1％，即可获得 2-3 倍加速。对于大语言模型，推荐使用 AWQ 或 GPTQ 的 INT4 量化方案。",
      warning: "PTQ 的关键是校准数据集的质量。如果校准数据不能覆盖模型的典型输入分布，量化后的模型在某些输入上可能出现灾难性精度下降。校准数据应覆盖模型在真实场景中会遇到的所有输入类型。"
    },
    {
      title: "4. PyTorch 量化实战代码",
      body: `下面是一个完整的 PyTorch PTQ-INT8 量化实战示例，涵盖校准、量化和性能对比。

### 4.1 动态量化（Dynamic Quantization）

动态量化在推理时动态量化激活值，但权重是预量化的。这是最简单的量化方式，适合 RNN、**Transformer** 等内存受限的模型。`,
      code: [
        {
          lang: "python",
          title: "PyTorch 动态量化实战",
          code: `import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import time

# ─── 1. 定义一个简单的 Transformer 模型 ───
class SimpleTransformer(nn.Module):
    def __init__(self, vocab_size=10000, embed_dim=256, num_layers=4):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim, nhead=8, dim_feedforward=1024
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.fc = nn.Linear(embed_dim, vocab_size)

    def forward(self, x):
        emb = self.embedding(x)
        out = self.transformer(emb)
        return self.fc(out)

# ─── 2. 创建模型和校准数据 ───
model = SimpleTransformer()
model.eval()

# 校准数据集（100 条样本，覆盖典型输入分布）
calibration_data = torch.randint(0, 10000, (100, 32))  # batch=100, seq_len=32
calibration_loader = DataLoader(
    TensorDataset(calibration_data), batch_size=10
)

# ─── 3. 执行动态量化 ───
quantized_model = torch.quantization.quantize_dynamic(
    model,
    {nn.Linear, nn.TransformerEncoderLayer},  # 量化目标层
    dtype=torch.qint8
)

# ─── 4. 性能对比 ───
test_input = torch.randint(0, 10000, (1, 128))

def benchmark(model, input, iterations=100):
    """测量模型推理延迟"""
    times = []
    with torch.no_grad():
        for _ in range(iterations):
            start = time.perf_counter()
            _ = model(input)
            end = time.perf_counter()
            times.append(end - start)
    return {
        'mean_ms': sum(times) / len(times) * 1000,
        'p50_ms': sorted(times)[len(times)//2] * 1000,
        'p99_ms': sorted(times)[int(len(times)*0.99)] * 1000
    }

fp32_stats = benchmark(model, test_input)
int8_stats = benchmark(quantized_model, test_input)

print(f"FP32:  平均延迟 {fp32_stats['mean_ms']:.2f}ms, P99: {fp32_stats['p99_ms']:.2f}ms")
print(f"INT8:  平均延迟 {int8_stats['mean_ms']:.2f}ms, P99: {int8_stats['p99_ms']:.2f}ms")
print(f"加速比: {fp32_stats['mean_ms'] / int8_stats['mean_ms']:.2f}x")

# ─── 5. 精度对比 ───
fp32_output = model(test_input)
int8_output = quantized_model(test_input)

# 计算余弦相似度
cos_sim = torch.nn.functional.cosine_similarity(
    fp32_output.flatten(), int8_output.flatten().float(), dim=0
)
print(f"输出余弦相似度: {cos_sim.item():.4f}")  # 通常 > 0.99

# ─── 6. 模型大小对比 ───
torch.save(model.state_dict(), 'fp32_model.pt')
torch.save(quantized_model.state_dict(), 'int8_model.pt')

import os
fp32_size = os.path.getsize('fp32_model.pt') / 1024 / 1024
int8_size = os.path.getsize('int8_model.pt') / 1024 / 1024
print(f"FP32 模型大小: {fp32_size:.2f}MB")
print(f"INT8 模型大小: {int8_size:.2f}MB")
print(f"压缩比: {fp32_size / int8_size:.2f}x")`
        }
      ],
      tip: "PyTorch 动态量化只支持 nn.Linear 和 nn.LSTM 等特定层。如果模型包含卷积层或其他自定义层，需要使用 FX 图模式量化（torch.quantization.quantize_fx），它支持更广泛的层类型。",
      warning: "动态量化在每次推理时都要量化激活值，这会增加 CPU 上的计算开销。如果部署在 GPU 上，建议使用静态量化（Static Quantization）或 TensorRT，它们对 GPU 推理有更好的支持。"
    },
    {
      title: "5. 剪枝（Pruning）：原理与实战",
      body: `**剪枝的核心思想是**：神经网络中存在大量冗余参数——某些权重对最终输出的贡献微乎其微，将它们设为零不会显著影响模型性能。

### 5.1 剪枝的分类

非结构化剪枝（Unstructured Pruning）：将单个权重设为零。这会产生稀疏矩阵，但需要专门的稀疏推理引擎才能加速。PyTorch 原生支持。

结构化剪枝（Structured Pruning）：将整行、整列或整个通道删除。这产生的是更小但密集的矩阵，可以直接在标准硬件上加速。

全局剪枝 vs 逐层剪枝：全局剪枝在全模型范围内统一按阈值裁剪；逐层剪枝对每一层分别设置裁剪比例。

### 5.2 剪枝策略

幅度剪枝（Magnitude Pruning）：选择绝对值最小的权重进行裁剪。这是最简单也最常用的方法。

梯度剪枝（Gradient-based Pruning）：根据权重对损失函数的梯度大小决定裁剪。梯度小的权重被认为不重要。

敏感度分析（Sensitivity Analysis）：对每一层独立测试不同裁剪比例对精度的影响，选择每层最优的裁剪率。

### 5.3 迭代剪枝流程

一次性剪枝往往导致精度大幅下降。迭代剪枝（Iterative Pruning）是业界标准做法：

1. 训练模型到收敛
2. 剪枝一定比例（如 20％）的不重要权重
3. 微调（fine-tune）恢复精度
4. 重复步骤 2-3，直到达到目标稀疏度

典型迭代剪枝可以实现 50-90％ 的稀疏度，精度损失控制在 1％ 以内。

### 5.4 稀疏度与加速关系

| 稀疏度 | 模型体积缩减 | 实际加速 | 精度损失 |
|--------|-------------|----------|----------|
| 20％ | 20％ | 1.1x | < 0.1％ |
| 50％ | 50％ | 1.5x | 0.2-0.5％ |
| 75％ | 75％ | 2x | 0.5-1.5％ |
| 90％ | 90％ | 2-3x | 1-3％ |

**注意**：非结构化剪枝的实际加速取决于硬件支持。在不支持稀疏计算的 GPU上，50％ 稀疏度可能不带来任何加速——因为稀疏矩阵仍被当作密集矩阵处理。

### 5.5 **NVIDIA** 2:4 结构化稀疏

**NVIDIA** Ampere 架构（A100、H100）原生支持一种特殊的结构化稀疏模式——2:4 稀疏：每 4 个连续元素中，至少有 2 个为零。这种稀疏模式可以通过 Tensor Core 实现 2 倍加速，同时保持较高的模型精度。

2:4 稀疏的实现步骤：

1. 训练模型到收敛
2. 分析每 4 个元素组，找出绝对值最小的 2 个
3. 将这两个元素设为零（masking）
4. 微调模型恢复精度
5. 导出为稀疏 TensorRT Engine

2:4 稀疏的适用场景：特别适合大语言模型的权重压缩。研究表明，Llama-2-7B 在经过 2:4 稀疏后，精度损失仅 0.3-0.8%%，而推理速度提升约 1.8 倍。
`,
      tip: "对于部署到 CPU/移动端的场景，推荐使用结构化剪枝——即使稀疏度较低，也能获得实际加速。对于 GPU 部署，可以使用 NVIDIA 的 2:4 结构化稀疏模式（每 4 个元素中至少 2 个为零），TensorRT 原生支持这种模式的加速。",
      warning: "剪枝后必须进行微调（fine-tuning）。直接剪枝而不微调会导致精度急剧下降。微调的学习率应该比原始训练小 10 倍左右（如原始学习率 1e-4，微调用 1e-5），训练轮数通常为原始训练的 1/3 到 1/2。"
    },
    {
      title: "6. 知识蒸馏（Knowledge Distillation）：原理与实战",
      body: `知识蒸馏是最优雅的模型压缩方法——不是简单地裁剪模型，而是让小模型向大模型学习。

### 6.1 蒸馏的核心思想

教师模型（Teacher）：大而准确的模型（如 Llama-3-70B），具有丰富的知识。

学生模型（Student）：小而高效的模型（如 Llama-3-8B），推理速度快、资源占用少。

**蒸馏过程**：学生模型不仅学习真实标签（hard labels），还学习教师模型的输出概率分布（soft labels）。教师模型的 soft label 包含了类别间的相对关系，这些"暗知识"（dark knowledge）帮助学生模型更好地泛化。

### 6.2 蒸馏损失函数

标准蒸馏损失由两部分组成：

Hard Loss（硬损失）：学生模型输出与真实标签的交叉熵。

Soft Loss（软损失）：学生模型输出与教师模型输出的 KL 散度（Kullback-Leibler Divergence）。

总损失 = α × Hard Loss + (1-α) × Soft Loss

其中 α 是权重系数，通常设为 0.1-0.5。

**温度参数 T**：在计算 soft label 时，将 logits 除以温度 T。T 越大，概率分布越平滑，暗知识越丰富。通常 T = 2-10。

### 6.3 蒸馏策略对比

| 策略 | 教师模型 | 学生模型 | 适用场景 |
|------|----------|----------|----------|
| 标准蒸馏 | 大模型 | 同架构小模型 | 通用压缩 |
| 跨架构蒸馏 | 任意模型 | 不同架构 | 架构迁移 |
| 自蒸馏 | 同模型 | 同模型（多轮） | 提升小模型性能 |
| 数据自由蒸馏 | 大模型 | 小模型（无原始数据） | 隐私保护场景 |

**蒸馏的效果**：在图像分类任务上，ResNet-18（学生）通过 ResNet-50（教师）蒸馏，可以将准确率从 69.8％ 提升到 74.1％——接近 ResNet-50 本身的 76.1％。这意味着参数量只有 1/4的小模型，性能接近大模型。

### 6.4 大语言模型蒸馏

LLM 蒸馏是当前最前沿的研究方向之一。与图像分类蒸馏不同，LLM 蒸馏面临独特挑战：

**输出空间巨大**：LLM 的词汇表大小通常在 30,000-100,000，远大于图像分类的 1,000 个类别。这意味着 soft label 的维度极高，计算 KL 散度的成本巨大。

**序列生成蒸馏**：LLM 是自回归生成模型，输出不是固定的分类标签，而是序列。蒸馏时需要考虑token-by-token 的生成过程，而不仅仅是最终输出。

**MiniLLM 方法**：通过反向 KL 散度（reverse KL divergence）进行蒸馏，让学生模型专注于教师模型最确定的 token，而不是平均分配注意力。这种方法在 LLaMA-65B → LLaMA-7B 的蒸馏中，性能损失仅 3-5％。

DistilLLM 方法：使用中间层蒸馏——不仅蒸馏最终输出，还蒸馏每一层的隐藏状态。这种方法保留了更多的层级结构知识，但需要教师和学生模型的层数对齐。`,
      tip: "温度参数 T 是蒸馏效果的关键。T 太小（接近 1）时 soft label 接近 one-hot，暗知识不足；T 太大时概率分布过于均匀，梯度信号变弱。推荐从 T=4 开始实验，根据验证集效果微调。",
      warning: "知识蒸馏的最大成本是计算资源——需要同时运行教师模型和学生模型。教师模型的推理开销是额外的计算负担。如果教师模型太大无法在单 GPU 上运行，需要多 GPU 分布式推理，这会显著增加蒸馏的时间和成本。"
    },
    {
      title: "7. 知识蒸馏实战代码",
      body: `下面是一个完整的知识蒸馏实现，使用教师-学生架构进行图像分类蒸馏。`,
      code: [
        {
          lang: "python",
          title: "PyTorch 知识蒸馏完整实现",
          code: `import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import models, datasets, transforms

# ─── 1. 定义教师和学生模型 ───
# 教师：预训练的 ResNet-50
teacher = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
teacher.eval()
for param in teacher.parameters():
    param.requires_grad = False  # 教师模型冻结

# 学生：ResNet-18
student = models.resnet18(weights=None)
student.train()

# ─── 2. 准备数据 ───
transform_train = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                        std=[0.229, 0.224, 0.225])
])

train_dataset = datasets.ImageFolder('data/train', transform=transform_train)
train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True, num_workers=4)

# ─── 3. 蒸馏配置 ───
temperature = 5.0          # 温度参数 T
alpha = 0.3                # hard loss 权重
criterion_hard = nn.CrossEntropyLoss()
criterion_soft = nn.KLDivLoss(reduction='batchmean')
optimizer = torch.optim.AdamW(student.parameters(), lr=1e-4, weight_decay=1e-4)

# ─── 4. 蒸馏训练 ───
def train_one_epoch(teacher, student, loader, optimizer, T, alpha):
    """单轮蒸馏训练"""
    student.train()
    total_hard_loss = 0
    total_soft_loss = 0
    correct = 0
    total = 0

    for images, labels in loader:
        images, labels = images.cuda(), labels.cuda()

        # 前向传播
        with torch.no_grad():
            teacher_logits = teacher(images)
            teacher_probs = F.softmax(teacher_logits / T, dim=1)

        student_logits = student(images)
        student_log_probs = F.log_softmax(student_logits / T, dim=1)

        # 计算两种损失
        hard_loss = criterion_hard(student_logits, labels)
        soft_loss = criterion_soft(student_log_probs, teacher_probs) * (T * T)

        # 组合损失
        loss = alpha * hard_loss + (1 - alpha) * soft_loss

        # 反向传播
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # 统计
        total_hard_loss += hard_loss.item()
        total_soft_loss += soft_loss.item()
        preds = student_logits.argmax(dim=1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

    return {
        'hard_loss': total_hard_loss / len(loader),
        'soft_loss': total_soft_loss / len(loader),
        'accuracy': correct / total
    }

# ─── 5. 训练循环 ───
num_epochs = 20
for epoch in range(num_epochs):
    metrics = train_one_epoch(teacher, student, train_loader, optimizer, temperature, alpha)
    print(f"Epoch {epoch+1}/{num_epochs}: "
          f"Hard Loss={metrics['hard_loss']:.4f}, "
          f"Soft Loss={metrics['soft_loss']:.4f}, "
          f"Accuracy={metrics['accuracy']:.4f}")

# ─── 6. 对比验证（蒸馏 vs 无蒸馏） ───
# 训练一个不蒸馏的 ResNet-18 作为基线
baseline_student = models.resnet18(weights=None)
baseline_student.train()
# ...（使用相同数据和训练轮数，但只用 hard loss）
# 蒸馏后的学生模型通常比基线高 3-5 个百分点的准确率

# ─── 7. 保存蒸馏后的学生模型 ───
torch.save(student.state_dict(), 'distilled_resnet18.pth')
print(f"蒸馏模型已保存，参数数量: {sum(p.numel() for p in student.parameters()) / 1e6:.1f}M")
print(f"教师模型参数数量: {sum(p.numel() for p in teacher.parameters()) / 1e6:.1f}M")
print(f"压缩比: {sum(p.numel() for p in teacher.parameters()) / sum(p.numel() for p in student.parameters()):.1f}x")`
        }
      ],
      table: {
        headers: ["优化技术", "压缩比", "精度损失", "适用模型", "推理加速"],
        rows: [
          ["FP16 推理", "2x", "< 0.1％", "所有", "1.5-2x"],
          ["INT8 PTQ", "4x", "0.5-2％", "CNN/Transformer", "2-3x"],
          ["INT4 AWQ", "8x", "1-3％", "LLM", "3-5x"],
          ["50％ 剪枝", "2x", "0.2-1％", "所有", "1.5-2x"],
          ["知识蒸馏", "4-8x", "1-5％", "所有", "3-6x"],
          ["蒸馏+量化", "16-32x", "2-5％", "所有", "5-10x"]
        ]
      },
      tip: "组合使用蒸馏和量化是工业界最佳实践。先用蒸馏获得一个高性能的小模型，再对这个小模型做 INT8 量化。两步叠加可以获得 10-30 倍的总体压缩，同时精度损失控制在 3％ 以内。",
      warning: "蒸馏需要大量训练数据。如果数据量不足（如 < 10,000 样本），蒸馏效果可能不如预期，甚至出现负迁移（学生模型性能反而下降）。在数据有限的情况下，考虑使用自蒸馏（self-distillation）或数据增强。"
    },
    {
      title: "8. 推理引擎选择与部署实践",
      body: `量化和剪枝只是第一步——要让优化后的模型真正跑起来，还需要选择合适的推理引擎。

### 8.1 主流推理引擎对比

TensorRT：**NVIDIA** 官方推理引擎。支持 FP16、INT8，自动进行层融合（layer fusion）和内核自动调优（kernel auto-tuning）。在 **NVIDIA** GPU 上是最佳选择。

ONNX Runtime：微软开源的跨平台推理引擎。支持 CPU、GPU、NPU 等多种后端。模型通过 ONNX 格式导出后，可以在任何平台上运行。

**vLLM**：专为大语言模型设计的推理引擎。使用 PagedAttention 技术，吞吐量比 HuggingFace Transformers 高 2-4 倍。

llama.cpp：C/C++ 实现的大语言模型推理框架。支持 GGUF 量化格式（INT8/INT4），可以在 纯 CPU 上高效运行 LLM。

### 8.2 推理引擎选择指南

| 引擎 | 最佳后端 | 量化支持 | 延迟优化 | 吞吐优化 | 适用场景 |
|------|----------|----------|----------|----------|----------|
| TensorRT | NVIDIA GPU | FP16/INT8 | ✅ 极佳 | ✅ 优秀 | 低延迟在线服务 |
| ONNX Runtime | CPU/GPU | INT8/FP16 | ✅ 良好 | ✅ 良好 | 跨平台部署 |
| **vLLM** | NVIDIA GPU | INT8/AWQ | ✅ 良好 | ✅ 极佳 | LLM 批量推理 |
| llama.cpp | CPU/Apple Silicon | GGUF(INT4) | ✅ 良好 | 一般 | 本地 LLM 部署 |

### 8.3 完整部署流程

Step 1：训练并评估原始 FP32 模型 → 记录基线精度。

Step 2：应用量化/剪枝 → 在验证集上评估精度损失。

Step 3：导出为推理引擎格式（ONNX/TensorRT Engine/GGUF）。

Step 4：在目标硬件上基准测试（延迟、吞吐量、内存占用）。

Step 5：如果精度损失超标 → 回退到更保守的量化策略或增加 QAT 轮数。

Step 6：部署到生产环境 → 持续监控线上性能指标。

### 8.4 边缘设备部署的特殊考虑

边缘设备（如手机、IoT 设备、嵌入式系统）对模型优化有独特要求：

**内存限制**：大多数边缘设备只有 1-4GB RAM，而 FP32 的大模型可能需要 8-16GB。必须使用 INT8 或 INT4 量化才能部署。

**功耗限制**：边缘设备通常由电池供电，推理功耗直接影响续航时间。量化后的模型不仅运行更快，功耗也更低——因为低精度运算消耗的能量更少。

**硬件加速器**：现代移动芯片（如 Apple A17/M3、高通 Snapdragon）都内置了 NPU（Neural Processing Unit），专门加速 INT8 量化模型的推理。通过 CoreML（Apple）或 QNN（高通）导出模型，可以获得 5-10 倍的加速效果。`,
      tip: "对于生产部署，建议在 ONNX 格式上做中间验证——先导出 ONNX，验证 ONNX 模型的精度与原模型一致（误差 < 0.1％），再转换为 TensorRT 或其他引擎格式。这样可以隔离问题：如果最终精度不对，可以确定是转换环节还是量化环节的问题。",
      warning: "不同推理引擎对同一量化模型的加速效果差异很大。TensorRT 在 NVIDIA GPU 上的 INT8 加速可能达到 3-5x，但 ONNX Runtime 在同一 GPU 上的 INT8 加速可能只有 1.5-2x。务必在目标部署环境的真实硬件上测试，不要用开发机的数据推断生产环境的性能。"
    },
    {
      title: "9. 扩展阅读与最佳实践总结",
      mermaid: `graph TD
    A["新模型"] --> B["FP16/BF16 转换"]
    B --> C{"加速满足?"}
    C -->|"否"| D["INT8 PTQ"]
    C -->|"是"| E["部署"]
    D --> F{"精度损失 < 2％?"}
    F -->|"否"| G["QAT 量化感知训练"]
    F -->|"是"| H["部署"]
    G --> F
    H --> I{"需更小体积?"}
    I -->|"是"| J["知识蒸馏"]
    I -->|"否"| K["完成"]
    J --> L["INT4 量化"]
    L --> K
    style A fill:#1a365d,stroke:#63b3ed
    style K fill:#1a365d,stroke:#68d391
    style E fill:#1a365d,stroke:#68d391`,
      body: `推理优化是一个持续迭代的过程。以下是本文的核心要点总结和推荐学习资源。

### 9.1 核心要点回顾

**量化优先原则**：对于大多数场景，INT8 量化是性价比最高的优化手段。实现简单、加速显著、精度损失可控。

**蒸馏 + 量化组合**：先用知识蒸馏获得高性能小模型，再用量化进一步加速推理。这是工业界最常用的组合策略。

**基线测量**：任何优化都必须从准确的基线测量开始。没有基线的优化是盲人摸象。

**验证集评估**：每次优化后必须在验证集上重新评估精度。不要依赖训练集或测试集的指标。

**硬件感知优化**：优化策略必须针对目标硬件选择。在 GPU 上最优的策略在 CPU 上可能适得其反。

### 9.2 推荐阅读

- TensorRT Developer Guide：**NVIDIA** 官方文档，覆盖 INT8 校准、层融合、性能调优
- ONNX Runtime Performance Tuning：微软官方指南
- AWQ (Activation-aware Weight Quantization)：当前 LLM INT4 量化的 SOTA 方法
- GPTQ (Generative Pre-trained **Transformer** Quantization)：另一种流行的 LLM 量化方案
- Distilling the Knowledge in a Neural Network（Hinton et al., 2015）：知识蒸馏的开创性论文

### 9.3 优化决策树

面对一个新模型时，按以下顺序考虑优化：

1. FP16 推理 → 如果硬件支持 BF16/FP16，零成本获得 1.5-2x 加速
2. INT8 PTQ → 如果需要进一步加速，且精度损失 < 2％ 可接受
3. 知识蒸馏 → 如果需要大幅缩小模型体积（4-8x），且有时间做蒸馏训练
4. INT4 量化 → 如果部署在内存受限环境（如边缘设备），且 3-5％ 精度损失可接受
5. 剪枝 → 如果需要极致的稀疏度，且目标硬件支持稀疏计算`,
      tip: "保留每个优化步骤的实验记录：使用了什么方法、精度变化多少、加速比多少、模型大小变化。这样可以在精度不达标时快速回退到之前的版本。建议使用 MLflow 或 W&B 追踪所有优化实验。",
      warning: "推理优化不是一次性工作。当模型更新、数据分布变化、硬件升级时，需要重新评估优化策略。特别是在生产环境中持续监控模型性能，及时发现并处理精度退化（regression）。"
    }
  ]
};
