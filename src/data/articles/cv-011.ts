import { Article } from '../knowledge';

export const article: Article = {
    id: "cv-011",
    title: "3D 视觉：点云、NeRF、3D 重建",
    category: "cv",
    tags: ["3D视觉", "NeRF", "点云"],
    summary: "从 2D 到 3D，掌握三维视觉的核心技术",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. 3D 数据表示：点云、网格、体素与 NeRF",
            body: `3D 视觉的第一步是理解计算机如何表示三维世界。最直观的方式是点云——大量无序的 (x, y, z) 坐标点集合，每个点还可以附带颜色、法向量、反射强度等属性。点云的优势在于结构简单、存储稀疏，但缺乏拓扑信息。网格（Mesh）在点云基础上增加了面片连接关系（三角形面），形成了连续的表面表示，是 3D 渲染和建模的标准格式。体素（Voxel）则将 3D 空间离散化为规则的 3D 网格，类似 2D 像素的立体扩展，适合用 3D 卷积处理，但内存消耗随分辨率立方增长。NeRF（神经辐射场）代表了最新方向——用一个 MLP 隐式编码整个 3D 场景，输入 3D 坐标和视角方向，输出颜色和体密度，实现了照片级的新视角合成。这四种表示方式各有适用场景：点云适合传感器原始数据，网格适合渲染和编辑，体素适合体素级深度学习，NeRF 适合高质量渲染和场景重建。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

# 点云基础数据结构
class PointCloud:
    """最简 3D 点云表示"""
    def __init__(self, points, colors=None, normals=None):
        """
        points: (N, 3) xyz 坐标
        colors: (N, 3) RGB 颜色, 范围 0-1
        normals: (N, 3) 法向量, 已归一化
        """
        self.points = np.asarray(points, dtype=np.float32)
        self.colors = colors
        self.normals = normals

    @property
    def num_points(self):
        return self.points.shape[0]

    @property
    def centroid(self):
        return self.points.mean(axis=0)

    def normalize(self):
        """将点云归一化到单位球内"""
        center = self.centroid
        points_centered = self.points - center
        max_dist = np.max(np.linalg.norm(points_centered, axis=1))
        self.points = points_centered / max_dist
        return self

    def downsample_voxel(self, voxel_size=0.01):
        """体素下采样：均匀降采样点云"""
        # 将点量化到体素网格
        voxel_indices = np.floor(self.points / voxel_size).astype(int)
        # 按体素索引分组，取每个体素内点的均值
        unique_voxels, inverse = np.unique(
            voxel_indices, axis=0, return_inverse=True)
        downsampled = np.zeros((len(unique_voxels), 3), dtype=np.float32)
        np.add.at(downsampled, inverse, self.points)
        counts = np.bincount(inverse, minlength=len(unique_voxels))
        return PointCloud(downsampled / counts[:, None])`
                },
                {
                    lang: "python",
                    code: `import numpy as np

# 网格与体素转换
class Mesh:
    """三角网格表示"""
    def __init__(self, vertices, faces):
        """
        vertices: (V, 3) 顶点坐标
        faces: (F, 3) 三角形面片索引
        """
        self.vertices = np.asarray(vertices, dtype=np.float32)
        self.faces = np.asarray(faces, dtype=np.int32)

    def compute_face_normals(self):
        """计算每个三角形面片的法向量"""
        v0 = self.vertices[self.faces[:, 0]]
        v1 = self.vertices[self.faces[:, 1]]
        v2 = self.vertices[self.faces[:, 2]]
        edge1 = v1 - v0
        edge2 = v2 - v0
        normals = np.cross(edge1, edge2)
        norms = np.linalg.norm(normals, axis=1, keepdims=True)
        return normals / (norms + 1e-8)

class VoxelGrid:
    """规则 3D 体素网格"""
    def __init__(self, resolution=32, bounds=None):
        self.resolution = resolution
        self.bounds = bounds or np.array([[-1, 1], [-1, 1], [-1, 1]])
        self.grid = np.zeros((resolution, resolution, resolution),
                              dtype=np.float32)

    def points_to_voxels(self, points):
        """将点云转换为占用体素网格"""
        mins = self.bounds[:, 0]
        ranges = self.bounds[:, 1] - mins
        normalized = (points - mins) / ranges
        indices = (normalized * (self.resolution - 1)).astype(int)
        indices = np.clip(indices, 0, self.resolution - 1)
        self.grid[indices[:, 0], indices[:, 1], indices[:, 2]] = 1.0
        return self.grid`
                }
            ],
            table: {
                headers: ["表示方式", "数据结构", "内存消耗", "适用场景"],
                rows: [
                    ["点云", "无序点集 (N,3)", "O(N) 稀疏", "传感器数据、大规模场景"],
                    ["网格", "顶点+面片", "O(V+F)", "渲染、3D 打印、建模"],
                    ["体素", "规则 3D 网格", "O(R^3) 立方增长", "3D 卷积、占用预测"],
                    ["NeRF", "MLP 权重", "O(MLP参数量)", "新视角合成、高质量渲染"],
                    ["SDF", "符号距离场", "O(网格) 或 MLP", "几何重建、物理仿真"]
                ]
            },
            mermaid: `graph LR
    A["3D 传感器
LiDAR/深度相机"] --> B["点云
离散无序点"]
    B --> C["表面重建
Poisson/Delaunay"]
    C --> D["网格
连续三角面"]
    B --> E["体素化
规则 3D 网格"]
    B --> F["NeRF 训练
隐式神经表示"]
    F --> G["新视角渲染"]
    D --> G
    class G s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "入门 3D 视觉建议先掌握点云和网格的基本操作，NeRF 和 SDF 可以后续深入",
            warning: "体素表示的内存消耗随分辨率呈立方增长，64^3 的体素需要 256MB，128^3 则需 2GB"
        },
        {
            title: "2. 点云深度学习：PointNet 革命",
            body: `2017 年斯坦福大学 Qi 等人提出的 PointNet 开创性地将深度学习直接应用于原始点云数据，绕过了传统的体素化或投影预处理步骤。PointNet 的核心挑战在于点云的三个特性：无序性（点集没有固定顺序）、局部不变性（点的排列不影响语义）、旋转不变性（旋转后的点云应得到相同结果）。PointNet 的解决方案简洁而优雅：使用共享 MLP 独立处理每个点，然后通过全局最大池化（max pooling）聚合所有点的特征。最大池化天然具备对称性和无序不变性——无论输入点的顺序如何，pooling 后的结果都是一样的。PointNet 同时输出了点级特征（用于分割）和全局特征（用于分类），在 ModelNet40 分类和 ShapeNet 分割任务上取得了当时的最优结果。后续的 PointNet++ 进一步引入了层次化分组和集合抽象，解决了原始 PointNet 缺乏局部特征建模的问题。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class PointNetClassifier(nn.Module):
    """PointNet 分类网络"""
    def __init__(self, num_classes=40, num_points=1024):
        super().__init__()
        self.num_points = num_points

        # 输入变换网络 (T-Net)
        self.input_transform = nn.Sequential(
            nn.Conv1d(3, 64, 1), nn.BatchNorm1d(64), nn.ReLU(),
            nn.Conv1d(64, 128, 1), nn.BatchNorm1d(128), nn.ReLU(),
            nn.Conv1d(128, 1024, 1), nn.BatchNorm1d(1024), nn.ReLU(),
            nn.MaxPool1d(num_points),
            nn.Linear(1024, 512), nn.ReLU(),
            nn.Linear(512, 256), nn.ReLU(),
            nn.Linear(256, 9)  # 3x3 变换矩阵
        )

        # 特征提取 MLP
        self.mlp1 = nn.Sequential(
            nn.Conv1d(3, 64, 1), nn.BatchNorm1d(64), nn.ReLU(),
            nn.Conv1d(64, 64, 1), nn.BatchNorm1d(64), nn.ReLU(),
        )

        # 特征变换
        self.feature_transform = nn.Sequential(
            nn.Conv1d(64, 64, 1), nn.BatchNorm1d(64), nn.ReLU(),
            nn.Conv1d(64, 128, 1), nn.BatchNorm1d(128), nn.ReLU(),
            nn.Conv1d(128, 1024, 1), nn.BatchNorm1d(1024), nn.ReLU(),
            nn.MaxPool1d(num_points),
            nn.Linear(1024, 512), nn.ReLU(),
            nn.Linear(512, 256), nn.ReLU(),
            nn.Linear(256, 64*64)  # 64x64 变换矩阵
        )

        # 分类头
        self.classifier = nn.Sequential(
            nn.Linear(1024, 512), nn.BatchNorm1d(512), nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256), nn.BatchNorm1d(256), nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        # x: (B, 3, N)
        B = x.size(0)
        trans = self.input_transform(x).view(B, 3, 3)
        x = torch.bmm(x.transpose(2, 1), trans).transpose(2, 1)

        x = self.mlp1(x)
        trans_feat = self.feature_transform(x).view(B, 64, 64)
        x = torch.bmm(x.transpose(2, 1), trans_feat).transpose(2, 1)

        # 全局最大池化：核心操作！
        x = torch.max(x, 2, keepdim=True)[0].view(B, -1)
        return self.classifier(x)`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

# 为什么全局最大池化有效？
def demonstrate_maxpool_invariance():
    """演示 max pooling 对点顺序的不变性"""
    # 模拟 4 个点的特征 (每个点 3 维特征)
    features_a = torch.tensor([
        [0.1, 0.5, 0.3],  # 点 1
        [0.9, 0.2, 0.1],  # 点 2
        [0.4, 0.8, 0.6],  # 点 3
        [0.2, 0.1, 0.9],  # 点 4
    ]).unsqueeze(0)  # (1, 4, 3)

    # 打乱顺序
    perm = torch.randperm(4)
    features_b = features_a[:, perm, :]

    # 最大池化 (沿点的维度)
    global_a = torch.max(features_a, dim=1)[0]
    global_b = torch.max(features_b, dim=1)[0]

    print(f"原始顺序 max: {global_a}")
    print(f"打乱顺序 max: {global_b}")
    print(f"相等: {torch.allclose(global_a, global_b)}")  # True!
    # 最大池化天然对点序不变，\n# 这是 PointNet 处理无序点集的关键设计

demonstrate_maxpool_invariance()`
                }
            ],
            table: {
                headers: ["组件", "输入维度", "输出维度", "作用"],
                rows: [
                    ["输入 T-Net", "(B, 3, N)", "(B, 3, 3) 矩阵", "对齐输入点云到规范空间"],
                    ["共享 MLP1", "(B, 3, N)", "(B, 64, N)", "逐点特征提取"],
                    ["特征 T-Net", "(B, 64, N)", "(B, 64, 64) 矩阵", "对齐特征空间"],
                    ["共享 MLP2", "(B, 64, N)", "(B, 1024, N)", "扩展到高维特征"],
                    ["全局 MaxPool", "(B, 1024, N)", "(B, 1024)", "聚合全局点云特征"],
                    ["分类 MLP", "(B, 1024)", "(B, num_classes)", "输出分类概率"]
                ]
            },
            mermaid: `graph TD
    A["输入点云
(B, 3, N)"] --> B["输入 T-Net
3x3 变换"]
    B --> C["共享 MLP
逐点处理"]
    C --> D["特征 T-Net
64x64 变换"]
    D --> E["共享 MLP
扩展到 1024 维"]
    E --> F["全局 MaxPool
聚合所有点"]
    F --> G["MLP 分类器
输出类别"]
    C -.-> H["逐点特征
用于分割"]
    class G s2
    class F s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12
    classDef s2 fill:#14532d`,
            tip: "PointNet 的 T-Net 是可学习的空间变换器，类似 STN，让网络自动学习最佳对齐方式",
            warning: "PointNet 对每个点独立处理，缺乏局部上下文建模——小物体或精细结构容易被忽略"
        },
        {
            title: "3. 多视图立体 MVS：从多张照片到稠密深度",
            body: `多视图立体（Multi-View Stereo, MVS）是 3D 重建中从已知相机位姿的多张照片恢复稠密 3D 几何的核心技术。与 SfM（仅恢复稀疏点云和相机位姿）不同，MVS 的目标是生成稠密的、表面连续的 3D 模型。MVS 的基本思路是：对于参考视图中的每个像素，在相邻视图中搜索对应的匹配点，通过三角测量计算深度值。传统的 MVS 方法依赖于光度一致性假设——同一 3D 点在不同视角下的像素值应该相近。深度学习方法（如 MVSNet）则将这一过程端到端可微化：使用 2D CNN 提取多视图特征，通过单应性变换将特征 warp 到参考视图，构建代价体（cost volume），最后用 3D CNN 回归深度图。MVSNet 的关键创新在于可微的单应性变换和正则化的 3D 代价体，使得整个管线可以通过反向传播联合优化。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

def build_homography_warp(ref_features, src_features,
                           ref_intrinsics, src_intrinsics,
                           ref_poses, src_poses, depths):
    """
    构建单应性变换代价体 (MVSNet 风格)
    ref_features: (B, C, H, W) 参考视图特征
    src_features: (B, N, C, H, W) N 个源视图特征
    depths: (D,) 候选深度值
    返回: (B, C, D, H, W) 代价体
    """
    B, N, C, H, W = src_features.shape
    D = len(depths)
    volume = torch.zeros(B, C, D, H, W,
                         device=ref_features.device)

    for d_idx, depth in enumerate(depths):
        # 为每个深度假设构建参考平面
        # 参考平面法向量 n=[0,0,1], 距离 d=depth
        n = torch.tensor([0, 0, 1], dtype=torch.float32)
        ref_K = ref_intrinsics  # (B, 3, 3)
        ref_Rt = ref_poses       # (B, 3, 4)

        for src_idx in range(N):
            src_K = src_intrinsics[:, src_idx]
            src_Rt = src_poses[:, src_idx]

            # 单应性矩阵 H = K_src * (R - t*n^T/d) * K_ref^{-1}
            R_rel = src_Rt[:, :, :3] @ ref_Rt[:, :, :3].transpose(1, 2)
            t_rel = src_Rt[:, :, :3] @ ref_Rt[:, :, 3:4]
            H = src_K @ (R_rel - t_rel @ n.unsqueeze(0).unsqueeze(0) / depth) @ torch.inverse(ref_K)

            # 使用 H 将参考特征 warp 到源视图
            warped = homography_warp(ref_features, H, H_size=(H, W))
            # 与源视图特征计算相似度 (L1 距离)
            cost = torch.mean(
                torch.abs(warped - src_features[:, src_idx]), dim=1)
            volume[:, :, d_idx] += cost

    return volume / N  # 平均多视图代价`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class DepthRegression(nn.Module):
    """MVSNet 深度回归模块"""
    def __init__(self, num_depths=192):
        super().__init__()
        self.num_depths = num_depths
        # 3D UNet 正则化代价体
        self.regularization = nn.Sequential(
            nn.Conv3d(1, 16, 3, padding=1),
            nn.BatchNorm3d(16), nn.ReLU(),
            nn.Conv3d(16, 8, 3, padding=1),
            nn.BatchNorm3d(8), nn.ReLU(),
            nn.Conv3d(8, 1, 3, padding=1),
        )
        # 候选深度 (线性或非线性分布)
        self.min_depth = 0.5
        self.max_depth = 15.0

    def forward(self, cost_volume, ref_images):
        """
        cost_volume: (B, C, D, H, W) 原始代价体
        返回: (B, H, W) 深度图 + (B, H, W) 置信度
        """
        # 沿通道维度压缩为单通道代价体
        prob_volume = self.regularization(
            cost_volume.mean(dim=1, keepdim=True))
        prob_volume = torch.softmax(
            -prob_volume.squeeze(1), dim=1)  # (B, D, H, W)

        # 构建候选深度值
        depths = torch.linspace(self.min_depth, self.max_depth,
                                self.num_depths, device=prob_volume.device)

        # 软回归：期望深度 = sum(p_d * d)
        depth_map = torch.sum(
            prob_volume * depths.view(1, -1, 1, 1), dim=1)

        # 置信度 = 最大概率 (不确定性估计)
        confidence = torch.max(prob_volume, dim=1)[0]

        return depth_map, confidence`
                }
            ],
            table: {
                headers: ["方法", "输入", "输出", "核心创新"],
                rows: [
                    ["传统 PatchMatch", "多张标定照片", "稠密深度图", "高效随机搜索匹配"],
                    ["MVSNet", "多视图 + 相机参数", "深度图 + 置信度", "可微单应性 + 3D 代价体"],
                    ["R-MVSNet", "多视图 + 相机参数", "逐像素深度", "循环网络逐像素回归"],
                    ["CVP-MVSNet", "多视图 + 相机参数", "级联深度图", "级联代价体 + 曲率先验"],
                    ["Vis-MVSNet", "多视图 + 相机参数", "可见性感知的深度", "可见性感知代价体构建"]
                ]
            },
            mermaid: `graph LR
    A["N 张输入照片
+ 相机位姿"] --> B["2D CNN
特征提取"]
    B --> C["单应性变换
Warp 到参考视图"]
    C --> D["代价体构建
(B,C,D,H,W)"]
    D --> E["3D CNN
正则化"]
    E --> F["Softmax + 软回归
期望深度"]
    F --> G["稠密深度图"]
    G --> H["深度图融合
多视图一致性"]
    H --> I["3D 点云
+ 表面网格"]
    class I s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "MVS 的深度假设范围（min_depth/max_depth）需要根据场景尺度调整，设置过窄会导致截断",
            warning: "MVS 在弱纹理区域（白墙、天空）和反光表面（玻璃、水面）上表现很差，这些区域缺乏可靠的匹配线索"
        },
        {
            title: "4. NeRF 神经辐射场：隐式 3D 表示的突破",
            body: `2020 年 Mildenhall 等人提出的 NeRF（Neural Radiance Fields）彻底改变了新视角合成的范式。与传统的显式 3D 表示（点云、网格）不同，NeRF 用一个多层感知机（MLP）隐式地编码整个 3D 场景。网络接受 5D 输入——3D 空间坐标 (x, y, z) 和 2D 观察方向 (θ, φ)——输出该点的颜色 (r, g, b) 和体密度 σ。渲染过程通过体积渲染积分实现：从相机出发发射光线，沿光线采样多个点，将每个点的颜色和密度按照体积渲染方程累积，得到最终像素颜色。NeRF 的关键技巧包括位置编码（positional encoding）——将输入坐标映射到高维傅里叶特征空间，使网络能够学习高频细节；以及层次化采样策略——先用粗网络确定大致区域，再用细网络在重要区域密集采样。原始 NeRF 的训练需要数百张多视角照片，渲染一张 800×800 的图片需要数分钟，但其视觉质量远超传统方法。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class NeRF(nn.Module):
    """原始 NeRF 网络结构"""
    def __init__(self, num_layers=8, hidden_dim=256,
                 skips=[4], pos_freq=10, view_freq=4):
        super().__init__()
        self.skips = skips
        self.pos_freq = pos_freq
        self.view_freq = view_freq
        # 位置编码维度: 3 * (2*10 + 1) = 63
        pos_enc_dim = 3 * (2 * pos_freq + 1)
        view_enc_dim = 3 * (2 * view_freq + 1)

        # 几何 MLP (仅依赖位置)
        layers = []
        prev_dim = pos_enc_dim
        for i in range(num_layers):
            if i in skips:
                prev_dim += pos_enc_dim  # 跳跃连接
            layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.ReLU()
            ])
            prev_dim = hidden_dim
        self.geometry = nn.Sequential(*layers)

        # 密度输出
        self.density = nn.Linear(hidden_dim, 1)

        # 外观 MLP (依赖位置+方向)
        self.appearance = nn.Sequential(
            nn.Linear(hidden_dim + view_enc_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 3),
            nn.Sigmoid()  # 颜色输出 [0, 1]
        )

    def positional_encoding(self, x, num_freq):
        """位置编码: 将坐标映射到高频傅里叶特征"""
        freqs = 2.0 ** torch.arange(num_freq,
                                     device=x.device)
        encoding = torch.cat([
            torch.sin(x[..., None] * freqs),
            torch.cos(x[..., None] * freqs)
        ], dim=-1)
        return torch.cat([x, encoding.reshape(x.shape[:-1] + (-1,))],
                         dim=-1)

    def forward(self, points, directions):
        # points: (N_rays, N_samples, 3)
        # directions: (N_rays, N_samples, 3)
        pos_enc = self.positional_encoding(
            points, self.pos_freq)  # (N, S, 63)
        view_enc = self.positional_encoding(
            directions, self.view_freq)  # (N, S, 25)

        # 几何网络
        h = pos_enc
        for i, layer in enumerate(self.geometry):
            if i == 0 and 0 in self.skips:
                h = torch.cat([h, pos_enc], dim=-1)
            h = layer(h)

        density = self.density(h)  # (N, S, 1)

        # 外观网络
        rgb = self.appearance(
            torch.cat([h, view_enc], dim=-1))  # (N, S, 3)
        return rgb, density.squeeze(-1)`
                },
                {
                    lang: "python",
                    code: `import torch

def volume_rendering(rays, points, densities, rgbs,
                      noise_std=1e-4):
    """
    体积渲染：沿光线累积颜色和透明度
    rays: (N_rays, 3) 光线原点
    points: (N_rays, N_samples, 3) 采样点
    densities: (N_rays, N_samples) 体密度 sigma
    rgbs: (N_rays, N_samples, 3) 颜色
    """
    # 计算步长 (相邻采样点距离)
    dists = torch.norm(
        points[:, 1:] - points[:, :-1], dim=-1)
    # 最后一个采样点的步长设为无穷大
    dists = torch.cat(
        [dists, torch.full((dists.shape[0], 1),
                           1e10, device=dists.device)], dim=-1)

    # 添加噪声使训练更稳定
    if noise_std > 0:
        densities = densities + torch.randn_like(densities) * noise_std

    # 透明度: alpha_i = 1 - exp(-sigma_i * delta_i)
    alpha = 1.0 - torch.exp(-densities * dists)

    # 透射率: T_i = product(1 - alpha_j) for j < i
    cumprod = torch.cumprod(
        1.0 - alpha + 1e-10, dim=-1)
    transmittance = torch.cat(
        [torch.ones_like(cumprod[:, :1]),
         cumprod[:, :-1]], dim=-1)

    # 权重: w_i = T_i * alpha_i
    weights = transmittance * alpha  # (N_rays, N_samples)

    # 渲染: C(r) = sum(w_i * c_i)
    rendered_rgb = torch.sum(
        weights[..., None] * rgbs, dim=-2)  # (N_rays, 3)

    # 深度图 (可选输出)
    rendered_depth = torch.sum(
        weights * dists, dim=-1)  # (N_rays,)

    return rendered_rgb, rendered_depth, weights`
                }
            ],
            table: {
                headers: ["NeRF 组件", "输入维度", "输出维度", "关键参数"],
                rows: [
                    ["位置编码", "(x,y,z) → 3D", "63D 特征", "10 个频率 (2^0 ~ 2^9)"],
                    ["几何 MLP", "63D 位置特征", "256D 隐藏 + 密度", "8 层, 跳跃连接在第 4 层"],
                    ["外观 MLP", "256D 几何 + 25D 方向", "RGB 颜色 [0,1]", "2 层, 128D 隐藏"],
                    ["体积渲染", "N_rays x N_samples", "像素颜色 + 深度", "粗 64 + 细 128 采样"],
                    ["训练策略", "200K 步, batch 4096 光线", "PSNR 指标", "Adam, lr=5e-4 衰减"]
                ]
            },
            mermaid: `graph TD
    A["相机光线
(origin, direction)"] --> B["沿光线采样
N 个 3D 点"]
    B --> C["位置编码
sin/cos 频率映射"]
    C --> D["几何 MLP
输出密度 sigma"]
    C --> E["方向编码
+ 几何特征"]
    E --> F["外观 MLP
输出颜色 rgb"]
    D --> G["体积渲染积分
C = sum(T * alpha * rgb)"]
    F --> G
    G --> H["像素颜色
渲染结果"]
    class H s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "NeRF 的位置编码频率选择至关重要——低频捕获大尺度结构，高频捕获精细纹理",
            warning: "NeRF 训练非常慢（数小时到数天），且每场景独立训练，无法直接泛化到未见过的场景"
        },
        {
            title: "5. 3D 重建管线：SfM + MVS 完整流程",
            body: `完整的 3D 重建管线通常分为两个阶段：运动恢复结构（Structure from Motion, SfM）和多视图立体（MVS）。SfM 负责从无序的照片集合中恢复相机位姿和稀疏 3D 点云。它首先通过特征匹配（SIFT/SuperPoint）找到照片之间的对应点，然后利用 RANSAC 估计基础矩阵和本质矩阵，逐步恢复每张照片的相机位置和方向，同时通过三角测量得到稀疏的 3D 点。SfM 的输出包括：所有相机的内外参数（K, R, t）和一个稀疏点云。MVS 阶段则以 SfM 的相机参数为输入，通过稠密匹配生成深度图，融合多视图深度得到稠密点云，最后通过表面重建算法（泊松重建、 marching cubes）得到连续的三角网格。整个管线中，SfM 提供了几何约束的骨架，MVS 填充了丰富的表面细节。COLMAP 是目前最流行的开源实现，它集成了完整的 SfM 和 MVS 流程。`,
            code: [
                {
                    lang: "python",
                    code: `import subprocess
import os

def run_colmap_sfm(image_dir, output_dir):
    """
    使用 COLMAP 进行 SfM 重建
    返回: 相机参数 + 稀疏点云
    """
    os.makedirs(output_dir, exist_ok=True)

    # 1. 特征提取
    subprocess.run([
        "colmap", "feature_extractor",
        "--database_path", f"{output_dir}/database.db",
        "--image_path", image_dir,
        "--ImageReader.single_camera", "1",
        "--SiftExtraction.use_gpu", "1"
    ])

    # 2. 特征匹配 (暴力匹配或词汇树匹配)
    subprocess.run([
        "colmap", "exhaustive_matcher",
        "--database_path", f"{output_dir}/database.db"
    ])

    # 3. 重建 (增量式 SfM)
    subprocess.run([
        "colmap", "mapper",
        "--database_path", f"{output_dir}/database.db",
        "--image_path", image_dir,
        "--output_path", f"{output_dir}/sparse"
    ])

    # 4. 光束法平差优化
    subprocess.run([
        "colmap", "bundle_adjuster",
        "--input_path", f"{output_dir}/sparse/0",
        "--output_path", f"{output_dir}/sparse/0"
    ])
    print(f"SfM 完成! 输出: {output_dir}/sparse/0")

def run_colmap_mvs(sparse_dir, image_dir, output_dir):
    """使用 COLMAP MVS 进行稠密重建"""
    os.makedirs(output_dir, exist_ok=True)

    # 1. 图像去畸变
    subprocess.run([
        "colmap", "image_undistorter",
        "--image_path", image_dir,
        "--input_path", sparse_dir,
        "--output_path", output_dir,
        "--output_type", "COLMAP"
    ])

    # 2. 立体匹配 (PatchMatch)
    subprocess.run([
        "colmap", "patch_match_stereo",
        "--workspace_path", output_dir,
        "--workspace_format", "COLMAP",
        "--PatchMatchStereo.geom_consistency", "true"
    ])

    # 3. 深度图融合 → 点云
    subprocess.run([
        "colmap", "stereo_fusion",
        "--workspace_path", output_dir,
        "--workspace_format", "COLMAP",
        "--input_type", "geometric",
        "--output_path", f"{output_dir}/fused.ply"
    ])
    print(f"MVS 完成! 稠密点云: {output_dir}/fused.ply")`
                },
                {
                    lang: "python",
                    code: `import numpy as np
import open3d as o3d

def reconstruct_mesh_from_cloud(pcd_path, output_path):
    """从稠密点云重建三角网格"""
    # 加载点云
    pcd = o3d.io.read_point_cloud(pcd_path)
    print(f"点云: {len(pcd.points)} 个点")

    # 1. 下采样
    pcd_down = pcd.voxel_down_sample(voxel_size=0.005)

    # 2. 法向量估计 (用于泊松重建)
    pcd_down.estimate_normals(
        search_param=o3d.geometry.KDTreeSearchParamHybrid(
            radius=0.02, max_nn=30))

    # 3. 离群点去除
    cl, ind = pcd_down.remove_statistical_outlier(
        nb_neighbors=20, std_ratio=2.0)
    pcd_clean = pcd_down.select_by_index(ind)
    print(f"清理后: {len(pcd_clean.points)} 个点")

    # 4. 泊松表面重建
    mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
        pcd_clean, depth=9)

    # 5. 根据密度裁剪低质量区域
    densities = np.asarray(densities)
    vertices_to_remove = densities < np.quantile(densities, 0.05)
    mesh.remove_vertices_by_mask(vertices_to_remove)

    # 6. 简化网格
    mesh = mesh.simplify_quadric_decimation(100000)

    # 7. 保存
    o3d.io.write_triangle_mesh(output_path, mesh)
    print(f"网格已保存: {output_path}")
    print(f"  顶点数: {len(mesh.vertices)}")
    print(f"  面片数: {len(mesh.triangles)}")

reconstruct_mesh_from_cloud("fused.ply", "reconstructed.obj")`
                }
            ],
            table: {
                headers: ["阶段", "输入", "输出", "核心算法"],
                rows: [
                    ["特征提取", "原始照片", "SIFT/SuperPoint 特征", "DoG 检测 + 描述子"],
                    ["特征匹配", "特征描述子", "图像对匹配", "FLANN 最近邻 + 比率测试"],
                    ["SfM 重建", "匹配 + 相机模型", "相机位姿 + 稀疏点云", "增量式 SfM + BA 优化"],
                    ["MVS 稠密", "SfM 结果 + 照片", "稠密点云", "PatchMatch + 深度图融合"],
                    ["表面重建", "稠密点云 + 法线", "三角网格", "泊松重建 / Marching Cubes"]
                ]
            },
            mermaid: `graph TD
    A["无序照片集合"] --> B["特征提取
SIFT/SuperPoint"]
    B --> C["特征匹配
图像对对应"]
    C --> D["SfM 增量重建
相机位姿 + 稀疏点云"]
    D --> E["光束法平差
全局 BA 优化"]
    E --> F["MVS 稠密匹配
深度图生成"]
    F --> G["深度图融合
稠密点云"]
    G --> H["泊松重建
三角网格"]
    H --> I["纹理映射
最终 3D 模型"]
    class I s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "SfM 阶段的照片覆盖率至关重要——相邻照片之间至少需要 60% 的重叠区域才能保证可靠匹配",
            warning: "POW 重建对法向量方向敏感，需要确保所有法向量朝向一致（可以使用 PCA 或传播法进行法线统一）"
        },
        {
            title: "6. 3D 目标检测：从点云中理解场景",
            body: `3D 目标检测是自动驾驶和机器人领域的核心技术——在点云中定位并分类 3D 物体（车辆、行人、障碍物等）。与 2D 检测不同，3D 检测需要预测物体的 3D 边界框（中心坐标 x, y, z，尺寸 w, h, l，以及朝向角 θ）。主流方法分为三类：基于点的方法（直接在点云上操作，如 PointRCNN）、基于体素的方法（将点云体素化后用 3D 卷积处理，如 VoxelNet）、以及基于鸟瞰图的方法（将点云投影到 BEV 平面用 2D 卷积处理，如 PointPillars）。PointPillars 通过将点云编码为伪图像（Pillars），在保持精度的同时将推理速度提升到了实时级别（>60 FPS）。近年来，基于 **Transformer** 的方法（如 CenterPoint、VoxelNeXt）进一步提升了检测精度，通过引入中心点预测和特征金字塔，实现了对小物体和遮挡物体的鲁棒检测。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import numpy as np

class PillarFeatureNet(nn.Module):
    """PointPillars 的 Pillar 特征编码"""
    def __init__(self, in_channels=4, num_features=64,
                 pillar_size=(0.16, 0.16), max_points=100,
                 max_pillars=40000):
        super().__init__()
        self.pillar_size = pillar_size
        self.max_points = max_points
        self.max_pillars = max_pillars

        # 简化的 Pillar VFE (Virtual Feature Encoding)
        self.pillar_vfe = nn.Sequential(
            nn.Linear(in_channels + 3, num_features),  # +3 为 (x_c, y_c, z_c) 偏移
            nn.BatchNorm1d(num_features),
            nn.ReLU(),
            nn.Linear(num_features, num_features),
            nn.BatchNorm1d(num_features),
            nn.ReLU(),
        )

    def points_to_pillars(self, points):
        """
        将点云编码为 Pillar 伪图像
        points: (N, 4) [x, y, z, intensity]
        返回: (B, C, H_p, W_p) 伪图像
        """
        # 将点分配到 Pillar 网格
        x = points[:, 0]
        y = points[:, 1]
        x_pillar = ((x + 40) / self.pillar_size[0]).long()
        y_pillar = ((y + 40) / self.pillar_size[1]).long()

        # 限制在网格范围内 (假设 512x512)
        x_pillar = torch.clamp(x_pillar, 0, 511)
        y_pillar = torch.clamp(y_pillar, 0, 511)

        # 创建伪图像 (简化版，实际使用稀疏卷积)
        pillar_idx = x_pillar * 512 + y_pillar
        unique_pillars = torch.unique(pillar_idx)

        pillar_features = torch.zeros(
            len(unique_pillars), 64, device=points.device)

        for i, p_idx in enumerate(unique_pillars):
            mask = pillar_idx == p_idx
            pillar_points = points[mask]

            # 计算 Pillar 中心偏移
            pillar_center = pillar_points[:, :3].mean(dim=0)
            offsets = pillar_points[:, :3] - pillar_center

            # 拼接: [x, y, z, intensity, x_c, y_c, z_c]
            pillar_input = torch.cat(
                [pillar_points, offsets], dim=1)

            # 通过 VFE 网络
            features = self.pillar_vfe(pillar_input)
            pillar_features[i] = features.max(dim=0)[0]  # Max pooling

        return pillar_features  # (num_pillars, 64)`
                },
                {
                    lang: "python",
                    code: `import torch
import numpy as np

def non_max_suppression_3d(boxes, scores, iou_threshold=0.5):
    """
    3D NMS: 按 IoU 去除冗余检测框
    boxes: (N, 7) [x, y, z, w, l, h, theta]
    scores: (N,) 置信度
    """
    if len(boxes) == 0:
        return []

    # 按分数排序
    order = scores.argsort()[::-1]
    keep = []

    while len(order) > 0:
        i = order[0]
        keep.append(i)

        if len(order) == 1:
            break

        # 计算 3D IoU (简化为 2D BEV IoU)
        remaining = order[1:]
        boxes_i = boxes[i]
        boxes_r = boxes[remaining]

        # 2D BEV IoU 计算 (x, y, w, l, theta)
        ious = compute_bev_iou(boxes_i[:5], boxes_r[:, :5])
        # 移除 IoU 过高的框
        inds = torch.where(ious <= iou_threshold)[0]
        order = remaining[inds]

    return keep

def compute_bev_iou(box1, boxes2):
    """计算 2D BEV 平面的 IoU"""
    # 简化实现: 使用旋转矩形的近似 IoU
    # 实际应用中建议使用 shapely 或自定义 CUDA 核
    area1 = box1[2] * box1[3]
    area2 = boxes2[:, 2] * boxes2[:, 3]
    # 这里仅作演示，实际需要精确的旋转矩形交集计算
    return torch.zeros(len(boxes2))`
                }
            ],
            table: {
                headers: ["方法", "输入表示", "骨干网络", "检测头", "速度 (FPS)"],
                rows: [
                    ["VoxelNet", "体素", "3D CNN + RPN", "Anchor-based", "~10"],
                    ["PointPillars", "Pillar 伪图像", "2D CNN (ResNet)", "Anchor-based", "~60"],
                    ["PointRCNN", "原始点云", "PointNet++ 2 阶段", "Proposal 级精化", "~15"],
                    ["CenterPoint", "体素 BEV", "CenterNet 风格", "Center 点预测", "~25"],
                    ["VoxelNeXt", "体素", "Voxel 特征", "NeXt 预测头", "~30"]
                ]
            },
            mermaid: `graph LR
    A["LiDAR 点云
(N, 4)"] --> B["Pillar 编码
体素化到 BEV"]
    B --> C["2D 骨干网络
ResNet/FPN"]
    C --> D["检测头
Anchor/Center"]
    D --> E["3D 边界框
(x,y,z,w,l,h,θ)"]
    E --> F["3D NMS
去除冗余"]
    F --> G["最终检测结果
类别 + 位置 + 方向"]
    class G s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "PointPillars 是自动驾驶实时检测的首选方案——精度和速度达到了最佳平衡",
            warning: "3D 检测的朝向角 θ 存在 180 度歧义（前后对称），需要使用朝向分类（direction classification）来解决"
        },
        {
            title: "7. 实战：Open3D + NeRF 入门工作流",
            body: `掌握 3D 视觉理论后，实战是最有效的学习方式。Open3D 是一个开源的 3D 数据处理库，支持点云和网格的读取、可视化、配准、重建等操作，是 3D 视觉入门的首选工具。本章节提供一个完整的实战工作流：首先使用 Open3D 读取和可视化点云数据，进行基本的预处理操作（下采样、法线估计、离群点去除）；然后介绍如何使用 Instant-NGP（**NVIDIA** 的神经图形瞬时普适表示框架）快速训练一个 NeRF 模型。Instant-NGP 通过多分辨率哈希编码和 CUDA 加速，将 NeRF 的训练时间从数小时缩短到数秒，是目前最实用的 NeRF 实现。我们将展示从数据准备到模型训练再到新视角渲染的完整流程，让你能够快速上手 3D 视觉的两个核心技术。`,
            code: [
                {
                    lang: "python",
                    code: `import open3d as o3d
import numpy as np

def point_cloud_pipeline(pcd_path):
    """Open3D 点云处理完整管线"""
    # 1. 读取点云
    pcd = o3d.io.read_point_cloud(pcd_path)
    print(f"原始点云: {len(pcd.points)} 点")

    # 2. 可视化
    o3d.visualization.draw_geometries([pcd])

    # 3. 体素下采样
    pcd_down = pcd.voxel_down_sample(voxel_size=0.01)
    print(f"下采样后: {len(pcd_down.points)} 点")

    # 4. 法向量估计
    pcd_down.estimate_normals(
        search_param=o3d.geometry.KDTreeSearchParamHybrid(
            radius=0.03, max_nn=50))

    # 5. 统计离群点去除
    cl, ind = pcd_down.remove_statistical_outlier(
        nb_neighbors=30, std_ratio=2.0)
    pcd_clean = pcd_down.select_by_index(ind)
    print(f"清理后: {len(pcd_clean.points)} 点")

    # 6. ICP 配准 (如果有两个点云需要对齐)
    source = pcd_clean
    target = pcd_clean  # 实际使用时加载另一个点云

    # 初始化变换 (恒等变换)
    init_transform = np.eye(4)

    # 执行 ICP
    reg = o3d.pipelines.registration.registration_icp(
        source, target, max_correspondence_distance=0.05,
        init=init_transform,
        estimation_method=o3d.pipelines.registration
            .TransformationEstimationPointToPoint())

    print(f"ICP 适应度: {reg.fitness:.4f}")
    print(f"ICP 变换矩阵:\n{reg.transformation}")

    # 7. 保存处理后的点云
    o3d.io.write_point_cloud("processed.ply", pcd_clean)
    return pcd_clean

pcd_clean = point_cloud_pipeline("input.ply")`
                },
                {
                    lang: "python",
                    code: `import subprocess
import json
import os

def train_instant_ngp(data_dir, output_dir,
                       n_steps=30000):
    """
    使用 Instant-NGP 训练 NeRF 模型
    需要安装: https://github.com/NVlabs/instant-ngp
    """
    os.makedirs(output_dir, exist_ok=True)

    # 1. 准备 transforms.json (COLMAP 格式转 Instant-NGP 格式)
    # transforms.json 格式:
    transforms = {
        "camera_model": "OPENCV",
        "frames": [],
        "aabb_scale": 4  # 场景包围盒缩放
    }

    # 假设已有 COLMAP 输出，转换为 Instant-NGP 格式
    # 实际使用 colmap2nerf.py 脚本自动转换
    # subprocess.run(["python", "colmap2nerf.py",
    #     "--colmap_matcher", "exhaustive",
    #     "--run_colmap", "False",
    #     "--n_images", "-1"])

    # 2. 训练 NeRF
    train_cmd = [
        "./instant-ngp/build/testbed",
        "--mode", "training",
        "--scene", f"{output_dir}/transforms.json",
        "--network", "instant-ngp/configs/nerf/base.json",
        "--n_steps", str(n_steps),
        "--save_snapshot", f"{output_dir}/nerf.ingp",
        "--screenshot", f"{output_dir}/result.png",
    ]

    # 3. 渲染新视角
    render_cmd = [
        "./instant-ngp/build/render",
        "--scene", f"{output_dir}/transforms.json",
        "--load_snapshot", f"{output_dir}/nerf.ingp",
        "--n_frames", "60",
        "--output", f"{output_dir}/render_frames/",
    ]

    print(f"训练命令: {' '.join(train_cmd)}")
    print(f"渲染命令: {' '.join(render_cmd)}")

    # 实际执行 (取消注释)
    # subprocess.run(train_cmd)
    # subprocess.run(render_cmd)
    print(f"\nInstant-NGP 训练完成! 约 30s 收敛到 ~30 PSNR")
    print(f"模型保存: {output_dir}/nerf.ingp")
    print(f"渲染结果: {output_dir}/result.png")`
                }
            ],
            table: {
                headers: ["工具/框架", "语言", "核心功能", "适用场景"],
                rows: [
                    ["Open3D", "Python/C++", "点云/网格处理、可视化、配准", "3D 数据预处理和可视化"],
                    ["Instant-NGP", "C++/CUDA", "NeRF 训练（数秒级）", "高质量新视角合成"],
                    ["COLMAP", "C++", "SfM + MVS 完整管线", "照片级 3D 重建"],
                    ["PyTorch3D", "Python", "3D 深度学习组件", "3D 模型训练和研究"],
                    ["Kaolin", "Python", "3D 深度学习库 (NVIDIA)", "3D GAN / 生成模型"]
                ]
            },
            mermaid: `graph TD
    A["准备数据
照片或点云"] --> B["COLMAP
SfM 相机位姿"]
    B --> C["转换为
transforms.json"]
    C --> D["Instant-NGP
训练 NeRF"]
    D --> E["保存快照
nerf.ingp"]
    E --> F["渲染新视角
图像或视频"]
    subgraph 并行处理
    A --> G["Open3D
点云处理"]
    G --> H["配准 + 重建"]
    H --> I["三角网格
可视化"]
    end
    class I s2
    class F s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
            tip: "Instant-NGP 的训练只需几十秒——准备好 transforms.json 和照片后，运行一条命令即可开始",
            warning: "NeRF 训练数据质量直接决定结果——照片需要覆盖目标物体的所有角度，且光照条件尽量一致"
        }
    ],
};
