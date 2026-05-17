import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-004",
    title: "工具调用：Function Calling 实战",
    category: "agent",
    tags: ["Function Calling", "工具调用", "Agent"],
    summary: "让大模型调用外部工具，扩展 Agent 的能力边界",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么需要工具调用：大模型的能力边界",
            body: `大语言模型虽然强大，但本质上是一个「文本到文本」的函数。它接收文本输入，生成文本输出，所有知识都固化在训练时的参数中。这意味着模型存在三个根本性局限：无法获取训练数据之后的最新信息（知识截止）、无法执行实际操作（如发送邮件、查询数据库）、无法进行精确计算（大模型做数学运算经常出错）。

Function Calling 的核心思想是让模型成为「大脑」而非「全栈工人」。模型不需要自己知道天气数据——它只需要决定「我应该调用天气查询工具」并构造正确的参数。这种分工让各系统各司其职：模型负责意图理解和决策，外部工具负责执行和数据获取。2023年6月OpenAI首次推出Function Calling API后，Anthropic、Google等厂商纷纷跟进，这已经成为构建AI Agent的标准范式。`,
            code: [
                {
                    lang: "python",
                    code: `# 大模型的三个根本性局限
# 1. 知识截止：无法获取训练后的新信息
print(model.predict("2026年世界杯冠军是谁？"))
# → 模型不知道，因为训练数据只到2024年

# 2. 无法执行操作：不能实际发邮件
print(model.predict("帮我给张三发一封邮件"))
# → 模型只能生成邮件草稿，无法真正发送

# 3. 数学计算不准
print(model.predict("2847 × 9361 = ?"))
# → 经常给出错误答案，不如计算器可靠`
                },
                {
                    lang: "python",
                    code: `# Function Calling 的解决方案：让模型决定调用工具
def handle_user_query(user_input: str) -> str:
    """增强型对话处理：模型决定何时调用工具"""
    # 第一步：让模型判断是否需要工具调用
    response = llm.generate_with_tools(
        prompt=user_input,
        tools=[get_weather, send_email, calculate]
    )
    
    if response.tool_call:
        # 第二步：执行工具获取真实结果
        result = execute_tool(response.tool_call)
        # 第三步：将结果反馈给模型生成最终回答
        return llm.generate(user_input, tool_result=result)
    else:
        return response.text  # 普通对话直接回复`
                }
            ],
            table: {
                headers: ["能力", "纯大模型", "Function Calling", "说明"],
                rows: [
                    ["实时信息", "❌ 知识截止", "✅ 通过API获取", "新闻、天气、股票"],
                    ["外部操作", "❌ 无法执行", "✅ 调用工具执行", "发邮件、写文件"],
                    ["精确计算", "❌ 经常出错", "✅ 计算器/代码", "数学、数据处理"],
                    ["知识问答", "✅ 训练知识", "✅ 训练知识", "历史、常识"],
                    ["意图理解", "✅ 强项", "✅ 强项", "理解用户需求"]
                ]
            },
            mermaid: `graph LR
    A["用户输入"] --> B["LLM 大脑"]
    B -->|需要工具| C["工具路由"]
    B -->|不需要| D["直接回复"]
    C --> E["执行工具"]
    E --> F["获取结果"]
    F --> B
    D --> G["输出"]
    B --> G`,
            tip: "核心思维转变：模型不是「什么都知道」的百科全书，而是「知道该问谁」的调度中心。",
            warning: "不要试图让大模型做精确计算或实时查询，这违背了工具调用的设计初衷。"
        },
        {
            title: "2. OpenAI Function Calling API 深入解析",
            body: `OpenAI的Function Calling API通过一套结构化的协议，让模型能够在对话过程中声明对工具的调用需求。其工作流程分为三个清晰的阶段：第一阶段，开发者在API请求中通过tools参数定义可用工具的JSON Schema，包括工具名称、描述和参数定义；第二阶段，模型根据用户输入自主决定是否调用工具以及调用哪个工具，并返回一个包含tool_calls结构的响应；第三阶段，开发者执行实际的工具调用，将结果以tool role消息的形式追加到对话历史中，让模型基于工具返回的真实数据生成最终回答。

理解这个三阶段循环至关重要——它不是一次性的调用，而是一个可迭代的循环。模型在收到工具执行结果后，仍然可以继续发起新的工具调用。比如用户问「北京和上海哪个城市人口更多」，模型可能需要先调用人口查询API获取北京的数据，再调用一次获取上海的数据，最后才能进行比较。OpenAI的API设计天然支持这种多轮工具调用模式。`,
            code: [
                {
                    lang: "python",
                    code: `import openai

client = openai.OpenAI()

# 第一阶段：定义工具并发起请求
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的当前天气",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名称"},
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "温度单位"
                    }
                },
                "required": ["city"]
            }
        }
    }]
)`
                },
                {
                    lang: "python",
                    code: `# 第二阶段：解析模型的调用决策
tool_call = response.choices[0].message.tool_calls[0]
func_name = tool_call.function.name  # "get_weather"
func_args = json.loads(tool_call.function.arguments)
# → {"city": "北京", "unit": "celsius"}

# 第三阶段：执行工具并将结果注入对话
weather_result = get_weather_api(func_args)
messages = [
    {"role": "user", "content": "北京今天天气怎么样？"},
    response.choices[0].message,  # 模型的tool_call响应
    {
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": json.dumps(weather_result)
    }
]

# 让模型基于工具结果生成最终回答
final = client.chat.completions.create(
    model="gpt-4o", messages=messages
)
print(final.choices[0].message.content)`
                }
            ],
            table: {
                headers: ["消息角色", "用途", "必须字段", "可选字段"],
                rows: [
                    ["system", "设定系统行为", "content", "name"],
                    ["user", "用户输入", "content", "name"],
                    ["assistant", "模型响应", "content 或 tool_calls", "name", "refusal"],
                    ["tool", "工具返回结果", "content, tool_call_id", "name"],
                ]
            },
            mermaid: `sequenceDiagram
    participant U as 用户
    participant M as LLM
    participant T as 工具
    U->>M: "北京今天天气？"
    M->>M: 分析是否需要工具
    M-->>U: tool_call: get_weather(city="北京")
    U->>T: 执行天气查询
    T-->>U: {"temp": 22, "desc": "晴"}
    U->>M: 注入tool结果
    M-->>U: "北京今天22°C，晴天"`
            ,
            tip: "始终在tools参数中定义所有可用工具，即使本次对话可能用不到——模型需要完整的工具清单来做决策。",
            warning: "tool role消息中的tool_call_id必须与模型返回的tool_call.id完全一致，否则API会报错。"
        },
        {
            title: "3. 工具描述与 Schema 设计：决定模型能否正确调用",
            body: `工具定义的质量直接决定了模型调用的准确率。Function Calling不是魔法——模型完全依赖你提供的JSON Schema来理解工具的用途、参数的含义和约束条件。一个描述模糊的工具定义会导致模型传入错误的参数类型、遗漏必填参数，甚至完全忽略这个工具。

设计优秀的工具Schema需要遵循几个关键原则：工具名称应该是动词短语（如get_weather而非weather），清晰表达工具的行为；description字段要用一句话说明工具做什么、什么时候用，避免过于笼统；每个参数的description要具体到取值范围和格式要求；对于枚举类型参数，务必列出所有合法值；必填参数只声明那些没有合理默认值的参数，降低模型调用门槛。

实践中最常见的错误是参数描述不够精确。比如将参数描述写为「城市名称」，模型可能传入「北京」、「北京市」、「beijing」等各种变体。更好的做法是「城市中文名，如北京、上海、广州」，甚至加上格式校验和归一化处理。`,
            code: [
                {
                    lang: "json",
                    code: `// 好的工具定义示例
{
  "name": "search_database",
  "description": "从用户数据库中查询信息，适用于需要检索用户资料、订单记录或统计数据的场景",
  "parameters": {
    "type": "object",
    "properties": {
      "query_type": {
        "type": "string",
        "enum": ["user_profile", "order_history", "statistics"],
        "description": "查询类型：user_profile查用户资料，order_history查订单，statistics查统计数据"
      },
      "user_id": {
        "type": "string",
        "description": "用户ID，格式为UUID，如 '550e8400-e29b-41d4-a716-446655440000'"
      },
      "date_range": {
        "type": "string",
        "description": "日期范围，格式 YYYY-MM-DD 至 YYYY-MM-DD，如 '2024-01-01 至 2024-12-31'"
      }
    },
    "required": ["query_type", "user_id"]
  }
}`
                },
                {
                    lang: "python",
                    code: `# 使用 Pydantic 定义工具 Schema（推荐做法）
from pydantic import BaseModel, Field
from enum import Enum

class QueryType(str, Enum):
    USER_PROFILE = "user_profile"
    ORDER_HISTORY = "order_history"
    STATISTICS = "statistics"

class SearchDatabaseArgs(BaseModel):
    query_type: QueryType = Field(
        description="查询类型：user_profile查用户资料，order_history查订单，statistics查统计数据"
    )
    user_id: str = Field(
        description="用户ID，格式为UUID"
    )
    date_range: str | None = Field(
        default=None,
        description="日期范围，格式 YYYY-MM-DD 至 YYYY-MM-DD"
    )

# 自动转换为 OpenAI 格式
schema = SearchDatabaseArgs.model_json_schema()
tool_def = {
    "type": "function",
    "function": {
        "name": "search_database",
        "description": "从用户数据库中查询信息",
        "parameters": schema
    }
}`
                }
            ],
            table: {
                headers: ["设计原则", "好的做法", "坏的做法", "影响"],
                rows: [
                    ["工具命名", "get_weather（动词开头）", "weather（名词）", "模型不理解行为"],
                    ["参数描述", "温度单位，可选celsius/fahrenheit", "单位", "模型传入非法值"],
                    ["枚举值", "列出所有合法选项", "不写enum约束", "模型自由发挥"],
                    ["必填声明", "仅声明无默认值的参数", "所有参数都required", "调用成功率下降"],
                    ["类型声明", "精确类型：string+pattern", "仅声明string", "格式错误"]
                ]
            },
            mermaid: `graph TD
    A["工具需求"] --> B["Pydantic 模型"]
    B --> C["自动转 JSON Schema"]
    C --> D["OpenAI tools 参数"]
    D --> E["模型理解工具"]
    E --> F["正确调用"]
    B -.-> G["类型校验"]
    B -.-> H["默认值"]
    B -.-> I["字段描述"]`
            ,
            tip: "使用 Pydantic 定义工具参数，既能获得自动类型校验，又能直接转换为 OpenAI 所需的 JSON Schema，一举两得。",
            warning: "不要在参数描述中包含代码示例或过长的说明，模型会提取这些内容作为参数值传入。"
        },
        {
            title: "4. 多工具选择与路由：让模型成为聪明的调度员",
            body: `当系统中只有一个工具时，问题很简单——模型只需要决定「调不调用」。但当可用工具从2个增加到10个甚至更多时，模型面临着真正的挑战：从众多工具中选出最合适的一个，并且传入正确的参数。这就是多工具路由问题。

OpenAI**的模型在设计时就考虑了多工具场景。当你传入多个工具定义时，模型会基于用户输入的语义和工具的描述进行匹配选择。但模型的选择质量高度依赖于工具描述的区分度——如果两个工具的description过于相似，模型可能会混淆它们。比如同时定义了get_weather和get_forecast，如果描述不够清晰地区分「当前天气」和「未来预报」，模型在面对「明天天气」时可能选错工具。

解决多工具路由问题的策略包括：为每个工具提供明确的使用场景说明；在工具description中加入排除说明（「不适用于查询历史天气数据」）；按功能分组管理工具；对于高度相似的工具，考虑合并为一个工具并通过参数区分行为。`,
            code: [
                {
                    lang: "python",
                    code: `# 多工具定义与路由示例
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "获取指定城市当前的实时天气状况。不适用于查询历史天气或未来天气预报。",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名称"},
                },
                "required": ["city"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_weather_forecast",
            "description": "获取指定城市未来7天的天气预报。不适用于查询当前实时天气。",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名称"},
                    "days": {"type": "integer", "description": "预报天数，1-7"},
                },
                "required": ["city", "days"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_historical_weather",
            "description": "查询指定日期的历史天气记录。不适用于查询当前或未来天气。",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名称"},
                    "date": {"type": "string", "description": "日期，格式YYYY-MM-DD"},
                },
                "required": ["city", "date"]
            }
        }
    }
]`
                },
                {
                    lang: "python",
                    code: `# 工具路由质量检查
def evaluate_tool_selection(user_input: str, 
                            selected_tool: str,
                            expected_tool: str) -> dict:
    """评估模型的工具选择是否正确"""
    return {
        "input": user_input,
        "selected": selected_tool,
        "expected": expected_tool,
        "correct": selected_tool == expected_tool,
    }

# 测试用例
test_cases = [
    ("北京现在多少度？", "get_current_weather"),
    ("下周去上海要带伞吗", "get_weather_forecast"),
    ("去年今天北京下雪了吗", "get_historical_weather"),
    ("深圳明天和后天天气", "get_weather_forecast"),
]

for query, expected in test_cases:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": query}],
        tools=tools
    )
    selected = response.choices[0].message.tool_calls[0].function.name
    result = evaluate_tool_selection(query, selected, expected)
    print(f"{'✅' if result['correct'] else '❌'} {query} → {selected}")`
                }
            ],
            table: {
                headers: ["路由策略", "适用场景", "工具数量", "准确率"],
                rows: [
                    ["直接多工具传入", "工具少于5个，功能差异明显", "1-5", "~90%"],
                    ["分组工具定义", "工具5-15个，可按功能分组", "5-15", "~85%"],
                    ["两阶段路由", "工具超过15个，先分类再选择", "15+", "~95%"],
                    ["Few-shot示例", "工具描述难以区分时", "任意", "~92%"],
                ]
            },
            mermaid: `graph TD
    A["用户输入"] --> B{"工具数量"}
    B -->|"≤ 5"| C["直接传入所有工具"]
    B -->|"5-15"| D["按功能分组传入"]
    B -->|"> 15"| E["两阶段路由"]
    C --> F["模型选择工具"]
    D --> F
    E --> G["第一阶段：分类"]
    G --> H["第二阶段：选择"]
    H --> F
    F --> I["执行工具"]`
            ,
            tip: "在工具description中加入「不适用于...」的排除说明，能显著提升模型的路由准确率。",
            warning: "一次传入超过20个工具时，模型的选择质量会明显下降，建议使用两阶段路由策略。"
        },
        {
            title: "5. 工具执行与结果注入：从调用到反馈的完整链路",
            body: `工具调用的执行阶段是将模型的意图转化为实际结果的关键环节。这个阶段看似简单——解析参数、调用函数、返回结果——但其中隐藏着许多工程细节需要考虑。首先是参数验证：模型生成的参数虽然通常符合Schema定义，但仍可能出现边界情况，比如传入不存在的城市名或超出范围的数值。其次是错误处理：外部API可能超时、返回异常格式或完全不可用，你的代码需要优雅地处理这些失败场景。

结果注入环节同样重要。工具返回的数据需要以模型能够理解的格式传递回去。如果原始数据过于庞大（比如搜索返回100条结果），直接注入会超出上下文窗口，也会让模型难以提取关键信息。正确的做法是对工具结果进行适当的格式化和摘要，只保留模型生成回答所需的关键信息。比如天气API可能返回温度、湿度、风速、气压、紫外线指数等十几个字段，但如果用户只问了温度，只需注入温度相关的数据即可。`,
            code: [
                {
                    lang: "python",
                    code: `import requests
from typing import Any

def execute_tool_call(tool_call) -> str:
    """执行工具调用并返回结果字符串"""
    func_name = tool_call.function.name
    args = json.loads(tool_call.function.arguments)
    
    # 参数验证
    if func_name == "get_weather":
        city = args.get("city", "")
        if not city:
            return json.dumps({"error": "缺少城市参数"})
        
        # 执行 + 错误处理
        try:
            resp = requests.get(
                f"https://api.weather.com/v1/{city}",
                timeout=5
            )
            resp.raise_for_status()
            data = resp.json()
            # 结果格式化：只保留关键字段
            return json.dumps({
                "temperature": data["temp"],
                "description": data["description"],
                "humidity": data["humidity"]
            }, ensure_ascii=False)
        except requests.Timeout:
            return json.dumps({"error": "天气服务超时，请稍后重试"})
        except requests.HTTPError as e:
            return json.dumps({"error": f"天气服务错误: {e}"})`
                },
                {
                    lang: "python",
                    code: `# 完整的多轮工具调用循环
def chat_with_tools(user_message: str, 
                    tools: list,
                    tool_registry: dict,
                    max_tool_calls: int = 5) -> str:
    """支持多轮工具调用的完整对话循环"""
    messages = [{"role": "user", "content": user_message}]
    
    for _ in range(max_tool_calls):
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=tools
        )
        msg = response.choices[0].message
        
        if not msg.tool_calls:
            return msg.content  # 模型决定不再调用工具
        
        # 执行所有工具调用
        messages.append(msg)
        for tc in msg.tool_calls:
            func_name = tc.function.name
            if func_name in tool_registry:
                result = tool_registry[func_name](tc)
            else:
                result = json.dumps({"error": f"未知工具: {func_name}"})
            
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result
            })
    
    return "已达到最大工具调用次数"`
                }
            ],
            table: {
                headers: ["错误类型", "处理策略", "返回给模型", "用户体验"],
                rows: [
                    ["参数错误", "验证参数，返回错误说明", "参数校验错误信息", "模型修正参数重试"],
                    ["API超时", "设置timeout，返回超时提示", "服务暂时不可用", "模型告知用户稍后"],
                    ["API限流", "捕获429，返回限流信息", "请求过于频繁", "模型建议降低频率"],
                    ["数据过大", "截断/摘要后返回", "关键信息摘要", "模型基于摘要回答"],
                    ["工具不存在", "检查registry，返回提示", "未知工具错误", "模型选择其他工具"]
                ]
            },
            mermaid: `graph LR
    A["模型 tool_call"] --> B["解析函数名和参数"]
    B --> C["参数校验"]
    C -->|通过| D["执行工具"]
    C -->|失败| E["返回参数错误"]
    D --> F["捕获异常"]
    F -->|成功| G["格式化结果"]
    F -->|失败| H["返回错误信息"]
    G --> I["注入 tool 消息"]
    H --> I
    E --> I
    I --> J["模型继续推理"]`
            ,
            tip: "工具结果注入前务必进行格式化和精简——模型不需要看到完整的API原始响应，只需要与用户问题相关的关键信息。",
            warning: "永远不要将未处理的异常堆栈直接注入对话，这会污染上下文并可能导致模型产生混乱的回复。"
        },
        {
            title: "6. 安全与沙箱机制：防止工具调用带来的风险",
            body: `赋予模型调用外部工具的能力，本质上是赋予了它执行代码和操作外部系统的权限。这带来了显著的安全风险：如果模型被恶意提示注入攻击（Prompt Injection），攻击者可能诱导模型调用危险工具，比如删除文件、发送敏感数据或执行系统命令。因此，工具调用的安全防护不是可选项，而是必须实现的底线。

安全防护需要从多个层面构建：在工具层面，实现严格的参数校验和权限控制，确保每次调用都符合预期范围；在执行层面，使用沙箱环境隔离工具执行，限制网络访问和文件系统操作；在审计层面，记录所有工具调用的完整日志，包括调用时间、参数、结果和执行者身份；在业务层面，对敏感操作（如删除、转账、发送消息）增加人工确认环节，不让模型全自动执行。

另一个重要但常被忽视的风险是数据泄露。模型可能将工具返回的敏感数据（如用户个人信息、内部统计数据）传递给不应该看到这些信息的用户。解决方案是实现数据分级和脱敏机制——在工具结果注入对话之前，根据当前用户的权限级别过滤敏感字段。`,
            code: [
                {
                    lang: "python",
                    code: `# 安全工具执行器：参数校验 + 权限控制 + 审计日志
import logging
from functools import wraps

logger = logging.getLogger("tool_executor")

def safe_tool_executor(func):
    """装饰器：为工具函数添加安全防护"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        tool_name = func.__name__
        logger.info(f"[TOOL_CALL] {tool_name} args={args} kwargs={kwargs}")
        
        # 参数校验
        validated = validate_params(tool_name, args, kwargs)
        if not validated["valid"]:
            logger.warning(f"[BLOCKED] {tool_name}: {validated['reason']}")
            return {"error": f"参数校验失败: {validated['reason']}"}
        
        # 权限检查
        if not check_permission(tool_name, kwargs.get("user_id")):
            logger.warning(f"[DENIED] {tool_name} user={kwargs.get('user_id')}")
            return {"error": "权限不足，无法执行此操作"}
        
        # 敏感操作需要二次确认
        if is_sensitive_operation(tool_name):
            if not request_confirmation(tool_name, kwargs):
                return {"error": "操作已取消：需要用户确认"}
        
        try:
            result = func(*args, kwargs)
            logger.info(f"[SUCCESS] {tool_name}")
            return result
        except Exception as e:
            logger.error(f"[ERROR] {tool_name}: {e}")
            return {"error": "工具执行失败"}
    
    return wrapper`
                },
                {
                    lang: "python",
                    code: `# 数据脱敏：根据用户权限过滤工具返回结果
def sanitize_tool_result(tool_name: str, 
                         result: dict, 
                         user_role: str) -> dict:
    """根据用户角色脱敏工具返回数据"""
    # 定义每个工具的字段权限级别
    field_permissions = {
        "get_user_profile": {
            "name": "all",
            "email": "authenticated",
            "phone": "admin",
            "address": "admin",
            "id_number": "admin",
            "password_hash": "never",  # 永远不返回
        },
        "search_database": {
            "order_id": "all",
            "amount": "authenticated",
            "payment_method": "admin",
            "card_last_four": "admin",
        }
    }
    
    if tool_name not in field_permissions:
        return result  # 未定义的工具不过滤
    
    rules = field_permissions[tool_name]
    sanitized = {}
    
    for field, value in result.items():
        required_role = rules.get(field, "never")
        role_levels = ["all", "authenticated", "admin"]
        
        if user_role == "never":
            continue  # 永远不返回
        if required_role == "all":
            sanitized[field] = value
        elif role_levels.index(user_role) >= role_levels.index(required_role):
            sanitized[field] = value
    
    return sanitized`
                }
            ],
            table: {
                headers: ["安全层", "防护措施", "防护目标", "实现难度"],
                rows: [
                    ["参数校验", "类型/范围/格式检查", "防止非法参数", "⭐ 简单"],
                    ["权限控制", "RBAC角色权限验证", "越权操作", "⭐⭐ 中等"],
                    ["沙箱执行", "容器/进程隔离", "系统级攻击", "⭐⭐⭐ 困难"],
                    ["数据脱敏", "按角色过滤字段", "数据泄露", "⭐⭐ 中等"],
                    ["审计日志", "全量记录调用链", "事后追溯", "⭐ 简单"],
                    ["人工确认", "敏感操作需审批", "误操作/恶意调用", "⭐⭐ 中等"]
                ]
            },
            mermaid: `graph TD
    A["工具调用请求"] --> B["参数校验层"]
    B -->|通过| C["权限控制层"]
    B -->|拒绝| Z["返回错误"]
    C -->|通过| D{"是否敏感操作"}
    C -->|拒绝| Z
    D -->|是| E["人工确认层"]
    D -->|否| F["沙箱执行"]
    E -->|确认| F
    E -->|拒绝| Z
    F --> G["数据脱敏"]
    G --> H["审计日志"]
    H --> I["返回结果"]`
            ,
            tip: "永远不要信任模型的参数输入——即使模型通常表现良好，也必须对所有工具参数进行服务端校验。",
            warning: "Prompt Injection攻击可能让模型绕过你的安全逻辑，所有敏感操作必须在代码层面强制校验，不能依赖模型的自我约束。"
        },
        {
            title: "7. 实战：天气查询 + 计算器 + 搜索 Agent",
            body: `现在我们将前面学到的知识整合起来，构建一个完整的多工具Agent。这个Agent具备三种核心能力：实时天气查询（外部API调用）、精确数学计算（避免大模型计算错误）、互联网搜索（获取最新信息）。这三个工具覆盖了Function Calling最常见的应用场景——实时数据获取、精确计算、知识扩展。

我们将使用OpenAI的Function Calling API作为核心框架，配合requests库调用外部服务，构建一个端到端的Agent系统。代码结构清晰分层：工具定义层描述每个工具的Schema，工具实现层封装实际的执行逻辑，Agent协调层管理完整的对话循环，包括工具选择、执行、结果注入和最终回答生成。

这个实战项目的价值在于它是可扩展的——你可以轻松地添加更多工具（数据库查询、邮件发送、文件操作等），而Agent的核心循环代码不需要修改。这正是Function Calling架构的优雅之处：工具即插即用，Agent的核心逻辑保持不变。`,
            code: [
                {
                    lang: "python",
                    code: `# ===== 工具定义 =====
WEATHER_TOOL = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "查询指定城市的当前天气状况",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "城市名称，如北京、上海"}
            },
            "required": ["city"]
        }
    }
}

CALCULATOR_TOOL = {
    "type": "function",
    "function": {
        "name": "calculate",
        "description": "执行数学计算，支持加减乘除、幂运算、开方",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string", 
                    "description": "数学表达式，如 '2 + 2'、'3  4'、'sqrt(144)'"
                }
            },
            "required": ["expression"]
        }
    }
}

SEARCH_TOOL = {
    "type": "function",
    "function": {
        "name": "web_search",
        "description": "搜索互联网获取最新信息，适用于查询实时新闻、最新事件或训练数据之外的知识",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "搜索关键词"},
                "num_results": {"type": "integer", "description": "返回结果数量，默认5"}
            },
            "required": ["query"]
        }
    }
}

ALL_TOOLS = [WEATHER_TOOL, CALCULATOR_TOOL, SEARCH_TOOL]`
                },
                {
                    lang: "python",
                    code: `# ===== 工具实现 + Agent 核心 =====
import openai
import requests
import math

client = openai.OpenAI()

TOOL_REGISTRY = {
    "get_weather": lambda args: _get_weather(args["city"]),
    "calculate": lambda args: {"result": _calc(args["expression"])},
    "web_search": lambda args: _search(args["query"], args.get("num_results", 5)),
}

def _get_weather(city: str) -> dict:
    resp = requests.get(f"https://wttr.in/{city}?format=j1", timeout=5)
    data = resp.json()["current_condition"][0]
    return {"city": city, "temp": data["temp_C"], "desc": data["weatherDesc"][0]["value"]}

def _calc(expr: str) -> str:
    allowed = set("0123456789+-*/.() ")
    if not all(c in allowed for c in expr):
        return "错误：表达式包含非法字符"
    return str(eval(expr, {"__builtins__": {}, "sqrt": math.sqrt, "pow": pow}))

def _search(query: str, n: int = 5) -> list:
    resp = requests.get(f"https://api.duckduckgo.com/?q={query}&format=json")
    return [{"title": r["Text"], "url": r["FirstURL"]} for r in resp.json().get("Results", [])[:n]]

# Agent 协调层
def agent_run(user_input: str, max_rounds: int = 5) -> str:
    messages = [{"role": "user", "content": user_input}]
    for _ in range(max_rounds):
        resp = client.chat.completions.create(
            model="gpt-4o", messages=messages, tools=ALL_TOOLS
        )
        msg = resp.choices[0].message
        if not msg.tool_calls:
            return msg.content
        messages.append(msg)
        for tc in msg.tool_calls:
            result = TOOL_REGISTRY[tc.function.name](
                json.loads(tc.function.arguments)
            )
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result, ensure_ascii=False)
            })
    return "已达到最大调用次数"

# 测试
print(agent_run("北京天气怎么样？"))
print(agent_run("2的32次方等于多少？"))
print(agent_run("今天有什么重要国际新闻？"))`
                }
            ],
            table: {
                headers: ["工具", "输入", "输出示例", "错误处理"],
                rows: [
                    ["天气查询", "{\"city\": \"北京\"}", "{\"temp\": 22, \"desc\": \"晴\"}", "超时/城市不存在"],
                    ["计算器", "{\"expr\": \"2+2\"}", "{\"result\": 4}", "非法字符/除零"],
                    ["网络搜索", "{\"query\": \"AI新闻\"}", "[{\"title\": ..., \"url\": ...}]", "API限流/无结果"],
                ]
            },
            mermaid: `graph TD
    A["用户: 北京天气？"] --> B["Agent 分析意图"]
    B --> C{"选择工具"}
    C -->|天气查询| D["get_weather"]
    C -->|计算器| E["calculate"]
    C -->|网络搜索| F["web_search"]
    D --> G["wttr.in API"]
    E --> H["Python eval"]
    F --> I["DuckDuckGo API"]
    G --> J["天气结果"]
    H --> K["计算结果"]
    I --> L["搜索结果"]
    J --> M["Agent 综合回答"]
    K --> M
    L --> M
    M --> N["用户: 北京22°C，晴天"]`
            ,
            tip: "Agent架构的核心价值在于可扩展性——新增工具只需添加定义和实现，核心循环代码零修改。",
            warning: "计算器工具中的eval函数必须严格限制允许的字符集合，否则存在代码注入风险。"
        }
    ],
};
