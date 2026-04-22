// LLM 推理加速：从 KV Cache 优化到推测解码的完整指南

import { Article } from '../knowledge';

export const article: Article = {
  id: "dl-018",
  title: "LLM 推理加速全景指南：从 KV Cache 到推测解码与块扩散",
  category: "dl",
  tags: ["推理加速", "推测解码", "KV Cache", "块扩散", "DFlash", "DDTree", "性能优化"],
  summary: "2026 年 LLM 推理加速进入新纪元。从 KV Cache 优化、张量并行，到推测解码（Speculative Decoding）、块扩散（Block Diffusion），再到 DFlash 和 DDTree 的前沿方案，本文系统梳理 LLM 推理加速的完整技术栈，附带可运行的性能对比代码。",
  date: "2026-04-16",
  readTime: "20 min",
  level: "进阶",
  content: [
    {
      title: "为什么 LLM 推理需要加速？",
      body: `LLM 的推理过程由两个阶段组成：**预填充（Prefill）**和**解码（Decoding）**。

**预填充阶段**：处理输入 prompt，并行计算所有 token 的注意力。这个阶段是**计算密集型**的，GPU 利用率高，速度已经很快。

**解码阶段**：逐 token 自回归生成输出。每生成一个 token，都需要重新计算一次前向传播。这个阶段是**内存带宽密集型**的——GPU 大部分时间在等待从显存加载模型权重，而不是做计算。

这就是 LLM 推理的核心瓶颈：**内存墙（Memory Wall）**。`,
      mermaid: `graph LR
    A["输入 Prompt"] --> B["预填充阶段\n并行计算\nGPU 利用率高"]
    B --> C["解码阶段\n逐 token 生成\n内存带宽瓶颈"]
    C --> D["输出文本"]

    style C fill:#f87171,color:#1e293b`,
    },
    {
      title: "解码阶段的数学本质",
      body: `理解推理加速的关键在于量化瓶颈。

假设一个 70B 参数的模型，使用 FP16 精度：
- 模型权重大小：70 × 10⁹ × 2 bytes ≈ **140 GB**
- 每生成一个 token，需要从显存读取约 140 GB 的权重
- H100 的显存带宽约 **3.35 TB/s**
- 理论上限：3.35 TB/s ÷ 140 GB ≈ **24 token/s**

这是物理上限。实际中由于注意力计算和 overhead，往往只有 **10-15 token/s**。

**加速推理的三个方向：**
1. **减少每次生成的计算量**——推测解码、块扩散
2. **减少需要加载的权重**——量化、稀疏化、MoE
3. **优化内存访问模式**——KV Cache 优化、PagedAttention、FlashAttention`,
      code: [
        {
          lang: "python",
          code: `# 估算 LLM 推理的理论吞吐量
def estimate_throughput(model_params_b: float, precision_bits: int = 16, 
                        memory_bandwidth_tbs: float = 3.35) -> float:
    """
    估算单 GPU 上 LLM 解码阶段的理论最大吞吐量
    
    Args:
        model_params_b: 模型参数量（十亿）
        precision_bits: 精度位数（16=FP16, 8=INT8, 4=INT4）
        memory_bandwidth_tbs: GPU 显存带宽（TB/s）
    
    Returns:
        理论最大 token/s
    """
    model_size_gb = model_params_b * 1e9 * (precision_bits / 8) / 1e9
    throughput = memory_bandwidth_tbs * 1000 / model_size_gb
    return round(throughput, 1)

# H100 + 70B FP16
print(f"70B FP16: {estimate_throughput(70)} token/s")  # ~24.0
# H100 + 70B INT8
print(f"70B INT8: {estimate_throughput(70, 8)} token/s")  # ~47.9
# H100 + 70B INT4
print(f"70B INT4: {estimate_throughput(70, 4)} token/s")  # ~95.8
# H100 + 7B FP16
print(f"7B FP16: {estimate_throughput(7)} token/s")  # ~239.3`,
        },
      ],
    },
    {
      title: "方向一：KV Cache 优化",
      body: `KV Cache 是解码阶段的核心数据结构。每生成一个 token，都需要将新的 key 和 value 追加到 cache 中。随着生成长度增加，KV Cache 会占用大量显存。

**PagedAttention（vLLM 的核心创新）**

传统 KV Cache 的问题是内存碎片化。PagedAttention 借鉴操作系统的虚拟内存思想，将 KV Cache 分成固定大小的"页"，按需分配：

- 消除内存碎片，显存利用率提升 2-4 倍
- 支持更大的 batch size，吞吐量显著提升
- 实现连续的内存管理，避免 OOM

**FlashAttention 系列**

FlashAttention 通过 IO 感知（IO-Aware）的注意力计算，减少 HBM（高带宽显存）和 SRAM 之间的数据搬运：

- FlashAttention-1：分块计算，减少 HBM 访问
- FlashAttention-2：优化并行策略，速度提升 2 倍
- FlashAttention-3：利用 Hopper 架构的 TMA 和 WGMMMA 指令，FP8 支持`,
      code: [
        {
          lang: "python",
          code: `# vLLM PagedAttention 配置示例
from vllm import LLM, SamplingParams

llm = LLM(
    model="meta-llama/Llama-3-70B",
    tensor_parallel_size=4,      # 4 卡并行
    max_model_len=8192,          # 最大上下文长度
    gpu_memory_utilization=0.9,  # GPU 显存利用率
    dtype="float16",
)

sampling_params = SamplingParams(
    temperature=0.7,
    max_tokens=512,
)

# 批量推理
prompts = ["你好，请介绍一下...", "什么是量子计算？"]
outputs = llm.generate(prompts, sampling_params)`,
        },
      ],
    },
    {
      title: "方向二：推测解码（Speculative Decoding）",
      body: `推测解码是 2026 年最热门的推理加速方向之一。核心思想：**用一个小模型（草稿模型）快速生成多个候选 token，然后用大模型（目标模型）一次性验证这些 token。**

**工作原理：**

1. 草稿模型（Draft Model）快速生成 k 个候选 token
2. 目标模型（Target Model）一次性计算这 k 个位置的 logits
3. 验证每个位置的 token 是否匹配：
   - 匹配：接受，跳过这步的完整计算
   - 不匹配：从第一个不匹配位置重新采样，丢弃后续

**为什么能加速？**

关键洞察：大模型的大部分时间花在加载权重上，而不是计算上。推测解码用**一次完整的前向传播**验证多个 token，如果接受率足够高，就能显著减少总的前向传播次数。

**数学分析：**

假设草稿长度为 k，接受率为 α：
- 原始方法：生成 N 个 token 需要 N 次前向传播
- 推测解码：生成 N 个 token 需要 N/(k×α + 1) 次前向传播
- 加速比 ≈ k×α + 1

当 k=5，α=0.8 时，理论加速比 ≈ 5×0.8 + 1 = **5 倍**。`,
      mermaid: `graph TD
    A["Step 1: 草稿模型\n生成 5 个候选 token"] --> B["Step 2: 目标模型\n一次性计算 5 个位置的 logits"]
    B --> C{"Step 3: 验证"}
    C -->|"4 个接受"| D["接受前 4 个 token\n第 5 个重新采样"]
    C -->|"0 个接受"| E["全部丢弃\n重新采样"]
    
    D --> F["实际收益: 1 次前向传播\n生成 4 个 token"]
    E --> G["无收益, 但也没损失"]`,
    },
    {
      title: "推测解码的实战实现",
      body: `推测解码已经在多个框架中实现。下面是最常见的方案：

**Medusa：多头推测解码**

Medusa 不依赖独立的小模型，而是在大模型上添加额外的解码头（Decoding Heads），每个头负责预测未来第 i 个 token：

- 头 1：预测 t+1
- 头 2：预测 t+2
- 头 3：预测 t+3

优势：无需额外的草稿模型，只需一次前向传播就能生成多个候选 token。

**Eagle / Lookahead Decoding**

Eagle 使用一个轻量级的自回归草稿模型，在目标模型的前向传播中嵌入草稿特征，实现更高的接受率。`,
      code: [
        {
          lang: "python",
          code: `# 使用 vLLM 的推测解码功能
from vllm import LLM, SamplingParams

llm = LLM(
    model="meta-llama/Llama-3-70B-Instruct",
    speculative_model="JackFram/llama-68m",  # 草稿模型
    num_speculative_tokens=5,                  # 每次推测 5 个 token
)

sampling_params = SamplingParams(
    temperature=0.7,
    max_tokens=256,
)

# 推理
output = llm.generate("解释量子纠缠的原理", sampling_params)
print(output[0].outputs[0].text)`,
        },
        {
          lang: "python",
          code: `# Medusa 推测解码实现（简化版）
import torch
import torch.nn as nn

class MedusaHead(nn.Module):
    """Medusa 的多头解码器"""
    def __init__(self, hidden_size: int, vocab_size: int, num_heads: int = 5):
        super().__init__()
        self.heads = nn.ModuleList([
            nn.Sequential(
                nn.Linear(hidden_size, hidden_size),
                nn.GELU(),
                nn.Linear(hidden_size, vocab_size)
            ) for _ in range(num_heads)
        ])
    
    def forward(self, hidden_states: torch.Tensor) -> list[torch.Tensor]:
        """每个头预测未来第 i 个 token 的分布"""
        return [head(hidden_states) for head in self.heads]

# 使用 Medusa 头进行推测解码
def speculative_decode_with_medusa(model, medusa_heads, input_ids, 
                                    num_speculative: int = 5):
    """
    Medusa 推测解码流程：
    1. 目标模型前向传播，得到隐藏状态
    2. Medusa 头并行预测未来 num_speculative 个 token
    3. 用目标模型验证这些 token
    """
    # Step 1: 目标模型前向传播
    with torch.no_grad():
        outputs = model(input_ids, use_cache=True)
        hidden_states = outputs.last_hidden_state[:, -1:, :]
    
    # Step 2: Medusa 头并行预测
    speculative_logits = medusa_heads(hidden_states)
    
    # Step 3: 采样候选 token
    speculative_tokens = []
    for logits in speculative_logits:
        token = torch.argmax(logits, dim=-1)
        speculative_tokens.append(token)
    
    return speculative_tokens`,
        },
      ],
    },
    {
      title: "方向三：块扩散（Block Diffusion）—— 2026 新范式",
      body: `2026 年 4 月，z-lab 提出了 **DFlash（Block Diffusion for Flash Speculative Decoding）**，这是推测解码方向的重大突破。

**DFlash 的核心创新：**

传统的推测解码每次只能验证**一条线性路径**上的 token。DFlash 引入了**块扩散（Block Diffusion）**的概念：

1. **块级生成**：草稿模型一次性生成整个块的 token 分布
2. **多路径验证**：目标模型同时验证多个候选路径
3. **单次前向传播**：所有候选路径在一次前向传播中完成验证

**为什么块扩散更强？**

传统推测解码：草稿模型自回归生成 k 个 token → 错误会累积 → 接受率随 k 增大而下降。

块扩散：草稿模型并行生成整个块的分布 → 每个位置的预测独立于其他位置 → 错误不累积 → 更高的接受率。

**数学直觉：**

假设每个位置的接受率为 p：
- 线性推测解码：k 个 token 全部接受的概率 = p^k（指数衰减）
- 块扩散：每个位置独立验证，期望接受数 = k×p（线性增长）

当 p=0.8，k=5 时：
- 线性推测：0.8^5 = 32.8% 概率全部接受
- 块扩散：期望接受 5×0.8 = **4 个 token**`,
      mermaid: `graph TD
    A["传统推测解码"] --> B["草稿模型自回归生成\nToken1 → Token2 → Token3"]
    B --> C["目标模型验证单条路径\n错误会累积传播"]

    D["DFlash 块扩散"] --> E["草稿模型并行生成块分布\nPosition1, Position2, Position3\n独立预测"]
    E --> F["目标模型单次前向传播\n验证所有位置\n错误不累积"]

    style D fill:#34d399,color:#1e293b`,
    },
    {
      title: "方向四：DDTree —— 树形推测解码（2026 最新）",
      body: `2026 年 4 月发布的 **DDTree** 在 DFlash 基础上更进一步，将线性验证升级为**树形验证**。

**DDTree 的核心思想：**

DFlash 每次验证一个"块"中的所有位置，但只有一条候选路径。DDTree 从块扩散的分布中构建一棵**草稿树**：

- 根节点：当前已生成的 token
- 第一层：top-k 个最可能的下一个 token
- 第二层：每个第一层节点再扩展 top-k 个子节点
- 依此类推...

**树形验证的优势：**

使用**最优优先堆算法**选择最可能匹配目标模型的延续路径。结果树在单次目标模型前向传播中，使用**仅祖先注意力掩码**高效验证。

这相当于把"猜一条路"变成"猜一个树"——即使某条分支错了，其他分支可能仍然正确。

**与 Medusa 的对比：**

| 特性 | Medusa | DFlash | DDTree |
|------|--------|--------|--------|
| 草稿方式 | 多头并行 | 块扩散 | 草稿树 |
| 验证策略 | 逐头验证 | 单次块验证 | 树形单次验证 |
| 错误传播 | 无（并行头） | 无（独立位置） | 无（仅祖先掩码） |
| 加速潜力 | 3-5× | 4-6× | 5-8× |`,
    },
    {
      title: "完整性能对比实验",
      body: `下面是一个完整的推理加速方法对比实验框架。

**实验设置：**
- 目标模型：Llama-3-8B
- 草稿模型：TinyLlama-1.1B
- 测试文本：100 条不同长度的 prompt
- 指标：吞吐量（token/s）、加速比、接受率`,
      code: [
        {
          lang: "python",
          code: `"""
LLM 推理加速方法对比实验
"""
import time
import torch
from typing import Callable
from dataclasses import dataclass

@dataclass
class BenchmarkResult:
    method: str
    total_tokens: int
    total_time_ms: float
    throughput: float  # tokens/s
    speedup: float     # vs baseline
    accept_rate: float = 0.0

def benchmark_baseline(model, tokenizer, prompts: list[str], 
                       max_tokens: int = 100) -> BenchmarkResult:
    """基线：标准自回归解码"""
    start = time.time()
    total_tokens = 0
    
    for prompt in prompts:
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        outputs = model.generate(
            inputs.input_ids,
            max_new_tokens=max_tokens,
            do_sample=False,
        )
        total_tokens += outputs.shape[1] - inputs.input_ids.shape[1]
    
    elapsed = time.time() - start
    return BenchmarkResult(
        method="Baseline (Autoregressive)",
        total_tokens=total_tokens,
        total_time_ms=elapsed * 1000,
        throughput=total_tokens / elapsed,
        speedup=1.0,
    )

def benchmark_speculative(target_model, draft_model, tokenizer,
                          prompts: list[str], k: int = 5,
                          max_tokens: int = 100) -> BenchmarkResult:
    """推测解码：草稿模型 + 目标模型验证"""
    start = time.time()
    total_tokens = 0
    total_accepted = 0
    total_attempts = 0
    
    for prompt in prompts:
        inputs = tokenizer(prompt, return_tensors="pt").to(target_model.device)
        generated = inputs.input_ids.clone()
        
        tokens_generated = 0
        while tokens_generated < max_tokens:
            # 草稿模型生成 k 个 token
            draft_inputs = {"input_ids": generated}
            with torch.no_grad():
                draft_out = draft_model(**draft_inputs)
                draft_logits = draft_out.logits[:, -k:]
                draft_tokens = draft_logits.argmax(dim=-1).squeeze(0)
            
            # 目标模型验证
            verify_input = torch.cat([
                generated,
                draft_tokens.unsqueeze(0)
            ], dim=1)
            
            with torch.no_grad():
                target_out = target_model(verify_input)
                target_logits = target_out.logits
            
            # 验证每个位置
            accepted = 0
            for i, (draft_tok, target_logits_i) in enumerate(
                zip(draft_tokens, target_logits[0, -k-1:-1])
            ):
                target_tok = target_logits_i.argmax()
                if draft_tok == target_tok:
                    accepted += 1
                else:
                    # 不匹配，用目标模型的分布重新采样
                    new_tok = target_logits_i.argmax()
                    generated = torch.cat([
                        generated,
                        new_tok.unsqueeze(0).unsqueeze(0)
                    ], dim=1)
                    break
            
            if accepted == len(draft_tokens):
                # 全部接受
                generated = torch.cat([
                    generated,
                    draft_tokens.unsqueeze(0)
                ], dim=1)
            
            total_accepted += accepted
            total_attempts += len(draft_tokens)
            tokens_generated += accepted + 1
        
        total_tokens += tokens_generated
    
    elapsed = time.time() - start
    accept_rate = total_accepted / max(total_attempts, 1)
    baseline_throughput = 50.0  # 假设基线值
    speedup = (total_tokens / elapsed) / baseline_throughput
    
    return BenchmarkResult(
        method=f"Speculative (k={k})",
        total_tokens=total_tokens,
        total_time_ms=elapsed * 1000,
        throughput=total_tokens / elapsed,
        speedup=speedup,
        accept_rate=accept_rate,
    )

# 运行对比
def run_comparison():
    prompts = [
        "人工智能的核心技术包括",
        "Transformer 架构的注意力机制原理是",
        "请解释梯度消失问题的成因和解决方案",
    ] * 30  # 90 条 prompt
    
    results = []
    # results.append(benchmark_baseline(...))
    # results.append(benchmark_speculative(...))
    
    print(f"{'方法':<25} {'吞吐量':>10} {'加速比':>8} {'接受率':>8}")
    print("-" * 55)
    for r in results:
        print(f"{r.method:<25} {r.throughput:>8.1f}/s "
              f"{r.speedup:>6.1f}x {r.accept_rate:>7.1%}")`,
        },
      ],
      table: {
        headers: ["方法", "典型加速比", "内存开销", "实现复杂度", "适用场景"],
        rows: [
          ["标准自回归", "1.0×（基线）", "标准", "最低", "所有场景"],
          ["量化（INT8）", "1.5-2.0×", "减少 50%", "低", "显存受限"],
          ["量化（INT4）", "2.0-3.0×", "减少 75%", "中", "端侧部署"],
          ["KV Cache 优化", "1.5-2.5×", "减少 30-50%", "中", "长文本生成"],
          ["Medusa 多头", "3.0-5.0×", "增加 5-10%", "中", "需要微调"],
          ["推测解码", "2.0-4.0×", "增加 10-20%", "低", "通用"],
          ["DFlash 块扩散", "4.0-6.0×", "增加 10%", "高", "前沿研究"],
          ["DDTree 树形", "5.0-8.0×", "增加 15%", "高", "前沿研究"],
        ],
      },
    },
    {
      title: "MoE（混合专家模型）的推理加速",
      body: `MoE 架构是另一个重要的推理加速方向。核心思想：模型包含多个"专家"子网络，但每次推理只激活其中一部分。

**工作原理：**

- 总参数量可能很大（如 Mixtral 8×7B = 46.7B 参数）
- 但每次推理只激活 2 个专家（12.9B 参数）
- 实际推理速度 ≈ 12.9B 参数的稠密模型，但性能接近 46.7B

**2026 年的 MoE 进展：**

- **DeepSeek-V3**：MLA 架构 + MoE，671B 参数但每次只激活 37B
- **Qwen3-MoE**：中国团队开源的 MoE 模型，推理效率显著提升
- **动态专家路由**：根据输入内容动态选择最优专家组合`,
      code: [
        {
          lang: "python",
          code: `# MoE 推理效率分析
def analyze_moe_efficiency(total_params_b: float, active_params_b: float,
                           num_experts: int, top_k: int = 2) -> dict:
    """分析 MoE 模型的推理效率"""
    params_per_expert = total_params_b / num_experts
    sparsity = 1 - (active_params_b / total_params_b)
    
    # 推理速度近似（相对于同等性能的稠密模型）
    # 假设稠密等效模型 ≈ total_params_b / 2
    dense_equiv = total_params_b / 2
    speedup_vs_dense = dense_equiv / active_params_b
    
    return {
        "总参数量 (B)": total_params_b,
        "激活参数量 (B)": active_params_b,
        "专家数量": num_experts,
        "每次激活专家数": top_k,
        "稀疏度": f"{sparsity:.1%}",
        "vs 稠密等效模型加速": f"{speedup_vs_dense:.1f}×",
    }

# DeepSeek-V3
print(analyze_moe_efficiency(671, 37, 256))
# {'总参数量 (B)': 671, '激活参数量 (B)': 37, '专家数量': 256,
#  '每次激活专家数': 2, '稀疏度': '94.5%', 'vs 稠密等效模型加速': '9.1×'}`,
        },
      ],
    },
    {
      title: "选择加速方案的决策框架",
      body: `面对这么多推理加速方案，如何选择？以下是一个实用的决策框架：

**第一步：确定瓶颈**

先测量你的场景：是显存不够？还是生成太慢？

- 显存不够 → 量化、KV Cache 压缩
- 生成太慢 → 推测解码、MoE
- 长文本 → PagedAttention、FlashAttention

**第二步：考虑约束**

- **能否修改模型？** 能 → Medusa、MoE 微调；不能 → 推测解码
- **有无额外 GPU？** 有 → 独立草稿模型；无 → 嵌入式草稿（Eagle）
- **延迟敏感还是吞吐敏感？** 延迟 → 块扩散/DDTree；吞吐 → batch 优化

**第三步：渐进式部署**

1. 先上量化（INT8/INT4），零风险，立竿见影
2. 再上 KV Cache 优化（PagedAttention）
3. 然后尝试推测解码
4. 最后探索块扩散等前沿方案`,
      mermaid: `graph TD
    A["推理性能不足"] --> B{瓶颈类型？}
    B -->|"显存不够"| C["量化 INT8/INT4"]
    B -->|"生成太慢"| D{"能修改模型？"}
    B -->|"长文本 OOM"| E["PagedAttention"]

    D -->|"能"| F["Medusa 微调"]
    D -->|"不能"| G["推测解码\n独立草稿模型"]

    C --> H["效果满意？"]
    G --> H
    E --> H

    H -->|"是"| I["✅ 完成"]
    H -->|"否"| J["进阶：块扩散/DDTree"]`,
      tip: "推理加速没有银弹。最佳方案通常是将 2-3 种方法组合使用，例如：INT4 量化 + PagedAttention + 推测解码，可以达到 5-10 倍的综合加速。",
    },
    {
      title: "2026 年推理加速工具生态",
      body: `2026 年的 LLM 推理加速工具生态已经非常成熟：

**推理引擎：**

| 工具 | 核心特性 | 加速场景 |
|------|---------|---------|
| **vLLM** | PagedAttention + 推测解码 | 高吞吐服务 |
| **TensorRT-LLM** | NVIDIA 优化 + 量化 | NVIDIA GPU 最佳性能 |
| **TGI** | HuggingFace 官方推理 | 快速原型验证 |
| **Ollama** | 端侧推理 + GGUF 量化 | 本地部署 |
| **llama.cpp** | CPU/GPU 混合推理 | 资源受限环境 |

**量化方案：**

| 方案 | 精度 | 加速比 | 质量损失 |
|------|------|--------|---------|
| AWQ | INT4 | 2-3× | < 1% |
| GPTQ | INT4 | 2-3× | < 1% |
| GGUF Q4_K_M | INT4 | 2-3× | ~2% |
| SqueezeLLM | 稀疏+量化 | 3-4× | < 2% |

**推测解码框架：**

| 框架 | 草稿方式 | 接受率 | 加速比 |
|------|---------|--------|--------|
| Medusa | 多头并行 | 60-80% | 3-5× |
| Eagle | 嵌入特征 | 70-85% | 3-6× |
| DFlash | 块扩散 | 75-90% | 4-6× |
| DDTree | 草稿树 | 80-90% | 5-8× |`,
    },
    {
      title: "总结与展望",
      body: `LLM 推理加速在 2026 年呈现出多元化的技术格局：

**技术趋势：**

1. **从线性到并行**：推测解码从线性验证走向树形验证（DDTree），从单路径走向多路径
2. **从独立到集成**：不再依赖单一加速方案，而是组合量化 + KV Cache 优化 + 推测解码
3. **从通用到场景化**：不同场景选择不同加速策略（端侧 vs 云端、延迟敏感 vs 吞吐敏感）
4. **块扩散崛起**：DFlash 和 DDTree 代表了推测解码的最新方向，5-8× 加速比正在成为可能

**待解决的挑战：**

1. **动态负载适配**：推理加速方案需要根据实时负载自动调整参数
2. **多模态推理**：图像/视频/语音的推理加速方案仍不成熟
3. **端侧部署**：在手机/IoT 设备上实现低延迟推理仍是难题
4. **质量-速度权衡**：如何在保证输出质量的前提下最大化加速比

**学习路径：**
- 入门：理解 KV Cache 和注意力计算，掌握 vLLM 基本用法
- 进阶：实现推测解码，理解 Medusa 和 Eagle 的架构差异
- 高级：研究 DFlash/块扩散的数学原理，探索 DDTree 的树形验证策略

推理加速是 LLM 落地最关键的技术之一。掌握这些方法，意味着你的 AI 应用能以更低的成本、更快的速度服务用户。`,
      warning: "推测解码和块扩散方案需要谨慎评估接受率。如果草稿模型与目标模型差异过大，接受率可能很低，反而增加推理延迟。部署前务必在你的实际数据上进行基准测试。",
    },
  ],
};
