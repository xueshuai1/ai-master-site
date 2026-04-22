import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-020",
    title: "CNN 卷积神经网络：从 LeNet 到 ResNet",
    category: "dl",
    tags: ["CNN", "卷积", "池化", "LeNet", "VGG", "ResNet", "计算机视觉"],
    summary: "卷积神经网络完整指南。从卷积操作的数学原理出发，系统讲解 LeNet、AlexNet、VGG、GoogLeNet、ResNet 等经典架构的演进，包含 Python 从零实现 CNN 和迁移学习实战。",
    date: "2026-04-22",
    readTime: "22 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么需要 CNN：全连接层的局限性",
            body: `在处理图像等网格结构数据时，全连接神经网络（Fully Connected Network）存在三个根本性的缺陷，这正是卷积神经网络（CNN）诞生的原因。

第一个问题是参数爆炸。假设输入是一张 224×224 的 RGB 彩色图片，共有 150,528 个像素值。如果第一个隐藏层只有 1024 个神经元，那么仅这一层的权重矩阵就有 150,528 × 1,024 ≈ 1.5 亿个参数。这意味着即使是一层网络，也会消耗巨大的内存，并且极易过拟合。

第二个问题是空间结构丢失。全连接层将二维图像展平为一维向量，像素之间的空间邻接关系（上下左右的位置关系）被完全破坏。然而对于图像识别来说，一个猫耳朵在猫头旁边——这种局部空间模式恰恰是分类的关键信息。

第三个问题是平移不变性缺失。全连接网络学习了"左上角的猫耳朵"和"右下角的猫耳朵"是两种不同的特征，因为它们对应的权重完全不同。但人类视觉系统天然具备平移不变性——无论物体出现在图像的哪个位置，我们都能识别它。`,
            mermaid: `graph TD
    A["224×224×3 输入图像"] --> B["展平为 150,528 维向量"]
    B --> C["全连接层 1024 神经元"]
    C --> D["1.5 亿个参数"]
    D --> E["过拟合风险极高"]

    F["全连接层的三大问题"] --> G["参数爆炸"]
    F --> H["空间结构丢失"]
    F --> I["无平移不变性"]

    style D fill:#7f1d1d
    style E fill:#7f1d1d`,
            table: {
                headers: ["特性", "全连接层", "卷积层", "为什么卷积更好"],
                rows: [
                    ["参数量", "O(输入×输出)", "O(卷积核²×通道数)", "共享权重，参数大幅减少"],
                    ["空间关系", "展平后丢失", "保留局部邻接", "利用图像的二维结构"],
                    ["平移不变性", "不共享，每种位置单独学习", "同一卷积核扫描全图", "天然平移等变性"],
                    ["局部模式检测", "需要大量神经元间接学习", "卷积核天然检测局部模式", "边缘/纹理/形状等局部特征"],
                    ["224×224 输入 + 1024 输出", "~1.5 亿参数", "~几千到几万参数", "参数效率提升 1000 倍以上"],
                ],
            },
            tip: "理解 CNN 的关键思维转变：从'每个像素对应一个权重'转变为'一个模式检测器扫描整张图片'。这就是参数共享的核心思想。",
        },
        {
            title: "2. 卷积操作：卷积核、步幅、填充、多通道",
            body: `卷积（Convolution）是 CNN 的核心操作。在数学上，二维离散卷积定义为 (f * g)(i, j) = Σ_m Σ_n f(m, n) · g(i-m, j-n)。但在深度学习中，我们实际使用的是互相关（Cross-Correlation）：(f ⋆ g)(i, j) = Σ_m Σ_n f(i+m, j+n) · g(m, n)。两者的区别仅在于卷积核是否翻转，而翻转一个可学习的卷积核等价于学习另一个不同的核，所以在实践中直接使用互相关。

卷积核（Kernel/Filter）是一个小的权重矩阵，比如 3×3 或 5×5。它在输入特征图上滑动，每次与对应区域做逐元素乘法再求和，得到一个输出值。这个操作可以理解为：卷积核是一个"模式检测器"，它扫描整张图片，寻找与其权重模式匹配的局部特征。

步幅（Stride）控制卷积核每次滑动的距离。步幅为 1 时，卷积核每次移动一个像素；步幅为 2 时，每次移动两个像素，输出尺寸减半。步幅越大，输出越小，计算量越少，但可能丢失细节信息。

填充（Padding）是在输入特征图周围补零。不加填充时（valid padding），输出尺寸会随着卷积核大小而缩小；补零填充（same padding）可以让输出尺寸与输入保持一致。这在深层网络中尤为重要，否则特征图会在几层之后缩小到无法使用。

多通道卷积是处理彩色图像的关键。RGB 图像有 3 个通道，每个卷积核也有对应深度的三维结构（3×3×3）。卷积核的每个通道与输入的对应通道做卷积，然后将三个通道的结果相加，得到一个二维输出。如果有 64 个卷积核，输出就是 64 个通道。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

def conv2d_manual(image, kernel, stride=1, padding=0):
    """手动实现二维卷积（互相关）操作，理解底层原理"""
    # 填充
    if padding > 0:
        image = np.pad(image, padding, mode='constant', constant_values=0)

    h_in, w_in = image.shape
    k_h, k_w = kernel.shape
    h_out = (h_in - k_h) // stride + 1
    w_out = (w_in - k_w) // stride + 1

    output = np.zeros((h_out, w_out))

    # 滑动窗口计算
    for i in range(h_out):
        for j in range(w_out):
            region = image[i*stride:i*stride+k_h, j*stride:j*stride+k_w]
            output[i, j] = np.sum(region * kernel)

    return output

# 创建一个 5×5 的模拟图像（像素值 0-255）
img = np.array([
    [0, 0, 0, 0, 0],
    [0, 255, 255, 255, 0],
    [0, 255, 255, 255, 0],
    [0, 255, 255, 255, 0],
    [0, 0, 0, 0, 0]
], dtype=float)

# 垂直边缘检测卷积核
edge_kernel = np.array([
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1]
], dtype=float)

result = conv2d_manual(img, edge_kernel, stride=1, padding=0)
print("输入图像形状:", img.shape)
print("输出特征图形状:", result.shape)
print("卷积结果:")
print(result.astype(int))`,
                },
                {
                    lang: "python",
                    code: `# 多通道卷积：模拟 RGB 三通道输入
def conv2d_multi_channel(image_3d, kernels_3d, bias=None):
    """多通道卷积：每个卷积核也是 3D 的
    
    Args:
        image_3d: (H, W, C_in) 输入，如 RGB 图像
        kernels_3d: (C_out, K, K, C_in) 卷积核组
        bias: (C_out,) 偏置
    """
    H, W, C_in = image_3d.shape
    C_out, K, _, _ = kernels_3d.shape
    H_out = H - K + 1
    W_out = W - K + 1

    output = np.zeros((H_out, W_out, C_out))

    for c_out in range(C_out):
        kernel = kernels_3d[c_out]  # (K, K, C_in)
        for i in range(H_out):
            for j in range(W_out):
                region = image_3d[i:i+K, j:j+K, :]  # (K, K, C_in)
                output[i, j, c_out] = np.sum(region * kernel)
        if bias is not None:
            output[:, :, c_out] += bias[c_out]

    return output

# 模拟 6×6 RGB 图像
np.random.seed(42)
image_rgb = np.random.randint(0, 256, (6, 6, 3)).astype(float)

# 2 个 3×3×3 的随机卷积核
kernels = np.random.randn(2, 3, 3, 3).astype(float)
bias = np.array([0.1, -0.1])

output = conv2d_multi_channel(image_rgb, kernels, bias)
print(f"输入: {image_rgb.shape} → 输出: {output.shape}")
print(f"通道 0 的最大激活值: {output[:,:,0].max():.2f}")
print(f"通道 1 的最大激活值: {output[:,:,1].max():.2f}")`,
                },
            ],
            table: {
                headers: ["参数", "符号", "作用", "对输出尺寸的影响"],
                rows: [
                    ["卷积核大小", "K", "感受野大小，越大捕获的全局信息越多", "输出 = (输入 - K + 2P) / S + 1"],
                    ["步幅", "S", "控制滑动的距离，越大输出越小", "步幅加倍，输出约减半"],
                    ["填充", "P", "在边界补零，保持空间尺寸", "Same padding 使输出=输入"],
                    ["输入通道", "C_in", "深度维度（RGB=3）", "不改变输出空间尺寸"],
                    ["输出通道", "C_out", "卷积核的数量，决定特征图深度", "每个卷积核产生一个通道"],
                ],
            },
            warning: "实际深度学习框架（PyTorch/TensorFlow）中的卷积是高度优化的 C++/CUDA 实现，远快于 Python 循环。这里的代码仅用于理解原理，切勿在实际项目中使用手动卷积。",
        },
        {
            title: "3. 池化层：最大池化与平均池化",
            body: `池化（Pooling）是 CNN 中用于降维的无参数操作。它在输入特征图上滑动一个窗口（通常 2×2），对窗口内的值应用聚合函数，输出一个更小的特征图。

最大池化（Max Pooling）取窗口内的最大值。它的直觉是：如果某个模式（比如边缘）在一个局部区域中被检测到，那么保留最强的响应即可，弱响应可以丢弃。最大池化具有平移不变性——即使特征在局部区域内轻微移动，池化结果仍然不变。这使得网络对输入的微小形变更鲁棒。

平均池化（Average Pooling）取窗口内的平均值。它在整个窗口内平滑信息，保留了更多背景信息。在某些场景下（如全局平均池化替代全连接层），平均池化可以显著减少参数量。

池化层的三个关键特性使其在 CNN 中不可或缺：空间降维（减少后续层的计算量）、扩大感受野（经过池化后，下一层卷积的每个位置"看到"的输入区域更大）、一定程度防止过拟合（丢弃部分信息相当于正则化）。`,
            mermaid: `graph LR
    A["4×4 输入特征图"] --> B["2×2 滑动窗口"]
    B --> C{"池化类型"}
    C -->|"Max"| D["取窗口内最大值"]
    C -->|"Average"| E["取窗口内平均值"]
    D --> F["2×2 输出特征图"]
    E --> F
    F --> G["参数量不变<br/>空间尺寸减半"]
    style B fill:#7c2d12
    style C fill:#1e3a5f
    style F fill:#14532d`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

def max_pool2d(feature_map, pool_size=2, stride=2):
    """最大池化"""
    H, W = feature_map.shape
    H_out = (H - pool_size) // stride + 1
    W_out = (W - pool_size) // stride + 1
    output = np.zeros((H_out, W_out))

    for i in range(H_out):
        for j in range(W_out):
            region = feature_map[i*stride:i*stride+pool_size,
                                 j*stride:j*stride+pool_size]
            output[i, j] = np.max(region)
    return output

def avg_pool2d(feature_map, pool_size=2, stride=2):
    """平均池化"""
    H, W = feature_map.shape
    H_out = (H - pool_size) // stride + 1
    W_out = (W - pool_size) // stride + 1
    output = np.zeros((H_out, W_out))

    for i in range(H_out):
        for j in range(W_out):
            region = feature_map[i*stride:i*stride+pool_size,
                                 j*stride:j*stride+pool_size]
            output[i, j] = np.mean(region)
    return output

# 演示
fm = np.array([
    [1, 3, 2, 4],
    [5, 6, 1, 2],
    [3, 2, 8, 7],
    [4, 1, 5, 3]
], dtype=float)

print("输入特征图:")
print(fm.astype(int))
print("\\n最大池化 (2×2):")
print(max_pool2d(fm).astype(int))
print("\\n平均池化 (2×2):")
print(np.round(avg_pool2d(fm), 1))`,
                },
                {
                    lang: "python",
                    code: `# 全局平均池化（GAP）：替代全连接层的现代做法
def global_average_pooling(feature_map_3d):
    """对每个通道做全局平均，将 (H, W, C) 变为 (C,)
    
    这是现代 CNN（如 ResNet）中替代 Flatten + Dense 的标准做法。
    它大幅减少参数量，同时保留每个通道的全局激活信息。
    """
    H, W, C = feature_map_3d.shape
    output = np.zeros(C)
    for c in range(C):
        output[c] = np.mean(feature_map_3d[:, :, c])
    return output

# 模拟 ResNet 最后的特征图：7×7×512
np.random.seed(42)
feature_map = np.random.randn(7, 7, 512).astype(float)

# 传统做法：Flatten → FC
flattened = feature_map.flatten()  # 7*7*512 = 25088 维
print(f"Flatten 后维度: {flattened.shape[0]}")
print(f"如果接 1000 类 FC 层: 参数量 = {flattened.shape[0] * 1000:,}")

# 现代做法：GAP → FC
gap_output = global_average_pooling(feature_map)
print(f"GAP 后维度: {gap_output.shape[0]}")
print(f"如果接 1000 类 FC 层: 参数量 = {gap_output.shape[0] * 1000:,}")
print(f"参数节省: {1 - gap_output.shape[0]/flattened.shape[0]:.1%}")`,
                },
            ],
        },
        {
            title: "4. 经典架构演进：从 LeNet 到 ResNet",
            body: `CNN 的发展史是一部不断突破深度极限的历史。每一个经典架构的提出，都解决了一个关键问题，推动了计算机视觉能力的飞跃。

LeNet-5（1998）是 Yann LeCun 提出的第一个成功应用于手写数字识别的卷积神经网络。它由两个卷积层、两个池化层和三个全连接层组成，输入是 32×32 的灰度图像。LeNet-5 的核心贡献是确立了"卷积-池化-全连接"的基本范式，这一范式至今仍被使用。但受限于当时的计算能力和数据规模，LeNet-5 只有约 6 万个参数，在复杂图像上表现有限。

AlexNet（2012）在 ImageNet 竞赛中以巨大优势获胜，点燃了深度学习革命。它的关键创新包括：使用 ReLU 替代 Sigmoid（训练速度提升数倍）、Dropout 防止过拟合、数据增强（随机裁剪、水平翻转）、以及最重要的——利用两块 GPU 并行训练，使得 8 层深的网络在数百万张图像上成为可能。AlexNet 有约 6000 万个参数，是 LeNet-5 的 1000 倍。

VGGNet（2014）的核心理念是"深度就是力量"。它使用统一的 3×3 小卷积核，通过堆叠多层来构建非常深的网络（VGG-16 有 16 层，VGG-19 有 19 层）。两个 3×3 卷积的堆叠等效于一个 5×5 卷积的感受野，但参数更少（2×3² = 18 vs 5² = 25），且多了一层非线性变换。VGG 的缺点是参数量巨大（VGG-16 有 1.38 亿参数，其中绝大部分在全连接层中）。

GoogLeNet/Inception（2014）提出了 Inception 模块，核心思想是在同一层使用多种尺寸的卷积核（1×1、3×3、5×5）并行处理，然后拼接结果。1×1 卷积在这里起到了降维的关键作用，先用 1×1 卷积减少通道数，再做 3×3 和 5×5 卷积，大幅降低了计算量。GoogLeNet 有 22 层但参数只有约 500 万（比 AlexNet 还少），在 ImageNet 上达到了 6.7% 的 top-5 错误率。

ResNet（2015）通过残差连接（Residual Connection）解决了深层网络的退化问题，使得训练数百甚至上千层的网络成为可能。ResNet-50 有 50 层，ResNet-152 有 152 层，在 ImageNet 上达到了 3.57% 的 top-5 错误率，超越了人类水平。`,
            mermaid: `graph TD
    A["1998 LeNet-5<br/>6 万参数, 2 卷积层"] --> B["2012 AlexNet<br/>6000 万参数, 8 层"]
    B --> C["2014 VGG-16<br/>1.38 亿参数, 16 层"]
    B --> D["2014 GoogLeNet<br/>500 万参数, 22 层"]
    C --> E["2015 ResNet-50<br/>2500 万参数, 50 层"]
    D --> E
    E --> F["2017 ResNeXt<br/>多分支残差"]
    E --> G["2019 EfficientNet<br/>复合缩放"]
    E --> H["2020+ ConvNeXt<br/>CNN + ViT 混合"]

    style A fill:#0c4a6e
    style B fill:#14532d
    style C fill:#7c2d12
    style D fill:#581c87
    style E fill:#7f1d1d`,
            table: {
                headers: ["架构", "年份", "深度（层）", "参数量", "ImageNet Top-5 错误率", "核心贡献"],
                rows: [
                    ["LeNet-5", "1998", "5", "60K", "N/A（MNIST 0.8%）", "CNN 基本范式"],
                    ["AlexNet", "2012", "8", "60M", "15.3%", "ReLU, Dropout, GPU 训练"],
                    ["VGG-16", "2014", "16", "138M", "7.3%", "小卷积核堆叠, 深度即力量"],
                    ["GoogLeNet", "2014", "22", "5M", "6.7%", "Inception 模块, 1×1 降维"],
                    ["ResNet-50", "2015", "50", "25M", "3.57%", "残差连接, 突破深度极限"],
                    ["ResNet-152", "2015", "152", "60M", "3.02%", "极深层残差网络"],
                ],
            },
            tip: "学习 CNN 架构演进的最好方法：从 LeNet 开始，每学一个新架构，问自己三个问题：它解决了什么问题？用了什么新方法？代价是什么？",
        },
        {
            title: "5. 残差连接：解决深层网络退化问题",
            body: `2015 年之前，深度学习界有一个看似违反直觉的现象：当网络深度增加时，训练准确率反而下降了。这不是过拟合（训练集表现差），而是欠拟合（训练集表现也差）。这就是退化问题（Degradation Problem）。

直觉上，更深的网络应该至少不比浅的网络差——因为深层网络可以通过将新增层的权重设为零来"复制"浅层网络的行为。但在实践中，优化器很难找到这个"零映射"的解。梯度在反向传播中经过太多层后变得不稳定，使得优化极其困难。

ResNet 的解决方案优雅而简单：残差连接（Residual Connection）。假设我们希望某个模块学习映射 H(x)，与其直接学习 H(x)，不如让模块学习残差 F(x) = H(x) - x，然后输出 F(x) + x。当最优映射接近恒等映射（即该层不需要做什么改变）时，网络只需将 F(x) 的权重学到接近零即可——这远比学到精确的恒等映射容易得多。

残差连接的数学表达为：y = F(x, {Wᵢ}) + x。其中 F(x, {Wᵢ}) 是残差函数（通常是 2-3 个卷积层），x 是输入。这个简单的 "+ x" 操作产生了深远的影响：它建立了一条梯度"高速公路"，使得梯度可以直接从深层传回浅层，有效缓解了梯度消失问题。

ResNet 的瓶颈（Bottleneck）结构进一步优化了计算效率：先用 1×1 卷积将通道数从 256 降到 64（降维），再用 3×3 卷积处理（在低维空间计算），最后用 1×1 卷积恢复通道数到 256（升维）。这使得三层瓶颈块的参数量远小于两个普通 3×3 卷积块。`,
            mermaid: `graph TD
    A["输入 x"] -->|"直接跳过"| F(("+"))
    A --> B["Conv 1×1 (降维)"]
    B --> C["Conv 3×3"]
    C --> D["Conv 1×1 (升维)"]
    D -->|"残差 F(x)"| F
    F --> E["输出 y = F(x) + x"]
    F --> G["ReLU 激活"]
    G --> H["下一层"]

    style A fill:#1e3a5f
    style E fill:#14532d
    style F fill:#7c2d12`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class BasicBlock(nn.Module):
    """ResNet 基本残差块（两层卷积）"""
    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels,
                               kernel_size=3, stride=stride,
                               padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels,
                               kernel_size=3, stride=1,
                               padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)

        # 如果输入输出维度不同，需要用 1×1 卷积对齐
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1,
                          stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )

    def forward(self, x):
        identity = self.shortcut(x)  # 捷径路径
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out = out + identity  # 残差连接：F(x) + x
        out = F.relu(out)
        return out

