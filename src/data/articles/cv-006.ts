import { Article } from '../knowledge';

export const article: Article = {
    id: "cv-006",
    title: "人脸检测与识别：MTCNN, ArcFace",
    category: "cv",
    tags: ["人脸识别", "MTCNN", "ArcFace"],
    summary: "从人脸检测到身份识别，掌握面部识别的完整技术栈",
    date: "2026-04-12",
    readTime: "20 min",
    level: "进阶",
    content: [
        {
            title: "1. 人脸检测 vs 人脸识别：两个不同的问题",
            body: `人脸检测（Face Detection）和人脸识别（Face Recognition）是面部分析流水线中两个截然不同但又紧密关联的阶段。**人脸检测回答的是「图片里有没有人脸，在哪里」**——它的输出是边界框坐标，属于目标检测的子任务；**人脸识别回答的是「这张脸是谁」**——它的输出是身份标签或相似度分数，本质是高维特征空间中的最近邻匹配。完整的人脸识别系统需要先经过检测（定位人脸）、对齐（矫正姿态）、归一化（统一分辨率），最后才能送入识别模型提取身份特征。如果检测阶段漏掉了一张人脸，后续再强大的识别模型也无从发挥作用；反之，如果检测精准但识别模型区分度不足，系统会把不同人误判为同一人。因此，**人脸检测追求的是高召回率，而人脸识别追求的是高区分度**。`,
            code: [
                {
                    lang: "python",
                    code: `# 人脸识别完整流水线
from dataclasses import dataclass
from typing import List, Tuple
import numpy as np

@dataclass
class FaceInfo:
    """单张人脸的完整信息"""
    bbox: Tuple[float, float, float, float]  # [x1, y1, x2, y2]
    confidence: float                         # 检测置信度
    landmarks: np.ndarray                     # 5 个关键点 [5, 2]
    aligned_face: np.ndarray                  # 对齐后的 112x112 图像
    embedding: np.ndarray                     # 512 维身份特征向量
    identity: str = ""                        # 识别结果（姓名/ID）

class FacePipeline:
    """完整的人脸检测 → 识别流水线"""
    def __init__(self, detector, aligner, recognizer):
        self.detector = detector    # MTCNN / RetinaFace
        self.aligner = aligner      # 相似变换对齐
        self.recognizer = recognizer # ArcFace / FaceNet

    def process(self, image: np.ndarray) -> List[FaceInfo]:
        # Step 1: 检测所有人脸
        raw_faces = self.detector.detect(image)

        # Step 2: 对齐 + 裁剪
        aligned = [self.aligner.align(image, f) for f in raw_faces]

        # Step 3: 提取身份特征
        embeddings = self.recognizer.encode(aligned)

        # Step 4: 匹配数据库
        results = []
        for face, emb in zip(raw_faces, embeddings):
            face_info = FaceInfo(
                bbox=face.bbox,
                confidence=face.confidence,
                landmarks=face.landmarks,
                aligned_face=face.aligned,
                embedding=emb
            )
            face_info.identity = self.recognizer.identify(emb)
            results.append(face_info)

        return results
`
                },
                {
                    lang: "python",
                    code: `# 人脸识别中的关键指标
def compute_verification_metrics(similarities, labels, thresholds):
    """
    验证模式下的评估：判断两张脸是否为同一人
    similarities: 余弦相似度分数
    labels: 1 = 同一人, 0 = 不同人
    thresholds: 不同的判定阈值
    """
    results = {}
    for thresh in thresholds:
        preds = (similarities >= thresh).astype(int)
        tp = np.sum((preds == 1) & (labels == 1))
        fp = np.sum((preds == 1) & (labels == 0))
        fn = np.sum((preds == 0) & (labels == 1))
        tn = np.sum((preds == 0) & (labels == 0))

        accuracy = (tp + tn) / len(labels)
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0

        results[thresh] = {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "fpr": fpr  # 假阳性率（安全场景最关键）
        }
    return results

# 识别模式（1:N 检索）vs 验证模式（1:1 比对）
print("验证（1:1）: 两张脸是否为同一人？ → 门禁、支付")
print("识别（1:N）: 这张脸是谁？       → 考勤、安防")
print("N:N 搜索: 两张照片之间所有人配对 → 相册聚类")
`
                }
            ],
            table: {
                headers: ["任务", "输入", "输出", "典型应用", "核心难点"],
                rows: [
                    ["人脸检测", "整张图像", "边界框 + 置信度", "相机自动对焦", "小人脸/遮挡/侧脸"],
                    ["人脸对齐", "检测框 + 关键点", "标准化正面图像", "识别前预处理", "大姿态角矫正"],
                    ["人脸验证（1:1）", "两张对齐人脸", "是否同一人 + 置信度", "手机解锁", "活体防御"],
                    ["人脸识别（1:N）", "一张对齐人脸", "Top-K 候选人 + 分数", "安防布控", "大规模检索效率"],
                    ["人脸属性分析", "对齐人脸", "年龄/性别/表情", "营销分析", "多任务学习平衡"]
                ]
            },
            mermaid: `graph LR
    A["原始图像"] --> B["人脸检测
MTCNN/RetinaFace"]
    B --> C["边界框 + 关键点"]
    C --> D["人脸对齐
相似变换"]
    D --> E["归一化图像
112x112 RGB"]
    E --> F["特征提取
ArcFace/FaceNet"]
    F --> G["512 维嵌入向量"]
    G --> H{"任务类型"}
    H --> I["1:1 验证
余弦相似度 > 阈值"]
    H --> J["1:N 识别
Top-K 检索"]
    class J s2
    class I s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
            tip: "工业级系统通常将检测和识别部署为独立的微服务——检测服务追求高吞吐，识别服务追求低延迟，两者通过消息队列解耦",
            warning: "不要在原始图像上直接做识别——没有经过对齐的人脸在特征空间中会产生巨大的 intra-class 方差，严重影响识别精度"
        },
        {
            title: "2. 传统方法回顾：Viola-Jones 检测器",
            body: `在深度学习统治计算机视觉之前，**Viola-Jones（2001）是人脸检测的绝对霸主，也是第一个能实时运行的目标检测算法**。其核心由四个创新组成：Haar-like 特征用简单的矩形灰度差来编码面部结构（例如眼睛区域比脸颊暗，鼻梁比两侧亮）；积分图（Integral Image）让任意尺寸矩形区域的像素和能在 O(1) 时间内计算，这是实时性的关键；AdaBoost 从数十万个候选 Haar 特征中筛选出最具判别力的约 200-600 个弱分类器，并组合成强分类器；级联结构（Cascade）将检测分为 20-30 个阶段，每个阶段快速过滤掉大量背景窗口，只有通过所有阶段的窗口才被判定为人脸。**Viola-Jones 的级联设计极其高效——绝大多数背景区域只需极少的计算量就能排除**。虽然它在 2020 年代已被深度学习全面超越，但**理解它的设计思想（特征工程 → 高效计算 → 级联加速）对学习现代检测器仍有重要启发**。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np

class IntegralImage:
    """
    积分图：O(1) 计算任意矩形区域像素和
    ii[x,y] = sum of all pixels above and to the left of (x,y)
    """
    def __init__(self, image: np.ndarray):
        # 积分图需要在原图外围补一行一列零
        self.ii = np.cumsum(np.cumsum(image, axis=0), axis=1)
        self.ii = np.pad(self.ii, ((1, 0), (0, 0)), mode='constant')
        self.ii = np.pad(self.ii, ((0, 0), (1, 0)), mode='constant')

    def rect_sum(self, x1, y1, x2, y2) -> float:
        """矩形区域 (x1,y1) 到 (x2,y2) 的像素和"""
        return (self.ii[y2+1, x2+1]
                - self.ii[y1, x2+1]
                - self.ii[y2+1, x1]
                + self.ii[y1, x1])

# Haar-like 特征类型
# 类型 1: 两矩形（水平/垂直）→ 编码明暗边界
# 类型 2: 三矩形         → 编码线条特征（如鼻梁）
# 类型 3: 四矩形         → 编码对角线特征
# 类型 4: 中心-周围       → 编码圆形特征（如瞳孔）

# 使用积分图计算 Haar 特征值
def compute_haar_feature(ii: IntegralImage, feature_type, x, y, w, h) -> float:
    """计算单个 Haar 特征值"""
    if feature_type == "two_horizontal":
        # 上方矩形 - 下方矩形
        bright = ii.rect_sum(x, y, x+w-1, y+h//2-1)
        dark = ii.rect_sum(x, y+h//2, x+w-1, y+h-1)
        return bright - dark
    elif feature_type == "three_vertical":
        # 左 - 中*2 + 右
        left = ii.rect_sum(x, y, x+w//3-1, y+h-1)
        mid = ii.rect_sum(x+w//3, y, x+2*w//3-1, y+h-1)
        right = ii.rect_sum(x+2*w//3, y, x+w-1, y+h-1)
        return left - 2*mid + right
    return 0.0
`
                },
                {
                    lang: "python",
                    code: `class CascadeStage:
    """级联分类器的单个阶段"""
    def __init__(self, weak_classifiers, threshold):
        """
        weak_classifiers: [(feature, polarity, alpha), ...]
        threshold: 阶段判定阈值
        """
        self.weak_classifiers = weak_classifiers
        self.threshold = threshold

    def evaluate(self, ii: IntegralImage, x, y, w, h) -> bool:
        """通过 → True，拒绝 → False"""
        score = sum(
            alpha if self._feature_value(fc, ii, x, y, w, h) * polarity > 0 else 0
            for fc, polarity, alpha in self.weak_classifiers
        )
        return score >= self.threshold

class ViolaJonesDetector:
    """Viola-Jones 人脸检测器"""
    def __init__(self, cascade_stages, min_face_size=(24, 24), scale_factor=1.25):
        self.cascade = cascade_stages
        self.min_face = min_face_size
        self.scale_factor = scale_factor

    def detect(self, image: np.ndarray) -> list:
        """滑动窗口 + 图像金字塔 + 级联分类"""
        gray = np.mean(image, axis=2).astype(np.uint8) if image.ndim == 3 else image
        faces = []
        scale = 1.0

        while True:
            # 缩放图像
            sw = int(gray.shape[1] / scale)
            sh = int(gray.shape[0] / scale)
            if sw < self.min_face[1] or sh < self.min_face[0]:
                break
            resized = cv2.resize(gray, (sw, sh))
            ii = IntegralImage(resized)

            # 滑动窗口扫描
            for y in range(0, sh - self.min_face[0], 2):
                for x in range(0, sw - self.min_face[1], 2):
                    # 级联分类：任一阶段拒绝即跳过
                    passed = all(
                        stage.evaluate(ii, x, y, self.min_face[1], self.min_face[0])
                        for stage in self.cascade
                    )
                    if passed:
                        faces.append((int(x*scale), int(y*scale),
                                      int(self.min_face[1]*scale),
                                      int(self.min_face[0]*scale)))
            scale *= self.scale_factor

        return self._non_max_suppression(faces)
`
                }
            ],
            table: {
                headers: ["Viola-Jones 组件", "作用", "计算复杂度", "贡献"],
                rows: [
                    ["Haar-like 特征", "编码面部明暗模式", "O(1)（积分图）", "简单高效的特征表示"],
                    ["积分图", "快速矩形区域求和", "O(1) 查询", "实时性的核心保障"],
                    ["AdaBoost", "选择最优特征组合", "O(N×特征数)", "自动特征选择"],
                    ["级联结构", "快速过滤背景窗口", "早期拒绝 >50%", "99% 计算量用于背景"],
                    ["滑动窗口", "多尺度多位置搜索", "O(图像面积×尺度数)", "覆盖所有可能人脸"]
                ]
            },
            mermaid: `graph TD
    A["输入图像"] --> B["构建图像金字塔
多尺度缩放"]
    B --> C["滑动窗口
逐位置扫描"]
    C --> D["积分图计算
O(1) 特征值"]
    D --> E{"Stage 1
2 个弱分类器"}
    E -->|"99％ 窗口被拒"| F["丢弃 ✗"]
    E -->|"1％ 通过"| G{"Stage 2
10 个弱分类器"}
    G -->|"80％ 被拒"| F
    G -->|"20％ 通过"| H["... 后续阶段"]
    H --> I["通过所有阶段
→ 人脸候选"]
    I --> J["非极大值抑制
合并重叠框"]
    J --> K["输出检测框"]
    class F s2
    class K s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d
    classDef s2 fill:#7f1d1d`,
            tip: "理解 Viola-Jones 的级联思想对学习现代检测器（如 RetinaNet 的 Focal Loss 思想）非常有帮助——本质上都是让模型专注于「难样本」而非「简单背景」",
            warning: "Viola-Jones 对侧脸（>30°）和遮挡人脸效果极差，且检测精度上限受限于 Haar 特征的表达能力，现代项目不建议使用"
        },
        {
            title: "3. MTCNN 多任务级联卷积网络",
            body: `**MTCNN（2016）是深度学习时代第一个端到端的人脸检测 + 对齐方案**。它用三个渐进的 CNN 网络（P-Net、R-Net、O-Net）构建级联检测器，每个网络同时执行三个任务：人脸/非人脸二分类（该窗口是否含人脸）、边界框回归（修正窗口坐标偏移）、五点 landmark 定位（眼睛、鼻尖、嘴角）。P-Net（Proposal Network）是全卷积网络，在图像金字塔上滑动，生成大量候选窗口并通过 NMS 初步筛选，它的特点是速度快、召回率高；R-Net（Refine Network）接收 P-Net 输出的候选窗口，进一步过滤误检并细化边界框；O-Net（Output Network）是最深的网络，产生最终的检测结果和 landmark 坐标。**MTCNN 的关键创新在于三个任务共享 backbone 特征但各有输出头**，通过多任务学习让 landmark 定位任务反过来帮助检测——当网络学会了精准定位眼睛和嘴角，它对人脸区域的边界理解也更精确。这种联合训练策略使得 MTCNN 在 WIDER FACE 数据集上显著优于当时的单任务检测器。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class PNet(nn.Module):
    """Proposal Network: 全卷积，生成候选窗口"""
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 10, kernel_size=3),   # 3→10
            nn.PReLU(),
            nn.MaxPool2d(2, 2, ceil_mode=True),
            nn.Conv2d(10, 16, kernel_size=3),   # 10→16
            nn.PReLU(),
            nn.Conv2d(16, 32, kernel_size=3),   # 16→32
            nn.PReLU(),
        )
        # 三个输出头
        self.cls_head = nn.Conv2d(32, 1, kernel_size=1)   # 人脸/背景
        self.bbox_head = nn.Conv2d(32, 4, kernel_size=1)   # bbox 回归
        self.landmark_head = nn.Conv2d(32, 10, kernel_size=1)  # 5 个关键点

    def forward(self, x):
        """输入: [N, 3, H, W], 输出分类/回归/landmark"""
        features = self.features(x)
        cls_prob = torch.sigmoid(self.cls_head(features))  # [N, 1, H', W']
        bbox_pred = self.bbox_head(features)               # [N, 4, H', W']
        landmark_pred = self.landmark_head(features)       # [N, 10, H', W']
        return cls_prob, bbox_pred, landmark_pred

class RNet(nn.Module):
    """Refine Network: 处理 P-Net 的候选窗口"""
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 28, 3), nn.PReLU(),
            nn.MaxPool2d(3, 2, ceil_mode=True),
            nn.Conv2d(28, 48, 3), nn.PReLU(),
            nn.MaxPool2d(3, 2, ceil_mode=True),
            nn.Conv2d(48, 64, 2), nn.PReLU(),
        )
        self.fc = nn.Sequential(
            nn.Linear(64 * 3 * 3, 128),
            nn.PReLU(),
        )
        self.cls_head = nn.Linear(128, 2)   # 二分类
        self.bbox_head = nn.Linear(128, 4)  # bbox 回归
        self.landmark_head = nn.Linear(128, 10)  # landmark

    def forward(self, x):
        """输入: [N, 3, 24, 24] 裁剪窗口"""
        features = self.features(x)
        features = features.view(features.size(0), -1)
        features = self.fc(features)
        cls = F.softmax(self.cls_head(features), dim=1)
        bbox = self.bbox_head(features)
        landmark = self.landmark_head(features)
        return cls, bbox, landmark
`
                },
                {
                    lang: "python",
                    code: `class MTCNN:
    """MTCNN 推理主流程"""
    def __init__(self, min_face_size=20, thresholds=[0.6, 0.7, 0.7],
                 factor=0.709):
        self.pnet = PNet().eval()
        self.rnet = RNet().eval()
        self.onet = ONet().eval()
        self.min_face = min_face_size
        self.thresholds = thresholds
        self.factor = factor  # 图像金字塔缩放因子

    def detect(self, image: np.ndarray) -> list:
        # Stage 1: P-Net 生成候选
        candidates = self._pnet_detect(image)

        if len(candidates) == 0:
            return []

        # Stage 2: R-Net 精炼
        candidates = self._rnet_refine(image, candidates)

        if len(candidates) == 0:
            return []

        # Stage 3: O-Net 输出最终结果 + landmark
        faces = self._onet_output(image, candidates)
        return faces

    def _pnet_detect(self, image):
        """P-Net: 全卷积 + 图像金字塔 + NMS"""
        scales = self._compute_scales(image)
        all_boxes = []
        for scale in scales:
            im_scaled = self._rescale_image(image, scale)
            # P-Net 前向传播
            with torch.no_grad():
                cls, bbox, lm = self.pnet(im_scaled)
            # 从热图中提取候选框
            boxes = self._generate_bboxes(cls, bbox, scale, self.thresholds[0])
            all_boxes.extend(boxes)
        # NMS 合并重叠框
        return self._nms(all_boxes, 0.5)

    def _rnet_refine(self, image, candidates):
        """R-Net: 批量处理候选窗口，进一步过滤"""
        crops = [self._crop_and_resize(image, box) for box in candidates]
        crops = torch.stack(crops)
        with torch.no_grad():
            cls, bbox, lm = self.rnet(crops)
        # 过滤低置信度 + NMS
        return self._filter_and_nms(candidates, cls, bbox, self.thresholds[1])
`
                }
            ],
            table: {
                headers: ["网络", "输入尺寸", "输出", "作用", "参数量级"],
                rows: [
                    ["P-Net", "12x12（全卷积）", "cls + bbox + landmark", "生成候选窗口", "~50K"],
                    ["R-Net", "24x24", "cls + bbox + landmark", "过滤误检 + 精炼", "~300K"],
                    ["O-Net", "48x48", "cls + bbox + landmark", "最终输出 + 精确 landmark", "~900K"],
                    ["P-Net 特点", "全卷积无需裁剪", "直接在金字塔上滑动", "高召回、低精度", "最轻量"],
                    ["级联策略", "逐阶段收紧阈值", "P:0.6 → R:0.7 → O:0.7", "速度由 P-Net 决定", "渐进式过滤"]
                ]
            },
            mermaid: `graph TD
    A["输入图像"] --> B["图像金字塔
多尺度缩放"]
    B --> C["P-Net 全卷积
滑动预测"]
    C --> D["候选边界框
+ NMS 合并"]
    D --> E{"通过 P-Net
阈值 ≥ 0.6?"}
    E -->|否| F["丢弃 ✗"]
    E -->|是| G["R-Net 24x24
批量推理"]
    G --> H{"通过 R-Net
阈值 ≥ 0.7?"}
    H -->|否| F
    H -->|是| I["O-Net 48x48
精细检测"]
    I --> J{"通过 O-Net
阈值 ≥ 0.7?"}
    J -->|否| F
    J -->|是| K["输出边界框
+ 5 点 landmark"]
    class F s2
    class K s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d
    classDef s2 fill:#7f1d1d`,
            tip: "MTCNN 的 min_face_size 参数决定了能检测到的最小人脸——设为 20 可以检测到约 20 像素宽的人脸，但会增加 P-Net 的计算量",
            warning: "MTCNN 在密集人脸场景（超过 50 张脸）下速度显著下降，因为 R-Net 和 O-Net 需要对每个候选窗口单独推理，考虑改用 RetinaFace"
        },
        {
            title: "4. 人脸对齐与裁剪：相似变换的艺术",
            body: `**人脸对齐是识别前最关键也最容易被忽视的预处理步骤**。即使检测器精准定位了人脸边界框，如果人脸是侧倾（roll）、偏航（yaw）或俯仰（pitch）姿态，直接裁剪输入识别模型会导致特征提取质量大幅下降。**对齐的目标是将任意姿态的人脸通过仿射变换校正为标准正面视图**，使双眼位于水平线上、面部居中、大小统一。MTCNN 输出的五个 landmark（左眼、右眼、鼻尖、左嘴角、右嘴角）为实现这一点提供了足够信息。最常用的是相似变换（Similarity Transformation），它包含旋转、平移和均匀缩放共 4 个自由度，通过最小二乘法将检测到的 landmark 映射到标准模板位置。与完整的仿射变换（6 自由度）相比，相似变换保持了面部比例不变形；与透视变换（8 自由度）相比，它更稳定且不易过拟合。标准模板通常基于大量正面人脸的平均 landmark 位置定义，常见的对齐后尺寸为 112x112（ArcFace 标准）或 160x160（FaceNet 标准）。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np
import cv2

# 标准模板：ArcFace 的 112x112 参考点
ARCFACE_REF = np.array([
    [30.2946, 51.6963],   # 左眼中心
    [65.5318, 51.5014],   # 右眼中心
    [48.0252, 71.7366],   # 鼻尖
    [33.5493, 92.3655],   # 左嘴角
    [62.7299, 92.2041],   # 右嘴角
], dtype=np.float32)

def estimate_similarity_transform(src_pts: np.ndarray, dst_pts: np.ndarray = ARCFACE_REF) -> np.ndarray:
    """
    计算从检测 landmark 到标准模板的相似变换矩阵
    src_pts: [5, 2] 检测到的 5 个关键点
    返回: 2x3 仿射变换矩阵
    """
    assert src_pts.shape == (5, 2), "需要 5 个 2D 关键点"

    # 使用 3 个点（双眼 + 鼻尖）计算相似变换
    # 第 4 个点用于验证
    src3 = src_pts[:3].astype(np.float64)
    dst3 = dst_pts[:3].astype(np.float64)

    # 计算重心
    src_mean = src3.mean(axis=0)
    dst_mean = dst3.mean(axis=0)

    # 去中心化
    src_centered = src3 - src_mean
    dst_centered = dst3 - dst_mean

    # 计算尺度
    src_scale = np.sqrt(np.sum(src_centered  2))
    dst_scale = np.sqrt(np.sum(dst_centered  2))

    # 归一化
    src_norm = src_centered / src_scale
    dst_norm = dst_centered / dst_scale

    # 计算旋转角度（2D 叉积 + 点积）
    cos_theta = np.sum(src_norm * dst_norm)
    sin_theta = src_norm[0, 0] * dst_norm[0, 1] - src_norm[0, 1] * dst_norm[0, 0]

    # 构建变换矩阵
    scale = dst_scale / src_scale
    M = np.zeros((2, 3))
    M[0, 0] = scale * cos_theta
    M[0, 1] = -scale * sin_theta
    M[1, 0] = scale * sin_theta
    M[1, 1] = scale * cos_theta
    M[:, 2] = dst_mean - scale * np.array([
        cos_theta * src_mean[0] - sin_theta * src_mean[1],
        sin_theta * src_mean[0] + cos_theta * src_mean[1]
    ])

    return M.astype(np.float32)
`
                },
                {
                    lang: "python",
                    code: `def align_face(image: np.ndarray, landmarks: np.ndarray,
                output_size: tuple = (112, 112),
                border_value: int = 0) -> np.ndarray:
    """
    对齐并裁剪人脸
    image: 原始图像 (H, W, 3)
    landmarks: [5, 2] 关键点坐标
    返回: 对齐后的 (output_size[1], output_size[0], 3) 图像
    """
    # 计算变换矩阵
    M = estimate_similarity_transform(landmarks)

    # 应用仿射变换
    aligned = cv2.warpAffine(
        image, M,
        (output_size[1], output_size[0]),  # (width, height)
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(border_value, border_value, border_value)
    )

    return aligned

def batch_align(images: np.ndarray, all_landmarks: np.ndarray,
                output_size: tuple = (112, 112)) -> np.ndarray:
    """批量对齐：一次性处理多张人脸"""
    aligned_faces = []
    for img, lm in zip(images, all_landmarks):
        aligned = align_face(img, lm, output_size)
        aligned_faces.append(aligned)
    return np.stack(aligned_faces)  # [N, H, W, 3]

# 可视化对齐效果
def visualize_alignment(image, landmarks, aligned_face):
    fig, axes = plt.subplots(1, 3, figsize=(12, 4))
    axes[0].imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    axes[0].scatter(landmarks[:, 0], landmarks[:, 1], c='r', s=20)
    axes[0].set_title("原始 + 关键点")
    axes[1].imshow(cv2.cvtColor(aligned_face, cv2.COLOR_BGR2RGB))
    axes[1].set_title("对齐后 112x112")
    # 对比未对齐的裁剪
    x1, y1 = landmarks.min(axis=0).astype(int)
    x2, y2 = landmarks.max(axis=0).astype(int)
    cropped = image[y1:y2, x1:x2]
    axes[2].imshow(cv2.resize(cropped, (112, 112)))
    axes[2].set_title("直接裁剪（未对齐）")
    return fig
`
                }
            ],
            table: {
                headers: ["对齐方法", "自由度", "优点", "缺点", "适用场景"],
                rows: [
                    ["相似变换", "4（旋转+平移+缩放）", "保持面部比例", "无法处理大姿态角", "正面/小角度最常用"],
                    ["仿射变换", "6（+ 各轴独立缩放）", "更灵活的形变", "可能导致面部拉伸变形", "中等姿态角"],
                    ["透视变换", "8（+ 透视畸变）", "处理大角度偏航", "需要更多对应点，不稳定", "极端侧脸"],
                    ["3D 对齐", "9（+ 深度）", "物理意义明确", "需要 3D 模型和 68+ 关键点", "最高精度场景"],
                    ["STN 端到端", "可学习", "网络自动学习最优变换", "黑盒、不可解释", "深度学习集成"]
                ]
            },
            mermaid: `graph TD
    A["检测框 + 5 关键点"] --> B["计算重心
src_mean, dst_mean"]
    B --> C["去中心化
减去均值"]
    C --> D["计算尺度比
scale = dst/src"]
    C --> E["计算旋转角
cosθ, sinθ"]
    D --> F["构建 2x3
变换矩阵"]
    E --> F
    F --> G["warpAffine
仿射变换"]
    G --> H["112x112
对齐人脸"]
    H --> I["送入识别网络
特征提取"]
    class I s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "ArcFace 官方代码使用 112x112 输出尺寸和上述 ARCFACE_REF 参考点，如果你的识别模型是基于 ArcFace 训练的，务必使用完全相同的对齐参数",
            warning: "如果检测器 landmark 定位不准确（例如侧脸时眼角点偏移），对齐结果会产生系统性偏差——对齐质量直接决定了识别上限"
        },
        {
            title: "5. 人脸识别特征提取：FaceNet 与 ArcFace",
            body: `**人脸识别的核心是将一张人脸图像映射到一个固定维度的特征向量（嵌入/embedding）**，使得同一个人的不同照片在特征空间中距离很近，不同人的照片距离很远。FaceNet（2015）首次将这个问题统一为度量学习（Metric Learning）框架：使用 Triplet Loss 直接优化特征空间中的相对距离，无需最后的分类层。FaceNet 的 Triplet Loss 选择一个 anchor（基准样本）、一个 positive（同人的另一张）和一个 negative（不同人），要求 anchor 到 positive 的距离比到 negative 的距离至少小一个 margin α。然而 **Triplet Loss 在大规模数据集上面临采样困难——需要精心选择「难三元组」才能有效训练**。ArcFace（2019）提出了更优雅的解决方案：在 Softmax 分类框架下，通过角度边际（Angular Margin）直接修改最后的全连接层，使得同类特征在角度空间中被推开 α 弧度。**ArcFace 的优势在于训练更稳定、无需难样本挖掘，可直接用标准交叉熵优化**。FaceNet 输出 128 维特征，ArcFace 通常输出 512 维特征，后者在高精度场景（如金融级验证）中表现更优。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class FaceNetTripletLoss(nn.Module):
    """FaceNet Triplet Loss"""
    def __init__(self, margin=0.2):
        super().__init__()
        self.margin = margin

    def forward(self, anchor, positive, negative):
        """
        anchor: [N, D] 基准样本特征
        positive: [N, D] 同人的特征
        negative: [N, D] 不同人的特征
        """
        dist_pos = F.pairwise_distance(anchor, positive, p=2)       # [N]
        dist_neg = F.pairwise_distance(anchor, negative, p=2)       # [N]
        loss = F.relu(dist_pos - dist_neg + self.margin)            # [N]
        return loss.mean()

class ArcMarginProduct(nn.Module):
    """ArcFace 角度边际全连接层"""
    def __init__(self, in_features=512, out_features=85742,  # CASIA-WebFace 身份数
                 s=64.0, m=0.50):
        """
        s: 缩放因子（特征模长归一化后放大）
        m: 角度边际（弧度），论文推荐 0.50
        """
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.s = s
        self.m = m
        self.weight = nn.Parameter(torch.Tensor(out_features, in_features))
        nn.init.xavier_uniform_(self.weight)

    def forward(self, x, label):
        """
        x: [N, 512] L2 归一化的特征向量
        label: [N] 身份标签
        返回: [N, out_features] 角度边际 logits
        """
        # 归一化权重
        weight_norm = F.normalize(self.weight, dim=1)
        x_norm = F.normalize(x, dim=1)

        # cos(θ) = x·W / (|x|·|W|)
        cos_theta = F.linear(x_norm, weight_norm)  # [N, C]
        cos_theta = cos_theta.clamp(-1, 1)

        # cos(θ + m) = cos(θ)cos(m) - sin(θ)sin(m)
        sin_theta = torch.sqrt(1.0 - cos_theta ** 2 + 1e-7)
        cos_m = math.cos(self.m)
        sin_m = math.sin(self.m)
        cos_theta_m = cos_theta * cos_m - sin_theta * sin_m

        # one-hot 标签
        one_hot = F.one_hot(label, num_classes=self.out_features).float()

        # 只在真实类别上施加角度边际
        logits = cos_theta + (cos_theta_m - cos_theta) * one_hot
        logits *= self.s  # 缩放

        return logits
`
                },
                {
                    lang: "python",
                    code: `class ArcFaceModel(nn.Module):
    """完整的 ArcFace 人脸识别模型"""
    def __init__(self, backbone, num_classes=85742, embedding_size=512):
        """
        backbone: ResNet-50/100 或 MobileNet
        num_classes: 训练集身份类别数
        """
        super().__init__()
        # 特征提取 backbone
        self.backbone = backbone
        # 瓶颈层：将 backbone 输出映射到 embedding_size
        self.bottleneck = nn.Sequential(
            nn.BatchNorm1d(2048),
            nn.Dropout(0.4),
            nn.Linear(2048, embedding_size, bias=False),
            nn.BatchNorm1d(embedding_size)
        )
        # ArcFace 分类头
        self.arcface = ArcMarginProduct(
            in_features=embedding_size,
            out_features=num_classes,
            s=64.0, m=0.50
        )

    def forward(self, x, label=None):
        features = self.backbone(x)       # [N, 2048, 7, 7]
        features = features.view(features.size(0), -1)  # [N, 2048]
        embedding = self.bottleneck(features)             # [N, 512]
        embedding = F.normalize(embedding, dim=1)

        if label is not None:
            logits = self.arcface(embedding, label)
            return logits, embedding
        return embedding  # 推理时只返回特征向量

    def extract_features(self, x) -> np.ndarray:
        """推理：提取特征嵌入"""
        self.eval()
        with torch.no_grad():
            embedding = self.forward(x)
        return embedding.cpu().numpy()

# 识别：1:N 检索
def identify_face(query_embedding, gallery_embeddings, gallery_ids, top_k=5):
    """在人脸库中检索最相似的人"""
    # 计算余弦相似度
    similarities = F.cosine_similarity(
        torch.from_numpy(query_embedding).unsqueeze(0),
        torch.from_numpy(gallery_embeddings),
        dim=1
    )
    # Top-K 结果
    top_k_values, top_k_indices = similarities.topk(top_k)
    results = [(gallery_ids[i], similarities[i].item())
               for i in top_k_indices]
    return results
`
                }
            ],
            table: {
                headers: ["特性", "FaceNet", "ArcFace"],
                rows: [
                    ["损失函数", "Triplet Loss", "ArcFace Angular Margin"],
                    ["特征维度", "128", "512"],
                    ["训练方式", "难三元组采样", "标准交叉熵"],
                    ["Backbone", "Inception-ResNet-v1", "ResNet-50/100"],
                    ["LFW 精度", "99.63%", "99.83%"],
                    ["CFP-FP", "95.92%", "98.27%"],
                    ["大规模训练", "困难（需精心采样）", "容易（直接分类）"],
                    ["开源实现", "facenet repo", "InsightFace"]
                ]
            },
            mermaid: `graph TD
    A["对齐人脸
112x112"] --> B["Backbone
ResNet-50"]
    B --> C["2048 维特征"]
    C --> D["Bottleneck
BN + Dropout + Linear"]
    D --> E["512 维嵌入
L2 归一化"]
    E --> F{"训练 or 推理?"}
    F -->|训练| G["ArcFace 分类头
角度边际 + CrossEntropy"]
    F -->|推理| H["直接输出嵌入"]
    G --> I["最小化类内角度
最大化类间角度"]
    H --> J["余弦相似度
最近邻匹配"]
    class J s2
    class I s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12
    classDef s2 fill:#14532d`,
            tip: "ArcFace 的 s=64 和 m=0.50 是经验值——m 太大会导致类间过度分离，m 太小则区分度不足，建议在 0.35-0.55 范围内调参",
            warning: "特征归一化（L2 normalize）是必须的——ArcFace 的角度边际公式假设输入特征模长为 1，如果不归一化，训练会不稳定甚至发散"
        },
        {
            title: "6. 损失函数对比：Triplet / ArcFace / CosFace",
            body: `**人脸识别的损失函数演进是度量学习最精彩的故事之一**。Triplet Loss（FaceNet, 2015）的直觉最简单：让同人的特征距离比不同人近至少一个 margin。但**它的致命弱点是采样效率**——从 N 张图片中随机选三元组，绝大多数是「简单三元组」（同人的已经很近、不同人的已经很远），对梯度没有贡献。为了解决这个问题，研究者提出了在线难样本挖掘（Online Hard Example Mining, OHEM），但这也增加了训练复杂度和不稳定性。CosFace（2018）和 ArcFace（2019）选择了不同的路径：它们回到 Softmax 分类框架，通过在角度空间中施加边际来增大类间区分度。CosFace 直接在 cos(θ) 上减去固定边际 m（cos(θ) - m），而 ArcFace 在角度 θ 上直接加 m（cos(θ+m)），**后者的几何意义更精确——在超球面上均匀推开各类边界**。实验表明，ArcFace > CosFace > SphereFace > Triplet Loss，在各大基准数据集上都有稳定的性能优势。此外，这些损失函数可以组合使用，例如 ArcFace + Triplet Loss 的混合损失在部分场景下能进一步提升鲁棒性。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn.functional as F
import math

class SphereFaceLoss(nn.Module):
    """SphereFace: cos(m*θ)，第一个角度边际损失"""
    def __init__(self, in_features, out_features, m=4, s=15):
        super().__init__()
        self.m = m  # 角度倍增因子
        self.s = s  # 缩放因子
        self.weight = nn.Parameter(torch.Tensor(out_features, in_features))
        nn.init.xavier_uniform_(self.weight)

    def forward(self, x, label):
        x_norm = F.normalize(x, dim=1)
        w_norm = F.normalize(self.weight, dim=1)
        cos_theta = F.linear(x_norm, w_norm).clamp(-1, 1)
        theta = torch.acos(cos_theta)

        # cos(m*θ) 使用切比雪夫多项式展开
        cos_m_theta = self._chebyshev(cos_theta, self.m)

        one_hot = F.one_hot(label, num_classes=self.weight.size(0)).float()
        logits = cos_theta + (cos_m_theta - cos_theta) * one_hot
        logits *= self.s
        return logits

    def _chebyshev(self, x, m):
        """切比雪夫多项式 T_m(x) = cos(m*arccos(x))"""
        if m == 1: return x
        if m == 2: return 2*x**2 - 1
        if m == 3: return 4*x**3 - 3*x
        if m == 4: return 8*x4 - 8*x2 + 1
        return x  # fallback

class CosFaceLoss(nn.Module):
    """CosFace: cos(θ) - m，加性余弦边际"""
    def __init__(self, in_features, out_features, m=0.35, s=64):
        super().__init__()
        self.m = m
        self.s = s
        self.weight = nn.Parameter(torch.Tensor(out_features, in_features))
        nn.init.xavier_uniform_(self.weight)

    def forward(self, x, label):
        cos_theta = F.linear(F.normalize(x), F.normalize(self.weight))
        cos_theta = cos_theta.clamp(-1, 1)
        one_hot = F.one_hot(label, self.weight.size(0)).float()
        logits = cos_theta - self.m * one_hot
        logits *= self.s
        return logits
`
                },
                {
                    lang: "python",
                    code: `# 三种损失函数的可视化对比
import numpy as np
import matplotlib.pyplot as plt

def compare_loss_functions():
    theta = np.linspace(0, np.pi/2, 500)

    fig, axes = plt.subplots(2, 2, figsize=(12, 10))

    # 1. Softmax (baseline): -cos(θ)
    ax = axes[0, 0]
    ax.plot(theta, -np.cos(theta), label="Softmax: -cos(θ)")
    ax.set_title("Softmax (无边际)")
    ax.set_xlabel("角度 θ"); ax.set_ylabel("logits")
    ax.legend(); ax.grid(True, alpha=0.3)

    # 2. SphereFace: cos(m*θ)
    ax = axes[0, 1]
    m = 4
    ax.plot(theta, -np.cos(m * theta), label=f"SphereFace: cos({m}θ)")
    ax.plot(theta, -np.cos(theta), '--', label="baseline", alpha=0.5)
    ax.set_title("SphereFace (角度倍增)")
    ax.legend(); ax.grid(True, alpha=0.3)

    # 3. CosFace: cos(θ) - m
    ax = axes[1, 0]
    m = 0.35
    ax.plot(theta, -(np.cos(theta) - m), label=f"CosFace: cos(θ)-{m}")
    ax.plot(theta, -np.cos(theta), '--', label="baseline", alpha=0.5)
    ax.set_title("CosFace (加性余弦)")
    ax.legend(); ax.grid(True, alpha=0.3)

    # 4. ArcFace: cos(θ + m)
    ax = axes[1, 1]
    m = 0.50
    ax.plot(theta, -np.cos(theta + m), label=f"ArcFace: cos(θ+{m})")
    ax.plot(theta, -np.cos(theta), '--', label="baseline", alpha=0.5)
    ax.set_title("ArcFace (加性角度)")
    ax.legend(); ax.grid(True, alpha=0.3)

    plt.tight_layout()
    return fig

# 直观理解:
# SphereFace: 把角度空间压缩 m 倍 → 决策边界变窄
# CosFace:    把余弦值整体下移 m → 需要更大的 cos(θ) 才能分类正确
# ArcFace:    在角度上直接加 m → 几何意义最精确，类间角度间隔固定
print("最优选择: ArcFace > CosFace > SphereFace > Triplet Loss > Softmax")
`
                }
            ],
            table: {
                headers: ["损失函数", "边际形式", "决策边界", "优势", "劣势"],
                rows: [
                    ["Softmax", "无", "cos(θ₁) > cos(θ₂)", "训练稳定简单", "类间区分度不足"],
                    ["Triplet Loss", "距离差 d(a,p) - d(a,n) < -α", "相对距离约束", "直观、无需分类头", "采样困难、训练不稳定"],
                    ["SphereFace", "cos(m·θ)", "角度倍增", "开创性角度边际", "m 过大时训练困难"],
                    ["CosFace", "cos(θ) - m", "加性余弦平移", "训练稳定、效果好", "余弦边际不够精确"],
                    ["ArcFace", "cos(θ + m)", "加性角度边际", "几何精确、SOTA", "实现稍复杂"]
                ]
            },
            mermaid: `graph TD
    A["Softmax
无边际"] -->|"加距离约束"| B["Triplet Loss
d(a,p) + α < d(a,n)"]
    B -->|"回到分类框架
加角度约束"| C["SphereFace
cos(m·θ)"]
    C -->|"简化边际形式"| D["CosFace
cos(θ) - m"]
    D -->|"精确几何边际"| E["ArcFace
cos(θ + m)"]
    E --> F["类内角度压缩
类间角度推开"]
    F --> G["超球面均匀分布
最优区分度"]
    class G s3
    class E s2
    class B s1
    class A s0
    classDef s0 fill:#7f1d1d
    classDef s1 fill:#7c2d12
    classDef s2 fill:#14532d
    classDef s3 fill:#14532d`,
            tip: "新项目直接选择 ArcFace 作为起点——它已经是最成熟、效果最好的选择，无需再比较其他损失函数",
            warning: "Triplet Loss 的 margin α 和 ArcFace 的 margin m 是完全不同的概念——Triplet 的 α 是欧氏距离差值（通常 0.2-0.5），ArcFace 的 m 是弧度（通常 0.35-0.55），不要混淆"
        },
        {
            title: "7. 实战：face_recognition 库 + 人脸识别系统",
            body: `face_recognition 是基于 dlib 的 Python 人脸识别库，底层使用改进的 ResNet 提取 128 维特征，通过余弦相似度进行验证和识别。**它是入门人脸识别最快的方式——只需几行代码就能完成从检测到识别的完整流程**。虽然其精度不及 ArcFace（128 维 vs 512 维特征），但对于原型验证和小规模应用（如家庭门禁、个人相册分类）已经完全够用。**生产级系统则需要考虑活体检测、大规模向量检索优化、多模型融合与隐私合规**。下面构建一个完整的可运行人脸识别系统，涵盖人脸注册、识别、批量处理三大核心功能。`,
            code: [
                {
                    lang: "python",
                    code: `import face_recognition
import numpy as np
import os
import pickle
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional

@dataclass
class PersonRecord:
    """人脸库中的个人记录"""
    name: str
    encodings: List[List[float]]  # 多张脸的平均
    photo_count: int

class FaceRecognitionSystem:
    """基于 face_recognition 的完整识别系统"""
    def __init__(self, db_path: str = "face_db.pkl",
                 tolerance: float = 0.45):
        self.db_path = db_path
        self.tolerance = tolerance  # 越低越严格
        self.database: Dict[str, PersonRecord] = {}
        self._load_database()

    def register_person(self, name: str, image_paths: List[str]):
        """注册新人：从多张照片提取特征"""
        encodings = []
        for img_path in image_paths:
            image = face_recognition.load_image_file(img_path)
            face_locs = face_recognition.face_locations(image, model="cnn")
            if len(face_locs) == 0:
                print(f"⚠ {img_path}: 未检测到人脸")
                continue
            if len(face_locs) > 1:
                print(f"⚠ {img_path}: 检测到多人，使用第一张")
            enc = face_recognition.face_encodings(
                image, known_face_locations=face_locs
            )[0]
            encodings.append(enc.tolist())

        if len(encodings) == 0:
            raise ValueError(f"{name}: 所有图片均未提取到有效人脸")

        self.database[name] = PersonRecord(
            name=name,
            encodings=encodings,
            photo_count=len(encodings)
        )
        self._save_database()
        print(f"✅ 已注册 {name} ({len(encodings)} 张照片)")

    def identify(self, image_path: str, top_n: int = 3) -> List[dict]:
        """识别图像中的人脸"""
        image = face_recognition.load_image_file(image_path)
        face_locs = face_recognition.face_locations(image, model="cnn")
        face_encs = face_recognition.face_encodings(image, face_locs)

        results = []
        for i, (loc, enc) in enumerate(zip(face_locs, face_encs)):
            best_match = self._find_best_match(enc)
            results.append({
                "location": loc,  # (top, right, bottom, left)
                "name": best_match["name"],
                "distance": best_match["distance"],
                "confidence": max(0, 1 - best_match["distance"])
            })
        return results

    def _find_best_match(self, encoding) -> dict:
        """在数据库中查找最匹配的人"""
        best_name, best_dist = "Unknown", float('inf')

        for name, record in self.database.items():
            # 与这个人所有照片取最优匹配
            db_encs = np.array(record.encodings)
            distances = face_recognition.face_distance(db_encs, encoding)
            min_dist = distances.min()
            if min_dist < best_dist:
                best_name = name
                best_dist = float(min_dist)

        if best_dist > self.tolerance:
            return {"name": "Unknown", "distance": best_dist}
        return {"name": best_name, "distance": best_dist}

    def _save_database(self):
        with open(self.db_path, 'wb') as f:
            pickle.dump(self.database, f)

    def _load_database(self):
        if os.path.exists(self.db_path):
            with open(self.db_path, 'rb') as f:
                self.database = pickle.load(f)
`
                },
                {
                    lang: "python",
                    code: `import cv2
import time
from typing import Optional

class FaceRecognitionApp:
    """实时人脸识别应用"""
    def __init__(self, system: FaceRecognitionSystem):
        self.system = system
        self.frame_count = 0
        self.last_identify_time = 0
        self.identify_interval = 1.0  # 每秒识别一次
        self.cached_results = []

        # 颜色映射
        self.color_map = {
            "Unknown": (0, 0, 255),    # 红色
            "Admin": (0, 255, 0),       # 绿色
        }

    def _get_color(self, name: str) -> tuple:
        return self.color_map.get(name, (255, 255, 0))  # 黄色

    def process_frame(self, frame) -> np.ndarray:
        """处理视频帧"""
        output = frame.copy()
        self.frame_count += 1

        # 每隔一段时间做一次识别
        now = time.time()
        if now - self.last_identify_time >= self.identify_interval:
            self.last_identify_time = now

            # 缩小帧加速检测
            small = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

            face_locs = face_recognition.face_locations(rgb_small)
            face_encs = face_recognition.face_encodings(rgb_small, face_locs)

            self.cached_results = []
            for enc, loc in zip(face_encs, face_locs):
                result = self.system._find_best_match(enc)
                # 坐标还原到原始尺寸
                top, right, bottom, left = [v * 4 for v in loc]
                self.cached_results.append({
                    "name": result["name"],
                    "distance": result["distance"],
                    "bbox": (left, top, right, bottom)
                })

        # 绘制结果
        for r in self.cached_results:
            l, t, ri, b = r["bbox"]
            color = self._get_color(r["name"])
            cv2.rectangle(output, (l, t), (ri, b), color, 2)
            label = f"{r['name']} ({r['distance']:.2f})"
            cv2.putText(output, label, (l, t - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        # 显示统计信息
        fps_text = f"Frame: {self.frame_count} | Faces: {len(self.cached_results)}"
        cv2.putText(output, fps_text, (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        return output

# 运行示例
if __name__ == "__main__":
    system = FaceRecognitionSystem("face_db.pkl", tolerance=0.45)

    # 注册人员
    system.register_person("张三", ["photos/zhangsan_1.jpg", "photos/zhangsan_2.jpg"])
    system.register_person("李四", ["photos/lisi_1.jpg", "photos/lisi_2.jpg"])

    # 批量识别
    for img_file in os.listdir("test_photos/"):
        path = f"test_photos/{img_file}"
        results = system.identify(path)
        for r in results:
            print(f"  → {r['name']} (置信度: {r['confidence']:.2f})")

    # 实时视频
    app = FaceRecognitionApp(system)
    cap = cv2.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret: break
        output = app.process_frame(frame)
        cv2.imshow("Face Recognition", output)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    cap.release()
    cv2.destroyAllWindows()
`
                }
            ],
            table: {
                headers: ["组件", "face_recognition", "生产级方案"],
                rows: [
                    ["检测器", "dlib HOG / CNN MTCNN", "RetinaFace / SCRFD"],
                    ["特征维度", "128", "512（ArcFace）"],
                    ["相似度", "欧氏距离", "余弦相似度"],
                    ["识别规模", "< 1000 人（线性扫描）", "> 100 万人（FAISS/HNSW）"],
                    ["活体检测", "无", "必需（IR + 3D + 眨眼）"],
                    ["部署方式", "Python 进程内", "gRPC 微服务 + GPU 推理"],
                    ["适用场景", "原型验证、小规模", "安防、金融、考勤"]
                ]
            },
            mermaid: `graph TD
    A["系统启动
加载人脸库"] --> B["注册模式
录入新人照片"]
    B --> C["提取 128 维
特征向量"]
    C --> D["序列化存储
pickle / 向量数据库"]
    A --> E["识别模式
处理新图像"]
    E --> F["检测人脸
MTCNN/HOG"]
    F --> G["提取特征
ResNet-34"]
    G --> H["线性扫描
数据库比对"]
    H --> I["距离 < 阈值?
(0.45)"]
    I -->|是| J["返回身份
+ 置信度"]
    I -->|否| K["Unknown
陌生人"]
    E --> L["实时模式
视频流处理"]
    L --> M["降帧率
每 1 秒识别"]
    M --> F
    class K s2
    class J s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d
    classDef s2 fill:#7f1d1d`,
            tip: "生产环境中注册每人至少 3-5 张不同光线/角度的照片，系统会自动取多张特征的平均值，显著提高识别鲁棒性",
            warning: "face_recognition 的 tolerance=0.45 是默认值——降低到 0.35 可以减少误识（把陌生人认错），但会增加拒识率（认不出真人），需要根据场景权衡"
        }
    ],
};
