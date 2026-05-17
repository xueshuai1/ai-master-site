import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-guide",
    title: "深度学习核心技术学习导览",
    category: "dl",
    tags: ["深度学习", "学习导览", "神经网络", "CNN", "RNN"],
    summary: "掌握深度学习三大方向：神经网络基础、CNN 计算机视觉、RNN 序列模型。理解 Transformer 架构，这是大语言模型的基础。",
    date: "2026-04-16",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 什么是深度学习？",
            body: `机器学习靠"特征工程"（人工提取特征），深度学习靠"端到端学习"（从原始数据直接学）。

2012 年 AlexNet 在图像识别比赛中大获全胜，深度学习从此崛起。今天，几乎所有 AI 突破都来自深度学习。`
        },
        {
            title: "1. 学习全景图",
            body: `深度学习分为四个方向：

神经网络基础— 感知机、多层网络、反向传播、激活函数、优化器

CNN（计算机视觉）— 卷积、池化、ResNet

RNN / 序列模型— RNN、LSTM、注意力机制

Transformer — Self-Attention、编码器（LLM 的基石）`
        },
        {
            title: "2. 学习建议",
            body: `重点投入时间：
- 神经网络基础（反向传播是核心）
- Transformer 架构（LLM 的基石）

可以略过的：
- CNN 的具体架构细节（知道思想就行）
- RNN 的数学推导（知道 LSTM 解决什么问题就行）

> 2026 年最重要的部分：Transformer。 它是 GPT、Claude、Gemini 的共同基础。`,
            tip: "💡 用 PyTorch 搭建一个简单的神经网络，亲手跑一次训练流程，比看十篇教程都管用。"
        },
        {
            title: "3. 📍 推荐学习路径",
            body: `本分类共 21 篇文章，以下是我们推荐的系统性学习路径：

第一阶段：神经网络基础（5 篇）

1. [神经网络基础：从感知机到多层网络](/article/dl-001)（dl-001）→ 理解神经网络的基本结构
2. [神经网络基础：前向传播、反向传播与激活函数](/article/dl-019)（dl-019）→ 掌握核心机制
3. [反向传播：神经网络如何学习](/article/dl-002)（dl-002）→ 深度理解梯度传播
4. [CNN：卷积神经网络架构详解](/article/dl-006)（dl-006）→ 了解卷积思想
5. [CNN 卷积神经网络：从 LeNet 到 ResNet](/article/dl-020)（dl-020）→ CNN 架构演进

第二阶段：核心进阶（选读 8 篇）

- 🔥 核心必读：[注意力机制与 Transformer 架构](/article/dl-004)（dl-004）、[优化器：SGD, Momentum, Adam, AdamW](/article/dl-007)（dl-007）、[正则化：BatchNorm, LayerNorm, Dropout](/article/dl-009)（dl-009）
- 深入理解：[损失函数大全](/article/dl-008)（dl-008）、[初始化策略](/article/dl-010)（dl-010）、[迁移学习：预训练 + 微调范式](/article/dl-015)（dl-015）
- 拓展阅读：[RNN 与 LSTM](/article/dl-003)（dl-003）、[GAN 生成对抗网络](/article/dl-005)（dl-005）

第三阶段：高级专题（按需选读）

- [Mixture of Experts MoE](/article/dl-017)（dl-017）、[分布式训练](/article/dl-016)（dl-016）、[图神经网络 GNN](/article/dl-013)（dl-013）、[神经架构搜索 NAS](/article/dl-014)（dl-014）

> ⚡ 速成建议： 第一阶段 + 第二阶段的核心必读 = 深度学习的核心知识。其余可以在实践中按需补学。`,
            table: {
                headers: ["阶段", "文章数", "预计时间", "目标"],
                rows: [
                    ["第一阶段：神经网络基础", "5 篇", "1 周", "理解神经网络基本原理，能搭建简单网络"],
                    ["第二阶段：核心进阶", "8 篇（选读）", "2-3 周", "掌握 Transformer、优化器、正则化等核心知识"],
                    ["第三阶段：高级专题", "6 篇（按需）", "按需", "MoE、分布式训练等前沿技术"],
                ]
            }
        },
        {
            title: "深度学习技术全景",
            mermaid: `graph TD
    A["深度学习"] --> B["神经网络基础"]
    A --> C["CNN 计算机视觉"]
    A --> D["RNN 序列模型"]
    A --> E["Transformer"]
    B --> B1["感知机 & MLP"]
    B --> B2["反向传播"]
    B --> B3["激活函数"]
    C --> C1["卷积 & 池化"]
    C --> C2["ResNet"]
    D --> D1["LSTM"]
    D --> D2["注意力机制"]
    E --> E1["Self-Attention"]
    E --> E2["LLM 基石"]
    
    style A fill:#991b1b,color:#fff
    style B fill:#1e3a5f,color:#fff
    style C fill:#1e3a5f,color:#fff
    style D fill:#1e3a5f,color:#fff
    style E fill:#7c3aed,color:#fff
    style B1 fill:#374151,color:#fff
    style B2 fill:#374151,color:#fff
    style B3 fill:#374151,color:#fff
    style C1 fill:#374151,color:#fff
    style C2 fill:#374151,color:#fff
    style D1 fill:#374151,color:#fff
    style D2 fill:#374151,color:#fff
    style E1 fill:#374151,color:#fff
    style E2 fill:#374151,color:#fff`,
        },
        {
            title: "学习路线图",
            mermaid: `graph LR
    A["dl-guide
学习导览"] --> B["dl-001
神经网络基础"]
    B --> C["dl-019
前向/反向传播"]
    C --> D["dl-002
反向传播"]
    D --> E["dl-006
CNN"]
    E --> F["dl-020
CNN 演进"]
    F --> G["dl-004
Transformer"]
    G --> H["进阶阶段
选读核心"]
    
    style A fill:#991b1b,color:#fff
    style B fill:#1e3a5f,color:#fff
    style C fill:#1e3a5f,color:#fff
    style D fill:#1e3a5f,color:#fff
    style E fill:#1e3a5f,color:#fff
    style F fill:#1e3a5f,color:#fff
    style G fill:#7c3aed,color:#fff
    style H fill:#7c3aed,color:#fff`,
        },
    ]
};