# 验证残差块
block = BasicBlock(64, 64)
x = torch.randn(1, 64, 32, 32)
y = block(x)
print(f"输入: {x.shape} → 输出: {y.shape}")
print(f"残差连接确保梯度可以直接回传")`,
                },
                {
                    lang: "python",
                    code: `class Bottleneck(nn.Module):
    """ResNet 瓶颈块（三层卷积）—— 50 层以上使用
    
    1×1 Conv 降维 → 3×3 Conv 处理 → 1×1 Conv 升维
    这种设计在保持精度的同时大幅减少计算量
    """
    expansion = 4  # 输出通道是中间通道的 4 倍

    def __init__(self, in_channels, mid_channels, stride=1):
        super().__init__()
        out_channels = mid_channels * self.expansion

        self.conv1 = nn.Conv2d(in_channels, mid_channels, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(mid_channels)
        self.conv2 = nn.Conv2d(mid_channels, mid_channels, 3,
                               stride=stride, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(mid_channels)
        self.conv3 = nn.Conv2d(mid_channels, out_channels, 1, bias=False)
        self.bn3 = nn.BatchNorm2d(out_channels)

        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1,
                          stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )

    def forward(self, x):
        identity = self.shortcut(x)
        out = F.relu(self.bn1(self.conv1(x)))
        out = F.relu(self.bn2(self.conv2(out)))
        out = self.bn3(self.conv3(out))
        return F.relu(out + identity)

# 计算参数量对比
def count_params(module):
    return sum(p.numel() for p in module.parameters())

basic = BasicBlock(256, 256)
bottleneck = Bottleneck(256, 64)
print(f"BasicBlock 参数量: {count_params(basic):,}")
print(f"Bottleneck 参数量: {count_params(bottleneck):,}")
print(f"Bottleneck 输出通道: {256 * Bottleneck.expansion}")`,
                },
            ],
            warning: "残差连接中的 shortcut 路径不能省略！当输入输出通道数或空间尺寸不同时，必须用 1×1 卷积或池化来对齐维度，否则 F(x) + x 无法执行。",
        },
        {
            title: "6. Python 实战：PyTorch 从零实现 CNN",
            body: `理论学完了，让我们用 PyTorch 从零实现一个完整的 CNN，并在 CIFAR-10 数据集上进行训练和测试。CIFAR-10 包含 60,000 张 32×32 的彩色图片，分为 10 个类别（飞机、汽车、鸟、猫等）。

我们将实现一个类似 VGG 的小型 CNN，包含多个卷积块和池化层，最后用全局平均池化和全连接层输出分类结果。整个训练流程包括：数据加载与增强、模型定义、损失函数和优化器选择、训练循环、以及模型评估。

这个实现的关键点在于：理解每个模块的作用、掌握 PyTorch 的训练模式、以及学会用验证集监控过拟合。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# ========================================
# 1. 定义 CNN 模型
# ========================================
class SimpleCNN(nn.Module):
    """类 VGG 的小型 CNN，适合 CIFAR-10"""
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            # 第一个卷积块
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),  # 32->16

            # 第二个卷积块
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),  # 16->8

            # 第三个卷积块
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),  # 8->4
        )

        # 分类头：全局平均池化 + 全连接
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),  # (256, 4, 4) -> (256, 1, 1)
            nn.Flatten(),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x

