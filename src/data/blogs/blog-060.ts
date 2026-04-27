// Karpathy autoresearch 深度解析：AI 自主科研新范式

import type { BlogPost } from './blog-types';

export const blog: BlogPost = {
  id: "blog-060",
  author: "AI Master",
  title: "Karpathy autoresearch 深度解析：AI Agent 自主做科研，单 GPU overnight 训练出更好的模型",
  category: "aieng",
  tags: ["Karpathy", "autoresearch", "自主科研", "AI Agent", "nanochat", "实验自动化", "LLM 训练"],
  summary: "2026 年 3 月，Andrej Karpathy 开源 autoresearch 项目，让 AI Agent 自主运行研究实验。发布即登顶 GitHub Trending，总星 76,709。项目核心理念：研究者不再手写训练代码，而是编写 program.md 指导 AI Agent 自主实验——修改代码、训练 5 分钟、验证结果、保留或丢弃、循环迭代。本文将深入剖析 autoresearch 的架构设计、Agent 工作流、program.md 范式，并附完整的 Python 实战代码和复现指南。",
  date: "2026-04-27",
  readTime: 25,
content: [
    {
      title: "一、autoresearch 的诞生背景：为什么需要 AI 自主科研？",
      body: `## 传统 ML 研究的瓶颈

在传统的机器学习研究中，研究者需要手动完成以下循环：

1. **提出假设**：比如 "增大注意力头数可能提升模型性能"
2. **修改代码**：找到对应代码位置，修改超参数
3. **启动训练**：运行训练脚本，等待结果（可能需要数小时甚至数天）
4. **分析结果**：查看 loss 曲线、验证集准确率等指标
5. **记录实验**：手动记录配置和结果
6. **重复**：回到第 1 步，尝试下一个假设

**这个循环的核心问题是：人类在等待。**

训练过程中研究者几乎无事可做——等待 loss 下降、等待验证集评估、等待实验完成。如果一个训练 run 需要 30 分钟，而研究者一天只能手动发起 10-20 个实验，那绝大多数时间都在"等"。

## Karpathy 的洞察

Karpathy 在 Twitter/X 上多次表达过类似的观点：

> "如果 AI 已经可以写代码、理解代码、运行代码，为什么不让他自己跑实验？"

**autoresearch 的核心思想极简却革命性：**

- 研究者写一个 \`program.md\` 描述研究方向和约束
- AI Agent（如 Claude Code）读取 \`program.md\`
- Agent 自主修改代码、启动训练、评估结果、决定下一步
- 整个过程完全自动化，研究者只需在早上查看结果

## 与传统 AutoML 的本质区别

| 维度 | 传统 AutoML（如 Optuna） | autoresearch |
|------|----------------------|-------------|
| **搜索空间** | 预定义超参数范围 | Agent 自主探索任意代码修改 |
| **目标函数** | 单一指标优化（如准确率） | 多目标、主观判断、创新性尝试 |
| **修改范围** | 仅限超参数 | 可修改架构、训练逻辑、数据管道等任意代码 |
| **决策机制** | 算法（贝叶斯优化/遗传算法） | AI Agent 的推理与判断 |
| **人类参与** | 设计搜索空间后完全自动 | 编写 program.md 指导方向 |
| **创新性** | 在预设空间内搜索 | 可能发现人类未想到的方案 |

**关键洞察：** autoresearch 不是替代 AutoML，而是将其扩展到了**代码级自主探索**——Agent 不只是调超参数，而是可以修改模型架构、训练策略、甚至发明新的优化方法。`
    },
    {
      title: "二、架构解析：autoresearch 如何工作？",
      body: `## 整体架构图

\`\`\`mermaid
graph TB
    subgraph "研究者输入"
        A[program.md 研究方向描述]
    end
    
    subgraph "AI Agent 循环"
        B[AI Agent 读取 program.md]
        C[修改代码 src/*.py]
        D[启动训练 5 分钟短训练]
        E[评估结果 验证集指标]
        F{是否改进?}
    end
    
    subgraph "nanochat 框架"
        G[nanochat 轻量 LLM 训练框架]
        H[单 GPU 高效训练]
    end
    
    subgraph "输出"
        I[保留有效改动 commit & push]
        J[丢弃无效改动 git reset]
        K[生成实验报告]
    end
    
    A --> B
    B --> C
    C --> G
    G --> H
    H --> D
    D --> E
    E --> F
    F -->|是| I
    F -->|否| J
    I --> K
    J --> B
    B -->|继续探索| C
\`\`\`

## 三个核心文件

autoresearch 项目仅包含 3 个核心文件，这种极简设计是 Karpathy 一贯的风格：

### 1. \`program.md\` — 研究方向的"宪法"

这是研究者与 AI Agent 之间的唯一接口。研究者用自然语言描述：

- **研究目标**：想解决什么问题？
- **约束条件**：什么不能改？什么必须保留？
- **评估标准**：如何判断一个实验是否成功？
- **方向建议**：有哪些可能的探索方向？

### 2. \`train.py\` — nanochat 训练入口

基于 Karpathy 的 nanochat 框架（一个极简的 LLM 训练实现，约 300 行代码），提供：

- 数据加载和 tokenization
- 模型定义（nanoGPT 风格的 transformer）
- 训练循环（前向传播、反向传播、优化器步进）
- 验证集评估

### 3. \`main.py\` — Agent 工作流控制器

这是 autoresearch 的"大脑"，负责：

- 启动 AI Agent（通过 API 调用）
- 将 program.md 和当前代码状态传递给 Agent
- 接收 Agent 的代码修改
- 执行训练和评估
- 根据结果决定保留或回滚改动

## Agent 工作流详解

\`\`\`mermaid
sequenceDiagram
    participant R as Researcher
    participant P as program.md
    participant A as AI Agent
    participant T as train.py
    participant E as Evaluator
    
    R->>P: 编写研究方向
    loop 每次迭代
        A->>P: 读取 program.md
        A->>A: 推理下一步修改方案
        A->>T: 修改训练代码
        T->>T: 启动 5 分钟训练
        T->>E: 提交验证结果
        E->>E: 对比 baseline 性能
        alt 性能提升
            E->>A: 保留改动 ✓
            A->>A: 记录到实验日志
        else 性能下降
            E->>A: 回滚改动 ✗
            A->>A: 记录失败原因
        end
        A->>A: 基于结果规划下一步
    end
\`\`\`

**5 分钟训练的意义：**

- 不是要训练出最终模型，而是要快速验证"方向是否正确"
- 类似于人类研究者的"快速原型验证"
- 如果 5 分钟内 loss 没有明显下降趋势，基本可以判断这个方向不行
- 一晚（8 小时）可以跑约 96 个实验，是人类手动操作的 5-10 倍`
    },
    {
      title: "三、program.md 范式：如何写好 AI 研究指导文档？",
      body: `## program.md 的设计哲学

program.md 不是传统的实验计划书，而是一种**人机协作协议**。它需要同时满足：

1. **对人类友好**：研究者用自然语言描述意图
2. **对 Agent 友好**：Agent 能准确理解并执行
3. **足够灵活**：不限制 Agent 的创造性
4. **足够明确**：防止 Agent 做无意义的修改

## program.md 模板结构

一个好的 program.md 通常包含以下部分：

\`\`\`markdown
# Research Program: [研究主题]

## Objective
[用 1-2 句话描述研究目标]

## Constraints
- [不可修改的部分]
- [必须保持的约束]
- [资源限制]

## Evaluation Criteria
- [主要评估指标]
- [次要评估指标]
- [通过/失败阈值]

## Suggested Directions
1. [方向 1：简要说明]
2. [方向 2：简要说明]
3. [方向 3：简要说明]

## Notes
[任何额外的背景信息或提示]
\`\`\`

## 实战示例：优化 nanoGPT 的训练效率

\`\`\`markdown
# Research Program: 优化 nanoGPT 训练效率

## Objective
在保持模型质量（验证集 perplexity）的前提下，减少 nanoGPT 的训练时间和计算资源消耗。

## Constraints
- 不可修改：tokenizer、数据加载逻辑、验证集定义
- 必须保持：模型输出格式与 baseline 完全一致
- 资源限制：单张 NVIDIA A100，训练时间不超过 5 分钟/实验

## Evaluation Criteria
- 主要指标：验证集 perplexity（越低越好）
- 次要指标：训练速度（tokens/sec）
- 通过阈值：perplexity 不高于 baseline + 5%，且训练速度提升 > 10%

## Suggested Directions
1. 尝试不同的学习率调度策略（cosine annealing vs linear warmup）
2. 探索梯度累积步数的影响
3. 测试不同的优化器（AdamW vs Lion vs Sophia）
4. 尝试权重衰减的不同设置
5. 探索混合精度训练的影响

## Notes
- baseline perplexity: 12.5
- baseline 训练速度: 45,000 tokens/sec
- 每次实验后请记录具体修改和结果
- 如果连续 3 次实验都失败，请重新思考方向
\`\`\`

**写好 program.md 的关键技巧：**

1. **目标要具体可衡量**：不要说"让模型更好"，要说"验证集 perplexity 降低 5%"
2. **约束要明确**：清楚告诉 Agent 什么不能改，避免浪费实验次数
3. **方向要多样**：给出多个可能的探索方向，让 Agent 有选择空间
4. **设置合理的终止条件**：防止 Agent 在无效方向上无限循环
5. **留出创造性空间**：不要限制得太死，Agent 可能发现你意想不到的方案`
    },
    {
      title: "四、nanochat 框架：autoresearch 的训练引擎",
      body: `## 为什么选择 nanochat？

Karpathy 选择 nanochat 而非 PyTorch Lightning 或 HuggingFace Transformers，原因很明确：

1. **代码量极小**：约 300 行 Python 代码，Agent 可以完全理解每一行
2. **无隐藏魔法**：所有逻辑都是显式的，没有抽象层掩盖细节
3. **修改成本低**：Agent 修改代码时不容易引入隐蔽 bug
4. **训练速度快**：轻量框架开销小，5 分钟实验更高效

## nanochat 核心架构

\`\`\`mermaid
graph LR
    subgraph "数据层"
        A[Shakespeare 数据集]
        B[Tokenizer 字符级/子词级]
    end
    
    subgraph "模型层"
        C[NanoGPT Transformer]
        D[Embedding]
        E[Multi-Head Attention]
        F[Feed Forward]
    end
    
    subgraph "训练层"
        G[训练循环]
        H[AdamW 优化器]
        I[学习率调度]
    end
    
    subgraph "评估层"
        J[验证集 perplexity]
        K[生成样本]
    end
    
    A --> B
    B --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    G --> J
    G --> K
\`\`\`

## nanochat 与主流框架对比

| 特性 | nanochat | PyTorch Lightning | HuggingFace Transformers |
|------|---------|------------------|------------------------|
| 代码行数 | ~300 | ~10,000+ | ~100,000+ |
| Agent 可理解性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 修改灵活性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 功能丰富度 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 训练速度 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 适用场景 | 快速实验、AI 自主科研 | 标准训练流程 | 生产级模型训练 |

**关键洞察：** nanochat 不是要取代主流框架，而是为**AI 自主科研**场景量身定制——在这个场景下，"Agent 能理解并安全修改代码"比"功能丰富"更重要。`
    },
    {
      title: "五、Python 实战：本地复现 autoresearch",
      body: `## 环境准备

\`\`\`bash
# 创建虚拟环境
python -m venv autoresearch-env
source autoresearch-env/bin/activate

# 安装依赖
pip install torch numpy tiktoken

# 克隆项目
git clone https://github.com/karpathy/autoresearch.git
cd autoresearch
\`\`\`

## 步骤 1：准备 program.md

\`\`\`python
# create_program.py
program_md = """# Research Program: 探索 nanoGPT 的学习率调度策略

## Objective
找到最优的学习率调度策略，在 5000 步训练内达到最低的验证集 perplexity。

## Constraints
- 不可修改：模型架构（层数、头数、embed_dim）、数据预处理
- 必须保持：batch_size=64，sequence_length=256
- 每次实验训练步数：5000 步

## Evaluation Criteria
- 主要指标：验证集 perplexity（越低越好）
- 通过阈值：perplexity < 12.0（baseline 为 12.5）

## Suggested Directions
1. 尝试 cosine annealing 调度（T_max=5000）
2. 尝试线性 warmup + cosine decay（warmup 500 步）
3. 尝试恒定学习率 + 阶梯衰减
4. 尝试 OneCycleLR 调度
5. 尝试自定义调度：前期快降后期慢降

## Notes
- 初始学习率统一设为 3e-4
- 使用 AdamW 优化器，weight_decay=0.1
- 每次实验记录最终 perplexity 和训练曲线
"""

with open("program.md", "w") as f:
    f.write(program_md)
print("✅ program.md 创建成功")
\`\`\`

## 步骤 2：实现简化的 Agent 实验循环

\`\`\`python
# simple_experiment.py
import subprocess
import json
import os
import shutil

class AutoResearchExperiment:
    def __init__(self, program_path="program.md"):
        self.program = self.load_program(program_path)
        self.baseline_perf = None
        self.best_perf = float('inf')
        self.experiment_log = []
        
    def load_program(self, path):
        with open(path) as f:
            return f.read()
    
    def run_baseline(self):
        """运行 baseline 实验获取基准性能"""
        print("📊 运行 baseline 实验...")
        result = self.run_training({})
        self.baseline_perf = result['val_loss']
        print(f"   Baseline perplexity: {self.baseline_perf:.4f}")
        return result
    
    def run_training(self, modifications):
        """
        应用修改并运行训练
        
        modifications: 字典，包含要修改的参数
        例如: {'lr_scheduler': 'cosine', 'warmup_steps': 500}
        """
        # 保存原始代码
        shutil.copy2("train.py", "train.py.backup")
        
        # 应用修改
        self.apply_modifications(modifications)
        
        # 运行训练
        result = subprocess.run(
            ["python", "train.py", "--steps", "5000"],
            capture_output=True, text=True, timeout=600
        )
        
        # 解析结果
        perf = self.parse_results(result.stdout)
        
        # 恢复原始代码
        shutil.copy2("train.py.backup", "train.py")
        
        return {
            'modifications': modifications,
            'val_loss': perf['val_loss'],
            'train_time': perf['train_time'],
            'stdout': result.stdout
        }
    
    def apply_modifications(self, modifications):
        """根据修改字典更新 train.py"""
        with open("train.py", "r") as f:
            code = f.read()
        
        # 示例：修改学习率
        if 'learning_rate' in modifications:
            code = code.replace(
                'learning_rate = 3e-4',
                f'learning_rate = {modifications["learning_rate"]}'
            )
        
        # 示例：修改调度器
        if 'lr_scheduler' in modifications:
            scheduler_map = {
                'cosine': 'CosineAnnealingLR',
                'linear_warmup': 'LinearWarmupCosineDecay',
                'step': 'StepLR',
                'onecycle': 'OneCycleLR'
            }
            scheduler_name = scheduler_map.get(
                modifications['lr_scheduler'], 
                'CosineAnnealingLR'
            )
            # 这里需要根据实际 train.py 结构进行修改
        
        with open("train.py", "w") as f:
            f.write(code)
    
    def parse_results(self, stdout):
        """从训练输出中解析关键指标"""
        # 实际实现需要解析 nanochat 的输出格式
        # 这里是简化示例
        for line in stdout.split('\\n'):
            if 'val_loss' in line.lower():
                val_loss = float(line.split(':')[-1].strip())
                return {'val_loss': val_loss, 'train_time': 300}
        
        return {'val_loss': 999.0, 'train_time': 0}
    
    def run_experiment(self, name, modifications):
        """运行单个实验并记录结果"""
        print(f"\\n🔬 实验: {name}")
        print(f"   修改: {modifications}")
        
        result = self.run_training(modifications)
        improvement = (self.baseline_perf - result['val_loss']) / self.baseline_perf * 100
        
        status = "✅ 改进" if result['val_loss'] < self.baseline_perf else "❌ 退步"
        print(f"   结果: val_loss={result['val_loss']:.4f} ({improvement:+.2f}%) {status}")
        
        self.experiment_log.append({
            'name': name,
            'modifications': modifications,
            'val_loss': result['val_loss'],
            'improvement': improvement,
            'passed': result['val_loss'] < self.baseline_perf
        })
        
        if result['val_loss'] < self.best_perf:
            self.best_perf = result['val_loss']
            print(f"   🏆 新的最佳结果！")
        
        return result
    
    def generate_report(self):
        """生成实验报告"""
        print("\\n" + "="*60)
        print("📋 实验报告")
        print("="*60)
        
        passed = [e for e in self.experiment_log if e['passed']]
        failed = [e for e in self.experiment_log if not e['passed']]
        
        print(f"\\n总实验数: {len(self.experiment_log)}")
        print(f"成功: {len(passed)} | 失败: {len(failed)}")
        print(f"最佳 perplexity: {self.best_perf:.4f}")
        print(f"Baseline perplexity: {self.baseline_perf:.4f}")
        print(f"最佳改进: {(self.baseline_perf - self.best_perf) / self.baseline_perf * 100:+.2f}%")
        
        if passed:
            print("\\n✅ 成功的实验:")
            for e in sorted(passed, key=lambda x: x['val_loss']):
                print(f"  - {e['name']}: {e['val_loss']:.4f} ({e['improvement']:+.2f}%)")
                print(f"    修改: {e['modifications']}")

# 使用示例
if __name__ == "__main__":
    experiment = AutoResearchExperiment()
    
    # 运行 baseline
    experiment.run_baseline()
    
    # 运行系列实验
    experiments = [
        ("Cosine Annealing", {"lr_scheduler": "cosine"}),
        ("Linear Warmup + Cosine", {"lr_scheduler": "linear_warmup", "warmup_steps": 500}),
        ("Step Decay", {"lr_scheduler": "step", "step_size": 2000}),
        ("OneCycleLR", {"lr_scheduler": "onecycle"}),
        ("Higher LR + Cosine", {"learning_rate": 5e-4, "lr_scheduler": "cosine"}),
        ("Lower LR + Cosine", {"learning_rate": 1e-4, "lr_scheduler": "cosine"}),
    ]
    
    for name, mods in experiments:
        experiment.run_experiment(name, mods)
    
    # 生成报告
    experiment.generate_report()
\`\`\`

## 步骤 3：接入真实的 AI Agent

\`\`\`python
# agent_loop.py
import os
from openai import OpenAI  # 或使用 Anthropic、其他 API

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
)

def ask_agent(prompt, system_prompt=None):
    """向 AI Agent 发送请求"""
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    response = client.chat.completions.create(
        model="gpt-4o",  # 或 gpt-5.5 等
        messages=messages,
        max_tokens=4000,
        temperature=0.7
    )
    
    return response.choices[0].message.content

def run_autoresearch_cycle(program_md, current_code, experiment_history):
    """
    完整的 autoresearch 循环：
    1. Agent 读取 program.md 和历史结果
    2. Agent 决定下一步修改
    3. 执行修改并训练
    4. 评估结果
    5. 返回决策和结果
    """
    
    # 构建 prompt
    history_summary = ""
    for i, exp in enumerate(experiment_history[-5:]):  # 最近 5 次
        status = "✅" if exp['passed'] else "❌"
        history_summary += f"\\n实验 {i+1}: {exp['name']} {status}\\n"
        history_summary += f"  修改: {exp['modifications']}\\n"
        history_summary += f"  结果: perplexity={exp['val_loss']:.4f}\\n"
    
    prompt = f"""
{program_md}

## 当前代码状态
\`\`\`python
{current_code[:10000]}  # 截断避免 token 超限
\`\`\`

## 最近的实验历史
{history_summary}

## 请决定下一步
请分析以上信息，决定下一步应该尝试什么修改。
请严格按照以下 JSON 格式回复：

{{
  "analysis": "对当前情况的分析",
  "next_modification": {{
    "description": "修改的描述",
    "params": {{"参数名": "参数值"}}
  }},
  "reasoning": "为什么选择这个方向"
}}
"""
    
    system_prompt = """你是 Karpathy autoresearch 的 AI 研究助手。
你的任务是自主探索最优的机器学习训练配置。
请仔细分析 program.md 中的研究目标、约束条件和评估标准。
每次实验后，根据结果调整你的探索策略。
优先尝试有潜力但尚未测试的方向。"""
    
    response = ask_agent(prompt, system_prompt)
    return response
\`\`\`

## 步骤 4：完整的自主实验循环

\`\`\`python
# full_autoresearch.py
import json
import time

def main():
    # 加载 program.md
    with open("program.md") as f:
        program_md = f.read()
    
    # 加载当前代码
    with open("train.py") as f:
        current_code = f.read()
    
    experiment = AutoResearchExperiment()
    history = []
    
    # 运行 baseline
    baseline_result = experiment.run_baseline()
    history.append({
        'name': 'baseline',
        'modifications': {},
        'val_loss': baseline_result['val_loss'],
        'passed': True
    })
    
    # 自主实验循环（最多 20 次迭代）
    max_iterations = 20
    consecutive_failures = 0
    
    for i in range(max_iterations):
        print(f"\\n{'='*60}")
        print(f"🔄 自主实验循环 #{i+1}/{max_iterations}")
        print(f"连续失败次数: {consecutive_failures}")
        print(f"{'='*60}")
        
        # 获取 Agent 决策
        agent_response = run_autoresearch_cycle(
            program_md, current_code, history
        )
        
        try:
            decision = json.loads(agent_response)
        except json.JSONDecodeError:
            print("⚠️ Agent 返回格式错误，跳过本次迭代")
            continue
        
        print(f"\\n🤖 Agent 分析: {decision.get('analysis', 'N/A')}")
        print(f"🤖 Agent 决策: {decision.get('next_modification', {}).get('description', 'N/A')}")
        print(f"🤖 Agent 推理: {decision.get('reasoning', 'N/A')}")
        
        # 执行实验
        mods = decision.get('next_modification', {}).get('params', {})
        result = experiment.run_experiment(
            f"Agent_Iteration_{i+1}",
            mods
        )
        
        history.append({
            'name': f"Agent_Iteration_{i+1}",
            'modifications': mods,
            'val_loss': result['val_loss'],
            'passed': result['val_loss'] < baseline_result['val_loss']
        })
        
        # 更新连续失败计数
        if result['val_loss'] >= baseline_result['val_loss']:
            consecutive_failures += 1
        else:
            consecutive_failures = 0
        
        # 如果连续失败 5 次，暂停让 Agent 重新思考
        if consecutive_failures >= 5:
            print("\\n⚠️ 连续 5 次失败，Agent 需要重新评估策略...")
            # 可以在这里添加额外的 prompt 让 Agent 反思
        
        # 间隔等待（模拟真实场景）
        time.sleep(2)
    
    # 最终报告
    experiment.generate_report()
    
    # 保存完整实验日志
    with open("experiment_log.json", "w") as f:
        json.dump(history, f, indent=2)
    print("\\n✅ 实验日志已保存到 experiment_log.json")

if __name__ == "__main__":
    main()
\`\`\`

## 运行效果预期

成功运行后，你会看到类似以下的输出：

\`\`\`
📊 运行 baseline 实验...
   Baseline perplexity: 12.5000

============================================================
🔄 自主实验循环 #1/20
连续失败次数: 0
============================================================

🤖 Agent 分析: Baseline 使用默认学习率调度，尚未尝试过任何优化策略。
   首先尝试 cosine annealing 调度，这是文献中最常用的调度方式。
🤖 Agent 决策: 使用 Cosine Annealing 学习率调度
🤖 Agent 推理: Cosine annealing 在训练后期逐渐降低学习率，
   有助于模型收敛到更优的局部最小值。

🔬 实验: Agent_Iteration_1
   修改: {'lr_scheduler': 'cosine'}
   结果: val_loss=11.8234 (+5.41%) ✅ 改进
   🏆 新的最佳结果！
\`\`\``
    },
    {
      title: "六、autoresearch 的局限性与适用场景",
      body: `## 局限性

### 1. 5 分钟训练的"短视"问题

5 分钟训练只能验证**方向**是否正确，不能验证**幅度**是否正确。某些修改可能在 5 分钟内看不出效果，但长期训练后会有显著提升。

**缓解策略：**
- 对 promising 的方向进行更长时间的验证训练
- 使用 learning curve extrapolation 技术预测长期表现
- 设置"二次验证"阶段：Agent 发现好方向后自动安排长训练

### 2. Agent 的创造性边界

当前的 AI Agent 擅长在已知方案空间内搜索，但很难提出**真正创新的**方法。Agent 的"创造力"受限于其训练数据中已有的知识。

**缓解策略：**
- 在 program.md 中鼓励"非常规"尝试
- 结合多个 Agent 的交叉验证
- 定期引入人类研究者的新想法

### 3. 代码修改的安全性

Agent 可能做出"看似合理但实际有害"的代码修改，比如：
- 修改了随机种子导致结果不可复现
- 引入了数据泄露
- 改变了评估指标的计算方式

**缓解策略：**
- 在 program.md 中明确禁止的修改类型
- 添加自动代码审查步骤
- 使用版本控制确保每次修改都可追溯

### 4. 计算资源成本

虽然单次训练只有 5 分钟，但一晚 96 次实验仍然需要可观的 GPU 时间。

**缓解策略：**
- 使用云 GPU 的竞价实例降低成本
- 在 CPU 上预筛选明显不好的方向
- 优先探索最有潜力的方向

## 适用场景

\`\`\`mermaid
graph TD
    A{autoresearch 适用性评估}
    
    A --> B[✅ 适合的场景]
    A --> C[⚠️ 需谨慎的场景]
    A --> D[❌ 不适合的场景]
    
    B --> B1[超参数空间探索]
    B --> B2[训练策略对比]
    B --> B3[架构微调]
    B --> B4[数据增强方法搜索]
    B --> B5[损失函数变体实验]
    
    C --> C1[需要领域专业知识的设计]
    C --> C2[大规模分布式训练]
    C --> C3[安全关键型系统]
    
    D --> D1[全新架构发明]
    D --> D2[需要数学证明的理论研究]
    D --> D3[涉及伦理/安全的决策]
\`\`\`

### ✅ 最佳适用场景

1. **超参数空间探索**：当你知道大致方向但不确定最优参数时
2. **训练策略对比**：比较不同的学习率调度、优化器、正则化方法
3. **架构微调**：在已知架构基础上微调层数、头数、embed_dim 等
4. **数据增强搜索**：自动发现最有效的数据增强组合
5. **损失函数变体**：尝试不同的损失函数组合和权重

### ⚠️ 需谨慎的场景

1. **需要领域专业知识的设计**：Agent 可能做出技术上可行但不符合领域常识的修改
2. **大规模分布式训练**：5 分钟训练无法验证分布式训练的正确性
3. **安全关键型系统**：医疗、自动驾驶等领域需要更严格的验证

### ❌ 不适合的场景

1. **全新架构发明**：Transformer 级别的创新仍需人类研究者
2. **需要数学证明的理论研究**：Agent 无法进行数学推导和证明
3. **涉及伦理/安全的决策**：这类决策必须有人类参与

## 未来展望

autoresearch 代表了 AI 研究方法论的一次范式转移。随着 AI Agent 能力的提升，我们可能会看到：

1. **更长周期的自主实验**：从 5 分钟扩展到数小时甚至数天的自主实验
2. **多 Agent 协作研究**：多个 Agent 分工合作，一个负责提出假设，一个负责实验，一个负责分析
3. **跨领域知识迁移**：Agent 将其他领域的成功经验迁移到当前研究中
4. **论文自动生成**：从实验结果到论文撰写的端到端自动化

**但最核心的价值不在于"替代人类研究者"，而在于"放大人类研究者的能力"**——让研究者把精力集中在提出好问题上，而把验证问题的任务交给 AI。`
    },
    {
      title: "七、总结与实战建议",
      body: `## 核心要点回顾

1. **autoresearch 的本质**：不是自动化实验工具，而是**AI 与人类研究者的协作协议**
2. **program.md 是关键**：写好 program.md 决定了实验的质量和方向
3. **5 分钟训练是权衡**：在探索速度和验证可靠性之间找到平衡
4. **nanochat 是基石**：极简代码让 Agent 能够安全地修改和理解代码
5. **局限性要明确**：autoresearch 不是万能的，它最适合超参数和策略搜索

## 给你的实战建议

### 入门路径

\`\`\`
Step 1: 运行 nanochat baseline → 理解框架和训练流程
Step 2: 手动修改 2-3 个参数 → 熟悉代码结构
Step 3: 编写第一个 program.md → 从简单目标开始
Step 4: 运行简单的 Agent 循环 → 验证端到端流程
Step 5: 逐步增加实验复杂度 → 扩展探索空间
\`\`\`

### program.md 编写 Checklist

- [ ] 目标是否具体可衡量？
- [ ] 约束是否清晰明确？
- [ ] 评估标准是否合理？
- [ ] 建议方向是否足够多样？
- [ ] 是否留出了创造性空间？
- [ ] 是否设置了合理的终止条件？

### 常见问题

**Q: 我应该用哪个 AI Agent？**
A: 当前 Claude Code、GPT-4o、Gemini CLI 都可以。Claude Code 在代码理解和修改方面表现最佳。

**Q: 5 分钟训练真的够吗？**
A: 对于验证方向是否足够。如果方向 promising，应该安排更长时间的验证训练。

**Q: Agent 修改代码安全吗？**
A: 有风险。建议：① 在 program.md 中明确禁止的修改；② 使用 git 版本控制；③ 关键实验后人工审查。

**Q: 计算成本大概多少？**
A: 以 A100 为例，一晚 96 次实验约需 8 GPU 小时，成本约 $2-4。使用竞价实例可进一步降低。

## 相关资源

| 资源 | 链接 | 说明 |
|------|------|------|
| autoresearch 仓库 | github.com/karpathy/autoresearch | 官方代码仓库，76K+ stars |
| nanochat 框架 | github.com/karpathy/nanochat | Karpathy 的极简 LLM 训练框架 |
| Karpathy 的演讲 | 多个 YouTube 视频 | Karpathy 关于 AI 自主科研的思考 |
| MCP 工具集成 | ai-master.cc/tools | 在工具页查找 autoresearch |

---

*本文完整覆盖了 Karpathy autoresearch 的原理、架构、实战代码和局限性分析。希望帮助你理解这一 AI 自主科研的新范式，并能在自己的研究工作中应用。*`
    }
  ]
};
