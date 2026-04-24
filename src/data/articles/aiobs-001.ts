import { Article } from '../knowledge';

export const article: Article = {
  id: "aiobs-001",
  title: "AI 可观测性与可靠性工程",
  category: "aieng",
  tags: ["可观测性", "SRE", "AI 运维", "监控", "告警", "自愈"],
  summary: "AI 系统上线后的可观测性与可靠性保障——从 LLM 监控到 Agent 自愈的全链路实践",
  date: "2026-04-24",
  readTime: "25 min",
  level: "高级",
  content: [
    {
      title: "1. AI 可观测性的独特挑战",
      body: `可观测性（Observability）在 AI 系统中面临着与传统软件截然不同的挑战。传统系统的可观测性主要关注三个维度：指标（Metrics）、日志（Logs）和追踪（Traces）——即经典的"三大支柱"。但 AI 系统增加了第四个核心维度：**数据分布与模型行为**。\n\n### AI 系统 vs 传统系统的监控差异\n\n传统 Web 应用的监控问题相对明确：接口响应时间超过 500ms、错误率超过 1%、CPU 使用率超过 80%——这些都是清晰定义的指标，有确定的阈值和告警策略。\n\n但 AI 系统的监控则更加模糊和动态。一个 LLM 推理服务的 HTTP 接口可能响应时间正常（200ms），错误率为零，但输出的内容可能完全偏离预期——这种"静默失败"是 AI 可观测性最核心的挑战。\n\n### AI 可观测性的四个维度\n\n1. **性能维度**：推理延迟、吞吐量、GPU 利用率、显存占用——与传统系统相似\n2. **质量维度**：输出准确性、幻觉率、一致性、安全性——AI 特有\n3. **数据维度**：输入分布漂移、上下文质量、检索准确率——AI 特有\n4. **成本维度**：Token 消耗、API 调用费用、基础设施成本——AI 特别重要\n\n### 为什么 AI 可观测性正在成为刚需\n\n2026 年的 AI 应用已经从"实验阶段"全面进入"生产阶段"。企业将 AI 系统用于客户服务、代码生成、内容创作、安全审计等关键业务场景。在这些场景下，AI 系统的不可靠不再是"好玩"的问题，而是直接影响业务收入和用户信任的问题。\n\n开源社区也反映出了这一趋势：\n- **OpenSRE**（2.7K stars）将 SRE 理念引入 AI Agent，提供自动化故障检测和自愈能力\n- **Langfuse** 从单纯的 LLM 调试工具成长为完整的 AI 可观测性平台\n- **PostHog**、**Datadog** 等传统监控平台纷纷推出 AI 专属监控模块\n\n这意味着 AI 可观测性正在成为一个独立的、快速发展的技术领域。`,
      code: [
        {
          lang: "python",
          title: "AI 可观测性数据采集基础框架",
          code: `from dataclasses import dataclass, field
from typing import Any, Optional
from datetime import datetime
import json
import hashlib

@dataclass
class AIObservation:
    """AI 系统的单次观测记录"""
    timestamp: datetime
    observation_type: str  # "performance" | "quality" | "data" | "cost"
    component: str  # 组件名称，如 "llm-inference" | "rag-retrieval" | "agent-loop"
    
    # 通用字段
    request_id: str = ""
    user_id: str = ""
    
    # 性能指标
    latency_ms: float = 0.0
    tokens_input: int = 0
    tokens_output: int = 0
    token_cost: float = 0.0
    
    # 质量指标
    quality_score: Optional[float] = None
    hallucination_detected: bool = False
    safety_score: Optional[float] = None
    
    # 数据指标
    context_quality: Optional[float] = None
    retrieval_recall: Optional[float] = None
    input_drift_score: Optional[float] = None
    
    # 元数据
    model_name: str = ""
    prompt_hash: str = ""
    metadata: dict = field(default_factory=dict)
    
    def compute_prompt_hash(self, prompt: str) -> str:
        """对 prompt 做哈希，用于追踪 prompt 变更的影响"""
        return hashlib.sha256(prompt.encode()).hexdigest()[:16]
    
    def to_json(self) -> str:
        return json.dumps({
            "timestamp": self.timestamp.isoformat(),
            "type": self.observation_type,
            "component": self.component,
            "request_id": self.request_id,
            "latency_ms": self.latency_ms,
            "tokens": {"input": self.tokens_input, "output": self.tokens_output},
            "quality": self.quality_score,
            "cost": self.token_cost,
            "model": self.model_name
        })

# 示例：记录一次 LLM 推理的完整观测
observation = AIObservation(
    timestamp=datetime.utcnow(),
    observation_type="performance",
    component="llm-inference",
    request_id="req_001",
    latency_ms=234.5,
    tokens_input=1280,
    tokens_output=567,
    token_cost=0.0032,
    quality_score=0.87,
    model_name="qwen3.6-27b",
    metadata={"temperature": 0.7, "max_tokens": 1024}
)`
        },
        {
          lang: "python",
          title: "AI 质量评估管道",
          code: `from typing import List, Dict, Tuple
import numpy as np
from enum import Enum

class QualityDimension(Enum):
    ACCURACY = "accuracy"        # 答案是否正确
    COMPLETENESS = "completeness"  # 回答是否完整
    CONSISTENCY = "consistency"    # 多次运行是否一致
    SAFETY = "safety"              # 是否安全无害
    RELEVANCE = "relevance"        # 是否与问题相关

@dataclass
class QualityEvaluation:
    dimensions: Dict[QualityDimension, float]
    overall_score: float
    flags: List[str] = field(default_factory=list)

def evaluate_llm_response(
    question: str,
    response: str,
    reference_answer: str = None,
    n_runs: int = 3
) -> QualityEvaluation:
    """多维度评估 LLM 输出质量"""
    scores = {}
    flags = []
    
    # 1. 一致性检测：多次运行同一 prompt，检查输出变化
    if n_runs > 1:
        variations = []
        for _ in range(n_runs):
            variations.append(call_llm(question))
        
        # 计算输出间的语义相似度
        similarities = compute_pairwise_similarities(variations)
        scores[QualityDimension.CONSISTENCY] = np.mean(similarities)
        
        if scores[QualityDimension.CONSISTENCY] < 0.7:
            flags.append("输出一致性偏低，建议降低 temperature")
    
    # 2. 准确性评估（如果有参考答案）
    if reference_answer:
        scores[QualityDimension.ACCURACY] = compute_similarity(
            response, reference_answer
        )
    
    # 3. 安全性检测
    safety_score = check_safety(response)
    scores[QualityDimension.SAFETY] = safety_score
    
    if safety_score < 0.5:
        flags.append("⚠️ 检测到潜在安全风险")
    
    # 4. 相关性检测
    relevance = compute_semantic_similarity(question, response)
    scores[QualityDimension.RELEVANCE] = relevance
    
    # 计算综合得分（加权平均）
    weights = {
        QualityDimension.ACCURACY: 0.35,
        QualityDimension.SAFETY: 0.30,
        QualityDimension.CONSISTENCY: 0.20,
        QualityDimension.RELEVANCE: 0.15,
    }
    overall = sum(
        weights.get(dim, 0.0) * score 
        for dim, score in scores.items()
    ) / sum(weights.get(dim, 0.0) for dim in scores)
    
    return QualityEvaluation(
        dimensions=scores,
        overall_score=overall,
        flags=flags
    )

def check_safety(text: str) -> float:
    """简化的安全性检测（实际应使用专用模型）"""
    risk_patterns = [
        # 添加你的风险检测模式
    ]
    risk_score = sum(1 for p in risk_patterns if p in text.lower())
    return max(0.0, 1.0 - risk_score * 0.1)`
        }
      ],
      table: {
        headers: ["监控维度", "关键指标", "告警阈值示例", "传统监控工具"],
        rows: [
          ["推理性能", "P99 延迟、吞吐量、Token/s", "P99 > 2000ms", "Prometheus + Grafana"],
          ["输出质量", "幻觉率、准确率、一致性", "幻觉率 > 5%", "Langfuse / Arize Phoenix"],
          ["输入漂移", "分布距离 (MMD/KS)、关键词偏移", "漂移分数 > 0.3", "Evidently / WhyLabs"],
          ["资源消耗", "GPU 利用率、显存、Token 费用", "GPU > 90% 持续 10min", "DCGM / 云平台监控"],
          ["Agent 行为", "工具调用失败率、循环检测、超时", "失败率 > 10%", "OpenSRE / 自定义 Agent"],
          ["RAG 检索", "召回率、Top-K 命中率、上下文质量", "召回率 < 70%", "专用 RAG 监控"]
        ]
      },
      mermaid: `graph TB
    subgraph "AI 可观测性架构"
        A[LLM 推理服务] --> B[Observation SDK]
        C[RAG 检索服务] --> B
        D[Agent 编排引擎] --> B
        B --> E[观测数据管道]
        E --> F[实时指标存储]
        E --> G[时序数据库]
        E --> H[日志聚合]
        F --> I[告警引擎]
        G --> J[分析 Dashboard]
        H --> J
        I --> K[告警通知]
        I --> L[自动修复 Agent]
        L --> A
        L --> C
        L --> D
    end`,
      tip: "AI 可观测性的第一步不是购买工具，而是定义清楚你的 AI 系统的 SLO（Service Level Objectives）。没有明确的 SLO，任何监控都是盲目的。",
      warning: "不要将 AI 系统的监控完全等同于传统系统监控。AI 系统的质量指标（如幻觉率）无法通过简单的阈值判断，需要结合业务场景定义合理的评估方法。"
    },
    {
      title: "2. AI SRE（Site Reliability Engineering）",
      body: `SRE（站点可靠性工程）是 Google 提出的将软件工程方法应用于运维问题的实践体系。AI SRE 则将这一理念扩展到 AI 系统的可靠性保障，涵盖从故障检测、根因分析到自动修复的全流程。\n\n### AI SRE 的核心理念\n\n传统 SRE 关注的是系统的可用性（Availability）、延迟（Latency）、吞吐量（Throughput）和错误率（Error Rate）。AI SRE 在此基础上增加了：\n\n1. **模型可用性**：模型推理服务是否正常输出合理结果？\n2. **数据质量保障**：输入数据分布是否偏离训练数据？\n3. **成本可控性**：Token 消耗和 API 费用是否在预算内？\n4. **Agent 可靠性**：AI Agent 是否陷入死循环或工具调用失败？\n\n### AI SRE 的故障类型\n\nAI 系统的故障模式比传统系统更加复杂和隐蔽：\n\n- **静默退化**：模型输出质量逐渐下降但不触发任何告警\n- **Prompt 注入**：恶意输入导致模型输出被操控\n- **上下文溢出**：Agent 会话上下文超出模型窗口限制\n- **工具链断裂**：Agent 依赖的某个工具 API 故障导致整个任务失败\n- **成本爆炸**：某个 Bug 导致 Token 消耗失控\n\n### 故障自愈 Agent\n\n2026 年最前沿的 AI SRE 实践是使用 AI Agent 本身来保障 AI 系统的可靠性。以 **OpenSRE** 项目为代表，这一思路的核心是：\n\n1. **自动故障检测**：Agent 持续监控 AI 系统的各项指标，通过模式识别发现异常\n2. **智能根因分析**：当检测到异常时，Agent 分析日志、指标和追踪数据，定位根因\n3. **自动修复执行**：对于已知类型的故障，Agent 可以自动执行修复操作（如重启服务、回滚模型版本、调整参数）\n4. **经验学习**：修复过程和结果被记录为经验，用于未来更快速的响应\n\n这种"用 AI 管理 AI"的思路正在成为 AI 运维的新范式。`,
      code: [
        {
          lang: "python",
          title: "AI 故障自愈 Agent 原型",
          code: `import asyncio
from typing import List, Optional
from datetime import datetime
from enum import Enum
from dataclasses import dataclass

class FaultSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class FaultReport:
    """故障报告"""
    fault_id: str
    timestamp: datetime
    severity: FaultSeverity
    component: str
    description: str
    detected_by: str  # "metric" | "anomaly" | "manual"
    metrics_snapshot: dict = None
    
    def estimate_impact(self) -> float:
        """估算故障影响范围（0-1）"""
        severity_weight = {
            FaultSeverity.LOW: 0.1,
            FaultSeverity.MEDIUM: 0.3,
            FaultSeverity.HIGH: 0.7,
            FaultSeverity.CRITICAL: 1.0,
        }
        return severity_weight[self.severity]

class SelfHealingAgent:
    """AI 故障自愈 Agent"""
    
    def __init__(self, llm_client, action_executor):
        self.llm = llm_client
        self.executor = action_executor
        self.knowledge_base = []  # 历史故障经验
        self.active_remediations = set()  # 正在执行的修复
    
    async def detect_and_remediate(self, observations: List) -> List:
        """检测故障并自动修复"""
        faults = await self._detect_faults(observations)
        remediations = []
        
        for fault in faults:
            # 1. 根因分析
            rca = await self._root_cause_analysis(fault)
            
            # 2. 查找历史经验
            past_solution = self._find_similar_fault(fault)
            
            # 3. 制定修复方案
            plan = await self._create_remediation_plan(
                fault, rca, past_solution
            )
            
            # 4. 执行修复
            if plan.confidence > 0.8:
                result = await self._execute_plan(plan)
                remediations.append(result)
            else:
                # 低置信度，通知人工
                await self._notify_human(fault, plan)
        
        # 5. 记录经验
        self._record_experience(faults, remediations)
        return remediations
    
    async def _detect_faults(
        self, observations: List
    ) -> List[FaultReport]:
        """从观测数据中检测故障"""
        faults = []
        
        for obs in observations:
            # 规则检测
            if obs.latency_ms > 5000:
                faults.append(FaultReport(
                    fault_id=f"fault_{obs.request_id}",
                    timestamp=obs.timestamp,
                    severity=FaultSeverity.HIGH,
                    component=obs.component,
                    description=f"推理延迟过高: {obs.latency_ms}ms",
                    detected_by="metric"
                ))
            
            # 质量检测
            if obs.quality_score is not None and obs.quality_score < 0.5:
                faults.append(FaultReport(
                    fault_id=f"fault_q_{obs.request_id}",
                    timestamp=obs.timestamp,
                    severity=FaultSeverity.MEDIUM,
                    component=obs.component,
                    description=f"输出质量下降: 质量得分 {obs.quality_score}",
                    detected_by="anomaly",
                    metrics_snapshot={"quality_score": obs.quality_score}
                ))
        
        return faults
    
    async def _root_cause_analysis(
        self, fault: FaultReport
    ) -> dict:
        """使用 LLM 进行智能根因分析"""
        prompt = f"""
你是一位 AI SRE 专家。请分析以下故障报告，
判断最可能的根因并给出置信度。

故障: {fault.description}
组件: {fault.component}
严重程度: {fault.severity.value}
指标快照: {fault.metrics_snapshot}

请按以下格式输出:
- 根因: [一句话描述]
- 置信度: [0-1]
- 建议修复: [具体操作]
"""
        analysis = await self.llm.generate(prompt)
        return self._parse_analysis(analysis)

    async def _create_remediation_plan(
        self, fault: FaultReport, rca: dict, past: Optional[dict]
    ) -> dict:
        """制定修复方案"""
        plan = {
            "fault_id": fault.fault_id,
            "actions": [],
            "confidence": rca.get("confidence", 0.5),
            "estimated_recovery_time": "unknown",
        }
        
        # 如果有历史相似故障，优先使用历史方案
        if past:
            plan["actions"] = past.get("successful_actions", [])
            plan["confidence"] = max(plan["confidence"], 0.7)
        
        # 基于根因分析添加操作
        root_cause = rca.get("root_cause", "")
        if "memory" in root_cause.lower():
            plan["actions"].append({
                "type": "restart",
                "target": fault.component,
                "reason": "内存泄漏嫌疑"
            })
        elif "rate_limit" in root_cause.lower():
            plan["actions"].append({
                "type": "backoff",
                "target": "api_client",
                "parameters": {"delay_ms": 1000, "max_retries": 5}
            })
        
        return plan
    
    async def _execute_plan(self, plan: dict) -> dict:
        """执行修复计划"""
        results = []
        for action in plan["actions"]:
            result = await self.executor.execute(action)
            results.append(result)
        
        return {
            "plan_id": plan["fault_id"],
            "actions_executed": len(results),
            "success_rate": sum(1 for r in results if r.success) / len(results)
        }`
        },
        {
          lang: "python",
          title: "SRE 告警路由与通知策略",
          code: `from dataclasses import dataclass, field
from typing import List, Callable, Dict
from enum import Enum
import time

class NotificationChannel(Enum):
    SLACK = "slack"
    EMAIL = "email"
    SMS = "sms"
    PHONE = "phone"
    WEBHOOK = "webhook"

@dataclass
class AlertRule:
    """告警规则定义"""
    name: str
    condition: Callable  # 返回 bool 的函数
    severity: FaultSeverity
    channels: List[NotificationChannel]
    cooldown_seconds: int = 300  # 冷却时间
    auto_escalate: bool = False
    escalation_after_seconds: int = 900
    
    _last_fired: float = 0
    
    def should_fire(self) -> bool:
        """判断是否应该触发告警"""
        if not self.condition():
            return False
        if time.time() - self._last_fired < self.cooldown_seconds:
            return False
        return True
    
    def fire(self) -> None:
        self._last_fired = time.time()

class AlertRouter:
    """智能告警路由"""
    
    def __init__(self):
        self.rules: List[AlertRule] = []
        self.notification_handlers: Dict[NotificationChannel, Callable] = {}
        self.alert_history: List = []
        self.suppression_windows: Dict[str, float] = {}
    
    def add_rule(self, rule: AlertRule) -> None:
        self.rules.append(rule)
    
    def register_handler(
        self, channel: NotificationChannel, handler: Callable
    ) -> None:
        self.notification_handlers[channel] = handler
    
    def evaluate_and_alert(self, context: dict) -> List:
        """评估所有规则并发送告警"""
        fired_alerts = []
        
        for rule in self.rules:
            if rule.should_fire():
                # 检查抑制窗口（避免告警风暴）
                if self._is_suppressed(rule.name):
                    continue
                
                rule.fire()
                
                # 确定通知渠道（根据严重级别）
                channels = self._determine_channels(rule)
                
                for channel in channels:
                    handler = self.notification_handlers.get(channel)
                    if handler:
                        handler({
                            "rule": rule.name,
                            "severity": rule.severity.value,
                            "context": context,
                            "timestamp": time.time()
                        })
                
                fired_alerts.append(rule.name)
                self.alert_history.append({
                    "rule": rule.name,
                    "timestamp": time.time(),
                    "context": context
                })
        
        return fired_alerts
    
    def _determine_channels(self, rule: AlertRule) -> List:
        """根据严重级别确定通知渠道"""
        severity_channels = {
            FaultSeverity.LOW: [NotificationChannel.SLACK],
            FaultSeverity.MEDIUM: [
                NotificationChannel.SLACK,
                NotificationChannel.EMAIL
            ],
            FaultSeverity.HIGH: [
                NotificationChannel.SLACK,
                NotificationChannel.EMAIL,
                NotificationChannel.SMS
            ],
            FaultSeverity.CRITICAL: [
                NotificationChannel.SLACK,
                NotificationChannel.EMAIL,
                NotificationChannel.SMS,
                NotificationChannel.PHONE
            ],
        }
        return list(set(rule.channels) | set(
            severity_channels.get(rule.severity, [])
        ))
    
    def _is_suppressed(self, rule_name: str) -> bool:
        """检查是否在抑制窗口内（避免告警风暴）"""
        last_alert = self._get_last_alert_time(rule_name)
        if last_alert and time.time() - last_alert < 60:
            return True
        return False
    
    def _get_last_alert_time(self, rule_name: str) -> Optional[float]:
        recent = [
            a for a in self.alert_history 
            if a["rule"] == rule_name
        ]
        return recent[-1]["timestamp"] if recent else None`
        }
      ],
      table: {
        headers: ["故障类型", "检测信号", "典型修复动作", "自愈置信度"],
        rows: [
          ["推理延迟过高", "P99 > 5000ms", "扩容实例 / 切换备用模型", "高（规则明确）"],
          ["Token 费用异常", "单位时间消耗 > 3σ", "降级模型 / 限制输出长度", "高（阈值清晰）"],
          ["输出质量下降", "质量评分连续下降", "调整 prompt / 切换模型版本", "中（需 A/B 验证）"],
          ["Agent 死循环", "工具调用次数 > 阈值", "强制终止 / 回退到上一状态", "高（模式可识别）"],
          ["RAG 检索失效", "召回率 < 50%", "重建索引 / 切换检索策略", "中（需验证效果）"],
          ["上下文溢出", "上下文窗口使用率 > 95%", "截断 / 摘要压缩", "高（操作确定）"],
          ["模型服务宕机", "健康检查失败", "切换备用端点 / 自动重启", "高（操作确定）"],
          ["数据漂移", "输入分布 KS 检验 p < 0.01", "触发重训练流程 / 告警人工确认", "低（需人工判断）"]
        ]
      },
      mermaid: `sequenceDiagram
    participant M as 监控系统
    participant D as 故障检测
    participant A as 自愈 Agent
    participant K as 知识库
    participant S as 执行器
    participant N as 通知
    
    M->>D: 推送观测数据
    D->>D: 规则 + 异常检测
    D->>A: 发现故障
    A->>K: 查询历史经验
    K-->>A: 返回相似案例
    A->>A: 根因分析 + 制定方案
    alt 置信度 > 80%
        A->>S: 自动执行修复
        S-->>A: 执行结果
        A->>K: 记录经验
    else 置信度 < 80%
        A->>N: 通知人工确认
        N-->>A: 人工决策
        A->>S: 执行修复
    end
    A->>M: 确认故障已恢复`,
      tip: "AI 系统的自愈不是追求 100% 自动化。关键是要有清晰的置信度评估机制——高置信度的操作自动执行，低置信度的操作必须有人工确认环节。",
      warning: "自愈 Agent 本身也需要被监控！确保自愈操作不会引发级联故障（如无限重启循环）。建议为自愈 Agent 设置操作频率上限和全局熔断机制。"
    },
    {
      title: "3. 生产级 AI 可观测性架构实战",
      body: `一个生产级的 AI 可观测性系统需要覆盖从数据采集到告警响应再到经验沉淀的完整闭环。下面我们以一个典型的 RAG + Agent 系统为例，展示如何构建完整的可观测性架构。\n\n### 整体架构\n\n一个完整的 AI 可观测性系统包含以下层次：\n\n1. **采集层**：在 AI 服务的各个关键节点注入观测代码，收集指标、日志、追踪和质量数据\n2. **管道层**：将观测数据实时传输到存储和分析系统，支持流式处理和批量处理\n3. **存储层**：不同类型的数据存储在不同系统中——时序数据用时序数据库，日志用日志系统，质量评估结果用关系型数据库\n4. **分析层**：提供实时监控 Dashboard、告警规则引擎和智能根因分析\n5. **行动层**：告警通知、自动修复 Agent 和经验知识库\n\n### 技术选型建议\n\n在 2026 年的生态中，AI 可观测性领域的核心工具有：\n\n- **OpenTelemetry**：统一的观测数据采集标准，已支持 LLM 语义约定\n- **Langfuse**：开源 LLM 工程平台，提供追踪、评估和实验管理\n- **Arize Phoenix**：开源 AI 可观测性和评估平台，支持 LLM 应用调试\n- **Prometheus + Grafana**：传统但强大的指标监控组合\n- **OpenSRE**：新兴的 AI SRE Agent 平台，专注于故障自愈\n- **Evidently**：开源 ML 监控和漂移检测工具\n\n### 关键实现要点\n\n在实际落地中，以下要点最为关键：\n\n1. **观测数据与业务数据关联**：每条观测记录都应包含请求 ID、用户 ID 等业务标识，这样才能追溯具体问题到具体用户\n2. **采样策略**：AI 推理请求量可能非常大，需要合理的采样策略——高质量请求和低质量请求的采样比例应该不同\n3. **延迟与可观测性的权衡**：观测代码本身不应显著增加系统延迟，建议异步写入观测数据\n4. **定义 SLO**：为你的 AI 系统定义清晰的服务等级目标，如"95% 的推理请求在 1 秒内返回质量评分 > 0.7 的结果"`,
      code: [
        {
          lang: "python",
          title: "基于 OpenTelemetry 的 LLM 可观测性集成",
          code: `from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
    OTLPSpanExporter
)
from opentelemetry.semconv.trace import SpanAttributes
import time
from contextlib import contextmanager

# 初始化 Tracer
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer("ai-master.llm")

# 初始化 Metrics
meter = metrics.get_meter("ai-master.llm")

# 定义自定义指标
llm_latency = meter.create_histogram(
    "llm.latency",
    unit="ms",
    description="LLM 推理延迟"
)
token_counter = meter.create_counter(
    "llm.tokens",
    unit="tokens",
    description="Token 消耗计数"
)
quality_gauge = meter.create_up_down_counter(
    "llm.quality_score",
    unit="score",
    description="输出质量评分"
)

@contextmanager
def observe_llm_call(
    model_name: str,
    prompt: str,
    request_id: str = None
):
    """LLM 调用的观测上下文管理器"""
    request_id = request_id or generate_request_id()
    
    with tracer.start_as_current_span(
        "llm.generate",
        attributes={
            "llm.system": model_name,
            "llm.request_id": request_id,
            "llm.prompt_length": len(prompt),
            "gen_ai.operation.name": "chat",
        }
    ) as span:
        start_time = time.time()
        
        try:
            # 执行业务逻辑（由调用方传入）
            yield {"request_id": request_id, "span": span}
            
            # 记录成功
            latency_ms = (time.time() - start_time) * 1000
            llm_latency.record(latency_ms, {"model": model_name})
            span.set_attribute("llm.latency_ms", latency_ms)
            span.set_status(trace.StatusCode.OK)
            
        except Exception as e:
            # 记录错误
            latency_ms = (time.time() - start_time) * 1000
            llm_latency.record(latency_ms, {"model": model_name, "error": "true"})
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, str(e))
            raise

# 使用示例
def generate_with_observability(
    model: str,
    prompt: str,
    max_tokens: int = 1024
) -> str:
    with observe_llm_call(model, prompt) as ctx:
        request_id = ctx["request_id"]
        
        # 实际 LLM 调用
        response = call_llm_api(
            model=model,
            prompt=prompt,
            max_tokens=max_tokens
        )
        
        # 记录 Token 消耗
        token_counter.add(
            response.usage.total_tokens,
            {"model": model, "type": "total"}
        )
        token_counter.add(
            response.usage.prompt_tokens,
            {"model": model, "type": "input"}
        )
        token_counter.add(
            response.usage.completion_tokens,
            {"model": model, "type": "output"}
        )
        
        # 记录质量评分
        quality = evaluate_response(prompt, response.text)
        quality_gauge.add(
            quality.overall_score - 0.5,
            {"model": model, "request_id": request_id}
        )
        
        return response.text`
        },
        {
          lang: "python",
          title: "AI 系统 SLO 监控与告警",
          code: `from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import numpy as np

@dataclass
class SLO:
    """Service Level Objective 定义"""
    name: str
    metric_name: str
    target: float  # 目标值
    window: timedelta  # 评估窗口
    threshold: float  # 告警阈值（低于此值告警）
    
    def calculate_burn_rate(
        self, 
        observations: List,
        current_time: datetime
    ) -> float:
        """计算错误预算消耗率"""
        window_start = current_time - self.window
        window_obs = [
            o for o in observations 
            if o.timestamp >= window_start
        ]
        
        if not window_obs:
            return 0.0
        
        # 计算当前指标值
        values = [getattr(o, self.metric_name) for o in window_obs 
                  if hasattr(o, self.metric_name)]
        
        if not values:
            return 0.0
        
        current_value = np.mean(values)
        
        # 燃烧率 = (目标 - 当前值) / (目标 - 0)
        if self.target == 0:
            return 0.0
        
        burn_rate = (self.target - current_value) / self.target
        return max(0.0, burn_rate)
    
    def should_alert(self, burn_rate: float) -> bool:
        """判断是否应该触发告警"""
        return burn_rate > self.threshold

# 定义 AI 系统的 SLO
ai_slos = [
    SLO(
        name="推理延迟 P99",
        metric_name="latency_ms",
        target=2000.0,  # 目标 P99 < 2000ms
        window=timedelta(hours=1),
        threshold=0.3,  # 燃烧率 > 30% 告警
    ),
    SLO(
        name="输出质量",
        metric_name="quality_score",
        target=0.8,  # 目标质量 > 0.8
        window=timedelta(hours=4),
        threshold=0.2,
    ),
    SLO(
        name="服务可用性",
        metric_name="availability",
        target=0.999,  # 目标 99.9% 可用
        window=timedelta(days=30),
        threshold=0.1,
    ),
    SLO(
        name="Token 成本预算",
        metric_name="cost_per_hour",
        target=100.0,  # 每小时成本 < $100
        window=timedelta(hours=24),
        threshold=0.5,
    ),
]

def evaluate_slos(
    observations: List,
    current_time: datetime
) -> List[dict]:
    """评估所有 SLO 的状态"""
    results = []
    
    for slo in ai_slos:
        burn_rate = slo.calculate_burn_rate(observations, current_time)
        
        results.append({
            "slo": slo.name,
            "burn_rate": round(burn_rate, 4),
            "target": slo.target,
            "alerting": slo.should_alert(burn_rate),
            "error_budget_remaining": max(0, 1 - burn_rate),
        })
    
    return results

def generate_slo_report(results: List[dict]) -> str:
    """生成 SLO 报告"""
    report = ["📊 AI 系统 SLO 报告", "=" * 40]
    
    for r in results:
        status = "🔴" if r["alerting"] else "🟢"
        report.append(
            f"{status} {r['slo']}: "
            f"燃烧率 {r['burn_rate']:.1%}, "
            f"错误预算剩余 {r['error_budget_remaining']:.1%}"
        )
    
    alerting = [r for r in results if r["alerting"]]
    if alerting:
        report.append(f"\\n⚠️  {len(alerting)} 个 SLO 正在告警！")
    
    return "\\n".join(report)`
        }
      ],
      table: {
        headers: ["可观测性平台", "核心功能", "优势", "适用场景"],
        rows: [
          ["Langfuse", "LLM 追踪、评估、实验管理", "开源、开发者友好、API 简洁", "LLM 应用开发与调试"],
          ["Arize Phoenix", "AI 可观测性 + 评估平台", "可视化强、支持 embedding 分析", "RAG 系统调试与优化"],
          ["OpenTelemetry", "统一的观测数据采集标准", "厂商中立、生态广泛、支持多语言", "生产级基础设施集成"],
          ["OpenSRE", "AI SRE Agent 自动化", "专注 AI 故障自愈、MCP 集成", "AI 运维自动化"],
          ["Prometheus + Grafana", "指标监控 + Dashboard", "成熟稳定、告警能力强", "基础设施级监控"],
          ["Evidently", "ML 监控与漂移检测", "统计方法全面、报告自动化", "ML 模型生产监控"]
        ]
      },
      mermaid: `graph LR
    subgraph "采集层"
        A[LLM 服务] --> A1[OTel SDK]
        B[RAG 服务] --> B1[OTel SDK]
        C[Agent 服务] --> C1[OTel SDK]
    end
    
    subgraph "管道层"
        A1 --> D[OpenTelemetry Collector]
        B1 --> D
        C1 --> D
        D --> E[Kafka 消息队列]
    end
    
    subgraph "存储层"
        E --> F[Prometheus<br/>指标]
        E --> G[Elasticsearch<br/>日志]
        E --> H[Jaeger<br/>追踪]
        E --> I[Langfuse<br/>LLM 追踪]
        E --> J[PostgreSQL<br/>质量评估]
    end
    
    subgraph "分析层"
        F --> K[Grafana<br/>Dashboard]
        G --> K
        H --> K
        I --> I2[Langfuse UI]
        J --> L[自定义 Dashboard]
        F --> M[告警引擎]
        J --> M
    end
    
    subgraph "行动层"
        M --> N[通知<br/>Slack/Email/SMS]
        M --> O[自愈 Agent<br/>OpenSRE]
        O --> P[经验知识库]
        P --> O
    end`,
      tip: "从最简单的方案开始——先在关键路径上添加延迟和错误率监控，再逐步增加质量评估和成本追踪。不要一开始就追求大而全的可观测性平台。",
      warning: "AI 可观测性系统的监控数据量可能非常大（每次 LLM 调用都产生多条观测记录）。务必设计合理的采样策略和数据保留策略，否则存储成本会失控。"
    }
  ]
};
