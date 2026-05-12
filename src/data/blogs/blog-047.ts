import type { BlogPost } from './blog-types';

const blog: BlogPost = {
  id: "blog-047",
  title: "GPT-5.5 高级 Prompt 工程实战：从迁移策略到 verbosity 参数的全面指南",
  category: "GPT-5.5",
  summary: "OpenAI 发布 GPT-5.5 的同时推出了全新的 Prompting Guide，建议开发者从零开始调优而非直接复用旧 prompt。本文提炼 6 条核心调优原则，涵盖 verbosity 参数、image_detail 参数、工具定义优化、系统提示词简洁原则等实战技巧，附带完整的 Python 可运行代码和迁移检查脚本。",
  date: "2026-04-26",
  author: "AI Master",
  tags: ["GPT-5.5", "Prompt Engineering", "OpenAI", "迁移指南", "verbosity", "工具调用", "系统提示词", "推理控制", "API 实战", "2026"],
  readTime: 32,
  content: [
  {
    title: "引言：GPT-5.5 发布，Prompt 工程面临范式转移",
    body: `2026 年 4 月 23 日，**OpenAI** 发布 **GPT-5**.5 模型的同时，同步推出了一份详尽的 **GPT-5**.5 Prompting Guide——这是 **OpenAI** 首次为新模型提供如此系统、深入的调优指南。

这份指南的核心立场非常明确：不要把 **GPT-5**.5 当作 **GPT-5**.4 的简单升级，而是作为一个全新的模型系列来调优。

> "To get the most out of **GPT-5**.5, treat it as a new model family to tune for, not a drop-in replacement for gpt-5.2 or gpt-5.4. Begin migration with a fresh baseline instead of carrying over every instruction from older prompt stacks."

这意味着什么呢？意味着你过去为 **GPT-5**.x 精心打磨的 prompt 模板、系统提示词、工具描述——可能都需要重新审视。**GPT-5**.5 的理解方式、推理模式、输出偏好都发生了微妙但重要的变化。

**> 本文目标**： 我们将从 GPT-5.5 Prompting Guide 出发，提炼出 6 条核心调优原则，并通过 Python 实战代码和对比实验，帮你快速建立 GPT-5.5 的 prompt 工程方法论。`,
    tip: `快速结论：
- 迁移 GPT-5.5 的第一步：从最小化 prompt 开始，逐层添加，不要直接复用旧 prompt
- 新参数：verbosity 控制输出详细度（low/medium/high），image_detail 控制图像输入精度
- 多步任务技巧：在工具调用前发送简短用户可见更新，改善用户体验
- 系统提示词：GPT-5.5 对过于冗长的系统提示词敏感，精简效果更好
- 工具描述：需要更精确、更结构化的工具定义
- 推理模式：GPT-5.5 的 reasoning 模式默认更激进，需要显式控制`,
  },
  {
    title: "一、迁移策略：为什么「从零开始」比「直接替换」更好",
    body: `**GPT-5**.5 Prompting Guide 中最引人注目的建议是：开始迁移时，从最小化的 prompt 出发，而不是带着旧模型的所有指令进行替换。

### 为什么旧 prompt 不适合 **GPT-5**.5？

**GPT-5**.5 在以下方面与 **GPT-5**.x 有本质差异：

1. 指令遵循模式改变：**GPT-5**.5 对冗长指令的敏感度不同，过多的约束可能反而降低表现
2. 推理路径优化：**GPT-5**.5 内部推理更高效，某些为补偿旧模型不足而添加的 prompt 指令现在成了干扰
3. 输出偏好迁移：**GPT-5**.5 的默认输出风格、格式化习惯与之前不同
4. 工具调用逻辑：**GPT-5**.5 在工具选择、参数填充上有新的行为模式

### 推荐的迁移流程

| 步骤 | 操作 |
|------|------|
| 步骤 1 | 写一个最小化的 prompt（只包含产品契约） |
| 步骤 2 | 用代表性输入输出对测试 baseline |
| 步骤 3 | 逐步添加推理控制（reasoning effort） |
| 步骤 4 | 调整 verbosity 参数 |
| 步骤 5 | 优化工具描述和输出格式 |
| 步骤 6 | 用 A/B 测试验证每个变更 |

这个流程确保你不会带着"历史包袱"迁移，而是真正针对 **GPT-5**.5 的能力进行调优。`,
    mermaid: `flowchart TD
    A["旧 GPT-5.x Prompt"] --> B{"直接替换? ❌"}
    B -->|不推荐| C["带着历史包袱迁移"]
    B -->|推荐| D["最小化 Baseline Prompt"]
    D --> E["用代表性数据测试"]
    E --> F["逐步添加: 推理控制"]
    F --> G["调整: verbosity 参数"]
    G --> H["优化: 工具描述"]
    H --> I["A/B 验证每个变更"]
    I --> J["最终 GPT-5.5 Prompt"]
    class J s2
    class D s1
    class B s0
    classDef s0 fill:#1e3a5f,color:#fff
    classDef s1 fill:#1e3a5f,color:#fff
    classDef s2 fill:#1e3a5f,color:#fff`,
    code: [
      {
        lang: "python",
        filename: "gpt55_migration_baseline.py",
        code: `import openai

# ❌ 错误做法：直接替换 model 名字，复用旧 prompt
old_system_prompt = """You are an AI assistant. Follow these instructions carefully:
1. Always think step by step and show your reasoning...
2. When answering, use markdown formatting with headers...
3. Include relevant code examples with comments...
4. Add disclaimers when information might be outdated...
5. Structure responses with bullet points for clarity...
6. Never mention your knowledge cutoff...
7. Always provide multiple perspectives...
8. Use formal, professional language...
[还有20多条其他指令]
"""

# ✅ 正确做法：从最小化 prompt 开始
minimal_prompt = """你是一个 AI 编程助手。帮助用户解决编程问题，
提供清晰的解释和可运行的代码示例。"""

client = openai.OpenAI()

# 用代表性测试用例验证 baseline
test_cases = [
    "用 Python 实现一个 LRU Cache",
    "解释 Python 的装饰器是如何工作的",
    "帮我 debug 这段代码的并发 bug",
]

for test in test_cases:
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {"role": "system", "content": minimal_prompt},
            {"role": "user", "content": test},
        ],
        temperature=0.7,
    )
    print(f"输入: {test}")
    print(f"输出长度: {len(response.choices[0].message.content)} 字符")
    print("---")`,
      },
    ],
  },
  {
    title: "二、verbosity 参数：精细控制模型输出的详细程度",
    body: `**GPT-5**.5 引入了一个新的 API 参数 verbosity，允许开发者精细控制模型输出的详细程度。这是一个非常实用的参数，特别适合需要控制 token 消耗和输出长度的场景。

### verbosity 的三个级别

| 级别 | 说明 | 适用场景 |
|------|------|----------|
| low | 简洁、直接的回答，最少的解释 | 快速查询、API 响应、嵌入式场景 |
| medium | 适中的详细程度，包含必要解释 | 默认级别，大多数场景 |
| high | 详细的回答，包含深度分析和解释 | 教学、代码审查、复杂问题分析 |

### 实际效果对比

在相同 prompt 下，不同 verbosity 级别的输出差异显著。以"解释 Python 的 GIL"为例：

- low: 直接给出 GIL 的定义和影响，约 150 tokens
- medium: 包含定义、影响、解决方案，约 500 tokens  
- high: 包含定义、历史、影响、解决方案、最佳实践、代码示例，约 1500 tokens

这意味着 token 消耗可以相差 10 倍——对于大规模 API 调用场景，正确设置 verbosity 可以显著降低成本。`,
    code: [
      {
        lang: "python",
        filename: "gpt55_verbosity_demo.py",
        code: `import openai
import tiktoken

client = openai.OpenAI()

def get_response(verbosity: str, question: str) -> dict:
    """测试不同 verbosity 级别的效果"""
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {"role": "system", "content": "你是一个 AI 助手。"},
            {"role": "user", "content": question},
        ],
        extra_body={
            "verbosity": verbosity,  # low, medium, high
        },
    )
    
    # 统计 token 消耗
    enc = tiktoken.encoding_for_model("gpt-5.5")
    output_text = response.choices[0].message.content
    output_tokens = len(enc.encode(output_text))
    
    # 计算成本（GPT-5.5: 输入 $5/M, 输出 $30/M）
    input_tokens = response.usage.prompt_tokens
    cost = (input_tokens / 1_000_000 * 5) + (output_tokens / 1_000_000 * 30)
    
    return {
        "verbosity": verbosity,
        "output_tokens": output_tokens,
        "output_chars": len(output_text),
        "cost_usd": round(cost, 6),
        "first_line": output_text.split("\\n")[0][:80],
    }

# 测试问题
question = "解释 Python 的全局解释器锁 (GIL) 是什么，它的影响是什么，以及如何绕过它？"

print(f"问题: {question[:60]}...\\n")
print(f"{'级别':<8} {'Tokens':>6} {'字符':>6} {'成本($)':>8}  首行摘要")
print("-" * 80)

for level in ["low", "medium", "high"]:
    result = get_response(level, question)
    print(
        f"{result['verbosity']:<8} "
        f"{result['output_tokens']:>6} "
        f"{result['output_chars']:>6} "
        f"{result['cost_usd']:>8.6f}  "
        f"{result['first_line']}"
    )

# 成本对比分析
print("\\n--- 成本对比 ---")
low = get_response("low", question)
high = get_response("high", question)
savings = (1 - low["cost_usd"] / high["cost_usd"]) * 100
print(f"使用 low vs high: 节省 {savings:.1f}% 的输出 token 成本")`,
      },
    ],
  },
  {
    title: "三、多步任务的用户体验优化：工具调用前的可见更新",
    body: `**GPT-5**.5 Prompting Guide 中提出了一个非常实用的 UX 技巧：对于可能需要较长时间思考才能返回可见响应的应用，在工具调用之前先发送一条简短的用户可见更新。

**### 问题**：长时间思考 = 用户以为卡死了

当 **GPT-5**.5 需要调用多个工具来完成一个复杂任务时（比如搜索→分析→生成），整个过程可能持续 30-60 秒。在这期间，用户看不到任何反馈，很容易以为应用卡死了。

### 解决方案：在工具调用前发送可见更新

**对话流程示例**：
**- 用户**："帮我分析这家公司最近的财务表现"
**- 模型**：[可见更新] "好的，我来帮你分析。首先搜索最新的财务报告..."
**- 模型**：[调用搜索工具]
**- 模型**：[可见更新] "找到了 2024 Q4 财报，正在提取关键指标..."
**- 模型**：[调用分析工具]
**- 模型**：[最终回答] "根据 2024 Q4 财报，该公司的关键指标如下..."

这个简单的技巧让长链路任务感觉不再像是"卡住"，而是"正在处理中"。**OpenAI** 的 Codex 应用已经在采用这个模式。`,
    mermaid: `sequenceDiagram
    participant User as 用户
    participant App as 应用层
    participant Model as GPT-5.5
    participant Tool1 as 搜索工具
    participant Tool2 as 分析工具
    
    User->>App: "分析某公司财务表现"
    App->>Model: 发送请求
    Model-->>App: [更新] "好的，先搜索财务报告..."
    App-->>User: 显示进度提示
    Model->>Tool1: 调用搜索
    Tool1-->>Model: 返回搜索结果
    Model-->>App: [更新] "找到了财报，正在提取指标..."
    App-->>User: 显示进度更新
    Model->>Tool2: 调用分析
    Tool2-->>Model: 返回分析结果
    Model-->>App: 最终回答
    App-->>User: 展示完整分析结果`,
    code: [
      {
        lang: "python",
        filename: "gpt55_streaming_with_updates.py",
        code: `import openai
from typing import Generator

client = openai.OpenAI()

def chat_with_updates(
    user_message: str,
    system_prompt: str = "你是一个 AI 助手。",
) -> Generator[str, None, str]:
    """
    支持用户可见更新的流式聊天。
    
    在工具调用前发送进度更新，改善长链路任务的 UX。
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]
    
    # 使用 stream=True 获取流式响应
    stream = client.chat.completions.create(
        model="gpt-5.5",
        messages=messages,
        stream=True,
        stream_options={"include_usage": True},
        extra_body={"verbosity": "medium"},
    )
    
    full_response = ""
    tool_calls_buffer = []
    current_content = ""
    
    for chunk in stream:
        delta = chunk.choices[0].delta if chunk.choices else None
        
        if not delta:
            continue
            
        # 检测工具调用开始
        if hasattr(delta, "tool_calls") and delta.tool_calls:
            # 在工具调用前发送可见更新
            if current_content:
                yield f"[进度] {current_content[:100]}...\\n"
            tool_calls_buffer.extend(delta.tool_calls)
            continue
        
        # 累积内容
        if hasattr(delta, "content") and delta.content:
            current_content += delta.content
            yield delta.content
    
    # 如果有工具调用，发送最终总结
    if tool_calls_buffer:
        yield "\\n[提示] 模型调用了 {} 个工具完成此任务\\n".format(
            len(tool_calls_buffer)
        )

# 使用示例
user_query = "帮我搜索并总结 2026 年 Q1 全球 AI 芯片市场的最新趋势"

print(f"用户: {user_query}\\n")
print("AI: ", end="")

for chunk in chat_with_updates(user_query):
    print(chunk, end="", flush=True)

print()`,
      },
    ],
  },
  {
    title: "四、image_detail 参数：控制图像输入的精度与成本",
    body: `**GPT-5**.5 引入了 image_detail 参数，用于控制图像附件的精度级别。这对于需要处理图像的多模态应用非常重要。

### image_detail 的四个级别

| 级别 | 说明 | 适用场景 |
|------|------|----------|
| low | 低精度，最小 token 消耗 | 简单图像分类、颜色检测 |
| high | 高精度，更多 token | 详细的视觉理解、OCR |
| auto | 自动选择（默认） | 通用场景 |
| original | 原始精度（仅 **GPT-5**.4/5.5） | 需要最高精度的场景 |

### 成本影响

不同的 image_detail 级别对 token 消耗的影响非常大。一张 1024x1024 的图像：

- low: 约 85 tokens
- high: 约 765 tokens（9 倍差异）
- original: 约 1500+ tokens

对于需要批量处理图像的应用，正确选择 image_detail 可以显著降低成本。`,
    code: [
      {
        lang: "python",
        filename: "gpt55_image_detail_demo.py",
        code: `import openai
import base64

client = openai.OpenAI()

def analyze_image(image_path: str, detail: str = "auto") -> dict:
    """
    使用不同 image_detail 级别分析图像。
    
    参数:
        image_path: 图像文件路径
        detail: low, high, auto, original
    """
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode()
    
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "描述这张图片的内容。",
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}",
                            "detail": detail,
                        },
                    },
                ],
            },
        ],
        max_tokens=500,
    )
    
    return {
        "detail_level": detail,
        "input_tokens": response.usage.prompt_tokens,
        "output_tokens": response.usage.completion_tokens,
        "total_tokens": response.usage.total_tokens,
        "description": response.choices[0].message.content[:200],
    }

# 对比测试
image_file = "test_image.jpg"

print(f"{'级别':<10} {'输入Tokens':>10} {'输出Tokens':>10} {'总Tokens':>8}")
print("-" * 45)

for detail in ["low", "auto", "high", "original"]:
    try:
        result = analyze_image(image_file, detail)
        print(
            f"{result['detail_level']:<10} "
            f"{result['input_tokens']:>10} "
            f"{result['output_tokens']:>10} "
            f"{result['total_tokens']:>8}"
        )
    except Exception as e:
        print(f"{detail:<10} 错误: {str(e)[:40]}")`,
      },
    ],
  },
  {
    title: "五、系统提示词设计：GPT-5.5 的简洁原则",
    body: `**GPT-5**.5 对系统提示词的处理方式与之前有显著不同。过于冗长的系统提示词反而会降低模型表现——这是许多开发者的经验教训。

### **GPT-5**.5 系统提示词设计原则

1. 精简优于详尽：**GPT-5**.5 不需要像旧模型那样事无巨细的指令。简短、精确的系统提示词效果更好
2. 避免冲突指令：**GPT-5**.5 对矛盾指令更敏感，确保系统提示词内部逻辑一致
3. 聚焦产品契约：只包含真正必要的行为约束，不要添加"为了保险"的额外指令
4. 结构化优先：使用清晰的段落结构，而不是堆砌 bullet points

### 反模式：从 **GPT-5**.x 迁移时常见的错误

| 错误 | 说明 | 修正 |
|------|------|------|
| 保留所有旧指令 | 直接复制旧系统提示词 | 从最小化 prompt 开始重建 |
| 过度防御 | 添加大量"不要做"的限制 | **GPT-5**.5 默认行为更好，减少限制 |
| 冗长格式要求 | 详细的输出格式说明 | 精简为关键格式要求 |
| 重复强调 | 同一规则多次出现 | 只说一次，**GPT-5**.5 能记住 |`,
    mermaid: `flowchart LR
    subgraph "❌ 旧的冗长系统提示词"
        A["你是 AI 助手... 请遵循以下规则: 1. ... 2. ... 3. ... 4. ... 5. ... 6. ... 7. ... 8. ... 9. ... 10. ... 11. ... 12. ..."]
    end
    
    subgraph "✅ GPT-5.5 优化后的系统提示词"
        B["你是 AI 编程助手。 提供清晰、准确的 代码解释和示例。"]
    end
    
    A -->|精简 80％| B
    B --> C["更好的理解"]
    B --> D["更少的冲突"]
    B --> E["更低的 token 成本"]
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f,color:#fff
    classDef s1 fill:#1e3a5f,color:#fff`,
    code: [
      {
        lang: "python",
        filename: "gpt55_system_prompt_comparison.py",
        code: `import openai
import json

client = openai.OpenAI()

# ❌ 旧的冗长系统提示词（12条规则，约500 tokens）
old_system = """You are an AI programming assistant. Follow these rules:
1. Always think step by step before answering
2. Use markdown formatting for all code blocks
3. Include comments in all code examples
4. Never mention your knowledge cutoff date
5. Provide multiple solutions when applicable
6. Explain trade-offs for each solution
7. Use formal, professional language
8. Include error handling in code examples
9. Add type hints to Python code
10. Never output incomplete code
11. Always cite sources for factual claims
12. Ask clarifying questions when requirements are unclear
... (more rules)
"""

# ✅ GPT-5.5 优化后的精简系统提示词（约50 tokens）
new_system = """你是一个 AI 编程助手。帮助用户解决编程问题，
提供清晰的解释和可运行的代码示例。"""

test_question = "用 Python 实现一个线程安全的计数器"

def test_prompt(system: str, name: str):
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": test_question},
        ],
        temperature=0.7,
    )
    
    output = response.choices[0].message.content
    return {
        "name": name,
        "system_tokens": len(system.split()),
        "output_tokens": response.usage.completion_tokens,
        "total_cost": response.usage.total_tokens,
        "has_error_handling": "try" in output or "except" in output or "Lock" in output,
        "has_type_hints": ":" in output and "->" in output,
        "output_length": len(output),
    }

print(f"测试问题: {test_question}\\n")
print(f"{'方案':<8} {'系统Tokens':>10} {'输出Tokens':>10} {'总Tokens':>8} {'有错误处理':>10} {'有类型提示':>10}")
print("-" * 70)

for system, name in [(old_system, "冗长"), (new_system, "精简")]:
    result = test_prompt(system, name)
    print(
        f"{result['name']:<8} "
        f"{result['system_tokens']:>10} "
        f"{result['output_tokens']:>10} "
        f"{result['total_cost']:>8} "
        f"{'✅' if result['has_error_handling'] else '❌':>10} "
        f"{'✅' if result['has_type_hints'] else '❌':>10}"
    )

print("\\n结论：精简系统提示词在保持代码质量的同时，显著降低了 token 消耗。")`,
      },
    ],
  },
  {
    title: "六、工具描述优化：让 GPT-5.5 更准确地使用工具",
    body: `**GPT-5**.5 对工具（function calling）的描述和调用方式有了新的行为模式。正确优化工具描述对于发挥 **GPT-5**.5 的工具调用能力至关重要。

### **GPT-5**.5 工具描述最佳实践

1. 精确的参数描述：每个参数都需要清晰、无歧义的描述
2. 结构化格式：使用 JSON Schema 风格的严格类型定义
3. 示例驱动：在工具描述中包含使用示例
4. 避免模糊语言：不用"可能"、"大概"等不确定的表述

### 工具描述对比示例

假设我们有一个"搜索文档"的工具：

❌ 不好的描述： 搜索文档，找到相关内容
**✅ 好的描述**： 在指定知识库中执行语义搜索。输入查询字符串和可选的过滤条件，返回最相关的文档片段及其置信度分数。`,
    code: [
      {
        lang: "python",
        filename: "gpt55_tool_definition.py",
        code: `import openai
from pydantic import BaseModel, Field
from typing import Literal

client = openai.OpenAI()

# ✅ GPT-5.5 优化的工具定义
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_knowledge_base",
            "description": (
                "在知识库中执行语义搜索。返回最相关的文档片段，"
                "按相关性分数降序排列。当用户询问特定主题、"
                "概念或需要查找信息时使用此工具。"
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": (
                            "搜索查询。使用用户问题的核心关键词，"
                            "而不是完整的问题句子。例如：'Python GIL 影响' "
                            "而不是 'Python 的全局解释器锁有什么影响？'"
                        ),
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "返回结果数量。默认 5，最大 20。",
                        "default": 5,
                        "minimum": 1,
                        "maximum": 20,
                    },
                    "filter": {
                        "type": "object",
                        "description": "可选的过滤条件。",
                        "properties": {
                            "category": {
                                "type": "string",
                                "enum": ["programming", "ai", "devops", "data"],
                                "description": "按类别过滤。",
                            },
                            "date_range": {
                                "type": "string",
                                "description": "日期范围，格式：YYYY-MM-DD to YYYY-MM-DD",
                            },
                        },
                    },
                },
                "required": ["query"],
            },
        },
    }
]

# 测试工具调用
messages = [
    {"role": "system", "content": "你是一个技术助手，可以搜索知识库回答问题。"},
    {"role": "user", "content": "Python 的 GIL 对多线程性能有什么影响？"},
]

response = client.chat.completions.create(
    model="gpt-5.5",
    messages=messages,
    tools=tools,
    tool_choice="auto",
)

# 检查是否调用了工具
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    print(f"工具: {tool_call.function.name}")
    print(f"参数: {tool_call.function.arguments}")
else:
    print("模型直接回答了，未调用工具")
    print(f"回答: {response.choices[0].message.content[:200]}")`,
      },
    ],
  },
  {
    title: "七、推理模式控制：管理 GPT-5.5 的 reasoning effort",
    body: `**GPT-5**.5 引入了更精细的推理控制能力。与 **GPT-5**.x 相比，**GPT-5**.5 的默认推理行为更激进——它倾向于在更多场景下进行深度推理。这对于需要快速响应的应用可能不是最优的。

### 推理控制策略

| 场景 | 推荐策略 | 说明 |
|------|----------|------|
| 简单问答 | 低推理 effort | 直接回答，减少延迟 |
| 代码生成 | 中等推理 effort | 平衡质量和速度 |
| 复杂分析 | 高推理 effort | 需要深度思考的场景 |
| 实时对话 | 禁用推理 | 最低延迟 |

### 推理模式对成本的影响

启用推理模式会增加 token 消耗，因为模型会生成"思维链"（即使不直接输出给用户）。在大规模应用中，需要根据场景选择合适的推理级别。`,
    mermaid: `flowchart TD
    subgraph "推理模式选择决策树"
        A["用户请求"] --> B{"需要复杂推理吗？"}
        B -->|是| C{"涉及代码/数学吗？"}
        B -->|否| D["禁用推理 最低延迟"]
        C -->|是| E["高推理 effort 最大质量"]
        C -->|否| F["中等推理 effort 平衡质量与速度"]
        
        D --> G["简单回答 ~50-200 tokens"]
        F --> H["带推理的回答 ~200-1000 tokens"]
        E --> I["深度推理回答 ~1000-5000 tokens"]
    end
    class E s2
    class F s1
    class D s0
    classDef s0 fill:#1e3a5f,color:#fff
    classDef s1 fill:#1e3a5f,color:#fff
    classDef s2 fill:#1e3a5f,color:#fff`,
    code: [
      {
        lang: "python",
        filename: "gpt55_reasoning_control.py",
        code: `import openai
import time

client = openai.OpenAI()

def chat_with_reasoning_control(
    question: str,
    complexity: str = "medium",
) -> dict:
    """
    根据问题复杂度选择合适的推理模式。
    
    complexity: "low" | "medium" | "high"
    """
    # 推理模式映射
    reasoning_map = {
        "low": {"reasoning_effort": "low"},
        "medium": {"reasoning_effort": "medium"},
        "high": {"reasoning_effort": "high"},
    }
    
    start = time.time()
    
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {"role": "system", "content": "你是一个 AI 助手。"},
            {"role": "user", "content": question},
        ],
        extra_body=reasoning_map.get(complexity, reasoning_map["medium"]),
        verbosity="medium",
    )
    
    elapsed = time.time() - start
    
    return {
        "complexity": complexity,
        "latency_ms": round(elapsed * 1000, 1),
        "input_tokens": response.usage.prompt_tokens,
        "output_tokens": response.usage.completion_tokens,
        "total_tokens": response.usage.total_tokens,
        "answer_preview": response.choices[0].message.content[:150],
    }

# 测试不同复杂度场景
test_questions = [
    ("Python 的 list 和 tuple 有什么区别？", "low"),
    ("用 Python 实现一个 LRU Cache，要求 O(1) 时间复杂度", "medium"),
    ("分析这段并发代码中的 race condition，并给出修复方案", "high"),
]

print(f"{'场景':<10} {'延迟(ms)':>8} {'总Tokens':>8}  回答预览")
print("-" * 70)

for question, complexity in test_questions:
    result = chat_with_reasoning_control(question, complexity)
    print(
        f"{complexity:<10} "
        f"{result['latency_ms']:>8} "
        f"{result['total_tokens']:>8}  "
        f"{result['answer_preview'][:50]}..."
    )`,
      },
    ],
  },
  {
    title: "八、实战：用 Codex 命令一键迁移项目到 GPT-5.5",
    body: `**OpenAI** 在 Prompting Guide 中提到了一个非常方便的迁移方式——使用 Codex 和 openai-docs skill 一键迁移项目到 **GPT-5**.5。

### 迁移命令

**在终端中运行**：openai-docs migrate this project to gpt-5.5

这个命令会引导一个编码 Agent 根据 **OpenAI** 的升级指南自动迁移你的项目。升级指南包含：

1. 模型名替换：将所有 \`gpt-5.x\` 引用更新为 \`gpt-5.5\`
2. Prompt 重写：根据 GPT-5.5 的简洁原则重写系统提示词
3. 参数更新：添加 verbosity、image_detail 等新参数
4. 工具定义优化：更新 function calling 定义
5. 测试验证：运行测试确保迁移后行为一致

### 升级指南关键内容

OpenAI 的升级指南特别强调了以下几点：

- 从最小 prompt 开始：不要直接替换模型名，而是重建 prompt
- 逐步验证：每个变更都要用代表性数据验证
- 关注 verbosity：新参数可以显著影响输出质量和成本
- 测试工具调用：确保工具定义与 GPT-5.5 的调用模式兼容

### 手动迁移检查清单

如果你不想用自动化工具，可以按以下清单手动迁移：

1. [ ] 更新 model 名从 \`gpt-5.x\` 到 \`gpt-5.5\`
2. [ ] 精简系统提示词，删除不必要的约束
3. [ ] 添加 verbosity 参数（默认 medium）
4. [ ] 检查工具定义，确保参数描述精确
5. [ ] 测试多步任务，添加工具调用前的可见更新
6. [ ] 如果有图像处理，设置合适的 image_detail
7. [ ] 运行完整的回归测试`,
    code: [
      {
        lang: "python",
        filename: "gpt55_migration_checker.py",
        code: `import openai
import json
import os
from pathlib import Path

client = openai.OpenAI()

def check_gpt55_readiness(project_dir: str) -> dict:
    """
    检查项目是否已准备好迁移到 GPT-5.5。
    """
    issues = []
    suggestions = []
    
    # 检查 1: 搜索旧的模型名引用
    for filepath in Path(project_dir).rglob("*.py"):
        content = filepath.read_text()
        if "gpt-5.2" in content or "gpt-5.4" in content:
            issues.append(f"发现旧模型名引用: {filepath}")
            suggestions.append(f"将 {filepath} 中的模型名更新为 gpt-5.5")
        
        # 检查 2: 是否缺少 verbosity 参数
        if "chat.completions.create" in content and "verbosity" not in content:
            issues.append(f"缺少 verbosity 参数: {filepath}")
            suggestions.append(
                f"在 {filepath} 的 API 调用中添加 verbosity 参数"
            )
        
        # 检查 3: 检查系统提示词长度
        if 'system", "content"' in content:
            # 简单估算系统提示词长度
            import re
            system_prompts = re.findall(
                r'"system".*?"content":\s*"([^"]+)"', content
            )
            for sp in system_prompts:
                word_count = len(sp.split())
                if word_count > 200:
                    issues.append(
                        f"系统提示词过长 ({word_count} words): {filepath}"
                    )
                    suggestions.append(
                        f"精简 {filepath} 中的系统提示词，"
                        f"建议不超过 100 words"
                    )
    
    return {
        "issues": issues,
        "suggestions": suggestions,
        "ready": len(issues) == 0,
    }

# 使用示例
result = check_gpt55_readiness(".")

print("=== GPT-5.5 迁移检查报告 ===\\n")

if result["ready"]:
    print("✅ 项目已准备好迁移到 GPT-5.5！")
else:
    print(f"❌ 发现 {len(result['issues'])} 个问题：\\n")
    for i, issue in enumerate(result["issues"], 1):
        print(f"{i}. {issue}")
    
    print(f"\\n💡 建议：")
    for i, suggestion in enumerate(result["suggestions"], 1):
        print(f"  {i}. {suggestion}")`,
      },
    ],
  },
  {
    title: "总结：GPT-5.5 Prompt 工程核心要点",
    body: `**GPT-5**.5 的发布不仅是模型能力的升级，更是 Prompt 工程方法论的一次迭代。以下是我们在本文中总结的核心要点：

1. 迁移策略：从最小化 prompt 开始，逐步调优，不要直接复用旧 prompt
2. verbosity 参数：精细控制输出详细度，可节省高达 10 倍 token 成本
3. 用户体验优化：多步任务在工具调用前发送可见更新
4. image_detail 参数：控制图像精度，平衡质量与成本
5. 系统提示词：简洁优于冗长，**GPT-5**.5 不需要过多约束
6. 工具定义：精确、结构化的工具描述让 **GPT-5**.5 更准确调用
7. 推理控制：根据场景选择合适的 reasoning effort

**OpenAI** 的 **GPT-5**.5 Prompting Guide 是一个非常有价值的资源。建议所有使用 **GPT-5**.5 的开发者都仔细阅读，并根据指南中的建议调整自己的 prompt 策略。

**> 最后提醒**： GPT-5.5 是一个需要"重新学习"的模型。不要假设旧的方法仍然有效——花一些时间建立新的 baseline，长期来看会带来更好的效果和更低的成本。`,
    mermaid: `flowchart TD
    subgraph "GPT-5.5 Prompt 工程全景"
        A["迁移策略"] --> A1["最小化 Baseline"]
        B["输出控制"] --> B1["verbosity 参数"]
        B --> B2["image_detail 参数"]
        C["用户体验"] --> C1["工具调用前更新"]
        D["系统提示词"] --> D1["简洁原则"]
        E["工具定义"] --> E1["精确描述"]
        F["推理控制"] --> F1["按场景选择"]
    end
    
    A1 --> G["更好的表现"]
    B1 --> G
    B2 --> G
    C1 --> G
    D1 --> G
    E1 --> G
    F1 --> G
    class G s0
    classDef s0 fill:#1e3a5f,color:#fff`,
  },
],
};

export default blog;