model = SimpleCNN()
total_params = sum(p.numel() for p in model.parameters())
print(f"模型总参数量: {total_params:,}")
print(f"模型架构:")
print(model)`,
                },
                {
                    lang: "python",
                    code: `# ========================================
# 2. 训练与评估完整流程
# ========================================

def train_model(model, train_loader, val_loader, epochs=20, lr=0.001, device='cpu'):
    """完整的 CNN 训练循环"""
    model.to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_acc = 0.0

    for epoch in range(epochs):
        # 训练阶段
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item()
            _, predicted = outputs.max(1)
            train_total += labels.size(0)
            train_correct += predicted.eq(labels).sum().item()

        # 验证阶段
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

        train_acc = train_correct / train_total
        val_acc = val_correct / val_total
        scheduler.step()

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), 'best_cnn.pt')

        print(f"Epoch {epoch+1:3d} | "
              f"Loss: {train_loss/len(train_loader):.4f} | "
              f"Train Acc: {train_acc:.4f} | "
              f"Val Acc: {val_acc:.4f} | "
              f"Best: {best_val_acc:.4f}")

    return model

# 数据加载
transform_train = transforms.Compose([
    transforms.RandomCrop(32, padding=4),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465),
                         (0.2023, 0.1994, 0.2010)),
])

