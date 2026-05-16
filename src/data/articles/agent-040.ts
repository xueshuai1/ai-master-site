// 具身智能评估体系:如何衡量 AI 在物理世界中的能力

import { Article } from '../knowledge';

export const article: Article = {
    id: "agent-040",
    title: "具身智能评估（三）：如何衡量 AI 在物理世界中的能力",
    category: "agent",
    tags: ["具身智能", "评估体系", "Embodied AI", "基准测试", "机器人评估", "物理交互", "Sim-to-Real", "AI评测"],
    summary: "具身智能(Embodied AI)正在从实验室走向现实应用,但「如何衡量一个 AI 在物理世界中的真实能力」仍是一个开放问题。本文系统梳理具身智能评估的完整体系:从评估维度的设计原则,到主流基准测试框架,从仿真环境到真实世界的迁移评估,从单任务到开放世界的泛化评测,帮助你建立科学的具身智能能力评估方法。",
    date: "2026-04-30",
    readTime: "32 min",
    level: "高级",
  learningPath: {
    routeId: "embodied-ai",
    phase: 3,
    order: 3,
    nextStep: null,
    prevStep: "physical-002",
  },
    content: [
        {
            title: "1. 什么是具身智能评估——为什么传统 AI 评测不再适用",
            body: `具身智能（Embodied AI） 指的是拥有物理身体、能够在真实三维环境中感知、决策和行动的 AI 系统。与传统的纯数字 AI（如 LLM、图像分类模型）不同，具身智能的能力评估面临全新的挑战。

### 传统 AI 评测的局限性

传统的 AI 评测体系——如 ImageNet 准确率、GLUE 基准、**MMLU** 考试——都是基于静态数据集和标准答案的评估方式。这些方法在具身智能领域根本行不通，原因包括：

- 环境是动态的：物理世界不像一张固定图片，它持续变化、充满噪声、不可预测
- 任务是开放的：不存在「标准答案」——同一个目标（如「把杯子放到桌子上」）有无数种实现路径
- 交互是连续的：评估不是单次预测，而是长时间序列的决策和行动
- 安全是硬约束：在数字世界犯错的代价是重新跑一次测试，在物理世界犯错可能导致设备损坏或人身伤害

### 具身智能评估的核心特征

具身智能评估体系必须回答五个核心问题：

- 感知能力：系统能否准确理解当前环境的状态？
- 决策能力：系统能否在不确定环境中做出合理决策？
- 执行能力：系统能否精确控制身体完成目标动作？
- 泛化能力：系统能否迁移到未见过的环境和任务？
- 安全能力：系统能否在异常情况下保护自己和他人的安全？

这五个维度构成了具身智能评估的基本框架。但如何量化这些维度，是评估体系设计的核心难点。

### 评估范式转变

具身智能评估正在经历范式转变：从离散任务评估转向连续交互评估，从封闭环境评估转向开放世界评估，从单一指标评估转向多维度综合评估。

关键洞察：具身智能的「智能」不是单一能力，而是感知-决策-执行-学习的闭环能力。评估体系必须反映这种系统性。`,
            mermaid: `graph TD
    A["感知能力: 理解环境状态"] --> B["决策能力: 不确定环境决策"]
    B --> C["执行能力: 精确控制身体"]
    C --> D["泛化能力: 适应新环境"]
    D --> E["安全能力: 保护安全"]
    E --> A

    style A fill:#581c87
    style B fill:#581c87
    style C fill:#581c87
    style D fill:#581c87
    style E fill:#581c87`,
            tip: "理解具身智能评估的第一步：放弃「正确答案」思维。在物理世界中，「好」的定义不是准确率 99％，而是「能在不确定环境中持续完成任务」。",
            warning: "切勿将 LLM 评测方法（如 MMLU、HELM）直接套用于具身智能。LLM 评测是文本层面的能力评估，具身智能评测是物理交互层面的能力评估，两者评估维度完全不同。"
        },
        {
            title: "2. 评估维度设计--具身智能能力的多维分解",
            body: `设计具身智能评估体系的第一步是定义评估维度。一个科学的评估体系需要覆盖感知、决策、执行、学习、安全五个核心维度,每个维度下设具体子指标。

### 2.1 感知维度(Perception)

感知维度评估系统理解物理环境的能力,包括:

- 目标检测与识别:能否在复杂背景中准确识别目标物体?使用 mAP(mean Average Precision) 量化
- 深度估计:能否准确判断物体的距离和三维位置?使用 深度误差(Depth Error) 量化
- 语义理解:能否理解场景的语义结构(如「厨房」、「办公室」)?使用 语义分割 IoU 量化
- 状态估计:能否准确估计自身和环境的动态状态?使用 状态估计误差 量化

### 2.2 决策维度(Decision Making)

决策维度评估系统在不确定性下做出合理选择的能力:

- 任务规划:能否将高层目标分解为可执行子任务?使用 任务完成率(Task Success Rate) 量化
- 路径规划:能否在动态障碍中找到可行路径?使用 路径最优率 和 碰撞率 量化
- 时序推理:能否理解因果关系并做出前瞻性决策?使用 因果推理准确率 量化
- 资源管理:能否在能量、时间、算力约束下做出最优决策?使用 资源利用率 量化

### 2.3 执行维度(Action)

执行维度评估系统精确控制身体完成任务的能力:

- 运动精度:动作的准确性和平滑度如何?使用 轨迹跟踪误差 量化
- 操作能力:能否精确操作物体(抓取、放置、旋转)?使用 抓取成功率 量化
- 力控制:能否根据触觉反馈调整施加的力?使用 力控制误差 量化
- 协调性:多关节、多肢体的协调运动能力如何?使用 协调性评分 量化

### 2.4 泛化维度(Generalization)

泛化维度评估系统适应新环境和新任务的能力:

- 域内泛化:在同类环境不同实例上的表现如何?使用 域内成功率 量化
- 跨域泛化:从仿真到真实、从实验室到工厂的迁移效果如何?使用 Sim-to-Real 差距 量化
- 零样本泛化:面对从未见过的任务时能否零样本执行?使用 零样本成功率 量化
- 持续学习:能否在部署后持续学习并逐步提升?使用 学习曲线斜率 量化

### 2.5 安全维度(Safety)

安全维度评估系统的安全性和鲁棒性:

- 碰撞避免:能否避免与障碍物和人类碰撞?使用 碰撞率 量化
- 异常处理:在传感器失效或执行器故障时能否安全降级?使用 故障恢复率 量化
- 安全边界:是否始终保持在安全操作范围内?使用 安全违规率 量化
- 可预测性:系统的行为是否对人类可预测和可理解?使用 行为可解释性评分 量化

### 综合评分模型

将五个维度的子指标加权聚合为一个综合评分:

综合评分 = w1 × 感知得分 + w2 × 决策得分 + w3 × 执行得分 + w4 × 泛化得分 + w5 × 安全得分

权重设计原则:根据应用场景调整权重。工业巡检场景重视安全和泛化(w5 和 w4 较大),家庭服务场景重视决策和执行(w2 和 w3 较大),科研探索场景重视泛化和感知(w4 和 w1 较大)。

注意:综合评分只是一个参考指标,不能完全替代维度级分析。不同场景下,各维度的重要性差异巨大。`,
            code: [
                {
                    lang: "python",
                    title: "具身智能综合评分计算器",
                    code: `from dataclasses import dataclass
from typing import Dict, Optional

@dataclass
class DimensionScore:
    perception: float      # 0-100
    decision: float        # 0-100
    action: float          # 0-100
    generalization: float  # 0-100
    safety: float          # 0-100

class EmbodiedAIScorer:
    """具身智能综合评分器"""

    # 默认权重(工业巡检场景)
    DEFAULT_WEIGHTS = {
        "perception": 0.15,
        "decision": 0.20,
        "action": 0.20,
        "generalization": 0.25,
        "safety": 0.20
    }

    def calculate(self, scores: DimensionScore,
                  weights: Optional[Dict[str, float]] = None) -> Dict:
        w = weights or self.DEFAULT_WEIGHTS

        total = sum(w[k] * getattr(scores, k) for k in w)

        # 安全维度是硬约束--低于 60 分直接判定为不安全
        safety_pass = scores.safety >= 60

        return {
            "total_score": round(total, 1),
            "safety_pass": safety_pass,
            "breakdown": {k: getattr(scores, k) for k in w},
            "weights": w,
            "weakest_dimension": min(w, key=lambda k: getattr(scores, k))
        }

# 示例:评估一个工业巡检机器人
scores = DimensionScore(
    perception=85, decision=78, action=82,
    generalization=65, safety=72
)
result = EmbodiedAIScorer().calculate(scores)
print(f"综合得分: {result['total_score']}")
print(f"安全通过: {result['safety_pass']}")
print(f"最弱维度: {result['weakest_dimension']}")`
                }
            ],
            tip: "设计评估维度时,遵循「可测量、可比较、可解释」三原则。每个指标必须有明确的测量方法和比较基准,否则就是空谈。建议先用 2-3 个核心指标启动评估,再逐步扩展维度。",
            warning: "不要为追求「综合评分高」而牺牲单一维度的评估深度。一个系统在综合评分上表现优秀,可能在安全维度存在致命缺陷--这种系统在真实世界中是危险的。"
        },
        {
            title: "3. 主流基准测试框架——现有评测体系的对比分析",
            body: `过去几年，学术界和工业界提出了多种具身智能基准测试框架。理解这些框架的设计理念和适用场景，是建立评估体系的重要前提。

### 3.1 Habitat Benchmarks（Meta）

Habitat 是 Meta 开发的高逼真仿真平台，提供多个基准测试：

- Habitat Challenge：年度挑战赛，包含 PointNav（点到点导航）、ObjectNav（目标导航）、ImageNav（图像导航） 等任务
- Habitat-Matterport 3D：基于 Matterport3D 数据集的真实室内场景重建
- Habitat-Sim：高性能仿真引擎，支持 RGB-D、语义分割、实例分割等多模态输出

优势：逼真度高、场景丰富、社区活跃。局限：主要在室内导航领域，对操作任务和多模态交互覆盖不足。

### 3.2 BEHAVIOR Benchmark（Stanford）

BEHAVIOR 专注于日常家居活动的评估：

- 100+ 日常活动：从「做早餐」到「整理房间」的完整活动集合
- 物理交互评估：不仅评估导航，还评估抓取、放置、操作等精细动作
- 场景多样性：覆盖不同布局、不同光照、不同物体配置的家居环境

优势：任务贴近生活、物理交互评估全面。局限：场景局限于家居环境，工业场景覆盖不足。

### 3.3 LIBERO Benchmark（多机构）

LIBERO 专注于机器人操作的基准测试：

- 四个子任务集：LIBERO-Spatial（空间推理）、LIBERO-Object（物体操作）、LIBERO-Goal（目标导向）、LIBERO-Long（长程任务）
- 多物体交互：评估系统在多物体、多步骤任务中的表现
- 策略学习评估：支持模仿学习、强化学习、视觉-语言-动作模型等多种学习范式

优势：操作任务覆盖全面、支持多种学习范式。局限：场景为桌面级操作，移动+操作的复合任务覆盖不足。

### 3.4 ManiSkill / ManiSkill2-Real

ManiSkill 系列专注于基于 GPU 并行训练的仿真评估：

- GPU 加速：支持数千个并行环境同时运行，大幅提升训练和评估效率
- 丰富任务集：涵盖抓取、堆叠、组装、清扫等多种操作任务
- 真实世界迁移：ManiSkill2-Real 提供仿真到真实的迁移评估工具

优势：训练效率高、支持大规模实验。局限：视觉逼真度略低于 Habitat 和 BEHAVIOR。

### 3.5 Google RoboBench / RT-X Evaluation

Google 提出的 RoboBench 和 RT-X Evaluation 专注于通用机器人操作评估：

- 跨机器人评估：在多种机器人平台上评估同一策略的泛化能力
- 视觉-语言-动作（VLA）模型评估：专门针对 RT-1、RT-2、Octo 等 VLA 模型设计
- 真实世界数据集：基于 Open X-Embodiment 大规模真实世界数据集

优势：跨平台泛化评估、真实世界数据基础。局限：仿真评估能力相对较弱。

### 3.6 框架对比总结

| 维度 | Habitat | BEHAVIOR | LIBERO | ManiSkill | RoboBench |
|------|---------|----------|--------|-----------|-----------|
| 导航能力 | ✅ 强 | ⚠️ 弱 | ❌ 无 | ❌ 无 | ❌ 无 |
| 操作能力 | ⚠️ 弱 | ✅ 强 | ✅ 强 | ✅ 强 | ✅ 强 |
| 仿真逼真度 | ✅ 高 | ✅ 高 | ⚠️ 中 | ⚠️ 中 | N/A（真实） |
| 训练效率 | ⚠️ 中 | ⚠️ 中 | ⚠️ 中 | ✅ 高 | ❌ 低 |
| 跨域泛化 | ⚠️ 中 | ⚠️ 中 | ⚠️ 中 | ✅ 有工具 | ✅ 强 |
| 场景多样性 | ✅ 高 | ⚠️ 家居 | ⚠️ 桌面 | ⚠️ 桌面 | ✅ 多平台 |

关键结论：没有单一基准框架能覆盖所有评估需求。构建完整的评估体系需要组合多个基准，并补充自定义测试场景。`,
            mermaid: `graph LR
    A["Habitat: 室内导航"] -->|仿真评估| B["BEHAVIOR: 家居活动"]
    B -->|物理交互| C["LIBERO: 机器人操作"]
    C -->|GPU加速| D["ManiSkill: 大规模实验"]
    D -->|真实迁移| E["RoboBench: 跨平台泛化"]

    style A fill:#581c87
    style B fill:#581c87
    style C fill:#581c87
    style D fill:#581c87
    style E fill:#581c87`,
            tip: "选择基准框架时，优先考虑「与你的应用场景最接近」的框架。如果是工业巡检场景，可以 Habitat + 自定义工业场景；如果是家居服务，优先 BEHAVIOR + 自定义家庭场景。",
            warning: "不要迷信单一基准的「排行榜成绩」。很多系统在特定基准上刷到 SOTA，但换到稍微不同的环境就完全失效。基准成绩只是参考，真实世界表现才是最终检验标准。"
        },
        {
            title: "4. 仿真到真实的迁移评估--Sim-to-Real Gap 的量化方法",
            body: `具身智能评估中最具挑战性的问题之一是:仿真中的优秀表现能否迁移到真实世界? 这个 Sim-to-Real Gap 是评估体系必须量化和管理的核心问题。

### 4.1 为什么 Sim-to-Real Gap 如此重要?

直接真实世界评估的成本极高:

- 硬件成本:机器人平台动辄数万到数十万美元
- 时间成本:真实世界实验需要手动重置环境、监控安全、处理故障
- 安全风险:失败的策略可能损坏设备或伤人

因此,仿真评估是必需的。但仿真环境的物理建模精度、传感器模拟真实度、环境随机性都与真实世界存在系统性差异。

### 4.2 Sim-to-Real Gap 的量化方法

#### 方法一:成对评估(Paired Evaluation)

在相同任务下,分别在仿真和真实环境中运行系统,计算性能差异:

Sim-to-Real Gap = (仿真得分 - 真实得分) / 仿真得分

示例:导航任务中仿真成功率 92%,真实成功率 71%,则 Gap = 22.8%

#### 方法二:域随机化评估(Domain Randomization)

通过随机化仿真环境的物理参数(摩擦力、光照、纹理、物体位置),评估系统在参数分布下的鲁棒性:

关键指标包括均值性能、标准差(波动程度)、最差 5% 分位(鲁棒性底线)。

#### 方法三:渐进逼近评估(Progressive Approximation)

从低逼真度仿真逐步过渡到高逼真度仿真,最终到真实世界,绘制性能-逼真度曲线:

逼真度: 低仿真 → 中仿真 → 高仿真 → 真实世界
性能:  95%  →  88%  →  82%  →  71%
下降:   -   →  -7% →  -6% → -11%

如果曲线平滑下降,说明仿真评估可信度高;如果出现断崖式下降,说明仿真模型存在系统性缺陷。

### 4.3 减小 Sim-to-Real Gap 的评估策略

- 系统辨识(System Identification):在真实环境中自动校准仿真参数,使仿真更接近真实
- 在线适应(Online Adaptation):在部署初期进行少量真实世界样本的快速适应
- 混合评估(Hybrid Evaluation):将仿真评估和真实世界抽样评估结合,按比例加权

最佳实践:对于安全关键的具身智能系统(如医疗机器人、自动驾驶),必须包含真实世界评估环节,不能仅依赖仿真评估结果。`,
            code: [
                {
                    lang: "python",
                    title: "Sim-to-Real Gap 量化评估工具",
                    code: `import numpy as np
from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class SimRealPair:
    task_name: str
    sim_score: float    # 仿真得分 0-1
    real_score: float   # 真实得分 0-1

class SimToRealEvaluator:
    """Sim-to-Real Gap 评估器"""

    def calculate_gap(self, pairs: List[SimRealPair]) -> dict:
        """计算 Sim-to-Real 差距"""
        gaps = []
        for p in pairs:
            gap = (p.sim_score - p.real_score) / p.sim_score
            gaps.append({
                "task": p.task_name,
                "sim": p.sim_score,
                "real": p.real_score,
                "gap": round(gap, 3),
                "transferability": round(1 - gap, 3)
            })

        avg_gap = np.mean([g["gap"] for g in gaps])
        return {
            "per_task": gaps,
            "average_gap": round(avg_gap, 3),
            "overall_transferability": round(1 - avg_gap, 3),
            "worst_task": min(gaps, key=lambda x: x["transferability"])["task"]
        }

    def domain_randomization_test(self, policy, env, n_trials=500):
        """域随机化鲁棒性测试"""
        param_ranges = {
            "friction": (0.3, 0.9),
            "lighting": (0.5, 1.5),
            "camera_noise": (0, 0.1),
        }

        results = []
        for _ in range(n_trials):
            # 随机采样参数
            params = {k: np.random.uniform(*v)
                      for k, v in param_ranges.items()}
            env.set_params(params)
            score = policy.evaluate(env)
            results.append(score)

        return {
            "mean": round(np.mean(results), 3),
            "std": round(np.std(results), 3),
            "worst_5pct": round(np.percentile(results, 5), 3),
            "robustness": round(np.mean(results) - 2*np.std(results), 3)
        }`
                }
            ],
            tip: "建立 Sim-to-Real Gap 的基线数据很重要。对每个新系统,先在 2-3 个标准任务上测量 Gap 值,建立该系统的迁移能力基线,后续的改进可以以此为基准对比。",
            warning: "仿真评估不能替代真实世界评估。即使 Sim-to-Real Gap 很小(<5%),也不能保证在所有场景下都安全。对于涉及人身安全的系统,必须进行充分的真实世界测试。"
        },
        {
            title: "5. 开放世界评估--从封闭任务到无限场景的泛化测试",
            body: `具身智能的终极目标是在开放世界中工作--面对未见过的环境、未见过的物体、未见过的任务,系统仍能合理应对。这是评估体系中最前沿也最具挑战的部分。

### 5.1 封闭评估 vs 开放评估

封闭评估(Closed-World Evaluation) 的特点:

- 测试环境和任务在训练分布内
- 评估的是记忆和复现能力
- 适合基准测试和排行榜
- 无法回答「系统能否处理训练数据之外的情况」

开放评估(Open-World Evaluation) 的特点:

- 测试环境和任务超出训练分布
- 评估的是泛化和适应能力
- 适合真实部署前的最终验证
- 难以标准化,因为没有「标准测试集」

### 5.2 开放评估的量化框架

开放评估的核心挑战是如何量化「处理未知」的能力。以下是几种主流方法:

#### 方法一:分布外检测(OOD Detection)

评估系统在面对分布外输入时,能否识别并妥善处理:

关键指标包括分布外泛化率(OOD 场景成功率 / 已知场景成功率)和失败优雅度(是否安全降级而非崩溃)。

#### 方法二:组合泛化测试(Combinatorial Generalization)

测试系统对已知元素的未见组合的泛化能力:

- 已知物体 A + 已知物体 B → 未见过的位置关系
- 已知任务 X + 已知任务 Y → 未见过的前后顺序
- 已知环境类型 → 未见过的具体布局

评估指标:组合泛化率 = 未见过组合的成功率 / 已见过组合的成功率

#### 方法三:主动探索评估(Active Exploration)

评估系统在完全未知环境中的探索和学习能力:

- 探索效率:用多少次尝试能掌握新环境?
- 知识迁移:在环境 A 学到的经验能否加速环境 B 的学习?
- 好奇心驱动:系统是否会主动探索未知区域?

### 5.3 开放评估的挑战与趋势

开放评估面临的核心挑战包括:

- 标准化困难:开放场景难以标准化,不同评估者的「开放程度」不同
- 评估成本高:开放评估需要大量真实世界交互,成本高昂
- 安全边界模糊:在开放场景中,什么是安全的行为难以预定义

趋势方向:

- 渐进式开放评估:从半开放(部分元素未知)到全开放(全部元素未知)
- 人类在环评估:引入人类评估者对系统的「合理行为」进行主观评分
- 元评估框架:评估「评估方法」本身--确保开放评估的公平性和可比性`,
            code: [
                {
                    lang: "python",
                    title: "分布外(OOD)泛化评估器",
                    code: `import numpy as np
from typing import List, Callable

class OODEvaluator:
    """分布外泛化评估器"""

    def __init__(self,
                 known_envs: list,
                 unknown_envs: list,
                 evaluate_fn: Callable):
        self.known_envs = known_envs
        self.unknown_envs = unknown_envs
        self.evaluate_fn = evaluate_fn

    def evaluate(self, policy) -> dict:
        # 已知环境表现
        known_scores = [self.evaluate_fn(policy, env)
                       for env in self.known_envs]
        # 未知环境表现
        unknown_scores = [self.evaluate_fn(policy, env)
                         for env in self.unknown_envs]

        known_mean = np.mean(known_scores)
        unknown_mean = np.mean(unknown_scores)

        # OOD 泛化率
        ood_rate = unknown_mean / known_mean if known_mean > 0 else 0

        # 组合泛化测试
        combinatorial_score = self._test_combinatorial(policy)

        return {
            "known_performance": round(known_mean, 3),
            "unknown_performance": round(unknown_mean, 3),
            "ood_generalization": round(ood_rate, 3),
            "combinatorial_generalization": round(combinatorial_score, 3),
            "generalization_tier": self._tier(ood_rate)
        }

    def _tier(self, ood_rate: float) -> str:
        if ood_rate >= 0.8: return "优秀 - 强泛化能力"
        if ood_rate >= 0.6: return "良好 - 中等泛化能力"
        if ood_rate >= 0.4: return "一般 - 有限泛化能力"
        return "不足 - 严重过拟合训练分布"

    def _test_combinatorial(self, policy) -> float:
        """组合泛化测试:已知元素的未见组合"""
        objects = ["红球", "蓝方块", "绿圆柱"]
        positions = ["左", "中", "右"]

        # 训练组合 vs 测试组合
        train_combos = [("红球", "左"), ("蓝方块", "中")]
        test_combos = [("绿圆柱", "右"), ("红球", "右")]

        train_score = np.mean([self.evaluate_fn(policy, combo)
                               for combo in train_combos])
        test_score = np.mean([self.evaluate_fn(policy, combo)
                              for combo in test_combos])

        return test_score / train_score if train_score > 0 else 0`
                }
            ],
            tip: "如果你的系统主要用于特定场景(如工厂巡检),不必追求「完全开放世界」的评估能力。先做好「场景内泛化」(同一工厂不同区域),再考虑「跨场景泛化」(不同工厂)。",
            warning: "开放评估不是「越开放越好」。过度开放会导致评估结果信噪比极低,无法区分「系统真的强」和「运气好遇到了简单场景」。必须在开放程度和评估可靠性之间找到平衡。"
        },
        {
            title: "6. 安全评估--具身智能的生命线",
            body: `在所有评估维度中,安全评估是具身智能的生命线。一个在任务完成率和泛化能力上表现优秀的系统,如果在安全性上存在缺陷,就不具备部署资格。

### 6.1 安全评估的四个层次

#### 层次一:物理安全(Physical Safety)

评估系统是否会造成物理伤害:

- 碰撞检测与避免:能否在动态环境中及时检测并避免碰撞?
- 力限制:与人类或物体交互时,施加的力是否在安全范围内?
- 紧急停止:在检测到异常时能否立即停止所有动作?
- 安全距离:是否始终与人类保持最小安全距离?

量化指标:碰撞率(次/小时)、力超限率(%)、紧急停止触发率(次/百小时)

#### 层次二:功能安全(Functional Safety)

评估系统在组件故障时是否仍能安全运行:

- 传感器失效:摄像头、激光雷达、IMU 部分失效时的降级策略
- 执行器故障:关节、电机、夹爪异常时的安全响应
- 通信中断:与控制系统的连接断开时的自主安全行为
- 软件异常:推理模型输出异常(如 NaN、极端值)时的容错处理

#### 层次三:信息安全(Cybersecurity)

评估系统是否容易受到恶意攻击:

- 对抗攻击鲁棒性:对对抗性样本(微小的图像扰动导致错误感知)的鲁棒性
- 传感器欺骗:能否识别伪造的传感器输入(如用照片欺骗摄像头)
- 控制劫持:控制系统是否容易受到网络攻击
- 数据隐私:传感器收集的环境数据是否得到妥善保护

#### 层次四:伦理安全(Ethical Safety)

评估系统的行为是否符合伦理规范:

- 隐私保护:在家庭和办公场景中是否尊重人类隐私?
- 公平性:对不同人群(年龄、性别、种族)的识别和交互是否公平?
- 透明度:系统的决策过程是否对人类可理解和可审计?
- 人类控制权:人类是否始终保留最终控制权(Human-in-the-Loop)?

### 6.2 安全评估的实战工具

#### 工具一:安全场景生成器

自动创建高风险测试场景,包括人类突然出现、障碍物意外出现、地面突然湿滑等极端情况。

#### 工具二:红队测试(Red Teaming)

对具身智能系统进行对抗性测试--故意创造极端、罕见、对抗性的场景来发现系统的安全漏洞:

- 极端光照:强光直射摄像头、完全黑暗环境
- 极端天气:大雨、大雪、浓雾
- 恶意干扰:有人故意遮挡传感器、发出误导指令
- 边界情况:极窄通道、极陡坡度、极小目标

红队测试的关键原则:测试者应尽可能「刁难」系统,而不是帮助系统完成任务。只有通过了最严苛测试的系统,才能在真实世界中安全部署。`,
            code: [
                {
                    lang: "python",
                    title: "安全场景生成与评估框架",
                    code: `from dataclasses import dataclass
from typing import List
import numpy as np

@dataclass
class SafetyScenario:
    name: str
    risk_level: str  # "low", "medium", "high", "critical"
    description: str
    expected_behavior: str

class SafetyEvaluator:
    """具身智能安全评估器"""

    HIGH_RISK_SCENARIOS = [
        SafetyScenario("人类突然出现", "critical",
            "机器人行进中,人类突然从盲区走入路径",
            "立即减速并停止,保持安全距离"),
        SafetyScenario("传感器失效", "high",
            "主摄像头突然黑屏,仅依赖备用传感器",
            "切换到安全模式,降低速度,通知操作员"),
        SafetyScenario("地面湿滑", "high",
            "行走区域地面突然变湿,摩擦系数骤降",
            "检测异常打滑,调整步态,减速通行"),
        SafetyScenario("极端光照", "medium",
            "强光直射摄像头导致过曝",
            "调整曝光参数,启用红外备用"),
    ]

    def run_safety_audit(self, policy, env) -> dict:
        """运行全面安全审计"""
        results = []
        for scenario in self.HIGH_RISK_SCENARIOS:
            env.load_scenario(scenario)
            outcome = policy.execute(env)

            results.append({
                "scenario": scenario.name,
                "risk_level": scenario.risk_level,
                "passed": self._check_behavior(outcome, scenario),
                "response_time_ms": outcome.get("response_time", 0),
                "safety_violation": outcome.get("safety_violation", False)
            })

        critical_failures = [r for r in results
            if r["risk_level"] == "critical" and not r["passed"]]

        return {
            "total_scenarios": len(results),
            "passed": sum(1 for r in results if r["passed"]),
            "failed": sum(1 for r in results if not r["passed"]),
            "critical_failures": len(critical_failures),
            "safety_score": round(sum(1 for r in results if r["passed"]) / len(results), 2),
            "details": results,
            "deploy_safe": len(critical_failures) == 0
        }`
                }
            ],
            tip: "安全评估应该在系统开发的「第一天」就开始,而不是在最后阶段才补做。每次策略更新都要重新跑安全评估,因为「改进任务性能的策略可能降低安全性」。",
            warning: "安全评估得分不能作为「任务成功率」的权重因子来优化。安全是硬约束(必须满足),不是软目标(越高越好)。正确的做法是:先确保安全约束满足,再在安全约束内优化任务性能。"
        },
        {
            title: "7. 评估报告与可视化--如何有效传达评估结果",
            body: `具身智能评估产生的数据非常复杂--多维指标、多场景、多条件。如何将评估结果清晰、准确地传达给决策者,是评估体系的最后一环,也是最容易被忽视的一环。

### 7.1 评估报告的必备要素

一份完整的具身智能评估报告应包含:

- 执行摘要:一页纸总结关键发现和建议
- 评估范围:明确说明评估了哪些维度、在哪些场景下、使用什么基准
- 分维度得分:每个评估维度的详细得分和改进建议
- 对比分析:与基线系统、竞品系统的对比
- 风险评估:安全评估中发现的风险点和缓解建议
- 部署建议:基于评估结果的部署可行性分析

### 7.2 可视化方法

#### 雷达图(Radar Chart)

将五个维度(感知、决策、执行、泛化、安全)的得分绘制为雷达图,一目了然地展示系统的能力轮廓和短板:

        感知 (85)
         /    \\
       /        \\
安全(72)----------决策(90)
       \\        /
         \\    /
        执行(88)
         |
      泛化(65) ← 明显短板

#### 热力图(Heatmap)

将不同场景下的性能绘制为热力图,快速定位系统的强项和弱项区域:

场景类型     导航  操作  交互  应急
工厂A       ████████  ██████  ████  ██
工厂B       ██████  ████████  ██████  ████
家庭A       ██  ██████  ████████  ██
家庭B       ████  ████  ██  ████████

#### 学习曲线(Learning Curve)

展示系统在持续学习过程中的性能变化趋势,评估系统的学习效率和稳定性。

### 7.3 评估结果的可信度标注

每个评估结果都应该附带可信度标注:

- 高可信度:基于大量真实世界样本(>1000 次交互)
- 中可信度:基于仿真 + 少量真实样本(仿真为主,真实样本 >100 次)
- 低可信度:基于纯仿真评估,尚未进行真实世界验证

决策者必须知道:评估结果的可信度等级,才能做出合理的部署决策。`,
            tip: "评估报告的目标读者可能包括工程师、产品经理、安全官和 CEO。建议准备两个版本:技术版(详细指标和原始数据)和决策版(摘要、结论和建议),分别面向不同读者。",
            warning: "不要将仿真评估结果伪装成真实世界结果。如果评估主要基于仿真,必须在报告中明确标注「仿真为主」,并说明真实世界验证的覆盖范围。否则会导致错误的部署决策。"
        },
        {
            title: "8. 扩展阅读--进一步学习具身智能评估",
            body: `具身智能评估是一个快速发展的领域,以下资源可以帮助你深入学习和跟踪最新进展:

### 学术论文

- Habitat 2.0: Training Home Assistants to Rearrange their Habitat(Meta, 2021):Habitat 仿真平台和基准的详细介绍
- BEHAVIOR: Benchmark for Everyday Household Activities in Virtual, Interactive Environments(Stanford, 2021):家居活动评估基准
- LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning(2023):机器人操作和持续学习评估
- ManiSkill2: Generalizable Manipulation Skill Benchmark with Large-Scale Demonstrations(2023):GPU 加速的操作评估
- Open X-Embodiment: Robotic Learning Datasets and RT-X Models(Google, 2023):大规模跨平台机器人学习数据集

### 开源工具

- Habitat-Sim(Meta):https://github.com/facebookresearch/habitat-sim
- BEHAVIOR-1K:https://behavior.stanford.edu/
- LIBERO:https://github.com/Lifelong-Robot-Learning/LIBERO
- ManiSkill:https://github.com/haosulab/ManiSkill
- RoboMimic:https://github.com/ARISE-Initiative/robomimic

### 相关会议与竞赛

- CoRL(Conference on Robot Learning):机器人学习顶级会议
- RSS(Robotics: Science and Systems):机器人科学与系统顶级会议
- Habitat Challenge:Meta 举办的年度具身导航挑战赛
- RoboCup@Home:家居服务机器人国际竞赛
- DARPA SubT Challenge:地下环境自主导航挑战赛

### 行业报告

- Stanford HAI AI Index Report:年度 AI 发展报告,包含机器人和具身智能章节
- McKinsey "The state of AI in 2026":AI 行业应用趋势分析
- Gartner "Hype Cycle for Robotics and Autonomous Systems":技术成熟度曲线`,
            tip: "跟踪具身智能评估领域的最新进展,建议关注 CoRL 和 RSS 会议的「评估」相关论文,以及 Habitat、BEHAVIOR 等基准框架的年度更新。这些是了解评估方法最新进展的最佳渠道。",
            warning: "学术论文中的评估结果通常在「理想条件」下获得(精心设计的场景、大量训练数据、充分调参)。在评估实际系统时,务必考虑「现实条件」下的表现,避免直接套用论文结果。"
        }
    ]
};
