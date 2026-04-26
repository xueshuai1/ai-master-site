// MCP 代码搜索与代码上下文工具：AI Coding Agent 如何理解整个代码库

import { Article } from '../knowledge';

export const article: Article = {
  id: "aieng019",
  title: "MCP 代码搜索与代码上下文工具：AI Coding Agent 如何理解整个代码库",
  category: "aieng",
  tags: ["MCP", "代码搜索", "代码上下文", "claude-context", "AI Coding Agent", "Embedding", "向量检索", "代码理解"],
  summary: "AI Coding Agent（Claude Code、Codex、Cursor）的最大瓶颈不是代码生成能力，而是上下文窗口有限——无法一次性理解整个代码库。MCP 代码搜索工具（如 claude-context）通过向量检索 + 语义理解，将「整个代码库」变成 Agent 的可搜索上下文。本文深度解析 MCP 代码搜索的架构原理、核心算法对比，并实现完整的 Python 代码搜索引擎。含 3 个 Mermaid 架构图 + 3 个 Python 可运行代码块 + 3 个对比表格。",
  date: "2026-04-26",
  readTime: "35 min",
  level: "进阶",
  content: [
    {
      title: "一、问题：AI Coding Agent 的上下文瓶颈",
      body: `2026 年 4 月，AI Coding Agent 领域迎来爆发式增长：Claude Code 日均活跃用户突破百万，OpenAI Codex 支持自主执行模式，Cursor 占据开发者工具市场半壁江山。但这些工具面临同一个根本性瓶颈：**上下文窗口有限，无法一次性理解整个代码库**。

一个中型项目的代码量通常在 10 万行到 100 万行之间，而即使是最强的 LLM 上下文窗口（如 Claude 200K tokens）也只能容纳约 15 万行代码。当 Agent 需要修复一个跨多个文件的 bug 时，它不知道哪些文件相关、哪些函数被调用、哪些类型需要修改。

**解决方案：MCP 代码搜索**。通过将整个代码库索引为向量数据库，Agent 可以通过自然语言查询找到相关代码片段，按需加载上下文。这不是普通的全文搜索——而是基于语义理解的代码检索。`,
    },
    {
      title: "二、MCP 代码搜索的核心架构",
      body: `MCP（Model Context Protocol）为代码搜索提供了一个标准化的接口层。claude-context（zilliztech/claude-context，9,436 stars，周增 3,301 星）是这一领域的代表项目。

MCP 代码搜索系统的核心工作流程如下图所示：`,
      mermaid: `sequenceDiagram
    participant Dev as 开发者/Coding Agent
    participant MCP as MCP Client (Claude Code)
    participant Server as MCP Server (claude-context)
    participant Index as 向量索引 (Milvus/Chroma)
    participant AST as AST 解析器
    
    Dev->>MCP: "找到处理用户认证的代码"
    MCP->>Server: tools/call {name: "code_search"}
    Server->>AST: 解析代码库 → 代码块分割
    AST-->>Server: 代码块列表 (函数/类/文件)
    Server->>Index: 生成 Embedding 向量
    Index-->>Server: 向量数据库就绪
    Server->>Index: 语义搜索 query embedding
    Index-->>Server: Top-K 相关代码块
    Server-->>MCP: 返回相关代码 + 文件路径
    MCP-->>Dev: 在上下文中注入搜索结果`,
    },
    {
      title: "三、代码分块策略：从文件到语义单元",
      body: `代码搜索的第一步是将代码库分解为有意义的搜索单元。朴素的做法是按文件分割，但一个文件可能包含多个独立功能。更好的策略是基于 AST（抽象语法树）进行语义分块。

**三种分块策略对比：**`,
      table: {
        headers: ["策略", "粒度", "优点", "缺点", "适用场景"],
        rows: [
          ["文件级", "整个文件", "实现简单，保留文件上下文", "文件过大时信息噪音高", "小型项目"],
          ["AST 函数/类级", "单个函数/类/方法", "语义完整，粒度适中", "跨文件调用关系丢失", "中大型项目"],
          ["语义切片级", "按功能模块/调用链分组", "捕获跨文件依赖，语义连贯", "实现复杂，计算开销大", "大型微服务项目"],
        ],
      },
    },
    {
      title: "四、Python 实战：构建 MCP 代码搜索引擎（1/3）—— AST 解析与分块",
      body: `以下是一个完整的 Python 实现，使用 Python 内置的 ast 模块进行代码解析和语义分块。这个实现可以直接运行，不需要额外的依赖（Python 3.9+）。`,
      code: [
        {
          lang: "python",
          title: "基于 AST 的 Python 代码分块器",
          code: `import ast
import os
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from pathlib import Path

@dataclass
class CodeChunk:
    """代码块：AST 解析后的语义单元"""
    filepath: str
    chunk_type: str  # 'function', 'class', 'module'
    name: str
    source_code: str
    line_start: int
    line_end: int
    docstring: Optional[str] = None
    imports: List[str] = field(default_factory=list)
    # 用于检索的特征
    keywords: List[str] = field(default_factory=list)

class ASTCodeSplitter:
    """基于 AST 的 Python 代码分块器"""
    
    def __init__(self):
        self.chunks: List[CodeChunk] = []
    
    def parse_file(self, filepath: str) -> List[CodeChunk]:
        """解析单个 Python 文件，提取函数和类"""
        with open(filepath, 'r', encoding='utf-8') as f:
            source = f.read()
        
        try:
            tree = ast.parse(source, filename=filepath)
        except SyntaxError:
            return []
        
        source_lines = source.split('\\n')
        file_chunks = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                chunk = self._extract_function(node, filepath, source_lines)
                file_chunks.append(chunk)
            elif isinstance(node, ast.ClassDef):
                chunk = self._extract_class(node, filepath, source_lines)
                file_chunks.append(chunk)
        
        # 提取文件级 import
        imports = [n.names[0].name for n in ast.walk(tree)
                   if isinstance(n, ast.Import)]
        for chunk in file_chunks:
            chunk.imports = imports
        
        self.chunks.extend(file_chunks)
        return file_chunks
    
    def _extract_function(self, node: ast.FunctionDef,
                          filepath: str, lines: List[str]) -> CodeChunk:
        start = node.lineno - 1
        end = node.end_lineno or (start + 1)
        docstring = ast.get_docstring(node)
        
        return CodeChunk(
            filepath=filepath,
            chunk_type="function",
            name=node.name,
            source_code='\\n'.join(lines[start:end]),
            line_start=node.lineno,
            line_end=node.end_lineno or node.lineno,
            docstring=docstring,
            keywords=self._extract_keywords(node, docstring)
        )
    
    def _extract_class(self, node: ast.ClassDef,
                       filepath: str, lines: List[str]) -> CodeChunk:
        start = node.lineno - 1
        end = node.end_lineno or (start + 1)
        docstring = ast.get_docstring(node)
        
        return CodeChunk(
            filepath=filepath,
            chunk_type="class",
            name=node.name,
            source_code='\\n'.join(lines[start:end]),
            line_start=node.lineno,
            line_end=node.end_lineno or node.lineno,
            docstring=docstring,
            keywords=self._extract_keywords(node, docstring)
        )
    
    def _extract_keywords(self, node, docstring: Optional[str]) -> List[str]:
        """从函数/类名和文档字符串提取关键词"""
        keywords = []
        if docstring:
            keywords.extend(docstring.lower().split())
        keywords.append(node.name.lower())
        return list(set(keywords))

    def index_directory(self, dir_path: str, pattern: str = "*.py") -> List[CodeChunk]:
        """索引整个目录"""
        for py_file in Path(dir_path).rglob(pattern):
            self.parse_file(str(py_file))
        return self.chunks

# 使用示例
if __name__ == "__main__":
    splitter = ASTCodeSplitter()
    chunks = splitter.index_directory("./src")
    print(f"索引完成: 共 {len(chunks)} 个代码块")
    for c in chunks[:5]:
        print(f"  [{c.chunk_type}] {c.name} in {c.filepath}")`
        }
      ],
    },
    {
      title: "五、Embedding 与向量检索：让代码可搜索",
      body: `AST 分块后，我们需要将代码块转换为可搜索的向量。代码 Embedding 有三种主流方案：

**方案对比：**`,
      table: {
        headers: ["方案", "输入内容", "模型示例", "检索效果", "计算成本"],
        rows: [
          ["纯代码文本", "原始代码字符串", "text-embedding-3-small", "一般，不理解语法", "低"],
          ["代码 + 文档串", "代码 + docstring + 注释", "CodeBERT, StarEncoder", "较好，有语义辅助", "中"],
          ["结构化 AST Embedding", "AST 路径 + 代码语义", "GraphCodeBERT, CodeT5", "最佳，理解代码结构", "高"],
        ],
      },
    },
    {
      title: "六、Python 实战：构建 MCP 代码搜索引擎（2/3）—— 向量索引与搜索",
      body: `下面实现向量索引和语义搜索功能。这里使用轻量级的方案：基于 TF-IDF + 余弦相似度的检索（无需外部向量数据库，适合中小项目）。对于大型项目，可替换为 Chroma 或 Milvus。`,
      code: [
        {
          lang: "python",
          title: "TF-IDF + 余弦相似度的代码搜索引擎",
          code: `import math
from collections import Counter
from typing import List, Tuple
from dataclasses import dataclass

@dataclass
class SearchResult:
    chunk_name: str
    filepath: str
    score: float
    snippet: str

class CodeSearchEngine:
    """基于 TF-IDF 的代码搜索引擎"""
    
    def __init__(self):
        self.documents: List[str] = []  # 每个代码块的文本
        self.chunk_map: dict = {}  # 索引 -> CodeChunk
        self.idf: dict = {}  # 逆文档频率
        self.tfidf_matrix: List[dict] = []  # 每个文档的 TF-IDF 向量
    
    def build_index(self, chunks):
        """从代码块构建搜索索引"""
        for i, chunk in enumerate(chunks):
            # 合并代码 + 文档串 + 关键词作为搜索文本
            text = f"{chunk.source_code} {chunk.docstring or ''} {' '.join(chunk.keywords)}"
            self.documents.append(text)
            self.chunk_map[i] = chunk
        
        # 计算 IDF
        self._compute_idf()
        
        # 计算 TF-IDF 矩阵
        self._compute_tfidf_matrix()
    
    def _tokenize(self, text: str) -> List[str]:
        """简单的代码分词：按非字母数字字符分割"""
        import re
        # 保留 camelCase 和 snake_case 的语义
        tokens = re.findall(r'[a-zA-Z_][a-zA-Z0-9_]*', text.lower())
        return tokens
    
    def _compute_idf(self):
        n_docs = len(self.documents)
        doc_freq = Counter()
        
        for doc in self.documents:
            tokens = set(self._tokenize(doc))
            for token in tokens:
                doc_freq[token] += 1
        
        for token, freq in doc_freq.items():
            self.idf[token] = math.log((n_docs + 1) / (freq + 1)) + 1
    
    def _compute_tfidf_matrix(self):
        for doc in self.documents:
            tokens = self._tokenize(doc)
            tf = Counter(tokens)
            total = len(tokens) or 1
            
            tfidf = {}
            for term, count in tf.items():
                tf_val = count / total
                idf_val = self.idf.get(term, 1.0)
                tfidf[term] = tf_val * idf_val
            
            self.tfidf_matrix.append(tfidf)
    
    def search(self, query: str, top_k: int = 10) -> List[SearchResult]:
        """语义搜索代码"""
        query_tokens = self._tokenize(query)
        query_tfidf = Counter()
        
        for token in query_tokens:
            idf_val = self.idf.get(token, 1.0)
            query_tfidf[token] = idf_val  # 假设查询中每个词出现一次
        
        # 计算每个文档与查询的余弦相似度
        scores = []
        for i, doc_tfidf in enumerate(self.tfidf_matrix):
            score = self._cosine_similarity(query_tfidf, doc_tfidf)
            if score > 0:
                chunk = self.chunk_map[i]
                scores.append(SearchResult(
                    chunk_name=chunk.name,
                    filepath=chunk.filepath,
                    score=score,
                    snippet=chunk.source_code[:200]
                ))
        
        scores.sort(key=lambda x: x.score, reverse=True)
        return scores[:top_k]
    
    def _cosine_similarity(self, vec1: Counter, vec2: Counter) -> float:
        """计算两个 TF-IDF 向量的余弦相似度"""
        all_terms = set(vec1.keys()) | set(vec2.keys())
        
        dot = sum(vec1.get(t, 0) * vec2.get(t, 0) for t in all_terms)
        norm1 = math.sqrt(sum(v**2 for v in vec1.values()))
        norm2 = math.sqrt(sum(v**2 for v in vec2.values()))
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot / (norm1 * norm2)

# 使用示例
if __name__ == "__main__":
    # 假设已从 ASTCodeSplitter 获得 chunks
    # chunks = splitter.index_directory("./src")
    
    # engine = CodeSearchEngine()
    # engine.build_index(chunks)
    
    # 模拟搜索结果
    results = [
        SearchResult("authenticate_user", "src/auth.py", 0.85, "def authenticate_user(token):..."),
        SearchResult("UserSession", "src/models.py", 0.72, "class UserSession:..."),
        SearchResult("login_handler", "src/handlers.py", 0.68, "async def login_handler(request):..."),
    ]
    
    print("搜索结果：")
    for r in results:
        print(f"  [{r.score:.2f}] {r.chunk_name} in {r.filepath}")
        print(f"    {r.snippet}")
        print()`
        }
      ],
    },
    {
      title: "七、MCP Server 实现：将代码搜索暴露给 AI Agent",
      body: `有了搜索引擎后，下一步是将其封装为 MCP Server，让 Claude Code、Codex 等 Agent 能够调用。以下是 MCP Python SDK 的完整实现。

**MCP 代码搜索工具的工作流程：**`,
      mermaid: `graph TD
    A[Coding Agent 需要理解代码库] --> B{MCP Client}
    B -->|tools/list| C[MCP Server]
    C -->|返回: code_search, code_nav| B
    
    B -->|tools/call: code_search| C
    C --> D[接收自然语言查询]
    D --> E[AST 分块 + Embedding]
    E --> F[向量检索 Top-K]
    F --> G[格式化结果: 代码片段 + 路径]
    G --> H[返回给 Agent]
    H --> I[Agent 在上下文中使用代码]
    
    B -->|tools/call: code_nav| C
    C --> J[获取文件/目录结构]
    J --> K[返回项目树状结构]
    K --> I`,
    },
    {
      title: "八、Python 实战：构建 MCP 代码搜索引擎（3/3）—— MCP Server 实现",
      body: `使用 MCP Python SDK 实现一个完整的代码搜索 MCP Server。这个 Server 可以被 Claude Code 或任何 MCP Client 调用。`,
      code: [
        {
          lang: "python",
          title: "MCP Code Search Server 完整实现",
          code: `from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel
from typing import List, Optional
import json

# 创建 MCP Server
mcp = FastMCP(
    "code-search",
    version="1.0.0",
    description="MCP Server for semantic code search"
)

class CodeSearchResult(BaseModel):
    name: str
    filepath: str
    score: float
    snippet: str
    chunk_type: str

@mcp.tool()
async def code_search(
    query: str,
    repo_path: str = ".",
    top_k: int = 10,
    chunk_types: Optional[List[str]] = None
) -> str:
    """
    在代码库中执行语义搜索。
    
    Args:
        query: 自然语言搜索查询（如 "处理用户认证的函数"）
        repo_path: 代码库路径（默认当前目录）
        top_k: 返回结果数量（默认 10）
        chunk_types: 过滤代码块类型（可选，如 ["function", "class"]）
    
    Returns:
        JSON 格式的搜索结果，包含代码片段、文件路径和相关度分数
    """
    # 1. AST 分块
    from ast_parser import ASTCodeSplitter
    splitter = ASTCodeSplitter()
    chunks = splitter.index_directory(repo_path)
    
    # 2. 类型过滤
    if chunk_types:
        chunks = [c for c in chunks if c.chunk_type in chunk_types]
    
    # 3. 构建索引并搜索
    from search_engine import CodeSearchEngine
    engine = CodeSearchEngine()
    engine.build_index(chunks)
    
    results = engine.search(query, top_k=top_k)
    
    # 4. 格式化为 JSON
    output = [
        {
            "name": r.chunk_name if hasattr(r, 'chunk_name') else r.name,
            "filepath": r.filepath,
            "score": round(r.score, 3),
            "snippet": r.snippet[:500],
            "chunk_type": r.chunk_type if hasattr(r, 'chunk_type') else "unknown"
        }
        for r in results
    ]
    
    return json.dumps(output, ensure_ascii=False, indent=2)

@mcp.tool()
async def code_nav(
    repo_path: str = ".",
    max_depth: int = 3
) -> str:
    """
    浏览代码库的目录结构。
    
    Args:
        repo_path: 代码库路径
        max_depth: 最大目录深度
    
    Returns:
        代码库的树状结构
    """
    from pathlib import Path
    
    def build_tree(path: Path, depth: int, prefix: str = "") -> str:
        if depth > max_depth:
            return ""
        
        lines = []
        entries = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name))
        
        for i, entry in enumerate(entries):
            if entry.name.startswith(('.git', '__pycache__', '.venv')):
                continue
            
            is_last = (i == len(entries) - 1)
            connector = "└── " if is_last else "├── "
            lines.append(f"{prefix}{connector}{entry.name}")
            
            if entry.is_dir():
                extension = "    " if is_last else "│   "
            else:
                extension = ""
            
            if entry.is_dir() and depth < max_depth:
                lines.append(build_tree(entry, depth + 1, prefix + extension))
        
        return "\\n".join(filter(None, lines))
    
    tree = build_tree(Path(repo_path), 0)
    return f"📁 {repo_path}\\n{tree}"

@mcp.tool()
async def code_read(filepath: str, line_start: int = 1, line_end: int = 100) -> str:
    """
    读取指定文件的代码内容。
    
    Args:
        filepath: 文件路径
        line_start: 起始行号（1-based）
        line_end: 结束行号（1-based）
    
    Returns:
        代码内容，带行号
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    selected = lines[line_start - 1:line_end]
    numbered = [f"{i + line_start:4d} | {line.rstrip()}" 
                for i, line in enumerate(selected)]
    
    return f"📄 {filepath} (行 {line_start}-{line_end})\\n" + "\\n".join(numbered)

# 启动 MCP Server
if __name__ == "__main__":
    mcp.run()`
        }
      ],
    },
    {
      title: "九、主流代码搜索工具对比",
      body: `当前市场上有多款代码搜索/上下文工具，各有优劣。以下是详细对比：`,
      table: {
        headers: ["工具", "技术栈", "索引方式", "MCP 支持", "Stars", "核心优势"],
        rows: [
          ["claude-context", "TypeScript + Milvus", "AST + 向量检索", "✅ 原生 MCP", "9,436", "专为 Claude Code 设计，代码搜索精准"],
          ["cline (codebase indexing)", "TypeScript", "全文 + 简单向量", "✅ 内建", "28,000+", "VS Code 集成，开箱即用"],
          ["Continue", "TypeScript", "自定义索引", "✅ 支持", "33,000+", "多 IDE 支持，插件生态丰富"],
          ["Sourcegraph", "Go", "全局代码图", "❌ API 集成", "10,000+", "企业级代码搜索，支持跨仓库"],
          ["grep.app", "Rust", "全文索引", "❌ 无", "N/A", "Web 搜索，速度快但无语义理解"],
        ],
      },
    },
    {
      title: "十、进阶优化策略",
      body: `对于生产环境的代码搜索系统，以下优化策略能显著提升搜索质量：

**1. 调用图增强检索**

单纯基于文本相似度的检索会遗漏关键的调用关系。通过构建调用图（Call Graph），可以在检索时召回直接调用和被调用的相关代码。

**2. 分层索引策略**

代码库的不同层次需要不同的索引策略：
- **符号层**：函数名、类名、变量名 — 精确匹配
- **语义层**：文档串、注释、代码逻辑 — 向量检索
- **结构层**：目录结构、模块依赖 — 图索引

**3. 增量更新**

代码库频繁变更，需要支持增量索引更新：
- 监听文件系统变更（inotify / fswatch）
- 仅重新索引变更文件
- 向量数据库支持 upsert 操作`,
      mermaid: `graph TD
    A[代码变更] --> B{变更类型}
    B -->|新增文件| C[全量索引]
    B -->|修改文件| D[删除旧向量 + 插入新向量]
    B -->|删除文件| E[从索引中移除]
    
    C --> F[更新向量数据库]
    D --> F
    E --> F
    
    F --> G[代码搜索 Agent 自动感知最新代码]`,
    },
    {
      title: "十一、实战场景：Agent 如何使用代码搜索修 Bug",
      body: `让我们看一个完整的实战场景：Agent 收到一个 bug 报告「用户登录后有时看不到自己的订单」，需要定位问题。

**Agent 的搜索路径：**

1. **code_search("用户登录后获取订单")** → 找到 \`get_user_orders()\` 函数
2. **code_search("订单缓存 过期")** → 找到 \`order_cache.py\` 中的缓存逻辑
3. **code_nav()** → 查看 \`src/cache/\` 目录结构
4. **code_read("src/cache/order_cache.py")** → 读取完整缓存代码
5. **code_search("cache invalidation login")** → 找到登录后未清除缓存的 bug

整个过程无需人工介入，Agent 自主完成了从问题描述到 bug 定位的全流程。这就是 MCP 代码搜索对 AI Coding Agent 的核心价值：**让 Agent 具备了「理解整个代码库」的能力**。`,
    },
    {
      title: "十二、总结与展望",
      body: `MCP 代码搜索正在成为 AI Coding Agent 的基础设施。2026 年 4 月，claude-context 等项目以周增 3,000+ stars 的速度爆发，证明这是一个被强烈需求的领域。

**核心要点：**
- AI Coding Agent 的瓶颈不在代码生成，而在代码理解
- MCP 为代码搜索提供了标准化的工具接口
- AST 语义分块 + 向量检索是当前最优方案
- 调用图增强和分层索引是下一步优化方向

**未来趋势：**
- 跨语言代码搜索（Python + JS + Rust 混合项目）
- 代码语义图谱（Code Semantic Graph）替代简单向量检索
- Agent 自主构建代码索引，无需人工配置
- 代码搜索与代码生成深度耦合，实现真正的「理解-生成」闭环`,
    },
  ],
};
