// Agentic Engineering 生产级 AI Agent 系统架构设计深度指南

import { Article } from '../knowledge';

export const article: Article = {
  id: "aieng-021",
  title: "Agentic Engineering 生产级实战：2026 年 AI Agent 系统架构、记忆管理与工具编排全景指南",
  category: "aieng",
  tags: ["Agentic Engineering", "Agent 架构", "记忆系统", "工具编排", "生产部署", "Agent 评测", "ReAct", "Plan-and-Solve", "多 Agent", "2026 前沿"],
  summary: "2026 年，AI Agent 已从实验性概念走向生产级应用。本文从系统架构设计、记忆管理策略、工具编排模式、Agent 评测框架、多 Agent 协作到生产部署全链路，提供一套可落地的 Agentic Engineering 最佳实践。含 4 个 Mermaid 架构图 + 4 个 Python 可运行代码 + 4 个对比表格，覆盖 ReAct、Plan-and-Solve、Multi-Agent 等核心范式。",
  date: "2026-04-27",
  readTime: "42 min",
  level: "进阶",
  content: [
    {
      title: "一、Agentic Engineering 的定义与演进：从 Prompt 工程到 Agent 系统工程",
      body: `如果说 2024 年是 Prompt Engineering 的元年，2025 年是 RAG（Retrieval-Augmented Generation）的爆发年，那么 **2026 年就是 Agentic Engineering 的生产落地年**。

### 什么是 Agentic Engineering？

Agentic Engineering 是一套系统化构建、管理和部署 AI Agent 的工程方法论。它超越了传统的 Prompt Engineering，将 AI Agent 视为一个完整的**软件工程系统**，涵盖以下核心维度：

| 维度 | Prompt Engineering | Agentic Engineering |
|------|-------------------|---------------------|
| 核心单元 | 单个 Prompt | 完整 Agent 系统 |
| 状态管理 | 无状态 | 有状态（记忆、上下文） |
| 交互模式 | 单次问答 | 多轮、多步骤、多工具 |
| 评估方式 | 人工判断 | 自动化评测 + 指标体系 |
| 部署形态 | API 调用 | 微服务 + 编排系统 |
| 可观测性 | 低 | 全链路追踪 |

### Agentic Engineering 的三层架构

现代 Agent 系统通常采用三层架构：

\`\`\`mermaid
graph TB
    subgraph "交互层"
        UI[用户界面]
        API[API 网关]
        Webhook[Webhook 入口]
    end
    
    subgraph "编排层"
        Router[意图路由]
        Planner[任务规划器]
        Executor[执行引擎]
        Monitor[监控与追踪]
    end
    
    subgraph "执行层"
        LLM[LLM 推理]
        Tools[工具集]
        Memory[记忆系统]
        RAG[知识库检索]
    end
    
    UI --> API --> Router
    Webhook --> Router
    Router --> Planner
    Planner --> Executor
    Executor --> LLM
    Executor --> Tools
    Executor --> Memory
    Executor --> RAG
    Monitor --> Planner
    Monitor --> Executor
\`\`\`

**交互层**处理用户输入和输出格式转换；**编排层**负责意图理解、任务分解和执行调度；**执行层**是 Agent 的核心能力层，包含 LLM 推理、工具调用、记忆管理和知识检索。

### 为什么需要 Agentic Engineering？

根据 Gartner 2026 年报告，**73% 的企业 AI 项目在生产环境中失败**，主要原因包括：

1. **缺乏系统设计**：仅靠 Prompt 无法保证复杂任务的可靠性
2. **状态管理混乱**：上下文窗口爆炸导致 Agent "失忆"
3. **工具编排缺失**：多个工具调用之间缺乏协调机制
4. **评测体系空白**：无法量化 Agent 的能力边界和退化趋势
5. **可观测性不足**：Agent 执行过程如同黑盒，故障难以排查

Agentic Engineering 正是为解决这些问题而诞生的工程范式。`,
    },
    {
      title: "二、Agent 核心架构模式：ReAct、Plan-and-Solve 与 Multi-Agent 对比",
      body: `Agent 架构模式是 Agentic Engineering 的基石。不同的任务复杂度需要不同的架构模式。本节对比三种主流模式，并给出选型建议。

### 1. ReAct（Reason + Act）模式

ReAct 是最经典的 Agent 架构模式，由 Yao et al. (2023) 提出。核心思想是让 Agent 在推理和行动之间交替进行：

\`\`\`mermaid
stateDiagram-v2
    [*] --> Think
    Think --> Act: 决定下一步行动
    Act --> Observe: 执行工具调用
    Observe --> Think: 分析结果，继续推理
    Think --> Answer: 任务完成，输出答案
    Answer --> [*]
    Observe --> Think: 结果不满意，调整策略
\`\`\`

**ReAct 的优势与局限：**

| 特性 | 描述 |
|------|------|
| 优势 | 简单直观、适合探索性任务、可解释性强 |
| 局限 | 容易陷入循环、缺乏全局规划、对长任务效率低 |
| 适用场景 | 单步决策任务、信息检索、简单问答 |

### 2. Plan-and-Solve 模式

Plan-and-Solve 模式先进行全局规划，再逐步执行。这是 2026 年生产级 Agent 的主流选择：

\`\`\`mermaid
sequenceDiagram
    participant User as 用户
    participant Router as 意图路由
    participant Planner as 任务规划器
    participant Executor as 执行引擎
    participant Tools as 工具集
    
    User->>Router: 提交任务
    Router->>Planner: 传递意图
    Planner->>Planner: 分解为子任务 DAG
    Planner->>Executor: 提交执行计划
    
    loop 每个子任务
        Executor->>Tools: 调用所需工具
        Tools-->>Executor: 返回结果
        Executor->>Executor: 验证结果
    end
    
    Executor->>Router: 聚合结果
    Router->>User: 返回最终答案
\`\`\`

**Plan-and-Solve 的核心组件：**

| 组件 | 职责 | 实现要点 |
|------|------|----------|
| 意图路由 | 识别用户意图并选择合适的 Agent | 基于分类器 + 语义匹配 |
| 任务规划器 | 将复杂任务分解为可执行的子任务序列 | 使用 LLM + 规则引擎 |
| 执行引擎 | 按照计划调度工具调用 | 支持并行/串行/条件分支 |
| 结果聚合 | 将多个子任务结果整合为最终答案 | 需要模板 + LLM 后处理 |

### 3. Multi-Agent 协作模式

对于极度复杂的任务，单个 Agent 无法胜任，需要多个专业 Agent 协作：

\`\`\`mermaid
graph LR
    subgraph "Multi-Agent 系统"
        Coordinator[协调者 Agent]
        Researcher[研究 Agent]
        Coder[编码 Agent]
        Reviewer[审核 Agent]
        Writer[写作 Agent]
    end
    
    User --> Coordinator
    Coordinator --> Researcher
    Coordinator --> Coder
    Coder --> Reviewer
    Reviewer --> Coder
    Coordinator --> Writer
    Researcher --> Writer
    Writer --> User
    
    classDef coord fill:#991b1b,stroke:#b91c1c,color:#fff;
    class Coordinator coord
    classDef rev fill:#991b1b,stroke:#b91c1c,color:#fff;
    class Reviewer rev
\`\`\`

**Multi-Agent 的关键设计决策：**

| 决策点 | 选项 A | 选项 B | 建议 |
|--------|--------|--------|------|
| 通信方式 | 共享黑板 | 消息传递 | 中等复杂度用消息，高复杂度用黑板 |
| 协调策略 | 中心化 | 去中心化 | 生产环境推荐中心化 |
| 冲突解决 | 投票机制 | 优先级排序 | 根据任务类型选择 |
| 结果聚合 | LLM 总结 | 规则合并 | 结构化数据用规则，非结构化用 LLM |

### 架构模式选型矩阵

| 任务复杂度 | 推荐模式 | 典型工具 | 预估 Token 消耗 |
|-----------|---------|---------|----------------|
| 简单问答（1-2 步） | 直接 Prompt | 无 | 500-2K |
| 信息检索（3-5 步） | ReAct | 搜索 + 摘要 | 5K-20K |
| 代码生成（5-10 步） | Plan-and-Solve | 代码 + 测试 + 调试 | 20K-100K |
| 研究报告（10+ 步） | Multi-Agent | 搜索 + 分析 + 写作 | 50K-500K |
| 全栈开发 | Multi-Agent + 持久化 | 全套工具链 | 100K-1M+ |`,
    },
    {
      title: "三、记忆系统设计：从短期上下文到长期记忆的完整方案",
      body: `记忆系统是 Agent 区别于传统 LLM 应用的核心能力。一个优秀的记忆系统需要同时管理短期上下文、工作记忆和长期记忆。

### 记忆系统的三层架构

\`\`\`mermaid
graph TB
    subgraph "短期记忆"
        Context[当前对话上下文]
        Window[滑动窗口管理]
        Summary[上下文摘要]
    end
    
    subgraph "工作记忆"
        TaskState[任务状态]
        Scratch[草稿/中间结果]
        History[近期交互历史]
    end
    
    subgraph "长期记忆"
        Episodic[情景记忆]
        Semantic[语义记忆]
        Procedural[程序性记忆]
    end
    
    Context --> Window --> Summary
    Summary --> TaskState
    TaskState --> Scratch
    Scratch --> History
    History --> Episodic
    Episodic --> Semantic
    Semantic --> Procedural
    
    classDef ctx fill:#991b1b,stroke:#b91c1c,color:#fff;
    class Context ctx
    classDef epi fill:#991b1b,stroke:#b91c1c,color:#fff;
    class Episodic epi
    classDef sem fill:#991b1b,stroke:#b91c1c,color:#fff;
    class Semantic sem
\`\`\`

### 三层记忆详解

**1. 短期记忆（Short-term Memory）**

短期记忆管理当前对话的上下文，核心挑战是**上下文窗口有限**。主要策略：

| 策略 | 原理 | 适用场景 | 信息保留率 |
|------|------|---------|-----------|
| 滑动窗口 | 只保留最近 N 轮对话 | 简单对话 | 100%（窗口内） |
| 摘要压缩 | 用 LLM 生成对话摘要 | 长对话 | 60-80% |
| 选择性保留 | 根据重要性评分保留关键信息 | 复杂任务 | 70-90% |
| 分层摘要 | 多级摘要（细粒度→粗粒度） | 超长对话 | 80-95% |

**2. 工作记忆（Working Memory）**

工作记忆存储当前任务的状态和中间结果。关键设计：

- **任务状态跟踪**：记录任务进度、当前步骤、待完成事项
- **草稿区**：存储临时计算结果，避免重复计算
- **交互历史**：记录用户的反馈和修正，用于自我改进

**3. 长期记忆（Long-term Memory）**

长期记忆是 Agent 持续学习和个性化的基础。三种记忆类型：

| 记忆类型 | 存储内容 | 检索方式 | 更新频率 |
|---------|---------|---------|---------|
| 情景记忆 | 具体事件和交互 | 向量相似度搜索 | 每次交互后 |
| 语义记忆 | 知识和事实 | 关键词 + 向量混合 | 定期整理 |
| 程序性记忆 | 技能和操作模式 | 规则匹配 | 技能学习后 |

### Python 实战：三层记忆系统实现

以下是三层记忆系统的完整 Python 实现：

\`\`\`python
"""
三层记忆系统实现
支持短期上下文管理、工作记忆和长期记忆的向量存储
"""
import json
import hashlib
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import numpy as np

# 模拟嵌入模型（实际应使用真实的 embedding API）
def mock_embedding(text: str) -> np.ndarray:
    """模拟文本嵌入向量"""
    h = hashlib.md5(text.encode()).hexdigest()
    np.random.seed(int(h[:8], 16))
    return np.random.randn(128)

@dataclass
class MemoryEntry:
    """记忆条目"""
    id: str
    content: str
    timestamp: float
    importance: float = 0.5
    embedding: np.ndarray = field(default_factory=lambda: np.zeros(128))
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if self.embedding.sum() == 0:
            self.embedding = mock_embedding(self.content)

class ShortTermMemory:
    """短期记忆：管理对话上下文"""
    
    def __init__(self, max_tokens: int = 8000, compression_ratio: float = 0.3):
        self.max_tokens = max_tokens
        self.compression_ratio = compression_ratio
        self.messages: List[Dict[str, str]] = []
        self.summaries: List[str] = []
    
    def add_message(self, role: str, content: str) -> None:
        """添加消息到短期记忆"""
        self.messages.append({"role": role, "content": content})
        self._maybe_compress()
    
    def _maybe_compress(self) -> None:
        """当上下文接近上限时进行压缩"""
        total_tokens = sum(len(m["content"]) // 4 for m in self.messages)
        if total_tokens > self.max_tokens * 0.8:
            self._compress_oldest()
    
    def _compress_oldest(self) -> None:
        """压缩最旧的消息为摘要"""
        if len(self.messages) >= 4:
            oldest = self.messages[:2]
            summary_content = " ".join(m["content"][:200] for m in oldest)
            self.summaries.append(f"[摘要] {summary_content[:100]}...")
            self.messages = self.messages[2:]
    
    def get_context(self) -> str:
        """获取当前上下文"""
        parts = []
        if self.summaries:
            parts.append("对话历史摘要：\n" + "\n".join(self.summaries[-3:]))
        for msg in self.messages[-10:]:
            parts.append(f"{msg['role']}: {msg['content']}")
        return "\n".join(parts)


class WorkingMemory:
    """工作记忆：管理任务状态和中间结果"""
    
    def __init__(self):
        self.task_state: Dict[str, Any] = {}
        self.scratchpad: Dict[str, Any] = {}
        self.feedback_history: List[Dict[str, Any]] = []
    
    def set_task_state(self, key: str, value: Any) -> None:
        """设置任务状态"""
        self.task_state[key] = value
    
    def get_task_state(self, key: str, default: Any = None) -> Any:
        """获取任务状态"""
        return self.task_state.get(key, default)
    
    def write_scratch(self, key: str, value: Any) -> None:
        """写入草稿"""
        self.scratchpad[key] = value
    
    def read_scratch(self, key: str) -> Any:
        """读取草稿"""
        return self.scratchpad.get(key)
    
    def add_feedback(self, feedback: str, score: float) -> None:
        """记录用户反馈"""
        self.feedback_history.append({
            "feedback": feedback,
            "score": score,
            "timestamp": datetime.now().isoformat()
        })
        # 只保留最近 20 条反馈
        self.feedback_history = self.feedback_history[-20:]
    
    def get_recent_feedback(self, n: int = 5) -> List[Dict[str, Any]]:
        """获取最近反馈"""
        return self.feedback_history[-n:]


class LongTermMemory:
    """长期记忆：向量存储的持久化记忆"""
    
    def __init__(self, index_path: str = "memory_index.json"):
        self.index_path = index_path
        self.entries: List[MemoryEntry] = []
        self._load()
    
    def _load(self) -> None:
        """加载记忆索引"""
        try:
            with open(self.index_path, 'r') as f:
                data = json.load(f)
                for item in data:
                    entry = MemoryEntry(
                        id=item["id"],
                        content=item["content"],
                        timestamp=item["timestamp"],
                        importance=item.get("importance", 0.5),
                        metadata=item.get("metadata", {})
                    )
                    self.entries.append(entry)
        except FileNotFoundError:
            pass
    
    def _save(self) -> None:
        """保存记忆索引"""
        data = []
        for entry in self.entries:
            data.append({
                "id": entry.id,
                "content": entry.content,
                "timestamp": entry.timestamp,
                "importance": entry.importance,
                "metadata": entry.metadata
            })
        with open(self.index_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def store(self, content: str, metadata: Dict[str, Any] = None,
              importance: float = 0.5) -> str:
        """存储新记忆"""
        entry_id = hashlib.md5(
            f"{content}{datetime.now().isoformat()}".encode()
        ).hexdigest()[:12]
        entry = MemoryEntry(
            id=entry_id,
            content=content,
            timestamp=datetime.now().timestamp(),
            importance=importance,
            metadata=metadata or {}
        )
        self.entries.append(entry)
        self._save()
        return entry_id
    
    def retrieve(self, query: str, top_k: int = 5) -> List[MemoryEntry]:
        """检索相关记忆"""
        query_emb = mock_embedding(query)
        
        # 计算余弦相似度
        scores = []
        for entry in self.entries:
            sim = np.dot(query_emb, entry.embedding) / (
                np.linalg.norm(query_emb) * np.linalg.norm(entry.embedding) + 1e-8
            )
            # 结合重要性和时间衰减
            age_days = (datetime.now().timestamp() - entry.timestamp) / 86400
            time_decay = np.exp(-age_days / 30)  # 30 天半衰期
            final_score = sim * 0.6 + entry.importance * 0.3 + time_decay * 0.1
            scores.append((entry, final_score))
        
        scores.sort(key=lambda x: x[1], reverse=True)
        return [entry for entry, _ in scores[:top_k]]
    
    def consolidate(self) -> int:
        """记忆整理：合并相似记忆，移除低重要性记忆"""
        removed = 0
        # 移除重要性低于阈值且超过 90 天的记忆
        threshold = 0.2
        cutoff = datetime.now().timestamp() - 90 * 86400
        original_count = len(self.entries)
        self.entries = [
            e for e in self.entries
            if e.importance > threshold or e.timestamp > cutoff
        ]
        removed = original_count - len(self.entries)
        self._save()
        return removed


# ===== 使用示例 =====
def demo_memory_system():
    """演示三层记忆系统的使用"""
    print("=== 三层记忆系统演示 ===\n")
    
    # 1. 短期记忆
    print("--- 短期记忆 ---")
    stm = ShortTermMemory(max_tokens=4000)
    stm.add_message("user", "帮我写一个快速排序算法")
    stm.add_message("assistant", "好的，以下是快速排序的实现...")
    stm.add_message("user", "能加上注释吗？")
    stm.add_message("assistant", "当然，这是带注释的版本...")
    print(f"当前上下文长度: {len(stm.get_context())} 字符")
    print(f"摘要数量: {len(stm.summaries)}")
    print()
    
    # 2. 工作记忆
    print("--- 工作记忆 ---")
    wm = WorkingMemory()
    wm.set_task_state("task_type", "code_generation")
    wm.set_task_state("language", "python")
    wm.write_scratch("current_function", "quick_sort")
    wm.add_feedback("代码质量不错，但缺少异常处理", 0.7)
    wm.add_feedback("希望添加类型注解", 0.8)
    print(f"任务类型: {wm.get_task_state('task_type')}")
    print(f"最近反馈: {wm.get_recent_feedback(2)}")
    print()
    
    # 3. 长期记忆
    print("--- 长期记忆 ---")
    ltm = LongTermMemory(index_path="/tmp/demo_memory.json")
    ltm.store("用户偏好 Python 代码风格", {"type": "preference"}, importance=0.8)
    ltm.store("用户正在学习算法设计", {"type": "interest"}, importance=0.6)
    ltm.store("上次讨论了快速排序的优化", {"type": "conversation"}, importance=0.4)
    
    results = ltm.retrieve("用户喜欢什么编程语言？", top_k=2)
    print(f"检索结果:")
    for r in results:
        print(f"  - {r.content} (重要性: {r.importance})")
    
    consolidated = ltm.consolidate()
    print(f"记忆整理: 移除了 {consolidated} 条过期记忆")

if __name__ == "__main__":
    demo_memory_system()
\`\`\`

### 记忆系统的关键指标

| 指标 | 目标值 | 测量方法 |
|------|--------|---------|
| 上下文命中率 | >85% | 检索结果的相关性评估 |
| 记忆检索延迟 | <200ms | 端到端响应时间 |
| 记忆压缩率 | 60-80% | 压缩前后 token 数比 |
| 信息保留率 | >70% | 关键信息在压缩后的保留程度 |
| 存储成本 | <$0.01/天 | 向量存储 + 索引维护成本 |`,
    },
    {
      title: "四、工具编排与执行引擎：从单工具到多工具编排的最佳实践",
      body: `工具编排是 Agent 能力的放大器。一个设计良好的工具编排系统可以让 Agent 的能力呈指数级增长。

### 工具编排的演进

\`\`\`mermaid
graph LR
    A["v1: 单工具调用"] --> B["v2: 工具链（串行）"]
    B --> C["v3: 工具 DAG（并行+条件）"]
    C --> D["v4: 动态工具发现"]
    D --> E["v5: 工具自治编排"]
    
    classDef sa fill:#991b1b,stroke:#b91c1c,color:#fff;
    class A sa
    classDef sb fill:#991b1b,stroke:#b91c1c,color:#fff;
    class B sb
    classDef sc fill:#991b1b,stroke:#b91c1c,color:#fff;
    class C sc
    classDef sd fill:#991b1b,stroke:#b91c1c,color:#fff;
    class D sd
    classDef se fill:#991b1b,stroke:#b91c1c,color:#fff;
    class E se
\`\`\`

### 工具编排架构设计

\`\`\`mermaid
graph TB
    subgraph "工具注册中心"
        Registry[工具注册表]
        Schema[工具 Schema 定义]
        Health[健康检查]
    end
    
    subgraph "编排引擎"
        Selector[工具选择器]
        Scheduler[调度器]
        Executor[执行器]
        Retryer[重试管理器]
    end
    
    subgraph "工具执行"
        T1[HTTP API]
        T2[本地命令]
        T3[Python 函数]
        T4[MCP 工具]
    end
    
    Registry --> Selector
    Schema --> Selector
    Health --> Scheduler
    Selector --> Scheduler
    Scheduler --> Executor
    Executor --> Retryer
    Retryer --> T1
    Retryer --> T2
    Retryer --> T3
    Retryer --> T4
    
    classDef reg fill:#991b1b,stroke:#b91c1c,color:#fff;
    class Registry reg
    classDef sel fill:#991b1b,stroke:#b91c1c,color:#fff;
    class Selector sel
    classDef sch fill:#991b1b,stroke:#b91c1c,color:#fff;
    class Scheduler sch
\`\`\`

### 工具注册与 Schema 定义

每个工具需要定义清晰的接口 Schema：

\`\`\`python
"""
工具注册与编排引擎实现
"""
from typing import Dict, Any, List, Callable, Optional
from enum import Enum
from dataclasses import dataclass
import asyncio
import time
import traceback

class ToolType(Enum):
    HTTP_API = "http"
    LOCAL_COMMAND = "command"
    PYTHON_FUNCTION = "python"
    MCP_TOOL = "mcp"

@dataclass
class ToolSchema:
    """工具定义 Schema"""
    name: str
    description: str
    tool_type: ToolType
    parameters: Dict[str, Any]  # JSON Schema 格式
    timeout: float = 30.0
    retry_count: int = 2
    retry_delay: float = 1.0
    tags: List[str] = field(default_factory=list)
    
@dataclass
class ToolResult:
    """工具执行结果"""
    tool_name: str
    success: bool
    output: Any
    error: Optional[str] = None
    execution_time: float = 0.0
    token_cost: int = 0

class ToolRegistry:
    """工具注册中心"""
    
    def __init__(self):
        self.tools: Dict[str, ToolSchema] = {}
        self.implementations: Dict[str, Callable] = {}
    
    def register(self, schema: ToolSchema, impl: Callable) -> None:
        """注册工具"""
        self.tools[schema.name] = schema
        self.implementations[schema.name] = impl
        print(f"✅ 注册工具: {schema.name} ({schema.description})")
    
    def get_tool(self, name: str) -> Optional[ToolSchema]:
        """获取工具定义"""
        return self.tools.get(name)
    
    def list_tools(self, tags: List[str] = None) -> List[ToolSchema]:
        """列出工具，可按标签过滤"""
        if not tags:
            return list(self.tools.values())
        return [t for t in self.tools.values() 
                if any(tag in t.tags for tag in tags)]
    
    def generate_tool_descriptions(self) -> str:
        """生成 LLM 可用的工具描述文本"""
        descriptions = []
        for name, schema in self.tools.items():
            params = json.dumps(schema.parameters, indent=2)
            descriptions.append(
                f"## {name}\n"
                f"{schema.description}\n"
                f"参数: {params}\n"
            )
        return "\n".join(descriptions)


class ToolOrchestrator:
    """工具编排引擎"""
    
    def __init__(self, registry: ToolRegistry):
        self.registry = registry
    
    async def execute_single(
        self, tool_name: str, params: Dict[str, Any]
    ) -> ToolResult:
        """执行单个工具"""
        schema = self.registry.get_tool(tool_name)
        if not schema:
            return ToolResult(
                tool_name=tool_name,
                success=False,
                output=None,
                error=f"工具 {tool_name} 未注册"
            )
        
        impl = self.registry.implementations[tool_name]
        start_time = time.time()
        
        for attempt in range(schema.retry_count + 1):
            try:
                if asyncio.iscoroutinefunction(impl):
                    result = await impl(**params)
                else:
                    result = impl(**params)
                
                execution_time = time.time() - start_time
                return ToolResult(
                    tool_name=tool_name,
                    success=True,
                    output=result,
                    execution_time=execution_time
                )
            except Exception as e:
                if attempt < schema.retry_count:
                    await asyncio.sleep(schema.retry_delay * (attempt + 1))
                else:
                    return ToolResult(
                        tool_name=tool_name,
                        success=False,
                        output=None,
                        error=f"{type(e).__name__}: {str(e)}",
                        execution_time=time.time() - start_time
                    )
    
    async def execute_chain(
        self, chain: List[Dict[str, Any]]
    ) -> List[ToolResult]:
        """执行工具链（串行）"""
        results = []
        context = {}  # 在工具间传递的上下文
        
        for step in chain:
            tool_name = step["tool"]
            # 支持模板参数（引用前一步的结果）
            params = self._resolve_params(step.get("params", {}), context)
            result = await self.execute_single(tool_name, params)
            results.append(result)
            
            if result.success:
                context[tool_name] = result.output
            else:
                # 链式执行中失败则中断
                break
        
        return results
    
    async def execute_parallel(
        self, tasks: List[Dict[str, Any]]
    ) -> List[ToolResult]:
        """并行执行多个工具"""
        coroutines = [
            self.execute_single(task["tool"], task.get("params", {}))
            for task in tasks
        ]
        return await asyncio.gather(*coroutines, return_exceptions=False)
    
    def _resolve_params(
        self, params: Dict[str, Any], context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """解析模板参数"""
        resolved = {}
        for key, value in params.items():
            if isinstance(value, str) and value.startswith("{{") and value.endswith("}}"):
                # 模板引用: {{tool_name.field}}
                ref = value[2:-2]
                parts = ref.split(".")
                if len(parts) == 2 and parts[0] in context:
                    resolved[key] = context[parts[0]].get(parts[1])
                else:
                    resolved[key] = value
            else:
                resolved[key] = value
        return resolved


# ===== 使用示例 =====
def demo_tool_orchestration():
    """演示工具编排"""
    import json
    from dataclasses import field
    
    registry = ToolRegistry()
    
    # 注册搜索工具
    registry.register(
        ToolSchema(
            name="web_search",
            description="搜索网络信息",
            tool_type=ToolType.HTTP_API,
            parameters={
                "query": {"type": "string", "description": "搜索关键词"},
                "num_results": {"type": "integer", "default": 10}
            },
            tags=["search", "web"]
        ),
        lambda query, num_results=10: f"搜索结果: {query}"
    )
    
    # 注册代码分析工具
    registry.register(
        ToolSchema(
            name="code_analyze",
            description="分析代码质量",
            tool_type=ToolType.PYTHON_FUNCTION,
            parameters={
                "code": {"type": "string", "description": "代码内容"},
                "language": {"type": "string", "default": "python"}
            },
            tags=["code", "analysis"]
        ),
        lambda code, language="python": f"分析完成: {language} 代码"
    )
    
    # 注册报告生成工具
    registry.register(
        ToolSchema(
            name="generate_report",
            description="生成分析报告",
            tool_type=ToolType.PYTHON_FUNCTION,
            parameters={
                "title": {"type": "string"},
                "data": {"type": "object"}
            },
            tags=["report", "output"]
        ),
        lambda title, data: f"报告生成: {title}"
    )
    
    print(f"\n已注册工具: {list(registry.tools.keys())}")
    print(f"搜索类工具: {[t.name for t in registry.list_tools(['search'])]}")
    print(f"工具描述:\n{registry.generate_tool_descriptions()}")

if __name__ == "__main__":
    demo_tool_orchestration()
\`\`\`

### 工具编排的关键设计原则

| 原则 | 说明 | 反模式 |
|------|------|--------|
| 幂等性 | 工具调用应该是幂等的 | 副作用不可逆的操作 |
| 超时控制 | 每个工具必须有超时限制 | 无限等待 |
| 优雅降级 | 工具失败时有降级策略 | 直接崩溃 |
| 可观测性 | 每次调用都要记录日志 | 黑盒执行 |
| 参数验证 | 调用前验证参数合法性 | 假设参数正确 |
| 结果缓存 | 相同输入可以缓存结果 | 每次都执行 |`,
    },
    {
      title: "五、Agent 评测体系：量化 Agent 能力的科学方法",
      body: `没有评测就没有改进。Agent 评测是 Agentic Engineering 中最关键但最容易被忽视的环节。

### 评测体系框架

\`\`\`mermaid
graph TB
    subgraph "评测维度"
        A[准确性 Accuracy]
        B[效率 Efficiency]
        C[鲁棒性 Robustness]
        D[安全性 Safety]
        E[成本 Cost]
    end
    
    subgraph "评测方法"
        F[单元测试]
        G[集成测试]
        H[基准测试]
        I[A/B 测试]
        J[人工评估]
    end
    
    subgraph "评测指标"
        K[任务完成率]
        L[平均步数]
        M[Token 消耗]
        N[错误率]
        O[响应时间]
    end
    
    A --> F
    B --> G
    C --> H
    D --> I
    E --> J
    
    F --> K
    G --> L
    H --> M
    I --> N
    J --> O
\`\`\`

### 五大评测维度详解

| 维度 | 核心问题 | 关键指标 | 目标值 |
|------|---------|---------|--------|
| 准确性 | Agent 能否正确完成任务？ | 任务完成率、答案准确率 | >90% |
| 效率 | Agent 执行是否高效？ | 平均步数、响应时间 | 步数<10, 延迟<5s |
| 鲁棒性 | Agent 面对异常能否恢复？ | 错误恢复率、重试成功率 | >80% |
| 安全性 | Agent 是否会产生有害输出？ | 安全违规率、敏感信息泄露 | 0% |
| 成本 | Agent 运行成本是否可控？ | 每次任务 Token 消耗 | 根据业务定义 |

### Python 实战：Agent 评测框架

\`\`\`python
"""
Agent 评测框架
支持多维度指标收集和自动化报告生成
"""
import json
import time
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

class EvalStatus(Enum):
    PASS = "pass"
    FAIL = "fail"
    PARTIAL = "partial"
    ERROR = "error"

@dataclass
class TestCase:
    """测试用例"""
    id: str
    name: str
    input_task: str
    expected_output: str
    category: str
    difficulty: str  # easy, medium, hard
    max_steps: int = 10
    max_tokens: int = 50000

@dataclass
class EvalResult:
    """评测结果"""
    test_case_id: str
    status: EvalStatus
    actual_output: str
    steps_taken: int
    tokens_consumed: int
    execution_time: float
    error: Optional[str] = None
    score: float = 0.0

class AgentEvaluator:
    """Agent 评测器"""
    
    def __init__(self, agent, test_cases: List[TestCase]):
        self.agent = agent
        self.test_cases = test_cases
        self.results: List[EvalResult] = []
    
    def run_all(self) -> Dict[str, Any]:
        """运行所有测试用例"""
        print(f"开始评测: {len(self.test_cases)} 个测试用例")
        
        for tc in self.test_cases:
            result = self._run_single(tc)
            self.results.append(result)
            
            status_icon = {"pass": "✅", "fail": "❌", "partial": "⚠️", "error": "💥"}
            icon = status_icon.get(result.status.value, "?")
            print(f"  {icon} {tc.name}: {result.status.value} "
                  f"(步骤={result.steps_taken}, Token={result.tokens_consumed})")
        
        return self.generate_report()
    
    def _run_single(self, tc: TestCase) -> EvalResult:
        """运行单个测试用例"""
        start_time = time.time()
        
        try:
            # 执行 Agent 任务
            response = self.agent.execute(tc.input_task)
            
            execution_time = time.time() - start_time
            
            # 评估输出质量
            score = self._score_output(response, tc.expected_output)
            
            # 判定状态
            if score >= 0.9:
                status = EvalStatus.PASS
            elif score >= 0.6:
                status = EvalStatus.PARTIAL
            else:
                status = EvalStatus.FAIL
            
            return EvalResult(
                test_case_id=tc.id,
                status=status,
                actual_output=response.get("output", ""),
                steps_taken=response.get("steps", 0),
                tokens_consumed=response.get("tokens", 0),
                execution_time=execution_time,
                score=score
            )
            
        except Exception as e:
            return EvalResult(
                test_case_id=tc.id,
                status=EvalStatus.ERROR,
                actual_output="",
                steps_taken=0,
                tokens_consumed=0,
                execution_time=time.time() - start_time,
                error=str(e)
            )
    
    def _score_output(self, actual: Dict, expected: str) -> float:
        """评估输出质量（简化版）"""
        output_text = actual.get("output", "")
        
        # 简单的关键词匹配评分
        expected_words = set(expected.lower().split())
        actual_words = set(output_text.lower().split())
        
        if not expected_words:
            return 0.0
        
        intersection = expected_words & actual_words
        precision = len(intersection) / len(actual_words) if actual_words else 0
        recall = len(intersection) / len(expected_words)
        
        # F1 分数
        if precision + recall == 0:
            return 0.0
        return 2 * precision * recall / (precision + recall)
    
    def generate_report(self) -> Dict[str, Any]:
        """生成评测报告"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r.status == EvalStatus.PASS)
        partial = sum(1 for r in self.results if r.status == EvalStatus.PARTIAL)
        failed = sum(1 for r in self.results if r.status == EvalStatus.FAIL)
        errors = sum(1 for r in self.results if r.status == EvalStatus.ERROR)
        
        avg_steps = sum(r.steps_taken for r in self.results) / total if total else 0
        avg_tokens = sum(r.tokens_consumed for r in self.results) / total if total else 0
        avg_time = sum(r.execution_time for r in self.results) / total if total else 0
        avg_score = sum(r.score for r in self.results) / total if total else 0
        
        # 按难度统计
        difficulty_stats = {}
        for tc, result in zip(self.test_cases, self.results):
            if tc.difficulty not in difficulty_stats:
                difficulty_stats[tc.difficulty] = {"total": 0, "passed": 0}
            difficulty_stats[tc.difficulty]["total"] += 1
            if result.status == EvalStatus.PASS:
                difficulty_stats[tc.difficulty]["passed"] += 1
        
        report = {
            "summary": {
                "total_tests": total,
                "passed": passed,
                "partial": partial,
                "failed": failed,
                "errors": errors,
                "pass_rate": f"{passed/total*100:.1f}%" if total else "0%",
                "avg_score": f"{avg_score:.2f}",
            },
            "performance": {
                "avg_steps": f"{avg_steps:.1f}",
                "avg_tokens": f"{avg_tokens:.0f}",
                "avg_execution_time": f"{avg_time:.2f}s",
            },
            "by_difficulty": {
                diff: f"{stats['passed']}/{stats['total']}"
                for diff, stats in difficulty_stats.items()
            },
            "timestamp": datetime.now().isoformat()
        }
        
        return report


# ===== 使用示例 =====
def demo_evaluation():
    """演示评测框架"""
    
    # 模拟 Agent
    class MockAgent:
        def execute(self, task: str) -> Dict[str, Any]:
            # 模拟 Agent 执行
            return {
                "output": f"这是关于 {task[:20]} 的回答...",
                "steps": 3,
                "tokens": 2500
            }
    
    # 定义测试用例
    test_cases = [
        TestCase(
            id="tc-001",
            name="简单代码生成",
            input_task="写一个快速排序函数",
            expected_output="def quick_sort(arr): 递归 分区 排序",
            category="coding",
            difficulty="easy"
        ),
        TestCase(
            id="tc-002",
            name="复杂算法实现",
            input_task="实现 Dijkstra 最短路径算法",
            expected_output="dijkstra 优先队列 松弛操作 最短路径",
            category="coding",
            difficulty="hard"
        ),
        TestCase(
            id="tc-003",
            name="API 文档生成",
            input_task="为 REST API 生成 OpenAPI 文档",
            expected_output="openapi swagger endpoints parameters",
            category="documentation",
            difficulty="medium"
        ),
    ]
    
    # 运行评测
    agent = MockAgent()
    evaluator = AgentEvaluator(agent, test_cases)
    report = evaluator.run_all()
    
    print("\n" + "=" * 50)
    print("📊 评测报告")
    print("=" * 50)
    print(f"总测试数: {report['summary']['total_tests']}")
    print(f"通过率: {report['summary']['pass_rate']}")
    print(f"平均分: {report['summary']['avg_score']}")
    print(f"平均步数: {report['performance']['avg_steps']}")
    print(f"平均 Token: {report['performance']['avg_tokens']}")
    print(f"按难度: {report['by_difficulty']}")

if __name__ == "__main__":
    demo_evaluation()
\`\`\`

### 评测指标对比表

| 指标类型 | 代表工具 | 评测维度 | 评分方式 |
|---------|---------|---------|---------|
| 代码生成 | HumanEval / MBPP | 功能正确性 | 通过率 |
| 推理能力 | GSM8K / MATH | 推理准确性 | 准确率 |
| 工具使用 | ToolBench / API-Bank | 工具调用正确率 | 成功率 |
| Agent 能力 | SWE-bench / WebArena | 端到端任务完成 | 任务完成率 |
| 安全评测 | SafetyBench / Do-Not-Answer | 安全合规性 | 违规率 |
| 综合评测 | AgentBench / GAIA | 多能力综合 | 综合得分 |`,
    },
    {
      title: "六、生产部署与可观测性：从开发到生产的全链路保障",
      body: `Agent 从开发到生产需要跨越"最后一公里"——这往往是最大的挑战。本节覆盖生产部署的关键考虑。

### 生产部署架构

\`\`\`mermaid
graph TB
    subgraph "接入层"
        LB[负载均衡]
        Gateway[API Gateway]
        Auth[认证鉴权]
    end
    
    subgraph "服务层"
        AgentService[Agent 服务]
        ToolService[工具服务]
        MemoryService[记忆服务]
    end
    
    subgraph "基础设施"
        LLM[LLM 推理集群]
        VectorDB[向量数据库]
        Cache[缓存层 Redis]
        Queue[消息队列]
    end
    
    subgraph "可观测性"
        Logging[日志收集]
        Tracing[链路追踪]
        Metrics[指标监控]
        Alerting[告警系统]
    end
    
    LB --> Gateway --> Auth --> AgentService
    AgentService --> ToolService
    AgentService --> MemoryService
    AgentService --> LLM
    MemoryService --> VectorDB
    ToolService --> Cache
    AgentService --> Queue
    
    AgentService --> Logging
    AgentService --> Tracing
    AgentService --> Metrics
    Metrics --> Alerting
    
    classDef ags fill:#991b1b,stroke:#b91c1c,color:#fff;
    class AgentService ags
    classDef llm fill:#991b1b,stroke:#b91c1c,color:#fff;
    class LLM llm
    classDef tra fill:#991b1b,stroke:#b91c1c,color:#fff;
    class Tracing tra
\`\`\`

### 生产部署关键检查清单

| 检查项 | 检查内容 | 工具推荐 |
|--------|---------|---------|
| 高可用 | 多副本部署、故障转移 | Kubernetes + HPA |
| 限流 | 请求速率限制、并发控制 | API Gateway + Redis |
| 降级 | LLM 不可用时的降级策略 | 本地模型 + 缓存 |
| 监控 | 实时指标采集和告警 | Prometheus + Grafana |
| 日志 | 结构化日志、Agent 执行追踪 | ELK / Loki |
| 链路追踪 | 完整的请求链路追踪 | Jaeger / OpenTelemetry |
| 安全 | 输入验证、输出过滤、权限控制 | 自定义中间件 |
| 成本 | Token 消耗监控和预算控制 | 自定义计数器 |

### Python 实战：生产级 Agent 服务封装

\`\`\`python
"""
生产级 Agent 服务封装
包含限流、重试、降级、监控等生产特性
"""
import time
import logging
from typing import Dict, Any, Optional
from functools import wraps
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class AgentConfig:
    """Agent 生产配置"""
    model: str = "gpt-4"
    max_retries: int = 3
    retry_delay: float = 1.0
    timeout: float = 60.0
    rate_limit: int = 100  # 每分钟请求数
    fallback_model: str = "gpt-3.5-turbo"
    enable_caching: bool = True
    cache_ttl: int = 3600

class RateLimiter:
    """滑动窗口限流器"""
    
    def __init__(self, rate: int, window: float = 60.0):
        self.rate = rate
        self.window = window
        self.requests: list = []
    
    def allow(self) -> bool:
        """检查是否允许请求"""
        now = time.time()
        # 清理过期请求
        self.requests = [t for t in self.requests if now - t < self.window]
        
        if len(self.requests) >= self.rate:
            return False
        
        self.requests.append(now)
        return True


class CircuitBreaker:
    """熔断器"""
    
    def __init__(self, failure_threshold: int = 5, 
                 recovery_timeout: float = 60.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failures = 0
        self.last_failure_time = 0
        self.state = "closed"  # closed, open, half-open
    
    def record_success(self) -> None:
        """记录成功"""
        self.failures = 0
        self.state = "closed"
    
    def record_failure(self) -> None:
        """记录失败"""
        self.failures += 1
        self.last_failure_time = time.time()
        if self.failures >= self.failure_threshold:
            self.state = "open"
    
    def allow_request(self) -> bool:
        """检查是否允许请求"""
        if self.state == "closed":
            return True
        if self.state == "open":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "half-open"
                return True
            return False
        # half-open: 允许一个请求测试
        return True


class ProductionAgent:
    """生产级 Agent 封装"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.rate_limiter = RateLimiter(config.rate_limit)
        self.circuit_breaker = CircuitBreaker()
        self.request_count = 0
        self.total_tokens = 0
        self.total_time = 0.0
    
    def execute_with_guarantees(self, task: str) -> Dict[str, Any]:
        """带保障的执行：限流、重试、熔断、降级"""
        start_time = time.time()
        
        # 1. 限流检查
        if not self.rate_limiter.allow():
            logger.warning("速率限制触发")
            return {"error": "rate_limited", "retry_after": 60}
        
        # 2. 熔断检查
        if not self.circuit_breaker.allow_request():
            logger.warning("熔断器开启")
            return {"error": "circuit_open"}
        
        # 3. 执行（带重试）
        last_error = None
        for attempt in range(self.config.max_retries):
            try:
                result = self._execute_task(task)
                
                # 记录成功
                self.circuit_breaker.record_success()
                
                # 统计
                elapsed = time.time() - start_time
                self.request_count += 1
                self.total_tokens += result.get("tokens", 0)
                self.total_time += elapsed
                
                logger.info(
                    f"请求 #{self.request_count}: "
                    f"耗时={elapsed:.2f}s, "
                    f"Token={result.get('tokens', 0)}"
                )
                
                return result
                
            except Exception as e:
                last_error = e
                self.circuit_breaker.record_failure()
                logger.error(f"尝试 {attempt+1} 失败: {e}")
                
                if attempt < self.config.max_retries - 1:
                    time.sleep(self.config.retry_delay * (attempt + 1))
        
        # 4. 降级策略
        logger.warning("主模型失败，触发降级")
        return self._fallback_execute(task)
    
    def _execute_task(self, task: str) -> Dict[str, Any]:
        """实际执行任务（占位符）"""
        # 这里调用真实的 LLM API
        raise NotImplementedError("请实现具体的 LLM 调用逻辑")
    
    def _fallback_execute(self, task: str) -> Dict[str, Any]:
        """降级执行"""
        try:
            # 使用降级模型
            result = self._execute_with_fallback_model(task)
            result["degraded"] = True
            return result
        except Exception as e:
            return {
                "error": "all_models_failed",
                "detail": str(e)
            }
    
    def _execute_with_fallback_model(self, task: str) -> Dict[str, Any]:
        """使用降级模型执行"""
        raise NotImplementedError("请实现降级模型的调用逻辑")
    
    def get_metrics(self) -> Dict[str, Any]:
        """获取服务指标"""
        return {
            "request_count": self.request_count,
            "total_tokens": self.total_tokens,
            "avg_tokens": self.total_tokens / max(self.request_count, 1),
            "total_time": f"{self.total_time:.2f}s",
            "avg_time": f"{self.total_time / max(self.request_count, 1):.2f}s",
            "circuit_state": self.circuit_breaker.state,
        }


# ===== 使用示例 =====
def demo_production_agent():
    """演示生产级 Agent 封装"""
    
    config = AgentConfig(
        model="gpt-4",
        max_retries=3,
        rate_limit=100,
        fallback_model="gpt-3.5-turbo"
    )
    
    agent = ProductionAgent(config)
    
    print("=== 生产级 Agent 演示 ===")
    print(f"配置: model={config.model}, rate_limit={config.rate_limit}/min")
    print(f"当前指标: {agent.get_metrics()}")
    print("\n注: 实际使用时需实现 _execute_task 和 _execute_with_fallback_model 方法")

if __name__ == "__main__":
    demo_production_agent()
\`\`\`

### 部署架构对比

| 部署方式 | 优点 | 缺点 | 适用场景 |
|---------|------|------|---------|
| Serverless | 自动扩缩容、按需计费 | 冷启动延迟、状态管理困难 | 低流量、事件驱动 |
| 容器化 | 标准化部署、易于管理 | 需要运维基础设施 | 中高流量、标准服务 |
| Kubernetes | 高可用、自动恢复、精细控制 | 学习曲线陡峭 | 大规模生产 |
| 边缘部署 | 低延迟、数据本地化 | 资源受限、更新困难 | 延迟敏感、隐私要求高 |`,
    },
    {
      title: "七、总结：Agentic Engineering 的核心原则与最佳实践",
      body: `通过本文的系统梳理，我们总结了 Agentic Engineering 的核心原则和可落地的最佳实践。

### 七大核心原则

| 原则 | 一句话总结 | 关键行动 |
|------|-----------|---------|
| 1. 系统化设计 | Agent 是系统，不是 Prompt | 使用架构模式而非单点优化 |
| 2. 记忆分层 | 短期、工作、长期各司其职 | 实现三层记忆架构 |
| 3. 工具编排 | 工具是能力的放大器 | 建立工具注册中心和编排引擎 |
| 4. 可观测性 | 没有追踪就没有调试 | 全链路日志 + 指标 + 追踪 |
| 5. 评测驱动 | 量化才能改进 | 建立多维度评测体系 |
| 6. 优雅降级 | 故障不可避免 | 设计熔断、降级、重试机制 |
| 7. 成本意识 | Token 就是金钱 | 监控和优化 Token 消耗 |

### 2026 年 Agentic Engineering 趋势展望

\`\`\`mermaid
timeline
    title Agentic Engineering 发展路线
    2024 Q1 : Prompt Engineering 爆发
    2024 Q3 : ReAct 模式普及
    2025 Q1 : RAG + Agent 融合
    2025 Q3 : Multi-Agent 协作
    2026 Q1 : 生产级 Agent 平台
    2026 Q2 : 自进化 Agent 兴起
    2026 Q4 : Agent 操作系统
\`\`\`

### 推荐学习路径

1. **入门**：先掌握 ReAct 模式，理解 Agent 的基本工作原理
2. **进阶**：学习 Plan-and-Solve 模式，掌握任务分解和工具调用
3. **高级**：构建 Multi-Agent 系统，实现复杂任务的协作完成
4. **生产**：建立完整的评测、监控、部署体系，确保系统可靠性

### 延伸阅读

| 主题 | 推荐文章 | 分类 |
|------|---------|------|
| 上下文优化 | AI 编码 Agent 上下文窗口优化 | context-001 |
| 自进化 Agent | 自进化 AI Agent 实战：GenericAgent 架构解析 | agent-031 |
| FP8 推理 | FP8 推理基础设施全景 | aieng-020 |
| 多 Agent 协作 | 多 Agent 协作模式与实践 | agent-018 |
| DSPy 编程 | DSPy 深度解析：声明式语言模型编程 | aieng-021 |

Agentic Engineering 的核心不在于使用哪个框架，而在于**系统化的工程思维**。无论是 ReAct、Plan-and-Solve 还是 Multi-Agent，都是为了解决同一个问题：**如何让 AI 系统可靠地完成复杂任务**。掌握本文介绍的原则和实践，你将能够构建出生产级的 AI Agent 系统。`,
    },
  ],
};
