import { Article } from '../knowledge';

export const article: Article = {
    id: "ethics-007",
    title: "AI 治理框架：从原则到制度",
    category: "ethics",
    tags: ["AI治理", "政策", "监管", "合规"],
    summary: "从 EU AI Act 到 NIST AI RMF，系统理解全球 AI 治理框架及其对企业的影响",
    date: "2026-04-12",
    readTime: "22 min",
    level: "高级",
    content: [
        {
            title: "1. AI 治理为什么需要制度化",
            body: `AI 治理（AI Governance）是将伦理原则转化为可执行制度的过程。过去十年，AI 伦理讨论大多停留在抽象原则层面——"公平"、"透明"、"问责"这些概念听起来正确，但缺乏可操作性和强制力。当 AI 系统开始深度介入招聘、信贷、司法、医疗等高风险领域时，仅仅依靠企业的自我约束远远不够。

制度化治理的核心挑战在于平衡创新与风险。过于严格的监管会扼杀技术进步，特别是对于初创企业和小团队；过于宽松的监管则可能导致系统性风险积累，最终伤害公众信任。全球主要经济体正在探索不同的治理路径，从欧盟的风险分级强制监管到美国的行业自律加事后追责模式，再到中国的算法备案制度，每种模式都反映了不同的监管哲学和法律传统。

AI 治理不是技术问题，而是社会契约问题。它需要技术专家、法律学者、政策制定者和公众代表的共同参与。理解这些治理框架，对于 AI 从业者来说不仅是合规需求，更是职业责任。`,
            mermaid: `graph TD
    A["伦理原则"] --> B["治理框架"]
    B --> C["法律法规"]
    C --> D["技术标准"]
    D --> E["企业合规流程"]
    E --> F["审计与监督"]
    F -.->|反馈改进| A
    G["公众参与"] -.-> B
    H["学术研究"] -.-> B`,
            tip: "建议关注 NIST AI Risk Management Framework (AI RMF)，它是目前最实用、最具操作性的治理框架，适用于各种规模的 AI 项目。",
        },
        {
            title: "2. 欧盟 AI Act：全球最全面的 AI 监管法规",
            body: `欧盟人工智能法案（**EU AI Act**）是全球第一部综合性 AI 监管法律，于 2024 年正式通过。其核心创新在于基于风险的分级监管框架：将 AI 系统按风险等级分为不可接受风险、高风险、有限风险和最小风险四个层级，不同层级适用不同的监管要求。

不可接受风险的 AI 系统被直接禁止，包括基于社会评分的分类系统、利用人类弱点的 AI 系统、实时远程生物识别（执法例外除外）以及预测性警务中的个人风险评估。高风险 AI 系统（如医疗诊断、招聘筛选、关键基础设施管理）需要满足严格的事前合规要求：风险评估、高质量训练数据记录、技术文档、人类监督、以及符合性评估。

对于通用 AI 模型（Foundation Models），AI Act 引入了透明度要求：必须披露训练数据概要、遵守欧盟版权法、发布详细的技术文档。对于具有系统性风险的通用 AI 模型，还需要进行模型评估、红队测试、事件报告、以及计算效率和能源消耗监控。`,
            code: [
                {
                    lang: "python",
                    code: `# EU AI Act 风险分级判断示例框架
from enum import Enum
from dataclasses import dataclass
from typing import List

class RiskLevel(Enum):
    UNACCEPTABLE = "unacceptable"
    HIGH = "high"
    LIMITED = "limited"
    MINIMAL = "minimal"

@dataclass
class AISystemProfile:
    domain: str           # application domain
    affects_rights: bool  # impacts fundamental rights
    critical_infra: bool  # used in critical infrastructure
    biometric: bool       # uses biometric identification
    employment_related: bool  # hiring, firing, promotion
    education_related: bool   # student assessment

def classify_risk(profile: AISystemProfile) -> RiskLevel:
    """根据 EU AI Act Annex III 进行风险分级"""
    # 不可接受风险
    if profile.biometric and profile.affects_rights:
        return RiskLevel.UNACCEPTABLE
    
    # 高风险（Annex III 列举领域）
    high_risk_domains = [
        profile.employment_related,
        profile.education_related,
        profile.critical_infra,
        profile.affects_rights,
    ]
    if any(high_risk_domains):
        return RiskLevel.HIGH
    
    # 有限风险（需要透明度）
    if profile.domain in ["chatbot", "deepfake", "emotion_recognition"]:
        return RiskLevel.LIMITED
    
    return RiskLevel.MINIMAL

# 示例：招聘筛选系统
hiring_ai = AISystemProfile(
    domain="recruitment",
    affects_rights=True,
    critical_infra=False,
    biometric=False,
    employment_related=True,
    education_related=False,
)
risk = classify_risk(hiring_ai)
print(f"Risk level: {risk.value}")  # high`
                }
            ],
            table: {
                headers: ["风险等级", "示例", "监管要求"],
                rows: [
                    ["不可接受", "社会评分系统", "全面禁止"],
                    ["高风险", "招聘 AI、医疗诊断", "事前合规 + 持续监控"],
                    ["有限风险", "聊天机器人、Deepfake", "透明度告知义务"],
                    ["最小风险", "垃圾邮件过滤", "无特殊要求"],
                ]
            },
        },
        {
            title: "3. NIST AI 风险管理框架（AI RMF）",
            body: `NIST AI Risk Management Framework 是美国国家标准与技术研究院发布的 AI 风险管理指南。与欧盟 AI Act 的强制性法律不同，**NIST AI RMF** 是自愿性框架，但它的设计思路极具参考价值，特别是其四功能模型：治理（Govern）、映射（Map）、测量（Measure）和管理（Manage）。

治理功能强调建立 AI 风险管理的组织文化和制度基础，包括明确的角色与责任、持续监控机制、以及跨部门协作流程。映射功能要求组织在部署 AI 系统前，系统性地识别相关风险、利益相关者和使用场景。测量功能提供定量和定性的风险评估工具，包括技术指标和社会影响评估。管理功能则关注风险缓解策略的实施和持续改进。

**NIST AI RMF** 的 "AI RMF Playbook" 提供了具体的实施指南，包括风险评估模板、测试方法论和文档要求。这个框架特别适合那些希望在不确定的监管环境下主动管理 AI 风险的组织。`,
            code: [
                {
                    lang: "python",
                    code: `# NIST AI RMF 四功能实施框架
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from datetime import datetime

@dataclass
class RiskAssessment:
    risk_id: str
    category: str           # "bias", "security", "privacy", etc.
    likelihood: float       # 0.0 - 1.0
    impact: float           # 0.0 - 1.0
    mitigation_plan: str
    owner: str
    status: str = "open"
    last_reviewed: Optional[datetime] = None
    
    @property
    def risk_score(self) -> float:
        return self.likelihood * self.impact

class AIRiskRegistry:
    """NIST AI RMF 风险登记簿"""
    
    def __init__(self, system_name: str):
        self.system_name = system_name
        self.risks: Dict[str, RiskAssessment] = {}
        self.governance_log: List[str] = []
    
    def map_risks(self, risks: List[RiskAssessment]):
        """MAP 功能：识别和记录风险"""
        for r in risks:
            self.risks[r.risk_id] = r
            self.governance_log.append(
                f"[{datetime.now().isoformat()}] Mapped risk: {r.risk_id}"
            )
    
    def measure_risks(self) -> Dict[str, dict]:
        """MEASURE 功能：评估风险指标"""
        results = {}
        for rid, risk in self.risks.items():
            results[rid] = {
                "score": risk.risk_score,
                "level": "critical" if risk.risk_score > 0.7
                         else "high" if risk.risk_score > 0.4
                         else "medium" if risk.risk_score > 0.2
                         else "low",
                "status": risk.status,
            }
        return results
    
    def manage_risk(self, risk_id: str, action: str):
        """MANAGE 功能：执行风险缓解措施"""
        if risk_id in self.risks:
            self.risks[risk_id].status = action
            self.governance_log.append(
                f"[{datetime.now().isoformat()}] Managed {risk_id}: {action}"
            )

# 使用示例
registry = AIRiskRegistry("hiring-classifier-v2")
registry.map_risks([
    RiskAssessment("R001", "bias", 0.6, 0.8, 
                   "Implement demographic parity testing",
                   "ML-Team"),
    RiskAssessment("R002", "privacy", 0.3, 0.9,
                   "Data anonymization and access controls",
                   "Security-Team"),
])
print(registry.measure_risks())`
                }
            ],
            table: {
                headers: ["功能", "核心活动", "关键输出"],
                rows: [
                    ["Govern 治理", "建立风险文化、明确责任", "AI 治理政策文件"],
                    ["Map 映射", "识别风险、利益相关者分析", "风险登记簿、用例文档"],
                    ["Measure 测量", "定量/定性评估、测试", "风险评估报告、指标"],
                    ["Manage 管理", "缓解措施、持续监控", "缓解计划、审计报告"],
                ]
            },
            warning: "NIST AI RMF 是自愿性框架，但在政府采购和联邦项目中可能成为事实上的强制要求。提前采用可以获得监管先机。",
        },
        {
            title: "4. 中国 AI 治理：算法备案与生成式 AI 管理",
            body: `中国的 AI 治理体系采用了独特的 "算法备案 + 分类监管" 模式。2022 年生效的《互联网信息服务算法推荐管理规定》要求具有舆论属性或社会动员能力的算法推荐服务提供者进行备案。2023 年的《生成式人工智能服务管理暂行办法》进一步对生成式 AI 服务提出了具体要求。

中国治理框架的核心特点包括：强调算法透明度要求——服务提供者需要向用户说明算法的基本原理、目的和运行机制；数据安全义务——训练数据必须来源合法，不得侵犯知识产权和个人信息权益；内容安全审查——生成内容不得包含违法信息，需要建立内容过滤和审核机制；以及用户权益保护——用户有权拒绝个性化推荐，算法不得实施不合理差别待遇。

对于跨国 AI 企业来说，理解中国监管框架的重要性在于：中国是全球最大的 AI 应用市场之一，合规是进入市场的前提条件。同时，中国在 AI 治理方面的实践也为全球治理提供了重要参考，特别是在算法透明度、数据安全与 AI 创新的平衡方面。`,
            code: [
                {
                    lang: "python",
                    code: `# AI 合规检查清单框架（参考中国监管要求）
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime

@dataclass
class ComplianceCheck:
    check_id: str
    category: str          # "data", "algorithm", "content", "user_rights"
    description: str
    required: bool
    status: str = "pending"  # pending, passed, failed
    evidence: str = ""

class AIComplianceChecker:
    """AI 系统合规检查器"""
    
    def __init__(self, system_name: str):
        self.system_name = system_name
        self.checks: List[ComplianceCheck] = []
    
    def add_data_checks(self):
        """数据合规检查项"""
        self.checks.extend([
            ComplianceCheck("D01", "data", 
                "训练数据来源合法性审查", True),
            ComplianceCheck("D02", "data",
                "个人信息保护影响评估（PIA）", True),
            ComplianceCheck("D03", "data",
                "敏感个人信息单独同意获取", True),
            ComplianceCheck("D04", "data",
                "数据脱敏与匿名化处理", True),
        ])
    
    def add_algorithm_checks(self):
        """算法合规检查项"""
        self.checks.extend([
            ComplianceCheck("A01", "algorithm",
                "算法备案材料准备", True),
            ComplianceCheck("A02", "algorithm",
                "算法原理说明文档", True),
            ComplianceCheck("A03", "algorithm",
                "算法公平性评估", True),
            ComplianceCheck("A04", "algorithm",
                "人工干预与应急响应机制", True),
        ])
    
    def add_content_checks(self):
        """内容安全审查"""
        self.checks.extend([
            ComplianceCheck("C01", "content",
                "生成内容审核机制", True),
            ComplianceCheck("C02", "content",
                "违法信息过滤系统", True),
            ComplianceCheck("C03", "content",
                "用户举报与反馈渠道", True),
        ])
    
    def add_user_rights_checks(self):
        """用户权益保护"""
        self.checks.extend([
            ComplianceCheck("U01", "user_rights",
                "用户拒绝个性化推荐选项", True),
            ComplianceCheck("U02", "user_rights",
                "算法决策解释权", True),
            ComplianceCheck("U03", "user_rights",
                "个人信息查询与删除机制", True),
        ])
    
    def run_full_audit(self) -> dict:
        """执行完整合规审计"""
        self.add_data_checks()
        self.add_algorithm_checks()
        self.add_content_checks()
        self.add_user_rights_checks()
        
        results = {
            "total": len(self.checks),
            "required": sum(1 for c in self.checks if c.required),
            "passed": 0,
            "failed": 0,
            "pending": 0,
        }
        for c in self.checks:
            results[c.status] = results.get(c.status, 0) + 1
        
        compliance_rate = results["passed"] / results["total"] * 100
        results["compliance_rate"] = f"{compliance_rate:.1f}%"
        return results

checker = AIComplianceChecker("generative-chat-v1")
print(checker.run_full_audit())`
                }
            ],
            table: {
                headers: ["监管文件", "生效时间", "适用范围"],
                rows: [
                    ["算法推荐管理规定", "2022年3月", "算法推荐服务"],
                    ["深度合成管理规定", "2023年1月", "深度合成技术"],
                    ["生成式 AI 管理办法", "2023年8月", "生成式 AI 服务"],
                    ["科技伦理审查办法", "2023年12月", "科技活动伦理审查"],
                ]
            },
        },
        {
            title: "5. 企业 AI 治理体系建设",
            body: `无论外部监管环境如何变化，建立企业内部 AI 治理体系都是负责任 AI 开发的基石。一个有效的企业 AI 治理体系应该覆盖 AI 系统的全生命周期，从需求分析、数据采集、模型开发、测试验证、部署上线到持续监控和退役处置。

企业 AI 治理的核心要素包括：治理委员会（跨部门的 AI 治理决策机构，由技术、法务、合规、业务等代表组成）；风险评估流程（在 AI 项目的每个关键节点进行风险评审）；文档与追踪（完整的模型卡、数据卡、决策日志）；内部审计（定期对已部署的 AI 系统进行独立审计）；以及培训与文化建设（提升全员 AI 伦理意识和技能）。

实践中最常见的失败模式是治理与开发脱节——治理团队制定了详尽的政策文件，但开发团队在实际工作中无法将这些政策转化为具体的技术操作。解决之道是将治理要求内嵌到开发流程中，例如在 CI/CD 流水线中加入公平性测试、在代码审查中加入伦理检查清单、在模型注册表中强制要求填写模型卡。`,
            code: [
                {
                    lang: "python",
                    code: `# 企业 AI 治理：在 CI/CD 中集成合规检查
import json
from pathlib import Path
from typing import Dict, List
from dataclasses import dataclass, asdict

@dataclass
class ModelCard:
    model_name: str
    version: str
    developer: str
    intended_use: str
    limitations: List[str]
    training_data_summary: Dict
    performance_metrics: Dict
    ethical_considerations: List[str]
    review_status: str = "draft"

class AIGovernancePipeline:
    """CI/CD 流水线中的 AI 治理检查"""
    
    GATES = {
        "data_quality": "训练数据质量检查",
        "bias_test": "公平性与偏见测试",
        "privacy_check": "隐私合规检查",
        "security_review": "安全审查",
        "documentation": "文档完整性检查",
        "human_review": "人工审批",
    }
    
    def __init__(self, model_card: ModelCard):
        self.model_card = model_card
        self.gate_results: Dict[str, dict] = {}
    
    def run_gate(self, gate_name: str, checks: List[dict]) -> bool:
        """执行单个治理门控"""
        all_passed = all(c["passed"] for c in checks)
        self.gate_results[gate_name] = {
            "description": self.GATES.get(gate_name, gate_name),
            "passed": all_passed,
            "checks": checks,
        }
        return all_passed
    
    def run_full_pipeline(self) -> bool:
        """执行完整治理流水线"""
        print(f"\\n=== AI Governance Pipeline: {self.model_card.model_name} ===\\n")
        
        # Gate 1: 数据质量
        data_ok = self.run_gate("data_quality", [
            {"check": "Data completeness > 95%", "passed": True},
            {"check": "No PII in training set", "passed": True},
            {"check": "Class distribution balanced", "passed": True},
        ])
        
        # Gate 2: 公平性测试
        bias_ok = self.run_gate("bias_test", [
            {"check": "Demographic parity diff < 0.05", "passed": True},
            {"check": "Equal opportunity diff < 0.08", "passed": True},
            {"check": "Calibration across groups", "passed": True},
        ])
        
        # Gate 3: 隐私合规
        priv_ok = self.run_gate("privacy_check", [
            {"check": "DPIA completed", "passed": True},
            {"check": "Data retention policy defined", "passed": True},
        ])
        
        # Gate 4: 文档
        doc_ok = self.run_gate("documentation", [
            {"check": "Model card complete", 
             "passed": len(self.model_card.limitations) > 0},
            {"check": "Ethical considerations documented",
             "passed": len(self.model_card.ethical_considerations) > 0},
        ])
        
        all_passed = all([data_ok, bias_ok, priv_ok, doc_ok])
        self.model_card.review_status = "approved" if all_passed else "rejected"
        
        print(f"\\nOverall: {'APPROVED' if all_passed else 'REJECTED'}")
        for gate, result in self.gate_results.items():
            status = "PASS" if result["passed"] else "FAIL"
            print(f"  [{status}] {result['description']}")
        
        return all_passed

# 使用示例
card = ModelCard(
    model_name="credit-scorer-v3",
    version="3.1.0",
    developer="Risk-ML-Team",
    intended_use="Consumer credit risk assessment",
    limitations=["Not suitable for business loans", "Requires 2+ years of credit history"],
    training_data_summary={"size": "2.1M records", "period": "2019-2025"},
    performance_metrics={"AUC": 0.87, "F1": 0.82},
    ethical_considerations=["Potential bias against thin-file applicants"],
)
pipeline = AIGovernancePipeline(card)
pipeline.run_full_pipeline()`
                }
            ],
            tip: "将治理要求内嵌到 CI/CD 是关键。治理不应该是开发完成后的额外审查，而应该是开发流程的固有部分。",
        },
        {
            title: "6. AI 审计方法论与实践",
            body: `AI 审计是验证 AI 系统是否符合预期标准和监管要求的过程。与传统软件审计不同，AI 审计面临着独特的挑战：模型行为的不确定性、训练数据的动态性、以及"黑盒"特性导致的可解释性困难。

有效的 AI 审计需要多层次方法。技术层审计关注模型的输入输出行为——通过对抗测试、公平性测试、性能基准测试等手段验证模型的技术表现。流程层审计关注开发过程——是否遵循了既定的开发规范、是否进行了充分的测试、文档是否完整准确。治理层审计关注组织制度——是否有合适的治理架构、角色责任是否明确、风险是否被有效管理。

第三方审计正在成为 AI 治理的重要组成部分。独立审计机构可以提供客观的评估，弥补企业自我评估的不足。但目前 AI 审计行业仍处于早期阶段，缺乏统一的审计标准和资质认证体系。NIST 正在制定 AI 审计指南，IEEE 也推出了 AI 伦理认证项目，这些努力将推动 AI 审计行业的标准化和专业化。`,
            code: [
                {
                    lang: "python",
                    code: `# AI 审计框架：多维度评估
import numpy as np
from dataclasses import dataclass
from typing import Dict, List, Tuple

@dataclass
class AuditFinding:
    category: str
    severity: str           # "critical", "major", "minor", "info"
    description: str
    evidence: str
    recommendation: str

class AIAuditor:
    """多维度 AI 审计器"""
    
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.findings: List[AuditFinding] = []
    
    def audit_performance(self, metrics: Dict[str, float],
                         thresholds: Dict[str, float]) -> List[AuditFinding]:
        """性能审计"""
        findings = []
        for metric, value in metrics.items():
            threshold = thresholds.get(metric, 0.8)
            if value < threshold:
                findings.append(AuditFinding(
                    category="performance",
                    severity="major" if value < threshold * 0.8 else "minor",
                    description=f"{metric} = {value:.3f} (threshold: {threshold:.3f})",
                    evidence=f"Test set evaluation: {metric} below threshold",
                    recommendation=f"Improve {metric} through model retraining or data augmentation"
                ))
        return findings
    
    def audit_fairness(self, group_metrics: Dict[str, Dict[str, float]]) -> List[AuditFinding]:
        """公平性审计"""
        findings = []
        rates = {g: m["positive_rate"] for g, m in group_metrics.items()}
        
        if rates:
            max_rate = max(rates.values())
            min_rate = min(rates.values())
            disparity = max_rate - min_rate
            
            findings.append(AuditFinding(
                category="fairness",
                severity="critical" if disparity > 0.2 else 
                         "major" if disparity > 0.1 else "minor",
                description=f"Demographic disparity: {disparity:.3f}",
                evidence=f"Group rates: {rates}",
                recommendation="Apply fairness constraints or reweighting" if disparity > 0.1
                              else "Monitor disparity trend"
            ))
        
        return findings
    
    def audit_robustness(self, perturbation_results: List[Tuple[str, float, float]]) -> List[AuditFinding]:
        """鲁棒性审计"""
        findings = []
        for test_name, original_score, perturbed_score in perturbation_results:
            degradation = original_score - perturbed_score
            if degradation > 0.1:
                findings.append(AuditFinding(
                    category="robustness",
                    severity="major" if degradation > 0.2 else "minor",
                    description=f"{test_name}: performance drop {degradation:.3f}",
                    evidence=f"Original: {original_score:.3f}, Perturbed: {perturbed_score:.3f}",
                    recommendation=f"Add {test_name} to training data for adversarial training"
                ))
        return findings
    
    def generate_report(self) -> str:
        """生成审计报告"""
        critical = [f for f in self.findings if f.severity == "critical"]
        major = [f for f in self.findings if f.severity == "major"]
        minor = [f for f in self.findings if f.severity == "minor"]
        
        report = f"\\n{'='*60}\\n"
        report += f"AI Audit Report: {self.model_name}\\n"
        report += f"{'='*60}\\n"
        report += f"Total findings: {len(self.findings)}\\n"
        report += f"  Critical: {len(critical)}\\n"
        report += f"  Major:    {len(major)}\\n"
        report += f"  Minor:    {len(minor)}\\n"
        report += f"\\n--- Critical Findings ---\\n"
        for f in critical:
            report += f"[CRITICAL] {f.description}\\n"
            report += f"  Evidence: {f.evidence}\\n"
            report += f"  Action:   {f.recommendation}\\n\\n"
        
        return report

# 审计示例
auditor = AIAuditor("loan-approval-model")
auditor.findings.extend(auditor.audit_fairness({
    "group_A": {"positive_rate": 0.72},
    "group_B": {"positive_rate": 0.58},
    "group_C": {"positive_rate": 0.45},
}))
auditor.findings.extend(auditor.audit_robustness([
    ("noise_injection", 0.85, 0.71),
    ("feature_dropout", 0.85, 0.82),
    ("adversarial_samples", 0.85, 0.60),
]))
print(auditor.generate_report())`
                }
            ],
            table: {
                headers: ["审计类型", "关注重点", "常用方法"],
                rows: [
                    ["性能审计", "准确性、稳定性", "基准测试、A/B 测试"],
                    ["公平性审计", "群体差异、歧视", "统计差异测试、反事实分析"],
                    ["鲁棒性审计", "对抗攻击、噪声", "对抗测试、压力测试"],
                    ["隐私审计", "数据泄露风险", "成员推断攻击、数据提取测试"],
                    ["流程审计", "开发规范性", "文档审查、代码审查"],
                ]
            },
        },
        {
            title: "7. 全球 AI 治理趋势展望",
            body: `AI 治理正在从原则讨论快速走向强制监管。2024-2026 年是全球 AI 治理的关键窗口期，多个重要法规将生效实施。理解这些趋势对于 AI 从业者和企业来说至关重要。

监管趋同是第一个显著趋势。尽管各国采取了不同的监管路径，但在核心要求上正在形成共识：高风险 AI 系统需要事前评估、训练数据需要质量管理、模型需要透明度文档、部署后需要持续监控。这种趋同为跨国 AI 企业提供了合规框架设计的基础。

技术治理融合是第二个趋势。监管要求正在被编码为技术工具——公平性测试框架、模型卡生成工具、数据血缘追踪系统等。未来的 AI 治理将越来越依赖于自动化工具，而非人工审查。这也意味着 AI 工程师需要掌握新的治理技能，包括风险识别、合规测试和审计方法论。

第三个趋势是开源 AI 的治理挑战。随着开源大模型的快速发展，如何对开源模型实施有效治理成为监管者面临的新难题。现有的监管框架主要针对闭源的商业 AI 服务，开源模型的分布式开发和部署特性使得传统监管方式难以适用。未来可能需要创新的治理机制，如开源模型的安全评级系统、社区驱动的审计流程等。`,
            code: [
                {
                    lang: "python",
                    code: `# AI 治理成熟度评估模型
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class MaturityDimension:
    name: str
    level: int              # 1-5
    description: str
    
    @property
    def score(self) -> float:
        return self.level / 5.0

class AIGovernanceMaturityModel:
    """AI 治理成熟度评估"""
    
    LEVELS = {
        1: "Initial - 无正式治理流程",
        2: "Managed - 基本治理流程已建立",
        3: "Defined - 治理流程标准化文档化",
        4: "Quantitatively Managed - 治理可量化度量",
        5: "Optimizing - 持续改进的治理体系",
    }
    
    DIMENSIONS = [
        "governance_structure",
        "risk_management",
        "data_governance",
        "model_documentation",
        "testing_validation",
        "monitoring_oversight",
        "transparency_reporting",
        "training_culture",
    ]
    
    def __init__(self):
        self.scores: Dict[str, int] = {}
    
    def assess(self, assessments: Dict[str, int]):
        """评估各维度成熟度"""
        for dim, level in assessments.items():
            if dim in self.DIMENSIONS:
                self.scores[dim] = max(1, min(5, level))
    
    def overall_score(self) -> float:
        """计算总体成熟度"""
        if not self.scores:
            return 0.0
        return sum(self.scores.values()) / len(self.scores) / 5.0 * 100
    
    def radar_data(self) -> List[Dict]:
        """生成雷达图数据"""
        return [
            {"dimension": d.replace("_", " ").title(),
             "level": self.scores.get(d, 0),
             "max": 5}
            for d in self.DIMENSIONS
        ]
    
    def recommendations(self) -> List[str]:
        """基于评估结果给出改进建议"""
        recs = []
        weak_dims = [d for d, s in self.scores.items() if s <= 2]
        strong_dims = [d for d, s in self.scores.items() if s >= 4]
        
        for d in weak_dims:
            recs.append(f"Priority: Improve {d.replace('_', ' ')}")
        for d in strong_dims:
            recs.append(f"Strength: {d.replace('_', ' ')} is well-established")
        
        if not self.scores:
            recs.append("No assessment data available")
        
        return recs

# 示例评估
model = AIGovernanceMaturityModel()
model.assess({
    "governance_structure": 4,
    "risk_management": 3,
    "data_governance": 4,
    "model_documentation": 3,
    "testing_validation": 2,
    "monitoring_oversight": 2,
    "transparency_reporting": 1,
    "training_culture": 3,
})
print(f"Overall maturity: {model.overall_score():.0f}%")
for rec in model.recommendations():
    print(f"  - {rec}")`
                }
            ],
            table: {
                headers: ["趋势", "时间线", "影响范围"],
                rows: [
                    ["监管趋同", "2024-2026", "全球合规框架"],
                    ["技术治理融合", "2025-2027", "AI 开发工具链"],
                    ["开源治理", "2025-2028", "开源模型生态"],
                    ["第三方审计", "2025-2026", "审计行业标准化"],
                    ["AI 责任保险", "2026-2028", "企业风险管理"],
                ]
            },
            warning: "AI 监管环境正在快速变化。建议每季度审查一次合规状态，关注主要市场的新法规和指南更新。",
        },
        {
            title: "架构图示",
            mermaid: `graph TD
    subgraph "AI 治理框架体系"
        G1["国际层面<br/>UN/OECD/GPAI"] --> G2["区域层面<br/>欧盟 AI Act"]
        G2 --> G3["国家层面<br/>中/美/英"]
        G3 --> G4["行业层面<br/>NIST/ISO"]
        G4 --> G5["企业层面<br/>内部治理"]
    end
    
    subgraph "欧盟 AI Act 风险分级"
        R1["不可接受风险<br/>禁止"] --> R2["高风险<br/>严格合规"]
        R2 --> R3["有限风险<br/>透明度要求"]
        R3 --> R4["低风险<br/>自愿准则"]
    end
    
    G2 --> R1
    G2 --> R2
    
    style R1 fill:#b91c1c,stroke:#dc2626,color:#fff
    style R2 fill:#b45309,stroke:#d97706,color:#fff
    style G2 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
        },
    ],
};
