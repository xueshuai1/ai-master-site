import { Article } from '../knowledge';

export const article: Article = {
    id: "cv-005",
    title: "目标跟踪：SORT, DeepSORT, ByteTrack",
    category: "cv",
    tags: ["目标跟踪", "多目标", "计算机视觉"],
    summary: "从卡尔曼滤波到字节级关联，掌握视频目标跟踪技术",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. 目标跟踪任务定义：单目标 vs 多目标",
            body: `目标跟踪是计算机视觉中最具挑战性的任务之一。单目标跟踪（SOT）在首帧给定目标位置后，持续预测其在后续帧中的边界框；多目标跟踪（MOT）则需同时跟踪场景中多个目标，并维护各自的身份 ID（Re-ID）。MOT 的难点在于处理目标间的遮挡、交叉和外观相似性——当两个人短暂重叠后分开，算法能否正确保持各自的 ID？这涉及三个核心子问题：检测（每帧找出目标）、关联（跨帧匹配同一目标）、轨迹管理（初始化新轨迹和终止旧轨迹）。当前主流 MOT 方案大多采用 Tracking-by-Detecting 范式：先用检测器逐帧定位目标，再用关联算法将检测结果与已有轨迹匹配，从而构建完整的时空轨迹。`,
            code: [
                {
                    lang: "python",
                    code: `# 目标跟踪基本数据结构
from dataclasses import dataclass
from typing import List, Optional
import numpy as np

@dataclass
class BoundingBox:
    """边界框：[x_center, y_center, width, height]"""
    x: float
    y: float
    w: float
    h: float

    @property
    def area(self) -> float:
        return self.w * self.h

    def iou(self, other: 'BoundingBox') -> float:
        """计算两个框的 IoU（交并比）"""
        x1 = max(self.x - self.w/2, other.x - other.w/2)
        y1 = max(self.y - self.h/2, other.y - other.h/2)
        x2 = min(self.x + self.w/2, other.x + other.w/2)
        y2 = min(self.y + self.h/2, other.y + other.h/2)
        inter = max(0, x2 - x1) * max(0, y2 - y1)
        union = self.area + other.area - inter
        return inter / union if union > 0 else 0.0

@dataclass
class Track:
    """跟踪轨迹"""
    track_id: int
    state: np.ndarray  # 卡尔曼滤波状态 [x, y, s, r, vx, vy, vs, vr]
    hits: int          # 连续匹配帧数
    age: int           # 自创建以来的帧数
    time_since_update: int  # 距上次更新的帧数
`
                },
                {
                    lang: "python",
                    code: `# MOT 跟踪主循环伪代码
def mot_tracking(video_path, detector, tracker):
    """Tracking-by-Detecting 主流程"""
    cap = cv2.VideoCapture(video_path)
    tracks = []  # 活跃的跟踪轨迹

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Step 1: 检测当前帧所有目标
        detections = detector.detect(frame)  # 返回 [BBox, conf] 列表

        # Step 2: 预测已有轨迹的当前位置
        tracker.predict()

        # Step 3: 将检测结果与已有轨迹关联
        tracks = tracker.update(tracks, detections)

        # Step 4: 可视化
        for track in tracks:
            if track.is_confirmed():
                draw_box(frame, track.bbox, track.track_id)

    return tracks
`
                }
            ],
            table: {
                headers: ["跟踪类型", "输入", "输出", "典型场景"],
                rows: [
                    ["SOT 单目标", "首帧 GT bbox", "每帧 bbox", "无人机跟拍"],
                    ["MOT 多目标", "逐帧检测结果", "每帧 bbox + ID", "交通监控"],
                    ["GMOT 全局 MOT", "整个视频", "完整轨迹", "赛后分析"],
                    ["Online MOT", "逐帧流式输入", "实时 bbox + ID", "自动驾驶"],
                    ["Multi-Object Tracking and Segmentation", "逐帧检测", "bbox + mask + ID", "医学影像分析"]
                ]
            },
            mermaid: `graph TD
    A["视频帧序列"] --> B["检测器\nYOLO / Faster R-CNN"]
    B --> C["逐帧检测框\n+ 置信度"]
    C --> D["关联算法\n匈牙利 / 字节级"]
    D --> E["轨迹管理\n初始化 / 更新 / 删除"]
    E --> F["输出带 ID 的\n跟踪轨迹"]
    style A fill:#0c4a6e
    style F fill:#14532d`,
            tip: "入门 MOT 建议先跑通一个离线数据集（如 MOT17 train split），理解评估指标后再做在线实时跟踪",
            warning: "SOT 和 MOT 是完全不同的任务——SOT 依赖首帧人工标注，MOT 需要自动检测，不要混淆两者的评测基准"
        },
        {
            title: "2. 卡尔曼滤波基础：状态估计的数学引擎",
            body: `卡尔曼滤波是目标跟踪系统中用于预测和更新目标状态的递归算法。其核心思想是：目标在相邻帧之间的运动可以用一个线性模型近似，但观测（检测框）带有噪声。卡尔曼滤波通过两步迭代工作——预测步基于运动方程推算目标的下一状态和不确定性；更新步则用实际观测值校正预测结果，获得更精确的估计。在目标跟踪中，状态向量通常包含目标的位置（x, y）、尺度（s, r = w/h）及其速度（vx, vy, vs, vr），共 8 维。运动模型采用匀速假设（Constant Velocity），观测模型则直接检测框的测量值。卡尔曼滤波的优势在于它不仅是简单的平均，而是根据预测和观测各自的不确定性（协方差矩阵）动态加权，在检测噪声大时更信赖预测，在检测准确时更信赖观测。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
from scipy.optimize import linear_sum_assignment

class KalmanFilter:
    """8 维匀速卡尔曼滤波器"""
    def __init__(self):
        # 状态维度: [x, y, s, r, vx, vy, vs, vr]
        ndim = 8
        dt = 1.0  # 帧间时间间隔

        # 状态转移矩阵 F（匀速模型）
        self.F = np.eye(ndim)
        for i in range(4):
            self.F[i, i + 4] = dt  # 位置 += 速度 * dt

        # 观测矩阵 H（只观测位置，不观测速度）
        self.H = np.eye(4, ndim)

        # 过程噪声协方差 Q
        self.Q = np.eye(ndim) * 0.01

        # 观测噪声协方差 R
        self.R = np.eye(4) * 10.0

    def init_state(self, bbox):
        """用初始检测框初始化状态 [x, y, s, r]"""
        x, y, w, h = bbox
        state = np.array([x, y, w * h, w / h, 0, 0, 0, 0])
        return state.reshape(8, 1)
`
                },
                {
                    lang: "python",
                    code: `    def predict(self, state, cov):
        """预测步：x_k = F * x_{k-1}"""
        new_state = self.F @ state
        new_cov = self.F @ cov @ self.F.T + self.Q
        return new_state, new_cov

    def update(self, state, cov, measurement):
        """更新步：融合观测 z_k"""
        # 卡尔曼增益: K = P*H^T * (H*P*H^T + R)^{-1}
        y = measurement - self.H @ state       # 新息 (innovation)
        S = self.H @ cov @ self.H.T + self.R   # 新息协方差
        K = cov @ self.H.T @ np.linalg.inv(S)  # 卡尔曼增益

        new_state = state + K @ y
        I_k = np.eye(8)
        new_cov = (I_k - K @ self.H) @ cov
        return new_state, new_cov

# 使用示例
kf = KalmanFilter()
state = kf.init_state([300, 200, 80, 120])  # [x, y, w, h]
cov = np.eye(8) * 100
state, cov = kf.predict(state, cov)
print(f"预测位置: x={state[0,0]:.0f}, y={state[1,0]:.0f}")
`
                }
            ],
            table: {
                headers: ["卡尔曼滤波组件", "数学符号", "在跟踪中的含义"],
                rows: [
                    ["状态向量", "x ∈ R⁸", "[x, y, s, r, vx, vy, vs, vr]"],
                    ["状态转移矩阵", "F ∈ R⁸ˣ⁸", "匀速运动模型 x(t+1) = x(t) + v(t)"],
                    ["观测矩阵", "H ∈ R⁴ˣ⁸", "只观测位置和尺度，不直接观测速度"],
                    ["过程噪声协方差", "Q ∈ R⁸ˣ⁸", "运动模型的不确定性（目标可能加速）"],
                    ["观测噪声协方差", "R ∈ R⁴ˣ⁴", "检测器的定位精度"],
                    ["卡尔曼增益", "K ∈ R⁸ˣ⁴", "自动平衡预测和观测的权重"],
                    ["后验协方差", "P ∈ R⁸ˣ⁸", "估计状态的不确定性"]
                ]
            },
            mermaid: `graph LR
    subgraph 预测步 Predict
    A["上一状态 x(k-1)"] --> B["F * x(k-1)"]
    B --> C["预测状态 x̂(k)"]
    end
    subgraph 更新步 Update
    C --> D["新息: z(k) - H*x̂(k)"]
    E["观测 z(k)"] --> D
    D --> F["卡尔曼增益 K"]
    F --> G["x(k) = x̂(k) + K * 新息"]
    end
    style A fill:#0c4a6e
    style E fill:#7c2d12
    style G fill:#14532d`,
            tip: "卡尔曼滤波假设运动是线性的，如果目标频繁急转弯，可以改用 EKF（扩展卡尔曼滤波）或 UKF（无迹卡尔曼滤波）",
            warning: "Q 和 R 的取值直接影响滤波效果——Q 太小跟踪滞后，Q 太大轨迹抖动，需要根据实际场景调参"
        },
        {
            title: "3. SORT 算法：检测驱动的高效跟踪",
            body: `SORT（Simple Online and Realtime Tracking）由 Alex Bewley 等人在 2016 年提出，以其极简设计震惊了 MOT 领域。SORT 的核心理念只有三步：检测——用预训练的目标检测器（Faster R-CNN）获取每帧的检测框；预测——用卡尔曼滤波对已有轨迹做运动预测；关联——用匈牙利算法基于 IoU 匹配检测结果与预测轨迹。SORT 不使用任何外观特征，纯粹依赖运动信息和空间重叠度做关联。这种「简单暴力」的设计在 MOTChallenge 上取得了接近当时的 SOTA 结果，且推理速度极快（仅比检测器本身慢几毫秒）。SORT 的主要局限在于：当目标被遮挡导致检测丢失时，纯运动预测很快偏离真实位置；当两个目标交叉时，仅凭 IoU 容易发生 ID 切换（ID Switch）。但它为后续 DeepSORT 奠定了完整的框架基础。`,
            code: [
                {
                    lang: "python",
                    code: `def associate_detections_to_trackers(detections, trackers, iou_threshold=0.3):
    """
    SORT 核心关联：IoU + 匈牙利算法
    detections: N×4 检测框数组
    trackers:   M×4 预测轨迹框数组
    返回: (matched, unmatched_dets, unmatched_trks)
    """
    if len(trackers) == 0:
        return np.empty((0, 2), dtype=int), np.arange(len(detections)), []

    # 计算 IoU 代价矩阵 (N×M)
    iou_matrix = np.zeros((len(detections), len(trackers)))
    for d, det in enumerate(detections):
        for t, trk in enumerate(trackers):
            iou_matrix[d, t] = iou(det, trk)

    # 匈牙利算法求解最小代价匹配
    # 将 IoU 转为代价: cost = 1 - IoU
    matched_indices = linear_sum_assignment(1 - iou_matrix)
    matched_indices = np.array(matched_indices).T

    # 过滤低于 IoU 阈值的匹配
    unmatched_detections = []
    for d in range(len(detections)):
        if d not in matched_indices[:, 0]:
            unmatched_detections.append(d)

    unmatched_trackers = []
    for t in range(len(trackers)):
        if t not in matched_indices[:, 1]:
            unmatched_trackers.append(t)

    # 移除低 IoU 匹配
    matches = []
    for m in matched_indices:
        if iou_matrix[m[0], m[1]] < iou_threshold:
            unmatched_detections.append(m[0])
            unmatched_trackers.append(m[1])
        else:
            matches.append(m.reshape(1, 2))

    return matches, unmatched_detections, unmatched_trackers
`
                },
                {
                    lang: "python",
                    code: `class SortTracker:
    """SORT 跟踪器主类"""
    def __init__(self, max_age=1, min_hits=3, iou_threshold=0.3):
        self.max_age = max_age          # 轨迹最大丢失帧数
        self.min_hits = min_hits        # 确认轨迹所需最小匹配次数
        self.iou_threshold = iou_threshold
        self.kf = KalmanFilter()
        self.trackers = []              # 活跃的卡尔曼滤波器列表
        self.frame_count = 0

    def update(self, dets):
        """
        dets: N×5 检测框数组 [x1, y1, x2, y2, confidence]
        返回: M×6 跟踪结果 [x1, y1, x2, y2, track_id, confidence]
        """
        self.frame_count += 1

        # Step 1: 用卡尔曼滤波预测所有现有轨迹
        trks = np.zeros((len(self.trackers), 5))
        to_del = []
        for t, trk in enumerate(trks):
            pos = self.trackers[t].predict()
            trk[:] = [pos[0], pos[1], pos[2], pos[3], 0]
            if np.any(np.isnan(pos)):
                to_del.append(t)
        trks = np.ma.compress_rows(np.ma.masked_invalid(trks))

        # Step 2: IoU 关联
        matched, unmatched_dets, unmatched_trks = \\
            associate_detections_to_trackers(dets, trks, self.iou_threshold)

        # Step 3: 更新匹配的轨迹
        for m in matched:
            self.trackers[m[1]].update(dets[m[0], :])

        # Step 4: 创建新轨迹
        for i in unmatched_dets:
            trk = self.kf.init_bbox(dets[i, :4])
            self.trackers.append(trk)

        return self._get_results()
`
                }
            ],
            table: {
                headers: ["SORT 组件", "技术方案", "优势", "劣势"],
                rows: [
                    ["检测器", "Faster R-CNN", "高召回率", "速度慢（~5 FPS）"],
                    ["运动预测", "8维卡尔曼滤波", "实时、轻量", "匀速假设不灵活"],
                    ["关联度量", "IoU（交并比）", "无需特征提取", "交叉/遮挡时失效"],
                    ["关联算法", "匈牙利算法", "全局最优匹配", "O(N³) 复杂度"],
                    ["轨迹管理", "命中计数机制", "简单可靠", "参数敏感（min_hits）"]
                ]
            },
            mermaid: `graph LR
    A["当前帧检测框"] --> B["卡尔曼预测\n所有轨迹"]
    B --> C["IoU 代价矩阵\n1 - IoU"]
    C --> D["匈牙利算法\n全局最优匹配"]
    D --> E["匹配成功\n→ 卡尔曼更新"]
    D --> F["未匹配检测\n→ 创建新轨迹"]
    D --> G["未匹配轨迹\n→ age++ / 删除"]
    style A fill:#0c4a6e
    style E fill:#14532d
    style G fill:#7f1d1d`,
            tip: "SORT 的 IoU 阈值 0.3 是经验值，密集场景可以降低到 0.2 增加匹配容忍度，但可能增加 ID Switch",
            warning: "SORT 在目标完全遮挡超过 1 帧后大概率丢失轨迹，因为纯运动预测无法应对静止目标（速度预测不为零）"
        },
        {
            title: "4. DeepSORT：外观特征与运动信息的双重保障",
            body: `DeepSORT 在 SORT 的基础上引入了外观特征（Re-ID），从根本上改善了遮挡恢复和 ID 保持能力。核心改进有两处：第一，在关联代价矩阵中，除了原有的 IoU 马氏距离外，新增了外观特征的余弦距离，形成级联匹配策略——先用外观特征做粗匹配，再用 IoU 做精匹配；第二，引入级联匹配（Cascading Matching），对丢失时间不同的轨迹给予不同的匹配优先级，优先匹配最近活跃过的轨迹。外观特征通过一个独立的 Re-ID 网络提取（通常是在行人重识别数据集上预训练的 CNN），每个检测框提取一个 128 维的特征向量，并维护每个轨迹的特征库（最近 100 个特征）。级联匹配解决了 SORT 中长时间遮挡后 ID 恢复困难的问题——当目标重新出现时，即使运动预测有较大偏差，外观特征的匹配也能正确恢复 ID。DeepSORT 在 MOT16 上将 IDF1 从 SORT 的 49.5% 提升到了 62.2%。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torchvision.models as models

class ReIDFeatureExtractor(nn.Module):
    """DeepSORT 外观特征提取器"""
    def __init__(self, feature_dim=128):
        super().__init__()
        # 使用 ResNet-50 作为 backbone
        backbone = models.resnet50(weights=None)
        # 移除最后的分类层
        self.backbone = nn.Sequential(*list(backbone.children())[:-1])
        # 添加投影头输出 128 维特征
        self.projection = nn.Linear(2048, feature_dim)
        self.l2_norm = nn.LayerNorm(feature_dim)

    def forward(self, x):
        """输入: 裁剪的目标图像 [N, 3, 256, 128]"""
        features = self.backbone(x)          # [N, 2048, 1, 1]
        features = features.view(features.size(0), -1)  # [N, 2048]
        features = self.projection(features)  # [N, 128]
        features = self.l2_norm(features)
        return features

# 提取检测框的外观特征
def extract_features(extractor, frame, bboxes, device='cuda'):
    """从帧中裁剪目标区域并提取 Re-ID 特征"""
    crops = []
    for x1, y1, x2, y2 in bboxes:
        crop = frame[int(y1):int(y2), int(x1):int(x2)]
        crop = cv2.resize(crop, (128, 256))
        crop = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
        crops.append(crop)
    crops = np.stack(crops).transpose(0, 3, 1, 2) / 255.0
    tensor = torch.from_numpy(crops).float().to(device)
    with torch.no_grad():
        features = extractor(tensor)
    return features.cpu().numpy()  # [N, 128]
`
                },
                {
                    lang: "python",
                    code: `def gated_sigmoid_distance(cost_matrix, detections, trackers, threshold=0.2):
    """级联匹配 + 外观距离 + 马氏距离门控"""
    from scipy.spatial.distance import cosine

    # 计算外观余弦距离矩阵
    feature_matrix = np.zeros((len(detections), len(trackers)))
    for i, det in enumerate(detections):
        for j, trk in enumerate(trackers):
            # 取轨迹特征库中最近的特征
            nearest_feat = min(
                trk.features[-100:],  # 最多用最近 100 个
                key=lambda f: cosine(det.feature, f)
            )
            feature_matrix[i, j] = cosine(det.feature, nearest_feat)

    # 计算马氏距离（运动一致性）
    mahalanobis_dist = compute_mahalanobis(detections, trackers)

    # 门控: 马氏距离超过阈值 → 外观距离设为无穷大（不允许匹配）
    gated_cost = np.where(
        mahalanobis_dist <= 9.4877,  # 卡方分布 4 自由度的 95% 分位
        feature_matrix,
        float('inf')
    )
    return gated_cost

# 级联匹配: 优先匹配丢失时间短的轨迹
def cascade_matching(detections, trackers, max_age=30):
    matches, unmatched_dets, unmatched_trks = [], [], list(range(len(trackers)))
    for age in range(max_age):
        # 只考虑丢失 age 帧的轨迹
        candidates = [t for t in unmatched_trks if trackers[t].time_since_update == age]
        if not candidates:
            continue
        # 在候选轨迹上做匈牙利匹配
        cost = compute_cost(detections, [trackers[t] for t in candidates])
        matched = hungarian_matching(cost)
        # 更新匹配结果...
    return matches, unmatched_dets, unmatched_trks
`
                }
            ],
            table: {
                headers: ["改进点", "SORT 做法", "DeepSORT 做法", "效果提升"],
                rows: [
                    ["关联度量", "仅 IoU", "IoU + 外观余弦距离", "IDF1 +12.7%"],
                    ["匹配策略", "单层匈牙利", "级联匹配（按丢失帧数排序）", "遮挡恢复能力提升"],
                    ["特征表示", "无", "128 维 Re-ID 特征", "外观相似的交叉目标可区分"],
                    ["轨迹特征库", "无", "最近 100 个特征向量", "适应外观渐变"],
                    ["马氏距离", "无", "运动一致性门控", "过滤不合理匹配"]
                ]
            },
            mermaid: `graph TD
    A["当前帧检测"] --> B["提取 Re-ID 特征\n128 维向量"]
    A --> C["卡尔曼预测\n轨迹位置"]
    B --> D["外观余弦距离\n矩阵"]
    C --> E["马氏距离\n矩阵"]
    D --> F["级联匹配"]
    E --> F
    F --> G["马氏门控\n过滤异常"]
    G --> H["匈牙利算法\n全局匹配"]
    H --> I["匹配成功 → 更新轨迹"]
    H --> J["匹配失败 → 新轨迹/删除"]
    style A fill:#0c4a6e
    style I fill:#14532d
    style J fill:#7f1d1d`,
            tip: "DeepSORT 的 Re-ID 模型建议在目标域数据上微调，通用的行人 Re-ID 模型在车辆跟踪上效果较差",
            warning: "提取 128 维外观特征的计算成本不可忽视——如果帧率是瓶颈，可以每隔 2-3 帧提取一次特征"
        },
        {
            title: "5. ByteTrack：字节级关联的革命",
            body: `ByteTrack（2021，字节跳动）从根本上改变了 MOT 的关联策略。传统方法（SORT、DeepSORT）会设置一个检测置信度阈值（如 0.5），丢弃低于阈值的检测框，认为它们是误检。ByteTrack 的核心洞察是：低置信度检测框中包含了大量真实目标——尤其是被遮挡的目标、小目标和模糊目标。ByteTrack 的关联策略分为两轮：第一轮用高置信度检测框与已有轨迹做关联（IoU 匹配），确保高质量匹配；第二轮将未匹配的低置信度检测框与剩余轨迹做第二次关联，「回收」被遗漏的真实目标。这种设计无需任何外观特征提取器，仅用 IoU 就能在 MOT17 上取得 SOTA 结果（MOTA 77.8%, IDF1 77.3%）。ByteTrack 的精髓在于「不浪费任何检测信息」，通过两轮关联最大化利用了检测器的输出。`,
            code: [
                {
                    lang: "python",
                    code: `class ByteTrack:
    """ByteTrack 核心：两轮关联策略"""
    def __init__(self, track_thresh=0.5, high_thresh=0.6,
                 match_thresh=0.8, new_track_thresh=0.7):
        self.track_thresh = track_thresh    # 检测阈值
        self.high_thresh = high_thresh      # 高置信度阈值
        self.match_thresh = match_thresh    # IoU 匹配阈值
        self.new_track_thresh = new_track_thresh  # 新轨迹阈值
        self.tracker = BYTETracker(max_age=30)

    def update(self, detections):
        """
        detections: [x1, y1, x2, y2, score] 数组
        """
        # 分类检测框
        remain_inds = detections[:, 4] > self.high_thresh
        inds_low = (detections[:, 4] > self.track_thresh) & \\
                   (detections[:, 4] <= self.high_thresh)
        inds_high = detections[:, 4] > self.high_thresh

        dets_high = detections[inds_high]
        dets_low = detections[inds_low]

        # 第一轮: 高置信度检测框关联
        online_targets = self.tracker.update(
            dets_high, match_thresh=self.match_thresh
        )

        # 第二轮: 低置信度检测框与未匹配轨迹关联
        activated_targets = [t for t in online_targets if t.is_activated]
        unconfirmed_targets = [t for t in online_targets if not t.is_activated]
        refind_targets = self.tracker.refind(
            unconfirmed_targets, dets_low
        )

        # 合并结果
        return activated_targets + refind_targets

    def forward(self, frame):
        """完整的前向传播"""
        raw_dets = self.detector(frame)
        tracks = self.update(raw_dets)
        return tracks
`
                },
                {
                    lang: "python",
                    code: `# 两轮 IoU 匹配的代价矩阵构建
def byte_track_match(tracks, dets, match_thresh=0.8):
    """
    ByteTrack 风格 IoU 匹配
    返回: matches (list of (track_idx, det_idx))
    """
    if len(tracks) == 0 or len(dets) == 0:
        return [], list(range(len(tracks))), list(range(len(dets)))

    # 计算 IoU 矩阵
    iou_mat = np.zeros((len(tracks), len(dets)))
    for i, trk in enumerate(tracks):
        for j, det in enumerate(dets):
            iou_mat[i, j] = compute_iou(trk.predicted_bbox, det.bbox)

    # 匈牙利匹配（代价 = 1 - IoU）
    row_ind, col_ind = linear_sum_assignment(1 - iou_mat)

    matches = []
    unmatched_tracks = list(range(len(tracks)))
    unmatched_dets = list(range(len(dets)))

    for r, c in zip(row_ind, col_ind):
        if iou_mat[r, c] >= match_thresh:
            matches.append((r, c))
            unmatched_tracks.remove(r)
            unmatched_dets.remove(c)

    return matches, unmatched_tracks, unmatched_dets

# 对比: 传统方法 vs ByteTrack
print("传统方法: 丢弃 score < 0.5 的检测 → 丢失遮挡目标")
print("ByteTrack:  保留所有 score > 0.1 的检测 → 两轮匹配回收真实目标")
`
                }
            ],
            table: {
                headers: ["特性", "DeepSORT", "ByteTrack", "差异分析"],
                rows: [
                    ["低分检测框", "直接丢弃", "第二轮关联回收", "ByteTrack 召回率更高"],
                    ["外观特征", "需要 Re-ID 模型（128 维）", "不需要", "ByteTrack 更轻量"],
                    ["匹配轮数", "级联匹配（多轮）", "两轮 IoU 匹配", "ByteTrack 实现更简洁"],
                    ["MOT17 MOTA", "~70%", "77.8%", "ByteTrack 领先"],
                    ["推理速度", "检测 + Re-ID + 关联", "检测 + 关联", "ByteTrack 快 2-3 倍"]
                ]
            },
            mermaid: `graph TD
    A["所有检测框\n全置信度范围"] --> B["按阈值分类"]
    B --> C["高置信度检测\nscore > 0.6"]
    B --> D["低置信度检测\n0.1 < score ≤ 0.6"]
    C --> E["第一轮 IoU 匹配\n与所有活跃轨迹"]
    E --> F["匹配成功\n→ 更新轨迹"]
    E --> G["未匹配轨迹"]
    D --> H["第二轮 IoU 匹配\n与未匹配轨迹"]
    H --> I["匹配成功\n→ 恢复轨迹"]
    H --> J["仍不匹配\n→ 丢弃"]
    G --> J
    F --> K["输出跟踪结果"]
    I --> K
    style A fill:#0c4a6e
    style K fill:#14532d
    style J fill:#7f1d1d`,
            tip: "ByteTrack 的 track_thresh 可以根据检测器质量调整——好的检测器可以设到 0.4-0.5，弱检测器可以降到 0.2",
            warning: "ByteTrack 对极低置信度检测框（< 0.1）仍然建议丢弃，否则大量误检会导致轨迹爆炸式增长"
        },
        {
            title: "6. 评估指标：MOTA, IDF1, HOTA 全面解析",
            body: `目标跟踪的评估比分类和检测复杂得多，因为它同时衡量了空间精度（bbox 准不准）和时序一致性（ID 对不对）。MOTA（Multiple Object Tracking Accuracy）是最广泛使用的指标，综合了三个误差：漏检（FN）、误检（FP）和 ID 切换（ID Switch），公式为 MOTA = 1 - (FN + FP + IDSW) / GT。但 MOTA 有个严重缺陷：它更看重检测质量，ID 一致性权重偏低。IDF1（ID F1 Score）专门衡量 ID 一致性，将跟踪结果与 GT 做二分图最大匹配，计算 ID 层面的精确率和召回率。HOTA（Higher Order Tracking Accuracy，2020 年提出）试图统一空间和 ID 两个维度，对每个匹配的轨迹对计算不同距离阈值下的检测精度和关联精度，然后取几何平均。这三个指标各有侧重：MOTA 适合检测性能评估，IDF1 适合身份保持评估，HOTA 是最全面的综合指标。`,
            code: [
                {
                    lang: "python",
                    code: `def compute_mota(tp, fp, fn, id_switches, n_gt):
    """
    MOTA = 1 - (FN + FP + IDSW) / GT
    """
    if n_gt == 0:
        return 1.0
    mota = 1 - (fn + fp + id_switches) / n_gt
    return max(0, mota)

def compute_motp(tp, total_distance):
    """
    MOTP = Σd(i,t) / Σc_t
    平均定位精度：匹配框的平均 IoU 距离
    """
    if tp == 0:
        return 0.0
    return total_distance / tp

# 示例：某跟踪器在 1000 帧上的统计
tp = 8500       # 正确匹配
fp = 800        # 误检
fn = 1500       # 漏检
idsw = 200      # ID 切换
n_gt = 10000    # 总 GT 数

mota = compute_mota(tp, fp, fn, idsw, n_gt)
print(f"MOTA: {mota*100:.1f}%")  # 1 - (1500+800+200)/10000 = 75.0%
`
                },
                {
                    lang: "python",
                    code: `def compute_idf1(id_tp, id_fp, id_fn):
    """
    IDF1 = 2 * ID_TP / (2 * ID_TP + ID_FP + ID_FN)
    衡量 ID 一致性：同一个 ID 被正确分配了多少次
    """
    denom = 2 * id_tp + id_fp + id_fn
    if denom == 0:
        return 0.0
    return 2 * id_tp / denom

def compute_hota(det_accuracy, assoc_accuracy, alpha=0.5):
    """
    HOTA = (DetA^alpha * AssA^(1-alpha))^0.5
    统一检测和关联两个维度的评估
    """
    if det_accuracy <= 0 or assoc_accuracy <= 0:
        return 0.0
    return (det_accuracy ** alpha * assoc_accuracy ** (1 - alpha)) ** 0.5

# 对比三个指标对同一跟踪器的评估
results = {
    "Tracker_A": {"MOTA": 0.75, "IDF1": 0.72, "HOTA": 0.62},
    "Tracker_B": {"MOTA": 0.78, "IDF1": 0.65, "HOTA": 0.59},
    "Tracker_C": {"MOTA": 0.70, "IDF1": 0.80, "HOTA": 0.63},
}
print(f"{'Tracker':<12} {'MOTA':>8} {'IDF1':>8} {'HOTA':>8}")
for name, metrics in results.items():
    print(f"{name:<12} {metrics['MOTA']*100:>7.1f}% {metrics['IDF1']*100:>7.1f}% {metrics['HOTA']*100:>7.1f}%")
# Tracker_B MOTA 最高但 IDF1 最低 → 检测准但 ID 切换多
# Tracker_C IDF1 最高但 MOTA 最低 → ID 保持好但有漏检
`
                }
            ],
            table: {
                headers: ["指标", "关注点", "公式", "取值范围"],
                rows: [
                    ["MOTA", "检测 + 少量 ID", "1-(FN+FP+IDSW)/GT", "(-∞, 1]"],
                    ["MOTP", "定位精度", "ΣIoU_distance / TP", "[0, 1]"],
                    ["IDF1", "ID 一致性", "2*ID_TP / (2*ID_TP+ID_FP+ID_FN)", "[0, 1]"],
                    ["HOTA", "检测 + 关联综合", "(DetA^α * AssA^(1-α))^0.5", "[0, 1]"],
                    ["AssA", "纯关联精度", "匹配轨迹的平均关联精度", "[0, 1]"]
                ]
            },
            mermaid: `graph TD
    A["跟踪结果\n+ GT 标注"] --> B{"评估维度"}
    B --> C["检测精度\nDetA"]
    B --> D["关联精度\nAssA"]
    C --> E["TP / (TP+FP+FN)"]
    D --> F["正确 ID 关联比例"]
    E --> G["HOTA\n综合评分"]
    F --> G
    G --> H["排名\n比较算法"]
    C --> I["MOTA\n侧重检测"]
    D --> J["IDF1\n侧重 ID"]
    style A fill:#0c4a6e
    style G fill:#14532d
    style H fill:#7c2d12`,
            tip: "评估时不要只看 MOTA——MOTA 高的算法可能 ID Switch 很多，要同时看 IDF1 才能全面了解 ID 保持能力",
            warning: "不同数据集（MOT17 vs MOT20）的评估结果不能直接比较，因为场景密度和目标类型差异很大"
        },
        {
            title: "7. 实战：YOLO + DeepSORT 视频跟踪系统",
            body: `将理论付诸实践，我们构建一个完整的视频目标跟踪系统。YOLO（You Only Look Once）作为检测器提供实时的高精度边界框，DeepSORT 作为跟踪器维护目标身份和轨迹。完整的流水线包括：视频解码 → YOLO 检测 → 置信度过滤 → 特征提取 → DeepSORT 关联 → 结果渲染。实战中有几个关键点容易踩坑：YOLO 输出的是类别+置信度+边框，需要过滤掉不需要的类别；DeepSORT 的 Re-ID 特征提取需要在 GPU 上批量处理以避免瓶颈；轨迹可视化时不同 ID 需要分配不同颜色。此外，实际部署中需要考虑视频的 I/O 瓶颈——使用 FFmpeg 硬解可以大幅提升吞吐量。下面给出一个完整的可运行实现。`,
            code: [
                {
                    lang: "python",
                    code: `import cv2
import numpy as np
from deep_sort_realtime.deepsort_tracker import DeepSort

class VideoTracker:
    """YOLO + DeepSORT 完整视频跟踪系统"""
    def __init__(self, video_path, output_path, conf_thresh=0.45):
        self.cap = cv2.VideoCapture(video_path)
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        # YOLO 检测器（使用 Ultralytics）
        from ultralytics import YOLO
        self.model = YOLO("yolov8n.pt")
        self.conf_thresh = conf_thresh

        # DeepSORT 跟踪器
        self.tracker = DeepSort(
            max_age=30,
            n_init=3,
            nms_max_overlap=1.0,
            max_cosine_distance=0.2,
            nn_budget=100,
            override_track_class=None
        )

        # 输出视频写入
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        self.out = cv2.VideoWriter(output_path, fourcc, self.fps,
                                    (self.width, self.height))

        # 颜色表
        np.random.seed(42)
        self.colors = np.random.randint(0, 255, size=(100, 3))

    def process_frame(self, frame):
        """处理单帧"""
        # YOLO 检测
        results = self.model(frame, verbose=False)
        detections = []
        for r in results:
            for box in r.boxes:
                if box.conf[0] >= self.conf_thresh:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    # DeepSORT 格式: ([x1,y1,w,h], conf, class)
                    w, h = x2 - x1, y2 - y1
                    detections.append(([x1, y1, w, h], conf, cls))

        # DeepSORT 更新
        tracks = self.tracker.update_tracks(detections, frame=frame)

        # 渲染
        for track in tracks:
            if not track.is_confirmed():
                continue
            track_id = track.track_id
            ltrb = track.to_ltrb()
            x1, y1, x2, y2 = map(int, ltrb)
            color = self.colors[track_id % 100].tolist()
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, f"ID:{track_id}", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        return frame
`
                },
                {
                    lang: "python",
                    code: `    def run(self):
        """处理整个视频"""
        frame_count = 0
        while True:
            ret, frame = self.cap.read()
            if not ret:
                break

            frame = self.process_frame(frame)
            self.out.write(frame)
            frame_count += 1

            if frame_count % 100 == 0:
                print(f"已处理 {frame_count} 帧")

        self.cap.release()
        self.out.release()
        print(f"完成! 共处理 {frame_count} 帧, "
              f"FPS: {frame_count / (frame_count / self.fps):.1f}")

# 使用示例
if __name__ == "__main__":
    tracker = VideoTracker(
        video_path="input.mp4",
        output_path="output.mp4",
        conf_thresh=0.45
    )
    tracker.run()

# 性能优化建议:
# 1. YOLO 使用 n/s/m/l/x 不同尺寸模型平衡速度和精度
# 2. 高分辨率视频可以先 resize 到 640x640 再检测
# 3. 使用 TensorRT 推理可以加速 3-5 倍
# 4. 跟踪器可以跑在 CPU 上，节省 GPU 给检测器
`
                }
            ],
            table: {
                headers: ["组件", "推荐配置", "GPU 显存", "FPS（1080p）"],
                rows: [
                    ["YOLOv8n + DeepSORT", "RTX 3060", "3GB", "25-30"],
                    ["YOLOv8s + DeepSORT", "RTX 3060", "4GB", "18-22"],
                    ["YOLOv8m + ByteTrack", "RTX 3060", "5GB", "12-15"],
                    ["YOLOv8n + ByteTrack (CPU)", "CPU only", "0GB", "5-8"],
                    ["YOLOv8x + ByteTrack (TensorRT)", "RTX 4090", "8GB", "60+"]
                ]
            },
            mermaid: `graph LR
    A["输入视频\nMP4/RTSP"] --> B["FFmpeg 硬解码\n逐帧读取"]
    B --> C["YOLO 检测\n边界框 + 置信度"]
    C --> D["置信度过滤\nconf > 0.45"]
    D --> E["Re-ID 特征提取\n128 维向量"]
    E --> F["DeepSORT 关联\n级联匹配"]
    F --> G["轨迹管理\n初始化/更新/删除"]
    G --> H["渲染输出\nID 颜色标注"]
    H --> I["视频写入\nMP4 保存"]
    style A fill:#0c4a6e
    style I fill:#14532d`,
            tip: "生产环境推荐 YOLOv8n + ByteTrack 组合——检测速度快、跟踪效果好、无需额外 Re-ID 模型，部署成本最低",
            warning: "DeepSORT 的 Re-ID 模型在 GPU 上会占用约 1.5GB 显存，如果同时跑检测器，需要至少 4GB 显存的显卡"
        }
    ],
};
