import { Article } from '../knowledge';

export const article: Article = {
    id: "security-guide",
    title: "AI 安全与隐私学习导览",
    category: "ethics",
    tags: ["AI 安全", "学习导览", "隐私保护", "对抗攻击"],
    summary: "守护 AI 世界的安全底线。从算法偏见到差分隐私，从对抗攻击到模型可解释性，系统学习 AI 伦理与安全防护技术。",
    date: "2026-04-16",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 为什么 AI 需要安全？",
            body: `AI 正在做决定：谁能获得贷款、谁能被录取、谁该被逮捕。

如果 AI 有偏见呢？如果 AI 被攻击呢？如果 AI 泄露隐私呢？

AI 安全不是"有了再说"的事——它必须是设计时就考虑的。`
        },
        {
            title: "1. 三大安全维度",
            body: `AI 安全分为三大维度：

公平性与伦理— 偏见检测、公平性度量、SHAP/LIME 可解释性

隐私保护— 差分隐私、联邦学习、安全多方计算

对抗安全— 对抗样本、模型逆向、对抗训练、输入消毒`
        },
        {
            title: "2. 学习建议",
            body: `所有开发者都应该学的：
- AI 偏见与公平性
- 模型可解释性

安全专业方向：
- 对抗攻击与防御
- 隐私保护 ML`,
            tip: "💡 用 SHAP 分析一个贷款审批模型，看看 AI 到底在依据什么做决定——结果可能让你大吃一惊。"
        },
        {
            title: "架构图示 1",
            mermaid: `graph LR
    A["安全基础<br/>威胁模型"] --> B["对抗安全<br/>攻击与防御"]
    B --> C["对齐安全<br/>RLHF/红队"]
    C --> D["隐私安全<br/>差分隐私"]
    D --> E["实战项目<br/>安全评估"]
    
    style B fill:#1e3a5f,stroke:#2563eb,color:#fff
    style C fill:#1e3a5f,stroke:#2563eb,color:#fff`,
        },
        {
            title: "架构图示 2",
            mermaid: `graph TD
    subgraph "AI 安全三大维度"
        S1["对抗安全<br/>对抗样本/防御"]
        S2["对齐安全<br/>价值观对齐/红队"]
        S3["隐私安全<br/>数据保护/联邦学习"]
    end
    
    subgraph "工具链"
        T1["对抗攻击库<br/>ART/Foolbox"]
        T2["红队框架<br/>Garak/PyRIT"]
        T3["隐私工具<br/>差分隐私"]
    end
    
    S1 -.-> T1
    S2 -.-> T2
    S3 -.-> T3
    
    style S1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style S2 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style S3 fill:#b91c1c,stroke:#dc2626,color:#fff`,
        },
    ]
};
