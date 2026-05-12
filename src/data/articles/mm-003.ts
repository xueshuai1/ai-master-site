import { Article } from '../knowledge';

export const article: Article = {
    id: "mm-003",
    title: "多模态学习（三）：多模态大模型与统一架构",
    category: "multimodal",
    tags: ["图文生成", "图像描述", "多模态"],
    summary: "从图像到文本再到图像，理解跨模态生成的核心技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
  learningPath: {
    routeId: "multimodal-series",
    phase: 3,
    order: 3,
    nextStep: null,
    prevStep: "mm-002",
  },
    content: [
        {
            title: "1. 图像描述（Image Captioning）任务概述",
            body: `图像描述是多模态理解的核心任务之一，目标是为输入图像生成一段自然语言描述。该任务要求模型同时具备视觉感知能力和语言生成能力，本质上是一个跨模态的序列生成问题。经典的数据集包括 MSCOCO（12.3 万张图像，每张 5 条人工标注描述）和 Flickr30k（3.1 万张图像）。图像描述的技术路线经历了从早期模板方法到统计学习，再到深度学习的演进。现代方法普遍采用 Encoder-Decoder 架构，其中 Encoder 负责提取图像的语义特征表示，Decoder 则基于这些特征自回归地生成描述文本。该任务不仅本身具有重要的应用价值，还是许多下游多模态任务（如视觉问答、视觉推理）的基础。`,
            code: [
                {
                    lang: "python",
                    code: `# 使用 COCO API 加载和可视化图像描述
from pycocotools.coco import COCO
import matplotlib.pyplot as plt

coco = COCO("annotations/captions_val2017.json")
img_ids = coco.getImgIds()[:3]
for img_id in img_ids:
    img_info = coco.loadImgs(img_id)[0]
    ann_ids = coco.getAnnIds(imgIds=img_id)
    anns = coco.loadAnns(ann_ids)
    captions = [ann["caption"] for ann in anns]
    print(f"Image {img_info['file_name']}:")
    for i, cap in enumerate(captions[:3], 1):
        print(f"  [{i}] {cap}")`
                },
                {
                    lang: "python",
                    code: `# 构建图像-文本对的数据加载器
from torch.utils.data import Dataset
from PIL import Image
import torchvision.transforms as T

class CaptionDataset(Dataset):
    def __init__(self, image_dir, annotations, vocab):
        self.image_dir = image_dir
        self.annotations = annotations
        self.vocab = vocab
        self.transform = T.Compose([
            T.Resize(256),
            T.CenterCrop(224),
            T.ToTensor(),
            T.Normalize([0.485, 0.456, 0.406],
                        [0.229, 0.224, 0.225])
        ])

    def __len__(self):
        return len(self.annotations)

    def __getitem__(self, idx):
        ann = self.annotations[idx]
        image = Image.open(f"{self.image_dir}/{ann['image']}")
        image = self.transform(image)
        caption_ids = self.vocab.encode(ann["caption"])
        return image, caption_ids`
                }
            ],
            table: {
                headers: ["数据集", "图像数", "描述数", "每张描述数"],
                rows: [
                    ["MSCOCO", "123,287", "615,435", "5"],
                    ["Flickr30k", "31,783", "158,915", "5"],
                    ["Flickr8k", "8,092", "40,460", "5"],
                    ["Conceptual Captions", "3.3M", "3.3M", "1"],
                ]
            },
            mermaid: `graph LR
    A[输入图像] --> B[视觉 Encoder]
    B --> C[图像特征向量]
    C --> D[语言 Decoder]
    D --> E[BOS]
    E --> F["a dog"]
    F --> G["playing in"]
    G --> H["the snow"]
    H --> I[EOS]`,
            tip: "开始学习时先用 MSCOCO 的验证集做实验，该数据集标注质量高且社区工具链完善。",
            warning: "图像描述与图像分类不同，同一图像可能存在多种正确描述，不要期望模型输出与某个标注完全匹配。"
        },
        {
            title: "2. Encoder-Decoder 架构详解",
            body: `Encoder-Decoder 架构是图像描述模型的骨干结构。Encoder 通常使用预训练的卷积神经网络（如 ResNet、EfficientNet）或视觉 **Transformer**（如 ViT）将图像编码为固定维度的特征表示。传统方法将整个图像压缩为一个全局特征向量，但这种方式会丢失空间细节信息。改进后的方法保留空间特征图，输出形状为 (H, W, C) 的张量，其中 H 和 W 是特征图的空间维度，C 是通道数。Decoder 通常基于 LSTM 或 **Transformer**，它接收 Encoder 输出的视觉特征，并结合上一时刻生成的词元，逐步产生描述文本。Show and Tell 模型是这一架构的奠基性工作，其 Encoder 使用 Inception-v3 提取图像特征，Decoder 使用单层 LSTM 生成文本序列，开创了端到端图像描述的先河。`,
            code: [
                {
                    lang: "python",
                    code: `# Show and Tell 风格的 Encoder-Decoder 模型
import torch
import torch.nn as nn
import torchvision.models as models

class ShowAndTell(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim):
        super().__init__()
        # Encoder: 预训练 ResNet-50
        resnet = models.resnet50(weights="IMAGENET1K_V1")
        self.encoder = nn.Sequential(*list(resnet.children())[:-1])
        for param in self.encoder.parameters():
            param.requires_grad = False

        # Decoder: LSTM
        self.embed = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, vocab_size)

    def forward(self, images, captions):
        features = self.encoder(images).squeeze(-1).squeeze(-1)
        embeddings = self.embed(captions)
        h0, c0 = self._init_hidden(features)
        outputs, _ = self.lstm(embeddings, (h0, c0))
        return self.fc(outputs)

    def _init_hidden(self, features):
        h0 = features.unsqueeze(0)
        c0 = torch.zeros_like(h0)
        return h0, c0`
                },
                {
                    lang: "python",
                    code: `# 基于 ViT 的视觉 Encoder
import torch.nn as nn
from transformers import ViTModel

class ViTEncoder(nn.Module):
    def __init__(self, model_name="google/vit-base-patch16-224"):
        super().__init__()
        self.vit = ViTModel.from_pretrained(model_name)
        for param in self.vit.parameters():
            param.requires_grad = False

    def forward(self, images):
        outputs = self.vit(pixel_values=images)
        # 使用 [CLS] token 作为全局表示
        cls_token = outputs.last_hidden_state[:, 0, :]
        # 使用所有 patch token 作为空间特征
        patch_tokens = outputs.last_hidden_state[:, 1:, :]
        return cls_token, patch_tokens

# 测试
encoder = ViTEncoder()
dummy = torch.randn(2, 3, 224, 224)
cls_feat, patch_feat = encoder(dummy)
print(f"CLS: {cls_feat.shape}")       # [2, 768]
print(f"Patches: {patch_feat.shape}")  # [2, 196, 768]`
                }
            ],
            table: {
                headers: ["Encoder 类型", "参数量", "输出维度", "空间信息"],
                rows: [
                    ["ResNet-50 (全局池化)", "25M", "(batch, 2048)", "丢失"],
                    ["ResNet-101 (特征图)", "44M", "(batch, 7, 7, 2048)", "保留"],
                    ["ViT-Base", "86M", "(batch, 197, 768)", "保留"],
                    ["CLIP-ViT-L/14", "307M", "(batch, 257, 1024)", "保留"],
                ]
            },
            mermaid: `graph TD
    A[输入图像 224x224x3] --> B[ViT Patch Embedding]
    B --> C[196个 Patch Token + CLS]
    C --> D[Transformer Layers x12]
    D --> E[CLS Token 全局特征]
    D --> F[Patch Tokens 空间特征]
    E --> G[Decoder 初始隐藏状态]
    F --> H[Attention Key/Value]`,
            tip: "冻结 Encoder 参数进行预训练可以大幅减少显存占用和训练时间，待 Decoder 收敛后再微调 Encoder 通常能获得更好的性能。",
            warning: "使用预训练 ViT 时，输入图像必须经过正确的归一化（mean=[0.5,0.5,0.5], std=[0.5,0.5,0.5]），否则特征质量会严重下降。"
        },
        {
            title: "3. 注意力机制在 Captioning 中的应用",
            body: `Show, Attend and Tell 模型首次将注意力机制引入图像描述任务。其核心思想是：生成每个词时，模型不应同等对待整张图像，而应该关注与当前词相关的图像区域。这种软注意力机制计算每个空间位置的权重分布，使得 Decoder 能够动态地聚焦于图像的不同区域。例如生成 "dog" 时关注图像中的狗所在区域，生成 "grass" 时关注草地区域。注意力权重还可以被可视化，帮助理解模型的决策过程。后续工作进一步引入了自顶向下的注意力（Top-Down Attention），使用 Faster R-CNN 检测图像中的目标区域（objects），然后在这些候选区域上计算注意力。这种方法比基于网格的注意力更加精确，因为注意力直接作用于语义上有意义的目标区域，而非任意的特征图像素网格。`,
            code: [
                {
                    lang: "python",
                    code: `# 软注意力（Soft Attention）机制实现
class SoftAttention(nn.Module):
    def __init__(self, encoder_dim, decoder_dim):
        super().__init__()
        self.encoder_att = nn.Linear(encoder_dim, decoder_dim)
        self.decoder_att = nn.Linear(decoder_dim, decoder_dim)
        self.full_att = nn.Linear(decoder_dim, 1)
        self.relu = nn.ReLU()
        self.softmax = nn.Softmax(dim=1)

    def forward(self, encoder_out, decoder_hidden):
        # encoder_out: (batch, num_pixels, encoder_dim)
        att1 = self.encoder_att(encoder_out)        # (batch, num_pixels, decoder_dim)
        att2 = self.decoder_att(decoder_hidden)      # (batch, decoder_dim)
        att = self.full_att(self.relu(att1 + att2.unsqueeze(1))).squeeze(2)
        alpha = self.softmax(att)  # (batch, num_pixels)
        attention_weighted_encoding = (encoder_out * alpha.unsqueeze(2)).sum(dim=1)
        return attention_weighted_encoding, alpha`
                },
                {
                    lang: "python",
                    code: `# 自顶向下注意力（Top-Down Attention）
class TopDownAttention(nn.Module):
    def __init__(self, obj_dim, hidden_dim, num_heads=8):
        super().__init__()
        self.multihead_attn = nn.MultiheadAttention(
            embed_dim=hidden_dim,
            num_heads=num_heads,
            batch_first=True,
            kdim=obj_dim,
            vdim=obj_dim,
        )
        self.obj_proj = nn.Linear(obj_dim, hidden_dim)

    def forward(self, decoder_query, object_features, mask=None):
        key = self.obj_proj(object_features)
        value = object_features
        attended, attn_weights = self.multihead_attn(
            query=decoder_query,
            key=key,
            value=value,
            key_padding_mask=mask,
        )
        return attended, attn_weights

# object_features 来自 Faster R-CNN 的 RoI Align
# shape: (batch, num_objects, obj_dim)`
                }
            ],
            table: {
                headers: ["注意力类型", "特征来源", "注意力粒度", "性能 (CIDEr)"],
                rows: [
                    ["无注意力", "全局特征", "整图", "94.0"],
                    ["软注意力", "CNN 特征图", "网格 (7x7)", "105.2"],
                    ["硬注意力", "CNN 特征图", "网格 (7x7)", "100.5"],
                    ["自顶向下注意力", "目标检测区域", "语义区域", "120.1"],
                ]
            },
            mermaid: `graph LR
    A[图像] --> B[Faster R-CNN]
    B --> C[目标区域特征 RoI]
    D[上一时刻隐藏状态] --> E[Attention 计算]
    C --> E
    E --> F[注意力权重 alpha]
    F --> G[加权视觉特征]
    G --> H[LSTM/Transformer]
    H --> I[下一个词]`,
            tip: "可视化注意力权重是调试模型的重要手段，可以直观地检查模型是否关注到了正确的图像区域。",
            warning: "硬注意力（Hard Attention）不可导，需要使用 REINFORCE 算法进行策略梯度训练，方差大且训练不稳定，建议优先使用软注意力。"
        },
        {
            title: "4. 文本到图像生成（DALL-E / Stable Diffusion）",
            body: `文本到图像生成是图像描述的逆任务，也是近年来 AI 领域最引人注目的突破之一。DALL-E 由 **OpenAI** 提出，采用 **Transformer** 架构将文本和图像统一为离散的 token 序列。它首先使用 VQ-VAE 将图像压缩为离散的视觉 token，然后将文本 token 和视觉 token 拼接后送入 **Transformer** 进行自回归生成。这种方法概念简洁，但分辨率和质量受限于 VQ-VAE 的压缩能力。DALL-E 2 引入了 CLIP 和扩散模型，通过 CLIP 的文本编码器提取文本的语义嵌入，然后使用先验网络将文本嵌入转换为图像嵌入，最后通过扩散解码器从噪声中逐步生成图像。Stable Diffusion 则进一步降低了计算成本，它在潜空间（Latent Space）而非像素空间进行扩散过程，大幅减少了计算量和显存需求，使得在消费级 GPU 上运行高质量图像生成成为可能。`,
            code: [
                {
                    lang: "python",
                    code: `# 使用 Stable Diffusion 生成图像
from diffusers import StableDiffusionPipeline
import torch

# 加载预训练模型
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
)
pipe = pipe.to("cuda")

# 文本到图像生成
prompt = "a photograph of an astronaut riding a horse"
image = pipe(
    prompt,
    num_inference_steps=50,
    guidance_scale=7.5,
).images[0]
image.save("astronaut_horse.png")`
                },
                {
                    lang: "python",
                    code: `# DDPM 扩散过程的核心公式实现
import torch

class DiffusionProcess:
    def __init__(self, num_steps=1000):
        self.num_steps = num_steps
        beta = torch.linspace(1e-4, 0.02, num_steps)
        self.alpha = 1.0 - beta
        self.alpha_bar = torch.cumprod(self.alpha, dim=0)

    def add_noise(self, x0, t):
        noise = torch.randn_like(x0)
        sqrt_alpha_bar = torch.sqrt(self.alpha_bar[t])
        sqrt_one_minus_alpha_bar = torch.sqrt(1 - self.alpha_bar[t])
        return sqrt_alpha_bar * x0 + sqrt_one_minus_alpha_bar * noise, noise

    def sample(self, model, xT, text_embed):
        x = xT
        for t in reversed(range(self.num_steps)):
            noise_pred = model(x, t, text_embed)
            # 简化的反向采样步骤
            x = self._reverse_step(x, noise_pred, t)
        return x`
                }
            ],
            table: {
                headers: ["模型", "年份", "架构", "分辨率", "核心创新"],
                rows: [
                    ["DALL-E", "2021", "Transformer + VQ-VAE", "256x256", "统一 token 序列"],
                    ["DALL-E 2", "2022", "CLIP + 扩散模型", "1024x1024", "先验网络 + 解码器"],
                    ["Stable Diffusion", "2022", "潜空间扩散", "512x512", "潜空间压缩"],
                    ["DALL-E 3", "2023", "扩散 + LLM 提示增强", "1024x1024", "理解复杂提示"],
                ]
            },
            mermaid: `graph TD
    A[文本提示] --> B[CLIP Text Encoder]
    B --> C[文本嵌入]
    C --> D[UNet 去噪网络]
    E[随机噪声] --> D
    F[时间步 t] --> D
    D --> G[预测噪声]
    G --> H[Scheduler 反向更新]
    H --> I[更少噪声的潜变量]
    I --> D
    I --> J[VAE Decoder]
    J --> K[生成图像]`,
            tip: "guidance_scale 控制生成结果与文本提示的匹配程度，值越大越忠于提示但可能降低多样性，推荐范围 5.0 到 10.0。",
            warning: "扩散模型的推理速度较慢，50 步采样在消费级 GPU 上通常需要数秒，实时应用场景可考虑 LCM（Latent Consistency Model）加速到 4-8 步。"
        },
        {
            title: "5. 评估指标（BLEU / CIDEr / SPICE）",
            body: `图像描述的质量评估是一个复杂问题，因为同一图像可以有多种同样正确的描述。BLEU 最初用于机器翻译，通过计算 n-gram 精确匹配度来评估生成文本，但它过于关注精确匹配，对同义替换不够鲁棒。CIDEr（Consensus-based Image Description Evaluation）是专门为图像描述设计的指标，它使用 TF-IDF 加权的 n-gram 匹配，并且考虑了多个人工标注之间的一致性作为归一化基准，这使得它能够更好地评估描述是否抓住了图像的共识性内容。SPICE 则更进一步，它将描述解析为场景图（Scene Graph），比较主语、谓语和宾语等语义元素，对语义相似但措辞不同的描述更加宽容。实际研究中通常同时报告多个指标以获得全面的评估视角。`,
            code: [
                {
                    lang: "python",
                    code: `# 计算 BLEU 和 CIDEr 分数
from pycocoevalcap.bleu.bleu import Bleu
from pycocoevalcap.cider.cider import Cider
from pycocoevalcap.tokenizer.ptbtokenizer import PTBTokenizer

# 准备数据格式
gts = {"img1": [{"caption": "a dog playing in the snow"}]}
res = {"img1": [{"caption": "a dog is playing in white snow"}]}

# Tokenize
tokenizer = PTBTokenizer()
gts = tokenizer.tokenize(gts)
res = tokenizer.tokenize(res)

# BLEU
bleu_scorer = Bleu(4)
bleu, _ = bleu_scorer.compute_score(gts, res)
for i, score in enumerate(bleu, 1):
    print(f"BLEU-{i}: {score:.4f}")

# CIDEr
cider_scorer = Cider()
cider, _ = cider_scorer.compute_score(gts, res)
print(f"CIDEr: {cider:.4f}")`
                },
                {
                    lang: "python",
                    code: `# 使用 SPICE 进行语义级评估
from pycocoevalcap.spice.spice import Spice

# SPICE 需要 Java 环境
spice_scorer = Spice()
score, _ = spice_scorer.compute_score(gts, res)
print(f"SPICE: {score:.4f}")

# CLIPScore: 基于 CLIP 的无参考评估
import clip
from PIL import Image
import torch.nn.functional as F

model, preprocess = clip.load("ViT-B/32")
image = preprocess(Image.open("photo.jpg")).unsqueeze(0)
text = clip.tokenize(["a dog playing in the snow"])

with torch.no_grad():
    img_feat = model.encode_image(image)
    txt_feat = model.encode_text(text)
    score = F.cosine_similarity(img_feat, txt_feat)
    print(f"CLIPScore: {score.item():.4f}")`
                }
            ],
            table: {
                headers: ["指标", "评估维度", "取值范围", "对同义词敏感度"],
                rows: [
                    ["BLEU-4", "n-gram 精确匹配", "0-100", "低"],
                    ["METEOR", "带同义词的 n-gram", "0-1", "中"],
                    ["CIDEr", "TF-IDF 加权 n-gram", "0-100+", "中"],
                    ["SPICE", "场景图语义匹配", "0-1", "高"],
                ]
            },
            mermaid: `graph LR
    A[生成描述] --> B{n-gram 重叠?}
    B -->|BLEU| C[精确匹配计数]
    B -->|CIDEr| D[TF-IDF 加权匹配]
    A --> E{语义结构匹配?}
    E -->|SPICE| F[场景图解析]
    A --> G{多模态对齐?}
    G -->|CLIPScore| H[CLIP 余弦相似度]
    C --> I[综合评分]
    D --> I
    F --> I
    H --> I`,
            tip: "CIDEr 是目前图像描述领域最常用的主指标，优化 CIDEr 通常也能改善其他指标。",
            warning: "BLEU 对词汇变化非常敏感，即使生成描述与参考描述语义完全相同，只要用词不同也会得到很低的分数。"
        },
        {
            title: "6. 可控图像生成",
            body: `可控生成是文本到图像生成的进阶方向，目标是让模型不仅理解文本提示，还能精确控制生成图像的多个属性，如风格、构图、颜色、空间布局等。ControlNet 通过在预训练扩散模型中注入可训练的条件分支，实现了在不破坏原始模型能力的情况下添加额外的控制信号。这些控制信号可以是边缘图（Canny）、深度图、人体姿态关键点（OpenPose）或分割掩码等。Adapter 方法则更加轻量，它在模型的各个层之间插入小型适配模块，通过微调这些适配模块来实现条件控制，而不需要修改原始模型的权重。Prompt 工程也是可控生成的重要手段，通过精心设计文本提示词，可以引导模型生成特定风格、构图和内容的图像。负面提示词（Negative Prompt）则允许用户明确指定不希望在生成结果中出现的内容。`,
            code: [
                {
                    lang: "python",
                    code: `# 使用 ControlNet 进行姿态控制生成
from diffusers import (
    StableDiffusionControlNetPipeline,
    ControlNetModel,
    UniPCMultistepScheduler,
)
from controlnet_aux import OpenposeDetector
from PIL import Image
import torch

# 加载 ControlNet
controlnet = ControlNetModel.from_pretrained(
    "lllyasviel/control_v11p_sd15_openpose",
    torch_dtype=torch.float16,
)
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    controlnet=controlnet,
    torch_dtype=torch.float16,
)
pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config)
pipe = pipe.to("cuda")

# 提取姿态并生成图像
pose_detector = OpenposeDetector.from_pretrained("lllyasviel/ControlNet")
input_image = Image.open("person.jpg")
pose = pose_detector(input_image)
image = pipe(
    "a beautiful portrait, 4k quality",
    image=pose,
    num_inference_steps=20,
).images[0]`
                },
                {
                    lang: "python",
                    code: `# 提示词工程：构建高质量提示
class PromptBuilder:
    def __init__(self):
        self.quality_terms = [
            "masterpiece", "best quality", "highres", "detailed"
        ]
        self.style_terms = {
            "photo": "photorealistic, natural lighting, 85mm lens",
            "anime": "anime style, cel shading, vibrant colors",
            "painting": "oil painting, impressionist style, canvas texture",
        }
        self.negative_default = (
            "worst quality, low quality, blurry, deformed, "
            "bad anatomy, extra limbs, watermark"
        )

    def build(self, subject, style="photo"):
        parts = self.quality_terms.copy()
        parts.append(self.style_terms.get(style, ""))
        parts.append(subject)
        return ", ".join(parts), self.negative_default

builder = PromptBuilder()
pos, neg = builder.build("a cat sitting on a windowsill", "photo")
print(f"Positive: {pos}")
print(f"Negative: {neg}")`
                }
            ],
            table: {
                headers: ["控制方法", "控制信号", "训练开销", "控制精度"],
                rows: [
                    ["ControlNet", "边缘/深度/姿态", "中等", "高"],
                    ["T2I-Adapter", "边缘/深度/草图", "低", "中高"],
                    ["IP-Adapter", "参考图像", "低", "中"],
                    ["Regional Prompt", "文本区域分割", "无训练", "中"],
                ]
            },
            mermaid: `graph TD
    A[基础扩散模型] --> B[冻结权重]
    C[条件输入] --> D[ControlNet 副本]
    B --> E[UNet 零卷积连接]
    D --> E
    A --> F[生成能力保留]
    E --> G[条件控制生成]
    C -.可以是.-. H[边缘图 Canny]
    C -.可以是.-. I[深度图 Depth]
    C -.可以是.-. J[姿态 OpenPose]
    C -.可以是.-. K[分割 Segmentation]`,
            tip: "使用 ControlNet 时，建议先将 guidance_scale 设为 7.0 左右，controlnet_conditioning_scale 设为 1.0，然后根据效果微调。",
            warning: "ControlNet 的模型版本需要与基础扩散模型版本匹配，混用不同版本（如 SD 1.5 的 ControlNet 与 SDXL 的基础模型）会导致结果异常。"
        },
        {
            title: "7. Transformers + Diffusers 实战",
            body: `Hugging Face 的 **Transformer**s 和 Diffusers 库为多模态模型提供了统一的接口和丰富的预训练模型。**Transformer**s 库包含了 CLIP、BLIP、Flamingo 等视觉语言模型的实现，而 Diffusers 库则提供了 Stable Diffusion、ControlNet、IP-Adapter 等生成模型的推理和训练接口。两个库共享相同的模型配置和权重管理方式，使得构建端到端的多模态流水线变得非常便捷。BLIP-2 是一个代表性的视觉语言模型，它通过 Q-Former 模块在冻结的图像编码器和语言模型之间建立桥梁，仅训练少量参数即可实现零样本的图像理解和生成能力。在实际工程中，合理使用梯度检查点（Gradient Checkpointing）、混合精度训练（Mixed Precision）和 LoRA 等优化技术，可以在有限的计算资源下训练高质量的多模态模型。`,
            code: [
                {
                    lang: "python",
                    code: `# 使用 BLIP-2 进行零样本图像描述
from transformers import Blip2Processor, Blip2ForConditionalGeneration
from PIL import Image
import torch

processor = Blip2Processor.from_pretrained("Salesforce/blip2-opt-2.7b")
model = Blip2ForConditionalGeneration.from_pretrained(
    "Salesforce/blip2-opt-2.7b",
    torch_dtype=torch.float16,
    device_map="auto",
)

image = Image.open("scene.jpg")
inputs = processor(images=image, return_tensors="pt").to("cuda", torch.float16)
generated_ids = model.generate(**inputs, max_new_tokens=50)
caption = processor.batch_decode(generated_ids, skip_special_tokens=True)
print(f"Generated: {caption[0].strip()}")

# 带提示的问题生成
question = "What color is the sky?"
inputs_qa = processor(
    images=image, text=question, return_tensors="pt"
).to("cuda", torch.float16)
out = model.generate(**inputs_qa, max_new_tokens=20)
answer = processor.batch_decode(out, skip_special_tokens=True)
print(f"Q: {question}  A: {answer[0].strip()}")`
                },
                {
                    lang: "python",
                    code: `# 使用 LoRA 微调 Stable Diffusion
from diffusers import StableDiffusionPipeline, UNet2DConditionModel
from peft import LoraConfig, get_peft_model

# 加载基础模型
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5"
)
unet = pipe.unet

# 配置 LoRA
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["to_q", "to_k", "to_v", "to_out.0"],
    lora_dropout=0.1,
    bias="none",
)
lora_unet = get_peft_model(unet, lora_config)
lora_unet.print_trainable_parameters()
# trainable params: 8,838,144 || all params: 859,520,964
# trainable%: 1.03%

# 训练循环中使用梯度检查点节省显存
unet.enable_gradient_checkpointing()
pipe.enable_xformers_memory_efficient_attention()

# 保存 LoRA 权重
lora_unet.save_pretrained("lora-sd-v1", safe_serialization=True)`
                }
            ],
            table: {
                headers: ["技术", "显存节省", "速度影响", "适用场景"],
                rows: [
                    ["梯度检查点", "40-60%", "慢 20%", "大模型训练"],
                    ["混合精度 (FP16)", "50%", "快 1.5-3x", "推理/训练"],
                    ["LoRA", "仅 1-5% 可训练", "无影响", "高效微调"],
                    ["xFormers 注意力", "30%", "快 1.3x", "长序列训练"],
                ]
            },
            mermaid: `graph TD
    A[输入图像] --> B[CLIP Vision Encoder]
    C[文本提示] --> D[CLIP Text Encoder]
    B --> E[Q-Former]
    D --> E
    E --> F[视觉-语言对齐表示]
    F --> G[OPT / LLM Decoder]
    G --> H[图像描述 / 视觉问答]
    I[训练目标: Captioning / VQA] --> G`,
            tip: "微调时优先尝试 LoRA，它只需要训练原始模型 1-5% 的参数，效果接近全参数微调且显存开销大幅降低。",
            warning: "BLIP-2 的 opt-2.7b 版本需要约 6GB 显存进行推理（FP16），opt-6.7b 版本需要约 14GB，请根据硬件条件选择合适大小的模型。"
        },
    ],
};
