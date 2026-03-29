---
title: "推理优化技术全景"
category: "LLM"
difficulty: "⭐⭐⭐⭐"
tags: ["推理优化", "量化", "蒸馏", " speculate"]
source: "LLM 面试题整理"
sourceUrl: ""
collectedAt: "2026-03-29"
---

## 题目描述
请系统介绍 LLM 推理优化的主要技术，包括量化、蒸馏、推测解码等，以及它们的适用场景。

**来源：** LLM 面试题整理
**标签：** 推理优化，量化，蒸馏，推测解码

## 参考答案

**推理优化目标：**
- 降低延迟（Latency）
- 提高吞吐量（Throughput）
- 减少显存占用
- 降低成本

**主要技术：**

**1. 量化（Quantization）：**
```python
# FP16 → INT8/INT4
weight_int8 = (weight_fp16 / scale).round().clamp(-128, 127).to(int8)

# 推理时反量化
output = dequant(weight_int8, scale) @ input
```
- **PTQ（训练后量化）：** 无需训练，快速部署
- **QAT（量化感知训练）：** 效果更好，需要微调
- **典型方案：** GPTQ、AWQ、SmoothQuant

**效果：**
- INT8：1/2 显存，1.5-2x 加速，几乎无损
- INT4：1/4 显存，2-3x 加速，轻微损失

**2. 知识蒸馏（Distillation）：**
```python
# 大模型（教师）→ 小模型（学生）
loss = KL(student_logits, teacher_logits) + CE(student_logits, labels)
```
- 学习教师模型的输出分布
- 小模型推理更快
- 典型：DistilBERT、TinyLlama

**3. 推测解码（Speculative Decoding）：**
```python
# 小模型快速生成 k 个 token
draft_tokens = small_model.generate(prompt, k=5)

# 大模型并行验证
accept_mask = large_model.verify(prompt, draft_tokens)

# 接受匹配的，拒绝不匹配的
output = prompt + draft_tokens[accept_mask]
```
- 小模型草稿，大模型验证
- 2-4x 加速，无损
- 需要额外小模型

**4. 模型剪枝（Pruning）：**
```python
# 移除不重要的权重或神经元
pruned_model = prune(model, importance_score, sparsity=0.5)
```
- 结构化剪枝：移除完整层/头
- 非结构化剪枝：移除单个权重
- 需要微调恢复性能

**5. 注意力优化：**
- **Flash Attention：** IO 感知，2-3x 加速
- **稀疏注意力：** 减少计算量
- **MQA/GQA：** 减少 KV Cache

**6. 算子融合：**
```python
# 融合多个算子为一个 CUDA kernel
fused_op = fuse(layer_norm, linear, activation)
```
- 减少 kernel 启动开销
- 提高显存带宽利用

**推理引擎对比：**

| 引擎 | 量化 | 连续批处理 | 推测解码 | PagedAttention |
|------|------|-----------|---------|---------------|
| vLLM | ✓ | ✓ | ✓ | ✓ |
| TGI | ✓ | ✓ | ✗ | ✗ |
| TensorRT-LLM | ✓ | ✓ | ✓ | ✗ |

**选择建议：**
- **延迟敏感：** 量化 + 推测解码
- **吞吐敏感：** 连续批处理 + KV Cache 优化
- **显存受限：** 量化 + 模型并行
- **成本敏感：** 蒸馏到小模型

## 考察重点
- **知识：** 各种优化技术的原理
- **能力：** 根据场景选择优化方案
- **思维：** 系统性优化思维

## 延伸追问（25 分）
1. GPTQ 和 AWQ 有什么区别？（5 分）
2. 推测解码的加速比如何计算？（5 分）
3. 什么是激活感知量化？（5 分）
4. 如何平衡量化精度和速度？（5 分）
5. 蒸馏时如何选择合适的教师模型？（5 分）

## 深入理解
推理优化是 LLM 落地的最后一公里，直接决定用户体验和成本。

## 更新历史
- v1 (2026-03-29): 初始版本
