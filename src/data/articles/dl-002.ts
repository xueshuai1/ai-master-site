import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-002",
    title: "反向传播：神经网络如何学习",
    category: "dl",
    tags: ["神经网络", "优化", "梯度下降", "链式法则"],
    summary: "从链式法则到代码实现，透彻理解反向传播的数学原理与工程实践",
    date: "2026-04-12",
    readTime: "18 min",
    level: "入门",
    content: [
      {
        title: "1. 为什么需要反向传播？",
        body: `神经网络的核心任务是学习——从大量数据中自动调整参数，使得模型的预测越来越准确。但"调整参数"听起来简单，实际操作却面临一个根本性挑战：一个典型的神经网络可能有数百万甚至数十亿个参数，我们该如何知道每个参数应该调大还是调小、调多少？

直观的想法是：逐个尝试每个参数，看看它对结果的影响。但这在实践中完全不可行。假设一个网络有 100 万个参数，每尝试一个参数需要计算一次前向传播，那么一轮完整的"试探"就需要 100 万次前向传播。而训练一个模型通常需要数千轮迭代——计算量是天文数字。

反向传播（Backpropagation）巧妙地解决了这个问题。它的核心思想是：先做一次前向传播计算出预测值和损失，然后从输出层向输入层"反向"传播误差信号，利用链式法则精确计算出每个参数对损失的贡献（即梯度）。这样，我们只需要两次传播（一次前向、一次反向）就能算出所有参数的梯度，计算复杂度与参数数量呈线性关系。

反向传播不是新的算法，而是链式法则在计算图上的高效应用。它的伟大之处在于将一个看似不可能的优化问题，转化为了一个可以在 GPU 上高效并行的计算过程。没有反向传播，就没有现代深度学习。`,
        mermaid: `graph LR
    A["输入数据 x"] --> B["前向传播"]
    B --> C["预测值 ŷ"]
    C --> D["损失函数 L"]
    D --> E["反向传播"]
    E --> F["计算每个参数的梯度"]
    F --> G["优化器更新参数"]
    G -.->|下一轮| B`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def forward_pass(X, W1, b1, W2, b2):
    """两层神经网络的前向传播"""
    # 隐藏层：线性变换 + ReLU
    z1 = X @ W1 + b1
    a1 = np.maximum(0, z1)  # ReLU 激活
    # 输出层：线性变换 + Softmax
    z2 = a1 @ W2 + b2
    # Softmax 输出概率
    exp_z = np.exp(z2 - np.max(z2, axis=1, keepdims=True))
    probs = exp_z / exp_z.sum(axis=1, keepdims=True)
    return probs, (X, z1, a1, z2)

def cross_entropy_loss(probs, y_true):
    """交叉熵损失"""
    n = len(y_true)
    log_probs = -np.log(probs[range(n), y_true] + 1e-10)
    return np.sum(log_probs) / n

# 模拟一个小规模网络
np.random.seed(42)
X = np.random.randn(32, 4)  # 32 个样本，4 个特征
y = np.random.randint(0, 3, 32)  # 3 类分类
W1, b1 = np.random.randn(4, 8) * 0.1, np.zeros(8)
W2, b2 = np.random.randn(8, 3) * 0.1, np.zeros(3)

probs, cache = forward_pass(X, W1, b1, W2, b2)
loss = cross_entropy_loss(probs, y)
print(f"初始损失: {loss:.4f}")
print(f"预测分布: {probs[:3]}")`,
          },
          {
            lang: "python",
            code: `# 暴力法 vs 反向传播：计算效率对比
import numpy as np
import time

def brute_force_gradients(X, y, W1, b1, W2, b2, eps=1e-5):
    """数值梯度：逐个扰动参数（极其慢）"""
    grads = {}
    for name, param in [('W1', W1), ('b1', b1), ('W2', W2), ('b2', b2)]:
        grads[name] = np.zeros_like(param)
        it = np.nditer(param, flags=['multi_index'])
        while not it.finished:
            idx = it.multi_index
            old_val = param[idx]
            param[idx] = old_val + eps
            p1, _ = forward_pass(X, W1, b1, W2, b2)
            l1 = cross_entropy_loss(p1, y)
            param[idx] = old_val - eps
            p2, _ = forward_pass(X, W1, b1, W2, b2)
            l2 = cross_entropy_loss(p2, y)
            grads[name][idx] = (l1 - l2) / (2 * eps)
            param[idx] = old_val
            it.iternext()
    return grads

def numerical_vs_analytical():
    """对比数值梯度和反向传播的速度"""
    np.random.seed(42)
    X = np.random.randn(16, 4)
    y = np.random.randint(0, 3, 16)
    W1 = np.random.randn(4, 4) * 0.1
    b1 = np.zeros(4)
    W2 = np.random.randn(4, 3) * 0.1
    b2 = np.zeros(3)
    
    t0 = time.time()
    # 数值梯度只计算一小部分参数
    W1_small = W1[:2, :2].copy()
    grads_num = brute_force_gradients(X, y, W1, b1, W2, b2)
    t_num = time.time() - t0
    print(f"数值梯度时间: {t_num:.3f}s (4×4+4+4×3+3 = 39个参数)")
    print("注意：对于百万参数的网络，数值梯度需要数百万次前向传播！")
    print(f"反向传播只需 2 次传播（前向+反向）")

numerical_vs_analytical()`,
          },
        ],
        table: {
          headers: ["梯度计算方法", "计算复杂度", "精度", "适用场景"],
          rows: [
            ["数值梯度（扰动法）", "O(P × N)，P=参数量", "近似（依赖 eps）", "验证反向传播正确性"],
            ["符号微分", "O(P)，但表达式爆炸", "精确", "简单模型（复杂模型不可行）"],
            ["反向传播", "O(N)，N=前向计算量", "精确", "所有神经网络（标准方法）"],
            ["自动微分", "O(N)，与前向相当", "精确", "深度学习框架（PyTorch/JAX）"],
          ],
        },
        tip: "学习建议：不要一上来就看 PyTorch 的 autograd。先手推一遍两层神经网络的反向传播，理解链式法则是如何逐层传递梯度的。这会帮你建立对深度学习框架内部工作原理的直觉。",
        warning: "反向传播计算的是精确的数学梯度，但不保证找到全局最优解。神经网络的损失函数是非凸的，反向传播只能保证找到局部最优。好在实践中，局部最优往往已经足够好。",
      },
      {
        title: "2. 链式法则：反向传播的数学基石",
        body: `链式法则是微积分中的基本法则，用于计算复合函数的导数。如果 y = f(g(x))，那么 dy/dx = df/dg × dg/dx。这看起来简单，但正是这个法则支撑了整个深度学习的优化过程。

在神经网络中，损失函数 L 是网络输出的函数，输出是最后一层激活的函数，激活是线性变换的函数，线性变换是权重的函数……这样一层层嵌套下去。链式法则告诉我们：要计算 L 对某一层权重的导数，只需要把从 L 到该权重路径上每一环节的导数乘起来。

具体来说，对于一个简单的两层网络 L = f(y), y = g(z), z = h(W)，我们有：dL/dW = dL/dy × dy/dz × dz/dW。反向传播就是按照这个公式，从右向左（从输出到输入）逐步计算和传递这些导数。

链式法则的威力在于复用。计算 dL/dz = dL/dy × dy/dz 这个中间结果，不仅可以用来求 dL/dW，还可以用来求 dL/d(上一层输出)。通过存储和复用这些中间导数，反向传播避免了大量的重复计算。`,
        mermaid: `graph TD
    A["损失 L"] --> B["dL/dŷ"]
    B --> C["dL/dz₂ = dL/dŷ × dŷ/dz₂"]
    C --> D["dL/dW₂ = dL/dz₂ × dz₂/dW₂"]
    C --> E["dL/da₁ = dL/dz₂ × dz₂/da₁"]
    E --> F["dL/dz₁ = dL/da₁ × da₁/dz₁"]
    F --> G["dL/dW₁ = dL/dz₁ × dz₁/dW₁"]
    class G s1
    class A s0
    classDef s0 fill:#7f1d1d,color:#f1f5f9
    classDef s1 fill:#064e3b,color:#f1f5f9`,
        code: [
          {
            lang: "python",
            code: `def backward_pass(probs, y_true, cache):
    """
    两层神经网络的反向传播（完整链式法则推导）
    
    前向: X → z1(W1,b1) → a1(ReLU) → z2(W2,b2) → probs(Softmax) → Loss
    反向: dLoss → dprobs → dz2 → dW2,db2,da1 → dz1 → dW1,db1
    """
    X, z1, a1, z2 = cache
    n = len(y_true)
    
    # ① dL/dz2：Softmax + CrossEntropy 的梯度
    dz2 = probs.copy()
    dz2[range(n), y_true] -= 1  # 减去真实标签的 one-hot
    dz2 /= n
    
    # ② dL/dW2 = a1^T × dz2
    dW2 = a1.T @ dz2
    # ③ dL/db2 = sum(dz2)
    db2 = np.sum(dz2, axis=0)
    
    # ④ dL/da1 = dz2 × W2^T
    da1 = dz2 @ W2.T
    
    # ⑤ dL/dz1 = da1 × ReLU'(z1)  (z1>0 时为 1，否则为 0)
    dz1 = da1 * (z1 > 0).astype(float)
    
    # ⑥ dL/dW1 = X^T × dz1
    dW1 = X.T @ dz1
    # ⑦ dL/db1 = sum(dz1)
    db1 = np.sum(dz1, axis=0)
    
    return {'dW1': dW1, 'db1': db1, 'dW2': dW2, 'db2': db2}

# 验证梯度
probs, cache = forward_pass(X, W1, b1, W2, b2)
grads = backward_pass(probs, y, cache)
for name, g in grads.items():
    print(f"{name} 梯度形状: {g.shape}, 均值: {g.mean():.6f}")`,
          },
          {
            lang: "python",
            code: `# 链式法则的手动推导（超简单例子）
def chain_rule_demo():
    """
    用一个极简单的例子演示链式法则：
    f(x) = (2x + 3)²
    令 u = 2x + 3, f = u²
    df/dx = df/du × du/dx = 2u × 2 = 4(2x+3)
    """
    x = 5.0
    u = 2 * x + 3  # u = 13
    f = u ** 2      # f = 169
    
    # 解析导数
    df_dx = 4 * (2 * x + 3)  # = 52
    
    # 数值验证
    eps = 1e-5
    f_plus = (2 * (x + eps) + 3) ** 2
    f_minus = (2 * (x - eps) + 3) ** 2
    numerical = (f_plus - f_minus) / (2 * eps)
    
    print(f"x = {x}")
    print(f"u = 2x+3 = {u}")
    print(f"f = u² = {f}")
    print(f"解析导数 df/dx = {df_dx}")
    print(f"数值导数 df/dx = {numerical:.6f}")
    print(f"误差: {abs(df_dx - numerical):.10f}")
    
    # 链式法则的"反向传播"视角
    print(f"\\n反向传播视角:")
    print(f"  df/du = 2u = {2*u}")
    print(f"  du/dx = 2")
    print(f"  df/dx = df/du × du/dx = {2*u} × 2 = {df_dx}")

chain_rule_demo()`,
          },
          {
            lang: "python",
            code: `# 梯度检查：验证反向传播是否正确
def gradient_check(X, y, W1, b1, W2, b2, eps=1e-5):
    """
    数值梯度检查：对比解析梯度和数值梯度
    相对误差 < 1e-7 说明反向传播实现正确
    """
    probs, cache = forward_pass(X, y, W1, b1, W2, b2)
    analytic_grads = backward_pass(probs, y, cache)
    
    max_rel_error = 0
    for name, analytic in analytic_grads.items():
        it = np.nditer(analytic, flags=['multi_index'])
        while not it.finished:
            idx = it.multi_index
            
            # 数值梯度
            if name == 'W1': param = W1
            elif name == 'b1': param = b1
            elif name == 'W2': param = W2
            else: param = b2
            
            old = param[idx]
            param[idx] = old + eps
            p1, _ = forward_pass(X, y, W1, b1, W2, b2)
            l1 = cross_entropy_loss(p1, y)
            param[idx] = old - eps
            p2, _ = forward_pass(X, y, W1, b1, W2, b2)
            l2 = cross_entropy_loss(p2, y)
            param[idx] = old
            
            numerical = (l1 - l2) / (2 * eps)
            analytic_val = analytic[idx]
            
            rel_error = abs(numerical - analytic_val) / (abs(numerical) + abs(analytic_val) + 1e-10)
            max_rel_error = max(max_rel_error, rel_error)
            it.iternext()
    
    print(f"最大相对误差: {max_rel_error:.2e}")
    print(f"{'✅ 反向传播正确！' if max_rel_error < 1e-7 else '❌ 有 bug！'}")

gradient_check(X[:5], y[:5], W1, b1, W2, b2)`,
          },
        ],
        table: {
          headers: ["常见运算", "前向计算", "反向梯度（dL/d输入）", "反向梯度（dL/d参数）"],
          rows: [
            ["线性: z = Wx+b", "矩阵乘法+偏置", "W^T · dz", "dz · x^T, sum(dz)"],
            ["ReLU: a = max(0,z)", "z>0 取 z，否则 0", "dz × (z>0)", "无参数"],
            ["Sigmoid: σ(z)", "1/(1+e^{-z})", "a(1-a) · dz", "无参数"],
            ["Softmax", "e^zi/Σe^zj", "p - y_onehot", "无参数"],
            ["交叉熵损失", "-Σy·log(p)", "p - y", "无参数"],
          ],
        },
        warning: "链式法则在实现时最容易出错的地方是矩阵维度。每一步都要检查：dz 的维度是否与 z 一致？dW 的维度是否与 W 一致？如果维度对不上，一定是某个矩阵乘法转置错了。",
      },
      {
        title: "3. 计算图：反向传播的工程实现",
        body: `计算图（Computational Graph）是反向传播在现代深度学习框架中的实现方式。它将整个神经网络的前向计算分解为一系列基本运算节点（如加法、乘法、矩阵乘法、激活函数等），然后用有向图连接这些节点。

计算图的每个节点都记录了自己的前向计算结果和对应的反向梯度函数。当需要计算梯度时，框架从损失节点开始，沿着图的反方向遍历每个节点，调用其反向函数计算局部梯度，并根据链式法则将梯度传递给上游节点。

PyTorch 使用动态计算图（Define-by-Run）：每次前向传播时即时构建计算图，反向传播完成后自动销毁。这种方式灵活直观，支持 Python 的控制流（if/for），调试也容易。TensorFlow 2.x 也采用了类似的 Eager Execution 模式。相比之下，早期 TensorFlow 1.x 使用静态计算图（Define-and-Run），先定义整个图结构再执行，虽然效率高但调试困难。

理解计算图的一个重要概念是"中间变量缓存"。在前向传播中，许多中间结果（如 ReLU 的输入 z1）在反向传播时需要用到。框架会自动缓存这些值，但这也意味着训练时的内存消耗比推理时大得多。`,
        mermaid: `graph TD
    A["x"] --> B["W·x"]
    B --> C["+ b"]
    C --> D["ReLU"]
    D --> E["输出 ŷ"]
    E --> F["Loss"]
    
    F -.->|"dz"| G["dL/db"]
    G -.->|"dW·x"| H["dL/dW"]
    H -.->|"da"| I["dL/dx"]
    class I s2
    class F s1
    class A s0
    classDef s0 fill:#1e3a5f,color:#f1f5f9
    classDef s1 fill:#7f1d1d,color:#f1f5f9
    classDef s2 fill:#064e3b,color:#f1f5f9`,
        code: [
          {
            lang: "python",
            code: `# 手写一个极简的自动微分引擎
class Tensor:
    """支持自动微分的张量"""
    def __init__(self, data, _children=(), _op=''):
        self.data = np.array(data, dtype=float)
        self.grad = np.zeros_like(self.data)
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op
    
    def __add__(self, other):
        other = other if isinstance(other, Tensor) else Tensor(other)
        out = Tensor(self.data + other.data, (self, other), '+')
        def _backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out
    
    def __mul__(self, other):
        other = other if isinstance(other, Tensor) else Tensor(other)
        out = Tensor(self.data * other.data, (self, other), '*')
        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out
    
    def relu(self):
        out = Tensor(np.maximum(0, self.data), (self,), 'ReLU')
        def _backward():
            self.grad += (self.data > 0) * out.grad
        out._backward = _backward
        return out
    
    def backward(self):
        topo = []
        visited = set()
        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)
        build(self)
        self.grad = np.ones_like(self.data)
        for node in reversed(topo):
            node._backward()

# 使用示例
x = Tensor(3.0)
w = Tensor(2.0)
b = Tensor(1.0)
y = w * x + b  # y = 2*3 + 1 = 7
y = y.relu()   # y = max(0, 7) = 7
y.backward()
print(f"y = {y.data}, dy/dw = {w.grad}, dy/dx = {x.grad}, dy/db = {b.grad}")`,
          },
          {
            lang: "python",
            code: `# PyTorch 计算图示例
try:
    import torch
    
    # 构建计算图
    x = torch.tensor(3.0, requires_grad=True)
    w = torch.tensor(2.0, requires_grad=True)
    b = torch.tensor(1.0, requires_grad=True)
    
    y = w * x + b
    z = torch.relu(y)
    loss = z ** 2  # 假设损失为输出的平方
    
    loss.backward()
    
    print(f"前向: x={x.item()}, w={w.item()}, b={b.item()}")
    print(f"y = wx+b = {y.item()}")
    print(f"z = ReLU(y) = {z.item()}")
    print(f"loss = z² = {loss.item()}")
    print(f"\\n梯度:")
    print(f"  d(loss)/dw = {w.grad.item()}")
    print(f"  d(loss)/dx = {x.grad.item()}")
    print(f"  d(loss)/db = {b.grad.item()}")
    
    # 验证: loss = (wx+b)² = (2*3+1)² = 49
    # d(loss)/dw = 2(wx+b) * x = 2*7*3 = 42
    # d(loss)/dx = 2(wx+b) * w = 2*7*2 = 28
    # d(loss)/db = 2(wx+b) * 1 = 2*7*1 = 14
    
except ImportError:
    print("PyTorch 未安装，跳过此示例")`,
          },
        ],
        table: {
          headers: ["框架", "计算图类型", "调试体验", "控制流支持", "性能优化"],
          rows: [
            ["PyTorch", "动态（即时构建）", "✅ 优秀", "✅ 原生支持", "✅ TorchScript 编译"],
            ["TensorFlow 2.x", "动态（@tf.function 可转静态）", "✅ 良好", "✅ 原生支持", "✅ Graph 模式优化"],
            ["JAX", "动态（即时编译）", "🟡 中等", "✅ 原生支持", "✅ XLA 编译优化"],
            ["MXNet", "动态/静态可选", "🟡 中等", "⚠️ 部分支持", "✅"],
            ["TensorFlow 1.x", "静态（预先定义）", "❌ 困难", "❌ 不支持", "✅ 图优化"],
          ],
        },
        tip: "调试技巧：当反向传播结果不对时，用 torch.autograd.gradcheck 或手写数值梯度检查来定位问题。90% 的反向传播 bug 都是矩阵维度不匹配或转置错误导致的。",
      },
      {
        title: "4. 梯度消失与梯度爆炸",
        body: `在深层神经网络中，反向传播面临两个经典问题：梯度消失（Gradient Vanishing）和梯度爆炸（Gradient Exploding）。这两个问题直接关系到网络能否有效训练。

梯度消失发生在梯度在反向传播过程中逐层相乘时不断变小，最终趋近于零。最典型的场景是使用 Sigmoid 激活函数的深层网络——Sigmoid 的导数最大值只有 0.25，当梯度经过几十层连乘后，会变成 0.25 的几十次方，一个极其微小的数。结果是：靠近输入层的参数几乎得不到更新，网络无法学习。

梯度爆炸则相反：当权重初始化过大或使用 RNN 处理长序列时，梯度在反向传播中逐层相乘不断变大，最终导致参数更新步长过大，损失函数发散。最直观的表现是：训练过程中 loss 突然变成 NaN。

解决这两个问题的方法已经相当成熟：使用 ReLU 系列激活函数（导数为 0 或 1，不缩小梯度）、合理的权重初始化（Xavier/He 初始化）、批归一化（BatchNorm）、梯度裁剪（Gradient Clipping）。这些技术的组合使得训练数百层甚至上千层的网络成为可能。`,
        mermaid: `graph TD
    A["深层网络反向传播"] --> B{"梯度传播"}
    
    B -->|"Sigmoid 导数 ≤ 0.25"| C["梯度逐层缩小"]
    C --> D["梯度消失"]
    D --> E["浅层参数不更新"]
    E --> F["网络无法学习"]
    
    B -->|"权重过大 / RNN"| G["梯度逐层放大"]
    G --> H["梯度爆炸"]
    H --> I["参数更新过大"]
    I --> J["Loss 变为 NaN"]
    
    D -.->|"ReLU + 正确初始化"| K["✅ 解决"]
    H -.->|"梯度裁剪 + BatchNorm"| K`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def sigmoid_grad(x):
    s = sigmoid(x)
    return s * (1 - s)

def gradient_vanishing_demo():
    """演示 Sigmoid 网络中的梯度消失"""
    # Sigmoid 导数的最大值
    print(f"Sigmoid 导数最大值: {sigmoid_grad(0):.4f} (在 x=0 处)")
    print(f"Sigmoid 导数(x=2): {sigmoid_grad(2):.4f}")
    print(f"Sigmoid 导数(x=5): {sigmoid_grad(5):.4f}")
    print()
    
    # 假设 20 层网络，每层 Sigmoid 导数平均 0.1
    layers = 20
    gradient_at_output = 1.0  # 输出层梯度为 1
    gradient_at_input = gradient_at_output * (0.1 ** layers)
    
    print(f"{layers} 层 Sigmoid 网络:")
    print(f"  输出层梯度: {gradient_at_output}")
    print(f"  输入层梯度: {gradient_at_input:.2e}")
    print(f"  缩小倍数: {1/gradient_at_input:.0e}")
    print()
    
    # 对比 ReLU
    print(f"ReLU 导数: 0 (z<0) 或 1 (z>0)")
    print(f"20 层 ReLU 网络（假设都激活）:")
    print(f"  输入层梯度: {1.0 ** 20} (不缩小！)")
    print(f"\\n这就是 ReLU 能训练深层网络的关键原因")

gradient_vanishing_demo()`,
          },
          {
            lang: "python",
            code: `import numpy as np

def gradient_exploding_demo():
    """演示 RNN 中的梯度爆炸"""
    np.random.seed(42)
    
    # 模拟 RNN 的隐藏状态转移: h_t = W @ h_{t-1}
    # 反向传播时梯度包含 W^T 的连乘
    seq_len = 50
    hidden_dim = 100
    
    # 大权重矩阵（特征值 > 1）
    W = np.random.randn(hidden_dim, hidden_dim) * 1.2
    W = (W + W.T) / 2  # 对称化
    eigvals = np.linalg.eigvalsh(W)
    print(f"权重矩阵最大特征值: {max(abs(eigvals)):.4f}")
    
    # 模拟梯度在时间步中的传播
    grad = np.ones(hidden_dim)
    print(f"\\n时间步{'梯度范数':>12}")
    print("-" * 20)
    for t in range(1, seq_len + 1):
        grad = W.T @ grad
        norm = np.linalg.norm(grad)
        if t <= 10 or t % 10 == 0:
            print(f"t={t:>3}  {norm:>12.2e}")
        if norm > 1e15:
            print(f"... t={t}: 梯度爆炸！范数超过 1e15")
            break
    
    print(f"\\n解决方案：梯度裁剪（Gradient Clipping）")

def gradient_clipping(grads, max_norm=1.0):
    """全局梯度裁剪"""
    total_norm = np.sqrt(sum(np.sum(g**2) for g in grads.values()))
    if total_norm > max_norm:
        scale = max_norm / total_norm
        return {k: g * scale for k, g in grads.items()}, total_norm, scale
    return grads, total_norm, 1.0

# 测试裁剪
grads = {'W1': np.random.randn(10, 10) * 5, 'W2': np.random.randn(10, 10) * 5}
clipped, orig_norm, scale = gradient_clipping(grads, max_norm=1.0)
print(f"原始范数: {orig_norm:.2f}")
print(f"裁剪后范数: {np.sqrt(sum(np.sum(g**2) for g in clipped.values())):.2f}")
print(f"缩放比例: {scale:.4f}")

gradient_exploding_demo()`,
          },
          {
            lang: "python",
            code: `# He 初始化 vs Xavier 初始化对梯度的影响
import numpy as np

def compare_initializations():
    """对比不同初始化方法对梯度传播的影响"""
    np.random.seed(42)
    
    def xavier_init(fan_in, fan_out):
        """Xavier 初始化（适合 Sigmoid/Tanh）"""
        limit = np.sqrt(6 / (fan_in + fan_out))
        return np.random.uniform(-limit, limit, (fan_in, fan_out))
    
    def he_init(fan_in, fan_out):
        """He 初始化（适合 ReLU）"""
        std = np.sqrt(2 / fan_in)
        return np.random.randn(fan_in, fan_out) * std
    
    n_layers = 30
    dim = 100
    x = np.random.randn(1, dim)
    
    for init_name, init_fn in [("Xavier", xavier_init), ("He", he_init)]:
        activations = [x]
        for i in range(n_layers):
            W = init_fn(dim, dim)
            z = activations[-1] @ W
            a = np.maximum(0, z)  # ReLU
            activations.append(a)
        
        # 统计激活值的方差变化
        variances = [np.var(a) for a in activations]
        print(f"{init_name} 初始化:")
        print(f"  输入方差: {variances[0]:.6f}")
        print(f"  第 5 层方差: {variances[5]:.6f}")
        print(f"  第 15 层方差: {variances[15]:.6f}")
        print(f"  第 30 层方差: {variances[-1]:.6f}")
        print(f"  趋势: {'✅ 稳定' if 0.1 < variances[-1] < 10 else '❌ 消失/爆炸'}")
        print()

compare_initializations()`,
          },
        ],
        table: {
          headers: ["问题", "原因", "表现", "解决方案"],
          rows: [
            ["梯度消失", "连乘小数、Sigmoid 饱和", "浅层参数不更新", "ReLU、He 初始化、残差连接"],
            ["梯度爆炸", "连乘大数、权重过大", "Loss 变 NaN", "梯度裁剪、BatchNorm、权重正则化"],
            ["死亡 ReLU", "负输入导致梯度为 0", "部分神经元永久死亡", "Leaky ReLU、减小学习率"],
            ["梯度不饱和", "输出层使用线性激活", "分类任务学习困难", "输出层用 Softmax+Sigmoid"],
          ],
        },
        warning: "梯度消失是深层网络训练失败的最常见原因。如果你的网络层数超过 10 层但训练 loss 几乎不下降，首先检查：① 是否用了 Sigmoid/Tanh 作为隐藏层激活？→ 改用 ReLU；② 权重初始化是否合适？→ 用 He 初始化。",
      },
      {
        title: "5. 优化器：如何利用梯度更新参数",
        body: `反向传播计算出梯度后，接下来的问题是如何利用这些梯度来更新参数。最朴素的方法是梯度下降：w = w - η × ∂L/∂w，其中 η 是学习率。但这只是起点，现代深度学习使用了更加精妙的优化器。

SGD（随机梯度下降）是最基础的方法，每次用一个小批量的数据计算梯度并更新参数。它的缺点是：在损失函数地形复杂时（比如有狭长的山谷），SGD 会来回震荡，收敛很慢。

Momentum（动量）在 SGD 的基础上引入了"惯性"的概念——不仅考虑当前梯度，还保留一部分上一次更新的方向。这就像一个小球从山坡滚下：即使当前坡度平缓，但由于有速度积累，它仍然会继续前进。Momentum 能有效减少震荡，加速收敛。

Adam（Adaptive Moment Estimation）是目前最常用的优化器，它结合了 Momentum 和 RMSProp 的优点：一方面用一阶矩（均值）估计梯度方向，另一方面用二阶矩（方差）自适应调整每个参数的学习率。Adam 的效果几乎在所有任务上都优于 vanilla SGD，是大多数场景的默认选择。`,
        mermaid: `graph TD
    A["反向传播得到梯度 g"] --> B{"选择优化器"}
    
    B --> C["SGD: w = w - ηg"]
    B --> D["SGD+Momentum"]
    B --> E["Adam"]
    
    C --> F["简单但可能震荡"]
    D --> D1["v = βv + g"]
    D1 --> D2["w = w - ηv"]
    D2 --> G["加速收敛"]
    
    E --> E1["m = β₁m + (1-β₁)g"]
    E1 --> E2["v = β₂v + (1-β₂)g²"]
    E2 --> E3["ŵ = w - ηm̂/(√v̂ + ε)"]
    E3 --> H["自适应学习率"]`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class Optimizers:
    """常用优化器的实现"""
    
    @staticmethod
    def sgd(params, grads, lr=0.01):
        """标准 SGD"""
        for p, g in zip(params, grads):
            p -= lr * g
    
    @staticmethod
    def momentum(params, grads, velocities, lr=0.01, beta=0.9):
        """SGD with Momentum"""
        for i, (p, g, v) in enumerate(zip(params, grads, velocities)):
            velocities[i] = beta * v + g
            p -= lr * velocities[i]
    
    @staticmethod
    def adam(params, grads, state, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
        """Adam 优化器"""
        if 't' not in state:
            state['t'] = 0
            state['m'] = [np.zeros_like(p) for p in params]
            state['v'] = [np.zeros_like(p) for p in params]
        state['t'] += 1
        
        for i, (p, g) in enumerate(zip(params, grads)):
            state['m'][i] = beta1 * state['m'][i] + (1 - beta1) * g
            state['v'][i] = beta2 * state['v'][i] + (1 - beta2) * g**2
            # 偏差校正
            m_hat = state['m'][i] / (1 - beta1 ** state['t'])
            v_hat = state['v'][i] / (1 - beta2 ** state['t'])
            p -= lr * m_hat / (np.sqrt(v_hat) + eps)

# 对比优化器在 Rosenbrock 函数上的表现
def rosenbrock(x, y):
    return (1 - x)2 + 100 * (y - x2)**2

def rosenbrock_grad(x, y):
    dx = -2*(1-x) - 400*x*(y-x**2)
    dy = 200*(y-x**2)
    return np.array([dx, dy])

def compare_optimizers():
    start = np.array([-1.0, 1.5])
    lr = 0.001
    steps = 5000
    
    # SGD
    pos = start.copy()
    for _ in range(steps):
        g = rosenbrock_grad(*pos)
        pos -= lr * g
    sgd_loss = rosenbrock(*pos)
    
    # Adam
    pos = start.copy()
    state = {}
    for _ in range(steps):
        g = rosenbrock_grad(*pos)
        AdamOptimizer = Optimizers()
        Optimizers.adam([pos], [g], state, lr=0.01)
    adam_loss = rosenbrock(*pos)
    
    print(f"Rosenbrock 函数优化对比:")
    print(f"  SGD:   最终位置 ({pos[0]:.4f}, {pos[1]:.4f}), loss = {sgd_loss:.6f}")
    print(f"  Adam:  最终位置 ({pos[0]:.4f}, {pos[1]:.4f}), loss = {adam_loss:.6f}")
    print(f"  最优解: (1.0, 1.0), loss = 0")

compare_optimizers()`,
          },
          {
            lang: "python",
            code: `# 学习率衰减策略
import numpy as np

def lr_schedules():
    """对比不同学习率衰减策略"""
    initial_lr = 0.1
    epochs = 100
    
    print(f"{'Epoch':>5} {'Step':>8} {'Exp':>8} {'Cosine':>8}")
    print("-" * 35)
    
    for epoch in range(0, epochs + 1, 10):
        # Step decay: 每 30 个 epoch 衰减 10 倍
        step_lr = initial_lr * (0.1 ** (epoch // 30))
        
        # Exponential decay
        exp_lr = initial_lr * (0.95 ** epoch)
        
        # Cosine annealing
        cosine_lr = initial_lr * 0.5 * (1 + np.cos(np.pi * epoch / epochs))
        
        print(f"{epoch:>5} {step_lr:>8.4f} {exp_lr:>8.4f} {cosine_lr:>8.4f}")
    
    print(f"\\n学习率策略选择:")
    print(f"  Step Decay: 简单有效，CV 任务常用")
    print(f"  Exponential: 平滑衰减，适合稳定训练")
    print(f"  Cosine: 目前最流行，Transformer 训练首选")
    print(f"  Warmup: 训练初期线性增长到峰值，再衰减")

lr_schedules()`,
          },
        ],
        table: {
          headers: ["优化器", "自适应学习率", "动量", "推荐场景", "默认学习率"],
          rows: [
            ["SGD", "❌", "❌", "需要精细调参的精度优先场景", "0.01~0.1"],
            ["SGD+Momentum", "❌", "✅", "CV 任务，配合学习率调度", "0.01~0.1"],
            ["AdaGrad", "✅ 累积", "❌", "稀疏特征（NLP）", "0.01"],
            ["RMSProp", "✅ 指数滑动", "❌", "RNN 训练", "0.001"],
            ["Adam", "✅ 一阶+二阶", "✅", "通用首选（默认）", "0.001~0.003"],
            ["AdamW", "✅ + 权重衰减", "✅", "Transformer 训练", "0.0001~0.001"],
          ],
        },
        tip: "实用建议：新项目先用 Adam（lr=0.001）跑起来。如果收敛没问题但精度不够，再切换到 SGD+Momentum 配合学习率调度做精细调优。Adam 适合快速迭代，SGD 适合追求极致精度。",
        warning: "Adam 对学习率非常敏感。Adam 的默认学习率 0.001 可能太大也可能太小，取决于任务。如果训练不稳定（loss 震荡），先尝试将学习率降低 10 倍。",
      },
      {
        title: "6. PyTorch 反向传播实战",
        body: `理论再漂亮，最终还是要落到代码上。PyTorch 是目前最流行的深度学习框架，它的 autograd 引擎自动处理了所有反向传播的细节——我们只需要定义前向计算，调用 loss.backward() 就能得到所有参数的梯度。

但"会用"和"理解"是两回事。理解 autograd 的工作原理，能帮你写出更高效的代码、更快地排查梯度问题、以及更好地调试模型。关键概念包括：requires_grad 标记哪些张量需要计算梯度、计算图在前向传播时动态构建、调用 backward() 后梯度存储在 .grad 属性中、以及每次 backward() 后需要手动 zero_grad() 清除旧梯度。

一个常见的陷阱是：如果在训练循环中不调用 optimizer.zero_grad()，梯度会累积而不是替换。这在某些特殊场景（如梯度累积训练大模型）是有意的技巧，但在大多数情况下是个 bug。另一个陷阱是：如果在张量上做了 in-place 操作（如 x += 1），会破坏计算图导致反向传播失败。`,
        mermaid: `graph TD
    A["定义模型 nn.Module"] --> B["前向传播 forward()"]
    B --> C["计算 loss"]
    C --> D["optimizer.zero_grad()"]
    D --> E["loss.backward()"]
    E --> F["optimizer.step()"]
    F --> G["更新参数"]
    G -.->|下一 batch| B`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.optim as optim

# 定义一个简单的两层神经网络
class SimpleNet(nn.Module):
    def __init__(self, input_dim=4, hidden_dim=8, num_classes=3):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, num_classes)
    
    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return x

