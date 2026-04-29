import { Article } from '../knowledge';

export const article: Article = {
    id: "mm-001",
    title: "CLIP：视觉-语言预训练",
    category: "multimodal",
    tags: ["CLIP", "多模态", "对比学习"],
    summary: "从对比学习到零样本分类，理解 CLIP 如何连接视觉与语言",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
      {
        title: "1. 多模态学习的动机",
        body: `传统深度学习模型通常在单一模态上训练，图像分类模型只能理解像素，语言模型只能处理文本。然而人类认知天然就是多模态的，我们看图时会自然联想到文字描述，读文字时脑中会浮现画面。多模态学习的核心动机就是打破模态壁垒，让模型在跨模态数据上学习统一的表征空间。

CLIP（Contrastive Language-Image Pre-training）是 OpenAI 在 2021 年提出的里程碑式工作。其核心思想极其简洁：用四亿张互联网图文对训练一个双塔模型，让匹配的图像和文本在嵌入空间中靠近，不匹配的远离。这种看似简单的设计却带来了惊人的零样本迁移能力，无需标注数据即可在 ImageNet 上达到与 ResNet-50 相当的性能。

多模态学习的关键挑战在于模态鸿沟（Modality Gap）。视觉信号的局部性、平移不变性与文本信号的离散性、组合性差异巨大。CLIP 的成功证明了对比学习是跨越这道鸿沟的有效路径。

通过大规模弱监督数据（网络图文对）和简单的对比目标，CLIP 展示了数据规模和训练策略的重要性甚至超过了模型架构的精心设计。这一发现深刻影响了后续的多模态研究路线。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn.functional as F

def compute_modality_gap(image_emb: torch.Tensor, text_emb: torch.Tensor) -> float:
    """计算视觉与语言嵌入空间的模态鸿沟
    通过两个模态嵌入的平均向量之间的欧氏距离来量化
    """
    image_mean = image_emb.mean(dim=0)  # [D]
    text_mean = text_emb.mean(dim=0)    # [D]
    gap = torch.norm(image_mean - text_mean, p=2).item()
    return gap

# 加载 CLIP 模型
import clip
model, preprocess = clip.load("ViT-B/32", device="cpu")
print(f"Image encoder: {model.visual}")
print(f"Text encoder: {model.transformer}")`
          },
          {
            lang: "python",
            code: `# 多模态融合的不同范式对比
multimodal_approaches = {
    "Early Fusion": "在输入层拼接多模态特征，如将图像 patch 与 text token 拼接后输入 Transformer",
    "Late Fusion": "各模态独立编码后在决策层融合，如 CLIP 的双塔架构",
    "Intermediate Fusion": "在中间层进行跨模态注意力交互，如 Flamingo、BLIP",
    "Shared Encoder": "共享编码器处理多模态输入，如 ImageBind"
}

for name, desc in multimodal_approaches.items():
    print(f"{name}: {desc}")

# CLIP 选择 Late Fusion 的核心原因：
# 1. 训练效率高，两个编码器可以独立扩展
# 2. 推理灵活，可以分别缓存图像/文本特征
# 3. 零样本能力强，文本端保持开放词汇`
          }
        ],
        table: {
          headers: ["方法", "训练数据量", "监督方式", "零样本能力", "代表模型"],
          rows: [
            ["ImageNet 监督", "1400 万", "全标注", "无", "ResNet"],
            ["Vision Transformer", "3 亿 (JFT-300M)", "全标注", "无", "ViT"],
            ["CLIP", "4 亿", "对比学习", "强", "CLIP ViT-B/32"],
            ["ALIGN", "18 亿", "对比学习", "强", "ALIGN"],
            ["DataComp", "128 亿", "对比学习", "极强", "DataComp-L"]
          ]
        },
        mermaid: `graph LR
    A["互联网图文对"] --> B["图像编码器"]
    A --> C["文本编码器"]
    B --> D["图像特征"]
    C --> E["文本特征"]
    D --> F["对比损失
InfoNCE"]
    E --> F
    F --> G["统一表征空间"]`,
        tip: "理解 CLIP 的关键在于把握其设计哲学：简单架构 + 海量数据 > 复杂架构 + 有限数据",
        warning: "多模态融合不是万能的，早期融合方法在多模态数据缺失时鲁棒性差"
      },
      {
        title: "2. CLIP 架构：双塔设计",
        body: `CLIP 采用经典的双塔架构（Dual-Tower Architecture），包含一个图像编码器和一个文本编码器。两个编码器相互独立，仅在对比损失计算时产生交互。

图像编码器支持两种选择：ResNet 和 Vision Transformer。ResNet 版本在最终池化层后接线性投影层，将特征映射到统一的嵌入维度。ViT 版本则直接取 [CLS] token 的输出经过层归一化和线性投影。实验表明 ViT 在更大规模训练下表现更优，尤其是 ViT-L/14 在 4 亿数据上训练后达到了 76.6% 的 ImageNet 零样本准确率。

文本编码器基于带掩码的 Transformer 解码器架构（与 GPT-2 类似），词表大小约 49152，采用 BPE 分词。文本输入被截断到 76 个 token，足够覆盖大多数描述性文本。

两个编码器的输出都被归一化为单位向量，然后通过余弦相似度计算匹配度。这种设计使得模型学习的是方向而非幅度，训练更加稳定。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class CLIPEncoder(nn.Module):
    """CLIP 双塔架构的简化实现"""

    def __init__(self, embed_dim=512):
        super().__init__()
        # 图像塔: ResNet-50 骨干 + 投影头
        self.image_encoder = ResNetEncoder(out_channels=2048)
        self.image_projection = nn.Linear(2048, embed_dim, bias=False)

        # 文本塔: Transformer 编码器 + 投影头
        self.text_encoder = TextTransformer(
            vocab_size=49408, context_length=76,
            embed_dim=512, heads=8, layers=12
        )
        self.text_projection = nn.Linear(512, embed_dim, bias=False)

    def forward(self, images, texts):
        image_features = self.encode_image(images)
        text_features = self.encode_text(texts)
        return image_features, text_features

    def encode_image(self, x):
        x = self.image_encoder(x)           # [B, 2048]
        x = self.image_projection(x)        # [B, embed_dim]
        return F.normalize(x, dim=-1)       # 单位向量

    def encode_text(self, x):
        x = self.text_encoder(x)            # [B, 512]
        x = self.text_projection(x)         # [B, embed_dim]
        return F.normalize(x, dim=-1)       # 单位向量`
          },
          {
            lang: "python",
            code: `# CLIP 图像编码器的两种选择对比
import torch.nn as nn

# 方案一: ResNet 编码器
def build_resnet_encoder(arch="resnet50"):
    """ResNet 编码器: 修改全局平均池化后的输出"""
    import torchvision.models as models
    model = getattr(models, arch)(weights=None)
    # 移除原始分类头
    model.fc = nn.Identity()
    # 特征维度: ResNet-50 -> 2048, ResNet-101 -> 2048
    return model

# 方案二: Vision Transformer 编码器
def build_vit_encoder(patch_size=32, embed_dim=768):
    """ViT 编码器: 将图像分割为 patch 序列
    patch_size=32: 每张图片分割为 (224/32)^2 = 49 个 patch
    patch_size=16: 每张图片分割为 (224/16)^2 = 196 个 patch
    """
    return VisionTransformer(
        image_size=224, patch_size=patch_size,
        embed_dim=embed_dim, depth=12, num_heads=12
    )

# 训练规模与性能关系:
# ViT-B/32 (86M参数)  -> 63.2% zero-shot
# ViT-B/16 (151M参数) -> 67.1% zero-shot
# ViT-L/14 (307M参数) -> 75.5% zero-shot
# ViT-H/14 (632M参数) -> 78.0% zero-shot`
          }
        ],
        table: {
          headers: ["组件", "ResNet 版本", "ViT 版本"],
          rows: [
            ["骨干网络", "ResNet-50/101", "ViT-B/16/L/14"],
            ["参数规模", "77M (RN50)", "86M-632M"],
            ["输入分辨率", "224x224", "224x224"],
            ["特征维度", "1024 (RN50)", "512-1024"],
            ["空间信息保留", "池化后丢失", "保留 patch 序列"],
            ["扩展性", "有限", "更好"],
            ["零样本精度", "59.9% (RN50)", "75.5% (ViT-L/14)"]
          ]
        },
        mermaid: `graph TD
    A["输入图像
224x224x3"] --> B["图像编码器"]
    B --> C["ResNet 或 ViT"]
    C --> D["特征向量
embed_dim"]
    D --> E["L2 归一化"]
    E --> F["图像特征"]

    G["输入文本
<76 tokens"] --> H["文本编码器"]
    H --> I["Transformer"]
    I --> J["[EOS] token 输出"]
    J --> K["线性投影"]
    K --> L["L2 归一化"]
    L --> M["文本特征"]

    F --> N["余弦相似度"]
    M --> N`,
        tip: "ViT 版本在大规模训练下优于 ResNet，但计算成本更高，选择时需权衡",
        warning: "文本编码器限制 76 个 token，长文本会被截断，影响复杂描述的理解"
      },
      {
        title: "3. 对比学习目标：InfoNCE 损失",
        body: `CLIP 训练的核心是对比学习目标，具体采用了 InfoNCE（Info Noise Contrastive Estimation）损失函数。这个损失函数的直觉非常直接：对于一个 batch 中的 N 对图文，正确的 N 对应该获得高相似度，而错误的 N^2-N 对应该获得低相似度。

具体来说，给定 batch 中的图像特征 I_1,...,I_N 和文本特征 T_1,...,T_N（都已 L2 归一化），首先计算相似度矩阵 S，其中 S_ij = I_i · T_j / tau。这里 tau 是可学习的温度参数，控制相似度分布的尖锐程度。

损失函数是对称的：既计算图像到文本的交叉熵损失，也计算文本到图像的交叉熵损失，然后取平均。这种双向对比确保了两个模态在嵌入空间中的双向对齐。

温度参数 tau 的训练至关重要。tau 过小导致分布过于尖锐，梯度消失；tau 过大使分布过于平坦，区分度不足。CLIP 中将 tau 初始化为 0.07（与 SimCLR 一致），并在训练中学习更新。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class InfoNCELoss(nn.Module):
    """CLIP 的对比损失实现"""

    def __init__(self, temperature=0.07):
        super().__init__()
        self.logit_scale = nn.Parameter(torch.ones([]) * torch.log(torch.tensor(1.0 / temperature)))

    def forward(self, image_features, text_features):
        """计算对称的 InfoNCE 损失
        image_features: [batch_size, embed_dim] - L2 归一化
        text_features:  [batch_size, embed_dim] - L2 归一化
        """
        # 计算相似度矩阵
        logit_scale = self.logit_scale.exp()
        logits_per_image = logit_scale * image_features @ text_features.t()  # [N, N]
        logits_per_text = logits_per_image.t()                               # [N, N]

        # 标签: 对角线为正样本
        batch_size = image_features.size(0)
        labels = torch.arange(batch_size, device=image_features.device)

        # 双向交叉熵损失
        loss_i = F.cross_entropy(logits_per_image, labels)
        loss_t = F.cross_entropy(logits_per_text, labels)
        loss = (loss_i + loss_t) / 2

        return loss

    def get_temperature(self):
        return self.logit_scale.exp().item()`
          },
          {
            lang: "python",
            code: `# 深入理解温度参数的作用
import torch
import matplotlib.pyplot as plt
import numpy as np

def show_temperature_effect():
    """可视化温度参数对相似度分布的影响"""
    sim = torch.linspace(-1, 1, 100)
    temperatures = [0.01, 0.07, 0.5, 1.0]

    for tau in temperatures:
        scaled = sim / tau
        prob = F.softmax(scaled, dim=0)
        plt.plot(sim.numpy(), prob.numpy(), label=f"tau={tau}")

    plt.xlabel("余弦相似度")
    plt.ylabel("softmax 概率")
    plt.title("温度参数对分布的影响")
    plt.legend()
    plt.show()

# 关键洞察:
# tau = 0.01: 分布极尖锐，只有最高相似度获得显著概率
# tau = 0.07: CLIP 默认值，平衡了区分度和梯度流
# tau = 0.5:  分布较平缓，难样本也能获得一定梯度
# tau = 1.0:  近似均匀分布，几乎无法学习

# Batch size 的影响:
# 更大的 batch 提供更多的负样本（N^2 - N 对），
# 但也会增加内存需求。CLIP 训练使用 batch_size=32768。`
          }
        ],
        table: {
          headers: ["Batch Size", "负样本数 (每对)", "内存需求", "训练稳定性", "CLIP 是否使用"],
          rows: [
            ["256", "255", "低", "一般", "否"],
            ["4096", "4095", "中", "较好", "否"],
            ["16384", "16383", "高", "好", "否"],
            ["32768", "32767", "很高", "最好", "是 (原始)"],
            ["65536", "65535", "极高", "最好但边际收益递减", "DataComp 使用"]
          ]
        },
        mermaid: `graph LR
    A["Image Features
[N, D]"] --> B["相似度矩阵
S = I·T^T / tau"]
    C["Text Features
[N, D]"] --> B
    B --> D["logits_per_image
[N, N]"]
    B --> E["logits_per_text
[N, N]"]
    D --> F["CrossEntropy
labels=diag"]
    E --> F
    F --> G["InfoNCE Loss"]
    F --> H["反向传播"]
    H --> A
    H --> C`,
        tip: "增大 batch size 是提升 CLIP 性能最有效的方法之一，因为更多的负样本使对比学习更有效",
        warning: "温度参数 tau 过小会导致数值不稳定，训练初期建议监控梯度范数"
      },
      {
        title: "4. 零样本分类机制",
        body: `CLIP 最引人入胜的能力是零样本分类：在训练期间从未见过目标类别的情况下，直接对图像进行分类。这是通过一种巧妙的提示工程（Prompt Engineering）实现的。

传统的图像分类需要一个固定的类别集合和对应的标注头。CLIP 将分类任务重新表述为文本-图像匹配问题：给定一张图像和一组类别名称，将每个类别名称格式化为文本提示（如 "a photo of a dog"），然后计算图像与每个提示的相似度，选择最相似的类别。

这种方法的核心优势在于开放词汇（Open-Vocabulary）能力。分类器不再受限于预定义的类别集合，任何可以用文本描述的类别都可以使用。这意味着 CLIP 可以即时适应新的分类任务，无需微调。

零样本分类的性能取决于多个因素：提示模板的质量、目标类别在训练数据中的覆盖程度、以及图像内容与训练数据分布的一致性。研究表明，使用多个提示模板并集成结果（Ensemble Prompting）可以显著提升零样本准确率。`,
        code: [
          {
            lang: "python",
            code: `import torch
import clip

def zero_shot_classification(model, preprocess, image, class_names):
    """使用 CLIP 进行零样本图像分类
    image: PIL Image 或 tensor
    class_names: 类别名称列表
    """
    device = next(model.parameters()).device

    # 1. 构建提示模板
    prompts = [f"a photo of a {c}" for c in class_names]

    # 2. 文本编码
    text_tokens = clip.tokenize(prompts).to(device)
    with torch.no_grad():
        text_features = model.encode_text(text_tokens)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)

    # 3. 图像编码
    image_input = preprocess(image).unsqueeze(0).to(device)
    with torch.no_grad():
        image_features = model.encode_image(image_input)
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)

    # 4. 计算相似度并预测
    similarity = (100.0 * image_features @ text_features.t()).softmax(dim=-1)
    top_k = 5
    probs, indices = similarity[0].topk(top_k)

    for prob, idx in zip(probs, indices):
        print(f"  {class_names[idx]:>16s}: {prob:.2f}%")

    return class_names[indices[0]]`
          },
          {
            lang: "python",
            code: `# 集成提示工程（Ensemble Prompting）提升零样本性能
def ensemble_prompt_classification(model, preprocess, image, class_names):
    """使用多个提示模板集成，显著提升零样本准确率"""

    prompt_templates = [
        "a bad photo of a {}.",
        "a photo of many {}.",
        "a sculpture of a {}.",
        "a photo of the hard to see {}.",
        "a low resolution photo of the {}.",
        "a rendering of a {}.",
        "a cropped photo of the {}.",
        "a close-up photo of a {}.",
        "a black and white photo of a {}.",
        "a clean photo of a {}.",
        "a good photo of a {}.",
    ]

    device = next(model.parameters()).device

    # 构建所有提示
    prompts = [t.format(c) for c in class_names for t in prompt_templates]
    text_tokens = clip.tokenize(prompts).to(device)

    with torch.no_grad():
        text_features = model.encode_text(text_tokens)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)

    # reshape 并平均
    text_features = text_features.view(len(class_names), len(prompt_templates), -1)
    text_features = text_features.mean(dim=0)  # [n_classes, embed_dim]
    text_features = text_features / text_features.norm(dim=-1, keepdim=True)

    # 图像编码
    image_input = preprocess(image).unsqueeze(0).to(device)
    with torch.no_grad():
        image_features = model.encode_image(image_input)
        image_features /= image_features.norm(dim=-1, keepdim=True)

    similarity = 100.0 * image_features @ text_features.t()
    return similarity.softmax(dim=-1)`
          }
        ],
        table: {
          headers: ["数据集", "ResNet-50 监督", "CLIP ViT-B/32 零样本", "CLIP ViT-L/14 零样本"],
          rows: [
            ["ImageNet", "76.1%", "63.2%", "75.5%"],
            ["CIFAR-100", "89.8%", "73.7%", "84.5%"],
            ["SUN397", "67.8%", "61.0%", "73.0%"],
            ["Caltech-101", "95.0%", "88.7%", "94.8%"],
            ["Food-101", "88.4%", "68.5%", "82.4%"],
            ["Stanford Cars", "90.5%", "66.2%", "84.6%"]
          ]
        },
        mermaid: `graph LR
    A["输入图像"] --> B["图像编码器"]
    B --> C["图像特征"]
    D["类别名称列表"] --> E["提示模板
a photo of a {class}"]
    E --> F["文本编码器"]
    F --> G["文本特征"]
    C --> H["余弦相似度"]
    G --> H
    H --> I["Softmax
概率分布"]
    I --> J["预测类别"]`,
        tip: "使用 Ensembled Prompting 可以带来 3-5% 的零样本准确率提升，几乎免费",
        warning: "零样本分类在细粒度分类任务（如 Stanford Cars）上表现较差，因为训练数据中的类别描述不够具体"
      },
      {
        title: "5. 数据集与训练细节",
        body: `CLIP 的训练数据是从互联网上收集的 4 亿张图文对。这些数据不是人工标注的，而是通过启发式方法从网络上抓取的自然配对的图像和文本（ALT 文本、标题、描述等）。这种弱监督方式的优势在于数据获取成本极低，可以扩展到远超人工标注的规模。

训练过程的关键设计包括：数据增强策略（仅对图像使用随机裁剪和水平翻转，避免过度增强破坏图文语义对应关系）、优化器配置（AdamW，学习率 warmup 后余弦衰减）、以及分布式训练架构。原始 CLIP 在 256 块 V100 GPU 上训练了约两周。

一个有趣的发现是 CLIP 的性能与训练数据量近似遵循幂律关系（Power Law）。这意味着增加数据量可以持续提升性能，即使在 4 亿规模下仍未饱和。后续的 ALIGN 和数据竞争项目 DataComp 都验证了这一规律。

训练中的噪声数据是一个重要挑战。互联网图文对中有大量不匹配的噪声，CLIP 通过大规模 batch 对比学习来缓解，因为即使有部分噪声对，正确的信号仍然主导梯度方向。研究表明大约 30% 的训练数据存在噪声。`,
        code: [
          {
            lang: "python",
            code: `# CLIP 训练数据流水线
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

class CLIPDataset(Dataset):
    """CLIP 训练数据集: (image, text) 对"""

    def __init__(self, data_path, tokenizer, transform):
        self.samples = load_web_dataset(data_path)  # [(img_path, text), ...]
        self.tokenizer = tokenizer
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, text = self.samples[idx]

        # 图像预处理: 仅随机裁剪和翻转
        # 注意: 不使用颜色抖动等破坏性增强
        image = load_image(img_path)
        image = self.transform(image)

        # 文本编码
        tokens = self.tokenizer(text, context_length=76)

        return image, tokens

# CLIP 的数据增强策略 (极简)
clip_train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.9, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.48145466, 0.4578275, 0.40821073],
                         std=[0.26862954, 0.26130258, 0.27577711]),
])`
          },
          {
            lang: "python",
            code: `# 训练配置与优化器设置
import torch
import torch.nn as nn

def build_clip_optimizer(model, lr=5e-4, weight_decay=0.2, warmup_steps=2000):
    """CLIP 训练的优化器配置
    - 使用 AdamW，而非原始 Adam
    - 较大的 weight_decay 防止过拟合
    - Warmup 阶段稳定训练初期
    """
    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=lr,
        weight_decay=weight_decay,
        betas=(0.9, 0.98),
        eps=1e-6
    )

    # Cosine 衰减学习率调度
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=total_steps, eta_min=0
    )

    # Warmup 学习率
    warmup_scheduler = torch.optim.lr_scheduler.LambdaLR(
        optimizer, lr_lambda=lambda step: min(step / warmup_steps, 1.0)
    )

    return optimizer, scheduler, warmup_scheduler

# 原始 CLIP 训练超参数:
# epochs: 32
# batch_size: 32768 (256 GPU * 128 per GPU)
# lr: 1e-3 (with linear scaling)
# weight_decay: 0.2
# warmup: 2000 steps
# 总训练步数: ~380K
# 硬件: 256x V100 GPU`
          }
        ],
        table: {
          headers: ["项目", "CLIP (原始)", "ALIGN", "DataComp-L"],
          rows: [
            ["数据量", "4 亿", "18 亿", "128 亿"],
            ["数据来源", "网络爬取", "图像-ALT 文本", "CommonPool"],
            ["图像编码器", "ViT-B/32 ~ ViT-L/14", "EfficientNet-L2", "ViT-SO400M"],
            ["Batch Size", "32768", "65536", "131072"],
            ["GPU", "256x V100", "TPUv4 (未公开)", "A100 (未公开)"],
            ["ImageNet 零样本", "76.6% (ViT-L/14)", "83.9%", "89.7%"]
          ]
        },
        mermaid: `graph TD
    A["网络爬取
图文对"] --> B["数据清洗
启发式过滤"]
    B --> C["训练集
4 亿样本"]
    C --> D["DataLoader
batch_size=32768"]
    D --> E["AdamW 优化器
lr=1e-3"]
    E --> F["InfoNCE 损失"]
    F --> G["梯度更新"]
    G --> E
    E --> H["Cosine 衰减
+ Warmup"]
    H --> I["收敛模型
ViT-L/14 @ 32 epochs"]`,
        tip: "数据质量比数量更重要，后续研究通过数据过滤（如 Aesthetic Score、CLIPScore）用更少数据达到更好效果",
        warning: "互联网爬取数据包含大量有害和偏见内容，训练前需要进行伦理审核和安全过滤"
      },
      {
        title: "6. CLIP 的局限与偏差",
        body: `尽管 CLIP 展现了强大的零样本能力，但它并非完美。理解其局限性对于负责任地使用和后续改进都至关重要。

首先是数据集偏差问题。训练数据来自互联网，反映了网络内容的分布偏差。研究发现 CLIP 在某些类别上表现极好（如人物肖像、自然风景），而在其他类别上表现较差（如抽象图案、专业科学图像）。这种偏差直接影响了下游应用中的公平性。

其次是反事实推理能力不足。CLIP 可以识别图像中是否有狗，但很难判断图像的文本描述是否准确地描述了视觉内容中的细节关系。例如，对于 "红球在蓝球左边" 这样的空间关系描述，CLIP 的区分能力有限。

第三是提示敏感性。零样本分类的性能高度依赖提示模板的设计。虽然 Ensembled Prompting 可以缓解，但仍然无法完全消除这种依赖。对于训练数据中罕见的概念，模型可能无法正确理解相关的文本提示。

此外，CLIP 存在已知的社会偏差。在人脸属性分类任务中，CLIP 表现出与训练数据一致的性别和种族偏差。这在实际部署中可能导致不公平的结果，需要额外缓解措施。`,
        code: [
          {
            lang: "python",
            code: `# 分析 CLIP 的社会偏差
import torch
import clip
import matplotlib.pyplot as plt

def analyze_clip_bias(model, preprocess, test_images, professions, demographics):
    """检测 CLIP 在职业-人口统计关联中的偏差"""
    device = next(model.parameters()).device

    results = {}
    for prof in professions:
        for demo in demographics:
            prompt = clip.tokenize(f"a photo of a {demo} {prof}").to(device)
            with torch.no_grad():
                text_feat = model.encode_text(prompt)
                text_feat = text_feat / text_feat.norm(dim=-1, keepdim=True)

            img_feats = []
            for img in test_images:
                img_input = preprocess(img).unsqueeze(0).to(device)
                with torch.no_grad():
                    feat = model.encode_image(img_input)
                    feat = feat / feat.norm(dim=-1, keepdim=True)
                img_feats.append(feat)

            img_feats = torch.cat(img_feats, dim=0)
            sim = (img_feats @ text_feat.t()).mean().item()
            results[f"{demo}-{prof}"] = sim

    # 可视化偏差
    for prof in professions:
        values = [results[f"{d}-{prof}"] for d in demographics]
        plt.bar(demographics, values)
        plt.title(f"CLIP 对 '{prof}' 的偏差分析")
        plt.ylabel("平均相似度")
        plt.show()

# 已知偏差示例:
# CLIP 倾向于将 "doctor" 与男性关联
# 倾向于将 "nurse" 与女性关联
# 在某些种族分类上表现不均`
          },
          {
            lang: "python",
            code: `# 测试 CLIP 的反事实推理能力
import torch
import clip

def test_counterfactual_reasoning(model, preprocess):
    """测试 CLIP 对空间关系和否定的理解"""
    device = next(model.parameters()).device

    # 测试 1: 空间关系
    # 生成/加载包含红球和蓝球的图像
    spatial_tests = [
        ("red ball on left of blue ball", 0.0),  # 期望高相似度
        ("blue ball on left of red ball", 0.0),  # 期望低相似度
    ]

    # 测试 2: 否定理解
    negation_tests = [
        ("a photo without any dog", 0.0),
        ("a photo with a dog", 0.0),
    ]

    # 测试 3: 数量理解
    counting_tests = [
        ("a photo of one cat", 0.0),
        ("a photo of three cats", 0.0),
    ]

    # CLIP 在这些任务上的表现:
    # 空间关系: 准确率接近随机 (约 50%)
    # 否定理解: 经常失败，否定词影响微弱
    # 数量理解: 对 1 vs 2-3 有一定区分力，但对更大数字无效
    print("CLIP 反事实推理能力评估:")
    print("  空间关系: ~50% (随机水平)")
    print("  否定理解: ~55% (轻微优于随机)")
    print("  数量理解: 1 vs 多: ~65%, 2 vs 3: ~55%")
    print("  颜色+形状组合: ~75% (有一定能力)")`
          }
        ],
        table: {
          headers: ["偏差类型", "表现", "影响", "缓解方法"],
          rows: [
            ["数据分布偏差", "常见类别 >> 稀有类别", "分类不均", "数据平衡/过采样"],
            ["性别偏差", "职业-性别刻板印象", "公平性风险", "提示工程/后处理"],
            ["种族偏差", "不同群体识别率不均", "歧视风险", "多样化训练数据"],
            ["空间关系", "左右/上下混淆", "细粒度推理失败", "增加空间监督信号"],
            ["否定理解", "否定词影响微弱", "语义理解不完整", "对比否定样本"],
            ["文化偏差", "西方中心主义", "跨文化泛化差", "多语言/多文化数据"]
          ]
        },
        mermaid: `graph TD
    A["互联网训练数据"] --> B["数据偏差"]
    B --> C["性别/种族/文化偏差"]
    B --> D["类别覆盖不均"]
    A --> E["弱监督噪声"]
    E --> F["错误图文对"]
    E --> G["有害内容"]
    C --> H["不公平预测"]
    D --> I["零样本性能不均"]
    F --> J["概念学习不完整"]
    G --> K["安全风险"]
    H --> L["需要缓解措施"]
    I --> L
    J --> L
    K --> L`,
        tip: "在部署 CLIP 到生产环境之前，务必在目标域上进行偏差评估和校准",
        warning: "CLIP 不适合用于高风险决策场景（如招聘筛选、信用评估），其社会偏差可能导致歧视性结果"
      },
      {
        title: "7. transformers 库实战：CLIP 推理与图像检索",
        body: `Hugging Face transformers 库提供了开箱即用的 CLIP 实现，包含了预训练权重和便捷的推理接口。本节通过两个实战示例展示如何使用 CLIP 进行图像分类和图像检索。

图像检索是 CLIP 最具实用价值的场景之一。将图像库中的所有图像预先编码为向量并建立索引（如 FAISS），查询时将查询文本编码为向量后在索引中搜索最近邻，即可实现自然语言驱动的图像搜索。

CLIP 模型权重在 Hugging Face Hub 上公开可用，包括 ViT-B/32、ViT-B/16、ViT-L/14 等多种规格。对于大多数应用，ViT-B/32 是性价比最高的选择；需要更高精度时可以选择 ViT-L/14。

此外，基于 CLIP 的开源变体不断涌现，包括 OpenCLIP（更大规模训练）、Chinese-CLIP（中文支持）、SigLIP（改进的损失函数）等，可以根据具体需求选择。`,
        code: [
          {
            lang: "python",
            code: `from transformers import CLIPProcessor, CLIPModel
import torch
from PIL import Image

# 1. 加载预训练 CLIP 模型
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# 2. 零样本图像分类
def classify_image(model, processor, image, labels):
    """使用 CLIP 进行零样本分类"""
    # 构造提示
    texts = [f"a photo of a {label}" for label in labels]

    inputs = processor(
        text=texts,
        images=image,
        return_tensors="pt",
        padding=True
    )

    outputs = model(**inputs)
    logits_per_image = outputs.logits_per_image
    probs = logits_per_image.softmax(dim=1)

    for label, prob in zip(labels, probs[0]):
        print(f"  {label}: {prob.item():.2%}")

# 3. 使用
image = Image.open("test.jpg")
classify_image(model, processor, image, ["dog", "cat", "bird", "car", "tree"])`
          },
          {
            lang: "python",
            code: `from transformers import CLIPProcessor, CLIPModel
import torch
from PIL import Image
import faiss
import numpy as np

class CLIPIImageSearch:
    """基于 CLIP + FAISS 的图像检索系统"""

    def __init__(self, model_name="openai/clip-vit-base-patch32"):
        self.model = CLIPModel.from_pretrained(model_name)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)
        self.index = None
        self.image_ids = []

    def build_index(self, images: list, ids: list):
        """构建图像索引
        images: PIL Image 列表
        ids: 对应的图像标识符
        """
        all_features = []
        for img in images:
            inputs = self.processor(images=img, return_tensors="pt")
            with torch.no_grad():
                feat = self.model.get_image_features(**inputs)
                feat = feat / feat.norm(dim=-1, keepdim=True)
            all_features.append(feat.cpu().numpy())

        features = np.vstack(all_features).astype("float32")

        # 构建 FAISS 索引 (余弦相似度 = 内积 on unit vectors)
        dim = features.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(features)
        self.image_ids = ids
        print(f"索引构建完成: {len(ids)} 张图像, 维度 {dim}")

    def search(self, query_text: str, top_k: int = 5):
        """文本搜索图像"""
        inputs = self.processor(text=query_text, return_tensors="pt", padding=True)
        with torch.no_grad():
            text_feat = self.model.get_text_features(**inputs)
            text_feat = text_feat / text_feat.norm(dim=-1, keepdim=True)

        query_vec = text_feat.cpu().numpy().astype("float32")
        scores, indices = self.index.search(query_vec, top_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            results.append({"id": self.image_ids[idx], "score": float(score)})

        return results

# 使用示例:
# searcher = CLIPIImageSearch()
# searcher.build_index(images, image_ids)
# results = searcher.search("a cat sitting on a sofa", top_k=10)`
          }
        ],
        table: {
          headers: ["模型", "参数量", "维度", "ImageNet 零样本", "推荐场景"],
          rows: [
            ["ViT-B/32", "151M", "512", "63.2%", "通用/速度优先"],
            ["ViT-B/16", "151M", "512", "67.1%", "精度要求稍高"],
            ["ViT-L/14", "428M", "768", "75.5%", "高精度/检索"],
            ["ViT-H/14", "959M", "1024", "78.0%", "极致精度"],
            ["Chinese-CLIP-B/16", "~200M", "512", "中文优化", "中文应用"],
            ["OpenCLIP ViT-H/14", "~960M", "1024", "80.1%", "最大规模"]
          ]
        },
        mermaid: `graph LR
    A["查询文本"] --> B["CLIP 文本编码器"]
    B --> C["查询向量
[1, D]"]
    D["图像库"] --> E["CLIP 图像编码器"]
    E --> F["图像向量矩阵
[N, D]"]
    F --> G["FAISS 索引"]
    C --> H["最近邻搜索"]
    G --> H
    H --> I["Top-K 结果
(相似度分数 + 图像ID)"]
    I --> J["返回检索结果"]`,
        tip: "大规模图像检索时，先用 CLIP 做粗排，再用更精细的模型（如 BLIP-2）做精排，兼顾效率和精度",
        warning: "FAISS 索引在高维空间（D>512）中检索精度会下降，建议选择合适的模型维度"
      }
    ],
};
