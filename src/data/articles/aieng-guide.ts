import { Article } from '../knowledge';

export const article: Article = {
    id: "aieng-guide",
    title: "AI 工程化实践学习导览",
    category: "aieng",
    tags: ["AI 工程化","学习导览","MLOps","部署"],
    summary: "将 AI 应用从原型变成生产级服务。学习模型部署、API 服务化、监控漂移、CI/CD for ML，掌握 AI 应用的全生命周期管理。",
    date: "2026-04-16",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 为什么要学 AI 工程化？",
            body: `你有了一个很棒的 AI 原型——然后呢？

- 怎么部署到服务器？
- 怎么保证服务稳定？
- 模型性能下降了怎么发现？
- 怎么自动化测试和发布？

这些问题就是 **AI 工程化**要解决的。它是从"能用"到"好用"的关键。`,
        },
        {
            title: "1. AI 工程化全景",
            body: `**┌─ 训练 → 优化 → 部署 → 监控 → 迭代 ──┐**
│                                            │
│  **训练**      **优化**      **部署**       │
│  • 数据准备   • 量化        • FastAPI      │
│  • 模型训练   • 剪枝        • Docker       │
│  • 实验管理   • 蒸馏        • Kubernetes   │
│                                            │
│  **监控**      **迭代**                     │
│  • 数据漂移   • 在线学习                   │
│  • 性能监控   • A/B 测试                   │
│  • 告警系统   • 灰度发布                   │
│                                            │
**└──────────────────────────────────────────┘**`,
        },
        {
            title: "2. 学习路线",
            body: `**第 1 步：AI 应用部署**（1 周）
→ FastAPI、Docker、API 服务化

**第 2 步：真实项目实战**（1-2 周）
→ 从需求到上线的完整 AI 项目

**前置要求：** 已经学过 LLM 应用开发`,
        },
        {
            title: "3. 核心工具链",
            body: `| 环节 | 工具 | 说明 |
|------|------|------|
| API 服务 | FastAPI | Python 最流行的 API 框架 |
| 容器化 | Docker | 打包和部署的标准方式 |
| 编排 | Kubernetes | 大规模部署的管理平台 |
| 推理引擎 | vLLM | 高性能 LLM 推理 |
| 实验管理 | MLflow / W&B | 追踪训练实验 |
| 监控 | 自定义 | 数据漂移、性能监控 |`,
            tip: "💡 初学者从 FastAPI + Docker 开始就够了，不需要一上来就学 Kubernetes。",
        }
    ]
};
