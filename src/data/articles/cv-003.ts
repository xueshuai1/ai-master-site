import { Article } from '../knowledge';

export const article: Article = {
    id: "cv-003",
    title: "图像分类：从 AlexNet 到 EfficientNet",
    category: "cv",
    tags: ["图像分类", "CNN", "架构演进"],
    summary: "梳理图像分类的经典模型演进路线与核心设计思想",
    date: "2026-04-12",
    readTime: "20 min",
    level: "入门",
    content: [
        {
            title: "1. 图像分类任务与 ImageNet 数据集",
            body: `图像分类是计算机视觉最基础的任务：给定一张图片，判断它属于哪个预定义类别。从早期的手工特征（SIFT、HOG）到深度学习时代，**核心思路始终是「提取有意义的视觉表征」**。2009 年 ImageNet 的发布改变了游戏规则——它提供了超过 1400 万张标注图片和 1000 个类别，为模型训练提供了前所未有的数据规模。ILSVRC 成为了衡量算法能力的标准赛场，也直接推动了 CNN 架构的快速迭代。**理解 ImageNet 的规模和多样性，是理解后续所有模型设计动机的起点**。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torchvision.transforms as T
from torchvision.datasets import ImageNet

# 加载 ImageNet 数据集（需自行下载）
transform = T.Compose([
    T.Resize(256),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225])
])
train_set = ImageNet(
    root="/data/imagenet",
    split="train",
    transform=transform
)`
                },
                {
                    lang: "python",
                    code: `# 快速查看 ImageNet 类别信息
from torchvision.datasets import ImageNet

# ImageNet 有 1000 个 ILSVRC 分类类别
imagenet = ImageNet(root="/data/imagenet", split="val")
print(f"图片数量: {len(imagenet)}")
print(f"类别数量: {len(imagenet.classes)}")
print(f"前5个类别: {imagenet.classes[:5]}")
# 输出: ['tench', 'goldfish', 'great_white_shark', ...]`
                }
            ],
            table: {
                headers: ["数据集", "图片数", "类别数", "发布年份"],
                rows: [
                    ["CIFAR-10", "60K", "10", "2009"],
                    ["CIFAR-100", "60K", "100", "2009"],
                    ["ImageNet-1K", "1.28M", "1000", "2009"],
                    ["ImageNet-21K", "14M", "21841", "2011"]
                ]
            },
            mermaid: `graph LR
    A["输入图片"] --> B["特征提取"]
    B --> C["全连接层"]
    C --> D["Softmax"]
    D --> E["类别预测"]
    class E s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "入门建议先用 CIFAR-10 练手，ImageNet 全量训练需要多张 GPU 跑数天",
            warning: "ImageNet 数据集超过 150GB，下载和预处理需要充足的磁盘空间"
        },
        {
            title: "2. AlexNet 革命：深度学习时代的开端",
            body: `2012 年，Alex Krizhevsky 提出的 AlexNet 以 15.3% 的 top-5 错误率碾压了传统方法（第二名 26.2%），**正式宣告了深度学习在视觉领域的统治地位**。AlexNet 的核心贡献有三：首次在大规模视觉任务中使用 ReLU 激活函数，解决了 sigmoid/tanh 的梯度消失问题；引入 Dropout 层有效缓解过拟合；利用两块 GPU 并行计算突破了当时的算力瓶颈。网络结构包含 5 个卷积层和 3 个全连接层，输入为 224×224 的图片。**AlexNet 的成功不仅是架构的胜利，更是「大数据 + 大算力 + 好算法」范式的首次验证**。`,
            code: [
                {
                    lang: "python",
                    code: `import torch.nn as nn

class AlexNet(nn.Module):
    def __init__(self, num_classes=1000):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, 11, stride=4, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(3, stride=2),
            nn.Conv2d(64, 192, 5, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(3, stride=2),
            nn.Conv2d(192, 384, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(384, 256, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(3, stride=2),
        )
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(256 * 6 * 6, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, 4096),
            nn.ReLU(inplace=True),
            nn.Linear(4096, num_classes),
        )`
                },
                {
                    lang: "python",
                    code: `# 为什么 ReLU 比 sigmoid 好？
import torch
import matplotlib.pyplot as plt

x = torch.linspace(-3, 3, 100)
relu = torch.relu(x)
sigmoid = torch.sigmoid(x)

plt.plot(x.numpy(), relu.numpy(), label='ReLU')
plt.plot(x.numpy(), sigmoid.numpy(), label='Sigmoid')
plt.axhline(y=0, color='gray', linestyle='--')
plt.axvline(x=0, color='gray', linestyle='--')
plt.legend()
plt.title('Activation Functions')
plt.grid(True)
plt.show()
# ReLU 在正区间梯度恒为 1，避免梯度消失`
                }
            ],
            table: {
                headers: ["技术点", "AlexNet 的做法", "带来的好处"],
                rows: [
                    ["激活函数", "ReLU 替代 sigmoid", "训练速度快 6 倍"],
                    ["正则化", "Dropout (p=0.5)", "显著降低过拟合"],
                    ["数据增强", "随机裁剪 + 水平翻转", "提升泛化能力"],
                    ["算力", "双 GPU 并行", "突破单卡显存限制"],
                    ["归一化", "局部响应归一化 (LRN)", "微小精度提升"]
                ]
            },
            mermaid: `graph TD
    A["224x224x3
输入"] --> B["Conv 96@11x11
s=4"]
    B --> C["ReLU + LRN"]
    C --> D["MaxPool 3x3
s=2"]
    D --> E["Conv 256@5x5"]
    E --> F["ReLU + LRN"]
    F --> G["MaxPool 3x3
s=2"]
    G --> H["Conv 384@3x3"]
    H --> I["Conv 384@3x3"]
    I --> J["Conv 256@3x3"]
    J --> K["MaxPool"]
    K --> L["FC 4096
+ Dropout"]
    L --> M["FC 4096
+ Dropout"]
    M --> N["FC 1000
Softmax"]`,
            tip: "AlexNet 参数量约 6000 万，其中全连接层占了绝大部分，可以用全局平均池化替代全连接层来压缩参数",
            warning: "LRN（局部响应归一化）在后来的研究中被证明效果有限，现代架构基本不再使用"
        },
        {
            title: "3. VGG 的简洁之美：3x3 卷积堆叠的力量",
            body: `2014 年牛津大学 VGG 团队提出了一个极其简洁的设计哲学：**「用多个 3x3 卷积核替代大卷积核」**。两个 3x3 卷积的感受野等价于一个 5x5，三个 3x3 等价于一个 7x7，但参数更少、非线性更多。VGG-16 和 VGG-19 凭借这种统一的设计风格在 ILSVRC 2014 中获得第二名。**VGG 的最大贡献在于证明了「深度」本身就能带来性能提升**——不需要复杂的模块设计，只要把简单的操作重复足够多次。这种「朴素但深刻」的思想影响了后续几乎所有 CNN 架构的设计。`,
            code: [
                {
                    lang: "python",
                    code: `import torch.nn as nn

def make_layers(cfg, batch_norm=True):
    """VGG 风格卷积层构建函数"""
    layers = []
    in_channels = 3
    for v in cfg:
        if v == 'M':
            layers += [nn.MaxPool2d(2, 2)]
        else:
            conv = nn.Conv2d(in_channels, v, 3, padding=1)
            if batch_norm:
                layers += [conv, nn.BatchNorm2d(v), nn.ReLU(True)]
            else:
                layers += [conv, nn.ReLU(True)]
            in_channels = v
    return nn.Sequential(*layers)

# VGG-16 配置: 'M' = MaxPool
cfg_16 = [64, 64, 'M', 128, 128, 'M',
          256, 256, 256, 'M', 512, 512, 512, 'M',
          512, 512, 512, 'M']
features = make_layers(cfg_16)`
                },
                {
                    lang: "python",
                    code: `# 感受野计算：3 层 3x3 vs 1 层 7x7
def calc_receptive_field(layers):
    """计算网络的感受野大小"""
    rf = 1  # 初始感受野
    for kernel, stride in layers:
        rf = rf + (kernel - 1) * stride
    return rf

# 单层 7x7 卷积
rf_7x7 = calc_receptive_field([(7, 1)])
print(f"7x7 感受野: {rf_7x7}")  # 7

# 三层 3x3 卷积 (stride=1)
rf_3x3 = calc_receptive_field([(3, 1), (3, 1), (3, 1)])
print(f"3x3 x3 感受野: {rf_3x3}")  # 7

# 结论: 感受野相同，但 3 层 3x3 参数更少、有更多 ReLU 非线性`
                }
            ],
            table: {
                headers: ["模型", "层数", "参数量", "Top-1 错误率"],
                rows: [
                    ["VGG-11", "11", "132M", "30.98%"],
                    ["VGG-13", "13", "133M", "30.07%"],
                    ["VGG-16", "16", "138M", "28.41%"],
                    ["VGG-19", "19", "144M", "27.62%"],
                    ["AlexNet", "8", "60M", "39.56%"]
                ]
            },
            mermaid: `graph LR
    A["7x7 卷积
参数量: 49C²"] --> B["等效感受野 7x7"]
    C["3x3 → 3x3 → 3x3
参数量: 27C²"] --> B
    subgraph 结论
    B --> D["3x3 堆叠参数减少 45％
且增加 2 次非线性变换"]
    end
    class A s1
    class C s0
    classDef s0 fill:#14532d
    classDef s1 fill:#7c2d12`,
            tip: "VGG 的权重可以直接迁移到任何 3x3 卷积架构中作为预训练初始化",
            warning: "VGG-16 的 138M 参数中 90% 在全连接层，实际部署时可用 GAP 替代以大幅压缩模型"
        },
        {
            title: "4. GoogLeNet 与 Inception 模块：多尺度并行处理",
            body: `2014 年 Google 提出的 GoogLeNet（Inception v1）以 22 层的深度和仅 500 万参数量（VGG 的 1/28）拿下了 ILSVRC 冠军。**核心创新是 Inception 模块——在同一层并行使用 1x1、3x3、5x5 卷积和池化**，然后将结果拼接，让网络自动选择最合适的感受野。其中 **1x1 卷积承担了「降维」的关键角色**，在增加非线性的同时大幅减少了计算量。GoogLeNet 还引入了辅助分类器（auxiliary classifiers）和全局平均池化，解决了深层网络的训练难题。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class InceptionBlock(nn.Module):
    """Inception 模块：多尺度并行卷积"""
    def __init__(self, in_ch, c1, c2r, c2, c3r, c3, c4):
        super().__init__()
        # 1x1 分支
        self.b1 = nn.Conv2d(in_ch, c1, 1)
        # 1x1 降维 + 3x3 卷积分支
        self.b2 = nn.Sequential(
            nn.Conv2d(in_ch, c2r, 1),
            nn.ReLU(),
            nn.Conv2d(c2r, c2, 3, padding=1)
        )
        # 1x1 降维 + 5x5 卷积分支
        self.b3 = nn.Sequential(
            nn.Conv2d(in_ch, c3r, 1),
            nn.ReLU(),
            nn.Conv2d(c3r, c3, 5, padding=2)
        )
        # 3x3 池化 + 1x1 分支
        self.b4 = nn.Sequential(
            nn.MaxPool2d(3, 1, 1),
            nn.Conv2d(in_ch, c4, 1)
        )

    def forward(self, x):
        return torch.cat([
            F.relu(self.b1(x)),
            F.relu(self.b2(x)),
            F.relu(self.b3(x)),
            F.relu(self.b4(x))
        ], dim=1)`
                },
                {
                    lang: "python",
                    code: `# 1x1 卷积的降维效果
def calc_flops_with_bottleneck(in_ch, mid_ch, out_ch, size=28):
    """对比使用和不使用 1x1 瓶颈层的计算量"""
    # 直接使用 3x3 卷积
    direct_flops = in_ch * out_ch * 9 * size * size
    # 使用 1x1 降维 + 3x3 + 1x1 升维
    bottleneck_flops = (
        in_ch * mid_ch * 1 * size * size +      # 1x1 降维
        mid_ch * mid_ch * 9 * size * size +      # 3x3 卷积
        mid_ch * out_ch * 1 * size * size        # 1x1 升维
    )
    ratio = direct_flops / bottleneck_flops
    print(f"直接 3x3: {direct_flops/1e6:.1f}M FLOPs")
    print(f"瓶颈方案: {bottleneck_flops/1e6:.1f}M FLOPs")
    print(f"加速比: {ratio:.1f}x")

calc_flops_with_bottleneck(256, 64, 256)
# 输出: 瓶颈方案比直接方案快约 2.8 倍`
                }
            ],
            table: {
                headers: ["Inception 分支", "作用", "典型通道数配置"],
                rows: [
                    ["1x1 卷积", "提取通道特征，低计算成本", "64"],
                    ["1x1→3x3", "中等感受野 + 降维加速", "64→128"],
                    ["1x1→5x5", "较大感受野 + 降维加速", "16→32"],
                    ["Pool→1x1", "保留空间信息 + 通道变换", "64"],
                    ["拼接输出", "多尺度特征融合", "64+128+32+64=288"]
                ]
            },
            mermaid: `graph TD
    subgraph Inception 模块
    I["输入 Tensor"]
    I --> A["1x1 Conv"]
    I --> B["1x1 Conv"]
    B --> C["3x3 Conv"]
    I --> D["1x1 Conv"]
    D --> E["5x5 Conv"]
    I --> F["3x3 MaxPool"]
    F --> G["1x1 Conv"]
    A --> H["Concat
通道拼接"]
    C --> H
    E --> H
    G --> H
    H --> J["输出 Tensor"]
    end
    class J s1
    class I s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "理解 Inception 的核心是理解「让网络自己决定哪个感受野最有效」，而不是人工设计",
            warning: "GoogLeNet 的 1x1 卷积降维比例需要根据通道数仔细调，降得太狠会丢失信息"
        },
        {
            title: "5. ResNet 与残差连接：突破深度的天花板",
            body: `2015 年何恺明等人提出的 ResNet 是深度学习史上最具影响力的架构之一。它解决了一个反直觉的问题：**更深的网络反而效果更差（退化问题）**。核心思想极其优雅——与其让网络直接拟合目标映射 H(x)，不如学习残差 F(x) = H(x) - x，然后通过跳跃连接将输入 x 直接加到输出上：y = F(x) + x。**这种设计让恒等映射变得「免费」，即使深层权重退化为零，信号仍能畅通无阻地传播**。ResNet-50 仅有 2500 万参数（VGG-16 的 1/5），却达到了更低的错误率，而 ResNet-152 则将深度推到了 152 层。`,
            code: [
                {
                    lang: "python",
                    code: `import torch.nn as nn