transform_test = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465),
                         (0.2023, 0.1994, 0.2010)),
])

print("训练流程已定义。在 GPU 上运行需要下载 CIFAR-10 数据集。")
print("运行命令: train_model(model, train_loader, test_loader, epochs=20)")`,
                },
            ],
            tip: "CIFAR-10 上的小技巧：使用 CutMix 或 MixUp 数据增强可以额外提升 1-2% 的精度；将学习率从 0.001 降到 0.0001 再训练 10 个 epoch 通常能找到更好的局部最优解。",
        },
        {
            title: "7. 迁移学习：用预训练模型做图像分类",
            body: `迁移学习（Transfer Learning）是深度学习中最实用的技术之一。它的核心思想是：在一个大规模数据集（如 ImageNet）上预训练的模型已经学会了丰富的视觉特征表示（边缘、纹理、形状、部件等），这些特征可以迁移到新的任务中，只需少量微调即可。

迁移学习有两种主要模式：特征提取（Feature Extraction）和微调（Fine-tuning）。特征提取模式下，冻结预训练模型的所有层，只替换并训练最后的分类头。这种方法训练快、数据量要求低，但精度上限受限。微调模式下，先冻结大部分层训练分类头，然后解冻部分或全部层，用较小的学习率继续训练。微调可以达到更高的精度，但需要更多数据和计算资源。

