import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-001",
    title: "神经网络基础：从感知机到多层网络",
    category: "dl",
    tags: ["反向传播", "激活函数", "基础"],
    summary: "理解神经元、激活函数、反向传播和梯度消失问题",
    date: "2026-04-09",
    readTime: "18 min",
    level: "入门",
    content: [
      {
        title: "1. 从生物神经元到人工神经元",
        body: `人工神经网络（Artificial Neural Network, ANN）的灵感来源于生物大脑的神经元网络。一个生物神经元通过树突接收来自其他神经元的信号，在细胞体内进行整合，当信号强度超过阈值时，通过轴突向下游神经元传递电信号。

McCulloch 和 Pitts 在 1943 年提出了第一个数学模型：M-P 神经元。它将生物神经元的运作抽象为三个步骤：接收多个输入信号（每个信号有不同的权重 wᵢ）、对所有加权输入求和并与阈值 θ 比较、通过激活函数产生输出。

这个看似简单的模型却是所有深度学习的基石。现代深度神经网络虽然在规模和复杂度上远超最初的感知机，但每个神经元的基本运算模式——加权求和、非线性变换——始终未变。`,
        mermaid: `graph LR
    A["输入 x₁"] -->|权重 w₁| C["求和 Σ"]
    B["输入 x₂"] -->|权重 w₂| C
    D["输入 xₙ"] -->|权重 wₙ| C
    C -->|"z = Σwᵢxᵢ + b"| E["激活函数 f(z)"]
    E --> F["输出 a"]
    class F s4
    class E s3
    class D s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#1e3a5f
    classDef s2 fill:#1e3a5f
    classDef s3 fill:#14532d
    classDef s4 fill:#7c2d12`,
        tip: "学习建议：在纸上画一个神经元，标注输入、权重、偏置、激活函数和输出。然后手动计算一次前向传播。这个简单的练习比看十篇教程都有效。",
      },
      {
        title: "2. 感知机：最早的神经网络",
        body: `感知机（Perceptron）由 Frank Rosenblatt 于 1958 年提出，是最简单的神经网络——只有一个神经元。它接收输入 x，计算 z = w·x + b，然后用阶跃函数判断：z ≥ 0 则输出 1，否则输出 0。

感知机的训练规则非常直观：如果预测正确，权重不变；如果预测错误，向正确的方向调整权重。具体地，当 yᵢ = 1 但预测为 0 时，增加权重（w := w + η·xᵢ）；当 yᵢ = 0 但预测为 1 时，减小权重（w := w - η·xᵢ）。

感知机收敛定理保证了：如果数据线性可分，感知机算法在有限步内一定会找到一个完美分类的超平面。但它有两个致命缺陷：只能处理线性可分数据（连 XOR 问题都解决不了）；只能输出 0 或 1，无法给出置信度。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class Perceptron:
    """从零实现经典感知机"""
    
    def __init__(self, lr=0.01, n_iters=1000):
        self.lr = lr
        self.n_iters = n_iters
        self.w = None
        self.b = None
    
    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.w = np.zeros(n_features)
        self.b = 0.0
        
        for _ in range(self.n_iters):
            errors = 0
            for xi, yi in zip(X, y):
                z = np.dot(xi, self.w) + self.b
                y_pred = 1 if z >= 0 else 0
                update = self.lr * (yi - y_pred)
                self.w += update * xi
                self.b += update
                errors += int(update != 0)
            if errors == 0:
                print(f"收敛！迭代 {_+1} 次")
                break
        return self
    
    def predict(self, X):
        z = X @ self.w + self.b
        return np.where(z >= 0, 1, 0)

# 测试 AND 门（线性可分）
X_and = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y_and = np.array([0, 0, 0, 1])

p = Perceptron(lr=0.1, n_iters=100)
p.fit(X_and, y_and)
print(f"AND 门预测: {p.predict(X_and)}")

# 测试 XOR 门（线性不可分——感知机无法解决）
X_xor = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y_xor = np.array([0, 1, 1, 0])

p2 = Perceptron(lr=0.1, n_iters=100)
p2.fit(X_xor, y_xor)
print(f"XOR 门预测: {p2.predict(X_xor)} (应不正确)")`,
          },
        ],
        table: {
          headers: ["逻辑门", "输入 (0,0)", "输入 (0,1)", "输入 (1,0)", "输入 (1,1)", "线性可分"],
          rows: [
            ["AND", "0", "0", "0", "1", "✅"],
            ["OR", "0", "1", "1", "1", "✅"],
            ["NOT", "1", "0", "1", "0", "✅ (单输入)"],
            ["XOR", "0", "1", "1", "0", "❌ 需要多层"],
            ["NAND", "1", "1", "1", "0", "✅"],
          ],
        },
        warning: "XOR 问题是感知机无法跨越的鸿沟——正是这个缺陷导致了第一次 AI 冬天（1969-1980）。Minsky 和 Papert 在《Perceptrons》中证明了感知机的局限性，使得神经网络研究停滞了十几年。",
      },
      {
        title: "3. 激活函数：引入非线性的关键",
        body: `如果没有激活函数，无论多少层网络叠加，本质上仍然是一个线性变换（线性函数的组合仍是线性的）。激活函数的作用是为网络引入非线性能力，使其能够拟合任意复杂的函数。

Sigmoid 函数 σ(z) = 1/(1+e⁻ᶻ)：将输出压缩到 (0, 1) 区间，可解释为概率。在二分类的输出层仍然广泛使用。但它在输入较大或较小时梯度接近零，导致梯度消失问题。

Tanh 函数 tanh(z)：将输出压缩到 (-1, 1) 区间，是零均值的（比 Sigmoid 更好）。但同样存在梯度消失问题。

ReLU 函数 ReLU(z) = max(0, z)：现代深度学习中最常用的激活函数。计算极其高效（只需一个比较操作），在正区间的梯度恒为 1，有效缓解梯度消失。缺点是"死亡 ReLU"问题——如果某个神经元的输出始终为负，它的梯度永远为零，权重不再更新。

Leaky ReLU 和 GELU 是 ReLU 的改进版本。GELU（高斯误差线性单元）在 Transformer 中被广泛使用，它在负区间保留了小概率的激活，使得梯度始终不为零。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def sigmoid_grad(z):
    s = sigmoid(z)
    return s * (1 - s)

def relu(z):
    return np.maximum(0, z)

def relu_grad(z):
    return (z > 0).astype(float)

def gelu(z):
    """GELU 近似实现"""
    return 0.5 * z * (1 + np.tanh(
        np.sqrt(2 / np.pi) * (z + 0.044715 * z**3)
    ))

# 激活函数及梯度对比
z_vals = [-10, -5, -1, 0, 1, 5, 10]
print(f"{'z':>6} | {'Sigmoid':>9} | {'SigGrad':>9} | {'ReLU':>6} | {'ReLUGrad':>6}")
print("-" * 52)
for z in z_vals:
    print(f"{z:6.1f} | {sigmoid(z):9.6f} | {sigmoid_grad(z):9.6f} | {relu(z):6.1f} | {relu_grad(z):6.1f}")

# 梯度消失演示
print("\\n梯度消失演示（深层网络中的 Sigmoid 梯度衰减）：")
gradient = 1.0
for layer in range(1, 11):
    gradient *= 0.25  # sigmoid 最大梯度约 0.25
    print(f"  第 {layer:2d} 层: 梯度 = {gradient:.2e}")`,
          },
        ],
        table: {
          headers: ["激活函数", "输出范围", "梯度范围", "计算成本", "主要优点", "主要缺点"],
          rows: [
            ["Sigmoid", "(0, 1)", "(0, 0.25]", "高（指数运算）", "可解释为概率", "梯度消失、非零均值"],
            ["Tanh", "(-1, 1)", "(0, 1]", "高（指数运算）", "零均值", "梯度消失"],
            ["ReLU", "[0, ∞)", "{0, 1}", "极低", "计算快、缓解梯度消失", "死亡 ReLU"],
            ["Leaky ReLU", "(-∞, ∞)", "{0.01, 1}", "极低", "避免死亡 ReLU", "负区间斜率需选择"],
            ["GELU", "(-∞, ∞)", "连续", "中", "光滑、Transformer 标准", "计算稍复杂"],
          ],
        },
      },
      {
        title: "4. 多层感知机（MLP）：从线性到万能",
        body: `多层感知机（Multi-Layer Perceptron, MLP）是在输入层和输出层之间增加了一个或多个隐藏层的神经网络。正是这些隐藏层使得网络能够学习非线性决策边界。

万能近似定理（Universal Approximation Theorem）：一个具有足够多神经元的单隐藏层 MLP，使用非线性激活函数，可以以任意精度逼近任何定义在紧凑集上的连续函数。这个定理从理论上保证了 MLP 的表达能力。

但"能逼近"不等于"能学好"。定理没有告诉我们：需要多少神经元、如何高效训练、以及能否泛化到未见数据。这些问题的答案催生了深度学习的大量研究成果。

一个典型的 MLP 前向传播过程：第 l 层的输出 a⁽ˡ⁾ = f(W⁽ˡ⁾ · a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)，其中 f 是激活函数。从输入 a⁽⁰⁾ = x 开始，逐层计算直到输出层。`,
        mermaid: `graph LR
    subgraph "输入层"
        I1["x₁"]
        I2["x₂"]
        I3["x₃"]
    end
    
    subgraph "隐藏层 1"
        H1["h₁₁"]
        H2["h₁₂"]
        H3["h₁₃"]
        H4["h₁₄"]
    end
    
    subgraph "隐藏层 2"
        H5["h₂₁"]
        H6["h₂₂"]
        H7["h₂₃"]
    end
    
    subgraph "输出层"
        O1["ŷ₁"]
        O2["ŷ₂"]
    end
    
    I1 --> H1 & H2 & H3 & H4
    I2 --> H1 & H2 & H3 & H4
    I3 --> H1 & H2 & H3 & H4
    H1 --> H5 & H6 & H7
    H2 --> H5 & H6 & H7
    H3 --> H5 & H6 & H7
    H4 --> H5 & H6 & H7
    H5 --> O1 & O2
    H6 --> O1 & O2
    H7 --> O1 & O2`,
        code: [
          {
            lang: "python",
            code: `class MLP:
    """从零实现多层感知机（2 个隐藏层）"""
    
    def __init__(self, layer_sizes, lr=0.01):
        """layer_sizes: [输入维度, 隐藏1, 隐藏2, 输出维度]"""
        self.lr = lr
        self.weights = []
        self.biases = []
        
        # He 初始化
        for i in range(len(layer_sizes) - 1):
            fan_in = layer_sizes[i]
            limit = np.sqrt(2.0 / fan_in)
            w = np.random.randn(fan_in, layer_sizes[i+1]) * limit
            b = np.zeros((1, layer_sizes[i+1]))
            self.weights.append(w)
            self.biases.append(b)
    
    def forward(self, X):
        self.z_list = []
        self.a_list = [X]
        
        a = X
        for i in range(len(self.weights) - 1):
            z = a @ self.weights[i] + self.biases[i]
            a = np.maximum(0, z)  # ReLU
            self.z_list.append(z)
            self.a_list.append(a)
        
        # 输出层（无激活，用于回归）
        z = a @ self.weights[-1] + self.biases[-1]
        self.z_list.append(z)
        self.a_list.append(z)
        return z
    
    def backward(self, X, y):
        m = X.shape[0]
        dz = (self.a_list[-1] - y) / m  # MSE 梯度
        
        dw_list, db_list = [], []
        for i in range(len(self.weights) - 1, -1, -1):
            dw = self.a_list[i].T @ dz
            db = np.sum(dz, axis=0, keepdims=True)
            dw_list.insert(0, dw)
            db_list.insert(0, db)
            
            if i > 0:
                dz = (dz @ self.weights[i].T) * (self.z_list[i-1] > 0)
        
        for i in range(len(self.weights)):
            self.weights[i] -= self.lr * dw_list[i]
            self.biases[i] -= self.lr * db_list[i]
    
    def train(self, X, y, epochs=1000):
        for epoch in range(epochs):
            out = self.forward(X)
            loss = np.mean((out - y)  2)
            self.backward(X, y)
            if epoch % 200 == 0:
                print(f"Epoch {epoch:4d}: Loss = {loss:.6f}")

# 测试 XOR
X = np.array([[0,0],[0,1],[1,0],[1,1]], dtype=float)
y = np.array([[0],[1],[1],[0]], dtype=float)

np.random.seed(42)
mlp = MLP([2, 8, 4, 1], lr=0.5)
mlp.train(X, y, epochs=2000)
pred = mlp.forward(X)
print("\\nXOR 结果:")
for i in range(4):
    print(f"  {X[i].astype(int).tolist()} -> {pred[i][0]:.4f} (期望 {int(y[i][0])})")`,
          },
        ],
      },
      {
        title: "5. 反向传播：神经网络的学习引擎",
        body: `反向传播（Backpropagation）是训练神经网络的核心算法。它的本质是链式法则（Chain Rule）在计算图上的高效应用。

理解反向传播的关键是计算图（Computational Graph）。每个运算（加法、乘法、激活函数）都是图中的一个节点。前向传播时，数据从输入流向输出；反向传播时，梯度从输出流回输入。

链式法则告诉我们：如果 z = g(y) 且 y = f(x)，那么 ∂z/∂x = (∂z/∂y) · (∂y/∂x)。在神经网络中，这意味着损失函数对某一层权重的梯度，可以通过逐层传递梯度来计算。

反向传播的四个基本方程（BPE1-BPE4）构成了完整的梯度计算框架。最关键的洞察是：每个神经元的误差 δ⁽ˡ⁾ 可以从后一层的误差 δ⁽ˡ⁺¹⁾ 反向计算得到，这避免了为每个权重单独计算梯度的巨大开销。`,
        mermaid: `graph TD
    A["输入 x"] --> B["前向传播"]
    B --> C["计算损失 L"]
    C --> D["计算 ∂L/∂ŷ"]
    D --> E["反向传播 ∂L/∂w"]
    E --> F["链式法则逐层传递"]
    F --> G["∂L/∂w¹, ∂L/∂w², ..."]
    G --> H["梯度下降更新权重"]
    H --> B
    class H s2
    class C s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#7c2d12
    classDef s2 fill:#14532d`,
        list: [
          "前向传播：计算每一层的 z = W·a + b 和 a = f(z)",
          "输出层误差：δᴸ = ∂L/∂aᴸ ⊙ f'(zᴸ)",
          "隐藏层误差：δˡ = (Wˡ⁺¹)ᵀ · δˡ⁺¹ ⊙ f'(zˡ)",
          "权重梯度：∂L/∂Wˡ = δˡ · (aˡ⁻¹)ᵀ",
          "偏置梯度：∂L/∂bˡ = δˡ",
          "用梯度下降更新所有权重：W := W - α·∂L/∂W",
        ],
        tip: "调试技巧：用数值梯度验证反向传播的正确性。对每个权重 w 计算 (L(w+ε) - L(w-ε)) / 2ε，与反向传播计算的梯度对比。如果差异 > 1e-7，说明反向传播实现有误。",
      },
      {
        title: "6. 梯度消失与梯度爆炸：深度网络的训练难题",
        body: `当神经网络变深时，反向传播中梯度需要乘以多层权重矩阵。根据链式法则，梯度是连乘的形式——如果每个矩阵的谱范数小于 1，梯度会指数级衰减（消失）；如果大于 1，梯度会指数级增长（爆炸）。

梯度消失的后果：浅层（靠近输入）的权重几乎不更新，网络退化为只有最后几层在训练，深度的优势完全丧失。这正是 sigmoid/tanh 时代深层网络无法训练的根本原因。

解决方案包括**：使用 ReLU 类激活函数（正区间梯度恒为 1）；Xavier/He 初始化（让每层的输出方差保持一致）；残差连接（ResNet，让梯度可以直接跨层传播）；层归一化/批归一化（稳定每层的输入分布）；梯度裁剪（限制梯度的最大范数，防止爆炸）。`,
        code: [
          {
            lang: "python",
            code: `# 演示梯度消失问题
import numpy as np

def demonstrate_vanishing_gradient():
    """展示不同激活函数的梯度消失效应"""
    n_layers = 20
    
    for act_name, max_grad in [("Sigmoid", 0.25), ("ReLU", 1.0)]:
        grad = 1.0
        print(f"\\n{act_name} ({n_layers} 层):")
        for layer in range(1, n_layers + 1):
            grad *= max_grad
            if layer in [1, 5, 10, 15, 20]:
                print(f"  第 {layer:2d} 层: 梯度 = {grad:.2e}")

demonstrate_vanishing_gradient()

# He 初始化 vs 随机初始化
print("\\nHe 初始化 vs 随机初始化:")
for init_name, scale in [("Xavier", np.sqrt(2/20)), ("He", np.sqrt(2/10)), ("Bad", 5.0)]:
    W = np.random.randn(10, 10) * scale
    a = np.maximum(0, W @ np.random.randn(10, 100))
    print(f"  {init_name:8s}: 权重 std={W.std():.4f}, 激活 std={a.std():.4f}")`,
          },
        ],
        table: {
          headers: ["问题", "原因", "症状", "解决方案"],
          rows: [
            ["梯度消失", "连乘 < 1 的因子", "浅层权重几乎不更新", "ReLU, He 初始化, 残差连接"],
            ["梯度爆炸", "连乘 > 1 的因子", "权重更新过大, NaN", "梯度裁剪, 更好的初始化"],
            ["死亡 ReLU", "负输入导致梯度为零", "部分神经元永久关闭", "Leaky ReLU, 降低学习率"],
            ["激活饱和", "Sigmoid/Tanh 极值区", "梯度接近零, 学习停滞", "换 ReLU, 特征标准化"],
          ],
        },
      },
      {
        title: "7. 权重初始化与学习率策略",
        body: `好的初始化和学习率策略决定了神经网络能否成功训练。

权重初始化：如果权重太大，激活值会饱和（Sigmoid/Tanh）或爆炸（ReLU）；如果权重太小，信号会衰减到零。Xavier 初始化假设激活函数是线性的，让每层的输入和输出方差保持一致，适用于 Sigmoid/Tanh。He 初始化考虑了 ReLU 在负区间的截断，方差放大两倍，是 ReLU 网络的标准选择。

学习率调度：固定学习率往往不是最优的。学习率太大可能跳过最优解，太小则训练极慢。常用的调度策略包括：Step Decay（每 N 个 epoch 衰减）、Cosine Annealing（余弦衰减，在终点附近精细化搜索）、Warmup（先小后大再小，Transformer 训练的标准配置）。`,
        mermaid: `graph LR
    A["权重初始化"] --> B["Xavier (Sigmoid/Tanh)"]
    A --> C["He (ReLU/GELU)"]
    A --> D["LeCun (SELU)"]
    
    E["学习率策略"] --> F["固定 LR"]
    E --> G["Step Decay"]
    E --> H["Cosine Annealing"]
    E --> I["Warmup + Cosine"]
    class I s3
    class H s2
    class C s1
    class B s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12
    classDef s3 fill:#14532d`,
        list: [
          "ReLU 网络使用 He 初始化：std = sqrt(2/fan_in)",
          "Sigmoid/Tanh 使用 Xavier 初始化：std = sqrt(1/fan_in)",
          "学习率是最关键的超参数——先调 LR，再调其他",
          "从 LR=0.01 开始尝试，以 10 倍间隔搜索 {0.1, 0.01, 0.001, ...}",
          "Warmup + Cosine Annealing 是 Transformer 训练的标配",
          "Adam 优化器通常比 SGD 对学习率更不敏感",
        ],
        warning: "永远不要用大的随机值初始化权重！这是新手最常见的错误之一。错误的初始化会导致激活值饱和或爆炸，网络从一开始就无法学习。",
      },
    ],
  };
