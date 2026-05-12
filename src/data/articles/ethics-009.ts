// AI 监管与法律合规全景：从诉讼判例到开发者合规指南

import { Article } from '../knowledge';

export const article: Article = {
  id: "ethics-009",
  title: "AI 监管与法律合规全景：从诉讼判例到开发者合规指南",
  category: "ethics",
  tags: ["AI 监管", "法律合规", "EU AI Act", "NAACP", "xAI", "版权诉讼", "合规自动化", "算法备案", "AI 安全法", "数据保护"],
  summary: "2026 年，AI 监管从理论走向实践：EU AI Act 正式生效，NAACP 起诉 xAI 阻止 Colossus 2 数据中心建设，Getty Images 诉 Stability AI 案达成和解。本文系统梳理全球 AI 监管格局、重大法律判例、开发者合规清单和合规自动化工具，帮助 AI 从业者在创新与合规之间找到平衡。",
  date: "2026-04-19",
  readTime: "30 min",
  level: "高级",
  content: [
    {
      title: "为什么 2026 年是 AI 监管的转折年",
      body: `2026 年 4 月，AI 监管领域同时发生多起标志性事件，标志着 AI 从「野蛮生长」进入「强监管时代」。

**事件一**：NAACP 起诉 xAI 阻止 Colossus 2 数据中心

2026 年 4 月 15 日，美国全国有色人种协进会（NAACP）对 **xAI** 提起联邦诉讼，指控 Colossus 2 项目在未取得空气许可的情况下运行 27 台燃气轮机，违反《清洁空气法》，对黑人社区造成污染。

这起诉讼的意义远超单一案件：
- 首次将 AI 基础设施的环境影响纳入法律监管
- 以民权框架挑战科技公司的环境决策
- 可能为 AI 数据中心环保监管树立全国性先例
- 揭示了「AI 碳足迹」这一被长期忽视的监管盲区

**事件二**：EU AI Act 正式生效执行

欧盟人工智能法案（**EU AI Act**）于 2026 年开始分阶段执行，高风险 AI 系统面临严格合规要求，违者最高可处全球营业额 7% 的罚款。

**事件三**：Getty Images 诉 Stability AI 达成和解

这场持续两年的标志性版权诉讼以和解告终，确立了 AI 训练数据版权纠纷的处理范式。

这三件事共同指向一个趋势：AI 不再享有「技术例外主义」的豁免权，法律监管正在全面覆盖 AI 的全生命周期。`,
      mermaid: `graph TD
    A["AI 监管三大支柱"] --> B["环境监管"]
    A --> C["产品监管"]
    A --> D["知识产权监管"]

    B --> B1["NAACP v xAI
数据中心排放"]
    B --> B2["AI 碳足迹披露"]
    B --> B3["能源使用许可"]

    C --> C1["EU AI Act
风险分级监管"]
    C --> C2["NIST AI RMF
风险管理框架"]
    C --> C3["中国算法备案
生成式 AI 管理"]

    D --> D1["Getty v Stability
训练数据版权"]
    D --> D2["AI 生成内容
权利归属"]
    D --> D3["深度伪造
肖像权保护"]

    classDef env fill:#15803d,stroke:\#16a34a,color:#fff
    classDef product fill:#1d4ed8,stroke:\#2563eb,color:#fff
    classDef ip fill:#b45309,stroke:\#d97706,color:#fff
    class B,B1,B2,B3 env
    class C,C1,C2,C3 product
    class D,D1,D2,D3 ip`,
    },
    {
      title: "全球 AI 监管格局全景",
      body: `全球主要经济体正在形成三种不同的 AI 监管模式，每种模式反映了不同的监管哲学和法律传统。

**1. 欧盟**：风险分级强制监管（Risk-Based Approach）

**EU AI Act** 是全球首部综合性 AI 法律，采用风险分级框架：

| 风险等级 | 定义 | 合规要求 | 违规罚款 |
|---------|------|---------|---------|
| 不可接受风险 | 社会评分、实时远程生物识别等 | 禁止使用 | - |
| 高风险 | 医疗、教育、就业、执法等关键领域 | 数据治理、技术文档、人工监督、准确性保证 | 最高 3500 万欧元或全球营业额 7% |
| 有限风险 | 聊天机器人、深度伪造等 | 透明度义务（告知用户正在与 AI 交互） | 最高 1500 万欧元或 3% |
| 最小风险 | 垃圾邮件过滤器、视频游戏等 | 无强制要求（鼓励自愿行为准则） | - |

**2. 美国**：行业自律 + 事后追责

美国采取分散式监管路径：
**- 行政命令**：拜登政府 2023 年发布 AI 安全行政命令，要求大型 AI 模型开发者向政府报告安全测试结果
**- 行业自律**：NIST AI RMF 提供自愿性风险管理框架
**- 事后追责**：通过现有法律（民权法、消费者保护法、环境法）追究 AI 造成的损害
**- 州级立法**：各州自行制定 AI 法规（如加州、科罗拉多州）

**3. 中国**：算法备案 + 分类管理

中国建立了全球最系统的 AI 监管框架：
- 《生成式人工智能服务管理暂行办法》（2023）：要求生成式 AI 服务提供者进行算法备案
- 《互联网信息服务算法推荐管理规定》：要求算法推荐服务提供者公示算法原理
- 《深度合成管理规定》：要求深度合成内容进行显著标识
- 《人工智能法（草案）》：正在推进的综合性立法

三种模式的核心差异：

| 维度 | 欧盟 | 美国 | 中国 |
|------|------|------|------|
| 监管哲学 | 预防性监管（事前） | 市场驱动 + 事后追责 | 分类管理 + 备案制 |
| 执法力度 | 高额罚款 + 市场禁入 | 诉讼驱动 + 行业自律 | 行政处罚 + 平台责任 |
| 合规成本 | 高（需要完整合规体系） | 中等（取决于行业） | 中等（备案流程标准化） |
| 创新影响 | 可能抑制高风险创新 | 相对宽松 | 引导式创新 |
| 全球影响 | 事实上的全球标准（Brussels Effect） | 技术领先但监管滞后 | 区域影响为主 |`,
      table: {
        headers: ["维度", "欧盟", "美国", "中国"],
        rows: [
          ["监管哲学", "预防性监管（事前）", "市场驱动 + 事后追责", "分类管理 + 备案制"],
          ["执法力度", "高额罚款 + 市场禁入", "诉讼驱动 + 行业自律", "行政处罚 + 平台责任"],
          ["合规成本", "高（完整合规体系）", "中等（取决于行业）", "中等（标准化备案）"],
          ["创新影响", "可能抑制高风险创新", "相对宽松", "引导式创新"],
          ["全球影响", "Brussels Effect", "技术领先监管滞后", "区域影响为主"],
        ],
      },
    },
    {
      title: "重大 AI 法律判例解析",
      body: `AI 领域的法律判例正在快速积累，每个案件都在塑造未来 AI 发展的法律边界。以下是 2024-2026 年间最具影响力的案件。

**案件一**：NAACP v xAI（2026）

**- 原告**：美国全国有色人种协进会（NAACP）
**- 被告**：xAI（马斯克创立的 AI 公司）
**- 争议焦点**：Colossus 2 数据中心在未取得空气许可的情况下运行 27 台燃气轮机，向黑人社区排放污染物
**- 法律依据**：《清洁空气法》（Clean Air Act）、《民权法》第六条（禁止联邦资助项目中的种族歧视）
**- 诉求**：停止数据中心运营，赔偿社区损失
**- 潜在影响**：首次将 AI 基础设施的环境影响与民权联系起来，可能开创「环境正义」诉讼的新范式

**案件二**：Getty Images v Stability AI（2023-2026）

**- 原告**：Getty Images（全球最大图片库之一）
**- 被告**：Stability AI（Stable Diffusion 开发者）
**- 争议焦点**：Stability AI 是否有权使用 Getty 的 1200 万张图片训练 Stable Diffusion
**- 审理过程**：
  - 2023 年：Getty 在英国和美国同时提起诉讼
  - 2024 年：法院驳回 Stability AI 的「合理使用」抗辩
  - 2025 年：双方进入和解谈判
  - 2026 年：达成和解，Stability AI 支付许可费并获得有限使用权
**- 法律意义**：确立了「大规模商业性使用版权作品训练 AI 模型不构成合理使用」的判例

**案件三**：New York Times v OpenAI & Microsoft（2023-）

**- 原告**：纽约时报
**- 被告**：OpenAI、Microsoft
**- 争议焦点**：ChatGPT 是否未经授权使用了 NYT 的文章进行训练，并在输出中再现 NYT 内容
**- 关键证据**：NYT 展示了 ChatGPT 能够逐字复现其文章的案例
**- 审理状态**：仍在进行中，预计 2026-2027 年出判决
**- 潜在影响**：可能重新定义「合理使用」在 AI 训练场景中的适用范围

**案件四**：Sarah Silverman & Authors v OpenAI（2023-）

**- 原告**：作家 Sarah Silverman 等
**- 被告**：OpenAI
**- 争议焦点**：ChatGPT 能否复现受版权保护的书籍内容
**- 关键问题**：AI 模型的「记忆」是否构成版权侵权
**- 审理状态**：部分诉求被驳回，部分进入证据开示阶段

**判例趋势总结**：

\`mermaid
timeline
    title AI 版权诉讼时间线
    2023 Q1 : Getty v Stability AI\nNYT v **OpenAI**
    2023 Q3 : Silverman v **OpenAI**
    2024 Q1 : 法院驳回\nStability AI 合理使用抗辩
    2024 Q4 : 多起案件\n进入证据开示
    2025 Q2 : Getty v Stability\n和解谈判
    2026 Q1 : Getty 和解落地\nNAACP v **xAI** 立案
    2026 Q2 : NYT v **OpenAI**\n预计判决`,
    },
    {
      title: "开发者合规清单：你必须知道的 10 件事",
      body: `作为 AI 开发者，无论你是独立开发者还是企业团队成员，以下合规事项直接关系到你的项目能否合法上线运营。

1. 训练数据版权合规

如果你使用第三方数据训练 AI 模型：
- ✅ 使用公开数据集前确认其许可证（CC-BY、MIT、Apache 等）
- ✅ 商业数据需获得明确授权或许可
- ❌ 不要假设「公开可访问 = 可用于训练」
- ❌ 不要 scrape 网站内容用于商业模型训练（除非 robots.txt 允许且符合 ToS）

2. 输出内容合规

AI 生成内容可能涉及的法律风险：
**- 版权侵权**：模型输出可能与训练数据中的受保护内容过于相似
**- 诽谤**：AI 生成虚假事实陈述
**- 隐私侵犯**：输出包含个人可识别信息（PII）
**- 歧视**：输出包含偏见或歧视性内容

3. 透明度义务

越来越多司法管辖区要求：
- 明确告知用户正在与 AI 交互
- 标识 AI 生成的内容
- 披露模型的基本工作原理
- 提供人工申诉渠道

4. 数据保护合规

如果你的 AI 系统处理个人数据：
- **GDPR**（欧盟）：需要法律依据、数据最小化、用户权利保障
- CCPA/CPRA（加州）：用户有权要求删除数据、拒绝出售
- PIPL（中国）：个人信息处理需获得同意，敏感信息需单独同意

5. AI 安全测试

部署前必须进行：
- 红队测试（Red Teaming）
- 偏见和公平性评估
- 对抗攻击测试
- 提示注入防护测试

6. 文档记录

**EU AI Act** 要求高风险 AI 系统保留：
- 技术文档（系统设计、训练方法、性能指标）
- 风险评估报告
- 测试和验证记录
- 事件日志

7. 人工监督机制

高风险 AI 必须有人工监督：
- 人工可以覆盖 AI 决策
- 人工理解 AI 的工作原理和局限性
- 人工可以暂停或终止 AI 系统运行

8. 持续监控

**部署后需要**：
- 监控模型性能衰减
- 收集用户反馈和投诉
- 定期重新评估风险
- 及时报告严重事件

9. 供应链合规

如果你使用第三方 AI 服务：
- 了解供应商的合规状态
- 审查服务条款中的责任分配
- 确保数据处理协议符合适用法律
- 评估供应商的数据安全措施

10. 跨境数据传输

如果你的服务面向全球用户：
- 欧盟数据不能随意传输到非欧盟国家
- 需要使用标准合同条款（SCC）或获得充分性认定
- 中国数据出境需要安全评估
- 注意各国数据本地化要求`,
      code: [
        {
          lang: "python",
          filename: "ai_compliance_checker.py",
          code: `"""
AI 合规自动化检查器
帮助开发者在部署前自动检测常见合规风险
"""
import re
import hashlib
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from enum import Enum

class ComplianceRisk(Enum):
    HIGH = "高风险"
    MEDIUM = "中风险"
    LOW = "低风险"
    INFO = "信息提示"

@dataclass
class ComplianceIssue:
    """合规问题记录"""
    category: str          # 问题类别
    risk_level: ComplianceRisk
    description: str       # 问题描述
    regulation: str        # 相关法规
    recommendation: str    # 修复建议

class AIComplianceChecker:
    """AI 系统合规检查器"""

    def __init__(self, jurisdiction: str = "EU"):
        """
        Args:
            jurisdiction: 目标司法管辖区 (EU/US/CN)
        """
        self.jurisdiction = jurisdiction
        self.issues: List[ComplianceIssue] = []

    def check_training_data(self, data_sources: List[Dict]) -> List[ComplianceIssue]:
        """检查训练数据合规性"""
        issues = []
        for source in data_sources:
            # 检查数据来源许可
            if not source.get("license"):
                issues.append(ComplianceIssue(
                    category="训练数据",
                    risk_level=ComplianceRisk.HIGH,
                    description=f"数据源 '{source.get('name', 'unknown')}' 未声明许可证",
                    regulation="EU AI Act Art. 10 / 中国生成式 AI 暂行办法第 7 条",
                    recommendation="获取数据源的明确许可证或使用已授权数据集"
                ))

            # 检查是否包含个人数据
            if source.get("contains_pii", False):
                issues.append(ComplianceIssue(
                    category="数据隐私",
                    risk_level=ComplianceRisk.HIGH,
                    description=f"数据源 '{source.get('name')}' 包含个人可识别信息",
                    regulation="GDPR Art. 9 / PIPL 第 28 条",
                    recommendation="对 PII 进行脱敏处理或获取用户明确同意"
                ))

            # 检查数据偏差
            if source.get("bias_score", 0) > 0.7:
                issues.append(ComplianceIssue(
                    category="数据偏差",
                    risk_level=ComplianceRisk.MEDIUM,
                    description=f"数据源 '{source.get('name')}' 存在显著偏差 (score={source.get('bias_score')})",
                    regulation="EU AI Act Art. 10(2) / NIST AI RMF",
                    recommendation="重新采样或使用偏差纠正技术"
                ))

        self.issues.extend(issues)
        return issues

    def check_model_output(self, sample_outputs: List[str]) -> List[ComplianceIssue]:
        """检查模型输出合规性"""
        issues = []
        for output in sample_outputs:
            # 检查是否包含 PII
            pii_patterns = [
                (r'\\b\\d{3}-\\d{2}-\\d{4}\\b', "社会保险号"),
                (r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b', "邮箱地址"),
                (r'\\b\\d{16}\\b', "信用卡号"),
            ]
            for pattern, pii_type in pii_patterns:
                if re.search(pattern, output):
                    issues.append(ComplianceIssue(
                        category="隐私泄露",
                        risk_level=ComplianceRisk.HIGH,
                        description=f"模型输出包含 {pii_type}",
                        regulation="GDPR Art. 32 / PIPL 第 51 条",
                        recommendation="添加输出过滤器，移除 PII"
                    ))

            # 检查毒性内容
            toxicity_score = self._calculate_toxicity(output)
            if toxicity_score > 0.8:
                issues.append(ComplianceIssue(
                    category="内容安全",
                    risk_level=ComplianceRisk.HIGH,
                    description=f"模型输出毒性评分过高 ({toxicity_score:.2f})",
                    regulation="EU AI Act Annex III / 中国深度合成管理规定",
                    recommendation="优化安全过滤层或调整模型对齐"
                ))

        self.issues.extend(issues)
        return issues

    def check_transparency(self, system_info: Dict) -> List[ComplianceIssue]:
        """检查透明度合规"""
        issues = []

        if not system_info.get("ai_disclosure"):
            issues.append(ComplianceIssue(
                category="透明度",
                risk_level=ComplianceRisk.MEDIUM,
                description="未明确告知用户正在与 AI 交互",
                regulation="EU AI Act Art. 52 / FTC AI 指南",
                recommendation="在用户界面添加 AI 交互提示"
            ))

        if not system_info.get("content_watermark"):
            issues.append(ComplianceIssue(
                category="内容标识",
                risk_level=ComplianceRisk.MEDIUM,
                description="AI 生成内容未添加水印或标识",
                regulation="EU AI Act Art. 50 / 中国深度合成管理规定第 16 条",
                recommendation="为 AI 生成内容添加不可见水印"
            ))

        self.issues.extend(issues)
        return issues

    def _calculate_toxicity(self, text: str) -> float:
        """简化的毒性评分计算（实际应使用专业模型）"""
        toxic_keywords = ["hate", "violence", "discrimination", "abuse"]
        score = sum(1 for kw in toxic_keywords if kw.lower() in text.lower())
        return min(score / len(toxic_keywords), 1.0)

    def generate_report(self) -> str:
        """生成合规报告"""
        if not self.issues:
            return "✅ 未发现合规问题"

        report = "📋 AI 合规检查报告\\n"
        report += "=" * 50 + "\\n\\n"

        # 按风险等级分组
        for risk in ComplianceRisk:
            risk_issues = [i for i in self.issues if i.risk_level == risk]
            if risk_issues:
                report += f"【{risk.value}】({len(risk_issues)} 项)\\n"
                for i, issue in enumerate(risk_issues, 1):
                    report += f"  {i}. {issue.category}: {issue.description}\\n"
                    report += f"     📜 依据: {issue.regulation}\\n"
                    report += f"     💡 建议: {issue.recommendation}\\n\\n"

        # 风险评分
        risk_score = sum(
            10 if i.risk_level == ComplianceRisk.HIGH else
            5 if i.risk_level == ComplianceRisk.MEDIUM else
            1
            for i in self.issues
        )
        status = "❌ 不合规" if risk_score > 20 else "⚠️ 部分合规" if risk_score > 5 else "✅ 基本合规"
        report += f"\\n总体评估: {status} (风险评分: {risk_score}/100)"

        return report

# ===== 使用示例 =====
if __name__ == "__main__":
    checker = AIComplianceChecker(jurisdiction="EU")

    # 检查训练数据
    training_data = [
        {
            "name": "Common Crawl 子集",
            "license": None,
            "contains_pii": True,
            "bias_score": 0.65,
        },
        {
            "name": "维基百科",
            "license": "CC-BY-SA 4.0",
            "contains_pii": False,
            "bias_score": 0.3,
        },
    ]
    checker.check_training_data(training_data)

    # 检查模型输出
    sample_outputs = [
        "用户的邮箱是 test@example.com",
        "我认为这个群体不应该...",
    ]
    checker.check_model_output(sample_outputs)

    # 检查透明度
    system_info = {
        "ai_disclosure": False,
        "content_watermark": False,
    }
    checker.check_transparency(system_info)

    # 生成报告
    print(checker.generate_report())`,
        },
      ],
    },
    {
      title: "AI 合规自动化工具推荐",
      body: `随着 AI 监管趋严，合规自动化成为开发者的刚需。以下是目前市场上值得关注的 AI 合规工具。

合规扫描与测试工具

| 工具 | 类型 | 核心功能 | 适用场景 |
|------|------|---------|---------|
| Garak | 开源 | LLM 漏洞扫描、提示注入检测 | 模型部署前安全测试 |
| PyRIT (**Microsoft**) | 开源 | 红队测试自动化、多轮攻击模拟 | 企业级 AI 安全评估 |
| Lakera Guard | 商业 | 实时输入/输出过滤、PII 检测 | 生产环境内容安全 |
| Mindgard | 商业 | AI 安全态势管理、持续监控 | 企业 AI 安全运营 |
| Patronus AI | 商业 | AI 模型评估、幻觉检测 | 模型质量与安全性评估 |

数据合规工具

| 工具 | 类型 | 核心功能 | 适用场景 |
|------|------|---------|---------|
| OneTrust | 商业 | 数据隐私管理、**GDPR** 合规 | 企业数据合规 |
| BigID | 商业 | 数据发现、PII 检测 | 训练数据合规检查 |
| Immuta | 商业 | 数据治理、访问控制 | 数据使用合规 |

合规即代码（Compliance as Code）

越来越多的团队采用「合规即代码」方法，将合规检查集成到 CI/CD 流水线中：
**最佳实践**：将合规检查集成到开发流程

\`mermaid
graph LR
    A["代码提交"] --> B["CI 流水线"]
    B --> C["Garak 漏洞扫描"]
    B --> D["数据许可证检查"]
    C --> E["生成安全报告"]
    D --> F["生成数据合规报告"]
    E --> G["合规评审"]
    F --> G
    G --> H{合规通过?}
    H -->|"✅ 是"| I["合并代码"]
    H -->|"❌ 否"| J["修复问题"]
    J --> A

    K["部署"] --> L["Lakera 实时防护"]
    L --> M["持续监控"]
    M --> N["定期红队测试"]
    N --> O["更新模型"]
    O --> A

    classDef dev fill:#1d4ed8,stroke:\#2563eb,color:#fff
    classDef test fill:#b45309,stroke:\#d97706,color:#fff
    classDef deploy fill:#047857,stroke:\#059669,color:#fff
    class A,B dev
    class C,D,E,F,G,H,J test
    class K,L,M,N,O,I deploy`,
    },
    {
      title: "未来趋势：AI 监管将如何演变",
      body: `展望未来 3-5 年，AI 监管将在以下几个方向持续深化。

1. 从「事后监管」到「事前审批」

当前大多数 AI 监管是事后的（出问题后追责），但趋势正在转向事前审批：
- **EU AI Act** 要求高风险 AI 系统在上市前通过合格评定
- 中国要求生成式 AI 服务上线前完成算法备案和安全评估
- 美国部分州开始要求 AI 系统注册

这意味着 AI 产品的上市周期将延长，合规成本将成为重要考量因素。

2. 从「通用监管」到「行业定制」

监管正在从一刀切的通用框架转向行业定制规则：
- 医疗 AI 需要满足 FDA 的医疗器械审批流程
- 金融 AI 需要满足金融监管机构的模型风险管理要求
- 教育 AI 需要满足学生数据隐私保护要求
- 自动驾驶 AI 需要满足交通安全法规

3. 从「人工合规」到「自动化合规」

合规检查正在被 AI 化：
- 使用 AI 检测 AI 模型的合规风险
- 自动化生成合规文档和技术报告
- 持续监控模型的合规状态
- 智能推荐合规修复方案

4. 全球监管协调

目前全球 AI 监管碎片化严重，但协调趋势正在显现：
- G7 广岛 AI 进程推动国际协调
- 联合国正在讨论全球 AI 治理框架
- ISO/IEC 正在制定 AI 管理标准（ISO 42001）
- 跨国企业推动监管互认

5. AI 环境影响纳入监管

NAACP v **xAI** 案开启了 AI 环境影响监管的先河：
- 数据中心碳排放将需要披露
- AI 训练和推理的能源使用将受到限制
- 「绿色 AI」将成为合规要求
- AI 碳足迹计算和报告将成为标准流程`,
      table: {
        headers: ["监管趋势", "当前状态", "2027 年预测", "对开发者的影响"],
        rows: [
          ["事前审批", "部分国家试点", "将成为主流", "产品上市周期延长 2-3 个月"],
          ["行业定制", "医疗/金融已有", "覆盖 10+ 行业", "需要了解行业特定法规"],
          ["自动化合规", "工具起步阶段", "CI/CD 标准环节", "合规工具链成为基础设施"],
          ["全球协调", "碎片化严重", "形成区域联盟", "需要应对多司法管辖区要求"],
          ["环境监管", "刚起步", "强制披露", "需要优化模型能效"],
        ],
      },
      tip: "开发者行动建议：\n\n1. 现在就建立合规文化——不要等监管找上门\n2. 将合规检查集成到 CI/CD——左移合规，越早发现成本越低\n3. 关注你目标市场的监管动态——EU、US、CN 三大市场规则差异大\n4. 保留完整的技术文档——这是应对监管审查的第一道防线\n5. 加入行业组织——参与标准制定，影响监管方向",
      warning: "法律免责声明：\n\n本文内容仅供参考，不构成法律建议。AI 监管领域变化迅速，各国法律法规可能随时更新。在做出任何合规决策前，请咨询合格的法律专业人士。作者和发布者不对因使用本文信息而产生的任何损失承担责任。",
    },
    {
        title: "架构图示",
        mermaid: `graph TD
    A["概述"] --> B["原理"]
    B --> C["实现"]
    C --> D["应用"]
    D --> E["总结"]`,
    },
  ],
};
