import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-003",
    title: "RNN 与 LSTM：处理序列数据",
    category: "dl",
    tags: ["RNN", "LSTM", "序列建模"],
    summary: "理解循环神经网络的记忆机制与 LSTM 的门控设计",
    date: "2026-04-04",
    readTime: "24 min",
    level: "进阶",
    content: [
      {
        title: "1. 为什么需要循环神经网络？序列数据的特殊性",
        body: `在深度学习的众多任务中，序列数据是一类非常特殊的存在。语音信号、文本、时间序列、视频帧——它们的共同特征是：数据点之间存在先后顺序和依赖关系。

想象你在读一句话："我今天去了一家新开的餐厅，菜品很___。" 你能自然地填出"好吃"或"美味"，因为前面的上下文（餐厅、菜品）提供了线索。但如果这些词被打乱顺序随机给你，你就无法做出这个推断。这就是序列数据的核心挑战：当前时刻的理解依赖于历史信息。

传统的前馈神经网络（Feedforward Neural Network）无法处理这种依赖。它们假设每个输入样本是独立同分布的（i.i.d.），没有"记忆"能力。你给网络输入一句话的第一个词和最后一个词，它无法知道这两个词之间的关联。

循环神经网络（Recurrent Neural Network, RNN）的设计哲学非常优雅：让网络在时间步之间共享权重，并通过隐藏状态（Hidden State）传递历史信息。在每个时间步 t，RNN 接收当前输入 xₜ 和上一时刻的隐藏状态 hₜ₋₁，输出当前隐藏状态 hₜ 和可选的输出 yₜ。这种递归结构使得网络能够处理任意长度的序列。`,
        mermaid: `graph LR
    A["x₁"] --> B["RNN Cell"]
    B --> C["h₁"]
    C --> D["RNN Cell"]
    D --> E["h₂"]
    E --> F["RNN Cell"]
    F --> G["h₃ ... hₜ"]
    
    A2["x₂"] --> D
    A3["x₃"] --> F
    class G s5
    class E s4
    class C s3
    class A3 s2
    class A2 s1
    class A s0
    classDef s0 fill:#1e3a5f,color:#f1f5f9
    classDef s1 fill:#1e3a5f,color:#f1f5f9
    classDef s2 fill:#1e3a5f,color:#f1f5f9
    classDef s3 fill:#064e3b,color:#f1f5f9
    classDef s4 fill:#064e3b,color:#f1f5f9
    classDef s5 fill:#064e3b,color:#f1f5f9`,
        tip: "直觉理解：把 RNN 想象成一个有短期记忆的人。每读到一个新词，他结合当前的理解和之前的记忆来更新自己的认知。这就是 hₜ = f(xₜ, hₜ₋₁) 的含义。",
      },
      {
        title: "2. 标准 RNN 的数学推导与前向传播",
        body: `标准 RNN（Elman Network）的核心公式非常简洁：

hₜ = tanh(Wₕₕ · hₜ₋₁ + Wₓₕ · xₜ + bₕ)
yₜ = Wₕᵧ · hₜ + bᵧ

其中，Wₕₕ 是隐藏状态到隐藏状态的权重矩阵（"记忆"的权重），Wₓₕ 是输入到隐藏状态的权重矩阵（"感知"的权重），Wₕᵧ 是隐藏状态到输出的权重矩阵。

**关键设计**：Wₕₕ 在所有时间步共享。这意味着无论序列有多长，RNN 使用的参数量是固定的。这与将每个时间步当作独立输入的全连接网络形成鲜明对比——后者参数量随序列长度线性增长。

激活函数的选择也很重要。RNN 通常使用 tanh 而非 ReLU 作为隐藏状态的激活函数，原因有二：tanh 的输出范围是 [-1, 1]，这限制了隐藏状态不会无限增长（稳定性）；同时 tanh 在零点附近近似线性，保留了梯度信息。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class VanillaRNN:
    """从零实现标准 RNN"""
    
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        self.hidden_dim = hidden_dim
        # Xavier 初始化（对于 tanh 激活很重要）
        scale_hh = np.sqrt(2.0 / (hidden_dim + hidden_dim))
        scale_xh = np.sqrt(2.0 / (input_dim + hidden_dim))
        self.W_hh = np.random.randn(hidden_dim, hidden_dim) * scale_hh
        self.W_xh = np.random.randn(hidden_dim, input_dim) * scale_xh
        self.b_h = np.zeros(hidden_dim)
        self.W_hy = np.random.randn(output_dim, hidden_dim) * np.sqrt(2.0 / (hidden_dim + output_dim))
        self.b_y = np.zeros(output_dim)
    
    def forward(self, sequence: np.ndarray) -> tuple:
        """前向传播：处理整个序列
        Args:
            sequence: shape (seq_len, input_dim)
        Returns:
            outputs: shape (seq_len, output_dim)
            hidden_states: shape (seq_len + 1, hidden_dim)
        """
        seq_len = sequence.shape[0]
        hidden_states = [np.zeros(self.hidden_dim)]  # h_0 = 0
        outputs = []
        
        for t in range(seq_len):
            x_t = sequence[t]
            h_prev = hidden_states[-1]
            # 核心公式: h_t = tanh(W_hh @ h_{t-1} + W_xh @ x_t + b_h)
            h_t = np.tanh(self.W_hh @ h_prev + self.W_xh @ x_t + self.b_h)
            hidden_states.append(h_t)
            # 输出: y_t = W_hy @ h_t + b_y
            y_t = self.W_hy @ h_t + self.b_y
            outputs.append(y_t)
        
        return np.array(outputs), np.array(hidden_states)
    
    def last_output(self, sequence: np.ndarray) -> np.ndarray:
        """只返回最后一个时间步的输出（序列分类任务常用）"""
        outputs, _ = self.forward(sequence)
        return outputs[-1]

# 测试
rnn = VanillaRNN(input_dim=10, hidden_dim=32, output_dim=5)
seq = np.random.randn(20, 10)  # 20 步，每步 10 维
outputs, states = rnn.forward(seq)
print(f"输入序列长度: {seq.shape[0]}")
print(f"输出形状: {outputs.shape}")   # (20, 5)
print(f"隐藏状态形状: {states.shape}")  # (21, 32) 包含初始 h_0`,
          },
        ],
      },
      {
        title: "3. 梯度消失问题：RNN 的致命缺陷",
        body: `理论上，RNN 能处理任意长度的序列。但实际上，标准 RNN 很难"记住"很久之前的信息。这就是著名的梯度消失（Vanishing Gradient）问题。

让我们通过反向传播来分析原因。RNN 的损失函数 L 对 Wₕₕ 的梯度需要链式法则跨越多个时间步：

∂L/∂Wₕₕ = Σₜ (∂L/∂hₜ) · (∂hₜ/∂Wₕₕ)

其中，∂hₜ/∂hₖ（t > k）涉及 t-k 次矩阵连乘：

∂hₜ/∂hₖ = Πⱼ₌ₖ₊₁ᵗ diag(tanh'(zⱼ)) · Wₕₕ

问题出在这个连乘上。tanh 的导数范围是 (0, 1]，且大部分区域远小于 1。假设平均导数为 0.5，那么 10 步之后的梯度贡献就是 0.5¹⁰ ≈ 0.001——几乎消失了。

这导致什么后果？RNN 只能学习短期依赖（通常不超过 5-10 步）。对于需要长距离依赖的任务（如理解长文档、翻译长句子），标准 RNN 几乎无能为力。

有趣的是，也存在梯度爆炸（Exploding Gradient）问题——当 Wₕₕ 的特征值大于 1 时，连乘会导致梯度指数级增长，训练不稳定。梯度爆炸可以用梯度裁剪（Gradient Clipping）解决，但梯度消失需要架构级的创新。`,
        code: [
          {
            lang: "python",
            code: `# 数值演示：为什么 RNN 的梯度会消失
import numpy as np

def demonstrate_gradient_vanishing(seq_length=20):
    """数值演示 RNN 反向传播中的梯度消失"""
    tanh_deriv_avg = 0.5
    W_hh_norm = 0.8  # W_hh 的典型谱范数
    decay_factor = tanh_deriv_avg * W_hh_norm
    
    print(f"每步梯度衰减因子: {decay_factor:.4f}")
    print(f"\n时间步 | 相对梯度大小 | 衰减程度")
    print("-" * 40)
    
    for t in range(1, seq_length + 1):
        relative_gradient = decay_factor ** t
        emoji = "🟢" if relative_gradient > 0.01 else "🟡" if relative_gradient > 0.0001 else "🔴"
        print(f"  t={t:2d}   | {relative_gradient:.6e} | {emoji}")
    
    print(f"\n结论：{seq_length} 步后，梯度只剩初始的 {decay_factor**seq_length:.2e}")
    print("这就是为什么 RNN 很难学习长距离依赖。")

def demonstrate_gradient_clipping():
    """演示梯度裁剪如何解决梯度爆炸"""
    np.random.seed(42)
    norms_no_clip = np.random.lognormal(mean=0, sigma=2, size=100)
    max_norm = 5.0
    clipped = np.minimum(norms_no_clip, max_norm)
    
    print("梯度裁剪效果：")
    print(f"  裁剪前 | 最大值: {norms_no_clip.max():.2f}, 均值: {norms_no_clip.mean():.2f}")
    print(f"  裁剪后 | 最大值: {clipped.max():.2f}, 均值: {clipped.mean():.2f}")
    print(f"  被裁剪的比例: {(norms_no_clip > max_norm).mean() * 100:.1f}%")

demonstrate_gradient_vanishing()
print()
demonstrate_gradient_clipping()`,
          },
        ],
        table: {
          headers: ["问题", "原因", "影响", "解决方案"],
          rows: [
            ["梯度消失", "tanh' × W 连乘 < 1", "无法学习长距离依赖", "LSTM/GRU 门控机制"],
            ["梯度爆炸", "W 的谱范数过大", "训练不稳定、NaN", "梯度裁剪（Gradient Clipping）"],
            ["短期记忆", "隐藏状态容量有限", "只能记住最近几步", "增大 hidden_dim（有限效果）"],
          ],
        },
        warning: "标准 RNN 在 2026 年已经很少用于实际项目。它的教学价值在于让你理解序列建模的基本思想，但实际工程中应该使用 LSTM、GRU 或 Transformer。",
      },
      {
        title: "4. LSTM：门控机制解决梯度消失",
        body: `LSTM（Long Short-Term Memory）是 Hochreiter & Schmidhuber（1997）提出的划时代架构。它的核心创新是"门控机制"（Gating Mechanism）——通过精心设计的门来控制信息的流动，从而解决梯度消失问题。

LSTM 引入了三个门和一个细胞状态：

遗忘门（Forget Gate）：决定从细胞状态中丢弃什么信息。它读取 hₜ₋₁ 和 xₜ，输出一个 0 到 1 之间的向量 fₜ，与细胞状态 Cₜ₋₁ 逐元素相乘。fₜ = 0 表示完全遗忘，fₜ = 1 表示完全保留。

输入门（Input Gate）：决定向细胞状态中添加什么新信息。包含两部分：iₜ 决定更新的幅度（sigmoid），C̃ₜ 是候选值（tanh）。

输出门（Output Gate）：决定基于细胞状态输出什么。oₜ 决定输出的幅度，hₜ = oₜ ⊙ tanh(Cₜ)。

LSTM 的精髓在于细胞状态 Cₜ 的更新方式：Cₜ = fₜ ⊙ Cₜ₋₁ + iₜ ⊙ C̃ₜ。当 fₜ ≈ 1 且 iₜ ≈ 0 时，Cₜ ≈ Cₜ₋₁——信息无损地流过时间步。这条"高速公路"（Constant Error Carousel）让梯度可以几乎无衰减地反向传播，从根本上解决了梯度消失问题。`,
        mermaid: `graph TD
    X["输入 xₜ"] --> C["Concat xₜ 和 hₜ₋₁"]
    H["hₜ₋₁"] --> C
    
    C --> F["遗忘门 fₜ
sigmoid"]
    C --> I["输入门 iₜ
sigmoid"]
    C --> N["候选值 C̃ₜ
tanh"]
    C --> O["输出门 oₜ
sigmoid"]
    
    F --> M1["⊙ 逐元素乘"]
    C_prev["Cₜ₋₁"] --> M1
    M1 --> A["+ 逐元素加"]
    I --> M2["⊙"]
    N --> M2
    M2 --> A
    A --> C_curr["Cₜ 细胞状态"]
    
    C_curr --> T["tanh"]
    T --> M3["⊙"]
    O --> M3
    M3 --> H_out["hₜ 输出"]
    class N s5
    class O s4
    class I s3
    class F s2
    class H_out s1
    class C_curr s0
    classDef s0 fill:#78350f,color:#f1f5f9
    classDef s1 fill:#064e3b,color:#f1f5f9
    classDef s2 fill:#1e3a5f,color:#f1f5f9
    classDef s3 fill:#1e3a5f,color:#f1f5f9
    classDef s4 fill:#1e3a5f,color:#f1f5f9
    classDef s5 fill:#5b21b6,color:#f1f5f9`,
        code: [
          {
            lang: "python",
            code: `class LSTM:
    """从零实现 LSTM——理解门控机制"""
    
    def __init__(self, input_dim: int, hidden_dim: int):
        self.hidden_dim = hidden_dim
        self.W_f = np.random.randn(hidden_dim, input_dim + hidden_dim) * 0.1
        self.b_f = np.ones(hidden_dim)  # 初始偏置为 1，让遗忘门初始"不遗忘"
        self.W_i = np.random.randn(hidden_dim, input_dim + hidden_dim) * 0.1
        self.b_i = np.zeros(hidden_dim)
        self.W_c = np.random.randn(hidden_dim, input_dim + hidden_dim) * 0.1
        self.b_c = np.zeros(hidden_dim)
        self.W_o = np.random.randn(hidden_dim, input_dim + hidden_dim) * 0.1
        self.b_o = np.zeros(hidden_dim)
    
    def forward(self, sequence: np.ndarray):
        """LSTM 前向传播"""
        seq_len = sequence.shape[0]
        h = np.zeros(self.hidden_dim)
        c = np.zeros(self.hidden_dim)
        hidden_states = [h.copy()]
        cell_states = [c.copy()]
        
        for t in range(seq_len):
            x = sequence[t]
            combined = np.concatenate([h, x])
            # 遗忘门
            f = self._sigmoid(self.W_f @ combined + self.b_f)
            # 输入门
            i = self._sigmoid(self.W_i @ combined + self.b_i)
            # 候选细胞状态
            c_tilde = np.tanh(self.W_c @ combined + self.b_c)
            # 输出门
            o = self._sigmoid(self.W_o @ combined + self.b_o)
            # 更新细胞状态（关键！）
            c = f * c + i * c_tilde
            # 更新隐藏状态
            h = o * np.tanh(c)
            hidden_states.append(h.copy())
            cell_states.append(c.copy())
        
        return np.array(hidden_states), np.array(cell_states)
    
    @staticmethod
    def _sigmoid(x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))

# 演示
lstm = LSTM(input_dim=10, hidden_dim=32)
seq = np.random.randn(50, 10)
h_states, c_states = lstm.forward(seq)
print(f"隐藏状态形状: {h_states.shape}")
print(f"细胞状态最终值范围: [{c_states[-1].min():.3f}, {c_states[-1].max():.3f}]")
print(f"隐藏状态最终值范围: [{h_states[-1].min():.3f}, {h_states[-1].max():.3f}]")`,
          },
        ],
      },
      {
        title: "5. GRU 与 LSTM 对比",
        body: `GRU（Gated Recurrent Unit）由 Cho 等人（2014）提出，是 LSTM 的简化版本。它将 LSTM 的四个门简化为两个：更新门（Update Gate）和重置门（Reset Gate）。

更新门 zₜ 融合了 LSTM 中遗忘门和输入门的功能——它同时决定保留多少旧信息和添加多少新信息。重置门 rₜ 决定忽略多少过去的隐藏状态。

GRU 的优势：参数更少（训练更快）、在中小数据集上效果与 LSTM 相当、实现更简单。在许多实际任务中，GRU 和 LSTM 的性能差异很小（通常 < 1%），但 GRU 训练速度更快。`,
        table: {
          headers: ["特性", "标准 RNN", "LSTM", "GRU"],
          rows: [
            ["门数量", "无", "3个（遗忘/输入/输出）", "2个（更新/重置）"],
            ["参数量", "最少", "最多（~4x RNN）", "中等（~3x RNN）"],
            ["长距离依赖", "很差", "优秀", "良好"],
            ["训练速度", "最快", "最慢", "中等"],
            ["记忆容量", "低", "高（细胞状态 + 隐藏状态）", "中（仅隐藏状态）"],
            ["2026 年使用频率", "极少", "中等", "中等"],
          ],
        },
        list: [
          "选择建议：需要最强记忆能力 → LSTM；追求效率 → GRU；教学/理解 → 从标准 RNN 开始",
          "在 Transformer 出现后，RNN 家族在 NLP 中基本被取代，但在时间序列预测、音频处理等领域仍有重要地位",
          'LSTM 的细胞状态是一条"信息高速公路"，让长期依赖成为可能',
          "现代实践中，RNN/LSTM/GRU 常用于 Transformer 不适合的场景：流式处理（需要逐 token 输出）、低延迟推理、资源受限设备",
        ],
      },
      {
        title: "6. RNN 家族的实际应用场景",
        body: `尽管 **Transformer** 在 NLP 领域占据主导地位，RNN 家族在以下场景中仍然不可替代。

**时间序列预测**：股票价格、天气预测、销售预测等场景中，LSTM 和 GRU 仍然是主流选择。原因是时间序列数据通常具有强烈的时间依赖性，且数据量不足以训练大型 Transformer。LSTM 的门控机制天然适合捕捉时间序列中的趋势和周期性模式。

**语音识别**：虽然端到端的 Transformer 模型（如 Whisper）在语音识别上表现出色，但流式语音识别（实时转写）仍然依赖 RNN 架构，因为 RNN 可以逐帧处理输入，而 Transformer 需要完整的上下文窗口。

**音乐生成**：音乐的时序特性使其非常适合 RNN 建模。LSTM 可以学习音乐的节奏、和弦进行和旋律模式，生成连贯的音乐片段。`,
        code: [
          {
            lang: "python",
            code: `# 用 LSTM 进行时间序列预测
import numpy as np

class TimeSeriesPredictor:
    """用 LSTM 做时间序列预测"""
    
    def __init__(self, seq_len: int = 60, feature_dim: int = 1, hidden_dim: int = 64):
        self.seq_len = seq_len
        self.lstm = LSTM(input_dim=feature_dim, hidden_dim=hidden_dim)
        self.W_out = np.random.randn(1, hidden_dim) * 0.1
        self.b_out = np.zeros(1)
    
    def create_sequences(self, data: np.ndarray) -> tuple:
        """将时间序列转换为监督学习格式"""
        X, y = [], []
        for i in range(len(data) - self.seq_len):
            X.append(data[i:i + self.seq_len])
            y.append(data[i + self.seq_len])
        return np.array(X), np.array(y)
    
    def predict_next(self, history: np.ndarray) -> float:
        """基于历史序列预测下一个值"""
        seq = history[-self.seq_len:]
        h_states, _ = self.lstm.forward(seq)
        h_last = h_states[-1]
        return float(self.W_out @ h_last + self.b_out)
    
    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> dict:
        predictions = [self.predict_next(seq.flatten()) for seq in X_test]
        predictions = np.array(predictions).flatten()
        mse = np.mean((predictions - y_test) ** 2)
        mae = np.mean(np.abs(predictions - y_test))
        return {"MSE": round(float(mse), 6), "MAE": round(float(mae), 6)}

# 生成模拟时间序列（带趋势和季节性）
np.random.seed(42)
n_points = 1000
t = np.arange(n_points)
trend = 0.01 * t
seasonality = 10 * np.sin(2 * np.pi * t / 50)
noise = np.random.randn(n_points) * 2
series = trend + seasonality + noise

model = TimeSeriesPredictor(seq_len=60, hidden_dim=64)
X, y = model.create_sequences(series.reshape(-1, 1))
print(f"训练序列数: {X.shape[0]}")
print(f"序列形状: {X[0].shape} -> 预测单值")`,
          },
        ],
        tip: "在 2026 年的实际工程中，如果你做 NLP，优先选择 Transformer；如果你做时间序列预测，LSTM/GRU 仍然是可靠选择；如果你需要流式处理（低延迟逐 token 输出），RNN 架构有天然优势。",
      },
      {
        title: "7. 双向 RNN 与 Seq2Seq 架构",
        body: `标准 RNN 只能从前往后处理序列，这意味着在时间步 t，模型只能看到过去的信息。但在很多任务中，未来的信息同样重要。

双向 RNN（Bidirectional RNN, Bi-RNN）同时运行两个 RNN：一个正向（从前往后）、一个反向（从后往前），然后在每个时间步将两个方向的隐藏状态拼接起来。这使得模型在每个位置都能同时利用过去和未来的上下文。Bi-LSTM 和 Bi-GRU 是双向架构的最常见实现。

Seq2Seq（Sequence-to-Sequence）是 RNN 家族中最有影响力的架构之一。它由两个 RNN 组成：编码器（Encoder）读取整个输入序列，将最后一个时间步的隐藏状态作为"语义向量"（Context Vector）；解码器（Decoder）从这个语义向量开始，逐步生成输出序列。

Seq2Seq 的核心瓶颈在于语义向量——编码器必须将整个输入序列的信息压缩到一个固定长度的向量中。这就像让一个人听完一本小说然后用一句话总结——信息损失不可避免。注意力机制（Attention）正是为了解决这个问题而提出的：让解码器在每一步都能回头查看编码器所有时间步的隐藏状态，而不是只依赖一个固定向量。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np

class BiRNN:
    """双向 RNN——同时利用过去和未来信息"""
    
    def __init__(self, input_dim: int, hidden_dim: int):
        self.hidden_dim = hidden_dim
        # 正向和反向 RNN 权重
        scale = np.sqrt(2.0 / (input_dim + hidden_dim))
        self.fwd_W_hh = np.random.randn(hidden_dim, hidden_dim) * 0.1
        self.fwd_W_xh = np.random.randn(hidden_dim, input_dim) * scale
        self.fwd_b_h = np.zeros(hidden_dim)
        self.bwd_W_hh = np.random.randn(hidden_dim, hidden_dim) * 0.1
        self.bwd_W_xh = np.random.randn(hidden_dim, input_dim) * scale
        self.bwd_b_h = np.zeros(hidden_dim)
    
    def _forward_pass(self, sequence, W_hh, W_xh, b_h):
        h = np.zeros(self.hidden_dim)
        states = []
        for t in range(sequence.shape[0]):
            h = np.tanh(W_hh @ h + W_xh @ sequence[t] + b_h)
            states.append(h.copy())
        return np.array(states)
    
    def forward(self, sequence):
        # 正向
        fwd = self._forward_pass(sequence, self.fwd_W_hh, self.fwd_W_xh, self.fwd_b_h)
        # 反向（翻转序列）
        bwd = self._forward_pass(sequence[::-1], self.bwd_W_hh, self.bwd_W_xh, self.bwd_b_h)
        bwd = bwd[::-1]  # 翻转回来对齐时间步
        # 拼接
        return np.concatenate([fwd, bwd], axis=-1)

# 演示
bi_rnn = BiRNN(input_dim=10, hidden_dim=16)
seq = np.random.randn(8, 10)
out = bi_rnn.forward(seq)
print(f"输入: {seq.shape} -> 双向输出: {out.shape}")
print(f"(每个位置 = 前向16维 + 后向16维 = 32维)")`,
          },
        ],
        table: {
          headers: ["架构", "信息流", "适用任务", "参数量", "并行能力"],
          rows: [
            ["单向 RNN", "从前到后", "语言模型、因果预测", "最少", "❌ 顺序"],
            ["双向 RNN", "双向同时", "命名实体识别、情感分析", "2× 单向", "❌ 顺序"],
            ["Seq2Seq", "编码→解码", "机器翻译、文本摘要", "2× 单向 + 输出层", "编码器可并行"],
            ["Seq2Seq + Attention", "编码 + 注意力解码", "长序列翻译、对话", "更多（注意力权重）", "编码器可并行"],
          ],
        },
        mermaid: `graph LR
    subgraph "编码器"
        A1["x₁"] --> E1["Encoder RNN"]
        A2["x₂"] --> E2["Encoder RNN"]
        A3["xₙ"] --> E3["Encoder RNN"]
        E1 --> H1["h₁"]
        E2 --> H2["h₂"]
        E3 --> H3["hₙ"]
    end
    
    H1 & H2 & H3 --> C["所有隐藏状态"]
    C --> D["注意力机制"]
    
    subgraph "解码器"
        D --> Y1["ŷ₁"]
        D --> Y2["ŷ₂"]
        D --> Y3["ŷₘ"]
    end
    class D s1
    class C s0
    classDef s0 fill:#78350f,color:#f1f5f9
    classDef s1 fill:#064e3b,color:#f1f5f9`,
        warning: "双向 RNN 不能用于需要因果推理的场景（如实时语音识别），因为它需要看到未来信息。在流式应用中，只能使用单向 RNN。",
      },
    ],
  };
