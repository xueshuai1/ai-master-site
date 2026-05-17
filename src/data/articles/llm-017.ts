// LLM 微调技术全景：LoRA、QLoRA、DPO 与参数高效微调实战

import { Article } from '../knowledge';

export const article: Article = {
  id: "llm-017",
  title: "LLM 微调技术全景：LoRA、QLoRA、DPO 与参数高效微调实战",
  category: "llm",
  tags: ["LLM 微调", "LoRA", "QLoRA", "DPO", "PEFT", "参数高效微调", "对齐优化"],
  summary: "从全量微调到参数高效微调的系统性进阶。深入解析 LoRA、QLoRA、DPO、ORPO、GAPO 等主流微调技术，对比不同方法的参数量、显存需求、训练效果和适用场景，配以完整的 Python 可运行代码和实战训练脚本，帮助开发者为特定任务定制专属 LLM。",
  date: "2026-04-21",
  readTime: "40 分钟",
  level: "进阶",
  content: [
    {
      title: "引言：为什么需要微调 LLM？",
      body: `大语言模型（LLM）的预训练赋予了模型强大的通用语言能力，但当面对特定领域的专业任务时，预训练模型往往表现不足。微调（Fine-tuning）就是让通用模型"入乡随俗"的关键技术。

微调的三大核心价值：

1. 领域适配：让模型掌握医疗、法律、金融等专业领域的术语和推理模式
2. 风格定制：让模型的输出风格符合企业品牌调性（如客服语气、技术文档格式）
3. 行为对齐：让模型遵循特定的安全规范、输出格式偏好和决策逻辑

2026 年的微调趋势：
- 参数高效微调（PEFT）已成为主流，全量微调仅用于极端场景
- DPO（Direct Preference Optimization）正在快速替代传统的 RLHF
- 量化微调（QLoRA）让消费级 GPU 也能微调 70B+ 模型
- 多模态微调（视觉-语言、语音-语言）成为新热点

本文将系统性梳理从全量微调 → LoRA → QLoRA → DPO → ORPO 的完整技术栈，并通过可运行代码展示每种方法的实战应用。`,
      tip: `阅读收获：
- 理解 6 种主流微调技术的原理和适用场景
- 掌握 PEFT 库的核心 API 和训练流程
- 学会在消费级 GPU 上微调 7B-70B 模型
- 通过对比实验选择最适合你场景的微调方案`,
    },
    {
      title: "一、微调技术全景图",
      body: `LLM 微调技术的发展经历了三个主要阶段：

第一阶段：全量微调（Full Fine-tuning）
更新模型的所有参数。效果最好，但成本极高——微调一个 70B 模型需要数百张 A100 GPU。

第二阶段：参数高效微调（PEFT）
只更新少量额外参数，冻结预训练权重。LoRA 是这一阶段的代表，将可训练参数量降低到 0.1%-1%。

第三阶段：量化 + 高效微调
QLoRA 将模型量化到 4-bit，大幅降低显存需求，同时保持 LoRA 的高效性。DPO/ORPO 则进一步优化了对齐过程，无需奖励模型。

技术选型决策树：

- 你有足够的显存（>80GB）和算力？
  - 是 → 数据量 >100K？→ 全量微调
    - 否 → LoRA
  - 否 → 消费级 GPU（<24GB）？→ QLoRA
    - 有偏好数据？→ DPO/ORPO`,
      mermaid: `graph TD
    A[LLM 微调需求] --> B{显存/算力充足?}
    
    B -->|是: >80GB GPU| C{数据量?}
    C -->|>100K 条| D[全量微调
效果最好]
    C -->|<100K 条| E[LoRA
高效灵活]
    
    B -->|否: 消费级 GPU| F{任务类型?}
    F -->|指令微调| G[QLoRA
4-bit + LoRA]
    F -->|偏好对齐| H[DPO/ORPO
无需奖励模型]
    
    D --> I[评估]
    E --> I
    G --> I
    H --> I
    
    I -->|效果达标| J[部署]
    I -->|效果不足| K[增加数据/调整超参]
    K --> I
    class J s5
    class H s4
    class G s3
    class E s2
    class D s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#7c2d12
    classDef s2 fill:#14532d
    classDef s3 fill:#14532d
    classDef s4 fill:#14532d
    classDef s5 fill:#14532d`,
    },
    {
      title: "二、全量微调：理论基准",
      body: `全量微调是最直接的微调方式：在预训练模型基础上，用目标任务数据继续训练，更新所有参数。

适用场景：
- 有充足的计算资源（多张 A100/H100）
- 目标领域与预训练数据差异极大
- 需要模型掌握全新的知识体系

核心挑战：
1. 灾难性遗忘：模型可能忘记预训练阶段学到的通用知识
2. 过拟合风险：微调数据通常远少于预训练数据
3. 成本极高：70B 模型全量微调需要 1.4TB+ 显存（即便用梯度累积）

关键超参数：
- 学习率：通常设为预训练学习率的 1/10 到 1/100（如 1e-5 ~ 5e-5）
- Epoch 数：1-3 个 epoch，多了容易过拟合
- 学习率调度：cosine decay + warmup 是最常用的策略`,
      code: [{ lang: "python", code: `"""
全量微调示例：使用 HuggingFace Transformers
适合有充足 GPU 资源的场景
"""
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import load_dataset
import torch


def full_fine_tune(
    model_name: str = "meta-llama/Llama-3.1-8B",
    dataset_name: str = "alpaca",
    output_dir: str = "./full-finetuned-model",
    num_epochs: int = 3,
    batch_size: int = 4,
    learning_rate: float = 2e-5,
    gradient_accumulation_steps: int = 8
):
    """
    全量微调 LLM
    
    参数：
        model_name: 预训练模型名称
        dataset_name: 微调数据集名称
        output_dir: 输出目录
        num_epochs: 训练轮数
        batch_size: 每步 batch size
        learning_rate: 学习率
        gradient_accumulation_steps: 梯度累积步数
    """
    # 1. 加载模型和分词器
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    
    # 2. 加载和预处理数据
    dataset = load_dataset(dataset_name)
    
    def preprocess(examples):
        texts = [
            f"### Instruction:\\n{inst}\\n\\n### Input:\\n{inp}\\n\\n### Response:\\n{resp}"
            for inst, inp, resp in zip(
                examples["instruction"],
                examples.get("input", [""] * len(examples["instruction"])),
                examples["output"]
            )
        ]
        return tokenizer(
            texts,
            truncation=True,
            max_length=2048,
            padding="max_length",
            return_tensors="pt"
        )
    
    tokenized = dataset["train"].map(
        preprocess,
        batched=True,
        remove_columns=dataset["train"].column_names
    )
    
    # 3. 配置训练参数
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=gradient_accumulation_steps,
        learning_rate=learning_rate,
        lr_scheduler_type="cosine",
        warmup_ratio=0.05,
        fp16=True,
        logging_steps=10,
        save_strategy="epoch",
        optim="adamw_torch",
        weight_decay=0.01,
        max_grad_norm=1.0,
    )
    
    # 4. 创建 Trainer 并开始训练
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized,
        data_collator=DataCollatorForLanguageModeling(
            tokenizer, mlm=False
        ),
    )
    
    trainer.train()
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    print(f"微调完成！模型已保存到 {output_dir}")
    return model, tokenizer


# 使用示例（需要多张 A100 GPU）
# model, tokenizer = full_fine_tune(
#     model_name="meta-llama/Llama-3.1-8B",
#     dataset_name="yahma/alpaca-cleaned",
#     output_dir="./llama3.1-8b-alpaca"
# )`, filename: "full_finetune.py" }],
    },
    {
      title: "三、LoRA：参数高效微调的里程碑",
      body: `LoRA（Low-Rank Adaptation）由 Hu et al. (2021) 提出，是 PEFT 技术的开山之作。

核心思想：
不直接更新预训练权重 W，而是训练两个低秩矩阵 A 和 B，使得 ΔW = B × A。最终推理时的权重为 W' = W + ΔW = W + B×A。

数学原理：
预训练权重 W ∈ R^(d×k) 的更新量 ΔW 通常具有"低内在秩"的性质。也就是说，虽然 ΔW 是一个大矩阵，但它的信息可以用两个小矩阵的乘积来近似表示。

具体来说，LoRA 将 ΔW 分解为：
- A ∈ R^(r×k)，随机初始化
- B ∈ R^(d×r)，零初始化

其中 r << min(d, k)，通常 r = 8, 16, 32。这样可训练参数量从 d×k 降低到 r×(d+k)，压缩比可达 1000 倍以上。

为什么 B 要零初始化？
初始时 ΔW = B×A = 0，所以模型行为与预训练模型完全一致。这确保了训练开始时不会引入随机扰动，有助于稳定训练。`,
      mermaid: `graph LR
    A[输入 x] --> B[预训练权重 W]
    B --> C[Wx]
    
    A --> D[LoRA A 矩阵
r×k]
    D --> E[LoRA B 矩阵
d×r]
    E --> F[B·A·x]
    
    C --> G[+]
    F --> G
    G --> H[输出: Wx + BAx]
    class H s3
    class E s2
    class D s1
    class B s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#7c2d12
    classDef s2 fill:#7c2d12
    classDef s3 fill:#14532d`,
    },
    {
      title: "3.1 LoRA 实战代码",
      body: `使用 PEFT 库可以非常方便地实现 LoRA 微调。以下是完整的训练代码：`,
      code: [{ lang: "python", code: `"""
LoRA 微调完整实现
使用 PEFT 库，在单张 GPU 上即可微调 7B-70B 模型
"""
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    BitsAndBytesConfig
)
from peft import (
    LoraConfig,
    get_peft_model,
    prepare_model_for_kbit_training,
    TaskType
)
from datasets import load_dataset


def create_lora_model(
    model_name: str = "meta-llama/Llama-3.1-8B",
    r: int = 16,
    lora_alpha: int = 32,
    lora_dropout: float = 0.05,
    target_modules: list[str] = None
):
    """
    创建 LoRA 微调模型
    
    参数：
        r: LoRA 秩，越大表达能力越强但参数量也越大
           推荐：8（轻量）、16（均衡）、32（强表达）
        lora_alpha: 缩放因子，通常设为 2r
        lora_dropout: Dropout 率，防止过拟合
        target_modules: 要应用 LoRA 的模块列表
    """
    if target_modules is None:
        target_modules = ["q_proj", "k_proj", "v_proj", "o_proj"]
    
    # 1. 加载基础模型
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    
    # 2. 配置 LoRA
    lora_config = LoraConfig(
        r=r,
        lora_alpha=lora_alpha,
        lora_dropout=lora_dropout,
        target_modules=target_modules,
        bias="none",
        task_type=TaskType.CAUSAL_LM,
        inference_mode=False
    )
    
    # 3. 应用 LoRA
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    
    return model, tokenizer


def train_lora(
    model,
    tokenizer,
    dataset_name: str = "yahma/alpaca-cleaned",
    output_dir: str = "./lora-output",
    epochs: int = 3,
    batch_size: int = 8,
    learning_rate: float = 3e-4,
    max_length: int = 1024
):
    """
    训练 LoRA 模型
    
    注意：LoRA 的学习率通常比全量微调高一个数量级
    （因为只训练少量参数，需要更大的步长）
    """
    # 1. 数据预处理
    dataset = load_dataset(dataset_name)
    
    def format_prompt(example):
        inst = example["instruction"]
        inp = example.get("input", "")
        out = example["output"]
        
        if inp:
            text = f"### Instruction:\\n{inst}\\n\\n### Input:\\n{inp}\\n\\n### Response:\\n{out}"
        else:
            text = f"### Instruction:\\n{inst}\\n\\n### Response:\\n{out}"
        
        return tokenizer(
            text,
            truncation=True,
            max_length=max_length,
            padding="max_length",
        )
    
    train_data = dataset["train"].map(
        format_prompt,
        remove_columns=dataset["train"].column_names
    )
    
    # 2. 训练配置
    args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=4,
        learning_rate=learning_rate,
        lr_scheduler_type="cosine",
        warmup_ratio=0.05,
        fp16=True,
        logging_steps=10,
        save_steps=100,
        save_strategy="steps",
        optim="adamw_torch",
        weight_decay=0.01,
        max_grad_norm=0.3,
        report_to="none",
    )
    
    # 3. 训练
    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_data,
    )
    
    trainer.train()
    
    # 4. 保存 LoRA 适配器（非常小，通常几十 MB）
    model.save_pretrained(f"{output_dir}/lora-adapter")
    tokenizer.save_pretrained(output_dir)
    
    print(f"LoRA 适配器已保存到 {output_dir}/lora-adapter")
    return model


# 使用示例
model, tokenizer = create_lora_model(
    model_name="meta-llama/Llama-3.1-8B",
    r=16,
    lora_alpha=32
)

# train_lora(model, tokenizer)

# 推理时加载 LoRA 适配器
# from peft import PeftModel
# base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B")
# model = PeftModel.from_pretrained(
#     base_model,
#     "./lora-output/lora-adapter"
# )`, filename: "lora_finetune.py" }],
    },
    {
      title: "3.2 LoRA 超参数调优指南",
      body: `LoRA 的效果高度依赖超参数选择。以下是经过大量实验验证的经验值：`,
      table: {
        headers: ["超参数", "推荐值", "说明", "调优方向"],
        rows: [
          ["r (秩)", "8/16/32", "核心参数。r=8 适合简单任务，r=32 适合复杂推理", "↑ 表达力 ↑ 但显存也 ↑"],
          ["lora_alpha", "2r 或 r", "缩放因子。α=2r 时等效于标准学习率", "↑ 增大 LoRA 更新幅度"],
          ["lora_dropout", "0.05-0.1", "防止过拟合。数据少时用 0.1，数据多时用 0.05", "↑ 正则化 ↑ 但可能欠拟合"],
          ["target_modules", "qkv+o 或 all-linear", "注意力层是必须，MLP 层可选", "↑ 覆盖更多层 ↑ 效果"],
          ["learning_rate", "1e-4 ~ 5e-4", "比全量微调高 10 倍", "↑ 训练更快但可能不稳定"],
          ["epochs", "2-5", "LoRA 收敛快，不宜太多 epoch", "↑ 可能过拟合"],
        ]
      },
    },
    {
      title: "四、QLoRA：让消费级 GPU 也能微调大模型",
      body: `QLoRA（Quantized LoRA）由 Dettmers et al. (2023) 提出，将 LoRA 与 4-bit 量化结合。

核心创新：
1. 4-bit NormalFloat（NF4）量化：一种针对正态分布权重优化的 4-bit 数据类型
2. 双重量化：先量化权重，再量化量化常数，进一步减少显存
3. 分页优化器：使用 NVIDIA 的统一内存自动处理显存溢出

显存对比（以 65B 模型为例）：

| 方法 | 显存需求 | 可用 GPU |
|------|---------|---------|
| 全量微调 (FP16) | ~1300 GB | 无法单卡 |
| LoRA (FP16) | ~130 GB | 2×A100 80G |
| QLoRA (4-bit) | ~16 GB | RTX 4090 |

QLoRA 的效果与 16-bit LoRA 几乎一致（差异 < 0.5%），但显存需求降低了 8 倍！

QLoRA 的局限性：
- 推理速度比 FP16 慢（需要反量化）
- 对极端低精度（<4-bit）不稳定
- 多 GPU 并行时需注意量化一致性`,
      code: [{ lang: "python", code: `"""
QLoRA 微调实现
在单张消费级 GPU 上微调 7B-70B 模型
"""
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    BitsAndBytesConfig
)
from peft import LoraConfig, get_peft_model, TaskType
from datasets import load_dataset


def create_qlora_model(
    model_name: str = "meta-llama/Llama-3.1-8B",
    load_in_4bit: bool = True,
    r: int = 16,
    lora_alpha: int = 32,
    lora_dropout: float = 0.05,
    bnb_4bit_quant_type: str = "nf4",
    bnb_4bit_use_double_quant: bool = True,
    bnb_4bit_compute_dtype: str = "bfloat16"
):
    """
    创建 QLoRA 微调模型
    
    参数：
        model_name: 模型名称或路径
        load_in_4bit: 是否使用 4-bit 量化
        r: LoRA 秩
        lora_alpha: LoRA alpha 参数
        lora_dropout: Dropout 率
        bnb_4bit_quant_type: 量化类型，"nf4"（推荐）或 "fp4"
        bnb_4bit_use_double_quant: 是否使用双重量化（节省额外 0.4 bit/参数）
        bnb_4bit_compute_dtype: 计算精度，推荐 "bfloat16"
    """
    # 1. 配置量化
    compute_dtype = getattr(torch, bnb_4bit_compute_dtype)
    
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=load_in_4bit,
        bnb_4bit_quant_type=bnb_4bit_quant_type,
        bnb_4bit_compute_dtype=compute_dtype,
        bnb_4bit_use_double_quant=bnb_4bit_use_double_quant,
    )
    
    # 2. 加载量化后的模型
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"
    
    # 3. 为量化模型准备训练
    model = prepare_model_for_kbit_training(
        model,
        use_gradient_checkpointing=True,
        gradient_checkpointing_kwargs={"use_reentrant": False}
    )
    
    # 4. 配置 LoRA（在量化模型上应用）
    lora_config = LoraConfig(
        r=r,
        lora_alpha=lora_alpha,
        lora_dropout=lora_dropout,
        bias="none",
        task_type=TaskType.CAUSAL_LM,
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj"  # 也覆盖 MLP 层
        ],
    )
    
    model = get_peft_model(model, lora_config)
    
    print(f"可训练参数：")
    model.print_trainable_parameters()
    
    # 显存估算
    trainable_params = sum(
        p.numel() for p in model.parameters() if p.requires_grad
    )
    total_params = sum(p.numel() for p in model.parameters())
    print(f"LoRA 参数占比：{trainable_params/total_params*100:.2f}%")
    
    return model, tokenizer


def train_qlora(model, tokenizer, output_dir="./qlora-output"):
    """训练 QLoRA 模型"""
    
    # 准备训练数据
    dataset = load_dataset("yahma/alpaca-cleaned")
    
    def preprocess(examples):
        texts = []
        for inst, inp, out in zip(
            examples["instruction"],
            examples.get("input", [""] * len(examples["instruction"])),
            examples["output"]
        ):
            if inp:
                text = f"### Instruction:\\n{inst}\\n\\n### Input:\\n{inp}\\n\\n### Response:\\n{out}"
            else:
                text = f"### Instruction:\\n{inst}\\n\\n### Response:\\n{out}"
            texts.append(text)
        
        return tokenizer(
            texts,
            truncation=True,
            max_length=1024,
            padding="max_length",
        )
    
    train_data = dataset["train"].map(
        preprocess,
        batched=True,
        remove_columns=dataset["train"].column_names
    )
    
    # 训练参数（QLoRA 需要更保守的设置）
    args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=3,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        lr_scheduler_type="cosine",
        warmup_ratio=0.03,
        fp16=True,
        logging_steps=10,
        save_strategy="epoch",
        optim="paged_adamw_32bit",  # QLoRA 推荐的分页优化器
        max_grad_norm=0.3,
        weight_decay=0.01,
        report_to="none",
    )
    
    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_data,
    )
    
    trainer.train()
    model.save_pretrained(f"{output_dir}/adapter")
    tokenizer.save_pretrained(output_dir)
    
    print(f"QLoRA 训练完成！适配器大小约 {len(list((output_dir + '/adapter').iterdir()))} 个文件")
    return model


# 使用示例
# model, tokenizer = create_qlora_model(
#     model_name="meta-llama/Llama-3.1-8B",
#     r=16,
#     lora_alpha=32
# )
# train_qlora(model, tokenizer)

# 推理：合并 QLoRA 适配器到基础模型
# model.save_pretrained("merged-model", safe_serialization=True)`, filename: "qlora_finetune.py" }],
    },
    {
      title: "五、DPO：直接偏好优化，告别 RLHF 的复杂性",
      body: `DPO（Direct Preference Optimization）由 Rafailov et al. (2023) 提出，是一种替代 RLHF 的全新对齐方法。

RLHF 的痛点：
传统 RLHF 需要三个步骤：
1. 监督微调（SFT）
2. 训练奖励模型（Reward Model）
3. 用 PPO 优化策略

步骤 2 和 3 非常复杂：需要额外训练一个奖励模型，PPO 训练不稳定且调参困难。

DPO 的革命性简化：
DPO 将奖励建模和策略优化合并为一个单一的监督学习步骤。只需要偏好数据（ chosen > rejected ），无需奖励模型，无需 PPO。

核心公式：

DPO 的损失函数基于 Bradley-Terry 模型：

L_DPO = -E[log σ(β · log(π(y_w|x)/π_ref(y_w|x)) - β · log(π(y_l|x)/π_ref(y_l|x)))]

其中：
- y_w 是被偏好的回答（winner）
- y_l 是被拒绝的回答（loser）
- π 是当前策略模型
- π_ref 是参考模型（通常是 SFT 后的模型）
- β 控制偏离参考模型的程度

直觉理解：
DPO 让模型学会"好的回答概率相对参考模型提高，差的回答概率相对参考模型降低"。β 参数控制变化的幅度：β 越大，越保守；β 越小，越激进。`,
      mermaid: `graph TD
    A[偏好数据集
chosen + rejected] --> B[DPO 训练]
    
    subgraph RLHF 流程
        C[SFT 模型] --> D[收集偏好数据]
        D --> E[训练奖励模型]
        E --> F[PPO 优化
不稳定/复杂]
        F --> G[对齐模型]
    end
    
    subgraph DPO 流程
        H[SFT 模型 + 参考模型] --> I[DPO 损失计算
单步优化]
        I --> J[对齐模型]
    end
    
    B --> J
    class J s3
    class I s2
    class F s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#7f1d1d
    classDef s2 fill:#14532d
    classDef s3 fill:#14532d`,
    },
    {
      title: "5.1 DPO 实战代码",
      body: `使用 HuggingFace 的 trl 库实现 DPO 训练：`,
      code: [{ lang: "python", code: `"""
DPO 直接偏好优化实现
替代 RLHF，更简单、更稳定、更高效
"""
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
)
from trl import DPOTrainer, DPOConfig
from peft import LoraConfig, get_peft_model
from datasets import load_dataset


def prepare_dpo_dataset(
    dataset_name: str = "trl-lib/ultrafeedback_binarized",
    split: str = "train_prefs"
):
    """
    加载并准备 DPO 训练数据
    
    DPO 数据格式：每条数据包含
    - prompt: 用户输入
    - chosen: 被偏好的回答
    - rejected: 被拒绝的回答
    """
    dataset = load_dataset(dataset_name, split=split)
    
    # 确保数据格式正确
    assert "prompt" in dataset.column_names
    assert "chosen" in dataset.column_names
    assert "rejected" in dataset.column_names
    
    print(f"数据集大小：{len(dataset)}")
    print(f"示例 prompt：{dataset[0]['prompt'][:100]}...")
    print(f"示例 chosen：{dataset[0]['chosen'][:100]}...")
    print(f"示例 rejected：{dataset[0]['rejected'][:100]}...")
    
    return dataset


def train_dpo(
    model_name: str = "meta-llama/Llama-3.1-8B-Instruct",
    output_dir: str = "./dpo-output",
    beta: float = 0.1,
    learning_rate: float = 5e-7,
    epochs: int = 1,
    batch_size: int = 4,
    max_length: int = 1024,
    use_lora: bool = True
):
    """
    训练 DPO 模型
    
    参数：
        beta: DPO 温度参数
              β=0.1（推荐）：适度的偏好强度
              β=0.01：激进，模型变化大
              β=1.0：保守，接近参考模型
        learning_rate: DPO 学习率通常比 SFT 低 100 倍
        use_lora: 是否使用 LoRA 减少显存
    """
    # 1. 加载模型
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    
    # 2. 可选：应用 LoRA
    if use_lora:
        lora_config = LoraConfig(
            r=16,
            lora_alpha=32,
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
            lora_dropout=0.05,
            bias="none",
            task_type="CAUSAL_LM"
        )
        model = get_peft_model(model, lora_config)
        model.print_trainable_parameters()
    
    # 3. 加载数据
    dataset = prepare_dpo_dataset()
    
    # 4. 配置 DPO 训练
    dpo_config = DPOConfig(
        output_dir=output_dir,
        beta=beta,
        learning_rate=learning_rate,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=4,
        lr_scheduler_type="cosine",
        warmup_ratio=0.1,
        fp16=True,
        logging_steps=10,
        save_strategy="epoch",
        optim="adamw_torch",
        max_length=max_length,
        max_prompt_length=512,
        max_target_length=512,
        remove_unused_columns=False,
        report_to="none",
    )
    
    # 5. 创建 Trainer
    trainer = DPOTrainer(
        model=model,
        ref_model=None,  # DPOTrainer 自动使用 model 的副本作为参考模型
        args=dpo_config,
        train_dataset=dataset,
        tokenizer=tokenizer,
    )
    
    # 6. 训练
    trainer.train()
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    print(f"DPO 训练完成！模型已保存到 {output_dir}")
    return model


# 使用示例
# model = train_dpo(
#     model_name="meta-llama/Llama-3.1-8B-Instruct",
#     beta=0.1,
#     learning_rate=5e-7,
#     epochs=1
# )`, filename: "dpo_training.py" }],
    },
    {
      title: "六、ORPO 与其他新兴微调方法",
      body: `2024-2026 年间，多个新的微调方法涌现，各有特色：

ORPO（Odds Ratio Preference Optimization）
Hong et al. (2024) 提出。将 SFT 和偏好对齐合并为一步，无需参考模型。比 DPO 更简单，效果相当甚至更好。

核心思想：
在 SFT 损失的基础上，加入一个基于赔率比（Odds Ratio）的惩罚项，让模型同时学习"说什么"和"怎么说"。

GAPO（Generative Adversarial Preference Optimization）
引入对抗训练的思想，通过生成器-判别器的博弈来优化模型输出。适合需要高质量生成的场景。

SimPO（Simple Preference Optimization）
去掉了 DPO 中的参考模型，直接使用长度归一化的对数概率。更简单、更稳定，在多个基准上超越 DPO。

KTO（Kahneman-Tversky Optimization）
基于前景理论（Prospect Theory），只需要二元信号（好/坏），不需要成对的偏好数据。数据收集成本最低。`,
      table: {
        headers: ["方法", "需要参考模型", "需要偏好对", "SFT 合并", "显存需求", "效果"],
        rows: [
          ["RLHF (PPO)", "❌", "✅", "❌", "极高", "⭐⭐⭐⭐⭐"],
          ["DPO", "✅ (自动)", "✅", "❌", "高", "⭐⭐⭐⭐"],
          ["ORPO", "❌", "✅", "✅", "高", "⭐⭐⭐⭐"],
          ["SimPO", "❌", "✅", "❌", "高", "⭐⭐⭐⭐"],
          ["KTO", "❌", "❌ (只需二元信号)", "❌", "中", "⭐⭐⭐"],
          ["LoRA (SFT)", "❌", "❌", "✅", "低", "⭐⭐⭐"],
          ["QLoRA (SFT)", "❌", "❌", "✅", "极低", "⭐⭐⭐"],
        ]
      },
    },
    {
      title: "七、微调方案对比与选型指南",
      body: `选择哪种微调方法取决于你的具体场景。以下是综合选型指南：

场景 1：快速适配新领域（数据 < 10K 条）
→ LoRA (r=16) + SFT
理由：数据少时 LoRA 不容易过拟合，训练快，效果好。

场景 2：消费级 GPU 微调大模型
→ QLoRA (4-bit, r=16) + SFT
理由：单卡即可运行，效果与 LoRA 几乎一致。

场景 3：提升模型的安全性和指令遵循
→ DPO (β=0.1) + SFT 模型
理由：DPO 专精于偏好对齐，比 RLHF 简单 10 倍。

场景 4：从零开始定制企业模型
→ SFT (LoRA) → DPO → 评估迭代
理由：先让模型学会领域知识，再对齐企业偏好。

场景 5：极致效果（有充足资源）
→ 全量 SFT → DPO → 评估
理由：全量微调的表达能力上限最高。`,
      mermaid: `graph TD
    A[微调需求分析] --> B{数据规模}
    
    B -->|<10K 条| C[LoRA SFT]
    B -->|10K-100K| D{有偏好数据?}
    B -->|>100K| E{显存充足?}
    
    D -->|是| F[SFT → DPO]
    D -->|否| C
    
    E -->|是| G[全量 SFT → DPO]
    E -->|否| H[QLoRA SFT → DPO]
    
    C --> I[评估]
    F --> I
    G --> I
    H --> I
    
    I -->|达标| J[部署]
    I -->|不达标| K{问题类型}
    K -->|知识不足| L[增加数据]
    K -->|风格不对| M[DPO 对齐]
    K -->|幻觉严重| N[RAG + 微调]
    
    L --> I
    M --> I
    N --> I
    class N s2
    class J s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
    },
    {
      title: "八、微调后评估：如何判断微调是否成功？",
      body: `微调完成后，系统性的评估是确保模型质量的关键。

评估维度：

1. 任务准确率：在目标任务的测试集上测量
2. 通用能力保留：检查是否发生灾难性遗忘
3. 输出质量：人工评估流畅度、一致性、安全性
4. 推理效率：延迟、吞吐量是否有变化

推荐的评估工具：
- Open LLM Leaderboard (HuggingFace)
- lm-evaluation-harness
- MT-Bench（多轮对话评测）
- 自建领域测试集（最重要）

关键原则：
永远不要在训练数据上评估！必须使用独立的测试集，否则无法判断是真正学会了还是死记硬背。`,
      code: [{ lang: "python", code: `"""
微调后评估脚本
评估模型在目标任务上的表现，同时检查灾难性遗忘
"""
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
from lm_eval import evaluator
from tqdm import tqdm
import json


def evaluate_task_accuracy(
    model_path: str,
    base_model_name: str,
    test_data: list[dict],
    adapter_path: str = None
):
    """
    评估微调模型在目标任务上的准确率
    
    参数：
        model_path: 基础模型路径
        test_data: 测试数据列表，每项包含
            {"prompt": "...", "expected": "..."}
        adapter_path: LoRA 适配器路径（如果有）
    """
    # 1. 加载模型
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )
    
    if adapter_path:
        model = PeftModel.from_pretrained(model, adapter_path)
    
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model.eval()
    
    # 2. 生成并评估
    correct = 0
    results = []
    
    for item in tqdm(test_data, desc="评估中"):
        prompt = item["prompt"]
        expected = item["expected"]
        
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_new_tokens=256,
                do_sample=False,
                temperature=0.0,
            )
        
        generated = tokenizer.decode(
            outputs[0][inputs["input_ids"].shape[1]:],
            skip_special_tokens=True
        ).strip()
        
        # 简单评估（实际应用中应该用更复杂的评估方法）
        is_match = expected.lower() in generated.lower() or \\
                   generated.lower() in expected.lower()
        
        if is_match:
            correct += 1
        
        results.append({
            "prompt": prompt,
            "expected": expected,
            "generated": generated,
            "match": is_match
        })
    
    accuracy = correct / len(test_data)
    print(f"任务准确率：{accuracy:.2%} ({correct}/{len(test_data)})")
    
    return {
        "accuracy": accuracy,
        "total": len(test_data),
        "correct": correct,
        "results": results
    }


def check_catastrophic_forgetting(
    model_path: str,
    adapter_path: str = None,
    benchmark: str = "mmlu"
):
    """
    检查灾难性遗忘：微调后通用能力的变化
    """
    # 使用 lm-evaluation-harness 评估通用基准
    # 注意：需要在环境中安装 lm-eval
    pass


# 使用示例
# test_data = [
#     {"prompt": "什么是机器学习？", "expected": "机器学习是..."},
#     {"prompt": "解释梯度下降", "expected": "梯度下降是..."},
# ]
# 
# result = evaluate_task_accuracy(
#     model_path="meta-llama/Llama-3.1-8B",
#     adapter_path="./lora-output/lora-adapter",
#     test_data=test_data
# )
# 
# print(f"准确率：{result['accuracy']:.2%}")
# for r in result['results']:
#     if not r['match']:
#         print(f"❌ 错误：{r['prompt']}")
#         print(f"   期望：{r['expected']}")
#         print(f"   生成：{r['generated']}")`, filename: "evaluate_finetune.py" }],
    },
    {
      title: "九、2026 年微调最佳实践总结",
      body: `经过几年的技术演进，LLM 微调已经形成了一套成熟的工程实践。

🔧 工具链推荐：
- PEFT 库：LoRA/QLoRA 实现
- TRL 库：DPO/ORPO 实现
- Axolotl：一键微调配置工具
- Unsloth：2 倍加速 + 60% 显存节省

📊 数据准备建议：
1. 数据质量 >> 数据数量：1000 条高质量数据优于 10000 条噪声数据
2. 格式统一：使用一致的 prompt 模板
3. 多样性：覆盖目标任务的各种场景和边界情况
4. 划分清晰：训练集/验证集/测试集 8:1:1

⚡ 训练优化技巧：
1. 学习率预热：5% warmup + cosine decay
2. 梯度裁剪：max_grad_norm=0.3 防止梯度爆炸
3. 早停策略：监控验证集损失，patience=2
4. 混合精度：bfloat16 比 fp16 更稳定

⚠️ 常见陷阱：
- 学习率过高：LoRA 崩溃，输出变成乱码
- 训练过久：过拟合训练数据，泛化能力下降
- 数据泄漏：测试集混入训练集，评估结果虚高
- 忘记冻结：全量微调时未正确冻结部分参数

🔮 未来趋势：
- 自监督微调：模型自动筛选高质量训练数据
- 多模态微调：视觉-语言-语音统一微调框架
- 在线微调：生产环境中持续学习用户反馈
- 联邦微调：多参与方协作微调，数据不出域`,
      table: {
        headers: ["技术", "显存需求 (8B)", "训练时间 (Alpaca)", "适用 GPU", "效果"],
        rows: [
          ["全量微调", "~64 GB", "~12 小时", "A100 80G", "⭐⭐⭐⭐⭐"],
          ["LoRA (r=16)", "~18 GB", "~4 小时", "RTX 4090", "⭐⭐⭐⭐"],
          ["QLoRA (4-bit)", "~6 GB", "~5 小时", "RTX 3060", "⭐⭐⭐⭐"],
          ["LoRA + DPO", "~20 GB", "~6 小时", "RTX 4090", "⭐⭐⭐⭐⭐"],
          ["Unsloth QLoRA", "~5 GB", "~2 小时", "RTX 3060", "⭐⭐⭐⭐"],
        ]
      },
    },
    {
      title: "十、下一步学习路径",
      body: `掌握微调技术后，你可以继续深入以下方向：

📖 推荐阅读：
- [RLHF 深度解析](/knowledge/llm-005) — 理解传统的对齐方法
- [LLM 推理优化](/knowledge/llm-024) — 量化、剪枝与蒸馏全面指南
- [LLM 部署实践](/knowledge/llm-012) — 将模型部署到生产环境
- [Agent 学习导览](/knowledge/agent-guide) — 微调后的模型如何用于 Agent

🔧 实践建议：
1. 从 QLoRA 开始，在消费级 GPU 上完成第一次微调
2. 收集 500-1000 条高质量指令数据
3. 训练 LoRA 适配器并评估效果
4. 收集偏好数据，用 DPO 进一步对齐
5. 将微调后的模型集成到你的应用中

⚠️ 重要提醒：
- 微调不能替代良好的 prompt engineering，两者是互补的
- 对于知识密集型任务，RAG** 可能比微调更合适
- 始终在独立测试集上评估，防止过拟合
- 注意模型许可协议，部分模型不允许微调后商用`,
    }
  ]
};