# 创建模型、损失函数、优化器
model = SimpleNet()
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)

# 模拟训练
torch.manual_seed(42)
X = torch.randn(32, 4)
y = torch.randint(0, 3, (32,))

print("训练前参数示例:")
print(f"  fc1.weight 均值: {model.fc1.weight.data.mean():.6f}")

for epoch in range(100):
    optimizer.zero_grad()       # 清除旧梯度
    output = model(X)           # 前向传播
    loss = criterion(output, y) # 计算损失
    loss.backward()             # 反向传播
    optimizer.step()            # 更新参数
    
    if (epoch + 1) % 20 == 0:
        pred = output.argmax(dim=1)
        acc = (pred == y).float().mean().item()
        print(f"Epoch {epoch+1:>3}: loss={loss.item():.4f}, acc={acc:.2%}")

print(f"\\n训练后参数示例:")
print(f"  fc1.weight 均值: {model.fc1.weight.data.mean():.6f}")
print(f"  fc1.weight 梯度均值: {model.fc1.weight.grad.mean():.6f}")`,
          },
          {
            lang: "python",
            code: `# 理解 autograd 的计算图和梯度累积
import torch

def autograd_internals():
    """深入理解 PyTorch autograd 的机制"""
    
    # 1. requires_grad 的作用
    a = torch.tensor(2.0, requires_grad=True)
    b = torch.tensor(3.0)  # 不需要梯度
    c = a * b + 1  # c 需要梯度（因为 a 需要）
    c.backward()
    print(f"1. a.grad = {a.grad.item()}  (d/da (2a*3+1) = 3)")
    
    # 2. 梯度累积（不清零会叠加）
    x = torch.tensor(1.0, requires_grad=True)
    y = x ** 2
    y.backward()
    print(f"2. 第一次 backward: x.grad = {x.grad.item()}")
    y = x ** 2
    y.backward()
    print(f"   第二次 backward: x.grad = {x.grad.item()} (累积了!)")
    
    # 3. 无梯度上下文（推理时节省内存）
    model = nn.Linear(10, 5)
    with torch.no_grad():
        out = model(torch.randn(1, 10))
    print(f"3. no_grad 模式下输出.requires_grad = {out.requires_grad}")
    
    # 4. 查看计算图
    x = torch.tensor(2.0, requires_grad=True)
    y = torch.tensor(3.0, requires_grad=True)
    z = x * y + x ** 2
    print(f"4. z 的创建函数: {z.grad_fn}")
    print(f"   z 的输入: {z.grad_fn.next_functions}")
    
    # 5. detach: 从计算图中分离
    w = z.detach()
    print(f"5. z.detach().requires_grad = {w.requires_grad}")

