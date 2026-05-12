import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-003",
    title: "RAG 检索增强生成架构指南",
    category: "llm",
    tags: ["RAG", "向量数据库", "知识库"],
    summary: "如何结合外部知识库增强 LLM 的准确性和时效性",
    date: "2026-04-06",
    readTime: "22 min",
    level: "进阶",
    content: [
      {
        title: "1. 为什么需要 RAG？大语言模型的三大局限",
        body: `大语言模型虽然强大，但存在三个天然局限：知识截止（训练数据有固定截止日期，无法了解最新信息）、幻觉倾向（对不知道的内容倾向于编造而非承认）、私有数据盲区（训练数据不包含企业内部文档和数据库）。

**RAG**（Retrieval-Augmented Generation，检索增强生成）是解决这些问题最优雅的架构方案。它的核心思想很简单：在模型生成回答之前，先从外部知识库中检索相关信息，然后将检索结果和问题一起输入模型。这样模型就不需要"记住"所有知识，只需要"读懂"给它的参考资料并作答。

这就像开卷考试——你不需要背下整本教科书，只需要知道如何快速查找相关信息并理解它。**RAG** 让 LLM 从"闭卷答题"变成"开卷答题"，准确率大幅提升，幻觉显著减少。`,
        mermaid: `graph LR
    A["用户问题"] --> B["向量检索"]
    C["知识库文档"] --> D["分块+向量化"]
    D --> E["向量数据库"]
    E --> B
    B --> F["相关文档片段"]
    F --> G["Prompt 组装"]
    A --> G
    G --> H["LLM 生成回答"]
    H --> I["最终答案"]`,
        tip: "关键认知：RAG 不是微调模型，而是在推理时注入外部知识。模型参数不变，但每次回答的上下文不同。"
      },
      {
        title: "2. RAG 架构全景：从数据到答案的完整流程",
        body: `一个完整的 **RAG** 系统包含两个阶段：索引阶段（Indexing）和查询阶段（Querying）。

索引阶段（离线执行，一次性或定期更新）：
**1. 文档采集**：从各种数据源（PDF、网页、数据库、API）获取原始文档
**2. 文本清洗**：去除 HTML 标签、乱码、无关内容
3. 文档分块（Chunking）：将长文档切分为固定大小的文本块。这是最关键也最容易被忽视的环节——块太大则检索精度下降，块太小则丢失上下文
4. 向量化（Embedding）：使用 Embedding 模型将每个文本块转换为高维向量
**5. 存储入库**：将向量和元数据存入向量数据库，建立索引

查询阶段（在线执行，每次用户提问时触发）：
**1. 问题向量化**：使用同一个 Embedding 模型将用户问题转换为向量
**2. 相似度检索**：在向量数据库中找到与问题最相似的 Top-K 个文本块
**3. 上下文组装**：将检索到的文本块与原始问题组合成 Prompt
**4. LLM 生成**：将组装好的 Prompt 输入 LLM，生成最终回答
**5. 结果后处理**：格式校验、引用标注、安全检查`,
        code: [
          {
            lang: "python",
            code: `# RAG 索引阶段完整实现
from typing import List, Dict
import hashlib

class DocumentIndexer:
    """RAG 文档索引器"""
    
    def __init__(self, embedding_model, vector_db, chunk_size=500,
                 chunk_overlap=50):
        self.embedding_model = embedding_model
        self.vector_db = vector_db
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def chunk_document(self, text: str) -> List[Dict]:
        """将文档切分为重叠的文本块"""
        chunks = []
        # 按段落分割
        paragraphs = text.split('\n\n')
        current_chunk = ""
        chunk_index = 0
        
        for para in paragraphs:
            if len(current_chunk) + len(para) > self.chunk_size:
                if current_chunk:
                    chunk_id = hashlib.md5(
                        current_chunk.encode()
                    ).hexdigest()[:12]
                    chunks.append({
                        "id": chunk_id,
                        "text": current_chunk.strip(),
                        "index": chunk_index
                    })
                    chunk_index += 1
                # 保留重叠部分
                overlap_start = max(0, len(current_chunk) - self.chunk_overlap)
                current_chunk = current_chunk[overlap_start:] + "\n\n" + para
            else:
                current_chunk += ("\n\n" if current_chunk else "") + para
        
        if current_chunk.strip():
            chunk_id = hashlib.md5(
                current_chunk.encode()
            ).hexdigest()[:12]
            chunks.append({
                "id": chunk_id,
                "text": current_chunk.strip(),
                "index": chunk_index
            })
        
        return chunks
    
    def index(self, documents: List[Dict[str, str]]) -> int:
        """索引文档列表，返回索引的文档数量"""
        total_chunks = 0
        for doc in documents:
            chunks = self.chunk_document(doc["content"])
            for chunk in chunks:
                # 向量化
                embedding = self.embedding_model.encode(chunk["text"])
                # 存储到向量数据库
                self.vector_db.add(
                    id=chunk["id"],
                    vector=embedding,
                    metadata={
                        "text": chunk["text"],
                        "source": doc.get("source", ""),
                        "title": doc.get("title", "")
                    }
                )
                total_chunks += 1
        return total_chunks

# 使用示例
documents = [
    {
        "title": "公司员工手册",
        "source": "hr_docs",
        "content": "员工每年享有 15 天带薪年假...\n\n"
                   "病假需要提供医院证明...\n\n"
                   "加班补偿按 1.5 倍工资计算..."
    },
]
# indexer = DocumentIndexer(embedding_model, vector_db)
# count = indexer.index(documents)
# print(f"索引完成，共 {count} 个文本块")`
          }
        ]
      },
      {
        title: "3. Chunking 策略：RAG 成败的关键",
        body: `文本分块（Chunking）是 **RAG** 系统中最影响效果的环节之一。分块策略直接决定了检索的精度和上下文的质量。

固定大小分块（Fixed-Size Chunking）：最简单的方法。按字符数或 Token 数等长切分，块之间有少量重叠。优点是简单高效，缺点是可能在不恰当的位置切断句子或段落。

语义分块（Semantic Chunking）：利用文本的语义结构来切分。先按段落、章节、列表等自然边界分割，再对过长的段落进行二次切分。优点是保留了语义完整性，缺点是实现更复杂。

递归字符分块（Recursive Character Splitting）：**LangChain** 等框架使用的策略。先用大分隔符（如双换行）分割，如果块仍然太大，再用小分隔符（如单换行、句号、空格）递归分割。这在简单性和效果之间取得了很好的平衡。

****关键参数选择****：Chunk Size 取决于 Embedding 模型的上下文窗口和目标任务的性质。对于问答任务，300-500 Token 通常足够；对于需要长篇上下文的摘要任务，可能需要 1000-2000 Token。Overlap 一般设置为 Chunk Size 的 10%-20%。`,
        code: [
          {
            lang: "python",
            code: `# 递归字符分块实现
def recursive_split(text: str, chunk_size: int,
                    overlap: int) -> List[str]:
    """递归字符分块算法"""
    if len(text) <= chunk_size:
        return [text] if text.strip() else []
    
    # 按优先级尝试不同的分隔符
    separators = ["\n\n", "\n", "。", "，", " ", ""]
    
    for sep in separators:
        if sep == "":
            # 最后手段：按字符硬切
            chunks = []
            start = 0
            while start < len(text):
                end = start + chunk_size
                chunks.append(text[start:end])
                start = end - overlap
            return chunks
        
        parts = text.split(sep)
        # 如果分割后仍有过长的块，对长块递归处理
        result = []
        current = ""
        for part in parts:
            part_with_sep = part + sep
            if len(part_with_sep) > chunk_size:
                # 长块：递归处理
                if current.strip():
                    result.append(current.strip())
                result.extend(recursive_split(
                    part_with_sep, chunk_size, overlap
                ))
                current = ""
            elif len(current + part_with_sep) > chunk_size:
                if current.strip():
                    result.append(current.strip())
                current = part_with_sep
            else:
                current += part_with_sep
        
        if current.strip():
            result.append(current.strip())
        
        # 检查是否有效分割
        if len(result) > 1:
            return result
    
    return [text] if text.strip() else []

# 测试
text = """第一段内容。

第二段，这里有很多信息需要讨论。

第三段是非常长的内容，""" + "A" * 600 + """。

第四段结尾。"""

chunks = recursive_split(text, chunk_size=200, overlap=40)
for i, chunk in enumerate(chunks):
    print(f"Chunk {i+1} ({len(chunk)} chars): {chunk[:60]}...")`
          }
        ],
        table: {
          headers: ["分块策略", "实现难度", "语义完整性", "检索精度", "适用场景"],
          rows: [
            ["固定大小", "低", "差", "中", "快速原型验证"],
            ["递归字符", "中", "中", "高", "通用 RAG 系统"],
            ["语义分块", "高", "优", "高", "结构化文档（论文、法律文件）"],
            ["基于文档结构", "高", "优", "极高", "有明确章节标记的文档"],
            ["滑动窗口", "低", "中", "中", "流式数据处理"],
          ]
        },
        warning: "分块陷阱：不要让一个文本块包含多个不相关的主题。例如，一个块里同时有员工年假政策和服务器配置信息，这会导致检索时引入大量无关噪声。"
      },
      {
        title: "4. 向量检索与 Embedding 模型选择",
        body: `Embedding 模型将文本映射为高维向量，使得语义相似的文本在向量空间中的距离也更近。选择合适的 Embedding 模型是 **RAG** 系统的核心决策。

评估 Embedding 模型的关键指标：
1. MTEB 分数（Massive Text Embedding Benchmark）：权威的 Embedding 模型评测榜单，涵盖分类、聚类、配对、重排序、检索、STS 等任务
**2. 多语言能力**：如果你的应用场景涉及中文，必须选择对中文支持良好的模型
**3. 上下文长度**：模型能处理的最大文本长度，决定了单个 Chunk 的最大尺寸
**4. 推理速度**：影响 **RAG** 系统的延迟表现
**5. 向量维度**：维度越高表达能力越强，但存储和计算成本也越高

主流 Embedding 模型对比：**OpenAI** 的 text-embedding-3-large 性能最强但需要付费；开源模型如 BGE（BAAI General Embedding）在中文场景下表现优异，且可以本地部署；Cohere 的 Embedding 模型在多语言支持上有优势。`,
        mermaid: `graph TD
    A["用户查询"] --> B["向量化 Query"]
    C["向量数据库"] --> D["相似度计算"]
    B --> D
    D --> E["Top-K 候选"]
    E --> F["Cross-Encoder 重排序"]
    F --> G["Final Top-K"]
    G --> H["组装 Prompt"]
    class H s2
    class G s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
        list: [
          "中文场景优先选择 BGE-m3 或 m3e 等中文优化模型",
          "向量维度不必盲目追求高维——768 维通常已经足够",
          "使用混合检索（BM25 + 向量）可以弥补纯向量检索的不足",
          "Cross-Encoder 重排序能显著提升 Top-K 的精度，但会增加延迟",
          "定期评估检索质量：人工标注 50-100 个问答对，计算检索命中率",
        ]
      },
      {
        title: "5. 完整的 RAG 查询 pipeline 实现",
        body: `查询阶段是 **RAG** 系统与用户直接交互的环节，决定了用户的实际体验。一个生产级的查询 pipeline 需要考虑多个方面：查询理解、多路检索、结果融合、答案生成、引用标注。

查询理解（Query Understanding）：用户的原始提问可能不够精确。通过查询改写（Query Rewriting）、查询扩展（Query Expansion）和意图识别，可以大幅提升检索质量。例如，用户问"年假怎么算"，系统可以改写为"员工带薪年假计算规则"进行检索。

多路检索（Multi-Path Retrieval）：结合多种检索策略。向量检索擅长语义匹配，BM25 擅长关键词匹配，知识图谱擅长实体关系查询。将多路检索结果融合（如 Reciprocal Rank Fusion），效果通常优于任何单一策略。`,
        code: [
          {
            lang: "python",
            code: `# 完整 RAG 查询 Pipeline
class RAGPipeline:
    """生产级 RAG 查询管道"""
    
    def __init__(self, embedding_model, vector_db,
                 llm, reranker=None, top_k=5):
        self.embedding_model = embedding_model
        self.vector_db = vector_db
        self.llm = llm
        self.reranker = reranker
        self.top_k = top_k
    
    def rewrite_query(self, query: str) -> List[str]:
        """查询改写：生成多个检索查询"""
        # 实际场景可以用 LLM 来改写
        rewrites = [query]  # 原始查询
        # 同义词扩展
        synonyms = {
            "年假": ["带薪年假", "年休假", "休假天数"],
            "报销": ["费用报销", "财务报销", "报销流程"],
        }
        for keyword, syns in synonyms.items():
            if keyword in query:
                for syn in syns:
                    rewrites.append(query.replace(keyword, syn))
        return rewrites[:3]  # 最多 3 个改写
    
    def retrieve(self, queries: List[str]) -> List[Dict]:
        """多查询检索 + 去重 + 重排序"""
        all_results = []
        seen_ids = set()
        
        for q in queries:
            query_vec = self.embedding_model.encode(q)
            results = self.vector_db.search(
                vector=query_vec, top_k=self.top_k
            )
            for r in results:
                if r["id"] not in seen_ids:
                    all_results.append(r)
                    seen_ids.add(r["id"])
        
        # Cross-Encoder 重排序
        if self.reranker and all_results:
            scored = self.reranker.rank(
                query=queries[0],
                documents=[r["text"] for r in all_results]
            )
            all_results = [
                {**all_results[i], "rerank_score": s}
                for i, s in enumerate(scored)
            ]
            all_results.sort(
                key=lambda x: x.get("rerank_score", 0), reverse=True
            )
        
        return all_results[:self.top_k]
    
    def generate(self, query: str, contexts: List[Dict]) -> Dict:
        """组装 Prompt 并调用 LLM 生成"""
        context_text = "\n\n".join([
            f"[来源 {i+1}: {ctx.get('source', '未知')}]\\n{ctx['text']}"
            for i, ctx in enumerate(contexts)
        ])
        
        prompt = f"""你是一个专业的知识助手。请根据以下参考资料回答问题。

参考资料：
{context_text}

问题：{query}

要求：
1. 仅基于参考资料回答，不要编造信息
2. 如果参考资料不足以回答问题，请如实说明
3. 在回答中标注引用来源，如 [来源 1]
4. 回答要简洁准确"""
        
        response = self.llm.generate(prompt)
        return {
            "answer": response,
            "sources": [
                {"text": c["text"][:100], "source": c.get("source", "")}
                for c in contexts[:3]
            ]
        }
    
    def run(self, query: str) -> Dict:
        """完整 pipeline 执行"""
        queries = self.rewrite_query(query)
        contexts = self.retrieve(queries)
        return self.generate(query, contexts)

# 使用示例
# rag = RAGPipeline(embedding_model, vector_db, llm, reranker)
# result = rag.run("年假有多少天？")
# print(f"答案: {result['answer']}")
# for src in result['sources']:
#     print(f"来源: {src['source']}")`
          }
        ]
      },
      {
        title: "6. RAG 系统的评估与优化",
        body: `没有评估就没有优化。**RAG** 系统需要从多个维度进行量化评估，才能持续迭代改进。

评估框架 **RAG**AS：**RAG** Assessment（**RAG**AS）是目前最流行的 **RAG** 评估框架，它从四个维度进行评估：
1. 忠实度（Faithfulness）：生成的答案是否忠实于检索到的上下文，即是否基于参考资料而非模型自身知识
2. 答案相关性（Answer Relevance）：答案是否直接回答了用户的问题
3. 上下文精度（Context Precision）：检索到的上下文中有多少是真正相关的
4. 上下文召回率（Context Recall）：检索到的上下文覆盖了多少应该被召回的信息

****优化策略****：当评估结果不理想时，有针对性地优化——忠实度低说明模型在编造，需要加强 Prompt 约束和降低 temperature；答案相关性低可能需要改进查询改写；上下文精度低需要优化 Embedding 模型或引入重排序；上下文召回率低可能需要调整分块策略或增加检索数量。`,
        code: [
          {
            lang: "python",
            code: `# 简易 RAG 评估实现
def evaluate_rag(test_cases: List[Dict], rag_pipeline) -> Dict:
    """评估 RAG 系统的质量"""
    results = {"faithfulness": [], "relevance": [],
               "context_precision": [], "context_recall": []}
    
    for case in test_cases:
        query = case["question"]
        ground_truth = case["answer"]
        relevant_docs = case.get("relevant_docs", [])
        
        result = rag_pipeline.run(query)
        answer = result["answer"]
        contexts = [c["text"] for c in result.get("sources", [])]
        
        # 简易评估（实际应使用 LLM-as-judge 或人工标注）
        # 忠实度：答案中的关键事实是否都在上下文中
        facts_in_context = 0
        total_facts = 0
        for fact in extract_key_facts(answer):
            total_facts += 1
            if any(fact.lower() in ctx.lower() for ctx in contexts):
                facts_in_context += 1
        faithfulness = facts_in_context / max(total_facts, 1)
        
        # 答案相关性：答案与标准答案的关键词重叠
        answer_words = set(extract_keywords(answer))
        truth_words = set(extract_keywords(ground_truth))
        relevance = len(answer_words & truth_words) / max(len(truth_words), 1)
        
        results["faithfulness"].append(faithfulness)
        results["relevance"].append(relevance)
    
    return {
        k: sum(v) / max(len(v), 1) for k, v in results.items()
    }

# 测试集示例
test_cases = [
    {
        "question": "年假有多少天？",
        "answer": "员工每年享有 15 天带薪年假",
        "relevant_docs": ["hr_handbook_section_3.txt"]
    },
]
# scores = evaluate_rag(test_cases, rag_pipeline)
# print(f"忠实度: {scores['faithfulness']:.2%}")
# print(f"相关性: {scores['relevance']:.2%}")`
          }
        ],
        table: {
          headers: ["评估指标", "衡量什么", "低分原因", "优化方向"],
          rows: [
            ["忠实度", "答案是否基于检索到的上下文", "模型编造信息、temperature 过高", "加强 Prompt 约束、降低 temperature"],
            ["答案相关性", "答案是否直接回答问题", "查询理解不准、检索不精准", "查询改写、意图识别"],
            ["上下文精度", "检索结果中有多少是相关的", "Embedding 模型质量差、Chunking 策略不佳", "更换模型、优化分块、引入重排序"],
            ["上下文召回率", "应该召回的信息有多少被召回了", "检索数量太少、向量检索盲区", "增加 Top-K、混合检索"],
          ]
        }
      },
      {
        title: "7. RAG 的进阶模式与未来趋势",
        body: `基础 **RAG** 已经能解决很多问题，但在复杂场景下，需要更高级的 **RAG** 变体。

Agentic **RAG**：将 **RAG** 嵌入到 Agent 的工作流中。Agent 可以根据需要自主决定何时检索、检索什么、以及如何处理检索结果。相比固定流程的 **RAG**，Agentic **RAG** 更灵活但也更复杂。

Graph **RAG**：结合知识图谱的 **RAG**。将文档中的实体和关系抽取为知识图谱，检索时不仅考虑文本相似度，还考虑实体间的关系路径。这在需要多跳推理（Multi-hop Reasoning）的场景中特别有用，比如"张总的下属王经理负责哪个项目？"

Self-**RAG**：模型在生成过程中自主评估是否需要检索、检索质量如何、以及生成的内容是否准确。这引入了反思机制，让模型能够自我纠正。

**多模态 RAG**：不仅检索文本，还检索图像、表格、图表等多模态信息，让 LLM 的回答更加丰富和准确。`,
        mermaid: `graph LR
    A["基础 RAG"] --> B["+ Agent 自主规划"]
    A --> C["+ 知识图谱"]
    A --> D["+ 自我反思"]
    A --> E["+ 多模态"]
    B --> F["Agentic RAG"]
    C --> G["Graph RAG"]
    D --> H["Self-RAG"]
    E --> I["多模态 RAG"]
    class I s4
    class H s3
    class G s2
    class F s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#14532d
    classDef s3 fill:#14532d
    classDef s4 fill:#14532d`,
        warning: "架构选择建议：从基础 RAG 开始，先评估效果，再按需升级到高级模式。不要一开始就上 Agentic RAG 或 Graph RAG——复杂度会显著增加开发和维护成本。",
        list: [
          "生产环境建议：基础 RAG + Cross-Encoder 重排序 + 查询改写，性价比最高",
          "多跳推理场景优先考虑 Graph RAG，而非单纯增加 Top-K",
          "Self-RAG 的延迟较高，适合离线场景或异步回答，不适合实时对话",
          "定期更新知识库：文档过期是 RAG 系统最大的隐性风险",
          "监控检索延迟：端到端延迟超过 3 秒会显著影响用户体验",
        ]
      },
    ],
  };
