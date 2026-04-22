import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-019",
    title: "神经网络基础：前向传播、反向传播与激活函数",
    category: "dl",
    tags: ["神经网络", "反向传播", "激活函数", "梯度下降", "深度学习基础"],
    summary: "深度学习的基石。从感知机到多层神经网络，详解前向传播、反向传播的数学推导，常见激活函数对比（Sigmoid/ReLU/GELU/SiLU），以及从零用 NumPy 实现一个神经网络。",
    date: "2026-04-22",
    readTime: "22 min",
    level: "入门",
    content: [
      {
        title: "1. 从感知机到多层神经网络",
        body: `感知机（Perceptron）是人工神经网络的最小单元，由 Frank Rosenblatt 在 1958 年提出。它的灵感来源于生物神经元：接收多个输入信号，加权求和后通过一个激活函数，输出一个信号。

感知机的数学表达极其简洁：给定输入向量 x = [x₁, x₂, ..., xₙ]，权重向量 w = [w₁, w₂, ..., wₙ] 和偏置 b，感知机的输出为：y = f(w·x + b) = f(Σᵢ wᵢxᵢ + b)，其中 f 是激活函数。在原始感知机中，f 是阶跃函数（step function）：当输入 ≥ 0 时输出 1，否则输出 0。

单个感知机只能解决线性可分问题。Minsky 和 Papert 在 1969 年的著作《Perceptrons》中严格证明了这一点，并指出感知机无法解决 XOR（异或）问题——这个简单的反例直接导致了第一次"AI 冬天"。

突破来自于多层感知机（Multi-Layer Perceptron, MLP）：将多个感知机层叠起来，中间加入隐藏层。一个包含至少一个隐藏层和一个非线性激活函数的 MLP 就是一个通用函数逼近器（Universal Function Approximator, Cybenko 1989, Hornik 1991）：它可以以任意精度逼近任何连续函数。这就是深度学习的理论基础——只要网络足够宽（或足够深），它可以学习任意复杂的映射关系。

深度学习的"深度"指的是网络的层数。浅层网络可能只需要几十到几百个神经元就能近似简单函数，但深层网络可以用更少的总参数量表达同样复杂的函数。这种"深度"带来的效率优势，正是深度学习在近十年取得突破性进展的核心原因。`,
        mermaid: `graph TD
    A["感知机 (1958)"] --> B["多层感知机 MLP"]
    B --> C["反向传播算法 (1986)"]
    C --> D["卷积神经网络 CNN"]
    C --> E["循环神经网络 RNN"]
    D --> F["AlexNet (2012)"]
    F --> G["VGG / ResNet"]
    E --> H["LSTM / GRU"]
    H --> I["注意力机制"]
    I --> J["Transformer (2017)"]
    G --> K["深度学习繁荣"]
    J --> K

    classDef era fill:#0c4a6e
    class A,B,C,D,E,H,I,J era
    classDef milestone fill:#ff9800,color:#fff
    class F,G,K milestone`,
      },
      {
        title: "2. 前向传播：信息如何流经网络",
        body: `前向传播（Forward Propagation）是神经网络处理数据的基本方式：输入数据从输入层进入，逐层经过线性变换和非线性激活，最终到达输出层产生预测结果。

考虑一个三层全连接网络：输入层有 n 个神经元，隐藏层有 m 个神经元，输出层有 k 个神经元。前向传播的过程可以用矩阵运算精确描述。

第一层（隐藏层）的计算：首先进行线性变换 z¹ = W¹x + b¹，其中 W¹ 是 m×n 的权重矩阵，b¹ 是 m 维偏置向量，x 是 n 维输入向量。然后应用激活函数：a¹ = σ(z¹)，这里的 σ 是逐元素（element-wise）应用的。

第二层（输出层）的计算：z² = W²a¹ + b²，其中 W² 是 k×m 的权重矩阵。输出层的激活函数取决于任务类型：回归任务通常不用激活函数（或使用线性激活），二分类用 Sigmoid，多分类用 Softmax。

矩阵运算的优势在于现代硬件（GPU、TPU）对矩阵乘法进行了高度优化。一次包含数千个样本的批量前向传播，可以完全通过几次大矩阵乘法完成，这比逐个样本处理快了数百倍。这也是为什么深度学习在 GPU 时代才真正爆发的原因之一。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

# ===== 前向传播的 NumPy 实现 =====

def relu(z):
    """ReLU 激活函数"""
    return np.maximum(0, z)

def softmax(z):
    """Softmax 激活函数（数值稳定版本）"""
    exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))
    return exp_z / np.sum(exp_z, axis=1, keepdims=True)

class SimpleMLP:
    """两层全连接神经网络"""
    def __init__(self, input_size, hidden_size, output_size):
        # Xavier 初始化
        self.W1 = np.random.randn(input_size, hidden_size) * np.sqrt(2.0 / input_size)
        self.b1 = np.zeros((1, hidden_size))
        self.W2 = np.random.randn(hidden_size, output_size) * np.sqrt(2.0 / hidden_size)
        self.b2 = np.zeros((1, output_size))
    
    def forward(self, X):
        """前向传播"""
        self.X = X
        self.z1 = X @ self.W1 + self.b1
        self.a1 = relu(self.z1)
        self.z2 = self.a1 @ self.W2 + self.b2
        self.a2 = softmax(self.z2)
        return self.a2
    
    def predict(self, X):
        """预测类别"""
        probs = self.forward(X)
        return np.argmax(probs, axis=1)

# 测试
np.random.seed(42)
X = np.random.randn(32, 4)  # batch_size=32, input_dim=4
net = SimpleMLP(input_size=4, hidden_size=16, output_size=3)
output = net.forward(X)
print(f"输出形状: {output.shape}")
print(f"前 5 个样本的预测类别: {net.predict(X[:5])}")
print(f"样本 0 各类别概率: {output[0]} (sum={output[0].sum():.4f})")`,
          },
        ],
      },
      {
        title: "3. 反向传播：神经网络如何学习",
        body: `反向传播（Backpropagation）是训练神经网络的核心算法。它的本质是链式法则（Chain Rule）在计算图上的系统化应用：计算损失函数对每个参数的梯度，然后用这些梯度更新参数。

反向传播分为两个阶段。第一阶段是前向传播：从输入到输出计算每一层的激活值，并缓存中间结果（z 和 a），这些会在反向传播时用到。第二阶段是反向传播：从输出层开始，逐层反向计算梯度。

让我们推导一个两层网络的梯度计算。设损失函数为交叉熵 L，网络输出为 a² = softmax(z²)。输出层的梯度计算为：∂L/∂z² = a² - y（这里 y 是 one-hot 编码的真实标签）。这个简洁的结果是交叉熵损失和 Softmax 激活配合的"福利"——它们的导数恰好抵消，得到极其简单的梯度形式。

有了 ∂L/∂z² 后，我们可以计算输出层参数的梯度：∂L/∂W² = (a¹)ᵀ · ∂L/∂z²，∂L/∂b² = Σ ∂L/∂z²（对 batch 维度求和）。

接下来将梯度传播到隐藏层：∂L/∂a¹ = ∂L/∂z² · (W²)ᵀ，然后经过 ReLU 激活函数的导数：∂L/∂z¹ = ∂L/∂a¹ ⊙ I(z¹ > 0)，其中 ⊙ 是逐元素乘法，I(·) 是指示函数（ReLU 的导数在 z>0 时为 1，否则为 0）。最后，隐藏层参数的梯度为：∂L/∂W¹ = Xᵀ · ∂L/∂z¹，∂L/∂b¹ = Σ ∂L/∂z¹。

反向传播之所以高效，是因为它通过一次前向传播和一次反向传播，就计算出了所有参数的梯度。如果使用数值微分（finite differences），对每个参数都要单独扰动一次再前向传播，计算复杂度从 O(1) 次前向传播飙升到 O(p) 次（p 为参数数量）。现代神经网络的参数量动辄数百万甚至数十亿，数值微分完全不可行。

理解反向传播的关键是把它看作计算图上的反向消息传递。每一层接收来自上一层的梯度信号，结合自身缓存的中间结果，计算本地梯度并继续向后传递。这种模块化设计使得构建任意复杂的网络架构成为可能。`,
        mermaid: `flowchart TD
    A["输入 X"] -->|"z¹ = XW¹+b¹"| B["隐藏层 z¹"]
    B -->|"a¹ = ReLU(z¹)"| C["隐藏层激活 a¹"]
    C -->|"z² = a¹W²+b²"| D["输出层 z²"]
    D -->|"a² = Softmax(z²)"| E["输出 a²"]
    E -->|"L = CrossEntropy(a², y)"| F["损失 L"]

    F -->|"δ² = a² - y"| G["输出层梯度 δ²"]
    G -->|"dW² = (a¹)ᵀ·δ²"| H["更新 W², b²"]
    G -->|"δ¹ = δ²·(W²)ᵀ"| I["隐藏层梯度"]
    I -->|"δ¹ = δ¹ ⊙ ReLU'(z¹)"| J["ReLU 导数"]
    J -->|"dW¹ = Xᵀ·δ¹"| K["更新 W¹, b¹"]

    classDef forward fill:#0c4a6e
    classDef backward fill:#7c2d12
    classDef loss fill:#7f1d1d
    class A,B,C,D,E forward
    class G,H,I,J,K backward
    class F loss`,
        tip: "调试神经网络时，先用数值微分验证反向传播的正确性：对每个参数 w，计算 (L(w+ε) - L(w-ε)) / 2ε，与反向传播得到的梯度比较。如果相对误差 < 1e-7，说明反向传播实现正确。这被称为梯度检查（Gradient Checking）。",
      },
      {
        title: "4. 激活函数大全",
        body: `激活函数是神经网络的"灵魂"。没有激活函数，无论多少层网络都等价于一个线性变换——因为线性函数的复合仍然是线性的。激活函数引入了非线性，使得神经网络可以逼近任意复杂的函数。

**Sigmoid** σ(x) = 1/(1+e⁻ˣ) 是最早被广泛使用的激活函数。它将输出压缩到 (0, 1) 区间，可以解释为概率。但 Sigmoid 有两个致命缺陷：梯度消失（当 |x| 很大时，导数趋近于 0）和输出不对称（永远为正），这使得它不再适合作为隐藏层的激活函数。目前 Sigmoid 仅用于二分类输出层和 LSTM 的门控机制。

**Tanh** tanh(x) = (eˣ - e⁻ˣ)/(eˣ + e⁻ˣ) 是 Sigmoid 的改进版本，输出范围 (-1, 1)，以 0 为中心。这缓解了输出不对称的问题，但梯度消失问题依然存在。Tanh 在 RNN 中仍有应用。

**ReLU** ReLU(x) = max(0, x) 是 2010 年后深度学习的默认选择。它解决了梯度消失问题（正区间的导数恒为 1），计算效率极高（只需一次比较操作），并且具有稀疏激活性（约 50% 的神经元输出为 0，类似于生物神经元）。但 ReLU 有"死亡 ReLU"问题：如果某个神经元在训练初期输出始终为负，其梯度恒为 0，该神经元将永久"死亡"不再被激活。

**Leaky ReLU** LeakyReLU(x) = max(αx, x)（通常 α = 0.01）解决了死亡 ReLU 问题：在负区间赋予一个小的斜率，保证梯度永远不为 0。实验表明它在某些场景下比标准 ReLU 更稳定。

**GELU** GELU(x) = x · Φ(x)（其中 Φ 是标准正态分布的累积分布函数）是 Transformer 架构中的标准激活函数。它近似地实现了"随机正则化"的效果：根据输入值自适应地调节信息流。GELU 在大规模语言模型中被广泛使用（BERT、GPT 系列）。

**SiLU / Swish** SiLU(x) = x · σ(x) 由 Google Brain 提出，在多项图像分类任务中略优于 ReLU。它是 GELU 的一个可计算变体，导数形式简单：SiLU'(x) = SiLU(x) + σ(x)。`,
        table: {
          headers: ["激活函数", "公式", "输出范围", "优点", "缺点"],
          rows: [
            ["Sigmoid", "1/(1+e⁻ˣ)", "(0, 1)", "输出可解释为概率", "梯度消失、非零中心"],
            ["Tanh", "(eˣ-e⁻ˣ)/(eˣ+e⁻ˣ)", "(-1, 1)", "零中心输出", "梯度消失"],
            ["ReLU", "max(0,x)", "[0, +∞)", "计算快、解决梯度消失", "死亡神经元"],
            ["Leaky ReLU", "max(0.01x, x)", "(-∞, +∞)", "无死亡神经元", "效果略不稳定"],
            ["GELU", "x·Φ(x)", "(-∞, +∞)", "自适应正则化、Transformer 标配", "计算稍慢（含 CDF）"],
            ["SiLU", "x·σ(x)", "(-∞, +∞)", "光滑、性能优于 ReLU", "计算量略大于 ReLU"],
          ],
        },
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt

# ===== 激活函数可视化 =====
x = np.linspace(-5, 5, 500)

def sigmoid(x): return 1 / (1 + np.exp(-x))
def tanh(x): return np.tanh(x)
def relu(x): return np.maximum(0, x)
def leaky_relu(x, alpha=0.01): return np.where(x > 0, x, alpha * x)
def gelu(x): return 0.5 * x * (1 + np.tanh(np.sqrt(2/np.pi) * (x + 0.044715 * x**3)))
def silu(x): return x * sigmoid(x)

functions = {
    'Sigmoid': (sigmoid, '#e74c3c'),
    'Tanh': (tanh, '#3498db'),
    'ReLU': (relu, '#2ecc71'),
    'Leaky ReLU': (leaky_relu, '#9b59b6'),
    'GELU': (gelu, '#f39c12'),
    'SiLU': (silu, '#1abc9c'),
}

fig, axes = plt.subplots(2, 3, figsize=(15, 10))
for ax, (name, (func, color)) in zip(axes.ravel(), functions.items()):
    y = func(x)
    ax.plot(x, y, color=color, linewidth=2, label=name)
    ax.plot(x, np.gradient(y, x), '--', alpha=0.5, label='导数')
    ax.axhline(0, color='gray', linewidth=0.5)
    ax.axvline(0, color='gray', linewidth=0.5)
    ax.set_title(name, fontsize=12, fontweight='bold')
    ax.legend(fontsize=9)
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()`,
          },
        ],
      },
      {
        title: "5. 损失函数与优化器",
        body: `损失函数衡量模型预测与真实值之间的差距，是驱动神经网络学习的"指南针"。优化器则决定了如何利用损失函数的梯度来更新参数——就像下山时选择什么样的步伐和方向。

回归任务常用的损失函数是均方误差（MSE）：L = (1/n) Σ(yᵢ - ŷᵢ)²。它对大误差的平方惩罚使得模型对 outliers 敏感，但在大多数回归场景中表现良好。对于鲁棒性要求更高的场景，可以使用平均绝对误差（MAE）或 Huber Loss（结合 MSE 和 MAE 的优点）。

分类任务常用交叉熵损失。二分类使用二元交叉熵（Binary Cross-Entropy）：L = -(1/n) Σ[yᵢ·log(ŷᵢ) + (1-yᵢ)·log(1-ŷᵢ)]。多分类使用分类交叉熵（Categorical Cross-Entropy）：L = -(1/n) Σᵢ Σₖ yᵢₖ·log(ŷᵢₖ)，其中 yᵢₖ 是样本 i 属于类别 k 的真实标签（0 或 1），ŷᵢₖ 是预测概率。

优化器的选择直接影响训练的速度和质量。随机梯度下降（SGD）是最基础的优化器：w ← w - α·∇L(w)。它的每次更新只使用一个小批量（mini-batch）的梯度，引入了有益的噪声，有助于逃离局部最优。但 SGD 的收敛速度可能较慢，尤其在高维空间中容易在峡谷地形中震荡。

动量法（Momentum）通过引入速度变量来解决 SGD 的震荡问题：v ← βv + ∇L(w)，w ← w - αv。动量积累了历史梯度的指数加权平均，相当于给优化器"惯性"，在一致的方向上加速，在震荡方向上减速。

Adam（Adaptive Moment Estimation）是目前最常用的优化器，结合了动量和自适应学习率的思想：它同时维护梯度的一阶矩（均值）和二阶矩（方差）的指数加权平均估计，对每个参数使用自适应的学习率。Adam 的默认超参数（α=0.001, β₁=0.9, β₂=0.999, ε=1e-8）在大多数场景下都表现良好，这也是它成为首选的原因。`,
        mermaid: `flowchart LR
    A["损失函数\nMSE / CrossEntropy"] --> B["计算梯度\n∇L(w)"]
    B --> C{"优化器"}
    C -->|"SGD"| D["w ← w - α·∇L"]
    C -->|"Momentum"| E["v ← βv + ∇L\nw ← w - α·v"]
    C -->|"Adam"| F["m ← β₁m + (1-β₁)·g\nv ← β₂v + (1-β₂)·g²\nw ← w - α·m̂/(√v̂+ε)"]
    D --> G["新参数 w"]
    E --> G
    F --> G

    classDef loss fill:#7f1d1d
    classDef opt fill:#0c4a6e
    class A loss
    class C,D,E,F opt`,
      },
      {
        title: "6. 过拟合与正则化",
        body: `过拟合（Overfitting）是机器学习中最重要的概念之一。它指的是模型在训练集上表现很好，但在未见过的测试集上表现很差——模型"记住"了训练数据，而不是学会了泛化的规律。

判断模型是否过拟合的方法很简单：观察训练误差和验证误差的差距。如果训练误差持续下降而验证误差在某个点后开始上升，就是典型的过拟合信号。

防止过拟合的主要手段有以下几种。

**L1 正则化（Lasso）**：在损失函数中添加权重的 L1 范数：L_reg = L + λ·||w||₁ = L + λ·Σ|wⱼ|。L1 正则化倾向于产生稀疏权重（许多权重变为 0），因此具有特征选择的效果。它对应的先验分布是 Laplace 分布。

**L2 正则化（Ridge / Weight Decay）**：在损失函数中添加权重的 L2 范数：L_reg = L + λ·||w||₂² = L + λ·Σwⱼ²。L2 正则化倾向于让所有权重都较小但非零，对应高斯先验。它是最常用的正则化方法。

**Dropout**：在训练过程中，以概率 p 随机"丢弃"（设为 0）隐藏层中的部分神经元。这相当于在每次迭代中训练一个不同的子网络，最终效果类似于集成学习。Dropout 破坏了神经元之间的共适应关系，迫使每个神经元学会独立地提取有用的特征。在推理阶段，所有神经元都参与计算，但输出需要乘以 (1-p) 来补偿训练时的丢弃效应（或者在训练时将激活值除以 (1-p)，称为 Inverted Dropout）。

**早停法（Early Stopping）**：监控验证集上的性能，当验证误差在连续 N 个 epoch 内不再下降时停止训练。这是最简单、最常用的正则化手段，几乎不需要额外的计算开销。

**数据增强**：对于图像数据，可以通过随机裁剪、翻转、旋转、颜色抖动等方式扩充训练集；对于文本数据，可以使用同义词替换、随机删除等方法。数据增强是最有效的正则化方式之一，因为它直接增加了训练数据的多样性。`,
        tip: "实践中推荐的防过拟合组合：L2 正则化（weight decay=0.01）+ Dropout（p=0.3~0.5）+ Early Stopping（patience=10 epoch）。对于数据量充足的场景，数据增强比任何正则化技术都更有效。",
      },
      {
        title: "7. Python 实战：用 NumPy 从零实现 MLP",
        body: `理论再好，不如亲手实现一次。下面我们仅使用 NumPy，从零实现一个完整的多层感知机，包括前向传播、反向传播、梯度下降训练和模型评估。这个实现虽然不如深度学习框架高效，但能让你真正理解每一行代码背后的数学原理。

我们将训练一个 MLP 来识别手写数字（MNIST 数据集的简化版本），这是一个经典的多分类任务。通过这个完整的实现，你将理解神经网络的训练循环、批量处理、学习率调度等核心概念。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

# ===== 1. 加载并准备数据 =====
digits = load_digits()
X = digits.data / 16.0  # 归一化到 [0, 1]
y = digits.target  # 0-9 共 10 类

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ===== 2. 神经网络实现 =====
class MLP:
    def __init__(self, layer_sizes, learning_rate=0.01, reg_lambda=0.001):
        self.lr = learning_rate
        self.reg_lambda = reg_lambda
        # 参数初始化 (He initialization for ReLU)
        self.weights = []
        self.biases = []
        for i in range(len(layer_sizes) - 1):
            w = np.random.randn(layer_sizes[i], layer_sizes[i+1]) * np.sqrt(2.0 / layer_sizes[i])
            b = np.zeros((1, layer_sizes[i+1]))
            self.weights.append(w)
            self.biases.append(b)
    
    def _relu(self, z):
        return np.maximum(0, z)
    
    def _relu_derivative(self, z):
        return (z > 0).astype(float)
    
    def _softmax(self, z):
        exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))
        return exp_z / np.sum(exp_z, axis=1, keepdims=True)
    
    def _one_hot(self, y, num_classes):
        n = len(y)
        oh = np.zeros((n, num_classes))
        oh[np.arange(n), y] = 1
        return oh
    
    def forward(self, X):
        self.activations = [X]
        self.z_values = []
        a = X
        for i in range(len(self.weights) - 1):
            z = a @ self.weights[i] + self.biases[i]
            self.z_values.append(z)
            a = self._relu(z)
            self.activations.append(a)
        # 输出层 (Softmax)
        z = a @ self.weights[-1] + self.biases[-1]
        self.z_values.append(z)
        a = self._softmax(z)
        self.activations.append(a)
        return a
    
    def backward(self, y_onehot):
        m = y_onehot.shape[0]
        # 输出层梯度
        delta = (self.activations[-1] - y_onehot) / m
        
        d_weights = []
        d_biases = []
        for i in range(len(self.weights) - 1, 0, -1):
            dW = self.activations[i].T @ delta + self.reg_lambda * self.weights[i]
            db = np.sum(delta, axis=0, keepdims=True)
            d_weights.insert(0, dW)
            d_biases.insert(0, db)
            delta = (delta @ self.weights[i].T) * self._relu_derivative(self.z_values[i-1])
        # 第一层
        dW = self.activations[0].T @ delta + self.reg_lambda * self.weights[0]
        db = np.sum(delta, axis=0, keepdims=True)
        d_weights.insert(0, dW)
        d_biases.insert(0, db)
        return d_weights, d_biases
    
    def update(self, d_weights, d_biases):
        for i in range(len(self.weights)):
            self.weights[i] -= self.lr * d_weights[i]
            self.biases[i] -= self.lr * d_biases[i]
    
    def train(self, X, y, epochs=500, batch_size=64, verbose=True):
        num_classes = len(np.unique(y))
        y_onehot = self._one_hot(y, num_classes)
        n = X.shape[0]
        
        for epoch in range(epochs):
            # Mini-batch
            indices = np.random.permutation(n)
            X_shuffled = X[indices]
            y_shuffled = y_onehot[indices]
            
            for start in range(0, n, batch_size):
                X_batch = X_shuffled[start:start+batch_size]
                y_batch = y_shuffled[start:start+batch_size]
                
                self.forward(X_batch)
                dW, db = self.backward(y_batch)
                self.update(dW, db)
            
            if verbose and (epoch + 1) % 100 == 0:
                output = self.forward(X)
                loss = -np.mean(np.sum(y_onehot * np.log(output + 1e-8), axis=1))
                acc = np.mean(np.argmax(output, axis=1) == y)
                print(f"Epoch {epoch+1:4d} | Loss: {loss:.4f} | Train Acc: {acc:.4f}")
    
    def predict(self, X):
        output = self.forward(X)
        return np.argmax(output, axis=1)