class BasicBlock(nn.Module):
    """ResNet 基础残差块（用于 ResNet-18/34）"""
    expansion = 1

    def __init__(self, in_ch, out_ch, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_ch, out_ch, 3,
                                stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_ch)
        self.conv2 = nn.Conv2d(out_ch, out_ch, 3,
                                padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_ch)
        # 下采样时用 1x1 卷积匹配维度
        self.shortcut = nn.Sequential()
        if stride != 1 or in_ch != out_ch:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_ch, out_ch, 1, stride=stride, bias=False),
                nn.BatchNorm2d(out_ch)
            )

    def forward(self, x):
        out = nn.functional.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)  # 残差连接：核心！
        out = nn.functional.relu(out)
        return out`
                },
                {
                    lang: "python",
                    code: `# 可视化残差连接 vs 普通网络的信息流
import torch

class PlainBlock(nn.Module):
    """普通堆叠：信息逐层衰减"""
    def __init__(self, dim):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(dim, dim), nn.ReLU(),
            nn.Linear(dim, dim), nn.ReLU(),
            nn.Linear(dim, dim), nn.ReLU(),
        )
    def forward(self, x):
        return self.layers(x)

class ResBlock(nn.Module):
    """残差块：信息无损传播"""
    def __init__(self, dim):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(dim, dim), nn.ReLU(),
            nn.Linear(dim, dim), nn.ReLU(),
        )
    def forward(self, x):
        return x + self.layers(x)  # 残差连接

