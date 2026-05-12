import { BlogPost } from './blog-types';

export const blog: BlogPost = {
    id: "blog-026",
    title: "DSRL 双空间强化学习：让 LLM 学会「自我剪枝」的推理进化",
    date: "2026-04-16",
    readTime: 18,
  category: "ai-research",
    summary: "arXiv 2026 年 4 月的重磅论文提出 DSRL（Dual Space RL），将强化学习从传统的条件空间 P(y|x) 扩展到了预训练空间 P(y)。核心发现令人震惊：负样本强化能激发模型的内省反思行为，使推理思维增长 14.89 倍。这篇论文不仅提出了新的训练范式，更揭示了 LLM 推理能力的底层机制——错误的推理路径需要被剪枝，而不仅仅是正确的路径需要被强化。",
    tags: ["强化学习", "LLM 训练", "推理能力", "DSRL", "PreRL", "arXiv"],
    author: "AI Master",
    content: [
        {
            title: "引言：RLVR 的天花板在哪里？",
            body: `2025 年以来，RLVR（Reinforcement Learning with Verifiable Rewards）成为了提升 LLM 推理能力的主流范式。从 DeepSeek-R1 的 GRPO 到 **OpenAI** 的 o1 系列，核心思路是一致的：用可验证的奖励信号，通过强化学习优化模型的推理过程。

但 RLVR 有一个根本性的瓶颈。

### 条件空间 P(y|x) 的局限

RLVR 优化的目标函数是 P(y|x)——给定输入 x，生成正确答案 y 的概率。这个思路很直观：给模型看题目和正确答案，让它学会输出正确的推理步骤。

**问题在于**：模型能输出什么样的 y，受限于它预训练阶段已经学到的输出分布。

**打个比方**：一个学生如果从来没学过微积分，你给他再多"正确答案"的反馈，他也推导不出微积分的解法。他的推理能力被已有的知识边界锁死了。

2026 年 4 月，arXiv 发表的 DSRL（Dual Space RL） 论文（[arXiv:2604.14142](https://arxiv.org/abs/2604.14142)）直击这个痛点，提出了一个全新的训练范式：在预训练空间 P(y) 上做强化学习。`,
        },
        {
            title: "核心思想：从 P(y|x) 到 P(y)",
            body: `### 两个空间的区别

条件空间 P(y|x)： 给定问题 x，优化答案 y 的生成概率。这是 RLVR 的做法。

**预训练空间 P(y)**： 不依赖具体问题，直接优化模型生成任意输出 y 的概率分布。这相当于改变模型的"思维习惯"本身。

### 训练流程架构对比

下面用架构图来直观展示两种训练空间的差异：`,
            mermaid: `graph TD
    A[预训练模型] --> B[P(y|x) 条件空间]
    A --> C[P(y) 预训练空间]
    B --> B1[输入问题 x]
    B1 --> B2[生成答案 y]
    B2 --> B3[验证奖励 R]
    B3 --> B4[GRPO/PPO 优化]
    B4 --> B5[更新 P(y|x)]
    C --> C1[无输入，自由生成]
    C1 --> C2[负样本识别]
    C2 --> C3[负奖励 -R]
    C3 --> C4[NSR-PreRL 优化]
    C4 --> C5[更新 P(y)]
    B5 -.梯度对齐.-> D[更强推理能力]
    C5 -.梯度对齐.-> D
    class D s3
    class C s2
    class B s1
    class A s0
    classDef s0 fill:#1a1a2e,color:#eee
    classDef s1 fill:#16213e,color:#eee
    classDef s2 fill:#0f3460,color:#eee
    classDef s3 fill:#b91c1c,color:#fff`,
        },
        {
            title: "负样本强化：让模型学会不走错路",
            body: `### 为什么 P(y) 能突破天花板？

论文证明了一个关键理论：log P(y) 和 log P(y|x) 之间存在强梯度对齐。这意味着在预训练空间做的优化，能够有效地迁移到条件推理任务上。

更惊人的是，作者发现了一种之前被忽视的机制：

### 什么是 NSR？

NSR（Negative Sample Reinforcement）不是告诉模型"什么是对的"，而是告诉模型"什么是错的，不要走这条路"。

这就像教孩子走路——不仅仅是告诉他"往这边走"，更是告诉他"那条路是悬崖，千万别去"。

### NSR-PreRL 训练流程`,
            mermaid: `sequenceDiagram
    participant M as 模型
    participant G as 负样本生成器
    participant R as 奖励模块
    participant O as 优化器

    M->>G: 自由生成推理路径
    G->>G: 识别错误推理步骤
    G->>G: Beam Search 高概率错误路径
    G->>R: 提交负样本集合
    R->>R: 分配负奖励 -R
    R->>O: 负奖励信号
    O->>M: 梯度反传（抑制错误路径）
    M->>M: 剪枝权重更新

    Note over M,O: 循环迭代 → 内省反思能力增长 14.89x

    M-->>R: 生成新路径
    R-->>O: 正/负奖励判断
    O-->>M: 持续优化`,
        },
        {
            title: "实验结果令人震惊",
            body: `这个流程展示了 NSR-PreRL 如何形成一个自洽的训练闭环：模型生成 → 识别错误 → 负奖励抑制 → 剪枝更新 → 再生成，循环迭代直到错误路径被有效剪枝。`,
            table: {
                headers: ["指标", "基线模型", "NSR-PreRL", "提升倍数"],
                rows: [
                    ["转换思维（Transition Thoughts）", "基准", "+14.89x", "14.89 倍"],
                    ["反思思维（Reflection Thoughts）", "基准", "+6.54x", "6.54 倍"],
                    ["推理任务准确率", "基准", "显著提升", "—"],
                ],
            },
        },
        {
            title: "为什么会这样？",
            body: `推理思维增长 14.89 倍—— 这不是微调能达到的效果，这是模型"认知架构"层面的改变。

NSR 的核心机制是剪枝错误的推理空间。模型在训练中学会了：`,
            list: [
                "识别错误推理路径 — \"这个方向走下去会得到错误答案\"",
                "主动内省反思 — \"我需要重新考虑这个步骤\"",
                "切换到正确路径 — \"换个思路试试\"",
            ],
        },
        {
            title: "DSRL：双空间 RL 的完整方案",
            body: `这恰好是人类解决复杂问题时的认知过程：试错 → 反思 → 修正。

### 两阶段训练策略`,
            code: [
                {
                    lang: "text",
                    code: `阶段 1：NSR-PreRL（预训练空间剪枝）
┌──────────────────────────────┐
│ • 负样本强化学习             │
│ • 剪枝错误推理路径           │
│ • 激发内省反思行为           │
│ • 扩展推理边界               │
└──────────────┬───────────────┘
               ↓
阶段 2：标准 RL（条件空间优化）
┌──────────────────────────────┐
│ • 基于正确推理的精细优化     │
│ • 提升特定任务的准确率       │
│ • 稳定输出格式               │
└──────────────────────────────┘`,
                },
            ],
        },
        {
            title: "为什么先剪枝再优化？",
            body: `### 为什么先剪枝再优化？

**类比园艺**：
- NSR-PreRL = 剪掉枯枝败叶（错误的推理路径）
- 标准 RL = 给健康枝条施肥（强化正确的推理路径）

如果先施肥再剪枝，养分会浪费在枯枝上。先剪枝，后优化，效率最高。

### 实验结果

在多个推理基准测试上，DSRL 一致性地超越了强基线：

- **数学推理任务**：显著提升
- **逻辑推理任务**：一致性超越
- **代码生成任务**：推理步骤更清晰`,
        },
        {
            title: "对行业的启示",
            body: `### 1. LLM 训练范式的转变

当前主流的 RLVR 训练可能低估了预训练空间的价值。DSRL 证明，在预训练空间做 RL 不仅可行，而且是突破推理能力天花板的关键。

### 2. 负样本的价值被严重低估

过去我们总是关注"给模型正确答案"，但 DSRL 证明"告诉模型什么是错的"同样重要，甚至更有效。这为数据合成和训练策略提供了新方向。

### 3. 内省反思是可训练的

论文首次实证证明，模型的"反思行为"（类似人类的"我再想想"）不是偶然出现的，而是可以通过训练系统性地激发的。这为构建更可靠的推理型 Agent 提供了理论基础。`,
        },
        {
            title: "技术细节：如何实现 NSR-PreRL？",
            body: `### 负样本生成

负样本不是随机生成的，而是通过以下方式获得：
- 模型在训练过程中自然产生的错误推理步骤
- 通过 beam search 等策略找到的高概率但错误的路径
- 对比学习中构造的反事实推理链

### 奖励设计

NSR 的奖励信号很简洁：对负样本给予负奖励。这比设计复杂的正奖励函数更简单、更有效。

### 梯度对齐的理论保证

论文证明了 log P(y) 和 log P(y|x) 的梯度在期望下高度对齐，这为"预训练空间优化能迁移到条件任务"提供了数学保证。

### Python 实现：NSR 训练循环示例

以下是一个简化的 NSR（负样本强化）训练循环，展示了核心逻辑：`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from torch.optim import AdamW
from transformers import AutoModelForCausalLM


class NSRTrainer:
    """Negative Sample Reinforcement Trainer
    
    核心思想：对负样本施加负奖励，抑制错误推理路径。
    """
    
    def __init__(self, model_name: str, lr: float = 1e-5, kl_coef: float = 0.1):
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        self.ref_model = AutoModelForCausalLM.from_pretrained(model_name)  # 参考模型
        self.optimizer = AdamW(self.model.parameters(), lr=lr)
        self.kl_coef = kl_coef  # KL 散度系数，防止策略崩溃
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.ref_model.to(self.device)
        self.ref_model.eval()
    
    def compute_log_probs(self, input_ids: torch.Tensor) -> torch.Tensor:
        """计算模型和参考模型的 log 概率"""
        with torch.no_grad():
            ref_outputs = self.ref_model(input_ids)
            ref_log_probs = torch.log_softmax(ref_outputs.logits, dim=-1)
        
        model_outputs = self.model(input_ids)
        model_log_probs = torch.log_softmax(model_outputs.logits, dim=-1)
        return model_log_probs, ref_log_probs
    
    def nsr_loss(
        self,
        input_ids: torch.Tensor,
        negative_samples: torch.Tensor,  # 负样本 token ids
        rewards: torch.Tensor,           # 负奖励（负数）
    ) -> torch.Tensor:
        """计算 NSR 损失
        
        L = -Σ [reward * (log P_θ(y) - log P_ref(y))] + β * KL(P_θ || P_ref)
        """
        model_lp, ref_lp = self.compute_log_probs(negative_samples)
        
        # 策略比率（重要性采样）
        log_ratio = model_lp - ref_lp
        policy_loss = -(rewards * log_ratio).sum(dim=-1).mean()
        
        # KL 正则化
        kl_div = (model_lp.exp() * (model_lp - ref_lp)).sum(dim=-1).mean()
        
        return policy_loss + self.kl_coef * kl_div
    
    def train_step(
        self,
        batch_negative_samples: torch.Tensor,
        batch_rewards: torch.Tensor,
    ) -> float:
        """单步训练"""
        self.optimizer.zero_grad()
        
        loss = self.nsr_loss(
            input_ids=None,
            negative_samples=batch_negative_samples,
            rewards=batch_rewards,
        )
        
        loss.backward()
        self.optimizer.step()
        
        return loss.item()
    
    def train(self, train_loader, epochs: int = 3):
        """完整训练循环"""
        for epoch in range(epochs):
            total_loss = 0
            for batch_neg, batch_rew in train_loader:
                batch_neg = batch_neg.to(self.device)
                batch_rew = batch_rew.to(self.device)
                loss = self.train_step(batch_neg, batch_rew)
                total_loss += loss
            print(f"Epoch {epoch+1}/{epochs}, Avg Loss: {total_loss:.4f}")


# 使用示例
# trainer = NSRTrainer("Qwen/Qwen2.5-7B")
# trainer.train(negative_sample_loader, epochs=3)`,
                },
            ],
        },
        {
            title: "NSR 核心实现说明",
            body: `这段代码展示了 NSR 的核心实现：
- **参考模型**：冻结的原始模型，用于 KL 散度正则化
- **策略比率**：衡量当前策略与参考策略的差异
- **负奖励传播**：对负样本施加负奖励，通过梯度反传抑制错误路径
- **KL 正则**：防止策略更新过猛导致模型崩溃`,
        },
        {
            title: "与其他工作的对比",
            body: `DSRL 的优势在于组合了两种空间的优势——先用预训练空间剪枝扩展边界，再用条件空间精细优化。`,
            table: {
                headers: ["方法", "优化空间", "核心机制", "局限性"],
                rows: [
                    ["RLVR (GRPO)", "P(y|x)", "正样本强化", "受限于预训练分布"],
                    ["DPO", "P(y|x)", "偏好优化", "需要偏好数据"],
                    ["NSR-PreRL", "P(y)", "负样本剪枝", "需要高质量负样本"],
                    ["**DSRL**", "**P(y) + P(y|x)**", "先剪枝后优化", "计算成本较高"],
                ],
            },
        },
        {
            title: "未来展望",
            body: `### 开源代码

论文的代码已公开在 [GitHub](https://github.com/Trae1ounG/Pretrain_Space_RLVR)，社区可以复现和扩展这一工作。

### 可能的研究方向`,
            list: [
                "NSR 在其他任务上的效果 — 代码生成、数学证明、科学推理",
                "负样本质量的影响 — 如何自动生成高质量的负样本",
                "双空间 RL 的扩展 — 能否引入第三个空间？",
                "与 MoE 架构的结合 — 不同专家是否可以学习不同的推理路径？",
            ],
        },
        {
            title: "Python 实现：双空间 RL 完整骨架",
            body: `以下是一个完整的 DSRL（双空间 RL）实现骨架，展示两个空间如何协同工作：`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from typing import Tuple, Optional


class DualSpaceRL:
    """DSRL: Dual Space Reinforcement Learning
    
    两阶段训练策略：
    阶段 1: NSR-PreRL — 在预训练空间 P(y) 上做负样本强化
    阶段 2: 标准 RL  — 在条件空间 P(y|x) 上做精细优化
    """
    
    def __init__(
        self,
        model: nn.Module,
        ref_model: nn.Module,
        lr: float = 1e-5,
        kl_coef: float = 0.1,
        pretrain_steps: int = 1000,
        condition_steps: int = 2000,
    ):
        self.model = model
        self.ref_model = ref_model
        self.ref_model.eval()  # 冻结参考模型
        
        self.optimizer = torch.optim.AdamW(model.parameters(), lr=lr)
        self.kl_coef = kl_coef
        self.pretrain_steps = pretrain_steps
        self.condition_steps = condition_steps
    
    # ─────────────────────────────────────────
    # 阶段 1: NSR-PreRL (预训练空间 P(y))
    # ─────────────────────────────────────────
    
    def pretrain_loss(
        self,
        negative_samples: torch.Tensor,
        rewards: torch.Tensor,
    ) -> torch.Tensor:
        """阶段 1 损失：负样本强化剪枝
        
        目标：在 P(y) 空间上，学会不走错误推理路径。
        """
        # 获取当前策略和参考策略的 log 概率
        curr_logits = self.model(negative_samples)
        curr_log_p = torch.log_softmax(curr_logits, dim=-1)
        
        with torch.no_grad():
            ref_logits = self.ref_model(negative_samples)
            ref_log_p = torch.log_softmax(ref_logits, dim=-1)
        
        # NSR 损失 = -reward * log_ratio + KL 正则
        log_ratio = curr_log_p - ref_log_p
        nsr_loss = -(rewards * log_ratio).sum(dim=-1).mean()
        kl_loss = (curr_log_p.exp() * log_ratio).sum(dim=-1).mean()
        
        return nsr_loss + self.kl_coef * kl_loss
    
    def pretrain_step(
        self,
        negative_samples: torch.Tensor,
        rewards: torch.Tensor,
    ) -> float:
        """执行一步预训练空间优化"""
        self.optimizer.zero_grad()
        loss = self.pretrain_loss(negative_samples, rewards)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
        self.optimizer.step()
        return loss.item()
    
    # ─────────────────────────────────────────
    # 阶段 2: 标准 RL (条件空间 P(y|x))
    # ─────────────────────────────────────────
    
    def condition_loss(
        self,
        prompts: torch.Tensor,
        completions: torch.Tensor,
        rewards: torch.Tensor,
    ) -> torch.Tensor:
        """阶段 2 损失：条件空间精细优化
        
        目标：在 P(y|x) 空间上，对正确答案进行强化。
        """
        # 拼接 prompt + completion
        full_seq = torch.cat([prompts, completions], dim=1)
        
        curr_logits = self.model(full_seq)
        curr_log_p = torch.log_softmax(curr_logits, dim=-1)
        
        with torch.no_grad():
            ref_logits = self.ref_model(full_seq)
            ref_log_p = torch.log_softmax(ref_logits, dim=-1)
        
        # 标准 RL 损失 (类似 GRPO)
        log_ratio = curr_log_p - ref_log_p
        rl_loss = -(rewards * log_ratio).sum(dim=-1).mean()
        kl_loss = (curr_log_p.exp() * log_ratio).sum(dim=-1).mean()
        
        return rl_loss + self.kl_coef * kl_loss
    
    def condition_step(
        self,
        prompts: torch.Tensor,
        completions: torch.Tensor,
        rewards: torch.Tensor,
    ) -> float:
        """执行一步条件空间优化"""
        self.optimizer.zero_grad()
        loss = self.condition_loss(prompts, completions, rewards)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
        self.optimizer.step()
        return loss.item()
    
    # ─────────────────────────────────────────
    # 完整训练流程
    # ─────────────────────────────────────────
    
    def train(
        self,
        pretrain_loader,    # 负样本数据加载器
        condition_loader,   # 条件数据加载器
    ):
        """DSRL 完整训练：先剪枝，后优化"""
        
        # 阶段 1: NSR-PreRL
        print("=" * 50)
        print("阶段 1: NSR-PreRL — 剪枝错误推理路径")
        print("=" * 50)
        for step, (neg_samples, neg_rewards) in enumerate(pretrain_loader):
            if step >= self.pretrain_steps:
                break
            loss = self.pretrain_step(neg_samples, neg_rewards)
            if step % 100 == 0:
                print(f"  Step {step}: loss = {loss:.4f}")
        
        # 更新参考模型为剪枝后的策略
        self.ref_model.load_state_dict(self.model.state_dict())
        
        # 阶段 2: 标准 RL
        print("=" * 50)
        print("阶段 2: 标准 RL — 条件空间精细优化")
        print("=" * 50)
        for step, (prompts, completions, rewards) in enumerate(condition_loader):
            if step >= self.condition_steps:
                break
            loss = self.condition_step(prompts, completions, rewards)
            if step % 100 == 0:
                print(f"  Step {step}: loss = {loss:.4f}")
        
        print("训练完成！")


# 使用示例
# model = load_model("Qwen/Qwen2.5-7B")
# ref_model = load_model("Qwen/Qwen2.5-7B")
# dsrl = DualSpaceRL(model, ref_model, pretrain_steps=1000, condition_steps=2000)
# dsrl.train(pretrain_loader, condition_loader)`,
                },
            ],
        },
        {
            title: "总结",
            body: `DSRL 这篇论文的核心贡献不是提出了一个新算法，而是揭示了 LLM 推理能力的一个根本机制：

> 推理能力的提升不仅仅是"学会正确答案"，更是"学会不走错路"。

负样本强化让模型获得了"自我剪枝"的能力——在推理过程中主动识别和放弃错误路径，同时进行内省反思。这种能力使模型的推理思维增长了 14.89 倍。

这对于构建更可靠、更智能的 AI 系统具有重要意义。当模型学会了"三思而后行"，它就不再只是一个文本生成器，而更接近一个真正的推理者。

---

***论文来源**：[arXiv:2604.14142](https://arxiv.org/abs/2604.14142) "From P(y|x) to P(y): Investigating Reinforcement Learning in Pre-train Space"*`,
        },
    ],
};
