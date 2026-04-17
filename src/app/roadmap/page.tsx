"use client";

import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

interface RoadmapPhase {
  phase: number;
  title: string;
  duration: string;
  icon: string;
  color: string;
  borderColor: string;
  badgeColor: string;
  steps: { title: string; desc: string; tags: string[] }[];
}

interface RouteDef {
  id: string;
  name: string;
  emoji: string;
  duration: string;
  description: string;
  target: string;
  color: string;
  borderColor: string;
  badgeColor: string;
  phases: RoadmapPhase[];
}

// ==================== 路线定义 ====================

// 🚀 速成路线
const fastRoute: RouteDef = {
  id: "fast",
  name: "速成路线",
  emoji: "🚀",
  duration: "2-4 周",
  description: "先学会用，再补基础 — 适合想快速上手 AI 应用的开发者",
  target: "适合有编程基础，想快速使用 AI 工具提高工作效率的人",
  color: "from-cyan-500/20 to-blue-500/20",
  borderColor: "border-cyan-500/30",
  badgeColor: "bg-cyan-500/10 text-cyan-300",
  phases: [
    {
      phase: 1,
      title: "认识 AI",
      duration: "30 分钟",
      icon: "🌍",
      color: "from-white/10 to-slate-500/10",
      borderColor: "border-white/20",
      badgeColor: "bg-white/10 text-white",
      steps: [
        { title: "AI 是什么？", desc: "从概念到实践的全景导览——AI 的三次浪潮、AI/ML/DL 的关系、2026 年主流技术栈", tags: ["AI 入门", "技术全景"] },
        { title: "2026 年 AI 能做什么", desc: "编程、创作、研究、工作流的真实案例与工具推荐", tags: ["应用场景", "工具"] },
        { title: "学习路线规划", desc: "速成 vs 基础路线对比、三个黄金学习原则", tags: ["学习路线", "方法论"] },
      ],
    },
    {
      phase: 2,
      title: "Prompt Engineering",
      duration: "1-2 天",
      icon: "✏️",
      color: "from-cyan-500/20 to-teal-500/20",
      borderColor: "border-cyan-500/30",
      badgeColor: "bg-cyan-500/10 text-cyan-300",
      steps: [
        { title: "认识提示词", desc: "理解什么是 Prompt，为什么好的提示词能显著提升 AI 输出质量", tags: ["Prompt", "基础"] },
        { title: "结构化提示词", desc: "掌握角色设定 + 任务描述 + 输出格式 + 约束条件的四段式写法", tags: ["结构化", "模板"] },
        { title: "进阶技巧", desc: "CoT 思维链、Few-shot 示例、ReAct 推理-行动模式", tags: ["CoT", "Few-shot"] },
      ],
    },
    {
      phase: 3,
      title: "大语言模型应用",
      duration: "3-5 天",
      icon: "🤖",
      color: "from-blue-500/20 to-indigo-500/20",
      borderColor: "border-blue-500/30",
      badgeColor: "bg-blue-500/10 text-blue-300",
      steps: [
        { title: "LLM 原理入门", desc: "理解 Transformer 架构、Token 机制、上下文窗口、温度参数", tags: ["Transformer", "Token"] },
        { title: "API 调用实战", desc: "用 OpenAI/Anthropic API 完成第一个 AI 应用", tags: ["API", "实战"] },
        { title: "RAG 系统搭建", desc: "向量数据库 + 检索 + 生成，构建基于私有知识的问答系统", tags: ["RAG", "向量库"] },
        { title: "Fine-tuning 实战", desc: "LoRA/QLoRA 微调开源大模型，适配特定任务", tags: ["LoRA", "微调"] },
      ],
    },
    {
      phase: 4,
      title: "AI Agent 实战",
      duration: "1 周",
      icon: "🦾",
      color: "from-purple-500/20 to-violet-500/20",
      borderColor: "border-purple-500/30",
      badgeColor: "bg-purple-500/10 text-purple-300",
      steps: [
        { title: "Agent 基础组件", desc: "感知、规划、记忆、工具调用四大核心组件详解", tags: ["Agent", "组件"] },
        { title: "工具调用实战", desc: "Function Calling、MCP 协议，让 Agent 能调用外部工具", tags: ["Function Calling", "MCP"] },
        { title: "Multi-Agent 协作", desc: "多角色 Agent 分工协作，完成复杂任务", tags: ["Multi-Agent", "协作"] },
      ],
    },
    {
      phase: 5,
      title: "AI 工程化实践",
      duration: "1-2 周",
      icon: "🚀",
      color: "from-emerald-500/20 to-green-500/20",
      borderColor: "border-emerald-500/30",
      badgeColor: "bg-emerald-500/10 text-emerald-300",
      steps: [
        { title: "AI 应用部署", desc: "将 AI 应用部署到生产环境，学习 Docker、API 服务化", tags: ["部署", "Docker"] },
        { title: "真实项目实战", desc: "从需求分析到上线的完整 AI 项目实践", tags: ["项目", "实战"] },
      ],
    },
  ],
};

