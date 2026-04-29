import { Article } from '../knowledge';

export const article: Article = {
    id: "cv-007",
    title: "OCR 文字识别：CRNN, PaddleOCR",
    category: "cv",
    tags: ["OCR", "文字识别", "CRNN"],
    summary: "从传统 OCR 到深度学习，掌握文字识别的完整技术栈",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. OCR 任务定义与应用场景",
            body: `OCR（Optical Character Recognition，光学字符识别）是将图像中的文字转换为机器可读文本的技术。现代 OCR 已经远超传统的「字符模板匹配」范畴，演变为一个包含文字检测（Text Detection）和文字识别（Text Recognition）两大子任务的完整 Pipeline。文字检测负责在图像中定位所有文字区域，输出边界框或多边形；文字识别则将裁剪出的文字区域转换为字符串序列。OCR 的应用场景极其广泛：文档数字化（扫描 PDF 转 Word）、票据识别（发票、收据、车牌）、证件提取（身份证、护照、银行卡）、工业质检（标签文字校验）、医疗报告解析等。与传统分类任务不同，OCR 的核心挑战在于：文字可以出现在任意位置、任意方向、任意尺度，且字体、颜色、背景千变万化——这决定了 OCR 必须同时解决「在哪里」和「是什么」两个问题。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class OCRResult:
    """OCR 单条识别结果"""
    bbox: List[Tuple[int, int]]  # 四边形顶点 [(x1,y1), (x2,y2), (x3,y3), (x4,y4)]
    text: str                     # 识别出的文本
    confidence: float             # 识别置信度 [0, 1]

@dataclass
class OCRPageResult:
    """整页 OCR 结果"""
    image_width: int
    image_height: int
    results: List[OCRResult]

    def get_sorted_text(self, reading_order: str = "ltr-ttb") -> str:
        """按阅读顺序拼接文本"""
        if reading_order == "ltr-ttb":
            sorted_results = sorted(
                self.results,
                key=lambda r: (min(p[1] for p in r.bbox), min(p[0] for p in r.bbox))
            )
        return "\\n".join(r.text for r in sorted_results)

    @property
    def jsonl(self) -> str:
        import json
        return "\\n".join(json.dumps({
            "bbox": r.bbox, "text": r.text, "confidence": r.confidence
        }, ensure_ascii=False) for r in self.results)`
                },
                {
                    lang: "python",
                    code: `# OCR 技术演进时间线
ocr_evolution = {
    "1990s": "模板匹配 + 特征工程（Tesseract 1.x）",
    "2000s": "统计学习 + SVM/CRF（Tesseract 3.x）",
    "2015": "CNN 文字识别（CRNN 提出）",
    "2017": "两阶段检测识别（CTPN + CRNN）",
    "2018": "端到端检测（EAST, MaskTextSpotter）",
    "2019": "DB 可微二值化检测器",
    "2020": "PaddleOCR 开源（工业级 OCR 系统）",
    "2021": "ABINet 语言模型增强识别",
    "2022": "PARSENet 多模态文档理解",
    "2023": "多模态大模型（LayoutLMv3, DocLLM）",
}

print("=== OCR 技术演进 ===")
for year, desc in ocr_evolution.items():
    print(f"  {year}: {desc}")
# 从模板匹配到大模型，OCR 经历了 30 年技术迭代
# 核心转变：手工特征 → 深度学习 → 多模态理解`
                }
            ],
            table: {
                headers: ["OCR 类型", "输入", "输出", "典型场景"],
                rows: [
                    ["印刷体 OCR", "清晰扫描文档", "结构化文本", "文档数字化、电子书"],
                    ["场景文字 OCR", "自然场景照片", "文本 + 位置", "街景翻译、车牌识别"],
                    ["手写体 OCR", "手写笔记/信件", "文本", "批改作业、医疗处方"],
                    ["表格 OCR", "表格图片/PDF", "结构化表格数据", "财务报表解析"],
                    ["票据 OCR", "发票/收据照片", "键值对数据", "财务报销、税务审核"],
                    ["文档理解", "复杂版面文档", "文本 + 版面结构", "合同解析、论文提取"]
                ]
            },
            mermaid: `graph LR
    A["输入图像"] --> B["文字检测
定位文字区域"]
    B --> C["文字裁剪
提取 ROI"]
    C --> D["文字识别
图像 → 文本"]
    D --> E["后处理
纠错/格式化"]
    E --> F["结构化输出"]
    class F s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "入门 OCR 建议先用 PaddleOCR 的预训练模型跑通一个完整 Pipeline，理解检测和识别两个阶段的输出格式后再深入研究算法细节",
            warning: "不要把 OCR 简单等同于「图片转文字」——真实场景中光照不均、透视变形、文字粘连、多语言混合等问题远比想象中复杂"
        },
        {
            title: "2. 传统 OCR：Tesseract 引擎剖析",
            body: `Tesseract 是最著名的开源 OCR 引擎，由 HP 实验室于 1985 年开发，1995 年开源，2006 年由 Google 接手维护。Tesseract 3.x 版本采用基于传统图像处理的方法：首先对输入图像进行预处理（二值化、去噪、倾斜校正），然后进行连通域分析找出候选字符区域，接着对每个字符提取方向梯度直方图（HOG）、轮廓等手工特征，最后使用自适应识别器（结合神经网络和字典语言模型）进行字符分类。Tesseract 的核心局限在于：它对图像质量要求极高——文字需要基本水平、背景相对干净、字体清晰，一旦遇到场景文字（自然照片中的文字）、复杂背景或严重倾斜，准确率急剧下降。Tesseract 4.0 引入了 LSTM 神经网络识别引擎，识别精度大幅提升，但检测模块仍然依赖传统的连通域分析，在复杂场景下检测效果不佳。尽管如此，Tesseract 在扫描文档、清晰印刷体等「简单」场景下仍然是可靠且高效的选择。`,
            code: [
                {
                    lang: "python",
                    code: `import cv2
