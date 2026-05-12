import { Article } from '../knowledge';

export const article: Article = {
    id: "cv-002",
    title: "图像分割：语义分割与实例分割",
    category: "cv",
    tags: ["分割", "FCN", "Mask R-CNN"],
    summary: "从 FCN 到 Mask R-CNN，理解像素级预测的核心技术",
    date: "2026-03-30",
    readTime: "16 min",
    level: "进阶",
    content: [
        {
            title: "1. 图像分割概述：像素级分类的三大范式",
            body: `图像分割是计算机视觉中最精细的理解任务——不仅要识别图像中有什么，还要精确到每个像素属于哪个类别。

**三大分割范式**：
- 语义分割（Semantic Segmentation）：为每个像素分配类别标签，但不区分同一类别的不同实例。公式上，给定输入图像 \\(I \\in \\mathbb{R}^{H \\times W \\times 3}\\)，输出分割图 \\(S \\in \\{1,...,C\\}^{H \\times W}\\)，其中 \\(C\\) 为类别数。
- 实例分割（Instance Segmentation）：在语义分割基础上，进一步区分同一类别的不同个体实例。输出为 \\(\\{(M_i, c_i)\\}_{i=1}^N\\)，其中 \\(M_i\\) 为第 \\(i\\) 个实例的二值掩码。
- 全景分割（Panoptic Segmentation）：统一语义分割和实例分割，同时标注"stuff"（天空、道路等不可数区域）和"thing"（人、车等可数实例）。

**核心挑战在于**：分类网络通过池化操作不断降低空间分辨率以获取高层语义，而分割任务需要恢复像素级精度——这就是编码器-解码器结构诞生的根本原因。`,
            code: [{
                lang: "python",
                code: `import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import transforms

# 分割任务的输入输出尺寸对照
# 输入: (B, 3, H, W) → 输出: (B, C, H, W)
# 每个像素输出 C 个类别的 logits
batch_size, num_classes = 4, 21
H, W = 512, 512

dummy_input = torch.randn(batch_size, 3, H, W)
dummy_output = torch.randn(batch_size, num_classes, H, W)

# 交叉熵损失: 自动对每个像素计算
criterion = nn.CrossEntropyLoss()
loss = criterion(dummy_output, torch.randint(0, num_classes, (batch_size, H, W)))
print(f"Pixel-wise CE Loss: {loss.item():.4f}")`
            }],
            table: {
                headers: ["分割类型", "输出形式", "是否区分实例", "典型应用"],
                rows: [
                    ["语义分割", "H×W 类别图", "❌ 否", "自动驾驶场景理解"],
                    ["实例分割", "N 个掩码+类别", "✅ 是", "机器人抓取、医疗病灶"],
                    ["全景分割", "语义图 + 实例ID", "✅ 部分", "全景场景理解"],
                ],
            },
            mermaid: `graph TD
  A[图像分割] --> B[语义分割]
  A --> C[实例分割]
  A --> D[全景分割]
  B --> E[FCN / U-Net / DeepLab]
  C --> F[Mask R-CNN / SOLO]
  D --> G[Panoptic FPN]`,
            tip: "学习建议：先掌握语义分割（FCN → U-Net → DeepLab），再进阶到实例分割（Mask R-CNN），最后理解全景分割如何统一两者。",
            warning: "常见陷阱：混淆语义分割和实例分割的输出格式——前者是单张 H×W 的类别图，后者是多张二值掩码。",
        },
        {
            title: "2. FCN 全卷积网络：从分类到分割的范式转换",
            body: `2015 年，Jonathan Long 等人提出的 FCN（Fully Convolutional Network）是深度学习图像分割的开山之作。

**核心思想**： 将传统分类网络（如 VGG、ResNet）末端的全连接层替换为卷积层，使网络可以接受任意尺寸的输入并输出空间对应的特征图。

关键技术——转置卷积（Transposed Convolution）：
全连接层被卷积化后，特征图分辨率大幅下降（如 VGG16 的 pool5 只有原图的 1/32）。FCN 通过转置卷积（也称反卷积、Deconvolution）逐步上采样恢复分辨率。转置卷积的数学本质是前向传播时执行卷积的转置操作：\\(Y = W^T X\\)，其中 \\(W\\) 是卷积核展开后的矩阵。

跳级连接（Skip Connection）： FCN 融合了 pool3、pool4、pool5 三个尺度的特征——深层特征语义强但分辨率低，浅层特征分辨率高但语义弱。公式：\\(S = \\text{Upsample}(F_5) + F_4 + F_3\\)，其中 \\(F_i\\) 为不同池化层的特征。

**端到端训练**： 整张图片直接输入，像素级交叉熵损失反向传播，无需像传统方法那样分块处理。`,
            code: [{
                lang: "python",
                code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class SimpleFCN(nn.Module):
    """简化版 FCN：VGG-style 编码器 + 转置卷积解码器"""
    def __init__(self, num_classes=21):
        super().__init__()
        # 编码器 (模拟 VGG16 的 pool5, 输出 stride=32)
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1), nn.ReLU(),
            nn.Conv2d(64, 64, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2, 2),  # /2
            nn.Conv2d(64, 128, 3, padding=1), nn.ReLU(),
            nn.Conv2d(128, 128, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2, 2),  # /4
            nn.Conv2d(128, 256, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2, 2),  # /8
            nn.Conv2d(256, 512, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2, 2),  # /16
            nn.Conv2d(512, 512, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2, 2),  # /32
        )
        # 1x1 卷积替代全连接层
        self.classifier = nn.Conv2d(512, num_classes, 1)
        # 转置卷积上采样 (32x → 1x)
        self.upsample = nn.ConvTranspose2d(
            num_classes, num_classes, kernel_size=64,
            stride=32, padding=16
        )

    def forward(self, x):
        h, w = x.shape[2], x.shape[3]
        x = self.encoder(x)          # (B, 512, H/32, W/32)
        x = self.classifier(x)       # (B, C, H/32, W/32)
        x = self.upsample(x)         # (B, C, H, W)
        return x[:, :, :h, :w]       # 裁剪到原图尺寸`
            }],
            table: {
                headers: ["FCN 变体", "融合层级", "输出步幅", "精度特点"],
                rows: [
                    ["FCN-32s", "仅 pool5", "32", "边界粗糙"],
                    ["FCN-16s", "pool5 + pool4", "16", "边界改善"],
                    ["FCN-8s", "pool5 + pool4 + pool3", "8", "最精细"],
                ],
            },
            mermaid: `graph LR
  A[输入图像] --> B[Conv + Pool 堆叠]
  B --> C[1x1 Conv 分类]
  C --> D[转置卷积上采样]
  D --> E[分割输出]
  B -.跳级连接.-> D`,
            tip: "理解转置卷积时，不要把它等同于\"真正的逆卷积\"——它只是学习到的上采样操作，输出尺寸由 kernel_size、stride、padding 共同决定。",
            warning: "常见陷阱：FCN-32s 直接上采样 32 倍会导致棋盘伪影（checkerboard artifacts），实际工程中优先使用 FCN-8s 或 bilinear 初始化转置卷积权重。",
        },
        {
            title: "3. U-Net 架构：编码器-解码器与跳跃连接的完美结合",
            body: `U-Net 由 Ronneberger 等人于 2015 年提出，最初用于生物医学图像分割，现已成为分割任务的基础架构之一。

架构核心——对称的 U 型结构：
- 编码器（收缩路径）：通过重复的 3×3 卷积 + ReLU + 2×2 最大池化，逐步提取高层语义特征，通道数逐层翻倍（64 → 128 → 256 → 512 → 1024）。
- 解码器（扩张路径）：每步先进行 2×2 转置卷积上采样（通道数减半），然后与编码器对应层裁剪后的特征图在通道维度拼接（concat），再进行两次 3×3 卷积。
- **跳跃连接**：这是 U-Net 的灵魂——将编码器的高分辨率特征直接传递到解码器。数学上，第 \\(l\\) 层解码器输入为 \\(D_l = \\text{Concat}(\\text{Up}(D_{l+1}), \\text{Crop}(E_{L-l}))\\)。

**医学图像分割优势**： 医学图像通常数据量小、需要像素级精度。U-Net 通过数据增强（弹性形变）在少量样本上即可取得优秀效果，且跳跃连接保留了边界细节信息。`,
            code: [{
                lang: "python",
                code: `import torch
import torch.nn as nn

class UNetBlock(nn.Module):
    """U-Net 的基本卷积块: Conv → BN → ReLU → Conv → BN → ReLU"""
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )
    def forward(self, x):
        return self.block(x)

class UNet(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        # 编码器
        self.enc1 = UNetBlock(3, 64)
        self.enc2 = UNetBlock(64, 128)
        self.enc3 = UNetBlock(128, 256)
        self.pool = nn.MaxPool2d(2)
        # 瓶颈层
        self.bottleneck = UNetBlock(256, 512)
        # 解码器
        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec3 = UNetBlock(512, 256)  # 256+256=512
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = UNetBlock(256, 128)  # 128+128=256
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = UNetBlock(128, 64)   # 64+64=128
        # 输出
        self.out_conv = nn.Conv2d(64, num_classes, 1)

    def forward(self, x):
        # 编码
        e1 = self.enc1(x)       # (B, 64, H, W)
        e2 = self.enc2(self.pool(e1))   # (B, 128, H/2, W/2)
        e3 = self.enc3(self.pool(e2))   # (B, 256, H/4, W/4)
        # 瓶颈
        b = self.bottleneck(self.pool(e3))  # (B, 512, H/8, W/8)
        # 解码 + 跳跃连接
        d3 = self.up3(b)        # (B, 256, H/4, W/4)
        d3 = self.dec3(torch.cat([d3, e3], dim=1))
        d2 = self.up2(d3)
        d2 = self.dec2(torch.cat([d2, e2], dim=1))
        d1 = self.up1(d2)
        d1 = self.dec1(torch.cat([d1, e1], dim=1))
        return self.out_conv(d1)`
            }],
            table: {
                headers: ["特性", "U-Net", "FCN"],
                rows: [
                    ["架构形状", "对称 U 型", "编码器 + 简单上采样"],
                    ["特征融合", "通道拼接 (Concat)", "逐元素相加 (Add)"],
                    ["数据效率", "小样本友好（数据增强）", "需要大数据集"],
                    ["输出边界质量", "优秀（跳跃连接保留细节）", "较粗糙"],
                ],
            },
            mermaid: `graph TD
  A[输入 572x572] --> E1[Conv 64]
  E1 --> E2[Conv 128]
  E2 --> E3[Conv 256]
  E3 --> B[Bottleneck 512]
  B --> D3[Up 256 + Concat]
  D3 --> D2[Up 128 + Concat]
  D2 --> D1[Up 64 + Concat]
  D1 --> Out[输出 388x388]
  E1 -.skip.-> D1
  E2 -.skip.-> D2
  E3 -.skip.-> D3`,
            tip: "U-Net 的原始论文中使用的是 valid 卷积（无 padding），导致输出尺寸小于输入。现代实现多用 same padding 保持尺寸一致。",
            warning: "常见陷阱：拼接（concat）前需确保编码器特征图与解码器上采样后的尺寸一致，可能需要裁剪或 padding。",
        },
        {
            title: "4. DeepLab 系列：空洞卷积与多尺度特征融合",
            body: `DeepLab 系列（v1 → v2 → v3 → v3+）是 Google 提出的语义分割标杆，核心创新在于解决卷积神经网络中分辨率降低与感受野扩大的矛盾。

空洞卷积（Atrous/Dilated Convolution）：
标准卷积的感受野受限于 kernel size 和下采样倍数。空洞卷积在卷积核元素间插入空洞（零填充），在不增加参数量的情况下扩大感受野。对于 3×3 卷积核，膨胀率 \\(r\\) 时的感受野为 \\((2r+1) \\times (2r+1)\\)。数学表达：\\(y[i] = \\sum_k x[i + r \\cdot k] w[k]\\)。

ASPP（Atrous Spatial Pyramid Pooling）：
DeepLab v3 的核心模块——并行使用多个不同膨胀率（如 6, 12, 18）的空洞卷积，捕获多尺度上下文信息。类似 SPP 但专为密集预测设计。公式：\\(F_{\\text{ASPP}} = \\text{Concat}(f_1, f_6, f_{12}, f_{18}, f_{\\text{global}})\\)。

CRF 后处理（v1/v2）： 使用条件随机场（Conditional Random Field）优化分割边界，将低层颜色/纹理信息与高层语义结合。v3+ 起用编码器-解码器结构替代 CRF。

DeepLab v3+ 编码器-解码器： 编码器用 ASPP 提取多尺度特征，解码器融合低层特征恢复空间细节，Xception 作为主干网络。`,
            code: [{
                lang: "python",
                code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class ASPP(nn.Module):
    """Atrous Spatial Pyramid Pooling - DeepLab v3 核心"""
    def __init__(self, in_channels=2048, out_channels=256, rates=[6, 12, 18]):
        super().__init__()
        # 1x1 卷积分支
        self.branch1 = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )
        # 多尺度空洞卷积分支
        self.branches = nn.ModuleList([
            nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 3, padding=r, dilation=r),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
            ) for r in rates
        ])
        # 全局平均池化分支
        self.global_pool = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(in_channels, out_channels, 1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )
        self.fuse = nn.Sequential(
            nn.Conv2d(out_channels * (len(rates) + 2), out_channels, 1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        h, w = x.shape[2], x.shape[3]
        feats = [self.branch1(x)]
        feats.extend([branch(x) for branch in self.branches])
        # 全局池化后上采样回原尺寸
        g = self.global_pool(x)
        g = F.interpolate(g, size=(h, w), mode='bilinear', align_corners=True)
        feats.append(g)
        return self.fuse(torch.cat(feats, dim=1))`
            }],
            table: {
                headers: ["DeepLab 版本", "核心创新", "主干网络", "mIoU (PASCAL VOC)"],
                rows: [
                    ["v1 (2015)", "空洞卷积 + DenseCRF", "VGG16", "71.6%"],
                    ["v2 (2017)", "ASPP 多尺度", "ResNet-101", "79.7%"],
                    ["v3 (2017)", "改进 ASPP + 移除 CRF", "ResNet-101", "86.9%"],
                    ["v3+ (2018)", "编码器-解码器", "Xception-65", "89.0%"],
                ],
            },
            mermaid: `graph TD
  A[输入特征] --> B[1x1 Conv]
  A --> C[Atrous Conv r=6]
  A --> D[Atrous Conv r=12]
  A --> E[Atrous Conv r=18]
  A --> F[Global Avg Pool → 1x1]
  B --> G[Concat]
  C --> G
  D --> G
  E --> G
  F -.Upsample.-> G
  G --> H[1x1 Fuse Conv]
  H --> I[输出]`,
            tip: "理解空洞卷积的关键：膨胀率 r 越大，感受野越大，但过大时会出现\"网格效应\"（gridding effect）——相邻像素不再相连。ASPP 用多个不同 r 值混合缓解此问题。",
            warning: "常见陷阱：大膨胀率（r ≥ 12）在特征图较小时，空洞卷积核的有效权重可能超出特征图边界，导致大量零填充。DeepLab v3+ 采用 ImagePool 分支缓解此问题。",
        },
        {
            title: "5. Mask R-CNN 实例分割：从检测到像素级掩码",
            body: `Mask R-CNN 由何恺明等人于 2017 年提出，在 Faster R-CNN 基础上增加了一个掩码预测分支，实现了实例分割的突破。

**架构设计——三头并行**：
- 分类头（Cls Head）：预测 RoI 内的物体类别，输出 \\(C+1\\) 类概率（含背景）。
- 边界框回归头（BBox Head）：回归物体边界框的四维偏移量 \\((\\Delta x, \\Delta y, \\Delta w, \\Delta h)\\)。
- 掩码头（Mask Head）：这是新增的核心——对每个 RoI 输出 \\(m \\times m\\) 的二值掩码（如 28×28），通过全卷积网络实现。公式：\\(M_i \\in \\{0, 1\\}^{m \\times m}\\)，使用 per-pixel sigmoid + binary cross-entropy 损失。

RoI Align——消除量化误差的关键创新：
Faster R-CNN 的 RoI Pooling 在将 RoI 映射到特征图时进行了两次取整（quantization），导致空间错位。RoI Align 使用双线性插值（bilinear interpolation）在精确浮点坐标处采样，消除了量化误差。对于 RoI 内的每个采样点 \\((x, y)\\)，其值为周围 4 个特征点的加权平均：\\(f(x, y) = \\sum_{i,j} \\max(0, 1-|x-x_i|) \\cdot \\max(0, 1-|y-y_j|) \\cdot f(x_i, y_j)\\)。

**多任务损失**： \\(L = L_{cls} + L_{box} + L_{mask}\\)，三者联合训练。`,
            code: [{
                lang: "python",
                code: `import torch
import torch.nn as nn
from torchvision.models.detection import maskrcnn_resnet50_fpn
from torchvision.models.detection.rpn import AnchorGenerator
import torchvision.transforms as T

# 使用 torchvision 预训练 Mask R-CNN
model = maskrcnn_resnet50_fpn(weights="DEFAULT")

# 修改分类头以适应自定义类别数
in_features = model.roi_heads.box_predictor.cls_score.in_features
model.roi_heads.box_predictor = nn.Sequential(
    nn.Linear(in_features, 1024),
    nn.ReLU(),
    nn.Linear(1024, 5)  # 4 类 + 背景
)
# 修改掩码头
model.roi_heads.mask_predictor = nn.Sequential(
    nn.ConvTranspose2d(256, 256, 2, 2),
    nn.ReLU(),
    nn.Conv2d(256, 5, 1)  # 4 类 + 背景
)

# 推理示例
model.eval()
transform = T.Compose([T.ToTensor()])
img = torch.randn(3, 800, 1200)  # 模拟输入图像
with torch.no_grad():
    predictions = model([img])

# 解析输出
pred = predictions[0]
boxes = pred["boxes"]          # [N, 4] 边界框
labels = pred["labels"]        # [N] 类别
scores = pred["scores"]        # [N] 置信度
masks = pred["masks"]          # [N, 1, H, W] 掩码概率图
print(f"检测到 {len(boxes)} 个实例")
# 阈值过滤: scores > 0.5
keep = scores > 0.5
print(f"高置信度实例: {keep.sum().item()} 个")`
            }],
            table: {
                headers: ["组件", "Faster R-CNN", "Mask R-CNN"],
                rows: [
                    ["RoI 池化", "RoI Pooling（量化取整）", "RoI Align（双线性插值）"],
                    ["预测头", "Cls + BBox（2 头）", "Cls + BBox + Mask（3 头）"],
                    ["掩码损失", "无", "Per-pixel BCE"],
                    ["解耦策略", "—", "分类和掩码独立预测"],
                ],
            },
            mermaid: `graph TD
  A[输入图像] --> B[ResNet-FPN 特征金字塔]
  B --> C[RPN 区域建议]
  C --> D[RoI Align]
  D --> E[Cls Head]
  D --> F[BBox Head]
  D --> G[Mask Head]
  E --> H[类别 + 分数]
  F --> I[边界框]
  G --> J[像素掩码]`,
            tip: "Mask R-CNN 的关键设计哲学：分类和掩码是解耦的（decouposed）——每个类别的掩码独立预测，不通过 softmax 竞争，这避免了同类实例间的掩码混淆。",
            warning: "常见陷阱：RoI Align 的采样点数（sampling_ratio）设置过小会导致掩码精度下降。默认值 2 在大多数场景下够用，但对小物体建议设为 4。",
        },
        {
            title: "6. 评估指标：如何量化分割质量",
            body: `分割任务的评估比分类复杂得多——不是看整张图对不对，而是看每个像素的预测是否准确。

IoU（Intersection over Union，交并比）：
最核心的分割评估指标。对于单个类别 \\(c\\)，\\(\\text{IoU}_c = \\frac{TP_c}{TP_c + FP_c + FN_c} = \\frac{|P_c \\cap G_c|}{|P_c \\cup G_c|}\\)，其中 \\(P_c\\) 和 \\(G_c\\) 分别为预测和真实掩码中类别 \\(c\\) 的像素集合。IoU 值域 [0, 1]，值越大越好。

mIoU（mean IoU，平均交并比）：
对所有类别的 IoU 取算术平均：\\(\\text{mIoU} = \\frac{1}{C} \\sum_{c=1}^{C} \\text{IoU}_c\\)。这是语义分割最常用的评估指标，能均衡评估每个类别的表现，不受类别不平衡影响。

Dice 系数（F1-Score 的变体）：
\\(\\text{Dice} = \\frac{2|P \\cap G|}{|P| + |G|} = \\frac{2TP}{2TP + FP + FN}\\)。与 IoU 的关系：\\(\\text{Dice} = \\frac{2 \\cdot \\text{IoU}}{1 + \\text{IoU}}\\)。Dice 系数常用于医学图像分割，且 Dice Loss 可直接作为训练损失。

Pixel Accuracy：
\\(\\text{PA} = \\frac{\\sum_{c} TP_c}{\\sum_{c} (TP_c + FN_c)}\\)。简单但不适用于类别不平衡场景——如果 95% 的像素是背景，全预测背景也有 95% 的准确率。

**实例分割 mAP**：
基于 COCO 评估体系，在不同 IoU 阈值（0.50 ~ 0.95，步长 0.05，共 10 个阈值）下计算 AP，取平均得到 mAP@[.5:.95]。`,
            code: [{
                lang: "python",
                code: `import torch
import numpy as np
from typing import Dict

def compute_iou(pred: torch.Tensor, target: torch.Tensor, num_classes: int) -> torch.Tensor:
    """计算每个类别的 IoU
    pred, target: (H, W) 长整型类别图
    返回: (num_classes,) 每个类别的 IoU
    """
    ious = []
    for c in range(num_classes):
        pred_c = (pred == c)
        target_c = (target == c)
        intersection = (pred_c & target_c).sum().float()
        union = (pred_c | target_c).sum().float()
        if union == 0:
            ious.append(torch.tensor(1.0))  # 该类别不存在，视为完美
        else:
            ious.append(intersection / union)
    return torch.tensor(ious)

def compute_dice(pred: torch.Tensor, target: torch.Tensor, num_classes: int) -> torch.Tensor:
    """计算每个类别的 Dice 系数"""
    dices = []
    for c in range(num_classes):
        pred_c = (pred == c).float()
        target_c = (target == c).float()
        intersection = (pred_c * target_c).sum()
        dice = (2 * intersection) / (pred_c.sum() + target_c.sum() + 1e-8)
        dices.append(dice)
    return torch.tensor(dices)

# 模拟评估
pred_map = torch.randint(0, 5, (512, 512))
target_map = torch.randint(0, 5, (512, 512))

ious = compute_iou(pred_map, target_map, 5)
mIoU = ious.mean()
dices = compute_dice(pred_map, target_map, 5)

print(f"各类别 IoU: {ious.tolist()}")
print(f"mIoU: {mIoU.item():.4f}")
print(f"各类别 Dice: {dices.tolist()}")
print(f"Mean Dice: {dices.mean().item():.4f}")`
            }],
            table: {
                headers: ["指标", "公式", "值域", "适用场景", "对不平衡敏感度"],
                rows: [
                    ["IoU", "TP/(TP+FP+FN)", "[0,1]", "通用分割", "中等"],
                    ["mIoU", "mean(IoU_c)", "[0,1]", "语义分割基准", "低（各类平等）"],
                    ["Dice", "2TP/(2TP+FP+FN)", "[0,1]", "医学分割", "中等"],
                    ["Pixel Accuracy", "(TP+TN)/Total", "[0,1]", "快速评估", "高（受主导类影响）"],
                    ["mAP@[.5:.95]", "多阈值AP平均", "[0,1]", "实例分割(COCO)", "低"],
                ],
            },
            mermaid: `graph LR
  A[预测掩码] --> B{逐像素对比}
  B --> C[TP 真正例]
  B --> D[FP 假正例]
  B --> E[FN 假反例]
  C --> F[IoU = TP/(TP+FP+FN)]
  D --> F
  E --> F
  F --> G[mIoU = mean(IoU)]`,
            tip: "评估时务必使用 mIoU 而非 Pixel Accuracy——在类别不平衡的数据集上，Pixel Accuracy 会严重高估模型性能。医学分割中 Dice 系数更常用。",
            warning: "常见陷阱：IoU 计算中，如果某个类别在真实标签中不存在（union=0），应跳过该类别或返回 1.0，避免除零错误。",
        },
        {
            title: "7. 代码实战：PyTorch 实现语义分割项目",
            body: `本节从零搭建一个完整的语义分割训练流程，包括数据集加载、模型定义、训练循环和推理预测。

**完整项目结构**：
1. 使用 torchvision 的 ADE20K 或自定义数据集
2. 构建 DeepLab v3+ 风格的模型（ResNet 主干 + ASPP + 解码器）
3. 混合损失函数（CrossEntropy + Dice Loss）
4. 训练循环 + 验证 + 模型保存
5. **推理**：加载模型 → 输入图像 → 输出彩色分割图

**数据增强策略**： 分割任务的数据增强必须同步变换图像和标签——随机翻转、随机缩放、随机裁剪、颜色抖动等。

**混合损失函数**： 交叉熵损失关注像素级分类准确率，Dice Loss 关注整体重叠度。两者加权组合：\\(L = \\alpha \\cdot L_{CE} + \\beta \\cdot L_{Dice}\\)，通常取 \\(\\alpha = \\beta = 0.5\\)。`,
            code: [{
                lang: "python",
                code: `import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
import numpy as np
from pathlib import Path

# ========== 1. 自定义数据集 ==========
class SegmentationDataset(Dataset):
    """自定义分割数据集：图像 + 掩码对"""
    def __init__(self, img_dir, mask_dir, transform=None):
        self.img_paths = sorted(Path(img_dir).glob("*.jpg"))
        self.mask_paths = sorted(Path(mask_dir).glob("*.png"))
        self.transform = transform

    def __len__(self):
        return len(self.img_paths)

    def __getitem__(self, idx):
        from PIL import Image
        img = Image.open(self.img_paths[idx]).convert("RGB")
        mask = Image.open(self.mask_paths[idx]).convert("L")
        if self.transform:
            seed = np.random.randint(2147483647)
            torch.manual_seed(seed)
            img = self.transform(img)
            torch.manual_seed(seed)
            mask = self.transform(mask)
        return img, torch.tensor(np.array(mask), dtype=torch.long)

# 数据增强（图像和掩码同步）
train_transform = transforms.Compose([
    transforms.Resize((512, 512)),
    transforms.RandomHorizontalFlip(0.5),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])
mask_transform = transforms.Compose([
    transforms.Resize((512, 512), interpolation=Image.NEAREST),
    transforms.ToTensor(),
])

# ========== 2. 模型 + 损失 ==========
from torchvision.models.segmentation import deeplabv3_resnet50

class DiceBCELoss(nn.Module):
    """混合损失: CE + Dice"""
    def __init__(self, alpha=0.5, beta=0.5, num_classes=21):
        super().__init__()
        self.alpha = alpha
        self.beta = beta
        self.ce = nn.CrossEntropyLoss()
        self.num_classes = num_classes

    def forward(self, logits, targets):
        ce_loss = self.ce(logits, targets)
        # Dice Loss
        probs = torch.softmax(logits, dim=1)
        dice = 0.0
        for c in range(self.num_classes):
            p_c = probs[:, c]
            t_c = (targets == c).float()
            intersection = (p_c * t_c).sum()
            dice += 1 - (2 * intersection + 1e-8) / (p_c.sum() + t_c.sum() + 1e-8)
        dice_loss = dice / self.num_classes
        return self.alpha * ce_loss + self.beta * dice_loss

# ========== 3. 训练循环 ==========
def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss = 0
    for images, masks in loader:
        images = images.to(device)
        masks = masks.to(device).squeeze(1)
        outputs = model(images)["out"]
        loss = criterion(outputs, masks)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    return total_loss / len(loader)

@torch.no_grad()
def evaluate(model, loader, device, num_classes=21):
    model.eval()
    ious = torch.zeros(num_classes, device=device)
    counts = torch.zeros(num_classes, device=device)
    for images, masks in loader:
        outputs = model(images.to(device))["out"]
        preds = outputs.argmax(dim=1)
        masks = masks.squeeze(1).to(device)
        for c in range(num_classes):
            pred_c = (preds == c)
            mask_c = (masks == c)
            inter = (pred_c & mask_c).sum().float()
            union = (pred_c | mask_c).sum().float()
            if union > 0:
                ious[c] += inter / union
                counts[c] += 1
    valid = counts > 0
    return (ious[valid] / counts[valid]).mean().item() if valid.any() else 0.0

# ========== 4. 主流程 ==========
if __name__ == "__main__":
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = deeplabv3_resnet50(weights=None, num_classes=21).to(device)
    criterion = DiceBCELoss(num_classes=21)
    optimizer = optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-4)

    train_dataset = SegmentationDataset("data/train/images", "data/train/masks", train_transform)
    train_loader = DataLoader(train_dataset, batch_size=4, shuffle=True, num_workers=4)

    epochs = 50
    for epoch in range(epochs):
        loss = train_one_epoch(model, train_loader, criterion, optimizer, device)
        print(f"Epoch {epoch+1}/{epochs} | Loss: {loss:.4f}")
        if (epoch + 1) % 10 == 0:
            torch.save(model.state_dict(), f"deeplab_epoch_{epoch+1}.pth")`
            }],
            table: {
                headers: ["组件", "选择", "理由"],
                rows: [
                    ["主干网络", "ResNet-50", "精度与速度平衡"],
                    ["分割头", "DeepLabV3 (ASPP)", "多尺度上下文"],
                    ["损失函数", "CE + Dice", "兼顾像素精度和区域重叠"],
                    ["优化器", "AdamW", "权重衰减正则化"],
                    ["学习率", "1e-4 + 余弦退火", "稳定收敛"],
                    ["批大小", "4 (GPU 显存受限)", "梯度积累可等效增大"],
                ],
            },
            mermaid: `graph TD
  A[数据集加载] --> B[数据增强]
  B --> C[ResNet-50 特征提取]
  C --> D[ASPP 多尺度融合]
  D --> E[解码器恢复分辨率]
  E --> F[像素级分类输出]
  F --> G{CE + Dice Loss}
  G --> H[AdamW 优化]
  H --> C`,
            tip: "实战建议：先用预训练权重（weights=\"DEFAULT\"）做迁移学习，比从零训练收敛快 5-10 倍。显存不足时用梯度累积（gradient accumulation）等效增大 batch size。",
            warning: "常见陷阱：数据增强时忘记用相同随机种子处理图像和掩码，导致图像和标签错位！务必在 transform 前设置相同的 seed。",
        },
    ],
};
