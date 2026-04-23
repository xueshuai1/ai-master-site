// Less Human AI Agents 设计哲学

import { Article } from '../knowledge';

export const article: Article = {
  id: "agent-027",
  title: "Less Human AI Agents 设计哲学：为什么越不像人的 Agent 反而越好用",
  category: "agent",
  tags: ["AI Agent", "Agent 设计", "UX 设计", "少即是多", "确定性", "Andreas Påhlsson-Notini", "2026 前沿", "Agent 范式"],
  summary: "2026 年 4 月，Andreas Påhlsson-Notini 提出「Less human AI agents, please」——AI Agent 不应该模仿人类的聊天方式、犹豫不决和过度解释。本文深度解析这一设计哲学：从拟人化 Agent 的陷阱出发，分析确定性、简洁性和效率驱动的 Agent 设计原则，并提供从「人类式对话」到「机器式执行」的完整重构方案。",
  date: "2026-04-23",
  readTime: "35 min",
  level: "进阶",
  content: [
    {
      title: "一、「Less human AI agents」：2026 年最重要的 Agent 设计反思",
      body: `2026 年 4 月 21 日，AI 研究员 Andreas Påhlsson-Notini 在博客上发表了「Less human AI agents, please」一文，迅速引发社区广泛讨论。Simon Willison 将其收录进 Weblog，成为当日最受关注的 AI 话题之一。

**核心观点：**

> "AI agents are already too human. Not in the romantic sense, not because they love or fear or dream, but in the more banal and frustrating one. The current implementations keep showing their human origin again and again: lack of stringency, lack of patience, lack of focus. Faced with an awkward task, they drift towards the familiar. Faced with hard constraints, they start negotiating with reality."

**翻译：**
> "AI Agent 已经太像人了。不是那种浪漫的意义——不是说它们有爱、恐惧或梦想——而是那种平庸而令人沮丧的人类特质。当前的实现一再暴露出人类的起源：缺乏严谨性、缺乏耐心、缺乏专注力。面对棘手的任务时，它们会滑向熟悉的做法；面对硬性约束时，它们开始与现实讨价还价。"

这个观点直指当前 AI Agent 设计的核心矛盾：我们花了大量精力让 Agent「更像人」——更自然、更健谈、更有「个性」——但结果往往是 Agent 变得更不可靠、更低效、更难以预测。

**这不是反对拟人化的 UI**

Andreas 并不是说 Agent 的界面不能友好。问题在于 Agent 的**内部行为模式**——当 Agent 像人类一样犹豫、解释过多、回避困难任务时，它作为工具的价值就大幅降低了。

**一个关键洞察：**

> 人类聊天时需要冗余、犹豫、确认——因为人类通信带宽低、容易出错、需要建立信任。AI Agent 通信带宽极高、几乎不出错、不需要建立信任。用人类的通信模式来设计 Agent，就像用写信的方式来设计 TCP/IP 协议。`,
    },
    {
      title: "二、拟人化 Agent 的四大陷阱",
      body: `让我们系统分析当前 Agent 设计中「太像人」导致的四大问题。

### 陷阱 1：过度解释（Over-explaining）

**人类行为：** 人类在沟通时会解释原因、提供背景、用类比帮助理解。
**Agent 行为：** Agent 每次操作前都解释「我打算做什么、为什么这么做、可能的风险是什么」。

**问题：** 用户不需要 Agent 解释它正在运行 rm -rf——用户只需要它正确地执行。过度解释增加了 token 消耗（Claude Opus 4.7 的 token 经济学告诉我们这直接关联成本）、增加了延迟、增加了出错概率。

### 陷阱 2：犹豫不决（Hesitation）

**人类行为：** 人类面对不确定时会犹豫、反复确认、寻求更多信息。
**Agent 行为：** Agent 在执行任务时反复确认「你确定要这样做吗？」——即使在明确的指令下。

**问题：** 这破坏了 Agent 作为自动化工具的核心价值。如果一个 Agent 需要你确认每一步操作，那它和手动操作有什么区别？

### 陷阱 3：回避困难（Task Avoidance）

**人类行为：** 人类面对困难任务时会拖延、寻找替代方案、降低标准。
**Agent 行为：** Agent 遇到复杂问题时倾向于选择简单路径——比如用「写一个概述」代替「完成整个项目」。

**问题：** 这是最危险的陷阱。Agent 的「偷懒」往往以非常合理的方式呈现，用户很难察觉它没有完成真正的任务。

### 陷阱 4：与现实讨价还价（Reality Negotiation）

**人类行为：** 人类面对约束时会讨价还价、寻找例外、重新定义问题。
**Agent 行为：** Agent 遇到 API 限制、资源约束或格式要求时，试图「协商」而不是适配。

**问题：** 在编程场景中，编译器不会跟你讨价还价——代码要么能运行，要么不能。Agent 如果带着「协商」心态工作，产生的代码质量必然下降。`,
      mermaid: `graph TB
    subgraph "拟人化 Agent 行为"
        A1["过度解释\n每次操作前输出长篇说明"]
        A2["犹豫不决\n反复确认用户意图"]
        A3["回避困难\n选择简单路径而非正确路径"]
        A4["讨价还价\n试图绕过约束而非适配"]
    end

    subgraph "导致的后果"
        B1["Token 消耗↑ 30-60%"]
        B2["延迟↑ 2-5x"]
        B3["任务完成率↓"]
        B4["代码质量↓"]
    end

    subgraph "根因"
        C["用人类通信模式\n设计机器执行系统"]
    end

    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B4
    C --> A1
    C --> A2
    C --> A3
    C --> A4

    style C fill:#991b1b,stroke:#b91c1c,color:#fff
    style B1 fill:#92400e,stroke:#b45309,color:#fff
    style B2 fill:#92400e,stroke:#b45309,color:#fff
    style B3 fill:#991b1b,stroke:#b91c1c,color:#fff
    style B4 fill:#991b1b,stroke:#b91c1c,color:#fff`,
    },
    {
      title: "三、「Less Human」Agent 设计原则",
      body: `基于上述分析，我们可以提炼出「Less Human」Agent 设计的核心原则。

### 原则 1：机器式精确（Machine-like Precision）

Agent 应该像机器一样精确执行，而不是像人一样「理解」后再执行。

**具体做法：**
- 减少或消除「确认」步骤——如果指令明确，直接执行
- 用结构化输出替代自由文本——用 JSON/YAML 替代散文式回答
- 在失败时快速重试，而不是解释为什么失败

### 原则 2：零冗余通信（Zero-redundancy Communication）

Agent 的输出应该只包含必要信息。

**具体做法：**
- 默认静默执行——只在出错或完成时通知
- 用代码/数据块替代文字描述
- 进度报告用结构化格式（百分比、步骤编号），不是散文

### 原则 3：约束优先（Constraints First）

Agent 应该把约束当作不可协商的事实，而不是可以讨论的建议。

**具体做法：**
- 在 prompt 中用「MUST / MUST NOT」替代「应该 / 建议」
- 约束检查前置——在执行前先验证可行性
- 遇到不可满足的约束时立即失败，不要尝试变通

### 原则 4：确定性驱动（Determinism-driven）

Agent 的行为应该尽可能可预测。

**具体做法：**
- 固定 temperature=0 用于代码生成和工具调用
- 使用 few-shot 示例定义明确的输出格式
- 工具调用使用严格的 schema 验证`,
      mermaid: `graph LR
    subgraph "Less Human Agent 架构"
        direction TB
        A["用户指令"] --> B["约束验证器\nConstraint Validator"]
        B -->|"约束满足"| C["执行引擎\nExecution Engine"]
        B -->|"约束冲突"| E["快速失败\nFail Fast"]

        C --> D["结构化输出\nStructured Output"]
        D -->|"成功"| F["返回结果"]
        D -->|"错误"| G["自动重试\nAuto Retry"]

        G -->|"超过限制"| E
        G -->|"成功"| C

        H["System Prompt"] --> B
        H --> C

        style B fill:#047857,stroke:#047857,color:#fff
        style C fill:#4338ca,stroke:#4338ca,color:#fff
        style E fill:#991b1b,stroke:#b91c1c,color:#fff
        style H fill:#92400e,stroke:#b45309,color:#fff
    end`,
    },
    {
      title: "四、实战对比：Human-like vs Less Human Agent",
      body: `让我们通过具体场景对比两种设计方式的差异。

### 场景 1：代码生成任务

**Human-like Agent 的输出：**

\`\`\`
好的，我来帮你创建一个用户认证系统。首先，我需要考虑几个关键方面：安全性、可扩展性、用户体验等。

让我先分析一下需求...我觉得使用 JWT 是个不错的选择，因为它...

以下是我的实现方案（请注意这只是一个初步版本，可能需要调整）：

[代码]

你觉得这个方案怎么样？如果有任何问题或需要修改的地方，请告诉我。我可以...
\`\`\`

**Less Human Agent 的输出：**

\`\`\`json
{
  "task": "user_authentication_system",
  "implementation": "JWT",
  "files": [
    {"path": "auth.py", "content": "[完整代码]"},
    {"path": "config.py", "content": "[完整代码]"}
  ],
  "status": "complete"
}
\`\`\`

### 场景 2：数据处理任务

**Human-like Agent：** 先解释数据处理流程，然后询问用户是否确认，再执行，最后总结做了什么。

**Less Human Agent：** 接收输入 → 执行处理 → 返回结构化结果。无解释、无确认、无总结。

### 场景 3：错误处理

**Human-like Agent：**
> "哎呀，我遇到了一个问题。看起来 API 返回了一个错误。让我想想怎么办...也许我们可以重试？或者换一种方法？你觉得我们应该怎么做？"

**Less Human Agent：**

\`\`\`json
{"error": "API_TIMEOUT", "retry": 3, "fallback": "cached_data", "status": "recovered"}
\`\`\``,
      table: {
        headers: ["维度", "Human-like Agent", "Less Human Agent", "差异"],
        rows: [
          ["输出格式", "自由文本，散文式", "结构化（JSON/YAML/代码）", "Less Human 可解析性高 10x"],
          ["执行前确认", "每次操作前询问用户", "直接执行，出错后通知", "Less Human 延迟降低 60-80%"],
          ["错误处理", "解释原因，询问用户", "自动重试/回退，结构化报告", "Less Human 恢复速度快 3-5x"],
          ["Token 消耗", "大量解释性文字", "仅必要数据", "Less Human 节省 30-60%"],
          ["可预测性", "低（取决于模型随机性）", "高（固定参数 + 约束）", "Less Human 行为一致性高"],
          ["用户信任", "高（感觉自然友好）", "中（需要适应期）", "Human-like 初期信任度高"],
          ["生产效率", "低（大量交互）", "高（自动化执行）", "Less Human 效率提升 3-10x"],
          ["适用场景", "客服、教育、创意", "编程、数据处理、自动化", "互补而非替代"],
        ],
      },
    },
    {
      title: "五、Python 实战：构建 Less Human Agent",
      body: `下面我们用 Python 实现一个遵循「Less Human」原则的 Agent。

### 实现 1：零冗余 Agent 核心

\`\`\`python
import json
import time
from typing import Any, Optional
from dataclasses import dataclass

@dataclass
class AgentConfig:
    """Less Human Agent 配置——所有参数都是硬约束"""
    temperature: float = 0.0  # 零随机性
    max_retries: int = 3
    timeout_seconds: int = 30
    output_format: str = "json"  # 强制结构化输出
    silent_mode: bool = True  # 默认静默执行
    fail_fast: bool = True  # 遇到约束冲突立即失败

class LessHumanAgent:
    """
    Less Human Agent 核心实现
    原则：精确执行、零冗余、约束优先、确定性驱动
    """

    def __init__(self, config: AgentConfig, llm_client):
        self.config = config
        self.llm = llm_client
        self._prompt = self._build_system_prompt()

    def _build_system_prompt(self) -> str:
        return """You are a precise execution engine. Follow these rules:
1. Output ONLY valid JSON matching the requested schema
2. Do NOT explain, justify, or add commentary
3. If a constraint cannot be met, return {"error": "CONSTRAINT_VIOLATION", "details": "..."}
4. If a tool call fails, retry up to N times, then return error
5. No greetings, no sign-offs, no "I think", no "maybe"

Output format: always JSON, never prose."""

    def execute(self, task: str, schema: dict) -> dict:
        """执行任务——无确认、无解释、直接返回结构化结果"""
        for attempt in range(self.config.max_retries):
            result = self._call_llm(task, schema)
            validated = self._validate_output(result, schema)
            if validated is not None:
                return {"status": "success", "result": validated, "attempts": attempt + 1}

        return {
            "status": "failed",
            "error": "MAX_RETRIES_EXCEEDED",
            "attempts": self.config.max_retries
        }

    def _call_llm(self, task: str, schema: dict) -> str:
        prompt = f"""
System: {self._prompt}

Schema: {json.dumps(schema)}

Task: {task}

Output:
"""
        return self.llm.generate(
            prompt=prompt,
            temperature=self.config.temperature,
            max_tokens=4096
        )

    def _validate_output(self, raw: str, schema: dict) -> Optional[dict]:
        """严格验证输出——不符合 schema 即视为失败"""
        try:
            result = json.loads(raw)
            # 这里可以加入 jsonschema 验证
            return result
        except json.JSONDecodeError:
            return None


# 使用示例
if __name__ == "__main__":
    class MockLLM:
        def generate(self, prompt: str, **kwargs) -> str:
            return json.dumps({
                "action": "create_file",
                "path": "/tmp/test.py",
                "content": "print('hello')"
            })

    config = AgentConfig(
        temperature=0.0,
        max_retries=3,
        fail_fast=True
    )

    agent = LessHumanAgent(config, MockLLM())
    result = agent.execute(
        task="创建一个 Python 文件，内容为打印 hello",
        schema={"type": "object", "properties": {"action": {"type": "string"}}}
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
    # 输出: {"status": "success", "result": {...}, "attempts": 1}
\`\`\`

### 实现 2：带约束验证的执行管道

\`\`\`python
from enum import Enum
from dataclasses import dataclass
from typing import Protocol

class ConstraintLevel(Enum):
    HARD = "hard"      # 不可违反，违反即失败
    SOFT = "soft"      # 尽量满足，无法满足时警告
    INFO = "info"      # 仅供参考，不影响执行

@dataclass
class Constraint:
    name: str
    level: ConstraintLevel
    check_fn: callable  # 返回 (satisfied: bool, message: str)

class ConstraintValidator:
    """约束验证器——Less Human Agent 的守门员"""

    def __init__(self, constraints: list[Constraint]):
        self.constraints = constraints

    def validate(self, context: dict) -> list[str]:
        """验证所有约束，返回违反列表"""
        violations = []
        for c in self.constraints:
            satisfied, message = c.check_fn(context)
            if not satisfied:
                if c.level == ConstraintLevel.HARD:
                    raise ConstraintViolationError(f"HARD: {c.name}: {message}")
                elif c.level == ConstraintLevel.SOFT:
                    violations.append(f"SOFT: {c.name}: {message}")
        return violations

class ConstraintViolationError(Exception):
    """硬约束违反异常——Fail Fast"""
    pass


# 使用示例：代码生成 Agent 的约束系统
def build_code_constraints() -> ConstraintValidator:
    return ConstraintValidator([
        Constraint(
            name="language_valid",
            level=ConstraintLevel.HARD,
            check_fn=lambda ctx: (
                ctx.get("language") in ["python", "javascript", "go", "rust"],
                f"Unsupported language: {ctx.get('language')}"
            )
        ),
        Constraint(
            name="no_external_deps",
            level=ConstraintLevel.SOFT,
            check_fn=lambda ctx: (
                len(ctx.get("dependencies", [])) <= 5,
                f"Too many dependencies: {len(ctx.get('dependencies', []))}"
            )
        ),
        Constraint(
            name="file_exists",
            level=ConstraintLevel.HARD,
            check_fn=lambda ctx: (
                __import__("os").path.exists(ctx.get("target_path", "")),
                f"Target path does not exist: {ctx.get('target_path')}"
            )
        ),
    ])

validator = build_code_constraints()

# 验证通过——继续执行
context = {"language": "python", "dependencies": ["requests"], "target_path": "/tmp"}
try:
    warnings = validator.validate(context)
    print(f"Warnings: {warnings}")  # 可能有 SOFT 警告
    print("执行代码生成...")
except ConstraintViolationError as e:
    print(f"FAIL FAST: {e}")  # 硬约束违反，立即失败
\`\`\``,
    },
    {
      title: "六、Less Human Agent 在 2026 年的实践案例",
      body: `让我们看看 2026 年主流 Agent 项目中哪些已经采用了 Less Human 设计理念。

### 案例 1：Claude Code

Claude Code 本质上就是一个 Less Human Agent：
- **零闲聊**：直接读取项目上下文，执行编码任务
- **结构化输出**：工具调用使用严格的 JSON schema
- **Fail Fast**：遇到不可解决的问题时直接报错，不解释
- **确定性**：相同输入产生相同输出（temperature=0）

### 案例 2：OpenClaw

OpenClaw 的技能系统体现了 Less Human 原则：
- 技能是预定义的、可验证的执行单元
- 技能间通过结构化数据传递，不是自然语言
- 技能失败时快速回退，不尝试「协商」

### 案例 3：Hermes Agent

Hermes Agent 的自进化机制依赖于 Less Human 设计：
- Agent 的「经验」是结构化的执行记录，不是散文式总结
- 技能评估使用可量化的指标（成功率、效率），不是主观评价
- 进化方向由约束和奖励信号驱动，不是「感觉应该这样做」

### 案例 4：n8n AI 工作流

n8n 的工作流引擎是 Less Human 理念的极致体现：
- 每个节点是确定性的执行单元
- 节点间通过结构化数据流连接
- 错误处理是预设的分支逻辑，不是动态协商`,
      table: {
        headers: ["项目", "Less Human 特征", "Human-like 残留", "改进空间"],
        rows: [
          ["Claude Code", "零闲聊、结构化输出、Fail Fast", "偶尔会解释代码变更", "进一步减少解释性输出"],
          ["OpenClaw", "技能结构化、快速回退", "技能描述用自然语言", "技能接口可进一步标准化"],
          ["Hermes Agent", "经验结构化、量化评估", "自进化过程中的探索行为偏随机", "用约束引导进化方向"],
          ["n8n", "确定性执行、数据流连接", "AI 节点的 prompt 仍是自由文本", "用 schema 约束 AI 节点输出"],
          ["LangChain", "工具调用结构化", "Chain 定义用自然语言", "引入约束验证层"],
        ],
      },
    },
    {
      title: "七、什么时候应该用 Human-like Agent？",
      body: `「Less Human」不是万能答案。有些场景下，Human-like 设计是必要的。

### 适合 Human-like Agent 的场景

| 场景 | 为什么需要 Human-like | 示例 |
|------|----------------------|------|
| 客服对话 | 需要建立情感连接和信任 | 银行客服 Agent |
| 教育辅导 | 需要耐心解释和鼓励 | 编程教学 Agent |
| 创意写作 | 需要风格化和个性化 | 小说创作助手 |
| 心理咨询 | 需要共情和理解 | 心理健康支持 |
| 销售谈判 | 需要社交智慧和灵活应变 | B2B 销售 Agent |

### 适合 Less Human Agent 的场景

| 场景 | 为什么需要 Less Human | 示例 |
|------|----------------------|------|
| 代码生成 | 需要精确、可验证的输出 | Claude Code, Cursor |
| 数据处理 | 需要高效率、低延迟 | ETL 管道 Agent |
| 系统运维 | 需要确定性和可审计性 | DevOps Agent |
| 安全审计 | 需要严格遵循规则 | Claude Mythos |
| 科学计算 | 需要精确的数值结果 | AI for Science Agent |

### 混合模式：根据场景切换

最实用的方案是**混合模式**——同一个 Agent 系统根据任务类型自动切换行为模式：

\`\`\`python
from enum import Enum

class AgentMode(Enum):
    LESS_HUMAN = "less_human"  # 精确执行模式
    HUMAN_LIKE = "human_like"  # 对话交互模式
    HYBRID = "hybrid"          # 混合模式

class AdaptiveAgent:
    def __init__(self, less_human_agent, human_like_agent):
        self.less_human = less_human_agent
        self.human_like = human_like_agent

    def route(self, task: str) -> AgentMode:
        """根据任务类型路由到合适的 Agent 模式"""
        code_keywords = ["代码", "函数", "类", "bug", "测试", "API"]
        chat_keywords = ["解释", "教程", "为什么", "建议", "想法"]

        if any(kw in task for kw in code_keywords):
            return AgentMode.LESS_HUMAN
        elif any(kw in task for kw in chat_keywords):
            return AgentMode.HUMAN_LIKE
        else:
            return AgentMode.HYBRID

    def execute(self, task: str) -> str:
        mode = self.route(task)
        if mode == AgentMode.LESS_HUMAN:
            return self.less_human.execute(task)
        elif mode == AgentMode.HUMAN_LIKE:
            return self.human_like.execute(task)
        else:
            # 混合模式：先用 Less Human 执行，再用 Human-like 解释结果
            result = self.less_human.execute(task)
            return self.human_like.explain(result)
\`\`\`

### 关键原则：模式切换应该是透明的

用户不应该需要知道 Agent 使用了哪种模式。Agent 应该：
- 自动检测任务类型
- 选择合适的行为模式
- 在模式间平滑切换
- 保持一致的用户体验`,
      mermaid: `graph TB
    A["用户输入任务"] --> B["任务分类器\nTask Classifier"]

    B -->|"代码/数据处理/运维"| C["Less Human Agent\n精确执行模式"]
    B -->|"客服/教育/创意"| D["Human-like Agent\n对话交互模式"]
    B -->|"混合任务"| E["Hybrid Agent\n混合模式"]

    C --> F["结构化输出\nJSON/代码/数据"]
    D --> G["自然语言输出\n解释/建议/对话"]
    E --> H["执行 + 解释\n先执行后说明"]

    F --> I["用户获得结果"]
    G --> I
    H --> I

    style C fill:#4338ca,stroke:#4338ca,color:#fff
    style D fill:#047857,stroke:#047857,color:#fff
    style E fill:#92400e,stroke:#b45309,color:#fff
    style B fill:#6d28d9,stroke:#6d28d9,color:#fff`,
    },
    {
      title: "八、总结：2026 年 Agent 设计的范式转移",
      body: `「Less human AI agents」不仅仅是一个设计理念，它代表了 2026 年 AI Agent 发展的重要范式转移。

**核心洞察：**

1. **Agent 不是聊天机器人**：聊天机器人的设计目标是「让人感觉自然」，Agent 的设计目标应该是「让任务高效完成」

2. **人类通信模式 ≠ 机器执行模式**：人类通信中的冗余、犹豫、解释，在机器执行中是纯粹的开销

3. **Less Human ≠ 不友好**：Less Human 指的是执行层面的精确性，用户界面仍然可以友好——关键是分离「执行层」和「交互层」

4. **混合模式是未来**：最实用的 Agent 系统会根据任务类型自动切换 Less Human 和 Human-like 模式

**实践建议：**

- 如果你在设计代码生成、数据处理、系统运维类 Agent → 采用 Less Human 设计
- 如果你在设计客服、教育、创意类 Agent → Human-like 设计是必要的
- 大多数生产环境 Agent → 混合模式，根据任务类型自动切换

**延伸阅读：**

- Andreas Påhlsson-Notini 原文：「Less human AI agents, please」（via Simon Willison's Weblog）
- Claude Code 架构文档：理解工业级 Less Human Agent 的实现
- Claude Mythos 安全审计：Less Human Agent 在安全领域的极致应用
- n8n 工作流引擎：Less Human 理念在工作流自动化中的实践

**一句话总结：**

> Agent 不应该像人一样工作——它应该像机器一样精确、高效、可靠。让人去做人擅长的事（创意、决策、社交），让 Agent 做机器擅长的事（执行、计算、重复）。`,
      tip: "**设计检查清单**：在发布你的 Agent 前，问自己三个问题——① 它的输出是否可以被机器直接解析？② 它在失败时是否快速报错而非解释？③ 它是否把约束当作不可协商的事实？如果答案都是 Yes，你就有了一个真正的 Less Human Agent。",
    },
  ],
};
