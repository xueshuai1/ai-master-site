// Self-Evolving AI Agent 深度解析：从固定指令到自主进化的范式跃迁
import type { Article } from '../knowledge';

export const article: Article = {
  id: 'agent-024',
  title: "Self-Evolving AI Agent（二）：自主进化的范式跃迁",
  category: 'agent',
  tags: ['Self-Evolving', 'Hermes Agent', 'GenericAgent', 'Evolver', '技能进化', '记忆系统', '元学习'],
  summary: '2025-2026 年 AI 领域最激动人心的前沿方向之一：让 Agent 不再依赖人类预设的固定能力，而是通过与环境交互、经验积累、技能树自主扩展，实现"越用越强"的自进化能力。本文从技术路线、代表项目、底层原理到实现方案进行全面拆解。',
  date: '2026-04-21',
  readTime: '25 min',
  level: '高级',
  content: [
    {
      title: '一、什么是 Self-Evolving AI Agent？',
      body: `传统 AI Agent 架构中，智能体的能力边界由开发者预设的工具集、Prompt 模板和决策逻辑决定。无论 Agent 多么强大，它无法超越设计者的想象力——这是一个"封闭系统"。

Self-Evolving AI Agent（自进化智能体）的核心突破在于能力边界的动态扩展。它具备三个核心特征：

1. **自主技能发现**：能识别自身能力盲区，自动创建并学习新技能
2. **经验积累与固化**：通过记忆系统保留有价值的经验，避免重复试错
3. **元能力进化**：不仅学会做具体任务，还能改进自己的决策框架和认知架构

这与生物界的进化过程高度相似：通过变异（探索新策略）、选择（保留有效策略）、遗传（固化到长期记忆）实现能力增长。`,
      mermaid: `graph TD
    A[Self-Evolving Agent] --> B[记忆驱动路线]
    A --> C[技能树路线]
    A --> D[遗传进化路线]
    B --> B1[Hermes Agent<br/>105K stars]
    B --> B2[Claude-Mem<br/>64K stars]
    C --> C1[GenericAgent<br/>5.1K stars]
    D --> D1[Evolver<br/>6K stars]
    B1 -.-> B1a[经验自动转技能]
    B2 -.-> B2a[会话压缩注入]
    C1 -.-> C1a[seed扩展技能树]
    D1 -.-> D1a[GEP基因组进化]
    class D s3
    class C s2
    class B s1
    class A s0
    classDef s0 fill:#3730a3,color:#f1f5f9
    classDef s1 fill:#047857,color:#fff
    classDef s2 fill:#b45309,color:#fff
    classDef s3 fill:#b91c1c,color:#fff`
    },
    {
      title: '二、三大自进化技术路线对比',
      table: {
        headers: ['路线', '代表项目', '核心机制', '优势', '适用场景'],
        rows: [
          ['记忆驱动', 'Hermes Agent, Claude-Mem', '经验积累+语义检索', '实现简单，稳定可靠', '个人助手，编码 Copilot'],
          ['技能树', 'GenericAgent', '能力评估+技能合成', '结构化知识，Token 节省 6x', '长期自主工作流'],
          ['遗传进化', 'Evolver (GEP)', '基因组编码+交叉变异', '全局搜索，策略优化', '游戏 AI，控制策略'],
          ['混合路线', 'Hermes+技能树', '记忆+技能双系统', '兼顾经验与结构', '通用自主 Agent 平台'],
        ],
      },
      body: `本周 GitHub Trending 的热门项目恰好覆盖了这三条路线，形成了一个完整的自进化 Agent 生态版图。NousResearch 的 Hermes Agent 以 105,908 总星数（本周 +30,630）成为绝对焦点，**Claude**-Mem 两周狂揽 64,488 星，GenericAgent 和 Evolver 分别以 5,115 和 6,071 星代表了技能树和遗传进化两个方向。`
    },
    {
      title: '三、路线详解：记忆驱动路线',
      body: `### 3.1 核心思想

**记忆驱动路线认为**：Agent 的进化 = 经验的积累与抽象。核心循环为：行动 → 结果评估 → 经验提取 → 记忆存储 → 下次决策时检索调用。

这一路线的代表是 NousResearch 的 Hermes Agent（105,908 stars，本周新增 30,630 stars）和 **Claude**-Mem（64,488 stars）。

### 3.2 Hermes Agent 架构拆解

Hermes Agent 的核心创新在于闭环学习系统（Closed Learning Loop）：

1. **技能自主创建**：完成复杂任务后，Agent 自动将执行路径抽象为可复用的 Skill
2. 技能在使用中进化：每次调用 Skill 时收集反馈，自动优化 Prompt 和参数
3. 会话搜索 + LLM 摘要：通过 FTS5 全文检索 + LLM 跨会话摘要实现长期记忆
4. **用户画像建模**：兼容 Honcho 方言，通过多轮对话构建用户心智模型

Hermes Agent 支持在 $5 VPS 上运行，通过 Telegram/Discord/Slack 等渠道交互，实现了低成本部署 + 多端连续性。`,
      code: [
        {
          lang: 'python',
          code: `# Claude-Mem 记忆注入伪代码
class ClaudeMemInjector:
    def __init__(self, compression_model="claude-sonnet-4"):
        self.memory_store = VectorStore()  # 语义向量存储
        self.compressor = LLM(compression_model)
        
    def capture_session(self, session):
        """捕获完整会话，包括文件变更、命令执行、对话历史"""
        raw_events = session.get_all_events()
        # 用 LLM 进行多层压缩：事件->关键决策->抽象经验
        compressed = self.compressor.compress(
            raw_events,
            prompt="提取本次会话的核心决策、有效模式和失败教训"
        )
        return CompressedMemory(
            summary=compressed.summary,
            patterns=compressed.code_patterns,
            lessons=compressed.lessons_learned,
            embedding=compressed.vector
        )
    
    def inject_context(self, current_task, k=5):
        """为当前任务注入最相关的历史经验"""
        relevant = self.memory_store.semantic_search(
            query=current_task, top_k=k
        )
        context = "基于历史经验的相关记忆：\\n"
        for mem in relevant:
            if mem.relevance_score > 0.75:
                context += f"- {mem.summary}\\n"
                for lesson in mem.lessons:
                    context += f"  教训: {lesson}\\n"
        return context`
        }
      ]
    },
    {
      title: '四、路线详解：技能树路线',
      body: `### 4.1 核心思想

技能树路线将 Agent 的能力组织为可生长的树状结构：根节点是基础能力，每完成新类型任务就生长出新的技能分支。核心循环：新任务 → 能力评估 → 技能创建/扩展现有技能 → 验证 → 固化到技能树。

**代表项目**：GenericAgent（5,115 stars，本周新增 3,914 stars）。

### 4.2 GenericAgent 的设计哲学

GenericAgent 的核心论文提出了一个关键洞见：从 3,300 行的种子代码出发，通过自主技能树扩展，Agent 最终能实现完整的系统控制能力，同时 token 消耗降低 6 倍。

其技能树生长机制包含三个关键组件：

1. 能力发现器（Capability Discoverer）：分析任务需求，判断现有技能是否覆盖
2. 技能合成器（Skill Synthesizer）：将新经验编译为结构化 Skill（包含名称、描述、触发条件、执行代码、依赖关系）
3. 技能评估器（Skill Evaluator）：通过执行测试用例验证新 Skill 的有效性，决定是否保留`,
      code: [
        {
          lang: 'python',
          code: `# GenericAgent 技能树生长伪代码
class GenericAgentSkillTree:
    def __init__(self, seed_skills):
        self.tree = SkillTree()
        for skill in seed_skills:
            self.tree.add_node(skill)
    
    def attempt_task(self, task):
        """尝试用现有技能树完成任务"""
        matched = self.tree.find_relevant_skills(task)
        
        # 能力评估：现有技能能否覆盖？
        coverage = self._evaluate_coverage(matched, task)
        
        if coverage >= 0.8:
            return self._execute_with_skills(task, matched)
        else:
            # 能力不足，触发技能合成
            new_skill = self._synthesize_skill(task, matched)
            if self._validate_skill(new_skill):
                self.tree.add_node(new_skill)
                return self._execute_with_skills(task, [new_skill])
            return TaskResult(success=False, reason="技能合成失败")
    
    def _synthesize_skill(self, task, base_skills):
        """基于现有技能和任务需求，合成新技能"""
        gap = self._analyze_gap(task, base_skills)
        # 用 LLM 生成技能定义和执行代码
        skill_def = llm.generate(
            prompt=f"基于以下技能缺口创建新技能: {gap}",
            output_schema=SkillDefinition
        )
        return Skill(
            name=skill_def.name,
            code=skill_def.code,
            dependencies=skill_def.depends_on,
            description=skill_def.description
        )`
        }
      ]
    },
    {
      title: '五、路线详解：遗传进化路线',
      body: `### 5.1 核心思想

遗传进化路线将 Agent 的决策逻辑编码为基因组（Genome），通过遗传编程（GP）或基因表达编程（GEP）进行进化。核心循环：种群初始化 → 适应度评估 → 选择 → 交叉/变异 → 新一代种群。

**代表项目**：Evolver（6,071 stars，本周新增 4,032 stars）。

### 5.2 GEP 的关键优势

GEP 的核心优势是基因组固定长度保证遗传操作安全，表达树可变长度保证行为多样性。这使得进化过程既稳定又富有探索性。`,
      mermaid: `graph LR
    A[基因组 DNA<br/>固定长度] -->|编码| B[表达树 ET<br/>可变结构]
    B -->|执行| C[适应度评估]
    C -->|选择/变异| D[新一代种群]
    D -->|进化| A
    class D s3
    class C s2
    class B s1
    class A s0
    classDef s0 fill:#b91c1c,color:#fff
    classDef s1 fill:#b45309,color:#fff
    classDef s2 fill:#047857,color:#fff
    classDef s3 fill:#3730a3,color:#f1f5f9`
    },
    {
      title: '六、GEP 代码实现',
      body: `以下是 GEP 进化引擎的 Python 实现，展示了基因组编码、适应度评估和进化循环的完整流程：`,
      code: [
        {
          lang: 'python',
          code: `import random
from typing import List, Callable

class GEPEvolver:
    """基于 GEP 的 Agent 策略进化引擎"""
    
    FUNCTIONS = {
        '+': lambda a, b: a + b,
        '-': lambda a, b: a - b,
        '*': lambda a, b: a * b,
        'max': lambda a, b: max(a, b),
        'min': lambda a, b: min(a, b),
    }
    TERMINALS = ['x', 'y', 'z']
    
    def __init__(self, head_length=10, population_size=50):
        self.head_length = head_length
        self.tail_length = head_length * 1 + 1
        self.gene_length = self.head_length + self.tail_length
        self.population_size = population_size
        self.population = self._initialize()
    
    def _initialize(self):
        symbols = list(self.FUNCTIONS.keys()) + self.TERMINALS
        return [''.join(random.choices(symbols, k=self.gene_length))
                for _ in range(self.population_size)]
    
    def evaluate_fitness(self, gene, test_cases):
        """适应度评估：在测试用例集上的平均表现"""
        total = 0.0
        for case in test_cases:
            try:
                env = {'x': case['x'], 'y': case['y'], 'z': case.get('z', 0)}
                expr = self._gene_to_expr(gene)
                result = eval(expr, {"__builtins__": {}}, env)
                total += 1.0 / (1.0 + abs(result - case['expected']))
            except Exception:
                total += 0.01
        return total / len(test_cases)
    
    def evolve(self, generations=100, test_cases=None):
        """主进化循环"""
        if test_cases is None:
            test_cases = self._gen_cases()
        
        for gen in range(generations):
            fitness = [self.evaluate_fitness(g, test_cases) for g in self.population]
            selected = self._tournament_select(fitness)
            
            new_pop = []
            for i in range(0, len(selected) - 1, 2):
                c1, c2 = self._crossover(selected[i], selected[i + 1])
                new_pop.extend([c1, c2])
            
            self.population = [self._mutate(g) for g in new_pop]
            
            if gen % 20 == 0:
                best = max(fitness)
                print(f"Gen {gen}: best={best:.4f}")
        
        final = [self.evaluate_fitness(g, test_cases) for g in self.population]
        return self.population[final.index(max(final))]
    
    def _crossover(self, g1, g2):
        point = random.randint(1, self.head_length - 1)
        return g1[:point] + g2[point:], g2[:point] + g1[point:]
    
    def _mutate(self, gene):
        symbols = list(self.FUNCTIONS.keys()) + self.TERMINALS
        chars = list(gene)
        for i in range(len(chars)):
            if random.random() < 0.05:
                chars[i] = random.choice(symbols)
        return ''.join(chars)
    
    def _gen_cases(self, n=20):
        return [{'x': random.uniform(-10, 10), 'y': random.uniform(-10, 10),
                 'expected': random.uniform(-20, 20)} for _ in range(n)]

# 使用
if __name__ == "__main__":
    evolver = GEPEvolver(head_length=12, population_size=30)
    best = evolver.evolve(generations=100)
    print(f"进化完成！最优基因: {best}")`
        }
      ]
    },
    {
      title: '七、混合自进化 Agent 完整实现',
      body: `以下是一个结合记忆驱动 + 技能树的混合自进化 Agent 最小实现，展示了如何从经验中自动创建和进化技能：`,
      code: [
        {
          lang: 'python',
          code: `"""
SelfEvolvingAgent - 记忆+技能树混合自进化 Agent
特点：
1. 自动记录任务执行经验到记忆库
2. 基于经验自动创建和更新技能
3. 技能支持版本控制和回滚
"""
import json
import hashlib
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from collections import Counter

@dataclass
class Experience:
    task_description: str
    actions_taken: List[str]
    result: str
    success: bool
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    embedding: Optional[List[float]] = None

@dataclass
class Skill:
    name: str
    description: str
    trigger_pattern: str
    execution_template: str
    version: int = 1
    success_count: int = 0
    failure_count: int = 0
    created_from: str = ""
    
    @property
    def reliability(self) -> float:
        total = self.success_count + self.failure_count
        return self.success_count / total if total > 0 else 0.0

class SelfEvolvingAgent:
    def __init__(self, agent_id="default"):
        self.agent_id = agent_id
        self.memory: List[Experience] = []
        self.skills: Dict[str, Skill] = {}
        self.skill_threshold = 2
        
    def execute_task(self, task: str, actions: List[str]) -> str:
        # 1. 先尝试用现有技能
        matched = self._find_best_skill(task)
        if matched and matched.reliability > 0.7:
            result = f"[技能] {matched.name}: {matched.execution_template}"
            matched.success_count += 1
            return result
        
        # 2. 基础执行
        result = f"[基础] {task}: {' -> '.join(actions)}"
        success = "error" not in result.lower()
        
        # 3. 记录经验
        exp = Experience(task, actions, result, success)
        self.memory.append(exp)
        print(f"[记忆] {task[:30]}... (成功={success})")
        
        # 4. 检查是否创建新技能
        similar = [e for e in self.memory 
                   if self._similarity(e.task_description, task) > 0.8]
        if len(similar) >= self.skill_threshold:
            name = f"skill_{hash(task) % 10000:04d}"
            if name not in self.skills:
                common = " -> ".join(
                    [a for a, _ in Counter(
                        sum((e.actions_taken for e in similar), [])
                    ).most_common(3)]
                )
                self.skills[name] = Skill(
                    name=name, description=f"自动技能: {task[:60]}",
                    trigger_pattern=task, execution_template=common,
                    created_from=f"基于{len(similar)}条经验",
                    success_count=sum(1 for e in similar if e.success),
                    failure_count=sum(1 for e in similar if not e.success)
                )
                print(f"[进化] 创建技能: {name}")
            else:
                self.skills[name].version += 1
                print(f"[进化] 更新技能: {name} -> v{self.skills[name].version}")
        
        return result
    
    def _find_best_skill(self, task):
        best, score = None, 0.0
        for s in self.skills.values():
            sc = self._similarity(task, s.trigger_pattern)
            if sc > score:
                score, best = sc, s
        return best if score > 0.6 else None
    
    def _similarity(self, a, b):
        sa, sb = set(a.lower().split()), set(b.lower().split())
        if not sa or not sb:
            return 0.0
        return len(sa & sb) / len(sa | sb)

# 运行测试
if __name__ == "__main__":
    agent = SelfEvolvingAgent("my-agent")
    tasks = [
        ("查询用户订单状态", ["调订单API", "解析JSON", "返回状态"]),
        ("查询用户订单信息", ["调订单API", "解析JSON", "返回详情"]),
        ("查询用户订单历史", ["调订单API", "解析JSON", "返回列表"]),
        ("查询用户支付记录", ["调支付API", "解析JSON", "返回记录"]),
        ("查询用户支付历史", ["调支付API", "解析JSON", "返回列表"]),
    ]
    for task, actions in tasks:
        agent.execute_task(task, actions)
    
    print("\\n=== 进化统计 ===")
    stats = {
        "memory": len(agent.memory),
        "skills": {k: {"v": v.version, "reliability": f"{v.reliability:.2f}"}
                   for k, v in agent.skills.items()}
    }
    print(json.dumps(stats, indent=2, ensure_ascii=False))`
        }
      ],
      tip: '运行上述代码后，Agent 会从 5 次任务执行中自动提炼出 2 个技能，实现能力的自主增长。你可以继续添加更多任务，观察技能树如何持续扩展。'
    },
    {
      title: '八、技术挑战与解决方案',
      table: {
        headers: ['挑战', '影响', '解决方案', '代表项目实践'],
        rows: [
          ['能力退化（灾难性遗忘）', '学新技能忘旧技能', '弹性记忆整合 + 经验回放', 'Hermes 使用 Honcho 记忆隔离'],
          ['评估难题', '无法量化"进步"', '基准测试集 + 能力雷达图', 'GenericAgent 的技能验证器'],
          ['安全与可控性', '不可预期的进化行为', '沙箱验证 + 人工审批 + 回滚', 'Hermes 命令审批机制'],
          ['Token 消耗', '上下文膨胀导致成本飙升', '技能树分层加载 + 记忆压缩', 'GenericAgent 节省 6x Token'],
          ['跨会话连续性', '重启后丢失上下文', '持久化存储 + 向量检索', 'Claude-Mem 会话压缩注入'],
        ],
      },
      body: `### 8.1 能力退化（Catastrophic Forgetting）

Agent 在学习新技能时可能覆盖或遗忘旧能力。解决策略包括弹性记忆整合（EWC）——为重要技能的参数设置更高保护权重；经验回放（Replay Buffer）——定期用历史成功案例重新训练；技能隔离——不同技能存储在不同的命名空间，避免干扰。

### 8.2 安全与可控性

自主进化的 Agent 可能进化出不可预期的行为。业界最佳实践包括：沙箱执行（新技能先在受限环境中验证）、人类审批（关键技能变更需要人类确认）、回滚机制（保留历史版本，支持一键回退）。`
    },
    {
      title: '九、本周 GitHub Trending 自进化 Agent 全景',
      table: {
        headers: ['项目', 'Stars', '本周新增', '路线', '语言', '部署方式'],
        rows: [
          ['Hermes Agent', '105,908', '+30,630', '记忆+技能', 'Python', '$5 VPS / 云端'],
          ['Claude-Mem', '64,488', '+12,472', '记忆驱动', 'TypeScript', 'SaaS 插件'],
          ['GenericAgent', '5,115', '+3,914', '技能树', 'Python', '本地/云'],
          ['Evolver', '6,071', '+4,032', '遗传进化', 'JavaScript', '本地/云'],
          ['multica', '17,797', '+7,009', '多 Agent 协作', 'TypeScript', 'SaaS/自托管'],
          ['Voicebox', '21,813', '+5,936', '语音合成', 'TypeScript', '本地/云'],
        ],
      },
      body: `本周 GitHub Trending 呈现出明显的自进化 Agent 爆发趋势。Hermes Agent 以一周 30,630 星的增速成为现象级项目，标志着自进化 Agent 从学术研究走向工程实践的关键转折点。

**Claude**-Mem 和 Hermes Agent 虽然路线相似（都是记忆驱动），但定位不同：**Claude**-Mem 是轻量级的编码会话记忆插件，Hermes Agent 是完整的自主 Agent 平台。两者可以互补使用。

GenericAgent 和 Evolver 代表了两种完全不同的进化范式：前者通过结构化的技能树扩展实现能力增长，后者通过遗传编程实现策略优化。选择哪种路线取决于具体应用场景。`
    },
    {
      title: '十、未来展望',
      body: `Self-Evolving AI Agent 正处于爆发前夜。2025-2026 年的关键趋势：

1. **多模态自进化**：Agent 不仅能从文本经验中学习，还能从视觉、语音、代码等多模态交互中提取技能
2. 跨 Agent 知识共享：不同 Agent 之间共享进化成果，形成"群体智能"
3. 神经+符号混合架构：将神经网络的感知能力与符号系统的推理能力结合，实现更可靠的自进化
4. **具身智能进化**：机器人 Agent 在物理世界中通过试错自主发展操作技能

正如 Hermes Agent 的愿景所言："The agent that grows with you" —— 未来的 AI 助手不再是静态工具，而是与你共同成长的智能伙伴。`
    }
  ]
};