x = torch.randn(1, 64)
plain = PlainBlock(64)
res = ResBlock(64)
# 残差块的梯度可以直接流过 shortcut，\n# 避免了深层网络的梯度消失`
                }
            ],
            table: {
                headers: ["模型", "层数", "参数量", "Top-1 错误率", "核心创新"],
                rows: [
                    ["VGG-19", "19", "144M", "27.62%", "3x3 堆叠"],
                    ["GoogLeNet", "22", "5M", "30.23%", "Inception 模块"],
                    ["ResNet-34", "34", "21M", "26.71%", "残差连接"],
                    ["ResNet-50", "50", "25M", "24.13%", "瓶颈残差块"],
                    ["ResNet-152", "152", "60M", "22.85%", "极深残差网络"]
                ]
            },
            mermaid: `graph TD
    A["输入 x"] --> B["Conv1 3x3"]
    B --> C["BN + ReLU"]
    C --> D["Conv2 3x3"]
    D --> E["BN"]
    E --> F{"维度匹配?"}
    F -->|"是"| G["y = F(x) + x"]
    F -->|"否"| H["shortcut 1x1
匹配维度"]
    H --> G
    G --> I["ReLU"]
    I --> J["输出"]
    class J s2
    class G s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
            tip: "ResNet 的 shortcut 是理解所有现代架构的基础——DenseNet、Transformer 的 skip connection 都源自这一思想",
            warning: "使用预训练 ResNet 做迁移学习时，记得替换最后的全连接层以匹配你的类别数"
        },
        {
            title: "6. EfficientNet 与复合缩放：效率至上的设计哲学",
            body: `2019 年 Google 提出的 EfficientNet 提出了一种系统化的模型缩放方法。以往的做法是「手工调参」——有人加深度，有人加宽度，有人加分辨率，各自为战。EfficientNet 通过神经架构搜索（NAS）找到了一个最优的基础网络 EfficientNet-B0，**然后提出复合缩放系数 φ，用一个简单的公式同时缩放深度、宽度和分辨率**：d = α^φ, w = β^φ, r = γ^φ。这种系统化的缩放策略使得 EfficientNet-B7 在参数量只有 ResNet-152 的 1/8 的情况下，取得了更好的精度和 6.1 倍的推理速度。**这告诉我们：「更聪明地设计」远比「盲目堆参数」有效**。`,
            code: [
                {
                    lang: "python",
                    code: `import torch.nn as nn
