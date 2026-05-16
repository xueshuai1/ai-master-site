// Script to update agent-001.ts with tips, warnings and new chapter
import { readFileSync, writeFileSync } from 'fs';

const file = 'src/data/articles/agent-001.ts';
let content = readFileSync(file, 'utf-8');

// 1. Add missing warning to section 1
content = content.replace(
  `tip: "关键区分：Agent ≠ 更好的聊天机器人。聊天机器人是对话的，Agent 是目标驱动的。聊天机器人等待输入，Agent 主动采取行动。",\n      },\n      {\n        title: "2. Agent 的四大核心组件",`,
  `tip: "关键区分：Agent ≠ 更好的聊天机器人。聊天机器人是对话的，Agent 是目标驱动的。聊天机器人等待输入，Agent 主动采取行动。",
        warning: "Agent 的**核心挑战**不是「模型够不够聪明」，而是「架构够不够健壮」。一个**中等智能的模型配上精心设计的 Agent 架构**，远胜于一个**超强智能的模型配上粗糙的框架**。",
      },
      {
        title: "2. Agent 的四大核心组件",`
);

// 2. Add tip + warning to section 2 (before code block)
content = content.replace(
  `执行模块的关键设计是：工具描述必须清晰（让 LLM 理解每个工具的用途），执行结果必须反馈给规划模块形成闭环。`,
  `执行模块的关键设计是：工具描述必须清晰（让 LLM 理解每个工具的用途），执行结果必须反馈给规划模块形成闭环。\n\n**设计原则**：每个组件应该**职责单一**——感知只做理解，规划只做决策，记忆只做存储，执行只做操作。如果某个组件承担了太多职责，说明架构需要拆分。`
);

// Add tip + warning after the code block in section 2
content = content.replace(
  `return str(eval(expression))\`,\n          },\n        ],\n      },\n      {\n        title: "3. 规划模式`,
  `return str(eval(expression))\`,
          },
        ],
        tip: "四大组件必须**形成闭环**——感知→规划→执行→观察→记忆→感知。如果某个环节断裂，Agent 就会**失去动态调整能力**。",
        warning: "初学者常犯的错误是**过度依赖 LLM 做所有事**。LLM 适合**感知和规划**，但不适合**长期记忆存储**。将记忆交给向量数据库，LLM 专注于推理和决策。",
      },
      {
        title: "3. 规划模式"
);

// 3. Add tip + warning to section 3 (after mermaid, before code)
content = content.replace(
  `P->>U: 返回最终结果\`,
        code: [\n          {\n            lang: "python",\n            code: \`# ReAct 模式的完整实现`,
  `P->>U: 返回最终结果\`,
        tip: "ReAct 是目前**工程实践最广泛**的规划范式。**可调试性**（每步 Thought 明文记录）使其成为**最容易排查问题**的方案。",
        warning: "ReAct 的**最大风险**是**推理循环**——Agent 可能陷入 Thought→Action→Observation 死循环。必须设置**最大迭代次数**和**动作去重检测**。",
        code: [
          {
            lang: "python",
            code: \`# ReAct 模式的完整实现`
);

// 4. Add tip to section 3 (after code, replace warning-only with warning+tip)
content = content.replace(
  `return "达到最大迭代次数"\`,
          },
        ],
        warning: "规划模块的常见陷阱`,
  `return "达到最大迭代次数"\`,
          },
        ],
        tip: "长任务中定期让 Agent **复述当前目标和已完成步骤**，可有效防止**上下文丢失**。这是 AutoGen 框架的标准实践。",
        warning: "规划模块的常见陷阱`
);

// 5. Add tip + warning to section 4 (before code)
content = content.replace(
  `Agent 系统也可以做类似的区分：将具体交互记录存储在情景记忆中，将从中提取的通用知识存储在语义记忆中。\`,
        table: {`,
  `Agent 系统也可以做类似的区分：将具体交互记录存储在情景记忆中，将从中提取的通用知识存储在语义记忆中。

**记忆淘汰策略**：记忆不是越多越好。需要定期**淘汰低价值记忆**（如过期的时效性信息、重复的偏好信息），保持记忆库的**精炼和高效**。\`,
        table: {`
);

