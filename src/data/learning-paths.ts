/**
 * 学习路线编排（2026-05-12 重构）
 * ─────────────────────────────────────────────────────────────
 * 每个阶段使用「显式 articleIds 列表」而不是按 category 过滤：
 *   1. 同一路线内，文章只出现在一个阶段（渲染层会做最终兜底去重）。
 *   2. 阶段内的卡片顺序 = articleIds 顺序，便于「循序渐进」。
 *   3. 第一篇若以 `-guide` 结尾、或为 `ai-000`，渲染端会自动高亮为「📖 学习导览」。
 *   4. 跨路线允许重复（核心文章在多条路线里都是必看）。
 *
 * 路线总览（10 条）：
 *   通用：  fast、foundation
 *   岗位：  pm、ai-app、agent-eng、algo、llm-eng、data-scientist、multimodal-eng、security
 *
 * 该列表里若引用了不存在的文章 ID，渲染端会自动跳过；新加文章后请按需追加到对应阶段。
 */

export interface LearningPhase {
  /** 阶段唯一 ID（仅前端展开/折叠用） */
  id: string;
  title: string;
  emoji: string;
  duration: string;
  description: string;
  /** 按顺序排列的文章 ID 列表；渲染端会过滤无效 ID 并对路线内重复 ID 去重 */
  articleIds: string[];
  /** Tailwind 类：左侧色条 */
  borderColor: string;
  /** Tailwind 类：右侧渐变背景 */
  bgGradient: string;
  /** Tailwind 类：时间线圆点 */
  dotColor: string;
}

export interface LearningRoute {
  id: string;
  name: string;
  emoji: string;
  duration: string;
  description: string;
  target: string;
  /** Tailwind：路线标签底色 + 文字色（合并写在一起） */
  badgeColor: string;
  /** Tailwind：路线说明卡边框色 */
  borderColor: string;
  /** Tailwind：时间线垂直渐变线 */
  lineGradient: string;
  phases: LearningPhase[];
}

