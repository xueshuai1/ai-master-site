/**
 * Fix all placeholder mermaid diagrams in knowledge base articles.
 * Replaces generic "概述→原理→实现→应用→总结" diagrams with topic-specific ones.
 */
const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '../src/data/articles');

// The generic placeholder pattern to find and replace
const PLACEHOLDER_MERMAID = 'A["概述"] --> B["原理"]\n    B --> C["实现"]\n    C --> D["应用"]\n    D --> E["总结"]';

// For each article, define replacement mermaid diagrams
// Key: filename without .ts extension
const replacements = {
  // ==================== GUIDE ARTICLES ====================
  'aieng-guide': [
    `graph TD
    subgraph "AI 工程化五大阶段"
        T1["训练<br/>数据准备+模型训练"] --> T2["优化<br/>量化+剪枝+蒸馏"]
        T2 --> T3["部署<br/>FastAPI+Docker+K8s"]
        T3 --> T4["监控<br/>漂移检测+性能告警"]
        T4 --> T5["迭代<br/>A/B测试+灰度发布"]
        T5 -->|"反馈数据"| T1
    end
    
    style T3 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style T4 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
    `graph LR
    A["原型阶段<br/>Notebook + 本地模型"] -->|"工程化"| B["API 服务<br/>FastAPI + vLLM"]
    B -->|"容器化"| C["Docker 部署<br/>可重复的环境"]
    C -->|"编排"| D["K8s 集群<br/>自动扩缩容"]
    D -->|"生产化"| E["可观测平台<br/>监控+告警+日志"]
    
    style B fill:#1e3a5f,stroke:#2563eb,color:#fff
    style E fill:#b91c1c,stroke:#dc2626,color:#fff`,
  ],

  'genai-guide': [
    `graph TD
    subgraph "生成式 AI 技术路线"
        G1["文本生成<br/>LLM / GPT"]
        G2["图像生成<br/>Diffusion / DALL·E"]
        G3["音频生成<br/>TTS / Suno"]
        G4["视频生成<br/>Veo / Sora"]
        G5["代码生成<br/>Code LLM"]
    end
    
    subgraph "核心生成范式"
        P1["自回归生成<br/>GPT 系列"]
        P2["扩散模型<br/>Stable Diffusion"]
        P3["流匹配<br/>Flow Matching"]
    end
    
    G1 --> P1
    G2 --> P2
    G4 --> P3
    
    style P1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style P2 fill:#b91c1c,stroke:#dc2626,color:#fff`,
    `graph LR
    A["数学基础<br/>概率+线代"] --> B["深度学习<br/>PyTorch"]
    B --> C["生成模型原理<br/>VAE/GAN/扩散"]
    C --> D["实战项目<br/>微调+应用"]
    
    A --> P1["微积分+概率论"]
    B --> P2["神经网络基础"]
    C --> P3["Diffusion 原理"]
    D --> P4["Stable Diffusion 微调"]
    
    style C fill:#1e3a5f,stroke:#2563eb,color:#fff
    style D fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  'cv-guide': [
    `graph TD
    subgraph "CV 技术演进"
        C1["经典 CV<br/>OpenCV"] --> C2["CNN 时代<br/>ResNet/YOLO"]
        C2 --> C3["Transformer 时代<br/>ViT/DETR"]
        C3 --> C4["多模态时代<br/>CLIP/SAM"]
        C4 --> C5["生成式视觉<br/>Diffusion/FLUX"]
    end
    
    subgraph "核心任务"
        T1["图像分类"]
        T2["目标检测"]
        T3["图像分割"]
        T4["图像生成"]
    end
    
    C2 --> T1
    C2 --> T2
    C3 --> T3
    C5 --> T4
    
    style C3 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style C5 fill:#b91c1c,stroke:#dc2626,color:#fff`,
    `graph LR
    A["基础理论<br/>2-3周"] --> B["CNN 实战<br/>2-3周"]
    B --> C["Transformer<br/>2-3周"]
    C --> D["多模态+生成<br/>3-4周"]
    
    A --> P1["Python+OpenCV"]
    B --> P2["PyTorch+ResNet"]
    C --> P3["ViT+DETR"]
    D --> P4["CLIP+Diffusion"]
    
    style B fill:#1e3a5f,stroke:#2563eb,color:#fff
    style D fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  'nlp-guide': [
    `graph TD
    subgraph "NLP 技术演进"
        N1["规则时代<br/>正则/语法树"] --> N2["统计时代<br/>n-gram/CRF"]
        N2 --> N3["深度学习<br/>Word2Vec/LSTM"]
        N3 --> N4["Transformer<br/>BERT/GPT"]
        N4 --> N5["大模型时代<br/>指令微调/Agent"]
    end
    
    subgraph "核心任务"
        T1["文本分类"]
        T2["命名实体识别"]
        T3["机器翻译"]
        T4["文本生成"]
        T5["问答系统"]
    end
    
    N2 --> T1
    N2 --> T2
    N3 --> T3
    N4 --> T4
    N5 --> T5
    
    style N4 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style N5 fill:#b91c1c,stroke:#dc2626,color:#fff`,
    `graph LR
    A["基础理论<br/>2-3周"] --> B["传统 NLP<br/>n-gram+CRF"]
    B --> C["深度学习<br/>BERT+GPT"]
    C --> D["大模型时代<br/>指令微调+RAG"]
    D --> E["实战项目<br/>2-3周"]
    
    style C fill:#1e3a5f,stroke:#2563eb,color:#fff
    style D fill:#b91c1c,stroke:#dc2626,color:#fff`,
  ],

  'rl-guide': [
    `graph TD
    subgraph "RL 算法家族"
        V1["Value-Based<br/>Q-Learning/DQN"]
        P1["Policy-Based<br/>REINFORCE/PPO"]
        A1["Actor-Critic<br/>A2C/A3C"]
        M1["Model-Based<br/>World Model/Dreamer"]
    end
    
    V1 --> A1
    P1 --> A1
    
    subgraph "核心概念"
        S["状态 State"] -->|"选择"| A["行动 Action"]
        A -->|"获得"| R["奖励 Reward"]
        S -->|"转移到"| T["下一状态"]
    end
    
    style V1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style A1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style M1 fill:#b91c1c,stroke:#dc2626,color:#fff`,
    `graph LR
    A["数学基础<br/>概率+优化"] --> B["MDP 理论<br/>马尔可夫决策"]
    B --> C["Value-Based<br/>Q-Learning+DQN"]
    C --> D["Policy-Based<br/>PPO"]
    D --> E["进阶<br/>Model-Based+MARL"]
    
    style C fill:#1e3a5f,stroke:#2563eb,color:#fff
    style D fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  'rl-011': [
    `graph TD
    subgraph "World Model + Model-Based RL"
        E1["编码器<br/>观察 → 潜状态"] --> M1["世界模型<br/>预测下一状态"]
        M1 --> P1["策略网络<br/>在模型中规划"]
        P1 --> V1["价值网络<br/>状态评估"]
        V1 -->|"反馈"| P1
        P1 -->|"执行到环境"| E1
    end
    
    subgraph "学习循环"
        L1["想象环境中规划"] --> L2["选择最优行动"]
        L2 --> L3["真实环境执行"]
        L3 --> L4["观察结果"]
        L4 --> L5["更新世界模型"]
        L5 --> L1
    end
    
    style M1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style P1 fill:#b91c1c,stroke:#dc2626,color:#fff`,
  ],

  'ml-023': [
    `graph TD
    subgraph "世界模型架构"
        E1["编码器<br/>Observation → 潜变量"] --> D1["动力学模型<br/>预测下一状态"]
        D1 --> R1["奖励模型<br/>预测奖励信号"]
        D1 --> V1["价值模型<br/>评估状态价值"]
        V1 --> P1["策略模型<br/>选择最优行动"]
    end
    
    subgraph "持续学习循环"
        L1["收集经验"] --> L2["更新世界模型"]
        L2 --> L3["规划行动"]
        L3 --> L4["执行+观察"]
        L4 --> L1
    end
    
    style D1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style L2 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  // ==================== AGENT ARTICLES ====================
  'agent-030': [
    `graph TD
    subgraph "Agent 权限模型"
        RBAC["RBAC 角色模型<br/>角色→权限→资源"]
        ABAC["ABAC 属性模型<br/>属性→策略引擎→决策"]
    end
    
    subgraph "Agent 权限层级"
        L1["系统级权限<br/>API 调用范围"] --> L2["数据级权限<br/>数据读写范围"]
        L2 --> L3["操作级权限<br/>可执行的工具列表"]
        L3 --> L4["资源级权限<br/>单个文件的访问控制"]
    end
    
    RBAC --> L1
    ABAC --> L2
    
    style L2 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style L3 fill:#b91c1c,stroke:#dc2626,color:#fff`,
  ],

  'agent-031': [
    `graph TD
    subgraph "Agent 可观测性四层"
        O1["意图追踪<br/>LLM 思考链"] --> O2["行为日志<br/>工具调用记录"]
        O2 --> O3["状态监控<br/>内存/CPU/延迟"]
        O3 --> O4["异常检测<br/>偏离预期行为"]
        O4 -->|"告警"| O5["人工干预"]
    end
    
    subgraph "行为约束机制"
        C1["硬约束<br/>安全边界"] --> C2["软约束<br/>风格偏好"]
        C2 --> C3["动态约束<br/>运行时调整"]
    end
    
    O5 --> C1
    C3 --> O1
    
    style O4 fill:#b91c1c,stroke:#dc2626,color:#fff
    style C1 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
    `graph LR
    subgraph "观测数据源"
        S1["LLM API 响应"]
        S2["工具调用结果"]
        S3["用户反馈"]
        S4["系统指标"]
    end
    
    subgraph "处理管道"
        P1["日志聚合"] --> P2["结构化解析"]
        P2 --> P3["模式匹配"]
        P3 --> P4["异常评分"]
    end
    
    subgraph "可视化"
        V1["实时仪表板"]
        V2["历史回放"]
        V3["干预面板"]
    end
    
    S1 --> P1
    S2 --> P1
    S3 --> P2
    S4 --> P3
    P4 --> V1
    P4 --> V3
    
    style P3 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  'agent-032': [
    `graph TD
    subgraph "记忆分层架构"
        M1["工作记忆<br/>RAM/上下文窗口"] -->|"压缩"| M2["短期记忆<br/>向量数据库"]
        M2 -->|"精炼"| M3["长期记忆<br/>知识图谱"]
        M3 -->|"归档"| M4["持久记忆<br/>文件系统"]
        M4 -->|"检索召回"| M1
    end
    
    style M1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style M3 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style M4 fill:#b91c1c,stroke:#dc2626,color:#fff`,
    `graph LR
    subgraph "向量检索"
        V1["文本嵌入<br/>Embedding"] --> V2["向量索引<br/>HNSW"]
        V2 --> V3["相似度搜索<br/>余弦"]
    end
    
    subgraph "图检索"
        K1["实体节点"] --> K2["关系边"]
        K2 --> K3["图查询<br/>路径推理"]
    end
    
    subgraph "混合检索"
        H1["向量结果"] --> H2["结果融合"]
        K3 --> H2
        H2 --> H3["最终上下文"]
    end
    
    V3 --> H1
    style V2 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style H2 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  'agent-034': [
    `graph TD
    subgraph "Symphony 规范架构"
        R1["角色层<br/>定义 Agent 身份"] --> P1["协议层<br/>消息格式和类型"]
        P1 --> E1["编排层<br/>任务分配和管理"]
        E1 -->|"生命周期"| R1
    end
    
    subgraph "消息格式"
        M1["消息头<br/>sender/receiver"] --> M2["消息体<br/>payload"]
        M2 --> M3["元数据<br/>timestamp/trace"]
    end
    
    P1 --> M1
    
    style R1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style E1 fill:#b91c1c,stroke:#dc2626,color:#fff`,
    `graph LR
    A["Agent A 接收任务"] -->|"请求"| B["Agent B 响应"]
    B -->|"返回结果"| A
    A -->|"委托"| C["Agent C 执行"]
    C -->|"完成"| A
    A -->|"汇总"| D["最终输出"]
    
    A -->|"错误"| E["编排器"]
    B -->|"状态"| E
    C -->|"状态"| E
    E -->|"重新分配"| C
    
    style A fill:#1e3a5f,stroke:#2563eb,color:#fff
    style E fill:#b91c1c,stroke:#dc2626,color:#fff`,
  ],

  'agent-035': [
    `graph TD
    subgraph "自主学习范式"
        A["无监督环境交互"] --> B["生成自我训练数据"]
        B --> C["模型更新"]
        C --> D["策略改进"]
        D --> A
    end
    
    subgraph "核心技术"
        S1["自博弈 Self-Play<br/>AlphaZero 范式"]
        S2["世界模型<br/>预测环境状态"]
        S3["好奇心驱动<br/>内在奖励信号"]
    end
    
    B --> S1
    B --> S2
    B --> S3
    
    style A fill:#1e3a5f,stroke:#2563eb,color:#fff
    style S1 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
    `graph LR
    subgraph "自博弈循环"
        A1["初始策略 π0"] --> A2["自我对弈"]
        A2 --> A3["MCTS 搜索"]
        A3 --> A4["训练新策略 πn+1"]
        A4 -->|"迭代"| A2
    end
    
    subgraph "世界模型循环"
        W1["观察状态 st"] --> W2["预测 ŝt+1"]
        W2 --> W3["计算误差"]
        W3 --> W4["更新模型"]
        W4 -->|"更准确"| W2
    end
    
    style A3 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style W2 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  'agent-038': [
    `graph TD
    subgraph "Agent 编排架构模式"
        C1["中心化编排<br/>单一协调器"]
        D1["去中心化编排<br/>点对点通信"]
        H1["混合编排<br/>分层协调"]
    end
    
    subgraph "中心化模式"
        O1["编排器"] --> W1["Worker A"]
        O1 --> W2["Worker B"]
        O1 --> W3["Worker C"]
    end
    
    subgraph "去中心化模式"
        D2["Agent A"] <-->|"直接通信"| D3["Agent B"]
        D3 <--> D4["Agent C"]
        D4 <--> D2
    end
    
    style C1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style O1 fill:#b91c1c,stroke:#dc2626,color:#fff
    style D2 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
    `graph TD
    A["任务到达"] --> B{复杂度评估}
    B -->|"简单"| C["直接处理"]
    B -->|"中等"| D["中心化编排<br/>分配子任务"]
    B -->|"复杂"| E["混合编排<br/>分层协调"]
    
    D --> F["结果汇总"]
    E --> F
    C --> F
    
    B -->|"未知"| G["去中心协商<br/>自主分工"]
    G --> F
    
    style E fill:#b91c1c,stroke:#dc2626,color:#fff
    style G fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  // ==================== AI SECURITY ARTICLES ====================
  'ai-security-003': [
    `graph TD
    subgraph "漏洞发现到防御流程"
        D1["AI 自动扫描<br/>Mythos 引擎"] --> D2["漏洞确认<br/>Mozilla 验证"]
        D2 --> D3["漏洞披露<br/>CVE 编号"]
        D3 --> D4["防御响应<br/>Project Glasswing"]
        D4 --> D5["补丁部署<br/>系统加固"]
    end
    
    subgraph "防御联盟"
        A1["Mozilla"] --> A2["金融系统"]
        A2 --> A3["安全厂商"]
        A3 --> A4["开源社区"]
        A4 -->|"信息共享"| A1
    end
    
    D5 --> A1
    
    style D1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style D4 fill:#b91c1c,stroke:#dc2626,color:#fff`,
    `graph LR
    subgraph "漏洞时间线"
        T1["T0: 扫描启动"] --> T2["T+2周: 初步发现"]
        T2 --> T3["T+8周: 271个确认"]
        T3 --> T4["T+10周: 公开披露"]
    end
    
    subgraph "漏洞分类"
        C1["XSS 跨站脚本"]
        C2["UAF 内存安全"]
        C3["逻辑漏洞"]
        C4["权限提升"]
    end
    
    T3 --> C1
    T3 --> C2
    T3 --> C3
    T3 --> C4
    
    style T3 fill:#b91c1c,stroke:#dc2626,color:#fff`,
  ],

  'ai-security-004': [
    `graph TD
    subgraph "AI 模型安全风险矩阵"
        R1["提示注入攻击"] --> I1["高危"]
        R2["训练数据泄露"] --> I1
        R3["对抗样本攻击"] --> I1
        R4["模型权重窃取"] --> I2["中危"]
        R5["供应链投毒"] --> I1
        R6["越权工具调用"] --> I1
    end
    
    subgraph "防御层次"
        D1["输入过滤<br/>Prompt 清洗"] --> D2["行为监控<br/>异常检测"]
        D2 --> D3["输出验证<br/>结果审查"]
        D3 --> D4["模型加固<br/>对抗训练"]
    end
    
    style I1 fill:#b91c1c,stroke:#dc2626,color:#fff
    style I2 fill:#b45309,stroke:#d97706,color:#fff
    style D2 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  'ai-security-006': [
    `graph TD
    subgraph "LLM-as-Judge 可靠性诊断"
        D1["传递性分析<br/>A>B, B>C → A>C?"] --> D2["传递性违反率"]
        D3["保形预测集<br/>Conformal Prediction"] --> D4["覆盖率与区间宽度"]
        D2 --> D5["一致性评分"]
        D4 --> D5
        D5 --> D6["可靠性判定"]
    end
    
    subgraph "不一致性来源"
        S1["提示词敏感性"]
        S2["上下文偏差"]
        S3["模型随机性"]
        S4["评分尺度不统一"]
    end
    
    D1 -.-> S1
    D3 -.-> S3
    
    style D2 fill:#b91c1c,stroke:#dc2626,color:#fff
    style D4 fill:#b91c1c,stroke:#dc2626,color:#fff`,
    `graph LR
    subgraph "保形预测流程"
        P1["校准数据集"] --> P2["计算非一致性分数"]
        P2 --> P3["确定阈值 qt"]
        P3 --> P4["构建预测集"]
        P4 --> P5["覆盖率保证 ≥ 1-α"]
    end
    
    subgraph "应用"
        A1["模型评估可靠性"]
        A2["排名置信度"]
        A3["不确定性量化"]
    end
    
    P5 --> A1
    P5 --> A2
    P5 --> A3
    
    style P2 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style P5 fill:#b91c1c,stroke:#dc2626,color:#fff`,
  ],

  // ==================== AI ENGINEERING ====================
  'aieng-021': [
    `graph TD
    subgraph "Agentic Engineering 架构"
        A["用户目标"] --> B["任务分解<br/>Planner"]
        B --> C["工具选择<br/>Tool Selector"]
        C --> D["执行引擎<br/>Executor"]
        D --> E["观察反馈<br/>Observer"]
        E --> F{"目标达成？"}
        F -->|"否"| B
        F -->|"是"| G["结果交付"]
    end
    
    subgraph "支撑系统"
        M["记忆管理"]
        S["安全约束"]
        O["可观测性"]
    end
    
    B -.->|"读写"| M
    C -.->|"检查"| S
    D -.->|"上报"| O
    
    style B fill:#1e3a5f,stroke:#2563eb,color:#fff
    style F fill:#b91c1c,stroke:#dc2626,color:#fff`,
    `graph TD
    subgraph "ReAct 模式"
        R1["Thought 思考"] --> R2["Act 行动"]
        R2 --> R3["Observe 观察"]
        R3 --> R1
    end
    
    subgraph "Plan-and-Solve"
        P1["Plan 完整规划"] --> P2["Execute 逐步执行"]
        P2 --> P3["Verify 验证"]
        P3 --> P4{"通过？"}
        P4 -->|"否"| P1
        P4 -->|"是"| P5["输出"]
    end
    
    subgraph "Multi-Agent"
        M1["分工协作"]
        M2["审查-修正"]
        M3["辩论模式"]
    end
    
    style R1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style P1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style M1 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  // ==================== ANTHROPIC ====================
  'anthropic-claude': [
    `graph TD
    subgraph "Claude 产品矩阵"
        P1["Claude Chat<br/>对话界面"]
        P2["Claude API<br/>开发者接口"]
        P3["Claude Code<br/>编程 Agent"]
        P4["Claude Projects<br/>知识库增强"]
    end
    
    subgraph "模型家族"
        M1["Haiku<br/>轻量快速"]
        M2["Sonnet<br/>均衡性能"]
        M3["Opus<br/>最强推理"]
    end
    
    P1 --> M2
    P2 --> M1
    P2 --> M2
    P2 --> M3
    P3 --> M3
    P4 --> M2
    
    style M3 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style P3 fill:#b91c1c,stroke:#dc2626,color:#fff`,
    `graph LR
    subgraph "安全优先理念"
        S1["Constitutional AI"] --> S2["RL-CAI 训练"]
        S2 --> S3["红队测试"]
        S3 --> S4["安全评估"]
        S4 --> S5["发布决策"]
    end
    
    subgraph "与 OpenAI 对比"
        C1["安全优先<br/>透明度高"] --> C2["Claude"]
        O1["性能优先<br/>迭代快"] --> O2["GPT"]
    end
    
    style S1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style C1 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  // ==================== ETHICS ====================
  'ethics-007': [
    `graph TD
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
  ],

  'ethics-008': [
    `graph TD
    subgraph "AI 红队测试流程"
        S1["范围定义<br/>目标+约束"] --> S2["信息收集<br/>模型+工具链"]
        S2 --> S3["攻击设计<br/>对抗/注入"]
        S3 --> S4["执行攻击<br/>自动化+手工"]
        S4 --> S5["结果分析<br/>漏洞评级"]
        S5 --> S6["修复建议<br/>防御方案"]
        S6 --> S7["复测验证<br/>确认修复"]
    end
    
    subgraph "主要攻击面"
        A1["提示注入"]
        A2["对抗样本"]
        A3["数据投毒"]
        A4["供应链攻击"]
        A5["越权操作"]
    end
    
    S3 --> A1
    S3 --> A2
    S3 --> A3
    S3 --> A4
    S3 --> A5
    
    style S4 fill:#b91c1c,stroke:#dc2626,color:#fff
    style A1 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  'ethics-009': [
    `graph TD
    subgraph "AI 法律合规全景"
        L1["数据隐私法<br/>GDPR/CCPA"] --> L2["AI 专项法规<br/>EU AI Act"]
        L2 --> L3["知识产权法<br/>版权/专利"]
        L3 --> L4["消费者保护法<br/>歧视/偏见"]
        L4 --> L5["行业特定法规<br/>医疗/金融"]
    end
    
    subgraph "开发者合规清单"
        C1["数据来源合法"]
        C2["模型输出审查"]
        C3["用户隐私保护"]
        C4["透明度披露"]
        C5["偏见检测缓解"]
    end
    
    L2 --> C1
    L1 --> C3
    L3 --> C4
    L4 --> C5
    
    style L2 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style C1 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  // ==================== MCP ====================
  'mcp-001': [
    `graph TD
    subgraph "MCP 协议架构"
        C1["Client<br/>AI 应用/Agent"] -->|"MCP Request"| T1["Transport<br/>stdio/HTTP/SSE"]
        T1 -->|"转发"| S1["Server<br/>工具/数据提供者"]
        S1 -->|"MCP Response"| T1
        T1 -->|"返回"| C1
    end
    
    subgraph "三大核心能力"
        R1["资源读取<br/>Resource Read"]
        R2["工具调用<br/>Tool Call"]
        R3["提示词模板<br/>Prompt Template"]
    end
    
    S1 --> R1
    S1 --> R2
    S1 --> R3
    
    style T1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style R2 fill:#b91c1c,stroke:#dc2626,color:#fff`,
  ],

  // ==================== MLOPS ====================
  'mlops-007': [
    `graph TD
    subgraph "ML 可观测性架构"
        D1["数据层监控<br/>数据漂移"] -->|"告警"| A1["智能告警系统"]
        M1["模型层监控<br/>性能衰减"] -->|"告警"| A1
        S1["系统层监控<br/>延迟/吞吐"] -->|"告警"| A1
        B1["业务层监控<br/>业务指标"] -->|"告警"| A1
    end
    
    subgraph "告警响应流程"
        A2["告警分类<br/>严重程度"] --> A3["自动响应<br/>回滚/降级"]
        A3 --> A4["人工介入<br/>根因分析"]
        A4 --> A5["修复+验证<br/>闭环"]
    end
    
    A1 --> A2
    
    style A1 fill:#b91c1c,stroke:#dc2626,color:#fff
    style D1 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  // ==================== MULTIMODAL ====================
  'mm-007': [
    `graph TD
    subgraph "多模态大模型演进"
        M1["视觉-语言<br/>BLIP/Flamingo"] --> M2["统一视觉语言<br/>LLaVA 系列"]
        M2 --> M3["多模态融合<br/>Gemini/GPT-4o"]
        M3 --> M4["全模态<br/>音频+视频+文本"]
    end
    
    subgraph "LLaVA 架构"
        V1["视觉编码器<br/>CLIP ViT"] --> P1["投影层<br/>Linear/MLP"]
        P1 --> L1["语言模型<br/>LLaMA/Vicuna"]
    end
    
    subgraph "Gemini 架构创新"
        G1["原生多模态 Transformer"] --> G2["MoE 混合专家"]
        G1 --> G3["超长上下文窗口"]
    end
    
    M2 --> V1
    M3 --> G1
    
    style M2 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style M3 fill:#b91c1c,stroke:#dc2626,color:#fff`,
  ],

  'mm-009': [
    `graph TD
    subgraph "PersonaPlex 架构"
        A1["音频输入<br/>实时麦克风"] --> A2["Moshi 骨干网<br/>流式双向"]
        A2 --> A3["人格控制模块<br/>Persona Controller"]
        A3 --> A4["音频输出<br/>实时 TTS"]
    end
    
    subgraph "人格特征维度"
        P1["语速和节奏"]
        P2["语调和情感"]
        P3["用词风格"]
        P4["个性特征<br/>幽默/严肃/温暖"]
    end
    
    A3 --> P1
    A3 --> P2
    A3 --> P3
    A3 --> P4
    
    style A3 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style P4 fill:#b91c1c,stroke:#dc2626,color:#fff`,
  ],

  'mm-guide': [
    `graph TD
    subgraph "多模态技术全景"
        V1["视觉理解<br/>分类/检测/分割"]
        L1["语言理解<br/>NLP/翻译/摘要"]
        A1["音频理解<br/>语音识别"]
    end
    
    V1 --> M1["视觉-语言融合<br/>CLIP/BLIP"]
    L1 --> M1
    A1 --> M2["音频-文本融合<br/>Whisper"]
    M1 --> F1["多模态大模型<br/>GPT-4o/Gemini"]
    M2 --> F1
    
    subgraph "多模态生成"
        G1["文本→图像<br/>DALL·E/SD"]
        G2["文本→视频<br/>Sora/Veo"]
        G3["文本→音频<br/>TTS/Suno"]
    end
    
    F1 --> G1
    F1 --> G2
    F1 --> G3
    
    style M1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style F1 fill:#b91c1c,stroke:#dc2626,color:#fff`,
    `graph LR
    A["数学基础<br/>概率+线代"] --> B["深度学习<br/>PyTorch"]
    B --> C["视觉+NLP 基础<br/>CNN+Transformer"]
    C --> D["多模态学习<br/>CLIP+BLIP"]
    D --> E["实战项目<br/>多模态应用"]
    
    style C fill:#1e3a5f,stroke:#2563eb,color:#fff
    style D fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  // ==================== PRACTICE ====================
  'practice-009': [
    `graph TD
    subgraph "蛋白质结构预测流程"
        S1["氨基酸序列<br/>输入"] --> S2["特征提取<br/>MSA+模板"]
        S2 --> S3["结构预测<br/>Protenix 模型"]
        S3 --> S4["结构优化<br/>能量最小化"]
        S4 --> S5["3D 结构输出<br/>PDB 格式"]
        S5 --> S6["验证评估<br/>RMSD/GDT"]
    end
    
    subgraph "Protenix 技术栈"
        P1["多序列比对<br/>MSA 搜索"] --> P2["Evoformer<br/>特征融合"]
        P2 --> P3["结构模块<br/>3D 坐标生成"]
    end
    
    S2 --> P1
    P3 --> S3
    
    style S3 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style P2 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  // ==================== SECURITY GUIDE ====================
  'security-guide': [
    `graph TD
    subgraph "AI 安全三大维度"
        S1["对抗安全<br/>对抗样本/防御"]
        S2["对齐安全<br/>价值观对齐/红队"]
        S3["隐私安全<br/>数据保护/联邦学习"]
    end
    
    subgraph "工具链"
        T1["对抗攻击库<br/>ART/Foolbox"]
        T2["红队框架<br/>Garak/PyRIT"]
        T3["隐私工具<br/>差分隐私"]
    end
    
    S1 -.-> T1
    S2 -.-> T2
    S3 -.-> T3
    
    style S1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style S2 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style S3 fill:#b91c1c,stroke:#dc2626,color:#fff`,
    `graph LR
    A["安全基础<br/>威胁模型"] --> B["对抗安全<br/>攻击与防御"]
    B --> C["对齐安全<br/>RLHF/红队"]
    C --> D["隐私安全<br/>差分隐私"]
    D --> E["实战项目<br/>安全评估"]
    
    style B fill:#1e3a5f,stroke:#2563eb,color:#fff
    style C fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],

  // ==================== VOICE ====================
  'voice-002': [
    `graph TD
    subgraph "VoxCPM2 Tokenizer-Free 架构"
        A1["原始音频波形<br/>输入"] --> A2["声学编码器<br/>直接处理波形"]
        A2 --> A3["文本编码器<br/>Token-free 表示"]
        A3 --> A4["扩散自回归解码<br/>逐步生成"]
        A4 --> A5["音频输出<br/>30 种语言"]
    end
    
    subgraph "对比传统 TTS"
        T1["传统<br/>文本→Token→Mel→波形"] -->|"多步转换"| T2["VoxCPM2<br/>文本→波形 端到端"]
    end
    
    subgraph "核心能力"
        C1["零样本语音克隆"]
        C2["情感控制"]
        C3["多语言切换"]
        C4["实时流式输出"]
    end
    
    A4 --> C1
    A4 --> C2
    A4 --> C3
    A4 --> C4
    
    style A2 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style T2 fill:#b91c1c,stroke:#dc2626,color:#fff`,
  ],

  'voice-004': [
    `graph TD
    subgraph "VoiceBox 架构"
        A1["多模态输入<br/>文本/音频/参考"] --> A2["Flow Matching 骨干网<br/>非自回归生成"]
        A2 --> A3["音频输出<br/>TTS/翻译/编辑"]
    end
    
    subgraph "Flow Matching vs 扩散"
        F1["扩散模型<br/>多步去噪, 慢"] --> F2["Flow Matching<br/>连续流, 快"]
        F2 --> F3["VoiceBox 优化<br/>知识蒸馏, 4步"]
    end
    
    subgraph "多模态语音任务"
        T1["文本→语音 TTS"]
        T2["语音→语音翻译"]
        T3["音频编辑<br/>风格迁移"]
        T4["语音变声"]
    end
    
    A2 --> T1
    A2 --> T2
    A2 --> T3
    A2 --> T4
    
    style A2 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style F3 fill:#b91c1c,stroke:#dc2626,color:#fff`,
  ],

  // ==================== AI-000 ====================
  'ai-000': [
    `graph TD
    subgraph "AI 学习路线"
        L1["第1阶段: 入门<br/>Prompt Engineering"] --> L2["第2阶段: 应用<br/>LLM API+RAG"]
        L2 --> L3["第3阶段: 进阶<br/>Agent 开发"]
        L3 --> L4["第4阶段: 工程化<br/>部署+MLOps"]
    end
    
    subgraph "基础路线"
        B1["数学+ML 基础<br/>3-4周"] --> B2["DL+NLP+CV<br/>4-6周"]
        B2 --> B3["LLM+Agent<br/>4-6周"]
        B3 --> B4["专业方向<br/>按兴趣"]
    end
    
    L1 -.-> B1
    
    style L3 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style B3 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
  ],
};

let totalFixed = 0;
let errors = [];

for (const [name, newMermaids] of Object.entries(replacements)) {
  const filePath = path.join(articlesDir, `${name}.ts`);
  
  if (!fs.existsSync(filePath)) {
    errors.push(`${name}.ts: File not found`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all placeholder mermaid patterns
  // Pattern: mermaid: `graph TD\n    A["概述"] --> B["原理"]\n    B --> C["实现"]\n    C --> D["应用"]\n    D --> E["总结"]`
  const placeholderRegex = /mermaid:\s*`graph\s+(TD|LR)\s*\n\s*A\["概述"\][^`]*`/g;
  const matches = [...content.matchAll(placeholderRegex)];
  
  if (matches.length === 0) {
    errors.push(`${name}.ts: No placeholder mermaid found`);
    continue;
  }
  
  // Replace from last to first to preserve positions
  let mermaidIdx = 0;
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const replacement = newMermaids[Math.min(mermaidIdx, newMermaids.length - 1)];
    
    content = content.substring(0, match.index) + `mermaid: \`${replacement}\`` + content.substring(match.index + match[0].length);
    totalFixed++;
    mermaidIdx++;
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${name}.ts — replaced ${matches.length} placeholder mermaid(s)`);
}

console.log(`\n📊 Total fixed: ${totalFixed}`);
if (errors.length > 0) {
  console.log(`\n❌ Errors (${errors.length}):`);
  errors.forEach(e => console.log(`  - ${e}`));
}
