import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-003",
    title: "ReAct：推理与行动的循环",
    category: "agent",
    tags: ["ReAct", "推理", "Agent"],
    summary: "让大模型边思考边行动，理解 ReAct 范式如何提升 Agent 能力",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么需要 ReAct：纯推理与纯行动的局限",
            body: `在大语言模型的发展过程中，研究者发现**两种极端策略都存在明显的局限性**。纯推理策略（如 Chain-of-Thought）让模型在内部进行多步思考，但不与外部环境交互。这种方式在数学推理、逻辑推导等封闭任务上表现优异，但一旦涉及需要外部知识的开放任务——比如回答「2024年诺贝尔奖得主是谁」——模型只能依赖训练数据中的过期信息，无法获取最新事实。

另一方面，纯行动策略（如早期的 Toolformer）让模型直接调用工具，但缺少中间推理步骤。模型看到问题后直接决定调用哪个工具、传入什么参数，这就像让一个人不假思索地行动——面对复杂问题时容易做出错误决策。比如用户问「北京今天气温比上海高吗」，纯行动模型可能同时调用两个天气 API，但如果其中一个 API 返回格式异常，模型因为没有推理过程就无法灵活调整策略。

ReAct（Reasoning + Acting）的核心洞察是：**推理和行动不是对立的，而是互补的**。推理帮助模型制定策略、理解工具返回的结果、纠正执行中的错误；行动则为推理提供真实世界的事实依据，避免模型「闭门造车」。两者的交替循环构成了一个强大的认知框架——就像人类在解决问题时，也是边想边做、根据结果调整思路的。`,
            code: [
                {
                    lang: "python",
                    code: `# 纯推理（CoT）的局限：无法获取外部信息
prompt = """
问：埃菲尔铁塔有多高？
答：让我一步步思考。
埃菲尔铁塔是巴黎的地标建筑...
（模型只能基于训练数据回答，可能不准确或过时）
"""

# 纯行动（Toolformer）的局限：缺少策略思考
prompt = """
问：比较北京和上海今天的天气
[调用 weather_api("北京")]
[调用 weather_api("上海")]
（如果API返回异常，模型没有推理能力来处理）`
                },
                {
                    lang: "python",
                    code: `# ReAct 范式：推理与行动交替
react_trace = """
Thought: 用户想知道北京和上海今天的天气差异，
        我需要分别查询两个城市的天气信息。
Action: weather_api
Action Input: {"city": "北京"}
Observation: {"temp": 22, "condition": "晴"}
Thought: 已获取北京天气，现在查询上海。
Action: weather_api
Action Input: {"city": "上海"}
Observation: {"temp": 25, "condition": "多云"}
Thought: 北京22度晴天，上海25度多云，
        上海比北京高3度。可以给出答案了。
Answer: 上海今天25度多云，北京22度晴天，上海比北京高3度。
"""`
                }
            ],
            table: {
                headers: ["策略", "优势", "劣势", "适用场景"],
                rows: [
                    ["纯推理（CoT）", "逻辑严密、可解释", "无法获取外部信息、知识过时", "数学题、逻辑推导"],
                    ["纯行动（Toolformer）", "能获取实时数据", "缺少策略思考、容错差", "简单工具调用"],
                    ["ReAct（推理+行动）", "兼顾推理和实时信息、容错强", "token 消耗大、速度较慢", "复杂多步问答、Agent 任务"],
                ]
            },
            mermaid: `graph TD
    A["问题输入"] --> B["纯推理？"]
    B -->|是| C["内部思考链"]
    C --> D["直接输出"]
    B -->|否| E["纯行动？"]
    E -->|是| F["直接调用工具"]
    F --> G["输出结果"]
    E -->|否| H["ReAct 循环"]
    H --> I["Thought 推理"]
    I --> J["Action 行动"]
    J --> K["Observation 观察"]
    K --> I
    I -.->|推理充分| L["Answer 回答"]`,
            tip: "判断是否需要 ReAct 的标准：如果任务需要外部信息或工具调用，且涉及多步决策——就用 ReAct。简单查询用纯行动，纯逻辑题用 CoT。",
            warning: "ReAct 不是万能药。对于不需要工具的单步推理任务，使用 ReAct 反而会增加不必要的 token 消耗和延迟。",
        },
        {
            title: "2. ReAct 论文核心思想解读",
            body: `ReAct 范式由 Yao 等人在 2022 年的论文「ReAct: Synergizing Reasoning and Acting in Language Models」中正式提出。论文的核心贡献在于揭示了一个关键现象：**推理轨迹和行动轨迹之间存在相互增强的协同效应**。

论文通过在多个基准任务上的实验证明了这一假设。在 HotpotQA（多跳问答）任务上，ReAct 比纯推理（CoT）准确率高出 4.7 个百分点，比纯行动（Act-only）高出 10.6 个百分点。更重要的是，**ReAct 在遇到错误时表现出更强的自我纠正能力**——当工具返回意外结果时，模型能通过推理步骤识别异常并调整策略，而不是盲目继续。

论文提出了一个统一的提示格式，将 Thought、Action、Observation 三种信号交织在同一个序列中。这种设计的精妙之处在于：**它不需要修改模型架构，只需要通过精心设计的 in-context learning 示例，就能让预训练的语言模型学会这种交替模式**。论文还发现，推理轨迹对于「决策制定」（决定下一步调用什么工具）和「结果解释」（理解工具返回的内容）至关重要，而行动轨迹则为推理提供了无法从模型参数中获取的外部事实。

值得注意的是，ReAct 不仅适用于问答任务，论文还展示了它在交互决策任务（如 ALFWorld 环境中的导航）上的优异表现，证明了这一范式的通用性。`,
            code: [
                {
                    lang: "python",
                    code: `# ReAct 论文中的提示模板结构
REACT_PROMPT = """
Answer the following questions as best you can.
You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought: {agent_scratchpad}
"""`
                },
                {
                    lang: "python",
                    code: `# 论文中的 Few-shot 示例（简化版）
FEW_SHOT_EXAMPLE = """
Question: What profession does Nicholas Ray and Elia Kazan have in common?
Thought: I need to search Nicholas Ray and Elia Kazan, find their
        professions, then find the common one.
Action: Search
Action Input: "Nicholas Ray"
Observation: Nicholas Ray (born Raymond Nicholas Kienzle Jr., 1911-1979)
             was an American film director, screenwriter, and actor.
Thought: Nicholas Ray is a film director. Now I need to search
        Elia Kazan.
Action: Search
Action Input: "Elia Kazan"
Observation: Elia Kazan was a Greek-American director, producer,
             screenwriter, and actor.
Thought: Both are film directors. I can answer now.
Final Answer: Film director.
"""`
                }
            ],
            table: {
                headers: ["实验任务", "CoT 准确率", "Act-only 准确率", "ReAct 准确率", "提升幅度"],
                rows: [
                    ["HotpotQA（多跳问答）", "28.4%", "22.5%", "33.1%", "+4.7% vs CoT"],
                    ["FeverOUS（事实验证）", "45.2%", "38.6%", "56.3%", "+11.1% vs CoT"],
                    ["ALFWorld（导航决策）", "34.0%", "72.0%", "79.0%", "+7.0% vs Act"],
                    ["WebShop（购物决策）", "N/A", "38.0%", "42.0%", "+4.0% vs Act"],
                ]
            },
            mermaid: `sequenceDiagram
    participant U as 用户
    participant M as LLM
    participant T as 工具
    U->>M: Question
    M->>M: Thought: 分析问题
    M->>T: Action + Action Input
    T-->>M: Observation
    M->>M: Thought: 理解结果
    M->>T: Action + Action Input
    T-->>M: Observation
    M->>M: Thought: 推理完成
    M->>U: Final Answer`,
            tip: "阅读 ReAct 论文时，重点关注 Section 3.2 的「Reasoning for Acting」和 Section 3.3 的「Acting for Reasoning」，这两个小节精辟地阐述了推理与行动的互补关系。",
            warning: "论文的 Few-shot 示例数量对效果影响很大。示例太少模型学不会交替模式，示例太多浪费 context window。建议 2-3 个高质量示例。",
        },
        {
            title: "3. Thought-Action-Observation 循环详解",
            body: `ReAct 的核心运行机制是 Thought-Action-Observation（思考-行动-观察）循环，这是一个不断迭代直到找到答案的过程。理解这个循环的关键在于把握每个环节的职责和它们之间的信息流动。

**Thought（思考）是循环的起点和决策中枢**。在每个 Thought 步骤中，模型需要完成三件事：第一，分析当前状态——我已经知道了什么？还缺什么信息？第二，决定下一步行动——应该调用哪个工具？传入什么参数？第三，判断是否可以结束——我已经掌握了足够的信息来回答原始问题吗？这三个子任务构成了 Thought 的完整思维链。

Action（行动）是将决策转化为实际操作。模型从可用的工具集中选择一个，并构造合适的输入参数。这个步骤看似简单，但实践中经常出现问题：参数格式错误、工具选择错误、或者在不该调用工具的时候调用了工具。一个好的 ReAct 实现需要在提示词中清晰地描述每个工具的用途、输入格式和返回格式。

Observation（观察）是工具执行后返回的结果。这个步骤通常被低估，但实际上**Observation 的质量直接影响下一轮 Thought 的效果**。如果 Observation 信息量不足（比如搜索引擎只返回了标题没有摘要），模型在下一轮 Thought 中可能做出错误判断。因此，工具的设计需要确保返回的信息是「对模型有用的」——简洁、结构化、包含关键信息。

循环的终止条件是模型在 Thought 中判断「I now know the final answer」，然后输出 Final Answer。但循环也可能因为达到最大步数限制而强制终止，这时需要设计优雅降级策略。`,
            code: [
                {
                    lang: "python",
                    code: `# Thought-Action-Observation 循环的伪代码实现
class ReActLoop:
    def __init__(self, llm, tools, max_iterations=10):
        self.llm = llm
        self.tools = tools
        self.max_iterations = max_iterations
    
    def run(self, question: str) -> str:
        scratchpad = ""
        for i in range(self.max_iterations):
            # Thought: 模型决定下一步
            response = self.llm.generate(
                prompt=question, scratchpad=scratchpad
            )
            thought, action, action_input = response.parse()
            
            if response.is_final_answer:
                return response.final_answer
            
            # Action: 执行工具调用
            observation = self.tools.execute(action, action_input)
            
            # 更新 scratchpad，进入下一轮
            scratchpad += f"\\nThought: {thought}\\n"
            scratchpad += f"Action: {action}\\n"
            scratchpad += f"Action Input: {action_input}\\n"
            scratchpad += f"Observation: {observation}\\n"
        
        return "达到最大步数，无法完成"`
                },
                {
                    lang: "python",
                    code: `# 一个完整的 TAO 循环示例（追踪天气比较）
# Iteration 1
thought_1 = "我需要查询北京和上海的天气来比较"
action_1 = "weather_query"
input_1 = '{"city": "北京", "field": "temperature"}'
obs_1 = '{"city": "北京", "temp": 22, "unit": "celsius"}'

# Iteration 2
thought_2 = "北京是22度，还需要查上海的温度"
action_2 = "weather_query"
input_2 = '{"city": "上海", "field": "temperature"}'
obs_2 = '{"city": "上海", "temp": 25, "unit": "celsius"}'

# Iteration 3
thought_3 = "北京22度，上海25度，上海更高"
final_answer = "上海比北京高3度（25°C vs 22°C）"

print(f"共执行 {3} 轮 TAO 循环得到答案")`
                }
            ],
            table: {
                headers: ["循环阶段", "模型做什么", "输入", "输出", "常见错误"],
                rows: [
                    ["Thought", "分析状态、决定策略、判断终止", "问题 + 历史 TAOb 记录", "思考文本 + 行动决策", "思考不充分、过早终止"],
                    ["Action", "选择工具、构造参数", "工具名称 + 参数描述", "具体的工具调用", "选错工具、参数格式错误"],
                    ["Observation", "接收工具返回结果", "工具执行结果", "观察文本", "结果信息不足、格式混乱"],
                ]
            },
            mermaid: `graph LR
    A["Thought 1"] -->|"决定调用"| B["Action 1"]
    B -->|"执行"| C["Tool"]
    C -->|"返回"| D["Observation 1"]
    D -->|"反馈到"| E["Thought 2"]
    E -->|"决定调用"| F["Action 2"]
    F -->|"执行"| G["Tool"]
    G -->|"返回"| H["Observation 2"]
    H -->|"反馈到"| I["Thought 3"]
    I -->|"判断完成"| J["Final Answer"]
    I -.->|"继续循环"| E`,
            tip: "调试 ReAct Agent 时，打印完整的 scratchpad（所有 Thought/Action/Observation 历史）是最重要的调试手段。它能帮你精确定位哪一步出了问题。",
            warning: "循环步数上限设置很关键。太低（<3）可能导致复杂任务无法完成，太高（>10）会造成 token 浪费和响应延迟。建议默认设为 6-8。",
        },
        {
            title: "4. ReAct 与 CoT、ToT 的对比分析",
            body: `理解 ReAct 最好的方式是将它与相关的推理范式进行对比。Chain-of-Thought（CoT）、Tree-of-Thoughts（ToT）和 ReAct 代表了三种不同的增强 LLM 推理能力的思路，它们各有适用场景。

CoT（思维链）是最早的推理增强方法，通过在提示中要求模型「一步步思考」，引导模型生成中间推理步骤。CoT 的优势是简单——不需要任何外部工具或环境交互，只需要修改提示词。但 CoT 的根本局限是「封闭性」：**所有的推理都在模型内部完成，无法获取训练数据之外的信息**。如果问题需要实时数据、API 调用或环境交互，CoT 就无能为力。

ToT（思维树）是对 CoT 的扩展，它不再线性地推进推理，而是维护一棵推理树——在每一步生成多个可能的推理分支，通过评估函数选择最优路径。ToT 适合需要搜索和回溯的复杂规划问题，比如下棋、写作、代码生成。但 ToT 的 token 消耗是 CoT 的数倍，而且同样缺乏与环境交互的能力。

ReAct 与两者的关系可以用一个公式概括：**ReAct = CoT 的推理能力 + 环境交互能力**。与 CoT 相比，ReAct 多了行动和观察环节，使推理可以基于真实世界的事实。与 ToT 相比，ReAct 的搜索空间更受约束（每次只有一个 Action 分支），但获得的 Observation 是真实可靠的反馈，而不是模型的自我评估。在实际应用中，这三种方法不是互斥的——可以在 ReAct 的 Thought 步骤中使用 CoT 风格的详细推理，也可以在 ToT 的每个节点中使用 ReAct 与环境交互。`,
            code: [
                {
                    lang: "python",
                    code: `# CoT vs ReAct 的 prompt 对比
# CoT prompt - 只思考不行动
COT_PROMPT = """
Question: 如果一家公司年收入增长20%，成本增长15%，
        利润率会如何变化？
Let's think step by step.
（模型在内部推理，不调用任何工具）
"""

# ReAct prompt - 边思考边行动
REACT_PROMPT = """
Question: Apple 公司 2024 年 Q3 的营收是多少？
Thought: 我需要查询 Apple 最新的财报数据。
Action: search
Action Input: "Apple Q3 2024 revenue"
（模型先思考，然后调用搜索工具获取真实数据）
"""`
                },
                {
                    lang: "python",
                    code: `# ToT vs ReAct 的搜索策略对比
# ToT：广度优先探索多个推理路径
def tot_search(problem, depth=3, breadth=5):
    """Tree of Thoughts - 维护一棵推理树"""
    tree = {problem: []}  # 根节点
    for level in range(depth):
        for node in get_current_leaves(tree):
            # 每个节点生成多个候选
            candidates = generate_thoughts(node, breadth)
            # 评估并选择最优
            scored = [(c, evaluate(c)) for c in candidates]
            tree[node] = sorted(scored, key=lambda x: -x[1])[:2]
    return extract_best_path(tree)

# ReAct：线性但带真实反馈
def react_search(problem, max_steps=6):
    """ReAct - 线性推理但每步有真实工具反馈"""
    scratchpad = ""
    for step in range(max_steps):
        thought, action = generate_next(problem, scratchpad)
        if is_answer(thought):
            return extract_answer(thought)
        observation = execute_tool(action)  # 真实反馈
        scratchpad += f"\\n{thought}\\n{action}\\n{observation}"`
                }
            ],
            table: {
                headers: ["特性", "CoT", "ToT", "ReAct"],
                rows: [
                    ["外部交互", "❌ 无", "❌ 无", "✅ 有（工具/环境）"],
                    ["推理结构", "线性链", "树形分支", "线性链 + 工具反馈"],
                    ["Token 消耗", "低", "极高（N 倍）", "中等（随步数增长）"],
                    ["实时信息", "❌ 不支持", "❌ 不支持", "✅ 支持"],
                    ["自我纠正", "弱（单向推理）", "强（多路径比较）", "强（Observation 反馈）"],
                    ["最佳场景", "数学、逻辑推理", "复杂规划、创作", "多跳问答、Agent 任务"],
                ]
            },
            mermaid: `graph TD
    subgraph "推理方法谱系"
        A["纯推理"] --> B["CoT 思维链"]
        B --> C["ToT 思维树"]
        A --> D["ReAct 推理+行动"]
        C -.->|"可结合"| D
    end
    subgraph "交互能力"
        E["无外部交互"] -.-> A
        E -.-> B
        E -.-> C
        F["有外部交互"] -.-> D
    end
    subgraph "复杂度"
        G["简单"] -.-> A
        H["中等"] -.-> B
        I["高"] -.-> C
        J["中等"] -.-> D
    end`,
            tip: "实际项目中，不要陷入「选哪个最好」的思维陷阱。最好的方案往往是组合：在 ReAct 框架内使用 CoT 风格的详细 Thought，在 ToT 的评估节点调用 ReAct 获取真实数据。",
            warning: "ToT 的 token 消耗可能是 CoT 的 5-10 倍，在生产环境中成本非常高。除非是极其复杂的规划任务，否则不建议在 production 中使用 ToT。",
        },
        {
            title: "5. 工具集成：搜索、代码执行与计算器",
            body: `ReAct 的强大之处在于它可以与各种外部工具集成。**工具是 ReAct Agent 与世界交互的「手脚」，没有工具，再好的推理也只是空中楼阁**。本节探讨三种最常用的工具类型及其集成方式。

搜索工具是最基础也是最常用的工具。它让 Agent 能够获取互联网上的实时信息，包括新闻、文档、API 响应等。集成搜索工具时，关键设计点在于：搜索结果的结构化程度（是返回原始 HTML 还是提取后的文本）、搜索范围的限制（是否需要 domain-specific 搜索）、以及搜索结果的排序（如何让最重要的信息排在前面）。在实际应用中，往往需要组合多种搜索策略：通用搜索引擎用于广泛查询，专业 API（如 Wikipedia API、学术搜索 API）用于精确查询。

代码执行工具让 Agent 能够运行 Python、JavaScript 等代码。这对于数学计算、数据处理、格式转换等任务非常有用。**集成代码执行工具的核心挑战是安全性**——必须确保模型生成的代码在沙箱环境中运行，不能访问文件系统或网络（除非明确授权）。此外，代码执行结果的返回格式也很重要：应该包含 stdout、stderr 和退出码，以便模型在下一轮 Thought 中判断执行是否成功。

计算器工具看似简单，但实际上是 ReAct Agent 中出错率最高的工具之一。LLM 本身不擅长精确数学运算（特别是在大数运算上），所以需要外部计算器。但集成时需要注意：浮点数精度问题、单位转换、以及数学表达式的解析。一个好的计算器工具应该支持基本运算、科学计算函数，并且返回格式清晰明了。`,
            code: [
                {
                    lang: "python",
                    code: `# 搜索工具集成（使用 DuckDuckGo）
from duckduckgo_search import DDGS
from typing import Dict

class SearchTool:
    name = "search"
    description = "搜索互联网获取实时信息"
    
    def execute(self, query: str) -> str:
        """执行搜索并返回格式化的结果"""
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
        
        formatted = []
        for i, r in enumerate(results, 1):
            formatted.append(
                f"[{i}] {r['title']}\\n"
                f"    {r['body']}\\n"
                f"    URL: {r['href']}"
            )
        return "\\n\\n".join(formatted)

tool = SearchTool()
print(tool.execute("2024年诺贝尔物理学奖"))`
                },
                {
                    lang: "python",
                    code: `# 代码执行工具（带沙箱安全控制）
import subprocess
import re

class CodeExecutionTool:
    name = "python_repl"
    description = "执行 Python 代码并返回结果"
    
    ALLOWED_MODULES = {"math", "json", "re", "datetime", "collections"}
    FORBIDDEN_PATTERNS = [
        r"import\\s+os", r"import\\s+sys", r"subprocess",
        r"open\\(", r"__import__", r"eval\\(", r"exec\\("
    ]
    
    def _is_safe(self, code: str) -> bool:
        for pattern in self.FORBIDDEN_PATTERNS:
            if re.search(pattern, code):
                return False
        return True
    
    def execute(self, code: str) -> str:
        if not self._is_safe(code):
            return "Error: 代码包含不安全的操作"
        result = subprocess.run(
            ["python3", "-c", code],
            capture_output=True, text=True, timeout=10
        )
        return result.stdout or result.stderr`
                }
            ],
            table: {
                headers: ["工具类型", "典型用途", "输入格式", "输出格式", "安全考量"],
                rows: [
                    ["搜索引擎", "获取实时信息、事实查询", "查询字符串", "标题+摘要+链接列表", "限制搜索频率、过滤敏感内容"],
                    ["代码执行", "数学计算、数据处理", "Python 代码字符串", "stdout/stderr", "沙箱隔离、禁止危险模块"],
                    ["计算器", "精确数值运算", "数学表达式", "数值结果", "防止除零、溢出保护"],
                    ["API 调用", "天气、股票、翻译等", "JSON 参数", "JSON 响应", "API key 管理、速率限制"],
                ]
            },
            mermaid: `graph TD
    A["ReAct Agent"] --> B["工具注册表"]
    B --> C["Search\n搜索引擎"]
    B --> D["Python REPL\n代码执行"]
    B --> E["Calculator\n计算器"]
    B --> F["API Client\n外部服务"]
    C --> G["DuckDuckGo\nBing API"]
    D --> H["沙箱环境\n安全隔离"]
    E --> I["SymPy\nmath 模块"]
    F --> J["天气/股票\n翻译服务"]`,
            tip: "工具描述的质量直接决定 ReAct Agent 的表现。每个工具的描述应该包含：用途说明、输入格式示例、输出格式说明、以及使用限制。描述越清晰，模型选择工具越准确。",
            warning: "永远不要在没有沙箱的情况下让 Agent 执行代码。即使有安全模式检查，模型也可能生成绕过检查的代码（比如用 __import__ 代替 import）。必须在操作系统级别的沙箱中运行。",
        },
        {
            title: "6. 用 LangChain 实现一个 ReAct Agent",
            body: `LangChain 是目前最流行的 LLM 应用开发框架之一，它内置了对 ReAct Agent 的一流支持。本节通过一个完整的示例，展示如何用 LangChain 构建一个 ReAct Agent，并深入理解其内部工作原理。

LangChain 的 ReAct Agent 实现基于三个核心组件：LLM（作为推理引擎）、Tools（作为行动能力）和 AgentExecutor（作为循环控制器）。LLM 负责生成 Thought 和决定 Action，Tools 负责执行具体的操作并返回 Observation，AgentExecutor 负责管理 Thought-Action-Observation 循环——它接收 LLM 的输出，解析出 Action 部分，调用对应的工具，将结果追加到对话历史中，然后再次调用 LLM。

构建一个实用的 ReAct Agent 需要关注几个关键设计决策。首先是工具选择：**不是工具越多越好，过多的工具会增加模型的选择困难**，导致选错工具的概率上升。建议从 3-5 个核心工具开始，根据实际需求逐步扩展。其次是提示词模板：LangChain 提供了默认的 ReAct 提示词模板，但针对特定领域任务，往往需要自定义模板以获得更好的效果。最后是错误处理：当工具执行失败或 LLM 输出了无法解析的格式时，Agent 应该如何应对？**好的错误处理策略是将错误信息作为 Observation 返回给 LLM**，让它自行决定是重试还是调整策略。`,
            code: [
                {
                    lang: "python",
                    code: `# 用 LangChain 构建 ReAct Agent 的完整示例
from langchain_openai import ChatOpenAI
from langchain.agents import create_react_agent, AgentExecutor
from langchain.tools import Tool
from langchain import hub

# 1. 定义工具
def search_wikipedia(query: str) -> str:
    """搜索 Wikipedia 获取百科知识"""
    import wikipedia
    try:
        return wikipedia.summary(query, sentences=3)
    except:
        return f"未找到关于 {query} 的信息"

def calculate(expression: str) -> str:
    """计算数学表达式"""
    return str(eval(expression, {"__builtins__": {}}, {}))

tools = [
    Tool(
        name="Wikipedia",
        func=search_wikipedia,
        description="搜索 Wikipedia 获取人物、事件、概念的百科信息"
    ),
    Tool(
        name="Calculator",
        func=calculate,
        description="计算数学表达式，如 2**10 或 3.14*5*5"
    ),
]

# 2. 创建 ReAct Agent
llm = ChatOpenAI(model="gpt-4", temperature=0)
prompt = hub.pull("hwchase17/react")
agent = create_react_agent(llm, tools, prompt)
executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True,
    max_iterations=8, handle_parsing_errors=True
)

# 3. 运行
result = executor.invoke({
    "input": "如果一个圆的半径是5cm，它的面积是多少？"
})
print(result["output"])`
                },
                {
                    lang: "python",
                    code: `# 自定义 ReAct 提示词模板
from langchain.prompts import PromptTemplate

CUSTOM_REACT_PROMPT = PromptTemplate.from_template("""
你是一个专业的研究助手，擅长使用工具来回答问题。
你可以使用以下工具：

{tools}

请按以下格式回答：

Question: 你需要回答的问题
Thought: 思考下一步应该做什么
Action: 工具名称，必须是 [{tool_names}] 之一
Action Input: 工具的输入
Observation: 工具执行的结果
... （可以重复 Thought/Action/Observation 多轮）
Thought: 我现在知道最终答案了
Final Answer: 对原始问题的最终回答

开始！

Question: {input}
Thought: {agent_scratchpad}
""")

# 使用自定义提示词创建 Agent
agent = create_react_agent(llm, tools, CUSTOM_REACT_PROMPT)
executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True,
    max_iterations=6
)`
                }
            ],
            table: {
                headers: ["LangChain 组件", "职责", "关键参数", "默认值"],
                rows: [
                    ["create_react_agent", "创建 ReAct Agent 实例", "llm, tools, prompt", "使用内置 prompt"],
                    ["AgentExecutor", "执行 TAO 循环", "max_iterations, verbose", "15 步, False"],
                    ["Tool", "封装外部工具", "name, func, description", "必填三项"],
                    ["hub.pull", "加载提示词模板", "prompt_id", "hwchase17/react"],
                    ["handle_parsing_errors", "解析错误处理", "True/自定义函数", "True"],
                ]
            },
            mermaid: `graph TD
    A["用户输入"] --> B["AgentExecutor"]
    B --> C["LLM 推理"]
    C --> D{"输出包含 Action？"}
    D -->|"是"| E["解析 Action"]
    E --> F["执行 Tool"]
    F --> G["获取 Observation"]
    G --> H["追加到 Scratchpad"]
    H --> C
    D -->|"否（Final Answer）"| I["返回结果"]
    C --> J{"超过 max_iterations？"}
    J -->|"是"| K["强制终止返回中间结果"]
    J -->|"否"| D`,
            tip: "LangChain 的 verbose=True 是调试 Agent 的利器，它会打印每一轮 Thought/Action/Observation。在开发阶段始终开启，在生产阶段关闭以节省日志开销。",
            warning: "AgentExecutor 的默认 max_iterations 是 15，这对大多数任务来说太高了。过高的上限会导致 Agent 在死循环中消耗大量 token。建议根据任务复杂度设为 5-8。",
        },
        {
            title: "7. ReAct 的评估方法与局限性",
            body: `尽管 ReAct 是一个强大的范式，但它并非没有局限性。理解这些局限性对于在生产环境中正确使用 ReAct 至关重要。

评估 ReAct Agent 的效果需要从多个维度进行。首先是准确性（Accuracy）：Agent 给出的最终答案是否正确？这通常通过在标准基准数据集（如 HotpotQA、FeverOUS）上运行来测量。其次是效率（Efficiency）：完成一个任务需要多少步？多少 token？多少时间？高效的 Agent 应该用最少的步骤达到正确的答案。第三是鲁棒性（Robustness）：当工具返回错误或意外结果时，Agent 是否能优雅地处理？最后是泛化能力（Generalization）：Agent 是否能处理训练示例中未曾见过的问题类型？

ReAct 的主要局限性包括：Token 消耗大——每一轮 TAO 循环都需要 LLM 重新生成完整的上下文，导致 token 使用量随步数线性增长；**传播错误——一步错则步步错**，如果某一步的 Observation 是错误的（比如搜索返回了不相关的结果），后续的所有 Thought 和 Action 都可能基于这个错误信息做出错误决策；工具依赖——ReAct 的效果高度依赖于工具的质量，如果工具返回的信息不完整或不准确，再好的推理也无法得到正确答案；解析脆弱性——LLM 可能输出不符合预期格式的 Action，导致 Agent 无法正确解析和执行。

针对这些局限性，研究者提出了多种改进方案：Reflexion 框架让 Agent 在每次执行后进行自我反思，从错误中学习；Plan-and-Execute 策略先让 Agent 制定完整计划，再按计划逐步执行，减少了不必要的探索步骤。**这些改进方案与 ReAct 的核心思想并不冲突，而是对其的补充和增强**。`,
            code: [
                {
                    lang: "python",
                    code: `# ReAct Agent 的多维度评估
from dataclasses import dataclass
from typing import List

@dataclass
class ReactMetrics:
    accuracy: float           # 答案正确率
    avg_steps: float          # 平均步骤数
    avg_tokens: float         # 平均 token 消耗
    tool_error_rate: float    # 工具调用失败率
    parse_error_rate: float   # 解析失败率
    self_correction_rate: float  # 自我纠正率

def evaluate_agent(agent, test_cases: List[dict]) -> ReactMetrics:
    results = []
    for case in test_cases:
        trace = agent.run_with_trace(case["question"])
        results.append({
            "correct": trace.final_answer == case["answer"],
            "steps": len(trace.ta_iterations),
            "tokens": trace.total_tokens,
            "tool_errors": trace.tool_errors,
            "parse_errors": trace.parse_errors,
            "corrections": trace.self_corrections,
        })
    
    n = len(results)
    return ReactMetrics(
        accuracy=sum(r["correct"] for r in results) / n,
        avg_steps=sum(r["steps"] for r in results) / n,
        avg_tokens=sum(r["tokens"] for r in results) / n,
        tool_error_rate=sum(r["tool_errors"] for r in results) / n,
        parse_error_rate=sum(r["parse_errors"] for r in results) / n,
        self_correction_rate=sum(r["corrections"] for r in results) / n,
    )`
                },
                {
                    lang: "python",
                    code: `# Reflexion 改进：自我反思式 ReAct
class ReflexionAgent:
    """在 ReAct 基础上增加自我反思机制"""
    def __init__(self, base_agent, reflection_model=None):
        self.base_agent = base_agent
        self.reflection_model = reflection_model or base_agent.llm
        self.reflections = []  # 历史反思记录
    
    def run(self, question: str) -> str:
        # 第一次尝试
        result = self.base_agent.run(question)
        
        if not result.success:
            # 反思：为什么失败了？
            reflection = self.reflection_model.generate(
                f"任务：{question}\\n"
                f"执行轨迹：{result.trace}\\n"
                f"结果：失败 - {result.error}\\n"
                f"请分析失败原因并给出改进建议。"
            )
            self.reflections.append(reflection)
            
            # 第二次尝试（带上反思）
            result = self.base_agent.run(
                question, context=f"之前的教训：{reflection}"
            )
        return result`
                }
            ],
            table: {
                headers: ["局限性", "影响程度", "表现症状", "缓解方案"],
                rows: [
                    ["Token 消耗大", "⭐⭐⭐⭐", "响应慢、成本高", "减少 max_iterations、使用更小的模型做路由"],
                    ["错误传播", "⭐⭐⭐⭐⭐", "一步错步步错", "增加验证步骤、Reflexion 自我反思"],
                    ["工具依赖", "⭐⭐⭐", "工具不好用 Agent 就不好用", "提高工具质量、增加容错逻辑"],
                    ["解析脆弱", "⭐⭐⭐", "格式错误导致循环中断", "handle_parsing_errors、更严格的 prompt"],
                    ["缺乏长期记忆", "⭐⭐⭐⭐", "每次从零开始、不记住历史教训", "添加记忆模块、反思缓存"],
                ]
            },
            mermaid: `graph LR
    A["ReAct 局限性"] --> B["Token 消耗"]
    A --> C["错误传播"]
    A --> D["工具依赖"]
    A --> E["解析脆弱"]
    A --> F["缺乏记忆"]
    B --> G["改进：步数限制"]
    C --> H["改进：Reflexion"]
    D --> I["改进：工具质量"]
    E --> J["改进：容错处理"]
    F --> K["改进：记忆模块"]
    H --> L["Plan-and-Execute"]
    K --> L`,
            tip: "在生产环境中部署 ReAct Agent 前，务必建立一个包含 50-100 个测试用例的评估集。每次修改 Agent 的 prompt 或工具集后，重新运行评估，确保没有性能回退。",
            warning: "不要在生产环境中直接使用 Agent 的最终答案作为可信结果。对于关键决策（如金融交易、医疗建议），必须增加人工审核环节或使用验证模型对答案进行二次检查。",
        },
    ],
};
