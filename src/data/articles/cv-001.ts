import { Article } from '../knowledge';

export const article: Article = {
    id: "cv-001",
    title: "目标检测：从 R-CNN 到 YOLO",
    category: "cv",
    tags: ["目标检测", "YOLO", "实时检测"],
    summary: "梳理两阶段与单阶段检测器的设计差异，对比 YOLO 系列各版本性能",
    date: "2026-04-05",
    readTime: "20 min",
    level: "进阶",
    content: [
      {
        title: "1. 目标检测概述",
        body: `目标检测（Object Detection）是计算机视觉的核心任务之一，与图像分类不同，它不仅要回答「图像中有什么」，还要回答「在哪里」。

核心定义： 给定输入图像 I ∈ R^(H×W×3)，输出 N 个检测结果，每个结果包含类别标签 c_i ∈ {1,...,C} 和边界框 B_i = (x_i, y_i, w_i, h_i)，其中 (x, y) 为中心坐标，(w, h) 为宽高。

边界框回归： 模型通常不直接预测绝对坐标，而是预测相对于预设锚框（Anchor）的偏移量 (Δx, Δy, Δw, Δh)。

IoU（交并比，Intersection over Union）： 衡量两个边界框重叠程度的核心指标：

IoU = |A ∩ B| / |A ∪ B|

其中 A 为预测框，B 为真实框（Ground Truth）。IoU ∈ [0, 1]，值越大表示重叠度越高。通常 IoU ≥ 0.5 被认为是正确检测（COCO 数据集还采用 mAP@[0.5:0.95] 的多阈值平均精度）。

mAP（Mean Average Precision）： 在多个 IoU 阈值下计算 AP（Precision-Rec曲线下面积）后取平均，是目标检测最常用的评价指标。`,
        code: [
          {
            lang: "python",
            code: `import torch

def compute_iou(box1: torch.Tensor, box2: torch.Tensor) -> float:
    """计算两个边界框的 IoU
    box格式: (x_center, y_center, w, h)
    """
    # 转换为 (x_min, y_min, x_max, y_max)
    b1_x1 = box1[0] - box1[2] / 2
    b1_y1 = box1[1] - box1[3] / 2
    b1_x2 = box1[0] + box1[2] / 2
    b1_y2 = box1[1] + box1[3] / 2

    b2_x1 = box2[0] - box2[2] / 2
    b2_y1 = box2[1] - box2[3] / 2
    b2_x2 = box2[0] + box2[2] / 2
    b2_y2 = box2[1] + box2[3] / 2

    # 交集
    inter_x1 = max(b1_x1, b2_x1)
    inter_y1 = max(b1_y1, b2_y1)
    inter_x2 = min(b1_x2, b2_x2)
    inter_y2 = min(b1_y2, b2_y2)
    inter_area = max(0, inter_x2 - inter_x1) * max(0, inter_y2 - inter_y1)

    # 并集
    area1 = (b1_x2 - b1_x1) * (b1_y2 - b1_y1)
    area2 = (b2_x2 - b2_x1) * (b2_y2 - b2_y1)
    union_area = area1 + area2 - inter_area

    return inter_area / union_area if union_area > 0 else 0.0`,
          },
        ],
        table: {
          headers: ["指标", "含义", "取值范围"],
          rows: [
            ["IoU", "预测框与真实框重叠度", "[0, 1]"],
            ["Precision", "检测为正例中真正例比例", "[0, 1]"],
            ["Recall", "真实正例中被检出比例", "[0, 1]"],
            ["mAP@0.5", "IoU阈值0.5时的平均精度", "[0, 1]"],
            ["mAP@0.5:0.95", "COCO标准,多阈值平均", "[0, 1]"],
          ],
        },
        mermaid: `graph TD
  A[输入图像] --> B[特征提取 Backbone]
  B --> C[候选区域生成]
  C --> D[边界框回归 + 分类]
  D --> E[NMS 去重]
  E --> F[输出检测结果]`,
        tip: "先理解 IoU 的几何含义，再去看各种变体（GIoU、DIoU、CIoU）就容易多了。",
        warning: "边界框坐标格式不统一！有的用 (x_min, y_min, x_max, y_max)，有的用 (x_center, y_center, w, h)，混用会导致 bug。",
      },
      {
        title: "2. 两阶段检测器：R-CNN 系列演进",
        body: `两阶段检测器（Two-Stage Detectors）将检测分为两步：区域提议（Region Proposal）→ 分类与回归。这条路线从 R-CNN 开始，经过 Fast R-CNN，最终到 Faster R-CNN。

R-CNN（2014）： 使用选择性搜索（Selective Search）生成约 2000 个候选区域，每个区域裁剪缩放到 227×227 后独立通过 CNN（AlexNet）提取 4096 维特征，最后用 SVM 分类、线性回归框修正。缺点：重复计算量极大，一张图要跑 2000 次 CNN。

Fast R-CNN（2015）： 核心改进是整张图只过一次 CNN 得到特征图，然后用 RoI Pooling 将不同大小的候选区域统一池化为固定尺寸（如 7×7），共享特征提取。训练改为多任务损失：

L(p, u, t, v) = L_cls(p, u) + λ[u ≥ 1] · L_loc(t, v)

其中 p 为类别概率，u 为真实类别，t 为预测偏移，v 为真实偏移，L_loc 为 Smooth L1 Loss。

Faster R-CNN（2015）： 进一步用 Region Proposal Network（RPN） 替代选择性搜索，RPN 在特征图上滑动窗口，为每个位置预测 k 个锚框的「前景/背景」得分和偏移量，实现端到端训练。RPN 与 Fast R-CNN 共享卷积特征，检测速度大幅提升。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torchvision

class FasterRCNNDemo(nn.Module):
    """Faster R-CNN 简化结构演示"""
    def __init__(self, num_classes: int = 80):
        super().__init__()
        # Backbone: ResNet-50 + FPN
        backbone = torchvision.models.resnet50(weights="IMAGENET1K_V1")
        backbone = nn.Sequential(*list(backbone.children())[:-2])

        self.backbone = backbone
        self.rpn = nn.Conv2d(2048, 512, kernel_size=3, padding=1)
        self.cls_head = nn.Sequential(
            nn.AdaptiveAvgPool2d((7, 7)),
            nn.Flatten(),
            nn.Linear(2048, 1024),
            nn.ReLU(),
            nn.Linear(1024, num_classes + 1),  # +1 for background
        )
        self.bbox_head = nn.Sequential(
            nn.AdaptiveAvgPool2d((7, 7)),
            nn.Flatten(),
            nn.Linear(2048, 1024),
            nn.ReLU(),
            nn.Linear(1024, num_classes * 4),  # 4 offsets per class
        )

    def forward(self, x):
        features = self.backbone(x)  # [B, 2048, H/32, W/32]
        rpn_scores = self.rpn(features)
        # ... RPN 生成 proposals → RoI Align → 分类/回归
        return rpn_scores`,
          },
        ],
        table: {
          headers: ["模型", "候选区域", "CNN 推理次数/图", "mAP (VOC)", "速度"],
          rows: [
            ["R-CNN", "Selective Search", "~2000", "66%", "~47s/图"],
            ["Fast R-CNN", "Selective Search", "1", "70%", "~3s/图"],
            ["Faster R-CNN", "RPN", "1", "73.2%", "~0.2s/图"],
          ],
        },
        mermaid: `graph LR
  A[R-CNN 2014] -->|共享特征提取| B[Fast R-CNN 2015]
  B -->|RPN 替代 Selective Search| C[Faster R-CNN 2015]
  C -->|特征金字塔| D[Mask R-CNN 2017]`,
        tip: "理解 RoI Pooling 和 RoI Align 的区别——前者量化取整导致不对齐，后者用双线性插值解决，这对实例分割（Mask R-CNN）至关重要。",
        warning: "两阶段检测器精度高但速度慢，不适合实时场景。RPN 的 anchor 数量和尺度需要针对数据集调参。",
      },
      {
        title: "3. 单阶段检测器 YOLO",
        body: `YOLO（You Only Look Once，2016）将目标检测重构为单一的回归问题，只需一次前向传播即可完成检测，速度远超两阶段方法。

核心思想： 将输入图像划分为 S×S 的网格（Grid Cell），每个网格负责预测 B 个边界框及其置信度和类别概率。

输出张量： S × S × (B × 5 + C)，其中 5 = (x, y, w, h, confidence)，C 为类别数。

损失函数（YOLOv1）：
L = λ_coord · Σ_i Σ_j 1^obj · [(x_i - x̂_i)² + (y_i - ŷ_i)²]
  + λ_coord · Σ_i Σ_j 1^obj · [(√w_i - √ŵ_i)² + (√h_i - √ĥ_i)²]
  + Σ_i Σ_j 1^obj · (C_i - Ĉ_i)²
  + λ_noobj · Σ_i Σ_j 1^noobj · (C_i - Ĉ_i)²
  + Σ_i 1^obj_i · Σ_c (p_i(c) - p̂_i(c))²

其中 1^obj 表示有目标经过该网格，√w 的平方根变换使小框和大框的误差权重更均衡，λ_noobj ≈ 0.5 用于缓解类别不平衡。

锚框（Anchor Boxes）： 从 YOLOv2 开始引入，通过 K-means 聚类在训练集的标注框上得到先验框尺寸，模型只需预测相对于 anchor 的偏移量，大大简化学习难度。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class YOLOv1Head(nn.Module):
    """YOLOv1 检测头简化实现"""
    def __init__(self, num_classes: int = 20, num_boxes: int = 2, grid_size: int = 7):
        super().__init__()
        self.num_classes = num_classes
        self.num_boxes = num_boxes
        self.grid_size = grid_size
        # 输出: S x S x (B*5 + C)
        output_dim = grid_size * grid_size * (num_boxes * 5 + num_classes)
        self.head = nn.Sequential(
            nn.AdaptiveAvgPool2d((grid_size, grid_size)),
            nn.Flatten(),
            nn.Linear(1024 * grid_size * grid_size, 4096),
            nn.LeakyReLU(0.1),
            nn.Linear(4096, output_dim),
        )

    def forward(self, x):
        """x: [B, 1024, H, W] 来自 backbone"""
        output = self.head(x)  # [B, S*S*(B*5+C)]
        output = output.view(
            -1, self.grid_size, self.grid_size,
            self.num_boxes * 5 + self.num_classes
        )
        return output

    def decode_predictions(self, output, conf_threshold=0.5):
        """解析输出张量为检测框"""
        batch_size, S, _, _ = output.shape
        box_dim = 5
        confidences = output[:, :, :, 4::box_dim]  # 提取置信度
        return confidences`,
          },
        ],
        table: {
          headers: ["参数", "YOLOv1", "YOLOv2", "YOLOv3"],
          rows: [
            ["网格大小", "7×7", "13×13", "13×13"],
            ["Anchor 数量", "无 (直接预测)", "5", "9 (3尺度×3)"],
            ["Backbone", "自定义 24层", "Darknet-19", "Darknet-53"],
            ["每格预测框", "2", "5", "3"],
            ["类别预测", "Softmax", "Sigmoid (多标签)", "Sigmoid"],
          ],
        },
        mermaid: `graph TD
  A[输入图像 448×448] --> B[S×S 网格划分]
  B --> C[每个网格预测 B 个框]
  C --> D[置信度过滤]
  D --> E[NMS 去重]
  E --> F[最终检测结果]`,
        tip: "YOLO 的网格设计天然适合中等和大目标，对小目标检测是弱点。后面版本的改进大多围绕这一点展开。",
        warning: "YOLOv1 使用 Softmax 做分类，不支持多标签检测（一个框多个类别），v3 改用独立 Sigmoid 解决了这个问题。",
      },
      {
        title: "4. YOLO 系列演进：v3 → v8",
        body: `YOLO 系列从 2016 年至今经历了多次迭代，每一代都在速度和精度之间寻找更优的平衡点。

YOLOv3（2018）： 引入 Darknet-53（残差结构）、FPN 特征金字塔（3 个尺度 13×13、26×26、52×52）、多尺度预测，每个尺度 3 个 anchor，总计 9 个先验框。首次在小目标检测上接近 SSD。

YOLOv4（2020）： BoF（Bag of Freebies）和 BoS（Bag of Specials）策略汇总。关键创新：Mosaic 数据增强、CmBN 跨小批归一化、SAT 自对抗训练、CIoU 损失函数（考虑重叠面积、中心点距离、长宽比一致性）。

YOLOv5（2020）： Ultralytics 实现，非 Darknet 官方版本。引入 Focus 结构（空间到通道变换）、自适应锚框计算、自动超参数优化，工程化程度极高。

YOLOv7（2022）： 提出 E-ELAN 高效聚合网络架构、模型缩放策略（复合缩放）、辅助头训练策略，在 5-160 FPS 范围内达到 SOTA。

YOLOv8（2023）： Anchor-Free 设计（直接预测中心点，不再依赖 anchor）、C2f 模块（增强梯度流）、解耦头（分类和回归分离）、支持检测/分割/姿态估计多任务。`,
        code: [
          {
            lang: "python",
            code: `# YOLOv8 Anchor-Free 检测头 vs YOLOv5 Anchor-Based
import torch
import torch.nn as nn

class YOLOv8_Detect(nn.Module):
    """YOLOv8 Anchor-Free 检测头"""
    def __init__(self, num_classes: int = 80, reg_max: int = 16):
        super().__init__()
        self.num_classes = num_classes
        self.reg_max = reg_max
        # 解耦头：分类和回归分开
        self.cls_convs = nn.Conv2d(256, 256, 3, padding=1)
        self.reg_convs = nn.Conv2d(256, 256, 3, padding=1)
        self.cls_pred = nn.Conv2d(256, num_classes, 1)
        self.reg_pred = nn.Conv2d(256, 4 * (reg_max + 1), 1)  # DFLLoss

    def forward(self, x):
        """x: 多尺度特征图列表 [P3, P4, P5]"""
        results = []
        for feat in x:
            cls_feat = self.cls_convs(feat)
            reg_feat = self.reg_convs(feat)
            cls_out = self.cls_pred(cls_feat)
            reg_out = self.reg_pred(reg_feat)
            results.append(torch.cat([reg_out, cls_out], dim=1))
        return results

# YOLOv5/v8 推理示例（使用 Ultralytics）
# from ultralytics import YOLO
# model = YOLO("yolov8n.pt")  # 加载预训练 Nano 模型
# results = model("image.jpg")  # 推理
# results[0].show()  # 可视化`,
          },
        ],
        table: {
          headers: ["版本", "Anchor", "Backbone", "损失函数", "特点"],
          rows: [
            ["YOLOv3", "Anchor-Based", "Darknet-53", "MSE + BCE", "FPN 多尺度"],
            ["YOLOv4", "Anchor-Based", "CSPDarknet-53", "CIoU + Focal", "Mosaic 增强"],
            ["YOLOv5", "Anchor-Based", "CSP + Focus", "CIoU + BCE", "工程化最佳"],
            ["YOLOv7", "Anchor-Based", "E-ELAN", "CIoU + DFLLoss", "复合缩放"],
            ["YOLOv8", "Anchor-Free", "CSPNet + C2f", "DFL + BCE", "多任务统一"],
          ],
        },
        mermaid: `graph TD
  A[YOLOv3 2018] -->|Mosaic/CmBN/CIoU| B[YOLOv4 2020]
  B -->|工程化改进| C[YOLOv5 2020]
  C -->|E-ELAN/复合缩放| D[YOLOv7 2022]
  D -->|Anchor-Free/C2f| E[YOLOv8 2023]`,
        tip: "初学者建议从 YOLOv8 入门，Ultralytics 框架 API 设计最友好，文档也最全。生产环境可根据延迟要求选择 Nano/Small/Medium 不同规模。",
        warning: "YOLOv5/v7/v8 并非 Darknet 官方发布！YOLOv5 由 Ultralytics 实现，YOLOv7 由 Wang 团队实现，YOLOv8 由 Ultralytics 实现。官方 YOLO 只到 v4。",
      },
      {
        title: "5. SSD 单阶段多尺度检测器",
        body: `SSD（Single Shot MultiBox Detector，2016）是另一个经典的单阶段检测器，核心思想是在多层特征图上做检测，天然具备多尺度检测能力。

多尺度特征图： SSD 不依赖 FPN，而是直接在 backbone 的不同阶段提取不同分辨率的特征图：
- 浅层特征图（38×38）：感受野小，适合检测小目标
- 中层特征图（19×19）：中等尺度目标
- 深层特征图（10×10、5×5、3×3、1×1）：感受野大，适合检测大目标

默认框（Default Boxes）： 每个特征图位置预设多个不同尺度和宽高比的框（类似 anchor）。对于 m×n 的特征图，每个位置设置 k 个默认框，每个框预测 4 个偏移量 + c 个类别得分，输出维度为 m × n × (4k + ck)。

匹配策略： 每个真实框与 IoU > 0.5 的默认框匹配为正样本，同时每个真实框还与 IoU 最大的默认框匹配（确保至少一个正样本）。其余为负样本。正负样本比例约为 1:3（通过难例挖掘 Hard Negative Mining 控制）。

损失函数：
L(x, c, l, g) = [L_conf(x, c) + α · L_loc(x, l, g)] / N

其中 L_conf 为交叉熵损失，L_loc 为 Smooth L1 损失，α 默认取 1。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import math

class SSD300(nn.Module):
    """SSD300 简化实现 - 多尺度检测"""
    def __init__(self, num_classes: int = 21):
        super().__init__()
        self.num_classes = num_classes

        # Backbone: VGG-16 前30层
        self.base = nn.Sequential(
            *list(torchvision.models.vgg16(weights="IMAGENET1K_V1")
                  .features.children())[:30]
        )

        # 额外卷积层 (逐渐缩小特征图)
        self.extra = nn.ModuleList([
            nn.Conv2d(512, 256, 1),
            nn.Conv2d(256, 512, 3, stride=2, padding=1),
            nn.Conv2d(512, 128, 1),
            nn.Conv2d(128, 256, 3, stride=2, padding=1),
        ])

        # 不同尺度特征图上的检测头
        # 38x38: 4 boxes/pixel, 19x19: 6 boxes/pixel, etc.
        self.loc = nn.ModuleList([
            nn.Conv2d(512, 4 * 4, 3, padding=1),   # 38x38
            nn.Conv2d(1024, 6 * 4, 3, padding=1),  # 19x19
            nn.Conv2d(512, 6 * 4, 3, padding=1),   # 10x10
            nn.Conv2d(256, 6 * 4, 3, padding=1),   # 5x5
            nn.Conv2d(256, 4 * 4, 3, padding=1),   # 3x3
            nn.Conv2d(256, 4 * 4, 3, padding=1),   # 1x1
        ])
        self.conf = nn.ModuleList([
            nn.Conv2d(512, num_classes * 4, 3, padding=1),
            nn.Conv2d(1024, num_classes * 6, 3, padding=1),
            nn.Conv2d(512, num_classes * 6, 3, padding=1),
            nn.Conv2d(256, num_classes * 6, 3, padding=1),
            nn.Conv2d(256, num_classes * 4, 3, padding=1),
            nn.Conv2d(256, num_classes * 4, 3, padding=1),
        ])

    def forward(self, x):
        # 多尺度特征提取 + 检测
        loc_preds, conf_preds = [], []
        # ... 前向传播
        return loc_preds, conf_preds`,
          },
        ],
        table: {
          headers: ["特征图尺寸", "默认框数量/位置", "适合目标大小", "感受野"],
          rows: [
            ["38×38", "4", "小目标 (<30px)", "小"],
            ["19×19", "6", "中小目标", "中"],
            ["10×10", "6", "中等目标", "中大"],
            ["5×5", "6", "中大目标", "大"],
            ["3×3", "4", "大目标", "很大"],
            ["1×1", "4", "超大目标", "最大"],
          ],
        },
        mermaid: `graph TD
  A[输入 300×300] --> B[VGG-16 Base]
  B --> C[38×38 → 检测头]
  B --> D[19×19 → 检测头]
  D --> E[10×10 → 检测头]
  E --> F[5×5 → 检测头]
  F --> G[3×3 → 检测头]
  G --> H[1×1 → 检测头]
  C --> I[Concat 所有预测]
  D --> I
  E --> I
  F --> I
  G --> I
  H --> I
  I --> J[NMS → 输出]`,
        tip: "SSD 的多尺度设计思想被后续很多检测器借鉴。理解为什么浅层适合小目标、深层适合大目标，关键在于感受野与特征抽象层级的关系。",
        warning: "SSD 对极小目标（<16px）效果较差，因为最浅的特征图（38×38）经过多次下采样后已经丢失了细粒度信息。",
      },
      {
        title: "6. NMS 非极大值抑制",
        body: `NMS（Non-Maximum Suppression）是目标检测后处理的核心步骤，用于去除对同一目标的重复检测。

标准 NMS 算法：
1. 将所有检测框按置信度降序排序
2. 选择置信度最高的框加入最终结果
3. 计算该框与剩余所有框的 IoU
4. 若 IoU > 阈值（通常 0.5），则抑制（删除）该框
5. 重复步骤 2-4，直到所有框处理完毕

Soft-NMS（2017）： 标准 NMS 的问题是当两个真实目标靠得很近时，会将其中一个错误抑制。Soft-NMS 改为降低相邻框的置信度，而非直接删除：

- 线性衰减：s_i = s_i · (1 - IoU(M, b_i))  if IoU ≥ N_t, else s_i
- 高斯衰减：s_i = s_i · exp(-IoU(M, b_i)² / σ)

其中 M 为当前最高分框，b_i 为待处理框，σ 控制衰减速率。

DIoU-NMS（2020）： 在 NMS 中使用 DIoU（Distance-IoU）替代 IoU：

DIoU = IoU - ρ²(b, b^gt) / c²

其中 ρ 为两个框中心点的欧氏距离，c 为最小外接矩形的对角线距离。DIoU-NMS 对重叠框的位置差异更敏感，能更好地区分相邻的密集目标。`,
        code: [
          {
            lang: "python",
            code: `import torch

def nms(boxes: torch.Tensor, scores: torch.Tensor, iou_threshold: float = 0.5):
    """标准 NMS 实现
    boxes: [N, 4] (x_min, y_min, x_max, y_max)
    scores: [N]
    返回: 保留框的索引
    """
    areas = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
    _, order = scores.sort(descending=True)
    keep = []

    while order.numel() > 0:
        i = order[0].item()
        keep.append(i)

        if order.numel() == 1:
            break

        # 计算 IoU
        xx1 = boxes[order[1:], 0].clamp(min=boxes[i, 0])
        yy1 = boxes[order[1:], 1].clamp(min=boxes[i, 1])
        xx2 = boxes[order[1:], 2].clamp(max=boxes[i, 2])
        yy2 = boxes[order[1:], 3].clamp(max=boxes[i, 3])

        inter = (xx2 - xx1).clamp(min=0) * (yy2 - yy1).clamp(min=0)
        union = areas[i] + areas[order[1:]] - inter
        iou = inter / union

        # 保留 IoU < 阈值的框
        ids = (iou < iou_threshold).nonzero(as_tuple=False).squeeze()
        if ids.numel() == 0:
            break
        order = order[ids + 1]

    return torch.tensor(keep, dtype=torch.long)

def soft_nms(boxes, scores, sigma=0.5, Nt=0.3, threshold=0.001):
    """Soft-NMS 高斯衰减版本"""
    N = scores.shape[0]
    for i in range(N):
        max_idx = i + scores[i:].argmax()
        scores[[i, max_idx]] = scores[[max_idx, i]]
        boxes[[i, max_idx]] = boxes[[max_idx, i]]

        for j in range(i + 1, N):
            iou = compute_iou(boxes[i], boxes[j])
            weight = torch.exp(-(iou * iou) / sigma)
            scores[j] *= weight

    return boxes[scores > threshold], scores[scores > threshold]`,
          },
        ],
        table: {
          headers: ["NMS 变体", "衰减方式", "处理密集目标", "速度"],
          rows: [
            ["标准 NMS", "二值删除 (IoU > 阈值直接删除)", "差", "快"],
            ["Soft-NMS (线性)", "线性衰减 (1 - IoU)", "中", "稍慢"],
            ["Soft-NMS (高斯)", "高斯衰减 exp(-IoU²/σ)", "好", "稍慢"],
            ["DIoU-NMS", "DIoU = IoU - 距离惩罚", "好", "快"],
            ["Learned NMS", "网络学习抑制策略", "最优", "慢"],
          ],
        },
        mermaid: `graph TD
  A[多个检测框] --> B[按置信度排序]
  B --> C{最高分框}
  C -->|加入结果| D[计算与剩余框的 IoU]
  D --> E{IoU > 阈值?}
  E -->|是| F[抑制/降权]
  E -->|否| G[保留]
  F --> H{还有框?}
  G --> H
  H -->|是| C
  H -->|否| I[输出最终结果]`,
        tip: "实际项目中直接用 torchvision.ops.nms() 即可，C++ 实现比 Python 快一个数量级。理解算法原理即可，不需要手写。",
        warning: "NMS 阈值设置很关键：太高会漏检（密集目标被抑制），太低会重复检测。Soft-NMS 和 DIoU-NMS 在行人检测、车辆检测等密集场景下效果更好。",
      },
      {
        title: "7. 代码实战：PyTorch + YOLO 目标检测项目",
        body: `本节从零开始，使用 PyTorch + OpenCV 实现一个完整的 YOLO 目标检测推理管线，涵盖模型加载、图像预处理、推理、后处理到可视化全流程。

项目结构：
1. 加载预训练 YOLO 模型（这里以 YOLOv5 的 PyTorch Hub 模型为例）
2. 图像预处理：Letterbox 缩放 + 归一化
3. 模型推理：获取原始预测
4. 后处理：置信度过滤 + NMS
5. 可视化：绘制边界框和类别标签

Letterbox 预处理： 保持图像宽高比进行缩放，短边缩放到目标尺寸，长边按比例缩放后用灰色填充（padding）。这种方式不会导致目标变形，是 YOLO 系列的标准预处理方式。

非极大值抑制（NMS）： 使用 torchvision.ops.nms 高效实现，按类别分别进行 NMS。`,
        code: [
          {
            lang: "python",
            code: `import cv2
import torch
import numpy as np
from pathlib import Path

class YOLODetector:
    """基于 PyTorch + YOLO 的目标检测器"""

    def __init__(self, model_name="yolov5s", conf_thres=0.25, iou_thres=0.45):
        self.model = torch.hub.load(
            "ultralytics/yolov5", model_name, pretrained=True
        )
        self.model.eval()
        self.classes = self.model.names
        self.conf_thres = conf_thres
        self.iou_thres = iou_thres

    def detect(self, image_path):
        """对单张图像进行目标检测"""
        # 推理
        results = self.model(image_path)
        # 解析结果 (xyxy, conf, cls)
        detections = results.pred[0]
        boxes = detections[:, :4]
        confidences = detections[:, 4]
        class_ids = detections[:, 5].int()

        return boxes, confidences, class_ids

    def visualize(self, image, boxes, confidences, class_ids):
        """可视化检测结果"""
        colors = np.random.randint(0, 255, size=(len(self.classes), 3))

        for box, conf, cls_id in zip(boxes, confidences, class_ids):
            x1, y1, x2, y2 = map(int, box)
            color = colors[cls_id].tolist()
            label = f"{self.classes[cls_id]} {conf:.2f}"

            # 绘制边界框
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
            # 绘制标签背景
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(image, (x1, y1 - 20), (x1 + tw, y1), color, -1)
            # 绘制标签文字
            cv2.putText(image, label, (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        return image


# ========== 使用示例 ==========
if __name__ == "__main__":
    detector = YOLODetector(model_name="yolov5s", conf_thres=0.3, iou_thres=0.45)

    # 读取图像
    img = cv2.imread("test.jpg")
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # 保存临时文件供模型读取
    cv2.imwrite("temp_input.jpg", img_rgb)

    # 检测
    boxes, confs, cls_ids = detector.detect("temp_input.jpg")

    print(f"检测到 {len(boxes)} 个目标")
    for box, conf, cls_id in zip(boxes, confs, cls_ids):
        print(f"  {detector.classes[cls_id]}: {conf:.3f} at {box.tolist()}")

    # 可视化
    result_img = detector.visualize(img, boxes, confs, cls_ids)
    cv2.imwrite("output.jpg", result_img)
    print("检测结果已保存到 output.jpg")`,
          },
          {
            lang: "python",
            code: `# ========== 进阶：自定义训练 ==========
# 使用 Ultralytics YOLOv8 训练自定义数据集
from ultralytics import YOLO

# 1. 加载预训练模型 (迁移学习)
model = YOLO("yolov8n.pt")  # nano 模型

# 2. 准备数据集 (data.yaml)
# data.yaml 格式:
# path: /path/to/dataset
# train: images/train
# val: images/val
# nc: 3  # 类别数
# names: ['cat', 'dog', 'bird']

# 3. 开始训练
results = model.train(
    data="custom_data.yaml",
    epochs=100,
    imgsz=640,
    batch=16,
    device=0,        # GPU 0
    patience=20,     # 早停
    augment=True,    # 数据增强
    mosaic=0.5,      # Mosaic 增强概率
)

# 4. 验证
metrics = model.val()
print(f"mAP50: {metrics.box.map50:.4f}")
print(f"mAP50-95: {metrics.box.map:.4f}")

# 5. 导出为 ONNX (部署)
model.export(format="onnx", imgsz=640)
print("模型已导出为 yolov8n.onnx")`,
          },
        ],
        table: {
          headers: ["模型规模", "参数量", "mAP@0.5", "FPS (GPU)", "适用场景"],
          rows: [
            ["Nano (n)", "3.2M", "37.3%", "~200", "嵌入式/移动端"],
            ["Small (s)", "11.2M", "44.9%", "~140", "边缘设备"],
            ["Medium (m)", "25.9M", "50.2%", "~80", "通用服务器"],
            ["Large (l)", "43.7M", "52.9%", "~50", "高精度服务器"],
            ["XLarge (x)", "68.2M", "53.9%", "~30", "离线高精度"],
          ],
        },
        mermaid: `graph TD
  A[原始图像] --> B[Letterbox 缩放 640×640]
  B --> C[归一化 /255.0]
  C --> D[YOLO 模型推理]
  D --> E[置信度过滤 conf > 0.25]
  E --> F[NMS IoU < 0.45]
  F --> G[绘制边界框]
  G --> H[输出可视化图像]`,
        tip: "实际项目中推荐使用 Ultralytics 的 YOLOv8 CLI：yolo detect train data=xxx.yaml model=yolov8n.pt epochs=100，比写代码简单得多。但理解底层原理对调参至关重要。",
        warning: "训练时注意：1) 数据集标注质量直接影响效果 2) 类别不平衡问题需用 class weights 或过采样 3) 小目标检测需要更大的输入尺寸 (1280+) 4) 导出 ONNX 后务必验证精度损失",
      },
    ],
  };
