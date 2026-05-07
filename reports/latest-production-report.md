⏰ 写入时间：2026-05-08 01:00 (Asia/Shanghai)
📄 知识库：[llm-024] LLM 推理优化：量化、剪枝与蒸馏全面指南（新写，42KB/9章/4代码/2图表）
📄 博客：[blog-132] 多智能体交易系统：TradingAgents 开源架构深度解析与行业预判（新写，45KB/11章/4代码/2图表）

## 写作理由
### 知识库选题理由：
- 当前知识体系覆盖情况：LLM 分类已有 23 篇文章（llm-001~llm-023），涵盖 Transformer、RAG、LoRA、MoE、Prompt Engineering 等，但缺少 LLM 推理优化的系统指南
- 本文补足了哪个缺口：LLM 推理优化是 AI 工程化的核心环节，现有 aieng-006 涉及推理优化但深度不足。本文从量化（PTQ/QAT/GPTQ/AWQ）、剪枝（结构化/非结构化）、知识蒸馏（序列级/Logits 级/CoT）三大技术路线全面讲解，并覆盖 vLLM/TensorRT-LLM/Ollama 等推理引擎的实战部署
- 为什么现在写这篇：推理成本是 LLM 应用落地的最大瓶颈之一，6 个月后仍有大量开发者需要这方面的系统知识

### 博客选题理由：
- 热点来源：研究员阶段 findings（TradingAgents 70,000+ GitHub Stars + Anthropic 10 个金融 AI Agent + virattt/dexter 深度金融研究 Agent）
- 为什么选这个热点：AI Agent 金融落地是 2026 年最重要的行业趋势之一，TradingAgents 作为最火爆的开源多智能体交易框架，代表了从单体量化到多智能体协作的范式转变。本文深入剖析架构设计、Agent 角色协作、辩论决策机制，并对 2026-2028 年行业趋势做出预判