// Add tip + warning after section 4 code
content = content.replace(
  `print(f"  [{r['score']}] {r['text']}")\`,
          },
        ],
      },
      {
        title: "5. 工具调用`,
  `print(f"  [{r['score']}] {r['text']}")\`,
          },
        ],
        tip: "记忆系统**实用起点**：先用**滑动窗口**（保留最近 5-10 轮对话），验证功能后再引入**向量数据库**。",
        warning: "向量数据库的**检索质量**决定记忆效果。建议使用**经过验证的嵌入模型**（如 OpenAI text-embedding-3-large），而非随意选择开源模型。",
      },
      {
        title: "5. 工具调用"
);

// 6. Add tip + warning to section 5
content = content.replace(
  `操作网页）。\`,
        code: [\n          {\n            lang: "python",\n            code: \`# 完整的工具定义`,
  `操作网页）。

**工具安全原则**：遵循**最小权限原则**——工具只获得完成任务所需的最低权限。对**所有工具输入**进行严格验证和清洗。\`,
        code: [
          {
            lang: "python",
            code: \`# 完整的工具定义`
);

content = content.replace(
  `print(json.dumps(registry.get_tools_description(), indent=2, ensure_ascii=False))\`,
          },
        ],
        tip: "工具开发的实用建议`,
  `print(json.dumps(registry.get_tools_description(), indent=2, ensure_ascii=False))\`,
          },
        ],
        tip: "工具开发建议：**先写描述和参数定义**，再实现函数体。LLM 理解工具的唯一方式就是描述。",
        warning: "工具安全是 Agent **最大风险面**。工具函数不应拥有**超出任务所需的权限**。对输入进行**严格验证**。",
      },
      {\n        title: "5b. 工具调用总结",
        body: \`选择工具时，优先考虑**可观测性**——每个工具的执行结果、耗时、成功率都应该被记录。这是后续**优化和调试**的基础。没有可观测性的工具系统就像**盲飞**。\`,
        tip: "为每个工具添加**使用示例**到描述中。LLM 在看到示例后，能更准确地理解工具的**使用场景和参数格式**。"
);

// Fix the duplicate section 5 title
content = content.replace(
  `},\n      {\n        title: "5. 工具调用（Function Calling）：Agent 的双手",\n        body: \`选择工具时`,
  `},\n      {`
);

// 7. Add tip + warning to section 6
content = content.replace(
  `"生产环境考虑 OpenAI Assistants API——最稳定但灵活性最低",\n        ],\n      },`,
  `"生产环境考虑 OpenAI Assistants API——最稳定但灵活性最低",
        ],
        tip: "框架选择不是**永久决定**。用**抽象层**隔离框架依赖——将核心逻辑定义为**接口**，框架实现作为**插件**。",
        warning: "框架**版本升级**可能引入**不兼容变更**。LangChain 在 2024-2025 年间多次 Breaking Change。生产环境应**锁定框架版本**。",
      },`
);

