import { Article } from '../knowledge';

export const article: Article = {
    id: "ethics-003",
    title: "联邦学习（一）：隐私保护的分布式训练",
    category: "ethics",
    tags: ["隐私保护", "联邦学习", "差分隐私"],
    summary: "从差分隐私到联邦学习，掌握机器学习中的隐私保护技术",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
  learningPath: {
    routeId: "privacy-series",
    phase: 1,
    order: 1,
    nextStep: "ml-024",
    prevStep: null,
  },
    content: [
        {
            title: "1. 机器学习中的隐私风险",
            body: `机器学习模型在训练过程中会隐式记忆训练数据的统计特征甚至个别样本。研究表明，攻击者可以通过成员推断攻击（Membership Inference Attack）判断某条数据是否属于训练集，通过模型反演攻击（Model Inversion Attack）从模型输出中重构敏感输入，甚至通过模型提取攻击（Model Extraction Attack）复现目标模型的行为。在医疗、金融等敏感领域，这些隐私泄露风险可能导致严重的法律后果和信任危机。**GDPR** 和 HIPAA 等法规明确要求对个人信息进行保护，传统的匿名化手段在高维数据场景下已被证明无效。因此，在模型训练全生命周期中引入形式化的隐私保障机制，已成为 AI 落地的刚需。`,
            code: [
                {
                    lang: "python",
                    code: `# 成员推断攻击示例：判断样本是否在训练集中
import numpy as np
from sklearn.metrics import roc_auc_score

def membership_inference_attack(model, shadow_train, shadow_test, target_samples):
    """使用 shadow model 模拟成员推断攻击"""
    train_confidence = np.max(model.predict_proba(shadow_train), axis=1)
    test_confidence = np.max(model.predict_proba(shadow_test), axis=1)
    target_confidence = np.max(model.predict_proba(target_samples), axis=1)
    labels = np.concatenate([np.ones(len(train_confidence)),
                             np.zeros(len(test_confidence))])
    scores = np.concatenate([train_confidence, test_confidence])
    auc = roc_auc_score(labels, scores)
    threshold = np.median(scores)
    predictions = target_confidence > threshold
    return predictions, auc

print(f"攻击 AUC: {auc:.4f}，AUC 越高说明成员推断越容易")`
                },
                {
                    lang: "python",
                    code: `# 模型反演攻击：从输出重构输入特征
import torch
import torch.nn as nn

class ModelInversionAttack:
    def __init__(self, model, target_class, input_shape, lr=0.01):
        self.model = model
        self.target_class = target_class
        # 初始化为随机噪声
        self.fake_input = nn.Parameter(torch.randn(input_shape, requires_grad=True))
        self.optimizer = torch.optim.Adam([self.fake_input], lr=lr)

    def reconstruct(self, steps=1000):
        target = torch.tensor([self.target_class], dtype=torch.long)
        for step in range(steps):
            self.optimizer.zero_grad()
            output = self.model(self.fake_input)
            loss = nn.CrossEntropyLoss()(output, target)
            loss.backward()
            self.optimizer.step()
        return self.fake_input.detach()

# 攻击成功后，fake_input 会逼近目标类别的典型训练样本`
                }
            ],
            table: {
                headers: ["攻击类型", "目标", "所需知识", "危害程度"],
                rows: [
                    ["成员推断攻击", "判断样本是否在训练集中", "黑盒访问", "高"],
                    ["模型反演攻击", "从输出重构输入特征", "白盒/黑盒访问", "极高"],
                    ["模型提取攻击", "复现目标模型功能", "API 查询", "中"],
                    ["属性推断攻击", "推断训练数据的敏感属性", "黑盒访问", "高"],
                    ["训练数据提取", "直接提取训练样本", "白盒访问", "极高"]
                ]
            },
            mermaid: `graph LR
    A["训练数据"] --> B["模型训练"]
    B --> C["发布模型"]
    C --> D["成员推断攻击"]
    C --> E["模型反演攻击"]
    C --> F["模型提取攻击"]
    D --> G["隐私泄露"]
    E --> G
    F --> H["知识产权泄露"]`,
            tip: "在公开模型前，务必使用隐私审计工具评估模型的隐私泄露风险",
            warning: "简单的数据脱敏（如移除姓名、ID）无法防止高维数据中的隐私推断攻击"
        },
        {
            title: "2. 差分隐私基础",
            body: `差分隐私（Differential Privacy, DP）是目前最严格的数学隐私保障框架。其核心思想是：无论数据库中包含或排除某一条记录，算法输出的概率分布几乎不变。形式化定义为：对任意相邻数据集 D 和 D'（仅差一条记录），以及任意输出子集 S，满足 P[M(D) ∈ S] ≤ exp(ε) × P[M(D') ∈ S] + δ。其中 ε（隐私预算）控制隐私保护强度，ε 越小保护越强；δ 是允许的失败概率。差分隐私的优雅之处在于其组合定理：多个 DP 机制组合后，总隐私预算可精确计算。这使得我们可以在复杂 ML 流水线中量化追踪隐私消耗。实现 DP 的常用方法是拉普拉斯机制和指数机制，在深度学习中则通过 DP-SGD 实现。`,
            code: [
                {
                    lang: "python",
                    code: `# 拉普拉斯机制实现差分隐私
import numpy as np

def laplace_mechanism(query_result, sensitivity, epsilon):
    """对查询结果添加拉普拉斯噪声"""
    scale = sensitivity / epsilon
    noise = np.random.laplace(loc=0, scale=scale)
    return query_result + noise

# 示例：统计平均收入（敏感度 = 数据范围 / n）
def private_mean(data, epsilon, data_min=0, data_max=500000):
    n = len(data)
    sensitivity = (data_max - data_min) / n
    true_mean = np.mean(data)
    return laplace_mechanism(true_mean, sensitivity, epsilon)

# ε=1.0 时，单次查询的隐私保障为 e^1 ≈ 2.718 倍概率比
print(f"真实均值: {true_mean:.2f}, 差分隐私均值: {private_mean(data, epsilon=1.0):.2f}")`
                },
                {
                    lang: "python",
                    code: `# 指数机制：从候选集中隐私保护地选择最优项
import numpy as np

def exponential_mechanism(candidates, utility_fn, sensitivity, epsilon):
    """指数机制：按效用函数得分采样候选"""
    scores = np.array([utility_fn(c) for c in candidates])
    # 计算每个候选的指数权重
    alpha = epsilon / (2 * sensitivity)
    weights = np.exp(alpha * scores)
    weights /= weights.sum()
    idx = np.random.choice(len(candidates), p=weights)
    return candidates[idx]

# 示例：隐私保护地选择最佳超参数
param_candidates = [0.001, 0.01, 0.1, 0.5]
def accuracy_score(lr):
    # 模拟不同学习率的验证集准确率
    return 0.85 - abs(lr - 0.05)

best_lr = exponential_mechanism(param_candidates, accuracy_score,
                                 sensitivity=0.01, epsilon=1.0)
print(f"差分隐私选择的超参数: {best_lr}")`
                }
            ],
            table: {
                headers: ["机制", "适用场景", "噪声分布", "敏感度依赖"],
                rows: [
                    ["拉普拉斯机制", "数值型查询", "Laplace(0, Δf/ε)", "L1 敏感度"],
                    ["高斯机制", "数值型查询(近似DP)", "N(0, σ²)", "L2 敏感度"],
                    ["指数机制", "离散候选选择", "exp(ε·u/2Δu)", "效用函数敏感度"],
                    ["随机响应", "二元数据收集", "Bernoulli(p)", "二元翻转概率"]
                ]
            },
            mermaid: `graph TD
    A["原始查询 f(D)"] --> B["计算敏感度 Δf"]
    B --> C["选择噪声机制"]
    C --> D["Laplace: Lap(0, Δf/ε)"]
    C --> E["Gaussian: N(0, σ²)"]
    D --> F["f(D) + Noise"]
    E --> F
    F --> G["ε-DP 或 (ε,δ)-DP 保障"]`,
            tip: "实践中建议从 ε=1.0 开始，根据隐私需求逐步调整预算分配",
            warning: "差分隐私的隐私预算 ε 是全局累计的，多次查询会快速消耗预算"
        },
        {
            title: "3. DP-SGD 算法详解",
            body: `DP-SGD（Differentially Private Stochastic Gradient Descent）是将差分隐私引入深度学习的核心算法。其工作流程分为三个关键步骤：首先对每个样本的梯度进行裁剪（Gradient Clipping），将梯度范数限制在固定阈值 C 内，这一步控制了单个样本对模型更新的最大影响，即限制了敏感度；其次，对裁剪后的梯度求平均并添加高斯噪声，噪声方差与裁剪阈值 C 和隐私参数 σ 相关；最后，使用加噪后的梯度执行参数更新。DP-SGD 的隐私分析借助矩会计（Moments Accounting）或 RDP（Renyi Differential Privacy）技术，相比传统组合定理提供更紧的隐私边界。Opacus 和 TensorFlow Privacy 是两个主流的 DP-SGD 实现库。`,
            code: [
                {
                    lang: "python",
                    code: `# DP-SGD 手动实现（简化版）
import torch
import torch.nn as nn

def dp_sgd_step(model, data_batch, labels, optimizer, noise_multiplier, max_grad_norm):
    """单步 DP-SGD 训练"""
    optimizer.zero_grad()
    # 计算每个样本的梯度（per-sample gradients）
    per_sample_grads = []
    for x, y in zip(data_batch, labels):
        loss = model(x.unsqueeze(0), y.unsqueeze(0))
        loss.backward()
        grad = []
        for p in model.parameters():
            grad.append(p.grad.clone().detach())
            p.grad = None  # 清除累积梯度
        per_sample_grads.append(grad)

    # 梯度裁剪（per-sample clipping）
    clipped_grads = []
    for sample_grad in per_sample_grads:
        total_norm = torch.sqrt(sum((g ** 2).sum() for g in sample_grad))
        clip_coeff = min(1.0, max_grad_norm / (total_norm + 1e-6))
        clipped = [g * clip_coeff for g in sample_grad]
        clipped_grads.append(clipped)

    # 聚合 + 加噪
    batch_size = len(data_batch)
    for i, param in enumerate(model.parameters()):
        avg_grad = torch.stack([cg[i] for cg in clipped_grads]).mean(dim=0)
        noise = torch.normal(0, noise_multiplier * max_grad_norm, avg_grad.shape)
        param.grad = avg_grad + noise

    optimizer.step()`
                },
                {
                    lang: "python",
                    code: `# 使用 Opacus 库实现 DP-SGD
from opacus import PrivacyEngine
from opacus.validators import ModuleValidator
import torch.nn as nn

# 假设已有 model, optimizer, data_loader
model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 10)
)
model = ModuleValidator.fix(model)  # 修复不兼容层

optimizer = torch.optim.SGD(model.parameters(), lr=0.05)
privacy_engine = PrivacyEngine()

# 绑定隐私引擎到 model 和 optimizer
model, optimizer, data_loader = privacy_engine.make_private(
    module=model,
    optimizer=optimizer,
    data_loader=data_loader,
    noise_multiplier=1.0,      # 噪声乘数 σ
    max_grad_norm=1.0,         # 梯度裁剪阈值
)

# 正常训练循环即可，Opacus 自动处理 per-sample 梯度和加噪
# 训练完成后查看隐私支出
epsilon = privacy_engine.get_epsilon(delta=1e-5)
print(f"隐私支出: ε={epsilon:.2f} (δ=1e-5)")`
                }
            ],
            table: {
                headers: ["参数", "含义", "典型值", "影响"],
                rows: [
                    ["noise_multiplier (σ)", "噪声乘数", "0.5~2.0", "越大越隐私但精度越低"],
                    ["max_grad_norm (C)", "梯度裁剪阈值", "0.1~1.0", "控制敏感度上限"],
                    ["delta (δ)", "失败概率", "1e-5~1e-3", "应小于 1/N，N 为样本数"],
                    ["epochs", "训练轮数", "5~50", "轮数越多隐私预算消耗越大"],
                    ["batch_size", "批次大小", "256~2048", "大批次降低相对噪声"]
                ]
            },
            mermaid: `graph LR
    A["输入批次数据"] --> B["计算 per-sample 梯度"]
    B --> C["梯度裁剪 max_grad_norm"]
    C --> D["聚合平均梯度"]
    D --> E["添加高斯噪声"]
    E --> F["更新模型参数"]
    F --> G["矩会计追踪 ε"]
    G --> H{"ε < 目标?"}
    H -->|"是"| I["继续训练"]
    H -->|"否"| J["停止训练"]`,
            tip: "增大 batch_size 是提升 DP-SGD 精度最有效的方法之一，因为信噪比随批次大小线性增长",
            warning: "DP-SGD 的 per-sample 梯度计算会显著增加显存占用，注意使用梯度累积缓解"
        },
        {
            title: "4. 联邦学习架构",
            body: `联邦学习（Federated Learning, FL）是一种分布式机器学习范式，由 Google 于 2016 年首次提出。其核心思想是"数据不动模型动"：多个参与方在本地训练模型，仅上传模型更新（梯度或权重）到中央服务器进行聚合，原始数据始终保留在本地。经典的 FedAvg 算法流程为：服务器广播全局模型 → 各客户端本地训练若干 epoch → 客户端上传更新 → 服务器加权平均聚合 → 迭代至收敛。联邦学习天然提供了数据隔离的隐私优势，但仅此不足以抵御推断攻击——模型更新本身仍可能泄露训练数据信息。因此，生产级联邦学习通常与差分隐私或安全多方计算结合使用。主流的联邦学习框架包括 Flower、FATE 和 FedML。`,
            code: [
                {
                    lang: "python",
                    code: `# FedAvg 算法核心逻辑（简化版）
import copy
import numpy as np
import torch

def fedavg(global_model, client_datasets, client_weights, local_epochs=5, lr=0.01):
    """联邦平均算法"""
    num_clients = len(client_datasets)
    local_updates = []

    for i in range(num_clients):
        # 克隆全局模型到客户端
        local_model = copy.deepcopy(global_model)
        optimizer = torch.optim.SGD(local_model.parameters(), lr=lr)

        # 本地训练
        for epoch in range(local_epochs):
            for x_batch, y_batch in client_datasets[i]:
                optimizer.zero_grad()
                loss = local_model(x_batch, y_batch)
                loss.backward()
                optimizer.step()

        # 计算模型更新量
        update = {}
        for name, param in local_model.named_parameters():
            global_param = dict(global_model.named_parameters())[name]
            update[name] = param.data - global_param.data
        local_updates.append(update)

    # 加权平均聚合
    total_weight = sum(client_weights)
    aggregated = {}
    for name in global_model.state_dict():
        aggregated[name] = sum(w * local_updates[i][name]
                               for i, w in enumerate(client_weights)) / total_weight

    # 更新全局模型
    for name, param in global_model.named_parameters():
        param.data += aggregated[name]
    return global_model`
                },
                {
                    lang: "python",
                    code: `# 使用 Flower 框架实现联邦学习
import flwr as fl
import torch
import torch.nn as nn

class FlowerClient(fl.client.NumPyClient):
    def __init__(self, model, train_loader, val_loader):
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader

    def get_parameters(self, config):
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters):
        state_dict = dict(zip(self.model.state_dict().keys(),
                              [torch.tensor(p) for p in parameters]))
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
        self.model.train()
        for x, y in self.train_loader:
            optimizer.zero_grad()
            loss = nn.CrossEntropyLoss()(self.model(x), y)
            loss.backward()
            optimizer.step()
        return self.get_parameters(config), len(self.train_loader), {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        correct, total = 0, 0
        self.model.eval()
        with torch.no_grad():
            for x, y in self.val_loader:
                correct += (self.model(x).argmax(1) == y).sum().item()
                total += len(y)
        return float(correct / total), total, {"accuracy": correct / total}

# 启动客户端
fl.client.start_numpy_client(server_address="0.0.0.0:8080",
                              client=FlowerClient(model, train_loader, val_loader))`
                }
            ],
            table: {
                headers: ["架构模式", "特点", "适用场景", "隐私级别"],
                rows: [
                    ["横向联邦", "样本不同、特征相同", "多机构协同建模", "中（需结合 DP）"],
                    ["纵向联邦", "样本相同、特征不同", "跨域特征融合", "中高"],
                    ["联邦迁移", "样本和特征都不同", "跨域知识迁移", "中"],
                    ["去中心化 FL", "无中央服务器", "P2P 协作网络", "高"],
                    ["个性化 FL", "保留客户端特异性", "异构数据场景", "中"]
                ]
            },
            mermaid: `graph TD
    A["中央服务器"] -->|"下发全局模型"| B["客户端 1"]
    A -->|"下发全局模型"| C["客户端 2"]
    A -->|"下发全局模型"| D["客户端 N"]
    B -->|"本地训练"| E["本地更新 Δw1"]
    C -->|"本地训练"| F["本地更新 Δw2"]
    D -->|"本地训练"| G["本地更新 ΔwN"]
    E -->|"上传更新"| A
    F -->|"上传更新"| A
    G -->|"上传更新"| A
    A -->|"FedAvg 聚合"| A
    class D s2
    class C s1
    class B s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#0c4a6e
    classDef s2 fill:#0c4a6e`,
            tip: "在非独立同分布（Non-IID）数据场景下，建议使用 FedProx 或 SCAFFOLD 等改进算法",
            warning: "纯联邦学习不等于隐私安全，模型梯度仍可通过逆向工程泄露训练数据"
        },
        {
            title: "5. 安全多方计算",
            body: `安全多方计算（Secure Multi-Party Computation, MPC）允许多个参与方在不泄露各自输入的前提下协同计算一个函数。其理论基础是 Yao 的百万富翁问题（1982），核心协议包括混淆电路（Garbled Circuits）、秘密分享（Secret Sharing）和不经意传输（Oblivious Transfer）。在机器学习场景中，MPC 主要用于隐私保护的推理和训练。例如，多个医院希望联合训练疾病预测模型但不愿共享患者数据，MPC 可以确保各方只能看到最终结果而无法推断其他方的输入。MPC 的主要挑战在于通信开销和计算复杂度——相比明文计算通常会有 10~1000 倍的性能损失。近年来，CrypTFlow、ABY 和 SecureNN 等框架显著提升了 MPC 在深度学习中的实用性。`,
            code: [
                {
                    lang: "python",
                    code: `# 加法秘密分享（Additive Secret Sharing）示意
import numpy as np

class AdditiveSecretSharing:
    """基于模运算的加法秘密分享（2-out-of-2 方案）"""
    def __init__(self, prime=232 - 5):
        self.prime = prime  # 大素数

    def share(self, value, n_parties=2):
        """将 value 拆分为 n_parties 个份额"""
        shares = np.random.randint(0, self.prime, size=n_parties - 1)
        last_share = (value - sum(shares)) % self.prime
        shares = list(shares) + [last_share]
        return shares

    def reconstruct(self, shares):
        """从所有份额恢复原始值"""
        return sum(shares) % self.prime

# 示例：两方安全加法
ss = AdditiveSecretSharing()
x_shares = ss.share(42)
y_shares = ss.share(17)
# 各方在本地计算份额之和（无需交换原始值）
z_shares = [(x_shares[i] + y_shares[i]) % ss.prime for i in range(2)]
result = ss.reconstruct(z_shares)
print(f"安全加法结果: {result}")  # 输出 59`
                },
                {
                    lang: "python",
                    code: `# 使用 CrypTen 进行隐私保护推理
import crypten
import torch

# 初始化 CrypTen（多进程环境）
crypten.init()

# 以加密张量加载模型和数据
@crypten.compiler.compile()
class PrivateModel(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = torch.nn.Linear(10, 5)
        self.fc2 = torch.nn.Linear(5, 2)

    def forward(self, x):
        x = self.fc1(x)
        x = torch.relu(x)
        return self.fc2(x)

# 加密推理
def private_inference(model, private_input):
    """在加密状态下执行模型推理"""
    # cryptensor 表示加密张量
    encrypted_input = crypten.cryptensor(private_input)
    encrypted_output = model(encrypted_input)
    # 只有授权方可以解密
    return encrypted_output.get_plain_text()

# 注意：CrypTen 需要多进程设置，此处为示意代码
print("CrypTen 支持在加密状态下执行完整的神经网络推理")`
                }
            ],
            table: {
                headers: ["MPC 协议", "通信轮数", "适用运算", "安全性"],
                rows: [
                    ["加法秘密分享", "1 轮", "加/减/标量乘", "诚实大多数"],
                    ["混淆电路", "1 轮", "任意布尔电路", "半诚实/恶意"],
                    ["SPDZ 协议", "多轮", "通用算术电路", "恶意安全"],
                    ["ABY 框架", "混合", "混合电路", "半诚实"],
                    ["SecureNN", "多轮", "DNN 专用", "半诚实"]
                ]
            },
            mermaid: `graph LR
    A["参与方 A 输入 x"] --> C["MPC 协议"]
    B["参与方 B 输入 y"] --> C
    C -->|"加密计算"| D["f(x, y)"]
    D -->|"解密"| E["参与方 A 得到结果"]
    D -->|"解密"| F["参与方 B 得到结果"]
    C -.->|"A 不知道 y"| A
    C -.->|"B 不知道 x"| B
    class C s0
    classDef s0 fill:#7c2d12`,
            tip: "对于简单的统计聚合任务，秘密分享的开销远小于混淆电路，优先选择轻量级方案",
            warning: "MPC 的性能瓶颈主要在通信而非计算，高延迟网络会显著拖慢 MPC 协议执行"
        },
        {
            title: "6. 同态加密",
            body: `同态加密（Homomorphic Encryption, HE）允许在加密数据上直接进行计算，解密后的结果与在明文上计算的结果一致。根据支持的运算类型，同态加密分为三类：部分同态加密（PHE，仅支持单一运算如 RSA 的乘法同态）、某些同态加密（SHE，支持有限次数的加法和乘法）和全同态加密（FHE，支持任意次数的加法和乘法）。Gentry 于 2009 年构造了第一个 FHE 方案，基于理想格理论。现代 FHE 库如 Microsoft SEAL、TFHE 和 OpenFHE 已实现实用的性能。在机器学习中，HE 可用于隐私保护的推理场景：服务器在不解密用户输入的情况下完成模型推理，返回加密结果由用户自行解密。HE 的主要限制是无法高效执行非线性操作（如 ReLU、Softmax），通常需要使用多项式近似替代。`,
            code: [
                {
                    lang: "python",
                    code: `# 使用 Pyfhel 进行同态加密计算
from Pyfhel import Pyfhel

# 初始化同态加密上下文
he = Pyfhel()
he.contextGen(p=65537, m=215, sec=128)  # 参数设置
he.keyGen()  # 密钥生成
he.relinKeyGen()  # 重线性化密钥（用于乘法）

# 加密数据
a = he.encryptInt(42)
b = he.encryptInt(17)

# 在加密状态下计算
c_add = a + b       # 同态加法
c_mul = a * b       # 同态乘法

# 解密验证
print(f"解密加法: {he.decryptInt(c_add)}")  # 59
print(f"解密乘法: {he.decryptInt(c_mul)}")  # 714

# CKKS 方案支持浮点数同态运算（适用于 ML）
he_ckks = Pyfhel()
he_ckks.contextGen(p=None, m=215, sec=128, scale=240)
he_ckks.keyGen()
he_ckks.relinKeyGen()

x = he_ckks.encryptFrac([0.5, 1.2, -0.3])
y = he_ckks.encryptFrac([0.1, 0.8, 0.5])
z = x + y
print(f"CKKS 解密: {he_ckks.decryptFrac(z)}")  # [0.6, 2.0, 0.2]`
                },
                {
                    lang: "python",
                    code: `# TenSEAL: 用于机器学习的同态加密库
import tenseal as ts

# 创建 CKKS 上下文
context = ts.context(
    ts.SCHEME_TYPE.CKKS,
    poly_modulus_degree=8192,
    coeff_mod_bit_sizes=[60, 40, 40, 60]
)
context.global_scale = 2**40
context.generate_galois_keys()
context.generate_relin_keys()

# 构建简单的隐私保护推理
class HomomorphicInference:
    def __init__(self, context, weights, bias):
        self.context = context
        self.weights = ts.ckks_vector(context, weights)
        self.bias = ts.ckks_vector(context, bias)

    def linear_layer(self, encrypted_input):
        """同态线性层：y = xW + b"""
        result = encrypted_input.mm(self.weights)
        result = result + self.bias
        return result

# 使用示例
weights = [[0.1, 0.2], [0.3, 0.4]]
bias = [0.5, 0.6]
model = HomomorphicInference(context, weights, bias)

client_input = ts.ckks_vector(context, [1.0, 2.0])
encrypted_result = model.linear_layer(client_input)
# 客户端本地解密
print(f"推理结果: {encrypted_result.decrypt()}")`
                }
            ],
            table: {
                headers: ["HE 方案", "支持运算", "密文膨胀", "典型延迟"],
                rows: [
                    ["RSA / Paillier (PHE)", "乘法 / 加法", "2x", "<1ms"],
                    ["BFV / BGV", "整数加减乘", "10~100x", "10~100ms"],
                    ["CKKS", "浮点近似计算", "10~100x", "10~100ms"],
                    ["TFHE", "布尔门电路", "1000x+", "秒级"],
                    ["DM", "通用算术电路", "100~1000x", "秒级"]
                ]
            },
            mermaid: `graph LR
    A["客户端明文输入"] --> B["HE 加密"]
    B -->|"密文"| C["服务器"]
    C -->|"同态计算"| D["密文输出"]
    D -->|"密文"| E["客户端"]
    E --> F["HE 解密"]
    F --> G["明文结果"]
    C -.->|"服务器无法看到明文"| B
    C -.->|"服务器无法看到明文"| D
    class C s0
    classDef s0 fill:#881337`,
            tip: "CKKS 方案最适合 ML 推理，它原生支持浮点数运算且精度可调",
            warning: "同态加密无法高效处理 ReLU 等非线性激活函数，需要使用多项式近似（如 square 激活）"
        },
        {
            title: "7. PySyft 与 Flower 实战",
            body: `PySyft 和 Flower 是当前最活跃的两个开源隐私保护 ML 框架。PySyft 由 OpenMined 社区开发，专注于在深度学习框架中集成差分隐私、联邦学习和安全多方计算，支持与 PyTorch 和 TensorFlow 的无缝衔接。其核心抽象是远程张量（Remote Tensor），允许用户像操作本地张量一样操作远程加密数据。Flower 则是一个通用的联邦学习框架，具有出色的灵活性和可扩展性，支持任意 ML 框架、自定义聚合策略和异构客户端管理。在实际项目中，通常会组合使用多个技术：例如用 Flower 管理联邦学习流程，在客户端使用 PySyft 进行本地差分隐私保护，在聚合阶段结合同态加密或安全多方计算。这种纵深防御策略能提供最全面的隐私保障。`,
            code: [
                {
                    lang: "python",
                    code: `# PySyft: 远程执行 + 差分隐私
import syft as sy
import torch

# 创建虚拟工作节点
alice = sy.VirtualWorker(hook=None, id="alice")
bob = sy.VirtualWorker(hook=None, id="bob")

# 发送数据到远程节点（数据不出本地机器，只在虚拟节点间传递引用）
x = torch.tensor([1, 2, 3, 4]).send(alice)
y = torch.tensor([5, 6, 7, 8]).send(bob)

# 远程计算：结果仍留在远程节点
z = x + y.send(alice)

# 差分隐私训练：使用 Opacus 集成
from opacus import PrivacyEngine
import torch.nn as nn

model = nn.Linear(10, 2)
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)
privacy_engine = PrivacyEngine()
model, optimizer, dataloader = privacy_engine.make_private(
    module=model, optimizer=optimizer, data_loader=train_loader,
    noise_multiplier=0.8, max_grad_norm=0.5
)
# 训练循环与常规 PyTorch 一致，Opacus 自动注入隐私保护
print("PySyft + Opacus: 远程数据 + 差分隐私训练")`
                },
                {
                    lang: "python",
                    code: `# Flower: 带差分隐私的联邦学习
import flwr as fl
import torch
from opacus import PrivacyEngine

class DPFedAvgClient(fl.client.NumPyClient):
    """集成差分隐私的 Flower 客户端"""
    def __init__(self, model, train_loader, val_loader,
                 noise_multiplier=1.0, max_grad_norm=1.0):
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.privacy_engine = PrivacyEngine()
        # 包装 optimizer 实现 DP-SGD
        self.optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
        self.model, self.optimizer, _ = self.privacy_engine.make_private(
            module=self.model, optimizer=self.optimizer,
            data_loader=self.train_loader,
            noise_multiplier=noise_multiplier,
            max_grad_norm=max_grad_norm,
        )

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        self.model.train()
        for epoch in range(3):
            for x, y in self.train_loader:
                self.optimizer.zero_grad()
                loss = torch.nn.CrossEntropyLoss()(self.model(x), y)
                loss.backward()
                self.optimizer.step()
        epsilon = self.privacy_engine.get_epsilon(delta=1e-5)
        return self.get_parameters(), len(self.train_loader), {"epsilon": epsilon}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        self.model.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for x, y in self.val_loader:
                correct += (self.model(x).argmax(1) == y).sum().item()
                total += len(y)
        return float(correct / total), total, {"accuracy": correct / total}`
                }
            ],
            table: {
                headers: ["框架", "核心能力", "ML 后端", "隐私技术"],
                rows: [
                    ["PySyft", "远程执行 + 加密张量", "PyTorch/TF", "DP, SMPC, HE"],
                    ["Flower", "联邦编排 + 策略", "任意框架", "FL 框架（需插件加 DP）"],
                    ["FATE", "工业级联邦平台", "自研", "FL, MPC, HE"],
                    ["FedML", "研究基准平台", "PyTorch/TF", "多种 FL 算法"],
                    ["TF Encrypted", "隐私保护推理", "TensorFlow", "MPC, DP"]
                ]
            },
            mermaid: `graph TD
    A["隐私保护 ML 技术栈"] --> B["差分隐私 DP"]
    A --> C["联邦学习 FL"]
    A --> D["安全多方计算 MPC"]
    A --> E["同态加密 HE"]
    B --> F["DP-SGD"]
    B --> G["隐私预算追踪"]
    C --> H["FedAvg"]
    C --> I["Flower 编排"]
    D --> J["秘密分享"]
    D --> K["混淆电路"]
    E --> L["CKKS"]
    E --> M["TFHE"]
    F --> N["PySyft"]
    I --> N
    J --> N
    L --> N
    N --> O["纵深防御的隐私 ML 系统"]`,
            tip: "生产环境推荐 Flower + PySyft + Opacus 组合：Flower 管编排，PySyft 管远程计算，Opacus 管差分隐私",
            warning: "隐私保护技术会带来精度损失和性能开销，必须在项目早期评估隐私-效用权衡"
        },
    ],
};
