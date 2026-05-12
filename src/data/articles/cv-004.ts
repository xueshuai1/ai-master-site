import { Article } from '../knowledge';

export const article: Article = {
    id: "cv-004",
    title: "卷积操作详解（实战）：卷积核、步长、填充",
    category: "cv",
    tags: ["卷积", "CNN基础", "计算机视觉"],
    summary: "深入理解卷积运算的每一个细节，掌握 CNN 的基石",
    date: "2026-04-12",
    readTime: "16 min",
    level: "入门",
  learningPath: {
    routeId: "cnn-series",
    phase: 3,
    order: 3,
    nextStep: null,
    prevStep: "dl-020",
  },
    content: [
        {
            title: "1. 什么是卷积（1D → 2D）",
            body: `卷积（Convolution）是 CNN 最核心的运算，本质上是一种带权滑动窗口的局部操作。

**1D 卷积**： 假设输入信号 x = [1, 3, 5, 2, 4]，卷积核 k = [1, 0, -1]。卷积核在输入上从左到右滑动，每次覆盖 3 个元素，做对应位置的乘法并求和。第一个输出为 1×1 + 3×0 + 5×(-1) = -4，第二个输出为 3×1 + 5×0 + 2×(-1) = 1，依此类推。这个过程也叫互相关（Cross-Correlation）——深度学习框架实际计算的是互相关而非数学意义上的翻转卷积，但习惯上统称卷积。

**2D 卷积**： 将 1D 推广到图像（二维矩阵）。输入是一张 H×W 的图像（或多通道特征图），卷积核是 K×K 的二维权重矩阵。卷积核在图像上从左到右、从上到下滑动，每次计算覆盖区域内所有对应元素的乘积之和，生成输出特征图上的一个像素值。

**多通道卷积**： 实际图像有 RGB 三个通道，每个通道对应独立的 2D 卷积核，各通道的结果逐元素相加后得到单通道输出。如果有多个卷积核（输出多通道），则每个核独立计算一组结果。

卷积运算的时间复杂度为 O(H × W × K² × C_in × C_out)，是 CNN 的主要计算瓶颈。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

def conv1d(signal: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    """1D 卷积（实际为互相关）
    signal: 1D 输入信号
    kernel: 1D 卷积核
    """
    k_size = len(kernel)
    output_len = len(signal) - k_size + 1  # valid 模式
    output = np.zeros(output_len)

    for i in range(output_len):
        output[i] = np.sum(signal[i:i+k_size] * kernel)

    return output

# 示例
signal = np.array([1, 3, 5, 2, 4])
kernel = np.array([1, 0, -1])
result = conv1d(signal, kernel)
print(f"1D 卷积结果: {result}")  # [-4  1 -3 -2]`,
                },
                {
                    lang: "python",
                    code: `def conv2d_single_channel(image: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    """2D 单通道卷积（valid 模式，无填充）
    image: (H, W) 二维矩阵
    kernel: (K, K) 卷积核
    """
    H, W = image.shape
    K = kernel.shape[0]
    out_H = H - K + 1
    out_W = W - K + 1
    output = np.zeros((out_H, out_W))

    for i in range(out_H):
        for j in range(out_W):
            region = image[i:i+K, j:j+K]
            output[i, j] = np.sum(region * kernel)

    return output

def conv2d_multi_channel(image: np.ndarray, kernels: np.ndarray) -> np.ndarray:
    """多通道 2D 卷积
    image: (C_in, H, W) 多通道输入
    kernels: (C_out, C_in, K, K) 多核权重
    """
    C_out, C_in, K, _ = kernels.shape
    H, W = image.shape[1], image.shape[2]
    out_H = H - K + 1
    out_W = W - K + 1
    output = np.zeros((C_out, out_H, out_W))

    for c_out in range(C_out):
        for c_in in range(C_in):
            for i in range(out_H):
                for j in range(out_W):
                    region = image[c_in, i:i+K, j:j+K]
                    output[c_out, i, j] += np.sum(region * kernels[c_out, c_in])

    return output`,
                },
            ],
            table: {
                headers: ["维度", "输入形状", "核形状", "输出形状 (valid)", "应用场景"],
                rows: [
                    ["1D", "(N,)", "(K,)", "(N-K+1,)", "时序信号、音频"],
                    ["2D 单通道", "(H, W)", "(K, K)", "(H-K+1, W-K+1)", "灰度图像"],
                    ["2D 多通道", "(C, H, W)", "(C_out, C, K, K)", "(C_out, H-K+1, W-K+1)", "彩色图像、特征图"],
                    ["3D", "(D, H, W)", "(K_d, K_h, K_w)", "类似", "视频、医学影像"],
                ],
            },
            mermaid: `graph LR
  A["1D 信号"] -->|"滑动窗口 K=3"| B["1D 输出"]
  C["2D 图像 H×W"] -->|"2D 卷积核 K×K"| D["特征图 H'×W'"]
  E["多通道输入"] -->|"逐通道卷积 + 求和"| F["多通道输出"]`,
            tip: "先在一维信号上手算一遍卷积，再推广到二维，理解起来会轻松很多。卷积的本质就是「加权求和的滑动窗口」。",
            warning: "深度学习中的「卷积」严格来说是互相关（不翻转核），数学定义的卷积需要先将核旋转 180° 再做互相关。但在 CNN 中两者等价，因为核权重是学出来的。",
        },
        {
            title: "2. 卷积核与特征提取",
            body: `卷积核（Kernel / Filter）是卷积运算中的可学习权重矩阵，它决定了网络从输入中提取什么样的特征。不同尺寸的卷积核捕捉不同粒度的信息：3×3 核关注局部纹理和边缘，5×5 和 7×7 核关注更大范围的语义模式。

为什么 3×3 成为主流？ 两个 3×3 卷积堆叠的感受野等价于一个 5×5 卷积，但参数量更少（2 × 3² = 18 vs 5² = 25），且多了一次非线性激活，表达能力更强。VGGNet 首次系统性地用 3×3 小核替代大核，奠定了现代 CNN 的设计范式。

经典卷积核示例： Sobel 核用于边缘检测（水平/垂直梯度），Laplacian 核用于检测二阶导数（锐化），高斯核用于平滑去噪。这些是手工设计的固定核，CNN 中的卷积核则通过反向传播从数据中自动学习。

特征图（Feature Map）： 输入经过卷积核后得到的输出称为特征图。每个卷积核提取一种特定特征，网络通过堆叠多层卷积，从低级特征（边缘、颜色）逐步提取到高级特征（纹理、部件、物体）。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import matplotlib.pyplot as plt

# 经典手工卷积核
sobel_x = np.array([[-1, 0, 1],
                    [-2, 0, 2],
                    [-1, 0, 1]])  # 垂直边缘检测

sobel_y = np.array([[-1, -2, -1],
                    [ 0,  0,  0],
                    [ 1,  2,  1]])  # 水平边缘检测

laplacian = np.array([[0,  1, 0],
                      [1, -4, 1],
                      [0,  1, 0]])  # 二阶导数/边缘

gaussian_3x3 = np.array([[1, 2, 1],
                          [2, 4, 2],
                          [1, 2, 1]]) / 16.0  # 高斯平滑

# 可视化卷积核
kernels = {
    "Sobel-X (垂直边缘)": sobel_x,
    "Sobel-Y (水平边缘)": sobel_y,
    "Laplacian (锐化)": laplacian,
    "Gaussian (平滑)": gaussian_3x3,
}

fig, axes = plt.subplots(2, 2, figsize=(8, 8))
for ax, (name, kernel) in zip(axes.ravel(), kernels.items()):
    ax.imshow(kernel, cmap='coolwarm')
    ax.set_title(name)
    ax.axis('off')
plt.tight_layout()
plt.savefig("classic_kernels.png", dpi=150)`,
                },
                {
                    lang: "python",
                    code: `# 参数量对比：3x3 堆叠 vs 大核
def compare_params(kernel_size: int, num_layers: int, channels: int) -> int:
    """计算堆叠卷积的总参数量（忽略 bias）"""
    return num_layers * (kernel_size  2) * (channels  2)

channels = 64

# 等效感受野的参数量对比
params_3x3 = compare_params(3, 2, channels)  # 两个 3x3 ≈ 5x5 感受野
params_5x5 = compare_params(5, 1, channels)  # 一个 5x5
params_7x7 = compare_params(7, 1, channels)  # 一个 7x7

print(f"2×3×3 参数量: {params_3x3:,}")  # 589,824
print(f"1×5×5 参数量: {params_5x5:,}")  # 409,600 (感受野等效但参数少？)
# 注意: 5x5 = 25, 2×3x3 = 18, 但 channels² 乘上去后:
# 2×3²×64² = 2×9×4096 = 73,728
# 1×5²×64² = 25×4096 = 102,400

print(f"2×3×3: {params_3x3:,}")  # 73,728
print(f"1×5×5: {params_5x5:,}")  # 102,400
print(f"节省比例: {(1 - params_3x3/params_5x5)*100:.1f}%")  # 28.0%`,
                },
            ],
            table: {
                headers: ["卷积核类型", "尺寸", "参数量 (C=64)", "感受野 (单层)", "用途"],
                rows: [
                    ["3×3", "3×3", "36,864", "3×3", "通用特征提取"],
                    ["5×5", "5×5", "102,400", "5×5", "中等范围模式"],
                    ["7×7", "7×7", "200,704", "7×7", "第一层(如 ResNet 输入)"],
                    ["2×3×3 堆叠", "等效 5×5", "73,728", "5×5", "替代大核"],
                    ["1×1", "1×1", "4,096", "1×1", "通道混合/降维"],
                ],
            },
            mermaid: `graph TD
  A[原始输入] -->|"3×3 卷积 ×16"| B[低级特征: 边缘/颜色]
  B -->|"3×3 卷积 ×32"| C[中级特征: 纹理/形状]
  C -->|"3×3 卷积 ×64"| D[高级特征: 部件]
  D -->|"3×3 卷积 ×128"| E[语义特征: 物体类别]`,
            tip: "3×3 小核 + 深层堆叠是现代 CNN 的标配。GoogLeNet 的 Inception 模块则用 1×1、3×3、5×5 多尺度并行提取特征，再用 1×1 卷积降维控制计算量。",
            warning: "卷积核尺寸不是越大越好。大核虽然感受野大，但参数量呈平方级增长，且容易过拟合。大多数场景下 3×3 已经足够，大核只在第一层（如 7×7 接收原始图像）时常见。",
        },
        {
            title: "3. 步长（Stride）与输出尺寸",
            body: `步长（Stride）控制卷积核每次滑动的距离。Stride = 1 表示每次移动 1 个像素，Stride = 2 表示跳 1 个像素移动。增大步长相当于对特征图进行下采样，可以显著减少输出尺寸和计算量。

输出尺寸公式（Valid 模式，无填充）：

输出高度 = ⌊(H- K + 2P) / S⌋ + 1
输出宽度 = ⌊(W- K + 2P) / S⌋ + 1

其中 H、W 为输入尺寸，K 为卷积核大小，P 为填充量，S 为步长。⌊⌋ 表示向下取整。

为什么需要下采样？ ① 减少计算量和内存占用 ② 增大后续层的感受野 ③ 使网络对输入的小平移不敏感。传统 CNN 使用 MaxPooling 进行下采样，而 ResNet 等现代网络更倾向于用 Stride = 2 的卷积直接替代 Pooling 层。

**非对称步长**： 可以分别指定水平和垂直方向的步长（如 stride_h=1, stride_w=2），用于特殊场景如文本识别或全景图像。`,
            code: [
                {
                    lang: "python",
                    code: `import math

def conv_output_size(input_size: int, kernel_size: int,
                     stride: int = 1, padding: int = 0) -> int:
    """计算卷积输出尺寸
    input_size: 输入高度或宽度
    kernel_size: 卷积核大小
    stride: 步长
    padding: 单边填充量
    """
    return math.floor((input_size + 2 * padding - kernel_size) / stride) + 1

# ========== 典型场景 ==========
print("=== 步长对输出尺寸的影响 ===")
input_size = 32

for stride in [1, 2, 3, 4]:
    out = conv_output_size(input_size, kernel_size=3, stride=stride)
    reduction = (1 - out / input_size) * 100
    print(f"stride={stride}: 输出 {out}×{out}, 缩小 {reduction:.1f}%")

print()
print("=== 等效 Pooling 对比 ===")
# stride=2 的 3x3 卷积 vs maxpool 2x2
h, w, k, s, p = 224, 224, 3, 2, 1
out_h = conv_output_size(h, k, s, p)
print(f"输入: {h}×{w}, Conv(k=3,s=2,p=1) → {out_h}×{out_h}")
# MaxPool 2x2: out = floor((224 - 2) / 2) + 1 = 112
pool_out = conv_output_size(h, kernel_size=2, stride=2)
print(f"输入: {h}×{w}, MaxPool(k=2,s=2)   → {pool_out}×{pool_out}")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np

def conv2d_with_stride(image: np.ndarray, kernel: np.ndarray,
                       stride: int = 1, padding: int = 0) -> np.ndarray:
    """带步长和填充的 2D 卷积"""
    if padding > 0:
        image = np.pad(image, pad_width=padding, mode='constant', constant_values=0)

    H, W = image.shape
    K = kernel.shape[0]
    out_H = (H - K) // stride + 1
    out_W = (W - K) // stride + 1
    output = np.zeros((out_H, out_W))

    for i in range(out_H):
        for j in range(out_W):
            region = image[i * stride:i * stride + K,
                           j * stride:j * stride + K]
            output[i, j] = np.sum(region * kernel)

    return output

# ========== 对比 stride=1 vs stride=2 ==========
img = np.arange(36).reshape(6, 6).astype(float)
kernel = np.ones((3, 3))

out_s1 = conv2d_with_stride(img, kernel, stride=1)  # 输出 4×4
out_s2 = conv2d_with_stride(img, kernel, stride=2)  # 输出 2×2

print(f"输入: 6×6, 核: 3×3")
print(f"stride=1 → 输出 {out_s1.shape[0]}×{out_s1.shape[1]}")
print(f"stride=2 → 输出 {out_s2.shape[0]}×{out_s2.shape[1]}")`,
                },
            ],
            table: {
                headers: ["输入尺寸", "核大小", "步长", "填充", "输出尺寸", "信息保留"],
                rows: [
                    ["32×32", "3×3", "1", "0", "30×30", "完整"],
                    ["32×32", "3×3", "2", "0", "15×15", "一半"],
                    ["32×32", "3×3", "2", "1", "16×16", "一半+边界"],
                    ["224×224", "7×7", "2", "3", "112×112", "一半"],
                    ["224×224", "3×3", "2", "1", "112×112", "一半"],
                ],
            },
            mermaid: `graph LR
  A["输入 6×6"] -->|"stride=1, k=3"| B["输出 4×4"]
  A -->|"stride=2, k=3"| C["输出 2×2"]
  B -->|"stride=2, k=3"| D["输出 1×1"]
  C -->|"stride=2, k=3"| E["无法卷积 (尺寸不够)"]`,
            tip: "ResNet 用 stride=2 的卷积替代 pooling 做下采样是更好的选择：既能减少尺寸，又能学习下采样策略，而不是固定的最大值或平均值。",
            warning: "步长过大可能导致信息丢失！stride > kernel_size 时，输入中有像素永远不会被卷积核覆盖，造成信息空洞。通常 stride 不超过 3。",
        },
        {
            title: "4. 填充（Padding）策略",
            body: `填充（Padding）是在输入特征图的四周补零（Zero Padding），目的是控制输出尺寸并保留边界信息。没有填充时，每次卷积输出都会缩小（Valid 模式），多次卷积后特征图尺寸急剧缩小，且边界像素参与计算的次数远少于中心像素，导致边界信息丢失。

Same 填充： 填充量 P = (K - 1) / 2（K 为奇数时），使得输出尺寸与输入尺寸相同（当 stride=1 时）。例如 3×3 卷积需要 P=1，5×5 需要 P=2。这是最常用的填充策略。

Valid 填充： 不填充（P=0），输出尺寸 = ⌊(H - K) / S⌋ + 1。适用于需要逐步缩小特征图的场景。

**不对称填充**： 可以只在上/下或左/右单边填充，用于保持输出尺寸为特定值（如 K 为偶数时 Same 填充不唯一）。PyTorch 支持 tuple 形式的 padding：padding=(1, 2) 表示上下填充 1、左右填充 2。

**填充的副作用**： 零填充区域不参与有意义的特征提取，但会贡献到后续层的感受野。在某些任务（如语义分割）中，会用反射填充（Reflection Padding）或复制填充（Replication Padding）替代零填充，避免边界伪影。`,
            code: [
                {
                    lang: "python",
                    code: `import math

def padding_for_same(input_size: int, kernel_size: int,
                     stride: int = 1) -> int:
    """计算 Same 填充所需的填充量
    使 output_size = ceil(input_size / stride)
    """
    # output = floor((input + 2P - K) / S) + 1
    # 令 output = ceil(input / S)，求解 P
    output = math.ceil(input_size / stride)
    P = (output - 1) * stride + kernel_size - input_size
    P = math.ceil(P / 2)
    return max(0, P)

# ========== Same 填充计算 ==========
print("=== Same 填充量 ===")
for k in [3, 5, 7]:
    p = padding_for_same(32, k)
    out = math.floor((32 + 2*p - k) / 1) + 1
    print(f"K={k}: P={p}, 输出 {out}×{out} (stride=1)")

print()
# ========== 偶数核的特殊情况 ==========
print("=== 偶数核的不对称填充 ===")
for k in [2, 4]:
    p = padding_for_same(32, k)
    out = math.floor((32 + 2*p - k) / 1) + 1
    print(f"K={k}: 总填充={2*p}, 输出 {out}×{out}")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np

def apply_padding(image: np.ndarray, padding: int,
                  mode: str = "constant") -> np.ndarray:
    """应用不同填充策略
    mode: "constant" (零填充), "reflect", "replicate"
    """
    if mode == "constant":
        return np.pad(image, padding, mode='constant', constant_values=0)
    elif mode == "reflect":
        return np.pad(image, padding, mode='reflect')
    elif mode == "replicate":
        return np.pad(image, padding, mode='edge')
    else:
        raise ValueError(f"未知填充模式: {mode}")

# ========== 不同填充模式对比 ==========
img = np.array([[1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]])

print("原始图像:")
print(img)

print("\\n零填充 (P=1):")
print(apply_padding(img, 1, "constant"))

print("\\n反射填充 (P=1):")
print(apply_padding(img, 1, "reflect"))

print("\\n复制填充 (P=1):")
print(apply_padding(img, 1, "replicate"))`,
                },
            ],
            table: {
                headers: ["填充策略", "填充值", "边界效应", "适用场景"],
                rows: [
                    ["Zero Padding", "0", "有边界突变", "CNN 默认，大多数场景"],
                    ["Reflect Padding", "镜像对称", "无突变", "风格迁移、GAN"],
                    ["Replication Padding", "复制边缘", "无突变", "语义分割"],
                    ["Circular Padding", "周期性", "无边界", "周期信号处理"],
                    ["无填充 (Valid)", "N/A", "边界信息丢失", "需要下采样时"],
                ],
            },
            mermaid: `graph TD
  A["输入 5×5"] -->|"P=0 (Valid)"| B["输出 3×3
边界丢失"]
  A -->|"P=1 (Same)"| C["输出 5×3
保留边界"]
  A -->|"P=2"| D["输出 7×7
信息扩展"]`,
            tip: "入门阶段记住一个规则：大多数卷积层用 Same 填充（PyTorch 中 padding=kernel_size//2），需要缩小尺寸时用 stride=2 或 pooling，不要混用无填充的卷积。",
            warning: "PyTorch 的 Conv2d 默认 padding=0（Valid 模式）！如果想保持尺寸不变，需要手动设置 padding=kernel_size//2。Keras 的 Conv2D 默认也是 valid，但可以设置 padding='same' 自动计算填充量。",
        },
        {
            title: "5. 空洞卷积与感受野",
            body: `空洞卷积（Dilated / Atrous Convolution）在标准卷积核的元素之间插入「空洞」，在不增加参数量的前提下扩大感受野。空洞率（Dilation Rate）r 表示卷积核元素之间的间隔：r=1 为标准卷积，r=2 表示每隔 1 个像素取一个值。

**有效感受野**： 空洞率为 r 的 K×K 卷积核，其等效感受野大小为 K' = K + (K - 1) × (r - 1) = (K - 1) × r + 1。例如 3×3 卷积在 r=2 时等效于 5×5 的感受野，但参数量仍为 9（3×3），而标准 5×5 卷积需要 25 个参数。

**级联空洞卷积**： 通过堆叠不同空洞率的卷积层，可以以指数级增长感受野。感受野 = 1 + Σ(K_i - 1) × r_i，其中 K_i 为第 i 层核大小，r_i 为第 i 层空洞率。这种设计在语义分割（DeepLab 系列）和时序建模（WaveNet）中广泛使用。

空洞卷积的副作用： 当空洞率过大时，会出现「网格效应（Gridding Effect）」——相邻输出像素的感受野不连续，丢失了局部连贯性。解决方法包括使用混合空洞率（Hybrid Dilated Convolution）或在空洞卷积之间插入标准卷积。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import math

def dilated_conv_output_size(input_size: int, kernel_size: int,
                              dilation: int = 1, stride: int = 1,
                              padding: int = 0) -> int:
    """计算空洞卷积输出尺寸
    有效核大小 K' = K + (K-1) × (dilation-1) = (K-1) × dilation + 1
    """
    effective_K = (kernel_size - 1) * dilation + 1
    return math.floor((input_size + 2 * padding - effective_K) / stride) + 1

def effective_receptive_field(kernel_size: int, dilation: int) -> int:
    """计算空洞卷积的等效感受野"""
    return (kernel_size - 1) * dilation + 1

# ========== 空洞率对感受野的影响 ==========
print("=== 3×3 卷积不同空洞率的感受野 ===")
for r in [1, 2, 3, 4, 5]:
    eff = effective_receptive_field(3, r)
    print(f"dilation={r}: 有效核={eff}×{eff}, 参数量仍为 9")

print()
print("=== 级联空洞卷积的感受野增长 ===")
# 3 层 3×3 卷积，空洞率分别为 1, 2, 4
total_rf = 1
for i, r in enumerate([1, 2, 4]):
    K = 3
    total_rf += (K - 1) * r
    print(f"第 {i+1} 层 (K=3, d={r}): 累积感受野 = {total_rf}×{total_rf}")`,
                },
                {
                    lang: "python",
                    code: `import numpy as np

def dilated_conv2d(image: np.ndarray, kernel: np.ndarray,
                   dilation: int = 1) -> np.ndarray:
    """空洞卷积实现
    dilation: 空洞率 (1 = 标准卷积)
    """
    H, W = image.shape
    K = kernel.shape[0]
    effective_K = (K - 1) * dilation + 1
    out_H = H - effective_K + 1
    out_W = W - effective_K + 1
    output = np.zeros((out_H, out_W))

    for i in range(out_H):
        for j in range(out_W):
            # 按空洞率采样输入区域
            region = image[i:i+effective_K:dilation,
                           j:j+effective_K:dilation]
            output[i, j] = np.sum(region * kernel)

    return output

# ========== 可视化空洞采样 ==========
img = np.arange(49).reshape(7, 7).astype(float)
kernel = np.ones((3, 3))

out_normal = dilated_conv2d(img, kernel, dilation=1)   # 5×5 输出
out_dilated = dilated_conv2d(img, kernel, dilation=2)  # 3×3 输出

print(f"输入: 7×7, 核: 3×3")
print(f"dilation=1: 输出 {out_normal.shape[0]}×{out_normal.shape[1]}")
print(f"dilation=2: 输出 {out_dilated.shape[0]}×{out_dilated.shape[1]}")`,
                },
            ],
            table: {
                headers: ["空洞率", "有效核大小", "参数量", "感受野", "计算量"],
                rows: [
                    ["1 (标准)", "3×3", "9", "3×3", "低"],
                    ["2", "5×5", "9", "5×5", "低"],
                    ["3", "7×7", "9", "7×7", "低"],
                    ["4", "9×9", "9", "9×9", "低"],
                    ["标准 7×7 对比", "7×7", "49", "7×7", "高 (5.4×)"],
                ],
            },
            mermaid: `graph TD
  A["标准卷积 3×3"] -->|"r=1, 感受野 3×3"| B["参数 9 个"]
  C["空洞卷积 3×3"] -->|"r=2, 感受野 5×5"| D["参数仍 9 个"]
  E["级联空洞卷积"] -->|"r=1,2,4 堆叠"| F["感受野 15×15"]
  F --> G["参数量仅 27 个"]`,
            tip: "空洞卷积在语义分割中是神器——不降低特征图分辨率就能扩大感受野。DeepLab 系列的 ASPP（空洞空间金字塔池化）用多个并行空洞率捕获多尺度上下文。",
            warning: "空洞率过大（如 r > 输入尺寸/3）时会出现网格效应，相邻输出像素的感受野完全不重叠。WaveNet 使用 r = 1, 2, 4, 8, ... 2^k 的指数增长策略，确保感受野连续覆盖。",
        },
        {
            title: "6. 分组卷积与深度可分离卷积",
            body: `分组卷积（Grouped Convolution）将输入通道和输出通道各分为 g 组，每组独立做卷积，最后拼接。标准卷积中每个输出通道都与所有输入通道做卷积（全连接式的通道混合），而分组卷积中每个输出通道只与 1/g 的输入通道交互，参数量和计算量都减少为原来的 1/g。

**分组数为 1**： 就是标准卷积。分组数等于输入通道数： 就是深度可分离卷积的第一步——深度卷积（Depthwise Convolution），每个通道独立用一个 K×K 卷积核处理。

深度可分离卷积（Depthwise Separable Convolution）： 将标准卷积分解为两步：① 深度卷积（DW）： 每个通道独立做空间卷积（分组数 = 通道数）；② 逐点卷积（PW）： 用 1×1 卷积做通道混合。参数量从 C_in × C_out × K² 降低为 C_in × K² + C_in × C_out。

**参数量对比**： 以 C_in=C_out=256、K=3 为例，标准卷积需要 256×256×9 = 589,824 个参数，深度可分离卷积只需要 256×9 + 256×256 = 2,304 + 65,536 = 67,840 个参数，仅为标准卷积的 11.5%。

**代表模型**： MobileNet 系列（移动端实时推理）、Xception（ImageNet 竞赛冠军）、EfficientNet（复合缩放策略）。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

def grouped_conv2d(image: np.ndarray, kernels: np.ndarray,
                   groups: int) -> np.ndarray:
    """分组卷积
    image: (C_in, H, W)
    kernels: (C_out, C_in/groups, K, K)
    groups: 分组数
    """
    C_in, H, W = image.shape
    C_out, _, K, _ = kernels.shape
    channels_per_group = C_in // groups
    outputs_per_group = C_out // groups
    out_H = H - K + 1
    out_W = W - K + 1
    output = np.zeros((C_out, out_H, out_W))

    for g in range(groups):
        # 第 g 组的输入通道
        start_c = g * channels_per_group
        end_c = start_c + channels_per_group
        group_input = image[start_c:end_c]  # (C/g, H, W)

        # 第 g 组的输出通道
        start_o = g * outputs_per_group
        end_o = start_o + outputs_per_group

        for c_out in range(outputs_per_group):
            for c_in in range(channels_per_group):
                for i in range(out_H):
                    for j in range(out_W):
                        region = group_input[c_in, i:i+K, j:j+K]
                        output[start_o + c_out, i, j] += \\
                            np.sum(region * kernels[start_o + c_out, c_in])

    return output`,
                },
                {
                    lang: "python",
                    code: `def compare_params(C_in: int, C_out: int, K: int) -> dict:
    """对比标准卷积与深度可分离卷积的参数量"""
    # 标准卷积
    std_params = C_in * C_out * K * K

    # 深度可分离卷积 = 深度卷积 + 逐点卷积
    dw_params = C_in * K * K  # 每个通道独立卷积
    pw_params = C_in * C_out  # 1x1 通道混合
    sep_params = dw_params + pw_params

    return {
        "标准卷积": std_params,
        "深度卷积 (DW)": dw_params,
        "逐点卷积 (PW)": pw_params,
        "深度可分离总计": sep_params,
        "节省比例": f"{(1 - sep_params/std_params)*100:.1f}%",
    }

# ========== 参数量对比 ==========
for C_in, C_out, K in [(32, 64, 3), (128, 128, 3), (256, 256, 3), (512, 512, 3)]:
    result = compare_params(C_in, C_out, K)
    print(f"C_in={C_in}, C_out={C_out}, K={K}:")
    for k, v in result.items():
        print(f"  {k}: {v:,}")
    print()`,
                },
            ],
            table: {
                headers: ["配置 (C_in=C_out, K=3)", "标准卷积参数", "深度可分离参数", "节省比例"],
                rows: [
                    ["32 通道", "9,216", "1,344", "85.4%"],
                    ["64 通道", "36,864", "5,504", "85.1%"],
                    ["128 通道", "147,456", "22,784", "84.5%"],
                    ["256 通道", "589,824", "67,840", "88.5%"],
                    ["512 通道", "2,359,296", "262,656", "88.9%"],
                ],
            },
            mermaid: `graph TD
  A["标准卷积"] -->|"C_in × C_out × K²"| B["参数量大"]
  C["深度可分离卷积"] -->|"深度卷积"| D["C_in × K²"]
  C -->|"逐点卷积 1×1"| E["C_in × C_out"]
  D --> F["拼接"]
  E --> F
  F --> G["参数量 = DW + PW"]`,
            tip: "移动端部署时优先使用深度可分离卷积。MobileNetV2 的倒残差结构（Inverted Residual）先扩展通道数（PW 升维），再做深度卷积（DW），最后压缩通道数（PW 降维），在精度和速度之间取得了极好的平衡。",
            warning: "深度可分离卷积的参数量虽然少，但 MACs（乘加运算量）不一定同比例减少——DW 阶段的计算量仍然与输入尺寸成正比。另外，在某些 GPU 上，分组卷积的硬件加速不如标准卷积高效。",
        },
        {
            title: "7. PyTorch 实战：Conv2d 参数详解",
            body: `PyTorch 的 torch.nn.Conv2d 是最常用的卷积层，理解其所有参数对于正确搭建 CNN 至关重要。

**核心参数**：
- in_channels：输入通道数（RGB 图像为 3，第一层卷积必须与此匹配）
- out_channels：输出通道数（即使用多少个卷积核）
- kernel_size：卷积核大小，整数（如 3 表示 3×3）或元组（如 (3, 5)）
- stride：步长，默认 1，增大则输出尺寸缩小
- padding：填充量，默认 0，可设为整数或元组
- dilation：空洞率，默认 1，增大则感受野扩大
- groups：分组数，默认 1，设为 in_channels 即为深度卷积
- bias：是否使用偏置，默认 True
- padding_mode：填充模式，'zeros'（默认）、'reflect'、'replicate'、'circular'

**输出尺寸公式**：
H_out = ⌊(H_in + 2×padding[0] - dilation[0]×(kernel_size[0]-1) - 1) / stride[0]⌋ + 1
W_out = ⌊(W_in + 2×padding[1] - dilation[1]×(kernel_size[1]-1) - 1) / stride[1]⌋ + 1

**权重初始化**： PyTorch 默认使用 Kaiming 均匀初始化（针对 ReLU 优化）。手动修改权重时需要小心，不恰当的初始化会导致梯度消失或爆炸。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

# ========== Conv2d 参数全演示 ==========

# 1. 基础用法：标准卷积
conv_basic = nn.Conv2d(
    in_channels=3,      # RGB 输入
    out_channels=64,    # 64 个卷积核
    kernel_size=3,      # 3x3 卷积核
    stride=1,           # 步长 1
    padding=1,          # 填充 1（same padding）
    bias=True           # 使用偏置
)
print(f"标准卷积参数量: {conv_basic.weight.numel() + conv_basic.bias.numel():,}")
# 3 × 64 × 9 + 64 = 1,792

# 2. Same 填充（保持尺寸）
x = torch.randn(2, 3, 32, 32)  # batch=2, channels=3, 32x32
out = conv_basic(x)
print(f"输入: {x.shape} → 输出: {out.shape}")  # [2, 64, 32, 32]

# 3. 下采样（stride=2）
conv_downsample = nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1)
out2 = conv_downsample(out)
print(f"下采样: {out.shape} → {out2.shape}")  # [2, 128, 16, 16]

# 4. 空洞卷积
conv_dilated = nn.Conv2d(128, 128, kernel_size=3, padding=2, dilation=2)
out3 = conv_dilated(out2)
print(f"空洞卷积: {out2.shape} → {out3.shape}")  # [2, 128, 16, 16]

# 5. 深度可分离卷积
depthwise = nn.Conv2d(128, 128, kernel_size=3, padding=1, groups=128)
pointwise = nn.Conv2d(128, 256, kernel_size=1)
out4 = pointwise(depthwise(out3))
print(f"深度可分离: {out3.shape} → {out4.shape}")  # [2, 256, 16, 16]`,
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

# ========== 完整 CNN 示例（类似 VGG 风格）==========
class SimpleCNN(nn.Module):
    """小型 CNN 分类器"""
    def __init__(self, num_classes: int = 10):
        super().__init__()
        self.features = nn.Sequential(
            # Block 1: 32x32 → 32x32
            nn.Conv2d(3, 32, kernel_size=3, padding=1),   # 参数量: 896
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),  # 32x32 → 16x16

            # Block 2: 16x16 → 16x16
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),  # 16x16 → 8x8

            # Block 3: 8x8 → 8x8
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),  # 8x8 → 4x4
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 4 * 4, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.classifier(x)
        return x

