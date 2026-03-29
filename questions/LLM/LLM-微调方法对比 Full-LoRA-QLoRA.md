---
title: "微调方法对比：Full vs LoRA vs QLoRA"
category: "LLM"
difficulty: "⭐⭐⭐"
tags: ["微调", "LoRA", "QLoRA", "参数高效"]

collectedAt: "2026-03-29"
---

## 题目描述
请对比 Full Fine-tuning、LoRA 和 QLoRA 三种微调方法，包括原理、资源需求和适用场景。

**标签：** 微调，LoRA，QLoRA，参数高效

## 参考答案

**三种方法对比：**

| 维度 | Full Fine-tuning | LoRA | QLoRA |
|------|-----------------|------|-------|
| 可训练参数 | 100% | 1-10% | 1-10% |
| 基础精度 | FP16/BF16 | FP16/BF16 | INT4 |
| 显存需求 | 高 | 中 | 低 |
| 训练速度 | 慢 | 快 | 快 |
| 效果 | 最佳 | 接近 | 接近 |
| 实现难度 | 简单 | 中等 | 复杂 |

**Full Fine-tuning：**
```python
# 更新所有参数
for param in model.parameters():
    param.requires_grad = True

# 显存需求 = 模型 + 梯度 + 优化器状态
# 7B 模型约需 80GB+ 显存
```

**LoRA（Low-Rank Adaptation）：**
```python
# 冻结基础模型，只训练低秩适配器
for param in model.parameters():
    param.requires_grad = False

# 注入 LoRA 模块
for layer in attention_layers:
    layer.q_proj = LoRALinear(layer.q_proj, r=16)
    layer.v_proj = LoRALinear(layer.v_proj, r=16)

# 显存需求减少 60-70%
```

**QLoRA（Quantized LoRA）：**
```python
# 4bit 量化基础模型
model = NF4QuantizedModel(model, bits=4)

# 结合 LoRA 微调
model = inject_lora(model, r=64)

# 使用双重量化
- 量化权重：NF4 格式
- 量化梯度：FP16

# 7B 模型仅需 12GB 显存
```

**技术细节：**

**QLoRA 关键创新：**
1. **4bit NormalFloat (NF4)：** 针对正态分布优化的量化
2. **双重量化：** 量化常数量化减少额外开销
3. **分页优化器：** 防止显存峰值

**资源对比（7B 模型）：**
```
Full FT:  80GB 显存，100% 参数
LoRA:     24GB 显存，0.2% 参数
QLoRA:    12GB 显存，0.2% 参数
```

**适用场景：**

**Full Fine-tuning：**
- 资源充足
- 追求最佳效果
- 领域差异大

**LoRA：**
- 常规微调任务
- 需要快速迭代
- 多任务适配

**QLoRA：**
- 消费级 GPU
- 大模型微调
- 资源受限场景

## 考察重点
- **知识：** 三种方法的原理和差异
- **能力：** 根据资源选择合适方案
- **思维：** 理解量化与效率的权衡

## 延伸追问（25 分）
1. 为什么 LoRA 只应用于 Q/V 投影？（5 分）
2. QLoRA 的 NF4 量化与标准 4bit 有什么区别？（5 分）
3. 如何合并 LoRA 权重到基础模型？（5 分）
4. 什么是梯度检查点？如何节省显存？（5 分）
5. 多 LoRA 适配器如何管理？（5 分）

## 深入理解
参数高效微调让大模型训练平民化，是实际应用的关键技术。

## 更新历史
- v1 (2026-03-29): 初始版本