autograd_internals()`,
          },
          {
            lang: "python",
            code: `# 梯度累积：用有限显存训练大 batch
import torch
import torch.nn as nn

def gradient_accumulation_demo():
    """
    当显存不够放一个大 batch 时，可以用梯度累积模拟
    将 batch=32 分成 4 个 sub-batch=8，累积 4 次梯度后更新一次
    """
    torch.manual_seed(42)
    
    model = nn.Linear(10, 2)
    criterion = nn.MSELoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
    
    X = torch.randn(32, 10)
    y = torch.randn(32, 2)
    
    # 方法 1: 直接大 batch
    optimizer.zero_grad()
    output1 = model(X)
    loss1 = criterion(output1, y)
    loss1.backward()
    w1_grad = model.weight.grad.clone()
    
    # 方法 2: 梯度累积（4 个 sub-batch）
    model.zero_grad()
    accum_steps = 4
    sub_batch = 32 // accum_steps
    for i in range(accum_steps):
        X_sub = X[i*sub_batch:(i+1)*sub_batch]
        y_sub = y[i*sub_batch:(i+1)*sub_batch]
        output = model(X_sub)
        loss = criterion(output, y_sub) / accum_steps  # 重要：除以累积步数
        loss.backward()
    
    w2_grad = model.weight.grad.clone()
    
    print("梯度累积验证:")
    print(f"  大 batch 梯度均值: {w1_grad.mean():.6f}")
    print(f"  累积梯度均值: {w2_grad.mean():.6f}")
    print(f"  差异: {abs(w1_grad.mean() - w2_grad.mean()):.8f}")
    print(f"  {'✅ 梯度累积正确' if abs(w1_grad.mean() - w2_grad.mean()) < 1e-6 else '❌ 有差异'}")

