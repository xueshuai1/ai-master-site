import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-001",
    title: "AI Agent 入门：从概念到实现",
    category: "agent",
    tags: ["Agent", "规划", "工具使用"],
    summary: "理解 AI Agent 的核心组件：感知、规划、记忆和工具调用",
    date: "2026-04-09",
    readTime: "22 min",
    level: "入门",
    content: [
      {
        title: "1. 什么是 AI Agent？从聊天机器人到自主智能体",
        body: `AI Agent（智能体）是 2024-2026 年 AI 领域最引人注目的范式转变。要理解它，我们先看看 AI 系统的演进路径：

**第一代**：问答系统——你问它答，被动响应。ChatGPT 刚发布时就是这种模式：用户输入一段文字，模型生成回复，然后等待下一次输入。这种交互模式下，模型完全没有"主动性"。

**第二代**：工具增强——模型可以调用外部工具（搜索引擎、代码执行器、API），但仍需要用户明确指定。用户说"帮我搜索 XX"，模型执行搜索并返回结果。

**第三代**：AI Agent——模型不仅能够使用工具，还能自主规划、分解复杂任务、在多步执行中保持上下文、根据执行结果动态调整策略。Agent 的核心特征是"主动性"和"自主性"。

**举个例子**：如果你让一个 Agent "帮我订一张下周北京到上海的机票"，它会自动：理解你的偏好→搜索航班→比较价格和时刻→检查你的日历→执行预订→发送确认。整个过程不需要你逐步指导。

Agent 不是单一技术，而是一种架构模式——它将大语言模型（LLM）作为"大脑"，围绕它构建感知、规划、记忆和执行的完整系统。这篇文章将深入拆解每一个组件。`,
        mermaid: `graph LR
    A["用户目标"] --> B["感知模块\
理解意图"]
    B --> C["规划模块\
任务分解"]
    C --> D["记忆模块\
上下文管理"]
    D --> E["执行模块\
工具调用"]
    E --> F["观察结果"]
    F --> C
    F -.->|任务完成| G["输出结果"]`,
        tip: "关键区分：Agent ≠ 更好的聊天机器人。聊天机器人是对话的，Agent 是目标驱动的。聊天机器人等待输入，Agent 主动采取行动。",
      },
      {
        title: "2. Agent 的四大核心组件",
        body: `一个完整的 AI Agent 系统通常包含四个核心组件，这个架构框架由 Stanford 的"Agent4Science"论文和多个开源框架（**LangChain**、**AutoGen**、**CrewAI**）共同确立。

感知模块（Perception）：负责理解用户的意图和环境状态。在大多数 Agent 系统中，LLM 本身就是感知模块——它接收自然语言输入，理解其中的目标、约束和上下文。但感知不止于理解文字，还包括：从结构化数据中提取信息（如读取数据库）、从非结构化内容中识别模式（如分析文档）、以及感知外部环境状态（如检查网页内容）。

规划模块（Planning）：这是 Agent 的"智慧"所在。规划分为两个层次：任务分解（Task Decomposition）——将复杂目标拆解为可执行的子任务序列；策略选择（Strategy Selection）——根据当前状态选择最优的执行路径。规划的核心挑战是：LLM 一次性生成的计划往往不完美，需要在执行中动态调整（Re-planning）。

记忆模块（Memory）：Agent 需要"记住"信息才能做出连贯的决策。记忆分为三种：短期记忆——当前对话上下文和正在执行的任务状态；长期记忆——通过向量数据库存储的历史经验和知识；工作记忆——当前步骤的中间结果和变量。

执行模块（Action/Tool Use）：将规划转化为实际行动。Agent 通过工具调用（Function Calling）来与外部世界交互：调用 API、执行代码、读写文件、操作浏览器等。执行模块的关键设计是：工具描述必须清晰（让 LLM 理解每个工具的用途），执行结果必须反馈给规划模块形成闭环。`,
        table: {
          headers: ["组件", "核心职责", "典型技术", "关键挑战"],
          rows: [
            ["感知（Perception）", "理解意图和环境", "LLM 文本理解、多模态解析", "歧义消解、不完整信息"],
            ["规划（Planning）", "任务分解和策略选择", "ReAct、CoT、ToT、反射", "计划不完美、需要动态调整"],
            ["记忆（Memory）", "存储和检索信息", "向量数据库、知识图谱、摘要", "信息过载、检索准确性"],
            ["执行（Action）", "与外部世界交互", "Function Calling、API 调用、代码执行", "工具错误处理、安全性"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 一个极简 Agent 框架的实现
from typing import List, Dict, Callable
import json

class SimpleAgent:
    """极简 AI Agent：感知→规划→执行→观察的循环"""
    
    def __init__(self, llm, tools: Dict[str, Callable]):
        self.llm = llm
        self.tools = tools
        self.memory = []
        self.max_steps = 10
    
    def plan(self, goal: str, history: List[Dict]) -> Dict:
        """规划模块：让 LLM 决定下一步行动"""
        tools_desc = json.dumps(
            {name: fn.__doc__ for name, fn in self.tools.items()},
            ensure_ascii=False, indent=2
        )
        history_str = json.dumps(history[-5:], ensure_ascii=False, indent=2)
        prompt = f"""你是一个 AI Agent。当前目标是：{goal}

可用工具：
{tools_desc}

最近执行历史：
{history_str}

请决定下一步行动。返回 JSON 格式：
{{"tool": "工具名", "input": "输入参数"}}
如果目标已完成，返回 {{"done": true, "result": "最终结果"}}"""
        response = self.llm(prompt)
        return json.loads(response)
    
    def execute(self, tool_name: str, tool_input: str) -> str:
        if tool_name not in self.tools:
            return f"错误：工具不存在"
        try:
            return str(self.tools[tool_name](tool_input))
        except Exception as e:
            return f"执行错误：{str(e)}"
    
    def run(self, goal: str) -> str:
        print(f"开始执行目标：{goal}")
        for step in range(self.max_steps):
            plan = self.plan(goal, self.memory)
            if plan.get("done"):
                return plan.get("result", "任务完成")
            tool_name = plan.get("tool", "")
            tool_input = plan.get("input", "")
            print(f"  步骤 {step+1}: {tool_name}({tool_input[:50]}...)")
            obs = self.execute(tool_name, tool_input)
            self.memory.append({"step": step + 1, "plan": plan, "observation": obs[:500]})
        return "达到最大步数，任务未完成"

# 定义工具
def search_web(query: str) -> str:
    """搜索网络获取信息"""
    return f"搜索结果：关于'{query}'的相关信息..."

def calculate(expression: str) -> str:
    """计算数学表达式"""
    return str(eval(expression))`,
          },
        ],
      },
      {
        title: "3. 规划模式：Agent 如何思考",
        body: `规划是 Agent 智能的核心体现。LLM 本身是一个"下一个 token 预测器"，它没有内在的目标导向。Agent 框架通过设计特定的 prompt 结构和执行流程，让 LLM 展现出"思考"和"规划"的能力。

ReAct 模式（Reasoning + Acting）：这是最经典的 Agent 规划范式。核心思想是让 LLM 在每一步都先"思考"（Thought），再"行动"（Action），然后"观察"（Observation），如此循环。ReAct 的优势在于：思考过程被显式记录下来，便于调试和理解；每一步的观察结果直接反馈给下一步的思考，形成动态调整。

思维树（Tree of Thoughts, ToT）：当任务特别复杂时，单线的 ReAct 可能不够。ToT 让 Agent 在关键决策点生成多个可能的"思路分支"，评估每个分支的可行性，选择最有希望的路径继续。这类似于人类在面对复杂问题时会考虑多种解决方案。

反射（Reflection）：高级 Agent 不仅执行任务，还会在执行后"反思"：哪些步骤做得好？哪些可以改进？这种元认知能力让 Agent 能够自我优化。典型的实现方式是让 LLM 对执行历史进行总结和评估，生成改进建议。`,
        mermaid: `sequenceDiagram
    participant U as 用户
    participant P as 规划模块
    participant M as 记忆模块
    participant T as 工具层
    
    U->>P: 提交目标
    loop 直到完成
        P->>P: Thought（思考）
        P->>T: Action（调用工具）
        T-->>P: Observation（结果）
        P->>M: 存入记忆
        P->>P: 是否需要调整计划？
    end
    P->>U: 返回最终结果`,
        code: [
          {
            lang: "python",
            code: `# ReAct 模式的完整实现
REACT_PROMPT = """你是一个 AI 助手，通过"思考-行动-观察"循环来解决复杂问题。

可用工具：
{tools}

格式：
Thought: <你的思考>
Action: <工具名>
Action Input: <工具输入>
Observation: <工具返回结果>
...（重复以上步骤）
Thought: 我已经有了足够的信息。
Final Answer: <最终答案>

问题：{question}

开始：
"""

class ReActAgent:
    def __init__(self, llm, tools):
        self.llm = llm
        self.tools = tools
        self.max_iterations = 8
    
    def _parse_response(self, text: str) -> dict:
        result = {"thought": "", "action": None, "action_input": None, "final_answer": None}
        for line in text.strip().split("\n"):
            if line.startswith("Thought:"):
                result["thought"] = line[len("Thought:"):].strip()
            elif line.startswith("Action:"):
                result["action"] = line[len("Action:"):].strip()
            elif line.startswith("Action Input:"):
                result["action_input"] = line[len("Action Input:"):].strip()
            elif line.startswith("Final Answer:"):
                result["final_answer"] = line[len("Final Answer:"):].strip()
        return result
    
    def run(self, question: str) -> str:
        tools_desc = "\n".join(f"- {name}: {fn.__doc__}" for name, fn in self.tools.items())
        prompt = REACT_PROMPT.format(tools=tools_desc, question=question)
        for i in range(self.max_iterations):
            response = self.llm(prompt)
            parsed = self._parse_response(response)
            print(f"  Thought: {parsed['thought']}")
            if parsed["final_answer"]:
                return parsed["final_answer"]
            if parsed["action"] and parsed["action_input"]:
                tool = self.tools.get(parsed["action"])
                if tool:
                    obs = tool(parsed["action_input"])
                    print(f"  Action: {parsed['action']}('{parsed['action_input'][:30]}...')")
                    print(f"  Observation: {obs[:100]}...")
                    prompt += response + f"\nObservation: {obs}\n"
                else:
                    prompt += response + "\nObservation: 工具不存在\n"
            else:
                prompt += response + "\n"
        return "达到最大迭代次数"`,
          },
        ],
        warning: "规划模块的常见陷阱：① 过度规划——Agent 生成过于详细的计划，但执行中环境变化导致计划失效；② 规划惰性——Agent 倾向于选择最简单的路径而非最优路径；③ 上下文丢失——长任务中，Agent 可能忘记最初的目标。缓解策略：定期让 Agent 复述当前目标。",
      },
      {
        title: "4. 记忆系统：Agent 的长期记忆",
        body: `如果没有记忆，Agent 就只是一个无状态的函数——每次调用都从零开始。记忆系统赋予 Agent 连续性和学习能力。

短期记忆（Short-term Memory）：就是当前对话的上下文窗口。LLM 的上下文长度有限（例如 128K tokens），这意味着 Agent 不能无限地记住所有历史。常见的策略是：滑动窗口（保留最近 N 条消息）、摘要压缩（将旧对话压缩为摘要）、关键信息提取（只保留与当前任务相关的信息）。

长期记忆（Long-term Memory）：通过外部存储实现。最常用的是向量数据库（Vector Database）：将历史交互、知识点、经验转化为向量嵌入（Embedding），在需要时通过语义相似度检索。这使得 Agent 可以"记住"大量信息，而不受上下文窗口限制。

情景记忆（Episodic Memory）vs 语义记忆（Semantic Memory）：借鉴认知心理学的分类，情景记忆存储"发生了什么"（具体事件），语义记忆存储"知道什么"（抽象知识）。Agent 系统也可以做类似的区分：将具体交互记录存储在情景记忆中，将从中提取的通用知识存储在语义记忆中。`,
        table: {
          headers: ["记忆类型", "存储方式", "容量", "检索方式", "典型应用"],
          rows: [
            ["短期记忆", "上下文窗口", "有限（128K tokens）", "顺序访问", "当前任务上下文"],
            ["情景记忆", "向量数据库", "近乎无限", "语义相似度检索", "历史经验回放"],
            ["语义记忆", "知识图谱/文档", "可扩展", "关键词/语义检索", "领域知识库"],
            ["程序记忆", "工具描述/脚本", "可扩展", "按需加载", "工具使用指南"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 基于向量相似度的 Agent 记忆系统
import numpy as np
from typing import List, Dict

class VectorMemory:
    def __init__(self, embed_fn, top_k: int = 5):
        self.embed_fn = embed_fn
        self.memories: List[Dict] = []
        self.top_k = top_k
    
    def add(self, text: str, metadata: Dict = None):
        embedding = self.embed_fn(text)
        self.memories.append({
            "text": text, "embedding": embedding,
            "metadata": metadata or {},
        })
    
    def retrieve(self, query: str) -> List[Dict]:
        query_vec = self.embed_fn(query)
        sims = []
        for mem in self.memories:
            sim = float(np.dot(query_vec, mem["embedding"]) / 
                       (np.linalg.norm(query_vec) * np.linalg.norm(mem["embedding"]) + 1e-8))
            sims.append((sim, mem))
        sims.sort(key=lambda x: x[0], reverse=True)
        return [{"text": m["text"], "score": round(s, 3), "metadata": m["metadata"]}
                for s, m in sims[:self.top_k]]

# 使用示例
def dummy_embed(text: str) -> np.ndarray:
    h = hash(text) % 10000
    return np.random.RandomState(h).rand(128)

memory = VectorMemory(embed_fn=dummy_embed, top_k=3)
memory.add("用户喜欢用 Python 写数据分析代码", {"type": "preference"})
memory.add("项目使用 FastAPI 作为后端框架", {"type": "project"})
memory.add("上次讨论了 Transformer 架构", {"type": "history"})
results = memory.retrieve("用户的编程偏好是什么？")
for r in results:
    print(f"  [{r['score']}] {r['text']}")`,
          },
        ],
      },
      {
        title: "5. 工具调用（Function Calling）：Agent 的双手",
        body: `工具调用是 Agent 与外部世界交互的唯一方式。没有工具，Agent 就只是一个会说话的模型——它无法获取实时信息、无法执行计算、无法影响外部环境。

Function Calling 的工作原理：现代 LLM（如 **GPT-4**、**Claude**、Qwen）都支持函数调用能力。开发者提供一组函数描述（名称、参数、用途），LLM 在需要时返回一个结构化的函数调用请求。系统执行这个函数，将结果返回给 LLM，LLM 再基于结果继续推理。

工具设计的黄金法则：① 描述清晰——每个工具的名称和描述必须让 LLM 能准确理解其用途；② 参数明确——参数的类型和含义要精确描述；③ 错误处理——工具失败时返回有意义的错误信息，帮助 LLM 决定重试还是换方案；④ 最小权限——工具只授予完成任务所需的最小权限，避免安全风险。

Agent 的"工具箱"：常见的 Agent 工具包括：搜索引擎（获取实时信息）、代码执行器（运行 Python/JavaScript 代码）、文件操作（读写本地文件）、数据库查询（访问结构化数据）、API 调用（与第三方服务交互）、浏览器自动化（操作网页）。`,
        code: [
          {
            lang: "python",
            code: `# 完整的工具定义与调用框架
import json
from typing import Any, Dict, List, Callable

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, dict] = {}
    
    def register(self, name: str, description: str, param_names: List[str], func: Callable):
        self._tools[name] = {"name": name, "description": description, "param_names": param_names, "func": func}
    
    def get_tools_description(self) -> List[Dict]:
        return [{"name": t["name"], "description": t["description"]} for t in self._tools.values()]
    
    def call_tool(self, name: str, args: Dict) -> Any:
        tool = self._tools.get(name)
        if not tool:
            raise ValueError(f"未知工具: {name}")
        return tool["func"](**{k: v for k, v in args.items() if k in tool["param_names"]})

def search_tool(query: str, num_results: int = 5) -> str:
    """搜索网络获取信息"""
    import urllib.request
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&format=json&srlimit={num_results}"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            data = json.loads(resp.read())
        results = data.get("query", {}).get("search", [])
        if not results:
            return f"未找到关于'{query}'的结果"
        return "\n".join(f"- {r['title']}: {r['snippet'][:100]}..." for r in results[:num_results])
    except Exception as e:
        return f"搜索失败: {e}"

def calculator_tool(expression: str) -> str:
    """安全计算数学表达式"""
    allowed = set("0123456789+-*/.() ")
    if not all(c in allowed for c in expression):
        return "错误：表达式包含不允许的字符"
    try:
        return str(eval(expression))
    except Exception as e:
        return f"计算错误: {e}"

registry = ToolRegistry()
registry.register("search", "搜索网络获取实时信息", ["query", "num_results"], search_tool)
registry.register("calculator", "计算数学表达式", ["expression"], calculator_tool)
print(json.dumps(registry.get_tools_description(), indent=2, ensure_ascii=False))`,
          },
        ],
        tip: "工具开发的实用建议：先写工具的描述和参数定义，再实现函数体。因为 LLM 理解工具的唯一方式就是描述——描述写得好，Agent 就能准确使用工具。",
      },
      {
        title: "6. Agent 框架对比与选择",
        body: `2024-2026 年间，涌现了大量 Agent 框架。理解它们的差异，能帮助你在实际项目中做出正确的选择。

**LangChain**/**LangGraph**：最流行的 Agent 框架，提供了完整的工具链。**LangChain** 擅长"链式"的线性流程，而 **LangGraph** 支持更复杂的图结构（循环、分支）。适合需要快速原型的场景。但抽象层次较高，调试可能困难。

**AutoGen**（**Microsoft**）：多 Agent 协作框架的标杆。支持多个 Agent 之间通过对话协作完成任务，内置了用户参与模式（Human-in-the-loop）。适合需要复杂团队协作的场景。

**CrewAI**：轻量级的多 Agent 框架，API 设计优雅，学习曲线低。适合小型项目和快速实验。`,
        table: {
          headers: ["框架", "单/多 Agent", "学习曲线", "适合场景", "最大优势"],
          rows: [
            ["LangChain/LangGraph", "两者都支持", "中等", "快速原型、生产部署", "生态最完善、工具最多"],
            ["AutoGen", "多 Agent", "较陡", "复杂团队协作、研究", "多 Agent 对话最强"],
            ["CrewAI", "多 Agent", "低", "小型项目、实验", "API 最优雅"],
            ["OpenAI Assistants API", "单 Agent", "低", "生产级应用", "官方支持、最稳定"],
            ["自定义框架", "灵活", "高", "特定需求、深度优化", "完全可控"],
          ],
        },
        list: [
          "选择框架前，先明确：你的任务是单步还是多步？需要多个 Agent 协作吗？对可控性的要求有多高？",
          "新项目建议从 LangChain 开始——文档最全、社区最大、遇到问题最容易找到答案",
          "多 Agent 协作场景优先考虑 AutoGen 或 CrewAI",
          "生产环境考虑 OpenAI Assistants API——最稳定但灵活性最低",
        ],
      },
      {
        title: "7. 实际应用场景与最佳实践",
        body: `AI Agent 已经在多个领域展现出巨大的实用价值。

**软件开发**：Agent 可以作为"AI 编程助手"，不仅能补全代码，还能理解整个代码库的架构、编写测试、修复 Bug、审查代码。典型工具包括 Devin（AI 软件工程师）、GitHub Copilot Workspace 等。Agent 在开发中的核心价值不是"替代程序员"，而是"放大程序员的生产力"——让一个程序员能做以前需要两三个人才能完成的工作。

**数据分析**：Agent 可以自动完成"数据探索→清洗→分析→可视化→报告"的完整流程。用户上传数据集，Agent 自动识别数据类型、生成描述性统计、发现异常值、构建可视化图表、撰写分析结论。

**客户服务**：新一代客服 Agent 不再只是关键词匹配的聊天机器人，而是能真正理解客户问题、查询订单状态、处理退款、升级复杂问题的智能助手。`,
        mermaid: `graph TD
    A["Agent 应用场景"] --> B["软件开发"]
    A --> C["数据分析"]
    A --> D["客户服务"]
    A --> E["自动化运维"]
    
    B --> B1["代码补全 + Bug 修复"]
    B --> B2["测试生成 + 代码审查"]
    C --> C1["自动 EDA + 可视化"]
    C --> C2["自然语言查询数据"]
    D --> D1["智能问答 + 工单处理"]
    D --> D2["情感分析 + 升级判断"]
    E --> E1["日志分析 + 异常检测"]
    E --> E2["自动修复 + 告警"]`,
        warning: "Agent 的安全风险不容忽视：① 工具权限过大——Agent 可能执行破坏性操作；② Prompt 注入——恶意用户通过精心构造的输入让 Agent 执行未授权操作；③ 无限循环——Agent 可能在规划-执行循环中陷入死循环。缓解策略：沙盒执行、权限最小化、超时限制、人工审批关键操作。",
        tip: "Agent 开发的黄金法则：从简单开始。不要一开始就构建复杂的多 Agent 系统。先用单 Agent + 几个工具验证核心流程，确认有效后再逐步扩展。",
      },
    ],
  };
