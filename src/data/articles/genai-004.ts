import { Article } from '../knowledge';

export const article: Article = {
    id: "genai-004",
    title: "流模型 Normalizing Flow",
    category: "genai",
    tags: ["Normalizing Flow", "生成模型", "可逆变换"],
    summary: "从变量变换公式到自回归流，理解精确似然估计的生成模型",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
        {
            title: "1. 变量变换公式与流模型核心思想",
            body: "Normalizing Flow 的核心建立在概率论中的变量变换公式（Change of Variables Formula）之上。假设我们有一个简单的基础分布（通常是标准正态分布），以及一系列可逆变换 z_0 到 z_1 到 z_2 直到 z_K = x。通过链式法则，目标变量 x 的概率密度可以精确计算为：p(x) = p(z_0) 乘以 |det(dz_0/dx)|。其中雅可比行列式的绝对值衡量了变换前后体积的变化。与 VAE 和 GAN 不同，Flow 模型提供精确的似然估计，既不像 VAE 那样只优化变分下界，也不像 GAN 那样无法计算似然。Flow 模型的关键挑战在于设计可逆变换，使得雅可比行列式的计算高效可行。如果雅可比矩阵是稠密的，其行列式计算复杂度为 O(D^3)，在高维空间中不可接受。因此，Flow 模型的设计精髓在于构造雅可比矩阵具有特殊结构（如三角阵或低秩更新）的变换，将行列式计算降至 O(D)。",
            code: [
                {
                    lang: "python",
                    code: "# 变量变换公式的数值验证\nimport torch\nfrom torch.autograd import grad\n\ndef change_of_variables(f, x, base_dist):\n    z, log_det = f.inverse_and_log_det(x)\n    log_p_z = base_dist.log_prob(z).sum(dim=-1)\n    log_p_x = log_p_z + log_det\n    return log_p_x\n\nclass SimpleFlow:\n    def __init__(self, dim, a=0.5):\n        self.a = a  # z = a * x (可逆缩放)\n\n    def inverse_and_log_det(self, x):\n        z = x / self.a\n        log_det = -x.shape[-1] * torch.log(torch.tensor(abs(self.a)))\n        return z, log_det.expand(x.shape[0])\n\n# 验证：1D 缩放变换\nflow = SimpleFlow(dim=1, a=2.0)\nx = torch.randn(1000, 1)\nlog_p_x = change_of_variables(flow, x, torch.distributions.Normal(0, 1))\nprint(f'平均 log p(x): {log_p_x.mean().item():.4f}')"
                },
                {
                    lang: "python",
                    code: "# 雅可比行列式计算复杂度对比\nimport numpy as np\nimport time\n\ndef benchmark_jacobian_det(dim):\n    A_dense = np.random.randn(dim, dim)\n    A_tri = np.tril(np.random.randn(dim, dim))  # 下三角\n\n    start = time.time()\n    for _ in range(100):\n        sign, logdet = np.linalg.slogdet(A_dense)\n    dense_time = (time.time() - start) / 100\n\n    start = time.time()\n    for _ in range(100):\n        tri_logdet = np.sum(np.log(np.abs(np.diag(A_tri))))\n    tri_time = (time.time() - start) / 100\n\n    return {'dim': dim, 'dense': f'{dense_time*1000:.3f}ms',\n            'triangular': f'{tri_time*1000:.4f}ms'}\n\nfor d in [10, 100, 1000]:\n    result = benchmark_jacobian_det(d)\n    print(f\"dim={d:4d} | dense: {result['dense']:>10s} | \"\n          f\"triangular: {result['triangular']}\")"
                }
            ],
            table: {
                headers: ["模型", "似然估计", "采样速度", "训练稳定性", "灵活性"],
                rows: [
                    ["VAE", "变分下界(ELBO)", "快", "高", "中等"],
                    ["GAN", "不可行", "快", "低(对抗)", "高"],
                    ["Diffusion", "可行(近似)", "慢", "高", "高"],
                    ["Normalizing Flow", "精确似然", "快", "高", "中等"],
                    ["自回归模型", "精确似然", "慢(串行)", "高", "高"]
                ]
            },
            mermaid: "graph LR\n    A[\"基础分布 z_0 ~ N(0,I)\"] -->|f_1| B[\"z_1\"]\n    B -->|f_2| C[\"z_2\"]\n    C -->|...| D[\"z_K\"]\n    D -->|\"x = z_K\"| E[\"目标分布 p(x)\"]\n    A -.->|\"log p(z_0)\"| F[\"精确似然\"]\n    F -.->|\"log|det J|\"| G[\"log p(x)\"]\n    style E fill:#4CAF50\n    style G fill:#2196F3,color:#1e293b",
            tip: "变量变换公式是 Flow 模型的数学根基，理解它对后续所有 Flow 变体都至关重要。",
            warning: "雅可比行列式为负时取绝对值，但实际实现中通常用 log|det| 保证数值稳定性。"
        },
        {
            title: "2. 可逆神经网络设计",
            body: "构造可逆神经网络是 Flow 模型设计的核心问题。普通神经网络（如全连接层、卷积层）通常不可逆，因为维度缩减、池化等操作会丢失信息。可逆网络设计需要满足两个条件：前向变换可逆（给定输出能唯一还原输入），以及雅可比行列式可高效计算。Planar Flow 提出了最简单的方案：f(z) = z + u * h(w^T z + b)，其中 h 是逐元素的非线性激活函数（如 tanh）。利用矩阵行列式引理（Matrix Determinant Lemma），其雅可比行列式可以在 O(D) 时间内计算。Radial Flow 则使用径向变换：f(z) = z + beta * h(alpha, r) * (z - z_ref)，从参考点 z_ref 沿径向扩展或压缩空间。这两种 Flow 都是残差式变换，即输出等于输入加上一个小扰动，天然保证可逆性（当扰动足够小时）。然而，单个 Planar 或 Radial Flow 的表达能力有限，实践中需要堆叠多个 Flow 层来逼近复杂的数据分布。",
            code: [
                {
                    lang: "python",
                    code: "# Planar Flow 实现\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass PlanarFlow(nn.Module):\n    def __init__(self, dim):\n        super().__init__()\n        self.w = nn.Parameter(torch.randn(dim))\n        self.u = nn.Parameter(torch.randn(dim))\n        self.b = nn.Parameter(torch.zeros(1))\n        self._ensure_invertibility()\n\n    def _ensure_invertibility(self):\n        # 确保 w^T u > -1 (可逆性条件)\n        with torch.no_grad():\n            wtu = torch.dot(self.w, self.u)\n            if wtu <= -1:\n                m = -1 + torch.log1p(torch.exp(wtu))\n                self.u.data = self.u + (m - wtu) * self.w / self.w.norm()**2\n\n    def forward(self, z):\n        # 前向变换 + log|det J|\n        linear = torch.matmul(z, self.w) + self.b\n        h_val = torch.tanh(linear)\n        h_prime = 1 - h_val ** 2  # tanh 导数\n        u_hat = self.u + (torch.log1p(torch.exp(\n            torch.dot(self.w, self.u))) - 1 - torch.dot(self.w, self.u)) \\\n            * self.w / self.w.norm()**2\n        psi = h_prime * self.w\n        log_det = torch.log1p(torch.abs(torch.matmul(psi, u_hat)))\n        return z + self.u * h_val.unsqueeze(-1), log_det"
                },
                {
                    lang: "python",
                    code: "# Radial Flow 实现\nclass RadialFlow(nn.Module):\n    def __init__(self, dim):\n        super().__init__()\n        self.z_ref = nn.Parameter(torch.randn(dim))\n        self.alpha = nn.Parameter(torch.rand(1))  # > 0\n        self.beta = nn.Parameter(torch.randn(1))\n\n    def forward(self, z):\n        # 径向变换\n        diff = z - self.z_ref\n        r = diff.norm(dim=-1, keepdim=True)\n        alpha_soft = torch.log1p(torch.exp(self.alpha))  # 保证 > 0\n        h_val = 1.0 / (alpha_soft + r)\n        h_prime = -1.0 / (alpha_soft + r) ** 2\n\n        # f(z) = z + beta * h(r) * (z - z_ref)\n        z_new = z + self.beta * h_val * diff\n\n        # log|det J| = (D-1)*log(1+beta*h) + log(1+beta*h+beta*h'*r)\n        term1 = (z.shape[-1] - 1) * torch.log1p(self.beta * h_val).squeeze(-1)\n        term2 = torch.log1p(self.beta * h_val.squeeze(-1) + \\\n                           self.beta * h_prime.squeeze(-1) * r.squeeze(-1))\n        log_det = term1 + term2\n        return z_new, log_det"
                }
            ],
            table: {
                headers: ["特性", "Planar Flow", "Radial Flow", "耦合层 Flow"],
                rows: [
                    ["变换形式", "z + u*h(w^T z+b)", "z + beta*h(r)*(z-z_ref)", "分块耦合"],
                    ["行列式复杂度", "O(D)", "O(D)", "O(D)"],
                    ["表达能力", "单方向扰动", "径向扰动", "强"],
                    ["可逆性保证", "w^T u > -1", "alpha > 0", "自动保证"],
                    ["适用场景", "低维密度估计", "低维密度估计", "高维生成建模"],
                    ["参数数量", "2D+1", "D+2", "O(D)"]
                ]
            },
            mermaid: "graph TD\n    A[\"输入 z\"] --> B[\"Planar Flow\"]\n    A --> C[\"Radial Flow\"]\n    B -->|\"f(z) = z + u*h(w^T z+b)\"| D[\"切平面扰动\"]\n    C -->|\"f(z) = z + beta*h(r)*(z-z_ref)\"| E[\"径向扰动\"]\n    D --> F[\"组合 Flow\"]\n    E --> F\n    F -->|\"z_0 to z_1 to ... to z_K\"| G[\"复杂变换\"]\n    style G fill:#4CAF50,color:#1e293b",
            tip: "Planar Flow 的可逆性条件 w^T u > -1 可通过参数重参数化自动满足，避免训练中的投影操作。",
            warning: "单个 Planar 或 Radial Flow 表达能力很弱，至少需要堆叠 8-32 层才能建模复杂分布。"
        },
        {
            title: "3. Planar 与 Radial Flow 深入分析",
            body: "虽然 Planar Flow 和 Radial Flow 结构简单，但它们揭示了 Flow 模型设计的几个重要原理。首先，可逆性并不等于表达能力。一个变换可以是完美可逆的，但如果其变换能力受限（如只能沿一个方向扰动），则无法逼近复杂的数据流形。其次，Flow 的表达能力与堆叠深度成正比。Rezende 和 Mohamed（2015）的原始论文证明，通过堆叠足够多的 Planar Flow，可以逼近任意光滑的密度变换。然而，深层 Flow 面临梯度消失和模式崩塌的风险：如果某一层的雅可比行列式接近零，信号在反向传播时会衰减；如果行列式过大，则可能导致数值不稳定。为此，后续工作提出了多种改进方案：Glow 使用可逆 1x1 卷积增加变换灵活性，RealNVP 使用仿射耦合层在高维空间中实现强大表达。理解 Planar 和 Radial Flow 的局限性，是理解后续更高级 Flow 模型的基础。",
            code: [
                {
                    lang: "python",
                    code: "# 堆叠多层 Planar Flow\nclass PlanarFlowStack(nn.Module):\n    def __init__(self, dim, n_flows=16):\n        super().__init__()\n        self.flows = nn.ModuleList([\n            PlanarFlow(dim) for _ in range(n_flows)\n        ])\n\n    def forward(self, z_0):\n        # 正向变换，返回最终输出和总 log|det|\n        z = z_0\n        total_log_det = z.new_zeros(z.shape[0])\n\n        for flow in self.flows:\n            z, log_det = flow(z)\n            total_log_det = total_log_det + log_det\n\n        return z, total_log_det\n\n    def inverse(self, x):\n        # 逆变换（数值求解）\n        z = x\n        for flow in reversed(self.flows):\n            z = flow.inverse(z)  # 数值迭代求解\n        return z"
                },
                {
                    lang: "python",
                    code: "# 可视化 Planar Flow 对 2D 高斯的变换\nimport matplotlib.pyplot as plt\nimport numpy as np\n\ndef visualize_flow_transformation(flow_stack, n_samples=10000):\n    # 采样基础分布\n    z_0 = torch.randn(n_samples, 2)\n\n    # 应用 Flow 变换\n    z_k, _ = flow_stack(z_0)\n\n    fig, axes = plt.subplots(1, 3, figsize=(15, 4))\n    axes[0].scatter(z_0[:, 0].numpy(), z_0[:, 1].numpy(),\n                    s=1, alpha=0.3)\n    axes[0].set_title('Base: N(0, I)')\n    axes[0].set_xlim(-4, 4)\n    axes[0].set_ylim(-4, 4)\n\n    axes[1].scatter(z_k[:, 0].numpy(), z_k[:, 1].numpy(),\n                    s=1, alpha=0.3)\n    axes[1].set_title('After Flow')\n    axes[1].set_xlim(-4, 4)\n    axes[1].set_ylim(-4, 4)\n\n    # 密度估计对比\n    from scipy.stats import gaussian_kde\n    kde = gaussian_kde(z_k.numpy().T)\n    grid_x, grid_y = np.mgrid[-4:4:100j, -4:4:100j]\n    grid = np.vstack([grid_x.ravel(), grid_y.ravel()])\n    density = kde(grid).reshape(100, 100)\n    axes[2].contourf(grid_x, grid_y, density, levels=20, cmap='viridis')\n    axes[2].set_title('Estimated Density')\n    plt.tight_layout()"
                }
            ],
            table: {
                headers: ["Flow 深度", "负对数似然(NLL)", "训练稳定性", "表达能力", "推理时间(ms)"],
                rows: [
                    ["1 层", "~5.2", "非常稳定", "极弱", "0.1"],
                    ["4 层", "~3.8", "稳定", "弱", "0.3"],
                    ["16 层", "~2.5", "较稳定", "中等", "1.2"],
                    ["64 层", "~1.9", "需注意初始化", "较强", "4.5"],
                    ["256 层", "~1.7", "梯度可能消失", "强", "18.0"]
                ]
            },
            mermaid: "graph LR\n    A[\"N(0,I) 圆形\"] -->|1层 Planar| B[\"轻微变形\"]\n    B -->|4层 Planar| C[\"S 形弯曲\"]\n    C -->|16层 Planar| D[\"复杂形状\"]\n    D -->|64层 Planar| E[\"高度非线性流形\"]\n    style A fill:#4CAF50,color:#1e293b\n    style E fill:#f44336,color:#1e293b",
            tip: "训练深层 Flow 时，使用正交初始化或单位初始化作为起点，可以显著改善收敛速度。",
            warning: "Flow 层数过多会导致逆变换需要数值迭代求解，推理速度急剧下降。"
        },
        {
            title: "4. RealNVP 与耦合层架构",
            body: "RealNVP（Real-valued Non-Volume Preserving transformations）是 Flow 模型发展史上的里程碑。它提出了仿射耦合层（Affine Coupling Layer）的概念：将输入 z 分成两部分 (z_a, z_b)，保持 z_a 不变，用 z_a 通过神经网络预测 z_b 的缩放和平移参数。具体地，z_a' = z_a，z_b' = z_b 乘以 exp(s(z_a)) + t(z_a)，其中 s 和 t 是缩放和平移网络。这种设计的巧妙之处在于：前向变换是直接的，逆变换同样直接（z_b = (z_b' - t(z_a')) 乘以 exp(-s(z_a'))），无需数值迭代。更重要的是，雅可比矩阵是三角矩阵（因为 z_a' 不依赖 z_b），行列式等于对角线元素的乘积，即 exp(sum(s(z_a)))，log|det| = sum(s(z_a))，计算复杂度 O(D)。RealNVP 还引入了交替掩码策略（checkerboard 和 channel-wise masking），确保每个维度都能被变换。配合多尺度架构（multi-scale architecture），RealNVP 在 ImageNet 上取得了当时最好的似然结果。",
            code: [
                {
                    lang: "python",
                    code: "# RealNVP 仿射耦合层\nclass AffineCouplingLayer(nn.Module):\n    def __init__(self, dim, mask_type='channel', hidden_dim=256):\n        super().__init__()\n        self.dim = dim\n        self.split_dim = dim // 2\n        self.mask_type = mask_type\n\n        # s 和 t 网络\n        self.s_net = nn.Sequential(\n            nn.Linear(self.split_dim, hidden_dim),\n            nn.ReLU(),\n            nn.Linear(hidden_dim, hidden_dim),\n            nn.ReLU(),\n            nn.Linear(hidden_dim, self.split_dim)\n        )\n        self.t_net = nn.Sequential(\n            nn.Linear(self.split_dim, hidden_dim),\n            nn.ReLU(),\n            nn.Linear(hidden_dim, hidden_dim),\n            nn.ReLU(),\n            nn.Linear(hidden_dim, self.split_dim)\n        )\n        # 缩放稳定：tanh 限制输出范围\n        self.s_net[-1].weight.data.mul_(0.01)\n        self.s_net[-1].bias.data.zero_()\n\n    def forward(self, z):\n        # 前向：z -> x\n        z_a, z_b = z[:, :self.split_dim], z[:, self.split_dim:]\n        s = self.s_net(z_a)\n        t = self.t_net(z_a)\n        x_b = z_b * torch.exp(s) + t\n        log_det = s.sum(dim=-1)\n        return torch.cat([z_a, x_b], dim=-1), log_det\n\n    def inverse(self, x):\n        # 逆向：x -> z (直接计算，无需迭代)\n        x_a, x_b = x[:, :self.split_dim], x[:, self.split_dim:]\n        s = self.s_net(x_a)\n        t = self.t_net(x_a)\n        z_b = (x_b - t) * torch.exp(-s)\n        return torch.cat([x_a, z_b], dim=-1)"
                },
                {
                    lang: "python",
                    code: "# RealNVP 完整模型（多耦合层 + 交替掩码）\nclass RealNVP(nn.Module):\n    def __init__(self, dim, n_flows=8, hidden_dim=256):\n        super().__init__()\n        self.layers = nn.ModuleList()\n        for i in range(n_flows):\n            self.layers.append(AffineCouplingLayer(\n                dim, hidden_dim=hidden_dim\n            ))\n            # 交替分割：奇数层交换 z_a 和 z_b 的角色\n            if i % 2 == 1:\n                self.layers.append(ReverseLayer(dim))\n\n    def forward(self, z):\n        total_log_det = z.new_zeros(z.shape[0])\n        for layer in self.layers:\n            z, log_det = layer(z)\n            total_log_det += log_det\n        return z, total_log_det\n\n    def sample(self, n_samples, base_dist):\n        z_0 = base_dist.sample((n_samples,))\n        x, _ = self.forward(z_0)\n        return x\n\n    def log_prob(self, x):\n        z, log_det = self.inverse_and_log_det(x)\n        log_p_z = torch.distributions.Normal(0, 1).log_prob(z).sum(-1)\n        return log_p_z + log_det\n\nclass ReverseLayer(nn.Module):\n    def __init__(self, dim):\n        super().__init__()\n        self.dim = dim\n    def forward(self, z):\n        return torch.flip(z, dims=[-1]), z.new_zeros(z.shape[0])\n    def inverse(self, x):\n        return torch.flip(x, dims=[-1])"
                }
            ],
            table: {
                headers: ["组件", "功能", "计算复杂度", "可逆性"],
                rows: [
                    ["仿射耦合层", "分块缩放+平移", "O(D)", "直接逆变换"],
                    ["交替掩码", "确保所有维度被变换", "O(1)", "排列矩阵，行列式=1"],
                    ["多尺度架构", "逐层提取隐变量", "O(D)", "直接分解"],
                    ["s 网络", "预测对数缩放因子", "O(D*H)", "仅前向"],
                    ["t 网络", "预测平移因子", "O(D*H)", "仅前向"],
                    ["批量归一化", "稳定激活值分布", "O(D)", "可逆（训练时固定统计量）"]
                ]
            },
            mermaid: "graph TD\n    A[\"输入 z\"] --> B[\"分割: z_a | z_b\"]\n    B --> C[\"z_a 保持不变\"]\n    B --> D[\"s(z_a), t(z_a) 网络\"]\n    D --> E[\"z_b' = z_b * exp(s) + t\"]\n    C --> F[\"拼接: z_a | z_b'\"]\n    E --> F\n    F --> G[\"输出 x\"]\n    G -.->|\"log|det| = sum(s)\"| H[\"似然计算\"]\n    style C fill:#4CAF50\n    style E fill:#2196F3,color:#1e293b",
            tip: "s 网络的最后一层用较小的初始化权重（如 0.01），可以防止初始缩放因子过大导致训练不稳定。",
            warning: "RealNVP 的交替分割策略确保每个维度都能被变换，如果忘记交替，只有一半维度会被建模。"
        },
        {
            title: "5. Glow 与可逆 1x1 卷积",
            body: "Glow（Generative flow with invertible 1x1 convolutions）在 RealNVP 的基础上做出了两个关键改进。第一，用可逆 1x1 卷积替代固定的交替掩码排列。在 RealNVP 中，维度的重排列是预先固定的（如翻转），缺乏灵活性。Glow 将排列推广为一个可学习的可逆线性变换 W，其中 W 是一个 D 乘以 D 的可逆矩阵。为了保证行列式计算高效，Glow 使用 LU 分解：W = P L U，其中 P 是排列矩阵，L 是单位下三角矩阵，U 是上三角矩阵。行列式为对角线元素的乘积，复杂度 O(D^2)。第二，Glow 引入了可逆批量归一化（ActNorm），在每一层之前对激活值进行可逆的仿射变换，并使用数据驱动的初始化使其输出在训练初期具有零均值和单位方差。这两个改进使得 Glow 能够生成高质量的图像，甚至可以在隐空间中进行有意义的语义编辑（如微笑、发色变化），这在之前的 Flow 模型中是难以实现的。",
            code: [
                {
                    lang: "python",
                    code: "# 可逆 1x1 卷积（LU 分解实现）\nclass InvertibleConv1x1(nn.Module):\n    def __init__(self, channels):\n        super().__init__()\n        self.channels = channels\n        # LU 分解参数化\n        # W = P @ L @ (U + diag(s))\n        self.register_buffer('P', torch.eye(channels))\n        self.L = nn.Parameter(torch.tril(torch.randn(channels, channels), -1))\n        self.U_diag = nn.Parameter(torch.randn(channels))  # log 对角线\n        self.U_off = nn.Parameter(torch.triu(torch.randn(channels, channels), 1))\n\n    def _get_W(self):\n        L = torch.eye(self.channels) + self.L\n        U = torch.diag(torch.exp(self.U_diag)) + self.U_off\n        return self.P @ L @ U\n\n    def _get_log_det(self):\n        return self.U_diag.sum()  # log|det W| = sum(log|U_ii|)\n\n    def forward(self, z):\n        W = self._get_W()\n        # z: [..., channels]\n        z_out = torch.einsum('...i,ij->...j', z, W)\n        return z_out, self._get_log_det()\n\n    def inverse(self, x):\n        W = self._get_W()\n        W_inv = torch.inverse(W)  # DxD 矩阵求逆\n        return torch.einsum('...i,ij->...j', x, W_inv)"
                },
                {
                    lang: "python",
                    code: "# ActNorm（可逆批量归一化）\nclass ActNorm(nn.Module):\n    def __init__(self, dim):\n        super().__init__()\n        self.dim = dim\n        self.log_scale = nn.Parameter(torch.zeros(dim))\n        self.bias = nn.Parameter(torch.zeros(dim))\n        self.initialized = False\n\n    def forward(self, z):\n        if not self.initialized and self.training:\n            # 数据驱动初始化：使输出零均值单位方差\n            with torch.no_grad():\n                self.log_scale.data = -torch.log(z.std(dim=0) + 1e-6)\n                self.bias.data = -z.mean(dim=0) * torch.exp(self.log_scale.data)\n            self.initialized = True\n\n        out = z * torch.exp(self.log_scale) + self.bias\n        log_det = self.log_scale.sum() * z.shape[0]\n        return out, log_det\n\n    def inverse(self, x):\n        return (x - self.bias) * torch.exp(-self.log_scale)"
                }
            ],
            table: {
                headers: ["特性", "RealNVP", "Glow"],
                rows: [
                    ["维度排列", "固定翻转", "可学习 1x1 卷积"],
                    ["排列矩阵自由度", "1（翻转）", "D^2（完整线性变换）"],
                    ["归一化", "批量归一化(不可逆)", "ActNorm(可逆)"],
                    ["图像质量", "较好", "极好"],
                    ["隐空间编辑", "有限", "支持语义编辑"],
                    ["训练稳定性", "较好", "很好(ActNorm 初始化)"]
                ]
            },
            mermaid: "graph TD\n    A[\"输入 z\"] --> B[\"ActNorm\"]\n    B --> C[\"可逆 1x1 卷积 (W)\"]\n    C --> D[\"仿射耦合层\"]\n    D --> E[\"ActNorm\"]\n    E --> F[\"输出 x\"]\n    subgraph Glow Step\n    B\n    C\n    D\n    E\n    end\n    style C fill:#FF9800,color:#1e293b",
            tip: "Glow 的 LU 分解参数化确保 W 始终可逆且行列式计算为 O(D)，避免直接学习 DxD 矩阵的 O(D^3) 求逆。",
            warning: "可逆 1x1 卷积的参数量为 O(D^2)，在高维通道下内存占用显著，建议 C < 1024。"
        },
        {
            title: "6. 自回归流 MAF 与 IAF",
            body: "自回归流（Autoregressive Flows）是 Flow 模型中表达能力最强的一类。其核心思想是利用链式法则将联合分布分解为条件分布的乘积：p(x) = 连乘 p(x_i | x_{<i})。MAF（Masked Autoregressive Flow）和 IAF（Inverse Autoregressive Flow）是两种互补的自回归 Flow。MAF 的前向变换是自回归的：每个维度 x_i 的变换参数（均值和方差）只依赖前面已计算的维度 x_{<i}。这使得 MAF 的密度估计高效（可并行计算所有条件参数），但采样需要串行（从 x_1 到 x_D 逐个生成）。IAF 则恰恰相反：采样时所有维度可以并行计算，但密度估计需要串行。这种互补性催生了自回归流的一个经典模式：用 MAF 做密度估计训练，用 IAF 做采样生成。MADE（Masked Autoencoder for Distribution Estimation）是实现自回归约束的关键技术，通过对网络权重施加掩码，确保每个输出只依赖输入的前面维度。自回归流在密度估计任务上通常优于 RealNVP 和 Glow，但采样效率是其主要瓶颈。",
            code: [
                {
                    lang: "python",
                    code: "# MADE 掩码生成（自回归约束的核心）\ndef make_made_masks(input_dim, hidden_dims, output_multiplier=1):\n    # 生成 MADE 的连接掩码\n    # 给每个输入分配度数 (1 到 input_dim)\n    input_degrees = torch.arange(1, input_dim + 1)\n\n    masks = []\n    prev_degrees = input_degrees\n\n    for hidden_dim in hidden_dims:\n        # 隐藏单元的度数 >= 前一层的最小度数\n        hidden_degrees = torch.randint(\n            low=prev_degrees.min(), high=input_dim,\n            size=(hidden_dim,))\n        masks.append((hidden_degrees[:, None] >= prev_degrees[None]).float())\n        prev_degrees = hidden_degrees\n\n    # 输出层的度数 = 对应输入的度数\n    output_degrees = input_degrees.repeat(output_multiplier)\n    masks.append((output_degrees[:, None] > prev_degrees[None]).float())\n\n    return masks\n\n# 示例：输入 4 维，隐藏层 [16, 16]\nmasks = make_made_masks(input_dim=4, hidden_dims=[16, 16])\nprint(f'Mask shapes: {[m.shape for m in masks]}')\nprint(f'Input mask (first):\\n{masks[0]}')"
                },
                {
                    lang: "python",
                    code: "# MAF 层实现\nclass MAFLayer(nn.Module):\n    def __init__(self, dim, hidden_dim=64):\n        super().__init__()\n        self.dim = dim\n        masks = make_made_masks(dim, [hidden_dim, hidden_dim], 2)\n\n        # 用线性层 + 掩码实现 MADE\n        self.linear1 = nn.Linear(dim, hidden_dim)\n        self.linear2 = nn.Linear(hidden_dim, hidden_dim)\n        self.linear_out = nn.Linear(hidden_dim, dim * 2)  # mean + log_std\n\n        self.masks = masks\n        self._apply_masks()\n\n    def _apply_masks(self):\n        self.linear1.weight.data *= self.masks[0]\n        self.linear2.weight.data *= self.masks[1]\n        self.linear_out.weight.data *= self.masks[2]\n\n    def forward(self, z):\n        # MAF: 计算 x 和 log|det J| (密度估计高效)\n        h = torch.tanh(self.linear1(z))\n        h = torch.tanh(self.linear2(h))\n        params = self.linear_out(h)  # [mean, log_std] 拼接\n        mean = params[:, :self.dim]\n        log_std = params[:, self.dim:]\n        log_std = torch.tanh(log_std)  # 稳定化\n\n        x = z * torch.exp(log_std) + mean\n        log_det = log_std.sum(dim=-1)\n        return x, log_det\n\n    def inverse(self, x):\n        # MAF 逆变换需要串行计算\n        z = torch.zeros_like(x)\n        for i in range(self.dim):\n            h = torch.tanh(self.linear1(z))\n            h = torch.tanh(self.linear2(h))\n            params = self.linear_out(h)\n            mean_i = params[:, i]\n            log_std_i = torch.tanh(params[:, self.dim + i])\n            z[:, i] = (x[:, i] - mean_i) * torch.exp(-log_std_i)\n        return z"
                }
            ],
            table: {
                headers: ["特性", "MAF", "IAF", "RealNVP"],
                rows: [
                    ["密度估计", "O(1) 并行", "O(D) 串行", "O(1) 并行"],
                    ["采样", "O(D) 串行", "O(1) 并行", "O(1) 并行"],
                    ["表达能力", "最强", "最强", "中等"],
                    ["实现难度", "中", "中", "低"],
                    ["适用场景", "密度估计", "快速采样", "通用生成"],
                    ["自回归约束", "MADE 掩码", "IAF 参数化", "耦合层分割"]
                ]
            },
            mermaid: "graph LR\n    A[\"密度估计任务\"] --> B{\"选择 Flow\"}\n    C[\"快速采样任务\"] --> B\n    B -->|需要密度| D[\"MAF (并行密度)\"]\n    B -->|需要采样| E[\"IAF (并行采样)\"]\n    B -->|两者都要| F[\"RealNVP/Glow\"]\n    D --> G[\"MADE 掩码\"]\n    E --> H[\"自回归参数化\"]\n    F --> I[\"耦合层\"]\n    style B fill:#FF9800,color:#1e293b",
            tip: "实践中可以组合使用：训练时用 MAF 计算似然，推理时用 IAF 并行采样，两者共享参数。",
            warning: "MAF 的逆变换是串行的，维度 D 很大时（如图像 D=3072），采样速度会成为严重瓶颈。"
        },
        {
            title: "7. PyTorch 实战：训练 Flow 生成模型",
            body: "本节从零搭建一个完整的 Normalizing Flow 训练流程，在双螺旋（two-moons）数据集上演示 Flow 模型如何学习复杂的二维流形。我们使用 RealNVP 风格的耦合层，配合简单的 MLP 作为缩放和平移网络。二维数据的好处是我们可以可视化每一步变换，直观理解 Flow 如何将简单的高斯分布扭曲成复杂的目标分布。训练使用负对数似然（NLL）作为损失函数，通过 Adam 优化器最小化。关键技巧包括：使用梯度裁剪防止数值爆炸、监控雅可比行列式的分布确保变换不会退化、以及定期可视化生成的样本。这个 2D 实验虽然简单，但完整展示了 Flow 模型的训练管线：数据加载 到 密度估计 到 损失计算 到 梯度更新 到 样本生成。掌握这个流程后，可以轻松扩展到更高维的数据（如 MNIST 手写数字）和更复杂的 Flow 架构。",
            code: [
                {
                    lang: "python",
                    code: "# Flow 模型训练器\nclass FlowTrainer:\n    def __init__(self, model, lr=1e-3, clip_grad=5.0):\n        self.model = model\n        self.optimizer = torch.optim.Adam(model.parameters(), lr=lr)\n        self.clip_grad = clip_grad\n        self.base_dist = torch.distributions.Normal(0, 1)\n\n    def train_step(self, x):\n        # 单步训练：计算 NLL 并更新参数\n        self.model.train()\n\n        # 计算负对数似然\n        z, log_det = self.model.inverse_and_log_det(x)\n        log_p_z = self.base_dist.log_prob(z).sum(dim=-1)\n        log_p_x = log_p_z + log_det\n        loss = -log_p_x.mean()  # 最小化 NLL\n\n        self.optimizer.zero_grad()\n        loss.backward()\n        torch.nn.utils.clip_grad_norm_(\n            self.model.parameters(), self.clip_grad)\n        self.optimizer.step()\n\n        return loss.item()\n\n    def sample(self, n_samples):\n        # 从 Flow 模型采样\n        self.model.eval()\n        with torch.no_grad():\n            z = self.base_dist.sample((n_samples, self.model.dim))\n            x, _ = self.model.forward(z)\n        return x\n\n    def evaluate(self, x_test):\n        # 评估测试集上的 NLL\n        self.model.eval()\n        with torch.no_grad():\n            z, log_det = self.model.inverse_and_log_det(x_test)\n            log_p_z = self.base_dist.log_prob(z).sum(dim=-1)\n            log_p_x = log_p_z + log_det\n            return -log_p_x.mean().item()"
                },
                {
                    lang: "python",
                    code: "# 完整训练流程（2D Two-Moons 数据集）\nimport torch\nimport matplotlib.pyplot as plt\nfrom sklearn.datasets import make_moons\n\ndef train_flow_2d(n_flows=8, epochs=500, batch_size=256):\n    # 数据：双螺旋流形\n    moons_data, _ = make_moons(n_samples=10000, noise=0.1)\n    data = torch.FloatTensor(moons_data)\n    # 标准化\n    data = (data - data.mean(0)) / data.std(0)\n\n    # 模型：RealNVP 风格\n    model = RealNVP(dim=2, n_flows=n_flows, hidden_dim=128)\n    trainer = FlowTrainer(model, lr=1e-3)\n\n    # 训练\n    losses = []\n    for epoch in range(epochs):\n        indices = torch.randperm(data.shape[0])\n        epoch_loss = 0\n        n_batches = 0\n\n        for start in range(0, data.shape[0], batch_size):\n            batch = data[indices[start:start+batch_size]]\n            loss = trainer.train_step(batch)\n            epoch_loss += loss\n            n_batches += 1\n\n        losses.append(epoch_loss / n_batches)\n\n        if (epoch + 1) % 50 == 0:\n            avg_nll = trainer.evaluate(data[:1000])\n            print(f'Epoch {epoch+1:3d} | NLL: {avg_nll:.4f}')\n\n            # 可视化生成样本\n            samples = trainer.sample(5000)\n            plt.figure(figsize=(4, 4))\n            plt.scatter(samples[:, 0], samples[:, 1],\n                       s=1, alpha=0.3)\n            plt.title(f'Generated (epoch {epoch+1})')\n            plt.xlim(-3, 3)\n            plt.ylim(-3, 3)\n            plt.savefig(f'flow_samples_{epoch+1}.png', dpi=150)\n            plt.close()\n\n    return model, losses\n\n# 运行训练\nmodel, losses = train_flow_2d(n_flows=8, epochs=200)"
                }
            ],
            table: {
                headers: ["训练阶段", "关键指标", "期望行为", "异常信号"],
                rows: [
                    ["初始化", "NLL", "~3.0-4.0（2D 高斯基准）", "< 2.0（可能泄漏）"],
                    ["前 50 epoch", "NLL 下降", "快速下降到 ~2.0", "不下降（学习率太低）"],
                    ["50-150 epoch", "NLL 缓慢下降", "~1.5-1.0", "震荡（学习率太高）"],
                    ["150+ epoch", "NLL 收敛", "稳定在 ~0.8-1.0", "NLL 上升（过拟合）"],
                    ["采样质量", "视觉检查", "双螺旋形状清晰", "全部挤在一起（collapse）"],
                    ["雅可比行列式", "log|det J| 均值", "在 [-2, 2] 范围", "趋近 -inf（变换退化）"]
                ]
            },
            mermaid: "graph TD\n    A[\"Two-Moons 数据\"] --> B[\"标准化\"]\n    B --> C[\"mini-batch 采样\"]\n    C --> D[\"Flow 逆变换 z, log_det\"]\n    D --> E[\"NLL = -log p(z) - log_det\"]\n    E --> F[\"Adam 更新\"]\n    F --> G{\"收敛?\"}\n    G -->|否| C\n    G -->|是| H[\"采样生成\"]\n    H --> I[\"可视化评估\"]\n    style E fill:#FF9800,color:#1e293b\n    style H fill:#4CAF50,color:#1e293b",
            tip: "训练 2D Flow 时用可视化的方式调试非常高效，每 50 epoch 画一次散点图，可以直观发现模式崩塌或变换退化。",
            warning: "梯度裁剪是 Flow 训练的标配，不裁剪的话雅可比行列式可能导致梯度爆炸。"
        },
    ],
};
