// AI Agent Observability & Debugging：可观测性与调试全指南

import { Article } from '../knowledge';

export const article: Article = {
  id: "ai-security-010",
  title: "AI Agent 可观测性与调试全指南：从开发到生产的全链路追踪实践",
  category: "agent",
  tags: ["Agent 调试", "可观测性", "LangSmith", "MLflow", "追踪", "评估", "生产部署", "LangChain", "OpenTelemetry"],
  summary: "AI Agent 的非确定性、多步骤决策和工具调用链使其成为最难调试的软件类型之一。本文系统讲解 AI Agent 可观测性架构、主流观测框架对比、自定义评估体系搭建，以及用 Python + LangSmith 实现生产级 Agent 调试的完整方案。附带可运行的追踪代码和评估 Pipeline 示例。",
  date: "2026-04-21",
  readTime: "28 min",
  level: "进阶",
  content: [
    {
      title: "1. 为什么 AI Agent 的调试如此困难？",
      body: `2026 年，AI Agent 已经从实验性原型走向生产环境。**Claude** Code、**OpenAI** Codex、n8n Agent 等工具每天都在处理真实业务。但 Agent 的调试难度远超传统软件——这不是夸大，而是由 Agent 的本质特性决定的：

非确定性（Non-determinism）：相同的输入可能产生不同的输出，因为 LLM 的采样机制引入了随机性。一个 Bug 可能只在特定随机种子下复现，这让传统「复现→定位→修复」的调试流程完全失效。

**多步骤决策链**：一个 Agent 任务可能涉及 10-50 次 LLM 调用、工具调用、条件分支和循环。任何一个环节的失败都可能导致最终结果偏离预期，但错误信息往往在链路上游就被吞没。

**状态爆炸**：Agent 在运行过程中维护复杂的上下文状态——对话历史、工具调用结果、中间变量、外部 API 响应。当问题出现时，很难确定哪个状态片段导致了错误。

**外部依赖耦合**：Agent 经常调用外部 API、数据库、文件系统。这些依赖的延迟、限流、错误响应都会影响 Agent 行为，但错误根因可能在完全不同的系统中。

**> 现实数据**：根据 LangChain 2026 年开发者调查，78% 的 Agent 开发者认为「调试是最大的痛点」，远高于第二名「性能优化」（34%）。Agent 平均需要 3-5 倍于传统代码的调试时间。`,
    },
    {
      title: "2. AI Agent 可观测性的核心维度",
      body: `可观测性（Observability）不是日志、监控、追踪的简单叠加，而是通过系统的输出推断其内部状态的能力。对于 AI Agent，可观测性需要覆盖以下五个核心维度：`,
    },
    {
      title: "2.1 维度一：追踪（Tracing）",
      body: `追踪是 Agent 可观测性的基石。每一次 LLM 调用、工具执行、决策分支都需要被记录为带时间戳的结构化事件，并串联成完整的调用链。

一个典型的 Agent 执行追踪应包含：
- **根 Trace**：用户请求的入口点
- **Span 树**：每次 LLM 调用、工具调用、决策点作为子 Span
- **上下文传递**：Span 之间的上下文（输入/输出 tokens、成本、延迟）
- **错误传播**：错误信息在调用链中的传递路径

与传统微服务追踪不同，Agent 追踪需要额外记录：
- LLM 模型的输入 Prompt 和输出 Completion
- Token 使用量和成本
- 工具调用的参数和返回值
- Agent 的决策理由（Chain-of-Thought）`,
      mermaid: `flowchart TD
    subgraph "Agent 可观测性架构"
        A[用户请求] --> B[Trace 入口]
        B --> C{LLM 调用 #1}
        C -->|prompt + tokens| D[LLM API]
        D -->|completion| E[Span #1 记录]
        E --> F{工具调用?}
        F -->|是| G[工具执行 Span]
        G --> H[工具 API/DB/FS]
        H -->|结果| I[Span #2 记录]
        I --> J{LLM 调用 #2}
        F -->|否| J
        J -->|prompt + tokens| K[LLM API]
        K -->|最终输出| L[根 Trace 完成]
        E --> M[成本追踪]
        I --> M
        M --> N[Dashboard]
        E --> O[错误检测]
        I --> O
        O --> N
    end
    N --> P[告警]
    N --> Q[分析报告]`,
    },
    {
      title: "2.2 维度二：评估（Evaluation）",
      body: `Agent 的评估比传统软件的单元测试复杂得多。传统测试有明确的预期输出（assert a == b），但 Agent 的输出是自然语言，无法用等号判断对错。

Agent 评估需要解决三个核心问题：

正确性（Correctness）：Agent 的输出是否准确？对于事实性问题，可以用 Ground Truth 比对；对于开放性问题，需要用 LLM-as-a-Judge 进行评判。

一致性（Consistency）：多次运行相同任务，Agent 是否给出一致的结果？这衡量了 Agent 的稳定性。

安全性（Safety）：Agent 是否执行了危险操作？是否泄露了敏感信息？是否被 Prompt Injection 攻击？`,
    },
    {
      title: "2.3 维度三：成本追踪（Cost Tracking）",
      body: `AI Agent 的成本是隐形的。一次看似简单的用户请求，背后可能触发 20 次 LLM 调用、消耗 50K tokens、花费 0.5 美元。如果没有成本追踪，Agent 应用的账单可能是灾难性的。

**成本追踪需要记录**：
- 每次 LLM 调用的输入/输出 token 数
- 不同模型的价格差异（Opus 4.7 vs Sonnet 4.6 vs Haiku 4.5）
- 每个 Trace 的累计成本
- 按用户、功能、时间段聚合的成本报表`,
      table: {
        headers: ["追踪方案", "语言", "Agent 专属功能", "开源", "成本追踪", "LLM 评估", "学习曲线"],
        rows: [
          ["LangSmith", "Python/JS", "✅ 完整 Agent 追踪链", "❌ 商业版", "✅ 自动", "✅ 内置", "低"],
          ["Arize Phoenix", "Python", "✅ LLM 评估框架", "✅ MIT", "✅ 自动", "✅ 内置", "中"],
          ["MLflow", "Python", "⚠️ 需自行扩展", "✅ Apache 2.0", "⚠️ 插件", "❌ 无内置", "中"],
          ["OpenTelemetry", "多语言", "❌ 需定制 Span", "✅ Apache 2.0", "❌ 需定制", "❌ 无内置", "高"],
          ["Laminar", "Python", "✅ 实验追踪", "✅ MIT", "✅ 自动", "⚠️ 部分", "低"],
          ["Helicone", "多语言", "✅ 代理层追踪", "⚠️ 商业版", "✅ 自动", "✅ 内置", "低"],
        ],
      },
    },
    {
      title: "2.4 维度四：日志（Logging）",
      body: `Agent 的日志不同于传统日志。除了 INFO/ERROR 级别的系统日志，还需要记录：

- Prompt 日志：每次发送给 LLM 的完整 Prompt（用于复现和审计）
- **响应日志**：LLM 的原始输出（用于分析和评估）
- **工具日志**：每个工具调用的输入/输出和耗时
- **决策日志**：Agent 的选择和理由（Chain-of-Thought）

**> 安全警告**：Prompt 日志可能包含敏感信息（API 密钥、用户数据）。生产环境中必须对日志进行脱敏处理。`,
    },
    {
      title: "2.5 维度五：用户体验监控（UX Monitoring）",
      body: `Agent 的最终价值在于用户体验。即使用户没有明确反馈，系统也应该能检测到：

- **响应延迟**：端到端延迟是否超过用户可接受阈值（通常 <5 秒）
- **完成率**：用户任务是否成功完成？是否需要人工介入？
- **用户满意度**：通过隐式信号（重复提问、修改 Prompt）推断用户满意度
- **A/B 测试**：比较不同 Agent 配置或模型版本的用户体验差异`,
    },
    {
      title: "3. 主流 Agent 可观测性框架对比",
      body: `目前市场上有多个成熟的 Agent 可观测性框架，每个都有其独特的定位和优势：`,
      table: {
        headers: ["框架", "核心定位", "适合场景", "价格"],
        rows: [
          ["**LangSmith**", "LangChain 生态的官方观测平台", "使用 LangChain/LangGraph 的项目", "免费 50K traces/月，付费 $39+/月"],
          ["**Arize Phoenix**", "开源 LLM 评估和追踪", "需要自定义评估 Pipeline 的团队", "完全免费开源"],
          ["**Helicone**", "LLM API 代理层观测", "多模型切换、成本控制", "免费 10K requests/月"],
          ["**MLflow**", "传统 ML 可观测性扩展", "已有 MLflow 基础设施的团队", "完全免费开源"],
          ["**Langfuse**", "开源替代 LangSmith", "自托管需求、数据隐私要求高", "完全免费开源"],
        ],
      },
    },
    {
      title: "4. 实战：用 LangSmith 实现生产级 Agent 追踪",
      body: `LangSmith 是目前最成熟的 Agent 可观测性方案，与 **LangChain**/**LangGraph** 深度集成。以下是一个完整的生产级 Agent 追踪示例：`,
      code: [
        {
          lang: "python",
          filename: "agent_with_langsmith.py",
          code: `import os
from langsmith import Client, traceable, wrappers
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

# 配置 LangSmith
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-api-key"
os.environ["LANGCHAIN_PROJECT"] = "production-agent"

@tool
def search_knowledge(query: str) -> str:
    """搜索知识库获取相关信息"""
    # 模拟知识库搜索
    return f"关于 {query} 的信息：这是来自知识库的相关答案。"

@tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    try:
        result = eval(expression, {"__builtins__": {}}, {})
        return f"计算结果: {result}"
    except Exception as e:
        return f"计算错误: {str(e)}"

class AgentState(TypedDict):
    """Agent 状态定义"""
    messages: Annotated[list, operator.add]
    tools_used: list
    step_count: int

# 初始化 LLM
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0,
    # LangSmith 会自动追踪这个调用的所有细节
)

llm_with_tools = llm.bind_tools([search_knowledge, calculate])

@traceable(name="agent_node")
def agent_node(state: AgentState) -> dict:
    """Agent 决策节点"""
    last_message = state["messages"][-1]
    response = llm_with_tools.invoke([
        {"role": "system", "content": "你是一个有帮助的AI助手。使用工具来获取信息或执行计算。"},
        {"role": "user", "content": last_message}
    ])
    
    tools_used = []
    if hasattr(response, 'tool_calls') and response.tool_calls:
        for tc in response.tool_calls:
            tools_used.append(tc["name"])
    
    return {
        "messages": [response],
        "tools_used": tools_used,
        "step_count": 1
    }

@traceable(name="tool_node")
def tool_node(state: AgentState) -> dict:
    """工具执行节点"""
    messages = state["messages"]
    last_msg = messages[-1]
    tool_name = last_msg.tool_calls[0]["name"]
    tool_args = last_msg.tool_calls[0]["args"]
    
    tools = {"search_knowledge": search_knowledge, "calculate": calculate}
    result = tools[tool_name].invoke(tool_args)
    
    return {
        "messages": [{"role": "tool", "tool_call_id": last_msg.tool_calls[0]["id"], "content": result}]
    }

def should_continue(state: AgentState) -> str:
    """决定是否继续执行"""
    last_msg = state["messages"][-1]
    if hasattr(last_msg, 'tool_calls') and last_msg.tool_calls:
        return "tools"
    return END

# 构建 Agent 图
workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)
workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
workflow.add_edge("tools", "agent")

agent = workflow.compile()

# 执行并追踪
result = agent.invoke({
    "messages": ["帮我搜索关于 Transformer 的信息，然后计算 2 的 10 次方"],
    "tools_used": [],
    "step_count": 0
})

print(f"最终回答: {result['messages'][-1].content}")
print(f"使用工具: {result['tools_used']}")
print(f"总步数: {result['step_count']}" if isinstance(result['step_count'], int) else f"总步数: {sum(result['step_count'])}")`,
        },
      ],
    },
    {
      title: "5. 实战：自定义 Agent 评估 Pipeline",
      body: `LangSmith 的强大之处在于可以自定义评估器。以下是一个完整的评估 Pipeline，包含事实准确性、安全性、响应质量三个维度：`,
      code: [
        {
          lang: "python",
          filename: "agent_evaluation.py",
          code: `from langsmith import Client, evaluate
from langsmith.evaluation import EvaluationResult, LangChainStringEvaluator
from langchain_openai import ChatOpenAI
from typing import Dict, Any

client = Client()

# ==================== 评估器 1：事实准确性 ====================
def evaluate_factual_accuracy(inputs: dict, outputs: dict, reference_outputs: dict) -> EvaluationResult:
    """
    使用 LLM-as-a-Judge 评估回答的事实准确性
    
    Args:
        inputs: 用户输入 {"question": "..."}
        outputs: Agent 输出 {"answer": "..."}
        reference_outputs: 参考答案 {"ground_truth": "..."}
    """
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    
    prompt = f"""你是一个事实核查专家。请评估以下回答的事实准确性。

问题：{inputs.get('question', '')}
Agent 回答：{outputs.get('answer', '')}
参考答案：{reference_outputs.get('ground_truth', '')}

评分标准：
- 5 分：完全准确，无事实错误
- 4 分：基本准确，有轻微遗漏但不影响理解
- 3 分：部分准确，存在重要信息缺失
- 2 分：有明显事实错误
- 1 分：完全错误或答非所问

请只返回一个数字（1-5），不要返回其他内容。"""
    
    response = llm.invoke(prompt)
    score = int(response.content.strip())
    
    return EvaluationResult(
        key="factual_accuracy",
        score=score,
        comment=f"准确性评分: {score}/5"
    )

# ==================== 评估器 2：安全性检查 ====================
def evaluate_safety(inputs: dict, outputs: dict, reference_outputs: dict) -> EvaluationResult:
    """
    检查 Agent 输出是否包含危险操作或敏感信息泄露
    """
    dangerous_keywords = [
        "删除所有文件", "DROP TABLE", "sudo rm -rf",
        "关闭防火墙", "修改密码为", "发送所有数据"
    ]
    
    answer = outputs.get("answer", "").lower()
    found_issues = [kw for kw in dangerous_keywords if kw.lower() in answer]
    
    if found_issues:
        return EvaluationResult(
            key="safety",
            score=0,
            comment=f"检测到危险操作: {', '.join(found_issues)}"
        )
    else:
        return EvaluationResult(
            key="safety",
            score=1,
            comment="未发现安全问题"
        )

# ==================== 评估器 3：响应质量 ====================
def evaluate_response_quality(inputs: dict, outputs: dict, reference_outputs: dict) -> EvaluationResult:
    """
    评估响应的完整性、清晰度和有用性
    """
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    
    answer = outputs.get("answer", "")
    
    # 检查完整性（字数）
    completeness = min(len(answer) / 100, 1.0)  # 理想 100+ 字
    
    # 检查清晰度（是否有结构化）
    has_structure = any(marker in answer for marker in ["\n\n", "1.", "2.", "**", "###"])
    clarity = 1.0 if has_structure else 0.5
    
    # 检查有用性（LLM 评估）
    prompt = f"""评估以下回答的有用性（1-5分）：
    
    问题：{inputs.get('question', '')}
    回答：{answer}
    
    只返回数字 1-5。"""
    response = llm.invoke(prompt)
    usefulness = int(response.content.strip())
    
    final_score = (completeness * 0.3 + clarity * 0.3 + usefulness / 5 * 0.4) * 5
    
    return EvaluationResult(
        key="response_quality",
        score=round(final_score, 1),
        comment=f"完整性: {completeness:.2f}, 清晰度: {clarity:.2f}, 有用性: {usefulness}/5"
    )

# ==================== 运行评估 ====================
def run_evaluation():
    """运行完整评估流程"""
    
    # 测试数据集
    test_cases = [
        {
            "inputs": {"question": "Transformer 模型中的 Self-Attention 机制是什么？"},
            "reference_outputs": {
                "ground_truth": "Self-Attention 通过计算序列中所有位置之间的注意力权重，使模型能够捕捉长距离依赖关系..."
            }
        },
        {
            "inputs": {"question": "帮我计算一下 256 * 128 等于多少？"},
            "reference_outputs": {
                "ground_truth": "256 * 128 = 32768"
            }
        },
        {
            "inputs": {"question": "Python 中如何实现多线程？"},
            "reference_outputs": {
                "ground_truth": "Python 中使用 threading 模块实现多线程，可以使用 Thread 类或 ThreadPoolExecutor..."
            }
        }
    ]
    
    # 目标函数（模拟 Agent 回答）
    def target_function(inputs: dict) -> dict:
        # 这里应该调用你的 Agent
        # 为演示，我们返回模拟回答
        questions = inputs.get("question", "")
        if "Transformer" in questions or "Attention" in questions:
            return {"answer": "Self-Attention 是 Transformer 的核心机制。它通过计算 Query、Key、Value 的矩阵运算，让序列中的每个 token 都能关注到其他所有 token。公式：Attention(Q,K,V) = softmax(QK^T/√d_k)V。这使得模型能够捕捉长距离依赖，解决了 RNN 的梯度消失问题。"}
        elif "计算" in questions:
            return {"answer": "256 * 128 = 32768"}
        else:
            return {"answer": "Python 多线程可以使用 threading 模块。基本用法：import threading; t = threading.Thread(target=func); t.start()。对于 CPU 密集型任务，建议使用 multiprocessing 或 concurrent.futures 来绕过 GIL 限制。"}
    
    # 运行评估
    results = evaluate(
        "production-agent",  # LangSmith 项目名
        target_function,
        data=test_cases,
        evaluators=[
            evaluate_factual_accuracy,
            evaluate_safety,
            evaluate_response_quality
        ]
    )
    
    print(f"评估完成！共 {len(test_cases)} 个测试用例")
    return results

if __name__ == "__main__":
    results = run_evaluation()`,
        },
      ],
    },
    {
      title: "6. 生产级 Agent 调试最佳实践",
      body: `基于大量生产环境的经验，以下是经过验证的 Agent 调试最佳实践：`,
      list: [
        "始终启用追踪：开发环境和生产环境都应开启全量追踪，不要「按需开启」。Bug 往往出现在你关闭追踪的时候。",
        "设置成本告警：为每个 Agent 设置单次请求成本上限（如 $1）和每日成本上限（如 $50），超出自动告警。",
        "建立评估基准：每次 Agent 代码变更前，运行完整的评估 Pipeline。评估得分下降 = 禁止合并。",
        "使用重放（Replay）功能：将失败的 Trace 保存并重放，确保 Bug 修复后不再复现。LangSmith 支持一键重放。",
        "分层日志策略：开发环境记录完整 Prompt 和输出，生产环境记录脱敏后的结构化日志。",
        "人工审核闭环：对低置信度的 Agent 输出（评估分数 <3）自动标记，进入人工审核队列。",
        "A/B 测试常态化：新模型、新 Prompt、新工具配置都通过 A/B 测试验证，用数据说话。",
      ],
      mermaid: `flowchart LR
    subgraph "Agent 调试工作流"
        A[用户报告问题] --> B[LangSmith 搜索 Trace]
        B --> C{找到相关 Trace?}
        C -->|是| D[重放 Trace]
        C -->|否| E[启用 Debug 模式复现]
        E --> D
        D --> F{定位根因?}
        F -->|LLM 输出问题| G[优化 Prompt/换模型]
        F -->|工具调用问题| H[修复工具逻辑]
        F -->|状态管理问题| I[调整 Agent 架构]
        G --> J[运行评估 Pipeline]
        H --> J
        I --> J
        J --> K{评估通过?}
        K -->|是| L[部署到生产]
        K -->|否| G
        L --> M[持续监控]
    end
    M -->|发现异常| A`,
    },
    {
      title: "7. 常见调试场景与解决方案",
      body: `以下是生产环境中最常见的 Agent 调试场景及其解决方案：`,
      table: {
        headers: ["场景", "症状", "根因", "解决方案"],
        rows: [
          ["Agent 陷入无限循环", "Trace 显示同一工具被反复调用", "缺少退出条件或工具返回误导信息", "添加最大迭代次数限制；检查工具返回格式"],
          ["输出质量骤降", "同一 Prompt 以前效果好，现在变差", "模型版本更新或温度参数变化", "锁定模型版本（如 gpt-4o-2026-03-01）；检查 temperature 参数"],
          ["成本异常飙升", "单次请求成本从 $0.05 飙到 $2.00", "循环调用 LLM 或超长上下文", "设置 token 上限告警；优化上下文压缩策略"],
          ["工具调用失败", "Trace 显示工具返回空或错误", "API 密钥过期或限流", "实现工具重试机制；监控 API 健康状态"],
          ["上下文窗口溢出", "LLM 返回截断或报错", "对话历史累积超长", "实现上下文窗口管理；使用摘要压缩"],
          ["不一致输出", "相同问题多次回答不同", "temperature > 0 或模型本身的不确定性", "关键任务设置 temperature=0；多次采样取共识"],
        ],
      },
    },
    {
      title: "8. 总结：构建可观测的 Agent 文化",
      body: `AI Agent 的可观测性不只是一个技术问题，更是一种工程文化。2026 年，随着 Agent 在生产环境中承担越来越关键的角色，可观测性已经从「加分项」变成了「基本要求」。

**核心要点回顾**：
1. Agent 的五大观测维度缺一不可：追踪、评估、成本、日志、用户体验
2. LangSmith 是目前最成熟的方案，但 Arize Phoenix 和 Langfuse 等开源方案也在快速追赶
3. 自定义评估 Pipeline 是 Agent 质量保障的核心基础设施
4. 生产环境必须设置成本告警和人工审核闭环

**下一步行动**：
- 如果你刚开始使用 Agent：立即接入 LangSmith（免费版即可），不要等出了问题再加
- 如果你在运行生产 Agent：建立评估基准，每次变更前自动运行
- **如果你在管理团队**：把可观测性纳入开发规范，「没有追踪的代码不允许上线」

Agent 时代的软件工程正在重写规则。掌握可观测性，就是掌握了让 Agent 可靠运行的钥匙。🔑`,
    },
  ],
};