from torchvision.models import efficientnet_b0

class MBConv(nn.Module):
    """Mobile Inverted Bottleneck Conv - EfficientNet 核心构建块"""
    def __init__(self, in_ch, out_ch, kernel, stride, expand_ratio):
        super().__init__()
        hidden_ch = in_ch * expand_ratio
        layers = []

        # 1. 扩展层：用 1x1 增加通道数
        if expand_ratio != 1:
            layers.extend([
                nn.Conv2d(in_ch, hidden_ch, 1, bias=False),
                nn.BatchNorm2d(hidden_ch),
                nn.SiLU()  # Swish 激活
            ])

        # 2. 深度可分离卷积
        layers.extend([
            nn.Conv2d(hidden_ch, hidden_ch, kernel,
                       stride=stride, padding=kernel//2,
                       groups=hidden_ch, bias=False),
            nn.BatchNorm2d(hidden_ch),
            nn.SiLU()
        ])

        # 3. 投影层：用 1x1 压缩通道数
        layers.extend([
            nn.Conv2d(hidden_ch, out_ch, 1, bias=False),
            nn.BatchNorm2d(out_ch)
        ])

        self.block = nn.Sequential(*layers)
        self.skip = (stride == 1 and in_ch == out_ch)

    def forward(self, x):
        if self.skip:
            return x + self.block(x)  # 残差连接
        return self.block(x)`
                },
                {
                    lang: "python",
                    code: `# EfficientNet 复合缩放公式