// 📚 基础路线
const foundationRoute: RouteDef = {
  id: "foundation",
  name: "基础路线",
  emoji: "📚",
  duration: "6-12 月",
  description: "循序渐进，系统学习 — 适合想深入理解 AI 原理的学习者",
  target: "适合零基础或转行学习 AI，想建立完整知识体系的人",
  color: "from-emerald-500/20 to-teal-500/20",
  borderColor: "border-emerald-500/30",
  badgeColor: "bg-emerald-500/10 text-emerald-300",
  phases: [
    {
      phase: 1,
      title: "认识 AI",
      duration: "30 分钟",
      icon: "🌍",
      color: "from-white/10 to-slate-500/10",
      borderColor: "border-white/20",
      badgeColor: "bg-white/10 text-white",
      steps: [
        { title: "AI 是什么？", desc: "从概念到实践的全景导览——AI 的三次浪潮、AI/ML/DL 的关系、2026 年主流技术栈", tags: ["AI 入门", "技术全景"] },
        { title: "2026 年 AI 能做什么", desc: "编程、创作、研究、工作流的真实案例与工具推荐", tags: ["应用场景", "工具"] },
        { title: "学习路线规划", desc: "速成 vs 基础路线对比、三个黄金学习原则", tags: ["学习路线", "方法论"] },
      ],
    },
    {
      phase: 7,
      title: "入门基础",
      duration: "4-6 周",
      icon: "🌱",
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/30",
      badgeColor: "bg-emerald-500/10 text-emerald-300",
      steps: [
        { title: "Python 编程基础", desc: "语法、数据结构、函数、面向对象编程", tags: ["Python", "编程基础"] },
        { title: "数学基础", desc: "线性代数、概率论、微积分核心概念", tags: ["数学", "线性代数"] },
        { title: "机器学习概述", desc: "什么是机器学习、监督/无监督学习、基本流程", tags: ["ML 概述", "概念"] },
        { title: "第一个 ML 项目", desc: "用 scikit-learn 完成鸢尾花分类或房价预测", tags: ["scikit-learn", "实战"] },
      ],
    },
    {
      phase: 7,
      title: "机器学习进阶",
      duration: "6-8 周",
      icon: "📊",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      badgeColor: "bg-blue-500/10 text-blue-300",
      steps: [
        { title: "经典算法深入", desc: "线性回归、逻辑回归、决策树、随机森林、SVM", tags: ["算法", "原理"] },
        { title: "模型评估与优化", desc: "交叉验证、偏差-方差权衡、正则化、超参数调优", tags: ["评估", "调参"] },
        { title: "特征工程", desc: "特征选择、特征提取、数据预处理 Pipeline", tags: ["特征", "数据清洗"] },
        { title: "集成学习", desc: "Bagging、Boosting、Stacking、XGBoost 实战", tags: ["XGBoost", "集成"] },
      ],
    },
    {
      phase: 7,
      title: "深度学习",
      duration: "8-10 周",
      icon: "🧠",
      color: "from-violet-500/20 to-purple-500/20",
      borderColor: "border-violet-500/30",
      badgeColor: "bg-violet-500/10 text-violet-300",
      steps: [
        { title: "神经网络基础", desc: "感知机、反向传播、激活函数、梯度消失/爆炸", tags: ["神经网络", "BP"] },
        { title: "PyTorch 框架", desc: "Tensor 操作、自动求导、Module 搭建训练流程", tags: ["PyTorch", "框架"] },
        { title: "CNN 卷积神经网络", desc: "LeNet、AlexNet、VGG、ResNet 架构演进", tags: ["CNN", "图像"] },
        { title: "RNN 与序列模型", desc: "RNN、LSTM、GRU 及其在 NLP 中的应用", tags: ["RNN", "LSTM"] },
        { title: "Transformer 架构", desc: "Self-Attention、Multi-Head、编码器-解码器", tags: ["Transformer", "Attention"] },
      ],
    },
    {
      phase: 7,
      title: "专业方向",
      duration: "8-12 周",
      icon: "🎯",
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/30",
      badgeColor: "bg-amber-500/10 text-amber-300",
      steps: [
        { title: "NLP 方向", desc: "词嵌入、BERT 微调、文本分类、命名实体识别", tags: ["NLP", "BERT"] },
        { title: "CV 方向", desc: "目标检测 (YOLO)、图像分割、数据增强", tags: ["CV", "YOLO"] },
        { title: "强化学习", desc: "MDP、Q-Learning、策略梯度、DQN", tags: ["RL", "DQN"] },
        { title: "生成模型", desc: "VAE、GAN、Diffusion Model 原理与应用", tags: ["GAN", "Diffusion"] },
      ],
    },
    {
      phase: 7,
      title: "大语言模型",
      duration: "6-8 周",
      icon: "🤖",
      color: "from-rose-500/20 to-pink-500/20",
      borderColor: "border-rose-500/30",
      badgeColor: "bg-rose-500/10 text-rose-300",
      steps: [
        { title: "LLM 训练管线", desc: "预训练、SFT、RLHF 完整流程解析", tags: ["预训练", "RLHF"] },
        { title: "Prompt Engineering", desc: "CoT、Few-shot、ReAct 等设计模式", tags: ["Prompt", "技巧"] },
        { title: "RAG 架构", desc: "向量数据库、检索策略、上下文增强生成", tags: ["RAG", "向量库"] },
        { title: "Fine-tuning 实战", desc: "LoRA/QLoRA 微调开源大模型", tags: ["LoRA", "微调"] },
      ],
    },
    {
      phase: 7,
      title: "AI Agent 与前沿",
      duration: "持续学习",
      icon: "🚀",
      color: "from-brand-500/20 to-accent-500/20",
      borderColor: "border-brand-500/30",
      badgeColor: "bg-brand-500/10 text-brand-300",
      steps: [
        { title: "AI Agent 基础", desc: "感知、规划、记忆、工具调用核心组件", tags: ["Agent", "规划"] },
        { title: "Multi-Agent 系统", desc: "角色分工、通信协议、协作与竞争", tags: ["Multi-Agent", "协作"] },
        { title: "MCP 与工具生态", desc: "Model Context Protocol 与 Agent 工具集成", tags: ["MCP", "工具"] },
        { title: "前沿论文追踪", desc: "arXiv 论文精读、复现 SOTA 模型", tags: ["论文", "SOTA"] },
      ],
    },
  ],
};