选择迁移学习策略的经验法则：如果目标数据集很小且与 ImageNet 相似（如其他自然图像分类），冻结骨干网络只训练分类头即可；如果数据集与 ImageNet 差异较大（如医学图像、卫星图像），需要解冻更多层进行微调；如果数据量充足，可以端到端微调整个网络。`,
            mermaid: `graph TD
    A["预训练模型 ImageNet"] --> B{"目标数据量"}
    B -->|少, 相似| C["冻结骨干网络<br/>只训练分类头"]
    B -->|中等, 有差异| D["先冻骨干训分类头<br/>再解冻浅层微调"]
    B -->|大量, 差异大| E["解冻全部层<br/>端到端微调"]

    C --> F["训练快, 精度中等"]
    D --> G["平衡速度与精度"]
    E --> H["训练慢, 精度最高"]

    style C fill:#14532d
    style D fill:#7c2d12
    style E fill:#7f1d1d`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from torchvision import models

def setup_transfer_learning(model_name='resnet18', num_classes=10,
                            freeze_backbone=True, device='cpu'):
    """设置迁移学习模型"""
    # 加载预训练模型
    if model_name == 'resnet18':
        model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    elif model_name == 'resnet50':
        model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
    elif model_name == 'efficientnet_b0':
        model = models.efficientnet_b0(
            weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)
    else:
        raise ValueError(f"未知模型: {model_name}")

    # 替换分类头
    if 'resnet' in model_name:
        n_features = model.fc.in_features
        model.fc = nn.Linear(n_features, num_classes)
    elif 'efficientnet' in model_name:
        n_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(n_features, num_classes)

    # 冻结骨干网络
    if freeze_backbone:
        for name, param in model.named_parameters():
            if 'fc' not in name and 'classifier' not in name:
                param.requires_grad = False

    # 检查哪些层可训练
    trainable = [n for n, p in model.named_parameters() if p.requires_grad]
    frozen = [n for n, p in model.named_parameters() if not p.requires_grad]
    print(f"可训练参数: {len(trainable)} 组")
    print(f"冻结参数: {len(frozen)} 组")

    return model.to(device)

