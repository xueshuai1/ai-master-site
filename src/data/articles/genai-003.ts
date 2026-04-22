import { Article } from '../knowledge';

export const article: Article = {
    id: "genai-003",
    title: "VAE：变分自编码器",
    category: "genai",
    tags: ["VAE", "生成模型", "潜变量"],
    summary: "从概率建模到潜空间采样，理解变分自编码器的生成原理",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 自编码器到变分自编码器",
            body: `经典自编码器（Autoencoder）由编码器和解码器组成：编码器将高维输入 x 压缩为低维表示 z，解码器从 z 重构回 x。它本质上是做数据压缩与降维，而非真正的生成模型。问题在于，普通自编码器的潜空间是离散的、不连续的，随机采样一个 z 点往往解码出无意义的内容。变分自编码器（VAE）的关键突破在于将潜变量 z 视为概率分布而非确定值。编码器不再输出单个向量，而是输出一个分布的参数（均值 mu 和方差 sigma），解码器则从该分布采样 z 来重构 x。这使得潜空间变得连续且平滑，任意采样点都能解码出合理的样本，VAE 因此成为真正的生成模型。从信息论角度看，VAE 在压缩效率和重构精度之间引入了 KL 散度正则，迫使潜空间接近标准正态分布。`,
            code: [
                {
                    lang: "python",
                    code: `# 经典自编码器 vs VAE 编码器对比\nimport torch\nimport torch.nn as nn\n\nclass ClassicEncoder(nn.Module):\n    def __init__(self, input_dim=784, latent_dim=32):\n        super().__init__()\n        self.fc = nn.Sequential(\n            nn.Linear(input_dim, 256),\n            nn.ReLU(),\n            nn.Linear(256, latent_dim)  # 输出确定向量\n        )\n    def forward(self, x):\n        return self.fc(x)  # z 是确定的\n\nclass VAE_Encoder(nn.Module):\n    def __init__(self, input_dim=784, latent_dim=32):\n        super().__init__()\n        self.fc = nn.Sequential(\n            nn.Linear(input_dim, 256),\n            nn.ReLU()\n        )\n        self.mu = nn.Linear(256, latent_dim)      # 均值\n        self.logvar = nn.Linear(256, latent_dim)  # 对数方差\n    def forward(self, x):\n        h = self.fc(x)\n        return self.mu(h), self.logvar(h)  # 输出分布参数`
                },
                {
                    lang: "python",
                    code: `# 潜空间可视化：经典 AE vs VAE\nimport matplotlib.pyplot as plt\nimport numpy as np\n\ndef visualize_latent_space(encoder, data_loader, is_vae=True):\n    z_all, labels = [], []\n    for x, y in data_loader:\n        if is_vae:\n            mu, _ = encoder(x.view(x.size(0), -1))\n            z_all.append(mu.detach().numpy())\n        else:\n            z = encoder(x.view(x.size(0), -1))\n            z_all.append(z.detach().numpy())\n        labels.append(y.numpy())\n    z_all = np.vstack(z_all)\n    labels = np.concatenate(labels)\n    plt.figure(figsize=(10, 8))\n    for digit in range(10):\n        mask = labels == digit\n        plt.scatter(z_all[mask, 0], z_all[mask, 1],\n                    s=5, alpha=0.5, label=str(digit))\n    plt.legend()\n    title = "VAE Latent Space" if is_vae else "Classic AE Latent Space"\n    plt.title(title)`
                }
            ],
            table: {
                headers: ["特性", "经典自编码器", "变分自编码器 VAE"],
                rows: [
                    ["编码器输出", "确定向量 z", "分布参数 mu, sigma"],
                    ["潜空间", "离散、不连续", "连续、平滑"],
                    ["能否采样生成", "不能", "能"],
                    ["正则化", "无", "KL 散度正则"],
                    ["损失函数", "重构误差", "重构误差 + KL"],
                    ["生成质量", "不适用", "中等（偏模糊）"]
                ]
            },
            mermaid: `graph LR\n    A["输入 x"] --> B["经典编码器"]\n    B --> C["确定向量 z"]\n    C --> D["解码器"]\n    D --> E["重构 x_hat"]\n    A2["输入 x"] --> F["VAE 编码器"]\n    F --> G["mu, logvar"]\n    G --> H["采样 z"]\n    H --> I["VAE 解码器"]\n    I --> J["重构 x_hat"]\n    style F fill:#4CAF50\n    style G fill:#FF9800,color:#1e293b`,
            tip: "对数方差 logvar 比直接学方差 sigma 更稳定，因为 logvar 的取值范围是全体实数，无需额外的约束。",
            warning: "经典自编码器不能直接用于生成，因为潜空间中存在大量空白区域，随机采样大概率落入无意义区域。"
        },
        {
            title: "2. 概率图模型视角",
            body: `理解 VAE 最优雅的方式是通过概率图模型（Probabilistic Graphical Model）。VAE 假设数据的生成过程如下：首先从先验分布 p(z)（通常为标准正态分布 N(0, I)）中采样潜变量 z，然后通过条件分布 p_theta(x | z) 生成观测数据 x。这里的 theta 是解码器的可学习参数。然而，我们只有观测数据 x，不知道对应的 z。根据贝叶斯定理，后验分布 p(z | x) = p(x | z) * p(z) / p(x)，其中边缘似然 p(x) = 积分 p(x | z) * p(z) dz 是不可计算的（intractable）。这就是变分推断大显身手的地方。我们引入一个近似后验分布 q_phi(z | x)（编码器，参数为 phi），用它来逼近真实的后验 p(z | x)。这样，整个 VAE 框架就可以理解为：编码器学习近似后验 q_phi(z | x)，解码器学习生成分布 p_theta(x | z)，两者联合优化使得近似后验尽可能接近真实后验。`,
            code: [
                {
                    lang: "python",
                    code: `# 概率图模型的数值理解\nimport torch\nfrom torch.distributions import Normal\n\nclass ProbabilisticVAE:\n    def __init__(self, latent_dim=32):\n        self.prior = Normal(torch.zeros(latent_dim),\n                           torch.ones(latent_dim))  # p(z)\n\n    def prior_sample(self, n_samples=1):\n        # 从先验 p(z) 采样\n        return self.prior.sample((n_samples,))\n\n    def log_likelihood(self, x_recon, x, var=0.1):\n        # 计算对数似然 log p(x|z) 的下界\n        dist = Normal(x_recon, var)\n        return dist.log_prob(x).sum(dim=-1).mean()\n\n    def kl_to_prior(self, mu, logvar):\n        # KL[q(z|x) || p(z)] 的解析解\n        return -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp(), dim=-1).mean()`
                },
                {
                    lang: "python",
                    code: `# 边缘似然不可计算性的演示\nimport numpy as np\nfrom scipy.integrate import nquad\n\ndef demonstrate_intractability():\n    # 在 1 维情况下演示为什么 p(x) 难以计算\n    # p(z) = N(0, 1)\n    # p(x|z) = N(f(z), 0.1) 其中 f 是神经网络\n\n    # 简单情况：f(z) = 2*z\n    def p_xz(z, x=1.0):\n        mean = 2 * z\n        var = 0.1\n        return (1/np.sqrt(2*np.pi*var)) * np.exp(-(x-mean)**2/(2*var))\n\n    def p_z(z):\n        return (1/np.sqrt(2*np.pi)) * np.exp(-z**2/2)\n\n    def integrand(z, x=1.0):\n        return p_xz(z, x) * p_z(z)\n\n    # 数值积分计算 p(x)\n    result, _ = nquad(integrand, [[-10, 10]])\n    print(f"p(x=1.0) = {result:.6f}")\n    print(f"维度灾难：32 维需要 20^32 次积分评估!")`
                }
            ],
            table: {
                headers: ["符号", "含义", "类型", "参数化方式"],
                rows: [
                    ["p(z)", "先验分布", "已知", "N(0, I)，固定"],
                    ["p_theta(x|z)", "生成分布", "可学习", "解码器神经网络"],
                    ["p(z|x)", "真实后验", "不可计算", "需要近似"],
                    ["q_phi(z|x)", "近似后验", "可学习", "编码器神经网络"],
                    ["p(x)", "边缘似然", "不可计算", "VAE 优化目标"],
                    ["theta, phi", "模型参数", "可学习", "联合优化"]
                ]
            },
            mermaid: `graph TD\n    A["先验 p(z) ~ N(0,I)"] -->|采样 z| B["解码器 p(x|z)"]\n    B -->|生成| C["数据 x"]\n    C -->|编码| D["近似后验 q(z|x)"]\n    D -->|逼近| E["真实后验 p(z|x)"]\n    E -->|贝叶斯定理| A\n    style A fill:#4CAF50\n    style B fill:#2196F3\n    style D fill:#FF9800,color:#1e293b`,
            tip: "先验选择为标准正态分布不是唯一选择，也可以用混合高斯或 VampPrior 来提升生成能力。",
            warning: "边缘似然 p(x) 在高维空间中是不可计算的，这就是为什么 VAE 必须通过变分下界来间接优化。"
        },
        {
            title: "3. 重参数化技巧",
            body: `VAE 训练的核心难题在于：我们需要通过采样 z 来计算重构损失，但采样操作不可导，梯度无法反向传播。重参数化技巧（Reparameterization Trick）是 Kingma 和 Welling 在 2013 年提出的关键创新。其思想非常巧妙：与其直接从 N(mu, sigma^2) 中采样 z，不如先从标准正态分布 N(0, I) 中采样一个辅助变量 epsilon，然后通过确定性变换 z = mu + sigma * epsilon 得到 z。这样，z 的计算变成了一个完全可导的操作（mu 和 sigma 都是网络的输出，epsilon 是外部采样），梯度可以顺畅地从 z 回传到编码器。这个技巧的深远意义在于，它将随机性转移到了输入端，使得整个 VAE 可以用标准的反向传播算法端到端训练。没有重参数化，VAE 只能用 REINFORCE 等高方差梯度估计器，训练会极其困难。`,
            code: [
                {
                    lang: "python",
                    code: `# 重参数化技巧实现\nimport torch\nimport torch.nn as nn\n\nclass ReparameterizedVAE(nn.Module):\n    def __init__(self, input_dim=784, latent_dim=32):\n        super().__init__()\n        self.encoder = nn.Sequential(\n            nn.Linear(input_dim, 512), nn.ReLU(),\n            nn.Linear(512, 256), nn.ReLU()\n        )\n        self.fc_mu = nn.Linear(256, latent_dim)\n        self.fc_logvar = nn.Linear(256, latent_dim)\n        self.decoder = nn.Sequential(\n            nn.Linear(latent_dim, 256), nn.ReLU(),\n            nn.Linear(256, 512), nn.ReLU(),\n            nn.Linear(512, input_dim), nn.Sigmoid()\n        )\n\n    def reparameterize(self, mu, logvar):\n        # z = mu + sigma * eps\n        std = torch.exp(0.5 * logvar)  # sigma = exp(logvar/2)\n        eps = torch.randn_like(std)     # eps ~ N(0, I)\n        return mu + std * eps           # z 的确定性计算\n\n    def forward(self, x):\n        h = self.encoder(x)\n        mu = self.fc_mu(h)\n        logvar = self.fc_logvar(h)\n        z = self.reparameterize(mu, logvar)  # 可导!\n        x_recon = self.decoder(z)\n        return x_recon, mu, logvar`
                },
                {
                    lang: "python",
                    code: `# 对比：不可导采样 vs 重参数化\nimport torch\nfrom torch.autograd import gradcheck\n\ndef non_differentiable_sampling(mu, logvar):\n    # 错误做法：直接采样，梯度断联\n    std = torch.exp(0.5 * logvar)\n    z = torch.normal(mu, std)  # 不可导！\n    return z\n\ndef reparameterized_sampling(mu, logvar):\n    # 正确做法：重参数化\n    std = torch.exp(0.5 * logvar)\n    eps = torch.randn_like(std)\n    z = mu + std * eps  # 完全可导！\n    return z\n\n# 验证可导性\nmu = torch.randn(4, 32, requires_grad=True, dtype=torch.float64)\nlogvar = torch.randn(4, 32, requires_grad=True, dtype=torch.float64)\n# 重参数化版本的梯度流是完整的\nz = reparameterized_sampling(mu, logvar)\nz.sum().backward()\nprint(f"mu.grad 非空: {mu.grad is not None}")  # True`
                }
            ],
            table: {
                headers: ["方法", "采样公式", "可导性", "梯度方差", "训练效果"],
                rows: [
                    ["直接采样", "z ~ N(mu, sigma^2)", "不可导", "N/A", "无法训练"],
                    ["REINFORCE", "z ~ N(mu, sigma^2)", "可导（得分函数）", "极高", "训练极不稳定"],
                    ["重参数化", "z = mu + sigma * eps", "完全可导", "低", "稳定高效"],
                    ["Gumbel-Softmax", "用于离散潜变量", "可导（近似）", "中", "离散 VAE"],
                    ["Concrete 分布", "连续松弛离散变量", "可导", "中", "可学习离散结构"]
                ]
            },
            mermaid: `graph LR\n    A["编码器"] --> B["mu, logvar"]\n    B --> C["std = exp(logvar/2)"]\n    D["eps ~ N(0,I)"] --> E["z = mu + std * eps"]\n    C --> E\n    E --> F["解码器"]\n    F --> G["重构损失"]\n    G -.梯度.-> E\n    E -.梯度.-> B\n    style D fill:#f44336\n    style E fill:#4CAF50,color:#1e293b`,
            tip: "实现时推荐使用 logvar 而不是 sigma，可以避免数值溢出问题，sigma = exp(logvar / 2) 始终为正。",
            warning: "重参数化要求潜变量分布是连续且可微的，对于离散潜变量需要使用 Gumbel-Softmax 等替代方案。"
        },
        {
            title: "4. ELBO 损失推导",
            body: `VAE 的训练目标是最大化对数边缘似然 log p(x)，但由于 p(x) 不可计算，我们转而优化其对数证据下界（Evidence Lower Bound, ELBO）。推导过程从 KL 散度的定义出发：KL[q(z|x) || p(z|x)] = E_q[log q(z|x) - log p(z|x)]。利用贝叶斯定理展开 log p(z|x) = log p(x|z) + log p(z) - log p(x)，代入后得到 KL = E_q[log q(z|x)] - E_q[log p(x|z)] - E_q[log p(z)] + log p(x)。整理可得 log p(x) - KL[q(z|x) || p(z|x)] = E_q[log p(x|z)] - KL[q(z|x) || p(z)]。由于 KL 散度非负，左侧的 E_q[log p(x|z)] - KL[q(z|x) || p(z)] 就是 log p(x) 的下界，即 ELBO。最大化 ELBO 等价于同时做两件事：最大化重构项 E_q[log p(x|z)]（解码器尽可能准确地重构输入）和最小化 KL 散度项 KL[q(z|x) || p(z)]（编码器输出分布接近先验）。这两项目标之间存在天然张力，正是这种张力塑造了 VAE 独特的潜空间结构。`,
            code: [
                {
                    lang: "python",
                    code: `# ELBO 损失的 PyTorch 实现\nimport torch\nimport torch.nn.functional as F\n\ndef compute_elbo(x_recon, x, mu, logvar, reduction="mean"):\n    # ELBO = E_q[log p(x|z)] - KL[q(z|x) || p(z)]\n    # 等价于: -重构误差 - KL 散度\n    # 重构项: 假设 p(x|z) 是伯努利分布(二值图像)\n    recon_loss = F.binary_cross_entropy(x_recon, x, reduction="none")\n    recon_loss = recon_loss.view(recon_loss.size(0), -1).sum(dim=-1)\n    # KL 散度项: KL[q(z|x) || p(z)] 的解析解\n    # 当 q = N(mu, diag(sigma^2)), p = N(0, I)\n    kl_loss = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp(), dim=-1)\n    elbo = -(recon_loss + kl_loss)  # 最大化 ELBO = 最小化负 ELBO\n    if reduction == "mean":\n        return elbo.mean(), recon_loss.mean(), kl_loss.mean()\n    return elbo, recon_loss, kl_loss`
                },
                {
                    lang: "python",
                    code: `# ELBO 各项的数值分析\nimport torch\nimport matplotlib.pyplot as plt\n\ndef analyze_elbo_balance():\n    # 分析重构项和 KL 项在不同训练阶段的占比\n    epochs = range(1, 101)\n    recon_losses = []\n    kl_losses = []\n    # 模拟训练过程中的变化趋势\n    for epoch in epochs:\n        recon = 200 * (0.3 + 0.7 * torch.exp(-torch.tensor(epoch/30))).item()\n        kl = 50 * (1 - torch.exp(-torch.tensor(epoch/20))).item()\n        recon_losses.append(recon)\n        kl_losses.append(kl)\n    plt.figure(figsize=(10, 4))\n    plt.plot(epochs, recon_losses, label="Reconstruction Loss")\n    plt.plot(epochs, kl_losses, label="KL Loss")\n    total = [r + k for r, k in zip(recon_losses, kl_losses)]\n    plt.plot(epochs, total, "--", label="Total Loss")\n    plt.xlabel("Epoch")\n    plt.ylabel("Loss")\n    plt.legend()\n    plt.title("ELBO Components During Training")`
                }
            ],
            table: {
                headers: ["ELBO 分量", "数学形式", "作用", "值过大的后果", "值过小的后果"],
                rows: [
                    ["重构项", "E_q[log p(x|z)]", "保证生成质量", "忽略先验约束", "退化为普通 AE"],
                    ["KL 项", "-KL[q||p]", "正则化潜空间", "潜空间坍缩", "潜空间过于分散"],
                    ["总 ELBO", "重构 - KL", "联合优化目标", "需要平衡两项", "需要平衡两项"],
                    ["对数似然", "log p(x)", "理论最优目标", "不可直接计算", "不可直接计算"]
                ]
            },
            mermaid: `graph TD\n    A["log p(x)"] -->|公式| B["ELBO + KL[q||p(z|x)]"]\n    B --> C["ELBO = E_q[log p(x|z)]"]\n    B --> D["- KL[q(z|x)||p(z)]"]\n    C --> E["重构质量"]\n    D --> F["潜空间正则"]\n    E -.张力.-> F\n    style A fill:#f44336\n    style C fill:#4CAF50\n    style D fill:#2196F3,color:#1e293b`,
            tip: "训练初期 KL 项往往占主导（posterior collapse），可以逐步增大 KL 权重（KL annealing）来缓解。",
            warning: "如果 KL 项直接归零，说明发生了 posterior collapse，VAE 退化为普通自编码器，完全丧失了生成能力。"
        },
        {
            title: "5. beta-VAE 与解耦表示",
            body: `标准 VAE 的 ELBO 中，重构项和 KL 项的权重是固定的 1:1 比例。beta-VAE（Higgins et al., 2017）引入了一个超参数 beta，将 ELBO 修改为 ELBO_beta = E_q[log p(x|z)] - beta * KL[q(z|x) || p(z)]。当 beta > 1 时，KL 正则化更强，迫使潜变量的各个维度学习数据中独立的生成因子（disentangled factors of variation）。例如在人脸数据上，理想的解耦表示中一个维度控制头发颜色、另一个控制微笑程度、第三个控制头部姿态等。beta-VAE 的理论基础是信息瓶颈：更强的 KL 约束限制了互信息 I(x, z)，迫使潜变量只编码最必要的信息。实验表明，适度增大 beta（如 beta = 4）可以学到明显解耦的表示，但过大的 beta 会导致重构质量严重下降。后续研究提出了 Annealed VAE、FactorVAE 等改进方案，在解耦度和重构质量之间寻找更好的平衡。`,
            code: [
                {
                    lang: "python",
                    code: `# beta-VAE 损失函数\nclass BetaVAELoss:\n    def __init__(self, beta=4.0, use_annealing=False):\n        self.beta = beta\n        self.use_annealing = use_annealing\n        self.current_beta = beta\n\n    def update_beta(self, epoch, max_epoch, max_beta=4.0):\n        # KL annealing: 逐步增大 beta\n        if self.use_annealing:\n            self.current_beta = max_beta * min(1.0, epoch / max_epoch)\n\n    def __call__(self, x_recon, x, mu, logvar):\n        recon = F.binary_cross_entropy(x_recon, x, reduction="none")\n        recon = recon.view(recon.size(0), -1).sum(dim=-1).mean()\n        kl = -0.5 * torch.sum(\n            1 + logvar - mu.pow(2) - logvar.exp(), dim=-1).mean()\n        return recon + self.current_beta * kl, recon, kl\n\n# 解耦度评估（MIG 指标）\ndef compute_mig(z_samples, factors):\n    # Mutual Information Gap - 解耦表示的量化指标\n    from sklearn.metrics import mutual_info_score\n    n_latent = z_samples.shape[1]\n    n_factor = factors.shape[1]\n    mi_matrix = np.zeros((n_latent, n_factor))\n    for i in range(n_latent):\n        for j in range(n_factor):\n            mi_matrix[i, j] = mutual_info_score(\n                np.digitize(z_samples[:, i], 20), factors[:, j])\n    sorted_mi = np.sort(mi_matrix, axis=0)[::-1]\n    gaps = sorted_mi[0] - sorted_mi[1]\n    return gaps.mean()  # MIG 越高，解耦越好`
                },
                {
                    lang: "python",
                    code: `# beta-VAE 训练循环与可视化\nimport torch\nimport matplotlib.pyplot as plt\n\ndef train_beta_vae(model, dataloader, beta=4.0, epochs=50, lr=1e-3):\n    optimizer = torch.optim.Adam(model.parameters(), lr=lr)\n    losses = []\n    for epoch in range(epochs):\n        model.train()\n        epoch_loss = 0\n        for x, _ in dataloader:\n            optimizer.zero_grad()\n            x_recon, mu, logvar = model(x)\n            recon = F.binary_cross_entropy(x_recon, x.view(x.size(0), -1),\n                                            reduction="sum")\n            kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())\n            loss = recon + beta * kl\n            loss.backward()\n            optimizer.step()\n            epoch_loss += loss.item()\n        losses.append(epoch_loss / len(dataloader.dataset))\n        if (epoch+1) % 10 == 0:\n            print(f"Epoch {epoch+1}: loss={losses[-1]:.2f}")\n    return losses\n\n# 对比不同 beta 值的训练曲线\nfor b in [1.0, 2.0, 4.0, 10.0]:\n    losses = train_beta_vae(vae, loader, beta=b, epochs=50)\n    plt.plot(losses, label=f"beta={b}")\nplt.legend()\nplt.xlabel("Epoch")\nplt.ylabel("ELBO Loss")\nplt.title("beta-VAE Training Curves")`
                }
            ],
            table: {
                headers: ["beta 值", "重构质量", "解耦程度", "潜空间紧凑度", "适用场景"],
                rows: [
                    ["beta = 0", "最优", "无解耦", "不紧凑", "退化为普通 AE"],
                    ["beta = 1", "好", "弱解耦", "紧凑", "标准 VAE"],
                    ["beta = 4", "中等", "良好解耦", "非常紧凑", "推荐起点"],
                    ["beta = 10", "较差", "强解耦", "极度紧凑", "需要解耦表示"],
                    ["beta > 20", "很差", "过解耦", "信息严重丢失", "通常不推荐"]
                ]
            },
            mermaid: `graph LR\n    A["输入 x"] --> B["beta-VAE 编码器"]\n    B --> C["mu, logvar"]\n    C --> D["重参数化采样"]\n    D --> E["VAE 解码器"]\n    E --> F["重构 x_hat"]\n    G["beta > 1"] -->|增大 KL 权重| H["潜变量解耦"]\n    H --> I["z1: 颜色"]\n    H --> J["z2: 形状"]\n    H --> K["z3: 姿态"]\n    style G fill:#FF9800,color:#1e293b\n    style H fill:#4CAF50,color:#1e293b`,
            tip: "实践中 beta 从 0 开始逐步 annealing 到 4 是最稳定的策略，可以避免训练初期的 posterior collapse。",
            warning: "beta 过大时重构质量会急剧下降，需要在解耦度和生成质量之间做取舍，没有银弹。"
        },
        {
            title: "6. VAE vs GAN vs Diffusion",
            body: `在生成模型的三大支柱中，VAE、GAN 和 Diffusion 各有其独特的哲学和技术路径。VAE 基于概率推断，通过最大化 ELBO 来学习数据的隐式表示，优势在于训练稳定、天然提供似然估计下界、潜空间可用于编辑和插值。劣势是生成样本偏模糊，因为 MSE 损失倾向于输出平均值。GAN 通过生成器和判别器的零和博弈学习数据分布，生成样本极其锐利逼真，但训练不稳定、模式崩溃、缺乏显式的似然估计。Diffusion 模型结合了 VAE 的稳定性和 GAN 的生成质量，通过渐进式去噪实现高质量生成，但采样速度慢。三者的数学框架完全不同：VAE 是变分推断，GAN 是博弈论，Diffusion 是非平衡热力学。近年来也出现了混合模型如 VQ-VAE + Transformer（DALL-E）、VQ-GAN 等，试图兼取各家之长。理解这三种范式的差异，对于选择合适的生成模型至关重要。`,
            code: [
                {
                    lang: "python",
                    code: `# 三大模型的采样过程对比\nimport torch\nimport time\n\ndef sample_vae(decoder, n=16, latent_dim=32):\n    # VAE 采样：一步完成\n    z = torch.randn(n, latent_dim)\n    with torch.no_grad():\n        return decoder(z)\n\ndef sample_gan(generator, n=16, latent_dim=32):\n    # GAN 采样：一步完成\n    z = torch.randn(n, latent_dim)\n    with torch.no_grad():\n        return generator(z)\n\ndef sample_diffusion(model, n=16, steps=1000):\n    # Diffusion 采样：多步迭代\n    x = torch.randn(n, 3, 64, 64)\n    for t in reversed(range(steps)):\n        with torch.no_grad():\n            noise_pred = model(x, t)\n            x = denoise_step(x, noise_pred, t)\n    return x\n\n# 计时对比\nlatent_dim = 64\nvae_time = time.time()\n_ = sample_vae(decoder, latent_dim=latent_dim)\nprint(f"VAE 采样: {time.time()-vae_time:.4f}s")`
                },
                {
                    lang: "python",
                    code: `# 生成模型综合评估\nimport matplotlib.pyplot as plt\nimport numpy as np\n\ndef compare_generative_models():\n    models = ["VAE", "GAN", "Diffusion", "VQ-VAE", "Flow"]\n    dims = ["质量", "多样性", "速度", "稳定性", "似然", "可编辑性"]\n    scores = np.array([\n        [6, 7, 9, 9, 7, 8],   # VAE\n        [9, 5, 9, 3, 1, 5],   # GAN\n        [10, 9, 3, 8, 8, 6],  # Diffusion\n        [8, 7, 8, 9, 5, 7],   # VQ-VAE\n        [7, 7, 6, 8, 9, 6],   # Flow\n    ])\n    fig, axes = plt.subplots(1, len(models), figsize=(20, 4))\n    for i, (model, score) in enumerate(zip(models, scores)):\n        angles = np.linspace(0, 2*np.pi, len(dims), endpoint=False)\n        score_closed = np.append(score, score[0])\n        angles_closed = np.append(angles, angles[0])\n        ax = axes[i]\n        ax.plot(angles_closed, score_closed, "o-")\n        ax.fill(angles_closed, score_closed, alpha=0.2)\n        ax.set_xticks(angles)\n        ax.set_xticklabels(dims, fontsize=8)\n        ax.set_ylim(0, 10)\n        ax.set_title(model)\n    plt.tight_layout()`
                }
            ],
            table: {
                headers: ["维度", "VAE", "GAN", "Diffusion"],
                rows: [
                    ["数学框架", "变分推断", "博弈论", "非平衡热力学"],
                    ["训练目标", "ELBO 最大化", "对抗损失", "噪声预测 MSE"],
                    ["生成质量", "中等", "优秀", "极佳"],
                    ["训练稳定性", "高", "低", "高"],
                    ["采样速度", "极快（一步）", "极快（一步）", "慢（多步迭代）"],
                    ["似然估计", "有下界", "不可行", "可行"],
                    ["模式崩溃", "不会", "会", "不会"],
                    ["潜空间可编辑", "天然支持", "不直接支持", "不直接支持"],
                    ["典型应用", "表征学习", "图像生成", "高质量生成"]
                ]
            },
            mermaid: `graph TD\n    A["生成模型"] --> B["VAE"]\n    A --> C["GAN"]\n    A --> D["Diffusion"]\n    B --> E["概率推断"]\n    B --> F["ELBO"]\n    C --> G["对抗训练"]\n    C --> H["min-max 博弈"]\n    D --> I["渐进去噪"]\n    D --> J["SDE/ODE"]\n    E -.融合.-> G\n    F -.启发.-> I\n    style B fill:#4CAF50\n    style C fill:#FF9800,color:#1e293b\n    style D fill:#2196F3,color:#1e293b`,
            tip: "选择模型时，如果需要可解释的潜空间和稳定训练，VAE 是最佳起点；如果追求极致视觉效果，Diffusion 是首选。",
            warning: "GAN 的模式崩溃问题在复杂数据集上很难完全解决，VAE 和 Diffusion 更可靠。"
        },
        {
            title: "7. PyTorch 实战：MNIST 生成与潜空间插值",
            body: `本节从零构建一个完整的 VAE，在 MNIST 手写数字数据集上训练，实现数字生成和潜空间插值。MNIST 是验证 VAE 实现的黄金数据集，因为它简单（28x28 灰度图、60000 张训练样本）但足以验证管线正确性。我们的模型使用全连接网络（非卷积），潜维度设为 2，这样可以直接可视化二维潜空间。训练 20 个 epoch 即可看到不错的重构效果。关键实现细节包括：使用 sigmoid 激活确保输出在 [0, 1] 范围、KL 散度的数值稳定计算（避免 logvar 过大导致溢出）、以及采样时使用模型评估模式关闭 dropout。训练完成后，我们将展示三个经典实验：从先验分布随机采样生成新数字、在潜空间中沿直线插值实现数字渐变、以及遍历潜空间网格生成所有数字变体。这些实验直观地展示了 VAE 学到的连续且结构化的潜空间。`,
            code: [
                {
                    lang: "python",
                    code: `# 完整 VAE 实现：MNIST 生成\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\nimport torchvision\nfrom torch.utils.data import DataLoader\nimport matplotlib.pyplot as plt\n\nclass VAE(nn.Module):\n    def __init__(self, latent_dim=2):\n        super().__init__()\n        self.latent_dim = latent_dim\n        # 编码器\n        self.enc = nn.Sequential(\n            nn.Linear(784, 512), nn.ReLU(),\n            nn.Linear(512, 256), nn.ReLU()\n        )\n        self.fc_mu = nn.Linear(256, latent_dim)\n        self.fc_logvar = nn.Linear(256, latent_dim)\n        # 解码器\n        self.dec = nn.Sequential(\n            nn.Linear(latent_dim, 256), nn.ReLU(),\n            nn.Linear(256, 512), nn.ReLU(),\n            nn.Linear(512, 784), nn.Sigmoid()\n        )\n\n    def encode(self, x):\n        h = self.enc(x.view(x.size(0), -1))\n        return self.fc_mu(h), self.fc_logvar(h)\n\n    def reparameterize(self, mu, logvar):\n        std = torch.exp(0.5 * logvar)\n        return mu + std * torch.randn_like(std)\n\n    def decode(self, z):\n        return self.dec(z)\n\n    def forward(self, x):\n        mu, logvar = self.encode(x)\n        z = self.reparameterize(mu, logvar)\n        return self.decode(z), mu, logvar\n\n    def loss(self, x_recon, x, mu, logvar):\n        recon = F.binary_cross_entropy(x_recon, x.view(x.size(0), -1),\n                                        reduction="sum")\n        kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())\n        return recon + kl`
                },
                {
                    lang: "python",
                    code: `# 训练 + 生成 + 潜空间插值\ndef train_and_generate():\n    # 数据\n    transform = torchvision.transforms.ToTensor()\n    train_ds = torchvision.datasets.MNIST("./data", train=True,\n                                          download=True, transform=transform)\n    loader = DataLoader(train_ds, batch_size=128, shuffle=True)\n    model = VAE(latent_dim=2)\n    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)\n    # 训练\n    for epoch in range(20):\n        model.train()\n        total_loss = 0\n        for x, _ in loader:\n            optimizer.zero_grad()\n            x_recon, mu, logvar = model(x)\n            loss = model.loss(x_recon, x, mu, logvar)\n            loss.backward()\n            optimizer.step()\n            total_loss += loss.item()\n        print(f"Epoch {epoch+1}: loss={total_loss/len(train_ds):.2f}")\n    # 从先验采样生成\n    model.eval()\n    with torch.no_grad():\n        z = torch.randn(16, 2)\n        gen = model.decode(z).view(-1, 1, 28, 28)\n    # 潜空间插值\n    z1 = torch.tensor([[2.0, -1.0]])  # 某个数字\n    z2 = torch.tensor([[-2.0, 1.0]])  # 另一个数字\n    alphas = torch.linspace(0, 1, 10).unsqueeze(1)\n    z_interp = z1 * (1 - alphas) + z2 * alphas\n    with torch.no_grad():\n        interp_imgs = model.decode(z_interp).view(-1, 1, 28, 28)\n    # 可视化\n    fig, axes = plt.subplots(1, 10, figsize=(15, 2))\n    for i, ax in enumerate(axes):\n        ax.imshow(interp_imgs[i].squeeze(), cmap="gray")\n        ax.axis("off")\n    plt.suptitle("Latent Space Interpolation")`
                }
            ],
            table: {
                headers: ["实验", "操作", "预期结果", "验证要点"],
                rows: [
                    ["随机生成", "z ~ N(0,I) -> 解码", "清晰可辨的数字", "不同 z 生成不同数字"],
                    ["潜空间插值", "z = alpha*z1 + (1-alpha)*z2", "数字平滑渐变", "无突变或跳变"],
                    ["潜空间网格", "遍历 z1, z2 网格", "按数字类别分区", "同类数字聚集"],
                    ["重构测试", "x -> encode -> decode", "接近原图", "保留关键特征"],
                    ["KL 散度检查", "训练过程中监控", "不趋近于 0", "避免 posterior collapse"]
                ]
            },
            mermaid: `graph TD\n    A["MNIST 数据集"] --> B["训练 VAE"]\n    B --> C["收敛: ~120 损失"]\n    C --> D["随机采样生成"]\n    C --> E["潜空间插值"]\n    C --> F["潜空间可视化"]\n    D --> G["生成新数字"]\n    E --> H["数字平滑渐变"]\n    F --> I["2D 潜空间图"]\n    style A fill:#4CAF50\n    style B fill:#2196F3\n    style C fill:#FF9800,color:#1e293b`,
            tip: "潜维度设为 2 虽然可视化方便，但会限制生成质量。实际应用中使用 32-128 维更合适。",
            warning: "MNIST 过于简单，VAE 实现正确后务必在更复杂的数据集（如 CIFAR-10、CelebA）上验证。"
        },
    ],
};
