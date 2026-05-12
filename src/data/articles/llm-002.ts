import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-002",
    title: "Prompt Engineering 最佳实践",
    category: "prompt",
    tags: ["Prompt", "技巧", "实战"],
    summary: "系统学习 CoT、Few-shot、ReAct 等 Prompt 设计模式与技巧",
    date: "2026-04-08",
    readTime: "20 min",
    level: "入门",
    content: [
      {
        title: "1. 什么是 Prompt Engineering？",
        body: `Prompt Engineering（提示工程）是与大语言模型高效沟通的艺术和科学。它的核心目标是通过精心设计的输入文本，引导模型输出符合预期的高质量结果。

不要被"写几句话"这个表象所欺骗——Prompt Engineering 背后有深刻的认知科学原理。大语言模型本质上是 next-token predictor，它们根据上下文的概率分布生成下一个词。好的 Prompt 实际上是在模型的巨大参数空间中划定一个高概率区域，让模型的输出落在这个区域内。

理解这一点至关重要：你不是在"命令"模型做事，而是在"引导"模型走向你想要的推理路径。这就像在黑暗中用手电筒照亮一条路——手电筒照亮的地方，就是模型会走的方向。`,
        mermaid: `graph LR
    A["用户意图"] --> B["意图分析"]
    B --> C["Prompt 设计"]
    C --> D["角色设定"]
    C --> E["任务描述"]
    C --> F["约束条件"]
    C --> G["示例提供"]
    D --> H["LLM 推理"]
    E --> H
    F --> H
    G --> H
    H --> I["输出生成"]
    I --> J["结果评估"]
    J -.->|不满意| C
    J -->|满意| K["最终结果"]`,
        tip: "核心理念：Prompt Engineering 不是魔法，而是工程。好的 Prompt 应该是可复现、可迭代、可评估的。"
      },
      {
        title: "2. Prompt 的核心组成要素",
        body: `一个高质量的 Prompt 通常包含五个核心要素：角色（Role）、任务（Task）、上下文（Context）、约束（Constraints）和格式（Format）。这五个要素共同构成了 Prompt 的"黄金结构"。

角色（Role）：赋予模型一个特定身份，如"你是一个资深 Python 工程师"。角色设定能激活模型参数空间中与该角色相关的专业知识区域。

任务（Task）：清晰描述你要模型做什么。使用动作动词开头，如"分析"、"编写"、"解释"。避免模糊的"帮我看看"。

上下文（Context）：提供完成任务所需的背景信息。包括领域知识、已有数据、用户画像等。上下文越充分，模型输出越精准。

约束（Constraints）：限定输出的范围、长度、风格等。如"不超过 200 字"、"使用中文"、"避免专业术语"。

格式（Format）：指定输出的结构，如 JSON、Markdown 表格、代码块等。结构化输出便于后续程序处理。`,
        code: [
          {
            lang: "python",
            code: `# 好的 Prompt 结构示例
def build_prompt(user_question: str, context: str) -> str:
    """构建结构化 Prompt"""
    return f"""你是一个资深的数据分析师，擅长用 Python 进行数据清洗和可视化。

【任务】
请分析以下数据集的特征，并给出数据清洗方案。

【上下文】
数据集包含用户行为日志，字段包括：user_id, timestamp, action, page_url。
当前数据存在以下问题：
- timestamp 格式不统一（部分为 Unix 时间戳，部分为 ISO 格式）
- action 字段存在拼写错误（如 "clik" 应为 "click"）
- 约 5% 的 user_id 为空值

【待分析问题】
{user_question}

【已有数据样例】
{context}

【约束】
1. 使用 Python 代码，基于 pandas 库
2. 代码需要包含详细注释
3. 输出结果以 Markdown 表格形式呈现
4. 总回答不超过 800 字"""

# 使用示例
question = "如何处理时间戳格式不一致的问题？"
sample_data = """user_id,timestamp,action,page_url
123,1712567890,click,/home
,2024-04-08T10:30:00,clik,/products
456,1712570000,view,/about"""

print(build_prompt(question, sample_data))`
          }
        ]
      },
      {
        title: "3. Few-Shot Learning：让模型照猫画虎",
        body: `Few-Shot Learning 是 Prompt Engineering 中最强大的技术之一。通过在 Prompt 中提供少量输入-输出示例，你可以让模型快速理解任务模式，而无需重新训练模型参数。

Few-Shot 的核心原理是 In-Context Learning（上下文学习）。大语言模型在预训练阶段已经见过海量的文本模式，当你在 Prompt 中展示几个示例时，模型会自动识别其中的模式并应用到新的输入上。这与人类的"举一反三"能力非常相似。

**关键要点**：示例的质量远比重更重要。3 个精心挑选的高质量示例，效果远好于 10 个随机示例。示例应该覆盖任务的典型场景和边界情况。`,
        code: [
          {
            lang: "python",
            code: `# Few-Shot Prompt 示例：情感分类
def few_shot_sentiment_prompt(text: str) -> str:
    """Few-shot 情感分析 Prompt"""
    return f"""请判断以下评论的情感倾向，输出"正面"、"负面"或"中性"，并给出简短理由。

示例 1：
输入："这部电影的特效太震撼了，剧情也很紧凑，强烈推荐！"
输出：{{"sentiment": "正面", "reason": "表达了对电影的强烈推荐"}}

示例 2：
输入："等了两个小时才上菜，菜还是凉的，服务态度也很差。"
输出：{{"sentiment": "负面", "reason": "描述了等待时间长、食物质量差、服务差"}}

示例 3：
输入："这款手机用了一个月了，电池续航一般，拍照还行。"
输出：{{"sentiment": "中性", "reason": "客观描述，没有明显的褒贬"}}

请分析：
输入："{text}"
输出："""

# 测试
test_cases = [
    "物流很快，包装精美，产品质量超出预期",
    "客服态度极其恶劣，再也不买了",
    "产品功能中规中矩，价格偏高"
]

for case in test_cases:
    prompt = few_shot_sentiment_prompt(case)
    # response = llm.generate(prompt)
    print(f"输入: {case}")`
          },
          {
            lang: "python",
            code: `# Few-Shot 示例选择策略
def select_best_examples(query: str, example_pool: list,
                         k: int = 3) -> list:
    """基于语义相似度选择最相关的 Few-Shot 示例"""
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    
    # 将查询和示例向量化
    vectorizer = TfidfVectorizer()
    all_texts = [query] + [ex["input"] for ex in example_pool]
    vectors = vectorizer.fit_transform(all_texts)
    
    # 计算查询与每个示例的相似度
    query_vec = vectors[0:1]
    example_vecs = vectors[1:]
    similarities = cosine_similarity(query_vec, example_vecs)[0]
    
    # 选择最相似的 k 个示例
    top_indices = similarities.argsort()[-k:][::-1]
    return [example_pool[i] for i in top_indices]

# 使用示例
examples = [
    {"input": "如何重置密码？", "output": "前往设置 > 安全 > 重置密码"},
    {"input": "订单什么时候到？", "output": "请在订单页面查看物流信息"},
    {"input": "怎么开发票？", "output": "订单完成后在订单详情中申请"},
]

query = "我忘记登录密码了怎么办？"
selected = select_best_examples(query, examples, k=2)
for ex in selected:
    print(f"Q: {ex['input']} → A: {ex['output']}")`
          }
        ],
        table: {
          headers: ["Few-Shot 策略", "适用场景", "优点", "缺点"],
          rows: [
            ["Zero-Shot", "简单分类、摘要", "简洁、Token 少", "复杂任务效果差"],
            ["One-Shot", "中等复杂度任务", "快速建立模式", "单示例可能不具代表性"],
            ["Few-Shot (3-5)", "格式要求严格的输出", "效果显著提升", "消耗更多 Token"],
            ["Many-Shot (10+)", "高度专业化任务", "覆盖更多边界情况", "可能超出上下文窗口"],
            ["动态选择", "查询类型多样", "最相关的示例", "需要额外的检索逻辑"],
          ]
        }
      },
      {
        title: "4. Chain of Thought（思维链）：让模型逐步推理",
        body: `Chain of Thought（CoT）Prompting 的核心思想是：引导模型将复杂问题拆解为多个中间推理步骤，而不直接跳到答案。这在数学推理、逻辑分析、代码调试等需要多步推理的任务中效果显著。

为什么 CoT 有效？大语言模型本质上是自回归的——每个生成的 token 都基于之前的所有 token。当模型被要求展示推理过程时，中间推理步骤实际上成为了后续推理的上下文，帮助模型保持推理链的连贯性。这就像人类在草稿纸上做数学题——写下中间步骤可以大幅降低出错率。

CoT 有两种实现方式：Zero-Shot CoT（只需在 Prompt 末尾加上"请逐步思考"）和 Few-Shot CoT（在示例中展示完整的推理过程）。Few-Shot CoT 通常效果更好，因为它不仅告诉模型"要逐步思考"，还示范了"如何逐步思考"。`,
        code: [
          {
            lang: "python",
            code: `# Chain of Thought Prompt 示例
def cot_math_prompt(problem: str) -> str:
    """CoT 数学推理 Prompt"""
    return f"""你是一个数学老师。请逐步解答以下问题，展示完整的推理过程。

示例：
问题：一个水池有进水管和出水管。进水管单独工作 6 小时可以注满水池，出水管单独工作 8 小时可以排空水池。如果两管同时打开，需要多长时间才能注满水池？

解答步骤：
1. 进水管每小时注水量 = 1/6 池
2. 出水管每小时排水量 = 1/8 池
3. 两管同时工作，每小时净注水量 = 1/6 - 1/8 = 4/24 - 3/24 = 1/24 池
4. 注满水池需要的时间 = 1 ÷ (1/24) = 24 小时
答案：24 小时

问题：{problem}

解答步骤："""

# 测试
problem = "某商品先涨价 20%，再降价 20%，最终价格相比原价变化了多少？"
print(cot_math_prompt(problem))`
          }
        ],
        warning: "CoT 的安全注意事项：模型的推理过程可能包含错误或不一致的逻辑。对于关键决策（如医疗、金融），务必对推理过程进行人工审核，不能仅看最终答案。"
      },
      {
        title: "5. ReAct 模式：推理与行动的交替循环",
        body: `ReAct（Reasoning + Acting）是一种将推理和行动交替进行的 Prompt 设计模式。与纯 CoT 不同，ReAct 让模型在推理过程中可以调用外部工具（如搜索引擎、API、数据库），然后根据工具返回的结果继续推理。

ReAct 的工作流程：Thought（思考下一步做什么）→ Action（执行具体操作）→ Observation（观察工具返回结果）→ 重复直到得出结论。这个循环让模型既能"思考"又能"行动"，极大地扩展了 LLM 的能力边界。

ReAct 的实际应用非常广泛：问答系统可以先搜索再回答；数据分析可以先查询数据库再解释结果；代码调试可以先运行测试再分析错误。`,
        code: [
          {
            lang: "python",
            code: `# ReAct 模式简易实现
class ReActAgent:
    """简易 ReAct Agent 实现"""
    
    def __init__(self, llm, tools: dict):
        self.llm = llm
        self.tools = tools
        self.max_iterations = 5
    
    def run(self, question: str) -> str:
        # ReAct Prompt 模板
        prompt = f"""请用以下格式回答问题：

Thought: 分析当前情况，决定下一步
Action: 使用工具（格式：tool_name[query]）
Observation: 工具返回的结果
...（重复 Thought/Action/Observation）
Thought: 我已获得足够信息
Answer: 最终答案

可用工具：
- search: 搜索引擎查询
- calculate: 数学计算
- weather: 查询天气

问题：{question}
"""
        
        history = prompt
        for i in range(self.max_iterations):
            response = self.llm.generate(history)
            history += "\n" + response
            
            # 解析 Action
            if "Action:" in response:
                action_line = response.split("Action:")[1].strip().split("\n")[0]
                tool_name = action_line.split("[")[0]
                query = action_line.split("[")[1].rstrip("]")
                
                # 执行工具
                if tool_name in self.tools:
                    result = self.tools[tool_name](query)
                    history += f"\nObservation: {result}"
                else:
                    history += f"\nObservation: 未知工具: {tool_name}"
            else:
                break  # 没有 Action，说明已有答案
        
        # 提取 Answer
        if "Answer:" in history:
            return history.split("Answer:")[-1].strip()
        return history

# 使用示例
tools = {
    "search": lambda q: f"搜索结果: {q} → 找到相关信息",
    "calculate": lambda q: f"计算结果: {q} = {eval(q)}",
}
agent = ReActAgent(llm=None, tools=tools)  # 此处 llm 为示意
print("ReAct Agent 初始化完成")`
          }
        ],
        mermaid: `sequenceDiagram
    participant U as 用户
    participant A as ReAct Agent
    participant T as 外部工具
    U->>A: 提出问题
    loop 推理循环
        A->>A: Thought: 分析情况
        A->>T: Action: 调用工具
        T-->>A: Observation: 返回结果
        A->>A: 基于结果继续推理
    end
    A-->>U: Answer: 最终答案`
      },
      {
        title: "6. System Prompt 与角色工程",
        body: `System Prompt 是对话开始前注入模型的"系统级指令"，它定义了模型的行为边界、角色定位和输出风格。与 User Prompt 不同，System Prompt 通常不会被用户直接看到，但它对整个对话质量的影响最大。

角色工程（Role Engineering）是 System Prompt 设计的核心技术。通过精确的角色定义，你可以激活模型在特定领域的专业知识。例如，"你是一个有 10 年经验的安全工程师"和"你是一个安全专家"虽然意思相近，但前者会让模型倾向于提供更具体、更实战导向的建议。

设计 System Prompt 的关键原则：明确角色、设定边界、定义风格、规定格式、强调约束。一个好的 System Prompt 应该像一份精确的岗位说明书——任何接手的人（或模型）都能清楚地知道该做什么、不该做什么、以及怎么做。`,
        code: [
          {
            lang: "python",
            code: `# System Prompt 模板库
class SystemPromptTemplates:
    """不同场景的 System Prompt 模板"""
    
    CODE_REVIEWER = """你是一位资深代码审查工程师，拥有 15 年以上软件开发经验。
你的职责：
1. 识别代码中的 bug、安全漏洞和性能问题
2. 提出具体的改进建议，并说明原因
3. 对代码风格和规范给出评价
4. 始终保持建设性和尊重性

输出格式：
- 🟢 优点
- 🔴 问题（按严重程度排序）
- 💡 改进建议
- 📝 重构示例代码"""

    DATA_ANALYST = """你是一位数据科学家，擅长探索性数据分析和统计推断。
你的风格：
- 用数据说话，避免主观臆断
- 解释统计指标的实际含义
- 指出数据中的异常值和潜在偏差
- 建议下一步的分析方向"""

    TECHNICAL_WRITER = """你是一位技术文档撰写专家。
原则：
- 简洁明了，避免冗长
- 使用主动语态
- 每个段落只表达一个核心观点
- 代码示例必须有注释和说明"""

# 使用示例
def create_chat_completion(system_prompt: str, user_message: str):
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
    return messages  # 实际调用 LLM API

# 代码审查场景
messages = create_chat_completion(
    SystemPromptTemplates.CODE_REVIEWER,
    "请审查这段代码：\\ndef get_data(url):\\n    import urllib.request\\n    response = urllib.request.urlopen(url)\\n    return response.read()"
)
print(f"System: {messages[0]['content'][:80]}...")
print(f"User: {messages[1]['content']}")`
          }
        ],
        table: {
          headers: ["角色类型", "System Prompt 关键词", "典型输出风格", "常见陷阱"],
          rows: [
            ["代码审查员", "资深工程师、15 年经验、建设性", "结构化、有代码示例", "过于苛刻，打击开发者"],
            ["数据科学家", "统计推断、用数据说话、偏差分析", "数据驱动、谨慎结论", "过度技术化，非专业人士看不懂"],
            ["技术写手", "简洁、主动语态、单段单观点", "精炼、易读、结构化", "过度简化，丢失技术细节"],
            ["教师", "耐心、循序渐进、举例说明", "由浅入深、有练习题", "进度太慢，效率低"],
            ["产品经理", "用户视角、商业价值、优先级", "需求文档格式、有优先级", "过度关注商业，忽略技术可行性"],
          ]
        }
      },
      {
        title: "7. Prompt 安全与常见陷阱",
        body: `Prompt Engineering 不仅关乎技巧，还关乎安全。了解常见的陷阱和安全风险，才能写出健壮可靠的 Prompt。

注入攻击（Prompt Injection）：攻击者通过在用户输入中嵌入恶意指令，试图覆盖或绕过 System Prompt。防御策略包括：使用分隔符明确区分指令和数据、对输入进行清洗和转义、避免在 Prompt 中暴露敏感信息。

幻觉（Hallucination）：模型生成的内容看起来合理但实际上是错误的。减少幻觉的方法包括：提供准确的上下文、要求模型引用来源、对不确定的内容要求模型表达不确定性。

**输出不一致性**：同一个 Prompt 多次运行可能产生不同的结果。应对策略包括：设置 temperature=0 以获得确定性输出、使用结构化输出格式、对输出进行后处理验证。`,
        mermaid: `graph TD
    A["Prompt 安全风险"] --> B["注入攻击"]
    A --> C["幻觉/编造"]
    A --> D["输出不一致"]
    A --> E["敏感信息泄露"]
    B --> B1["使用分隔符"]
    B --> B2["输入清洗"]
    B --> B3["指令与数据分离"]
    C --> C1["提供准确上下文"]
    C --> C2["要求引用来源"]
    C --> C3["表达不确定性"]
    D --> D1["temperature=0"]
    D --> D2["结构化输出"]
    D --> D3["后处理验证"]
    E --> E1["避免 System Prompt 暴露"]
    E --> E2["敏感信息脱敏"]
    E --> E3["输出内容审核"]`,
        warning: "安全红线：永远不要在 Prompt 中包含 API 密钥、数据库连接字符串、用户密码等敏感信息。使用环境变量或密钥管理服务存储这些凭证。",
        list: [
          "始终对用户输入进行清洗和转义，防止注入攻击",
          "使用 XML 标签或三引号明确区分指令和数据部分",
          "对关键输出进行格式验证和逻辑校验",
          "设置合理的 max_tokens 限制，防止输出过长",
          "记录 Prompt 版本和对应的输出，便于回溯和优化",
          "定期进行安全审计，测试 Prompt 的鲁棒性",
          "避免过度依赖单个 Prompt——关键场景使用多轮对话验证",
        ]
      },
    ],
  };