# 使用示例
model = setup_transfer_learning('resnet18', num_classes=10, freeze_backbone=True)
print("\\nResNet18 迁移学习模型已就绪")`,
                },
                {
                    lang: "python",
                    code: `# 两阶段微调策略：第一阶段冻结，第二阶段解冻

def two_stage_finetune(model, train_loader, val_loader,
                       stage1_epochs=5, stage2_epochs=10, device='cpu'):
    """两阶段微调：先冻结骨干，再解冻全部微调"""
    model.to(device)
    criterion = nn.CrossEntropyLoss()

    # ===== 第一阶段：冻结骨干，只训练分类头 =====
    print("=== 第一阶段：冻结骨干网络 ===")
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()),
                           lr=1e-3)

    for epoch in range(stage1_epochs):
        model.train()
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            loss = criterion(model(images), labels)
            loss.backward()
            optimizer.step()

        # 简单评估
        model.eval()
        correct = total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                pred = model(images).argmax(1)
                correct += (pred == labels).sum().item()
                total += labels.size(0)
        print(f"  Stage1 Epoch {epoch+1}: Val Acc = {correct/total:.4f}")

    # ===== 第二阶段：解冻全部层，小学习率微调 =====
    print("\\n=== 第二阶段：解冻全部层微调 ===")
    for param in model.parameters():
        param.requires_grad = True

    optimizer = optim.Adam(model.parameters(), lr=1e-5)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=stage2_epochs)

    for epoch in range(stage2_epochs):
        model.train()
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            loss = criterion(model(images), labels)
            loss.backward()
            optimizer.step()
        scheduler.step()

        model.eval()
        correct = total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                pred = model(images).argmax(1)
                correct += (pred == labels).sum().item()
                total += labels.size(0)
        print(f"  Stage2 Epoch {epoch+1}: Val Acc = {correct/total:.4f}")

    return model`,
                },
            ],
            tip: "微调时的关键技巧：解冻后的学习率应该是冻结阶段的 1/10 到 1/100。大学习率会破坏预训练权重中已经学到的有用特征。",
        },
        {
            title: "8. CNN 的局限与 Vision Transformer 的崛起",
            body: `尽管 CNN 在计算机视觉领域统治了近十年，但它并非完美。随着 Vision Transformer（ViT）在 2020 年的提出，CNN 的一些根本性局限开始暴露。

