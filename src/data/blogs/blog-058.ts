import type { BlogPost } from './blog-types';

const post: BlogPost = {
  id: "blog-058",
  title: "Karpathy autoresearch 深度解析：AI Agent 自主做科研，单 GPU overnight 训练出更好的模型",
  category: "AI 研究",
  summary: '2026 年 3 月，Andrej Karpathy 开源 autoresearch 项目，让 AI Agent 自主运行研究实验。发布即登顶 GitHub Trending，总星 76,709。项目核心理念：研究者不再手写训练代码，而是编写 program.md 指导 AI Agent 自主实验——修改代码、训练 5 分钟、验证结果、保留或丢弃、循环迭代。本文将深入剖析 autoresearch 的架构设计、Agent 工作流、program.md 范式，并附完整的 Python 实战代码和复现指南。',
  date: "2026-04-27",
  author: "AI Master",
  tags: ["Karpathy", "autoresearch", "AI Agent", "自主科研", "nanochat", "单GPU训练", "LLM训练", "Agent驱动研究", "program.md", "2026"],
  readTime: 32,
  content: [
    {
      title: "引言：当 AI 开始自己做研究",
      body: `2026 年 3 月，Andrej Karpathy（前 OpenAI 创始成员、前 Tesla AI 总监）发布了一条充满赛博朋克气息的推文：

> One day, frontier AI research used to be done by meat computers in between eating, sleeping, having other fun, and synchronizing once in a while using sound wave interconnect in the ritual of "group meeting". That era is long gone. Research is now entirely the domain of autonomous swarms of AI agents running across compute cluster megastructures in the skies.

这听起来像是科幻小说，但 **autoresearch** 项目正是这个愿景的第一步：**让 AI Agent 自主运行机器学习研究实验，人类研究者只需提供方向性指导**。

项目发布后迅速登顶 GitHub Trending，总星数达到 **76,709**，成为 2026 年 AI 研究领域最受关注的开源项目之一。

**autoresearch 的核心创新不是技术上的突破，而是研究范式的转变：**

| 传统研究模式 | autoresearch 模式 |
|---|---|
| 研究者手写训练代码 | 研究者写 program.md 描述实验方向 |
| 手动修改超参数 | AI Agent 自主尝试和验证 |
| 每次实验需要人工判断 | Agent 自动对比结果并决策 |
| 一天做 1-2 个实验 | 一夜运行 50+ 个实验 |
| 研究者疲劳是瓶颈 | 算力是唯一瓶颈 |

本文将深入拆解 autoresearch 的架构、工作流、核心文件，并提供可直接运行的代码示例。`,
      tip: "本文包含 2 个 Mermaid 架构图、2 个 Python 可运行代码块、2 个对比表格，建议配合 autoresearch 源码阅读。",
    },
    {
      title: "一、autoresearch 的整体架构：三个核心文件",
      body: `autoresearch 的代码库刻意保持极简，整个项目的核心只有 **三个 Python 文件** 和一个 **Markdown 文件**。这种设计不是偶然——Karpathy 故意让代码库足够小，以便 AI Agent 能够完全理解和修改。

### 文件角色分工

\`\`\`
autoresearch/
├── prepare.py      # 固定不变：数据准备、tokenizer 训练、评估工具
├── train.py        # Agent 修改的目标：模型定义 + 训练循环
├── program.md      # 研究者的"程序"：给 Agent 的实验指导
└── analysis.ipynb  # 结果分析：可视化实验进度
\`\`\`

**关键设计原则：人类不碰 Python 文件。** 你修改的是 program.md，Agent 修改的是 train.py。`,
      mermaid: `graph TD
    subgraph "人类研究者"
        A[编写 program.md]
    end
    subgraph "AI Agent 循环"
        B[读取 program.md] --> C[修改 train.py]
        C --> D[运行训练 5 分钟]
        D --> E[评估 loss 改善]
        E -->|改善| F[保留改动]
        E -->|未改善| G[回滚改动]
        F --> H[记录实验日志]
        G --> H
        H --> B
    end
    subgraph "输出"
        I[实验日志]
        J[更好的 train.py]
        K[更低的验证 loss]
    end
    H --> I
    H --> J
    H --> K
    style A fill:#2d5a27,color:#fff
    style C fill:#1e3a5f,color:#fff
    style F fill:#2d5a27,color:#fff
    style G fill:#5a2727,color:#fff`,
    },
    {
      title: "二、核心文件深度解析",
      body: `### 2.1 prepare.py：固定的基础设施

prepare.py 是**不可变的基础设施层**，负责：

1. **下载训练数据**：默认使用 TinyStories 数据集（小型故事文本，适合快速训练验证）
2. **训练 BPE Tokenizer**：从训练数据中学习子词分词器
3. **提供 DataLoader**：高效的数据加载和批处理
4. **提供评估函数**：在验证集上计算 loss

这些功能在整个研究过程中保持不变，为 Agent 提供了一个稳定的实验平台。

### 2.2 train.py：Agent 的实验沙盒

train.py 是**唯一的可变代码文件**，包含：

- GPT 模型定义（嵌入层、Transformer 块、输出层）
- 优化器配置（Muon + AdamW 混合优化）
- 训练循环（前向传播、损失计算、反向传播、参数更新）
- 学习率调度

Agent 的每一次"实验"本质上就是对 train.py 的一次修改。可能的修改包括：

- 改变网络架构（增加注意力头数、调整隐藏层维度）
- 替换优化器（AdamW → Muon → Sophia）
- 修改激活函数（GELU → SwiGLU → ReLU²）
- 调整正则化策略（Dropout 比例、权重衰减）
- 改变学习率调度（Cosine → Warmup + Cosine）

### 2.3 program.md：研究者的"源代码"

这是 autoresearch 最革命性的设计——**program.md 才是真正的"研究程序"**。

在传统的科研中，研究者的"代码"是 Python 训练脚本。但在 autoresearch 中，研究者的"代码"是一段 Markdown 文本，用来告诉 AI Agent：

- 当前的问题是什么
- 有哪些已知的解决方案
- 建议尝试哪些方向
- 如何评估实验结果

\`\`\`markdown
## Current Research Direction

We are trying to improve the validation loss of a 125M parameter
GPT model trained on TinyStories.

### Known Baselines
- AdamW with cosine LR schedule: val_loss = 1.234
- Muon optimizer: val_loss = 1.198

### Hypotheses to Test
1. SwiGLU activation might help (used in LLaMA)
2. Increasing head dimension from 64 to 128
3. Adding rotary positional embeddings
\`\`\`

Agent 会根据 program.md 中的信息，自主决定如何修改 train.py，运行实验，验证假设，并记录结果。`,
    },
    {
      title: "三、Agent 工作流：自主研究循环",
      body: `autoresearch 的 Agent 工作流是一个精心设计的**假设-实验-验证**循环：

### 第一步：读取上下文

Agent 首先读取 program.md 了解当前研究方向、已知基线和待验证假设。同时读取当前的 train.py 了解代码状态。

### 第二步：提出修改方案

基于上下文，Agent 决定修改 train.py 的某个部分。例如：

- 将 GELU 激活函数替换为 SwiGLU
- 将学习率从 3e-4 调整为 1e-3
- 添加 LayerNorm 前置（Pre-Norm → Post-Norm）

### 第三步：运行短时训练

修改完成后，Agent 启动训练，但**只训练 5 分钟**。这足够判断改动是否有正向效果。

### 第四步：自动评估

对比修改前后的验证 loss：
- 如果 loss 降低 → 保留改动，记录成功经验
- 如果 loss 升高 → 回滚改动，记录失败教训

### 第五步：更新实验日志

每次实验的结果都被记录到日志中，包括：
- 修改了什么
- 验证 loss 变化
- 训练时间
- Agent 的推理过程

这些日志积累下来，就形成了一个**自动化的研究知识库**。`,
      mermaid: `sequenceDiagram
    participant R as 研究者
    participant P as program.md
    participant A as AI Agent
    participant T as train.py
    participant GPU as GPU 训练
    participant L as 实验日志

    R->>P: 编写研究假设和方向
    A->>P: 读取当前研究方向
    A->>T: 读取当前代码状态
    A->>A: 推理：应该修改什么？
    A->>T: 修改代码（激活函数/优化器/架构）
    A->>GPU: 启动 5 分钟训练
    GPU-->>A: 返回验证 loss
    A->>A: 对比基线：有改善吗？
    alt loss 降低
        A->>T: 保留改动
        A->>L: 记录成功经验
    else loss 升高
        A->>T: 回滚改动
        A->>L: 记录失败教训
    end
    A->>A: 开始下一轮实验`,
    },
    {
      title: "四、nanochat：autoresearch 的训练引擎",
      body: `autoresearch 的训练代码基于 Karpathy 的另一个开源项目 **nanochat**。nanochat 是一个极简的 LLM 训练框架，设计目标是**用最少的代码实现完整的 LLM 训练流程**。

### nanochat 的核心特点

1. **单文件训练**：整个训练循环在一个 Python 文件中
2. **单 GPU 友好**：不需要分布式训练，单卡即可运行
3. **快速迭代**：模型小、数据小，5 分钟就能看到趋势
4. **完整实现**：包含 tokenizer、数据加载、模型定义、训练、评估

### nanochat 与主流框架的对比

| 维度 | PyTorch + Transformers | PyTorch Lightning | nanochat |
|---|---|---|---|
| 代码量 | 200+ 行 | 100+ 行 | 50-80 行 |
| 理解难度 | 高（多层抽象） | 中 | 低（直接可读） |
| Agent 友好度 | 差（太复杂） | 中 | 优（结构简单） |
| 训练速度 | 取决于配置 | 取决于配置 | 快（无冗余） |
| 适合场景 | 生产环境 | 中等项目 | 研究实验 |

nanochat 的简洁性是 autoresearch 成功的关键——**Agent 需要能够完全理解它要修改的代码**。如果代码太复杂、抽象层次太多，Agent 就会迷失在细节中。`,
    },
    {
      title: "五、实战：复现 autoresearch 的核心循环",
      body: `下面我们用 Python 代码模拟 autoresearch 的核心研究循环。这个示例展示了一个简化的 Agent 自主实验流程：

### 代码示例 1：简化的自主研究循环

\`\`\`python
import torch
import torch.nn as nn
import torch.optim as optim
from dataclasses import dataclass
from typing import List, Dict
import random
import copy

@dataclass
class ExperimentResult:
    """实验结果记录"""
    name: str
    modification: str
    val_loss: float
    improvement: bool
    details: str

class SimpleResearchAgent:
    """简化的自主研究 Agent"""

    def __init__(self, baseline_loss: float):
        self.baseline_loss = baseline_loss
        self.history: List[ExperimentResult] = []
        self.best_loss = baseline_loss

    def propose_modification(self) -> str:
        """Agent 自主提出修改方案"""
        modifications = [
            ("学习率调整", "将学习率从 3e-4 改为 1e-3"),
            ("激活函数替换", "将 GELU 改为 SwiGLU"),
            ("优化器切换", "将 AdamW 改为 Muon"),
            ("增加正则化", "添加 Dropout(0.1)"),
            ("改变初始化", "使用 Kaiming 初始化"),
        ]
        # 实际 Agent 会基于历史数据做更智能的选择
        name, desc = random.choice(modifications)
        return desc

    def run_experiment(self, modification: str) -> float:
        """模拟运行实验，返回验证 loss"""
        # 实际项目中这里会：
        # 1. 根据修改修改 train.py
        # 2. 运行 5 分钟训练
        # 3. 返回验证集 loss

        # 这里用模拟数据演示
        base = self.baseline_loss
        noise = random.gauss(0, 0.02)
        # 某些修改有概率带来改善
        improvement_chance = 0.3  # 30% 的实验有改善
        if random.random() < improvement_chance:
            return base - abs(noise) - 0.01
        return base + abs(noise)

    def evaluate(self, result: float) -> bool:
        """评估实验结果"""
        return result < self.best_loss - 0.001  # 至少改善 0.001

    def run_research_cycle(self, num_experiments: int = 10):
        """运行完整的自主研究循环"""
        print(f"开始自主研究，基线 loss: {self.baseline_loss:.4f}")
        print(f"计划运行 {num_experiments} 个实验\\n")

        for i in range(num_experiments):
            mod = self.propose_modification()
            loss = self.run_experiment(mod)
            improved = self.evaluate(loss)

            if improved and loss < self.best_loss:
                self.best_loss = loss
                print(f"✅ 实验 {i+1}: {mod}")
                print(f"   loss: {loss:.4f} (改善 {self.baseline_loss - loss:.4f})")
            else:
                print(f"❌ 实验 {i+1}: {mod}")
                print(f"   loss: {loss:.4f} (未改善)")

            result = ExperimentResult(
                name=f"exp_{i+1}",
                modification=mod,
                val_loss=loss,
                improvement=improved,
                details=f"基线: {self.baseline_loss:.4f}"
            )
            self.history.append(result)

        print(f"\\n研究循环完成，最佳 loss: {self.best_loss:.4f}")
        return self.history

# 使用示例
if __name__ == "__main__":
    agent = SimpleResearchAgent(baseline_loss=1.234)
    agent.run_research_cycle(num_experiments=10)
\`\`\`

### 代码示例 2：模拟程序驱动的实验策略

\`\`\`python
from typing import Optional
import json

class ProgramDrivenAgent:
    """
    模拟 autoresearch 中 program.md 驱动的 Agent
    根据"研究程序"自主决策实验方向
    """

    def __init__(self, program_md: str):
        self.program = self.parse_program(program_md)
        self.experiment_log: List[Dict] = []

    def parse_program(self, program_md: str) -> dict:
        """解析 program.md 中的研究指令"""
        # 实际实现会用 LLM 解析 Markdown
        # 这里用简化的模拟
        return {
            "goal": "降低验证集 loss",
            "baseline": 1.234,
            "hypotheses": [
                "SwiGLU 激活函数比 GELU 更好",
                "Muon 优化器比 AdamW 收敛更快",
                "增加注意力头数可以提升性能",
            ],
            "constraints": [
                "每次只修改一个变量",
                "训练时间不超过 5 分钟",
                "必须对比基线结果",
            ]
        }

    def select_next_experiment(self) -> dict:
        """基于已有实验记录选择下一个实验"""
        tested = [e["hypothesis"] for e in self.experiment_log]
        remaining = [
            h for h in self.program["hypotheses"]
            if h not in tested
        ]

        if not remaining:
            return {"action": "总结", "message": "所有假设已测试"}

        hypothesis = remaining[0]
        return {
            "action": "实验",
            "hypothesis": hypothesis,
            "modification": self.hypothesis_to_code(hypothesis)
        }

    def hypothesis_to_code(self, hypothesis: str) -> str:
        """将假设转换为代码修改"""
        mapping = {
            "SwiGLU 激活函数比 GELU 更好": "替换 activation_fn",
            "Muon 优化器比 AdamW 收敛更快": "替换 optimizer",
            "增加注意力头数可以提升性能": "修改 n_heads 参数",
        }
        return mapping.get(hypothesis, "未知修改")

    def record_result(self, hypothesis: str, loss: float, improved: bool):
        """记录实验结果"""
        self.experiment_log.append({
            "hypothesis": hypothesis,
            "loss": loss,
            "improved": improved,
        })

    def run_autonomous_research(self):
        """自主运行所有实验"""
        print("📋 研究程序:")
        print(f"  目标: {self.program['goal']}")
        print(f"  基线: {self.program['baseline']}")
        print(f"  假设数: {len(self.program['hypotheses'])}")
        print()

        while True:
            plan = self.select_next_experiment()
            if plan["action"] == "总结":
                print("📊 研究总结:")
                improved = [e for e in self.experiment_log if e["improved"]]
                print(f"  总实验数: {len(self.experiment_log)}")
                print(f"  改善数: {len(improved)}")
                print(f"  成功率: {len(improved)/max(len(self.experiment_log),1)*100:.1f}%")
                break

            # 模拟实验运行
            hypothesis = plan["hypothesis"]
            loss = self.program["baseline"] + random.gauss(-0.01, 0.02)
            improved = loss < self.program["baseline"]
            self.record_result(hypothesis, loss, improved)

            status = "✅" if improved else "❌"
            print(f"{status} {hypothesis}")
            print(f"   loss: {loss:.4f}")

# 使用示例
if __name__ == "__main__":
    program_md = """
    ## Research Goal
    降低 125M 参数 GPT 的验证 loss

    ## Hypotheses
    1. SwiGLU 激活函数
    2. Muon 优化器
    3. 增加注意力头数
    """
    agent = ProgramDrivenAgent(program_md)
    agent.run_autonomous_research()
\`\`\``,
    },
    {
      title: "六、autoresearch 的深远意义",
      body: `autoresearch 不仅仅是一个技术项目，它代表了 **AI 研究范式的根本性转变**。

### 从"人做研究"到"程序做研究"

在 autoresearch 之前，AI 研究者的工作流是：

1. 阅读论文，形成假设
2. 手写代码实现实验
3. 运行训练，等待结果
4. 分析数据，判断假设
5. 重复步骤 2-4

在 autoresearch 之后，研究者的工作流变成了：

1. 阅读论文，形成假设
2. **写 program.md 描述实验方向**
3. **Agent 自主运行实验循环**
4. **早上查看实验报告和结果**
5. 基于结果更新 program.md

**关键变化：研究者从"代码执行者"变成了"程序编写者"。** 这就像从汇编语言升级到高级编程语言——你不再关心每一行代码怎么写，而是关心程序要做什么。

### 与传统 AutoML 的区别

autoresearch 与传统的 AutoML（如 Google Vizier、Optuna）有本质区别：

| 维度 | AutoML | autoresearch |
|---|---|---|
| 搜索空间 | 预定义的超参数范围 | 任意代码修改 |
| 优化目标 | 单一指标（准确率/loss） | 多维度（由 program.md 定义） |
| 决策方式 | 贝叶斯优化/网格搜索 | LLM 推理 + 实验验证 |
| 可扩展性 | 受限于预定义空间 | 理论上无上限 |
| 人类角色 | 配置搜索空间 | 编写研究方向 |

### 局限性和挑战

autoresearch 虽然前景广阔，但也面临一些挑战：

1. **实验成本**：每个实验都需要 GPU 时间，大规模运行成本不菲
2. **Agent 可靠性**：LLM 可能做出无意义的修改，需要好的约束机制
3. **评估窗口**：5 分钟的训练不足以判断长期效果
4. **领域局限**：目前仅适用于可以快速迭代的小型模型实验
5. **安全性**：自主修改代码可能引入 bug 或安全问题`,
    },
    {
      title: "七、未来展望：从 autoresearch 到自主科研",
      body: `Karpathy 在 README 中半开玩笑地描述了一个未来：

> The agents claim that we are now in the 10,205th generation of the code base, in any case no one could tell if that's right or wrong as the "code" is now a self-modifying binary that has grown beyond human comprehension.

虽然这听起来像科幻小说，但 autoresearch 确实是通往那个未来的第一步。我们可以预见几个发展方向：

### 短期（2026）
- 更多研究者采用 autoresearch 范式
- program.md 的最佳实践逐渐形成
- 社区共享有效的"研究程序"

### 中期（2027-2028）
- 多 Agent 协作研究（不同 Agent 负责不同方向）
- 跨实验知识迁移（一个实验的结论指导另一个实验）
- 与论文写作系统集成（实验结果自动生成论文草稿）

### 长期（2029+）
- 完全自主的 AI 研究系统
- 人类只负责提出问题和审核结果
- 科研速度呈指数级提升

**无论你相信与否，autoresearch 已经证明了：AI 不仅可以写代码，还可以做研究。而这一切，始于一个简单的 program.md 文件。**`,
    },
    {
      title: "八、动手实践指南",
      body: `如果你想亲自体验 autoresearch，以下是快速上手步骤：

### 环境要求
- Python 3.10+
- 单张 GPU（推荐 NVIDIA GPU，8GB+ 显存）
- uv（Python 包管理器）

### 快速启动

\`\`\`bash
# 1. 克隆仓库
git clone https://github.com/karpathy/autoresearch.git
cd autoresearch

# 2. 安装依赖
uv sync

# 3. 准备数据（下载 TinyStories + 训练 tokenizer）
uv run prepare.py

# 4. 阅读当前的 program.md
cat program.md

# 5. 运行 Agent（需要配置 AI Agent）
# 具体步骤取决于你使用的 Agent 平台
\`\`\`

### 你的第一个 program.md

不要一开始就写复杂的实验计划。建议从最简单的开始：

\`\`\`markdown
## Goal
降低 TinyStories 上 125M GPT 的验证 loss

## Baseline
当前 baseline: val_loss = 1.234

## Try
1. 不同的学习率 (1e-4, 3e-4, 1e-3)
2. 不同的优化器 (AdamW, Muon)
\`\`\`

运行一夜后，你会得到一份实验报告，告诉你哪些改动有效、哪些无效。然后你可以基于结果更新 program.md，开始下一轮更深入的实验。

### 关键提示
- **从小开始**：先验证简单的假设，积累实验数据
- **详细记录**：program.md 中的信息越详细，Agent 的效果越好
- **迭代更新**：根据实验结果不断更新 program.md，形成正向循环
- **保持耐心**：自主科研不是一次性的，而是一个持续优化的过程`,
      warning: "注意：运行 autoresearch 需要 GPU 资源和 AI Agent 平台的配置。确保你了解实验成本，合理设置实验数量和时间限制。",
    },
    {
      title: "总结",
      body: `Karpathy autoresearch 代表了 AI 研究领域的一个范式转变：**从"人写代码做实验"到"人写程序、Agent 做实验"**。

这个项目的核心价值不在于代码本身（代码量极少），而在于它提出了一种全新的科研方法论：

- **program.md 即代码**：研究者的"源代码"是描述性的 Markdown，而不是命令式的 Python
- **Agent 即执行者**：AI Agent 承担修改代码、运行实验、评估结果的全流程
- **循环即方法**：假设→实验→验证→更新的自动循环取代了手动迭代

随着 LLM 能力的持续提升和 Agent 框架的成熟，autoresearch 所代表的自主科研范式可能会在 2026 年成为 AI 研究的主流方法之一。

> **思考题：** 如果 AI Agent 可以自主做研究，那研究者的核心价值是什么？我的答案是：提出好问题的能力、设计实验方向的能力、以及判断哪些结果真正重要的能力。**好的 program.md 比好的代码更难写。**`,
    },
  ],
};

export default post;
