import { Article } from '../knowledge';

export const article: Article = {
    id: "math-ml-guide",
    title: "入门基础学习导览：数学与机器学习",
    category: "ml",
    tags: ["数学", "机器学习", "学习导览", "入门"],
    summary: "AI 学习的起点。从线性代数、概率论到回归、分类、聚类，打下扎实的 AI 基础。不必成为数学专家，但要理解核心概念。",
    date: "2026-04-16",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 为什么从基础开始？",
            body: `AI 不是魔法。它底层是数学和统计学。

你不需要成为数学天才，但你需要理解：
- 线性代数 — 向量、矩阵，是所有 ML 模型的"语言"
- 概率论 — 不确定性、贝叶斯，是 AI 做决策的基础
- 微积分 — 梯度、导数，是模型"学习"的机制

好消息是：你只需要理解概念，不需要手推公式。`
        },
        {
            title: "1. 学习全景图",
            body: `AI 基础学习分为三个层次：

数学基础
- 线性代数 → 向量、矩阵
- 概率论 → 分布、贝叶斯
- 微积分 → 导数、梯度

ML 基础
- 监督学习 → 回归、分类
- 无监督学习 → 聚类、降维

进阶内容
- 决策树、SVM、随机森林
- 特征工程、XGBoost`
        },
        {
            title: "2. 学习建议",
            body: `不要一上来就啃数学书！ 正确姿势：

1. 先学 ML 概念— 了解"模型是什么"、"怎么训练"
2. 遇到不懂的数学— 回头补对应概念
3. 用代码验证— 用 scikit-learn 跑一个分类项目

> 推荐项目： 用 scikit-learn 完成鸢尾花分类或房价预测。这是你的第一个 ML 项目。`
        },
        {
            title: "3. 前置要求",
            body: `| 前置 | 需要程度 | 说明 |
|------|----------|------|
| Python | 基础 | 会写函数、循环、列表 |
| 高中数学 | 复习 | 函数、方程、基本统计 |
| 线性代数 | 概念 | 不需要手算，理解即可 |

如果编程基础为零，建议先花一周学 Python 基础。`,
            tip: "💡 速成路线的学习者可以跳过数学部分，直接学 Prompt → LLM 应用 → Agent。等需要深入时再回来补基础。"
        },
        {
            title: "4. 📍 推荐学习路径",
            body: `本分类共 25 篇文章，以下是我们推荐的系统性学习路径，按阶段分，每阶段内按顺序阅读：

第一阶段：ML 基础入门（8 篇）

1. [机器学习基础：从线性模型到决策树](/article/ml-001)（ml-001）→ 理解 ML 是什么
2. [偏差-方差权衡：过拟合与欠拟合](/article/ml-018)（ml-018）→ 理解模型训练的核心矛盾
3. [模型评估与选择：交叉验证、AUC-ROC](/article/ml-017)（ml-017）→ 学会评估模型好坏
4. [决策树与随机森林实战](/article/ml-002)（ml-002）→ 第一个实用的 ML 算法
5. [随机森林：Bagging 与特征重要性](/article/ml-006)（ml-006）→ 深入理解集成学习
6. [KNN：K 近邻算法](/article/ml-012)（ml-012）→ 最简单的分类算法
7. [朴素贝叶斯：概率分类器](/article/ml-004)（ml-004）→ 基于概率的分类方法
8. [K-Means：无监督聚类基础](/article/ml-008)（ml-008）→ 第一个无监督算法

第二阶段：ML 进阶（15 篇，选读核心）

- 核心必读：[SVM 支持向量机详解](/article/ml-003)（ml-003）、[XGBoost 原理与调参指南](/article/ml-005)（ml-005）、[特征工程：数据预处理与特征选择](/article/ml-016)（ml-016）
- 深入理解：[集成学习：Bagging, Boosting, Stacking](/article/ml-013)（ml-013）、[正则化技术：L1, L2, Dropout](/article/ml-019)（ml-019）
- 专项技能：[PCA：主成分分析降维](/article/ml-010)（ml-010）、[超参数调优](/article/ml-021)（ml-021）、[类别不平衡处理](/article/ml-022)（ml-022）

> ⚡ 速成建议： 如果目标是快速上手 AI 应用，学完第一阶段即可进入深度学习。进阶阶段可以在实践中按需补学。`,
            table: {
                headers: ["阶段", "文章数", "预计时间", "目标"],
                rows: [
                    ["第一阶段：基础入门", "8 篇", "1-2 周", "理解 ML 核心概念，能跑通第一个项目"],
                    ["第二阶段：进阶提升", "15 篇（选读）", "2-4 周", "掌握经典算法，能针对问题选择合适模型"],
                ]
            }
        },
        {
            title: "AI 基础知识体系",
            mermaid: `graph TD
    A["AI 基础"] --> B["数学基础"]
    A --> C["ML 基础"]
    A --> D["进阶内容"]
    B --> B1["线性代数"]
    B --> B2["概率论"]
    B --> B3["微积分"]
    C --> C1["监督学习"]
    C --> C2["无监督学习"]
    D --> D1["决策树/SVM"]
    D --> D2["特征工程"]
    D --> D3["XGBoost"]
    
    style A fill:#991b1b,color:#fff
    style B fill:#1e3a5f,color:#fff
    style C fill:#1e3a5f,color:#fff
    style D fill:#7c3aed,color:#fff
    style B1 fill:#374151,color:#fff
    style B2 fill:#374151,color:#fff
    style B3 fill:#374151,color:#fff
    style C1 fill:#374151,color:#fff
    style C2 fill:#374151,color:#fff
    style D1 fill:#374151,color:#fff
    style D2 fill:#374151,color:#fff
    style D3 fill:#374151,color:#fff`,
        },
        {
            title: "学习路线图",
            mermaid: `graph LR
    A["math-ml-guide
学习导览"] --> B["ml-001
ML 基础"]
    B --> C["ml-018
偏差-方差"]
    C --> D["ml-017
模型评估"]
    D --> E["ml-002
决策树"]
    E --> F["ml-006
随机森林"]
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
    ]
};