CNN 的第一个局限是感受野受限。卷积操作只在局部区域内提取特征，要捕获全局信息需要堆叠多层或使用大卷积核。即使经过 5 层 3×3 卷积，感受野也只有 11×11，对于 224×224 的输入来说仍然很小。虽然深层网络最终能获得全局感受野，但这是通过逐层累积实现的，效率不高。

第二个局限是动态推理能力不足。CNN 的所有卷积核在推理时对整张图片一视同仁，无法根据内容自适应地调整计算。而人类的视觉系统会"聚焦"于感兴趣的区域，忽略无关背景。

第三个局限是数据饥渴。CNN 的平移不变性是一种强归纳偏置（Inductive Bias），在小数据集上是优势，但在超大规模数据集上反而可能成为限制——它限制了模型学习更复杂的空间关系。

Vision Transformer 将图片切分为固定大小的 Patch 序列（如 16×16），然后用自注意力（Self-Attention）机制处理。自注意力的核心优势是全局感受野——每一层都能直接看到所有 Patch 的信息，不需要逐层累积。这使得 ViT 在大规模预训练下超越了 CNN。

但 ViT 也有明显缺点：在小数据集上表现不如 CNN（缺乏归纳偏置）、计算复杂度高（自注意力的计算量随 Patch 数量平方增长）、对位置编码敏感。因此，混合架构（CNN + Transformer）和现代 CNN（如 ConvNeXt，将 ViT 的设计思想引入 CNN）成为了重要的研究方向。`,
            mermaid: `graph TD
    A["CNN 的特点"] --> B["局部感受野"]
    A --> C["平移不变性（强偏置）"]
    A --> D["计算量与图像尺寸线性相关"]

    E["ViT 的特点"] --> F["全局感受野"]
    E --> G["无平移不变性（弱偏置）"]
    E --> H["计算量与 Patch 数平方相关"]

    I["融合趋势"] --> J["ConvNeXt: CNN + ViT 设计思想"]
    I --> K["Swin Transformer: 层次化 Transformer"]
    I --> L["CoAtNet: CNN + Attention 混合"]

    style A fill:#1e3a5f
    style E fill:#581c87
    style I fill:#14532d`,
            table: {
                headers: ["维度", "CNN（ResNet）", "ViT", "ConvNeXt"],
                rows: [
                    ["感受野", "局部，逐层累积", "全局（每层）", "局部，逐层累积"],
                    ["归纳偏置", "强（平移等变、局部性）", "弱", "中等"],
                    ["小数据表现", "优秀", "较差", "良好"],
                    ["大数据表现", "良好", "优秀", "优秀"],
                    ["计算复杂度", "O(图像面积)", "O(Patch数²)", "O(图像面积)"],
                    ["参数量（ImageNet 模型）", "~25M (ResNet-50)", "~86M (ViT-B/16)", "~88M"],
                    ["ImageNet Top-1 准确率", "~76%", "~81%", "~82%"],
                ],
            },
            warning: "不要盲目追随 ViT。如果你的数据集不大（少于 10 万张），或者计算资源有限，ResNet/ConvNeXt 仍然是更好的选择。架构选择应该基于具体场景，而非论文流行度。",
        },
    ],
};
