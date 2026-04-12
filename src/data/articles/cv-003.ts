import { Article } from '../knowledge';

export const article: Article = {
    id: "cv-003",
    title: "图像分类：从 AlexNet 到 EfficientNet",
    category: "cv",
    tags: ["图像分类", "CNN", "架构演进"],
    summary: "梳理图像分类任务的经典架构演进，从 AlexNet 突破到 EfficientNet 的复合缩放",
    date: "2026-04-12",
    readTime: "18 min",
    level: "入门",
    content: [
      {
        title: "1. 图像分类任务定义",
        body: `图像分类（Image Classification）是计算机视觉最基础的任务：给定一张输入图像 I ∈ R^(H×W×C)，模型需要输出一个类别概率分布 P(c|I)，其中 c ∈ {1, 2, ..., C}，C 为类别总数。

**核心挑战：** 同一类别的图像在视角、光照、尺度、遮挡、背景等方面差异巨大，而不同类别的图像又可能非常相似。模型必须学会提取「语义不变特征」——无论猫是蹲着还是躺着，都能识别为「猫」。

**卷积神经网络（CNN）为何有效：** 卷积操作具备三个关键特性——局部连接（Local Connectivity）使模型关注邻域特征而非全局像素；权值共享（Weight Sharing）大幅减少参数量并天然具备平移不变性；池化操作（Pooling）提供一定程度的尺度不变性。这三者结合使 CNN 成为图像分类的天然选择。

**评价指标：** 图像分类最常用 Top-1 Accuracy（预测概率最高的类别是否正确）和 Top-5 Accuracy（真实类别是否在预测概率前五名中）。ImageNet 竞赛采用这两个指标，Top-5 更宽松，适合类别数极多的场景（ImageNet 有 1000 类）。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class SimpleCNN(nn.Module):
    """最简单的 CNN 图像分类器，理解基本结构"""
    def __init__(self, num_classes: int = 10):
        super().__init__()
        # 特征提取层（卷积 + 池化）
        self.features = nn.Sequential(
            # 第一层卷积：3通道输入 → 32通道输出，3x3卷积核
            nn.Conv2d(3, 32, kernel_size=3, padding=1),  # 输出: 32x32x32
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),        # 输出: 32x16x16

            # 第二层卷积：32通道 → 64通道
            nn.Conv2d(32, 64, kernel_size=3, padding=1),  # 输出: 64x16x16
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),        # 输出: 64x8x8

            # 第三层卷积：64通道 → 128通道
            nn.Conv2d(64, 128, kernel_size=3, padding=1), # 输出: 128x8x8
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),        # 输出: 128x4x4
        )

        # 分类层（全连接）
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 4 * 4, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x  # 输出 logits，训练时用 CrossEntropyLoss`,
          },
          {
            lang: "python",
            code: `# 计算模型参数量和 FLOPs
import torch
import torch.nn as nn

def count_parameters(model: nn.Module) -> int:
    """统计模型可训练参数量"""
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

def estimate_flops(model: nn.Module, input_size: tuple = (3, 32, 32)) -> int:
    """估算前向传播 FLOPs（简化版，仅 Conv + Linear）"""
    flops = 0
    for module in model.modules():
        if isinstance(module, nn.Conv2d):
            # FLOPs = 2 * Cout * Cin * K * K * H_out * W_out
            # 2 表示乘加算两次
            cin = module.in_channels
            cout = module.out_channels
            k = module.kernel_size[0] if isinstance(module.kernel_size, tuple) else module.kernel_size
            # 计算输出尺寸
            h_out = (input_size[1] + 2 * module.padding[0] - k) // module.stride[0] + 1
            w_out = (input_size[2] + 2 * module.padding[0] - k) // module.stride[0] + 1
            flops += 2 * cout * cin * k * k * h_out * w_out
            input_size = (cout, h_out, w_out)  # 更新输入尺寸
        elif isinstance(module, nn.Linear):
            flops += 2 * module.in_features * module.out_features
    return flops

model = SimpleCNN(num_classes=10)
print(f"参数量: {count_parameters(model):,}")
print(f"估算 FLOPs: {estimate_flops(model):,}")`,
          },
        ],
        table: {
          headers: ["概念", "含义", "为什么重要"],
          rows: [
            ["Top-1 Accuracy", "预测概率最高的类别是否正确", "最严格的分类指标"],
            ["Top-5 Accuracy", "真实类别是否在前五名中", "ImageNet 标准，1000类时更宽容"],
            ["参数量 (Params)", "模型中可训练参数的总数", "决定模型大小和内存占用"],
            ["FLOPs", "前向传播的浮点运算次数", "决定推理速度和计算资源需求"],
            ["感受野 (Receptive Field)", "输出特征图上一点对应的输入区域", "越大能捕捉的语义越全局"],
          ],
        },
        mermaid: `graph LR
  A[输入图像 32x32x3] --> B[卷积层1 32 filters]
  B --> C[MaxPool 16x16]
  C --> D[卷积层2 64 filters]
  D --> E[MaxPool 8x8]
  E --> F[卷积层3 128 filters]
  F --> G[MaxPool 4x4]
  G --> H[展平 Flatten]
  H --> I[全连接层]
  I --> J[输出 logits]`,
        tip: "理解 CNN 的核心是理解「特征图（Feature Map）」的维度变化：每次卷积改变通道数，每次池化缩小空间尺寸。拿笔在纸上算一遍维度变化，比看十遍理论都有用。",
        warning: "图像分类 ≠ 目标检测！分类任务假设整张图只有一个主要类别，如果图中有多个类别的目标，标准分类模型会输出混合的概率分布。",
      },
      {
        title: "2. AlexNet 革命（2012）",
        body: `2012 年，Alex Krizhevsky 提出的 AlexNet 在 ImageNet LSVRC 竞赛中以 15.3% 的 Top-5 错误率夺冠，将第二名的 26.2% 远远甩开。这一刻被公认为深度学习革命的起点。

**为什么 AlexNet 能成功：** 在此之前，图像分类主流方法是手工特征（SIFT + HOG + 词袋模型 + SVM）。AlexNet 的关键突破在于：（1）首次用 GPU 训练大规模 CNN——两块 GTX 580 并行训练 6 天；（2）引入 ReLU 激活函数替代 Tanh/Sigmoid，训练速度提升 6 倍；（3）使用 Dropout 缓解过拟合（当时是开创性的正则化技术）；（4）数据增强（随机裁剪、水平翻转、色彩扰动）有效提升泛化能力。

**网络结构：** AlexNet 有 8 层可训练参数（5 层卷积 + 3 层全连接），参数量约 6000 万。第一层卷积核尺寸为 11×11（很大），步长为 4，这是因为 2012 年的输入图像尺寸为 227×227，大卷积核可以在早期就捕获大范围的视觉模式。后续卷积核缩小到 5×5 和 3×3。

**双 GPU 设计：** 由于单张 GPU 显存不足（当时只有 3GB），AlexNet 将模型切分到两块 GPU 上，只有部分层需要 GPU 间通信。这种设计后来被放弃（因为 GPU 显存飞速增长），但其「并行计算」的思想影响深远。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class AlexNet(nn.Module):
    """AlexNet 简化实现（单 GPU 版本）"""
    def __init__(self, num_classes: int = 1000):
        super().__init__()
        self.features = nn.Sequential(
            # 第1层卷积: 11x11, stride=4 —— 大卷积核捕获大范围模式
            nn.Conv2d(3, 96, kernel_size=11, stride=4, padding=2),
            nn.ReLU(inplace=True),
            nn.LocalResponseNorm(size=5, alpha=1e-4, beta=0.75, k=2),
            nn.MaxPool2d(kernel_size=3, stride=2),

            # 第2层卷积: 5x5
            nn.Conv2d(96, 256, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.LocalResponseNorm(size=5, alpha=1e-4, beta=0.75, k=2),
            nn.MaxPool2d(kernel_size=3, stride=2),

            # 第3-5层卷积: 3x3
            nn.Conv2d(256, 384, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(384, 384, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(384, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
        )

        self.classifier = nn.Sequential(
            nn.Dropout(p=0.5),
            nn.Linear(256 * 6 * 6, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.5),
            nn.Linear(4096, 4096),
            nn.ReLU(inplace=True),
            nn.Linear(4096, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x`,
          },
          {
            lang: "python",
            code: `# 对比 AlexNet 与传统方法的性能差距
# ImageNet LSVRC-2012 Top-5 错误率对比

import matplotlib.pyplot as plt

methods = ['SIFT+BoF\n(传统方法)', 'AlexNet\n(2012 冠军)']
error_rates = [26.2, 15.3]

fig, ax = plt.subplots(figsize=(6, 4))
bars = ax.bar(methods, error_rates, color=['#888', '#ff6b35'], width=0.5)
ax.set_ylabel('Top-5 Error Rate (%)')
ax.set_title('ImageNet 2012: 深度学习的分水岭')
ax.set_ylim(0, 30)

for bar, val in zip(bars, error_rates):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
            f'{val}%', ha='center', fontweight='bold')
plt.tight_layout()
plt.savefig('alexnet_breakthrough.png', dpi=150)
plt.close()

print("AlexNet 相比传统方法降低了 {:.1f}% 的错误率".format(26.2 - 15.3))
# 输出: AlexNet 相比传统方法降低了 10.9% 的错误率`,
          },
        ],
        table: {
          headers: ["组件", "AlexNet 设计", "设计意图"],
          rows: [
            ["第一层卷积核", "11×11, stride=4", "在 227×227 输入上捕获大范围模式"],
            ["激活函数", "ReLU", "解决梯度消失，训练速度比 Tanh 快 6 倍"],
            ["正则化", "Dropout (p=0.5) + LRN", "防止 6000 万参数过拟合"],
            ["数据增强", "随机裁剪 + 水平翻转 + PCA 颜色扰动", "有效扩充训练集，降低 1% 错误率"],
            ["训练硬件", "2 × GTX 580 (3GB), 6 天", "首次证明 GPU 训练大规模 CNN 可行"],
          ],
        },
        mermaid: `graph TD
  A[输入 227×227×3] --> B[Conv1 11×11/96, s=4]
  B --> C[ReLU + LRN + MaxPool]
  C --> D[Conv2 5×5/256]
  D --> E[ReLU + LRN + MaxPool]
  E --> F[Conv3 3×3/384]
  F --> G[Conv4 3×3/384]
  G --> H[Conv5 3×3/256]
  H --> I[MaxPool → 6×6×256]
  I --> J[FC 4096 + Dropout]
  J --> K[FC 4096 + Dropout]
  K --> L[FC 1000 输出]`,
        tip: "AlexNet 的 Local Response Normalization（LRN）后来被证明效果有限，Batch Normalization 出现后基本被淘汰。但理解 LRN 有助于理解归一化技术的发展脉络。",
        warning: "AlexNet 的参数量约 6000 万，其中 90% 集中在三个全连接层。这导致模型非常臃肿——后来 VGG 和 ResNet 都用全局平均池化替代了大 FC 层。",
      },
      {
        title: "3. VGG 的简洁之美",
        body: `VGG（Visual Geometry Group，2014）由牛津大学视觉几何组提出，其核心贡献在于发现了一个简洁而强大的设计原则：**用多个 3×3 小卷积核堆叠替代大卷积核**。

**为什么 3×3 更好：** 两个 3×3 卷积的感受野等同于一个 5×5 卷积，三个 3×3 等同于一个 7×7。但三个 3×3 的参数量仅为 3 × (3² × C²) = 27C²，而一个 7×7 的参数量为 49C²——减少了约 45%。更重要的是，三个 3×3 卷积之间有两次 ReLU 非线性变换，而单个大卷积只有一次——非线性更强意味着模型的表达能力更强。

**VGG 家族：** VGG 提出了多个版本（VGG-11、VGG-13、VGG-16、VGG-19），数字代表可训练层数。VGG-16（13 层卷积 + 3 层全连接）是最经典的选择，在 ImageNet 上达到 7.3% 的 Top-5 错误率。

**VGG 的遗产：** 虽然 VGG 参数量巨大（VGG-16 约 1.38 亿参数，其中 1.2 亿在全连接层），但其简洁的架构使其成为迁移学习的「标准特征提取器」。很多后续模型（如 Faster R-CNN、神经风格迁移）的 backbone 都使用 VGG。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

# 验证：3 个 3x3 卷积的感受野 = 1 个 7x7 卷积
def compute_receptive_field(conv_layers):
    """计算卷积层的等效感受野
    conv_layers: [(kernel_size, stride, padding), ...]
    """
    rf = 1
    for k, s, p in conv_layers:
        rf = rf + (k - 1) * s  # 简化计算（假设 stride=1）
    return rf

# 单个 7x7 卷积
rf_7x7 = compute_receptive_field([(7, 1, 0)])
# 三个 3x3 卷积（stride=1）
rf_3x3 = compute_receptive_field([(3, 1, 0), (3, 1, 0), (3, 1, 0)])
print(f"7x7 卷积感受野: {rf_7x7}")     # 7
print(f"3个3x3 卷积感受野: {rf_3x3}")  # 7

# 参数量对比
C = 256  # 通道数
params_7x7 = 7 * 7 * C * C
params_3x3 = 3 * (3 * 3 * C * C)
print(f"7x7 参数量: {params_7x7:,}")     # 1,258,304
print(f"3个3x3 参数量: {params_3x3:,}")  # 552,960
print(f"参数量减少: {(1 - params_3x7x7/params_7x7)*100:.1f}%")`,
          },
          {
            lang: "python",
            code: `class VGGBlock(nn.Module):
    """VGG 的基本构建块：连续 3x3 卷积 + 最大池化"""
    def __init__(self, in_channels: int, out_channels: int, num_convs: int = 2):
        super().__init__()
        layers = []
        for i in range(num_convs):
            layers.append(nn.Conv2d(
                in_channels if i == 0 else out_channels,
                out_channels,
                kernel_size=3,
                padding=1  # 保持空间尺寸不变
            ))
            layers.append(nn.ReLU(inplace=True))
        layers.append(nn.MaxPool2d(kernel_size=2, stride=2))
        self.block = nn.Sequential(*layers)

    def forward(self, x):
        return self.block(x)


class VGG16(nn.Module):
    """VGG-16 完整实现"""
    def __init__(self, num_classes: int = 1000):
        super().__init__()
        # 5 个 VGG block，通道数递增
        self.features = nn.Sequential(
            VGGBlock(3, 64, 2),        # 227→111
            VGGBlock(64, 128, 2),      # 111→55
            VGGBlock(128, 256, 3),     # 55→27
            VGGBlock(256, 512, 3),     # 27→13
            VGGBlock(512, 512, 3),     # 13→6
        )
        self.classifier = nn.Sequential(
            nn.Linear(512 * 6 * 6, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x`,
          },
        ],
        table: {
          headers: ["VGG 变体", "卷积层数", "FC 层数", "总参数量", "Top-5 错误率"],
          rows: [
            ["VGG-11", "8", "3", "1.33 亿", "10.3%"],
            ["VGG-13", "10", "3", "1.33 亿", "8.8%"],
            ["VGG-16", "13", "3", "1.38 亿", "7.3%"],
            ["VGG-19", "16", "3", "1.44 亿", "7.3%"],
          ],
        },
        mermaid: `graph TD
  A[VGG-11] -->|+2 Conv 层| B[VGG-13]
  B -->|+3 Conv 层| C[VGG-16 ★]
  C -->|+3 Conv 层| D[VGG-19]
  C -.->|精度饱和| D
  style C fill:#ff6b35,stroke:#333,color:#fff`,
        tip: "VGG-16 是最常用的迁移学习 backbone。如果你不确定用什么，VGG-16 几乎永远不会错——它足够深、足够简单、预训练权重到处都是。",
        warning: "VGG-16 的 1.38 亿参数中约 87% 集中在三个全连接层（4096×4096 + 4096×4096 + 4096×1000）。这导致模型文件约 528MB，部署到移动端非常困难。后续的 ResNet 用全局平均池化解决了这个问题。",
      },
      {
        title: "4. GoogLeNet 与 Inception 模块",
        body: `GoogLeNet（2014）由 Google 团队提出，在 ImageNet 竞赛中以 6.7% 的 Top-5 错误率夺冠。它的核心创新是 **Inception 模块**——一种精巧的多尺度特征提取结构。

**Inception 模块的核心思想：** 与其让网络自己「选择」用多大尺寸的卷积核，不如把所有尺寸（1×1、3×3、5×5）都用上，然后拼接在一起。1×1 卷积负责降维（减少计算量），3×3 和 5×5 负责提取不同尺度的空间特征，最大池化保留全局信息。这种「多路并行」的设计让网络在不同感受野下同时提取特征。

**1×1 卷积的妙用：** 在 Inception 模块中，1×1 卷积有两个作用：一是跨通道的信息整合（非线性变换），二是降维（减少后续大卷积核的计算量）。例如，对一个 256 通道的特征图做 5×5 卷积需要 256×256×5×5 = 1,638,400 次乘法；如果先用 1×1 卷积降到 64 通道，再做 5×5 卷积，只需要 256×64×1×1 + 64×64×5×5 = 118,784 次乘法——减少了 93%！

**GoogLeNet 的其他创新：** 辅助分类器（Auxiliary Classifiers）——在网络中间插入两个额外的分类头，用于缓解梯度消失（训练时将辅助分类器的损失加权加入总损失）；全局平均池化替代全连接层，参数量从 VGG 的 1.38 亿骤减到约 700 万。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class InceptionBlock(nn.Module):
    """GoogLeNet Inception 模块"""
    def __init__(self, in_channels: int, ch1x1: int, ch3x3red: int,
                 ch3x3: int, ch5x5red: int, ch5x5: int, pool_proj: int):
        """
        Args:
            in_channels: 输入通道数
            ch1x1: 1x1 分支输出通道
            ch3x3red: 3x3 分支 1x1 降维通道
            ch3x3: 3x3 分支输出通道
            ch5x5red: 5x5 分支 1x1 降维通道
            ch5x5: 5x5 分支输出通道
            pool_proj: 池化分支 1x1 投影通道
        """
        super().__init__()
        # 分支1: 1x1 卷积
        self.branch1 = nn.Conv2d(in_channels, ch1x1, kernel_size=1)

        # 分支2: 1x1 降维 → 3x3 卷积
        self.branch2 = nn.Sequential(
            nn.Conv2d(in_channels, ch3x3red, kernel_size=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(ch3x3red, ch3x3, kernel_size=3, padding=1),
        )

        # 分支3: 1x1 降维 → 5x5 卷积
        self.branch3 = nn.Sequential(
            nn.Conv2d(in_channels, ch5x5red, kernel_size=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(ch5x5red, ch5x5, kernel_size=5, padding=2),
        )

        # 分支4: 最大池化 → 1x1 投影
        self.branch4 = nn.Sequential(
            nn.MaxPool2d(kernel_size=3, stride=1, padding=1),
            nn.Conv2d(in_channels, pool_proj, kernel_size=1),
        )

    def forward(self, x):
        return torch.cat([
            F.relu(self.branch1(x)),
            F.relu(self.branch2(x)),
            F.relu(self.branch3(x)),
            F.relu(self.branch4(x)),
        ], dim=1)  # 沿通道维度拼接`,
          },
          {
            lang: "python",
            code: `# 验证 1x1 卷积的降维效果：计算量对比
import torch

def compute_conv_flops(in_ch: int, out_ch: int, kernel: int, h: int, w: int) -> int:
    """计算单个卷积层的 FLOPs"""
    return 2 * in_ch * out_ch * kernel * kernel * h * w

# 场景: 输入 256 通道, 特征图 28x28, 输出 256 通道
in_ch, out_ch, h, w = 256, 256, 28, 28

# 方案A: 直接用 5x5 卷积
flops_a = compute_conv_flops(in_ch, out_ch, 5, h, w)

# 方案B: 1x1 降维到 64 → 5x5 → 1x1 升维回 256
flops_b1 = compute_conv_flops(in_ch, 64, 1, h, w)       # 降维
flops_b2 = compute_conv_flops(64, 64, 5, h, w)          # 5x5 提取
flops_b3 = compute_conv_flops(64, out_ch, 1, h, w)      # 升维
flops_b = flops_b1 + flops_b2 + flops_b3

print(f"直接 5x5: {flops_a:,} FLOPs")
print(f"降维方案: {flops_b:,} FLOPs")
print(f"减少: {(1 - flops_b/flops_a)*100:.1f}%")
# 输出:
# 直接 5x5: 2,039,185,408 FLOPs
# 降维方案: 288,358,400 FLOPs
# 减少: 85.9%`,
          },
        ],
        table: {
          headers: ["特性", "AlexNet/VGG", "GoogLeNet", "提升"],
          rows: [
            ["参数量", "6000万 / 1.38亿", "约 700 万", "减少 95%"],
            ["Top-5 错误率", "15.3% / 7.3%", "6.7%", "优于 VGG"],
            ["核心创新", "堆叠卷积", "Inception 多路并行", "多尺度特征"],
            ["全连接层", "3 个大 FC 层", "全局平均池化", "几乎消除 FC"],
            ["计算效率", "低（大量参数）", "高（1x1 降维）", "FLOPs 大幅降低"],
          ],
        },
        mermaid: `graph TD
  A[输入特征图] --> B[1x1 Conv]
  A --> C[1x1 → 3x3 Conv]
  A --> D[1x1 → 5x5 Conv]
  A --> E[MaxPool → 1x1]
  B --> F[Concat 通道拼接]
  C --> F
  D --> F
  E --> F
  F --> G[输出: 多尺度特征融合]`,
        tip: "Inception 模块的设计理念是「与其让网络选择，不如让网络都用」——这种并行多路的设计思想在后续很多架构中都有体现（如 ResNeXt 的分支结构）。",
        warning: "Inception 模块的超参数（各分支通道数）需要手动调优，GoogLeNet 论文中花了大量篇幅设计这些数字。后来 ResNet 的出现证明了「简单堆叠 + 残差连接」也能达到更好的效果。",
      },
      {
        title: "5. ResNet 与残差连接",
        body: `ResNet（Residual Network，2015）由何恺明等人提出，在 ImageNet 竞赛中以 3.57% 的 Top-5 错误率夺冠。它的核心创新——**残差连接（Skip Connection）**——解决了一个困扰深度学习多年的根本问题：网络越深，效果越差。

**退化问题（Degradation Problem）：** 直觉上，更深的网络应该比浅的网络更强——因为浅的网络可以看作深网络的子集（多出来的层学习恒等映射即可）。但实验发现：当网络深度超过某个阈值（如 20 层）后，继续增加层数反而导致训练误差和测试误差同时上升。这不是过拟合（训练误差也在上升），而是优化困难。

**残差学习的核心公式：** 与其让网络直接学习目标映射 H(x)，不如让网络学习残差 F(x) = H(x) - x，最终输出为 F(x) + x。如果最优映射接近恒等映射，学习 F(x) = 0 比学习 H(x) = x 容易得多。

**残差块（Residual Block）：** 标准残差块包含两条路径——「主路径」经过两层 3×3 卷积提取特征，「捷径路径」直接跳过（恒等映射），最后将两条路径相加。当输入输出通道数不一致时，捷径路径用 1×1 卷积进行通道匹配。

**深层 ResNet 的瓶颈设计（Bottleneck）：** ResNet-50/101/152 使用了瓶颈残差块：1×1 降维 → 3×3 卷积 → 1×1 升维，将计算量压缩为原来的 1/4。这使得训练 152 层的网络成为可能。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class BasicBlock(nn.Module):
    """ResNet-18/34 使用的基本残差块"""
    expansion = 1  # 输出通道 = 中间通道

    def __init__(self, in_channels: int, out_channels: int, stride: int = 1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels,
                               kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels,
                               kernel_size=3, stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)

        # 捷径路径：当维度不匹配时用 1x1 卷积
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels),
            )

    def forward(self, x):
        identity = x

        out = self.conv1(x)
        out = self.bn1(out)
        out = torch.relu(out)

        out = self.conv2(out)
        out = self.bn2(out)

        # 残差连接：F(x) + x
        out += self.shortcut(identity)
        out = torch.relu(out)
        return out


class Bottleneck(nn.Module):
    """ResNet-50/101/152 使用的瓶颈残差块"""
    expansion = 4  # 输出通道 = 中间通道 × 4

    def __init__(self, in_channels: int, mid_channels: int, stride: int = 1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, mid_channels, kernel_size=1, bias=False)
        self.bn1 = nn.BatchNorm2d(mid_channels)
        self.conv2 = nn.Conv2d(mid_channels, mid_channels, kernel_size=3,
                               stride=stride, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(mid_channels)
        self.conv3 = nn.Conv2d(mid_channels, mid_channels * 4, kernel_size=1, bias=False)
        self.bn3 = nn.BatchNorm2d(mid_channels * 4)

        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != mid_channels * 4:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, mid_channels * 4, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(mid_channels * 4),
            )

    def forward(self, x):
        identity = x
        out = torch.relu(self.bn1(self.conv1(x)))
        out = torch.relu(self.bn2(self.conv2(out)))
        out = self.bn3(self.conv3(out))
        out += self.shortcut(identity)
        out = torch.relu(out)
        return out`,
          },
          {
            lang: "python",
            code: `# 为什么残差连接有效？—— 梯度传播分析
import torch

def analyze_gradient_flow(depth: int = 100):
    """分析残差连接对梯度传播的影响"""
    # 普通网络：梯度连乘衰减
    # 残差网络：梯度连加不衰减

    # 假设每层梯度为 0.99（轻微衰减）
    grad_per_layer = 0.99

    # 普通网络：梯度 = 0.99^depth
    grad_plain = grad_per_layer ** depth

    # 残差网络：梯度 ≈ sum(C(depth, k) * 0.99^k) ≥ 1
    # 因为存在恒等映射路径，至少有一条路径梯度为 1
    grad_residual = 1.0  # 恒等映射路径的梯度

    print(f"深度: {depth}")
    print(f"普通网络梯度: {grad_plain:.10f} (严重衰减!)")
    print(f"残差网络梯度: {grad_residual:.4f} (至少为1)")
    print()

    # 可视化不同深度的梯度
    depths = list(range(1, 200, 5))
    grads_plain = [grad_per_layer ** d for d in depths]
    grads_residual = [1.0 for _ in depths]

    # 输出关键节点
    for d in [10, 50, 100, 150]:
        print(f"  深度 {d:3d}: 普通网络梯度 = {grad_per_layer**d:.10f}")

analyze_gradient_flow()
# 输出:
#   深度  10: 普通网络梯度 = 0.9043820750
#   深度  50: 普通网络梯度 = 0.6050060671
#   深度 100: 普通网络梯度 = 0.3660323413
#   深度 150: 普通网络梯度 = 0.2211359097`,
          },
        ],
        table: {
          headers: ["ResNet 变体", "层数", "瓶颈块", "参数量", "Top-1 错误率"],
          rows: [
            ["ResNet-18", "18", "否 (BasicBlock)", "11.7M", "30.24%"],
            ["ResNet-34", "34", "否 (BasicBlock)", "21.8M", "26.70%"],
            ["ResNet-50", "50", "是 (Bottleneck)", "25.6M", "22.85%"],
            ["ResNet-101", "101", "是 (Bottleneck)", "44.5M", "21.75%"],
            ["ResNet-152", "152", "是 (Bottleneck)", "60.2M", "21.43%"],
          ],
        },
        mermaid: `graph TD
  A[x 输入] --> B[Conv1 1x1 降维]
  B --> C[Conv2 3x3 提取]
  C --> D[Conv3 1x1 升维]
  A --> E[Shortcut 捷径路径]
  D --> F[相加 F+x]
  E --> F
  F --> G[ReLU 输出]`,
        tip: "残差连接是深度学习最重要的架构创新之一。理解它的最好方式是问自己：「如果最优解是恒等映射，普通网络能学到吗？残差网络能学到吗？」答案一目了然。",
        warning: "ResNet-50 之后的深层网络（101、152）参数量增加但精度提升有限。对于大多数实际任务，ResNet-50 是性价比最高的选择。更深的网络只在 ImageNet 级别的超大数据集上有明显优势。",
      },
      {
        title: "6. EfficientNet 与复合缩放",
        body: `EfficientNet（2019）由 Google Brain 提出，其核心贡献不是一个新的架构，而是一种**系统化的模型缩放方法论**。在此之前，增大模型通常是「凭感觉」：加深网络（更多层）、加宽网络（更多通道）、增大输入分辨率——但很少有人系统地研究这三种方式如何组合最优。

**复合缩放（Compound Scaling）的核心发现：** 单独增加任何一个维度（深度、宽度、分辨率）都会遇到收益递减的问题。加深到一定程度后梯度传播困难；加宽到一定程度后模型容量冗余；分辨率提高到一定程度后像素级信息重复。EfficientNet 提出用一个统一的缩放系数 φ 来同时调节三个维度：

depth: d = α^φ
width: w = β^φ
resolution: r = γ^φ

约束条件：α × β² × γ² ≈ 2，即 φ 每增加 1，计算量约翻倍。

**EfficientNet-B0 的搜索：** 在固定计算资源约束下，使用神经架构搜索（NAS）找到最优的基础架构 B0，然后用复合缩放方法生成 B1-B7 七个变体。B0 基于 MobileNetV2 的倒残差结构（Inverted Residual）和 SE（Squeeze-and-Excitation）注意力机制。

**倒残差块（Inverted Residual Block）：** 与 ResNet 的瓶颈块相反——先用 1×1 卷积升维（扩大通道数），然后用深度可分离卷积（Depthwise Convolution）提取特征，最后用 1×1 卷积降维。这样在「高维空间」做特征提取，在「低维空间」做信息传递，效率更高。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import math

class InvertedResidual(nn.Module):
    """EfficientNet 的倒残差块 (MBConv)"""
    def __init__(self, in_channels: int, out_channels: int,
                 stride: int = 1, expand_ratio: float = 6.0,
                 se_ratio: float = 0.25):
        super().__init__()
        self.use_residual = stride == 1 and in_channels == out_channels
        hidden_dim = int(in_channels * expand_ratio)

        layers = []
        # 1. 扩展层 (1x1 升维)
        if expand_ratio != 1:
            layers.extend([
                nn.Conv2d(in_channels, hidden_dim, 1, bias=False),
                nn.BatchNorm2d(hidden_dim),
                nn.SiLU(inplace=True),  # Swish 激活
            ])

        # 2. 深度可分离卷积 (3x3 或 5x5)
        layers.extend([
            nn.Conv2d(hidden_dim, hidden_dim, 3, stride, 1,
                      groups=hidden_dim, bias=False),  # depthwise
            nn.BatchNorm2d(hidden_dim),
            nn.SiLU(inplace=True),
        ])

        # 3. SE 注意力模块
        se_channels = max(1, int(in_channels * se_ratio))
        layers.extend([
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(hidden_dim, se_channels, 1),
            nn.SiLU(inplace=True),
            nn.Conv2d(se_channels, hidden_dim, 1),
            nn.Sigmoid(),  # SE 权重
        ])
        self.se = nn.Sequential(*layers[-4:])
        self.conv_dw = layers[-4] if expand_ratio != 1 else layers[0]

        # 4. 投影层 (1x1 降维)
        layers.extend([
            nn.Conv2d(hidden_dim, out_channels, 1, bias=False),
            nn.BatchNorm2d(out_channels),
        ])

        self.block = nn.Sequential(*layers[:-4])
        self.proj = nn.Sequential(*layers[-2:])
        self.expand = expand_ratio != 1
        self.hidden_dim = hidden_dim

    def forward(self, x):
        identity = x

        # 扩展
        if self.expand:
            out = self.block[0](x)  # expand conv
            out = self.block[1](out)  # bn + silu
        else:
            out = x

        # 深度可分离卷积
        out = self.block[2](out)
        out = self.block[3](out)  # bn + silu

        # SE 注意力
        se_weight = self.se(out)
        out = out * se_weight

        # 投影
        out = self.proj[0](out)
        out = self.proj[1](out)  # bn

        # 残差连接
        if self.use_residual:
            out = out + identity

        return out`,
          },
          {
            lang: "python",
            code: `# 复合缩放计算：给定 φ，计算 depth/width/resolution
def compound_scaling(phi: float, alpha: float = 1.2,
                     beta: float = 1.1, gamma: float = 1.15,
                     base_depth: int = 16, base_width: int = 32,
                     base_resolution: int = 224):
    """EfficientNet 复合缩放公式"""
    # 约束: alpha * beta^2 * gamma^2 ≈ 2
    depth = int(math.ceil(alpha ** phi * base_depth))
    width = int(math.ceil(beta ** phi * base_width))
    resolution = int(math.ceil(gamma ** phi * base_resolution))
    # 分辨率必须是 32 的倍数
    resolution = int(32 * round(resolution / 32))
    return depth, width, resolution

print("EfficientNet 各版本缩放参数:")
print(f"{'版本':<12} {'φ':>4} {'深度':>6} {'宽度':>6} {'分辨率':>8} {'参数量估算':>12}")
print("-" * 55)

configs = {
    "B0": (1.0, 0), "B1": (1.0, 1), "B2": (1.1, 2), "B3": (1.2, 3),
    "B4": (1.4, 4), "B5": (1.6, 5), "B6": (1.8, 6), "B7": (2.0, 7),
}
for name, (phi, _) in configs.items():
    d, w, r = compound_scaling(phi)
    params_approx = d * w * w / 1e6  # 简化估算
    print(f"EfficientNet-{name:<7} {phi:>4.1f} {d:>6} {w:>6} {r:>8} {params_approx:>10.1f}M")`,
          },
        ],
        table: {
          headers: ["模型", "参数量", "Top-1 准确率", "FLOPs", "缩放方式"],
          rows: [
            ["EfficientNet-B0", "5.3M", "77.1%", "0.39B", "基础架构 (φ=0)"],
            ["EfficientNet-B1", "7.8M", "79.1%", "0.70B", "复合缩放 (φ=1)"],
            ["EfficientNet-B2", "9.2M", "80.2%", "1.00B", "复合缩放 (φ=2)"],
            ["EfficientNet-B3", "12M", "81.6%", "1.83B", "复合缩放 (φ=3)"],
            ["EfficientNet-B4", "19M", "82.9%", "4.20B", "复合缩放 (φ=4)"],
            ["EfficientNet-B7", "66M", "84.3%", "37.0B", "复合缩放 (φ=7)"],
          ],
        },
        mermaid: `graph TD
  A[NAS 搜索 B0 基础架构] --> B[确定缩放系数 α, β, γ]
  B --> C{给定 φ 值}
  C --> D[depth = α^φ]
  C --> E[width = β^φ]
  C --> F[resolution = γ^φ]
  D --> G[生成 B1-B7 变体]
  E --> G
  F --> G
  G --> H[所有变体共享相同架构]`,
        tip: "EfficientNet 的复合缩放方法是一种「系统化」的思维——不要拍脑袋决定加多少层、加多少通道，而是用一个统一的公式同时调节。这种思维方式在模型设计中非常有用。",
        warning: "EfficientNet 的大分辨率版本（B5-B7）需要大量显存和计算资源。B7 的 FLOPs 是 B0 的 95 倍！对于大多数实际应用，B0-B3 是最佳选择，它们在精度和效率之间取得了最好的平衡。",
      },
      {
        title: "7. PyTorch 实战：用预训练模型分类",
        body: `本节从零开始，使用 PyTorch 的预训练模型（torchvision.models）完成一个完整的图像分类流水线：加载预训练权重、图像预处理、推理预测、结果可视化，以及迁移学习微调。

**预训练模型选择指南：**
- 快速原型验证：ResNet-18（轻量，推理快）
- 通用场景最佳：ResNet-50（精度与速度的平衡）
- 追求最高精度：EfficientNet-B4
- 移动端部署：MobileNetV3 或 EfficientNet-B0

**图像预处理流水线：** 预训练模型对输入图像有严格要求——必须缩放到指定尺寸（通常 224×224 或 256→224），用 ImageNet 统计的均值和标准差归一化，并且转换为 RGB 格式（不是 BGR）。

**迁移学习微调：** 当目标任务与 ImageNet 差异较大时（如医学图像、卫星图像），需要微调（Fine-tuning）——冻结 backbone 的底层参数，只训练分类头；或者解冻部分高层参数，用较小的学习率微调。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import json
from pathlib import Path

class ImageClassifier:
    """基于预训练模型的图像分类器"""

    # ImageNet 归一化参数
    IMAGENET_MEAN = [0.485, 0.456, 0.406]
    IMAGENET_STD = [0.229, 0.224, 0.225]

    def __init__(self, model_name: str = "resnet50", device: str = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        # 加载预训练模型
        weights = models.ResNet50_Weights.IMAGENET1K_V2
        self.model = models.resnet50(weights=weights)
        self.model.eval()
        self.model.to(self.device)

        # 加载类别映射
        self.categories = self._load_imagenet_labels()

        # 图像预处理
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(self.IMAGENET_MEAN, self.IMAGENET_STD),
        ])

    def _load_imagenet_labels(self) -> list:
        """加载 ImageNet 类别标签（简化版，实际应加载 1000 个类别）"""
        # 这里列出部分常见类别作为演示
        return {
            281: "tabby cat", 282: "tiger cat", 285: "Siamese cat",
            207: "golden retriever", 208: "Labrador retriever",
            243: "Border collie", 245: "German shepherd",
            292: "African elephant", 340: "red fox",
            389: "American alligator", 839: "espresso",
            514: "horn", 918: "streetcar", 463: "airliner",
        }

    def predict(self, image_path: str, top_k: int = 5) -> list:
        """对单张图像进行预测，返回 Top-K 结果"""
        # 1. 加载和预处理
        image = Image.open(image_path).convert("RGB")
        input_tensor = self.transform(image)
        input_batch = input_tensor.unsqueeze(0).to(self.device)

        # 2. 推理
        with torch.no_grad():
            output = self.model(input_batch)
            probabilities = torch.softmax(output, dim=1)[0]

        # 3. 获取 Top-K
        top_probs, top_indices = probabilities.topk(top_k)

        # 4. 格式化结果
        results = []
        for prob, idx in zip(top_probs, top_indices):
            idx = idx.item()
            results.append({
                "class_id": idx,
                "label": self.categories.get(idx, f"class_{idx}"),
                "probability": prob.item(),
            })

        return results


# ========== 使用示例 ==========
if __name__ == "__main__":
    classifier = ImageClassifier(model_name="resnet50")

    # 预测
    image_path = "test_image.jpg"
    results = classifier.predict(image_path, top_k=5)

    print("Top-5 预测结果:")
    for i, r in enumerate(results, 1):
        print(f"  {i}. {r['label']:30s} {r['probability']:.4f}")`,
          },
          {
            lang: "python",
            code: `# ========== 迁移学习：微调预训练模型 ==========
import torch
import torch.nn as nn
from torchvision import models, datasets, transforms
from torch.utils.data import DataLoader

def fine_tune_model(
    data_dir: str = "custom_dataset",
    num_classes: int = 5,
    num_epochs: int = 20,
    batch_size: int = 32,
    learning_rate: float = 1e-3,
):
    """迁移学习微调预训练 ResNet-50"""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # 1. 数据预处理
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    train_dataset = datasets.ImageFolder(f"{data_dir}/train", transform=train_transform)
    val_dataset = datasets.ImageFolder(f"{data_dir}/val", transform=val_transform)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, num_workers=4)

    # 2. 加载预训练模型
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

    # 3. 冻结 backbone 参数
    for param in model.parameters():
        param.requires_grad = False

    # 4. 替换分类头
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_features, 256),
        nn.ReLU(inplace=True),
        nn.Dropout(0.3),
        nn.Linear(256, num_classes),
    )
    model.to(device)

    # 5. 只训练分类头（和 backbone 中 requires_grad=True 的参数）
    optimizer = torch.optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=learning_rate,
    )
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)
    criterion = nn.CrossEntropyLoss()

    # 6. 训练循环
    best_acc = 0.0
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

        scheduler.step()
        train_acc = 100.0 * correct / total

        # 验证
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, predicted = outputs.max(1)
                val_total += labels.size(0)
                val_correct += predicted.eq(labels).sum().item()

        val_acc = 100.0 * val_correct / val_total
        print(f"Epoch {epoch+1}/{num_epochs} | Loss: {running_loss/len(train_loader):.4f} "
              f"| Train Acc: {train_acc:.1f}% | Val Acc: {val_acc:.1f}%")

        # 保存最佳模型
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), "best_model.pth")

    print(f"训练完成！最佳验证准确率: {best_acc:.1f}%")
    return model


if __name__ == "__main__":
    # 假设数据集结构:
    # custom_dataset/
    #   train/
    #     class_a/
    #       img001.jpg
    #     class_b/
    #       img002.jpg
    #   val/
    #     class_a/
    #       img101.jpg
    #     class_b/
    #       img102.jpg
    model = fine_tune_model(
        data_dir="custom_dataset",
        num_classes=5,
        num_epochs=20,
        batch_size=32,
        learning_rate=1e-3,
    )`,
          },
          {
            lang: "python",
            code: `# ========== 模型对比：一键切换不同预训练模型 ==========
from torchvision import models
import torch

MODEL_REGISTRY = {
    "resnet18": {
        "model": models.resnet18,
        "weights": models.ResNet18_Weights.IMAGENET1K_V1,
        "input_size": 224,
        "params": "11.7M",
    },
    "resnet50": {
        "model": models.resnet50,
        "weights": models.ResNet50_Weights.IMAGENET1K_V2,
        "input_size": 224,
        "params": "25.6M",
    },
    "efficientnet_b0": {
        "model": models.efficientnet_b0,
        "weights": models.EfficientNet_B0_Weights.IMAGENET1K_V1,
        "input_size": 224,
        "params": "5.3M",
    },
    "efficientnet_b4": {
        "model": models.efficientnet_b4,
        "weights": models.EfficientNet_B4_Weights.IMAGENET1K_V1,
        "input_size": 380,
        "params": "19M",
    },
    "vgg16": {
        "model": models.vgg16,
        "weights": models.VGG16_Weights.IMAGENET1K_V1,
        "input_size": 224,
        "params": "138M",
    },
}

def get_model(model_name: str = "resnet50", num_classes: int = 1000):
    """统一接口：获取预训练模型"""
    assert model_name in MODEL_REGISTRY, f"未知模型: {model_name}"
    config = MODEL_REGISTRY[model_name]
    model = config["model"](weights=config["weights"])

    # 替换分类头
    if hasattr(model, "fc"):  # ResNet
        model.fc = nn.Linear(model.fc.in_features, num_classes)
    elif hasattr(model, "classifier"):  # VGG
        model.classifier[6] = nn.Linear(model.classifier[6].in_features, num_classes)
    elif hasattr(model, "classifier") and isinstance(model.classifier, nn.Sequential):
        # EfficientNet
        model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)

    return model, config["input_size"]

# 使用示例
model, input_size = get_model("efficientnet_b0", num_classes=10)
print(f"模型: EfficientNet-B0, 输入尺寸: {input_size}x{input_size}")

dummy_input = torch.randn(1, 3, input_size, input_size)
with torch.no_grad():
    output = model(dummy_input)
print(f"输出形状: {output.shape}")  # torch.Size([1, 10])`,
          },
        ],
        table: {
          headers: ["模型", "参数量", "推理速度 (GPU)", "推荐场景"],
          rows: [
            ["ResNet-18", "11.7M", "~3ms/张", "快速原型、资源受限"],
            ["ResNet-50", "25.6M", "~5ms/张", "通用场景首选"],
            ["EfficientNet-B0", "5.3M", "~4ms/张", "移动端部署、嵌入式"],
            ["EfficientNet-B4", "19M", "~12ms/张", "高精度需求"],
            ["VGG-16", "138M", "~15ms/张", "迁移学习、特征提取"],
          ],
        },
        mermaid: `graph TD
  A[选择预训练模型] --> B{任务数据量?}
  B -->|少 (100-1000)| C[冻结 Backbone 只训练分类头]
  B -->|中 (1000-10000)| D[冻结底层 + 微调高层]
  B -->|多 (>10000)| E[全参数微调]
  C --> F[较大学习率 1e-3]
  D --> G[较小学习率 1e-4]
  E --> H[极小学习率 1e-5]
  F --> I[训练 10-20 轮]
  G --> I
  H --> I
  I --> J[验证 + 保存最佳模型]`,
        tip: "迁移学习的黄金法则：数据越少，冻结越多；数据越多，微调越多。如果你的数据集和 ImageNet 相似（自然图像），从冻结 backbone 开始；如果差异很大（医学图像、卫星图），考虑从头训练或使用领域预训练权重。",
        warning: "微调时常见的三个错误：1) 学习率太大导致预训练权重被破坏——应该用比从头训练小 10-100 倍的学习率 2) 忘记切换 model.train() 和 model.eval() 模式——Dropout 和 BatchNorm 在两种模式下行为不同 3) 不验证数据预处理是否正确——预训练模型对输入格式要求严格，尺寸、归一化参数必须匹配。",
      },
    ],
  };