// 🛡️ AI 安全路线
const securityRoute: RouteDef = {
  id: "security",
  name: "AI 安全与隐私",
  emoji: "🛡️",
  duration: "1-2 月",
  description: "学习 AI 伦理、隐私保护、对抗攻击与防御 — 守护 AI 世界的安全底线",
  target: "适合安全工程师、AI 产品经理、关注 AI 伦理的开发者",
  color: "from-red-500/20 to-orange-500/20",
  borderColor: "border-red-500/30",
  badgeColor: "bg-red-500/10 text-red-300",
  phases: [
    {
      phase: 1,
      title: "认识 AI",
      duration: "30 分钟",
      icon: "🌍",
      color: "from-white/10 to-slate-500/10",
      borderColor: "border-white/20",
      badgeColor: "bg-white/10 text-white",
      steps: [
        { title: "AI 是什么？", desc: "从概念到实践的全景导览——AI 的三次浪潮、AI/ML/DL 的关系、2026 年主流技术栈", tags: ["AI 入门", "技术全景"] },
        { title: "2026 年 AI 能做什么", desc: "编程、创作、研究、工作流的真实案例与工具推荐", tags: ["应用场景", "工具"] },
        { title: "学习路线规划", desc: "速成 vs 基础路线对比、三个黄金学习原则", tags: ["学习路线", "方法论"] },
      ],
    },
    {
      phase: 3,
      title: "AI 伦理与公平性",
      duration: "1-2 周",
      icon: "⚖️",
      color: "from-red-500/20 to-rose-500/20",
      borderColor: "border-red-500/30",
      badgeColor: "bg-red-500/10 text-red-300",
      steps: [
        { title: "AI 偏见与公平性", desc: "理解算法偏见的来源，学习公平性度量与去偏方法", tags: ["偏见", "公平性"] },
        { title: "模型可解释性", desc: "SHAP、LIME、特征归因，让黑盒模型变得透明", tags: ["SHAP", "LIME"] },
        { title: "AI 伦理框架", desc: "AI 伦理原则、负责任 AI、行业规范与法律法规", tags: ["伦理", "法规"] },
      ],
    },
    {
      phase: 3,
      title: "隐私保护 ML",
      duration: "2-3 周",
      icon: "🔒",
      color: "from-orange-500/20 to-amber-500/20",
      borderColor: "border-orange-500/30",
      badgeColor: "bg-orange-500/10 text-orange-300",
      steps: [
        { title: "差分隐私", desc: "理解差分隐私原理，学习在 ML 中应用差分隐私保护", tags: ["差分隐私", "DP"] },
        { title: "联邦学习", desc: "分布式训练不共享数据，保护数据隐私", tags: ["联邦学习", "分布式"] },
        { title: "安全多方计算", desc: "多方协作计算而不暴露各自数据", tags: ["MPC", "加密"] },
      ],
    },
    {
      phase: 4,
      title: "对抗攻击与防御",
      duration: "2-3 周",
      icon: "🛡️",
      color: "from-yellow-500/20 to-lime-500/20",
      borderColor: "border-yellow-500/30",
      badgeColor: "bg-yellow-500/10 text-yellow-300",
      steps: [
        { title: "对抗样本攻击", desc: "FGSM、PGD、C&W 攻击方法，理解模型脆弱性", tags: ["FGSM", "PGD"] },
        { title: "模型逆向与成员推理", desc: "从模型输出推断训练数据，隐私泄露风险", tags: ["逆向", "成员推理"] },
        { title: "防御策略", desc: "对抗训练、输入消毒、鲁棒性评估", tags: ["防御", "鲁棒性"] },
      ],
    },
  ],
};

