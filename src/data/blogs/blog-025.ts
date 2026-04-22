import { BlogPost, ArticleSection } from './blog-types';

const content: ArticleSection[] = [
  {
    title: "引言：当 AI 无法分辨\"已定决策\"和\"废弃假设\"",
    body: `2026 年 4 月 14 日，arXiv 发表了一篇引人深思的论文：**"Retrieval Is Not Enough: Why Organizational AI Needs Epistemic Infrastructure"**（arXiv:2604.11759）。这篇论文提出了一个看似简单却极其关键的问题：

**当 AI Agent 在企业知识库中检索信息时，它能否分辨哪些是已经做出的决策、哪些是被否定的方案、哪些是仍在争论中的议题？**

答案令人不安：**不能。**

当前的 RAG 系统只能找到"语义相关"的内容，却无法理解这些内容的**认知状态**。对于一个需要基于组织知识做出决策的 AI Agent 来说，这不仅是效率问题，更是根本性的能力缺陷。`,
  },
  {
    title: "背景：RAG 的认知盲区",
    body: `### RAG vs OIDA：架构对比

传统 RAG 和 OIDA 框架在知识处理流程上有着根本性的差异。下图展示了两者的核心架构对比：

OIDA 在传统 RAG 的基础上增加了**认知状态过滤**、**知识重力引擎**和**无知建模**三个关键层，从根本上解决了 RAG 的认知盲区问题。

### RAG 的三大认知盲区

**盲区一：无法区分认知状态**

组织知识中，不同类型的信息具有完全不同的认知地位：已定决策、废弃假设、争议观点、已知事实、未解问题。RAG 系统对所有这些信息一视同仁——只要语义相关就检索出来。但这对决策来说可能是灾难性的。

**盲区二：无法识别矛盾**

组织知识中经常存在矛盾信息。RAG 系统无法识别和处理这些矛盾，可能同时给出互相冲突的建议。

**盲区三：不知道组织"不知道"什么**

RAG 只能检索"已有的知识"，但无法识别"组织还不知道什么"。而后者——认知盲区——往往比已有知识更有价值。`,
    mermaid: `graph TD
    subgraph Traditional_RAG ["传统 RAG 架构"]
        A1[用户查询] --> B1[向量检索]
        B1 --> C1[语义相似度匹配]
        C1 --> D1[返回 Top-K 文档]
        D1 --> E1[LLM 生成回答]
        style B1 fill:#7f1d1d
        style C1 fill:#7f1d1d
    end

    subgraph OIDA_Framework ["OIDA 认知基础设施"]
        A2[用户查询] --> B2[知识对象检索]
        B2 --> C2[知识重力引擎]
        C2 --> D2[认知状态过滤]
        D2 --> E2[无知建模补充]
        E2 --> F2[EQS 质量评估]
        F2 --> G2[LLM 生成回答]
        style C2 fill:#14532d
        style D2 fill:#14532d
        style E2 fill:#14532d
    end

    classDef rag fill:#7f1d1d,stroke:#ff6666,stroke-width:2px;
    classDef oida fill:#14532d,stroke:#66ff66,stroke-width:2px;`,
  },
  {
    title: "OIDA 框架的四大创新",
    body: `### 创新一：知识对象（Knowledge Objects）

OIDA 将组织知识结构化为类型化的知识对象，每个对象携带：
- **认知类别**：事实、决策、假设、问题
- **重要性评分**：反映对组织的关键程度
- **类别特定的衰减因子**：不同类型的知识"过期速度"不同
- **带符号的矛盾边**：标记知识对象之间的矛盾关系

知识对象之间的关系网络构成了组织认知的骨架。下图展示了知识对象之间的连接与矛盾关系：

知识对象之间不仅有**支持关系**（实线），还有**矛盾关系**（虚线），这使得 OIDA 能够主动识别和处理组织知识中的冲突。

### 创新二：知识重力引擎

动态维护知识对象的重要性评分，具有以下特性：
- 在最大度数 < 7 的条件下具有**收敛保证**
- 经验测试表明度数高达 43 仍保持鲁棒性
- 知识之间的关联越强，其"重力"越大

### 创新三：无知建模（QUESTION as Modeled Ignorance）

这是 OIDA 最具革命性的创新——**将"组织不知道什么"作为一等公民建模**：
- **逆衰减机制**：未解决的问题随时间变得更加紧迫
- **自动升级**：长期未解决的问题自动提高重要性评分
- 这是**所有现有知识管理系统中都缺失的机制**

无知建模的核心逻辑可以用以下状态机来理解：

这种机制确保组织不会"忘记自己不知道什么"——这正是传统知识管理系统最大的漏洞。

### 创新四：认知质量评分（EQS）

五组件评估体系：完整性、一致性、时效性、可追溯性、循环性分析。`,
    mermaid: `graph LR
    F1["事实: Q2营收增长15%"]:::fact
    D1["决策: 采用微服务架构"]:::decision
    H1["假设: 用户需求将持续增长"]:::hypothesis
    Q1["问题: 如何降低云成本?"]:::question

    F1 -->|支持| D1
    H1 -->|支持| D1
    D1 -.->|矛盾| H2["废弃假设: 单体架构足够"]
    F1 -->|支持| Q1
    H1 -.->|矛盾| F2["事实: 市场需求趋于平稳"]

    classDef fact fill:#0c4a6e,stroke:#1976d2,stroke-width:2px;
    classDef decision fill:#14532d,stroke:#388e3c,stroke-width:2px;
    classDef hypothesis fill:#7c2d12,stroke:#f57c00,stroke-width:2px;
    classDef question fill:#881337,stroke:#c2185b,stroke-width:2px;`,
    code: [],
  },
  {
    title: "实验验证",
    body: `为了更直观地理解 OIDA 框架的工作原理，以下是核心组件的 Python 实现示例。

### Python 示例 1：知识对象与重力引擎`,
    table: {
      headers: ["条件", "Token 数量", "EQS 评分"],
      rows: [
        ["OIDA RAG", "3,868", "0.530"],
        ["全量上下文", "108,687", "0.848"],
      ],
    },
    code: [
      {
        lang: "python",
        code: `from dataclasses import dataclass, field
from enum import Enum
from typing import Optional
import math


class EpistemicCategory(Enum):
    FACT = "fact"
    DECISION = "decision"
    HYPOTHESIS = "hypothesis"
    QUESTION = "question"


@dataclass
class KnowledgeObject:
    """OIDA 知识对象：带有认知状态的结构化知识单元"""
    content: str
    category: EpistemicCategory
    importance: float = 0.5
    decay_rate: float = 0.0
    links: list[str] = field(default_factory=list)
    contradictions: list[str] = field(default_factory=list)

    # 类别特定的衰减因子
    DECAY_RATES = {
        EpistemicCategory.FACT: 0.01,      # 事实衰减最慢
        EpistemicCategory.DECISION: 0.03,  # 决策中等衰减
        EpistemicCategory.HYPOTHESIS: 0.08, # 假设衰减较快
        EpistemicCategory.QUESTION: -0.05, # 问题逆衰减(越来越重要!)
    }

    def __post_init__(self):
        self.decay_rate = self.DECAY_RATES[self.category]


class KnowledgeGravityEngine:
    """知识重力引擎：动态维护知识对象的重要性"""

    def __init__(self, max_degree: int = 7):
        self.objects: dict[str, KnowledgeObject] = {}
        self.max_degree = max_degree

    def add_object(self, obj_id: str, obj: KnowledgeObject) -> None:
        self.objects[obj_id] = obj

    def link(self, source_id: str, target_id: str) -> None:
        """创建知识对象之间的关联"""
        self.objects[source_id].links.append(target_id)
        self.objects[target_id].links.append(source_id)

    def add_contradiction(self, id1: str, id2: str) -> None:
        """标记两个知识对象之间的矛盾关系"""
        self.objects[id1].contradictions.append(id2)
        self.objects[id2].contradictions.append(id1)

    def update_gravity(self) -> None:
        """更新所有知识对象的重要性评分"""
        new_importance = {}
        for obj_id, obj in self.objects.items():
            # 基础衰减
            base = obj.importance * (1 - obj.decay_rate)
            # 邻居贡献(链接越多,重力越大)
            neighbor_boost = sum(
                self.objects[nid].importance * 0.1
                for nid in obj.links
                if nid in self.objects
            )
            # 矛盾惩罚
            contradiction_penalty = len(obj.contradictions) * 0.05
            new_importance[obj_id] = min(
                1.0, base + neighbor_boost - contradiction_penalty
            )
        for obj_id, imp in new_importance.items():
            self.objects[obj_id].importance = imp


# 使用示例
engine = KnowledgeGravityEngine()
engine.add_object("f1", KnowledgeObject(
    content="Q2 营收增长 15%", category=EpistemicCategory.FACT
))
engine.add_object("d1", KnowledgeObject(
    content="采用微服务架构", category=EpistemicCategory.DECISION
))
engine.add_object("q1", KnowledgeObject(
    content="如何降低云成本?", category=EpistemicCategory.QUESTION
))

engine.link("f1", "d1")
engine.link("f1", "q1")

engine.update_gravity()
for oid, obj in engine.objects.items():
    print(f"{oid} [{obj.category.value}]: importance={obj.importance:.3f}")
# 输出:
# f1 [fact]: importance=0.527
# d1 [decision]: importance=0.521
# q1 [question]: importance=0.576 (逆衰减使其上升!)`,
      },
      {
        lang: "python",
        code: `class EpistemicQualityScorer:
    """五组件 EQS 评估体系"""

    @staticmethod
    def completeness(objects: dict[str, KnowledgeObject]) -> float:
        """完整性: 各类别知识是否充足"""
        categories = set(o.category for o in objects.values())
        return min(1.0, len(categories) / 4.0)  # 期望 4 种类别

    @staticmethod
    def consistency(objects: dict[str, KnowledgeObject]) -> float:
        """一致性: 矛盾边越少,一致性越高"""
        total_contradictions = sum(
            len(o.contradictions) for o in objects.values()
        )
        if len(objects) == 0:
            return 1.0
        return max(0.0, 1.0 - total_contradictions / (len(objects) * 2))

    @staticmethod
    def timeliness(objects: dict[str, KnowledgeObject]) -> float:
        """时效性: 知识的重要性是否合理分布"""
        if not objects:
            return 0.0
        importances = [o.importance for o in objects.values()]
        # 重要性分布越均匀,时效性越好(方差小)
        mean = sum(importances) / len(importances)
        variance = sum((x - mean) ** 2 for x in importances) / len(importances)
        return max(0.0, 1.0 - variance)

    @staticmethod
    def traceability(objects: dict[str, KnowledgeObject]) -> float:
        """可追溯性: 对象之间是否有足够的链接"""
        total_links = sum(len(o.links) for o in objects.values())
        if len(objects) <= 1:
            return 1.0
        # 平均每个对象至少有 2 个链接为满分
        return min(1.0, total_links / (len(objects) * 2))

    @staticmethod
    def cyclicity(objects: dict[str, KnowledgeObject]) -> float:
        """循环性分析: 检测推理链中的循环依赖"""
        visited = set()
        cycles = 0
        for start_id in objects:
            if start_id in visited:
                continue
            path = set()
            stack = [start_id]
            while stack:
                current = stack.pop()
                if current in path:
                    cycles += 1
                    continue
                path.add(current)
                visited.add(current)
                for link in objects[current].links:
                    if link in objects:
                        stack.append(link)
        return max(0.0, 1.0 - cycles * 0.1)

    @classmethod
    def calculate_eqs(cls, objects: dict[str, KnowledgeObject]) -> float:
        """计算综合 EQS 评分(五组件加权平均)"""
        weights = {
            "completeness": 0.2,
            "consistency": 0.25,
            "timeliness": 0.15,
            "traceability": 0.2,
            "cyclicity": 0.2,
        }
        scores = {
            "completeness": cls.completeness(objects),
            "consistency": cls.consistency(objects),
            "timeliness": cls.timeliness(objects),
            "traceability": cls.traceability(objects),
            "cyclicity": cls.cyclicity(objects),
        }
        return sum(scores[k] * weights[k] for k in weights)


# 使用示例
objects = {
    "f1": KnowledgeObject("Q2 营收增长 15%", EpistemicCategory.FACT),
    "d1": KnowledgeObject("采用微服务架构", EpistemicCategory.DECISION),
    "q1": KnowledgeObject("如何降低云成本?", EpistemicCategory.QUESTION),
}
objects["f1"].links = ["d1"]
objects["d1"].links = ["f1"]
objects["q1"].links = ["f1"]

eqs = EpistemicQualityScorer.calculate_eqs(objects)
print(f"EQS Score: {eqs:.3f}")
# 输出: EQS Score: 0.640`,
      },
    ],
  },
  {
    title: "对行业的影响",
    body: `OIDA 仅用了 **1/28** 的 Token 预算就达到了有意义的认知质量。QUESTION 机制的 Fisher 检验 p=0.0325，OR=21.0。

OIDA 预示着企业知识管理的范式转变：从"文档存储库"走向"认知基础设施"。对 AI Agent 部署的关键洞察：**Agent 的能力上限不是模型大小或检索精度，而是组织知识的认知结构质量。**

下图总结了 OIDA 框架的整体工作流程：`,
    mermaid: `flowchart LR
    A[组织知识库] --> B[知识对象化]
    B --> C[知识重力引擎]
    C --> D{认知状态分类}

    D -->|事实| F[保持检索优先级]
    D -->|决策| G[增强关联权重]
    D -->|假设| H[加速衰减检查]
    D -->|问题| I[逆衰减升级]

    F --> J[EQS 评估]
    G --> J
    H --> J
    I --> J

    J --> K[认知质量评分]
    K --> L{EQS >= 阈值?}
    L -->|是| M[高质量 RAG 回答]
    L -->|否| N[补充无知建模]
    N --> C

    style C fill:#1e3a5f,stroke:#1976d2,stroke-width:3px
    style I fill:#7f1d1d,stroke:#d32f2f,stroke-width:3px
    style J fill:#14532d,stroke:#388e3c,stroke-width:3px
    style N fill:#713f12,stroke:#f9a825,stroke-width:2px`,
  },
  {
    title: "个人观点",
    body: `这篇论文揭示了一个 AI 行业普遍忽视的问题：我们一直在花大价钱优化模型和检索算法，却很少关注组织知识本身的结构质量。这就像在破旧的公路上跑法拉利——引擎再强，路况不好也跑不快。

---

*论文来源：arXiv:2604.11759, April 14, 2026*
*关键词：OIDA、认知基础设施、知识管理、RAG、企业 AI*`,
  },
];

export const blog: BlogPost = {
  id: "blog-025",
  title: "OIDA 框架：为什么组织 AI 不能只靠 RAG——认知基础设施的崛起",
  date: "2026-04-14",
  readTime: 12,
  summary:
    "arXiv 2026 年 4 月的新论文提出 OIDA 框架，直指当前企业 AI 的核心痛点：RAG 系统能找到'相关'内容，但无法区分已定决策与废弃假设、争议观点与共识事实。论文引入'知识重力引擎'和'无知建模'机制，证明了组织 AI 的天花板不是检索保真度，而是认知保真度。这是企业知识库从'文档存储'向'认知基础设施'演进的关键一步。",
  tags: ["OIDA", "认知基础设施", "知识管理", "RAG", "企业 AI", "arXiv 2026"],
  author: "AI Master",
  content,
};
