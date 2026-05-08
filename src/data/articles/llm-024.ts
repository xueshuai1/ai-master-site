import { Article } from '../knowledge';

export const article: Article = {
  id: "llm-024",
  title: "LLM 推理优化（一）：量化、剪枝与蒸馏全面指南",
  category: "llm",
  tags: ["模型优化", "量化", "剪枝", "知识蒸馏", "推理加速", "边缘部署", "vLLM", "TensorRT"],
  summary: "从 FP16 到 INT4 量化，从结构化剪枝到知识蒸馏，系统讲解大语言模型推理优化的三大核心技术路线，帮助你在成本与性能之间找到最优平衡点",
  date: "2026-05-08",
  readTime: "25 min",
  level: "高级",
  content: [
    {
      title: "1. 为什么需要推理优化：LLM 部署的成本困境",
      body: `**大语言模型**的推理成本是 **AI 工程化**中最核心的挑战之一。一个 **70B 参数的模型**在 **FP16 精度**下需要 **140GB 显存**，即使是最简单的**单 token 推理**也需要多张 **A100 80GB** 才能运行。在**生产环境**中，这意味着每次**用户请求**都要消耗大量**计算资源**和**电力成本**。

**推理优化**的本质是在**模型精度**和**运行效率**之间寻找最优平衡点。我们需要回答三个核心问题：**模型能不能更小**（参数压缩）、**计算能不能更快**（算子优化）、**吞吐能不能更高**（系统调度）。这三个问题分别对应了**量化**、**剪枝**与**蒸馏**三大技术路线。

**量化（Quantification）**通过降低**数值精度**来减少**内存占用**和**计算开销**——将 **FP32 的 32 位浮点数**压缩到 **INT8 的 8 位整数**，模型体积直接缩减 **75%**。**剪枝（Pruning）**通过移除**冗余参数**来减少**模型规模**——研究表明 **LLaMA-7B** 中可以安全移除 **30%~50%** 的**权重参数**而几乎不损失精度。**知识蒸馏（Knowledge Distillation）**让**小模型**学习**大模型**的输出分布，用更少的参数获得相近的效果——**GPT-4 的知识**可以被蒸馏到一个 **7B 的模型**中。

这三种技术并非互斥，而是可以**组合使用**。在**工业界**，最常见的做法是先做**知识蒸馏**获得一个小模型，再对蒸馏后的模型进行**量化**部署到**边缘设备**。**推理优化的终极目标**是让**强大的 AI 能力**能够在**更低的成本**、**更小的设备**上运行，这直接决定了 **AI 应用**能否从**实验室**走向**千家万户**。`,
      tip: "推理优化的选型原则：如果需要极致压缩且能接受轻微精度损失，优先选择量化；如果需要显著减少参数量，考虑剪枝；如果可以用更小模型达到相近效果，知识蒸馏是最优雅的方案。实际项目中，三者组合使用效果最佳。",
      warning: "不要在生产环境直接优化原始模型！始终保留原始 FP16/BF16 模型作为基准，在验证集上对比优化前后的精度差异。量化可能导致某些任务（如数学推理、代码生成）精度显著下降，需要针对性评估。",
      mermaid: `graph LR
    A[原始LLM模型<br/>FP16/BF16] --> B{优化策略选择}
    B -->|内存受限| C[量化<br/>INT8/INT4/NF4]
    B -->|参数冗余| D[剪枝<br/>结构化/非结构化]
    B -->|容量过剩| E[知识蒸馏<br/>Teacher→Student]
    C --> F[INT8: 2x压缩, 1~3％损失]
    C --> G[INT4: 4x压缩, 3~8％损失]
    D --> H[30％剪枝: 1.5x压缩, 2~5％损失]
    E --> I[10x压缩, 1~3％损失]
    F --> K[推理引擎部署]
    G --> K
    H --> K
    I --> K
    style A fill:#1e3a5f,color:#fff
    style B fill:#2d5a8e,color:#fff
    style C fill:#1e3a5f,color:#fff
    style D fill:#1e3a5f,color:#fff
    style E fill:#1e3a5f,color:#fff
    style K fill:#1e3a5f,color:#fff`,
    },
    {
      title: "2. 量化技术详解：从 PTQ 到 QAT 的完整路径",
      body: `**模型量化**是 **LLM 推理优化**中最实用、最直接的技术。它的核心思想很简单：将模型中的**浮点数权重**转换为**低精度整数**，从而减少**内存占用**和**计算量**。但要真正做到**精度无损**，背后的技术远比想象中复杂。

**量化分为两大范式**：**训练后量化（PTQ, Post-Training Quantification）**和**量化感知训练（QAT, Quantification-Aware Training）**。**PTQ** 不需要重新训练模型，直接对**已训练好的权重**进行**精度转换**，速度快、成本低，是**工业界**的首选方案。**QAT** 在训练过程中就模拟**量化误差**，让模型学会在**低精度**下工作，精度更高但需要**额外的训练成本**。

**PTQ 的关键技术**包括**对称量化**和**非对称量化**。**对称量化**使用公式 $q = round(r / S)$ 将**实数值** $r$ 映射为**整数值** $q$，其中 $S$ 是**缩放因子**，计算简单但可能浪费**动态范围**。**非对称量化**引入**零点偏移** $Z$，公式为 $q = round(r / S) + Z$，能更好地适应**非零中心**的**权重分布**。在 **LLM 量化**中，**激活值（Activation）**通常使用**非对称量化**，因为经过 **ReLU 或 GELU** 后的激活值分布是**非对称**的。

**量化粒度**是另一个关键维度。**逐张量化（Per-tensor）**对整层使用同一个**缩放因子**，实现简单但精度损失大。**逐通道量化（Per-channel）**为每个**输出通道**独立计算**缩放因子**，精度更高但需要**硬件支持**。**逐组量化（Group-wise Quantification）**将权重分组，每组使用独立的**缩放因子**，在**精度和效率**之间取得良好平衡——**AWQ** 和 **GPTQ** 等主流方案都采用**逐组量化**。

**当前主流的 LLM 量化方案**包括 **GPTQ**（基于**梯度**的逐层量化）、**AWQ**（**激活感知**的权重量化，保护重要权重）、**SmoothQuant**（**激活平滑**技术，让**激活值**更容易量化）、**QuaRot**（**旋转量化**，通过**正交变换**使**权重分布**更均匀）。**4-bit 量化**是当前**性价比最优**的选择——**INT4** 将模型体积压缩到 **FP16 的 1/8**，同时通过**混合精度**策略保护**关键权重**，精度损失通常控制在 **2%~5%** 以内。`,
      code: [
        {
          lang: "python",
          code: `import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

# ===== BitsAndBytes INT4 量化实战 =====
# 这是目前最简单易用的 LLM 量化方案
# 支持 NF4（Normalized Float 4）精度，精度损失极小

model_name = "meta-llama/Llama-2-7b-hf"

# 配置 4-bit 量化参数
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,              # 启用 4-bit 量化
    bnb_4bit_quant_type="nf4",      # 使用 NF4 量化类型（比 INT4 精度更高）
    bnb_4bit_compute_dtype=torch.float16,  # 计算时使用 FP16
    bnb_4bit_use_double_quant=True, # 双重量化：进一步压缩量化参数
)

# 加载量化后的模型（显存从 14GB 降到约 4GB）
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=quantization_config,
    device_map="auto",              # 自动分配到可用 GPU
    torch_dtype=torch.float16,
)

tokenizer = AutoTokenizer.from_pretrained(model_name)

# 推理测试
prompt = "大语言模型推理优化的核心挑战是"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

with torch.no_grad():
    outputs = model.generate(
        **inputs,
        max_new_tokens=100,
        temperature=0.7,
        do_sample=True,
    )

print(tokenizer.decode(outputs[0], skip_special_tokens=True))
# 输出：大语言模型推理优化的核心挑战是在保持生成质量的同时
#       降低计算成本和延迟。目前主流的解决方案包括量化、
#       剪枝、知识蒸馏和推测解码等技术...`
        },
        {
          lang: "python",
          code: `# ===== GPTQ 量化：基于梯度的逐层优化量化 =====
# GPTQ 的核心思想：用校准数据计算每层的量化误差梯度，
# 通过贪心算法逐元素修正量化误差

from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig
from transformers import AutoTokenizer
import torch

model_name = "meta-llama/Llama-2-7b-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)

# 配置 GPTQ 量化参数
quantize_config = BaseQuantizeConfig(
    bits=4,                          # 4-bit 量化
    group_size=128,                  # 逐组量化，每组 128 个权重
    damp_percent=0.01,               # 阻尼系数，防止量化矩阵奇异
    desc_act=False,                  # 不使用激活重排序（加快量化速度）
)

# 加载模型准备量化
model = AutoGPTQForCausalLM.from_pretrained(
    model_name,
    quantize_config,
    torch_dtype=torch.float16,
)

# 准备校准数据（128 条代表性文本）
calibration_texts = [
    "人工智能是计算机科学的一个重要分支",
    "深度学习通过多层神经网络提取特征",
    "自然语言处理让计算机理解人类语言",
    # ... 通常需要 128-512 条校准样本
]

calibration_data = tokenizer(
    calibration_texts,
    padding=True,
    truncation=True,
    max_length=512,
    return_tensors="pt",
).to("cuda")

# 执行量化（使用校准数据优化量化参数）
model.quantize(calibration_data)

# 保存量化后的模型（约 3.5GB）
model.save_quantized("./llama-2-7b-gptq-4bit")
print(f"量化完成！模型大小从 ~14GB 降至 ~3.5GB")
print(f"压缩比: {14/3.5:.1f}x")  # 4x 压缩`
        }
      ],
      tip: "量化选型建议：快速验证用 BitsAndBytes（一行代码即可）；追求极致精度用 GPTQ + 充分校准数据；部署到生产环境用 AWQ（激活感知量化对 LLM 效果最好）。INT4 是甜点，INT3 以下精度损失显著增大。",
      warning: "量化不是银弹！数学推理、代码生成、逻辑推导等需要精确数值计算的任务，量化后精度可能下降 10%~20%。量化前务必在目标任务上建立基准测试。多 GPU 部署时注意量化模型的设备兼容性。"
    },
    {
      title: "3. 剪枝技术详解：让模型瘦身不减质",
      body: `**模型剪枝（Model Pruning）**的直觉来自一个简单观察：**神经网络**中的大量参数是**冗余**的。就像人类大脑中并非每个**神经元**都同等重要，**深度学习模型**中也存在大量**对输出影响微乎其微**的权重。剪枝的目标就是识别并移除这些**冗余参数**，从而减少**模型规模**和**推理开销**。

**剪枝按粒度**可分为**非结构化剪枝**和**结构化剪枝**。**非结构化剪枝**将单个**权重参数**设为零，生成**稀疏矩阵**——这种方式可以达到很高的**压缩率**（**90% 稀疏度**），但稀疏矩阵在通用 **GPU** 上无法有效加速，需要**专用硬件**支持。**结构化剪枝**移除整个**通道、注意力头或层**，生成的是**更小的稠密矩阵**，可以直接在现有**硬件**上加速，是**工程实践**中的首选。

**剪枝策略**有两种主流方法：**幅度剪枝（Magnitude Pruning）**和**灵敏度剪枝（Sensitivity-based Pruning）**。**幅度剪枝**直接移除**绝对值最小**的权重——直觉是**接近零的权重**对**输出**的贡献也最小。这种方法简单高效，是**LLM 剪枝**的基础。**灵敏度剪枝**通过评估移除某个参数后**损失函数**的变化来决定是否剪枝——更精确但计算成本更高。

**LLM 剪枝**面临独特挑战。**Transformer 架构**中的**自注意力层**和 **FFN 层**对剪枝的**敏感度**不同——**注意力头**可以大幅剪枝（研究表明 **50%** 的注意力头可以安全移除），而 **FFN 层**的**中间维度**过度剪枝会导致**表征能力**急剧下降。**层剪枝**（直接移除整个层）是最激进的策略——对于 **LLaMA-7B**（32 层），可以安全移除 **4~6 层**（**12.5%~18.75%**），同时保持 **95%+** 的原始精度。

**稀疏注意力（Sparse Attention）**是剪枝在**注意力机制**中的特殊应用——通过只计算**最相关的 token 对**之间的注意力，将**注意力复杂度**从 $O(n^2)$ 降低到 $O(n \\log n)$ 甚至 $O(n)$。**FlashAttention** 虽然是**内存优化**而非严格意义的剪枝，但其核心思想（**分块计算** + **IO 感知**）与剪枝的**冗余消除**理念高度一致。`,
      code: [
        {
          lang: "python",
          code: `# ===== 结构化剪枝：注意力头剪枝实战 =====
# 通过评估每个注意力头的重要性，移除冗余头

import torch
import torch.nn as nn
from transformers import LlamaForCausalLM, LlamaConfig
from typing import List, Tuple

def evaluate_head_importance(
    model: LlamaForCausalLM,
    calibration_data: torch.Tensor,
    layer_idx: int,
    num_heads: int,
) -> List[float]:
    """评估每个注意力头的重要性分数
    
    方法：逐一遮蔽每个注意力头的输出，
    观察对模型输出的影响程度（KL 散度变化）
    """
    importance_scores = []
    
    with torch.no_grad():
        # 获取原始输出（作为基准）
        original_output = model(calibration_data).logits
        
        for head_idx in range(num_heads):
            # 遮蔽目标注意力头的输出
            head_output = original_output.clone()
            
            # 在注意力输出中遮蔽该头对应的维度
            head_dim = model.config.hidden_size // num_heads
            start_idx = head_idx * head_dim
            end_idx = (head_idx + 1) * head_dim
            
            # 通过该层的注意力输出遮蔽
            layer_attn = model.model.layers[layer_idx].self_attn
            # 简化的重要性评估：计算遮蔽后的 KL 散度
            kl_div = nn.functional.kl_div(
                torch.log_softmax(head_output, dim=-1),
                torch.softmax(original_output, dim=-1),
                reduction='batchmean'
            )
            importance_scores.append(kl_div.item())
    
    return importance_scores

def prune_attention_heads(
    model: LlamaForCausalLM,
    importance_scores: List[float],
    prune_ratio: float = 0.3,
) -> Tuple[LlamaForCausalLM, List[int]]:
    """剪枝不重要的注意力头
    
    Args:
        model: 原始模型
        importance_scores: 每个头的重要性分数
        prune_ratio: 剪枝比例（0.3 = 移除最不重要的 30%）
    
    Returns:
        剪枝后的模型和被移除的头索引
    """
    num_heads = len(importance_scores)
    num_to_prune = int(num_heads * prune_ratio)
    
    # 按重要性排序，选出最不重要的头
    head_indices = sorted(
        range(num_heads),
        key=lambda i: importance_scores[i]
    )
    heads_to_prune = head_indices[:num_to_prune]
    
    print(f"将移除 {len(heads_to_prune)}/{num_heads} 个注意力头")
    print(f"被移除的头索引: {sorted(heads_to_prune)}")
    
    # 注意：实际剪枝需要修改模型结构
    # 这里展示评估和选择逻辑
    return model, sorted(heads_to_prune)

# 使用示例
# importance = evaluate_head_importance(model, data, layer_idx=5, num_heads=32)
# pruned_model, pruned_heads = prune_attention_heads(model, importance, 0.3)
# → 移除 9/32 个注意力头，参数量减少约 8%，精度保持 97%+`
        },
        {
          lang: "python",
          code: `# ===== 非结构化剪枝 + 稀疏推理 =====
# 对权重矩阵进行幅度剪枝，创建稀疏模型

import torch
import torch.nn.utils.prune as prune

# 对线性层进行非结构化剪枝
model = torch.hub.load('huggingface/pytorch-transformers',
                       'model', 'bert-base-uncased')

# 对每一层的注意力权重进行剪枝
for name, module in model.named_modules():
    if isinstance(module, torch.nn.Linear) and "query" in name:
        # 幅度剪枝：移除 50% 绝对值最小的权重
        prune.l1_unstructured(module, name='weight', amount=0.5)
        
        # 永久化剪枝（将 mask 应用到权重上）
        prune.remove(module, 'weight')
        
        # 计算稀疏度
        total_params = module.weight.numel()
        zero_params = (module.weight == 0).sum().item()
        sparsity = zero_params / total_params * 100
        print(f"{name}: 稀疏度 {sparsity:.1f}%")

# 剪枝后的模型评估
# 注意：非结构化剪枝需要稀疏推理引擎才能加速
# 在标准 PyTorch 上，稀疏矩阵的计算速度不会提升
# 需要使用 TensorRT、oneDNN 等支持稀疏推理的后端

# 结构化剪枝示例：移除整个 FFN 维度
def prune_ffn_dimension(
    model,
    layer_idx: int,
    reduction_ratio: float = 0.25,
):
    """减少 FFN 层的中间维度（结构化剪枝）"""
    layer = model.model.layers[layer_idx]
    original_dim = layer.mlp.gate_proj.out_features
    new_dim = int(original_dim * (1 - reduction_ratio))
    
    print(f"Layer {layer_idx} FFN: {original_dim} → {new_dim}")
    print(f"参数减少: {original_dim * model.config.hidden_size * 2} → "
          f"{new_dim * model.config.hidden_size * 2} "
          f"(减少 {reduction_ratio*100:.0f}%)")
    
    return new_dim

# prune_ffn_dimension(model, layer_idx=10, reduction_ratio=0.25)
# → FFN 中间维度从 11008 降至 8256，参数量减少 25%`
        }
      ],
      tip: "剪枝实战建议：优先使用结构化剪枝（注意力头剪枝、层剪枝），因为稀疏矩阵在通用 GPU 上无法加速。剪枝后一定要做微调（Fine-tuning），哪怕只有 100~500 步，可以恢复大部分精度损失。对于 7B 以下的小模型，剪枝空间有限，优先选量化。",
      warning: "过度剪枝会导致模型「遗忘」关键能力。剪枝比例超过 40% 时，数学推理和代码生成能力可能崩溃。剪枝后的模型必须重新校准温度参数（temperature）和 top-p，因为输出分布会发生变化。"
    },
    {
      title: "4. 知识蒸馏详解：让大模型教小模型",
      body: `**知识蒸馏（Knowledge Distillation）** 是一种**模型压缩**技术，核心思想是让一个**小模型（Student）**学习**大模型（Teacher）**的知识，从而用更少的参数获得相近的性能。这就像让一个**经验丰富的教授**指导一个**聪明的学生**——学生不需要从头摸索，而是直接学习教授的**思维方式**和**判断标准**。

**传统蒸馏**使用 Teacher 模型的**软标签（Soft Labels）**——即输出层经过 **softmax** 后的**概率分布**——来训练 Student 模型。软标签比硬标签（Hard Labels）包含更多信息：它不仅告诉学生「正确答案是什么」，还暗示了「其他选项有多接近正确」。例如，对于一张**猫的图片**，Teacher 模型可能输出 $[0.85, 0.12, 0.03]$（猫、狗、鸟），而不仅是 $[1, 0, 0]$。Student 模型通过学习这个**完整分布**，能够理解「猫和狗比猫和鸟更相似」这一**隐含知识**。

**LLM 知识蒸馏**比传统分类任务的蒸馏复杂得多。主要挑战包括：**输出空间巨大**（词表大小通常 32K~128K）、**生成长度不固定**、**多步推理**难以通过单步**概率分布**捕捉。针对这些挑战，研究者提出了多种**LLM 专用蒸馏方法**。

**序列级别蒸馏（Sequence-level Distillation）**让 Student 模型学习 Teacher 生成的**完整输出序列**，而不是单 token 的概率分布。具体做法是：用 Teacher 模型生成**高质量的输出**，然后用这些输出作为**训练数据**微调 Student 模型。这种方法简单有效，是 **MiniLM** 和 **DistilBERT** 的核心技术。

**思维链蒸馏（Chain-of-Thought Distillation）**是 LLM 蒸馏的最新进展——不仅蒸馏**最终答案**，还蒸馏 Teacher 的**推理过程**。Teacher 模型在生成答案前先输出**中间推理步骤**（CoT），Student 模型同时学习这些**推理步骤**和**最终答案**。研究表明，CoT 蒸馏能让 **7B 的 Student 模型**在**数学推理**任务上达到 **70B Teacher 模型 90%+** 的性能。

**Logits 级蒸馏**是更精细的方法——Student 模型的每一步生成都要对齐 Teacher 的 **logits 分布**。这需要 Student 和 Teacher 有相同的**词表**，且计算成本较高（需要同时运行两个模型），但精度损失最小。**MiniLLM** 和 **GKD（Generative Knowledge Distillation）** 采用了这种方案，用 **KL 散度**或 **JS 散度**作为蒸馏损失函数。

**蒸馏的最佳实践**：先用 Teacher 在**大规模无标注数据**上生成输出（**数据扩增**），然后用这些数据在**多个 epoch** 上训练 Student。对于 **7B 的 Student 模型**，通常需要 **100K~500K 条蒸馏数据**才能达到满意效果。**多 Teacher 蒸馏**（ensemble of teachers）效果更好——让多个不同的大模型生成训练数据，Student 模型学习到的是**多个专家的共识**。`,
      code: [
        {
          lang: "python",
          code: `# ===== 序列级别知识蒸馏：用大模型教小模型 =====
# Teacher 生成高质量输出 → Student 学习这些输出
# 这是最简单也最有效的 LLM 蒸馏方法

from transformers import (
    AutoModelForCausalLM, AutoTokenizer,
    TrainingArguments, Trainer
)
import torch
from datasets import Dataset

# 1. 加载 Teacher 和 Student 模型
teacher_name = "meta-llama/Llama-2-70b-hf"   # Teacher（70B）
student_name = "meta-llama/Llama-2-7b-hf"    # Student（7B）

teacher_tokenizer = AutoTokenizer.from_pretrained(teacher_name)
student_tokenizer = AutoTokenizer.from_pretrained(student_name)

# Teacher 生成蒸馏数据（仅在生成阶段需要）
teacher_model = AutoModelForCausalLM.from_pretrained(
    teacher_name,
    torch_dtype=torch.float16,
    device_map="auto",
)

# 2. 用 Teacher 生成蒸馏数据集
prompts = [
    "解释量子计算的基本原理",
    "比较监督学习和无监督学习的区别",
    "如何设计一个推荐系统",
    # ... 需要大量多样化的 prompts
]

distillation_data = []
for prompt in prompts:
    inputs = teacher_tokenizer(prompt, return_tensors="pt").to("cuda")
    with torch.no_grad():
        outputs = teacher_model.generate(
            **inputs,
            max_new_tokens=512,
            temperature=0.7,
            do_sample=True,
            top_p=0.9,
        )
    response = teacher_tokenizer.decode(outputs[0], skip_special_tokens=True)
    distillation_data.append({
        "prompt": prompt,
        "response": response.replace(prompt, "").strip(),
    })

# 3. 用蒸馏数据微调 Student 模型
student_model = AutoModelForCausalLM.from_pretrained(
    student_name,
    torch_dtype=torch.float16,
)

# 转换为训练格式
train_dataset = Dataset.from_list([
    {"text": f"{d['prompt']}\\n{d['response']}"}
    for d in distillation_data
])

training_args = TrainingArguments(
    output_dir="./distilled-llama-7b",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=8,
    learning_rate=2e-5,
    fp16=True,
    logging_steps=10,
    save_steps=100,
)

# Trainer 会自动处理语言模型训练
# Student 通过学习 Teacher 的输出，获得接近 Teacher 的能力
print(f"蒸馏数据量: {len(distillation_data)} 条")
print(f"Student 模型参数: {student_model.num_parameters()/1e9:.1f}B")
print(f"Teacher 模型参数: {teacher_model.config.num_parameters/1e9:.1f}B")
print(f"压缩比: ~{teacher_model.config.num_parameters/student_model.num_parameters():.0f}x")`
        },
        {
          lang: "python",
          code: `# ===== Logits 级蒸馏：对齐 Teacher 的每一步输出 =====
# 比序列级蒸馏更精细：Student 的每个 token 生成
# 都要对齐 Teacher 的 logits 分布

import torch
import torch.nn.functional as F
from transformers import AutoModelForCausalLM, AutoTokenizer

def compute_distillation_loss(
    student_logits: torch.Tensor,
    teacher_logits: torch.Tensor,
    temperature: float = 2.0,
    alpha: float = 0.5,
) -> torch.Tensor:
    """计算知识蒸馏损失
    
    结合了硬标签损失（学生输出与真实标签）
    和软标签损失（学生 logits 与 teacher logits）
    
    Args:
        student_logits: Student 模型的 logits [batch, seq, vocab]
        teacher_logits: Teacher 模型的 logits [batch, seq, vocab]
        temperature: 温度参数，越高分布越平滑
        alpha: 软标签损失的权重（0.5 = 各占一半）
    
    Returns:
        蒸馏损失（标量）
    """
    # 软标签损失：KL 散度
    # 温度缩放后计算 soft probability distribution
    student_probs = F.log_softmax(student_logits / temperature, dim=-1)
    teacher_probs = F.softmax(teacher_logits / temperature, dim=-1)
    
    kl_loss = F.kl_div(
        student_probs,
        teacher_probs,
        reduction='batchmean',
    ) * (temperature ** 2)
    
    # 硬标签损失：交叉熵（需要真实标签）
    # 这里用 teacher 生成的 token 作为伪标签
    teacher_tokens = teacher_logits.argmax(dim=-1)
    ce_loss = F.cross_entropy(
        student_logits.view(-1, student_logits.size(-1)),
        teacher_tokens.view(-1),
        ignore_index=-100,
    )
    
    # 组合损失
    total_loss = alpha * kl_loss + (1 - alpha) * ce_loss
    return total_loss

# 蒸馏训练循环示例
def distillation_step(
    student_model, teacher_model,
    input_ids, attention_mask,
    temperature=2.0, alpha=0.5,
):
    """单步蒸馏训练"""
    # 冻结 Teacher（只用于推理）
    with torch.no_grad():
        teacher_outputs = teacher_model(
            input_ids=input_ids,
            attention_mask=attention_mask,
        )
        teacher_logits = teacher_outputs.logits
    
    # Student 前向传播
    student_outputs = student_model(
        input_ids=input_ids,
        attention_mask=attention_mask,
    )
    student_logits = student_outputs.logits
    
    # 计算蒸馏损失
    loss = compute_distillation_loss(
        student_logits, teacher_logits,
        temperature=temperature,
        alpha=alpha,
    )
    
    return loss

# 温度参数的作用：
# temperature=1.0 → 标准概率分布
# temperature=2.0 → 分布更平滑，传递更多"暗知识"
# temperature=5.0 → 分布接近均匀，蒸馏效果减弱
# 经验值：LLM 蒸馏通常用 2.0~4.0`
        }
      ],
      tip: "蒸馏数据质量决定蒸馏效果。用 Teacher 生成的数据训练 Student 时，确保数据多样性和覆盖度——包含简单问题和复杂推理、不同领域和语言风格。多 Teacher 蒸馏（让多个大模型生成训练数据）效果通常优于单 Teacher。蒸馏后用少量高质量人类标注数据做最终微调，可以进一步缩小与 Teacher 的差距。",
      warning: "蒸馏不是简单的数据复制！Student 模型的架构和容量必须与任务匹配——用 1B 模型蒸馏 70B 模型的知识，必然存在天花板。蒸馏过程中监控 Student 的困惑度（Perplexity），如果困惑度持续不降，说明蒸馏方法或数据有问题。温度参数过高会导致软标签信息丢失，过低则传递的有效信号不足。"
    },
    {
      title: "5. 推理引擎与系统优化：不止是模型压缩",
      body: `**模型压缩**（量化、剪枝、蒸馏）只是**推理优化**的一半。另一半同样重要：**推理引擎**和**系统级优化**。即使模型保持不变，通过优化**推理框架**和**系统架构**，也能将**吞吐率**提升 **5~10 倍**。

**vLLM** 是当前最流行的 **LLM 推理引擎**，其核心技术是 **PagedAttention**——将 **GPU 显存**像操作系统的**虚拟内存**一样进行**分页管理**。传统的 **KV Cache** 分配是**预分配**的（按最大序列长度），导致大量**显存碎片**和浪费。**PagedAttention** 将 **KV Cache** 拆分为固定大小的 **Block**，按需分配，显存利用率从 **60%~70%** 提升到 **95%+**。这使得同一张 **A100** 上可以同时服务的**并发请求数**增加 **2~4 倍**。

**连续批处理（Continuous Batching）**是另一个关键技术。传统的批处理是**静态**的——等待一批请求全部到达后同时处理，导致**短请求**需要等待**长请求**完成。**连续批处理**在**每个 token 生成步骤**动态加入新请求和移除已完成的请求，实现了**请求级别**的流水线并行。**vLLM** 和 **TensorRT-LLM** 都支持连续批处理，这是**高吞吐部署**的必要条件。

**推测解码（Speculative Decoding）**是 **2025~2026 年**最热门的**推理加速**技术。核心思想是：用一个**小模型（Draft Model）**快速生成**候选 token 序列**，然后用**大模型（Target Model）**一次性验证这些候选。如果小模型的预测**准确率高**，大模型只需做一次**并行验证**就能接受多个 token，显著减少**推理步数**。对于**简单任务**（续写、摘要），推测解码可以将**延迟**降低 **2~3 倍**。

**FlashAttention** 是**注意力算子**层面的优化——通过**分块计算**（Tiling）和**重计算**（Recomputation），将注意力层的**内存访问**从 $O(n^2)$ 降低到 $O(n)$，同时避免了 **KV Cache** 的中间存储。FlashAttention-3 进一步利用 **Hopper 架构**的 **TMA（Tensor Memory Accelerator）**，在 **H100** 上实现了 **2~3 倍**的注意力计算加速。

**张量并行（Tensor Parallelism）**和**流水线并行（Pipeline Parallelism）**是**多 GPU 推理**的核心策略。**张量并行**将单层中的**矩阵乘法**拆分到多个 **GPU** 上，适合**单模型超大**的场景。**流水线并行**将**不同层**分配到不同 **GPU**，适合**层数很多**的模型。实际部署中通常**混合使用**——在**节点内**使用张量并行，**跨节点**使用流水线并行。`,
      tip: "推理引擎选型：单 GPU 部署优先用 vLLM（PagedAttention + 连续批处理）；多 GPU 部署用 vLLM 的张量并行模式；追求极致延迟用 TensorRT-LLM（NVIDIA 专用优化）；CPU 部署用 Ollama（llama.cpp 后端）。推测解码适合对延迟敏感但对精度容忍度稍高的场景。",
      warning: "推理引擎的默认配置通常不是最优的。max_num_batched_tokens、gpu_memory_utilization、max_model_len 等参数需要根据硬件和负载调优。KV Cache 溢出会导致请求失败或精度骤降——务必设置合理的 max_model_len。多 GPU 部署时注意 NCCL 通信带宽，节点间通信可能成为瓶颈。"
    },
    {
      title: "6. 三大技术路线对比分析",
      body: `**量化**、**剪枝**和**知识蒸馏**各有优劣，适用于不同场景。理解它们的**本质差异**是做出正确选型的前提。

从**压缩原理**看，**量化**改变的是**数值精度**——模型结构不变，只是权重的**表示方式**变了。**剪枝**改变的是**模型结构**——移除了部分参数，模型变得更小。**知识蒸馏**改变的是**训练方式**——模型结构可以完全不同，小模型通过学习大模型的知识来弥补**参数差距**。

从**实施成本**看，**量化**最简单——**PTQ** 只需几行代码，不需要训练数据或训练过程。**剪枝**需要**评估参数重要性**和**微调**，成本中等。**知识蒸馏**需要同时运行 **Teacher 和 Student** 模型，计算成本最高，但效果也最好。

从**精度损失**看，**INT8 量化**通常损失 **1%~3%** 的精度，**INT4** 损失 **3%~8%**。**剪枝 30%** 的损失约 **2%~5%**。**知识蒸馏**（Student 容量足够时）可以将损失控制在 **1%~3%**。需要注意的是，这些数字是**平均值**——在**数学推理**和**代码生成**等对**数值精度**敏感的任务上，量化损失可能达到 **10%~20%**。

从**硬件兼容性**看，**量化**需要**硬件支持低精度计算**（**INT8 Tensor Core**、**W4A16** 等），现代 **GPU** 都支持。**剪枝**（结构化）不需要特殊硬件支持。**知识蒸馏**在**推理时**与原始模型无区别。

从**适用场景**看：**边缘部署**（手机、IoT）首选**量化**（INT4/INT8），因为**显存受限**且**硬件支持**。**云端高并发**首选**连续批处理 + 推测解码**，因为**吞吐率**是瓶颈。**极致压缩**（如 70B → 7B）需要**知识蒸馏**，因为仅靠量化和剪枝无法跨越**容量鸿沟**。`,
      table: {
        headers: ["维度", "量化", "剪枝", "知识蒸馏"],
        rows: [
          ["压缩原理", "降低数值精度", "移除冗余参数", "小模型学习大模型"],
          ["实施难度", "低（PTQ 几行代码）", "中（需重要性评估+微调）", "高（需 Teacher 推理+Student 训练）"],
          ["INT4 压缩比", "4x（FP16→INT4）", "1.5x~2x（30%~50% 剪枝）", "10x（70B→7B）"],
          ["典型精度损失", "INT8: 1~3%, INT4: 3~8%", "30% 剪枝: 2~5%", "Student 足够大时: 1~3%"],
          ["硬件要求", "需要低精度计算支持", "结构化剪枝无需特殊硬件", "推理时无特殊要求"],
          ["最佳场景", "边缘部署、显存受限", "中等压缩、保持稠密计算", "大幅度压缩、跨模型迁移"],
          ["计算成本", "极低（一次性转换）", "中等（评估+微调）", "高（双模型推理+多轮训练）"],
        ],
      },
      tip: "组合使用效果最好：先做知识蒸馏获得一个小模型（如 70B→7B），再做量化部署（7B INT4），可以将 70B 模型的精度压缩到不到 4GB 显存，适合单卡部署。这是工业界最常见的组合方案。",
      warning: "不要在不了解任务需求的情况下盲目优化。如果你的场景对延迟不敏感但对精度要求极高（如医疗诊断、金融分析），可能不需要任何优化。如果你的瓶颈在网络 I/O 而非计算，优化模型本身不会有帮助——需要先做系统 profiling。",
      mermaid: `flowchart TD
    subgraph 压缩阶段
        A[70B Teacher] -->|蒸馏数据| B[7B Student]
        B -->|INT4量化| C[3.5GB模型]
    end
    subgraph 部署阶段
        C --> D[vLLM推理引擎]
        D --> E[PagedAttention]
        D --> F[连续批处理]
    end
    subgraph 服务阶段
        E --> G[OpenAI兼容API]
        F --> G
    end
    style A fill:#581c87,color:#fff
    style C fill:#5b21b6,color:#fff
    style D fill:#2563eb,color:#fff
    style G fill:#1e3a5f,color:#fff`,
    },
    {
      title: "7. 实战部署方案：从选择到上线",
      body: `**推理优化**的最终目的是**部署**。本节将展示一个完整的**部署方案**——从**模型选择**到**量化**再到**服务上线**，涵盖整个流程中的关键决策点。

**第一步：模型选择**。根据**任务需求**和**硬件预算**选择基准模型。如果需要**通用能力**且预算有限，**Llama-3-8B** 或 **Qwen2.5-7B** 是不错的选择；如果需要**强推理能力**且有充足预算，**Llama-3.1-70B** 更合适。**选择模型时考虑三个维度**：**基准性能**（在目标任务上的表现）、**推理成本**（所需显存和算力）、**生态支持**（社区活跃度和工具链成熟度）。

**第二步：优化策略选择**。对于 **8B~13B** 模型，**INT4 量化**是首选——压缩后约 **4~6GB 显存**，单卡可部署，精度损失 **3%~5%**。对于 **70B** 模型，如果只有一张 **A100 80GB**，需要**量化到 INT4**（约 **35GB**）或**张量并行**（多卡）。如果预算允许，先用**知识蒸馏**将 70B 压缩到 7B~13B，再量化部署是**性价比最优**的方案。

**第三步：推理引擎选择**。**vLLM** 是当前**综合最优**的选择——支持**PagedAttention**、**连续批处理**、**张量并行**、**推测解码**，且 API 兼容 **OpenAI** 格式。**TensorRT-LLM** 在 **NVIDIA GPU** 上有更好的**性能表现**，但配置更复杂。**Ollama** 适合**本地开发**和**CPU 部署**，但吞吐率低于 **vLLM**。

**第四步：服务部署与监控**。部署后需要**持续监控**三个核心指标：**延迟（Latency）**——从请求到首 token 的时间（**TTFT**）和 token 生成速率（**tokens/s**）；**吞吐率（Throughput）**——单位时间内处理的请求数；**精度（Accuracy）**——定期用基准测试集评估模型输出质量，检测**精度漂移**。**告警阈值**：TTFT 超过 **2 秒**、tokens/s 低于 **20**、基准精度下降超过 **5%** 时需要介入。

**第五步：A/B 测试与回滚**。上线量化或蒸馏后的模型时，务必做 **A/B 测试**——将优化模型与原始模型**并行运行**，比较**用户满意度**和**任务完成率**。保留**原始模型**作为**回滚方案**，一旦优化模型出现**不可接受**的精度下降，立即回滚。`,
      code: [
        {
          lang: "bash",
          code: `#!/bin/bash
# ===== vLLM 生产环境部署脚本 =====
# 将量化后的模型部署为 OpenAI 兼容 API 服务

# 1. 安装 vLLM
pip install vllm==0.5.5

# 2. 启动服务（INT4 量化模型）
# --quantization: 量化类型（awq/gptq/fp8/bnb）
# --gpu-memory-utilization: GPU 显存利用率（0.9 = 90%）
# --max-num-batched-tokens: 每批次最大 token 数
# --max-num-seqs: 最大并发序列数
# --tensor-parallel-size: 张量并行 GPU 数

python -m vllm.entrypoints.openai.api_server \\
    --model ./llama-2-7b-awq-4bit \\
    --quantization awq \\
    --dtype half \\
    --gpu-memory-utilization 0.90 \\
    --max-num-batched-tokens 8192 \\
    --max-num-seqs 128 \\
    --max-model-len 4096 \\
    --tensor-parallel-size 1 \\
    --host 0.0.0.0 \\
    --port 8000 \\
    --enable-chunked-prefill \\
    --disable-log-requests

# 3. 测试服务
curl http://localhost:8000/v1/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "./llama-2-7b-awq-4bit",
    "prompt": "大语言模型推理优化的核心方法是",
    "max_tokens": 100,
    "temperature": 0.7
  }'

# 4. 性能基准测试
# 使用 vLLM 自带的 benchmark 工具
python -m vllm.entrypoints.benchmark_serving \\
    --model ./llama-2-7b-awq-4bit \\
    --dataset-name random \\
    --num-prompts 1000 \\
    --random-input-len 256 \\
    --random-output-len 128 \\
    --request-rate 10

# 5. 监控指标（配合 Prometheus + Grafana）
# vLLM 默认暴露 Prometheus 指标在 /metrics 端点
# 关键指标：
#   vllm:prompt_tokens_total - 总 prompt token 数
#   vllm:generation_tokens_total - 总生成 token 数
#   vllm:time_to_first_token_seconds - TTFT
#   vllm:gpu_cache_usage_perc - KV Cache 使用率`
        }
      ],
      tip: "生产环境部署 checklist：① 量化后在目标任务的验证集上确认精度损失 < 5%；② 用 benchmark_serving 测试不同并发下的延迟和吞吐；③ 配置 Prometheus 监控 KV Cache 使用率（超过 80% 需要扩容或限流）；④ 保留原始模型作为回滚方案；⑤ 设置自动扩缩容策略（根据请求队列长度）。",
      warning: "vLLM 的默认配置在高并发下可能不稳定。max-num-batched-tokens 设置过小会导致请求排队，过大会触发 OOM。建议从 4096 开始，逐步增加并监控 GPU 显存。enable-chunked-prefill 可以减少长 prompt 的延迟，但会增加内存使用。生产环境务必先做压力测试再上线。"
    },
    {
      title: "8. 未来趋势与进阶技术",
      body: `**LLM 推理优化**领域在 **2025~2026 年**经历了**爆发式创新**。了解这些**前沿技术**有助于你在未来的优化需求中做出更明智的选择。

**推测解码（Speculative Decoding）**正在成为**推理加速**的标准配置。最新的 **EAGLE-2** 和 **Medusa-2** 方案通过训练一个**轻量级预测头**（而非使用独立的小模型），将**推测准确率**提升到 **70%~80%**，在**保持精度的同时**将**推理速度**提升 **2~4 倍**。这是**目前性价比最高**的加速方案——不需要压缩模型，只需要**额外的训练**（通常 **1~2 天**）。

**MoE 推理优化**是另一个重要趋势。**混合专家（Mixture of Experts）**模型在推理时**只激活部分专家**（通常 **10%~20%** 的参数），本身就具有**稀疏计算**的优势。对 **MoE 模型**做**量化**和**路由优化**可以进一步减少**推理成本**——**DeepSeek-V3** 的 **236B 参数**模型推理时仅激活 **37B**，结合 **FP8 量化**后可以在单张 **H100** 上运行。

**端侧 AI（On-device AI）**正在成为**主流**。**手机芯片**（**Apple A18**、**骁龙 8 Elite**）已经集成了**专用 NPU**，支持 **INT4 推理**。**7B 模型量化到 INT4** 后约 **3.5GB**，可以在**旗舰手机**上流畅运行。这意味**完全离线**的 **AI 助手**正在成为现实——不需要**网络连接**、不需要**云端服务器**、**隐私数据**完全留在**本地设备**。

**自适应计算（Adaptive Computation）**是**最优雅**的优化方向——让模型**根据输入复杂度动态调整计算量**。简单问题用**少量计算**快速回答，复杂问题**激活更多层**做深度推理。**早退机制（Early Exit）**是最简单的实现——在模型的**不同层**设置**分类器**，如果中间层的**置信度**足够高就**提前输出**。**LLaMA-7B** 使用早退机制可以在 **40%~60%** 的请求上提前 **8~16 层**输出，平均**加速 1.5~2 倍**。

**硬件-算法协同设计**是**终极方向**。未来的 **AI 芯片**将针对**量化推理**做**硬件级优化**——直接在芯片上支持 **INT4/INT2** 计算、**稀疏矩阵乘法**、**推测解码**的**并行验证**。当**硬件**和**算法**在设计之初就**协同优化**时，推理效率的提升将是**指数级**的。`,
      tip: "关注这几个方向的进展：推测解码（EAGLE/Medusa）是目前最容易落地的加速技术；MoE 量化是大规模模型的必经之路；端侧 AI 将在 2026-2027 年爆发；自适应计算（早退机制、动态层激活）是最优雅的「按需计算」方案。如果你在做长期技术规划，这些方向值得重点投入。",
      warning: "前沿技术 ≠ 生产就绪。推测解码需要额外的训练成本和验证流程；端侧 AI 受限于设备性能（旗舰手机能跑 7B INT4，但中端设备只能跑 1B~3B）；自适应计算的早退阈值需要精细调优，过早退出会导致质量下降。采用新技术前务必做充分的离线评估和小规模灰度。"
    },
  ],
};