// 🔧 工程师路线
const engineerRoute: RouteDef = {
  id: "engineer",
  name: "AI 工程与部署",
  emoji: "🔧",
  duration: "2-4 月",
  description: "从模型训练到生产部署全流程 — 掌握 MLOps、模型优化与服务化",
  target: "适合有编程基础，想系统学习 AI 工程化全流程的开发者",
  color: "from-amber-500/20 to-green-500/20",
  borderColor: "border-amber-500/30",
  badgeColor: "bg-amber-500/10 text-amber-300",
  phases: [
    {
      phase: 1,
      title: "认识 AI",
      duration: "30 分钟",
      icon: "🌍",
      color: "from-white/10 to-slate-500/10",
      borderColor: "border-white/20",
      badgeColor: "bg-white/10 text-white",
      steps: [
        { title: "AI 是什么？", desc: "从概念到实践的全景导览——AI 的三次浪潮、AI/ML/DL 的关系、2026 年主流技术栈", tags: ["AI 入门", "技术全景"] },
        { title: "2026 年 AI 能做什么", desc: "编程、创作、研究、工作流的真实案例与工具推荐", tags: ["应用场景", "工具"] },
        { title: "学习路线规划", desc: "速成 vs 基础路线对比、三个黄金学习原则", tags: ["学习路线", "方法论"] },
      ],
    },
    {
      phase: 2,
      title: "机器学习工程化",
      duration: "3-4 周",
      icon: "📊",
      color: "from-amber-500/20 to-yellow-500/20",
      borderColor: "border-amber-500/30",
      badgeColor: "bg-amber-500/10 text-amber-300",
      steps: [
        { title: "特征工程 Pipeline", desc: "从原始数据到特征矩阵的自动化流程", tags: ["特征工程", "Pipeline"] },
        { title: "模型训练与评估", desc: "交叉验证、超参数搜索、模型选择最佳实践", tags: ["训练", "评估"] },
        { title: "实验管理", desc: "MLflow、W&B 追踪实验，管理模型版本", tags: ["MLflow", "W&B"] },
      ],
    },
    {
      phase: 3,
      title: "深度学习工程化",
      duration: "3-4 周",
      icon: "🧠",
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
      badgeColor: "bg-green-500/10 text-green-300",
      steps: [
        { title: "分布式训练", desc: "Data Parallel、Model Parallel、混合精度训练", tags: ["分布式", "混合精度"] },
        { title: "模型优化", desc: "量化、剪枝、蒸馏，压缩模型提升推理速度", tags: ["量化", "剪枝"] },
        { title: "ONNX 与推理加速", desc: "模型导出 ONNX，TensorRT、OpenVINO 推理优化", tags: ["ONNX", "TensorRT"] },
      ],
    },
    {
      phase: 4,
      title: "MLOps 与部署",
      duration: "3-4 周",
      icon: "🚀",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      badgeColor: "bg-blue-500/10 text-blue-300",
      steps: [
        { title: "模型服务化", desc: "FastAPI 部署、Docker 容器化、Kubernetes 编排", tags: ["FastAPI", "Docker"] },
        { title: "CI/CD for ML", desc: "自动化测试、模型版本管理、灰度发布", tags: ["CI/CD", "灰度"] },
        { title: "监控与漂移检测", desc: "数据漂移、概念漂移、性能监控与告警", tags: ["监控", "漂移"] },
      ],
    },
    {
      phase: 5,
      title: "真实项目实战",
      duration: "2-4 周",
      icon: "🌍",
      color: "from-purple-500/20 to-violet-500/20",
      borderColor: "border-purple-500/30",
      badgeColor: "bg-purple-500/10 text-purple-300",
      steps: [
        { title: "推荐系统", desc: "协同过滤、深度学习推荐、召回+排序架构", tags: ["推荐", "召回排序"] },
        { title: "智能客服", desc: "意图识别、RAG 客服、多轮对话系统", tags: ["客服", "对话"] },
        { title: "异常检测", desc: "时序异常、图像缺陷、预测性维护", tags: ["异常检测", "时序"] },
      ],
    },
  ],
};

