import { Article } from '../knowledge';

export const article: Article = {
    id: "genai-001",
    title: "扩散模型 Diffusion 详解",
    category: "genai",
    tags: ["扩散模型", "DDPM", "生成模型"],
    summary: "从加噪到去噪，理解扩散模型如何一步步生成高质量图像",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. 生成模型家族对比",
            body: `在生成式 AI 领域，三大主流模型家族各有千秋。VAE 通过变分推断学习数据的隐空间表示，训练稳定但生成样本偏模糊；GAN 利用生成器与判别器的对抗博弈产生锐利图像，却面临模式崩溃和训练不稳定的难题；扩散模型（Diffusion）则以渐进式加噪与去噪为核心，兼具训练稳定性和生成质量。扩散模型之所以在 2021 年后迅速崛起，关键在于其目标函数简洁可微，避免了 GAN 的 min-max 对抗优化，同时采样质量超越了 VAE。三者本质上都在学习数据分布 p_data(x) 的近似，但路径截然不同：VAE 走隐变量概率推断之路，GAN 走对抗博弈之路，而 Diffusion 走非平衡热力学之路。`,
            code: [
                {
                    lang: "python",
                    code: `# 三大生成模型目标函数对比\nimport torch\n\n# VAE: ELBO 最大化 (重构 + KL 散度)\ndef vae_loss(x_recon, x, mu, logvar):\n    recon = torch.nn.functional.mse_loss(x_recon, x)\n    kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())\n    return recon + kl\n\n# GAN: 对抗损失\ndef gan_loss(real_pred, fake_pred):\n    real_loss = torch.nn.functional.binary_cross_entropy_with_logits(\n        real_pred, torch.ones_like(real_pred))\n    fake_loss = torch.nn.functional.binary_cross_entropy_with_logits(\n        fake_pred, torch.zeros_like(fake_pred))\n    return real_loss, fake_loss`
                },
                {
                    lang: "python",
                    code: `# 模型特性快速对比实验\nimport matplotlib.pyplot as plt\n\nmodels = ["VAE", "GAN", "Diffusion"]\nquality = [6.5, 9.0, 9.5]       # FID 得分（越低越好，此处反向展示）\nstability = [9.0, 4.0, 8.5]     # 训练稳定性\ndiversity = [7.0, 5.0, 9.0]     # 样本多样性\nspeed = [9.0, 8.0, 3.0]        # 采样速度\n\nx = range(len(models))\nfig, ax = plt.subplots(figsize=(8, 5))\nax.bar(x, quality, width=0.2, label="生成质量")\nax.bar([i+0.2 for i in x], stability, width=0.2, label="训练稳定性")\nax.bar([i+0.4 for i in x], diversity, width=0.2, label="多样性")\nax.set_xticks([i+0.2 for i in x])\nax.set_xticklabels(models)`
                }
            ],
            table: {
                headers: ["特性", "VAE", "GAN", "Diffusion"],
                rows: [
                    ["训练目标", "ELBO", "对抗博弈", "噪声预测 MSE"],
                    ["样本质量", "中等", "高", "极高"],
                    ["训练稳定性", "高", "低", "高"],
                    ["采样速度", "快", "快", "慢"],
                    ["模式崩溃", "不会", "会", "不会"],
                    ["似然估计", "下界", "不可行", "可行"]
                ]
            },
            mermaid: `graph LR\n    A["数据分布 p_data"] --> B["VAE: 隐变量编码"]\n    A --> C["GAN: 对抗训练"]\n    A --> D["Diffusion: 渐进加噪"]\n    B --> E["模糊但稳定"]\n    C --> F["锐利但不稳定"]\n    D --> G["高质量且稳定"]`,
            tip: "选择模型时，追求极致生成质量选 Diffusion，追求实时推理速度选 VAE 或 GAN。",
            warning: "扩散模型采样慢是硬伤，后续章节会介绍加速方法。"
        },
        {
            title: "2. 前向扩散过程",
            body: `前向扩散过程（Forward Process）是整个扩散模型的基石。其核心思想非常简单：给定一张清晰图像 x_0，我们逐步向其中注入高斯噪声，经过 T 步后，图像变成纯高斯噪声 x_T。每一步加噪都遵循马尔可夫链，即 x_t 只依赖于 x_{t-1}。具体地，q(x_t | x_{t-1}) = N(x_t; sqrt(1 - beta_t) * x_{t-1}, beta_t * I)，其中 beta_t 是预设的方差调度（variance schedule），通常从 10^-4 线性增长到 0.02。关键洞察在于，借助高斯分布的可加性，我们可以直接计算从 x_0 到任意 x_t 的闭式表达，无需逐步迭代。这一性质使得训练时可以直接从任意时间步 t 采样，极大地提升了训练效率。方差调度 beta_t 的选择至关重要，过小则噪声不足，过大则信息丢失过快。`,
            code: [
                {
                    lang: "python",
                    code: `# 前向扩散过程实现\nimport torch\nimport torch.nn as nn\n\ndef get_beta_schedule(T=1000, beta_start=1e-4, beta_end=0.02):\n    """线性方差调度"""\n    return torch.linspace(beta_start, beta_end, T)\n\ndef forward_diffusion(x_0, t, betas):\n    """一步到位计算 x_t ~ q(x_t | x_0)\"\"\"\n    alpha = 1.0 - betas\n    alpha_bar = torch.cumprod(alpha, dim=0)\n    alpha_bar_t = alpha_bar[t][:, None, None, None]\n    \n    mean = torch.sqrt(alpha_bar_t) * x_0\n    noise = torch.randn_like(x_0)\n    x_t = mean + torch.sqrt(1 - alpha_bar_t) * noise\n    return x_t, noise`
                },
                {
                    lang: "python",
                    code: `# 可视化不同时间步的加噪效果\nimport matplotlib.pyplot as plt\nimport numpy as np\n\nT = 1000\nbetas = get_beta_schedule(T)\n\ntimesteps = [0, 50, 200, 500, 800, 999]\nfig, axes = plt.subplots(1, 6, figsize=(15, 3))\nfor i, t in enumerate(timesteps):\n    x_t, _ = forward_diffusion(img_tensor, torch.tensor([t]), betas)\n    axes[i].imshow(x_t.squeeze().permute(1, 2, 0).numpy())\n    axes[i].set_title(f"t={t}")\n    axes[i].axis("off")\nplt.suptitle("Forward Diffusion Process")`
                }
            ],
            table: {
                headers: ["时间步 t", "alpha_bar_t", "信号占比", "噪声占比", "图像可辨识度"],
                rows: [
                    ["0", "1.000", "100%", "0%", "完全清晰"],
                    ["100", "0.905", "90.5%", "9.5%", "轻微噪声"],
                    ["300", "0.540", "54.0%", "46.0%", "明显模糊"],
                    ["600", "0.096", "9.6%", "90.4%", "几乎不可辨"],
                    ["1000", "0.000", "~0%", "~100%", "纯高斯噪声"]
                ]
            },
            mermaid: `graph LR\n    A["x_0 清晰图像"] -->|q(x_1|x_0)| B["x_1 轻微噪声"]\n    B -->|q(x_2|x_1)| C["x_2 更多噪声"]\n    C -->|"..."| D["x_t 高度噪声"]\n    D -->|"..."| E["x_T 纯噪声"]\n    style A fill:#4CAF50,color:#1e293b\n    style E fill:#f44336,color:#1e293b`,
            tip: "实际训练中 alpha_bar 可以预先计算并缓存，避免每一步重复计算 cumprod。",
            warning: "beta_t 调度不当会导致训练发散或信息过早丢失，建议从线性调度开始调参。"
        },
        {
            title: "3. 反向去噪过程与 U-Net",
            body: `反向去噪过程（Reverse Process）是扩散模型的生成核心。与前向过程固定不同，反向过程需要学习一个参数化的分布 p_theta(x_{t-1} | x_t)，从纯噪声 x_T 逐步恢复出清晰图像 x_0。DDPM 选择用 U-Net 架构来预测每一步加入的噪声 epsilon_theta(x_t, t)。为什么选 U-Net？因为 U-Net 的编码器-解码器结构配合跳跃连接，能够同时捕获全局语义和局部细节，这对图像去噪至关重要。U-Net 还需要融入时间步信息，通常通过正弦位置编码或 MLP 将 t 编码为向量，注入到残差块中。近年来，Attention 机制被引入 U-Net，形成了更强大的架构，能够处理高分辨率图像和长距离依赖。训练好的网络在推理时从随机噪声开始，逐步预测并减去噪声，最终生成高质量图像。`,
            code: [
                {
                    lang: "python",
                    code: `# 简化版时间感知 U-Net\nclass TimeEmbedding(nn.Module):\n    def __init__(self, dim):\n        super().__init__()\n        self.dim = dim\n    \n    def forward(self, t):\n        half = self.dim // 2\n        freqs = torch.exp(-torch.arange(half) * \\\n            (torch.log(torch.tensor(10000.0)) / half))\n        args = t[:, None].float() * freqs[None]\n        return torch.cat([torch.sin(args), torch.cos(args)], dim=-1)\n\nclass SimpleUNet(nn.Module):\n    def __init__(self, in_ch=3, base_ch=64):\n        super().__init__()\n        self.time_embed = TimeEmbedding(base_ch * 4)\n        self.down = nn.Conv2d(in_ch, base_ch, 3, padding=1)\n        self.mid = nn.Conv2d(base_ch, base_ch, 3, padding=1)\n        self.up = nn.Conv2d(base_ch * 2, in_ch, 3, padding=1)`
                },
                {
                    lang: "python",
                    code: `# 反向采样过程（DDPM 原始采样）\n@torch.no_grad()\ndef reverse_diffusion(model, shape, betas, device=\"cuda\"):\n    T = len(betas)\n    alpha = 1.0 - betas\n    alpha_bar = torch.cumprod(alpha, dim=0)\n    \n    x = torch.randn(shape, device=device)\n    for t in reversed(range(T)):\n        t_tensor = torch.full((shape[0],), t, device=device)\n        predicted_noise = model(x, t_tensor)\n        \n        beta_t = betas[t]\n        alpha_t = alpha[t]\n        alpha_bar_t = alpha_bar[t]\n        \n        x = (1 / torch.sqrt(alpha_t)) * (x - \\\n            (beta_t / torch.sqrt(1 - alpha_bar_t)) * predicted_noise)\n        if t > 0:\n            x += torch.sqrt(beta_t) * torch.randn_like(x)\n    return x`
                }
            ],
            table: {
                headers: ["U-Net 组件", "功能", "输入维度", "输出维度", "关键技术"],
                rows: [
                    ["编码器", "下采样提取特征", "H x W x C", "H/4 x W/4 x 4C", "步长卷积"],
                    ["时间嵌入", "编码时间步信息", "标量 t", "d_model 向量", "正弦编码"],
                    ["注意力块", "捕获长程依赖", "H/8 x W/8 x 8C", "同输入", "Self-Attention"],
                    ["跳跃连接", "融合高低层特征", "拼接", "拼接后卷积", "Concat + Conv"],
                    ["解码器", "上采样恢复分辨率", "H/4 x W/4 x 4C", "H x W x C", "转置卷积"]
                ]
            },
            mermaid: `graph TD\n    A["x_t 噪声图像"] --> B["编码器"]\n    B --> C["瓶颈层 + Attention"]\n    C --> D["解码器"]\n    T["时间步 t"] --> E["时间嵌入"]\n    E --> B\n    E --> C\n    E --> D\n    D --> F["epsilon 预测噪声"]\n    subgraph U-Net\n    B\n    C\n    D\n    end`,
            tip: "使用 GroupNorm 替代 BatchNorm 可以在小 batch size 下稳定训练扩散模型。",
            warning: "U-Net 输出必须与输入分辨率一致，注意 padding 和 stride 的匹配。"
        },
        {
            title: "4. DDPM 训练目标",
            body: `DDPM 的训练目标可以优雅地简化为预测噪声的均方误差。从变分下界（ELBO）出发，经过一系列数学推导，KL 散度项最终等价于让神经网络预测前向过程中注入的真实噪声。具体地，训练损失 L = E_{t, x_0, epsilon}[||epsilon - epsilon_theta(x_t, t)||^2]，其中 t 均匀采样自 [1, T]，x_t 由前向过程得到，epsilon 是注入的标准高斯噪声。这种简化带来了两个巨大优势：一是目标函数无需近似，可以直接计算；二是无需像 GAN 那样维持判别器。训练时，每个 batch 中随机采样时间步 t，对同一批数据施加不同强度的噪声，相当于同时训练了 T 个不同噪声水平的去噪器。实际实现中，还可以对损失进行加权（如简单损失 vs 加权损失），但 Ho 等人的原始论文发现简单的未加权 MSE 效果最好。`,
            code: [
                {
                    lang: "python",
                    code: `# DDPM 训练循环\ndef train_step(model, x_0, optimizer, betas):\n    batch_size = x_0.shape[0]\n    T = len(betas)\n    \n    # 随机采样时间步\n    t = torch.randint(0, T, (batch_size,), device=x_0.device)\n    \n    # 采样噪声\n    noise = torch.randn_like(x_0)\n    \n    # 前向过程得到 x_t\n    x_t, _ = forward_diffusion(x_0, t, betas)\n    \n    # 预测噪声\n    predicted_noise = model(x_t, t)\n    \n    # 简单 MSE 损失\n    loss = torch.nn.functional.mse_loss(noise, predicted_noise)\n    \n    optimizer.zero_grad()\n    loss.backward()\n    optimizer.step()\n    return loss.item()`
                },
                {
                    lang: "python",
                    code: `# 完整训练流程\nimport torch.optim as optim\nfrom tqdm import tqdm\n\ndef train_ddpm(model, dataloader, epochs=100, lr=2e-4):\n    betas = get_beta_schedule(T=1000)\n    optimizer = optim.AdamW(model.parameters(), lr=lr)\n    \n    for epoch in range(epochs):\n        model.train()\n        pbar = tqdm(dataloader, desc=f"Epoch {epoch+1}")\n        total_loss = 0\n        \n        for batch in pbar:\n            x_0 = batch[\"image\"].cuda()\n            loss = train_step(model, x_0, optimizer, betas)\n            total_loss += loss\n            pbar.set_postfix(loss=total_loss / (pbar.n + 1))\n        \n        print(f"Epoch {epoch+1} avg loss: {total_loss/len(dataloader):.6f}")`
                }
            ],
            table: {
                headers: ["损失变体", "公式", "权重 w(t)", "适用场景", "效果"],
                rows: [
                    ["简单损失", "||eps - eps_hat||^2", "1", "默认选择", "稳定，效果最佳"],
                    ["加权损失", "w(t)||eps - eps_hat||^2", "1/(1-alpha_bar_t)", "理论推导", "实验效果较差"],
                    ["v-prediction", "||v - v_hat||^2", "1", "大模型训练", "更适合高步数"],
                    ["x_0-prediction", "||x_0 - x_0_hat||^2", "alpha_bar_t", "特殊需求", "重构更准确"]
                ]
            },
            mermaid: `graph LR\n    A["随机采样 t"] --> B["前向加噪 x_t"]\n    B --> C["U-Net 预测噪声\"]\n    C --> D["MSE 计算损失"]\n    D --> E["反向传播更新权重"]\n    E --> F["重复直到收敛"]\n    style D fill:#FF9800,color:#1e293b`,
            tip: "使用 EMA（指数移动平均）权重进行推理可以显著提升生成质量，训练时保存 EMA 模型。",
            warning: "DDPM 需要 1000 步采样，训练时间较长，建议先用小 T 值调试代码。"
        },
        {
            title: "5. 采样加速 DDIM",
            body: `DDPM 原始采样需要 1000 步马尔可夫去噪，这在实践中太慢了。DDIM（Denoising Diffusion Implicit Models）的关键突破在于发现：扩散模型的反向过程可以是非马尔可夫的，只要边缘分布 q(x_t | x_0) 保持不变，整个训练目标就仍然有效。基于这一洞察，DDIM 推导出了确定性采样公式，可以直接跳过中间步骤，用 20-50 步就能达到与 DDPM 1000 步相当的质量。DDIM 采样器本质上是求解一个常微分方程（ODE），这带来了额外的优势：确定性采样意味着相同的初始噪声产生相同的图像，支持图像插值和隐空间编辑。此外，DDIM 的加速效果是数量级的，1000 步降到 50 步意味着推理速度提升 20 倍，这对实际应用至关重要。`,
            code: [
                {
                    lang: "python",
                    code: `# DDIM 采样器实现\n@torch.no_grad()\ndef ddim_sample(model, shape, betas, steps=50, eta=0.0):\n    T = len(betas)\n    alpha = 1.0 - betas\n    alpha_bar = torch.cumprod(alpha, dim=0)\n    \n    # 选择采样时间步（均匀间隔）\n    skip = T // steps\n    seq = range(0, T, skip)\n    seq_next = [-1] + list(seq[:-1])\n    \n    x = torch.randn(shape, device=\"cuda\")\n    \n    for i, j in zip(reversed(seq), reversed(seq_next)):\n        t_tensor = torch.full((shape[0],), i, device=\"cuda\")\n        eps = model(x, t_tensor)\n        \n        x0_pred = (x - torch.sqrt(1 - alpha_bar[i]) * eps) / \\\n                   torch.sqrt(alpha_bar[i])\n        \n        if j >= 0:\n            c1 = eta * torch.sqrt((1 - alpha_bar[i]) / (1 - alpha_bar[j]) * \\\n                   (1 - alpha_bar[j] / alpha_bar[i]))\n            c2 = torch.sqrt((1 - alpha_bar[j]) - c1**2)\n            x = torch.sqrt(alpha_bar[j]) * x0_pred + c2 * eps + \\\n                c1 * torch.randn_like(x)\n    return x`
                },
                {
                    lang: "python",
                    code: `# 对比 DDPM vs DDIM 采样速度与质量\nimport time\n\ndef benchmark_sampling(model, shape, betas, methods):\n    results = []\n    for name, steps in methods:\n        start = time.time()\n        if name == \"DDPM\":\n            img = reverse_diffusion(model, shape, betas)\n        else:\n            img = ddim_sample(model, shape, betas, steps=steps)\n        elapsed = time.time() - start\n        results.append({\"method\": name, \"steps\": steps, \n                       \"time\": f\"{elapsed:.2f}s\"})\n    return results\n\nmethods = [(\"DDPM\", 1000), (\"DDIM-100\", 100), \n           (\"DDIM-50\", 50), (\"DDIM-20\", 20)]\nbenchmark = benchmark_sampling(model, (1, 3, 64, 64), betas, methods)\nfor r in benchmark:\n    print(f\"{r['method']:10s} | {r['steps']:4d} steps | {r['time']}\")`
                }
            ],
            table: {
                headers: ["采样器", "步数", "时间(s)", "FID", "确定性", "插值能力"],
                rows: [
                    ["DDPM", "1000", "~12.0", "3.2", "否（随机）", "不支持"],
                    ["DDIM", "100", "~1.5", "3.5", "是（确定）", "支持"],
                    ["DDIM", "50", "~0.8", "3.8", "是（确定）", "支持"],
                    ["DDIM", "20", "~0.3", "4.5", "是（确定）", "支持"],
                    ["DPM-Solver", "20", "~0.3", "3.1", "是（确定）", "支持"]
                ]
            },
            mermaid: `graph LR\n    A["DDPM: 1000步"] -->|20x 加速| B["DDIM: 50步"]\n    B -->|质量相当| C["FID ~3.8\"]\n    B -->|确定性| D["支持插值"]\n    B -->|ODE 视角| E["DPM-Solver"]\n    style B fill:#2196F3,color:#1e293b`,
            tip: "eta=0 得到确定性 DDIM，eta=1 回到随机 DDPM，可以调节 eta 在质量和多样性间权衡。",
            warning: "DDIM 步数过少（<10）时质量会明显下降，需根据具体任务选择合适的步数。"
        },
        {
            title: "6. 条件扩散模型",
            body: `无条件扩散模型只能生成随机样本，而实际应用中我们往往需要控制生成内容，比如根据文本描述生成图像，或指定类别生成特定物体。条件扩散模型通过在去噪过程中注入条件信息来实现可控生成。主要有两种范式：Classifier Guidance 和 Classifier-Free Guidance。Classifier Guidance 在训练一个独立分类器的基础上，利用分类器的梯度引导采样方向，实现简单但需要额外训练分类器。Classifier-Free Guidance 则在训练时随机丢弃条件（以一定概率用空条件替代），使得同一个网络同时学习有条件和无条件去噪，采样时通过线性组合两者的预测实现引导。后者不需要额外分类器，且效果更好，已成为 Stable Diffusion 等主流模型的标准做法。引导强度通过 guidance_scale 参数控制，值越大条件约束越强，但过大可能导致过饱和或伪影。`,
            code: [
                {
                    lang: "python",
                    code: `# Classifier-Free Guidance 采样\n@torch.no_grad()\ndef cfg_sample(model, shape, betas, cond, steps=50, guidance_scale=7.5):\n    T = len(betas)\n    alpha = 1.0 - betas\n    alpha_bar = torch.cumprod(alpha, dim=0)\n    skip = T // steps\n    seq = range(0, T, skip)\n    seq_next = [-1] + list(seq[:-1])\n    \n    x = torch.randn(shape, device=\"cuda\")\n    batch_size = shape[0]\n    \n    for i, j in zip(reversed(seq), reversed(seq_next)):\n        t_tensor = torch.full((batch_size,), i, device=\"cuda\")\n        \n        # 有条件和无条件同时预测\n        # cond 重复两次：[cond, empty]\n        double_x = torch.cat([x, x], dim=0)\n        double_t = torch.cat([t_tensor, t_tensor], dim=0)\n        double_cond = torch.cat([cond, torch.zeros_like(cond)], dim=0)\n        \n        eps_pred = model(double_x, double_t, double_cond)\n        eps_cond = eps_pred[:batch_size]\n        eps_uncond = eps_pred[batch_size:]\n        \n        # CFG 公式\n        eps = eps_uncond + guidance_scale * (eps_cond - eps_uncond)\n        \n        # DDIM 更新\n        x0_pred = (x - torch.sqrt(1 - alpha_bar[i]) * eps) / \\\n                   torch.sqrt(alpha_bar[i])\n        if j >= 0:\n            x = torch.sqrt(alpha_bar[j]) * x0_pred + \\\n                torch.sqrt(1 - alpha_bar[j]) * eps\n    return x`
                },
                {
                    lang: "python",
                    code: `# 训练时随机丢弃条件\nclass ConditionalUNet(nn.Module):\n    def __init__(self, in_ch=3, base_ch=128, cond_dim=512, \n                 dropout_rate=0.1):\n        super().__init__()\n        self.unet = SimpleUNet(in_ch, base_ch)\n        self.cond_proj = nn.Linear(cond_dim, base_ch * 4)\n        self.dropout_rate = dropout_rate\n    \n    def forward(self, x, t, cond=None):\n        time_emb = self.unet.time_embed(t)\n        \n        if cond is not None and self.training:\n            # 随机丢弃条件（Classifier-Free 的关键）\n            mask = torch.bernoulli(\n                torch.full((x.shape[0], 1), 1 - self.dropout_rate))\n            cond = cond * mask.to(cond.device)\n        \n        if cond is not None:\n            cond_emb = self.cond_proj(cond)\n            time_emb = time_emb + cond_emb\n        \n        return self.unet(x, time_emb)`
                }
            ],
            table: {
                headers: ["特性", "Classifier Guidance", "Classifier-Free Guidance"],
                rows: [
                    ["需要分类器", "是（额外训练）", "否（同一网络）"],
                    ["训练复杂度", "高（两个模型）", "中（一个模型）"],
                    ["引导质量", "好", "更好"],
                    ["实现难度", "中", "低"],
                    ["Stable Diffusion", "未使用", "核心机制"],
                    ["引导强度控制", "分类器权重", "guidance_scale"]
                ]
            },
            mermaid: `graph TD\n    A["条件 c (文本/类别)"] --> B["条件编码器\"]\n    B --> C["Conditional U-Net"]\n    N["x_t 噪声图像"] --> C\n    T["时间步 t"] --> C\n    C --> D["eps_cond\"]\n    E["空条件"] --> C\n    C --> F["eps_uncond\"]\n    D --> G["CFG 组合\"]\n    F --> G\n    G --> H["guidance_scale 控制强度"]`,
            tip: "guidance_scale 在 7.5 左右通常效果最好，过高会导致过饱和，过低则条件控制不足。",
            warning: "训练时 dropout_rate 设为 0.1-0.2，推理时必须关闭 dropout 并使用 CFG。"
        },
        {
            title: "7. PyTorch 实战",
            body: `本节从零搭建一个可在 CIFAR-10 上训练的简化扩散模型。我们将整合前面学到的所有核心组件：方差调度、前向加噪、时间感知 U-Net、DDPM 训练目标和 DDIM 采样器。虽然这个模型规模不大（约 1500 万参数），但它包含了现代扩散模型的完整管线。训练时建议使用 4-8 张 GPU，batch size 设为 128-256，学习率 2e-4 配合 AdamW 优化器。CIFAR-10 图像尺寸仅为 32x32，训练 100 个 epoch 大约需要 6-12 小时。训练完成后，用 DDIM 采样器生成图像，20 步即可获得质量不错的样本。这个实战项目的关键不在于达到 SOTA 结果，而在于完整走通从数据加载到图像生成的全流程，为后续学习 Stable Diffusion 等大规模模型打下坚实基础。`,
            code: [
                {
                    lang: "python",
                    code: `# 完整扩散模型训练脚本\nimport torch\nimport torch.nn as nn\nimport torchvision\nfrom torchvision import transforms\nfrom torch.utils.data import DataLoader\n\nclass DiffusionTrainer:\n    def __init__(self, model, lr=2e-4, device=\"cuda\"):\n        self.model = model.to(device)\n        self.betas = get_beta_schedule(T=1000)\n        self.optimizer = torch.optim.AdamW(model.parameters(), lr=lr)\n        self.device = device\n    \n    def train_epoch(self, dataloader):\n        self.model.train()\n        total_loss = 0\n        for batch, _ in dataloader:\n            x_0 = batch.to(self.device)\n            loss = self._step(x_0)\n            total_loss += loss\n        return total_loss / len(dataloader)\n    \n    def _step(self, x_0):\n        t = torch.randint(0, 1000, (x_0.shape[0],), device=self.device)\n        noise = torch.randn_like(x_0)\n        alpha = 1.0 - self.betas\n        alpha_bar = torch.cumprod(alpha, dim=0)\n        alpha_bar_t = alpha_bar[t][:, None, None, None]\n        x_t = torch.sqrt(alpha_bar_t) * x_0 + \\\n              torch.sqrt(1 - alpha_bar_t) * noise\n        pred = self.model(x_t, t)\n        loss = nn.functional.mse_loss(noise, pred)\n        self.optimizer.zero_grad()\n        loss.backward()\n        self.optimizer.step()\n        return loss.item()`
                },
                {
                    lang: "python",
                    code: `# 主入口：训练 + 生成\nif __name__ == \"__main__\":\n    # 数据\n    transform = transforms.Compose([\n        transforms.RandomHorizontalFlip(),\n        transforms.ToTensor(),\n        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))\n    ])\n    dataset = torchvision.datasets.CIFAR10(\"./data\", train=True,\n                                          download=True, transform=transform)\n    loader = DataLoader(dataset, batch_size=128, shuffle=True)\n    \n    # 模型 + 训练器\n    model = ConditionalUNet(in_ch=3, base_ch=128, cond_dim=10)\n    trainer = DiffusionTrainer(model)\n    \n    # 训练 100 epoch\n    for epoch in range(100):\n        loss = trainer.train_epoch(loader)\n        if (epoch + 1) % 10 == 0:\n            print(f\"Epoch {epoch+1}: loss={loss:.6f}\")\n            # 生成样本\n            samples = ddim_sample(model, (16, 3, 32, 32), \n                                  trainer.betas, steps=50)\n            torchvision.utils.save_image(\n                (samples + 1) / 2, f\"samples_epoch_{epoch+1}.png\",\n                nrow=4)`
                }
            ],
            table: {
                headers: ["超参数", "推荐值", "调大影响", "调小影响"],
                rows: [
                    ["batch_size", "128-256", "更稳定但显存增加", "训练不稳定"],
                    ["learning_rate", "2e-4", "可能发散", "收敛慢"],
                    ["T (步数)", "1000", "加噪更平滑但训练慢", "信息丢失过快"],
                    ["base_ch", "128", "容量更大但更慢", "欠拟合"],
                    ["ema_rate", "0.9999", "更平滑但响应慢", "质量略降"],
                    ["dropout_rate", "0.1", "条件控制减弱", "容易过拟合"]
                ]
            },
            mermaid: `graph TD\n    A["CIFAR-10 数据\"] --> B["数据增强 + 归一化\"]\n    B --> C["前向加噪 x_t"]\n    C --> D["U-Net 预测噪声\"]\n    D --> E["MSE 损失"]\n    E --> F["AdamW 更新\"]\n    F --> G{"100 epoch?"}\n    G -->|否| C\n    G -->|是| H["DDIM 采样生成"]\n    H --> I["保存图像"]\n    style G fill:#FF9800,color:#1e293b\n    style H fill:#4CAF50,color:#1e293b`,
            tip: "使用 torch.amp.autocast 混合精度训练可以节省约 50% 显存，加速 1.5-2 倍。",
            warning: "CIFAR-10 虽然小但足以验证管线正确性，不要跳过这一步直接上大模型。"
        },
    ],
};