# 验证网络
model = SimpleCNN(num_classes=10)
x = torch.randn(4, 3, 32, 32)
out = model(x)
print(f"输入: {x.shape} → 输出: {out.shape}")  # [4, 10]
print(f"总参数量: {sum(p.numel() for p in model.parameters()):,}")`,
                },
            ],
            table: {
                headers: ["参数", "默认值", "说明", "常用取值"],
                rows: [
                    ["in_channels", "必填", "输入通道数", "3(RGB), 64, 128, ..."],
                    ["out_channels", "必填", "输出通道数（核数量）", "32, 64, 128, 256, ..."],
                    ["kernel_size", "必填", "卷积核大小", "3 (最常用), 5, 7"],
                    ["stride", "1", "步长", "1 (不变), 2 (下采样)"],
                    ["padding", "0", "填充量", "0(valid), 1(same, k=3), 2(same, k=5)"],
                    ["dilation", "1", "空洞率", "1(标准), 2, 4, ..."],
                    ["groups", "1", "分组数", "1(标准), =in_channels(深度卷积)"],
                    ["bias", "True", "偏置", "True, False(BN 前可省)"],
                    ["padding_mode", "'zeros'", "填充模式", "'zeros', 'reflect', 'replicate'"],
                ],
            },
            mermaid: `graph TD
  A["输入 3×32×32"] -->|"Conv(3→32, k=3, p=1)"| B["32×32×32"]
  B -->|"ReLU + BN"| C["32×32×32"]
  C -->|"MaxPool(2)"| D["32×16×16"]
  D -->|"Conv(32→64)"| E["64×16×16"]
  E -->|"ReLU + BN"| F["64×16×16"]
  F -->|"MaxPool(2)"| G["64×8×8"]
  G -->|"Conv(64→128)"| H["128×8×8"]
  H -->|"ReLU + BN"| I["128×8×8"]
  I -->|"MaxPool(2)"| J["128×4×4"]
  J -->|"Flatten"| K["2048"]
  K -->|"Linear(2048→256)"| L["256"]
  L -->|"Linear(256→10)"| M["10 类 logits"]`,
            tip: "搭建 CNN 的黄金法则：① 用 Conv2d + BN + ReLU 作为基本单元 ② 用 stride=2 或 MaxPool 做下采样 ③ 通道数逐层翻倍（32→64→128→256）④ 全连接层前必须 Flatten ⑤ 卷积核统一用 3×3 + padding=1",
            warning: "常见坑：1) 输入通道数不匹配会报 RuntimeError 2) padding 设为 0 时输出尺寸会缩小，多层后可能变成负数 3) groups 必须能整除 in_channels 和 out_channels 4) 加了 BatchNorm 后 Conv2d 的 bias 可以设为 False（BN 会抵消偏置效果）",
        },
    ],
};