// 🎨 创意 AI 路线
const creativeRoute: RouteDef = {
  id: "creative",
  name: "AI 内容创作",
  emoji: "🎨",
  duration: "1-2 月",
  description: "掌握 AI 绘画、音乐、视频生成技术 — 用 AI 释放创造力",
  target: "适合设计师、内容创作者、对生成式 AI 感兴趣的开发者",
  color: "from-pink-500/20 to-purple-500/20",
  borderColor: "border-pink-500/30",
  badgeColor: "bg-pink-500/10 text-pink-300",
  phases: [
    {
      phase: 1,
      title: "认识 AI",
      duration: "30 分钟",
      icon: "🌍",
      color: "from-white/10 to-slate-500/10",
      borderColor: "border-white/20",
      badgeColor: "bg-white/10 text-white",
      steps: [
        { title: "AI 是什么？", desc: "从概念到实践的全景导览——AI 的三次浪潮、AI/ML/DL 的关系、2026 年主流技术栈", tags: ["AI 入门", "技术全景"] },
        { title: "2026 年 AI 能做什么", desc: "编程、创作、研究、工作流的真实案例与工具推荐", tags: ["应用场景", "工具"] },
        { title: "学习路线规划", desc: "速成 vs 基础路线对比、三个黄金学习原则", tags: ["学习路线", "方法论"] },
      ],
    },
    {
      phase: 2,
      title: "生成式 AI 基础",
      duration: "2-3 周",
      icon: "🎨",
      color: "from-pink-500/20 to-rose-500/20",
      borderColor: "border-pink-500/30",
      badgeColor: "bg-pink-500/10 text-pink-300",
      steps: [
        { title: "扩散模型原理", desc: "前向扩散、反向生成、DDPM、DDIM 详解", tags: ["Diffusion", "DDPM"] },
        { title: "Stable Diffusion 实战", desc: "文生图、图生图、ControlNet 控制生成", tags: ["SD", "ControlNet"] },
        { title: "VAE 与 GAN", desc: "变分自编码器、生成对抗网络原理与应用", tags: ["VAE", "GAN"] },
      ],
    },
    {
      phase: 3,
      title: "多模态学习",
      duration: "2-3 周",
      icon: "🔗",
      color: "from-purple-500/20 to-violet-500/20",
      borderColor: "border-purple-500/30",
      badgeColor: "bg-purple-500/10 text-purple-300",
      steps: [
        { title: "CLIP 与图文对齐", desc: "对比学习、零样本分类、图文检索", tags: ["CLIP", "零样本"] },
        { title: "视频生成", desc: "Sora 架构、视频扩散模型、时序一致性", tags: ["视频", "Sora"] },
        { title: "音频生成", desc: "音乐生成、语音合成、声音克隆", tags: ["音频", "TTS"] },
      ],
    },
    {
      phase: 4,
      title: "LLM 创意应用",
      duration: "1-2 周",
      icon: "✏️",
      color: "from-cyan-500/20 to-blue-500/20",
      borderColor: "border-cyan-500/30",
      badgeColor: "bg-cyan-500/10 text-cyan-300",
      steps: [
        { title: "创意写作", desc: "用 LLM 辅助创意写作、故事生成、诗歌创作", tags: ["写作", "创意"] },
        { title: "AI 辅助设计", desc: "AI 生成 UI 设计、Logo、品牌视觉", tags: ["设计", "UI"] },
      ],
    },
  ],
};

