import { Article } from '../knowledge';

export const article: Article = {
    id: "mm-004",
    title: "音频-文本多模态",
    category: "multimodal",
    tags: ["音频", "语音识别", "多模态"],
    summary: "从语音识别到音乐生成，理解音频与文本的跨模态技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 音频的数字化表示",
            body: `音频信号本质上是随时间变化的连续波形。计算机要处理音频，必须先将其离散化。采样率（如 16kHz、44.1kHz）决定了每秒采集多少个数据点，位深度（如 16-bit）决定了每个采样点的精度。一维波形虽然是最直接的表示，但它缺乏对频率信息的直观描述，因此我们需要更丰富的表征方式。

频谱图（Spectrogram）通过短时傅里叶变换将一维波形转换为二维时频图像，横轴为时间，纵轴为频率，颜色深浅表示能量强度。梅尔频谱（Mel Spectrogram）在此基础上引入人类听觉的非线性感知特性，低频区域分辨率更高。MFCC（梅尔频率倒谱系数）则进一步通过离散余弦变换提取最具判别性的低频分量，广泛用于传统语音识别系统。

现代深度学习中，梅尔频谱图已成为主流的音频输入格式。它既保留了足够的频域信息，又具有图像般的二维结构，可以自然地输入到 CNN 或 Vision **Transformer** 中。理解这些表示方法之间的差异和联系，是深入音频-文本多模态研究的基础。`,
            code: [
                {
                    lang: "python",
                    code: `import librosa
import numpy as np

def compute_mfcc(audio_path: str, n_mfcc: int = 13, sr: int = 16000) -> np.ndarray:
    """从音频文件提取 MFCC 特征
    MFCC 通过梅尔尺度滤波和 DCT 压缩频谱信息
    保留最具判别性的低频倒谱系数"""
    y, _ = librosa.load(audio_path, sr=sr)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    # 标准化：零均值单位方差
    mfcc = (mfcc - mfcc.mean(axis=1, keepdims=True)) / (mfcc.std(axis=1, keepdims=True) + 1e-8)
    return mfcc  # shape: (n_mfcc, time_steps)`
                },
                {
                    lang: "python",
                    code: `import torchaudio
import torch

def compute_mel_spectrogram(waveform: torch.Tensor, sr: int = 16000) -> torch.Tensor:
    """将波形张量转换为梅尔频谱图
    torchaudio 提供 GPU 加速的频谱图计算"""
    transform = torchaudio.transforms.MelSpectrogram(
        sample_rate=sr,
        n_fft=400,          # 25ms at 16kHz
        hop_length=160,     # 10ms frame shift
        n_mels=80,
        f_min=0,
        f_max=8000
    )
    mel_spec = transform(waveform)  # shape: (1, n_mels, time)
    # 转换为对数尺度
    mel_spec = torch.log(mel_spec + 1e-6)
    return mel_spec`
                }
            ],
            table: {
                headers: ["表示方法", "维度", "信息保留", "典型用途"],
                rows: [
                    ["原始波形", "(T,)", "完整波形", "端到端模型 (Wav2Vec2)"],
                    ["线性频谱图", "(T, F)", "完整频域", "传统信号处理"],
                    ["梅尔频谱图", "(T, n_mels)", "感知加权频域", "深度学习首选输入"],
                    ["MFCC", "(T, n_mfcc)", "压缩倒谱系数", "GMM-HMM / 传统 ML"],
                ]
            },
            mermaid: `graph LR
    A["原始波形"] --> B["分帧加窗"]
    B --> C["FFT 变换"]
    C --> D["梅尔滤波器组"]
    D --> E["对数压缩"]
    E --> F["梅尔频谱图"]
    F --> G["DCT 变换"]
    G --> H["MFCC 系数"]`,
            tip: "16kHz 采样率已足够覆盖人类语音的主要频段（300-3400Hz），语音任务不必使用 44.1kHz 音频 CD 标准。",
            warning: "不同音频文件的采样率可能不一致，加载时必须统一 resample，否则模型输入维度将发生不可预测的偏移。"
        },
        {
            title: "2. 语音识别：从 Whisper 到 Wav2Vec2",
            body: `自动语音识别（ASR）是音频-文本多模态最成熟的应用。传统 ASR 采用 GMM-HMM 流水线：声学模型将音频帧映射到音素状态，语言模型对输出序列施加语法约束，解码器通过束搜索找到最优路径。这套系统依赖大量领域特定标注数据和复杂的特征工程 pipeline。

深度学习的引入彻底改变了 ASR 的格局。端到端模型如 Listen Attend and Spell（LAS）直接将声学特征映射为文本序列，省去了手工音素对齐的中间步骤。2020 年，Facebook AI 提出的 Wav2Vec2 进一步将自监督学习引入语音领域：通过对比预测编码在海量无标注音频上预训练，学习通用的语音表征，然后在少量标注数据上微调即可达到优异性能。

**OpenAI** 的 Whisper 代表了另一条路线：弱监督学习。利用网络上 68 万小时的多语言语音-文本对训练一个标准的编码器-解码器 **Transformer**。Whisper 的零样本能力极强，无需针对特定领域微调即可处理多种口音、背景噪声和语言。Wav2Vec2 和 Whisper 分别代表了自监督预训练和弱监督大规模训练两条成功的技术路线。`,
            code: [
                {
                    lang: "python",
                    code: `from transformers import WhisperProcessor, WhisperForConditionalGeneration
import torch

def transcribe_with_whisper(audio_path: str, model_name: str = "openai/whisper-medium") -> str:
    """使用 Whisper 模型进行语音识别
    Whisper 将音频编码为序列后自回归生成文本"""
    processor = WhisperProcessor.from_pretrained(model_name)
    model = WhisperForConditionalGeneration.from_pretrained(model_name)

    audio, sr = librosa.load(audio_path, sr=16000)
    inputs = processor(audio, sampling_rate=16000, return_tensors="pt")

    with torch.no_grad():
        generated = model.generate(
            inputs.input_features,
            max_length=448,
            num_beams=5
        )

    return processor.batch_decode(generated, skip_special_tokens=True)[0]`
                },
                {
                    lang: "python",
                    code: `from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import torch

def transcribe_with_wav2vec2(audio_path: str, lang: str = "zh") -> str:
    """使用 Wav2Vec2 进行 CTC 语音识别
    CTC 损失允许输入输出长度不一致，无需帧级对齐"""
    model_name = f"facebook/wav2vec2-large-xlsr-53-{lang}"
    processor = Wav2Vec2Processor.from_pretrained(model_name)
    model = Wav2Vec2ForCTC.from_pretrained(model_name)

    audio, sr = librosa.load(audio_path, sr=16000)
    inputs = processor(audio, sampling_rate=16000, return_tensors="pt")

    with torch.no_grad():
        logits = model(inputs.input_values).logits

    predicted_ids = torch.argmax(logits, dim=-1)
    return processor.batch_decode(predicted_ids)[0]`
                }
            ],
            table: {
                headers: ["模型", "架构", "预训练方式", "标注需求", "特点"],
                rows: [
                    ["Whisper", "Encoder-Decoder Transformer", "弱监督（68万小时）", "零样本可用", "多语言，鲁棒性强"],
                    ["Wav2Vec2", "Transformer Encoder + CTC", "自监督对比学习", "需少量标注微调", "表征能力强，灵活"],
                    ["Conformer", "CNN + Transformer 混合", "监督训练", "大量标注", "工业级精度"],
                    ["LAS", "RNN Encoder-Attention Decoder", "端到端监督", "领域标注", "早期端到端方案"],
                ]
            },
            mermaid: `graph TD
    A["音频波形"] --> B["Whisper Encoder"]
    B --> C["音频表征序列"]
    C --> D["Cross-Attention"]
    D --> E["Whisper Decoder"]
    E --> F["文本 Token 序列"]
    F --> G["Beam Search"]
    G --> H["最终转录文本"]`,
            tip: "Whisper 的 prompt 功能允许通过输入前缀文本控制输出格式，例如输入'总结这段录音：'可以获得摘要而非逐字转录。",
            warning: "Whisper 在处理重叠语音（多人同时说话）时表现较差，这是当前所有 ASR 模型共同的难题，称为鸡尾酒会问题。"
        },
        {
            title: "3. 音频分类：从环境音到情感识别",
            body: `音频分类是将音频片段分配到预定义类别的任务，涵盖环境声音识别、音乐流派分类、情感识别等多个子领域。不同于语音识别关注内容文本，音频分类关注声音本身的语义属性。

经典的音频分类 pipeline 包括：预处理（重采样、归一化）→ 特征提取（梅尔频谱、零过零率、频谱质心）→ 分类器（CNN、ResNet、SVM）。近年来，端到端方法直接从原始波形或频谱图学习特征，避免了手工特征工程的局限。AudioSet 数据集包含 200 万段 10 秒 YouTube 音频片段，涵盖 527 个类别，是音频分类最重要的基准。

PANNs（Pretrained Audio Neural Networks）在 AudioSet 上预训练后展现出强大的迁移能力，可用于各种下游音频分类任务。情感识别是另一个重要方向：通过语音的韵律特征（音高、语速、能量）和频谱特征识别说话人的情绪状态，在客服质检、心理健康评估等场景有广泛应用。多任务学习框架可以同时学习分类和情感预测，共享底层表征。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from torchvision import models

class AudioClassifier(nn.Module):
    """基于预训练 ResNet 的音频分类器
    将梅尔频谱图视为图像输入"""
    def __init__(self, num_classes: int = 527, pretrained: bool = True):
        super().__init__()
        self.backbone = models.resnet18(weights="DEFAULT" if pretrained else None)
        # 将第一层改为单通道输入
        self.backbone.conv1 = nn.Conv2d(
            1, 64, kernel_size=7, stride=2, padding=3, bias=False
        )
        # 替换分类头
        self.backbone.fc = nn.Linear(self.backbone.fc.in_features, num_classes)

    def forward(self, mel_spec: torch.Tensor) -> torch.Tensor:
        # mel_spec: (batch, 1, n_mels, time)
        return self.backbone(mel_spec)`
                },
                {
                    lang: "python",
                    code: `from transformers import ASTForAudioClassification, AutoFeatureExtractor

def classify_audio(audio_path: str, model_name: str = "MIT/ast-finetuned-audioset-10-10-0.4593"):
    """使用 Audio Spectrogram Transformer 进行分类
    AST 将音频分类提升到 Transformer 架构"""
    model = ASTForAudioClassification.from_pretrained(model_name)
    extractor = AutoFeatureExtractor.from_pretrained(model_name)

    audio, sr = librosa.load(audio_path, sr=16000)
    inputs = extractor(audio, sampling_rate=sr, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=-1)

    # 返回 Top-3 预测
    top3 = torch.topk(probs, k=3, dim=-1)
    labels = [model.config.id2label[i.item()] for i in top3.indices[0]]
    return list(zip(labels, top3.values[0].tolist()))`
                }
            ],
            table: {
                headers: ["数据集", "规模", "类别数", "音频长度", "主要用途"],
                rows: [
                    ["AudioSet", "200万段", "527", "10秒", "通用音频分类"],
                    ["ESC-50", "2000段", "50", "5秒", "环境声音"],
                    ["Speech Commands", "10.5万段", "35", "1秒", "关键词识别"],
                    ["IEMOCAP", "12小时", "6种情感", "可变长度", "语音情感识别"],
                ]
            },
            mermaid: `graph TD
    A["原始音频"] --> B["重采样 & 归一化"]
    B --> C["梅尔频谱图提取"]
    C --> D["CNN / AST 特征提取"]
    D --> E["全局池化"]
    E --> F["分类头 (Linear)"]
    F --> G["Softmax 概率"]
    G --> H["类别预测"]`,
            tip: "数据增强对音频分类至关重要。时间拉伸、音高偏移、添加背景噪声可以将有效训练数据量扩大数倍。",
            warning: "AudioSet 的标签是人工标注的弱标签（整段音频一个标签），训练时存在显著噪声，建议用多实例学习或标签平滑来缓解。"
        },
        {
            title: "4. 音乐生成：Jukebox 到 MusicLM",
            body: `音乐生成是生成式 AI 在音频领域最具挑战性的任务之一。音乐不仅是声学信号的排列，还包含旋律、和声、节奏、音色等多层次结构。成功的音乐生成模型必须在多个时间尺度上保持一致性：毫秒级的波形细节、秒级的音符序列、分钟级的曲式结构。

**OpenAI** 的 Jukebox（2020）是第一个能够生成包含人声的完整歌曲的自回归模型。它采用三级 VQ-VAE 的层级结构：顶层建模粗粒度的和声和旋律，中层捕获节奏和音色，底层生成原始波形。这种分层设计是必要的，因为直接对 44.1kHz 的原始波形建模计算成本过高。

Google 的 MusicLM（2023）采用不同的策略：先用音频语言模型 EnCodec 将音频压缩为离散 token 序列，然后训练基于文本条件的 **Transformer** 生成这些 token。通过语义 token（来自 MuLan 的文本-音频联合嵌入）和声学 token 的两阶段生成，MusicLM 能够根据文本描述生成高质量音乐。Suno 和 Udio 等商业化产品进一步推动了这个领域的发展。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write

def generate_music_from_text(prompt: str, duration: int = 30):
    """使用 MusicGen 从文本描述生成音乐
    MusicGen 结合了 EnCodec 音频压缩和条件 Transformer"""
    model = MusicGen.get_pretrained("medium")
    model.set_generation_params(
        duration=duration,
        top_k=250,
        top_p=0.0,
        temperature=1.0,
        cfg_coef=3.0  # classifier-free guidance 强度
    )

    with torch.no_grad():
        output = model.generate([prompt], progress=True)

    # 保存生成的音频
    audio_write("generated", output[0].cpu(), model.sample_rate,
                strategy="loudness", loudness_compressor=True)
    return output`
                },
                {
                    lang: "python",
                    code: `from encodec import EncodecModel
import torch

class AudioTokenExtractor:
    """使用 EnCodec 将音频编码为离散 token 序列
    这是 MusicLM 等生成模型的关键预处理步骤"""
    def __init__(self, bandwidth: float = 6.0):
        self.model = EncodecModel.encodec_model_24khz()
        self.model.set_target_bandwidth(bandwidth)

    def encode(self, waveform: torch.Tensor) -> torch.Tensor:
        """将波形编码为离散 token（多 codebook 量化）"""
        with torch.no_grad():
            encoded = self.model.encode(waveform.unsqueeze(0).unsqueeze(0))
        # encoded[0][0] 包含 codebook indices
        tokens = encoded[0][0]  # shape: (n_codebooks, seq_len)
        return tokens

    def decode(self, tokens: torch.Tensor) -> torch.Tensor:
        """从离散 token 重建波形"""
        with torch.no_grad():
            decoded = self.model.decode([(tokens, None)])
        return decoded[0].squeeze()`
                }
            ],
            table: {
                headers: ["模型", "生成方式", "音频压缩", "条件类型", "年份"],
                rows: [
                    ["Jukebox", "自回归 VQ-VAE", "三级 VQ", "文本 + 艺术家 + 流派", "2020"],
                    ["MusicLM", "两阶段 Transformer", "EnCodec", "文本语义 token", "2023"],
                    ["MusicGen", "自回归 + CFG", "EnCodec", "文本 / 旋律", "2023"],
                    ["Suno", "专有架构", "专有", "文本", "2024"],
                ]
            },
            mermaid: `graph LR
    A["文本描述"] --> B["MuLan 文本编码器"]
    B --> C["语义 Token"]
    C --> D["MusicLM Transformer"]
    D --> E["声学 Token 序列"]
    E --> F["EnCodec Decoder"]
    F --> G["原始波形"]
    G --> H["生成的音乐"]`,
            tip: "生成音乐时，控制温度参数和 CFG 系数可以平衡创造性和保真度。低温 + 高 CFG 产生更稳定的输出，高温 + 低 CFG 产生更多样的结果。",
            warning: "音乐生成模型生成的内容可能存在版权问题。商业用途务必确保你有权使用训练数据和生成结果，这是当前法律灰色地带。"
        },
        {
            title: "5. 音频-文本跨模态检索",
            body: `音频-文本检索旨在建立音频和文本之间的语义对齐，支持用文字搜索音频（文本到音频）和用音频搜索文字（音频到文本）两个方向。这与 CLIP 在视觉-语言领域的工作类似，核心思想是在共享嵌入空间中将相关的音频和文本拉近，不相关的推远。

实现跨模态检索的关键是对齐策略。CLAP（Contrastive Language-Audio Pretraining）借鉴 CLIP 的成功，用双塔架构分别编码音频和文本，通过对比损失学习联合嵌入空间。其训练数据来自 AudioSet 的弱标签、音频 caption 数据集和自动生成的伪标签。

检索系统的评估通常使用 Recall@K 指标：对于每个查询，检查正确结果是否出现在 Top-K 返回项中。音频-文本检索面临的独特挑战包括：音频的时序结构与文本的离散符号性质差异显著；同一段音频可以用多种文本描述；环境音和语音的语义粒度不同。解决这些问题需要精心设计的数据增强和难负样本挖掘策略。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn.functional as F
from laion_clap import CLAP_Module

class CrossModalRetriever:
    """基于 CLAP 的音频-文本双向检索系统"""
    def __init__(self, model_path: str = "laion/clap-htsat-unfused"):
        self.model = CLAP_Module(enable_fusion=False)
        self.model.load_ckpt(model_path)
        self.audio_embeddings = {}
        self.text_embeddings = {}

    def encode_audio(self, audio_path: str, key: str):
        """编码音频并存储嵌入向量"""
        audio_data, _ = librosa.load(audio_path, sr=48000)
        emb = self.model.get_audio_embedding_from_data(
            x=audio_data, use_tensor=True
        )
        self.audio_embeddings[key] = emb
        return emb

    def search_by_text(self, query: str, top_k: int = 5) -> list:
        """用文本查询检索最相似的音频"""
        text_emb = self.model.get_text_embedding(query, use_tensor=True)
        audio_embs = torch.stack(list(self.audio_embeddings.values()))
        # 计算余弦相似度
        sims = F.cosine_similarity(text_emb, audio_embs, dim=-1)
        top_indices = torch.topk(sims, k=top_k).indices
        keys = list(self.audio_embeddings.keys())
        return [(keys[i], sims[i].item()) for i in top_indices]`
                },
                {
                    lang: "python",
                    code: `import torch

def contrastive_loss(audio_emb: torch.Tensor, text_emb: torch.Tensor,
                     temperature: torch.Tensor = torch.tensor(0.07)) -> torch.Tensor:
    """计算 CLAP 风格的对比损失
    音频到文本和文本到音频两个方向的 InfoNCE 损失"""
    # 归一化嵌入
    audio_emb = F.normalize(audio_emb, dim=-1)
    text_emb = F.normalize(text_emb, dim=-1)

    # 相似度矩阵: (batch, batch)
    logits = audio_emb @ text_emb.T / temperature.exp()

    # 对角线为正样本
    labels = torch.arange(logits.size(0), device=logits.device)
    loss_a2t = F.cross_entropy(logits, labels)  # 音频->文本
    loss_t2a = F.cross_entropy(logits.T, labels)  # 文本->音频

    return (loss_a2t + loss_t2a) / 2  # 双向对称损失`
                }
            ],
            table: {
                headers: ["模型", "音频编码器", "文本编码器", "训练数据", "检索指标 R@1"],
                rows: [
                    ["CLAP (HTSAT)", "HTSAT", "RoBERTa", "AudioSet + 伪标签", "~60%"],
                    ["CLAP (PANNs)", "PANNs-14", "RoBERTa", "AudioSet + 伪标签", "~55%"],
                    ["WavCaps", "BEATs", "BERT", "AudioCaps + Clotho", "~65%"],
                    ["MuLaN", "ResNet + Transformer", "BERT", "内部数据集", "未公开"],
                ]
            },
            mermaid: `graph TD
    A["文本查询"] --> B["文本编码器"]
    C["音频库"] --> D["音频编码器"]
    B --> E["文本嵌入空间"]
    D --> F["音频嵌入空间"]
    E --> G["联合嵌入空间"]
    F --> G
    G --> H["余弦相似度计算"]
    H --> I["排序返回结果"]`,
            tip: "温度参数控制对比损失的 sharpness。较小的温度值使模型更关注难负样本，但可能导致训练不稳定。建议从 0.07 开始并通过验证集调整。",
            warning: "跨模态检索模型的性能严重依赖训练数据质量。使用网页抓取的音频-文本对时，务必进行数据清洗，去除标注噪声严重的样本。"
        },
        {
            title: "6. 多模态大模型中的音频模态",
            body: `随着多模态大语言模型（MLLM）的快速发展，音频模态正在从独立处理走向与文本、视觉的统一理解。传统方案是先用 ASR 将音频转为文本，再输入 LLM。这种 pipeline 方式丢失了韵律、音色、情感等副语言信息。真正的多模态理解需要模型直接感知音频信号。

Qwen-Audio、SpeechGPT、Pengi 等模型代表了不同的融合策略。Qwen-Audio 使用音频编码器（类似 Whisper 的 Encoder）将音频编码为连续表征，然后通过一个可训练的投影层映射到 LLM 的嵌入空间。模型同时支持音频-文本的多种指令：转录、翻译、描述、问答。

更前沿的工作如 Meta 的 Audio**PaLM** 和 Google 的 USM（Universal Speech Model）尝试用统一的 token 空间处理多种音频任务。Audio**PaLM** 将 WavLM 的音频 token 和 PaLM 的文本 token 统一到一个自回归模型中，实现了语音到语音的直接翻译。这种端到端的跨模态生成是未来的重要方向。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
from transformers import AutoModel

class AudioProjector(nn.Module):
    """将音频表征投影到 LLM 嵌入空间
    这是多模态大模型中连接音频和文本的关键组件"""
    def __init__(self, audio_dim: int = 1024, llm_dim: int = 4096):
        super().__init__()
        self.projector = nn.Sequential(
            nn.Linear(audio_dim, llm_dim),
            nn.GELU(),
            nn.Linear(llm_dim, llm_dim),
        )

    def forward(self, audio_features: torch.Tensor) -> torch.Tensor:
        """audio_features: (batch, audio_seq_len, audio_dim)
        返回: (batch, audio_seq_len, llm_dim)"""
        return self.projector(audio_features)


def build_multimodal_input(text_tokens: torch.Tensor,
                           audio_tokens: torch.Tensor,
                           projector: AudioProjector) -> torch.Tensor:
    """将音频和文本 token 拼接为统一输入序列"""
    # 投影音频 token 到 LLM 空间
    projected = projector(audio_tokens)
    # 拼接: [音频 token 序列] + [文本 token 序列]
    return torch.cat([projected, text_tokens], dim=1)`
                },
                {
                    lang: "python",
                    code: `from transformers import Qwen2AudioForConditionalGeneration, AutoProcessor
import torch

def audio_chat(audio_path: str, instruction: str) -> str:
    """使用 Qwen2-Audio 进行音频对话
    模型可以理解音频内容、说话人意图、背景信息等"""
    model = Qwen2AudioForConditionalGeneration.from_pretrained(
        "Qwen/Qwen2-Audio-7B-Instruct", torch_dtype=torch.float16
    )
    processor = AutoProcessor.from_pretrained("Qwen/Qwen2-Audio-7B-Instruct")

    conversation = [
        {"role": "user", "content": [
            {"type": "audio", "audio_url": audio_path},
            {"type": "text", "text": instruction}
        ]}
    ]
    text_prompt = processor.apply_chat_template(conversation)
    audio_input, _ = librosa.load(audio_path, sr=16000)

    inputs = processor(
        text=text_prompt, audios=[audio_input], return_tensors="pt",
        padding=True
    ).to(model.device)

    generated = model.generate(**inputs, max_new_tokens=256)
    return processor.decode(generated[0], skip_special_tokens=True)`
                }
            ],
            table: {
                headers: ["模型", "音频编码器", "LLM 基座", "能力", "参数量"],
                rows: [
                    ["Qwen2-Audio", "Whisper-Large", "Qwen2-7B", "理解+对话", "7B"],
                    ["SpeechGPT-2", "自研 Encoder", "自研 LLM", "语音对话", "未公开"],
                    ["AudioPaLM", "WavLM", "PaLM-2", "语音翻译", "未公开"],
                    ["Pengi", "AST", "GPT", "音频理解", "较小"],
                ]
            },
            mermaid: `graph TD
    A["音频信号"] --> B["音频编码器"]
    B --> C["连续音频表征"]
    C --> D["投影层 (MLP)"]
    D --> E["LLM 嵌入空间"]
    F["文本指令"] --> G["文本 Tokenizer"]
    G --> E
    E --> H["多模态 LLM"]
    H --> I["文本输出"]`,
            tip: "多模态大模型中，音频序列长度通常远长于文本。使用 pooling 或 Q-Former 等压缩策略可以显著降低计算开销。",
            warning: "将音频直接输入 LLM 时，注意上下文窗口限制。1 小时音频可能产生数万个 token，超过大多数模型的上下文上限，需要分段处理。"
        },
        {
            title: "7. 实战：用 Transformers 构建语音识别 Pipeline",
            body: `理论理解最终要落实到工程实现。本节从零构建一个完整的语音识别 pipeline，涵盖模型加载、音频处理、推理优化和结果后处理。我们将以 Whisper 为核心，展示如何在实际应用中高效使用音频-文本多模态模型。

完整的 ASR pipeline 不仅是调用模型 API，还包括：音频预处理（降噪、VAD 切分）、批量推理优化（batching、GPU 利用）、后处理（标点恢复、说话人分离）和结果评估（WER 计算）。生产环境中，还需要考虑流式推理的延迟优化和模型的量化部署。

通过实战，你将理解音频模型从原型到生产的关键差异：批处理策略对吞吐量的影响、长音频的分段策略、不同解码参数对准确率的影响。这些工程细节往往决定了系统的实际表现。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import numpy as np
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import torchaudio

class ProductionASR:
    """生产级语音识别 pipeline
    包含 VAD 切分、批量推理、后处理"""
    def __init__(self, model_name: str = "openai/whisper-large-v3"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.processor = WhisperProcessor.from_pretrained(model_name)
        self.model = WhisperForConditionalGeneration.from_pretrained(
            model_name, torch_dtype=torch.float16
        ).to(self.device)

        # VAD 用于切分长音频
        self.vad_model, _ = torch.hub.load(
            "snakers4/silero-vad", "silero_vad", force_reload=False
        )

    def transcribe_long(self, audio_path: str, chunk_duration: int = 30) -> str:
        """处理长音频：VAD 切分 → 逐段识别 → 拼接结果"""
        waveform, sr = torchaudio.load(audio_path)
        if sr != 16000:
            waveform = torchaudio.functional.resample(waveform, sr, 16000)

        # 简单分段（实际应使用 VAD）
        chunk_size = chunk_duration * 16000
        num_chunks = int(np.ceil(waveform.size(1) / chunk_size))
        results = []

        for i in range(num_chunks):
            start = i * chunk_size
            end = min((i + 1) * chunk_size, waveform.size(1))
            chunk = waveform[:, start:end]

            inputs = self.processor(
                chunk.squeeze().numpy(),
                sampling_rate=16000,
                return_tensors="pt"
            ).to(self.device)

            with torch.no_grad():
                ids = self.model.generate(
                    inputs.input_features.half(),
                    language="chinese",
                    task="transcribe"
                )
            results.append(self.processor.decode(ids[0], skip_special_tokens=True))

        return " ".join(results)`
                },
                {
                    lang: "python",
                    code: `import jiwer
from typing import List

def evaluate_asr(predictions: List[str], references: List[str]) -> dict:
    """评估语音识别结果
    计算 WER（词错误率）、CER（字符错误率）等指标"""
    # Word Error Rate
    wer = jiwer.wer(references, predictions)
    # Character Error Rate（中文更重要）
    cer = jiwer.cer(references, predictions)

    # 详细分解
    transform = jiwer.Compose([
        jiwer.RemoveMultipleSpaces(),
        jiwer.Strip(),
        jiwer.SentencesToListOfWords(),
    ])
    measures = jiwer.compute_measures(references, predictions)

    return {
        "wer": round(wer * 100, 2),      # 越低越好
        "cer": round(cer * 100, 2),       # 越低越好
        "substitutions": measures["substitutions"],
        "deletions": measures["deletions"],
        "insertions": measures["insertions"],
        "hits": measures["hits"],
    }


def optimize_throughput(audio_paths: list, asr: ProductionASR,
                        batch_size: int = 4) -> list:
    """批量推理优化：利用 GPU 并行处理多段音频"""
    all_results = []
    for i in range(0, len(audio_paths), batch_size):
        batch = audio_paths[i:i + batch_size]
        # 实际实现中应在 batch 维度并行
        for path in batch:
            all_results.append(asr.transcribe_long(path))
    return all_results`
                }
            ],
            table: {
                headers: ["优化技术", "作用", "效果", "适用场景"],
                rows: [
                    ["Flash Attention", "加速 Attention 计算", "2-3x 加速", "大模型推理"],
                    ["INT8 量化", "减少显存占用", "1.5-2x 加速，精度微降", "资源受限部署"],
                    ["VAD 切分", "长音频分段处理", "避免 OOM，保持精度", "会议/播客转录"],
                    ["批处理 (Batching)", "GPU 并行推理", "吞吐量提升 3-5x", "离线批量处理"],
                ]
            },
            mermaid: `graph LR
    A["长音频文件"] --> B["VAD 检测语音段"]
    B --> C["切分为短音频"]
    C --> D["批量送入 GPU"]
    D --> E["Whisper 推理"]
    E --> F["解码为文本"]
    F --> G["拼接 & 后处理"]
    G --> H["完整转录结果"]`,
            tip: "Whisper 的 beam_size=5 是精度和速度的良好平衡点。如果需要更高精度可以增大到 10，但推理时间会翻倍。",
            warning: "生产环境中务必添加超时和重试机制。GPU 推理可能因 OOM 或驱动问题失败，静默失败会导致数据丢失。"
        },
    ],
};
