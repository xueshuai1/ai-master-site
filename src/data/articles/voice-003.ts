// 全双工实时语音对话 AI：从 Moshi 到 PersonaPlex 的技术演进

import { Article } from '../knowledge';

export const article: Article = {
  id: "voice-003",
  title: "全双工实时语音对话 AI：从 Moshi 到 PersonaPlex 的技术演进",
  category: "multimodal",
  tags: ["全双工对话", "PersonaPlex", "Moshi", "Mimi", "语音 AI", "实时交互", "低延迟", "人格控制", "Kyutai", "NVIDIA"],
  summary: "2026 年，全双工实时语音对话 AI 进入爆发期。从 Kyutai 的 Moshi 开创 160ms 理论延迟的语音-语音模型，到 NVIDIA PersonaPlex 实现人格控制与角色扮演，语音 AI 正从「识别+合成」的传统管线进化为真正的「实时对话智能体」。本文深度解读全双工语音 AI 的技术架构、核心编解码器 Mimi、混合系统提示机制，以及与 OpenAI Realtime API、Gemini Live 等商业方案的对比。",
  date: "2026-04-18",
  readTime: "22 min",
  level: "进阶",
  content: [
    {
      title: "全双工语音 AI：什么是真正的「对话」",
      body: `2026 年被公认为「全双工语音 AI 元年」。为什么？因为这一年，语音 AI 终于从「你说完它再说」的半双工模式，进化为「边听边说、可打断、有停顿感」的真正对话。

**半双工 vs 全双工的本质区别：**

半双工语音系统（如早期的 Siri、Alexa、甚至 GPT-4o 的语音模式初版）的工作方式是：用户说话 → 系统检测语音结束（VAD）→ 语音转文字（ASR）→ LLM 生成回复 → 文字转语音（TTS）→ 播放。整个过程是串行的，用户说话时 AI 不能响应，AI 说话时用户也无法打断。

全双工语音系统（Moshi、PersonaPlex、OpenAI Realtime API）则完全不同：AI 和用户可以在同一时间说话，AI 能理解用户的中断信号并即时调整回应，对话中有自然的停顿、重叠、语气词——就像真实的人际对话。

**全双工语音 AI 的关键能力：**
- **同时收发**（Simultaneous Send/Receive）：AI 边听用户说话边生成回复
- **可打断**（Interruptible）：用户可以在 AI 说话中途打断，AI 能即时响应
- **自然停顿**（Natural Pause）：AI 会像真人一样在对话中停顿、思考
- **语气词与填充**（Backchannel）：AI 会发出"嗯"、"对"、"好的"等确认信号
- **平滑换话**（Smooth Turn-taking）：交接自然，没有机械感

全双工语音 AI 不仅仅是"延迟更低"，而是**对话范式的根本变革**。它要求模型同时理解语义、情感和对话节奏，在毫秒级的时间窗口内做出响应决策。`,
      mermaid: `graph TD
    A["用户说话"] --> B["Mimi 编解码器
实时编码"]
    B --> C["双流模型
同时处理用户+AI 音频"]
    C --> D["深度 Transformer
码本间依赖建模"]
    D --> E["时间 Transformer
7B 参数时序建模"]
    E --> F["Mimi 解码
AI 语音输出"]

    G["内心独白流
提升生成质量"] -.-> E
    H["文本 Token 流
语义 grounding"] -.-> E
    class F s2
    class E s1
    class C s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12
    classDef s2 fill:#14532d`,
    },
    {
      title: "Moshi：全双工语音 AI 的开山之作",
      body: `Moshi 由法国 AI 实验室 Kyutai 于 2024 年 10 月发布，是首个开源的全双工语音-语音对话模型。它的出现标志着语音 AI 从"管线拼接"走向"端到端建模"。

**Moshi 的核心架构创新：**

**1. Mimi 神经音频编解码器**

Moshi 的底层基础是 Mimi（Mimi Is Mimi），一个革命性的流式神经音频编解码器。理解 Mimi 是理解 Moshi 的关键。

传统音频编解码器（如 MP3、Opus）是为人类听觉优化的，而 Mimi 是为**AI 理解**优化的。它将 24kHz 音频压缩为 12.5 Hz 的 Token 表示，带宽仅 1.1 kbps，同时保持极高的语义保真度。

Mimi 相比前代编解码器的关键改进：

- **Transformer 编码器 + 解码器**：在编码器和解码器中都引入 Transformer，而传统编解码器（SoundStream、EnCodec）只用 CNN
- **12.5 Hz 帧率**：通过自适应 Stride 设计，将音频帧率从传统编解码器的 50 Hz 降低到 12.5 Hz，更接近文本 Token 的生成频率（约 3-4 Hz）
- **蒸馏损失（Distillation Loss）**：强制第一个码本的 Token 匹配 WavLM 的自监督表示，同时建模语义和声学信息
- **纯对抗训练**：只用对抗损失 + 特征匹配，不用传统编解码器中的重建损失

**2. 双流音频建模**

Moshi 同时建模两个音频流：
- **AI 说话流**：Moshi 自己生成的语音
- **用户说话流**：用户正在说的语音

这使得 Moshi 能够在用户说话的同时生成回复，实现真正的"边听边说"。

**3. 内心独白流（Inner Monologue）**

Moshi 的第三个秘密武器：它除了生成语音 Token 外，还会生成一个"内心独白"Token 流。这个内部思考过程不直接输出给用户，但极大提升了回复质量——就像人类在说话前先在脑中组织语言一样。

**4. Depth Transformer + Temporal Transformer 双塔架构**

Moshi 使用两种 Transformer 协同工作：
- **Depth Transformer**（小型）：建模同一时间步内不同码本之间的依赖关系
- **Temporal Transformer**（大型，7B 参数）：建模时间序列上的依赖关系

这种设计使 Moshi 在保持低延迟的同时，拥有强大的语言理解能力。

**5. 延迟表现**

Moshi 的理论延迟低至 160ms（80ms 的 Mimi 帧大小 + 80ms 的声学延迟），在 L4 GPU 上的实际延迟约为 200ms。相比之下，传统 ASR→LLM→TTS 管线的延迟通常在 1-3 秒。`,
      table: {
        headers: ["指标", "Moshi", "传统管线 (ASR+LLM+TTS)", "OpenAI Realtime API"],
        rows: [
          ["理论延迟", "160ms", "1000-3000ms", "~320ms"],
          ["实际延迟 (GPU)", "~200ms (L4)", "1000-3000ms", "~500ms"],
          ["音频帧率", "12.5 Hz", "取决于 ASR", "~24-50 Hz"],
          ["带宽", "1.1 kbps", "原始音频", "压缩传输"],
          ["全双工", "✅ 原生支持", "❌ 半双工", "✅ 支持"],
          ["可打断", "✅ 原生支持", "❌ 需要 VAD 检测", "✅ 支持"],
          ["开源", "✅ MIT", "❌", "❌"],
          ["本地部署", "✅ PyTorch/MLX/Rust", "需要多个服务", "❌ 仅云端"],
        ],
      },
      code: [
        {
          lang: "python",
          code: `# Moshi 快速上手：启动本地全双工语音对话服务器
# pip install moshi
# 需要 HuggingFace Token 并接受模型许可

import os
os.environ["HF_TOKEN"] = "your_huggingface_token"

# 启动交互式服务器（默认端口 8998）
# 浏览器访问 https://localhost:8998 即可对话
# SSL_DIR=$(mktemp -d); python -m moshi.server --ssl "$SSL_DIR"

# 离线评估模式：输入 wav 文件，输出回复 wav 文件
# python -m moshi.offline \\
#   --voice-prompt "Moshika.pt" \\
#   --input-wav "input.wav" \\
#   --seed 42 \\
#   --output-wav "output.wav" \\
#   --output-text "output.json"`,
          filename: "moshi_demo.py",
        },
        {
          lang: "bash",
          code: `# MLX 版本：在 Mac 上本地运行 Moshi
# 支持 INT4/INT8/BF16 量化

# 安装 MLX 版本
pip install moshi_mlx

# 下载 INT4 量化模型（约 2GB）
# Moshika (女声) 或 Moshiko (男声)
# https://huggingface.co/kyutai/moshika-mlx-q4

# 在 Mac 上运行
python -m moshi_mlx.server

# MLX 版本的优势：
# - 利用 Apple Silicon 的 Neural Engine
# - 无需 GPU，MacBook 即可运行
# - INT4 量化后模型约 2GB`,
          filename: "moshi_mlx.sh",
        },
      ],
    },
    {
      title: "PersonaPlex：在 Moshi 之上实现人格控制",
      body: `2026 年 2 月，NVIDIA 在 Moshi 的基础上发布了 **PersonaPlex**，将全双工语音 AI 从"一个声音"升级为"千变万化的角色"。

**PersonaPlex 的核心创新：混合系统提示（Hybrid System Prompts）**

Moshi 的局限在于它只有一个固定的角色和声音。PersonaPlex 通过两种条件控制机制突破了这一限制：

**1. 文本角色提示（Role Conditioning via Text Prompts）**

PersonaPlex 允许通过文本提示为 AI 设定角色、背景知识和行为模式。例如：

- "你是 CitySan Services 的客服 Ayelen，负责垃圾管理服务，客户 Omar Torres 的下次收运日期是 4 月 12 日"
- "你是 Mars 任务宇航员 Alex，反应堆核心正在熔毁，需要紧急求助"
- "你是一个智慧友善的老师，用清晰有趣的方式回答问题"

这意味着同一个模型可以扮演客服、老师、宇航员、朋友等无数角色。

**2. 语音声音控制（Voice Conditioning via Audio Samples）**

PersonaPlex 支持通过语音样本控制输出声音的特征。模型内置了 20 种预训练声音（10 男 10 女），分为自然（NAT）和多样化（VAR）两类：

- NATF0-NATF3：自然女声，适合客服和助手场景
- NATM0-NATM3：自然男声，适合新闻播报和教学场景
- VARF0-VARF4：多样化女声，适合娱乐和虚拟陪伴场景
- VARM0-VARM4：多样化男声，适合游戏和互动场景

**3. 训练数据：大规模合成对话**

PersonaPlex 的训练数据非常有特色——它不使用真实人类对话，而是用开源 LLM 和 TTS 模型生成大规模的合成对话数据：

- 用 LLM 生成角色设定和对话内容
- 用 TTS 模型将文本转换为语音
- 组合成"角色设定 + 用户-Agent 对话"的配对数据

这种方法的优势是数据量可以无限扩展，且每个样本都带有精确的角色标注。

**4. 评估：Full-Duplex-Bench 多角色扩展**

PersonaPlex 团队扩展了 Full-Duplex-Bench 基准，从单一助手角色扩展到多角色客服场景，评估维度包括：
- **角色依从性（Role Adherence）**：AI 是否按照设定角色行事
- **说话人相似度（Speaker Similarity）**：输出声音是否符合设定
- **延迟（Latency）**：响应速度
- **自然度（Naturalness）**：对话是否自然流畅

实验结果表明，PersonaPlex 在所有维度上均超越了当时的最佳全双工语音模型和混合 LLM+语音系统。`,
      mermaid: `graph LR
    A["角色文本提示\
你是谁、你知道什么"] --> C["PersonaPlex\
7B 全双工模型"]
    B["语音样本\
目标音色特征"] --> C
    
    C --> D["用户语音输入\
实时编码"]
    C --> E["AI 语音输出\
角色声音 + 角色行为"]
    
    D --> C
    
    subgraph "训练数据"
      F["LLM 生成角色设定"] --> G["TTS 生成语音"]
      G --> H["合成对话数据"]
    end
    
    H -.训练.-> C
    class E s3
    class B s2
    class A s1
    class C s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12
    classDef s2 fill:#581c87
    classDef s3 fill:#14532d`,
      code: [
        {
          lang: "python",
          code: `# PersonaPlex 客服角色示例
# 安装: pip install moshi/ (从 personaplex repo)
# 需要: HF_TOKEN 并接受 nvidia/personaplex-7b-v1

import os
os.environ["HF_TOKEN"] = "your_token"

# 客服角色：垃圾管理公司 CitySan Services
# 角色提示文本
prompt = """You work for CitySan Services which is a waste management 
and your name is Ayelen Lucero. 
Information: Verify customer name Omar Torres. 
Current schedule: every other week. 
Upcoming pickup: April 12th. 
Compost bin service available for $8/month add-on."""

# 使用 NATF2 自然女声音色
# 运行离线评估
# python -m moshi.offline \\
#   --voice-prompt "NATF2.pt" \\
#   --text-prompt "$prompt" \\
#   --input-wav "customer_query.wav" \\
#   --seed 42424242 \\
#   --output-wav "response.wav" \\
#   --output-text "response.json"

# 服务角色示例：餐厅点餐
restaurant_prompt = """You work for Jerusalem Shakshuka which is a restaurant 
and your name is Owen Foster. 
Information: Two shakshuka options: Classic ($9.50) and Spicy ($10.25). 
Sides: warm pita ($2.50), Israeli salad ($3). 
Available for drive-through until 9 PM."""

# 宇航员紧急场景示例
astronaut_prompt = """You enjoy having a good conversation. 
You are an astronaut on a Mars mission. Your name is Alex. 
You are dealing with a reactor core meltdown. 
Several ship systems are failing. You urgently ask for help."""`,
          filename: "personaplex_roles.py",
        },
        {
          lang: "python",
          code: `# PersonaPlex 本地 Web UI 服务器
# 支持实时语音交互，浏览器即可使用

# 启动服务器（需要 HTTPS）
# SSL_DIR=$(mktemp -d)
# python -m moshi.server --ssl "$SSL_DIR"

# 内存不足时使用 CPU Offload
# 需要安装 accelerate: pip install accelerate
# SSL_DIR=$(mktemp -d)
# python -m moshi.server --ssl "$SSL_DIR" --cpu-offload

# 服务器启动后访问:
# https://localhost:8998

# 远程访问时查看日志中打印的 URL
# 支持 WebSocket 实时语音传输

# 纯 CPU 推理（速度慢但无需 GPU）
# pip install torch --index-url https://download.pytorch.org/whl/cpu
# python -m moshi.offline --cpu-offload ...`,
          filename: "personaplex_server.py",
        },
      ],
    },
    {
      title: "全双工语音 AI 技术全景对比",
      body: `2026 年，全双工语音 AI 领域呈现百花齐放的态势。除了 Moshi 和 PersonaPlex，还有多个重要项目值得关注。

**开源项目：**

**1. Moshi（Kyutai）**：全双工语音对话的开山之作，7B 参数，基于 Mimi 编解码器。理论延迟 160ms，支持 MLX（Mac/iPhone）和 Rust（生产环境）部署。GitHub 星标超过 30K，是最大的开源全双工语音项目。

**2. PersonaPlex（NVIDIA）**：基于 Moshi 微调，增加了角色和声音控制能力。面向客服、教育、娱乐等多角色场景。HuggingFace 模型为 nvidia/personaplex-7b-v1。

**3. Hibiki（Kyutai）**：Kyutai 推出的同步语音翻译模型，基于 Moshi 架构，支持低延迟的跨语言语音翻译。

**4. MoshiRAG**：社区项目，将 Moshi 与 RAG（检索增强生成）结合，实现全双工语音对话中的实时知识检索。解决了 Moshi 知识截止日期的限制。

**5. Audio Flamingo Next（NVIDIA）**：最强开源音频语言模型，使用 AF-Whisper 编码器，支持音频理解、音乐分析、语音情感识别等多模态任务。

**商业方案：**

**1. OpenAI Realtime API**：OpenAI 的 GPT-4o 实时语音 API，基于 WebRTC 传输，支持全双工对话。延迟约 320ms，集成度最高但仅限云端使用。

**2. Google Gemini Live**：Google 的全双工语音对话方案，集成 Gemini 多模态模型，支持图像理解和语音对话的混合交互。

**3. 科大讯飞星火语音**：国内领先的全双工语音方案，支持中文场景下的低延迟对话，在客服和智能家居领域有广泛部署。

**关键技术挑战：**

尽管全双工语音 AI 进展迅速，但仍面临几个核心挑战：

- **延迟与质量的权衡**：更低的延迟意味着更短的思考时间，可能影响回复质量。内心独白流（Inner Monologue）是缓解这一矛盾的关键技术。
- **多语言支持**：Moshi 和 PersonaPlex 主要面向英语，中文全双工语音 AI 仍处于起步阶段。
- **情感理解**：当前的全双工模型能处理语义，但对情感、语气、幽默的细粒度理解仍有不足。
- **安全与伦理**：PersonaPlex 的角色扮演能力引发关于 AI 冒充真人、语音深度伪造等伦理问题的讨论。`,
      table: {
        headers: ["项目", "机构", "开源", "参数", "延迟", "特色能力", "部署方式"],
        rows: [
          ["Moshi", "Kyutai", "✅ MIT", "7B", "~200ms", "全双工原生、内心独白", "PyTorch/MLX/Rust"],
          ["PersonaPlex", "NVIDIA", "✅ MIT", "7B", "~200ms", "角色控制、声音克隆", "PyTorch + CPU Offload"],
          ["Hibiki", "Kyutai", "✅", "7B", "~200ms", "同步语音翻译", "PyTorch"],
          ["Realtime API", "OpenAI", "❌", "未公开", "~320ms", "WebRTC、GPT-4o 集成", "仅云端 API"],
          ["Gemini Live", "Google", "❌", "未公开", "~500ms", "多模态（图+语音）", "仅云端 API"],
          ["Audio Flamingo Next", "NVIDIA", "✅", "未公开", "N/A", "音频理解、多模态", "PyTorch"],
        ],
      },
    },
    {
      title: "Mimi 编解码器深度解析",
      body: `Mimi 是 Moshi 和 PersonaPlex 的核心基础设施，没有 Mimi 就没有低延迟全双工语音 AI。本节深入解析 Mimi 的技术设计。

**Mimi 的设计目标：**

传统的神经音频编解码器（Neural Audio Codec）如 SoundStream 和 EnCodec 面临一个根本矛盾：高压缩比（低比特率）通常意味着高延迟和高计算复杂度，而低延迟通常意味着低压缩比。Mimi 打破了这一矛盾。

**Mimi 的技术架构：**

**1. 编码器结构**

Mimi 的编码器将 24kHz 音频信号压缩为低帧率的 Token 序列：

- **输入**：24kHz 单声道音频
- **输出**：12.5 Hz Token 序列（每 80ms 一个 Token）
- **码本数量**：8 个残差向量量化（RVQ）码本
- **带宽**：1.1 kbps（极低）

编码器的核心是**带 Transformer 的 CNN 堆叠**：
- 使用自适应 Stride 的卷积层逐步降低时间分辨率
- 在中间层引入 Transformer 模块，捕获长程依赖
- 最后的 RVQ 层将连续表征离散化为 Token

**2. 解码器结构**

解码器将 Token 序列重建为高质量音频：

- 使用 RVQ 将 Token 映射为连续向量
- Transformer 解码器处理 Token 序列
- 自适应 Stride 的转置卷积逐步恢复时间分辨率
- 输出 24kHz 音频信号

**3. 蒸馏损失（WavLM Distillation）**

Mimi 最关键的创新之一是蒸馏损失：在训练时，强制第一个 RVQ 码本的输出与 WavLM 的自监督表示对齐。这样做的好处是：

- 第一个码本捕获语义信息（语言内容）
- 后续码本捕获声学细节（音色、韵律、情感）
- 模型同时理解"说什么"和"怎么说"

这种设计使得 Mimi 的 Token 不仅适合音频重建，也适合语言模型理解——Token 本身就有语义含义。

**4. 对抗训练（Adversarial Training）**

与传统的 MSE 重建损失不同，Mimi 只用对抗损失 + 特征匹配：

- 判别器区分真实音频和重建音频
- 生成器试图骗过判别器
- 特征匹配损失确保中间层特征也匹配

这种方法产生的音频在主观质量（MOS 评分）上显著优于使用重建损失的方法。

**5. 与 SpeechTokenizer 的对比**

| 特性 | Mimi | SpeechTokenizer |
|------|------|-----------------|
| 帧率 | 12.5 Hz | 50 Hz |
| 带宽 | 1.1 kbps | 4 kbps |
| Transformer | 编码器 + 解码器 | 无 |
| 蒸馏 | WavLM | 无 |
| 训练损失 | 纯对抗 | 重建 + 对抗 |
| 流式 | ✅ 完全流式 | 部分流式 |

Mimi 的低帧率（12.5 Hz vs 50 Hz）是关键优势：它减少了自回归生成所需的步数，从而降低了整体延迟。`,
      mermaid: `graph TD
    A["24kHz 音频输入"] --> B["CNN 编码器
自适应 Stride"]
    B --> C["Transformer 编码
长程依赖建模"]
    C --> D["RVQ 量化
8 个码本"]
    
    D --> E["码本 1: 语义信息
WavLM 蒸馏对齐"]
    D --> F["码本 2-8: 声学细节
音色/韵律/情感"]
    
    E --> G["12.5 Hz Token 序列
1.1 kbps"]
    F --> G
    
    G --> H["Transformer 解码"]
    H --> I["转置卷积
恢复时间分辨率"]
    I --> J["24kHz 音频输出"]
    class G s3
    class F s2
    class E s1
    class D s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12
    classDef s2 fill:#581c87
    classDef s3 fill:#14532d`,
      tip: `关键洞察：Mimi 的成功在于它不是"更好的音频压缩器"，而是"为 AI 对话优化的音频表示"。它将音频压缩到 LLM 能有效处理的频率和带宽，同时保留了语义和声学的双重信息。这是语音 AI 从"管线拼接"走向"端到端建模"的关键基础设施。`,
    },
    {
      title: "全双工语音 AI 的应用场景与未来展望",
      body: `全双工语音 AI 不仅仅是一项技术突破，它正在催生全新的应用场景和交互范式。

**1. 智能客服（已落地）**

PersonaPlex 的多角色客服能力已经展示了商业价值：
- 一个模型可以扮演数百个不同角色的客服
- 通过文本提示即可切换角色，无需重新训练
- 声音克隆能力让每个品牌有独特的"声音身份"
- 全双工特性让客服对话自然流畅，用户可以随时打断

**2. 语音教育助手（快速发展）**

- AI 老师可以用不同的"教学人格"授课
- 学生可以随时提问、打断、要求重复
- 多语言支持（未来）让全球教育更加普惠

**3. 虚拟陪伴与心理健康（探索中）**

- PersonaPlex 的角色设定能力可以创建个性化的虚拟伙伴
- 全双工对话的自然感让陪伴体验更加真实
- **伦理警示**：需要明确告知用户对方是 AI，避免情感依赖和误导

**4. 实时语音翻译（Hibiki 方向）**

- Kyutai 的 Hibiki 项目展示了低延迟跨语言翻译的可能性
- 未来可能实现"我说中文，对方听到日语"的实时翻译通话

**5. 游戏 NPC 对话（前沿探索）**

- PersonaPlex 的宇航员角色展示了游戏 NPC 的新可能性
- 未来的游戏 NPC 不再是预设对话树，而是可以实时互动的"角色"

**未来挑战与方向：**

**短期（2026-2027）：**
- 多语言扩展：中文、日语等亚洲语言的全双工支持
- 端侧部署优化：在手机和 IoT 设备上运行
- 与 RAG 结合：MoshiRAG 等项目的成熟

**中期（2027-2028）：**
- 情感计算：理解和表达更丰富的情感
- 多模态融合：语音 + 视觉 + 触觉的统一交互
- 个性化学习：模型在与用户的交互中持续进化

**长期（2028+）：**
- 真正的"语音原生 AGI"：不依赖文本中间表示的纯语音智能
- 脑机接口融合：跳过声学通道，直接神经信号交互
- 语音社交网络：AI 角色参与的混合社交空间`,
      warning: "伦理提醒：PersonaPlex 等全双工语音模型的声音克隆和角色扮演能力可能被滥用于语音深度伪造（Voice Deepfake）和身份冒充。使用时应遵循以下原则：1) 明确告知用户对方是 AI；2) 不得用于欺骗、欺诈或未经授权的身份冒充；3) 遵守当地关于语音合成和数据隐私的法律法规。",
      mermaid: `graph TD
    A["全双工语音 AI"] --> B["智能客服"]
    A --> C["语音教育"]
    A --> D["虚拟陪伴"]
    A --> E["实时翻译"]
    A --> F["游戏 NPC"]
    
    B --> B1["多角色切换"]
    B --> B2["声音品牌化"]
    B --> B3["自然对话体验"]
    
    C --> C1["个性化教学"]
    C --> C2["随时提问打断"]
    
    D --> D1["虚拟伙伴"]
    D --> D2["心理健康支持"]
    
    E --> E1["低延迟跨语言"]
    E --> E2["Hibiki 方向"]
    
    F --> F1["动态角色互动"]
    F --> F2["非预设对话"]
    class D s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12`,
    },
    {
      title: "动手实践：部署你自己的全双工语音 AI",
      body: `本节提供三种不同场景的部署指南，从快速体验到生产部署。

**场景一：Mac 本地体验（最简单）**

利用 Apple Silicon 的 MLX 后端，你可以在 MacBook 上直接运行 Moshi：

**场景二：GPU 服务器部署（推荐）**

使用 NVIDIA GPU 获得最佳性能：

**场景三：生产环境部署（Rust 后端）**

对于生产环境，Moshi 提供了 Rust 实现：

部署注意事项：
- **HTTPS 必需**：浏览器麦克风访问需要 HTTPS，本地开发可用自签名证书
- **内存要求**：7B 参数模型 BF16 约 14GB 显存，INT8 约 7GB，INT4 约 3.5GB
- **网络延迟**：远程部署时需考虑 WebSocket 传输延迟，建议在 50ms 以内
- **并发限制**：单 GPU 通常只能服务 1-2 个并发用户，需要多 GPU 扩展`,
      code: [
        {
          lang: "bash",
          code: `# 场景一：Mac 本地体验 Moshi
# 硬件要求：Apple M1/M2/M3，16GB+ 内存

# 1. 安装 Homebrew（如果还没有）
# /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装 Opus 音频库（必需）
brew install opus

# 3. 安装 Moshi MLX 版本
pip install moshi_mlx

# 4. 设置 HuggingFace Token
export HF_TOKEN="your_token_here"

# 5. 启动服务器
python -m moshi_mlx.server

# 6. 浏览器访问 https://localhost:8998
# 允许麦克风和 HTTPS 证书

# 内存占用参考：
# INT4 量化：约 2GB 模型 + 2GB 运行时 ≈ 4GB
# INT8 量化：约 4GB 模型 + 3GB 运行时 ≈ 7GB
# BF16 全精度：约 8GB 模型 + 6GB 运行时 ≈ 14GB

# 推荐使用 INT4，M2 Max 即可流畅运行`,
          filename: "mac_setup.sh",
        },
        {
          lang: "bash",
          code: `# 场景二：GPU 服务器部署 PersonaPlex
# 硬件要求：NVIDIA GPU（L4/A100/H100），16GB+ 显存

# 1. 安装 Opus 开发库
sudo apt update && sudo apt install -y libopus-dev

# 2. 安装 PyTorch（根据你的 GPU 型号）
# RTX 4090 / Blackwell GPU 需要 cu130
pip install torch torchvision torchaudio \\
  --index-url https://download.pytorch.org/whl/cu130

# 其他 GPU 使用标准版本
# pip install torch torchvision torchaudio

# 3. 克隆并安装 PersonaPlex
git clone https://github.com/NVIDIA/personaplex.git
cd personaplex
pip install -e .

# 4. 设置 HuggingFace Token
# 需要在 https://huggingface.co/nvidia/personaplex-7b-v1 接受许可
export HF_TOKEN="your_token_here"

# 5. 启动服务器
SSL_DIR=$(mktemp -d)
python -m moshi.server --ssl "$SSL_DIR"

# 显存不足时使用 CPU Offload
# pip install accelerate
# python -m moshi.server --ssl "$SSL_DIR" --cpu-offload

# 6. 浏览器访问 https://localhost:8998

# 性能参考：
# L4 GPU BF16: ~200ms 延迟
# A100 BF16: ~150ms 延迟  
# H100 BF16: ~120ms 延迟
# L4 + CPU Offload: ~500ms 延迟（但只需 8GB 显存）`,
          filename: "gpu_setup.sh",
        },
        {
          lang: "bash",
          code: `# 场景三：生产环境部署（Rust 后端）
# 适合高并发、低延迟的生产场景

# 1. 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 2. 安装 Opus 开发库
sudo apt install -y libopus-dev pkg-config

# 3. 克隆 Moshi 仓库
git clone https://github.com/kyutai-labs/moshi.git
cd moshi

# 4. 构建 Rust 版本
cd rust
cargo build --release

# 5. 配置生产参数
# - 设置并发连接数
# - 配置 SSL 证书
# - 集成监控系统（Prometheus/Grafana）
# - 设置自动扩缩容

# Rust 版本的优势：
# - 更低的内存占用（无 Python 运行时开销）
# - 更好的并发处理能力
# - 更小的二进制体积
# - 更适合容器化部署（Docker/K8s）

# 典型生产架构：
# ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
# │  负载均衡器  │───▶│ Moshi Rust  │───▶│ GPU 集群    │
# │  (Nginx)    │    │  服务实例    │    │  (自动扩展)  │
# └─────────────┘    └─────────────┘    └─────────────┘`,
          filename: "production_setup.sh",
        },
      ],
    },
  ],
};
