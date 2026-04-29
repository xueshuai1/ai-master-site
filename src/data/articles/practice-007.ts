import { Article } from '../knowledge';

export const article: Article = {
    id: "practice-007",
    title: "AI 在自动驾驶中的应用",
    category: "practice",
    tags: ["自动驾驶", "感知", "规划"],
    summary: "从感知到决策规划，掌握 AI 在自动驾驶中的核心技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
        {
            title: "1. 自动驾驶系统架构：从模块化到端到端",
            body: `自动驾驶系统的核心在于如何将传感器输入转化为安全可靠的控制指令。传统的模块化架构将系统分为感知、定位、预测、规划和控制五大模块，每个模块独立优化，通过明确的接口传递信息。这种架构的优势是可解释性强、故障易于定位，但模块间的误差累积和接口瓶颈也限制了系统性能的上限。近年来，端到端学习方法开始兴起，直接从传感器输入映射到控制输出，减少了人工设计模块的信息损失。然而，端到端系统的黑盒特性在安全关键的自动驾驶领域仍面临巨大挑战。当前业界主流方案是 hybrid 架构，保留关键模块的可解释性，同时在感知和预测等子模块中引入深度学习。SAE 将自动驾驶分为 L0 到 L5 六个等级，不同等级对系统架构的要求差异显著。L2 级别只需处理特定场景的纵向和横向控制，而 L4 级别需要在 ODD 内实现完全自主驾驶。`,
            code: [
                {
                    lang: "python",
                    code: `# 模块化自动驾驶系统架构概览\nimport torch\nimport torch.nn as nn\nfrom typing import Dict, List, Tuple\n\nclass ModularAutonomousSystem(nn.Module):\n    def __init__(self):\n        super().__init__()\n        # 感知模块\n        self.perception = PerceptionModule()\n        # 定位模块\n        self.localization = LocalizationModule()\n        # 预测模块\n        self.prediction = TrajectoryPredictionModule()\n        # 规划模块\n        self.planning = MotionPlanningModule()\n        # 控制模块\n        self.control = ControlModule()\n\n    def forward(self, sensor_data: Dict[str, torch.Tensor],\n                map_data: torch.Tensor) -> Dict[str, torch.Tensor]:\n        # 感知：目标检测 + 语义分割\n        objects = self.perception(sensor_data)\n        # 定位：车辆位姿估计\n        pose = self.localization(sensor_data, map_data)\n        # 预测：周围目标轨迹预测\n        predictions = self.prediction(objects, pose)\n        # 规划：生成行驶轨迹\n        trajectory = self.planning(pose, objects, predictions, map_data)\n        # 控制：油门、刹车、转向\n        commands = self.control(trajectory, pose)\n        return {\n            "objects": objects,\n            "pose": pose,\n            "predictions": predictions,\n            "trajectory": trajectory,\n            "commands": commands\n        }`
                },
                {
                    lang: "python",
                    code: `# 端到端驾驶模型基础架构\nimport torch\nimport torch.nn as nn\n\nclass EndToEndDrivingModel(nn.Module):\n    def __init__(self, num_cameras: int = 6, img_size: int = 256):\n        super().__init__()\n        # 多视角特征提取\n        self.backbone = nn.Sequential(\n            nn.Conv2d(3 * num_cameras, 64, kernel_size=7, stride=2, padding=3),\n            nn.BatchNorm2d(64),\n            nn.ReLU(inplace=True),\n            nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1),\n            nn.BatchNorm2d(128),\n            nn.ReLU(inplace=True),\n            nn.Conv2d(128, 256, kernel_size=3, stride=2, padding=1)\n        )\n        # BEV 特征转换\n        self.bev_encoder = nn.Sequential(\n            nn.Conv2d(256, 512, kernel_size=3, padding=1),\n            nn.ReLU(),\n            nn.Conv2d(512, 512, kernel_size=3, padding=1)\n        )\n        # 轨迹头\n        self.trajectory_head = nn.Sequential(\n            nn.AdaptiveAvgPool2d(1),\n            nn.Flatten(),\n            nn.Linear(512, 256),\n            nn.ReLU(),\n            nn.Linear(256, 80)  # 20步 x 4维\n        )\n        # 控制头\n        self.control_head = nn.Sequential(\n            nn.AdaptiveAvgPool2d(1),\n            nn.Flatten(),\n            nn.Linear(512, 64),\n            nn.ReLU(),\n            nn.Linear(64, 3)  # 油门、刹车、转向\n        )\n\n    def forward(self, multi_view_images: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:\n        B = multi_view_images.shape[0]\n        features = self.backbone(multi_view_images)\n        bev_features = self.bev_encoder(features)\n        trajectory = self.trajectory_head(bev_features).view(B, 20, 4)\n        commands = self.control_head(bev_features)\n        return trajectory, commands`
                }
            ],
            table: {
                headers: ["架构类型", "可解释性", "实时性", "安全性", "代表方案"],
                rows: [
                    ["模块化", "高", "中等", "高", "Apollo, Waymo"],
                    ["端到端", "低", "高", "待验证", "Tesla FSD, UniAD"],
                    ["Hybrid", "中高", "高", "高", "Mobileye REM"],
                    ["规则+学习混合", "高", "中等", "高", "Cruise AV"]
                ]
            },
            mermaid: `graph TD
    A[传感器输入] --> B[感知模块]
    A --> C[定位模块]
    B --> D[目标列表]
    C --> E[车辆位姿]
    D --> F[预测模块]
    E --> F
    F --> G[轨迹预测]
    D --> H[规划模块]
    E --> H
    G --> H
    H --> I[行驶轨迹]
    I --> J[控制模块]
    J --> K[油门/刹车/转向]`,
            tip: "选择架构时，L2 级别推荐模块化方案便于功能安全认证，L4 级别可考虑 hybrid 架构平衡性能与安全性。",
            warning: "端到端模型在罕见场景下可能产生不可预测的行为，部署前必须在 corner case 数据集上进行充分验证。"
        },
        {
            title: "2. 感知：目标检测与语义分割",
            body: `感知是自动驾驶系统的眼睛，负责从传感器数据中理解周围环境。目标检测用于识别和定位道路上的车辆、行人、自行车等动态障碍物，而语义分割则对每个像素进行分类，理解道路、车道线、交通标志等静态环境。3D 目标检测是当前自动驾驶感知的核心挑战，需要从点云或图像中恢复目标的三维位置和姿态。主流方法包括基于点云的 PointPillars、CenterPoint 和基于多视角图像的 BEVDepth、BEVFormer。语义分割方面，BEVDet 和 Mask2Former 等模型通过引入 BEV 表示，统一了多传感器特征的空间对齐问题。感知的准确性直接决定了下游模块的输入质量，是自动驾驶系统最基础也最关键的环节。KITTI、nuScenes 和 Waymo Open Dataset 是该领域的三大基准数据集。`,
            code: [
                {
                    lang: "python",
                    code: `# CenterPoint 3D 目标检测核心\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass CenterPoint3D(nn.Module):\n    def __init__(self, num_classes: int = 3, voxel_size: float = 0.1):\n        super().__init__()\n        self.voxel_encoder = VoxelFeatureEncoder()\n        self.backbone = SpMiddleFHD(output_channels=128)\n        self.head = nn.ModuleDict({\n            "heatmap": nn.Conv2d(128, num_classes, kernel_size=3, padding=1),\n            "offset": nn.Conv2d(128, 2, kernel_size=3, padding=1),\n            "height": nn.Conv2d(128, 1, kernel_size=3, padding=1),\n            "dim": nn.Conv2d(128, 3, kernel_size=3, padding=1),\n            "rotation": nn.Conv2d(128, 2, kernel_size=3, padding=1)\n        })\n\n    def forward(self, point_cloud: torch.Tensor) -> Dict[str, torch.Tensor]:\n        voxels, coords = self.voxel_encoder(point_cloud)\n        features = self.backbone(voxels, coords)\n        heatmap = torch.sigmoid(self.head["heatmap"](features))\n        offset = self.head["offset"](features)\n        height = self.head["height"](features)\n        dim = self.head["dim"](features)\n        rotation = self.head["rotation"](features)\n        return {\n            "heatmap": heatmap,\n            "offset": offset,\n            "height": height,\n            "dim": dim,\n            "rotation": rotation\n        }`
                },
                {
                    lang: "python",
                    code: `# BEV 语义分割网络\nimport torch\nimport torch.nn as nn\n\nclass BEVSegmentation(nn.Module):\n    def __init__(self, num_classes: int = 10, bev_range: list = [-50, 50, -50, 50]):\n        super().__init__()\n        self.bev_range = bev_range\n        # 多视角图像编码器\n        self.image_encoder = nn.Sequential(\n            nn.Conv2d(3, 64, 7, 2, 3),\n            nn.BatchNorm2d(64),\n            nn.ReLU(),\n            nn.Conv2d(64, 128, 3, 2, 1),\n            nn.BatchNorm2d(128),\n            nn.ReLU(),\n            nn.Conv2d(128, 256, 3, 2, 1)\n        )\n        # LSS 深度分布估计\n        self.depth_net = nn.Sequential(\n            nn.Conv2d(256, 128, 3, padding=1),\n            nn.ReLU(),\n            nn.Conv2d(128, 80, 1)  # 80 depth bins\n        )\n        # BEV 融合与分割\n        self.bev_head = nn.Sequential(\n            nn.Conv2d(256, 512, 3, padding=1),\n            nn.BatchNorm2d(512),\n            nn.ReLU(),\n            nn.Conv2d(512, num_classes, 1)\n        )\n\n    def forward(self, images: torch.Tensor, cam_params: torch.Tensor) -> torch.Tensor:\n        B, N, C, H, W = images.shape\n        images = images.view(B * N, C, H, W)\n        features = self.image_encoder(images)\n        depth_dist = torch.softmax(self.depth_net(features), dim=1)\n        # 简化 LSS 体素池化\n        bev_features = self._pool_to_bev(features, depth_dist, cam_params, B, N)\n        segmentation = self.bev_head(bev_features)\n        return segmentation\n\n    def _pool_to_bev(self, features, depth_dist, cam_params, B, N):\n        # 实际实现需要完整的 LSS 几何投影\n        return torch.zeros(B, 256, 200, 200, device=features.device)`
                }
            ],
            table: {
                headers: ["数据集", "场景数", "传感器", "目标类别", "标注类型"],
                rows: [
                    ["KITTI", "7481 帧", "相机+激光雷达", "8类", "3D 边界框"],
                    ["nuScenes", "1000 场景", "6相机+激光雷达+毫米波", "23类", "3D 边界框"],
                    ["Waymo Open", "1150 场景", "5相机+激光雷达", "4类", "3D 边界框+跟踪"],
                    ["Argoverse 2", "1000 场景", "7相机+激光雷达", "多类", "3D 边界框+运动学"]
                ]
            },
            mermaid: `graph TD
    A[多传感器输入] --> B[图像特征提取]
    A --> C[点云体素化]
    B --> D[LSS 深度估计]
    C --> E[稀疏卷积骨干]
    D --> F[BEV 特征池化]
    E --> F
    F --> G[BEV 特征图]
    G --> H[目标检测头]
    G --> I[语义分割头]
    H --> J[3D 边界框]
    I --> K[像素级分类]`,
            tip: "感知模型的训练数据必须覆盖目标部署地区的所有典型场景，包括不同的天气、光照和道路类型。",
            warning: "3D 检测的评估指标 AP 计算对 IoU 阈值非常敏感，对比不同模型时务必使用相同的评估配置。"
        },
        {
            title: "3. 传感器融合：多源信息的统一",
            body: `自动驾驶车辆配备了多种传感器，包括摄像头、激光雷达、毫米波雷达和超声波传感器。每种传感器都有其独特的优势和局限性：摄像头提供丰富的纹理和颜色信息但缺乏深度感知，激光雷达提供精确的三维几何信息但在恶劣天气下性能下降，毫米波雷达可以直接测量目标速度但分辨率较低。传感器融合的目标是整合多源信息，发挥各自优势，弥补单一传感器的不足。融合策略按处理阶段分为数据级融合、特征级融合和决策级融合。当前主流的趋势是在 BEV 空间进行特征级融合，如 BEVFusion 和 TransFusion 等方法，将不同传感器的特征投影到统一的鸟瞰图空间，再通过注意力机制进行信息交互。这种融合方式既保留了各传感器的独特信息，又实现了空间对齐，是自动驾驶感知系统的重要发展方向。时间同步和空间标定是传感器融合的前置条件，任何偏差都会导致融合效果显著下降。`,
            code: [
                {
                    lang: "python",
                    code: `# BEV 空间多传感器特征融合\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass BEVFusionModule(nn.Module):\n    def __init__(self, lidar_dim: int = 128, camera_dim: int = 256, fusion_dim: int = 256):\n        super().__init__()\n        # 传感器特征投影到统一维度\n        self.lidar_proj = nn.Conv2d(lidar_dim, fusion_dim, 1)\n        self.camera_proj = nn.Conv2d(camera_dim, fusion_dim, 1)\n        # 交叉注意力融合\n        self.lidar_attn = nn.MultiheadAttention(fusion_dim, num_heads=8, batch_first=True)\n        self.camera_attn = nn.MultiheadAttention(fusion_dim, num_heads=8, batch_first=True)\n        # 融合后处理\n        self.fusion_conv = nn.Sequential(\n            nn.Conv2d(fusion_dim * 2, fusion_dim, 3, padding=1),\n            nn.BatchNorm2d(fusion_dim),\n            nn.ReLU(),\n            nn.Conv2d(fusion_dim, fusion_dim, 3, padding=1)\n        )\n\n    def forward(self, lidar_bev: torch.Tensor, camera_bev: torch.Tensor) -> torch.Tensor:\n        B, C, H, W = lidar_bev.shape\n        lidar_feat = self.lidar_proj(lidar_bev)\n        camera_feat = self.camera_proj(camera_bev)\n        # 展平为序列\n        lidar_seq = lidar_feat.flatten(2).permute(0, 2, 1)\n        camera_seq = camera_feat.flatten(2).permute(0, 2, 1)\n        # 交叉注意力\n        lidar_enhanced, _ = self.lidar_attn(lidar_seq, camera_seq, camera_seq)\n        camera_enhanced, _ = self.camera_attn(camera_seq, lidar_seq, lidar_seq)\n        # 恢复空间形状\n        lidar_enhanced = lidar_enhanced.permute(0, 2, 1).view(B, -1, H, W)\n        camera_enhanced = camera_enhanced.permute(0, 2, 1).view(B, -1, H, W)\n        # 拼接融合\n        fused = torch.cat([lidar_enhanced, camera_enhanced], dim=1)\n        return self.fusion_conv(fused)`
                },
                {
                    lang: "python",
                    code: `# 传感器标定与时间同步工具\nimport numpy as np\nfrom scipy.spatial.transform import Rotation\n\nclass SensorCalibration:\n    def __init__(self):\n        self.extrinsics = {}  # 传感器外参\n        self.time_offsets = {}  # 时间偏移\n\n    def set_extrinsic(self, sensor_name: str, R: np.ndarray, t: np.ndarray):\n        T = np.eye(4)\n        T[:3, :3] = R\n        T[:3, 3] = t\n        self.extrinsics[sensor_name] = T\n\n    def transform_point(self, point: np.ndarray, from_sensor: str, to_sensor: str) -> np.ndarray:\n        T_from = self.extrinsics[from_sensor]\n        T_to = np.linalg.inv(self.extrinsics[to_sensor])\n        T = T_to @ T_from\n        point_h = np.append(point, 1.0)\n        return (T @ point_h)[:3]\n\n    def synchronize_timestamps(self, timestamps: dict, reference: str = "lidar") -> dict:\n        synced = {}\n        ref_time = timestamps[reference]\n        for sensor, ts in timestamps.items():\n            offset = self.time_offsets.get(sensor, 0.0)\n            synced[sensor] = ref_time + offset\n        return synced\n\n    def calibrate_lidar_camera(self, lidar_points: np.ndarray,\n                                camera_points: np.ndarray) -> tuple:\n        from scipy.optimize import minimize\n        def objective(params):\n            R = Rotation.from_euler("xyz", params[:3]).as_matrix()\n            t = params[3:]\n            T = np.eye(4)\n            T[:3, :3] = R\n            T[:3, 3] = t\n            projected = (T @ np.hstack([lidar_points, np.ones((len(lidar_points), 1))].T).T).T\n            return np.mean((projected[:, :3] - camera_points) ** 2)\n        result = minimize(objective, np.zeros(6), method="Nelder-Mead")\n        R_opt = Rotation.from_euler("xyz", result.x[:3]).as_matrix()\n        return R_opt, result.x[3:]`
                }
            ],
            table: {
                headers: ["传感器", "优势", "劣势", "有效距离", "成本"],
                rows: [
                    ["摄像头", "丰富纹理、颜色、可读交通标志", "无深度、受光照影响大", "0-200m", "低"],
                    ["激光雷达", "精确 3D 几何、不受光照影响", "雨雪天气衰减、无颜色", "0-150m", "高"],
                    ["毫米波雷达", "直接测速、全天候工作", "分辨率低、多径干扰", "0-250m", "中"],
                    ["超声波", "近距离精度高、成本极低", "距离极短、受材质影响", "0-5m", "极低"]
                ]
            },
            mermaid: `graph TD
    A[摄像头] --> D[图像特征]
    B[激光雷达] --> E[点云特征]
    C[毫米波雷达] --> F[雷达特征]
    D --> G[BEV 投影]
    E --> G
    F --> G
    G --> H[交叉注意力融合]
    H --> I[融合 BEV 特征]
    I --> J[下游任务]`,
            tip: "传感器融合前必须确保精确的时空同步，否则融合特征会出现空间错位，反而降低检测精度。",
            warning: "不要在仿真环境中假设完美的传感器标定参数，真实车辆每次启动后的振动都会导致微小偏差。"
        },
        {
            title: "4. 轨迹预测：理解他车意图",
            body: `轨迹预测是自动驾驶系统理解周围交通参与者未来行为的关键模块。与目标检测只提供当前时刻的状态不同，轨迹预测需要在给定历史观测的情况下，预测周围车辆、行人和自行车在未来 3 到 8 秒内的运动轨迹。这是一个本质上不确定的问题，同一个历史轨迹可能对应多种合理的未来结果。因此，现代预测模型输出的是多模态分布，而非单一确定性轨迹。主流方法包括基于社会池化（Social Pooling）的 LSTM 网络、基于图神经网络的交互建模、以及基于 Transformer 的序列预测。Waymo Motion Dataset 和 Argoverse 2 Motion 是该领域的标准基准。轨迹预测的难点在于建模车辆之间的复杂交互关系，例如交叉路口的让行行为、高速公路的换道意图等。多模态输出需要配合合理的评分机制，确保规划模块能够选择最安全的预测结果。`,
            code: [
                {
                    lang: "python",
                    code: `# 基于 Transformer 的多模态轨迹预测\nimport torch\nimport torch.nn as nn\nimport math\n\nclass TrajectoryTransformer(nn.Module):\n    def __init__(self, num_modes: int = 6, horizon: int = 80, hidden_dim: int = 128):\n        super().__init__()\n        self.num_modes = num_modes\n        self.horizon = horizon\n        # 历史编码\n        self.history_encoder = nn.Sequential(\n            nn.Linear(6, hidden_dim),  # x, y, vx, vy, heading, type\n            nn.LayerNorm(hidden_dim),\n            nn.ReLU()\n        )\n        # Transformer 编码器\n        encoder_layer = nn.TransformerEncoderLayer(\n            d_model=hidden_dim, nhead=8,\n            dim_feedforward=512, dropout=0.1, batch_first=True\n        )\n        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers=4)\n        # 多模态解码头\n        self.mode_query = nn.Parameter(torch.randn(num_modes, hidden_dim))\n        self.decoder = nn.Sequential(\n            nn.Linear(hidden_dim, hidden_dim),\n            nn.ReLU(),\n            nn.Linear(hidden_dim, horizon * 2)  # (x, y) per step\n        )\n        # 概率评分头\n        self.prob_head = nn.Sequential(\n            nn.Linear(hidden_dim, 1)\n        )\n\n    def forward(self, agent_history: torch.Tensor,\n                map_context: torch.Tensor) -> tuple:\n        B, N, T, _ = agent_history.shape\n        # 编码历史\n        agent_features = self.history_encoder(agent_history).view(B * N, T, -1)\n        encoded = self.transformer_encoder(agent_features)\n        # 聚合\n        context = encoded.mean(dim=1).view(B, N, -1).mean(dim=1)\n        # 多模态解码\n        mode_features = self.mode_query.unsqueeze(0).expand(B, -1, -1)\n        mode_features = mode_features + context.unsqueeze(1)\n        trajectories = self.decoder(mode_features).view(B, self.num_modes, self.horizon, 2)\n        probabilities = torch.softmax(self.prob_head(mode_features).squeeze(-1), dim=-1)\n        return trajectories, probabilities`
                },
                {
                    lang: "python",
                    code: `# 交互感知图神经网络预测\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass InteractionGraphPredictor(nn.Module):\n    def __init__(self, num_agents: int = 20, hidden_dim: int = 64, num_modes: int = 6):\n        super().__init__()\n        self.num_agents = num_agents\n        self.num_modes = num_modes\n        self.node_encoder = nn.Linear(5, hidden_dim)\n        self.edge_encoder = nn.Linear(3, hidden_dim)\n        # 图注意力层\n        self.gat_layer1 = nn.MultiheadAttention(hidden_dim, num_heads=4, batch_first=True)\n        self.gat_layer2 = nn.MultiheadAttention(hidden_dim, num_heads=4, batch_first=True)\n        # 轨迹输出\n        self.trajectory_decoder = nn.Sequential(\n            nn.Linear(hidden_dim, 128),\n            nn.ReLU(),\n            nn.Linear(128, 80 * 2)  # 80 timesteps\n        )\n        self.confidence_decoder = nn.Linear(hidden_dim, num_modes)\n\n    def build_adjacency(self, positions: torch.Tensor, threshold: float = 50.0) -> torch.Tensor:\n        B, N, _ = positions.shape\n        dist_matrix = torch.cdist(positions, positions)\n        adjacency = (dist_matrix < threshold).float()\n        # 掩码自连接\n        adjacency += torch.eye(N, device=positions.device).unsqueeze(0)\n        return adjacency\n\n    def forward(self, agent_states: torch.Tensor) -> tuple:\n        B, N, T, _ = agent_states.shape\n        # 节点特征\n        node_feat = self.node_encoder(agent_states[:, :, -1, :])\n        # 交互建模\n        enhanced1, _ = self.gat_layer1(node_feat, node_feat, node_feat)\n        enhanced2, _ = self.gat_layer2(enhanced1, enhanced1, enhanced1)\n        # 输出\n        trajectories = self.trajectory_decoder(enhanced2).view(B, N, 80, 2)\n        confidence = torch.softmax(self.confidence_decoder(enhanced2.mean(dim=1)), dim=-1)\n        return trajectories, confidence`
                }
            ],
            table: {
                headers: ["方法", "交互建模", "多模态", "计算复杂度", "minFDE (nuScenes)"],
                rows: [
                    ["Social-LSTM", "社会池化", "隐式", "低", "2.8m"],
                    ["MultiPath++", "场景上下文", "显式 6 模态", "中", "1.9m"],
                    ["QCNet", "Query-Centric", "显式 6 模态", "中高", "1.5m"],
                    ["GameFormer", "博弈论交互", "显式 6 模态", "高", "1.4m"]
                ]
            },
            mermaid: `graph TD
    A[历史轨迹观测] --> B[特征编码]
    C[高精地图] --> D[场景理解]
    B --> E[交互关系建模]
    D --> E
    E --> F[意图推理]
    F --> G{多模态生成}
    G --> H[模式 1: 直行]
    G --> I[模式 2: 左转]
    G --> J[模式 3: 右转]
    H --> K[概率评分]
    I --> K
    J --> K
    K --> L[输出 Top-K 轨迹]`,
            tip: "轨迹预测的输出必须包含不确定性估计，规划模块需要知道每条预测轨迹的置信度才能做出安全决策。",
            warning: "不要在训练数据中只包含正常行驶场景，急刹车、紧急避让等罕见行为对预测模型的泛化至关重要。"
        },
        {
            title: "5. 决策规划：从规则到学习",
            body: `决策规划是自动驾驶系统的大脑，负责在理解周围环境的基础上，生成安全、舒适、高效的行驶轨迹。传统的规划方法基于规则和优化，如状态机、行为树和模型预测控制（MPC），这些方法具有良好的可解释性和安全保证，但在复杂交通场景中泛化能力有限。基于学习的规划方法，特别是强化学习和模仿学习，正在为这一领域带来新的可能。强化学习通过与环境交互学习最优策略，能够处理规则方法难以编码的复杂场景。模仿学习则从人类驾驶数据中学习，生成的行为更加自然。当前主流的方案是将学习方法和优化方法结合，用学习模型生成初始轨迹或参考路径，再用优化方法进行安全约束下的微调。这种 hybrid 方法既保留了学习方法处理复杂场景的能力，又确保最终输出满足安全约束。规划模块需要考虑的约束包括碰撞避免、交通规则遵守、乘坐舒适性和通行效率。`,
            code: [
                {
                    lang: "python",
                    code: `# 强化学习驾驶策略 - PPO 实现\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\nfrom torch.distributions import Normal\n\nclass DrivingPPOAgent(nn.Module):\n    def __init__(self, state_dim: int = 64, action_dim: int = 3):\n        super().__init__()\n        # 共享特征提取\n        self.feature_extractor = nn.Sequential(\n            nn.Linear(state_dim, 256),\n            nn.ReLU(),\n            nn.Linear(256, 128),\n            nn.ReLU()\n        )\n        # Actor 网络\n        self.actor_mean = nn.Sequential(\n            nn.Linear(128, 64),\n            nn.ReLU(),\n            nn.Linear(64, action_dim),\n            nn.Tanh()\n        )\n        self.actor_logstd = nn.Parameter(torch.zeros(action_dim))\n        # Critic 网络\n        self.critic = nn.Sequential(\n            nn.Linear(128, 64),\n            nn.ReLU(),\n            nn.Linear(64, 1)\n        )\n\n    def forward(self, state: torch.Tensor) -> tuple:\n        features = self.feature_extractor(state)\n        action_mean = self.actor_mean(features)\n        action_std = torch.exp(self.actor_logstd).expand_as(action_mean)\n        dist = Normal(action_mean, action_std)\n        action = dist.sample()\n        log_prob = dist.log_prob(action).sum(dim=-1)\n        value = self.critic(features).squeeze(-1)\n        return action, log_prob, value\n\n    def evaluate(self, state: torch.Tensor, action: torch.Tensor) -> tuple:\n        features = self.feature_extractor(state)\n        action_mean = self.actor_mean(features)\n        action_std = torch.exp(self.actor_logstd).expand_as(action_mean)\n        dist = Normal(action_mean, action_std)\n        log_prob = dist.log_prob(action).sum(dim=-1)\n        entropy = dist.entropy().sum(dim=-1)\n        value = self.critic(features).squeeze(-1)\n        return log_prob, entropy, value`
                },
                {
                    lang: "python",
                    code: `# 模型预测控制 - 轨迹优化\nimport numpy as np\nfrom scipy.optimize import minimize\n\nclass MPCPlanner:\n    def __init__(self, horizon: int = 20, dt: float = 0.1):\n        self.horizon = horizon\n        self.dt = dt\n        self.vehicle_length = 4.5\n        self.vehicle_width = 1.8\n\n    def bicycle_model(self, state: np.ndarray, control: np.ndarray) -> np.ndarray:\n        x, y, v, theta = state\n        delta, a = control\n        # 运动学自行车模型\n        x_dot = v * np.cos(theta)\n        y_dot = v * np.sin(theta)\n        v_dot = a\n        theta_dot = v * np.tan(delta) / 2.7  # 轴距 2.7m\n        return np.array([x_dot, y_dot, v_dot, theta_dot])\n\n    def optimize_trajectory(self, initial_state: np.ndarray,\n                             reference_path: np.ndarray,\n                             obstacles: list) -> np.ndarray:\n        n_controls = self.horizon * 2\n        def cost(controls):\n            controls = controls.reshape(self.horizon, 2)\n            state = initial_state.copy()\n            total_cost = 0.0\n            for t in range(self.horizon):\n                state = state + self.bicycle_model(state, controls[t]) * self.dt\n                # 跟踪误差\n                ref_pos = reference_path[min(t, len(reference_path)-1)]\n                tracking_error = (state[0] - ref_pos[0])**2 + (state[1] - ref_pos[1])**2\n                total_cost += 10.0 * tracking_error\n                # 控制平滑\n                if t > 0:\n                    total_cost += 0.1 * np.sum(controls[t] - controls[t-1])**2\n                # 碰撞惩罚\n                for obs_x, obs_y, obs_r in obstacles:\n                    dist = np.sqrt((state[0]-obs_x)**2 + (state[1]-obs_y)**2)\n                    if dist < obs_r + 1.0:\n                        total_cost += 1000.0 * (obs_r + 1.0 - dist)**2\n            return total_cost\n        result = minimize(cost, np.zeros(n_controls),\n                         method="SLSQP",\n                         bounds=[(-0.5, 0.5)] * self.horizon + [(-3.0, 3.0)] * self.horizon)\n        return result.x.reshape(self.horizon, 2)`
                }
            ],
            table: {
                headers: ["规划方法", "可解释性", "安全性保证", "复杂场景", "实时性"],
                rows: [
                    ["规则+状态机", "高", "强", "差", "极快"],
                    ["MPC 优化", "高", "强（约束内）", "中等", "快"],
                    ["强化学习", "低", "弱", "强", "快（推理）"],
                    ["Hybrid（学习+优化）", "中", "强", "强", "中等"]
                ]
            },
            mermaid: `graph TD
    A[感知结果] --> B[场景理解]
    B --> C{场景分类}
    C -->|简单直行| D[规则规划]
    C -->|复杂交互| E[学习策略]
    D --> F[MPC 轨迹优化]
    E --> G[策略网络输出]
    G --> F
    F --> H[安全约束检查]
    H -->|通过| I[最终轨迹]
    H -->|不通过| J[紧急制动]
    I --> K[控制执行]`,
            tip: "Hybrid 方案中，学习模型负责生成多样化的候选轨迹，优化方法负责从中选择安全且舒适的最优解。",
            warning: "强化学习策略在训练分布之外的场景可能产生危险行为，必须通过安全层进行约束和过滤。"
        },
        {
            title: "6. 仿真与测试：安全验证的基石",
            body: `自动驾驶系统的测试和验证是确保功能安全的关键环节。由于真实道路测试成本极高且存在安全风险，仿真测试成为自动驾驶开发中不可或缺的部分。仿真平台需要在虚拟环境中重建真实的物理规律、传感器特性和交通场景。CARLA、LGSVL 和 NVIDIA DRIVE Sim 是主流的开源和商业仿真平台。场景生成是仿真的核心挑战，包括自然驾驶场景的自动采集和 corner case 的人工设计。基于生成对抗网络和扩散模型的场景生成方法，可以自动创建高价值的测试场景，大幅提升测试效率。功能安全标准 ISO 26262 和预期功能安全标准 ISO 21448（SOTIF）为自动驾驶系统的安全评估提供了框架。仿真测试不能完全替代真实测试，但可以覆盖 99% 以上的测试场景，大幅降低实车测试的风险和成本。数字孪生技术正在将仿真和实车测试的数据闭环打通。`,
            code: [
                {
                    lang: "python",
                    code: `# CARLA 自动化测试框架\nimport carla\nimport numpy as np\n\nclass AutonomousTestRunner:\n    def __init__(self, host: str = "localhost", port: int = 2000):\n        self.client = carla.Client(host, port)\n        self.client.set_timeout(10.0)\n        self.world = self.client.get_world()\n        self.results = []\n\n    def run_test_scenario(self, scenario_name: str,\n                           autopilot_class, num_episodes: int = 100) -> dict:\n        scenario = self._load_scenario(scenario_name)\n        successes = 0\n        infractions = {\"collision\": 0, \"red_light\": 0, \"route_deviation\": 0}\n        for ep in range(num_episodes):\n            env = self._setup_environment(scenario, ep)\n            agent = autopilot_class()\n            done = False\n            reward_sum = 0.0\n            while not done:\n                state = self._get_state(env)\n                action = agent.get_action(state)\n                next_state, reward, done, info = self._step(env, action)\n                reward_sum += reward\n                if info.get(\"collision\"):\n                    infractions[\"collision\"] += 1\n                    done = True\n                if info.get(\"red_light\"):\n                    infractions[\"red_light\"] += 1\n            if reward_sum > 0:\n                successes += 1\n        return {\n            \"scenario\": scenario_name,\n            \"success_rate\": successes / num_episodes,\n            \"infractions\": infractions,\n            \"total_episodes\": num_episodes\n        }\n\n    def _load_scenario(self, name):\n        # 从场景库加载\n        return {\"name\": name}\n\n    def _setup_environment(self, scenario, seed):\n        return {\"scenario\": scenario, \"seed\": seed}\n\n    def _get_state(self, env):\n        return np.random.randn(64)\n\n    def _step(self, env, action):\n        return None, 0.0, True, {}`
                },
                {
                    lang: "python",
                    code: `# 基于扩散模型的场景生成\nimport torch\nimport torch.nn as nn\n\nclass ScenarioDiffusionModel(nn.Module):\n    def __init__(self, num_agents: int = 20, horizon: int = 80, hidden_dim: int = 128):\n        super().__init__()\n        self.num_agents = num_agents\n        self.horizon = horizon\n        # 场景编码\n        self.scene_encoder = nn.Sequential(\n            nn.Linear(num_agents * horizon * 4, hidden_dim * 4),\n            nn.LayerNorm(hidden_dim * 4),\n            nn.ReLU(),\n            nn.Linear(hidden_dim * 4, hidden_dim)\n        )\n        # 扩散去噪网络\n        self.denoise_net = nn.Sequential(\n            nn.Linear(hidden_dim + num_agents * horizon * 4, hidden_dim * 2),\n            nn.ReLU(),\n            nn.Linear(hidden_dim * 2, hidden_dim),\n            nn.ReLU(),\n            nn.Linear(hidden_dim, num_agents * horizon * 4)\n        )\n        self.noise_schedule = torch.linspace(1e-4, 0.02, 1000)\n\n    def forward_diffusion(self, x0: torch.Tensor, t: int) -> tuple:\n        beta_t = self.noise_schedule[t]\n        alpha_t = 1.0 - beta_t\n        noise = torch.randn_like(x0)\n        xt = torch.sqrt(torch.tensor(alpha_t)) * x0 + torch.sqrt(torch.tensor(1 - alpha_t)) * noise\n        return xt, noise\n\n    def denoise(self, xt: torch.Tensor, t: int, context: torch.Tensor) -> torch.Tensor:\n        t_emb = self._timestep_embedding(t, context.shape[0])\n        combined = torch.cat([xt, context, t_emb], dim=-1)\n        return self.denoise_net(combined)\n\n    def sample(self, context: torch.Tensor, num_steps: int = 50) -> torch.Tensor:\n        B = context.shape[0]\n        x = torch.randn(B, self.num_agents * self.horizon * 4, device=context.device)\n        for t in reversed(range(num_steps)):\n            noise_pred = self.denoise(x, t, context)\n            x = x - noise_pred * self.noise_schedule[t]\n        return x.view(B, self.num_agents, self.horizon, 4)\n\n    def _timestep_embedding(self, t: int, batch_size: int) -> torch.Tensor:\n        return torch.full((batch_size, 1), t / 1000.0)`
                }
            ],
            table: {
                headers: ["仿真平台", "传感器模拟", "物理引擎", "开源", "典型用户"],
                rows: [
                    ["CARLA", "相机/激光雷达/毫米波", "PhysX", "是", "学术界"],
                    ["LGSVL", "相机/激光雷达", "Unity PhysX", "是", "Apollo"],
                    ["NVIDIA DRIVE Sim", "全传感器", "PhysX + Omniverse", "否", "NVIDIA 生态"],
                    ["Cognata", "全传感器", "云原生", "否", "Mobileye, Zoox"]
                ]
            },
            mermaid: `graph TD
    A[真实驾驶数据] --> B[场景提取]
    B --> C[场景数据库]
    C --> D[场景增强/变异]
    D --> E[测试场景集]
    E --> F[仿真执行]
    F --> G[结果分析]
    G -->|发现 Corner Case| H[场景库扩充]
    H --> C
    G -->|通过| I[实车测试准入]
    I --> J[实车验证]`,
            tip: "场景覆盖率比测试里程更重要。1000 个精心设计的 corner case 场景比 10000 公里的随机驾驶更有价值。",
            warning: "仿真中的传感器模型和真实传感器存在 sim2real gap，仿真测试结果只能作为参考，不能替代真实测试。"
        },
        {
            title: "7. 实战：端到端驾驶模型开发",
            body: `本章将整合前面所学的感知、预测和规划知识，从零构建一个端到端驾驶模型。我们选择 UniAD 架构作为基础，这是一种将感知、预测和规划统一在一个框架中的方法，通过共享 BEV 特征表示，各模块之间的信息可以端到端地流动。训练数据来自 nuScenes 数据集，包含多视角图像、激光雷达点云和标注的驾驶轨迹。端到端模型的训练是一个多任务学习过程，需要同时优化检测、跟踪、预测和规划等多个目标的损失函数。损失权重的设计至关重要，不同任务的梯度规模和收敛速度差异可能导致训练不稳定。实际部署中，还需要考虑模型压缩、实时推理优化和安全回退机制。一个完整的端到端自动驾驶系统从数据采集到量产部署，通常需要 2 到 3 年的开发周期和数百万公里的测试数据。`,
            code: [
                {
                    lang: "python",
                    code: `# 多任务端到端驾驶模型训练\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass UniADUnified(nn.Module):\n    def __init__(self, num_classes: int = 10, num_modes: int = 6):\n        super().__init__()\n        # BEV 特征提取（共享）\n        self.bev_encoder = BEVEncoder()\n        # 检测头\n        self.detect_head = nn.Sequential(\n            nn.Conv2d(256, 128, 3, padding=1),\n            nn.ReLU(),\n            nn.Conv2d(128, num_classes + 4, 1)  # cls + bbox\n        )\n        # 跟踪头\n        self.track_head = nn.Sequential(\n            nn.Conv2d(256, 128, 3, padding=1),\n            nn.ReLU(),\n            nn.Conv2d(128, 64, 1)  # track embedding\n        )\n        # 预测头\n        self.predict_head = TrajectoryHead(num_modes=num_modes)\n        # 规划头\n        self.plan_head = nn.Sequential(\n            nn.AdaptiveAvgPool2d(1),\n            nn.Flatten(),\n            nn.Linear(256, 128),\n            nn.ReLU(),\n            nn.Linear(128, 80 * 2)  # 规划轨迹\n        )\n\n    def forward(self, multi_view_images: torch.Tensor,\n                targets: dict = None) -> dict:\n        bev_features = self.bev_encoder(multi_view_images)\n        # 多任务输出\n        detection = self.detect_head(bev_features)\n        tracking = self.track_head(bev_features)\n        prediction = self.predict_head(bev_features)\n        planning = self.plan_head(bev_features).view(-1, 80, 2)\n        outputs = {\n            "detection": detection,\n            "tracking": tracking,\n            "prediction": prediction,\n            "planning": planning\n        }\n        if targets is not None:\n            loss = self._compute_loss(outputs, targets)\n            outputs["loss"] = loss\n        return outputs\n\n    def _compute_loss(self, outputs: dict, targets: dict) -> torch.Tensor:\n        det_loss = F.cross_entropy(outputs["detection"], targets["detection_labels"]) / 10.0\n        track_loss = F.mse_loss(outputs["tracking"], targets["tracking_emb"]) / 100.0\n        pred_loss = F.l1_loss(outputs["prediction"], targets["prediction_traj"]) / 5.0\n        plan_loss = F.mse_loss(outputs["planning"], targets["planning_traj"]) / 2.0\n        return det_loss + track_loss + pred_loss + plan_loss`
                },
                {
                    lang: "python",
                    code: `# 部署与推理服务\nimport torch\nimport numpy as np\nfrom dataclasses import dataclass\nimport time\n\n@dataclass\nclass DrivingCommand:\n    steering: float\n    throttle: float\n    brake: float\n    planned_trajectory: np.ndarray\n\nclass DrivingInferenceEngine:\n    def __init__(self, model_path: str, device: str = "cuda"):\n        self.device = torch.device(device)\n        self.model = torch.jit.load(model_path)\n        self.model.to(self.device)\n        self.model.eval()\n        self.latency_buffer = []\n\n    def infer(self, camera_images: np.ndarray,\n              ego_state: np.ndarray,\n              navigation_goal: np.ndarray) -> DrivingCommand:\n        start_time = time.time()\n        # 预处理\n        tensor_images = self._preprocess_images(camera_images)\n        tensor_ego = torch.tensor(ego_state, device=self.device).float()\n        # 推理\n        with torch.no_grad():\n            plan_traj = self.model(tensor_images, tensor_ego)\n        # 轨迹转控制指令\n        command = self._trajectory_to_control(plan_traj.cpu().numpy(), ego_state)\n        latency = time.time() - start_time\n        self.latency_buffer.append(latency)\n        if len(self.latency_buffer) > 100:\n            self.latency_buffer.pop(0)\n        return command\n\n    def _preprocess_images(self, images: np.ndarray) -> torch.Tensor:\n        tensor = torch.tensor(images, device=self.device).float() / 255.0\n        return tensor.permute(0, 3, 1, 2).unsqueeze(0)\n\n    def _trajectory_to_control(self, trajectory: np.ndarray,\n                                ego_state: np.ndarray) -> DrivingCommand:\n        # 纯追踪控制器\n        lookahead_idx = 10\n        target_point = trajectory[lookahead_idx]\n        dx = target_point[0] - ego_state[0]\n        dy = target_point[1] - ego_state[1]\n        steering = np.arctan2(dy, dx) * 0.5\n        speed = np.sqrt(dx**2 + dy**2) / (lookahead_idx * 0.1)\n        throttle = min(max(speed * 0.3, 0.0), 1.0)\n        brake = max(0.0, 1.0 - speed * 0.5)\n        return DrivingCommand(\n            steering=float(np.clip(steering, -1.0, 1.0)),\n            throttle=float(throttle),\n            brake=float(brake),\n            planned_trajectory=trajectory\n        )\n\n    @property\n    def avg_latency(self) -> float:\n        return np.mean(self.latency_buffer) if self.latency_buffer else 0.0`
                }
            ],
            table: {
                headers: ["开发阶段", "核心任务", "数据需求", "典型周期", "关键指标"],
                rows: [
                    ["数据采集", "收集多场景驾驶数据", "100万+ 帧", "6 个月", "场景多样性"],
                    ["模型开发", "多任务模型训练调优", "标注数据", "4 个月", "各任务精度"],
                    ["仿真测试", "大规模虚拟场景测试", "10000+ 场景", "3 个月", "成功率 > 95%"],
                    ["封闭场地", "实际道路验证", "5万+ 公里", "6 个月", "MPI > 5000"],
                    ["开放道路", "真实场景部署", "持续积累", "持续", "MPI > 10000"]
                ]
            },
            mermaid: `graph TD
    A[数据采集车队] --> B[数据标注平台]
    B --> C[训练数据集]
    C --> D[多任务模型训练]
    D --> E[离线评估]
    E -->|达标| F[仿真测试]
    E -->|不达标| D
    F --> G[封闭场地测试]
    G --> H[开放道路测试]
    H --> I[OTA 持续迭代]
    I --> A`,
            tip: "多任务训练中，使用动态损失权重（如不确定性加权）比固定权重效果更好，模型会自动平衡各任务的贡献。",
            warning: "端到端模型的规划输出必须经过安全验证层，任何可能碰撞的轨迹都应该被过滤掉，不能直接输出给控制系统。"
        }
    ],
};
