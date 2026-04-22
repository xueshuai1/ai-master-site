import { Article } from '../knowledge';

export const article: Article = {
    id: "cv-008",
    title: "图像生成：StyleGAN, Diffusion",
    category: "cv",
    tags: ["图像生成", "StyleGAN", "Diffusion"],
    summary: "从 GAN 到扩散模型，掌握图像生成的两大范式",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. 生成模型概述：从 VAE 到 Diffusion",
            body: `生成模型（Generative Models）的目标是学习数据分布 P_data(x)，并从中采样生成新的、与训练数据相似但不完全相同的样本。与判别模型（分类、检测）不同，生成模型需要「创造」而非「识别」，这使其成为 AI 最具挑战也最迷人的方向之一。主流生成模型经历了三个时代的演进：第一代是基于似然的模型，如变分自编码器（VAE）和归一化流（Normalizing Flows），它们通过最大化数据似然下界（ELBO）或可逆变换来学习分布，生成质量受限于模型假设；第二代是对抗生成网络（GAN），通过生成器和判别器的博弈达到纳什均衡，生成的图像质量极高但训练不稳定、模式崩溃问题突出；第三代是扩散模型（Diffusion Models），通过逐步加噪和去噪的马尔可夫链学习数据分布，训练稳定、生成质量超越 GAN，成为当前图像生成的主流范式。理解生成模型的本质，关键在于回答一个问题：我们如何在高维连续空间中，从随机噪声映射到有语义意义的数据点？`,
            code: [
                {
                    lang: "python",
                    code: `"""生成模型三大范式对比"""
from abc import ABC, abstractmethod
import torch
import torch.nn as nn

class GenerativeModel(ABC):
    """生成模型抽象基类"""
    @abstractmethod
    def sample(self, n: int) -> torch.Tensor:
        """从模型采样 n 个样本"""
        pass

    @abstractmethod
    def likelihood(self, x: torch.Tensor) -> torch.Tensor:
        """计算样本对数似然（部分模型可计算）"""
        pass

    @abstractmethod
    def encode(self, x: torch.Tensor) -> torch.Tensor:
        """编码到潜在空间（如适用）"""
        pass

class VAE(GenerativeModel):
    """变分自编码器：显式密度模型"""
    def __init__(self, latent_dim: int = 128):
        self.latent_dim = latent_dim
        # 编码器 q(z|x) 和解码器 p(x|z)
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 64, 4, 2, 1), nn.ReLU(),
            nn.Conv2d(64, 128, 4, 2, 1), nn.ReLU(),
            nn.Flatten(),
        )
        self.fc_mu = nn.Linear(128 * 8 * 8, latent_dim)
        self.fc_logvar = nn.Linear(128 * 8 * 8, latent_dim)
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 128 * 8 * 8),
            nn.Unflatten(1, (128, 8, 8)),
            nn.ConvTranspose2d(128, 64, 4, 2, 1), nn.ReLU(),
            nn.ConvTranspose2d(64, 3, 4, 2, 1), nn.Sigmoid(),
        )

    def reparameterize(self, mu: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:
        """重参数化技巧：z = mu + sigma * eps"""
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std

    def sample(self, n: int) -> torch.Tensor:
        z = torch.randn(n, self.latent_dim)
        return self.decoder(z)

    def likelihood(self, x: torch.Tensor) -> torch.Tensor:
        mu, logvar = self._encode(x)
        recon = self.decoder(self.reparameterize(mu, logvar))
        # 重构损失（高斯假设下的负对数似然）
        return -nn.MSELoss(reduction='none')(recon, x).sum(dim=[1, 2, 3])`
                },
                {
                    lang: "python",
                    code: `"""生成模型能力矩阵"""
model_comparison = {
    "VAE": {
        "显式密度": "是（可计算 ELBO）",
        "采样速度": "极快（一次前向传播）",
        "图像质量": "中等（模糊倾向）",
        "训练稳定性": "非常稳定",
        "模式覆盖": "好（不易模式崩溃）",
        "典型应用": "表示学习、异常检测",
    },
    "GAN": {
        "显式密度": "否（隐式模型）",
        "采样速度": "快（一次前向传播）",
        "图像质量": "极高（清晰锐利）",
        "训练稳定性": "不稳定（需精心设计）",
        "模式覆盖": "差（易模式崩溃）",
        "典型应用": "超分辨率、风格迁移",
    },
    "Diffusion": {
        "显式密度": "近似（变分下界）",
        "采样速度": "慢（多步迭代去噪）",
        "图像质量": "极高（超越 GAN）",
        "训练稳定性": "稳定（MLE 目标）",
        "模式覆盖": "极好",
        "典型应用": "文本生成图像、视频生成",
    },
    "Flow": {
        "显式密度": "是（精确似然）",
        "采样速度": "中等（可逆网络）",
        "图像质量": "中高",
        "训练稳定性": "稳定",
        "模式覆盖": "好",
        "典型应用": "密度估计、可逆编辑",
    },
}

print(f"{'模型':<12} | {'质量':<6} | {'速度':<6} | {'稳定性':<8}")
print("-" * 40)
for name, props in model_comparison.items():
    print(f"{name:<12} | {props['图像质量']:<14} | {props['采样速度']:<8} | {props['训练稳定性']}")`
                }
            ],
            table: {
                headers: ["模型类型", "密度估计", "采样效率", "图像质量", "训练难度", "代表工作"],
                rows: [
                    ["VAE", "显式（ELBO）", "快", "中等", "低", "Kingma et al. 2014"],
                    ["GAN", "隐式", "快", "高", "高", "Goodfellow et al. 2014"],
                    ["Flow", "显式（精确）", "中", "中高", "中", "Dinh et al. 2017"],
                    ["Diffusion", "近似（VLB）", "慢", "极高", "低", "Ho et al. 2020"],
                    ["Score-based", "隐式（Score）", "中-慢", "极高", "低", "Song et al. 2021"],
                    ["Autoregressive", "显式（分解）", "慢", "高", "中", "van den Oord et al. 2017"]
                ]
            },
            mermaid: `graph TD
    A["生成模型"] --> B["显式密度模型"]
    A --> C["隐式密度模型"]
    B --> D["VAE：变分下界"]
    B --> E["Flow：精确可逆"]
    B --> F["Autoregressive：链式分解"]
    C --> G["GAN：对抗博弈"]
    C --> H["Diffusion：逐步加噪去噪"]
    C --> I["Score-based：分数匹配"]
    style A fill:#0c4a6e
    style D fill:#7c2d12
    style G fill:#7f1d1d
    style H fill:#14532d`,
            tip: "入门生成模型建议先理解 VAE 的重参数化技巧——它是连接概率论与深度学习的桥梁，理解了 VAE 再学 Diffusion 会轻松很多",
            warning: "不要盲目追求 GAN 的生成质量——GAN 的训练需要大量调参经验（学习率、架构、正则化），对新手极不友好"
        },
        {
            title: "2. StyleGAN 架构详解：Style Space 与 AdaIN",
            body: `StyleGAN（Style-based Generative Adversarial Network，2018）是 NVIDIA 提出的一种革命性 GAN 架构，它彻底重构了传统 GAN 的生成器设计。传统 GAN 将潜在向量 z 直接输入全连接层生成图像，导致潜在空间高度纠缠——改变一个维度可能同时影响多个视觉属性。StyleGAN 的核心创新有三点：第一，引入映射网络（Mapping Network），将输入的潜在向量 z 通过 8 层全连接网络映射到中间潜在空间 W，解耦了不同语义属性；第二，采用自适应实例归一化（AdaIN），将 W 空间中的风格向量注入到生成器的每一层，实现了对不同尺度视觉特征的精细控制——浅层控制 coarse 属性（姿势、性别），中层控制 mid 属性（发型、面部特征），深层控制 fine 属性（颜色、微观纹理）；第三，引入噪声注入（Noise Injection），在每一层添加独立的随机噪声图，控制随机细节（毛孔位置、头发丝、雀斑），使生成图像更加真实自然。StyleGAN2（2020）进一步改进了架构，移除了权重解调中的 artifacts（水滴状伪影），用权重归一化替代 AdaIN 中的实例归一化步骤，生成质量再次提升。StyleGAN3（2021）解决了纹理粘连问题（aliasing），通过等变信号处理实现了真正的平移等变性。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import math

class MappingNetwork(nn.Module):
    """StyleGAN 映射网络：z -> w"""
    def __init__(self, z_dim: int = 512, w_dim: int = 512, num_layers: int = 8):
        super().__init__()
        layers = []
        for _ in range(num_layers):
            layers.extend([
                nn.Linear(z_dim if _ == 0 else w_dim, w_dim),
                nn.LeakyReLU(0.2, inplace=True),
            ])
        self.mapping = nn.Sequential(*layers)
        # 初始化：缩小方差
        for layer in self.mapping:
            if isinstance(layer, nn.Linear):
                fan_in = layer.in_features
                layer.weight.data *= 1.0 / math.sqrt(fan_in)

    def forward(self, z: torch.Tensor) -> torch.Tensor:
        """归一化输入 + 映射"""
        z = z / torch.linalg.norm(z, dim=-1, keepdim=True)  # 归一化
        return self.mapping(z)

class AdaIN(nn.Module):
    """自适应实例归一化"""
    def __init__(self, channels: int, w_dim: int = 512):
        super().__init__()
        self.norm = nn.InstanceNorm2d(channels, affine=False)
        self.style_scale = nn.Linear(w_dim, channels)
        self.style_bias = nn.Linear(w_dim, channels)
        # 初始化：输出接近 1 和 0
        nn.init.zeros_(self.style_scale.weight)
        nn.init.ones_(self.style_scale.bias)
        nn.init.zeros_(self.style_bias.weight)
        nn.init.zeros_(self.style_bias.bias)

    def forward(self, x: torch.Tensor, w: torch.Tensor) -> torch.Tensor:
        """AdaIN: norm(x) * scale(w) + bias(w)"""
        normalized = self.norm(x)
        scale = self.style_scale(w).view(x.size(0), -1, 1, 1)
        bias = self.style_bias(w).view(x.size(0), -1, 1, 1)
        return normalized * scale + bias`
                },
                {
                    lang: "python",
                    code: `class StyleGAN2Generator(nn.Module):
    """StyleGAN2 生成器简化版"""
    def __init__(self, z_dim=512, w_dim=512, img_size=128):
        super().__init__()
        self.mapping = MappingNetwork(z_dim, w_dim)
        self.w_dim = w_dim

        # 计算合成网络层数（从 4x4 到 img_size）
        self.num_layers = int(math.log2(img_size)) * 2 - 2

        # 常数输入 4x4
        self.const_input = nn.Parameter(torch.randn(1, 512, 4, 4))

        # 每层的 AdaIN + 卷积
        self.synthesis = nn.ModuleList()
        channels = 512
        for i in range(self.num_layers):
            if i > 0 and i % 2 == 0:
                channels = max(channels // 2, 64)
            self.synthesis.extend([
                nn.Conv2d(channels, channels, 3, padding=1),
                AdaIN(channels, w_dim),
                nn.LeakyReLU(0.2, inplace=True),
                nn.Conv2d(channels, channels, 3, padding=1),
                AdaIN(channels, w_dim),
                nn.LeakyReLU(0.2, inplace=True),
                nn.Upsample(scale_factor=2) if i < self.num_layers - 2 else nn.Identity(),
            ])

        self.to_rgb = nn.Conv2d(channels, 3, 1)

    def forward(self, z: torch.Tensor, truncation: float = 0.7) -> torch.Tensor:
        w = self.mapping(z)
        # 截断技巧（Truncation Trick）：向均值收缩，提高质量、降低多样性
        w_avg = torch.zeros(1, self.w_dim, device=z.device)  # 预计算的 w 均值
        w = w_avg + truncation * (w - w_avg)

        x = self.const_input.expand(z.size(0), -1, -1, -1)
        for layer in self.synthesis:
            if isinstance(layer, AdaIN):
                x = layer(x, w)
            else:
                x = layer(x)
        return torch.tanh(self.to_rgb(x))

    def style_mixing(self, z1: torch.Tensor, z2: torch.Tensor,
                      cutoff_layer: int = 4) -> torch.Tensor:
        """风格混合：z1 提供 coarse 风格，z2 提供 fine 风格"""
        w1 = self.mapping(z1)
        w2 = self.mapping(z2)
        # 在 cutoff_layer 处切换风格
        w_mixed = torch.cat([w1[:, :cutoff_layer], w2[:, cutoff_layer:]], dim=1)
        return self._forward_with_w(w_mixed)`
                }
            ],
            table: {
                headers: ["StyleGAN 版本", "年份", "核心改进", "分辨率", "主要突破"],
                rows: [
                    ["StyleGAN", "2018", "Mapping Network + AdaIN + 噪声注入", "1024x1024", "解耦风格控制"],
                    ["StyleGAN2", "2020", "移除 AdaIN 的 IN 步骤 + 权重归一化", "1024x1024", "消除水滴伪影"],
                    ["StyleGAN3", "2021", "等变卷积 + 抗混叠滤波", "1024x1024", "纹理平移等变性"],
                    ["StyleGAN-XL", "2022", "大规模训练 + 架构缩放", "1024x1024", "ImageNet-1K SOTA"],
                    ["StyleGAN3-T", "2021", "平移等变版本", "1024x1024", "消除纹理粘连"]
                ]
            },
            mermaid: `graph LR
    A["随机向量 z"] --> B["Mapping Network\n8层 MLP"]
    B --> C["中间向量 w"]
    C --> D["AdaIN 注入\n浅层：粗粒度"]
    C --> E["AdaIN 注入\n中层：中粒度"]
    C --> F["AdaIN 注入\n深层：细粒度"]
    G["噪声注入"] --> D
    G --> E
    G --> F
    D --> H["4x4 常数"]
    E --> I["中间分辨率"]
    F --> J["最终分辨率"]
    H --> I --> J --> K["生成图像"]
    style A fill:#0c4a6e
    style C fill:#7c2d12
    style K fill:#14532d`,
            tip: "StyleGAN 的截断技巧（truncation trick）是提升生成质量的关键——truncation_psi 设 0.7 适合高质量生成，设 1.0 适合探索潜在空间多样性",
            warning: "StyleGAN 只适合生成固定分辨率的图像（如人脸），不适合可变分辨率或条件生成任务——它的架构是专门为高质量人脸生成设计的"
        },
        {
            title: "3. Diffusion 模型基础：前向过程与反向过程",
            body: `扩散模型（Diffusion Models）的核心思想极其优雅：定义一个逐步加噪的前向过程（Forward Process），将数据分布逐渐变为标准高斯分布；然后学习一个反向过程（Reverse Process），从纯噪声逐步去噪，恢复出数据分布。前向过程是一个固定参数的马尔可夫链：每一步根据预设的方差调度（Variance Schedule）向数据添加少量高斯噪声。经过 T 步（通常 1000 步）后，数据完全变为高斯噪声。关键在于——由于每一步只添加少量噪声，相邻步之间的转移可以用高斯分布精确描述，这使得前向过程的任意时刻 t 的分布可以直接计算（不需要逐步模拟），公式为 q(x_t|x_0) = N(x_t; sqrt(alpha_bar_t) * x_0, (1-alpha_bar_t) * I)。反向过程是学习一个参数化的马尔可夫链 p_theta(x_{t-1}|x_t)，用神经网络预测每一步的去噪方向。DDPM（Denoising Diffusion Probabilistic Models，2020）将反向过程的均值预测转化为噪声预测——网络不直接预测 x_0 或均值，而是预测添加的噪声 epsilon_theta(x_t, t)，这大大简化了训练目标。训练损失简化为预测噪声与真实噪声之间的 MSE 损失：L = E_{t,x_0,epsilon}[||epsilon - epsilon_theta(x_t, t)||^2]。这个简洁的损失函数是扩散模型能够在大规模数据集上成功训练的关键。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import math

class LinearNoiseScheduler:
    """线性噪声调度器"""
    def __init__(self, timesteps: int = 1000, beta_start: float = 1e-4,
                 beta_end: float = 0.02):
        self.timesteps = timesteps
        self.betas = torch.linspace(beta_start, beta_end, timesteps)
        self.alphas = 1.0 - self.betas
        self.alpha_bars = torch.cumprod(self.alphas, dim=0)

    def add_noise(self, x0: torch.Tensor, t: torch.Tensor) -> tuple:
        """前向加噪：一步得到 x_t（不需要逐步模拟）"""
        noise = torch.randn_like(x0)
        alpha_bar = self.alpha_bars[t].view(-1, 1, 1, 1)
        x_t = torch.sqrt(alpha_bar) * x0 + torch.sqrt(1 - alpha_bar) * noise
        return x_t, noise

    def get_alpha_bar(self, t: torch.Tensor) -> torch.Tensor:
        return self.alpha_bars[t].view(-1, 1, 1, 1)

class SimpleUNet(nn.Module):
    """简化版 U-Net（扩散模型的去噪网络）"""
    def __init__(self, in_channels: int = 3, base_channels: int = 64):
        super().__init__()
        self.time_embed = nn.Sequential(
            nn.Linear(1, base_channels * 4),
            nn.SiLU(),
            nn.Linear(base_channels * 4, base_channels * 4),
        )
        # 编码器
        self.enc1 = nn.Conv2d(in_channels, base_channels, 3, padding=1)
        self.enc2 = nn.Conv2d(base_channels, base_channels * 2, 3, padding=1)
        self.enc3 = nn.Conv2d(base_channels * 2, base_channels * 4, 3, padding=1)
        # 解码器
        self.dec3 = nn.ConvTranspose2d(base_channels * 4, base_channels * 2, 3, padding=1)
        self.dec2 = nn.ConvTranspose2d(base_channels * 2, base_channels, 3, padding=1)
        self.dec1 = nn.ConvTranspose2d(base_channels, in_channels, 3, padding=1)
        self.pool = nn.MaxPool2d(2)
        self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True)

    def forward(self, x: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
        t_emb = self.time_embed(t.float().unsqueeze(-1)).unsqueeze(-1).unsqueeze(-1)
        e1 = torch.relu(self.enc1(x) + t_emb)
        e2 = torch.relu(self.enc2(self.pool(e1)) + t_emb)
        e3 = torch.relu(self.enc3(self.pool(e2)) + t_emb)
        d3 = torch.relu(self.dec3(e3) + e2 + t_emb)
        d2 = torch.relu(self.dec2(self.up(d3)) + e1 + t_emb)
        d1 = self.dec1(self.up(d2))
        return d1  # 预测的噪声`
                },
                {
                    lang: "python",
                    code: `"""DDPM 训练与采样循环"""
import torch
from torch.utils.data import DataLoader

class DDPMSampler:
    """DDPM 采样器"""
    def __init__(self, scheduler: LinearNoiseScheduler, model: nn.Module):
        self.scheduler = scheduler
        self.model = model

    @torch.no_grad()
    def sample(self, n_samples: int, shape: tuple, device: str = 'cpu') -> torch.Tensor:
        """从纯噪声逐步去噪生成样本"""
        x = torch.randn(n_samples, *shape, device=device)
        for t in reversed(range(self.scheduler.timesteps)):
            t_batch = torch.full((n_samples,), t, device=device, dtype=torch.long)

            # 预测噪声
            predicted_noise = self.model(x, t_batch)

            # 提取调度参数
            alpha = self.scheduler.alphas[t]
            alpha_bar = self.scheduler.alpha_bars[t]
            beta = self.scheduler.betas[t]

            # 反向步（DDPM 更新公式）
            mean = (1.0 / torch.sqrt(alpha)) * (
                x - (beta / torch.sqrt(1 - alpha_bar)) * predicted_noise
            )
            variance = beta

            # 除了最后一步，都添加噪声
            if t > 0:
                noise = torch.randn_like(x)
                x = mean + torch.sqrt(variance) * noise
            else:
                x = mean

        return torch.clamp(x, -1.0, 1.0)

# 训练循环示例
def train_diffusion(model, dataloader, scheduler, epochs=100):
    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-4)
    for epoch in range(epochs):
        for x0 in dataloader:
            x0 = x0.cuda()
            # 随机采样时间步
            t = torch.randint(0, scheduler.timesteps, (x0.size(0),), device='cuda')
            # 前向加噪（一步到位）
            x_t, noise = scheduler.add_noise(x0, t)
            # 预测噪声
            predicted_noise = model(x_t, t)
            # MSE 损失
            loss = nn.MSELoss()(predicted_noise, noise)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
        if epoch % 10 == 0:
            print(f"Epoch {epoch}, Loss: {loss.item():.6f}")`
                }
            ],
            table: {
                headers: ["扩散模型组件", "作用", "数学描述", "可学习?"],
                rows: [
                    ["前向过程 q(x_t|x_{t-1})", "逐步添加高斯噪声", "N(sqrt(1-beta)*x_{t-1}, beta*I)", "否（固定调度）"],
                    ["前向闭式 q(x_t|x_0)", "一步计算任意 t 的分布", "N(sqrt(alpha_bar_t)*x_0, (1-alpha_bar_t)*I)", "否"],
                    ["反向过程 p(x_{t-1}|x_t)", "学习去噪", "N(mu_theta, sigma^2)", "是"],
                    ["噪声预测网络 epsilon_theta", "预测添加的噪声", "CNN/UNet 输出", "是"],
                    ["时间嵌入 t", "告知当前噪声级别", "正弦位置编码 / MLP", "是"],
                    ["方差调度 beta_t", "控制每步加噪量", "线性 / 余弦 / 二次", "否（预设）"]
                ]
            },
            mermaid: `graph TD
    A["真实数据 x_0"] -->|"加噪 T 步"| B["纯噪声 x_T ~ N(0,I)"]
    B -->|"学习去噪"| C["x_{T-1}"]
    C -->|"学习去噪"| D["..."]
    D -->|"学习去噪"| E["x_1"]
    E -->|"学习去噪"| F["生成数据 x_0"]
    style A fill:#0c4a6e
    style B fill:#7f1d1d
    style F fill:#14532d
    style C fill:#7c2d12
    style D fill:#7c2d12
    style E fill:#7c2d12`,
            tip: "训练扩散模型时，余弦噪声调度（cosine schedule）比线性调度能产生更高质量的样本——因为它在低噪声区域（接近 x_0）分配了更多时间步",
            warning: "扩散模型的推理速度是最大瓶颈——标准 DDPM 需要 1000 步去噪，生成一张图可能需要数秒，不直接用于实时场景"
        },
        {
            title: "4. DDIM 加速采样：从马尔可夫到非马尔可夫",
            body: `DDIM（Denoising Diffusion Implicit Models，2020）是扩散模型加速采样的里程碑工作。DDPM 的采样必须逐步进行，因为每一步 x_{t-1} 依赖于 x_t 和预测的噪声——这是一个马尔可夫链。DDIM 的核心洞察是：扩散模型的训练目标只约束了边缘分布 q(x_t|x_0)，而没有约束条件分布 q(x_{t-1}|x_t, x_0)——这意味着存在无数个具有相同边缘分布但不同条件分布的扩散过程。DDIM 选择了一个确定性（非马尔可夫）的反向过程：给定 x_t 和预测的 x_0，x_{t-1} 被完全确定（不添加随机噪声），这使得反向过程变成了一个常微分方程（ODE）的离散化。确定性采样的关键优势在于：由于过程是确定性的，可以跳过中间步骤——从 1000 步直接跳到 100 步甚至更少，只需在时间序列上均匀采样子集即可。100 步 DDIM 采样的图像质量几乎与 1000 步 DDPM 相当，而速度提升 10 倍。DDIM 还引入了 eta 参数在确定性和随机性之间插值：eta=0 时完全确定性（DDIM），eta=1 时恢复 DDPM 的随机采样。DDIM 的另一个重要特性是「编码」能力——由于采样是确定性的，可以从真实图像反向编码到潜在空间（找到对应的初始噪声），这为图像编辑（如修改图像特定属性）提供了可能。`,
            code: [
                {
                    lang: "python",
                    code: `class DDIMSampler:
    """DDIM 确定性采样器"""
    def __init__(self, scheduler: LinearNoiseScheduler, model: nn.Module):
        self.scheduler = scheduler
        self.model = model

    @torch.no_grad()
    def sample(self, n_samples: int, shape: tuple, num_steps: int = 50,
               eta: float = 0.0, device: str = 'cpu') -> torch.Tensor:
        """
        DDIM 采样（支持加速）
        num_steps: 采样步数（可以远小于 scheduler.timesteps）
        eta: 随机性系数，0=确定性(DDIM)，1=随机(DDPM)
        """
        # 选择子序列（均匀间隔的时间步）
        timesteps = torch.linspace(
            self.scheduler.timesteps - 1, 0, num_steps, dtype=torch.long
        )
        timesteps_next = torch.cat([timesteps[1:], torch.tensor([-1])])

        x = torch.randn(n_samples, *shape, device=device)

        for i, (t, t_next) in enumerate(zip(timesteps, timesteps_next)):
            t_batch = torch.full((n_samples,), t, device=device, dtype=torch.long)

            # 预测噪声
            eps_pred = self.model(x, t_batch)

            # 从 x_t 和 eps_pred 恢复 x_0 预测
            alpha_bar_t = self.scheduler.alpha_bars[t]
            alpha_bar_next = self.scheduler.alpha_bars[t_next] if t_next >= 0 else torch.ones_like(alpha_bar_t)

            x0_pred = (x - torch.sqrt(1 - alpha_bar_t) * eps_pred) / torch.sqrt(alpha_bar_t)
            x0_pred = torch.clamp(x0_pred, -1.0, 1.0)  # 裁剪防止数值溢出

            if t_next < 0:
                # 最后一步：直接返回 x0_pred
                x = x0_pred
            else:
                # 方向指向 x0 的分量
                dir_xt = torch.sqrt(1 - alpha_bar_next - (eta ** 2) * (
                    (1 - alpha_bar_t) / alpha_bar_t
                )) * eps_pred
                # 随机分量（当 eta > 0 时）
                sigma = eta * torch.sqrt((1 - alpha_bar_t) / alpha_bar_t
                                         * (1 - alpha_bar_next) / (1 - alpha_bar_t))
                noise = torch.randn_like(x) if eta > 0 else 0

                x = torch.sqrt(alpha_bar_next) * x0_pred + dir_xt + sigma * noise

        return torch.clamp(x, -1.0, 1.0)

# 速度对比
for steps in [1000, 500, 100, 50, 25]:
    print(f"  DDIM {steps:>4} 步: {'~' * max(1, steps // 10)} ({1000/steps:.0f}x 加速)")`
                },
                {
                    lang: "python",
                    code: `"""DDIM 图像编码与编辑"""
class DDIMInversion:
    """DDIM 反向编码：从图像找到对应的初始噪声"""
    def __init__(self, scheduler: LinearNoiseScheduler, model: nn.Module):
        self.scheduler = scheduler
        self.model = model

    @torch.no_grad()
    def invert(self, x0: torch.Tensor, num_steps: int = 50) -> torch.Tensor:
        """将真实图像 x0 编码为初始噪声 x_T"""
        timesteps = torch.linspace(0, self.scheduler.timesteps - 1, num_steps, dtype=torch.long)
        timesteps_next = torch.cat([timesteps[:1] - 1, timesteps[:-1]])

        x = x0.clone()
        for t, t_next in zip(timesteps, timesteps_next):
            t_batch = torch.full((x0.size(0),), t, device=x0.device, dtype=torch.long)

            eps_pred = self.model(x, t_batch)
            alpha_bar_t = self.scheduler.alpha_bars[t]
            alpha_bar_next = self.scheduler.alpha_bars[t_next] if t_next >= 0 else torch.zeros_like(alpha_bar_t)

            # 反向 DDIM 步
            x0_pred = (x - torch.sqrt(1 - alpha_bar_t) * eps_pred) / torch.sqrt(alpha_bar_t)
            dir_xt = torch.sqrt(1 - alpha_bar_next) * eps_pred
            x = torch.sqrt(alpha_bar_next) * x0_pred + dir_xt

        return x

class ImageEditor:
    """基于 DDIM 的图像编辑器"""
    def __init__(self, sampler: DDIMSampler, inverter: DDIMInversion):
        self.sampler = sampler
        self.inverter = inverter

    def edit(self, image: torch.Tensor, edit_fn, num_steps: int = 50) -> torch.Tensor:
        """
        编辑图像：编码 → 编辑潜在空间 → 解码
        edit_fn: 对初始噪声 x_T 进行操作的函数
        """
        # 1. 编码到噪声空间
        x_T = self.inverter.invert(image, num_steps)
        # 2. 编辑噪声
        x_T_edited = edit_fn(x_T)
        # 3. 从编辑后的噪声重新采样
        # （注意：这里需要修改 sampler 从指定 x_T 开始）
        return self.sampler.sample_from_xt(x_T_edited, num_steps)`
                }
            ],
            table: {
                headers: ["采样方法", "步数", "FID (CelebA)", "每图耗时", "确定性", "可编码?"],
                rows: [
                    ["DDPM", "1000", "3.17", "~15s", "否", "否"],
                    ["DDPM", "100", "4.16", "~1.5s", "否", "否"],
                    ["DDIM", "100", "3.29", "~1.5s", "是", "是"],
                    ["DDIM", "50", "3.58", "~0.75s", "是", "是"],
                    ["DDIM", "25", "4.67", "~0.38s", "是", "是"],
                    ["DDIM", "10", "8.45", "~0.15s", "是", "是"]
                ]
            },
            mermaid: `graph LR
    A["真实图像 x_0"] -->|"DDIM 反向编码"| B["初始噪声 x_T"]
    B -->|"编辑操作"| C["编辑后噪声 x_T'"]
    C -->|"DDIM 正向采样"| D["编辑后图像 x_0'"]
    style A fill:#0c4a6e
    style B fill:#7c2d12
    style C fill:#7c2d12
    style D fill:#14532d`,
            tip: "DDIM 的 eta=0 确定性采样不仅速度快，还支持图像编辑——先编码再修改潜在空间再解码，是图像编辑的实用方案",
            warning: "DDIM 加速采样的步数不能无限减少——当步数低于 10 时，生成质量急剧下降，此时应考虑更高级的采样器（如 DPM-Solver）"
        },
        {
            title: "5. 评估指标：FID 与 Inception Score",
            body: `评估生成模型的质量是生成式 AI 中最大的挑战之一——不像分类任务有明确的准确率指标，生成模型需要从多个维度衡量。Inception Score（IS，2016）是第一个广泛使用的自动评估指标，它利用预训练的 Inception-v3 网络对生成图像进行分类，从两个维度评分：生成图像的清晰度（每张图像的条件分布 p(y|x) 的熵应很低，说明分类器对每张图都很确定）和生成图像的多样性（边缘分布 p(y) 的熵应很高，说明生成的类别分布均匀）。IS = exp(E_x[KL(p(y|x) || p(y))])。IS 的局限在于它只关注分类语义多样性，不评估图像的真实感——一张模糊但分类明确的图可能获得很高的 IS。FID（Fréchet Inception Distance，2017）是目前最主流的评估指标。它计算真实图像和生成图像在 Inception-v3 中间层特征空间中的 Fréchet 距离（即两个多元高斯分布之间的 Wasserstein-2 距离）。具体来说，分别计算真实集和生成集特征的均值和协方差，然后代入 FID 公式：FID = ||mu_r - mu_g||^2 + Tr(Sigma_r + Sigma_g - 2*sqrt(Sigma_r * Sigma_g))。FID 越低表示生成质量越好（0 表示完全一致），它同时评估了生成质量和多样性，且与人类主观评价高度相关。但 FID 也有局限：对样本量敏感（需要至少 10000 张图）、计算成本高、Inception 特征空间不一定覆盖所有图像类型（如非自然图像）。此外，Precision 和 Recall 指标被提出用于分别评估生成的「质量」和「多样性」——Precision 衡量生成样本中有多少是「真实」的（落在真实数据流形内），Recall 衡量真实数据流形中有多少被生成模型覆盖了。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import numpy as np
from scipy import linalg
from torchvision.models import inception_v3, Inception_V3_Weights
import torch.nn.functional as F

class FIDEvaluator:
    """Fréchet Inception Distance 评估器"""
    def __init__(self, device: str = 'cuda'):
        self.device = device
        # 使用 Inception-v3 的 pool3 层（2048 维特征）
        weights = Inception_V3_Weights.IMAGENET1K_V1
        model = inception_v3(weights=weights, transform_input=False)
        model.fc = nn.Identity()  # 去掉分类头
        model.aux_logits = False
        self.model = model.eval().to(device)

    @torch.no_grad()
    def extract_features(self, images: torch.Tensor) -> np.ndarray:
        """提取 Inception 特征"""
        # images: [N, 3, 299, 299], 范围 [0, 1]
        images = images.to(self.device)
        features = self.model(images)  # [N, 2048]
        return features.cpu().numpy()

    @staticmethod
    def calculate_fid(mu1: np.ndarray, sigma1: np.ndarray,
                      mu2: np.ndarray, sigma2: np.ndarray) -> float:
        """计算 Fréchet 距离"""
        diff = mu1 - mu2
        covmean, _ = linalg.sqrtm(sigma1 @ sigma2, disp=False)
        if np.iscomplexobj(covmean):
            covmean = covmean.real
        fid = diff.dot(diff) + np.trace(sigma1 + sigma2 - 2 * covmean)
        return max(0, fid)  # FID 不应为负

    def evaluate(self, real_images: torch.Tensor,
                 fake_images: torch.Tensor) -> float:
        """评估真实集和生成集的 FID"""
        real_feats = self.extract_features(real_images)
        fake_feats = self.extract_features(fake_images)

        mu_real, sigma_real = real_feats.mean(0), np.cov(real_feats, rowvar=False)
        mu_fake, sigma_fake = fake_feats.mean(0), np.cov(fake_feats, rowvar=False)

        return self.calculate_fid(mu_real, sigma_real, mu_fake, sigma_fake)`
                },
                {
                    lang: "python",
                    code: `"""Precision & Recall 评估"""
class PrecisionRecallEvaluator:
    """评估生成质量（Precision）和多样性（Recall）"""
    def __init__(self, device: str = 'cuda', k: int = 5):
        self.device = device
        self.k = k  # 最近邻数量

    @torch.no_grad()
    def extract_features(self, images: torch.Tensor) -> np.ndarray:
        """提取特征（简化为 Flattened 图像或预训练特征）"""
        return images.view(images.size(0), -1).cpu().numpy()

    def compute_precision_recall(self, real_feats: np.ndarray,
                                  fake_feats: np.ndarray) -> tuple:
        """
        Precision: 生成样本中落在真实数据流形内的比例
        Recall: 真实数据流形中被生成样本覆盖的比例
        """
        # 计算真实特征的 k-NN 半径
        from sklearn.neighbors import NearestNeighbors

        # 真实数据流形边界（用 k-NN 半径估计）
        nn_real = NearestNeighbors(n_neighbors=self.k).fit(real_feats)
        dists_real, _ = nn_real.kneighbors(real_feats)
        radii_real = dists_real[:, -1]  # 每个真实样本的 k-NN 半径

        # 生成数据流形边界
        nn_fake = NearestNeighbors(n_neighbors=self.k).fit(fake_feats)
        dists_fake, _ = nn_fake.kneighbors(fake_feats)
        radii_fake = dists_fake[:, -1]

        # Precision: 每个生成样本是否在真实流形内
        dists_fake_to_real, _ = nn_real.kneighbors(fake_feats)
        precision = np.mean(dists_fake_to_real[:, 0] < radii_real.min())

        # Recall: 每个真实样本是否在生成了流形内
        dists_real_to_fake, _ = nn_fake.kneighbors(real_feats)
        recall = np.mean(dists_real_to_fake[:, 0] < radii_fake.min())

        return float(precision), float(recall)

# 典型 FID 参考值
fid_benchmarks = {
    "StyleGAN2 (FFHQ 1024x1024)": 2.84,
    "StyleGAN3 (FFHQ 1024x1024)": 2.43,
    "Guided Diffusion (ImageNet 256x256)": 2.07,
    "DALL-E 2": 10.39,
    "Stable Diffusion v1.4": 9.63,
    "Stable Diffusion v2.1": 7.71,
    "SDXL 1.0": 6.64,
}

for model, fid in sorted(fid_benchmarks.items(), key=lambda x: x[1]):
    print(f"  {model:<45} FID: {fid:.2f}")`
                }
            ],
            table: {
                headers: ["评估指标", "评估维度", "值范围", "越?越好", "计算成本", "局限性"],
                rows: [
                    ["IS", "清晰度 + 多样性", "[1, ∞)", "越高越好", "低", "不评估真实感"],
                    ["FID", "分布距离", "[0, ∞)", "越低越好", "中", "依赖 Inception 特征"],
                    ["KID", "MMD 距离（无偏）", "[-1, 1]", "越低越好", "中", "需要大样本"],
                    ["Precision", "生成质量", "[0, 1]", "越高越好", "中", "只评估质量"],
                    ["Recall", "覆盖多样性", "[0, 1]", "越高越好", "中", "只评估多样性"],
                    ["CLIP Score", "图文一致性", "[0, ∞)", "越高越好", "低", "仅条件生成"]
                ]
            },
            mermaid: `graph TD
    A["生成模型评估"] --> B["分布相似度"]
    A --> C["感知质量"]
    A --> D["条件一致性"]
    B --> E["FID: 特征空间距离"]
    B --> F["KID: 最大均值差异"]
    C --> G["IS: 清晰度 + 多样性"]
    C --> H["Precision & Recall"]
    D --> I["CLIP Score: 图文匹配"]
    D --> J["人类评估：AMT"]
    style A fill:#0c4a6e
    style E fill:#14532d
    style G fill:#7c2d12`,
            tip: "FID 评估时，真实集和生成集的样本量都应至少 10000 张，否则 FID 值方差很大、不可靠；小样本评估时建议用 KID（Kernel Inception Distance），它是无偏估计",
            warning: "FID 不是绝对指标——不同论文报告的 FID 值可能因 Inception 模型版本、归一化方式、随机种子等而差异巨大，跨论文比较 FID 没有意义"
        },
        {
            title: "6. GAN vs Diffusion：两大范式全面对比",
            body: `GAN 和 Diffusion 代表了图像生成的两条截然不同的技术路线。GAN 的核心哲学是「对抗」——通过生成器和判别器的零和博弈，生成器学会产生判别器无法区分的假样本。这种对抗性训练的产物是「一次前向传播即可生成」的极致效率，但也带来了模式崩溃（Mode Collapse）、训练不稳定（震荡、发散）、评估困难（无显式损失）等顽疾。Diffusion 的核心哲学是「渐进」——通过马尔可夫链逐步加噪和去噪，将复杂的生成分解为许多简单步骤。每个步骤只需要学习「减少一点噪声」，这远比「一次性从噪声变成图像」容易。代价是采样需要数百到数千步迭代。从实践角度，两者的差异体现在：训练方面，Diffusion 的训练目标是一个简单的 MSE 损失，几乎不需要调参；GAN 需要精心设计学习率、正则化、架构，训练过程像走钢丝。质量方面，Diffusion 已经全面超越 GAN——在 ImageNet、COCO 等大规模数据集上，Diffusion 的 FID 显著更低，且没有模式崩溃问题。效率方面，GAN 生成一张图只需 1-10ms，Diffusion 即使经过加速也需要 100ms-数秒。可控性方面，两者都支持条件生成，但 Diffusion 的 Classifier-Free Guidance（CFG）机制更灵活——通过调整 guidance scale 可以在生成质量和多样性之间精细调节。应用场景的选择取决于需求：实时应用（视频游戏、AR）仍然依赖 GAN；对质量要求极高的场景（艺术创作、设计）选择 Diffusion；移动端部署目前 GAN 仍有优势。值得注意的是，两大范式正在融合——GAN 启发的对抗损失被引入 Diffusion 训练（GAN-DDPM），Diffusion 的渐进思想也被用于改进 GAN（Progressive GAN 的继承者）。`,
            code: [
                {
                    lang: "python",
                    code: `"""Classifier-Free Guidance (CFG)：Diffusion 的条件控制"""
class CFGDiffusionSampler:
    """带分类器自由引导的扩散模型采样器"""
    def __init__(self, model: nn.Module, scheduler: LinearNoiseScheduler):
        self.model = model  # 联合训练的条件/无条件模型
        self.scheduler = scheduler

    @torch.no_grad()
    def sample_cfg(self, n: int, shape: tuple, cond: torch.Tensor,
                   uncond: torch.Tensor, guidance_scale: float = 7.5,
                   num_steps: int = 50) -> torch.Tensor:
        """
        CFG 采样：同时运行条件和无条件前向传播
        guidance_scale: 越大 → 越忠于条件但质量可能下降
        典型值: 3-10（Stable Diffusion 默认 7.5）
        """
        timesteps = torch.linspace(
            self.scheduler.timesteps - 1, 0, num_steps, dtype=torch.long
        )
        timesteps_next = torch.cat([timesteps[1:], torch.tensor([-1])])

        x = torch.randn(n, *shape)

        for t, t_next in zip(timesteps, timesteps_next):
            t_batch = torch.full((n,), t, dtype=torch.long)

            # 条件预测
            eps_cond = self.model(x, t_batch, cond)
            # 无条件预测
            eps_uncond = self.model(x, t_batch, uncond)

            # CFG: 引导方向 = 无条件 + scale * (条件 - 无条件)
            eps_guided = eps_uncond + guidance_scale * (eps_cond - eps_uncond)

            # 使用 DDIM 更新
            alpha_bar_t = self.scheduler.alpha_bars[t]
            alpha_bar_next = self.scheduler.alpha_bars[t_next] if t_next >= 0 else torch.ones_like(alpha_bar_t)

            x0_pred = (x - torch.sqrt(1 - alpha_bar_t) * eps_guided) / torch.sqrt(alpha_bar_t)
            x0_pred = torch.clamp(x0_pred, -1.0, 1.0)

            if t_next >= 0:
                dir_xt = torch.sqrt(1 - alpha_bar_next) * eps_guided
                x = torch.sqrt(alpha_bar_next) * x0_pred + dir_xt
            else:
                x = x0_pred

        return torch.clamp(x, -1.0, 1.0)

# CFG scale 的影响
for scale in [1.0, 3.0, 5.0, 7.5, 10.0, 15.0]:
    quality = "低" if scale < 3 else "中" if scale < 7 else "高" if scale < 12 else "过饱和"
    diversity = "高" if scale < 5 else "中" if scale < 10 else "低"
    print(f"  CFG={scale:>4.1f}: 质量={quality:<6} 多样性={diversity}")`
                },
                {
                    lang: "python",
                    code: `"""GAN vs Diffusion 决策树"""
def choose_generative_model(requirements: dict) -> str:
    """根据需求选择生成模型"""
    if requirements.get("real_time", False):
        return "StyleGAN2/3 (GAN) —— 需要实时生成"

    if requirements.get("max_quality", False):
        if requirements.get("text_conditioned", False):
            return "Stable Diffusion / DALL-E 3 (Diffusion)"
        return "Guided Diffusion (Diffusion)"

    if requirements.get("mobile_deploy", False):
        return "MobileStyleGAN (轻量 GAN) —— 端侧部署"

    if requirements.get("image_editing", False):
        return "DDIM Inversion + Diffusion —— 支持编码编辑"

    if requirements.get("high_diversity", False):
        return "Diffusion —— 更好的模式覆盖"

    if requirements.get("training_ease", False):
        return "Diffusion —— 训练稳定，几乎无需调参"

    if requirements.get("deterministic_output", False):
        return "DDIM (eta=0) —— 确定性采样"

    return "StyleGAN3 (GAN) —— 均衡选择"

# 典型场景决策
scenarios = [
    {"name": "AI 绘画 App", "requirements": {"max_quality": True, "text_conditioned": True}},
    {"name": "游戏 NPC 头像", "requirements": {"real_time": True, "max_quality": False}},
    {"name": "移动端滤镜", "requirements": {"mobile_deploy": True}},
    {"name": "产品图修改", "requirements": {"image_editing": True}},
    {"name": "数据集增强", "requirements": {"high_diversity": True}},
]

for scenario in scenarios:
    choice = choose_generative_model(scenario["requirements"])
    print(f"  {scenario['name']:<15} → {choice}")`
                }
            ],
            table: {
                headers: ["对比维度", "GAN (StyleGAN3)", "Diffusion (SDXL)", "胜出方"],
                rows: [
                    ["训练稳定性", "不稳定，需大量调参", "稳定，MSE 损失", "Diffusion"],
                    ["图像质量 (FID)", "FID ~2.4 (FFHQ)", "FID ~3-10 (视模型)", "GAN (人脸) / Diffusion (通用)"],
                    ["生成速度", "1-10ms/张", "100ms-5s/张", "GAN"],
                    ["模式覆盖", "中等（有模式崩溃）", "极好", "Diffusion"],
                    ["条件生成", "支持（条件 GAN）", "CFG 机制，灵活", "Diffusion"],
                    ["图像编辑", "困难（单向映射）", "DDIM 编码+编辑", "Diffusion"],
                    ["移动端部署", "成熟（模型小）", "困难（模型大+多步）", "GAN"],
                    ["训练数据需求", "中等", "大规模数据效果好", "GAN (小数据)"],
                    ["理论基础", "博弈论（纳什均衡）", "非平衡热力学", "平局"],
                    ["社区生态", "成熟", "爆发增长", "Diffusion"]
                ]
            },
            mermaid: `graph TD
    A["选择生成模型"] --> B{"需要实时生成?"}
    B -->|是| C["GAN (StyleGAN)"]
    B -->|否| D{"需要最高质量?"}
    D -->|是| E["Diffusion (SDXL)"]
    D -->|否| F{"需要移动端?"}
    F -->|是| C
    F -->|否| G{"需要图像编辑?"}
    G -->|是| E
    G -->|否| H["GAN 或 Diffusion 均可"]
    style A fill:#0c4a6e
    style C fill:#7f1d1d
    style E fill:#14532d
    style H fill:#7c2d12`,
            tip: "实际项目中不要陷入「二选一」的思维陷阱——可以组合使用：用 Diffusion 做粗生成，用 GAN 做精修（Refinement），结合两者优势",
            warning: "CFG scale 不是越大越好——超过 15 会导致图像过饱和、颜色失真、出现 artifacts，Stable Diffusion 的推荐范围是 5-10"
        },
        {
            title: "7. PyTorch 实战：训练简单扩散模型",
            body: `理论终需落地为代码。本节从零实现一个完整的扩散模型训练流程，包括：噪声调度器、U-Net 去噪网络、训练循环、采样器，以及可视化生成结果。虽然这是一个简化版本（在 MNIST 数据集上训练），但涵盖了扩散模型的所有核心组件。理解了这个简化实现后，你可以轻松地扩展到更复杂的数据集（如 CIFAR-10、CelebA）和更复杂的架构（如引入 Attention 的 U-Net、条件扩散模型）。训练扩散模型的关键细节：（1）时间嵌入必须足够丰富——正弦位置编码或 learnable embedding 都能工作，但前者在训练数据范围外的时间步有更好的泛化性；（2）U-Net 中的跳跃连接（Skip Connections）至关重要——它们让网络在去噪时保留输入的结构信息，避免信息在深层网络中丢失；（3）EMA（指数移动平均）权重在采样时使用，可以显著提升生成质量——EMA 权重是训练过程中所有历史权重的平滑平均，相当于一个隐式的模型集成；（4）学习率预热（Warmup）有助于训练初期的稳定性——前 5000 步线性增加学习率到目标值，然后保持不变或使用余弦衰减。`,
            code: [
                {
                    lang: "python",
                    code: `"""完整扩散模型训练 Pipeline"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.utils import save_image
import math

class SinusoidalTimeEmbedding(nn.Module):
    """正弦位置编码时间嵌入"""
    def __init__(self, dim: int):
        super().__init__()
        self.dim = dim

    def forward(self, t: torch.Tensor) -> torch.Tensor:
        half_dim = self.dim // 2
        embeddings = math.log(10000.0) / (half_dim - 1)
        embeddings = torch.exp(torch.arange(half_dim, device=t.device) * -embeddings)
        embeddings = t.float().unsqueeze(-1) * embeddings.unsqueeze(0)
        embeddings = torch.cat([embeddings.sin(), embeddings.cos()], dim=-1)
        return embeddings

class SimpleDiffusionModel(nn.Module):
    """简化扩散模型 U-Net"""
    def __init__(self, img_size: int = 28, channels: int = 1, hidden_dim: int = 128):
        super().__init__()
        self.time_embed = SinusoidalTimeEmbedding(hidden_dim * 4)
        self.time_mlp = nn.Sequential(
            nn.Linear(hidden_dim * 4, hidden_dim * 4),
            nn.SiLU(),
            nn.Linear(hidden_dim * 4, hidden_dim * 4),
        )

        # 编码器
        self.down1 = nn.Conv2d(channels, hidden_dim, 3, padding=1)
        self.down2 = nn.Conv2d(hidden_dim, hidden_dim * 2, 4, 2, 1)
        self.down3 = nn.Conv2d(hidden_dim * 2, hidden_dim * 4, 4, 2, 1)

        # 中间层
        self.mid = nn.Sequential(
            nn.Conv2d(hidden_dim * 4, hidden_dim * 4, 3, padding=1),
            nn.SiLU(),
            nn.Conv2d(hidden_dim * 4, hidden_dim * 4, 3, padding=1),
        )

        # 解码器
        self.up1 = nn.ConvTranspose2d(hidden_dim * 4, hidden_dim * 2, 4, 2, 1)
        self.up2 = nn.ConvTranspose2d(hidden_dim * 2, hidden_dim, 4, 2, 1)
        self.up3 = nn.Conv2d(hidden_dim, channels, 3, padding=1)

    def forward(self, x: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
        t_emb = self.time_mlp(self.time_embed(t))
        t_emb = t_emb.unsqueeze(-1).unsqueeze(-1)

        d1 = F.silu(self.down1(x) + t_emb)
        d2 = F.silu(self.down2(d1) + t_emb)
        d3 = F.silu(self.down3(d2) + t_emb)
        m = self.mid(d3)
        u1 = F.silu(self.up1(m) + d2 + t_emb)
        u2 = F.silu(self.up2(u1) + d1 + t_emb)
        return self.up3(u2)`
                },
                {
                    lang: "python",
                    code: `"""训练与采样主循环"""
def train_diffusion_mnist(epochs: int = 50, batch_size: int = 128):
    """在 MNIST 上训练扩散模型"""
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    scheduler = LinearNoiseScheduler(timesteps=1000)
    model = SimpleDiffusionModel().to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)

    # EMA 权重（用于采样）
    ema_model = SimpleDiffusionModel().to(device)
    ema_model.load_state_dict(model.state_dict())
    ema_decay = 0.995

    # 数据
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,)),  # 归一化到 [-1, 1]
    ])
    dataset = datasets.MNIST('./data', train=True, download=True, transform=transform)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    for epoch in range(epochs):
        model.train()
        total_loss = 0
        for x0, _ in loader:
            x0 = x0.to(device)
            t = torch.randint(0, scheduler.timesteps, (x0.size(0),), device=device)

            # 前向加噪
            x_t, noise = scheduler.add_noise(x0, t)

            # 预测噪声
            pred_noise = model(x_t, t)
            loss = F.mse_loss(pred_noise, noise)

            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            # EMA 更新
            for ema_p, p in zip(ema_model.parameters(), model.parameters()):
                ema_p.data = ema_decay * ema_p.data + (1 - ema_decay) * p.data

            total_loss += loss.item()

        print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(loader):.6f}")

        # 每个 epoch 采样一张图看看进展
        if (epoch + 1) % 5 == 0:
            sampler = DDIMSampler(scheduler, ema_model)
            samples = sampler.sample(16, (1, 28, 28), num_steps=50, device=device)
            save_image((samples + 1) / 2, f'samples_epoch_{epoch+1}.png', nrow=4)

    torch.save(ema_model.state_dict(), 'diffusion_mnist_ema.pt')
    print("训练完成！模型已保存。")

# 推理：加载训练好的模型生成图像
def generate_samples(model_path: str = 'diffusion_mnist_ema.pt', n: int = 16):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    scheduler = LinearNoiseScheduler(timesteps=1000)
    model = SimpleDiffusionModel().to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    sampler = DDIMSampler(scheduler, model)
    samples = sampler.sample(n, (1, 28, 28), num_steps=50, device=device)
    save_image((samples + 1) / 2, 'generated.png', nrow=4)
    print(f"已生成 {n} 张样本 → generated.png")`
                }
            ],
            table: {
                headers: ["训练超参数", "推荐值", "说明"],
                rows: [
                    ["学习率", "2e-4 ~ 3e-4", "AdamW，比 Adam 更稳定"],
                    ["Batch Size", "64 ~ 256", "越大越稳定，受显存限制"],
                    ["时间步 T", "1000", "训练用 1000，推理可用更少"],
                    ["梯度裁剪", "1.0", "防止梯度爆炸"],
                    ["EMA Decay", "0.995 ~ 0.9999", "采样时使用 EMA 权重"],
                    ["Warmup", "5000 步", "学习率从 0 线性增加到目标值"],
                    ["噪声调度", "余弦", "比线性调度生成质量更高"],
                    ["优化器", "AdamW", "权重衰减 0.01"],
                    ["Epoch", "50 ~ 200", "MNIST 50 足够，ImageNet 需要更多"]
                ]
            },
            mermaid: `graph TD
    A["开始训练"] --> B["加载 MNIST 数据集"]
    B --> C["初始化 U-Net 模型"]
    C --> D["训练循环"]
    D --> E["随机采样时间步 t"]
    E --> F["前向加噪 x_t = sqrt(alpha_bar)*x_0 + noise"]
    F --> G["U-Net 预测噪声 epsilon_theta(x_t, t)"]
    G --> H["MSE Loss: ||epsilon - epsilon_theta||^2"]
    H --> I["反向传播 + 梯度裁剪"]
    I --> J["EMA 权重更新"]
    J --> K{"所有 epoch 完成?"}
    K -->|否| D
    K -->|是| L["保存 EMA 模型权重"]
    L --> M["DDIM 采样生成图像"]
    M --> N["保存生成结果"]
    style A fill:#0c4a6e
    style L fill:#7c2d12
    style N fill:#14532d`,
            tip: "训练扩散模型时强烈建议使用 EMA 权重——即使训练损失已经收敛，EMA 权重的生成质量通常比最新训练权重高 10-20%（FID 指标）",
            warning: "不要在扩散模型训练中用太大的学习率（>1e-3）——虽然 MSE 损失看起来稳定，但生成质量会显著下降，因为模型会学到退化解（预测零噪声）"
        },
    ],
};
