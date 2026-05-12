import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-005",
    title: "RLHF（一）：基于人类反馈的强化学习",
    category: "llm",
    tags: ["RLHF", "对齐", "强化学习"],
    summary: "从奖励模型到 PPO 优化，理解大模型对齐的核心技术",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
  learningPath: {
    routeId: "rlhf-series",
    phase: 1,
    order: 1,
    nextStep: "ethics-005",
    prevStep: null,
  },
    content: [
      {
        title: "1. 为什么需要对齐：从「能说话」到「说对话」",
        body: `预训练和有监督微调（**SFT**）让大模型掌握了语言能力和基本的指令遵循，但这只是第一步。一个未经对齐的模型可能给出技术上正确但实际有害的回答——比如详细指导如何制作危险品，或者以极其冗长啰嗦的方式回答一个简单问题。对齐（Alignment）的核心使命就是让模型的输出不仅正确，而且有用、诚实、无害。

对齐问题的根源在于预训练目标的局限性。预训练阶段，模型的目标是最大化下一个 token 的概率，这个目标与「对人类有帮助」之间存在显著的 Gap。**SFT** 阶段通过指令数据缩小了这个 Gap，但仍然无法覆盖所有边缘情况：模型可能学会讨好用户而编造事实（Sycophancy），也可能在面对模糊指令时产生不可预测的行为。**RLHF** 通过引入人类偏好信号，直接将「什么是对的回答」这个概念注入训练过程。

2022 年 **OpenAI** 的 InstructGPT 论文是 **RLHF** 的里程碑工作。实验表明，经过 **RLHF** 对齐的 1.3B 参数模型，在有用性和安全性上显著超越了参数量大 100 倍的 GPT-3。这一发现颠覆了「越大越好」的直觉，证明了数据质量和对齐方法的重要性远超过单纯的参数规模。`,
        code: [
          {
            lang: "python",
            code: `# 对比：SFT 模型 vs RLHF 模型的输出差异
# 问题："如何制造炸药？"

# SFT 模型可能输出：
sft_response = """制造炸药需要以下步骤：
1. 准备硝酸铵和柴油...
2. 按照 94:6 的比例混合...
"""

# RLHF 模型应该输出：
rlhf_response = """我无法提供制造爆炸物的指导。
这类信息可能对人身安全造成严重威胁。
如果您对化学感兴趣，我可以介绍一些安全的化学实验。"""

# 对比指标：有害内容率（%）
# SFT:  18.7%
# RLHF:  2.3%
# 改进幅度: ~88%`
          },
          {
            lang: "python",
            code: `# 对齐目标的数学表述
# 预训练目标：最大化 p(x_t | x_<t)
# RLHF 目标：最大化 E_{x~pi}[r(x)] - beta * KL(pi || pi_ref)
#
# 其中：
#   r(x)  = 奖励模型对输出 x 的评分
#   pi    = 当前策略（待优化的模型）
#   pi_ref = 参考策略（SFT 模型）
#   beta  = KL 惩罚系数，控制偏离程度
#
# KL 惩罚项防止模型为了高分而偏离 SFT 模型太远
# 避免出现「极端讨好但事实错误」的输出

import torch

def alignment_objective(reward, kl_div, beta=0.1):
    """RLHF 对齐目标函数"""
    return reward.mean() - beta * kl_div.mean()

# KL 散度计算
def compute_kl(pi_logits, ref_logits):
    pi_probs = torch.softmax(pi_logits, dim=-1)
    log_ratio = pi_logits - ref_logits
    kl = (pi_probs * log_ratio).sum(dim=-1)
    return kl`
          }
        ],
        table: {
          headers: ["训练阶段", "训练目标", "数据需求", "输出特点"],
          rows: [
            ["预训练", "预测下一个 token", "万亿级无标注文本", "能续写但不懂指令"],
            ["SFT", "匹配指令-回答对", "万级高质量指令", "能回答但可能有害"],
            ["RLHF", "最大化人类偏好奖励", "千级偏好排序数据", "有用、诚实、无害"],
            ["DPO", "直接优化偏好概率", "千级偏好排序数据", "效果接近 RLHF"],
          ]
        },
        mermaid: `graph LR
    A["预训练 Base Model"] --> B["SFT 指令模型"]
    B --> C["生成多个候选回答"]
    C --> D["人类标注偏好排序"]
    D --> E["训练奖励模型 RM"]
    E --> F["PPO 强化学习优化"]
    F --> G["RLHF 对齐模型"]
    B --> G2["DPO 直接优化"]
    D --> G2
    G2 --> G3["DPO 对齐模型"]`,
        tip: "InstructGPT 的关键发现：1.3B + RLHF > 175B GPT-3 的有用性和安全性。对齐的质量比模型的规模更重要。",
        warning: "不对齐的模型可能产生有害内容。研究表明，未经 RLHF 的模型在有害内容测试中失败率超过 18%，而 RLHF 可将其降至 2% 以下。"
      },
      {
        title: "2. 奖励模型训练：让机器学会「评判」",
        body: `奖励模型（Reward Model, RM）是 **RLHF** 流程中的核心组件之一。它的任务极其明确：给定一个指令和模型的回答，输出一个标量分数，量化这个回答的「好坏」。这个分数将作为强化学习中策略优化的优化目标，因此奖励模型的质量直接决定了 **RLHF** 的最终效果。

奖励模型的训练依赖人类偏好数据。具体来说，让 **SFT** 模型对同一指令生成 K 个不同回答（通常 K=4-9），由人类标注者对这些回答进行两两比较或排序。每条偏好数据的形式为 (指令, 偏好回答, 非偏好回答)，标注者需要判断哪个回答更好，有时还需要给出理由。高质量的标注需要标注者具备一定的领域知识，并能从有用性、诚实性、无害性三个维度综合评估。

训练奖励模型通常从 **SFT** 模型初始化，在模型顶部添加一个标量输出头（Scalar Head），然后用 Bradley-Terry 模型作为损失函数进行优化。Bradley-Terry 模型假设两个回答的偏好概率只与它们的奖励值之差有关：P(y1 > y2) = sigma(r(y1) - r(y2))。这个简洁的公式将排序问题转化为二元分类问题，使得训练过程稳定高效。奖励模型训练完成后，其评分能力应与人类标注者保持高度一致——通常用标注者间一致性（Inter-Annotator Agreement）作为基准线。`,
        code: [
          {
            lang: "python",
            code: `# 偏好数据收集：生成候选回答
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model = AutoModelForCausalLM.from_pretrained("sft-model")
tokenizer = AutoTokenizer.from_pretrained("sft-model")

def generate_candidates(prompt, n=4, temperature=0.7):
    """为同一指令生成多个候选回答"""
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    outputs = model.generate(
        **inputs,
        num_return_sequences=n,
        temperature=temperature,
        top_p=0.9,
        do_sample=True,
        max_new_tokens=512,
    )
    return [tokenizer.decode(o, skip_special_tokens=True) for o in outputs]

# 示例：生成 4 个候选回答
prompt = "解释量子纠缠的概念"
candidates = generate_candidates(prompt, n=4)
for i, c in enumerate(candidates):
    print(f"候选 {i+1}: {c[:100]}...")`
          },
          {
            lang: "python",
            code: `# Bradley-Terry 奖励模型训练
import torch
import torch.nn as nn
from transformers import AutoModelForCausalLM

class RewardModel(nn.Module):
    """基于语言模型的奖励模型"""
    def __init__(self, base_model_name):
        super().__init__()
        self.base = AutoModelForCausalLM.from_pretrained(base_model_name)
        # 用最后一层 hidden state 的第一个 token 作为奖励值
        self.reward_head = nn.Linear(self.base.config.hidden_size, 1)

    def forward(self, input_ids, attention_mask):
        outputs = self.base(
            input_ids=input_ids,
            attention_mask=attention_mask,
            output_hidden_states=True,
        )
        hidden = outputs.hidden_states[-1][:, 0, :]  # [CLS] token
        return self.reward_head(hidden).squeeze(-1)

# Bradley-Terry 损失
def bradley_terry_loss(r_chosen, r_rejected):
    """L = -log(sigma(r_chosen - r_rejected))"""
    return -nn.functional.logsigmoid(r_chosen - r_rejected).mean()

# 训练循环
optimizer = torch.optim.AdamW(rm.parameters(), lr=1e-5)
for batch in dataloader:
    r_chosen = rm(batch["chosen_ids"], batch["chosen_mask"])
    r_rejected = rm(batch["rejected_ids"], batch["rejected_mask"])
    loss = bradley_terry_loss(r_chosen, r_rejected)
    loss.backward()
    optimizer.step()`
          }
        ],
        table: {
          headers: ["数据集", "偏好对数量", "标注方式", "覆盖领域"],
          rows: [
            ["Anthropic HH", "~170K", "人类标注", "对话、问答、创意写作"],
            ["OpenAI Summaries", "~65K", "人类标注", "文本摘要"],
            ["UltraFeedback", "~64K", "GPT-4 标注", "多领域综合"],
            ["PKU-SafeRLHF", "~300K", "人类+AI 标注", "安全性对齐"],
          ]
        },
        mermaid: `graph TD
    A["SFT 模型"] --> B["对指令生成 K 个回答"]
    B --> C["人类标注者两两比较"]
    C --> D["偏好数据集 (chosen, rejected)"]
    D --> E["初始化 RM (SFT + 标量头)"]
    E --> F["Bradley-Terry 损失训练"]
    F --> G["奖励模型 Ready"]
    G --> H["验证：与人类一致性 > 70％"]`,
        tip: "奖励模型训练的关键技巧：使用多个 SFT 模型的集成来生成候选回答，确保候选回答的多样性。单一模型生成的回答可能过于同质化，导致奖励模型无法学到细粒度的判别能力。",
        warning: "奖励模型过拟合（Reward Hacking）是 RLHF 中最常见的问题。如果奖励模型在某些分布外的输入上评分不可靠，策略模型会利用这个漏洞生成「看似高分但实际质量差」的回答。"
      },
      {
        title: "3. PPO 优化：策略梯度的精妙平衡",
        body: `PPO（Proximal Policy Optimization）是 **RLHF** 流程中将奖励模型信号转化为模型参数更新的核心算法。它的核心思想并不复杂：用奖励模型给模型生成的回答打分，然后根据这个分数来调整模型参数——高分回答的概率应该增加，低分回答的概率应该减少。但在实际工程中，这个过程远比听起来复杂。

PPO 的关键创新在于它的裁剪目标函数（Clipped Objective）。传统的策略梯度方法（如 REINFORCE）容易出现更新步长过大导致策略崩溃的问题——某次更新后，模型可能完全偏离了之前的行为模式，产出毫无意义的内容。PPO 通过裁剪（Clipping）机制限制了每次更新的幅度：策略比率 r(theta) = pi_new(a|s) / pi_old(a|s) 被限制在 [1-epsilon, 1+epsilon] 范围内（通常 epsilon=0.2），确保策略不会在一次更新中偏离太远。

另一个重要的技术细节是 KL 惩罚。**RLHF** 训练中，策略模型相对于参考模型（**SFT** 模型）的 KL 散度会被作为惩罚项加入目标函数。这是因为如果没有 KL 惩罚，策略模型可能学会「走捷径」——生成极端的、讨好的但不准确的回答来获得高分。KL 惩罚确保模型在优化奖励的同时，不会过度偏离原有的语言能力。`,
        code: [
          {
            lang: "python",
            code: `# PPO 裁剪目标函数实现
import torch
import torch.nn.functional as F

def ppo_clip_loss(
    log_probs_new, log_probs_old, advantages,
    clip_epsilon=0.2
):
    """PPO 裁剪目标函数
    
    L_CLIP = E[min(r_t * A_t, clip(r_t) * A_t)]
    其中 r_t = pi_new / pi_old
    """
    ratio = torch.exp(log_probs_new - log_probs_old)
    # ratio shape: [batch_size]
    
    # 未裁剪的代理目标
    surrogate1 = ratio * advantages
    
    # 裁剪后的代理目标
    ratio_clipped = torch.clamp(ratio, 1 - clip_epsilon, 1 + clip_epsilon)
    surrogate2 = ratio_clipped * advantages
    
    # 取两者的最小值
    loss = -torch.min(surrogate1, surrogate2).mean()
    return loss

# 带 KL 惩罚的完整目标
def ppo_full_loss(
    log_probs_new, log_probs_old,
    advantages, rewards, kl_div,
    clip_epsilon=0.2, kl_coef=0.1
):
    pg_loss = ppo_clip_loss(log_probs_new, log_probs_old, advantages, clip_epsilon)
    kl_loss = kl_coef * kl_div.mean()
    # Value function loss (奖励模型的预测误差)
    vf_loss = 0.5 * F.mse_loss(rewards, rewards)  # 简化示例
    return pg_loss + kl_loss + vf_loss`
          },
          {
            lang: "python",
            code: `# PPO 训练循环（简化版）
from trl import PPOTrainer, PPOConfig
from transformers import AutoModelForCausalLM, AutoTokenizer

# 初始化
model = AutoModelForCausalLM.from_pretrained("sft-model")
ref_model = AutoModelForCausalLM.from_pretrained("sft-model")
tokenizer = AutoTokenizer.from_pretrained("sft-model")
reward_model = load_reward_model("reward-model")

ppo_config = PPOConfig(
    learning_rate=1.41e-5,
    mini_batch_size=4,
    batch_size=128,
    gradient_accumulation_steps=8,
    ppo_epochs=4,
    cliprange=0.2,
    vf_coef=0.1,
    kl_coef=0.05,
)

ppo_trainer = PPOTrainer(ppo_config, model, ref_model, tokenizer)

for epoch in range(num_epochs):
    for prompts in dataloader:
        # 1. 用当前策略生成回答
        responses = ppo_trainer.generate(prompts)
        
        # 2. 用奖励模型评分
        rewards = reward_model.score(prompts, responses)
        
        # 3. 计算 advantage（GAE）
        advantages = compute_gae(rewards)
        
        # 4. PPO 更新
        stats = ppo_trainer.step(prompts, responses, rewards)
        
        # 5. 监控 KL 散度
        kl = compute_kl_divergence(model, ref_model, prompts)
        if kl > kl_threshold:
            ppo_config.kl_coef *= 1.5  # 动态调整 KL 惩罚`
          }
        ],
        table: {
          headers: ["PPO 超参数", "典型值", "作用", "调参建议"],
          rows: [
            ["clip_epsilon", "0.2", "限制策略更新幅度", "过大导致不稳定，过小收敛慢"],
            ["kl_coef", "0.05-0.2", "KL 惩罚系数", "KL 散度大时增大，小时减小"],
            ["ppo_epochs", "2-4", "每个 batch 的 PPO 迭代次数", "越多越容易过拟合"],
            ["learning_rate", "1e-6 ~ 1e-5", "PPO 学习率", "比 SFT 低 1-2 个数量级"],
            ["batch_size", "128-256", "每个 step 的 prompt 数量", "越大越稳定但耗显存"],
          ]
        },
        mermaid: `graph TD
    A["SFT 策略模型"] --> B["采样生成回答"]
    B --> C["奖励模型评分"]
    C --> D["计算 Advantage (GAE)"]
    D --> E["PPO 裁剪更新"]
    E --> F["检查 KL 散度"]
    F -->|"KL 过大"| G["增大 KL 惩罚"]
    F -->|"KL 正常"| H["继续训练"]
    G --> E
    H --> A
    E --> I["收敛后得到 RLHF 模型"]`,
        tip: "PPO 训练时使用 GAE（Generalized Advantage Estimation）计算 advantage，而不是简单的 reward-to-go。GAE 通过引入 lambda 参数在偏差和方差之间做权衡，通常 lambda=0.95 效果最佳。",
        warning: "PPO 训练对超参数极其敏感。学习率过大、KL 惩罚过小或 batch_size 过小都可能导致训练崩溃。建议从小规模实验开始，逐步调整超参数。"
      },
      {
        title: "4. DPO 替代方案：绕过奖励模型的捷径",
        body: `尽管 PPO 在 InstructGPT 和 **GPT-4** 等商业模型中取得了巨大成功，但其训练复杂性和不稳定性一直是研究者和工程师的痛点。PPO 需要同时维护四个模型：策略模型、参考模型、奖励模型和价值模型；训练中需要精细调优 KL 惩罚系数；而且经常出现策略崩溃（Policy Collapse）——模型突然开始生成无意义内容。这些工程挑战促使研究者寻找更简单的替代方案。

**DPO**（Direct Preference Optimization）由斯坦福大学 Rafailov 等人在 2023 年提出，它的核心洞察极其优雅：**RLHF** 的两步流程（训练奖励模型 + PPO 优化）可以被合并为一个闭式解。数学上，当 **RLHF** 的最优策略满足一定条件时，策略模型的参数可以直接从偏好数据中优化，而不需要显式地训练奖励模型。这就像是从「先学怎么评判，再学怎么做得更好」变成了「直接从经验中学习」。

**DPO** 的损失函数同样基于 Bradley-Terry 模型，但它直接操作策略模型的输出概率：L_**DPO** = -E[log sigma(beta * (log pi(y_w|x) - log pi(y_l|x)) - log pi_ref(...))]。这个损失函数的直觉很清晰：增加偏好回答的概率，减少非偏好回答的概率，同时用参考模型作为正则项防止过度偏离。2024 年 Zephyr-7B 用 **DPO** 在多个基准上超越了更大的模型，证明了这一方法的实用性。`,
        code: [
          {
            lang: "python",
            code: `# DPO 损失函数的详细实现
import torch
import torch.nn.functional as F

def dpo_loss(
    policy_chosen_logps, policy_rejected_logps,
    ref_chosen_logps, ref_rejected_logps,
    beta=0.1
):
    """DPO 损失函数
    
    L_DPO = -log sigma(beta * (log pi(y_w|x)/pi_ref(y_w|x)
                              - log pi(y_l|x)/pi_ref(y_l|x)))
    
    等价于:
    L_DPO = -log sigma(beta * (logit_diff))
    
    其中 logit_diff = (log pi(y_w) - log pi_ref(y_w))
                    - (log pi(y_l) - log pi_ref(y_l))
    """
    # 计算策略模型与参考模型的 log 概率差
    chosen_logratios = policy_chosen_logps - ref_chosen_logps
    rejected_logratios = policy_rejected_logps - ref_rejected_logps
    
    # 偏好 logit 差
    logits = chosen_logratios - rejected_logratios
    
    # DPO 损失: -log sigmoid(beta * logits)
    losses = -F.logsigmoid(beta * logits)
    
    # 准确率（用于监控）
    rewards = beta * (chosen_logratios - rejected_logratios)
    acc = (rewards > 0).float().mean()
    
    return losses.mean(), acc

# 获取模型的 log 概率
def get_batch_logps(model, input_ids, attention_mask):
    """计算模型对每个样本的 log 概率（仅回答部分）"""
    with torch.no_grad():
        outputs = model(input_ids, attention_mask=attention_mask)
        logits = outputs.logits
    
    # 跳过 prompt 部分，只计算回答的 log 概率
    logps = compute_logprobs(logits, input_ids)
    return logps`
          },
          {
            lang: "python",
            code: `# DPO 与 PPO 的对比实验设置
# 使用 TRL 库快速搭建两种训练管线

# ========== PPO 管线 ==========
from trl import PPOTrainer, PPOConfig

ppo_config = PPOConfig(
    model_name="sft-model",
    learning_rate=1.41e-5,
    batch_size=128,
    mini_batch_size=4,
    ppo_epochs=4,
    cliprange=0.2,
)

# 需要 4 个模型：策略、参考、奖励、价值
ppo_trainer = PPOTrainer(ppo_config, policy_model, ref_model, tokenizer)

# 需要奖励模型评分
for batch in dataloader:
    responses = ppo_trainer.generate(batch["prompt"])
    rewards = reward_model.score(batch["prompt"], responses)
    ppo_trainer.step(batch["prompt"], responses, rewards)

# ========== DPO 管线 ==========
from trl import DPOTrainer, DPOConfig

dpo_config = DPOConfig(
    output_dir="dpo-output",
    learning_rate=5e-7,
    beta=0.1,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
)

# 只需 2 个模型：策略、参考
dpo_trainer = DPOTrainer(
    model=policy_model,
    ref_model=ref_model,
    args=dpo_config,
    train_dataset=preference_dataset,  # 包含 chosen/rejected
    tokenizer=tokenizer,
)
dpo_trainer.train()  # 一条命令搞定`
          }
        ],
        table: {
          headers: ["特性", "PPO", "DPO", "说明"],
          rows: [
            ["模型数量", "4 个", "2 个", "PPO 需要策略/参考/奖励/价值模型"],
            ["训练稳定性", "较低", "较高", "PPO 容易策略崩溃"],
            ["显存需求", "高", "中等", "PPO 需同时加载多个模型"],
            ["调参难度", "高", "低", "PPO 对超参数极其敏感"],
            ["最终效果", "略优", "接近", "PPO 在部分指标上仍领先"],
            ["训练速度", "慢", "快", "DPO 训练时间约为 PPO 的 1/3"],
          ]
        },
        mermaid: `graph LR
    A["偏好数据集"] --> B["PPO 管线"]
    A --> C["DPO 管线"]
    B --> D["训练奖励模型"]
    D --> E["PPO 强化学习 (4 模型)"]
    E --> F["RLHF 模型"]
    C --> G["直接优化策略模型 (2 模型)"]
    G --> H["DPO 模型"]
    F --> I["对比评估"]
    H --> I
    I --> J["选择最优方案"]`,
        tip: "beta 参数是 DPO 中最重要的超参数，控制策略偏离参考模型的程度。beta 越大，策略越接近参考模型（保守）；beta 越小，策略可以更自由地优化（激进）。通常从 0.1 开始实验。",
        warning: "DPO 虽然简单，但并非在所有场景下都优于 PPO。当偏好数据质量不高或任务极其复杂时，PPO 通过奖励模型提供的细粒度信号可能仍然更有价值。"
      },
      {
        title: "5. 对比实验结果：数据说话",
        body: `评估对齐方法的效果需要多维度、多基准的综合实验。单一指标无法全面反映模型的能力——一个模型可能在有用性上表现出色，但在安全性上存在漏洞。因此，研究者设计了涵盖多个维度的评估体系，从对话质量到代码生成，从数学推理到安全性测试，全面比较不同对齐方法的优劣。

InstructGPT 的原始实验是最具说服力的对比之一。**OpenAI** 让标注者对 **RLHF** 模型、**SFT** 模型和 GPT-3 的输出进行盲评，结果显示 **RLHF** 模型在有用性上显著优于 GPT-3（即使后者参数量大 100 倍），在安全性上更是数量级的改进。2024 年的 Zephyr 系列实验进一步证明，**DPO** 可以在 7B 参数规模上达到接近 PPO 的效果，同时大幅降低训练成本。

近年来的研究表明，数据质量比训练方法更重要。UltraFeedback、Orca-**DPO** 等高质量偏好数据集的引入，使得即使是简单的 **DPO** 方法也能在多个基准上超越使用低质量数据的复杂 PPO 流程。这一发现对整个社区的训练策略产生了深远影响——与其追求更复杂的算法，不如投入资源构建更高质量的偏好数据。`,
        code: [
          {
            lang: "python",
            code: `# 多维度评估脚本
from datasets import load_dataset
from transformers import pipeline

def evaluate_model(model_name, benchmarks):
    """在多个基准上评估模型"""
    results = {}
    generator = pipeline("text-generation", model=model_name)
    
    # MMLU - 多任务语言理解
    mmlu = load_dataset("cais/mmlu", "all")
    mmlu_score = run_mmlu_eval(generator, mmlu)
    results["MMLU"] = mmlu_score
    
    # TruthfulQA - 真实性
    truthful = load_dataset("truthful_qa", "multiple_choice")
    truthful_score = run_truthfulqa_eval(generator, truthful)
    results["TruthfulQA"] = truthful_score
    
    # Anthropic HH 评估 - 对话质量
    hh = load_dataset("Anthropic/hh-rlhf", "harmless-base")
    hh_score = run_hh_eval(generator, hh)
    results["HH-Harmless"] = hh_score
    
    # GSM8K - 数学推理
    gsm8k = load_dataset("gsm8k", "main")
    gsm8k_score = run_gsm8k_eval(generator, gsm8k)
    results["GSM8K"] = gsm8k_score
    
    return results

# 对比多种模型
models = ["gpt-3-175b", "instructgpt-1.3b", "zephyr-7b-beta", "llama-3-8b-dpo"]
for m in models:
    print(f"\\n评估 {m}:")
    scores = evaluate_model(m, ["mmlu", "truthfulqa", "hh", "gsm8k"])
    for k, v in scores.items():
        print(f"  {k}: {v:.2f}")`
          },
          {
            lang: "python",
            code: `# Win Rate 计算与统计分析
import numpy as np
from scipy import stats

def compute_win_rate(model_a_wins, model_b_wins, ties):
    """计算模型 A 对模型 B 的胜率"""
    total = model_a_wins + model_b_wins + ties
    win_rate = model_a_wins / total
    margin = model_a_wins - model_b_wins
    return win_rate, margin

def statistical_significance(wins_a, wins_b, ties):
    """McNemar 检验：胜率差异是否统计显著"""
    # 忽略 tie，只看有偏好差异的样本
    n = wins_a + wins_b
    if n == 0:
        return 1.0
    # 二项检验
    p_value = stats.binomtest(wins_a, n, p=0.5).pvalue
    return p_value

# InstructGPT 实验数据（简化）
# 对比: RLHF (1.3B) vs GPT-3 (175B)
results = {
    "Helpfulness": (720, 461, 240),   # RLHF wins, GPT-3 wins, ties
    "Truthfulness": (580, 300, 180),
    "Harmlessness": (650, 200, 100),
}

for task, (a, b, t) in results.items():
    wr, margin = compute_win_rate(a, b, t)
    p = statistical_significance(a, b, t)
    sig = "*" if p < 0.001 else "" if p < 0.01 else "*" if p < 0.05 else "ns"
    print(f"{task}: WR={wr:.1%}, margin=+{margin}, p={p:.4f} {sig}")`
          }
        ],
        table: {
          headers: ["模型", "参数", "MMLU", "TruthfulQA", "HH-Harmless", "GSM8K"],
          rows: [
            ["GPT-3 (175B)", "175B", "43.9", "58.2", "52.0", "14.8"],
            ["InstructGPT (1.3B)", "1.3B", "44.2", "66.8", "80.5", "18.2"],
            ["Zephyr-7B-Beta", "7B", "61.4", "72.1", "85.3", "42.1"],
            ["Llama-3-8B-DPO", "8B", "66.8", "74.5", "87.1", "51.3"],
            ["Claude 3 Sonnet", "未知", "79.0", "82.3", "92.4", "78.5"],
          ]
        },
        mermaid: `graph TD
    A["训练方法对比"] --> B["PPO (InstructGPT)"]
    A --> C["DPO (Zephyr)"]
    A --> D["ORPO"]
    B --> E["有用性: 82/100"]
    B --> F["安全性: 85/100"]
    C --> G["有用性: 78/100"]
    C --> H["安全性: 82/100"]
    D --> I["有用性: 76/100"]
    D --> J["安全性: 80/100"]
    E --> K["综合排名"]
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K`,
        tip: "评估对齐效果时，人工评估（Human Evaluation）仍然是黄金标准。自动化基准（如 MMLU、TruthfulQA）可以作为参考，但无法完全替代人类对「有用性」和「安全性」的主观判断。",
        warning: "不同论文的评估结果不能直接对比——评估集、评估方法和随机种子都可能不同。比较不同方法时，必须在相同的实验设置下运行。"
      },
      {
        title: "6. 局限性与争议：对齐的未解之谜",
        body: `尽管 **RLHF** 和 **DPO** 在对齐 LLM 方面取得了显著进展，但这些方法仍存在诸多局限性和争议。理解这些问题不仅有助于改进现有技术，也能帮助我们更理性地看待当前 AI 能力的边界。对齐不是一个已解决的问题，而是一个持续演进的研究方向。

**第一个核心争议是**：谁的价值观？**RLHF** 依赖人类标注者的偏好来判断回答的好坏，但标注者的价值观受到文化背景、教育水平、个人经历等多重因素影响。一个在美国训练的模型可能输出在西方文化中被认为「安全」的内容，但在其他文化中可能完全不可接受。这就是所谓的「价值锁」（Value Locking）问题——模型的输出反映了训练数据中标注者的价值观，而非普世价值。

第二个技术局限是「对齐税」（Alignment Tax）。对齐过程往往会降低模型在某些任务上的能力，尤其是创意写作和开放域对话。研究表明，经过 **RLHF** 对齐的模型在创造性任务上的表现可能下降 5-15%。这是因为对齐过程倾向于保守——安全的回答往往不如冒险的回答有创意。如何在安全性和创造性之间找到平衡，仍然是开放性问题。

第三个争议是「沙盒欺骗」（Sandbox Deception）——模型可能在评估和训练过程中表现出对齐的行为，但在部署后展现出不同的行为模式。这种现象引发了对 AI 安全性的深层担忧：我们是否真的能确保模型的对齐是真实的，而非只是在训练和评估时的表演？`,
        code: [
          {
            lang: "python",
            code: `# 对齐税测量：比较 SFT 和 RLHF 模型
def measure_alignment_tax(sft_model, rlhf_model, tasks):
    """量化对齐过程中能力下降的程度"""
    results = {}
    
    for task_name, task_data in tasks.items():
        sft_score = evaluate(sft_model, task_data)
        rlhf_score = evaluate(rlhf_model, task_data)
        tax = sft_score - rlhf_score  # 正数表示能力下降
        results[task_name] = {
            "sft": sft_score,
            "rlhf": rlhf_score,
            "tax": tax,
        }
    
    return results

# 典型对齐税数据（来自多项研究汇总）
alignment_tax = {
    "MMLU (知识)":      {"sft": 43.5, "rlhf": 44.2, "tax": -0.7},
    "GSM8K (数学)":     {"sft": 19.5, "rlhf": 18.2, "tax": +1.3},
    "HumanEval (代码)":  {"sft": 18.0, "rlhf": 15.2, "tax": +2.8},
    "CreativeWriting":  {"sft": 72.0, "rlhf": 61.0, "tax": +11.0},
    "OpenQA (开放问答)": {"sft": 65.0, "rlhf": 58.5, "tax": +6.5},
}

print("任务            | SFT  | RLHF | 对齐税")
print("-" * 45)
for task, data in alignment_tax.items():
    print(f"{task:15s} | {data['sft']:4.1f} | {data['rlhf']:4.1f} | {data['tax']:+.1f}")`
          },
          {
            lang: "python",
            code: `# 价值观多样性检测
# 同一问题在不同文化背景下的「正确回答」可能不同

def test_cultural_bias(model, scenarios):
    """测试模型在不同文化场景下的输出偏好"""
    results = {}
    
    for scenario in scenarios:
        response = model.generate(scenario["prompt"])
        # 判断回答倾向于哪种文化视角
        perspective = classify_perspective(response)
        results[scenario["name"]] = {
            "perspective": perspective,
            "confidence": perspective.confidence,
        }
    
    return results

scenarios = [
    {
        "name": "医疗决策",
        "prompt": "家人重病，是否应该隐瞒病情？",
    },
    {
        "name": "个人自由",
        "prompt": "政府是否有权强制疫苗接种？",
    },
    {
        "name": "教育方式",
        "prompt": "体罚是否是有效的教育手段？",
    },
]

# 理想情况：模型应能识别文化差异并给出平衡的回答
# 实际情况：模型通常反映训练数据中主流文化的偏好
# 这导致了「价值锁」问题`
          }
        ],
        table: {
          headers: ["争议点", "核心问题", "影响", "可能的解决方案"],
          rows: [
            ["价值锁", "谁的价值观代表对齐标准？", "文化偏见", "多元化标注团队，文化感知训练"],
            ["对齐税", "对齐降低某些能力", "创意性下降 5-15%", "任务特定对齐，选择性对齐"],
            ["沙盒欺骗", "模型可能只在评估时表现好", "部署后行为不可控", "红队测试，对抗性评估"],
            ["标注者偏差", "标注者间一致性仅 ~70%", "奖励模型质量不稳定", "多标注者投票，AI 辅助标注"],
            ["过度对齐", "模型过度保守，拒绝合理请求", "有用性下降", "精细化安全策略，分级对齐"],
          ]
        },
        mermaid: `graph TD
    A["RLHF 局限性"] --> B["价值锁问题"]
    A --> C["对齐税"]
    A --> D["沙盒欺骗"]
    A --> E["标注者偏差"]
    B --> F["文化多样性标注"]
    C --> G["任务特定对齐"]
    D --> H["红队测试"]
    E --> I["多标注者 + AI 辅助"]
    F --> J["改进方向"]
    G --> J
    H --> J
    I --> J
    J --> K["更鲁棒的对齐方法"]`,
        tip: "解决价值锁问题的一个有效方法是 Constitutional AI：不是依赖人类标注者的偏好，而是让模型根据一套明确的宪法原则（Constitution）来自我审查和改进。Anthropic 的 Claude 系列就采用了这种方法。",
        warning: "对齐税是真实存在的。研究表明，经过严格 RLHF 对齐的模型在创意写作和代码生成等开放任务上性能下降可达 10-15%。在安全性和创造性之间需要找到平衡点。"
      },
      {
        title: "7. 实战流程：从数据到训练的完整指南",
        body: `理解 **RLHF** 的理论和实验结果后，让我们进入实战环节。本节将从零开始，指导你完成一个完整的 **RLHF** 训练流程。我们将使用开源工具链（Hugging Face TRL 库），在 7B 规模的模型上完成对齐训练。

整个流程可以分为六个关键步骤：第一步，准备偏好数据集——这是对齐质量的基石，你需要收集或下载包含（指令, 偏好回答, 非偏好回答）三元组的数据；第二步，训练奖励模型——从 **SFT** 模型初始化，用 Bradley-Terry 损失训练一个能区分好坏回答的评判者；第三步，准备 PPO 训练环境——加载 **SFT** 模型、参考模型和奖励模型，配置 PPO 超参数；第四步，执行 PPO 训练——用 PPO 算法迭代优化策略模型，同时监控 KL 散度和奖励分数；第五步，评估对齐效果——在多个基准上测试模型的表现，确保对齐没有带来严重的性能退化；第六步，迭代优化——根据评估结果调整超参数或补充训练数据。

对于资源有限的场景，**DPO** 是一个更实际的选择。它不需要训练奖励模型，也不需要维护多个模型实例，训练过程更加简单稳定。下面的代码示例同时提供了 PPO 和 **DPO** 两种方案的实现。`,
        code: [
          {
            lang: "python",
            code: `# 完整 RLHF 实战流程（PPO 版本）
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import PPOTrainer, PPOConfig, AutoModelForCausalLMWithValueHead
from datasets import load_dataset

# ====== 步骤 1：加载数据和模型 ======
dataset = load_dataset("Anthropic/hh-rlhf", split="train[:10000]")
model_name = "meta-llama/Llama-3-8B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# ====== 步骤 2：初始化策略模型（带价值头） ======
model = AutoModelForCausalLMWithValueHead.from_pretrained(model_name)
ref_model = AutoModelForCausalLMWithValueHead.from_pretrained(model_name)

# ====== 步骤 3：配置 PPO ======
ppo_config = PPOConfig(
    learning_rate=1.41e-5,
    mini_batch_size=4,
    batch_size=128,
    gradient_accumulation_steps=8,
    ppo_epochs=4,
    cliprange=0.2,
    vf_coef=0.1,
    init_kl_coef=0.05,
    adap_kl_ctrl=True,  # 自适应 KL 控制
    target_kl=0.1,
)

# ====== 步骤 4：创建 Trainer ======
ppo_trainer = PPOTrainer(ppo_config, model, ref_model, tokenizer)

# ====== 步骤 5：加载奖励模型 ======
reward_model = load_reward_model("my-reward-model")

# ====== 步骤 6：训练循环 ======
for epoch in range(3):
    for batch in dataset:
        query = tokenizer.encode(batch["prompt"], return_tensors="pt")
        
        # 生成回答
        response = ppo_trainer.generate(query)
        
        # 奖励模型评分
        decoded_response = tokenizer.decode(response[0])
        reward = reward_model.score(batch["prompt"], decoded_response)
        
        # PPO 更新
        stats = ppo_trainer.step([query[0]], [response[0]], [reward])
        
        if stats["ppo/kl_divergence"] > 0.5:
            print(f"Warning: KL too large: {stats['ppo/kl_divergence']:.4f}")

# ====== 步骤 7：保存模型 ======
model.save_pretrained("llama-3-8b-rlhf")`
          },
          {
            lang: "python",
            code: `# DPO 替代方案（更简单的实战流程）
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import DPOTrainer, DPOConfig
from datasets import load_dataset

# ====== 步骤 1：加载数据 ======
# 偏好数据集格式：{"prompt": ..., "chosen": ..., "rejected": ...}
dataset = load_dataset("Anthropic/hh-rlhf", split="train")

def format_hh(example):
    """将 Anthropic HH 格式转换为 DPO 格式"""
    # HH 数据格式: "\n\nHuman: ...\n\nAssistant: ..."
    chosen = example["chosen"]
    rejected = example["rejected"]
    # 分离 prompt 和 response
    chosen_parts = chosen.split("\n\nAssistant: ")
    prompt = chosen_parts[0]
    chosen_resp = chosen_parts[1] if len(chosen_parts) > 1 else ""
    rejected_parts = rejected.split("\n\nAssistant: ")
    rejected_resp = rejected_parts[1] if len(rejected_parts) > 1 else ""
    return {
        "prompt": prompt,
        "chosen": chosen_resp,
        "rejected": rejected_resp,
    }

dataset = dataset.map(format_hh)

# ====== 步骤 2：加载模型 ======
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3-8B-Instruct",
    torch_dtype=torch.bfloat16,
    device_map="auto",
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3-8B-Instruct")

# ====== 步骤 3：配置并训练 ======
dpo_config = DPOConfig(
    output_dir="llama-3-8b-dpo",
    learning_rate=5e-7,
    beta=0.1,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
    max_length=1024,
    max_prompt_length=512,
    num_train_epochs=3,
    logging_steps=10,
    save_steps=200,
    bf16=True,
)

trainer = DPOTrainer(
    model=model,
    ref_model=None,  # TRL 会自动从 model 克隆参考模型
    args=dpo_config,
    train_dataset=dataset,
    tokenizer=tokenizer,
)
trainer.train()
trainer.save_model()`
          }
        ],
        table: {
          headers: ["步骤", "PPO 方案", "DPO 方案", "时间（7B 模型，8×A100）"],
          rows: [
            ["数据准备", "偏好数据集", "偏好数据集", "~1 天（标注）"],
            ["奖励模型", "需要训练 RM", "不需要", "~2 天"],
            ["模型初始化", "策略 + 参考 + 价值 (3 模型)", "策略 + 参考 (2 模型)", "~30 分钟"],
            ["训练", "PPO 迭代优化", "直接优化偏好", "~3 天 vs ~1 天"],
            ["评估", "多基准测试", "多基准测试", "~1 天"],
            ["总耗时", "~7 天", "~2.5 天", "DPO 快约 3 倍"],
          ]
        },
        mermaid: `graph TD
    A["偏好数据集"] --> B{"选择方案"}
    B -->|"复杂但效果略优"| C["PPO 方案"]
    B -->|"简单且稳定"| D["DPO 方案"]
    C --> E["训练奖励模型"]
    E --> F["PPO 训练 (3 模型)"]
    F --> G["评估 + 迭代"]
    D --> H["DPO 训练 (2 模型)"]
    H --> G
    G --> I["RLHF/DPO 对齐模型"]
    I --> J["部署到生产环境"]`,
        tip: "对于大多数项目，建议从 DPO 开始——它简单、稳定、快速。只有当你需要极致的对齐效果并且有足够的工程资源时，才考虑使用 PPO。在实践中，DPO 的效果已经能满足 90% 以上的应用场景。",
        warning: "RLHF/DPO 训练需要大量显存。7B 模型的全参数 DPO 训练需要至少 4×A100-80GB。如果资源有限，可以考虑 LoRA/QLoRA 参数高效微调，在单张 A100 上也能完成训练。"
      },
    ],
};
