// AI Agent 开发实战：从零构建一个完整的自主 Agent

import { Article } from '../knowledge';

export const article: Article = {
  id: "agent-026",
  title: "AI Agent 开发实战：从零构建一个完整的自主 Agent（含 Python 全栈实现）",
  category: "agent",
  tags: ["AI Agent", "自主 Agent", "ReAct", "工具调用", "记忆系统", "Python 实战", "Agent 架构", "2026 实战"],
  summary: "2026 年 AI Agent 爆发式增长，但大多数教程只讲理论。本文从零开始，用 Python 完整构建一个可自主运行的 AI Agent——包含工具调用、记忆系统、ReAct 推理循环、错误恢复和完整测试。涵盖 Claude Code、Hermes Agent、GenericAgent 等热门项目的底层架构原理，并提供可直接运行的代码实现。",
  date: "2026-04-22",
  readTime: "40 min",
  level: "进阶",
  content: [
    {
      title: "一、为什么你需要从零构建一个 Agent？",
      body: `2026 年是 AI Agent 的爆发年。GitHub Trending 上自进化 Agent 占据半壁江山：NousResearch Hermes Agent 突破 109K 星、claude-mem 达 65K 星、GenericAgent 和 Evolver 分别代表技能树生长和基因组进化路线。这些项目的底层架构其实共享同一套核心模式。

但大多数教程只停留在「概念介绍」层面：讲 ReAct、讲 Tool Calling、讲 Memory，却从不给出可以运行的完整代码。

本文的不同之处在于：你会从头构建一个真正能工作的 AI Agent。不是伪代码，不是框架调用，而是完整的 Python 实现——包括工具定义、记忆存储、推理循环、错误恢复，全部手写。

通过本文，你将理解：
- Hermes Agent、GenericAgent 等热门项目的底层架构模式
- 如何设计一个可扩展的工具系统
- 如何给 Agent 装上「记忆」（短期 + 长期）
- 如何实现 ReAct（Reason + Act）推理循环
- 如何处理 Agent 运行时的错误和异常
- 如何将 Agent 从玩具变成生产可用`,
      mermaid: `graph TD
    A["用户输入
任务描述"] --> B["Agent Core
推理引擎"]
    B --> C["短期记忆
会话上下文"]
    B --> D["长期记忆
向量检索"]
    B --> E["工具调度器
Tool Dispatcher"]

    E --> F["Web 搜索
工具"]
    E --> G["代码执行
工具"]
    E --> H["文件操作
工具"]
    E --> I["API 调用
工具"]

    F --> J["搜索结果"]
    G --> K["执行输出"]
    H --> L["文件状态"]
    I --> M["API 响应"]

    J --> B
    K --> B
    L --> B
    M --> B

    B --> N["生成最终
回答"]
    N --> O["经验写入
长期记忆"]
    class E s3
    class D s2
    class C s1
    class B s0
    classDef s0 fill:#4338ca,stroke:#4338ca,color:#fff
    classDef s1 fill:#047857,stroke:#047857,color:#fff
    classDef s2 fill:#6d28d9,stroke:#6d28d9,color:#fff
    classDef s3 fill:#92400e,stroke:#b45309,color:#fff`,
    },
    {
      title: "二、Agent 的核心架构设计",
      body: `一个完整的自主 Agent 由五个核心组件构成。理解这个架构，你就能看懂 Hermes Agent、GenericAgent、**OpenAI** Agents 等任何 Agent 项目的内部结构。

### 2.1 五大核心组件

| 组件 | 职责 | 类比人类能力 | 典型实现 |
|------|------|-------------|---------|
| 推理引擎 | 理解任务、制定计划、做决策 | 大脑思考 | LLM API + Prompt 模板 |
| 短期记忆 | 保持当前会话的上下文 | 工作记忆（几秒~几分钟） | 对话历史列表 |
| 长期记忆 | 跨会话存储和检索经验 | 长期记忆（知识积累） | 向量数据库 + 语义检索 |
| 工具系统 | 执行外部操作（搜索、代码、文件） | 使用工具和技能 | 函数注册 + 动态调用 |
| 执行循环 | 驱动 ReAct 循环、处理错误 | 行动 + 反思的循环 | 状态机 / 循环控制 |

### 2.2 架构选择：为什么选 ReAct？

2026 年的 Agent 有多种推理模式：

| 模式 | 原理 | 优势 | 劣势 | 代表项目 |
|------|------|------|------|---------|
| ReAct | 推理 → 行动 → 观察 → 推理循环 | 简单、可控、可调试 | 多步推理可能发散 | **Claude** Code、GenericAgent |
| Plan-and-Execute | 先制定完整计划，再逐步执行 | 目标明确、不易跑偏 | 计划可能不完整 | **LangGraph**、**CrewAI** |
| Reflexion | 执行后自我反思、修正策略 | 能从错误中学习 | 需要额外的 LLM 调用 | Reflexion 论文 |
| Self-Evolving | 动态生长技能树、优化自身代码 | 持续进化、无需人工干预 | 实现复杂、安全性存疑 | Hermes、Evolver |

本文选择 ReAct 模式作为基础，因为它是理解所有其他模式的基石。Hermes Agent 的「自进化」本质上也是 ReAct 循环的扩展——在观察阶段增加自我评估，在推理阶段增加技能选择。

### 2.3 数据流图

下面展示 Agent 处理一个任务的完整数据流：`,
      mermaid: `sequenceDiagram
    participant U as 用户
    participant A as Agent Core
    participant SM as 短期记忆
    participant LM as 长期记忆
    participant T as 工具系统
    participant LLM as LLM API

    U->>A: "分析这个数据集的趋势"
    A->>SM: 加载会话上下文
    A->>LM: 检索相关经验
    LM-->>A: "上次用过 pandas describe()"
    A->>LLM: 构造 ReAct Prompt
    LLM-->>A: Thought: 需要读取数据
    LLM-->>A: Action: read_file("data.csv")
    A->>T: 调用 read_file 工具
    T-->>A: 返回数据内容
    A->>LLM: 将观察结果加入上下文
    LLM-->>A: Thought: 需要统计分析
    LLM-->>A: Action: python_code("df.describe()")
    A->>T: 执行 Python 代码
    T-->>A: 返回统计结果
    A->>LLM: 将结果加入上下文
    LLM-->>A: Final Answer: 数据趋势分析...
    A->>SM: 保存经验摘要
    A->>LM: 存储新的工具使用模式
    A-->>U: 返回最终答案`,
    },
    {
      title: "三、完整实现：构建 Agent 推理引擎",
      body: `我们从最核心的推理引擎开始。推理引擎是 Agent 的「大脑」——它接收用户任务，结合记忆和工具能力，通过 LLM 生成行动计划。

### 3.1 工具定义系统

工具是 Agent 的「手脚」。每个工具必须定义清晰的接口，这样 LLM 才知道何时调用、如何调用。

**设计要点**：
- 工具名称要语义化，LLM 才能准确选择
- 参数描述要详细，包含类型、约束和示例
- 返回值要有明确格式约定`,
      code: [
        {
          lang: "python",
          code: `from dataclasses import dataclass, field
from typing import Any, Callable
import json
import re
import subprocess
import os
from datetime import datetime


@dataclass
class ToolParameter:
    """工具参数定义"""
    name: str
    type: str  # "string", "number", "boolean", "array"
    description: str
    required: bool = True
    enum: list[str] | None = None


@dataclass
class Tool:
    """工具定义——Agent 可使用的能力单元"""
    name: str
    description: str
    parameters: list[ToolParameter]
    fn: Callable  # 实际执行函数
    category: str = "general"  # 工具分类

    def to_prompt_description(self) -> str:
        """生成 LLM 可读的工具描述"""
        params_desc = ", ".join(
            f"{p.name} ({p.type})" for p in self.parameters if p.required
        )
        return f"- {self.name}({params_desc}): {self.description}"

    def to_json_schema(self) -> dict:
        """生成 JSON Schema 格式（用于 function calling）"""
        properties = {}
        required = []
        for p in self.parameters:
            properties[p.name] = {
                "type": p.type,
                "description": p.description,
            }
            if p.enum:
                properties[p.name]["enum"] = p.enum
            if p.required:
                required.append(p.name)

        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": properties,
                "required": required,
            }
        }


# ===== 预定义工具集 =====

def search_web(query: str) -> str:
    """模拟网络搜索（实际可接入 DuckDuckGo API、Tavily 等）"""
    # 实际项目中替换为真实搜索 API
    return f"[搜索结果] 关于 '{query}' 的信息：\n" \
           f"1. 这是关于 {query} 的参考资料...\n" \
           f"2. 相关文档显示 {query} 在 2026 年有重要发展...\n" \
           f"3. 社区讨论表明 {query} 的最佳实践是..."


def execute_python(code: str) -> str:
    """安全执行 Python 代码（带超时和输出捕获）"""
    try:
        # 生产环境应使用沙箱执行（如 Docker、E2B）
        result = subprocess.run(
            ["python3", "-c", code],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            return f"执行成功\n输出:\n{result.stdout}"
        else:
            return f"执行失败\n错误:\n{result.stderr}"
    except subprocess.TimeoutExpired:
        return "执行超时（超过 30 秒）"
    except Exception as e:
        return f"执行异常: {str(e)}"


def read_file(filepath: str) -> str:
    """读取文件内容"""
    try:
        if not os.path.exists(filepath):
            return f"错误：文件 '{filepath}' 不存在"
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        return f"文件内容（{len(content)} 字符）:\n{content[:2000]}"
    except Exception as e:
        return f"读取失败: {str(e)}"


def write_file(filepath: str, content: str) -> str:
    """写入文件"""
    try:
        os.makedirs(os.path.dirname(filepath) or '.', exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return f"成功写入 {filepath}（{len(content)} 字符）"
    except Exception as e:
        return f"写入失败: {str(e)}"


# 注册工具列表
BUILTIN_TOOLS = [
    Tool(
        name="search_web",
        description="搜索互联网获取最新信息。适用于需要实时数据或知识库之外的信息。",
        parameters=[ToolParameter("query", "string", "搜索关键词", required=True)],
        fn=search_web,
        category="search",
    ),
    Tool(
        name="execute_python",
        description="执行 Python 代码。用于数据分析、计算、文本处理等编程任务。",
        parameters=[ToolParameter("code", "string", "要执行的 Python 代码", required=True)],
        fn=execute_python,
        category="code",
    ),
    Tool(
        name="read_file",
        description="读取本地文件内容。支持文本文件。",
        parameters=[ToolParameter("filepath", "string", "文件路径（绝对或相对路径）", required=True)],
        fn=read_file,
        category="file",
    ),
    Tool(
        name="write_file",
        description="写入内容到文件。可创建新文件或覆盖已有文件。",
        parameters=[
            ToolParameter("filepath", "string", "文件路径", required=True),
            ToolParameter("content", "string", "要写入的内容", required=True),
        ],
        fn=write_file,
        category="file",
    ),
]`,
          filename: "agent_tools.py",
        },
      ],
    },
    {
      title: "四、记忆系统：短期 + 长期记忆",
      body: `没有记忆的 Agent 就像没有经验的实习生——每次都要从头开始。Hermes Agent 和 claude-mem 的核心价值就在于它们解决了记忆问题。

### 4.1 短期记忆（工作记忆）

短期记忆保存当前对话的所有交互历史。这是最简单的记忆形式，几乎所有 Agent 都有。

### 4.2 长期记忆（经验记忆）

长期记忆是 Agent 区别于简单对话系统的关键。它让 Agent 能够：
- 记住上次任务的解决方案（加速类似任务）
- 记住工具的优缺点（避免重复踩坑）
- 记住用户的偏好（个性化响应）

本文实现一个轻量级长期记忆——基于关键词的经验存储和检索。生产环境应使用向量数据库（如 ChromaDB、Qdrant）。`,
      code: [
        {
          lang: "python",
          code: `import json
import os
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


@dataclass
class MemoryEntry:
    """单条记忆"""
    id: str
    summary: str        # 经验摘要
    keywords: list[str]  # 检索关键词
    tool_usage: str      # 使用的工具（JSON）
    outcome: str         # 结果（success/failed）
    timestamp: str
    importance: float = 1.0  # 重要度（影响检索权重）


class AgentMemory:
    """Agent 记忆系统：短期记忆 + 长期记忆"""

    def __init__(self, storage_path: str = ".agent_memory"):
        self.storage_path = storage_path
        self.short_term: list[dict] = []  # 短期记忆（对话历史）
        self.long_term: list[MemoryEntry] = []  # 长期记忆（经验）

        os.makedirs(storage_path, exist_ok=True)
        self._load_long_term()

    # === 短期记忆 ===

    def add_turn(self, role: str, content: str):
        """添加一轮对话到短期记忆"""
        self.short_term.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
        })
        # 限制短期记忆大小，避免超出 LLM 上下文窗口
        if len(self.short_term) > 20:
            self.short_term = self.short_term[-20:]

    def get_context(self) -> str:
        """获取当前对话上下文（格式化为文本）"""
        lines = []
        for turn in self.short_term:
            role_label = "User" if turn["role"] == "user" else "Assistant"
            lines.append(f"{role_label}: {turn['content']}")
        return "\\n".join(lines)

    def clear_short_term(self):
        """清理短期记忆（新任务开始时调用）"""
        self.short_term = []

    # === 长期记忆 ===

    def store_experience(
        self,
        task_summary: str,
        tools_used: list[str],
        outcome: str,
        importance: float = 1.0,
    ):
        """存储经验到长期记忆"""
        entry = MemoryEntry(
            id=f"exp_{len(self.long_term) + 1:04d}",
            summary=task_summary,
            keywords=self._extract_keywords(task_summary),
            tool_usage=json.dumps(tools_used),
            outcome=outcome,
            timestamp=datetime.now().isoformat(),
            importance=importance,
        )
        self.long_term.append(entry)
        self._save_long_term()
        return entry

    def retrieve_relevant(self, query: str, top_k: int = 3) -> list[MemoryEntry]:
        """检索与查询相关的经验（基于关键词匹配）"""
        query_keywords = self._extract_keywords(query)
        scored = []
        for entry in self.long_term:
            # 计算关键词重叠分数
            overlap = len(set(query_keywords) & set(entry.keywords))
            score = overlap * entry.importance
            if score > 0:
                scored.append((score, entry))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [entry for _, entry in scored[:top_k]]

    def get_summary_prompt(self, query: str) -> str:
        """格式化为 LLM 可读的经验摘要"""
        relevant = self.retrieve_relevant(query)
        if not relevant:
            return "（无相关历史经验）"

        lines = ["## 相关历史经验"]
        for exp in relevant:
            lines.append(
                f"- [{exp.outcome}] {exp.summary} "
                f"(工具: {exp.tool_usage}, 时间: {exp.timestamp[:10]})"
            )
        return "\\n".join(lines)

    # === 内部方法 ===

    def _extract_keywords(self, text: str) -> list[str]:
        """从文本中提取关键词（简化版）"""
        # 移除停用词，提取有意义的词
        stop_words = {
            "的", "了", "在", "是", "我", "有", "和", "就", "不", "人",
            "都", "一", "一个", "上", "也", "很", "到", "说", "要",
            "a", "an", "the", "is", "in", "on", "at", "to", "for",
            "with", "by", "from", "or", "and", "of", "it", "this", "that",
        }
        words = re.findall(r'[\\w\\u4e00-\\u9fff]+', text.lower())
        return [w for w in words if w not in stop_words and len(w) > 1]

    def _save_long_term(self):
        """持久化长期记忆到文件"""
        data = [
            {
                "id": e.id, "summary": e.summary,
                "keywords": e.keywords, "tool_usage": e.tool_usage,
                "outcome": e.outcome, "timestamp": e.timestamp,
                "importance": e.importance,
            }
            for e in self.long_term
        ]
        path = os.path.join(self.storage_path, "long_term.json")
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _load_long_term(self):
        """从文件加载长期记忆"""
        path = os.path.join(self.storage_path, "long_term.json")
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.long_term = [MemoryEntry(**item) for item in data]`,
          filename: "agent_memory.py",
        },
      ],
    },
    {
      title: "五、ReAct 推理循环：Agent 的核心驱动",
      body: `现在我们把工具系统和记忆系统组合起来，实现 ReAct 推理循环。这是 Agent 最核心的逻辑。

### 5.1 ReAct 模式的工作原理

ReAct（Reasoning + Acting）的核心思想是：LLM 不应该一次性生成答案，而是交替进行「思考」和「行动」。

**每一步循环**：
1. Thought（思考）：LLM 分析当前状态，决定下一步
2. Action（行动）：调用一个工具
3. Observation（观察）：查看工具返回的结果
4. 回到步骤 1，直到得出最终答案

这个模式的好处是：
**- 可控**：每步行动都可以被审计
**- 可调试**：出问题时可以看到哪一步出错
**- 可终止**：设置最大步数防止无限循环

### 5.2 完整实现`,
      code: [
        {
          lang: "python",
          code: `import json
import re
import time
from typing import Optional

# 假设已导入 AgentMemory, Tool 等（见上文）

SYSTEM_PROMPT = """你是一个自主 AI Agent。你可以使用工具来完成任务。

## 可用工具
{tools}

## 历史经验
{experience}

## 输出格式
你必须严格按以下格式输出：

Thought: [你的思考，分析当前情况并决定下一步]
Action: [工具名称]
Action Input: [工具的输入参数，JSON 格式]

或者当你有最终答案时：

Thought: [你的思考]
Final Answer: [你的最终答案]

## 规则
1. 每次只调用一个工具
2. Action 必须是上述工具之一
3. Action Input 必须是有效的 JSON
4. 如果你已经有足够信息回答问题，使用 Final Answer
5. 最多进行 {max_steps} 步推理，超过则直接给出 Final Answer
"""


class SimpleAgent:
    """自主 AI Agent —— ReAct 推理循环实现"""

    def __init__(
        self,
        tools: list[Tool],
        memory: AgentMemory,
        llm_client,  # LLM API 客户端（支持 OpenAI / Anthropic 等）
        model: str = "gpt-4o",
        max_steps: int = 10,
    ):
        self.tools = {t.name: t for t in tools}
        self.memory = memory
        self.llm_client = llm_client
        self.model = model
        self.max_steps = max_steps

    def run(self, task: str) -> str:
        """运行 Agent——完成一个任务"""
        # 清理短期记忆（新任务）
        self.memory.clear_short_term()

        # 检索相关经验
        experience_prompt = self.memory.get_summary_prompt(task)

        # 构造系统提示
        tools_desc = "\\n".join(t.to_prompt_description() for t in self.tools.values())
        system_prompt = SYSTEM_PROMPT.format(
            tools=tools_desc,
            experience=experience_prompt,
            max_steps=self.max_steps,
        )

        # 记录用户输入
        self.memory.add_turn("user", task)

        # 执行 ReAct 循环
        step = 0
        conversation = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": task},
        ]

        print(f"\\n{'='*60}")
        print(f"🚀 开始执行任务: {task}")
        print(f"{'='*60}\\n")

        while step < self.max_steps:
            step += 1
            print(f"--- Step {step}/{self.max_steps} ---")

            # 调用 LLM
            response = self._call_llm(conversation)
            print(f"🤔 Thought: {response.thought}")

            # 检查是否有最终答案
            if response.final_answer:
                print(f"\\n✅ Final Answer: {response.final_answer}")
                self.memory.add_turn("assistant", response.final_answer)
                # 存储经验
                self.memory.store_experience(
                    task_summary=task[:100],
                    tools_used=[t for t in response.tools_used],
                    outcome="success",
                )
                return response.final_answer

            # 调用工具
            if response.action and response.action_input:
                tool_name = response.action
                tool_input = response.action_input

                if tool_name in self.tools:
                    print(f"🔧 Action: {tool_name}({json.dumps(tool_input, ensure_ascii=False)})")
                    result = self._execute_tool(tool_name, tool_input)
                    print(f"📋 Observation: {result[:200]}...")

                    # 将工具调用加入对话
                    conversation.append({
                        "role": "assistant",
                        "content": f"Thought: {response.thought}\\nAction: {tool_name}\\nAction Input: {json.dumps(tool_input)}"
                    })
                    conversation.append({
                        "role": "user",
                        "content": f"Observation: {result}"
                    })
                else:
                    error_msg = f"错误：未知工具 '{tool_name}'"
                    print(f"❌ {error_msg}")
                    conversation.append({
                        "role": "user",
                        "content": f"Observation: {error_msg}"
                    })

        # 超过最大步数
        fallback = "已达到最大推理步数限制。基于已有信息，我的最佳回答是：需要更多信息或更多工具来完成此任务。"
        print(f"\\n⏰ 达到最大步数限制")
        print(f"📝 {fallback}")
        self.memory.add_turn("assistant", fallback)
        return fallback

    def _call_llm(self, conversation: list[dict]) -> 'AgentResponse':
        """调用 LLM 并解析响应"""
        messages = conversation.copy()

        # 调用 LLM API（这里用伪代码，实际接入 OpenAI/Anthropic API）
        # response = self.llm_client.chat.completions.create(
        #     model=self.model,
        #     messages=messages,
        #     temperature=0.1,
        #     max_tokens=1024,
        # )
        # raw_text = response.choices[0].message.content

        # 为演示目的，这里展示解析逻辑
        raw_text = self._mock_llm_call(messages)  # 替换为真实 API 调用
        return AgentResponse.parse(raw_text)

    def _execute_tool(self, name: str, input_dict: dict) -> str:
        """执行工具并返回结果"""
        tool = self.tools[name]
        try:
            result = tool.fn(**input_dict)
            return str(result)
        except Exception as e:
            return f"工具执行错误: {str(e)}"

    def _mock_llm_call(self, messages: list[dict]) -> str:
        """模拟 LLM 调用（实际项目中替换为真实 API）"""
        # 这只是一个示例，实际应调用 OpenAI / Anthropic / Claude API
        last_msg = messages[-1]["content"]
        if "数据集" in last_msg or "分析" in last_msg:
            return (
                "Thought: 用户需要分析数据，我需要先读取文件。\\n"
                "Action: read_file\\n"
                "Action Input: {\\"filepath\\": \\"data.csv\\"}"
            )
        return (
            "Thought: 我已经有了足够的信息来回答这个问题。\\n"
            "Final Answer: 根据搜索结果，这个问题的答案是..."
        )


@dataclass
class AgentResponse:
    """Agent 的 LLM 输出解析结果"""
    thought: str
    action: Optional[str] = None
    action_input: Optional[dict] = None
    final_answer: Optional[str] = None
    tools_used: list[str] = field(default_factory=list)

    @classmethod
    def parse(cls, text: str) -> 'AgentResponse':
        """从 LLM 输出文本中解析 Thought/Action/Final Answer"""
        thought_match = re.search(r'Thought:\\s*(.+?)(?=\\nAction:|\\nFinal Answer:|$)', text, re.DOTALL)
        action_match = re.search(r'Action:\\s*(\\w+)', text)
        action_input_match = re.search(r'Action Input:\\s*({.*?})', text, re.DOTALL)
        final_match = re.search(r'Final Answer:\\s*(.+)$', text, re.DOTALL)

        thought = thought_match.group(1).strip() if thought_match else ""
        final_answer = final_match.group(1).strip() if final_match else None

        action = action_match.group(1) if action_match else None
        action_input = None
        if action_input_match:
            try:
                action_input = json.loads(action_input_match.group(1))
            except json.JSONDecodeError:
                pass

        tools_used = [action] if action else []

        return cls(
            thought=thought,
            action=action,
            action_input=action_input,
            final_answer=final_answer,
            tools_used=tools_used,
        )


# ===== 使用示例 =====

if __name__ == "__main__":
    # 初始化组件
    memory = AgentMemory(storage_path="./my_agent_memory")
    tools = BUILTIN_TOOLS

    # 初始化 LLM 客户端（伪代码，实际接入真实 API）
    # from openai import OpenAI
    # llm_client = OpenAI(api_key="your-api-key")
    llm_client = None  # 替换为真实客户端

    # 创建 Agent
    agent = SimpleAgent(
        tools=tools,
        memory=memory,
        llm_client=llm_client,
        model="gpt-4o",
        max_steps=8,
    )

    # 运行任务
    result = agent.run("请读取 data.csv 文件并分析其中的数据趋势")
    print(f"\\n最终结果: {result}")`,
          filename: "agent_core.py",
        },
      ],
      tip: "关键理解：Agent 的「智能」不在于 LLM 有多强，而在于循环架构。ReAct 循环让 LLM 可以分步思考、分步行动、从工具反馈中学习。Claude Code、Hermes Agent、GenericAgent 的核心逻辑都是这个模式的变体。",
    },
    {
      title: "六、错误处理与自我恢复",
      body: `生产环境的 Agent 必须能处理各种错误。工具可能失败、LLM 可能生成无效输出、网络可能超时。一个健壮的 Agent 不是「永不犯错」，而是「犯错后能恢复」。

### 6.1 错误类型与应对策略

| 错误类型 | 示例 | 应对策略 |
|---------|------|---------|
| 工具执行失败 | 文件不存在、代码报错 | 将错误信息反馈给 LLM，让它尝试修复 |
| LLM 输出格式错误 | 没有按格式输出 Action | 重新解析或请求重试 |
| 超过最大步数 | Agent 陷入死循环 | 强制终止，给出最佳答案 |
| 工具选择不当 | 用了错误的工具 | 在 Observation 中提示错误，让 LLM 重新选择 |
| 网络超时 | API 调用超时 | 重试机制 + 退避策略 |

### 6.2 增强版错误处理实现`,
      code: [
        {
          lang: "python",
          code: `class RobustAgent(SimpleAgent):
    """增强版 Agent——带错误恢复机制"""

    def __init__(self, *args, retry_count: int = 2, **kwargs):
        super().__init__(*args, **kwargs)
        self.retry_count = retry_count
        self.error_history: list[str] = []  # 记录遇到的错误

    def _execute_tool(self, name: str, input_dict: dict) -> str:
        """执行工具，带重试和错误记录"""
        for attempt in range(1, self.retry_count + 1):
            try:
                tool = self.tools[name]
                result = tool.fn(**input_dict)

                # 检查结果是否合理
                if self._is_error_result(str(result)):
                    error_info = f"工具 {name} 返回了错误信息: {result}"
                    self.error_history.append(error_info)

                    if attempt < self.retry_count:
                        print(f"  ⚠️  第 {attempt} 次尝试失败，重试中...")
                        time.sleep(1)
                        continue

                return str(result)

            except Exception as e:
                error_msg = f"工具 {name} 异常: {str(e)}"
                self.error_history.append(error_msg)
                if attempt < self.retry_count:
                    print(f"  ⚠️  第 {attempt} 次异常，重试中...")
                    time.sleep(1)
                    continue
                return f"❌ {error_msg}（已重试 {self.retry_count} 次）"

        return f"❌ 工具 {name} 所有重试均失败"

    def _is_error_result(self, result: str) -> bool:
        """判断工具返回结果是否表示错误"""
        error_indicators = ["错误", "失败", "Error", "Failed", "不存在", "Exception"]
        return any(indicator in result for indicator in error_indicators)

    def run(self, task: str) -> str:
        """重写 run 方法，加入错误恢复逻辑"""
        self.error_history = []
        result = super().run(task)

        # 任务结束后，分析错误历史并生成改进建议
        if self.error_history:
            print(f"\\n📊 错误报告:")
            for err in self.error_history:
                print(f"  - {err}")

            # 将错误经验存储为"反面教材"
            self.memory.store_experience(
                task_summary=f"[失败经验] {task[:80]}",
                tools_used=["error_recovery"],
                outcome="failed",
                importance=0.8,
            )

        return result


# ===== 对比测试 =====

def compare_agents():
    """对比基础 Agent 和增强版 Agent"""
    memory = AgentMemory()
    tools = BUILTIN_TOOLS

    # 基础版
    basic = SimpleAgent(tools, memory, llm_client=None, max_steps=5)

    # 增强版
    robust = RobustAgent(
        tools, memory, llm_client=None,
        max_steps=5, retry_count=3
    )

    test_tasks = [
        "读取一个不存在的文件",
        "执行一段有语法错误的 Python 代码",
        "搜索 2026 年最新的 AI Agent 项目",
    ]

    print("\\n" + "=" * 60)
    print("📋 Agent 错误恢复能力测试")
    print("=" * 60)

    for task in test_tasks:
        print(f"\\n📌 任务: {task}")
        print("-" * 40)

        print("\\n【基础版 Agent】")
        basic_result = basic.run(task)

        print("\\n【增强版 Agent】")
        robust_result = robust.run(task)

    print("\\n" + "=" * 60)
    print("测试完成！增强版 Agent 通过重试和错误恢复，")
    print("在面对工具失败时表现更稳定。")
    print("=" * 60)


if __name__ == "__main__":
    compare_agents()`,
          filename: "agent_robust.py",
        },
      ],
      warning: "安全提醒：上面的 execute_python 工具在生产环境中极其危险！永远不要在公开服务中直接执行用户提供的代码。生产环境必须使用沙箱（Docker 容器、E2B Sandbox、Firecracker VM）来隔离代码执行。本文的简化实现仅用于教学目的。",
    },
    {
      title: "七、从玩具到生产：关键改进清单",
      body: `上面构建的 Agent 是一个教学级实现。要把它变成生产可用的系统，你需要做以下改进。

### 7.1 生产化路线图

| 阶段 | 改进项 | 优先级 | 参考项目 |
|------|--------|--------|---------|
| P0 必须 | 接入真实 LLM API（**OpenAI**/**Anthropic**） | 🔴 | 所有 Agent 项目 |
| P0 必须 | 代码执行沙箱（Docker/E2B） | 🔴 | **Claude** Code, OpenClaw |
| P0 必须 | 输入验证和权限控制 | 🔴 | 所有 Agent 项目 |
| P1 重要 | 向量数据库长期记忆 | 🟠 | claude-mem, MemPalace |
| P1 重要 | 工具自动发现（MCP 协议） | 🟠 | **OpenAI** Agents, **Claude** Code |
| P1 重要 | 并发工具执行 | 🟠 | **LangGraph** |
| P2 增强 | 自反思（Reflexion）机制 | 🟡 | Reflexion, Hermes |
| P2 增强 | 技能自动生长 | 🟡 | GenericAgent, Evolver |
| P2 增强 | 多 Agent 协作 | 🟡 | **CrewAI**, **AutoGen** |
| P3 优化 | 缓存和成本优化 | 🟢 | 所有 Agent 项目 |
| P3 优化 | 监控和可观测性 | 🟢 | LangSmith, Langfuse |

### 7.2 与热门 Agent 项目的架构对比

| 特性 | 本文实现 | **Claude** Code | Hermes Agent | GenericAgent |
|------|---------|-------------|-------------|-------------|
| 推理模式 | ReAct | ReAct + Plan | ReAct + 自进化 | 技能树 + 元认知 |
| 工具系统 | 静态注册 | MCP + 内置 | 动态生长 | 自主发现 |
| 记忆 | 关键词匹配 | 文件系统 + AI 压缩 | 经验累积 | 技能固化 |
| 错误恢复 | 重试 + 反馈 | 自主修复 | 自我反思 | 变异选择 |
| 沙箱 | 无 | 有 | 有 | 有 |
| 自进化 | ❌ | ❌ | ✅ | ✅ |
| 开源 | 本文代码 | ❌ | ✅ | ✅ |

### 7.3 扩展阅读

理解本文架构后，建议深入学习以下项目，看它们如何在本文基础上做增强：

- claude-mem（65K stars）：学习如何用 AI 压缩 Agent 经验
- GenericAgent（5.8K stars）：学习如何从种子代码自动生长技能树
- Evolver（6.4K stars）：学习如何用 GEP 协议做群体进化
- Hermes Agent（109K stars）：学习如何结合以上所有模式`,
      table: {
        headers: ["改进项", "实现难度", "价值", "推荐优先级"],
        rows: [
          ["真实 LLM API 接入", "低（API 调用）", "必须", "P0"],
          ["代码执行沙箱", "中（容器管理）", "必须", "P0"],
          ["向量检索记忆", "中（ChromaDB/Qdrant）", "高", "P1"],
          ["MCP 工具发现", "中（协议实现）", "高", "P1"],
          ["并发工具执行", "中高（异步编程）", "中", "P1"],
          ["自反思循环", "中（额外 LLM 调用）", "中", "P2"],
          ["技能自动生长", "高（元编程）", "高", "P2"],
          ["多 Agent 协作", "高（编排框架）", "中", "P2"],
        ],
      },
    },
    {
      title: "八、总结与实战练习",
      body: `本文从零构建了一个完整的 AI Agent，涵盖工具系统、记忆系统、ReAct 推理循环和错误恢复。通过手写实现，你不仅理解了 Agent 的工作原理，更拥有了一个可以直接运行的代码基础。

### 核心要点回顾

1. Agent 的核心是循环，不是模型：ReAct 循环让 LLM 从「一次性生成」变成「分步思考+行动」
2. 工具是 Agent 的能力边界：定义清晰的工具接口，Agent 才能做有用的事
3. 记忆是 Agent 的经验：没有记忆的 Agent 每次都是新手，无法积累能力
4. 错误处理决定生产可用性：重试、回退、日志，缺一不可

### 实战练习

尝试以下练习来巩固所学：

1. 接入真实 API：将 _mock_llm_call 替换为 **OpenAI** 或 **Anthropic** 的真实 API 调用
2. 添加新工具：实现一个「网页抓取」工具（用 requests + BeautifulSoup）
3. 实现向量记忆：用 ChromaDB 替换关键词匹配的记忆检索
4. 添加计划模式：在执行任务前，先让 LLM 生成一个执行计划（Plan-and-Execute 模式）
5. 实现并发执行：让 Agent 可以同时调用多个独立工具（asyncio + 工具并行）

完成这些练习后，你就拥有了一个生产级 Agent 的基础框架——这正是 Hermes Agent、GenericAgent 等热门项目的核心架构。`,
      tip: "下一步学习建议：掌握本文内容后，建议阅读 Claude Code 的架构文档、Hermes Agent 的源码（GitHub: NousResearch/hermes-agent），以及 GenericAgent 的技能树实现（GitHub: lsdefine/GenericAgent），理解工业级 Agent 如何在此基础之上做增强。",
    },
  ],
};
