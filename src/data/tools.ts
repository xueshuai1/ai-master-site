// AI Tools directory data

export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  tags: string[];
  price: "免费" | "开源" | "付费" | "免费+付费";
  icon: string;
}

export const toolCategories = [
  { key: "all", label: "全部", icon: "🔧" },
  { key: "llm", label: "大语言模型", icon: "🤖" },
  { key: "framework", label: "开发框架", icon: "⚙️" },
  { key: "data", label: "数据处理", icon: "📊" },
  { key: "vision", label: "图像视觉", icon: "🎨" },
  { key: "audio", label: "语音音频", icon: "🎙️" },
  { key: "agent", label: "智能体平台", icon: "🦾" },
];

export const tools: Tool[] = [
  // 大语言模型
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "llm",
    description: "OpenAI 的对话式 AI，支持文本生成、代码编写、数据分析等多场景应用",
    url: "https://chat.openai.com",
    tags: ["对话", "文本生成", "代码"],
    price: "免费+付费",
    icon: "💬",
  },
  {
    id: "claude",
    name: "Claude",
    category: "llm",
    description: "Anthropic 的 AI 助手，擅长长文本理解、代码生成和安全对话",
    url: "https://claude.ai",
    tags: ["对话", "长文本", "安全"],
    price: "免费+付费",
    icon: "🧠",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    category: "llm",
    description: "Google 的多模态大模型，支持文本、图像、音频等多模态理解",
    url: "https://gemini.google.com",
    tags: ["多模态", "搜索集成", "对话"],
    price: "免费+付费",
    icon: "✨",
  },
  {
    id: "llama",
    name: "Llama (Meta)",
    category: "llm",
    description: "Meta 开源大语言模型，支持本地部署和微调，社区生态丰富",
    url: "https://llama.meta.com",
    tags: ["开源", "本地部署", "微调"],
    price: "开源",
    icon: "🦙",
  },
  // 开发框架
  {
    id: "langchain",
    name: "LangChain",
    category: "framework",
    description: "构建 LLM 应用的开发框架，支持链式调用、Agent、RAG 等模式",
    url: "https://www.langchain.com",
    tags: ["LLM 应用", "RAG", "Agent"],
    price: "开源",
    icon: "⛓️",
  },
  {
    id: "pytorch",
    name: "PyTorch",
    category: "framework",
    description: "Facebook 的深度学习框架，动态图机制，研究者和工业界首选",
    url: "https://pytorch.org",
    tags: ["深度学习", "训练", "推理"],
    price: "开源",
    icon: "🔥",
  },
  {
    id: "tensorflow",
    name: "TensorFlow",
    category: "framework",
    description: "Google 的端到端机器学习平台，适合大规模生产部署",
    url: "https://www.tensorflow.org",
    tags: ["机器学习", "部署", "移动端"],
    price: "开源",
    icon: "📦",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    category: "framework",
    description: "最大的 AI 模型社区，提供 Transformers 库和 Model Hub",
    url: "https://huggingface.co",
    tags: ["模型库", "Transformers", "社区"],
    price: "免费+付费",
    icon: "🤗",
  },
  // 数据处理
  {
    id: "pandas",
    name: "Pandas",
    category: "data",
    description: "Python 数据分析标准库，提供 DataFrame 结构和丰富的数据处理功能",
    url: "https://pandas.pydata.org",
    tags: ["数据分析", "表格", "清洗"],
    price: "开源",
    icon: "🐼",
  },
  {
    id: "polars",
    name: "Polars",
    category: "data",
    description: "Rust 编写的高性能 DataFrame 库，比 Pandas 快 10-100 倍",
    url: "https://pola.rs",
    tags: ["高性能", "数据分析", "Rust"],
    price: "开源",
    icon: "⚡",
  },
  // 图像视觉
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    category: "vision",
    description: "开源文生图模型，支持图像生成、编辑、Inpainting 等",
    url: "https://stability.ai",
    tags: ["文生图", "开源", "创意"],
    price: "开源",
    icon: "🎨",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    category: "vision",
    description: "高质量 AI 图像生成工具，擅长艺术风格和概念设计",
    url: "https://www.midjourney.com",
    tags: ["文生图", "艺术", "设计"],
    price: "付费",
    icon: "🖼️",
  },
  // 语音音频
  {
    id: "whisper",
    name: "OpenAI Whisper",
    category: "audio",
    description: "开源语音识别模型，支持多语言转录和翻译",
    url: "https://github.com/openai/whisper",
    tags: ["语音识别", "多语言", "转录"],
    price: "开源",
    icon: "🎙️",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    category: "audio",
    description: "高质量 AI 语音合成平台，支持声音克隆和多语言",
    url: "https://elevenlabs.io",
    tags: ["语音合成", "克隆", "多语言"],
    price: "免费+付费",
    icon: "🗣️",
  },
  // 智能体平台
  {
    id: "crewai",
    name: "CrewAI",
    category: "agent",
    description: "多智能体协作框架，定义角色、任务和流程，让 AI Agents 协同工作",
    url: "https://www.crewai.com",
    tags: ["多智能体", "协作", "工作流"],
    price: "开源",
    icon: "👥",
  },
  {
    id: "autogen",
    name: "AutoGen (Microsoft)",
    category: "agent",
    description: "微软开源多智能体框架，支持对话式 Agent 编程",
    url: "https://microsoft.github.io/autogen/",
    tags: ["多智能体", "对话", "微软"],
    price: "开源",
    icon: "🤖",
  },
  {
    id: "dify",
    name: "Dify",
    category: "agent",
    description: "开源 LLM 应用开发平台，可视化编排 Agent 工作流",
    url: "https://dify.ai",
    tags: ["低代码", "工作流", "可视化"],
    price: "开源",
    icon: "🔮",
  },
];
