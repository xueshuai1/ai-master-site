import { Article } from '../knowledge';

export const article: Article = {
  id: "dl-017",
  title: "Mixture of Experts MoE（三）：稀疏大模型架构实战",
  category: "dl",
  tags: ["MoE", "稀疏激活", "专家路由", "混合专家", "缩放定律"],
  summary: "深入理解 Mixture of Experts 架构的原理、路由机制、训练挑战，以及它如何成为 GPT-4、Mixtral、Qwen 等前沿模型的核心技术",
  date: "2026-04-13",
  readTime: "24 min",
  level: "高级",
  learningPath: {
    routeId: "moe-series",
    phase: 3,
    order: 3,
    nextStep: "llm-023",
    prevStep: "llm-013",
  },
  content: [
    {
      title: "1. 从稠密模型到稀疏模型：为什么要用 MoE",
      body: `大语言模型的能力与参数量呈正相关——这就是 Scaling Law 的核心发现。但 Scaling Law 面临一个根本矛盾：模型越大，推理成本越高。一个 175B 参数的稠密模型（如 GPT-3）在推理时，每次前向传播都要激活全部 175B 参数，消耗巨大的计算和显存资源。这意味着你无法同时拥有大规模和低成本。

Mixture of Experts (MoE) 的核心洞察打破了这个矛盾：让模型拥有巨大的参数总量，但每次推理只激活一小部分参数。MoE 模型包含多个"专家"（Expert）子网络——通常是前馈神经网络（FFN），加上一个"门控网络"（Gate/Router）。对于每个输入 token，门控网络动态选择最相关的 K 个专家（通常是 1-2 个），只激活这些专家对应的参数。其余专家完全不参与计算。

这种稀疏激活的设计带来了一个关键优势：模型总参数量可以远超稠密模型，但推理时的计算量（FLOPs）只与激活参数量相关，而非总参数量。例如 Mixtral 8x7B 有 46.7B 总参数，但每次只激活 12.9B 参数（2 个 7B 专家）。它的推理成本与 13B 稠密模型相当，但生成质量接近甚至超越 70B 稠密模型。

MoE 并非新概念——Jacobs 等人在 1991 年就提出了 Mixture of Experts 的原始框架，Shazeur 在 2017 年的"Outrageously Large Neural Networks"论文中将其重新引入深度学习领域。但直到 2022-2024 年间，随着 Switch **Transformer**、GShard、Mixtral 等大规模 MoE 模型的成功，这一架构才真正成为主流。**GPT-4**、**Gemini**、Qwen、DeepSeek 等前沿模型都被广泛认为采用了 MoE 架构。`,
      mermaid: `graph LR
    A["输入 Token"] --> B["门控网络 Gate"]
    B --> C["选择 Top-K 专家"]
    C --> D["专家 1 FFN"]
    C --> E["专家 2 FFN"]
    C --> F["专家 N FFN (不激活)"]
    D --> G["加权求和"]
    E --> G
    G --> H["输出 Token"]

    class F s0
    classDef s0 fill:#374151`,
      tip: "MoE 的核心优势：用稀疏激活实现大模型的能力、小模型的推理成本。总参数与激活参数可以相差数倍甚至数十倍。",
    },
    {
      title: "2. MoE 架构的数学原理",
      body: `MoE 层的核心由两部分组成：一组专家网络 E_1, E_2, ..., E_N（通常每个专家是一个独立的 FFN）和一个门控网络 G。对于输入 x，MoE 层的输出为 y = Σ_{i=1}^{N} G(x)_i * E_i(x)，其中 G(x)_i 是门控网络为第 i 个专家分配的权重。

门控网络的设计是 MoE 的关键。最常见的设计是基于点积的路由：G(x) = softmax(x * W_g)，其中 W_g 是可训练的门控权重矩阵。然后选择 Top-K 个权重最大的专家，将其权重重新归一化，其余专家权重设为 0。这种 Top-K 路由确保每个 token 只激活 K 个专家。

但标准的 Top-K 路由有一个严重问题：专家不平衡。如果门控网络偏好某些专家，这些专家会收到大量 token 导致显存溢出和计算瓶颈，而其他专家则闲置。为了解决这个问题，MoE 训练中必须引入负载均衡损失（Load Balancing Loss）。Switch **Transformer** 的辅助损失函数为：α * N * Σ_{i=1}^{N} f_i * P_i，其中 f_i 是分配给专家 i 的 token 比例，P_i 是门控网络分配给专家 i 的平均概率，α 是超参数。这个损失鼓励门控网络均匀分配 token 到所有专家。

另一种改进是专家容量（Expert Capacity）机制：为每个专家设定最大处理的 token 数量。如果某专家收到的 token 超过容量限制，多余的 token 会被丢弃（drop）或通过残差连接传递。容量设置需要在效率（小容量减少通信）和性能（大容量避免信息丢失）之间权衡。`,
      code: [
        {
          lang: "python",
          code: `# MoE 层实现（简化版）
import torch
import torch.nn as nn
import torch.nn.functional as F

class Expert(nn.Module):
    """单个专家——标准 FFN"""

    def __init__(self, dim: int, hidden_dim: int):
        super().__init__()
        self.w1 = nn.Linear(dim, hidden_dim)
        self.w2 = nn.Linear(hidden_dim, dim)
        self.w3 = nn.Linear(dim, hidden_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # SwiGLU 激活
        return self.w2(F.silu(self.w1(x)) * self.w3(x))


class MoELayer(nn.Module):
    """Mixture of Experts 层"""

    def __init__(
        self,
        dim: int,
        hidden_dim: int,
        num_experts: int = 8,
        top_k: int = 2,
        aux_loss_weight: float = 0.01,
    ):
        super().__init__()
        self.num_experts = num_experts
        self.top_k = top_k
        self.aux_loss_weight = aux_loss_weight

        # 门控网络
        self.gate = nn.Linear(dim, num_experts, bias=False)

        # 专家网络
        self.experts = nn.ModuleList([
            Expert(dim, hidden_dim) for _ in range(num_experts)
        ])

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        x: (batch, seq_len, dim)
        """
        batch_size, seq_len, dim = x.shape

        # 门控计算
        gate_logits = self.gate(x)  # (batch, seq_len, num_experts)

        # Top-K 路由
        top_k_weights, top_k_indices = torch.topk(
            gate_logits, self.top_k, dim=-1
        )  # (batch, seq_len, top_k)

        # 归一化权重
        top_k_weights = F.softmax(top_k_weights, dim=-1)

        # 计算辅助损失（负载均衡）
        aux_loss = self._compute_aux_loss(gate_logits)

        # 专家计算
        output = torch.zeros_like(x)
        for expert_idx in range(self.num_experts):
            # 找到被路由到当前专家的所有 token
            mask = (top_k_indices == expert_idx)  # (batch, seq_len, top_k)
            token_weights = top_k_weights * mask.float()
            token_weights = token_weights.sum(dim=-1)  # (batch, seq_len)

            if token_weights.sum() > 0:
                # 只计算选中的 token
                selected = x[mask.any(dim=-1)]
                expert_out = self.experts[expert_idx](selected)
                output[mask.any(dim=-1)] += expert_out * token_weights[mask.any(dim=-1)].unsqueeze(-1)

        self.aux_loss = aux_loss
        return output

    def _compute_aux_loss(self, gate_logits: torch.Tensor) -> torch.Tensor:
        """Switch Transformer 负载均衡损失"""
        # 门控概率: P_i = mean(gate_probs_i)
        gate_probs = F.softmax(gate_logits, dim=-1)
        # token 分配比例: f_i = count(tokens assigned to i) / total_tokens
        _, top_k_indices = torch.topk(gate_logits, self.top_k, dim=-1)
        one_hot = F.one_hot(top_k_indices, num_classes=self.num_experts)
        token_counts = one_hot.sum(dim=[0, 1, 2]).float()
        f_i = token_counts / token_counts.sum()
        P_i = gate_probs.mean(dim=[0, 1])
        aux_loss = self.num_experts * (f_i * P_i).sum()
        return aux_loss
`,
        },
      ],
      table: {
        headers: ["参数", "含义", "典型值", "影响"],
        rows: [
          ["N (专家数量)", "总专家数", "8-256", "更多专家=更大模型容量"],
          ["K (激活专家数)", "每个 token 激活的专家数", "1-2", "K=1 最稀疏，K=2 更稳定"],
          ["Capacity Factor", "专家容量的倍数因子", "1.0-2.0", "太小导致丢 token，太大浪费"],
          ["Aux Loss Weight", "负载均衡损失权重", "0.001-0.1", "太大损害性能，太小导致不平衡"],
        ],
      },
      warning: "MoE 训练中最常见的失败模式是专家退化：门控网络只使用少数专家，其余专家几乎不被激活。这通常是因为负载均衡损失权重设置不当或学习率过高。",
    },
    {
      title: "3. 路由机制的演进",
      body: `路由机制是 MoE 架构中最核心的设计决策，直接决定了模型的效率和质量。从最初的简单路由到如今的复杂策略，路由机制经历了多轮迭代。

Soft MoE（Puigcerver et al., 2024）提出了一种完全不同的思路：不再让每个 token 选择专家，而是为每个专家分配固定数量的 token"槽位"（slot）。输入 token 通过可学习的槽位中心进行软分配，每个专家接收固定数量的混合 token。这种方法消除了专家不平衡问题，因为每个专家的输入量是固定的。Soft MoE 在图像和语言任务上都取得了优异表现，且训练更加稳定。

No Token Dropping 是另一条重要路线。传统的 Expert Capacity 机制在专家过载时会丢弃 token（直接跳过该层的专家计算或用残差连接替代），导致信息丢失。DeepSeek-V3 和 Mixtral 8x22B 采用了更精细的策略：通过动态调整容量、优化路由算法，以及引入 token 重分配机制，基本消除了 token 丢弃的需要。

Grouped-Limitless Routing（GL Routing）是 DeepSeek-V3 的核心创新。它将专家分为多个组，先选择组再选择组内专家，大幅减少了路由计算量。同时取消了专家容量限制，允许每个专家处理任意数量的 token，通过高效的通信优化来处理负载不均衡。这种设计在保持 MoE 稀疏性的同时，避免了传统容量限制带来的信息丢失。

共享专家（Shared Experts）是另一个重要改进。传统 MoE 中，所有专家都是"路由专家"，但某些知识（如基础语法、常见事实）应该被所有 token 共享。引入少量共享专家（不参与路由、始终被激活），配合路由专家（按需激活），可以显著提升模型的基础能力。DeepSeek-V3 采用了 1 个共享专家 + 多个路由专家的设计。`,
      mermaid: `graph TD
    A["路由机制演进"] --> B["Top-K 路由"]
    A --> C["Soft MoE"]
    A --> D["Grouped Routing"]
    A --> E["Shared + Routed Experts"]
    B --> F["简单但有负载不均衡"]
    C --> G["固定槽位，消除不平衡"]
    D --> H["先选组再选专家"]
    E --> I["共享基础知识 + 路由专业"]
`,
      code: [
        {
          lang: "python",
          code: `# 共享专家 + 路由专家的 MoE 实现
class SharedPlusRoutedMoE(nn.Module):
    """共享专家与路由专家结合的 MoE 层"""

    def __init__(
        self, dim, hidden_dim,
        num_routed_experts=8, top_k=2,
        num_shared_experts=1
    ):
        super().__init__()
        self.top_k = top_k
        self.num_routed_experts = num_routed_experts

        # 路由专家：按 token 动态选择
        self.gate = nn.Linear(dim, num_routed_experts, bias=False)
        self.routed_experts = nn.ModuleList([
            Expert(dim, hidden_dim)
            for _ in range(num_routed_experts)
        ])

        # 共享专家：始终激活，处理通用知识
        self.shared_experts = nn.ModuleList([
            Expert(dim, hidden_dim)
            for _ in range(num_shared_experts)
        ])

    def forward(self, x):
        # 共享专家输出（所有 token 都经过）
        shared_out = sum(e(x) for e in self.shared_experts)

        # 路由专家输出
        gate_logits = self.gate(x)
        top_k_w, top_k_idx = torch.topk(gate_logits, self.top_k, dim=-1)
        top_k_w = F.softmax(top_k_w, dim=-1)

        routed_out = torch.zeros_like(x)
        for i in range(self.num_routed_experts):
            mask = (top_k_idx == i)
            w = (top_k_w * mask.float()).sum(dim=-1)
            if w.sum() > 0:
                selected = x[mask.any(dim=-1)]
                routed_out[mask.any(dim=-1)] += (
                    self.routed_experts[i](selected) *
                    w[mask.any(dim=-1)].unsqueeze(-1)
                )

        return shared_out + routed_out
`,
        },
      ],
    },
    {
      title: "4. MoE 训练的关键挑战与解决方案",
      body: `MoE 模型训练比稠密模型复杂得多，主要面临以下几个挑战：

专家崩溃（Expert Collapse）：训练过程中，门控网络可能发现依赖少数几个"明星专家"就能获得低损失，导致其他专家几乎不被使用。一旦专家不被使用，其梯度为零，参数不再更新，形成恶性循环。解决方案包括：增大负载均衡损失权重、使用随机路由（在训练早期引入噪声）、以及暖启动策略（先用稠密模型预训练，再初始化为 MoE）。

**通信瓶颈**：在分布式训练中，MoE 专家通常分布在不同的 GPU 上。每个 token 需要根据路由结果被发送到对应的专家所在 GPU，这涉及大量的 All-to-All 通信。当模型规模达到数百专家时，通信开销可能占总训练时间的 30-50%。DeepSpeed-MoE 和 Megatron-LM 通过通信-计算重叠（Overlap）、专家分组（Expert Parallelism）和分层路由等技术来缓解通信瓶颈。

**训练不稳定性**：MoE 的损失曲面比稠密模型更复杂，因为路由选择是离散操作，导致梯度不连续。实践中需要更小的学习率、更长的 warmup 阶段、以及梯度裁剪来保证训练稳定。

**评估复杂度**：MoE 模型的能力评估不能仅看激活参数量。两个激活参数量相同的 MoE 模型，如果专家数量不同、路由策略不同，实际表现可能有显著差异。这是因为更多专家意味着更细粒度的知识分工。`,
      code: [
        {
          lang: "python",
          code: `# 专家利用率监控——训练诊断的关键工具
import torch
import numpy as np

class MoEMonitor:
    """监控 MoE 训练中的专家使用情况"""

    def __init__(self, num_experts, window_size=100):
        self.num_experts = num_experts
        self.window_size = window_size
        self.expert_counts = np.zeros(window_size, dtype=int)
        self.step = 0

    def record(self, expert_assignments):
        """记录当前批次的专家分配情况
        expert_assignments: (batch * seq_len, top_k) 的专家索引
        """
        # 统计每个专家被使用的次数
        counts = np.bincount(
            expert_assignments.flatten(),
            minlength=self.num_experts
        )
        self.expert_counts[self.step % self.window_size] = counts.sum()
        self.step += 1

    def check_collapse(self, threshold=0.05):
        """检查是否有专家崩溃（使用率低于阈值）
        返回: (是否有崩溃, 各专家使用率, 熵)
        """
        recent = self.expert_counts[self.step % self.window_size:]
        if recent.sum() == 0:
            return True, None, 0.0

        rates = recent / recent.sum()
        entropy = -np.sum(rates * np.log(rates + 1e-10))
        max_entropy = np.log(self.num_experts)

        collapsed = np.where(rates < threshold / self.num_experts)[0]
        is_collapsed = len(collapsed) > 0

        if is_collapsed:
            print(f"警告: 专家 {collapsed} 使用率低于阈值!")
            for idx in collapsed:
                print(f"  专家 {idx}: 使用率 {rates[idx]:.4f}")

        print(f"路由熵: {entropy:.2f} / {max_entropy:.2f} "
              f"({entropy/max_entropy:.1%} 理想)")

        return is_collapsed, rates, entropy


# 使用示例
monitor = MoEMonitor(num_experts=8)
# 在每个训练步调用:
# monitor.record(top_k_indices.cpu().numpy())
# monitor.check_collapse()
`,
        },
      ],
      table: {
        headers: ["问题", "症状", "根因", "解决方案"],
        rows: [
          ["专家崩溃", "少数专家处理 90%+ token", "负载均衡损失不足", "增大 aux loss、随机路由、暖启动"],
          ["通信瓶颈", "训练速度远低于理论值", "All-to-All 通信量大", "专家分组、通信重叠、层级路由"],
          ["训练不稳定", "loss 突然飙升", "路由梯度不连续", "降低学习率、增大 warmup、梯度裁剪"],
          ["推理显存溢出", "OOM 在推理时", "专家全加载显存不够", "专家卸载、动态加载、INT4 量化"],
        ],
      },
    },
    {
      title: "5. 前沿 MoE 模型架构对比",
      body: `2024-2026 年间，MoE 架构经历了爆炸式创新，各大团队提出了各有特色的设计：

Mixtral 8x7B/8x22B（Mistral AI）：采用经典的 Top-2 路由，每层 8 个专家，每个 token 激活 2 个专家。8x7B 的 46.7B 总参数仅激活 12.9B，在多项基准上超越 Llama 2 70B。8x22B 进一步将专家规模扩大到 22B 参数，在推理能力上达到 GPT-3.5 水平。Mixtral 的设计简洁高效，是开源 MoE 模型的标杆。

DeepSeek-V3（深度求索）：采用创新的 Group-Limited MoE 设计，每层 256 个专家但分为 8 组，token 先选组（从 8 组中选 1 组），再从组内 32 个专家中选 6 个。这种设计将路由计算复杂度从 O(256) 降到 O(8+32)，同时保持了大专家池的优势。配合 Multi-Token Prediction（MTP）和 Shared Expert 设计，DeepSeek-V3 以 671B 总参数、37B 激活参量的规模，在多项基准上追平甚至超越 **GPT-4**。

Qwen-MoE（通义千问）：采用共享专家 + 路由专家的混合设计，并引入了跨层专家共享机制——不同 MoE 层之间可以共享同一组专家参数，大幅减少总参数量同时保持表达能力。

**GPT-4**（**OpenAI**）：虽然 **OpenAI** 未公开确认，但多方分析和泄露信息强烈暗示 GPT-4 采用了 MoE 架构。据估计 GPT-4 可能有约 1.76T 总参数，但激活参数约为 100B 级别。这种规模远超任何公开模型，解释了 GPT-4 在各项能力上的显著领先。

**这些模型的共同趋势是**：专家数量从个位数增长到百位数，路由机制从简单 Top-K 发展为多层分组路由，共享专家成为标配，通信优化成为核心竞争力。`,
      table: {
        headers: ["模型", "总参数", "激活参数", "专家数", "Top-K", "关键创新"],
        rows: [
          ["Mixtral 8x7B", "46.7B", "12.9B", "8/层", "2", "开源 MoE 标杆"],
          ["Mixtral 8x22B", "141B", "39B", "8/层", "2", "大规模专家 FFN"],
          ["DeepSeek-V3", "671B", "37B", "256/层(分组)", "6", "Group-Limited 路由"],
          ["Qwen-MoE", "未知", "未知", "未知", "2", "跨层专家共享"],
          ["GPT-4 (估计)", "~1.76T", "~100B", "未知", "未知", "超大规模 MoE"],
          ["Switch Transformer", "~1.6T", "~12B", "2048/层", "1", "Top-1 路由先驱"],
        ],
      },
      mermaid: `graph LR
    A["Scaling Law"] --> B["稠密模型: 参数量↑→成本↑↑"]
    A --> C["MoE: 总参数↑↑→激活参数↑"]
    B --> D["GPT-3 175B"]
    C --> E["Mixtral 46B/13B激活"]
    C --> F["DeepSeek-V3 671B/37B激活"]
    C --> G["GPT-4 ~1.76T/~100B激活"]
`,
      tip: "MoE 的本质是在模型容量和计算效率之间找到最优解。专家数量越多，知识分工越精细，但通信和路由开销也越大。找到这个平衡点是每个团队的核心竞争力。",
    },
    {
      title: "6. MoE 推理优化：从理论到实践",
      body: `MoE 模型的推理优化是将其从学术成果转化为实际产品的关键环节。与训练时不同，推理时没有批量数据来摊销通信开销，每个 token 的路由和专家调用都是独立的，这对系统设计提出了特殊要求。

KV Cache 管理是 MoE 推理的第一大挑战。与传统稠密模型不同，MoE 模型中不同 token 可能经过不同的专家路径，KV Cache 的结构变得复杂。一种解决方案是按专家组织 KV Cache——每个专家维护独立的 KV Cache，当 token 路由到某专家时只加载该专家的 KV Cache。但这增加了显存碎片化和调度复杂度。

专家卸载（Expert Offloading）是应对大模型显存不足的核心技术。当 GPU 显存无法容纳所有专家时，可以只在显存中保留部分专家，其余专家存放在 CPU 内存或 NVMe SSD 上。当 token 路由到不在显存中的专家时，动态加载该专家。关键挑战是：加载延迟可能高达数毫秒，严重影响生成速度。解决方案包括：预加载高概率专家（基于路由模式预测）、专家缓存（LRU 策略保留最近使用的专家）、以及将专家切分为更细粒度的子模块按需加载。

量化对 MoE 模型尤为重要。由于总参数量巨大，INT4 量化可以将显存需求降低 4 倍。但 MoE 的量化比普通模型更复杂：每个专家的数据分布可能不同（因为不同专家处理不同类型的知识），需要为每个专家单独计算量化参数（Per-Expert Quantization）。AWQ（Activation-aware Weight Quantization）和 FP8 量化在 MoE 模型上取得了良好效果。

推测解码（Speculative Decoding）与 MoE 的结合是另一个前沿方向。小模型（Drafter）可以快速生成候选 token 序列，MoE 大模型并行验证。关键优化是：Drafter 可以共享 MoE 模型的部分专家，减少额外的参数量开销。`,
      code: [
        {
          lang: "python",
          code: `# MoE 推理引擎核心逻辑（简化）
import torch
from collections import OrderedDict

class MoEInferenceEngine:
    """MoE 推理引擎——支持专家卸载和缓存"""

    def __init__(self, model, gpu_memory_limit_gb=80):
        self.model = model
        self.device = torch.device("cuda")
        self.cpu_device = torch.device("cpu")

        # 专家 LRU 缓存
        self.expert_cache = OrderedDict()
        self.cache_capacity = 4  # 最多缓存几个专家在 GPU 上

        # 预计算每个专家需要的显存
        self.expert_sizes = {}
        for name, module in model.named_modules():
            if "expert" in name.lower() and isinstance(module, torch.nn.Module):
                size = sum(p.numel() * p.element_size()
                          for p in module.parameters())
                self.expert_sizes[name] = size / (1024**3)  # GB

    def load_expert_to_gpu(self, expert_name, expert_module):
        """将专家加载到 GPU（LRU 缓存管理）"""
        if expert_name in self.expert_cache:
            # 已经在缓存中，移到最前面
            self.expert_cache.move_to_end(expert_name)
            return

        # 缓存满了，卸载最久未使用的专家
        while len(self.expert_cache) >= self.cache_capacity:
            oldest = next(iter(self.expert_cache))
            self._offload_expert(oldest)

        # 加载到 GPU
        expert_module.to(self.device)
        self.expert_cache[expert_name] = expert_module

    def _offload_expert(self, expert_name):
        """卸载专家到 CPU"""
        if expert_name in self.expert_cache:
            expert = self.expert_cache.pop(expert_name)
            expert.to(self.cpu_device)
            torch.cuda.empty_cache()

    def generate(self, input_ids, max_new_tokens=100):
        """MoE 模型文本生成"""
        with torch.no_grad():
            for step in range(max_new_tokens):
                outputs = self.model(input_ids)
                next_token = outputs.logits[:, -1, :].argmax(dim=-1)
                input_ids = torch.cat([input_ids, next_token.unsqueeze(0)], dim=-1)

                # 可选：检查生成是否结束
                if next_token.item() == self.model.config.eos_token_id:
                    break

        return input_ids
`,
        },
      ],
      table: {
        headers: ["优化技术", "显存节省", "速度影响", "实现难度", "适用场景"],
        rows: [
          ["INT4 量化", "~75%", "1.5-2x 加速", "中", "所有 MoE 模型"],
          ["专家卸载", "~50-90%", "-30-80% 减速", "高", "显存不足的部署"],
          ["推测解码", "无", "2-3x 加速", "高", "大上下文生成"],
          ["专家分组并行", "~30% 通信", "1.2-1.5x", "极高", "多 GPU 部署"],
          ["连续批处理", "显著提升吞吐", "3-10x 吞吐", "中", "多请求服务"],
        ],
      },
    },
    {
      title: "7. MoE 的未来方向与实践建议",
      body: `MoE 架构仍处于快速演进阶段，以下几个方向代表了未来的发展趋势：

**动态专家数量**：当前 MoE 模型的专家数量在训练时就固定了。未来的方向是让模型在推理时根据输入复杂度动态决定激活多少专家——简单输入用少量专家，复杂输入激活更多专家。这种"按需分配"的策略可以进一步优化效率和质量的权衡。

**细粒度 MoE**：当前 MoE 通常以 FFN 层为专家粒度。细粒度 MoE 将专家粒度进一步细化到注意力头级别（Attention MoE）甚至单个神经元级别，实现更精细的知识分工。

**多模态 MoE**：将 MoE 扩展到多模态场景，不同专家专精于不同模态（文本专家、图像专家、音频专家），门控网络根据输入模态组合动态选择专家。这为构建通用的多模态大模型提供了一条高效路径。

**训练效率优化**：当前的 MoE 训练需要大量 GPU 和复杂的分布式策略。降低 MoE 训练门槛——让单卡或少数几张卡也能训练 MoE 模型——是推动技术民主化的关键方向。LoMoE（Low-rank MoE）和参数高效微调 MoE 正在朝这个方向探索。

**对于实践者的建议**：如果你正在构建一个新的大语言模型，MoE 几乎是最优选择。在同等计算预算下，MoE 模型的能力显著优于稠密模型。但如果你的部署环境资源受限（如边缘设备），稠密模型可能更容易部署和优化。

MoE 不是一种替代稠密模型的技术，而是一种扩展模型能力的架构范式。理解 MoE 的原理和实践，是掌握现代大语言模型技术栈的必要条件。`,
      code: [
        {
          lang: "python",
          code: `# MoE 模型选择决策树
def choose_model_architecture(requirements):
    """根据需求选择模型架构"""
    if requirements.get("inference_latency_ms", float("inf")) < 50:
        return {
            "architecture": "小参数稠密模型",
            "reason": "低延迟场景不适合 MoE 的路由开销",
            "suggestion": "使用 7B 以下稠密模型 + 量化",
        }

    if requirements.get("max_gpu_memory_gb", float("inf")) < 20:
        return {
            "architecture": "稠密模型 + INT4 量化",
            "reason": "MoE 的总参数量大，显存需求高",
            "suggestion": "使用 13B 稠密模型 + AWQ 量化到 ~8GB",
        }

    if requirements.get("quality_priority", False):
        return {
            "architecture": "大规模 MoE",
            "reason": "MoE 在同等计算预算下质量最优",
            "suggestion": "Mixtral 8x22B 或 DeepSeek-V3",
        }

    if requirements.get("cost_sensitive", False):
        return {
            "architecture": "中等规模 MoE",
            "reason": "MoE 的推理成本与激活参数相关",
            "suggestion": "Mixtral 8x7B (46B总/13B激活)",
        }

    return {
        "architecture": "稠密模型",
        "reason": "无特殊需求时，稠密模型最简单",
        "suggestion": "Llama 3 8B 或 Qwen 7B",
    }


# MoE 能力 Scaling Law 经验公式
def estimate_moe_capability(
    total_params_b: float,  # 总参数（B）
    active_params_b: float,  # 激活参数（B）
    num_experts: int,
    training_tokens_t: float,  # 训练数据（T）
) -> dict:
    """估算 MoE 模型的能力（经验公式）"""
    # 关键发现：MoE 的能力由总参数和激活参数共同决定
    # 总参数决定知识容量，激活参数决定推理质量

    # 基于 Chinchilla 定律的修正
    optimal_tokens = 20 * active_params_b  # B tokens
    data_efficiency = min(1.0, training_tokens_t / optimal_tokens)

    # 专家多样性收益（额外专家数带来的增益递减）
    expert_diversity = 1.0 + 0.1 * (num_experts ** 0.5)

    # 综合评分（0-100，仅供参考）
    capability_score = (
        20 * (active_params_b ** 0.35) *
        (total_params_b ** 0.1) *
        (data_efficiency ** 0.5) *
        expert_diversity
    )

    return {
        "capability_score": min(capability_score, 100),
        "data_efficiency": data_efficiency,
        "expert_diversity": expert_diversity,
        "estimated_mmlu": min(
            40 + 15 * (active_params_b ** 0.25) *
            (total_params_b ** 0.08),
            90
        ),
        "recommendation": (
            "数据不足" if data_efficiency < 0.5
            else "可以训练" if data_efficiency < 1.0
            else "数据充足"
        ),
    }
`,
        },
      ],
      table: {
        headers: ["趋势", "时间线", "关键挑战", "代表工作"],
        rows: [
          ["动态专家数", "2025-2026", "路由策略设计", "研究阶段"],
          ["细粒度 MoE", "2024-2025", "通信开销控制", "Microsoft, Google"],
          ["多模态 MoE", "2025-2026", "跨模态专家分工", "GPT-4V, Gemini"],
          ["高效训练 MoE", "2024-2025", "降低 GPU 需求", "LoMoE, PEFT-MoE"],
          ["MoE 推理优化", "2024-2026", "显存与速度平衡", "vLLM, TensorRT-LLM"],
        ],
      },
      mermaid: `graph TD
    A["MoE 未来"] --> B["动态专家数量"]
    A --> C["细粒度专家"]
    A --> D["多模态 MoE"]
    A --> E["高效训练"]
    A --> F["推理优化"]
    B --> G["按需计算"]
    C --> H["更精细知识分工"]
    D --> I["通用多模态模型"]
    E --> J["技术民主化"]
    F --> K["生产级部署"]
`,
      tip: "MoE 是当前大模型架构的主流方向。如果你在 2026 年训练一个新的大语言模型，选择稠密架构几乎不再是合理的选择——MoE 在同等计算预算下提供更优的能力效率比。",
    },
  ],
};
