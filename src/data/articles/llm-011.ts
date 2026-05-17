import { Article } from '../knowledge';

export const article: Article = {
  id: "llm-011",
  title: "LangChain：LLM 应用开发框架",
  category: "llm",
  tags: ["LangChain", "LLM应用", "框架"],
  summary: "从 Chain 到 Agent，掌握 LangChain 的核心概念与最佳实践",
  date: "2026-04-12",
  readTime: "20 min",
  level: "进阶",
  content: [
    {
      title: "1. LangChain 架构概览",
      body: `LangChain 是一个用于构建大语言模型应用的开源框架，由 Harrison Chase 于 2022 年创建。它的核心理念是将 LLM 的能力与外部数据源、工具和计算能力组合起来，形成完整的「应用管线」。LangChain 采用模块化设计，主要包含六大组件：模型 I/O（Models & Prompts）、数据连接（Data Connection）、链（Chains）、记忆（Memory）、回调（Callbacks）以及代理（Agents）。这种架构使得开发者可以像搭积木一样，将不同能力的模块灵活组合。LangChain 支持 Python 和 JavaScript 两种语言实现，底层对接了 OpenAI、Anthropic、Google 等数十家 LLM 提供商，通过统一的接口抽象屏蔽了底层差异。理解 LangChain 的架构是高效使用它的前提——它不是替代 LLM，而是让 LLM 从「聊天窗口」进化为「应用引擎」。`,
      code: [
        {
          lang: "python",
          code: `# LangChain 核心组件一览
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

# 组装最简单的 LLM 管线
prompt = ChatPromptTemplate.from_template("说说{topic}的三个关键点")
model = ChatOpenAI(model="gpt-4")
parser = StrOutputParser()

# 使用 | 操作符链接组件（Expression Language）
chain = prompt | model | parser
result = chain.invoke({"topic": "机器学习"})
print(result)`
        },
        {
          lang: "typescript",
          code: `// TypeScript 版本的 LangChain
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = ChatPromptTemplate.fromTemplate(
  "说说{topic}的三个关键点"
);
const model = new ChatOpenAI({ model: "gpt-4" });
const parser = new StringOutputParser();

const chain = prompt.pipe(model).pipe(parser);
const result = await chain.invoke({ topic: "机器学习" });
console.log(result);`
        }
      ],
      table: {
        headers: ["组件", "职责", "核心类"],
        rows: [
          ["Models I/O", "与大模型交互的输入输出层", "ChatOpenAI, ChatPromptTemplate"],
          ["Data Connection", "加载、转换、存储外部数据", "DocumentLoader, TextSplitter"],
          ["Chains", "将多个组件串联成执行管线", "RunnableSequence, LCEL"],
          ["Memory", "维护对话状态和上下文历史", "ConversationBufferMemory"],
          ["Callbacks", "钩子系统，用于日志和监控", "BaseCallbackHandler"],
          ["Agents", "让 LLM 自主决策和调用工具", "create_openai_tools_agent"]
        ]
      },
      mermaid: `graph LR
    A[用户输入] --> B[Prompt Templates]
    B --> C[LLM Models]
    C --> D[Output Parsers]
    D --> E[Chains]
    E --> F[Memory]
    E --> G[Agents]
    F --> E
    G --> H[Tools]
    H --> C`,
      tip: "使用 LangChain Expression Language (LCEL) 的 | 操作符组合组件，比传统的 Chain 类更灵活且天然支持流式输出。",
      warning: "LangChain 版本更新频繁，API 变动较大。建议使用 langchain-core 的 Stable 接口，避免依赖快速迭代的实验性模块。"
    },
    {
      title: "2. Prompt Templates",
      body: `Prompt Templates 是 LangChain 中管理提示词的核心机制。它允许你将提示词模板化，通过变量注入实现动态生成。ChatPromptTemplate 支持多角色消息（SystemMessage、HumanMessage、AIMessage），这是构建复杂对话逻辑的基础。进阶用法包括：FewShotPromptTemplate（通过示例引导模型输出）、MessagesPlaceholder（动态插入历史消息）以及 OutputFixingParser（自动修复格式错误的输出）。设计高质量的 Prompt 模板是一门工程学科——好的模板应该明确角色、定义输出格式、提供示例，并处理边界情况。LangChain 还提供了 Prompt Hub，可以共享和复用社区中的优质模板。在实际项目中，建议将 Prompt 模板与业务代码分离，通过配置文件或数据库管理，便于迭代和优化。`,
      code: [
        {
          lang: "python",
          code: `from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    FewShotChatMessagePromptTemplate,
)

# 带角色和占位符的模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个专业的{domain}工程师，用简洁的语言回答。"),
    MessagesPlaceholder("history"),
    ("human", "{question}"),
])

# Few-shot 示例引导
examples = [
    {"input": "2+2=?", "output": "4"},
    {"input": "3*5=?", "output": "15"},
]
few_shot = FewShotChatMessagePromptTemplate(
    examples=examples,
    example_prompt=ChatPromptTemplate.from_messages([
        ("human", "{input}"),
        ("ai", "{output}"),
    ]),
)
final_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个数学助手。"),
    few_shot,
    ("human", "{question}"),
])`
        },
        {
          lang: "python",
          code: `# 结构化输出：强制模型返回 JSON
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field

class MovieReview(BaseModel):
    title: str = Field(description="电影标题")
    rating: float = Field(description="评分 1-10", ge=1, le=10)
    pros: list[str] = Field(description="优点列表")
    cons: list[str] = Field(description="缺点列表")

parser = JsonOutputParser(pydantic_object=MovieReview)
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个影评专家。\\n{format_instructions}"),
    ("human", "请评论电影：{movie_name}"),
]).partial(format_instructions=parser.get_format_instructions())

# 模板 + 模型 + 解析器
chain = prompt | ChatOpenAI() | parser
result = chain.invoke({"movie_name": "星际穿越"})`
        }
      ],
      table: {
        headers: ["模板类型", "适用场景", "关键特性"],
        rows: [
          ["PromptTemplate", "简单单轮问答", "字符串替换，轻量级"],
          ["ChatPromptTemplate", "多角色对话系统", "支持 System/Human/AI 消息"],
          ["FewShotPromptTemplate", "需要示例引导的任务", "动态注入示例，提升输出质量"],
          ["PipelinePromptTemplate", "复杂多阶段处理", "将多个模板串联为流水线"],
          ["StructuredOutputParser", "JSON/结构化数据提取", "基于 Pydantic schema 约束输出"]
        ]
      },
      mermaid: `graph TD
    A[ChatPromptTemplate] --> B[System Message]
    A --> C[MessagesPlaceholder]
    A --> D[Human Message]
    A --> E[FewShot Examples]
    B --> F[定义角色和规则]
    C --> G[插入历史消息]
    D --> H[用户问题注入]
    E --> I[提供示范输出]
    F --> J[最终 Prompt]
    G --> J
    H --> J
    I --> J`,
      tip: "使用 .partial() 方法预填充部分变量，可以将固定配置（如格式说明）与运行时变量分离，提升模板复用性。",
      warning: "不要在 Prompt 中硬编码敏感信息（如 API Key、数据库凭证）。敏感信息应通过环境变量或 Secret 管理器注入。"
    },
    {
      title: "3. Chains：构建执行管线",
      body: `Chain 是 LangChain 中组合多个组件的核心抽象。在 LCEL（LangChain Expression Language）出现之前，Chain 主要基于 LLMChain、SimpleSequentialChain 等类实现。LCEL 革命性地引入了声明式管线语法：通过 | 操作符将 Runnable 对象连接起来，形成可执行的工作流。LCEL 的优势在于：天然支持异步执行、流式输出、并行分支（RunnableParallel）和重试机制。一个典型的 Chain 可以是简单的「模板→模型→解析器」三段式，也可以包含条件分支、循环和并行处理。LCEL 引入了 RunnablePassthrough（透传）、RunnableBranch（条件分支）和 RunnableParallel（并行执行）等高级原语，使得复杂业务逻辑可以用声明式方式表达。掌握 LCEL 是成为 LangChain 进阶使用者的必经之路。`,
      code: [
        {
          lang: "python",
          code: `from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableBranch

# 并行执行：同时生成摘要和翻译
model = ChatOpenAI(model="gpt-4")

branch_chain = RunnableParallel(
    summary=RunnablePassthrough() | ChatPromptTemplate.from_template(
        "用一句话总结：{text}"
    ) | model,
    translation=RunnablePassthrough() | ChatPromptTemplate.from_template(
        "翻译成英文：{text}"
    ) | model,
)

result = branch_chain.invoke({
    "text": "LangChain 是一个强大的 LLM 应用框架。"
})
print("摘要:", result["summary"].content)
print("翻译:", result["translation"].content)`
        },
        {
          lang: "python",
          code: `# 条件分支：根据问题类型路由到不同处理管线
from langchain_core.runnables import RunnableBranch

math_chain = ChatPromptTemplate.from_template("计算：{q}") | model
coding_chain = ChatPromptTemplate.from_template("写代码：{q}") | model
general_chain = ChatPromptTemplate.from_template("回答：{q}") | model

router = RunnableBranch(
    (lambda x: "计算" in x["q"], math_chain),
    (lambda x: "代码" in x["q"] or "写" in x["q"], coding_chain),
    general_chain,  # 默认分支
)

# 自动路由到正确的处理管线
result = router.invoke({"q": "计算 1+2+3"})`
        }
      ],
      table: {
        headers: ["LCEL 原语", "功能", "类比"],
        rows: [
          ["RunnableSequence (|)", "顺序执行，前一个输出是后一个输入", "Unix 管道 |"],
          ["RunnableParallel", "并行执行多个分支，结果合并为字典", "Promise.all()"],
          ["RunnablePassthrough", "透传输入，常用于构建并行分支", "Identity 函数"],
          ["RunnableBranch", "条件判断，路由到不同管线", "if-elif-else"],
          ["RunnableLambda", "将任意 Python 函数包装为 Runnable", "适配器模式"],
          ["RunnableRetry", "自动重试失败的操作", "指数退避重试"]
        ]
      },
      mermaid: `graph LR
    A[输入] --> B{RunnableBranch}
    B -->|"条件1"| C[数学管线]
    B -->|"条件2"| D[编程管线]
    B -->|"默认"| E[通用管线]
    C --> F[合并结果]
    D --> F
    E --> F
    F --> G[输出]`,
      tip: "LCEL 管线天然支持 .stream() 方法，可以实现 Token 级别的流式输出，这对改善用户体验至关重要。",
      warning: "RunnableBranch 的条件判断是同步执行的，不要在 lambda 函数中执行耗时操作，否则会阻塞整个管线。"
    },
    {
      title: "4. Memory 管理",
      body: `LLM 本身是无状态的——每次调用都是独立的请求。Memory 组件让 LangChain 应用具备「记忆能力」，能够维护对话历史和上下文状态。LangChain 提供了多种 Memory 实现：ConversationBufferMemory 保存完整对话历史，适合短对话；ConversationBufferWindowMemory 只保留最近 N 轮对话，控制上下文长度；ConversationSummaryMemory 将历史对话压缩为摘要，适合长对话场景；ConversationKnowledgeGraphMemory 利用知识图谱存储实体关系。在 RAG 应用中，通常还需要结合向量数据库实现「长期记忆」，将重要信息持久化存储。Memory 的设计需要考虑三个关键问题：存储容量（Token 限制）、检索效率（如何快速找到相关上下文）以及成本（存储和检索的 API 调用开销）。`,
      code: [
        {
          lang: "python",
          code: `from langchain.memory import (
    ConversationBufferWindowMemory,
    ConversationSummaryMemory,
)
from langchain_openai import ChatOpenAI

# 滑动窗口记忆：只保留最近 3 轮对话
window_memory = ConversationBufferWindowMemory(
    k=3,  # 最近 3 轮
    return_messages=True,
    memory_key="history",
)

# 摘要记忆：自动将历史对话压缩为摘要
summary_memory = ConversationSummaryMemory(
    llm=ChatOpenAI(model="gpt-4"),
    return_messages=True,
    memory_key="summary",
)

# 在 Chain 中使用
from langchain.chains import ConversationChain

chain = ConversationChain(
    llm=ChatOpenAI(model="gpt-4"),
    memory=window_memory,
    verbose=True,
)
response = chain.predict(input="我们刚才讨论了什么？")`
        },
        {
          lang: "python",
          code: `# 自定义 Memory：结合向量数据库实现长期记忆
from langchain.memory import VectorStoreRetrieverMemory
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.docstore import InMemoryDocstore

# 创建向量存储
embeddings = OpenAIEmbeddings()
vectorstore = FAISS(
    embedding_function=embeddings,
    index=None,
    docstore=InMemoryDocstore(),
    index_to_docstore_id={},
)

# 向量检索记忆：按语义相似度检索相关历史
retriever_memory = VectorStoreRetrieverMemory(
    retriever=vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3}
    ),
    memory_key="relevant_context",
)

# 保存记忆
retriever_memory.save_context(
    {"input": "我喜欢吃川菜"},
    {"output": "好的，我记住了你喜欢川菜。"}
)`
        }
      ],
      table: {
        headers: ["Memory 类型", "存储策略", "适用场景"],
        rows: [
          ["Buffer", "保存全部历史", "短对话，上下文不超 Token 限制"],
          ["BufferWindow", "保留最近 N 轮", "中等长度对话，控制成本"],
          ["Summary", "LLM 压缩为摘要", "长对话，需要浓缩关键信息"],
          ["Entity", "提取并跟踪实体", "需要记住人名、地点等实体"],
          ["VectorStore", "语义相似度检索", "大规模长期记忆，RAG 场景"],
          ["KG (知识图谱)", "存储实体关系", "复杂关系推理场景"]
        ]
      },
      mermaid: `graph TD
    A[用户输入] --> B[Memory 加载]
    B --> C{Memory 类型}
    C -->|"短对话"| D[Buffer/Window]
    C -->|"长对话"| E[Summary]
    C -->|"大规模"| F[VectorStore]
    D --> G[LLM + 上下文]
    E --> G
    F --> G
    G --> H[输出响应]
    H --> I[Memory 保存]
    I --> D
    I --> E
    I --> F`,
      tip: "生产环境推荐使用「滑动窗口 + 向量检索」混合策略：窗口记忆保证近期对话连贯性，向量检索提供长期记忆的精准召回。",
      warning: "不要将所有对话历史都塞进 Context Window。GPT-4 的 128K 上下文看似很大，但过长的上下文会导致「中间迷失」现象（Lost in the Middle），关键信息可能被忽略。"
    },
    {
      title: "5. Tools 与 Function Calling",
      body: `Tools 是 LangChain 让 LLM 与外部世界交互的桥梁。通过 Tool 抽象，开发者可以将任意 Python 函数包装为 LLM 可调用的工具。OpenAI 的 Function Calling 机制进一步提升了工具调用的可靠性——模型不是自由生成文本，而是按照预定义的 JSON Schema 生成函数调用参数。LangChain 提供了丰富的内置工具：搜索引擎、代码执行器、数据库查询、网页抓取器等。同时，@tool 装饰器使得自定义工具的开发极其简洁。进阶用法包括：Tool 组合（多个工具串联）、异步工具（AsyncTool）、工具路由（选择最合适的工具）以及工具结果的后处理。设计高质量 Tool 的关键在于：清晰的描述（Description 直接影响模型选择）、精确的参数类型定义、以及完善的错误处理。`,
      code: [
        {
          lang: "python",
          code: `from langchain.tools import tool
from langchain_openai import ChatOpenAI

# 使用装饰器快速定义工具
@tool
def calculate_age(birth_year: int) -> int:
    """根据出生年份计算年龄（2026年为基准）。"""
    return 2026 - birth_year

@tool
def get_weather(city: str) -> str:
    """查询指定城市的当前天气情况。"""
    # 实际项目中调用天气 API
    weather_db = {"北京": "晴 25°C", "上海": "多云 28°C"}
    return weather_db.get(city, f"未知城市: {city}")

# 将工具绑定到 LLM
llm = ChatOpenAI(model="gpt-4")
llm_with_tools = llm.bind_tools([calculate_age, get_weather])

# 模型自动决定何时调用工具
response = llm_with_tools.invoke("北京今天天气怎么样？我1990年出生，今年多大？")`
        },
        {
          lang: "python",
          code: `# 结构化工具定义 + 手动执行
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

class SearchInput(BaseModel):
    query: str = Field(description="搜索关键词")
    max_results: int = Field(description="最大返回数", default=5)

def search_wikipedia(query: str, max_results: int = 5) -> str:
    """从维基百科搜索信息。"""
    import wikipedia
    results = wikipedia.search(query, results=max_results)
    summaries = [wikipedia.summary(r, sentences=2) for r in results[:2]]
    return "\\n".join(summaries)

search_tool = StructuredTool.from_function(
    func=search_wikipedia,
    name="wikipedia_search",
    description="搜索维基百科获取背景知识",
    args_schema=SearchInput,
    return_direct=False,
)`
        }
      ],
      table: {
        headers: ["工具类型", "定义方式", "特点"],
        rows: [
          ["@tool 装饰器", "函数 + 装饰器", "最简洁，适合快速开发"],
          ["StructuredTool", "Pydantic Schema + 函数", "参数校验，类型安全"],
          ["BaseTool 子类", "继承基类", "完全自定义，适合复杂逻辑"],
          ["内置工具集", "langchain-community.tools", "开箱即用，涵盖常见场景"],
          ["MCP 工具", "Model Context Protocol", "标准化协议，跨平台复用"]
        ]
      },
      mermaid: `graph LR
    A[用户问题] --> B[LLM 分析]
    B --> C{需要工具？}
    C -->|"是"| D[生成 Function Call]
    C -->|"否"| E[直接回答]
    D --> F[执行工具]
    F --> G[工具结果]
    G --> H[LLM 整合结果]
    H --> I[最终回答]
    E --> I`,
      tip: "Tool 的 description 字段至关重要——模型完全依赖描述来判断何时调用哪个工具。用清晰、具体的语言描述工具的用途和适用场景。",
      warning: "工具执行是安全敏感操作。永远不要让 LLM 直接执行任意代码（如 Python REPL），应在沙箱环境中运行，并对输入进行严格校验。"
    },
    {
      title: "6. Agent 模式",
      body: `Agent 是 LangChain 中最强大的抽象——它让 LLM 从被动回答者变成主动决策者。与 Chain 的线性执行不同，Agent 采用「思考→行动→观察」的循环（ReAct 模式），根据环境反馈动态调整策略。LangChain 支持多种 Agent 类型：Zero-shot ReAct Agent（无需示例，直接推理）、OpenAI Functions Agent（利用 Function Calling）、Self-Ask-with-Search Agent（自动拆解子问题并搜索）、Plan-and-Execute Agent（先制定计划再逐步执行）。Agent 的核心组件包括：LLM（决策引擎）、Tools（行动能力）、Memory（状态维护）和 AgentExecutor（循环控制器）。构建 Agent 时，选择合适的 Agent 类型比调参更重要——简单任务用 Chain，复杂多步任务才用 Agent。`,
      code: [
        {
          lang: "python",
          code: `from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain.tools import tool

@tool
def search(query: str) -> str:
    """搜索互联网获取信息。"""
    return f"搜索结果: 关于'{query}'的相关信息..."

@tool
def calculator(expression: str) -> str:
    """计算数学表达式。"""
    return str(eval(expression))

# 创建 Agent
llm = ChatOpenAI(model="gpt-4", temperature=0)
tools = [search, calculator]

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有帮助的助手，善用工具来回答问题。"),
    ("human", "{input}"),
    MessagesPlaceholder("agent_scratchpad"),
])

agent = create_openai_functions_agent(llm, tools, prompt)
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=5,
    handle_parsing_errors=True,
)

result = executor.invoke({"input": "今天北京天气如何？"})`
        },
        {
          lang: "python",
          code: `# 自定义 Agent：实现 ReAct 推理循环
from langchain.agents import AgentOutputParser
from langchain_core.agents import AgentAction, AgentFinish
import re

class ReactOutputParser(AgentOutputParser):
    """解析 ReAct 格式的输出。"""

    def parse(self, text: str) -> AgentAction | AgentFinish:
        # 检查是否有 Action
        if "Action:" in text:
            action_match = re.search(r"Action:\\s*(.+)", text)
            input_match = re.search(r"Action Input:\\s*(.+)", text, re.DOTALL)
            if action_match and input_match:
                return AgentAction(
                    tool=action_match.group(1).strip(),
                    tool_input=input_match.group(1).strip(),
                    log=text,
                )
        # 最终答案
        if "Final Answer:" in text:
            answer = text.split("Final Answer:")[-1].strip()
            return AgentFinish({"output": answer}, log=text)
        raise ValueError(f"无法解析: {text}")`
        }
      ],
      table: {
        headers: ["Agent 类型", "推理模式", "最佳场景"],
        rows: [
          ["Zero-shot ReAct", "Thought-Action-Observation 循环", "通用多步推理任务"],
          ["OpenAI Functions", "基于 Function Calling 的工具调用", "需要精确参数传递的工具场景"],
          ["Self-Ask-with-Search", "自动拆解子问题 + 搜索", "需要多轮搜索的复杂问题"],
          ["Plan-and-Execute", "先规划再执行", "需要全局视角的长流程任务"],
          ["Structured Chat", "结构化输出，支持对话历史", "需要维护多轮对话的 Agent"]
        ]
      },
      mermaid: `graph TD
    A[用户输入] --> B[Agent 思考 Thought]
    B --> C{需要工具？}
    C -->|"是"| D[选择工具 Action]
    C -->|"否"| E[给出答案 Final Answer]
    D --> F[执行工具]
    F --> G[观察结果 Observation]
    G --> B
    E --> H[输出给用户]`,
      tip: "Agent 的 max_iterations 参数很重要，设置合理的上限（通常 5-10）可以防止无限循环。同时设置 handle_parsing_errors=True 增强鲁棒性。",
      warning: "Agent 比 Chain 更不可控。在生产环境中，优先使用确定性更强的 Chain。Agent 适用于探索性任务，但需要严格的测试和监控。"
    },
    {
      title: "7. 实战：构建 RAG 应用",
      body: `RAG（Retrieval-Augmented Generation，检索增强生成）是 LangChain 最具代表性的应用场景。RAG 的核心思想是：先将外部知识注入向量数据库，查询时检索相关文档作为上下文，再让 LLM 基于上下文生成回答。这种方法解决了 LLM 的知识时效性和幻觉问题。一个完整的 RAG 管线包含五个阶段：文档加载（加载 PDF、网页、数据库等）、文档分块（将长文档切分为有意义的片段）、向量化（使用 Embedding 模型转换为向量）、检索（根据查询相似度匹配）和生成（LLM 结合检索结果生成回答）。LangChain 的 RAG 实现提供了灵活的配置选项：支持多种分块策略（固定长度、递归、语义）、多种向量数据库（FAISS、Pinecone、Chroma、Milvus）以及多种重排序策略。实战中，RAG 的效果很大程度上取决于文档分块策略和检索质量，而非 LLM 本身。`,
      code: [
        {
          lang: "python",
          code: `from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI

# 1. 加载文档
loader = PyPDFLoader("langchain_docs.pdf")
documents = loader.load()

# 2. 分块（递归字符分割）
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,      # 每块 500 字符
    chunk_overlap=50,    # 重叠 50 字符保持上下文
    separators=["\\n\\n", "\\n", "。", "，", " ", ""],
)
chunks = splitter.split_documents(documents)

# 3. 向量化并存储
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(chunks, embeddings)

# 4. 检索 + 生成
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"),
    retriever=retriever,
    return_source_documents=True,
)`
        },
        {
          lang: "python",
          code: `# 进阶 RAG：带上下文压缩和重排序
from langchain.chains import ContextualCompressionRetrieval
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain_core.prompts import PromptTemplate

# 自定义 Prompt 模板
RAG_PROMPT = PromptTemplate.from_template("""\
基于以下上下文回答问题。如果上下文中没有相关信息，请直接说明。

上下文：
{context}

问题：{question}
回答：""")

# 上下文压缩：用 LLM 提取每个文档中与问题相关的部分
compressor = LLMChainExtractor.from_llm(ChatOpenAI(model="gpt-4"))
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
)

# 使用自定义 Prompt 的 RAG Chain
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4", temperature=0),
    retriever=compression_retriever,
    chain_type_kwargs={"prompt": RAG_PROMPT},
)`
        }
      ],
      table: {
        headers: ["RAG 阶段", "核心组件", "关键参数"],
        rows: [
          ["文档加载", "PyPDFLoader, WebBaseLoader", "文件格式、编码"],
          ["文档分块", "RecursiveCharacterTextSplitter", "chunk_size, chunk_overlap"],
          ["向量化", "OpenAIEmbeddings, BGEEmbeddings", "Embedding 模型选择"],
          ["向量存储", "FAISS, Chroma, Pinecone", "索引类型、距离度量"],
          ["检索", "相似度检索、MMR", "k 值、相似度阈值"],
          ["压缩", "LLMChainExtractor, 重排序", "压缩粒度、保留比例"],
          ["生成", "RetrievalQA, create_stuff_documents_chain", "Prompt 模板、温度"]
        ]
      },
      mermaid: `graph LR
    A[原始文档] --> B[文档加载]
    B --> C[文本分块]
    C --> D[向量化 Embedding]
    D --> E[(向量数据库)]
    F[用户查询] --> G[查询向量化]
    G --> E
    E --> H[检索 Top-K]
    H --> I[上下文压缩]
    I --> J[LLM 生成回答]
    J --> K[最终输出]`,
      tip: "RAG 调优的优先级：文档分块策略 > 检索质量 > Prompt 设计 > LLM 选择。chunk_size 建议从 300-500 开始实验，chunk_overlap 设为 chunk_size 的 10-15%。",
      warning: "RAG 不是银弹。对于需要推理和综合分析的问题，纯 RAG 可能不够。考虑结合 Agent 模式（如 Self-RAG），让模型在检索不足以回答问题时主动搜索或推理。"
    },
  ],
};
