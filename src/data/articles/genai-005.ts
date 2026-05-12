import { Article } from '../knowledge';

export const article: Article = {
    id: "genai-005",
    title: "文本到图像生成：DALL-E, Imagen",
    category: "genai",
    tags: ["文本到图像", "DALL-E", "Imagen"],
    summary: "从文本描述到高质量图像，理解多模态生成的前沿技术",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
      {
        title: "1. 文本到图像生成：任务定义与发展脉络",
        body: `文本到图像生成（Text-to-Image Generation）是生成式 AI 最具视觉冲击力的应用之一。任务的核心定义是：给定一段自然语言文本描述（prompt），模型生成一张与该描述语义一致、视觉逼真的图像。这个问题看似简单，但涉及计算机视觉、自然语言处理和生成模型三大领域的深度交叉。

回顾发展脉络，2021 年 **OpenAI** 发布的 DALL-E 首次展示了用文字画画的可能性。它基于 VQ-VAE-2 的离散 token 化方案，将图像和文本统一到 **Transformer** 的序列建模框架中。同年，DALL-E mini（后更名为 Craiyon）开源，让更多人体验了文本到图像生成的能力。2022 年成为爆发之年：Google 发布 Imagen，**OpenAI** 发布 DALL-E 2，Stability AI 推出 Stable Diffusion——三条技术路线（离散 token + **Transformer**、级联扩散模型、潜在扩散模型）并行发展，推动了图像生成质量的飞跃。2023 年的 DALL-E 3 进一步引入了与 **GPT-4** 的深度集成，通过大语言模型扩展用户的简短 prompt，显著提升了生成质量。

理解文本到图像生成，关键在于把握两个核心问题：一是如何让模型理解文本描述中的语义信息，二是如何将这种语义信息翻译为像素级别的视觉内容。前者依赖强大的文本编码器（如 CLIP），后者则需要精心设计的生成架构。`,
        mermaid: `graph LR
    A["文本描述"] --> B["文本编码器\
CLIP/T5"]
    B --> C["语义表示\
Embedding"]
    C --> D["生成模型\
Diffusion/Transformer"]
    D --> E["图像解码\
VAE Decoder"]
    E --> F["输出图像"]
    C -.-> G["条件注入\
Cross-Attention"]
    G --> D`,
        table: {
          headers: ["模型", "发布时间", "核心技术", "分辨率"],
          rows: [
            ["DALL-E", "2021.01", "VQ-VAE + Transformer", "256x256"],
            ["Imagen", "2022.05", "级联扩散 + T5", "1024x1024"],
            ["DALL-E 2", "2022.04", "先验网络 + 扩散解码", "1024x1024"],
            ["Stable Diffusion", "2022.08", "潜在扩散模型", "512x512"],
            ["DALL-E 3", "2023.09", "GPT-4 prompt扩展 + 扩散", "1024x1024"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 文本到图像生成的基本抽象
import torch
from typing import Optional

class TextToImageModel:
    """文本到图像生成模型的统一接口"""

    def __init__(self, text_encoder, generator, image_decoder):
        self.text_encoder = text_encoder    # 将文本编码为向量
        self.generator = generator          # 核心生成网络
        self.image_decoder = image_decoder  # 解码为像素图像

    @torch.no_grad()
    def generate(
        self,
        prompt: str,
        guidance_scale: float = 7.5,
        num_inference_steps: int = 50,
        seed: Optional[int] = None,
    ) -> torch.Tensor:
        # Step 1: 编码文本
        text_embed = self.text_encoder(prompt)

        # Step 2: 初始化随机噪声
        if seed is not None:
            torch.manual_seed(seed)
        latent = torch.randn(1, 4, 64, 64, device=text_embed.device)

        # Step 3: 迭代生成（扩散过程或自回归过程）
        for step in range(num_inference_steps):
            noise_pred = self.generator(latent, step, text_embed)
            # 分类器自由引导（CFG）
            noise_pred_uncond = self.generator(latent, step, torch.zeros_like(text_embed))
            noise_pred = noise_pred_uncond + guidance_scale * (noise_pred - noise_pred_uncond)
            latent = self._step(latent, noise_pred, step)

        # Step 4: 解码为图像
        image = self.image_decoder(latent)
        return image

    def _step(self, latent, noise_pred, step):
        """DDIM 或 Euler 采样单步更新"""
        alpha = 1.0 - step / 1000.0
        return latent - 0.1 * noise_pred * alpha`,
          },
          {
            lang: "python",
            code: `# 评估生成图像与文本的一致性
import torch
import clip

def clip_score(image: torch.Tensor, prompt: str, model, preprocess) -> float:
    """计算 CLIP Score：图像-文本相似度"""
    # 预处理图像
    image_input = preprocess(image).unsqueeze(0)

    # 编码文本
    text_tokens = clip.tokenize([prompt])

    with torch.no_grad():
        image_features = model.encode_image(image_input)
        text_features = model.encode_text(text_tokens)

    # 归一化并计算余弦相似度
    image_features = image_features / image_features.norm(dim=-1, keepdim=True)
    text_features = text_features / text_features.norm(dim=-1, keepdim=True)
    similarity = (image_features @ text_features.T).item()

    return similarity

# 测试
model, preprocess = clip.load("ViT-L/14", device="cuda")
image = torch.rand(3, 224, 224)
score = clip_score(image, "一只在草地上奔跑的柯基犬", model, preprocess)
print(f"CLIP Score: {score:.4f}")  # 越接近 1 表示越匹配`,
          },
        ],
        tip: "入门建议：先用 Hugging Face diffusers 库跑通一个 Stable Diffusion pipeline，建立感性认识后再深入架构细节。",
        warning: "分辨率不是越高越好。更高的分辨率意味着更大的显存消耗和更长的推理时间，实际应用中需要根据场景权衡。",
      },
      {
        title: "2. CLIP：连接文本与图像的桥梁",
        body: `CLIP（Contrastive Language-Image Pre-training）是 **OpenAI** 在 2021 年提出的革命性模型，它彻底改变了文本和图像之间的语义对齐方式。CLIP 的核心思想非常优雅：使用对比学习（Contrastive Learning）在大规模图像-文本对上训练一个联合嵌入空间，使得语义相关的图像和文本在这个空间中彼此靠近，无关的则彼此远离。

CLIP 的训练数据极为庞大——4 亿对互联网抓取的图像-文本对。训练时，每个 batch 包含 N 对图像-文本，模型通过两个独立的编码器（图像编码器和文本编码器）分别将它们映射到相同维度的向量空间。然后计算 N x N 的相似度矩阵，使用交叉熵损失函数，让正确的图文对（对角线上的样本）获得更高的相似度得分。这种对比学习目标迫使模型学习到细粒度的语义对齐能力。

在文本到图像生成中，CLIP 扮演着双重角色：一方面，它作为文本编码器，将 prompt 转化为生成模型可以理解的条件向量；另一方面，它的嵌入空间可以作为评估生成质量的标尺——计算生成图像与输入文本之间的 CLIP Score 是最主流的评估指标之一。CLIP 的成功直接催生了后续一系列多模态基础模型，包括 BLIP、ALIGN 和 SigLIP。`,
        mermaid: `graph TD
    A["图像批次"] --> B["图像编码器\
ViT/ResNet"]
    C["文本批次"] --> D["文本编码器\
Transformer"]
    B --> E["图像特征\
I1...IN"]
    D --> F["文本特征\
T1...TN"]
    E --> G["相似度矩阵\
N x N Cosine"]
    F --> G
    G --> H["对比损失\
Cross-Entropy"]
    H -.->|反向传播| B
    H -.->|反向传播| D`,
        table: {
          headers: ["CLIP 变体", "图像编码器", "文本编码器", "嵌入维度"],
          rows: [
            ["CLIP ViT-B/32", "ViT-B (86M)", "Transformer (63M)", "512"],
            ["CLIP ViT-B/16", "ViT-B (86M)", "Transformer (63M)", "512"],
            ["CLIP ViT-L/14", "ViT-L (307M)", "Transformer (123M)", "768"],
            ["OpenCLIP ViT-H/14", "ViT-H (632M)", "Transformer (354M)", "1024"],
            ["SigLIP", "ViT-SO", "Transformer", "1152"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 加载 CLIP 模型并计算图文相似度
import torch
import clip
from PIL import Image

# 加载预训练模型
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-L/14", device=device)

# 准备输入
image = preprocess(Image.open("dog.jpg")).unsqueeze(0).to(device)
texts = clip.tokenize([
    "一只棕色的狗在草地上玩耍",
    "一只猫坐在窗台上",
    "一辆红色的跑车",
]).to(device)

# 编码
with torch.no_grad():
    image_features = model.encode_image(image)
    text_features = model.encode_text(texts)

    # 归一化
    image_features /= image_features.norm(dim=-1, keepdim=True)
    text_features /= text_features.norm(dim=-1, keepdim=True)

    # 计算相似度
    similarity = (image_features @ text_features.T).softmax(dim=-1)
    print(f"狗的相似度: {similarity[0, 0].item():.4f}")
    print(f"猫的相似度: {similarity[0, 1].item():.4f}")
    print(f"车的相似度: {similarity[0, 2].item():.4f}")`,
          },
          {
            lang: "python",
            code: `# CLIP 对比损失函数的简化实现
import torch
import torch.nn as nn
import torch.nn.functional as F

class CLIPLoss(nn.Module):
    """CLIP 的 InfoNCE 对比损失"""

    def __init__(self, temperature: float = 0.07):
        super().__init__()
        self.logit_scale = nn.Parameter(torch.tensor(1.0 / temperature))

    def forward(
        self,
        image_features: torch.Tensor,  # [batch_size, dim]
        text_features: torch.Tensor,   # [batch_size, dim]
    ) -> torch.Tensor:
        # 归一化特征
        image_features = F.normalize(image_features, dim=-1)
        text_features = F.normalize(text_features, dim=-1)

        # 计算相似度矩阵
        logits_per_image = self.logit_scale.exp() * image_features @ text_features.T
        logits_per_text = logits_per_image.T

        # 标签：对角线为正样本
        batch_size = image_features.size(0)
        labels = torch.arange(batch_size, device=image_features.device)

        # 双向交叉熵损失
        loss_i = F.cross_entropy(logits_per_image, labels)
        loss_t = F.cross_entropy(logits_per_text, labels)
        return (loss_i + loss_t) / 2

# 模拟训练
loss_fn = CLIPLoss()
img_feat = torch.randn(32, 512)
txt_feat = torch.randn(32, 512)
loss = loss_fn(img_feat, txt_feat)
print(f"CLIP Loss: {loss.item():.4f}")`,
          },
        ],
        tip: "在生成任务中，CLIP Score 在 0.25-0.32 之间通常表示较好的图文一致性，超过 0.35 说明模型具有极强的对齐能力。",
        warning: "CLIP 对复杂空间关系的理解有限。比如'一只狗坐在猫左边'这种方位描述，CLIP 往往无法准确区分左右关系。",
      },
      {
        title: "3. DALL-E：VQ-VAE 与 Transformer 的首次融合",
        body: `DALL-E（2021）是第一个在大规模上展示文本到图像生成能力的模型，其名称致敬了超现实主义画家 Salvador Dali 和动画角色 WALL-E。DALL-E 的核心创新在于将图像生成问题转化为序列生成问题——这正是 **Transformer** 最擅长的领域。

DALL-E 的架构分为两个关键阶段。第一阶段是图像 tokenization：使用 dVAE（discrete VAE，类似于 VQ-VAE 的变体）将图像编码为离散的 token 序列。具体来说，dVAE 将 256 x 256 的图像压缩为 32 x 32 的网格，每个网格位置对应一个来自 8192 词汇表的离散 token。这样，一张图像就被表示为一个 1024 个 token 的序列。第二阶段是序列建模：将文本 token 和图像 token 拼接成一个完整的序列，输入到 **Transformer** 中进行自回归生成。文本部分使用 BPE（Byte Pair Encoding）编码，图像部分使用 dVAE 编码，两者共享同一个 Transformer 模型。

训练时，DALL-E 最大化序列的条件似然：给定文本前缀，预测后续图像 token 的概率分布。推理时，模型从左到右逐个生成图像 token，最后通过 dVAE 解码器将 token 序列还原为像素图像。这种方法的优雅之处在于：它复用了 NLP 领域已经非常成熟的 Transformer 架构和训练范式。`,
        mermaid: `graph LR
    A["文本 prompt"] --> B["BPE 编码\
文本 tokens"]
    C["输入图像"] --> D["dVAE 编码器\
离散化"]
    D --> E["图像 tokens\
1024个"]
    B --> F["拼接序列"]
    E --> F
    F --> G["自回归 Transformer\
12B 参数"]
    G --> H["预测下一个\
图像 token"]
    H --> I["dVAE 解码器"]
    I --> J["生成图像"]`,
        table: {
          headers: ["组件", "DALL-E 1", "DALL-E 2", "关键变化"],
          rows: [
            ["文本编码", "BPE + Transformer", "CLIP Text Encoder", "引入 CLIP 嵌入"],
            ["图像编码", "dVAE (8192 tokens)", "CLIP Image Encoder", "从离散到连续"],
            ["生成方式", "自回归 Transformer", "扩散模型", "从 AR 到扩散"],
            ["参数量", "12B", "~3.5B", "更高效的架构"],
            ["分辨率", "256x256", "1024x1024", "4 倍提升"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 简化版 DALL-E 架构：dVAE + Transformer
import torch
import torch.nn as nn
import torch.nn.functional as F

class VectorQuantizer(nn.Module):
    """VQ-VAE 的向量量化层"""

    def __init__(self, num_embeddings=8192, embedding_dim=256):
        super().__init__()
        self.embedding = nn.Embedding(num_embeddings, embedding_dim)
        self.embedding.weight.data.uniform_(-1/num_embeddings, 1/num_embeddings)

    def forward(self, z: torch.Tensor):
        # z: [B, C, H, W] -> [B, H*W, C]
        z_flat = z.flatten(2).permute(0, 2, 1)
        # 计算与所有 codebook 向量的距离
        distances = torch.cdist(z_flat, self.embedding.weight)
        indices = torch.argmin(distances, dim=-1)  # [B, H*W]
        quantized = self.embedding(indices)        # [B, H*W, C]
        return quantized, indices

class DALLETransformer(nn.Module):
    """DALL-E 的自回归 Transformer"""

    def __init__(self, vocab_size=8192, text_vocab=50257, d_model=768, n_layers=24):
        super().__init__()
        self.text_embed = nn.Embedding(text_vocab, d_model)
        self.image_embed = nn.Embedding(vocab_size, d_model)
        self.pos_embed = nn.Parameter(torch.randn(1, 2048, d_model) * 0.02)
        encoder_layer = nn.TransformerEncoderLayer(d_model, nhead=12, dim_feedforward=3072)
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)
        self.lm_head = nn.Linear(d_model, vocab_size)

    def forward(self, text_tokens, image_tokens):
        text_emb = self.text_embed(text_tokens)
        image_emb = self.image_embed(image_tokens)
        combined = torch.cat([text_emb, image_emb], dim=1)
        combined = combined + self.pos_embed[:, :combined.size(1)]
        hidden = self.transformer(combined.transpose(0, 1))
        # 只预测图像部分
        img_hidden = hidden[-image_tokens.size(1):]
        return self.lm_head(img_hidden.transpose(0, 1))`,
          },
          {
            lang: "python",
            code: `# DALL-E 风格的条件图像生成（自回归采样）
import torch

def dalle_generate(model, text_tokens, max_len=1024, top_k=256, temperature=1.0):
    """自回归生成图像 token 序列"""
    model.eval()
    image_tokens = []

    with torch.no_grad():
        for i in range(max_len):
            # 逐步生成
            current_image = torch.tensor([image_tokens]) if image_tokens else torch.empty((1, 0), dtype=torch.long)
            logits = model(text_tokens, current_image.to(text_tokens.device))

            # 取最后一个 token 的 logits
            next_logits = logits[:, -1, :] / temperature

            # top-k 采样
            if top_k > 0:
                topk_values, topk_indices = torch.topk(next_logits, top_k)
                probs = F.softmax(topk_values, dim=-1)
                sample_idx = torch.multinomial(probs, 1)
                next_token = topk_indices.gather(1, sample_idx)
            else:
                probs = F.softmax(next_logits, dim=-1)
                next_token = torch.multinomial(probs, 1)

            image_tokens.append(next_token.item())

    return torch.tensor(image_tokens).view(32, 32)  # 重排为 32x32 网格

# 使用示例
text_tokens = torch.randint(0, 50257, (1, 64))  # 模拟 BPE 编码
# model = DALLETransformer()
# tokens = dalle_generate(model, text_tokens)
print("生成了 1024 个图像 token，形状: 32x32")`,
          },
        ],
        tip: "理解 dVAE 的关键：它不是普通的 VAE，而是在连续潜在空间中引入了离散化的瓶颈层。这使得图像可以用有限词汇表中的 token 来表示，为 Transformer 处理创造了条件。",
        warning: "自回归生成的最大问题是误差累积——早期生成的 token 如果出错，后续所有 token 都会受到影响。这是 DALL-E 1 后期被扩散模型取代的根本原因。",
      },
      {
        title: "4. Imagen：级联扩散模型的优雅设计",
        body: `Imagen 是 Google Research 在 2022 年 5 月提出的文本到图像生成模型，其核心设计理念可以用一句话概括：用强大的文本编码器替代大容量的生成模型。Imagen 的论文标题 "Photorealistic Text-to-Image Diffusion Models with Deep Language Understanding" 就暗示了其核心洞察——语言理解能力比生成模型的容量更重要。

Imagen 的架构由三个关键组件构成。第一是文本编码器：使用预训练的 T5-XXL（110 亿参数），这是一个经过海量文本预训练的语言模型，能够捕捉丰富的语义信息。第二是级联扩散管道（Cascaded Diffusion Pipeline）：不是一次性生成高分辨率图像，而是分三个阶段逐步放大。首先是 64 x 64 的基础扩散模型，生成低分辨率但语义正确的图像；然后是两个超分辨率扩散模型，分别将分辨率提升到 256 x 256 和 1024 x 1024。每个阶段都使用相同的 T5 文本嵌入作为条件。

级联设计的关键优势在于效率和质量的平衡。在低分辨率阶段，模型专注于捕捉语义内容和整体构图；在高分辨率阶段，模型专注于添加细节和纹理。这种分工使得每个子模型都不需要处理过大的信息量，从而可以用更小的参数量实现更好的效果。Imagen 还引入了 Dynamic Thresholding 技术来解决 CFG 引导过强导致的色彩饱和问题。`,
        mermaid: `graph LR
    A["文本 prompt"] --> B["T5-XXL\
11B 参数"]
    B --> C["文本嵌入\
Frozen"]
    C --> D["64x64 扩散模型\
Base U-Net"]
    D --> E["64x64 图像"]
    E --> F["SR 扩散模型 1\
256x256"]
    F --> G["256x256 图像"]
    G --> H["SR 扩散模型 2\
1024x1024"]
    H --> I["1024x1024\
最终图像"]`,
        table: {
          headers: ["级联阶段", "输入分辨率", "输出分辨率", "模型作用", "参数量"],
          rows: [
            ["Base Model", "64x64", "64x64", "语义内容生成", "~1B"],
            ["SR Model 1", "64x64 到 256x256", "256x256", "中等细节添加", "~1.3B"],
            ["SR Model 2", "256x256 到 1024x1024", "1024x1024", "精细纹理和边缘", "~1.3B"],
            ["端到端", "N/A", "1024x1024", "完整生成管道", "~3.6B"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# Imagen 级联扩散管道的简化实现
import torch
import torch.nn as nn

class ImagenPipeline:
    """Imagen 级联扩散模型管道"""

    def __init__(self, text_encoder, base_diffusion, sr_model_1, sr_model_2):
        self.text_encoder = text_encoder   # T5-XXL
        self.base_diffusion = base_diffusion  # 64x64
        self.sr_model_1 = sr_model_1       # 64->256
        self.sr_model_2 = sr_model_2       # 256->1024

    @torch.no_grad()
    def generate(self, prompt: str, guidance_scale: float = 7.5, seed: int = 42):
        # Step 1: 文本编码（冻结）
        text_embed = self.text_encoder.encode(prompt)

        # Step 2: 64x64 基础生成
        torch.manual_seed(seed)
        low_res = self.base_diffusion.sample(
            cond=text_embed,
            guidance_scale=guidance_scale,
            steps=100,
        )  # [1, 3, 64, 64]

        # Step 3: 第一次超分辨率 64 -> 256
        mid_res = self.sr_model_1.sample(
            low_res_image=low_res,
            cond=text_embed,
            guidance_scale=guidance_scale,
            steps=50,
        )  # [1, 3, 256, 256]

        # Step 4: 第二次超分辨率 256 -> 1024
        high_res = self.sr_model_2.sample(
            low_res_image=mid_res,
            cond=text_embed,
            guidance_scale=guidance_scale,
            steps=50,
        )  # [1, 3, 1024, 1024]

        return high_res`,
          },
          {
            lang: "python",
            code: `# Dynamic Thresholding - Imagen 的关键技术
import torch

def dynamic_thresholding(
    samples: torch.Tensor,
    percentile: float = 0.995,
    clamp_min: float = -1.0,
    clamp_max: float = 1.0,
) -> torch.Tensor:
    """Imagen 的动态阈值化技术

    解决 CFG 引导过强导致的色彩饱和和伪影问题。
    核心思想：根据当前样本的绝对值分布动态调整裁剪范围，
    而不是使用固定的 [-1, 1] 范围。
    """
    device = samples.device
    dtype = samples.dtype

    # 展平并计算绝对值的分位数
    s = samples.flatten(1).abs()
    s_quantile, _ = torch.quantile(s, percentile, dim=1)  # [batch]
    s_quantile = torch.clamp(s_quantile, min=1.0)  # 确保最小范围为 1.0

    # 归一化到 [-1, 1]
    s_quantile = s_quantile.view(-1, 1, 1, 1)
    normalized = samples / s_quantile

    # 最终裁剪
    return torch.clamp(normalized, clamp_min, clamp_max).to(dtype)

# 测试
noisy_pred = torch.randn(1, 3, 64, 64) * 3.0  # 模拟高 CFG 导致的溢出
cleaned = dynamic_thresholding(noisy_pred)
print(f"原始范围: [{noisy_pred.min():.2f}, {noisy_pred.max():.2f}]")
print(f"阈值化后: [{cleaned.min():.2f}, {cleaned.max():.2f}]")`,
          },
        ],
        tip: "Imagen 的核心洞察值得牢记：强大的文本编码器比更大的生成模型更重要。这个原则后来被 DALL-E 3 的 GPT-4 prompt 扩展方案所验证。",
        warning: "级联扩散模型的推理速度较慢，因为需要依次运行三个模型。在实际部署中，可以考虑跳过低分辨率阶段或减少采样步数来加速。",
      },
      {
        title: "5. DALL-E 2 与 DALL-E 3：从先验网络到语言理解",
        body: `DALL-E 2（2022 年 4 月）代表了 **OpenAI** 在文本到图像生成上的重大架构转变。与 DALL-E 1 的自回归方式不同，DALL-E 2 采用了两阶段扩散架构：第一阶段是先验网络（Prior），将 CLIP 文本嵌入转换为 CLIP 图像嵌入；第二阶段是扩散解码器（Decoder），从 CLIP 图像嵌入条件生成实际图像。这个设计的巧妙之处在于：CLIP 图像嵌入本身已经包含了丰富的视觉先验知识，先验网络的任务只是学习文本到这些嵌入的映射。

DALL-E 2 还引入了一个创新的变体编辑功能——通过修改 CLIP 图像嵌入的一部分，可以保持图像的某些属性（如风格、构图）不变，同时改变其他属性（如颜色、物体）。这种语义插值能力使得用户可以精细控制生成结果的各个方面。

DALL-E 3（2023 年 9 月）则采取了完全不同的策略。它不再依赖复杂的先验网络，而是直接将生成模型与 **GPT-4** 深度集成。当用户输入简短的 prompt 时，**GPT-4** 会自动将其扩展为详细的描述，包含构图、风格、色彩等丰富信息。这种语言先行的方法使得 DALL-E 3 在复杂 prompt 理解和指令遵循方面显著超越前代。同时，DALL-E 3 还引入了细粒度的安全过滤机制和内容水印（SynthID），以应对 AI 生成内容的滥用风险。`,
        mermaid: `graph TD
    subgraph "DALL-E 2 架构"
    A1["文本 prompt"] --> B1["CLIP Text Encoder"]
    B1 --> C1["Prior 网络\
文本 图像嵌入"]
    C1 --> D1["CLIP Image Embedding"]
    D1 --> E1["扩散解码器\
Decoder U-Net"]
    E1 --> F1["生成图像"]
    end
    subgraph "DALL-E 3 架构"
    A2["简短 prompt"] --> B2["GPT-4 扩展\
详细描述"]
    B2 --> C2["文本编码器"]
    C2 --> D2["扩散模型\
条件生成"]
    D2 --> E2["生成图像"]
    end`,
        table: {
          headers: ["特性", "DALL-E 2", "DALL-E 3", "差异说明"],
          rows: [
            ["文本理解", "CLIP 文本编码器", "GPT-4 扩展 + 扩散", "DALL-E 3 理解更复杂的 prompt"],
            ["生成架构", "先验网络 + 扩散解码器", "端到端扩散模型", "DALL-E 3 架构更简洁"],
            ["指令遵循", "基础能力", "显著增强", "DALL-E 3 能生成含特定文字的图像"],
            ["安全机制", "基础过滤", "SynthID 水印 + 细粒度过滤", "DALL-E 3 安全措施更完善"],
            ["编辑能力", "变体生成（Variations）", "区域编辑 + 扩展画布", "DALL-E 3 编辑更精细"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# DALL-E 2 风格的先验网络
import torch
import torch.nn as nn

class DiffusionPrior(nn.Module):
    """DALL-E 2 的先验网络：将 CLIP 文本嵌入映射到 CLIP 图像嵌入"""

    def __init__(self, text_dim: int = 768, image_dim: int = 768, hidden_dim: int = 1024):
        super().__init__()
        # 简单的 MLP 先验（实际中使用扩散过程）
        self.text_proj = nn.Sequential(
            nn.Linear(text_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.GELU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.GELU(),
            nn.Linear(hidden_dim, image_dim),
        )

    def forward(self, text_embed: torch.Tensor, noise: torch.Tensor = None) -> torch.Tensor:
        """将文本嵌入投影到图像嵌入空间"""
        # 简化版：直接投影（实际使用扩散逆过程）
        projected = self.text_proj(text_embed)
        if noise is not None:
            projected = projected + noise
        return projected

# 使用示例
prior = DiffusionPrior(text_dim=768, image_dim=768)
text_embed = torch.randn(1, 768)  # 来自 CLIP 文本编码器
image_embed = prior(text_embed)
print(f"CLIP 图像嵌入形状: {image_embed.shape}")  # [1, 768]`,
          },
          {
            lang: "python",
            code: `# DALL-E 3 风格的 prompt 扩展
import openai

class PromptExpander:
    """模拟 DALL-E 3 的 GPT-4 prompt 扩展机制"""

    def __init__(self, api_key: str = None):
        self.client = openai.OpenAI(api_key=api_key)
        self.system_prompt = """你是一个专业的视觉描述专家。
用户会给你一个简短的图像生成 prompt，你需要将其扩展为
一个详细的描述，包含：主体、背景、构图、风格、色彩、光影。
扩展后的描述应该具体、生动，适合文本到图像模型使用。"""

    def expand(self, short_prompt: str, style: str = None) -> str:
        """将简短 prompt 扩展为详细描述"""
        style_hint = f"\\n风格偏好: {style}" if style else ""
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": f"扩展以下 prompt：{short_prompt}{style_hint}"}
            ],
            temperature=0.7,
            max_tokens=300,
        )
        return response.choices[0].message.content

# 使用示例
expander = PromptExpander()
expanded = expander.expand(
    short_prompt="一只猫在太空",
    style="赛博朋克，霓虹色调"
)
print(f"扩展后的 prompt:\\n{expanded}")`,
          },
        ],
        tip: "使用 DALL-E 3 时，写简短的 prompt 反而效果更好，因为 GPT-4 会自动补充丰富的细节。过度详细的 prompt 可能适得其反。",
        warning: "DALL-E 3 生成的图像默认带有 SynthID 水印，这在大多数平台可以检测。如果需要无水印图像，请考虑开源方案如 Stable Diffusion。",
      },
      {
        title: "6. 评估指标：FID、CLIP Score 与人类评估",
        body: `如何评估一张 AI 生成的图像好不好？这个问题比看起来复杂得多。评估文本到图像生成模型需要从三个维度综合考量：图像质量（Image Quality）、图文一致性（Text-Image Alignment）和多样性（Diversity）。每个维度都有对应的量化指标，但没有一个指标是完美的。

FID（Fréchet Inception Distance）是最主流的图像质量评估指标。它的核心思想是：分别计算真实图像集合和生成图像集合在 Inception-V3 特征空间中的分布，然后用 Fréchet 距离（两个多元高斯分布之间的距离）来衡量它们的差异。FID 越低，说明生成图像的分布越接近真实图像分布。但 FID 有一个致命缺陷：它不评估图文一致性。一个模型可以生成非常逼真但与 prompt 无关的图像，仍然获得很低的 FID。

CLIP Score 弥补了 FID 的不足——它直接衡量生成图像与输入文本之间的语义相似度。计算方式是用 CLIP 模型分别编码图像和文本，然后计算两者嵌入向量的余弦相似度。CLIP Score 越高，说明图文一致性越好。但它也有局限：CLIP 本身可能存在偏见，对于复杂的空间关系和细粒度属性（如计数、精确位置）判断不够准确。

人类评估仍然是金标准。常用的方法是 AMT（Amazon Mechanical Turk）众包评分，让人类评判员从多个维度对生成结果进行打分。虽然成本高昂，但人类评估能够捕捉到量化指标无法反映的微妙差异。`,
        mermaid: `graph TD
    A["生成图像集合"] --> B["Inception-V3\
特征提取"]
    C["真实图像集合"] --> B
    B --> D["多元高斯拟合\
mu1 sigma1 和 mu2 sigma2"]
    D --> E["Frechet 距离\
FID 计算"]
    E --> F["FID 分数\
越低越好"]
    A --> G["CLIP 图像编码器"]
    H["文本 prompt"] --> I["CLIP 文本编码器"]
    G --> J["余弦相似度\
CLIP Score"]
    I --> J
    J --> K["CLIP Score\
越高越好"]`,
        table: {
          headers: ["指标", "评估维度", "理想值", "局限性"],
          rows: [
            ["FID", "图像质量/分布相似度", "越低越好 (0=完美)", "不评估图文一致性，对样本量敏感"],
            ["IS (Inception Score)", "图像多样性/清晰度", "越高越好", "只评估无条件生成，不考虑文本"],
            ["CLIP Score", "图文语义一致性", "越高越好 (最大~0.35)", "对复杂空间关系不敏感"],
            ["HPS (Human Preference Score)", "人类偏好", "越高越好", "基于大量人工标注，成本高"],
            ["PickScore", "人类偏好 (自动化)", "越高越好", "基于 CLIP 训练的人类偏好代理"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# 计算 FID 分数
import numpy as np
from scipy import linalg
import torch
import torchvision.models as models
from torchvision import transforms

class FIDEvaluator:
    """Frechet Inception Distance 计算"""

    def __init__(self, device="cuda"):
        self.device = device
        # 加载 Inception-V3 并移除分类头
        self.model = models.inception_v3(
            weights=models.Inception_V3_Weights.IMAGENET1K_V1
        )
        self.model.fc = torch.nn.Identity()  # 移除分类头
        self.model.eval().to(device)

        # 预处理
        self.transform = transforms.Compose([
            transforms.Resize((299, 299)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                std=[0.229, 0.224, 0.225]),
        ])

    def extract_features(self, images: torch.Tensor) -> np.ndarray:
        """提取 Inception-V3 特征"""
        features = []
        with torch.no_grad():
            for img in images:
                feat = self.model(img.unsqueeze(0).to(self.device))
                features.append(feat.cpu().numpy())
        return np.concatenate(features, axis=0)

    @staticmethod
    def calculate_fid(
        mu1: np.ndarray, sigma1: np.ndarray,
        mu2: np.ndarray, sigma2: np.ndarray,
    ) -> float:
        """计算两个高斯分布之间的 Frechet 距离"""
        diff = mu1 - mu2
        # 协方差矩阵的平方根（使用 matrix square root）
        covmean, _ = linalg.sqrtm(sigma1 @ sigma2, disp=False)
        if np.iscomplexobj(covmean):
            covmean = covmean.real
        fid = diff.dot(diff) + np.trace(sigma1) + np.trace(sigma2) - 2 * np.trace(covmean)
        return float(fid)

    def evaluate(self, real_images: torch.Tensor, gen_images: torch.Tensor) -> float:
        real_feats = self.extract_features(real_images)
        gen_feats = self.extract_features(gen_images)
        mu1, sigma1 = real_feats.mean(0), np.cov(real_feats, rowvar=False)
        mu2, sigma2 = gen_feats.mean(0), np.cov(gen_feats, rowvar=False)
        return self.calculate_fid(mu1, sigma1, mu2, sigma2)`,
          },
          {
            lang: "python",
            code: `# 综合评估：FID + CLIP Score + PickScore
import torch

class ComprehensiveEvaluator:
    """综合评估文本到图像生成质量"""

    def __init__(self, clip_model, inception_model, device="cuda"):
        self.clip_model = clip_model
        self.inception_model = inception_model
        self.device = device

    def batch_evaluate(
        self,
        prompts: list[str],
        generated_images: torch.Tensor,
        real_images: torch.Tensor = None,
    ) -> dict:
        results = {}

        # 1. CLIP Score（图文一致性）
        clip_scores = []
        with torch.no_grad():
            text_embeds = self.clip_model.encode_text(
                torch.stack([torch.tensor(clip.tokenize(p)) for p in prompts])
            )
            image_embeds = self.clip_model.encode_image(generated_images)
            text_embeds = text_embeds / text_embeds.norm(dim=-1, keepdim=True)
            image_embeds = image_embeds / image_embeds.norm(dim=-1, keepdim=True)
            clip_scores = (image_embeds @ text_embeds.T).diag().tolist()

        results["mean_clip_score"] = sum(clip_scores) / len(clip_scores)
        results["clip_scores"] = clip_scores

        # 2. FID（图像质量，需要真实图像参考）
        if real_images is not None:
            pass  # fid = fid_eval.evaluate(real_images, generated_images)
            # results["fid"] = fid

        # 3. 多样性（pairwise CLIP 距离）
        image_embeds_norm = image_embeds / image_embeds.norm(dim=-1, keepdim=True)
        pairwise_sim = image_embeds_norm @ image_embeds_norm.T
        # 去除对角线（自身相似度=1）
        mask = ~torch.eye(pairwise_sim.size(0), dtype=torch.bool)
        diversity = 1.0 - pairwise_sim[mask].mean().item()
        results["diversity"] = diversity

        return results

# 使用示例
evaluator = ComprehensiveEvaluator(clip_model=None, inception_model=None)
prompts = ["一只狗", "一只猫", "一朵花"]
gen_images = torch.randn(3, 3, 224, 224)
# results = evaluator.batch_evaluate(prompts, gen_images)`,
          },
        ],
        tip: "在实践中，建议同时报告 FID 和 CLIP Score。单独看 FID 可能误导你选择了一个图像逼真但图文不匹配的模型。",
        warning: "FID 对样本量非常敏感。评估时至少需要 10000 张生成图像和等量真实图像，否则结果可能不可靠。",
      },
      {
        title: "7. diffusers 库实战：从零构建文本到图像 Pipeline",
        body: `Hugging Face 的 diffusers 库是目前最流行的文本到图像生成开源框架。它提供了一套模块化、可扩展的 API，支持 Stable Diffusion、Kandinsky、DeepFloyd IF 等多种模型架构。理解 diffusers 的工作原理，是掌握现代文本到图像生成技术的关键一步。

diffusers 的核心抽象是 Pipeline——它将文本编码器、UNet 扩散模型和 VAE 解码器串联成一个完整的生成流程。用户可以灵活替换其中的任何一个组件：比如用自定义的 LoRA 权重替换基础 UNet，或者用自定义的文本编码器替换默认的 CLIP。这种模块化设计使得研究和实验变得异常简单。

本节通过一个完整的实战案例，展示如何使用 diffusers 构建一个自定义的文本到图像生成管道。我们将从加载预训练模型开始，逐步添加自定义的 prompt 处理、采样器配置、安全检查和后处理优化。通过这个案例，你将不仅学会使用 diffusers，更会理解其内部的工作机制和设计哲学。`,
        mermaid: `graph LR
    A["StableDiffusionPipeline"] --> B["tokenizer\
CLIPTokenizer"]
    A --> C["text_encoder\
CLIPTextModel"]
    A --> D["unet\
UNet2DConditionModel"]
    A --> E["scheduler\
PNDM/Euler"]
    A --> F["vae\
AutoencoderKL"]
    B --> G["token IDs"]
    C --> H["文本嵌入"]
    H --> D
    D --> I["噪声预测"]
    I --> E
    E --> J["逐步去噪"]
    J --> F
    F --> K["输出图像"]`,
        table: {
          headers: ["Pipeline 组件", "默认模型", "可替换方案", "用途"],
          rows: [
            ["tokenizer", "CLIPTokenizer", "T5Tokenizer", "文本分词"],
            ["text_encoder", "CLIPTextModel", "T5EncoderModel", "文本编码"],
            ["unet", "UNet2DConditionModel", "UNet3DConditionModel", "噪声预测"],
            ["scheduler", "PNDMScheduler", "EulerAncestral/Karras", "采样策略"],
            ["vae", "AutoencoderKL", "稳定性 VAE", "像素解码"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `# diffusers 实战：自定义文本到图像 Pipeline
from diffusers import (
    StableDiffusionPipeline,
    EulerAncestralDiscreteScheduler,
    DPMSolverMultistepScheduler,
)
import torch
from PIL import Image

class CustomImageGenerator:
    """基于 diffusers 的自定义图像生成器"""

    def __init__(self, model_id: str = "runwayml/stable-diffusion-v1-5"):
        # 加载基础 Pipeline
        self.pipe = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            safety_checker=None,  # 生产环境建议保留
            use_safetensors=True,
        )

        # 使用更快的采样器
        self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(
            self.pipe.scheduler.config
        )
        self.pipe.to("cuda")

    def generate(
        self,
        prompt: str,
        negative_prompt: str = "",
        width: int = 512,
        height: int = 512,
        guidance_scale: float = 7.5,
        num_inference_steps: int = 30,
        seed: int = None,
        num_images: int = 1,
    ) -> list[Image.Image]:
        """生成图像"""
        generator = None
        if seed is not None:
            generator = torch.Generator(device="cuda").manual_seed(seed)

        images = self.pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
            generator=generator,
            num_images_per_prompt=num_images,
        ).images

        return images

    def generate_batch(
        self,
        prompts: list[str],
        **kwargs,
    ) -> list[list[Image.Image]]:
        """批量生成多张图像"""
        all_images = []
        for prompt in prompts:
            images = self.generate(prompt=prompt, **kwargs)
            all_images.append(images)
        return all_images

# 使用示例
gen = CustomImageGenerator()
images = gen.generate(
    prompt="一只赛博朋克风格的猫，霓虹灯光，未来城市背景",
    negative_prompt="模糊, 低质量, 变形的手",
    guidance_scale=8.0,
    num_inference_steps=40,
    seed=42,
)
images[0].save("cyberpunk_cat.png")`,
          },
          {
            lang: "python",
            code: `# diffusers 进阶：LoRA 微调与自定义采样
from diffusers import StableDiffusionPipeline, DDIMScheduler
from peft import LoraConfig, inject_adapter_in_model
import torch

class LoRAImageGenerator:
    """使用 LoRA 进行高效微调的生成器"""

    def __init__(self, base_model: str, lora_path: str = None):
        self.pipe = StableDiffusionPipeline.from_pretrained(
            base_model,
            torch_dtype=torch.float16,
            use_safetensors=True,
        )
        self.pipe.scheduler = DDIMScheduler.from_config(
            self.pipe.scheduler.config,
            timestep_spacing="trailing",
            prediction_type="epsilon",
        )
        self.pipe.to("cuda")

        # 加载 LoRA 权重
        if lora_path:
            self.pipe.load_lora_weights(lora_path)
            print(f"已加载 LoRA 权重: {lora_path}")

    def generate_with_cfg(
        self,
        prompt: str,
        negative_prompt: str = "",
        guidance_scale: float = 7.5,
        eta: float = 0.0,  # DDIM eta 参数
    ) -> torch.Tensor:
        """带分类器自由引导的 DDIM 采样"""
        # 编码 prompt
        text_input = self.pipe.tokenizer(
            prompt,
            padding="max_length",
            max_length=self.pipe.tokenizer.model_max_length,
            truncation=True,
            return_tensors="pt",
        ).to(self.pipe.device)

        text_embeds = self.pipe.text_encoder(text_input.input_ids)[0]

        # 编码 negative prompt
        if negative_prompt:
            uncond_input = self.pipe.tokenizer(
                negative_prompt,
                padding="max_length",
                max_length=self.pipe.tokenizer.model_max_length,
                truncation=True,
                return_tensors="pt",
            ).to(self.pipe.device)
            uncond_embeds = self.pipe.text_encoder(uncond_input.input_ids)[0]
            text_embeds = torch.cat([uncond_embeds, text_embeds])

        # 初始化噪声
        latent = torch.randn(1, 4, 64, 64, device=self.pipe.device, dtype=torch.float16)

        # DDIM 采样循环
        self.pipe.scheduler.set_timesteps(50)
        for t in self.pipe.scheduler.timesteps:
            latent_input = torch.cat([latent] * 2) if negative_prompt else latent
            noise_pred = self.pipe.unet(latent_input, t, text_embeds).sample

            if negative_prompt:
                noise_pred_uncond, noise_pred_cond = noise_pred.chunk(2)
                noise_pred = noise_pred_uncond + guidance_scale * (
                    noise_pred_cond - noise_pred_uncond
                )

            latent = self.pipe.scheduler.step(noise_pred, t, latent, eta=eta).prev_sample

        # 解码
        latent = 1 / self.pipe.vae.config.scaling_factor * latent
        image = self.pipe.vae.decode(latent).sample
        image = (image / 2 + 0.5).clamp(0, 1)
        return image`,
          },
        ],
        tip: "推荐新手使用 DPMSolverMultistepScheduler，它通常只需要 20-25 步就能达到 PNDM 需要 50 步的效果，推理速度提升一倍。",
        warning: "diffusers 的 safety_checker 默认启用，会过滤掉可能含有不当内容的生成结果。在生产环境中不要直接关闭它，而是配置合适的内容策略。",
      },
    ],
};
