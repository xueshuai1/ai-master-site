import type { BlogPost } from './blog-types';

const blog: BlogPost = {
  id: "blog-059",
  title: "OpenAI GPT-5.5 官方 Prompting Guide 深度解读：6 条核心调优原则与实战迁移",
  category: "GPT-5.5",
  summary: "OpenAI 随 GPT-5.5 同步发布官方 Prompting Guide，明确建议「将 GPT-5.5 视为新模型家族调优，而非旧版本的简单替换」。本文逐条解读指南核心建议，涵盖迁移策略、verbosity 参数、多步任务 UX 优化、image_detail 参数、系统提示词精简和工具描述最佳实践，附带完整的 Python 实战代码和自动化迁移检查脚本。",
  date: "2026-04-27",
  author: "AI Master",
  tags: ["GPT-5.5", "Prompting Guide", "OpenAI", "迁移策略", "verbosity", "image_detail", "系统提示词", "工具描述", "Python 实战", "2026"],
  readTime: 30,
  content: [
  {
    title: "引言：OpenAI 首次发布模型级 Prompting Guide",
    body: `2026 年 4 月 23 日，**OpenAI** 在发布 **GPT-5**.5 的同时，同步推出了一份前所未有的文档——**GPT-5**.5 Prompting Guide。这是 **OpenAI** 历史上首次为单个模型发布如此系统、深入的调优指南。

这份指南开篇就定下基调：

> "To get the most out of **GPT-5**.5, treat it as a new model family to tune for, not a drop-in replacement for gpt-5.2 or gpt-5.4. Begin migration with a fresh baseline instead of carrying over every instruction from older prompt stacks."

这句话背后是一个重要的行业信号：大模型正在从「通用接口」走向「专用调优」时代。 过去那种「写一套 prompt，通吃所有模型」的范式正在瓦解。每个新模型家族都有其独特的理解模式、推理偏好和输出风格，需要针对性的调优策略。

Simon Willison 在第一时间对这份指南进行了详细解读，并给出了自己的实测反馈。本文将结合官方指南和 Willison 的实践经验，提炼出 6 条核心调优原则。`,
    tip: `快速结论：
- GPT-5.5 需要从零开始调优，不要直接复用 GPT-5.x 的 prompt
- 新参数 verbosity（低/中/高）可精细控制输出详细度，节省 10 倍 token 成本
- 多步任务应在工具调用前发送简短用户可见更新
- image_detail 参数新增 "original" 选项（仅 GPT-5.4+）
- 系统提示词越简洁越好，GPT-5.5 对冗余指令敏感
- 工具描述需要精确结构化，避免模糊表述`,
  },
  {
    title: "一、迁移策略：最小化 baseline 原则",
    body: `官方指南最核心的建议是：从最小化的 prompt 开始迁移，而不是一口气复制所有旧指令。

具体来说，迁移流程应该是：

**1. 从空白开始**：移除所有旧 prompt 中的指令、约束和格式要求
**2. 测试最小功能**：只保留最核心的任务描述，确认模型能完成基本任务
**3. 逐层添加**：只在发现模型输出不符合预期时，才添加新的指令
**4. 用真实数据验证**：在代表性输入集上测试，确保新 prompt 的效果

**这个策略背后的逻辑是**：**GPT-5**.5 的理解能力和推理方式已经发生了微妙变化。旧 prompt 中的一些约束可能是为了弥补 **GPT-5**.x 的不足，在 **GPT-5**.5 中反而会成为干扰。`,
    mermaid: `graph TD
  A[旧 GPT-5.x Prompt] --> B{是否直接复用}
  B -->|否 推荐| C[从零开始]
  B -->|是 不推荐| D[直接迁移]
  C --> E[保留核心任务描述]
  E --> F[测试最小功能]
  F --> G{输出符合预期}
  G -->|是| H[完成迁移]
  G -->|否| I[逐层添加约束]
  I --> F
  D --> J[可能引入过时约束]
  J --> K[性能不如预期]`,
    code: [
      {
        lang: "python",
        filename: "minimal_migration.py",
        code: `"""
GPT-5.5 Prompt 迁移脚本 - 最小化 baseline 方法
演示如何从旧 prompt 迁移到 GPT-5.5
"""

import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ❌ 错误做法：直接复制旧 prompt
OLD_PROMPT = """
你是一个专业的技术写作助手。请遵循以下规则：
1. 使用正式、专业的语气
2. 每个段落不超过 5 句话
3. 必须包含至少 3 个代码示例
4. 在结尾添加总结段落
5. 使用 Markdown 格式
6. 避免使用第一人称
7. 每个技术术语首次出现时必须解释
...（还有 15 条规则）
"""

# ✅ 正确做法：从最小化开始
MINIMAL_PROMPT = """
请撰写一篇关于 {topic} 的技术文章。
"""

def test_minimal_prompt(topic: str) -> str:
    """测试最小化 prompt 的效果"""
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {"role": "user", "content": MINIMAL_PROMPT.format(topic=topic)}
        ],
        max_tokens=2000,
    )
    return response.choices[0].message.content

# 验证最小 prompt 是否满足基本需求
result = test_minimal_prompt("REST API 设计最佳实践")
print(result[:500])

# 只有在不满足需求时，才逐层添加约束
ENHANCED_PROMPT = """
请撰写一篇关于 {topic} 的技术文章。
要求：
- 包含 3 个可运行的 Python 代码示例
- 使用 Markdown 格式
"""

result = client.chat.completions.create(
    model="gpt-5.5",
    messages=[{"role": "user", "content": ENHANCED_PROMPT.format(topic=topic)}],
    max_tokens=2000,
)
print(result.choices[0].message.content[:500])`
      }
    ],
  },
  {
    title: "二、verbosity 参数：精确控制输出详细度",
    body: `**GPT-5**.5 引入了一个全新的参数：verbosity（详细度），用于精确控制模型输出的详细程度。这是 **OpenAI** 对开发者长期反馈的回应——很多时候我们不需要模型输出大量冗余的解释文字。

verbosity 有三个可选值：
- low：简洁输出，直奔主题，适合 API 调用和程序化处理
- medium（默认）：平衡的详细程度，适合大多数对话场景
- high：详细输出，包含更多解释和背景信息，适合教育和创意场景

****成本影响****： 在 Willison 的实测中，使用 \`verbosity: "low"\` 可以将输出 token 数量减少 高达 10 倍，直接节省 10 倍输出成本。`,
    mermaid: `graph TD
  A[用户需求] --> B{选择 verbosity}
  B -->|low| C[简洁模式]
  B -->|medium| D[平衡模式]
  B -->|high| E[详细模式]
  C --> F[输出: 简短要点]
  C --> G[Token 消耗: ~200]
  C --> H[适用: API 调用, 数据处理]
  D --> I[输出: 中等长度]
  D --> J[Token 消耗: ~1000]
  D --> K[适用: 一般对话]
  E --> L[输出: 详细解释]
  E --> M[Token 消耗: ~2000]
  E --> N[适用: 教育, 创意写作]`,
    code: [
      {
        lang: "python",
        filename: "verbosity_comparison.py",
        code: `"""
verbosity 参数对比实验
测试 GPT-5.5 在不同 verbosity 设置下的输出差异
"""

import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def test_verbosity(topic: str, level: str) -> dict:
    """测试指定 verbosity 级别的输出"""
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {"role": "user", "content": f"请解释 {topic}"}
        ],
        max_tokens=1000,
        extra_body={"verbosity": level},  # GPT-5.5 特有参数
    )
    content = response.choices[0].message.content
    return {
        "verbosity": level,
        "output_length": len(content),
        "output_tokens": response.usage.completion_tokens,
        "preview": content[:200],
    }

# 对比实验
topic = "RESTful API 的设计原则"
results = []
for level in ["low", "medium", "high"]:
    result = test_verbosity(topic, level)
    results.append(result)
    print(f"verbosity={level}: {result['output_tokens']} tokens")
    print(f"  预览: {result['preview'][:100]}...\\n")

# 成本分析
print("\\n=== 成本对比（假设 $30/1M tokens）===")
for r in results:
    cost = r["output_tokens"] * 30 / 1_000_000
    print(f"verbosity={r['verbosity']}: {cost:.4f} USD")

# 批量处理场景下的成本节省
print("\\n=== 批量处理 1000 次调用的成本 ===")
for r in results:
    total_cost = r["output_tokens"] * 1000 * 30 / 1_000_000
    print(f"verbosity={r['verbosity']}: {total_cost:.2f} USD")`
      }
    ],
  },
  {
    title: "三、多步任务 UX 优化：工具调用前的可见更新",
    body: `**GPT-5**.5 在 Codex 等需要多步推理的应用中表现更强，但也意味着用户等待时间更长。官方指南提出了一个简单但实用的 UX 改进建议：

> "Before any tool calls for a multi-step task, send a short user-visible update that acknowledges the request and states the first step. Keep it to one or two sentences."

**这个技巧的核心思想是**：让用户知道模型还在工作，而不是卡死了。

Willison 已经观察到 Codex 应用在实践中使用了这个技巧——在执行长时间任务前，先返回一句简短的确认信息，然后再开始真正的工具调用。这大大改善了用户的等待体验。`,
    mermaid: `sequenceDiagram
    participant U as 用户
    participant A as AI 应用
    participant M as GPT-5.5
    participant T as 工具/外部 API

    U->>A: "分析这个 5000 行代码库"
    A->>M: 转发请求
    M-->>A: "好的，我先扫描项目结构..."
    A-->>U: "好的，我先扫描项目结构..."
    Note over A,U: 用户知道模型还在工作
    M->>T: 调用代码分析工具
    T-->>M: 返回分析结果
    M->>T: 调用依赖分析工具
    T-->>M: 返回依赖信息
    M-->>A: 完整分析报告
    A-->>U: 返回最终结果

    rect rgb(255, 200, 200)
    Note over M: ❌ 旧方式：用户等待期间 没有任何反馈，以为卡死了
    end`,
    code: [
      {
        lang: "python",
        filename: "multi_step_ux.py",
        code: `"""
多步任务 UX 优化示例
在工具调用前发送用户可见更新
"""

import asyncio
from openai import AsyncOpenAI

client = AsyncOpenAI()

async def process_with_feedback(user_input: str):
    """带用户反馈的多步处理流程"""
    
    # 步骤 1：先确认请求
    ack_response = await client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {"role": "user", "content": user_input},
            {"role": "assistant", "content": "好的，我开始处理。"}
        ],
        max_tokens=50,
    )
    
    # 立即返回确认信息给用户
    yield ack_response.choices[0].message.content
    
    # 步骤 2：执行实际任务
    full_response = await client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {"role": "user", "content": user_input}
        ],
        tools=[
            {"type": "function", "function": {
                "name": "analyze_code",
                "description": "分析代码库结构",
                "parameters": {"type": "object", "properties": {}}
            }}
        ],
        extra_body={"verbosity": "medium"},
    )
    
    # 步骤 3：如果触发了工具调用，通知用户
    if full_response.choices[0].message.tool_calls:
        for tool_call in full_response.choices[0].message.tool_calls:
            yield f"\\n🔧 正在调用: {tool_call.function.name}"
            # 实际执行工具...
    
    # 返回完整结果
    yield full_response.choices[0].message.content

# 使用示例
async def main():
    user_query = "分析这个项目的依赖关系并找出循环引用"
    async for message in process_with_feedback(user_query):
        print(message)

asyncio.run(main())`
      }
    ],
  },
  {
    title: "四、image_detail 参数：控制图像输入精度",
    body: `**GPT-5**.4 和 **GPT-5**.5 进一步扩展了 \`image_detail\` 参数，新增了 "original" 选项。这个参数控制图像输入的处理精度，直接影响 token 消耗和处理速度。

**可选值**：
- low：低精度，快速处理，适合简单图像识别
- auto（默认）：自动选择精度
- high：高精度，适合需要细节识别的场景
- original（**GPT-5**.4+ 新增）：使用原始分辨率，最高精度但 token 消耗最大

在实际应用中，大多数场景使用 \`auto\` 或 \`low\` 就能获得满意结果，只有在需要识别图像中微小细节时才需要 \`high\` 或 \`original\`。`,
    table: {
      headers: ["参数值", "精度", "Token 消耗", "处理速度", "适用场景"],
      rows: [
        ["low", "低", "最少", "最快", "简单分类、场景识别"],
        ["auto", "自适应", "中等", "中等", "大多数通用场景"],
        ["high", "高", "较多", "较慢", "OCR、细节识别"],
        ["original", "原始分辨率", "最多", "最慢", "医学影像、工程图纸"],
      ],
    },
    code: [
      {
        lang: "python",
        filename: "image_detail_demo.py",
        code: `"""
image_detail 参数演示
对比不同精度设置下的处理效果
"""

import os
import base64
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def encode_image(image_path: str) -> str:
    """将图片编码为 base64"""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def analyze_image(image_path: str, detail_level: str) -> dict:
    """使用指定精度分析图像"""
    image_b64 = encode_image(image_path)
    
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "请描述这张图片的内容"},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_b64}",
                            "detail": detail_level,
                        },
                    },
                ],
            }
        ],
        max_tokens=500,
    )
    
    return {
        "detail": detail_level,
        "description": response.choices[0].message.content,
        "total_tokens": response.usage.total_tokens,
        "prompt_tokens": response.usage.prompt_tokens,
    }

# 对比实验
image_path = "sample_image.jpg"
results = {}
for detail in ["low", "auto", "high", "original"]:
    result = analyze_image(image_path, detail)
    results[detail] = result
    print(f"detail={detail}: {result['prompt_tokens']} prompt tokens")

# 成本效益分析
print("\\n=== 成本效益分析 ===")
for detail, r in results.items():
    print(f"{detail}: {r['prompt_tokens']} tokens → "
          f"\${r['prompt_tokens'] * 5 / 1_000_000:.4f}")`
      }
    ],
  },
  {
    title: "五、系统提示词精简原则",
    body: `**GPT-5**.5 对系统提示词的处理方式有一个重要变化：它更偏好简洁、精准的系统提示词，对冗长复杂的系统指令反而会产生反效果。

**官方指南明确指出**：**GPT-5**.5 在理解简短系统提示词时表现更好，过长的系统提示词可能会导致模型注意力分散，忽略关键指令。

****精简原则****：
1. 只保留必要的角色定义和核心约束
2. 删除重复的、隐含的、或模型已经理解的指令
3. 使用清晰的格式（如编号列表）而不是大段文字
4. 将详细的格式要求移到用户消息中，而不是系统提示词`,
    mermaid: `graph TD
  A[长系统提示词] --> B[GPT-5.5 处理]
  B --> C[注意力分散]
  B --> D[忽略关键指令]
  B --> E[前后矛盾]
  
  F[短系统提示词] --> G[GPT-5.5 处理]
  G --> H[精准理解]
  G --> I[遵循所有指令]
  G --> J[输出稳定]`,
    code: [
      {
        lang: "python",
        filename: "system_prompt_comparison.py",
        code: `"""
系统提示词精简对比实验
比较冗长 vs 精简系统提示词的效果
"""

import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ❌ 冗长的系统提示词（不推荐）
VERBOSE_SYSTEM_PROMPT = """
你是一个专业的技术写作助手，专门负责撰写软件工程和人工智能领域的技术文档。
你的写作风格应该正式、专业、客观。
请遵循以下规则：
1. 使用清晰的结构，包含标题、段落和列表
2. 每个技术术语首次出现时必须给出解释
3. 使用具体的代码示例来说明概念
4. 避免使用模糊的语言，如"可能"、"也许"、"大概"
5. 确保所有代码示例都是可运行的
6. 在文章结尾提供总结
7. 使用中文撰写，但技术术语保留英文
8. 不要使用第一人称
9. 不要使用感叹号
10. 每段不超过 5 句话
...（还有更多规则）
"""

# ✅ 精简的系统提示词（推荐）
CONCISE_SYSTEM_PROMPT = """
你是技术写作助手。撰写清晰、结构化的技术文档。
要求：代码可运行、术语有解释、使用 Markdown。
"""

def test_system_prompt(system_prompt: str, topic: str) -> dict:
    """测试系统提示词的效果"""
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"写一篇关于 {topic} 的技术文章"},
        ],
        max_tokens=1000,
    )
    return {
        "output_length": len(response.choices[0].message.content),
        "tokens_used": response.usage.total_tokens,
        "content": response.choices[0].message.content[:300],
    }

# 对比实验
topic = "异步编程"
verbose_result = test_system_prompt(VERBOSE_SYSTEM_PROMPT, topic)
concise_result = test_system_prompt(CONCISE_SYSTEM_PROMPT, topic)

print("=== 冗长系统提示词 ===")
print(f"Token 消耗: {verbose_result['tokens_used']}")
print(f"输出长度: {verbose_result['output_length']}")
print(f"预览: {verbose_result['content'][:200]}...")

print("\\n=== 精简系统提示词 ===")
print(f"Token 消耗: {concise_result['tokens_used']}")
print(f"输出长度: {concise_result['output_length']}")
print(f"预览: {concise_result['content'][:200]}...")`
      }
    ],
  },
  {
    title: "六、工具描述优化：精确结构化定义",
    body: `**GPT-5**.5 在工具使用能力上更强，但同时也要求更精确的工具描述。官方指南强调：

****工具描述需要****：
- 精确描述每个工具的功能和适用场景
- 明确定义所有参数及其类型、约束条件
- 提供清晰的示例说明何时使用该工具
- 避免模糊的、开放式的描述

模糊的工具描述会导致 **GPT-5**.5 在工具选择上出现不确定性，而精确的结构化描述能显著提升工具调用的准确率。`,
    table: {
      headers: ["要素", "模糊描述（❌）", "精确描述（✅）"],
      rows: [
        [
          "功能说明",
          "搜索网络信息",
          "在维基百科和 Stack Overflow 中搜索编程相关问题",
        ],
        [
          "参数定义",
          "输入查询内容",
          "query (string, 必填): 搜索关键词，1-100 字符",
        ],
        ["使用场景", "需要信息时调用", "当用户问题涉及事实性知识或编程问题时调用"],
        [
          "输出格式",
          "返回搜索结果",
          "返回 JSON：{results: [{title, url, snippet}]}，最多 5 条",
        ],
      ],
    },
    code: [
      {
        lang: "python",
        filename: "tool_definition_best_practice.py",
        code: `"""
GPT-5.5 工具定义最佳实践
精确结构化的工具描述示例
"""

import os
from openai import OpenAI
from pydantic import BaseModel, Field

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ✅ 精确的工具定义
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_codebase",
            "description": (
                "在代码仓库中搜索代码。适用于：查找函数定义、"
                "理解代码结构、定位 bug 位置。"
                "不适用于：运行代码、修改文件。"
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "搜索关键词（函数名、变量名等）",
                        "minLength": 1,
                        "maxLength": 200,
                    },
                    "language": {
                        "type": "string",
                        "description": "编程语言过滤",
                        "enum": ["python", "javascript", "rust", "go", "any"],
                        "default": "any",
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "最大返回结果数",
                        "minimum": 1,
                        "maximum": 20,
                        "default": 10,
                    },
                },
                "required": ["query"],
            },
        },
    }
]

# 使用工具
response = client.chat.completions.create(
    model="gpt-5.5",
    messages=[
        {"role": "user", "content": "帮我找到用户认证相关的代码"}
    ],
    tools=TOOLS,
    tool_choice="auto",
)

# 处理工具调用
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    print(f"调用的工具: {tool_call.function.name}")
    print(f"参数: {tool_call.function.arguments}")

    # 实际执行工具（示例）
    if tool_call.function.name == "search_codebase":
        import json
        args = json.loads(tool_call.function.arguments)
        print(f"搜索: {args['query']}")
        print(f"语言: {args.get('language', 'any')}")
        print(f"最大结果: {args.get('max_results', 10)}")`
      }
    ],
  },
  {
    title: "七、自动化迁移检查脚本",
    body: `为了帮助开发者高效完成从 **GPT-5**.x 到 **GPT-5**.5 的迁移，我编写了一个完整的自动化迁移检查脚本。这个脚本会：

1. 扫描现有 prompt：分析当前使用的 prompt 是否符合 **GPT-5**.5 的最佳实践
**2. 检测冗余指令**：找出可能过时或冗余的系统提示词内容
3. 推荐 verbosity 设置：根据 prompt 类型自动推荐合适的 verbosity 级别
**4. 生成迁移报告**：输出详细的迁移建议和优先级排序`,
    code: [
      {
        lang: "python",
        filename: "gpt55_migration_checker.py",
        code: `#!/usr/bin/env python3
"""
GPT-5.5 迁移检查器
自动分析现有 prompt 并生成迁移建议
"""

import os
import json
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from enum import Enum
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class Priority(Enum):
    HIGH = "🔴 高优先级"
    MEDIUM = "🟡 中优先级"
    LOW = "🟢 低优先级"

@dataclass
class MigrationIssue:
    priority: Priority
    category: str
    description: str
    suggestion: str
    line_numbers: List[int] = field(default_factory=list)

@dataclass
class MigrationReport:
    prompt_file: str
    issues: List[MigrationIssue] = field(default_factory=list)
    
    def summary(self) -> str:
        high = sum(1 for i in self.issues if i.priority == Priority.HIGH)
        med = sum(1 for i in self.issues if i.priority == Priority.MEDIUM)
        low = sum(1 for i in self.issues if i.priority == Priority.LOW)
        return f"\\n📋 {self.prompt_file} 迁移报告\\n" + "=" * 40 + \\
               f"\\n🔴 高优先级: {high} | 🟡 中优先级: {med} | 🟢 低优先级: {low}\\n"

class GPT55MigrationChecker:
    """GPT-5.5 迁移检查器"""
    
    def __init__(self):
        # 常见冗余模式
        self.redundant_patterns = [
            ("请确保", "GPT-5.5 默认会确保输出质量"),
            ("非常重要", "GPT-5.5 会自动关注关键信息"),
            ("务必", "GPT-5.5 遵循明确指令"),
            ("请仔细", "GPT-5.5 默认仔细处理"),
        ]
        
        # verbosity 推荐规则
        self.verbosity_rules = {
            "api": ("low", "API 调用场景推荐 low"),
            "chat": ("medium", "对话场景推荐 medium"),
            "education": ("high", "教育场景推荐 high"),
            "creative": ("high", "创意场景推荐 high"),
        }
    
    def check_system_prompt(self, prompt: str) -> List[MigrationIssue]:
        """检查系统提示词"""
        issues = []
        lines = prompt.split("\\n")
        
        # 检查长度
        if len(prompt) > 2000:
            issues.append(MigrationIssue(
                priority=Priority.HIGH,
                category="长度",
                description=f"系统提示词过长（{len(prompt)} 字符）",
                suggestion="精简至 500 字符以内，只保留核心指令",
            ))
        elif len(prompt) > 1000:
            issues.append(MigrationIssue(
                priority=Priority.MEDIUM,
                category="长度",
                description=f"系统提示词偏长（{len(prompt)} 字符）",
                suggestion="考虑精简，GPT-5.5 偏好简洁的系统提示词",
            ))
        
        # 检查冗余模式
        for pattern, explanation in self.redundant_patterns:
            for i, line in enumerate(lines):
                if pattern in line:
                    issues.append(MigrationIssue(
                        priority=Priority.LOW,
                        category="冗余",
                        description=f"第 {i+1} 行：'{pattern}' 可能是冗余指令",
                        suggestion=f"{explanation}，可考虑删除",
                        line_numbers=[i + 1],
                    ))
        
        return issues
    
    def check_verbosity(self, prompt: str, use_case: str) -> Optional[MigrationIssue]:
        """检查 verbosity 设置"""
        if use_case in self.verbosity_rules:
            recommended, explanation = self.verbosity_rules[use_case]
            return MigrationIssue(
                priority=Priority.MEDIUM,
                category="verbosity",
                description=f"当前场景 '{use_case}' 未设置 verbosity",
                suggestion=f"推荐设置 verbosity='{recommended}'：{explanation}",
            )
        return None
    
    def check_tool_definitions(self, tools: List[Dict]) -> List[MigrationIssue]:
        """检查工具定义"""
        issues = []
        for i, tool in enumerate(tools):
            func = tool.get("function", {})
            
            # 检查描述是否精确
            desc = func.get("description", "")
            if len(desc) < 20:
                issues.append(MigrationIssue(
                    priority=Priority.HIGH,
                    category="工具定义",
                    description=f"工具 '{func.get('name', 'unknown')}' 描述过短",
                    suggestion="添加详细的功能说明、适用场景和参数解释",
                ))
            
            # 检查参数定义
            params = func.get("parameters", {})
            if not params.get("properties"):
                issues.append(MigrationIssue(
                    priority=Priority.HIGH,
                    category="工具定义",
                    description=f"工具 '{func.get('name', 'unknown')}' 缺少参数定义",
                    suggestion="明确定义所有参数及其类型、约束条件",
                ))
        
        return issues
    
    def generate_report(
        self,
        prompt: str,
        tools: Optional[List[Dict]] = None,
        use_case: str = "chat",
    ) -> MigrationReport:
        """生成完整迁移报告"""
        report = MigrationReport(prompt_file="current_prompt")
        
        # 检查系统提示词
        report.issues.extend(self.check_system_prompt(prompt))
        
        # 检查 verbosity
        verbosity_issue = self.check_verbosity(prompt, use_case)
        if verbosity_issue:
            report.issues.append(verbosity_issue)
        
        # 检查工具定义
        if tools:
            report.issues.extend(self.check_tool_definitions(tools))
        
        return report

# 使用示例
if __name__ == "__main__":
    checker = GPT55MigrationChecker()
    
    # 示例 prompt
    sample_prompt = """
    你是一个 AI 助手。请帮助用户解决问题。
    请确保你的回答准确、全面、有帮助。
    务必要检查你的回答是否有事实错误。
    请仔细思考每个问题，给出最好的答案。
    非常重要的一点是，你要保持友好和专业的态度。
    ...（还有很多其他指令）
    """ * 5  # 故意弄长一些
    
    report = checker.generate_report(
        prompt=sample_prompt,
        use_case="api",
    )
    
    print(report.summary())
    for issue in report.issues:
        print(f"  {issue.priority.value} [{issue.category}]")
        print(f"    {issue.description}")
        print(f"    → {issue.suggestion}")
        print()`
      }
    ],
  },
  {
    title: "总结：GPT-5.5 Prompt 调优核心要点",
    body: `**GPT-5**.5 的官方 Prompting Guide 标志着大模型调优进入了一个新阶段——从通用模板到专用调优。

**六条核心原则回顾**：

**1. 从零开始迁移**：不要直接复制旧 prompt，从最小化 baseline 开始逐层添加
2. verbosity 精细控制：用 low/medium/high 精确控制输出详细度，节省 10 倍 token
3. 多步任务 UX 优化：在工具调用前发送用户可见更新，改善等待体验
4. image_detail 按需选择：大多数场景 auto 足够，original 用于高精度需求
**5. 系统提示词精简**：越简洁越好，**GPT-5**.5 对冗余指令敏感
**6. 工具描述精确化**：结构化、明确参数定义、说明适用场景

迁移 checklist：
- [ ] 扫描现有 prompt，移除冗余指令
- [ ] 设置合适的 verbosity 级别
- [ ] 简化系统提示词至 500 字符以内
- [ ] 检查工具定义的精确性
- [ ] 在代表性数据集上验证迁移效果
- [ ] 监控 token 消耗变化

**GPT-5**.5 不是 **GPT-5**.4 的简单升级版，而是一个需要重新调优的模型家族。投入时间做好迁移工作，你将在输出质量、速度和成本上获得显著回报。`,
    tip: `延伸阅读：
- [OpenAI GPT-5.5 官方 Prompting Guide](https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5)
- [Simon Willison 博客解读](https://simonwillison.net/2026/Apr/25/gpt-5-5-prompting-guide/)
- [GPT-5.5 使用指南](https://developers.openai.com/api/docs/guides/latest-model)
- [GPT-5.5 模型文档](https://developers.openai.com/api/docs/models/gpt-5.5)`,
  },
],
};

export default blog;
