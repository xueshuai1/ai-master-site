import { Article } from '../knowledge';

export const article: Article = {
    id: "ethics-006",
    title: "AI 版权与知识产权：法律、技术与伦理",
    category: "ethics",
    tags: ["版权", "知识产权", "法律", "AI生成"],
    summary: "从训练数据版权争议到 AI 生成内容的权利归属，全面理解 AI 时代的知识产权挑战",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. AI 训练数据的版权困境",
            body: `AI 训练数据的版权问题是目前最具争议的法律议题之一。大型语言模型和图像生成模型的训练需要海量的数据——通常是数十亿网页、数百万书籍、数十亿张图片。这些数据中绝大部分受版权保护，而 AI 公司在收集和使用这些数据时，往往没有获得版权所有者的明确许可。

核心法律争议在于：使用受版权保护的作品训练 AI 是否构成侵权？这个问题涉及著作权法中的几个关键概念。首先是复制权——将受版权保护的文本数字化并存储在训练数据集中，这本身就是复制行为。其次是演绎权——AI 模型学习数据的模式和风格后生成的内容，是否构成原作品的演绎作品？最后是合理使用（Fair Use）——在美国法律框架下，某些非转换性使用可能被认定为合理使用，但 AI 训练是否属于合理使用尚未有明确的法律判例。

2023-2025 年，多起重大诉讼将这个问题推向风口浪尖。纽约时报起诉 OpenAI 和微软，指控其使用时报的文章训练 GPT 模型；多位视觉艺术家起诉 Stability AI 和 Midjourney，指控其使用艺术家的作品训练图像生成模型。这些案件的结果将对整个 AI 行业产生深远影响。

从技术角度看，AI 公司提出了几种辩护论点。第一是转换性使用——模型不是简单地复制数据，而是从中学习模式和规律，生成了全新的内容。第二是数据而非作品——模型训练使用的是数据中的统计模式，而不是作品本身的表达。第三是技术中立——技术本身是中立的，关键在于使用方式。然而这些论点在法理上仍有争议。`,
            code: [
                {
                    lang: "python",
                    code: `# 训练数据版权合规检查工具

from dataclasses import dataclass
from typing import List, Optional
from enum import Enum

class LicenseType(Enum):
    PUBLIC_DOMAIN = "public_domain"       # 公共领域
    CREATIVE_COMMON = "creative_common"    # 知识共享
    PROPRIETARY = "proprietary"            # 专有版权
    UNKNOWN = "unknown"                    # 未知

@dataclass
class DataItem:
    source_url: str
    license: LicenseType
    copyright_holder: Optional[str]
    has_permission: bool
    commercial_use_allowed: bool

class DatasetComplianceChecker:
    """训练数据集版权合规检查器"""

    def __init__(self, items: List[DataItem]):
        self.items = items

    def audit(self) -> dict:
        """全面审计数据集的版权合规性"""
        total = len(self.items)
        by_license = {}
        for item in self.items:
            key = item.license.value
            by_license[key] = by_license.get(key, 0) + 1

        risky = [
            item for item in self.items
            if item.license in (LicenseType.PROPRIETARY, LicenseType.UNKNOWN)
            and not item.has_permission
        ]

        return {
            "total_items": total,
            "by_license": by_license,
            "risky_items": len(risky),
            "risk_rate": len(risky) / total if total > 0 else 0,
            "recommendation": (
                "数据集版权风险较高，建议清理" if len(risky) / total > 0.1
                else "数据集版权风险可控"
            )
        }

# 使用示例
dataset = DatasetComplianceChecker(sample_items)
audit = dataset.audit()
print(f"风险项: {audit['risky_items']}/{audit['total_items']}")
print(f"风险率: {audit['risk_rate']:.1%}")
print(f"建议: {audit['recommendation']}")`
                },
                {
                    lang: "python",
                    code: `# 计算数据集的版权风险评分

def calculate_copyright_risk_score(
    public_domain_ratio: float,
    licensed_ratio: float,
    unknown_ratio: float,
    commercial_use_ratio: float,
    has_opt_out_mechanism: bool,
    data_source_transparency: bool
) -> dict:
    """
    计算数据集版权风险评分 (0-100, 越低越安全)

    评分维度:
    - 公共领域数据比例 (权重 20%)
    - 有明确许可的数据比例 (权重 25%)
    - 允许商业使用的比例 (权重 20%)
    - 有无 opt-out 机制 (权重 15%)
    - 数据来源透明度 (权重 20%)
    """
    weights = {
        "public_domain": 0.20,
        "licensed": 0.25,
        "commercial_use": 0.20,
        "opt_out": 0.15,
        "transparency": 0.20
    }

    scores = {
        "public_domain": public_domain_ratio * 100,
        "licensed": licensed_ratio * 100,
        "commercial_use": commercial_use_ratio * 100,
        "opt_out": 100 if has_opt_out_mechanism else 0,
        "transparency": 100 if data_source_transparency else 0
    }

    # 加权总分 (100 表示完全合规)
    compliance_score = sum(
        weights[k] * scores[k] for k in weights
    )

    # 风险评分 (0 表示无风险, 100 表示高风险)
    risk_score = 100 - compliance_score

    risk_level = (
        "低" if risk_score < 20
        else "中低" if risk_score < 40
        else "中" if risk_score < 60
        else "中高" if risk_score < 80
        else "高"
    )

    return {
        "risk_score": round(risk_score, 1),
        "risk_level": risk_level,
        "breakdown": {k: round(scores[k], 1) for k in scores}
    }

# 示例评估
result = calculate_copyright_risk_score(
    public_domain_ratio=0.3,
    licensed_ratio=0.4,
    unknown_ratio=0.3,
    commercial_use_ratio=0.6,
    has_opt_out_mechanism=True,
    data_source_transparency=True
)
print(f"风险评分: {result['risk_score']} ({result['risk_level']})")`
                }
            ],
            table: {
                headers: ["数据类型", "版权状态", "商业使用风险", "主要来源"],
                rows: [
                    ["政府公开数据", "通常公共领域", "低", "政府网站、开放数据平台"],
                    ["开源代码", "按许可证而定", "低-中", "GitHub、开源项目"],
                    ["维基百科", "CC BY-SA", "中", "Wikipedia 数据库"],
                    ["新闻文章", "专有版权", "高", "新闻机构网站"],
                    ["书籍", "专有版权", "高", "图书扫描、电子书"],
                    ["社交媒体", "用户条款约束", "高", "Twitter、Reddit 等"]
                ]
            },
            mermaid: `graph TD
    A["训练数据收集"] --> B{"版权状态?"}
    B -->|"公共领域"| C["✅ 可使用"]
    B -->|"有许可证"| D{"许可证条款?"}
    D -->|"允许训练"| C
    D -->|"不明确"| E["⚠️ 需要法律评估"]
    B -->|"专有版权"| F{"是否有许可?"}
    F -->|"有"| C
    F -->|"无"| G["❌ 高风险"]
    E --> H["寻求授权或使用替代数据"]
    G --> H
    C --> I["合规数据集"]
    H --> I`,
            tip: "在训练前进行完整的版权审计，记录每个数据源的版权状态。这不仅是法律要求，也是建立可信赖 AI 系统的基础。",
            warning: "即使数据可以公开访问，也不意味着可以自由使用。公开访问≠公共领域，网站上的内容通常仍受版权保护。"
        },
        {
            title: "2. AI 生成内容的版权归属",
            body: `AI 生成内容的版权归属是另一个极具争议的问题。当 AI 生成一幅画、一首诗或一段代码时，谁拥有这个作品的版权？这个问题目前没有全球统一的答案，各国的法律实践差异很大。

美国版权局（USCO）的立场是：只有人类创作的作品才能获得版权保护。2023 年，USCO 明确拒绝了 AI 生成图像的版权申请，理由是作品缺乏"人类作者身份"（human authorship）。但这引发了一个灰色地带——如果人类对 AI 的输入（prompt）非常详细和精确，最终的输出是否能被视为人类的"创意指导"成果？

欧盟的态度相对开放一些。欧盟版权指令承认了"计算机生成作品"的可能性，但要求明确标注 AI 参与的程度。中国法院在 2023 年的一起案件中，认定用户使用 AI 工具创作的图像可以享有版权，前提是人类在创作过程中有充分的创意投入。

对于企业而言，AI 生成内容的版权不确定性带来了实际的商业风险。如果 AI 生成的内容不能获得版权保护，那么任何人都可以自由使用这些内容，这削弱了内容创作者的投资回报。相反，如果 AI 生成的内容被赋予了版权，那么版权应该归属于谁——是 AI 系统的开发者、使用者、还是 AI 本身（尽管后者在法律上目前不被认可）？`,
            code: [
                {
                    lang: "python",
                    code: `# AI 生成内容的人类贡献度评估框架

from dataclasses import dataclass
from typing import List

@dataclass
class HumanContributionFactor:
    """人类贡献度评估因子"""
    name: str
    weight: float       # 权重 (0-1)
    score: float        # 评分 (0-100)
    description: str

def assess_human_contribution(
    prompt_complexity: float,      # 提示词复杂程度 (0-100)
    iteration_count: int,           # 迭代次数
    manual_editing: float,          # 后期编辑程度 (0-100)
    creative_direction: float,      # 创意指导程度 (0-100)
    selection_curation: float,      # 筛选策展程度 (0-100)
) -> dict:
    """
    评估人类在 AI 生成内容中的贡献度

    参考标准:
    - 纯 AI 生成 (< 20): 不太可能获得版权
    - 中等人类贡献 (20-50): 灰色地带
    - 高人类贡献 (> 50): 更可能获得版权
    """
    factors = [
        HumanContributionFactor("提示词复杂度", 0.15, prompt_complexity,
                               "提示词的详细程度和创意性"),
        HumanContributionFactor("迭代次数", 0.10, min(iteration_count * 10, 100),
                               "生成-修改-再生的迭代过程"),
        HumanContributionFactor("后期编辑", 0.30, manual_editing,
                               "生成后的人工修改和完善"),
        HumanContributionFactor("创意指导", 0.25, creative_direction,
                               "整体的创意方向和设计决策"),
        HumanContributionFactor("筛选策展", 0.20, selection_curation,
                               "从多个结果中选择和组合"),
    ]

    weighted_score = sum(f.weight * f.score for f in factors)
    human_contribution = weighted_score

    level = (
        "纯AI生成" if human_contribution < 20
        else "低人类贡献" if human_contribution < 35
        else "中等人类贡献" if human_contribution < 50
        else "高人类贡献" if human_contribution < 70
        else "人类主导创作"
    )

    copyright_likelihood = (
        "极低" if human_contribution < 20
        else "较低" if human_contribution < 35
        else "不确定" if human_contribution < 50
        else "较可能" if human_contribution < 70
        else "很可能"
    )

    return {
        "human_contribution_score": round(human_contribution, 1),
        "contribution_level": level,
        "copyright_likelihood": copyright_likelihood,
        "factors": [
            {"name": f.name, "weight": f.weight, "score": round(f.score, 1)}
            for f in factors
        ]
    }

result = assess_human_contribution(
    prompt_complexity=80,
    iteration_count=15,
    manual_editing=60,
    creative_direction=70,
    selection_curation=80
)
print(f"人类贡献度: {result['human_contribution_score']}%")
print(f"版权可能性: {result['copyright_likelihood']}")`
                },
                {
                    lang: "python",
                    code: `# AI 生成内容的版权标记系统

from datetime import datetime
from dataclasses import dataclass, field
import hashlib
import json

@dataclass
class AIContentAttribution:
    """AI 生成内容的归属标记"""
    content_hash: str
    ai_model: str
    ai_version: str
    prompt: str
    human_edits: list = field(default_factory=list)
    creation_date: str = field(default_factory=lambda: datetime.now().isoformat())
    jurisdiction: str = "unknown"  # 适用的司法管辖区

    def generate_manifest(self) -> str:
        """生成 C2PA 风格的归属清单"""
        manifest = {
            "@context": "https://schema.org/",
            "@type": "CreativeWork",
            "creator": [
                {"@type": "Person", "name": "人类创作者"},
                {"@type": "SoftwareApplication",
                 "name": self.ai_model,
                 "softwareVersion": self.ai_version}
            ],
            "dateCreated": self.creation_date,
            "creativeWorkStatus": f"AI-assisted: {len(self.human_edits)} manual edits",
            "contentHash": self.content_hash
        }
        return json.dumps(manifest, indent=2, ensure_ascii=False)

    @classmethod
    def from_content(cls, content: str, ai_model: str, prompt: str):
        content_hash = hashlib.sha256(content.encode()).hexdigest()
        return cls(
            content_hash=content_hash,
            ai_model=ai_model,
            ai_version="unknown",
            prompt=prompt
        )

# 使用示例
artwork = "..."  # 生成的内容
attribution = AIContentAttribution.from_content(
    content=artwork,
    ai_model="Stable Diffusion 3",
    prompt="a sunset over mountains in oil painting style"
)
attribution.human_edits = ["color correction", "composition adjustment"]
print(attribution.generate_manifest())`
                }
            ],
            table: {
                headers: ["国家/地区", "AI 生成内容版权", "关键案例/政策"],
                rows: [
                    ["美国", "不予保护", "USCO 拒绝 AI 图像版权申请"],
                    ["欧盟", "有条件保护", "AI Act 要求披露 AI 参与"],
                    ["中国", "可能保护", "北京互联网法院支持 AI 辅助创作"],
                    ["英国", "计算机生成作品可保护", "CDPA 1988 第 9(3) 条"],
                    ["日本", "灵活解释", "允许 AI 训练使用受版权保护的数据"],
                    ["韩国", "审查中", "尚未有明确法律立场"]
                ]
            },
            mermaid: `graph TD
    A["AI 生成内容"] --> B{"人类贡献度?"}
    B -->|"低 (<20%)"| C["无版权保护"]
    B -->|"中 (20-50%)"| D["灰色地带"]
    B -->|"高 (>50%)"| E["可能获得版权"]
    C --> F["公共领域"]
    D --> G{"各国法律"}
    E --> H["版权归属人类创作者"]
    G -->|"美国"| C
    G -->|"英国"| I["版权归操作者"]
    G -->|"中国"| E
    G -->|"欧盟"| J["需标注 AI 参与"]`,
            tip: "使用 AI 生成商业内容时，建议保留完整的创作过程记录——包括 prompt、迭代版本、人工编辑记录等，作为版权归属的证据。",
            warning: "即使 AI 生成内容在某个国家获得了版权保护，这并不自动意味着在其他国家也受到保护。跨国使用需要特别注意。"
        },
        {
            title: "3. AI 训练数据的合理使用边界",
            body: `合理使用（Fair Use）是美国版权法中最重要的例外条款，它允许在特定情况下未经许可使用受版权保护的作品。合理使用的判断基于四个因素：使用的目的和性质（是否为转换性使用）、受版权保护作品的性质、使用部分的数量和实质性、以及对原作品市场价值的影响。

AI 训练是否构成合理使用，核心争议在于"转换性使用"的界定。转换性使用是指新作品对原作增加了新的表达、意义或信息，而非简单地替代原作。AI 公司辩称，训练模型是对数据的转换性使用——模型不是复制数据，而是从中学习模式和知识，这与原作的使用目的完全不同。然而，版权持有者反驳说，AI 生成的内容可能直接与原作竞争，特别是在创意领域。

2025 年，美国法院在几起关键案件中做出了重要裁决。在 Authors Guild v. OpenAI 案中，法院初步认定文本数据挖掘用于训练 AI 可能构成合理使用，但需要满足数据使用不产生实质性替代效应的条件。在 Andersen v. Stability AI 案中，法院则认为图像生成模型可能不构成合理使用，因为生成的图像可能与原作存在实质性相似。

在欧盟，2019 年的版权指令第 4 条允许文本和数据挖掘（TDM），但版权持有者可以选择退出（opt-out）。这意味着在欧盟，AI 公司可以使用受版权保护的数据进行训练，除非版权持有者明确声明不允许。日本则采取了最开放的立场——其版权法允许"以任何目的和方式"使用受版权保护的数据进行 AI 训练，只要不侵犯作者的道德权利。`,
            code: [
                {
                    lang: "python",
                    code: `# 合理使用四要素分析框架

from dataclasses import dataclass
from typing import Tuple

@dataclass
class FairUseFactor:
    name: str
    description: str
    score: float  # -1.0 (强反对) 到 +1.0 (强支持)
    weight: float

def analyze_fair_use(
    purpose_and_character: float,  # 转换性程度 (-1 到 +1)
    nature_of_work: float,         # 作品性质 (-1 到 +1)
    amount_used: float,            # 使用数量和实质性 (-1 到 +1)
    market_effect: float           # 对市场的影响 (-1 到 +1)
) -> dict:
    """
    分析 AI 训练是否构成合理使用

    评分规则:
    +1.0: 强烈支持合理使用
    0.0: 中性
    -1.0: 强烈反对合理使用
    """
    factors = [
        FairUseFactor(
            "使用的目的和性质",
            "是否转换性使用，是否商业用途",
            purpose_and_character,
            0.35  # 最重要的因素
        ),
        FairUseFactor(
            "作品的性质",
            "事实性作品 vs 创意性作品",
            nature_of_work,
            0.15
        ),
        FairUseFactor(
            "使用的数量和实质性",
            "使用了多少，是否使用了核心部分",
            amount_used,
            0.25
        ),
        FairUseFactor(
            "对原作品市场的影响",
            "是否替代了原作品",
            market_effect,
            0.25
        ),
    ]

    # 加权总分
    total_score = sum(f.score * f.weight for f in factors)

    # 判断
    if total_score > 0.5:
        verdict = "很可能构成合理使用"
    elif total_score > 0.2:
        verdict = "倾向于合理使用"
    elif total_score > -0.2:
        verdict = "不确定，需个案分析"
    elif total_score > -0.5:
        verdict = "倾向于不构成合理使用"
    else:
        verdict = "很可能不构成合理使用"

    return {
        "total_score": round(total_score, 3),
        "verdict": verdict,
        "factors": [
            {"name": f.name, "score": round(f.score, 2), "weight": f.weight}
            for f in factors
        ]
    }

# 场景: AI 使用受版权保护的新闻文章训练语言模型
result = analyze_fair_use(
    purpose_and_character=0.6,   # 有一定转换性，但有商业目的
    nature_of_work=-0.3,          # 新闻文章有部分创意性
    amount_used=-0.5,             # 使用了大量文章
    market_effect=0.2             # 影响不确定
)
print(f"合理使用的可能性: {result['verdict']}")
print(f"综合评分: {result['total_score']}")`
                },
                {
                    lang: "python",
                    code: `# 各国 TDM（文本和数据挖掘）法律对比

class TDMRegimeAnalyzer:
    """分析各国文本和数据挖掘法律环境"""

    REGIMES = {
        "US": {
            "name": "美国",
            "framework": "合理使用 (Fair Use)",
            "opt_out": False,
            "commercial_allowed": "法院判定中",
            "risk_level": "中",
            "notes": "法院个案判定，尚未有统一标准"
        },
        "EU": {
            "name": "欧盟",
            "framework": "版权指令第3/4条",
            "opt_out": True,
            "commercial_allowed": "可(除非opt-out)",
            "risk_level": "中低",
            "notes": "版权持有者可 opt-out"
        },
        "JP": {
            "name": "日本",
            "framework": "版权法第30-4条",
            "opt_out": False,
            "commercial_allowed": "是",
            "risk_level": "低",
            "notes": "最开放，只要不侵犯道德权利"
        },
        "UK": {
            "name": "英国",
            "framework": "CDPA 第29A条",
            "opt_out": False,
            "commercial_allowed": "有限",
            "risk_level": "中",
            "notes": "非商业研究允许，商业用途待定"
        },
        "CN": {
            "name": "中国",
            "framework": "生成式 AI 管理办法",
            "opt_out": False,
            "commercial_allowed": "有条件",
            "risk_level": "中",
            "notes": "要求数据来源合法"
        }
    }

    def compare(self, countries: list[str]) -> str:
        """对比指定国家的法律环境"""
        lines = ["TDM 法律环境对比:", ""]
        for country_code in countries:
            regime = self.REGIMES.get(country_code, {})
            lines.append(f"--- {regime.get('name', country_code)} ---")
            for key in ['framework', 'opt_out', 'commercial_allowed',
                        'risk_level', 'notes']:
                lines.append(f"  {key}: {regime.get(key, 'N/A')}")
            lines.append("")
        return "\\n".join(lines)

analyzer = TDMRegimeAnalyzer()
print(analyzer.compare(["US", "EU", "JP", "CN"]))`
                }
            ],
            table: {
                headers: ["法律要素", "支持 AI 训练", "反对 AI 训练", "平衡点"],
                rows: [
                    ["转换性使用", "学习模式≠复制内容", "生成内容可能替代原作", "取决于生成内容的相似性"],
                    ["使用范围", "学习需要大量数据", "使用了全部作品", "是否可使用摘要或片段"],
                    ["商业目的", "技术创新惠及全社会", "AI 公司从中盈利", "是否有利益分享机制"],
                    ["市场影响", "AI 创作新市场", "AI 替代人类创作者", "市场影响是否可量化"],
                    ["选择退出", "opt-out 机制灵活", "opt-out 成本高", "opt-in 更安全但成本极高"]
                ]
            },
            mermaid: `graph TD
    A["使用受版权保护的数据"] --> B{"是否转换性使用?"}
    B -->|"是"| C["倾向于合理使用"]
    B -->|"否"| D["倾向于侵权"]
    C --> E{"是否影响原作品市场?"}
    E -->|"否"| F["✅ 很可能合理使用"]
    E -->|"是"| G["⚠️ 需要进一步分析"]
    D --> H{"是否有许可?"}
    H -->|"有"| F
    H -->|"无"| I["❌ 侵权风险高"]
    G --> J["个案分析四要素"]
    J --> F
    J --> I`,
            tip: "在数据收集阶段就建立完善的版权管理体系，比事后应对法律纠纷的成本低得多。",
            warning: "合理使用是普通法系的概念，大陆法系国家（如德国、法国）的版权例外条款更为严格，不能简单套用合理使用的逻辑。"
        },
        {
            title: "4. AI 生成内容的商标与专利保护",
            body: `除了版权，AI 生成内容还涉及商标和专利等其他知识产权领域的问题。这些领域的法律实践与版权有所不同，因为商标和专利的保护逻辑更加功能性和目的导向。

在商标领域，AI 生成的标志、名称或设计是否可以注册为商标，关键在于其是否具有"显著性"（distinctiveness）——即能否区分商品或服务的来源。美国专利商标局（USPTO）在 2024 年发布的指南中指出，商标审查关注的是标志本身是否具备显著性，而不关注其创作方式。这意味着 AI 生成的标志只要满足显著性要求，就可以注册为商标。然而，如果 AI 生成的标志与已有商标过于相似，仍然可能被拒绝注册或在后续被撤销。

在专利领域，问题更加复杂。专利要求发明人必须是"个人"（individual），这意味着 AI 系统本身不能被列为发明人。2021 年，Stephen Thaler 尝试将其 AI 系统 DABUS 列为两项专利的发明人，但被美国、欧洲、英国和澳大利亚的专利局一致拒绝。然而，人类使用 AI 辅助发明是否可以获得专利保护，答案是肯定的——只要人类对发明有实质性贡献。

这些法律实践反映了一个共同趋势：AI 本身不能成为知识产权的主体，但人类利用 AI 创造的成果可以在满足一定条件的情况下获得保护。这种平衡既鼓励了 AI 技术的创新应用，又维护了知识产权制度的人类中心性。`,
            code: [
                {
                    lang: "python",
                    code: `# AI 生成内容的商标相似度检查

import numpy as np
from typing import List, Tuple

class TrademarkSimilarityChecker:
    """
    检查 AI 生成的标志/名称是否与已有商标过于相似
    使用多维度相似度评估
    """

    def __init__(self, trademark_db: List[dict]):
        """
        trademark_db: [{"name": str, "class": int, "image_hash": str, ...}]
        """
        self.db = trademark_db

    def check_text_similarity(
        self,
        candidate: str,
        threshold: float = 0.8
    ) -> List[Tuple[str, float]]:
        """
        检查文本相似度
        返回: [(商标名称, 相似度), ...]
        """
        results = []
        for tm in self.db:
            sim = self._levenshtein_similarity(
                candidate.lower(), tm["name"].lower()
            )
            if sim >= threshold:
                results.append((tm["name"], sim))
        return sorted(results, key=lambda x: x[1], reverse=True)

    @staticmethod
    def _levenshtein_similarity(s1: str, s2: str) -> float:
        """计算两个字符串的编辑距离相似度"""
        if len(s1) == 0 and len(s2) == 0:
            return 1.0
        max_len = max(len(s1), len(s2))
        distance = TrademarkSimilarityChecker._edit_distance(s1, s2)
        return 1.0 - distance / max_len

    @staticmethod
    def _edit_distance(s1: str, s2: str) -> int:
        """计算编辑距离"""
        m, n = len(s1), len(s2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                cost = 0 if s1[i-1] == s2[j-1] else 1
                dp[i][j] = min(
                    dp[i-1][j] + 1,
                    dp[i][j-1] + 1,
                    dp[i-1][j-1] + cost
                )
        return dp[m][n]

# 使用示例
checker = TrademarkSimilarityChecker(trademark_database)
similar = checker.check_text_similarity("ChatGPT-5")
for name, score in similar:
    print(f"  与 '{name}' 相似度: {score:.2%}")`
                },
                {
                    lang: "python",
                    code: `# AI 辅助发明的专利资格评估

from dataclasses import dataclass
from typing import List

@dataclass
class PatentClaim:
    description: str
    human_contribution: float  # 0-1, 人类贡献比例
    ai_contribution: float     # 0-1, AI 贡献比例
    novelty_score: float       # 0-100, 新颖性评分
    inventive_step: float      # 0-100, 创造性评分

def assess_patent_eligibility(claims: List[PatentClaim]) -> dict:
    """
    评估 AI 辅助发明的专利资格

    关键原则:
    1. 发明人必须是人类
    2. 人类必须有实质性贡献
    3. 满足新颖性和创造性要求
    """
    total_human = sum(c.human_contribution for c in claims)
    avg_human = total_human / len(claims) if claims else 0

    avg_novelty = sum(c.novelty_score for c in claims) / len(claims)
    avg_inventive = sum(c.inventive_step for c in claims) / len(claims)

    # 人类贡献门槛
    human_threshold_met = avg_human >= 0.3
    novelty_threshold_met = avg_novelty >= 70
    inventive_threshold_met = avg_inventive >= 60

    overall_eligible = (
        human_threshold_met
        and novelty_threshold_met
        and inventive_threshold_met
    )

    return {
        "eligible": overall_eligible,
        "human_contribution_avg": round(avg_human, 2),
        "human_threshold_met": human_threshold_met,
        "novelty_avg": round(avg_novelty, 1),
        "novelty_met": novelty_threshold_met,
        "inventive_avg": round(avg_inventive, 1),
        "inventive_met": inventive_threshold_met,
        "recommendation": (
            "满足专利资格，可以提交申请" if overall_eligible
            else "需要增加人类贡献或提高创新性"
        )
    }

# 示例评估
claims = [
    PatentClaim("使用 AI 优化的药物分子设计", 0.6, 0.4, 85, 75),
    PatentClaim("AI 辅助的电路布局优化", 0.4, 0.6, 70, 65),
    PatentClaim("AI 生成的数据处理算法", 0.2, 0.8, 60, 50),
]
result = assess_patent_eligibility(claims)
print(f"专利资格: {'✅ 通过' if result['eligible'] else '❌ 不通过'}")
print(f"建议: {result['recommendation']}")`
                }
            ],
            table: {
                headers: ["知识产权类型", "AI 能否作为主体", "人类使用 AI 能否获得保护", "关键要求"],
                rows: [
                    ["版权", "否", "是（有人类贡献时）", "人类作者身份、原创性"],
                    ["商标", "否", "是", "显著性、不混淆"],
                    ["专利", "否", "是（有实质性贡献）", "新颖性、创造性、实用性"],
                    ["商业秘密", "不适用", "是", "保密措施、经济价值"],
                    ["工业设计", "否", "是", "新颖性、原创性"]
                ]
            },
            mermaid: `graph TD
    A["AI 辅助创新"] --> B{"谁是发明人?"}
    B -->|"纯 AI"| C["❌ 不能作为发明人"]
    B -->|"人类+AI"| D{"人类有实质性贡献?"}
    D -->|"是"| E["✅ 可以申请专利"]
    D -->|"否"| C
    E --> F["满足三性要求"]
    F --> G{"新颖性"}
    G -->|"是"| H{"创造性"}
    H -->|"是"| I{"实用性"}
    I -->|"是"| J["✅ 获得专利"]
    I -->|"否"| K["❌ 不满足"]
    H -->|"否"| K
    G -->|"否"| K`,
            tip: "在使用 AI 辅助发明时，详细记录人类的创意贡献和决策过程，这对于专利申请至关重要。",
            warning: "AI 生成的发明可能涉及'现有技术'问题——如果 AI 使用的训练数据包含了相关技术，可能导致新颖性被质疑。"
        },
        {
            title: "5. 构建合规的 AI 数据治理体系",
            body: `面对复杂的法律和伦理环境，AI 组织需要建立系统化的数据治理体系，确保从数据收集到模型部署的全流程合规。这不仅是为了避免法律风险，更是建立用户信任和行业声誉的基础。

一个完整的 AI 数据治理体系包含五个核心层次。数据溯源层要求记录每一条训练数据的来源、版权状态、使用许可和获取时间。数据质量控制层确保训练数据的准确性、代表性和无偏差。合规审计层定期审查数据处理流程是否符合法律法规要求。风险管理层识别和评估潜在的版权、隐私和安全风险，并制定应对策略。透明度层向用户和监管机构公开 AI 系统的数据使用情况。

在实践中，许多组织采用"数据卡片"（Data Cards）和"模型卡片"（Model Cards）等标准化工具来记录和管理数据治理信息。Google 的 Data Cards 模板涵盖了数据来源、预处理方法、已知限制和伦理考量等维度。Hugging Face 的 Model Cards 则提供了模型架构、训练数据、性能指标和使用限制的结构化描述。

建立有效的数据治理体系需要跨部门协作——法务团队负责法律合规审查，技术团队负责实施数据管理工具，产品团队负责确保透明度，管理层负责提供资源支持。这不仅仅是一个技术问题，而是一个组织文化和治理框架的问题。`,
            code: [
                {
                    lang: "python",
                    code: `# AI 数据治理框架核心组件

from dataclasses import dataclass, field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum

class DataCategory(Enum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    CODE = "code"
    MULTIMODAL = "multimodal"

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class DataSource:
    """数据源注册信息"""
    name: str
    url: str
    category: DataCategory
    license_type: str
    copyright_status: str
    opt_out_available: bool
    collection_date: str
    volume_records: int
    risk_level: RiskLevel
    notes: str = ""

@dataclass
class DataGovernanceRegistry:
    """数据治理注册中心"""
    data_sources: List[DataSource] = field(default_factory=list)
    last_audit_date: Optional[str] = None
    compliance_officer: str = ""

    def register_source(self, source: DataSource):
        """注册新的数据源"""
        self.data_sources.append(source)

    def audit(self) -> dict:
        """执行数据治理审计"""
        total = len(self.data_sources)
        by_risk = {level.value: 0 for level in RiskLevel}
        by_category = {cat.value: 0 for cat in DataCategory}
        opt_out_count = 0

        for source in self.data_sources:
            by_risk[source.risk_level.value] += 1
            by_category[source.category.value] += 1
            if source.opt_out_available:
                opt_out_count += 1

        critical_sources = [
            s for s in self.data_sources
            if s.risk_level == RiskLevel.CRITICAL
        ]

        return {
            "total_sources": total,
            "by_risk_level": by_risk,
            "by_category": by_category,
            "opt_out_available": opt_out_count,
            "critical_items": len(critical_sources),
            "critical_sources": [s.name for s in critical_sources],
            "last_audit": self.last_audit_date
        }

# 使用示例
registry = DataGovernanceRegistry(compliance_officer="法务团队")
registry.register_source(DataSource(
    name="Common Crawl",
    url="https://commoncrawl.org",
    category=DataCategory.TEXT,
    license_type="Various",
    copyright_status="Mixed",
    opt_out_available=True,
    collection_date="2026-01-15",
    volume_records=10_000_000,
    risk_level=RiskLevel.MEDIUM
))
audit = registry.audit()
print(f"数据源总数: {audit['total_sources']}")
print(f"高风险: {audit['by_risk_level']['high']}")`
                },
                {
                    lang: "python",
                    code: `# 模型卡片自动生成器

def generate_model_card(
    model_name: str,
    model_type: str,
    training_data_summary: dict,
    performance_metrics: dict,
    limitations: List[str],
    ethical_considerations: List[str],
    intended_use: str,
    out_of_scope: List[str],
) -> str:
    """
    生成标准化的模型卡片
    参考: https://huggingface.co/docs/hub/model-cards
    """
    card = f"""# {model_name}

## 模型详情
- **类型**: {model_type}
- **生成日期**: {datetime.now().strftime("%Y-%m-%d")}

## 训练数据
- **数据来源**: {training_data_summary.get('sources', '未披露')}
- **数据规模**: {training_data_summary.get('volume', '未披露')}
- **数据处理**: {training_data_summary.get('preprocessing', '未披露')}
- **版权合规**: {training_data_summary.get('copyright', '未评估')}

## 性能指标
"""
    for metric, value in performance_metrics.items():
        card += f"- **{metric}**: {value}\\n"

    card += f"""
## 预期用途
{intended_use}

## 超出范围的使用
"""
    for item in out_of_scope:
        card += f"- {item}\\n"

    card += f"""
## 局限性
"""
    for item in limitations:
        card += f"- {item}\\n"

    card += f"""
## 伦理考量
"""
    for item in ethical_considerations:
        card += f"- {item}\\n"

    return card

# 使用示例
card = generate_model_card(
    model_name="AI-Master-LLM-v2",
    model_type="Decoder-only Transformer (7B)",
    training_data_summary={
        "sources": "Common Crawl, Wikipedia, 开源书籍",
        "volume": "2.5T tokens",
        "preprocessing": "去重、过滤、质量评分",
        "copyright": "已进行版权审计，风险率 < 5%"
    },
    performance_metrics={
        "MMLU": "68.5%",
        "HumanEval": "52.3%",
        "BLEU (WMT14 EN-DE)": "28.1"
    },
    limitations=[
        "知识截止于 2025 年 12 月",
        "可能在数学推理上存在幻觉",
        "对低资源语言支持有限"
    ],
    ethical_considerations=[
        "训练数据可能包含社会偏见",
        "可能生成有害内容，已添加安全过滤",
        "不应替代专业法律或医疗建议"
    ],
    intended_use="研究、教育、辅助创作",
    out_of_scope=[
        "自动化决策系统",
        "高风险领域（医疗诊断、法律判决）",
        "生成虚假信息"
    ]
)
print(card)`
                }
            ],
            table: {
                headers: ["治理组件", "核心功能", "实施难度", "ROI"],
                rows: [
                    ["数据溯源", "记录数据来源和版权状态", "中", "高（法律合规）"],
                    ["风险评估", "识别和量化版权/隐私风险", "中高", "高（风险预防）"],
                    ["合规审计", "定期检查流程合规性", "中", "中（持续改进）"],
                    ["模型卡片", "标准化透明度文档", "低", "中（用户信任）"],
                    ["应急响应", "版权投诉和漏洞处理", "高", "高（声誉保护）"]
                ]
            },
            mermaid: `graph TD
    A["数据收集"] --> B["版权登记"]
    B --> C["风险评估"]
    C --> D["合规审查"]
    D --> E["训练使用"]
    E --> F["模型评估"]
    F --> G["模型卡片"]
    G --> H["公开发布"]
    H --> I["持续监控"]
    I --> J["审计和改进"]
    J --> A
    C -.->|"高风险"| K["清理或获取授权"]
    K --> D`,
            tip: "数据治理不是一次性任务，而是持续的过程。建议每季度进行一次全面审计，每月进行增量更新检查。",
            warning: "忽视数据治理可能在短期内节省成本，但一旦发生法律纠纷，代价可能远超建立治理体系的投入。"
        }
    ],
};
