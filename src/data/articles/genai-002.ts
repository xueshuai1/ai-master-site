import { Article } from '../knowledge';

export const article: Article = {
    id: "genai-002",
    title: "Stable Diffusion（二）：从原理到实战",
    category: "genai",
    tags: ["Stable Diffusion", "图像生成", "潜在扩散"],
    summary: "从文本到图像，理解 Stable Diffusion 如何实现高质量图像生成",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
  learningPath: {
    routeId: "diffusion-series",
    phase: 2,
    order: 2,
    nextStep: "genai-007",
    prevStep: "genai-001",
  },
    content: [
        {
            title: "1. 从 Diffusion 到 Stable Diffusion",
            body: `Stable Diffusion 是 Stability AI 于 2022 年发布的开源文生图模型，它将扩散模型的生成能力推向了新的高度。与 DDPM 等早期扩散模型直接在像素空间操作不同，Stable Diffusion 的核心创新在于将扩散过程转移到潜在空间（Latent Space）中执行。这一改变带来了革命性的效率提升：在 64x64 的潜在空间中进行扩散，比在 512x512 的像素空间中计算量降低了 48 倍。Stable Diffusion 的架构由三大组件构成：变分自编码器（VAE）负责像素空间与潜在空间之间的转换，U-Net 在潜在空间中执行去噪过程，CLIP 文本编码器将自然语言提示词转化为条件向量。三者协同工作，使得模型能够根据任意文本描述生成高分辨率、高质量的图像。Stable Diffusion 的训练数据是 LAION-5B，一个包含 58.5 亿图文对的超大规模数据集，这赋予了模型惊人的泛化能力。更重要的是，Stable Diffusion 以 860M 参数和 4GB 显存的低门槛实现了开源，彻底改变了 AI 图像生成的生态格局。`,
            code: [
                {
                    lang: "python",
                    code: `# Stable Diffusion 三大组件概览\nfrom diffusers import StableDiffusionPipeline\nimport torch\n\n# 加载预训练模型（自动下载 VAE + U-Net + Text Encoder）\npipe = StableDiffusionPipeline.from_pretrained(\n    "runwayml/stable-diffusion-v1-5",\n    torch_dtype=torch.float16,\n    safety_checker=None\n)\npipe = pipe.to("cuda")\n\n# 一键文生图\nimage = pipe(\n    prompt="a futuristic city at sunset, cyberpunk style",\n    negative_prompt="blurry, low quality",\n    num_inference_steps=50,\n    guidance_scale=7.5,\n).images[0]\nimage.save("output.png")`
                },
                {
                    lang: "python",
                    code: `# 模型参数量与显存需求对比\nmodels = {\n    "DDPM (256x256)":  {"params": "350M",  "vram": "~8GB",  "space": "像素空间"},\n    "DALL-E 2":        {"params": "3.5B",  "vram": "~40GB", "space": "CLIP 空间"},\n    "SD 1.5 (512x512)": {"params": "860M",  "vram": "~4GB",  "space": "潜在空间"},\n    "SDXL (1024x1024)": {"params": "2.6B",  "vram": "~8GB",  "space": "潜在空间"},\n}\n\nfor name, spec in models.items():\n    print(f"{name:20s} | {spec['params']:>6s} | {spec['vram']:>7s} | {spec['space']}")`
                }
            ],
            table: {
                headers: ["模型", "参数量", "显存需求", "操作空间", "开源"],
                rows: [
                    ["DDPM", "350M", "~8GB", "像素空间 (256x256)", "是"],
                    ["DALL-E 2", "3.5B", "~40GB", "CLIP 隐空间", "否"],
                    ["Stable Diffusion 1.5", "860M", "~4GB", "潜在空间 (64x64)", "是"],
                    ["Stable Diffusion XL", "2.6B", "~8GB", "潜在空间 (128x128)", "是"],
                    ["Imagen", "4.6B", "~20GB", "像素空间 (级联)", "否"]
                ]
            },
            mermaid: `graph TD
    A["文本提示词"] --> B["CLIP 文本编码器"]
    B --> C["文本嵌入向量"]
    D["随机噪声"] --> E["U-Net 去噪网络"]
    C -->|"条件输入"| E
    E --> F["潜在空间表示"]
    F --> G["VAE 解码器"]
    G --> H["512x512 输出图像"]
    subgraph Stable Diffusion
    B
    E
    G
    end`,
            tip: "初次使用建议从 SD 1.5 开始，4GB 显存即可运行，生态最成熟。",
            warning: "SDXL 虽然质量更高，但需要 8GB 以上显存，且提示词工程要求不同。"
        },
        {
            title: "2. 潜在空间（Latent Space）",
            body: `潜在空间是 Stable Diffusion 区别于传统扩散模型的核心创新。其基本思想是：自然图像在像素空间中高度冗余，相邻像素之间存在极强的相关性，直接在像素空间中进行扩散计算效率极低。Stable Diffusion 使用预训练的变分自编码器（VAE）将图像压缩到低维潜在空间。VAE 的编码器将 3x512x512 的图像压缩为 4x64x64 的潜在表示，压缩比达到 48 倍。在潜在空间中，扩散过程的计算量大幅降低，同时保留了图像的语义信息。VAE 的训练目标是重构损失加 KL 正则化，确保潜在空间连续且可解码。值得注意的是，Stable Diffusion 中 VAE 的训练与扩散训练是分阶段进行的：先训练好 VAE 冻结其权重，再训练 U-Net 在潜在空间中进行扩散。这种解耦设计使得每个组件可以独立优化。潜在空间不仅加速了扩散过程，还为后续的图像编辑（如 Inpainting、Outpainting）提供了天然的操作接口。`,
            code: [
                {
                    lang: "python",
                    code: `# VAE 编码与解码过程\nimport torch\nimport torch.nn as nn\nfrom diffusers import AutoencoderKL\n\n# 加载预训练 VAE\nvae = AutoencoderKL.from_pretrained(\n    "runwayml/stable-diffusion-v1-5",\n    subfolder="vae",\n    torch_dtype=torch.float16\n)\nvae = vae.to("cuda")\n\n# 编码：像素空间 -> 潜在空间\n# 输入: (1, 3, 512, 512) -> 输出: (1, 4, 64, 64)\nwith torch.no_grad():\n    latent = vae.encode(pixels).latent_dist.sample()\n    latent = latent * vae.config.scaling_factor  # 缩放因子 0.18215\n\n# 解码：潜在空间 -> 像素空间\nwith torch.no_grad():\n    latent = latent / vae.config.scaling_factor\n    decoded = vae.decode(latent).sample\n    # decoded shape: (1, 3, 512, 512)`
                },
                {
                    lang: "python",
                    code: `# VAE 重构质量评估\nimport torch\nfrom torch.nn.functional import mse_loss\nfrom lpips import LPIPS\n\nlpips_model = LPIPS(net="vgg").to("cuda")\n\ndef evaluate_vae(vae, images):\n    """评估 VAE 的重构质量\"\"\"\n    with torch.no_grad():\n        # 编码\n        posterior = vae.encode(images).latent_dist\n        latents = posterior.sample() * vae.config.scaling_factor\n        \n        # 解码\n        latents = latents / vae.config.scaling_factor\n        reconstructed = vae.decode(latents).sample\n    \n    # 计算重构误差\n    mse = mse_loss(images, reconstructed).item()\n    lpips = lpips_model(images, reconstructed).mean().item()\n    \n    print(f"MSE: {mse:.6f}")\n    print(f"LPIPS: {lpips:.4f} (越低越好, <0.05 为优秀)")\n    return reconstructed`
                }
            ],
            table: {
                headers: ["VAE 组件", "输入维度", "输出维度", "压缩比", "作用"],
                rows: [
                    ["编码器 Encoder", "(B, 3, 512, 512)", "(B, 8, 64, 64)", "48x", "提取特征"],
                    ["瓶颈层 Bottleneck", "(B, 8, 64, 64)", "(B, 8, 64, 64)", "1x", "均值与方差"],
                    ["采样层 Sample", "(B, 8, 64, 64)", "(B, 4, 64, 64)", "2x", "重参数化采样"],
                    ["解码器 Decoder", "(B, 4, 64, 64)", "(B, 3, 512, 512)", "1/48x", "重构图像"],
                    ["缩放因子 Scaling", "(B, 4, 64, 64)", "(B, 4, 64, 64)", "0.18215", "稳定训练"]
                ]
            },
            mermaid: `graph LR
    A["像素图像 3x512x512"] --> B["Encoder 卷积网络"]
    B --> C["均值 mu + 方差 log_var"]
    C --> D["重参数化采样"]
    D --> E["潜在表示 4x64x64"]
    E --> F["扩散过程 U-Net"]
    E --> G["Decoder 转置卷积"]
    G --> H["重构图像 3x512x512"]

    class E s0
    classDef s0 fill:#1e3a5f

    class F s1`,
            tip: "VAE 的重构质量直接影响最终生成图像的细节，选择高质量的 VAE 至关重要。",
            warning: "潜在空间中的操作（如编辑 latent）需要小心，超出训练分布可能导致解码异常。"
        },
        {
            title: "3. CLIP 文本编码器",
            body: `CLIP（Contrastive Language-Image Pre-training）是 OpenAI 提出的图文对比学习模型，它为 Stable Diffusion 提供了理解自然语言的能力。CLIP 使用双塔架构：一个视觉编码器（ViT 或 ResNet）和一个文本编码器（Transformer），通过对比学习在大规模图文对上联合训练。在 Stable Diffusion 中，我们使用的是 CLIP 的文本编码器部分，具体为 ViT-L/14 架构，隐藏层维度 768，上下文长度 77 个 token。文本编码器将用户输入的提示词转换为 77x768 的序列嵌入，然后经过线性投影变为 77x1024，作为 U-Net 中 Cross-Attention 层的条件输入。CLIP 的强大之处在于它学习到了文本与图像之间的语义对齐，使得 "a red car" 的文本嵌入与红色汽车图像的视觉嵌入在共享空间中距离很近。这也是 Stable Diffusion 能够理解复杂文本描述的关键。需要注意的是，CLIP 对提示词的格式和顺序非常敏感，精心设计的提示词工程可以显著提升生成质量。`,
            code: [
                {
                    lang: "python",
                    code: `# CLIP 文本编码器解析\nfrom transformers import CLIPTokenizer, CLIPTextModel\nimport torch\n\ntokenizer = CLIPTokenizer.from_pretrained(\n    "openai/clip-vit-large-patch14")\ntext_encoder = CLIPTextModel.from_pretrained(\n    "openai/clip-vit-large-patch14")\n\n# 文本 -> token -> 嵌入\nprompt = "a beautiful sunset over the ocean, golden hour"\ninputs = tokenizer(prompt, return_tensors="pt", padding="max_length",\n                   max_length=77, truncation=True)\n\nwith torch.no_grad():\n    outputs = text_encoder(input_ids=inputs.input_ids,\n                           attention_mask=inputs.attention_mask)\n    text_embeddings = outputs.last_hidden_state\n\nprint(f"Token count: {inputs.input_ids.shape[-1]}")  # 77\nprint(f"Embedding shape: {text_embeddings.shape}")     # (1, 77, 768)\nprint(f"Tokens: {tokenizer.convert_ids_to_tokens(inputs.input_ids[0][:10])}")`
                },
                {
                    lang: "python",
                    code: `# 提示词嵌入相似度分析\nimport torch\nimport torch.nn.functional as F\n\ndef compute_text_similarity(texts):\n    """计算提示词之间的语义相似度\"\"\"\n    tokens = tokenizer(texts, return_tensors="pt", padding=True,\n                       max_length=77, truncation=True)\n    with torch.no_grad():\n        embeddings = text_encoder(**tokens).last_hidden_state\n        # 使用 [CLS] token 的嵌入\n        cls_embeddings = embeddings[:, 0, :]\n    \n    similarities = F.cosine_similarity(\n        cls_embeddings.unsqueeze(1),\n        cls_embeddings.unsqueeze(0),\n        dim=-1\n    )\n    \n    for i, t1 in enumerate(texts):\n        for j, t2 in enumerate(texts):\n            if i < j:\n                print(f"{t1[:30]:30s} <-> {t2[:30]:30s}: " \n                      f"{similarities[i,j]:.4f}")\n\ntexts = ["a dog running in a park",\n         "a cat sleeping on a sofa",\n         "a beautiful dog playing outdoors"]\ncompute_text_similarity(texts)`
                }
            ],
            table: {
                headers: ["CLIP 组件", "架构", "维度", "作用"],
                rows: [
                    ["Tokenizer", "BPE 编码", "77 tokens", "文本分词"],
                    ["Text Encoder", "Transformer (12层)", "768 hidden", "文本理解"],
                    ["Projection", "Linear + LayerNorm", "1024 dim", "维度对齐"],
                    ["Visual Encoder", "ViT-L/14", "1024 hidden", "图像理解"],
                    ["对比损失", "InfoNCE", "batch_size", "图文对齐"]
                ]
            },
            mermaid: `graph TD
    A["文本提示词"] --> B["BPE Tokenizer"]
    B --> C["Token IDs [77]"]
    C --> D["Transformer Encoder"]
    D --> E["Hidden States [77, 768]"]
    E --> F["Linear Projection"]
    F --> G["Text Embeddings [77, 1024]"]
    G -->|"Cross-Attention Key/Value"| H["U-Net 去噪网络"]

    class G s0
    classDef s0 fill:#4c1d95,color:#f1f5f9`,
            tip: "使用加权提示词 (word:1.3) 可以增强特定概念的表达强度，这是常用的提示词技巧。",
            warning: "CLIP 对否定词理解较弱，negative prompt 在 Stable Diffusion 中作为独立机制处理。"
        },
        {
            title: "4. U-Net 去噪网络",
            body: `Stable Diffusion 的 U-Net 是整个架构中参数量最大的组件，约 860M 参数。它在潜在空间中工作，接收 4x64x64 的带噪潜在表示和时间步嵌入，输出相同维度的噪声预测。与 DDPM 中的 U-Net 相比，SD 的 U-Net 做了三个关键改进：第一，引入 Cross-Attention 层，将 CLIP 文本嵌入作为条件注入到网络中，每个 Down 和 Middle 块都包含 Cross-Attention；第二，使用 GroupNorm 替代 BatchNorm，对小 batch size 更友好；第三，增加了 Attention 块的数量和维度，在 8x8 和 16x16 分辨率处使用 Self-Attention 捕获长程依赖。U-Net 的结构遵循编码器-瓶颈-解码器模式：四个 Down 块逐步降低空间分辨率并增加通道数（320->640->1280->1280），一个 Middle 块包含 Self-Attention，四个 Up 块逐步恢复分辨率。每个残差块中都会注入时间步嵌入，使得网络能够在不同去噪阶段使用不同的策略。这种设计让 U-Net 既能理解文本语义，又能在不同尺度上操作图像特征。`,
            code: [
                {
                    lang: "python",
                    code: `# Stable Diffusion U-Net 结构解析\nfrom diffusers import UNet2DConditionModel\nimport torch\n\n# 加载 U-Net\nunet = UNet2DConditionModel.from_pretrained(\n    "runwayml/stable-diffusion-v1-5",\n    subfolder="unet",\n    torch_dtype=torch.float16\n)\n\n# U-Net 参数统计\ntotal_params = sum(p.numel() for p in unet.parameters())\nprint(f"Total params: {total_params / 1e6:.1f}M")  # ~860M\n\n# 前向传播\ncross_attention_dim = 768\nlatent = torch.randn(1, 4, 64, 64, dtype=torch.float16, device="cuda")\ntimestep = torch.tensor([500], device="cuda")\nencoder_hidden = torch.randn(1, 77, cross_attention_dim, dtype=torch.float16, device="cuda")\n\nwith torch.no_grad():\n    noise_pred = unet(latent, timestep, encoder_hidden_states=encoder_hidden).sample\n\nprint(f"Input:  {latent.shape}")     # (1, 4, 64, 64)\nprint(f"Output: {noise_pred.shape}")  # (1, 4, 64, 64)`
                },
                {
                    lang: "python",
                    code: `# 分析 U-Net 各层结构\nfrom diffusers import UNet2DConditionModel\n\nunet = UNet2DConditionModel.from_pretrained(\n    "runwayml/stable-diffusion-v1-5", subfolder="unet")\n\n# 打印块结构\nprint("=== Down Blocks ===")\nfor i, block in enumerate(unet.down_blocks):\n    has_attn = hasattr(block, "attentions") and block.attentions[0] is not None\n    print(f"  Down {i}: channels={block.resnets[0].in_channels}, " \n          f"attn={has_attn}, downsample={block.downsamplers is not None}")\n\nprint("=== Middle Block ===")\nmid = unet.mid_block\nprint(f"  Attention: {len(mid.attentions)} blocks")\nprint(f"  Resnets: {len(mid.resnets)} blocks")\n\nprint("=== Up Blocks ===")\nfor i, block in enumerate(unet.up_blocks):\n    has_attn = hasattr(block, "attentions") and block.attentions[0] is not None\n    print(f"  Up {i}: channels={block.resnets[0].in_channels}, " \n          f"attn={has_attn}, upsample={block.upsamplers is not None}")`
                }
            ],
            table: {
                headers: ["U-Net 层级", "通道数", "分辨率", "Attention", "作用"],
                rows: [
                    ["Down Block 0", "320", "64x64", "无", "浅层特征提取"],
                    ["Down Block 1", "320->640", "32x32", "无", "降采样+特征"],
                    ["Down Block 2", "640->1280", "16x16", "有 (Spatial)", "中层语义"],
                    ["Down Block 3", "1280->1280", "8x8", "有 (Spatial)", "深层语义"],
                    ["Middle Block", "1280", "8x8", "有 (Spatial+Cross)", "全局理解"],
                    ["Up Block 0", "1280->1280", "8x8->16x16", "有", "上采样+融合"],
                    ["Up Block 1", "1280->640", "16x16->32x32", "有", "恢复细节"],
                    ["Up Block 2", "640->320", "32x32->64x64", "无", "恢复细节"],
                    ["Up Block 3", "320->320", "64x64", "无", "最终输出"]
                ]
            },
            mermaid: `graph TD
    A["Latent 4x64x64"] --> D0["Down 0: 320ch"]
    D0 --> D1["Down 1: 640ch, 32x32"]
    D1 --> D2["Down 2: 1280ch, 16x16, Attn"]
    D2 --> D3["Down 3: 1280ch, 8x8, Attn"]
    D3 --> M["Middle: 1280ch, Attn+CrossAttn"]
    M --> U0["Up 0: 1280ch, 8x8, Attn"]
    U0 --> U1["Up 1: 640ch, 16x16, Attn"]
    U1 --> U2["Up 2: 320ch, 32x32"]
    U2 --> U3["Up 3: 320ch, 64x64"]
    U3 --> O["Noise Pred 4x64x64"]
    T["Text Emb [77,1024]"] -->|"CrossAttn"| M
    T -->|"CrossAttn"| D2
    T -->|"CrossAttn"| D3

    class M s0
    classDef s0 fill:#78350f,color:#f1f5f9`,
            tip: "使用 torch.compile 编译 U-Net 可以获得 20-40% 的推理加速，需要 PyTorch 2.0+。",
            warning: "修改 U-Net 架构（如添加层）后必须重新训练，不能直接复用预训练权重。"
        },
        {
            title: "5. 采样器对比：DDIM / PLMS / DPM",
            body: `采样器是控制扩散模型推理过程的核心组件，决定了从随机噪声到最终图像的迭代路径。Stable Diffusion 支持多种采样器，每种在速度和质量之间做出不同权衡。DDIM 是最基础的确定性采样器，将扩散过程视为 ODE 求解，支持 20-50 步的高质量生成。PLMS（Pseudo Linear Multistep）利用多步方法，用之前步骤的梯度信息加速收敛，通常 10-20 步即可获得不错结果。DPM-Solver 系列是目前最先进的采样器，基于常微分方程的高阶求解器，DPM-Solver++ 仅需 10-15 步就能达到 DDIM 50 步的质量。Euler 和 Heun 则是经典的一阶和二阶 ODE 求解器在扩散模型中的应用。采样器的选择还影响生成的确定性：确定性采样器（DDIM、DPM-Solver）相同种子产生相同结果，随机采样器（DDPM、Euler a）每次生成略有不同。实际应用中，DPM-Solver++ 2M Karras 是推荐的默认选择，在速度和质量之间取得最佳平衡。`,
            code: [
                {
                    lang: "python",
                    code: `# 不同采样器对比实验\nfrom diffusers import StableDiffusionPipeline, \\\n    DDIMScheduler, EulerDiscreteScheduler, \\\n    DPMSolverMultistepScheduler, LMSDiscreteScheduler\nimport torch, time\n\npipe = StableDiffusionPipeline.from_pretrained(\n    "runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16)\npipe = pipe.to("cuda")\n\nsamplers = {\n    "DDIM": DDIMScheduler.from_config(pipe.scheduler.config),\n    "Euler": EulerDiscreteScheduler.from_config(pipe.scheduler.config),\n    "DPM++ 2M": DPMSolverMultistepScheduler.from_config(pipe.scheduler.config),\n    "PLMS": LMSDiscreteScheduler.from_config(pipe.scheduler.config),\n}\n\nprompt = "a portrait of a warrior queen, fantasy art"\nresults = []\nfor name, scheduler in samplers.items():\n    pipe.scheduler = scheduler\n    start = time.time()\n    img = pipe(prompt, num_inference_steps=25, generator=torch.manual_seed(42)).images[0]\n    elapsed = time.time() - start\n    results.append((name, f"{elapsed:.2f}s"))\n    img.save(f"output_{name}.png")\n    print(f"{name:12s} | {elapsed:.2f}s")`
                },
                {
                    lang: "python",
                    code: `# 采样步数收敛曲线\nimport torch\nfrom diffusers import DPMSolverMultistepScheduler\n\ndef convergence_test(pipe, prompt, steps_list, seed=42):\n    """测试不同步数下的生成稳定性\"\"\"\n    pipe.scheduler = DPMSolverMultistepScheduler.from_config(\n        pipe.scheduler.config)\n    \n    # 基准：100 步\n    pipe.scheduler.set_timesteps(100)\n    gen = torch.Generator("cuda").manual_seed(seed)\n    ref = pipe(prompt, num_inference_steps=100, generator=gen).images[0]\n    \n    for steps in steps_list:\n        gen = torch.Generator("cuda").manual_seed(seed)\n        img = pipe(prompt, num_inference_steps=steps, generator=gen).images[0]\n        # 计算与基准的 LPIPS 距离\n        lpips_val = compute_lpips(ref, img)\n        print(f"Steps: {steps:3d} | LPIPS vs 100-step: {lpips_val:.4f}")\n\nconvergence_test(pipe, "a cute cat", steps_list=[4, 8, 12, 16, 20, 25, 50])`
                }
            ],
            table: {
                headers: ["采样器", "类型", "推荐步数", "速度", "质量", "确定性"],
                rows: [
                    ["DDIM", "ODE 一阶", "20-50", "快", "好", "确定"],
                    ["Euler", "ODE 一阶", "20-30", "快", "好", "确定"],
                    ["Euler a", "SDE 随机", "20-30", "快", "好", "随机"],
                    ["DPM-Solver++", "ODE 高阶", "10-20", "很快", "很好", "确定"],
                    ["DPM++ 2M Karras", "ODE 多步", "15-25", "很快", "优秀", "确定"],
                    ["PLMS", "多步伪线性", "10-20", "很快", "中等", "确定"],
                    ["Heun", "ODE 二阶", "15-20", "中", "很好", "确定"]
                ]
            },
            mermaid: `graph LR
    A["随机噪声 z_T"] --> B["采样器选择"]
    B --> C["DDIM: 确定性 ODE\"]
    B --> D["DPM-Solver: 高阶 ODE"]
    B --> E["Euler a: 随机 SDE"]
    C --> F["20-50步收敛"]
    D --> G["10-20步收敛"]
    E --> H["20-30步收敛"]
    F --> I["稳定但慢"]
    G --> J["快速且优质"]
    H --> K["多样性好"]

    class J s0
    classDef s0 fill:#064e3b,color:#f1f5f9`,
            tip: "日常使用推荐 DPM++ 2M Karras，25 步即可获得优秀质量。",
            warning: "步数少于 10 时所有采样器质量都会明显下降，不要为了速度过度减少步数。"
        },
        {
            title: "6. 控制生成：ControlNet 与 LoRA",
            body: `Stable Diffusion 原生只支持文本条件生成，但实际应用中往往需要更精细的控制。ControlNet 通过复制 U-Net 的编码器并添加零卷积层，将额外的空间条件（如边缘图、深度图、姿态图）注入到去噪过程中。关键设计是零卷积初始化：训练初期 ControlNet 的输出为零，不影响原始模型的生成能力，随着训练逐步学习条件控制。这使得 ControlNet 可以附加到任何预训练 SD 模型上，而无需重新训练整个网络。LoRA（Low-Rank Adaptation）则提供了一种轻量级的模型微调方法。它通过在注意力层的权重矩阵上添加低秩分解矩阵 A*B 来微调模型，参数量仅为原始的 1-10%。LoRA 的优势在于：训练文件仅几 MB 到几百 MB，可以快速切换不同风格，且不会破坏原始模型能力。结合 ControlNet 的结构控制和 LoRA 的风格控制，可以实现高度精确的图像生成。此外，IP-Adapter 等技术进一步支持了图像条件生成，使模型能够参考输入图像的风格和内容。`,
            code: [
                {
                    lang: "python",
                    code: `# ControlNet：边缘图控制生成\nfrom diffusers import StableDiffusionControlNetPipeline, \\\n    ControlNetModel, UniPCMultistepScheduler\nfrom controlnet_aux import CannyDetector\nimport torch\nfrom PIL import Image\n\n# 加载 Canny ControlNet\ncanny = ControlNetModel.from_pretrained(\n    "lllyasviel/sd-controlnet-canny", torch_dtype=torch.float16)\npipe = StableDiffusionControlNetPipeline.from_pretrained(\n    "runwayml/stable-diffusion-v1-5",\n    controlnet=canny, torch_dtype=torch.float16)\npipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config)\npipe = pipe.to("cuda")\n\n# 提取边缘图并生成\ninput_img = Image.open("input.png").convert("RGB")\ncanny_img = CannyDetector()(input_img, low_threshold=100, high_threshold=200)\n\nresult = pipe(\n    prompt="a beautiful landscape, photorealistic, 4k",\n    image=canny_img,\n    num_inference_steps=20,\n    controlnet_conditioning_scale=0.8,\n).images[0]`
                },
                {
                    lang: "python",
                    code: `# LoRA 训练与推理\nfrom diffusers import StableDiffusionPipeline\nfrom peft import LoraConfig, get_peft_model\nimport torch\n\n# 方法一：加载预训练 LoRA 权重\npipe = StableDiffusionPipeline.from_pretrained(\n    "runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16)\npipe = pipe.to("cuda")\n\n# 加载 LoRA（仅 ~200MB，远小于全模型 4GB）\npipe.load_lora_weights("path/to/lora_weights", weight_name="pytorch_lora.bin")\npipe.fuse_lora(lora_scale=0.8)  # 融合到主模型\n\n# 生成\nimage = pipe("a warrior in anime style").images[0]\n\n# 方法二：使用 diffusers + peft 训练\nlora_config = LoraConfig(\n    r=16,\n    lora_alpha=27,\n    target_modules=["to_q", "to_k", "to_v", "to_out.0"],\n    lora_dropout=0.05,\n)\nprint(f"LoRA params: {sum(p.numel() for p in lora_params) / 1e6:.2f}M")`
                }
            ],
            table: {
                headers: ["技术", "控制方式", "文件大小", "训练成本", "适用场景"],
                rows: [
                    ["ControlNet", "空间条件（边缘/深度/姿态）", "~1.4GB", "中等", "结构精确控制"],
                    ["LoRA", "风格/概念微调", "~100-400MB", "低", "风格迁移"],
                    ["Textual Inversion", "新词汇嵌入", "~10-100KB", "极低", "新概念学习"],
                    ["DreamBooth", "全模型微调", "~4GB", "高", "个性化主体"],
                    ["IP-Adapter", "图像参考", "~100MB", "低", "风格/内容参考"]
                ]
            },
            mermaid: `graph TD
    A["预训练 SD 模型"] --> B["ControlNet 结构控制"]
    A --> C["LoRA 风格控制"]
    A --> D["Textual Inversion 新概念"]
    B --> E["边缘图/深度图/姿态"]
    C --> F["动漫/写实/油画风格"]
    D --> G["自定义触发词 <sks>"]
    E --> H["组合生成"]
    F --> H
    G --> H
    H --> I["高精度可控图像"]

    class H s0
    classDef s0 fill:#78350f,color:#f1f5f9`,
            tip: "LoRA 可以叠加使用（如风格 LoRA + 角色 LoRA），通过调整各自权重实现精细控制。",
            warning: "ControlNet 的条件图必须与生成图像分辨率一致，否则会引入伪影。"
        },
        {
            title: "7. diffusers 库实战",
            body: `Hugging Face 的 diffusers 库是 Stable Diffusion 生态中最流行的 Python 框架，提供了模块化的管道设计和丰富的模型支持。本节通过一个完整的项目展示 diffusers 的核心用法：从基础文生图到高级的图像编辑。diffusers 的设计哲学是管道（Pipeline）模式，将 VAE、U-Net、Text Encoder 等组件组合成端到端的可用接口。每个管道都支持进度回调、安全过滤器、多 GPU 推理等高级功能。实战中最重要的技巧包括：使用 attention_slicing 降低显存占用，使用 enable_xformers_memory_efficient_attention 启用 Flash Attention 加速，使用 torch.compile 编译整个管道。对于生产环境，建议使用 safetensors 格式加载权重以避免 pickle 安全风险，并始终设置随机种子以确保可复现性。diffusers 还支持 ONNX 导出、CoreML 转换等部署选项，使得模型可以在不同平台上高效运行。`,
            code: [
                {
                    lang: "python",
                    code: `# 高级 diffusers 管道配置\nfrom diffusers import (\n    StableDiffusionImg2ImgPipeline,\n    StableDiffusionInpaintPipeline,\n    DPMSolverMultistepScheduler,\n)\nimport torch\nfrom PIL import Image\n\n# 优化配置：显存效率 + 推理加速\ndef setup_pipeline(model_id="runwayml/stable-diffusion-v1-5"):\n    pipe = StableDiffusionImg2ImgPipeline.from_pretrained(\n        model_id,\n        torch_dtype=torch.float16,\n        use_safetensors=True,\n    )\n    # 显存优化\n    pipe.enable_attention_slicing()\n    pipe.enable_vae_slicing()\n    # 推理加速（需要安装 xformers）\n    try:\n        pipe.enable_xformers_memory_efficient_attention()\n    except Exception:\n        print("xformers not available, using default attention")\n    \n    pipe.scheduler = DPMSolverMultistepScheduler.from_config(\n        pipe.scheduler.config)\n    return pipe.to("cuda")\n\npipe = setup_pipeline()\nprint(f"Pipeline ready, device: {pipe.device}")`
                },
                {
                    lang: "python",
                    code: `# 完整工作流：文生图 -> 图生图 -> 局部重绘\nimport torch\nfrom PIL import Image\nimport numpy as np\n\npipe = setup_pipeline()\ngenerator = torch.Generator("cuda").manual_seed(42)\n\n# Step 1: 文生图\nprompt = "a medieval castle on a cliff, epic lighting"\nresult = pipe(\n    prompt=prompt,\n    negative_prompt="ugly, blurry, watermark",\n    num_inference_steps=30,\n    guidance_scale=7.5,\n    generator=generator,\n).images[0]\nresult.save("step1_castle.png")\n\n# Step 2: 图生图（添加季节变化）\nautumn_result = pipe(\n    prompt=prompt + ", autumn foliage, golden leaves",\n    image=result,\n    strength=0.4,  # 0=完全保留, 1=完全重绘\n    num_inference_steps=30,\n    guidance_scale=7.5,\n    generator=generator,\n).images[0]\nautumn_result.save("step2_autumn.png")\n\n# Step 3: 局部重绘（添加飞鸟）\nmask = create_bird_mask(result.size)  # 自定义掩码\nbird_result = inpaint_pipe(\n    prompt="birds flying in the sky",\n    image=autumn_result,\n    mask_image=mask,\n    num_inference_steps=30,\n).images[0]\nbird_result.save("step3_final.png")`
                }
            ],
            table: {
                headers: ["优化技术", "显存节省", "速度提升", "适用条件"],
                rows: [
                    ["attention_slicing", "~30%", "~10%", "所有 GPU"],
                    ["vae_slicing", "~20%", "~5%", "所有 GPU"],
                    ["xformers", "~40%", "~30%", "需要安装 xformers"],
                    ["torch.compile", "~0%", "~40%", "PyTorch 2.0+"],
                    ["CPU offload", "~60%", "-50%", "显存极度受限"],
                    ["8-bit 量化", "~50%", "-10%", "需要 bitsandbytes"]
                ]
            },
            mermaid: `graph TD
    A["用户输入"] --> B{"选择管道"}
    B -->|"文本"| C["Text2Image Pipeline"]
    B -->|"文本+图像"| D["Img2Img Pipeline"]
    B -->|"文本+图像+掩码"| E["Inpaint Pipeline"]
    B -->|"图像参考"| F["IP-Adapter Pipeline"]
    C --> G["优化配置"]
    D --> G
    E --> G
    F --> G
    G --> H["VAE + U-Net + CLIP"]
    H --> I["采样器迭代"]
    I --> J["输出生成图像"]

    class B s0
    classDef s0 fill:#78350f,color:#f1f5f9

    class G s1`,
            tip: "使用 seed 固定随机数生成器，确保相同提示词和参数产生完全相同的结果。",
            warning: "生产环境务必设置 safety_checker 或使用自定义内容审核管道。"
        },
    ],
};
