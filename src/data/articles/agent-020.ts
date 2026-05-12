// 自进化 AI Agent：让智能体从经验中持续成长

import { Article } from '../knowledge';

export const article: Article = {
  id: "agent-020",
  title: "自进化 AI Agent 全景解析：从经验积累到技能生长的持续进化之路",
  category: "agent",
  tags: ["自进化 Agent", "Hermes Agent", "GenericAgent", "Evolver", "技能树", "持续学习", "经验积累", "Meta-Cognition", "GEP", "2026 趋势"],
  summary: "2026 年，AI Agent 正在从「预定义工具调用」走向「自我进化」——通过经验积累、技能生长和群体进化，Agent 能够在执行任务中不断提升自身能力。NousResearch Hermes Agent 单周暴涨 42,000 stars，GenericAgent 以 3.3K 行种子代码自主生长技能树，Evolver 用基因组进化协议实现群体优化。本文深度解析自进化 Agent 的三大技术路线、架构设计、代码实现和未来趋势。",
  date: "2026-04-20",
  readTime: "28 min",
  level: "进阶",
  content: [
    {
      title: "1. 从静态 Agent 到自进化 Agent：范式的根本转变",
      body: `过去两年的 AI Agent 几乎都是静态的：开发者预先定义好工具列表、Prompt 模板和工作流程，Agent 在运行时只能在这些预设范围内操作。这种设计存在一个根本缺陷——Agent 无法从经验中学习。\n\n2026 年，三个几乎同时出现的开源项目打破了这一局限：\n\n- NousResearch Hermes Agent（101K stars，单周暴涨 42,612 stars）：提出「可成长型 Agent」概念，Agent 通过执行任务积累经验，压缩为可复用的知识模块注入未来会话\n- GenericAgent（4.4K stars，周增 3,218 stars）：从 3.3K 行种子代码开始，自主生长技能树，以 6 倍更少的 token 消耗实现全系统控制\n- EvoMap Evolver（5.3K stars，周增 2,964 stars）：基于 GEP（Genome Evolution Protocol）的群体进化引擎，多个 Agent 变体竞争进化\n\n这三种方案代表了自进化 Agent 的三条技术路线：经验积累型、技能生长型和群体进化型。`,
      mermaid: `graph TD
    A["静态 Agent
预定义工具 + 固定 Prompt"] -->|"无法从经验中学习"| B["能力天花板低
无法适应新场景"]
    A --> C["2026 范式转变"]
    C --> D["经验积累型
Hermes Agent"]
    C --> E["技能生长型
GenericAgent"]
    C --> F["群体进化型
Evolver/GEP"]
    D --> G["记忆压缩 + 上下文注入"]
    E --> H["自主发现操作 → 固化技能"]
    F --> I["变异 + 选择 + 交叉繁殖"]
    G --> J["持续成长型 Agent"]
    H --> J
    I --> J`,
      tip: "自进化 Agent 不是「更强的模型」，而是「更好的架构」。同样的基础模型，通过自进化机制可以在实际使用中变得越来越强。"
    },
    {
      title: "2. 三条技术路线深度解析",
      body: `### 2.1 经验积累型：Hermes Agent 的记忆引擎\n\nNousResearch 的 Hermes Agent 采用了最直觉的自进化思路：把每次执行的经验压缩成可复用的知识。\n\n核心流程：\n1. Agent 执行任务，记录完整的操作轨迹（调用什么工具、得到什么结果、遇到什么错误、如何修复）\n2. 任务完成后，用一个小型 LLM 对轨迹进行智能压缩——提取关键决策点和可复用模式\n3. 压缩后的知识存入向量数据库，按语义索引\n4. 下次遇到类似任务时，检索相关知识并注入上下文\n\n这种方案的优势是通用性强——不需要预先定义任何技能，Agent 在执行过程中自然积累经验。但缺点是知识质量依赖压缩算法，如果压缩过度会丢失关键细节，压缩不足则会浪费 context window。`,
      mermaid: `sequenceDiagram
    participant U as 用户
    participant A as Hermes Agent
    participant M as 记忆系统
    participant V as 向量数据库

    U->>A: 提交任务
    A->>A: 执行任务（记录完整轨迹）
    A->>U: 返回结果
    A->>M: 触发经验压缩
    M->>M: 提取关键决策点
过滤冗余信息
生成知识摘要
    M->>V: 存储压缩知识
    Note over U,V: 下次遇到类似任务时
    U->>A: 提交新任务
    A->>V: 语义检索相关知识
    V-->>A: 返回 Top-K 知识片段
    A->>A: 注入知识到上下文
    A->>U: 更优的执行结果`,
      code: [{ lang: "python", filename: "hermes_memory_compression.py", code: `"""
Hermes Agent 风格的经验压缩与知识检索系统
演示如何将 Agent 执行轨迹压缩为可复用知识
"""

import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime
import hashlib


@dataclass
class ExecutionTrajectory:
    """单次任务执行轨迹"""
    task_description: str
    steps: List[Dict]  # 每一步的工具调用和结果
    errors: List[str]
    final_result: str
    execution_time: float
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class CompressedKnowledge:
    """压缩后的知识片段"""
    knowledge_id: str
    task_pattern: str        # 任务模式描述
    key_decisions: List[str] # 关键决策点
    reusable_patterns: List[str]  # 可复用的操作模式
    error_handling: List[str]     # 错误处理经验
    embedding: List[float] = field(default_factory=list)


class ExperienceCompressor:
    """经验压缩器：将执行轨迹压缩为知识"""

    def compress(self, trajectory: ExecutionTrajectory) -> CompressedKnowledge:
        """
        压缩执行轨迹为核心知识
        实际生产环境会调用 LLM 进行智能压缩
        这里演示基于规则的简化版本
        """
        # 1. 提取关键决策点（工具调用发生变化的步骤）
        key_decisions = []
        for i, step in enumerate(trajectory.steps):
            if i == 0:
                key_decisions.append(f"起始：选择 {step['tool']} 处理任务")
            elif i > 0 and step['tool'] != trajectory.steps[i-1]['tool']:
                key_decisions.append(
                    f"切换策略：从 {trajectory.steps[i-1]['tool']} "
                    f"切换到 {step['tool']}，原因：{step.get('reason', '未知')}"
                )

        # 2. 提取可复用模式（成功使用的工具序列）
        tool_sequence = [s['tool'] for s in trajectory.steps]
        reusable_pattern = " → ".join(tool_sequence)

        # 3. 生成知识 ID
        knowledge_id = hashlib.md5(
            f"{trajectory.task_description}{reusable_pattern}".encode()
        ).hexdigest()[:12]

        return CompressedKnowledge(
            knowledge_id=knowledge_id,
            task_pattern=trajectory.task_description[:50],
            key_decisions=key_decisions,
            reusable_patterns=[reusable_pattern],
            error_handling=trajectory.errors[:3]  # 只保留前 3 个错误
        )


class KnowledgeRetriever:
    """知识检索器：为新任务找到相关知识"""

    def __init__(self):
        self.knowledge_base: Dict[str, CompressedKnowledge] = {}

    def store(self, knowledge: CompressedKnowledge):
        self.knowledge_base[knowledge.knowledge_id] = knowledge

    def retrieve(self, task_description: str, top_k: int = 3) -> List[CompressedKnowledge]:
        """
        简单语义匹配（生产环境使用向量相似度搜索）
        """
        # 简化版：关键词重叠匹配
        task_words = set(task_description.lower().split())
        scored = []
        for k_id, k in self.knowledge_base.items():
            pattern_words = set(k.task_pattern.lower().split())
            overlap = len(task_words & pattern_words)
            scored.append((overlap, k))
        scored.sort(reverse=True)
        return [k for _, k in scored[:top_k]]


# === 使用示例 ===
if __name__ == "__main__":
    compressor = ExperienceCompressor()
    retriever = KnowledgeRetriever()

    # 模拟一次任务执行
    trajectory = ExecutionTrajectory(
        task_description="从 GitHub 仓库分析项目技术栈并生成报告",
        steps=[
            {"tool": "file_reader", "action": "读取 package.json"},
            {"tool": "code_analyzer", "action": "分析依赖关系"},
            {"tool": "web_search", "action": "查询框架文档"},
            {"tool": "report_generator", "action": "生成技术栈报告"},
        ],
        errors=["file_reader: package.json 不存在，改用 pyproject.toml"],
        final_result="项目使用 FastAPI + Pydantic + SQLAlchemy 技术栈",
        execution_time=45.2
    )

    # 压缩经验
    knowledge = compressor.compress(trajectory)
    retriever.store(knowledge)
    print(f"知识已存储: {knowledge.knowledge_id}")
    print(f"关键决策: {knowledge.key_decisions}")

    # 下次遇到类似任务时检索
    similar_knowledge = retriever.retrieve("分析另一个 Python 项目的架构")
    print(f"\\n找到 {len(similar_knowledge)} 条相关知识")`
      }]
    },
    {
      title: "2.2 技能生长型：GenericAgent 的自主技能树",
      body: `GenericAgent 采用了完全不同的思路：不是积累经验，而是生长技能。\n\n它的核心理念是：Agent 从一个极小的「种子」开始（仅 3.3K 行代码），在执行任务的过程中：\n1. 探索：尝试新的操作方式（点击、输入、运行命令等）\n2. 验证：检查操作是否达到了预期效果\n3. 固化：如果操作成功，将其编码为新的「技能」节点\n4. 组合：新技能可以作为更复杂技能的基础\n\n这就像生物进化中的「适应性辐射」——一个简单生物在不同环境中演化出不同的器官和能力。GenericAgent 的 token 消耗比传统 Agent 低 6 倍，因为它不需要在每次调用时都携带庞大的工具列表，而是只加载当前场景需要的技能。`,
      code: [{ lang: "python", filename: "generic_agent_skill_tree.py", code: `"""
GenericAgent 风格的技能树生长系统
演示 Agent 如何从种子状态自主生长技能
"""

from typing import Dict, List, Optional, Callable, Set
from dataclasses import dataclass, field
import json


@dataclass
class Skill:
    """一个可执行的技能节点"""
    name: str
    description: str
    preconditions: Set[str]  # 需要的前置技能
    action: Callable         # 执行函数
    verified: bool = False   # 是否已验证
    usage_count: int = 0     # 使用次数


class SkillTree:
    """技能树：管理 Agent 的所有技能"""

    def __init__(self):
        self.skills: Dict[str, Skill] = {}
        self.available_skills: Set[str] = set()  # 已解锁的技能

    def add_seed_skills(self):
        """添加种子技能（Agent 的初始能力）"""
        self.skills["basic_read"] = Skill(
            name="basic_read",
            description="读取文件内容",
            preconditions=set(),
            action=self._basic_read_impl,
            verified=True
        )
        self.skills["basic_write"] = Skill(
            name="basic_write",
            description="写入文件内容",
            preconditions=set(),
            action=self._basic_write_impl,
            verified=True
        )
        self.skills["basic_shell"] = Skill(
            name="basic_shell",
            description="执行 shell 命令",
            preconditions=set(),
            action=self._basic_shell_impl,
            verified=True
        )
        self.available_skills = {"basic_read", "basic_write", "basic_shell"}

    def discover_new_skill(self, task_description: str,
                           attempted_actions: List[dict]) -> Optional[Skill]:
        """
        从执行过程中发现新技能
        Agent 尝试了一系列操作，如果成功就固化为新技能
        """
        for attempt in attempted_actions:
            if attempt["success"] and attempt["action_name"] not in self.skills:
                # 发现新技能！
                new_skill = Skill(
                    name=attempt["action_name"],
                    description=f"从任务「{task_description}」中发现",
                    preconditions=set(attempt.get("used_skills", [])),
                    action=self._placeholder_action,
                    verified=True,
                    usage_count=1
                )
                self.skills[new_skill.name] = new_skill
                self.available_skills.add(new_skill.name)
                return new_skill
        return None

    def plan_skill_chain(self, goal: str) -> List[str]:
        """
        为目标规划技能链：从当前可用技能出发，
        找到达成目标所需的技能序列
        """
        # 简化版：贪心匹配
        needed = self._infer_needed_skills(goal)
        chain = []
        for skill_name in needed:
            if skill_name in self.available_skills:
                chain.append(skill_name)
            else:
                # 需要生长新技能
                skill = self.skills.get(skill_name)
                if skill:
                    # 检查前置技能是否满足
                    if skill.preconditions.issubset(self.available_skills):
                        chain.append(skill_name)
                else:
                    chain.append(f"[需要发现: {skill_name}]")
        return chain

    def get_stats(self) -> dict:
        return {
            "total_skills": len(self.skills),
            "verified_skills": sum(1 for s in self.skills.values() if s.verified),
            "available_skills": len(self.available_skills),
            "most_used": max(self.skills.values(),
                           key=lambda s: s.usage_count).name
            if self.skills else "none"
        }

    # === 种子技能的具体实现 ===
    def _basic_read_impl(self, path: str) -> str:
        with open(path, 'r') as f:
            return f.read()

    def _basic_write_impl(self, path: str, content: str) -> str:
        with open(path, 'w') as f:
            f.write(content)
        return f"写入成功: {path}"

    def _basic_shell_impl(self, cmd: str) -> str:
        import subprocess
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.stdout or result.stderr

    def _placeholder_action(self, *args, **kwargs) -> str:
        return "placeholder"

    def _infer_needed_skills(self, goal: str) -> Set[str]:
        """从目标描述推断需要的技能（简化版）"""
        goal_lower = goal.lower()
        needed = set()
        if "read" in goal_lower or "分析" in goal_lower:
            needed.add("basic_read")
        if "write" in goal_lower or "创建" in goal_lower:
            needed.add("basic_write")
        if "run" in goal_lower or "执行" in goal_lower:
            needed.add("basic_shell")
        return needed


# === 使用示例 ===
if __name__ == "__main__":
    tree = SkillTree()
    tree.add_seed_skills()
    print(f"初始技能树: {tree.get_stats()}")

    # 模拟发现新技能
    tree.discover_new_skill(
        task_description="分析 Python 项目依赖",
        attempted_actions=[{
            "action_name": "parse_requirements",
            "success": True,
            "used_skills": ["basic_read"],
            "description": "解析 requirements.txt 文件"
        }]
    )
    print(f"发现新技能后: {tree.get_stats()}")

    # 规划技能链
    plan = tree.plan_skill_chain("读取项目文件并执行测试")
    print(f"技能链: {plan}")`
      }]
    },
    {
      title: "2.3 群体进化型：Evolver 的基因组进化协议",
      body: `Evolver 采用了最具生物进化意味的方案：让多个 Agent 变体同时运行，通过竞争和繁殖产生更优后代。\n\nGEP（Genome Evolution Protocol）的核心思想：\n1. 编码：将 Agent 的行为策略编码为「基因组」（一组参数和规则）\n2. 变异：对基因组进行随机变异，产生新的 Agent 变体\n3. 评估：在标准任务集上评估每个变体的表现\n4. 选择：保留表现最好的变体，淘汰差的\n5. 交叉：让优秀的变体「交配」，组合它们的优势\n\n这种方案特别适合需要持续优化的长期运行场景——比如 7×24 小时运行的客服 Agent、代码审查 Agent 或数据监控 Agent。Evolver 与 GenericAgent 的关键区别在于：GenericAgent 是个体学习（一个 Agent 逐渐变强），而 Evolver 是群体进化（一代代 Agent 迭代优化）。`,
      code: [{ lang: "python", filename: "evolver_gep_engine.py", code: `"""
Evolver 风格的 GEP（Genome Evolution Protocol）引擎
演示群体进化：变异 → 评估 → 选择 → 交叉
"""

import random
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field
from copy import deepcopy


@dataclass
class AgentGenome:
    """Agent 的基因组——编码其行为策略"""
    genome_id: str
    # 策略参数（模拟编码的行为特征）
    exploration_rate: float      # 探索 vs 利用的平衡
    retry_limit: int            # 失败重试次数
    tool_preference: Dict[str, float]  # 工具偏好权重
    prompt_complexity: float    # Prompt 复杂度偏好
    error_tolerance: float      # 对错误的容忍度
    # 适应度评分
    fitness: float = 0.0
    generation: int = 0


class GEPEvolver:
    """GEP 进化引擎"""

    def __init__(self, population_size: int = 10,
                 mutation_rate: float = 0.1):
        self.population: List[AgentGenome] = []
        self.population_size = population_size
        self.mutation_rate = mutation_rate
        self.generation = 0
        self.best_fitness_history: List[float] = []

    def initialize_population(self):
        """初始化随机种群"""
        for i in range(self.population_size):
            genome = AgentGenome(
                genome_id=f"gen0_{i:03d}",
                exploration_rate=random.uniform(0.1, 0.9),
                retry_limit=random.randint(1, 5),
                tool_preference={
                    "search": random.uniform(0.1, 1.0),
                    "code_exec": random.uniform(0.1, 1.0),
                    "file_io": random.uniform(0.1, 1.0),
                },
                prompt_complexity=random.uniform(0.1, 1.0),
                error_tolerance=random.uniform(0.1, 0.9),
                generation=0
            )
            self.population.append(genome)

    def evaluate_fitness(self, genome: AgentGenome) -> float:
        """
        评估 Agent 基因组的适应度
        实际生产中会在标准任务集上运行 Agent 并评分
        """
        # 简化模拟：假设最优策略有特定参数组合
        optimal = {
            "exploration_rate": 0.3,
            "retry_limit": 3,
            "tool_preference": {"search": 0.7, "code_exec": 0.8, "file_io": 0.5},
            "prompt_complexity": 0.6,
            "error_tolerance": 0.4,
        }
        score = 1.0
        score -= abs(genome.exploration_rate - optimal["exploration_rate"]) * 0.3
        score -= abs(genome.retry_limit - optimal["retry_limit"]) * 0.1
        for tool, pref in optimal["tool_preference"].items():
            score -= abs(genome.tool_preference.get(tool, 0) - pref) * 0.15
        score -= abs(genome.prompt_complexity - optimal["prompt_complexity"]) * 0.2
        score -= abs(genome.error_tolerance - optimal["error_tolerance"]) * 0.15
        return max(0, score)

    def mutate(self, genome: AgentGenome) -> AgentGenome:
        """对基因组进行变异"""
        child = deepcopy(genome)
        child.genome_id = f"gen{self.generation+1}_{random.randint(0,999):03d}"
        child.generation = self.generation + 1

        if random.random() < self.mutation_rate:
            child.exploration_rate = max(0, min(1,
                child.exploration_rate + random.gauss(0, 0.1)))
        if random.random() < self.mutation_rate:
            child.retry_limit = max(1, min(10,
                child.retry_limit + random.randint(-1, 1)))
        if random.random() < self.mutation_rate:
            for tool in child.tool_preference:
                child.tool_preference[tool] = max(0, min(1,
                    child.tool_preference[tool] + random.gauss(0, 0.1)))

        return child

    def crossover(self, parent1: AgentGenome,
                  parent2: AgentGenome) -> AgentGenome:
        """两个基因组交叉繁殖"""
        child = deepcopy(parent1)
        child.genome_id = f"gen{self.generation+1}_{random.randint(0,999):03d}"
        child.generation = self.generation + 1

        # 均匀交叉
        if random.random() < 0.5:
            child.exploration_rate = parent2.exploration_rate
        if random.random() < 0.5:
            child.retry_limit = parent2.retry_limit
        if random.random() < 0.5:
            child.prompt_complexity = parent2.prompt_complexity
        if random.random() < 0.5:
            child.error_tolerance = parent2.error_tolerance
        for tool in child.tool_preference:
            if random.random() < 0.5:
                child.tool_preference[tool] = parent2.tool_preference[tool]

        return child

    def evolve(self, generations: int = 20) -> List[float]:
        """运行多代进化"""
        for gen in range(generations):
            self.generation = gen + 1

            # 评估所有个体
            for genome in self.population:
                genome.fitness = self.evaluate_fitness(genome)

            # 排序并保留精英
            self.population.sort(key=lambda g: g.fitness, reverse=True)
            elite = self.population[:2]  # 保留前 2 名
            best_fitness = elite[0].fitness
            self.best_fitness_history.append(best_fitness)

            # 产生下一代
            new_population = list(elite)
            while len(new_population) < self.population_size:
                # 锦标赛选择
                tournament = random.sample(self.population, 3)
                p1 = max(tournament, key=lambda g: g.fitness)
                tournament = random.sample(self.population, 3)
                p2 = max(tournament, key=lambda g: g.fitness)

                if random.random() < 0.7:  # 70% 交叉
                    child = self.crossover(p1, p2)
                else:  # 30% 直接复制并变异
                    child = self.mutate(p1)

                # 所有个体都有变异机会
                child = self.mutate(child)
                new_population.append(child)

            self.population = new_population

        return self.best_fitness_history


# === 使用示例 ===
if __name__ == "__main__":
    random.seed(42)
    evolver = GEPEvolver(population_size=20, mutation_rate=0.15)
    evolver.initialize_population()

    print("开始 GEP 群体进化...")
    history = evolver.evolve(generations=30)

    print(f"\\n进化结果:")
    print(f"  初始最佳适应度: {history[0]:.4f}")
    print(f"  最终最佳适应度: {history[-1]:.4f}")
    print(f"  提升幅度: {(history[-1] - history[0]) / history[0] * 100:.1f}%")

    best = max(evolver.population, key=lambda g: g.fitness)
    print(f"\\n最优基因组参数:")
    print(f"  探索率: {best.exploration_rate:.3f}")
    print(f"  重试次数: {best.retry_limit}")
    print(f"  工具偏好: {best.tool_preference}")
    print(f"  Prompt 复杂度: {best.prompt_complexity:.3f}")`
      }]
    },
    {
      title: "3. 三种路线全面对比",
      body: `三条技术路线各有优劣，适用于不同的场景。选择哪种方案取决于你的具体需求：`,
      table: {
        headers: ["维度", "经验积累型 (Hermes)", "技能生长型 (GenericAgent)", "群体进化型 (Evolver)"],
        rows: [
          ["核心机制", "记忆压缩 + 语义检索", "探索 → 验证 → 固化", "变异 → 选择 → 交叉"],
          ["学习方式", "个体持续学习", "个体自主生长", "群体迭代进化"],
          ["启动成本", "低（直接开始）", "中（需要种子代码）", "高（需要评估环境）", ],
          ["token 效率", "中（知识注入增加上下文）", "高（只加载相关技能）", "中（评估需要额外 token）"],
          ["知识持久性", "高（向量数据库持久化）", "中（内存中技能树）", "高（基因组文件）"],
          ["适用场景", "长期个人助手", "自主任务执行", "持续优化的服务"],
          ["代表项目", "Hermes Agent (101K ★)", "GenericAgent (4.4K ★)", "Evolver (5.3K ★)"],
          ["本周增长", "+42,612 ★", "+3,218 ★", "+2,964 ★"],
          ["实现难度", "⭐⭐ 中等", "⭐⭐⭐ 较高", "⭐⭐⭐⭐ 高"],
          ["成熟度", "早期验证", "概念验证", "早期实验"],
        ]
      }
    },
    {
      title: "4. 自进化 Agent 的核心技术挑战",
      body: `虽然自进化 Agent 前景令人兴奋，但在走向生产级应用时还面临几个关键挑战：\n\n4.1 灾难性遗忘：Agent 在学到新技能的同时，可能遗忘旧的重要知识。Hermes Agent 通过知识分级（核心知识永久保留、边缘知识按需检索）来缓解。\n\n4.2 错误传播：如果 Agent 固化了一个错误的技能或经验，这个错误会持续影响后续决策。GenericAgent 通过技能验证机制（每个新技能必须通过测试用例）来防止。\n\n4.3 安全边界：自进化 Agent 可能学会危险的操作方式。**Claude**-Mem（63K stars，周增 14,371 stars）通过「沙箱 + 审计」机制——所有进化行为在沙箱中执行，关键操作需要人类审批。\n\n4.4 评估难题：如何量化 Agent 的「进步」？目前业界还没有统一的自进化 Agent 评估基准，这也是下一步需要突破的方向。`,
      mermaid: `graph LR
    A["自进化 Agent"] --> B["灾难性遗忘"]
    A --> C["错误传播"]
    A --> D["安全边界"]
    A --> E["评估难题"]

    B --> B1["知识分级策略"]
    B --> B2["经验回放机制"]

    C --> C1["技能验证测试"]
    C --> C2["版本回滚"]

    D --> D1["沙箱执行"]
    D --> D2["人类审批环"]

    E --> E1["任务完成率"]
    E --> E2["效率提升比"]
    E --> E3["新知识质量分"]`,
      warning: "自进化 Agent 目前在开源社区仍处于早期阶段。Hermes Agent 虽然一周暴涨 42K stars，但其核心进化机制的详细技术文档还不够完善。在生产环境中使用自进化 Agent 时，务必设置安全边界和人工审批环节。"
    },
    {
      title: "5. 实战：构建你的第一个自进化 Agent",
      body: `下面是一个将三种思路融合的最小可行实现。这个 Agent 同时具备经验积累、技能生长和简单的变异机制，可以作为你探索自进化 Agent 的起点。`,
      code: [{ lang: "python", filename: "self_evolving_agent.py", code: `"""
自进化 Agent 最小可行实现
融合：经验积累 + 技能生长 + 简单变异
"""

import json
import hashlib
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class AgentMemory:
    """Agent 的记忆系统"""
    experiences: List[Dict] = field(default_factory=list)
    skills: Dict[str, Dict] = field(default_factory=dict)
    strategy_params: Dict[str, float] = field(
        default_factory=lambda: {
            "exploration_rate": 0.5,
            "confidence_threshold": 0.7,
        }
    )

    def save_experience(self, task: str, result: str,
                        steps: List[Dict], success: bool):
        exp = {
            "task": task,
            "result": result,
            "steps": steps,
            "success": success,
            "timestamp": datetime.now().isoformat(),
        }
        self.experiences.append(exp)

        if success:
            # 从成功经验中提取技能
            self._extract_skills(steps)
        else:
            # 从失败经验中调整策略
            self._mutate_strategy()

    def _extract_skills(self, steps: List[Dict]):
        for step in steps:
            action = step.get("action", "")
            if action and action not in self.skills:
                self.skills[action] = {
                    "discovered": datetime.now().isoformat(),
                    "usage_count": 1,
                    "success_rate": 1.0,
                }
            elif action in self.skills:
                self.skills[action]["usage_count"] += 1

    def _mutate_strategy(self):
        """失败时微调策略参数（简单变异）"""
        self.strategy_params["exploration_rate"] = min(
            1.0, self.strategy_params["exploration_rate"] + 0.05)

    def get_context(self, task: str) -> str:
        """为新任务构建上下文"""
        context_parts = [f"任务: {task}\\n"]

        # 添加相关经验
        relevant = [e for e in self.experiences[-10:]
                    if any(w in e["task"].lower()
                          for w in task.lower().split())]
        if relevant:
            context_parts.append("相关经验:")
            for exp in relevant[-3:]:
                context_parts.append(
                    f"  - 任务: {exp['task']}\\n"
                    f"    结果: {exp['result']}\\n"
                    f"    成功: {exp['success']}")

        # 添加可用技能
        if self.skills:
            context_parts.append(f"\\n可用技能 ({len(self.skills)} 个):")
            top_skills = sorted(self.skills.items(),
                              key=lambda x: x[1]["usage_count"],
                              reverse=True)[:5]
            for name, info in top_skills:
                context_parts.append(
                    f"  - {name} (使用 {info['usage_count']} 次)")

        context_parts.append(
            f"\\n当前策略: exploration_rate="
            f"{self.strategy_params['exploration_rate']:.2f}")

        return "\\n".join(context_parts)

    def stats(self) -> dict:
        total = len(self.experiences)
        success = sum(1 for e in self.experiences if e["success"])
        return {
            "total_experiences": total,
            "success_rate": f"{success/total*100:.1f}%" if total else "N/A",
            "skills_discovered": len(self.skills),
            "exploration_rate": self.strategy_params["exploration_rate"],
        }


class SelfEvolvingAgent:
    """自进化 Agent"""

    def __init__(self):
        self.memory = AgentMemory()

    def execute_task(self, task: str) -> str:
        """
        执行任务并从中学习
        实际生产环境会调用 LLM
        """
        context = self.memory.get_context(task)

        # 模拟任务执行
        steps = self._simulate_execution(task)
        success = len(steps) > 0

        result = f"{'成功' if success else '失败'}完成任务: {task}"

        # 记录经验
        self.memory.save_experience(task, result, steps, success)

        return result

    def _simulate_execution(self, task: str) -> List[Dict]:
        """模拟执行步骤（简化演示）"""
        steps = []
        task_lower = task.lower()

        if "read" in task_lower or "分析" in task_lower:
            steps.append({"action": "file_read",
                         "tool": "filesystem", "status": "success"})
        if "write" in task_lower or "创建" in task_lower:
            steps.append({"action": "file_write",
                         "tool": "filesystem", "status": "success"})
        if "search" in task_lower or "搜索" in task_lower:
            steps.append({"action": "web_search",
                         "tool": "search_engine", "status": "success"})
        if "run" in task_lower or "执行" in task_lower:
            steps.append({"action": "shell_exec",
                         "tool": "terminal", "status": "success"})

        return steps


# === 演示：Agent 的进化过程 ===
if __name__ == "__main__":
    agent = SelfEvolvingAgent()

    tasks = [
        "读取项目配置文件",
        "创建新的测试文件",
        "搜索最新的 Python 框架",
        "执行单元测试",
        "分析项目依赖结构",  # 与第一个任务部分重叠
        "创建部署脚本并执行",
        "搜索 API 文档",
        "读取日志文件分析错误",
    ]

    print("=== 自进化 Agent 演示 ===\\n")
    for i, task in enumerate(tasks, 1):
        result = agent.execute_task(task)
        stats = agent.memory.stats()
        print(f"任务 {i}: {task}")
        print(f"  结果: {result}")
        print(f"  状态: {stats}")
        print()

    print("=== 最终上下文（为下一个任务准备）===")
    print(agent.memory.get_context("分析项目并生成报告"))`
      }]
    },
    {
      title: "6. 未来展望：自进化 Agent 将如何改变 AI 生态",
      body: `自进化 Agent 不仅是一个技术趋势，它可能从根本上改变我们与 AI 的交互方式：\n\n个人 Agent 的个性化：你的 Agent 会随着使用时间变得越来越懂你——记住你的偏好、习惯和决策模式。这不是简单的「记忆」，而是真正的「个性化进化」。\n\n企业 Agent 的持续优化：7×24 小时运行的客服 Agent、代码审查 Agent、数据监控 Agent 可以通过群体进化持续优化，无需人工干预。\n\n开源生态的加速：Hermes Agent 单周 42K stars 的增长说明社区对自进化 Agent 的极度渴望。未来可能会出现「Agent 技能市场」——开发者共享经过验证的技能模块，其他 Agent 可以直接加载。\n\n安全与治理的新挑战：自进化 Agent 的行为可能偏离初始设计，如何确保其安全性和可控性是 2026-2027 年最重要的研究课题之一。**Anthropic** 的 Glasswing 计划（40+ 科技巨头参与）和 MIT 的 LLM 安全机制研究已经开始探索这一方向。\n\n与垂直 Agent 的结合：自进化 + 垂直化 = 领域专家 Agent。想象一个自进化的医疗诊断 Agent，随着处理的病例越来越多，诊断准确率持续提升——这就是 AI 医疗的未来。`,
      mermaid: `graph TD
    2024 Q4 : 概念萌芽
AutoGPT 尝试自我改进
    2025 Q2 : 经验记忆
Claude-Mem 等记忆项目出现
    2025 Q4 : 技能生长
GenericAgent 提出技能树概念
    2026 Q1 : 群体进化
Evolver 发布 GEP 协议
    2026 Q2 : 爆发增长
Hermes Agent 单周 42K stars
    2026 Q3-Q4 : 标准化?
评估基准 + 安全框架
    2027 : 生产级应用?
企业级自进化 Agent 平台`,
      tip: "如果你想跟踪自进化 Agent 的最新进展，建议关注以下项目：NousResearch/hermes-agent（经验积累）、lsdefine/GenericAgent（技能生长）、EvoMap/evolver（群体进化）、thedotmack/claude-mem（记忆系统）。这四个项目代表了当前最前沿的探索方向。"
    },
    {
      title: "7. 总结",
      body: `自进化 AI Agent 正在从概念走向现实。2026 年的三个标志性项目——Hermes Agent、GenericAgent 和 Evolver——分别代表了经验积累、技能生长和群体进化三条技术路线，共同指向一个未来：AI Agent 不再是静态的工具，而是能够持续成长的伙伴。\n\n对于开发者来说，现在正是探索自进化 Agent 的最佳时机：开源社区活跃度极高，技术路线尚未收敛，每一个方向都有巨大的创新空间。本文提供的三个 Python 实现（经验压缩器、技能树、GEP 引擎）可以作为你深入探索的起点。\n\n关键要点：\n1. 自进化不是「更强的模型」，而是「更好的架构」\n2. 三条技术路线（经验积累/技能生长/群体进化）各有适用场景\n3. 安全边界和人类审批是自进化 Agent 走向生产的必要条件\n4. 开源社区的爆发式增长说明这一方向具有巨大的社区共识`
    }
  ]
};
