import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-007",
    title: "LLM 推理优化：量化、剪枝、蒸馏",
    category: "llm",
    tags: ["推理优化", "量化", "LLM部署"],
    summary: "从 FP16 到 INT4，掌握大模型推理加速与压缩技术",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. 推理成本分析：内存、计算与延迟的三角博弈",
            body: `部署一个大语言模型，第一件事不是调参，而是搞清楚「资源账本」。LLM 推理的成本由三个维度构成：内存占用、计算量和延迟（首 token 时间 + 生成吞吐）。理解这三者的关系，是做出正确优化决策的前提。

内存是推理的第一道门槛。加载一个 70B 参数的 FP16 模型需要约 140GB 显存——这需要 2 张 A100 80GB，还不算 KV Cache。KV Cache 的大小随上下文长度线性增长，在 32K 上下文下可能额外消耗 20-40GB 显存。这意味着实际部署时，模型权重本身只是显存需求的一部分。

计算量决定了生成速度。每个 token 的生成需要一次完整的前向传播，涉及数百到数千亿次浮点运算。延迟则由两个阶段组成：Prefill 阶段（处理输入 prompt，计算密集型，GPU 利用率高）和 Decode 阶段（逐个 token 生成，内存带宽密集型，GPU 利用率通常不到 30%）。Decode 阶段之所以低效，是因为每一步都要从显存读取整个模型权重，却只产出很少的计算——这是典型的「内存墙」问题。`,
            code: [
                {
                    lang: "python",
                    code: `# LLM 显存占用估算
def estimate_memory(params_b: float, dtype: str,
                    context_len: int = 4096,
                    batch_size: int = 1) -> dict:
    """估算 LLM 推理显存占用（GB）"""
    # 模型权重
    bytes_per_param = {"FP32": 4, "FP16": 2, "INT8": 1, "INT4": 0.5}
    weight_mem = params_b * 1e9 * bytes_per_param[dtype] / 1e9

    # KV Cache: 2 * num_layers * hidden_size * context * batch * bytes
    # 近似公式：每 1B 参数约 0.5MB per token per batch
    kv_cache_mem = params_b * 0.5 * context_len / 1024 * batch_size / 1024

    # 激活值 + 其他开销（约 10-20% 额外）
    overhead = weight_mem * 0.15

    total = weight_mem + kv_cache_mem + overhead
    return {
        "weight_memory_gb": round(weight_mem, 1),
        "kv_cache_gb": round(kv_cache_mem, 1),
        "overhead_gb": round(overhead, 1),
        "total_gb": round(total, 1),
    }

# Llama-3-70B 在 FP16, 8K 上下文, batch=32
print(estimate_memory(70, "FP16", 8192, 32))
# 输出: {'weight_memory_gb': 140.0, 'kv_cache_gb': 8.0,
#        'overhead_gb': 21.0, 'total_gb': 169.0}`
                },
                {
                    lang: "python",
                    code: `# 推理性能分析：Prefill vs Decode 阶段
import time
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def profile_inference(model_name: str, prompt: str,
                      gen_len: int = 128):
    """分析 Prefill 和 Decode 阶段的耗时与吞吐"""
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name, torch_dtype=torch.float16, device_map="auto"
    )

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    prompt_tokens = inputs.input_ids.shape[1]

    # Prefill 阶段计时
    torch.cuda.synchronize()
    t0 = time.perf_counter()
    with torch.no_grad():
        outputs = model.generate(
            **inputs, max_new_tokens=gen_len, use_cache=True
        )
    torch.cuda.synchronize()
    total_time = time.perf_counter() - t0

    generated_tokens = outputs.shape[1] - prompt_tokens
    decode_tokens = generated_tokens - 1  # 第一个 token 算 prefill

    print(f"Prefill: {prompt_tokens} tokens 输入")
    print(f"生成: {generated_tokens} tokens")
    print(f"总耗时: {total_time:.2f}s")
    print(f"生成吞吐: {generated_tokens / total_time:.1f} tokens/s")`
                }
            ],
            table: {
                headers: ["模型规模", "FP16 权重", "INT8 权重", "INT4 权重", "KV Cache (4K ctx)"],
                rows: [
                    ["7B", "14 GB", "7 GB", "3.5 GB", "~200 MB"],
                    ["13B", "26 GB", "13 GB", "6.5 GB", "~400 MB"],
                    ["70B", "140 GB", "70 GB", "35 GB", "~2 GB"],
                    ["405B", "810 GB", "405 GB", "202 GB", "~12 GB"],
                ]
            },
            mermaid: `graph TD
    A["推理请求"] --> B["Prefill 阶段"]
    B -->|"计算密集型
GPU 利用率高"| C["首 Token 延迟"]
    C --> D["Decode 阶段"]
    D -->|"内存带宽瓶颈
GPU 利用率 < 30％"| E["逐 Token 生成"]
    E --> F["KV Cache 增长"]
    F --> G{达到最大长度?}
    G -->|否| D
    G -->|是| H["输出完整响应"]`,
            tip: "优化推理延迟时，优先关注 Decode 阶段的内存带宽瓶颈——量化是最直接有效的手段，因为它直接减少了每次前向传播的数据搬运量。",
            warning: "估算显存时不要忽略 KV Cache——高并发（大 batch size + 长上下文）下，KV Cache 可能超过模型权重本身的显存占用，导致 OOM。"
        },
        {
            title: "2. 量化基础：从 FP32 到 INT4 的精度压缩之路",
            body: `量化是 LLM 推理优化中最核心的技术之一。它的基本思想是将模型权重从高精度浮点数（FP32/FP16/BF16）映射到低精度整数（INT8/INT4），从而减少显存占用和数据搬运量。

量化的本质是「用更少的比特表示同样的信息」。FP32 用 32 位表示一个数，INT8 只用 8 位——数据量直接减少到 1/4。但精度不是白丢的：INT8 只能表示 256 个离散值，而 FP16 能表示 65536 个。关键问题是如何在有限的位数内尽可能保留原始分布的信息。

量化方法按训练阶段分为三类：训练感知量化（QAT，在训练中模拟量化噪声，精度最高但成本极高）、训练后量化（PTQ，不需要训练数据或只需少量校准数据，性价比高）、动态量化（推理时逐层动态计算量化参数，灵活但引入额外计算开销）。对于 LLM，PTQ 是目前最主流的方案——因为它不需要重新训练数百亿参数的模型。`,
            code: [
                {
                    lang: "python",
                    code: `# 基础对称量化：FP32 → INT8
import torch
import numpy as np

def symmetric_quantize(weight: torch.Tensor) -> tuple:
    """对称 INT8 量化 - 最基本的量化方法"""
    # 找到缩放因子：s = max(|W|) / 127
    scale = weight.abs().max() / 127.0
    # 量化：W_int = round(W / s)，裁剪到 [-128, 127]
    int_weight = torch.round(weight / scale).clamp(-128, 127).to(torch.int8)
    return int_weight, scale

def symmetric_dequantize(int_weight: torch.Tensor,
                         scale: torch.Tensor) -> torch.Tensor:
    """反量化恢复"""
    return int_weight.float() * scale

# 演示：量化一个 1000x1000 的权重矩阵
original = torch.randn(1000, 1000)
int8_w, scale = symmetric_quantize(original)
recovered = symmetric_dequantize(int8_w, scale)
mse = ((original - recovered) ** 2).mean().item()
print(f"量化 MSE: {mse:.6f}")  # 通常 < 0.001
print(f"压缩比: {original.element_size() / int8_w.element_size()}x")`
                },
                {
                    lang: "python",
                    code: `# 非对称量化 + 逐通道量化（per-channel）
def per_channel_symmetric_quantize(
    weight: torch.Tensor  # 形状: [out_features, in_features]
) -> tuple:
    """逐通道 INT8 量化 - LLM 量化的标准做法
    
    每个输出通道使用独立的缩放因子，
    比逐张量量化（per-tensor）精度高得多。
    """
    # 沿着输出通道维度计算 scale
    scale = weight.abs().amax(dim=1, keepdim=True) / 127.0
    int_weight = torch.round(weight / scale).clamp(-128, 127).to(torch.int8)
    return int_weight, scale.squeeze(1)

# INT4 量化（AWQ 风格：分组量化）
def groupwise_int4_quantize(weight: torch.Tensor,
                            group_size: int = 128) -> tuple:
    """分组 INT4 量化 - 每 128 个权重共享一个 scale"""
    # 重塑为 [num_groups, group_size]
    num_groups = weight.numel() // group_size
    w_reshaped = weight[:num_groups * group_size].reshape(num_groups, group_size)
    
    # 每组计算缩放因子（INT4 范围: [-8, 7]）
    scale = w_reshaped.abs().amax(dim=1, keepdim=True) / 7.0
    int4_w = torch.round(w_reshaped / scale).clamp(-8, 7).to(torch.int8)
    return int4_w, scale.squeeze(1)`
                }
            ],
            table: {
                headers: ["精度", "位数", "取值范围", "显存占用", "精度损失"],
                rows: [
                    ["FP32", "32 bit", "±3.4×10³⁸", "4 bytes/参数", "无（基准）"],
                    ["BF16/FP16", "16 bit", "±65504", "2 bytes/参数", "极低"],
                    ["INT8", "8 bit", "[-128, 127]", "1 byte/参数", "低（< 1% 准确率下降）"],
                    ["INT4", "4 bit", "[-8, 7]", "0.5 bytes/参数", "中等（1-3% 下降）"],
                ]
            },
            mermaid: `graph LR
    A["FP32 权重"] -->|"除以 scale"| B["浮点值"]
    B -->|"四舍五入"| C["整数值"]
    C -->|"裁剪到范围"| D["INT8/INT4"]
    D -->|"存储 + 推理"| E["反量化恢复"]
    E -->|"乘回 scale"| F["近似 FP32"]
    class F s1
    class D s0
    classDef s0 fill:#14532d
    classDef s1 fill:#78350f,color:#f1f5f9,color:#1e293b`,
            tip: "对 LLM 做量化时，优先使用逐通道（per-channel）量化而非逐张量（per-tensor）量化——逐通道的精度损失通常只有逐张量的 1/3 到 1/5，因为每层不同通道的权重分布差异很大。",
            warning: "直接对 Embedding 层和 LM Head 做量化会导致显著的精度下降。这两个层对数值精度极为敏感，建议保持 FP16 不变，只量化中间的 Linear 层。"
        },
        {
            title: "3. GPTQ 与 AWQ：后训练量化的工业级方案",
            body: `GPTQ 和 AWQ 是目前最主流的两个 LLM 后训练量化框架。它们解决了同一个核心问题：如何在不需要完整重新训练的前提下，将大模型压缩到 INT4 甚至更低精度，同时保持接近原始模型的性能。

GPTQ（GPT-Quantized）的核心思路是逐层量化。它按顺序处理每一层：先将该层的权重从 FP16 量化到目标精度，然后用一小批校准数据（通常 128 个样本）计算量化误差，再用类似 OBD（最优脑损伤）算法的方法补偿误差——即利用 Hessian 矩阵的逆来找到最优的权重修正方向。GPTQ 的巧妙之处在于它把复杂的量化问题分解为一系列单层优化子问题，每层只处理一次，大大降低了计算复杂度。

AWQ（Activation-aware Weight Quantization）则从一个不同的视角出发：不是所有权重都同等重要。AWQ 通过分析激活值发现，只有约 1% 的权重（那些对应高激活值的权重）对输出影响巨大，其余权重即使量化误差较大也不影响最终精度。基于这个发现，AWQ 对这 1% 的「关键权重」保留高精度，其余权重做 aggressive 量化——这就是所谓的「激活感知量化」。AWQ 在 4-bit 量化下通常比 GPTQ 精度更高，特别是在困惑度（perplexity）指标上。`,
            code: [
                {
                    lang: "python",
                    code: `# 使用 AutoGPTQ 量化 Llama 模型
from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig
from transformers import AutoTokenizer
import logging

logging.basicConfig(level=logging.INFO)

model_path = "meta-llama/Llama-2-7b-hf"
quantized_path = "llama-2-7b-int4-gptq"

# 加载模型和分词器
tokenizer = AutoTokenizer.from_pretrained(model_path)
quantize_config = BaseQuantizeConfig(
    bits=4,              # 量化到 4 bit
    group_size=128,      # 分组大小
    damp_percent=0.01,   # 阻尼因子，防止数值不稳定
    desc_act=False,      # 不启用激活重排序（更快但精度略低）
)

model = AutoGPTQForCausalLM.from_pretrained(
    model_path, quantize_config, device_map="auto"
)

# 准备校准数据（WikiText 或领域数据）
from datasets import load_dataset
data = load_dataset("wikitext", "wikitext-2-raw-v1", split="train[:1024]")
examples = tokenizer("\\n\\n".join(data["text"][:128]),
                     return_tensors="pt", max_length=2048,
                     truncation=True)

# 执行量化（GPU 上约 10-30 分钟）
model.quantize(examples, cache_examples_on_gpu=True)
model.save_quantized(quantized_path)`
                },
                {
                    lang: "python",
                    code: `# 使用 AutoAWQ 量化模型（激活感知量化）
from awq import AutoAWQForCausalLM
from transformers import AutoTokenizer

model_path = "meta-llama/Llama-2-7b-hf"
quantized_path = "llama-2-7b-int4-awq"

tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoAWQForCausalLM.from_pretrained(model_path)

# AWQ 量化配置
quant_config = {
    "zero_point": True,    # 使用零点偏移
    "q_group_size": 128,   # 分组大小
    "w_bit": 4,            # 权重精度
    "version": "GEMM",     # 使用 GEMM 内核（兼容性好）
}

# AWQ 自动寻找最优量化策略
# 它会先分析激活值分布，然后保护关键权重
model.quantize(tokenizer, quant_config=quant_config)

# 保存量化模型
model.save_quantized(quantized_path)
tokenizer.save_pretrained(quantized_path)

# 加载量化模型进行推理
from awq import AutoAWQForCausalLM
quantized_model = AutoAWQForCausalLM.from_quantized(
    quantized_path, fuse_layers=True  # 融合层加速推理
)`
                }
            ],
            table: {
                headers: ["特性", "GPTQ", "AWQ", "BitsAndBytes (LLM.int8)"],
                rows: [
                    ["量化方法", "逐层误差补偿", "激活感知保护", "动态混合精度"],
                    ["目标精度", "INT4", "INT4", "INT8 + FP16 混合"],
                    ["校准数据", "需要（~128 样本）", "需要（~128 样本）", "不需要"],
                    ["量化速度", "较慢（Hessian 计算）", "较快", "极快（推理时量化）"],
                    ["INT4 精度", "优秀", "最优", "不支持"],
                    ["推理加速", "1.5-2.5x", "1.8-3.0x", "1.2-1.8x"],
                ]
            },
            mermaid: `graph TD
    A["FP16 模型"] --> B{"选择量化方案"}
    B -->|"需要最高精度"| C["AWQ"]
    B -->|"需要兼容性"| D["GPTQ"]
    B -->|"零校准数据"| E["BitsAndBytes"]
    C --> F["分析激活值"]
    D --> G["逐层量化 + Hessian"]
    E --> H["推理时动态量化"]
    F --> I["保护关键权重"]
    G --> I
    H --> I
    I --> J["INT4 量化模型"]
    J --> K["推理部署"]`,
            tip: "AWQ 的 fuse_layers=True 选项可以合并相邻层的量化/反量化操作，减少 kernel launch 开销，推理速度可再提升 10-20%。",
            warning: "GPTQ 量化过程中如果 damp_percent 设置过小（< 0.005），Hessian 矩阵可能病态导致数值爆炸；设置过大（> 0.1）则过度平滑，精度损失增大。0.01 是一个安全的起点。"
        },
        {
            title: "4. 模型剪枝：结构化与非结构化的取舍",
            body: `剪枝和量化虽然都是压缩模型的手段，但它们的思路完全不同。量化是「降低每个参数的精度」，而剪枝是「直接删除一些参数」。如果量化是把 32 位数字变成 4 位，剪枝就是把某些参数直接变成零。

非结构化剪枝（Unstructured Pruning）逐个检查权重的重要性（通常用绝对值大小作为代理指标），将不重要的权重设为零。这种方法能获得极高的稀疏率（90%+），但产生的稀疏矩阵是不规则的——标准的 GPU 矩阵乘法（GEMM）对不规则稀疏矩阵几乎没有加速效果，因为硬件还是按稠密矩阵的方式读取和计算。除非使用专门的稀疏推理引擎（如 TensorRT 的稀疏加速模式），否则非结构化剪枝主要是为了减少模型文件大小，而非加速推理。

结构化剪枝（Structured Pruning）则更加「暴力」——它直接删除整行/整列权重（对应神经元或注意力头），甚至整层。这种方式保持了矩阵的稠密结构，因此可以在标准硬件上直接获得加速。但代价是：删除一个神经元的影响远大于删除单个权重，所以结构化剪枝通常只能达到 30-50% 的压缩率，过高会导致模型能力急剧退化。对于 LLM，剪枝通常针对注意力头（Attention Heads）和 MLP 中间维度（FFN hidden size）。`,
            code: [
                {
                    lang: "python",
                    code: `# 非结构化剪枝：L1 范数重要性剪枝
import torch
import torch.nn.utils.prune as prune

def magnitude_pruning(model: torch.nn.Module,
                      amount: float = 0.3):
    """基于权重大小的非结构化剪枝
    
    删除绝对值最小的 30% 权重
    """
    for name, module in model.named_modules():
        if isinstance(module, torch.nn.Linear):
            prune.l1_unstructured(
                module, name="weight", amount=amount
            )
            # 将掩码应用到权重上（永久剪枝）
            prune.remove(module, "weight")
    
    # 统计稀疏率
    total = 0
    zeros = 0
    for param in model.parameters():
        total += param.numel()
        zeros += (param == 0).sum().item()
    print(f"稀疏率: {zeros/total*100:.1f}%")
    return model

# 剪枝后需要微调（fine-tuning）来恢复精度
# 因为直接剪枝会导致精度下降 2-5%`
                },
                {
                    lang: "python",
                    code: `# 结构化剪枝：注意力头剪枝
def prune_attention_heads(model, heads_to_remove: int = 4):
    """从每个注意力层中删除最不重要的注意力头
    
    使用注意力权重的 L2 范数作为重要性指标
    """
    for layer in model.model.layers:
        attn = layer.self_attn
        num_heads = attn.num_heads
        head_dim = attn.head_dim
        
        # 计算每个注意力头的重要性
        # 这里使用 out_proj 权重作为代理
        out_weight = attn.o_proj.weight.data
        out_weight = out_weight.reshape(
            out_weight.shape[0], num_heads, head_dim
        )
        
        # 计算每个头的 L2 范数
        head_importance = out_weight.norm(dim=(0, 2))
        
        # 选择最不重要的头
        _, least_important = torch.topk(
            -head_importance, heads_to_remove
        )
        
        # 剪枝：将对应头的输出权重设为零
        for head_idx in least_important.tolist():
            start = head_idx * head_dim
            end = start + head_dim
            out_weight[:, head_idx, :] = 0
        
        attn.o_proj.weight.data = out_weight.reshape(
            out_weight.shape[0], -1
        )
    
    print(f"已剪枝 {heads_to_remove} 个注意力头/层")`
                }
            ],
            table: {
                headers: ["特性", "非结构化剪枝", "结构化剪枝", "混合剪枝"],
                rows: [
                    ["剪枝粒度", "单个权重", "神经元/注意力头/层", "多层级组合"],
                    ["稀疏率", "70-95%", "30-50%", "40-60%"],
                    ["标准 GPU 加速", "无（需要稀疏内核）", "有", "部分"],
                    ["精度保持", "好（微调后 < 1% 下降）", "中等（1-3% 下降）", "较好"],
                    ["适用场景", "模型压缩/存储", "推理加速", "兼顾压缩与速度"],
                    ["工具支持", "PyTorch prune", "LLM-Pruner / SlimPajama", "自定义"],
                ]
            },
            mermaid: `graph TD
    A["完整模型"] --> B["重要性评估"]
    B --> C{"剪枝策略"}
    C -->|"逐权重"| D["非结构化剪枝"]
    C -->|"整行/整列"| E["结构化剪枝"]
    D --> F["高稀疏率"]
    E --> G["保持稠密结构"]
    F --> H["需要稀疏推理引擎"]
    G --> I["标准硬件直接加速"]
    H --> J["剪枝后微调"]
    I --> J
    J --> K["部署"]`,
            tip: "对于 LLM，剪枝注意力头通常比剪枝 FFN 维度更安全——因为注意力头之间有一定的冗余（多个头可能学到类似的模式），而 FFN 层的每个神经元往往承载更独特的知识。",
            warning: "剪枝后必须做微调（fine-tuning），否则精度下降会非常明显。即使是 30% 的结构化剪枝，不微调也可能导致 5-10% 的准确率损失。微调数据不需要很多——1000-5000 条高质量样本通常足够。"
        },
        {
            title: "5. 知识蒸馏：让小模型继承大模型的能力",
            body: `知识蒸馏（Knowledge Distillation）的核心思想是：让一个大模型（教师模型）来「教」一个小模型（学生模型），使小模型在保持轻量化的的同时，尽可能复制大模型的能力。这是一种比从零训练高效得多的小模型训练方式。

蒸馏的基本流程是：对于同一批输入数据，先用教师模型生成输出（通常是 logits，即 softmax 之前的原始分数），然后让学生模型也生成输出。训练目标是让学生模型的输出尽可能接近教师模型的输出。这里的关键区别在于，蒸馏不仅让学生模仿「正确答案」（hard labels），还模仿教师的「思考方式」（soft labels）——教师模型对错误答案给出的概率分布包含了丰富的信息：哪些错误答案「接近正确」、哪些「完全不靠谱」，这些信息在 hard label 中全部丢失了。

对于 LLM，蒸馏有两种主流范式：白盒蒸馏（直接比较 logits，需要教师模型可访问）和黑盒蒸馏（用教师模型生成文本数据，然后对学生模型做 SFT）。TinyLLaMA 和 Microsoft Phi 系列是蒸馏成功的典范——Phi-3 仅用 3.8B 参数，通过高质量数据蒸馏，在多个基准上超越了参数量大 3-4 倍的开源模型。`,
            code: [
                {
                    lang: "python",
                    code: `# 白盒知识蒸馏：Logits 级蒸馏
import torch
import torch.nn.functional as F

def distillation_loss(student_logits: torch.Tensor,
                      teacher_logits: torch.Tensor,
                      labels: torch.Tensor,
                      temperature: float = 2.0,
                      alpha: float = 0.5):
    """知识蒸馏损失 = α * 蒸馏损失 + (1-α) * 标准交叉熵
    
    temperature 控制 soft target 的平滑程度：
    - T=1: 等价于标准交叉熵
    - T>1: 概率分布更平滑，传递更多信息
    """
    # Hard loss：学生对真实标签的交叉熵
    hard_loss = F.cross_entropy(student_logits, labels)
    
    # Soft loss：学生对教师 soft targets 的 KL 散度
    soft_teacher = F.softmax(teacher_logits / temperature, dim=-1)
    soft_student = F.log_softmax(student_logits / temperature, dim=-1)
    soft_loss = F.kl_div(soft_student, soft_teacher,
                         reduction="batchmean") * (temperature ** 2)
    
    return alpha * soft_loss + (1 - alpha) * hard_loss

# 训练循环示例
def distill_step(teacher, student, batch, optimizer):
    with torch.no_grad():
        teacher_out = teacher(batch["input_ids"]).logits
    student_out = student(batch["input_ids"]).logits
    
    loss = distillation_loss(
        student_out, teacher_out, batch["labels"],
        temperature=2.0, alpha=0.7
    )
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()`
                },
                {
                    lang: "python",
                    code: `# 黑盒蒸馏：用教师模型生成数据训练学生
from openai import OpenAI
from datasets import Dataset
from transformers import AutoModelForCausalLM, AutoTokenizer

client = OpenAI()

def generate_teacher_responses(
    questions: list[str],
    model: str = "gpt-4",
    system_prompt: str = "你是一位知识渊博的助手。"
) -> list[dict]:
    """用教师模型生成高质量训练数据"""
    dataset = []
    for q in questions:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": q},
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        dataset.append({
            "prompt": q,
            "response": response.choices[0].message.content,
        })
    return dataset

# 用学生模型在教师数据上做 SFT
def sft_student_model(student_path: str,
                      distilled_data: list[dict],
                      epochs: int = 3):
    from trl import SFTTrainer
    from transformers import TrainingArguments
    
    tokenizer = AutoTokenizer.from_pretrained(student_path)
    model = AutoModelForCausalLM.from_pretrained(
        student_path, device_map="auto"
    )
    
    dataset = Dataset.from_list(distilled_data)
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        args=TrainingArguments(
            per_device_train_batch_size=4,
            gradient_accumulation_steps=4,
            learning_rate=2e-5,
            num_train_epochs=epochs,
            fp16=True,
        ),
    )
    trainer.train()`
                }
            ],
            table: {
                headers: ["蒸馏方式", "需要教师模型在线?", "训练成本", "效果", "适用场景"],
                rows: [
                    ["Logits 蒸馏（白盒）", "是（每步推理）", "高", "最佳", "自有教师模型/本地训练"],
                    ["数据蒸馏（黑盒）", "否（一次性生成）", "中", "优秀", "API 教师模型（如 GPT-4）"],
                    ["输出层蒸馏", "是", "中", "较好", "分类任务"],
                    ["中间层蒸馏", "是", "极高", "最佳但难", "架构相似的学生模型"],
                ]
            },
            mermaid: `graph TD
    A["教师模型 (70B+)"] --> B{"蒸馏方式"}
    B -->|"白盒"| C["获取 Logits"]
    B -->|"黑盒"| D["生成文本数据"]
    C --> E["学生模型模仿 Logits"]
    D --> F["学生模型 SFT 学习"]
    E --> G["小模型 (1-7B)"]
    F --> G
    G --> H["推理加速 5-10x"]
    H --> I["精度保持 85-95％"]`,
            tip: "蒸馏时的 temperature 参数是关键超参数：T=1.5-3.0 通常效果最好。T 太小，soft label 趋近 hard label，丢失信息；T 太大，概率分布过于均匀，信号淹没在噪声中。",
            warning: "蒸馏数据的质量比数量更重要——用 10 万条 GPT-4 生成的高质量数据训练的小模型，通常比用 100 万条混合质量数据训练的效果更好。数据清洗（过滤低质量、不一致的回答）不可跳过。"
        },
        {
            title: "6. 推理引擎优化：vLLM 与 PagedAttention 的革命",
            body: `有了量化和蒸馏压缩后的模型，下一步是选择高效的推理引擎。推理引擎决定了你的模型能同时服务多少用户（吞吐）、每个用户等待多久（延迟）、以及显存利用率如何。

传统推理框架（如 HuggingFace Transformers 的 generate）在批处理时有一个严重问题：KV Cache 的显存分配是静态且碎片化的。为每个请求预分配最大长度的 KV Cache 空间，导致大量显存被浪费（大多数请求远不到最大长度就结束）。同时，不同请求的 KV Cache 在显存中分散存储，无法高效利用。

vLLM 的 PagedAttention 创新性地借鉴了操作系统的虚拟内存分页思想：将 KV Cache 划分为固定大小的「页」（blocks），按需动态分配，允许不连续的物理存储。这样，多个请求可以共享显存池，显存利用率从传统的 20-30% 提升到 80-90%。配合 Continuous Batching（连续批处理）——不等整个 batch 的请求都完成就动态插入新请求——vLLM 的吞吐比传统方案高出 10-24 倍。这是 2023-2024 年 LLM 推理领域最重要的系统级创新之一。`,
            code: [
                {
                    lang: "python",
                    code: `# 使用 vLLM 部署模型（异步 API）
from vllm import LLM, SamplingParams

# 初始化推理引擎
llm = LLM(
    model="meta-llama/Llama-2-7b-hf",
    tensor_parallel_size=1,      # GPU 数量
    max_num_seqs=256,            # 最大并发请求数
    gpu_memory_utilization=0.9,  # GPU 显存利用率
    trust_remote_code=True,
)

# 采样参数
sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=512,
    stop=["</s>", "\\n\\n"],
)

# 批量推理（Continuous Batching 自动处理）
prompts = [
    "解释量子纠缠的基本概念",
    "用 Python 写一个快速排序算法",
    "分析 2026 年 AI 行业的发展趋势",
]
outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    prompt = output.prompt
    generated = output.outputs[0].text
    print(f"输入: {prompt}")
    print(f"输出: {generated}")
    print(f"生成 tokens: {len(output.outputs[0].token_ids)}")`
                },
                {
                    lang: "python",
                    code: `# vLLM OpenAI 兼容服务器（生产部署）
# 启动命令：
# python -m vllm.entrypoints.openai.api_server \\
#   --model meta-llama/Llama-2-7b-hf \\
#   --tensor-parallel-size 2 \\
#   --max-model-len 8192 \\
#   --gpu-memory-utilization 0.9

# 客户端调用（兼容 OpenAI SDK）
from openai import OpenAI

# 指向 vLLM 服务器
client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="not-needed",  # vLLM 不验证 API key
)

# 流式响应
response = client.chat.completions.create(
    model="meta-llama/Llama-2-7b-hf",
    messages=[
        {"role": "user", "content": "什么是 PagedAttention？"},
    ],
    temperature=0.7,
    stream=True,  # 流式输出
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)`
                }
            ],
            table: {
                headers: ["引擎", "批处理", "显存利用率", "吞吐量", "特色功能"],
                rows: [
                    ["HF Transformers", "静态 batch", "20-30%", "基准 1x", "简单易用，生态完善"],
                    ["vLLM", "Continuous Batching", "80-90%", "10-24x", "PagedAttention，生产就绪"],
                    ["TGI (Text Generation\nInference)", "动态 batch", "60-70%", "5-10x", "HuggingFace 官方，容器化友好"],
                    ["TensorRT-LLM", "静态 + 动态", "70-80%", "8-15x", "NVIDIA 深度优化，INT8/FP8"],
                ]
            },
            mermaid: `graph TD
    A["推理请求队列"] --> B["PagedAttention
内存管理器"]
    B --> C["按需分配 KV Block"]
    C --> D["GPU 执行前向传播"]
    D --> E["Continuous Batching
调度器"]
    E -->|请求完成| F["释放 KV Block"]
    E -->|请求未完成| G["下一轮 Decode"]
    F --> B
    G --> B
    E -->|新请求插入| A`,
            tip: "vLLM 的 gpu_memory_utilization 参数建议设为 0.9-0.95——留太少显存会降低吞吐量，留太多可能导致 OOM。如果你的 GPU 还承担其他任务（如 embedding 模型），需要相应调低。",
            warning: "PagedAttention 的优势在高并发场景最明显（batch size > 32）。如果只有少量并发请求（< 8），vLLM 相比 HF Transformers 的吞吐提升可能不到 2x——因为 overhead 抵消了部分收益。"
        },
        {
            title: "7. 端侧部署：MLC-LLM 与 Ollama 让模型跑在手机和笔记本上",
            body: `当模型被压缩到足够小（7B INT4 约 3.5GB），它就不再需要数据中心级别的 GPU 了。端侧部署（Edge Deployment）让 LLM 可以在消费级硬件上运行：MacBook 的 M 系列芯片、甚至旗舰智能手机。这带来了两个核心优势：数据完全不出设备（隐私安全）和零 API 调用成本（离线可用）。

MLC-LLM（Machine Learning Compilation LLM）是一个跨平台的 LLM 推理框架，基于 Apache TVM 编译栈。它的核心思想是将模型编译为目标平台的原生代码——在 Mac 上编译为 Metal 内核，在 Windows 上编译为 Vulkan/CUDA，在 Android 上编译为 OpenCL。通过编译优化（算子融合、内存布局优化、自动调度），MLC-LLM 能在非 NVIDIA 硬件上获得接近最优的推理性能。

Ollama 则走了一条不同的路：它不追求极致的编译优化，而是专注于「开箱即用」的体验。Ollama 预编译了大量开源模型（Llama、Mistral、Qwen、Phi 等），用户只需一行命令即可下载和运行。在 Mac 上，Ollama 自动利用 Metal 框架进行 GPU 加速；在 Linux 上，它使用 CUDA 或 CPU 推理。Ollama 的 Modelfile 系统还支持自定义 prompt 模板、系统提示和参数配置，使得模型微调后的部署变得非常简单。`,
            code: [
                {
                    lang: "python",
                    code: `# 使用 MLC-LLM 编译和部署模型
# 编译步骤（在目标设备上）：
# mlc_llm compile Llama-2-7b-hf \\
#   --target metal \\
#   --quantization q4f16_1 \\
#   --output llama2-7b-q4-metal.so

# Python 推理
from mlc_llm import MLCEngine

# 加载已编译的模型
engine = MLCEngine(
    model="dist/Llama-2-7b-hf-q4f16_1-MLC",
    model_lib="./llama2-7b-q4-metal.so"
)

# 流式生成
for delta in engine.chat.completions.create(
    messages=[{"role": "user", "content": "解释 MLC-LLM 的优势"}],
    stream=True,
    max_tokens=256,
):
    if delta.choices[0].delta.content:
        print(delta.choices[0].delta.content, end="", flush=True)

# 性能统计
stats = engine.stats()
print(f"预填充速度: {stats['prefill']} token/s")
print(f"生成速度: {stats['decode']} token/s")`
                },
                {
                    lang: "python",
                    code: `# Ollama Python SDK 集成
from ollama import chat, ChatResponse

# 简单对话
response: ChatResponse = chat(
    model="llama3.1:8b-instruct-q4_K_M",
    messages=[
        {"role": "system", "content": "你是一个专业的技术顾问。"},
        {"role": "user", "content": "我应该选择哪个 LLM 推理框架？"},
    ],
    stream=False,
    options={
        "temperature": 0.7,
        "top_p": 0.9,
        "num_ctx": 4096,    # 上下文长度
        "num_gpu": 99,      # 尽可能使用 GPU
    },
)
print(response.message.content)

# 流式对话
for part in chat(
    model="llama3.1:8b",
    messages=[{"role": "user", "content": "写一首关于代码的诗"}],
    stream=True,
):
    print(part.message.content, end="", flush=True)

# 列出本地可用模型
import subprocess
result = subprocess.run(["ollama", "list"], capture_output=True, text=True)
print(result.stdout)`
                }
            ],
            table: {
                headers: ["平台", "MLC-LLM", "Ollama", "llama.cpp"],
                rows: [
                    ["部署方式", "编译为目标平台", "预编译模型包", "纯 C++ 单二进制"],
                    ["Mac Metal", "支持（编译后）", "原生支持", "原生支持"],
                    ["Windows CUDA", "支持", "支持", "支持"],
                    ["Android/iOS", "原生支持", "不支持", "支持（有限）"],
                    ["模型数量", "需手动编译", "100+ 预编译", "需手动下载"],
                    ["使用门槛", "高（需编译知识）", "极低（一行命令）", "低"],
                ]
            },
            mermaid: `graph TD
    A["训练好的模型"] --> B{"部署目标"}
    B -->|"Mac / 手机"| C["MLC-LLM"]
    B -->|"快速体验"| D["Ollama"]
    B -->|"极致轻量"| E["llama.cpp"]
    C --> F["编译 Metal/Vulkan/OpenCL"]
    D --> G["一键下载运行"]
    E --> H["GGUF 格式加载"]
    F --> I["端侧推理
离线 + 隐私"]
    G --> I
    H --> I
    I --> J["应用集成
SDK / API"]`,
            tip: "在 Mac M 系列芯片上运行 7B INT4 模型，MLC-LLM 和 llama.cpp 的推理速度通常在 15-30 tokens/s——足够流畅的对话体验。13B INT4 约 8-15 tokens/s，仍可接受。",
            warning: "端侧部署最大的瓶颈是内存（RAM）而非显存。MacBook 的统一内存虽然可以被 GPU 直接使用，但如果系统同时运行多个应用（浏览器、IDE 等），可用内存可能不足以加载大模型。建议至少 16GB 内存运行 7B 模型，32GB 运行 13B 模型。"
        },
    ],
};
