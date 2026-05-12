import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-guide",
    title: "LLM 大语言模型学习导览",
    category: "llm",
    tags: ["LLM", "学习导览", "Transformer", "预训练", "微调"],
    summary: "全面掌握大语言模型的核心知识：从 Transformer 架构、预训练流程，到 SFT、RLHF 微调和推理部署。这是从 Prompt Engineering 到 AI Agent 的关键桥梁。",
    date: "2026-05-11",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 为什么学 LLM？",
            body: `2022 年底 ChatGPT 发布后，大语言模型彻底改变了我们与 AI 交互的方式。

LLM 不只是聊天工具— 它是 AI 应用的核心引擎。掌握 LLM 原理，你才能：
- 理解模型的「能力边界」（能做什么，不能做什么）
- 高效微调模型适配你的业务场景
- 搭建 **RAG** 系统让模型使用私有知识
- 开发 AI Agent 让模型自主行动

**前提**： 建议先学完深度学习基础（神经网络、Transformer）。`
        },
        {
            title: "1. 学习全景图",
            body: `LLM 学习分为四个层次：

基础原理 → **Transformer** 架构、Attention 机制、位置编码
预训练 → 数据准备、分布式训练、训练稳定性
对齐与微调 → **SFT**、**RLHF**、LoRA、QLoRA
应用与部署 → **RAG**、Agent、量化部署、推理优化

我们按「先懂原理 → 再会微调 → 最后能部署」的顺序展开。`
        },
        {
            title: "2. 推荐学习路径",
            body: `**第一阶段**：基础原理
→ 从「大语言模型训练全流程」开始，了解 LLM 从数据到成型的完整过程

**第二阶段**：预训练实战
→ 学习数据管线怎么构建、分布式训练怎么跑、训练崩溃了怎么救

**第三阶段**：微调与对齐
→ 掌握 LoRA/QLoRA 高效微调、**RLHF** 对齐技术、**DPO** 直接偏好优化

**第四阶段**：应用与部署
→ 学习 **RAG** 检索增强、推理加速、量化部署`
        },
        {
            title: "3. 前置知识",
            body: `**必须掌握**：
- 神经网络基础（前向传播、反向传播）
- **Transformer** 架构（Self-Attention、Multi-Head Attention）
- Python 编程

**有帮助但非必须**：
- 分布式训练基础
- 信息论基础（交叉熵、KL 散度）`
        },
        {
            title: "4. 学习建议",
            body: `不要一上来就搞预训练— 先理解 **Transformer** 架构，再学微调技术，最后才碰预训练。

动手优先— 用 **HuggingFace** **Transformer**s 跑通一个微调 demo，比读十篇论文有用。

关注开源生态— **vLLM**、llama.cpp、Axolotl 等工具让 LLM 开发门槛大幅降低。`,
            mermaid: `sequenceDiagram
    participant D as 数据准备
    participant T as 预训练
    participant F as 微调对齐
    participant P as 部署应用
    D->>T: 清洗语料
    T->>F: 基础模型
    F->>P: 微调模型
    P-->>D: 反馈数据优化`
        },
        {
            title: "5. 知识体系架构",
            body: `LLM 的知识体系可以分为四层，从底层原理到上层应用层层递进。`,
            mermaid: `graph TD
    A[基础原理] --> B[预训练技术]
    B --> C[微调与对齐]
    C --> D[应用与部署]
    A1[Transformer] -.-> A
    A2[Attention] -.-> A
    B1[数据管线] -.-> B
    B2[分布式训练] -.-> B
    C1[SFT 微调] -.-> C
    C2[RLHF 对齐] -.-> C
    D1[RAG 增强] -.-> D
    D2[量化部署] -.-> D
    style A fill:#991b1b,color:#fff
    style B fill:#1e3a5f,color:#fff
    style C fill:#064e3b,color:#fff
    style D fill:#581c87,color:#fff`
        }
    ],
    learningPath: {
        routeId: "foundation",
        phase: 6,
        order: 1,
        nextStep: "llm-001",
        prevStep: null
    }
};
