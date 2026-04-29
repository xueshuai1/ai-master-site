import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-006",
    title: "规划与反思：Self-Reflection 模式",
    category: "agent",
    tags: ["规划", "反思", "Self-Reflection"],
    summary: "让 Agent 学会自我纠错，理解规划与反思的设计模式",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
        {
            title: "1. 为什么需要反思：LLM 的固有局限",
            body: `大语言模型虽然强大，但存在几个根本性缺陷：幻觉（Hallucination）——生成看似合理但事实错误的内容；单次生成缺乏自我纠错能力——一旦输出便无法修正；缺乏对任务的全局规划——容易在复杂多步任务中偏离目标。研究表明，人类在解决问题时会不断反思自己的推理过程，发现错误后立即调整策略。这种「边做边想」的能力正是当前 LLM 所缺失的。引入反思机制后，Agent 不再是一次性生成答案的「黑盒」，而是具备了类似人类的自我监控和自我修正能力。Shinn 等人在 2023 年提出的 Reflexion 框架证明，通过让 Agent 对自身输出进行语言反馈式反思，在推理、编程和决策任务上的表现平均提升了 20%-30%。反思不是简单地问「你对吗？」，而是需要结构化的自我评估流程。`,
            code: [
                {
                    lang: "python",
                    code: `from typing import Optional
from dataclasses import dataclass

@dataclass
class ReflectionResult:
    """反思结果的结构化表示"""
    is_correct: bool
    confidence: float  # 0.0 ~ 1.0
    error_type: Optional[str]  # "hallucination" | "logic" | "format" | None
    correction: Optional[str]  # 修正建议
    reasoning: str  # 为什么这样判断`
                },
                {
                    lang: "python",
                    code: `import re
from openai import OpenAI

client = OpenAI()

def reflect_on_output(text: str, criteria: str) -> ReflectionResult:
    """让 LLM 对自身输出进行反思评估"""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": f"你是严格的代码审查员。评估标准：{criteria}"},
            {"role": "user", "content": f"审查以下输出是否存在问题：\\n\\n{text}"}
        ],
        response_format={"type": "json_object"}
    )
    import json
    data = json.loads(response.choices[0].message.content)
    return ReflectionResult(**data)`
                }
            ],
            table: {
                headers: ["缺陷类型", "表现", "反思能否解决", "典型场景"],
                rows: [
                    ["幻觉", "生成错误事实或虚构引用", "能——通过外部验证", "知识问答、文献综述"],
                    ["逻辑错误", "推理链条断裂", "能——通过逐步检查", "数学证明、算法设计"],
                    ["格式错误", "输出不符合规范", "能——通过格式校验", "JSON 生成、代码输出"],
                    ["目标偏离", "忘记原始任务要求", "部分——需配合规划", "多步骤任务执行"]
                ]
            },
            mermaid: `graph TD
    A[LLM 单次生成] --> B{存在缺陷？}
    B -->|是| C[产生错误输出]
    B -->|否| D[正确输出]
    C --> E[无法自我修正]
    E --> F[用户发现错误]
    F --> G[手动重试]
    D --> H[任务完成]
    class H s1
    class E s0
    classDef s0 fill:#7f1d1d
    classDef s1 fill:#14532d`,
            tip: "反思机制的核心价值在于将错误发现从「用户侧」移到「Agent 侧」，大幅降低人工干预频率",
            warning: "不要期望 LLM 在没有任何外部信号的情况下自发反思——必须通过架构设计强制引入反思步骤"
        },
        {
            title: "2. Reflexion 架构：行动-评估-反思循环",
            body: `Reflexion 是 Self-Reflection 范式的奠基性工作，其核心思想非常简单却极其有效：在执行任务后，让 Agent 评估自己的输出是否正确；如果不正确，分析错误原因并生成语言反馈；将这份反馈作为新的上下文，指导下一轮尝试。这个循环可以持续多轮，每轮 Agent 都会积累更多的「经验教训」。Reflexion 与传统的强化学习不同——它不需要设计稀疏的奖励函数，而是直接用自然语言作为反馈信号。这使得它能够应用于各种复杂任务，而不需要为每个任务定制奖励模型。实验表明，Reflexion 在 HotpotQA（多跳问答）上经过两轮反思后准确率提升 18%，在 HumanEval（代码生成）上提升 12%，在 ALFWorld（具身决策）上提升高达 35%。关键在于反思提示词的设计质量——好的反思提示词能让 LLM 真正定位到错误根源，而非泛泛而谈。`,
            code: [
                {
                    lang: "python",
                    code: `class ReflexionAgent:
    """Reflexion 核心循环：Act → Evaluate → Reflect"""

    def __init__(self, llm, max_reflections=3):
        self.llm = llm
        self.max_reflections = max_reflections
        self.reflection_history = []

    def run(self, task: str) -> str:
        trajectory = []
        reflections = []

        for attempt in range(self.max_reflections + 1):
            # Act: 根据当前知识和反思历史生成答案
            answer = self.act(task, trajectory, reflections)
            trajectory.append(answer)

            # Evaluate: 评估答案是否正确
            eval_result = self.evaluate(task, answer)
            if eval_result.is_correct:
                return answer

            # Reflect: 分析错误，生成改进反馈
            reflection = self.reflect(task, answer, eval_result)
            reflections.append(reflection)

        return answer  # 返回最后一次尝试

    def act(self, task, trajectory, reflections):
        prompt = self._build_act_prompt(task, reflections)
        return self.llm.generate(prompt)

    def evaluate(self, task, answer):
        prompt = self._build_eval_prompt(task, answer)
        return self.llm.generate_json(prompt)`
                },
                {
                    lang: "python",
                    code: `def reflect(task: str, answer: str, eval_result: EvalResult) -> str:
    """生成结构化的反思反馈"""
    prompt = f"""任务：{task}
你的回答：{answer}
评估结果：{'正确' if eval_result.is_correct else '错误'}
{'错误详情：' + eval_result.details if eval_result.details else ''}

请反思：
1. 你在哪一步出错了？
2. 错误的根本原因是什么？
3. 下次应该采取什么不同的策略？

请用简洁的语言回答，不超过 200 字。"""
    return llm.generate(prompt)

# 使用示例
agent = ReflexionAgent(llm=gpt4_client, max_reflections=3)
result = agent.run("找出 2024 年诺贝尔物理学奖得主的研究贡献")`
                }
            ],
            table: {
                headers: ["阶段", "输入", "输出", "关键设计要点"],
                rows: [
                    ["Act 行动", "任务 + 历史反思", "候选答案", "利用反思历史避免重复错误"],
                    ["Evaluate 评估", "任务 + 候选答案", "正确/错误 + 详情", "需要可靠的验证器（规则或 LLM）"],
                    ["Reflect 反思", "任务 + 答案 + 评估", "语言反馈", "聚焦错误根源，而非表面现象"]
                ]
            },
            mermaid: `sequenceDiagram
    participant T as Task
    participant A as Agent
    participant E as Evaluator
    participant R as Reflector
    T->>A: 输入任务
    A->>A: Act: 生成答案
    A->>E: 提交答案
    E->>E: 验证正确性
    E-->>A: 评估结果
    alt 答案正确
        A-->>T: 返回答案
    else 答案错误
        A->>R: 请求反思
        R->>R: 分析错误原因
        R-->>A: 反思反馈
        A->>A: 更新上下文
        A->>A: 再次 Act
    end`,
            tip: "设置合理的最大反思轮数（通常 3-5 轮），避免无限循环浪费 token",
            warning: "评估器（Evaluator）的质量直接决定 Reflexion 的效果——如果评估器本身不可靠，整个循环就会失去意义"
        },
        {
            title: "3. Plan-and-Solve：先规划后执行",
            body: `Plan-and-Solve（PaS）策略的核心直觉来自一个简单观察：让人类直接回答复杂问题时容易出错，但如果先制定计划、再按步骤执行，正确率会大幅提升。Wang 等人在 2023 年的论文中证明了这一点——他们让 LLM 先生成一个高层次的执行计划，然后逐步执行每个步骤，最后在 Chain-of-Thought 的基础上进一步提升了复杂数学推理的准确率。Plan-and-Solve 与传统 CoT 的关键区别在于：CoT 是边想边做，思维过程和答案生成混在一起；而 PaS 将「规划」和「执行」解耦，先全局思考、再局部执行。这种解耦带来的好处是：规划阶段可以考虑整体约束和依赖关系，避免「走一步看一步」导致的短视决策；执行阶段则专注于当前步骤的细节，不受其他步骤的干扰。对于多步骤的编程任务、数据分析流程或业务逻辑实现，PaS 模式能显著降低遗漏关键步骤的概率。`,
            code: [
                {
                    lang: "python",
                    code: `class PlanAndSolveAgent:
    """Plan-and-Solve Agent：先规划，再逐步执行"""

    def __init__(self, llm):
        self.llm = llm

    def run(self, task: str) -> str:
        # Phase 1: Plan — 生成执行计划
        plan = self.generate_plan(task)
        print(f"执行计划：\\n{plan}")

        # Phase 2: Solve — 按步骤执行
        results = []
        for i, step in enumerate(plan.steps, 1):
            step_result = self.execute_step(task, step, results)
            results.append(step_result)
            print(f"步骤 {i}/{len(plan.steps)}: {step_result}")

        # Phase 3: Synthesize — 综合所有步骤结果
        final = self.synthesize(task, results)
        return final

    def generate_plan(self, task: str) -> Plan:
        prompt = f"""任务：{task}

请制定一个详细的执行计划，包含：
1. 需要完成的所有子任务
2. 子任务之间的依赖关系
3. 每个步骤需要的输入和预期输出"""
        raw = self.llm.generate(prompt)
        return Plan.from_text(raw)`
                },
                {
                    lang: "python",
                    code: `class Plan:
    """结构化的执行计划"""

    @dataclass
    class Step:
        id: int
        description: str
        depends_on: List[int]  # 依赖的步骤 ID
        expected_output: str

    steps: List[Step]

    @classmethod
    def from_text(cls, text: str) -> 'Plan':
        """从 LLM 生成的文本中解析出结构化计划"""
        import re
        steps = []
        for i, match in enumerate(
            re.finditer(r'步骤[：:](.+?)(?=步骤|$)', text, re.DOTALL)
        ):
            desc = match.group(1).strip()
            steps.append(
                cls.Step(
                    id=i+1,
                    description=desc,
                    depends_on=[],  # 默认无依赖
                    expected_output=""
                )
            )
        return cls(steps=steps)

    def execution_order(self) -> List[Step]:
        """按依赖关系拓扑排序"""
        from graphlib import TopologicalSorter
        ts = TopologicalSorter()
        for step in self.steps:
            ts.add(step.id, *step.depends_on)
        ordered_ids = list(ts.static_order())
        return [s for s in self.steps if s.id in ordered_ids]`
                }
            ],
            table: {
                headers: ["特性", "Chain-of-Thought", "Plan-and-Solve", "Reflexion"],
                rows: [
                    ["推理方式", "边想边做", "先规划再执行", "做了再反思"],
                    ["错误处理", "无内置纠错", "规划阶段预防", "执行后纠错"],
                    ["适用场景", "单步推理", "多步骤任务", "需要精确答案的任务"],
                    ["Token 消耗", "中等", "较高（多阶段）", "较高（多轮次）"]
                ]
            },
            mermaid: `graph LR
    A[任务输入] --> B[Plan 规划阶段]
    B --> C[分解子任务]
    C --> D[确定依赖关系]
    D --> E[Solve 执行阶段]
    E --> F[逐步执行]
    F --> G[汇总结果]
    G --> H[最终答案]
    class E s1
    class B s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d`,
            tip: "对于依赖关系复杂的任务，在规划阶段使用拓扑排序确保执行顺序正确",
            warning: "规划阶段的质量至关重要——一个有缺陷的计划会导致所有后续步骤都是无用功"
        },
        {
            title: "4. Tree of Thoughts：多路径探索",
            body: `Tree of Thoughts（ToT）由 Yao 等人在 2023 年提出，是对 Chain-of-Thought 的革命性升级。CoT 的局限在于它只维护一条推理路径——一旦中间某步出错，整个推理链条就会崩塌。ToT 的核心思想是：让 LLM 同时生成多条推理路径（思维的分支），然后评估每条路径的前景，有策略地选择继续探索哪条路径、剪枝哪条路径。这就像下棋时同时考虑多种开局方案，而不是只走一步看一步。ToT 包含三个关键组件：思维分解（Thought Decomposition）——将大问题拆分为可评估的思维步骤；思维生成（Thought Generator）——从当前状态生成多个候选下一步；状态评估（State Evaluator）——为每条路径打分，指导搜索策略。搜索策略可以采用广度优先搜索（BFS）、深度优先搜索（DFS）或 A* 搜索。在创意写作、数学证明和战略规划等需要探索多种可能性的任务上，ToT 比 CoT 高出 50%-70% 的成功率。`,
            code: [
                {
                    lang: "python",
                    code: `class TreeNode:
    """ToT 搜索树节点"""

    def __init__(self, state: str, depth: int = 0):
        self.state = state       # 当前思维状态
        self.depth = depth       # 当前深度
        self.children = []       # 子节点（候选分支）
        self.value = 0.0         # 评估分数
        self.parent = None

    def add_child(self, child: 'TreeNode'):
        child.parent = self
        self.children.append(child)

class TreeOfThoughts:
    """Tree of Thoughts 搜索框架"""

    def __init__(self, llm, branching=3, max_depth=5, beam_width=5):
        self.llm = llm
        self.branching = branching    # 每个节点生成几个候选
        self.max_depth = max_depth    # 最大搜索深度
        self.beam_width = beam_width  # 束搜索宽度

    def search(self, initial_state: str) -> str:
        root = TreeNode(initial_state)
        frontier = [root]  # 当前层的候选节点

        for depth in range(self.max_depth):
            candidates = []

            # 生成：扩展每个 frontier 节点
            for node in frontier:
                children = self.generate_thoughts(node)
                for child in children:
                    node.add_child(child)
                    candidates.append(child)

            # 评估：为每个候选打分
            for candidate in candidates:
                candidate.value = self.evaluate(candidate)

            # 选择：保留得分最高的 beam_width 个
            candidates.sort(key=lambda n: n.value, reverse=True)
            frontier = candidates[:self.beam_width]

            # 检查是否找到满意解
            if frontier[0].value > 0.9:
                return self.extract_solution(frontier[0])

        return self.extract_solution(frontier[0])`
                },
                {
                    lang: "python",
                    code: `class TreeOfThoughts:
    # ... 接上文 ...

    def generate_thoughts(self, node: TreeNode) -> List[TreeNode]:
        """从当前节点生成多个候选思维步骤"""
        prompt = f"""当前状态：{node.state}
深度：{node.depth}/{self.max_depth}

请生成 {self.branching} 个不同的下一步思维，
每个思维之间应该有实质性差异。

格式：
思维 1: ...
思维 2: ...
思维 3: ..."""
        response = self.llm.generate(prompt)
        thoughts = self._parse_thoughts(response)
        return [
            TreeNode(t, depth=node.depth + 1)
            for t in thoughts
        ]

    def evaluate(self, node: TreeNode) -> float:
        """评估节点状态的潜在价值"""
        prompt = f"""评估以下思维步骤的质量（0.0-1.0）：
{node.state}

评分标准：
- 逻辑连贯性
- 与问题的相关性
- 解决路径的可行性

只返回一个 0.0-1.0 的数字。"""
        score = self.llm.generate(prompt)
        return float(score.strip())`
                }
            ],
            table: {
                headers: ["搜索策略", "优势", "劣势", "适用场景"],
                rows: [
                    ["BFS 广度优先", "不易错过最优解", "内存消耗大", "浅层多路探索"],
                    ["DFS 深度优先", "内存占用小", "可能陷入局部最优", "深层推理任务"],
                    ["Beam Search 束搜索", "平衡效率与质量", "可能剪掉最优路径", "通用 ToT 场景"],
                    ["A* 搜索", "启发式引导更高效", "需要好的启发函数", "有明确评估标准时"]
                ]
            },
            mermaid: `graph TD
    A[根节点：原始问题] --> B[分支 1：方案 A]
    A --> C[分支 2：方案 B]
    A --> D[分支 3：方案 C]
    B --> E[B-A: 子方案]
    B --> F[B-B: 子方案]
    C -.剪枝.-> X((X))
    D --> G[D-A: 子方案]
    E --> H[最优解]
    F --> I((...))
    G --> J((...))
    style C stroke:#f99,stroke-dasharray: 5 5
    class X s1
    class H s0
    classDef s0 fill:#14532d
    classDef s1 fill:#7f1d1d`,
            tip: "Beam Width 是 ToT 最重要的超参数——太小容易剪掉最优路径，太大会指数级增加 token 消耗",
            warning: "评估函数（Evaluator）的准确性直接决定 ToT 的搜索质量——评分偏差会导致系统性剪掉正确路径"
        },
        {
            title: "5. Graph of Thoughts：从树到图的跃迁",
            body: `Graph of Thoughts（GoT）由 Besta 等人在 2023 年提出，是 ToT 的自然延伸。ToT 的树形结构有一个根本限制：不同分支之间无法交互和合并信息。但在真实问题解决中，我们常常需要将不同角度的思考成果整合起来。GoT 将思维结构从树升级为有向无环图（DAG），允许思维的分支重新聚合、循环精炼、甚至反馈。GoT 引入了几个关键操作：聚合（Aggregation）——将多个独立思维的结果合并；精炼（Refinement）——对已有思维进行多轮改进；循环（Loop）——将输出反馈到输入端进行迭代。这种图结构特别适合需要多源信息整合的场景，比如文献综述（综合多篇论文的观点）、复杂系统设计（整合架构、性能、安全等多个维度的分析）、以及代码重构（同时考虑功能、可读性和性能）。实验表明，在需要信息聚合的任务上，GoT 比 ToT 进一步提升 15%-25% 的效果。`,
            code: [
                {
                    lang: "python",
                    code: `from collections import defaultdict

class ThoughtNode:
    """GoT 图中的思维节点"""

    def __init__(self, id: str, content: str, thought_type: str = "generate"):
        self.id = id
        self.content = content
        self.type = thought_type  # generate / aggregate / refine / loop
        self.parents = []
        self.children = []
        self.score = 0.0

class GraphOfThoughts:
    """Graph of Thoughts 框架"""

    def __init__(self, llm):
        self.llm = llm
        self.nodes = {}
        self.edges = defaultdict(list)

    def add_node(self, node: ThoughtNode):
        self.nodes[node.id] = node

    def add_edge(self, from_id: str, to_id: str):
        self.edges[from_id].append(to_id)
        self.nodes[to_id].parents.append(from_id)
        self.nodes[from_id].children.append(to_id)

    def aggregate(self, parent_ids: List[str], prompt: str) -> ThoughtNode:
        """聚合多个思维节点的结果"""
        parent_contents = [
            self.nodes[pid].content for pid in parent_ids
            if pid in self.nodes
        ]
        agg_prompt = f"""综合以下多个思维的结果：
{''.join(f'--- 思维 {i+1} ---\\n{c}\\n' for i, c in enumerate(parent_contents))}
\\n{prompt}"""
        result = self.llm.generate(agg_prompt)
        node_id = f"agg_{len(self.nodes)}"
        node = ThoughtNode(node_id, result, "aggregate")
        self.add_node(node)
        for pid in parent_ids:
            self.add_edge(pid, node_id)
        return node`
                },
                {
                    lang: "python",
                    code: `class GraphOfThoughts:
    # ... 接上文 ...

    def refine(self, node_id: str, iterations: int = 3) -> ThoughtNode:
        """对指定思维节点进行多轮精炼"""
        current = self.nodes[node_id]

        for i in range(iterations):
            prompt = f"""当前版本：
{current.content}

请改进上述内容，要求：
1. 修正任何逻辑漏洞
2. 补充缺失的关键信息
3. 提高表达的清晰度和精确性"""
            refined = self.llm.generate(prompt)
            new_id = f"{node_id}_refine_{i}"
            new_node = ThoughtNode(new_id, refined, "refine")
            self.add_node(new_node)
            self.add_edge(current.id, new_id)
            current = new_node

        return current

    def find_solution(self) -> Optional[ThoughtNode]:
        """找到得分最高的终端节点作为最终答案"""
        terminal_nodes = [
            n for n in self.nodes.values()
            if not n.children  # 没有子节点 = 终端节点
        ]
        if not terminal_nodes:
            return None
        return max(terminal_nodes, key=lambda n: n.score)`
                }
            ],
            table: {
                headers: ["操作类型", "功能", "输入", "输出"],
                rows: [
                    ["Generate 生成", "产生新的思维节点", "当前状态 + 提示词", "单个思维节点"],
                    ["Aggregate 聚合", "合并多个思维的结果", "多个父节点", "综合后的新节点"],
                    ["Refine 精炼", "对已有思维多轮改进", "单个节点 + 迭代次数", "精炼后的节点链"],
                    ["Loop 循环", "将输出反馈为输入", "节点 + 反馈条件", "迭代更新后的节点"]
                ]
            },
            mermaid: `graph TD
    A[思维 1] --> D[聚合]
    B[思维 2] --> D
    C[思维 3] --> D
    D --> E[精炼 v1]
    E --> F[精炼 v2]
    F --> G[精炼 v3]
    A -.反馈.-> A
    G --> H[最终答案]
    class H s1
    class D s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d`,
            tip: "GoT 最适合需要多源信息整合的场景——当问题需要从不同维度/角度分别思考再汇总时，优先考虑图结构",
            warning: "图的复杂度随节点和边数快速增长——建议限制最大节点数（<50），避免 token 预算爆炸"
        },
        {
            title: "6. 反思提示词设计：让 LLM 真正自我审查",
            body: `反思提示词（Reflection Prompt）的质量直接决定了 Self-Reflection 模式的效果。一个差的反思提示词只会让 LLM 说「我认为我的回答是正确的」——这和没有反思没有区别。好的反思提示词需要满足几个关键原则：具体性——指出需要检查的具体维度（事实准确性、逻辑一致性、格式规范等），而非泛泛地问「你对吗」；对比性——提供正确答案的特征或反例，让 LLM 有明确的参照标准；分步性——引导 LLM 按步骤审查自己的输出，而不是一下子给出结论。此外，可以使用 Few-shot 反射示例——给 LLM 展示几个「错误回答 → 反思 → 修正」的完整样例，让它学习反思的模式。COT-SC（Self-Consistency）也是一种有效的策略：让 LLM 生成多个独立答案，然后比较它们之间的一致性，不一致的部分就是需要反思的焦点。`,
            code: [
                {
                    lang: "python",
                    code: `REFLECTION_PROMPT = """你是一个严格的自我审查系统。请按以下步骤审查你的上一个回答：

**第一步：事实核查**
- 回答中提到的每个事实陈述是否可以被验证？
- 是否存在无法证实的断言？
- 如有不确定的地方，请明确指出。

**第二步：逻辑检查**
- 推理链条是否完整？是否存在跳跃？
- 前提和结论之间是否有充分的逻辑关系？
- 是否存在自相矛盾的地方？

**第三步：完整性评估**
- 是否回答了问题的所有部分？
- 是否遗漏了重要的角度或信息？
- 是否有需要补充的上下文？

**第四步：格式验证**
- 输出是否符合要求的格式？
- 是否包含不必要的内容？

请以 JSON 格式返回审查结果：
{{
    "is_correct": true/false,
    "issues": ["问题1", "问题2"],
    "confidence": 0.0-1.0,
    "suggested_fix": "修正建议"
}}"""`
                },
                {
                    lang: "python",
                    code: `def self_consistency_check(task: str, n_samples: int = 5) -> dict:
    """Self-Consistency 检查：生成多个答案并比较一致性"""
    answers = []
    for _ in range(n_samples):
        ans = llm.generate(
            task,
            temperature=0.7  # 增加多样性
        )
        answers.append(ans)

    # 提取关键结论并比较
    key_points = []
    for ans in answers:
        prompt = f"""从以下回答中提取核心结论（最多 3 条）：
{ans}
只列出结论，每条一行。"""
        points = llm.generate(prompt).strip().split('\\n')
        key_points.append(set(points))

    # 计算一致性得分
    consensus = set.intersection(*key_points)
    consistency_score = len(consensus) / max(len(set.union(*key_points)), 1)

    return {
        "consensus_points": list(consensus),
        "consistency_score": round(consistency_score, 2),
        "divergent_points": [
            p for p in set.union(*key_points) if p not in consensus
        ]
    }`
                }
            ],
            table: {
                headers: ["提示词策略", "效果提升", "实现难度", "适用任务"],
                rows: [
                    ["分步审查", "15-25%", "低", "通用场景"],
                    ["Few-shot 反思示例", "20-30%", "中", "格式固定的任务"],
                    ["Self-Consistency", "10-20%", "中", "有确定答案的任务"],
                    ["外部验证器配合", "30-50%", "高", "代码、数学等有客观标准的任务"]
                ]
            },
            mermaid: `graph LR
    A[原始输出] --> B[事实核查]
    B --> C[逻辑检查]
    C --> D[完整性评估]
    D --> E[格式验证]
    E --> F{通过？}
    F -->|是| G[输出]
    F -->|否| H[生成修正]
    H --> A
    class H s2
    class G s1
    class F s0
    classDef s0 fill:#713f12
    classDef s1 fill:#14532d
    classDef s2 fill:#7f1d1d`,
            tip: "在反思提示词中明确指定输出格式（如 JSON），方便后续程序化处理反思结果",
            warning: "避免使用引导性过强的反思提示词——如果提示词中隐含了期望的答案方向，LLM 可能会迎合而不是真正反思"
        },
        {
            title: "7. 实战：自纠错代码生成 Agent",
            body: `现在我们将前面学到的概念整合成一个完整的自纠错代码生成 Agent。这个 Agent 的工作流程是：首先使用 Plan-and-Solve 策略制定编码计划，然后生成代码，接着通过运行测试用例来评估代码正确性，如果测试失败则进入 Reflexion 循环——分析错误信息、生成修复方案、重新生成代码，直到测试通过或达到最大尝试次数。这个过程结合了规划的结构性、反思的纠错能力和外部验证（测试运行）的客观性。与单纯的 LLM 代码生成相比，自纠错 Agent 的关键优势在于它不依赖 LLM 一次性写出完美代码，而是通过「生成-测试-修复」的迭代循环逐步逼近正确解。这正是人类程序员的工作方式——很少有人能一次写出完全正确的代码，关键是通过调试和修正来迭代改进。我们将使用 AST（抽象语法树）分析、单元测试执行和 LLM 反思反馈三重机制来构建这个 Agent。`,
            code: [
                {
                    lang: "python",
                    code: `import subprocess
import tempfile
import os

class SelfCorrectingCoder:
    """自纠错代码生成 Agent"""

    def __init__(self, llm, max_attempts=5):
        self.llm = llm
        self.max_attempts = max_attempts

    def generate_and_test(self, problem: str, test_cases: str) -> dict:
        """生成代码并通过测试，失败则自我修正"""
        # Step 1: Plan
        plan = self._plan(problem)
        print(f"编码计划：\\n{plan}\\n")

        last_error = None
        for attempt in range(self.max_attempts):
            # Step 2: Generate
            if attempt == 0:
                code = self._generate(problem, plan)
            else:
                code = self._generate_with_feedback(
                    problem, plan, last_error
                )

            # Step 3: Test
            test_result = self._run_tests(code, test_cases)

            if test_result["passed"]:
                print(f"✅ 第 {attempt+1} 次尝试通过所有测试！")
                return {
                    "code": code,
                    "attempts": attempt + 1,
                    "success": True
                }

            last_error = test_result["error"]
            print(f"❌ 第 {attempt+1} 次尝试失败：{last_error}")

        return {
            "code": code,
            "attempts": self.max_attempts,
            "success": False,
            "last_error": last_error
        }`
                },
                {
                    lang: "python",
                    code: `class SelfCorrectingCoder:
    # ... 接上文 ...

    def _plan(self, problem: str) -> str:
        """生成编码计划"""
        return self.llm.generate(f"""问题：{problem}

请制定编码计划：
1. 函数签名和参数设计
2. 核心算法思路
3. 边界情况处理
4. 时间/空间复杂度分析""")

    def _generate(self, problem: str, plan: str) -> str:
        """根据计划生成代码"""
        return self.llm.generate(f"""{plan}

请编写完整可运行的 Python 代码。
只返回代码，不要解释。""")

    def _generate_with_feedback(self, problem, plan, error: str) -> str:
        """基于错误反馈重新生成代码"""
        return self.llm.generate(f"""{plan}

上次生成的代码有以下错误：
{error}

请分析错误原因并修正代码。
只返回修正后的完整代码，不要解释。""")

    def _run_tests(self, code: str, tests: str) -> dict:
        """运行测试用例"""
        full_code = f"{code}\\n\\n{tests}"
        with tempfile.NamedTemporaryFile(
            mode='w', suffix='.py', delete=False
        ) as f:
            f.write(full_code)
            tmp_path = f.name

        try:
            result = subprocess.run(
                ['python3', tmp_path],
                capture_output=True, text=True, timeout=10
            )
            return {
                "passed": result.returncode == 0,
                "error": result.stderr[:500] if result.stderr else None
            }
        finally:
            os.unlink(tmp_path)`
                }
            ],
            table: {
                headers: ["阶段", "技术手段", "验证方式", "失败处理"],
                rows: [
                    ["Plan 规划", "LLM 生成编码计划", "人工/规则检查", "重新规划"],
                    ["Generate 生成", "LLM 代码生成", "AST 语法检查", "反思后重新生成"],
                    ["Test 测试", "执行测试用例", "单元测试通过率", "分析错误信息"],
                    ["Reflect 反思", "错误分析 + 反馈", "修复后的测试通过", "达到上限则放弃"]
                ]
            },
            mermaid: `graph TD
    A[编程问题] --> B[Plan 编码计划]
    B --> C[Generate 生成代码]
    C --> D[AST 语法检查]
    D -->|语法错误| E[语法反思]
    E --> C
    D -->|通过| F[运行测试用例]
    F -->|全部通过| G[✅ 完成]
    F -->|测试失败| H[分析错误信息]
    H --> I[反思 + 生成修复]
    I --> C
    class H s1
    class G s0
    classDef s0 fill:#14532d
    classDef s1 fill:#7f1d1d`,
            tip: "为测试用例覆盖边界条件——好的测试用例是自纠错 Agent 最强大的「老师」",
            warning: "设置合理的超时限制（如 10 秒），防止生成的代码包含无限循环导致 Agent 卡死"
        }
    ],
};
