import { Article } from '../knowledge';

export const article: Article = {
    id: "mm-008",
    title: "3D 视觉与空间理解：从 NeRF 到世界模型",
    category: "multimodal",
    tags: ["3D视觉", "NeRF", "高斯溅射", "空间理解", "世界模型"],
    summary: "深入理解 AI 如何感知和理解三维世界，从神经辐射场到高斯溅射再到空间世界模型",
    date: "2026-04-13",
    readTime: "24 min",
    level: "高级",
    content: [
        {
            title: "1. 3D 视觉的崛起：为什么 AI 需要理解三维世界",
            body: `传统计算机视觉主要处理二维图像——分类、检测、分割任务都在像素平面上操作。但真实世界是三维的，人类天生具备空间感知能力：我们能判断物体的远近、大小、形状和空间关系，能从任意角度观察和理解一个场景。让 AI 系统获得类似的 3D 理解能力，是实现真正智能的关键一步。

2020 年以来，3D 视觉领域经历了一场革命。NeRF（Neural Radiance Fields，神经辐射场）的提出开创了用神经网络表示 3D 场景的全新范式。随后，3D 高斯溅射（3D Gaussian Splatting）在 2023 年将渲染速度提升了数百倍，使实时 3D 场景重建成为可能。到了 2025-2026 年，大语言模型开始与 3D 视觉深度融合——GPT-4V 和 Gemini 已经能够理解 3D 空间关系，苹果的 Vision Pro 推动了空间计算的发展，而具身智能（Embodied AI）则要求机器人能够实时理解并操作 3D 环境。

3D 视觉不再是学术研究的小众领域，而是正在成为 AI 基础设施的核心组成部分。从自动驾驶汽车的空间感知，到 AR/VR 的环境理解，从工业数字孪生到机器人操作，3D 空间理解能力正在成为新一代 AI 系统的标配。`,
            mermaid: `graph TD
    A["2D 图像/视频"] --> B["深度估计"]
    A --> C["相机位姿估计"]
    B --> D["3D 场景表示"]
    C --> D
    D --> E["NeRF\n神经辐射场"]
    D --> F["3D 高斯溅射"]
    D --> G["显式网格/点云"]
    E --> H["新视角合成"]
    F --> H
    G --> H
            H --> I["3D 理解与推理"]
            I --> J["空间问答"]
            I --> K["场景编辑"]
            I --> L["机器人操作"]`,
            tip: "学习建议：先理解传统多视角几何（对极几何、三角测量），再进入 NeRF 的隐式表示，最后学习 3D 高斯溅射的显式表示。这条路径能帮你建立完整的知识框架。",
        },
        {
            title: "2. NeRF：用神经网络表示 3D 场景",
            body: `NeRF 的核心思想非常优雅：用一个多层感知机（MLP）来隐式地表示整个 3D 场景。这个网络输入一个 3D 空间坐标 (x, y, z) 和一个观察方向 (theta, phi)，输出该点的颜色 (r, g, b) 和体密度 (sigma)。通过从不同视角发射射线并在射线上采样点进行体积渲染，NeRF 能够合成任意视角的逼真图像。

NeRF 的训练只需要一组已知相机位姿的多视角图像。网络通过最小化渲染图像与真实图像之间的光度误差来学习场景表示。训练完成后，这个 MLP 就成为了场景的紧凑表示——通常只有几 MB 大小，却能编码一个完整 3D 场景的几何和外观信息。

NeRF 的开创性在于它证明了神经网络可以作为 3D 场景的隐式表示函数。但这种表示也有明显的局限性：训练速度慢（单场景需要数小时）、渲染速度慢（合成一张图像需要数秒）、难以编辑和组合。这些局限性催生了后续大量的改进工作。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class NeRF(nn.Module):
    """NeRF 核心网络：位置编码 + MLP"""
    
    def __init__(self, hidden_dim=256, num_layers=8, 
                 pos_encoding_freq=10, view_encoding_freq=4):
        super().__init__()
        self.pos_encoding_freq = pos_encoding_freq
        self.view_encoding_freq = view_encoding_freq
        
        # 位置编码维度: 3 * (2 * freq + 1)
        pos_dim = 3 * (2 * pos_encoding_freq + 1)
        view_dim = 3 * (2 * view_encoding_freq + 1)
        
        # 主干网络：位置 -> 密度 + 特征
        layers = []
        layers.append(nn.Linear(pos_dim, hidden_dim))
        for _ in range(num_layers - 1):
            layers.append(nn.ReLU())
            layers.append(nn.Linear(hidden_dim, hidden_dim))
        self.feature_layers = nn.Sequential(*layers)
        
        # 密度输出
        self.density_head = nn.Linear(hidden_dim, 1)
        
        # 颜色网络：特征 + 视角 -> RGB
        self.color_head = nn.Sequential(
            nn.Linear(hidden_dim + view_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 3),
            nn.Sigmoid()
        )
    
    def positional_encoding(self, x, freq):
        """正弦位置编码"""
        enc = [x]
        for i in range(freq):
            enc.append(torch.sin(x * (2 ** i)))
            enc.append(torch.cos(x * (2 ** i)))
        return torch.cat(enc, dim=-1)
    
    def forward(self, points, view_dirs):
        """
        points: [N, 3] 3D 空间坐标
        view_dirs: [N, 3] 观察方向
        返回: rgb [N, 3], density [N, 1]
        """
        pos_enc = self.positional_encoding(points, self.pos_encoding_freq)
        view_enc = self.positional_encoding(view_dirs, self.view_encoding_freq)
        
        features = self.feature_layers(pos_enc)
        density = self.density_head(features)
        color = self.color_head(torch.cat([features, view_enc], dim=-1))
        
        return color, density

# 体积渲染：沿射线积分
def volume_render(colors, densities, deltas, dists):
    """简化的体积渲染"""
    alphas = 1 - torch.exp(-densities * deltas)
    weights = alphas * torch.cumprod(
        torch.cat([torch.ones_like(alphas[:1]), 1 - alphas[:-1]], dim=0)
    )
    rgb = torch.sum(weights * colors, dim=0)
    return rgb, weights`
                },
                {
                    lang: "python",
                    code: `# NeRF 训练循环示例
def train_nerf(model, rays, gt_colors, optimizer, num_rays=4096):
    """单步训练"""
    optimizer.zero_grad()
    
    # 随机采样射线
    indices = torch.randperm(len(rays))[:num_rays]
    sampled_rays = rays[indices]
    sampled_gt = gt_colors[indices]
    
    # 沿射线采样点
    points, view_dirs, deltas = sample_points_on_rays(sampled_rays)
    
    # 前向传播
    pred_colors, densities = model(points, view_dirs)
    
    # 体积渲染
    rendered_colors, _ = volume_render(
        pred_colors, densities, deltas, 
        dists=sampled_rays.near_far_dist
    )
    
    # MSE 损失
    loss = F.mse_loss(rendered_colors, sampled_gt)
    loss.backward()
    optimizer.step()
    
    return loss.item()`
                }
            ],
            table: {
                headers: ["NeRF 变体", "核心改进", "渲染速度", "训练时间"],
                rows: [
                    ["原始 NeRF", "MLP 隐式表示", "~5 秒/帧", "数小时"],
                    ["Instant-NGP", "多分辨率哈希编码", "~30 毫秒/帧", "数分钟"],
                    ["PlenOctrees", "八叉树预计算", "~10 毫秒/帧", "数小时"],
                    ["3D 高斯溅射", "显式 3D 高斯", "~1 毫秒/帧", "数分钟"]
                ]
            },
            warning: "NeRF 的隐式表示虽然紧凑，但难以直接编辑。如果你需要对场景进行物体级别的编辑（移动、删除、替换），应该考虑 3D 高斯溅射等显式表示方法。",
        },
        {
            title: "3. 3D 高斯溅射：实时 3D 场景重建的突破",
            body: `3D 高斯溅射（3D Gaussian Splatting, 3DGS）是 2023 年提出的革命性 3D 场景表示方法，它在 NeRF 的基础上做出了一个关键转变：从隐式的神经网络表示转向显式的 3D 高斯集合。

每个 3D 高斯由位置（均值）、协方差（形状和朝向）、不透明度和颜色（球谐系数）定义。场景由数十万到数百万个这样的 3D 高斯组成。渲染时，将这些高斯投影到 2D 图像平面，按照深度排序后进行 alpha 混合。这种方法的核心优势在于：高斯的投影和混合都是可微的，因此可以直接从多视角图像中优化高斯参数。

3DGS 的速度优势来自于其完全可并化的渲染管线。与 NeRF 需要为每个像素查询 MLP 不同，3DGS 的渲染可以直接在 GPU 上高效执行，达到实时甚至超实时的帧率。2024-2026 年间，3DGS 的改进版本层出不穷：抗锯齿高斯溅射、动态场景高斯溅射、压缩高斯溅射等，将质量和性能推向了新的高度。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
from dataclasses import dataclass

@dataclass
class Gaussian3D:
    """单个 3D 高斯"""
    mean: torch.Tensor          # [3] 位置
    covariance: torch.Tensor    # [3, 3] 协方差矩阵
    opacity: torch.Tensor       # [1] 不透明度
    sh_coeffs: torch.Tensor     # [N, 3] 球谐系数（颜色）

class GaussianSplatting:
    """3D 高斯溅射渲染器"""
    
    def __init__(self, num_gaussians: int, sh_degree: int = 3):
        self.num_gaussians = num_gaussians
        self.sh_degree = sh_degree
        self.num_sh_coeffs = (sh_degree + 1) ** 2
        
        # 初始化高斯参数
        self.means = nn.Parameter(torch.randn(num_gaussians, 3) * 0.1)
        # 使用旋转（四元数）和缩放参数化协方差
        self.rotations = nn.Parameter(torch.randn(num_gaussians, 4))
        self.scales = nn.Parameter(torch.zeros(num_gaussians, 3))
        self.opacities = nn.Parameter(torch.zeros(num_gaussians, 1))
        self.sh_coeffs = nn.Parameter(torch.zeros(
            num_gaussians, self.num_sh_coeffs, 3
        ))
    
    def get_covariance(self) -> torch.Tensor:
        """从旋转和缩放构建协方差矩阵"""
        # 归一化四元数
        q = F.normalize(self.rotations, dim=-1)
        # 构建旋转矩阵
        R = quaternion_to_matrix(q)
        # 缩放矩阵
        S = torch.diag_embed(torch.exp(self.scales))
        # 协方差 = R * S^2 * R^T
        return R @ (S @ S.transpose(-1, -2)) @ R.transpose(-1, -2)
    
    def project_to_camera(self, means, view_matrix, focal, center):
        """将 3D 高斯投影到相机坐标系"""
        # 转换到相机坐标
        means_cam = (view_matrix[:3, :3] @ means.T).T + view_matrix[:3, 3]
        # 透视投影
        depth = means_cam[:, 2:3]
        means_proj = means_cam[:, :2] / depth * focal + center
        # 协方差投影（使用雅可比近似）
        return means_proj, depth

    def render(self, camera_params) -> torch.Tensor:
        """完整渲染管线"""
        means_proj, depth = self.project_to_camera(
            self.means, camera_params.view_matrix,
            camera_params.focal, camera_params.center
        )
        cov_2d = project_covariance(self.get_covariance(), camera_params)
        # 深度排序 + alpha 混合
        return tile_based_rasterization(
            means_proj, cov_2d, torch.sigmoid(self.opacities),
            self.sh_coeffs, depth
        )`
                }
            ],
            table: {
                headers: ["特性", "NeRF", "3D 高斯溅射", "传统网格"],
                rows: [
                    ["表示类型", "隐式 (MLP)", "显式 (高斯集合)", "显式 (三角面片)"],
                    ["渲染速度", "慢 (秒级)", "极快 (毫秒级)", "快 (毫秒级)"],
                    ["训练速度", "慢 (小时级)", "快 (分钟级)", "N/A"],
                    ["存储大小", "小 (几 MB)", "中 (几十 MB)", "大 (几百 MB)"],
                    ["可编辑性", "差", "好", "好"],
                    ["照片级真实感", "高", "极高", "取决于纹理质量"],
                    ["动态场景", "困难", "支持", "支持"]
                ]
            },
        },
        {
            title: "4. 3D 感知的大语言模型",
            body: `2024-2026 年，一个重要的趋势是大语言模型开始获得 3D 空间理解能力。传统的 VLM（视觉语言模型）只能处理 2D 图像，但新一代的多模态模型开始整合 3D 信息。

GPT-4V 和 Gemini 1.5 已经能够理解图像中的深度关系和 3D 结构——当你展示一张室内照片时，它们不仅能识别出沙发和桌子，还能理解沙发在桌子后面、桌子靠墙放置等空间关系。这种能力的背后是模型在大规模图文数据训练中隐式学习了 3D 几何先验。

更进一步的突破来自专门的 3D-LLM。这类模型将 3D 点云或网格数据与文本对齐，支持 3D 场景问答、3D 目标检测、自然语言驱动的 3D 编辑等任务。例如，你可以用自然语言指令"把红色的椅子移到窗边"来直接编辑 3D 场景。这种能力对于机器人操作、AR 应用和 3D 内容创作具有革命性的意义。

空间世界模型（Spatial World Models）是另一个前沿方向。这类模型不仅理解当前的 3D 场景，还能预测场景在动作作用下的变化——如果推动一个物体，它会如何运动？如果打开一扇门，门后的空间是什么样的？这种对物理世界的因果推理能力是具身智能的核心。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass
from typing import List, Optional

@dataclass
class SpatialUnderstanding:
    """3D 场景的空间理解结果"""
    objects: List[dict]        # 检测到的物体及其 3D 位姿
    surfaces: List[dict]       # 平面（地面、墙面、桌面）
    relationships: List[dict]  # 空间关系（在...上面、在...旁边）
    free_space: List[dict]     # 可行走/可操作区域
    scene_graph: dict          # 场景图结构

class SpatialLLM:
    """3D 空间理解大语言模型"""
    
    def __init__(self, base_llm, point_encoder, spatial_head):
        self.llm = base_llm
        self.point_encoder = point_encoder  # 点云 -> token
        self.spatial_head = spatial_head    # 空间推理头
    
    def understand_scene(self, point_cloud: torch.Tensor,
                         instruction: str) -> SpatialUnderstanding:
        """理解 3D 场景并回答空间问题"""
        # 编码点云为 token
        point_tokens = self.point_encoder(point_cloud)
        
        # 拼接指令 token 和点云 token
        text_tokens = self.llm.tokenize(instruction)
        combined_tokens = torch.cat([text_tokens, point_tokens], dim=1)
        
        # 推理
        output = self.llm(combined_tokens)
        
        # 解析空间理解结果
        return self.spatial_head.parse(output)
    
    def plan_manipulation(self, scene: SpatialUnderstanding,
                          task: str) -> List[dict]:
        """规划机器人操作动作序列"""
        prompt = f"""
        场景理解: {scene}
        任务: {task}
        
        请生成操作动作序列，包括：
        1. 移动路径
        2. 抓取目标
        3. 放置位置
        4. 碰撞避免
        """
        return self.llm.generate_action_sequence(prompt)`
                }
            ],
            tip: "3D-LLM 的训练通常需要大规模的 3D-文本配对数据。ScanRefer、NR3D 和 Scan2Cap 是常用的 3D 语言数据集，包含 3D 场景中的物体描述和空间关系标注。",
        },
        {
            title: "5. 应用场景：从自动驾驶到元宇宙",
            body: `3D 视觉与空间理解技术正在深刻改变多个行业。

自动驾驶是 3D 视觉最成熟的应用场景之一。激光雷达和立体相机提供环境的 3D 点云数据，AI 系统需要实时进行 3D 目标检测、语义分割、场景流估计和运动预测。BEV（Bird's Eye View）感知架构将多摄像头图像转换为鸟瞰图 3D 表示，已经成为自动驾驶感知的主流方案。Tesla 的纯视觉方案更是将 3D 视觉推向了极致——仅用摄像头就能实现精确的 3D 环境重建。

AR/VR 与空间计算是另一个重要应用方向。苹果的 Vision Pro、Meta 的 Quest 系列都需要实时的 3D 环境理解能力：SLAM（同时定位与地图构建）追踪设备在空间中的位置，场景网格化构建环境的 3D 模型，手势追踪理解用户的手部姿态，空间锚定将虚拟内容固定在真实世界的特定位置。3D 高斯溅射的实时渲染能力为这些应用提供了强大的技术支持。

机器人操作（Manipulation）正在经历从 2D 到 3D 的范式转变。传统的机器人操作依赖于精确的 CAD 模型和预编程轨迹，而基于 3D 视觉的方法使机器人能够理解未知物体的 3D 形状、估计抓取点、规划无碰撞的运路径。结合大语言模型的语义理解，机器人现在可以执行"把桌上的红色杯子拿到厨房"这样的高层指令。

数字孪生与工业检测是 3D 视觉的另一个快速增长领域。通过无人机或地面机器人采集的 3D 数据，可以构建工厂、建筑工地、基础设施的高精度数字孪生模型。这些模型支持进度监控、质量检测、安全巡检等多种应用。`,
            table: {
                headers: ["应用领域", "核心技术", "实时性要求", "精度要求"],
                rows: [
                    ["自动驾驶", "BEV 感知、3D 检测", "极高 (<50ms)", "厘米级"],
                    ["AR/VR", "SLAM、场景网格化", "极高 (<16ms)", "毫米级"],
                    ["机器人操作", "3D 抓取检测、运动规划", "高 (<100ms)", "毫米级"],
                    ["数字孪生", "3D 重建、语义分割", "低 (离线)", "厘米级"],
                    ["医学影像", "3D 分割、配准", "中 (秒级)", "亚毫米级"],
                    ["游戏/影视", "3D 资产生成、渲染", "低 (离线)", "视觉真实"]
                ]
            },
        },
        {
            title: "6. 技术优势与核心价值",
            body: `3D 视觉与空间理解为 AI 系统带来了质的飞跃。

首先，3D 表示提供了对物理世界的忠实建模。2D 图像丢失了深度信息，同一张图片可能对应无数种 3D 场景配置。而 3D 表示消除了这种歧义性——场景的几何结构是确定的，可以从任意视角观察。这对于需要精确空间理解的务（如机器人操作、AR 叠加）至关重要。

其次，3D 表示支持跨视角的一致性。NeRF 和 3D 高斯溅射学习的场景表示是新视角不变的——无论从哪个角度观察，场景的外观都保持一致。这种一致性对于 AR 应用尤其重要：虚拟内容需要在用户移动时保持在正确的位置。

第三，3D 场景表示支持物理推理和仿真。有了场景的 3D 模型，就可以模拟物理交互——预测物体碰撞、模拟光照变化、测试不同的设计方案。这种能力在设计审查、虚拟测试和机器人训练中有着广泛的应用。

最后，3D 视觉与语言模型的结合正在创造全新的交互范式。用户可以用自然语言查询和编辑 3D 场景，机器人可以理解高层的语义指令并自主规划操作序列，设计师可以用文字描述来生成 3D 模型。这种自然交互方式正在降低 3D 内容的创作门槛。`,
        },
        {
            title: "7. 挑战与开放问题",
            body: `尽管 3D 视觉取得了巨大进展，但仍面临诸多挑战。

大规模场景的表示和渲染仍然是一个难题。现有的 NeRF 和 3D 高斯溅射方法主要针对房间级别或物体级别的场景。当场景扩展到城市规模（如自动驾驶中的整个街区），表示的存储和渲染开销变得不可接受。分块表示、层次化细节（LOD）和流式加载是可能的解决方向，但仍需要更多的工程优化。

动态场景的 3D 理解比静态场景复杂得多。真实世界中的物体在运动——行人走过、汽车行驶、树叶摇曳。虽然动态 3D 高斯溅射已经取得了一些进展，但处理复杂的非刚性变形（如人体运动、流体模拟）仍然非常困难。4D 重建（3D + 时间）需要同时建模空间和时间维度的变化，这对表示能力和计算效率都提出了更高要求。

3D 数据的获取成本仍然较高。高质量的 3D 重建需要密集的相机覆盖或昂贵的激光雷达设备。相比之下，互联网上有数十亿的 2D 图像，但高质量的 3D 数据集仍然有限。这限制了 3D 视觉模型的训练规模和泛化能力。从 2D 图像中学习 3D 先验（如 DUSt3R、MVSplat 等方法）是一个有希望的方向，但仍无法完全替代真实的 3D 监督信号。

3D 场景理解与大语言模型的深度融合还处于早期阶段。当前的 3D-LLM 主要处理点云数据，但点云本身缺乏纹理和材质信息。如何将高精度的几何表示（网格、高斯）与语义理解有效结合，如何让语言模型推理 3D 空间中的物理约束（重力、碰撞、支撑关系），都是需要解决的问题。`,
            warning: "在工业应用中，3D 重建的精度和可靠性是关键考量。NeRF 和 3DGS 在视觉效果上表现出色，但在需要精确几何测量（如工业检测、建筑设计）的场景中，传统的多视角立体几何（MVS）方法仍然更可靠。选择技术方案时要根据具体需求权衡。",
        },
        {
            title: "8. 未来展望：世界模型与具身智能",
            body: `3D 视觉与空间理解的未来发展方向令人兴奋。

世界模型（World Models）是其中一个最具前景的方向。世界模型不仅重建当前的 3D 场景，还能预测场景在动作作用下的未来状态。想象一个机器人看到一个桌子上的水杯——世界模型不仅能理解杯子的 3D 形状和位置，还能预测如果我推它一下，杯子会怎样滑动、是否会掉落。这种对物理世界的因果推理能力是通用人工智能的核心组成部分。

Sora 和其他视频生成模型已经展示了初步的世界模型能力——它们生成的视频在物理上基本合理，物体运动遵循重力和碰撞规律。但这些模型仍然是隐式的，不显式表示 3D 几何结构。未来的方向是将显式的 3D 表示与世界模型的预测能力结合起来，创造既能精确重建又能准确预测的 3D 世界模型。

具身智能（Embodied AI）是 3D 空间理解的终极应用场景。当机器人能够在真实世界中导航、操作和交互时，3D 视觉不再是一个独立的任务，而是机器人感知-决策-行动循环的核心环节。Figure 01、Tesla Optimus 等人形机器人已经展示了初步的 3D 操作能力，但要达到人类水平的灵巧操作，还需要在 3D 感知、物理推理和运动控制方面取得更大的突破。

空间计算平台的成熟将为 3D 视觉带来新的机遇。随着 Apple Vision Pro、Meta Quest 等设备的普及，对实时 3D 环境理解的需求将呈指数级增长。3D 高斯溅射等高效表示方法将成为这些平台的基础设施，支撑从社交应用到工业设计的各种场景。`,
        },
        {
            title: "9. 总结",
            body: `3D 视觉与空间理解是 AI 领域发展最快的方向之一。从 NeRF 的隐式表示到 3D 高斯溅射的显式表示，从静态场景重建到动态 4D 理解，从纯视觉任务到与语言模型和机器人的深度融合，这一领域在短短几年内取得了惊人的进展。

对于 AI 工程师来说，3D 视觉提供了一个独特而有价值的技能组合。它结合了传统几何学的严谨性（相机模型、多视角几何、优化理论）和深度学习的强大表示能力（NeRF、高斯溅射、3D-LLM）。掌握 3D 视觉不仅能让你在自动驾驶、AR/VR、机器人等前沿领域中找到机会，还能帮助你更深入地理解 AI 如何感知和理解物理世界。

学习路径建议：从传统多视角几何开始，理解相机模型和三角测量；然后学习 NeRF 及其变体，掌握隐式 3D 表示；接着学习 3D 高斯溅射，理解显式 3D 表示的优势；最后探索 3D-LLM 和世界模型，了解 3D 视觉与语义理解的融合。实践方面，可以从开源的 nerfstudio 框架入手，它提供了从数据准备到渲染的完整管线，是学习 3D 视觉的最佳实践平台。

3D 世界正在向 AI 敞开大门。从 2D 像素到 3D 几何，从被动观察到主动理解，从静态重建到动态预测——这条进化路径不仅是技术的进步，更是 AI 系统向真正理解物理世界迈出的关键一步。`,
            mermaid: `graph LR
    A["2D 像素"] --> B["深度图"]
    B --> C["点云/网格"]
    C --> D["NeRF"]
    D --> E["3D 高斯溅射"]
    E --> F["3D-LLM"]
    F --> G["世界模型"]
    G --> H["具身智能"]
    
    style A fill:#7f1d1d
    style H fill:#14532d`,
            tip: "推荐工具：nerfstudio（3D 重建框架）、gsplat（高斯溅射优化库）、Open3D（3D 数据处理）、Kaolin（NVIDIA 3D 深度学习库）、Three.js（Web 3D 可视化）。这些工具覆盖了从数据处理到渲染可视化的完整工作流。",
        }
    ]
};