import math

def compound_scaling(phi, alpha=1.2, beta=1.1, gamma=1.15):
    """
    复合缩放: d = alpha^phi, w = beta^phi, r = gamma^phi
    alpha, beta, gamma 由 NAS 搜索得到，满足 alpha*beta^2*gamma^2 ≈ 2
    """
    depth = alpha  phi
    width = beta  phi
    resolution = gamma ** phi
    return depth, width, resolution

print("EfficientNet 各版本缩放参数:")
print(f"{'版本':<10} {'phi':<6} {'深度倍率':<10} {'宽度倍率':<10} {'分辨率':<8}")
for b in range(8):
    d, w, r = compound_scaling(b)
    print(f"B{b:<9} {b:<6} {d:<10.2f} {w:<10.2f} {r*224:<8.0f}")
# B0: phi=0 → 基础模型 (224x224)
# B7: phi=7 → 最大模型 (~600x600)`
                }
            ],
            table: {
                headers: ["模型", "参数量", "Top-1 准确率", "FLOPs", "推理速度"],
                rows: [
                    ["ResNet-152", "60M", "77.8%", "11.5G", "1x"],
                    ["EfficientNet-B0", "5.3M", "77.1%", "0.39G", "2.1x"],
                    ["EfficientNet-B3", "12M", "81.6%", "1.8G", "1.4x"],
                    ["EfficientNet-B7", "66M", "84.4%", "37G", "6.1x"],
                    ["ViT-B/16", "86M", "77.9%", "17.6G", "0.8x"]
                ]
            },
            mermaid: `graph LR
    A["NAS 搜索
基础架构 B0"] --> B["确定复合系数
α, β, γ"]
    B --> C["统一缩放
φ = 0~7"]
    C --> D["增加深度
d = α^φ"]
    C --> E["增加宽度
w = β^φ"]
    C --> F["增加分辨率
r = γ^φ"]
    D --> G["EfficientNet-B1~B7
系列模型"]
    E --> G
    F --> G
    class G s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "实际部署时优先选 EfficientNet-B0 或 B3，在精度和速度之间取得最佳平衡",
            warning: "EfficientNet 使用了 SiLU/Swish 激活函数，如果你的硬件不支持 SiLU 加速，推理速度会下降"
        },
        {
            title: "7. PyTorch 预训练模型实战：从加载到推理",
            body: `PyTorch 的 torchvision 提供了所有经典模型的预训练权重，几行代码即可加载使用。**实战中需要注意三个关键点：输入图片的预处理必须与训练时一致**（归一化均值和标准差）、模型的 eval() 模式不能忘记（否则 BatchNorm 和 Dropout 行为不一致）、以及输出概率的获取需要过 softmax。对于迁移学习场景，通常需要冻结特征提取层（requires_grad=False），只训练最后的全连接层。**预训练模型的价值在于：它已经在 ImageNet 上学到了通用的视觉特征**（边缘、纹理、形状），你只需要微调即可适应自己的任务，大幅减少训练时间和数据需求。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
