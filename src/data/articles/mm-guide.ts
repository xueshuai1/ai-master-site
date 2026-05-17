import { Article } from '../knowledge';

export const article: Article = {
    id: "mm-guide",
    title: "多模态学习导览",
    category: "multimodal",
    tags: ["多模态", "学习导览", "CLIP", "视觉语言"],
    summary: "让 AI 同时理解文本、图像、音频、视频。从 CLIP 图文对齐到视觉语言模型，掌握跨模态 AI 的核心技术。",
    date: "2026-04-16",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 什么是多模态？",
            body: `GPT 只能处理文字。CLIP 能同时理解文字和图片。GPT-4V 能看图说话。Gemini 能理解文本、图像、音频、视频。

**多模态 = AI 的"五感"**。 单一的文本理解只是视觉的一个角落。`
        },
        {
            title: "1. 核心技术",
            body: `多模态学习的核心技术：

CLIP（图文对齐）— 对比学习、零样本分类

视觉语言模型— Flamingo、BLIP、Qwen-VL

视频理解— 时序建模、动作识别

多模态 Agent— 看图编程、视觉问答`
        },
        {
            title: "2. 学习建议",
            body: `前置要求： 学过 CNN、NLP 基础

**重点： CLIP 的对比学习思想——这是所有多模态模型的基础**。`,
            tip: "💡 用 CLIP 做一个零样本分类器：不训练任何模型，就能对新类别做分类。"
        },
        {
            title: "架构图示 1",
            mermaid: `graph LR
    A["数学基础<br/>概率+线代"] --> B["深度学习<br/>PyTorch"]
    B --> C["视觉+NLP 基础<br/>CNN+Transformer"]
    C --> D["多模态学习<br/>CLIP+BLIP"]
    D --> E["实战项目<br/>多模态应用"]
    
    style C fill:#1e3a5f,stroke:#2563eb,color:#fff
    style D fill:#1e3a5f,stroke:#2563eb,color:#fff`,
        },
        {
            title: "架构图示 2",
            mermaid: `graph TD
    subgraph "多模态技术全景"
        V1["视觉理解<br/>分类/检测/分割"]
        L1["语言理解<br/>NLP/翻译/摘要"]
        A1["音频理解<br/>语音识别"]
    end
    
    V1 --> M1["视觉-语言融合<br/>CLIP/BLIP"]
    L1 --> M1
    A1 --> M2["音频-文本融合<br/>Whisper"]
    M1 --> F1["多模态大模型<br/>GPT-4o/Gemini"]
    M2 --> F1
    
    subgraph "多模态生成"
        G1["文本→图像<br/>DALL·E/SD"]
        G2["文本→视频<br/>Sora/Veo"]
        G3["文本→音频<br/>TTS/Suno"]
    end
    
    F1 --> G1
    F1 --> G2
    F1 --> G3
    
    style M1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style F1 fill:#b91c1c,stroke:#dc2626,color:#fff`,
        },
    ]
};
