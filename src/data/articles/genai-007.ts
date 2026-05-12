import { Article } from '../knowledge';

export const article: Article = {
    id: "genai-007",
    title: "图像生成（三）：Diffusion 与 GAN 对比",
    category: "genai",
    tags: ["生成模型", "对比", "VAE"],
    summary: "全面对比四大生成模型家族的原理、优劣与适用场景",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
  learningPath: {
    routeId: "diffusion-series",
    phase: 3,
    order: 3,
    nextStep: null,
    prevStep: "genai-002",
  },
    content: [
        {
            title: "1. 生成模型家族概览",
            body: `生成式 AI 的核心任务是学习数据分布 p_data(x) 并从中采样。四大主流模型家族选择了截然不同的路径：VAE 通过变分推断在隐空间建模，引入 KL 散度正则化保证隐变量分布接近标准正态；GAN 以博弈论为基底，生成器与判别器在 min-max 框架下对抗演化；Diffusion 将生成过程分解为 T 步逐步去噪，将复杂分布学习转化为简单的噪声预测回归；Normalizing Flow 则构建一系列可逆变换，通过精确的雅可比行列式计算实现精确似然估计。它们本质上都在回答同一个问题：如何让模型从噪声中"变"出有意义的数据，但数学工具和优化策略完全不同。理解这些差异是选型的第一步。`,
            code: [
                {
                    lang: "python",
                    code: `# 四大生成模型统一抽象框架\nimport torch\nimport torch.nn as nn\n\nclass GenerativeModel(nn.Module):\n    def __init__(self, name, latent_dim=64):\n        super().__init__()\n        self.name = name\n        self.latent_dim = latent_dim\n\n    def sample_latent(self, n):\n        return torch.randn(n, self.latent_dim)\n\n    def generate(self, n):\n        z = self.sample_latent(n)\n        return self.decode(z)\n\n    def forward(self, x):\n        raise NotImplementedError\n\n# VAE: encode -> latent -> decode\n# GAN: noise -> generate (对抗训练)\n# Diffusion: x_t -> predict noise -> x_{t-1} (迭代)\n# Flow: x -> z (可逆变换, 精确似然)`
                },
                {
                    lang: "python",
                    code: `# 模型训练循环骨架对比\nimport torch\n\ndef train_vae(model, x, optimizer):\n    x_recon, mu, logvar = model(x)\n    loss = recon_loss(x_recon, x) + kl_loss(mu, logvar)\n    loss.backward()\n    return loss\n\ndef train_gan(gen, disc, x, g_opt, d_opt):\n    # 判别器训练\n    d_real = disc(x); d_fake = disc(gen(noise).detach())\n    d_loss = bce(d_real, 1) + bce(d_fake, 0)\n    d_opt.zero_grad(); d_loss.backward(); d_opt.step()\n    # 生成器训练\n    g_loss = bce(disc(gen(noise)), 1)\n    g_opt.zero_grad(); g_loss.backward(); g_opt.step()\n    return g_loss, d_loss`
                }
            ],
            table: {
                headers: ["模型", "数学基础", "似然估计", "隐空间结构", "训练范式"],
                rows: [
                    ["VAE", "变分推断", "ELBO 下界", "概率分布", "最大似然"],
                    ["GAN", "博弈论", "不可行", "隐式流形", "对抗优化"],
                    ["Diffusion", "非平衡热力学", "可行(ELBO)", "渐进轨迹", "噪声预测"],
                    ["Flow", "变量变换公式", "精确似然", "双射映射", "最大似然"]
                ]
            },
            mermaid: `graph TD
    A["学习目标: p_data(x)"] --> B["VAE"]
    A --> C["GAN"]
    A --> D["Diffusion"]
    A --> E["Flow"]
    B --> B1["变分下界 ELBO"]
    C --> C1["对抗博弈 min-max"]
    D --> D1["逐步去噪"]
    E --> E1["可逆变换 det(J)"]`,
            tip: "入门建议先掌握 VAE 的变分推断思想，它是理解后续 Diffusion 的 ELBO 推导的基础。",
            warning: "不要孤立学习某个模型，横向对比才能理解各自的设计动机和妥协。"
        },
        {
            title: "2. VAE 变分推断详解",
            body: `VAE 的核心困境在于后验分布 p(z|x) 的积分不可计算。Kingma 和 Welling 提出的解决方案是用可学习的变分分布 q_phi(z|x) 来近似真实后验，通过最大化证据下界 ELBO 来联合优化编码器和解码器。ELBO 由两项组成：重构损失要求解码器能还原输入，KL 散度要求编码器的输出分布接近标准正态 N(0, I)。重参数化技巧（Reparameterization Trick）是关键突破：将随机采样从 q_phi(z|x) 中剥离为确定性的 mu + sigma * epsilon，其中 epsilon 来自标准正态分布，使得梯度可以反向传播通过随机节点。这一技巧将不可微的采样操作转化为可微的仿射变换，是整个 VAE 能端到端训练的根本原因。VAE 的劣势在于 KL 正则化强制隐空间平滑，导致生成样本往往偏模糊，但换来的是训练极其稳定和隐空间的良好插值性质。`,
            code: [
                {
                    lang: "python",
                    code: `# VAE 完整实现\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass VAE(nn.Module):\n    def __init__(self, img_dim=784, hidden=400, latent=20):\n        super().__init__()\n        self.fc1 = nn.Linear(img_dim, hidden)\n        self.fc_mu = nn.Linear(hidden, latent)\n        self.fc_logvar = nn.Linear(hidden, latent)\n        self.fc3 = nn.Linear(latent, hidden)\n        self.fc4 = nn.Linear(hidden, img_dim)\n\n    def encode(self, x):\n        h = F.relu(self.fc1(x))\n        return self.fc_mu(h), self.fc_logvar(h)\n\n    def reparameterize(self, mu, logvar):\n        std = torch.exp(0.5 * logvar)\n        eps = torch.randn_like(std)\n        return mu + eps * std\n\n    def decode(self, z):\n        h = F.relu(self.fc3(z))\n        return torch.sigmoid(self.fc4(h))\n\n    def forward(self, x):\n        mu, logvar = self.encode(x.view(-1, 784))\n        z = self.reparameterize(mu, logvar)\n        return self.decode(z), mu, logvar\n\ndef loss_fn(recon, x, mu, logvar):\n    recon_loss = F.binary_cross_entropy(recon, x.view(-1, 784), reduction="sum")\n    kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())\n    return recon_loss + kl`
                },
                {
                    lang: "python",
                    code: `# VAE 隐空间可视化与插值\nimport numpy as np\nimport matplotlib.pyplot as plt\n\ndef interpolate_vae(vae, z1, z2, n_steps=10):\n    """在隐空间中线性插值并解码"""\n    alphas = np.linspace(0, 1, n_steps)\n    images = []\n    for alpha in alphas:\n        z = (1 - alpha) * z1 + alpha * z2\n        with torch.no_grad():\n            img = vae.decode(z)\n        images.append(img.view(28, 28).numpy())\n    fig, axes = plt.subplots(1, n_steps, figsize=(15, 2))\n    for i, img in enumerate(images):\n        axes[i].imshow(img, cmap="gray")\n        axes[i].axis("off")\n    return fig\n\n# 分析 KL 散度与重构损失的权衡\nbeta_values = [0.1, 0.5, 1.0, 2.0, 5.0]\nfor beta in beta_values:\n    # beta-VAE: 调整 KL 权重控制隐空间解纠缠程度\n    loss = recon_loss + beta * kl_loss`
                }
            ],
            table: {
                headers: ["特性", "标准 VAE", "beta-VAE", "VQ-VAE"],
                rows: [
                    ["隐变量类型", "连续高斯", "连续高斯", "离散码本"],
                    ["KL 权重", "1.0", "可调 beta > 1", "无 KL"],
                    ["解纠缠能力", "弱", "强", "中等"],
                    ["生成质量", "模糊", "可控", "较高"],
                    ["典型应用", "基础生成", "表示学习", "图像生成"]
                ]
            },
            mermaid: `graph LR
    A["输入 x"] --> B["编码器 q(z|x)"]
    B --> C["mu, logvar"]
    C --> D["重参数化 z = mu + sigma * eps"]
    D --> E["解码器 p(x|z)"]
    E --> F["重构 x_hat"]
    F --> G["ELBO = 重构 - KL"]`,
            tip: "尝试 beta-VAE（增大 KL 权重）可以获得更好的解纠缠隐空间，对可控生成很有帮助。",
            warning: "VAE 的 KL 坍缩（KL 趋近于零）是常见问题，需确保网络容量平衡和适当的学习率。"
        },
        {
            title: "3. GAN 对抗训练详解",
            body: `GAN 由 Goodfellow 于 2014 年提出，其优雅之处在于将生成分解为两个神经网络的博弈：生成器 G 试图制造以假乱真的样本，判别器 D 试图区分真假。理论上当达到纳什均衡时，G 的输出分布将完美匹配真实数据分布。然而这一理论保证在实践中极难实现。GAN 的训练不稳定性源于 min-max 优化的非凸非凹特性，以及 Jensen-Shannon 散度在分布不重叠时梯度消失的问题。Wasserstein GAN（WGAN）通过引入 Earth Mover 距离和权重裁剪（后改进为梯度惩罚 WGAN-GP）显著缓解了模式崩溃和梯度消失。DCGAN 引入卷积架构使得 GAN 能高效处理图像数据。StyleGAN 系列通过自适应实例归一化和风格混合实现了前所未有的图像质量和可控性。GAN 的核心优势在于能生成极其锐利的样本，但其训练过程更像一门艺术而非科学，需要大量调参经验。`,
            code: [
                {
                    lang: "python",
                    code: `# WGAN-GP 实现\nimport torch\nimport torch.autograd as autograd\n\nclass WGAN_GP:\n    def __init__(self, gen, disc, g_opt, d_opt, lambda_gp=10):\n        self.gen = gen\n        self.disc = disc\n        self.g_opt = g_opt\n        self.d_opt = d_opt\n        self.lambda_gp = lambda_gp\n\n    def gradient_penalty(self, real, fake):\n        alpha = torch.rand(real.size(0), 1, 1, 1).to(real.device)\n        interpolates = (alpha * real + (1 - alpha) * fake).requires_grad_(True)\n        d_interpolates = self.disc(interpolates)\n        gradients = autograd.grad(\n            outputs=d_interpolates, inputs=interpolates,\n            grad_outputs=torch.ones_like(d_interpolates),\n            create_graph=True, retain_graph=True)[0]\n        gp = ((gradients.norm(2, dim=1) - 1) ** 2).mean()\n        return gp\n\n    def train_disc(self, real, z):\n        fake = self.gen(z).detach()\n        d_real = self.disc(real).mean()\n        d_fake = self.disc(fake).mean()\n        gp = self.gradient_penalty(real, fake)\n        loss = d_fake - d_real + self.lambda_gp * gp\n        self.d_opt.zero_grad()\n        loss.backward()\n        self.d_opt.step()\n        return loss`
                },
                {
                    lang: "python",
                    code: `# 评估 GAN 生成质量：FID 和 IS\nfrom cleanfid import fid\nimport numpy as np\n\ndef compute_fid(real_path, fake_path):\n    """Frechet Inception Distance: 越低越好\"\"\"\n    score = fid.compute_fid(real_path, fake_path)\n    return score\n\ndef compute_inception_score(images, splits=10):\n    """Inception Score: 越高越好，衡量质量和多样性\"\"\"\n    import torchvision\n    model = torchvision.models.inception_v3(weights=\"DEFAULT\")\n    model.eval()\n    preds = []\n    with torch.no_grad():\n        for img in images:\n            pred = model(img.unsqueeze(0))\n            preds.append(torch.softmax(pred, dim=1).cpu().numpy())\n    preds = np.array(preds)\n    # p(y|x) 熵小（质量好），p(y) 熵大（多样性好）\n    kl = preds * (np.log(preds) - np.log(np.mean(preds, axis=0)))\n    return np.exp(np.mean(kl))`
                }
            ],
            table: {
                headers: ["GAN 变体", "损失函数", "解决的核心问题", "代表工作"],
                rows: [
                    ["原始 GAN", "JS 散度", "概念证明", "Goodfellow 2014"],
                    ["DCGAN", "JS 散度 + CNN", "图像生成效率", "Radford 2016"],
                    ["WGAN", "Earth Mover 距离", "梯度消失", "Arjovsky 2017"],
                    ["WGAN-GP", "EM + 梯度惩罚", "权重裁剪限制", "Gulrajani 2017"],
                    ["StyleGAN", "自适应风格注入", "细粒度可控性", "Karras 2019"]
                ]
            },
            mermaid: `graph TD
    A["随机噪声 z"] --> B["生成器 G"]
    B --> C["假样本 G(z)"]
    D["真实数据 x"] --> E["判别器 D"]
    C --> E
    E --> F["真/假判断"]
    F -->|"梯度"| G["更新 D"]
    F -->|"梯度"| H["更新 G"]
    G --> E
    H --> B`,
            tip: "WGAN-GP 是目前最稳定的 GAN 训练范式，建议作为 GAN 入门首选。",
            warning: "GAN 训练需要仔细监控判别器损失，判别器过强会导致生成器梯度消失。"
        },
        {
            title: "4. Diffusion 逐步去噪详解",
            body: `扩散模型的核心思想借鉴了非平衡热力学：先定义一个固定的前向加噪过程 q(x_t | x_{t-1}) 将数据逐步破坏为纯噪声，然后训练一个神经网络来学习逆向去噪过程 p(x_{t-1} | x_t)。DDPM 的关键突破是证明了逆向过程的均值和方差都有解析形式，网络只需预测添加的噪声 epsilon 即可。训练目标简化为预测噪声的 MSE 回归，异常简洁。采样时从纯高斯噪声出发，通过 T 步迭代去噪逐步恢复出清晰样本。虽然采样速度慢，但生成质量远超 VAE，训练稳定性远超 GAN。后续改进包括 DDIM（确定性采样加速）、Classifier Guidance（用预训练分类器引导生成）、Classifier-Free Guidance（无需额外分类器）和 Latent Diffusion（在压缩隐空间中扩散，大幅降低计算量）。Stable Diffusion 正是 Latent Diffusion 的代表作，它将扩散过程从像素空间转移到 VAE 压缩后的隐空间，使得在单卡上训练高质量扩散模型成为可能。`,
            code: [
                {
                    lang: "python",
                    code: `# DDPM 训练与采样核心\nimport torch\nimport torch.nn as nn\n\nclass DDPM:\n    def __init__(self, model, T=1000):\n        self.model = model  # 噪声预测网络\n        self.T = T\n        self.betas = torch.linspace(1e-4, 0.02, T)\n        self.alphas = 1.0 - self.betas\n        self.alpha_bars = torch.cumprod(self.alphas, dim=0)\n\n    def train_step(self, x_0, optimizer):\n        t = torch.randint(0, self.T, (x_0.size(0),))\n        noise = torch.randn_like(x_0)\n        alpha_bar = self.alpha_bars[t][:, None, None, None]\n        x_t = torch.sqrt(alpha_bar) * x_0 + torch.sqrt(1 - alpha_bar) * noise\n        noise_pred = self.model(x_t, t)\n        loss = nn.functional.mse_loss(noise_pred, noise)\n        optimizer.zero_grad()\n        loss.backward()\n        optimizer.step()\n        return loss\n\n    @torch.no_grad()\n    def sample(self, shape, device):\n        x = torch.randn(shape, device=device)\n        for t in reversed(range(self.T)):\n            z = torch.randn_like(x) if t > 0 else 0\n            noise_pred = self.model(x, torch.tensor([t], device=device))\n            alpha = self.alphas[t]\n            alpha_bar = self.alpha_bars[t]\n            beta = self.betas[t]\n            x = (1 / torch.sqrt(alpha)) * (\n                x - ((1 - alpha) / torch.sqrt(1 - alpha_bar)) * noise_pred\n            ) + torch.sqrt(beta) * z\n        return x`
                },
                {
                    lang: "python",
                    code: `# DDIM 加速采样（确定性，可跳过步数）\n@torch.no_grad()\ndef ddim_sample(model, shape, T=1000, skip_steps=10):\n    """DDIM: 从 T 步加速到 T/skip_steps 步\"\"\"\n    alphas_bar = compute_alpha_bars(T)\n    seq = range(0, T, skip_steps)\n    seq_next = [-1] + list(seq[:-1])\n    x = torch.randn(shape)\n    for i, j in zip(reversed(seq), reversed(seq_next)):\n        t = torch.full((shape[0],), i, dtype=torch.long)\n        noise_pred = model(x, t)\n        alpha_bar_next = alphas_bar[j] if j >= 0 else torch.zeros_like(alphas_bar[0])\n        alpha_bar_t = alphas_bar[i]\n        x_0_pred = (x - torch.sqrt(1 - alpha_bar_t) * noise_pred) / torch.sqrt(alpha_bar_t)\n        c1 = torch.sqrt(alpha_bar_next)\n        c2 = torch.sqrt(1 - alpha_bar_next - (1 - alpha_bar_t))\n        x = c1 * x_0_pred + c2 * noise_pred\n    return x\n\n# 对比：DDPM 需要 1000 步，DDIM 只需 50-100 步即可获得相近质量`
                }
            ],
            table: {
                headers: ["方法", "采样步数", "FID(CIFAR-10)", "采样方式", "核心创新"],
                rows: [
                    ["DDPM", "1000", "3.17", "随机 Markov", "噪声预测 MSE"],
                    ["DDIM", "20-100", "4.0-3.5", "确定性 ODE", "非 Markov 逆向"],
                    ["DPM-Solver", "10-25", "3.2-2.9", "ODE 求解器", "高阶数值积分"],
                    ["LCM", "1-4", "3.5-4.0", "一致性蒸馏", "单步蒸馏生成"],
                    ["Stable Diffusion", "20-50", "N/A", "隐空间扩散", "VAE 压缩 + CLIP"]
                ]
            },
            mermaid: `graph LR
    A["纯噪声 x_T"] -->|"去噪 t"| B["x_{T-1}"]
    B -->|"去噪 t-1"| C["x_{T-2}"]
    C -->|"..."| D["..."]
    D -->|"去噪 2"| E["x_1"]
    E -->|"去噪 1"| F["清晰样本 x_0"]
    G["噪声预测网络 epsilon_theta"] -.-> B
    G -.-> C
    G -.-> E`,
            tip: "实际部署时优先使用 DDIM 或 LCM 加速采样，50 步以内即可获得优质结果。",
            warning: "DDPM 默认 1000 步采样在推理时极慢，必须使用加速方法才能投入生产。"
        },
        {
            title: "5. Normalizing Flow 可逆变换详解",
            body: `Normalizing Flow 是唯一能提供精确似然估计的生成模型，其核心是变量变换公式：p_X(x) = p_Z(f(x)) * |det(df/dx)|。通过构建一系列可逆变换 f = f_K o ... o f_1，将简单先验分布（通常是标准正态）映射到复杂数据分布。每一层变换必须满足两个条件：可逆性（保证双向映射）和雅可比行列式易于计算（保证似然可算）。RealNVP 使用仿射耦合层，将输入分为两部分，一部分直接传递，另一部分通过缩放和平移变换，雅可比行列式为三角矩阵的行列式等于对角线元素之积，计算复杂度为 O(1)。Glow 在此基础上引入可逆 1x1 卷积，增加模型表达能力。FFJORD 使用常微分方程（ODE）视角，将离散层变换推广为连续动力学，雅可比行列式的对数迹通过 Hutchinson 估计器无偏估计。Flow 模型的优势在于精确似然、精确隐变量推断和可逆采样，但受限于可逆性约束，模型表达能力不如 VAE 和 Diffusion 灵活，且在高维数据上雅可比计算仍是瓶颈。`,
            code: [
                {
                    lang: "python",
                    code: `# RealNVP 仿射耦合层\nimport torch\nimport torch.nn as nn\n\nclass AffineCoupling(nn.Module):\n    def __init__(self, n_split, n_hidden=64):\n        super().__init__()\n        self.n_split = n_split\n        self.nn = nn.Sequential(\n            nn.Linear(n_split, n_hidden),\n            nn.ReLU(),\n            nn.Linear(n_hidden, n_hidden),\n            nn.ReLU(),\n            nn.Linear(n_hidden, 2 * n_split)  # s 和 t\n        )\n\n    def forward(self, x, log_det=None):\n        x1, x2 = x[:, :self.n_split], x[:, self.n_split:]\n        st = self.nn(x1)\n        s, t = st.chunk(2, dim=-1)\n        s = torch.tanh(s)  # 数值稳定\n        y2 = x2 * torch.exp(s) + t\n        y = torch.cat([x1, y2], dim=-1)\n        log_det_jac = s.sum(dim=-1) if log_det is None else log_det + s.sum(dim=-1)\n        return y, log_det_jac\n\n    def inverse(self, y, log_det=None):\n        y1, y2 = y[:, :self.n_split], y[:, self.n_split:]\n        st = self.nn(y1)\n        s, t = st.chunk(2, dim=-1)\n        s = torch.tanh(s)\n        x2 = (y2 - t) * torch.exp(-s)\n        x = torch.cat([y1, x2], dim=-1)\n        log_det_jac = -s.sum(dim=-1) if log_det is None else log_det - s.sum(dim=-1)\n        return x, log_det_jac`
                },
                {
                    lang: "python",
                    code: `# Flow 模型训练循环\nimport torch\nimport torch.nn as nn\n\nclass NormalizingFlow(nn.Module):\n    def __init__(self, n_layers, dim, n_hidden=64):\n        super().__init__()\n        self.layers = nn.ModuleList([\n            AffineCoupling(dim // 2, n_hidden) for _ in range(n_layers)\n        ])\n        self.prior = torch.distributions.Normal(0, 1)\n\n    def forward(self, x):\n        log_det = torch.zeros(x.size(0), device=x.device)\n        z = x\n        for layer in self.layers:\n            z, log_det = layer(z, log_det)\n        # 交换分割位置以增加表达能力\n            z = torch.cat([z[:, dim//2:], z[:, :dim//2]], dim=-1)\n        log_pz = self.prior.log_prob(z).sum(dim=-1)\n        log_px = log_pz + log_det\n        return -log_px.mean()  # 负对数似然\n\n# 训练：直接最小化负对数似然\n# 无需对抗，无需变分下界，纯粹的 MLE\nmodel = NormalizingFlow(n_layers=8, dim=64)\noptimizer = torch.optim.Adam(model.parameters(), lr=1e-3)\nfor x in dataloader:\n    loss = model(x)\n    loss.backward()\n    optimizer.step()`
                }
            ],
            table: {
                headers: ["Flow 变体", "可逆层设计", "雅可比计算", "表达能力", "适用场景"],
                rows: [
                    ["RealNVP", "仿射耦合", "O(1) 三角矩阵", "中等", "低维密度估计"],
                    ["Glow", "可逆 1x1 卷积", "O(1) 对数行列式", "较高", "图像生成"],
                    ["FFJORD", "ODE 连续变换", "Hutchinson 估计", "高", "精确似然"],
                    ["Residual Flow", "残差 + Lipschitz", "幂级数展开", "较高", "理论分析"],
                    ["Continuous Normalizing Flow", "神经 ODE", "数值积分", "高", "动态建模"]
                ]
            },
            mermaid: `graph LR
    A["简单分布 p(z)"] -->|"f_1 可逆变换"| B["z_1"]
    B -->|"f_2 可逆变换"| C["z_2"]
    C -->|"..."| D["z_K"]
    D -->|"f_K 可逆变换"| E["复杂分布 p(x)"]
    E -->|"|det(df/dx)|"| F["精确似然"]`,
            tip: "Flow 适合需要精确似然评估的场景（如异常检测），不追求极致生成质量时是最佳选择。",
            warning: "Flow 的可逆性约束严重限制了模型架构选择，无法直接使用标准卷积和池化层。"
        },
        {
            title: "6. 全面对比：质量、多样性、速度与稳定性",
            body: `从生成质量看，Diffusion（尤其是 Latent Diffusion）目前处于统治地位，Stable Diffusion 和 DALL-E 系列在各类基准上均大幅领先。GAN 的 StyleGAN3 在人脸和特定领域仍能产生媲美甚至超越 Diffusion 的锐利结果。VAE 生成样本质量最低，但通过 VQ-VAE-2 等离散隐变量方案可显著提升。Flow 的精确似然不代表高感知质量，其生成样本往往不如 Diffusion 自然。从多样性看，Diffusion 最佳，VAE 次之（隐空间连续性保证），GAN 最差（模式崩溃倾向）。从采样速度看，VAE 和 Flow 为单步前向传播，GAN 也是单步生成，而 Diffusion 需要数十至上百步迭代（加速后可压缩到 1-50 步）。从训练稳定性看，VAE 和 Diffusion 基于简单的 MSE/ELBO 目标，训练稳定可复现；GAN 的对抗优化仍是最大挑战；Flow 训练稳定但容易遇到数值问题。从内存和计算看，Diffusion 最大（多步迭代），Flow 次之（多层可逆变换），VAE 和 GAN 最小。`,
            code: [
                {
                    lang: "python",
                    code: `# 四大模型量化对比实验\nimport pandas as pd\n\n# 基于 CIFAR-10 基准的综合评分（0-10 分）\ncomparison = pd.DataFrame({\n    "模型": ["VAE", "GAN (StyleGAN)", "Diffusion (DDPM)", "Flow (Glow)"],\n    "生成质量": [5, 9, 10, 7],\n    "样本多样性": [7, 5, 10, 7],\n    "训练稳定性": [9, 4, 9, 7],\n    "采样速度": [10, 9, 3, 8],\n    "似然估计": [6, 0, 7, 10],\n    "实现难度": [3, 7, 5, 6],\n    "显存占用": [2, 3, 9, 4],\n    "工业成熟度": [6, 7, 10, 4]\n}).set_index("模型")\n\n# 加权综合评分（根据任务需求调整权重）\nweights = {"生成质量": 0.25, "训练稳定性": 0.2, "采样速度": 0.15,\n           "多样性": 0.15, "似然估计": 0.1, "实现难度": 0.1, "工业成熟度": 0.05}\nscores = {}\nfor model in comparison.index:\n    scores[model] = sum(comparison.loc[model, k] * v for k, v in weights.items())\nprint(sorted(scores.items(), key=lambda x: -x[1]))`
                },
                {
                    lang: "python",
                    code: `# 实际部署延迟测试\nimport time\nimport torch\n\ndef benchmark_generation(model, sample_func, n_samples=100, batch_size=16):\n    """对比不同模型的生成延迟\"\"\"\n    times = []\n    n_batches = n_samples // batch_size\n    with torch.no_grad():\n        for _ in range(n_batches):\n            start = time.perf_counter()\n            samples = sample_func(batch_size)\n            elapsed = time.perf_counter() - start\n            times.append(elapsed)\n    avg_ms = (sum(times) / len(times)) * 1000\n    p99_ms = sorted(times)[int(0.99 * len(times))] * 1000\n    return {"avg_ms": avg_ms, "p99_ms": p99_ms, "throughput": batch_size / (sum(times)/len(times))}\n\n# 典型结果（A100 GPU, 256x256 图像）\n# VAE: ~2ms/张 (单步解码)\n# GAN: ~5ms/张 (单步生成)\n# Diffusion (DDPM, 1000步): ~500ms/张\n# Diffusion (DDIM, 50步): ~25ms/张\n# Flow (Glow, 32层): ~15ms/张`
                }
            ],
            table: {
                headers: ["维度", "VAE", "GAN", "Diffusion", "Flow"],
                rows: [
                    ["生成质量", "中 (模糊)", "高 (锐利)", "极高", "中高"],
                    ["多样性", "中高", "低 (模式崩溃)", "极高", "中"],
                    ["训练稳定性", "极高", "低", "高", "中高"],
                    ["采样速度", "极快 (单步)", "快 (单步)", "慢 (多步迭代)", "快 (单步)"],
                    ["精确似然", "下界", "无", "ELBO 下界", "精确"],
                    ["显存需求", "低", "中", "高", "中"],
                    ["工业应用", "较少", "广泛", "主流", "小众"]
                ]
            },
            mermaid: `graph TD
    A["任务需求分析"] --> B{需要精确似然?}
    B -->|"是"| C["Flow"]
    B -->|"否"| D{需要极致质量?}
    D -->|"是"| E["Diffusion"]
    D -->|"否"| F{需要实时推理?}
    F -->|"是"| G["VAE / GAN"]
    F -->|"否"| E
    G --> H{训练资源充足?}
    H -->|"是"| I["GAN (StyleGAN)"]
    H -->|"否"| J["VAE"]`,
            tip: "大多数实际场景中，Diffusion + DDIM 加速（50 步）在质量和速度之间取得了最佳平衡。",
            warning: "对比指标高度依赖任务和超参配置，表格数据基于典型设置，实际需求可能有差异。"
        },
        {
            title: "7. 选型指南与实战建议",
            body: `选择生成模型没有绝对的最优解，只有最适合当前任务的方案。对于需要精确似然估计的任务（异常检测、密度估计），Flow 是唯一选择。对于追求极致生成质量且可以接受较慢推理的应用（图像编辑、艺术创作），Diffusion 是首选，配合 DDIM 或 LCM 加速可以将采样步数压缩到可接受范围。对于需要实时生成的场景（视频游戏、交互式应用），GAN 或 VAE 的单步生成能力不可替代，StyleGAN 在特定领域（人脸、特定物体类别）依然保持着质量优势。对于需要隐空间可控插值和表征学习的场景，VAE 的解纠缠隐空间是最自然的工具。实际工程中，混合方案越来越流行：Stable Diffusion 本质上是 VAE（压缩） + Diffusion（生成）的组合，VQ-GAN 结合了 VQ-VAE 的离散编码和 **Transformer** 的自回归生成。理解每种模型的本质优势和局限，根据任务需求灵活组合，才是生成模型实战的正确姿势。`,
            code: [
                {
                    lang: "python",
                    code: `# 混合架构：VAE + Diffusion（Stable Diffusion 思路）\nimport torch\nimport torch.nn as nn\n\nclass HybridVAE_Diffusion(nn.Module):\n    def __init__(self, in_channels=3, latent_channels=4, hidden=256):\n        super().__init__()\n        # VAE 编码器：压缩到高维隐空间\n        self.encoder = nn.Sequential(\n            nn.Conv2d(in_channels, 64, 4, stride=2, padding=1),\n            nn.Conv2d(64, 128, 4, stride=2, padding=1),\n            nn.Conv2d(128, latent_channels, 3, padding=1),\n        )\n        # 扩散模型：在隐空间中操作\n        self.denoiser = nn.Sequential(\n            nn.Conv2d(latent_channels * 2, hidden, 3, padding=1),\n            nn.GroupNorm(8, hidden),\n            nn.SiLU(),\n            nn.Conv2d(hidden, hidden, 3, padding=1),\n            nn.Conv2d(hidden, latent_channels, 3, padding=1),\n        )\n        # VAE 解码器\n        self.decoder = nn.Sequential(\n            nn.ConvTranspose2d(latent_channels, 128, 4, stride=2, padding=1),\n            nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1),\n            nn.Conv2d(64, in_channels, 3, padding=1),\n        )\n\n    def encode(self, x):\n        return self.encoder(x)\n\n    def predict_noise(self, z_t, t):\n        return self.denoiser(torch.cat([z_t, t], dim=1))\n\n    def decode(self, z):\n        return self.decoder(z)`
                },
                {
                    lang: "python",
                    code: `# 模型选型决策树代码实现\ndef select_generative_model(requirements):\n    """根据需求自动推荐生成模型\"\"\"\n    recommendations = []\n    \n    if requirements.get("exact_likelihood", False):\n        recommendations.append(("Flow", "精确似然评估是唯一选择"))\n    \n    if requirements.get("real_time_inference", False):\n        if requirements.get("domain") in ["faces", "specific_objects"]:\n            recommendations.append(("GAN", "StyleGAN 在特定领域质量最优"))\n        else:\n            recommendations.append(("VAE", "通用场景下单步生成最可靠"))\n    \n    if requirements.get("max_quality", False) and not requirements.get("real_time_inference", False):\n        recommendations.append(("Diffusion", "当前最高生成质量"))\n    \n    if requirements.get("controllable_generation", False):\n        recommendations.append(("VAE", "解纠缠隐空间最适合可控生成"))\n        recommendations.append(("Diffusion+CFG", "Classifier-Free Guidance 支持文本引导"))\n    \n    if not recommendations:\n        recommendations.append(("Diffusion", "通用默认选择"))\n    \n    return recommendations\n\n# 使用示例\nreqs = {"max_quality": True, "real_time_inference": False, "exact_likelihood": False}\nprint(select_generative_model(reqs))`
                }
            ],
            table: {
                headers: ["应用场景", "首选模型", "次选模型", "关键考量"],
                rows: [
                    ["图像生成（高质量）", "Diffusion", "GAN", "FID 分数和感知质量"],
                    ["实时图像合成", "GAN", "VAE", "推理延迟 < 10ms"],
                    ["异常检测", "Flow", "VAE", "精确似然评估"],
                    ["可控编辑", "Diffusion+CFG", "VAE", "条件引导能力"],
                    ["视频生成", "Diffusion", "GAN", "时序一致性"],
                    ["3D 生成", "Diffusion", "Flow", "多视角一致性"],
                    ["数据增强", "VAE", "GAN", "多样性和速度"],
                    ["文本到图像", "Diffusion", "GAN", "跨模态对齐"]
                ]
            },
            mermaid: `graph TD
    A["开始选型"] --> B{"需要精确似然?"}
    B -->|"是"| C["Normalizing Flow"]
    B -->|"否"| D{"需要实时推理?"}
    D -->|"是"| E{"特定领域人脸/物体?"}
    E -->|"是"| F["GAN (StyleGAN)"]
    E -->|"否"| G["VAE"]
    D -->|"否"| H{"需要文本/条件引导?"}
    H -->|"是"| I["Diffusion + CFG"]
    H -->|"否"| J{"追求最高质量?"}
    J -->|"是"| K["Diffusion (DDIM 加速)"]
    J -->|"否"| L["VAE 或 GAN"]`,
            tip: "实际项目中可以先从预训练 Diffusion 模型微调开始，这通常是最快达到可用质量的路径。",
            warning: "不要为了追求新颖性而选择 Flow 或 GAN，除非你的任务明确要求精确似然或实时推理。"
        },
    ],
};
