import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-006",
    title: "CNN：卷积神经网络架构详解（基础篇）",
    category: "dl",
    tags: ["CNN", "卷积", "计算机视觉"],
    summary: "从全连接层的缺陷到 ResNet，系统梳理 CNN 的核心组件、经典架构演进与 PyTorch 实战",
    date: "2026-04-12",
    readTime: "18 min",
    level: "入门",
  learningPath: {
    routeId: "cnn-series",
    phase: 1,
    order: 1,
    nextStep: "dl-020",
    prevStep: null,
  },
    content: [
        {
            title: "1. 为什么需要 CNN：全连接层的根本缺陷",
            body: `全连接网络（Fully Connected Network）处理图像时面临两个致命问题。第一是参数爆炸：一张 224×224 的 RGB 图片展平后是 150,528 维输入，即使第一层只有 100 个神经元，参数量也高达 1500 万，远超合理范围。第二是空间信息丢失：展平操作（Flatten）将二维像素矩阵变成一维向量，破坏了像素间的局部邻接关系——相邻像素在展平后可能相距甚远，网络无法利用「附近的像素往往语义相关」这一视觉先验。

CNN 通过两个核心设计解决这些问题：局部感受野（Local Receptive Field）和权重共享（Weight Sharing）。局部感受野意味着每个神经元只看输入的一小块区域（如 3×3），而不是全局；权重共享意味着同一个卷积核在整张图上滑动复用，无论检测到的特征出现在图片的哪个位置，都用同一组参数识别。这两个机制将参数量从 O(n²) 压缩到 O(k²)，同时天然保留了空间结构信息。

从生物学角度看，CNN 受到视觉皮层（Visual Cortex）的启发。Hubel 和 Wiesel 在 1959 年发现猫的视觉皮层中存在对特定方向边缘敏感的简单细胞，这些细胞只响应视野中的局部刺激。CNN 中的卷积核正是对这种局部方向选择性的数学建模。`,
            code: [
                { lang: "python", code: `import torch
import torch.nn as nn

# 全连接层处理 32x32 RGB 图像的参数对比
fc_params = 32 * 32 * 3 * 128  # 输入层到 128 个神经元
print(f"全连接层参数量: {fc_params:,}")  # 393,216

# 等价的 3x3 卷积层
conv_params = 3 * 3 * 3 * 128 + 128  # 128 个 3x3 卷积核 + bias
print(f"卷积层参数量: {conv_params:,}")  # 3,584` },
                { lang: "python", code: `# 可视化展平操作破坏空间信息
import numpy as np

# 3x3 单通道图像，相邻像素为 1
img = np.array([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
])

# 展平后，原本相邻的 3 和 4 在向量中相距很远
flattened = img.flatten()
print(f"原始 2D:\\n{img}")
print(f"展平后: {flattened}")
# 像素 3(index=2) 和像素 4(index=3) 虽然相邻，但语义关联被削弱` },
            ],
            table: {
                headers: ["特性", "全连接网络", "卷积神经网络"],
                rows: [
                    ["参数量 (224×224 RGB)", "1500 万+", "约 9K (3×3×3×64)"],
                    ["空间信息保留", "丢失（展平破坏）", "保留（2D 结构）"],
                    ["平移不变性", "无", "有（权重共享）"],
                    ["局部特征检测", "弱", "强"],
                    ["适合图像任务", "不适合", "非常适合"],
                ],
            },
            mermaid: `graph LR
    A["224×224×3 输入"] -->|展平| B["150528 维向量"]
    B -->|全连接| C["1500 万+ 参数"]
    A -->|3×3 卷积| D["64 个特征图"]
    D -->|权重共享| E["仅 1,792 参数"]
    C -. "参数爆炸" .-> F["过拟合风险"]
    E -. "参数高效" .-> G["泛化能力强"]`,
            tip: "理解 CNN 的关键：把卷积核想象成「在图像上滑动的探测器」，每个探测器专门寻找一种局部模式（如边缘、纹理）。",
            warning: "不要用全连接网络处理高分辨率图像——即使训练集精度很高，测试集也会因参数量过大而严重过拟合。",
        },
        {
            title: "2. 卷积运算详解：卷积核、步长与填充",
            body: `卷积（Convolution）是 CNN 的核心运算。在深度学习中，我们实际执行的是互相关（Cross-Correlation）——虽然严格意义上的卷积需要将核翻转 180°，但网络会通过学习自动调整核的权重，因此翻转与否不影响表达能力。

卷积运算包含三个关键超参数：卷积核大小（Kernel Size）、步长（Stride）和填充（Padding）。卷积核大小决定了感受野的范围，3×3 是最常见的选择（两个 3×3 卷积的等效感受野等于一个 5×5 卷积，但参数量更少、非线性更强）。步长控制核每次滑动的距离，步长为 2 时输出尺寸减半，常用于下采样。填充用于在输入四周补零，保持输出尺寸不变（Same Padding）或允许核访问边缘区域。

多通道卷积是实际使用中的关键：当输入有 C_in 个通道时，每个卷积核也是 C_in 通道的 3D 张量。卷积核在每个通道上分别做 2D 卷积后将结果相加，再加一个偏置项，得到一个通道的输出。如果有 C_out 个卷积核，就得到 C_out 个通道的输出。这就是卷积层的参数量公式：C_out × (kernel_h × kernel_w × C_in + 1)。`,
            code: [
                { lang: "python", code: `import torch
import torch.nn as nn

# 2D 卷积层参数解析
conv = nn.Conv2d(
    in_channels=3,      # RGB 三通道
    out_channels=16,    # 16 个卷积核
    kernel_size=3,      # 3x3 卷积核
    stride=1,           # 步长 1
    padding=1,          # 填充 1（保持尺寸）
    bias=True
)

# 参数量 = 16 * (3*3*3 + 1) = 448
total_params = sum(p.numel() for p in conv.parameters())
print(f"参数量: {total_params}")

# 输入输出尺寸验证
x = torch.randn(1, 3, 32, 32)  # batch=1, C=3, H=32, W=32
out = conv(x)
print(f"输出形状: {out.shape}")  # torch.Size([1, 16, 32, 32])` },
                { lang: "python", code: `# 不同步长和填充对输出尺寸的影响
def conv_output_size(input_size, kernel_size, stride=1, padding=0):
    """计算卷积输出尺寸公式"""
    return (input_size + 2 * padding - kernel_size) // stride + 1

print("输入 32x32, 核 3x3:")
print(f"  stride=1, padding=0 → {conv_output_size(32, 3, 1, 0)}x{conv_output_size(32, 3, 1, 0)}")
print(f"  stride=1, padding=1 → {conv_output_size(32, 3, 1, 1)}x{conv_output_size(32, 3, 1, 1)}")
print(f"  stride=2, padding=1 → {conv_output_size(32, 3, 2, 1)}x{conv_output_size(32, 3, 2, 1)}")
# 输出: 30x30, 32x32, 16x16` },
            ],
            table: {
                headers: ["配置", "输入尺寸", "输出尺寸", "参数量变化"],
                rows: [
                    ["3×3, s=1, p=0", "32×32×3", "30×30×16", "基准"],
                    ["3×3, s=1, p=1", "32×32×3", "32×32×16", "尺寸不变"],
                    ["3×3, s=2, p=1", "32×32×3", "16×16×16", "减半（下采样）"],
                    ["5×5, s=1, p=2", "32×32×3", "32×32×16", "感受野更大"],
                    ["7×7, s=2, p=3", "224×224×3", "112×112×64", "首层常用"],
                ],
            },
            mermaid: `graph TD
    A["输入 32×32×3"] --> B["3×3 卷积核滑动"]
    B --> C{"步长 s=1?"}
    C -->|是| D["输出 30×30 (p=0)"]
    C -->|否, s=2| E["输出 15×15 (p=0)"]
    B --> F{"填充 p=1?"}
    F -->|是| G["输出 32×32"]
    F -->|否| D
    G --> H["每个位置 = 核·局部区域求和"]`,
            tip: "记住输出尺寸公式：output = (input + 2×padding - kernel) / stride + 1。这是面试和实战中最常考的公式之一。",
            warning: "步长过大（如 s>3）会导致大量像素被跳过，丢失重要信息；一般用 s=1 或 s=2 即可。",
        },
        {
            title: "3. 池化层：降维与不变性",
            body: `池化（Pooling）层是 CNN 中的下采样操作，它沿着空间维度（高度和宽度）滑动窗口，对每个窗口内的值做聚合运算。池化的主要目的有两个：降低特征图的空间尺寸从而减少后续层的计算量和参数，以及增强平移不变性（Translation Invariance）——即目标在图片中轻微移动时，池化后的输出变化不大。

最常见的池化方式是最大池化（Max Pooling），它取窗口内的最大值。这相当于在局部区域内做「特征存在性检测」：只要某个强特征（如边缘）出现在窗口内的任何位置，最大池化就能捕获到它。另一种方式是平均池化（Average Pooling），它计算窗口内的平均值，更适合保留整体背景信息。现代 CNN 中最大池化更常见，因为它能更好地保留显著特征。

全局平均池化（Global Average Pooling, GAP）是一种特殊形式：对整个特征图做平均，将 H×W×C 压缩为 1×1×C。它常用于网络末端替代 Flatten + 全连接层，大幅减少参数量并降低过拟合风险。ResNet 等现代架构广泛使用 GAP。`,
            code: [
                { lang: "python", code: `import torch
import torch.nn as nn

# 最大池化 vs 平均池化对比
x = torch.tensor([[[[1, 2, 3, 4],
                    [5, 6, 7, 8],
                    [9, 10, 11, 12],
                    [13, 14, 15, 16]]]]).float()  # (1,1,4,4)

max_pool = nn.MaxPool2d(kernel_size=2, stride=2)
avg_pool = nn.AvgPool2d(kernel_size=2, stride=2)

print("最大池化结果:\\n", max_pool(x))
# tensor([[[[ 6,  8],
#           [14, 16]]]])

print("平均池化结果:\\n", avg_pool(x))
# tensor([[[[ 3.50,  5.50],
#           [11.50, 13.50]]]])` },
                { lang: "python", code: `# 全局平均池化 (GAP) 替代全连接层
import torch.nn as nn

class GAPClassifier(nn.Module):
    """用全局平均池化代替 Flatten + FC"""
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
        )
        # GAP: (B, 128, 8, 8) -> (B, 128)
        self.gap = nn.AdaptiveAvgPool2d(1)
        self.classifier = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.features(x)
        x = self.gap(x).flatten(1)  # 全局平均
        return self.classifier(x)` },
            ],
            table: {
                headers: ["池化类型", "运算方式", "优点", "适用场景"],
                rows: [
                    ["最大池化", "取窗口最大值", "保留显著特征，平移不变", "特征提取层"],
                    ["平均池化", "取窗口平均值", "保留背景信息，平滑", "整体特征聚合"],
                    ["全局平均池化", "全图平均", "零参数，防过拟合", "分类头前"],
                    ["步幅卷积", "用 s>1 的卷积", "可学习下采样", "替代池化层"],
                ],
            },
            mermaid: `graph LR
    A["4×4 特征图"] -->|2×2 窗口| B["最大池化"]
    A -->|2×2 窗口| C["平均池化"]
    B --> D["2×2 输出
保留局部最强信号"]
    C --> E["2×2 输出
保留整体平均信息"]
    A -->|全局窗口| F["全局平均池化"]
    F --> G["1×1 输出
通道级摘要"]`,
            tip: "池化层没有可学习参数，它只是固定的下采样操作。理解它与步幅卷积（Strided Convolution）的区别很重要——后者是可学习的下采样。",
            warning: "过度使用池化会丢失太多空间信息，导致小目标检测性能下降。现代架构倾向于用步幅卷积或更深的网络替代过多池化。",
        },
        {
            title: "4. 经典架构演进：从 LeNet 到 ResNet",
            body: `CNN 的架构演进是深度学习史上最重要的故事之一。1998 年，Yann LeCun 提出 LeNet-5，用于手写数字识别。它只有 2 个卷积层和 2 个全连接层，约 6 万参数，在 MNIST 上达到了 99.2% 的准确率。LeNet-5 奠定了「卷积 → 池化 → 卷积 → 池化 → 全连接」的基本范式。

2012 年，Alex Krizhevsky 的 AlexNet 在 ImageNet 竞赛中以 15.3% 的错误率碾压第二名（26.2%），引爆了深度学习革命。AlexNet 的关键创新包括：使用 ReLU 激活函数替代 Sigmoid（训练速度提升数倍）、Dropout 正则化、GPU 并行训练，以及 5 层卷积 + 3 层全连接的更深架构。

2014 年，VGGNet 证明了「小卷积核 + 深网络」的有效性。它全部使用 3×3 卷积核，通过堆叠多层达到 16-19 层的深度。两个 3×3 卷积的感受野等于一个 5×5 卷积，但参数更少、非线性更强。同年，GoogLeNet（Inception）引入了 Inception 模块，在同一层并行使用不同大小的卷积核。

2015 年，微软的 ResNet（残差网络）解决了深度网络的退化问题。它引入了跳跃连接（Skip Connection），让网络学习残差 F(x) = H(x) - x 而不是直接学习 H(x)。这使得训练 152 层甚至 1000+ 层的网络成为可能，在 ImageNet 上达到 3.57% 的错误率，首次超越人类水平（约 5.1%）。`,
            code: [
                { lang: "python", code: `import torch.nn as nn

# LeNet-5 简化版 PyTorch 实现
class LeNet5(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 6, 5),      # 输入 1 通道, 6 个 5x5 核
            nn.Tanh(),
            nn.AvgPool2d(2),         # 池化 2x2
            nn.Conv2d(6, 16, 5),     # 16 个 5x5 核
            nn.Tanh(),
            nn.AvgPool2d(2),
        )
        self.classifier = nn.Sequential(
            nn.Linear(16 * 5 * 5, 120),
            nn.Tanh(),
            nn.Linear(120, 84),
            nn.Tanh(),
            nn.Linear(84, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = x.flatten(1)
        return self.classifier(x)` },
                { lang: "python", code: `# ResNet 基本残差块
import torch.nn as nn
import torch

class BasicBlock(nn.Module):
    """ResNet-18/34 使用的基本残差块"""
    expansion = 1

    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3,
                               stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3,
                               stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)

        # 跳跃连接的维度匹配
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels),
            )

    def forward(self, x):
        out = torch.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)  # 残差连接：核心！
        return torch.relu(out)` },
            ],
            table: {
                headers: ["架构", "年份", "层数", "ImageNet 错误率", "关键创新"],
                rows: [
                    ["LeNet-5", "1998", "5", "不适用 (MNIST)", "卷积+池化范式"],
                    ["AlexNet", "2012", "8", "15.3%", "ReLU, Dropout, GPU"],
                    ["VGG-16", "2014", "16", "7.3%", "3×3 小卷积核堆叠"],
                    ["GoogLeNet", "2014", "22", "6.7%", "Inception 模块"],
                    ["ResNet-50", "2015", "50", "3.57%", "残差连接"],
                ],
            },
            mermaid: `graph TD
    A["LeNet-5 (1998)
6万参数"] --> B["AlexNet (2012)
6000万参数"]
    B --> C["VGG-16 (2014)
1.38亿参数"]
    B --> D["GoogLeNet (2014)
Inception"]
    C --> E["ResNet (2015)
残差连接"]
    D --> E
    E --> F["ResNet-152
超越人类水平"]
    class F s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "学习架构演进时，重点关注「为什么需要新架构」——每个经典网络都是为了解决前一代的某个瓶颈而诞生的。",
            warning: "不要盲目追求更深的网络。ResNet 之前，人们发现单纯增加层数反而会导致训练误差上升（退化问题），残差连接才是关键突破。",
        },
        {
            title: "5. 参数计算与 FLOPs 分析",
            body: `理解 CNN 的参数量和计算量（FLOPs）是模型设计与优化的基本功。参数量（Parameters）决定了模型的存储需求和过拟合风险，FLOPs（Floating Point Operations）决定了推理速度和能耗。

卷积层的参数量计算公式为：C_out × (kernel_h × kernel_w × C_in + 1)。注意 bias 是每个输出通道一个，所以加 C_out 个偏置参数。例如一个 3×3 卷积，输入 64 通道，输出 128 通道，参数量 = 128 × (3×3×64 + 1) = 73,856。

卷积层的 FLOPs 计算更复杂：每个输出位置需要 kernel_h × kernel_w × C_in 次乘法和等量加法（约 2 倍），再乘以输出特征图的总位置数 output_h × output_w × C_out。以一个 224×224 输入经过 64 个 7×7 卷积核（s=2, p=3）为例，输出为 112×112×64，FLOPs ≈ 2 × 7×7×3×64 × 112×112×64 ≈ 118 GFLOPs。

BatchNorm 层有 4 个可学习参数（γ, β, running_mean, running_var）× C_in，但通常不计入 FLOPs 因为它在推理时被融合到卷积中。全连接层的参数量是 in_features × out_features + out_features，FLOPs 是 2 × in_features × out_features。`,
            code: [
                { lang: "python", code: `def count_conv_params(in_ch, out_ch, kernel_size=3, bias=True):
    """计算卷积层参数量"""
    params = out_ch * in_ch * kernel_size * kernel_size
    if bias:
        params += out_ch
    return params

def count_conv_flops(in_ch, out_ch, kernel_size, in_h, in_w,
                     stride=1, padding=0, bias=True):
    """估算卷积层 FLOPs"""
    out_h = (in_h + 2 * padding - kernel_size) // stride + 1
    out_w = (in_w + 2 * padding - kernel_size) // stride + 1
    # 每个输出位置: kernel_h * kernel_w * in_ch 次乘 + 等量加
    flops_per_pos = 2 * kernel_size * kernel_size * in_ch
    return flops_per_pos * out_h * out_w * out_ch

# VGG-16 第一层: 3->64, 3x3, 224x224
params = count_conv_params(3, 64, 3)
flops = count_conv_flops(3, 64, 3, 224, 224, 1, 1)
print(f"VGG第一层: {params:,} params, {flops/1e6:.1f} MFLOPs")
# 1,792 params, 115.4 MFLOPs` },
                { lang: "python", code: `# 使用 thop 库自动计算模型 FLOPs
# pip install thop
from thop import profile, clever_format
import torchvision.models as models
import torch

# 分析 ResNet-18
model = models.resnet18()
dummy_input = torch.randn(1, 3, 224, 224)
macs, params = profile(model, inputs=(dummy_input,))

# MACs 是乘加操作数, FLOPs = 2 * MACs
flops = 2 * macs
print(f"ResNet-18 FLOPs: {clever_format(flops, '%.2f')}")
print(f"ResNet-18 Params: {clever_format(params, '%.2f')}")
# 典型输出: 1.82 GFLOPs, 11.69 M params` },
            ],
            table: {
                headers: ["模型", "参数量", "FLOPs (224×224)", "层数"],
                rows: [
                    ["LeNet-5", "60K", "~0.5M", "5"],
                    ["AlexNet", "60M", "724M", "8"],
                    ["VGG-16", "138M", "15.3G", "16"],
                    ["ResNet-18", "11.7M", "1.8G", "18"],
                    ["ResNet-50", "25.6M", "4.1G", "50"],
                    ["MobileNetV2", "3.4M", "300M", "53"],
                ],
            },
            mermaid: `graph LR
    A["卷积层输入 C_in×H×W"] --> B["参数量计算"]
    B --> C["C_out × (K×K×C_in + 1)"]
    A --> D["FLOPs 计算"]
    D --> E["2 × K×K×C_in × H_out×W_out×C_out"]
    C --> F["决定模型大小
存储/过拟合"]
    E --> G["决定推理速度
计算复杂度"]`,
            tip: "面试常考：为什么两个 3×3 卷积等价于一个 5×5 卷积但参数更少？答：两个 3×3 的参数是 2×3×3×C² = 18C²，一个 5×5 是 25C²，节省 28% 的参数。",
            warning: "FLOPs 只是理论计算量，实际推理速度还受内存带宽、并行度、算子实现影响。低 FLOPs 不代表一定快（如 MobileNet 的深度可分离卷积）。",
        },
        {
            title: "6. 迁移学习与微调策略",
            body: `迁移学习（Transfer Learning）是 CNN 实战中最强大的技术之一。核心思想是：在大规模数据集（如 ImageNet，1400 万张图片，1000 类）上预训练的 CNN 已经学到了丰富的通用视觉特征——低层检测边缘和纹理，中层检测形状和部件，高层检测语义对象。这些特征可以迁移到新的、数据量较小的任务上。

迁移学习有三种常见策略。特征提取（Feature Extraction）：冻结预训练模型的所有层，只替换并训练最后的分类头。这种方法计算量小，适合数据量很少（几百张）的场景。部分微调（Partial Fine-tuning）：冻结底层（前几层卷积），只微调高层和分类头。低层学到的是通用边缘/纹理特征，不需要改动；高层学到的是源任务的特定语义，需要适应新任务。全量微调（Full Fine-tuning）：解冻所有层，用较小的学习率整体微调。这需要较多数据（几千到几万张），但性能最佳。

学习率设置是微调成功的关键。通常对新添加的分类头用较大的学习率（如 1e-3），对预训练的主干网络用较小的学习率（如 1e-5 或 1e-4），这种分层学习率（Discriminative Learning Rate）策略能防止微调过程破坏已经学到的良好特征。`,
            code: [
                { lang: "python", code: `import torch
import torch.nn as nn
import torchvision.models as models

# 策略1: 特征提取（冻结所有层）
def feature_extraction(num_classes=10):
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    # 冻结所有预训练参数
    for param in model.parameters():
        param.requires_grad = False
    # 替换分类头
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model  # 只有 fc 层可训练

# 策略2: 部分微调（冻结前两层，微调后两层）
def partial_finetune(num_classes=10):
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
    frozen_count = 0
    for name, param in model.named_parameters():
        if 'layer3' not in name and 'layer4' not in name and 'fc' not in name:
            param.requires_grad = False
            frozen_count += 1
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    print(f"冻结了 {frozen_count} 个参数组")
    return model` },
                { lang: "python", code: `# 分层学习率设置
import torch.optim as optim

def setup_discriminative_lr(model, base_lr=1e-5, head_lr=1e-3):
    """为不同层设置不同学习率"""
    backbone_params = []
    head_params = []
    for name, param in model.named_parameters():
        if not param.requires_grad:
            continue
        if 'fc' in name or 'classifier' in name:
            head_params.append(param)
        else:
            backbone_params.append(param)

    optimizer = optim.Adam([
        {'params': backbone_params, 'lr': base_lr},
        {'params': head_params, 'lr': head_lr},
    ])
    return optimizer

# 带 warmup 的学习率调度
from torch.optim.lr_scheduler import CosineAnnealingLR

scheduler = CosineAnnealingLR(optimizer, T_max=50, eta_min=1e-7)
# 余弦退火：学习率从初始值平滑衰减到最小值` },
            ],
            table: {
                headers: ["策略", "可训练参数", "适用数据量", "训练速度"],
                rows: [
                    ["特征提取", "仅分类头", "< 1000 张", "很快"],
                    ["部分微调", "高层 + 分类头", "1000-10000 张", "中等"],
                    ["全量微调", "全部参数", "> 10000 张", "较慢"],
                    ["从头训练", "全部参数", "> 100 万张", "最慢"],
                ],
            },
            mermaid: `graph TD
    A["ImageNet 预训练权重"] --> B{"数据量?"}
    B -->|< 1K| C["冻结所有层
仅训练分类头"]
    B -->|1K-10K| D["冻结低层
微调高层+分类头"]
    B -->|> 10K| E["小学习率
全量微调"]
    C --> F["快速部署"]
    D --> G["平衡精度与速度"]
    E --> H["最佳性能"]`,
            tip: "实战建议：先用特征提取快速建立 baseline，再尝试部分微调提升精度。如果数据集和源任务差异大（如医学图像），可以考虑全量微调。",
            warning: "微调时学习率过大是常见错误——预训练权重已经很优秀，大学习率会破坏已学到的特征。主干网络的学习率通常要比从头训练小 10-100 倍。",
        },
        {
            title: "7. PyTorch CNN 实战：CIFAR-10 完整流程",
            body: `本节通过一个完整的 CIFAR-10 分类项目，将前面学到的所有知识串联起来。CIFAR-10 包含 60,000 张 32×32 的彩色图片，共 10 个类别（飞机、汽车、鸟、猫、鹿、狗、青蛙、马、船、卡车），每类 6000 张，其中 50,000 张训练、10,000 张测试。

我们构建一个中等深度的 CNN：4 个卷积层 + 2 个全连接层。使用数据增强（随机裁剪、水平翻转、归一化）来提升泛化能力。训练流程包括：模型定义 → 数据加载 → 损失函数（交叉熵）和优化器（SGD + 动量）→ 训练循环 → 评估 → 学习率调度。

****关键实践要点****：使用 nn.Sequential 组织卷积块使代码清晰；在卷积后紧跟 BatchNorm 和 ReLU（Conv-BN-ReLU 模式）；训练时开启 dropout 防止过拟合，推理时关闭；使用 DataLoader 的 num_workers 参数加速数据加载；每个 epoch 后验证以监控过拟合。`,
            code: [
                { lang: "python", code: `import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# 1. 数据准备
transform_train = transforms.Compose([
    transforms.RandomCrop(32, padding=4),   # 数据增强
    transforms.RandomHorizontalFlip(),       # 水平翻转
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465),
                         (0.2470, 0.2435, 0.2616)),  # CIFAR-10 均值方差
])

transform_test = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465),
                         (0.2470, 0.2435, 0.2616)),
])

trainset = datasets.CIFAR10(root='./data', train=True,
                            download=True, transform=transform_train)
testset = datasets.CIFAR10(root='./data', train=False,
                           download=True, transform=transform_test)
trainloader = DataLoader(trainset, batch_size=128, shuffle=True, num_workers=2)
testloader = DataLoader(testset, batch_size=128, shuffle=False, num_workers=2)` },
                { lang: "python", code: `# 2. 模型定义
class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            # Block 1: 3 -> 64
            nn.Conv2d(3, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),  # 32 -> 16

            # Block 2: 64 -> 128
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),  # 16 -> 8

            # Block 3: 128 -> 256
            nn.Conv2d(128, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),  # 8 -> 4
        )
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(256 * 4 * 4, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = x.flatten(1)
        return self.classifier(x)` },
                { lang: "python", code: `# 3. 训练循环
def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss = correct = total = 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        correct += predicted.eq(labels).sum().item()
        total += labels.size(0)
    return total_loss / total, correct / total

# 训练主流程
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = SimpleCNN().to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(model.parameters(), lr=0.1,
                      momentum=0.9, weight_decay=5e-4)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)

for epoch in range(100):
    train_loss, train_acc = train_one_epoch(
        model, trainloader, criterion, optimizer, device)
    scheduler.step()
    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1}: loss={train_loss:.4f}, acc={train_acc:.4f}")` },
            ],
            table: {
                headers: ["训练阶段", "Epoch", "学习率", "训练精度", "测试精度"],
                rows: [
                    ["初始阶段", "1-10", "0.1 → 0.08", "45% → 70%", "40% → 65%"],
                    ["快速提升", "10-30", "0.08 → 0.04", "70% → 85%", "65% → 80%"],
                    ["稳步收敛", "30-70", "0.04 → 0.01", "85% → 92%", "80% → 88%"],
                    ["微调阶段", "70-100", "0.01 → 0.001", "92% → 95%", "88% → 91%"],
                ],
            },
            mermaid: `graph TD
    A["CIFAR-10 数据集
60K 张 32x32"] --> B["数据增强
裁剪/翻转/归一化"]
    B --> C["CNN 模型
6 层卷积 + 2 层全连接"]
    C --> D["SGD + 动量 0.9
weight_decay=5e-4"]
    D --> E["训练 100 epochs
余弦学习率衰减"]
    E --> F{"测试精度 > 90％?"}
    F -->|是| G["模型部署"]
    F -->|否| H["调整架构/超参数"]
    H --> C
    class G s0
    classDef s0 fill:#14532d`,
            tip: "CIFAR-10 是学习 CNN 的最佳入门数据集——比 MNIST 有挑战性，又比 ImageNet 容易快速迭代。先用简单 CNN 达到 85%+，再尝试 ResNet 达到 93%+。",
            warning: "训练时别忘了 model.train() 和 model.eval() 模式切换——Dropout 和 BatchNorm 在这两种模式下的行为不同，搞错会严重影响精度。",
        },
    ],
};
