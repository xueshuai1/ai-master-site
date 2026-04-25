import type { BlogPost } from './blog-types';

const post: BlogPost = {
  id: "blog-053",
  title: "2026 自进化 Agent 生态全景：GenericAgent、Evolver、hermes-agent 三条路线深度对比",
  category: "AI Agent",
  summary: '2026 年 4 月，三个自进化 Agent 项目同时爆发：GenericAgent（6.9K stars，周增 3.5K）、Evolver（6.8K stars，周增 3.1K）、hermes-agent（115K stars，周增 19K）。本文从架构设计、进化机制、实际能力到代码实战，全景拆解三条自进化路线的核心差异，帮你选择最适合的 Agent 进化方案。',
  content: [
    {
      title: "为什么「自进化 Agent」是 2026 年最重要的 AI 趋势？",
      body: `如果你关注本周 GitHub trending，会发现一个令人震惊的现象：三个「自进化 Agent」项目同时出现在热门榜单前列。

**hermes-agent**（NousResearch）以 115K stars 和周增 19K 的恐怖增速成为 GitHub 历史级爆款；**GenericAgent**（6.9K stars，周增 3.5K）主打从 3.3K 行种子代码自主生长技能树；**Evolver**（6.8K stars，周增 3.1K）基于 GEP 基因组进化协议实现群体进化。

这三个项目代表了自进化 Agent 的三条截然不同的技术路线：

1. **技能树生长路线**（GenericAgent）：单个 Agent 通过试错自主扩展能力边界
2. **群体进化路线**（Evolver）：多个 Agent 变体通过竞争和交叉繁殖产生更优后代
3. **协作生长路线**（hermes-agent）：Agent 与用户共同生长，双向反馈循环

这不是学术概念——它们都是可以直接运行的开源项目。2026 年标志着 AI Agent 从「预定义工具链」向「自主进化能力」的历史性转折。`
    },
    {
      title: "路线一：GenericAgent —— 技能树自生长的单体进化",
      body: `GenericAgent 的核心理念极其简洁：给它一个 3.3K 行的种子代码，它会像生物一样自主发现环境、尝试操作、验证效果、固化技能。

**关键设计：发现-尝试-验证-固化 四步循环**

GenericAgent 不依赖任何预定义工具链。它启动时只有一个最小能力集（通常是文件系统读写和命令执行），然后通过以下循环不断扩展：

1. **Discover（发现）**：扫描当前环境，识别可用的系统资源、API、协议
2. **Try（尝试）**：通过 LLM 推理生成操作计划，执行实验性操作
3. **Verify（验证）**：检查操作结果，成功则标记为有效，失败则记录错误模式
4. **Solidify（固化）**：将成功操作编译为可复用的"技能"，加入技能树

这个循环的魔力在于：每个新技能都可能成为发现更多技能的跳板。比如学会读取配置文件后，它能发现数据库连接信息，进而学会数据库操作，进而学会数据分析和可视化。

**Token 效率优势：6 倍低于传统 Agent 框架**

GenericAgent 的另一个亮点是 token 效率。传统 Agent 框架（如 LangChain）每次调用都需要加载完整的工具描述和系统提示。GenericAgent 采用"惰性加载"策略：只在需要时加载相关技能描述，其余时间保持极小的上下文窗口。这使得它的 token 消耗比同类框架低 6 倍。`,
      code: [
        {
          lang: "python",
          code: `# GenericAgent 风格的核心进化循环
import json
from typing import Any
from dataclasses import dataclass, field

@dataclass
class Skill:
    """技能：一个可复用的操作"""
    name: str
    description: str
    code_template: str
    success_count: int = 0
    fail_count: int = 0
    
    @property
    def confidence(self) -> float:
        total = self.success_count + self.fail_count
        return self.success_count / total if total > 0 else 0.0

@dataclass
class SkillTree:
    """技能树：所有已掌握技能的集合"""
    skills: dict[str, Skill] = field(default_factory=dict)
    
    def add(self, skill: Skill) -> None:
        self.skills[skill.name] = skill
    
    def get_relevant(self, task: str) -> list[Skill]:
        """根据任务描述检索相关技能"""
        # 简化版：关键词匹配
        relevant = []
        for s in self.skills.values():
            if any(kw in task.lower() for kw in s.name.lower().split()):
                relevant.append(s)
        return sorted(relevant, key=lambda s: s.confidence, reverse=True)

class SelfEvolvingAgent:
    """自进化 Agent 核心循环"""
    
    def __init__(self, seed_skills: list[Skill]):
        self.skill_tree = SkillTree()
        for s in seed_skills:
            self.skill_tree.add(s)
        self.discovered_capabilities: list[str] = []
    
    def discover(self, environment: dict[str, Any]) -> list[str]:
        """发现环境中可用的能力"""
        new_caps = []
        for resource, info in environment.items():
            if resource not in self.discovered_capabilities:
                self.discovered_capabilities.append(resource)
                new_caps.append(resource)
        return new_caps
    
    def try_operation(self, task: str, environment: dict) -> tuple[bool, str]:
        """尝试执行任务"""
        relevant_skills = self.skill_tree.get_relevant(task)
        if not relevant_skills:
            return False, "无可用技能执行此任务"
        
        best_skill = relevant_skills[0]
        # 模拟执行（实际中由 LLM 生成具体操作）
        success = True  # 简化为总是成功
        return success, f"使用技能 '{best_skill.name}' 完成: {task}"
    
    def verify_and_solidify(self, task: str, success: bool, 
                              result: str, skill_name: str) -> Skill | None:
        """验证结果并固化技能"""
        if success:
            if skill_name in self.skill_tree.skills:
                self.skill_tree.skills[skill_name].success_count += 1
            return self.skill_tree.skills.get(skill_name)
        else:
            if skill_name in self.skill_tree.skills:
                self.skill_tree.skills[skill_name].fail_count += 1
            return None
    
    def evolve_cycle(self, task: str, environment: dict) -> str:
        """完整的进化循环"""
        # 1. Discover
        new_caps = self.discover(environment)
        
        # 2. Try
        success, result = self.try_operation(task, environment)
        
        # 3-4. Verify & Solidify
        skill = self.verify_and_solidify(task, success, result, "generic")
        
        return result

# 使用示例
agent = SelfEvolvingAgent([
    Skill("read_file", "读取文件", "with open(path) as f: return f.read()"),
    Skill("list_dir", "列出目录", "import os; return os.listdir(path)"),
])

env = {"file_system": "/", "network": "available", "database": "sqlite:///app.db"}
result = agent.evolve_cycle("读取配置文件", env)
print(f"结果: {result}")
print(f"已掌握技能数: {len(agent.skill_tree.skills)}")
print(f"已发现能力: {agent.discovered_capabilities}")`,
          filename: "generic_agent_core.py",
        },
      ],
      mermaid: `graph LR
    A[种子代码 3.3K 行] --> B[发现环境]
    B --> C[尝试操作]
    C --> D{验证结果}
    D -->|成功| E[固化技能]
    D -->|失败| F[记录错误]
    E --> B
    F --> B
    E --> G[技能树扩展]
    G --> H[新技能成为新跳板]
    H --> B
    style E fill:#1e3a5f
    style G fill:#1e3a5f`,
    },
    {
      title: "路线二：Evolver —— GEP 驱动的群体进化",
      body: `如果说 GenericAgent 是"达尔文式"的个体进化，那么 Evolver 就是"群体遗传学"的群体进化。

**核心概念：基因组（Genome）、胶囊（Capsule）、事件（Event）**

Evolver 将 Agent 的核心能力编码为可遗传的"基因组"，包含：
- **感知基因**：如何观察和理解环境
- **决策基因**：如何根据观察做出决策
- **行动基因**：如何执行具体操作
- **评估基因**：如何判断行动是否成功

**群体进化流程：**

Evolver 同时运行多个 Agent 变体（一个"种群"），每代经历以下步骤：
1. **变异**：随机修改部分基因（对应探索新策略）
2. **竞争**：所有变体在相同任务上执行，按适应度评分
3. **选择**：保留适应度最高的个体
4. **交叉繁殖**：优秀个体的基因组合产生下一代
5. **事件记录**：所有进化事件可审计、可回溯

**与 GenericAgent 的本质区别：**

| 对比维度 | GenericAgent | Evolver |
|---------|-------------|---------|
| 进化单位 | 单个 Agent | Agent 群体 |
| 知识传递 | 技能树追加 | 基因重组 |
| 探索方式 | 试错积累 | 变异+选择 |
| 可审计性 | 技能日志 | 事件溯源 |
| 适用场景 | 单任务深化 | 多策略并行优化 |
| 收敛速度 | 较慢（线性积累） | 较快（并行探索） |
| 局部最优风险 | 较高 | 较低（群体多样性） |

Evolver 的 GEP 协议（Genome Evolution Protocol）是其最独特的创新。它定义了一套标准化的 Agent 基因组格式和进化操作，使得不同来源的 Agent 可以在统一框架下进行进化竞争。这对于长期运行的 Agent 系统（如自动运维、持续部署、自主研究）特别有价值。`,
      code: [
        {
          lang: "python",
          code: `# Evolver 风格的群体进化引擎
import random
import copy
from dataclasses import dataclass, field
from typing import Protocol

@dataclass
class Genome:
    """Agent 基因组：可遗传的能力编码"""
    perception_strategy: str     # 感知策略
    decision_model: str          # 决策模型
    action_templates: list[str]  # 行动模板
    eval_criteria: list[str]     # 评估标准
    fitness: float = 0.0         # 适应度分数
    
    def mutate(self, mutation_rate: float = 0.1) -> 'Genome':
        """随机变异"""
        new = copy.deepcopy(self)
        strategies = ["pattern_match", "semantic_search", 
                      "attention_focus", "signal_filter"]
        if random.random() < mutation_rate:
            new.perception_strategy = random.choice(strategies)
        if random.random() < mutation_rate:
            models = ["rule_based", "llm_assisted", 
                      "hybrid", "tree_search"]
            new.decision_model = random.choice(models)
        return new
    
    def crossover(self, other: 'Genome') -> 'Genome':
        """基因重组"""
        child = Genome(
            perception_strategy=random.choice(
                [self.perception_strategy, other.perception_strategy]),
            decision_model=random.choice(
                [self.decision_model, other.decision_model]),
            action_templates=random.sample(
                self.action_templates + other.action_templates,
                k=min(3, len(self.action_templates + other.action_templates))),
            eval_criteria=list(set(self.eval_criteria + other.eval_criteria)),
        )
        return child

class FitnessEvaluator(Protocol):
    def __call__(self, genome: Genome, task: str) -> float: ...

class EvolverPopulation:
    """进化种群"""
    
    def __init__(self, initial_genomes: list[Genome], 
                 evaluator: FitnessEvaluator):
        self.population = initial_genomes
        self.evaluator = evaluator
        self.generation = 0
        self.history: list[dict] = []
    
    def evaluate(self, task: str) -> None:
        """评估所有个体"""
        for genome in self.population:
            genome.fitness = self.evaluator(genome, task)
    
    def select(self, k: int = 2) -> list[Genome]:
        """锦标赛选择"""
        tournament = random.sample(self.population, k)
        return sorted(tournament, key=lambda g: g.fitness, reverse=True)
    
    def evolve(self, task: str, generations: int = 10, 
               population_size: int = 20) -> None:
        """执行多代进化"""
        for gen in range(generations):
            self.generation += 1
            self.evaluate(task)
            
            # 记录本代统计
            fitnesses = [g.fitness for g in self.population]
            self.history.append({
                "generation": gen + 1,
                "best_fitness": max(fitnesses),
                "avg_fitness": sum(fitnesses) / len(fitnesses),
                "diversity": len(set(g.decision_model 
                           for g in self.population)),
            })
            
            # 精英保留 + 变异 + 交叉
            elites = self.select(k=2)[:2]
            new_pop = list(elites)  # 精英保留
            
            while len(new_pop) < population_size:
                parents = self.select(k=4)[:2]
                child = parents[0].crossover(parents[1])
                child = child.mutate(mutation_rate=0.15)
                new_pop.append(child)
            
            self.population = new_pop
    
    def best_genome(self) -> Genome:
        self.evaluate("")  # 确保适应度最新
        return max(self.population, key=lambda g: g.fitness)

# 使用示例
def simple_evaluator(genome: Genome, task: str) -> float:
    """简化评估器（实际中由任务执行结果决定）"""
    base = 0.5
    if genome.decision_model == "llm_assisted":
        base += 0.2
    if genome.perception_strategy == "attention_focus":
        base += 0.15
    base += random.uniform(-0.1, 0.1)
    return min(base, 1.0)

# 初始化种群
initial = [
    Genome(
        perception_strategy=random.choice(["pattern_match", "semantic_search", 
                                           "attention_focus", "signal_filter"]),
        decision_model=random.choice(["rule_based", "llm_assisted", 
                                      "hybrid", "tree_search"]),
        action_templates=["execute_cmd", "read_file", "write_file"],
        eval_criteria=["accuracy", "speed"],
    )
    for _ in range(20)
]

pop = EvolverPopulation(initial, simple_evaluator)
pop.evolve("auto_fix_bug", generations=5)
best = pop.best_genome()
print(f"最优基因组 - 感知: {best.perception_strategy}, "
      f"决策: {best.decision_model}, "
      f"适应度: {best.fitness:.3f}")
for h in pop.history:
    print(f"  第 {h['generation']} 代: 最优={h['best_fitness']:.3f}, "
          f"平均={h['avg_fitness']:.3f}, 多样性={h['diversity']}")`,
          filename: "evolver_population.py",
        },
      ],
      mermaid: `graph TD
    A[初始化种群 20 个变体] --> B[评估适应度]
    B --> C{锦标赛选择}
    C -->|Top 2| D[精英保留]
    C -->|随机 4 选 2| E[交叉繁殖]
    E --> F[随机变异 15%]
    D --> G[新一代种群]
    F --> G
    G --> B
    B --> H[记录事件日志]
    H --> I[可审计进化历史]
    style D fill:#92400e
    style I fill:#1e3a5f`,
    },
    {
      title: "路线三：hermes-agent —— 人机协作的双向生长",
      body: `hermes-agent 选择了与前两者截然不同的哲学：**不是 Agent 自己进化，而是 Agent 和你一起进化。**

**核心理念：Agent 随用户共同成长**

hermes-agent 的设计假设是：最有价值的 Agent 不是"最聪明的"，而是"最懂你的"。因此它的进化方向不是追求通用能力最大化，而是在与你的交互中变得越来越契合你的工作习惯。

**三大核心机制：**

1. **偏好学习**：记录你对 Agent 输出的反馈（满意/修改/拒绝），自动调整行为策略
2. **上下文记忆**：跨会话记住关键决策上下文，下次遇到类似场景自动应用历史经验
3. **技能协作**：你可以手动教 Agent 新技能，它会将你的教学泛化到类似场景

**115K stars 背后的原因：**

hermes-agent 能在 GitHub 上获得 115K stars（周增 19K），关键在于它击中了 AI Agent 最核心的用户痛点：**通用 Agent 很好，但个性化的 Agent 才真正有用。**

与 GenericAgent 和 Evolver 的"纯自动进化"不同，hermes-agent 采用"人机协作进化"模式。你不需要理解基因组或技能树的底层机制，只需要正常使用 Agent，它就会变得越来越好用。这种低门槛设计是其获得海量用户的根本原因。

**三条路线对比总结：**`,
      table: {
        headers: ["维度", "GenericAgent", "Evolver", "hermes-agent"],
        rows: [
          ["Stars", "6,933", "6,839", "115,534"],
          ["周增", "3,483", "3,099", "19,019"],
          ["进化模式", "个体技能树生长", "群体基因进化", "人机协作生长"],
          ["开发语言", "Python", "JavaScript", "Python"],
          ["核心协议", "自定义元认知循环", "GEP 基因组协议", "Hermes 偏好学习协议"],
          ["Token 效率", "★★★★★ (6倍优化)", "★★★ (标准)", "★★★★ (记忆压缩)"],
          ["上手难度", "中等（需理解技能树）", "高（需理解基因组）", "低（开箱即用）"],
          ["适合场景", "深度自动化", "多策略优化", "个人助理"],
          ["可解释性", "技能日志可追溯", "事件全审计", "偏好可视化"],
          ["生态成熟度", "发展中", "早期", "成熟"],
        ],
      },
      mermaid: `graph LR
    subgraph GenericAgent["单体技能树"]
      A1[种子] --> A2[发现]
      A2 --> A3[尝试]
      A3 --> A4[固化]
      A4 --> A1
    end
    
    subgraph Evolver["群体基因"]
      B1[种群] --> B2[评估]
      B2 --> B3[选择]
      B3 --> B4[重组+变异]
      B4 --> B1
    end
    
    subgraph hermes["人机协作"]
      C1[用户交互] --> C2[偏好学习]
      C2 --> C3[行为调整]
      C3 --> C4[更好服务]
      C4 --> C1
    end
    
    style A1 fill:#1e3a5f
    style B1 fill:#1e3a5f
    style C1 fill:#92400e`,
    },
    {
      title: "实战：用 Python 实现三合一 Agent 进化框架",
      body: `既然三条路线各有优势，为什么不结合它们呢？下面提供一个融合框架，将 GenericAgent 的技能树、Evolver 的群体选择和 hermes-agent 的偏好学习整合到一个统一的 Python 实现中。`,
      code: [
        {
          lang: "python",
          code: `"""
三合一 Agent 进化框架
融合：技能树生长 + 群体选择 + 偏好学习
"""
from dataclasses import dataclass, field
from enum import Enum
import json
from typing import Any

class EvolutionMode(Enum):
    SKILL_TREE = "skill_tree"     # GenericAgent 风格
    POPULATION = "population"     # Evolver 风格
    COLLABORATIVE = "collaborative"  # hermes 风格

@dataclass
class UserProfile:
    """用户偏好画像（hermes-agent 风格）"""
    preferred_style: str = "concise"  # concise / detailed / code_first
    language_preference: str = "zh"
    domain_focus: list[str] = field(default_factory=list)
    satisfaction_history: list[dict] = field(default_factory=list)
    
    def record_feedback(self, task: str, rating: int, feedback: str = ""):
        """记录用户反馈"""
        self.satisfaction_history.append({
            "task": task, "rating": rating, "feedback": feedback
        })
    
    def get_preferred_approach(self, task_type: str) -> str:
        """根据历史记录推断最佳执行方式"""
        # 简化版：根据历史满意度推荐
        relevant = [h for h in self.satisfaction_history 
                    if task_type in h.get("task", "")]
        if not relevant:
            return "default"
        # 返回评分最高的策略
        return max(relevant, key=lambda h: h["rating"]).get("strategy", "default")

@dataclass 
class HybridAgent:
    """混合进化 Agent"""
    mode: EvolutionMode = EvolutionMode.SKILL_TREE
    profile: UserProfile = field(default_factory=UserProfile)
    skill_confidence: dict[str, float] = field(default_factory=dict)
    population_best: float = 0.0
    
    def adapt(self, task: str, result_quality: float) -> str:
        """根据反馈自适应调整"""
        if self.mode == EvolutionMode.COLLABORATIVE:
            self.profile.record_feedback(task, int(result_quality * 5))
        
        # 根据技能置信度决定执行策略
        task_type = task.split()[0] if task else "unknown"
        if self.mode == EvolutionMode.SKILL_TREE:
            confidence = self.skill_confidence.get(task_type, 0.5)
            if confidence > 0.8:
                return f"高置信执行 {task} (置信度: {confidence:.2f})"
            elif confidence > 0.5:
                return f"标准执行 {task} (置信度: {confidence:.2f})"
            else:
                return f"探索执行 {task} (需要更多练习)"
        elif self.mode == EvolutionMode.POPULATION:
            return f"种群最优策略执行 {task} (适应度: {self.population_best:.2f})"
        else:
            preferred = self.profile.get_preferred_approach(task_type)
            return f"按用户偏好 '{preferred}' 执行 {task}"
    
    def switch_mode(self, new_mode: EvolutionMode):
        """根据场景切换进化模式"""
        self.mode = new_mode
        return f"已切换到 {new_mode.value} 模式"

# ====== 完整使用示例 ======
if __name__ == "__main__":
    # 1. 初始化为技能树模式（冷启动）
    agent = HybridAgent(mode=EvolutionMode.SKILL_TREE)
    
    tasks = [
        "read config file",
        "parse JSON data", 
        "connect to database",
        "generate report",
        "read config file",  # 重复任务
    ]
    
    print("=== Phase 1: 技能树生长 ===")
    for task in tasks:
        result = agent.adapt(task, 0.7)
        task_type = task.split()[0]
        agent.skill_confidence[task_type] = \
            agent.skill_confidence.get(task_type, 0.3) + 0.2
        print(f"  {result}")
    
    # 2. 切换到协作模式
    agent.switch_mode(EvolutionMode.COLLABORATIVE)
    
    print("\\n=== Phase 2: 人机协作 ===")
    agent.profile.record_feedback("read config", 5, "完美")
    agent.profile.record_feedback("parse JSON", 3, "需要改进")
    agent.profile.domain_focus.append("data_analysis")
    
    for task in ["read config", "parse JSON", "connect database"]:
        result = agent.adapt(task, 0.8)
        print(f"  {result}")
    
    # 3. 切换到群体模式
    agent.switch_mode(EvolutionMode.POPULATION)
    agent.population_best = 0.92
    
    print("\\n=== Phase 3: 群体最优 ===")
    result = agent.adapt("optimize query performance", 0.92)
    print(f"  {result}")`,
          filename: "hybrid_agent_framework.py",
        },
      ],
    },
    {
      title: "决策指南：你应该选择哪条路线？",
      body: `选择自进化 Agent 路线，关键看你的使用场景：

**选 GenericAgent 如果你：**
- 需要 Agent 在单一领域深度进化（如自动化运维、代码生成）
- 关心 token 成本（6 倍优化是实打实的省钱）
- 能接受"慢热"型进化（需要时间积累技能树）
- 偏好 Python 生态

**选 Evolver 如果你：**
- 有多个候选策略需要并行探索（如 A/B 测试不同 Agent 配置）
- 需要完全可审计的进化历史（企业合规需求）
- 运行长期 Agent 系统（持续数周/数月的优化）
- 已经熟悉遗传算法概念

**选 hermes-agent 如果你：**
- 需要个人助手而非专业工具
- 希望"开箱即用"，不想理解底层机制
- 重视 Agent 对你的个人偏好的适配
- 需要成熟的社区和生态支持

**如果你想三者兼顾：**
使用上面的 HybridAgent 框架，根据任务阶段动态切换模式：
- 冷启动期 → 技能树模式（快速积累基础能力）
- 稳定期 → 协作模式（贴合个人习惯）
- 优化期 → 群体模式（探索更优策略）`,
      mermaid: `graph TD
    A["选择自进化 Agent"] --> B{"你的需求？"}
    B -->|"深度自动化"| C["GenericAgent<br/>技能树生长"]
    B -->|"多策略优化"| D["Evolver<br/>群体进化"]
    B -->|"个人助手"| E["hermes-agent<br/>人机协作"]
    B -->|"我全都要"| F["HybridAgent<br/>三合一框架"]
    C --> G["Python 生态<br/>Token 效率 6x"]
    D --> H["GEP 协议<br/>全审计能力"]
    E --> I["115K stars<br/>开箱即用"]
    F --> J["动态切换模式"]
    style C fill:#1e3a5f
    style D fill:#1e3a5f
    style E fill:#92400e
    style F fill:#991b1b`,
    },
    {
      title: "展望：自进化 Agent 的下一步",
      body: `2026 年 4 月的这波自进化 Agent 爆发只是一个开始。接下来的发展趋势值得持续关注：

**短期（1-3 个月）：**
- GenericAgent 和 Evolver 的互操作性：技能树能否作为基因组的一部分？
- hermes-agent 的多用户支持：团队协作场景下的偏好冲突解决
- 更多语言绑定：目前以 Python 为主，TypeScript/Rust 生态将跟进

**中期（3-6 个月）：**
- 自进化 Agent 的安全标准：如何防止 Agent 进化出危险能力？
- 跨 Agent 知识迁移：一个 Agent 学到的技能如何快速迁移到另一个？
- 基准测试标准化：如何公平比较不同进化路线的效果？

**长期（6-12 个月）：**
- 自进化 Agent 的"意识边界"：当 Agent 能自主修改自己的核心代码时，如何确保对齐？
- 分布式进化：多个 Agent 在不同环境中独立进化，如何合并最佳能力？
- 与 AGI 的关系：自进化能力是否是通往 AGI 的必经之路？

这三个项目的同时爆发不是巧合——它标志着 AI Agent 正在从"工具"走向"伙伴"。而选择哪条进化路线，本质上是在选择你希望你的 AI 伙伴以什么方式成长。`
    },
  ],
  date: "2026-04-25",
  author: "AI Master",
  tags: ["自进化 Agent", "GenericAgent", "Evolver", "hermes-agent", "AI Agent 架构", "Python 实战", "GEP 协议", "技能树", "群体进化", "人机协作"],
  readTime: 18,
};

export default post;