gradient_accumulation_demo()`,
          },
        ],
        table: {
          headers: ["操作", "作用", "何时使用", "常见错误"],
          rows: [
            ["loss.backward()", "计算所有参数的梯度", "每次训练迭代", "忘记调用"],
            ["optimizer.step()", "根据梯度更新参数", "backward() 之后", "在 zero_grad 之前调用"],
            ["optimizer.zero_grad()", "清除旧梯度", "每次 backward 之前", "不调用导致梯度累积"],
            ["torch.no_grad()", "关闭梯度计算", "推理/验证阶段", "训练时误用导致不学习"],
            ["tensor.detach()", "从计算图分离", "需要 numpy 转换时", "在训练中分离导致梯度断裂"],
          ],
        },
        warning: "PyTorch 训练循环的黄金顺序：zero_grad() → forward() → loss → backward() → step()。漏掉任何一步或顺序错误都会导致训练失败。建议把这个顺序刻在脑子里。",
      },
      {
        title: "7. 反向传播的调试与最佳实践",
        body: `即使理解了反向传播的所有理论，在实际训练中仍然会遇到各种问题：loss 不下降、梯度为 NaN、模型输出恒定值……这些问题需要通过系统化的调试方法来定位。

首先，永远从简单的模型开始调试。如果你在训练一个 50 层的 ResNet 时遇到问题，先试着训练一个 2 层的全连接网络。如果简单的模型能正常训练，说明数据和代码框架没问题，问题出在模型架构上。如果简单的模型都训练不了，说明数据预处理或训练代码有 bug。

