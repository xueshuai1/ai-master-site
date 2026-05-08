import { Article } from '../knowledge';

export const article: Article = {
    id: "mm-002",
    title: "多模态学习（二）：视觉问答与图文生成",
    category: "multimodal",
    tags: ["VQA", "视觉问答", "多模态"],
    summary: "从图像和文本到答案，理解视觉问答的核心技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
  learningPath: {
    routeId: "multimodal-series",
    phase: 2,
    order: 2,
    nextStep: "mm-003",
    prevStep: "mm-001",
  },
    content: [
        {
            title: "1. VQA 任务定义与核心数据集",
            body: `视觉问答（Visual Question Answering, VQA）是多模态理解领域最具挑战性的任务之一。给定一张图像 I 和一个自然语言问题 Q，模型需要输出准确的答案 A。与纯文本问答不同，VQA 要求模型同时理解视觉语义和语言语义，并在两者之间建立精细的推理链路。

VQA 任务的输出空间通常分为两类：开放式（Open-ended），答案可以是任意词或短语，如 "two"、"yes"、"baseball"；封闭式（Closed），答案限定在预定义类别集合中。主流评测以封闭式为主，因为答案空间可控、指标可比。

**核心数据集：** VQA v2 是最经典的基准，包含 82783 张训练图像和 443757 个问答对，每个问题配有两个人工标注的答案；GQA 数据集强调结构化推理，包含 2200 万个问答对和对应的场景图标注；VQA-X 进一步要求模型在给出答案的同时生成视觉解释（Visual Explanation），推动模型可解释性研究。

VQA 不仅是技术问题，更是检验多模态对齐能力的试金石——一个能准确回答 "图中有几个人" 的模型，必须同时理解 "人" 的视觉概念和 "计数" 这一逻辑操作。`,
            code: [
                {
                    lang: "python",
                    code: `import json
from PIL import Image

class VQADataset:
    """VQA v2 数据集加载器"""
    def __init__(self, questions_path: str, annotations_path: str):
        with open(questions_path) as f:
            self.questions = json.load(f)["questions"]
        with open(annotations_path) as f:
            self.annotations = json.load(f)["annotations"]

        # 构建 answer-to-label 映射
        self.answer2label = {
            a["answer"]: a["answer_id"]
            for a in json.load(open("answer2label.json"))["answers"]
        }

    def __getitem__(self, idx: int):
        q = self.questions[idx]
        a = self.annotations[idx]
        # 统计众数答案作为标签
        answer_counts = {}
        for annot in a["multiple_choice_answer"]:
            answer_counts[annot] = answer_counts.get(annot, 0) + 1
        label = max(answer_counts, key=answer_counts.get)
        return q["question"], a["image_id"], label

    def __len__(self):
        return len(self.questions)`
                },
                {
                    lang: "python",
                    code: `from torchvision.datasets import VQAv2
from torch.utils.data import DataLoader

# 使用 torchvision 内置 VQA v2 数据集
dataset = VQAv2(
    root="./data",
    annFile="./data/annotations/v2_mscoco_train2014_annotations.json",
    quesFile="./data/annotations/v2_OpenEnded_mscoco_train2014_questions.json",
)

dataloader = DataLoader(
    dataset,
    batch_size=32,
    shuffle=True,
    collate_fn=lambda batch: {
        "images": [b[0] for b in batch],
        "questions": [b[1] for b in batch],
        "targets": [b[2] for b in batch],
    },
)

print(f"VQA v2 训练集样本数: {len(dataset)}")`
                }
            ],
            table: {
                headers: ["数据集", "图像数", "问答对数", "特点"],
                rows: [
                    ["VQA v1", "82783", "248349", "首个大规模 VQA 基准"],
                    ["VQA v2", "123287", "443757", "平衡答案分布，缓解语言偏置"],
                    ["GQA", "94766", "22000000", "场景图驱动，结构化推理"],
                    ["VQA-X", "214084", "98000+", "含视觉解释标注"],
                    ["OK-VQA", "14031", "14055", "需要外部知识才能回答"],
                ],
            },
            mermaid: `graph TD
    A["输入图像 I"] --> C["视觉编码器"]
    B["输入问题 Q"] --> D["文本编码器"]
    C --> E["多模态融合"]
    D --> E
    E --> F["推理模块"]
    F --> G["答案解码器"]
    G --> H["输出答案 A"]
    class H s1
    class A s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#14532d`,
            tip: "建议先从 VQA v2 小规模子集开始调试，确认数据加载和预处理流程正确后再跑全量数据",
            warning: "VQA v2 存在明显的语言偏置（Language Bias），部分问题仅凭问题文本即可猜出答案，评测时务必使用 test-std 或 test-dev 标准拆分",
        },
        {
            title: "2. 早期方法：CNN + RNN 特征融合",
            body: `VQA 的早期方法遵循一个清晰的设计范式：使用预训练的 CNN 提取视觉特征，使用 RNN（通常是 LSTM 或 GRU）编码问题文本，然后通过简单的拼接（Concatenation）或逐元素相乘（Element-wise Multiplication）将两种模态的特征融合，最后送入分类器输出答案。

具体而言，CNN 通常选用在 ImageNet 上预训练的 VGGNet 或 ResNet，提取最后一层卷积特征图（如 ResNet-101 输出的 7x7x2048 特征图），然后通过全局平均池化或展平得到固定维度的视觉向量。文本端则将问题分词后通过词嵌入层送入 LSTM，取最后一个时间步的隐藏状态作为文本向量。

融合策略的选择至关重要。早期工作对比了多种方案：拼接（Concatenation）保留全部信息但维度膨胀；逐元素相乘强调共同激活的维度；双线性池化（Bilinear Pooling）则通过外积运算建模细粒度的特征交互，其中 MCB（Multimodal Compact Bilinear Pooling）通过 Count Sketch 近似实现高效计算，成为当时最强大的融合方法。

尽管这些方法在 VQA v1 上取得了 50%-60% 的准确率，但它们在处理需要空间推理或多步推理的问题时表现不佳，因为全局池化操作丢失了空间结构信息，简单的融合也无法建模问题与图像区域之间的细粒度对应关系。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torchvision.models as models

class EarlyVQA(nn.Module):
    """早期 CNN+RNN VQA 模型"""
    def __init__(self, vocab_size: int, embed_dim: int,
                 hidden_dim: int, num_answers: int):
        super().__init__()
        # CNN: 预训练 ResNet 提取视觉特征
        resnet = models.resnet101(pretrained=True)
        self.visual_encoder = nn.Sequential(
            *list(resnet.children())[:-2],  # 去掉 FC 和 GAP
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten()
        )
        # 冻结 CNN 前几层
        for name, param in self.visual_encoder.named_parameters():
            if "layer1" in name or "conv1" in name:
                param.requires_grad = False

        # RNN: LSTM 编码问题
        self.word_embed = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim,
                            batch_first=True)

        # 融合与分类
        self.fusion = nn.Linear(2048 + hidden_dim, 1024)
        self.classifier = nn.Sequential(
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(1024, num_answers)
        )

    def forward(self, images, questions, lengths):
        # 视觉特征 [B, 2048]
        v_feat = self.visual_encoder(images)
        # 文本特征 [B, hidden_dim]
        q_embed = self.word_embed(questions)
        _, (h_n, _) = self.lstm(q_embed)
        q_feat = h_n[-1]
        # 拼接融合
        fused = torch.cat([v_feat, q_feat], dim=1)
        return self.classifier(self.fusion(fused))`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class MCBPool(nn.Module):
    """Multimodal Compact Bilinear Pooling (简化版)"""
    def __init__(self, input_dim: int, output_dim: int,
                 sum_pool: bool = True):
        super().__init__()
        self.output_dim = output_dim
        self.sum_pool = sum_pool
        # Count Sketch 投影矩阵
        self.hash_v = nn.Parameter(
            torch.randint(0, output_dim, (input_dim,)),
            requires_grad=False
        )
        self.sign_v = nn.Parameter(
            torch.randint(0, 2, (input_dim,)) * 2 - 1,
            requires_grad=False
        )
        self.hash_q = nn.Parameter(
            torch.randint(0, output_dim, (input_dim,)),
            requires_grad=False
        )
        self.sign_q = nn.Parameter(
            torch.randint(0, 2, (input_dim,)) * 2 - 1,
            requires_grad=False
        )

    def count_sketch(self, x, hash_fn, sign_fn):
        """将输入投影到 sketch 空间"""
        B, D = x.shape
        output = torch.zeros(B, self.output_dim, device=x.device)
        idx = hash_fn.expand(B, -1)
        signs = sign_fn.expand(B, -1)
        output.scatter_add_(1, idx, x * signs)
        return output

    def forward(self, v, q):
        # 对视觉和文本特征分别做 Count Sketch
        fft_v = torch.fft.rfft(self.count_sketch(v, self.hash_v, self.sign_v))
        fft_q = torch.fft.rfft(self.count_sketch(q, self.hash_q, self.sign_q))
        # 频域卷积 = 频域逐元素相乘
        fused = torch.fft.irfft(fft_v * fft_q)
        # 开方 + 归一化 (sqrt + l2 norm)
        fused = torch.sign(fused) * torch.sqrt(torch.abs(fused) + 1e-8)
        if self.sum_pool:
            return fused.sum(dim=1)
        return fused`
                }
            ],
            table: {
                headers: ["融合方法", "维度", "计算复杂度", "VQA v1 准确率"],
                rows: [
                    ["Concat", "4096", "O(d)", "~54%"],
                    ["逐元素相乘", "2048", "O(d)", "~55%"],
                    ["MCB", "16000", "O(d log d)", "~65%"],
                    ["MLB", "1024", "O(d)", "~63%"],
                    ["Mutan", "1024", "O(d)", "~64%"],
                ],
            },
            mermaid: `graph LR
    A["CNN 特征 [B, 2048]"] --> B["Count Sketch"]
    C["LSTM 特征 [B, 2048]"] --> D["Count Sketch"]
    B --> E["FFT"]
    D --> F["FFT"]
    E --> G["频域相乘"]
    F --> G
    G --> H["IFFT"]
    H --> I["sqrt + L2 归一化"]
    I --> J["融合特征 [B, 16000]"]
    class J s1
    class G s0
    classDef s0 fill:#713f12
    classDef s1 fill:#14532d`,
            tip: "MCB 虽然有效，但输出维度高达 16000，内存消耗大。实际使用时可以先用 MLB（低秩双线性池化）做原型验证，确认效果后再升级 MCB",
            warning: "Count Sketch 的随机哈希矩阵在训练时必须固定（requires_grad=False），否则梯度会破坏投影的数学性质",
        },
        {
            title: "3. 注意力机制在 VQA 中的应用",
            body: `注意力机制的引入是 VQA 领域的一次范式转变。早期 CNN+RNN 方法对整张图像使用全局特征，但很多问题只需要关注图像的特定区域——例如 "椅子上有什么颜色的靠垫" 只需要关注椅子区域，而不是整张图。

**堆叠注意力网络（SAN, Stacked Attention Networks）** 率先将注意力引入 VQA，通过多层注意力迭代地聚焦于图像中最相关的区域。每一层注意力都以问题特征为 query，图像区域特征为 key 和 value，计算注意力权重后加权求和得到注意力池化的视觉特征。

**自顶向下注意力（Top-Down Attention, 即 BUTD 模型）** 进一步使用 Faster R-CNN 提取目标检测区域作为视觉输入，而非均匀网格特征。这种方法的优势在于每个视觉单元都对应一个语义对象（人、车、狗等），使得模型能够以更精细的粒度理解视觉内容。配合 bottom-up（自底向上的检测特征）和 top-down（由问题引导的注意力）的双路径设计，该模型在 2017 年 VQA Challenge 中获得冠军。

注意力的本质是在问题引导下进行视觉特征选择：问题中的关键词 "什么颜色" 会激活模型对颜色相关区域的注意力，而 "几个人" 则会关注所有可能被判定为人的区域。这种动态选择机制显著提升了需要细粒度理解的问题的准确率。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class StackedAttention(nn.Module):
    """堆叠注意力网络 (SAN)"""
    def __init__(self, hidden_dim: int, num_stacks: int = 2):
        super().__init__()
        self.num_stacks = num_stacks
        # 注意力打分网络
        self.w_q = nn.Linear(hidden_dim, hidden_dim)
        self.w_v = nn.Linear(hidden_dim, hidden_dim)
        self.w_a = nn.Linear(hidden_dim, 1)
        self.tanh = nn.Tanh()
        self.fc = nn.Linear(hidden_dim, hidden_dim)
        self.dropout = nn.Dropout(0.5)

    def forward(self, v: torch.Tensor, q: torch.Tensor):
        """v: [B, N, D] 图像区域特征, q: [B, D] 问题特征"""
        u = q.clone()  # 初始化为问题特征
        for _ in self.num_stacks:
            # 计算注意力分数
            h_v = self.w_v(v)  # [B, N, D]
            h_q = self.w_q(u).unsqueeze(1)  # [B, 1, D]
            scores = self.w_a(self.tanh(h_v + h_q)).squeeze(-1)  # [B, N]
            attn = F.softmax(scores, dim=-1)  # [B, N]
            # 加权求和
            v_att = torch.bmm(attn.unsqueeze(1), v).squeeze(1)  # [B, D]
            # 残差更新
            u = u + self.dropout(self.fc(v_att))
        return u  # 返回注意力增强后的问题表示`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class BottomUpTopDown(nn.Module):
    """自顶向下注意力 + 目标检测区域特征"""
    def __init__(self, visual_dim: int, text_dim: int,
                 num_heads: int = 16):
        super().__init__()
        self.num_heads = num_heads
        head_dim = visual_dim // num_heads
        # 问题到注意力的投影
        self.w_q = nn.Linear(text_dim, visual_dim)
        # key/value 投影
        self.w_k = nn.Linear(visual_dim, visual_dim)
        self.w_v = nn.Linear(visual_dim, visual_dim)
        self.scale = head_dim ** -0.5

        # 输出投影
        self.out_proj = nn.Linear(visual_dim, visual_dim)
        self.layer_norm = nn.LayerNorm(visual_dim)

    def forward(self, regions: torch.Tensor, question: torch.Tensor):
        """regions: [B, K, D] K 个检测区域, question: [B, D]"""
        B, K, D = regions.shape
        # 多头注意力
        q = self.w_q(question).view(B, 1, self.num_heads, -1).transpose(1, 2)
        k = self.w_k(regions).view(B, K, self.num_heads, -1).transpose(1, 2)
        v = self.w_v(regions).view(B, K, self.num_heads, -1).transpose(1, 2)

        attn = (q @ k.transpose(-2, -1)) * self.scale
        attn = F.softmax(attn, dim=-1)
        context = (attn @ v).transpose(1, 2).reshape(B, D)

        return self.layer_norm(question + self.out_proj(context))`
                }
            ],
            table: {
                headers: ["注意力方法", "视觉输入", "注意力类型", "VQA v2 准确率"],
                rows: [
                    ["SAN", "网格特征", "堆叠式", "~61.6%"],
                    ["BUTD (自顶向下)", "检测区域", "基于检测", "~70.3%"],
                    ["Co-Attention", "网格特征", "并行共注意力", "~65.4%"],
                    ["CBA", "检测区域", "级联双注意力", "~67.2%"],
                    ["BAN", "检测区域", "双线性注意力", "~65.9%"],
                ],
            },
            mermaid: `sequenceDiagram
    participant Q as 问题文本
    participant V as 图像区域
    participant A as 注意力模块
    participant O as 输出层
    Q->>A: 作为 Query
    V->>A: 作为 Key + Value
    A->>A: 计算注意力权重
    A->>A: 加权聚合视觉特征
    A->>O: 融合特征
    O->>Q: 迭代精化 (多层)
    Q->>O: 最终答案预测
    Note over A: 堆叠 N 次注意力层`,
            tip: "使用预训练的目标检测器（如 Faster R-CNN，在 Visual Genome 上训练）提取区域特征，每个图像取 top-36 个区域是 BUTD 的标准配置",
            warning: "检测区域的数量是动态变化的，训练时需要 padding 和 attention mask 来避免对无效区域计算注意力",
        },
        {
            title: "4. Transformer-based VQA",
            body: `Transformer 架构凭借自注意力机制的强大表达能力，在 NLP 和 CV 领域都取得了突破性进展。在 VQA 领域，Transformer 的引入带来了两个维度的革新：一是用 Transformer 替代 LSTM 作为文本编码器，二是用 Vision Transformer（ViT）或 DETR 替代 CNN 作为视觉编码器。

**ViLT（Vision-and-Language Transformer）** 是这一方向的代表性工作。它的核心思想极其简洁：将图像分割为固定大小的 patch，每个 patch 线性投影后加上位置嵌入，与文本 token 的嵌入拼接，然后直接送入标准的 Transformer 编码器。整个过程不需要 CNN 提取特征，也不需要目标检测器提取区域——是一种真正的端到端方案。

**Oscar（Object-Semantics Aligned Pretraining）** 则在 Transformer 架构中引入了对象标签（Object Tags）作为额外的视觉 token，通过预训练学习对象级别的语义对齐，在微调 VQA 任务时取得显著提升。

Transformer 在 VQA 中的关键优势在于跨模态自注意力（Cross-Modal Self-Attention）：图像 patch 和文本 token 在同一个 Transformer 中交互，每个 token 都可以直接关注到另一个模态中的任意 token。这种全连接的跨模态交互远强于早期方法中有限的融合操作。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from transformers import ViTModel, BertModel

class ViLTStyleVQA(nn.Module):
    """简化版 ViLT 风格的 VQA 模型"""
    def __init__(self, num_answers: int, hidden_dim: int = 768):
        super().__init__()
        # 图像 patch 线性投影（替代 CNN）
        self.patch_embed = nn.Conv2d(
            in_channels=3, out_channels=hidden_dim,
            kernel_size=16, stride=16  # 16x16 patch
        )
        self.type_embed = nn.Embedding(2, hidden_dim)  # 0=image, 1=text
        self.pos_embed = nn.Parameter(torch.randn(1, 256, hidden_dim))

        # 共享 Transformer 编码器
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim, nhead=12, dim_feedforward=3072,
            dropout=0.1, batch_first=True
        )
        self.transformer = nn.TransformerEncoder(
            encoder_layer, num_layers=12
        )

        # CLS token
        self.cls_token = nn.Parameter(torch.randn(1, 1, hidden_dim))

        # 答案分类头
        self.classifier = nn.Linear(hidden_dim, num_answers)

    def forward(self, images: torch.Tensor, input_ids: torch.Tensor,
                text_embeds: torch.Tensor, attention_mask: torch.Tensor):
        B = images.shape[0]
        # 图像 patch 嵌入 [B, 3, 224, 224] -> [B, 196, 768]
        img_tokens = self.patch_embed(images).flatten(2).transpose(1, 2)
        img_type = self.type_embed(torch.zeros(B, img_tokens.size(1),
                                               dtype=torch.long, device=images.device))

        # 文本嵌入
        txt_type = self.type_embed(torch.ones(B, text_embeds.size(1),
                                              dtype=torch.long, device=images.device))

        # 拼接 + 位置编码
        cls = self.cls_token.expand(B, -1, -1)
        tokens = torch.cat([cls, img_tokens + img_type,
                            text_embeds + txt_type], dim=1)
        tokens = tokens + self.pos_embed[:, :tokens.size(1), :]

        # 扩展 attention mask
        full_mask = torch.cat([
            torch.ones(B, 1 + img_tokens.size(1), device=images.device),
            attention_mask
        ], dim=1)

        output = self.transformer(tokens, src_key_padding_mask=~full_mask.bool())
        return self.classifier(output[:, 0])  # CLS token 输出`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class CrossModalAttention(nn.Module):
    """跨模态自注意力模块 - 视觉和文本 token 统一处理"""
    def __init__(self, d_model: int, nhead: int = 8, dropout: float = 0.1):
        super().__init__()
        self.self_attn = nn.MultiheadAttention(
            d_model, nhead, dropout=dropout, batch_first=True
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_model * 4),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_model * 4, d_model),
            nn.Dropout(dropout),
        )
        self.norm2 = nn.LayerNorm(d_model)

    def forward(self, x: torch.Tensor, mask: torch.Tensor = None):
        """x: [B, N, D] 包含所有模态的 token"""
        # 自注意力（所有 token 互相可见）
        attn_out, _ = self.self_attn(x, x, x, key_padding_mask=mask)
        x = self.norm1(x + attn_out)
        # FFN
        x = self.norm2(x + self.ffn(x))
        return x