from torchvision import models, transforms
from PIL import Image

# 1. 加载预训练模型
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
model.eval()  # 切换到评估模式（重要！）

# 2. 图片预处理（必须与训练时一致）
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# 3. 推理
img = Image.open("cat.jpg")
x = preprocess(img).unsqueeze(0)  # 添加 batch 维度

with torch.no_grad():
    output = model(x)
    probs = torch.softmax(output, dim=1)
    top5 = torch.topk(probs, 5)

for prob, idx in zip(top5.values[0], top5.indices[0]):
    print(f"类别 {idx.item()}: {prob.item()*100:.2f}%")`
                },
                {
                    lang: "python",
                    code: `# 迁移学习：冻结特征提取层，微调分类头
import torch.nn as nn
from torchvision import models

# 加载预训练 ResNet-50
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

# 冻结所有特征提取层
for param in model.parameters():
    param.requires_grad = False

# 替换分类头（ImageNet 是 1000 类，我们只需要 10 类）
num_features = model.fc.in_features
model.fc = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(num_features, 256),
    nn.ReLU(),
    nn.Linear(256, 10)  # 自定义类别数
)

# 只训练分类头的参数
optimizer = torch.optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=1e-3
)
print(f"可训练参数: {sum(p.numel() for p in model.parameters() if p.requires_grad)}")
# 输出: ~150K (只有分类头), 对比全量 25M`
                }
            ],
            table: {
                headers: ["模型", "权重类型", "参数量", "适合场景"],
                rows: [
                    ["ResNet-50", "IMAGENET1K_V2", "25M", "通用分类首选"],
                    ["EfficientNet-B0", "IMAGENET1K_V1", "5.3M", "移动端部署"],
                    ["VGG-16", "IMAGENET1K_V1", "138M", "风格迁移/特征提取"],
                    ["ConvNeXt-T", "IMAGENET1K_V1", "29M", "纯 CNN 高性能场景"],
                    ["ViT-B/16", "IMAGENET1K_V1", "86M", "需要自注意力机制"]
                ]
            },
            mermaid: `graph TD
    A["加载预训练模型"] --> B["设置 model.eval()"]
    B --> C["预处理输入图片"]
    C --> D["torch.no_grad() 推理"]
    D --> E["softmax 获取概率"]
    E --> F["top-k 获取结果"]
    subgraph 迁移学习分支
    A --> G["冻结 backbone"]
    G --> H["替换 fc 层"]
    H --> I["只训练分类头"]
    I --> J["微调整个网络"]
    end
    class J s2
    class F s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
            tip: "torchvision 的 weights API (v0.13+) 比旧的 pretrained=True 更灵活，可以选不同版本的权重",
            warning: "推理前必须调用 model.eval()，否则 BatchNorm 会用 batch 统计量而非运行统计量，导致结果不稳定"
        }
    ],
};