其次，用一个小数据集过拟合测试。如果模型连 10 条数据都过拟合不了（训练 loss 降不下去），那问题一定出在代码上——可能是梯度计算错误、学习率太小、或者数据标注有问题。一个正确实现的模型应该能够轻松过拟合少量数据。

第三，监控梯度统计。在训练过程中定期打印梯度的均值、方差和最大绝对值。梯度全为零说明反向传播断了（可能是某个不可导操作）；梯度为 NaN 说明数值不稳定（可能是学习率太大或除法除零）；梯度持续增大说明梯度爆炸。`,
        mermaid: `graph TD
    A["训练出现问题"] --> B{"Loss 不下降?"}
    B -->|是| C["检查梯度是否为 0"]
    B -->|否| D{"Loss 为 NaN?"}
    
    C -->|"梯度=0"| E["检查 requires_grad"]
    C -->|"梯度正常"| F["检查学习率"]
    
    D -->|是| G["降低学习率"]
    D -->|否| H{"过拟合测试"}
    
    E --> I["检查计算图中断"]
    F --> I
    G --> I
    
    H -->|"无法过拟合"| J["代码有 bug"]
    H -->|"能过拟合"| K["增加数据或正则化"]
    
    J --> L["用小数据+简单模型调试"]
    K --> M["正常训练"]`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

def debug_training():
    """系统化的训练调试工具"""
    torch.manual_seed(42)
    
    model = nn.Sequential(
        nn.Linear(10, 20),
        nn.ReLU(),
        nn.Linear(20, 5)
    )
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    # 调试 1: 小数据过拟合测试
    X_small = torch.randn(5, 10)
    y_small = torch.randn(5, 5)
    
    print("=== 调试 1: 小数据过拟合测试 ===")
    for epoch in range(200):
        optimizer.zero_grad()
        output = model(X_small)
        loss = criterion(output, y_small)
        loss.backward()
        optimizer.step()
        if (epoch + 1) % 50 == 0:
            print(f"  Epoch {epoch+1}: loss = {loss.item():.6f}")
    
    if loss.item() < 0.01:
        print("  ✅ 能过拟合小数据，代码框架正确")
    else:
        print("  ❌ 无法过拟合小数据，检查代码 bug")
    
    # 调试 2: 梯度监控
    print("\\n=== 调试 2: 梯度监控 ===")
    X = torch.randn(32, 10)
    y = torch.randn(32, 5)
    optimizer.zero_grad()
    output = model(X)
    loss = criterion(output, y)
    loss.backward()
    
    for name, param in model.named_parameters():
        if param.grad is not None:
            g = param.grad
            print(f"  {name:>20}: mean={g.mean():.6f}, "
                  f"std={g.std():.6f}, max={g.abs().max():.6f}")
        else:
            print(f"  {name:>20}: ⚠️ 梯度为 None (requires_grad={param.requires_grad})")

debug_training()`,
          },
          {
            lang: "python",
            code: `# 常见反向传播 bug 排查清单
import torch
import torch.nn as nn

def common_backward_bugs():
    """演示和排查常见的反向传播 bug"""
    
    print("常见反向传播 Bug 清单:")
    print()
    
    # Bug 1: 忘记 requires_grad
    x = torch.tensor([1.0, 2.0])  # 默认 requires_grad=False
    w = torch.tensor([0.5, 0.5], requires_grad=True)
    y = (x * w).sum()
    y.backward()
    print(f"Bug 1: x.grad = {x.grad} (应为 None, 因为 x 没有 requires_grad)")
    print(f"       w.grad = {w.grad} ✅")
    print()
    
    # Bug 2: 在训练循环中忘记 zero_grad
    model = nn.Linear(2, 1)
    opt = torch.optim.SGD(model.parameters(), lr=0.01)
    x = torch.randn(1, 2)
    y = torch.randn(1, 1)
    
    opt.zero_grad()
    out1 = model(x)
    l1 = ((out1 - y) ** 2).mean()
    l1.backward()
    grad1 = model.weight.grad.clone()
    
    # 不 zero_grad 直接再来一次
    out2 = model(x)
    l2 = ((out2 - y) ** 2).mean()
    l2.backward()
    grad2 = model.weight.grad.clone()
    
    print(f"Bug 2: 第一次梯度 = {grad1[0,0]:.6f}")
    print(f"       累积后梯度 = {grad2[0,0]:.6f} (翻倍了!)")
    print(f"       修复: 每次 backward 前调用 optimizer.zero_grad()")
    print()
    
    # Bug 3: in-place 操作破坏计算图
    print("Bug 3: In-place 操作")
    x = torch.tensor([1.0], requires_grad=True)
    y = x * 2
    try:
        y.add_(1.0)  # in-place 操作
        z = y.sum()
        z.backward()
    except RuntimeError as e:
        print(f"  ❌ {str(e)[:60]}...")
        print(f"  修复: 使用 y = y + 1.0 代替 y.add_(1.0)")

common_backward_bugs()`,
          },
        ],
        table: {
          headers: ["问题", "症状", "原因", "修复方法"],
          rows: [
            ["Loss 不下降", "训练 loss 始终很高", "学习率太小/梯度为 0", "增大学习率/检查 requires_grad"],
            ["Loss 为 NaN", "第一步就变成 NaN", "学习率太大/数值不稳定", "降低学习率/加梯度裁剪"],
            ["Loss 不变化", "loss 完全不变", "计算图断裂/in-place 操作", "检查数据流/避免 in-place"],
            ["过拟合训练数据失败", "小数据集也降不下去", "代码有 bug", "逐步检查前向和反向"],
            ["验证 loss 上升", "训练 loss 降但验证升", "过拟合", "加正则化/早停/数据增强"],
          ],
        },
        tip: "终极调试技巧：当模型训练不出问题时，先用一组手动设置的输入数据（而不是真实数据）跑一遍训练循环。如果手动数据能正常训练，问题在数据预处理；如果手动数据也训练不了，问题在模型或优化代码。",
      },
    ],
  };
