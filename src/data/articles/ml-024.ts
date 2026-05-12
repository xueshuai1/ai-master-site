import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-024",
    title: "联邦学习（二）：隐私保护的分布式机器学习",
    category: "ml",
    tags: ["联邦学习", "隐私保护", "FedAvg", "差分隐私", "分布式训练"],
    summary: "从 FedAvg 到 FedProx，从差分隐私到安全聚合，掌握联邦学习的核心算法、通信优化、异构数据处理和工业级部署实践",
    date: "2026-04-13",
    readTime: "22 min",
    level: "进阶",
  learningPath: {
    routeId: "privacy-series",
    phase: 2,
    order: 2,
    nextStep: null,
    prevStep: "ethics-003",
  },
    content: [
        {
            title: "1. 为什么需要联邦学习？数据隐私与 AI 的矛盾",
            body: `传统机器学习要求将所有数据集中到一处进行训练。但在医疗、金融、移动设备等场景中，数据隐私法规（如 GDPR、HIPAA）和用户隐私期望使得集中式数据收集变得不可行。联邦学习（Federated Learning, FL）正是为解决这一矛盾而生。

联邦学习的核心思想可以用一句话概括："把代码送到数据那里，而不是把数据送到代码那里。" 一个全局模型被分发给多个参与方（客户端），每个参与方在本地数据上训练该模型，只将模型更新（权重或梯度）传回中央服务器进行聚合，而原始数据始终保留在本地。

这种范式带来了双重优势：隐私保护——原始数据不出本地，大幅降低数据泄露风险；合规友好——无需跨机构转移数据，天然满足数据主权要求。

但联邦学习也面临独特挑战：通信瓶颈——模型更新在网络上传输的开销远大于集中式训练的本地内存拷贝；数据异构性（Non-IID）——各客户端的数据分布往往高度不均匀；系统异构性——不同设备的计算能力和网络带宽差异巨大。`,
            mermaid: `graph LR
    A["中央服务器 Global Model"] -->|"下发模型"| B["客户端 A 数据 A"]
    A -->|"下发模型"| C["客户端 B 数据 B"]
    A -->|"下发模型"| D["客户端 C 数据 C"]
    B -->|"上传梯度"| A
    C -->|"上传梯度"| A
    D -->|"上传梯度"| A
    class D s3
    class C s2
    class B s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12
    classDef s2 fill:#7c2d12
    classDef s3 fill:#7c2d12`,
        },
        {
            title: "2. FedAvg：联邦学习的基石算法",
            body: `FedAvg（Federated Averaging）是 McMahan 等人在 2017 年提出的第一个联邦学习算法，至今仍是大多数联邦学习系统的起点。理解 FedAvg 是理解一切联邦学习优化的前提。

算法流程非常直观：服务器选择一个客户端子集，将当前全局模型发送给它们；每个客户端在本地数据上运行若干轮 SGD（随机梯度下降）；客户端将更新后的模型权重传回服务器；服务器对所有客户端的权重进行加权平均（按数据量加权），得到新的全局模型。

FedAvg 的关键创新在于本地多轮更新（Local Epochs）。在传统的分布式 SGD 中，每个客户端只计算一次梯度就上传，通信开销极大。FedAvg 允许客户端在本地执行多个训练步骤后再上传，大幅减少了通信轮数。

但 FedAvg 在非独立同分布（Non-IID）数据上表现不佳。当不同客户端的数据分布差异较大时（比如医院 A 主要处理肺炎病例，医院 B 主要处理骨折病例），全局模型的加权平均会导致各客户端的本地更新相互抵消，收敛速度显著下降。这就是后续 FedProx、FedMA 等算法要解决的问题。`,
            code: [
                {
                    lang: "python",
                    filename: "fedavg_demo.py",
                    code: `# FedAvg 核心算法实现
import numpy as np
from typing import List, Tuple

def fedavg_round(
    global_weights: List[np.ndarray],
    client_weights: List[List[np.ndarray]],
    client_data_sizes: List[int],
) -> List[np.ndarray]:
    """执行一轮 FedAvg 聚合。
    
    Args:
        global_weights: 当前全局模型权重列表（每层一个数组）
        client_weights: 各客户端更新后的权重，格式为 [client_i][layer_j]
        client_data_sizes: 各客户端的数据量（用于加权）
    """
    total_size = sum(client_data_sizes)
    new_global = []
    
    for layer_idx in range(len(global_weights)):
        # 按数据量加权平均
        weighted_sum = np.zeros_like(global_weights[layer_idx])
        for client_idx, cw in enumerate(client_weights):
            weight = client_data_sizes[client_idx] / total_size
            weighted_sum += weight * cw[layer_idx]
        new_global.append(weighted_sum)
    
    return new_global


def client_update(
    local_weights: List[np.ndarray],
    local_data,
    local_labels,
    epochs: int = 5,
    learning_rate: float = 0.01,
) -> List[np.ndarray]:
    """客户端本地训练。
    
    每个客户端在本地数据上执行多轮 SGD，
    这是 FedAvg 减少通信轮数的关键设计。
    """
    # 简化的 SGD 实现（实际使用 PyTorch/JAX）
    for epoch in range(epochs):
        # 计算梯度
        gradients = compute_gradients(local_weights, local_data, local_labels)
        # 更新权重
        for layer_idx in range(len(local_weights)):
            local_weights[layer_idx] -= learning_rate * gradients[layer_idx]
    
    return local_weights


# 模拟一轮联邦学习
n_clients = 10
n_layers = 4
global_weights = [np.random.randn(100) for _ in range(n_layers)]

# 各客户端本地训练
client_updates = []
data_sizes = []
for i in range(n_clients):
    local_w = [w.copy() for w in global_weights]
    local_w = client_update(local_w, f"data_{i}", f"labels_{i}")
    client_updates.append(local_w)
    data_sizes.append(np.random.randint(500, 5000))

# 服务器聚合
global_weights = fedavg_round(global_weights, client_updates, data_sizes)
print(f"完成一轮 FedAvg 聚合，{n_clients} 个客户端参与")`
                }
            ],
        },
        {
            title: "3. 应对 Non-IID 数据：从 FedProx 到 FedMA",
            body: `Non-IID 数据是联邦学习最大的挑战之一。在现实世界中，数据分布的异构性无处不在：不同用户的打字习惯不同、不同医院的病例类型不同、不同地区的消费行为不同。当每个客户端的数据分布偏离全局分布时，简单的 FedAvg 就会出现问题。

FedProx（Federated Learning with Proximal Term）通过在本地损失函数中添加一个近端项（Proximal Term）来解决这个问题。这个项约束本地模型不要偏离全局模型太远。数学上，本地优化目标变为：L_local(θ) + (μ/2)·||θ - θ_global||²。参数 μ 控制约束强度——μ 越大，本地更新越保守，越不容易"跑偏"。

FedMA（Federated Matching Averaging）走的是另一条路：它认识到不同客户端的神经元可能学习到了不同的特征，简单的权重平均没有意义。FedMA 通过层对层的匹配（Layer-wise Matching），先对齐不同客户端的神经元，再进行聚合。这在 CNN 和 LSTM 上效果显著。

MOON（Model-Contrastive Federated Learning）则引入了对比学习的思想：它鼓励本地模型学习到的表示与全局模型学习到的表示保持一致，同时保留本地数据的特异性。这种方法在图像分类和 NLP 任务上都有出色的表现。`,
            table: {
                headers: ["算法", "核心思想", "适用场景", "通信开销", "Non-IID 鲁棒性"],
                rows: [
                    ["FedAvg", "加权平均本地权重", "IID 数据基线", "低", "弱"],
                    ["FedProx", "近端项约束本地更新", "系统异构 + Non-IID", "低", "中"],
                    ["FedMA", "神经元匹配后聚合", "CNN/LSTM 架构", "中", "强"],
                    ["MOON", "对比学习对齐表示", "视觉 + NLP", "中", "强"],
                    ["FedProc", "原型对比学习", "分类任务", "中", "强"],
                ],
            },
            warning: `⚠️ Non-IID 诊断技巧：在部署联邦学习之前，先用 KL 散度或 Wasserstein 距离量化各客户端数据分布的差异。如果差异过大（KL 散度 > 2），标准的 FedAvg 很可能不收敛，应直接选择 FedProx 或 FedMA。`,
        },
        {
            title: "4. 差分隐私：给联邦学习加一把锁",
            body: `联邦学习虽然不把原始数据传出本地，但模型更新（梯度）本身就可能泄露信息。研究表明，攻击者可以通过分析梯度反推出训练数据中的敏感内容（如姓名、身份证号、医疗记录）。这就是为什么差分隐私（Differential Privacy, DP）成为联邦学习不可或缺的补充。

差分隐私的核心机制是在模型更新中添加可控的随机噪声。具体来说，每个客户端在上传梯度之前，先对梯度进行裁剪（Clipping），限制单个样本对梯度的最大影响（L2 范数裁剪），然后添加高斯噪声。噪声的幅度由隐私预算 ε（epsilon）控制：ε 越小，隐私保护越强，但模型精度下降越多。

DP-FedAvg 是联邦学习中最常用的差分隐私方案。它与标准 FedAvg 的区别仅在于客户端上传梯度时添加了噪声。关键在于隐私预算的累积管理——每一轮训练都会消耗一部分隐私预算，需要通过矩会计（Moments Accountant）或 RDP（Rényi Differential Privacy）精确追踪总消耗量。

2024-2025 年的一个重要趋势是联邦学习 + LoRA的结合。由于 LoRA 只训练低秩适配器（通常只有模型参数的 0.1%-1%），需要传输的数据量大幅减少，同时噪声对低秩空间的影响也更可控。NeurIPS 2025 的 FedASK 工作进一步将 DP-Sketching 引入联邦 LoRA，在保护隐私的同时保持了高质量的联合微调效果。`,
            code: [
                {
                    lang: "python",
                    filename: "dp_fedavg.py",
                    code: `# DP-FedAvg：差分隐私联邦学习
import numpy as np

class DPClient:
    """支持差分隐私的联邦学习客户端"""
    
    def __init__(
        self, 
        client_id: int,
        noise_multiplier: float = 1.0,
        max_grad_norm: float = 1.0,
    ):
        self.client_id = client_id
        self.noise_multiplier = noise_multiplier  # 噪声倍数 σ
        self.max_grad_norm = max_grad_norm        # 梯度裁剪阈值 C
    
    def compute_private_gradient(
        self, 
        model, 
        data, 
        labels,
        batch_size: int = 32,
    ) -> np.ndarray:
        """计算带差分隐私保护的梯度。
        
        步骤：
        1. 计算每个样本的梯度
        2. 按 max_grad_norm 裁剪每个样本梯度
        3. 聚合裁剪后的梯度
        4. 添加高斯噪声
        """
        # 计算每个样本梯度（实际框架中自动完成）
        per_sample_grads = compute_per_sample_gradients(
            model, data, labels
        )
        
        # 梯度裁剪
        norms = np.linalg.norm(per_sample_grads, axis=1, keepdims=True)
        clipped_grads = per_sample_grads * np.minimum(
            1.0, self.max_grad_norm / (norms + 1e-8)
        )
        
        # 聚合
        avg_grad = clipped_grads.mean(axis=0)
        
        # 添加高斯噪声
        noise = np.random.normal(
            0, 
            self.noise_multiplier * self.max_grad_norm, 
            avg_grad.shape
        )
        
        return avg_grad + noise
    
    def get_privacy_budget(
        self, n_rounds: int, n_clients: int, delta: float = 1e-5
    ) -> float:
        """使用高级组合定理估算 ε 隐私预算。
        
        简化版 RDP → (ε, δ)-DP 转换
        """
        q = 1.0 / n_clients  # 采样率
        sigma = self.noise_multiplier
        # 简化的隐私预算估算（实际使用 opacus 库）
        epsilon = np.sqrt(
            2 * n_rounds * np.log(1/delta) * (q2) / (sigma2)
        )
        return epsilon


# 使用示例
client = DPClient(client_id=0, noise_multiplier=0.5, max_grad_norm=1.0)
# private_grad = client.compute_private_gradient(model, data, labels)
budget = client.get_privacy_budget(n_rounds=100, n_clients=50)
print(f"100 轮训练后的隐私预算 ε ≈ {budget:.2f}")`
                }
            ],
        },
        {
            title: "5. 通信优化：让联邦学习真正可用",
            body: `联邦学习的最大瓶颈之一是通信。在一个典型的场景中，1000 个客户端每轮需要上传一个 100MB 的模型，即使只选 10% 的客户端参与，每轮的通信量也高达 10GB。在实际部署中，这种开销是不可接受的。

模型压缩是最直接的优化手段。主要包括三种技术：量化（Quantization）——将 32 位浮点权重压缩到 8 位甚至更低，通信量减少 4 倍；稀疏化（Sparsification）——只传输变化最大的梯度分量（如 Top-k 稀疏化），其余置零；低秩近似——用低秩矩阵近似权重更新，只传输分解后的因子。

异步联邦学习打破了同步等待的限制。在标准 FedAvg 中，服务器必须等待所有选定客户端完成训练才能聚合。在异构环境中，慢速客户端（"掉队者"，Stragglers）会严重拖慢整体进度。异步方案允许服务器在收到足够多的客户端更新后立即聚合，不等待所有人完成。

分层联邦学习（Hierarchical FL）引入中间聚合节点。例如，在大规模物联网场景中，设备先将更新发送到边缘网关，网关进行局部聚合后再发送到云端。这种分层架构大幅减少了长距离通信量，特别适合地理分布广泛的部署。`,
            mermaid: `graph TD
    A["通信优化策略"] --> B["模型压缩"]
    A --> C["异步聚合"]
    A --> D["客户端选择"]
    A --> E["分层架构"]
    
    B --> B1["量化 FP32→INT8"]
    B --> B2["稀疏化 Top-k"]
    B --> B3["低秩近似"]
    
    C --> C1["忽略掉队者"]
    C --> C2["staleness-aware 更新"]
    
    D --> D1["基于资源选择"]
    D --> D2["基于数据多样性选择"]
    
    E --> E1["设备→边缘网关"]
    E --> E2["边缘网关→云端"]`,
        },
        {
            title: "6. 联邦学习的工业级框架与部署",
            body: `到 2026 年，联邦学习已经从学术研究走向了大规模工业部署。医疗、金融、移动设备三大领域是落地最成熟的场景。

Flower（flwr.dev） 是目前最流行的联邦学习框架之一。它的设计理念是"框架无关"——支持 PyTorch、TensorFlow、JAX、甚至 scikit-learn。Flower 的架构非常灵活：服务器和客户端通过 gRPC 通信，客户端可以是手机、服务器、甚至浏览器中的 WebAssembly 模块。Flower 还支持安全聚合（Secure Aggregation）和差分隐私的内置集成。

FATE（Federated AI Technology Enabler） 是微众银行开源的企业级联邦学习平台。它的特点是支持横向联邦（样本重叠少、特征空间相同）和纵向联邦（样本重叠多、特征空间不同）两种模式。纵向联邦特别适合金融风控场景——多家银行可以联合训练风控模型而不共享客户数据。

PySyft 是 OpenMined 开发的隐私计算框架，结合了联邦学习和安全多方计算（MPC）。它的独特优势是加密计算——即使在聚合阶段，服务器也无法看到单个客户端的更新。

部署联邦学习的最佳实践：(1) 从小规模 PoC 开始，先验证模型质量和通信开销；(2) 使用 Flower 的仿真模式（Simulation Mode）在单机上模拟多客户端行为；(3) 在生产环境中先采用 FedProx 而非 FedAvg，因为真实数据几乎总是 Non-IID 的；(4) 始终启用差分隐私——即使法规不要求，它也是防御梯度反演攻击的有效手段。`,
            code: [
                {
                    lang: "python",
                    filename: "flower_example.py",
                    code: `# Flower 框架示例：构建一个联邦学习系统
import flwr as fl
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

# 1. 定义模型
class SimpleNet(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int, num_classes: int):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, num_classes)
    
    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))

# 2. 定义 Flower Client
class FlowerClient(fl.client.NumPyClient):
    def __init__(self, model, train_loader, val_loader):
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
    
    def get_parameters(self, config):
        return [v.cpu().numpy() for v in self.model.state_dict().values()]
    
    def set_parameters(self, parameters):
        state_dict = {
            k: torch.tensor(v) 
            for k, v in zip(self.model.state_dict().keys(), parameters)
        }
        self.model.load_state_dict(state_dict)
    
    def fit(self, parameters, config):
        """本地训练"""
        self.set_parameters(parameters)
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.01)
        criterion = nn.CrossEntropyLoss()
        
        self.model.train()
        for epoch in range(3):  # 本地 3 个 epoch
            for batch_x, batch_y in self.train_loader:
                batch_x, batch_y = batch_x.to(self.device), batch_y.to(self.device)
                optimizer.zero_grad()
                loss = criterion(self.model(batch_x), batch_y)
                loss.backward()
                optimizer.step()
        
        return self.get_parameters(config={}), len(self.train_loader.dataset), {}
    
    def evaluate(self, parameters, config):
        """本地评估"""
        self.set_parameters(parameters)
        self.model.eval()
        
        correct, total, loss = 0, 0, 0.0
        criterion = nn.CrossEntropyLoss()
        with torch.no_grad():
            for batch_x, batch_y in self.val_loader:
                batch_x, batch_y = batch_x.to(self.device), batch_y.to(self.device)
                outputs = self.model(batch_x)
                loss += criterion(outputs, batch_y).item()
                correct += (outputs.argmax(1) == batch_y).sum().item()
                total += batch_y.size(0)
        
        accuracy = correct / total
        return float(loss), total, {"accuracy": accuracy}

# 3. 启动 Flower 服务器
# strategy = fl.server.strategy.FedProx(
#     fraction_fit=0.1,      # 每轮选择 10% 客户端
#     fraction_evaluate=0.1,
#     proximal_mu=0.1,       # FedProx 的 μ 参数
# )
# fl.server.start_server(
#     server_address="0.0.0.0:8080",
#     config=fl.server.ServerConfig(num_rounds=50),
#     strategy=strategy,
# )`
                }
            ],
            tip: `💡 仿真优先：在生产部署之前，使用 Flower 的 Simulation Engine 在单机上模拟数百个客户端的行为。这可以帮助你提前发现收敛问题和通信瓶颈，而无需实际部署到所有设备上。`,
        },
        {
            title: "7. 联邦学习的未来：从边缘到云端的全栈隐私计算",
            body: `联邦学习的未来不仅仅是一个算法的演进，而是整个 AI 基础设施的重构。到 2026 年，我们已经看到了几个清晰的趋势。

联邦大模型微调是当前的热点。LLM 的微调需要大量领域特定数据，而这些数据往往分布在不同的组织手中。联邦 LoRA（Federated LoRA）允许多个组织联合微调一个 LLM，每个组织只训练自己的低秩适配器，然后通过联邦学习聚合。这不仅保护了数据隐私，还大幅降低了通信开销——因为只需要传输 LoRA 适配器（通常只有几 MB），而不是整个模型（几十 GB）。

联邦学习与安全计算的融合是另一个重要方向。单纯的安全聚合（Secure Aggregation）只能防止服务器看到单个客户端的更新，但无法防御恶意客户端的投毒攻击（Poisoning）。联邦平均（Federated Averaging）本身对投毒也很敏感。未来的趋势是将联邦学习与同态加密（HE）、安全多方计算（MPC）、零知识证明（ZKP）深度融合，构建多层防御体系。

去中心化联邦学习正在探索中。传统的联邦学习依赖一个可信的中央服务器进行聚合。去中心化方案（如基于区块链的联邦学习）消除了对中央服务器的信任依赖，每个参与方既是客户端也是聚合节点。这在加密货币和 Web3 场景中有独特的价值。

联邦学习的标准化也在推进。2025 年，IEEE P3652.1 工作组发布了联邦学习的首个国际标准草案，涵盖了术语、架构、安全要求和评测基准。标准化将加速联邦学习在医疗、金融等高监管行业的落地。`,
            table: {
                headers: ["趋势", "核心挑战", "预计成熟时间", "代表工作"],
                rows: [
                    ["联邦大模型微调", "通信开销 + 异构架构", "2025-2026", "FedLoRA, FedASK"],
                    ["联邦 + 安全计算", "计算效率极低", "2026-2027", "SecureFL, CrypTen"],
                    ["去中心化联邦", "共识效率 + 激励机制", "2027+", "BlockFL"],
                    ["联邦学习标准化", "跨平台兼容性", "2025-2026", "IEEE P3652.1"],
                    ["联邦推荐系统", "冷启动 + 动态偏好", "2026", "FedRec++"],
                ],
            },
            tip: `💡 开始行动的建议：如果你的组织有多方数据协作需求但受隐私法规限制，联邦学习是最可行的技术路径。从 Flower 开始，选择一个具体的 Use Case（如联合风控、跨院区医疗影像分类），在仿真环境中验证可行性，再逐步推进到生产部署。`,
        },
    ],
};
