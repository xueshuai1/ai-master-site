import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('src/data/tools.ts', 'utf-8');

// Tool data: id -> {pros, cons, useCase, learnMore}
const TOOL_DATA = {
  "swe-agent": {
    pros: ["自动修复 GitHub Issue，端到端编码", "Agent 工具调用支持丰富", "开源免费可自部署"],
    cons: ["仅适用于 Python 项目", "复杂 Issue 成功率不稳定", "需要 GPT-4/Claude API Key"],
    useCase: "自动修复代码库 Issue、Bug 修复自动化",
    learnMore: "https://swe-agent.com"
  },
  "openmanus": {
    pros: ["开源 Manus 替代方案", "通用 AI Agent 能力", "社区驱动开发"],
    cons: ["功能不如 Manus 完善", "文档较少", "稳定性待验证"],
    useCase: "自主任务执行、端到端 AI Agent 实验",
    learnMore: "https://github.com/mannaandpoem/OpenManus"
  },
  "conductor": {
    pros: ["多 Agent 编排协调", "灵活的任务分发", "支持复杂工作流"],
    cons: ["社区较小", "文档不完善", "学习门槛较高"],
    useCase: "多 Agent 协作编排、复杂任务分发",
    learnMore: "https://github.com/conductor-oss/conductor"
  },
  "jetbrains-air": {
    pros: ["JetBrains IDE 深度集成", "代码理解能力强", "支持多语言"],
    cons: ["需付费订阅", "仅支持 JetBrains 生态", "响应速度偶有延迟"],
    useCase: "JetBrains IDE 内 AI 编程辅助",
    learnMore: "https://www.jetbrains.com/ai/"
  },
  "copaw": {
    pros: ["Claude Code 增强工具", "简化配置流程", "开源免费"],
    cons: ["依赖 Claude Code", "功能较单一", "社区较小"],
    useCase: "Claude Code 配置管理和增强",
    learnMore: "https://github.com/nicholasgriffintn/copaw"
  },
  "deerflow": {
    pros: ["AI 研究搜索 Agent", "自动化信息搜集", "深度分析能力"],
    cons: ["相对小众", "文档较少", "搜索结果质量依赖模型"],
    useCase: "自动化研究、深度信息搜索",
    learnMore: "https://github.com/anthropics/deerflow"
  },
  "owl-camel": {
    pros: ["多 Agent 协作框架", "支持多种角色定义", "CAMEL 研究团队维护"],
    cons: ["学习曲线陡峭", "复杂任务调试困难", "文档不完善"],
    useCase: "多 Agent 协作研究、角色扮演任务",
    learnMore: "https://github.com/camel-ai/owl"
  },
  "letta": {
    pros: ["持久记忆 AI Agent", "支持长对话历史", "开源可自部署"],
    cons: ["配置复杂", "内存占用较大", "文档较少"],
    useCase: "需要长期记忆的 AI 对话、个人助手",
    learnMore: "https://docs.letta.com"
  },
  "mem-ai": {
    pros: ["个人知识自动组织", "AI 搜索和关联", "跨平台同步"],
    cons: ["免费版功能有限", "隐私数据存储第三方", "中文支持一般"],
    useCase: "个人知识管理、笔记 AI 搜索",
    learnMore: "https://mem.ai"
  },
  "mem-ai-team": {
    pros: ["团队知识共享", "AI 驱动知识发现", "协作搜索"],
    cons: ["付费使用", "团队规模有限制", "集成工具较少"],
    useCase: "团队知识库管理、协作信息检索",
    learnMore: "https://mem.ai/teams"
  },
  "reclaim-ai": {
    pros: ["智能日历调度", "自动优化会议时间", "Google/Outlook 集成"],
    cons: ["功能集中在日历场景", "免费版限制多", "复杂调度能力有限"],
    useCase: "智能日历管理、会议自动排期",
    learnMore: "https://reclaim.ai"
  },
  "khoj": {
    pros: ["开源个人 AI 搜索", "支持多种数据源", "隐私优先本地部署"],
    cons: ["配置门槛较高", "搜索结果质量依赖模型", "社区较小"],
    useCase: "个人数据 AI 搜索、本地知识库检索",
    learnMore: "https://khoj.dev"
  },
  "continue-dev": {
    pros: ["开源 VS Code AI 编码插件", "支持多模型", "本地优先"],
    cons: ["功能不如 Copilot 成熟", "需自行配置模型", "文档较少"],
    useCase: "VS Code 内 AI 辅助编程、开源编程插件",
    learnMore: "https://continue.dev"
  },
  "aichat": {
    pros: ["命令行 AI 聊天", "支持多模型", "轻量级"],
    cons: ["无 GUI 界面", "功能较基础", "需配置 API Key"],
    useCase: "终端内快速 AI 对话、脚本集成",
    learnMore: "https://github.com/sigoden/aichat"
  },
  "google-notebooklm": {
    pros: ["基于个人文档的 AI 问答", "自动摘要和笔记", "Google 生态集成"],
    cons: ["仅支持 Google 文档", "免费版功能有限", "不支持实时联网"],
    useCase: "个人文档 AI 问答、学习笔记整理",
    learnMore: "https://notebooklm.google.com"
  },
  "gemini-notebooks": {
    pros: ["Jupyter Notebook AI 辅助", "Gemini 模型集成", "代码生成和解释"],
    cons: ["依赖 Google 账号", "功能较新不够成熟", "离线不可用"],
    useCase: "数据分析 Notebook AI 辅助、Python 学习",
    learnMore: "https://colab.research.google.com"
  },
  "multica": {
    pros: ["多 Agent 协作平台", "可视化编排", "支持多种 AI 模型"],
    cons: ["相对较新", "文档不完善", "社区较小"],
    useCase: "多 Agent 工作流构建、AI 任务自动化",
    learnMore: "https://multica.ai"
  },
  "mcp-chrome": {
    pros: ["Chrome 浏览器 MCP 服务器", "网页自动化操作", "开发者友好"],
    cons: ["仅支持 Chrome", "需要本地运行", "安全性需自行把控"],
    useCase: "浏览器自动化、网页信息提取",
    learnMore: "https://github.com/nickmango/mcp-chrome"
  },
  "mcp-registry": {
    pros: ["MCP 服务器发现和注册", "集中管理工具", "开源社区驱动"],
    cons: ["生态初期", "服务器质量参差不齐", "文档不完善"],
    useCase: "MCP 服务器发现和管理、工具集成",
    learnMore: "https://github.com/modelcontextprotocol/registry"
  },
  "desktop-commander-mcp": {
    pros: ["桌面文件操作 MCP 服务器", "文件读写搜索能力", "本地优先"],
    cons: ["仅限桌面操作", "权限管理需谨慎", "仅支持本地"],
    useCase: "Agent 桌面文件管理、本地文件搜索",
    learnMore: "https://github.com/wonderwhy-er/DesktopCommanderMCP"
  },
  "mcp-playwright": {
    pros: ["Playwright 浏览器自动化 MCP", "支持多浏览器", "开发者友好"],
    cons: ["需要 Node.js 环境", "配置较复杂", "反爬场景受限"],
    useCase: "网页自动化测试、浏览器操作 Agent",
    learnMore: "https://github.com/executeautomation/mcp-playwright"
  },
  "awesome-mcp-servers": {
    pros: ["MCP 服务器大全", "分类清晰", "社区维护更新频繁"],
    cons: ["仅列表无工具本身", "质量需自行评估", "部分项目较新"],
    useCase: "发现 MCP 服务器、了解 MCP 生态",
    learnMore: "https://github.com/punkpeye/awesome-mcp-servers"
  },
  "mobile-mcp": {
    pros: ["移动端 MCP 服务器", "手机操作自动化", "跨平台支持"],
    cons: ["移动端限制较多", "配置复杂", "功能有限"],
    useCase: "手机自动化操作、移动端 Agent 集成",
    learnMore: "https://github.com/Garoth/mobile-mcp"
  },
  "spec-workflow-mcp": {
    pros: ["规格驱动开发 MCP", "规范自动检查", "提升代码质量"],
    cons: ["学习门槛高", "仅适用于特定流程", "社区较小"],
    useCase: "规格驱动开发流程自动化、代码规范检查",
    learnMore: "https://github.com/nicholasgriffintn/spec-workflow-mcp"
  },
  "gemini-cli": {
    pros: ["Gemini 模型命令行访问", "多轮对话支持", "Google 生态集成"],
    cons: ["需 Google API Key", "功能较基础", "响应速度一般"],
    useCase: "终端内 Gemini 对话、脚本集成 AI",
    learnMore: "https://ai.google.dev/docs"
  },
  "openhands": {
    pros: ["开源编码 Agent", "自主修复 Bug", "Docker 沙箱安全"],
    cons: ["资源消耗大", "复杂任务成功率一般", "配置门槛较高"],
    useCase: "自主编码任务、Bug 自动修复",
    learnMore: "https://openhands.ai"
  },
  "cc-switch": {
    pros: ["Claude Code 模型切换工具", "简化配置", "开源免费"],
    cons: ["仅适用于 Claude Code", "功能单一", "文档较少"],
    useCase: "Claude Code 多模型快速切换",
    learnMore: "https://github.com/nicholasgriffintn/cc-switch"
  },
  "googleworkspace-cli": {
    pros: ["Google Workspace CLI 工具", "邮件日历 Drive 操作", "脚本友好"],
    cons: ["需 Google API 配置", "功能较基础", "文档不完善"],
    useCase: "Google Workspace 自动化、命令行管理",
    learnMore: "https://github.com/abhayagarwal/googleworkspace-cli"
  },
  "mac-cli": {
    pros: ["macOS 自动化 CLI", "系统控制能力", "脚本集成友好"],
    cons: ["仅 macOS 支持", "功能较分散", "文档较少"],
    useCase: "macOS 系统自动化、终端脚本集成",
    learnMore: "https://github.com/nickmango/mac-cli"
  },
  "mmx-cli": {
    pros: ["MiniMax 模型 CLI 工具", "多模态支持", "API 集成简单"],
    cons: ["仅支持 MiniMax", "功能较基础", "社区较小"],
    useCase: "MiniMax 模型快速调用、多模态实验",
    learnMore: "https://platform.minimaxi.com"
  },
  "larksuite-cli": {
    pros: ["飞书套件 CLI 工具", "消息日历文档操作", "中文生态友好"],
    cons: ["仅支持飞书", "需飞书 API 配置", "功能覆盖不全"],
    useCase: "飞书自动化操作、命令行管理飞书资源",
    learnMore: "https://open.feishu.cn"
  },
  "everything-claude-code": {
    pros: ["Claude Code 技巧大全", "社区驱动", "持续更新"],
    cons: ["非工具本身而是指南", "内容质量参差", "非官方维护"],
    useCase: "学习 Claude Code 最佳实践",
    learnMore: "https://github.com/nicholasgriffintn/everything-claude-code"
  },
  "superpowers": {
    pros: ["Claude Code 增强插件集", "丰富工具能力", "开源免费"],
    cons: ["仅适用于 Claude Code", "部分功能不稳定", "文档较少"],
    useCase: "Claude Code 功能增强、扩展工具集",
    learnMore: "https://github.com/nicholasgriffintn/superpowers"
  },
  "awesome-claude-code": {
    pros: ["Claude Code 资源大全", "分类清晰", "社区维护"],
    cons: ["仅列表非工具", "需自行筛选", "部分链接失效"],
    useCase: "发现 Claude Code 插件和资源",
    learnMore: "https://github.com/nicholasgriffintn/awesome-claude-code"
  },
  "antigravity-skills": {
    pros: ["AI 编程技能集合", "提升编码效率", "开源"],
    cons: ["内容较抽象", "学习门槛高", "文档较少"],
    useCase: "AI 辅助编程技能学习",
    learnMore: "https://github.com/nicholasgriffintn/antigravity-skills"
  },
  "openviking": {
    pros: ["开源 AI Agent 框架", "灵活可扩展", "社区驱动"],
    cons: ["生态较小", "文档不完善", "学习曲线陡峭"],
    useCase: "自定义 AI Agent 构建、实验性项目",
    learnMore: "https://github.com/openviking/openviking"
  },
  "agent-skills": {
    pros: ["Agent 技能市场", "可复用能力", "开源社区"],
    cons: ["相对较新", "技能质量参差", "文档较少"],
    useCase: "发现和复用 Agent 技能",
    learnMore: "https://github.com/nicholasgriffintn/agent-skills"
  },
  "seomachine": {
    pros: ["AI SEO 自动化工具", "网站优化建议", "内容生成"],
    cons: ["SEO 效果因网站而异", "部分功能需付费", "竞争产品多"],
    useCase: "网站 SEO 优化、自动化 SEO 审计",
    learnMore: "https://seomachine.ai"
  },
  "jest": {
    pros: ["JavaScript 最流行测试框架", "零配置开箱即用", "快照测试和模拟强大"],
    cons: ["并行执行较慢", "大型项目配置复杂", "TypeScript 需额外配置"],
    useCase: "JavaScript/TypeScript 单元测试、快照测试",
    learnMore: "https://jestjs.io/docs"
  },
  "vitest": {
    pros: ["Vite 原生测试框架", "极速执行", "与 Vite 生态无缝集成"],
    cons: ["生态不如 Jest 成熟", "部分 Jest 插件不兼容", "大型项目经验较少"],
    useCase: "Vite 项目单元测试、极速测试执行",
    learnMore: "https://vitest.dev/guide"
  },
  "pytest": {
    pros: ["Python 最流行测试框架", "fixture 机制灵活", "插件生态丰富"],
    cons: ["异步测试需额外插件", "大型套件执行较慢", "配置选项多易混乱"],
    useCase: "Python 单元测试、集成测试",
    learnMore: "https://docs.pytest.org"
  },
  "playwright-bdd": {
    pros: ["Playwright BDD 测试", "自然语言场景定义", "跨浏览器支持"],
    cons: ["社区较小", "文档不完善", "学习门槛较高"],
    useCase: "BDD 风格端到端测试、非技术人员参与测试",
    learnMore: "https://playwright.dev"
  },
  "cucumber-js": {
    pros: ["Gherkin 自然语言场景", "非技术人员可编写", "跨语言支持"],
    cons: ["维护成本较高", "执行速度较慢", "调试困难"],
    useCase: "BDD 验收测试、业务需求驱动测试",
    learnMore: "https://cucumber.io/docs"
  },
  "behave": {
    pros: ["Python BDD 框架", "Gherkin 语法支持", "易于集成 pytest"],
    cons: ["仅限 Python", "生态不如 pytest", "文档较少"],
    useCase: "Python BDD 验收测试、行为驱动开发",
    learnMore: "https://behave.readthedocs.io"
  },
  "argo-cd": {
    pros: ["GitOps 持续部署标杆", "Kubernetes 原生支持", "多集群管理"],
    cons: ["学习曲线陡峭", "非 K8s 场景不支持", "配置 YAML 较复杂"],
    useCase: "Kubernetes GitOps 部署、多集群管理",
    learnMore: "https://argo-cd.readthedocs.io"
  },
  "flux": {
    pros: ["CNCF GitOps 标准实现", "Kubernetes 原生", "轻量级"],
    cons: ["功能不如 ArgoCD 丰富", "UI 较基础", "学习文档分散"],
    useCase: "Kubernetes GitOps 自动化部署",
    learnMore: "https://fluxcd.io/docs"
  },
  "openapi-generator": {
    pros: ["OpenAPI 规范代码生成", "支持 50+ 语言框架", "减少样板代码"],
    cons: ["生成代码质量一般需调整", "大型 API 定义慢", "配置选项复杂"],
    useCase: "API 客户端/服务端代码自动生成",
    learnMore: "https://openapi-generator.tech/docs"
  },
  "domain-driven-hexagon": {
    pros: ["DDD + 六边形架构指南", "实战项目示例", "清晰的分层设计"],
    cons: ["偏教程非工具", "学习门槛高", "仅 TypeScript"],
    useCase: "学习 DDD 和六边形架构、复杂系统设计",
    learnMore: "https://github.com/Sairyss/domain-driven-hexagon"
  },
  "learn-go-with-tests": {
    pros: ["Go 语言 TDD 学习指南", "测试驱动实践", "免费开源"],
    cons: ["偏教程非工具", "内容较基础", "高级主题覆盖不足"],
    useCase: "Go 语言入门、TDD 实践学习",
    learnMore: "https://quii.gitbook.io/learn-go-with-tests"
  },
  "clean-ts-api": {
    pros: ["Clean Architecture TypeScript 实践", "API 开发模板", "代码质量高"],
    cons: ["偏教程非工具", "学习门槛较高", "社区较小"],
    useCase: "Clean Architecture API 开发学习",
    learnMore: "https://github.com/ArthurSarquis/clean-ts-api"
  },
  "awesome-eventstorming": {
    pros: ["Event Storming 资源大全", "DDD 事件风暴实践", "分类清晰"],
    cons: ["仅列表非工具", "偏方法论", "需配合其他工具"],
    useCase: "学习 Event Storming、DDD 工作坊",
    learnMore: "https://github.com/ardalis/awesome-eventstorming"
  },
  "leantime": {
    pros: ["开源项目管理平台", "适合小团队", "看板+甘特图"],
    cons: ["功能不如 Jira 丰富", "生态较小", "移动端体验一般"],
    useCase: "小团队项目管理、敏捷开发看板",
    learnMore: "https://docs.leantime.io"
  },
  "fastapi-realworld": {
    pros: ["FastAPI 实战项目示例", "完整 CRUD API", "最佳实践参考"],
    cons: ["偏示例非工具", "功能较基础", "不覆盖高级场景"],
    useCase: "FastAPI 学习参考、API 项目模板",
    learnMore: "https://github.com/nsidnev/fastapi-realworld-example-app"
  },
  "promptfoo": {
    pros: ["LLM 安全测试工具", "红队测试自动化", "支持多模型对比"],
    cons: ["配置较复杂", "社区较小", "文档不够详细"],
    useCase: "LLM 安全评估、红队测试",
    learnMore: "https://www.promptfoo.dev/docs"
  },
  "garak": {
    pros: ["AI 漏洞扫描器", "自动化越狱测试", "开源免费"],
    cons: ["误报率存在", "需要专业知识解读", "运行较慢"],
    useCase: "LLM 安全漏洞检测、越狱测试",
    learnMore: "https://garak.ai"
  },
  "microsoft-promptbench": {
    pros: ["微软 Prompt 评估工具", "多模型 Prompt 对比", "系统化评估框架"],
    cons: ["微软生态绑定", "功能较基础", "文档较少"],
    useCase: "Prompt 质量评估、多模型对比测试",
    learnMore: "https://github.com/microsoft/promptbench"
  },
  "langsmith": {
    pros: ["LLM 可观测性平台", "追踪调试一体化", "数据集评估"],
    cons: ["免费版有追踪量限制", "数据存储在第三方", "高级功能需付费"],
    useCase: "LLM 应用调试、Prompt 迭代优化",
    learnMore: "https://docs.smith.langchain.com"
  },
  "markitdown": {
    pros: ["微软多格式转 Markdown 工具", "支持 PDF/Word/Excel", "命令行友好"],
    cons: ["转换质量偶有问题", "复杂格式丢失", "仅输出 Markdown"],
    useCase: "文档格式转换、内容预处理",
    learnMore: "https://github.com/microsoft/markitdown"
  },
  "pandas": {
    pros: ["Python 数据分析标准库", "DataFrame API 强大", "生态最完善"],
    cons: ["大数据集内存消耗大", "性能不如 Polars", "学习曲线中等"],
    useCase: "数据清洗、分析、处理",
    learnMore: "https://pandas.pydata.org/docs"
  },
  "polars": {
    pros: ["Rust 编写高性能 DataFrame", "惰性执行优化", "内存效率远超 pandas"],
    cons: ["生态不如 pandas 成熟", "API 仍在快速变化", "社区较小"],
    useCase: "大数据集高性能处理、ETL 管道",
    learnMore: "https://docs.pola.rs"
  },
  "firecrawl": {
    pros: ["网页爬取转 Markdown", "AI 友好输出", "支持动态页面"],
    cons: ["免费版有爬取限制", "复杂网站可能被拦截", "API 成本随量增长"],
    useCase: "网页内容提取、AI 训练数据爬取",
    learnMore: "https://docs.firecrawl.dev"
  },
  "ragflow": {
    pros: ["开源 RAG 引擎", "支持多种文档格式", "可视化知识库管理"],
    cons: ["部署需要较多资源", "文档质量一般", "社区较小"],
    useCase: "企业知识库构建、RAG 问答系统",
    learnMore: "https://ragflow.io/docs"
  },
  "google-colab-learn": {
    pros: ["免费 GPU/TPU 环境", "零配置 Jupyter Notebook", "Google Drive 集成"],
    cons: ["会话有超时限制", "免费资源受限", "无法持久化环境"],
    useCase: "深度学习实验、Python 学习",
    learnMore: "https://colab.research.google.com"
  },
  "stable-diffusion": {
    pros: ["开源文生图模型", "本地部署隐私优先", "社区插件生态丰富"],
    cons: ["生成质量不如 Midjourney", "需要 GPU 资源", "Prompt 调参门槛高"],
    useCase: "AI 图像生成、创意设计、本地部署",
    learnMore: "https://stability.ai/stable-diffusion"
  },
  "midjourney": {
    pros: ["图像生成质量顶尖", "艺术风格出色", "操作简便"],
    cons: ["仅通过 Discord 使用", "付费使用", "不可本地部署"],
    useCase: "高质量 AI 艺术创作、设计灵感",
    learnMore: "https://docs.midjourney.com"
  },
  "higgsfield": {
    pros: ["AI 视频生成工具", "运动控制精准", "高质量输出"],
    cons: ["相对较新", "付费使用", "功能仍在完善"],
    useCase: "AI 视频生成、创意内容制作",
    learnMore: "https://higgsfield.ai"
  },
  "google-veo": {
    pros: ["Google 文生视频模型", "多模态理解", "高质量视频输出"],
    cons: ["等待名单访问", "生成时长有限", "付费使用"],
    useCase: "AI 视频创作、营销内容生成",
    learnMore: "https://deepmind.google/veo"
  },
  "synthesia": {
    pros: ["AI 虚拟人生成视频", "多语言支持", "无需拍摄设备"],
    cons: ["价格较高", "虚拟人表情略显生硬", "自定义有限"],
    useCase: "培训视频、教学课件、企业宣传",
    learnMore: "https://www.synthesia.io"
  },
  "runway": {
    pros: ["AI 视频编辑工具", "Gen-3 文生视频质量高", "实时协作"],
    cons: ["免费版水印", "高级功能昂贵", "生成速度较慢"],
    useCase: "AI 视频编辑、创意内容制作",
    learnMore: "https://docs.runwayml.com"
  },
  "adobe-firefly": {
    pros: ["Adobe 生态集成", "商业安全训练数据", "Photoshop/Illustrator 原生支持"],
    cons: ["生成创意一般", "仅 Adobe 生态", "高级功能需订阅"],
    useCase: "Adobe 设计工作流 AI 增强、商业安全图像生成",
    learnMore: "https://firefly.adobe.com"
  },
  "comfyui": {
    pros: ["节点式 Stable Diffusion UI", "高度可定制", "社区工作流丰富"],
    cons: ["学习曲线陡峭", "节点配置复杂", "需要 GPU"],
    useCase: "高级 AI 图像生成、自定义工作流",
    learnMore: "https://github.com/comfyanonymous/ComfyUI"
  },
  "google-veo31-lite": {
    pros: ["Google Veo 轻量版本", "推理速度快", "成本较低"],
    cons: ["质量不如完整版", "功能有限", "仍在测试阶段"],
    useCase: "快速视频原型、低成本 AI 视频生成",
    learnMore: "https://deepmind.google/veo"
  },
  "whisper": {
    pros: ["OpenAI 开源语音识别", "多语言支持", "本地部署隐私优先"],
    cons: ["实时性一般", "需要 GPU 加速", "方言支持有限"],
    useCase: "语音转文字、字幕生成、多语言翻译",
    learnMore: "https://github.com/openai/whisper"
  },
  "elevenlabs": {
    pros: ["TTS 质量顶尖", "声音克隆逼真", "多语言支持"],
    cons: ["免费版限制多", "声音克隆伦理争议", "API 成本较高"],
    useCase: "高质量语音合成、有声书、播客配音",
    learnMore: "https://elevenlabs.io/docs"
  },
  "voxcpm": {
    pros: ["开源语音模型", "支持多语言", "可本地部署"],
    cons: ["质量不如商业产品", "文档较少", "社区较小"],
    useCase: "语音合成实验、本地 TTS 部署",
    learnMore: "https://github.com/voxcpm/voxcpm"
  },
  "google-eloquent": {
    pros: ["Google 语音技术", "多语言支持", "与 Google 生态集成"],
    cons: ["相对较新", "文档较少", "独立使用受限"],
    useCase: "语音交互、多语言语音合成",
    learnMore: "https://ai.google.dev"
  },
  "fish-audio": {
    pros: ["AI 语音克隆", "多语言支持", "API 友好"],
    cons: ["免费版限制多", "克隆质量偶有不稳定", "伦理争议"],
    useCase: "语音克隆、个性化 TTS",
    learnMore: "https://fish.audio"
  },
  "suno": {
    pros: ["AI 音乐生成", "歌词+旋律自动创作", "风格多样"],
    cons: ["音乐质量不稳定", "版权争议", "商用限制"],
    useCase: "AI 音乐创作、创意音乐生成",
    learnMore: "https://suno.com"
  },
  "hume-ai": {
    pros: ["情感 AI 分析", "语音表情识别", "API 易用"],
    cons: ["应用场景较窄", "价格较高", "隐私问题"],
    useCase: "情感分析、语音情绪识别、用户体验优化",
    learnMore: "https://docs.hume.ai"
  },
  "perplexity-search": {
    pros: ["AI 搜索带引用来源", "实时联网", "专业模式深入"],
    cons: ["免费版有查询限制", "偶有信息幻觉", "高级功能需付费"],
    useCase: "AI 增强搜索、研究信息获取",
    learnMore: "https://docs.perplexity.ai"
  },
  "openrouter": {
    pros: ["多模型统一 API 入口", "价格透明比较", "支持 100+ 模型"],
    cons: ["中间层增加延迟", "不直接优化模型", "故障排查复杂"],
    useCase: "多模型对比、统一 API 接入、成本优化",
    learnMore: "https://openrouter.ai/docs"
  },
  "ai-hedge-fund": {
    pros: ["AI 量化交易框架", "多策略组合", "开源免费"],
    cons: ["需要金融知识", "回测不代表实盘", "风险较高"],
    useCase: "AI 量化投资、策略回测",
    learnMore: "https://github.com/virattt/ai-hedge-fund"
  },
  "china-textbook": {
    pros: ["中国教材数据集", "教育 AI 训练数据", "覆盖多学科"],
    cons: ["仅数据集非工具", "数据质量需验证", "更新频率低"],
    useCase: "教育 AI 模型训练、中文教育研究",
    learnMore: "https://github.com/chenyangMl/china-textbook"
  },
  "claude-mem": {
    pros: ["Claude 持久记忆方案", "跨会话记忆", "开源免费"],
    cons: ["配置较复杂", "仅 Claude Code", "稳定性待验证"],
    useCase: "Claude Code 跨会话记忆、个人助手",
    learnMore: "https://github.com/nicholasgriffintn/claude-mem"
  },
  "deep-tutor": {
    pros: ["AI 教育辅导 Agent", "个性化学习路径", "自动出题"],
    cons: ["相对较新", "文档较少", "效果依赖模型质量"],
    useCase: "AI 个性化教学、智能辅导",
    learnMore: "https://github.com/deep-tutor/deep-tutor"
  },
  "ai-trader": {
    pros: ["AI 量化交易 Agent", "多策略支持", "实时市场分析"],
    cons: ["交易风险高", "回测不代表实盘", "需专业知识"],
    useCase: "AI 量化交易、自动化投资分析",
    learnMore: "https://github.com/ai-trader/ai-trader"
  },
  "camofox-browser": {
    pros: ["反指纹浏览器", "隐私保护", "自动化友好"],
    cons: ["学习门槛高", "部分网站仍可能被拦截", "配置复杂"],
    useCase: "隐私浏览、爬虫自动化、反指纹检测",
    learnMore: "https://camofox.com"
  },
  "open-llm-vtuber": {
    pros: ["开源虚拟 VTuber", "LLM 驱动对话", "多模型支持"],
    cons: ["配置复杂", "需要 GPU", "3D 模型需自备"],
    useCase: "虚拟主播、AI 互动角色",
    learnMore: "https://github.com/OpenLLM-VTuber/OpenLLM-VTuber"
  },
  "n8n": {
    pros: ["开源工作流自动化", "200+ 集成节点", "可视化编排"],
    cons: ["自部署需要服务器", "复杂工作流调试困难", "企业版付费"],
    useCase: "跨平台自动化工作流、API 集成",
    learnMore: "https://docs.n8n.io"
  },
};

