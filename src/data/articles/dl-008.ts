import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-008",
    title: "损失函数大全：从 MSE 到 Focal Loss",
    category: "dl",
    tags: ["损失函数", "分类", "回归"],
    summary: "系统梳理深度学习中的常用损失函数及其适用场景",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 损失函数的核心作用",
            body: `损失函数（Loss Function）是深度学习训练的「指南针」——它量化了模型预测与真实标签之间的差距，为梯度下降提供优化方向。没有损失函数，模型就不知道该往哪个方向更新参数。从数学角度看，损失函数 L(y, ŷ) 将预测值 ŷ 和真实值 y 映射为一个标量，训练的目标就是最小化这个标量在所有训练样本上的期望值。

损失函数的选择直接决定了模型的学习行为。同一个模型架构，使用不同的损失函数，可能学到完全不同的特征表示。例如在目标检测中，使用 MSE 作为边界框回归损失会导致模型对异常值过度敏感，而改用 Smooth L1 损失则能稳健地处理离群样本。在类别不平衡的分类任务中，标准交叉熵会让模型偏向多数类，而 Focal Loss 通过调制因子让模型关注难以分类的少数类样本。

理解损失函数不仅是「选一个 API 调用」那么简单——你需要理解每个损失函数的数学性质（凸性、可微性、梯度行为）、对数据分布的假设，以及它在反向传播中产生的梯度信号特征。`,
            code: [
                { lang: "python", code: `import numpy as np

# 损失函数：预测与真实之间的桥梁
def visualize_loss_landscape():
    """可视化损失函数的优化地形"""
    def quadratic_loss(w):
        return (w - 3) ** 2 + 2

    def rosenbrock(x, y):
        return (1 - x)  2 + 100 * (y - x  2) ** 2

    # 单变量损失函数（如 MSE 在单层线性模型中）
    w_range = np.linspace(-5, 10, 100)
    losses = [quadratic_loss(w) for w in w_range]
    min_w = w_range[np.argmin(losses)]
    print(f"最小损失点: w = {min_w:.2f}")

    # 多变量损失函数（更复杂的优化地形）
    x = np.linspace(-2, 2, 50)
    y = np.linspace(-1, 3, 50)
    X, Y = np.meshgrid(x, y)
    Z = rosenbrock(X, Y)
    print(f"Rosenbrock 最小值在 (1, 1)，值为 0")

visualize_loss_landscape()` },
                { lang: "python", code: `import torch
import torch.nn as nn

# PyTorch 中的损失函数层次结构
print("=== PyTorch 损失函数分类 ===")

# 回归损失
regression_losses = ["MSELoss", "L1Loss", "SmoothL1Loss", "HuberLoss"]
print(f"回归: {regression_losses}")

# 分类损失
classification_losses = ["CrossEntropyLoss", "BCELoss", "BCEWithLogitsLoss", "NLLLoss"]
print(f"分类: {classification_losses}")

# 高级损失
advanced_losses = ["FocalLoss (torchvision)", "TripletMarginLoss", "ContrastiveLoss", "CTCLoss"]
print(f"高级: {advanced_losses}")

# 损失函数 vs 评估指标的区别
# 损失函数：必须可微，用于梯度反向传播
# 评估指标：可以不可微，用于衡量模型好坏
model = nn.Linear(10, 2)
x = torch.randn(5, 10)
y = torch.tensor([0, 1, 0, 1, 0])

loss_fn = nn.CrossEntropyLoss()  # 可微 → 用于训练
output = model(x)
loss = loss_fn(output, y)
loss.backward()  # 梯度可以反向传播` },
            ],
            table: {
                headers: ["特性", "损失函数", "评估指标"],
                rows: [
                    ["目的", "指导参数更新", "衡量模型性能"],
                    ["可微性要求", "必须可微", "可以不可微"],
                    ["使用阶段", "训练时", "验证/测试时"],
                    ["例子", "交叉熵/MSE", "准确率/F1/AUC"],
                    ["对异常值敏感", "取决于具体函数", "通常更稳健"],
                ],
            },
            mermaid: `graph TD
    A["模型预测 ŷ"] --> B["损失函数 L(y, ŷ)"]
    B --> C["标量损失值"]
    C --> D["梯度 ∂L/∂θ"]
    D --> E["反向传播"]
    E --> F["参数更新 θ = θ - η·∂L/∂θ"]
    F --> A
    G["评估指标"] -. "不参与训练" .-> H["准确率/F1/AUC"]
    class H s1
    class B s0
    classDef s0 fill:#14532d
    classDef s1 fill:#713f12`,
            tip: "选择损失函数的第一原则：匹配你的任务类型。回归任务用回归损失，分类任务用分类损失，不要混用。一个模型中也可以组合多个损失函数（多任务学习）。",
            warning: "损失函数的值本身没有绝对意义——它只在与自身历史对比时才有意义。不同损失函数的数值范围差异巨大，不要跨损失函数比较数值大小。",
        },
        {
            title: "2. 回归损失：MSE、MAE、Huber 与 Smooth L1",
            body: `回归任务的目标是预测连续值，回归损失衡量预测值与真实值之间的数值差距。MSE（均方误差）是最经典的回归损失：L = (1/n) Σ(y_i - ŷ_i)²。MSE 的梯度为 2(y - ŷ)，误差越大梯度越大——这既是优点也是缺点。优点在于它对大误差给予更大的惩罚，推动模型快速修正严重错误；缺点在于它对异常值极度敏感，一个极端离群点就能把模型拉偏。

MAE（平均绝对误差）：L = (1/n) Σ|y_i - ŷ_i|。MAE 的梯度恒为 ±1，不受误差大小影响。这使得 MAE 对异常值更加鲁棒——无论误差是 1 还是 1000，梯度都是 1。但恒定的梯度也意味着 MAE 在接近最优解时收敛较慢，且在零点不可微（实际实现中用次梯度处理）。

Huber Loss和Smooth L1是 MSE 和 MAE 的折中方案。它们在误差小时使用 MSE（保证零点可微且收敛快），在误差大时使用 MAE（限制梯度上界，对异常值鲁棒）。两者的区别在于过渡点：Huber Loss 的过渡点是超参数 δ，而 Smooth L1 固定在 δ=1。Smooth L1 在 Faster R-CNN 等目标检测模型中被广泛使用。`,
            code: [
                { lang: "python", code: `import numpy as np

def mse_loss(y_true, y_pred):
    """均方误差：对大误差敏感"""
    return np.mean((y_true - y_pred) ** 2)

def mae_loss(y_true, y_pred):
    """平均绝对误差：对异常值鲁棒"""
    return np.mean(np.abs(y_true - y_pred))

def huber_loss(y_true, y_pred, delta=1.0):
    """Huber Loss：MSE 和 MAE 的平滑折中"""
    error = y_true - y_pred
    is_small = np.abs(error) <= delta
    return np.mean(
        np.where(is_small, 0.5 * error  2, delta * np.abs(error) - 0.5 * delta  2)
    )

def smooth_l1_loss(y_true, y_pred, beta=1.0):
    """Smooth L1 Loss：Faster R-CNN 默认回归损失"""
    error = y_true - y_pred
    abs_error = np.abs(error)
    return np.mean(
        np.where(abs_error < beta,
                 0.5 * error ** 2 / beta,
                 abs_error - 0.5 * beta)
    )

# 对比实验：存在异常值时各损失的表现
y_true = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
y_pred_normal = np.array([1.1, 2.1, 3.1, 4.1, 5.1])
y_pred_outlier = np.array([1.1, 2.1, 3.1, 4.1, 50.0])  # 第5个是异常值

print(f"正常预测 - MSE: {mse_loss(y_true, y_pred_normal):.4f}, MAE: {mae_loss(y_true, y_pred_normal):.4f}")
print(f"异常预测 - MSE: {mse_loss(y_true, y_pred_outlier):.4f}, MAE: {mae_loss(y_true, y_pred_outlier):.4f}")
# MSE 从 0.01 暴增到 810.9，MAE 从 0.1 仅增至 9.08` },
                { lang: "python", code: `import torch
import torch.nn as nn

# PyTorch 中的回归损失
y_true = torch.tensor([1.0, 2.0, 3.0, 4.0, 5.0])
y_pred = torch.tensor([1.5, 2.5, 3.5, 4.5, 5.5])

# MSE Loss
mse = nn.MSELoss()
print(f"MSE: {mse(y_pred, y_true):.4f}")  # 0.2500

# L1 Loss (MAE)
l1 = nn.L1Loss()
print(f"L1: {l1(y_pred, y_true):.4f}")  # 0.5000

# Smooth L1 Loss
smooth_l1 = nn.SmoothL1Loss(beta=1.0)
print(f"SmoothL1: {smooth_l1(y_pred, y_true):.4f}")

# Huber Loss (PyTorch 1.10+)
huber = nn.HuberLoss(delta=1.0)
print(f"Huber: {huber(y_pred, y_true):.4f}")

# reduction 选项
mse_sum = nn.MSELoss(reduction='sum')
mse_none = nn.MSELoss(reduction='none')
print(f"sum: {mse_sum(y_pred, y_true):.4f}")       # 1.2500
print(f"none: {mse_none(y_pred, y_true)}")           # 每个样本独立损失` },
            ],
            table: {
                headers: ["损失", "公式", "梯度", "异常值鲁棒", "零点可微"],
                rows: [
                    ["MSE", "(y-ŷ)²", "2(y-ŷ)", "差", "是"],
                    ["MAE", "|y-ŷ|", "sign(y-ŷ)", "优", "否（次梯度）"],
                    ["Huber", "分段: <δ 用 MSE, >δ 用 MAE", "受限", "好", "是"],
                    ["Smooth L1", "Huber 的 δ=1 特例", "受限", "好", "是"],
                ],
            },
            mermaid: `graph LR
    A["误差 |e|"] --> B{"|e| < δ?"}
    B -->|是| C["MSE: 0.5·e²/δ"]
    B -->|否| D["MAE: |e| - 0.5δ"]
    C --> E["梯度 = e/δ → 连续可微"]
    D --> F["梯度 = sign(e) → 有界"]
    E --> G["收敛快"]
    F --> H["鲁棒性强"]
    class D s1
    class C s0
    classDef s0 fill:#14532d
    classDef s1 fill:#14532d`,
            tip: "如果数据中存在异常值（常见于真实场景），优先选择 Huber 或 Smooth L1 而非 MSE。Smooth L1 的默认 β=1.0 适用于大多数情况，不需要额外调参。",
            warning: "MAE 在零点不可微，虽然 PyTorch 用次梯度处理，但在优化器（如 Adam）中可能导致数值不稳定。如果必须用 MAE，建议配合 SGD 而非 Adam。",
        },
        {
            title: "3. 分类损失：交叉熵、多分类交叉熵与 BCE",
            body: `分类任务的目标是预测离散类别，分类损失衡量预测概率分布与真实分布之间的差异。交叉熵（Cross Entropy）是分类任务的标准选择，它来自信息论——衡量用预测分布 q 编码真实分布 p 所需的额外比特数。在深度学习中，真实分布通常是 one-hot 编码，交叉熵简化为 -log(q_c)，其中 q_c 是模型对正确类别 c 的预测概率。

二分类交叉熵（BCE）处理两个类别的情况。PyTorch 提供了 BCELoss 和 BCEWithLogitsLoss 两种实现。BCELoss 要求输入已经是概率值（经过 Sigmoid），而 BCEWithLogitsLoss 接受原始 logit 值，内部自动做 Sigmoid。强烈建议使用 BCEWithLogitsLoss——它将 Sigmoid 和 BCE 合并为一个操作，数值稳定性更好（通过 LogSumExp 技巧避免 log(sigmoid(x)) 在极端值下的数值溢出）。

多分类交叉熵（CrossEntropyLoss）处理 K 个互斥类别的情况。PyTorch 的 CrossEntropyLoss 内部自动做 Softmax + NLLLoss，因此输入是原始 logit 值（不需要手动 Softmax），标签是类别索引（不需要 one-hot 编码）。这个设计避免了手动 Softmax 可能带来的数值不稳定和效率损失。`,
            code: [
                { lang: "python", code: `import numpy as np

def binary_cross_entropy(y_true, y_pred, eps=1e-15):
    """二分类交叉熵（BCE）从零实现"""
    y_pred = np.clip(y_pred, eps, 1 - eps)  # 防止 log(0)
    return -np.mean(
        y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred)
    )

def categorical_cross_entropy(y_true, y_pred, eps=1e-15):
    """多分类交叉熵从零实现"""
    y_pred = np.clip(y_pred, eps, 1 - eps)
    return -np.mean(np.sum(y_true * np.log(y_pred), axis=1))

def softmax(logits):
    """Softmax 函数：将 logit 转为概率"""
    exp_logits = np.exp(logits - np.max(logits, axis=1, keepdims=True))  # 数值稳定
    return exp_logits / np.sum(exp_logits, axis=1, keepdims=True)

# 二分类示例
y_true_binary = np.array([1, 0, 1, 1, 0])
y_pred_binary = np.array([0.9, 0.1, 0.8, 0.3, 0.4])
bce = binary_cross_entropy(y_true_binary, y_pred_binary)
print(f"BCE: {bce:.4f}")

# 多分类示例
logits = np.array([[2.0, 1.0, 0.1],   # 预测偏向类别 0
                   [0.5, 3.0, 0.2]])   # 预测偏向类别 1
probs = softmax(logits)
y_true_multi = np.array([[1, 0, 0],    # one-hot
                         [0, 1, 0]])
cce = categorical_cross_entropy(y_true_multi, probs)
print(f"CrossEntropy: {cce:.4f}")` },
                { lang: "python", code: `import torch
import torch.nn as nn

# 二分类：BCEWithLogitsLoss（推荐）
logits_binary = torch.tensor([2.0, -1.0, 1.5, -0.5, 3.0])
labels_binary = torch.tensor([1.0, 0.0, 1.0, 0.0, 1.0])

# ❌ 不推荐：分开做 Sigmoid + BCE
bce_manual = nn.BCELoss()
probs = torch.sigmoid(logits_binary)
loss_manual = bce_manual(probs, labels_binary)

# ✅ 推荐：BCEWithLogitsLoss（数值稳定）
bce_auto = nn.BCEWithLogitsLoss()
loss_auto = bce_auto(logits_binary, labels_binary)
print(f"Manual BCE: {loss_manual:.4f}")  # 0.2271
print(f"Auto BCE:   {loss_auto:.4f}")    # 0.2271（相同结果）

# 多分类：CrossEntropyLoss
logits_multi = torch.tensor([[2.0, 1.0, 0.1],   # 3 个类别的 logit
                             [0.5, 3.0, 0.2]])
labels_multi = torch.tensor([0, 1])              # 类别索引

# ❌ 不推荐：手动 Softmax + NLLLoss
# ✅ 推荐：直接使用 CrossEntropyLoss（内部自动 Softmax）
ce_loss = nn.CrossEntropyLoss()
loss_multi = ce_loss(logits_multi, labels_multi)
print(f"CrossEntropy: {loss_multi:.4f}")` },
            ],
            table: {
                headers: ["损失函数", "输出要求", "标签格式", "类别数", "数值稳定性"],
                rows: [
                    ["BCELoss", "Sigmoid 后概率", "0/1 浮点数", "2", "中"],
                    ["BCEWithLogitsLoss", "原始 logit", "0/1 浮点数", "2", "优"],
                    ["CrossEntropyLoss", "原始 logit", "类别索引", "K≥2", "优"],
                    ["NLLLoss", "LogSoftmax 后", "类别索引", "K≥2", "中"],
                ],
            },
            mermaid: `graph TD
    A["原始 logit"] --> B{"任务类型?"}
    B -->|二分类| C["BCEWithLogitsLoss
Sigmoid + BCE 合并"]
    B -->|多分类| D["CrossEntropyLoss
Softmax + NLL 合并"]
    C --> E["标签: 0/1"]
    D --> F["标签: 类别索引 0~K-1"]
    E --> G["损失 = -[y·log(σ(x)) + (1-y)·log(1-σ(x))]"]
    F --> H["损失 = -log(exp(x_c) / Σexp(x_i))"]
    class D s1
    class C s0
    classDef s0 fill:#14532d
    classDef s1 fill:#14532d`,
            tip: "PyTorch 的 CrossEntropyLoss 和 BCEWithLogitsLoss 都接受原始 logit 值——不要在前面手动加 Softmax 或 Sigmoid，否则会导致重复变换，数值不稳定且结果错误。",
            warning: "交叉熵损失对类别不平衡敏感。当正负样本比例为 1:100 时，模型只需预测「全部为负类」就能获得 99% 的准确率，但损失值仍然很高。此时需要考虑 Focal Loss 或类别权重。",
        },
        {
            title: "4. Focal Loss：解决类别不平衡",
            body: `Focal Loss 由 Kaiming He 等人在 2017 年提出，专门针对极度类别不平衡的目标检测场景（如 RetinaNet 中前景:背景 ≈ 1:1000）。它的核心思想极其简洁但深刻：让模型专注于「难分样本」，而不是被大量「易分样本」淹没。

Focal Loss 在标准交叉熵基础上引入了一个调制因子（modulating factor）：FL(p_t) = -α_t · (1 - p_t)^γ · log(p_t)。其中 p_t 是模型对真实类别的预测概率（越大表示越确信）。当 p_t 接近 1（易分样本）时，(1 - p_t)^γ 趋近于 0，该样本的损失被大幅压缩；当 p_t 接近 0（难分样本）时，(1 - p_t)^γ 接近 1，损失几乎不受影响。超参数 γ 控制「聚焦程度」——γ=0 退化为标准交叉熵，γ=2 是论文推荐值。

参数 α 是类别平衡因子，给少数类更大的权重。在实际应用中，α 和 γ 联合使用效果最佳：α 解决类别数量不平衡，γ 解决难易样本不平衡。Focal Loss 在目标检测、医学图像分割、欺诈检测等类别不平衡严重的任务中表现卓越。`,
            code: [
                { lang: "python", code: `import numpy as np

def focal_loss(y_true, y_pred, gamma=2.0, alpha=0.25, eps=1e-15):
    """Focal Loss 从零实现"""
    y_pred = np.clip(y_pred, eps, 1 - eps)

    # p_t: 模型对真实类别的预测概率
    p_t = np.where(y_true == 1, y_pred, 1 - y_pred)

    # α_t: 类别平衡因子
    alpha_t = np.where(y_true == 1, alpha, 1 - alpha)

    # Focal Loss = -α_t · (1 - p_t)^γ · log(p_t)
    focal_weight = alpha_t * (1 - p_t) ** gamma
    loss = -focal_weight * np.log(p_t)

    return np.mean(loss)

# 对比：标准交叉熵 vs Focal Loss
y_true = np.array([1, 1, 0, 0, 0, 0, 0, 0, 0, 0])  # 2正8负
y_pred_easy = np.array([0.95, 0.93, 0.05, 0.03, 0.02, 0.04, 0.01, 0.06, 0.02, 0.03])
y_pred_hard = np.array([0.55, 0.45, 0.40, 0.60, 0.50, 0.35, 0.70, 0.30, 0.45, 0.55])

# 易分样本：标准 CE 仍有显著贡献，但 Focal Loss 大幅压缩
ce_easy = -np.mean(y_true * np.log(y_pred_easy + 1e-15) + (1-y_true) * np.log(1-y_pred_easy + 1e-15))
fl_easy = focal_loss(y_true, y_pred_easy)

ce_hard = -np.mean(y_true * np.log(y_pred_hard + 1e-15) + (1-y_true) * np.log(1-y_pred_hard + 1e-15))
fl_hard = focal_loss(y_true, y_pred_hard)

print(f"易分样本 - CE: {ce_easy:.4f}, FL: {fl_easy:.4f}")  # FL 大幅降低
print(f"难分样本 - CE: {ce_hard:.4f}, FL: {fl_hard:.4f}")  # FL 压缩较少
print(f"易/难 比例: CE {ce_easy/ce_hard:.2f}, FL {fl_easy/fl_hard:.2f}")  # FL 比例更低 = 更聚焦难样本` },
                { lang: "python", code: `import torch
import torch.nn as nn

class FocalLoss(nn.Module):
    """PyTorch 实现的 Focal Loss"""
    def __init__(self, alpha=0.25, gamma=2.0, reduction='mean'):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, logits, targets):
        # BCEWithLogits 风格：输入 logit
        bce_loss = nn.functional.binary_cross_entropy_with_logits(
            logits, targets, reduction='none')
        pt = torch.exp(-bce_loss)  # p_t

        # Focal weight
        focal_weight = (1 - pt) ** self.gamma
        alpha_weight = torch.where(targets == 1,
                                   torch.tensor(self.alpha),
                                   torch.tensor(1 - self.alpha))

        loss = alpha_weight * focal_weight * bce_loss

        if self.reduction == 'mean':
            return loss.mean()
        elif self.reduction == 'sum':
            return loss.sum()
        return loss

# 使用示例
focal = FocalLoss(alpha=0.25, gamma=2.0)
logits = torch.tensor([2.0, -1.0, 0.5, -0.3, 1.5])
targets = torch.tensor([1.0, 0.0, 1.0, 0.0, 1.0])
loss = focal(logits, targets)
print(f"Focal Loss: {loss:.4f}")` },
            ],
            table: {
                headers: ["参数", "作用", "推荐值", "影响"],
                rows: [
                    ["γ (gamma)", "聚焦难分样本", "2.0", "越大越聚焦难样本"],
                    ["α (alpha)", "类别平衡权重", "0.25", "少数类权重 = α"],
                    ["γ=0", "退化为 BCE", "—", "无聚焦效果"],
                    ["γ=2, α=0.25", "论文默认", "—", "最优检测精度"],
                ],
            },
            mermaid: `graph TD
    A["标准交叉熵: -log(p_t)"] --> B{"p_t 大小?"}
    B -->|p_t ≈ 1 易分| C["损失仍显著
被大量简单样本主导"]
    B -->|p_t ≈ 0 难分| D["损失很大
正常贡献"]
    E["Focal Loss: -(1-p_t)^γ·log(p_t)"] --> F{"p_t 大小?"}
    F -->|p_t ≈ 1 易分| G["(1-p_t)^γ → 0
损失被大幅压缩"]
    F -->|p_t ≈ 0 难分| H["(1-p_t)^γ → 1
损失几乎不变"]
    class G s1
    class C s0
    classDef s0 fill:#7f1d1d
    classDef s1 fill:#14532d`,
            tip: "Focal Loss 的 γ=2 是 RetinaNet 论文的经验值，但在不同任务上可能需要调整。建议从 γ=2 开始，如果模型仍然被简单样本主导，可以增大到 3 或 4。",
            warning: "Focal Loss 只对二分类直接适用。多分类场景需要为每个类别独立计算 Focal Loss 然后求和，或者使用 Class-Balanced Loss 等替代方案。",
        },
        {
            title: "5. 对比损失：Triplet Loss 与 Contrastive Loss",
            body: `对比学习（Contrastive Learning）的目标不是预测标签，而是学习「好的特征表示」——让相似的样本在特征空间中靠近，不相似的样本远离。这种学习范式在自监督学习、人脸识别、图像检索等领域取得了巨大成功。

Contrastive Loss是最基础的对比损失，它成对地处理样本：给定一对样本 (x₁, x₂) 和标签 y（1 表示相似，0 表示不相似），损失函数鼓励相似样本的距离趋近于 0，不相似样本的距离大于边界 margin。损失公式为 L = y·d² + (1-y)·max(0, margin - d)²，其中 d 是两个样本特征之间的距离。这个损失的核心直觉是：相似样本要「拉到一起」，不相似样本只要「推开到 margin 以外」即可，不需要无限远。

Triplet Loss是 Contrastive Loss 的升级版，它同时考虑三个样本：锚点（Anchor）、正样本（Positive，与锚点同类）、负样本（Negative，与锚点不同类）。损失函数要求：d(A, P) + margin < d(A, N)。也就是说，锚点到正样本的距离加上 margin 必须小于锚点到负样本的距离。如果这个条件已经满足（三元组已经是「好」的），损失为零；否则损失为两者之差。Triplet Mining（挖掘难三元组）是提升效果的关键策略。`,
            code: [
                { lang: "python", code: `import numpy as np

def contrastive_loss(d, y, margin=1.0):
    """Contrastive Loss：成对样本"""
    # y=1: 相似样本，拉近
    # y=0: 不相似样本，推开到 margin 外
    return np.mean(
        y * (d  2) + (1 - y) * (np.maximum(0, margin - d)  2)
    )

def triplet_loss(anchor, positive, negative, margin=1.0):
    """Triplet Loss：三元组样本"""
    d_pos = np.sqrt(np.sum((anchor - positive) ** 2, axis=1))
    d_neg = np.sqrt(np.sum((anchor - negative) ** 2, axis=1))

    # 损失 = max(0, d_pos - d_neg + margin)
    basic_loss = d_pos - d_neg + margin
    return np.mean(np.maximum(basic_loss, 0))

# 对比实验
anchor = np.array([[0.1, 0.2, 0.3]])
positive = np.array([[0.15, 0.25, 0.35]])  # 很近
negative_easy = np.array([[5.0, 6.0, 7.0]])  # 很远（简单负样本）
negative_hard = np.array([[0.2, 0.3, 0.4]])  # 较近（困难负样本）

loss_easy = triplet_loss(anchor, positive, negative_easy, margin=0.5)
loss_hard = triplet_loss(anchor, positive, negative_hard, margin=0.5)
print(f"简单三元组损失: {loss_easy:.4f}")   # 0.0（已满足条件）
print(f"困难三元组损失: {loss_hard:.4f}")   # > 0（需要学习）` },
                { lang: "python", code: `import torch
import torch.nn as nn

# PyTorch 中的对比损失
class ContrastiveModel(nn.Module):
    """简单的编码器：用于提取特征"""
    def __init__(self, input_dim=128, embed_dim=64):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.ReLU(),
            nn.Linear(256, embed_dim),
            nn.BatchNorm1d(embed_dim)
        )

    def forward(self, x):
        return nn.functional.normalize(self.encoder(x), dim=1)

# Triplet Margin Loss
triplet_loss = nn.TripletMarginLoss(margin=1.0, p=2)

anchor = torch.randn(32, 64)      # 32 个锚点样本
positive = torch.randn(32, 64)    # 32 个正样本
negative = torch.randn(32, 64)    # 32 个负样本

loss = triplet_loss(anchor, positive, negative)
print(f"Triplet Loss: {loss:.4f}")

# Hard Triplet Mining（关键策略）
def hard_triplet_mining(anchor, positive, negative, margin=1.0):
    """半困难三元组挖掘"""
    d_pos = torch.sum((anchor - positive) ** 2, dim=1)
    d_neg = torch.sum((anchor - negative) ** 2, dim=1)
    loss = torch.clamp(d_pos - d_neg + margin, min=0.0)
    return loss.mean()` },
            ],
            table: {
                headers: ["损失", "输入", "核心思想", "适用场景"],
                rows: [
                    ["Contrastive", "样本对", "相似拉近，不相似推开到 margin", "人脸识别/验证"],
                    ["Triplet", "三元组", "d(A,P)+m < d(A,N)", "度量学习/检索"],
                    ["InfoNCE", "正负样本对", "最大化互信息下界", "自监督学习 (SimCLR)"],
                    ["NT-Xent", "增强视图对", "温度缩放的 InfoNCE", "对比预训练"],
                ],
            },
            mermaid: `graph TD
    A["三元组: A, P, N"] --> B["计算距离"]
    B --> C["d(A, P): 锚-正"]
    B --> D["d(A, N): 锚-负"]
    C --> E["损失 = max(0, d(A,P) + m - d(A,N))"]
    D --> E
    E --> F{"损失 > 0?"}
    F -->|是| G["需要学习
正样本太远或负样本太近"]
    F -->|否| H["三元组已好
损失为 0"]
    class H s1
    class G s0
    classDef s0 fill:#7f1d1d
    classDef s1 fill:#14532d`,
            tip: "三元组挖掘（Triplet Mining）是 Triplet Loss 成功的关键。随机采样三元组效率极低（大多数三元组损失为 0），建议使用半困难三元组（Semi-Hard Negative Mining）——选择距离在 d(A,P) 和 d(A,P)+margin 之间的负样本。",
            warning: "Triplet Loss 对 margin 非常敏感。margin 太小，模型学不到区分能力；margin 太大，训练困难且可能不收敛。建议从 margin=1.0 开始，观察训练曲线的损失变化。",
        },
        {
            title: "6. 自定义损失函数：从理论到实现",
            body: `当标准损失函数无法满足需求时，自定义损失函数是最直接的解决方案。PyTorch 的损失函数本质上就是一个接收预测值和标签、返回标量的函数——关键在于它必须是可微的，因为梯度需要反向传播。

自定义损失函数有两种实现方式：函数式和类式。函数式实现最简单，只需写一个普通函数，所有操作使用 PyTorch 的 tensor 运算（不能用 NumPy）。类式实现需要继承 nn.Module，实现 forward 方法，适合需要保存状态（如可学习参数）的复杂损失函数。

自定义损失函数的设计原则：(1) 梯度必须有明确的物理或业务含义——你希望模型如何调整参数？(2) 损失值范围可控，避免梯度爆炸或消失。(3) 在极端情况下（如预测完全错误）不会返回 NaN。设计自定义损失时，建议先用简单的玩具数据验证梯度的方向和大小是否符合预期，再用到真实训练流程中。`,
            code: [
                { lang: "python", code: `import torch
import torch.nn as nn

# 方式一：函数式自定义损失
def quantile_loss(y_pred, y_true, tau=0.5):
    """分位数损失：预测指定分位数而非均值"""
    error = y_true - y_pred
    return torch.mean(torch.max(tau * error, (tau - 1) * error))

def asymmetric_mse(y_pred, y_true, alpha=2.0):
    """非对称 MSE：高估和低估的惩罚不同"""
    error = y_pred - y_true
    # 高估（error > 0）惩罚 α 倍，低估正常惩罚
    weight = torch.where(error > 0,
                         torch.tensor(alpha),
                         torch.tensor(1.0))
    return torch.mean(weight * error ** 2)

# 方式二：类式自定义损失（带可学习参数）
class AdaptiveLoss(nn.Module):
    """自适应损失：uncertainty-weighted loss"""
    def __init__(self, num_tasks=2):
        super().__init__()
        # 可学习的 log-variance 参数
        self.log_vars = nn.Parameter(torch.zeros(num_tasks))

    def forward(self, losses):
        """多任务自适应加权"""
        # 损失 = Σ (loss_i / (2σ_i²) + log(σ_i))
        # 其中 σ_i² = exp(log_var_i)
        weighted = 0
        for i, loss_i in enumerate(losses):
            prec = torch.exp(-self.log_vars[i])  # 1/σ²
            weighted += prec * loss_i + self.log_vars[i]
        return weighted

# 验证梯度
x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
y = torch.tensor([1.5, 2.5, 3.5])
loss = quantile_loss(x, y, tau=0.7)
loss.backward()
print(f"分位数损失: {loss:.4f}")
print(f"梯度: {x.grad}")` },
                { lang: "python", code: `import torch
import torch.nn as nn

# 实战：结合多种损失的复合损失函数
class CompositeLoss(nn.Module):
    """复合损失：MSE + 正则化 + 边界惩罚"""
    def __init__(self, alpha=0.1, beta=0.05, boundary=5.0):
        super().__init__()
        self.alpha = alpha   # L2 正则权重
        self.beta = beta     # 边界惩罚权重
        self.boundary = boundary  # 预测值边界

    def forward(self, pred, target, model_params=None):
        # 主损失：MSE
        mse_loss = nn.functional.mse_loss(pred, target)

        # L2 正则化
        l2_reg = torch.tensor(0.0)
        if model_params:
            l2_reg = sum(p.pow(2).sum() for p in model_params)

        # 边界惩罚：预测超出边界时惩罚
        boundary_violation = torch.relu(
            torch.abs(pred) - self.boundary
        ).mean()

        total_loss = mse_loss + self.alpha * l2_reg + self.beta * boundary_violation
        return total_loss

# 使用示例
model = nn.Linear(10, 1)
composite = CompositeLoss(alpha=0.1, beta=0.05)
x = torch.randn(32, 10)
y = torch.randn(32, 1)
pred = model(x)
loss = composite(pred, y, list(model.parameters()))
loss.backward()
print(f"Composite Loss: {loss:.4f}")` },
            ],
            table: {
                headers: ["损失类型", "用途", "关键公式", "注意事项"],
                rows: [
                    ["分位数损失", "不确定性估计", "max(τ·e, (τ-1)·e)", "τ=0.5 等价于 MAE"],
                    ["非对称 MSE", "成本敏感预测", "w·e², w 依赖符号", "α 根据业务成本设定"],
                    ["自适应加权", "多任务学习", "L_i/(2σ_i²)+logσ_i", "σ 自动学习"],
                    ["复合损失", "多重约束", "Σ w_i·L_i", "权重需要仔细调"],
                ],
            },
            mermaid: `graph TD
    A["自定义损失设计"] --> B["确定优化目标"]
    B --> C["数学公式"]
    C --> D{"可微?"}
    D -->|否| E["用次梯度/直通估计"]
    D -->|是| F["PyTorch 实现"]
    F --> G["玩具数据验证梯度"]
    G --> H["集成到训练循环"]
    H --> I["监控损失曲线"]
    I --> J{"收敛?"}
    J -->|否| C
    J -->|是| K["完成"]
    class K s1
    class E s0
    classDef s0 fill:#713f12
    classDef s1 fill:#14532d`,
            tip: "自定义损失函数的梯度验证技巧：使用 torch.autograd.gradcheck 自动检查梯度是否正确。对简单输入（如全 1 tensor）计算数值梯度和解析梯度，两者应一致。",
            warning: "自定义损失函数中最常见的错误是使用了不可微的操作（如 torch.argmax、torch.where 的条件部分）。这些操作会阻断梯度流，导致模型无法学习。需要用 Gumbel-Softmax 或直通估计器替代。",
        },
        {
            title: "7. PyTorch 实战：损失函数选择与调优",
            body: `理论最终要落地到实践。本节通过完整的 PyTorch 训练流程，展示如何在真实项目中选择和调优损失函数。关键原则是：从简单开始，逐步复杂化。

****第一阶段****：基线模型。使用标准损失函数（回归用 MSE，分类用 CrossEntropyLoss），不添加任何自定义组件。目标是确认模型架构正确、数据管道通畅、模型能够正常学习。如果基线都无法收敛，说明问题不在损失函数，而在模型或数据。

****第二阶段****：诊断与改进。分析训练曲线——如果训练损失下降但验证损失上升，可能是过拟合，考虑添加正则化项；如果训练和验证损失都下降缓慢，可能是学习率或损失函数不合适；如果损失震荡，可能是学习率过大或存在梯度爆炸。根据诊断结果，选择合适的改进策略：回归中的异常值 → 改用 Huber/Smooth L1；类别不平衡 → 使用 Focal Loss 或类别权重；需要好的特征表示 → 引入对比损失。`,
            code: [
                { lang: "python", code: `import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

class LossFunctionSelector:
    """损失函数选择与配置工具"""

    @staticmethod
    def get_loss(task, config=None):
        """根据任务类型返回合适的损失函数"""
        config = config or {}

        if task == "regression":
            if config.get("robust", False):
                return nn.HuberLoss(delta=config.get("delta", 1.0))
            return nn.MSELoss()

        elif task == "binary_classification":
            if config.get("focal", False):
                gamma = config.get("gamma", 2.0)
                alpha = config.get("alpha", 0.25)
                return FocalLoss(gamma=gamma, alpha=alpha)
            return nn.BCEWithLogitsLoss(
                pos_weight=config.get("pos_weight", None))

        elif task == "multi_classification":
            class_weights = config.get("class_weights", None)
            weight = torch.tensor(class_weights) if class_weights else None
            return nn.CrossEntropyLoss(weight=weight)

        elif task == "contrastive":
            return nn.TripletMarginLoss(
                margin=config.get("margin", 1.0), p=2)

        else:
            raise ValueError(f"Unknown task: {task}")

    @staticmethod
    def diagnose_loss_curve(train_losses, val_losses):
        """诊断训练曲线"""
        if not val_losses:
            return "无验证数据，无法诊断"

        train_change = train_losses[-1] - train_losses[0]
        val_change = val_losses[-1] - val_losses[0]
        gap = val_losses[-1] - train_losses[-1]

        if train_change > 0 and val_change > 0:
            return "欠拟合：增大模型容量或降低正则化"
        elif train_change < -0.1 and val_change > 0:
            return "过拟合：添加 Dropout 或早停"
        elif gap > train_losses[-1] * 0.5:
            return "训练-验证差距大：添加正则化"
        return "训练状态正常"` },
                { lang: "python", code: `import torch
import torch.nn as nn
import torch.nn.functional as F

# 完整训练流程：损失函数切换示例
def train_with_loss_comparison(model, trainloader, valloader,
                               epochs=50, device='cuda'):
    """对比不同损失函数在同一任务上的表现"""
    losses_config = {
        "MSE": nn.MSELoss(),
        "SmoothL1": nn.SmoothL1Loss(),
        "Huber": nn.HuberLoss(delta=1.0),
    }

    results = {}
    for name, criterion in losses_config.items():
        model_copy = deepcopy(model).to(device)
        optimizer = torch.optim.Adam(model_copy.parameters(), lr=0.001)

        train_hist = []
        val_hist = []

        for epoch in range(epochs):
            # 训练
            model_copy.train()
            epoch_loss = 0
            for X, y in trainloader:
                X, y = X.to(device), y.to(device)
                optimizer.zero_grad()
                pred = model_copy(X).squeeze(-1)
                loss = criterion(pred, y)
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item() * X.size(0)

            train_loss = epoch_loss / len(trainloader.dataset)
            train_hist.append(train_loss)

            # 验证
            model_copy.eval()
            val_loss = 0
            with torch.no_grad():
                for X, y in valloader:
                    pred = model_copy(X.to(device)).squeeze(-1)
                    val_loss += criterion(pred, y.to(device)).item() * X.size(0)

            val_loss /= len(valloader.dataset)
            val_hist.append(val_loss)

        results[name] = {
            "train": train_hist,
            "val": val_hist,
            "final_train": train_hist[-1],
            "final_val": val_hist[-1],
        }
        print(f"{name}: train={train_hist[-1]:.4f}, val={val_hist[-1]:.4f}")

    return results` },
            ],
            table: {
                headers: ["场景", "首选损失", "备选损失", "关键超参"],
                rows: [
                    ["标准回归", "MSE", "Huber", "delta=1.0"],
                    ["回归+异常值", "Huber", "Smooth L1", "delta=1.35"],
                    ["二分类平衡", "BCEWithLogitsLoss", "—", "pos_weight"],
                    ["二分类不平衡", "Focal Loss", "BCE+class_weight", "γ=2, α=0.25"],
                    ["多分类平衡", "CrossEntropyLoss", "—", "label_smoothing"],
                    ["多分类不平衡", "CE+class_weight", "Focal Loss", "权重=1/n_per_class"],
                    ["度量学习", "TripletMarginLoss", "ContrastiveLoss", "margin=1.0"],
                    ["多任务学习", "自适应加权损失", "手动加权", "可学习 log_var"],
                ],
            },
            mermaid: `graph TD
    A["选择损失函数"] --> B{"回归 or 分类?"}
    B -->|回归| C{"有异常值?"}
    C -->|否| D["MSE"]
    C -->|是| E["Huber / Smooth L1"]
    B -->|分类| F{"类别平衡?"}
    F -->|平衡| G["CrossEntropy / BCEWithLogits"]
    F -->|不平衡| H["Focal Loss / 类别权重"]
    F -->|需要表征学习| I["Triplet / Contrastive"]
    D --> J["验证收敛"]
    E --> J
    G --> J
    H --> J
    I --> J
    class J s0
    classDef s0 fill:#14532d`,
            tip: "Label Smoothing 是 CrossEntropyLoss 的正则化技巧——将 one-hot 标签的 1.0 改为 0.9，其余 0.1 分给其他类别。PyTorch 中设置 label_smoothing=0.1 即可启用，几乎免费提升 0.5-1% 的精度。",
            warning: "在同一个训练流程中频繁切换损失函数会导致训练不稳定。正确的做法是：先用一种损失函数跑完基线，分析不足后再换另一种从头训练，而不是在中途切换。",
        },
    ],
};
