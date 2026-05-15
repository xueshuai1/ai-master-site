import { Article } from '../knowledge';

export const article: Article = {
    id: "mm-007",
    title: "多模态大模型：从 LLaVA 到 Gemini",
    category: "multimodal",
    tags: ["多模态", "大模型", "VLM", "LLaVA"],
    summary: "解析多模态大语言模型的架构设计、训练方法与前沿进展",
    date: "2026-04-12",
    readTime: "22 min",
    level: "高级",
    content: [
        {
            title: "1. 多模态大模型的崛起",
            body: `多模态大语言模型（Multimodal Large Language Models, MLLMs）是 AI 领域最具突破性的发展方向之一。传统的语言模型只能处理文本，而 MLLMs 能够同时理解和生成文本、图像、音频甚至视频内容。这一能力的跨越不仅仅是"多了几个输入模态"，而是从根本上改变了 AI 与世界交互的方式。

LLaVA（Large Language-and-Vision Assistant）是这一领域的里程碑工作。它的核心思路非常简单却极其有效：用预训练的视觉编码器（如 CLIP 的 ViT）提取图像特征，通过一个简单的线性投影层将视觉特征映射到语言模型的特征空间，然后将视觉 token 和文本 token 一起输入到大语言模型中。这种架构的优势在于可以复用强大的预训练语言模型（如 **LLaMA**、Vicuna），只需要训练投影层和进行指令微调。

从 LLaVA 到 **Gemini**、**GPT-4**V、**Claude** 3，多模态大模型的能力在短短一年内实现了质的飞跃。模型不仅能描述图片内容，还能进行视觉推理、图表理解、OCR 文字提取、甚至视频时序理解。这种能力飞跃的背后是架构创新、大规模多模态训练数据和更精细的对齐训练的共同作用。`,
            mermaid: `graph LR
    A["输入图像"] --> B["Visual Encoder
(CLIP ViT)"]
    B --> C["Projection Layer
(Linear/MLP)"]
    D["输入文本"] --> E["Token Embedding"]
    C --> F["Visual Tokens"]
    E --> G["Text Tokens"]
    F --> H["LLM
(LLaMA/Vicuna)"]
    G --> H
    H --> I["多模态理解与生成"]`,
            tip: "学习建议：先理解 LLaVA 的基本架构，再看 Gemini 和 GPT-4V 的改进。从简单到复杂是理解这一领域最快的路径。",
        },
        {
            title: "2. LLaVA 架构深度解析",
            body: `LLaVA 的架构设计体现了"简单即强大"的哲学。整个系统由三个核心组件构成：视觉编码器、投影器和语言模型。视觉编码器通常使用 CLIP 的 ViT-L/14，它在大规模图文对上经过对比学习预训练，具有丰富的视觉语义理解能力。投影器是一个简单的线性层，将视觉特征维度（1024）映射到语言模型的特征维度（4096 for **LLaMA**）。语言模型则是一个经过指令微调的开源大语言模型。

LLaVA 的训练分为两个阶段。第一阶段是特征对齐预训练：冻结视觉编码器和语言模型，只训练投影层，使用约 60 万图文对数据，目标是让视觉特征能够被语言模型正确理解。第二阶段是视觉指令微调：解冻投影层和语言模型的部分参数（LoRA），使用约 15 万条精心设计的多模态指令数据进行微调，使模型能够遵循复杂的视觉理解指令。

这种两阶段训练策略的关键在于解耦了视觉-语言对齐和指令遵循两个不同的学习目标。第一阶段确保视觉特征能被语言模型"读懂"，第二阶段确保模型能够按照用户指令进行多模态推理。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from transformers import CLIPVisionModel, LlamaForCausalLM

class LLaVAModel(nn.Module):
    """LLaVA 架构简化实现"""
    
    def __init__(self, vision_model_name="openai/clip-vit-large-patch14",
                 llm_model_name="lmsys/vicuna-7b-v1.5",
                 freeze_vision=True, freeze_llm=True):
        super().__init__()
        
        # 视觉编码器
        self.vision_tower = CLIPVisionModel.from_pretrained(vision_model_name)
        if freeze_vision:
            for param in self.vision_tower.parameters():
                param.requires_grad = False
        
        # 语言模型
        self.llm = LlamaForCausalLM.from_pretrained(llm_model_name)
        if freeze_llm:
            for param in self.llm.parameters():
                param.requires_grad = False
        
        # 投影层：视觉特征维度 -> 语言模型维度
        vision_dim = self.vision_tower.config.hidden_size  # 1024
        llm_dim = self.llm.config.hidden_size              # 4096
        self.projector = nn.Linear(vision_dim, llm_dim)
    
    def encode_images(self, images: torch.Tensor) -> torch.Tensor:
        """将图像编码为视觉 token 序列"""
        image_features = self.vision_tower(images).last_hidden_state
        # image_features: [batch, num_patches, vision_dim]
        image_features = self.projector(image_features)
        # image_features: [batch, num_patches, llm_dim]
        return image_features
    
    def forward(self, input_ids: torch.Tensor, 
                images: torch.Tensor = None,
                attention_mask: torch.Tensor = None,
                labels: torch.Tensor = None):
        """多模态前向传播"""
        if images is not None:
            # 编码图像并嵌入到文本序列中
            image_features = self.encode_images(images)
            # 这里需要将 image_features 插入到 input_embeddings 中
            # 实际实现需要处理 special token 的位置
            # 简化版：直接拼接
            text_embeds = self.llm.get_input_embeddings()(input_ids)
            # 实际项目中这里需要更复杂的拼接逻辑
            inputs_embeds = text_embeds  # 简化
        
        outputs = self.llm(
            input_ids=input_ids if images is None else None,
            inputs_embeds=inputs_embeds if images is not None else None,
            attention_mask=attention_mask,
            labels=labels,
        )
        return outputs

# 初始化模型
model = LLaVAModel()
print(f"Vision dim: {model.vision_tower.config.hidden_size}")
print(f"LLM dim: {model.llm.config.hidden_size}")
print(f"Projector: {model.projector}")`
                }
            ],
            table: {
                headers: ["组件", "模型", "参数规模", "作用"],
                rows: [
                    ["视觉编码器", "CLIP ViT-L/14", "307M", "图像特征提取"],
                    ["投影器", "Linear Layer", "4M", "模态对齐"],
                    ["语言模型", "Vicuna-7B", "7B", "理解与生成"],
                    ["总参数", "-", "~7.3B", "端到端推理"],
                ]
            },
        },
        {
            title: "3. 训练数据策略：指令微调的关键",
            body: `多模态大模型的能力上限很大程度上取决于训练数据的质量和多样性。LLaVA 系列的工作证明了精心设计的指令微调数据可以极大地激发预训练模型的潜力。核心挑战在于：如何从有限的标注数据中最大化模型的多模态理解能力？

LLaVA 采用了数据演进的策略。LLaVA-1.5 使用了约 665K 的混合数据，包括 COCO 图像的密集描述、VQA 数据集、以及通过 **GPT-4** 生成的视觉指令数据。关键创新在于使用 **GPT-4** 从图像的详细描述中生成多样化的问答对，这种方法被称为"视觉指令数据生成"。GPT-4 被要求基于图像的文本描述生成涵盖描述、推理、复杂推理等不同认知层次的问答对，从而创造出丰富多样的训练信号。

LLaVA-1.6（LLaVA-NeXT）进一步扩展了数据策略，引入了高分辨率图像处理（从 336x336 提升到任意分辨率）和更多样化的数据源，包括科学图表、文档图像、信息图等。数据多样性的提升直接转化为模型在多种视觉任务上的泛化能力。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass
from typing import List, Dict
import json
import random

@dataclass
class VisionInstruction:
    image_id: str
    conversation: List[Dict[str, str]]  # {"from": "human"/"gpt", "value": "..."}
    data_source: str  # "coco", "vqa", "gpt4_generated"

class InstructionDataBuilder:
    """多模态指令数据构建器"""
    
    CONVERSATION_TEMPLATES = {
        "description": [
            {"from": "human", "value": "Describe this image in detail."},
        ],
        "reasoning": [
            {"from": "human", "value": "What can you infer from this image? Explain your reasoning."},
        ],
        "complex_reasoning": [
            {"from": "human", "value": "Analyze the relationships between objects in this image."},
        ],
        "ocr": [
            {"from": "human", "value": "Read and transcribe all text visible in this image."},
        ],
        "counting": [
            {"from": "human", "value": "Count the number of specific objects in this image."},
        ],
    }
    
    def __init__(self):
        self.instructions: List[VisionInstruction] = []
    
    def add_coco_descriptions(self, coco_data: List[Dict], 
                               n_per_image: int = 3) -> int:
        """为 COCO 图像生成多种粒度的描述指令"""
        count = 0
        for img_info in coco_data:
            annotations = img_info.get("annotations", [])
            caption = " ".join([a.get("caption", "") for a in annotations])
            
            for template_key in ["description", "reasoning", "complex_reasoning"]:
                template = self.CONVERSATION_TEMPLATES[template_key]
                conversation = [
                    template[0],
                    {"from": "gpt", "value": f"[Generated caption: {caption}]"}
                ]
                self.instructions.append(VisionInstruction(
                    image_id=img_info["id"],
                    conversation=conversation,
                    data_source="coco",
                ))
                count += 1
                if count >= n_per_image:
                    break
        return count
    
    def mix_datasets(self, coco_data, vqa_data, gpt4_data) -> List[Dict]:
        """混合多源数据并构建最终训练集"""
        n_coco = self.add_coco_descriptions(coco_data)
        print(f"Added {n_coco} COCO instructions")
        
        # 转换为训练格式
        dataset = []
        for instr in self.instructions:
            dataset.append({
                "id": instr.image_id,
                "image": f"coco/train2017/{instr.image_id}.jpg",
                "conversations": instr.conversation,
                "source": instr.data_source,
            })
        
        random.shuffle(dataset)
        return dataset

# 数据混合策略
builder = InstructionDataBuilder()
# 实际项目中从文件加载数据
print("Data building pipeline ready")`
                }
            ],
            warning: "数据质量比数据量更重要。LLaVA 只用 665K 数据就超越了使用更多数据的模型，关键在于数据的多样性和指令设计的精心程度。",
        },
        {
            title: "4. Gemini 架构创新",
            body: `Google 的 **Gemini** 系列模型代表了多模态大模型的另一个重要方向。与 LLaVA 的"拼接式"架构不同，**Gemini** 采用了原生多模态设计——从预训练阶段就同时处理文本、图像、音频和视频数据，而不是在预训练好的语言模型上"嫁接"视觉能力。

Gemini 的核心架构创新包括：多模态 **Transformer** 架构，在自注意力层中统一处理不同模态的 token；原生多模态预训练，使用包含文本、图像、音频和视频的大规模混合数据集进行从头训练；以及高效的推理优化，通过混合专家（MoE）架构实现高效的推理。

原生多模态设计的优势在于模态间的深度融合。拼接式架构中，视觉信息通过投影层映射到语言空间后，与文本信息的交互仅发生在语言模型的自注意力层。而原生多模态模型从最底层就开始融合不同模态的信息，理论上可以学习到更丰富的跨模态表征。但这种设计的代价是训练成本极高——需要从头训练整个模型，而不是复用已有的语言模型。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from typing import Dict, List, Optional

class NativeMultimodalTransformer(nn.Module):
    """原生多模态 Transformer 简化概念实现"""
    
    def __init__(self, d_model=2048, n_heads=16, n_layers=32):
        super().__init__()
        self.d_model = d_model
        
        # 各模态的独立嵌入层
        self.text_embed = nn.Embedding(32000, d_model)
        self.image_patch_embed = nn.Linear(16 * 16 * 3, d_model)  # raw patches
        self.audio_frame_embed = nn.Linear(128, d_model)
        
        # 模态特定的位置编码
        self.text_pos = nn.Embedding(8192, d_model)
        self.image_pos = nn.Embedding(4096, d_model)  # 64x64 patches
        self.audio_pos = nn.Embedding(10000, d_model)
        
        # 统一的 Transformer 层
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=n_heads, batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, n_layers)
        
        # 输出头
        self.lm_head = nn.Linear(d_model, 32000)
    
    def forward(self, 
                text_tokens: Optional[torch.Tensor] = None,
                image_patches: Optional[torch.Tensor] = None,
                audio_frames: Optional[torch.Tensor] = None,
                modality_mask: Optional[torch.Tensor] = None):
        """统一处理多模态输入"""
        all_embeddings = []
        all_positions = []
        
        # 文本嵌入
        if text_tokens is not None:
            text_emb = self.text_embed(text_tokens)
            text_pos = self.text_pos(torch.arange(text_tokens.size(1), 
                                                   device=text_tokens.device))
            all_embeddings.append(text_emb + text_pos)
        
        # 图像嵌入
        if image_patches is not None:
            # image_patches: [batch, n_patches, 16*16*3]
            img_emb = self.image_patch_embed(image_patches)
            img_pos = self.image_pos(torch.arange(image_patches.size(1),
                                                   device=image_patches.device))
            all_embeddings.append(img_emb + img_pos)
        
        # 音频嵌入
        if audio_frames is not None:
            audio_emb = self.audio_frame_embed(audio_frames)
            audio_pos = self.audio_pos(torch.arange(audio_frames.size(1),
                                                     device=audio_frames.device))
            all_embeddings.append(audio_emb + audio_pos)
        
        # 拼接所有模态的 token
        combined = torch.cat(all_embeddings, dim=1)
        
        # 统一 Transformer 处理
        output = self.transformer(combined)
        
        # 只输出文本部分的 logits
        text_len = text_tokens.size(1) if text_tokens is not None else 0
        text_output = output[:, -text_len:, :] if text_len > 0 else output
        logits = self.lm_head(text_output)
        
        return logits

model = NativeMultimodalTransformer(d_model=2048, n_heads=16, n_layers=8)
print(f"Model parameters: {sum(p.numel() for p in model.parameters()) / 1e6:.1f}M")`
                }
            ],
            table: {
                headers: ["特性", "LLaVA (拼接式)", "Gemini (原生)"],
                rows: [
                    ["架构", "视觉 + 投影 + LLM", "统一多模态 Transformer"],
                    ["预训练", "分别预训练后对齐", "从头多模态联合预训练"],
                    ["训练成本", "低 (复用 LLM)", "极高 (从头训练)"],
                    ["模态融合", "浅层 (投影层)", "深层 (全网络)"],
                    ["推理效率", "高 (可冻结 LLM)", "中等 (MoE 优化)"],
                    ["灵活性", "高 (可换 LLM)", "低 (端到端训练)"],
                ]
            },
        },
        {
            title: "5. 高分辨率与多图理解",
            body: `早期的多模态大模型（如 LLaVA-1.0）受限于 CLIP 的 336x336 输入分辨率，在需要细粒度视觉理解的任务上表现受限。将高分辨率图像压缩到 336x336 会丢失大量细节信息，这对于文档理解、图表分析、细粒度物体识别等任务来说是致命的。

LLaVA-NeXT（LLaVA-1.6）提出了 AnyRes 方案来解决这一问题。核心思路是将高分辨率图像分割成多个子区域，每个子区域独立通过视觉编码器，然后将所有子区域的特征拼接起来。这种方法既保留了高分辨率细节，又复用了预训练的视觉编码器。同时，模型还保留了全局低分辨率视图来捕捉整体上下文信息。

多图理解是另一个重要方向。现实世界中的视觉任务往往需要同时处理多张图片——对比两张图片的差异、理解故事图片序列、分析同一场景不同角度拍摄的照片等。这要求模型能够建立跨图像的对应关系和时序关联，而不仅仅是独立地理解每张图片。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from typing import List, Tuple

class AnyResVisionEncoder(nn.Module):
    """AnyRes 高分辨率视觉编码方案"""
    
    def __init__(self, clip_model, tile_size=336, base_resolution=336):
        super().__init__()
        self.clip = clip_model
        self.tile_size = tile_size
        self.base_resolution = base_resolution
        self.projector = nn.Linear(
            clip.config.hidden_size,
            clip.config.hidden_size * 2  # 扩大投影维度
        )
    
    def tile_image(self, image: torch.Tensor) -> Tuple[torch.Tensor, int]:
        """将高分辨率图像分割为子区域"""
        # image: [batch, C, H, W]
        batch, C, H, W = image.shape
        
        # 计算需要分割的块数
        n_h = max(1, H // self.tile_size)
        n_w = max(1, W // self.tile_size)
        
        tiles = []
        for i in range(n_h):
            for j in range(n_w):
                h_start = i * self.tile_size
                w_start = j * self.tile_size
                h_end = min(h_start + self.tile_size, H)
                w_end = min(w_start + self.tile_size, W)
                
                tile = image[:, :, h_start:h_end, w_start:w_end]
                # 缩放到 tile_size
                tile = torch.nn.functional.interpolate(
                    tile, size=(self.tile_size, self.tile_size),
                    mode='bilinear', align_corners=False
                )
                tiles.append(tile)
        
        return torch.stack(tiles, dim=1), (n_h, n_w)
    
    def encode_high_res(self, image: torch.Tensor) -> torch.Tensor:
        """高分辨率编码：局部细节 + 全局上下文"""
        # 全局低分辨率视图
        global_view = torch.nn.functional.interpolate(
            image, size=(self.base_resolution, self.base_resolution),
            mode='bilinear', align_corners=False
        )
        global_features = self.clip(global_view).last_hidden_state
        
        # 局部高分辨率子区域
        tiles, grid_size = self.tile_image(image)
        batch, n_tiles, C, H, W = tiles.shape
        
        tile_features = []
        for i in range(n_tiles):
            tile_feat = self.clip(tiles[:, i, :, :, :]).last_hidden_state
            tile_features.append(tile_feat)
        
        local_features = torch.stack(tile_features, dim=1)
        # local_features: [batch, n_tiles, n_patches, dim]
        
        # 融合全局和局部特征
        combined = torch.cat([
            global_features.unsqueeze(1),  # [batch, 1, n_patches, dim]
            local_features                  # [batch, n_tiles, n_patches, dim]
        ], dim=1)
        
        # 投影
        combined = self.projector(combined)
        return combined, grid_size

# 示例：处理 1344x1344 高分辨率图像
encoder = AnyResVisionEncoder(None)  # placeholder
print("AnyRes encoder initialized")
# 1344/336 = 4x4 = 16 tiles + 1 global view`
                }
            ],
            tip: "高分辨率处理的关键权衡：更多的子区域意味着更好的细节捕捉，但也带来更长的 token 序列和更高的计算成本。AnyRes 通过自适应分块在两者之间取得平衡。",
        },
        {
            title: "6. 视频理解与时序建模",
            body: `视频理解是多模态大模型的前沿挑战。与静态图像不同，视频包含时间维度的信息——动作、事件发展、因果关系等。将视频输入到多模态大模型中面临着独特的挑战：计算复杂度随帧数线性增长、时序关系的建模、以及长视频中的信息压缩。

当前的视频理解方法主要分为三类。帧采样法：从视频中均匀采样若干帧（如 8 帧、16 帧、32 帧），将每帧作为独立图像输入，然后在语言模型层面融合时序信息。这种方法实现简单但忽略了帧间的细粒度时序关系。时序编码法：在视觉特征中加入时序位置编码，使模型能够感知帧的顺序。Video-LLaVA 采用了这种方法，在视觉投影后加入可学习的时序位置嵌入。视频专用编码器：使用预训练的视频编码器（如 VideoMAE、TimeSformer）替代图像编码器，直接提取视频的时空特征。

长视频理解是另一个挑战。一个 30 分钟的视频如果每秒采样 1 帧就有 1800 帧，即使每帧压缩到 256 个 token 也有 46 万 token，远超当前大多数模型的上下文窗口。解决方案包括关键帧提取、视频摘要、层次化编码（先粗后细）以及长上下文窗口模型的应用。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from typing import List

class VideoMLLM(nn.Module):
    """视频多模态大语言模型"""
    
    def __init__(self, image_encoder, llm, n_frames=8,
                 use_temporal_encoding=True):
        super().__init__()
        self.image_encoder = image_encoder
        self.llm = llm
        self.n_frames = n_frames
        self.use_temporal_encoding = use_temporal_encoding
        
        # 时序位置编码
        if use_temporal_encoding:
            self.temporal_pos_embed = nn.Parameter(
                torch.zeros(1, n_frames, 1, image_encoder.config.hidden_size)
            )
        
        # 时序压缩模块（可选）
        self.temporal_compressor = nn.Sequential(
            nn.Linear(image_encoder.config.hidden_size,
                      image_encoder.config.hidden_size // 2),
            nn.GELU(),
            nn.Linear(image_encoder.config.hidden_size // 2,
                      image_encoder.config.hidden_size),
        )
    
    def encode_video(self, frames: torch.Tensor) -> torch.Tensor:
        """编码视频帧序列"""
        # frames: [batch, n_frames, C, H, W]
        batch, n_frames = frames.shape[:2]
        
        # 编码每帧
        frame_features = []
        for t in range(n_frames):
            feat = self.image_encoder(frames[:, t, :, :, :]).last_hidden_state
            frame_features.append(feat)
        
        # 堆叠: [batch, n_frames, n_patches, dim]
        video_features = torch.stack(frame_features, dim=1)
        
        # 添加时序位置编码
        if self.use_temporal_encoding:
            video_features = video_features + self.temporal_pos_embed
        
        # 时序压缩（减少 token 数量）
        compressed = self.temporal_compressor(video_features)
        # compressed: [batch, n_frames, n_patches, dim]
        
        return compressed
    
    def adaptive_frame_sampling(self, video_path: str, 
                                 max_frames: int = 8) -> List[int]:
        """自适应帧采样策略"""
        import cv2
        
        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps if fps > 0 else 0
        cap.release()
        
        if total_frames <= max_frames:
            return list(range(total_frames))
        
        # 场景变化检测辅助的采样
        # 简单实现：均匀采样 + 首帧 + 末帧
        sample_indices = [0, total_frames - 1]
        remaining = max_frames - 2
        step = total_frames // (remaining + 1)
        for i in range(1, remaining + 1):
            sample_indices.append(min(i * step, total_frames - 1))
        
        return sorted(sample_indices)

# 示例：8 帧视频编码
print("Video MLLM pipeline ready")
print("Strategy: uniform sampling + temporal encoding + compression")`
                }
            ],
            table: {
                headers: ["方法", "帧数", "优势", "劣势"],
                rows: [
                    ["帧采样法", "8-32 帧", "实现简单、兼容性强", "忽略细粒度时序"],
                    ["时序编码法", "8-64 帧", "保留时序关系", "token 数量大"],
                    ["视频编码器", "16-256 帧", "原生时空特征", "需专用预训练"],
                    ["层次化编码", "数百帧", "支持长视频", "实现复杂"],
                ]
            },
        },
        {
            title: "7. 多模态基准测试与未来方向",
            body: `多模态大模型的评估是一个活跃的研究领域。传统的视觉基准（如 ImageNet、COCO）只能评估模型的单模态能力，而多模态基准需要同时考察视觉理解、语言推理和跨模态对齐能力。

MMBench 是综合性的多模态理解基准，涵盖 20 多个维度的能力测试，包括感知、推理、OCR、图表理解等。MathVista 专注于多模态数学推理，要求模型理解图表、几何图形和数学公式并给出推理过程。MMMU 则是大学级别的多学科多模态理解基准，涵盖艺术、商业、科学、工程等多个领域，测试模型的深度推理能力。

**未来发展方向包括**：世界模型——不仅理解视觉内容，还能建立对物理世界的内部模型，预测物体的行为规律；具身多模态——将多模态理解与行动能力结合，使 AI 不仅能"看"和"说"，还能"做"；实时多模态——支持流式的视频和音频输入，实现真正的实时多模态交互；以及多模态生成——不仅理解多模态输入，还能生成包含文本、图像、视频的综合输出。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass
from typing import Dict, List
import numpy as np

@dataclass
class BenchmarkResult:
    benchmark: str
    overall_score: float
    category_scores: Dict[str, float]
    
    def summary(self) -> str:
        top3 = sorted(self.category_scores.items(), 
                      key=lambda x: x[1], reverse=True)[:3]
        bot3 = sorted(self.category_scores.items(),
                      key=lambda x: x[1])[:3]
        return (f"{self.benchmark}: {self.overall_score:.1f}\\n"
                f"  Best: {', '.join(f'{k}={v:.1f}' for k,v in top3)}\\n"
                f"  Worst: {', '.join(f'{k}={v:.1f}' for k,v in bot3)}")

class MultimodalEvaluator:
    """多模态模型综合评估器"""
    
    BENCHMARKS = {
        "MMBench": ["perception", "reasoning", "ocr", "chart", "math"],
        "MathVista": ["geometry", "algebra", "statistics", "science"],
        "MMMU": ["art", "business", "science", "health", "humanities"],
        "SEED-Bench": ["scene", "instance", "action", "spatial"],
        "RealWorldQA": ["daily", "technical", "document", "chart"],
    }
    
    def evaluate(self, model, benchmark: str) -> BenchmarkResult:
        """评估模型在指定基准上的表现"""
        categories = self.BENCHMARKS.get(benchmark, [])
        scores = {}
        
        for cat in categories:
            # 实际评估需要运行推理并计算准确率
            # 这里用模拟数据
            scores[cat] = np.random.uniform(50, 95)
        
        overall = np.mean(list(scores.values()))
        return BenchmarkResult(
            benchmark=benchmark,
            overall_score=overall,
            category_scores=scores,
        )
    
    def compare_models(self, models: List[str], 
                       benchmarks: List[str]) -> str:
        """多模型对比报告"""
        report = "\\n" + "=" * 70 + "\\n"
        report += "Multimodal Model Comparison Report\\n"
        report += "=" * 70 + "\\n\\n"
        
        for benchmark in benchmarks:
            report += f"--- {benchmark} ---\\n"
            for model_name in models:
                result = self.evaluate(model_name, benchmark)
                report += f"  {model_name}: {result.overall_score:.1f}\\n"
            report += "\\n"
        
        return report

# 示例评估
evaluator = MultimodalEvaluator()
np.random.seed(42)  # 可复现
report = evaluator.compare_models(
    ["LLaVA-1.6-7B", "LLaVA-1.6-13B", "Qwen-VL-Plus"],
    ["MMBench", "MathVista", "MMMU"],
)
print(report)`
                }
            ],
            warning: "基准测试分数不能完全代表模型能力。不同基准的侧重点不同，需要结合具体使用场景进行评估。同时注意基准泄漏问题——模型可能在训练时见过测试数据。",
        },
                {
                    title: "架构图示",
                    mermaid: `graph TD
    subgraph "多模态大模型演进"
        M1["视觉-语言<br/>BLIP/Flamingo"] --> M2["统一视觉语言<br/>LLaVA 系列"]
        M2 --> M3["多模态融合<br/>Gemini/GPT-4o"]
        M3 --> M4["全模态<br/>音频+视频+文本"]
    end
    
    subgraph "LLaVA 架构"
        V1["视觉编码器<br/>CLIP ViT"] --> P1["投影层<br/>Linear/MLP"]
        P1 --> L1["语言模型<br/>LLaMA/Vicuna"]
    end
    
    subgraph "Gemini 架构创新"
        G1["原生多模态 Transformer"] --> G2["MoE 混合专家"]
        G1 --> G3["超长上下文窗口"]
    end
    
    M2 --> V1
    M3 --> G1
    
    style M2 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style M3 fill:#b91c1c,stroke:#dc2626,color:#fff`,
                },
    ],
};