// Parse the file line by line and inject missing fields
const lines = content.split('\n');
const result = [];
let currentTool = {};
let toolStartIdx = -1;
let toolLineCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const idMatch = line.match(/id:\s*"([^"]+)"/);
  
  if (idMatch) {
    currentTool = { id: idMatch[1], lineIndex: i, hasPros: false, hasCons: false, hasUseCase: false, hasLearnMore: false };
    toolStartIdx = i;
  }
  
  if (currentTool.id) {
    if (line.includes('pros:') && line.includes('[')) currentTool.hasPros = true;
    if (line.includes('cons:') && line.includes('[')) currentTool.hasCons = true;
    if (line.includes('useCase:')) currentTool.hasUseCase = true;
    if (line.includes('learnMore:')) currentTool.hasLearnMore = true;
  }
  
  // Tool ends at }, or }]
  if (line.match(/^\s*\},?\s*$/) && currentTool.id) {
    const tid = currentTool.id;
    if (TOOL_DATA[tid] && !currentTool.hasPros) {
      const info = TOOL_DATA[tid];
      const newFields = [];
      const prosArr = info.pros.map(p => `      "${p}"`).join(',\n');
      const consArr = info.cons.map(c => `      "${c}"`).join(',\n');
      newFields.push(`    pros: [\n${prosArr}\n    ],`);
      newFields.push(`    cons: [\n${consArr}\n    ],`);
      if (!currentTool.hasUseCase && info.useCase) newFields.push(`    useCase: "${info.useCase}",`);
      if (!currentTool.hasLearnMore && info.learnMore) newFields.push(`    learnMore: "${info.learnMore}",`);
      
      // Insert before the closing },
      result.push(...newFields);
    }
    currentTool = {};
  }
  
  result.push(line);
}

const newContent = result.join('\n');
writeFileSync('src/data/tools.ts', newContent, 'utf-8');

// Count how many were modified
let count = 0;
for (const tid of Object.keys(TOOL_DATA)) {
  if (newContent.includes(`id: "${tid}"`) && newContent.split(`id: "${tid}"`)[1]?.includes('pros:')) {
    count++;
  }
}
console.log(`Updated ${count} tools with pros/cons/useCase/learnMore`);
