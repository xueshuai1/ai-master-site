const fs = require('fs');

const file = 'src/data/tools.ts';
let content = fs.readFileSync(file, 'utf8');

const entries = [
  // 1. prompts.chat - 160,182⭐ → between superpowers (162,309) and transformers (159,683)
  {
    anchor: '    id: "transformers",',
    entry: `  {
    id: "prompts-chat",
    name: "Prompt 分享社区 (f)",
    category: "education",
    description: "最大的 Prompt 分享社区，160,182+ stars。提供海量高质量 Prompt 模板，覆盖编程、写作、数据分析等多种场景，支持按主题分类和社区投票。开发者可以直接复用优秀 Prompt，大幅提升与 AI 交互的效率，是学习和优化 Prompt 工程的首选平台",
    url: "https://github.com/f/prompts.chat",
    tags: ["Prompt分享", "社区", "模板", "AI教育"],
    price: "开源",
    icon: "💬",
    pros: ["海量高质量 Prompt 模板", "社区驱动持续更新", "覆盖多场景多领域", "学习 Prompt 工程的最佳资源"],
    cons: ["内容质量参差不齐", "部分 Prompt 需要特定模型", "缺少系统化分类"],
    useCase: "Prompt 模板查找、AI 交互技巧学习、社区贡献",
    learnMore: "https://github.com/f/prompts.chat",
    githubStars: 160182,
    updatedAt: "2026-04-21",
    forks: 20973,
    language: "HTML",
    createdAt: "2022-12-05T13:54:13Z"
  },`
  },
  // 2. JavaGuide - 155,084⭐ → between transformers (159,683) and github-copilot (150,000)
  {
    anchor: '      id: "github-copilot",',
    entry: `  {
    id: "java-guide",
    name: "JavaGuide (Snailclimb)",
    category: "education",
    description: "Java 全栈知识体系指南，155,084+ stars。涵盖 Java 基础、并发编程、JVM、Spring 全家桶、分布式系统等核心技术栈，同时收录了 AI Agent 在 Java 生态中的应用实践。内容系统全面，是中文 Java 开发者最受欢迎的技术指南之一，也是从 Java 开发者向 AI 工程师转型的必备参考",
    url: "https://github.com/snailclimb/JavaGuide",
    tags: ["Java", "全栈", "技术指南", "AI Agent"],
    price: "开源",
    icon: "☕",
    pros: ["Java 知识体系最全面", "中文社区影响力最大", "内容持续更新维护", "涵盖 AI Agent 相关内容"],
    cons: ["内容量庞大需系统学习", "部分章节更新滞后", "偏重后端前端相对较少"],
    useCase: "Java 全栈学习、AI Agent Java 实践、技术面试准备",
    learnMore: "https://github.com/snailclimb/JavaGuide",
    githubStars: 155084,
    updatedAt: "2026-04-21",
    forks: 46144,
    language: "Java",
    createdAt: "2018-05-07T13:27:00Z"
  },`
  },
  // 3. generative-ai-for-beginners - 109,541⭐ → between hermes-agent and awesome-llm-apps
  {
    anchor: '    id: "awesome-llm-apps",',
    entry: `  {
    id: "generative-ai-for-beginners",
    name: "Generative AI for Beginners (Microsoft)",
    category: "education",
    description: "微软生成式 AI 入门课程，109,541+ stars。微软出品的免费生成式 AI 教程，共 24 课，涵盖 LLM 原理、Prompt Engineering、AI 应用开发、负责任 AI 等核心主题。每节课都有配套的 Jupyter Notebook 代码和 Azure AI 实践，是全球最受欢迎的 AI 入门课程之一，适合从零开始学习生成式 AI 的开发者",
    url: "https://github.com/microsoft/generative-ai-for-beginners",
    tags: ["生成式 AI", "微软", "教程", "入门课程"],
    price: "开源",
    icon: "🎓",
    pros: ["微软出品权威可靠", "24 课系统学习路径", "配套代码和 Azure AI 实践", "从零开始零基础友好"],
    cons: ["基于 Azure 生态部分内容有绑定", "更新频率需跟进前沿", "部分章节偏理论"],
    useCase: "生成式 AI 入门学习、AI 应用开发基础、团队培训教材",
    learnMore: "https://github.com/microsoft/generative-ai-for-beginners",
    githubStars: 109541,
    updatedAt: "2026-04-21",
    forks: 58795,
    language: "Jupyter Notebook",
    createdAt: "2023-06-19T16:28:59Z"
  },`
  },
  // 4. deep-live-cam - 91,252⭐ → between whisper and llms-from-scratch
  {
    anchor: '    id: "llms-from-scratch",',
    entry: `  {
    id: "deep-live-cam",
    name: "Deep Live Cam (Hacksider)",
    category: "multimodal",
    description: "实时人脸替换工具，91,252+ stars。基于深度学习的实时 Deepfake 换脸工具，支持摄像头实时人脸替换和视频处理，提供一键运行脚本和简易 Web 界面。在视频创作、虚拟直播和影视特效领域有广泛应用，是 AI 换脸技术中门槛最低、效果最出色的开源方案之一",
    url: "https://github.com/hacksider/Deep-Live-Cam",
    tags: ["Deepfake", "实时换脸", "计算机视觉", "视频处理"],
    price: "开源",
    icon: "🎭",
    pros: ["实时换脸效果出色", "一键运行门槛低", "支持摄像头和文件处理", "社区活跃更新快"],
    cons: ["存在深度伪造伦理风险", "需要 GPU 加速", "复杂光照下效果不稳定"],
    useCase: "视频创意制作、虚拟直播特效、影视后期制作",
    learnMore: "https://github.com/hacksider/Deep-Live-Cam",
    githubStars: 91252,
    updatedAt: "2026-04-21",
    forks: 13304,
    language: "Python",
    createdAt: "2023-09-24T13:19:31Z"
  },`
  },
  // 5. opencv - 87,181⭐ → between browser-use and awesome-mcp-servers
  {
    anchor: '    id: "awesome-mcp-servers",',
    entry: `  {
    id: "opencv",
    name: "OpenCV",
    category: "multimodal",
    description: "计算机视觉开源库，87,181+ stars。业界最广泛使用的计算机视觉库，提供 2500+ 优化算法，涵盖图像处理、目标检测、人脸识别、深度学习推理等。在 AI Agent 视觉感知、自动驾驶、安防监控等领域是核心基础设施，支持 Python、C++、Java 等多种语言",
    url: "https://github.com/opencv/opencv",
    tags: ["计算机视觉", "图像处理", "目标检测", "AI 基础设施"],
    price: "开源",
    icon: "👁️",
    pros: ["2500+ 优化算法覆盖全面", "多语言支持跨平台", "AI Agent 视觉感知核心", "BSD 协议商业友好"],
    cons: ["C++ 编译安装可能复杂", "部分深度学习功能不如专用框架", "文档组织不够直观"],
    useCase: "图像和视频处理、AI 视觉感知模块、自动驾驶感知系统",
    learnMore: "https://opencv.org",
    githubStars: 87181,
    updatedAt: "2026-04-21",
    forks: 56547,
    language: "C++",
    createdAt: "2012-07-19T09:40:17Z"
  },`
  },
  // 6. ml-for-beginners - 85,318⭐ → between awesome-mcp-servers and ragflow
  {
    anchor: '    id: "ragflow",',
    entry: `  {
    id: "ml-for-beginners",
    name: "ML for Beginners (Microsoft)",
    category: "education",
    description: "微软机器学习入门课程，85,318+ stars。微软出品的免费机器学习教程，共 26 课，涵盖经典 ML 算法（线性回归、决策树、K-Means 等）、深度学习基础、强化学习入门等。每节课都有 Jupyter Notebook 代码和实践练习，是 ML 学习者的首选入门资源，为深入 AI 和 LLM 领域打下坚实基础",
    url: "https://github.com/microsoft/ML-For-Beginners",
    tags: ["机器学习", "微软", "教程", "入门"],
    price: "开源",
    icon: "📚",
    pros: ["26 课系统学习路径", "配套完整代码和练习", "从经典 ML 到深度学习", "微软出品质量有保障"],
    cons: ["不涵盖最新 LLM 技术", "部分内容较基础", "深度学习部分深度有限"],
    useCase: "机器学习入门、AI 基础理论学习、数据科学转 AI",
    learnMore: "https://github.com/microsoft/ML-For-Beginners",
    githubStars: 85318,
    updatedAt: "2026-04-21",
    forks: 20612,
    language: "Jupyter Notebook",
    createdAt: "2021-03-03T01:34:05Z"
  },`
  },
  // 7. cs-video-courses - 80,357⭐ → between ragflow and llm-course
  {
    anchor: '    id: "llm-course",',
    entry: `  {
    id: "cs-video-courses",
    name: "CS Video Courses (Developer-y)",
    category: "education",
    description: "计算机科学视频课程合集，80,357+ stars。收录了大量顶尖大学的计算机科学视频课程资源，涵盖算法、数据结构、操作系统、计算机网络、人工智能、机器学习等核心课程。是自学 CS 和 AI 领域的宝库，帮助开发者系统构建计算机科学知识体系，为深入学习 AI 技术提供理论支撑",
    url: "https://github.com/Developer-Y/cs-video-courses",
    tags: ["视频课程", "CS 教育", "自学资源", "AI 基础"],
    price: "开源",
    icon: "🎬",
    pros: ["顶尖大学课程免费开放", "覆盖 CS 全领域包括 AI", "视频学习更直观易懂", "系统化知识构建"],
    cons: ["主要是索引链接非原创内容", "部分课程较老旧", "需要自律自学"],
    useCase: "CS 系统自学、AI 理论基础补充、大学课程替代",
    learnMore: "https://github.com/Developer-Y/cs-video-courses",
    githubStars: 80357,
    updatedAt: "2026-04-21",
    forks: 11094,
    language: "None",
    createdAt: "2016-10-21T17:02:11Z"
  },`
  },
  // 8. netdata - 78,515⭐ → between llm-course and vllm
  {
    anchor: '    id: "vllm",',
    entry: `  {
    id: "netdata",
    name: "Netdata",
    category: "devops",
    description: "AI 全栈可观测性平台，78,515+ stars。实时系统监控和可观测性平台，提供 800+ 指标的秒级采集和可视化，内置 AI 异常检测和告警功能。在 AI 基础设施中扮演重要角色——实时监控 GPU 利用率、模型推理延迟、API 响应时间等关键指标，是 MLOps 和 AI 系统运维的首选工具",
    url: "https://github.com/netdata/netdata",
    tags: ["系统监控", "AI 运维", "可观测性", "MLOps"],
    price: "开源",
    icon: "📊",
    pros: ["800+ 指标秒级采集", "AI 异常检测告警", "GPU 和 AI 推理监控支持", "零配置开箱即用"],
    cons: ["大规模部署需要优化", "自定义指标配置有学习成本", "云原生方案有付费版"],
    useCase: "AI 系统监控、GPU 利用率监控、MLOps 基础设施运维",
    learnMore: "https://www.netdata.cloud",
    githubStars: 78515,
    updatedAt: "2026-04-21",
    forks: 6417,
    language: "C",
    createdAt: "2013-06-17T18:39:10Z"
  },`
  },
  // 9. d2l-zh - 77,310⭐ → between vllm and paddleocr
  {
    anchor: '    id: "paddleocr",',
    entry: `  {
    id: "d2l-zh",
    name: "动手学深度学习（D2L 中文版）",
    category: "education",
    description: "动手学深度学习中文版，77,310+ stars。由李沐等学者翻译和完善的深度学习教材，基于 MXNet 和 PyTorch 实现，涵盖线性回归、CNN、RNN、Transformer 等核心内容。每章都有可运行的 Jupyter Notebook 代码，理论与实践并重，是全球最畅销的 AI 教材之一。中文版让中文读者零障碍学习深度学习，为 LLM 和 AI Agent 开发打下坚实理论基础",
    url: "https://github.com/d2l-ai/d2l-zh",
    tags: ["深度学习", "中文教材", "Jupyter", "AI 基础"],
    price: "开源",
    icon: "📖",
    pros: ["全球最畅销 AI 教材中文版", "理论与实践并重", "可运行的 Jupyter 代码", "零门槛中文阅读"],
    cons: ["需要一定数学基础", "部分内容需要 GPU", "更新节奏需跟进原版"],
    useCase: "深度学习系统学习、AI 理论基础构建、LLM 原理前置知识",
    learnMore: "https://zh.d2l.ai",
    githubStars: 77310,
    updatedAt: "2026-04-21",
    forks: 12242,
    language: "Python",
    createdAt: "2017-08-23T04:40:24Z"
  },`
  },
  // 10. tesseract - 73,620⭐ → between lobehub and prompt-engineering-guide
  {
    anchor: '    id: "prompt-engineering-guide",',
    entry: `  {
    id: "tesseract",
    name: "Tesseract OCR",
    category: "multimodal",
    description: "Google 开源 OCR 引擎，73,620+ stars。业界最流行的开源光学字符识别引擎，支持 100+ 语言的文字识别，提供高精度文本提取能力。在 AI Agent 工作流中扮演关键角色——将扫描件、图片中的文字提取为机器可读文本，是文档数字化、RAG 系统数据预处理、多模态 AI 应用的基础设施",
    url: "https://github.com/tesseract-ocr/tesseract",
    tags: ["OCR", "文字识别", "文档处理", "多语言"],
    price: "开源",
    icon: "🔤",
    pros: ["100+ 语言文字识别", "Apache 2.0 协议商业友好", "AI 数据预处理核心组件", "Google 维护质量可靠"],
    cons: ["手写体识别精度有限", "复杂版面解析能力弱", "配置训练数据有门槛"],
    useCase: "文档数字化、图片文字提取、RAG 系统 OCR 预处理",
    learnMore: "https://github.com/tesseract-ocr/tesseract",
    githubStars: 73620,
    updatedAt: "2026-04-21",
    forks: 10610,
    language: "C++",
    createdAt: "2014-08-12T18:04:59Z"
  },`
  },
];

// Reverse order so earlier anchors aren't shifted
entries.reverse();

for (const item of entries) {
  const idx = content.indexOf(item.anchor);
  if (idx === -1) {
    console.log(`WARNING: Could not find anchor: ${item.anchor}`);
    continue;
  }
  content = content.slice(0, idx) + item.entry + '\n  ' + content.slice(idx);
  console.log(`Inserted: ${item.entry.match(/id: "([^"]+)"/)[1]}`);
}

fs.writeFileSync(file, content);
console.log('Done! All entries inserted.');