# 使用示例
cross_attn = CrossModalAttention(d_model=768, nhead=12)
# 拼接视觉和文本 token
multimodal_tokens = torch.cat([visual_tokens, text_tokens], dim=1)
# [B, N_img + N_txt, 768]
output = cross_attn(multimodal_tokens)
print(f"跨模态输出形状: {output.shape}")`
                }
            ],
            table: {
                headers: ["模型", "视觉编码器", "文本编码器", "融合方式", "VQA v2 准确率"],
                rows: [
                    ["ViLT", "线性 Patch", "BERT", "统一 Transformer", "~76.3%"],
                    ["Oscar", "Faster R-CNN", "BERT", "对象感知 Transformer", "~78.1%"],
                    ["Uniter", "Faster R-CNN", "BERT", "统一 Transformer", "~77.9%"],
                    ["OFA", "ViT", "BART", "自回归生成", "~82.0%"],
                    ["BLIP-2", "ViT-g", "OPT/FlanT5", "Q-Former 桥接", "~85.0%+"],
                ],
            },
            mermaid: `graph TD
    A["输入图像"] --> B["Patch 分割 16x16"]
    B --> C["线性投影 + 位置编码"]
    D["输入问题"] --> E["词嵌入 + 位置编码"]
    C --> F["拼接 [CLS] + 图像 + 文本"]
    E --> F
    F --> G["多层 Transformer 编码器"]
    G --> H["CLS 输出"]
    H --> I["答案分类头"]
    I --> J["输出答案"]
    class F s1
    class G s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#713f12`,
            tip: "Transformer-based VQA 模型对预训练数据量依赖很大，建议先在大规模图文对数据上做预训练，再在 VQA 数据集上微调",
            warning: "ViT 风格的模型需要将图像 resize 到固定分辨率（如 384x384），长宽比变化会引入变形，建议使用 letterbox padding 保持原始比例",
        },
        {
            title: "5. 多模态预训练：ViLBERT 与 LXMERT",
            body: `多模态预训练（Multimodal Pretraining）通过在海量的图文对数据上学习通用的跨模态表示，然后迁移到下游 VQA 等任务上微调，大幅提升了 VQA 模型的性能上限。这一范式类似于 BERT 在 NLP 领域的成功——先在大语料上预训练，再在下游任务上微调。

**ViLBERT（Vision-and-Language BERT）** 采用双流架构：一个视觉 Transformer 处理图像区域特征，一个语言 Transformer 处理文本 token，两者通过 co-attentional transformer layer 定期交换信息。这种设计允许每个模态在独立的 Transformer 中充分建模自身特征，同时通过交叉注意力层实现模态间交互。

**LXMERT（Cross-modal Encoder with Vision and Language）** 在 ViLBERT 基础上引入了三路架构：视觉编码器、语言编码器，以及专门的跨模态编码器。跨模态编码器将两个模态的特征同时输入，用全自注意力建模跨模态交互。LXMERT 的预训练目标包括掩码语言建模（MLM）、掩码区域建模（MRM）、视觉-语言匹配（VLM）等多任务学习。

这些预训练模型的核心价值在于学到了丰富的跨模态先验知识：什么物体通常出现在什么场景、什么属性属于什么对象、什么动作由什么主体执行——这些知识对回答 VQA 问题至关重要，尤其是那些需要常识推理的问题。`,
            code: [
                {
                    lang: "python",
                    code: `from transformers import LxmertTokenizer, LxmertModel
import torch

# 加载预训练的 LXMERT 模型
tokenizer = LxmertTokenizer.from_pretrained("unc-nlp/lxmert-base-uncased")
model = LxmertModel.from_pretrained("unc-nlp/lxmert-base-uncased")

# 准备输入
image_features = torch.randn(1, 36, 2048)  # Faster R-CNN 提取
image_features_bbox = torch.randn(1, 36, 4)  # 边界框坐标
question = "What color is the car?"

inputs = tokenizer(question, return_tensors="pt")

# 前向传播
output = model(
    input_ids=inputs["input_ids"],
    visual_feats=image_features,
    visual_pos=image_features_bbox,
)

# 获取跨模态表示
cross_encoded = output.language_output  # [1, seq_len, 768]
pooled_output = output.pooled_output    # [1, 768]
print(f"语言输出: {cross_encoded.shape}")
print(f"池化输出: {pooled_output.shape}")`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from transformers import PreTrainedModel

class VILBERTForVQA(PreTrainedModel):
    """基于 ViLBERT 的 VQA 微调模型"""
    def __init__(self, config, num_answers: int):
        super().__init__(config)
        from transformers import VilBertModel
        self.vilbert = VilBertModel(config)

        # VQA 分类头
        self.classifier = nn.Sequential(
            nn.Linear(config.hidden_size, config.hidden_size * 2),
            nn.GELU(),
            nn.LayerNorm(config.hidden_size * 2),
            nn.Dropout(0.1),
            nn.Linear(config.hidden_size * 2, num_answers)
        )

    def forward(self, input_ids, visual_feats, visual_pos,
                attention_mask=None, token_type_ids=None,
                labels=None):
        outputs = self.vilbert(
            input_ids=input_ids,
            visual_feats=visual_feats,
            visual_pos=visual_pos,
            attention_mask=attention_mask,
        )
        # 取 pooled output 用于分类
        pooled = outputs[1]  # [B, hidden_size]
        logits = self.classifier(pooled)

        if labels is not None:
            loss = nn.CrossEntropyLoss()(logits, labels)
            return {"loss": loss, "logits": logits}
        return {"logits": logits}`
                }
            ],
            table: {
                headers: ["预训练模型", "架构", "预训练数据规模", "预训练目标", "VQA v2 微调"],
                rows: [
                    ["ViLBERT", "双流 + Co-Attention", "3.3M 图文对", "MLM + MRM + VLM", "~76.7%"],
                    ["LXMERT", "三路架构", "9.5M 图文对", "MLM + MRM + VLM + OA", "~72.4%"],
                    ["VisualBERT", "单流统一", "3.3M 图文对", "MLM + SU", "~75.4%"],
                    ["VL-BERT", "单流统一", "4M 图文对", "MLM + MRM", "~76.0%"],
                    ["UNITER", "单流统一", "5.5M 图文对", "MLM + MRM + ITM + ITC", "~77.9%"],
                ],
            },
            mermaid: `graph TD
    A["海量图文对数据"] --> B["预训练阶段"]
    B --> C["MLM 掩码语言建模"]
    B --> D["MRM 掩码区域建模"]
    B --> E["VLM 图文匹配"]
    B --> F["ITC 图文对比学习"]
    C --> G["多模态编码器"]
    D --> G
    E --> G
    F --> G
    G --> H["预训练权重"]
    H --> I["微调 VQA 任务"]
    I --> J["VQA 分类头"]
    J --> K["答案预测"]
    class I s1
    class B s0
    classDef s0 fill:#7c2d12
    classDef s1 fill:#14532d`,
            tip: "ViLBERT 和 LXMERT 都提供 HuggingFace Transformers 实现，可以直接用 from_pretrained 加载，微调时建议冻结前 6 层 Transformer，只训练高层和分类头，这样训练更快且不易过拟合",
            warning: "多模态预训练模型通常使用 Faster R-CNN 在 Visual Genome 上提取的区域特征作为视觉输入，如果你没有预提取的特征，需要先运行检测器，这一步可能非常耗时",
        },
        {
            title: "6. 评估指标与开放挑战",
            body: `VQA 的评估指标设计经历了一个从简单到精细的演进过程。早期直接使用精确匹配（Exact Match），即预测答案与标注答案完全一致才算正确，但这种方案过于严格——"two" 和 "2" 表达相同含义但会被判错。

**VQA 评估分数**采用了一种折中方案：如果一个问题有 10 个标注答案，某个答案出现了 n 次，则该答案的分数为 min(n/3, 1)。这意味着只有当至少 3 个标注者给出相同答案时，该答案才被计为满分。这种设计平衡了主观性和客观性，同时避免了少数派答案被完全忽略。

**Open-Ended 评估**在测试时不提供候选答案列表，模型需要从整个词表中生成答案。这更接近真实应用场景，但也更困难，因为答案空间几乎无限。近年来，生成式 VQA（Generative VQA）使用自回归语言模型（如 T5、OPT）直接生成答案，而不是分类，取得了令人瞩目的效果。

VQA 仍面临多项开放挑战：语言偏置（模型倾向于依赖问题中的统计规律而非真正理解图像）、幻觉（Hallucination，模型给出看似合理但与图像不符的答案）、常识推理（需要外部知识才能回答的问题）、以及可解释性（模型为什么给出这个答案）。`,
            code: [
                {
                    lang: "python",
                    code: `def vqa_score(pred_answer: str, gt_answers: list) -> float:
    """VQA 官方评估分数计算
    每个问题有 10 个标注答案，计算预测答案的准确度
    """
    from collections import Counter
    answer_counts = Counter(gt_answers)
    # VQA 规则: min(count/3, 1.0)
    pred_count = answer_counts.get(pred_answer, 0)
    return min(pred_count / 3.0, 1.0)

# 示例
gt = ["yes", "yes", "yes", "yes", "yes",
      "yes", "yes", "no", "no", "maybe"]
print(f"预测 yes 得分: {vqa_score('yes', gt):.2f}")    # 1.00
print(f"预测 no 得分: {vqa_score('no', gt):.2f}")      # 0.67
print(f"预测 maybe 得分: {vqa_score('maybe', gt):.2f}")  # 0.33
print(f"预测 no idea 得分: {vqa_score('no idea', gt):.2f}")  # 0.00`
                },
                {
                    lang: "python",
                    code: `import torch
import numpy as np
from collections import defaultdict

class VQAEvaluator:
    """完整的 VQA 评估工具"""
    def __init__(self):
        self.results = []
        self.question_type_scores = defaultdict(list)

    def add_result(self, question_id: int, question_type: str,
                   pred: str, gt_answers: list):
        score = self._compute_score(pred, gt_answers)
        self.results.append({
            "question_id": question_id,
            "question_type": question_type,
            "score": score
        })
        self.question_type_scores[question_type].append(score)

    def _compute_score(self, pred: str, gt: list) -> float:
        from collections import Counter
        counts = Counter(gt)
        return min(counts.get(pred, 0) / 3.0, 1.0)

    def overall_accuracy(self) -> float:
        """整体准确率"""
        return np.mean([r["score"] for r in self.results])

    def per_type_accuracy(self) -> dict:
        """每种问题类型的准确率"""
        return {
            qtype: np.mean(scores)
            for qtype, scores in self.question_type_scores.items()
        }

    def summary(self) -> str:
        """生成评估报告"""
        lines = [f"Overall Accuracy: {self.overall_accuracy():.2%}"]
        for qtype, acc in sorted(self.per_type_accuracy().items()):
            lines.append(f"  {qtype}: {acc:.2%}")
        return "\\n".join(lines)`
                }
            ],
            table: {
                headers: ["挑战", "描述", "典型表现", "缓解方案"],
                rows: [
                    ["语言偏置", "依赖问题统计规律而非图像", "yes/no 问题准确率达 87%+", "对抗性数据增强"],
                    ["幻觉", "回答图像中不存在的对象", "计数问题误差大", "视觉 grounding 约束"],
                    ["常识推理", "需要外部知识", "OK-VQA 准确率仅 ~45%", "知识图谱注入"],
                    ["组合泛化", "未见过的概念组合", "GQA 组合拆分测试差距 ~15%", "结构化推理训练"],
                    ["鲁棒性", "对抗扰动敏感", "图像噪声导致准确率下降 20%+", "对抗训练"],
                ],
            },
            mermaid: `graph LR
    A["VQA 评估"] --> B["VQA Score"]
    A --> C["Overall Accuracy"]
    A --> D["Per-type Accuracy"]
    B --> E["min(n/3, 1.0)"]
    D --> F["yes/no 类型"]
    D --> G["number 类型"]
    D --> H["other 类型"]
    F --> I["常见偏置"]
    G --> J["计数困难"]
    H --> K["开放答案"]
    I --> L["对抗性数据"]
    J --> M["结构化推理"]
    K --> N["生成式 VQA"]
    class I s1
    class E s0
    classDef s0 fill:#713f12
    classDef s1 fill:#7f1d1d`,
            tip: "评估时建议使用官方的 VQA Evaluation Toolkit，它已经实现了 score 计算和类型分组统计，可以直接从 vqa-tools 仓库获取",
            warning: "VQA Score 的 min(n/3, 1.0) 阈值意味着即使模型预测完全正确，如果 10 个标注者中只有 1 人写了这个答案，得分也只有 0.33——这不是模型的问题，而是标注本身的不一致性",
        },
        {
            title: "7. Transformers 实战：VQA 推理 Pipeline",
            body: `本节通过 HuggingFace Transformers 库构建一个完整的 VQA 推理 Pipeline。我们将使用 OFA（One For All）模型——一个统一的生成式多模态模型，能够处理 VQA、图像描述、视觉 grounding 等多种任务。OFA 的核心设计是将所有任务统一为序列到序列（Seq2Seq）的生成格式，使用 BART 架构同时处理视觉和文本输入。

推理流程包含四个步骤：加载预训练模型和处理器、准备图像和问题输入、模型前向传播生成答案、后处理得到最终结果。整个过程只需要不到 20 行代码，但背后依赖的是在数亿图文对上预训练学到的跨模态理解能力。

除了 OFA，我们还可以使用 BLIP-2 进行 VQA 推理。BLIP-2 的创新在于 Q-Former（Querying Transformer），它是一个轻量级的 Transformer 模块，负责从冻结的视觉编码器中提取与文本相关的特征，然后送入冻结的 LLM 生成答案。这种设计使得训练成本大幅降低，同时保留了 LLM 的强大生成能力。

实际部署时，需要考虑模型大小与推理延迟的平衡：OFA-large 有 6.5 亿参数，在单张 V100 上推理耗时约 100ms/样本；而 BLIP-2 使用 OPT-2.7B 作为 LLM，参数量更大但可以通过量化和 distillation 压缩到可部署的规模。`,
            code: [
                {
                    lang: "python",
                    code: `from transformers import OFAForConditionalGeneration, OFATokenizer
from PIL import Image
import torch

# 加载 OFA 模型（统一多模态模型）
model_name = "OFA-Sys/ofa-base"
model = OFAForConditionalGeneration.from_pretrained(model_name)
tokenizer = OFATokenizer.from_pretrained(model_name)
model.eval()

def vqa_inference(image_path: str, question: str,
                  num_beams: int = 4) -> str:
    """使用 OFA 进行 VQA 推理"""
    image = Image.open(image_path).convert("RGB")
    # OFA 使用特定的 prompt 格式
    prompt = f" what is the answer to the question '{question}'?"
    inputs = tokenizer(
        [prompt],
        images=image,
        return_tensors="pt"
    )
    # 生成答案
    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs["input_ids"],
            pixel_values=inputs["pixel_values"],
            max_new_tokens=10,
            num_beams=num_beams,
        )
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return answer.strip()

# 使用示例
result = vqa_inference("photo.jpg", "How many people are in the image?")
print(f"Answer: {result}")`
                },
                {
                    lang: "python",
                    code: `from transformers import Blip2ForConditionalGeneration, Blip2Processor
from PIL import Image
import torch

# 加载 BLIP-2 模型
processor = Blip2Processor.from_pretrained(
    "Salesforce/blip2-opt-2.7b"
)
model = Blip2ForConditionalGeneration.from_pretrained(
    "Salesforce/blip2-opt-2.7b",
    torch_dtype=torch.float16,  # 半精度推理
)
model.eval().cuda()

def blip2_vqa(image_path: str, question: str) -> str:
    """使用 BLIP-2 进行 VQA 推理"""
    image = Image.open(image_path).convert("RGB")
    # VQA prompt
    prompt = f"Question: {question} Answer:"
    inputs = processor(image, prompt, return_tensors="pt").to(
        "cuda", torch.float16
    )
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=20,
            num_beams=5,
            do_sample=False,
        )
    answer = processor.decode(outputs[0], skip_special_tokens=True)
    return answer.strip()

# 批量推理
questions = ["What is this?", "What color?", "How many?"]
answers = [blip2_vqa("photo.jpg", q) for q in questions]
for q, a in zip(questions, answers):
    print(f"Q: {q} | A: {a}")`
                }
            ],
            table: {
                headers: ["模型", "参数量", "GPU 显存", "推理延迟", "VQA 准确率"],
                rows: [
                    ["OFA-Base", "380M", "~4GB", "~50ms", "~72%"],
                    ["OFA-Large", "650M", "~6GB", "~100ms", "~76%"],
                    ["BLIP-2 (OPT-2.7B)", "3.5B", "~10GB", "~200ms", "~70%"],
                    ["BLIP-2 (OPT-6.7B)", "7.5B", "~16GB", "~350ms", "~72%"],
                    ["InstructBLIP (Vicuna-7B)", "8B", "~18GB", "~400ms", "~74%"],
                ],
            },
            mermaid: `graph LR
    A["输入图像"] --> B["BLIP-2 处理器"]
    C["输入问题"] --> B
    B --> D["视觉编码器 (ViT-g)"]
    B --> E["Q-Former"]
    D --> E
    C --> F["LLM (OPT/FlanT5)"]
    E --> F
    F --> G["生成答案"]
    G --> H["后处理"]
    H --> I["最终输出"]
    class G s2
    class F s1
    class D s0
    classDef s0 fill:#0c4a6e
    classDef s1 fill:#7c2d12
    classDef s2 fill:#14532d`,
            tip: "对于生产环境部署，建议使用 INT8 或 INT4 量化将 BLIP-2 的显存需求降低 50%-75%，同时保持几乎相同的准确率。HuggingFace 的 bitsandbytes 库可以直接使用 load_in_8bit=True 参数加载模型",
            warning: "生成式 VQA 模型的 max_new_tokens 设置过小会导致答案被截断，设置过大会引入无意义的后续文本。一般 VQA 答案 5-10 个 token 足够，建议 max_new_tokens 设为 20 并在后处理中按句号或换行截断",
        },
    ],
};
