import { Article } from '../knowledge';

export const article: Article = {
  id: "genai-009",
  title: "2026 AI 图像与视频生成全景：从 Flux 到 Sora 2，模型架构、开源生态与实战指南",
  category: "genai",
  tags: ["图像生成", "视频生成", "Diffusion", "Flow Matching", "Flux", "Sora", "Midjourney", "开源生态"],
  summary: "2026 年 AI 图像与视频生成进入爆发期：Flux 引领开源文生图新标准，Midjourney v7 持续领跑商用赛道，Sora 2 和 Runway Gen-4 推动视频生成进入实用阶段，ChatGPT Images 2.0 将图像生成集成到日常对话中。本文系统梳理图像/视频生成的技术演进、主流模型架构对比、开源工具生态，并附带完整的 Python 实战代码，让你掌握从文生图到文生视频的完整能力。",
  date: "2026-04-22",
  readTime: "30 min",
  level: "进阶",
  content: [
    {
      title: "一、2026 AI 图像与视频生成全景图",
      body: `2026 年，AI 图像与视频生成已经从一个"有趣实验"变成了真正的生产力工具。无论是设计师、开发者还是内容创作者，都能利用这些工具快速生成高质量的视觉内容。

**技术栈全景：**

整个 AI 视觉生成领域可以分为以下几个层次：

1. **基础生成模型层**：Diffusion Models、Flow Matching、GANs、VAEs
2. **文生图模型层**：Flux、Midjourney v7、Stable Diffusion 3.5、DALL-E 3、Ideogram 2.0
3. **图生图/编辑层**：Inpainting、Outpainting、ControlNet、IP-Adapter
4. **视频生成层**：Sora 2、Runway Gen-4、Pika 2.0、Luma Dream Machine
5. **3D 生成层**：TripoSR、Meshy、CSM
6. **应用工具层**：ComfyUI、Diffusers、Automatic1111、Fooocus

ChatGPT Images 2.0 的发布更是将图像生成能力直接集成到了对话式 AI 中，用户只需一句话描述就能获得高质量图片，无需任何技术门槛。`,
      mermaid: `graph TD
    A[用户输入 Prompt] --> B{选择生成任务}
    B -->|文生图| C[Flux / SD3.5 / MJ v7]
    B -->|图生图| D[ControlNet + IP-Adapter]
    B -->|视频生成| E[Sora 2 / Runway Gen-4]
    B -->|3D 生成| F[TripoSR / Meshy]
    C --> G[Diffusion / Flow Matching]
    D --> G
    E --> H[Diffusion Transformer + 时间建模]
    F --> I[NeRF / Gaussian Splatting]
    G --> J[输出: 图像]
    H --> K[输出: 视频]
    I --> L[输出: 3D 模型]
    J --> M[后处理: 超分 / 修复]
    K --> M
    L --> M`,
    },
    {
      title: "二、核心技术演进：从 Diffusion 到 Flow Matching",
      body: `AI 图像生成的核心技术经历了数次重大迭代。理解这些演进对于选择合适的工具和框架至关重要。

**2.1 扩散模型（Diffusion Models）—— 经典范式**

扩散模型的核心思想是：先给数据逐步添加噪声（前向过程），然后训练一个网络逐步去噪（反向过程）。DDPM（Denoising Diffusion Probabilistic Models）是奠基之作，Stable Diffusion 通过 Latent Space 扩散大幅降低了计算成本。

**扩散模型的关键公式：**

前向过程（加噪）：
q(x_t | x_{t-1}) = N(x_t; √(1-β_t) · x_{t-1}, β_t · I)

反向过程（去噪）：
p_θ(x_{t-1} | x_t) = N(x_{t-1}; μ_θ(x_t, t), σ_t² · I)

**2.2 Flow Matching —— 下一代生成模型**

Flow Matching 是 2026 年最热门的技术方向之一。相比扩散模型的离散步骤，Flow Matching 学习的是一个连续的向量场，可以通过常微分方程（ODE）直接采样。这使得生成过程更高效、质量更高。

**Flow Matching 的核心优势：**
- 采样步骤更少（通常 10-50 步 vs 扩散模型的 50-1000 步）
- 生成质量更高，特别是细节和文本渲染
- 数学上更优雅，训练更稳定
- Flux 等新一代模型已全面采用 Flow Matching

**2.3 Diffusion Transformer（DiT）—— 架构革命**

传统的扩散模型使用 U-Net 作为骨干网络，而 DiT 用 Transformer 替换了 U-Net。这一架构变革带来了质的飞跃：

- **可扩展性**：Transformer 的 scaling law 同样适用于生成模型
- **全局理解力**：Self-attention 机制让模型能理解整个图像的语义关系
- **多模态融合**：天然支持文本、图像、音频等多模态输入
- Sora、Flux、SD3 等顶级模型均采用 DiT 架构`,
      mermaid: `graph LR
    A[2020 DDPM] --> B[2021 Latent Diffusion]
    B --> C[2022 Stable Diffusion]
    C --> D[2023 SDXL + ControlNet]
    D --> E[2024 SD3 + DiT]
    E --> F[2025 Flux + Flow Matching]
    F --> G[2026 Sora 2 + 视频 Diffusion]
    G --> H[2026 ChatGPT Images 2.0]
    style A fill:#ff6b6b,color:#1e293b
    style B fill:#ffa94d,color:#1e293b
    style C fill:#ffd43b,color:#1e293b
    style D fill:#69db7c,color:#1e293b
    style E fill:#4dabf7
    style F fill:#9775fa
    style G fill:#f06595
    style H fill:#20c997`,
    },
    {
      title: "三、主流文生图模型对比（2026 年 4 月）",
      body: `2026 年的文生图市场呈现出"开源 vs 商用"双雄并立的格局。以下是当前最主流的模型对比：`,
      table: {
        headers: ["模型", "类型", "参数量", "优势", "劣势", "适用场景"],
        rows: [
          ["Flux.1", "开源", "12B", "文本渲染极佳、高质量细节、Flow Matching 架构", "显存需求高(≥16GB)", "开源创作、商业设计"],
          ["Midjourney v7", "商用", "未公开", "艺术感最强、风格多样、社区生态好", "闭源、订阅付费、API 限制", "艺术设计、概念图"],
          ["Stable Diffusion 3.5", "开源", "8B", "生态成熟、LoRA 丰富、ControlNet 支持", "文本渲染不如 Flux", "定制化生成、研究"],
          ["DALL-E 3", "商用", "未公开", "提示词理解好、安全性强、ChatGPT 集成", "创意自由度受限", "日常对话中的图像生成"],
          ["Ideogram 2.0", "商用+开源", "未公开", "文字排版最佳、Logo 设计优秀", "通用图像质量略逊 MJ", "Logo、海报、排版设计"],
          ["ChatGPT Images 2.0", "商用", "未公开", "对话式生成、零门槛、多轮迭代", "可控性低、不支持精细控制", "日常使用、快速原型"],
          ["Recraft v3", "商用", "未公开", "矢量图生成、品牌一致性工具", "照片级真实感较弱", "品牌设计、UI 素材"],
        ],
      },
    },
    {
      title: "四、视频生成：2026 年的新战场",
      body: `如果说 2024-2025 是图像生成的元年，那么 2026 年就是视频生成的爆发年。

**4.1 视频生成的技术挑战**

视频生成比图像生成复杂得多，主要体现在：

- **时间一致性**：每一帧都要与前后帧保持连贯，不能出现闪烁或突变
- **计算成本**：视频 = 图像 × 帧数，计算量呈线性增长
- **运动建模**：需要理解物理规律（重力、惯性、流体动力学等）
- **长序列建模**：5 秒视频 @ 24fps = 120 帧，需要模型能处理超长序列

**4.2 主流视频生成模型**

**Sora 2（OpenAI）**：
- 基于 Diffusion Transformer 架构
- 支持最长 60 秒视频生成
- 物理模拟能力显著提升（流体、光影、碰撞）
- 支持文生视频和图生视频
- 通过 ChatGPT Plus/Pro 可用

**Runway Gen-4**：
- 多模态输入（文本、图像、视频片段）
- 支持视频编辑（风格迁移、对象替换）
- 提供专业级时间轴控制
- Web 界面 + API 双模式

**Pika 2.0**：
- 专注短视频（3-10 秒）
- 动画风格表现出色
- 支持 Lip Sync（口型同步）
- 适合社交媒体内容创作

**Luma Dream Machine**：
- 免费额度友好
- 真实感强
- 支持关键帧控制

**4.3 视频生成的开源方案**

开源社区也在快速追赶：

- **CogVideoX**（智谱）：开源视频生成模型，支持 5-10 秒视频
- **Open-Sora**：复刻 Sora 架构的开源项目
- **ModelScope T2V**：阿里达摩院的文本到视频模型
- **AnimateDiff**：基于 SD 的视频生成插件，可配合任何 SD 模型使用`,
      mermaid: `graph TD
    A[视频生成技术栈] --> B[架构选择]
    B --> B1[Diffusion Transformer]
    B --> B2[Latent Video Diffusion]
    B --> B3[Autoregressive + Diffusion]
    A --> C[关键组件]
    C --> C1[时间注意力层]
    C --> C2[3D VAE 压缩]
    C --> C3[运动先验模块]
    A --> D[训练策略]
    D --> D1[先训练图像生成]
    D --> D2[再微调视频]
    D --> D3[渐进式分辨率提升]
    A --> E[推理加速]
    E --> E1[CFG Distillation]
    E --> E2[LCM 加速采样]
    E --> E3[Frame Skipping]`,
    },
    {
      title: "五、开源工具生态深度解析",
      body: `开源生态是 AI 视觉生成的核心驱动力。以下是 2026 年最重要的开源工具：

**5.1 ComfyUI —— 节点式工作流引擎**

ComfyUI 是目前最流行的开源图像生成工具，采用节点式编程：

- 每个节点代表一个操作（加载模型、编码提示词、采样、解码等）
- 节点之间通过连线传递数据
- 可以构建任意复杂的工作流
- 支持 ControlNet、IP-Adapter、LoRA 等插件
- 社区共享工作流市场

**5.2 Diffusers —— HuggingFace 官方 Python 库**

Diffusers 是 HuggingFace 提供的官方扩散模型库：

- 统一的 API 接口，支持多种模型
- 内置调度器（DDIM、DPM++、Euler 等）
- 支持流水线（Pipeline）组合
- 与 Transformers 库深度集成
- 是研究和开发的首选框架

**5.3 FLUX 开源生态**

Flux 模型开源后，迅速形成了丰富的生态：

- **Flux.1 [dev]**：12B 参数开发版，质量最佳
- **Flux.1 [schnell]**：4 步快速版，适合实时应用
- **Flux.1 [pro]**：API 商用版
- 大量社区 LoRA 模型（风格、角色、产品）
- ComfyUI 原生支持 Flux 工作流`,
    },
    {
      title: "六、Python 实战：用 Diffusers 生成高质量图像",
      body: `下面我们用 HuggingFace Diffusers 库来实现一个完整的图像生成 Pipeline，支持 Flux 模型、提示词优化和批量生成。`,
      code: [
        {
          lang: "python",
          code: `"""
实战 1：使用 Diffusers + Flux 生成高质量图像
支持提示词优化、多张批量生成、自动保存
"""

import torch
from diffusers import FluxPipeline
from PIL import Image
import os
from datetime import datetime

class FluxImageGenerator:
    """Flux 图像生成器，支持批量生成和参数控制"""
    
    def __init__(
        self,
        model_id: str = "black-forest-labs/FLUX.1-dev",
        device: str = "cuda",
        torch_dtype: torch.dtype = torch.bfloat16,
    ):
        self.device = device
        self.pipe = FluxPipeline.from_pretrained(
            model_id,
            torch_dtype=torch_dtype,
        ).to(device)
        # 启用 xformers 显存优化
        self.pipe.enable_xformers_memory_efficient_attention()
        
    def generate(
        self,
        prompt: str,
        negative_prompt: str = "",
        num_images: int = 1,
        guidance_scale: float = 3.5,
        num_inference_steps: int = 28,
        seed: int = None,
        output_dir: str = "outputs",
    ) -> list[Image.Image]:
        """生成图像并保存到指定目录"""
        os.makedirs(output_dir, exist_ok=True)
        
        # 设置随机种子（可选）
        generator = None
        if seed is not None:
            generator = torch.Generator(device=self.device).manual_seed(seed)
        
        # 批量生成
        images = self.pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_images_per_prompt=num_images,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
            generator=generator,
        ).images
        
        # 保存图像
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        saved_paths = []
        for i, img in enumerate(images):
            filename = f"{timestamp}_img{i}.png"
            filepath = os.path.join(output_dir, filename)
            img.save(filepath)
            saved_paths.append(filepath)
            print(f"✅ 已保存: {filepath}")
        
        return images, saved_paths
    
    def enhance_prompt(self, base_prompt: str) -> str:
        """增强提示词，添加质量关键词"""
        quality_tags = [
            "masterpiece", "best quality", "ultra-detailed",
            "8k resolution", "photorealistic"
        ]
        return f"{base_prompt}, {', '.join(quality_tags)}"

# === 使用示例 ===
if __name__ == "__main__":
    # 初始化生成器
    generator = FluxImageGenerator(
        model_id="black-forest-labs/FLUX.1-schnell",  # 快速版
        device="cuda"
    )
    
    # 生成单张图片
    prompt = "A majestic dragon flying over a medieval castle at sunset, cinematic lighting"
    images, paths = generator.generate(
        prompt=generator.enhance_prompt(prompt),
        num_images=1,
        guidance_scale=3.5,
        num_inference_steps=4,  # schnell 只需要 4 步
        seed=42,
    )
    
    # 批量生成不同种子
    prompts = [
        "Cyberpunk city street at night with neon signs and rain",
        "A cozy coffee shop interior with warm lighting and books",
        "Astronaut floating in space with Earth in background",
    ]
    
    for i, p in enumerate(prompts):
        generator.generate(
            prompt=generator.enhance_prompt(p),
            num_images=1,
            seed=100 + i,
            output_dir=f"outputs/batch_{i}"
        )`,
          filename: "flux_generator.py",
        },
      ],
    },
    {
      title: "七、Python 实战：用 ComfyUI API 自动化图像生成工作流",
      body: `ComfyUI 不仅支持节点式 UI，还提供了 WebSocket API，允许我们通过代码编程式地构建和执行工作流。这在自动化、批量生成场景中非常有用。`,
      code: [
        {
          lang: "python",
          code: `"""
实战 2：通过 ComfyUI WebSocket API 自动化图像生成
构建自定义工作流并批量执行
"""

import json
import websocket
import uuid
import urllib.request
import urllib.parse
import time

COMFYUI_URL = "127.0.0.1:8188"
CLIENT_ID = str(uuid.uuid4())

class ComfyUIAutomation:
    """ComfyUI 自动化客户端"""
    
    def __init__(self, server_address: str = COMFYUI_URL):
        self.server_address = server_address
        self.client_id = CLIENT_ID
        
    def build_flux_workflow(
        self,
        prompt: str,
        negative_prompt: str = "",
        width: int = 1024,
        height: int = 1024,
        steps: int = 20,
        cfg: float = 3.5,
        seed: int = None,
    ) -> dict:
        """构建 Flux 文生图工作流"""
        if seed is None:
            seed = int(time.time() * 1000) % (2**32)
            
        return {
            "4": {  # CLIPTextEncode (positive)
                "class_type": "CLIPTextEncodeFlux",
                "inputs": {
                    "clip": ["11", 0],
                    "prompt": prompt,
                    "lora_strength": 1.0,
                }
            },
            "5": {  # CLIPTextEncode (negative)
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "clip": ["11", 0],
                    "text": negative_prompt,
                }
            },
            "6": {  # EmptyLatentImage
                "class_type": "EmptyLatentImage",
                "inputs": {
                    "width": width,
                    "height": height,
                    "batch_size": 1,
                }
            },
            "8": {  # VAEDecode
                "class_type": "VAEDecode",
                "inputs": {
                    "samples": ["13", 0],
                    "vae": ["10", 0],
                }
            },
            "9": {  # SaveImage
                "class_type": "SaveImage",
                "inputs": {
                    "images": ["8", 0],
                    "filename_prefix": "comfy_auto",
                }
            },
            "10": {  # VAELoader (Flux AE)
                "class_type": "VAELoader",
                "inputs": {
                    "vae_name": "ae.safetensors",
                }
            },
            "11": {  # DualCLIPLoader
                "class_type": "DualCLIPLoader",
                "inputs": {
                    "clip_name1": "clip_l.safetensors",
                    "clip_name2": "t5xxl_fp16.safetensors",
                    "type": "flux",
                }
            },
            "12": {  # UNETLoader (Flux)
                "class_type": "UNETLoader",
                "inputs": {
                    "unet_name": "flux1-dev.safetensors",
                    "weight_dtype": "default",
                }
            },
            "13": {  # KSampler
                "class_type": "KSampler",
                "inputs": {
                    "model": ["12", 0],
                    "positive": ["4", 0],
                    "negative": ["5", 0],
                    "latent_image": ["6", 0],
                    "seed": seed,
                    "steps": steps,
                    "cfg": cfg,
                    "sampler_name": "euler",
                    "scheduler": "normal",
                    "denoise": 1.0,
                }
            },
        }
    
    def queue_prompt(self, workflow: dict) -> str:
        """将工作流提交到 ComfyUI 队列"""
        data = json.dumps({
            "prompt": workflow,
            "client_id": self.client_id,
        }).encode("utf-8")
        
        req = urllib.request.Request(
            f"http://{self.server_address}/prompt",
            data=data,
            headers={"Content-Type": "application/json"},
        )
        response = urllib.request.urlopen(req)
        result = json.loads(response.read())
        return result["prompt_id"]
    
    def get_images(self, prompt_id: str) -> list:
        """获取生成结果"""
        req = urllib.request.Request(
            f"http://{self.server_address}/history/{prompt_id}"
        )
        response = urllib.request.urlopen(req)
        history = json.loads(response.read())
        
        outputs = history[prompt_id]["outputs"]
        images = []
        for node_output in outputs.values():
            if "images" in node_output:
                for img in node_output["images"]:
                    filename = img["filename"]
                    images.append(filename)
        return images
    
    def generate_batch(
        self,
        prompts: list[str],
        **workflow_kwargs,
    ) -> list[list[str]]:
        """批量生成，返回每张图片的文件名列表"""
        all_results = []
        for i, prompt in enumerate(prompts):
            print(f"🎨 生成第 {i+1}/{len(prompts)} 张...")
            workflow = self.build_flux_workflow(prompt=prompt, **workflow_kwargs)
            prompt_id = self.queue_prompt(workflow)
            # 等待生成完成
            time.sleep(15)  # 实际应用中应监听 WebSocket 事件
            images = self.get_images(prompt_id)
            all_results.append(images)
            print(f"✅ 完成: {images}")
        return all_results

# === 使用示例 ===
if __name__ == "__main__":
    comfy = ComfyUIAutomation()
    
    prompts = [
        "A futuristic Tokyo street at night, neon lights, rain reflections",
        "A steampunk airship flying over Victorian London",
        "An underwater coral reef with tropical fish, sunlight rays",
    ]
    
    results = comfy.generate_batch(
        prompts=prompts,
        width=1024,
        height=1024,
        steps=25,
        cfg=3.5,
    )
    
    print(f"\\n📊 批量生成完成，共生成 {sum(len(r) for r in results)} 张图片")`,
          filename: "comfyui_auto.py",
        },
      ],
    },
    {
      title: "八、技术选型建议与最佳实践",
      body: `面对众多的模型和工具，如何选择最适合的方案？以下是基于不同场景的建议：

**场景 1：个人创作者，追求最高质量**
- 首选：Midjourney v7 或 Flux.1 [dev]
- 工具：Midjourney Discord 或 ComfyUI
- 预算：$10-30/月

**场景 2：开发者，需要 API 集成**
- 首选：Flux API 或 Replicate
- 工具：Diffusers 库 + 自建服务
- 预算：按调用计费，约 $0.002-0.01/张

**场景 3：设计师，需要精确控制**
- 首选：ComfyUI + ControlNet + IP-Adapter
- 优势：可以精确控制构图、风格、角色一致性
- 学习成本：中等（需要理解节点工作流）

**场景 4：日常使用，零门槛**
- 首选：ChatGPT Images 2.0
- 优势：对话式交互，自然语言描述即可
- 限制：不可精细控制，适合快速原型

**场景 5：视频生成**
- 首选：Sora 2（质量最佳）或 Runway Gen-4（功能最全）
- 开源替代：CogVideoX 或 AnimateDiff
- 注意：视频生成成本远高于图像生成

**最佳实践 Checklist：**
1. 始终使用英文提示词，质量更高
2. 添加负面提示词过滤不良输出
3. 固定 seed 实现可重复生成
4. 使用 CFG 调度器平衡创意与可控性
5. 批量生成时注意 GPU 显存管理
6. 定期更新模型权重，社区改进很快`,
      table: {
        headers: ["需求", "推荐方案", "成本", "学习曲线", "输出质量"],
        rows: [
          ["快速出图", "ChatGPT Images 2.0", "$20/月", "⭐", "⭐⭐⭐⭐"],
          ["高质量创作", "Flux.1 dev + ComfyUI", "免费（需 GPU）", "⭐⭐⭐", "⭐⭐⭐⭐⭐"],
          ["艺术设计", "Midjourney v7", "$30/月", "⭐⭐", "⭐⭐⭐⭐⭐"],
          ["精确控制", "ComfyUI + ControlNet", "免费（需 GPU）", "⭐⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
          ["API 集成", "Replicate / Flux API", "$0.002/张", "⭐⭐", "⭐⭐⭐⭐"],
          ["视频生成", "Sora 2", "$20/月", "⭐", "⭐⭐⭐⭐"],
          ["开源视频", "CogVideoX", "免费（需 GPU）", "⭐⭐⭐⭐", "⭐⭐⭐"],
        ],
      },
    },
    {
      title: "九、未来趋势展望",
      body: `2026 年的 AI 图像与视频生成正处于一个激动人心的转折点。以下是几个关键趋势：

**1. 实时生成**：Flux.1 [schnell] 已经实现 4 步出图，未来将进一步降低到 1-2 步，实现实时图像生成。

**2. 视频质量追平图像**：Sora 2 和 Runway Gen-4 正在缩小视频与图像之间的质量差距，预计 2026 年底视频生成将达到当前图像生成的质量水平。

**3. 3D 生成实用化**：从单张图片生成高质量 3D 模型的技术正在快速成熟，游戏和 AR/VR 行业将率先受益。

**4. 个性化模型微调**：LoRA 和 DreamBooth 等技术让个人用户可以训练自己的风格模型，无需从头训练。

**5. Agent 驱动的多模态工作流**：AI Agent 将自动编排图像生成、编辑、后处理的完整工作流，人类只需描述意图。

**6. 版权与合规**：随着 AI 生成内容的普及，版权保护、内容溯源（如 C2PA 标准）将成为基础设施。

**7. Headless AI 视觉服务**：如 Salesforce Headless 360 所展示的，未来视觉生成服务将通过 API/MCP 直接暴露给 AI Agent，无需人类通过 GUI 操作。`,
    },
    {
      title: "十、总结",
      body: `2026 年的 AI 图像与视频生成已经形成了完整的技术栈和生态体系：

- **技术上**：从 Diffusion 到 Flow Matching 再到 DiT 架构，每一步都带来了质的飞跃
- **模型上**：Flux 引领开源，Midjourney 领跑商用，ChatGPT Images 2.0 降低门槛
- **工具上**：ComfyUI 成为开源工作流标准，Diffusers 是开发首选框架
- **视频上**：Sora 2、Runway Gen-4 推动视频生成进入实用阶段
- **趋势上**：实时化、多模态、Agent 驱动、合规化是四大方向

无论你是创作者、开发者还是研究者，都能在这个生态中找到适合自己的工具和方法。关键是动手实践——从第一个 prompt 开始，逐步掌握这个强大的能力。`,
      mermaid: `pie showData
    title 2026 AI 视觉生成市场占比（估算）
    "Flux 生态" : 25
    "Midjourney" : 20
    "Stable Diffusion 生态" : 18
    "DALL-E / ChatGPT Images" : 15
    "Ideogram" : 8
    "其他商用模型" : 8
    "开源视频生成" : 6`,
    },
  ],
};
