import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-012",
    title: "自编码器 Autoencoder：压缩与重建",
    category: "dl",
    tags: ["自编码器", "无监督", "降维"],
    summary: "从编码到解码，理解自编码器如何学习数据的高效表示",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 自编码器基础架构",
            body: `自编码器（Autoencoder）是一类通过无监督学习来学习数据高效表示的神经网络。其核心思想非常直观：让网络先压缩输入，再尝试重建它。整个架构由编码器（Encoder）和解码器（Decoder）两部分组成，中间通过一个低维的瓶颈层（Bottleneck）连接。

编码器将高维输入 x 映射到隐表示 z = f(x)，维度通常远小于输入；解码器则从 z 重建输出 x' = g(z)，目标是使 x' 尽可能接近 x。损失函数一般采用均方误差 MSE 或交叉熵，衡量重建质量。自编码器不依赖标签，而是从数据本身的分布中学习，因此属于无监督学习范式。

与 PCA 等线性降维方法不同，自编码器可以捕捉非线性结构。当激活函数采用 ReLU 或 Sigmoid 时，编码器学习到的是一种非线性流形上的坐标变换。这也使得自编码器在图像去噪、异常检测等任务中展现出独特优势。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class Autoencoder(nn.Module):
    """基础自编码器：Encoder + Decoder"""
    def __init__(self, input_dim, hidden_dim, latent_dim):
        super().__init__()
        # 编码器：逐步降维到潜空间
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, latent_dim),
            nn.ReLU()
        )
        # 解码器：从潜空间重建
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, input_dim),
            nn.Sigmoid()  # 假设输入归一化到 [0,1]
        )
    
    def forward(self, x):
        z = self.encoder(x)
        x_recon = self.decoder(z)
        return x_recon, z`
                },
                {
                    lang: "python",
                    code: `# 训练循环
def train_ae(model, dataloader, epochs=50, lr=1e-3):
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.MSELoss()
    
    for epoch in range(epochs):
        total_loss = 0.0
        for batch in dataloader:
            x = batch.view(batch.size(0), -1)
            x_recon, _ = model(x)
            
            loss = criterion(x_recon, x)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        
        avg_loss = total_loss / len(dataloader)
        if (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.4f}")`
                }
            ],
            table: {
                headers: ["组件", "输入维度", "输出维度", "作用"],
                rows: [
                    ["编码器", "(batch, 784)", "(batch, 128)", "特征提取与压缩"],
                    ["瓶颈层", "(batch, 128)", "(batch, 32)", "强制学习紧凑表示"],
                    ["解码器", "(batch, 32)", "(batch, 784)", "从潜向量重建数据"]
                ]
            },
            mermaid: `graph LR
    A["输入 x"] --> B["编码器 f"]
    B --> C["潜向量 z"]
    C --> D["解码器 g"]
    D --> E["重建 x'"]
    E -. MSE Loss .-> A`,
            tip: "潜空间维度是关键超参数：太小会丢失信息，太大会导致恒等映射",
            warning: "不要对未归一化的数据直接使用 MSE 损失，先做 Min-Max 标准化到 [0,1]"
        },
        {
            title: "2. 欠完备自编码器",
            body: `欠完备自编码器（Undercomplete Autoencoder）是最基础的自编码器变体，其核心约束在于潜空间维度严格小于输入维度。这种设计强迫网络学习数据中最显著的特征，而非简单地复制输入。

当潜空间维度 d_latent << d_input 时，编码器无法保留全部信息，只能选择性地编码对重建最重要的特征。从信息论角度看，这相当于在给定重建误差上限下寻找最小描述长度（Minimum Description Length）。如果潜空间维度大于或等于输入维度，网络可能学到恒等映射，完全失去降维意义。

欠完备自编码器可以视为非线性版本的 PCA。当编码器和解码器都是线性变换且使用 MSE 损失时，欠完备自编码器学习到的子空间与 PCA 的主成分子空间完全一致。引入非线性激活后，它能够捕捉更复杂的流形结构，这也是其超越线性方法的关键所在。`,
            code: [
                {
                    lang: "python",
                    code: `# 对比 PCA 与欠完备自编码器
from sklearn.decomposition import PCA
import numpy as np

# PCA 线性降维
pca = PCA(n_components=32)
z_pca = pca.fit_transform(X)  # X: (N, 784)
X_pca_recon = pca.inverse_transform(z_pca)

# 欠完备自编码器等价于非线性 PCA
# 当 encoder/decoder 均为 Linear 且无激活函数时
# AE 的潜空间 = PCA 的主成分子空间
# 差异：AE 可以加入 ReLU/Sigmoid 等非线性`
                },
                {
                    lang: "python",
                    code: `class UndercompleteAE(nn.Module):
    """严格欠完备的自编码器"""
    def __init__(self, input_dim, latent_dim):
        super().__init__()
        assert latent_dim < input_dim, "欠完备要求潜维度 < 输入维度"
        
        layers = []
        dims = [input_dim, 512, 256, 128, latent_dim]
        for i in range(len(dims) - 1):
            layers.extend([
                nn.Linear(dims[i], dims[i+1]),
                nn.BatchNorm1d(dims[i+1]),
                nn.ReLU()
            ])
        layers.pop()  # 最后一层不加激活
        
        self.encoder = nn.Sequential(*layers)
        # 解码器对称结构
        dec_dims = [latent_dim] + dims[:-1][::-1]
        dec_layers = []
        for i in range(len(dec_dims) - 1):
            dec_layers.extend([
                nn.Linear(dec_dims[i], dec_dims[i+1]),
                nn.BatchNorm1d(dec_dims[i+1]),
                nn.ReLU()
            ])
        dec_layers[-1] = nn.Linear(dec_dims[-2], input_dim)
        self.decoder = nn.Sequential(*dec_layers)
    
    def forward(self, x):
        return self.decoder(self.encoder(x)), self.encoder(x)`
                }
            ],
            table: {
                headers: ["潜空间维度", "重建误差", "压缩率", "是否欠完备"],
                rows: [
                    ["64", "0.012", "12.3x", "是"],
                    ["128", "0.006", "6.1x", "是"],
                    ["784", "~0.0", "1.0x", "否（恒等映射风险）"]
                ]
            },
            mermaid: `graph TD
    A["输入 784 维"] --> B["Linear 512"]
    B --> C["Linear 256"]
    C --> D["Linear 128"]
    D --> E["潜空间 32"]
    E --> F["Linear 128"]
    F --> G["Linear 256"]
    G --> H["Linear 512"]
    H --> I["输出 784 维"]`,
            tip: "逐步缩小潜空间维度，观察重建质量的变化曲线，找到拐点即最优维度",
            warning: "网络容量过大会抵消欠完备约束的效果，增加隐藏层参数时需要同时减小潜空间维度"
        },
        {
            title: "3. 正则化自编码器：稀疏与去噪",
            body: `正则化自编码器通过在损失函数中添加约束项，而非单纯依赖潜空间维度限制，来引导网络学习更有意义的表示。最常见的两种变体是稀疏自编码器（Sparse Autoencoder）和去噪自编码器（Denoising Autoencoder）。

稀疏自编码器在损失函数中加入 L1 正则项或 KL 散度惩罚，迫使大部分隐藏单元保持静默（接近零），只有少数单元被激活。这模拟了生物神经元的稀疏编码原理，每个隐藏单元学习到输入数据中的特定局部特征。稀疏性约束可以用平均激活值与目标稀疏度之间的 KL 散度来度量。

去噪自编码器则在训练时向输入添加噪声（如高斯噪声或随机掩码），要求网络从损坏版本中重建原始干净数据。这迫使编码器学习数据的鲁棒表示，而非简单的恒等映射。去噪过程本质上是在学习数据流形的切线方向，使网络对垂直于流形的扰动不敏感。`,
            code: [
                {
                    lang: "python",
                    code: `class SparseAutoencoder(nn.Module):
    """稀疏自编码器：加入 L1 稀疏性约束"""
    def __init__(self, input_dim, hidden_dim, latent_dim, sparsity=0.05, beta=3.0):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, latent_dim), nn.Sigmoid()
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, input_dim), nn.Sigmoid()
        )
        self.sparsity = sparsity  # 目标平均激活率
        self.beta = beta  # 稀疏惩罚权重
    
    def sparse_penalty(self, z):
        """KL 散度稀疏惩罚"""
        p = self.sparsity
        p_hat = z.mean(dim=0)  # 每个神经元的平均激活
        p_hat = torch.clamp(p_hat, 1e-8, 1 - 1e-8)
        kl = p * torch.log(p / p_hat) + (1 - p) * torch.log((1 - p) / (1 - p_hat))
        return kl.sum()
    
    def forward(self, x):
        z = self.encoder(x)
        x_recon = self.decoder(z)
        recon_loss = nn.MSELoss()(x_recon, x)
        loss = recon_loss + self.beta * self.sparse_penalty(z)
        return x_recon, z, loss`
                },
                {
                    lang: "python",
                    code: `class DenoisingAutoencoder(nn.Module):
    """去噪自编码器：输入加噪声后重建"""
    def __init__(self, input_dim, hidden_dim, latent_dim, noise_level=0.3):
        super().__init__()
        self.noise_level = noise_level
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, latent_dim), nn.ReLU()
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, input_dim), nn.Sigmoid()
        )
    
    def add_noise(self, x):
        """添加高斯噪声或随机掩码"""
        noise = torch.randn_like(x) * self.noise_level
        return torch.clamp(x + noise, 0, 1)
    
    def forward(self, x):
        x_noisy = self.add_noise(x)
        z = self.encoder(x_noisy)
        x_recon = self.decoder(z)
        loss = nn.MSELoss()(x_recon, x)  # 对比干净输入
        return x_recon, z, loss`
                }
            ],
            table: {
                headers: ["变体", "约束方式", "优势", "适用场景"],
                rows: [
                    ["欠完备", "潜维度 < 输入维度", "简单直接", "通用降维"],
                    ["稀疏", "L1/KL 惩罚", "学习局部特征", "特征提取/可视化"],
                    ["去噪", "输入加噪声", "鲁棒性强", "图像去噪/增强"]
                ]
            },
            mermaid: `graph LR
    A["干净输入 x"] --> B["加噪声 x_tilde"]
    B --> C["编码器"]
    C --> D["潜向量 z"]
    D --> E["解码器"]
    E --> F["重建 x'"]
    F -. 对比干净 x .-> G["损失计算"]`,
            tip: "去噪噪声强度建议从 0.1-0.3 开始，过大则重建任务过于困难导致不收敛",
            warning: "稀疏自编码器的 KL 散度计算需要 clamp 防止 log(0)，否则会出现 NaN"
        },
        {
            title: "4. 变分自编码器 VAE",
            body: `变分自编码器（Variational Autoencoder, VAE）是 Kingma 和 Welling 于 2013 年提出的生成模型，它将概率图模型与深度学习结合，赋予自编码器生成新样本的能力。与传统自编码器不同，VAE 不将输入编码为确定的向量，而是编码为一个概率分布。

具体来说，编码器输出两个向量：均值 mu 和对数方差 log_sigma_sq，定义了一个多元高斯分布 q(z|x) = N(mu, sigma^2)。然后从该分布中采样得到 z，再用解码器重建。关键创新是重参数化技巧（Reparameterization Trick）：z = mu + sigma * epsilon，其中 epsilon ~ N(0, 1)，使采样操作可导，从而支持端到端训练。

VAE 的损失函数由两部分组成：重建损失保证生成质量，KL 散度约束潜分布接近标准正态分布 N(0, I)。这使得潜空间连续且平滑，任意采样点都能通过解码器生成有意义的样本，这是 VAE 作为生成模型的核心能力。`,
            code: [
                {
                    lang: "python",
                    code: `class VAE(nn.Module):
    """变分自编码器：编码为分布，支持生成"""
    def __init__(self, input_dim, hidden_dim, latent_dim):
        super().__init__()
        # 编码器输出 mu 和 log_var
        self.fc_enc = nn.Sequential(
            nn.Linear(input_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim), nn.ReLU()
        )
        self.fc_mu = nn.Linear(hidden_dim, latent_dim)
        self.fc_logvar = nn.Linear(hidden_dim, latent_dim)
        # 解码器
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, input_dim), nn.Sigmoid()
        )
    
    def reparameterize(self, mu, logvar):
        """重参数化技巧：使采样可导"""
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std
    
    def forward(self, x):
        h = self.fc_enc(x)
        mu = self.fc_mu(h)
        logvar = self.fc_logvar(h)
        z = self.reparameterize(mu, logvar)
        return self.decoder(z), mu, logvar`
                },
                {
                    lang: "python",
                    code: `def vae_loss(x_recon, x, mu, logvar, beta=1.0):
    """VAE 损失 = 重建损失 + KL 散度"""
    recon_loss = nn.MSELoss()(x_recon, x)
    # KL(q(z|x) || p(z))，闭式解
    kl_loss = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
    kl_loss /= x.size(0) * x.size(1)  # 归一化
    return recon_loss + beta * kl_loss, recon_loss, kl_loss

# 采样新数据
def sample_vae(model, n_samples, latent_dim, device):
    model.eval()
    with torch.no_grad():
        z = torch.randn(n_samples, latent_dim, device=device)
        samples = model.decoder(z)
        return samples  # 生成的新样本`
                }
            ],
            table: {
                headers: ["特性", "标准自编码器", "VAE"],
                rows: [
                    ["潜空间", "确定性向量", "概率分布 N(mu, sigma)"],
                    ["采样", "不可导", "重参数化技巧可导"],
                    ["生成能力", "无法直接生成", "可从 N(0,I) 采样生成"],
                    ["损失函数", "仅重建误差", "重建误差 + KL 散度"],
                    ["潜空间质量", "可能不连续", "连续且平滑"]
                ]
            },
            mermaid: `graph TD
    A["输入 x"] --> B["编码器"]
    B --> C["mu"]
    B --> D["log_var"]
    C --> E["重参数化"]
    D --> E
    F["epsilon ~ N(0,1)"] --> E
    E --> G["z = mu + sigma*eps"]
    G --> H["解码器"]
    H --> I["重建 x'"]`,
            tip: "使用 beta-VAE（增大 KL 权重）可以得到更解耦的潜变量，便于理解和操控",
            warning: "VAE 生成结果往往偏模糊，这是因为 KL 散度项鼓励潜变量接近标准正态分布，牺牲了部分重建精度"
        },
        {
            title: "5. 对抗自编码器 AAE",
            body: `对抗自编码器（Adversarial Autoencoder, AAE）由 Makhzani 等人于 2015 年提出，它将 GAN 的对抗训练思想引入自编码器框架，用于规范化潜空间分布。与 VAE 通过 KL 散度显式约束不同，AAE 使用判别器来隐式地迫使聚合后验分布 q(z) 匹配先验分布 p(z)。

AAE 包含三个阶段：重建阶段优化编码器使重建误差最小；正则化阶段让判别器区分真实先验样本和编码产生的潜向量；对抗阶段更新编码器使判别器无法区分两者。这种分离式训练使得 AAE 可以匹配任意形式的先验分布，而不仅限于高斯分布，这比 VAE 更加灵活。

AAE 的优势在于潜空间可以更精确地匹配目标分布，且没有 VAE 的模糊问题。但它也引入了 GAN 训练的不稳定性，需要仔细平衡重建损失和对抗损失。实践中常使用 Wasserstein 距离或梯度惩罚来稳定训练。`,
            code: [
                {
                    lang: "python",
                    code: `class Discriminator(nn.Module):
    """判别潜向量分布的判别器"""
    def __init__(self, latent_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(latent_dim, 128), nn.LeakyReLU(0.2),
            nn.Linear(128, 64), nn.LeakyReLU(0.2),
            nn.Linear(64, 1), nn.Sigmoid()
        )
    
    def forward(self, z):
        return self.net(z)


class AAE(nn.Module):
    def __init__(self, input_dim, hidden_dim, latent_dim):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, latent_dim)
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, input_dim), nn.Sigmoid()
        )
        self.discriminator = Discriminator(latent_dim)`
                },
                {
                    lang: "python",
                    code: `# AAE 训练：交替优化
def train_aae_step(aae, x, optimizer_ae, optimizer_d, device):
    batch_size = x.size(0)
    
    # --- 阶段 1: 重建阶段 ---
    optimizer_ae.zero_grad()
    z = aae.encoder(x)
    x_recon = aae.decoder(z)
    recon_loss = nn.MSELoss()(x_recon, x)
    recon_loss.backward(retain_graph=True)
    
    # --- 阶段 2: 判别器阶段 ---
    optimizer_d.zero_grad()
    z_fake = aae.encoder(x).detach()
    z_real = torch.randn_like(z_fake)
    d_fake = aae.discriminator(z_fake)
    d_real = aae.discriminator(z_real)
    d_loss = -(torch.log(d_real + 1e-8).mean() + torch.log(1 - d_fake + 1e-8).mean())
    d_loss.backward()
    optimizer_d.step()
    
    # --- 阶段 3: 对抗阶段（更新编码器） ---
    optimizer_ae.zero_grad()
    z_fake = aae.encoder(x)
    d_fake = aae.discriminator(z_fake)
    g_loss = -torch.log(d_fake + 1e-8).mean()
    g_loss.backward()
    optimizer_ae.step()
    
    return recon_loss.item(), d_loss.item(), g_loss.item()`
                }
            ],
            table: {
                headers: ["特性", "VAE", "AAE", "标准 AE"],
                rows: [
                    ["潜空间正则", "KL 散度（显式）", "判别器（隐式）", "无"],
                    ["先验灵活性", "仅高斯", "任意分布", "无约束"],
                    ["生成质量", "中等（偏模糊）", "较好", "无法直接生成"],
                    ["训练稳定性", "稳定", "不稳定（需技巧）", "稳定"],
                    ["计算开销", "低", "较高（需判别器）", "最低"]
                ]
            },
            mermaid: `graph TD
    A["输入 x"] --> B["编码器"]
    B --> C["z_encoder"]
    C --> D["解码器"]
    D --> E["重建 x'"]
    C --> F["判别器"]
    G["z_prior ~ N(0,1)"] --> F
    F --> H["real/fake"]`,
            tip: "使用 Wasserstein 距离代替标准 GAN 损失可以显著提升 AAE 训练稳定性",
            warning: "AAE 需要平衡三个阶段的训练步数，建议 1:1:1 或根据损失动态调整比例"
        },
        {
            title: "6. 应用：异常检测与图像生成",
            body: `自编码器在异常检测（Anomaly Detection）中有着天然优势。核心直觉是：自编码器在训练数据上学习到了正常样本的重建模式，当输入异常样本时，重建误差会显著增大。这是因为异常样本偏离了数据流形，编码器无法将其映射到训练时学习到的潜空间区域，导致解码器重建失败。

**具体流程**：训练阶段仅使用正常样本训练自编码器，使其在正常数据上达到低重建误差；推理阶段计算每个样本的重建误差，超过阈值的判定为异常。这种方法无需异常样本标签，属于无监督异常检测，在工业质检、网络安全、金融欺诈等场景广泛应用。

在图像生成方面，VAE 和 AAE 都可以从潜空间采样生成新图像。通过操控潜向量可以实现属性编辑（如改变人脸表情、调整图像风格），这是因为连续平滑的潜空间使得语义操作成为可能。结合条件编码（CVAE）还能实现条件生成，即指定类别或属性后生成对应图像。`,
            code: [
                {
                    lang: "python",
                    code: `class AnomalyDetector:
    """基于自编码器的异常检测器"""
    def __init__(self, autoencoder, threshold_percentile=95):
        self.ae = autoencoder
        self.threshold_percentile = threshold_percentile
        self.threshold = None
    
    def fit_threshold(self, dataloader):
        """在正常数据上确定异常阈值"""
        self.ae.eval()
        errors = []
        with torch.no_grad():
            for batch in dataloader:
                x = batch.view(batch.size(0), -1)
                x_recon, _ = self.ae(x)
                error = torch.mean((x - x_recon) ** 2, dim=1)
                errors.extend(error.cpu().numpy())
        # 使用百分位数作为阈值
        self.threshold = np.percentile(errors, self.threshold_percentile)
    
    def predict(self, x):
        """判断是否为异常"""
        self.ae.eval()
        with torch.no_grad():
            x_recon, _ = self.ae(x)
            error = torch.mean((x - x_recon) ** 2, dim=1)
            return (error > self.threshold).int()`
                },
                {
                    lang: "python",
                    code: `# 潜空间属性编辑：图像生成示例
def latent_interpolation(model, z1, z2, n_steps=10):
    """在两个潜向量之间线性插值"""
    alphas = torch.linspace(0, 1, n_steps).view(-1, 1)
    z_interp = (1 - alphas) * z1 + alphas * z2
    model.eval()
    with torch.no_grad():
        images = model.decoder(z_interp)
        return images  # 平滑过渡的图像序列


def latent_arithmetic(model, z_a, z_b, z_c, alpha=1.0):
    """潜空间向量运算：z = z_a - z_b + z_c"""
    z_result = z_a - z_b + z_c
    model.eval()
    with torch.no_grad():
        return model.decoder(z_result)`
                }
            ],
            table: {
                headers: ["应用场景", "方法", "输入", "输出"],
                rows: [
                    ["异常检测", "重建误差阈值", "单一样本", "正常/异常标签"],
                    ["图像去噪", "去噪自编码器", "带噪图像", "干净图像"],
                    ["图像生成", "VAE 潜空间采样", "随机噪声 z", "新图像"],
                    ["属性编辑", "潜向量算术", "潜向量 + 方向", "编辑后图像"],
                    ["数据压缩", "欠完备编码", "原始数据", "压缩表示"]
                ]
            },
            mermaid: `graph LR
    A["正常数据"] --> B["训练 AE"]
    B --> C["低重建误差"]
    D["异常数据"] --> E["测试 AE"]
    E --> F["高重建误差"]
    C --> G["阈值设定"]
    F --> H["异常判定"]`,
            tip: "异常检测中使用 Per-Sample MSE 而非 Batch MSE，逐样本判断更准确",
            warning: "异常检测的阈值选择至关重要，建议用 ROC 曲线或 PR 曲线在验证集上寻找最优阈值"
        },
        {
            title: "7. PyTorch 实战：MNIST 重建与潜空间插值",
            body: `本节通过完整的 PyTorch 代码实现一个卷积变分自编码器（Convolutional VAE），在 MNIST 数据集上训练，展示从数据准备、模型训练到生成新样本的完整流程。卷积架构相比全连接能更好地捕捉图像的空间结构信息。

卷积 VAE 的编码器使用 Conv2d + BatchNorm + ReLU 逐步降低空间维度并增加通道数，最终通过 Flatten 和全连接层输出 mu 和 log_var。解码器则使用 ConvTranspose2d 逐步上采样恢复空间维度。这种设计使潜向量保留了更多空间语义信息，重建质量显著提升。

训练完成后，我们将演示三项关键操作：第一，查看重建效果对比原图和重建图；第二，从标准正态分布采样生成全新的手写数字；第三，在两个数字的潜向量之间插值，观察生成图像的平滑过渡。这三项操作分别验证了模型的重建能力、生成能力和潜空间连续性。`,
            code: [
                {
                    lang: "python",
                    code: `class ConvVAE(nn.Module):
    """卷积变分自编码器 for MNIST"""
    def __init__(self, latent_dim=20):
        super().__init__()
        # 编码器：28x28 -> 4x4
        self.enc = nn.Sequential(
            nn.Conv2d(1, 32, 4, stride=2, padding=1),   # 28->14
            nn.BatchNorm2d(32), nn.ReLU(),
            nn.Conv2d(32, 64, 4, stride=2, padding=1),   # 14->7
            nn.BatchNorm2d(64), nn.ReLU(),
            nn.Conv2d(64, 128, 4, stride=2, padding=1),  # 7->4
            nn.BatchNorm2d(128), nn.ReLU(),
        )
        # 全连接层
        self.fc_mu = nn.Linear(128 * 4 * 4, latent_dim)
        self.fc_logvar = nn.Linear(128 * 4 * 4, latent_dim)
        self.fc_decode = nn.Linear(latent_dim, 128 * 4 * 4)
        # 解码器：4x4 -> 28x28
        self.dec = nn.Sequential(
            nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1),
            nn.BatchNorm2d(64), nn.ReLU(),
            nn.ConvTranspose2d(64, 32, 4, stride=2, padding=1),
            nn.BatchNorm2d(32), nn.ReLU(),
            nn.ConvTranspose2d(32, 1, 4, stride=2, padding=1),
            nn.Sigmoid()
        )
    
    def reparameterize(self, mu, logvar):
        return mu + torch.exp(0.5 * logvar) * torch.randn_like(mu)
    
    def forward(self, x):
        h = self.enc(x)
        h = h.view(h.size(0), -1)
        mu, logvar = self.fc_mu(h), self.fc_logvar(h)
        z = self.reparameterize(mu, logvar)
        h_dec = self.fc_decode(z).view(-1, 128, 4, 4)
        return self.dec(h_dec), mu, logvar`
                },
                {
                    lang: "python",
                    code: `# 完整训练与可视化
import torchvision.transforms as transforms
from torchvision.datasets import MNIST
from torch.utils.data import DataLoader

transform = transforms.Compose([transforms.ToTensor()])
train_ds = MNIST(root='./data', train=True, download=True, transform=transform)
train_loader = DataLoader(train_ds, batch_size=128, shuffle=True)

model = ConvVAE(latent_dim=20)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

for epoch in range(30):
    model.train()
    total_loss = 0
    for x, _ in train_loader:
        x_recon, mu, logvar = model(x)
        recon = nn.BCELoss()(x_recon, x)
        kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp()) / x.size(0)
        loss = recon + kl
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    print(f"Epoch {epoch+1}: Loss={total_loss/len(train_loader):.4f}")

# 潜空间插值可视化
model.eval()
with torch.no_grad():
    z1 = torch.randn(1, 20)  # 数字 A 的潜向量
    z2 = torch.randn(1, 20)  # 数字 B 的潜向量
    alphas = torch.linspace(0, 1, 8).view(-1, 1)
    z_path = (1 - alphas) * z1 + alphas * z2
    interp_images = model.decoder(model.fc_decode(z_path).view(-1, 128, 4, 4))
    # interp_images: (8, 1, 28, 28) 从 A 平滑过渡到 B`
                }
            ],
            table: {
                headers: ["训练阶段", "Epoch 范围", "典型 Loss", "观察指标"],
                rows: [
                    ["初始阶段", "1-5", "200-100", "重建质量快速提升"],
                    ["收敛阶段", "5-15", "100-80", "KL 散度逐渐增大"],
                    ["稳定阶段", "15-30", "80-75", "生成质量稳定"]
                ]
            },
            mermaid: `graph TD
    A["MNIST 28x28"] --> B["Conv2d 32"]
    B --> C["Conv2d 64"]
    C --> D["Conv2d 128"]
    D --> E["Flatten"]
    E --> F["mu + logvar"]
    F --> G["Reparameterize"]
    G --> H["FC Decode"]
    H --> I["ConvTranspose 恢复"]
    I --> J["28x28 重建"]`,
            tip: "使用 2D 潜空间（latent_dim=2）可以可视化整个潜空间分布，便于理解 VAE 的流形学习过程",
            warning: "MNIST 图像已经是 0-1 范围，不需要额外归一化；如果使用自定义数据集，务必确认输入范围匹配 Sigmoid 输出"
        }
    ],
};
