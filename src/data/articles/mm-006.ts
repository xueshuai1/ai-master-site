import { Article } from '../knowledge';

export const article: Article = {
    id: "mm-006",
    title: "视频-语言多模态",
    category: "multimodal",
    tags: ["视频理解", "视频语言", "多模态"],
    summary: "从视频分类到视频问答，理解视频与语言的跨模态技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
        {
            title: "1. 视频表示学习：从 3D CNN 到 TimeSformer",
            body: `视频理解的第一步是将动态视觉信号压缩为有意义的向量表示。与单张图像不同，视频包含时间维度上的丰富信息，如运动模式、物体交互和因果关系。早期的视频表示学习方法直接借鉴了图像领域的卷积架构，将 2D 卷积扩展为 3D 卷积以同时捕获空间和时间特征。

3D CNN（如 C3D、I3D）是最成功的视频编码器之一。I3D 通过在 Kinetics 数据集上预训练，将 ImageNet 上的 Inception-v1 权重 inflate 到 3D 卷积核。这种方法利用了图像预训练的知识，同时学习了时间动态特征。然而，3D CNN 的计算复杂度随时间深度呈线性增长，处理长视频时显存消耗巨大。

TimeSformer 代表了另一种范式：它将 Transformer 的自注意力机制直接应用到视频上。关键创新在于分离的空间-时间注意力（Divided Space-Time Attention）：先对每个位置进行空间自注意力，再沿时间轴进行时间自注意力。这种分解将计算复杂度从 O(T*H*W)^2 降低到 O(T^2 + (H*W)^2)，使得处理更长的视频序列成为可能。实验表明，TimeSformer 在多个基准上超过了 3D CNN，同时参数量减少了约 30%。

视频表示学习的另一个重要方向是动作识别。给定一段视频，模型需要判断其中发生了哪种动作。这需要模型理解物体的运动轨迹、物体间的交互关系以及动作的时序结构。现代方法通常结合全局视频表示和局部时空片段表示，以获得更细粒度的理解。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from einops import rearrange

class I3DFeatureExtractor(nn.Module):
    """3D CNN 视频特征提取器 (基于 I3D 架构)
    核心思想: 将 2D 卷积核沿时间维度复制并归一化
    实现 "inflate" 操作
    """

    def __init__(self, num_classes: int = 400, pretrained: bool = True):
        super().__init__()
        # 第一层: (T, H, W) 输入 -> 时间维度处理
        self.conv1 = nn.Conv3d(3, 64, kernel_size=(7, 7, 7),
                               stride=(2, 2, 2), padding=(3, 3, 3))
        self.pool1 = nn.MaxPool3d(kernel_size=(1, 3, 3), stride=(1, 2, 2),
                                  padding=(0, 1, 1))

        # 混合卷积层 (空间 + 时间)
        self.mixed3a = self._make_mixed_block(64, 192)
        self.mixed3b = self._make_mixed_block(192, 480)
        self.mixed4a = self._make_mixed_block(480, 508)
        self.mixed4b = self._make_mixed_block(508, 832)
        self.mixed4c = self._make_mixed_block(832, 832)
        self.mixed4d = self._make_mixed_block(832, 800)
        self.mixed4e = self._make_mixed_block(800, 800)
        self.mixed5a = self._make_mixed_block(800, 1024)
        self.mixed5b = self._make_mixed_block(1024, 1024)

        # 全局平均池化 + 分类头
        self.avg_pool = nn.AdaptiveAvgPool3d((1, 1, 1))
        self.dropout = nn.Dropout(0.5)
        self.fc = nn.Linear(1024, num_classes)

    def _make_mixed_block(self, in_ch: int, out_ch: int) -> nn.Module:
        """Inception 模块 (3D 版本)"""
        return nn.Sequential(
            nn.Conv3d(in_ch, out_ch, kernel_size=(1, 1, 1), padding=(0, 0, 0)),
            nn.BatchNorm3d(out_ch),
            nn.ReLU(inplace=True)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """输入: [B, 3, T, H, W], 输出: [B, num_classes]"""
        x = self.conv1(x)
        x = torch.relu(x)
        x = self.pool1(x)
        x = self.mixed3a(x)
        x = self.mixed3b(x)
        x = self.mixed4e(x)
        x = self.mixed5b(x)
        x = self.avg_pool(x)  # [B, 1024, 1, 1, 1]
        x = x.view(x.size(0), -1)  # [B, 1024]
        x = self.dropout(x)
        return self.fc(x)`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from einops import rearrange, repeat

class DividedSpaceTimeAttention(nn.Module):
    """分离空间-时间注意力 (TimeSformer 核心)
    将自注意力分解为两步:
    1. 空间自注意力: 同一帧内所有 patch 之间的交互
    2. 时间自注意力: 同一位置跨帧之间的交互
    """

    def __init__(self, dim: int, num_heads: int = 8, num_frames: int = 8,
                 num_patches: int = 196, qkv_bias: bool = True):
        super().__init__()
        self.num_heads = num_heads
        self.num_frames = num_frames
        self.num_patches = num_patches
        head_dim = dim // num_heads
        self.scale = head_dim ** -0.5

        # 空间注意力的 Q/K/V
        self.q_spatial = nn.Linear(dim, dim, bias=qkv_bias)
        self.k_spatial = nn.Linear(dim, dim, bias=qkv_bias)
        self.v_spatial = nn.Linear(dim, dim, bias=qkv_bias)

        # 时间注意力的 Q/K/V
        self.q_temporal = nn.Linear(dim, dim, bias=qkv_bias)
        self.k_temporal = nn.Linear(dim, dim, bias=qkv_bias)
        self.v_temporal = nn.Linear(dim, dim, bias=qkv_bias)

        self.proj = nn.Linear(dim, dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """x: [B, T*N, D] 其中 T=帧数, N=patch数, D=维度"""
        B, TN, D = x.shape
        T, N = self.num_frames, self.num_patches
        # 重塑为 [B, T, N, D]
        x = x.reshape(B, T, N, D)

        # 第一步: 空间自注意力 (逐帧独立)
        x = rearrange(x, 'b t n d -> (b t) n d')
        q_s = self.q_spatial(x)
        k_s = self.k_spatial(x)
        v_s = self.v_spatial(x)
        q_s = rearrange(q_s, 'bt n (h d) -> bt h n d', h=self.num_heads)
        k_s = rearrange(k_s, 'bt n (h d) -> bt h d n', h=self.num_heads)
        v_s = rearrange(v_s, 'bt n (h d) -> bt h n d', h=self.num_heads)
        attn_spatial = (q_s @ k_s) * self.scale
        attn_spatial = attn_spatial.softmax(dim=-1)
        x = (attn_spatial @ v_s)
        x = rearrange(x, '(bt) h n d -> bt n (h d)', h=self.num_heads)
        x = rearrange(x, '(b t) n d -> b t n d', t=T)

        # 第二步: 时间自注意力 (逐位置跨帧)
        x = rearrange(x, 'b t n d -> (b n) t d')
        q_t = self.q_temporal(x)
        k_t = self.k_temporal(x)
        v_t = self.v_temporal(x)
        q_t = rearrange(q_t, 'bn t (h d) -> bn h t d', h=self.num_heads)
        k_t = rearrange(k_t, 'bn t (h d) -> bn h d t', h=self.num_heads)
        v_t = rearrange(v_t, 'bn t (h d) -> bn h t d', h=self.num_heads)
        attn_temporal = (q_t @ k_t) * self.scale
        attn_temporal = attn_temporal.softmax(dim=-1)
        x = (attn_temporal @ v_t)
        x = rearrange(x, '(bn) h t d -> bn t (h d)', h=self.num_heads)
        x = rearrange(x, '(b n) t d -> b (t n) d', n=N)

        return self.proj(x)

# 计算复杂度对比:
# 联合时空注意力: O((T*N)^2 * D)
# 分离时空注意力: O(T*N^2*D + N*T^2*D)
# 当 T=8, N=196 时, 分离方法快约 4.5 倍`
                }
            ],
            table: {
                headers: ["方法", "核心架构", "时间建模", "空间建模", "计算复杂度", "代表模型"],
                rows: [
                    ["2D CNN + 池化", "2D 卷积 + 时间池化", "平均/最大池化", "卷积", "O(T*N)", "TSN"],
                    ["双流网络", "空间流 + 时间流", "光流网络", "RGB 网络", "O(2*N)", "Two-Stream"],
                    ["3D CNN", "3D 卷积", "3D 卷积核", "3D 卷积核", "O(T*N*D^2)", "C3D/I3D"],
                    ["RNN 方法", "CNN + LSTM/GRU", "循环网络", "CNN", "O(T*N*D)", "LRCN"],
                    ["Video Transformer", "分离自注意力", "时间自注意力", "空间自注意力", "O(T^2*N + N^2*T)", "TimeSformer"],
                    ["ViViT", "管状注意力", "管状 patch 序列化", "管状 patch 序列化", "O((T*N)^2)", "ViViT"]
                ]
            },
            mermaid: `graph LR
    A["输入视频\n[T, H, W, 3]"] --> B["Patch 划分\nT*N 个时空 token"]
    B --> C["位置编码\n空间 + 时间 PE"]
    C --> D{"注意力类型"}
    D --> E["联合时空\nO((TN)^2)"]
    D --> F["分离时空\nO(T^2N + TN^2)"]
    D --> G["管状注意力\nO(TN^2)"]
    E --> H["特征表示\n[T*N, D]"]
    F --> H
    G --> H
    H --> I["分类头\n动作识别/检索"]`,
            tip: "在数据量有限时，3D CNN 的视频表示更稳定；当训练数据超过 100K 视频片段时，TimeSformer 的分离注意力架构能更好地捕获长程时间依赖",
            warning: "TimeSformer 的时间注意力对帧采样非常敏感，均匀采样可能错过关键动作帧，建议结合重要性采样策略"
        },
        {
            title: "2. 视频-文本预训练：VideoCLIP 与 CLIP4Clip",
            body: `视频-文本预训练的目标是学习视频和自然语言之间的跨模态对齐表示。这一任务的核心挑战在于：视频包含高维的时空信息，而文本是离散的语言符号序列，两者的表示空间和语义粒度存在巨大差异。

CLIP4Clip 是将 CLIP 的成功范式迁移到视频领域的经典工作。它使用预训练的 CLIP 模型作为基础，对视频编码器进行了三个关键修改：第一，将帧序列通过时间注意力模块聚合为统一的视频表示；第二，引入了三种相似度计算策略，分别是无时序建模的直接均值池化、基于时序建模的 Transformer 聚合、以及基于参数化矩阵的跨帧注意力；第三，设计了两种训练目标，分别是图文对比学习损失和文本生成损失，前者学习跨模态对齐，后者增强细粒度理解。

VideoCLIP 采用了不同的设计思路。它直接对视频帧和文本进行端到端的联合训练，使用大规模的弱监督视频-文本对（主要来自 YouTube 视频及其描述）。VideoCLIP 的关键创新在于它的掩码视觉建模策略：随机掩蔽视频的部分帧，要求模型通过剩余帧和文本描述来重建被掩蔽帧的视觉特征。这种策略迫使模型学习视频帧之间的时序推理能力。

预训练数据的质量对视频-语言模型的性能影响巨大。WebVid-10M 和 HowTo100M 是目前最常用的两个大规模视频-文本数据集，前者包含 1000 万条 YouTube 视频及其描述，后者包含 130 万条教学视频及其自动生成的文本。这些数据的噪声水平（自动字幕的不准确性）是后续模型设计时必须考虑的因素。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class CLIP4ClipVideoEncoder(nn.Module):
    """CLIP4Clip 视频编码器
    基于 CLIP 图像编码器，添加时间聚合模块
    """

    def __init__(self, clip_model, num_frames: int = 12):
        super().__init__()
        # 使用预训练 CLIP 的视觉编码器
        self.frame_encoder = clip_model.visual
        self.frame_dim = 512  # CLIP ViT-B 输出维度

        # 时间聚合模块
        self.temporal_transformer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(
                d_model=self.frame_dim, nhead=8, dim_feedforward=2048,
                batch_first=True
            ),
            num_layers=4
        )
        self.temporal_position_embedding = nn.Parameter(
            torch.randn(num_frames, self.frame_dim)
        )
        self.num_frames = num_frames

    def forward(self, video: torch.Tensor) -> torch.Tensor:
        """
        video: [B, 3, T, H, W] 原始视频帧
        返回: [B, D] 视频级表示
        """
        B, C, T, H, W = video.shape
        # 编码每一帧 [B, T, D]
        frame_features = []
        for t in range(T):
            frame = video[:, :, t, :, :]  # [B, C, H, W]
            feat = self.frame_encoder(frame)  # [B, D]
            frame_features.append(feat)
        frame_features = torch.stack(frame_features, dim=1)  # [B, T, D]

        # 添加时间位置编码
        frame_features = frame_features + self.temporal_position_embedding[:T]

        # 时间 Transformer 聚合
        video_features = self.temporal_transformer(frame_features)  # [B, T, D]
        video_features = video_features.mean(dim=1)  # [B, D]
        return F.normalize(video_features, dim=-1)`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VideoCLIPTrainer(nn.Module):
    """VideoCLIP 训练框架
    包含三种损失:
    1. 对比损失 (InfoNCE) - 跨模态对齐
    2. 掩码帧重建损失 - 时序推理
    3. 文本生成损失 (可选) - 细粒度理解
    """

    def __init__(self, video_encoder, text_encoder,
                 video_dim: int = 512, text_dim: int = 512):
        super().__init__()
        self.video_encoder = video_encoder
        self.text_encoder = text_encoder

        # 跨模态投影头
        self.video_proj = nn.Linear(video_dim, 256)
        self.text_proj = nn.Linear(text_dim, 256)
        self.logit_scale = nn.Parameter(torch.tensor(4.6052))  # log(1/0.01)

        # 掩码帧重建头
        self.mask_reconstructor = nn.Sequential(
            nn.Linear(video_dim, 1024),
            nn.ReLU(),
            nn.Linear(1024, video_dim)
        )

    def forward(self, video: torch.Tensor, text_ids: torch.Tensor,
                mask: torch.Tensor = None):
        """
        video: [B, 3, T, H, W]
        text_ids: [B, L] 文本 token ids
        mask: [B, T] 帧掩码 (1=掩蔽, 0=可见)
        """
        # 编码
        video_feat = self.video_encoder(video)  # [B, T, D]
        text_feat = self.text_encoder(text_ids)  # [B, D]

        # 对比损失
        loss_contrast = self._contrastive_loss(video_feat, text_feat)

        # 掩码重建损失
        loss_recon = 0.0
        if mask is not None:
            masked_feat = video_feat * (1 - mask.unsqueeze(-1))
            reconstructed = self.mask_reconstructor(masked_feat)
            loss_recon = F.mse_loss(
                reconstructed * mask.unsqueeze(-1),
                video_feat * mask.unsqueeze(-1)
            )

        return {
            "loss_contrast": loss_contrast,
            "loss_recon": loss_recon,
            "total_loss": loss_contrast + 0.5 * loss_recon
        }

    def _contrastive_loss(self, video_feat, text_feat):
        """InfoNCE 对比损失"""
        v_proj = F.normalize(self.video_proj(video_feat.mean(dim=1)), dim=-1)
        t_proj = F.normalize(self.text_proj(text_feat), dim=-1)
        scale = self.logit_scale.exp()
        logits = scale * v_proj @ t_proj.T
        labels = torch.arange(logits.size(0), device=logits.device)
        loss_v = F.cross_entropy(logits, labels)
        loss_t = F.cross_entropy(logits.T, labels)
        return (loss_v + loss_t) / 2`
                }
            ],
            table: {
                headers: ["预训练方法", "数据规模", "训练目标", "视觉编码器", "时间建模", "主要贡献"],
                rows: [
                    ["CLIP4Clip", "400K 视频-文本对", "对比学习", "CLIP ViT", "Transformer 聚合", "CLIP 迁移到视频"],
                    ["VideoCLIP", "10M YouTube 对", "对比 + 掩码重建", "3D CNN/ViT", "帧间注意力", "掩码视觉建模"],
                    ["VideoBERT", "YouTube-8M", "自监督预测", "ResNet-101", "时间卷积", "首个视频-语言预训练"],
                    ["ActBERT", "3M 视频片段", "对比 + 文本匹配", "I3D", "时间池化", "动作-语言对齐"],
                    ["MERLOT", "6M 视频-字幕", "联合多任务", "ViT + 时间层", "跨帧注意力", "大规模多任务预训练"],
                    ["X-CLIP", "WebVid-10M", "对比学习", "CLIP ViT-L", "跨帧注意力", "可扩展的跨帧注意力"]
                ]
            },
            mermaid: `graph TD
    A["视频帧序列\n[T, H, W, 3]"] --> B["帧编码器\nCLIP ViT"]
    C["文本描述\nToken IDs"] --> D["文本编码器\nCLIP Text"]
    B --> E["时间聚合\nTransformer"]
    E --> F["视频表示\n[B, D]"]
    D --> G["文本表示\n[B, D]"]
    F --> H{"损失计算"}
    G --> H
    H --> I["InfoNCE 对比损失"]
    H --> J["掩码帧重建损失"]
    H --> K["文本生成损失"]
    I --> L["联合优化\n更新所有模块"]
    J --> L
    K --> L`,
            tip: "预训练时使用较大的时间窗口（16-32 帧）可以显著提升下游任务性能，但需要配合梯度累积来应对显存限制",
            warning: "WebVid-10M 等大规模数据集中的自动字幕存在约 15-20% 的错误率，训练时需要加入鲁棒性正则化或噪声过滤"
        },
        {
            title: "3. 视频问答（VideoQA）：让模型理解并回答",
            body: `视频问答（Video Question Answering, VideoQA）要求模型观看一段视频后，回答关于视频内容的自然语言问题。这是视频理解领域最具挑战性的任务之一，因为它同时要求空间感知、时间推理和语言理解三种能力。

VideoQA 的技术路线经历了从两阶段到端到端的演进。早期的方法首先生成视频的物体检测结果和场景描述，然后将这些结构化信息与问题一起输入到推理模块。这种方法虽然可解释性强，但信息在结构化过程中不可避免地丢失。端到端方法直接将视频帧和问题文本输入到统一的编码器中，通过交叉注意力实现视频和文本的深度融合。

HGA（Hierarchical Graph Attention）代表了 VideoQA 的一个重要方向：它首先从视频中提取物体、动作和场景等语义单元，构建一个层次化的图结构，然后在图上执行多跳推理。例如，对于问题 "那个人拿起了什么颜色的包？"，模型需要识别出 "那个人"（主体定位）、"拿起"（动作识别）、"包"（客体识别）和 "颜色"（属性推理），并在图上进行多跳关联。

另一个值得关注的方向是外部知识增强的 VideoQA。某些问题需要视频之外的常识才能回答，例如 "这个人在做什么运动？" 可能需要模型知道某种身体动作对应网球。这类方法通常将概念知识库（如 ConceptNet）或大型语言模型的知识融入推理过程，通过知识图谱与视频特征的联合表示来增强回答能力。",
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class EndToEndVideoQA(nn.Module):
    """端到端视频问答模型
    架构: 视频编码器 + 文本编码器 + 交叉注意力融合 + 分类头
    """

    def __init__(self, video_dim: int = 512, text_dim: int = 768,
                 num_answers: int = 1000, n_layers: int = 4):
        super().__init__()
        self.video_dim = video_dim
        self.text_dim = text_dim
        self.shared_dim = 512

        # 模态投影到共享空间
        self.video_proj = nn.Linear(video_dim, self.shared_dim)
        self.text_proj = nn.Linear(text_dim, self.shared_dim)

        # 交叉注意力融合层
        fusion_layers = []
        for _ in range(n_layers):
            fusion_layers.append(
                nn.TransformerEncoderLayer(
                    d_model=self.shared_dim, nhead=8,
                    dim_feedforward=2048, batch_first=True
                )
            )
        self.fusion = nn.TransformerEncoder(
            nn.ModuleList(fusion_layers), num_layers=1
        )
        # 简化: 实际使用多层堆叠

        # 问题引导的视频注意力
        self.q_attend = nn.MultiheadAttention(
            embed_dim=self.shared_dim, num_heads=8, batch_first=True
        )

        # 分类头
        self.classifier = nn.Sequential(
            nn.Linear(self.shared_dim, self.shared_dim),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(self.shared_dim, num_answers)
        )

    def forward(self, video_features: torch.Tensor,
                text_features: torch.Tensor) -> torch.Tensor:
        """
        video_features: [B, T, D_v] 视频帧特征
        text_features: [B, L, D_t] 问题文本特征
        返回: [B, num_answers] 答案 logits
        """
        # 投影到共享空间
        v = self.video_proj(video_features)  # [B, T, D]
        t = self.text_proj(text_features)    # [B, L, D]

        # 问题引导的视频注意力
        v_attended, _ = self.q_attend(
            query=v, key=t, value=t
        )  # [B, T, D]

        # 时序聚合 + 与问题融合
        video_global = v_attended.mean(dim=1)  # [B, D]
        text_global = t.mean(dim=1)            # [B, D]

        # 融合
        fused = video_global * text_global  # 逐元素乘法
        fused = torch.cat([fused, video_global, text_global], dim=-1)
        fused = nn.Linear(self.shared_dim * 3, self.shared_dim)(fused)

        return self.classifier(fused)

# 典型数据集:
# TGIF-QA: 65K 视频, 165K 问答 (5 种问题类型)
# MSRVTT-QA: 10K 视频, 243K 问答
# ActivityNet-QA: 10K 视频, 88K 问答`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from typing import Optional

class KnowledgeEnhancedVideoQA(nn.Module):
    """外部知识增强的视频问答
    结合视觉特征和知识图谱嵌入
    """

    def __init__(self, video_dim: int = 512, text_dim: int = 768,
                 kg_dim: int = 300, num_answers: int = 1000):
        super().__init__()
        self.video_proj = nn.Linear(video_dim, 512)
        self.text_proj = nn.Linear(text_dim, 512)
        self.kg_proj = nn.Linear(kg_dim, 512)

        # 三路交叉注意力
        self.cross_attn = nn.MultiheadAttention(
            embed_dim=512, num_heads=8, batch_first=True
        )

        # 知识推理模块: 多跳图注意力
        self.kg_reason = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, 512)
        )

        # 输出头
        self.output = nn.Sequential(
            nn.Linear(512 * 3, 512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, num_answers)
        )

    def forward(self, video: torch.Tensor, question: torch.Tensor,
                kg_embeddings: torch.Tensor,
                kg_mask: Optional[torch.Tensor] = None):
        """
        video: [B, T, 512]
        question: [B, L, 768]
        kg_embeddings: [B, K, 300] 知识实体嵌入
        kg_mask: [B, K] 有效实体掩码
        """
        # 投影
        v = self.video_proj(video).mean(dim=1)  # [B, 512]
        q = self.text_proj(question).mean(dim=1)  # [B, 512]
        kg = self.kg_proj(kg_embeddings)  # [B, K, 512]

        # 知识聚合 (加权平均)
        if kg_mask is not None:
            kg_masked = kg * kg_mask.unsqueeze(-1)
            kg_global = kg_masked.sum(dim=1) / (kg_mask.sum(dim=1, keepdim=True) + 1e-8)
        else:
            kg_global = kg.mean(dim=1)
        kg_global = self.kg_reason(kg_global)  # [B, 512]

        # 视觉-语言交叉注意力
        vq_attn, _ = self.cross_attn(
            query=v.unsqueeze(1),
            key=q.unsqueeze(1),
            value=q.unsqueeze(1)
        )
        vq_attn = vq_attn.squeeze(1)

        # 三路特征融合
        combined = torch.cat([v, vq_attn, kg_global], dim=-1)
        return self.output(combined)

