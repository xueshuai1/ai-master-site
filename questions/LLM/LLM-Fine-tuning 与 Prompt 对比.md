---
title: "Fine-tuning 与 Prompt Engineering 对比"
category: "LLM"
difficulty: "⭐⭐⭐"
tags: ["Fine-tuning", "Prompt", "参数更新", "场景选择"]
source: "LLM 面试题整理"
sourceUrl: ""
collectedAt: "2026-03-29"
---

## 题目描述
什么是 Fine-tuning？它与 Prompt Engineering 有什么区别？在什么场景下应该选择哪种方法？

**来源：** LLM 面试题整理
**标签：** Fine-tuning，Prompt，参数更新，场景选择

## 参考答案

**Fine-tuning 定义：**
在预训练模型基础上，使用特定任务数据继续训练，更新模型参数以适应新任务。

**两种方法对比：**

| 维度 | Prompt Engineering | Fine-tuning |
|------|-------------------|-------------|
| 参数更新 | 否 | 是 |
| 数据需求 | 少量示例 | 数百至数万样本 |
| 成本 | 低（仅 API 调用） | 高（训练资源） |
| 效果上限 | 受限于基座模型 | 可超越基座 |
| 知识注入 | 临时（上下文） | 持久（参数） |
| 延迟 | 低 | 低（推理时） |
| 可解释性 | 高（提示可见） | 低（参数黑盒） |

**Fine-tuning 方法：**

1. **Full Fine-tuning：**
   - 更新所有参数
   - 效果好但成本高
   - 容易灾难性遗忘

2. **Parameter-Efficient Fine-tuning (PEFT)：**
   - LoRA：只训练低秩适配器
   - Adapter：插入小型模块
   - Prefix Tuning：优化前缀向量

**场景选择：**

**选择 Prompt Engineering：**
- 快速原型验证
- 任务简单，基座模型已能处理
- 数据稀缺或标注成本高
- 需要频繁切换任务

**选择 Fine-tuning：**
- 特定领域（医疗、法律）
- 需要学习新格式/风格
- 任务复杂，Prompt 效果不佳
- 大规模部署，优化成本

**实践建议：**
```
1. 先用 Prompt Engineering 验证任务可行性
2. 效果不够再考虑 Fine-tuning
3. 优先尝试 LoRA 等高效方法
4. 保留验证集监控过拟合
```

## 考察重点
- **知识：** 两种方法的原理和差异
- **能力：** 根据场景做出正确技术选型
- **思维：** 理解成本 - 效果权衡

## 延伸追问（25 分）
1. Fine-tuning 为什么会导致灾难性遗忘？（5 分）
2. 什么是 Instruction Tuning？（5 分）
3. LoRA 为什么能减少训练参数量？（5 分）
4. 如何准备 Fine-tuning 数据集？（5 分）
5. 什么是 DPO？与 RLHF 有什么区别？（5 分）

## 深入理解
Fine-tuning 和 Prompt Engineering 是互补而非对立，实际应用中常结合使用。

## 更新历史
- v1 (2026-03-29): 初始版本
