---
title: "RAG 工作原理与实现"
category: "LLM"
difficulty: "⭐⭐⭐"
tags: ["RAG", "检索增强", "向量数据库", "知识更新"]
source: "LLM 面试题整理"
sourceUrl: ""
collectedAt: "2026-03-29"
---

## 题目描述
请解释 RAG（Retrieval-Augmented Generation）的工作原理，包括检索器、生成器的协作，以及如何构建 RAG 系统。

**来源：** LLM 面试题整理
**标签：** RAG，检索增强，向量数据库，知识更新

## 参考答案

**RAG 核心思想：**
将检索外部知识与生成模型结合，解决知识截止和幻觉问题。

**系统架构：**
```
用户问题 → 检索器 → 相关文档 → [问题 + 文档] → 生成器 → 回答
```

**组件详解：**

1. **检索器（Retriever）：**
   - 将文档切分为 chunks
   - 使用 Embedding 模型向量化
   - 存入向量数据库（FAISS、Milvus、Pinecone）
   - 查询时计算相似度，返回 Top-K 文档

2. **生成器（Generator）：**
   - 接收问题 + 检索到的文档
   - 基于上下文生成回答
   - 通常是 LLM（GPT、LLaMA 等）

**关键步骤：**
```python
# 1. 文档预处理
chunks = split_documents(docs, chunk_size=500)

# 2. 向量化
embeddings = embedding_model.encode(chunks)

# 3. 存储
vector_db.add(chunks, embeddings)

# 4. 检索
similar_docs = vector_db.search(query_embedding, top_k=5)

# 5. 生成
prompt = f"基于以下信息回答：{similar_docs}\n问题：{query}"
answer = llm.generate(prompt)
```

**优势：**
- 知识可更新，无需重新训练
- 减少幻觉，提供引用来源
- 处理长尾知识效果好

**挑战：**
- 检索质量影响最终效果
- 多跳推理能力有限
- 延迟增加（检索 + 生成）

**应用：**
- 企业知识库问答
- 客服系统
- 文档摘要和问答

## 考察重点
- **知识：** RAG 的架构和各组件功能
- **能力：** 设计和实现 RAG 系统
- **思维：** 理解检索与生成的协同价值

## 延伸追问（25 分）
1. 如何选择合适的 chunk size？（5 分）
2. 稠密检索和稀疏检索有什么区别？（5 分）
3. 什么是 Hybrid Search？（5 分）
4. 如何评估 RAG 系统的质量？（5 分）
5. RAG 与 Fine-tuning 如何选择？（5 分）

## 深入理解
RAG 是连接静态知识与动态生成的桥梁，是企业应用 LLM 的主流方案。

## 更新历史
- v1 (2026-03-29): 初始版本
