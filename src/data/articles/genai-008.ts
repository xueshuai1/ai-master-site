import { Article } from '../knowledge';

export const article: Article = {
    id: "genai-008",
    title: "Flow Matching 与整流模型：下一代生成模型",
    category: "genai",
    tags: ["Flow Matching", "整流模型", "Rectified Flow", "扩散模型", "ODE", "生成模型", "SD3", "FLUX", "Sora", "连续归一化流"],
    summary: "深入解析 2025-2026 年爆发式崛起的 Flow Matching 与整流模型——从数学原理到代码实现，从 SD3 到 FLUX 的工业级应用",
    date: "2026-04-13",
    readTime: "22 min",
    level: "高级",
    content: [
        {
            title: "1. 为什么 Diffusion 需要被超越？",
            body: `扩散模型（Diffusion Models）在过去三年统治了生成式 AI 领域。从 DALL-E 2 到 Stable Diffusion，从 Imagen 到 Midjourney，几乎每一个令人惊叹的 AI 生成作品背后都有扩散模型的影子。**但到了 2025-2026 年，扩散模型的固有局限性变得越来越明显，推动了新一代生成范式的诞生**。

**采样速度慢是扩散模型最直接的痛点**。标准的 DDPM 需要 1000 步迭代去噪，即使使用 DDIM 加速到 50 步，每一步仍然需要完整的前向传播。这意味着生成一张高质量图像可能需要数百毫秒到数秒——对于实时应用来说太慢了。虽然 LCM（Latent Consistency Model）和 SDXL Turbo 等技术将步数压缩到了 1-4 步，但这是通过额外的蒸馏训练实现的，增加了复杂性和训练成本。

**训练-推理不一致是更深层的问题**。扩散模型在训练时学习的是噪声预测（预测每一步添加的噪声），但推理时执行的是逐步去噪采样。训练目标（噪声预测的 MSE）和推理目标（从噪声生成数据）之间没有直接的数学对应关系，这导致训练过程不够高效。

理论分析困难也是扩散模型的短板。虽然扩散模型的经验效果出色，但其训练动力学的理论分析相对薄弱。我们很难精确理解模型在训练过程中学到了什么，也很难从理论上保证训练收敛到最优解。

Flow Matching 正是在这些背景下诞生的。**它将生成过程建模为常微分方程（ODE）的学习，直接学习从噪声分布到数据分布的变换速度场**。这种方法在训练效率、采样速度和理论可分析性方面都有显著优势。2025 年，Stability AI 在 Stable Diffusion 3 中采用了 Rectified Flow（整流模型），Black Forest Labs 的 FLUX 系列也基于 Flow Matching 架构，而 OpenAI 的 Sora 视频生成系统同样使用了类似的连续变换方法。`,
            table: {
                headers: ["维度", "Diffusion", "Flow Matching", "提升"],
                rows: [
                    ["训练目标", "噪声预测 MSE", "速度场回归", "更直接"],
                    ["采样方式", "离散迭代去噪", "ODE 数值积分", "更灵活"],
                    ["训练-推理性", "不一致", "一致", "理论保证"],
                    ["理论分析", "困难", "清晰", "可证明收敛"],
                    ["采样加速", "需额外蒸馏", "天然支持", "更简洁"],
                    ["代表性模型", "SD 1.5/SDXL", "SD3/FLUX/Sora", "新一代"]
                ]
            },
            mermaid: `graph LR
    A["Diffusion 的局限"] --> B["采样慢"]
    A --> C["训练-推理不一致"]
    A --> D["理论分析困难"]
    
    B --> E["Flow Matching"]
    C --> E
    D --> E
    
    E --> F["SD3 (Rectified Flow)"]
    E --> G["FLUX (Flow Match)"]
    E --> H["Sora (连续变换)"]`,
            tip: "如果你已经理解扩散模型的基本原理，Flow Matching 的迁移学习曲线很平缓——两者在形式上高度相似。",
        },
        {
            title: "2. Flow Matching 的数学基础",
            body: `**Flow Matching 的核心思想可以用一句话概括：学习一个速度场 v(x, t)，使粒子从噪声出发沿该速度场流动到达数据分布**。

让我们从数学上严格定义这个过程。假设我们有一个数据分布 p_1(x) 和一个简单的先验分布 p_0(x)（通常是标准正态分布 N(0, I)）。Flow Matching 的目标是找到一个时间依赖的速度场 v: R^d × [0, 1] → R^d，使得以下常微分方程的解在 t=1 时服从数据分布：

dx/dt = v(x, t),  x(0) ~ p_0(x)  →  x(1) ~ p_1(x)

这个 ODE 定义了一个确定性映射：给定初始点 x(0) 和速度场 v，通过数值积分（如 Euler 方法、Runge-Kutta 方法）可以唯一确定 x(1)。**这个映射是一个微分同胚——既可逆又光滑**，这意味着我们不仅可以从噪声生成数据（正向积分），还可以从数据反推到噪声（反向积分）。

但问题是：我们不知道真实的速度场 v 是什么。Conditional Flow Matching (CFM) 提供了解决方案。其核心洞察是：虽然我们不知道从 p_0 到 p_1 的直接变换，但我们可以定义一族条件概率路径 p_t(x | x_1)，其中 x_1 是从数据分布中采样的一个具体数据点。对于每对 (x_0, x_1)，我们构造一条从 x_0 到 x_1 的条件轨迹，并计算其对应的条件速度场 u_t(x | x_1)。

然后，Flow Matching 的训练目标就是让神经网络 v_θ(x, t) 拟合这些条件速度场：

L(θ) = E_{t, x_1, x_0}[||v_θ(x_t, t) - u_t(x_t | x_1)||²]

其中 x_t 是条件路径上 t 时刻的点。这个损失函数形式上与扩散模型的噪声预测 MSE 损失非常相似，但有着本质不同：**Flow Matching 直接学习速度场（数据的变化方向），而扩散模型学习的是噪声（需要移除的扰动）**。

为什么叫"Flow"？ 因为速度场 v(x, t) 定义了一个"流"——数据点在速度场的驱动下从噪声空间"流动"到数据空间。这与流体力学中流体粒子在速度场中的运动完全类比。`,
            code: [
                {
                    lang: "python",
                    code: `# Flow Matching 的核心数学：条件概率路径
import torch
import torch.nn as nn

class ConditionalFlowMatcher:
    """最简单的条件流匹配器：线性插值路径"""
    
    def __init__(self, sigma=0.0):
        self.sigma = sigma  # 可选的噪声注入
    
    def sample_location_and_conditional_flow(self, x0, x1):
        """
        采样时间点 t 和条件路径上的点 x_t
        x0: 噪声 (batch, dim)
        x1: 数据 (batch, dim)
        """
        t = torch.rand(x0.shape[0], device=x0.device)
        t = t[:, None]  # (batch, 1)
        
        # 线性插值: x_t = t * x1 + (1 - t) * x0
        # 这定义了一条从 x0 到 x1 的直线
        xt = t * x1 + (1 - t) * x0
        
        # 条件速度场: u_t(x|x1) = x1 - x0
        # 对于线性插值，速度是常数（方向指向目标）
        ut = x1 - x0
        
        return t, xt, ut

# 训练循环骨架
def train_flow_matching(model, data_loader, optimizer, n_epochs=100):
    matcher = ConditionalFlowMatcher()
    
    for epoch in range(n_epochs):
        for x1 in data_loader:  # x1 是真实数据
            x0 = torch.randn_like(x1)  # 从高斯噪声采样
            t, xt, ut = matcher.sample_location_and_conditional_flow(x0, x1)
            
            # 神经网络预测速度场
            vt = model(xt, t)
            
            # Flow Matching 损失: MSE 预测 vs 真实速度
            loss = nn.functional.mse_loss(vt, ut)
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
    return model`
                },
                {
                    lang: "python",
                    code: `# 采样：从噪声 ODE 积分到数据
import torch
from torchdiffeq import odeint

@torch.no_grad()
def sample_flow_matching(model, noise_shape, device, 
                         method="dopri5", rtol=1e-5, atol=1e-5):
    """
    使用 ODE 求解器从噪声生成样本
    
    method 选项:
    - "euler": 最简单，步数固定
    - "dopri5": Dormand-Prince 5(4)，自适应步长
    - "midpoint": 二阶 Runge-Kutta
    """
    x0 = torch.randn(noise_shape, device=device)
    
    def velocity_fn(t, x):
        return model(x, t.unsqueeze(0))
    
    # 从 t=0 积分到 t=1
    # dopri5 会自动调整步数以控制误差
    trajectory = odeint(
        velocity_fn, x0,
        torch.tensor([0.0, 1.0], device=device, dtype=torch.float64),
        method=method, rtol=rtol, atol=atol
    )
    
    return trajectory[-1]  # 返回 t=1 的终点

# 对比不同 ODE 求解器的速度-质量权衡
solvers = {
    "euler_10": {"method": "euler", "steps": 10},
    "euler_50": {"method": "euler", "steps": 50},
    "rk4_25": {"method": "midpoint", "steps": 25},
    "dopri5": {"method": "dopri5", "rtol": 1e-5},
}

# FID 结果（示例，ImageNet 256x256）:
# euler_10  → FID=12.3, 时间=50ms
# euler_50  → FID=6.8,  时间=200ms
# rk4_25    → FID=7.1,  时间=120ms
# dopri5    → FID=6.5,  时间=180ms（自适应，步数可变）`
                }
            ],
            table: {
                headers: ["概念", "Diffusion", "Flow Matching"],
                rows: [
                    ["随机过程", "SDE（随机微分方程）", "ODE（常微分方程）"],
                    ["前向过程", "逐步加噪", "线性/非线性插值"],
                    ["学习目标", "噪声 ε(x_t, t)", "速度场 v(x_t, t)"],
                    ["采样", "随机去噪迭代", "确定性 ODE 积分"],
                    ["可逆性", "近似可逆", "精确可逆"],
                    ["训练信号", "间接（噪声→数据）", "直接（速度→路径）"],
                    ["理论框架", "Score Matching", "Optimal Transport"]
                ]
            },
        },
        {
            title: "3. 整流模型（Rectified Flow）：让流变成直线",
            body: `整流模型（Rectified Flow）由 Liu 等人在 2022 年提出，是 Flow Matching 最重要的具体实现之一。**其核心洞察极其优美：如果条件路径是直线，那么 ODE 的积分就只需要很少的步数**。

在标准的 Flow Matching 中，条件路径可以是任意的曲线。但如果我们选择线性插值作为条件路径（即 x_t = (1-t)·x_0 + t·x_1），那么条件速度场就是常数 u_t(x | x_1) = x_1 - x_0。这意味着对于每对 (x_0, x_1)，粒子沿直线从 x_0 运动到 x_1，速度恒定。

但这里有一个关键问题：**虽然单个粒子的条件路径是直线，但所有粒子的整体流可能不是直线**。这是因为不同的粒子有不同的目标 x_1，它们的速度场在空间中可能相互交叉或弯曲。

整流模型的解决方案是迭代整流（Iterative Rectification）：
1. 第一轮：用线性插值路径训练一个 Flow Matching 模型
2. 生成新数据对：用训练好的模型从 x_0 生成 x_1'（通过 ODE 积分）
3. 第二轮：用 (x_0, x_1') 作为新的训练数据对，重新训练模型
4. 重复：每一轮都使用上一轮模型生成的数据对

神奇的事情发生了：经过几轮迭代后，学习到的速度场越来越接近常向量场，ODE 轨迹越来越接近直线。**当轨迹完全变成直线时，只需要一步 Euler 积分就能从噪声精确生成数据**——这就是整流模型"Rectified"的含义。

从最优传输（Optimal Transport）的角度理解，整流模型实质上是在学习数据分布和噪声分布之间的Brenier 映射——这是最优传输理论中保证存在的唯一最优传输映射。Brenier 映射的一个重要性质是它是某个凸函数的梯度，这意味着传输路径是"直的"（在某种几何意义下）。

2025-2026 年，Stability AI 在 Stable Diffusion 3 中公开承认使用了 Rectified Flow 作为其核心生成机制。FLUX 模型（由 Stability AI 前团队创建的 Black Forest Labs 开发）也基于类似的整流思想。这些模型在生成质量和采样速度上都超越了基于传统扩散模型的上一代系统。`,
            code: [
                {
                    lang: "python",
                    code: `# 整流模型的迭代训练过程
import torch
import torch.nn as nn
from copy import deepcopy

class RectifiedFlow:
    def __init__(self, velocity_net, n_rectify_rounds=3):
        self.velocity_net = velocity_net
        self.n_rectify_rounds = n_rectify_rounds
    
    def sample_xt_ut(self, x0, x1, t):
        """线性插值路径"""
        t = t[:, None, None, None]  # 广播到图像维度
        xt = t * x1 + (1 - t) * x0
        ut = x1 - x0  # 常速度
        return xt, ut
    
    def train_round(self, data_loader, optimizer, n_epochs):
        """一轮整流训练"""
        for epoch in range(n_epochs):
            for x1 in data_loader:
                x0 = torch.randn_like(x1)
                t = torch.rand(x0.size(0), device=x0.device)
                
                xt, ut = self.sample_xt_ut(x0, x1, t)
                vt = self.velocity_net(xt, t)
                
                loss = nn.functional.mse_loss(vt, ut)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
    
    @torch.no_grad()
    def generate(self, x0, n_steps=50):
        """ODE 采样"""
        dt = 1.0 / n_steps
        xt = x0.clone()
        for i in range(n_steps):
            t = torch.full((x0.size(0),), i * dt, device=x0.device)
            vt = self.velocity_net(xt, t)
            xt = xt + dt * vt  # Euler 积分
        return xt
    
    def iterative_rectification(self, data_loader, optimizer_fn, 
                                 n_rounds=3, epochs_per_round=50):
        """
        迭代整流：每一轮用上一轮的生成结果重新训练
        """
        # 缓存数据集用于重生成
        original_data = []
        for batch in data_loader:
            original_data.append(batch)
        
        current_data = [x.clone() for x in original_data]
        
        for round_idx in range(n_rounds):
            print(f"=== 整流轮次 {round_idx + 1}/{n_rounds} ===")
            
            # 用当前数据对训练
            optimizer = optimizer_fn(self.velocity_net.parameters())
            self.train_round(current_data, optimizer, epochs_per_round)
            
            # 如果不是最后一轮，重新生成数据对
            if round_idx < n_rectify_rounds - 1:
                new_data = []
                for x0 in [torch.randn_like(x) for x in original_data]:
                    x1_rectified = self.generate(x0, n_steps=100)
                    new_data.append(x1_rectified)
                current_data = new_data
                print(f"  已重新生成 {len(current_data)} 个样本对")
        
        return self.velocity_net`
                }
            ],
            mermaid: `graph TD
    A["x0 ~ N(0,I)"] -->|"线性插值"| B["xt = (1-t)x0 + tx1"]
    B --> C["v_θ 学习速度场"]
    C --> D["ODE 积分生成 x1'"]
    D --> E{"收敛?"}
    E -->|"否"| F["用 (x0, x1') 重新训练"]
    F --> C
    E -->|"是"| G["直线轨迹 ✅"]
    G --> H["一步 Euler 即可生成"]`,
            tip: "整流模型的核心优势：经过 2-3 轮迭代后，ODE 轨迹接近直线，采样速度大幅提升。",
            warning: "迭代整流会增加训练成本（每轮都要重新生成数据），但换来的是推理时的速度优势。"
        },
        {
            title: "4. 从最优传输到 SiT：Flow Matching 的理论升级",
            body: `Flow Matching 与最优传输理论有着深刻的联系，理解这一点可以帮助我们设计更好的条件概率路径。

最优传输（Optimal Transport）研究的是如何将一个概率分布"搬运"到另一个分布，同时最小化某种"搬运成本"。在二次成本函数（即搬运成本是位移的平方）下，Brenier 定理保证存在唯一的最优传输映射，且该映射是某个凸函数的梯度。**整流模型学习的正是这个最优传输映射的近似**。

**当条件路径选择为最优传输路径时，Flow Matching 的学习效率最高**——因为最优传输路径本身就是"最直的"路径。但计算精确的最优传输映射在高维空间中极其昂贵。因此，实际中通常使用线性插值作为近似，通过迭代整流逐步逼近最优传输映射。

Score-based Flow Matching 是另一个重要方向。传统的 Flow Matching 需要知道数据点 x_1 来构建条件路径。但 Score-based 方法通过引入分数函数（score function）∇_x log p_t(x)，将 Flow Matching 与基于分数的生成模型统一起来。**这种方法不需要成对的 (x_0, x_1) 数据，可以直接从数据分布中采样训练**。

Scaling-Insensitive Flow Matching (SiT) 是 2024-2025 年的重要进展。标准 Flow Matching 对数据的尺度敏感——如果数据分布在某些维度上的方差远大于其他维度，速度场的学习会变得困难。SiT 通过引入自适应的时间缩放和空间归一化，使得模型对数据尺度的变化更加鲁棒。实验表明，SiT 在 ImageNet、COCO 等基准上的 FID 分数比标准 Flow Matching 低 15-30%。

离散 Flow Matching 则将连续的 ODE 框架扩展到离散数据（如文本）。通过将离散空间嵌入到连续空间，Flow Matching 可以用于语言模型和离散结构的生成。这是 2025-2026 年的热门研究方向，Meta 和 Google 都在探索用 Flow Matching 替代传统自回归语言模型。`,
            code: [
                {
                    lang: "python",
                    code: `# Score-based Flow Matching
import torch
import torch.nn as nn

class ScoreBasedFlowMatcher(nn.Module):
    """
    结合 Score Matching 和 Flow Matching
    不需要成对 (x0, x1) 数据
    """
    def __init__(self, velocity_net, score_net):
        super().__init__()
        self.velocity_net = velocity_net
        self.score_net = score_net
    
    def forward(self, xt, t, x_data=None):
        """
        统一损失：速度场匹配 + 分数匹配
        L = ||v_θ - u||² + λ ||s_θ - ∇log p_t||²
        """
        if x_data is not None:
            # 有数据时：用条件流匹配
            x0 = torch.randn_like(x_data)
            t_exp = t[:, None, None, None]
            xt_cond = t_exp * x_data + (1 - t_exp) * x0
            ut = x_data - x0
            vt = self.velocity_net(xt_cond, t)
            flow_loss = nn.functional.mse_loss(vt, ut)
        else:
            flow_loss = torch.tensor(0.0, device=xt.device)
        
        # 分数匹配损失（始终可用）
        score_pred = self.score_net(xt, t)
        # 目标分数: ∇_x log p_t(x) ≈ -ε/σ_t (扩散模型中)
        # 或用 Hutchinson 估计器无偏估计
        score_loss = self.compute_score_loss(xt, t)
        
        return flow_loss + 0.1 * score_loss
    
    def compute_score_loss(self, x, t):
        """用 Hutchinson 估计器计算分数匹配损失"""
        z = torch.randn_like(x)
        x.requires_grad_(True)
        
        # 估计 log p_t(x) 的梯度
        log_p = self.estimate_log_density(x, t)
        grad_log_p = torch.autograd.grad(
            log_p.sum(), x, create_graph=True
        )[0]
        
        # Hutchinson 估计: E[z^T ∇²f z] = Tr(∇²f)
        hutch = (z * grad_log_p).sum()
        return hutch ** 2`
                },
                {
                    lang: "python",
                    code: `# SiT: Scaling-Insensitive Flow Matching
import torch

class SiTFlowMatcher:
    """
    尺度不敏感的 Flow Matching
    通过自适应时间缩放和特征归一化提升训练稳定性
    """
    def __init__(self, data_dim, n_bins=100):
        self.data_dim = data_dim
        self.n_bins = n_bins
        # 学习每个特征通道的尺度
        self.feature_scales = nn.Parameter(torch.ones(data_dim))
        # 学习时间缩放函数
        self.time_warp = nn.Sequential(
            nn.Linear(1, 32),
            nn.SiLU(),
            nn.Linear(32, 1),
            nn.Sigmoid()  # 映射到 (0, 1)
        )
    
    def warp_time(self, t):
        """非线性时间缩放：让模型在关键区域花更多"时间"\"""
        return self.time_warp(t.unsqueeze(-1)).squeeze(-1)
    
    def normalize_features(self, x):
        """特征归一化：使不同维度具有可比尺度\"""
        return x * self.feature_scales
    
    def sample_path(self, x0, x1):
        t = torch.rand(x0.size(0), device=x0.device)
        t_warped = self.warp_time(t)
        
        # 归一化后的线性插值
        x0_norm = self.normalize_features(x0)
        x1_norm = self.normalize_features(x1)
        
        t_exp = t_warped[:, None, None, None]
        xt = t_exp * x1_norm + (1 - t_exp) * x0_norm
        ut = x1_norm - x0_norm
        
        return t_warped, xt, ut
    
    # ImageNet 256x256 结果（论文数据）:
    # 标准 FM:   FID=2.37  (1000 steps)
    # SiT-XL/2: FID=1.77  (1000 steps)
    # SiT-XL/2: FID=2.06  (250 steps)
    # DiT-XL/2: FID=2.27  (250 steps)  # 对比基线`
                }
            ],
            table: {
                headers: ["变体", "条件路径", "是否需要 (x0,x1)", "FID (ImageNet)", "核心优势"],
                rows: [
                    ["标准 CFM", "线性插值", "是", "~2.4", "简单直接"],
                    ["整流模型", "迭代整流", "是", "~2.1", "采样速度快"],
                    ["Score-based FM", "分数驱动", "否", "~2.3", "无需配对数据"],
                    ["SiT", "自适应缩放", "是", "~1.8", "尺度鲁棒性"],
                    ["离散 FM", "连续嵌入", "部分", "N/A", "支持离散数据"]
                ]
            },
        },
        {
            title: "5. 工业级实现：SD3、FLUX 与 Sora 的 Flow Matching 架构",
            body: `Flow Matching 从理论到工业应用的转化速度惊人。让我们深入看看三个代表性的工业级系统是如何应用 Flow Matching 的。

**Stable Diffusion 3（Stability AI, 2025）是第一个大规模采用 Flow Matching 的主流图像生成模型**。SD3 的核心架构是 Multimodal Diffusion Transformer（MM-DiT），它用 Transformer 替代了 U-Net 作为去噪/速度预测网络。关键变化在于：训练目标从噪声预测改为了速度场预测（Flow Matching 目标），采样过程从随机去噪变为了确定性 ODE 积分。SD3 使用 Rectified Flow 的 2 轮迭代整流，使得 25 步 ODE 积分的生成质量堪比前代 50 步 DDIM 的结果。配合 256 通道 latent space 和双文本编码器（CLIP + T5），SD3 在生成质量和文本对齐度上都超越了 SDXL。

FLUX（Black Forest Labs, 2025） 是 SD3 团队的后续作品，将 Flow Matching 推向了新的高度。FLUX 采用了一个纯 Transformer 架构（没有卷积层），使用 Flow Matching 作为训练目标，并引入了 Flow Rectification 技术。**FLUX 的最大特点是流匹配 + 注意力机制的深度整合**：在 Transformer 的每一层中，注意力模块处理全局信息，MLP 模块同时作为速度场预测器。这种设计使得 FLUX 在图像细节和结构一致性上达到了新的高度。FLUX.1 系列包含三个版本：FLUX.1 [pro]（闭源旗舰）、FLUX.1 [dev]（开源、非商用）和 FLUX.1 [schnell]（开源、快速，仅需 4 步采样）。

Sora（OpenAI, 2024-2025） 虽然 OpenAI 没有完全公开技术细节，但根据论文 "Video Generation Models as World Simulators" 中的描述，Sora 的核心是时空 Patch 的连续变换。它将视频分解为时空 Patch（同时包含空间和时间维度），然后在 Patch 空间上学习一个 Flow Matching 模型。与图像生成不同，视频生成需要建模时间维度上的动态变化。Flow Matching 的 ODE 框架天然适合这种任务——ODE 的时间变量 t 可以同时编码生成进度和视频帧的时间位置。**Sora 能够生成长达 60 秒的高清视频，这在之前的扩散模型框架下是极其困难的**。`,
            code: [
                {
                    lang: "python",
                    code: `# SD3 / FLUX 风格的 Flow Matching Transformer
import torch
import torch.nn as nn
import math

class FlowMatchingDiT(nn.Module):
    """
    简化版 Flow Matching + Transformer 架构
    模仿 SD3 的 MM-DiT 设计
    """
    def __init__(self, hidden_dim=1024, num_layers=24, num_heads=16,
                 patch_size=2, in_channels=16):
        super().__init__()
        self.patch_embed = nn.Conv2d(in_channels, hidden_dim, 
                                      kernel_size=patch_size, stride=patch_size)
        
        # 时间步编码
        self.t_embed = nn.Sequential(
            nn.Linear(1, hidden_dim),
            nn.SiLU(),
            nn.Linear(hidden_dim, hidden_dim),
        )
        
        # 文本条件编码
        self.text_embed = nn.Linear(4096, hidden_dim)  # T5-XXL
        
        # Transformer 层
        self.blocks = nn.ModuleList([
            nn.TransformerEncoderLayer(
                d_model=hidden_dim,
                nhead=num_heads,
                dim_feedforward=hidden_dim * 4,
                batch_first=True
            ) for _ in range(num_layers)
        ])
        
        # 输出头：预测速度场
        self.head = nn.Sequential(
            nn.LayerNorm(hidden_dim),
            nn.Linear(hidden_dim, hidden_dim),
            nn.GELU(),
            nn.Linear(hidden_dim, patch_size * patch_size * in_channels),
        )
    
    def forward(self, x, t, text_cond):
        """
        x: (B, C, H, W) - latent 空间输入
        t: (B,) - 时间步 [0, 1]
        text_cond: (B, L, 4096) - 文本条件
        返回: (B, C, H, W) - 预测的速度场
        """
        B = x.size(0)
        
        # Patch embedding
        patches = self.patch_embed(x)  # (B, hidden, h, w)
        B, C, h, w = patches.shape
        seq = patches.flatten(2).transpose(1, 2)  # (B, h*w, hidden)
        
        # 时间编码 + 文本编码
        t_emb = self.t_embed(t.unsqueeze(-1))  # (B, hidden)
        text_emb = self.text_embed(text_cond)  # (B, L, hidden)
        
        # 将条件注入序列
        t_tokens = t_emb.unsqueeze(1).expand(-1, seq.size(1), -1)
        cond_seq = seq + t_tokens  # 简单加法条件注入
        # 实际 SD3 使用更复杂的跨注意力机制
        
        # Transformer
        for block in self.blocks:
            cond_seq = block(cond_seq)
        
        # 解码回速度场
        velocity = self.head(cond_seq)  # (B, h*w, patch²*C)
        velocity = velocity.transpose(1, 2).view(B, C, h, w)
        
        return velocity`
                },
                {
                    lang: "python",
                    code: `# FLUX [schnell] 风格：4 步采样
import torch

@torch.no_grad()
def flux_schnell_sample(model, noise_shape, text_cond, n_steps=4):
    """
    FLUX schnell 的 4 步 Flow Matching 采样
    通过深度整流，轨迹接近直线，只需极少步数
    """
    x = torch.randn(noise_shape, device=text_cond.device)
    dt = 1.0 / n_steps
    
    for i in range(n_steps):
        t = torch.full((noise_shape[0],), i * dt, device=x.device)
        v = model(x, t, text_cond)
        x = x + dt * v  # Euler 积分
    
    return x

# 性能对比（A100 GPU, 1024x1024 图像）:
# SDXL + DDIM (50步): ~3.2s, FID=6.2
# SD3 + FM (25步):   ~1.8s, FID=4.1
# FLUX schnell (4步): ~0.5s, FID=4.8
# FLUX dev (25步):    ~2.1s, FID=3.2`
                }
            ],
            mermaid: `graph TD
    A["文本 Prompt"] --> B["T5-XXL 编码器"]
    A --> C["CLIP 编码器"]
    B --> D["MM-DiT Transformer"]
    C --> D
    
    E["随机噪声 Latent"] --> F["Flow Matching 采样"]
    D -->|"速度场 v(x,t)"| F
    
    F --> G["ODE 数值积分"]
    G --> H["去噪 Latent"]
    H --> I["VAE 解码器"]
    I --> J["生成图像"]`,
            tip: "FLUX schnell 证明了：经过充分整流的 Flow Matching 模型，4 步采样即可获得优质结果。",
            warning: "工业级 Flow Matching 模型需要大量显存（FLUX dev 需要 24GB+），本地部署需考虑硬件限制。"
        },
        {
            title: "6. 最佳实践：训练、加速与部署",
            body: `将 Flow Matching 从理论变为生产级系统，需要关注以下几个关键环节。

**训练策略：Flow Matching 的训练比扩散模型更简单，因为训练目标和推理目标一致**。但仍然有几个关键技巧：（1）时间步采样策略——不要均匀采样 t，而是在 t 接近 0 和 1 的区域增加采样频率，因为这些区域的速度场变化更剧烈；（2）学习率预热——前 1-2% 的训练步数使用线性预热，然后使用余弦衰减；（3）梯度裁剪——速度场的梯度在训练初期可能很大，建议设置 max_grad_norm=1.0；（4）EMA（指数移动平均）——维护模型权重的 EMA 版本，可以显著提升生成质量。

ODE 求解器选择：采样时的 ODE 求解器选择对速度和质量有重大影响。Euler 方法最简单但需要较多步数；**Dormand-Prince（dopri5）自适应步长方法在大多数情况下是最佳选择**——它会自动在速度变化快的区域使用小步长，在速度平缓的区域使用大步长；对于需要极致速度的场景，可以使用 Heun 方法（二阶精度）配合固定步数。

加速技术：Flow Matching 有多种加速途径。（1）整流迭代：如前所述，2-3 轮迭代整流可以将轨迹"拉直"，大幅减少采样步数；（2）时间蒸馏（Time Distillation）：训练一个学生模型，用教师模型的多步采样结果作为监督信号，学习单步或少步生成；（3）一致性模型（Consistency Models）：训练模型直接从任意 t 时刻映射到 t=1 的终点，实现真正的单步生成。

评估与调试：Flow Matching 的调试比扩散模型更直观，因为训练损失直接反映了速度场的拟合精度。监控训练损失的同时，定期生成样本计算 FID 分数。**一个有用的调试技巧是可视化速度场**——在 2D 简化场景中绘制速度向量场，可以直观检查模型是否学到了合理的变换方向。`,
            code: [
                {
                    lang: "python",
                    code: `# 完整的 Flow Matching 训练循环（生产级）
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torch.optim.lr_scheduler import CosineAnnealingLR
from tqdm import tqdm
import copy

def train_flow_matching_production(
    model, dataset, batch_size=64, n_epochs=500,
    lr=1e-4, ema_decay=0.9999, device="cuda"
):
    """生产级 Flow Matching 训练"""
    model = model.to(device)
    optimizer = torch.optim.AdamW(
        model.parameters(), lr=lr, weight_decay=1e-2
    )
    
    # 学习率预热 + 余弦衰减
    warmup_steps = int(0.02 * n_epochs * len(dataset) / batch_size)
    total_steps = n_epochs * len(dataset) // batch_size
    
    def lr_lambda(step):
        if step < warmup_steps:
            return step / warmup_steps
        else:
            return 0.5 * (1 + math.cos(math.pi * (step - warmup_steps) / (total_steps - warmup_steps)))
    
    scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)
    
    # EMA 模型
    ema_model = copy.deepcopy(model)
    ema_model.eval()
    
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    global_step = 0
    
    for epoch in range(n_epochs):
        pbar = tqdm(dataloader, desc=f"Epoch {epoch}")
        for x1 in pbar:
            x1 = x1.to(device)
            x0 = torch.randn_like(x1)
            t = torch.rand(x1.size(0), device=device)
            
            # 非线性时间采样：在两端增加密度
            # Beta 分布可以让 t 在 0 和 1 附近更密集
            t = torch.beta(t, torch.full_like(t, 0.8)).to(device)
            
            # 线性插值路径
            t_exp = t[:, None, None, None]
            xt = t_exp * x1 + (1 - t_exp) * x0
            ut = x1 - x0
            
            # 前向传播
            vt = model(xt, t)
            loss = nn.functional.mse_loss(vt, ut)
            
            # 梯度裁剪
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            optimizer.zero_grad()
            scheduler.step()
            
            # 更新 EMA
            with torch.no_grad():
                for ema_param, param in zip(ema_model.parameters(), model.parameters()):
                    ema_param.mul_(ema_decay).add_(param, alpha=1 - ema_decay)
            
            global_step += 1
            pbar.set_postfix(loss=loss.item(), lr=scheduler.get_last_lr()[0])
    
    return model, ema_model`
                },
                {
                    lang: "python",
                    code: `# ODE 求解器对比实验
import torch
from torchdiffeq import odeint
import time

def benchmark_ode_solvers(model, x0, text_cond):
    """对比不同 ODE 求解器的速度和质量"""
    results = {}
    
    solvers = {
        "euler_10": lambda: odeint(
            lambda t, x: model(x, t.unsqueeze(0), text_cond),
            x0, torch.tensor([0., 1.]),
            method="euler", options={"step_size": 0.1}
        ),
        "euler_25": lambda: odeint(
            lambda t, x: model(x, t.unsqueeze(0), text_cond),
            x0, torch.tensor([0., 1.]),
            method="euler", options={"step_size": 0.04}
        ),
        "dopri5": lambda: odeint(
            lambda t, x: model(x, t.unsqueeze(0), text_cond),
            x0, torch.tensor([0., 1.]),
            method="dopri5", rtol=1e-5, atol=1e-5
        ),
        "heun_10": lambda: odeint(
            lambda t, x: model(x, t.unsqueeze(0), text_cond),
            x0, torch.tensor([0., 1.]),
            method="heun3", options={"step_size": 0.1}
        ),
    }
    
    for name, solver_fn in solvers.items():
        torch.cuda.synchronize()
        start = time.perf_counter()
        with torch.no_grad():
            trajectory = solver_fn()
        torch.cuda.synchronize()
        elapsed = time.perf_counter() - start
        
        n_steps = trajectory.size(0) - 1
        results[name] = {
            "time_ms": elapsed * 1000,
            "n_steps": n_steps,
            "output": trajectory[-1]
        }
        print(f"{name}: {elapsed*1000:.1f}ms, {n_steps} steps")
    
    return results`
                }
            ],
            table: {
                headers: ["加速方法", "采样步数", "质量损失", "训练开销", "适用场景"],
                rows: [
                    ["标准 Euler", "50-100", "基线", "无", "通用"],
                    ["整流迭代", "10-25", "< 2%", "中等 (2-3轮)", "生产部署"],
                    ["Dopri5 自适应", "自动", "可忽略", "无", "质量优先"],
                    ["时间蒸馏", "1-4", "5-10%", "高", "极致速度"],
                    ["一致性模型", "1", "10-15%", "极高", "实时应用"]
                ]
            },
            tip: "生产环境中，整流迭代 + dopri5 是最佳组合：训练成本可控，推理速度快，质量损失极小。",
            warning: "不要在生产中使用纯 Euler 方法，除非你已经验证了在目标步数下质量可接受。"
        },
        {
            title: "7. 未来展望：Flow Matching 将如何改变生成式 AI",
            body: `**Flow Matching 不仅是扩散模型的改进版，它代表着生成模型范式的根本性转变**。以下是 2026 年及以后值得关注的几个方向。

统一生成框架：Flow Matching 有潜力成为统一所有生成任务的框架。在图像领域，SD3 和 FLUX 已经证明了 Flow Matching 的优越性。在视频领域，Sora 和同类模型展示了时空连续变换的能力。在音频领域，Flow Matching 正在替代传统的自回归和扩散方法。最激动人心的是文本生成方向——离散 Flow Matching 和连续松弛技术使得用 Flow Matching 替代 Transformer 自回归语言模型成为可能。**如果成功，这意味着图像、视频、音频、文本都可以用同一个框架生成**。

与 Agent 系统的整合：Flow Matching 的确定性 ODE 采样使其天然适合 Agent 系统。Agent 需要在生成过程中插入人类反馈或工具调用结果，而 **Flow Matching 的可逆性和确定性使得在任意时刻"暂停-修改-继续"成为可能**。想象一个 AI 设计师：先生成设计草图（t=0.3），人类审核员提出修改意见，Agent 在 ODE 轨迹上注入修改信号，然后继续生成——整个过程无需从头开始。

理论深化：当前 Flow Matching 的理论基础仍然在发展。最优传输理论与 Flow Matching 的完整对接、无限维空间（函数空间）中的 Flow Matching、以及 Flow Matching 的泛化理论都是活跃的研究方向。我们预计 2026-2027 年会有一批重要的理论突破，为 Flow Matching 提供更坚实的理论支撑。

硬件协同设计：随着 Flow Matching 成为主流生成框架，硬件厂商可能会针对 ODE 数值积分进行优化。当前的 GPU 架构是为矩阵乘法（Transformer）和卷积优化的，而 ODE 求解器的计算模式有所不同——它需要大量的顺序计算和自适应步长控制。专门为 Flow Matching 优化的推理芯片可能会在未来几年出现。

与强化学习的结合：Flow Matching 的可微 ODE 求解器使得端到端的强化学习训练成为可能。我们可以定义一个奖励函数 r(x_1)，然后通过 ODE 的反向传播将奖励梯度传递回速度场网络。这使得我们可以直接优化生成质量指标（如人类偏好），而不仅仅是似然或重建误差。**这种"奖励驱动的 Flow Matching"可能是下一代对齐（Alignment）技术的核心**。`,
            mermaid: `graph TD
    A["Flow Matching 2026"] --> B["统一生成框架"]
    A --> C["Agent 系统整合"]
    A --> D["理论深化"]
    A --> E["硬件协同设计"]
    A --> F["强化学习结合"]
    
    B --> B1["图像/视频/音频/文本"]
    C --> C1["可逆生成 + 人类反馈"]
    D --> D1["最优传输 + 泛化理论"]
    E --> E1["ODE 专用推理芯片"]
    F --> F1["奖励驱动对齐"]`,
            tip: "关注 Meta、Google、Stability AI 和 Black Forest Labs 的最新论文，他们是 Flow Matching 领域最活跃的研究团队。",
            warning: "Flow Matching 虽然前景广阔，但在离散数据（文本）上的应用仍然不成熟，不要在生产语言模型中贸然替换自回归架构。"
        },
        {
            title: "8. 总结：从 Diffusion 到 Flow 的范式迁移",
            body: `**Flow Matching 代表了我们理解和使用生成模型方式的根本性转变**。

核心差异回顾：扩散模型通过随机微分方程（SDE）和噪声预测来生成数据，而 Flow Matching 通过常微分方程（ODE）和速度场学习来生成数据。**前者是随机的、逐步的、训练与推理不一致的；后者是确定的、连续的、训练与推理一致的**。这个差异看似微小，却在理论和实践中产生了深远的影响。

为什么 Flow Matching 是未来：（1）理论优雅——ODE 框架提供了清晰的数学表述和可分析的收敛保证；（2）训练高效——训练目标直接对应推理过程，没有信息损失；（3）采样灵活——可以选择不同精度和速度的 ODE 求解器；（4）可逆性强——精确可逆性支持编辑、插值和多模态对齐；（5）工业验证——SD3、FLUX、Sora 等工业级系统已经证明了其有效性。

学习建议：如果你已经熟悉扩散模型，Flow Matching 的学习曲线很平缓——两者在架构上几乎相同，主要差异在于训练目标和采样过程。建议先实现一个简单的 1D Flow Matching 模型来理解核心概念，然后迁移到图像生成任务。**对于已经在用扩散模型的项目，切换到 Flow Matching 通常只需要修改训练损失函数和采样循环，模型架构可以保持不变**。

生成式 AI 正在经历从"能用"到"好用"再到"高效"的演进。Flow Matching 正是这一演进的关键推动力——它让生成模型更快、更可靠、更可理解。`,
            code: [
                {
                    lang: "python",
                    code: `# 从 Diffusion 迁移到 Flow Matching 的最小改动示例
# 假设你已经有扩散模型代码，以下是需要修改的部分

# ===== 修改 1：训练损失 =====
# Diffusion (旧):
# noise = torch.randn_like(x0)
# xt = sqrt_alpha_bar * x0 + sqrt(1 - alpha_bar) * noise
# noise_pred = model(xt, t)
# loss = MSE(noise_pred, noise)

# Flow Matching (新):
x0 = torch.randn_like(x1)  # x1 是真实数据
t = torch.rand(x1.size(0), device=x1.device)
t_exp = t[:, None, None, None]
xt = t_exp * x1 + (1 - t_exp) * x0  # 线性插值
ut = x1 - x0  # 真实速度场
vt = model(xt, t)  # 预测速度场
loss = nn.functional.mse_loss(vt, ut)  # 速度场 MSE

# ===== 修改 2：采样循环 =====
# Diffusion (旧):
# for t in reversed(range(T)):
#     noise_pred = model(xt, t)
#     xt = denoise_step(xt, noise_pred, t)

# Flow Matching (新):
x = torch.randn(shape, device=device)
dt = 1.0 / n_steps
for i in range(n_steps):
    t = torch.full((shape[0],), i * dt, device=device)
    v = model(x, t)
    x = x + dt * v  # Euler 积分

# 就是这么简单！架构、优化器、数据加载都不需要改。`
                }
            ],
            table: {
                headers: ["特性", "Diffusion", "Flow Matching", "趋势"],
                rows: [
                    ["主流地位", "2022-2024", "2025-现在", "Flow 上升"],
                    ["代表模型", "SDXL/DALL-E 3", "SD3/FLUX/Sora", "全面迁移"],
                    ["开源生态", "成熟", "快速增长", "FLUX 开源"],
                    ["研究热度", "平稳", "爆发", "Flow 主导"],
                    ["新入局者", "减少", "增加", "首选 Flow"]
                ]
            },
        },
    ],
};
