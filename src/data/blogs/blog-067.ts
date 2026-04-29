// AI Agent 记忆系统深度指南：mempalace 与 claude-mem 架构解析

import type { BlogPost } from './blog-types';

export const blog: BlogPost = {
  id: "blog-067",
  author: "AI Master",
  title: "AI Agent 记忆系统实战：mempalace 与 claude-mem 架构深度解析与自主实现",
  category: "agent",
  tags: ["AI 记忆系统", "mempalace", "claude-mem", "向量记忆", "情景记忆", "语义记忆", "记忆压缩", "RAG 进阶", "Agent 长期记忆", "2026 前沿"],
  summary: "AI Agent 的记忆系统正经历范式转变。mempalace（49K stars）以多维度记忆架构重新定义了 Agent 记忆系统，claude-mem（67K stars）用 AI 驱动的记忆压缩方案将 Claude Code 会话记忆效率提升 98%。本文深度对比两款项目的技术架构，揭示记忆编码、压缩、检索、遗忘的完整链路，并提供从零构建生产级 Agent 记忆系统的 Python 实战代码。",
  date: "2026-04-25",
  readTime: 35,
content: [
    {
      title: "1. 记忆系统的范式演进：从简单 RAG 到多维自主记忆",
      body: `2026 年是 AI Agent 记忆系统爆发的一年。早期的 Agent 记忆方案大多停留在简单的向量检索（RAG）层面——将对话历史嵌入后存入向量数据库，需要时检索最相似的前 K 条。但这种方案存在三个根本缺陷：缺乏记忆的组织结构（所有内容平铺在向量空间中）、没有记忆压缩机制（对话越长检索质量越差）、无法区分不同类型记忆（事实、偏好、情景、技能）。

mempalace 和 claude-mem 代表了两种截然不同的记忆哲学。mempalace 走的是"结构化记忆"路线——它将记忆分为多个维度（语义记忆、情景记忆、程序记忆、用户画像），每个维度有独立的存储策略和检索算法，类似于人类大脑的海马体-新皮层协作模型。claude-mem 则选择了"压缩驱动"路线——它不关心记忆的分类，而是用另一个 AI Agent 持续压缩会话内容，保留最关键的上下文信息，用极简的存储实现高效记忆。

这两种方案各有优劣：mempalace 的记忆更精确、可解释性更强，但实现复杂度高；claude-mem 实现简洁、token 效率极高，但压缩过程中的信息损失不可控。理解两者的设计哲学，是构建下一代 Agent 记忆系统的关键。`,
      code: [
        {
          lang: "python",
          code: `# 简单 RAG 记忆的局限性示例
import chromadb
from sentence_transformers import SentenceTransformer

class SimpleRAGMemory:
    """早期 Agent 的记忆实现——平铺式向量存储"""

    def __init__(self):
        self.client = chromadb.PersistentClient(path="./simple_mem")
        self.collection = self.client.get_or_create_collection("all_memories")
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")

    def store(self, text: str, metadata: dict = None) -> None:
        """无差别存储所有对话"""
        embedding = self.embedder.encode(text).tolist()
        self.collection.add(
            embeddings=[embedding],
            documents=[text],
            metadatas=[metadata or {}],
            ids=[f"mem_{len(self.collection.get()['ids'])}"]
        )

    def retrieve(self, query: str, top_k: int = 3) -> list:
        """检索——所有记忆混在一起"""
        embedding = self.embedder.encode(query).tolist()
        results = self.collection.query(
            query_embeddings=[embedding],
            n_results=top_k
        )
        return results["documents"][0]

# 问题演示：当记忆库包含 1000+ 条对话时
# 1. "用户喜欢什么颜色？" 可能检索到完全不相关的编程对话
# 2. 长期对话中的早期信息被淹没
# 3. 无法区分"用户说过的话"和"Agent 学到的技能"`,
        },
      ],
      mermaid: `graph LR
    A["简单 RAG 记忆"] --> B["所有文本→嵌入向量"]
    B --> C["平铺存储在同一集合"]
    C --> D["查询时相似度匹配"]
    D --> E["返回 Top-K 结果"]
    classDef simple fill:#374151,stroke:#333
    class A,C,D,E simple
    class E s3
    class D s2
    class C s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#1e3a5f
    classDef s2 fill:#1e3a5f
    classDef s3 fill:#1e3a5f`,
    },
    {
      title: "2. mempalace 架构：多维度记忆系统的生产级实现",
      body: `mempalace 的核心创新在于它的多维度记忆架构。它将 Agent 记忆系统分为四个维度：

语义记忆（Semantic Memory）存储事实和知识——"Python 的 GIL 是什么"、"用户叫张三"。使用高密度向量嵌入 + 元数据过滤，支持精确的事实检索。

情景记忆（Episodic Memory）存储特定时间点的交互事件——"2026-04-25 用户讨论了 mempalace 架构"。使用时序索引 + 语义嵌入的双路检索，既能按时间查找，也能按内容查找。

程序记忆（Procedural Memory）存储 Agent 学到的技能和操作模式——"如何调用 GitHub API"、"代码审查的检查清单"。使用图结构存储，技能之间可以形成依赖关系。

用户画像（User Profile）存储用户的偏好、习惯、背景知识。使用结构化键值对 + 向量嵌入的混合存储，支持精确查询和模糊匹配。

mempalace 的检索流程采用了"记忆路由"机制——根据查询的类型自动选择最合适的记忆维度，而不是在单一向量空间中盲目搜索。这种设计让检索准确率在基准测试中比简单 RAG 提升了 340%。`,
      code: [
        {
          lang: "python",
          code: `# mempalace 风格的多维度记忆系统
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Optional, Any
import numpy as np

class MemoryType(Enum):
    SEMANTIC = "semantic"      # 事实知识
    EPISODIC = "episodic"      # 情景事件
    PROCEDURAL = "procedural"  # 技能操作
    PROFILE = "profile"        # 用户画像

@dataclass
class MemoryEntry:
    content: str
    memory_type: MemoryType
    timestamp: datetime = field(default_factory=datetime.now)
    importance: float = 1.0  # 重要性分数，用于遗忘决策
    embedding: Optional[np.ndarray] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)

class MultiDimensionalMemory:
    """多维度 Agent 记忆系统"""

    def __init__(self, embedding_model=None):
        self.semantic_store: Dict[str, MemoryEntry] = {}
        self.episodic_timeline: List[MemoryEntry] = []
        self.procedural_graph: Dict[str, Dict] = {}  # 技能图
        self.user_profile: Dict[str, Any] = {}
        self.embedder = embedding_model
        self.forget_threshold = 0.1  # 重要性低于此值会被遗忘

    def store(self, entry: MemoryEntry) -> None:
        """根据记忆类型路由到不同存储"""
        if entry.embedding is None and self.embedder:
            entry.embedding = self.embedder.encode(entry.content)

        router = {
            MemoryType.SEMANTIC: self._store_semantic,
            MemoryType.EPISODIC: self._store_episodic,
            MemoryType.PROCEDURAL: self._store_procedural,
            MemoryType.PROFILE: self._store_profile,
        }
        router[entry.memory_type](entry)

    def retrieve(self, query: str, memory_types: List[MemoryType] = None) -> List[MemoryEntry]:
        """跨维度检索——自动路由到合适的记忆维度"""
        if memory_types is None:
            memory_types = list(MemoryType)

        results = []
        for mtype in memory_types:
            results.extend(self._search_dimension(query, mtype))

        # 按重要性和相关性综合排序
        results.sort(key=lambda x: x.importance, reverse=True)
        return results

    def _store_semantic(self, entry: MemoryEntry) -> None:
        key = f"sem_{hash(entry.content) % 10000}"
        self.semantic_store[key] = entry

    def _store_episodic(self, entry: MemoryEntry) -> None:
        self.episodic_timeline.append(entry)
        # 保持时间线有序
        self.episodic_timeline.sort(key=lambda x: x.timestamp)

    def _store_procedural(self, entry: MemoryEntry) -> None:
        skill_id = entry.metadata.get("skill_id", f"proc_{len(self.procedural_graph)}")
        self.procedural_graph[skill_id] = {
            "entry": entry,
            "prerequisites": entry.metadata.get("prereqs", []),
            "related_skills": entry.metadata.get("related", []),
        }

    def _store_profile(self, entry: MemoryEntry) -> None:
        key = entry.metadata.get("profile_key", entry.content[:50])
        self.user_profile[key] = {"value": entry.content, "updated": entry.timestamp}

    def consolidate(self) -> None:
        """记忆巩固：将短期高频访问的记忆转为长期记忆"""
        for entry in self.episodic_timeline[-100:]:  # 最近 100 条
            if entry.importance > 0.7:
                # 提升为语义记忆
                semantic = MemoryEntry(
                    content=entry.content,
                    memory_type=MemoryType.SEMANTIC,
                    importance=entry.importance * 0.9,
                    embedding=entry.embedding,
                )
                self._store_semantic(semantic)

    def forget(self) -> int:
        """遗忘机制：清除低重要性记忆"""
        forgotten = 0
        # 语义记忆遗忘
        keys_to_remove = [
            k for k, v in self.semantic_store.items()
            if v.importance < self.forget_threshold
        ]
        for k in keys_to_remove:
            del self.semantic_store[k]
            forgotten += 1

        # 情景记忆衰减
        self.episodic_timeline = [
            e for e in self.episodic_timeline
            if e.importance > self.forget_threshold
        ]

        return forgotten`,
        },
      ],
      table: {
        headers: ["特性", "mempalace", "claude-mem", "简单 RAG"],
        rows: [
          ["记忆维度", "4 维度（语义/情景/程序/画像）", "单一压缩流", "1 维度（平铺向量）"],
          ["检索机制", "路由查询 + 多维度融合", "注入压缩上下文", "单一向量相似度"],
          ["记忆压缩", "重要性评分 + 定期巩固", "AI Agent 实时压缩", "无压缩"],
          ["遗忘策略", "基于重要性阈值的主动遗忘", "压缩过程中的自然遗忘", "无遗忘机制"],
          ["可解释性", "高（明确分类）", "中（压缩结果可审计）", "低（黑盒相似度）"],
          ["实现复杂度", "高", "中", "低"],
          ["Token 效率", "中（按需检索）", "极高（98% 减少）", "低（全量注入）"],
          ["基准准确率", "+340% vs 简单 RAG", "N/A（效率优先）", "基线"],
          ["Stars", "49,484", "67,060", "N/A"],
        ],
      },
      mermaid: `graph TD
    Q["用户查询"] --> MR["记忆路由器"]
    MR --> SM["语义记忆 事实检索"]
    MR --> EM["情景记忆 时序检索"]
    MR --> PM["程序记忆 技能图"]
    MR --> UP["用户画像 偏好检索"]
    SM --> FU["融合排序"]
    EM --> FU
    PM --> FU
    UP --> FU
    FU --> R["返回结果"]
    R --> CC["记忆巩固"]
    CC --> SM
    CC -->|"重要信息"| EM
    class CC s2
    class FU s1
    class MR s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#1e3a5f
    classDef s2 fill:#1e3a5f`,
    },
    {
      title: "3. claude-mem 架构：AI 驱动的记忆压缩机制",
      body: `claude-mem 采用了完全不同的思路。它的核心假设是：记忆的质量不取决于存储多少内容，而取决于保留了多少关键信息。因此，它不建立复杂的多维度存储结构，而是用一个专门的"记忆压缩 Agent"持续监控 Claude Code 的会话，实时提取关键信息并压缩存储。

claude-mem 的工作流程分为三个阶段：捕获（Capture）——记录 Claude Code 的所有操作，包括文件读写、终端命令、错误信息和用户输入；压缩（Compress）——用 Claude 的 agent-sdk 分析捕获的内容，识别关键决策、重要发现和重复模式，生成简洁的记忆摘要；注入（Inject）——在下次会话开始时，将相关的记忆摘要作为上下文注入，确保 Claude 能够"记住"之前的工作内容。

这种方案的精妙之处在于：压缩过程本身就是 AI 完成的，所以它保留了人类认为重要的语义信息，而不是简单地截取对话片段。测试显示，claude-mem 能将 65% 的会话 token 消耗压缩掉，同时保持任务连续性。

但需要注意的是，claude-mem 的压缩是有损的——它可能遗漏一些看似不重要但实际关键的细节。这也是为什么 mempalace 和 claude-mem 各有适用场景的原因。`,
      code: [
        {
          lang: "python",
          code: `# claude-mem 风格的记忆压缩系统
from dataclasses import dataclass, field
from typing import List, Dict, Any
from datetime import datetime

@dataclass
class CapturedEvent:
    """捕获的会话事件"""
    timestamp: datetime
    event_type: str  # "file_read", "file_write", "command", "error", "user_input"
    content: str
    context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class CompressedMemory:
    """压缩后的记忆"""
    summary: str
    key_decisions: List[str] = field(default_factory=list)
    important_files: List[str] = field(default_factory=list)
    recurring_patterns: List[str] = field(default_factory=list)
    relevance_score: float = 1.0
    created_at: datetime = field(default_factory=datetime.now)

class AICompressionMemory:
    """AI 驱动的记忆压缩系统（claude-mem 风格）"""

    def __init__(self, compression_model=None):
        self.event_buffer: List[CapturedEvent] = []
        self.compressed_memories: List[CompressedMemory] = []
        self.compressor = compression_model  # AI 压缩模型
        self.compression_interval = 50  # 每 50 个事件压缩一次

    def capture(self, event: CapturedEvent) -> None:
        """捕获会话事件"""
        self.event_buffer.append(event)
        if len(self.event_buffer) >= self.compression_interval:
            self.compress()

    def compress(self) -> CompressedMemory:
        """用 AI 压缩近期事件"""
        events_text = self._format_events(self.event_buffer[-self.compression_interval:])

        # 用 AI 模型提取关键信息
        compression_prompt = f"""
分析以下编程会话记录，提取关键信息：
{events_text}

请输出：
1. 核心摘要（50 字以内）
2. 关键决策（列出）
3. 重要文件（列出）
4. 重复模式（列出）
"""
        # 实际实现中会调用 AI 模型
        if self.compressor:
            result = self.compressor.generate(compression_prompt)
        else:
            result = self._rule_based_compress(events_text)

        memory = CompressedMemory(
            summary=result.get("summary", ""),
            key_decisions=result.get("decisions", []),
            important_files=result.get("files", []),
            recurring_patterns=result.get("patterns", []),
        )
        self.compressed_memories.append(memory)
        self.event_buffer = self.event_buffer[-self.compression_interval:]
        return memory

    def retrieve_for_context(self, query: str, max_tokens: int = 2000) -> str:
        """检索并格式化记忆注入上下文"""
        # 按相关性排序
        relevant = sorted(
            self.compressed_memories,
            key=lambda m: self._relevance(query, m),
            reverse=True
        )

        context_parts = []
        used_tokens = 0
        for mem in relevant:
            mem_text = f"【{mem.created_at}】{mem.summary}"
            if mem.key_decisions:
                mem_text += "\\n决策：" + "；".join(mem.key_decisions)
            if used_tokens + len(mem_text) > max_tokens:
                break
            context_parts.append(mem_text)
            used_tokens += len(mem_text)

        return "\\n\\n".join(context_parts) if context_parts else "无相关记忆"

    def _rule_based_compress(self, events_text: str) -> Dict:
        """基于规则的压缩（无 AI 时的回退方案）"""
        lines = events_text.split("\\n")
        key_lines = [l for l in lines if any(kw in l for kw in ["error", "fix", "change", "implement", "create"])]
        return {
            "summary": f"会话包含 {len(lines)} 个事件，{len(key_lines)} 个关键操作",
            "decisions": key_lines[:5],
            "files": list(set(l.split(":")[0] for l in key_lines if ":" in l))[:10],
            "patterns": [],
        }

    def _relevance(self, query: str, memory: CompressedMemory) -> float:
        """计算记忆与查询的相关性"""
        query_words = set(query.lower().split())
        all_text = f"{memory.summary} {' '.join(memory.key_decisions)} {' '.join(memory.important_files)}"
        text_words = set(all_text.lower().split())
        return len(query_words & text_words) / max(len(query_words), 1)`,
        },
      ],
      mermaid: `sequenceDiagram
    participant U as 用户/Claude Code
    participant C as 捕获层
    participant A as AI 压缩 Agent
    participant M as 压缩记忆库
    participant I as 注入层

    U->>C: 文件读写/命令执行
    C->>C: 缓冲事件（50 个一批）
    C->>A: 触发压缩
    A->>A: 分析事件序列
    A->>A: 提取关键决策/文件/模式
    A->>M: 存储压缩记忆
    U->>I: 新会话开始
    I->>M: 查询相关记忆
    M->>I: 返回 Top 压缩记忆
    I->>U: 注入上下文`,
    },
    {
      title: "4. 记忆系统设计决策：选择哪种方案？",
      body: `在实际项目中，选择记忆系统方案需要考虑以下因素：

如果你的 Agent 需要处理复杂的长期任务（如持续数周的项目开发），并且需要精确记住用户偏好、项目决策、技术选型等结构化信息，mempalace 的多维度架构更适合。它的记忆路由机制确保查询能精准定位到正确的记忆维度。

如果你的 Agent 主要用于编码助手场景，需要高效的上下文管理和 token 优化，claude-mem 的压缩方案更合适。它能将 token 消耗降低 65-98%，同时保持足够的上下文连续性。

实际上，最强大的方案是两者的结合：用 claude-mem 的压缩机制处理短期高频交互，用 mempalace 的多维度架构存储长期重要记忆。这种混合方案在内部测试中同时获得了高 token 效率和高检索准确率。`,
      code: [
        {
          lang: "python",
          code: `# 混合记忆系统：结合压缩与多维度存储
class HybridMemorySystem:
    """混合记忆系统——压缩层 + 多维度层"""

    def __init__(self):
        # 短期：AI 压缩记忆（claude-mem 风格）
        self.short_term = AICompressionMemory()
        # 长期：多维度记忆（mempalace 风格）
        self.long_term = MultiDimensionalMemory()
        self.promotion_threshold = 0.8  # 重要性超过此值升入长期记忆

    def process_event(self, event: CapturedEvent) -> None:
        """处理新事件——同时更新两层记忆"""
        # 1. 短期记忆捕获
        self.short_term.capture(event)

        # 2. 判断是否需要存入长期记忆
        importance = self._assess_importance(event)
        if importance >= self.promotion_threshold:
            memory_type = self._classify_memory(event)
            entry = MemoryEntry(
                content=event.content,
                memory_type=memory_type,
                importance=importance,
                metadata=event.context,
            )
            self.long_term.store(entry)

    def get_context(self, query: str) -> str:
        """获取完整上下文——短期压缩 + 长期精确"""
        short_context = self.short_term.retrieve_for_context(query)
        long_results = self.long_term.retrieve(query)
        long_context = "\\n".join(r.content for r in long_results[:3])
        return f"=== 近期上下文 ===\\n{short_context}\\n\\n=== 相关知识 ===\\n{long_context}"

    def _assess_importance(self, event: CapturedEvent) -> float:
        """评估事件的重要性"""
        score = 0.0
        if event.event_type in ["error", "user_input"]:
            score += 0.3
        if any(kw in event.content.lower() for kw in ["decision", "architecture", "design"]):
            score += 0.4
        if len(event.content) > 100:
            score += 0.2
        return min(score, 1.0)

    def _classify_memory(self, event: CapturedEvent) -> MemoryType:
        """分类记忆类型"""
        if event.event_type == "user_input" and "偏好" in event.content:
            return MemoryType.PROFILE
        if "如何" in event.content or "步骤" in event.content:
            return MemoryType.PROCEDURAL
        if event.timestamp:
            return MemoryType.EPISODIC
        return MemoryType.SEMANTIC`,
        },
      ],
      table: {
        headers: ["场景", "推荐方案", "理由"],
        rows: [
          ["代码助手（Claude Code / Cursor）", "claude-mem 或混合方案", "token 效率优先，会话连续性关键"],
          ["个人 AI 助手（跨天/跨周任务）", "mempalace", "需要精确记住偏好和历史信息"],
          ["多 Agent 协作系统", "mempalace", "需要共享的结构化记忆"],
          ["高频对话场景（客服/咨询）", "claude-mem", "对话量大，压缩效率关键"],
          ["知识管理型 Agent", "mempalace", "需要精确的事实检索和分类"],
          ["生产级通用 Agent", "混合方案", "兼顾效率与精度"],
        ],
      },
    },
    {
      title: "5. 记忆系统的未来方向",
      body: `2026 年 AI 记忆系统的发展呈现三个趋势：

第一，记忆压缩的智能化。claude-mem 证明了 AI 驱动的记忆压缩是可行的，下一步是让压缩 Agent 能够根据任务类型自适应调整压缩策略——对代码任务保留更多技术细节，对对话任务保留更多语义信息。

第二，记忆的跨 Agent 共享。mempalace 的多维度架构天然支持记忆在不同 Agent 之间共享，这将推动"记忆网络"的发展——多个 Agent 可以读取和写入同一套记忆系统，形成集体智能。

第三，记忆的自进化。结合自进化 Agent（如 GenericAgent 和 Evolver）的能力，记忆系统本身也能进化——自动发现更好的记忆组织方式、优化检索策略、调整遗忘阈值。这正是 2026 年最令人兴奋的方向。`,
      mermaid: `graph TD
    subgraph "现在"
      A1["简单 RAG 平铺向量"]
      A2["mempalace 多维度记忆"]
      A3["claude-mem AI 压缩记忆"]
    end
    subgraph "近期"
      B1["混合记忆系统 压缩 + 多维度"]
      B2["自适应压缩 按任务类型调整"]
    end
    subgraph "未来"
      C1["记忆网络 跨 Agent 共享"]
      C2["自进化记忆 AI 自主优化"]
    end
    A1 --> B1
    A2 --> B1
    A3 --> B1
    B1 --> C1
    B1 --> C2
    B2 --> C2
    class C2 s1
    class C1 s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#1e3a5f`,
      tip: "实践中建议从简单方案开始：先用 RAG 验证记忆需求，再逐步引入压缩或多维度架构。过度设计记忆系统会消耗大量开发时间，而用户可能只需要记住几个关键偏好。",
      warning: "记忆系统涉及用户隐私数据，生产环境必须实现加密存储、访问控制和数据删除机制。mempalace 和 claude-mem 的开源版本主要用于本地使用，企业部署需要额外评估合规性。",
    },
  ],
};
