import { Article } from '../knowledge';

export const article: Article = {
  id: "cv-010",
  title: "视频理解：动作识别与时序建模",
  category: "cv",
  tags: ["视频理解", "动作识别", "时序建模"],
  summary: "从 2D CNN 到 Video Transformer，掌握视频理解的核心技术",
  date: "2026-04-12",
  readTime: "20 min",
  level: "高级",
  content: [
    {
      title: "1. 视频理解任务定义",
      body: `视频理解（Video Understanding）是计算机视觉中极具挑战性的研究方向。与图像分类不同，视频不仅包含空间信息（每一帧的画面内容），还包含时间信息（帧与帧之间的动态变化）。动作识别（Action Recognition）是视频理解的核心子任务，目标是为整段视频或视频中的每个片段分配一个动作标签，例如「打篮球」、「弹钢琴」、「走路」等。

视频理解的主要任务分支包括：动作识别（整个视频一个标签）、时序动作定位（Temporal Action Localization，检测动作的起止时间）、时空动作检测（Spatio-Temporal Action Detection，同时定位动作的空间边界框和时间范围）以及视频问答（Video QA，结合语言理解回答关于视频内容的问题）。

从技术角度看，视频理解的核心难点在于如何高效地建模时空特征。视频数据维度远高于图像：一段 30 帧、224×224 的视频其输入大小为 30×3×224×224，是单张图像的 30 倍。直接处理会导致计算量和内存消耗呈爆炸式增长，因此需要在表征能力和计算效率之间寻找平衡。`,
      code: [
        {
          lang: "python",
          code: `import torch
import torch.nn as nn
from typing import Tuple

class VideoInputSpec:
    """视频输入规格定义"""
    def __init__(self, num_frames: int = 32, height: int = 224, width: int = 224):
        self.num_frames = num_frames
        self.height = height
        self.width = width

    def tensor_shape(self, batch_size: int = 8) -> Tuple[int, ...]:
        # (B, C, T, H, W) - 标准的 5D 视频张量
        return (batch_size, 3, self.num_frames, self.height, self.width)

    def memory_mb(self, batch_size: int = 8) -> float:
        shape = self.tensor_shape(batch_size)
        total_elements = 1
        for dim in shape:
            total_elements *= dim
        return total_elements * 4 / (1024 * 1024)  # float32

spec = VideoInputSpec(num_frames=64, height=224, width=224)
print(f"Shape: {spec.tensor_shape()}")       # (8, 3, 64, 224, 224)
print(f"Memory: {spec.memory_mb():.1f} MB")  # ~144.0 MB`,
        },
        {
          lang: "python",
          code: `import torch
from torch.utils.data import Dataset, DataLoader
from typing import List, Tuple
import os

class VideoActionDataset(Dataset):
    """视频动作识别数据集基类"""
    def __init__(self, video_dir: str, label_file: str, num_frames: int = 32):
        self.video_dir = video_dir
        self.num_frames = num_frames
        # 加载 label 映射
        self.samples: List[Tuple[str, int]] = []
        with open(label_file, 'r') as f:
            for line in f:
                video_name, label = line.strip().split()
                self.samples.append((video_name, int(label)))
        self.classes = sorted(set(l for _, l in self.samples))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        video_name, label = self.samples[idx]
        # 实际项目中这里使用 decord 或 PyAV 读取视频帧
        frames = self._load_frames(video_name)
        tensor = torch.stack(frames)  # (T, C, H, W)
        tensor = tensor.permute(1, 0, 2, 3)  # (C, T, H, W)
        return tensor, label

    def _load_frames(self, video_name: str) -> List[torch.Tensor]:
        raise NotImplementedError`,
        },
      ],
      table: {
        headers: ["任务", "输入", "输出", "典型应用"],
        rows: [
          ["动作识别", "整段视频", "动作类别标签", "视频内容分类"],
          ["时序动作定位", "整段视频", "动作类别 + 起止时间", "视频片段检索"],
          ["时空动作检测", "整段视频", "动作类别 + 时空边界框", "体育分析"],
          ["视频问答", "视频 + 问题文本", "答案文本", "智能视频搜索"],
        ],
      },
      mermaid: `graph TD
    A["视频输入"] --> B["预处理
(解码/采样)"]
    B --> C["空间特征提取
(每帧 CNN/ViT)"]
    C --> D["时序建模
(TCN/Transformer/RNN)"]
    D --> E["分类头
(FC + Softmax)"]
    E --> F["动作标签"]
    subgraph "关键挑战"
      G["计算复杂度 O(T×H×W)"]
      H["时序依赖建模"]
      I["长视频信息衰减"]
    end
    B -.-> G
    C -.-> H
    D -.-> I`,
      tip: "视频数据预处理阶段建议先均匀采样关键帧，再对帧做与图像相同的增强操作，可以大幅减少 I/O 压力。",
      warning: "不要将整段视频一次性加载到 GPU 内存中！即使 60 帧的 224p 视频也会占用约 144 MB，batch_size=8 时接近 1.2 GB。务必使用流式加载和梯度累积。",
    },
    {
      title: "2. 3D CNN：C3D 与 I3D",
      body: `传统的 2D CNN（如 ResNet、VGG）在单帧图像上表现优异，但无法直接捕获帧间的运动信息。3D CNN 通过引入时间维度上的卷积核，将 2D 卷积扩展为 3D 卷积，使得网络能够同时学习空间和时间特征。

C3D（Convolutional 3D） 是早期的开创性工作，它证明了简单的 3×3×3 卷积核堆叠就能在动作识别任务上取得良好效果。C3D 使用 8 层 3D 卷积 + 池化 + 2 层全连接的结构，在 Sports-1M 数据集上预训练后迁移到其他数据集。它的核心优势是简单直接，但缺点是参数量大、容易过拟合，且固定 16 帧的输入长度限制了灵活性。

I3D（Inflated 3D ConvNet） 是 DeepMind 提出的重要改进。其核心思想是「膨胀」：将一个在 ImageNet 上预训练好的 2D Inception 网络的每个 2D 卷积核沿时间维度复制 N 次，形成 3D 卷积核，然后用视频数据微调。这样做有两个巨大优势：一是继承了 ImageNet 的强大空间特征提取能力；二是通过膨胀保持了 2D 网络的感受野特性。I3D 在 Kinetics 数据集上预训练后，在 UCF101 上达到了 98% 的准确率，成为视频理解领域的里程碑。`,
      code: [
        {
          lang: "python",
          code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class C3D(nn.Module):
    """C3D 网络简化实现"""
    def __init__(self, num_classes: int = 400):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv3d(3, 64, kernel_size=3, padding=1),
            nn.ReLU(), nn.MaxPool3d((1, 2, 2)),
            nn.Conv3d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(), nn.MaxPool3d((2, 2, 2)),
            nn.Conv3d(128, 256, kernel_size=3, padding=1),
            nn.ReLU(), nn.Conv3d(256, 256, kernel_size=3, padding=1),
            nn.ReLU(), nn.MaxPool3d((2, 2, 2)),
            nn.Conv3d(256, 512, kernel_size=3, padding=1),
            nn.ReLU(), nn.Conv3d(512, 512, kernel_size=3, padding=1),
            nn.ReLU(), nn.MaxPool3d((2, 2, 2)),
        )
        self.classifier = nn.Sequential(
            nn.Linear(512 * 4 * 7 * 7, 4096),
            nn.ReLU(), nn.Dropout(0.5),
            nn.Linear(4096, 4096),
            nn.ReLU(), nn.Dropout(0.5),
            nn.Linear(4096, num_classes),
        )

    def forward(self, x):
        # x: (B, C, T, H, W)
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)`,
        },
        {
          lang: "python",
          code: `import torch
import torch.nn as nn

def inflate_conv2d_to_3d(conv2d: nn.Conv2d, time_dim: int = 3) -> nn.Conv3d:
    """将 2D 卷积核膨胀为 3D 卷积核（I3D 核心操作）"""
    # 2D weight shape: (out_ch, in_ch, kH, kW)
    # 3D weight shape: (out_ch, in_ch, kT, kH, kW)
    weight_2d = conv2d.weight.data
    weight_3d = weight_2d.unsqueeze(2).repeat(1, 1, time_dim, 1, 1)
    # 时间维度归一化，保持输出尺度一致
    weight_3d = weight_3d / time_dim

    conv3d = nn.Conv3d(
        in_channels=conv2d.in_channels,
        out_channels=conv2d.out_channels,
        kernel_size=(time_dim, *conv2d.kernel_size),
        stride=(1, *conv2d.stride),
        padding=(time_dim // 2, *conv2d.padding),
        bias=conv2d.bias is not None,
    )
    conv3d.weight.data = weight_3d
    if conv2d.bias is not None:
        conv3d.bias.data = conv2d.bias.data
    return conv3d

# 验证膨胀操作
conv2d = nn.Conv2d(64, 128, kernel_size=3, padding=1)
conv3d = inflate_conv2d_to_3d(conv2d, time_dim=3)
print(f"3D kernel shape: {conv3d.weight.shape}")  # (128, 64, 3, 3, 3)`,
        },
      ],
      table: {
        headers: ["特性", "C3D", "I3D"],
        rows: [
          ["预训练数据", "Sports-1M (自训练)", "ImageNet (2D) → Kinetics"],
          ["卷积核", "3×3×3 统一", "2D 膨胀 3D"],
          ["参数量", "~60M", "~25M (Inception v1 基座)"],
          ["输入帧数", "固定 16 帧", "灵活，通常 64 帧"],
          ["UCF101 准确率", "~82%", "~98%"],
        ],
      },
      mermaid: `graph LR
    A["2D 卷积核
k×k"] -->|复制 N 次| B["3D 卷积核
N×k×k"]
    B -->|除以 N 归一化| C["初始 3D 权重"]
    C -->|视频数据微调| D["I3D 网络"]
    subgraph "膨胀过程"
      E["ImageNet 预训练 2D 权重"] --> A
    end
    subgraph "优势"
      F["继承空间特征"]
      G["减少训练数据需求"]
    end
    D -.-> F
    D -.-> G`,
      tip: "I3D 膨胀时时间维度通常取 3 或 5，太小无法捕获运动，太大则模糊时间精度。第一层卷积建议用 time_dim=5 以捕获更大范围的运动模式。",
      warning: "膨胀后的网络在微调时务必使用较小的学习率（约 1e-4 量级），否则会破坏从 ImageNet 继承的空间特征表示。",
    },
    {
      title: "3. Two-Stream 架构：空间流与时间流",
      body: `Two-Stream 网络是视频理解领域最具影响力的架构之一，由 Simonyan 和 Zisserman 在 2014 年提出。其核心洞察是：视频中的信息可以分为两类——空间信息（场景、物体外观）和时间信息（运动模式、动态变化）——这两类信息适合用不同的网络分支独立处理。

空间流（Spatial Stream） 接收单帧 RGB 图像，学习场景上下文和物体外观特征。它与标准的图像分类网络类似，通常使用预训练的 ResNet 或 VGG。时间流（Temporal Stream） 接收多帧堆叠的光流（Optical Flow）作为输入，学习运动模式。光流是相邻帧之间像素运动的密集场，编码了「每个像素向哪个方向移动了多少」的信息。

两个分支分别训练后，在推理阶段对两个分支的输出概率进行加权融合（通常是空间流权重 1，时间流权重 2，因为时间流分支往往较弱但更关键）。Two-Stream 的成功在于它巧妙地分离了空间和时间的表征学习，使每个分支都能专注于自己最擅长的领域。后续改进包括多尺度融合、时序分段网络（TSN）等。`,
      code: [
        {
          lang: "python",
          code: `import torch
import torch.nn as nn
import torchvision.models as models
from typing import Tuple

class TwoStreamNetwork(nn.Module):
    """双分支 Two-Stream 动作识别网络"""
    def __init__(self, num_classes: int = 400, spatial_weight: float = 1.0,
                 temporal_weight: float = 2.0):
        super().__init__()
        self.spatial_weight = spatial_weight
        self.temporal_weight = temporal_weight

        # 空间分支：RGB 单帧输入
        spatial = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        spatial.conv1 = nn.Conv2d(3, 64, 7, 2, 3, bias=False)
        spatial.fc = nn.Linear(spatial.fc.in_features, num_classes)
        self.spatial_stream = spatial

        # 时间分支：光流堆叠输入 (10 帧光流 = 20 通道)
        temporal = models.resnet50(weights=None)
        temporal.conv1 = nn.Conv2d(20, 64, 7, 2, 3, bias=False)
        temporal.fc = nn.Linear(temporal.fc.in_features, num_classes)
        self.temporal_stream = temporal

    def forward(self, rgb: torch.Tensor, flow: torch.Tensor) -> torch.Tensor:
        spatial_logits = self.spatial_stream(rgb)
        temporal_logits = self.temporal_stream(flow)
        # 加权融合
        fused = (self.spatial_weight * spatial_logits +
                 self.temporal_weight * temporal_logits)
        return fused`,
        },
        {
          lang: "python",
          code: `import cv2
import numpy as np
from typing import List

def compute_dense_optical_flow(frames: List[np.ndarray]) -> np.ndarray:
    """使用 Farneback 方法计算密集光流"""
    if len(frames) < 2:
        raise ValueError("至少需要 2 帧")

    flows = []
    for i in range(len(frames) - 1):
        prev = cv2.cvtColor(frames[i], cv2.COLOR_RGB2GRAY)
        next_ = cv2.cvtColor(frames[i + 1], cv2.COLOR_RGB2GRAY)

        flow = cv2.calcOpticalFlowFarneback(
            prev, next_, None,
            pyr_scale=0.5, levels=3, winsize=15,
            iterations=3, poly_n=5, poly_sigma=1.2,
            flags=0,
        )
        flows.append(flow)  # shape: (H, W, 2)

    # 堆叠为 (T-1, H, W, 2) 并转置为 (2*(T-1), H, W)
    flows = np.stack(flows, axis=0)
    stacked = np.concatenate([flows[:, :, :, 0], flows[:, :, :, 1]], axis=0)
    return stacked.astype(np.float32)

# 使用示例
frames = [np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8) for _ in range(11)]
flow_stacked = compute_dense_optical_flow(frames)
print(f"Flow shape: {flow_stacked.shape}")  # (20, 224, 224)`,
        },
      ],
      table: {
        headers: ["分支", "输入", "学习重点", "预训练"],
        rows: [
          ["空间流", "单帧 RGB (3 通道)", "场景、物体外观", "ImageNet"],
          ["时间流", "多帧光流 (20 通道)", "运动模式、速度方向", "ImageNet (随机初始化第一层)"],
          ["融合策略", "加权平均概率", "空间:时间 ≈ 1:2", "无需训练"],
        ],
      },
      mermaid: `graph TD
    A["视频"] --> B["RGB 帧"]
    A --> C["光流计算"]
    B --> D["空间流 CNN
(ResNet/VGG)"]
    C --> E["时间流 CNN
(ResNet 20ch)"]
    D --> F["空间分类概率"]
    E --> G["时间分类概率"]
    F --> H["加权融合
×1 + ×2"]
    G --> H
    H --> I["最终预测"]`,
      tip: "实际部署时，光流计算可以用 TV-L1 算法替代 Farneback 方法，虽然更慢但精度更高。也可以使用深度学习光流估计（如 RAFT）获得更准确的运动场。",
      warning: "光流计算非常耗时！在训练阶段建议预先离线计算并保存光流文件，而不是在线实时计算，否则 I/O 和计算会成为瓶颈。",
    },
    {
      title: "4. 时序建模：TCN 与 Video Transformer",
      body: `3D CNN 和 Two-Stream 虽然有效，但它们本质上是隐式地处理时序信息。随着 NLP 领域 **Transformer** 的成功，研究者开始探索更直接的时序建模方法。

时间卷积网络（Temporal Convolutional Network, TCN） 使用 1D 因果卷积在时间维度上建模。它的优势是并行计算能力强于 RNN，且通过膨胀卷积可以捕获长程依赖。在视频理解中，TCN 通常接在每帧的空间特征提取器之后，对帧级特征序列进行时序建模。

Video **Transformer** 将 Transformer 架构引入视频理解。核心思路是将视频分割为时空 Patch（spatiotemporal patches），然后通过自注意力机制建模全局的时空依赖。TimeSformer 提出了一种高效方案：先在空间维度做自注意力，再在时间维度做自注意力，将计算复杂度从 O((T×S)²) 降低到 O(T² + S²)，其中 T 是帧数、S 是每帧的 patch 数。Video Swin Transformer 则进一步引入了层次化特征和移位窗口机制，在多个视频理解基准上取得了 SOTA 结果。`,
      code: [
        {
          lang: "python",
          code: `import torch
import torch.nn as nn
from typing import Optional

class TemporalConvBlock(nn.Module):
    """时间卷积模块（TCN 核心组件）"""
    def __init__(self, in_channels: int, out_channels: int,
                 kernel_size: int = 3, dilation: int = 1):
        super().__init__()
        padding = (kernel_size - 1) * dilation // 2
        self.conv = nn.Conv1d(in_channels, out_channels, kernel_size,
                              padding=padding, dilation=dilation)
        self.bn = nn.BatchNorm1d(out_channels)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (B, C, T) - 每帧特征作为序列
        x = self.conv(x)
        x = self.bn(x)
        x = self.relu(x)
        return self.dropout(x)

class SimpleTCN(nn.Module):
    """简化版 TCN 用于视频时序建模"""
    def __init__(self, feature_dim: int = 2048, num_classes: int = 400):
        super().__init__()
        self.blocks = nn.Sequential(
            TemporalConvBlock(feature_dim, 512, dilation=1),
            TemporalConvBlock(512, 256, dilation=2),
            TemporalConvBlock(256, 128, dilation=4),
        )
        self.classifier = nn.Linear(128, num_classes)

    def forward(self, frame_features: torch.Tensor) -> torch.Tensor:
        # frame_features: (B, T, C) -> 转置为 (B, C, T)
        x = frame_features.permute(0, 2, 1)
        x = self.blocks(x)
        # 全局时间平均池化
        x = x.mean(dim=-1)
        return self.classifier(x)`,
        },
        {
          lang: "python",
          code: `import torch
import torch.nn as nn
from einops import rearrange

class TimeSformerAttention(nn.Module):
    """TimeSformer 的空间-时间分离注意力"""
    def __init__(self, dim: int, num_heads: int = 8, num_frames: int = 8):
        super().__init__()
        self.num_frames = num_frames
        self.num_heads = num_heads
        self.scale = (dim // num_heads) ** -0.5

        self.qkv = nn.Linear(dim, dim * 3)
        self.proj = nn.Linear(dim, dim)

        # 空间注意力和时间注意力的投影
        self.spatial_attn = nn.MultiheadAttention(dim, num_heads, batch_first=True)
        self.temporal_attn = nn.MultiheadAttention(dim, num_heads, batch_first=True)
        self.norm1 = nn.LayerNorm(dim)
        self.norm2 = nn.LayerNorm(dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (B, T*P, D) - T帧, 每帧P个patch
        B, TP, D = x.shape
        T = self.num_frames
        P = TP // T

        # 第一步：空间自注意力（对每帧独立做）
        x_spatial = rearrange(x, 'b (t p) d -> (b t) p d', t=T, p=P)
        x_spatial, _ = self.spatial_attn(x_spatial, x_spatial, x_spatial)
        x_spatial = rearrange(x_spatial, '(b t) p d -> b (t p) d', t=T)
        x = x + x_spatial
        x = self.norm1(x)

        # 第二步：时间自注意力（对每个 patch 跨帧做）
        x_temporal = rearrange(x, 'b (t p) d -> (b p) t d', t=T, p=P)
        x_temporal, _ = self.temporal_attn(x_temporal, x_temporal, x_temporal)
        x_temporal = rearrange(x_temporal, '(b p) t d -> b (t p) d', t=T, p=P)
        x = x + x_temporal
        x = self.norm2(x)
        return x`,
        },
      ],
      table: {
        headers: ["方法", "计算复杂度", "长程依赖", "并行性"],
        rows: [
          ["RNN/LSTM", "O(T)", "受限于梯度消失", "差（序列依赖）"],
          ["TCN (膨胀卷积)", "O(T)", "取决于膨胀系数", "好"],
          ["Full Transformer", "O((T×P)²)", "全局", "好"],
          ["TimeSformer (分离)", "O(T²+P²)", "全局", "好"],
        ],
      },
      mermaid: `graph LR
    A["帧特征序列
(B, T, C)"] --> B["空间注意力
每帧独立"]
    B --> C["时间注意力
跨帧聚合"]
    C --> D["融合表示
(B, T×P, C)"]
    D --> E["分类头"]

    subgraph "分离注意力的优势"
      F["空间: 捕获物体关系"]
      G["时间: 捕获运动演化"]
      H["复杂度从 O((TP)²)
降至 O(T²+P²)"]
    end
    B -.-> F
    C -.-> G
    C -.-> H`,
      tip: "TimeSformer 的训练建议分两阶段：先用空间预训练权重初始化空间注意力分支，冻结后训练时间注意力，最后联合微调。这样可以加速收敛并提高最终精度。",
      warning: "Video Transformer 对输入分辨率和帧数非常敏感。分辨率从 224 提升到 384 时，patch 数量增加约 3 倍，显存消耗会接近线性增长。训练时建议从低分辨率开始，再逐步提升。",
    },
    {
      title: "5. 视频数据集：Kinetics 与 UCF101",
      body: `数据是视频理解研究的基石。不同的数据集在规模、多样性、标注质量上差异巨大，直接影响模型的训练策略和评估方式。

UCF101 是最经典的视频动作识别数据集之一，包含 101 个动作类别、13,320 个视频片段，来自 YouTube 用户上传的真实视频。每个视频约 5-10 秒，动作类别涵盖体育运动、日常活动、乐器演奏等。UCF101 的优点是规模适中、标注质量高，常用于算法快速验证和论文对比。但它的缺点是类别偏少、场景较为单一，训练出的模型泛化能力有限。

Kinetics 是 DeepMind 推出的大规模视频数据集，目前有 Kinetics-400/600/700 等多个版本。Kinetics-400 包含约 24 万个训练视频和 2 万个验证视频，覆盖 400 个动作类别。每个视频约 10 秒，来自 YouTube 搜索。Kinetics 的规模使得训练大规模模型（如 I3D、Video **Transformer**）成为可能，预训练后的 Kinetics 权重已经成为视频理解领域的标准初始化方式，相当于 ImageNet 在图像分类中的地位。

除了这两个主流数据集，还有 ActivityNet（时序动作定位）、HMDB51（51 类，6,766 个视频）等辅助基准。`,
      code: [
        {
          lang: "python",
          code: `import os
import json
from typing import Dict, List

class Kinetics400Builder:
    """Kinetics-400 数据集构建工具"""
    def __init__(self, root_dir: str, split: str = "train"):
        self.root_dir = root_dir
        self.split = split
        self.classes = self._load_classes()

    def _load_classes(self) -> List[str]:
        classes_file = os.path.join(self.root_dir, "kinetics_400_classes.txt")
        with open(classes_file, 'r') as f:
            return [line.strip() for line in f if line.strip()]

    def get_class_distribution(self, annotations_file: str) -> Dict[str, int]:
        """统计每个类别的样本数量"""
        distribution = {}
        with open(annotations_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) >= 2:
                    label = int(parts[-1])
                    cls_name = self.classes[label] if label < len(self.classes) else f"unknown_{label}"
                    distribution[cls_name] = distribution.get(cls_name, 0) + 1
        return distribution

    def get_statistics(self) -> Dict:
        return {
            "num_classes": len(self.classes),
            "split": self.split,
            "top_classes": ["playing guitar", "riding bike", "eating"],
            "avg_duration_sec": 10.0,
            "resolution_range": "varies (YouTube source)",
        }

builder = Kinetics400Builder("/data/kinetics400")
print(json.dumps(builder.get_statistics(), indent=2))`,
        },
        {
          lang: "python",
          code: `import torch
from torch.utils.data import Dataset, DataLoader
from typing import Tuple
import random

class UCF101Dataset(Dataset):
    """UCF101 数据集"""
    def __init__(self, root: str, split_file: str, num_frames: int = 32,
                 transform=None):
        self.root = root
        self.num_frames = num_frames
        self.transform = transform
        self.samples = self._load_split(split_file)
        self.classes = sorted(set(s[1] for s in self.samples))
        self.class_to_idx = {c: i for i, c in enumerate(self.classes)}

    def _load_split(self, split_file: str):
        samples = []
        with open(split_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 2:
                    video_path, label = parts
                    samples.append((video_path, int(label) - 1))
        return samples

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        video_path, label = self.samples[idx]
        frames = self._load_video_frames(video_path)
        tensor = torch.stack(frames)  # (T, C, H, W)
        if self.transform:
            tensor = self.transform(tensor)
        return tensor.permute(1, 0, 2, 3), label

    def _load_video_frames(self, path: str):
        raise NotImplementedError  # 使用 decord 或 PyAV 实现`,
        },
      ],
      table: {
        headers: ["数据集", "类别数", "训练视频", "平均时长", "主要用途"],
        rows: [
          ["UCF101", "101", "9,537", "~7 秒", "快速验证、论文对比"],
          ["HMDB51", "51", "3,570", "~3 秒", "小规模基准"],
          ["Kinetics-400", "400", "~240K", "~10 秒", "大规模预训练"],
          ["Kinetics-700", "700", "~650K", "~10 秒", "最全面基准"],
          ["ActivityNet", "200", "~20K", "~2 分钟", "时序动作定位"],
        ],
      },
      mermaid: `graph TD
    A["Kinetics-400"] --> B["预训练 I3D"]
    A --> C["预训练 Video Transformer"]
    B --> D["微调 UCF101"]
    C --> D
    D --> E["98％+ 准确率"]

    subgraph "迁移学习范式"
      F["大规模数据预训练"]
      G["小规模数据微调"]
      H["目标数据集评估"]
    end
    A -.-> F
    D -.-> G
    E -.-> H`,
      tip: "实际项目中，强烈建议先在 Kinetics-400 上预训练模型，再在目标数据集（如 UCF101）上微调。直接使用 ImageNet 预训练权重做视频任务通常效果较差。",
      warning: "Kinetics 数据集的视频来自 YouTube，部分视频可能已被删除或设为私有。下载时需要处理大量 404 错误，建议使用官方提供的备用链接或从社区获取完整镜像。",
    },
    {
      title: "6. 慢速/快速网络融合：SlowFast 架构",
      body: `SlowFast 是 FAIR（Facebook AI Research）在 2019 年提出的视频理解架构，其灵感来源于人类视觉系统中的双通路机制：快速通路处理运动信息（低空间分辨率、高时间分辨率），慢速通路处理细节信息（高空间分辨率、低时间分辨率）。

Slow 通路 以较低的时间采样率（如每秒 2 帧）处理视频，使用较大的空间感受野，专注于捕获精细的空间细节和语义信息。它的网络结构较深，类似于标准的 ResNet。

Fast 通路 以较高的时间采样率（如每秒 16 帧）处理视频，但通道数较少（通常只有 Slow 通路的 1/8），专注于捕获快速的运动变化和时序动态。它的网络结构较浅但时间分辨率高。

两个通路在多个阶段通过横向连接（Lateral Connections）进行特征融合：Fast 通路的特征经过 3D 卷积变换后注入到 Slow 通路中。这种设计使得网络能够同时获得高质量的空间表征和精细的时序动态，在多个视频理解基准上取得了优异性能。`,
      code: [
        {
          lang: "python",
          code: `import torch
import torch.nn as nn
from typing import List

class SlowFastBlock(nn.Module):
    """SlowFast 单阶段模块"""
    def __init__(self, slow_in_channels: int, fast_in_channels: int,
                 slow_out_channels: int, fast_out_channels: int,
                 alpha: int = 8, beta: int = 8):
        """
        alpha: 时间采样率比 (fast_frames / slow_frames)
        beta:  通道数比 (slow_channels / fast_channels)
        """
        super().__init__()
        self.alpha = alpha
        self.beta = beta

        # Slow 分支
        self.slow_path = nn.Sequential(
            nn.Conv3d(slow_in_channels, slow_out_channels,
                      kernel_size=(3, 3, 3), padding=(1, 1, 1)),
            nn.BatchNorm3d(slow_out_channels),
            nn.ReLU(),
        )

        # Fast 分支
        self.fast_path = nn.Sequential(
            nn.Conv3d(fast_in_channels, fast_out_channels,
                      kernel_size=(3, 3, 3), padding=(1, 1, 1)),
            nn.BatchNorm3d(fast_out_channels),
            nn.ReLU(),
        )

        # 横向连接：fast -> slow
        self.lateral = nn.Sequential(
            nn.Conv3d(fast_out_channels, slow_out_channels // beta,
                      kernel_size=(5, 1, 1), stride=(alpha, 1, 1),
                      padding=(2, 0, 0)),
            nn.BatchNorm3d(slow_out_channels // beta),
            nn.ReLU(),
        )

    def forward(self, slow_input: torch.Tensor,
                fast_input: torch.Tensor) -> List[torch.Tensor]:
        slow_out = self.slow_path(slow_input)
        fast_out = self.fast_path(fast_input)

        # 横向连接融合
        lateral_feat = self.lateral(fast_out)
        slow_out = torch.cat([slow_out, lateral_feat], dim=1)

        return [slow_out, fast_out]`,
        },
        {
          lang: "python",
          code: `import torch
import torch.nn as nn

class SlowFastNetwork(nn.Module):
    """完整的 SlowFast 网络"""
    def __init__(self, num_classes: int = 400, alpha: int = 8, beta: int = 8):
        super().__init__()
        self.alpha = alpha  # 时间采样率比

        # 输入通道: slow=3(RGB), fast=3(RGB)
        # slow 每 8 帧取 1 帧，fast 每帧都取
        self.slow_conv1 = nn.Conv3d(3, 64, (1, 7, 7), (1, 2, 2), (0, 3, 3))
        self.fast_conv1 = nn.Conv3d(3, 8, (5, 7, 7), (8, 2, 2), (2, 3, 3))
        self.slow_bn1 = nn.BatchNorm3d(64)
        self.fast_bn1 = nn.BatchNorm3d(8)

        # 多个 SlowFast 阶段
        self.stage1 = SlowFastBlock(64, 8, 256, 32, alpha, beta)
        self.stage2 = SlowFastBlock(256 + 32, 32, 512, 64, alpha, beta)
        self.stage3 = SlowFastBlock(512 + 64, 64, 1024, 128, alpha, beta)
        self.stage4 = SlowFastBlock(1024 + 128, 128, 2048, 256, alpha, beta)

        # 全局池化 + 分类
        self.pool = nn.AdaptiveAvgPool3d(1)
        self.classifier = nn.Linear(2048 + 256, num_classes)

    def forward(self, slow_input: torch.Tensor,
                fast_input: torch.Tensor) -> torch.Tensor:
        # 初始卷积
        slow = torch.relu(self.slow_bn1(self.slow_conv1(slow_input)))
        fast = torch.relu(self.fast_bn1(self.fast_conv1(fast_input)))

        # 逐级通过 SlowFast 模块
        slow, fast = self.stage1(slow, fast)
        slow, fast = self.stage2(slow, fast)
        slow, fast = self.stage3(slow, fast)
        slow, fast = self.stage4(slow, fast)

        # 全局池化 + 拼接
        slow = self.pool(slow).flatten(1)
        fast = self.pool(fast).flatten(1)
        fused = torch.cat([slow, fast], dim=1)
        return self.classifier(fused)`,
        },
      ],
      table: {
        headers: ["通路", "时间采样率", "通道数", "侧重点"],
        rows: [
          ["Slow", "低 (每 α 帧取 1 帧)", "多 (β 倍于 Fast)", "空间细节、语义信息"],
          ["Fast", "高 (每帧都取)", "少 (1/β Slow)", "运动变化、时序动态"],
          ["横向连接", "降采样对齐", "Conv 3D 变换", "Fast 信息注入 Slow"],
        ],
      },
      mermaid: `graph TD
    A["视频输入"] --> B["慢速采样
(低频取帧)"]
    A --> C["快速采样
(全帧取)"]
    B --> D["Slow 通路
(深网络, 多通道)"]
    C --> E["Fast 通路
(浅网络, 少通道)"]
    E -->|横向连接| D
    D --> F["拼接特征"]
    E --> F
    F --> G["全局池化"]
    G --> H["分类输出"]

    subgraph "SlowFast 设计哲学"
      I["人类视觉双通路"]
      J["细节 vs 运动"]
    end
    I -.-> B
    I -.-> C
    J -.-> D
    J -.-> E`,
      tip: "alpha=8, beta=8 是 SlowFast 论文推荐的默认配置。对于显存受限的场景，可以先尝试 alpha=4, beta=4 以减少计算量，虽然精度可能略有下降。",
      warning: "SlowFast 网络有两个输入流，训练时需要同时准备慢速和快速两套采样数据。如果采样逻辑不一致（比如慢速采样的帧索引与快速采样不匹配），会导致特征融合失败。务必确保两者的时间对齐。",
    },
    {
      title: "7. PyTorch 实战：I3D 推理管线",
      body: `掌握了理论之后，让我们通过一个完整的 PyTorch 实战来理解 I3D 的推理流程。I3D 推理涉及视频解码、帧采样、预处理、模型推理和结果解析等多个步骤，每个环节都需要注意细节。

完整的推理管线包括：视频解码（使用 PyAV 或 decord 库读取视频文件）、帧采样（从视频中均匀采样 N 帧，N 通常为 64 或 32）、预处理（resize、归一化、转换为 Tensor）、模型推理（前向传播获取 logits）、结果解析（Softmax 获取概率分布，取 Top-K 预测）。

在实际部署中，还需要考虑多段采样（Multi-crop）策略：对视频进行多次不同起点的采样和不同空间裁剪，将多次推理的结果取平均，可以显著提升准确率。这是竞赛和论文中的标准做法，但会将推理时间增加 3-10 倍。对于实时应用，通常只需要单次推理。`,
      code: [
        {
          lang: "python",
          code: `import torch
import torch.nn.functional as F
import numpy as np
from typing import List, Tuple, Dict

class I3DPredictor:
    """I3D 视频动作识别推理管线"""
    def __init__(self, model_path: str, classes_file: str,
                 num_frames: int = 64, device: str = "cuda"):
        self.device = torch.device(device)
        self.num_frames = num_frames

        # 加载模型
        self.model = self._load_model(model_path)
        self.model.to(self.device)
        self.model.eval()

        # 加载类别名称
        with open(classes_file, 'r') as f:
            self.classes = [line.strip() for line in f if line.strip()]

        # ImageNet 归一化参数
        self.mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1, 1)
        self.std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1, 1)

    def _load_model(self, path: str) -> torch.nn.Module:
        from i3d import InceptionI3d  # 假设已定义
        model = InceptionI3d(num_classes=400)
        model.load_state_dict(torch.load(path, map_location='cpu'))
        return model

    def preprocess(self, frames: np.ndarray) -> torch.Tensor:
        """预处理：resize → normalize → to tensor"""
        # frames: (T, H, W, C), uint8 [0, 255]
        tensor = torch.from_numpy(frames).float() / 255.0
        tensor = tensor.permute(3, 0, 1, 2).unsqueeze(0)  # (1, C, T, H, W)
        tensor = (tensor - self.mean) / self.std
        return tensor.to(self.device)

    def predict(self, frames: np.ndarray, top_k: int = 5) -> List[Dict]:
        """执行推理并返回 Top-K 预测"""
        tensor = self.preprocess(frames)
        with torch.no_grad():
            logits = self.model(tensor)
            probs = F.softmax(logits, dim=1)

        top_probs, top_indices = probs.topk(top_k, dim=1)
        results = []
        for prob, idx in zip(top_probs[0], top_indices[0]):
            results.append({
                "class": self.classes[idx.item()],
                "probability": prob.item(),
            })
        return results`,
        },
        {
          lang: "python",
          code: `import decord
from decord import VideoReader
import numpy as np
from typing import List

class VideoSampler:
    """视频帧采样策略"""
    def __init__(self, num_frames: int = 64):
        self.num_frames = num_frames

    def uniform_sample(self, video_path: str) -> np.ndarray:
        """均匀采样：从视频中均匀抽取 N 帧"""
        vr = VideoReader(video_path, ctx=decord.cpu(0))
        total_frames = len(vr)

        if total_frames <= self.num_frames:
            # 视频太短，重复最后一帧
            indices = list(range(total_frames))
            indices += [total_frames - 1] * (self.num_frames - total_frames)
        else:
            # 均匀间隔采样
            indices = np.linspace(0, total_frames - 1, self.num_frames)
            indices = np.round(indices).astype(int)

        frames = vr.get_batch(indices).asnumpy()  # (T, H, W, C)
        return frames

    def multi_crop_sample(self, video_path: str,
                          num_crops: int = 3) -> List[np.ndarray]:
        """多段采样：用于提升推理精度"""
        vr = VideoReader(video_path, ctx=decord.cpu(0))
        total_frames = len(vr)
        segment_length = total_frames // num_crops

        crops = []
        for i in range(num_crops):
            start = i * segment_length
            end = start + segment_length
            indices = np.linspace(start, end - 1, self.num_frames)
            indices = np.round(indices).astype(int)
            frames = vr.get_batch(indices).asnumpy()
            crops.append(frames)
        return crops

# 使用示例
sampler = VideoSampler(num_frames=64)
frames = sampler.uniform_sample("video.mp4")
print(f"Sampled shape: {frames.shape}")  # (64, H, W, 3)`,
        },
      ],
      table: {
        headers: ["策略", "采样方式", "推理速度", "准确率"],
        rows: [
          ["单次推理", "均匀采样 64 帧 + 中心裁剪", "快 (1×)", "基准"],
          ["10 段采样", "10 段均匀采样取平均", "中 (10×)", "+1~2%"],
          ["3 段×3 裁剪", "3 段时间段 × 3 空间裁剪", "慢 (9×)", "+2~3%"],
          ["双流融合", "RGB + 光流双分支", "最慢", "最高 (+3~5%)"],
        ],
      },
      mermaid: `graph LR
    A["视频文件.mp4"] --> B["decord 解码"]
    B --> C["均匀采样 64 帧"]
    C --> D["Resize 224×224"]
    D --> E["归一化
(ImageNet mean/std)"]
    E --> F["I3D 前向传播"]
    F --> G["Softmax 概率"]
    G --> H["Top-5 预测结果"]

    subgraph "关键参数"
      I["num_frames=64"]
      J["input_size=224"]
      K["batch_size=1"]
    end
    C -.-> I
    D -.-> J
    F -.-> K`,
      tip: "推理前确保模型的归一化参数与预训练时一致。I3D 在 Kinetics 上预训练时使用的是 ImageNet 的 mean=[0.485, 0.456, 0.406] 和 std=[0.229, 0.224, 0.225]，不要随意更换。",
      warning: "decord 库在读取损坏或不完整视频时可能抛出异常。生产环境中务必用 try-except 包裹解码过程，并设置超时机制，避免单个坏视频阻塞整个推理流程。",
    },
  ],
};