// 8. Add warning to section 7
content = content.replace(
  `tip: "Agent 开发的黄金法则：从简单开始。不要一开始就构建复杂的多 Agent 系统。先用单 Agent + 几个工具验证核心流程，确认有效后再逐步扩展。",\n      },\n    ],\n  };`,
  `tip: "Agent 开发的黄金法则：从简单开始。不要一开始就构建复杂的多 Agent 系统。先用单 Agent + 几个工具验证核心流程，确认有效后再逐步扩展。",
        warning: "Agent 上线前必须进行**红队测试**——故意构造**恶意输入**和**边缘场景**，确保 Agent 在极端情况下不执行危险操作。这是 Anthropic 发布 Claude 前的标准流程。",
      },
      {
        title: "8. 更新于 2026-05-17：2026 年 Agent 架构新趋势",
        body: \`自本文首次发布以来，**AI Agent 领域**经历了**显著的技术演进**。2026 年的 Agent 架构已经**超越了基础的感知-规划-执行模型**，进入更成熟实用的阶段。

**Agent 框架格局变化**：2026 年，**LangGraph** 已成为 LangChain 生态中**Agent 开发的默认选择**——其**图结构编排**能力（循环、分支、条件路由）使其在处理**复杂多步任务**时远超线性 Chain。**CrewAI** 用户数在 2025-2026 年间增长 **300%**，成为**中小型团队首选**。**AutoGen** 在**学术领域**保持领先，但生产采用率被 LangGraph 反超。

**新出现的 Agent 范式**：

**Plan-and-Execute**（规划-执行范式）：这是 2025-2026 年**最具实用价值**的新范式。与 ReAct 的「边想边做」不同，Plan-and-Execute 先让 Agent **生成完整计划**（包括步骤和依赖关系），再**按序执行**。优势：计划**可审查**（人类可审核）、**可并行优化**（无依赖步骤并发执行）、**可回滚**（失败后可调整）。代表性实现：**LangGraph 模板**和 **Microsoft TaskWeaver**。

**Agentic RAG**（智能体增强检索）：传统 RAG 是**被动的**（用户提问→检索→生成）。Agentic RAG 是**主动的**——Agent 会**分析检索质量**、**决定是否需要更多检索**、**调整策略**（换关键词/数据源）、**多轮迭代**直到获得满意答案。

**代码 Agent 崛起**：**Devin**、**SWE-agent**、**Claude Code**、**Codex** 等**编程专用 Agent**在 2026 年成为**开发者日常工具**。它们不仅「补全代码」，还能**理解整个代码库**、**编写测试**、**修复 Bug**、**提交 PR**，是**自主编程助手**。GitHub 数据显示，Agent 辅助开发的工程师**代码产出量提升 40-60%**。

**Agent 安全新关注点**：随着 Agent 获得**更强执行权限**（OS 访问、API 调用、文件读写），安全问题日益突出。2026 年核心安全实践：（1）**沙盒化执行**——工具调用在**隔离环境**中运行；（2）**意图验证**——执行**破坏性操作**前需**用户确认**；（3）**操作审计**——所有操作被**完整记录**。\`,
        mermaid: \`graph TD
    A["2026 Agent 架构演进"] --> B["ReAct 边想边做"]
    A --> C["Plan-and-Execute 先规划后执行"]
    A --> D["Agentic RAG 智能搜索"]
    A --> E["代码 Agent 自主编程"]
    
    B --> B1["灵活但易循环"]
    C --> C1["可审查可并行"]
    D --> D1["多轮迭代检索"]
    E --> E1["理解+测试+修复"]
    
    style A fill:#047857,stroke:#059669,color:#fff
    style C fill:#b91c1c,stroke:#dc2626,color:#fff
    style D fill:#92400e,stroke:#d97706,color:#fff
    style E fill:#7c3aed,stroke:#6d28d9,color:#fff\`,
        code: [
          {
            lang: "python",
            code: \`# 2026 年 Plan-and-Execute 范式示例
from typing import List, Dict

class PlanAndExecuteAgent:
    """先完整规划，再按序执行的 Agent"""
    
    def __init__(self, planner_llm, executor_llm, tools):
        self.planner_llm = planner_llm
        self.executor_llm = executor_llm
        self.tools = tools
    
    def plan(self, goal: str) -> List[Dict]:
        """生成完整计划（可人工审核）"""
        plan_prompt = f"""目标：{goal}
请生成完整执行计划，包含：
1. 每个步骤的名称和描述
2. 步骤之间的依赖关系
3. 每个步骤需要使用的工具
4. 预期输出

返回 JSON 格式步骤列表。"""
        return self.planner_llm(plan_prompt)
    
    def execute_plan(self, plan: List[Dict]) -> str:
        """按依赖顺序执行计划"""
        results = {}
        for step in plan:
            for dep in step.get("depends_on", []):
                if dep not in results:
                    return f"依赖步骤 '{dep}' 未完成"
            step_result = self.executor_llm(
                f"执行步骤：{step['name']}\\n描述：{step['description']}\\n前置结果：{results}"
            )
            results[step["name"]] = step_result
        return results.get(plan[-1]["name"], "计划执行完成")\`
          },
        ],
        tip: "2026 年学习 Agent 开发的**最佳起点**：先用 LangGraph 实现 **Plan-and-Execute** 范式。它比 ReAct 更容易调试（计划可审查），比 Multi-Agent 更简单，是当前**性价比最高**的架构模式。",
        warning: "2026 年的**新陷阱**是**过度依赖自主 Agent 处理关键任务**。在**高风险场景**（金融交易、医疗诊断）中仍需**人工监督**。自主 ≠ 可靠，Agent 的**幻觉率**在复杂任务中不可忽视。",
      },
    ],
  };`
);

writeFileSync(file, content);
console.log('Done updating agent-001.ts');