# ===== 3. 训练与评估 =====
np.random.seed(42)
model = MLP(layer_sizes=[64, 128, 64, 10], learning_rate=0.01, reg_lambda=0.001)
model.train(X_train, y_train, epochs=500, batch_size=64, verbose=True)

# 测试集评估
y_pred = model.predict(X_test)
test_acc = np.mean(y_pred == y_test)
print(f"\\n测试集准确率: {test_acc:.4f}")

# 混淆矩阵
from sklearn.metrics import confusion_matrix
cm = confusion_matrix(y_test, y_pred)
print("\\n混淆矩阵 (行=真实, 列=预测):")
print(cm)`,
          },
        ],
        warning: "从零实现神经网络时最常见的 bug：1）矩阵维度不匹配——每次矩阵乘法后打印 shape 检查；2）梯度计算错误——使用梯度检查验证；3）忘记在 softmax 前减去 max 值——可能导致数值溢出；4）学习率过大——loss 发散为 NaN 时首先检查学习率。",
      },
      {
        title: "8. 深度学习框架演进",
        body: `从零实现神经网络虽然有助于理解原理，但在实际项目中，我们会使用成熟的深度学习框架。这些框架提供了自动微分（Automatic Differentiation）、GPU 加速、预训练模型等强大的功能。

