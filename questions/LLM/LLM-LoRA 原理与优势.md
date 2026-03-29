---
title: "LoRA 原理与优势"
category: "LLM"
difficulty: "⭐⭐⭐"
tags: ["LoRA", "PEFT", "低秩适配", "参数高效"]

collectedAt: "2026-03-29"
---

## 题目描述
请解释 LoRA（Low-Rank Adaptation）的原理，为什么它能大幅减少训练参数量，以及在实际应用中的优势。

**标签：** LoRA，PEFT，低秩适配，参数高效

## 参考答案

**LoRA 核心思想：**
不直接更新大模型权重，而是训练低秩矩阵来近似权重变化。

**原理公式：**
```python
# 原始权重更新：W' = W + ΔW
# LoRA 近似：ΔW ≈ B × A

# 前向传播
h = W₀x + ΔWx = W₀x + BAx

# W₀: 冻结的预训练权重 (d×k)
# B: 可训练矩阵 (d×r)
# A: 可训练矩阵 (r×k)
# r << d, k (秩，通常 8-64)
```

**实现细节：**
```python
import torch.nn as nn

class LoRALinear(nn.Module):
    def __init__(self, in_features, out_features, r=16):
        super().__init__()
        self.W₀ = nn.Linear(in_features, out_features)
        self.A = nn.Linear(in_features, r, bias=False)
        self.B = nn.Linear(r, out_features, bias=False)
        
        # A 初始化为高斯，B 初始化为 0
        nn.init.kaiming_uniform_(self.A.weight)
        nn.init.zeros_(self.B.weight)
    
    def forward(self, x):
        return self.W₀(x) + self.B(self.A(x))
```

**参数减少量：**
- 原始：d × k 参数
- LoRA：(d + k) × r 参数
- 示例：7B 模型，r=16，可训练参数仅 0.1%

**优势：**
1. **高效：** 训练速度提升 2-4 倍
2. **省显存：** 无需存储优化器状态
3. **模块化：** 不同任务训练不同 LoRA，推理时切换
4. **无推理延迟：** 可合并回原权重
5. **效果好：** 接近全量 Fine-tuning

**应用位置：**
- 主要应用于 Attention 的 Q/V 投影
- 也可用于 FFN 层

**应用：**
- LLaMA-Factory、PEFT 库支持
- 社区主流微调方法

## 考察重点
- **知识：** LoRA 的数学原理和实现
- **能力：** 理解低秩近似的动机
- **思维：** 参数高效训练的设计思想

## 延伸追问（25 分）
1. 为什么 B 初始化为 0？（5 分）
2. LoRA 的秩 r 如何选择？（5 分）
3. 什么是 QLoRA？与 LoRA 有什么区别？（5 分）
4. LoRA 可以应用于哪些层？（5 分）
5. 多个 LoRA 适配器如何合并？（5 分）

## 深入理解
LoRA 是 PEFT 的代表性工作，让大模型微调变得平民化。

## 更新历史
- v1 (2026-03-29): 初始版本
