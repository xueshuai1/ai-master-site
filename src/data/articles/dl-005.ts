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
            title: "1. GAN 的核心思想：生成器 vs 判别器",
            body: `GAN（Generative Adversarial Network）由 Ian Goodfellow 于 2014 年提出，其核心灵感来自博弈论中的二人零和博弈。网络由两个模块组成：生成器 G 和 判别器 D。

生成器 G 接收随机噪声 z ~ p_z(z) 作为输入，输出生成样本 G(z)，目标是让生成样本尽可能接近真实数据分布 p_data。判别器 D 接收样本 x，输出 D(x) ∈ [0,1]，表示 x 来自真实数据的概率。

**两者形成对抗关系**：G 试图"骗过" D，D 试图"识破" G。在数学上，这是一个极小极大博弈过程：

min_G max_D V(D, G) = E_{x~p_data}[log D(x)] + E_{z~p_z}[log(1 - D(G(z)))]

当训练达到理想状态时，系统趋于纳什均衡（Nash Equilibrium）：G 完美复现了真实数据分布，D 对所有输入都输出 0.5（完全无法区分真假）。此时 G(z) ~ p_data，生成器可以产生任意逼真的样本。

这种"对抗学习"的范式跳出了传统生成模型（如 VAE）最大化似然的思路，通过隐式地建模数据分布，能够产生更锐利、更高质量的生成结果。`,
            code: [{ lang: "python", code: `import torch
import torch.nn as nn

class SimpleGenerator(nn.Module):
    """生成器：将噪声映射到数据空间"""
    def __init__(self, latent_dim=100, output_dim=784):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(latent_dim, 256),
            nn.LeakyReLU(0.2),
            nn.Linear(256, 512),
            nn.LeakyReLU(0.2),
            nn.Linear(512, output_dim),
            nn.Tanh()  # 输出归一化到 [-1, 1]
        )

    def forward(self, z):
        return self.net(z)

class SimpleDiscriminator(nn.Module):
    """判别器：判断样本真假"""
    def __init__(self, input_dim=784):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.LeakyReLU(0.2),
            nn.Linear(512, 256),
            nn.LeakyReLU(0.2),
            nn.Linear(256, 1),
            nn.Sigmoid()  # 输出概率
        )

    def forward(self, x):
        return self.net(x)` }],
            table: {
                headers: ["组件", "输入", "输出", "目标"],
                rows: [
                    ["生成器 G", "随机噪声 z", "假样本 G(z)", "骗过判别器 D"],
                    ["判别器 D", "真实/假样本 x", "概率 D(x)", "准确区分真假"],
                    ["纳什均衡", "G* 完美生成", "D*(x) = 0.5", "双方都无法再改进"],
                ]
            },
            mermaid: `graph LR
  Z["随机噪声 z"] --> G["生成器 G"]
  G --> Gz["假样本 G(z)"]
  R["真实数据 x"] --> D["判别器 D"]
  Gz --> D
  D --> OUT["D(x) vs D(G(z))"]`,
            tip: "理解 GAN 的关键：把它想象一个造伪币者（G）和验钞员（D）的较量。随着验钞员越来越厉害，造伪币者也不得不提升技术，最终造出肉眼无法分辨的假币。",
            warning: "GAN 的训练没有全局损失函数可以监控，G 和 D 的 loss 并不能直接反映生成质量。不要像监督学习那样只看 loss 来判断模型好坏。",
        },
        {
            title: "2. 原始 GAN 理论：JS 散度与极小极大博弈",
            body: `原始 GAN 的目标函数可以写成：

V(D, G) = E_{x~p_data}[log D(x)] + E_{z~p_z}[log(1 - D(G(z)))]

当 D 达到最优时，可以推导出 D*(x) = p_data(x) / (p_data(x) + p_g(x))，其中 p_g 是生成数据的分布。代入目标函数后得到：

C(G) = max_D V(D,G) = -log(4) + 2 · JS(p_data || p_g)

其中 JS 散度（Jensen-Shannon Divergence）定义为：
JS(P || Q) = ½ KL(P || M) + ½ KL(Q || M)，其中 M = ½(P + Q)

这意味着优化生成器等价于最小化真实分布与生成分布之间的 JS 散度。

然而，JS 散度有一个致命缺陷：当两个分布几乎没有重叠时（高维空间中常见），JS 散度恒为 log(2)，梯度为零。这导致生成器无法获得有效梯度信号，训练陷入停滞——这就是原始 GAN 训练不稳定的根本原因之一。

此外，极小极大博弈本身也不容易优化。交替更新 D 和 G 时，如果 D 训练过度（太准确），梯度消失；如果 D 训练不足，G 收到的梯度无意义。这种微妙的平衡是 GAN 难以训练的核心挑战。`,
            code: [{ lang: "python", code: `def train_gan_step(G, D, real_data, latent_dim, device):
    """原始 GAN 的一次训练迭代"""
    batch_size = real_data.size(0)

    # ===== 1. 训练判别器 D =====
    real_labels = torch.ones(batch_size, 1, device=device)
    fake_labels = torch.zeros(batch_size, 1, device=device)

    # 真实样本的损失
    real_output = D(real_data)
    d_loss_real = nn.BCELoss()(real_output, real_labels)

    # 假样本的损失
    z = torch.randn(batch_size, latent_dim, device=device)
    fake_data = G(z).detach()  # 不计算 G 的梯度
    fake_output = D(fake_data)
    d_loss_fake = nn.BCELoss()(fake_output, fake_labels)

    d_loss = d_loss_real + d_loss_fake
    d_loss.backward()

    # ===== 2. 训练生成器 G =====
    z = torch.randn(batch_size, latent_dim, device=device)
    fake_data = G(z)
    fake_output = D(fake_data)
    # G 希望 D(G(z)) ≈ 1
    g_loss = nn.BCELoss()(fake_output, real_labels)
    g_loss.backward()

    return d_loss.item(), g_loss.item()` }],
            table: {
                headers: ["问题", "原因", "影响"],
                rows: [
                    ["梯度消失", "D 太准 → JS=log(2) → 梯度≈0", "G 无法学习"],
                    ["模式崩溃", "G 发现少数样本能骗过 D", "生成多样性急剧下降"],
                    ["振荡不收敛", "极小极大博弈的鞍点特性", "loss 震荡而非下降"],
                    ["对超参数敏感", "学习率/网络深度影响微妙平衡", "调参困难"],
                ]
            },
            mermaid: `graph TD
  A[初始化 G, D] --> B[训练 D: 区分真假]
  B --> C{D 是否太准?}
  C -->|是| D[梯度消失, G无法更新]
  C -->|否| E[训练 G: 骗过 D]
  E --> F[更新 G 的参数]
  F --> B`,
            tip: "实际训练中，D 和 G 的更新比例需要仔细调整。经典做法是每步更新 D 一次、更新 G 一次，但当模式崩溃时可以多更新几次 D。",
            warning: "JS 散度在高维空间的'零重叠'问题是原始 GAN 训练不稳定的理论根源。后续 WGAN 等变体正是为了解决这个问题而提出的。",
        },
        {
            title: "3. DCGAN：深度卷积生成对抗网络",
            body: `DCGAN（Deep Convolutional GAN，Radford et al., 2016）是 GAN 发展史上的第一个重要里程碑。它将卷积网络引入 GAN 架构，使 GAN 能够生成高质量的图像。

DCGAN 的核心设计原则：
****- 判别器****：使用带步幅卷积（strided convolution）替代池化层，逐步降低特征图空间尺寸
****- 生成器****：使用转置卷积（transposed convolution / fractionally-strided convolution）逐步上采样，从低维噪声向量重构出完整图像
- 移除全连接隐藏层，使用纯卷积架构
- 生成器和判别器均使用批量归一化（BatchNorm）稳定训练
- 生成器输出层使用 Tanh 激活，其余使用 ReLU
- 判别器使用 LeakyReLU（α=0.2）避免梯度死亡

DCGAN 的价值在于：它证明了 GAN 可以学习到有意义的层次化特征表示。判别器中间层的特征向量可以用于图像检索、特征可视化等下游任务，这为后续 GAN 的特征操控奠定了基础。

数学上，转置卷积是卷积的逆操作：如果卷积的输出尺寸为 out = floor((in - k + 2p) / s) + 1，那么转置卷积将 out 映射回 in。转置卷积存在棋盘效应（checkerboard artifacts），这是后续模型（如 StyleGAN）需要解决的问题。`,
            code: [{ lang: "python", code: `import torch.nn as nn

class DCGAN_Generator(nn.Module):
    """DCGAN 生成器：从噪声到图像"""
    def __init__(self, latent_dim=100, ngf=64, nc=3):
        super().__init__()
        self.main = nn.Sequential(
            # 输入: z [N, 100, 1, 1]
            nn.ConvTranspose2d(latent_dim, ngf * 8, 4, 1, 0, bias=False),
            nn.BatchNorm2d(ngf * 8),
            nn.ReLU(True),
            # 输出: [N, 512, 4, 4]
            nn.ConvTranspose2d(ngf * 8, ngf * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 4),
            nn.ReLU(True),
            # 输出: [N, 256, 8, 8]
            nn.ConvTranspose2d(ngf * 4, ngf * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf * 2),
            nn.ReLU(True),
            # 输出: [N, 128, 16, 16]
            nn.ConvTranspose2d(ngf * 2, ngf, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ngf),
            nn.ReLU(True),
            # 输出: [N, 64, 32, 32]
            nn.ConvTranspose2d(ngf, nc, 4, 2, 1, bias=False),
            nn.Tanh()
            # 输出: [N, 3, 64, 64]
        )

    def forward(self, z):
        return self.main(z)

class DCGAN_Discriminator(nn.Module):
    """DCGAN 判别器"""
    def __init__(self, nc=3, ndf=64):
        super().__init__()
        self.main = nn.Sequential(
            nn.Conv2d(nc, ndf, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(ndf, ndf * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf * 2),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(ndf * 2, ndf * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf * 4),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(ndf * 4, ndf * 8, 4, 2, 1, bias=False),
            nn.BatchNorm2d(ndf * 8),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(ndf * 8, 1, 4, 1, 0, bias=False),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.main(x).view(-1, 1)` }],
            table: {
                headers: ["DCGAN 设计原则", "生成器", "判别器"],
                rows: [
                    ["下/上采样", "转置卷积", "步幅卷积（替代池化）"],
                    ["激活函数", "ReLU + Tanh(输出)", "LeakyReLU(0.2)"],
                    ["归一化", "BatchNorm", "BatchNorm"],
                    ["全连接层", "不使用", "不使用"],
                ]
            },
            tip: "转置卷积的棋盘效应可以通过改用「Resize + 普通卷积」来缓解：先用 F.interpolate 上采样，再用 3×3 卷积细化。这是 StyleGAN2 采用的策略。",
            warning: "DCGAN 仍然继承了原始 GAN 的 JS 散度问题，训练不稳定。它主要通过架构设计（BN、合适的激活函数）来缓解，但并未从理论上解决根本问题。",
        },
        {
            title: "4. WGAN：Wasserstein 距离的革命",
            body: `WGAN（Wasserstein GAN，Arjovsky et al., 2017）从根本上重新思考了 GAN 的训练目标。它用 Wasserstein 距离（又称 Earth Mover 距离）替代 JS 散度作为生成分布与真实分布的度量。

Wasserstein 距离的直观理解：将 p_g 的"土堆"搬到 p_data 的"土坑"，最小搬运成本就是 Wasserstein 距离。与 JS 散度不同，即使两个分布没有重叠，Wasserstein 距离也能提供有意义的梯度信号。

****数学定义****：W(p_data, p_g) = inf_{γ∈Π} E_{(x,y)~γ}[||x - y||]

其中 Π 是所有联合分布的集合，边缘分布分别为 p_data 和 p_g。

通过 Kantorovich-Rubinstein 对偶性，Wasserstein 距离可以写成：
W(p_data, p_g) = (1/K) · sup_{||f||_L ≤ K} [E_{x~p_data}[f(x)] - E_{z~p_g}[f(G(z))]]

其中 f 是 1-Lipschitz 函数。在 WGAN 中，判别器（称为 Critic）就是这个 f。

**原始 WGAN 做法**：通过权重裁剪（weight clipping）强制 Critic 满足 Lipschitz 约束。但这会导致要么梯度爆炸（裁剪值太大）、要么梯度消失（裁剪值太小）。

WGAN-GP 改进（Gulrajani et al., 2017）：用梯度惩罚替代权重裁剪：
GP = E_{x̂~P_x̂}[(||∇_x̂ D(x̂)||₂ - 1)²]

其中 x̂ 是真实样本和生成样本之间的随机插值点。这比权重裁剪优雅得多，也是目前最常用的做法。`,
            code: [{ lang: "python", code: `import torch
import torch.nn as nn

def wgan_gp_loss(critic, real_data, fake_data, device, lambda_gp=10):
    """WGAN-GP 的 Critic 损失（含梯度惩罚）"""
    batch_size = real_data.size(0)

    # Critic 对真实/假样本的打分
    real_score = critic(real_data).view(-1)
    fake_score = critic(fake_data.detach()).view(-1)

    # Wasserstein 距离估计
    critic_loss = fake_score.mean() - real_score.mean()

    # ===== 梯度惩罚 =====
    # 随机插值：x̂ = ε·x_real + (1-ε)·x_fake
    eps = torch.rand(batch_size, 1, 1, 1, device=device)
    x_hat = eps * real_data + (1 - eps) * fake_data.detach()
    x_hat.requires_grad_(True)

    hat_score = critic(x_hat).view(-1)
    grad = torch.autograd.grad(
        outputs=hat_score,
        inputs=x_hat,
        grad_outputs=torch.ones_like(hat_score),
        create_graph=True
    )[0]

    grad_norm = grad.view(batch_size, -1).norm(2, dim=1)
    gp = ((grad_norm - 1) ** 2).mean()

    return critic_loss + lambda_gp * gp

def generator_loss(critic, fake_data):
    """WGAN 中生成器的损失"""
    fake_score = critic(fake_data).view(-1)
    return -fake_score.mean()  # 最大化 Critic 对假样本的打分` }],
            table: {
                headers: ["度量方式", "重叠=0 时", "梯度连续性", "训练稳定性"],
                rows: [
                    ["JS 散度 (原始GAN)", "恒为 log(2)", "不连续", "差"],
                    ["Wasserstein (WGAN)", "有意义数值", "连续", "好"],
                    ["KL 散度 (VAE)", "趋于无穷", "不连续", "中等"],
                    ["Earth Mover 距离", "同 Wasserstein", "连续", "好"],
                ]
            },
            mermaid: `graph TD
  A[Wasserstein 距离] --> B[Kantorovich-Rubinstein 对偶]
  B --> C[需要 1-Lipschitz 函数]
  C --> D1[原始WGAN: 权重裁剪]
  C --> D2[WGAN-GP: 梯度惩罚]
  D1 --> E1[粗暴但有效]
  D2 --> E2[优雅且稳定]`,
            tip: "WGAN-GP 是目前最稳定的 GAN 训练方式之一。它的 Critic 不再输出概率（去掉 Sigmoid），而是输出实数打分。学习率建议 1e-4，Adam 的 β1=0, β2=0.9。",
            warning: "权重裁剪的 WGAN 容易出现容量不足（capacity underutilization）：Critic 的表达能力被裁剪强行限制，导致学习不充分。优先选择 WGAN-GP。",
        },
        {
            title: "5. StyleGAN 系列：风格迁移与人脸合成",
            body: `StyleGAN（Karras et al., 2019）是 **NVIDIA** 提出的划时代生成模型，彻底改变了高质量人脸合成的格局。

****核心创新****：StyleGAN 将生成过程分解为多个层次，每层控制不同"风格"的特征：
- 粗粒度风格（低层）：控制整体姿态、发型、脸型
- 中粒度风格（中层）：控制五官比例、面部表情
- 细粒度风格（高层）：控制肤色、眼睛颜色、细微纹理

StyleGAN 的关键技术包括：

1. 映射网络（Mapping Network）：一个 8 层 MLP 将初始潜码 z 映射到中间潜空间 w，解耦了原始噪声的不同维度，使各维度控制更独立的语义属性。

2. 自适应实例归一化（AdaIN）：
AdaIN(x_i, y) = y_{s,i} · (x_i - μ_i) / σ_i + y_{b,i}
其中 y 是从 w 投影出的风格参数（缩放 y_s 和偏移 y_b），x_i 是第 i 层的特征。这取代了传统的 BatchNorm，使每个样本可以独立控制风格。

3. 风格混合（Style Mixing）：训练时随机交换两个潜码在不同层的风格，强制网络学习解耦的特征表示。

StyleGAN2（2020）的改进：
- 移除 AdaIN 中的归一化操作，用权重解卷积（Weight Demodulation）替代
- 消除权重归一化导致的的水滴状伪影（water drop artifacts）
- 引入路径长度正则化，使潜空间更平滑，便于插值和编辑

StyleGAN 系列模型可以生成人眼无法分辨的 1024×1024 人脸图像，被广泛应用于数字人、游戏角色、影视特效等领域。`,
            code: [{ lang: "python", code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class AdaIN(nn.Module):
    """自适应实例归一化"""
    def __init__(self, channels, style_dim=512):
        super().__init__()
        self.norm = nn.InstanceNorm2d(channels, affine=False)
        self.style_scale = nn.Linear(style_dim, channels)
        self.style_bias = nn.Linear(style_dim, channels)

    def forward(self, x, w):
        # 归一化
        out = self.norm(x)
        # 从 w 预测仿射参数
        scale = self.style_scale(w).view(x.size(0), -1, 1, 1)
        bias = self.style_bias(w).view(x.size(0), -1, 1, 1)
        return out * (scale + 1) + bias

class StyleGAN2Generator(nn.Module):
    """StyleGAN2 生成器的简化版本"""
    def __init__(self, latent_dim=512, ngf=64):
        super().__init__()
        self.mapping = nn.Sequential(
            *[nn.Linear(latent_dim, latent_dim), nn.LeakyReLU(0.2)
              for _ in range(8)]
        )
        # 4x4 常量输入 + 卷积
        self.const = nn.Parameter(torch.randn(1, ngf * 8, 4, 4))
        self.adain1 = AdaIN(ngf * 8, latent_dim)
        self.conv1 = nn.Conv2d(ngf * 8, ngf * 8, 3, padding=1)

    def forward(self, z):
        w = self.mapping(z)  # 映射到 W 空间
        x = self.const.expand(z.size(0), -1, -1, -1)
        x = self.adain1(x, w)
        x = F.leaky_relu(self.conv1(x), 0.2)
        # 后续层继续上采样...
        return x` }],
            table: {
                headers: ["版本", "年份", "分辨率", "核心创新"],
                rows: [
                    ["StyleGAN", "2019", "1024×1024", "AdaIN, 映射网络, 风格混合"],
                    ["StyleGAN2", "2020", "1024×1024", "权重解卷积, 消除水滴伪影"],
                    ["StyleGAN3", "2021", "1024×1024", "抗混叠, 平移等变性"],
                    ["StyleGAN-XL", "2022", "1024×1024", "大规模训练, ImageNet 生成"],
                ]
            },
            tip: "StyleGAN 的 W 空间（中间潜空间）比原始 Z 空间更解耦，这意味着在 W 空间中做向量运算（如加法、插值）能产生更有意义的语义编辑效果。",
            warning: "StyleGAN 的映射网络增加了训练开销（8 层 MLP），且需要较大的 batch size 才能稳定训练。对于小数据集，建议用 StyleGAN2-ADA（自适应判别器增强）。",
        },
        {
            title: "6. CycleGAN：无配对的图像到图像翻译",
            body: `CycleGAN（Zhu et al., 2017）解决了一个根本性问题：如何在没有配对数据的情况下，实现两个域之间的图像转换？

之前的 pix2pix 等方法需要严格配对的训练数据（如同一场景的白天/夜晚照片）。但很多场景无法获取配对数据：马↔斑马、照片↔油画、夏季↔冬季。

CycleGAN 的核心思想是引入循环一致性损失（Cycle Consistency Loss）：
****- 正向循环****：x → G(x) → F(G(x)) ≈ x
****- 反向循环****：y → F(y) → G(F(y)) ≈ y

**完整的目标函数**：
L(G, F, D_X, D_Y) = L_GAN(G, D_Y, X, Y) + L_GAN(F, D_X, Y, X) + λ · L_cyc(G, F)

其中循环一致性损失定义为：
L_cyc = E_{x~p_data}[||F(G(x)) - x||₁] + E_{y~p_data}[||G(F(y)) - y||₁]

这个巧妙的约束确保转换是"可逆的"：即使没有配对数据，网络也必须学会保留内容信息，只改变风格。L1 损失比 L2 损失更好，因为 L1 鼓励稀疏误差（保留锐利边缘）。

CycleGAN 使用两个生成器（G: X→Y, F: Y→X）和两个判别器（D_X, D_Y），形成双向对抗训练。它已被广泛应用于艺术风格迁移、季节转换、数据增强等任务。`,
            code: [{ lang: "python", code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class ResBlock(nn.Module):
    """CycleGAN 生成器的残差块"""
    def __init__(self, channels):
        super().__init__()
        self.block = nn.Sequential(
            nn.ReflectionPad2d(1),
            nn.Conv2d(channels, channels, 3),
            nn.InstanceNorm2d(channels),
            nn.ReLU(True),
            nn.ReflectionPad2d(1),
            nn.Conv2d(channels, channels, 3),
            nn.InstanceNorm2d(channels),
        )

    def forward(self, x):
        return x + self.block(x)  # 残差连接

class CycleGANGenerator(nn.Module):
    """CycleGAN 生成器：下采样 + 残差 + 上采样"""
    def __init__(self, nc=3, ngf=64, n_blocks=6):
        super().__init__()
        # 下采样
        self.down = nn.Sequential(
            nn.ReflectionPad2d(3),
            nn.Conv2d(nc, ngf, 7, padding=0),
            nn.InstanceNorm2d(ngf), nn.ReLU(True),
            nn.Conv2d(ngf, ngf*2, 3, stride=2, padding=1),
            nn.InstanceNorm2d(ngf*2), nn.ReLU(True),
            nn.Conv2d(ngf*2, ngf*4, 3, stride=2, padding=1),
            nn.InstanceNorm2d(ngf*4), nn.ReLU(True),
        )
        # 残差块
        self.residuals = nn.Sequential(*[ResBlock(ngf*4) for _ in range(n_blocks)])
        # 上采样（用插值代替转置卷积，避免棋盘效应）
        self.up = nn.Sequential(
            nn.Upsample(scale_factor=2, mode='bilinear'),
            nn.Conv2d(ngf*4, ngf*2, 3, padding=1),
            nn.InstanceNorm2d(ngf*2), nn.ReLU(True),
            nn.Upsample(scale_factor=2, mode='bilinear'),
            nn.Conv2d(ngf*2, ngf, 3, padding=1),
            nn.InstanceNorm2d(ngf), nn.ReLU(True),
            nn.ReflectionPad2d(3),
            nn.Conv2d(ngf, nc, 7),
            nn.Tanh(),
        )

    def forward(self, x):
        return self.up(self.residuals(self.down(x)))

def cycle_consistency_loss(G, F, real_A, real_B):
    """循环一致性损失"""
    # A → B → A
    fake_B = G(real_A)
    rec_A = F(fake_B)
    # B → A → B
    fake_A = F(real_B)
    rec_B = G(fake_A)
    return F.l1_loss(rec_A, real_A) + F.l1_loss(rec_B, real_B)` }],
            table: {
                headers: ["组件", "作用", "损失函数"],
                rows: [
                    ["G: X→Y", "将 X 域图像转为 Y 域", "L_GAN(G, D_Y) + λ·L_cyc"],
                    ["F: Y→X", "将 Y 域图像转回 X 域", "L_GAN(F, D_X) + λ·L_cyc"],
                    ["D_X", "判断 X 域真假", "L_GAN(F, D_X)"],
                    ["D_Y", "判断 Y 域真假", "L_GAN(G, D_Y)"],
                    ["循环一致性", "确保可逆转换", "L1 重建误差"],
                ]
            },
            mermaid: `graph LR
  A[真实 X] --> G["G: X→Y"]
  G --> B["假 Y"]
  B --> F["F: Y→X"]
  F --> Ar["重建 X"]
  Ar -. "L1 loss" .-> A
  C[真实 Y] --> F2["F: Y→X"]
  F2 --> Br["假 X"]
  Br --> G2["G: X→Y"]
  G2 --> Cr["重建 Y"]
  Cr -. "L1 loss" .-> C`,
            tip: "λ（循环一致性权重）通常设为 10。太大的 λ 会让网络倾向于恒等映射（输出=输入），太小则循环约束失效。",
            warning: "CycleGAN 不能改变图像的内容结构（马的骨架不能变成斑马的骨架），它只能做风格和纹理的转换。如果需要大幅改变内容，考虑使用 StarGAN 或 AttentionGAN。",
        },
        {
            title: "7. GAN 的应用与挑战",
            body: `GAN 自 2014 年提出以来，已在多个领域取得突破性应用：

1. 超分辨率（SRGAN / ESRGAN）：从低分辨率图像重建高分辨率版本。SRGAN 使用感知损失（Perceptual Loss）+ 对抗损失替代传统的 MSE 损失，生成的图像在视觉感知上更真实。ESRGAN 进一步引入 RRDB（残差密集块）和相对论判别器。

**2. 数据增强**：GAN 可以生成逼真的训练数据，尤其适用于数据稀缺场景（医学图像、罕见事件）。生成的数据可以补充真实数据，提升下游分类器的泛化能力。

3. 图像修复（Inpainting）：结合上下文编码器（Context Encoder），GAN 可以填充图像中的缺失区域，保持语义一致性。

**4. 文本到图像生成**：StackGAN、DALL·E（部分使用 GAN 思想）等模型可以从文本描述生成对应图像。

然而，GAN 仍面临严峻挑战：

- 模式崩溃（Mode Collapse）：生成器只学会生成少数几种样本，覆盖不了真实数据的全部模式。这是 GAN 最著名的问题。
****- 评估困难****：缺乏统一的生成质量度量。FID（Fréchet Inception Distance）计算真实和生成特征分布之间的 Fréchet 距离，越低越好。IS（Inception Score）评估生成图像的多样性和质量，越高越好。
**- 训练不稳定**：即使有 WGAN-GP 等技术，GAN 训练仍然比 VAE、Diffusion 更敏感。
****- 伦理问题****：Deepfake 技术引发虚假信息、隐私侵犯等社会问题。

近年来，Diffusion Model 在生成质量上超越了 GAN，但 GAN 在推理速度（单次前向传播 vs 多步迭代）和计算效率上仍有不可替代的优势。`,
            code: [{ lang: "python", code: `import torch
import numpy as np
from scipy import linalg
from torchvision.models import inception_v3
from torchvision import transforms

def calculate_fid(real_features, fake_features):
    """计算 Fréchet Inception Distance (FID)
    
    FID = ||μ_r - μ_f||² + Tr(Σ_r + Σ_f - 2·√(Σ_r·Σ_f))
    越低表示生成质量越好
    """
    mu_real = np.mean(real_features, axis=0)
    mu_fake = np.mean(fake_features, axis=0)

    sigma_real = np.cov(real_features, rowvar=False)
    sigma_fake = np.cov(fake_features, rowvar=False)

    # Fréchet 距离
    diff = mu_real - mu_fake
    covmean, _ = linalg.sqrtm(sigma_real @ sigma_fake, disp=False)

    # 处理复数（数值不稳定时 sqrtm 可能返回复数）
    if np.iscomplexobj(covmean):
        covmean = covmean.real

    fid = diff @ diff + np.trace(sigma_real + sigma_fake - 2 * covmean)
    return float(fid)

def calculate_inception_score(fake_logits, splits=10):
    """计算 Inception Score (IS)
    
    IS = exp(E_y[KL(p(y|x) || p(y))])
    越高表示生成质量越好、多样性越高
    """
    scores = []
    split_size = fake_logits.shape[0] // splits

    for i in range(splits):
        logits = fake_logits[i * split_size: (i + 1) * split_size]
        probs = torch.softmax(logits, dim=1)

        # 边际分布 p(y)
        marginal = probs.mean(dim=0, keepdim=True)

        # KL 散度
        kl = probs * (torch.log(probs + 1e-10) - torch.log(marginal + 1e-10))
        kl = kl.sum(dim=1).mean()

        scores.append(torch.exp(kl).item())

    return np.mean(scores), np.std(scores)` }],
            table: {
                headers: ["指标", "含义", "好/坏", "计算方式"],
                rows: [
                    ["FID ↓", "特征分布距离", "越低越好", "Fréchet 距离"],
                    ["IS ↑", "多样性+质量", "越高越好", "KL 散度的指数"],
                    ["精度/召回", "质量/覆盖率", "双高最好", "流形覆盖分析"],
                    ["KID ↓", "无偏 MMD", "越低越好", "多项式核 MMD"],
                ]
            },
            mermaid: `graph TD
  A[GAN 应用领域] --> B[超分辨率 SRGAN]
  A --> C[图像翻译 CycleGAN]
  A --> D[人脸合成 StyleGAN]
  A --> E[数据增强]
  A --> F[图像修复]
  G[GAN 挑战] --> H[模式崩溃]
  G --> I[训练不稳定]
  G --> J[评估困难]
  G --> K[伦理问题 Deepfake]`,
            tip: "评估 GAN 时不要只看 FID。FID 低不代表生成质量好（可能存在模式崩溃），建议结合 Precision-Recall 曲线和人工视觉评估。",
            warning: "Deepfake 技术虽然有趣，但请遵守法律法规，不要生成涉及他人的虚假内容。技术上可以，伦理上不可以。",
        },
    ],
};
