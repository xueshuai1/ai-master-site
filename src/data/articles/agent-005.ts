import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-005",
    title: "Agent 记忆系统（一）：向量数据库与知识图谱",
    category: "agent",
    tags: ["记忆", "向量数据库", "知识图谱"],
    summary: "构建 Agent 的长期记忆，理解检索增强与知识管理",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
  learningPath: {
    routeId: "agent-memory",
    phase: 1,
    order: 1,
    nextStep: "agent-025",
    prevStep: "agent-002",
  },
    content: [
        {
            title: "1. Agent 记忆的类型：短期、长期与工作记忆",
            body: `人类的记忆分为感觉记忆、短期记忆、长期记忆和工作记忆——Agent 的记忆架构借鉴了这一认知科学模型。短期记忆（Short-term Memory）对应 LLM 的上下文窗口，保存当前对话轮次和正在处理的任务状态。它的优势是即时可用、无需额外检索，但受限于上下文长度（通常 128K-200K tokens），超过窗口就会遗忘。

长期记忆（Long-term Memory）通过外部存储（向量数据库、文件系统、数据库）实现，可以跨会话持久化。Agent 在需要时主动检索，类似于人类"回想"的过程。长期记忆的关键挑战是：如何从海量存储中精确找到当前任务相关的信息。

工作记忆（Working Memory）是 Agent 在执行复杂任务时维护的"中间状态"——当前正在处理的子任务、已获得的中间结果、待验证的假设。它不同于短期记忆的线性对话上下文，工作记忆更像是一个结构化的暂存区，支持动态增删改。理解这三种记忆的分工与协作，是设计高效 Agent 记忆系统的起点。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass, field
from typing import List, Dict, Any

@dataclass
class AgentMemory:
    """Agent 三层记忆架构"""
    # 短期记忆：当前对话上下文（受限于上下文窗口）
    short_term: List[Dict[str, str]] = field(default_factory=list)
    # 工作记忆：结构化任务状态
    working: Dict[str, Any] = field(default_factory=dict)
    # 长期记忆：外部存储引用（向量数据库 ID）
    long_term_refs: List[str] = field(default_factory=list)

    def add_to_working(self, key: str, value: Any) -> None:
        """更新工作记忆"""
        self.working[key] = value

    def consolidate(self) -> None:
        """记忆整合：将工作记忆中的重要信息转入长期记忆"""
        for key, value in self.working.items():
            if self._is_important(key, value):
                self._store_long_term(key, value)

    def _is_important(self, key: str, value: Any) -> bool:
        return key.startswith("fact_") or key.startswith("preference_")

    def _store_long_term(self, key: str, value: Any) -> None:
        # 实际实现中会写入向量数据库
        ref_id = f"mem_{hash(key)}"
        self.long_term_refs.append(ref_id)`,
                },
                {
                    lang: "python",
                    code: `# 记忆生命周期管理示例
class MemoryManager:
    """管理记忆的创建、检索、遗忘和整合"""

    def __init__(self, max_short_term: int = 20):
        self.max_short = max_short_term
        self.short_buffer: List[str] = []
        self.decay_rate = 0.95  # 记忆衰减率

    def store(self, info: str) -> None:
        """存入短期记忆，超限时触发遗忘"""
        self.short_buffer.append(info)
        if len(self.short_buffer) > self.max_short:
            self._forget_oldest()

    def retrieve(self, query: str, top_k: int = 3) -> List[str]:
        """从短期记忆中检索（简单关键词匹配）"""
        query_words = set(query.lower().split())
        scored = []
        for item in self.short_buffer:
            overlap = len(query_words & set(item.lower().split()))
            scored.append((overlap, item))
        scored.sort(reverse=True)
        return [item for _, item in scored[:top_k]]

    def _forget_oldest(self) -> str:
        """遗忘最早的条目（先进先出策略）"""
        return self.short_buffer.pop(0)`,
                },
            ],
            table: {
                headers: ["记忆类型", "存储位置", "容量限制", "检索速度", "持久化"],
                rows: [
                    ["短期记忆", "LLM 上下文窗口", "128K-200K tokens", "即时", "会话结束即消失"],
                    ["长期记忆", "向量数据库/文件系统", "理论上无限", "需检索（毫秒级）", "跨会话持久"],
                    ["工作记忆", "内存中的结构化对象", "取决于任务复杂度", "即时（O(1) 查找）", "任务结束可清理"],
                ],
            },
            mermaid: `graph TD
    A["用户输入"] --> B["短期记忆\
对话上下文"]
    B --> C{"需要外部知识？"}
    C -->|是| D["长期记忆\
向量检索"]
    C -->|否| E["工作记忆\
当前状态"]
    D --> E
    E --> F["生成回复"]
    F --> G{"信息重要？"}
    G -->|是| H["巩固→长期记忆"]
    G -->|否| I["自然遗忘"]`,
            tip: "设计记忆系统时，先明确每种记忆的职责边界——不要让短期记忆承担长期存储的责任，也不要让长期记忆频繁读写影响性能。",
            warning: "上下文窗口不是越大越好。即使有 200K tokens，过长的上下文也会导致注意力分散（Lost in the Middle 现象），关键信息可能被忽略。",
        },
        {
            title: "2. 向量数据库基础：Chroma、Pinecone 与 FAISS",
            body: `向量数据库是 Agent 长期记忆的核心基础设施。它的核心思想是将文本、图像等非结构化数据通过嵌入模型（Embedding Model）转换为高维向量（通常 384-1536 维），然后存储这些向量并支持高效的相似度检索。当你向 Agent 提问时，系统先将问题转换为向量，然后在向量数据库中搜索最相似的已存储向量，返回对应的原始文本。

目前主流的向量数据库各有特点：FAISS 是 Meta 开源的向量相似性搜索库，性能极高但不支持持久化存储和 CRUD 操作，适合作为底层引擎；Chroma 是专为 AI 应用设计的嵌入式向量数据库，开箱即用，支持持久化和元数据过滤，适合本地开发和中小规模应用；Pinecone 是全托管的云服务，支持十亿级向量、自动扩缩和细粒度权限控制，适合生产环境。

选择向量数据库时需要考虑：数据规模（千级、百万级还是十亿级）、是否需要持久化、是否支持元数据过滤、部署方式（本地还是云端）、以及社区生态。对于大多数 Agent 原型开发，Chroma 是最佳起点。`,
            code: [
                {
                    lang: "python",
                    code: `import chromadb
from chromadb.utils import embedding_functions

# 初始化 Chroma 客户端（持久化到磁盘）
client = chromadb.PersistentClient(path="./memory_db")

# 使用 Sentence-Transformers 嵌入模型
embedder = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# 创建集合（Collection）
collection = client.create_collection(
    name="agent_memories",
    embedding_function=embedder,
    metadata={"hnsw:space": "cosine"}  # 余弦相似度
)

# 添加文档
collection.add(
    documents=[
        "用户喜欢 Python 编程",
        "项目截止日期是 2026 年 5 月",
        "部署环境是 AWS us-east-1"
    ],
    metadatas=[
        {"type": "preference", "category": "dev"},
        {"type": "fact", "category": "project"},
        {"type": "fact", "category": "infra"}
    ],
    ids=["mem_001", "mem_002", "mem_003"]
)

# 相似度检索
results = collection.query(
    query_texts=["用户的编程偏好是什么？"],
    n_results=2
)
print(results["documents"])  # 返回最匹配的文档`,
                },
                {
                    lang: "python",
                    code: `import faiss
import numpy as np

# FAISS：高性能向量索引
# 创建 768 维向量的索引（使用内积相似度）
dimension = 768
index = faiss.IndexFlatIP(dimension)  # 内积（等价于余弦，假设已归一化）

# 生成模拟数据
np.random.seed(42)
vectors = np.random.randn(1000, dimension).astype(np.float32)
# L2 归一化
faiss.normalize_L2(vectors)

# 添加向量到索引
index.add(vectors)
print(f"索引中的向量数: {index.ntotal}")

# 查询：搜索最相似的 5 个向量
query = np.random.randn(1, dimension).astype(np.float32)
faiss.normalize_L2(query)
distances, indices = index.search(query, k=5)

print(f"Top-5 相似度: {distances[0]}")
print(f"Top-5 索引号: {indices[0]}")`,
                },
            ],
            table: {
                headers: ["特性", "FAISS", "Chroma", "Pinecone"],
                rows: [
                    ["类型", "C++ 库（Python 绑定）", "嵌入式数据库", "全托管云服务"],
                    ["持久化", "需自行实现", "内置支持", "内置支持"],
                    ["数据规模", "十亿级（单机）", "百万级", "十亿级（分布式）"],
                    ["元数据过滤", "不支持", "支持", "支持"],
                    ["部署", "本地", "本地/容器", "云端"],
                    ["价格", "免费开源", "免费开源", "按量付费"],
                ],
            },
            mermaid: `graph LR
    A["原始文本"] --> B["嵌入模型"]
    B --> C["高维向量\
768 维"]
    C --> D["向量数据库\
FAISS/Chroma/Pinecone"]
    E["查询文本"] --> F["同一嵌入模型"]
    F --> G["查询向量"]
    G --> D
    D --> H["相似度排序"]
    H --> I["Top-K 结果"]`,
            tip: "本地开发用 Chroma，生产大规模用 Pinecone 或 Weaviate，追求极致性能且数据量巨大时用 FAISS 配合自建存储层。",
            warning: "FAISS 不支持元数据过滤——如果你需要根据标签、日期等条件过滤结果，必须在 FAISS 之外维护映射关系，或选择 Chroma/Pinecone。",
        },
        {
            title: "3. 嵌入模型选择：从 OpenAI 到开源方案",
            body: `嵌入模型（Embedding Model）是将文本转换为向量的关键组件，它的质量直接决定了向量检索的准确性。好的嵌入模型能够将语义相似的文本映射到向量空间中相近的位置，即使它们的字面表达完全不同。例如，"如何学习编程"和"编程入门指南"虽然用词不同，但在高质量嵌入模型的向量空间中应该非常接近。

当前嵌入模型的主要选择包括：OpenAI 的 text-embedding-3-small（1536 维）和 text-embedding-3-large（3072 维）——性能业界领先，API 调用成本低，但数据会经过 OpenAI 服务器；开源方案如 Sentence-Transformers 的 all-MiniLM-L6-v2（384 维，轻量快速）、bge-large-zh-v1.5（支持中文优化）、以及 nomic-embed-text（Apache 2.0 许可，支持长文本）。

选择嵌入模型时需要考虑的关键因素：语言支持（中文优化至关重要）、维度大小（影响存储和计算）、上下文窗口（最长支持多少 tokens）、推理速度、以及是否需要本地部署。对于中文场景，强烈建议使用专门针对中文优化的模型。`,
            code: [
                {
                    lang: "python",
                    code: `# 使用 Sentence-Transformers 评估嵌入模型
from sentence_transformers import SentenceTransformer
import numpy as np

# 加载模型（中文优化版 BGE）
model = SentenceTransformer("BAAI/bge-large-zh-v1.5")

# 测试语义相似度
sentences = [
    "如何学习 Python 编程？",
    "Python 入门教程推荐",
    "今天天气真不错",
    "Python 编程语言的学习路径"
]

# 生成嵌入向量
embeddings = model.encode(sentences, normalize_embeddings=True)

# 计算余弦相似度矩阵
similarity = embeddings @ embeddings.T

# 打印相似度矩阵
for i, s1 in enumerate(sentences):
    for j, s2 in enumerate(sentences):
        if i < j:
            print(f"{s1} ↔ {s2}: {similarity[i][j]:.4f}")

# 预期输出：句1和句4（语义最相关）相似度应最高`,
                },
                {
                    lang: "python",
                    code: `# 批量嵌入与向量化流水线
from sentence_transformers import SentenceTransformer
import json
import os

class EmbeddingPipeline:
    """批量嵌入处理流水线"""

    def __init__(self, model_name: str, batch_size: int = 64):
        self.model = SentenceTransformer(model_name)
        self.batch_size = batch_size
        self.dimension = self.model.get_sentence_embedding_dimension()

    def embed_batch(self, texts: list[str]) -> np.ndarray:
        """批量生成嵌入（自动分块）"""
        all_embeddings = []
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i + self.batch_size]
            embeddings = self.model.encode(
                batch,
                show_progress_bar=False,
                normalize_embeddings=True
            )
            all_embeddings.extend(embeddings.tolist())
        return np.array(all_embeddings, dtype=np.float32)

    def get_stats(self) -> dict:
        return {
            "model": self.model.tokenizer.name_or_path,
            "dimension": self.dimension,
            "batch_size": self.batch_size
        }

# 使用示例
pipeline = EmbeddingPipeline("BAAI/bge-large-zh-v1.5", batch_size=32)
print(pipeline.get_stats())
# {'model': 'BAAI/bge-large-zh-v1.5', 'dimension': 1024, 'batch_size': 32}`,
                },
            ],
            table: {
                headers: ["模型", "维度", "最大长度", "语言支持", "许可证"],
                rows: [
                    ["text-embedding-3-small", "1536", "8191 tokens", "多语言（英文最优）", "商业 API"],
                    ["text-embedding-3-large", "3072", "8191 tokens", "多语言（英文最优）", "商业 API"],
                    ["bge-large-zh-v1.5", "1024", "512 tokens", "中文优化", "MIT"],
                    ["all-MiniLM-L6-v2", "384", "256 tokens", "英文为主", "Apache 2.0"],
                    ["nomic-embed-text-v1.5", "768", "8192 tokens", "多语言", "Apache 2.0"],
                ],
            },
            mermaid: `graph LR
    A["文本语料"] --> B["文本清洗\
去噪/分词"]
    B --> C["嵌入模型\
BGE / OpenAI"]
    C --> D["向量空间\
1024 维"]
    D --> E["归一化处理"]
    E --> F["向量数据库"]
    G["新查询"] --> C
    C --> H["相似度计算\
余弦/内积"]`,
            tip: "中文场景首选 BGE-large-zh-v1.5 或 bge-m3（支持多语言、更长上下文）。如果预算充足且追求极致效果，OpenAI text-embedding-3-large 仍是标杆。",
            warning: "不同嵌入模型生成的向量不可混用——你必须用同一个模型生成所有向量和查询向量，否则相似度计算毫无意义。",
        },
        {
            title: "4. 检索增强生成（RAG）：让 LLM 拥有外部知识",
            body: `检索增强生成（Retrieval-Augmented Generation，RAG）是当前最实用的增强 LLM 能力的方法。核心思路很简单：当用户提出问题时，系统先从外部知识库（向量数据库）中检索相关信息，然后将检索到的信息与用户问题一起作为上下文提供给 LLM 生成回复。这样 LLM 就能"查阅资料"后作答，而不是仅依赖训练时学到的知识。

RAG 的关键优势在于：它可以为 LLM 注入最新的、私有的、特定领域的知识，而无需重新训练模型。这意味着你可以让一个通用 LLM 变成你的企业专家——只需把企业文档嵌入到向量数据库中即可。

一个完整的 RAG 流程包含以下步骤：文档切分（Chunking）——将长文档切分为适当大小的片段；向量化——将每个片段转换为向量；存储——将向量和原文存入向量数据库；检索——用户查询时检索最相关的片段；增强生成——将检索结果与用户问题组合成提示词，让 LLM 生成最终回复。`,
            code: [
                {
                    lang: "python",
                    code: `# 完整 RAG 管道实现
import chromadb
from sentence_transformers import SentenceTransformer
from openai import OpenAI

class RAGPipeline:
    """检索增强生成管道"""

    def __init__(self, db_path: str, llm_model: str = "gpt-4o"):
        self.client = chromadb.PersistentClient(path=db_path)
        self.embedder = SentenceTransformer("BAAI/bge-large-zh-v1.5")
        self.llm = OpenAI()
        self.llm_model = llm_model
        self.collection = self.client.get_or_create_collection(
            name="knowledge",
            metadata={"hnsw:space": "cosine"}
        )

    def ingest(self, documents: list[str], ids: list[str]) -> None:
        """文档入库"""
        embeddings = self.embedder.encode(
            documents, normalize_embeddings=True
        ).tolist()
        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            ids=ids
        )

    def query(self, question: str, top_k: int = 3) -> str:
        """RAG 查询"""
        # 1. 检索
        query_vec = self.embedder.encode(
            [question], normalize_embeddings=True
        ).tolist()
        results = self.collection.query(
            query_embeddings=query_vec, n_results=top_k
        )
        context = "\\n".join(results["documents"][0])

        # 2. 增强生成
        prompt = f"""请基于以下参考资料回答问题。如果资料中没有相关信息，请如实告知。

参考资料：
{context}

问题：{question}

回答："""
        response = self.llm.chat.completions.create(
            model=self.llm_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        return response.choices[0].message.content`,
                },
                {
                    lang: "python",
                    code: `# 文档切分策略对比
class DocumentChunker:
    """多种文档切分策略"""

    @staticmethod
    def fixed_size(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
        """固定大小切分（带重叠）"""
        chunks = []
        words = text.split()
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if len(chunk.split()) > 10:  # 过滤过短的块
                chunks.append(chunk)
        return chunks

    @staticmethod
    def semantic_split(text: str, model_name: str = "BAAI/bge-large-zh-v1.5") -> list[str]:
        """语义切分：按段落/句子边界，确保语义完整"""
        import re
        # 按句子边界切分
        sentences = re.split(r'[。！？；\\n]', text)
        sentences = [s.strip() for s in sentences if s.strip()]

        chunks = []
        current = ""
        model = SentenceTransformer(model_name)

        for sent in sentences:
            if len(current) + len(sent) > 500:
                chunks.append(current)
                current = sent
            else:
                current += "。" + sent if current else sent
        if current:
            chunks.append(current)
        return chunks

    @staticmethod
    def hierarchical(text: str, max_chunk: int = 2000) -> list[str]:
        """层次化切分：先按章节，再按段落"""
        sections = re.split(r'#+\\s+', text)
        chunks = []
        for section in sections:
            if len(section) <= max_chunk:
                chunks.append(section.strip())
            else:
                sub = DocumentChunker.fixed_size(section, chunk_size=500)
                chunks.extend(sub)
        return chunks`,
                },
            ],
            table: {
                headers: ["切分策略", "优点", "缺点", "适用场景"],
                rows: [
                    ["固定大小", "简单可控、实现容易", "可能切断语义单元", "均匀结构化的文档"],
                    ["语义切分", "保持语义完整性", "实现复杂、依赖 NLP 工具", "长篇文章、技术文档"],
                    ["层次化切分", "兼顾结构和粒度", "需要文档结构清晰", "书籍、手册、Wiki"],
                    ["滑动窗口", "无信息丢失", "重复计算、存储膨胀", "短文本密集场景"],
                ],
            },
            mermaid: `graph TD
    A["用户问题"] --> B["问题向量化"]
    B --> C["向量数据库检索"]
    C --> D["Top-K 相关片段"]
    D --> E["构建增强提示词"]
    E --> F["LLM 生成回复"]
    F --> G["返回答案\
+ 引用来源"]
    C -.->|元数据过滤| H["时间/类别/标签筛选"]`,
            tip: "RAG 的温度值建议设为 0.1-0.3——因为你已经提供了参考资料，不需要 LLM 太「创造性」。温度过高容易产生幻觉。",
            warning: "RAG 不是万能的。如果向量数据库中根本没有相关信息，LLM 可能仍会编造答案。务必在提示词中明确要求「如果资料中没有相关信息，请如实告知」。",
        },
        {
            title: "5. 知识图谱集成：结构化知识的威力",
            body: `向量数据库擅长基于语义相似度检索信息，但它在处理结构化关系和逻辑推理时存在天然局限。知识图谱（Knowledge Graph）通过实体（Entity）和关系（Relation）的图结构来组织知识，能够支持更复杂的查询和推理。例如，向量数据库可以找到"与 AI 相关的文档"，但知识图谱可以回答"哪些作者同时研究过深度学习和强化学习"。

将知识图谱与向量数据库结合，可以构建更强大的 Agent 记忆系统：向量数据库负责模糊语义检索（"找相关的信息"），知识图谱负责精确关系查询（"找满足特定条件的信息"）。这种混合架构被称为 GraphRAG（Graph-Augmented RAG）。

知识图谱的核心概念包括：节点（Node/Entity）——代表实体，如人、地点、概念；边（Edge/Relation）——代表实体之间的关系，如"属于"、"相关于"、"依赖于"；属性（Property）——附加在节点或边上的键值对信息。常用的知识图谱工具包括 Neo4j（图数据库）、NetworkX（Python 图分析库）、以及 LangChain 的 GraphQAChain。`,
            code: [
                {
                    lang: "python",
                    code: `# 使用 NetworkX 构建知识图谱
import networkx as nx
import json

class KnowledgeGraph:
    """Agent 知识图谱"""

    def __init__(self):
        self.graph = nx.DiGraph()

    def add_entity(self, name: str, entity_type: str, **properties) -> None:
        """添加实体节点"""
        self.graph.add_node(name, type=entity_type, **properties)

    def add_relation(self, source: str, target: str, relation: str, **properties) -> None:
        """添加关系边"""
        self.graph.add_edge(source, target, relation=relation, **properties)

    def find_related(self, entity: str, max_depth: int = 2) -> list:
        """查找相关实体（BFS 遍历）"""
        if entity not in self.graph:
            return []
        visited = set()
        results = []
        queue = [(entity, 0)]
        while queue:
            node, depth = queue.pop(0)
            if depth > max_depth or node in visited:
                continue
            visited.add(node)
            for neighbor in self.graph.neighbors(node):
                edge_data = self.graph[node][neighbor]
                results.append({
                    "source": node,
                    "relation": edge_data["relation"],
                    "target": neighbor,
                    "depth": depth + 1
                })
                queue.append((neighbor, depth + 1))
        return results

    def to_dict(self) -> dict:
        return nx.node_link_data(self.graph)`,
                },
                {
                    lang: "python",
                    code: `# GraphRAG：结合知识图谱与向量检索
class GraphRAG:
    """图增强检索生成"""

    def __init__(self, vector_db, knowledge_graph: KnowledgeGraph):
        self.vector_db = vector_db
        self.kg = knowledge_graph
        self.llm = OpenAI()

    def hybrid_query(self, question: str) -> dict:
        """混合查询：向量检索 + 图谱推理"""
        # 1. 向量检索（语义匹配）
        vec_results = self.vector_db.query(
            question, top_k=3
        )

        # 2. 图谱推理（关系查询）
        entities = self._extract_entities(question)
        graph_results = []
        for entity in entities:
            related = self.kg.find_related(entity, max_depth=2)
            graph_results.extend(related)

        # 3. 合并结果构建上下文
        context_parts = [
            f"[语义检索] {doc}"
            for doc in vec_results.get("documents", [[]])[0]
        ]
        for rel in graph_results:
            context_parts.append(
                f"[图谱推理] {rel['source']} "
                f"-{rel['relation']}→ "
                f"{rel['target']}"
            )

        return {
            "context": "\\n".join(context_parts),
            "sources": {
                "vector": vec_results,
                "graph": graph_results
            }
        }

    def _extract_entities(self, text: str) -> list:
        """简单实体提取（实际应用中用 NER 模型）"""
        return [n for n in self.kg.graph.nodes() if n in text]`,
                },
            ],
            table: {
                headers: ["能力", "向量数据库", "知识图谱", "GraphRAG 混合"],
                rows: [
                    ["语义模糊匹配", "✅ 强", "❌ 不支持", "✅ 向量部分支持"],
                    ["精确关系查询", "❌ 不支持", "✅ 强", "✅ 图谱部分支持"],
                    ["多跳推理", "❌ 不支持", "✅ 支持", "✅ 图谱部分支持"],
                    ["非结构化文本检索", "✅ 强", "❌ 不支持", "✅ 向量部分支持"],
                    ["可解释性", "⚠️ 低（黑盒相似度）", "✅ 高（显式关系）", "✅ 中等"],
                ],
            },
            mermaid: `graph TD
    A["用户查询"] --> B{"实体识别"}
    B --> C["向量检索\
语义匹配"]
    B --> D["图谱查询\
关系推理"]
    C --> E["检索结果集"]
    D --> E
    E --> F["结果融合与排序"]
    F --> G["增强提示词"]
    G --> H["LLM 生成"]`,
            tip: "GraphRAG 适合需要精确关系推理的场景（如问答系统中的「A 和 B 有什么关系」）。如果只是普通的语义搜索，纯向量检索更简单高效。",
            warning: "知识图谱的构建成本高——你需要从非结构化文本中提取实体和关系，这一步的准确性直接影响图谱质量。不建议从小项目开始就引入图谱。",
        },
        {
            title: "6. 记忆压缩与摘要：从海量信息到精炼知识",
            body: `随着 Agent 运行时间增长，积累的信息量会呈指数级增长。如果不加管理，短期记忆会撑爆上下文窗口，长期记忆会因为数据膨胀而检索变慢且不准确。记忆压缩（Memory Compression）是解决这一问题的核心技术。

记忆压缩的基本思路是：定期对积累的信息进行摘要（Summarization），将大量细节信息浓缩为精炼的要点。例如，将一天的对话记录压缩为几条关键洞察；将一周的任务执行记录压缩为一份进度报告。压缩后的摘要作为高层记忆存储在长期记忆中，而原始详细信息可以选择性归档或删除。

记忆摘要的关键挑战在于平衡信息保留率和压缩率——压缩过度会丢失重要信息，压缩不足则达不到减负效果。实践中常用的策略包括：重要性评分（保留高重要性信息）、时间衰减（旧信息优先压缩）、主题聚类（相似信息合并摘要）。`,
            code: [
                {
                    lang: "python",
                    code: `# 记忆摘要与压缩
class MemoryCompressor:
    """记忆压缩器"""

    def __init__(self, llm, max_items: int = 50):
        self.llm = llm
        self.max_items = max_items
        self.memory_buffer: list[dict] = []

    def add(self, entry: str, importance: float = 0.5) -> None:
        """添加记忆条目"""
        self.memory_buffer.append({
            "content": entry,
            "importance": importance,
            "timestamp": time.time()
        })
        # 超出阈值时触发压缩
        if len(self.memory_buffer) > self.max_items:
            self.compress()

    def compress(self, target_ratio: float = 0.3) -> list[dict]:
        """将记忆压缩为摘要"""
        # 按重要性排序
        sorted_mem = sorted(
            self.memory_buffer,
            key=lambda x: x["importance"],
            reverse=True
        )

        # 保留最重要的条目
        keep_count = max(int(self.max_items * target_ratio), 5)
        kept = sorted_mem[:keep_count]

        # 其余条目生成摘要
        to_summarize = sorted_mem[keep_count:]
        texts = [m["content"] for m in to_summarize]
        summary = self._llm_summarize(texts)

        compressed = kept + [{
            "content": summary,
            "importance": 0.3,
            "timestamp": time.time(),
            "is_summary": True
        }]

        self.memory_buffer = compressed
        return compressed

    def _llm_summarize(self, texts: list[str]) -> str:
        prompt = f"请将以下 {len(texts)} 条信息浓缩为 3-5 条核心要点：\\n"
        for i, t in enumerate(texts):
            prompt += f"{i+1}. {t}\\n"
        response = self.llm.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        return response.choices[0].message.content`,
                },
                {
                    lang: "python",
                    code: `# 分层记忆管理：热记忆 vs 冷记忆
class TieredMemory:
    """分层记忆：热（最近/重要）vs 冷（历史/归档）"""

    def __init__(self, hot_limit: int = 100):
        self.hot_memory: list[dict] = []  # 热记忆：快速访问
        self.cold_memory: list[dict] = []  # 冷记忆：归档存储
        self.hot_limit = hot_limit

    def store(self, content: str, importance: float = 0.5) -> str:
        """存储记忆（自动分层）"""
        entry = {
            "id": str(uuid.uuid4()),
            "content": content,
            "importance": importance,
            "access_count": 0,
            "last_access": time.time(),
            "created_at": time.time()
        }
        self.hot_memory.append(entry)
        self._evict_if_needed()
        return entry["id"]

    def retrieve(self, query: str, top_k: int = 5) -> list[dict]:
        """从热记忆中检索"""
        scored = []
        for entry in self.hot_memory:
            # 混合评分：语义 + 时效性 + 重要性 + 访问频率
            semantic_score = self._semantic_match(query, entry["content"])
            recency = time.time() - entry["created_at"]
            recency_score = 1.0 / (1.0 + recency / 86400)  # 天为单位
            final_score = (
                0.5 * semantic_score
                + 0.2 * recency_score
                + 0.2 * entry["importance"]
                + 0.1 * min(entry["access_count"] / 10, 1.0)
            )
            scored.append((final_score, entry))
        scored.sort(reverse=True)
        results = [entry for _, entry in scored[:top_k]]
        for entry in results:
            entry["access_count"] += 1
            entry["last_access"] = time.time()
        return results

    def _evict_if_needed(self) -> None:
        """将最不活跃的条目移入冷记忆"""
        while len(self.hot_memory) > self.hot_limit:
            self.hot_memory.sort(key=lambda x: x["last_access"])
            self.cold_memory.append(self.hot_memory.pop(0))`,
                },
            ],
            table: {
                headers: ["压缩策略", "保留率", "计算成本", "信息损失", "适用场景"],
                rows: [
                    ["重要性筛选", "10-30%", "低", "中（丢失低重要性细节）", "日常记忆管理"],
                    ["LLM 摘要", "5-15%", "高（需调用 LLM）", "低（保留核心要点）", "对话历史压缩"],
                    ["时间衰减", "20-50%", "低", "高（旧信息全丢）", "时效性强的数据"],
                    ["主题聚类摘要", "10-20%", "中高", "低（按主题保留）", "大规模知识库维护"],
                ],
            },
            mermaid: `graph TD
    A["原始记忆积累"] --> B{"数量超限？"}
    B -->|否| C["继续积累"]
    B -->|是| D["按重要性排序"]
    D --> E["保留 Top-K 条目"]
    D --> F["其余条目送 LLM 摘要"]
    E --> G["精炼记忆"]
    F --> G
    G --> H["存入长期记忆"]
    H --> I["删除/归档原始数据"]`,
            tip: "记忆压缩不要等到内存爆满才做——设置合理的阈值（如 50-100 条），提前触发压缩可以避免上下文窗口溢出。",
            warning: "LLM 摘要虽然质量好，但每次压缩都调用 LLM 会产生显著成本。对于非关键数据，可以使用简单的 TF-IDF 提取关键词作为低成本替代方案。",
        },
        {
            title: "7. 实战：构建有记忆的 Agent",
            body: `现在我们将前面学到的所有概念整合起来，构建一个完整的、有记忆的 Agent 系统。这个 Agent 将具备以下能力：记住与用户的交互历史和偏好（短期+长期记忆）、通过向量检索获取相关知识（RAG）、利用知识图谱进行关系推理（GraphRAG）、自动压缩和管理记忆（记忆管理），以及在多轮对话中保持上下文一致性。

整个系统的架构设计遵循分层原则：最底层是存储层（向量数据库 + 知识图谱 + 关系数据库），中间层是记忆管理层（检索、压缩、索引），最上层是 Agent 层（规划、推理、工具调用）。这种分层设计使得每个模块可以独立演进和替换。

在实际部署中，还需要考虑：记忆的安全性和隐私保护（用户的个人数据如何加密存储）、多用户支持（如何隔离不同用户的记忆）、记忆的跨平台同步（手机和电脑上的 Agent 共享同一份记忆）、以及记忆的版本管理（当发现错误记忆时如何修正）。这些都是生产级 Agent 记忆系统必须面对的挑战。`,
            code: [
                {
                    lang: "python",
                    code: `# 完整记忆增强 Agent 系统
class MemoryAgent:
    """集成向量检索 + 知识图谱 + 记忆管理的 Agent"""

    def __init__(self, config: dict):
        # 存储层
        self.vector_db = ChromaVectorDB(config["db_path"])
        self.knowledge_graph = KnowledgeGraph()
        self.memory_store = TieredMemory(hot_limit=100)

        # 嵌入与 LLM
        self.embedder = SentenceTransformer("BAAI/bge-large-zh-v1.5")
        self.llm = OpenAI(model=config["llm_model"])

        # 记忆管理器
        self.compressor = MemoryCompressor(self.llm, max_items=80)

        # Agent 状态
        self.session_memory: list[dict] = []
        self.user_profile: dict = {}

    def chat(self, user_message: str) -> dict:
        """完整的记忆增强对话流程"""
        # 1. 存储到短期记忆
        self.session_memory.append({"role": "user", "content": user_message})

        # 2. 向量检索（RAG）
        vec_results = self.vector_db.query(user_message, top_k=3)

        # 3. 图谱推理（GraphRAG）
        graph_results = self._graph_query(user_message)

        # 4. 构建增强上下文
        context = self._build_context(
            user_message, vec_results, graph_results
        )

        # 5. LLM 生成回复
        response = self._generate(context)

        # 6. 更新记忆
        self._update_memory(user_message, response)

        return {"response": response, "sources": vec_results}

    def _build_context(self, query, vec_results, graph_results) -> str:
        """构建增强提示词"""
        parts = []
        parts.append("你是用户的 AI 助理，拥有长期记忆和外部知识。")
        if vec_results:
            parts.append("\\n[参考资料]")
            for doc in vec_results.get("documents", [[]])[0]:
                parts.append(f"- {doc}")
        if graph_results:
            parts.append("\\n[知识图谱信息]")
            for rel in graph_results:
                parts.append(
                    f"- {rel['source']} {rel['relation']} {rel['target']}"
                )
        if self.session_memory:
            parts.append("\\n[最近对话]")
            for msg in self.session_memory[-5:]:
                parts.append(f"{msg['role']}: {msg['content']}")
        parts.append(f"\\n用户问题: {query}")
        return "\\n".join(parts)

    def _update_memory(self, query: str, response: str) -> None:
        """对话后更新长期记忆"""
        self.session_memory.append({"role": "assistant", "content": response})
        self.compressor.add(f"用户: {query}\\nAI: {response}", importance=0.6)
        self.memory_store.store(
            f"{query} -> {response}",
            importance=self._estimate_importance(query)
        )`,
                },
                {
                    lang: "python",
                    code: `# Agent 配置文件与启动
import yaml
import asyncio

class AgentConfig:
    """Agent 系统配置"""

    DEFAULT_CONFIG = {
        "db_path": "./agent_memory",
        "llm_model": "gpt-4o",
        "embedder_model": "BAAI/bge-large-zh-v1.5",
        "vector_db": "chroma",
        "max_context_length": 4000,
        "top_k_retrieval": 3,
        "memory_compress_threshold": 80,
        "enable_graph_rag": True,
        "enable_memory_compression": True,
        "user_profile_path": "./user_profile.json",
        "log_level": "INFO"
    }

    @classmethod
    def load(cls, config_path: str = "agent_config.yaml") -> dict:
        """从 YAML 文件加载配置"""
        try:
            with open(config_path, "r") as f:
                user_config = yaml.safe_load(f)
            return {**cls.DEFAULT_CONFIG, **user_config}
        except FileNotFoundError:
            return cls.DEFAULT_CONFIG

    @classmethod
    def save(cls, config: dict, path: str) -> None:
        with open(path, "w") as f:
            yaml.dump(config, f, default_flow_style=False)

# 启动示例
def run_agent():
    config = AgentConfig.load()
    agent = MemoryAgent(config)

    print("🍪 记忆增强 Agent 已启动")
    print("输入 'quit' 退出，输入 'memory' 查看记忆状态")

    while True:
        user_input = input("\\n你: ").strip()
        if user_input.lower() == "quit":
            break
        if user_input.lower() == "memory":
            print(f"会话记忆: {len(agent.session_memory)} 条")
            print(f"热记忆: {len(agent.memory_store.hot_memory)} 条")
            print(f"冷记忆: {len(agent.memory_store.cold_memory)} 条")
            continue

        result = agent.chat(user_input)
        print(f"AI: {result['response']}")`,
                },
            ],
            table: {
                headers: ["模块", "技术选型", "职责", "扩展方向"],
                rows: [
                    ["向量检索", "Chroma + BGE-large-zh", "语义相似度检索", "切换到 Pinecone 支持大规模"],
                    ["知识图谱", "NetworkX", "关系推理", "迁移到 Neo4j 支持持久化"],
                    ["记忆管理", "分层热/冷存储", "自动压缩与淘汰", "引入向量检索优化冷记忆查询"],
                    ["LLM 推理", "OpenAI GPT-4o", "理解与生成", "支持多模型路由和回退"],
                    ["配置系统", "YAML + 默认值", "灵活配置", "支持环境变量和远程配置"],
                ],
            },
            mermaid: `graph TD
    A["用户输入"] --> B["记忆 Agent 入口"]
    B --> C["短期记忆更新"]
    B --> D["向量数据库检索"]
    B --> E["知识图谱查询"]
    D --> F["构建增强上下文"]
    E --> F
    C --> F
    F --> G["LLM 生成回复"]
    G --> H["更新长期记忆"]
    H --> I["触发记忆压缩？"]
    I -->|是| J["LLM 摘要压缩"]
    I -->|否| K["直接返回"]
    J --> K
    K --> L["回复用户"]`,
            tip: "生产部署时，建议先实现纯向量检索 + RAG 的 MVP，验证价值后再引入知识图谱和记忆压缩。每一步都增加复杂度，但也会带来质的提升。",
            warning: "Agent 记忆涉及用户隐私数据，务必做好数据加密和访问控制。特别是当 Agent 记住了用户的个人信息、偏好和习惯时，这些数据泄露的后果比一般应用更严重。",
        },
    ],
};