import pytesseract
import numpy as np

# 基本使用
img = cv2.imread("document.png")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 预处理：二值化 + 去噪
_, binary = cv2.threshold(gray, 0, 255,
    cv2.THRESH_BINARY + cv2.THRESH_OTSU)
denoised = cv2.fastNlMeansDenoising(binary, h=10)

# 倾斜校正
coords = np.column_stack(np.where(denoised > 0))
angle = cv2.minAreaRect(coords)[-1]
if angle < -45:
    angle = -(90 + angle)
else:
    angle = -angle

(h, w) = denoised.shape[:2]
center = (w // 2, h // 2)
M = cv2.getRotationMatrix2D(center, angle, 1.0)
rotated = cv2.warpAffine(denoised, M, (w, h),
    flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

# Tesseract 识别
config = "--oem 3 --psm 6 -l chi_sim+eng"
text = pytesseract.image_to_string(rotated, config=config)
print(text)`
                },
                {
                    lang: "python",
                    code: `# Tesseract Page Segmentation Mode (PSM) 详解
psm_modes = {
    0: "OSD 仅（方向+脚本检测）",
    1: "自动 OSD",
    2: "自动页面分割 + OSD",
    3: "全自动页面分割（默认）",
    4: "假设单列可变大小文本",
    5: "假设单一均匀垂直列文本",
    6: "假设统一文本块",
    7: "单行文本",
    8: "单词",
    9: "圆中的单个词",
    10: "单个字符",
    11: "稀疏文本",
    12: "稀疏文本 + OSD",
    13: "原始行（跳过 hack）",
}

# OCR Engine Mode (OEM)
oem_modes = {
    0: "仅传统引擎（LSTM 关闭）",
    1: "仅神经网络 LSTM 引擎",
    2: "传统 + LSTM 组合",
    3: "默认（基于可用内容自动选择）",
}

# 获取详细输出：字级别位置和置信度
data = pytesseract.image_to_data(
    rotated, config="--oem 3 --psm 6 -l chi_sim+eng",
    output_type=pytesseract.Output.DICT
)
# data 包含: level, page_num, block_num, par_num,
#           line_num, word_num, left, top, width, height,
#           conf, text
for i, conf in enumerate(data["conf"]):
    if int(conf) > 0:
        print(f"  [{conf}%] {data['text'][i]} "
              f"at ({data['left'][i]},{data['top'][i]})")`
                }
            ],
            table: {
                headers: ["Tesseract 版本", "识别引擎", "检测方法", "适用场景"],
                rows: [
                    ["3.x (2006-2017)", "自适应字符分类器", "连通域分析", "清晰印刷文档"],
                    ["4.0 (2018)", "LSTM 神经网络", "连通域分析", "印刷文档 + 简单场景"],
                    ["4.1+ (2019)", "LSTM + 语言模型", "连通域分析", "多语言文档"],
                    ["5.x (2021+)", "LSTM 改进版", "连通域分析", "多语言 + 数学公式"]
                ]
            },
            mermaid: `graph TD
    A["输入图像"] --> B["预处理
二值化/去噪/倾斜校正"]
    B --> C["连通域分析
找出文字区域"]
    C --> D["字符分割
单个字符切分"]
    D --> E["特征提取
HOG / 轮廓"]
    E --> F["LSTM 识别
字符分类"]
    F --> G["语言模型
字典校正"]
    G --> H["输出文本"]
    class D s3
    class C s2
    class H s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12
    classDef s3 fill:#7c2d12`,
            tip: "对于扫描文档，Tesseract 的 PSM 6（统一文本块）和 PSM 3（全自动）通常效果最好；如果是单行文字（如车牌），用 PSM 7",
            warning: "Tesseract 在中文场景下的训练数据（chi_sim）质量一般，如果识别率低，可以考虑用 LSTM 模式（--oem 1）配合自定义训练数据"
        },
        {
            title: "3. 文字检测：CTPN, EAST, DBNet",
            body: `文字检测是 OCR 的第一步，也是决定上限的关键环节。CTPN（Connectionist Text Proposal Network，2016）将文字行切分为固定宽度的 anchor（类似 Faster R-CNN），用双向 LSTM 建模 anchor 之间的连接关系，最终将相邻 anchor 组合成文字行。CTPN 擅长检测水平排列的文字行，但对弯曲文字、倾斜文字无能为力。EAST（Efficient and Accurate Scene Text Detector，2017）采用全卷积网络直接预测像素级的文字分数图和几何参数（四边形或旋转框），无需 anchor 和后处理 NMS，速度极快（13 FPS @ 720p）。DBNet（Differentiable Binarization Network，2020）提出了可微二值化思想：将传统二值化操作（阈值分割）变为可微模块嵌入网络中，在训练时联合优化分割图和阈值图，实现端到端的文字区域提取。DBNet 在 CTW1500 和 Total-Text 等弯曲文字数据集上取得了 SOTA 结果，同时保持了实时推理速度。`,
            code: [
                {
                    lang: "python",
                    code: `# EAST 文字检测实现
import cv2
import numpy as np

class EASTDetector:
    """EAST 场景文字检测器"""
    def __init__(self, model_path, conf_threshold=0.5, nms_threshold=0.2):
        self.net = cv2.dnn.readNet(model_path)
        self.conf_threshold = conf_threshold
        self.nms_threshold = nms_threshold

    def detect(self, image):
        """检测文字区域，返回旋转框列表"""
        orig_h, orig_w = image.shape[:2]
        # EAST 要求输入尺寸为 32 的倍数
        new_w = (orig_w // 32) * 32
        new_h = (orig_h // 32) * 32
        ratio_w = orig_w / new_w
        ratio_h = orig_h / new_h

        blob = cv2.dnn.blobFromImage(image, 1.0, (new_w, new_h),
            (123.68, 116.78, 103.94), swapRB=True, crop=False)
        self.net.setInput(blob)

        # EAST 输出两层: 分数图 + 几何图
        (scores, geometry) = self.net.forward([
            "feature_fusion/Conv_7/Sigmoid",
            "feature_fusion/concat_3"
        ])

        return self._decode_predictions(scores, geometry, ratio_w, ratio_h)

    def _decode_predictions(self, scores, geometry, ratio_w, ratio_h):
        """解码 EAST 输出为旋转矩形框"""
        boxes, confidences = [], []
        num_rows, num_cols = scores.shape[2:4]

        for y in range(num_rows):
            scores_data = scores[0, 0, y]
            geo_data = geometry[0, :, y]

            for x in range(num_cols):
                if scores_data[x] < self.conf_threshold:
                    continue

                # 解码旋转框参数
                offset_x = x * 4.0
                offset_y = y * 4.0
                angle = geo_data[4, x]
                h = geo_data[1, x] + geo_data[3, x]
                w = geo_data[2, x] + geo_data[0, x]

                center_x = offset_x + geo_data[0, x]
                center_y = offset_y + geo_data[1, x]

                boxes.append({
                    "center_x": center_x * ratio_w,
                    "center_y": center_y * ratio_h,
                    "w": w * ratio_w,
                    "h": h * ratio_h,
                    "angle": angle,
                    "conf": scores_data[x]
                })

        # NMS 去重
        indices = cv2.dnn.NMSBoxesRotated(
            boxes, [b["conf"] for b in boxes],
            self.conf_threshold, self.nms_threshold
        )
        return [boxes[i] for i in indices]`
                },
                {
                    lang: "python",
                    code: `# DBNet 可微二值化核心实现
import torch
import torch.nn as nn
import torch.nn.functional as F

class DifferentiableBinarization(nn.Module):
    """DBNet 可微二值化模块"""
    def __init__(self, k=50):
        super().__init__()
        self.k = k  # 锐化系数，越大二值化越锐利

    def forward(self, prob_map, thresh_map):
        """
        prob_map: 概率图 [B, 1, H, W]
        thresh_map: 阈值图 [B, 1, H, W]
        返回: 近似二值图 [B, 1, H, W]
        """
        # 可微近似: B_hat = 1 / (1 + exp(-k * (P - T)))
        # 当 k→∞ 时趋近于硬二值化 step(P - T)
        binary = self._step_function(prob_map, thresh_map, self.k)
        return binary

    @staticmethod
    def _step_function(x, thresh, k=50):
        """sigmoid 近似 step 函数"""
        return torch.sigmoid(k * (x - thresh))

class DBNet(nn.Module):
    """DBNet 简化版"""
    def __init__(self, backbone="resnet50"):
        super().__init__()
        # 特征提取 backbone
        self.backbone = self._build_backbone(backbone)
        # 特征金字塔 FPN
        self.fpn = self._build_fpn()
        # 两个头: 概率图 + 阈值图
        self.prob_head = nn.Conv2d(64, 1, 3, padding=1)
        self.thresh_head = nn.Sequential(
            nn.Conv2d(64, 64 // 4, 3, padding=1),
            nn.BatchNorm2d(64 // 4),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(64 // 4, 64 // 4, 2, 2),
            nn.BatchNorm2d(64 // 4),
            nn.ReLU(inplace=True),
            nn.Conv2d(64 // 4, 1, 3, padding=1),
            nn.Sigmoid()
        )
        self.binarize = DifferentiableBinarization(k=50)

    def forward(self, x):
        features = self.backbone(x)
        features = self.fpn(features)
        prob_map = torch.sigmoid(self.prob_head(features))
        thresh_map = self.thresh_head(features)
        binary_map = self.binarize(prob_map, thresh_map)
        return prob_map, thresh_map, binary_map`
                }
            ],
            table: {
                headers: ["检测算法", "年份", "核心思想", "输出格式", "速度", "弯曲文字"],
                rows: [
                    ["CTPN", "2016", "Anchor + Bi-LSTM 序列建模", "水平文本行", "中等", "不支持"],
                    ["EAST", "2017", "全卷积直接预测 + 无 NMS", "旋转四边形", "快 (13 FPS)", "有限支持"],
                    ["Mask TextSpotter", "2018", "实例分割 + RoI Align", "多边形 mask", "慢", "支持"],
                    ["DBNet", "2020", "可微二值化嵌入网络", "分割图", "快 (62 FPS)", "优秀支持"],
                    ["DBNet++", "2022", "多尺度特征 + 序列后处理", "分割图", "快", "优秀支持"]
                ]
            },
            mermaid: `graph TD
    A["输入图像"] --> B["Backbone 特征提取
ResNet / MobileNet"]
    B --> C["FPN 特征金字塔
多尺度融合"]
    C --> D["检测头分支"]
    D --> E["CTPN: Anchor 分类
+ 边界回归 + LSTM"]
    D --> F["EAST: 像素分数图
+ 旋转框几何参数"]
    D --> G["DBNet: 概率图
+ 阈值图 + 二值化"]
    E --> H["文本行 Proposal
→ 文本行组合"]
    F --> I["旋转矩形框
→ NMS 过滤"]
    G --> J["近似二值图
→ 轮廓提取"]
    H --> K["文字区域"]
    I --> K
    J --> K
    class K s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "如果只处理水平文字（如文档扫描），CTPN 精度足够且实现简单；如果需要处理自然场景中的多方向文字，DBNet 是当前最优选择",
            warning: "EAST 虽然速度快，但对小文字（高度 < 10 像素）检测效果差，因为 4 倍下采样会丢失小文字信息"
        },
        {
            title: "4. 文字识别：CRNN + CTC 详解",
            body: `CRNN（Convolutional Recurrent Neural Network，2016）是深度学习文字识别的里程碑工作，它巧妙地将 CNN、RNN 和 CTC（Connectionist Temporal Classification）三种技术融合在一起，解决了不定长序列识别问题。CRNN 的整体架构分为三步：CNN 特征提取——用 ResNet 或 VGG 风格的卷积网络从输入文字图像中提取特征图，得到序列化的特征向量；RNN 序列建模——用双向 LSTM 对特征序列进行上下文建模，每个时间步的输出包含该位置的前向和后向上下文信息；CTC 解码——CTC 损失函数允许输入序列和输出序列长度不一致，通过引入「空白」标记（blank）和动态规划对齐，实现端到端的不定长文本识别。CTC 的核心优势在于不需要字符级别的标注——只需要图像和对应的文本标签，对齐过程由算法自动完成。这使得训练数据的标注成本大幅降低。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class CRNN(nn.Module):
    """CRNN: CNN + BiLSTM + CTC"""
    def __init__(self, img_h=32, nclass=3952, nh=256, n_rnn=2):
        super().__init__()
        # CNN 特征提取 (类似 VGG)
        self.cnn = nn.Sequential(
            # conv1: [B, 1, 32, W] -> [B, 64, 16, W/2]
            nn.Conv2d(1, 64, 3, 1, 1), nn.ReLU(True),
            nn.MaxPool2d(2, 2),
            # conv2: [B, 64, 16, W/2] -> [B, 128, 8, W/4]
            nn.Conv2d(64, 128, 3, 1, 1), nn.ReLU(True),
            nn.MaxPool2d(2, 2),
            # conv3: [B, 128, 8, W/4] -> [B, 256, 4, W/8]
            nn.Conv2d(128, 256, 3, 1, 1), nn.BatchNorm2d(256), nn.ReLU(True),
            nn.Conv2d(256, 256, 3, 1, 1), nn.ReLU(True),
            nn.MaxPool2d((2, 1), (2, 1)),  # 只降低高度
            # conv4: [B, 256, 2, W/8] -> [B, 512, 1, W/8]
            nn.Conv2d(256, 512, 3, 1, 1), nn.BatchNorm2d(512), nn.ReLU(True),
            nn.MaxPool2d((2, 1), (2, 1)),
            # conv5: [B, 512, 1, W/16] -> [B, 512, 1, W/16]
            nn.Conv2d(512, 512, (2, 1), 1, 0), nn.BatchNorm2d(512), nn.ReLU(True),
        )
        # 映射层: 512 -> nh
        self.mapping = nn.Sequential(
            nn.Conv2d(512, nh, 1, 1, 0), nn.ReLU(True)
        )
        # RNN 序列建模
        self.rnn = self._build_rnn(nh, n_rnn)
        # CTC 分类头
        self.fc = nn.Linear(nh, nclass)

    def _build_rnn(self, nh, n_rnn):
        return nn.LSTM(nh, nh // 2, bidirectional=True,
                       num_layers=n_rnn, batch_first=False)

    def forward(self, x):
        conv = self.cnn(x)          # [B, 512, 1, W/16]
        conv = self.mapping(conv)    # [B, nh, 1, W/16]
        b, c, h, w = conv.size()
        conv = conv.view(b, -1, w)   # [B, nh, W/16] 序列
        conv = conv.permute(2, 0, 1) # [W/16, B, nh]
        rnn_out, _ = self.rnn(conv)  # [W/16, B, nh]
        output = self.fc(rnn_out)    # [W/16, B, nclass]
        return output  # CTC 输入`
                },
                {
                    lang: "python",
                    code: `# CTC 解码详解
def ctc_decode(predictions, blank_index=0):
    """
    CTC 贪婪解码 (Greedy Decode)
    predictions: [seq_len, nclass] - 每个时间步的字符概率
    返回: 解码后的文本
    """
    # 每步取最大概率的字符
    pred_indices = predictions.argmax(dim=-1)  # [seq_len]

    # 去除连续重复 + 去除 blank
    decoded = []
    prev = None
    for idx in pred_indices:
        if idx != blank_index and idx != prev:
            decoded.append(idx.item())
        prev = idx
    return decoded

def ctc_beam_search(predictions, beam_width=10, blank_index=0):
    """
    CTC 束搜索解码 (Beam Search Decode)
    比贪婪解码更准确，考虑多个候选路径
    """
    import math
    # 简化版: 维护 top-k 路径
    seq_len, nclass = predictions.shape
    probs = F.softmax(predictions, dim=-1)

    # 初始: 空路径概率为 1
    beams = {(): 1.0}

    for t in range(seq_len):
        new_beams = {}
        for path, prob in beams.items():
            for c in range(nclass):
                new_prob = prob * probs[t, c].item()
                if c == blank_index:
                    # blank: 路径不变
                    new_beams[path] = new_beams.get(path, 0) + new_prob
                elif path and path[-1] == c:
                    # 重复字符: 跳过 (CTC 规则)
                    new_beams[path] = new_beams.get(path, 0) + new_prob
                else:
                    # 新字符: 追加
                    new_path = path + (c,)
                    new_beams[new_path] = new_beams.get(new_path, 0) + new_prob

        # 保留 top-k
        beams = dict(sorted(new_beams.items(),
                            key=lambda x: -x[1])[:beam_width])

    # 返回最高概率路径
    best_path = max(beams, key=beams.get)
    return list(best_path), beams[best_path]

# 字符集映射
charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
charset = ["<blank>"] + list(charset)

def indices_to_text(indices):
    return "".join(charset[i] for i in indices if i < len(charset))

decoded_indices = ctc_decode(torch.randn(25, 65))
print(f"识别结果: {indices_to_text(decoded_indices)}")`
                }
            ],
            table: {
                headers: ["CRNN 组件", "作用", "输入/输出", "关键技术"],
                rows: [
                    ["CNN", "视觉特征提取", "图像 [1×32×W] → 特征 [512×1×W/16]", "VGG 风格卷积 + BN"],
                    ["Map", "维度映射", "[512×1×W/16] → [256×1×W/16]", "1×1 卷积降维"],
                    ["BiLSTM", "序列上下文建模", "[W/16, B, 256] → [W/16, B, 256]", "双向 LSTM, 2 层"],
                    ["FC", "字符分类", "[W/16, B, 256] → [W/16, B, nclass]", "全连接层"],
                    ["CTC Loss", "序列对齐损失", "预测 + 标签 → 标量 Loss", "动态规划前向-后向算法"],
                    ["CTC Decode", "路径解码", "[W/16, nclass] → 文本", "贪婪解码 / Beam Search"]
                ]
            },
            mermaid: `graph LR
    A["文字图像
32×W"] --> B["CNN 卷积
5 层卷积 + 池化"]
    B --> C["特征序列
W/16 × 512"]
    C --> D["BiLSTM
上下文建模"]
    D --> E["全连接
字符分类"]
    E --> F["CTC 解码
去重 + 去 blank"]
    F --> G["输出文本"]
    class G s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "CRNN 的输入图像高度通常设为 32 像素——这是经验值，太低会丢失笔画细节，太高会增加计算量且无额外收益",
            warning: "CTC 假设字符之间条件独立，无法建模字符间的依赖关系（如「q」后面大概率跟「u」），这是 CRNN 的理论上限"
        },
        {
            title: "5. 端到端 OCR：检测识别一体化",
            body: `端到端 OCR（End-to-End OCR）将文字检测和文字识别统一为一个网络，共享特征提取器，避免了两阶段方法中检测和识别的误差累积问题。Mask TextSpotter（2018）首次将实例分割引入 OCR——网络同时预测文字区域的 mask 和文本内容，天然支持弯曲文字。Mask TextSpotter v3（2020）进一步引入特征对齐模块（Character-aware RoI Align），将不规则文字区域规范化为矩形送入识别器。ABINet（2021）提出了双分支迭代校正架构：视觉分支做粗识别，语言分支做纠错，两者通过迭代交互不断优化结果。ABINet 的语言模型独立于视觉特征，可以在推理时进行多轮自纠正，在复杂场景下显著提升了识别准确率。此外，SATRN（2020）将 Transformer 引入文字识别，用自注意力机制替代 LSTM，在长文本识别和稀疏文字场景下表现优异。端到端方法的优势在于：共享特征降低计算成本、联合优化提升整体精度、天然支持不规则文字区域。但训练难度也更高——需要同时优化检测和识别两个任务，数据标注成本更大。`,
            code: [
                {
                    lang: "python",
                    code: `class ABINetLanguageModel(nn.Module):
    """ABINet 语言模型（纠错分支）"""
    def __init__(self, n_layers=4, d_model=512, n_head=8,
                 d_inner=2048, dropout=0.1, max_length=25):
        super().__init__()
        self.max_length = max_length
        self.embedding = nn.Embedding(39, d_model)  # 38 chars + PAD

        # Transformer Decoder
        decoder_layer = nn.TransformerDecoderLayer(
            d_model=d_model, nhead=n_head,
            dim_feedforward=d_inner, dropout=dropout
        )
        self.transformer = nn.TransformerDecoder(
            decoder_layer, num_layers=n_layers
        )
        self.generator = nn.Linear(d_model, 39)

        # 位置编码
        self.pos_enc = nn.Parameter(
            torch.randn(max_length, d_model) * 0.01
        )

    def forward(self, visual_features, tgt=None):
        """
        visual_features: [B, seq_len, d_model] 视觉分支输出
        tgt: 目标序列（训练时）或 None（推理时自回归）
        """
        b, seq_len, _ = visual_features.size()

        # 自回归生成
        if tgt is None:
            tgt = torch.full((b, 1), 0, dtype=torch.long,
                             device=visual_features.device)  # SOS token
            for _ in range(self.max_length - 1):
                tgt_emb = self.embedding(tgt) + \\
                    self.pos_enc[:tgt.size(1)].unsqueeze(0)
                tgt_emb = tgt_emb.permute(1, 0, 2)
                vis_perm = visual_features.permute(1, 0, 2)

                out = self.transformer(tgt_emb, vis_perm)
                logits = self.generator(out[-1:])  # 最后一步
                next_token = logits.argmax(-1)
                tgt = torch.cat([tgt, next_token.transpose(0, 1)], dim=1)

                if (next_token == 1).all():  # EOS token
                    break
            return tgt

        # 训练模式: teacher forcing
        tgt_emb = self.embedding(tgt) + self.pos_enc[:tgt.size(1)].unsqueeze(0)
        tgt_emb = tgt_emb.permute(1, 0, 2)
        vis_perm = visual_features.permute(1, 0, 2)

        out = self.transformer(tgt_emb, vis_perm)
        logits = self.generator(out)
        return logits`
                },
                {
                    lang: "python",
                    code: `class EndToEndOCR(nn.Module):
    """简化的端到端 OCR 系统"""
    def __init__(self, num_classes=37):
        super().__init__()
        # 共享 Backbone
        self.backbone = self._build_backbone()
        # 检测头
        self.det_head = nn.Sequential(
            nn.Conv2d(256, 128, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 1, 1)  # 文字区域概率图
        )
        # RoI Align 将不规则区域转为固定大小
        self.roi_align = nn.Sequential(
            nn.AdaptiveAvgPool2d((8, 32)),  # 标准化为 8x32
        )
        # 识别头 (CRNN)
        self.rec_head = nn.Sequential(
            nn.Conv2d(256, 256, 3, padding=1),
            nn.ReLU(),
            nn.LSTM(256, 128, bidirectional=True, batch_first=True),
            nn.Linear(256, num_classes)
        )

    def forward(self, image, proposals=None):
        features = self.backbone(image)  # [B, 256, H/16, W/16]

        # 检测
        if proposals is None:
            score_map = torch.sigmoid(self.det_head(features))
            proposals = self._extract_proposals(score_map)

        # 对每个 proposal 做 RoI Align + 识别
        results = []
        for proposal in proposals:
            roi_feat = self._crop_and_resize(features, proposal)
            roi_feat = self.roi_align(roi_feat)
            b, c, h, w = roi_feat.size()
            seq = roi_feat.view(b, c, -1).permute(0, 2, 1)
            rec_out = self.rec_head(seq)
            results.append(rec_out)

        return results`
                }
            ],
            table: {
                headers: ["端到端方法", "检测方式", "识别方式", "不规则文字", "速度"],
                rows: [
                    ["Mask TextSpotter v1", "实例分割 mask", "Attention + TPS", "支持", "慢"],
                    ["Mask TextSpotter v3", "分割 + 语义掩码", "Character-aware RoI", "优秀支持", "中等"],
                    ["ABINet", "检测器 + 识别器", "视觉 + 语言双分支迭代", "优秀支持", "中等"],
                    ["SATRN", "检测器", "Transformer 识别", "优秀支持", "慢"],
                    ["SVTR", "检测器", "视觉 Transformer", "优秀支持", "中等"]
                ]
            },
            mermaid: `graph TD
    A["输入图像"] --> B["共享 Backbone
特征提取"]
    B --> C["检测分支
文字区域 Proposal"]
    B --> D["识别分支
字符序列"]
    C --> E["RoI Align
区域规范化"]
    E --> D
    D --> F["迭代纠错
视觉 + 语言交互"]
    F --> G["输出: 文本 + 位置"]
    class G s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "端到端方法适合需要高精度且算力充足的场景；如果只需要简单文字识别，检测+识别两阶段方案更灵活且更容易调试",
            warning: "端到端模型的训练需要大量标注数据（检测框 + 文本标签），标注成本是两阶段方案的 2-3 倍"
        },
        {
            title: "6. PaddleOCR 实战：工业级 OCR 系统",
            body: `PaddleOCR 是百度开源的超轻量级 OCR 系统，2020 年发布后迅速成为中文 OCR 领域的事实标准。PaddleOCR 的核心优势在于：（1）PP-OCR 系列模型（v2/v3/v4）在精度和速度之间取得极佳的平衡——PP-OCRv4 的检测模型仅 3.1MB，识别模型仅 3.5MB，但精度接近大型模型；（2）提供完整的数据合成工具（Style-Text），可以用少量真实数据合成大量训练数据；（3）支持 80+ 语言，包含中英文、日文、韩文等；（4）提供服务器端和移动端两套模型，部署灵活；（5）完善的工具链（数据标注、训练、评估、推理、部署一条龙）。PaddleOCR 的检测器采用 DBNet（DB++），识别器采用 SVTR_LCNet（视觉 Transformer + 轻量 CNN 混合架构）。PP-OCRv4 在 ICDAR2015 英文识别上达到了 80.1% 的准确率，同时推理速度比 v3 提升 12%。`,
            code: [
                {
                    lang: "python",
                    code: `from paddleocr import PaddleOCR
import cv2

# 初始化 OCR 引擎
ocr = PaddleOCR(
    use_angle_cls=True,      # 启用文字方向分类器
    lang="ch",               # 中英文识别
    use_gpu=True,            # GPU 加速
    det_model_dir="./models/det/",
    rec_model_dir="./models/rec/",
    cls_model_dir="./models/cls/",
    det_db_thresh=0.3,       # 检测阈值
    det_db_box_thresh=0.6,   # 检测框置信度阈值
    rec_batch_num=6,         # 识别 batch size
    max_text_length=25,      # 最大文本长度
)

# 推理
image_path = "sample.jpg"
result = ocr.ocr(image_path, cls=True)

# 解析结果
img = cv2.imread(image_path)
for line in result:
    if line is None:
        continue
    for word_info in line:
        bbox = word_info[0]       # 四边形顶点
        text = word_info[1][0]    # 识别文本
        score = word_info[1][1]   # 置信度

        # 绘制结果
        pts = np.array(bbox, dtype=np.int32)
        cv2.polylines(img, [pts], True, (0, 255, 0), 2)
        cv2.putText(img, f"{text} ({score:.2f})",
                     (int(bbox[0][0]), int(bbox[0][1]) - 5),
                     cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)

        print(f"  文本: {text} | 置信度: {score:.4f}")

cv2.imwrite("ocr_result.jpg", img)`
                },
                {
                    lang: "python",
                    code: `# PaddleOCR 模型量化与部署
from paddle.static import InputSpec
from paddle.fluid.contrib.slim.quant import quant_aware

# 1. 导出 inference 模型
# !paddleocr --export_model --output_dir ./inference/

# 2. INT8 量化（减小模型体积 4 倍）
# !paddle2onnx --model_dir ./inference/ \\
#     --model_filename inference.pdmodel \\
#     --params_filename inference.pdiparams \\
#     --save_file ocr.onnx \\
#     --opset_version 11

# 3. ONNX Runtime 推理
import onnxruntime as ort

session = ort.InferenceSession("ocr.onnx")
input_name = session.get_inputs()[0].name

def inference_with_onnx(image, session, input_name):
    """ONNX Runtime 推理"""
    # 预处理
    img = preprocess(image)  # resize, normalize
    img = img.transpose(2, 0, 1).astype("float32")
    img = np.expand_dims(img, axis=0)

    # 推理
    outputs = session.run(None, {input_name: img})
    return outputs

# 4. 性能对比
print("=== PaddleOCR 模型对比 ===")
models = {
    "PP-OCRv4 det":  {"size": "3.1MB", "speed": "15ms", "accuracy": "84.5%"},
    "PP-OCRv4 rec":  {"size": "3.5MB", "speed": "8ms", "accuracy": "80.1%"},
    "PP-OCRv4 server det": {"size": "110MB", "speed": "25ms", "accuracy": "87.3%"},
    "PP-OCRv4 server rec": {"size": "98MB", "speed": "15ms", "accuracy": "84.2%"},
}
for name, m in models.items():
    print(f"  {name:<20} | {m['size']:>7} | {m['speed']:>7} | {m['accuracy']}")`
                }
            ],
            table: {
                headers: ["PP-OCR 版本", "检测模型", "识别模型", "英文精度", "中文精度", "模型大小"],
                rows: [
                    ["PP-OCRv2", "DB + Slim", "CRNN + Light CNN", "73.2%", "72.8%", "~8MB"],
                    ["PP-OCRv3", "DB++", "SVTR + TCNR", "78.1%", "76.4%", "~10MB"],
                    ["PP-OCRv4", "DB++ 改进", "SVTR_LCNet", "80.1%", "78.6%", "~6MB"],
                    ["PP-OCRv4 Server", "DB++ 大模型", "SVTR 大模型", "87.3%", "84.2%", "~210MB"],
                    ["PP-StructureV2", "版面分析 + OCR", "表格识别 + 关键信息提取", "-", "-", "~500MB"]
                ]
            },
            mermaid: `graph TD
    A["PaddleOCR
整体架构"] --> B["文本检测
DB++"]
    A --> C["文本方向分类
180° 翻转检测"]
    A --> D["文本识别
SVTR_LCNet"]
    A --> E["后处理
排版分析"]
    B --> F["概率图 + 阈值图"]
    F --> G["可微二值化"]
    G --> H["文字区域框"]
    C --> I["0° / 180° 分类"]
    I --> J["方向校正"]
    D --> K["序列识别"]
    K --> L["CTC / Attention 解码"]
    H --> M["结果整合"]
    J --> M
    L --> M
    M --> N["最终输出"]
    class N s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "移动端部署首选 PP-OCRv4 超轻量模型（仅 6MB），如果对精度要求高则用 Server 版模型；生产环境建议先用 PPOCRLabel 工具标注数据再微调",
            warning: "PaddleOCR 默认的文字长度限制是 25 个字符，如果需要识别长文本（如段落），需要修改 max_text_length 参数并重新训练"
        },
        {
            title: "7. 多语言与手写识别挑战",
            body: `多语言 OCR 面临的核心挑战是字符集的爆炸式增长。英文只有 26 个字母（大小写 52 个），而中文有 6000+ 常用汉字、日文有 2000+ 常用汉字 + 平假名片假名、阿拉伯文需要从右向左书写且字符有上下文变形、泰文和缅甸文包含复杂的上标下标组合。多语言识别的两种策略：（1）统一字符集——将所有语言的字符合并为一个超集，训练一个多语言识别模型，但模型复杂度随字符集增大而增加；（2）语言路由——先用语言分类器判断文字语言，再调用对应语言的专用识别模型，精度更高但系统复杂度增加。手写识别的挑战更加严峻：每个人的书写风格差异巨大，笔画粗细、倾斜角度、连笔习惯各不相同。手写中文尤其困难——一个「的」字可能有上百种写法。当前最好的手写识别方案是基于 Transformer 的序列到序列模型（如 TrOCR），利用大规模预训练的语言模型知识来辅助识别，即使在低质量手写样本上也能取得可观的准确率。多模态大模型（如 GPT-4V、Qwen-VL）的出现为 OCR 带来了新思路——它们可以直接「看懂」图片中的文字，无需专门的检测-识别 Pipeline，但成本较高且可控性不如专用 OCR 系统。`,
            code: [
                {
                    lang: "python",
                    code: `from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import torch
from PIL import Image

# TrOCR: Transformer-based OCR 手写识别
class HandwritingRecognizer:
    """基于 TrOCR 的手写文字识别器"""
    def __init__(self, model_name="microsoft/trocr-base-handwritten"):
        self.processor = TrOCRProcessor.from_pretrained(model_name)
        self.model = VisionEncoderDecoderModel.from_pretrained(model_name)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)

    def recognize(self, image_path):
        """识别手写文字"""
        image = Image.open(image_path).convert("RGB")

        # 预处理
        pixel_values = self.processor(
            image, return_tensors="pt"
        ).pixel_values.to(self.device)

        # 生成文本
        generated_ids = self.model.generate(
            pixel_values,
            max_length=64,
            num_beams=5,         # Beam Search
            early_stopping=True,
            no_repeat_ngram_size=3,  # 防止重复
        )
        text = self.processor.batch_decode(
            generated_ids, skip_special_tokens=True
        )[0]
        return text

    def batch_recognize(self, image_paths):
        """批量识别"""
        images = [Image.open(p).convert("RGB") for p in image_paths]
        pixel_values = self.processor(
            images, return_tensors="pt", padding=True
        ).pixel_values.to(self.device)

        generated_ids = self.model.generate(
            pixel_values, max_length=64, num_beams=5
        )
        return self.processor.batch_decode(
            generated_ids, skip_special_tokens=True
        )`
                },
                {
                    lang: "python",
                    code: `# 多语言字符集管理
class MultiLanguageCharset:
    """多语言字符集管理"""
    def __init__(self):
        # 各语言字符集
        self.charsets = {
            "en": "0123456789abcdefghijklmnopqrstuvwxyz"
                  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "zh_cn": self._load_chinese_chars(),  # 6500 常用汉字
            "ja": self.charsets["en"] + self._load_japanese_chars(),
            "ar": self._load_arabic_chars(),  # 从右向左
            "ko": self._load_korean_chars(),
        }
        # 合并字符集
        self.unified = self._build_unified_charset()
        self.char2idx = {c: i for i, c in enumerate(self.unified)}
        self.idx2char = {i: c for i, c in enumerate(self.unified)}

    def _load_chinese_chars(self):
        """加载常用汉字（示例前 100 个）"""
        return "的一了是我不在人们有来他这上着个地到大里说" \\
               "就去子得也那要下看天时过出么然还起都实" \\
               "现所面前着她而里后以自会家可方成当没动" \\
               "行物生应知水明问力理尔点文几定本公特外" \\
               "儿相因小社者经此发十如西去种两都法想情" \\
               "回但开已其第些作前新想又进所好无只才"

    def _build_unified_charset(self):
        """构建统一字符集"""
        all_chars = set()
        for lang, chars in self.charsets.items():
            all_chars.update(chars)
        return "".join(sorted(all_chars))

    def encode_text(self, text, lang=None):
        """文本 → 索引序列"""
        charset = self.charsets.get(lang, self.unified)
        return [self.char2idx.get(c, 0) for c in text]

# 多语言识别策略
strategies = {
    "统一模型": {
        "描述": "单一模型处理所有语言",
        "优点": "部署简单，无需语言判断",
        "缺点": "模型大、字符间相互干扰",
        "适用": "语言混合场景"
    },
    "语言路由": {
        "描述": "先判断语言，再调用专用模型",
        "优点": "每种语言精度最优",
        "缺点": "需要语言分类器，系统复杂",
        "适用": "单语文档批量处理"
    },
    "零样本多模态": {
        "描述": "GPT-4V / Qwen-VL 等直接识别",
        "优点": "无需训练，支持任意语言",
        "缺点": "成本高，延迟大，不可控",
        "适用": "低频长尾场景"
    }
}`
                }
            ],
            table: {
                headers: ["语言", "字符数", "书写方向", "特殊挑战", "推荐方案"],
                rows: [
                    ["英文", "52 + 数字", "从左到右", "字体变化、连笔", "CRNN / SVTR"],
                    ["中文", "6500+ 常用字", "从左到右", "字符集大、形近字多", "PP-OCRv4 / TrOCR"],
                    ["日文", "2000+ 汉字 + 假名", "从左到右 / 右到左", "混合书写、竖排", "PP-OCR 日文模型"],
                    ["阿拉伯文", "28 字母 + 变形", "从右到左", "上下文连写变形", "专用 RTL 模型"],
                    ["手写中文", "无限写法", "任意方向", "个人风格差异大", "TrOCR / 多模态大模型"],
                    ["手写英文", "无限写法", "任意方向", "连笔、草书", "TrOCR handwritten"]
                ]
            },
            mermaid: `graph TD
    A["输入图像"] --> B{"语言判断"}
    B --> C["英文"]
    B --> D["中文"]
    B --> E["其他语言"]
    B --> F["混合 / 未知"]
    C --> G["英文专用模型
CRNN"]
    D --> H["中文专用模型
PP-OCRv4"]
    E --> I["对应语言模型"]
    F --> J["统一大模型 / 多模态"]
    G --> K["识别结果"]
    H --> K
    I --> K
    J --> K
    class F s2
    class K s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d
    classDef s2 fill:#7c2d12`,
            tip: "对于多语言混合文档，推荐先用 PaddleOCR 的多语言模型做粗识别，再对识别置信度低的区域用专用语言模型做精识别",
            warning: "手写识别的准确率远低于印刷体——即使是最好的 TrOCR 模型，在自由手写中文上的准确率也只有 60-70%，不能用于对准确率要求严格的场景"
        },
    ],
};
