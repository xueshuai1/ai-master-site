// AI Agent 垂直化工作空间：从通用工具到专业领域 Agent 的范式转移

import { Article } from '../knowledge';

export const article: Article = {
  id: "agent-017",
  title: "AI Agent 垂直化工作空间：从通用编程助手到专业领域自主智能体",
  category: "agent",
  tags: ["AI Agent 垂直化", "专业 Agent", "seomachine", "AI-Trader", "工作空间", "Agent 生态", "Claude Code", "领域专用 AI"],
  summary: "2026 年，AI Agent 正在经历一场深刻的垂直化转型：从「什么都能做一点的通用助手」变为「在一个领域做到极致的专业智能体」。seomachine 将 Claude Code 改造为 SEO 内容创作平台，AI-Trader 将 Agent 专精于金融交易，Firefly AI 助手自主操作设计软件。本文系统梳理 AI Agent 垂直化的技术路径、代表项目、生态趋势和对从业者的影响。",
  date: "2026-04-18",
  readTime: "20 min",
  level: "进阶",
  content: [
    {
      title: "AI Agent 的十字路口：通用 vs 垂直",
      body: `2024-2025 年，AI Agent 的主旋律是「通用性」：一个 Agent 能写代码、能聊天、能做分析、能搜索。人们相信，只要模型足够强大，一个 Agent 就能胜任所有任务。\n\n但 2026 年的现实给出了不同的答案：通用 Agent 什么都懂一点，但什么都不精。\n\n当开发者需要写生产级代码时，他们会用 Cursor 或 **Claude** Code；当营销人员需要 SEO 内容时，他们会用 seomachine；当交易员需要量化策略时，他们会用 AI-Trader。每个领域都在孕育自己的专业 Agent，而这些专业 Agent 的能力已经远超通用 Agent 在该领域的表现。`,
      mermaid: `graph TD
    A["2024-2025
通用 Agent 时代"] --> B["什么都能做
但什么都不精"]
    A --> C["ChatGPT / Claude
一个模型搞定一切"]
    
    D["2026
垂直 Agent 时代"] --> E["每个领域一个专家级 Agent"]
    D --> F["seomachine → SEO 内容"]
    D --> G["AI-Trader → 金融交易"]
    D --> H["Firefly AI → 创意设计"]
    D --> I["Cursor → 代码开发"]
    
    B -.->|能力不足| J["用户转向专业工具"]
    C -.->|生态迁移| K["垂直工作空间崛起"]
    class E s2
    class D s1
    class A s0
    classDef s0 fill:#b45309,stroke:\#d97706,color:#fff
    classDef s1 fill:#047857,stroke:\#059669,color:#fff
    classDef s2 fill:#1d4ed8,stroke:\#2563eb,color:#fff`,
    },
    {
      title: "为什么通用 Agent 不够用？",
      body: `通用 Agent 的局限不是能力问题，而是架构和工作流设计的问题：`,
      list: [
        "领域知识深度不足：通用 Agent 的知识是「广度优先」的，缺乏特定领域的深度知识（如 SEO 的关键词竞争度分析、量化交易的风险管理模型）",
        "工作流适配性差：每个专业领域都有其标准工作流，通用 Agent 无法原生支持这些流程（如 SEO 的「调研→写作→优化→发布」流水线）",
        "工具集成粒度粗：通用 Agent 的工具调用是「通用型」的，而专业领域需要细粒度的工具集成（如 seomachine 集成 GA4、Search Console、关键词规划师等）",
        "输出质量不稳定：通用 Agent 的输出质量波动大，专业人士需要可预测、可复现的结果",
        "缺乏领域评估标准：通用 Agent 没有针对特定领域的质量评估（如 SEO 内容的 E-E-A-T 评分、代码的测试覆盖率）",
      ],
      table: {
        headers: ["维度", "通用 Agent", "垂直 Agent（如 seomachine）"],
        rows: [
          ["知识深度", "百科全书式，广度优先", "领域专家，深度优先"],
          ["工作流", "用户需自行编排", "内置行业标准工作流"],
          ["工具集成", "通用 API 调用", "深度集成领域专属工具"],
          ["输出质量", "波动大，需人工审核", "稳定，符合行业标准"],
          ["学习曲线", "低（自然语言即可）", "中（需了解领域知识）"],
          ["可扩展性", "高（通过 prompt 调整）", "中（通过插件/模块扩展）"],
          ["评估标准", "通用（相关性、流畅度）", "领域特定（SEO 评分、代码质量）"],
        ],
      },
    },
    {
      title: "代表性垂直 Agent 工作空间深度解析",
      body: `2026 年已经涌现出多个成熟的垂直 Agent 工作空间，每个都在自己的领域做到了「专家级」水平。以下是三个最具代表性的案例：`,
    },
    {
      title: "案例一：seomachine — SEO 内容创作工作空间",
      body: `seomachine 是一个专为 **Claude** Code 设计的 SEO 优化内容创作工作空间，由 TheCraigHewitt 开发，GitHub 星星数 6,272+（周增长 2,562）。\n\n核心架构：\n\nseomachine 不是一个简单的「AI 写作工具」，而是一个完整的 SEO 内容工厂：`,
      mermaid: `graph LR
    A["/research"] --> B["关键词调研"]
    B --> C["竞争分析"]
    C --> D["内容大纲生成"]
    
    D --> E["/write"]
    E --> F["SEO 优化内容撰写"]
    F --> G["E-E-A-T 合规检查"]
    
    G --> H["/analyze"]
    H --> I["内容质量评估"]
    I --> J["可读性评分"]
    
    J --> K["/optimize"]
    K --> L["关键词密度优化"]
    L --> M["内链/外链建议"]
    
    M --> N["/publish"]
    N --> O["CMS 推送"]
    O --> P["GA4 数据反馈"]
    P --> A
    
    classDef step fill:#1d4ed8,stroke:\#2563eb,color:#fff
    class A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P step`,
      code: [{
        lang: "python",
        code: `from dataclasses import dataclass, field
from typing import Optional

@dataclass
class SEOContentPipeline:
    """seomachine 的 SEO 内容流水线"""
    target_keyword: str
    secondary_keywords: list[str]
    target_audience: str
    content_type: str  # "blog", "guide", "review", "comparison"
    
    # 调研阶段数据
    search_volume: int = 0
    keyword_difficulty: int = 0
    top_competitors: list[dict] = field(default_factory=list)
    search_intent: str = ""  # "informational", "commercial", "transactional"
    
    # 内容阶段数据
    outline: Optional[dict] = None
    draft: Optional[str] = None
    seo_score: float = 0.0  # 0-100
    readability_score: float = 0.0  # Flesch score
    
    # 发布阶段数据
    published_url: Optional[str] = None
    ga4_impressions: int = 0
    ga4_clicks: int = 0
    ga4_ctr: float = 0.0
    
    def calculate_competitive_gap(self) -> dict:
        """计算竞争差距，找出内容机会"""
        if not self.top_competitors:
            return {"opportunity": "no_data"}
        
        # 分析竞品覆盖的主题
        competitor_topics = set()
        for comp in self.top_competitors:
            competitor_topics.update(comp.get("covered_topics", []))
        
        # 找出未被覆盖但有搜索量的子话题
        all_subtopics = self._get_related_subtopics()
        gaps = [t for t in all_subtopics if t not in competitor_topics]
        
        return {
            "content_gaps": gaps[:5],  # Top 5 机会
            "avg_competitor_score": sum(
                c.get("seo_score", 0) for c in self.top_competitors
            ) / len(self.top_competitors),
            "target_score": 85,  # 超越竞品所需分数
        }
    
    def _get_related_subtopics(self) -> list[str]:
        """获取相关子话题（模拟）"""
        return [
            f"{self.target_keyword} 入门指南",
            f"{self.target_keyword} 最佳实践",
            f"{self.target_keyword} vs 竞品对比",
            f"{self.target_keyword} 常见错误",
            f"{self.target_keyword} 工具推荐",
        ]

# 示例：创建一个 SEO 内容项目
pipeline = SEOContentPipeline(
    target_keyword="AI Agent 垂直化",
    secondary_keywords=["专业 AI Agent", "垂直领域 AI", "Agent 工作空间"],
    target_audience="AI 从业者、产品经理",
    content_type="guide",
    search_volume=1200,
    keyword_difficulty=45,
    top_competitors=[
        {"url": "competitor-a.com", "seo_score": 72, "covered_topics": ["入门", "工具"]},
        {"url": "competitor-b.com", "seo_score": 68, "covered_topics": ["入门", "案例"]},
    ],
)

gaps = pipeline.calculate_competitive_gap()
print(f"内容机会: {gaps['content_gaps']}")
print(f"目标分数: {gaps['target_score']}（竞品平均: {gaps['avg_competitor_score']:.0f}）")`
      }, {
        lang: "python",
        code: `import json
from enum import Enum

class EEATCategory(Enum):
    EXPERIENCE = "experience"      # 经验
    EXPERTISE = "expertise"        # 专业性
    AUTHORITATIVENESS = "authoritativeness"  # 权威性
    TRUSTWORTHINESS = "trustworthiness"  # 可信度

class EEATEvaluator:
    """E-E-A-T 内容质量评估器"""
    
    def __init__(self, content: str, metadata: dict):
        self.content = content
        self.metadata = metadata
        self.scores = {}
    
    def evaluate(self) -> dict:
        """执行完整的 E-E-A-T 评估"""
        self.scores["experience"] = self._check_experience()
        self.scores["expertise"] = self._check_expertise()
        self.scores["authoritativeness"] = self._check_authoritativeness()
        self.scores["trustworthiness"] = self._check_trustworthiness()
        
        overall = sum(self.scores.values()) / len(self.scores)
        
        return {
            "overall_score": round(overall, 1),
            "breakdown": {k.value: v for k, v in self.scores.items()},
            "passed": overall >= 70,
            "recommendations": self._get_recommendations(),
        }
    
    def _check_experience(self) -> float:
        """检查经验信号：第一人称叙述、实际案例、个人经历"""
        score = 50.0
        first_person_signals = ["我", "我们", "我们的实践", "我们测试过"]
        case_study_signals = ["案例", "实际", "实测", "我们的客户"]
        
        for signal in first_person_signals:
            if signal in self.content:
                score += 5
        
        for signal in case_study_signals:
            if signal in self.content:
                score += 8
        
        return min(score, 100)
    
    def _check_expertise(self) -> float:
        """检查专业性信号：数据引用、技术深度、专业术语"""
        score = 50.0
        data_signals = ["数据", "统计", "研究表明", "%", "增长率"]
        technical_signals = ["架构", "API", "模型", "算法", "框架"]
        
        for signal in data_signals:
            if signal in self.content:
                score += 4
        
        for signal in technical_signals:
            if signal in self.content:
                score += 3
        
        return min(score, 100)
    
    def _check_authoritativeness(self) -> float:
        """检查权威性信号：外部引用、作者资质、来源可信度"""
        score = 50.0
        if "引用" in self.content or "来源" in self.content:
            score += 15
        if "作者" in self.metadata:
            score += 10
        if "参考文献" in self.content:
            score += 15
        
        return min(score, 100)
    
    def _check_trustworthiness(self) -> float:
        """检查可信度信号：透明度、免责声明、数据时效性"""
        score = 50.0
        if "免责声明" in self.content or "风险提示" in self.content:
            score += 15
        if "更新于" in self.content or "发布日期" in self.content:
            score += 10
        if "数据来源" in self.content:
            score += 15
        
        return min(score, 100)
    
    def _get_recommendations(self) -> list[str]:
        """根据评估结果给出改进建议"""
        recs = []
        if self.scores.get("experience", 0) < 70:
            recs.append("增加第一人称实践经验描述")
        if self.scores.get("expertise", 0) < 70:
            recs.append("增加数据支撑和技术深度分析")
        if self.scores.get("authoritativeness", 0) < 70:
            recs.append("增加外部权威来源引用")
        if self.scores.get("trustworthiness", 0) < 70:
            recs.append("添加数据来源说明和免责声明")
        return recs`
      }],
    },
    {
      title: "案例二：AI-Trader — 全自动 Agent 交易系统",
      body: `AI-Trader 由香港大学 HKUDS 团队开发，GitHub 星星数 13,400+（周增长 1,035），是 100% 全自动 Agent 原生的金融交易系统。\n\n核心特点：\n\n与传统的量化交易工具不同，AI-Trader 不是「人类写策略→机器执行」的模式，而是Agent 自主完成整个交易生命周期：`,
      list: [
        "自主研究：Agent 自主阅读财经新闻、财报、研报，提取交易信号",
        "自主策略生成：基于市场状态自动生成和调整交易策略",
        "自主执行：在模拟或真实环境中自主下单、止损、止盈",
        "自主风控：实时监控风险敞口，自动调整仓位",
        "自主复盘：交易结束后自主分析盈亏原因，优化策略",
      ],
      mermaid: `graph TD
    A["市场数据源
新闻/财报/K线/社交媒体"] --> B["信息提取 Agent"]
    B --> C["信号生成
看涨/看跌/中性"]
    
    C --> D["策略生成 Agent"]
    D --> E["策略库
动量/均值回归/套利"]
    
    E --> F["执行 Agent"]
    F --> G["下单/止损/止盈"]
    
    G --> H["风控 Agent"]
    H --> I["风险评估"]
    I -->|超限| J["自动减仓"]
    I -->|正常| F
    
    H --> K["复盘 Agent"]
    K --> L["盈亏分析"]
    L --> M["策略优化"]
    M --> D
    class K s4
    class H s3
    class F s2
    class D s1
    class B s0
    classDef s0 fill:#1d4ed8,stroke:\#2563eb,color:#fff
    classDef s1 fill:#047857,stroke:\#059669,color:#fff
    classDef s2 fill:#b45309,stroke:\#d97706,color:#fff
    classDef s3 fill:#b91c1c,stroke:\#dc2626,color:#fff
    classDef s4 fill:#5b21b6,stroke:#7c3aed,color:#f1f5f9`,
      code: [{
        lang: "python",
        code: `from dataclasses import dataclass
from enum import Enum
from typing import Optional

class SignalType(Enum):
    BULLISH = "bullish"
    BEARISH = "bearish"
    NEUTRAL = "neutral"

class StrategyType(Enum):
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    ARBITRAGE = "arbitrage"
    SENTIMENT = "sentiment"

@dataclass
class TradingSignal:
    """交易信号"""
    symbol: str
    signal_type: SignalType
    confidence: float  # 0.0 - 1.0
    reasoning: str  # Agent 的推理过程
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None

@dataclass
class TradePosition:
    """交易仓位"""
    symbol: str
    direction: str  # "long" / "short"
    entry_price: float
    quantity: float
    strategy: StrategyType
    stop_loss: float
    take_profit: float
    unrealized_pnl: float = 0.0
    
    def check_risk_limits(self, max_position_pct: float = 0.05) -> bool:
        """检查仓位是否符合风控限制"""
        position_value = self.quantity * self.entry_price
        return position_value <= max_position_pct

class AgentTrader:
    """Agent 自主交易器"""
    
    def __init__(self, initial_capital: float = 1_000_000):
        self.capital = initial_capital
        self.positions: dict[str, TradePosition] = {}
        self.trade_history: list[dict] = []
        self.max_drawdown = 0.0
        self.current_drawdown = 0.0
        self.peak_capital = initial_capital
    
    def process_signal(self, signal: TradingSignal) -> Optional[TradePosition]:
        """处理交易信号，生成交易决策"""
        if signal.confidence < 0.7:
            return None  # 置信度不足，不交易
        
        # Agent 自主决定策略
        strategy = self._select_strategy(signal)
        
        # Agent 自主计算仓位
        position_size = self._calculate_position_size(signal, strategy)
        
        # Agent 自主设置止损止盈
        stop_loss, take_profit = self._set_risk_levels(signal, strategy)
        
        position = TradePosition(
            symbol=signal.symbol,
            direction="long" if signal.signal_type == SignalType.BULLISH else "short",
            entry_price=signal.target_price or 0,
            quantity=position_size,
            strategy=strategy,
            stop_loss=stop_loss,
            take_profit=take_profit,
        )
        
        if position.check_risk_limits():
            self.positions[signal.symbol] = position
            return position
        
        return None
    
    def _select_strategy(self, signal: TradingSignal) -> StrategyType:
        """Agent 自主选择合适的交易策略"""
        if "动量" in signal.reasoning:
            return StrategyType.MOMENTUM
        elif "均值" in signal.reasoning or "回归" in signal.reasoning:
            return StrategyType.MEAN_REVERSION
        elif "套利" in signal.reasoning:
            return StrategyType.ARBITRAGE
        elif "情绪" in signal.reasoning or "舆情" in signal.reasoning:
            return StrategyType.SENTIMENT
        return StrategyType.MOMENTUM  # 默认
    
    def _calculate_position_size(self, signal: TradingSignal, 
                                  strategy: StrategyType) -> float:
        """Agent 自主计算仓位大小（Kelly 公式变体）"""
        win_rate = signal.confidence
        avg_win = 0.02  # 假设平均盈利 2%
        avg_loss = 0.01  # 假设平均亏损 1%
        
        kelly_pct = win_rate - (1 - win_rate) * (avg_loss / avg_win)
        kelly_pct = max(0, min(kelly_pct, 0.25))  # 限制在 0-25%
        
        return self.capital * kelly_pct
    
    def _set_risk_levels(self, signal: TradingSignal,
                         strategy: StrategyType) -> tuple[float, float]:
        """Agent 自主设置止损和止盈"""
        price = signal.target_price or 100
        
        if strategy == StrategyType.MOMENTUM:
            stop_loss = price * 0.97  # 3% 止损
            take_profit = price * 1.06  # 6% 止盈
        elif strategy == StrategyType.MEAN_REVERSION:
            stop_loss = price * 0.95
            take_profit = price * 1.04
        else:
            stop_loss = price * 0.98
            take_profit = price * 1.05
        
        return stop_loss, take_profit`
      }],
    },
    {
      title: "案例三：Firefly AI 助手 — 创意设计自主 Agent",
      body: `Adobe Firefly AI 助手（2026 年 4 月发布）将 AI Agent 带入了创意设计领域，能够在 Photoshop、Illustrator 等 Creative Cloud 应用中自主执行设计操作。\n\n技术特点：\n\n- 多模态理解：理解自然语言指令并映射为具体的设计操作\n- 状态感知：实时感知 Photoshop 文档的图层、选区、历史记录状态\n- 自主操作：在专业设计软件中自主点击、选择、调整参数\n- 多步骤编排：将复杂设计需求拆解为可执行的操作序列\n\n这代表了垂直 Agent 的一个重要方向：不是构建新工具，而是让 AI 学会操作已有的专业工具。`,
    },
    {
      title: "垂直 Agent 的技术架构模式",
      body: `分析上述案例，可以总结出垂直 Agent 工作空间的通用技术架构模式：`,
      mermaid: `graph TD
    A["领域知识层
专业知识库/规则/最佳实践"] --> B["工作流引擎层
标准化流程编排"]
    B --> C["工具集成层
领域专属工具/API"]
    C --> D["评估反馈层
领域质量指标"]
    D --> E["学习优化层
持续改进"]
    
    A -.->|约束| B
    B -.->|调用| C
    C -.->|输出| D
    D -.->|反馈| E
    E -.->|更新| A
    
    classDef layer fill:#1d4ed8,stroke:\#2563eb,color:#fff
    class A,B,C,D,E layer`,
      list: [
        "领域知识层：每个垂直 Agent 都有自己的「专业知识库」，包含行业规则、最佳实践、领域术语。这是与通用 Agent 最本质的区别",
        "工作流引擎层：不是「用户说→Agent 做」的简单模式，而是将行业标准工作流编码为可编排的流程（如 SEO 的 research→write→optimize→publish）",
        "工具集成层：深度集成领域专属工具，不是通用 API 调用，而是针对特定工具链的深度适配",
        "评估反馈层：每个领域有自己的质量评估标准（SEO 的 E-E-A-T、代码的测试覆盖率、设计的品牌一致性），Agent 需要能自我评估",
        "学习优化层：通过持续的用户反馈和效果数据，Agent 不断优化自己的策略和输出质量",
      ],
    },
    {
      title: "垂直 Agent 工作空间的生态趋势",
      body: `垂直 Agent 的崛起不仅仅是产品层面的变化，更在催生一个全新的生态体系：`,
      table: {
        headers: ["趋势", "描述", "代表案例", "影响"],
        rows: [
          ["Agent 插件市场", "像 VS Code 插件一样，垂直 Agent 支持社区开发的扩展模块", "seomachine 的 26 个营销技能 Agent", "降低开发门槛，加速领域覆盖"],
          ["跨 Agent 协作", "不同领域的 Agent 可以组合使用，形成更完整的工作流", "AI-Trader + seomachine（财经内容生成）", "打破领域边界，创造新场景"],
          ["Agent 标准化协议", "Agent 之间的通信协议、数据格式、评估标准正在标准化", "MCP（Model Context Protocol）", "互操作性提升，生态加速"],
          ["Agent-as-a-Service", "垂直 Agent 以 SaaS 形式提供，按需订阅", "Firefly AI（Creative Cloud 内置）", "降低使用门槛，推动普及"],
          ["开源 Agent 生态", "开源社区驱动的垂直 Agent 快速迭代", "seomachine、AI-Trader 等开源项目", "创新速度超越闭源方案"],
        ],
      },
      tip: "趋势预判：未来 1-2 年，「Agent 工作空间」将形成类似 VS Code 插件市场的生态。每个垂直领域都会有自己的 Agent 集合，用户可以根据自己的需求组合使用不同的 Agent。这不是「选择一个 Agent」的问题，而是「如何组合多个 Agent」的问题。",
    },
    {
      title: "对从业者的影响与建议",
      body: `AI Agent 垂直化对不同类型的从业者有不同的影响：`,
      list: [
        "领域专家（设计师、交易员、营销人员）：你的价值不在于「会使用工具」，而在于「知道什么是好的」。学会给 AI Agent 下指令、审核 AI 输出、制定创意策略，是未来的核心能力",
        "AI 开发者：通用大模型的竞争已经白热化，垂直 Agent 是差异化竞争的新蓝海。关键是选择一个有足够深度的领域，做出「通用 Agent 做不到的事」",
        "企业管理者：不要试图用一个通用 AI 解决所有问题。为每个核心业务场景选择合适的垂直 Agent，并建立 Agent 协作的工作流",
        "创业者：垂直 Agent 工作空间是 2026-2027 年最大的创业机会之一。选择一个你深度了解的领域，构建该领域的 Agent 工作空间，可能比做通用 AI 产品更容易成功",
      ],
    },
    {
      title: "总结：从「万金油」到「专科医生」",
      body: `AI Agent 的垂直化不是对通用 AI 的否定，而是AI 能力深化的必然路径。\n\n就像医学从「全科医生」发展出「专科医生」一样，AI 也在从「什么都懂一点的通用助手」进化为「在特定领域做到极致的专业智能体」。\n\n这不是零和博弈，而是生态扩张：\n- 通用 AI 提供底层能力（语言理解、推理、代码生成）\n- 垂直 Agent 在此基础上构建领域深度（专业知识、工作流、工具链）\n- 两者形成互补，而非竞争\n\n> 「AI 不会替代领域专家，但会用垂直 AI Agent 的专家会替代不会用的。」\n\n在 2026 年，这句话正在成为每个行业的现实。`
    },
  ],
};
