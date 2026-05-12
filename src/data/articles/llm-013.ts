import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-013",
    title: "Mixture of Experts（MoE）（二）：大模型的稀疏化架构",
    category: "llm",
    tags: ["MoE", "模型架构", "稀疏激活", "扩展性"],
    summary: "深入解析 Mixture of Experts 架构的设计原理、路由机制、训练挑战，以及 Mixtral、GPT-4 等前沿模型中的工程实践",
    date: "2026-04-13",
    readTime: "22 min",
    level: "高级",
  learningPath: {
    routeId: "moe-series",
    phase: 2,
    order: 2,
    nextStep: "dl-017",
    prevStep: "ai-003",
  },
    content: [
        {
            title: "1. 为什么需要 MoE？——稠密模型的扩展瓶颈",
            body: `大语言模型的性能随着参数量的增加而提升，这是 Scaling Laws 告诉我们的基本规律。但稠密模型（Dense Model）有一个根本性的限制：每个 token 的前向传播都要激活全部参数。这意味着推理成本与参数总量成正比——一个万亿参数的稠密模型，每次生成一个 token 都要经过一万亿次浮点运算，这在实际部署中几乎不可行。

Mixture of Experts（MoE）架构的核心洞察是：模型的参数可以大幅增长，但每次推理只激活其中一小部分。通过将模型拆分为多个"专家"（Expert），并引入一个可学习的门控网络（Router/Gating Network）来动态决定每个 token 由哪些专家处理，MoE 实现了"大参数、小激活"的设计哲学。

这种稀疏激活（Sparse Activation）的策略带来了两个关键优势：推理效率——激活参数量决定了单次推理的计算成本，MoE 可以用远少于稠密模型的 FLOPs 达到相近的效果；训练效率——总参数量的增加让模型拥有更大的知识容量，而稀疏激活确保训练成本的增长远低于参数量的增长。

MoE 的思想最早可以追溯到 1991 年 Jacobs 等人提出的 Mixture of Experts 论文。但直到 2017 年 Shazeer 等人将 MoE 引入 **Transformer** 架构，以及 2022 年 Google 提出 Switch **Transformer** 后，MoE 才真正成为大模型的主流架构选择。如今，Mixtral 8x7B、**GPT-4**、Qwen-MoE、DeepSeek-V2 等前沿模型都采用了 MoE 架构。`,
            mermaid: `graph TD
    A["Dense 模型"] -->|"每个 token 激活全部参数"| B["推理成本高"]
    C["MoE 模型"] -->|"每个 token 只激活 Top-K 专家"| D["推理成本低"]
    E["总参数量"] -->|"MoE 可以大幅增加"| F["知识容量大"]
    G["激活参数量"] -->|"MoE 保持不变"| H["单次推理成本不变"]
    B --> I["🔴 受限"]
    D --> J["🟢 可扩展"]
    F --> K["🟢 容量大"]
    H --> L["🟢 效率高"]`,
            tip: "关键概念：MoE 的'总参数量'（Total Parameters）和'激活参数量'（Active Parameters）是两个不同的指标。Mixtral 8x7B 的总参量是 46.7B，但每个 token 只激活 12.9B 参数——这意味着它的推理成本接近一个 13B 的稠密模型，但知识容量接近一个 47B 的模型。",
        },
        {
            title: "2. MoE 架构详解：专家、路由器与 Top-K 选择",
            body: `MoE 层是标准 **Transformer** 层的一个变体。在标准 **Transformer** 中，每个 token 经过自注意力层后，进入一个前馈网络（FFN）。在 MoE Transformer 中，FFN 被替换为一组并行的专家网络（Expert Networks）和一个门控路由器（Gating Router）。

专家网络（Experts）： 通常是标准的 FFN（两个线性层加一个非线性激活函数，如 SwiGLU）。一个 MoE 层通常包含 8-256 个专家，每个专家独立处理分配给它的 token。专家的数量越多，模型的总参量越大，但也带来了更复杂的路由和负载均衡挑战。

门控路由器（Gating Network）： 这是一个轻量级的线性层，接收每个 token 的隐藏状态表示，输出一个对各个专家的"偏好分数"。经过 softmax 归一化后，得到每个专家的权重分布。路由器的参数量很小，但它是 MoE 架构的"大脑"——决定了每个 token 由哪些专家处理。

**Top-K 路由策略**： 最常用的路由策略是选择偏好分数最高的 K 个专家（K 通常为 1 或 2），然后按照它们的权重对专家的输出进行加权求和。K=1 时称为 Switch Routing（每个 token 只由一个专家处理），计算效率最高但灵活性较低；K=2 时可以在效率和灵活性之间取得更好的平衡。

专家组合（Expert Combination）： 不同模型对专家的部署策略不同。有些模型每层使用相同的专家组（Shared Experts），有些模型每层使用不同的专家组（Layer-specific Experts），还有些模型采用混合策略——某些层共享专家，某些层使用独立专家。DeepSeek-V2 提出了 MLA（Multi-Head Latent Attention）与 MoE 的结合，进一步提升了效率。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class Expert(nn.Module):
    """单个专家网络（标准 FFN with SwiGLU）"""
    def __init__(self, dim: int, hidden_dim: int):
        super().__init__()
        self.gate_proj = nn.Linear(dim, hidden_dim, bias=False)
        self.up_proj = nn.Linear(dim, hidden_dim, bias=False)
        self.down_proj = nn.Linear(hidden_dim, dim, bias=False)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # SwiGLU 激活: Swish(gate) * up
        gate = F.silu(self.gate_proj(x))
        up = self.up_proj(x)
        return self.down_proj(gate * up)


class MoELayer(nn.Module):
    """Mixture of Experts 层"""
    def __init__(self, dim: int, hidden_dim: int, 
                 num_experts: int, top_k: int = 2):
        super().__init__()
        self.num_experts = num_experts
        self.top_k = top_k
        
        # 创建专家组
        self.experts = nn.ModuleList([
            Expert(dim, hidden_dim) for _ in range(num_experts)
        ])
        
        # 门控路由器
        self.gate = nn.Linear(dim, num_experts, bias=False)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        x: (batch, seq_len, dim)
        返回: (batch, seq_len, dim)
        """
        batch, seq_len, dim = x.shape
        
        # 1. 计算门控分数: (batch, seq_len, num_experts)
        gate_logits = self.gate(x)
        gate_weights = F.softmax(gate_logits, dim=-1)
        
        # 2. 选择 Top-K 专家
        topk_weights, topk_indices = torch.topk(
            gate_weights, self.top_k, dim=-1
        )
        # 归一化 Top-K 权重
        topk_weights = topk_weights / topk_weights.sum(dim=-1, keepdim=True)
        
        # 3. 路由到专家并加权求和
        output = torch.zeros_like(x)
        for expert_idx in range(self.num_experts):
            # 找出哪些 token 选择了这个专家
            mask = (topk_indices == expert_idx)  # (batch, seq_len, top_k)
            token_mask = mask.any(dim=-1)        # (batch, seq_len)
            
            if token_mask.any():
                # 获取权重
                expert_weights = torch.zeros(
                    batch, seq_len, device=x.device
                )
                for k in range(self.top_k):
                    expert_weights += topk_weights[:, :, k] * (
                        topk_indices[:, :, k] == expert_idx
                    ).float()
                
                # 专家处理
                expert_input = x[token_mask]
                expert_output = self.experts[expert_idx](expert_input)
                
                # 加权写回
                weighted_output = expert_output * expert_weights[
                    token_mask
                ].unsqueeze(-1)
                output[token_mask] += weighted_output
        
        return output`,
                },
            ],
            table: {
                headers: ["组件", "功能", "参数量占比", "训练/推理"],
                rows: [
                    ["专家组", "处理 token 的 FFN", "~95%", "稀疏激活"],
                    ["路由器", "计算专家权重", "~1%", "稠密激活"],
                    ["自注意力层", "token 间交互", "~4%", "稠密激活"],
                    ["归一化层", "稳定训练", "~0.1%", "稠密激活"],
                ],
            },
        },
        {
            title: "3. 路由器的负载均衡问题与辅助损失",
            body: `MoE 训练中最核心的挑战之一是负载均衡（Load Balancing）。理想情况下，每个专家应该处理大致相等数量的 token，这样才能充分利用所有计算资源。但在训练初期，路由器的权重是随机初始化的，很可能导致某些专家被过度使用，而另一些专家几乎不被激活——这就是所谓的"专家坍塌"（Expert Collapse）。

专家坍塌是一个自我强化的恶性循环：如果某个专家在训练初期随机获得了较高的门控分数，它会接收到更多 token 的梯度更新，从而变得"更强"；而较弱的专家因为接收不到足够的训练信号，永远无法提升，最终完全被路由器忽略。

为了解决这个问题，MoE 训练中引入了辅助损失（Auxiliary Loss），也称为负载均衡损失。最常用的是 Switch **Transformer** 提出的负载均衡损失：对于每个 MoE 层，计算每个专家被选中的频率 fᵢ 和平均门控权重 Pᵢ，然后最小化 N·Σ(fᵢ·Pᵢ)，其中 N 是专家数量。这个损失的直觉是：如果所有专家被均匀使用（fᵢ = 1/N）且平均权重也均匀（Pᵢ = 1/N），则损失达到最小值 1。

除了辅助损失，还有其他负载均衡策略：随机路由——在训练时以一定概率随机分配 token 给专家，防止路由器过早收敛；容量限制——每个专家设置最大处理 token 数，超出容量的 token 被路由到备用专家或丢弃；Expert Choice Routing——让专家主动选择它们最擅长的 token，而不是由路由器分配 token 给专家。`,
            code: [
                {
                    lang: "python",
                    code: `def compute_load_balance_loss(
    gate_weights: torch.Tensor,  # (batch, seq, num_experts)
    topk_indices: torch.Tensor,  # (batch, seq, top_k)
    num_experts: int,
) -> torch.Tensor:
    """
    Switch Transformer 负载均衡辅助损失
    
    目标：让每个专家处理大致相同数量的 token
    损失 = num_experts * sum(f_i * P_i)
    其中 f_i = 专家 i 被选中的比例
         P_i = 专家 i 的平均门控权重
    """
    batch, seq_len, top_k = topk_indices.shape
    
    # 1. 计算每个专家被选中的频率 f_i
    expert_counts = torch.zeros(
        num_experts, device=gate_weights.device
    )
    for k in range(top_k):
        indices = topk_indices[:, :, k].flatten()
        expert_counts += torch.bincount(
            indices, minlength=num_experts
        ).float()
    expert_counts = expert_counts / expert_counts.sum()
    
    # 2. 计算每个专家的平均门控权重 P_i
    # 展开所有门控权重
    flat_gate = gate_weights.reshape(-1, num_experts)
    mean_weights = flat_gate.mean(dim=0)
    
    # 3. 计算辅助损失
    aux_loss = num_experts * (expert_counts * mean_weights).sum()
    return aux_loss


# 使用示例：添加到总损失中
# total_loss = task_loss + 0.01 * aux_loss
# aux_loss 的权重通常设为 0.01 量级
print("负载均衡辅助损失函数已定义")`,
                },
            ],
            mermaid: `graph TD
    A["训练开始"] --> B["路由器随机初始化"]
    B --> C{"专家使用均匀？"}
    C -->|"否"| D["辅助损失惩罚不均匀"]
    C -->|"是"| E["正常训练"]
    D --> F["路由器调整权重"]
    F --> C
    D --> G["专家坍塌风险"]
    G -.->|"严重"| H["某些专家从未被激活"]
    E --> I["所有专家均衡训练"]
    class I s3
    class H s2
    class G s1
    class D s0
    classDef s0 fill:#7c2d12
    classDef s1 fill:#7f1d1d
    classDef s2 fill:#7f1d1d
    classDef s3 fill:#14532d`,
            warning: "辅助损失的权重系数是关键的超参数。太小（< 0.001）无法防止专家坍塌；太大（> 0.1）会过度约束路由器，降低模型的表达能力。Mixtral 使用 0.02，Switch Transformer 使用 0.01。",
        },
        {
            title: "4. MoE 的分布式训练挑战",
            body: `MoE 架构的训练不仅仅是算法问题，更是系统工程问题。当模型包含数百个专家时，所有专家无法放入单个 GPU 的显存中。因此，MoE 训练必须依赖分布式训练策略。

专家并行（Expert Parallelism）： 将不同的专家分配到不同的 GPU 上。每个 GPU 只存储和计算它负责的专家。当 token 需要路由到位于其他 GPU 上的专家时，需要进行 GPU 间的通信（All-to-All 通信）。通信开销是专家并行最大的挑战——当 token 在 GPU 间频繁迁移时，通信可能成为训练的瓶颈。

数据并行 + 专家并行的混合策略： 现代 MoE 训练通常结合多种并行策略。数据并行处理不同的 batch，专家并行处理不同的专家，张量并行（Tensor Parallelism）处理单个专家内部的计算。这种混合并行策略需要精心的通信优化。

**通信优化技术**： DeepSpeed 和 Megatron-LM 等框架提供了多种优化技术。例如，使用拓扑感知的 All-to-All 通信来减少跨节点通信开销；使用专家缓存来减少频繁的 GPU 间数据传输；使用分层专家分配来确保高频通信的专家在同一个节点上。

**显存优化**： 即使使用专家并行，单个专家内部的参数量也可能超过单个 GPU 的显存。此时需要结合 ZeRO（Zero Redundancy Optimizer）策略，将优化器状态和梯度跨 GPU 切分。此外，激活值检查点（Activation Checkpointing）可以进一步减少显存占用，用计算换显存。`,
            table: {
                headers: ["并行策略", "适用场景", "通信开销", "显存效率", "代表框架"],
                rows: [
                    ["数据并行", "模型较小", "低（All-Reduce）", "低", "DDP, FSDP"],
                    ["专家并行", "MoE 架构", "高（All-to-All）", "高", "DeepSpeed, Megatron"],
                    ["张量并行", "单层超大", "高（All-Reduce）", "中", "Megatron-LM"],
                    ["流水线并行", "层数多", "中（点对点）", "中", "PipeDream, GPipe"],
                    ["混合并行", "超大 MoE", "高（组合）", "最高", "DeepSpeed-MoE"],
                ],
            },
            list: [
                "All-to-All 通信是 MoE 训练的主要瓶颈——优化通信拓扑至关重要",
                "使用 NCCL 的 All-to-All 原语时，确保 GPU 间带宽最大化（NVLink > PCIe > 网络）",
                "专家分组策略：将通信频繁的专家放在同一节点，减少跨节点通信",
                "使用 DeepSpeed MoE 或 Megatron-LM 的内置支持，避免从头实现",
                "训练时考虑使用 BF16 混合精度，减少通信带宽需求",
                "监控每个专家的负载和通信量，动态调整专家分配策略",
            ],
            tip: "实用建议：如果你的 MoE 模型在训练中遇到了通信瓶颈，先检查 All-to-All 通信的时间占比。如果超过 30%，考虑减少专家数量、增加 Top-K 值（减少通信频率），或使用更高效的通信库（如 NCCL 2.17+）。",
        },
        {
            title: "5. MoE vs Dense：何时选择哪种架构？",
            body: `MoE 不是万能的。理解 MoE 与稠密模型的适用场景，是在实际项目中做出正确架构选择的关键。

**MoE 的优势区间**： 当需要大知识容量但推理资源有限时，MoE 是最优选择。具体来说，如果你的预算可以支持一个 70B 稠密模型的训练，使用 MoE 可以训练一个总参量 200B+、激活参量 70B 的模型——训练成本相近，但推理时只需要 70B 的计算量，同时知识容量远超 70B 稠密模型。

**稠密模型的优势区间**： 当部署环境严格受限（如边缘设备）、或任务不需要超大知识容量时，稠密模型更合适。稠密模型没有路由开销、没有负载均衡问题、没有专家坍塌风险，训练和部署都更简单。

**混合策略**： 最新的模型设计趋势是将 MoE 用于中间层，而保留稠密层在输入和输出端。这种设计在效率和质量之间取得了更好的平衡。DeepSeek-V2 采用了这种混合架构，在关键层使用 MoE，在其他层使用标准稠密 FFN。`,
            table: {
                headers: ["维度", "Dense 模型", "MoE 模型", "说明"],
                rows: [
                    ["推理 FLOPs/Token", "O(N)", "O(N/Experts)", "MoE 显著更低"],
                    ["训练 FLOPs/Token", "O(N)", "O(N/Experts)", "相似，取决于 Expert 利用率"],
                    ["知识容量", "O(N)", "O(Experts × Expert_Size)", "MoE 显著更高"],
                    ["训练稳定性", "高", "中（需辅助损失）", "MoE 需要额外调优"],
                    ["部署复杂度", "低", "高（需专家分配）", "MoE 需要更复杂的基础设施"],
                    ["多 GPU 依赖", "可选", "必需（专家数多时）", "MoE 通常需要分布式"],
                    ["小数据表现", "好", "差（专家易坍塌）", "MoE 需要大量数据"],
                ],
            },
            mermaid: `graph TD
    A["选择模型架构"] --> B{"推理资源受限？"}
    B -->|"是"| C{"需要大知识容量？"}
    B -->|"否"| D["Dense 模型"]
    C -->|"是"| E["🟢 MoE 架构"]
    C -->|"否"| F["Small Dense 模型"]
    D --> G{"预算充足？"}
    G -->|"是"| H["Large Dense 或 MoE"]
    G -->|"否"| I["Medium Dense"]
    E --> J["Mixtral, Qwen-MoE 等"]
    F --> K["7B-13B Dense 模型"]
    I --> L["13B-70B Dense 模型"]
    class D s1
    class E s0
    classDef s0 fill:#14532d
    classDef s1 fill:#1e3a5f`,
        },
        {
            title: "6. 前沿 MoE 模型案例分析",
            body: `让我们分析几个代表性的 MoE 模型，理解它们的设计选择和工程实践。

Mixtral 8x7B（Mistral AI, 2023）： 8 个专家，每个 token 选择 2 个专家（Top-2 Routing）。总参量 46.7B，激活参量 12.9B。Mixtral 的关键设计选择是：使用 SwiGLU 作为专家激活函数；每层都使用 MoE（而不是只在部分层使用）；辅助损失权重设为 0.02。Mixtral 在大多数基准测试中匹敌甚至超越了 Llama 2 70B（5.6 倍的激活参量），展示了 MoE 架构的惊人效率。

**GPT-4**（**OpenAI**, 2023）： 据分析，**GPT-4** 采用了 16 个专家的 MoE 架构，每个 token 激活一个专家。据估计总参量约 1.76T，激活参量约 220B。GPT-4 的成功证明了 MoE 架构在超大模型上的可扩展性。

Qwen-MoE（阿里巴巴, 2024）： 总参量 2.7T，激活参量 2.4B。Qwen-MoE 的关键创新是共享专家（Shared Experts）机制——所有 token 都会经过几个共享专家，同时由路由器选择额外的独立专家。这种设计确保了模型的核心能力（由共享专家编码）不会因路由决策而丢失。

DeepSeek-V2（深度求索, 2024）： 总参量 236B，激活参量 21B。DeepSeek-V2 提出了 MLA（Multi-Head Latent Attention）与 MoE 的组合，将注意力机制的 KV Cache 压缩到一个低维潜在空间中，大幅减少了推理时的显存占用。同时使用 160 个专家（每层 16 个，共 10 层 MoE），每个 token 选择 6 个专家。`,
            code: [
                {
                    lang: "python",
                    code: `# MoE 模型的参数量计算
def calculate_moe_params(
    num_layers: int,
    dim: int,
    hidden_dim: int,
    num_experts_per_layer: int,
    num_shared_experts: int = 0,
):
    """
    计算 MoE 模型的总参数量和激活参数量
    
    参数:
        num_layers: Transformer 层数
        dim: 隐藏层维度
        hidden_dim: FFN 中间维度
        num_experts_per_layer: 每层专家数
        num_shared_experts: 每层共享专家数
    
    返回:
        (total_params, active_params)
    """
    # 每个专家的参数量（SwiGLU FFN: gate + up + down）
    expert_params = dim * hidden_dim * 2 + hidden_dim * dim
    
    # 路由器的参数量
    router_params = dim * num_experts_per_layer
    
    # 每层的参数量
    # 自注意力 + MoE FFN + 归一化
    attention_params = 4 * dim * dim  # Q, K, V, O 投影
    layer_params = (
        attention_params +
        num_experts_per_layer * expert_params +
        router_params +
        4 * dim  # 归一化层参数
    )
    
    total_params = num_layers * layer_params
    
    # 激活参数量（假设 Top-2 路由 + 共享专家）
    active_experts = 2 + num_shared_experts
    active_layer_params = (
        attention_params +
        active_experts * expert_params +
        router_params +
        4 * dim
    )
    active_params = num_layers * active_layer_params
    
    return total_params, active_params

# Mixtral 8x7B 近似
total, active = calculate_moe_params(
    num_layers=32, dim=4096, hidden_dim=14336,
    num_experts_per_layer=8
)
print(f"Mixtral 8x7B:")
print(f"  总参量: {total/1e9:.1f}B")
print(f"  激活参量: {active/1e9:.1f}B")
print(f"  稀疏率: {(1 - active/total)*100:.1f}%")`,
                },
            ],
            table: {
                headers: ["模型", "总参量", "激活参量", "专家数/层", "Top-K", "共享专家"],
                rows: [
                    ["Mixtral 8x7B", "46.7B", "12.9B", "8", "2", "否"],
                    ["GPT-4", "~1.76T", "~220B", "16", "1", "否"],
                    ["Qwen-MoE", "2.7T", "2.4B", "~64", "6", "是 (1)"],
                    ["DeepSeek-V2", "236B", "21B", "160/10层", "6", "是 (1)"],
                    ["Switch Transformer", "~1.6T", "~11B", "2048", "1", "否"],
                ],
            },
            tip: "MoE 模型的一个反直觉发现：即使激活参量只有稠密模型的 1/4，MoE 模型在很多任务上的表现可以匹敌甚至超越稠密模型。这是因为 MoE 的总参量更大，不同专家可以学习更专业化的知识，而路由器学会了在正确的场景下调用正确的专家。",
        },
        {
            title: "7. MoE 的未来方向",
            body: `MoE 架构仍在快速演进中。以下几个方向代表了当前的研究前沿。

**动态专家数量**： 当前的 MoE 模型使用固定数量的专家。未来的方向是让模型根据输入复杂度动态调整激活的专家数量——简单任务用少量专家，复杂任务用更多专家。这类似于人类的认知资源分配策略。

专家专业化（Expert Specialization）： 当前的专家是同质化的（结构相同的 FFN）。未来的方向是让不同专家学习不同领域或不同能力的专业化表示。例如，某些专家专门处理代码，某些专门处理数学推理，某些专门处理创意写作。这需要在训练数据或训练目标上施加结构化约束。

**MoE + 长上下文**： 随着上下文窗口扩展到百万 token 级别，MoE 架构如何高效处理超长序列是一个开放问题。一种思路是让路由器根据序列的不同段落选择不同的专家——前文的信息由某些专家处理，后文的信息由另一些专家处理。

**MoE 推理优化**： 部署 MoE 模型的核心挑战是专家的显存分配和调度。vLLM 等推理框架正在开发对 MoE 的原生支持，包括专家级别的 KV Cache 管理、专家的热/冷分层加载、以及基于请求模式的专家预取策略。

细粒度 MoE（Fine-grained MoE）： DeepSeek-V3 提出了细粒度 MoE，将专家拆分为更小的子专家，路由器在更细的粒度上选择。这种方法可以在不增加激活参数量的情况下，提高专家的利用效率和模型的表达能力。`,
            mermaid: `graph LR
    A["当前 MoE"] --> B["固定专家数"]
    A --> C["同质 FFN 专家"]
    A --> D["每层 Top-K 路由"]
    
    E["未来方向"] --> F["动态专家数"]
    E --> G["专业化专家"]
    E --> H["细粒度 MoE"]
    E --> I["MoE + 长上下文"]
    E --> J["推理优化"]
    class E s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            list: [
                "MoE 是大模型扩展的必经之路——稠密模型的 Scaling Law 终将遇到物理极限",
                "混合专家（共享专家 + 路由专家）是当前最实用的设计模式",
                "训练 MoE 的关键是负载均衡——辅助损失是必需品而非可选项",
                "部署 MoE 需要专门的推理框架支持——vLLM 的 MoE 支持正在快速成熟",
                "MoE 与长上下文、多模态的结合是下一个研究热点",
            ],
            warning: "MoE 不是免费的午餐。虽然推理效率高，但训练 MoE 需要更复杂的基础设施和更细致的调优。对于大多数团队来说，从稠密模型开始、在遇到扩展瓶颈时再考虑 MoE，是更务实的策略。",
        },
    ],
};
