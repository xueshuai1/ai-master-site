import { Article } from '../knowledge';

export const article: Article = {
  id: "dl-005",
  title: "GAN 生成对抗网络原理与应用",
  category: "dl",
  tags: ["GAN", "生成模型", "图像生成"],
  summary: "从原始 GAN 到 StyleGAN，探索生成对抗网络的发展脉络",
  date: "2026-03-25",
  readTime: "16 min",
  level: "进阶",
  content: [
    {
      title: "1. GAN 的核心思想：一场生成器与判别器的博弈",
      body: `GAN（Generative Adversarial Network，生成对抗网络）由 Ian Goodfellow 于 2014 年提出，是深度学习领域最具创意的架构之一。它的核心思想来源于博弈论中的二人零和博弈：一个生成器（Generator）试图"造假"，一个判别器（Discriminator）试图"识破"，两者在对抗中共同进步。

生成器 G 接收随机噪声 z（通常从标准正态分布或均匀分布中采样），输出一个"假"样本 G(z)。判别器 D 接收一个样本 x（可能是真实的，也可能是 G 生成的），输出一个 0 到 1 之间的概率值，表示该样本是真实数据的概率。

训练的目标函数是一个极小极大博弈（Minimax Game）：

min_G max_D V(D, G) = E_{x~p_data}[log D(x)] + E_{z~p_z}[log(1 - D(G(z)))]

这个目标函数有两项：第一项鼓励判别器正确识别真实样本（D(x) 趋近 1），第二项鼓励判别器正确识别假样本（D(G(z)) 趋近 0），同时生成器试图让 D(G(z)) 趋近 1——也就是说，生成的假样本骗过判别器。

不要被"简单"的对抗框架迷惑——GAN 的理论深度远超表面。它隐式地学习数据分布，不需要显式地定义概率密度函数，这使它成为最通用的生成模型之一。`,
      mermaid: `graph LR
    A["随机噪声 z"] --> B["生成器 G"]
    B --> C["假样本 G(z)"]
    D["真实数据 x"] --> E["判别器 D"]
    C --> E
    E --> F["0 到 1 的概率"]
    F -.->|训练信号| B
    F -.->|训练信号| E`,
      tip: "理解 GAN 最好的方式是从直觉出发：想象一个假币制造者（生成器）和一个验钞员（判别器）。假币越来越真，验钞员越来越精，最终假币几乎无法区分。",
      warning: "GAN 训练极不稳定！生成器和判别器必须保持"势均力敌"。如果判别器太强，生成器的梯度消失（log(1-D(G(z))) 饱和）；如果判别器太弱，生成器得不到有效反馈。",
    },
    {
      title: "2. 原始 GAN 的理论推导与训练困境",
      body: `Goodfellow 在 2014 年论文中证明了当判别器达到最优时，生成器的最优解满足 p_g = p_data，即生成分布等于真实分布。

在最优判别器 D*(x) = p_data(x) / (p_data(x) + p_g(x)) 下，生成器的目标函数等价于最小化真实分布与生成分布之间的 Jensen-Shannon 散度（JS 散度）：

C(G) = -log(4) + 2 · JS(p_data || p_g)

JS 散度衡量两个分布的"重叠程度"。当两个分布完全不重叠时，JS 散度恒为 log(2)，梯度为 0——这就是 GAN 训练不稳定的根本原因。在高维空间中，真实数据分布和生成分布几乎不可能重叠（它们都位于低维流形上），所以判别器可以轻松区分两者，生成器得不到有效梯度。

此外，GAN 还面临模式崩溃（Mode Collapse）问题：生成器发现某些样本能"骗过"判别器后，就反复生成这些样本，忽略了数据分布的其他模式。`,
      code: [
        {
          lang: "python",
          code: `import torch
import torch.nn as nn

# 生成器
class Generator(nn.Module):
    def __init__(self, latent_dim=100, img_shape=(1, 28, 28)):
        super().__init__()
        self.model = nn.Sequential(
            nn.Linear(latent_dim, 256),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(256, 512),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(512, 1024),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(1024, int(torch.prod(torch.tensor(img_shape)))),
            nn.Tanh()  # 输出归一化到 [-1, 1]
        )

    def forward(self, z):
        img = self.model(z)
        return img.view(img.size(0), *img_shape)

# 判别器
class Discriminator(nn.Module):
    def __init__(self, img_shape=(1, 28, 28)):
        super().__init__()
        self.model = nn.Sequential(
            nn.Linear(int(torch.prod(torch.tensor(img_shape))), 512),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(512, 256),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(256, 1),
            nn.Sigmoid()  # 输出 0-1 概率
        )

    def forward(self, img):
        img_flat = img.view(img.size(0), -1)
        return self.model(img_flat)`,
        },
      ],
      table: {
        headers: ["问题", "原因", "表现", "解决方案"],
        rows: [
          ["梯度消失", "判别器过强，JS散度饱和", "生成器loss不变", "WGAN梯度惩罚"],
          ["模式崩溃", "生成器找到少数"欺骗"模式", "生成样本单一", "Mini-batch判别"],
          ["训练震荡", "两者无法达到纳什均衡", "loss剧烈波动", "学习率衰减"],
        ],
      },
    },
    {
      title: "3. DCGAN：深度卷积生成对抗网络",
      body: `2015 年 Radford 等人提出的 DCGAN（Deep Convolutional GAN）是第一个将卷积神经网络成功应用于 GAN 的工作。它用卷积层替代了原始 GAN 的全连接层，显著提升了生成图像的质量。

DCGAN 总结了 5 条关键架构规则：
1. 用跨步卷积（Strided Convolution）替代池化层进行下采样（判别器）和上采样（生成器）
2. 生成器和判别器中使用 Batch Normalization 稳定训练
3. 去除全连接层，使用全局池化
4. 生成器使用 ReLU 激活（最后一层用 Tanh）
5. 判别器使用 LeakyReLU（α=0.2）

生成器的架构是"反卷积"结构：从低维潜在向量开始，通过一系列转置卷积（Transposed Convolution）逐步上采样到目标分辨率。判别器则是标准卷积分类器。`,
      code: [
        {
          lang: "python",
          code: `# DCGAN 生成器（转置卷积上采样）
class DCGANGenerator(nn.Module):
    def __init__(self, latent_dim=100, ngf=64, nc=3):
        super().__init__()
        self.main = nn.Sequential(
            # 输入: z (latent_dim x 1 x 1)
            nn.ConvTranspose2d(latent_dim, ngf * 8, 4, 1, 0, bias=False),
            nn.BatchNorm2d(ngf * 8),
            nn.ReLU(True),
            # 状态: ngf*8 x 4 x 4
            nn.ConvTranspose2d(ngf * 8, ngf * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 4),
            nn.ReLU(True),
            # 状态: ngf*4 x 8 x 8
            nn.ConvTranspose2d(ngf * 4, ngf * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 2),
            nn.ReLU(True),
            # 状态: ngf*2 x 16 x 16
            nn.ConvTranspose2d(ngf * 2, ngf, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf),
            nn.ReLU(True),
            # 状态: ngf x 32 x 32
            nn.ConvTranspose2d(ngf, nc, 4, 2, 1, bias=False),
            nn.Tanh()
            # 输出: nc x 64 x 64
        )

    def forward(self, x):
        return self.main(x)`,
        },
      ],
      table: {
        headers: ["组件", "原始GAN", "DCGAN", "改进"],
        rows: [
          ["层类型", "全连接", "卷积/转置卷积", "利用空间结构"],
          ["归一化", "无", "BatchNorm", "稳定训练"],
          ["激活(生成器)", "tanh/ReLU", "ReLU+Tanh", "更好的梯度流"],
          ["激活(判别器)", "sigmoid", "LeakyReLU", "避免梯度消失"],
        ],
      },
      mermaid: `graph TD
    A["DCGAN架构"] --> B["生成器: 转置卷积上采样"]
    A --> C["判别器: 卷积下采样"]
    B --> D["z→4x4→8x8→16x16→32x32→64x64"]
    C --> E["64x64→32x32→16x16→8x8→4x4→1"]
    D --> F["BatchNorm + ReLU"]
    E --> G["BatchNorm + LeakyReLU"]`,
    },
    {
      title: "4. WGAN：Wasserstein 距离的革命",
      body: `2017 年 Arjovsky 等人提出的 WGAN（Wasserstein GAN）从理论上解决了原始 GAN 训练不稳定的问题。核心思想是用 Wasserstein 距离（也称 Earth Mover 距离，推土机距离）替代 JS 散度。

Wasserstein 距离的定义：W(p_r, p_g) = inf_{γ∈Π(p_r,p_g)} E_{(x,y)~γ}[||x-y||]

直观理解：把 p_r 分布的"土"推到 p_g 分布的位置，最小的"工作量"就是 Wasserstein 距离。即使两个分布不重叠，Wasserstein 距离仍然能提供有意义的梯度——这正是 JS 散度做不到的。

WGAN 的关键改动：
1. 判别器改为"评论家"（Critic），去掉 Sigmoid 输出
2. 权重裁剪（Weight Clipping）保证 Lipschitz 连续性
3. 生成器目标改为 -E[D(G(z))]，最大化 critic 对假样本的评分

后续改进 WGAN-GP 用梯度惩罚替代权重裁剪，避免了权重裁剪导致的容量浪费和梯度爆炸问题。`,
      code: [
        {
          lang: "python",
          code: `# WGAN-GP 梯度惩罚
def gradient_penalty(critic, real_samples, fake_samples, device):
    """计算梯度惩罚项，确保 1-Lipschitz 约束"""
    batch_size = real_samples.size(0)
    # 在真实和假样本之间随机插值
    alpha = torch.rand(batch_size, 1, 1, 1, device=device)
    interpolated = alpha * real_samples + (1 - alpha) * fake_samples
    interpolated.requires_grad_(True)

    # 计算插值样本的 critic 输出
    d_interpolated = critic(interpolated)
    
    # 计算梯度
    gradients = torch.autograd.grad(
        outputs=d_interpolated,
        inputs=interpolated,
        grad_outputs=torch.ones_like(d_interpolated),
        create_graph=True,
        retain_graph=True,
    )[0]

    gradients = gradients.view(batch_size, -1)
    gradient_norm = gradients.norm(2, dim=1)
    # 惩罚偏离 1 的梯度范数
    penalty = ((gradient_norm - 1) ** 2).mean()
    return penalty

# Critic loss
critic_loss_real = -torch.mean(critic(real_samples))
critic_loss_fake = torch.mean(critic(fake_samples))
gp = gradient_penalty(critic, real_samples, fake_samples, device)
critic_total_loss = critic_loss_real + critic_loss_fake + 10 * gp`,
        },
      ],
      table: {
        headers: ["指标", "原始GAN", "WGAN", "WGAN-GP"],
        rows: [
          ["距离度量", "JS散度", "Wasserstein", "Wasserstein+GP"],
          ["判别器输出", "Sigmoid(0-1)", "线性(任意值)", "线性(任意值)"],
          ["训练稳定性", "❌ 差", "✅ 较好", "✅ 好"],
          ["模式崩溃", "严重", "减轻", "显著减轻"],
          ["Loss含义", "无意义", "≈ Wasserstein距离", "≈ Wasserstein距离"],
        ],
      },
      warning: "WGAN-GP 的梯度惩罚系数 λ 很关键，通常设为 10。太小则 Lipschitz 约束不足，太大则训练变慢。权重裁剪版本（原始 WGAN）的裁剪值通常在 ±0.01 之间。",
    },
    {
      title: "5. StyleGAN：高质量人脸合成的王者",
      body: `NVIDIA 的 StyleGAN（2018）和 StyleGAN2（2019）在人脸合成领域达到了前所未有的质量。StyleGAN 的核心创新是引入了"风格控制"机制，使得不同层级的生成器可以控制不同尺度的图像特征。

StyleGAN 的架构创新：
1. 映射网络（Mapping Network）：将潜在空间 z 映射到中间空间 W，解耦潜在变量
2. AdaIN（Adaptive Instance Normalization）：用 W 空间的风格向量控制每个卷积层的均值和方差
3. 噪声注入：在每一层添加随机噪声，控制细粒度细节（发丝、皮肤纹理）
4. 混合正则化（Style Mixing）：训练时对不同层级使用不同的风格向量

StyleGAN2 进一步改进了权重解归一化和路径长度正则化，解决了 StyleGAN 中的"水滴"伪影问题。`,
      code: [
        {
          lang: "python",
          code: `# AdaIN（自适应实例归一化）
class AdaIN(nn.Module):
    """自适应实例归一化：用风格参数控制特征的均值和方差"""
    def __init__(self, num_features):
        super().__init__()
        self.num_features = num_features
    
    def forward(self, x, style):
        # style: [batch, num_features*2]
        # 前半部分是缩放因子 gamma，后半部分是偏移 beta
        gamma = style[:, :self.num_features].unsqueeze(-1).unsqueeze(-1)
        beta = style[:, self.num_features:].unsqueeze(-1).unsqueeze(-1)
        
        # 归一化
        mean = x.mean(dim=[2, 3], keepdim=True)
        std = x.std(dim=[2, 3], keepdim=True)
        x_normalized = (x - mean) / (std + 1e-8)
        
        # 应用风格
        return gamma * x_normalized + beta`,
        },
      ],
      mermaid: `graph LR
    A["随机 z"] --> B["映射网络 f"]
    B --> C["风格向量 w"]
    C --> D["AdaIN 层"]
    D --> E["卷积层"]
    E --> F["上采样"]
    G["随机噪声"] --> D
    F --> H["生成图像"]`,
      table: {
        headers: ["层级", "控制内容", "StyleGAN操作"],
        rows: [
          ["粗粒度(4x4-8x8)", "姿势、脸型、发型", "风格向量控制全局结构"],
          ["中粒度(16x16-32x32)", "五官位置、眼睛形状", "AdaIN控制特征位置"],
          ["细粒度(64x64+)", "颜色、纹理、细节", "AdaIN+噪声控制精细特征"],
        ],
      },
    },
    {
      title: "6. CycleGAN：无配对数据的图像到图像翻译",
      body: `CycleGAN（2017）解决了一个极具实用价值的问题：如何在没有配对训练数据的情况下，将一个域的图像转换到另一个域？

例如：把马变成斑马、把夏天风景变成冬天、把照片变成莫奈风格的画。这些任务无法获取配对数据（同一场景的马和斑马照片），传统的 pix2pix 方法无法使用。

CycleGAN 的核心是循环一致性损失（Cycle Consistency Loss）：

L_cyc = E[||G_BA(G_AB(x)) - x||] + E[||G_AB(G_BA(y)) - y||]

其中 G_AB 是从域 A 到域 B 的生成器，G_BA 是从域 B 到域 A 的生成器。循环一致性要求：A→B→A 应该回到原始输入 A，B→A→B 应该回到原始输入 B。

总损失 = 对抗损失（两个方向）+ λ·循环一致性损失，通常 λ=10。`,
      code: [
        {
          lang: "python",
          code: `# CycleGAN 循环一致性损失
class CycleGANGenerator(nn.Module):
    """基于 ResNet 的生成器"""
    def __init__(self, input_nc=3, output_nc=3, ngf=64, n_blocks=9):
        super().__init__()
        model = [
            nn.ReflectionPad2d(3),
            nn.Conv2d(input_nc, ngf, 7, padding=0),
            nn.InstanceNorm2d(ngf),
            nn.ReLU(True),
        ]
        # 下采样
        for i in range(2):
            mult = 2 ** i
            model += [
                nn.Conv2d(ngf * mult, ngf * mult * 2, 3, 2, 1),
                nn.InstanceNorm2d(ngf * mult * 2),
                nn.ReLU(True),
            ]
        # ResNet blocks
        mult = 2 ** 2
        for _ in range(n_blocks):
            model += [ResnetBlock(ngf * mult)]
        # 上采样
        for i in range(2):
            mult = 2 ** (2 - i)
            model += [
                nn.ConvTranspose2d(ngf * mult, ngf * mult // 2, 3, 2, 1, output_padding=1),
                nn.InstanceNorm2d(ngf * mult // 2),
                nn.ReLU(True),
            ]
        model += [nn.ReflectionPad2d(3), nn.Conv2d(ngf, output_nc, 7), nn.Tanh()]
        self.model = nn.Sequential(*model)

    def forward(self, x):
        return self.model(x)

# 循环一致性
fake_B = G_AB(real_A)
recovered_A = G_BA(fake_B)
cycle_loss = F.l1_loss(recovered_A, real_A) * lambda_A`,
        },
      ],
      table: {
        headers: ["方法", "需要配对数据", "架构", "典型应用"],
        rows: [
          ["pix2pix", "✅ 需要", "U-Net + PatchGAN", "边缘→照片、灰度→彩色"],
          ["CycleGAN", "❌ 不需要", "双生成器+循环", "马↔斑马、夏天↔冬天"],
          ["StarGAN", "❌ 不需要", "单生成器多域", "多域风格迁移"],
        ],
      },
    },
    {
      title: "7. GAN 评估指标与现代应用",
      body: `如何评估 GAN 生成的图像质量？这是 GAN 研究中最具挑战性的问题之一。

FID（Fréchet Inception Distance）是目前最常用的评估指标。它假设真实图像和生成图像在 Inception-V3 特征空间中都服从高斯分布，然后计算两个高斯分布之间的 Fréchet 距离：

FID = ||μ_r - μ_g||² + Tr(Σ_r + Σ_g - 2(Σ_r · Σ_g)^{1/2})

FID 越小越好，0 表示完美匹配。StyleGAN2 在 FFHQ 数据集上的 FID 约为 2.84，远超原始 GAN。

IS（Inception Score）评估生成图像的"质量"和"多样性"：它用预训练的 Inception-V3 对生成图像分类，好的 GAN 应该对每张图像输出高置信度的类别预测（质量好），且不同图像的预测类别分布均匀（多样）。

现代 GAN 应用包括：超分辨率（SRGAN）、图像修复（Fill-in）、数据增强（生成稀有类别样本）、文本到图像生成（DALL-E 虽用扩散模型，但早期工作基于 GAN）、视频生成等。`,
      code: [
        {
          lang: "python",
          code: `# 计算 FID 分数
from scipy.linalg import sqrtm
import numpy as np

def calculate_fid(mu_real, sigma_real, mu_fake, sigma_fake):
    """
    计算 Fréchet Inception Distance
    mu_real, sigma_real: 真实图像特征的均值和协方差
    mu_fake, sigma_fake: 生成图像特征的均值和协方差
    """
    # 均值差异
    ssdiff = np.sum((mu_real - mu_fake) ** 2)
    # 协方差平方根
    covmean = sqrtm(sigma_real @ sigma_fake)
    if np.iscomplexobj(covmean):
        covmean = covmean.real
    # FID
    fid = ssdiff + np.trace(sigma_real + sigma_fake - 2 * covmean)
    return fid

# 示例
mu_real, sigma_real = np.random.randn(2048), np.eye(2048) * 0.1
mu_fake, sigma_fake = np.random.randn(2048), np.eye(2048) * 0.15
print(f"FID: {calculate_fid(mu_real, sigma_real, mu_fake, sigma_fake):.2f}")`,
        },
      ],
      tip: "评估 GAN 时，FID 比 IS 更可靠。IS 容易被"欺骗"（生成器只需学会产生多样但模糊的图像），而 FID 直接比较真实和生成特征的分布差异。",
      warning: "GAN 生成的内容可能被用于 Deepfake 等不当用途。使用 GAN 技术时必须遵守伦理和法律规范，特别是涉及人脸生成的场景。",
    },
  ],
};
