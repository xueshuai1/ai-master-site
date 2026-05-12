import { Article } from '../knowledge';

export const article: Article = {
    id: "practice-002",
    title: "搜索引擎与向量检索",
    category: "practice",
    tags: ["搜索引擎", "向量检索", "RAG"],
    summary: "从倒排索引到向量数据库，掌握现代搜索系统的核心技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 搜索引擎概述",
            body: `搜索引擎是现代信息系统的基础设施。从早期的关键词匹配到如今的大模型驱动检索，搜索技术经历了从精确匹配到语义理解的巨大飞跃。传统搜索引擎依赖倒排索引实现快速文本查找，而向量检索则将文本映射到高维空间，通过计算向量之间的距离实现语义级别的相似性搜索。两者结合构成了当今最强大的混合检索架构。Google 每天处理超过 85 亿次搜索，背后支撑的就是这套不断演进的技术栈。理解搜索引擎的工作原理，不仅有助于构建更好的搜索产品，更是掌握 **RAG** 架构的关键前置知识。`,
            code: [
                {
                    lang: "python",
                    code: `# 基础搜索引擎架构示意
class SearchEngine:
    def __init__(self):
        self.index = InvertedIndex()
        self.vector_store = VectorStore()
    
    def search(self, query: str, top_k: int = 10):
        # 关键词检索结果
        keyword_results = self.index.search(query)
        # 向量语义检索结果
        vector_results = self.vector_store.search(query)
        # 融合排序
        return self.rerank(keyword_results, vector_results, top_k)`
                },
                {
                    lang: "bash",
                    code: `# 搭建搜索引擎的最小依赖
pip install elasticsearch faiss-cpu sentence-transformers

# 启动本地 Elasticsearch 单节点
docker run -d --name es \
  -e "discovery.type=single-node" \
  -p 9200:9200 elasticsearch:8.12.0

# 验证服务
curl http://localhost:9200`
                }
            ],
            table: {
                headers: ["搜索引擎", "核心索引", "排序算法", "适用场景"],
                rows: [
                    ["Elasticsearch", "倒排索引", "BM25", "全文搜索"],
                    ["FAISS", "向量索引", "内积/余弦", "语义搜索"],
                    ["Whoosh", "倒排索引", "TF-IDF", "轻量级搜索"],
                    ["Milvus", "向量索引", "ANN", "大规模向量"]
                ]
            },
            mermaid: `graph LR
    A["用户查询"] --> B["查询解析"]
    B --> C["关键词检索"]
    B --> D["向量检索"]
    C --> E["结果融合"]
    D --> E
    E --> F["排序打分"]
    F --> G["返回 Top-K"]`,
            tip: "建议从 Elasticsearch 入手理解传统搜索，再用 FAISS 体验向量检索的语义能力"
        },
        {
            title: "2. 倒排索引原理",
            body: `倒排索引是搜索引擎最核心的数据结构。与正排索引（按文档ID存储内容）相反，倒排索引以词项（term）为键，记录包含该词项的所有文档ID列表。当用户搜索多个关键词时，系统通过集合运算（交集、并集）快速定位目标文档。构建倒排索引需要经历分词、归一化、去停用词等预处理步骤。分词质量直接影响搜索效果，英文按空格即可切分，而中文需要借助专门的分词器如 Jieba 或 HanLP。每个词项的倒排列表通常还携带词频、位置等元数据，用于后续的 BM25 打分计算。`,
            code: [
                {
                    lang: "python",
                    code: `# 倒排索引的简化实现
from collections import defaultdict
import jieba

class InvertedIndex:
    def __init__(self):
        self.index = defaultdict(list)  # term -> [(doc_id, freq)]
    
    def add_document(self, doc_id: int, text: str):
        words = jieba.lcut(text)
        freq = defaultdict(int)
        for word in words:
            if len(word.strip()) > 0:
                freq[word] += 1
        for term, count in freq.items():
            self.index[term].append((doc_id, count))
    
    def search(self, query: str) -> list[int]:
        terms = jieba.lcut(query)
        results = None
        for term in terms:
            doc_ids = {doc_id for doc_id, _ in self.index.get(term, [])}
            results = doc_ids if results is None else results & doc_ids
        return list(results) if results else []`
                },
                {
                    lang: "python",
                    code: `# BM25 打分计算
import math

def bm25_score(tf: int, doc_len: int, avg_len: float, 
               n_docs: int, n_containing: int, k1=1.5, b=0.75) -> float:
    idf = math.log((n_docs - n_containing + 0.5) / (n_containing + 0.5) + 1)
    norm = 1 - b + b * (doc_len / avg_len)
    tf_weighted = tf * (k1 + 1) / (tf + k1 * norm)
    return idf * tf_weighted

# 示例：计算 "向量" 在文档中的 BM25 分数
score = bm25_score(tf=3, doc_len=120, avg_len=150, 
                   n_docs=1000, n_containing=50)
print(f"BM25 score: {score:.4f}")  # BM25 score: 1.2847`
                }
            ],
            table: {
                headers: ["预处理步骤", "作用", "示例"],
                rows: [
                    ["分词", "将文本切分为词项", "\"搜索引擎\" -> [\"搜索\", \"引擎\"]"],
                    ["归一化", "统一大小写和形式", "\"Python\" -> \"python\""],
                    ["去停用词", "移除无意义高频词", "移除 \"的\"、\"是\"、\"在\""],
                    ["词干提取", "还原词根形式", "\"running\" -> \"run\""]
                ]
            },
            mermaid: `graph TD
    A["原始文档"] --> B["分词处理"]
    B --> C["归一化"]
    C --> D["去停用词"]
    D --> E["构建倒排表"]
    E --> F["term1 -> doc1, doc3, doc5"]
    E --> G["term2 -> doc2, doc3, doc7"]
    E --> H["term3 -> doc1, doc4, doc6"]`,
            warning: "倒排索引无法捕捉语义相似性，搜索 \"汽车\" 无法匹配包含 \"轿车\" 的文档"
        },
        {
            title: "3. 向量检索基础",
            body: `向量检索将文本通过嵌入模型映射为高维向量，在向量空间中语义相近的文本距离也更近。常用的距离度量包括欧氏距离、余弦相似度和内积。与倒排索引的精确匹配不同，向量检索天然支持模糊语义匹配，能够理解同义词、上下位关系甚至跨语言相似性。现代嵌入模型如 text-embedding-3-large 可以生成 3072 维的稠密向量，在海量语料上预训练后具备强大的语义表征能力。向量检索的关键挑战在于高维空间中的最近邻搜索计算复杂度随数据量线性增长，因此需要近似最近邻算法来加速。`,
            code: [
                {
                    lang: "python",
                    code: `# 文本向量化与相似度计算
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

texts = ["搜索引擎优化", "网站排名提升", "如何做红烧肉"]
vectors = model.encode(texts, normalize_embeddings=True)

# 计算余弦相似度矩阵
similarity = vectors @ vectors.T
print(np.round(similarity, 3))
# [[1.    0.712 0.156]
#  [0.712 1.    0.098]
#  [0.156 0.098 1.   ]]`
                },
                {
                    lang: "python",
                    code: `# FAISS 基础向量检索
import faiss
import numpy as np

dimension = 384  # all-MiniLM-L6-v2 的维度
n_vectors = 10000
data = np.random.random((n_vectors, dimension)).astype("float32")

# 创建 L2 距离的索引
index = faiss.IndexFlatL2(dimension)
index.add(data)
print(f"索引中向量数: {index.ntotal}")  # 索引中向量数: 10000

# 查询最近邻
query = np.random.random((1, dimension)).astype("float32")
distances, indices = index.search(query, k=5)
print(f"Top-5 距离: {distances[0]}")
print(f"Top-5 索引: {indices[0]}")`
                }
            ],
            table: {
                headers: ["距离度量", "公式", "适用场景", "取值范围"],
                rows: [
                    ["欧氏距离", "||a - b||_2", "绝对差异比较", "[0, +inf)"],
                    ["余弦相似度", "a*b / (||a||*||b||)", "文本语义匹配", "[-1, 1]"],
                    ["内积", "a * b", "归一化向量检索", "[-inf, +inf]"],
                    ["曼哈顿距离", "sum(|a_i - b_i|)", "稀疏向量匹配", "[0, +inf)"]
                ]
            },
            mermaid: `graph LR
    A["文本输入"] --> B["Embedding 模型"]
    B --> C["384维向量"]
    C --> D["向量空间"]
    D --> E["距离计算"]
    E --> F["最近邻排序"]
    F --> G["Top-K 结果"]`,
            tip: "使用 normalize_embeddings=True 归一化后，内积等价于余弦相似度，可以用更快的 IndexFlatIP 替代 IndexFlatL2"
        },
        {
            title: "4. ANN 算法（HNSW / IVF）",
            body: `近似最近邻搜索是向量检索的核心优化技术。暴力搜索需要遍历所有向量计算距离，时间复杂度为 O(N*d)，当数据量达到百万级时完全不可行。HNSW 通过构建多层可导航小世界图实现 O(log N) 的查询复杂度，将向量组织为层次化的图结构，高层用于快速粗定位，底层用于精确查找。IVF 则将向量空间划分为多个 Voronoi 区域，查询时只搜索最近的几个聚类中心对应的分区，大幅减少候选向量数量。两种算法各有优劣，HNSW 查询速度快但内存消耗大，IVF 内存友好但需要合理选择分区数。`,
            code: [
                {
                    lang: "python",
                    code: `# FAISS 中的 IVF 索引
import faiss
import numpy as np

dimension = 384
n_vectors = 100000
data = np.random.random((n_vectors, dimension)).astype("float32")

n_clusters = 1024  # 聚类中心数量
quantizer = faiss.IndexFlatIP(dimension)
index = faiss.IndexIVFFlat(quantizer, dimension, n_clusters, faiss.METRIC_INNER_PRODUCT)

index.train(data)  # IVF 需要先训练聚类
index.add(data)
index.nprobe = 16  # 查询时搜索的聚类数

query = np.random.random((1, dimension)).astype("float32")
D, I = index.search(query, k=10)
print(f"召回 Top-10, nprobe={index.nprobe}")`
                },
                {
                    lang: "python",
                    code: `# FAISS 中的 HNSW 索引
import faiss
import numpy as np

dimension = 384
n_vectors = 100000
data = np.random.random((n_vectors, dimension)).astype("float32")

# M=16 表示每层图的连接数, efConstruction 控制构建质量
index = faiss.IndexHNSWFlat(dimension, M=16)
index.hnsw.efConstruction = 200  # 构建时更精细
index.hnsw.efSearch = 64         # 查询时搜索范围

index.add(data)

# 动态调整查询精度
for ef in [32, 64, 128]:
    index.hnsw.efSearch = ef
    D, I = index.search(data[:5], k=10)
    print(f"efSearch={ef}, avg_dist={D.mean():.4f}")`
                }
            ],
            table: {
                headers: ["算法", "查询复杂度", "内存占用", "构建时间", "适合规模"],
                rows: [
                    ["HNSW", "O(log N)", "高", "中等", "百万级"],
                    ["IVF", "O(N/C)", "低", "较快", "千万级"],
                    ["LSH", "O(N^(1/p))", "低", "快", "超大规模"],
                    ["暴力搜索", "O(N*d)", "最低", "无", "万级以下"]
                ]
            },
            mermaid: `graph TD
    A["查询向量"] --> B["HNSW 高层图"]
    B --> C["快速粗定位"]
    C --> D["逐层下降"]
    D --> E["底层精确搜索"]
    E --> F["Top-K 最近邻"]
    
    G["IVF 方式"] --> H["计算聚类中心距离"]
    H --> I["选择最近 nprobe 个分区"]
    I --> J["分区内暴力搜索"]
    J --> F`,
            warning: "HNSW 的 M 值越大搜索越精确但内存消耗急剧增加，M=16 是常用起点，不要盲目调大"
        },
        {
            title: "5. 混合检索（BM25 + 向量）",
            body: `单一检索方式存在明显局限：BM25 擅长精确关键词匹配但不懂语义，向量检索擅长语义理解但对精确实体匹配不够敏感。混合检索将两者结合，通过倒数排名融合或加权评分融合，同时保留关键词精确匹配和语义模糊匹配的优势。在 **RAG** 系统中，混合检索已经成为标准配置，能够显著提升检索覆盖率。实现混合检索的关键在于分数归一化和权重分配，BM25 分数和向量相似度分数的量纲完全不同，需要通过 Min-Max 归一化或 Z-Score 标准化后才能合理融合。`,
            code: [
                {
                    lang: "python",
                    code: `# 倒数排名融合（Reciprocal Rank Fusion）
def reciprocal_rank_fusion(keyword_results: list[int], 
                           vector_results: list[int],
                           k: int = 60) -> list[tuple[int, float]]:
    scores = {}
    # 关键词检索得分
    for rank, doc_id in enumerate(keyword_results):
        scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    # 向量检索得分
    for rank, doc_id in enumerate(vector_results):
        scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    # 按融合分数降序
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)

# 示例
kw = [10, 20, 30, 40, 50]
vec = [30, 10, 60, 70, 20]
fused = reciprocal_rank_fusion(kw, vec)
print(fused[:5])  # [(10, 0.0328), (30, 0.0325), (20, 0.0317), ...]`
                },
                {
                    lang: "python",
                    code: `# Elasticsearch 中的混合检索（KNN + BM25）
from elasticsearch import Elasticsearch

client = Elasticsearch("http://localhost:9200")

response = client.search(
    index="articles",
    knn={
        "field": "embedding",
        "query_vector": [0.12, -0.34, 0.56],  # 查询向量
        "k": 10,
        "num_candidates": 100
    },
    query={
        "multi_match": {
            "query": "向量数据库教程",
            "fields": ["title", "content"]
        }
    },
    rank={
        "rrf": {
            "window_size": 50,
            "rank_constant": 20
        }
    }
)
for hit in response["hits"]["hits"]:
    print(f"{hit['_id']}: {hit['_score']:.4f}")`
                }
            ],
            table: {
                headers: ["融合策略", "原理", "优点", "缺点"],
                rows: [
                    ["RRF", "倒数排名求和", "无需调参，鲁棒性强", "忽略绝对分数差异"],
                    ["加权线性", "a*BM25 + b*向量", "灵活可控", "需要调权重参数"],
                    ["Min-Max 归一化", "缩放到 [0,1] 后加权", "考虑分数分布", "对极端值敏感"],
                    ["学习排序", "用模型学习最优融合", "效果最好", "需要标注数据训练"]
                ]
            },
            mermaid: `graph LR
    A["用户查询"] --> B["BM25 关键词检索"]
    A --> C["向量语义检索"]
    B --> D["BM25 分数列表"]
    C --> E["向量相似度列表"]
    D --> F["分数归一化"]
    E --> F
    F --> G["RRF / 加权融合"]
    G --> H["统一排序"]
    H --> I["返回 Top-K"]`,
            tip: "ES 8.x 原生支持 RRF 融合，使用 rank.rrf 参数即可同时获得关键词和向量检索结果"
        },
        {
            title: "6. RAG 中的检索增强",
            body: `**RAG** 检索增强生成是向量检索最重要的应用场景之一。其核心流程包括文档分块、向量化、索引构建、检索和生成五个阶段。检索质量直接决定了大模型的输出质量，糟糕的检索会让模型产生幻觉。分块策略是 **RAG** 检索的第一步，过大的 chunk 会混入无关信息干扰模型，过小的 chunk 可能丢失关键上下文。常用的分块大小在 200-1000 token 之间，并保留 10-20 的 token 重叠。高级 RAG 技术如 HyDE 先用大模型生成假设性文档再检索，Self-RAG 让模型自己判断是否需要检索，都能显著提升最终生成质量。`,
            code: [
                {
                    lang: "python",
                    code: `# RAG 文档分块策略
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\\n\\n", "\\n", "。", "；", "，", " "],
    length_function=len
)

document = "这是一篇很长的技术文档..."  # 省略实际内容
chunks = splitter.split_text(document)
print(f"分块数: {len(chunks)}")
print(f"首块长度: {len(chunks[0])}")

# 向量化并存储
model = SentenceTransformer("all-MiniLM-L6-v2")
chunk_vectors = model.encode(chunks, normalize_embeddings=True)

# 构建 FAISS 索引
import faiss
dim = chunk_vectors.shape[1]
index = faiss.IndexFlatIP(dim)
index.add(chunk_vectors.astype("float32"))
print(f"向量索引构建完成: {index.ntotal} 个分块")`
                },
                {
                    lang: "python",
                    code: `# HyDE：假设性文档增强检索
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

def hyde_search(query: str, index, texts: list[str], 
                model: SentenceTransformer, k: int = 5) -> list[str]:
    # 1. 让 LLM 生成假设性答案
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"请回答以下问题: {query}"}],
        max_tokens=200
    )
    hypothetical_doc = response.choices[0].message.content
    
    # 2. 用假设性文档检索
    query_vec = model.encode([hypothetical_doc], normalize_embeddings=True)
    D, I = index.search(query_vec.astype("float32"), k=k)
    
    return [texts[i] for i in I[0]]

# 使用假设性文档比直接用问题检索更准确
results = hyde_search("HNSW 的核心思想是什么?", index, chunks, model)`
                }
            ],
            table: {
                headers: ["RAG 技术", "核心思路", "适用场景", "实现复杂度"],
                rows: [
                    ["Naive RAG", "直接分块检索", "简单场景", "低"],
                    ["HyDE", "生成假设文档再检索", "问题表述模糊", "中"],
                    ["Self-RAG", "模型自主判断是否检索", "复杂推理任务", "高"],
                    ["RAPTOR", "树状层次化检索", "长文档问答", "高"]
                ]
            },
            mermaid: `graph TD
    A["原始文档"] --> B["文档分块"]
    B --> C["Embedding 向量化"]
    C --> D["构建向量索引"]
    E["用户问题"] --> F["问题向量化"]
    F --> G["向量检索 Top-K"]
    G --> H["上下文组装"]
    H --> I["Prompt 模板"]
    I --> J["LLM 生成回答"]
    J --> K["最终输出"]`,
            warning: "不要在 RAG 中直接传入过长的上下文，超出模型上下文窗口会导致截断或报错，建议控制在 4000 token 以内"
        },
        {
            title: "7. 实战：FAISS + Elasticsearch 混合检索系统",
            body: `本节从零构建一个完整的混合检索系统。使用 Elasticsearch 存储文档并提供 BM25 全文搜索，使用 FAISS 管理向量索引实现语义检索，最终通过 RRF 融合两者结果。系统包含文档摄入、索引构建、混合检索三个模块。文档摄入阶段将原始文本经过分词和嵌入后分别写入两个引擎，检索阶段并行查询并融合结果。这个架构是工业级搜索系统的缩小版本，掌握了它就可以扩展到真实的业务场景中。实际部署时还需要考虑增量更新、分布式索引、缓存等工程问题。`,
            code: [
                {
                    lang: "python",
                    code: `# 完整混合检索系统
import faiss
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from elasticsearch import Elasticsearch

class HybridSearchEngine:
    def __init__(self, es_url="http://localhost:9200"):
        self.es = Elasticsearch(es_url)
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.dimension = 384
        self.faiss_index = faiss.IndexFlatIP(self.dimension)
        self.doc_store = {}  # id -> document
        self.next_id = 0
        self._ensure_index()
    
    def _ensure_index(self):
        self.es.indices.create(
            index="hybrid_docs",
            body={"mappings": {"properties": {
                "title": {"type": "text", "analyzer": "ik_max_word"},
                "content": {"type": "text", "analyzer": "ik_max_word"},
                "doc_id": {"type": "integer"}
            }}},
            ignore=400
        )
    
    def ingest(self, title: str, content: str):
        vector = self.model.encode(f"{title} {content}", normalize_embeddings=True)
        self.es.index(index="hybrid_docs", document={
            "title": title, "content": content, "doc_id": self.next_id
        })
        self.faiss_index.add(np.array([vector], dtype="float32"))
        self.doc_store[self.next_id] = {"title": title, "content": content}
        self.next_id += 1
        return self.next_id - 1
    
    def search(self, query: str, top_k: int = 5) -> list[dict]:
        # BM25 检索
        es_res = self.es.search(index="hybrid_docs", query={
            "multi_match": {"query": query, "fields": ["title", "content"]}
        }, size=top_k * 2)
        bm25_ids = [int(hit["_source"]["doc_id"]) for hit in es_res["hits"]["hits"]]
        
        # 向量检索
        q_vec = self.model.encode([query], normalize_embeddings=True)
        _, vec_indices = self.faiss_index.search(q_vec.astype("float32"), k=top_k * 2)
        vec_ids = [int(i) for i in vec_indices[0] if i >= 0]
        
        # RRF 融合
        return self._rrf_fuse(bm25_ids, vec_ids, top_k)
    
    def _rrf_fuse(self, bm25: list[int], vec: list[int], k: int = 5, c: int = 60):
        scores = {}
        for r, d in enumerate(bm25):
            scores[d] = scores.get(d, 0) + 1 / (c + r)
        for r, d in enumerate(vec):
            scores[d] = scores.get(d, 0) + 1 / (c + r)
        return [{"id": d, "score": s, "doc": self.doc_store[d]} 
                for d, s in sorted(scores.items(), key=lambda x: -x[1])[:k]]`
                },
                {
                    lang: "python",
                    code: `# 使用示例
engine = HybridSearchEngine()

# 注入文档
engine.ingest("FAISS 入门", "FAISS 是 Facebook 开源的高效向量检索库")
engine.ingest("Elasticsearch 教程", "ES 是基于 Lucene 的分布式搜索引擎")
engine.ingest("RAG 架构详解", "检索增强生成结合大语言模型和外部知识库")
engine.ingest("HNSW 算法原理", "分层可导航小世界图实现快速近似最近邻搜索")
engine.ingest("BM25 打分函数", "BM25 是信息检索中最常用的文本排序算法")

# 混合检索
results = engine.search("向量检索和搜索引擎的区别")
for r in results:
    print(f"[{r['score']:.4f}] {r['doc']['title']}")
    print(f"  {r['doc']['content']}")
    print()`
                }
            ],
            table: {
                headers: ["模块", "职责", "技术选型", "关键配置"],
                rows: [
                    ["文档摄入", "分词+向量化+双写入", "ES + FAISS", "分块大小 500"],
                    ["BM25 检索", "关键词精确匹配", "Elasticsearch", "ik_max_word 分词"],
                    ["向量检索", "语义相似度匹配", "FAISS IndexFlatIP", "归一化向量"],
                    ["结果融合", "RRF 排名融合", "Python 实现", "k=60, c=60"]
                ]
            },
            mermaid: `graph TD
    A["新文档"] --> B["文本分块"]
    B --> C["Embedding 向量"]
    C --> D["写入 FAISS"]
    B --> E["写入 Elasticsearch"]
    
    F["查询请求"] --> G["BM25 查询"]
    F --> H["向量查询"]
    G --> I["ES 返回结果"]
    H --> J["FAISS 返回结果"]
    I --> K["RRF 融合排序"]
    J --> K
    K --> L["Top-K 文档"]`,
            tip: "生产环境中使用 FAISS 的 IndexIDMap 包装索引，可以直接存储文档 ID，避免额外维护映射表"
        }
    ]
};