const allRoutes: RouteDef[] = [fastRoute, foundationRoute, securityRoute, engineerRoute, creativeRoute];

export default function RoadmapPage() {
  const [activeRoute, setActiveRoute] = useState<string>("fast");
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  const route = allRoutes.find((r) => r.id === activeRoute) || fastRoute;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="/roadmap" />

      {/* Hero */}
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            <span className="text-sm text-brand-300">AI 学习路线图</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            选择你的 <span className="text-gradient">学习路线</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            根据你的目标和背景，选择最适合的学习路径
          </p>

          {/* Route Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {allRoutes.map((r) => (
              <button
                key={r.id}
                onClick={() => { setActiveRoute(r.id); setExpandedPhase(1); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  activeRoute === r.id
                    ? `${r.badgeColor} ${r.borderColor} shadow-lg`
                    : "text-slate-400 border-white/10 hover:text-white hover:border-white/20 hover:bg-white/5"
                }`}
              >
                {r.emoji} {r.name}
                <span className="ml-1.5 text-xs opacity-70">{r.duration}</span>
              </button>
            ))}
          </div>

          {/* Active Route Description */}
          <div className={`p-5 rounded-2xl bg-white/5 border border-white/10 max-w-2xl mx-auto`}>
            <p className={`text-base font-medium mb-1 ${route.badgeColor.split(" ")[1]}`}>
              {route.emoji} {route.name}路线
            </p>
            <p className="text-slate-300 text-sm mb-2">{route.description}</p>
            <p className="text-slate-500 text-xs">👥 {route.target}</p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {route.phases.map((phase) => {
              const isExpanded = expandedPhase === phase.phase;
              return (
                <div
                  key={phase.phase}
                  className={`relative rounded-2xl border transition-all ${
                    isExpanded
                      ? `bg-gradient-to-r ${phase.color} ${phase.borderColor}`
                      : "bg-white/5 border-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Phase header */}
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.phase)}
                    className="w-full flex items-center gap-4 p-5 sm:p-6 text-left"
                  >
                    {/* Phase number circle */}
                    <div
                      className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl border-2 transition-all ${
                        isExpanded
                          ? "bg-brand-600 border-brand-400 text-white scale-110"
                          : "bg-white/5 border-white/10 text-slate-400"
                      }`}
                    >
                      {phase.icon}
                    </div>

                    {/* Phase info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-bold">
                          第{phase.phase}阶段：{phase.title}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${phase.badgeColor}`}>
                          {phase.duration}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {phase.steps.length} 个学习模块 · 点击展开详情
                      </p>
                    </div>

                    {/* Expand arrow */}
                    <svg
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                      <div className="space-y-3 ml-0 sm:ml-16">
                        {phase.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/20 transition-all"
                          >
                            {/* Step number */}
                            <div className="shrink-0 w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </div>

                            {/* Step content */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base mb-1">
                                {step.title}
                              </h4>
                              <p className="text-sm text-slate-400 leading-relaxed">
                                {step.desc}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {step.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-white/5 rounded text-xs text-slate-500"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 border border-brand-500/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              选择你的起点，开始学习吧！
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              无论你现在处于哪个阶段，都能在这里找到适合的学习内容
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/knowledge"
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5"
              >
                📚 浏览知识库
              </Link>
              <Link
                href="/tools"
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
              >
                🛠️ 探索 AI 工具
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