# 知识注入方式:
# 1. 预定义概念映射 (名词 -> ConceptNet 节点)
# 2. 开放域实体链接 (NER + 知识库查询)
# 3. LLM 生成常识知识 (用 GPT 生成相关事实)`
                }
            ],
            table: {
                headers: ["数据集", "视频数", "问答数", "问题类型", "领域", "主要挑战"],
                rows: [
                    ["TGIF-QA", "65K GIF", "165K", "动作/计数/时序/状态/原因", "日常 GIF", "时序推理"],
                    ["MSRVTT-QA", "10K 视频", "243K", "开放式 QA", "多样化", "视频噪声"],
                    ["ActivityNet-QA", "10K 视频", "88K", "开放式 QA", "长视频", "长程依赖"],
                    ["NExT-QA", "5K 视频", "41K", "因果/时序/描述", "影视片段", "因果推理"],
                    ["EgoSchema", "5K 视频", "34K", "开放式 QA", "第一人称视角", "细粒度动作"],
                    ["Video-MME", "900 视频", "2700", "多模态选择题", "多样化", "综合推理"]
                ]
            },
            mermaid: `graph TD
    A["输入视频\n[T, H, W, 3]"] --> B["视频编码器\nTimeSformer/CLIP"]
    C["问题文本\nToken IDs"] --> D["文本编码器\nBERT/LLM"]
    B --> E["视频特征\n[T, D]"]
    D --> F["问题特征\n[L, D]"]
    G["外部知识\n知识图谱/LLM"] --> H["知识嵌入\n[K, D]"]
    E --> I["交叉注意力融合\nQ-V-K-T"]
    F --> I
    H --> I
    I --> J["融合表示\n[D]"]
    J --> K["分类头\nMLP"]
    K --> L["答案\nTop-1/Top-5"]`,
            tip: "对于开放式 VideoQA，使用 VQA 评估器（BLEU/METEOR/CIDEr 的组合）比单纯准确率更能反映回答质量",
            warning: "VideoQA 数据集存在严重的答案偏差（如 yes/no 占 40%），需要专门的去偏训练策略，否则模型会退化为语言先验预测器"
        },
        {
            title: "4. 视频描述生成（Video Captioning）：从像素到自然语言",
            body: `视频描述生成（Video Captioning）的目标是为一段视频自动生成一段自然语言描述。与图像描述不同，视频描述需要捕捉动态信息、时序关系和事件因果，这使得语言生成的复杂度显著提升。

经典的视频描述生成方法采用编码器-解码器架构。编码器使用 3D CNN 或 Transformer 提取视频的时空特征，解码器使用 LSTM 或 Transformer 自回归地生成描述文本。编码器输出的视频特征通过注意力机制注入到解码器的每一步生成中，使得模型能够在生成不同词汇时关注视频的不同时空区域。

近年来的方法越来越多地引入结构化信息来改善生成质量。场景图（Scene Graph）方法首先从视频中提取物体、属性和关系，构建每一帧的语义图，然后将图序列通过图神经网络聚合为全局视频表示。这种方法生成的描述在物体和关系准确性上显著优于纯端到端方法。

另一个重要方向是可控视频描述生成。用户可能希望生成特定长度、特定风格或关注特定物体的描述。这通过在解码器中引入控制信号来实现，例如使用条件变分自编码器（CVAE）学习描述的风格表示，或者通过指令微调使模型支持 "详细描述"、"简要概括"、"关注人物动作" 等多样化指令。",
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VideoCaptioningModel(nn.Module):
    """基于 Transformer 的视频描述生成模型
    编码器: 视频时空特征提取
    解码器: 带注意力的自回归文本生成
    """

    def __init__(self, vocab_size: int = 10000, video_dim: int = 512,
                 text_dim: int = 512, max_len: int = 50, n_layers: int = 6):
        super().__init__()
        self.vocab_size = vocab_size
        self.max_len = max_len
        self.text_dim = text_dim

        # 文本嵌入
        self.text_embed = nn.Embedding(vocab_size, text_dim)
        self.pos_embed = nn.Parameter(torch.randn(max_len, text_dim))

        # 视频投影
        self.video_proj = nn.Linear(video_dim, text_dim)

        # Transformer 解码器
        decoder_layer = nn.TransformerDecoderLayer(
            d_model=text_dim, nhead=8, dim_feedforward=2048, batch_first=True
        )
        self.decoder = nn.TransformerDecoder(decoder_layer, num_layers=n_layers)

        # 输出投影
        self.output_proj = nn.Linear(text_dim, vocab_size)

        # 特殊 token
        self.bos_token = vocab_size - 2
        self.eos_token = vocab_size - 1

    def forward(self, video_features: torch.Tensor,
                caption_ids: torch.Tensor) -> torch.Tensor:
        """
        video_features: [B, T, D] 视频特征
        caption_ids: [B, L] 描述文本 token ids (含 BOS)
        返回: [B, L-1, vocab_size] 生成概率
        """
        # 视频投影
        v = self.video_proj(video_features)  # [B, T, D]

        # 文本嵌入 + 位置编码
        L = caption_ids.size(1)
        text_emb = self.text_embed(caption_ids) + self.pos_embed[:L]  # [B, L, D]

        # 生成掩码 (因果掩码, 防止看到未来 token)
        tgt_mask = nn.Transformer.generate_square_subsequent_mask(L)

        # 解码器
        output = self.decoder(
            tgt=text_emb,
            memory=v,
            tgt_mask=tgt_mask
        )  # [B, L, D]

        return self.output_proj(output)  # [B, L, vocab_size]

    def generate(self, video_features: torch.Tensor,
                 max_len: int = 30, beam_size: int = 3) -> list:
        """束搜索生成描述"""
        B = video_features.size(0)
        v = self.video_proj(video_features)

        # 初始化: BOS token
        sequences = [[self.bos_token] for _ in range(B)]
        scores = torch.zeros(B)

        for step in range(max_len):
            input_ids = torch.tensor([s[-step-1:] for s in sequences])
            text_emb = self.text_embed(input_ids)
            tgt_mask = nn.Transformer.generate_square_subsequent_mask(
                text_emb.size(1)
            )
            output = self.decoder(tgt=text_emb, memory=v, tgt_mask=tgt_mask)
            logits = self.output_proj(output[:, -1, :])  # [B, vocab]
            probs = F.softmax(logits, dim=-1)
            next_tokens = probs.argmax(dim=-1)

            for b in range(B):
                sequences[b].append(next_tokens[b].item())
                if next_tokens[b].item() == self.eos_token:
                    pass  # 简化: 实际应停止该序列

        return sequences`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class SceneGraphVideoCaptioning(nn.Module):
    """基于场景图的视频描述生成
    利用结构化视觉知识提升生成质量
    """

    def __init__(self, vocab_size: int = 10000, obj_dim: int = 256,
                 rel_dim: int = 128, text_dim: int = 512):
        super().__init__()
        self.text_dim = text_dim

        # 物体/关系特征投影
        self.obj_proj = nn.Linear(obj_dim, text_dim)
        self.rel_proj = nn.Linear(rel_dim, text_dim)

        # 图注意力网络 (GAT)
        self.gat = nn.MultiheadAttention(
            embed_dim=text_dim, num_heads=8, batch_first=True
        )

        # 时序图聚合 (跨帧)
        self.temporal_gnn = nn.GRUCell(text_dim, text_dim)

        # 解码器
        self.text_decoder = nn.LSTMCell(text_dim, text_dim)
        self.output_proj = nn.Linear(text_dim, vocab_size)

        # 初始状态
        self.h0_proj = nn.Linear(text_dim, text_dim)
        self.c0_proj = nn.Linear(text_dim, text_dim)

    def forward(self, object_features: torch.Tensor,
                relation_features: torch.Tensor,
                adj_matrix: torch.Tensor,
                caption_ids: torch.Tensor,
                text_embed_fn) -> torch.Tensor:
        """
        object_features: [B, T, N, obj_dim] 物体特征
        relation_features: [B, T, R, rel_dim] 关系特征
        adj_matrix: [B, T, N, N] 邻接矩阵
        caption_ids: [B, L] 文本 token ids
        """
        B, T, N, _ = object_features.shape

        # 帧内图注意力
        objects = self.obj_proj(object_features)  # [B, T, N, D]
        objects_flat = objects.view(B * T, N, -1)  # [B*T, N, D]

        # GAT 聚合
        attended, _ = self.gat(
            query=objects_flat,
            key=objects_flat,
            value=objects_flat
        )  # [B*T, N, D]

        # 帧内聚合
        frame_features = attended.mean(dim=1)  # [B*T, D]

        # 跨帧时序聚合
        temporal_features = []
        h = torch.zeros(B, self.text_dim, device=object_features.device)
        for t in range(T):
            h = self.temporal_gnn(frame_features[B*t:B*(t+1)], h)
            temporal_features.append(h)
        video_representation = torch.stack(temporal_features, dim=1)  # [B, T, D]
        video_global = video_representation.mean(dim=1)  # [B, D]

        # 自回归生成 (简化版)
        text_emb = text_embed_fn(caption_ids)  # [B, L, D]
        h_state = self.h0_proj(video_global)
        c_state = self.c0_proj(video_global)
        outputs = []
        for step in range(caption_ids.size(1)):
            h_state, c_state = self.text_decoder(
                text_emb[:, step, :], (h_state, c_state)
            )
            outputs.append(self.output_proj(h_state))

        return torch.stack(outputs, dim=1)  # [B, L, vocab_size]

# 评估指标:
# BLEU-4: 4-gram 重叠率
# METEOR: 考虑同义词和词形的匹配率
# CIDEr: TF-IDF 加权的 n-gram 相似度
# SPICE: 基于场景图的语义匹配
# ROUGE-L: 最长公共子序列`
                }
            ],
            table: {
                headers: ["数据集", "视频数", "描述数/视频", "领域", "平均描述长度", "特点"],
                rows: [
                    ["MSR-VTT", "10K", "20 条", "多样化", "10.4 词", "最大规模通用数据集"],
                    ["MSVD", "1970", "41 条", "短片段", "7.7 词", "高质量人工标注"],
                    ["YouCook2", "2K 烹饪视频", "3.6 条", "烹饪教学", "9.8 词", "时序标注"],
                    ["ActivityNet Captions", "20K", "3.6 条", "长视频", "13.5 词", "长视频密集描述"],
                    ["VATEX", "41K", "10 条", "多样化", "11.3 词", "中英双语"],
                    ["HowTo100M", "130万", "1 条", "教学视频", "20+ 词", "最大规模 (噪声较高)"]
                ]
            },
            mermaid: `graph TD
    A["输入视频\n[T, H, W, 3]"] --> B["视觉编码器\n3D CNN/Transformer"]
    B --> C["帧级特征\n[T, D]"]
    C --> D{"描述生成方式"}
    D --> E["端到端\nEncoder-Decoder"]
    D --> F["场景图增强\nGAT + LSTM"]
    D --> G["大语言模型\nLLM as Decoder"]
    E --> H["自回归解码\n逐词生成"]
    F --> H
    G --> H
    H --> I["注意力机制\n关注视频不同区域"]
    I --> J["输出描述\n自然语言句子"]
    J --> K["评估\nBLEU/METEOR/CIDEr"]`,
            tip: "在训练视频描述生成模型时，使用多个描述作为 ground truth（而非单一描述）可以显著提升模型对同一视频不同表达方式的鲁棒性",
            warning: "视频描述生成模型容易陷入安全描述模板（如 a person is doing something），需要使用强化学习或对比解码来鼓励多样性"
        },
        {
            title: "5. 时序定位（Moment Retrieval）：找到关键片段",
            body: `时序定位（Moment Retrieval）的任务是：给定一段视频和一段自然语言查询，在视频中定位出与查询对应的具体时间段。这是视频-语言理解中最精细的任务之一，要求模型同时理解语言查询的语义和视频内容的时序结构。

与视频分类不同，时序定位不需要对整个视频做出判断，而是需要精确找到某个局部片段。例如，对于查询 "找到切洋葱的片段"，模型需要从一段 5 分钟的烹饪视频中精确标注出 01:23 到 01:45 这个切洋葱的时间段。

现代时序定位方法主要分为两类和一类范式。基于提案的方法（Proposal-based）首先生成大量的候选时间片段（proposals），然后对每个候选片段计算其与查询的匹配分数，最终选择分数最高的片段作为预测结果。这类方法的优点是定位精度高，缺点是候选生成和评估的计算开销大。

基于直接回归的方法（Regression-based）则直接将查询-视频对的联合表示映射为起止时间。这种方法避免了候选生成的步骤，效率更高，但对模型的时序感知能力要求更高。近年来，密集预测（Dense Prediction）方法通过在每个时间步预测匹配分数来同时实现分类和定位，成为性能最优的范式。

时序定位面临的核心挑战是时序边界模糊。在视频中，动作的开始和结束往往是渐进的，没有明确的分界点。例如，"拿起杯子" 的动作从伸手到完全握住杯子可能持续 2-3 秒，不同的标注者可能给出不同的边界。因此，评估指标通常使用 IoU（交并比）阈值来衡量定位精度，而非精确的起止时间。",
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class DenseMomentRetrieval(nn.Module):
    """密集预测时序定位模型
    在每个时间步预测:
    1. 与查询的匹配分数 (用于定位)
    2. 边界偏移量 (用于精修)
    """

    def __init__(self, video_dim: int = 512, text_dim: int = 512,
                 num_windows: int = 100):
        super().__init__()
        self.num_windows = num_windows
        self.video_proj = nn.Linear(video_dim, 256)
        self.text_proj = nn.Linear(text_dim, 256)

        # 多尺度时间窗口
        self.window_sizes = [4, 8, 16, 32, 64]
        self.window_convs = nn.ModuleList([
            nn.Conv1d(256, 256, kernel_size=w, padding=w//2)
            for w in self.window_sizes
        ])

        # 匹配分数预测
        self.score_head = nn.Sequential(
            nn.Linear(256 * len(self.window_sizes), 128),
            nn.ReLU(),
            nn.Linear(128, 1)
        )

        # 边界偏移预测
        self.boundary_head = nn.Sequential(
            nn.Linear(256 * len(self.window_sizes), 128),
            nn.ReLU(),
            nn.Linear(128, 2)  # 起始偏移 + 结束偏移
        )

        # 跨模态注意力
        self.cross_attn = nn.MultiheadAttention(
            embed_dim=256, num_heads=8, batch_first=True
        )

    def forward(self, video_features: torch.Tensor,
                text_features: torch.Tensor) -> dict:
        """
        video_features: [B, T, D]
        text_features: [B, L, D] 查询文本
        返回: 每个时间步的分数和边界偏移
        """
        B, T, D = video_features.shape

        # 跨模态注意力融合
        v = self.video_proj(video_features)  # [B, T, 256]
        t = self.text_proj(text_features)    # [B, L, 256]

        # 查询引导的视频特征增强
        v_enhanced, _ = self.cross_attn(
            query=v, key=t, value=t
        )  # [B, T, 256]

        # 多尺度时间卷积
        v_enhanced = v_enhanced.transpose(1, 2)  # [B, 256, T]
        multi_scale_feats = []
        for conv in self.window_convs:
            feat = F.relu(conv(v_enhanced))  # [B, 256, T]
            multi_scale_feats.append(feat)

        # 拼接多尺度特征
        combined = torch.cat(multi_scale_feats, dim=1)  # [B, 256*5, T]
        combined = combined.transpose(1, 2)  # [B, T, 256*5]

        # 预测
        scores = self.score_head(combined).squeeze(-1)  # [B, T]
        boundaries = self.boundary_head(combined)        # [B, T, 2]

        return {"scores": scores, "boundaries": boundaries}

    def predict(self, video_features: torch.Tensor,
                text_features: torch.Tensor,
                top_k: int = 1) -> list:
        """预测 top-K 时间段"""
        output = self.forward(video_features, text_features)
        scores = output["scores"].sigmoid()  # [B, T]
        boundaries = output["boundaries"]

        results = []
        for b in range(video_features.size(0)):
            top_indices = scores[b].topk(top_k).indices.tolist()
            for idx in top_indices:
                start_offset = boundaries[b, idx, 0].sigmoid().item()
                end_offset = boundaries[b, idx, 1].sigmoid().item()
                results.append({
                    "start": max(0, idx - start_offset * 10),
                    "end": min(T, idx + end_offset * 10),
                    "score": scores[b, idx].item()
                })
        return results`
                },
                {
                    lang: "python",
                    code: `import torch
import numpy as np

def compute_moment_iou(pred: tuple, ground_truth: tuple) -> float:
    """计算时间段 IoU (交并比)
    pred: (start_pred, end_pred)
    ground_truth: (start_gt, end_gt)
    """
    start_max = max(pred[0], ground_truth[0])
    end_min = min(pred[1], ground_truth[1])
    intersection = max(0, end_min - start_max)
    union = max(pred[1] - pred[0], 0) + max(ground_truth[1] - ground_truth[0], 0) - intersection
    return intersection / (union + 1e-8)

def evaluate_moment_retrieval(predictions: list, ground_truths: list,
                               iou_thresholds: list = None):
    """
    评估时序定位性能
    predictions: list of (start, end, score)
    ground_truths: list of (start, end)
    """
    if iou_thresholds is None:
        iou_thresholds = [0.3, 0.5, 0.7]

    n = len(ground_truths)
    results = {}

    for threshold in iou_thresholds:
        correct_at_k = {1: 0, 5: 0}
        for pred_list, gt in zip(predictions, ground_truths):
            # 对每个 GT, 检查是否在 top-K 预测中
            for k in correct_at_k:
                top_k = pred_list[:k]
                found = any(
                    compute_moment_iou((p[0], p[1]), gt) >= threshold
                    for p in top_k
                )
                if found:
                    correct_at_k[k] += 1

        for k, count in correct_at_k.items():
            results[f"R@{k}, IoU@{threshold}"] = count / n

    # 平均 IoU
    all_ious = []
    for pred_list, gt in zip(predictions, ground_truths):
        best_pred = pred_list[0]  # top-1
        iou = compute_moment_iou((best_pred[0], best_pred[1]), gt)
        all_ious.append(iou)
    results["mean_IoU"] = sum(all_ious) / n

    return results

# 典型评估结果 (Charades-STA):
# R@1, IoU@0.3: 62.4%
# R@1, IoU@0.5: 43.7%
# R@1, IoU@0.7: 21.3%
# R@5, IoU@0.5: 68.9%
# mean_IoU: 0.42
#
# 典型评估结果 (ActivityNet Captions):
# R@1, IoU@0.3: 48.2%
# R@1, IoU@0.5: 32.1%
# R@1, IoU@0.7: 12.8%
# mean_IoU: 0.35`
                }
            ],
            table: {
                headers: ["方法类别", "代表方法", "定位策略", "优势", "劣势", "典型性能"],
                rows: [
                    ["提案+排序", "CMN/VSLNet", "生成候选片段再排序", "定位精度高", "计算开销大", "R@1,IoU@0.5: 42%"],
                    ["直接回归", "QD-DETR/2D-TAN", "直接回归起止时间", "端到端训练", "对长视频效果差", "R@1,IoU@0.5: 38%"],
                    ["密集预测", "SnAG/UMT", "逐时间步打分", "精度高, 支持多片段", "需要密集标注", "R@1,IoU@0.5: 52%"],
                    ["扩散模型", "DiffQuery", "扩散过程生成", "多样性好", "推理慢", "R@1,IoU@0.5: 45%"],
                    ["LLM 增强", "Video-LLaVA+检索", "LLM 推理定位", "零样本能力强", "需要 LLM 支持", "R@1,IoU@0.5: 35%"]
                ]
            },
            mermaid: `graph TD
    A["输入视频\n[T, H, W, 3]"] --> B["视频编码器\n提取时序特征"]
    C["查询文本\n自然语言"] --> D["文本编码器\n提取查询表示"]
    B --> E["时序特征\n[T, D]"]
    D --> F["查询表示\n[D]"]
    E --> G{"定位策略"}
    F --> G
    G --> H["提案生成\n滑动窗口/Anchor"]
    G --> I["直接回归\nMLP 预测边界"]
    G --> J["密集预测\n逐时间步打分"]
    H --> K["提案-查询匹配"]
    I --> K
    J --> K
    K --> L["排序\nTop-K 时间段"]
    L --> M["边界精修\n偏移量回归"]
    M --> N["最终时间段\n(start, end)"]`,
            tip: "使用软边界标签（Soft Boundary Labels）代替硬标签可以缓解时序边界模糊问题，在边界附近使用高斯衰减的分数",
            warning: "长视频（超过 5 分钟）的时序定位性能显著下降，建议采用分块处理（chunking）或层次化定位策略"
        },
        {
            title: "6. 多模态大模型中的视频模态",
            body: `随着多模态大语言模型（Multimodal Large Language Models, MLLMs）的快速发展，视频作为输入模态被越来越多地整合到大模型中。这类模型能够接受视频输入，通过自然语言对话的方式理解视频内容、回答复杂问题、甚至执行视觉推理任务。

视频模态整合到 MLLM 的核心挑战在于计算效率。与图像不同，视频包含大量帧，直接将所有帧输入到大模型中会超出上下文窗口限制。目前主流的解决方案有三种：均匀帧采样（Uniform Sampling）、关键帧提取（Key Frame Selection）和视觉 Token 压缩（Visual Token Compression）。

均匀帧采样最简单但也最有效。它从视频中均匀抽取 N 帧（如 8 帧、16 帧或 32 帧），将其拼接后输入视觉编码器。这种方法在多数基准上表现稳定，但可能错过短暂的关键事件。关键帧提取通过轻量级的场景变化检测或动作显著性分析，选择信息量最大的帧。这种方法能更好地覆盖视频内容，但引入了额外的计算开销。

视觉 Token 压缩是最具前景的方向。其核心思想是：视频相邻帧之间存在大量冗余信息，可以通过 Token 合并或池化来减少视觉 token 数量。Video-LLaVA 和 LLaVA-Video 使用空间-时间池化将每帧的 256 个视觉 token 压缩到 64 个，使得 32 帧视频的总 token 数控制在 2048 以内，远小于大模型的上下文窗口。

多模态大模型在视频理解上的表现令人瞩目。在 Video-MME 基准上，GPT-4V、Gemini 1.5 Pro 等模型在多项任务上超过了专门的视频理解模型。这主要得益于大模型强大的语言推理能力和大规模预训练数据带来的泛化能力。",
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer

class VideoLLM(nn.Module):
    """视频-大语言模型整合
    将视频编码为 token 序列, 拼接到文本 prompt 后
    输入大语言模型
    """

    def __init__(self, vision_model_name: str = "openai/clip-vit-base-patch32",
                 llm_name: str = "lmsys/vicuna-7b-v1.5",
                 num_frames: int = 16, token_compress: int = 4):
        super().__init__()
        self.num_frames = num_frames
        self.token_compress = token_compress

        # 视觉编码器
        self.vision_model = AutoModel.from_pretrained(vision_model_name)
        self.vision_dim = 768

        # 视觉-语言投影层
        self.vision_proj = nn.Sequential(
            nn.Linear(self.vision_dim, 4096),
            nn.ReLU(),
            nn.Linear(4096, 4096)
        )

        # 大语言模型 (仅使用, 不修改权重)
        self.llm = AutoModel.from_pretrained(llm_name)
        self.tokenizer = AutoTokenizer.from_pretrained(llm_name)

        # 帧选择策略
        self.frame_selector = UniformFrameSampler(num_frames)

    def encode_video(self, video_frames: torch.Tensor) -> torch.Tensor:
        """
        video_frames: [B, T, 3, H, W]
        返回: [B, N_vision, D_llm] 视觉 token 嵌入
        """
        B, T, C, H, W = video_frames.shape

        # 编码每一帧
        frame_tokens = []
        for t in range(T):
            frame = video_frames[:, t, :, :, :]  # [B, C, H, W]
            with torch.no_grad():
                output = self.vision_model(pixel_values=frame)
                tokens = output.last_hidden_state  # [B, N_patch, D]
                # Token 压缩 (时间池化)
                if self.token_compress > 1:
                    tokens = self._compress_tokens(tokens)
                frame_tokens.append(tokens)

        # 拼接所有帧的 token
        all_tokens = torch.cat(frame_tokens, dim=1)  # [B, N_vision, D]

        # 投影到 LLM 嵌入空间
        vision_embeds = self.vision_proj(all_tokens)
        return vision_embeds

    def _compress_tokens(self, tokens: torch.Tensor) -> torch.Tensor:
        """压缩视觉 token 数量"""
        B, N, D = tokens.shape
        # 简单池化: 每 C 个 token 取平均
        grouped = tokens.view(B, N // self.token_compress,
                             self.token_compress, D)
        return grouped.mean(dim=2)  # [B, N/C, D]

    def forward(self, video_frames: torch.Tensor,
                question: str) -> torch.Tensor:
        """视频问答"""
        vision_embeds = self.encode_video(video_frames)
        prompt = f"USER: <video>\n{question}\nASSISTANT:"
        input_ids = self.tokenizer(prompt, return_tensors="pt").input_ids
        # 实际推理需要更复杂的 token 拼接逻辑
        return input_ids

class UniformFrameSampler:
    """均匀帧采样"""
    def __init__(self, num_frames: int):
        self.num_frames = num_frames

    def __call__(self, total_frames: int) -> list:
        indices = torch.linspace(0, total_frames - 1,
                                 self.num_frames).long()
        return indices.tolist()`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class KeyFrameSelector(nn.Module):
    """基于信息量的关键帧选择
    使用轻量级策略选择最具代表性的帧
    """

    def __init__(self, max_frames: int = 16, method: str = "diversity"):
        super().__init__()
        self.max_frames = max_frames
        self.method = method

    def forward(self, frames: torch.Tensor) -> torch.Tensor:
        """
        frames: [N, C, H, W] 所有帧
        返回: [max_frames, C, H, W] 选中的关键帧
        """
        if self.method == "diversity":
            return self._diversity_sampling(frames)
        elif self.method == "scene_change":
            return self._scene_change_sampling(frames)
        else:
            return self._uniform_sampling(frames)

    def _diversity_sampling(self, frames: torch.Tensor) -> torch.Tensor:
        """基于帧间差异的多样性采样 (Farthest Point Sampling)"""
        N = frames.size(0)
        if N <= self.max_frames:
            return frames

        # 提取每帧的全局特征
        features = frames.view(N, -1).float()  # [N, C*H*W]
        features = features / features.norm(dim=1, keepdim=True)

        selected = [0]  # 选择第一帧
        remaining = list(range(1, N))

        while len(selected) < self.max_frames and remaining:
            # 计算剩余帧到已选帧集的最小距离
            min_dists = torch.full((len(remaining),), float("inf"))
            for s in selected:
                dists = (1 - features[remaining] @ features[s]).squeeze()
                min_dists = torch.minimum(min_dists, dists)

            # 选择距离最大的帧
            best_idx = min_dists.argmax().item()
            selected.append(remaining[best_idx])
            remaining.pop(best_idx)

        selected.sort()
        return frames[selected]

    def _scene_change_sampling(self, frames: torch.Tensor) -> torch.Tensor:
        """基于场景变化检测的采样"""
        N = frames.size(0)
        if N <= self.max_frames:
            return frames

        # 计算相邻帧差异
        diffs = []
        for i in range(1, N):
            diff = ((frames[i] - frames[i-1]) ** 2).mean().item()
            diffs.append(diff)

        # 找出差异最大的位置 (场景切换点)
        top_change_points = sorted(
            range(len(diffs)), key=lambda i: diffs[i], reverse=True
        )[:self.max_frames - 1]
        top_change_points.sort()

        # 在场景切换点处采样
        selected = [0] + [i + 1 for i in top_change_points]
        # 如果不足, 补充均匀采样
        while len(selected) < self.max_frames:
            gap_idx = 0
            for idx in range(len(selected) - 1):
                if selected[idx + 1] - selected[idx] > 2:
                    gap_idx = idx
                    break
            mid = (selected[gap_idx] + selected[gap_idx + 1]) // 2
            selected.insert(gap_idx + 1, mid)
            selected.sort()

        return frames[:min(self.max_frames, len(selected))]

# 帧选择策略性能对比:
# Uniform: 简单稳定, 基准方法
# Diversity: 覆盖更多视觉变化, +2-3% 性能
# Scene Change: 适合长视频多场景, +3-5% 性能
# LLM-based: 用 LLM 评估信息量, +5-8% 但计算开销大`
                }
            ],
            table: {
                headers: ["多模态大模型", "视觉编码器", "视频帧数", "Token 压缩", "上下文窗口", "视频理解能力"],
                rows: [
                    ["GPT-4V", "内部 (未公开)", "动态", "内部压缩", "128K", "强 (零样本)"],
                    ["Gemini 1.5 Pro", "内部", "高 (分钟级)", "内部压缩", "1M+", "很强 (长视频)"],
                    ["LLaVA-Video", "CLIP ViT-L", "32 帧", "4x 池化", "32K", "好 (开源最佳)"],
                    ["Video-LLaVA", "ImageBind", "8 帧", "无", "4K", "中等 (轻量)"],
                    ["Qwen2-VL", "内部 ViT", "动态", "NaViT 适配", "128K", "很强 (多分辨率)"],
                    ["InternVL2", "InternViT", "8-64 帧", "动态池化", "8K", "好 (中文优)"]
                ]
            },
            mermaid: `graph TD
    A["原始视频\n[60 秒, 30fps]"] --> B["帧采样\n策略选择"]
    B --> C["Uniform\n均匀采样 16 帧"]
    B --> D["Diversity\n多样性采样"]
    B --> E["Scene Change\n场景切换检测"]
    C --> F["视觉编码\nCLIP/ViT"]
    D --> F
    E --> F
    F --> G["原始 Token\n[16*256, 768]"]
    G --> H["Token 压缩\n空间池化 + 时间池化"]
    H --> I["压缩 Token\n[16*64, 768]"]
    I --> J["投影层\nLinear + ReLU"]
    J --> K["LLM 嵌入空间\n[1024, 4096]"]
    K --> L["拼接文本 Prompt"]
    L --> M["大语言模型\n自回归生成"]
    M --> N["视频理解结果\n回答/描述/推理"]`,
            tip: "对于开源方案，LLaVA-Video 7B 是目前性价比最高的选择，在 Video-MME 上达到 60+ 分，且可在单张 A100 上运行",
            warning: "将视频 token 直接拼接到 LLM 上下文时，token 数量不能超过模型最大上下文长度，否则会被截断导致信息丢失"
        },
        {
            title: "7. 实战：VideoCLIP 视频-文本检索推理",
            body: `本节通过一个完整的实战项目，演示如何使用预训练的视频-语言模型进行视频检索推理。我们将构建一个系统：给定文本查询，从一个视频库中检索出最相关的视频片段。

整个系统包含四个核心模块：视频预处理模块负责加载视频并提取帧序列，特征编码模块使用预训练的 CLIP 模型分别编码视频和文本，相似度计算模块计算跨模态匹配分数，排序模块返回最相关的视频结果。

为了处理真实视频，我们需要解决几个工程问题：视频解码（使用 decord 或 opencv 提取帧）、帧归一化（确保输入符合预训练模型的预处理要求）、以及批处理优化（同时处理多个视频以提高吞吐量）。

在推理阶段，关键的性能优化策略包括：预计算并缓存视频特征（因为视频库通常是静态的，只需计算一次）、使用 FAISS 进行高效相似度搜索（而非暴力计算）、以及实现流式返回（边计算边返回结果，降低首屏延迟）。对于生产环境，还需要考虑模型的热更新（无需重启服务即可切换模型版本）和降级策略（当主模型不可用时使用轻量级备选模型）。",
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn.functional as F
import numpy as np
from transformers import CLIPModel, CLIPProcessor
from PIL import Image
import decord
from typing import Optional
import os

class VideoCLIPRetriever:
    """VideoCLIP 视频-文本检索推理系统"""

    def __init__(self, model_name: str = "openai/clip-vit-base-patch32",
                 num_frames: int = 8, device: str = "cuda"):
        self.num_frames = num_frames
        self.device = torch.device(device)

        # 加载预训练 CLIP 模型
        self.model = CLIPModel.from_pretrained(model_name).to(self.device)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.model.eval()

        # 特征缓存
        self.video_cache = {}  # video_path -> feature

    def extract_frames(self, video_path: str,
                      num_frames: int = None) -> list[Image.Image]:
        """从视频中提取帧"""
        n = num_frames or self.num_frames
        vr = decord.VideoReader(video_path, ctx=decord.cpu(0))
        total = len(vr)

        # 均匀采样
        indices = np.linspace(0, total - 1, n, dtype=int)
        frames = vr.get_batch(indices).asnumpy()
        return [Image.fromarray(frame) for frame in frames]

    @torch.no_grad()
    def encode_video(self, video_path: str) -> torch.Tensor:
        """编码视频为向量表示 (带缓存)"""
        if video_path in self.video_cache:
            return self.video_cache[video_path]

        frames = self.extract_frames(video_path)
        inputs = self.processor(images=frames, return_tensors="pt",
                                padding=True).to(self.device)

        # 逐帧编码后聚合
        B = inputs["pixel_values"].size(0)
        frame_features = []
        for i in range(B):
            frame_input = {
                "pixel_values": inputs["pixel_values"][i:i+1]
            }
            feat = self.model.get_image_features(**frame_input)
            frame_features.append(feat)

        video_feat = torch.cat(frame_features, dim=0).mean(dim=0)
        video_feat = F.normalize(video_feat, dim=-1)
        self.video_cache[video_path] = video_feat.cpu()
        return video_feat

    @torch.no_grad()
    def encode_text(self, query: str) -> torch.Tensor:
        """编码文本查询"""
        inputs = self.processor(text=query, return_tensors="pt",
                                padding=True).to(self.device)
        text_feat = self.model.get_text_features(**inputs)
        return F.normalize(text_feat, dim=-1)

    def search(self, query: str, video_paths: list[str],
              top_k: int = 5) -> list[dict]:
        """检索最相关的视频"""
        # 编码查询
        text_feat = self.encode_text(query)

        # 计算所有视频的相似度
        similarities = []
        for path in video_paths:
            video_feat = self.encode_video(path).to(self.device)
            sim = (text_feat @ video_feat.unsqueeze(1)).item()
            similarities.append((path, sim))

        # 排序
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [
            {"path": path, "score": round(score, 4)}
            for path, score in similarities[:top_k]
        ]

# 使用示例:
# retriever = VideoCLIPRetriever()
# results = retriever.search(
#     query="a dog playing in the park",
#     video_paths=["video1.mp4", "video2.mp4", "video3.mp4"],
#     top_k=3
# )
# # 输出: [{"path": "video2.mp4", "score": 0.87}, ...]`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn.functional as F
import numpy as np
import faiss
from typing import Optional
import json

class BatchVideoRetriever:
    """批量视频检索系统 (FAISS 加速)"""

    def __init__(self, model_name: str = "openai/clip-vit-base-patch32",
                 num_frames: int = 8, device: str = "cuda"):
        self.num_frames = num_frames
        self.device = torch.device(device)
        self.model = CLIPModel.from_pretrained(model_name).to(self.device)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.model.eval()

        self.faiss_index = None
        self.video_metadata = []  # [{path, ...}]
        self.video_dim = 512

    def build_index(self, video_dir: str, batch_size: int = 16):
        """构建视频特征索引"""
        import os
        video_files = [
            os.path.join(video_dir, f)
            for f in os.listdir(video_dir)
            if f.endswith((".mp4", ".avi", ".mov"))
        ]
        print(f"找到 {len(video_files)} 个视频文件")

        all_features = []
        self.video_metadata = []

        for i in range(0, len(video_files), batch_size):
            batch_paths = video_files[i:i+batch_size]
            batch_features = self._encode_batch(batch_paths)
            all_features.append(batch_features)

            for path in batch_paths:
                self.video_metadata.append({"path": path})

        # 合并所有特征
        all_features = torch.cat(all_features, dim=0).cpu().numpy()
        all_features = all_features.astype(np.float32)

        # 构建 FAISS 索引
        self.video_dim = all_features.shape[1]
        self.faiss_index = faiss.IndexFlatIP(self.video_dim)
        self.faiss_index.add(all_features)
        print(f"索引构建完成: {len(video_files)} 视频, {self.video_dim} 维")

        return len(video_files)

    def _encode_batch(self, paths: list[str]) -> torch.Tensor:
        """批量编码视频"""
        features = []
        for path in paths:
            frames = self._extract_frames(path)
            if frames:
                inputs = self.processor(images=frames, return_tensors="pt",
                                        padding=True).to(self.device)
                with torch.no_grad():
                    frame_feats = self.model.get_image_features(
                        **inputs
                    )
                    feat = frame_feats.mean(dim=0)
                    feat = F.normalize(feat, dim=-1)
                    features.append(feat.cpu())
            else:
                features.append(torch.zeros(self.video_dim))

        return torch.stack(features)

    def _extract_frames(self, path: str, n: int = 8) -> Optional[list]:
        """提取视频帧"""
        import decord
        from PIL import Image
        try:
            vr = decord.VideoReader(path, ctx=decord.cpu(0))
            total = len(vr)
            if total == 0:
                return None
            indices = np.linspace(0, total - 1, n, dtype=int)
            frames = vr.get_batch(indices).asnumpy()
            return [Image.fromarray(f) for f in frames]
        except Exception as e:
            print(f"Error processing {path}: {e}")
            return None

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        """检索相关视频"""
        assert self.faiss_index is not None, "请先构建索引"

        # 编码查询
        inputs = self.processor(text=query, return_tensors="pt",
                                padding=True).to(self.device)
        with torch.no_grad():
            text_feat = self.model.get_text_features(**inputs)
            text_feat = F.normalize(text_feat, dim=-1).cpu().numpy()

        # FAISS 搜索
        scores, indices = self.faiss_index.search(
            text_feat.astype(np.float32), top_k
        )

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:
                results.append({
                    "path": self.video_metadata[idx]["path"],
                    "score": round(float(score), 4)
                })

        return results

    def save_index(self, path: str):
        """保存索引和元数据"""
        import faiss
        faiss.write_index(self.faiss_index, path)
        with open(path + ".meta", "w") as f:
            json.dump(self.video_metadata, f, indent=2)

    def load_index(self, path: str):
        """加载索引和元数据"""
        import faiss
        self.faiss_index = faiss.read_index(path)
        with open(path + ".meta") as f:
            self.video_metadata = json.load(f)
        self.video_dim = self.faiss_index.d

# 性能基准 (1000 个视频, CLIP ViT-B/32):
# 索引构建: ~120 秒 (A100 GPU)
# 单次查询: ~5 毫秒 (FAISS)
# 总延迟: ~50ms (包含文本编码 + 检索 + 后处理)`
                }
            ],
            table: {
                headers: ["组件", "技术选择", "输入格式", "输出格式", "延迟", "替代方案"],
                rows: [
                    ["视频解码", "decord", "mp4/avi/mov", "RGB 帧列表", "5-20ms/视频", "opencv/PyAV"],
                    ["视觉编码", "CLIP ViT-B/32", "8 帧 PIL Images", "[8, 512] 特征", "50ms/视频", "OpenCLIP/BLIP"],
                    ["文本编码", "CLIP Text", "字符串", "[1, 512] 特征", "10ms/查询", "Chinese-CLIP"],
                    ["相似度搜索", "FAISS IndexFlatIP", "查询向量", "Top-K 索引+分数", "5ms", "Milvus/Qdrant"],
                    ["帧聚合", "均值池化", "[T, 512]", "[512]", "1ms", "Attention 加权"],
                    ["缓存策略", "内存字典", "路径->特征", "缓存命中即返回", "0ms", "Redis/Memcached"]
                ]
            },
            mermaid: `graph TD
    A["文本查询\n用户输入"] --> B["文本编码\nCLIP Text"]
    B --> C["查询向量\n[1, 512]"]
    D["视频库\nmp4/avi/mov"] --> E["视频解码\ndecord 提取帧"]
    E --> F["视觉编码\nCLIP ViT"]
    F --> G["视频向量\n[512]"]
    G --> H["FAISS 索引\nIndexFlatIP"]
    C --> I["内积计算\n相似度"]
    H --> I
    I --> J["排序\nTop-K"]
    J --> K["返回结果\n路径 + 分数"]
    L["特征缓存\n内存/Redis"] -.-> F
    L -.-> G`,
            tip: "对于大规模视频库，建议将视频特征预先计算并缓存到 Redis 或本地文件中，检索时只需加载文本查询向量和执行 FAISS 搜索，延迟可控制在 10ms 以内",
            warning: "视频解码是最耗时的步骤之一，decord 在处理损坏视频时会抛出异常，务必加入异常处理和超时机制"
        }
    ],
};
