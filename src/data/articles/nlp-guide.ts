import { Article } from '../knowledge';

export const article: Article = {
    id: "nlp-guide",
    title: "自然语言处理学习导览",
    category: "nlp",
    tags: ["NLP","学习导览","词嵌入","BERT"],
    summary: "让机器理解和生成人类语言。从词嵌入、文本分类到 BERT 微调，理解 ChatGPT 背后 20 年的技术演进。",
    date: "2026-04-16",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 为什么学 NLP？",
            body: `ChatGPT、Claude、文心一言——这些产品的核心技术都来自 NLP。

但 NLP 不只是聊天机器人。它还包括：
- 情感分析（这条评论是好评还是差评？）
- 命名实体识别（这段话里提到了哪些公司、人名？）
- 机器翻译（中英文互译）
- 文本摘要（把长文压缩成三句话）`,
        },
        {
            title: "1. 技术演进",
            body: `规则方法（1990s） → 统计方法（2000s） → 深度学习方法（2010s） → 预训练模型（2018至今）

| 时代 | 代表技术 | 特点 |
|------|----------|------|
| 2013 | Word2Vec | 词向量，第一次让机器"理解"词义 |
| 2017 | Transformer | 注意力机制，NLP 范式转变 |
| 2018 | BERT | 预训练+微调，11 项任务 SOTA |
| 2020 | GPT-3 | 1750 亿参数，few-shot 学习 |
| 2026 | LLM Agent | 对话、编程、工具调用一体化 |`,
        },
        {
            title: "2. 学习建议",
            body: `重点：
- 词嵌入（Word2Vec → BERT 的演进）
- Transformer 架构
- BERT 微调实战

2026 年的 NLP ≈ 大语言模型应用。 所以学完 NLP 基础后，直接跳到 LLM 章节。`,
            tip: "💡 用 Hugging Face 的 pipeline 跑一个情感分析，5 行代码，感受一下 NLP 的力量。",
        },
        {
            title: "架构图示 1",
            mermaid: `graph LR
    A["基础理论<br/>2-3周"] --> B["传统 NLP<br/>n-gram+CRF"]
    B --> C["深度学习<br/>BERT+GPT"]
    C --> D["大模型时代<br/>指令微调+RAG"]
    D --> E["实战项目<br/>2-3周"]
    
    style C fill:#1e3a5f,stroke:#2563eb,color:#fff
    style D fill:#b91c1c,stroke:#dc2626,color:#fff`,
        },
        {
            title: "架构图示 2",
            mermaid: `graph TD
    subgraph "NLP 技术演进"
        N1["规则时代<br/>正则/语法树"] --> N2["统计时代<br/>n-gram/CRF"]
        N2 --> N3["深度学习<br/>Word2Vec/LSTM"]
        N3 --> N4["Transformer<br/>BERT/GPT"]
        N4 --> N5["大模型时代<br/>指令微调/Agent"]
    end
    
    subgraph "核心任务"
        T1["文本分类"]
        T2["命名实体识别"]
        T3["机器翻译"]
        T4["文本生成"]
        T5["问答系统"]
    end
    
    N2 --> T1
    N2 --> T2
    N3 --> T3
    N4 --> T4
    N5 --> T5
    
    style N4 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style N5 fill:#b91c1c,stroke:#dc2626,color:#fff`,
        },
    ]
};
