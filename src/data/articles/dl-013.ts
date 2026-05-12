import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-013",
    title: "图神经网络 GNN:GCN, GAT, GraphSAGE",
    category: "dl",
    tags: ["图神经网络", "GCN", "GAT"],
    summary: "从图卷积到注意力图网络，掌握非欧数据的深度学习方法",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. 图的表示与消息传递范式",
            body: `图（Graph）是表达实体间关系的通用数据结构。一个图 G = (V, E) 由节点集合 V 和边集合 E 组成，每个节点可以携带特征向量 X，每条边也可以有属性。与图像和文本等欧几里得数据不同，图没有固定的网格结构和自然的遍历顺序，这使得传统 CNN 和 RNN 无法直接处理。

图神经网络（GNN）的核心思想是「消息传递」（Message Passing）：每个节点从邻居收集信息，将收到的消息与自身状态聚合，然后更新自己的表示。这个过程可以形式化为三步：首先为每条边生成消息 m_uv = Message(h_u, h_v, e_uv)，然后将节点 v 的所有入消息聚合为 m_v = Aggregate({m_uv | u ∈ N(v)})，最后用更新函数 h_v' = Update(h_v, m_v) 产生新的节点表示。

消息传递之所以强大，是因为它是一种局部归纳偏置——每个节点的更新只依赖于其一跳邻居。通过多层堆叠，节点的表示可以聚合到 K 跳邻居的信息（K 为层数）。这种机制天然捕捉了图的局部结构，同时保持了参数共享和置换不变性。

消息传递范式统一了大量 GNN 变体：只要定义不同的 Message、Aggregate 和 Update 函数，就能得到不同的模型。GCN 使用加权平均聚合，GraphSAGE 使用均值或池化聚合，GAT 使用注意力加权聚合——它们都是消息传递框架的特例。理解这一统一视角，是深入学习 GNN 的关键前提。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from typing import Optional

class MessagePassingLayer(nn.Module):
    """通用消息传递层——GNN 的统一框架"""
    def __init__(self, in_dim, out_dim, edge_dim=0):
        super().__init__()
        self.in_dim = in_dim
        self.out_dim = out_dim
        self.use_edge_attr = edge_dim > 0
        
        if self.use_edge_attr:
            self.msg_net = nn.Sequential(
                nn.Linear(in_dim * 2 + edge_dim, out_dim),
                nn.ReLU(),
                nn.Linear(out_dim, out_dim),
            )
        else:
            self.msg_net = nn.Sequential(
                nn.Linear(in_dim * 2, out_dim),
                nn.ReLU(),
                nn.Linear(out_dim, out_dim),
            )
        
        self.update_net = nn.Sequential(
            nn.Linear(in_dim + out_dim, out_dim),
            nn.ReLU(),
            nn.Linear(out_dim, out_dim),
        )
    
    def message(self, h_src, h_dst, edge_attr=None):
        """生成每条边的消息 m_uv"""
        if self.use_edge_attr and edge_attr is not None:
            return self.msg_net(torch.cat([h_src, h_dst, edge_attr], dim=-1))
        return self.msg_net(torch.cat([h_src, h_dst], dim=-1))
    
    def aggregate(self, messages, dst_idx, num_nodes):
        """聚合消息：mean pooling"""
        # dst_idx: 每条边目标节点的索引
        agg = torch.zeros(num_nodes, self.out_dim, device=messages.device)
        count = torch.zeros(num_nodes, 1, device=messages.device)
        agg.index_add_(0, dst_idx, messages)
        count.index_add_(0, dst_idx, torch.ones_like(messages[:, :1]))
        count = count.clamp(min=1)
        return agg / count
    
    def update(self, h_old, aggregated):
        """更新节点表示"""
        return self.update_net(torch.cat([h_old, aggregated], dim=-1))
    
    def forward(self, h, edge_index, edge_attr=None):
        """
        h: (N, in_dim) 节点特征
        edge_index: (2, E) [src; dst]
        edge_attr: (E, edge_dim) 可选边特征
        """
        src, dst = edge_index[0], edge_index[1]
        messages = self.message(h[src], h[dst], edge_attr)
        aggregated = self.aggregate(messages, dst, h.size(0))
        return self.update(h, aggregated)`
                },
                {
                    lang: "python",
                    code: `# 构建一个简单图并测试消息传递
def build_sample_graph():
    """构建一个 6 节点的社交网络示例图"""
    # 节点特征: [活跃度, 粉丝数(归一化), 发帖频率]
    node_features = torch.tensor([
        [0.8, 0.9, 0.7],   # 用户 A: 高活跃大 V
        [0.3, 0.2, 0.5],   # 用户 B: 低活跃普通用户
        [0.9, 0.8, 0.9],   # 用户 C: 高活跃创作者
        [0.1, 0.1, 0.1],   # 用户 D: 潜水用户
        [0.6, 0.5, 0.8],   # 用户 E: 中等活跃
        [0.4, 0.3, 0.2],   # 用户 F: 低活跃浏览者
    ], dtype=torch.float32)
    
    # 边: (A->B, A->C, B->D, C->E, C->A, E->F, E->C, F->B)
    edge_index = torch.tensor([
        [0, 0, 1, 2, 2, 4, 4, 5],  # source
        [1, 2, 3, 4, 0, 5, 2, 1],  # target
    ], dtype=torch.long)
    
    return node_features, edge_index

# 测试
features, edges = build_sample_graph()
mp_layer = MessagePassingLayer(in_dim=3, out_dim=8)
output = mp_layer(features, edges)
print(f"输入特征: {features.shape} → 输出特征: {output.shape}")
print(f"\\n消息传递后的节点表示（前 3 个节点）:")
for i in range(3):
    print(f"  节点 {chr(65+i)}: {output[i].detach().numpy()[:4].round(3)}...")`
                },
            ],
            table: {
                headers: ["组件", "作用", "输入", "输出", "可自定义部分"],
                rows: [
                    ["Message", "边级别信息变换", "h_u, h_v, e_uv", "m_uv (边消息向量)", "神经网络结构/是否用边特征"],
                    ["Aggregate", "节点级别消息汇总", "{m_uv} 集合", "m_v (聚合向量)", "mean/sum/max/pool/attention"],
                    ["Update", "节点状态更新", "h_v, m_v", "h_v' (新表示)", "GRU/MLP/残差连接"],
                    ["Edge Index", "图拓扑定义", "邻接关系", "边的列表", "稀疏/稠密表示"],
                    ["Node Features", "节点初始表示", "原始属性", "X (N, d_in)", "连续/离散/多模态"],
                ],
            },
            mermaid: `graph LR
    subgraph "消息传递三步曲"
        subgraph "Step 1: Message"
            H_u["h_u (源节点)"] --> M["Message(h_u, h_v, e_uv)"]
            H_v["h_v (目标节点)"] --> M
            E_uv["e_uv (边特征)"] -.可选.-> M
        end
        subgraph "Step 2: Aggregate"
            M -->|"所有入边消息"| A["Aggregate({m_uv})"]
            A --> m_v["m_v (聚合向量)"]
        end
        subgraph "Step 3: Update"
            H_v2["h_v (旧状态)"] --> U["Update(h_v, m_v)"]
            m_v --> U
            U --> H_new["h_v' (新状态)"]
        end
    end
    class U s2
    class A s1
    class M s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#7c2d12
    classDef s2 fill:#14532d`,
            tip: "消息传递框架的关键直觉：每个节点就像社交网络中的人，通过和周围朋友交流（message），综合大家的观点（aggregate），然后更新自己的想法（update）。层数越多，一个人的观点受越远的朋友影响。",
            warning: "消息传递中的过度平滑（Over-smoothing）问题：随着层数增加，所有节点的表示会趋于相同，失去区分能力。实践中 GNN 通常不超过 4 层，深层 GNN 需要残差连接、跳跃连接或归一化技巧来缓解。",
        },
        {
            title: "2. 图卷积网络 GCN:谱方法与空间方法的统一",
            body: `GCN（Graph Convolutional Network）由 Kipf 和 Welling 在 2016 年的论文《Semi-Supervised Classification with Graph Convolutional Networks》中提出，它将卷积操作从规则的网格数据推广到不规则的图上，是 GNN 领域最具影响力的工作之一。

GCN 的理论基础来自谱图理论。在信号处理中，卷积定理指出：时域卷积等于频域逐点相乘。在图上，图的拉普拉斯矩阵 L = D - A 的特征分解定义了图的「傅里叶基」，图的「频域」就是拉普拉斯特征向量张成的空间。谱图卷积的严格定义为：g * x = U · diag(θ) · Uᵀx，其中 U 是 L 的归一化特征向量矩阵，θ 是可学习的频域滤波器参数。

然而，直接计算特征分解的复杂度为 O(n³)，无法应用于大规模图。Kipf 和 Welling 的关键洞察是：用切比雪夫多项式的一阶近似来简化谱卷积，并加入重归一化技巧。最终得到简洁高效的传播公式：H^(l+1) = σ(D̃^(-1/2) Ã D̃^(-1/2) H^(l) W^(l))，其中 Ã = A + I 是加了自环的邻接矩阵，D̃ 是其度矩阵。

这个公式的精妙之处在于：D̃^(-1/2) Ã D̃^(-1/2) 实现了图上的对称归一化——每个邻居的贡献按其度数的平方根倒数加权，避免了高度数节点的主导效应。W^(l) 是可学习的权重矩阵，σ 是非线性激活函数。每一层 GCN 聚合了一跳邻居的信息，K 层 GCN 就能捕获 K 跳邻居的信息。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class GCNLayer(nn.Module):
    """单层 GCN：H' = σ(D^(-1/2) Ã D^(-1/2) H W)"""
    def __init__(self, in_dim, out_dim, dropout=0.5):
        super().__init__()
        self.linear = nn.Linear(in_dim, out_dim, bias=False)
        self.dropout = nn.Dropout(dropout)
        self.reset_parameters()
    
    def reset_parameters(self):
        # Xavier 初始化
        nn.init.xavier_uniform_(self.linear.weight)
    
    def forward(self, h, adj_norm):
        """
        h: (N, in_dim) 节点特征
        adj_norm: (N, N) 归一化邻接矩阵 D^(-1/2) Ã D^(-1/2)
        """
        # 邻接矩阵聚合 + 线性变换
        support = self.linear(h)         # (N, out_dim)
        output = torch.spmm(adj_norm, support)  # (N, out_dim)
        return output


def compute_normalized_adjacency(adj):
    """计算 GCN 归一化邻接矩阵 D^(-1/2) Ã D^(-1/2)"""
    # 添加自环
    N = adj.size(0)
    A_tilde = adj + torch.eye(N, device=adj.device)
    
    # 计算度矩阵的 -1/2 次方
    degree = A_tilde.sum(dim=1)  # 每个节点的度
    degree_inv_sqrt = degree.pow(-0.5)
    degree_inv_sqrt[degree_inv_sqrt == float('inf')] = 0
    
    # D^(-1/2) * A~ * D^(-1/2)
    D_inv_sqrt = torch.diag(degree_inv_sqrt)
    adj_norm = D_inv_sqrt @ A_tilde @ D_inv_sqrt
    return adj_norm`
                },
                {
                    lang: "python",
                    code: `class GCN(nn.Module):
    """两层 GCN 半监督节点分类器"""
    def __init__(self, in_dim, hidden_dim, out_dim, dropout=0.5):
        super().__init__()
        self.gc1 = GCNLayer(in_dim, hidden_dim, dropout)
        self.gc2 = GCNLayer(hidden_dim, out_dim, dropout)
    
    def forward(self, h, adj_norm):
        h = F.relu(self.gc1(h, adj_norm))
        h = F.dropout(h, p=0.5, training=self.training)
        h = self.gc2(h, adj_norm)
        return F.log_softmax(h, dim=1)


# === Cora 数据集模拟实验 ===
def simulate_cora_experiment():
    torch.manual_seed(42)
    N_NODES = 2708    # Cora 论文数
    N_FEATURES = 1433  # 词袋特征维度
    N_CLASSES = 7      # 主题类别
    N_TRAIN = 140      # 每类 20 个标签
    HIDDEN = 64
    
    # 模拟特征和图结构
    features = torch.randn(N_NODES, N_FEATURES)
    # 生成稀疏邻接矩阵（模拟 citation network）
    row_idx = torch.randint(0, N_NODES, (10000,))
    col_idx = torch.randint(0, N_NODES, (10000,))
    vals = torch.ones(10000)
    adj = torch.sparse.FloatTensor(
        torch.stack([row_idx, col_idx]), vals, (N_NODES, N_NODES))
    adj_dense = adj.to_dense()
    
    # 归一化
    adj_norm = compute_normalized_adjacency(adj_dense)
    
    # 构建模型
    model = GCN(N_FEATURES, HIDDEN, N_CLASSES)
    
    # 模拟训练标签
    labels = torch.randint(0, N_CLASSES, (N_NODES,))
    train_mask = torch.zeros(N_NODES, dtype=torch.bool)
    train_mask[:N_TRAIN] = True
    
    # 训练循环
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)
    for epoch in range(200):
        model.train()
        optimizer.zero_grad()
        out = model(features, adj_norm)
        loss = F.nll_loss(out[train_mask], labels[train_mask])
        loss.backward()
        optimizer.step()
        
        if epoch % 50 == 0:
            model.eval()
            with torch.no_grad():
                preds = out.argmax(dim=1)
                acc = (preds[train_mask] == labels[train_mask]).float().mean()
            print(f"Epoch {epoch:3d}: Loss={loss:.4f}, Train Acc={acc:.3f}")

simulate_cora_experiment()`
                },
            ],
            table: {
                headers: ["GCN 组件", "数学表达", "物理含义", "可学习参数"],
                rows: [
                    ["归一化邻接", "D̃^(-1/2) Ã D̃^(-1/2)", "对称归一化聚合权重", "无（由图结构确定）"],
                    ["线性变换", "W^(l) ∈ R^(d_in × d_out)", "特征空间投影", "d_in × d_out"],
                    ["非线性激活", "σ = ReLU", "引入非线性表达能力", "无"],
                    ["Dropout", "随机置零", "防止过拟合", "概率 p"],
                    ["输出层", "log_softmax", "节点分类概率", "无"],
                    ["损失函数", "交叉熵 ∑ -log p(y_i|x_i)", "监督信号", "无"],
                ],
            },
            mermaid: `graph TD
    subgraph "GCN 谱方法推导"
        L["拉普拉斯矩阵 L = D - A"] --> Eig["特征分解 L = UΛUᵀ"]
        Eig --> FT["图傅里叶变换 x̂ = Uᵀx"]
        FT --> Filter["频域滤波 θ ⊙ x̂"]
        Filter --> IFT["逆变换 U(θ ⊙ Uᵀx)"]
    end
    
    subgraph "一阶近似 → 空间方法"
        IFT --> Approx["切比雪夫一阶近似"]
        Approx --> Renorm["重归一化技巧"]
        Renorm --> Final["H' = σ(D̃^(-1/2)ÃD̃^(-1/2)HW)"]
    end
    class Final s1
    class L s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d`,
            tip: "GCN 的层数不宜过多——2-3 层通常就够了。超过 4 层会出现严重的过度平滑问题，节点表示趋于相同，失去区分能力。如果需要更深的网络，务必加入残差连接（residual connection）或使用 Jumping Knowledge 网络。",
            warning: "GCN 是直推式（Transductive）学习：训练和测试都在同一张图上进行，无法直接泛化到未见过的节点。如果图结构在训练后发生变化，或者需要处理动态新增的节点，应使用 GraphSAGE 等归纳式方法。此外，GCN 假设图结构是给定的，无法处理边缺失或噪声边的情况。",
        },
        {
            title: "3. 图注意力网络 GAT:自适应邻居加权",
            body: `GAT（Graph Attention Network）由 Velickovic 等人在 2017 年提出，它解决了 GCN 的一个核心局限：GCN 中邻居的权重完全由图的拓扑结构（度数归一化）决定，与节点特征内容无关。这就像一个人听取意见时，只根据「谁的朋友多」来决定权重，而不是根据「谁说得好」。

GAT 引入了注意力机制，让每个节点根据特征内容自适应地决定每个邻居的重要性。对于节点 i 和它的邻居 j ∈ N(i)，注意力系数 e_ij = LeakyReLU(aᵀ · [Wh_i || Wh_j])，其中 || 表示拼接，a 是可学习的注意力向量，W 是共享的线性变换矩阵。然后将注意力系数在邻居范围内归一化：α_ij = softmax_j(e_ij) = exp(e_ij) / Σ_k∈N(i) exp(e_ik)。最终节点 i 的更新表示为 h_i' = σ(Σ_j∈N(i) α_ij · Wh_j)。

多头注意力是 GAT 的另一个关键设计。与 **Transformer** 类似，GAT 使用 K 个独立的注意力头，每个头学习不同的关注模式，然后将结果拼接（中间层）或平均（输出层）。这使得模型可以同时关注邻居的不同方面：一个头可能关注结构相似的邻居，另一个头可能关注特征相近的邻居。

**GAT 的优势在于**：不依赖预计算的图拉普拉斯，可以处理归纳式场景（只要新节点有特征就能计算注意力）；注意力权重提供了可解释性，可以分析哪些邻居对节点的表示贡献更大；并且天然支持带权图，注意力系数可以与边权重结合使用。`,
            code: [
                {
                    lang: "python",
                    code: `class GATLayer(nn.Module):
    """单层 GAT：注意力加权的邻居聚合"""
    def __init__(self, in_dim, out_dim, n_heads=1, dropout=0.6, alpha=0.2):
        super().__init__()
        self.n_heads = n_heads
        self.out_dim = out_dim
        self.dropout = nn.Dropout(dropout)
        self.leaky_relu = nn.LeakyReLU(alpha)
        
        # 每个头的线性变换和注意力向量
        self.W = nn.Parameter(torch.empty(n_heads, in_dim, out_dim))
        self.a_src = nn.Parameter(torch.empty(n_heads, out_dim, 1))
        self.a_dst = nn.Parameter(torch.empty(n_heads, out_dim, 1))
        
        self.reset_parameters()
    
    def reset_parameters(self):
        nn.init.xavier_uniform_(self.W)
        nn.init.xavier_uniform_(self.a_src)
        nn.init.xavier_uniform_(self.a_dst)
    
    def forward(self, h, edge_index):
        """
        h: (N, in_dim) 节点特征
        edge_index: (2, E) 边列表 [src; dst]
        """
        src, dst = edge_index[0], edge_index[1]
        N = h.size(0)
        
        # 线性变换: (n_heads, N, out_dim)
        Wh = torch.einsum('hid,nhd->nhid', h, self.W)
        
        # 计算注意力系数: 对每条边 (src->dst)
        # e_ij = aᵀ[Wh_i || Wh_j]
        e_src = (Wh[:, src] * self.a_src).sum(dim=-1)  # (n_heads, E, 1)
        e_dst = (Wh[:, dst] * self.a_dst).sum(dim=-1)  # (n_heads, E, 1)
        e = self.leaky_relu(e_src + e_dst).squeeze(-1)  # (n_heads, E)
        
        # softmax 归一化（在每个目标节点的入边上）
        e_max = e.max(dim=1, keepdim=True)[0]
        e = e - e_max
        e_exp = e.exp()
        
        # 按目标节点聚合分母
        denom = torch.zeros((self.n_heads, N), device=h.device)
        denom.index_add_(1, dst, e_exp)
        alpha = e_exp / (denom[:, dst] + 1e-10)  # (n_heads, E)
        alpha = self.dropout(alpha)
        
        # 加权聚合
        out = torch.zeros((self.n_heads, N, self.out_dim), device=h.device)
        for head in range(self.n_heads):
            msg = alpha[head:head+1, :].unsqueeze(-1) * Wh[head:head+1, dst]
            out[head].index_add_(0, dst, msg.squeeze(0))
        
        return out  # (n_heads, N, out_dim)`
                },
                {
                    lang: "python",
                    code: `class GAT(nn.Module):
    """完整 GAT 模型：多头注意力 + 分类输出"""
    def __init__(self, in_dim, hidden_dim, out_dim, n_heads=8, 
                 hidden_heads=1, dropout=0.6):
        super().__init__()
        # 第一层：多头注意力，输出拼接
        self.gat1 = GATLayer(in_dim, hidden_dim, n_heads=n_heads, dropout=dropout)
        self.concat_dim = n_heads * hidden_dim
        self.dropout = nn.Dropout(dropout)
        
        # 第二层：单头注意力（或较少头），输出平均
        self.gat2 = GATLayer(self.concat_dim, out_dim, n_heads=hidden_heads, dropout=dropout)
    
    def forward(self, h, edge_index):
        # 第一层：多头 → 拼接 → ELU
        h1 = self.gat1(h, edge_index)  # (n_heads, N, hidden_dim)
        h1 = h1.view(h1.size(1), -1)   # (N, n_heads * hidden_dim)
        h1 = F.elu(h1)
        h1 = self.dropout(h1)
        
        # 第二层：单头 → 直接输出
        h2 = self.gat2(h1, edge_index)  # (1, N, out_dim)
        return h2.squeeze(0)  # (N, out_dim)


# 可视化注意力权重
def visualize_gat_attention(gat_model, h, edge_index, node_labels, ax=None):
    """提取并可视化 GAT 第一层的注意力权重"""
    with torch.no_grad():
        src, dst = edge_index[0], edge_index[1]
        Wh = torch.einsum('hid,nhd->nhid', h, gat_model.gat1.W)
        
        e_src = (Wh[:, src] * gat_model.gat1.a_src).sum(dim=-1)
        e_dst = (Wh[:, dst] * gat_model.gat1.a_dst).sum(dim=-1)
        e = F.leaky_relu(e_src + e_dst, negative_slope=0.2).squeeze(-1)
        alpha = F.softmax(e, dim=1)  # (n_heads, E)
    
    print(f"注意力权重形状: {alpha.shape}")
    print(f"  n_heads={alpha.size(0)}, n_edges={alpha.size(1)}")
    
    # 每个头的平均注意力分布
    for head in range(alpha.size(0)):
        head_attn = alpha[head].detach().cpu().numpy()
        print(f"  Head {head}: mean={head_attn.mean():.4f}, "
              f"max={head_attn.max():.4f}, min={head_attn.min():.4f}, "
              f"std={head_attn.std():.4f}")
    
    return alpha.detach()


# 模拟实验
print("GAT 注意力权重分析:")
torch.manual_seed(42)
h = torch.randn(100, 16)
edges = torch.randint(0, 100, (2, 300))
gat = GAT(in_dim=16, hidden_dim=8, out_dim=7, n_heads=4)
attn_weights = visualize_gat_attention(gat, h, edges, None)`
                },
            ],
            table: {
                headers: ["特性", "GCN", "GAT", "差异分析"],
                rows: [
                    ["邻居权重", "度数归一化（固定）", "注意力机制（可学习）", "GAT 更灵活"],
                    ["归纳能力", "直推式", "归纳式", "GAT 可泛化新节点"],
                    ["计算复杂度", "O(|E| · d)", "O(|E| · d + N · d²)", "GAT 略高"],
                    ["可解释性", "无", "注意力权重可视化", "GAT 可分析"],
                    ["多头机制", "无", "支持", "GAT 表达力更强"],
                    ["预计算需求", "需要归一化邻接", "无需预计算", "GAT 更灵活"],
                    ["适用图类型", "同构图", "同构图/带权图", "GAT 更通用"],
                ],
            },
            mermaid: `graph LR
    subgraph "GAT 注意力计算"
        Hi["h_i"] -->|"拼接"| Cat["[Wh_i || Wh_j]"]
        Hj["h_j"] -->|"拼接"| Cat
        Cat --> Leaky["LeakyReLU"]
        Leaky --> Dot["aᵀ · [...]"]
        Dot --> E["e_ij"]
    end
    
    subgraph "多头注意力"
        E -->|"softmax"| A1["α_ij^(1)"]
        E -->|"softmax"| A2["α_ij^(2)"]
        E -->|"softmax"| AN["α_ij^(K)"]
        A1 -->|"加权"| O1["σ(Σα·Wh)₁"]
        A2 -->|"加权"| O2["σ(Σα·Wh)₂"]
        AN -->|"加权"| ON["σ(Σα·Wh)_K"]
    end
    
    subgraph "融合输出"
        O1 & O2 & ON --> Concat["拼接 / 平均"]
        Concat --> H_new["h_i'"]
    end
    class H_new s2
    class Hj s1
    class Hi s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
            tip: "GAT 的多头注意力头数不宜过多——通常 4-8 个头就足够了。头太多会导致注意力分散，每个头学到的模式可能变得冗余。可以通过计算不同头之间的注意力相似度来判断是否冗余：如果两个头的注意力分布高度相关（cosine similarity > 0.8），可以考虑减少头数。",
            warning: "GAT 的注意力系数只在邻居范围内做 softmax 归一化，这意味着注意力权重不具备跨节点可比性。节点 i 给节点 j 的注意力系数 α_ij 与节点 k 给节点 j 的注意力系数 α_kj 不能直接比较——它们在不同的 softmax 分布中。因此，不要简单地将全局注意力权重视为节点重要性的度量。",
        },
        {
            title: "4. GraphSAGE:归纳式图表示学习",
            body: `GraphSAGE（Graph Sample and Aggregate）由 Hamilton 等人在 2017 年提出，它解决了 GCN 和早期 GNN 的另一个核心限制：这些方法都是直推式的，只能在训练时看到的固定图上运行，无法泛化到训练过程中未出现过的节点。

GraphSAGE 的核心创新是「采样 + 聚合」策略。对于每个节点，不是使用全部邻居（这在大规模图中不可行），而是随机采样固定数量的邻居。具体来说，对于每个节点 v，先采样 S_1 个一跳邻居，然后对每个一跳邻居再采样 S_2 个二跳邻居。通过控制采样大小，GraphSAGE 可以在大规模图上高效运行，同时保持固定的计算图大小。

在聚合阶段，GraphSAGE 探讨了三种聚合器：Mean Aggregator（简单平均，性能稳定）、LSTM Aggregator（将邻居视为序列输入 LSTM，表达能力强但顺序依赖）、Pooling Aggregator（先对每个邻居特征做非线性变换再做 element-wise max pooling）。其中 Mean Aggregator 最简单但效果最好，这也是后来 GCN 思想的一种空间方法解释。

GraphSAGE 的训练可以通过无监督或有监督两种方式进行。无监督版本使用基于图结构的损失函数：相连的节点表示应该相似（正样本对），不相连的节点表示应该不同（负样本对）。这种设计使得 GraphSAGE 可以在没有标签的图上进行预训练，然后在下游任务上微调。

**归纳式学习的意义在于**：模型学习的是「如何聚合邻居信息」的函数，而不是特定节点的固定表示。当新节点出现时，只需要它（以及其邻居）的特征，就可以通过前向传播生成表示，无需重新训练模型。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import List

class GraphSAGEAggregator(nn.Module):
    """GraphSAGE 聚合器：支持 Mean / Pooling / LSTM"""
    def __init__(self, in_dim, out_dim, aggregator_type="mean"):
        super().__init__()
        self.aggregator_type = aggregator_type
        self.out_dim = out_dim
        
        if aggregator_type == "mean":
            pass  # 无需额外参数
        elif aggregator_type == "pooling":
            self.fc = nn.Linear(in_dim, in_dim)
        elif aggregator_type == "lstm":
            self.lstm = nn.LSTM(in_dim, in_dim, batch_first=True)
        else:
            raise ValueError(f"Unknown aggregator: {aggregator_type}")
        
        # GraphSAGE 的 W · concat(self, agg(neighbors))
        self.weight = nn.Linear(2 * in_dim, out_dim)
    
    def forward(self, self_features, neighbor_features):
        """
        self_features: (N, in_dim) 中心节点特征
        neighbor_features: (N, num_neighbors, in_dim) 邻居特征
        """
        if self.aggregator_type == "mean":
            # 简单平均
            aggregated = neighbor_features.mean(dim=1)  # (N, in_dim)
        elif self.aggregator_type == "pooling":
            # Pooling: 先变换再 max pooling
            transformed = F.relu(self.fc(neighbor_features))  # (N, K, in_dim)
            aggregated, _ = transformed.max(dim=1)  # (N, in_dim)
        elif self.aggregator_type == "lstm":
            # LSTM: 邻居作为序列
            lstm_out, _ = self.lstm(neighbor_features)
            aggregated = lstm_out[:, -1, :]  # 取最后一个时间步
        
        # 拼接自身和聚合的邻居特征
        combined = torch.cat([self_features, aggregated], dim=1)
        return F.normalize(self.weight(combined), dim=1)  # L2 归一化


class NeighborSampler:
    """邻居采样器"""
    def __init__(self, adj_dict):
        self.adj_dict = adj_dict  # {node_id: [neighbor_ids]}
    
    def sample_neighbors(self, node_ids, sample_size):
        """为每个节点采样固定数量的邻居"""
        sampled = []
        for node in node_ids:
            neighbors = self.adj_dict.get(node, [])
            if len(neighbors) <= sample_size:
                sampled.append(neighbors)
            else:
                import random
                sampled.append(random.sample(neighbors, sample_size))
        return sampled
    
    def get_batch_features(self, node_ids, neighbor_lists, features):
        """收集批次中所有节点和邻居的特征"""
        self_feat = features[node_ids]
        neighbor_feat_list = []
        for neighbors in neighbor_lists:
            if len(neighbors) == 0:
                neighbor_feat_list.append(torch.zeros(1, features.size(1)))
            else:
                neighbor_feat_list.append(features[neighbors])
        return self_feat, neighbor_feat_list`
                },
                {
                    lang: "python",
                    code: `class GraphSAGE(nn.Module):
    """两层 GraphSAGE 模型"""
    def __init__(self, in_dim, hidden_dim, out_dim, aggregator_type="mean"):
        super().__init__()
        self.agg1 = GraphSAGEAggregator(in_dim, hidden_dim, aggregator_type)
        self.agg2 = GraphSAGEAggregator(hidden_dim, out_dim, aggregator_type)
    
    def forward(self, h1, neighbors1, h2, neighbors2):
        """
        h1: 中心节点特征, neighbors1: 一跳邻居特征
        h2: 一跳节点特征, neighbors2: 二跳邻居特征
        """
        # 第一层：聚合二跳邻居 → 生成一跳节点表示
        h2_agg = self.agg1(h2, neighbors2)
        
        # 第二层：聚合一跳邻居（使用更新后的一跳表示） → 生成中心节点表示
        h1_agg = self.agg2(h1, h2_agg)
        return h1_agg
    
    @torch.no_grad()
    def inference(self, features, edge_index, batch_size=256):
        """全图推理（不采样，使用全部邻居）"""
        N = features.size(0)
        adj_dict = {}
        src, dst = edge_index
        for i in range(src.size(0)):
            adj_dict.setdefault(src[i].item(), []).append(dst[i].item())
        
        sampler = NeighborSampler(adj_dict)
        max_neighbors = max(len(v) for v in adj_dict.values()) if adj_dict else 0
        
        results = []
        for start in range(0, N, batch_size):
            end = min(start + batch_size, N)
            nodes = torch.arange(start, end)
            neighbor_lists = sampler.sample_neighbors(
                nodes.tolist(), max_neighbors)
            self_feat, neigh_feat = sampler.get_batch_features(
                nodes, neighbor_lists, features)
            
            # 确保邻居特征形状一致
            max_n = max(len(n) for n in neighbor_lists)
            padded = []
            for nl in neighbor_lists:
                nf = features[nl] if len(nl) > 0 else torch.zeros(1, features.size(1))
                if nf.size(0) < max_n:
                    pad = torch.zeros(max_n - nf.size(0), nf.size(1))
                    nf = torch.cat([nf, pad], dim=0)
                padded.append(nf)
            neigh_feat = torch.stack(padded)
            
            out = self.agg1(self_feat, neigh_feat)
            results.append(out)
        
        return torch.cat(results, dim=0)


# 测试 GraphSAGE
torch.manual_seed(42)
N = 500
in_dim = 64
features = torch.randn(N, in_dim)
edge_index = torch.stack([
    torch.randint(0, N, (2000,)),
    torch.randint(0, N, (2000,)),
])

model = GraphSAGE(in_dim, 32, 16)
print("GraphSAGE 模型初始化完成")
print(f"  聚合器类型: mean")
print(f"  参数量: {sum(p.numel() for p in model.parameters()):,}")`
                },
            ],
            table: {
                headers: ["特性", "GCN", "GraphSAGE", "核心差异"],
                rows: [
                    ["学习方式", "直推式（全图）", "归纳式（采样）", "GraphSAGE 可泛化新图"],
                    ["邻居处理", "使用全部邻居", "随机采样固定数量", "GraphSAGE 可控计算量"],
                    ["归一化", "度数归一化", "L2 归一化", "GraphSAGE 更稳定"],
                    ["聚合器", "固定加权平均", "Mean/Pooling/LSTM", "GraphSAGE 更灵活"],
                    ["训练方式", "仅监督", "监督+无监督", "GraphSAGE 支持自监督"],
                    ["扩展性", "受限于全图大小", "可处理百万级图", "GraphSAGE 更适合大规模"],
                    ["推理方式", "需已知图结构", "只需节点特征", "GraphSAGE 更通用"],
                ],
            },
            mermaid: `graph TD
    subgraph "GraphSAGE 训练过程"
        subgraph "采样阶段"
            V["中心节点 v"] -->|"采样 S₁ 个"| N1["一跳邻居"]
            N1 -->|"采样 S₂ 个"| N2["二跳邻居"]
        end
        
        subgraph "聚合阶段（自底向上）"
            N2 -->|"聚合器"| H2["h_u (u ∈ 一跳邻居)"]
            H2 -->|"聚合器"| Hv["h_v' (中心节点)"]
            N1 -.提供特征.-> H2
        end
        
        subgraph "训练信号"
            Hv -->|"正样本对"| Pos["相连节点: 相似"]
            Hv -->|"负样本对"| Neg["不相连节点: 不同"]
            Pos & Neg --> Loss["对比损失"]
        end
    end
    class Loss s2
    class Hv s1
    class V s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
            tip: "GraphSAGE 的采样大小不需要很大——实验表明 S_1 = 10-25, S_2 = 5-10 就能取得很好的效果。过大的采样会浪费计算资源，且不一定带来性能提升。关键是要让采样策略覆盖足够的结构多样性，而不是简单地追求更多的邻居。",
            warning: "GraphSAGE 的采样策略引入了随机性，这意味着同一个节点在不同训练轮次中可能看到不同的邻居子集。这种随机性有助于正则化，但也可能导致训练不稳定。实践中需要仔细选择采样大小（通常 S_1 = 25, S_2 = 10）和学习率。此外，采样大小过小会丢失重要邻居信息，过大则失去采样带来的效率优势。",
        },
        {
            title: "5. 图分类与 Graph Pooling",
            body: `之前的方法主要处理节点级任务（如节点分类、链接预测），但很多实际问题需要图级别的预测：判断一个分子是否有毒性、一个蛋白质属于哪类功能、一个社交网络社区是否存在异常行为。这些任务要求模型从整个图的节点表示中生成一个固定维度的图级别表示（Graph-level Representation）。

图池化（Graph Pooling）的核心挑战在于：图的大小（节点数）是变化的，但下游分类器需要固定长度的输入。最朴素的方法是全局平均池化（Readout）：将图中所有节点的表示求平均得到图表示 h_G = (1/N) Σ_i h_i。这种方法简单且满足置换不变性，但它忽略了图的层次结构和局部模式。

更高级的图池化方法试图学习有判别力的节点选择策略。DiffPool（Ying et al., 2018）通过学习一个软聚类分配矩阵 S 将节点分配到 K 个簇中，然后在簇级别上递归应用 GNN，形成层次化的图表示。SAGPool（Lee et al., 2019）使用自注意力对节点排序，保留 top-k 节点。Graph U-Net（Gao & Ji, 2019）借鉴了图像分割中的 U-Net 架构，通过 top-k 池化实现图的降采样和上采样。

最新的拓扑感知池化方法（如 Topology-Aware Pooling）进一步利用了图的拓扑信息：不仅考虑节点特征的重要性，还考虑节点在图中的结构角色（如中心性、桥接性）。这对于捕捉图的「形状」信息至关重要——两个图可能有相同的节点特征分布，但完全不同的拓扑结构。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class SimpleReadout(nn.Module):
    """基础图级读出：支持 mean / sum / max"""
    def __init__(self, mode="mean"):
        super().__init__()
        self.mode = mode
    
    def forward(self, h, batch_idx):
        """
        h: (N, d) 所有节点特征
        batch_idx: (N,) 每个节点所属的图 ID
        返回: (B, d) 图级表示
        """
        if self.mode == "mean":
            out = scatter_mean(h, batch_idx, dim=0)
        elif self.mode == "sum":
            out = scatter_sum(h, batch_idx, dim=0)
        elif self.mode == "max":
            out = scatter_max(h, batch_idx, dim=0)[0]
        return out


class SAGPoolLayer(nn.Module):
    """自注意力图池化（SAGPool）"""
    def __init__(self, in_dim, ratio=0.5):
        super().__init__()
        self.ratio = ratio
        self.score_net = nn.Sequential(
            nn.Linear(in_dim, in_dim),
            nn.Tanh(),
            nn.Linear(in_dim, 1),
        )
    
    def forward(self, h, edge_index, batch_idx):
        """
        h: (N, in_dim), edge_index: (2, E)
        返回: 池化后的节点特征、边索引、batch 索引
        """
        scores = self.score_net(h).squeeze(-1)  # (N,)
        k = max(1, int(scores.size(0) * self.ratio))
        
        # top-k 选择
        top_idx = scores.topk(k, dim=0)[1]
        top_idx = top_idx.sort()[0]
        
        # 选择保留的节点
        h_pool = h[top_idx]
        batch_idx_pool = batch_idx[top_idx]
        
        # 过滤边：只保留两端节点都在 top-k 中的边
        src, dst = edge_index
        mask = torch.isin(src, top_idx) & torch.isin(dst, top_idx)
        edge_index_pool = edge_index[:, mask]
        
        # 注意力加权
        attention_scores = torch.sigmoid(scores[top_idx])
        h_pool = h_pool * attention_scores.unsqueeze(-1)
        
        return h_pool, edge_index_pool, batch_idx_pool


def scatter_mean(src, index, dim=0):
    """按索引求均值（简化版 scatter_mean）"""
    out = torch.zeros((index.max().item() + 1, src.size(1)), 
                      device=src.device, dtype=src.dtype)
    count = torch.zeros(out.size(0), device=src.device)
    out.index_add_(0, index, src)
    count.index_add_(0, index, torch.ones(src.size(0), device=src.device))
    return out / count.clamp(min=1).unsqueeze(-1)


def scatter_sum(src, index, dim=0):
    """按索引求和（简化版 scatter_sum）"""
    out = torch.zeros((index.max().item() + 1, src.size(1)),
                      device=src.device, dtype=src.dtype)
    out.index_add_(0, index, src)
    return out`
                },
                {
                    lang: "python",
                    code: `class GraphClassifier(nn.Module):
    """图分类模型：GCN + 多层池化 + 分类头"""
    def __init__(self, in_dim, hidden_dim, out_dim, pool_ratios=[0.8, 0.5]):
        super().__init__()
        self.gc1 = GCNLayer(in_dim, hidden_dim)
        self.gc2 = GCNLayer(hidden_dim, hidden_dim)
        
        self.pool1 = SAGPoolLayer(hidden_dim, ratio=pool_ratios[0])
        self.pool2 = SAGPoolLayer(hidden_dim, ratio=pool_ratios[1])
        
        self.readout = SimpleReadout(mode="mean")
        
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(hidden_dim, out_dim),
        )
    
    def forward(self, h, edge_index, batch_idx):
        # GCN 编码
        h = F.relu(self.gc1(h, adj_norm=None))
        h = F.relu(self.gc2(h, adj_norm=None))
        
        # 第一层池化
        h1_pool, edge1, batch1 = self.pool1(h, edge_index, batch_idx)
        
        # 第二层池化
        h2_pool, edge2, batch2 = self.pool2(h1_pool, edge1, batch1)
        
        # 多尺度读出：池化前 + 池化后
        h_global = self.readout(h, batch_idx)
        h_fine = self.readout(h2_pool, batch2)
        
        h_graph = torch.cat([h_global, h_fine], dim=1)
        return self.classifier(h_graph)


# 测试图分类
def test_graph_classification():
    torch.manual_seed(42)
    
    # 模拟 32 个图，每个图 10-50 个节点
    graphs = []
    for i in range(32):
        n = torch.randint(10, 50, (1,)).item()
        h = torch.randn(n, 16)
        edges = torch.randint(0, n, (2, n * 3))
        graphs.append((h, edges))
    
    # 合并为一个批次
    all_h = torch.cat([g[0] for g in graphs], dim=0)
    all_edges = torch.cat([g[1] + torch.tensor([[sum(gg[0].size(0) for gg in graphs[:i])],
                                                   [sum(gg[0].size(0) for gg in graphs[:i])]])
                            for i, g in enumerate(graphs)], dim=1)
    batch_idx = torch.cat([torch.full((g[0].size(0),), i) 
                           for i, g in enumerate(graphs)])
    
    model = GraphClassifier(in_dim=16, hidden_dim=32, out_dim=5)
    out = model(all_h, all_edges, batch_idx)
    print(f"图分类输出: {out.shape} (期望: [32, 5])")
    print(f"参数总量: {sum(p.numel() for p in model.parameters()):,}")

test_graph_classification()`
                },
            ],
            table: {
                headers: ["池化方法", "原理", "优点", "缺点", "适用场景"],
                rows: [
                    ["全局平均池化", "所有节点特征求平均", "简单高效，置换不变", "丢失结构信息", "基线方法"],
                    ["全局最大池化", "逐维取最大值", "保留最显著特征", "对异常值敏感", "互补于平均池化"],
                    ["SAGPool", "自注意力 top-k 选择", "可学习重要性", "比例参数敏感", "通用图分类"],
                    ["DiffPool", "可微聚类 + 层次化", "捕获层次结构", "计算量大", "大规模图"],
                    ["Graph U-Net", "top-k + 上采样恢复", "编码器-解码器结构", "top-k 不可导", "图分割/生成"],
                    ["拓扑池化", "结合结构角色信息", "利用图拓扑", "实现复杂", "结构敏感任务"],
                ],
            },
            mermaid: `graph TD
    subgraph "图分类完整流程"
        subgraph "输入"
            G1["图 1 (N₁ 个节点)"]
            G2["图 2 (N₂ 个节点)"]
            G3["图 B (N_B 个节点)"]
        end
        
        subgraph "GNN 编码"
            G1 & G2 & G3 --> GCN["多层 GCN/GAT"]
            GCN --> H["节点表示 H"]
        end
        
        subgraph "图池化"
            H -->|"可选: 层次池化"| Pool["SAGPool / DiffPool"]
            Pool --> HP["池化后节点表示"]
            H -->|"或直接全局池化"| Global["Mean / Sum / Max"]
        end
        
        subgraph "读出 + 分类"
            HP -->|"读出"| Read["Readout"]
            Global --> Read
            Read --> HG["图级表示 h_G"]
            HG --> MLP["MLP 分类器"]
            MLP --> Pred["预测 y_G"]
        end
    end
    class Pred s2
    class HG s1
    class GCN s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#7c2d12
    classDef s2 fill:#14532d`,
            tip: "图分类任务中，组合多种池化策略往往比单一方法效果更好。例如，同时使用全局平均池化和 SAGPool，然后将两种读出的特征拼接，可以捕获全局统计信息和局部判别信息。另一个实用技巧是：在池化之前先做 2-3 层 GNN 编码，让节点表示包含足够的上下文信息。",
            warning: "图池化中的 top-k 操作（如 SAGPool）是不可导的，这意味着梯度只能流向被选中的节点，未被选中的节点无法获得梯度更新。这可能导致训练不稳定，特别是在池化比例较低时。可以考虑使用 Gumbel-Softmax 等可微近似来缓解这个问题。"
        },
        {
            title: "6. 应用场景:推荐系统、分子性质、社交网络",
            body: `GNN 在三大领域取得了突破性应用：推荐系统、分子性质预测和社交网络分析。这些应用看似不同，但都共享一个核心洞察——现实世界中的关系数据天然以图的形式存在，GNN 是处理这类数据的最有效工具。

推荐系统中的图结构非常直观：用户和商品构成二分图，用户的点击、购买、收藏行为就是边。PinSage（Ying et al., 2018, Pinterest）是最著名的 GNN 推荐系统之一。它将用户和 Pin（图片）作为节点，交互作为边，使用 GraphSAGE 的变体学习节点表示。推荐时，计算用户表示与候选商品表示的相似度，返回最相关的商品。与传统矩阵分解相比，GNN 推荐的优势在于：可以利用多跳关系（用户 A 喜欢商品 X，与 A 相似的用户 B 也喜欢商品 Y → 可能推荐 Y 给用户 A）；可以融合丰富的侧信息（用户画像、商品属性）；并且天然支持冷启动问题——新商品只要有属性就能获得表示。

分子性质预测是 GNN 在科学计算中的明星应用。分子天然就是图：原子是节点，化学键是边。通过 GNN 学习分子表示，可以预测溶解度、毒性、药物活性等性质，大幅加速药物发现流程。图神经网络在这里的关键优势是保持了分子的拓扑结构信息，而传统的指纹表示或 SMILES 字符串会丢失结构信息。

社交网络分析中，GNN 可以识别社区结构、检测异常用户、预测链接形成、分析信息传播。例如，在欺诈检测场景中，正常用户和欺诈用户在图中的连接模式存在显著差异——欺诈用户倾向于形成密集的小团体，通过 GNN 可以自动捕获这种结构异常。`,
            code: [
                {
                    lang: "python",
                    code: `# === 场景 1: GNN 推荐系统（简化版 PinSage）===
import torch
import torch.nn as nn

class GNNRecommender(nn.Module):
    """基于 GNN 的推荐系统"""
    def __init__(self, n_users, n_items, embed_dim, n_layers=2):
        super().__init__()
        self.user_embedding = nn.Embedding(n_users, embed_dim)
        self.item_embedding = nn.Embedding(n_items, embed_dim)
        
        self.gnn_layers = nn.ModuleList([
            GCNLayer(embed_dim, embed_dim) for _ in range(n_layers)
        ])
        self.dropout = nn.Dropout(0.3)
    
    def build_bipartite_adj(self, interactions, n_users, n_items):
        """构建用户-商品二分图邻接矩阵"""
        N = n_users + n_items
        adj = torch.zeros(N, N)
        for u, i in interactions:
            adj[u, n_users + i] = 1.0
            adj[n_users + i, u] = 1.0
        return compute_normalized_adjacency(adj)
    
    def forward(self, user_ids, item_ids, adj_norm):
        # 初始化嵌入
        all_users = self.user_embedding.weight
        all_items = self.item_embedding.weight
        all_embed = torch.cat([all_users, all_items], dim=0)
        
        # GNN 传播
        h = all_embed
        all_h = [h]
        for gnn in self.gnn_layers:
            h = F.relu(gnn(h, adj_norm))
            h = self.dropout(h)
            all_h.append(h)
        
        # 多层聚合（LightGCN 风格：各层平均）
        final_h = sum(all_h) / len(all_h)
        
        # 查询特定用户和商品的表示
        u_emb = final_h[user_ids]
        i_emb = final_h[n_users + item_ids]
        return u_emb, i_emb
    
    def predict_score(self, user_ids, item_ids, adj_norm):
        u_emb, i_emb = self.forward(user_ids, item_ids, adj_norm)
        return (u_emb * i_emb).sum(dim=1)  # 内积打分`
                },
                {
                    lang: "python",
                    code: `# === 场景 2: 分子性质预测 ===
class MoleculeGNN(nn.Module):
    """分子图神经网络：原子类型 + 键类型编码"""
    def __init__(self, n_atom_types=100, n_bond_types=6, hidden_dim=64, out_dim=1):
        super().__init__()
        self.atom_embedding = nn.Embedding(n_atom_types, hidden_dim)
        self.bond_embedding = nn.Embedding(n_bond_types, hidden_dim)
        
        self.gnn_layers = nn.ModuleList([
            nn.ModuleDict({
                "node_update": nn.Linear(hidden_dim * 2, hidden_dim),
                "edge_update": nn.Linear(hidden_dim * 3, hidden_dim),
            })
            for _ in range(3)
        ])
        
        self.readout = SimpleReadout(mode="sum")
        self.predictor = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim // 2, out_dim),
        )
    
    def forward(self, atom_types, edge_index, bond_types, batch_idx):
        # 嵌入
        h_atom = self.atom_embedding(atom_types)
        h_bond = self.bond_embedding(bond_types)
        
        # GNN 消息传递（带边特征）
        for layer in self.gnn_layers:
            src, dst = edge_index
            
            # 消息: h_u + h_v + e_uv
            messages = h_atom[src] + h_atom[dst] + h_bond
            
            # 聚合
            agg = scatter_mean(messages, dst, dim=0)
            
            # 更新
            h_atom = layer["node_update"](
                torch.cat([h_atom, agg], dim=-1))
            h_atom = F.relu(h_atom)
        
        # 图级读出 + 预测
        h_graph = self.readout(h_atom, batch_idx)
        return self.predictor(h_graph).squeeze(-1)


# === 场景 3: 社交网络异常检测 ===
def detect_fraud_users(node_features, edge_index, n_anomalies=50):
    """基于图结构和节点特征的异常用户检测"""
    # 计算图结构特征
    src, dst = edge_index
    degree = torch.zeros(node_features.size(0))
    degree.index_add_(0, src, torch.ones(src.size(0)))
    
    # 聚类系数（局部密度）
    local_density = torch.zeros(node_features.size(0))
    for i in range(src.size(0)):
        local_density[src[i]] += 1.0 / (degree[src[i]] + 1)
    
    # 结合图特征和原始特征
    structural_features = torch.stack([degree, local_density], dim=1)
    combined = torch.cat([node_features, structural_features], dim=1)
    
    # GNN 编码
    adj = torch.zeros(node_features.size(0), node_features.size(0))
    adj[src, dst] = 1.0
    adj_norm = compute_normalized_adjacency(adj)
    
    model = GCNLayer(combined.size(1), 32)
    h = F.relu(model(combined, adj_norm))
    
    # 异常分数（基于重构误差或偏离度）
    anomaly_scores = torch.norm(h - h.mean(dim=0), dim=1)
    top_anomalies = anomaly_scores.topk(n_anomalies)[1]
    
    return top_anomalies, anomaly_scores


print("三大应用场景模型定义完成:")
print("  1. GNN 推荐系统 (PinSage 风格)")
print("  2. 分子性质预测 (带边特征的 GNN)")
print("  3. 社交网络异常检测 (结构特征 + GNN)")`
                },
            ],
            table: {
                headers: ["应用领域", "图的构建", "任务类型", "核心 GNN 方法", "关键指标"],
                rows: [
                    ["推荐系统", "用户-商品二分图", "链接预测/排序", "PinSage, LightGCN", "HR@10, NDCG@10"],
                    ["分子性质", "原子-化学键图", "图分类/回归", "MPNN, GIN", "ROC-AUC, RMSE"],
                    ["社交网络", "用户-关注/互动图", "节点分类/异常检测", "GraphSAGE, GAT", "F1-Score, AUPRC"],
                    ["知识图谱", "实体-关系三元组图", "链接预测", "R-GCN, CompGCN", "MRR, Hits@K"],
                    ["交通预测", "路口-道路图", "时空预测", "ST-GCN, DCRNN", "MAE, MAPE"],
                    ["蛋白质结构", "氨基酸-相互作用图", "分类/回归", "GVP-GNN", "Accuracy, Pearson r"],
                ],
            },
            mermaid: `graph TD
    subgraph "推荐系统"
        U1["用户 A"] -->|"点击"| I1["商品 X"]
        U1 -->|"购买"| I2["商品 Y"]
        U2["用户 B"] -->|"点击"| I1
        U2 -->|"收藏"| I3["商品 Z"]
        U1 -.相似.-> U2
    end
    
    subgraph "分子图"
        C1["碳原子"] ===|"单键"| O1["氧原子"]
        C1 -.双键.-> N1["氮原子"]
        N1 ===|"单键"| C2["碳原子"]
        C2 -.芳香键.-> C3["碳原子"]
    end
    
    subgraph "社交网络"
        A["正常用户"] -->|"关注"| B["正常用户"]
        A -->|"互动"| C["正常用户"]
        D["欺诈用户"] -.密集连接.-> E["欺诈用户"]
        D -.密集连接.-> F["欺诈用户"]
        E -.密集连接.-> F
    end
    class D s2
    class C1 s1
    class U1 s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#14532d
    classDef s2 fill:#7f1d1d`,
            tip: "在实际部署推荐系统时，可以采用离线预计算 + 在线召回的两阶段策略：离线阶段用 GNN 预计算所有商品表示并构建索引，在线阶段只需计算用户表示并进行快速最近邻搜索。这样可以将延迟从秒级降到毫秒级。同时，定期增量更新节点表示而非全量重训练，可以大幅节省计算资源。",
            warning: "不同应用场景中的图可能非常巨大（推荐系统中的用户-商品图可达数十亿节点），直接使用全图 GNN 不可行。必须使用采样策略（如 GraphSAGE 的邻居采样、PinSage 的随机游走）或分布式 GNN 框架（如 DGL 的分布式训练）。此外，推荐系统中的数据泄露问题需要特别注意：不能让用户看到未来才会交互的商品。",
        },
        {
            title: "7. PyTorch Geometric 实战",
            body: `PyTorch Geometric（PyG）是 PyTorch 生态中最流行的图深度学习库，由 Matthias Fey 和 Jan E. Lenssen 开发。它提供了高效的图数据处理、内置的 GNN 层和完整的数据集支持，是目前研究和工程中使用最广泛的 GNN 框架。

PyG 的核心设计理念是将图表示为稀疏张量。图的邻接关系用 edge_index 张量表示（形状为 (2, num_edges)），这是一种 COO（Coordinate）格式的稀疏表示，比稠密邻接矩阵节省大量内存。节点特征存储在 x 张量中，边特征在 edge_attr 中，批次信息在 batch 向量中。

PyG 内置了大量 GNN 层的实现：GCNConv、GATConv、SAGEConv、GINConv 等，可以直接调用。同时提供了 MessagePassing 基类，方便用户自定义新的 GNN 层。数据加载方面，PyG 支持节点级、边级和图级任务的完整数据流，包括邻居采样、子图提取和 mini-batch 处理。

本节通过两个完整示例——节点分类（Cora 数据集上的 GCN）和图分类（MUTAG 分子数据集上的 GIN）——展示 PyG 的完整使用流程，从数据加载、模型构建、训练到评估。`,
            code: [
                {
                    lang: "python",
                    code: `# === PyG 实战 1: 节点分类 (GCN on Cora) ===
import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv
from torch_geometric.datasets import Planetoid
from torch_geometric.transforms import NormalizeFeatures

def train_gcn_on_cora():
    """在 Cora 数据集上训练 GCN 节点分类器"""
    # 加载数据
    dataset = Planetoid(root='/tmp/Cora', name='Cora',
                        transform=NormalizeFeatures())
    data = dataset[0]  # Cora 是单个图
    print(f"Cora 数据集: {data.num_nodes} 节点, {data.num_edges} 边, "
          f"{data.num_features} 维特征, {dataset.num_classes} 类")
    
    class GCN(torch.nn.Module):
        def __init__(self, in_channels, hidden_channels, out_channels):
            super().__init__()
            self.conv1 = GCNConv(in_channels, hidden_channels)
            self.conv2 = GCNConv(hidden_channels, out_channels)
        
        def forward(self, x, edge_index):
            x = self.conv1(x, edge_index)
            x = F.relu(x)
            x = F.dropout(x, p=0.5, training=self.training)
            x = self.conv2(x, edge_index)
            return F.log_softmax(x, dim=1)
    
    model = GCN(data.num_features, 16, dataset.num_classes)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)
    
    model.train()
    for epoch in range(200):
        optimizer.zero_grad()
        out = model(data.x, data.edge_index)
        loss = F.nll_loss(out[data.train_mask], data.y[data.train_mask])
        loss.backward()
        optimizer.step()
    
    # 评估
    model.eval()
    with torch.no_grad():
        pred = model(data.x, data.edge_index).argmax(dim=1)
        test_correct = (pred[data.test_mask] == data.y[data.test_mask]).sum()
        test_total = data.test_mask.sum()
        test_acc = int(test_correct) / int(test_total)
    
    print(f"测试准确率: {test_acc:.4f}")
    return model

# 模拟运行（不依赖 PyG 安装）
print("GCN on Cora 代码示例已定义（需安装 torch_geometric 运行）")
print("  pip install torch-geometric")`
                },
                {
                    lang: "python",
                    code: `# === PyG 实战 2: 图分类 (GIN on MUTAG) ===
from torch_geometric.nn import GINConv, global_add_pool
from torch_geometric.loader import DataLoader
from torch_geometric.datasets import TUDataset

def train_gin_on_mutag():
    """在 MUTAG 数据集上训练 GIN 图分类器"""
    # 加载数据
    dataset = TUDataset(root='/tmp/MUTAG', name='MUTAG')
    print(f"MUTAG 数据集: {len(dataset)} 个图, "
          f"类别数: {dataset.num_classes}")
    print(f"  平均节点数: {dataset.data.num_nodes / len(dataset):.1f}")
    
    # 划分训练/测试集
    train_dataset = dataset[:150]
    test_dataset = dataset[150:]
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=32)
    
    class GIN(torch.nn.Module):
        """Graph Isomorphism Network (GIN)"""
        def __init__(self, in_dim, hidden_dim, out_dim, n_layers=5):
            super().__init__()
            self.n_layers = n_layers
            
            # GIN 层: h' = MLP((1+eps) * h + sum(h_neighbors))
            self.convs = torch.nn.ModuleList()
            self.batch_norms = torch.nn.ModuleList()
            
            for i in range(n_layers):
                in_c = in_dim if i == 0 else hidden_dim
                mlp = torch.nn.Sequential(
                    torch.nn.Linear(in_c, hidden_dim),
                    torch.nn.ReLU(),
                    torch.nn.Linear(hidden_dim, hidden_dim),
                )
                self.convs.append(GINConv(mlp, train_eps=True))
                self.batch_norms.append(torch.nn.BatchNorm1d(hidden_dim))
            
            self.pool = global_add_pool
            self.classifier = torch.nn.Sequential(
                torch.nn.Linear(hidden_dim, hidden_dim // 2),
                torch.nn.ReLU(),
                torch.nn.Dropout(0.5),
                torch.nn.Linear(hidden_dim // 2, out_dim),
            )
        
        def forward(self, x, edge_index, batch):
            h = x
            for i in range(self.n_layers):
                h = self.convs[i](h, edge_index)
                h = self.batch_norms[i](h)
                if i < self.n_layers - 1:
                    h = F.relu(h)
            
            h_graph = self.pool(h, batch)
            return self.classifier(h_graph)
    
    model = GIN(dataset.num_features, 32, dataset.num_classes)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    
    # 训练循环
    for epoch in range(100):
        model.train()
        total_loss = 0
        for batch_data in train_loader:
            optimizer.zero_grad()
            out = model(batch_data.x, batch_data.edge_index, batch_data.batch)
            loss = F.cross_entropy(out, batch_data.y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * batch_data.num_graphs
        
        # 测试
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for batch_data in test_loader:
                out = model(batch_data.x, batch_data.edge_index, batch_data.batch)
                correct += (out.argmax(dim=1) == batch_data.y).sum().item()
                total += batch_data.num_graphs
        
        if epoch % 20 == 0:
            print(f"Epoch {epoch:3d}: Loss={total_loss/len(train_dataset):.4f}, "
                  f"Test Acc={correct/total:.3f}")
    
    print(f"最终测试准确率: {correct/total:.4f}")
    return model

print("GIN on MUTAG 代码示例已定义（需安装 torch_geometric 运行）")
print("  pip install torch-geometric")`
                },
            ],
            table: {
                headers: ["PyG 组件", "功能", "对应代码", "替代方案"],
                rows: [
                    ["edge_index", "图拓扑 (2, E) 稀疏表示", "src, dst 节点索引对", "DGL: graph.edges()"],
                    ["Data", "单图数据容器", "x, edge_index, y, batch 等属性", "DGL: DGLGraph"],
                    ["Batch", "图批次（图拼接）", "自动添加 batch 向量", "DGL: batch()"],
                    ["DataLoader", "图级别数据加载", "自动 batching 图数据", "DGL: GraphDataLoader"],
                    ["NeighborLoader", "邻居采样数据加载", "按批次采样邻居", "DGL: NodeDataLoader"],
                    ["MessagePassing", "自定义 GNN 层基类", "message/aggregate/update", "DGL: update_all"],
                    ["GCNConv", "内置 GCN 层", "直接调用，无需手动归一化", "DGL: dglnn.GraphConv"],
                    ["GATConv", "内置 GAT 层", "支持多头注意力", "DGL: dglnn.GATConv"],
                ],
            },
            mermaid: `graph TD
    subgraph "PyG 数据处理流程"
        Raw["原始图数据 (NetworkX / edge list)"] --> Convert["转换为 Data 对象"]
        Convert --> Pre["预处理 (归一化/增强)"]
        Pre --> Split["训练/验证/测试划分"]
    end
    
    subgraph "模型构建"
        Split --> Loader["DataLoader / NeighborLoader"]
        Loader --> Model["GNN 模型 (GCNConv / GATConv / GINConv)"]
        Model --> Pool["读出 (global_mean_pool / global_add_pool)"]
        Pool --> Output["预测输出"]
    end
    
    subgraph "训练评估"
        Output --> Loss["损失计算"]
        Loss --> Backward["反向传播"]
        Backward --> Update["参数更新"]
        Update --> Eval["测试集评估"]
    end
    class Eval s2
    class Model s1
    class Raw s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#7c2d12
    classDef s2 fill:#14532d`,
            tip: "PyG 的 edge_index 格式是 (2, num_edges)，其中第 0 行是源节点索引，第 1 行是目标节点索引。这与 NetworkX 和 DGL 的习惯不同，初学者容易搞混。建议在使用 PyG 时，始终用 edge_index[0] 表示源节点，edge_index[1] 表示目标节点，不要混淆顺序。另外，对于有向图和无向图，PyG 的处理方式不同——无向图需要确保每条边都有反向边。",
            warning: "PyG 的图分类 DataLoader 会自动将多个图拼接为一个大图（通过 batch 向量区分）。这意味着如果你的图非常大，即使 batch_size=1，拼接后的图也可能超出 GPU 内存。对于大图分类任务，需要使用梯度累积或减小图尺寸。另一个常见陷阱：NodeDataLoader 和 DataLoader 的 batching 行为不同——前者按节点采样，后者按图拼接——混用会导致维度错误。",
        },
    ],
};
