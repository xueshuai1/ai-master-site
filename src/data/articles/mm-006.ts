import { Article } from '../knowledge';

export const article: Article = {
    id: "mm-006",
    title: "视频-语言多模态",
    category: "multimodal",
    tags: ["视频理解", "视频语言", "多模态"],
    summary: "从视频分类到视频问答，理解视频与语言的跨模态技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
      {
        title: "1. 视频表示学习：从 3D CNN 到 TimeSformer",
        body: `视频理解的首要挑战是如何对时空信息进行有效编码。传统的 2D CNN 只能捕获单帧的空间特征，无法建模帧间的时序动态关系。3D CNN 通过将卷积核扩展到时空三维，同时提取空间纹理和时间运动信息。C3D 和 I3D 是早期的代表性工作，其中 I3D 通过膨胀的 2D 卷积初始化 3D 卷积权重，利用 ImageNet 预训练大幅提升了视频分类精度。

然而，3D CNN 存在两个本质缺陷：一是感受野受限于卷积核大小，难以捕获长距离时间依赖；二是计算复杂度随帧数呈立方增长，处理长视频成本极高。TimeSformer 引入 Transformer 架构到视频领域，将时空注意力分解为时间注意力和空间注意力的乘积，显著降低了计算量。在相同的计算预算下，TimeSformer 能够处理更长的视频序列，在 Kinetics-400 数据集上取得了超越 3D ResNet 的效果。

后续的视频 Transformer 变体如 Video Swin Transformer 进一步引入了层次化窗口注意力机制，在多个视频理解基准上刷新了纪录。这些方法的核心思想是将视频的时空建模从局部卷积操作转移到全局注意力计算，使模型能够自适应地关注视频中关键的时间和空间区域。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
from einops import rearrange

class TimeSformerBlock(nn.Module):
    """TimeSformer 时空分解注意力块"""

    def __init__(self, dim: int, num_heads: int, num_frames: int,
                 num_patches: int, mlp_ratio: float = 4.0, dropout: float = 0.1):
        super().__init__()
        self.num_frames = num_frames
        self.num_patches = num_patches

        # 时间注意力：沿时间维度计算
        self.temporal_norm = nn.LayerNorm(dim)
        self.temporal_attn = nn.MultiheadAttention(dim, num_heads, dropout=dropout, batch_first=True)

        # 空间注意力：沿空间维度计算
        self.spatial_norm = nn.LayerNorm(dim)
        self.spatial_attn = nn.MultiheadAttention(dim, num_heads, dropout=dropout, batch_first=True)

        self.mlp_norm = nn.LayerNorm(dim)
        self.mlp = nn.Sequential(
            nn.Linear(dim, int(dim * mlp_ratio)),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(int(dim * mlp_ratio), dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [B, T * P, D] -> [B, T, P, D]
        B, _, D = x.shape
        x = x.reshape(B, self.num_frames, self.num_patches, D)

        # 时间注意力：固定空间位置，跨帧交互
        x_t = rearrange(x, "b t p d -> (b p) t d")
        x_t = x_t + self.temporal_attn(self.temporal_norm(x_t), x_t, x_t)[0]

        # 空间注意力：固定时间帧，空间位置交互
        x_t = rearrange(x_t, "(b p) t d -> (b t) p d", b=B, p=self.num_patches)
        x_t = x_t + self.spatial_attn(self.spatial_norm(x_t), x_t, x_t)[0]

        # MLP
        x_t = rearrange(x_t, "(b t) p d -> b t p d", b=B, p=self.num_patches)
        x_t = x_t.reshape(B, self.num_frames * self.num_patches, D)
        x_t = x_t + self.mlp(self.mlp_norm(x_t))
        return x_t`
          },
          {
            lang: "python",
            code: `# 3D CNN vs TimeSformer 计算量对比
import torch

def calc_3d_cnn_flops(input_size, kernel_size, channels_in, channels_out):
    """计算 3D 卷积的 FLOPs
    公式: T*H*W * Co * Ci * Kt * Kh * Kw
    """
    T, H, W = input_size
    Kt, Kh, Kw = kernel_size
    flops = T * H * W * channels_out * channels_in * Kt * Kh * Kw
    return flops

def calc_timesformer_flops(num_frames, num_patches, dim, num_heads):
    """计算 TimeSformer 单块的 FLOPs
    时间注意力: P * T^2 * D  (固定空间位置，跨 T 帧)
    空间注意力: T * P^2 * D  (固定时间帧，跨 P 空间块)
    相比全注意力 T^2 * P^2 * D，节省了大量计算
    """
    temporal_flops = num_patches * (num_frames ** 2) * dim
    spatial_flops = num_frames * (num_patches ** 2) * dim
    total = temporal_flops + spatial_flops
    full_attn_flops = (num_frames ** 2) * (num_patches ** 2) * dim
    savings = (1 - total / full_attn_flops) * 100
    return total, full_attn_flops, savings

# 对比：16帧、224x224 输入
flops_3d = calc_3d_cnn_flops((16, 224, 224), (3, 3, 3), 64, 128)
tf_total, tf_full, savings = calc_timesformer_flops(16, 196, 768, 12)
print(f"3D Conv FLOPs:  {flops_3d/1e9:.1f}G")
print(f"TimeSformer FLOPs: {tf_total/1e9:.1f}G (分解)")
print(f"Full Attention:    {tf_full/1e9:.1f}G")
print(f"节省: {savings:.1f}%")`
          }
        ],
        table: {
          headers: ["模型", "核心机制", "时空建模", "计算复杂度", "长视频能力"],
          rows: [
            ["C3D", "3D 卷积", "局部时空", "O(T*H*W*K^3*C^2)", "弱（固定感受野）"],
            ["I3D", "膨胀 3D 卷积", "局部+膨胀感受野", "O(T*H*W*K^3*C^2)", "中（可调节膨胀率）"],
            ["TimeSformer", "分解注意力", "全局时空", "O(T*P^2*T^2*D)", "强（全局注意力）"],
            ["Video Swin", "窗口移位注意力", "层次化局部+全局", "O(T*P*W^2*D)", "强（层次化窗口）"],
            ["X3D", "扩展 2D 网络", "时序扩展", "O(T*H*W*K^2*C^2)", "中（可扩展帧数）"]
          ]
        },
        mermaid: `graph TD
    A["输入视频\nT x H x W x 3"] --> B["Patch 切分\nT x (P x D)"]
    B --> C["时间位置编码"]
    B --> D["空间位置编码"]
    C --> E["时间自注意力\n跨帧交互"]
    D --> F["空间自注意力\n帧内交互"]
    E --> G["时序融合特征\nT x D"]
    F --> G
    G --> H["分类头\n全连接层"]
    H --> I["视频类别\n概率分布"]`,
        tip: "TimeSformer 的时空分解注意力将复杂度从 O(T^2 * P^2 * D) 降低到 O(T * P^2 * D + P * T^2 * D)，在 16 帧 196 个 patch 的场景下节省了约 96% 的计算量",
        warning: "3D CNN 的参数量随时间维度线性增长，当输入帧数超过 64 帧时 GPU 显存容易溢出。处理长视频时应使用 TimeSformer 或 Video Swin 等基于 Transformer 的方法"
      },
      {
        title: "2. 视频-文本预训练：VideoCLIP 与 CLIP4Clip",
        body: `视频-文本预训练的目标是学习跨模态的统一表示，使视频特征和文本特征能够在同一个嵌入空间中进行比较和检索。这一任务的核心挑战在于视频数据相比图像增加了时间维度，导致数据量、计算复杂度和标注成本都呈数量级增长。

VideoCLIP 借鉴了 CLIP 的成功经验，将对比学习扩展到视频-文本对。给定一批视频-文本对，模型通过 InfoNCE 损失函数拉近匹配对的嵌入表示，同时推远不匹配对。关键创新在于设计了零样本视频分类、时序定位和视频问答三种评估协议，证明了大规模视频-文本对比学习能够产生可迁移的通用视觉-语言表示。

CLIP4Clip 针对短视频检索场景进行了优化。与 VideoCLIP 使用全局 CLS token 不同，CLIP4Clip 提出了 Mean Pooling 策略，对所有帧的特征进行平均池化后再与文本嵌入计算相似度。这种方法更加鲁棒，因为单个 CLS token 可能无法充分表示视频中跨多个时刻的内容。CLIP4Clip 在 DiDeMo 和 ActivityNet Captions 等检索基准上取得了当时的最优结果。

预训练数据的质量直接决定了模型性能。HowTo100M 包含 136 万个视频-文本对，是早期最大的视频-文本数据集。WebVid-2M 和 YT-Temporal-1B 则进一步扩展了数据规模。这些数据集的构建方式通常是利用视频的标题、描述或自动生成的字幕作为文本监督信号。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VideoCLIPTrainer(nn.Module):
    """VideoCLIP 对比学习训练框架"""

    def __init__(self, video_encoder, text_encoder,
                 embed_dim: int = 512, temperature: float = 0.07):
        super().__init__()
        self.video_encoder = video_encoder
        self.text_encoder = text_encoder
        self.video_proj = nn.Linear(video_encoder.output_dim, embed_dim)
        self.text_proj = nn.Linear(text_encoder.output_dim, embed_dim)
        self.logit_scale = nn.Parameter(torch.ones([]) * np.log(1 / temperature))

    def forward(self, videos: torch.Tensor, texts: torch.Tensor,
                text_mask: torch.Tensor) -> dict:
        # 编码
        video_feat = self.video_encoder(videos)  # [B, T, D_v]
        text_feat = self.text_encoder(texts, text_mask)  # [B, D_t]

        # 池化视频特征：对帧做平均池化
        video_feat = video_feat.mean(dim=1)  # [B, D_v]

        # 投影到统一嵌入空间
        v_emb = F.normalize(self.video_proj(video_feat), dim=-1)
        t_emb = F.normalize(self.text_proj(text_feat), dim=-1)

        # 相似度矩阵
        logit_scale = self.logit_scale.exp()
        logits = logit_scale * v_emb @ t_emb.T

        # InfoNCE 双向损失
        labels = torch.arange(logits.size(0), device=logits.device)
        loss_v2t = F.cross_entropy(logits, labels)
        loss_t2v = F.cross_entropy(logits.T, labels)
        loss = (loss_v2t + loss_t2v) / 2
        return {"loss": loss, "logits": logits}`
          },
          {
            lang: "python",
            code: `# CLIP4Clip 的 Mean Pooling vs CLS Pooling 对比
import torch
import torch.nn.functional as F

def cls_pooling(frame_features: torch.Tensor) -> torch.Tensor:
    """使用 CLS token（第一帧位置）作为视频表示"""
    return frame_features[:, 0, :]  # [B, D]

def mean_pooling(frame_features: torch.Tensor,
                 attention_mask: torch.Tensor = None) -> torch.Tensor:
    """对所有帧做平均池化（CLIP4Clip 方法）
    attention_mask: [B, T] 标记有效帧
    """
    if attention_mask is not None:
        # 只平均有效帧
        mask = attention_mask.unsqueeze(-1).float()  # [B, T, 1]
        summed = (frame_features * mask).sum(dim=1)  # [B, D]
        counts = mask.sum(dim=1).clamp(min=1e-9)  # [B, 1]
        return summed / counts
    return frame_features.mean(dim=1)  # [B, D]

def max_pooling(frame_features: torch.Tensor) -> torch.Tensor:
    """对所有帧做最大池化（捕获关键帧信息）"""
    return frame_features.max(dim=1)[0]  # [B, D]

# 实验比较三种池化策略
frame_features = torch.randn(32, 64, 512)  # 32个样本，每段64帧
mask = torch.ones(32, 64)
# 模拟：后20帧为填充帧
mask[:, 44:] = 0

cls_emb = cls_pooling(frame_features)
mean_emb = mean_pooling(frame_features, mask)
max_emb = max_pooling(frame_features)

print(f"CLS pooling:  {cls_emb.shape}, 取第 0 帧")
print(f"Mean pooling: {mean_emb.shape}, 平均有效 44 帧")
print(f"Max pooling:  {max_emb.shape}, 取各维度最大值")`
          }
        ],
        table: {
          headers: ["模型", "视频编码", "文本编码", "训练目标", "数据规模"],
          rows: [
            ["VideoCLIP", "ViViT / TimeSformer", "BERT", "对比学习", "WebVid-2M (250万对)"],
            ["CLIP4Clip", "CLIP 帧编码器", "CLIP 文本编码器", "对比学习 + 相似度学习", "HowTo100M (136万对)"],
            ["FrozenBiLM", "冻结的图像编码器", "双向语言模型", "文本生成辅助", "WebVid-2M"],
            ["X-CLIP", "3D 跨帧注意力", "BERT", "跨帧对比学习", "WebVid-2M + HowTo100M"],
            ["InternVideo", "时序压缩 + 空间编码", "BERT", "对比 + 生成联合训练", "大规模混合数据集"]
          ]
        },
        mermaid: `graph LR
    A["视频\nT 帧图像"] --> B["视觉编码器\nCLIP/TimeSformer"]
    C["文本\n标题/描述"] --> D["文本编码器\nBERT/CLIP Text"]
    B --> E["视频嵌入\nV [B, D]"]
    D --> F["文本嵌入\nT [B, D]"]
    E --> G["相似度矩阵\nS = V @ T.T"]
    F --> G
    G --> H["InfoNCE 损失\n双向对比"]
    H --> I["统一的\n视频-文本空间"]`,
        tip: "CLIP4Clip 使用预训练的 CLIP 图像编码器逐帧提取特征再做 Mean Pooling，这种方式无需额外训练视频编码器，大大降低了计算成本。对于资源有限的场景是首选方案",
        warning: "逐帧提取 CLIP 特征的方法忽略了帧间时序关系，对于依赖动作顺序理解的任务（如时序定位）效果有限。需要考虑使用时序编码器增强时间建模能力"
      },
      {
        title: "3. 视频问答：从简单分类到推理式 VideoQA",
        body: `视频问答要求模型同时理解视频内容和自然语言问题，并生成准确的答案。这是视频-语言多模态领域最具挑战性的任务之一，因为它不仅需要感知视觉内容，还需要理解问题中的语义意图，并进行多步推理才能得出答案。

早期的 VideoQA 方法采用两阶段架构：首先独立编码视频和文本，然后通过注意力机制或拼接操作融合两个模态的特征，最后通过分类器生成答案。这类方法在 MSRVTT-QA 和 ActivityNet-QA 等简单数据集上取得了不错的效果，但难以处理需要时序推理和常识推理的复杂问题。

近年来的突破性工作将大型语言模型引入 VideoQA。Video-LLaVA 和 Video-ChatGPT 将视频帧编码为视觉 token，直接注入到语言模型的词嵌入空间中，使语言模型能够像处理文本 token 一样处理视觉信息。这种方法的关键在于视觉-语言对齐投影层，它将视觉特征映射到与文本嵌入相同的空间中。通过指令微调，模型能够理解诸如这个人在做什么和这个动作的原因是什么等复杂问题。

VideoQA 的评估通常采用精确匹配准确率（Exact Match Accuracy）和 BLEU 分数。对于多选题形式的 QA 任务，准确率是主要指标；对于生成式 QA，还需要评估生成答案的流畅性和相关性。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
from transformers import CLIPVisionModel, LlamaForCausalLM

class VideoLLaVA(nn.Module):
    """Video-LLaVA: 将视频 token 注入大语言模型"""

    def __init__(self, vision_model_name: str, llm_name: str,
                 num_frames: int = 8):
        super().__init__()
        self.num_frames = num_frames
        self.vision_model = CLIPVisionModel.from_pretrained(vision_model_name)
        self.llm = LlamaForCausalLM.from_pretrained(llm_name)

        # 冻结大语言模型和视觉编码器
        for param in self.vision_model.parameters():
            param.requires_grad = False
        for param in self.llm.parameters():
            param.requires_grad = False

        # 视觉-语言对齐投影层
        hidden_dim = self.llm.config.hidden_size
        vision_dim = self.vision_model.config.hidden_size
        self.vision_proj = nn.Sequential(
            nn.Linear(vision_dim, hidden_dim),
            nn.GELU(),
            nn.Linear(hidden_dim, hidden_dim),
        )

    def encode_video(self, frames: torch.Tensor) -> torch.Tensor:
        # frames: [B, T, C, H, W]
        B, T, C, H, W = frames.shape
        frames = frames.view(B * T, C, H, W)
        # 提取 patch 特征: [B*T, N, D_v]
        vision_out = self.vision_model(frames, output_hidden_states=True)
        features = vision_out.hidden_states[-1][:, 1:, :]  # 去掉 CLS token
        features = features.view(B, T, -1, vision_out.hidden_states[-1].size(-1))
        # 平均池化时间维度
        features = features.mean(dim=1)  # [B, N, D_v]
        return self.vision_proj(features)  # [B, N, D_llm]

    def forward(self, frames, input_ids, attention_mask, labels):
        video_tokens = self.encode_video(frames)  # [B, N_v, D]
        # 拼接视频 token 和文本 token 的嵌入
        text_embeds = self.llm.get_input_embeddings()(input_ids)
        combined = torch.cat([video_tokens, text_embeds], dim=1)
        # 更新 attention mask
        video_mask = torch.ones(frames.size(0), video_tokens.size(1),
                                device=attention_mask.device, dtype=attention_mask.dtype)
        full_mask = torch.cat([video_mask, attention_mask], dim=1)
        return self.llm(inputs_embeds=combined, attention_mask=full_mask, labels=labels)`
          },
          {
            lang: "python",
            code: `# VideoQA 评估指标计算
from collections import Counter
import re

def exact_match_accuracy(predictions: list[str],
                         ground_truths: list[list[str]]) -> float:
    """精确匹配准确率
    每个样本可能有多个可接受的标准答案
    """
    def normalize(text: str) -> str:
        text = text.lower().strip()
        text = re.sub(r'[^a-z0-9\s]', '', text)
        return text.strip()

    correct = 0
    for pred, truths in zip(predictions, ground_truths):
        pred_norm = normalize(pred)
        for truth in truths:
            if pred_norm == normalize(truth):
                correct += 1
                break
    return correct / len(predictions)

def open_ended_accuracy(pred: str, answers: list[str]) -> float:
    """开放式问题准确率（类似 VQA v2 的评分）
    答案出现 3 次或以上计 1 分，否则计 (出现次数 * 0.3)
    """
    pred_norm = pred.lower().strip()
    answer_counts = Counter(a.lower().strip() for a in answers)
    if answer_counts[pred_norm] >= 3:
        return 1.0
    return min(answer_counts[pred_norm] * 0.3, 1.0)

# 示例评估
predictions = ["playing basketball", "cooking", "dancing"]
ground_truths = [
    ["playing basketball", "basketball"],
    ["cooking", "preparing food"],
    ["dancing", "doing a dance"]
]
acc = exact_match_accuracy(predictions, ground_truths)
print(f"Exact Match Accuracy: {acc:.2%}")`
          }
        ],
        table: {
          headers: ["数据集", "问题类型", "答案形式", "视频数量", "评估指标"],
          rows: [
            ["MSRVTT-QA", "感知类", "多选/生成", "10K 视频", "准确率"],
            ["ActivityNet-QA", "时序推理", "生成式", "10K 视频", "准确率"],
            ["EgoSchema", "自我中心推理", "多选", "5K 视频", "准确率"],
            ["NExT-QA", "因果推理", "多选+解释", "5.9K 视频", "准确率"],
            ["Video-MME", "综合能力", "多选", "900 视频", "准确率"]
          ]
        },
        mermaid: `graph LR
    A["视频\nT 帧"] --> B["视觉编码器\nCLIP/ViT"]
    C["问题\n自然语言"] --> D["文本编码器\nLLM"]
    B --> E["视觉 token 序列\n[N_v, D]"]
    D --> F["文本 token 嵌入\n[N_t, D]"]
    E --> G["拼接序列\n[video_tokens + text_tokens]"]
    F --> G
    G --> H["大语言模型\n因果语言建模"]
    H --> I["生成的答案\n自然语言"]`,
        tip: "在 VideoQA 中，视觉 token 的数量直接影响计算成本。对于 8 帧输入，每帧 256 个 token 会产生 2048 个视觉 token。可以通过 token 剪枝（如 Token Merging）将 token 数量减少 50% 而不显著降低准确率",
        warning: "直接拼接视频 token 和文本 token 会超出大语言模型的上下文长度限制。对于长视频（超过 64 帧），必须使用时序压缩或分层采样策略减少视觉 token 数量"
      },
      {
        title: "4. 视频描述生成：Video Captioning",
        body: `视频描述生成是视频-语言多模态的核心生成任务之一，要求模型将视频内容自动转化为流畅的自然语言描述。这不仅仅是将帧级信息简单拼接，而是需要理解视频中的主体、动作、时序关系以及场景上下文，然后组织成连贯的文本。

传统的基于编码器-解码器架构的方法使用 3D CNN 或 LSTM 对视频进行编码，然后用语言模型（如 LSTM）逐词生成描述。这种方法生成的描述往往过于简单和模板化，难以表达复杂的多动作场景。例如，对于包含多个人物交互的视频，LSTM 解码器可能只能生成一个人在房间里这样的简单描述，而忽略了具体的互动关系和时序变化。

基于 Transformer 的方法通过自注意力机制显著提升了描述质量。VideoBERT 首次将自注意力应用于视频-文本联合建模，而后续的工作如 MMT（多模态 Transformer）和 CoCa 进一步改进了跨模态对齐。最新的方法结合了指令微调的大语言模型，通过视频 token 和指令前缀引导语言模型生成更丰富和准确的描述。

评估视频描述生成的常用指标包括 BLEU、METEOR、ROUGE-L 和 CIDEr。其中 CIDEr 是专门为图像/视频描述设计的指标，通过对 n-gram 进行 TF-IDF 加权，更好地衡量生成描述与参考描述之间的一致性。SPICE 则从语义解析的角度评估描述中的实体、属性和关系。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
from transformers import GPT2LMHeadModel

class VideoCaptioner(nn.Module):
    """基于预训练语言模型的视频描述生成器"""

    def __init__(self, vision_encoder, llm_model: str = "gpt2"):
        super().__init__()
        self.vision_encoder = vision_encoder
        self.llm = GPT2LMHeadModel.from_pretrained(llm_model)
        llm_dim = self.llm.config.hidden_size

        # 多层投影将视觉特征映射到语言空间
        vision_dim = vision_encoder.feature_dim
        self.vision_proj = nn.Sequential(
            nn.Linear(vision_dim, llm_dim),
            nn.LayerNorm(llm_dim),
            nn.GELU(),
            nn.Linear(llm_dim, llm_dim),
        )
        # 特殊 token 表示视频输入的起始
        self.video_token_id = self.llm.config.vocab_size  # 新增 token

    def generate_caption(self, video_frames: torch.Tensor,
                        max_length: int = 50, temperature: float = 0.7) -> str:
        # 编码视频: [B, T, C, H, W] -> [B, N, D]
        video_features = self.vision_encoder(video_frames)
        video_tokens = self.vision_proj(video_features)  # [B, N, D_llm]

        # 生成起始 token: [BOS]
        batch_size = video_tokens.size(0)
        decoder_input = torch.full((batch_size, 1),
                                   self.llm.config.bos_token_id,
                                   device=video_tokens.device)

        # 将视频 token 作为前缀输入
        inputs_embeds = torch.cat([video_tokens, self.llm.wte(decoder_input)], dim=1)

        # 自回归生成
        output = self.llm.generate(
            inputs_embeds=inputs_embeds,
            max_length=video_tokens.size(1) + max_length,
            temperature=temperature,
            do_sample=True,
            pad_token_id=self.llm.config.eos_token_id,
        )
        # 解码为文本（跳过视频 token 部分）
        text_tokens = output[:, video_tokens.size(1):]
        return self.llm.tokenizer.decode(text_tokens[0], skip_special_tokens=True)`
          },
          {
            lang: "python",
            code: `# 评估指标：CIDEr 实现
import numpy as np
from collections import Counter
import math

class CIDErScorer:
    """CIDEr (Consensus-based Image Description Evaluation)
    使用 TF-IDF 加权 n-gram 匹配度评估描述质量
    """

    def __init__(self, n: int = 4, sigma: float = 6.0):
        self.n = n
        self.sigma = sigma
        self.document_frequency = Counter()  # DF: 每个 n-gram 出现在多少文档中
        self.num_documents = 0

    def fit(self, references: list[list[str]]):
        """从参考描述中学习 IDF 权重
        references: 每个样本的参考描述列表
        """
        self.num_documents = len(references)
        for refs in references:
            # 同一样本的多个参考视为一个文档
            seen = set()
            for ref in refs:
                for ngram in self._extract_ngrams(ref):
                    if ngram not in seen:
                        self.document_frequency[ngram] += 1
                        seen.add(ngram)

    def _extract_ngrams(self, sentence: str) -> list[str]:
        words = sentence.lower().split()
        ngrams = []
        for order in range(1, self.n + 1):
            for i in range(len(words) - order + 1):
                ngrams.append(" ".join(words[i:i + order]))
        return ngrams

    def score(self, hypothesis: str, references: list[str]) -> float:
        hyp_ngrams = Counter(self._extract_ngrams(hypothesis))
        if not hyp_ngrams:
            return 0.0

        score = 0.0
        for n in range(1, self.n + 1):
            # 计算当前 order 的 CIDEr 分数
            cand_ngrams = {k: v for k, v in hyp_ngrams.items() if k.count(" ") == n - 1}
            ref_counts = []
            for ref in references:
                ref_ngrams = Counter(self._extract_ngrams(ref))
                ref_counts.append({k: v for k, v in ref_ngrams.items() if k.count(" ") == n - 1})

            # TF-IDF 加权
            ngram_score = 0.0
            for ngram, count in cand_ngrams.items():
                tf = count
                idf = math.log(self.num_documents / (1 + self.document_frequency.get(ngram, 0)))
                # 与参考的共识
                max_ref = max(rc.get(ngram, 0) for rc in ref_counts)
                ngram_score += tf * idf * min(count, max_ref) * idf
            score += ngram_score

        return score / self.n

# 使用示例
scorer = CIDErScorer(n=4)
refs = [["a person is cooking in the kitchen"], ["someone prepares food"]]
scorer.fit(refs)
score = scorer.score("a person is cooking in a kitchen", refs[0])
print(f"CIDEr: {score:.4f}")`
          }
        ],
        table: {
          headers: ["方法", "视频编码", "语言解码", "MSVD CIDEr", "MSR-VTT CIDEr"],
          rows: [
            ["S2VT (RNN)", "3D CNN + RNN", "LSTM 解码器", "0.82", "不适用"],
            ["Transformer", "I3D", "Transformer 解码器", "1.06", "0.49"],
            ["VideoCoCa", "ViT + 时序编码器", "CoCa 语言模型", "1.24", "0.63"],
            ["Video-LLaVA", "CLIP 帧编码", "Vicuna LLM", "1.31", "0.71"],
            ["VideoChat2", "Q-Former 压缩", "LLaMA 2", "1.38", "0.74"]
          ]
        },
        mermaid: `graph LR
    A["视频\nT 帧"] --> B["视觉特征提取\nViT/CLIP"]
    B --> C["时序建模\nTransformer"]
    C --> D["视觉-语言投影\nMLP 层"]
    E["描述生成"] --> F["语言模型\nGPT/LLaMA"]
    D --> F
    F --> G["自回归解码\n逐词生成"]
    G --> H["自然语言描述\n句子"]`,
        tip: "使用 Q-Former 或 Perceiver 等查询式压缩器将视觉 token 数量从 N 压缩到 Q（通常 Q=32 或 64），可以显著降低大语言模型的推理延迟，同时保持描述质量",
        warning: "BLEU 和 ROUGE 指标对词汇重叠敏感，但可能忽略语义等价的不同表达。例如 the boy runs fast 和 a fast running boy 表达相同意思但 BLEU 分数很低。应同时参考 CIDEr 和 SPICE 等语义指标"
      },
      {
        title: "5. 时序定位：Moment Retrieval",
        body: `时序定位（Moment Retrieval / Temporal Grounding）是视频-语言多模态中最具挑战性的理解任务之一。给定一个视频和一个自然语言查询，模型需要精确找出视频中与查询描述对应的时间段。这要求模型同时理解语言的细粒度语义和视频中的时序结构，并在两者的时间线上进行精确对齐。

传统的时序定位方法将问题视为在预定义的候选时间段中进行选择。模型首先密集采样大量的候选片段（如所有可能的起始-结束时间对），然后计算每个候选片段与文本查询的相似度，最后选择得分最高的片段作为预测结果。这种密集采样的方法计算效率低，且候选片段的质量直接影响最终效果。

近年来的端到端方法（如 2D-TAN、VSLNet 和 Moment-DETR）避免了候选片段的显式采样，直接在视频的每个时间步上预测与查询的相关性分数。Moment-DETR 将 Transformer 的检测头（Detection Transformer, DETR）思想引入时序定位，使用一组可学习的时刻查询（Moment Queries）与视频-文本交叉注意力进行交互，直接输出预测的起止时间。这种方法无需后处理（如非极大值抑制），端到端优化更加简洁高效。

评估时序定位主要使用 Recall@1 和 mIoU。Recall@1 衡量模型预测的时间段与真实标注的交并比超过阈值的比例。常用的 IoU 阈值为 0.3、0.5 和 0.7，分别对应宽松、中等和严格的定位精度要求。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
from torch.nn import functional as F

class MomentDETR(nn.Module):
    """基于 DETR 的时序定位模型"""

    def __init__(self, d_model: int = 256, num_moments: int = 10,
                 num_encoder_layers: int = 4, num_decoder_layers: int = 4,
                 nhead: int = 8):
        super().__init__()
        self.num_moments = num_moments

        # 视频-文本交叉注意力编码器
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=nhead, dim_feedforward=d_model * 4,
            batch_first=True)
        self.encoder = nn.TransformerEncoder(encoder_layer, num_encoder_layers)

        # 解码器：使用可学习查询预测时间段
        decoder_layer = nn.TransformerDecoderLayer(
            d_model=d_model, nhead=nhead, dim_feedforward=d_model * 4,
            batch_first=True)
        self.decoder = nn.TransformerDecoder(decoder_layer, num_decoder_layers)

        # 可学习的时刻查询
        self.moment_queries = nn.Parameter(torch.randn(num_moments, d_model))

        # 预测头：起止时间和 IoU 分数
        self.start_head = nn.Linear(d_model, 1)
        self.end_head = nn.Linear(d_model, 1)
        self.iou_head = nn.Linear(d_model, 1)

        # 位置编码
        self.pos_embed = nn.Parameter(torch.randn(1, 1, d_model))

    def forward(self, video_features: torch.Tensor,
                text_features: torch.Tensor) -> dict:
        B, T, D_v = video_features.shape

        # 融合视频和文本特征
        video_fused = video_features + text_features.mean(dim=1, keepdim=True)
        video_fused = video_fused + self.pos_embed[:, :T, :]

        # 编码
        memory = self.encoder(video_fused)

        # 解码：可学习查询与记忆交互
        queries = self.moment_queries.unsqueeze(0).expand(B, -1, -1)
        decoder_out = self.decoder(queries, memory)

        # 预测
        start_logits = self.start_head(decoder_out).squeeze(-1)  # [B, Q]
        end_logits = self.end_head(decoder_out).squeeze(-1)  # [B, Q]
        iou_scores = self.iou_head(decoder_out).squeeze(-1)  # [B, Q]

        return {
            "start_logits": start_logits,
            "end_logits": end_logits,
            "iou_scores": iou_scores,
            "queries": decoder_out
        }`
          },
          {
            lang: "python",
            code: `# 时序 IoU 计算和评估指标
import numpy as np

def temporal_iou(span_a: tuple, span_b: tuple) -> float:
    """计算两个时间段的交并比"""
    start_a, end_a = span_a
    start_b, end_b = span_b
    intersection_start = max(start_a, start_b)
    intersection_end = min(end_a, end_b)
    if intersection_start >= intersection_end:
        return 0.0
    intersection = intersection_end - intersection_start
    union = (end_a - start_a) + (end_b - start_b) - intersection
    return intersection / union if union > 0 else 0.0

def recall_at_iou(predictions: list[tuple],
                  ground_truths: list[tuple],
                  iou_threshold: float = 0.5) -> float:
    """计算 Recall@IoU
    predictions: 预测的起止时间列表
    ground_truths: 真实的起止时间列表
    """
    assert len(predictions) == len(ground_truths)
    correct = 0
    for pred, gt in zip(predictions, ground_truths):
        if temporal_iou(pred, gt) >= iou_threshold:
            correct += 1
    return correct / len(predictions)

def mean_iou(predictions: list[tuple],
             ground_truths: list[tuple]) -> float:
    """计算平均 IoU"""
    ious = [temporal_iou(p, g) for p, g in zip(predictions, ground_truths)]
    return np.mean(ious)

# 示例
predictions = [(2.5, 8.3), (15.0, 22.1), (30.0, 35.5)]
ground_truths = [(3.0, 8.0), (14.5, 21.0), (28.0, 36.0)]
for thresh in [0.3, 0.5, 0.7]:
    r = recall_at_iou(predictions, ground_truths, thresh)
    print(f"Recall@{thresh}: {r:.2%}")
print(f"Mean IoU: {mean_iou(predictions, ground_truths):.4f}")`
          }
        ],
        table: {
          headers: ["模型", "核心方法", "候选生成", "Charades-STA R1@0.5", "ActivityNet R1@0.5"],
          rows: [
            ["2D-TAN", "时序注意力网络", "密集候选", "47.3%", "28.6%"],
            ["VSLNet", "边界感知网络", "边界预测", "52.1%", "32.4%"],
            ["Moment-DETR", "可学习查询+DETR", "无候选（直接预测）", "54.8%", "35.2%"],
            ["UVCOM", "不确定性建模", "密集候选", "56.2%", "36.8%"],
            ["QD-DETR", "查询-文档注意力", "无候选", "58.1%", "38.5%"]
          ]
        },
        mermaid: `graph LR
    A["视频\nT 个时间步"] --> B["视觉编码\nCNN/Transformer"]
    C["文本查询\n句子"] --> D["文本编码\nBERT"]
    B --> E["时序特征序列\n[T, D]"]
    D --> F["查询向量\n[1, D]"]
    E --> G["交叉注意力融合"]
    F --> G
    G --> H["可学习时刻查询\n[Q, D]"]
    H --> I["预测头\nStart/End/IoU"]
    I --> J["时间段预测\n(起始, 结束)"]`,
        tip: "Moment-DETR 的可学习查询数量 Q 决定了模型能同时预测的最大时间段数。对于单时间段定位任务，设置 Q=10 是一个经验性的合理值，既保证了足够的候选查询，又不会引入过多的冗余计算",
        warning: "时序定位对视频帧率的敏感度很高。如果训练时使用 30fps 的视频而推理时使用 24fps，预测的时间段会产生系统性偏移。实际部署时必须确保帧率一致或在预处理阶段统一重采样"
      },
      {
        title: "6. 多模态大模型中的视频模态",
        body: `随着多模态大语言模型（MLLM）的快速发展，视频作为最具挑战性的输入模态之一，正被越来越多地整合到大模型架构中。与图像不同，视频包含丰富的时间动态信息，帧数从几十到上千不等，这对模型的上下文窗口和计算资源提出了严峻挑战。

将视频整合到大语言模型中的核心问题是 token 效率。一段 30 秒的视频如果以每秒 2 帧采样，就有 60 帧。每帧经过 ViT 编码后产生 256 个视觉 token，总计 15360 个 token。这远超大多数语言模型的上下文窗口限制。当前的解决方案主要分为三类：均匀帧采样（Uniform Sampling）、关键帧选择（Keyframe Selection）、以及特征压缩（Feature Compression）。

均匀帧采样是最简单的方法，但容易遗漏关键事件。关键帧选择通过计算帧间差异或注意力分数来识别信息量最大的帧。特征压缩则使用 Q-Former、Perceiver Resampler 等模块将大量视觉 token 压缩为少量紧凑的视觉摘要。例如，LLaVA-Video 使用 128 个查询 token 来压缩任意长度的视频表示，无论输入多少帧，最终输入语言模型的视觉 token 数量是固定的。

最新的多模态大模型如 Qwen2-VL、InternVL 和 Gemini 1.5 都已经支持视频理解。Gemini 1.5 的百万级上下文窗口使其能够直接处理长达一小时的视频而不需要压缩，代表了另一个发展方向。这些模型在视频问答、时序定位和描述生成等任务上展现出了接近人类水平的性能。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn

class QFormerVideoCompressor(nn.Module):
    """使用 Q-Former 压缩视频特征"""

    def __init__(self, vision_dim: int, llm_dim: int,
                 num_queries: int = 128, num_layers: int = 3,
                 num_heads: int = 8):
        super().__init__()
        self.num_queries = num_queries

        # 可学习的查询向量
        self.queries = nn.Parameter(torch.randn(num_queries, llm_dim))

        # 视觉特征投影
        self.vision_proj = nn.Linear(vision_dim, llm_dim)

        # Q-Former 编码器
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=llm_dim, nhead=num_heads,
            dim_feedforward=llm_dim * 4,
            batch_first=True)
        self.qformer = nn.TransformerEncoder(encoder_layer, num_layers)

        # LayerNorm
        self.norm = nn.LayerNorm(llm_dim)

    def forward(self, video_features: torch.Tensor,
                text_features: torch.Tensor = None) -> torch.Tensor:
        """
        video_features: [B, T, N, D_vision]  (T帧，每帧N个patch)
        text_features:  [B, L, D_text] (可选的文本引导)
        返回: [B, num_queries, D_llm]
        """
        B, T, N, D = video_features.shape

        # 展平时空维度: [B, T*N, D]
        video_flat = video_features.reshape(B, T * N, D)
        video_tokens = self.vision_proj(video_flat)  # [B, T*N, D_llm]

        # 扩展查询
        queries = self.queries.unsqueeze(0).expand(B, -1, -1)

        # 拼接查询和视频token，通过 Transformer 进行交叉注意力
        # 查询在前，视频token在后
        concat = torch.cat([queries, video_tokens], dim=1)

        # 通过 Q-Former 处理
        output = self.qformer(concat)

        # 提取查询部分的结果
        compressed = output[:, :self.num_queries, :]
        return self.norm(compressed)`
          },
          {
            lang: "python",
            code: `# 视频 token 压缩策略对比
import torch
import time

def benchmark_compression_methods(num_frames: int = 64,
                                   patches_per_frame: int = 256,
                                   dim: int = 1024):
    """对比不同压缩策略的 token 数量和计算时间"""
    video_features = torch.randn(1, num_frames, patches_per_frame, dim)
    total_tokens = num_frames * patches_per_frame

    strategies = {
        "无压缩": {
            "output_tokens": total_tokens,
            "compression_ratio": 1.0,
        },
        "均匀采样(8帧)": {
            "output_tokens": 8 * patches_per_frame,
            "compression_ratio": total_tokens / (8 * patches_per_frame),
        },
        "Q-Former(128查询)": {
            "output_tokens": 128,
            "compression_ratio": total_tokens / 128,
        },
        "Perceiver(64查询)": {
            "output_tokens": 64,
            "compression_ratio": total_tokens / 64,
        },
        "时空池化(4x4)": {
            "output_tokens": (num_frames // 4) * (patches_per_frame // 4),
            "compression_ratio": total_tokens / ((num_frames // 4) * (patches_per_frame // 4)),
        },
    }

    print(f"输入: {num_frames} 帧 x {patches_per_frame} patch = {total_tokens:,} token")
    print("-" * 60)
    for name, info in strategies.items():
        print(f"{name:25s} | {info['output_tokens']:6,} token | "
              f"压缩比: {info['compression_ratio']:.1f}x")

benchmark_compression_methods(64, 256, 1024)`
          }
        ],
        table: {
          headers: ["模型", "视觉编码器", "压缩策略", "上下文窗口", "最大视频长度"],
          rows: [
            ["LLaVA-Video", "CLIP ViT", "Q-Former (128 queries)", "4K tokens", "~3 分钟"],
            ["Qwen2-VL", "ViT + Naive ViT", "动态分辨率 + 合并", "32K tokens", "~20 分钟"],
            ["InternVL 2", "InternViT-6B", "Pixel Shuffle + 合并", "8K tokens", "~5 分钟"],
            ["Gemini 1.5", "多模态编码器", "原生处理（无压缩）", "1M tokens", "~90 分钟"],
            ["Video-LLaMA 2", "EVA-CLIP", "Q-Former + 时序合并", "4K tokens", "~3 分钟"]
          ]
        },
        mermaid: `graph TD
    A["原始视频\n任意时长"] --> B["均匀采样\nN 帧"]
    B --> C["视觉编码\nViT/CLIP"]
    C --> D["Token 压缩\nQ-Former/Perceiver"]
    D --> E["紧凑视觉表示\n[Q, D]"]
    F["指令/问题\n文本"] --> G["文本编码\nTokenizer"]
    G --> H["拼接\n[visual + text tokens]"]
    E --> H
    H --> I["大语言模型\nLLaMA/Qwen"]
    I --> J["多模态理解\n输出响应"]`,
        tip: "选择压缩策略时应考虑任务类型。视频描述生成和简单问答可以使用较强的压缩（Q-Former 64-128 queries），而时序定位需要保留时间信息，应该使用帧级别的表示（如均匀采样 + 时间位置编码）",
        warning: "过强的 token 压缩会导致时间信息丢失。如果压缩后的 token 数量少于视频中的关键事件数量，模型将无法区分视频中发生的不同事件。对于包含 5 个以上独立事件的视频，建议保留至少 256 个视觉 token"
      },
      {
        title: "7. 实战：VideoCLIP 推理与视频检索",
        body: `本节通过一个完整的实战案例，展示如何使用 VideoCLIP 模型进行零样本视频检索。我们将加载预训练的 VideoCLIP 模型，对一组视频片段和文本查询进行编码，然后在统一的嵌入空间中进行相似度匹配和检索。

VideoCLIP 的核心推理流程非常简洁：首先将视频切分为帧，使用视觉编码器逐帧提取特征并对时间维度做平均池化，得到视频的全局嵌入向量。同时，使用文本编码器将查询文本编码为文本嵌入向量。两个向量经过投影层映射到相同的维度空间后，通过余弦相似度进行比较。

实战中需要注意几个关键点。第一，视频帧的预处理必须与训练时保持一致，包括分辨率、归一化均值和方差。第二，对于不同长度的视频，应该使用固定数量的帧（如 8 帧或 16 帧）进行均匀采样，确保嵌入表示的一致性。第三，文本查询应该去除多余的空格和标点符号，保持简洁。

我们将构建一个完整的视频检索系统，支持输入自然语言查询，从视频库中检索最相关的片段。这个系统可以应用于视频搜索引擎、智能视频摘要和内容审核等多种场景。通过修改文本查询，同一个模型可以适应完全不同的检索任务，这体现了对比学习预训练的强大泛化能力。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torchvision.transforms as transforms
from PIL import Image
import numpy as np

class VideoCLIPInference:
    """VideoCLIP 零样本视频检索推理"""

    def __init__(self, model, preprocess):
        self.model = model
        self.model.eval()
        self.preprocess = preprocess
        # 视频预处理：与图像相同的变换
        self.video_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])

    def encode_video(self, frames: list[Image.Image],
                     num_frames: int = 8) -> torch.Tensor:
        """将视频帧编码为统一的嵌入向量"""
        # 均匀采样 num_frames 帧
        if len(frames) < num_frames:
            indices = list(range(len(frames)))
        else:
            indices = np.linspace(0, len(frames) - 1, num_frames, dtype=int)

        selected_frames = [frames[i] for i in indices]
        processed = torch.stack([self.preprocess(f) for f in selected_frames])
        processed = processed.unsqueeze(0)  # [1, T, C, H, W]

        with torch.no_grad():
            video_features = self.model.encode_video(processed)
            video_features = video_features / video_features.norm(dim=-1, keepdim=True)
        return video_features

    def encode_text(self, texts: list[str]) -> torch.Tensor:
        """将文本编码为嵌入向量"""
        with torch.no_grad():
            text_features = self.model.encode_text(texts)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        return text_features

    def search(self, query: str, video_database: dict[str, torch.Tensor],
               top_k: int = 5) -> list[tuple[str, float]]:
        """在视频库中检索最相关的视频"""
        query_embed = self.encode_text([query])  # [1, D]
        # 计算与所有视频嵌入的相似度
        video_ids = list(video_database.keys())
        video_embeds = torch.stack([video_database[vid] for vid in video_ids])
        similarities = (query_embed @ video_embeds.T).squeeze(0)
        # Top-K
        top_indices = similarities.argsort(descending=True)[:top_k]
        results = []
        for idx in top_indices:
            results.append((video_ids[idx], similarities[idx].item()))
        return results

# 使用示例
# videos_db = {"video_001": embed1, "video_002": embed2, ...}
# results = searcher.search("a dog playing in the park", videos_db, top_k=5)
# for vid, score in results:
#     print(f"{vid}: {score:.4f}")`
          },
          {
            lang: "python",
            code: `# 完整的视频检索 Pipeline
import os
import cv2
import torch
from typing import Optional

def extract_frames_from_video(video_path: str,
                              num_frames: int = 8) -> list:
    """从视频文件中均匀提取 num_frames 帧"""
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if total_frames == 0:
        cap.release()
        return []

    indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            frames.append(Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)))
    cap.release()
    return frames

def build_video_database(video_dir: str,
                         inference: VideoCLIPInference,
                         num_frames: int = 8) -> dict[str, torch.Tensor]:
    """批量编码视频目录中的所有视频"""
    database = {}
    video_files = [f for f in os.listdir(video_dir)
                   if f.endswith((".mp4", ".avi", ".mov"))]

    for i, vf in enumerate(video_files):
        path = os.path.join(video_dir, vf)
        frames = extract_frames_from_video(path, num_frames)
        if frames:
            embed = inference.encode_video(frames)
            database[vf] = embed.squeeze(0)
        if (i + 1) % 10 == 0:
            print(f"已编码 {i + 1}/{len(video_files)} 个视频")

    return database

def multi_query_search(queries: list[str],
                       video_db: dict,
                       inference: VideoCLIPInference,
                       top_k: int = 3) -> dict[str, list[tuple]]:
    """多查询批量检索"""
    all_results = {}
    # 批量编码所有查询
    all_query_embeds = inference.encode_text(queries)

    video_ids = list(video_db.keys())
    video_embeds = torch.stack([video_db[vid] for vid in video_ids])

    for i, query in enumerate(queries):
        query_embed = all_query_embeds[i:i+1]
        sims = (query_embed @ video_embeds.T).squeeze(0)
        top_idx = sims.argsort(descending=True)[:top_k]
        all_results[query] = [
            (video_ids[j], sims[j].item()) for j in top_idx
        ]

    return all_results`
          }
        ],
        table: {
          headers: ["参数", "推荐值", "影响", "调优建议"],
          rows: [
            ["采样帧数", "8-16 帧", "越多越好但计算量大", "短视频 8 帧，长视频 16 帧"],
            ["帧分辨率", "224x224", "与预训练模型一致", "不要随意更改，影响精度"],
            ["文本最大长度", "77 tokens", "CLIP 文本编码器限制", "精简查询，去除冗余词"],
            ["温度参数", "0.07", "控制相似度分布的锐度", "零样本推理时不调整"],
            ["Top-K", "5-10", "返回结果数量", "搜索场景用 10，展示用 5"]
          ]
        },
        mermaid: `graph LR
    A["视频目录\n.mp4 / .avi"] --> B["帧提取\nOpenCV 均匀采样"]
    B --> C["帧预处理\nResize + Normalize"]
    C --> D["视觉编码\nCLIP/TimeSformer"]
    D --> E["时间池化\nMean Pooling"]
    E --> F["视频嵌入向量\n存入数据库"]
    G["自然语言查询"] --> H["文本编码\nCLIP Text"]
    H --> I["余弦相似度\n查询 vs 所有视频"]
    F --> I
    I --> J["排序\nTop-K 结果"]
    J --> K["返回相关视频\n及置信分数"]`,
        tip: "对于大规模视频检索（超过 1 万个视频），建议先将所有视频嵌入存入 FAISS 向量数据库，使用 IVF-PQ 索引结构进行近似检索。这可以将检索延迟从线性 O(N) 降低到亚线性级别",
        warning: "VideoCLIP 在训练数据分布之外的领域（如医疗视频、卫星视频）上表现可能显著下降。对于领域特定的检索任务，应在目标领域数据上进行微调或使用领域适配器（Domain Adapter）"
      },
    ],
};
