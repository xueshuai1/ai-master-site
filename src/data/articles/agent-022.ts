// Self-Evolving AI Agents：可自我进化的 AI Agent 架构与实践

import { Article } from '../knowledge';

export const article: Article = {
  id: "agent-022",
  title: "Self-Evolving AI Agent（一）：从固定指令到自主进化",
  category: "agent",
  tags: ["自我进化", "Hermes Agent", "GenericAgent", "Evolver", "GEP", "技能树", "经验压缩", "持续学习", "2026 趋势", "NousResearch"],
  summary: "2026 年 4 月，AI Agent 领域出现了一个激动人心的新范式：Self-Evolving（自我进化）AI Agent。NousResearch 的 Hermes Agent 单周暴涨 38,000 星突破 103K，lsdefine 的 GenericAgent 仅用 3,300 行种子代码就实现了完整系统控制且 token 消耗降低 6 倍，EvoMap 的 Evolver 则提出 GEP（基因组进化协议）驱动的自我进化引擎。这三大项目代表了三种不同的自我进化技术路线。本文深度解析自我进化 Agent 的架构原理、三种路线的对比分析，以及如何用 Python 构建一个简单的自进化 Agent 原型。",
  date: "2026-04-20",
  readTime: "28 min",
  level: "进阶",
  learningPath: {
    routeId: "self-evolving",
    phase: 1,
    order: 1,
    nextStep: "agent-024",
    prevStep: null,
  },
  content: [
    {
      title: "1. 为什么「自我进化」是 AI Agent 的下一个圣杯？",
      body: `2025 年到 2026 年，AI Agent 经历了从「玩具」到「工具」的转变。AutoGPT、BabyAGI、LangChain Agent 等项目证明了 AI Agent 可以完成实际任务。但所有这些项目都有一个**根本性缺陷**：它们是**静态的**。

一个静态 Agent 无论运行多少次任务，它的核心能力不会增长。它不会从失败中学习，不会积累领域知识，不会自动扩展技能边界。每次执行任务，它都在「从零开始」。

**自我进化 Agent 要解决的问题是：让 Agent 在运行过程中自动变得更强。**

这不是简单的 fine-tuning 或 RAG。自我进化的核心思想是：Agent 在执行任务的过程中，会自动识别自己的能力不足、压缩成功经验为可复用知识、并据此调整自己的架构和行为策略——**无需人类干预**。

2026 年 4 月，三个重量级项目同时涌现，各自提出了不同的自我进化方案：

| 项目 | Stars | 核心理念 | 进化方式 |
|------|-------|---------|---------|
| **NousResearch Hermes Agent** | 103K+ | "The agent that grows with you" | 经验压缩 + 知识注入 + 持续学习 |
| **GenericAgent** | 4,700+ | 从 3.3K 行种子代码自生长技能树 | 技能树自生长 + token 优化 |
| **EvoMap Evolver** | 5,700+ | GEP 基因组驱动的自我进化引擎 | 基因组进化协议 |

这三个项目的共同点是：**不再把 Agent 当「程序」，而是当「有机体」——它会成长、会学习、会进化。**`,
      mermaid: `graph TD
    A["传统 Agent
静态能力"] -->|"每次任务
从零开始"| B["任务执行"]
    B -->|"能力不变"| A
    
    C["Self-Evolving Agent
动态能力"] -->|"执行任务"| D["任务执行"]
    D -->|"经验捕获"| E["经验存储"]
    E -->|"知识压缩"| F["能力更新"]
    F -->|"更强能力"| C
    class F s4
    class E s3
    class D s2
    class C s1
    class A s0
    classDef s0 fill:#7f1d1d,color:#f1f5f9
    classDef s1 fill:#064e3b,color:#f1f5f9
    classDef s2 fill:#1e3a5f,color:#f1f5f9
    classDef s3 fill:#78350f,color:#f1f5f9,color:#1e293b
    classDef s4 fill:#7c3aed,color:#f1f5f9`,
    },
    {
      title: "2. 技术路线一：NousResearch Hermes Agent —— 经验压缩与知识注入",
      body: `NousResearch 的 Hermes Agent 是 2026 年 4 月 GitHub 上增长最快的 AI 项目——单周暴涨 38,194 星，总计突破 103,444 星。它的 slogan 很简洁：**"The agent that grows with you"**。

Hermes Agent 的核心架构包含三个模块：

**（1）Experience Capture（经验捕获）**
Agent 在执行任务时，会自动记录关键决策点、成功路径和失败原因。不同于简单的日志记录，Hermes 使用一个**经验编码器**将原始执行轨迹压缩为结构化的经验单元。

**（2）Knowledge Compression（知识压缩）**
捕获的经验经过压缩后存入经验库。压缩过程类似于人类的「复盘」——从具体的执行细节中提取通用模式。例如，多次成功的 API 调用会被压缩为"API 调用最佳实践"模板。

**（3）Skill Injection（技能注入）**
当 Agent 遇到新任务时，它会从经验库中检索相关经验，并将其注入到当前上下文中。这使得 Agent 可以「站在自己的肩膀上」思考，而不是每次都从零开始。

Hermes Agent 的突破在于它提出了一套**完整的经验生命周期**：捕获 → 压缩 → 检索 → 注入 → 再捕获，形成了一个自我强化的循环。`,
      mermaid: `sequenceDiagram
    participant User as 用户
    participant Agent as Hermes Agent
    participant ExpCapture as 经验捕获
    participant Knowledge as 知识库
    participant SkillInject as 技能注入
    
    User->>Agent: 发起任务请求
    Agent->>Knowledge: 检索相关经验
    Knowledge-->>SkillInject: 返回匹配经验
    SkillInject->>Agent: 注入上下文
    
    loop 任务执行
        Agent->>Agent: 基于经验执行
        Agent->>ExpCapture: 记录决策点
    end
    
    Agent-->>User: 返回结果
    
    ExpCapture->>Knowledge: 压缩并存储经验
    Note over Knowledge: 经验库自动增长`,
    },
    {
      title: "3. 技术路线二：GenericAgent —— 从种子代码自生长技能树",
      body: `lsdefine 的 GenericAgent 提出了一个截然不同的思路：**让 Agent 从极小的种子代码开始，自动生长出完整的技能树**。

根据项目描述，GenericAgent 仅用了 **3,300 行种子代码**就实现了完整系统控制，而且**token 消耗比传统 Agent 框架低 6 倍**。这是怎么做到的？

核心思想是**技能树自生长（Skill Tree Self-Growth）**：

1. **种子阶段**：Agent 从一个最小可用的种子代码开始，只有基本的执行能力和有限的几个初始技能。

2. **探索阶段**：Agent 在尝试解决任务时，发现自己缺少某些能力（比如"需要解析 YAML 配置文件"），就会自动生成新的技能模块。

3. **固化阶段**：新生成的技能经过验证后被固化到技能树中，下次遇到类似任务时直接调用，无需重新生成。

4. **优化阶段**：Agent 会定期评估技能树的效率，合并重复技能、删除冗余技能、优化高频技能的性能。

这种方法的惊人之处在于**启动成本极低**——不需要预先定义所有技能，Agent 会根据实际需求自动发现并学习新能力。token 消耗降低 6 倍的原因也很直观：每次任务只需要加载相关的子技能，而不是加载整个巨大的 prompt 模板。`,
      code: [
        {
          lang: "python",
          filename: "generic_agent_prototype.py",
          code: `"""
GenericAgent 风格的自生长技能树原型
从 3.3K 行种子代码自动发现并学习新技能
"""

from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional, Any
import hashlib


@dataclass
class Skill:
    """Agent 的一个技能"""
    name: str
    description: str
    executor: Callable
    usage_count: int = 0
    success_rate: float = 1.0
    dependencies: List[str] = field(default_factory=list)
    
    def execute(self, **kwargs) -> Any:
        """执行技能"""
        self.usage_count += 1
        try:
            result = self.executor(**kwargs)
            self.success_rate = (self.success_rate * (self.usage_count - 1) + 1) / self.usage_count
            return result
        except Exception as e:
            self.success_rate *= 0.9
            raise e


class SelfGrowingSkillTree:
    """自生长技能树"""
    
    def __init__(self):
        self.skills: Dict[str, Skill] = {}
        self.skill_attempts: Dict[str, int] = {}  # 尝试发现但未成功的技能
        self._register_seed_skills()
    
    def _register_seed_skills(self):
        """注册种子技能（最小初始集合）"""
        seed_skills = [
            Skill(
                name="execute_command",
                description="执行系统命令",
                executor=self._execute_cmd,
            ),
            Skill(
                name="read_file", 
                description="读取文件内容",
                executor=self._read_file,
            ),
            Skill(
                name="write_file",
                description="写入文件内容", 
                executor=self._write_file,
            ),
        ]
        for skill in seed_skills:
            self.register_skill(skill)
    
    def register_skill(self, skill: Skill):
        """注册新技能"""
        self.skills[skill.name] = skill
        print(f"  [+] 新技能: {skill.name} - {skill.description}")
    
    def discover_skill(self, task_description: str) -> Optional[Skill]:
        """
        从任务描述中自动发现需要的技能
        这是 GenericAgent 的核心：当现有技能无法完成任务时，
        Agent 会自动分析需求并生成新技能
        """
        # 模拟 LLM 生成新技能的逻辑
        skill_name = self._generate_skill_name(task_description)
        
        if skill_name in self.skills:
            return self.skills[skill_name]
        
        # 检查是否曾尝试过但失败了
        if skill_name in self.skill_attempts:
            self.skill_attempts[skill_name] += 1
            print(f"  [!] 技能 {skill_name} 已尝试 {self.skill_attempts[skill_name]} 次")
            return None
        
        print(f"  [*] 发现新技能需求: {skill_name}")
        self.skill_attempts[skill_name] = 1
        return None
    
    def _generate_skill_name(self, task: str) -> str:
        """从任务描述生成技能名称（模拟）"""
        # 实际中这里会调用 LLM 来生成技能定义
        keywords = task.lower().split()
        return "_".join(k for k in keywords if len(k) > 2)[:30]
    
    def execute_task(self, task: str, **kwargs) -> Any:
        """执行任务，自动选择或发现所需技能"""
        skill = self.discover_skill(task)
        if skill:
            print(f"  [✓] 使用技能: {skill.name}")
            return skill.execute(**kwargs)
        
        # 技能不存在，需要生长新技能
        print(f"  [?] 技能缺失，需要生长: {task}")
        return None
    
    # --- 种子技能的实现 ---
    
    @staticmethod
    def _execute_cmd(command: str, **kwargs):
        import subprocess
        return subprocess.run(command, shell=True, capture_output=True, text=True)
    
    @staticmethod
    def _read_file(path: str, **kwargs):
        with open(path, 'r') as f:
            return f.read()
    
    @staticmethod
    def _write_file(path: str, content: str, **kwargs):
        with open(path, 'w') as f:
            f.write(content)
        return f"写入成功: {path}"


# --- 使用示例 ---
if __name__ == "__main__":
    agent = SelfGrowingSkillTree()
    print("=== 种子技能 ===")
    print(f"  初始技能数: {len(agent.skills)}")
    print(f"  技能列表: {list(agent.skills.keys())}")
    
    print("\n=== 执行任务 ===")
    agent.execute_task("read file config.yaml")
    
    print("\n=== 技能树统计 ===")
    total_uses = sum(s.usage_count for s in agent.skills.values())
    print(f"  技能总数: {len(agent.skills)}")
    print(f"  总执行次数: {total_uses}")`
        }
      ],
    },
    {
      title: "4. 技术路线三：EvoMap Evolver —— GEP 基因组进化协议",
      body: `EvoMap 的 Evolver 项目提出了最「生物学」的自我进化方案——**GEP（Genome Evolution Protocol，基因组进化协议）**。

GEP 的核心思想是将 Agent 的能力编码为「基因组」，然后通过类似生物进化的机制（变异、选择、遗传）来优化 Agent 的能力：

**（1）基因组编码（Genome Encoding）**
每个 Agent 的能力配置被编码为一组「基因」，包括：
- **行为基因**：决定 Agent 的行为策略（如重试次数、超时策略）
- **知识基因**：决定 Agent 的知识检索策略（如 RAG 的 chunk size、检索数量）
- **技能基因**：决定 Agent 可用的工具集和调用顺序

**（2）适应度评估（Fitness Evaluation）**
Agent 执行任务后，系统会评估其表现，计算一个「适应度分数」。好的表现意味着对应的基因组更优秀。

**（3）变异与遗传（Mutation & Inheritance）**
表现好的 Agent 的基因组会被「遗传」给后续任务。同时，基因组会发生随机「变异」，引入新的行为模式。如果变异后的表现更好，新基因就会被保留。

这种方法的独特优势是：它不需要人类显式地定义「什么是好」——适应度函数自动从任务结果中学习。而且基因组进化可以持续进行，Agent 永远不会「到达天花板」。`,
      code: [
        {
          lang: "python",
          filename: "gep_evolution_engine.py",
          code: `"""
GEP (Genome Evolution Protocol) 进化引擎原型
模拟 EvoMap Evolver 的自我进化机制
"""

import random
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Any, Callable
import json


@dataclass
class Gene:
    """Agent 基因组中的一个基因"""
    name: str
    value: float  # 基因值，范围 [0, 1]
    mutation_rate: float = 0.1  # 变异率
    
    def mutate(self) -> 'Gene':
        """基因变异"""
        if random.random() < self.mutation_rate:
            delta = random.gauss(0, 0.15)
            new_value = max(0.0, min(1.0, self.value + delta))
            return Gene(self.name, new_value, self.mutation_rate)
        return self


@dataclass
class AgentGenome:
    """Agent 的完整基因组"""
    genes: Dict[str, Gene] = field(default_factory=dict)
    fitness: float = 0.0
    generation: int = 0
    
    def to_config(self) -> Dict[str, Any]:
        """将基因组解码为 Agent 配置"""
        config = {}
        # 行为基因 → Agent 行为参数
        config['max_retries'] = int(1 + self.genes['max_retries'].value * 9)
        config['temperature'] = 0.1 + self.genes['temperature'].value * 0.9
        config['max_tokens'] = int(500 + self.genes['max_tokens'].value * 3500)
        
        # 知识基因 → RAG 参数
        config['chunk_size'] = int(100 + self.genes['chunk_size'].value * 900)
        config['top_k'] = int(1 + self.genes['top_k'].value * 9)
        
        # 技能基因 → 工具调用策略
        config['tool_first'] = self.genes['tool_first'].value > 0.5
        config['parallel_tools'] = self.genes['parallel_tools'].value > 0.5
        
        return config
    
    @classmethod
    def create_random(cls, generation: int = 0) -> 'AgentGenome':
        """创建随机初始基因组"""
        genes = {
            'max_retries': Gene('max_retries', random.random()),
            'temperature': Gene('temperature', random.random()),
            'max_tokens': Gene('max_tokens', random.random()),
            'chunk_size': Gene('chunk_size', random.random()),
            'top_k': Gene('top_k', random.random()),
            'tool_first': Gene('tool_first', random.random()),
            'parallel_tools': Gene('parallel_tools', random.random()),
        }
        return cls(genes=genes, generation=generation)
    
    def crossover(self, other: 'AgentGenome') -> Tuple['AgentGenome', 'AgentGenome']:
        """基因交叉（两个基因组的重组）"""
        child1_genes = {}
        child2_genes = {}
        
        for name in self.genes:
            if random.random() < 0.5:
                child1_genes[name] = Gene(name, self.genes[name].value)
                child2_genes[name] = Gene(name, other.genes[name].value)
            else:
                child1_genes[name] = Gene(name, other.genes[name].value)
                child2_genes[name] = Gene(name, self.genes[name].value)
        
        next_gen = self.generation + 1
        return (
            AgentGenome(genes=child1_genes, generation=next_gen),
            AgentGenome(genes=child2_genes, generation=next_gen),
        )


class EvolutionEngine:
    """GEP 进化引擎"""
    
    def __init__(self, population_size: int = 20, 
                 mutation_rate: float = 0.1,
                 elite_ratio: float = 0.2):
        self.population_size = population_size
        self.mutation_rate = mutation_rate
        self.elite_count = int(population_size * elite_ratio)
        self.population: List[AgentGenome] = []
        self.best_fitness_history: List[float] = []
    
    def initialize(self):
        """初始化种群"""
        self.population = [
            AgentGenome.create_random() 
            for _ in range(self.population_size)
        ]
    
    def evaluate_fitness(self, genome: AgentGenome, 
                        eval_func: Callable) -> float:
        """评估基因组适应度"""
        config = genome.to_config()
        score = eval_func(config)
        genome.fitness = score
        return score
    
    def evolve(self, eval_func: Callable, generations: int = 50):
        """执行进化循环"""
        for gen in range(generations):
            # 1. 评估所有个体
            for genome in self.population:
                self.evaluate_fitness(genome, eval_func)
            
            # 2. 排序
            self.population.sort(key=lambda g: g.fitness, reverse=True)
            
            # 3. 记录最优
            best = self.population[0]
            self.best_fitness_history.append(best.fitness)
            
            # 4. 精英保留
            elites = self.population[:self.elite_count]
            
            # 5. 选择、交叉、变异生成新种群
            new_population = list(elites)
            
            while len(new_population) < self.population_size:
                # 锦标赛选择
                parent1 = random.choice(self.population[:10])
                parent2 = random.choice(self.population[:10])
                
                # 交叉
                child1, child2 = parent1.crossover(parent2)
                
                # 变异
                for gene in child1.genes.values():
                    gene.mutate()
                for gene in child2.genes.values():
                    gene.mutate()
                
                new_population.extend([child1, child2])
            
            self.population = new_population[:self.population_size]
            
            if gen % 10 == 0:
                print(f"  第 {gen} 代 | 最优适应度: {best.fitness:.4f} | "
                      f"配置: {best.to_config()}")
        
        return self.population[0]


# --- 使用示例 ---
if __name__ == "__main__":
    # 模拟适应度评估函数（实际中基于任务表现计算）
    def mock_eval(config: Dict) -> float:
        """模拟评估：假设最优温度在 0.6-0.8 之间"""
        temp_score = 1.0 - abs(config['temperature'] - 0.7) * 2
        retry_score = min(1.0, config['max_retries'] / 5)
        chunk_score = 1.0 - abs(config['chunk_size'] - 500) / 500
        return (temp_score * 0.4 + retry_score * 0.3 + chunk_score * 0.3)
    
    engine = EvolutionEngine(population_size=30, generations=50)
    engine.initialize()
    
    print("=== GEP 进化引擎开始 ===")
    print(f"  种群大小: {engine.population_size}")
    print(f"  进化代数: 50")
    print()
    
    best = engine.evolve(mock_eval, generations=50)
    
    print(f"\n=== 进化结果 ===")
    print(f"  最优适应度: {best.fitness:.4f}")
    print(f"  第 {best.generation} 代")
    print(f"  最优配置: {json.dumps(best.to_config(), indent=2, ensure_ascii=False)}")`
        }
      ],
    },
    {
      title: "5. 三大路线全面对比",
      body: `三种自我进化路线各有侧重，适用于不同场景。下表从多个维度进行全面对比：`,
      table: {
        headers: ["维度", "Hermes Agent", "GenericAgent", "Evolver (GEP)"],
        rows: [
          ["核心理念", "经验压缩与知识注入", "技能树自生长", "基因组进化协议"],
          ["进化单元", "经验片段", "技能模块", "基因参数"],
          ["进化触发", "每次任务后自动", "能力不足时自动", "定期评估后变异"],
          ["知识存储", "经验库（可检索）", "技能树（可调用）", "基因组（可遗传）"],
          ["启动成本", "中等（需要经验编码）", "极低（3.3K 种子代码）", "低（定义适应度函数）"],
          ["Token 效率", "中等", "高（降低 6 倍）", "高（参数化配置）"],
          ["GitHub Stars", "103,444+", "4,707", "5,774"],
          ["本周增长", "+38,194", "+3,512", "+3,434"],
          ["优势", "经验丰富、持续强化", "按需生长、极低启动", "自动优化、无需规则"],
          ["劣势", "经验库可能膨胀", "技能质量依赖 LLM", "适应度函数设计困难"],
          ["适用场景", "长期运行的个人 Agent", "探索性任务、新领域", "需要自动调优的系统"],
          ["技术关键词", "Experience Capture\nKnowledge Compression\nSkill Injection", "Skill Tree\nSelf-Growth\nToken Optimization", "GEP\nMutation\nCrossover\nFitness"],
        ]
      },
    },
    {
      title: "6. 如何构建自己的 Self-Evolving Agent",
      body: `结合三大项目的思路，我们可以设计一个混合式的自我进化 Agent 架构：

**第一步：定义能力基线**
从一个最小可用的 Agent 开始，定义它可以执行的基本操作集（类似 GenericAgent 的种子技能）。

**第二步：实现经验捕获**
在每次任务执行后，自动记录关键信息：使用了哪些工具？结果如何？遇到了什么错误？（类似 Hermes Agent 的经验捕获）

**第三步：建立进化循环**
定期评估 Agent 的表现，对表现不佳的部分进行「变异」（调整参数、更换工具、优化 prompt），对表现好的部分进行「固化」（存入经验库、加入技能树）。（类似 Evolver 的 GEP）

**第四步：持续迭代**
让 Agent 在运行中不断积累经验和优化能力。关键指标包括：任务成功率、平均执行时间、token 消耗量。`,
      mermaid: `graph TD
    A["最小可用 Agent
种子代码"] --> B["任务执行"]
    B --> C{执行结果}
    
    C -->|"成功"| D["经验捕获"]
    C -->|"失败"| E["错误分析"]
    
    D --> F["知识压缩"]
    E --> G["变异生成"]
    
    F --> H["经验库更新"]
    G --> I["技能树生长"]
    
    H --> J["定期评估"]
    I --> J
    
    J -->|"表现提升"| K["固化优秀策略"]
    J -->|"表现下降"| L["回退并重新变异"]
    
    K --> B
    L --> B
    class L s5
    class K s4
    class J s3
    class C s2
    class B s1
    class A s0
    classDef s0 fill:#78350f,color:#f1f5f9,color:#1e293b
    classDef s1 fill:#1e3a5f,color:#f1f5f9
    classDef s2 fill:#7f1d1d,color:#f1f5f9
    classDef s3 fill:#7c3aed,color:#f1f5f9
    classDef s4 fill:#064e3b,color:#f1f5f9
    classDef s5 fill:#7f1d1d,color:#f1f5f9`,
    },
    {
      title: "7. Python 实战：混合式 Self-Evolving Agent 完整实现",
      body: `下面是一个融合了三大路线思想的 Self-Evolving Agent 原型，包含经验捕获、技能生长和进化循环：`,
      code: [
        {
          lang: "python",
          filename: "self_evolving_agent.py",
          code: `"""
Self-Evolving Agent 完整实现
融合 Hermes Agent + GenericAgent + Evolver 三种思路

功能：
1. 经验捕获：记录每次任务执行轨迹
2. 技能生长：自动发现并注册新技能
3. 进化循环：定期评估并优化 Agent 配置
"""

import json
import time
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime


@dataclass
class Experience:
    """一条经验记录"""
    task: str
    tools_used: List[str]
    success: bool
    duration: float
    error: Optional[str] = None
    key_decisions: List[str] = field(default_factory=list)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def compress(self) -> Dict:
        """经验压缩：提取关键模式"""
        return {
            "task_pattern": self.task.split()[0] if self.task else "",
            "tools": self.tools_used,
            "success_rate_hint": 1.0 if self.success else 0.0,
            "duration_avg": self.duration,
        }


@dataclass 
class AgentConfig:
    """Agent 配置（进化目标）"""
    max_retries: int = 3
    temperature: float = 0.7
    max_tool_calls: int = 10
    use_reflection: bool = True
    
    def mutate(self) -> 'AgentConfig':
        """配置变异"""
        import random
        new = AgentConfig()
        new.max_retries = max(1, self.max_retries + random.choice([-1, 0, 1]))
        new.temperature = max(0.1, min(1.0, self.temperature + random.gauss(0, 0.1)))
        new.max_tool_calls = max(3, self.max_tool_calls + random.choice([-2, 0, 2]))
        new.use_reflection = self.use_reflection if random.random() > 0.2 else not self.use_reflection
        return new


class SelfEvolvingAgent:
    """自我进化 Agent"""
    
    def __init__(self, name: str = "EvoAgent"):
        self.name = name
        self.config = AgentConfig()
        self.experiences: List[Experience] = []
        self.skills: Dict[str, Callable] = {}
        self.success_history: List[float] = []
        self.generation = 0
        
        # 注册种子技能
        self._seed_skills()
    
    def _seed_skills(self):
        """注册初始种子技能"""
        self.skills = {
            "calculate": self._skill_calculate,
            "echo": self._skill_echo,
            "sleep": self._skill_sleep,
        }
    
    def execute(self, task: str) -> Dict:
        """执行任务（含经验捕获）"""
        start = time.time()
        tools_used = []
        
        try:
            # 1. 从经验库检索相关经验
            relevant = self._retrieve_experience(task)
            
            # 2. 选择并执行技能
            result = self._dispatch_task(task, tools_used)
            
            duration = time.time() - start
            
            # 3. 记录成功经验
            exp = Experience(
                task=task, tools_used=tools_used,
                success=True, duration=duration,
            )
            self.experiences.append(exp)
            self.success_history.append(1.0)
            
            return {"status": "success", "result": result, "duration": duration}
            
        except Exception as e:
            duration = time.time() - start
            
            # 3. 记录失败经验
            exp = Experience(
                task=task, tools_used=tools_used,
                success=False, duration=duration,
                error=str(e),
            )
            self.experiences.append(exp)
            self.success_history.append(0.0)
            
            return {"status": "error", "error": str(e), "duration": duration}
    
    def _retrieve_experience(self, task: str) -> List[Dict]:
        """从经验库检索相关经验"""
        keyword = task.split()[0].lower() if task else ""
        relevant = []
        for exp in self.experiences:
            if keyword in exp.task.lower():
                relevant.append(exp.compress())
        return relevant[:3]  # 最多返回 3 条
    
    def _dispatch_task(self, task: str, tools_used: list) -> Any:
        """分发任务到对应技能"""
        words = task.lower().split()
        
        for skill_name in self.skills:
            if skill_name in words:
                tools_used.append(skill_name)
                return self.skills[skill_name](task)
        
        # 技能不存在 → 生长新技能
        new_skill = self._grow_skill(task)
        if new_skill:
            tools_used.append(new_skill)
            return f"[新技能 {new_skill}] 已创建并执行"
        
        raise ValueError(f"无法处理任务: {task}")
    
    def _grow_skill(self, task: str) -> Optional[str]:
        """技能生长：从任务中发现新技能"""
        skill_name = task.split()[0].lower()
        if len(skill_name) < 2 or skill_name in self.skills:
            return None
        
        # 注册通用技能
        def generic_handler(t):
            return f"执行通用任务: {t}"
        
        self.skills[skill_name] = generic_handler
        print(f"  🌱 技能生长: {skill_name}")
        return skill_name
    
    def evolve(self, eval_window: int = 10):
        """进化循环：评估并优化配置"""
        if len(self.success_history) < eval_window:
            return
        
        recent = self.success_history[-eval_window:]
        current_rate = sum(recent) / len(recent)
        
        self.generation += 1
        old_config = asdict(self.config)
        
        # 如果成功率低于阈值，进行变异
        if current_rate < 0.6:
            self.config = self.config.mutate()
            print(f"  🧬 进化 #{self.generation} | "
                  f"成功率: {current_rate:.1%} → 变异配置")
        elif current_rate > 0.9:
            print(f"  ✅ 进化 #{self.generation} | "
                  f"成功率: {current_rate:.1%} → 配置稳定")
        else:
            print(f"  📊 进化 #{self.generation} | "
                  f"成功率: {current_rate:.1%} → 观察中")
    
    def get_stats(self) -> Dict:
        """获取 Agent 统计信息"""
        total = len(self.experiences)
        success = sum(1 for e in self.experiences if e.success)
        return {
            "name": self.name,
            "generation": self.generation,
            "total_tasks": total,
            "success_rate": success / total if total > 0 else 0,
            "skills_count": len(self.skills),
            "skills": list(self.skills.keys()),
            "config": asdict(self.config),
        }
    
    # --- 种子技能实现 ---
    
    @staticmethod
    def _skill_calculate(task: str) -> float:
        import re
        expr = re.sub(r'[^0-9+\-*/(). ]', '', task)
        return eval(expr) if expr else 0
    
    @staticmethod
    def _skill_echo(task: str) -> str:
        return f"Echo: {task}"
    
    @staticmethod
    def _skill_sleep(task: str) -> str:
        import re
        match = re.search(r'(\d+)', task)
        secs = int(match.group(1)) if match else 1
        time.sleep(min(secs, 3))
        return f"休眠 {secs} 秒"


# --- 演示 ---
if __name__ == "__main__":
    agent = SelfEvolvingAgent("MyEvoAgent")
    
    print("=" * 60)
    print("Self-Evolving Agent 演示")
    print("=" * 60)
    
    # 第一批任务
    tasks = [
        "calculate 2 + 3 * 4",
        "echo hello world",
        "sleep 1 second",
        "calculate 100 / 7",
        "search quantum computing",  # 新技能 → 自动生长
        "calculate 50 * 3",
        "analyze sentiment",         # 新技能 → 自动生长  
        "translate to English",      # 新技能 → 自动生长
        "calculate 1 + 1",
        "echo test message",
    ]
    
    for i, task in enumerate(tasks, 1):
        print(f"\n任务 {i}: {task}")
        result = agent.execute(task)
        status = "✅" if result["status"] == "success" else "❌"
        print(f"  {status} 耗时: {result['duration']:.3f}s")
    
    # 触发进化
    print(f"\n{'=' * 60}")
    print("触发进化评估")
    print(f"{'=' * 60}")
    agent.evolve()
    
    # 打印统计
    stats = agent.get_stats()
    print(f"\n{'=' * 60}")
    print("Agent 统计")
    print(f"{'=' * 60}")
    print(json.dumps(stats, indent=2, ensure_ascii=False))`
        }
      ],
    },
    {
      title: "8. 总结与展望",
      body: `自我进化 AI Agent 代表了 2026 年 AI 领域最激动人心的趋势之一。从 NousResearch Hermes Agent 的 103K stars 到 GenericAgent 的 6 倍 token 优化，再到 Evolver 的基因组进化协议，这三种路线共同指向一个未来：**Agent 不再是静态工具，而是可以自主成长的智能体**。

**核心要点回顾：**

1. **Hermes Agent** 证明了经验压缩和知识注入的可行性——Agent 可以从自己的经历中学习，不需要人类标注数据
2. **GenericAgent** 证明了技能树自生长的可行性——从极小的种子代码开始，Agent 可以按需自动发现和学习新能力
3. **Evolver (GEP)** 证明了基因组进化的可行性——Agent 的配置参数可以通过变异和选择自动优化

**下一步值得关注的项目：**
- **claude-mem**（63K 星）：自动记忆捕获，为进化提供数据基础
- **multica**（17K 星）：Managed Agent 平台，可以让多个进化 Agent 协作
- **ai-hedge-fund**（56K 星）：金融领域的多 Agent 协作，是进化 Agent 的绝佳应用场景

自我进化不是终点，而是起点。当 Agent 学会了自我进化，它就不再是一个被动的工具，而是一个持续成长的伙伴。这才是 AI Agent 真正的未来。`,
      mermaid: `graph TD
    2023 : ChatGPT 发布
         : 人类对话式 AI
    2024 : AutoGPT / BabyAGI
         : 单 Agent 自主执行
    2025 : LangChain / CrewAI
         : 多 Agent 协作
    2026 : Hermes / GenericAgent / Evolver
         : 自我进化 Agent
    2027 : ?
         : Agent 社会 / 集体智能`,
    },
  ],
};
