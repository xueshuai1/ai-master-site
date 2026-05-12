import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-app-guide",
    title: "LLM 应用开发学习导览",
    category: "llm",
    tags: ["LLM", "学习导览", "RAG", "API", "应用开发"],
    summary: "学会用大语言模型构建实际应用。从 API 调用到 RAG 系统搭建，再到微调实战，这是从 Prompt Engineering 到 AI Agent 的关键桥梁。",
    date: "2026-04-16",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 为什么学 LLM 应用？",
            body: `如果你已经掌握了 Prompt Engineering（和 AI 对话），下一步就是让 AI 变成你应用的一部分。

这不是学术研究——这是实实在在的开发技能。2026 年，会调用 LLM API、搭建 **RAG** 系统、微调模型的开发者，薪资溢价 30%+。

**前提**： 不需要深度学习背景，只需要会写代码 + 懂 Prompt。`
        },
        {
            title: "1. 学什么？",
            body: `LLM 应用开发的四个核心模块：

**模块 1**：LLM 原理 — Token 机制、上下文窗口、温度参数

**模块 2**：API 调用 — OpenAI API、成本估算和优化

**模块 3**：RAG 系统 — 向量数据库、Embedding、检索+生成

**模块 4**：微调实战 — LoRA / QLoRA、开源模型适配`
        },
        {
            title: "2. 学习顺序建议",
            body: `**推荐路线**：

1. LLM 原理入门（1 天）— 了解 Token、上下文窗口、温度参数
2. API 调用实战（1 天）— 用 API 完成第一个 AI 应用
3. **RAG** 系统搭建（2-3 天）— 构建基于私有知识的问答系统
4. Fine-tuning 实战（2-3 天）— 用 LoRA 微调开源模型

每个模块学完做什么？
- 模块 1 → 用 API 写一个聊天机器人
- 模块 2 → 做一个代码审查助手
- 模块 3 → 搭建公司知识库问答系统
- 模块 4 → 微调一个特定风格的写作助手`
        },
        {
            title: "3. 常见误区",
            body: `| 误区 | 真相 |
|------|------|
| "必须训练自己的模型" | 99% 的场景用 API + Prompt 就够了 |
| "**RAG** 很难" | 用 **LangChain** 搭建 **RAG** 只需要 50 行代码 |
| "微调需要大量数据" | LoRA 微调只需要几百条高质量数据 |

**> 核心原则**：先跑起来，再优化。 先用 API 完成 MVP，发现性能瓶颈后再考虑 RAG 或微调。`,
            tip: "💡 推荐先用 OpenAI 或 Anthropic 的 API 跑通第一个应用，再深入 RAG 和微调。"
        },
        {
            title: "4. 📍 推荐学习路径",
            body: `本分类共 31 篇文章，以下是推荐的系统性学习路径：

**第一阶段**：LLM 应用基础（选读 5 篇）

1. [LLM Token 经济学](/article/token-economics-001) → 理解 Token、上下文窗口、成本
2. [**RAG** 检索增强生成架构指南](/article/llm-003) → 搭建私有知识问答系统
3. [**LangChain**：LLM 应用开发框架](/article/llm-011) → 快速原型开发
4. [LLM 部署实践：**vLLM**, TGI, **Ollama**](/article/llm-012) → 生产环境部署
5. [LLM 微调技术全景](/article/llm-017) → LoRA、QLoRA 参数高效微调

**第二阶段**：深入理解（选读核心）

- [LLM 推理加速实战](/article/llm-015) → KV Cache 优化、推测解码
- [LLM 评测体系](/article/llm-014) → 从 **MMLU** 到 LMSYS Arena
- [LLM 生产环境可观测性](/article/llm-020) → 监控与调试
- [**Anthropic** **Claude** 生态系统](/article/anthropic-claude) → **Claude** 全家桶

**第三阶段**：高级专题（按需选读）

- [大语言模型训练全流程](/article/llm-001)、[**RLHF**](/article/llm-005)、[MoE 架构](/article/llm-013)

**> ⚡ 速成建议**： 第一阶段 5 篇 = LLM 应用开发核心知识。学完即可独立搭建 AI 应用。`,
            table: {
                headers: ["阶段", "文章数", "预计时间", "目标"],
                rows: [
                    ["第一阶段：应用基础", "5 篇", "1-2 周", "能用 API + RAG 搭建完整 AI 应用"],
                    ["第二阶段：深入理解", "选读 4-6 篇", "1-2 周", "掌握推理优化、评测、部署"],
                    ["第三阶段：高级专题", "按需选读", "按需", "理解训练、RLHF、MoE 等底层原理"],
                ]
            }
        },
        {
            title: "学习路线图",
            mermaid: `graph LR
    A["llm-app-guide
学习导览"] --> B["token-economics
Token 经济学"]
    B --> C["llm-003
RAG 架构"]
    C --> D["llm-011
LangChain"]
    D --> E["llm-012
部署实践"]
    E --> F["llm-017
微调技术"]
    F --> G["进阶阶段
选读核心"]
    
    style A fill:#991b1b,color:#fff
    style B fill:#1e3a5f,color:#fff
    style C fill:#1e3a5f,color:#fff
    style D fill:#1e3a5f,color:#fff
    style E fill:#1e3a5f,color:#fff
    style F fill:#1e3a5f,color:#fff
    style G fill:#7c3aed,color:#fff`,
        },
        {
            title: "LLM 应用架构",
            mermaid: `graph TD
    A["用户请求"] --> B["API 调用层"]
    B --> C["Prompt 工程"]
    B --> D["RAG 检索层"]
    D --> D1["向量数据库"]
    D --> D2["Embedding 模型"]
    B --> E["微调模型层"]
    E --> E1["LoRA / QLoRA"]
    
    style A fill:#991b1b,color:#fff
    style B fill:#1e3a5f,color:#fff
    style C fill:#1d4ed8,color:#fff
    style D fill:#7c3aed,color:#fff
    style E fill:#b45309,color:#fff`,
        },
    ]
};
