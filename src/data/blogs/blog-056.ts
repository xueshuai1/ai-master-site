import type { BlogPost } from './blog-types';

const post: BlogPost = {
  id: "blog-056",
  title: "GPT-5.5 全面解析：OpenAI 最强模型的架构革新、Prompt 策略与实战迁移指南",
  category: "大语言模型",
  summary: '2026 年 4 月，OpenAI 发布 GPT-5.5，将 Codex 编码能力与主模型统一，带来 Agentic Coding、Computer Use 的质变提升。本文从模型架构、Prompt 策略、迁移指南、代码实战四个维度深度拆解，帮助你快速掌握 GPT-5.5 的核心能力并安全迁移。',
  date: "2026-04-26",
  author: "AI Master",
  tags: ["GPT-5.5", "OpenAI", "Prompt 工程", "Agentic Coding", "Computer Use", "模型迁移", "API 实战", "2026"],
  readTime: 35,
  content: [
    {
      title: "引言：GPT-5.5 为什么值得关注",
      body: `2026 年 4 月，**OpenAI** 正式发布 **GPT-5**.5 模型（API 标识符：\`gpt-5.5\`），这是自 **GPT-5** 系列以来的最重要升级。\n\n三个关键变化：\n1. Codex 与主模型统一：从 **GPT-5**.4 开始，**OpenAI** 将 Codex 编码专用模型与主模型合并为单一系统，**GPT-5**.5 进一步强化了这一方向，不再有单独的 "**GPT-5**.5-Codex" 产品线。\n2. Agentic Coding 质变：在自主编程、多步代码任务上的能力显著提升，接近「给你一个 repo，它自己跑」的愿景。\n3. Computer Use 原生支持：模型可以直接操控计算机界面，完成任何基于 GUI 的任务，这是从「语言模型」到「行动模型」的关键跃迁。\n\n**OpenAI** 官方明确警告：「To get the most out of **GPT-5**.5, treat it as a new model family to tune for, not a drop-in replacement for gpt-5.2 or gpt-5.4.」\n\n这意味着：直接切换模型字符串是不够的，你需要重新调优 Prompt 栈、工具描述和输出格式。本文就是为你做这件事的。`,
      tip: "本文包含 2 个 Mermaid 架构图、2 个 Python 可运行代码示例、3 个对比表格，建议收藏后逐步实践。",
    },
    {
      title: "一、GPT-5.5 模型架构：从分离到统一",
      body: `理解 **GPT-5**.5 的架构变化，是有效使用它的前提。让我们从 **GPT-5** 的架构演进说起。`,
      mermaid: `graph TD
    subgraph "GPT-5.2 时代（分离架构）"
        A["GPT-5.2 主模型\
对话/分析/创作"] 
        B["GPT-5.2-Codex\
专用编码模型"]
    end
    subgraph "GPT-5.4 过渡期（初步统一）"
        C["GPT-5.4 统一模型\
Codex能力并入主模型"]
    end
    subgraph "GPT-5.5（完全统一）"
        D["GPT-5.5 全能模型\
+ Agentic Coding\
+ Computer Use\
+ 统一推理"]
    end
    A -->|"5.4 合并"| C
    B -->|"5.4 合并"| C
    C -->|"5.5 强化"| D`,
    },
    {
      title: "",
      body: `架构统一带来的三个直接收益：\n\n1. 上下文一致性：不再需要在「编码任务用 Codex」和「非编码任务用主模型」之间切换。同一个模型，统一处理。\n2. 跨模态推理：编码能力与通用推理能力融合，模型可以在写代码的同时进行战略思考和上下文理解。\n3. 工具调用增强：统一的模型意味着统一的工具调用协议，Agentic Coding 和 Computer Use 共享同一套工具框架。\n\n### 关键参数变化`,
      table: {
        headers: ["参数", "GPT-5.2", "GPT-5.4", "GPT-5.5"],
        rows: [
          ["模型标识符", "gpt-5.2 / gpt-5.2-codex", "gpt-5.4", "gpt-5.5"],
          ["推理模式", "effort: low/medium/high", "effort: low/medium/high", "effort: low/medium/high/xhigh"],
          ["Verbosity", "不支持", "不支持", "low/medium/high"],
          ["Image Detail", "low/high/auto", "low/high/auto", "low/high/auto/original"],
          ["Codex 分支", "独立模型", "已合并", "已合并"],
          ["Computer Use", "不支持", "实验性", "原生支持"],
          ["上下文窗口", "128K", "128K", "200K"],
          ["工具调用", "并行工具调用", "并行+嵌套", "并行+嵌套+自主编排"],
        ],
      },
    },
    {
      title: "二、GPT-5.5 Prompt 策略：从零开始调优",
      body: `**OpenAI** 官方建议「从最小的 Prompt 开始，逐步调优」，这与之前「累积式优化」的策略截然不同。以下是具体操作方法。\n\n### 核心原则：最小有效 Prompt`,
      code: [
        {
          lang: "python",
          code: `# GPT-5.5 Prompt 最小化调优框架
# pip install openai

import openai

client = openai.OpenAI()

def minimal_prompt_tuning(task_description: str, examples: list[dict]):
    """
    GPT-5.5 Prompt 调优三步法：
    1. 从最小 Prompt 开始（只保留产品合约必须的指令）
    2. 逐步增加推理强度（reasoning effort）
    3. 调整 verbosity 和工具描述
    """
    
    # Step 1: 最小 Prompt - 只说任务
    messages = [
        {"role": "user", "content": task_description}
    ]
    
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=messages,
        reasoning={"effort": "medium"},  # 从中等推理开始
        extra_body={"verbosity": "medium"},
    )
    baseline = response.choices[0].message.content
    print(f"[Baseline] {baseline[:200]}...")
    
    # Step 2: 对每个 example 测试，找出失效场景
    failures = []
    for i, example in enumerate(examples):
        messages = [
            {"role": "user", "content": example["input"]}
        ]
        resp = client.chat.completions.create(
            model="gpt-5.5",
            messages=messages,
            reasoning={"effort": "medium"},
            extra_body={"verbosity": "medium"},
        )
        result = resp.choices[0].message.content
        if not example["expected"] in result:
            failures.append({
                "index": i,
                "input": example["input"][:100],
                "got": result[:200],
            })
    
    print(f"Failures: {len(failures)}/{len(examples)}")
    
    # Step 3: 针对每个失败场景，渐进式添加指令
    for failure in failures:
        # 先加 system prompt
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": failure["input"]},
        ]
        resp = client.chat.completions.create(
            model="gpt-5.5",
            messages=messages,
            reasoning={"effort": "high"},
            extra_body={"verbosity": "high"},
        )
        print(f"  Fix attempt: {resp.choices[0].message.content[:100]}...")
    
    return baseline, failures

# 使用示例
examples = [
    {
        "input": "Extract the user's name and email from: 'Hi, I'm Alice, alice@example.com'",
        "expected": "Alice",
    },
    {
        "input": "Extract the user's name and email from: 'Contact me at bob@test.org - Bob Smith'",
        "expected": "Bob",
    },
]

minimal_prompt_tuning("Extract name and email", examples)
`,
          filename: "gpt55_prompt_tuning.py",
        },
      ],
    },
    {
      title: "",
      body: `### **GPT-5**.5 独有的 Prompt 技巧`,
      code: [
        {
          lang: "python",
          code: `# GPT-5.5 长任务状态更新模式
# 适用于需要多步工具调用且耗时较长的场景
# OpenAI 官方推荐的用户体验优化技巧

import openai
from openai.types.chat import ChatCompletionMessageParam

client = openai.OpenAI()

def send_user_visible_update(update: str):
    """
    在工具调用前，发送简短用户可见更新。
    GPT-5.5 推荐的最佳实践：1-2 句话，确认请求并说明第一步。
    """
    print(f"🔄 {update}")

def agentic_task_with_updates(user_query: str):
    """
    多步任务 + 用户可见更新模式
    
    GPT-5.5 的 reasoning effort 支持 xhigh，
    但推理时间长会导致用户体验下降。
    这个模式通过在工具调用前发送更新来改善体验。
    """
    messages: list[ChatCompletionMessageParam] = [
        {
            "role": "user",
            "content": (
                f"Task: {user_query}\\n\\n"
                "Before making any tool calls for multi-step tasks, "
                "first send a short user-visible update that acknowledges "
                "the request and states the first step. Keep it to 1-2 sentences."
            )
        }
    ]
    
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=messages,
        reasoning={"effort": "xhigh"},  # GPT-5.5 新增 xhigh
        extra_body={"verbosity": "low"},  # 控制输出简洁度
        tools=[
            {
                "type": "function",
                "function": {
                    "name": "search_codebase",
                    "description": "Search the codebase for relevant files",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string"},
                            "file_pattern": {"type": "string"},
                        },
                        "required": ["query"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "run_command",
                    "description": "Execute a shell command",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "command": {"type": "string"},
                        },
                        "required": ["command"],
                    },
                },
            },
        ],
        parallel_tool_calls=True,
    )
    
    # 处理工具调用
    for tool_call in response.choices[0].message.tool_calls or []:
        send_user_visible_update(
            f"Executing: {tool_call.function.name}"
        )
        # ... 执行工具调用逻辑
    
    return response

# 测试：多步编码任务
agentic_task_with_updates(
    "Find all Python files that handle database connections "
    "and add connection pooling with SQLAlchemy"
)
`,
          filename: "gpt55_agentic_with_updates.py",
        },
      ],
      warning: "注意：GPT-5.5 的 verbosity 参数影响输出的详细程度。在 Agentic 场景中，建议使用 verbosity=low 来减少不必要的解释，专注于工具调用和执行。",
    },
    {
      title: "三、GPT-5.5 迁移指南：从 GPT-5.2/5.4 安全升级",
      body: `迁移到 **GPT-5**.5 不是简单的模型字符串替换。**OpenAI** 官方提供了专用技能和升级指南。以下是系统化的迁移流程。`,
      mermaid: `sequenceDiagram
    participant Dev as 开发者
    participant Old as GPT-5.2/5.4
    participant New as GPT-5.5
    participant Eval as 评估集
    
    Dev->>Old: 收集基线输出 (100 条)
    Old-->>Dev: 基线输出集
    Dev->>New: 相同输入测试
    New-->>Dev: 新输出集
    Dev->>Eval: 对比分析
    Eval-->>Dev: 差异报告
    alt 差异 < 5％
        Dev->>New: 直接切换 + 调优 Prompt
    else 差异 > 5％
        Dev->>Dev: 重建 Prompt 栈
        Dev->>New: 从最小 Prompt 开始
    end
    New-->>Dev: 调优后的结果
    Dev->>Eval: 最终评估
    Eval-->>Dev: 通过 → 上线`,
    },
    {
      title: "",
      body: `### 迁移检查清单`,
      table: {
        headers: ["检查项", "GPT-5.2 做法", "GPT-5.5 做法", "注意事项"],
        rows: [
          ["模型标识", "gpt-5.2", "gpt-5.5", "不要使用 gpt-5.5-codex，已不存在"],
          ["推理参数", "reasoning: {effort: 'high'}", "reasoning: {effort: 'xhigh'}", "xhigh 是 GPT-5.5 新增，延迟更高但质量更好"],
          ["冗长度控制", "无", "extra_body: {verbosity: 'low'}", "low 减少 30-50% 的输出 token"],
          ["图像细节", "image_detail: 'auto'", "image_detail: 'original'", "original 是 GPT-5.5 新增，保留图像原始分辨率"],
          ["系统提示词", "长系统提示词 (500+ 词)", "最小系统提示词 (50-100 词)", "GPT-5.5 对长系统提示词敏感度不同"],
          ["工具描述", "详细工具描述", "简洁工具描述 (50 词内)", "工具描述过长会干扰 GPT-5.5 的推理"],
          ["Codex 专用模式", "使用 gpt-5.2-codex", "使用 gpt-5.5 + agentic coding", "编码能力已统一，无需特殊模型"],
          ["提示词累积", "累积历史优化", "从零开始重新优化", "不要用 GPT-5.2 的提示词直接迁移"],
        ],
      },
    },
    {
      title: "四、GPT-5.5 实战：Agentic Coding 深度测试",
      body: `**GPT-5**.5 的核心卖点是 Agentic Coding —— 让模型自主完成多步编码任务。我们来做一次完整的实战测试。`,
      code: [
        {
          lang: "python",
          code: `# GPT-5.5 Agentic Coding 实战：自动重构项目
# 本脚本演示如何使用 GPT-5.5 的 agentic 能力自动重构代码库
# 需要: pip install openai pathlib

import openai
import os
from pathlib import Path

client = openai.OpenAI()

class CodeRefactoringAgent:
    """
    使用 GPT-5.5 自动执行代码重构任务
    
    GPT-5.5 的 agentic coding 能力让它可以：
    1. 理解整个代码库的结构
    2. 制定多步重构计划
    3. 自主执行每个步骤
    4. 验证重构结果
    """
    
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.history = []
    
    def analyze_project(self) -> str:
        """分析项目结构并生成重构建议"""
        files = []
        for ext in ['*.py', '*.ts', '*.js']:
            files.extend(self.project_path.rglob(ext))
        
        file_contents = {}
        for f in files[:20]:  # 限制文件大小
            try:
                file_contents[str(f.relative_to(self.project_path))] = f.read_text()[:3000]
            except:
                pass
        
        # 构建分析 prompt
        prompt = f"""You are analyzing a codebase for refactoring.

Project structure:
{chr(10).join(file_contents.keys())}

Key files:
{chr(10).join(f'=== {k} ==={chr(10)}{v[:500]}...' for k, v in list(file_contents.items())[:5])}

Identify 3-5 specific refactoring opportunities and create a step-by-step plan.
For each opportunity, specify:
1. Current problem
2. Proposed solution
3. Files to modify
4. Risk assessment"""
        
        response = client.chat.completions.create(
            model="gpt-5.5",
            messages=[{"role": "user", "content": prompt}],
            reasoning={"effort": "xhigh"},
            extra_body={"verbosity": "medium"},
        )
        
        return response.choices[0].message.content
    
    def execute_refactoring(self, plan: str, file_changes: dict[str, str]):
        """
        执行重构计划
        GPT-5.5 可以在一个 agentic loop 中完成：
        读取文件 → 修改代码 → 写回文件 → 验证
        """
        for filepath, new_content in file_changes.items():
            full_path = self.project_path / filepath
            print(f"📝 Modifying {filepath}")
            
            # 备份原文件
            backup = full_path.with_suffix(full_path.suffix + '.bak')
            if full_path.exists():
                backup.write_text(full_path.read_text())
            
            # 写入新内容
            full_path.write_text(new_content)
            self.history.append({
                "action": "modify",
                "file": filepath,
                "backup": str(backup),
            })
    
    def rollback(self):
        """回滚所有更改"""
        for entry in reversed(self.history):
            if entry["action"] == "modify":
                backup = Path(entry["backup"])
                if backup.exists():
                    target = self.project_path / entry["file"]
                    target.write_text(backup.read_text())
                    print(f"↩️ Rolled back {entry['file']}")
        
        self.history = []

# 使用示例
agent = CodeRefactoringAgent("./my-project")
analysis = agent.analyze_project()
print("=== Refactoring Analysis ===")
print(analysis)
`,
          filename: "gpt55_refactoring_agent.py",
        },
      ],
    },
    {
      title: "五、GPT-5.5 vs 竞品对比",
      body: `**GPT-5**.5 发布后，与 **Claude**、**Gemini**、Qwen 等主流模型的对比格局发生了哪些变化？`,
      table: {
        headers: ["能力维度", "GPT-5.5", "Claude Opus 4.7", "Gemini 2.5 Pro", "Qwen 3.6 Plus"],
        rows: [
          ["Agentic Coding", "★★★★★ 原生统一", "★★★★☆ 需 Claude Code", "★★★☆☆ 实验性", "★★★☆☆ 支持"],
          ["Computer Use", "★★★★★ 原生支持", "★★★★☆ 支持", "★★★☆☆ 有限支持", "★★☆☆☆ 不支持"],
          ["推理能力 (MATH)", "★★★★★ xhigh", "★★★★★ high", "★★★★★", "★★★★☆"],
          ["上下文窗口", "200K", "200K", "1M", "128K"],
          ["工具调用", "并行+嵌套+自主", "并行工具调用", "并行工具调用", "并行工具调用"],
          ["输出控制", "verbosity 参数", "无", "无", "无"],
          ["图像理解", "original 分辨率", "高", "极高", "高"],
          ["API 价格 (每 1M tokens)", "$15/$60", "$15/$75", "$7/$35", "较低"],
          ["编码专用模式", "已统一到主模型", "Claude Code 产品", "Gemini Code Assist", "通义灵码"],
        ],
      },
    },
    {
      title: "六、Simon Willison 的观察与深度解读",
      body: `知名 AI 观察者 Simon Willison 在 **GPT-5**.5 发布后迅速更新了 [LLM 工具](https://llm.datasette.io/) 并分享了使用体验。以下是他的核心观察：\n\n### 1. Prompt 策略的根本变化\n\nSimon 注意到 **OpenAI** 的建议——不要复用之前的 Prompt——在实际测试中得到了验证。他从 **GPT-5**.2/5.4 迁移到 **GPT-5**.5 时发现：\n- 之前精心调优的长系统提示词在 **GPT-5**.5 上表现反而不如简短提示词\n- **GPT-5**.5 对「暗示性」指令的理解更强，不需要详细解释「为什么」\n- 工具描述需要精简，否则模型会过度关注工具描述中的细节而忽略核心任务`,
      mermaid: `graph LR
    A["旧策略: 长系统提示词\
500+ 词详细指令"] -->|在 GPT-5.5 上| B["效果下降\
过度约束模型"]
    C["新策略: 最小有效提示词\
50-100 词核心指令"] -->|在 GPT-5.5 上| D["效果更好\
模型自主推理更强"]
    B -.->|建议改为| C
    D --> E["逐步增量调优\\而非全量迁移"]`,
    },
    {
      title: "七、总结与行动建议",
      body: `### 立即行动清单`,
      list: [
        "✅ 安装最新 SDK：\`pip install openai --upgrade\`，确保支持 gpt-5.5 模型标识符",
        "✅ 建立基线测试集：收集 50-100 条当前 GPT-5.2/5.4 的输入-输出对",
        "✅ 从最小 Prompt 开始：不要直接复用旧 Prompt，用最小的任务描述测试",
        "✅ 调整 verbosity：生产环境建议 verbosity=low，调试时用 medium",
        "✅ 升级推理级别：需要高质量输出时使用 reasoning: xhigh",
        "✅ 精简工具描述：每个工具描述控制在 50 词以内",
        "✅ 利用 Computer Use：如果有 GUI 自动化需求，测试 GPT-5.5 的 Computer Use 能力",
        "✅ 监控 token 用量：xhigh reasoning + high verbosity 可能显著增加成本",
      ],
      tip: "GPT-5.5 不是简单的升级，而是一个新的模型家族。用对待新模型的态度来调优它，而不是当作旧模型的 patch。",
    },
  ],
};

export default post;
