import { Article } from '../knowledge';

export const article: Article = {
    id: "math-007",
    title: "数值计算与稳定性",
    category: "math",
    tags: ["数值计算", "稳定性", "梯度爆炸"],
    summary: "从浮点精度到梯度裁剪，理解深度学习中的数值稳定性问题",
    date: "2026-04-12",
    readTime: "16 min",
    level: "进阶",
    content: [
      {
        title: "1. 浮点数表示与精度",
        body: `深度学习中的所有数值计算都建立在浮点数之上。IEEE 754 标准定义了浮点数的二进制表示方式：符号位、指数位和尾数位。单精度（FP32）使用 32 位，其中 1 位符号、8 位指数、23 位尾数，能表示约 7 位十进制有效数字。双精度（FP64）使用 64 位，提供约 16 位有效数字。

精度问题在深度学习中无处不在。当两个相近的大数相减时会发生灾难性抵消（Catastrophic Cancellation），导致有效数字大量丢失。例如计算 (1 + 1e-8) - 1 在 FP32 中可能得到零，因为 1e-8 超出了 FP32 在 1 附近的精度范围。神经网络中的梯度计算、权重更新、归一化操作都可能遇到类似问题。

理解浮点数的机器精度（machine epsilon）至关重要。FP32 的机器精度约为 1.19e-7，这意味着任何小于这个量级的变化在与大数相加时都会被舍入掉。在设计数值稳定的算法时，我们必须始终考虑运算顺序，避免大数吃小数的问题。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# 演示机器精度
eps_32 = np.finfo(np.float32).eps
eps_64 = np.finfo(np.float64).eps
print(f"FP32 机器精度: {eps_32}")  # 约 1.19e-7
print(f"FP64 机器精度: {eps_64}")  # 约 2.22e-16

# 灾难性抵消演示
a = np.float32(1e8)
b = np.float32(1e8 + 1)
print(f"(1e8+1) - 1e8 = {b - a}")  # 可能为 0！`
          },
          {
            lang: "python",
            code: `# 浮点数表示范围
info_32 = np.finfo(np.float32)
print(f"FP32 最大值: {info_32.max:.2e}")   # 约 3.4e+38
print(f"FP32 最小正值: {info_32.tiny:.2e}")  # 约 1.18e-38
print(f"FP32 最小正规数: {info_32.smallest_normal:.2e}")

# 大数吃小数问题
x = np.float32(1e8)
y = np.float32(1.0)
print(f"1e8 + 1.0 = {x + y}")  # 结果等于 1e8`
          }
        ],
        table: {
          headers: ["精度类型", "位数", "指数位", "尾数位", "有效数字", "范围"],
          rows: [
            ["FP16", "16", "5", "10", "~3位", "6.1e-5 ~ 6.5e+4"],
            ["BF16", "16", "8", "7", "~2位", "1.2e-38 ~ 3.4e+38"],
            ["FP32", "32", "8", "23", "~7位", "1.2e-38 ~ 3.4e+38"],
            ["FP64", "64", "11", "52", "~16位", "2.2e-308 ~ 1.8e+308"],
          ]
        },
        mermaid: `graph TD
    A["输入数据"] --> B["FP32 表示"]
    B --> C["运算中舍入误差累积"]
    C --> D["梯度计算"]
    D --> E["参数更新"]
    E --> F["精度损失影响收敛"]
    B --> G["关键操作用 FP64"]
    C --> H["Kahan 求和补偿"]`,
        tip: "在关键数值计算中使用 FP64 或 Kahan 求和算法可以显著减少累积误差",
        warning: "不要假设浮点数运算满足结合律：(a + b) + c 不等于 a + (b + c)"
      },
      {
        title: "2. 上溢与下溢",
        body: `上溢（Overflow）发生在数值超出浮点数可表示的最大范围时，结果为无穷大（Inf）。下溢（Underflow）发生在数值过小，接近或低于最小可表示的正数时，结果被刷新为零（或次正规数）。这两种现象在深度学习中极其常见且极具破坏性。

指数函数是上溢和下溢的重灾区。计算 exp(x) 时，当 x > 88.7（FP32）就会上溢为 Inf，当 x < -87.3 就会下溢为 0。这在 Softmax、交叉熵损失、注意力机制等核心操作中频繁出现。一个未处理的上溢会导致整个训练过程崩溃，梯度变成 NaN 并传播到所有参数。

下溢同样危险。当概率值下溢为 0 时，对数运算 log(0) 会产生负无穷，进而导致损失函数为 NaN。在语言模型中，长序列的联合概率是许多小于 1 的概率相乘，极易下溢。解决方案是在对数空间中计算：将乘法变为加法，将 exp 和 log 配对使用。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# 上溢演示
x = np.float32(100.0)
print(f"exp(100) = {np.exp(x)}")  # inf!

# 下溢演示
x = np.float32(-100.0)
print(f"exp(-100) = {np.exp(x)}")  # 0!

# 对数下溢
p = np.exp(np.float32(-100.0))
print(f"log(exp(-100)) = {np.log(p)}")  # -inf!`
          },
          {
            lang: "python",
            code: `# 安全的指数计算（上溢保护）
def safe_exp(x, dtype=np.float32):
    info = np.finfo(dtype)
    x = np.clip(x, a_min=None, a_max=info.max * 0.9)
    x = np.clip(x, a_min=info.min * 0.9, a_max=None)
    return np.exp(x)

# 安全的对数计算（下溢保护）
def safe_log(x, eps=1e-7):
    return np.log(np.clip(x, eps, None))

# 测试
print(f"safe_exp(100) = {safe_exp(100.0)}")
print(f"safe_log(0) = {safe_log(0.0)}")`
          }
        ],
        table: {
          headers: ["现象", "原因", "后果", "典型场景", "防御策略"],
          rows: [
            ["上溢", "数值过大", "Inf → NaN", "exp(大数), softmax"],
            ["下溢", "数值过小", "0 → log(-inf)", "长序列概率连乘"],
            ["梯度爆炸", "上溢传播", "参数变为 NaN", "深层网络, 大学习率"],
            ["梯度消失", "下溢传播", "参数不更新", "sigmoid, tanh 深层"],
          ]
        },
        mermaid: `graph LR
    A["输入 x"] --> B{"x > 88.7?"}
    B -->|是| C["上溢 → Inf"]
    B -->|否| D{"x < -87.3?"}
    D -->|是| E["下溢 → 0"]
    D -->|否| F["正常计算"]
    C --> G["NaN 传播"]
    E --> H["log(0) = -inf"]`,
        tip: "在对数空间中计算概率乘积，用 log-sum-exp 技巧处理 Softmax",
        warning: "FP32 中 exp(x) 在 x > 88.7 时必然上溢，这是硬限制而非实现问题"
      },
      {
        title: "3. Softmax 的数值稳定实现",
        body: `Softmax 函数将实数向量转换为概率分布，公式为 softmax(x_i) = exp(x_i) / sum(exp(x_j))。这是分类模型输出层的标准选择，也是注意力机制的核心组件。然而，直接按公式实现会遇到严重的数值稳定性问题。

当输入向量中存在较大的正值时，exp 会立即上溢。例如 x = [1000, 2000, 3000] 中，exp(3000) 远超 FP32 的表示范围。解决方案基于 Softmax 的平移不变性：softmax(x) = softmax(x - c)，其中 c 是任意常数。选择 c = max(x)，就能确保所有 exp 的指数都不超过 0，彻底消除上溢风险。

平移后的 Softmax 中，最大值对应的 exp 为 exp(0) = 1，其余值都是 exp(负数)，全部落在 (0, 1] 区间内。分母的求和也完全安全，因为所有项都是有限的正数。这种技巧被所有主流深度学习框架采用，是数值稳定性的经典案例。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# 不稳定的 Softmax 实现
def unstable_softmax(x):
    e = np.exp(x)
    return e / np.sum(e)

# 数值稳定的 Softmax 实现
def stable_softmax(x):
    shifted = x - np.max(x)  # 关键技巧
    e = np.exp(shifted)
    return e / np.sum(e)

# 测试
x = np.array([1000, 2000, 3000], dtype=np.float64)
# print(unstable_softmax(x))  # 崩溃！
print(stable_softmax(x))  # [2.06e-435, ..., 1.0] 近似 [0, 0, 1]`
          },
          {
            lang: "python",
            code: `# 批量矩阵的数值稳定 Softmax（沿最后一维）
def batch_stable_softmax(logits):
    """logits shape: (batch, seq_len, vocab_size)"""
    max_vals = np.max(logits, axis=-1, keepdims=True)
    shifted = logits - max_vals
    exp_vals = np.exp(shifted)
    sum_vals = np.sum(exp_vals, axis=-1, keepdims=True)
    return exp_vals / (sum_vals + 1e-8)

# 模拟 Transformer 注意力中的 Softmax
batch_size, seq_len, vocab_size = 2, 128, 10000
logits = np.random.randn(batch_size, seq_len, vocab_size) * 5
probs = batch_stable_softmax(logits)
print(f"概率和: {np.sum(probs, axis=-1)[0, 0]:.6f}")  # 应为 1.0`
          }
        ],
        table: {
          headers: ["实现方式", "上溢风险", "下溢风险", "适用场景", "复杂度"],
          rows: [
            ["直接计算", "高", "中", "仅限小数值输入", "O(n)"],
            ["减去最大值", "无", "低", "通用", "O(n)"],
            ["带温度系数", "依赖 T", "依赖 T", "知识蒸馏", "O(n)"],
            ["带 mask", "无", "低", "注意力机制", "O(n)"],
          ]
        },
        mermaid: `graph TD
    A["原始 logits"] --> B["减去最大值"]
    B --> C["exp 计算"]
    C --> D["求和归一化"]
    D --> E["概率分布"]
    A -.不稳定.-> F["直接 exp → 上溢"]
    B -.关键技巧.-> G["所有指数 ≤ 0"]`,
        tip: "在 Transformer 中，attention 的 Softmax 前必须加上 attention mask 的负无穷值",
        warning: "减去最大值只能防止上溢，极小的概率值仍会下溢为 0，在长序列中需额外注意"
      },
      {
        title: "4. Log-Sum-Exp 技巧",
        body: `Log-Sum-Exp（LSE）是机器学习中最重要的数值稳定技巧之一。它的核心任务是安全地计算 log(sum(exp(x_i)))。这个操作看似简单，但直接计算会同时面临上溢和下溢的双重威胁：exp 可能上溢，而极小的 exp 值相加后再取对数可能因精度损失而不准确。

LSE 技巧与 Softmax 使用同样的平移思想：log(sum(exp(x_i))) = c + log(sum(exp(x_i - c)))。取 c = max(x)，则所有 exp(x_i - c) 都不超过 1，上溢被彻底消除。最小值对应的项即使下溢为 0 也不影响结果的准确性，因为该项本身在总和中的贡献就可以忽略。

这个技巧广泛应用于计算交叉熵损失、归一化流模型、条件随机场和能量模型。PyTorch 的 torch.logsumexp 和 SciPy 的 scipy.special.logsumexp 都内置了这种数值稳定实现。理解 LSE 的推导过程，有助于你在遇到新的数值计算挑战时，自主构造稳定算法。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from scipy.special import logsumexp

# 不稳定的 LSE
def unstable_lse(x):
    return np.log(np.sum(np.exp(x)))

# 数值稳定的 LSE
def stable_lse(x):
    c = np.max(x)
    return c + np.log(np.sum(np.exp(x - c)))

# 测试
x = np.array([1000, 200, 300], dtype=np.float64)
# unstable_lse(x)  → 上溢崩溃
print(f"stable LSE: {stable_lse(x):.4f}")
print(f"scipy LSE:  {logsumexp(x):.4f}")`
          },
          {
            lang: "python",
            code: `# 用 LSE 计算数值稳定的交叉熵损失
def stable_cross_entropy(logits, target_idx):
    """
    交叉熵 = -log(softmax(x)[target])
           = log(sum(exp(x))) - x[target]
           = LSE(x) - x[target]
    """
    lse = logsumexp(logits)
    return lse - logits[target_idx]

# 测试
logits = np.array([2.0, 1.0, 0.1])
target = 0
loss = stable_cross_entropy(logits, target)
print(f"交叉熵损失: {loss:.4f}")

# 对比：直接用 softmax 再取 log 可能因下溢而不准确
softmax_probs = np.exp(logits - np.max(logits))
softmax_probs /= np.sum(softmax_probs)
naive_loss = -np.log(softmax_probs[target])
print(f"naive 损失: {naive_loss:.4f}")`
          }
        ],
        table: {
          headers: ["操作", "直接计算", "稳定计算", "误差来源", "应用场景"],
          rows: [
            ["softmax", "exp(x_i)/sum", "减 max 后计算", "上溢", "分类输出层"],
            ["log softmax", "log(softmax)", "x_i - LSE(x)", "上溢+下溢", "交叉熵"],
            ["LSE", "log(sum(exp))", "c + log(sum(exp-c))", "上溢", "概率归一化"],
            ["log 概率相加", "sum(log p_i)", "log(sum(exp)) 替代", "下溢", "语言模型"],
          ]
        },
        mermaid: `graph TD
    A["输入向量 x"] --> B["c = max(x)"]
    B --> C["计算 exp(x_i - c)"]
    C --> D["sum + log"]
    D --> E["+ c 还原"]
    E --> F["log-sum-exp 结果"]
    F --> G["交叉熵: LSE - x[target]"]`,
        tip: "计算交叉熵损失时，永远使用 log-softmax 路径而不是 softmax-then-log",
        warning: "LSE 中的减法 c + log(sum(exp(x-c))) 在 c 极大时可能损失精度，极端情况需要特殊处理"
      },
      {
        title: "5. 梯度消失与爆炸的数值根源",
        body: `梯度消失和梯度爆炸是训练深度神经网络时最经典的数值问题。它们的根源可以追溯到链式法则中的连乘操作。在 L 层网络的反向传播中，梯度是 L 个雅可比矩阵的乘积。如果每个矩阵的谱范数大于 1，梯度会指数级增长（爆炸）；如果谱范数小于 1，梯度会指数级衰减到 0（消失）。

Sigmoid 和 Tanh 激活函数是梯度消失的主要推手。Sigmoid 的导数最大值为 0.25，Tanh 为 1.0。在深层网络中，经过数十次连乘后，梯度可以缩小到 FP32 的下溢阈值以下。这就是为什么 2010 年之前的神经网络很难超过 5 层的原因之一。ReLU 的引入部分缓解了这个问题，因为它的导数在正区间恒为 1。

梯度爆炸在 RNN 中尤为严重，因为同一家权重矩阵在时间步之间反复相乘。LSTM 的门控机制通过引入恒等连接（identity connection），构建了梯度的高速公路，使得梯度可以直接跨时间步传播而不经过矩阵乘法，这是 LSTM 能够学习长期依赖的关键。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# 演示梯度消失：sigmoid 的连乘效应
def sigmoid_grad(x):
    s = 1 / (1 + np.exp(-x))
    return s * (1 - s)

# 模拟 20 层网络的梯度传播
initial_grad = np.float64(1.0)
for layer in range(20):
    initial_grad *= sigmoid_grad(0.0)  # 最大值 0.25
    print(f"Layer {layer+1}: grad = {initial_grad:.2e}")

# 20 层后: ~0.25^20 ≈ 9e-13，接近下溢阈值`
          },
          {
            lang: "python",
            code: `# 梯度裁剪（Gradient Clipping）
def clip_gradient_norm(grads, max_norm=1.0):
    """按全局范数裁剪梯度"""
    total_norm = np.sqrt(sum(np.sum(g ** 2) for g in grads))
    clip_coef = max_norm / (total_norm + 1e-6)
    if clip_coef < 1.0:
        return [g * clip_coef for g in grads]
    return grads

# 模拟梯度爆炸场景
explosive_grads = [np.random.randn(100) * 50 for _ in range(5)]
original_norm = np.sqrt(sum(np.sum(g ** 2) for g in explosive_grads))
clipped = clip_gradient_norm(explosive_grads, max_norm=5.0)
clipped_norm = np.sqrt(sum(np.sum(g ** 2) for g in clipped))
print(f"原始范数: {original_norm:.1f}, 裁剪后: {clipped_norm:.1f}")`
          }
        ],
        table: {
          headers: ["激活函数", "导数范围", "梯度问题", "层数限制", "解决方案"],
          rows: [
            ["Sigmoid", "(0, 0.25]", "严重消失", "~5层", "避免使用"],
            ["Tanh", "(0, 1.0]", "中度消失", "~10层", "Xavier 初始化"],
            ["ReLU", "{0, 1}", "不消失但可能死亡", "无限制", "He 初始化"],
            ["Leaky ReLU", "{0.01, 1}", "轻微消失", "无限制", "推荐默认"],
          ]
        },
        mermaid: `graph LR
    A["深层网络"] --> B["链式法则连乘"]
    B --> C{"谱范数 > 1?"}
    C -->|是| D["梯度爆炸 → NaN"]
    C -->|否| E["梯度消失 → 0"]
    D --> F["梯度裁剪"]
    E --> G["ReLU + 残差连接"]`,
        tip: "使用残差连接（ResNet）让梯度拥有直接回传路径，从根本上缓解消失问题",
        warning: "梯度裁剪不能解决梯度消失，只能防止爆炸。消失问题需要从架构层面解决"
      },
      {
        title: "6. 混合精度训练（FP16/BF16）",
        body: `混合精度训练是现代深度学习加速的核心技术之一。它的基本思路是：在前向传播和反向传播中使用半精度浮点数（FP16 或 BF16），在权重更新和优化器状态中保持 FP32 精度。这样既能享受半精度带来的 2-3 倍加速和减半显存占用，又能保证模型的数值稳定性和收敛质量。

FP16 和 BF16 各有特点。FP16（半精度）保留 10 位尾数，精度较高但动态范围小（6.1e-5 ~ 6.5e+4），容易发生上溢。BF16（Brain Float 16）仅保留 7 位尾数但拥有 8 位指数，动态范围与 FP32 相同，因此几乎不存在上溢风险。这就是为什么现代框架（如 PyTorch 2.0+）更倾向于推荐 BF16。

混合精度训练需要 Loss Scaling 技术来防止 FP16 梯度的下溢。具体做法是在反向传播前将损失乘以一个放大系数（如 1024），使 FP16 梯度保持在可表示范围内，然后在更新权重前将梯度缩小回去。动态 Loss Scaling 会在训练过程中自动调整缩放系数，当检测到 Inf/NaN 时自动降低，否则逐步增大。`,
        code: [
          {
            lang: "python",
            code: `import torch

# PyTorch 原生 AMP（自动混合精度）
scaler = torch.cuda.amp.GradScaler()

for inputs, targets in dataloader:
    with torch.cuda.amp.autocast():
        outputs = model(inputs)
        loss = criterion(outputs, targets)

    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()

# BF16 训练（推荐 Ampere+ GPU）
with torch.autocast(device_type='cuda', dtype=torch.bfloat16):
    outputs = model(inputs)
    loss = criterion(outputs, targets)`
          },
          {
            lang: "python",
            code: `# 手动 Loss Scaling 实现
class ManualLossScaler:
    def __init__(self, init_scale=2**16, growth_factor=2.0, backoff_factor=0.5):
        self.scale = init_scale
        self.growth_factor = growth_factor
        self.backoff_factor = backoff_factor
        self.good_steps = 0

    def step(self, found_inf):
        if found_inf:
            self.scale *= self.backoff_factor
            self.good_steps = 0
        else:
            self.good_steps += 1
            if self.good_steps >= 2000:
                self.scale *= self.growth_factor
                self.good_steps = 0

    def unscale_grads(self, grads):
        return [g / self.scale for g in grads]

scaler = ManualLossScaler()
print(f"当前缩放系数: {scaler.scale}")`
          }
        ],
        table: {
          headers: ["精度类型", "指数位", "尾数位", "最大正值", "适用场景"],
          rows: [
            ["FP32", "8", "23", "3.4e+38", "优化器状态, 权重备份"],
            ["FP16", "5", "10", "6.5e+4", "前向/反向, 需 Loss Scaling"],
            ["BF16", "8", "7", "3.4e+38", "前向/反向, 推荐首选"],
            ["FP8", "5", "2~3", "5.7e+4", "推理, 前沿实验"],
          ]
        },
        mermaid: `graph TD
    A["FP32 权重"] --> B["Cast to FP16"]
    B --> C["FP16 前向传播"]
    C --> D["Loss × scale"]
    D --> E["FP16 反向传播"]
    E --> F["Unscale 梯度"]
    F --> G["FP32 优化器更新"]
    G --> A`,
        tip: "在 Ampere 及更新架构的 GPU 上优先使用 BF16，它比 FP16 稳定得多",
        warning: "FP16 的动态范围过小，不做 Loss Scaling 时梯度极易下溢为 0"
      },
      {
        title: "7. PyTorch 数值稳定性最佳实践",
        body: `将前面的所有数值稳定技巧整合到 PyTorch 实践中，形成一套可操作的规范。PyTorch 框架本身已经内置了大部分数值稳定实现，但正确理解和使用它们仍然需要开发者具备扎实的基础知识。

首先，优先使用框架内置的稳定函数。torch.logsumexp、torch.nn.functional.log_softmax、torch.nn.functional.cross_entropy（内部自动使用 log-softmax 路径）都经过高度优化。其次，合理使用 torch.set_printoptions 和 torch.autograd.detect_anomaly() 来调试数值问题。当训练中出现 NaN 时，detect_anomaly 会精确追踪到出问题的操作。

第三，选择正确的初始化方法。Xavier 初始化适用于 Sigmoid/Tanh，He 初始化适用于 ReLU 系列。不当的初始化会在训练初期就引入数值不稳定。第四，使用梯度裁剪（torch.nn.utils.clip_grad_norm_）作为梯度爆炸的安全网。第五，对于极端数值敏感的场景，可以局部使用 torch.double（FP64）来提高精度。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

# 数值稳定性调试工具
def train_with_debug(model, loader, optimizer):
    torch.autograd.set_detect_anomaly(True)  # 追踪 NaN 来源

    for batch in loader:
        optimizer.zero_grad()
        out = model(batch)
        loss = nn.functional.cross_entropy(out, targets)

        # 检查损失
        if torch.isnan(loss):
            print("NaN 检测!")
            break

        loss.backward()

        # 梯度裁剪
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

        # 检查梯度
        for name, param in model.named_parameters():
            if param.grad is not None and torch.isnan(param.grad).any():
                print(f"NaN 梯度: {name}")`
          },
          {
            lang: "python",
            code: `# 数值稳定初始化 + 训练模板
def init_weights(m):
    if isinstance(m, nn.Linear):
        nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
        if m.bias is not None:
            nn.init.zeros_(m.bias)
    elif isinstance(m, nn.LayerNorm):
        nn.init.ones_(m.weight)
        nn.init.zeros_(m.bias)

model.apply(init_weights)

# 稳定性 checklist
print("数值稳定性检查:")
print("1. 使用 log_softmax + NLLLoss 代替 softmax + MSELoss")
print("2. 设置合适的学习率 + warmup")
print("3. 启用 AMP 混合精度")
print("4. 添加梯度裁剪")
print("5. 使用 LayerNorm 而不是 BatchNorm（Transformer）")
print("6. 监控 loss 和梯度范数")`
          }
        ],
        table: {
          headers: ["检查项", "推荐做法", "避免做法", "PyTorch 工具"],
          rows: [
            ["初始化", "Xavier / He", "随机正态 N(0,1)", "nn.init.kaiming_normal_"],
            ["激活函数", "ReLU / GELU", "Sigmoid / Tanh", "nn.GELU()"],
            ["损失函数", "CrossEntropyLoss", "MSE for classification", "F.cross_entropy"],
            ["归一化", "LayerNorm", "BatchNorm (不稳定)", "nn.LayerNorm"],
            ["精度", "AMP (BF16)", "纯 FP16", "torch.autocast"],
            ["梯度保护", "clip_grad_norm_", "无裁剪", "nn.utils.clip_grad_norm_"],
          ]
        },
        mermaid: `graph TD
    A["训练开始"] --> B["正确初始化"]
    B --> C["AMP 混合精度"]
    C --> D["前向 + 稳定损失"]
    D --> E["反向传播"]
    E --> F{"NaN 检测"}
    F -->|是| G["定位问题操作"]
    F -->|否| H["梯度裁剪"]
    H --> I["优化器更新"]
    I --> J["监控指标"]
    J --> C`,
        tip: "在关键路径上使用 torch.autograd.detect_anomaly(True) 可以快速定位 NaN 的精确来源",
        warning: "set_detect_anomaly 会显著降低训练速度，仅用于调试，不要在正常训练时开启"
      },
    ],
};
