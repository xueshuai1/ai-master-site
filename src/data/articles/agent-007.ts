import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-007",
    title: "Agent 框架对比：LangGraph, CrewAI, AutoGen",
    category: "agent",
    tags: ["框架对比", "LangGraph", "CrewAI"],
    summary: "从架构到实战，全面对比主流 Agent 框架的优劣与适用场景",
    date: "2026-04-12",
    readTime: "20 min",
    level: "进阶",
    content: [
      {
        title: "1. Agent 框架生态概览：为什么需要框架？",
        body: `大语言模型本身只提供"文本补全"能力，要构建一个能自主完成任务的智能体，需要围绕 LLM 搭建完整的系统：状态管理、工具调用、记忆、多步规划、错误处理、多 Agent 协作。手写这些基础设施极其耗时，因此 Agent 框架应运而生。

2024 到 2026 年，Agent 框架经历了爆发式增长。主流框架可以分为三大流派：LangChain 生态派（LangChain + LangGraph）强调"从链到图"的渐进升级；多 Agent 协作派（CrewAI、AutoGen）专注于让多个智能体协同工作；以及轻量极简派（如 SmolAgent、LlamaIndex Agent）追求最小抽象、最大控制力。

选择框架时需要考虑：你的任务是线性流程还是复杂图结构？需要几个 Agent？对调试可观测性的要求有多高？社区支持和文档质量如何？本文将从架构原理、代码风格、扩展能力和生产成熟度四个维度，深入对比 LangGraph、CrewAI 和 AutoGen 三大框架。`,
        code: [
          {
            lang: "python",
            code: `# Agent 框架的核心抽象层
from abc import ABC, abstractmethod
from typing import Any, Dict, List

class BaseAgent(ABC):
    """所有 Agent 框架的共同抽象"""

    @abstractmethod
    def execute(self, task: str, context: Dict = None) -> Any:
        pass

class BaseTool(ABC):
    """工具接口的统一抽象"""

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def run(self, *args, kwargs) -> Any:
        pass

class AgentFramework(ABC):
    """框架级别的统一抽象"""

    @abstractmethod
    def create_agent(self, role: str, tools: List[BaseTool]) -> BaseAgent:
        pass

    @abstractmethod
    def create_workflow(self, agents: List[BaseAgent], flow: str) -> Any:
        pass`,
          },
          {
            lang: "python",
            code: `# 各框架的设计哲学对比（伪代码）

# LangGraph 风格：图 = 节点 + 边
class LangGraphStyle:
    def build(self):
        graph = StateGraph(MyState)
        graph.add_node("research", research_node)
        graph.add_node("write", write_node)
        graph.add_edge("research", "write")  # 明确的控制流
        graph.add_conditional_edges("write", should_continue)
        return graph.compile()

# CrewAI 风格：角色 + 任务 + 流程
class CrewAIStyle:
    def build(self):
        crew = Crew(
            agents=[researcher, writer],
            tasks=[research_task, write_task],
            process=Process.sequential  # 或 Process.hierarchical
        )
        return crew.kickoff()

# AutoGen 风格：对话驱动
class AutoGenStyle:
    def build(self):
        groupchat = GroupChat(agents=[user_proxy, assistant, critic], messages=[])
        manager = GroupChatManager(groupchat=groupchat, llm_config=llm_config)
        user_proxy.initiate_chat(manager, message="帮我写一份报告")`,
          },
        ],
        table: {
          headers: ["框架", "维护方", "核心范式", "语言支持", "GitHub Stars"],
          rows: [
            ["LangGraph", "LangChain", "有向图状态机", "Python/JS", "10K+"],
            ["CrewAI", "CrewAI Inc.", "角色驱动协作", "Python", "20K+"],
            ["AutoGen", "Microsoft", "多 Agent 对话", "Python/.NET", "30K+"],
          ],
        },
        mermaid: `graph TD
    A["Agent 框架生态"] --> B["LangGraph"]
    A --> C["CrewAI"]
    A --> D["AutoGen"]
    B --> B1["图结构状态机"]
    B --> B2["精确控制流"]
    C --> C1["角色-任务模型"]
    C --> C2["声明式 API"]
    D --> D1["对话驱动"]
    D --> D2["群聊/单聊模式"]`,
        tip: "选框架前先定义需求：需要精确控制流程选 LangGraph，追求开发效率选 CrewAI，需要多 Agent 深度协作选 AutoGen。",
      },
      {
        title: "2. LangGraph：图结构状态机的精妙设计",
        body: `LangGraph 是 LangChain 团队推出的图结构 Agent 框架，它解决了 LangChain 最大的痛点：线性链无法表达复杂控制流。LangGraph 的核心思想是将 Agent 的执行过程建模为一个有向图，每个节点代表一个计算步骤（可以是 LLM 调用、工具执行、或者自定义逻辑），每条边代表状态流转。

与传统的 DAG（有向无环图）不同，LangGraph 支持循环，这使得 Agent 可以"反思-重试"。状态（State）是 LangGraph 的关键抽象——它定义了图中传递的数据结构，所有节点共享同一份状态，通过 TypedDict 管理。这种设计让调试和可观测性变得极其简单：你可以随时查看状态的快照。

LangGraph 还内置了 Checkpoint 机制，支持持久化和恢复。这对于生产环境至关重要——Agent 执行到一半崩溃了，可以从最后一个检查点恢复，而不是从头再来。`,
        code: [
          {
            lang: "python",
            code: `from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    current_step: str
    retry_count: int

def research_node(state: AgentState) -> AgentState:
    print("执行研究节点...")
    return {"messages": ["研究完成"], "current_step": "writing"}

def writing_node(state: AgentState) -> AgentState:
    print("执行写作节点...")
    return {"messages": ["写作完成"], "current_step": "review"}

def should_retry(state: AgentState) -> str:
    if state["retry_count"] < 3:
        return "rewrite"
    return END

# 构建图
graph = StateGraph(AgentState)
graph.add_node("research", research_node)
graph.add_node("write", writing_node)
graph.add_node("rewrite", writing_node)

graph.set_entry_point("research")
graph.add_edge("research", "write")
graph.add_conditional_edges("write", should_retry, {
    "rewrite": "rewrite",
    END: END,
})

app = graph.compile()
result = app.invoke({
    "messages": [], "current_step": "start", "retry_count": 0
})`,
          },
          {
            lang: "python",
            code: `# LangGraph 的检查点持久化
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph

class ArticleState(TypedDict):
    topic: str
    outline: list
    draft: str
    feedback: str

def generate_outline(state: ArticleState) -> ArticleState:
    return {"outline": ["引言", "主体", "结论"]}

def generate_draft(state: ArticleState) -> ArticleState:
    return {"draft": "这是草稿内容..."}

def review_draft(state: ArticleState) -> str:
    if "好" in state.get("feedback", ""):
        return "accept"
    return "revise"

graph = StateGraph(ArticleState)
graph.add_node("outline", generate_outline)
graph.add_node("draft", generate_draft)

graph.set_entry_point("outline")
graph.add_edge("outline", "draft")
graph.add_edge("draft", END)

# 添加检查点保存器
checkpointer = MemorySaver()
app = graph.compile(checkpointer=checkpointer)

# 执行并自动保存状态
config = {"configurable": {"thread_id": "article-001"}}
result = app.invoke({"topic": "LangGraph教程", "outline": [], "draft": "", "feedback": ""}, config)

# 从检查点恢复
snapshot = app.get_state(config)
print(f"当前节点: {snapshot.next}")`,
          },
        ],
        table: {
          headers: ["特性", "LangGraph", "说明"],
          rows: [
            ["控制流", "有向图（支持循环）", "比线性链更灵活"],
            ["状态管理", "TypedDict + 共享状态", "类型安全，调试友好"],
            ["持久化", "Checkpoint 机制", "支持 MemorySaver/SQLite/Postgres"],
            ["可观测性", "内置 stream_events", "实时流式输出每个节点的状态"],
            ["学习曲线", "中等", "需要理解图结构概念"],
          ],
        },
        mermaid: `graph LR
    A["入口节点"] --> B["研究节点"]
    B --> C["写作节点"]
    C --> D{质量检查}
    D -->|通过| E["输出"]
    D -->|不通过| F["修改节点"]
    F --> C
    C -.->|检查点| G["状态持久化"]`,
        warning: "LangGraph 的状态是共享的，多个节点同时修改同一字段可能引发竞态条件。务必使用 Annotated 和 operator 来安全合并状态，避免直接覆盖。",
      },
      {
        title: "3. CrewAI：角色驱动的多 Agent 协作",
        body: `CrewAI 的设计哲学与 LangGraph 截然不同。它不关注"流程怎么编排"，而是关注"谁来做什么"。在 CrewAI 中，你首先定义角色（Agent），每个角色有明确的职责、背景和目标；然后定义任务（Task），将任务分配给合适的角色；最后选择流程（Process）来驱动执行。

CrewAI 支持两种流程模式：Sequential（顺序执行）——任务按照定义的顺序依次执行，前一个任务的输出作为后一个任务的上下文；Hierarchical（层级执行）——由一个 Manager Agent 负责任务分配和协调，Worker Agents 执行具体任务，Manager 会审查结果并决定是否需要返工。

这种"角色扮演"的隐喻让 CrewAI 的学习曲线非常低。你不需要理解图结构或状态机，只需要思考"这个任务需要什么样的专家来完成"。对于内容创作、研究分析、市场调研等场景，CrewAI 的 API 设计显得格外自然。`,
        code: [
          {
            lang: "python",
            code: `from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool

# 定义角色
researcher = Agent(
    role="高级研究分析师",
    goal="深入调查 {topic} 的最新趋势和数据",
    backstory="你是一位拥有 10 年经验的研究分析师，擅长从海量信息中提取关键洞察",
    tools=[SerperDevTool()],
    verbose=True,
    allow_delegation=False,
)

writer = Agent(
    role="科技内容作家",
    goal="根据研究结果撰写高质量的 {topic} 分析报告",
    backstory="你是顶尖科技媒体的资深编辑，擅长将复杂的技术概念转化为通俗易懂的文章",
    tools=[],
    verbose=True,
)

editor = Agent(
    role="内容编辑",
    goal="审查和润色报告，确保质量和一致性",
    backstory="你是拥有 15 年经验的主编，对内容质量有着极高的标准",
    tools=[],
    verbose=True,
)

# 定义任务
research_task = Task(
    description="研究 {topic} 的最新发展、市场规模、主要参与者",
    expected_output="包含关键发现的结构化研究报告",
    agent=researcher,
)

write_task = Task(
    description="基于研究报告撰写 2000 字的深度分析文章",
    expected_output="完整的分析报告，包含引言、分析和建议",
    agent=writer,
)

edit_task = Task(
    description="审查文章的事实准确性、逻辑性和可读性",
    expected_output="润色后的最终版本",
    agent=editor,
)

# 组建 Crew 并执行
crew = Crew(
    agents=[researcher, writer, editor],
    tasks=[research_task, write_task, edit_task],
    process=Process.sequential,
    verbose=2,
)

result = crew.kickoff(inputs={"topic": "AI Agent 框架"})`,
          },
          {
            lang: "python",
            code: `# CrewAI 的层级流程（Hierarchical Process）
from crewai import Agent, Task, Crew, Process

# 定义 Manager Agent（自动创建，也可以手动指定）
manager = Agent(
    role="项目经理",
    goal="协调整个项目流程，分配任务给团队成员",
    backstory="你是一位经验丰富的项目经理，擅长统筹规划和质量控制",
    allow_delegation=True,
)

analyst = Agent(
    role="数据分析师",
    goal="分析数据并生成洞察",
    backstory="你精通数据分析和可视化",
)

developer = Agent(
    role="开发工程师",
    goal="根据分析结果构建原型",
    backstory="你是全栈开发工程师，擅长快速原型开发",
)

# 使用层级流程
crew = Crew(
    agents=[manager, analyst, developer],
    tasks=[
        Task(description="分析用户数据集", expected_output="分析报告", agent=analyst),
        Task(description="构建数据可视化原型", expected_output="可运行的原型", agent=developer),
    ],
    process=Process.hierarchical,
    manager_llm=manager,  # 指定 Manager 使用的 LLM
    verbose=True,
)

# 层级模式下，Manager 会：
# 1. 接收项目目标
# 2. 将任务分配给合适的 Agent
# 3. 审查结果
# 4. 决定是否需要返工或进入下一阶段
result = crew.kickoff()`,
          },
        ],
        table: {
          headers: ["特性", "CrewAI", "说明"],
          rows: [
            ["核心抽象", "Agent + Task + Crew", "角色驱动的声明式 API"],
            ["流程模式", "Sequential / Hierarchical", "顺序执行或 Manager 协调"],
            ["工具集成", "crewai_tools", "丰富的内置工具集"],
            ["回调系统", "支持", "可以在任务开始/完成时触发回调"],
            ["记忆", "短期记忆（上下文传递）", "任务间自动传递上下文"],
          ],
        },
        mermaid: `graph TD
    A["CrewAI 架构"] --> B["Agent 定义"]
    A --> C["Task 定义"]
    A --> D["Crew 编排"]

    B --> B1["角色 + 目标 + 背景"]
    B --> B2["工具列表"]

    C --> C1["描述 + 期望输出"]
    C --> C2["上下文依赖"]

    D --> D1["Sequential 流程"]
    D --> D2["Hierarchical 流程"]
    D1 --> D1a["任务 A -> 任务 B -> 任务 C"]
    D2 --> D2a["Manager -> 分配 -> 审查"]`,
        warning: "CrewAI 的 Hierarchical 模式需要额外的 Manager LLM 调用，成本显著高于 Sequential 模式。对于简单任务链，Sequential 更经济。",
        tip: "CrewAI 的 Agent backstory（背景故事）不仅是装饰——它直接影响 LLM 的行为风格。写得越具体，角色的专业性和一致性越强。",
      },
      {
        title: "4. AutoGen：微软的多 Agent 对话框架",
        body: `AutoGen 由 Microsoft Research 团队开发，是三大框架中"学术味"最浓的一个。它的核心设计哲学是：Agent 之间的协作应该像人类团队一样——通过对话。在 AutoGen 中，每个 Agent 都是一个独立的对话参与者，它们可以一对一聊天，也可以组成群聊（GroupChat），由 Manager 协调。

AutoGen 最突出的特性是 Human-in-the-loop（人在回路）支持。你可以轻松创建一个"用户代理"，让它暂停执行、等待人类输入、然后根据人类反馈继续。这在需要人工审批、代码审查、或者交互式探索的场景中极其有用。

AutoGen 2.0 进行了重大重构，引入了更清晰的应用层（Application Layer）抽象。但需要注意的是，AutoGen 的 API 在 0.2 到 0.4 版本之间发生了剧烈变化，社区代码存在大量版本碎片化问题。新版本采用了更模块化的设计，但学习成本也相应增加。`,
        code: [
          {
            lang: "python",
            code: `import autogen

# 配置 LLM
config_list = [
    {"model": "gpt-4", "api_key": "sk-xxx"},
    {"model": "qwen-plus", "api_key": "sk-xxx", "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1"},
]
llm_config = {"config_list": config_list, "temperature": 0.7}

# 创建 Agent
user_proxy = autogen.UserProxyAgent(
    name="User",
    human_input_mode="TERMINATE",  # 需要人工确认才终止
    max_consecutive_auto_reply=5,
    code_execution_config={"work_dir": "coding", "use_docker": False},
)

coder = autogen.AssistantAgent(
    name="Coder",
    llm_config=llm_config,
    system_message="你是一位资深 Python 工程师，擅长编写高质量代码。",
)

reviewer = autogen.AssistantAgent(
    name="Reviewer",
    llm_config=llm_config,
    system_message="你是代码审查专家。检查代码的正确性、可读性和最佳实践。指出问题但不直接修改代码。",
)

# 创建群聊
groupchat = autogen.GroupChat(
    agents=[user_proxy, coder, reviewer],
    messages=[],
    max_round=15,
    speaker_selection_method="auto",  # auto / round_robin / manual
)

manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config,
)

# 启动对话
user_proxy.initiate_chat(
    manager,
    message="请用 Python 实现一个快速排序算法，包含类型注解和单元测试。",
)`,
          },
          {
            lang: "python",
            code: `# AutoGen 2.0 新 API 风格（应用层抽象）
# 注意：需要安装 autogen-agentchat >= 0.4.0
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

# 创建模型客户端
model_client = OpenAIChatCompletionClient(model="gpt-4")

# 创建 Agent
planner = AssistantAgent(
    name="Planner",
    model_client=model_client,
    system_message="你是项目规划师，负责任务分解和优先级排序。",
)

executor = AssistantAgent(
    name="Executor",
    model_client=model_client,
    system_message="你是执行者，负责编写和运行代码。",
)

evaluator = AssistantAgent(
    name="Evaluator",
    model_client=model_client,
    system_message="你是评估者，负责审查结果并给出反馈。",
)

# 使用 RoundRobin 团队（轮流发言）
team = RoundRobinGroupChat(
    [planner, executor, evaluator],
    termination_condition=MaxMessageTermination(max_messages=20),
)

# 运行
async def run_team():
    stream = team.run_stream(task="构建一个数据分析 Pipeline")
    async for message in stream:
        print(message)`,
          },
        ],
        table: {
          headers: ["特性", "AutoGen", "说明"],
          rows: [
            ["通信模式", "对话驱动", "Agent 之间通过消息交互"],
            ["人类参与", "Human-in-the-loop 原生支持", "可暂停等待人工输入"],
            ["代码执行", "内置沙盒", "支持 Docker 隔离执行"],
            ["群聊管理", "GroupChat + Manager", "自动或手动选择发言者"],
            ["API 稳定性", "0.2→0.4 重大变化", "版本碎片化严重"],
          ],
        },
        mermaid: `sequenceDiagram
    participant U as 用户代理
    participant C as Coder
    participant R as Reviewer
    participant M as GroupChatManager

    U->>M: 发起任务
    M->>C: 分配编码任务
    C->>M: 提交代码
    M->>R: 请求审查
    R->>M: 审查意见
    M->>C: 返工要求
    C->>M: 修改后的代码
    M->>R: 再次审查
    R->>M: 审查通过
    M->>U: 最终结果`,
        tip: "AutoGen 的 code_execution_config 默认在本地运行代码，生产环境务必启用 Docker 沙盒隔离，防止恶意代码执行。",
      },
      {
        title: "5. 架构对比：控制流、通信与状态管理",
        body: `三大框架在架构设计上代表了三种不同的哲学。LangGraph 是"流程优先"——你定义图和状态，框架负责执行；CrewAI 是"角色优先"——你定义角色和任务，框架负责编排；AutoGen 是"对话优先"——你定义参与者和规则，框架负责调度对话。

在控制流方面，LangGraph 提供最精确的控制——你可以精确到每条边的条件和每个节点的实现。CrewAI 提供高层抽象——Sequential 和 Hierarchical 两种模式覆盖了 80% 的场景。AutoGen 最为灵活但也最不可预测——对话驱动意味着执行路径是动态生成的，难以提前预知。

通信模式上，LangGraph 通过共享状态实现节点间通信（隐式、结构化）；CrewAI 通过任务上下文传递（显式、线性）；AutoGen 通过消息传递（显式、异步、多对多）。状态管理方面，LangGraph 的 TypedDict 方案类型最安全，CrewAI 的上下文传递最直观，AutoGen 的消息历史最灵活。`,
        code: [
          {
            lang: "python",
            code: `# 同一个任务：多步数据处理，三种框架的架构差异

# === LangGraph: 显式图结构 ===
from langgraph.graph import StateGraph

class DataState(TypedDict):
    raw_data: str
    cleaned_data: str
    analysis: str
    report: str

graph = StateGraph(DataState)
graph.add_node("fetch", fetch_node)
graph.add_node("clean", clean_node)
graph.add_node("analyze", analyze_node)
graph.add_node("report", report_node)
graph.add_edge("fetch", "clean")
graph.add_edge("clean", "analyze")
graph.add_edge("analyze", "report")
graph.set_entry_point("fetch")
app = graph.compile()
# 执行路径完全确定：fetch -> clean -> analyze -> report

# === CrewAI: 角色驱动 ===
from crewai import Agent, Task, Crew, Process

fetcher = Agent(role="数据获取专家", goal="获取原始数据")
cleaner = Agent(role="数据清洗专家", goal="清洗和标准化数据")
analyst = Agent(role="数据分析专家", goal="执行统计分析")
reporter = Agent(role="报告撰写人", goal="撰写分析报告")

crew = Crew(
    agents=[fetcher, cleaner, analyst, reporter],
    tasks=[
        Task(description="获取数据", agent=fetcher),
        Task(description="清洗数据", agent=cleaner),
        Task(description="分析数据", agent=analyst),
        Task(description="撰写报告", agent=reporter),
    ],
    process=Process.sequential,
)
# 执行路径由任务顺序决定，但每个 Agent 自主决定如何完成

# === AutoGen: 对话驱动 ===
import autogen
# Agent 自主对话决定谁做什么、怎么做
# 没有预定义的流程图
groupchat = autogen.GroupChat(
    agents=[user_proxy, data_engineer, analyst, reviewer],
    messages=[], max_round=20,
)
# 执行路径完全动态，取决于对话内容`,
          },
          {
            lang: "python",
            code: `# 三种框架的状态/上下文管理对比

# LangGraph: 全局共享状态（TypedDict）
class LGState(TypedDict):
    messages: list
    results: dict
    step_count: int
# 所有节点读写同一份状态，支持 Annotated 合并

# CrewAI: 任务上下文链式传递
# Task N 的输出 → Task N+1 的上下文
# 每个 Agent 有自己的"记忆"（对话历史）
# 通过 context 参数显式指定依赖
task2 = Task(
    description="分析数据",
    context=[task1],  # 依赖 task1 的输出
    agent=analyst,
)

# AutoGen: 消息历史
# 每个 Agent 维护自己的消息列表
# GroupChat 维护全局消息列表
# 新消息自动广播给所有参与者
# 通过 system_message 控制 Agent 行为
# 通过 function_map 注册可调用工具`,
          },
        ],
        table: {
          headers: ["维度", "LangGraph", "CrewAI", "AutoGen"],
          rows: [
            ["控制流", "显式有向图", "声明式流程", "动态对话"],
            ["可预测性", "高（图结构确定）", "中（流程确定但执行自主）", "低（完全动态）"],
            ["调试难度", "低（可追踪状态流）", "中（任务输出可追踪）", "高（对话路径不固定）"],
            ["状态管理", "TypedDict 共享", "任务上下文传递", "消息历史"],
            ["循环/分支", "原生支持", "需自定义逻辑", "通过对话规则实现"],
            ["人在回路", "需手动实现", "需自定义", "原生支持"],
          ],
        },
        mermaid: `graph LR
    A["架构对比"] --> B["LangGraph"]
    A --> C["CrewAI"]
    A --> D["AutoGen"]

    B --> B1["精确控制"]
    B --> B2["类型安全"]
    B --> B3["学习成本中"]

    C --> C1["开发效率"]
    C --> C2["API 优雅"]
    C --> C3["学习成本低"]

    D --> D1["灵活性强"]
    D --> D2["人在回路"]
    D --> D3["学习成本高"]`,
        warning: "不要在一个项目中混用多个 Agent 框架——不同框架的状态管理和错误处理机制不兼容，会导致调试噩梦。选择一种框架并深入使用。",
      },
      {
        title: "6. 性能与扩展性对比",
        body: `性能是生产环境选型的关键因素。这里我们从三个维度分析：LLM 调用效率（token 消耗和延迟）、水平扩展能力（并发处理和分布式执行）、以及生态扩展性（工具集成、插件系统和社区支持）。

在 LLM 调用效率方面，LangGraph 通常最节省——因为控制流是确定的，不会产生多余的 Agent 对话轮次。CrewAI 居中——Sequential 模式效率接近 LangGraph，但 Hierarchical 模式因为 Manager 的额外调度调用，token 消耗增加约 30%。AutoGen 通常消耗最高——对话驱动的执行方式可能产生大量中间对话消息，特别是群聊模式下。

扩展性方面，LangGraph 支持多节点部署和分布式执行（通过 LangGraph Platform），CrewAI 通过并行任务执行提升吞吐，AutoGen 支持多进程 Agent 但配置复杂。`,
        code: [
          {
            lang: "python",
            code: `# 性能对比：同一任务的 LLM 调用次数估算

# 场景：研究 + 写作 + 审查，3 步流程
# 假设每步需要 1 次 LLM 调用（不含重试）

benchmark = {
    "LangGraph": {
        "llm_calls": 3,       # 每节点 1 次调用
        "token_estimate": "约 8K",  # 精确控制，无多余调用
        "avg_latency": "~5s",       # 顺序执行，无额外开销
        "parallel_support": True,    # 支持并行节点
    },
    "CrewAI_Sequential": {
        "llm_calls": 3,       # 每任务 1 次调用
        "token_estimate": "约 9K",  # 上下文传递增加少量 token
        "avg_latency": "~6s",
        "parallel_support": False,   # Sequential 不支持并行
    },
    "CrewAI_Hierarchical": {
        "llm_calls": 5,       # 3 任务 + 2 次 Manager 调度
        "token_estimate": "约 14K",  # Manager 额外调用
        "avg_latency": "~9s",
        "parallel_support": True,    # Manager 可并行分配
    },
    "AutoGen_GroupChat": {
        "llm_calls": "8-15",  # 动态对话，难以预估
        "token_estimate": "约 20K+",  # 群聊对话消耗大
        "avg_latency": "~12s+",
        "parallel_support": False,   # 群聊本质是串行
    },
}`,
          },
          {
            lang: "python",
            code: `# LangGraph 的并行节点执行
from langgraph.graph import StateGraph
from typing import TypedDict
import asyncio

class ParallelState(TypedDict):
    query: str
    web_results: str
    db_results: str
    final_report: str

async def web_search(state: ParallelState) -> dict:
    # 模拟网络搜索（可与其他节点并行）
    await asyncio.sleep(2)
    return {"web_results": "网络搜索结果..."}

async def db_query(state: ParallelState) -> dict:
    # 模拟数据库查询（与 web_search 并行）
    await asyncio.sleep(1.5)
    return {"db_results": "数据库查询结果..."}

def combine(state: ParallelState) -> dict:
    return {"final_report": f"Web: {state['web_results']}\nDB: {state['db_results']}"}

graph = StateGraph(ParallelState)
graph.add_node("search", web_search)
graph.add_node("query", db_query)
graph.add_node("combine", combine)

graph.set_entry_point("search")
# 并行边：search 和 query 同时执行
graph.add_edge("search", "combine")
graph.add_edge("query", "combine")
graph.add_edge("combine", "__end__")

app = graph.compile()
# search 和 query 会被异步并行执行`,
          },
        ],
        table: {
          headers: ["指标", "LangGraph", "CrewAI", "AutoGen"],
          rows: [
            ["LLM 调用次数（3步流程）", "3 次（确定性）", "3-5 次", "8-15 次（动态）"],
            ["Token 消耗", "低", "中", "高"],
            ["并行执行", "支持（并行边）", "部分（Hierarchical）", "不支持"],
            ["分布式部署", "LangGraph Platform", "需自定义", "多进程支持"],
            ["流式输出", "stream_events", "支持", "支持"],
            ["成本可控性", "高（流程确定）", "中", "低（动态对话）"],
          ],
        },
        mermaid: `graph LR
    A["性能优化策略"] --> B["减少 LLM 调用"]
    A --> C["并行执行"]
    A --> D["缓存中间结果"]
    
    B --> B1["精确 prompt 设计"]
    B --> B2["批量工具调用"]
    
    C --> C1["LangGraph 并行边"]
    C --> C2["CrewAI 并行任务"]
    
    D --> D1["检查点复用"]
    D --> D2["向量缓存"]`,
        tip: "生产环境的成本优化技巧：① 用便宜的模型（如 GPT-4o-mini）做路由和简单判断，用贵的模型（GPT-4）做核心推理；② 缓存重复的工具调用结果；③ 设置合理的 max_round 防止无限对话。",
      },
      {
        title: "7. 实战选型指南：场景匹配与代码示例",
        body: `理论对比终究要落到实践。本节通过四个典型场景，展示如何选择合适的框架并快速落地。

场景一：内容创作 Pipeline（研究→写作→编辑）。这是 CrewAI 的甜蜜点。角色定义天然契合内容生产流程，每个角色有明确的专业背景和输出标准。

场景二：复杂的代码生成和调试流程。AutoGen 的人机协作能力在这里发挥最大价值——Agent 编写代码、自动执行测试、人类审查关键决策、循环迭代直到通过。

场景三：数据处理和分析流水线。LangGraph 的精确控制流最适合这类确定性强的任务。数据处理的每个步骤（提取→清洗→转换→加载→验证）都是明确的节点，状态传递清晰可追踪。

场景四**：智能客服系统。需要结合框架外的工程能力（消息队列、会话管理、知识库），LangGraph 的流式输出和状态持久化能力最适合生产级部署。`,
        code: [
          {
            lang: "python",
            code: `# 场景一：内容创作 Pipeline（CrewAI 最佳实践）
from crewai import Agent, Task, Crew, Process

# 角色定义——越具体越好
researcher = Agent(
    role="科技趋势研究员",
    goal="发现并分析 {topic} 领域的最新技术趋势",
    backstory="你在顶级科技媒体工作 8 年，对行业趋势有敏锐的洞察力",
    tools=[SerperDevTool()],
)

writer = Agent(
    role="深度报道撰稿人",
    goal="撰写引人入胜的 {topic} 深度报道",
    backstory="你擅长用故事化的方式讲述技术，让复杂的概念变得通俗易懂",
)

crew = Crew(
    agents=[researcher, writer],
    tasks=[
        Task(
            description="研究 {topic} 的 3 个最新趋势，每个趋势包含：技术原理、市场影响、代表公司",
            expected_output="结构化的趋势研究报告，每个趋势 200 字",
            agent=researcher,
        ),
        Task(
            description="基于研究报告撰写一篇面向技术管理者的深度文章",
            expected_output="1500 字的深度报道，包含具体案例和行动建议",
            agent=writer,
            context=[research_task],
        ),
    ],
    process=Process.sequential,
)
result = crew.kickoff(inputs={"topic": "AI Agent 框架"})`,
          },
          {
            lang: "python",
            code: `# 场景三：数据处理流水线（LangGraph 最佳实践）
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class DataPipelineState(TypedDict):
    raw_data: str
    cleaned_data: dict
    transformed_data: dict
    validation_result: str
    errors: Annotated[list, operator.add]

def extract_node(state: DataPipelineState) -> DataPipelineState:
    """数据提取节点：从原始数据源获取"""
    raw = state["raw_data"]
    # 实际场景：读取数据库/API/文件
    return {"raw_data": raw, "errors": []}

def clean_node(state: DataPipelineState) -> DataPipelineState:
    """数据清洗节点：去重、缺失值处理、类型转换"""
    cleaned = {"records": 1000, "removed_duplicates": 23, "filled_missing": 15}
    return {"cleaned_data": cleaned}

def validate_node(state: DataPipelineState) -> str:
    """验证节点：检查数据质量"""
    quality_score = 0.95
    if quality_score > 0.9:
        return "approved"
    return "rejected"

def transform_node(state: DataPipelineState) -> DataPipelineState:
    """数据转换节点：特征工程、聚合"""
    return {"transformed_data": {"features": 50, "aggregations": 12}}

graph = StateGraph(DataPipelineState)
graph.add_node("extract", extract_node)
graph.add_node("clean", clean_node)
graph.add_node("validate", validate_node)
graph.add_node("transform", transform_node)

graph.set_entry_point("extract")
graph.add_edge("extract", "clean")
graph.add_edge("clean", "validate")
graph.add_conditional_edges("validate", validate_node, {
    "approved": "transform",
    "rejected": END,
})
graph.add_edge("transform", END)

app = graph.compile()`,
          },
        ],
        table: {
          headers: ["场景", "推荐框架", "理由", "备选方案"],
          rows: [
            ["内容创作/研究", "CrewAI", "角色定义自然，API 优雅", "AutoGen（需要人机协作时）"],
            ["代码生成/调试", "AutoGen", "人在回路，代码执行沙盒", "LangGraph（流程固定时）"],
            ["数据处理流水线", "LangGraph", "精确控制流，类型安全", "自定义脚本（简单场景）"],
            ["智能客服", "LangGraph", "流式输出，状态持久化", "OpenAI Assistants API"],
            ["多 Agent 研究", "AutoGen", "群聊对话，灵活交互", "CrewAI（简单协作）"],
            ["快速原型", "CrewAI", "学习曲线最低，5 分钟上手", "LangChain Chains"],
          ],
        },
        mermaid: `graph TD
    A["选择决策树"] --> B{"需要精确控制流程?"}
    B -->|是| C{"需要人在回路?"}
    B -->|否| D{"角色定义是否自然?"}
    C -->|是| E["AutoGen"]
    C -->|否| F["LangGraph"]
    D -->|是| G["CrewAI"]
    D -->|否| H["LangGraph"]

    E --> E1["代码生成/调试"]
    F --> F1["数据处理/分析"]
    G --> G1["内容创作/研究"]
    H --> H1["复杂工作流"]`,
        warning: "框架只是工具，不要为了用框架而用框架。简单的任务用简单的方案——如果 50 行 Python 脚本就能解决问题，不需要引入任何 Agent 框架。框架的价值在于管理复杂度，而不要在不需要复杂度的地方制造复杂度。",
        tip: "实战建议：新项目用 CrewAI 快速验证想法，确认流程后再考虑是否需要迁移到 LangGraph 获得更精确的控制。CrewAI 的角色定义和任务描述可以直接复用到 LangGraph 的节点实现中，迁移成本很低。",
      },
    ],
  };
