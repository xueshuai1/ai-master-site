// DSPy 2.x 全面指南：从 Prompt Engineering 到 Programmatic LLM 编程的范式转移

import { Article } from '../knowledge';

export const article: Article = {
  id: "dspy-001",
  title: "DSPy 2.x 全面指南：用 Python 编程替代 Prompt Engineering，让 LLM 自动优化自己的提示词",
  category: "aieng",
  tags: ["DSPy", "Stanford", "LLM 编程", "Prompt 优化", "自动化", "RAG", "Few-shot", "签名编程", "2026 前沿"],
  summary: "DSPy（DSP for You）是斯坦福大学提出的 LLM 编程框架，正在改变我们与 LLM 交互的方式。它不让你写 prompt，而是让你用 Python 签名（Signature）声明输入输出，然后自动编译（Compile）出最优的 prompt。本文从核心理念、架构原理、Python 实战到与 LangChain/LangGraph 的全面对比，带你掌握这一范式转移。",
  date: "2026-04-26",
  readTime: "45 min",
  level: "进阶",
  content: [
    {
      title: "一、为什么需要 DSPy？Prompt Engineering 的根本性缺陷",
      body: `在 2026 年的 AI 工程中，Prompt Engineering 仍然是大多数 LLM 应用的核心开发方式。但这种方法存在几个根本性缺陷：

### 1. 手动调优不可扩展
每个 prompt 都需要反复试验：改措辞、调整示例顺序、测试边界情况。当系统有 10 个以上 prompt 时，维护成本呈指数级增长。

### 2. 脆弱且难以调试
一个词的改动可能让输出质量从 90% 暴跌到 30%。当 prompt 失效时，很难定位是格式问题、示例选择问题还是模型本身的变化。

### 3. 无法自动适应模型变化
当从 GPT-4 切换到 Claude Opus，或从 OpenAI 切换到本地部署的 Llama 时，所有 prompt 需要重新调优。

### 4. 无法利用数据驱动的优化
人类写 prompt 是基于直觉，而不是基于对大量输入输出数据的统计分析。

**DSPy 的核心洞察**：与其让开发者手动写 prompt，不如让开发者声明「我想让 LLM 做什么」（Signature），然后由框架自动编译出最优的 prompt。

### Prompt Engineering vs DSPy 编程范式对比

| 维度 | Prompt Engineering | DSPy 编程范式 |
|------|-------------------|--------------|
| 开发方式 | 手写 prompt 文本 | 声明 Signature（输入→输出类型） |
| 优化方式 | 人工反复试验 | 自动编译优化 |
| 示例选择 | 人工挑选 few-shot 示例 | 自动从训练数据中选择最优示例 |
| 模型切换 | 需要重新调优 prompt | 重新编译即可 |
| 可维护性 | prompt 散落在代码各处 | 统一的模块化管理 |
| 可复现性 | 低（依赖个人经验） | 高（确定性编译流程） |

### DSPy 工作流程

\`\`\`mermaid
graph LR
    A["定义 Signature\\n输入→输出类型声明"] --> B["组装 Module/Program\\n组合多个 Signature"]
    B --> C["准备训练数据\\n输入 + 期望输出"]
    C --> D["选择 Optimizer\\nBootstrapFewShot / MIPRO / COPRO"]
    D --> E["编译 Compile\\n自动优化 prompt + 示例"]
    E --> F["部署运行\\nevaluate + iterate"]
    F -.-> C
`,
    },
    {
      title: "二、DSPy 核心概念：Signature、Module、Optimizer",
      body: `DSPy 的编程模型围绕三个核心概念构建：

### 2.1 Signature：声明式接口

Signature 是 DSPy 的核心抽象，它声明了任务的输入和输出类型，而不是具体的 prompt 文本：

\`\`\`python
import dspy

class GenerateAnswer(dspy.Signature):
    """根据上下文回答问题。如果上下文不足以回答，请说明不确定性。"""
    context = dspy.InputField(desc="相关文档片段")
    question = dspy.InputField(desc="用户的问题")
    answer = dspy.OutputField(desc="简洁准确的回答")
    confidence = dspy.OutputField(desc="对回答的置信度，0-1 之间")
`,
      tip: "Signature 的关键：用清晰的自然语言描述任务目标，但不要写具体 prompt。让 Optimizer 决定如何最好地表达这个任务。"
    },
    {
      title: "三、Module 与 Program 构建",
      body: `Module 是 DSPy 中的可组合组件，类似于 PyTorch 中的 nn.Module。

\`\`\`python
import dspy

llm = dspy.LM('openai/gpt-4o', api_key='your-key')
dspy.configure(lm=llm)

class RAGAnswer(dspy.Module):
    def __init__(self, passages_per_hop=3):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=passages_per_hop)
        self.generate = dspy.Predict(GenerateAnswer)
    
    def forward(self, question):
        context = self.retrieve(question).passages
        prediction = self.generate(
            context=context,
            question=question
        )
        return prediction

rag = RAGAnswer()
result = rag("DSPy 相比 LangChain 有什么优势？")
print(result.answer)
print(f"置信度: {result.confidence}")
`,
    },
    {
      title: "四、自动编译：DSPy 的杀手级特性",
      body: `DSPy 最强大的功能是 **自动编译（Auto-Compilation）**。你不需要手写 few-shot 示例或优化 prompt 格式——框架会基于训练数据自动完成。

### 4.1 Optimizer 类型对比

| Optimizer | 原理 | 适用场景 | 计算成本 | 效果提升 |
|-----------|------|---------|---------|---------|
| BootstrapFewShot | 从训练数据中自动生成 few-shot 示例 | 简单任务、快速原型 | 低 | 10-20% |
| COPRO | 优化 prompt 指令文本 | 需要精确输出格式 | 中 | 15-25% |
| MIPRO v2 | 同时优化 prompt 和示例，使用 bandit 搜索 | 复杂任务、追求极致效果 | 高 | 20-40% |
| MIPRO v2 (zero-shot) | 无需训练数据，仅优化 prompt 文本 | 没有标注数据时 | 中 | 10-20% |
| KNNFewShot | 基于 KNN 从训练数据中选择最相关示例 | 检索增强场景 | 低 | 15-25% |

### 4.2 编译实战

\`\`\`python
import dspy
from dspy.teleprompt import BootstrapFewShot

class RAGAnswer(dspy.Module):
    def __init__(self, passages_per_hop=3):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=passages_per_hop)
        self.generate = dspy.Predict(GenerateAnswer)
    
    def forward(self, question):
        context = self.retrieve(question).passages
        return self.generate(context=context, question=question)

# 创建基线系统
rag = RAGAnswer()

# 评估基线
def validate_answer(example, pred, trace=None):
    keywords = set(example.answer.lower().split())
    pred_words = set(pred.answer.lower().split())
    overlap = len(keywords & pred_words) / max(len(keywords), 1)
    return overlap > 0.3

# 编译优化
optimizer = BootstrapFewShot(
    metric=validate_answer,
    max_bootstrapped_demos=4,
    max_labeled_demos=8,
    max_rounds=3
)

compiled_rag = optimizer.compile(
    student=rag,
    teacher=rag,
    trainset=train_data[:50]
)

# 保存编译结果
compiled_rag.save('compiled_rag.json')
`,
      warning: "编译过程会消耗 LLM API 调用。建议在开发阶段使用较小的 trainset（10-50 条），确定流程后再用完整数据集编译。"
    },
    {
      title: "五、MIPRO v2 深度解析",
      body: `MIPRO v2（Mixed Integer Programming with PRopagation Optimization）是 DSPy 最强大的优化器。

### MIPRO v2 工作原理

\`\`\`mermaid
sequenceDiagram
    participant D as 开发者
    participant O as MIPROv2 Optimizer
    participant L as LLM API
    participant E as Evaluator
    
    D->>O: 提供 Module + trainset + metric
    O->>O: 采样 prompt 候选方案
    loop 每轮迭代 (bandit search)
        O->>L: 用候选 prompt 运行 trainset
        L-->>O: 获取输出
        O->>E: 评估输出质量
        E-->>O: 返回 metric 分数
        O->>O: 更新 bandit 权重
    end
    O->>O: 选择最优 prompt + 示例组合
    O-->>D: 返回编译后的 Module
`,
    },
    {
      title: "六、实战：构建智能客服系统",
      body: `让我们用一个完整的案例来展示 DSPy 的威力。

\`\`\`python
import dspy
from typing import Literal

class IntentClassifier(dspy.Signature):
    """判断用户消息的意图类别"""
    message = dspy.InputField(desc="用户消息")
    history = dspy.InputField(desc="最近 3 条对话历史", format=lambda x: "\\n".join(x))
    intent = dspy.OutputField(desc=f"意图类别: {Literal['咨询', '投诉', '建议', '求助', '闲聊']}")
    urgency = dspy.OutputField(desc=f"紧急程度: {Literal['低', '中', '高', '紧急']}")

class KnowledgeRetriever(dspy.Signature):
    """从知识库中检索相关信息"""
    query = dspy.InputField(desc="检索查询")
    intent = dspy.InputField(desc="用户意图")
    results = dspy.OutputField(desc="最相关的 3 条知识条目")

class ResponseGenerator(dspy.Signature):
    """生成客服回复"""
    message = dspy.InputField(desc="用户原始消息")
    intent = dspy.InputField(desc="分类的意图")
    knowledge = dspy.InputField(desc="检索到的知识")
    user_profile = dspy.InputField(desc="用户画像")
    reply = dspy.OutputField(desc="友好、专业的客服回复")
    follow_up = dspy.OutputField(desc="建议的跟进操作")

class CustomerServiceAgent(dspy.Module):
    def __init__(self):
        super().__init__()
        self.classify = dspy.Predict(IntentClassifier)
        self.retrieve = dspy.Predict(KnowledgeRetriever)
        self.generate = dspy.Predict(ResponseGenerator)
    
    def forward(self, message, history=None, user_profile=None):
        history = history or []
        user_profile = user_profile or "普通会员"
        
        intent_result = self.classify(
            message=message,
            history=history[-3:] if len(history) >= 3 else history
        )
        
        knowledge = self.retrieve(
            query=message,
            intent=intent_result.intent
        )
        
        reply = self.generate(
            message=message,
            intent=intent_result.intent,
            knowledge=knowledge.results,
            user_profile=user_profile
        )
        
        return dspy.Prediction(
            intent=intent_result.intent,
            urgency=intent_result.urgency,
            reply=reply.reply,
            follow_up=reply.follow_up
        )
`,
    },
    {
      title: "七、DSPy vs LangChain/LangGraph 全面对比",
      body: `很多开发者会问：「我已经在用 LangChain 了，为什么还要学 DSPy？」

### 定位差异

| 维度 | DSPy | LangChain | LangGraph |
|------|------|-----------|-----------|
| 核心理念 | 自动优化 LLM prompt | 组合 LLM 调用的工具链 | 有状态的 Agent 图 |
| 编程范式 | 声明式（Signature） | 命令式（Chain） | 状态机图 |
| Prompt 管理 | 自动编译 | 手动编写模板 | 手动编写 |
| 学习曲线 | 中等（新概念） | 较低 | 中等 |
| 适合场景 | RAG、分类、提取 | 工具链、工作流 | 多轮 Agent 交互 |
| 模型无关性 | 极高（换模型重新编译） | 高 | 高 |
| 生态成熟度 | 发展中 | 成熟 | 成熟 |

### 混合使用：最佳实践

\`\`\`python
from langgraph.graph import StateGraph
import dspy
from langchain_core.tools import tool

# DSPy 编译的核心能力
rag_module = dspy.compile(RAGAnswer(), trainset=rag_data)

# LangChain 封装为工具
@tool
def smart_search(query: str) -> str:
    return rag_module(query).answer

# LangGraph 编排 Agent 流程
graph = StateGraph(AgentState)
graph.add_node("search", smart_search)
graph.add_node("generate", llm_call)
graph.add_edge("search", "generate")
`,
    },
    {
      title: "八、DSPy 2.x 新特性（2026 年更新）",
      body: `DSPy 在 2026 年持续迭代，2.x 版本带来了多项重要改进：

### 核心新特性

| 特性 | 说明 | 价值 |
|------|------|------|
| MIPRO v2 | 新一代优化器，支持 zero-shot 优化 | 无需训练数据即可优化 |
| 多 LM 支持 | 原生支持 Anthropic Claude、Gemini、本地部署模型 | 不再绑定 OpenAI |
| 异步执行 | 支持 async/await | 高并发场景性能提升 |
| 更好的可观测性 | 内置 tracing 和调试 | 更容易理解编译过程 |
| DSPy Assert | 编译时约束验证 | 确保输出符合预期格式 |
| 模块化评估 | 可组合的 metric 系统 | 更灵活的评估体系 |

### DSPy Assert 示例

\`\`\`python
import dspy

class SafeAnswer(dspy.Signature):
    question = dspy.InputField()
    answer = dspy.OutputField()

@dspy.assert_output
def validate_safe_answer(output):
    harmful_keywords = ["我不能说", "不确定", "不知道"]
    return not any(kw in output.answer for kw in harmful_keywords)

optimizer = BootstrapFewShot(
    metric=validate_safe_answer,
    max_bootstrapped_demos=4
)
`,
    },
    {
      title: "九、总结与学习路线",
      body: `### 为什么 DSPy 值得学？

1. **范式转移**：从「手写 prompt」到「声明式编程」，代表了 LLM 开发的未来方向
2. **斯坦福出品**：学术严谨，持续更新，论文引用量快速增长
3. **实际效果**：在多个基准测试中，DSPy 编译后的 prompt 质量超过人类工程师手写的 prompt
4. **模型无关**：换模型不需要重写 prompt，只需重新编译
5. **与现有生态兼容**：可以和 LangChain、LangGraph 混合使用

### 学习路线

\`\`\`mermaid
graph TD
    A["理解 DSPy 核心理念"] --> B["学会定义 Signature"]
    B --> C["构建简单 Module"]
    C --> D["使用 BootstrapFewShot 编译"]
    D --> E["评估和调优"]
    E --> F["掌握 MIPRO v2"]
    F --> G["构建复杂 Program"]
    G --> H["集成到生产环境"]
    H --> I["持续监控和再编译"]
`,
      tip: "建议从 DSPy 官方教程开始（https://dspy.ai），先用他们的 Colab notebook 体验基本流程，再应用到自己的项目中。",
    },
    {
      title: "十、参考资源",
      body: `- **官方文档**：https://dspy.ai
- **GitHub 仓库**：https://github.com/stanfordnlp/dspy
- **学术论文**：「DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines」（ICLR 2024）
- **斯坦福课程**：CS 224U - Natural Language Understanding
- **社区**：DSPy Discord 社区活跃，有大量教程和示例
- **对比研究**：2025-2026 年多篇论文比较 DSPy 与传统 prompt engineering 的效果，一致显示 DSPy 在结构化任务上优势明显`,
    },
  ],
};
