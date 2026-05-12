// AI Agent 记忆系统架构：从短期缓存到长期记忆宫殿

import { Article } from '../knowledge';

export const article: Article = {
  id: "agent-025",
  title: "Agent 记忆系统（二）：从短期缓存到长期记忆宫殿",
  category: "agent",
  tags: ["Agent 记忆", "向量数据库", "知识图谱", "RAG", "记忆压缩", "Claude-Mem", "MemPalace", "混合记忆架构", "Episodic Memory", "Semantic Memory"],
  summary: "2026 年 4 月，AI Agent 记忆系统从实验性功能爆发为开发者刚需基础设施。Claude-Mem 两周狂揽 64K 星，MemPalace 发布 48 小时即获 22K 星，记忆正在成为 Agent 的核心竞争力。本文深度解析 AI Agent 记忆系统的完整技术栈——从短期工作记忆到长期语义记忆，从向量检索到知识图谱，从记忆压缩到遗忘机制，附带完整的 Python 混合型记忆系统实现代码。",
  date: "2026-04-21",
  readTime: "32 min",
  level: "进阶",
  learningPath: {
    routeId: "agent-memory",
    phase: 2,
    order: 2,
    nextStep: "agent-029",
    prevStep: "agent-005",
  },
  content: [
    {
      title: "1. 为什么记忆是 AI Agent 的下一个必争之地？",
      body: `2026 年 4 月的 GitHub Trending 传递了一个明确信号：AI Agent 的竞争焦点正在从「能力」转向「记忆」。

**Claude**-Mem（thedotmack）在短短两周内狂揽 64,577 stars，单周增长 12,472 星。MemPalace 发布仅 48 小时就突破 22,000 星。这两个项目的共同特点是：让 AI Agent 拥有持久、可检索、可压缩的记忆能力。

为什么记忆突然变得如此重要？

因为 Agent 正在从「一次性对话工具」进化为「长期协作伙伴」。一个没有记忆的 Agent，每次交互都从零开始——它不记得你的偏好、不熟悉你的项目、不了解你过去的决策。这就像每次和同事说话都先做自我介绍一样荒谬。

记忆系统的价值体现在三个维度：

| 维度 | 无记忆 Agent | 有记忆 Agent |
|------|-------------|-------------|
| 上下文理解 | 仅限当前对话窗口 | 跨会话、跨项目的完整历史 |
| 个性化程度 | 通用回答 | 根据你的历史定制输出 |
| 任务连续性 | 每次重新开始 | 记住进度、从中断处继续 |

2026 年，记忆不再是「锦上添花」，而是 Agent 的核心竞争力。没有记忆的 Agent 就像没有海马体的人类——能思考，但无法成长。

记忆系统的架构正在经历从「简单追加」到「智能管理」的范式转变。早期的 Agent 记忆就是简单的对话历史追加，很快就遇到上下文窗口限制。现在的记忆系统采用分层架构——短期工作记忆、中期情景记忆、长期语义记忆，每一层有不同的存储策略和检索机制。`,
      mermaid: `graph TD
    A["用户输入"] --> B["感知层
Perception"]
    B --> C["工作记忆
Working Memory
(当前会话)"]
    C --> D["情景记忆
Episodic Memory
(近期事件)"]
    D --> E["语义记忆
Semantic Memory
(长期知识)"]
    E --> F["程序记忆
Procedural Memory
(技能与模式)"]
    
    C -.->|"超时/压缩"| D
    D -.->|"巩固"| E
    E -.->|"抽象化"| F
    
    F --> G["决策层
Decision"]
    G --> H["行动输出
Action"]
    class H s7
    class G s6
    class F s5
    class E s4
    class D s3
    class C s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f,color:#f1f5f9
    classDef s1 fill:#78350f,color:#f1f5f9,color:#1e293b
    classDef s2 fill:#7f1d1d,color:#f1f5f9
    classDef s3 fill:#78350f,color:#f1f5f9,color:#1e293b
    classDef s4 fill:#064e3b,color:#f1f5f9
    classDef s5 fill:#7c3aed,color:#f1f5f9
    classDef s6 fill:#78350f,color:#f1f5f9
    classDef s7 fill:#1e3a5f,color:#f1f5f9`,
    },
    {
      title: "2. AI Agent 记忆系统的四层架构",
      body: `受人类认知科学启发，现代 AI Agent 记忆系统普遍采用四层分层架构。每一层有不同的存储介质、检索策略和生命周期。

### 2.1 工作记忆（Working Memory）—— Agent 的「注意力焦点」

工作记忆对应人类的「短时记忆」，存储当前会话的上下文信息。它的特点是高速读写、容量有限、快速衰减。

在技术实现上，工作记忆通常是：
- 对话历史缓冲区：保留最近 N 轮对话
- 注意力上下文：当前正在处理的任务相关信息
- 临时推理状态：多步推理的中间结果

**关键设计决策**：如何管理上下文窗口？

LLM 的上下文窗口有限（**Claude** 200K tokens，**GPT-4** 128K tokens）。工作记忆必须在有限窗口内最大化信息密度。主流策略包括：

| 策略 | 原理 | 优缺点 |
|------|------|--------|
| 滑动窗口 | 保留最近 N 条消息 | 简单，但丢失早期重要信息 |
| 摘要压缩 | 将历史对话压缩为摘要 | 节省空间，但损失细节 |
| 重要性加权 | 按信息重要性排序保留 | 保留关键信息，但计算开销大 |
| 混合策略 | 摘要 + 关键原文 + 滑动窗口 | 效果最好，实现最复杂 |

### 2.2 情景记忆（Episodic Memory）—— Agent 的「经历日记」

情景记忆存储 Agent 的具体经历和事件。它回答的问题是：「这个 Agent 之前做过什么？」

典型的情景记忆内容：
- 用户的历史请求和 Agent 的回应
- 任务执行的成功/失败记录
- 环境交互的历史（调用了哪些 API、读写了哪些文件）
- 关键决策点和决策理由

**技术实现**：情景记忆通常使用向量数据库存储。每条经历被编码为向量嵌入（embedding），通过语义相似度检索相关历史。

### 2.3 语义记忆（Semantic Memory）—— Agent 的「知识库」

语义记忆存储抽象的、去情境化的知识。它回答的问题是：「这个 Agent 知道什么？」

与情景记忆的区别：
**- 情景记忆**：「2026-04-20，用户让我分析股票 AAPL，我发现市盈率偏高」
**- 语义记忆**：「AAPL 的市盈率通常在 25-35 之间，高于此值可能高估」

语义记忆的典型存储方式：
**- 知识图谱**：实体-关系-属性的结构化表示
**- 向量索引**：概念和事实的语义嵌入
**- 规则库**：从经验中提取的通用规则

### 2.4 程序记忆（Procedural Memory）—— Agent 的「肌肉记忆」

程序记忆存储如何做事情的技能和方法。它回答的问题是：「这个 Agent 擅长做什么？」

在 AI Agent 中，程序记忆表现为：
**- 技能树**：Agent 已掌握的工具调用序列
**- 模式库**：常见问题的解决模板
- 启发式规则：「遇到 X 情况时，优先尝试 Y 方法」

**Claude**-Mem 和 GenericAgent 的核心创新之一就是程序记忆的自动化构建——Agent 在执行任务过程中自动发现并固化新的技能。`,
      mermaid: `graph LR
    subgraph "记忆四层架构"
        A["工作记忆
• 当前会话上下文
• 滑动窗口管理
• 毫秒级访问"] 
        B["情景记忆
• 历史事件记录
• 向量数据库存储
• 语义相似度检索"]
        C["语义记忆
• 抽象知识库
• 知识图谱 + 向量索引
• 概念网络"]
        D["程序记忆
• 技能树
• 解决模式库
• 启发式规则"]
    end
    
    A -->|"压缩固化"| B
    B -->|"抽象提取"| C
    C -->|"模式归纳"| D
    D -.->|"指导决策"| A
    class D s3
    class C s2
    class B s1
    class A s0
    classDef s0 fill:#7f1d1d,color:#f1f5f9
    classDef s1 fill:#78350f,color:#f1f5f9,color:#1e293b
    classDef s2 fill:#064e3b,color:#f1f5f9
    classDef s3 fill:#7c3aed,color:#f1f5f9`,
    },
    {
      title: "3. 记忆系统的核心组件与技术选型",
      body: `一个生产级的 Agent 记忆系统需要多个组件协同工作。以下是 2026 年主流的技术选型方案。

### 3.1 向量数据库——记忆系统的「存储引擎」

向量数据库是 Agent 记忆系统的核心基础设施，负责存储和检索记忆的向量嵌入。

2026 年主流向量数据库对比：

| 方案 | 类型 | 优势 | 适用场景 | 集成难度 |
|------|------|------|---------|---------|
| ChromaDB | 嵌入式 | 零配置、轻量、Python 原生 | 本地开发、小型项目 | ⭐ |
| Qdrant | 独立服务 | 高性能、支持过滤、Rust 实现 | 生产环境、大规模数据 | ⭐⭐ |
| Weaviate | 独立服务 | 内置多模型、GraphQL 查询 | 需要复杂查询的场景 | ⭐⭐⭐ |
| Milvus | 独立服务 | 分布式、十亿级向量 | 企业级大规模部署 | ⭐⭐⭐⭐ |
| FAISS | 内存库 | Meta 出品、极致性能 | 纯内存检索、离线场景 | ⭐⭐ |

对于大多数 Agent 项目，ChromaDB 是最推荐的起点——零配置、轻量级，适合快速原型验证。当项目扩展到生产环境后，再迁移到 Qdrant 或 Milvus。

### 3.2 嵌入模型——记忆的「编码大脑」

嵌入模型将文本、代码、图像等转换为向量表示。选择合适的嵌入模型直接影响记忆检索的质量。

2026 年推荐的嵌入模型：

| 模型 | 维度 | 优势 | 适用语言 |
|------|------|------|---------|
| text-embedding-3-large | 3072 | **OpenAI** 出品、质量最高 | 英文为主 |
| nomic-embed-text | 768 | 开源、8192 token 上下文 | 多语言 |
| bge-m3 | 1024 | 智源出品、中文优化 | 中英文 |
| jina-embeddings-v3 | 1024 | 多语言、任务可调 | 50+ 语言 |

对于中文 Agent 项目，bge-m3 是首选——专为中文优化，支持多任务嵌入，且完全开源免费。

### 3.3 记忆压缩——从「记录一切」到「精炼知识」

记忆压缩是 Agent 记忆系统中最具挑战性的环节。如果 Agent 记录一切，记忆库会迅速膨胀，检索效率急剧下降。如果压缩过度，又会丢失关键细节。

三种主流压缩策略：

**策略一**：LLM 摘要压缩
使用 LLM 将长文本压缩为摘要。**Claude**-Mem 的核心机制就是用 **Claude** 自动压缩编码会话中的所有操作。

**策略二**：层次聚类压缩
将相似记忆聚类，每个簇生成一个「原型记忆」，保留簇内差异作为补充信息。

**策略三**：重要性衰减压缩
每条记忆附带一个重要性分数，定期清理低分记忆，高分记忆保留原文，中等分数记忆保留摘要。

记忆压缩的本质是信息论中的率失真问题——在给定存储预算下，最大化保留信息的效用。`,
    },
    {
      title: "4. 实战：用 Python 构建混合型 Agent 记忆系统",
      body: `下面我们用 Python 从零构建一个混合型 Agent 记忆系统，包含工作记忆、情景记忆和语义记忆三层。

### 4.1 完整实现代码

这个实现使用 ChromaDB 作为向量存储，sentence-transformers 作为嵌入模型，实现一个具备持久记忆能力的 Agent 系统：`,
      code: [{
        lang: "python",
        code: `#!/usr/bin/env python3
"""
混合型 AI Agent 记忆系统
实现工作记忆 + 情景记忆 + 语义记忆三层架构
支持记忆压缩、遗忘机制和语义检索

依赖: pip install chromadb sentence-transformers numpy
"""

import chromadb
import numpy as np
from datetime import datetime, timedelta
from typing import Optional
from sentence_transformers import SentenceTransformer
import json
import hashlib


class WorkingMemory:
    """工作记忆：当前会话的高速缓存
    
    使用滑动窗口 + 重要性加权策略管理上下文。
    当超出容量时，自动将低重要性条目迁移到情景记忆。
    """
    
    def __init__(self, max_items: int = 20, compression_threshold: int = 15):
        self.max_items = max_items
        self.compression_threshold = compression_threshold
        self.buffer: list[dict] = []
    
    def add(self, content: str, importance: float = 1.0, 
            metadata: Optional[dict] = None) -> Optional[dict]:
        """添加条目到工作记忆，返回可能被压缩迁移的条目"""
        entry = {
            "content": content,
            "importance": importance,
            "metadata": metadata or {},
            "timestamp": datetime.now().isoformat(),
            "access_count": 0,
        }
        self.buffer.append(entry)
        
        # 超过压缩阈值时，触发压缩迁移
        if len(self.buffer) > self.compression_threshold:
            return self._compress_and_migrate()
        
        return None
    
    def _compress_and_migrate(self) -> Optional[dict]:
        """压缩低重要性条目并迁移到情景记忆"""
        # 按重要性排序，找出最不重要的条目
        self.buffer.sort(key=lambda x: (x["importance"], x["access_count"]))
        
        # 将最不重要的条目压缩后迁移
        overflow = len(self.buffer) - self.max_items
        if overflow > 0:
            to_migrate = self.buffer[:overflow]
            self.buffer = self.buffer[overflow:]
            
            # 压缩为摘要
            compressed = {
                "type": "compressed_working",
                "content": f"[{len(to_migrate)} items compressed] " + 
                          " | ".join([e["content"][:50] for e in to_migrate]),
                "original_count": len(to_migrate),
                "timestamp": datetime.now().isoformat(),
                "importance": sum(e["importance"] for e in to_migrate) / len(to_migrate),
            }
            return compressed
        return None
    
    def get_context(self) -> str:
        """获取当前工作记忆上下文"""
        # 按访问次数和重要性排序
        sorted_items = sorted(
            self.buffer,
            key=lambda x: (x["importance"] * (1 + x["access_count"])),
            reverse=True
        )
        return "\\n".join([f"- [{e['importance']:.1f}] {e['content']}" 
                         for e in sorted_items[:self.max_items]])
    
    def bump_importance(self, index: int, delta: float = 0.5):
        """提升某个条目的重要性（被访问时）"""
        if 0 <= index < len(self.buffer):
            self.buffer[index]["importance"] += delta
            self.buffer[index]["access_count"] += 1


class EpisodicMemory:
    """情景记忆：基于向量数据库的持久事件存储
    
    使用 ChromaDB 存储和检索 Agent 的历史经历，
    支持语义相似度检索和时间范围过滤。
    """
    
    def __init__(self, collection_name: str = "episodic", 
                 persist_dir: str = "./memory_store"):
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )
        self.embedding_model = SentenceTransformer(
            "shibing624/text2vec-base-chinese"
        )
        self.counter = 0
    
    def store(self, content: str, importance: float = 1.0,
              tags: Optional[list[str]] = None):
        """存储一条情景记忆"""
        self.counter += 1
        doc_id = f"ep_{self.counter:06d}"
        
        embedding = self.embedding_model.encode(content).tolist()
        
        metadata = {
            "importance": importance,
            "timestamp": datetime.now().isoformat(),
            "tags": json.dumps(tags or []),
            "content_hash": hashlib.md5(content.encode()).hexdigest()[:8],
        }
        
        self.collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            metadatas=[metadata],
            documents=[content],
        )
        return doc_id
    
    def retrieve(self, query: str, n_results: int = 5,
                 min_importance: float = 0.0) -> list[dict]:
        """语义检索相关情景记忆"""
        query_embedding = self.embedding_model.encode(query).tolist()
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results * 2,  # 多取一些用于过滤
            include=["metadatas", "documents", "distances"],
        )
        
        # 按重要性过滤和排序
        memories = []
        for i in range(len(results["documents"][0])):
            meta = results["metadatas"][0][i]
            if meta["importance"] >= min_importance:
                memories.append({
                    "content": results["documents"][0][i],
                    "importance": meta["importance"],
                    "timestamp": meta["timestamp"],
                    "tags": json.loads(meta["tags"]),
                    "similarity": 1 - results["distances"][0][i],
                })
        
        # 按综合分数排序（相似度 + 重要性）
        memories.sort(
            key=lambda x: x["similarity"] * 0.6 + x["importance"] * 0.4,
            reverse=True
        )
        
        return memories[:n_results]
    
    def get_recent(self, hours: int = 24) -> list[dict]:
        """获取最近 N 小时内的记忆"""
        cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
        
        all_items = self.collection.get(include=["metadatas", "documents"])
        
        recent = []
        for i, meta in enumerate(all_items["metadatas"]):
            if meta["timestamp"] >= cutoff:
                recent.append({
                    "content": all_items["documents"][i],
                    "importance": meta["importance"],
                    "timestamp": meta["timestamp"],
                })
        
        recent.sort(key=lambda x: x["timestamp"], reverse=True)
        return recent


class SemanticMemory:
    """语义记忆：抽象知识的结构化存储
    
    将经验提炼为通用知识和规则，
    支持概念关联和知识图谱式查询。
    """
    
    def __init__(self, persist_dir: str = "./memory_store"):
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection(
            name="semantic",
            metadata={"hnsw:space": "cosine"}
        )
        self.embedding_model = SentenceTransformer(
            "shibing624/text2vec-base-chinese"
        )
        # 概念关联图
        self.concept_graph: dict[str, set[str]] = {}
        self.counter = 0
    
    def add_concept(self, concept: str, definition: str,
                    related_concepts: Optional[list[str]] = None):
        """添加一个语义概念"""
        self.counter += 1
        doc_id = f"sem_{self.counter:06d}"
        
        embedding = self.embedding_model.encode(
            f"{concept}: {definition}"
        ).tolist()
        
        metadata = {
            "concept": concept,
            "timestamp": datetime.now().isoformat(),
            "related": json.dumps(related_concepts or []),
        }
        
        self.collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            metadatas=[metadata],
            documents=[f"{concept}: {definition}"],
        )
        
        # 更新概念关联图
        self.concept_graph[concept] = set(related_concepts or [])
        for rc in (related_concepts or []):
            if rc not in self.concept_graph:
                self.concept_graph[rc] = set()
            self.concept_graph[rc].add(concept)
    
    def query(self, query: str, n_results: int = 5) -> list[dict]:
        """查询相关概念"""
        query_embedding = self.embedding_model.encode(query).tolist()
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=["metadatas", "documents", "distances"],
        )
        
        concepts = []
        for i in range(len(results["documents"][0])):
            meta = results["metadatas"][0][i]
            concepts.append({
                "concept": meta["concept"],
                "definition": results["documents"][0][i],
                "related": json.loads(meta["related"]),
                "similarity": 1 - results["distances"][0][i],
            })
        
        return concepts
    
    def get_related(self, concept: str, depth: int = 2) -> set[str]:
        """获取概念的相关概念（图谱遍历）"""
        if concept not in self.concept_graph:
            return set()
        
        visited = set()
        current = {concept}
        
        for _ in range(depth):
            next_level = set()
            for c in current:
                if c in self.concept_graph:
                    next_level.update(self.concept_graph[c])
            visited.update(next_level)
            current = next_level
        
        visited.discard(concept)
        return visited


class AgentMemorySystem:
    """统一 Agent 记忆系统
    
    整合工作记忆、情景记忆和语义记忆，
    提供统一的存储、检索和管理接口。
    """
    
    def __init__(self, name: str = "agent"):
        self.name = name
        self.working = WorkingMemory(max_items=20, compression_threshold=15)
        self.episodic = EpisodicMemory(collection_name=f"{name}_episodic")
        self.semantic = SemanticMemory()
    
    def process_input(self, content: str, importance: float = 1.0) -> str:
        """处理用户输入，返回带记忆增强的上下文"""
        # 1. 添加到工作记忆
        compressed = self.working.add(content, importance=importance)
        
        # 2. 如果有压缩迁移，存入情景记忆
        if compressed:
            self.episodic.store(
                content=compressed["content"],
                importance=compressed["importance"],
            )
        
        # 3. 检索相关情景记忆
        relevant_episodes = self.episodic.retrieve(content, n_results=3)
        
        # 4. 检索相关语义概念
        relevant_concepts = self.semantic.query(content, n_results=3)
        
        # 5. 构建增强上下文
        context_parts = [f"## 当前工作记忆\\n{self.working.get_context()}"]
        
        if relevant_episodes:
            context_parts.append("## 相关历史经历")
            for ep in relevant_episodes:
                context_parts.append(
                    f"- [{ep['similarity']:.2f}] {ep['content']}"
                )
        
        if relevant_concepts:
            context_parts.append("## 相关知识概念")
            for c in relevant_concepts:
                context_parts.append(
                    f"- {c['concept']}: {c['definition']}"
                )
        
        return "\\n".join(context_parts)
    
    def consolidate(self):
        """记忆巩固：将工作记忆迁移到情景记忆"""
        for entry in self.working.buffer[:]:
            self.episodic.store(
                content=entry["content"],
                importance=entry["importance"],
                tags=entry["metadata"].get("tags", []),
            )
        self.working.buffer.clear()
    
    def forget(self, days: int = 30):
        """遗忘机制：清理过时记忆"""
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        # 实际实现中需要删除 ChromaDB 中的过期条目
        print(f"清理 {days} 天之前的低重要性记忆...")


# === 使用示例 ===
if __name__ == "__main__":
    # 创建记忆系统
    agent_memory = AgentMemorySystem(name="my_agent")
    
    # 添加一些语义概念
    agent_memory.semantic.add_concept(
        "RAG", "检索增强生成，结合外部知识库的 LLM 推理模式",
        ["向量检索", "LLM", "知识增强"]
    )
    agent_memory.semantic.add_concept(
        "向量检索", "将文本编码为向量后通过相似度搜索的技术",
        ["embedding", "ANN", "ChromaDB"]
    )
    
    # 模拟交互
    interactions = [
        ("如何用 Python 实现 RAG 系统？", 1.0),
        ("推荐一个好的中文 embedding 模型", 0.8),
        ("ChromaDB 和 Qdrant 有什么区别？", 0.9),
        ("帮我分析这个项目的代码结构", 1.0),
        ("上次讨论的方案需要调整", 0.7),
    ]
    
    for content, importance in interactions:
        print(f"\\n{'='*60}")
        print(f"输入: {content}")
        context = agent_memory.process_input(content, importance)
        print(f"记忆上下文:\\n{context[:300]}...")
    
    # 记忆巩固
    print("\\n\\n=== 记忆巩固 ===")
    agent_memory.consolidate()
    print("工作记忆已迁移到情景记忆")
    
    # 检索相关记忆
    print("\\n=== 检索'RAG'相关记忆 ===")
    results = agent_memory.episodic.retrieve("RAG 实现方案", n_results=3)
    for r in results:
        print(f"  [{r['similarity']:.2f}] {r['content']}")`,
        filename: "agent_memory_system.py"
      }],
    },
    {
      title: "5. 记忆压缩的深度学习方案：从 LLM 摘要到自动编码",
      body: `前面的实现中，工作记忆的压缩只是简单的字符串截断。在生产环境中，我们需要更智能的压缩方案。

### 5.1 三种压缩方案对比

| 方案 | 压缩率 | 信息保留 | 计算开销 | 适用场景 |
|------|--------|---------|---------|---------|
| LLM 摘要 | 10:1 ~ 50:1 | 高 | 高（需调用 LLM API） | 关键对话压缩 |
| 自动编码器 | 20:1 ~ 100:1 | 中 | 中（需训练模型） | 大规模日志压缩 |
| 层次聚类 | 5:1 ~ 20:1 | 中高 | 低（纯计算） | 实时在线压缩 |

### 5.2 **Claude**-Mem 的压缩机制解析

**Claude**-Mem 的核心创新是自动捕获 + AI 压缩 + 上下文注入的闭环：

1. 捕获阶段：自动记录 **Claude** Code 在编码会话中的所有操作——文件修改、终端命令、错误信息、用户反馈
2. 压缩阶段：使用 **Claude** 自身的 agent-sdk，将原始操作流压缩为结构化的记忆条目。不是简单摘要，而是提取关键决策、问题模式、解决方案模板
3. 注入阶段：在新会话开始时，根据当前任务语义相似度，从记忆库中检索最相关的条目注入到系统提示中

这种机制的关键在于压缩不是有损的——它保留了决策的上下文和推理过程，而不仅仅是结果。

### 5.3 Python 实现智能记忆压缩`,
      code: [{
        lang: "python",
        code: `#!/usr/bin/env python3
"""
智能记忆压缩模块
实现 LLM 摘要压缩 + 层次聚类压缩 + 重要性衰减

依赖: pip install scikit-learn numpy
"""

import numpy as np
from sklearn.cluster import AgglomerativeClustering
from datetime import datetime, timedelta
from typing import Optional


class MemoryCompressor:
    """记忆压缩器：三种压缩策略的统一接口"""
    
    def __init__(self):
        self.compression_stats = {
            "total_compressed": 0,
            "total_original_tokens": 0,
            "total_compressed_tokens": 0,
        }
    
    def llm_summarize(self, texts: list[str], 
                      max_summary_length: int = 200) -> str:
        """LLM 摘要压缩
        
        模拟 LLM 摘要压缩行为。
        在实际系统中，这里会调用 LLM API。
        
        策略：提取关键句 + 主题词
        """
        if not texts:
            return ""
        
        # 简单实现：取每条文本的前 max_summary_length/len(texts) 个字符
        # 实际应用中应调用 LLM API 生成摘要
        per_text_budget = max(20, max_summary_length // len(texts))
        summaries = []
        
        for text in texts:
            # 提取关键信息：前 N 个字符
            key_info = text[:per_text_budget]
            if len(text) > per_text_budget:
                key_info += "..."
            summaries.append(key_info)
        
        combined = " | ".join(summaries)
        self.compression_stats["total_compressed"] += len(texts)
        self.compression_stats["total_original_tokens"] += sum(len(t) for t in texts)
        self.compression_stats["total_compressed_tokens"] += len(combined)
        
        return f"[{len(texts)} items] {combined}"
    
    def cluster_compress(self, texts: list[str], 
                        embeddings: list[list[float]],
                        similarity_threshold: float = 0.7) -> list[dict]:
        """层次聚类压缩
        
        将语义相似的文本聚类，每个簇生成一条压缩记忆。
        
        参数:
            texts: 原始文本列表
            embeddings: 对应的向量嵌入
            similarity_threshold: 聚类距离阈值
        """
        if len(texts) < 2:
            return [{"content": t, "source_count": 1} 
                    for t in texts]
        
        # 层次聚类
        embeddings_array = np.array(embeddings)
        clustering = AgglomerativeClustering(
            n_clusters=None,
            distance_threshold=1 - similarity_threshold,
            metric="cosine",
            linkage="average",
        )
        labels = clustering.fit_predict(embeddings_array)
        
        # 按簇压缩
        compressed = []
        unique_labels = set(labels)
        
        for label in unique_labels:
            cluster_texts = [texts[i] for i in range(len(texts)) 
                           if labels[i] == label]
            
            if len(cluster_texts) == 1:
                compressed.append({
                    "content": cluster_texts[0],
                    "source_count": 1,
                    "cluster_size": 1,
                })
            else:
                # 簇内压缩：取代表性文本 + 变体数量
                representative = cluster_texts[0]  # 实际应选中心样本
                compressed.append({
                    "content": f"[{len(cluster_texts)} similar] {representative[:100]}",
                    "source_count": len(cluster_texts),
                    "cluster_size": len(cluster_texts),
                    "variants": [t[:30] for t in cluster_texts[1:3]],
                })
        
        return compressed
    
    def importance_decay(self, memories: list[dict],
                        current_time: Optional[datetime] = None,
                        half_life_days: float = 7.0) -> list[dict]:
        """重要性衰减：记忆随时间自动衰减
        
        使用指数衰减模型：importance(t) = importance(0) * 0.5^(t/half_life)
        
        这模拟了人类记忆的遗忘曲线——新记忆遗忘快，老记忆遗忘慢。
        """
        current = current_time or datetime.now()
        
        decayed = []
        for mem in memories:
            mem_time = datetime.fromisoformat(mem["timestamp"])
            age_days = (current - mem_time).total_seconds() / 86400
            
            # 指数衰减
            decay_factor = 0.5 ** (age_days / half_life_days)
            new_importance = mem["importance"] * decay_factor
            
            mem["importance"] = new_importance
            mem["age_days"] = round(age_days, 1)
            mem["decay_factor"] = round(decay_factor, 3)
            
            decayed.append(mem)
        
        return decayed
    
    def get_compression_ratio(self) -> float:
        """获取当前压缩率"""
        if self.compression_stats["total_original_tokens"] == 0:
            return 1.0
        return (self.compression_stats["total_original_tokens"] / 
                max(1, self.compression_stats["total_compressed_tokens"]))


# === 使用示例 ===
if __name__ == "__main__":
    compressor = MemoryCompressor()
    
    # 测试聚类压缩
    texts = [
        "用户要求修复数据库连接超时问题，通过增加连接池大小解决",
        "数据库连接超时，建议增大连接池配置",
        "Connection timeout to database, fixed by increasing pool size",
        "用户询问如何优化 Python 函数性能，建议使用缓存装饰器",
        "Python 性能优化：使用 @lru_cache 装饰器",
        "API 响应慢的问题，通过添加 Redis 缓存层解决",
    ]
    
    # 模拟嵌入（实际应使用 embedding 模型）
    embeddings = [
        [0.8, 0.1, 0.05, 0.2],  # 数据库相关
        [0.82, 0.08, 0.06, 0.22],
        [0.78, 0.12, 0.04, 0.18],
        [0.1, 0.8, 0.3, 0.05],   # Python 相关
        [0.12, 0.78, 0.28, 0.07],
        [0.75, 0.15, 0.05, 0.8],  # 缓存相关
    ]
    
    result = compressor.cluster_compress(texts, embeddings, similarity_threshold=0.3)
    
    print("=== 聚类压缩结果 ===")
    for item in result:
        print(f"  [{item['source_count']} items] {item['content']}")
        if "variants" in item:
            for v in item["variants"]:
                print(f"    variant: {v}")
    
    # 测试重要性衰减
    memories = [
        {"content": "昨天的对话", "importance": 1.0, 
         "timestamp": (datetime.now() - timedelta(days=1)).isoformat()},
        {"content": "一周前的讨论", "importance": 1.0,
         "timestamp": (datetime.now() - timedelta(days=7)).isoformat()},
        {"content": "一个月前的决策", "importance": 1.0,
         "timestamp": (datetime.now() - timedelta(days=30)).isoformat()},
    ]
    
    print("\\n=== 重要性衰减 ===")
    decayed = compressor.importance_decay(memories)
    for mem in decayed:
        print(f"  [{mem['age_days']}d] importance: {mem['importance']:.3f} "
              f"(decay: {mem['decay_factor']})")
    
    print(f"\\n压缩率: {compressor.get_compression_ratio():.1f}x")`,
        filename: "memory_compressor.py"
      }],
    },
    {
      title: "6. 2026 年 Agent 记忆系统技术对比全景",
      body: `综合当前主流 Agent 记忆方案，我们从多个维度进行全面对比。

### 6.1 五大记忆方案对比

| 方案 | 核心机制 | 记忆类型 | 压缩策略 | Stars | 适合场景 |
|------|---------|---------|---------|-------|---------|
| **Claude**-Mem | 自动捕获 + AI 压缩 | 程序记忆为主 | LLM 摘要 | 64K+ | **Claude** Code 用户 |
| MemPalace | 记忆宫殿 + 关联检索 | 情景 + 语义 | 层次聚类 | 22K+ | 复杂项目管理 |
| **LangChain** Memory | 对话历史 + 向量存储 | 工作 + 情景 | 滑动窗口 | 内置 | LLM 应用开发 |
| Zep | 专用记忆服务 | 三层完整 | 混合策略 | 独立服务 | 生产级 Agent |
| **LlamaIndex** | 文档索引 + **RAG** | 语义为主 | 文档分块 | 框架集成 | 知识密集型 Agent |

### 6.2 记忆系统成熟度评估

| 维度 | 初级 | 中级 | 高级 |
|------|------|------|------|
| 存储 | 文本文件 | SQLite/ChromaDB | 分布式向量数据库 |
| 检索 | 关键词匹配 | 向量相似度 | 混合检索（向量+图谱+全文） |
| 压缩 | 滑动窗口 | LLM 摘要 | 多策略自适应压缩 |
| 遗忘 | 手动清理 | 时间衰减 | 重要性驱动的主动遗忘 |
| 一致性 | 无 | 去重 | 冲突检测与解决 |

### 6.3 未来趋势：2026 年下半年值得关注

1. 跨 Agent 记忆共享：多个 Agent 共享记忆库，形成「集体记忆」
2. 记忆可编辑性：用户可以主动修正 Agent 的记忆（类似编辑数据库）
3. 记忆推理：Agent 基于记忆进行类比推理——「这个问题和之前的某个问题类似，那次我是这样解决的...」
4. 记忆安全与隐私：敏感信息的自动脱敏、记忆加密、遗忘权（Right to be Forgotten）

记忆系统正在从「技术基础设施」升级为「Agent 的核心竞争力」。2026 年，没有记忆系统的 Agent 将像没有数据库的 Web 应用一样——能跑，但毫无实用性。`,
      table: {
        headers: ["记忆层", "存储介质", "容量", "生命周期", "检索方式", "关键技术"],
        rows: [
          ["工作记忆", "内存缓冲区", "20-50 条", "当前会话", "顺序/加权访问", "滑动窗口+重要性"],
          ["情景记忆", "向量数据库", "无上限", "数周至数月", "语义相似度", "embedding+ANN"],
          ["语义记忆", "知识图谱+向量索引", "无上限", "长期持久", "概念关联查询", "图谱遍历+语义检索"],
          ["程序记忆", "技能树文件", "数百技能", "永久积累", "模式匹配", "技能发现+固化"],
        ],
      },
    },
    {
      title: "7. 总结与实战建议",
      body: `AI Agent 记忆系统在 2026 年已经成为区分「玩具 Agent」和「生产级 Agent」的关键技术。

**核心要点回顾**：

1. 四层架构是共识：工作记忆、情景记忆、语义记忆、程序记忆缺一不可
2. 向量数据库是基础设施：ChromaDB 起步、Qdrant 生产，这是 2026 年的最佳实践
3. 记忆压缩不是可选的：没有压缩的记忆系统会在几周内变得无法使用
4. 遗忘和记忆同样重要：好的记忆系统知道该忘记什么
5. **Claude**-Mem 证明了市场需求：两周 64K 星，开发者愿意为「有记忆的 Agent」付费

给你的实战建议：

- 如果你的 Agent 需要记住用户偏好和历史对话 → 至少实现工作记忆 + 情景记忆
- 如果你的 Agent 需要积累领域知识 → 加入语义记忆层，使用知识图谱
- 如果你的 Agent 需要自主学习和成长 → 实现程序记忆，让 Agent 自动发现和固化技能
- 如果你在做生产级应用 → 考虑 Zep 等专用记忆服务，或者自建完整的四层架构

记忆不是 Agent 的「附加功能」，而是 Agent 的「灵魂」。一个有记忆的 Agent，每次交互都在成长；一个没有记忆的 Agent，永远在原地踏步。`,
      mermaid: `graph TD
    A["选择记忆方案"] --> B{"使用场景？"}
    
    B -->|"个人助手 / 编码辅助"| C["Claude-Mem 风格
自动捕获 + AI 压缩"]
    B -->|"复杂项目管理"| D["MemPalace 风格
记忆宫殿 + 关联检索"]
    B -->|"LLM 应用开发"| E["LangChain Memory
对话历史 + 向量存储"]
    B -->|"企业级生产"| F["Zep 服务
完整三层 + 多用户"]
    
    C --> G["核心：工作记忆 + 情景记忆"]
    D --> H["核心：三层完整 + 概念关联"]
    E --> I["核心：对话历史 + RAG"]
    F --> J["核心：四层架构 + 安全隔离"]
    class F s5
    class E s4
    class D s3
    class C s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f,color:#f1f5f9
    classDef s1 fill:#78350f,color:#f1f5f9,color:#1e293b
    classDef s2 fill:#7f1d1d,color:#f1f5f9
    classDef s3 fill:#78350f,color:#f1f5f9,color:#1e293b
    classDef s4 fill:#064e3b,color:#f1f5f9
    classDef s5 fill:#7c3aed,color:#f1f5f9`,
    },
  ],
};
