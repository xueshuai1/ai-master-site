# 知识库内容审计报告

**日期：** 2026-05-09  
**文章总数：** 305 篇 × 15 个分类

---

## 🔴 问题 1：入门文章严重不足（5 个分类 < 10%）

| 分类 | 总数 | 入门 | 入门占比 | 严重程度 |
|------|------|------|----------|----------|
| aieng | 34 | 1 | **3%** | 🔴 |
| llm | 31 | 1 | **3%** | 🔴 |
| agent | 52 | 2 | **4%** | 🔴 |
| practice | 25 | 1 | **4%** | 🔴 |
| ethics | 31 | 2 | **6%** | 🔴 |
| genai | 10 | 1 | **10%** | ⚡ |
| mlops | 9 | 1 | **11%** | ⚡ |

**影响：** 这 7 个分类共 193 篇文章，但只有 9 篇入门，新手进来直接面对高级文章，看不懂就走。

---

## 🔴 问题 2：严重重复主题（同一主题多篇文章互不关联）

### 最高优先级合并项

| 主题 | 文章数 | 涉及分类 | 建议 |
|------|--------|----------|------|
| **推理加速** | 7 篇 | dl/llm/infer/aieng | 合并为 2-3 篇：基础原理 + 实战 |
| **MoE** | 5 篇 | ai/dl/llm | 合并为 2 篇：原理 + 实战 |
| **RAG** | 8 篇 | agent/llm/aieng/practice | 合并为 3 篇：基础 + 进阶 + 实战 |
| **量化** | 13 篇 | ai/aieng/edge/finance/infer/llm/mlops/practice/prompt | 大量文章只是顺带提到，需去重 |
| **RLHF** | 6 篇 | ethics/llm | 合并为 2 篇 |
| **多模态** | 15 篇 | agent/llm/mm/prompt/voice | 分散在 5 个分类，需整合 |
| **注意力机制** | 3 篇 | dl/nlp | 重复度最高 |
| **预训练** | 6 篇 | dl/llm/mm/nlp | 重复 |
| **蒸馏** | 5 篇 | ai/aieng/ethics/llm | 重复 |
| **CNN** | 9 篇 | cv/dl | 重复，dl-006 和 dl-020 几乎同一主题 |
| **知识图谱** | 5 篇 | agent/ai | agent 内 3 篇重复 |
| **MCP** | 8 篇 | agent/aieng | 需整合 |
| **具身智能** | 6 篇 | agent/physical | 分散在 2 个分类 |

---

## 🔴 问题 3：分类边界模糊

**重叠最严重的分类对：**

| 分类 A | 分类 B | 共同标签数 | 主要重叠 |
|--------|--------|-----------|----------|
| agent | aieng | 26 | React, 工具调用, LangGraph, CrewAI, MCP |
| llm | aieng | 19 | 知识蒸馏, 模型压缩, 推理加速 |
| agent | llm | 15 | 向量数据库, MCP, 评测 |
| aieng | mlops | 14 | MLOps, 实验追踪, MLflow |
| ethics | llm | 10 | AI 安全, AI 治理, RLHF |
| practice | aieng | 13 | AI Agent, 边缘计算 |

**根因：** 一篇文章可以同时属于多个分类，但系统只允许一个 category，导致相关文章散落在不同分类。

---

## 🔴 问题 4：Guide 提到的主题缺失

| Guide | 缺失主题 |
|-------|----------|
| math-ml-guide | 微积分、监督学习、无监督学习 |
| llm-app-guide | Embedding（核心概念但没有独立文章） |

---

## 📋 建议行动方案

### Phase 1：去重合并（1-2 天）
1. **推理加速 7→3 篇**：infer-001 + infer-002 + llm-015 + llm-021 + llm-024 + dl-018 + aieng-025
2. **MoE 5→2 篇**：ai-003 + dl-017 + llm-013 + llm-023 + llm-019
3. **CNN 9→3 篇**：dl-006 和 dl-020 合并 + cv 系列整合
4. **注意力机制 3→1 篇**：dl-004 + dl-011 合并
5. **蒸馏 5→2 篇**：ai-distillation-001 + llm-007 + llm-024 合并

### Phase 2：补充入门（2-3 天）
6. **agent 入门 +5 篇**：Agent 概念、工具调用基础、记忆系统基础、MCP 入门、ReAct 模式
7. **llm 入门 +5 篇**：LLM 是什么、Token 机制、Prompt 进阶、API 调用基础、RAG 基础
8. **aieng 入门 +3 篇**：AI 工程化是什么、部署基础、监控基础
9. **ethics 入门 +3 篇**：AI 伦理概论、偏见检测基础、隐私保护概论

### Phase 3：分类重组（1 天）
10. **aieng ↔ mlops 合并** 为 "AI 工程化 & MLOps"
11. **agent 安全文章** 统一归 ethics 或保持 agent 但加子分类
12. **具身智能** 统一归 multimodal 或新建 "physical-ai"

### Phase 4：知识图谱（2-3 天）
13. 给所有文章加 `learningPath.prerequisites` 和 `learningPath.nextStep`
14. Guide 文章链接到具体文章序列

---

**预期效果：**
- 文章总数从 305 → ~220 篇（去重 85 篇）
- 新增 ~16 篇入门文章
- 最终 ~236 篇，但系统性提升 3-5 倍
