// Self-Evolving AI Agents - 知识文章

import { Article } from '../knowledge';

export const article: Article = {
  id: "self-evolving-agent",
  title: "自进化 AI Agent 全景解析：从 GenericAgent 到基因组进化，2026 年最热门的 AI 范式",
  category: "agent",
  tags: ["自进化 Agent", "GenericAgent", "Evolver", "技能树进化", "基因组进化", "元认知", "GEP"],
  summary: "2026 年 GitHub Trending 被自进化 AI Agent 霸榜。本文深度解析两大技术路线（技能树生长 vs 基因组进化）、核心架构、Python 实战实现，以及 GenericAgent、Evolver、Hermes Agent 等热门项目的技术对比。",
  date: "2026-04-23",
  readTime: "40 min",
  level: "高级",
  content: [
    {
      title: "一、什么是自进化 AI Agent？",
      body: `自进化 AI Agent（Self-Evolving AI Agent）是 2026 年 AI 领域最具颠覆性的范式之一。传统 AI Agent 的能力完全依赖人工编程——开发者手动添加技能、工具调用能力和知识。而自进化 Agent 能够在与环境交互的过程中**自主扩展能力**，无需人工编码更新。

这一概念在 2026 年 4 月迎来爆发：

- **GenericAgent**（lsdefine/GenericAgent）：5,949 stars，周增 4,216 星——3.3K 行种子代码自主生长出完整技能树，token 消耗减少 6 倍
- **Evolver**（EvoMap/evolver）：6,544 stars，周增 638 星——基于 GEP（Gene Expression Programming）的基因组进化引擎
- **Hermes Agent**（NousResearch/hermes-agent）：110,855 stars——2026 年 GitHub 增长最快的 AI Agent 项目

自进化 Agent 的本质是将「能力更新」从人工编程转变为**自主涌现**。Agent 不再是一个静态程序，而是一个持续生长、适应和进化的智能体。`,
    },
    {
      title: "二、两大进化技术路线",
      body: `目前自进化 Agent 有两条核心技术路线，分别代表了不同的进化哲学。

**路线一：技能树进化（Skill Tree Evolution）**

代表项目：GenericAgent。灵感来自 RPG 游戏的技能树系统——Agent 从一组基础「种子技能」开始，通过元认知循环（Metacognitive Loop）评估当前能力缺口，自主发现需要学习的新技能，然后生成代码实现这些技能。

关键机制：
1. **能力感知**：Agent 定期审视自己的技能库，识别薄弱领域
2. **需求发现**：通过任务失败模式分析，发现缺失的关键能力
3. **代码生成**：使用 LLM 生成新技能的可执行代码
4. **验证集成**：通过测试用例验证新技能，通过后加入技能树
5. **经验积累**：每次进化都会沉淀为元知识，加速下一次进化

**路线二：基因组进化（Genomic Evolution）**

代表项目：Evolver。灵感来自生物进化论——将 Agent 的能力编码为「基因」，通过群体竞争、交叉和变异实现进化。

关键机制：
1. **基因编码**：每个 Agent 的能力配置编码为一个基因组（DNA 字符串）
2. **群体竞争**：多个 Agent 变体在相同任务上竞争，按适应度排名
3. **交叉繁殖**：高适应度个体的基因交叉产生后代
4. **变异注入**：随机变异引入新能力探索
5. **可审计轨迹**：每次进化都有完整的日志，可追溯能力来源`,
      mermaid: `graph TD
    A[自进化 Agent] --> B[技能树进化]
    A --> C[基因组进化]
    B --> B1[GenericAgent]
    B --> B2[元认知循环]
    B --> B3[代码自生成]
    B --> B4[Token 效率 6x]
    C --> C1[Evolver]
    C --> C2[GEP 基因表达编程]
    C --> C3[群体竞争+交叉]
    C --> C4[可审计进化轨迹]
    B2 --> D[能力感知]
    B2 --> E[需求发现]
    B2 --> F[代码生成]
    B2 --> G[验证集成]
    C2 --> H[基因编码]
    C2 --> I[适应度评估]
    C2 --> J[交叉+变异]
    C2 --> K[代际传承]`,
    },
    {
      title: "三、GenericAgent 深度解析",
      body: `GenericAgent 是技能树路线的代表作。它的核心创新在于**仅需 3.3K 行种子代码就能生长出完整的技能体系**，并且在进化过程中实现了 **6 倍的 token 消耗降低**。

**架构设计：**

GenericAgent 的核心是一个元认知循环引擎，包含四个阶段：

1. **Self-Assessment（自我评估）**：Agent 定期运行自我诊断，评估各技能维度的表现分数
2. **Gap Analysis（缺口分析）**：对比任务需求与当前能力，识别缺失的技能节点
3. **Skill Synthesis（技能合成）**：调用 LLM 生成新技能的代码实现
4. **Integration & Testing（集成测试）**：通过沙箱环境验证新技能，确保不会破坏现有功能

**Token 效率的秘密：**

GenericAgent 实现 6 倍 token 效率提升的关键在于「经验缓存」机制。每次成功进化的模式都会被编码为紧凑的经验向量，后续遇到相似缺口时直接复用经验模板而非重新生成。这类似于人类学习中「举一反三」的能力。`,
      code: [
        {
          lang: "python",
          filename: "generic_agent_skeleton.py",
          code: `"""
GenericAgent 核心架构简化实现
展示自进化 Agent 的元认知循环和技能树生长机制
"""
import json
import hashlib
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional
from enum import Enum


class SkillStatus(Enum):
    SEED = "seed"           # 种子技能（内置）
    EVOLVED = "evolved"     # 进化获得
    ATROPHIED = "atrophied" # 退化（长期未使用）


@dataclass
class Skill:
    """Agent 技能节点"""
    name: str
    description: str
    execute: Callable
    status: SkillStatus = SkillStatus.SEED
    usage_count: int = 0
    confidence: float = 0.0
    parent: Optional[str] = None
    children: List[str] = field(default_factory=list)
    experience_hash: str = ""  # 经验缓存哈希


@dataclass
class SkillTree:
    """技能树——Agent 能力的完整表示"""
    skills: Dict[str, Skill] = field(default_factory=dict)
    evolution_generation: int = 0

    def add_skill(self, skill: Skill, parent_name: Optional[str] = None):
        """添加技能到树中，支持父子关系"""
        self.skills[skill.name] = skill
        if parent_name and parent_name in self.skills:
            skill.parent = parent_name
            self.skills[parent_name].children.append(skill.name)

    def get_weak_skills(self, threshold: float = 0.3) -> List[Skill]:
        """识别薄弱技能（置信度低于阈值）"""
        return [s for s in self.skills.values()
                if s.confidence < threshold]

    def unused_skills(self, max_age: int = 100) -> List[str]:
        """识别长期未使用的技能"""
        return [name for name, s in self.skills.items()
                if s.usage_count == 0 and s.status == SkillStatus.EVOLVED]


class MetacognitiveLoop:
    """元认知循环——自进化的核心引擎"""

    def __init__(self, llm_client, skill_tree: SkillTree):
        self.llm = llm_client
        self.tree = skill_tree
        self.experience_cache: Dict[str, str] = {}

    def assess(self, task_results: List[dict]) -> Dict[str, float]:
        """
        自我评估：根据任务执行结果计算各技能置信度
        """
        scores = {}
        for result in task_results:
            skill_name = result["skill_used"]
            success = result["success"]
            feedback = result.get("feedback_score", 0.0)

            if skill_name in self.tree.skills:
                skill = self.tree.skills[skill_name]
                # 指数移动平均：近期表现权重更高
                alpha = 0.3
                skill.confidence = (alpha * (1.0 if success else 0.0) +
                                   (1 - alpha) * skill.confidence +
                                   0.1 * feedback)
                skill.usage_count += 1
                scores[skill_name] = skill.confidence

        return scores

    def analyze_gaps(self, required_skills: List[str],
                     current_scores: Dict[str, float]) -> List[str]:
        """
        缺口分析：找出缺失或薄弱的技能
        """
        gaps = []
        for req in required_skills:
            if req not in self.tree.skills:
                gaps.append(req)  # 完全缺失
            elif current_scores.get(req, 0) < 0.3:
                gaps.append(req)  # 存在但薄弱
        return gaps

    def synthesize_skill(self, gap_name: str,
                         context: dict) -> Optional[Skill]:
        """
        技能合成：使用 LLM 生成新技能代码
        """
        # 先检查经验缓存
        cache_key = hashlib.md5(
            json.dumps({"gap": gap_name, "context": context},
                       sort_keys=True).encode()
        ).hexdigest()

        if cache_key in self.experience_cache:
            print(f"[经验命中] 从缓存恢复技能: {gap_name}")
            return self._restore_from_cache(cache_key)

        # 使用 LLM 生成新技能
        prompt = self._build_synthesis_prompt(gap_name, context)
        response = self.llm.generate(prompt)

        skill = self._parse_skill_code(response, gap_name)
        if skill:
            # 缓存经验模式
            self.experience_cache[cache_key] = self._encode_experience(skill)
            skill.experience_hash = cache_key

        return skill

    def _build_synthesis_prompt(self, gap: str, context: dict) -> str:
        return f"""作为自进化 AI Agent，你需要合成以下缺失技能：

技能名称：{gap}
当前上下文：{json.dumps(context, indent=2)}

请生成该技能的 Python 实现代码，要求：
1. 函数签名为 execute(**kwargs) -> dict
2. 包含错误处理和边界条件
3. 返回标准化的结果字典
"""

    def _parse_skill_code(self, code_response: str,
                          name: str) -> Optional[Skill]:
        """解析 LLM 返回的代码，创建 Skill 对象"""
        try:
            # 提取代码块（简化版，实际使用 AST 解析）
            const BT = String.fromCharCode(96);
            const tripleBT = BT.repeat(3);
            const codeBlock = code_response.split(tripleBT + "python")[1];
            const code = codeBlock ? codeBlock.split(tripleBT)[0].trim() : "";
            exec_namespace = {}
            exec(code, exec_namespace)
            execute_fn = exec_namespace.get("execute")
            if execute_fn:
                return Skill(
                    name=name,
                    description=f"Auto-evolved skill: {name}",
                    execute=execute_fn,
                    status=SkillStatus.EVOLVED,
                    confidence=0.1  # 初始低置信度
                )
        except Exception as e:
            print(f"[技能合成失败] {name}: {e}")
        return None

    def evolve_cycle(self, task_results: List[dict],
                     next_task_requirements: List[str]) -> List[str]:
        """
        完整的进化循环：评估 → 分析 → 合成 → 集成
        返回新进化的技能列表
        """
        # 阶段 1：自我评估
        scores = self.assess(task_results)
        print(f"[评估] 当前技能置信度: {scores}")

        # 阶段 2：缺口分析
        gaps = self.analyze_gaps(next_task_requirements, scores)
        if not gaps:
            print("[进化] 无能力缺口，跳过本轮进化")
            return []

        print(f"[分析] 发现 {len(gaps)} 个能力缺口: {gaps}")

        # 阶段 3 & 4：技能合成与集成
        evolved = []
        for gap in gaps:
            new_skill = self.synthesize_skill(gap, {"generation": self.tree.evolution_generation})
            if new_skill:
                self.tree.add_skill(new_skill)
                evolved.append(gap)
                print(f"[集成] ✓ 新技能 '{gap}' 已加入技能树")

        self.tree.evolution_generation += 1
        return evolved


# ==================== 使用示例 ====================
class MockLLM:
    """模拟 LLM 客户端（用于演示）"""
    def generate(self, prompt: str) -> str:
        return '''\
def execute(**kwargs) -> dict:
    """Auto-evolved web scraping skill"""
    import urllib.request
    url = kwargs.get("url", "")
    try:
        response = urllib.request.urlopen(url, timeout=10)
        return {"success": True, "content": response.read().decode()}
    except Exception as e:
        return {"success": False, "error": str(e)}
'''


if __name__ == "__main__":
    # 初始化种子技能树
    tree = SkillTree()
    tree.add_skill(Skill(
        name="basic_search",
        description="基础搜索能力",
        execute=lambda **kw: {"success": True, "result": "found"},
        confidence=0.8
    ))
    tree.add_skill(Skill(
        name="text_summary",
        description="文本摘要能力",
        execute=lambda **kw: {"success": True, "result": "summarized"},
        confidence=0.5
    ))

    # 创建元认知循环引擎
    agent = MetacognitiveLoop(MockLLM(), tree)

    # 模拟任务执行结果（text_summary 表现不佳）
    task_results = [
        {"skill_used": "basic_search", "success": True, "feedback_score": 0.9},
        {"skill_used": "text_summary", "success": False, "feedback_score": -0.3},
    ]

    # 下一个任务需要的能力
    next_requirements = ["basic_search", "text_summary", "web_scraping", "data_analysis"]

    # 执行进化循环
    evolved_skills = agent.evolve_cycle(task_results, next_requirements)
    print(f"\\n[结果] 本轮进化获得 {len(evolved_skills)} 个新技能: {evolved_skills}")
    print(f"[状态] 技能树共 {len(tree.skills)} 个技能, 进化代数: {tree.evolution_generation}")`
        },
      ],
    },
    {
      title: "四、Evolver 基因组进化引擎",
      body: `Evolver 代表了自进化 Agent 的另一条路线——基因组进化。与 GenericAgent 的「代码自生成」不同，Evolver 将 Agent 的能力配置编码为可遗传的基因组。

**核心概念：GEP（Gene Expression Programming）**

GEP 是基因表达编程的缩写，它将候选解编码为固定长度的字符串（染色体），然后通过以下机制进化：

1. **染色体结构**：每个 Agent 的能力配置被编码为一个基因字符串，包含头（Head）和尾（Tail）两部分
2. **表达树**：基因字符串被解码为表达式树（Expression Tree），表示 Agent 的行为逻辑
3. **适应度函数**：根据 Agent 在任务上的表现计算适应度
4. **遗传操作**：选择、交叉、变异、转座

**与 GenericAgent 的关键区别：**

| 维度 | GenericAgent（技能树） | Evolver（基因组） |
|------|----------------------|------------------|
| 进化单位 | 独立技能函数 | 编码基因组 |
| 变异方式 | LLM 代码生成 | 基因突变+交叉 |
| 可解释性 | 高（直接看代码） | 中（需解码表达树） |
| 探索空间 | 开放（LLM 创造力） | 受限但可控 |
| 进化速度 | 快但可能不稳定 | 较慢但稳定 |
| 可审计性 | 中（需人工审查代码） | 高（完整进化轨迹） |

**为什么基因组路线有其独特价值：**

基因组进化的最大优势是**可审计性**。每一次能力变化都可以追溯到具体的基因突变事件，这在安全敏感场景中至关重要。此外，基因组进化天然支持「回滚」——你可以回到任意一代的基因配置。`,
      code: [
        {
          lang: "python",
          filename: "evolver_gep_engine.py",
          code: `"""
Evolver 基因组进化引擎简化实现
展示 GEP（Gene Expression Programming）在 Agent 进化中的应用
"""
import random
import math
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional


# ==================== 基因编码 ====================

# GEP 基因集：定义 Agent 能力的「操作符」
FUNCTIONS = {
    # 感知类操作符
    "observe": {"arity": 1, "desc": "观察环境状态"},
    "analyze": {"arity": 1, "desc": "分析输入数据"},
    "classify": {"arity": 1, "desc": "分类判断"},
    # 决策类操作符
    "if_then": {"arity": 3, "desc": "条件分支"},
    "switch": {"arity": 2, "desc": "多路选择"},
    "loop": {"arity": 2, "desc": "循环执行"},
    # 执行类操作符
    "act": {"arity": 1, "desc": "执行动作"},
    "communicate": {"arity": 1, "desc": "输出/通信"},
    "store": {"arity": 1, "desc": "存储记忆"},
    "retrieve": {"arity": 1, "desc": "检索记忆"},
    # 元认知类操作符
    "reflect": {"arity": 1, "desc": "自我反思"},
    "adapt": {"arity": 2, "desc": "适应调整"},
}

TERMINALS = ["input", "memory", "state", "goal", "reward", "feedback"]


@dataclass
class Chromosome:
    """GEP 染色体——Agent 能力的基因编码"""
    genes: List[str]  # 基因字符串
    head_length: int = 15
    tail_length: int = 8

    def __init__(self, genes: Optional[List[str]] = None,
                 head_length: int = 15, tail_length: int = 8):
        self.head_length = head_length
        self.tail_length = tail_length
        total = head_length + tail_length
        if genes is None:
            # 随机初始化：头部可以包含函数和终端，尾部只包含终端
            all_symbols = list(FUNCTIONS.keys()) + TERMINALS
            self.genes = [random.choice(all_symbols) for _ in range(head_length)]
            self.genes += [random.choice(TERMINALS) for _ in range(tail_length)]
        else:
            self.genes = genes[:total]
            # 确保尾部只包含终端
            for i in range(head_length, len(self.genes)):
                if self.genes[i] in FUNCTIONS:
                    self.genes[i] = random.choice(TERMINALS)

    def express(self) -> str:
        """
        将基因字符串表达为行为树（简化版）
        返回表达式的字符串表示
        """
        # 从前到后构建表达式树
        node_stack = []
        pos = 0

        while pos < len(self.genes) and pos < self.head_length:
            gene = self.genes[pos]
            if gene in FUNCTIONS:
                arity = FUNCTIONS[gene]["arity"]
                args = []
                for _ in range(arity):
                    if node_stack:
                        args.insert(0, node_stack.pop())
                    else:
                        args.insert(0, TERMINALS[0])
                node_stack.append(f"{gene}({','.join(args)})")
            elif gene in TERMINALS:
                node_stack.append(gene)
            pos += 1

        return node_stack[-1] if node_stack else "noop"

    def mutate(self, mutation_rate: float = 0.1) -> 'Chromosome':
        """基因突变"""
        new_genes = self.genes.copy()
        for i in range(len(new_genes)):
            if random.random() < mutation_rate:
                if i < self.head_length:
                    # 头部：可以是函数或终端
                    all_symbols = list(FUNCTIONS.keys()) + TERMINALS
                    new_genes[i] = random.choice(all_symbols)
                else:
                    # 尾部：只能是终端
                    new_genes[i] = random.choice(TERMINALS)
        return Chromosome(new_genes, self.head_length, self.tail_length)

    def crossover(self, other: 'Chromosome', point: Optional[int] = None) -> 'Chromosome':
        """单点交叉"""
        if point is None:
            point = random.randint(1, len(self.genes) - 2)
        child_genes = self.genes[:point] + other.genes[point:]
        child = Chromosome(child_genes, self.head_length, self.tail_length)
        return child

    def fitness(self, task_results: List[float]) -> float:
        """
        适应度计算：基于任务表现的加权评分
        """
        if not task_results:
            return 0.0
        # 近期表现权重更高
        weighted = sum(r * (1.1 ** i) for i, r in enumerate(task_results))
        return weighted / sum(1.1 ** i for i in range(len(task_results)))


# ==================== 进化引擎 ====================

class EvolutionEngine:
    """GEP 进化引擎"""

    def __init__(self, population_size: int = 50,
                 head_length: int = 15, tail_length: int = 8):
        self.population_size = population_size
        self.head_length = head_length
        self.tail_length = tail_length
        self.population: List[Chromosome] = []
        self.generation = 0
        self.best_fitness = 0.0
        self.history: List[Dict] = []

    def initialize(self):
        """初始化种群"""
        self.population = [
            Chromosome(head_length=self.head_length,
                       tail_length=self.tail_length)
            for _ in range(self.population_size)
        ]

    def evaluate(self, chromosome: Chromosome) -> List[float]:
        """
        评估染色体的适应度
        实际应用中，这里运行 Agent 在测试任务上的表现
        """
        # 模拟评估：表达树越复杂（非越复杂越好，而是结构合理），适应度越高
        expression = chromosome.express()
        # 基础分：表达式的「功能密度」
        func_count = sum(1 for g in chromosome.genes[:self.head_length]
                         if g in FUNCTIONS)
        # 加分项：使用了多种操作符
        unique_funcs = len(set(g for g in chromosome.genes[:self.head_length]
                               if g in FUNCTIONS))
        return [0.3 + 0.4 * (func_count / self.head_length) +
                0.3 * (unique_funcs / len(FUNCTIONS))]

    def select_parents(self, tournament_size: int = 5) -> Tuple[Chromosome, Chromosome]:
        """锦标赛选择"""
        def tournament():
            candidates = random.sample(self.population, tournament_size)
            return max(candidates, key=lambda c: c.fitness(self.evaluate(c)))

        return tournament(), tournament()

    def evolve(self, generations: int = 100,
               mutation_rate: float = 0.1,
               crossover_rate: float = 0.7,
               elitism_count: int = 2) -> Dict:
        """
        执行进化
        """
        if not self.population:
            self.initialize()

        for gen in range(generations):
            # 精英保留
            sorted_pop = sorted(self.population,
                                key=lambda c: c.fitness(self.evaluate(c)),
                                reverse=True)
            elites = sorted_pop[:elitism_count]

            # 生成新一代
            new_population = elites.copy()
            while len(new_population) < self.population_size:
                parent1, parent2 = self.select_parents()

                if random.random() < crossover_rate:
                    child = parent1.crossover(parent2)
                else:
                    child = Chromosome(parent1.genes.copy(),
                                       self.head_length, self.tail_length)

                child = child.mutate(mutation_rate)
                new_population.append(child)

            self.population = new_population
            self.generation += 1

            # 记录统计信息
            fitnesses = [c.fitness(self.evaluate(c)) for c in self.population]
            best = max(fitnesses)
            avg = sum(fitnesses) / len(fitnesses)

            if best > self.best_fitness:
                self.best_fitness = best

            if gen % 10 == 0:
                self.history.append({
                    "generation": gen,
                    "best_fitness": round(best, 4),
                    "avg_fitness": round(avg, 4),
                    "best_expression": sorted_pop[0].express()
                })

        return {
            "generations": generations,
            "final_best_fitness": round(self.best_fitness, 4),
            "best_chromosome": sorted_pop[0].express(),
            "history": self.history
        }


# ==================== 使用示例 ====================
if __name__ == "__main__":
    print("=== Evolver 基因组进化引擎 ===")

    engine = EvolutionEngine(population_size=30, head_length=12, tail_length=6)
    engine.initialize()

    result = engine.evolve(generations=50, mutation_rate=0.08, crossover_rate=0.75)

    print(f"\\n进化完成！")
    print(f"最终代际: {result['generations']}")
    print(f"最优适应度: {result['final_best_fitness']}")
    print(f"最优个体表达: {result['best_chromosome']}")

    print(f"\\n进化历程（每 10 代采样）：")
    for entry in result["history"][:5]:
        print(f"  第 {entry['generation']:3d} 代 | "
              f"最优: {entry['best_fitness']:.4f} | "
              f"平均: {entry['avg_fitness']:.4f}")`
        },
      ],
    },
    {
      title: "五、技术路线对比与选型指南",
      body: `两种自进化路线各有优劣，选择哪条路线取决于你的应用场景。

**选型决策矩阵：**

| 场景 | 推荐路线 | 原因 |
|------|---------|------|
| 开放域任务 Agent | 技能树进化 | 需要 LLM 的创造力应对未知场景 |
| 安全敏感应用 | 基因组进化 | 完整的可审计轨迹，可回滚 |
| 快速原型验证 | 技能树进化 | 开发周期短，立竿见影 |
| 长期稳定运行 | 基因组进化 | 进化稳定，不会出现「漂移」 |
| 资源受限环境 | 技能树进化 | GenericAgent 实现 6x token 效率 |
| 研究可解释性 | 基因组进化 | 基因→表达树的映射天然可解释 |
| 多 Agent 协作 | 基因组进化 | 基因交叉天然支持群体协作 |
| 个人 AI 助手 | 技能树进化 | 个性化强，能适应用户习惯 |

**融合趋势：**

2026 年下半年，我们已经开始看到两条路线的融合趋势——使用基因组进化的框架来管理技能树的生长，结合两者的优势。例如：
- 用基因组编码技能的选择和组合策略
- 用 LLM 生成具体技能实现
- 用 GEP 优化技能的调用顺序和参数

这种混合架构可能是未来自进化 Agent 的主流方向。`,
      mermaid: `graph LR
    subgraph "2026 Q1-Q2 基础架构"
        A1[GenericAgent 种子代码]
        A2[Evolver GEP 引擎]
        A3[可审计安全框架]
    end

    subgraph "2026 Q2-Q3 核心优化"
        B1[元认知循环优化]
        B2[经验缓存+效率优化]
        B3[适应度函数优化]
        B4[多目标进化]
    end

    subgraph "2026 Q3-Q4 架构融合"
        C1[多技能并行进化]
        C2[混合架构研究]
        C3[GEP 管理技能树]
        C4[LLM 生成技能实现]
    end

    subgraph "2027+ 工业部署"
        D1[大规模应用验证]
        D2[标准化安全框架]
    end

    A1 --> B1
    A1 --> B2
    A2 --> B3
    A2 --> B4
    A3 --> B3
    B1 --> C1
    B2 --> C1
    B3 --> C3
    B4 --> C3
    C1 --> D1
    C2 --> D1
    C3 --> D2
    C4 --> D2

    style A1 fill:#1e3a5f,stroke:#60a5fa,color:#fff
    style A2 fill:#1e3a5f,stroke:#60a5fa,color:#fff
    style A3 fill:#1e3a5f,stroke:#60a5fa,color:#fff
    style B1 fill:#064e3b,stroke:#059669,color:#fff
    style B2 fill:#064e3b,stroke:#059669,color:#fff
    style B3 fill:#064e3b,stroke:#059669,color:#fff
    style B4 fill:#064e3b,stroke:#059669,color:#fff
    style C1 fill:#3730a3,stroke:#6366f1,color:#fff
    style C2 fill:#3730a3,stroke:#6366f1,color:#fff
    style C3 fill:#3730a3,stroke:#6366f1,color:#fff
    style C4 fill:#3730a3,stroke:#6366f1,color:#fff
    style D1 fill:#92400e,stroke:#d97706,color:#fff
    style D2 fill:#92400e,stroke:#d97706,color:#fff`,
    },
    {
      title: "六、实战：构建一个简易自进化 Agent",
      body: `下面我们将 GenericAgent 的技能树理念和 Evolver 的基因组理念结合，构建一个简易但完整的自进化 Agent。这个 Agent 能够：

1. 从种子技能开始执行任务
2. 根据任务表现评估能力缺口
3. 使用基因组编码选择进化策略
4. 通过 LLM 生成新技能代码
5. 验证并集成新技能
6. 持续进化`,
      code: [
        {
          lang: "python",
          filename: "self_evolving_agent.py",
          code: `"""
简易自进化 Agent 实战
结合技能树 + 基因组进化的混合架构
"""
import random
import json
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass, field


# ==================== 基础组件 ====================

@dataclass
class TaskResult:
    task_name: str
    success: bool
    score: float  # 0.0 - 1.0
    error_type: Optional[str] = None
    feedback: str = ""


@dataclass
class SkillNode:
    name: str
    execute: Callable
    confidence: float = 0.5
    evolution_source: str = "seed"  # seed | llm | genome
    generation_born: int = 0
    times_used: int = 0
    total_score: float = 0.0

    @property
    def avg_score(self) -> float:
        return self.total_score / max(self.times_used, 1)


class SelfEvolvingAgent:
    """
    混合架构自进化 Agent：
    - 技能树管理具体能力
    - 基因组编码进化策略
    - 元认知循环驱动进化
    """

    def __init__(self, name: str = "Agent",
                 max_skills: int = 20):
        self.name = name
        self.skills: Dict[str, SkillNode] = {}
        self.generation = 0
        self.max_skills = max_skills
        self.task_history: List[TaskResult] = []
        self.evolution_log: List[Dict] = []

        # 基因组编码：[进化策略, 突变率, 探索权重, 保留阈值]
        self.genome = [0.5, 0.1, 0.7, 0.3]

        # 注册种子技能
        self._register_seed_skills()

    def _register_seed_skills(self):
        """注册初始种子技能"""
        seeds = {
            "echo": SkillNode(
                name="echo",
                execute=lambda **kw: {"output": kw.get("input", "")},
                evolution_source="seed"
            ),
            "count": SkillNode(
                name="count",
                execute=lambda **kw: {"count": len(str(kw.get("input", "")))},
                evolution_source="seed"
            ),
            "classify_positive": SkillNode(
                name="classify_positive",
                execute=lambda **kw: {
                    "positive": float(kw.get("value", 0)) > 0
                },
                evolution_source="seed"
            ),
        }
        self.skills.update(seeds)

    def execute_task(self, task_name: str, required_skills: List[str],
                     **kwargs) -> TaskResult:
        """
        执行任务：使用当前技能尝试完成任务
        """
        available = [s for s in required_skills if s in self.skills]
        missing = [s for s in required_skills if s not in self.skills]

        if missing:
            return TaskResult(
                task_name=task_name,
                success=False,
                score=0.0,
                error_type="missing_skills",
                feedback=f"缺少技能: {', '.join(missing)}"
            )

        # 执行所有需要的技能
        total_score = 0.0
        for skill_name in available:
            skill = self.skills[skill_name]
            try:
                result = skill.execute(**kwargs)
                score = result.get("score", 0.7)  # 模拟评分
                skill.times_used += 1
                skill.total_score += score
                total_score += score
            except Exception as e:
                skill.confidence *= 0.9  # 失败降低置信度

        avg_score = total_score / max(len(available), 1)
        # 更新置信度
        for skill_name in available:
            self.skills[skill_name].confidence = (
                0.3 * avg_score + 0.7 * self.skills[skill_name].confidence
            )

        result = TaskResult(
            task_name=task_name,
            success=avg_score > 0.5,
            score=avg_score,
            feedback=f"使用 {len(available)} 个技能完成"
        )
        self.task_history.append(result)
        return result

    def metacognitive_cycle(self, upcoming_tasks: List[Dict]) -> List[str]:
        """
        元认知循环：评估 → 缺口分析 → 基因组决策 → 进化
        """
        evolved_skills = []

        # 阶段 1：收集所有需要的技能
        all_required = set()
        for task in upcoming_tasks:
            all_required.update(task.get("required_skills", []))

        # 阶段 2：缺口分析
        gaps = [s for s in all_required if s not in self.skills]
        weak = [name for name, skill in self.skills.items()
                if skill.confidence < self.genome[3]]  # 保留阈值

        if not gaps and not weak:
            print(f"[{self.name}] 无能力缺口，跳过进化")
            return []

        # 阶段 3：基因组决策——决定进化策略
        strategy = self._decode_genome_strategy(len(gaps), len(weak))

        print(f"[{self.name}] 发现 {len(gaps)} 个缺口 + {len(weak)} 个薄弱技能")
        print(f"[{self.name}] 基因组决策策略: {strategy}")

        # 阶段 4：执行进化
        if strategy == "llm_synthesis":
            # 使用 LLM 合成新技能（技能树路线）
            for gap in gaps[:3]:  # 每轮最多进化 3 个
                new_skill = self._llm_synthesize_skill(gap)
                if new_skill:
                    self._add_skill(new_skill)
                    evolved_skills.append(gap)

        elif strategy == "mutation":
            # 基因组变异（基因组路线）
            for weak_name in weak[:2]:
                mutated = self._mutate_skill(weak_name)
                if mutated:
                    evolved_skills.append(f"mutated_{weak_name}")

        elif strategy == "hybrid":
            # 混合策略
            for gap in gaps[:1]:
                new_skill = self._llm_synthesize_skill(gap)
                if new_skill:
                    self._add_skill(new_skill)
                    evolved_skills.append(gap)
            for weak_name in weak[:1]:
                mutated = self._mutate_skill(weak_name)
                if mutated:
                    evolved_skills.append(f"mutated_{weak_name}")

        self.generation += 1
        self._log_evolution(evolved_skills, strategy)

        # 基因组自适应调整
        self._adjust_genome(evolved_skills)

        return evolved_skills

    def _decode_genome_strategy(self, gap_count: int,
                                 weak_count: int) -> str:
        """
        根据基因组编码和当前状态决定进化策略
        genome[0]: 进化策略倾向 (0=基因组变异, 0.5=混合, 1=LLM合成)
        genome[2]: 探索权重 (高=更愿意尝试新策略)
        """
        strategy_bias = self.genome[0]
        exploration = self.genome[2]

        # 根据基因组决定策略
        score = strategy_bias + random.uniform(-exploration, exploration)

        if score < 0.33:
            return "mutation"
        elif score < 0.66:
            return "hybrid"
        else:
            return "llm_synthesis"

    def _llm_synthesize_skill(self, skill_name: str) -> Optional[SkillNode]:
        """
        使用 LLM 合成新技能
        （这里用模板模拟，实际应调用 LLM API）
        """
        skill_templates = {
            "web_scraping": lambda **kw: {
                "url": kw.get("url", ""),
                "status": "scraped"
            },
            "data_analysis": lambda **kw: {
                "data": kw.get("data", []),
                "analysis": "analyzed"
            },
            "code_generation": lambda **kw: {
                "prompt": kw.get("prompt", ""),
                "code": "# generated code"
            },
            "image_recognition": lambda **kw: {
                "image": kw.get("image", ""),
                "labels": ["object1", "object2"]
            },
            "sentiment_analysis": lambda **kw: {
                "text": kw.get("text", ""),
                "sentiment": random.choice(["positive", "negative", "neutral"])
            },
        }

        execute_fn = skill_templates.get(skill_name)
        if execute_fn:
            return SkillNode(
                name=skill_name,
                execute=execute_fn,
                evolution_source="llm",
                generation_born=self.generation,
                confidence=0.1  # 新技能初始低置信度
            )
        return None

    def _mutate_skill(self, skill_name: str) -> bool:
        """
        基因组变异：调整现有技能参数
        """
        if skill_name not in self.skills:
            return False

        skill = self.skills[skill_name]
        # 变异：提升置信度
        mutation_effect = random.uniform(0.05, 0.2)
        skill.confidence = min(1.0, skill.confidence + mutation_effect)
        skill.evolution_source = "genome"
        return True

    def _add_skill(self, skill: SkillNode):
        """添加新技能，检查容量限制"""
        if len(self.skills) >= self.max_skills:
            # 淘汰最弱的技能
            weakest = min(self.skills.values(), key=lambda s: s.confidence)
            if weakest.confidence < 0.3:
                del self.skills[weakest.name]
            else:
                return  # 不淘汰

        self.skills[skill.name] = skill
        print(f"  → 进化获得技能: {skill.name} (来源: {skill.evolution_source})")

    def _adjust_genome(self, evolved_skills: List[str]):
        """
        基因组自适应调整
        如果进化成功率高，保持当前策略；否则增加探索
        """
        success_rate = len(evolved_skills) / max(self.generation, 1)

        if success_rate > 0.5:
            # 成功率高，强化当前策略
            self.genome[0] = min(1.0, self.genome[0] + 0.05)
        else:
            # 成功率低，增加探索
            self.genome[2] = min(1.0, self.genome[2] + 0.1)

    def _log_evolution(self, evolved: List[str], strategy: str):
        self.evolution_log.append({
            "generation": self.generation,
            "strategy": strategy,
            "evolved_skills": evolved,
            "total_skills": len(self.skills),
            "avg_confidence": round(
                sum(s.confidence for s in self.skills.values()) /
                max(len(self.skills), 1), 2)
        })

    def status(self) -> Dict:
        return {
            "name": self.name,
            "generation": self.generation,
            "total_skills": len(self.skills),
            "avg_confidence": round(
                sum(s.confidence for s in self.skills.values()) /
                max(len(self.skills), 1), 3),
            "genome": [round(g, 3) for g in self.genome],
            "task_history": len(self.task_history),
        }


# ==================== 实战演示 ====================
if __name__ == "__main__":
    print("=" * 60)
    print("自进化 Agent 实战演示")
    print("=" * 60)

    agent = SelfEvolvingAgent("Alpha")
    print(f"\\n初始状态: {json.dumps(agent.status(), indent=2, ensure_ascii=False)}")

    # 定义任务序列
    tasks = [
        {"name": "文本处理", "required_skills": ["echo", "count"]},
        {"name": "数值分析", "required_skills": ["classify_positive", "data_analysis"]},
        {"name": "情感分析", "required_skills": ["echo", "sentiment_analysis"]},
        {"name": "代码生成", "required_skills": ["code_generation"]},
        {"name": "图像识别", "required_skills": ["image_recognition"]},
        {"name": "网页抓取", "required_skills": ["web_scraping", "data_analysis"]},
    ]

    for i, task in enumerate(tasks):
        print(f"\\n{'='*40}")
        print(f"任务 {i+1}: {task['name']}")
        print(f"需要技能: {task['required_skills']}")

        # 执行任务
        result = agent.execute_task(task["name"], task["required_skills"])
        print(f"结果: {'✓ 成功' if result.success else '✗ 失败'} "
              f"(评分: {result.score:.2f})")
        if not result.success:
            print(f"原因: {result.feedback}")

        # 每 2 个任务后执行元认知循环
        if (i + 1) % 2 == 0:
            upcoming = tasks[i+1:]
            if upcoming:
                evolved = agent.metacognitive_cycle(upcoming)
                if evolved:
                    print(f"进化获得: {evolved}")

    print(f"\\n{'='*60}")
    print(f"最终状态: {json.dumps(agent.status(), indent=2, ensure_ascii=False)}")
    print(f"\\n进化日志:")
    for log in agent.evolution_log:
        print(f"  第 {log['generation']} 代 | 策略: {log['strategy']} | "
              f"技能: {log['evolved_skills']} | "
              f"总数: {log['total_skills']} | "
              f"平均置信度: {log['avg_confidence']}")`
        },
      ],
    },
    {
      title: "七、关键挑战与未来方向",
      body: `尽管自进化 AI Agent 前景广阔，但目前仍面临诸多挑战：

**安全与可控性：**

这是自进化 Agent 最大的挑战。当 Agent 能够自主修改自身代码时，如何确保：
- 新代码不会引入安全漏洞？
- 进化不会导致能力退化（Catastrophic Forgetting）？
- Agent 不会进化出有害行为？

Evolver 的可审计轨迹是解决这个问题的重要方向。每一次进化都有完整的日志，可以回溯、审查、回滚。

**评估标准化：**

目前缺乏统一的自进化 Agent 评估基准。如何衡量一个 Agent 的「进化能力」？需要建立：
- 进化速度指标（单位时间内获得多少新能力）
- 进化质量指标（新能力的实际效用）
- 进化稳定性指标（进化是否会导致退化）
- Token 效率指标（进化过程的资源消耗）

**与主流 Agent 框架的集成：**

自进化能力需要与现有的 Agent 框架（如 LangChain、LlamaIndex、OpenAI Agents SDK）深度集成，才能在实际场景中发挥作用。2026 年下半年我们可能会看到主流框架开始内置自进化模块。`,
      table: {
        headers: ["维度", "GenericAgent", "Evolver", "Hermes Agent", "融合架构"],
        rows: [
          ["GitHub Stars", "5,949", "6,544", "110,855", "—"],
          ["周增长", "+4,216", "+638", "+22,083", "—"],
          ["进化方式", "LLM 代码生成", "GEP 基因组", "混合模式", "混合+GEP 管理"],
          ["种子代码量", "3.3K 行", "—", "—", "—"],
          ["Token 效率", "6x 提升", "—", "—", "目标 10x"],
          ["可审计性", "中", "高", "中", "高"],
          ["进化速度", "快", "中", "快", "快且稳"],
          ["适合场景", "开放域任务", "安全敏感", "通用", "全能"],
          ["主要风险", "代码质量不可控", "探索空间有限", "依赖 LLM", "复杂度高"],
          ["成熟度", "早期（v0.1）", "早期（v0.2）", "成熟（v1.x）", "研究阶段"],
        ],
      },
    },
    {
      title: "八、总结",
      body: `自进化 AI Agent 代表了 2026 年 AI 领域最令人兴奋的方向之一。它从根本上改变了我们与 AI 系统的关系——从「编程者-程序」转变为「引导者-进化体」。

**核心要点回顾：**

1. **两条路线各有千秋**：技能树进化（GenericAgent）快且灵活，基因组进化（Evolver）稳且可审计
2. **混合架构是趋势**：2026 年下半年开始出现融合两条路线优势的设计
3. **安全是首要挑战**：可审计性和可控性是生产部署的前提
4. **评估体系待建立**：需要标准化的基准来衡量进化能力
5. **Hermes Agent 领跑**：110K+ 星，2026 年增长最快的 AI Agent 项目

**推荐阅读路径：**
- 入门：先理解传统 Agent 架构（ReAct、Plan-and-Execute）
- 进阶：学习 GenericAgent 的元认知循环实现
- 深入：掌握 GEP 基因表达编程原理
- 实战：构建自己的混合架构自进化 Agent

自进化不是 AI 的终点，而是通向真正自主智能的必经之路。当 Agent 能够自主进化时，我们不再是在编写程序，而是在培育智能。`,
    },
  ],
};
