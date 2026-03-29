---
title: "Prompt Engineering 技巧与实践"
category: "LLM"
difficulty: "⭐⭐"
tags: ["Prompt", "Few-Shot", "CoT", "提示工程"]
source: "LLM 面试题整理"
sourceUrl: ""
collectedAt: "2026-03-29"
---

## 题目描述
什么是 Prompt Engineering？请列举常用的提示技巧，并解释 Few-Shot 和 Chain-of-Thought 的原理。

**来源：** LLM 面试题整理
**标签：** Prompt，Few-Shot，CoT，提示工程

## 参考答案

**Prompt Engineering 定义：**
通过设计和优化输入提示，引导大模型产生更好输出的技术和方法。

**常用技巧：**

1. **Zero-Shot：**
   ```
   直接提问："法国首都是哪里？"
   ```

2. **Few-Shot Learning：**
   ```
   问题：2+3=?  答案：5
   问题：4+7=?  答案：11
   问题：9+6=?  答案：
   ```
   - 提供少量示例，无需训练
   - 让模型理解任务格式

3. **Chain-of-Thought (CoT)：**
   ```
   问题：小明有 5 个苹果，给了小红 2 个，又买了 3 个，现在有几个？
   解答：小明原有 5 个，给出 2 个后剩 3 个，再买 3 个，总共 6 个。
   答案：6 个
   ```
   - 引导模型展示推理过程
   - 显著提升复杂任务表现

4. **Role Prompting：**
   ```
   你是一位资深 Python 工程师，请 review 以下代码...
   ```

5. **Self-Consistency：**
   - 多次采样取多数答案
   - 提高稳定性

6. **ReAct（Reasoning + Acting）：**
   - 交替进行推理和工具调用

**最佳实践：**
- 清晰具体的指令
- 提供相关上下文
- 指定输出格式
- 使用分隔符结构化

**应用：**
- 所有 LLM 应用的基础技能
- 客服、编程、写作等场景

## 考察重点
- **知识：** 各种 Prompt 技巧的定义和用法
- **能力：** 根据任务设计有效提示
- **思维：** 理解模型如何响应不同提示

## 延伸追问（25 分）
1. Few-Shot 为什么有效？从模型训练角度解释。（5 分）
2. CoT 对什么类型的任务提升最明显？（5 分）
3. 什么是 Automatic Prompt Engineering？（5 分）
4. Prompt 长度对模型性能有什么影响？（5 分）
5. 如何评估 Prompt 的质量？（5 分）

## 深入理解
Prompt Engineering 是释放 LLM 潜力的关键技能，无需训练即可优化效果。

## 更新历史
- v1 (2026-03-29): 初始版本
