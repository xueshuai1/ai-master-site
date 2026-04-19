// 高级 Prompt 工程技术：Chain-of-Thought、Few-Shot 与结构化提示词的深度实践

import { Article } from '../knowledge';

export const article: Article = {
  id: "prompt-001",
  title: "高级 Prompt 工程技术：Chain-of-Thought、Few-Shot 与结构化提示词的深度实践",
  category: "prompt",
  tags: ["Prompt Engineering", "Chain-of-Thought", "Few-Shot", "结构化输出", "思维链", "Self-Consistency", "ReAct"],
  summary: "从基础的提示词编写到高级推理策略的系统性进阶。深入解析 Chain-of-Thought（思维链）、Few-Shot Learning（少样本学习）、Self-Consistency（自一致性）、ReAct 推理框架、Tree of Thoughts 等高级 Prompt 技术，配以 Python 可运行代码和实战对比实验，帮助开发者构建生产级 Prompt 系统。",
  date: "2026-04-20",
  readTime: "35 分钟",
  level: "进阶",
  content: [
    {
      title: "一、为什么需要高级 Prompt 技术？",
      body: `在 AI Master 的 [Prompt Engineering 学习导览](/knowledge/prompt-guide) 中，我们已经掌握了好的 Prompt 需要包含角色、任务、约束、格式四要素。但这只是「能用」的级别。

当你面对以下场景时，基础 Prompt 就力不从心了：

**场景 1：复杂数学推理**
> 一个水箱有 3 根进水管，分别以每分钟 2L、3L、5L 的速度进水，同时有 1 根排水管以每分钟 4L 的速度排水。水箱初始有 20L 水，容量为 100L。问多少分钟后水箱满？

基础 Prompt 往往让模型「心算」给出答案，错误率极高。而 Chain-of-Thought 能让模型一步步推理，准确率提升 3-5 倍。

**场景 2：专业领域问答**
> 给定一段法律文本，判断某个行为是否违法。

没有领域知识的 Few-Shot 示例，模型的回答往往是「大概可能也许」的模糊判断。

**场景 3：多步骤任务规划**
> 分析一份销售数据，找出趋势，生成报告，并给出改进建议。

这需要模型具备任务分解、多步推理和自我修正的能力。

**高级 Prompt 技术的核心价值：**
- 将模型的「直觉式回答」转变为「系统性推理」
- 将回答准确率从 60-70% 提升到 90%+
- 让模型在数学、逻辑、编程等推理密集型任务中接近人类专家水平
- 建立可复用、可测试、可迭代的 Prompt 工程体系`,
    },
    {
      title: "二、Chain-of-Thought（思维链）：让模型「想清楚再说」",
      body: `Chain-of-Thought（CoT）是 Wei et al. (2022) 在论文「Chain-of-Thought Prompting Elicits Reasoning in Large Language Models」中提出的核心技术。

**核心思想**：在 Prompt 中引导模型展示推理过程，而不是直接给出最终答案。

**原理图解：**

模型在处理复杂问题时，内部其实经过了多层注意力计算。但直接输出答案时，中间推理步骤被「压缩」了，导致错误累积。CoT 通过强制模型输出中间步骤，相当于给推理过程一个「外部工作记忆」，显著减少错误。`,
      mermaid: `graph TD
    A[输入问题] --> B{使用 CoT?}
    B -->|否| C[直接生成答案]
    B -->|是| D[生成推理步骤 1]
    D --> E[生成推理步骤 2]
    E --> F[生成推理步骤 3]
    F --> G[得出结论]
    C --> H[准确率: ~60%]
    G --> I[准确率: ~90%]
    
    style B fill:#f9d,stroke:#333
    style H fill:#f66,stroke:#333
    style I fill:#6f6,stroke:#333`,
    },
    {
      title: "2.1 Zero-Shot CoT：最简单的思维链",
      body: `Zero-Shot CoT 不需要任何示例，只需在问题后加一句神奇的引导语：

**"Let's think step by step"（让我们一步步思考）**

就这么简单，但效果显著。在 GSM8K 数学数据集上，仅加这一句话就能让 GPT-3 的准确率从 18% 提升到 40% 以上。`,
      code: [{ lang: "python", code: `import openai

def zero_shot_cot(question: str, model: str = "gpt-4") -> str:
    """
    Zero-Shot Chain-of-Th prompting.
    只需在问题后加 'Let's think step by step' 即可。
    """
    prompt = f"""请回答以下问题。在给出最终答案之前，请先一步步分析。

问题：{question}

请逐步思考并给出答案："""

    response = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "system", "content": "你是一个善于逻辑推理的 AI 助手。"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.0,  # 推理任务用低温度
        max_tokens=1024
    )
    return response.choices[0].message.content


# 测试数学题
question = """
小明有 120 元，买了一本书花了 35 元，
又买了 3 支笔，每支 8 元。
请问他还剩多少钱？
"""
result = zero_shot_cot(question)
print("=== 推理过程 ===")
print(result)`, filename: "zero_shot_cot.py" }],
    },
    {
      title: "2.2 Few-Shot CoT：用示例教模型推理",
      body: `Few-Shot CoT 在 Zero-Shot 的基础上更进一步：给模型几个「问题 → 推理过程 → 答案」的完整示例，让模型学习推理的模式。

**关键区别：**

Zero-Shot CoT 只给引导语，让模型自己想。
Few-Shot CoT 给示范，让模型照着学。

在更复杂的任务上（如符号推理、多步算术），Few-Shot CoT 比 Zero-Shot CoT 高出 10-20 个百分点。`,
      mermaid: `graph LR
    A[输入问题] --> B[Few-Shot 示例 1\n问题→推理→答案]
    B --> C[Few-Shot 示例 2\n问题→推理→答案]
    C --> D[Few-Shot 示例 3\n问题→推理→答案]
    D --> E[目标问题]
    E --> F[模型模仿推理模式]
    F --> G[输出推理过程 + 答案]
    
    style A fill:#bbf
    style G fill:#bfb`,
    },
    {
      title: "2.3 Few-Shot CoT 实战代码",
      body: `以下是一个完整的 Few-Shot CoT 实现，包含精心设计的推理示例：`,
      code: [{ lang: "python", code: `import openai

# 精心设计的 Few-Shot CoT 示例
COT_EXAMPLES = [
    {
        "question": "餐厅有 23 个苹果，用 20 个做了午餐，又买了 6 个。现在有多少个？",
        "reasoning": "1. 初始苹果数量：23 个\\n2. 用掉 20 个后剩余：23 - 20 = 3 个\\n3. 又买了 6 个：3 + 6 = 9 个\\n4. 最终苹果数量：9 个",
        "answer": "9"
    },
    {
        "question": "一个剧团有 4 名舞者，每场演出需要 3 人，每场演出持续 2 小时。如果要让每个舞者表演相同时长，每场演出之间休息 30 分钟，完成一轮全员等时演出需要多长时间？",
        "reasoning": "1. 每场演出 3 人，每人演 2 小时，每场总表演时长：3 × 2 = 6 小时\\n2. 4 名舞者每人演相同时长，需要 4 × 2 = 8 小时总表演\\n3. 需要场次：8 / 6 = 1.33，向上取整为 2 场\\n4. 2 场演出时间：2 × 2 = 4 小时\\n5. 1 次休息时间：30 分钟 = 0.5 小时\\n6. 总时长：4 + 0.5 = 4.5 小时",
        "answer": "4.5 小时"
    },
    {
        "question": "一辆公交车上有 47 人，到站后下去了 15 人，又上来了 8 人。下一站下去了 12 人，上来了 5 人。现在车上有多少人？",
        "reasoning": "1. 初始人数：47 人\\n2. 第一站后：47 - 15 + 8 = 40 人\\n3. 第二站后：40 - 12 + 5 = 33 人\\n4. 现在车上人数：33 人",
        "answer": "33"
    }
]

def build_few_shot_cot_prompt(question: str) -> str:
    """构建 Few-Shot CoT Prompt"""
    parts = []
    
    # 添加示例
    for ex in COT_EXAMPLES:
        parts.append(f"问题：{ex['question']}")
        parts.append(f"推理过程：{ex['reasoning']}")
        parts.append(f"答案：{ex['answer']}")
        parts.append("---")
    
    # 添加目标问题
    parts.append(f"问题：{question}")
    parts.append("推理过程：")
    
    return "\\n".join(parts)


def few_shot_cot(question: str, model: str = "gpt-4") -> dict:
    """执行 Few-Shot CoT 推理"""
    prompt = build_few_shot_cot_prompt(question)
    
    response = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "system", "content": "你是一个数学推理助手。请按照示例的格式，先写出详细的推理过程，再给出答案。"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.0,
        max_tokens=1024
    )
    
    result = response.choices[0].message.content
    
    # 解析推理过程和答案
    if "答案：" in result:
        reasoning, answer = result.rsplit("答案：", 1)
        return {
            "reasoning": reasoning.strip(),
            "answer": answer.strip()
        }
    return {"reasoning": result, "answer": "未能提取答案"}


# 测试
test_question = "商店有 56 瓶饮料，上午卖了 18 瓶，下午进了 12 瓶，晚上又卖了 9 瓶。还剩多少瓶？"
result = few_shot_cot(test_question)
print(f"推理：{result['reasoning']}")
print(f"答案：{result['answer']}")`, filename: "few_shot_cot.py" }],
    },
    {
      title: "三、Self-Consistency（自一致性）：投票选出最佳答案",
      body: `Self-Consistency 是 Wang et al. (2022) 提出的增强 CoT 的方法。

**核心思想：**
不要只让模型推理一次。让模型从同一条 Prompt 出发，用不同的随机种子推理 N 次（通常 N=5-40），然后对最终答案进行投票，选出现次数最多的那个。

**为什么有效？**
模型的推理过程有随机性。单次推理可能「走错路」，但多次推理中，正确的推理路径会收敛到相同的答案。投票机制过滤掉了偶然的错误。

**效果对比：**

| 方法 | GSM8K 准确率 | SVAMP 准确率 | 成本倍数 |
|------|-------------|-------------|---------|
| 标准 CoT | 40.4% | 67.9% | 1x |
| Zero-Shot CoT | 40.3% | 59.1% | 1x |
| Self-Consistency (k=5) | 59.8% | 78.2% | 5x |
| Self-Consistency (k=40) | 66.9% | 83.0% | 40x |

从数据可以看到，Self-Consistency 在 k=5 时就能带来 ~20 个百分点的提升，性价比最高。`,
    },
    {
      title: "3.1 Self-Consistency 实战代码",
      body: `以下是 Self-Consistency 的完整实现，包括投票逻辑和并行调用优化：`,
      code: [{ lang: "python", code: `import openai
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
import re


def extract_answer(text: str) -> str:
    """从推理文本中提取最终答案"""
    # 尝试匹配 "答案是 X" 或 "answer: X" 或最后的数字
    patterns = [
        r"答案是[：:]\\s*(.+?)(?:。|$)",
        r"answer[：:]\\s*(.+?)(?:。|$)",
        r"所以答案是[：:]\\s*(.+?)(?:。|$)",
        r"最终答案[：:]\\s*(.+?)(?:。|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()
    
    # 回退：提取最后的数字
    numbers = re.findall(r'\\d+\\.?\\d*', text)
    return numbers[-1] if numbers else "无法提取"


def single_cot_run(question: str, model: str, seed: int) -> str:
    """执行单次 CoT 推理"""
    response = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "system", "content": "请一步步推理这个问题，最后给出答案。"},
            {"role": "user", "content": f"问题：{question}\\n请逐步思考："}
        ],
        temperature=0.7,  # 需要一定的随机性
        max_tokens=512,
        seed=seed
    )
    return response.choices[0].message.content


def self_consistency_cot(
    question: str,
    model: str = "gpt-4",
    n_runs: int = 5,
    max_workers: int = 5
) -> dict:
    """
    Self-Consistency Chain-of-Thought
    
    参数：
        question: 需要推理的问题
        model: 使用的模型
        n_runs: 推理次数
        max_workers: 并行线程数
    
    返回：
        包含投票结果、各答案出现次数、详细推理的字典
    """
    results = []
    
    # 并行执行多次推理
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(single_cot_run, question, model, seed=i): i
            for i in range(n_runs)
        }
        
        for future in as_completed(futures):
            seed = futures[future]
            try:
                reasoning = future.result()
                answer = extract_answer(reasoning)
                results.append({
                    "seed": seed,
                    "reasoning": reasoning,
                    "answer": answer
                })
            except Exception as e:
                print(f"Run {seed} failed: {e}")
    
    # 投票
    answers = [r["answer"] for r in results]
    vote_count = Counter(answers)
    best_answer, vote_tally = vote_count.most_common(1)[0]
    
    # 找到最佳推理
    best_runs = [r for r in results if r["answer"] == best_answer]
    
    return {
        "question": question,
        "best_answer": best_answer,
        "vote_tally": f"{vote_tally}/{n_runs}",
        "confidence": vote_tally / n_runs,
        "all_answers": dict(vote_count),
        "best_reasoning": best_runs[0]["reasoning"],
        "all_results": results
    }


# 使用示例
question = "一个农场有鸡和兔子，共有 35 个头，94 只脚。问鸡和兔子各有多少只？"
result = self_consistency_cot(question, n_runs=5)

print(f"问题：{result['question']}")
print(f"最佳答案：{result['best_answer']}")
print(f"投票结果：{result['vote_tally']}")
print(f"置信度：{result['confidence']:.0%}")
print(f"所有答案分布：{result['all_answers']}")
print(f"\\n最佳推理过程：")
print(result['best_reasoning'])`, filename: "self_consistency_cot.py" }],
    },
    {
      title: "四、ReAct 框架：推理与行动的交织",
      body: `ReAct（Reasoning + Acting）是 Yao et al. (2022) 提出的框架，将推理（Reasoning）和行动（Acting）交替进行。

**核心流程：**

1. **Thought（思考）**：分析当前状态，决定下一步做什么
2. **Action（行动）**：执行具体操作（搜索、计算、调用工具）
3. **Observation（观察）**：获取行动的结果
4. 回到 Thought，重复直到得出结论

这个模式本质上就是 Agent 的工作方式！OpenClaw、AutoGPT、LangChain Agent 等系统都在使用 ReAct 模式。`,
      mermaid: `sequenceDiagram
    participant U as User
    participant A as AI Agent
    participant T as Thought
    participant Act as Action
    participant O as Observation/Tool
    
    U->>A: 提出问题
    loop ReAct 循环
        A->>T: Thought: 分析问题，决定行动
        T->>Act: Action: 执行具体操作
        Act->>O: 调用工具/API/搜索
        O-->>A: Observation: 返回结果
    end
    A-->>U: 最终答案`,
    },
    {
      title: "4.1 ReAct Prompt 模板",
      body: `以下是一个标准的 ReAct Prompt 模板，可以直接用于构建 Agent：`,
      code: [{ lang: "python", code: `import openai
import re


# ReAct Prompt 模板
REACT_TEMPLATE = """你是一个智能助手，通过思考和行动来回答问题。

你可以使用以下工具：
- search[query]: 搜索网络获取信息
- calculate[expression]: 计算数学表达式
- knowledge[topic]: 获取某个主题的常识

请按照以下格式思考：
Thought: [你的思考，分析当前情况]
Action: [你决定使用的工具和参数]
Observation: [工具返回的结果]
...（重复 Thought/Action/Observation）
Thought: [最终推理]
Final Answer: [最终答案]

下面是一个示例：

Question: 苹果公司成立于哪年？截至 2024 年有多少员工？
Thought: 我需要搜索苹果公司的成立时间和员工数量。
Action: search[苹果公司 成立时间 员工数量 2024]
Observation: 苹果公司由 Steve Jobs 等人于 1976 年 4 月 1 日创立。截至 2024 年，苹果拥有约 164,000 名全职员工。
Thought: 我已经找到了答案。
Final Answer: 苹果公司成立于 1976 年，截至 2024 年有约 164,000 名员工。

现在请回答：

Question: {question}
"""


class ReActAgent:
    """简单的 ReAct Agent 实现"""
    
    def __init__(self, model: str = "gpt-4"):
        self.model = model
        self.max_iterations = 5
    
    def _call_llm(self, prompt: str) -> str:
        """调用 LLM"""
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=512
        )
        return response.choices[0].message.content
    
    def _parse_action(self, text: str) -> tuple[str, str] | None:
        """解析 Action: tool[query]"""
        match = re.search(r'Action:\\s*(\\w+)\\[(.+?)\\]', text)
        if match:
            return match.group(1), match.group(2)
        return None
    
    def _execute_action(self, tool: str, query: str) -> str:
        """模拟工具执行（实际中应接入真实工具）"""
        tools = {
            "search": lambda q: f"[搜索结果] 关于'{q}'的信息...",
            "calculate": lambda q: str(eval(q)),
            "knowledge": lambda q: f"[知识] {q} 的常识性信息..."
        }
        return tools.get(tool, lambda q: "未知工具")(query)
    
    def run(self, question: str) -> str:
        """执行 ReAct 推理"""
        history = REACT_TEMPLATE.format(question=question)
        
        for i in range(self.max_iterations):
            # 获取 LLM 响应
            response = self._call_llm(history)
            history += "\\n" + response
            
            # 解析 Action
            action = self._parse_action(response)
            
            if action is None:
                # 没有 Action，说明已经有 Final Answer
                break
            
            tool, query = action
            print(f"Iteration {i+1}:")
            print(f"  Thought: {response.split('Thought:')[1].split('Action:')[0] if 'Action:' in response else response}")
            print(f"  Action: {tool}[{query}]")
            
            # 执行工具
            observation = self._execute_action(tool, query)
            print(f"  Observation: {observation[:100]}...")
            
            # 添加 Observation 到历史
            history += f"\\nObservation: {observation}\\n"
        
        # 提取 Final Answer
        final_match = re.search(r'Final Answer:\\s*(.+)', history, re.DOTALL)
        return final_match.group(1).strip() if final_match else "未能得出结论"


# 使用示例
agent = ReActAgent()
result = agent.run("Python 3.12 比 3.11 快多少百分比？")
print(f"\\nFinal Answer: {result}")`, filename: "react_agent.py" }],
    },
    {
      title: "五、Tree of Thoughts（思维树）：多路径探索",
      body: `Tree of Thoughts（ToT）是 Yao et al. (2023) 提出的更高级的推理框架。

**核心思想：**
不是只沿着一条推理路径走到底，而是生成多个可能的推理步骤，评估每个步骤的质量，选择最有希望的路径继续深入。

这就像下棋：高手不会只考虑一步棋，而是同时推演多条可能的走法，然后选择最优的那条。

**ToT 的三个关键操作：**

1. **Thought Decomposition（思维分解）**：把大问题分解为多个思维步骤
2. **Thought Generation（思维生成）**：对每个步骤，生成 k 个候选思维
3. **State Evaluation（状态评估）**：评估每个候选思维的质量，选择最好的继续`,
      mermaid: `graph TD
    A[初始问题] --> B[生成候选思维]
    B --> C1[候选 1: 路径 A]
    B --> C2[候选 2: 路径 B]
    B --> C3[候选 3: 路径 C]
    
    C1 --> D1{评估}
    C2 --> D2{评估}
    C3 --> D3{评估}
    
    D1 -->|得分 0.3| E1[放弃]
    D2 -->|得分 0.8| E2[继续深入]
    D3 -->|得分 0.6| E3[保留备选]
    
    E2 --> F[生成下一步候选]
    F --> G1[下一步候选 1]
    F --> G2[下一步候选 2]
    
    G1 --> H1{评估}
    G2 --> H2{评估}
    
    H1 -->|得分 0.9| I[继续深入]
    H2 -->|得分 0.4| J[放弃]
    
    I --> K[得出结论]
    
    style A fill:#bbf
    style K fill:#bfb
    style E1 fill:#f66
    style J fill:#f66`,
    },
    {
      title: "5.1 ToT 与 CoT 的对比",
      body: `Tree of Thoughts 相比传统 Chain-of-Thought 有显著优势，但也带来更高的计算成本。`,
      table: {
        headers: ["维度", "Chain-of-Thought", "Self-Consistency", "Tree of Thoughts"],
        rows: [
          ["推理方式", "单条线性链", "多条独立链投票", "树状结构+搜索"],
          ["生成次数", "1 次", "k 次（通常 5-40）", "多步 × k 候选"],
          ["评估机制", "无", "投票", "显式评估+剪枝"],
          ["准确率提升", "基线", "+10-25%", "+15-35%"],
          ["计算成本", "1x", "kx", "O(k × 步数)"],
          ["适用场景", "简单推理", "数学/逻辑题", "创意写作/规划"],
          ["实现复杂度", "低", "中", "高"],
          ["Token 消耗", "最少", "中等", "最多"]
        ]
      },
    },
    {
      title: "六、高级 Prompt 策略组合：生产级 Prompt 系统",
      body: `在实际生产环境中，单一技术往往不够。我们需要根据任务类型组合不同的策略。

**策略选择决策树：**

1. **任务是否需要外部信息？**
   - 是 → ReAct（推理+工具调用）
   - 否 → 继续判断

2. **任务是否需要多步推理？**
   - 是 → CoT / Self-Consistency
   - 否 → 继续判断

3. **任务是否有明确的输出格式？**
   - 是 → Structured Output Prompt（JSON Schema）
   - 否 → 直接回答

4. **任务是否可以并行多个答案？**
   - 是 → Self-Consistency 投票
   - 否 → 单次推理

**一个完整的生产级 Prompt 系统应该包含以下组件：**`,
      mermaid: `graph TD
    A[用户输入] --> B{任务分类器}
    
    B -->|数学/逻辑| C[CoT + Self-Consistency]
    B -->|需要搜索| D[ReAct Agent]
    B -->|创意写作| E[Tree of Thoughts]
    B -->|数据提取| F[结构化输出]
    B -->|简单问答| G[直接回答]
    
    C --> H[投票聚合]
    D --> I[工具调用循环]
    E --> J[路径搜索+评估]
    F --> K[JSON Schema 验证]
    
    H --> L[质量检查]
    I --> L
    J --> L
    K --> L
    G --> L
    
    L -->|通过| M[输出]
    L -->|不通过| N[重试/降级]
    N --> L
    
    style A fill:#bbf
    style M fill:#bfb
    style N fill:#f66`,
    },
    {
      title: "6.1 生产级 Prompt 系统代码",
      body: `以下是一个生产级 Prompt 路由系统的实现：`,
      code: [{ lang: "python", code: `from enum import Enum
from dataclasses import dataclass
from typing import Any
import json
import openai


class TaskType(Enum):
    MATH = "math"
    RESEARCH = "research"
    CREATIVE = "creative"
    EXTRACTION = "extraction"
    SIMPLE = "simple"


@dataclass
class PromptResult:
    answer: str
    confidence: float
    reasoning: str
    task_type: TaskType
    retry_count: int = 0


class TaskClassifier:
    """简单任务分类器（实际中可用 LLM 判断）"""
    
    MATH_KEYWORDS = ["计算", "多少", "百分比", "平均", "总和", "概率", "方程"]
    RESEARCH_KEYWORDS = ["搜索", "最新", "趋势", "比较", "评价"]
    CREATIVE_KEYWORDS = ["写", "创作", "故事", "诗歌", "文案"]
    EXTRACTION_KEYWORDS = ["提取", "解析", "JSON", "结构化", "表格"]
    
    @classmethod
    def classify(cls, question: str) -> TaskType:
        q = question.lower()
        if any(k in q for k in cls.MATH_KEYWORDS):
            return TaskType.MATH
        if any(k in q for k in cls.RESEARCH_KEYWORDS):
            return TaskType.RESEARCH
        if any(k in q for k in cls.CREATIVE_KEYWORDS):
            return TaskType.CREATIVE
        if any(k in q for k in cls.EXTRACTION_KEYWORDS):
            return TaskType.EXTRACTION
        return TaskType.SIMPLE


class PromptRouter:
    """生产级 Prompt 路由器"""
    
    def __init__(self, model: str = "gpt-4"):
        self.model = model
        self.max_retries = 2
    
    def run_cot_with_consistency(
        self, question: str, n: int = 3
    ) -> PromptResult:
        """数学/逻辑任务：CoT + Self-Consistency"""
        # 简化版：多次调用取多数
        answers = []
        for _ in range(n):
            resp = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "请一步步推理这个问题。"},
                    {"role": "user", "content": f"问题：{question}\\n请逐步思考："}
                ],
                temperature=0.7
            )
            answers.append(resp.choices[0].message.content)
        
        # 简单投票：找最长的答案（通常推理更详细）
        best = max(answers, key=len)
        return PromptResult(
            answer=best,
            confidence=0.85,
            reasoning="Self-Consistency CoT",
            task_type=TaskType.MATH
        )
    
    def run_structured_extraction(
        self, question: str, schema: dict
    ) -> PromptResult:
        """结构化数据提取"""
        prompt = f"""请从以下文本中提取信息，并严格按照 JSON Schema 格式输出。

Schema: {json.dumps(schema, ensure_ascii=False)}

文本：{question}

请只输出 JSON，不要其他内容。"""
        
        resp = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "你是一个数据提取助手。只输出有效的 JSON。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        
        return PromptResult(
            answer=resp.choices[0].message.content,
            confidence=0.95,
            reasoning="Structured JSON extraction",
            task_type=TaskType.EXTRACTION
        )
    
    def process(self, question: str, **kwargs) -> PromptResult:
        """主入口：自动分类并选择最佳策略"""
        task_type = TaskClassifier.classify(question)
        
        for attempt in range(self.max_retries):
            try:
                if task_type == TaskType.MATH:
                    return self.run_cot_with_consistency(question)
                elif task_type == TaskType.EXTRACTION:
                    schema = kwargs.get("schema", {"type": "object"})
                    return self.run_structured_extraction(question, schema)
                else:
                    # 默认：直接回答
                    resp = openai.ChatCompletion.create(
                        model=self.model,
                        messages=[
                            {"role": "system", "content": "你是一个知识渊博的助手。"},
                            {"role": "user", "content": question}
                        ],
                        temperature=0.7
                    )
                    return PromptResult(
                        answer=resp.choices[0].message.content,
                        confidence=0.7,
                        reasoning="Direct answer",
                        task_type=task_type,
                        retry_count=attempt
                    )
            except Exception as e:
                print(f"Attempt {attempt+1} failed: {e}")
        
        return PromptResult(
            answer="处理失败，请稍后重试",
            confidence=0.0,
            reasoning="Max retries exceeded",
            task_type=task_type,
            retry_count=self.max_retries
        )


# 使用示例
router = PromptRouter()

# 数学题自动走 CoT
r1 = router.process("计算 1+2+3+...+100 的和是多少？")
print(f"任务类型：{r1.task_type.value}")
print(f"置信度：{r1.confidence}")
print(f"策略：{r1.reasoning}")

# 结构化提取
schema = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "age": {"type": "integer"},
        "city": {"type": "string"}
    },
    "required": ["name", "age", "city"]
}
r2 = router.process(
    "从以下文本提取信息：小明今年 25 岁，住在北京市。",
    schema=schema
)
print(f"\\n提取结果：{r2.answer}")`, filename: "prompt_router.py" }],
    },
    {
      title: "七、2026 年 Prompt 工程最佳实践总结",
      body: `经过几年的发展，Prompt Engineering 已经从「艺术」逐渐走向「工程」。以下是 2026 年业界总结的最佳实践：

**1. 推理任务必用 CoT**
任何涉及数学、逻辑、推理的问题，都应该使用 Chain-of-Thought。Zero-Shot CoT（加一句"让我们一步步思考"）是最低成本高回报的优化。

**2. 高准确度需求用 Self-Consistency**
当需要 90%+ 的准确率时，Self-Consistency（k=5）是性价比最高的选择。

**3. 需要外部能力用 ReAct**
搜索、计算、API 调用等场景，ReAct 框架是标准模式。

**4. 复杂规划用 Tree of Thoughts**
创意写作、多步规划、策略制定等需要多路径探索的场景。

**5. 结构化输出用 JSON Schema**
数据提取、API 响应、格式转换等场景，强制 JSON Schema 约束。

**6. Prompt 需要版本管理和 A/B 测试**
把 Prompt 当代码管理：版本控制、测试用例、性能监控。

**7. 持续评估和优化**
建立评估集（Evaluation Suite），每次 Prompt 变更后自动回归测试。`,
      table: {
        headers: ["技术", "最佳场景", "推荐参数", "成本", "准确率提升"],
        rows: [
          ["Zero-Shot CoT", "所有推理任务", "temperature=0", "1x", "+20-40%"],
          ["Few-Shot CoT", "有示例可用的任务", "temperature=0", "1x", "+30-50%"],
          ["Self-Consistency", "数学/逻辑/编码", "k=5, temp=0.7", "5x", "+15-25%"],
          ["ReAct", "需要工具/搜索", "max_iter=5", "3-5x", "+40-60%"],
          ["Tree of Thoughts", "创意/规划", "k=3, depth=3", "9-27x", "+20-35%"],
          ["JSON Schema", "数据提取/API", "temperature=0", "1x", "格式100%"]
        ]
      },
    },
    {
      title: "八、下一步学习路径",
      body: `掌握高级 Prompt 技术后，你可以继续深入以下方向：

**📖 推荐阅读：**
- [Agent 学习导览](/knowledge/agent-guide) — 从 Prompt 到 Agent 的进阶
- [LLM 应用开发导览](/knowledge/llm-app-guide) — 构建完整的 LLM 应用
- [AI 工程化导览](/knowledge/aieng-guide) — 生产级 AI 系统架构

**🔧 实践建议：**
1. 从 Zero-Shot CoT 开始，在现有 Prompt 中加一句"请一步步思考"
2. 为你的核心场景建立评估集（至少 20 条测试用例）
3. 尝试 Self-Consistency，比较 k=1 和 k=5 的准确率差异
4. 对于需要外部信息的场景，实现一个简单的 ReAct Agent

**⚠️ 常见误区：**
- 过度追求复杂技术：简单的 Zero-Shot CoT 往往就能解决 80% 的问题
- 忽略评估：没有测试的 Prompt 优化是盲目的
- 忽视 Token 成本：Self-Consistency 和 ToT 的成本可能很高，需要权衡`,
    }
  ]
};