深度学习框架的演进经历了几个关键阶段。Theano（2007）是第一个主流的深度学框架，它引入了符号计算图和自动微分的概念，奠定了后续所有框架的设计范式。Caffe（2014）专注于卷积神经网络，在计算机视觉领域曾占据主导地位。Torch（2002）及其后继者 PyTorch（2016）采用了动态计算图的设计，使得模型调试和实验更加灵活直观。TensorFlow（2015）由 Google 推出，以其静态计算图和分布式训练能力著称，在工业界得到广泛应用。

当前的主流框架是 PyTorch 和 TensorFlow（含 Keras 高层 API）。PyTorch 在学术界占据绝对优势（2023 年约 80% 的顶会论文使用 PyTorch），其动态图（Define-by-Run）设计使得代码几乎就是 Python 代码，调试体验极佳。TensorFlow 在工业界仍有重要地位，其 TensorFlow Serving、TensorFlow Lite 等部署工具链非常成熟。JAX 作为后起之秀，以其函数式编程范式和 XLA 编译器优化，在研究领域快速增长。

对于初学者，强烈推荐从 PyTorch 开始学习。它的 API 设计直觉友好、社区活跃、教程丰富，并且与 Python 的集成最为自然。当你掌握了 PyTorch 后，迁移到其他框架几乎没有障碍——因为核心的神经网络概念（张量、自动微分、优化器）在所有框架中都是相通的。`,
        table: {
          headers: ["框架", "开发方", "计算图", "主要优势", "典型应用"],
          rows: [
            ["PyTorch", "Meta", "动态图", "灵活、易调试、学术生态", "研究、原型开发、NLP"],
            ["TensorFlow", "Google", "静态图/动态图", "部署工具链完善、生产级", "工业部署、移动端"],
            ["JAX", "Google", "函数式+JIT", "高性能编译、自动微分组合", "科学计算、大规模训练"],
            ["MindSpore", "华为", "动静统一", "昇腾芯片优化、全场景", "华为生态、端边云协同"],
          ],
        },
        tip: "学习建议：不要纠结于框架选择。先精通一个（推荐 PyTorch），理解张量操作、自动微分、模型定义、训练循环这些核心概念。框架之间的差异远小于它们之间的共同点。",
      },
    ],
};
