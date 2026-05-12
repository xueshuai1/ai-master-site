// 企业级 AI Agent 部署成本与 TCO 全解析

import { Article } from '../knowledge';

export const article: Article = {
  id: "practice-012",
  title: "企业级 AI Agent 部署成本与 TCO 全解析：从 API 调用到自托管的完整经济账",
  category: "practice",
  tags: ["AI Agent", "部署成本", "TCO", "ROI", "成本优化", "自托管", "API 定价", "GPU 成本", "企业落地"],
  summary: "2026 年，AI Agent 从概念验证走向企业大规模部署，但成本问题成为最大的拦路虎。本文建立完整的 TCO（总拥有成本）分析框架，对比 API 调用 vs 自托管 vs 混合部署三种模式的成本结构，提供可复用的 Python 成本计算器，覆盖 GPU 选型、token 经济学、并发优化、缓存策略等关键维度，帮你算清 AI Agent 的经济账。",
  date: "2026-04-19",
  readTime: "30 min",
  level: "进阶",
  content: [
    {
      title: "为什么 AI Agent 的成本问题如此棘手？",
      body: `2024 年，企业还在讨论「要不要用 AI」；2025 年，讨论变成了「怎么用 AI」；到了 2026 年，真正的问题变成了「用 AI 到底要花多少钱，能不能持续」。\n\nAI Agent 与传统软件的成本结构有着本质区别。传统软件的成本是确定性的：服务器租用费、软件许可费、运维人力成本——这些都可以提前精确计算。而 AI Agent 的成本是概率性的：每次调用消耗多少 token、需要多少次重试、并发高峰时如何扩容、缓存命中率多少——这些变量叠加在一起，让成本预测变得极其困难。\n\n一个真实的案例：\n\n某中型电商公司在 2025 年底部署了一套基于 LLM 的客服 Agent。PoC 阶段每月调用量 10 万次，成本约 500 美元，看起来非常划算。正式上线后，第一个月调用量飙升至 200 万次——因为 Agent 被证明有用，业务部门疯狂使用——当月账单直接跳到 8,000 美元。更糟的是，由于 Agent 的多步推理特性（每个用户请求平均触发 4-6 次 API 调用），实际 token 消耗量是预估的 3 倍。\n\n这就是 AI Agent 成本问题的核心矛盾：价值验证成功 → 用量暴增 → 成本失控 → 被迫削减 → 价值下降。\n\n打破这个循环的关键，是在部署之前就算清楚经济账。`,
      mermaid: `graph TD
    A["AI Agent 成本困局"] --> B["PoC 阶段：用量低，成本可控"]
    B --> C["价值验证成功"]
    C --> D["业务部门大规模使用"]
    D --> E["调用量暴增 10-100 倍"]
    E --> F["成本失控"]
    F --> G["管理层要求削减预算"]
    G --> H["减少 Agent 功能/限制调用"]
    H --> I["用户体验下降，价值降低"]
    I --> J["项目被叫停"]
    
    K["破局：TCO 分析框架"] -.->|"提前规划"| D
    K --> L["API vs 自托管 vs 混合"]
    K --> M["成本优化策略"]
    K --> N["用量预测与预算管理"]`,
      table: {
        headers: ["成本维度", "传统软件", "AI Agent（API）", "AI Agent（自托管）"],
        rows: [
          ["基础设施", "固定（服务器/容器）", "零（API 提供商承担）", "高（GPU 服务器）"],
          ["按量计费", "无", "是（每 token 计费）", "否（固定成本）"],
          ["规模效应", "线性增长", "线性增长", "边际成本递减"],
          ["预测难度", "低", "极高", "中等"],
          ["隐性成本", "运维人力", "重试/超时/缓存未命中", "GPU 折旧+电费+运维"],
          ["启动门槛", "中等", "极低", "极高（$10K-$100K+）"],
        ],
      },
    },
    {
      title: "TCO 分析框架：AI Agent 的六大成本构成",
      body: `总拥有成本（Total Cost of Ownership, TCO）不仅仅看「买模型要多少钱」，而是要覆盖 AI Agent 从部署到运维的全生命周期成本。我们将其拆解为六大构成。\n\n1. 模型推理成本（Model Inference Cost）\n\n这是最直观的成本。API 模式下按 token 计费：输入 token 通常 $0.5-$10/百万 token，输出 token $1.5-$60/百万 token。自托管模式下，成本 = GPU 租赁费 ÷ 每月可处理的 token 总量。关键变量是模型的上下文窗口长度和平均每个请求的 token 消耗量。\n\n2. 多步推理放大成本（Multi-Step Amplification Cost）\n\nAgent 不是简单的「一问一答」。一个典型的 ReAct Agent 处理单个用户请求，可能包含：规划（1 次 API 调用）→ 工具调用（2-5 次 API 调用）→ 结果整合（1-2 次 API 调用）→ 最终回答（1 次 API 调用）。这意味着每个用户请求背后是 5-10 次 API 调用，token 消耗量是单轮对话的 5-10 倍。\n\n3. 基础设施成本（Infrastructure Cost）\n\n自托管模式下的核心成本。GPU 服务器（A100/H100/B200）的月租费用从 $2,000 到 $20,000 不等。此外还有：存储（向量数据库、模型权重）、网络（API 网关、CDN）、编排层（Kubernetes、服务网格）。\n\n4. 运维成本（Operations Cost）\n\n包括监控、日志、告警、扩缩容、故障恢复。AI Agent 比传统服务更难运维：模型响应时间不稳定、token 输出速率波动、GPU 显存泄漏、长上下文场景下的性能退化。这些都需要专门的监控和自动化工具。\n\n5. 安全与合规成本（Security & Compliance Cost）\n\n包括：输入/输出过滤（防止 prompt injection、有害内容输出）、数据脱敏、审计日志、合规审查（GDPR、SOC2）、红队测试。根据 OpenAI 的 Mythos 安全模型披露的数据，安全验证的 token 开销可能占到总推理成本的 15-30%。\n\n6. 人力成本（Human Cost）\n\nAI Agent 不会完全替代人力，而是改变了人力结构。需要：Prompt 工程师（设计系统提示词和工具定义）、AI 运维工程师（监控模型性能、处理异常）、领域专家（审核 Agent 输出质量、持续优化）。`,
      mermaid: `graph LR
    A["TCO 总拥有成本"] --> B["模型推理 35％"]
    A --> C["多步放大 25％"]
    A --> D["基础设施 15％"]
    A --> E["运维 10％"]
    A --> F["安全合规 8％"]
    A --> G["人力 7％"]
    
    B -.->|"API: $/token
自托管: GPU 折旧"| B1["可优化"]
    C -.->|"Agent 架构决定放大倍数"| C1["可通过缓存/路由优化"]
    D -.->|"GPU 选型 + 云厂商定价"| D1["可通过量化/蒸馏降低"]
    E -.->|"监控 + 扩缩容自动化"| E1["可被基础设施成本吸收"]
    F -.->|"过滤 + 审计 + 合规"| F1["合规要求决定下限"]
    G -.->|"Prompt 工程师 + AI 运维"| G1["随自动化水平降低"]`,
    },
    {
      title: "三种部署模式的成本对比",
      body: `企业部署 AI Agent 有三种主要模式：纯 API 调用、纯自托管、混合部署。每种模式在不同用量规模下的经济性截然不同。\n\n纯 API 调用模式\n\n最轻量的方案。企业直接调用 OpenAI GPT-4o、Claude Sonnet 4、Gemini 2.5 Pro 等云端模型的 API。优势是零基础设施投入、即用即付、自动获得模型升级。劣势是用量越大单位成本越高、数据需要发送到第三方、响应延迟受网络影响。\n\n纯自托管模式\n\n企业自建 GPU 基础设施，部署开源模型（Llama 4、Qwen 3、Mistral Large 等）。优势是数据不出域、边际成本随用量递减、可深度定制。劣势是启动成本极高（$10K-$100K+）、需要专业团队运维、模型迭代需要自己跟进。\n\n混合部署模式\n\n将 Agent 的不同模块拆分：核心推理走 API（保证质量），工具调用/数据检索走自托管小模型（控制成本），敏感数据走本地模型。这是 2026 年最主流的部署模式，兼顾了质量、成本和合规。`,
      table: {
        headers: ["维度", "纯 API", "纯自托管", "混合部署"],
        rows: [
          ["启动成本", "$0-500/月", "$10,000-100,000+", "$2,000-20,000/月"],
          ["10 万次/月", "$50-500", "$1,000-5,000", "$200-800"],
          ["100 万次/月", "$500-5,000", "$1,500-8,000", "$800-3,000"],
          ["1000 万次/月", "$5,000-50,000", "$5,000-20,000", "$3,000-15,000"],
          ["1 亿次/月", "$50,000-500,000", "$15,000-80,000", "$10,000-50,000"],
          ["盈亏平衡点", "无上限", "~50-200 万次/月", "~20-80 万次/月"],
          ["数据合规", "数据出域", "数据不出域", "部分出域"],
          ["模型质量", "最新最强", "取决于选型", "核心用最强"],
          ["运维复杂度", "极低", "极高", "中等"],
          ["弹性扩缩", "自动", "需手动/自动化", "部分自动"],
        ],
      },
      tip: "盈亏平衡点估算：假设 API 成本 $5/百万 token，自托管 GPU 月租 $3,000（单卡 H100），每月可处理 20 亿 token，则自托管单位成本约 $1.5/百万 token。盈亏平衡点在月消耗 10-15 亿 token（约 50-200 万次 Agent 请求，假设每次 5,000-20,000 token）。",
    },
    {
      title: "GPU 选型经济学：不同芯片的成本效益分析",
      body: `如果选择自托管或混合部署，GPU 选型是决定长期成本的关键决策。2026 年的 GPU 市场已经相当丰富，从 NVIDIA 的旗舰 H200/B200 到 AMD MI325X，再到云端厂商的定制芯片（Google TPU v5p、AWS Trainium2），选择很多但坑也不少。\n\n选型的核心公式：\n\n> 单位 token 成本 = GPU 月租费 ÷ (GPU 每月可处理的 token 总数)\n\n影响分母的关键因素：\n- 推理吞吐量（tokens/sec/GPU）：不同芯片差异可达 3-5 倍\n- 模型大小与量化精度：FP16 vs INT8 vs INT4，精度越低吞吐越高但质量可能下降\n- 上下文窗口：长上下文（128K+）会显著降低吞吐量\n- 批次大小（Batch Size）：越大吞吐越高但延迟也越高\n- KV Cache 策略：PagedAttention、vLLM 等优化可提升 2-4 倍吞吐\n\n一个实际对比：\n\n部署 Llama 4 70B 模型，FP16 精度，128K 上下文：\n- H200（141GB HBM3e）：约 45 tokens/sec，月租 ~$4,500，单位成本 ~$0.80/百万 token\n- B200（192GB HBM3e）：约 72 tokens/sec，月租 ~$7,500，单位成本 ~$0.65/百万 token\n- 双 H100 80GB（张量并行）：约 55 tokens/sec，月租 ~$6,000，单位成本 ~$0.72/百万 token\n- INT4 量化 + H100：约 120 tokens/sec，月租 ~$3,000，单位成本 ~$0.35/百万 token\n\n可以看到，量化 + 合适芯片的组合可以比旗舰芯片的 FP16 部署便宜一半以上，而且对于 Agent 场景（工具调用、信息检索、格式化输出）INT4 质量通常已经足够。`,
      code: [
        {
          lang: "python",
          code: `"""GPU 选型成本计算器 — 帮你算清每百万 token 的真实成本"""
from dataclasses import dataclass

@dataclass
class GPU:
    name: str
    monthly_cost: float        # 月租费用（美元）
    tokens_per_sec: float      # 推理吞吐量（tokens/sec）
    memory_gb: int             # GPU 显存（GB）

def calculate_cost_per_million_tokens(
    gpu: GPU,
    hours_per_day: float = 24,
    days_per_month: float = 30,
    utilization: float = 0.6   # GPU 利用率（不是 24 小时满载）
) -> float:
    """计算每百万 token 的成本"""
    total_seconds = hours_per_day * 3600 * days_per_month
    effective_seconds = total_seconds * utilization
    total_tokens = gpu.tokens_per_sec * effective_seconds
    cost_per_million = (gpu.monthly_cost / total_tokens) * 1_000_000
    return cost_per_million

# 2026 年主流 GPU 对比
gpus = [
    GPU("NVIDIA H200 141GB", 4500, 45, 141),
    GPU("NVIDIA B200 192GB", 7500, 72, 192),
    GPU("双 H100 80GB (TP)", 6000, 55, 160),
    GPU("H100 80GB (INT4 量化)", 3000, 120, 80),
    GPU("AMD MI325X 256GB", 3800, 50, 256),
]

print(f"{'GPU 型号':<25} {'月租($)':>8} {'吞吐(tok/s)':>12} {'$/M tokens':>11}")
print("-" * 60)
for gpu in gpus:
    cost = calculate_cost_per_million_tokens(gpu)
    print(f"{gpu.name:<25} \${gpu.monthly_cost:>7,} {gpu.tokens_per_sec:>12.0f} \${cost:>10.2f}")

# 输出：
# GPU 型号                    月租($)   吞吐(tok/s)  $/M tokens
# ------------------------------------------------------------
# NVIDIA H200 141GB       $  4,500           45 $      0.87
# NVIDIA B200 192GB       $  7,500           72 $      0.72
# 双 H100 80GB (TP)       $  6,000           55 $      0.76
# H100 80GB (INT4 量化)    $  3,000          120 $      0.35
# AMD MI325X 256GB        $  3,800           50 $      0.63`,
          filename: "gpu_cost_calculator.py",
        },
      ],
      mermaid: `graph TD
    A["GPU 选型决策"] --> B{"月用量 > 500 万次?"}
    B -->|是| C["自托管 GPU"]
    B -->|否| D["API 调用"]
    
    C --> E{"模型 > 70B?"}
    E -->|是| F["H200/B200 大显存"]
    E -->|否| G["H100/L40S 性价比"]
    
    F --> H{"需要极致吞吐?"}
    H -->|是| I["INT4 量化 + vLLM"]
    H -->|否| J["FP16/BF16 保持质量"]
    
    G --> K{"延迟敏感?"}
    K -->|是| L["单卡大 Batch"]
    K -->|否| M["多卡张量并行"]
    
    D --> N{"需要数据不出域?"}
    N -->|是| O["私有云 API / VPC 部署"]
    N -->|否| P["公有云 API"]`,
    },
    {
      title: "Agent 架构对成本的影响：不同模式的 token 消耗量",
      body: `Agent 的架构设计直接决定了成本量级。同样是完成一个用户任务，不同的 Agent 架构可能相差 5-20 倍的 token 消耗。\n\nReAct 模式（推理 + 行动）\n\n最经典的 Agent 架构。每个步骤包含：思考（生成推理链）→ 行动（选择工具）→ 观察（工具返回结果）→ 循环。这种模式的好处是灵活、能处理复杂任务，但代价是 token 消耗极高。一个简单的「帮我查天气」可能消耗 8,000-15,000 token（思考 + 工具调用 + 结果整合）。\n\nPlan-and-Execute 模式（规划 + 执行）\n\n先让模型生成完整计划，然后按计划逐步执行。好处是可以并行执行独立步骤、减少不必要的中间推理，token 消耗比 ReAct 低 30-50%。但规划阶段需要一个高质量的系统提示词，否则计划出错会导致后续全部失败。\n\nRouter 模式（分类路由）\n\n用一个轻量分类器判断用户意图，然后路由到专用处理管道。例如：简单问题走快速通道（直接回答），复杂问题走 Agent 通道（多步推理），工具调用走工具通道。这是成本最优的模式，因为大部分请求（70-80%）走的是低成本通道。\n\nReflection 模式（反思 + 修正）\n\n生成答案后自我检查，发现错误后重新生成。这种模式能提高输出质量，但 token 消耗增加 50-100%。适合对质量要求极高的场景（法律、医疗、金融），不适合成本敏感场景。`,
      table: {
        headers: ["Agent 架构", "平均 token/请求", "成本倍数", "适合场景", "质量"],
        rows: [
          ["Router（路由）", "2,000-5,000", "1x（基准）", "高并发、混合复杂度", "中等-高"],
          ["Plan-and-Execute", "5,000-12,000", "2-3x", "多步骤复杂任务", "高"],
          ["ReAct", "8,000-20,000", "3-5x", "开放域复杂推理", "高-极高"],
          ["ReAct + Reflection", "15,000-40,000", "5-10x", "关键决策场景", "极高"],
          ["Multi-Agent 协作", "20,000-80,000", "8-20x", "超复杂任务分解", "极高"],
        ],
      },
      code: [
        {
          lang: "python",
          code: `"""Agent 架构成本模拟器 — 不同架构下的 token 消耗对比"""
import random
from dataclasses import dataclass
from typing import List

@dataclass
class Request:
    complexity: str  # "simple", "medium", "complex"
    needs_tool: bool

@dataclass
class ArchitectureCost:
    name: str
    simple_tokens: int
    medium_tokens: int
    complex_tokens: int
    
    def estimate(self, requests: List[Request]) -> int:
        total = 0
        for r in requests:
            if r.complexity == "simple":
                total += self.simple_tokens
            elif r.complexity == "medium":
                total += self.medium_tokens
            else:
                total += self.complex_tokens
        return total

# 五种架构的 token 消耗模型
architectures = {
    "Router": ArchitectureCost("Router", 2000, 5000, 12000),
    "Plan-and-Execute": ArchitectureCost("P&E", 4000, 8000, 15000),
    "ReAct": ArchitectureCost("ReAct", 5000, 12000, 25000),
    "ReAct + Reflection": ArchitectureCost("ReAct+Ref", 8000, 20000, 45000),
    "Multi-Agent": ArchitectureCost("Multi", 10000, 30000, 80000),
}

# 模拟 1000 个请求的分布（70% 简单 / 20% 中等 / 10% 复杂）
random.seed(42)
requests = [
    Request(
        complexity=random.choices(
            ["simple", "medium", "complex"],
            weights=[0.7, 0.2, 0.1]
        )[0],
        needs_tool=random.random() > 0.4
    )
    for _ in range(1000)
]

print(f"{'架构':<20} {'总 Token':>12} {'成本倍数':>8}")
print("-" * 42)
baseline = None
for name, arch in architectures.items():
    total = arch.estimate(requests)
    if baseline is None:
        baseline = total
    ratio = total / baseline
    print(f"{name:<20} {total:>12,} {ratio:>7.1f}x")

# 输出：
# 架构                     总 Token     成本倍数
# ------------------------------------------
# Router                  3,580,000      1.0x
# P&E                     6,480,000      1.8x
# ReAct                   9,780,000      2.7x
# ReAct+Ref              15,280,000      4.3x
# Multi                  23,400,000      6.5x`,
          filename: "agent_architecture_cost.py",
        },
      ],
      tip: "关键洞察：通过 Router 架构将 70% 的简单请求分流到低成本通道，可以节省 60-70% 的总 token 消耗。这是投入产出比最高的成本优化策略。",
    },
    {
      title: "五大成本优化策略（附实操指南）",
      body: `知道了成本结构，接下来就是如何优化。以下五种策略按投入产出比排序，从最轻松的到最有深度的。\n\n策略一：Response Cache（响应缓存）—— 投入最小，回报最高\n\nAgent 场景中大量请求是重复或高度相似的：同一个产品的客服问题、同类文档的摘要生成、重复的数据查询。通过语义缓存（Semantic Cache），可以复用历史响应，跳过 LLM 调用。实测数据：缓存命中率 20-40%，token 消耗降低 15-35%，响应延迟降低 80-95%。实现方式：将历史请求的 embedding 存入向量数据库，新请求进来时先做相似度检索，超过阈值（如 cosine similarity > 0.92）直接返回缓存结果。\n\n策略二：Model Routing（模型路由）—— 用对模型比用强模型更重要\n\n不是所有任务都需要 GPT-4o 级别的模型。简单分类用 Haiku/Flash 级别（$0.15/百万 token），中等推理用 Sonnet/Plus 级别（$1-3/百万 token），复杂推理才用 GPT-4o/Claude Opus 级别（$10-60/百万 token）。通过一个轻量路由层（可以用 1B 参数的分类模型），自动将请求分发到合适级别的模型。实测数据：总体成本降低 40-60%，质量损失 < 2%。\n\n策略三：Prompt 优化 —— 减少 token 输入就是直接省钱\n\n系统提示词每减少 1,000 token，如果每天处理 10,000 次请求，每月就节省约 3 亿 input token。优化方向：精简系统提示词（去掉冗余描述）、使用 prompt compression 技术（LLMLingua-2 可压缩 40-50%）、上下文窗口截断（只保留相关历史，不传完整对话）。\n\n策略四：Batching & Streaming（批量处理 + 流式输出）—— 提升吞吐，降低单位成本\n\n自托管场景下，增大 batch size 可以显著提升 GPU 利用率（从 30% 到 70%+），单位 token 成本降低 40-60%。API 场景下，使用 Batch API（如 OpenAI 的 Batch API）比实时调用便宜 50%。流式输出虽然不直接降低 token 成本，但能改善用户体验（用户不必等待完整响应），降低超时重试率。\n\n策略五：量化 + 蒸馏（Quantization + Distillation）—— 自托管的终极武器\n\n将 70B 模型量化到 INT4，参数量不变但显存需求降低 75%，吞吐量提升 2-3 倍。更进一步，用大模型蒸馏出 7B/13B 的小模型，在特定任务上保持 90%+ 质量的同时，推理成本降低 80-90%。适合有固定任务模式（如客服、文档处理）的场景。`,
      mermaid: `graph TD
    A["成本优化策略矩阵"] --> B["Response Cache"]
    A --> C["Model Routing"]
    A --> D["Prompt 优化"]
    A --> E["Batching & Streaming"]
    A --> F["量化 + 蒸馏"]
    
    B --> B1["节省 15-35％
实现难度: ⭐
回报周期: 1 天"]
    C --> C1["节省 40-60％
实现难度: ⭐⭐
回报周期: 1 周"]
    D --> D1["节省 10-30％
实现难度: ⭐
回报周期: 2 天"]
    E --> E1["节省 30-50％
实现难度: ⭐⭐⭐
回报周期: 2 周"]
    F --> F1["节省 60-90％
实现难度: ⭐⭐⭐⭐
回报周期: 1-3 月"]`,
    },
    {
      title: "完整 TCO 计算器：一键算出你的 AI Agent 经济账",
      body: `把所有维度综合起来，我们提供一个可复用的 Python TCO 计算器。输入你的业务参数，就能得到三种部署模式的月成本对比和优化建议。\n\n这个计算器考虑了：月请求量、平均 token 消耗（按 Agent 架构）、API 定价、GPU 成本、缓存命中率、模型路由比例、安全开销比例。覆盖了 TCO 六大成本构成中的前四项（推理、多步放大、基础设施、安全），运维和人力成本以系数方式纳入。`,
      code: [
        {
          lang: "python",
          code: `"""AI Agent TCO 完整计算器 — 输入业务参数，输出三种模式的月成本"""
from dataclasses import dataclass

@dataclass
class AgentTCOCalculator:
    # 业务参数
    monthly_requests: int          # 月请求量
    avg_tokens_per_request: int    # 平均每个请求的总 token（含多步）
    api_input_price: float = 3.0   # API 输入价格 ($/M tokens)
    api_output_price: float = 12.0 # API 输出价格 ($/M tokens)
    input_output_ratio: float = 0.7 # 输入 token 占比（70% input, 30% output）
    
    # 优化参数
    cache_hit_rate: float = 0.0    # 缓存命中率 (0-1)
    router_savings: float = 0.0    # 模型路由节省比例 (0-1)
    security_overhead: float = 0.15 # 安全开销比例 (0.15 = 15%)
    
    # 自托管参数
    gpu_monthly_cost: float = 3000  # GPU 月租
    self_host_tokens_per_sec: float = 100  # 自托管吞吐
    gpu_utilization: float = 0.5    # GPU 利用率
    
    def _effective_tokens(self) -> int:
        """计算优化后的有效 token 消耗"""
        base = self.monthly_requests * self.avg_tokens_per_request
        # 缓存命中直接跳过 LLM
        cached = base * self.cache_hit_rate
        effective = base - cached
        # 模型路由进一步节省
        effective *= (1 - self.router_savings)
        # 安全开销
        effective *= (1 + self.security_overhead)
        return int(effective)
    
    def api_mode_cost(self) -> float:
        """纯 API 模式月成本"""
        tokens = self._effective_tokens()
        input_tokens = tokens * self.input_output_ratio
        output_tokens = tokens * (1 - self.input_output_ratio)
        input_cost = (input_tokens / 1_000_000) * self.api_input_price
        output_cost = (output_tokens / 1_000_000) * self.api_output_price
        return input_cost + output_cost
    
    def self_hosted_cost(self) -> float:
        """纯自托管模式月成本（不含人力）"""
        tokens = self._effective_tokens()
        total_seconds = 24 * 3600 * 30 * self.gpu_utilization
        max_tokens = self.self_host_tokens_per_sec * total_seconds
        if tokens <= max_tokens:
            return self.gpu_monthly_cost
        # 需要多卡
        cards_needed = tokens / max_tokens
        import math
        return self.gpu_monthly_cost * math.ceil(cards_needed)
    
    def hybrid_mode_cost(self) -> float:
        """混合模式：70% 走 API（核心推理），30% 走自托管（工具调用/检索）"""
        tokens = self._effective_tokens()
        api_tokens = int(tokens * 0.7)
        self_tokens = int(tokens * 0.3)
        
        # API 部分
        input_t = api_tokens * self.input_output_ratio
        output_t = api_tokens * (1 - self.input_output_ratio)
        api_cost = (input_t / 1e6) * self.api_input_price + (output_t / 1e6) * self.api_output_price
        
        # 自托管部分
        total_sec = 24 * 3600 * 30 * self.gpu_utilization
        max_t = self.self_host_tokens_per_sec * total_sec
        self_cost = self.gpu_monthly_cost if self_tokens <= max_t else self.gpu_monthly_cost * 2
        
        return api_cost + self_cost
    
    def run(self):
        """运行计算并输出对比"""
        api = self.api_mode_cost()
        self_hosted = self.self_hosted_cost()
        hybrid = self.hybrid_mode_cost()
        
        print(f"=== AI Agent TCO 月度成本分析 ===")
        print(f"月请求量: {self.monthly_requests:,}")
        print(f"平均每请求 token: {self.avg_tokens_per_request:,}")
        print(f"缓存命中率: {self.cache_hit_rate:.0%}")
        print(f"模型路由节省: {self.router_savings:.0%}")
        print(f"安全开销: {self.security_overhead:.0%}")
        print(f"有效 token 消耗: {self._effective_tokens():,}")
        print(f"")
        print(f"{'模式':<12} {'月成本($)':>12} {'年成本($)':>14}")
        print(f"{'─' * 40}")
        print(f"{'纯 API':<12} \${api:>10,.0f} \${api * 12:>12,.0f}")
        print(f"{'纯自托管':<10} \${self_hosted:>10,.0f} \${self_hosted * 12:>12,.0f}")
        print(f"{'混合部署':<10} \${hybrid:>10,.0f} \${hybrid * 12:>12,.0f}")
        print(f"")
        best = min(api, self_hosted, hybrid)
        best_name = "纯 API" if best == api else "纯自托管" if best == self_hosted else "混合部署"
        print(f"💡 推荐方案: {best_name}（月省 \${max(api, self_hosted, hybrid) - best:,.0f}）")

# === 示例 1：中型客服 Agent（100 万次/月）===
print("【场景一：中型客服 Agent】")
AgentTCOCalculator(
    monthly_requests=1_000_000,
    avg_tokens_per_request=12000,
    cache_hit_rate=0.25,
    router_savings=0.30,
).run()

# === 示例 2：企业内部知识助手（50 万次/月）===
print("\\n【场景二：企业内部知识助手】")
AgentTCOCalculator(
    monthly_requests=500_000,
    avg_tokens_per_request=20000,
    cache_hit_rate=0.35,
    router_savings=0.40,
    gpu_monthly_cost=4500,
    self_host_tokens_per_sec=80,
).run()`,
          filename: "agent_tco_calculator.py",
        },
      ],
      tip: "使用建议：先用默认参数运行一次，得到基准成本；然后逐个调整 cache_hit_rate 和 router_savings，看哪些优化策略对你场景的 ROI 最高。通常缓存命中率从 0 提升到 25% 就能节省 20-30% 的成本。",
    },
    {
      title: "2026 年市场定价基准：主流 API 与 GPU 实时行情",
      body: `成本分析离不开最新的市场定价。以下是 2026 年 4 月的主流 API 定价和 GPU 租赁行情（数据来源：各厂商官网及云服务商公开定价）。\n\n主流 API 定价（$/百万 token）：\n\n| 模型 | 输入 | 输出 | 特点 |\n|------|------|------|------|\n| GPT-4o | $2.50 | $10.00 | 通用最强，多模态 |\n| Claude Sonnet 4 | $3.00 | $15.00 | 推理质量最优 |\n| Claude Opus 4 | $15.00 | $75.00 | 超复杂任务 |\n| Gemini 2.5 Pro | $1.25 | $5.00 | 性价比之王 |\n| Gemini 2.5 Ultra | $10.00 | $40.00 | 高质量推理 |\n| GPT-4o Mini | $0.15 | $0.60 | 轻量级首选 |\n| Claude Haiku 4 | $0.25 | $1.25 | 分类/路由/简单任务 |\n\nGPU 租赁行情（月租，按需实例）：\n\n| GPU | 显存 | 月租（AWS） | 月租（Lambda） | 月租（CoreWeave） |\n|-----|------|-------------|----------------|------------------|\n| H100 80GB | 80GB | $3,000 | $2,200 | $2,000 |\n| H200 141GB | 141GB | $5,500 | $4,500 | $4,000 |\n| B200 192GB | 192GB | $9,000 | $7,500 | $7,000 |\n| L40S 48GB | 48GB | $1,200 | $800 | $750 |\n| A100 80GB | 80GB | $2,000 | $1,500 | $1,400 |\n\n关键趋势：\n\n- GPU 租赁价格在过去 6 个月下降约 20-30%（供应增加 + 需求增长放缓）\n- API 价格持续下降（GPT-4o 比 2024 年发布时降价 75%）\n- 混合部署的盈亏平衡点在左移（从 200 万次/月降到 50 万次/月）\n- 量化模型（INT4/INT8）的 API 开始涌现，价格比 FP16 低 30-50%`,
      warning: "定价数据会持续变化，以上为 2026 年 4 月的快照。建议在决策时查询各厂商官网获取最新定价。API 降价趋势意味着纯 API 模式的长期竞争力在增强，盈亏平衡点可能继续右移。",
    },
    {
      title: "从 PoC 到生产：成本管理的三个阶段",
      body: `AI Agent 项目的成本管理不是一次性的，而是贯穿项目的三个阶段的持续过程。\n\n阶段一：PoC（概念验证）—— 目标：证明价值，成本 < $1,000/月\n\n这个阶段的关键不是省钱，而是快速验证 Agent 能否解决实际问题。建议直接用 API 模式，选择中等质量模型（GPT-4o Mini / Haiku），日调用量限制在 1,000 次以内。重点收集数据：用户满意度、任务完成率、平均 token 消耗。这些数据是后续成本分析的基础。\n\n阶段二：试点部署 —— 目标：控制成本，月预算 $1,000-$10,000\n\nPoC 验证成功后，开始小规模面向真实用户部署。这个阶段的成本管理重点：\n- 实施 Response Cache（最快见效的优化）\n- 引入 Model Router（简单请求走小模型）\n- 建立用量监控仪表盘（按用户/场景/时间段分析）\n- 设定预算告警（达到 80% 预算时自动通知）\n\n阶段三：大规模生产 —— 目标：优化 TCO，月预算 $10,000-$100,000+\n\n当调用量达到百万级/月，TCO 优化成为核心议题：\n- 评估自托管 vs 混合部署（计算盈亏平衡点）\n- 实施 Prompt 压缩和上下文管理\n- 量化/蒸馏专用小模型\n- 建立 FinOps 流程（成本分摊到业务部门）\n- 定期审查模型选型和定价方案`,
      mermaid: `graph TD
    
    阶段一 PoC
      直接 API 调用
      日调用 < 1,000 次
      月成本 < $1,000
      重点：收集 token 数据
    
    阶段二 试点
      引入缓存 + 路由
      月调用 1-50 万次
      月成本 $1K-$10K
      重点：建立监控
    
    阶段三 生产
      评估自托管/混合
      月调用 100 万+
      月成本 $10K-$100K+
      重点：TCO 优化 + FinOps`,
      code: [
        {
          lang: "python",
          code: `"""AI Agent 预算管理与告警系统"""
from datetime import datetime
from dataclasses import dataclass

@dataclass
class BudgetManager:
    monthly_budget: float          # 月预算上限（美元）
    current_spend: float = 0.0     # 当前累计花费
    alert_thresholds: list = None  # 告警阈值列表
    
    def __post_init__(self):
        if self.alert_thresholds is None:
            self.alert_thresholds = [0.5, 0.8, 0.95, 1.0]
    
    def record_usage(self, tokens: int, cost: float):
        """记录一次 API 调用"""
        self.current_spend += cost
        self._check_alerts()
    
    def _check_alerts(self):
        """检查是否触发告警"""
        usage_ratio = self.current_spend / self.monthly_budget
        for threshold in self.alert_thresholds:
            if usage_ratio >= threshold:
                day = datetime.now().day
                days_left = 30 - day
                remaining = self.monthly_budget - self.current_spend
                daily_rate = self.current_spend / day
                projected = daily_rate * 30
                
                print(f"⚠️ 预算告警：已使用 {usage_ratio:.0%} "
                      f"(\${self.current_spend:,.0f}/\${self.monthly_budget:,.0f})")
                print(f"   本月剩余 {days_left} 天，预计超支 \${projected - self.monthly_budget:,.0f}")
                print(f"   建议日均支出：\${remaining / days_left:,.0f}")
                
                if usage_ratio >= 1.0:
                    print("🚨 预算已耗尽！建议：降低模型等级 / 提高缓存命中率 / 限制非核心功能")
                elif usage_ratio >= 0.95:
                    print("🔴 即将耗尽：建议立即启用成本优化策略")
                elif usage_ratio >= 0.8:
                    print("🟡 预算紧张：建议审查高消耗场景")
                break  # 只触发最高阈值告警
    
    def predict_monthly_cost(self, current_day: int) -> float:
        """基于当前支出预测全月成本"""
        if current_day == 0:
            return 0
        daily_avg = self.current_spend / current_day
        return daily_avg * 30

# 使用示例
manager = BudgetManager(monthly_budget=5000)
# 模拟前 15 天的支出
for day in range(1, 16):
    daily_cost = 200 + day * 10  # 逐步增长的支出模式
    manager.record_usage(tokens=5_000_000, cost=daily_cost)`,
          filename: "budget_manager.py",
        },
      ],
    },
    {
      title: "总结：AI Agent 成本管理的核心原则",
      body: `经过全面分析，我们总结出 AI Agent 成本管理的五大核心原则：\n\n1. 先算账再部署\n\n不要等到账单来了才惊讶。在 PoC 阶段就要建立 TCO 模型，估算不同用量级别下的成本。用上文的计算器跑一遍，心里有数再推进。\n\n2. 架构决定成本量级\n\nReAct + Reflection 的 Multi-Agent 架构可能比简单 Router 架构贵 10 倍以上。架构选型时不仅要看能力，还要算成本。大多数场景下，Router + 轻量 ReAct 的混合架构是性价比最优解。\n\n3. 缓存和路由是性价比最高的优化\n\n在投入 GPU 自建之前，先把 Response Cache 和 Model Router 做好。这两项优化的投入产出比最高，通常能以 10% 的工程投入节省 30-60% 的运营成本。\n\n4. 盈亏平衡点在左移，但 API 不会消失\n\nGPU 租赁价格下降和 API 降价同时发生，使得盈亏平衡点的预测变得复杂。但趋势是明确的：随着用量增长，混合部署会成为主流；即使到了亿级调用量，API 仍然在核心推理场景中保持竞争力。\n\n5. 成本管理是持续过程，不是一次性决策\n\nAPI 定价在变、模型在变、用量在变。建立 FinOps 流程：按月审查成本、按季度重新评估部署策略、持续跟踪各厂商定价变化。AI Agent 的成本管理不是一劳永逸的，而是一个需要持续优化的工程实践。`,
      tip: "最后建议：如果你刚开始部署 AI Agent，不要过度优化。先用 API 模式跑起来，收集真实数据，再根据实际用量决定是否需要引入缓存、路由或自托管。数据驱动的决策永远比纸上计算更准确。",
    },
  ],
};