// ─────────────────────────────────────────────────────────────
// 1. 🚀 速成路线
// ─────────────────────────────────────────────────────────────
const fastRoute: LearningRoute = {
  id: "fast",
  name: "速成路线",
  emoji: "🚀",
  duration: "2-4 周",
  description: "先学会用，再补基础 — 适合想快速上手 AI 应用的开发者",
  target: "有编程基础，想快速使用 AI 工具的人",
  badgeColor: "bg-cyan-500/20 text-cyan-300",
  borderColor: "border-cyan-500/20",
  lineGradient: "from-cyan-500/30 via-blue-500/30 to-emerald-500/30",
  phases: [
    {
      id: "f1",
      title: "认识 AI",
      emoji: "🌍",
      duration: "30 分钟",
      description: "了解 AI 全景，知道自己要学什么",
      articleIds: ["ai-000"],
      borderColor: "border-l-white",
      bgGradient: "from-white/5 to-transparent",
      dotColor: "bg-white",
    },
    {
      id: "f2",
      title: "Prompt 工程",
      emoji: "✏️",
      duration: "1-2 天",
      description: "学会和 AI 高效沟通",
      articleIds: ["llm-002", "llm-006", "prompt-001"],
      borderColor: "border-l-cyan-500",
      bgGradient: "from-cyan-500/5 to-transparent",
      dotColor: "bg-cyan-500",
    },
    {
      id: "f3",
      title: "大语言模型速通",
      emoji: "🤖",
      duration: "3-5 天",
      description: "Transformer 直觉、RAG、评测与 Token 成本",
      articleIds: ["llm-guide", "dl-004", "llm-003", "llm-014", "token-economics-001"],
      borderColor: "border-l-blue-500",
      bgGradient: "from-blue-500/5 to-transparent",
      dotColor: "bg-blue-500",
    },
    {
      id: "f4",
      title: "AI Agent 上手",
      emoji: "🦾",
      duration: "1 周",
      description: "Agent 概念、ReAct、Function Calling、MCP",
      articleIds: ["agent-guide", "agent-001", "agent-003", "agent-004", "agent-009"],
      borderColor: "border-l-purple-500",
      bgGradient: "from-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
    },
    {
      id: "f5",
      title: "落地与部署",
      emoji: "🚀",
      duration: "1-2 周",
      description: "用 LangChain / vLLM 把应用跑起来",
      articleIds: ["aieng-guide", "llm-app-guide", "llm-011", "llm-012", "aieng-014", "agent-026"],
      borderColor: "border-l-emerald-500",
      bgGradient: "from-emerald-500/5 to-transparent",
      dotColor: "bg-emerald-500",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 2. 📚 基础路线（系统建立知识体系）
// ─────────────────────────────────────────────────────────────
const foundationRoute: LearningRoute = {
  id: "foundation",
  name: "基础路线",
  emoji: "📚",
  duration: "6-12 月",
  description: "循序渐进，系统学习 — 适合零基础或转行建立完整知识体系",
  target: "想深入理解 AI 原理的学习者",
  badgeColor: "bg-emerald-500/20 text-emerald-300",
  borderColor: "border-emerald-500/20",
  lineGradient: "from-emerald-500/30 via-blue-500/30 to-amber-500/30",
  phases: [
    {
      id: "b1",
      title: "认识 AI",
      emoji: "🌍",
      duration: "30 分钟",
      description: "AI 全景导览，建立学习坐标系",
      articleIds: ["ai-000"],
      borderColor: "border-l-white",
      bgGradient: "from-white/5 to-transparent",
      dotColor: "bg-white",
    },
    {
      id: "b2",
      title: "数学基础",
      emoji: "📐",
      duration: "3-4 周",
      description: "线性代数、概率、统计推断、信息论",
      articleIds: ["math-001", "math-003", "math-002", "math-005", "math-004", "math-007"],
      borderColor: "border-l-emerald-500",
      bgGradient: "from-emerald-500/5 to-transparent",
      dotColor: "bg-emerald-500",
    },
    {
      id: "b3",
      title: "机器学习",
      emoji: "📊",
      duration: "6 周",
      description: "经典算法、模型评估、特征工程、集成学习",
      articleIds: [
        "math-ml-guide", "ml-001", "ml-018", "ml-017",
        "ml-002", "ml-006", "ml-012", "ml-004",
        "ml-008", "ml-009", "ml-010", "ml-011",
        "ml-003", "ml-005", "ml-013", "ml-016",
        "ml-019", "ml-020", "ml-021",
      ],
      borderColor: "border-l-blue-500",
      bgGradient: "from-blue-500/5 to-transparent",
      dotColor: "bg-blue-500",
    },
    {
      id: "b4",
      title: "深度学习",
      emoji: "🧠",
      duration: "8 周",
      description: "神经网络、CNN、RNN、Transformer 完整路径",
      articleIds: [
        "dl-guide", "dl-019", "dl-001", "dl-002",
        "dl-007", "dl-008", "dl-009", "dl-010",
        "dl-006", "dl-020", "dl-003", "dl-004",
        "dl-012", "dl-015",
      ],
      borderColor: "border-l-violet-500",
      bgGradient: "from-violet-500/5 to-transparent",
      dotColor: "bg-violet-500",
    },
    {
      id: "b5",
      title: "专业方向（NLP / CV / RL）",
      emoji: "🎯",
      duration: "6-8 周",
      description: "三大经典子领域入门，可按兴趣聚焦其中之一",
      articleIds: [
        "nlp-guide", "nlp-001", "nlp-002", "nlp-003",
        "cv-guide", "cv-004", "cv-009", "cv-003", "cv-001",
        "rl-guide", "rl-001", "rl-010", "rl-002", "rl-003",
      ],
      borderColor: "border-l-amber-500",
      bgGradient: "from-amber-500/5 to-transparent",
      dotColor: "bg-amber-500",
    },
    {
      id: "b6",
      title: "生成式 AI 与多模态",
      emoji: "🎨",
      duration: "3 周",
      description: "Diffusion、VAE、CLIP、多模态大模型入门",
      articleIds: ["genai-guide", "genai-003", "dl-005", "genai-001", "genai-002", "mm-guide", "mm-001", "mm-007"],
      borderColor: "border-l-rose-500",
      bgGradient: "from-rose-500/5 to-transparent",
      dotColor: "bg-rose-500",
    },
    {
      id: "b7",
      title: "大模型与 Agent 启航",
      emoji: "🤖",
      duration: "持续学习",
      description: "进入 LLM 与 AI Agent 世界",
      articleIds: ["llm-guide", "llm-002", "llm-001", "llm-003", "agent-guide", "agent-001", "agent-003", "agent-004"],
      borderColor: "border-l-brand-500",
      bgGradient: "from-brand-500/5 to-transparent",
      dotColor: "bg-brand-500",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 3. 🎨 AI 产品经理
// ─────────────────────────────────────────────────────────────
const pmRoute: LearningRoute = {
  id: "pm",
  name: "AI 产品经理",
  emoji: "🎨",
  duration: "2-4 周",
  description: "理解 AI 能力边界，掌握 AI 产品设计与商业化方法论",
  target: "产品经理、创业者、业务负责人",
  badgeColor: "bg-pink-500/20 text-pink-300",
  borderColor: "border-pink-500/20",
  lineGradient: "from-pink-500/30 via-purple-500/30 to-amber-500/30",
  phases: [
    {
      id: "p1",
      title: "认识 AI",
      emoji: "🌍",
      duration: "30 分钟",
      description: "全景认知：能做什么、不能做什么",
      articleIds: ["ai-000"],
      borderColor: "border-l-pink-500",
      bgGradient: "from-pink-500/5 to-transparent",
      dotColor: "bg-pink-500",
    },
    {
      id: "p2",
      title: "Prompt 与大模型基础",
      emoji: "💬",
      duration: "1 周",
      description: "如何评估模型、估算 Token 成本",
      articleIds: ["llm-guide", "llm-002", "llm-006", "llm-014", "token-economics-001"],
      borderColor: "border-l-purple-500",
      bgGradient: "from-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
    },
    {
      id: "p3",
      title: "Agent 与 AI 应用",
      emoji: "🦾",
      duration: "1 周",
      description: "Agent 产品形态、企业落地",
      articleIds: ["agent-guide", "agent-001", "agent-021", "agent-044", "agent-053"],
      borderColor: "border-l-violet-500",
      bgGradient: "from-violet-500/5 to-transparent",
      dotColor: "bg-violet-500",
    },
    {
      id: "p4",
      title: "商业化、合规与影响",
      emoji: "💼",
      duration: "1 周",
      description: "TCO 计算、监管合规、就业影响",
      articleIds: ["practice-012", "practice-013", "ethics-009", "ethics-015", "entertainment-ai-001"],
      borderColor: "border-l-amber-500",
      bgGradient: "from-amber-500/5 to-transparent",
      dotColor: "bg-amber-500",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 4. 👨‍💻 AI 应用开发工程师
// ─────────────────────────────────────────────────────────────
const aiAppRoute: LearningRoute = {
  id: "ai-app",
  name: "AI 应用开发工程师",
  emoji: "👨‍💻",
  duration: "3-6 月",
  description: "掌握 API 集成、RAG 系统、Agent 开发 — 构建 AI 驱动的应用",
  target: "有后端/全栈基础，想做 AI 应用的工程师",
  badgeColor: "bg-blue-500/20 text-blue-300",
  borderColor: "border-blue-500/20",
  lineGradient: "from-blue-500/30 via-purple-500/30 to-amber-500/30",
  phases: [
    {
      id: "d1",
      title: "认识 AI",
      emoji: "🌍",
      duration: "30 分钟",
      description: "建立 AI 全景视图",
      articleIds: ["ai-000"],
      borderColor: "border-l-white",
      bgGradient: "from-white/5 to-transparent",
      dotColor: "bg-white",
    },
    {
      id: "d2",
      title: "Prompt Engineering",
      emoji: "✏️",
      duration: "1 周",
      description: "从基础到结构化、CoT 与评估",
      articleIds: ["llm-002", "llm-006", "prompt-001", "prompt-002", "prompt-003"],
      borderColor: "border-l-cyan-500",
      bgGradient: "from-cyan-500/5 to-transparent",
      dotColor: "bg-cyan-500",
    },
    {
      id: "d3",
      title: "LLM 基础",
      emoji: "🤖",
      duration: "2 周",
      description: "Transformer 直觉、评测、Token 成本",
      articleIds: ["llm-guide", "dl-004", "llm-001", "llm-014", "token-economics-001", "anthropic-claude"],
      borderColor: "border-l-blue-500",
      bgGradient: "from-blue-500/5 to-transparent",
      dotColor: "bg-blue-500",
    },
    {
      id: "d4",
      title: "RAG 与检索",
      emoji: "📚",
      duration: "2 周",
      description: "向量数据库、Embedding、检索策略",
      articleIds: ["llm-003", "practice-002"],
      borderColor: "border-l-emerald-500",
      bgGradient: "from-emerald-500/5 to-transparent",
      dotColor: "bg-emerald-500",
    },
    {
      id: "d5",
      title: "AI Agent 开发",
      emoji: "🦾",
      duration: "4 周",
      description: "ReAct、Function Calling、MCP、Computer Use",
      articleIds: [
        "agent-guide", "agent-001", "agent-003", "agent-004",
        "agent-009", "mcp-001", "agent-007", "agent-026",
        "agent-028", "agent-054",
      ],
      borderColor: "border-l-purple-500",
      bgGradient: "from-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
    },
    {
      id: "d6",
      title: "工程化与部署",
      emoji: "🚀",
      duration: "3 周",
      description: "LangChain、vLLM、可观测性、企业级架构",
      articleIds: [
        "aieng-guide", "llm-app-guide", "llm-011", "llm-012",
        "llm-020", "aieng-003", "aieng-021", "aieng-023",
        "aieng-014", "aieng-026",
      ],
      borderColor: "border-l-amber-500",
      bgGradient: "from-amber-500/5 to-transparent",
      dotColor: "bg-amber-500",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 5. 🦾 AI Agent 工程师（新增）
// ─────────────────────────────────────────────────────────────
const agentEngRoute: LearningRoute = {
  id: "agent-eng",
  name: "AI Agent 工程师",
  emoji: "🦾",
  duration: "4-6 月",
  description: "专注于自主智能体：感知、规划、工具、记忆与多 Agent 协作",
  target: "有 LLM 应用基础，想深入 Agent 系统的工程师",
  badgeColor: "bg-purple-500/20 text-purple-300",
  borderColor: "border-purple-500/20",
  lineGradient: "from-purple-500/30 via-rose-500/30 to-red-500/30",
  phases: [
    {
      id: "ag1",
      title: "入门基础",
      emoji: "🌍",
      duration: "3 天",
      description: "AI 全景 + LLM 与 Prompt 速通",
      articleIds: ["ai-000", "llm-guide", "llm-002"],
      borderColor: "border-l-white",
      bgGradient: "from-white/5 to-transparent",
      dotColor: "bg-white",
    },
    {
      id: "ag2",
      title: "Agent 基础",
      emoji: "🦾",
      duration: "2 周",
      description: "Agent 概念、ReAct、Reflection",
      articleIds: ["agent-guide", "agent-001", "agent-003", "agent-004", "agent-006", "agent-027"],
      borderColor: "border-l-purple-500",
      bgGradient: "from-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
    },
    {
      id: "ag3",
      title: "工具调用与协议",
      emoji: "🔧",
      duration: "2 周",
      description: "Function Calling、MCP、屏幕/浏览器操作",
      articleIds: ["agent-009", "mcp-001", "agent-028", "agent-054", "agent-036", "aieng019"],
      borderColor: "border-l-cyan-500",
      bgGradient: "from-cyan-500/5 to-transparent",
      dotColor: "bg-cyan-500",
    },
    {
      id: "ag4",
      title: "Multi-Agent 协作",
      emoji: "🤝",
      duration: "3 周",
      description: "多 Agent 设计模式、编排框架对比",
      articleIds: [
        "agent-002", "agent-007", "agent-012", "multi-agent-001",
        "agent-034", "agent-038", "agent-042", "agent-052", "agent-050",
      ],
      borderColor: "border-l-violet-500",
      bgGradient: "from-violet-500/5 to-transparent",
      dotColor: "bg-violet-500",
    },
    {
      id: "ag5",
      title: "记忆与上下文",
      emoji: "🧠",
      duration: "2 周",
      description: "从短期缓存到长期记忆宫殿",
      articleIds: ["agent-005", "agent-025", "agent-029", "agent-032", "agent-023"],
      borderColor: "border-l-blue-500",
      bgGradient: "from-blue-500/5 to-transparent",
      dotColor: "bg-blue-500",
    },
    {
      id: "ag6",
      title: "工程化与评测",
      emoji: "🛠️",
      duration: "2 周",
      description: "Harness、Agentic Engineering、评测体系",
      articleIds: [
        "aieng-010", "aieng-021", "aieng-012",
        "agent-008", "agent-011", "agent-016",
        "agent-021", "agent-044", "agent-017", "agent-019",
      ],
      borderColor: "border-l-amber-500",
      bgGradient: "from-amber-500/5 to-transparent",
      dotColor: "bg-amber-500",
    },
    {
      id: "ag7",
      title: "治理与安全",
      emoji: "🛡️",
      duration: "2 周",
      description: "权限、可观测、运行时治理",
      articleIds: [
        "agent-018", "agent-033", "agent-049",
        "agent-030", "agent-031", "agent-041",
        "agent-046", "agent-051", "agent-053",
        "ai-security-010", "agent-047", "agent-045",
      ],
      borderColor: "border-l-rose-500",
      bgGradient: "from-rose-500/5 to-transparent",
      dotColor: "bg-rose-500",
    },
    {
      id: "ag8",
      title: "前沿专题",
      emoji: "🚀",
      duration: "持续学习",
      description: "自进化 Agent、Compound AI、新形态",
      articleIds: [
        "agent-020", "agent-022", "agent-024", "agent-035",
        "agent-039", "ai-agent-payment-001",
        "coding-output-001", "headless-ai-001",
      ],
      borderColor: "border-l-pink-500",
      bgGradient: "from-pink-500/5 to-transparent",
      dotColor: "bg-pink-500",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 6. 🧠 AI 算法工程师
// ─────────────────────────────────────────────────────────────
const algoRoute: LearningRoute = {
  id: "algo",
  name: "AI 算法工程师",
  emoji: "🧠",
  duration: "6-12 月",
  description: "深入 ML/DL 理论，掌握模型训练与调优",
  target: "有数学/编程基础，想深入 AI 算法原理的工程师",
  badgeColor: "bg-violet-500/20 text-violet-300",
  borderColor: "border-violet-500/20",
  lineGradient: "from-violet-500/30 via-rose-500/30 to-emerald-500/30",
  phases: [
    {
      id: "a1",
      title: "数学基础",
      emoji: "📐",
      duration: "4 周",
      description: "线性代数、概率、信息论、凸优化、数值计算",
      articleIds: [
        "math-001", "math-003", "math-002", "math-005",
        "math-004", "math-006", "math-007", "math-008",
      ],
      borderColor: "border-l-violet-500",
      bgGradient: "from-violet-500/5 to-transparent",
      dotColor: "bg-violet-500",
    },
    {
      id: "a2",
      title: "经典机器学习",
      emoji: "📊",
      duration: "6 周",
      description: "监督/无监督/集成学习、特征工程",
      articleIds: [
        "math-ml-guide", "ml-001", "ml-018", "ml-017",
        "ml-002", "ml-006", "ml-012", "ml-004",
        "ml-008", "ml-009", "ml-003", "ml-005",
        "ml-014", "ml-015", "ml-013",
        "ml-010", "ml-011", "ml-016",
        "ml-019", "ml-021", "ml-020", "ml-022",
      ],
      borderColor: "border-l-blue-500",
      bgGradient: "from-blue-500/5 to-transparent",
      dotColor: "bg-blue-500",
    },
    {
      id: "a3",
      title: "深度学习基础",
      emoji: "🧠",
      duration: "6 周",
      description: "神经网络、优化器、CNN 完整路径",
      articleIds: [
        "dl-guide", "dl-019", "dl-001", "dl-002",
        "dl-007", "dl-008", "dl-009", "dl-010",
        "dl-006", "dl-020",
      ],
      borderColor: "border-l-rose-500",
      bgGradient: "from-rose-500/5 to-transparent",
      dotColor: "bg-rose-500",
    },
    {
      id: "a4",
      title: "序列与高级架构",
      emoji: "🌐",
      duration: "4 周",
      description: "RNN、Transformer、GAN、AE、GNN、迁移、分布式、MoE",
      articleIds: [
        "dl-003", "dl-004", "dl-012", "dl-013",
        "dl-005", "dl-014", "dl-015", "dl-016", "dl-017",
      ],
      borderColor: "border-l-amber-500",
      bgGradient: "from-amber-500/5 to-transparent",
      dotColor: "bg-amber-500",
    },
    {
      id: "a5",
      title: "强化学习",
      emoji: "🎮",
      duration: "4 周",
      description: "MDP → DQN → PPO → MARL → World Model",
      articleIds: [
        "rl-guide", "rl-001", "rl-010", "rl-002",
        "rl-003", "rl-004", "rl-005", "rl-006",
        "rl-007", "rl-008", "rl-009", "rl-011",
      ],
      borderColor: "border-l-emerald-500",
      bgGradient: "from-emerald-500/5 to-transparent",
      dotColor: "bg-emerald-500",
    },
    {
      id: "a6",
      title: "前沿与应用",
      emoji: "🚀",
      duration: "持续学习",
      description: "世界模型、神经符号、推荐系统、合成数据",
      articleIds: ["ml-023", "ai-002", "ai-004", "practice-001", "synthdata-001", "practice-005"],
      borderColor: "border-l-purple-500",
      bgGradient: "from-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 7. 🎯 大模型工程师
// ─────────────────────────────────────────────────────────────
const llmEngRoute: LearningRoute = {
  id: "llm-eng",
  name: "大模型工程师",
  emoji: "🎯",
  duration: "4-8 月",
  description: "深入 LLM 训练、对齐、推理优化与基础设施",
  target: "有深度学习基础，想做大模型底层技术的工程师",
  badgeColor: "bg-amber-500/20 text-amber-300",
  borderColor: "border-amber-500/20",
  lineGradient: "from-amber-500/30 via-blue-500/30 to-purple-500/30",
  phases: [
    {
      id: "l1",
      title: "前置基础",
      emoji: "⚡",
      duration: "2 周",
      description: "NLP 入门 + Transformer + BERT",
      articleIds: ["nlp-guide", "nlp-001", "dl-004", "nlp-002"],
      borderColor: "border-l-amber-500",
      bgGradient: "from-amber-500/5 to-transparent",
      dotColor: "bg-amber-500",
    },
    {
      id: "l2",
      title: "LLM 架构与训练",
      emoji: "🏗️",
      duration: "4 周",
      description: "训练全流程、预训练、长上下文、MoE",
      articleIds: [
        "llm-guide", "llm-001", "llm-022", "llm-008",
        "ai-003", "llm-013", "dl-017", "llm-023", "llm-016",
      ],
      borderColor: "border-l-blue-500",
      bgGradient: "from-blue-500/5 to-transparent",
      dotColor: "bg-blue-500",
    },
    {
      id: "l3",
      title: "对齐与微调",
      emoji: "🎯",
      duration: "3 周",
      description: "RLHF、LoRA/QLoRA/DPO、蒸馏",
      articleIds: ["llm-005", "ethics-005", "ethics-012", "llm-017", "ai-distillation-001"],
      borderColor: "border-l-emerald-500",
      bgGradient: "from-emerald-500/5 to-transparent",
      dotColor: "bg-emerald-500",
    },
    {
      id: "l4",
      title: "推理与优化",
      emoji: "🚀",
      duration: "4 周",
      description: "量化、剪枝、推测解码、FP8、Token 成本",
      articleIds: [
        "llm-015", "llm-024", "aieng-025", "llm-021",
        "infer-001", "infer-002", "mlops-008",
        "llm-018", "token-economics-001",
      ],
      borderColor: "border-l-purple-500",
      bgGradient: "from-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
    },
    {
      id: "l5",
      title: "评测与可观测",
      emoji: "📊",
      duration: "2 周",
      description: "MMLU/Arena、可观测性",
      articleIds: ["llm-010", "llm-014", "llm-020"],
      borderColor: "border-l-cyan-500",
      bgGradient: "from-cyan-500/5 to-transparent",
      dotColor: "bg-cyan-500",
    },
    {
      id: "l6",
      title: "部署、应用与基础设施",
      emoji: "🏭",
      duration: "3 周",
      description: "vLLM/LangChain、RAG、模型生态、算力供给",
      articleIds: [
        "llm-app-guide", "llm-012", "llm-011", "llm-003",
        "llm-009", "llm-019",
        "anthropic-claude", "anthropic-002", "china-llm-scale-001",
        "infra-001", "infra-002", "aieng-016", "aieng-027",
        "ai-chip-china-001", "ai-infra-001",
      ],
      borderColor: "border-l-rose-500",
      bgGradient: "from-rose-500/5 to-transparent",
      dotColor: "bg-rose-500",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 8. 🔬 数据科学家
// ─────────────────────────────────────────────────────────────
const dataScientistRoute: LearningRoute = {
  id: "data-scientist",
  name: "数据科学家",
  emoji: "🔬",
  duration: "4-8 月",
  description: "从数据分析到 AI 建模 — 用数据和 AI 驱动业务决策",
  target: "数据分析师转型、统计学背景、想做 AI 建模的人",
  badgeColor: "bg-cyan-500/20 text-cyan-300",
  borderColor: "border-cyan-500/20",
  lineGradient: "from-cyan-500/30 via-violet-500/30 to-amber-500/30",
  phases: [
    {
      id: "s1",
      title: "认识 AI",
      emoji: "🌍",
      duration: "30 分钟",
      description: "建立全景视图",
      articleIds: ["ai-000"],
      borderColor: "border-l-white",
      bgGradient: "from-white/5 to-transparent",
      dotColor: "bg-white",
    },
    {
      id: "s2",
      title: "数学与统计",
      emoji: "📐",
      duration: "3 周",
      description: "概率、统计推断、信息论、数值计算",
      articleIds: ["math-001", "math-003", "math-005", "math-004", "math-007"],
      borderColor: "border-l-cyan-500",
      bgGradient: "from-cyan-500/5 to-transparent",
      dotColor: "bg-cyan-500",
    },
    {
      id: "s3",
      title: "机器学习核心",
      emoji: "📊",
      duration: "6 周",
      description: "经典模型、特征工程、超参调优",
      articleIds: [
        "math-ml-guide", "ml-001", "ml-017", "ml-018",
        "ml-002", "ml-006", "ml-005", "ml-014", "ml-015",
        "ml-013", "ml-008", "ml-010", "ml-011",
        "ml-016", "ml-019", "ml-021", "ml-020", "ml-022",
      ],
      borderColor: "border-l-blue-500",
      bgGradient: "from-blue-500/5 to-transparent",
      dotColor: "bg-blue-500",
    },
    {
      id: "s4",
      title: "深度学习应用",
      emoji: "🧠",
      duration: "4 周",
      description: "神经网络、CNN/RNN/Transformer 实用层面",
      articleIds: ["dl-guide", "dl-019", "dl-002", "dl-007", "dl-009", "dl-006", "dl-003", "dl-004", "dl-015"],
      borderColor: "border-l-violet-500",
      bgGradient: "from-violet-500/5 to-transparent",
      dotColor: "bg-violet-500",
    },
    {
      id: "s5",
      title: "NLP 应用",
      emoji: "💬",
      duration: "2 周",
      description: "文本分类、摘要、评估指标",
      articleIds: ["nlp-guide", "nlp-001", "nlp-003", "nlp-005", "nlp-010"],
      borderColor: "border-l-emerald-500",
      bgGradient: "from-emerald-500/5 to-transparent",
      dotColor: "bg-emerald-500",
    },
    {
      id: "s6",
      title: "LLM 与 RAG",
      emoji: "🤖",
      duration: "2 周",
      description: "用 LLM 做业务分析与问答",
      articleIds: ["llm-guide", "llm-002", "llm-003", "practice-002"],
      borderColor: "border-l-rose-500",
      bgGradient: "from-rose-500/5 to-transparent",
      dotColor: "bg-rose-500",
    },
    {
      id: "s7",
      title: "MLOps 与工程化",
      emoji: "🚀",
      duration: "3 周",
      description: "实验管理、监控、可靠性",
      articleIds: [
        "mlops-002", "mlops-001", "mlops-005", "mlops-007",
        "mlops-006", "aieng-005", "aieng-007", "aiobs-001",
        "synthdata-001",
      ],
      borderColor: "border-l-amber-500",
      bgGradient: "from-amber-500/5 to-transparent",
      dotColor: "bg-amber-500",
    },
    {
      id: "s8",
      title: "行业应用",
      emoji: "💼",
      duration: "1-2 周",
      description: "推荐、金融、医疗、法律、Science",
      articleIds: [
        "practice-001", "practice-005", "practice-006",
        "practice-007", "practice-008", "finance-001",
        "practice-014", "practice-011", "ai4science-001",
        "practice-009", "legal-ai-001",
      ],
      borderColor: "border-l-pink-500",
      bgGradient: "from-pink-500/5 to-transparent",
      dotColor: "bg-pink-500",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 9. 🌈 多模态 / 生成式 AI 工程师（新增）
// ─────────────────────────────────────────────────────────────
const multimodalEngRoute: LearningRoute = {
  id: "multimodal-eng",
  name: "多模态 / 生成式 AI 工程师",
  emoji: "🌈",
  duration: "3-6 月",
  description: "覆盖 CV、视频、语音、图像生成、3D 与具身智能",
  target: "想做视觉/多模态/生成式 AI 的工程师",
  badgeColor: "bg-rose-500/20 text-rose-300",
  borderColor: "border-rose-500/20",
  lineGradient: "from-rose-500/30 via-pink-500/30 to-purple-500/30",
  phases: [
    {
      id: "mm1",
      title: "入门基础",
      emoji: "🌍",
      duration: "1 周",
      description: "AI 全景 + Transformer + CNN",
      articleIds: ["ai-000", "dl-004", "dl-006"],
      borderColor: "border-l-white",
      bgGradient: "from-white/5 to-transparent",
      dotColor: "bg-white",
    },
    {
      id: "mm2",
      title: "计算机视觉",
      emoji: "👁️",
      duration: "3 周",
      description: "分类、检测、分割、跟踪、3D",
      articleIds: [
        "cv-guide", "cv-004", "cv-009", "cv-003", "dl-020",
        "cv-001", "cv-002", "cv-005", "cv-006",
        "cv-007", "cv-012", "cv-010", "cv-011",
      ],
      borderColor: "border-l-rose-500",
      bgGradient: "from-rose-500/5 to-transparent",
      dotColor: "bg-rose-500",
    },
    {
      id: "mm3",
      title: "多模态学习",
      emoji: "🔗",
      duration: "3 周",
      description: "CLIP、VQA、多模态大模型",
      articleIds: [
        "mm-guide", "mm-001", "mm-002", "mm-003",
        "mm-005", "mm-006", "mm-007", "mm-008",
        "mm-010", "mm-011", "llm-009",
      ],
      borderColor: "border-l-pink-500",
      bgGradient: "from-pink-500/5 to-transparent",
      dotColor: "bg-pink-500",
    },
    {
      id: "mm4",
      title: "生成式 AI",
      emoji: "🎨",
      duration: "4 周",
      description: "Diffusion、GAN、Flow Matching、文生图",
      articleIds: [
        "genai-guide", "genai-003", "genai-001", "genai-002",
        "genai-007", "dl-005", "genai-008", "genai-004",
        "genai-005", "cv-008", "genai-006", "genai-009",
      ],
      borderColor: "border-l-purple-500",
      bgGradient: "from-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
    },
    {
      id: "mm5",
      title: "语音 AI",
      emoji: "🎙️",
      duration: "3 周",
      description: "TTS / ASR / 全双工对话",
      articleIds: ["voice-001", "voice-007", "voice-002", "voice-004", "voice-003", "mm-004", "mm-009", "voice-006"],
      borderColor: "border-l-violet-500",
      bgGradient: "from-violet-500/5 to-transparent",
      dotColor: "bg-violet-500",
    },
    {
      id: "mm6",
      title: "具身智能 / 物理 AI",
      emoji: "🤖",
      duration: "2 周",
      description: "Sim-to-Real、机器人大脑、BCI",
      articleIds: ["physical-001", "physical-002", "agent-040", "agent-043", "agent-048", "agent-037", "ai-002", "aieng-027"],
      borderColor: "border-l-blue-500",
      bgGradient: "from-blue-500/5 to-transparent",
      dotColor: "bg-blue-500",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 10. 🛡️ AI 安全工程师
// ─────────────────────────────────────────────────────────────
const securityRoute: LearningRoute = {
  id: "security",
  name: "AI 安全工程师",
  emoji: "🛡️",
  duration: "3-4 月",
  description: "对抗攻击、红队、隐私、Agent 治理 — 守护 AI 安全底线",
  target: "安全工程师、AI 产品经理、关注 AI 治理的开发者",
  badgeColor: "bg-red-500/20 text-red-300",
  borderColor: "border-red-500/20",
  lineGradient: "from-red-500/30 via-orange-500/30 to-violet-500/30",
  phases: [
    {
      id: "e1",
      title: "安全总览",
      emoji: "🛡️",
      duration: "1 周",
      description: "偏见、公平、可解释",
      articleIds: ["security-guide", "ethics-001", "ethics-002"],
      borderColor: "border-l-red-500",
      bgGradient: "from-red-500/5 to-transparent",
      dotColor: "bg-red-500",
    },
    {
      id: "e2",
      title: "对抗攻击与防御",
      emoji: "⚔️",
      duration: "2 周",
      description: "Adversarial、供应链、漏洞挖掘",
      articleIds: [
        "ai-security-001", "ethics-004", "ai-security-002",
        "ai-security-009", "security-audit-001", "security-audit-002",
        "ai-security-003", "ai-security-004",
      ],
      borderColor: "border-l-orange-500",
      bgGradient: "from-orange-500/5 to-transparent",
      dotColor: "bg-orange-500",
    },
    {
      id: "e3",
      title: "LLM 安全与对齐",
      emoji: "🤖",
      duration: "2 周",
      description: "Sycophancy、Reward Hacking、Judge 可靠性",
      articleIds: [
        "ethics-013", "ai-security-006", "ai-security-012", "ai-security-013",
        "ai-001", "ethics-016", "ethics-011", "ethics-017",
      ],
      borderColor: "border-l-yellow-500",
      bgGradient: "from-yellow-500/5 to-transparent",
      dotColor: "bg-yellow-500",
    },
    {
      id: "e4",
      title: "红队与评估",
      emoji: "🔬",
      duration: "1 周",
      description: "AISI、红队工具、安全基准",
      articleIds: ["ai-security-005", "ai-security-007", "ai-security-008", "ethics-008"],
      borderColor: "border-l-amber-500",
      bgGradient: "from-amber-500/5 to-transparent",
      dotColor: "bg-amber-500",
    },
    {
      id: "e5",
      title: "隐私与联邦学习",
      emoji: "🔒",
      duration: "1 周",
      description: "差分隐私、联邦学习、数据治理",
      articleIds: ["ethics-003", "ml-024", "ethics-014"],
      borderColor: "border-l-emerald-500",
      bgGradient: "from-emerald-500/5 to-transparent",
      dotColor: "bg-emerald-500",
    },
    {
      id: "e6",
      title: "Agent 安全",
      emoji: "🦾",
      duration: "2 周",
      description: "权限、运行时治理、Agent 365",
      articleIds: [
        "agent-018", "agent-033", "agent-049",
        "agent-030", "agent-031", "agent-041",
        "agent-046", "agent-051", "ai-security-010", "agent-047",
      ],
      borderColor: "border-l-violet-500",
      bgGradient: "from-violet-500/5 to-transparent",
      dotColor: "bg-violet-500",
    },
    {
      id: "e7",
      title: "合规、治理与社会",
      emoji: "⚖️",
      duration: "1-2 周",
      description: "AI Act / NIST / 版权 / 军事 / 就业",
      articleIds: [
        "ethics-007", "ethics-009", "ethics-006",
        "ethics-010", "ethics-015",
        "ai-security-011", "entertainment-ai-001",
        "guard-act-001", "agent-045",
      ],
      borderColor: "border-l-purple-500",
      bgGradient: "from-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
export const learningRoutes: LearningRoute[] = [
  fastRoute,
  foundationRoute,
  pmRoute,
  aiAppRoute,
  agentEngRoute,
  algoRoute,
  llmEngRoute,
  dataScientistRoute,
  multimodalEngRoute,
  securityRoute,
];

/** 判断某文章 ID 是否为「学习导览」（用于在阶段卡片里高亮第一篇） */
export function isGuideId(id: string): boolean {
  return id === "ai-000" || id.endsWith("-guide");
}
