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
        title: "1. 视频表示学习",
        body: `视频表示学习是视频理解任务的基础，目标是将包含时间维度的视频数据编码为紧凑且具有语义信息的向量表示。与静态图像不同，视频同时包含空间信息（每一帧的视觉内容）和时间信息（帧间的动态变化），因此视频表示学习需要同时捕获这两个维度。

目前主流的视频表示方法可以分为三类：基于 2D CNN 的方法、基于 3D CNN 的方法、以及基于 Transformer 的方法。2D CNN 方法对每一帧独立提取特征后再做时间池化，计算效率高但时间建模能力有限。3D CNN 方法（如 C3D、I3D、SlowFast）直接在时空三维卷积核上操作，能够捕获短时动态，但参数量和计算成本较高。Vision Transformer 方法（如 Video Swin Transformer、TimeSformer）将自注意力机制扩展到时间维度，在大规模数据集上展现出最强的表示能力。

视频表示学习面临的核心挑战之一是时间尺度的多样性。一个动作可能持续几帧（如眨眼），也可能持续数十秒（如做饭）。好的视频表示需要在多个时间粒度上都能提取有意义的特征。SlowFast 网络通过双路径架构解决了这一问题：慢路径以低帧率捕获空间语义，快路径以高帧率捕获快速运动，两者通过侧向连接进行信息融合。

另一个重要挑战是视频数据的计算开销。一段 30 秒 30fps 的视频包含 900 帧，即使只采样其中的一部分，处理量也远超单张图像。因此，视频表示学习中的帧采样策略、时间感受野设计和计算优化都是实际应用中不可忽视的工程问题。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VideoRepresentation3D(nn.Module):
    """基于 3D CNN 的视频表示学习
    使用时空卷积核同时捕获空间和时间特征
    """

    def __init__(self, num_classes: int = 400, backbone: str = "resnet3d"):
        super().__init__()
        # 3D 卷积骨干网络
        self.stem = nn.Sequential(
            nn.Conv3d(3, 64, kernel_size=(3, 7, 7), stride=(1, 2, 2),
                      padding=(1, 3, 3), bias=False),
            nn.BatchNorm3d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool3d(kernel_size=(1, 3, 3), stride=(1, 2, 2),
                         padding=(0, 1, 1))
        )

        # 残差块 (简化表示)
        self.layer1 = self._make_layer(64, 64, blocks=3, stride=1)
        self.layer2 = self._make_layer(64, 128, blocks=4, stride=2)
        self.layer3 = self._make_layer(128, 256, blocks=6, stride=2)
        self.layer4 = self._make_layer(256, 512, blocks=3, stride=2)

        # 分类头
        self.avgpool = nn.AdaptiveAvgPool3d((1, 1, 1))
        self.fc = nn.Linear(512, num_classes)

    def _make_layer(self, in_channels: int, out_channels: int,
                    blocks: int, stride: int) -> nn.Sequential:
        layers = [self._basic_block(in_channels, out_channels, stride)]
        for _ in range(1, blocks):
            layers.append(self._basic_block(out_channels, out_channels, 1))
        return nn.Sequential(*layers)

    def _basic_block(self, in_ch: int, out_ch: int, stride: int) -> nn.Module:
        return nn.Sequential(
            nn.Conv3d(in_ch, out_ch, kernel_size=(3, 3, 3),
                      stride=(1, stride, stride), padding=1, bias=False),
            nn.BatchNorm3d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv3d(out_ch, out_ch, kernel_size=(3, 3, 3),
                      stride=1, padding=1, bias=False),
            nn.BatchNorm3d(out_ch),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """输入: [B, C, T, H, W] 输出: [B, num_classes]"""
        x = self.stem(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        return self.fc(x)`
          },
          {
            lang: "python",
            code: `# 帧采样策略对比
import torch
import numpy as np

class FrameSampler:
    """视频帧采样策略实现
    不同采样策略对视频表示质量有显著影响
    """

    @staticmethod
    def uniform_sample(total_frames: int, num_frames: int) -> list[int]:
        """均匀采样：等间隔抽取帧
        优点: 覆盖整个视频，适合长视频
        缺点: 可能错过关键动作瞬间
        """
        indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
        return indices.tolist()

    @staticmethod
    def random_sample(total_frames: int, num_frames: int) -> list[int]:
        """随机采样：随机抽取帧（训练时使用）
        优点: 数据增强效果，提高泛化
        缺点: 可能采样到无信息量的帧
        """
        return sorted(np.random.choice(total_frames, num_frames,
                                        replace=False).tolist())

    @staticmethod
    def segment_sample(total_frames: int, num_frames: int) -> list[int]:
        """分段采样：每段随机取一帧
        优点: 兼顾覆盖性和随机性
        缺点: 实现稍复杂
        """
        segment_size = total_frames // num_frames
        indices = []
        for i in range(num_frames):
            start = i * segment_size
            end = min((i + 1) * segment_size, total_frames)
            indices.append(np.random.randint(start, end))
        return indices

    @staticmethod
    def dense_sample(total_frames: int, num_frames: int,
                     num_clips: int = 10) -> list[list[int]]:
        """密集采样：多次偏移采样（测试时使用）
        优点: 最全面，精度最高
        缺点: 计算量 num_clips 倍增长
        """
        clips = []
        stride = max(total_frames - num_frames, 1) // num_clips
        for i in range(num_clips):
            start = i * stride
            indices = np.linspace(start, min(start + num_frames - 1,
                            total_frames - 1), num_frames, dtype=int)
            clips.append(indices.tolist())
        return clips

# 采样策略选择建议:
# 训练阶段: segment_sample (兼顾覆盖与增强)
# 测试阶段: dense_sample (追求精度)
# 实时推理: uniform_sample (追求速度)`
          }
        ],
        table: {
          headers: ["模型", "架构", "参数量", "Kinetics-400 Top-1", "FLOPs (G)", "特点"],
          rows: [
            ["C3D", "3D CNN", "60M", "72.8%", "38", "首个成功3D卷积网络"],
            ["I3D", "3D CNN", "28M", "80.7%", "30", "双流架构+ImageNet预训练"],
            ["SlowFast", "3D CNN", "36M", "81.8%", "52", "双路径快慢网络"],
            ["TimeSformer", "Transformer", "121M", "79.6%", "68", "分离时空自注意力"],
            ["Video Swin", "Transformer", "88M", "84.9%", "103", "层级化窗口注意力"],
            ["X3D", "3D CNN", "4M", "79.1%", "2", "高效移动端架构"]
          ]
        },
        mermaid: `graph TD
    A["输入视频\n[T, H, W, C]"] --> B{"特征提取方式"}
    B --> C["2D CNN\n逐帧提取"]
    B --> D["3D CNN\n时空卷积"]
    B --> E["Transformer\n自注意力"]
    C --> C1["时间池化\nAvg/Max/LSTM"]
    D --> D1["SlowFast\n双路径融合"]
    E --> E1["时空注意力\n分解/联合"]
    C1 --> F["视频表示\n[D 维向量]"]
    D1 --> F
    E1 --> F
    F --> G["下游任务\n分类/检测/检索"]`,
        tip: "对于资源受限的场景，X3D 系列提供了从 XS 到 XL 的多尺度模型，在精度和计算成本之间灵活取舍",
        warning: "3D 卷积的内存消耗随时间维度线性增长，处理超过 64 帧的视频时务必使用梯度累积或减小 batch size"
      },
      {
        title: "2. 视频-文本预训练",
        body: `视频-文本预训练（Video-Text Pre-training）旨在通过学习大规模视频-文本对，获得通用的跨模态视频理解能力。与纯视觉预训练不同，视频-文本预训练同时利用视觉信号和语言信号，使模型能够理解视频中发生的动作、物体、场景及其与语言描述的对应关系。

预训练范式的发展经历了三个主要阶段：对比学习阶段、掩码建模阶段、以及生成式预训练阶段。对比学习方法（如 CLIP4Clip、Frozen in Time）使用 InfoNCE 损失对齐视频和文本嵌入，使语义相关的视频-文本对在共享空间中靠近。掩码建模方法（如 VideoMAE、BEVT）则通过掩码视频片段或文本 token，训练模型重建被遮蔽的内容，学习更深层的语义表示。

生成式预训练是当前的主流方向。通过将视频理解为 token 序列（通过视觉量化器如 VQGAN），模型可以使用类似语言模型的架构（如 Transformer Decoder）进行自回归生成。这种方法的优势在于统一了理解和生成的框架，同一个模型既可以判断视频-文本匹配度，也可以根据文本生成视频描述。

预训练数据规模是决定模型能力的关键因素。WebVid-2.5M 包含 250 万个 YouTube 视频-文本对，HowTo100M 包含约 130 万个烹饪教学视频，而 LAION-5B 虽然以图像为主但也包含大量视频数据。大规模、多样化的预训练数据是模型获得零样本泛化能力的基础。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VideoTextContrastive(nn.Module):
    """视频-文本对比学习预训练
    扩展 CLIP 架构到视频模态
    """

    def __init__(self, video_encoder, text_encoder,
                 video_dim: int = 512, text_dim: int = 512,
                 shared_dim: int = 512, temperature: float = 0.07):
        super().__init__()
        self.video_encoder = video_encoder
        self.text_encoder = text_encoder

        # 投影到共享空间
        self.video_proj = nn.Linear(video_dim, shared_dim)
        self.text_proj = nn.Linear(text_dim, shared_dim)

        # 可学习温度参数
        self.logit_scale = nn.Parameter(torch.tensor(
            torch.log(torch.tensor(1.0 / temperature))
        ))

    def forward(self, videos: torch.Tensor, texts: torch.Tensor,
                video_masks: torch.Tensor = None):
        """
        videos: [B, T, C, H, W]
        texts: [B, L] tokenized text
        video_masks: [B] 有效帧掩码（可选）
        """
        # 视频编码
        video_features = self.video_encoder(videos)  # [B, D_v]
        video_features = F.normalize(self.video_proj(video_features), dim=-1)

        # 文本编码
        text_features = self.text_encoder(texts)  # [B, D_t]
        text_features = F.normalize(self.text_proj(text_features), dim=-1)

        # 相似度矩阵
        scale = self.logit_scale.exp()
        logits = scale * video_features @ text_features.T  # [B, B]

        # 对称对比损失
        batch_size = video_features.size(0)
        labels = torch.arange(batch_size, device=video_features.device)
        loss_video = F.cross_entropy(logits, labels)
        loss_text = F.cross_entropy(logits.T, labels)

        return (loss_video + loss_text) / 2

    def get_similarity(self, videos: torch.Tensor, texts: torch.Tensor):
        """获取视频-文本相似度"""
        vf = F.normalize(self.video_proj(self.video_encoder(videos)), dim=-1)
        tf = F.normalize(self.text_proj(self.text_encoder(texts)), dim=-1)
        return (vf @ tf.T) * self.logit_scale.exp()`
          },
          {
            lang: "python",
            code: `# 视频-文本掩码建模
import torch
import torch.nn as nn
import torch.nn.functional as F

class VideoMaskedModeling(nn.Module):
    """视频掩码建模预训练
    掩码视频片段和文本token，训练模型重建
    """

    def __init__(self, video_encoder_dim: int = 768,
                 text_vocab_size: int = 30522,
                 num_patches: int = 196,
                 mask_ratio: float = 0.4):
        super().__init__()
        self.mask_ratio = mask_ratio

        # 视频掩码重建头
        self.video_decoder = nn.Sequential(
            nn.LayerNorm(video_encoder_dim),
            nn.Linear(video_encoder_dim, video_encoder_dim * 4),
            nn.GELU(),
            nn.Linear(video_encoder_dim * 4, video_encoder_dim),
        )

        # 文本掩码预测头
        self.text_lm_head = nn.Sequential(
            nn.LayerNorm(video_encoder_dim),
            nn.Linear(video_encoder_dim, video_encoder_dim),
            nn.GELU(),
            nn.LayerNorm(video_encoder_dim),
            nn.Linear(video_encoder_dim, text_vocab_size),
        )

        # 跨模态注意力融合
        self.cross_attn = nn.MultiheadAttention(
            embed_dim=video_encoder_dim, num_heads=8, batch_first=True
        )

    def forward(self, video_features: torch.Tensor, text_ids: torch.Tensor,
                video_mask: torch.Tensor, text_mask: torch.Tensor):
        """
        video_features: [B, T*P, D] 视频patch特征
        text_ids: [B, L] 文本token
        video_mask: [B, T*P] 视频掩码 (1=masked)
        text_mask: [B, L] 文本掩码
        """
        # 跨模态交互
        text_masked = text_ids.clone()
        text_masked[text_mask.bool()] = 0  # 特殊token
        # 简化处理: 用编码器后的特征做交叉注意力
        # 实际中应该用完整的text embedding

        # 视频掩码重建
        video_recon = self.video_decoder(video_features * video_mask.unsqueeze(-1))

        # 文本掩码预测
        # 简化: 用交叉注意力增强后的特征
        attended, _ = self.cross_attn(
            video_features, video_features, video_features
        )
        text_logits = self.text_lm_head(attended.mean(dim=1, keepdim=True))

        return video_recon, text_logits

    def compute_loss(self, video_recon: torch.Tensor,
                     target_video: torch.Tensor,
                     text_logits: torch.Tensor,
                     target_text: torch.Tensor):
        """计算掩码重建损失"""
        # 视频MSE重建损失
        video_loss = F.mse_loss(video_recon, target_video)

        # 文本交叉熵损失
        text_loss = F.cross_entropy(
            text_logits.view(-1, text_logits.size(-1)),
            target_text.view(-1)
        )

        return video_loss + text_loss`
          }
        ],
        table: {
          headers: ["预训练方法", "代表模型", "训练目标", "数据规模", "下游迁移能力"],
          rows: [
            ["对比学习", "CLIP4Clip", "InfoNCE 图文匹配", "WebVid 2.5M", "零样本检索强"],
            ["掩码建模", "VideoMAE", "重建被掩码patch", "Kinetics 400K", "分类/检测强"],
            ["图文对齐", "Frozen in Time", "多任务联合训练", "WebVid+HowTo100M", "通用理解均衡"],
            ["生成式", "VideoCoCa", "对比+生成联合", "LAION-5B 子集", "描述生成强"],
            ["指令微调", "Video-LLaMA", "指令跟随对话", "WebVid+指令数据", "对话问答强"]
          ]
        },
        mermaid: `graph TD
    A["大规模视频文本对"] --> B{"预训练策略"}
    B --> C["对比学习\nInfoNCE"]
    B --> D["掩码建模\nMLM+MVM"]
    B --> E["生成式\n自回归"]
    C --> C1["视频文本\n嵌入对齐"]
    D --> D1["重建\n被掩码内容"]
    E --> E1["文本生成\n视频描述"]
    C1 --> F["通用视频语言\n表示模型"]
    D1 --> F
    E1 --> F
    F --> G["下游任务微调\n分类/检索/问答"]`,
        tip: "对比学习 + 掩码建模的联合预训练（多任务学习）通常优于单一目标，因为对比学习提供全局语义对齐，掩码建模提供细粒度理解",
        warning: "视频预训练的数据清洗至关重要，自动生成的视频-文本对（如 ASR 转写）包含大量噪声，直接使用会显著降低模型质量"
      },
      {
        title: "3. 视频问答（Video QA）",
        body: `视频问答（Video Question Answering, Video QA）是视频理解领域最具挑战性的任务之一，要求模型同时理解视频内容和自然语言问题，并生成准确的答案。这个问题涉及多模态推理：模型需要从视频中提取视觉信息，从问题中提取语义信息，然后将两者融合进行逻辑推理。

Video QA 可以分为多个子类型：基于动作的问答（什么动作正在发生？）、基于计数的问答（视频中有几个人？）、基于关系的问答（物体之间的空间关系是什么？）、以及基于因果的问答（为什么这个人做了那个动作？）。难度从低到高递增，从简单的视觉感知到复杂的因果推理。

当前主流的 Video QA 方法基于多模态 Transformer 架构。视频帧通过视觉编码器（如 CLIP 或 ViT）提取特征，问题通过语言编码器（如 BERT）提取特征，然后通过跨模态注意力机制进行信息融合。融合后的表示通过分类头或生成式解码器产生答案。

数据集方面，TGIF-QA 包含约 10 万个 GIF-问题对，MSRVTT-QA 基于 MSR-VTT 数据集构建了约 20 万个问答对，ActivityNet-QA 则包含 1 万个关于长视频中复杂活动的问答。不同数据集的侧重点各异，评估模型的泛化能力时需要在多个数据集上测试。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VideoQAModel(nn.Module):
    """基于 Transformer 的视频问答模型
    多模态融合: 视频特征 + 问题特征 -> 答案
    """

    def __init__(self, video_dim: int = 512, text_dim: int = 768,
                 hidden_dim: int = 512, num_heads: int = 8,
                 num_layers: int = 4, num_answers: int = 3000):
        super().__init__()

        # 模态投影
        self.video_proj = nn.Linear(video_dim, hidden_dim)
        self.text_proj = nn.Linear(text_dim, hidden_dim)

        # 可学习的位置编码
        self.video_pos = nn.Parameter(torch.randn(1, 64, hidden_dim))
        self.text_pos = nn.Parameter(torch.randn(1, 32, hidden_dim))

        # 跨模态 Transformer
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim, nhead=num_heads,
            dim_feedforward=hidden_dim * 4,
            dropout=0.1, batch_first=True
        )
        self.fusion_encoder = nn.TransformerEncoder(
            encoder_layer, num_layers=num_layers
        )

        # 答案分类头
        self.cls_token = nn.Parameter(torch.randn(1, 1, hidden_dim))
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.GELU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_dim, num_answers)
        )

    def forward(self, video_features: torch.Tensor,
                text_features: torch.Tensor,
                text_mask: torch.Tensor = None):
        """
        video_features: [B, T, D_v] T=帧数
        text_features:  [B, L, D_t] L=文本长度
        """
        B = video_features.size(0)

        # 投影到统一维度
        v = self.video_proj(video_features) + self.video_pos  # [B, T, D]
        t = self.text_proj(text_features) + self.text_pos     # [B, L, D]

        # 拼接 [CLS] token + 视频 + 文本
        cls_tokens = self.cls_token.expand(B, -1, -1)  # [B, 1, D]
        sequence = torch.cat([cls_tokens, v, t], dim=1)  # [B, 1+T+L, D]

        # Transformer 融合
        key_padding_mask = None
        if text_mask is not None:
            # 构造注意力掩码
            total_len = 1 + video_features.size(1) + text_features.size(1)
            text_len = text_features.size(1)
            padding = torch.zeros(B, 1 + video_features.size(1),
                                  dtype=torch.bool, device=video_features.device)
            key_padding_mask = torch.cat(
                [padding, ~text_mask.bool()], dim=1
            )

        fused = self.fusion_encoder(sequence,
                                     src_key_padding_mask=key_padding_mask)

        # 使用 [CLS] token 做分类
        cls_output = fused[:, 0, :]
        logits = self.classifier(cls_output)
        return logits`
          },
          {
            lang: "python",
            code: `# 多模态推理: 组合查询机制
import torch
import torch.nn as nn
import torch.nn.functional as F

class CompositionalReasoning(nn.Module):
    """组合推理模块
    将复杂问题分解为子问题，分别推理后组合
    适用于需要多步推理的 Video QA
    """

    def __init__(self, dim: int = 512, num_heads: int = 8):
        super().__init__()

        # 问题分解器: 将问题映射到多个子查询
        self.query_decomposer = nn.Linear(dim, dim * 4)

        # 每个子查询的视频注意力
        self.sub_attention = nn.ModuleList([
            nn.MultiheadAttention(dim, num_heads, batch_first=True)
            for _ in range(4)
        ])

        # 推理组合层
        self.reasoning = nn.Sequential(
            nn.Linear(dim * 4, dim * 2),
            nn.GELU(),
            nn.Dropout(0.1),
            nn.Linear(dim * 2, dim),
            nn.LayerNorm(dim),
        )

    def forward(self, question: torch.Tensor, video: torch.Tensor):
        """
        question: [B, D] 问题表示
        video: [B, T, D] 视频帧特征
        """
        B, T, D = video.size()

        # 分解为4个子查询
        sub_queries = self.query_decomposer(question)  # [B, 4D]
        sub_queries = sub_queries.view(B, 4, D)

        # 每个子查询独立关注视频的不同部分
        sub_outputs = []
        for i, attn in enumerate(self.sub_attention):
            query = sub_queries[:, i:i+1, :]  # [B, 1, D]
            attended, weights = attn(query, video, video)  # [B, 1, D]
            sub_outputs.append(attended.squeeze(1))

        # 组合所有子查询结果
        combined = torch.cat(sub_outputs, dim=-1)  # [B, 4D]
        reasoning_output = self.reasoning(combined)  # [B, D]

        return reasoning_output

# 推理可视化 (注意力权重):
# 子查询1: 关注 "人" -> 帧 5-15
# 子查询2: 关注 "动作" -> 帧 10-20
# 子查询3: 关注 "物体" -> 帧 8-25
# 子查询4: 关注 "场景" -> 全帧`
          }
        ],
        table: {
          headers: ["数据集", "问答数量", "视频数量", "问题类型", "答案类型", "平均难度"],
          rows: [
            ["TGIF-QA", "166K", "72K GIF", "动作/计数/状态", "选择/数字", "中等"],
            ["MSRVTT-QA", "204K", "10K 短视频", "通用理解", "开放/选择", "中等"],
            ["ActivityNet-QA", "97K", "10K 长视频", "复杂活动", "开放", "困难"],
            ["NExT-QA", "48K", "5K 视频", "因果/时序", "选择", "困难"],
            ["EgoSchema", "5K", "5K 第一人称", "细粒度推理", "选择", "极困难"],
            ["Video-MME", "2.7K", "900 视频", "多模态综合", "选择", "困难"]
          ]
        },
        mermaid: `graph TD
    A["输入视频\n[T, C, H, W]"] --> B["视觉编码器\nCLIP/ViT"]
    C["自然语言问题\n\"What is the person doing?\""] --> D["文本编码器\nBERT/LLM"]
    B --> E["视频特征\n[T, D]"]
    D --> F["问题特征\n[L, D]"]
    E --> G["跨模态注意力\nCross-Attention"]
    F --> G
    G --> H["融合表示\n[B, D]"]
    H --> I{"推理方式"}
    I --> J["分类头\nTop-K 答案"]
    I --> K["生成式解码器\n开放答案"]
    J --> L["答案"]
    K --> L`,
        tip: "组合推理（Compositional Reasoning）是提升 Video QA 性能的有效策略，将复杂问题分解为简单的子问题可以显著提高推理准确率，尤其是在 NExT-QA 等因果推理数据集上",
        warning: "Video QA 模型容易出现语言先验偏差（Language Prior Bias），即仅凭问题中的词汇就能猜出答案，而不真正理解视频内容。评估时务必使用视频打乱（video shuffling）等对抗性测试"
      },
      {
        title: "4. 视频描述生成（Video Captioning）",
        body: `视频描述生成（Video Captioning）是将视频内容自动转换为自然语言描述的任务。与视频问答不同，描述生成是开放式生成任务，没有固定的答案集合，模型需要生成流畅、准确、信息丰富的自然语言句子来概括视频内容。

视频描述生成的核心架构是编码器-解码器（Encoder-Decoder）框架。编码器将视频编码为固定长度的表示（或序列化的帧特征），解码器（通常是 LSTM 或 Transformer Decoder）自回归地生成描述文本。现代方法通常使用预训练视觉编码器提取视频特征，然后训练轻量级的语言解码器。

描述生成的评估面临独特的挑战。传统指标如 BLEU、ROUGE 和 METEOR 基于 n-gram 重叠，无法充分评估描述的语义准确性。CIDEr 和 SPICE 指标通过引入语义相似度和场景图匹配，提供了更接近人类判断的评估标准。然而，即使是这些指标也无法完全捕捉描述的流畅性和信息完整性。

当前的研究热点包括：稠密描述生成（为视频的不同片段生成不同的描述）、多粒度描述（同时生成一句话摘要和详细段落）、以及可控描述生成（根据风格、长度、详细程度等条件控制输出）。这些方向使视频描述生成从简单的"一句话概括"发展为更灵活、更实用的能力。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VideoCaptioning(nn.Module):
    """基于 Transformer 的视频描述生成模型
    编码器-解码器架构: 视频编码 -> 文本自回归生成
    """

    def __init__(self, video_dim: int = 512, vocab_size: int = 10000,
                 hidden_dim: int = 512, num_layers: int = 4,
                 num_heads: int = 8, max_length: int = 30):
        super().__init__()
        self.max_length = max_length

        # 视频特征投影
        self.video_proj = nn.Linear(video_dim, hidden_dim)

        # 词嵌入
        self.word_embedding = nn.Embedding(vocab_size, hidden_dim)

        # Transformer Decoder
        decoder_layer = nn.TransformerDecoderLayer(
            d_model=hidden_dim, nhead=num_heads,
            dim_feedforward=hidden_dim * 4,
            dropout=0.1, batch_first=True
        )
        self.decoder = nn.TransformerDecoder(decoder_layer, num_layers)

        # 输出投影
        self.output_head = nn.Linear(hidden_dim, vocab_size)

        # 位置编码
        self.pos_encoding = nn.Parameter(torch.randn(1, max_length + 1, hidden_dim))

    def forward(self, video_features: torch.Tensor,
                caption_ids: torch.Tensor):
        """训练阶段: teacher forcing
        video_features: [B, T, D]
        caption_ids: [B, L] 描述文本 token (含 <BOS>)
        """
        B, T, D = video_features.size()
        B, L = caption_ids.size()

        # 视频特征
        v = self.video_proj(video_features)  # [B, T, D]

        # 文本嵌入
        t = self.word_embedding(caption_ids)  # [B, L, D]
        t = t + self.pos_encoding[:, :L, :]

        # 因果注意力掩码 (防止看到未来的词)
        tgt_mask = nn.Transformer.generate_square_subsequent_mask(L).to(
            video_features.device
        )

        # Transformer Decoder
        output = self.decoder(t, v.expand(B, -1, -1),
                              tgt_mask=tgt_mask)  # [B, L, D]

        # 预测下一个词
        logits = self.output_head(output)  # [B, L, V]
        return logits

    def generate(self, video_features: torch.Tensor,
                 max_length: int = 30, method: str = "beam_search"):
        """推理阶段: 自回归生成
        支持 greedy / beam_search 两种解码策略
        """
        if method == "greedy":
            return self._greedy_decode(video_features, max_length)
        elif method == "beam_search":
            return self._beam_search(video_features, max_length, beam_size=5)

    def _greedy_decode(self, video_features: torch.Tensor,
                       max_length: int) -> list[int]:
        """贪心解码"""
        B = video_features.size(0)
        v = self.video_proj(video_features)
        generated = torch.zeros(B, 1, dtype=torch.long,
                                device=video_features.device)  # <BOS>

        for _ in range(max_length - 1):
            t = self.word_embedding(generated) + self.pos_encoding[:, :generated.size(1), :]
            output = self.decoder(t, v,
                                  tgt_mask=nn.Transformer.generate_square_subsequent_mask(
                                      generated.size(1)).to(video_features.device))
            logits = self.output_head(output[:, -1:, :])
            next_token = logits.argmax(dim=-1)
            generated = torch.cat([generated, next_token], dim=1)

        return generated`
          },
          {
            lang: "python",
            code: `# Beam Search 解码实现
import torch
import torch.nn.functional as F

class BeamSearchDecoder:
    """集束搜索解码器
    维护 K 个候选序列，每步选择最可能的 K 个扩展
    相比贪心搜索能生成更高质量的描述
    """

    def __init__(self, model, vocab_size: int, beam_size: int = 5,
                 max_length: int = 30, eos_token: int = 2):
        self.model = model
        self.vocab_size = vocab_size
        self.beam_size = beam_size
        self.max_length = max_length
        self.eos_token = eos_token

    def decode(self, video_features: torch.Tensor) -> list[dict]:
        """执行 beam search 返回 top-k 候选
        返回: [{"sequence": [...], "score": float}, ...]
        """
        B = video_features.size(0)
        assert B == 1, "Beam search 一次处理一个视频"

        v = self.model.video_proj(video_features)  # [1, T, D]

        # 初始化: 只有 <BOS> token
        beams = [{
            "sequence": [0],  # <BOS>
            "log_prob": 0.0,
            "finished": False
        }]

        for step in range(self.max_length - 1):
            candidates = []

            for beam in beams:
                if beam["finished"]:
                    candidates.append(beam)
                    continue

                # 用当前序列做前向传播
                seq_tensor = torch.tensor([beam["sequence"]],
                                          device=video_features.device)
                t = self.model.word_embedding(seq_tensor)
                t = t + self.model.pos_encoding[:, :len(beam["sequence"]), :]

                tgt_mask = nn.Transformer.generate_square_subsequent_mask(
                    len(beam["sequence"])).to(video_features.device)
                output = self.model.decoder(t, v, tgt_mask=tgt_mask)
                logits = self.model.output_head(output[:, -1, :])
                log_probs = F.log_softmax(logits, dim=-1).squeeze(0)

                # 取 top-k 候选词
                top_k_probs, top_k_indices = log_probs.topk(self.beam_size)

                for prob, idx in zip(top_k_probs, top_k_indices):
                    idx_item = idx.item()
                    new_log_prob = beam["log_prob"] + prob.item()
                    new_seq = beam["sequence"] + [idx_item]

                    candidates.append({
                        "sequence": new_seq,
                        "log_prob": new_log_prob / len(new_seq),  # 长度归一化
                        "finished": idx_item == self.eos_token
                    })

            # 选择 top-k 候选
            candidates.sort(key=lambda x: x["log_prob"], reverse=True)
            beams = candidates[:self.beam_size]

            # 如果所有 beam 都结束，提前退出
            if all(b["finished"] for b in beams):
                break

        return beams[:self.beam_size]`
          }
        ],
        table: {
          headers: ["评估指标", "计算方式", "取值范围", "优势", "劣势"],
          rows: [
            ["BLEU-4", "4-gram 精确率", "[0, 1]", "计算简单快速", "忽略语义，只看重叠"],
            ["ROUGE-L", "最长公共子序列", "[0, 1]", "考虑句子结构", "对措辞变化敏感"],
            ["METEOR", "同义词+词干匹配", "[0, 1]", "考虑语义相似性", "依赖外部词典"],
            ["CIDEr", "TF-IDF 加权 n-gram", "[0, inf]", "强调信息量大的词", "对参考描述质量依赖大"],
            ["SPICE", "场景图匹配", "[0, 1]", "评估语义结构", "计算复杂，速度慢"]
          ]
        },
        mermaid: `graph TD
    A["输入视频\n[T, C, H, W]"] --> B["视频编码器\nResNet/ViT"]
    B --> C["帧特征序列\n[T, D]"]
    C --> D["特征投影\nLinear + Norm"]
    E["<BOS>"] --> F["Transformer Decoder"]
    D --> F
    F --> G["下一个词\n概率分布"]
    G --> H{"解码策略"}
    H --> I["Greedy\n选最高概率"]
    H --> J["Beam Search\n维护K个候选"]
    I --> K["生成描述"]
    J --> K
    G -->|"直到 <EOS>"| F`,
        tip: "使用 Beam Search（beam_size=5）通常比 Greedy 解码生成的描述质量更高，CIDEr 分数可提升 3-5 个百分点，但推理速度慢 K 倍",
        warning: "描述生成模型容易陷入重复生成的问题（如 'a man is a man is...'），训练时加入 coverage loss 或重复惩罚可以有效缓解"
      },
      {
        title: "5. 时序定位（Temporal Grounding）",
        body: `时序定位（Temporal Grounding / Temporal Localization）是指在视频中精确定位与给定文本查询对应的时间片段。例如，给定查询"这个人打开冰箱"，模型需要返回视频中该动作发生的起止时间（如 [12.5s, 18.3s]）。

时序定位是视频理解中最精细的任务之一，因为它不仅需要理解视频内容和语言查询的语义，还需要在连续的时间轴上做出精确的定位决策。与视频分类（一个标签描述整个视频）和视频问答（一个答案描述整个视频的理解）不同，时序定位要求模型在时间维度上具有精细的分辨能力。

主流方法可以分为两大类：基于候选框的方法和密集预测方法。基于候选框的方法先生成一组候选时间片段（proposals），然后对每个候选片段计算与文本查询的匹配度，选择匹配度最高的作为定位结果。密集预测方法则将时间定位视为逐帧（或逐片段）的分类问题，直接为每个时间单元预测其与查询的相关性。

自然语言查询的复杂性是时序定位的主要挑战。查询可能涉及多个动作的组合（"先打开冰箱然后拿出一瓶牛奶"）、相对位置描述（"在蓝色汽车旁边的时刻"）、甚至是需要推理的信息（"在事故发生前的瞬间"）。这些复杂查询要求模型具备深层的语言理解和时序推理能力。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class TemporalGrounding(nn.Module):
    """基于候选框的视频时序定位模型
    生成候选片段 -> 多模态匹配 -> 精确定位
    """

    def __init__(self, video_dim: int = 512, text_dim: int = 768,
                 hidden_dim: int = 256, num_proposals: int = 100):
        super().__init__()
        self.num_proposals = num_proposals

        # 视频时序编码器
        self.video_encoder = nn.TransformerEncoderLayer(
            d_model=hidden_dim, nhead=8,
            dim_feedforward=hidden_dim * 4, batch_first=True
        )

        # 文本编码器
        self.text_proj = nn.Linear(text_dim, hidden_dim)

        # 候选片段生成器
        self.anchor_generator = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim * 2),
            nn.ReLU(),
            nn.Linear(hidden_dim * 2, hidden_dim)
        )

        # 多模态匹配模块
        self.cross_attn = nn.MultiheadAttention(
            hidden_dim, num_heads=8, batch_first=True
        )

        # 边界框回归头
        self.bbox_head = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 2)  # [start_offset, end_offset]
        )

        # 匹配分数头
        self.match_head = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1)
        )

    def forward(self, video_features: torch.Tensor,
                text_features: torch.Tensor):
        """
        video_features: [B, T, D_v]
        text_features:  [B, D_t]
        """
        B, T, _ = video_features.size()

        # 视频时序编码
        v = video_features  # 简化: 直接投影
        # 实际中应该做时序编码

        # 文本投影
        t = self.text_proj(text_features).unsqueeze(1)  # [B, 1, D]

        # 跨模态注意力
        cross_feat, _ = self.cross_attn(t, v, v)  # [B, 1, D]

        # 生成候选片段中心
        centers = torch.linspace(0, T - 1, self.num_proposals,
                                 device=video_features.device)
        centers = centers.unsqueeze(0).expand(B, -1)  # [B, N]

        # 为每个候选片段计算匹配分数
        # 简化: 用跨模态特征作为查询
        proposals = cross_feat.expand(B, self.num_proposals, -1)  # [B, N, D]

        # 匹配分数
        match_input = torch.cat([
            proposals,
            cross_feat.expand(-1, self.num_proposals, -1)
        ], dim=-1)
        match_scores = self.match_head(match_input).squeeze(-1)  # [B, N]

        # 边界框回归 (相对于中心的偏移)
        bbox_offsets = self.bbox_head(match_input)  # [B, N, 2]

        return {
            "centers": centers,
            "offsets": bbox_offsets,
            "scores": match_scores
        }

    def compute_loss(self, pred: dict, gt_spans: torch.Tensor,
                     gt_labels: torch.Tensor):
        """计算定位损失"""
        # IoU 损失
        pred_spans = self._decode_spans(pred)  # [B, N, 2]
        iou_loss = self._iou_loss(pred_spans, gt_spans)

        # 分类损失
        cls_loss = F.binary_cross_entropy_with_logits(
            pred["scores"], gt_labels
        )

        return iou_loss + cls_loss`
          },
          {
            lang: "python",
            code: `# 密集预测: 逐帧相关性预测
import torch
import torch.nn as nn

class DenseTemporalGrounding(nn.Module):
    """密集时序定位: 直接为每个时间步预测相关性
    无需候选片段生成，端到端训练
    """

    def __init__(self, video_dim: int = 512, text_dim: int = 768,
                 hidden_dim: int = 256):
        super().__init__()

        # 多模态融合
        self.fusion = nn.TransformerEncoderLayer(
            d_model=hidden_dim, nhead=8, batch_first=True
        )

        # 视频/文本投影
        self.video_proj = nn.Linear(video_dim, hidden_dim)
        self.text_proj = nn.Linear(text_dim, hidden_dim)

        # 多层级特征
        self.multi_scale = nn.ModuleList([
            nn.Conv1d(hidden_dim, hidden_dim, kernel_size=k,
                      padding=k // 2)
            for k in [3, 5, 7, 9]
        ])

        # 预测头
        self.start_head = nn.Sequential(
            nn.Linear(hidden_dim * 5, hidden_dim * 2),
            nn.ReLU(),
            nn.Linear(hidden_dim * 2, 1)
        )
        self.end_head = nn.Sequential(
            nn.Linear(hidden_dim * 5, hidden_dim * 2),
            nn.ReLU(),
            nn.Linear(hidden_dim * 2, 1)
        )
        self.match_head = nn.Sequential(
            nn.Linear(hidden_dim * 5, hidden_dim * 2),
            nn.ReLU(),
            nn.Linear(hidden_dim * 2, 1)
        )

    def forward(self, video_features: torch.Tensor,
                text_features: torch.Tensor,
                text_mask: torch.Tensor = None):
        """
        video_features: [B, T, D_v]
        text_features:  [B, D_t]
        """
        B, T, _ = video_features.size()

        # 投影
        v = self.video_proj(video_features)  # [B, T, D]
        t = self.text_proj(text_features).unsqueeze(1).expand(-1, T, -1)

        # 融合
        fused = v + t
        fused = self.fusion(fused)  # [B, T, D]

        # 多尺度特征
        fused_t = fused.transpose(1, 2)  # [B, D, T]
        multi_feats = [fused]  # 原始特征
        for conv in self.multi_scale:
            feat = conv(fused_t).transpose(1, 2)  # [B, T, D]
            multi_feats.append(feat)

        combined = torch.cat(multi_feats, dim=-1)  # [B, T, 5D]

        # 预测
        start_logits = self.start_head(combined).squeeze(-1)  # [B, T]
        end_logits = self.end_head(combined).squeeze(-1)
        match_logits = self.match_head(combined).squeeze(-1)

        return {
            "start": start_logits,
            "end": end_logits,
            "match": match_logits
        }

    def decode(self, output: dict, threshold: float = 0.5):
        """从预测中解码时间片段"""
        start_probs = torch.sigmoid(output["start"])
        end_probs = torch.sigmoid(output["end"])
        match_probs = torch.sigmoid(output["match"])

        # 找到最佳 start 和 end
        start_idx = start_probs.argmax(dim=-1)
        end_idx = end_probs.argmax(dim=-1)
        confidence = match_probs.max(dim=-1).values

        return {
            "spans": torch.stack([start_idx, end_idx], dim=-1),
            "confidence": confidence
        }`
          }
        ],
        table: {
          headers: ["方法", "架构", "定位方式", "Charades-STA R1@0.5", "ActivityNet R1@0.5", "速度"],
          rows: [
            ["2D-TAN", "2D 时空注意力", "候选片段", "39.2%", "28.1%", "快"],
            ["VSLNet", "双向注意力", "边界预测", "47.5%", "31.2%", "快"],
            ["QD-DETR", "DETR 风格", "直接集合预测", "53.1%", "38.7%", "中"],
            ["UVCOM", "多粒度特征", "密集预测", "55.8%", "42.3%", "中"],
            ["Moment-DETR", "Transformer", "直接预测", "52.6%", "40.1%", "快"],
            ["CG-DETR", "跨粒度对齐", "直接集合预测", "58.2%", "45.6%", "中"]
          ]
        },
        mermaid: `graph TD
    A["输入视频\nT 帧"] --> B["帧特征提取"]
    C["自然语言查询"] --> D["文本编码"]
    B --> E["时序特征\n[T, D]"]
    D --> F["查询向量\n[D]"]
    E --> G{"定位策略"}
    F --> G
    G --> H["候选片段法\nProposal + Scoring"]
    G --> I["密集预测法\n逐帧分类"]
    G --> J["直接集合法\nDETR 风格"]
    H --> K["片段边界\n[start, end]"]
    I --> K
    J --> K
    K --> L["置信度过滤"]
    L --> M["最终定位结果"]`,
        tip: "密集预测方法相比候选片段方法训练更稳定，不需要调整候选片段生成的超参数，在小数据集上表现更好",
        warning: "时序定位的 IoU 阈值选择对评估结果影响巨大，同一模型在 R1@0.3 和 R1@0.7 的指标可能相差 30 个百分点以上，报告结果时必须注明阈值"
      },
      {
        title: "6. 多模态大模型视频模态",
        body: `多模态大语言模型（MLLM）的视频模态扩展是当前 AI 领域最活跃的研究方向之一。以 LLaVA、Qwen-VL、InternVL 为代表的图像-语言大模型已经证明了大模型在多模态理解上的强大能力，而将这些能力扩展到视频模态则需要解决一系列独特的技术挑战。

视频模态扩展面临的首要挑战是 token 数量爆炸。一张 336x336 的图像经过 ViT 编码产生约 576 个 token，而一个 30 帧的视频则产生约 17,280 个 token。这种规模的输入远超大多数语言模型的上下文窗口限制，也使得自注意力计算的成本（O(N^2)）变得不可接受。

解决 token 膨胀问题主要有三种策略：时间池化（Temporal Pooling）将连续帧的特征聚合为更少的表示，压缩令牌（Token Compression）通过聚类或注意力机制将冗余 token 合并，以及分层处理（Hierarchical Processing）先做帧级理解再做时序推理。每种策略在信息保留和计算效率之间做出不同的权衡。

另一个重要挑战是时序推理能力。语言模型天然擅长处理离散符号序列，但对连续时间信号的理解是短板。视频中的因果关系、动作顺序、持续时间等时序概念需要模型具备额外的归纳偏置或显式的时序建模能力。当前的解决方案包括引入时间位置编码、时序注意力模块、以及专门的时序推理训练数据。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VideoMLLM(nn.Module):
    """视频多模态大语言模型
    视频编码器 + 投影层 + 大语言模型
    核心挑战: 减少视频 token 数量
    """

    def __init__(self, video_encoder, llm_model,
                 video_dim: int = 1024, llm_dim: int = 4096,
                 num_frames: int = 32, compression_ratio: float = 0.25):
        super().__init__()
        self.video_encoder = video_encoder
        self.llm = llm_model

        # 视频-语言投影层
        self.video_proj = nn.Sequential(
            nn.Linear(video_dim, llm_dim),
            nn.GELU(),
            nn.Linear(llm_dim, llm_dim)
        )

        # 时间压缩模块
        self.temporal_compressor = nn.TransformerEncoderLayer(
            d_model=llm_dim, nhead=16,
            dim_feedforward=llm_dim * 4, batch_first=True
        )
        self.compression_ratio = compression_ratio

        # 时间位置编码
        self.temporal_pos = nn.Parameter(
            torch.randn(num_frames, llm_dim) * 0.02
        )

    def compress_video_tokens(self, video_tokens: torch.Tensor):
        """时间压缩: 将 T 个 token 压缩到 T*ratio 个
        使用 Transformer 编码器 + 选择关键 token
        """
        B, T, D = video_tokens.size()

        # 时序编码
        compressed = self.temporal_compressor(video_tokens)

        # 基于注意力权重选择关键 token
        query = compressed.mean(dim=1, keepdim=True)  # [B, 1, D]
        attn_weights = F.softmax(
            query @ compressed.transpose(1, 2) / (D ** 0.5),
            dim=-1
        )  # [B, 1, T]

        # 选择 top-k 关键帧
        k = max(1, int(T * self.compression_ratio))
        top_k = attn_weights.squeeze(1).topk(k, dim=-1).indices  # [B, k]

        # 收集选中的 token
        batch_indices = torch.arange(B).unsqueeze(1).expand(-1, k)
        selected_tokens = compressed[batch_indices, top_k]  # [B, k, D]

        return selected_tokens

    def forward(self, video: torch.Tensor, text: str):
        """前向传播
        video: [B, T, C, H, W]
        """
        B, T, C, H, W = video.size()

        # 视频编码
        frame_tokens = self.encode_frames(video)  # [B, T, D_v]

        # 投影到 LLM 维度
        projected = self.video_proj(frame_tokens)  # [B, T, D_llm]
        projected = projected + self.temporal_pos[:T, :].unsqueeze(0)

        # 时间压缩
        compressed = self.compress_video_tokens(projected)  # [B, k, D_llm]

        # 拼接文本 prompt
        # 实际中需要 tokenizer 和 proper formatting
        llm_input = compressed  # 简化: 只传视频 token
        llm_output = self.llm(inputs_embeds=llm_input)

        return llm_output

    def encode_frames(self, video: torch.Tensor):
        """逐帧编码视频"""
        B, T, C, H, W = video.size()
        frames = video.view(B * T, C, H, W)
        frame_features = self.video_encoder(frames)
        return frame_features.view(B, T, -1)`
          },
          {
            lang: "python",
            code: `# 视频 token 压缩策略对比
import torch
import torch.nn as nn

class TokenCompressionStrategies:
    """对比不同的视频 token 压缩方法"""

    @staticmethod
    def temporal_pooling(tokens: torch.Tensor, pool_size: int = 2):
        """时间池化: 简单有效
        将相邻帧的特征取平均
        压缩比: 1/pool_size
        """
        B, T, D = tokens.size()
        new_T = T // pool_size
        tokens = tokens[:, :new_T * pool_size, :]
        tokens = tokens.view(B, new_T, pool_size, D)
        return tokens.mean(dim=2)  # [B, new_T, D]

    @staticmethod
    def q_former_compression(tokens: torch.Tensor,
                             num_queries: int = 32):
        """Q-Former 风格压缩
        使用可学习的查询 token 从视频 token 中提取信息
        压缩比: num_queries / T
        """
        B, T, D = tokens.size()

        # 可学习查询
        queries = nn.Parameter(torch.randn(1, num_queries, D))

        # 交叉注意力: queries 作为 Q, tokens 作为 K,V
        q_proj = nn.Linear(D, D)(queries)
        k_proj = nn.Linear(D, D)(tokens)
        v_proj = nn.Linear(D, D)(tokens)

        attn = F.softmax(
            q_proj @ k_proj.transpose(-2, -1) / (D ** 0.5),
            dim=-1
        )
        compressed = attn @ v_proj  # [B, num_queries, D]
        return compressed

    @staticmethod
    def spatial_temporal_pooling(tokens: torch.Tensor,
                                 spatial_per_frame: int = 256,
                                 temporal_factor: int = 2):
        """时空联合池化
        先空间池化再时间池化
        """
        B, T, D = tokens.size()
        # 假设 D = spatial_dim * channel
        # 实际中 tokens 已经是展平的空间-通道维度

        # 简化的时空池化
        pool_T = T // temporal_factor
        tokens = tokens.view(B, pool_T, temporal_factor, D)
        return tokens.mean(dim=2)

    @staticmethod
    def eva_compression(tokens: torch.Tensor,
                       target_tokens: int = 64):
        """EVA 风格压缩
        基于 token 重要性评估的自适应压缩
        """
        B, T, D = tokens.size()

        # 计算 token 重要性 (方差作为代理)
        importance = tokens.var(dim=-1)  # [B, T]

        # 归一化重要性
        importance = importance / (importance.sum(dim=-1, keepdim=True) + 1e-8)

        # 采样
        if target_tokens >= T:
            return tokens

        # 选择最重要的 token
        top_k = importance.topk(target_tokens, dim=-1).indices  # [B, k]
        batch_idx = torch.arange(B).unsqueeze(1).expand(-1, target_tokens)
        return tokens[batch_idx, top_k]

# 压缩策略对比 (32帧 -> 8token):
# Temporal Pooling:     保留时序趋势, 丢失帧细节
# Q-Former:             信息保留最好, 需训练查询
# Spatio-Temporal Pool: 计算最轻量, 精度最低
# EVA Adaptive:         平衡信息保留和效率`
          }
        ],
        table: {
          headers: ["模型", "视频编码器", "LLM 基座", "Token 压缩", "上下文窗口", "视频最大时长"],
          rows: [
            ["Video-LLaVA", "CLIP + ViT", "Vicuna-7B", "时间池化 2x", "4K", "~30 秒"],
            ["LLaVA-VID", "CLIP ViT-L", "Vicuna-13B", "Q-Former 压缩", "4K", "~60 秒"],
            ["VideoChat2", "EVA-CLIP", "LLaMA-2-7B", "时空池化", "4K", "~120 秒"],
            ["Qwen2-VL", "ViT", "Qwen2-7B", "动态分辨率", "32K", "~30 分钟"],
            ["InternVL2", "InternViT", "InternLM2", "自适应压缩", "8K", "~5 分钟"],
            ["Llama-3.2-Vision", "ViT", "Llama-3.2", "时间采样", "128K", "~10 分钟"]
          ]
        },
        mermaid: `graph TD
    A["长视频\nT 帧"] --> B["帧级编码\nViT per frame"]
    B --> C["原始 Token\nT x 576"]
    C --> D{"压缩策略"}
    D --> E["时间池化\nAvg/Max"]
    D --> F["Q-Former\n可学习查询"]
    D --> G["自适应选择\n重要性采样"]
    E --> H["压缩 Token\nK 个"]
    F --> H
    G --> H
    H --> I["投影到 LLM 空间"]
    I --> J["拼接文本 Prompt"]
    J --> K["LLM 自注意力"]
    K --> L["输出\n理解/推理/生成"]`,
        tip: "Qwen2-VL 的动态分辨率策略（Naive Dynamic Resolution）是当前处理任意长度视频的最佳实践，它根据视频分辨率自适应调整 token 数量，在精度和效率之间取得最优平衡",
        warning: "视频 MLLM 的 token 压缩会不可避免地损失时序细节信息，对于需要精确定位（如时序定位、细粒度问答）的任务，压缩比不应超过 0.25"
      },
      {
        title: "7. VideoCLIP 实战",
        body: `VideoCLIP 是将 CLIP 架构扩展到视频模态的开源框架，它将预训练的图像-文本 CLIP 模型适配到视频理解任务中。通过在时间维度上扩展 CLIP 的视觉编码器，VideoCLIP 能够处理视频输入并与文本进行跨模态匹配。

实战中构建 VideoCLIP 系统需要考虑三个核心问题：时间建模（如何将帧级特征整合为视频级表示）、跨模态对齐（如何训练视频-文本匹配）、以及任务适配（如何将预训练模型迁移到下游任务）。这三个问题的解决方案共同决定了系统的最终性能。

时间建模方面，最简单的方法是对所有帧特征做平均池化，但这会丢失时序信息。更精细的方法包括使用时序 Transformer 编码帧序列、使用 LSTM/GRU 捕获时序依赖、或者使用专门的时序注意力模块。实验表明，轻量级的时序 Transformer 在大多数任务上取得了最佳的精度-效率平衡。

跨模态对齐训练需要大规模视频-文本数据。如果没有足够的数据从头训练，可以采用两阶段策略：第一阶段冻结 CLIP 的图像编码器，只训练时间建模模块和投影头；第二阶段对整个模型进行端到端微调。这种策略可以显著减少训练所需的数据量和计算资源。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import CLIPModel, CLIPProcessor

class VideoCLIP(nn.Module):
    """VideoCLIP 实战实现
    基于预训练 CLIP 扩展到视频理解
    """

    def __init__(self, clip_model_name: str = "openai/clip-vit-base-patch32",
                 num_frames: int = 8, temperature: float = 0.07):
        super().__init__()
        self.num_frames = num_frames

        # 加载预训练 CLIP
        self.clip = CLIPModel.from_pretrained(clip_model_name)
        self.processor = CLIPProcessor.from_pretrained(clip_model_name)

        # 冻结 CLIP 参数 (第一阶段)
        for param in self.clip.parameters():
            param.requires_grad = False

        # 时间建模模块
        self.temporal_encoder = nn.TransformerEncoderLayer(
            d_model=self.clip.config.projection_dim,
            nhead=8, dim_feedforward=self.clip.config.projection_dim * 4,
            dropout=0.1, batch_first=True
        )

        # 时间位置编码
        self.temporal_pos_encoding = nn.Parameter(
            torch.randn(num_frames, self.clip.config.projection_dim) * 0.02
        )

        # 可学习温度
        self.logit_scale = nn.Parameter(torch.tensor(
            torch.log(torch.tensor(1.0 / temperature))
        ))

    def encode_video(self, frames: torch.Tensor):
        """编码视频帧序列为视频特征
        frames: [B, T, C, H, W]
        """
        B, T, C, H, W = frames.size()

        # 逐帧通过 CLIP 视觉编码器
        frames_batched = frames.view(B * T, C, H, W)
        frame_features = self.clip.vision_model(frames_batched)
        frame_features = frame_features.last_hidden_state[:, 0, :]  # CLS token
        frame_features = self.clip.visual_projection(frame_features)

        # 重塑为 [B, T, D]
        frame_features = frame_features.view(B, T, -1)

        # 添加时间位置编码
        frame_features = frame_features + self.temporal_pos_encoding[:T, :].unsqueeze(0)

        # 时序编码
        video_features = self.temporal_encoder(frame_features)

        # 时间池化
        video_features = video_features.mean(dim=1)  # [B, D]
        video_features = F.normalize(video_features, dim=-1)

        return video_features

    def encode_text(self, texts: list[str]):
        """编码文本"""
        text_inputs = self.processor(text=texts, return_tensors="pt",
                                      padding=True, truncation=True)
        text_features = self.clip.get_text_features(**text_inputs)
        return F.normalize(text_features, dim=-1)

    def forward(self, videos: torch.Tensor, texts: list[str]):
        """训练前向"""
        video_features = self.encode_video(videos)
        text_features = self.encode_text(texts)

        # 对比损失
        scale = self.logit_scale.exp()
        logits = scale * video_features @ text_features.T
        batch_size = video_features.size(0)
        labels = torch.arange(batch_size, device=video_features.device)

        loss_video = F.cross_entropy(logits, labels)
        loss_text = F.cross_entropy(logits.T, labels)
        return (loss_video + loss_text) / 2`
          },
          {
            lang: "python",
            code: `# VideoCLIP 下游任务适配
import torch
import torch.nn as nn

class VideoCLIPDownstream(nn.Module):
    """将 VideoCLIP 适配到下游任务
    视频分类 / 时序定位 / 视频问答
    """

    def __init__(self, videoclip: VideoCLIP, task: str = "classification",
                 num_classes: int = 400):
        super().__init__()
        self.videoclip = videoclip
        self.task = task
        embed_dim = videoclip.clip.config.projection_dim

        if task == "classification":
            # 视频分类头
            self.head = nn.Sequential(
                nn.Linear(embed_dim, embed_dim // 2),
                nn.GELU(),
                nn.Dropout(0.3),
                nn.Linear(embed_dim // 2, num_classes)
            )

        elif task == "temporal_grounding":
            # 时序定位头 (逐帧预测)
            self.head = nn.Sequential(
                nn.Linear(embed_dim, embed_dim // 2),
                nn.GELU(),
                nn.Linear(embed_dim // 2, 2)  # start, end
            )

        elif task == "video_qa":
            # 视频问答头
            self.head = nn.Sequential(
                nn.Linear(embed_dim, embed_dim // 2),
                nn.GELU(),
                nn.Dropout(0.3),
                nn.Linear(embed_dim // 2, num_classes)
            )

    def forward(self, videos: torch.Tensor,
                texts: list[str] = None,
                text_features: torch.Tensor = None):
        """
        videos: [B, T, C, H, W]
        """
        # 获取视频特征
        video_features = self.videoclip.encode_video(videos)  # [B, D]

        if self.task == "classification":
            return self.head(video_features)

        elif self.task == "temporal_grounding":
            # 需要逐帧特征而非池化特征
            B, T, C, H, W = videos.size()
            frame_features = self._get_frame_features(videos)  # [B, T, D]
            # 结合文本查询做时序定位
            if text_features is not None:
                t = text_features.unsqueeze(1).expand(-1, T, -1)
                fused = frame_features + t
            else:
                fused = frame_features
            return self.head(fused)  # [B, T, 2]

        elif self.task == "video_qa":
            return self.head(video_features)

    def _get_frame_features(self, videos: torch.Tensor):
        """获取逐帧特征（不池化）"""
        B, T, C, H, W = videos.size()
        frames = videos.view(B * T, C, H, W)
        feats = self.videoclip.clip.vision_model(frames)
        feats = feats.last_hidden_state[:, 0, :]
        feats = self.videoclip.clip.visual_projection(feats)
        return feats.view(B, T, -1)

# 训练策略:
# 阶段1 (warmup): 冻结 VideoCLIP, 只训练 task head (10 epochs)
# 阶段2 (finetune): 解冻 temporal encoder, lr = 1e-5 (20 epochs)
# 阶段3 (full): 全模型微调, lr = 5e-6 (30 epochs)`
          }
        ],
        table: {
          headers: ["下游任务", "数据集", "评估指标", "VideoCLIP 基线", "当前 SOTA", "训练时长"],
          rows: [
            ["视频分类", "Kinetics-400", "Top-1 Acc", "72.3%", "84.9%", "~2 天 (A100)"],
            ["文本-视频检索", "MSRVTT", "R@1", "35.2%", "52.1%", "~1 天 (A100)"],
            ["文本-视频检索", "DiDeMo", "R@1", "28.7%", "42.3%", "~1 天 (A100)"],
            ["时序定位", "Charades-STA", "R1@0.5", "38.1%", "58.2%", "~3 天 (A100)"],
            ["视频问答", "MSRVTT-QA", "Accuracy", "45.6%", "62.3%", "~2 天 (A100)"],
            ["视频问答", "ActivityNet-QA", "Accuracy", "38.2%", "55.1%", "~3 天 (A100)"]
          ]
        },
        mermaid: `graph TD
    A["预训练 CLIP"] --> B["扩展时间维度"]
    B --> C["VideoCLIP\n基座模型"]
    C --> D{"下游任务"}
    D --> E["视频分类\n全连接头"]
    D --> F["文本视频检索\n对比损失微调"]
    D --> G["时序定位\n逐帧预测头"]
    D --> H["视频问答\n分类/生成头"]
    E --> I["任务评估"]
    F --> I
    G --> I
    H --> I
    I --> J["迭代优化\n调参/增强数据"]
    J --> C
    J --> E
    J --> F
    J --> G
    J --> H`,
        tip: "使用预训练 CLIP 作为初始权重可以大幅减少训练数据需求，即使是小规模数据集（如 1 万样本），经过 3 阶段微调也能达到接近 SOTA 的效果",
        warning: "VideoCLIP 的帧数选择对性能影响很大：8 帧适合短视频分类，16-32 帧适合时序定位，超过 64 帧时收益递减但计算成本线性增长"
      }
    ],
};
