import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-009",
    title: "多模态 LLM：视觉-语言模型",
    category: "llm",
    tags: ["多模态", "视觉语言", "LLM"],
    summary: "从 CLIP 到 GPT-4V，掌握多模态大模型的技术原理与应用",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
      {
        title: "1. 多模态学习：跨越模态的鸿沟",
        body: `多模态学习（Multimodal Learning）是人工智能从单一文本理解迈向全面感知世界的核心技术。人类的认知天然是多模态的——我们同时通过视觉、听觉、触觉和语言来理解世界，而传统 AI 模型大多局限于单一模态（仅文本或仅图像），这种局限使得模型难以真正理解复杂场景。

多模态学习的核心挑战在于模态对齐（Modality Alignment）——将不同模态的信息映射到同一个语义空间。例如，「一只棕色的狗在草地上奔跑」这句话和一张对应的图片，在人类大脑中唤起的是相同的概念，但对模型而言，文本是离散 token 序列，图像是连续像素矩阵，两者的数学表示截然不同。模态对齐的目标就是让这两种表示在某个高维空间中彼此靠近。

多模态模型的应用场景极其广泛：图文检索（输入文字找图片，或输入图片找描述）、视觉问答（VQA，看图回答问题）、图像描述生成（Image Captioning）、多模态对话（既能聊天又能看图）、具身智能（机器人结合视觉和语言指令执行任务）。**GPT-4**V、**Gemini**、**Claude** 的视觉能力，本质上都是多模态学习的产物。理解多模态学习的基础概念，是掌握后续 CLIP、LLaVA 等具体技术的前提。`,
        code: [
          {
            lang: "python",
            code: `# 多模态数据加载示例：同时处理图像和文本
from torch.utils.data import Dataset
from PIL import Image
import torch

class ImageTextDataset(Dataset):
    """同时加载图像-文本对的多模态数据集"""
    def __init__(self, image_dir, captions_file, transform):
        self.image_dir = image_dir
        self.captions = load_json(captions_file)
        self.transform = transform
        self.samples = list(self.captions.items())

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, caption = self.samples[idx]
        image = self.transform(Image.open(img_path).convert("RGB"))
        return {"image": image, "text": caption}`,
          },
          {
            lang: "python",
            code: `# 模态融合策略对比
import torch.nn as nn

class EarlyFusion(nn.Module):
    """早期融合：在输入层拼接模态"""
    def __init__(self, vision_dim=768, text_dim=768, hidden=1024):
        super().__init__()
        self.fusion = nn.Linear(vision_dim + text_dim, hidden)

    def forward(self, img_feat, text_feat):
        combined = torch.cat([img_feat, text_feat], dim=-1)
        return self.fusion(combined)

class LateFusion(nn.Module):
    """晚期融合：各模态独立处理后再融合"""
    def __init__(self, vision_dim=768, text_dim=768):
        super().__init__()
        self.vision_proj = nn.Linear(vision_dim, 512)
        self.text_proj = nn.Linear(text_dim, 512)

    def forward(self, img_feat, text_feat):
        v = self.vision_proj(img_feat)
        t = self.text_proj(text_feat)
        return v + t  # 在共享空间相加`,
          },
        ],
        table: {
          headers: ["融合策略", "时机", "优点", "缺点"],
          rows: [
            ["早期融合（Early Fusion）", "输入层", "模态交互充分", "计算量大，难扩展"],
            ["晚期融合（Late Fusion）", "输出层", "各模态独立优化", "交互不够深入"],
            ["交叉注意力（Cross-Attention）", "中间层", "细粒度对齐", "计算复杂度 O(N²)"],
            ["联合嵌入（Joint Embedding）", "特征层", "共享语义空间", "需要精心调参"],
          ],
        },
        mermaid: `graph LR
    A["图像输入"] --> C["视觉编码器"]
    B["文本输入"] --> D["文本编码器"]
    C --> E["特征融合/对齐"]
    D --> E
    E --> F["联合表示"]
    F --> G["下游任务"]`,
        tip: "初学者建议从 CLIP 开始理解多模态学习，它用最简洁的对比学习框架实现了强大的图文对齐，是理解更复杂多模态模型的最佳起点。",
        warning: "多模态数据集的构建远比单模态复杂——需要确保图文对的质量、避免噪声配对，否则模型会学到错误的关联。",
      },
      {
        title: "2. CLIP：对比学习实现图文对齐",
        body: `CLIP（Contrastive Language-Image Pre-training）是 **OpenAI** 在 2021 年提出的开创性多模态模型，它用一种简洁而优雅的方式解决了图文对齐问题——对比学习（Contrastive Learning）。CLIP 的核心思想极其简单：给定一批图像-文本对，让模型学会区分哪些是匹配的对、哪些是不匹配的对。

具体而言，CLIP 使用一个图像编码器（ViT 或 ResNet）和一个文本编码器（**Transformer**）分别提取图像和文本的特征向量。然后，通过计算所有图像-文本对的余弦相似度，构建一个 N×N 的相似度矩阵。对角线上的元素是正样本对（匹配的图文对）的相似度，非对角线元素是负样本对（不匹配的图文对）的相似度。训练目标就是最大化对角线元素的相似度，同时最小化非对角线元素的相似度。

这种设计的关键优势在于可扩展性：CLIP 不需要人工标注的类别标签，而是利用互联网上自然存在的图文对（网页上的图片和它的 alt-text 或 surrounding text）。**OpenAI** 最初训练 CLIP 时使用了 4 亿对图文数据，这使得 CLIP 获得了令人惊艳的零样本（Zero-Shot）分类能力——即使从未见过某个类别的标注数据，也能通过文本 prompt 进行分类。`,
        code: [
          {
            lang: "python",
            code: `# CLIP 对比损失计算
import torch
import torch.nn as nn
import torch.nn.functional as F

def clip_loss(image_features, text_features, logit_scale):
    """CLIP 的 InfoNCE 对比损失"""
    # 归一化特征向量
    image_features = F.normalize(image_features, dim=-1)
    text_features = F.normalize(text_features, dim=-1)

    # 计算相似度矩阵 (batch_size x batch_size)
    logits = logit_scale * image_features @ text_features.t()

    # 对角线标签：每个图像对应的正确文本
    labels = torch.arange(len(logits), device=logits.device)

    # 双向损失：图文 + 文图
    loss_i = F.cross_entropy(logits, labels)
    loss_t = F.cross_entropy(logits.t(), labels)
    return (loss_i + loss_t) / 2

# 使用示例
logit_scale = nn.Parameter(torch.ones([]) * np.log(1 / 0.07))
loss = clip_loss(img_feat, txt_feat, logit_scale.exp())`,
          },
          {
            lang: "python",
            code: `# CLIP 零样本图像分类
import torch
import clip
from PIL import Image

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# 准备候选类别
classes = ["a photo of a dog", "a photo of a cat",
           "a photo of a bird", "a photo of a car"]
text_tokens = clip.tokenize(classes).to(device)

# 编码图像和文本
image = preprocess(Image.open("test.jpg")).unsqueeze(0).to(device)
with torch.no_grad():
    image_features = model.encode_image(image)
    text_features = model.encode_text(text_tokens)

# 计算相似度并选最高分
image_features /= image_features.norm(dim=-1, keepdim=True)
text_features /= text_features.norm(dim=-1, keepdim=True)
similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)
print(f"Predicted: {classes[similarity.argmax().item()]}")`,
          },
        ],
        table: {
          headers: ["CLIP 架构变体", "视觉编码器", "文本编码器", "参数量"],
          rows: [
            ["ViT-B/32", "ViT-B (86M)", "Transformer (63M)", "~150M"],
            ["ViT-B/16", "ViT-B (86M)", "Transformer (63M)", "~150M"],
            ["ViT-L/14", "ViT-L (307M)", "Transformer (123M)", "~430M"],
            ["RN50x64", "ResNet-50x64", "Transformer (123M)", "~400M"],
          ],
        },
        mermaid: `graph LR
    A["4亿图文对"] --> B["图像编码器"]
    A --> C["文本编码器"]
    B --> D["图像特征 I"]
    C --> E["文本特征 T"]
    D --> F["相似度矩阵 I×T"]
    E --> F
    F --> G["InfoNCE 损失"]
    G --> H["优化编码器"]`,
        tip: "CLIP 的 logit_scale 参数是可训练的，初始值设为 ln(1/0.07) ≈ 1.946，这是经过实验验证的最佳起点，能确保训练初期 softmax 分布不会过于尖锐。",
        warning: "CLIP 在某些细粒度分类任务上表现不佳——例如区分不同品种的狗或不同型号的汽车。这是因为网络文本通常缺乏细粒度描述，模型学到的语义粒度较粗。",
      },
      {
        title: "3. LLaVA 架构：视觉编码器 + 投影 + LLM",
        body: `LLaVA（Large Language-and-Vision Assistant）是 2023 年最具影响力的开源多模态大模型之一，它将 CLIP 的视觉理解能力和 **LLaMA** 的语言能力巧妙结合，构建了一个能「看图说话」的视觉-语言助手。LLaVA 的架构设计堪称多模态 LLM 的教科书级范例。

LLaVA 的架构由三个核心组件组成：视觉编码器（CLIP ViT-L/14）负责将输入图像编码为一系列视觉 token（通常是 576 个 2D patch 的 1024 维特征向量）；投影层（MLP projector）是一个两层的全连接网络，将视觉特征从 CLIP 的特征空间（1024 维）映射到 **LLaMA** 的词嵌入空间（4096 维），相当于搭建了一座视觉-语言桥梁；大语言模型（LLaMA/Vicuna）接收拼接后的 token 序列（视觉 token + 文本 token），像处理纯文本一样进行自回归生成。

这种设计的美妙之处在于最小化修改——LLaVA 不需要对 LLaMA 做任何架构层面的改动，只需要在输入层注入视觉信息。这使得 LLaVA 可以复用 LLaMA 的全部训练基础设施（训练脚本、推理引擎、量化工具等），大大降低了开发和部署成本。LLaVA 证明了：一个足够强大的 LLM 加上合理的视觉注入方式，就能实现出色的多模态理解能力。`,
        code: [
          {
            lang: "python",
            code: `# LLaVA 架构核心：视觉特征投影到 LLM 词嵌入空间
import torch.nn as nn

class LlavaProjector(nn.Module):
    """两层 MLP 投影器：视觉特征 → LLM 词嵌入"""
    def __init__(self, vision_dim=1024, llm_dim=4096):
        super().__init__()
        self.linear_1 = nn.Linear(vision_dim, llm_dim)
        self.act = nn.GELU()
        self.linear_2 = nn.Linear(llm_dim, llm_dim)

    def forward(self, vision_features):
        # vision_features: [batch, num_patches, vision_dim]
        hidden = self.linear_1(vision_features)
        hidden = self.act(hidden)
        return self.linear_2(hidden)

class SimpleLLaVA(nn.Module):
    """简化的 LLaVA 模型"""
    def __init__(self, clip_model, llm_model):
        super().__init__()
        self.vision_encoder = clip_model.vision_model
        self.projector = LlavaProjector(vision_dim=1024, llm_dim=4096)
        self.llm = llm_model

    def forward(self, image, input_ids, attention_mask):
        # 1. 视觉编码
        vision_out = self.vision_encoder(image)
        # 2. 投影到 LLM 空间
        image_tokens = self.projector(vision_out.last_hidden_state)
        # 3. 拼接文本嵌入
        text_embeds = self.llm.get_input_embeddings()(input_ids)
        # 4. 联合输入 LLM
        combined = torch.cat([image_tokens, text_embeds], dim=1)
        return self.llm(inputs_embeds=combined, attention_mask=attention_mask)`,
          },
          {
            lang: "python",
            code: `# LLaVA 训练脚本（两阶段训练）
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# ===== 阶段 1：冻结 LLM，只训练投影层 =====
def train_projector_stage(model, dataloader, epochs=1):
    """阶段 1：预训练投影层，冻结视觉编码器和 LLM"""
    model.vision_encoder.requires_grad_(False)
    model.llm.requires_grad_(False)
    optimizer = torch.optim.AdamW(model.projector.parameters(), lr=1e-3)

    for epoch in range(epochs):
        for batch in dataloader:
            loss = model(batch["image"], batch["input_ids"],
                         batch["attention_mask"])
            loss.backward()
            optimizer.step()
            optimizer.zero_grad()

# ===== 阶段 2：全模型微调 =====
def train_full_model(model, dataloader, epochs=3):
    """阶段 2：解冻 LLM 后 5 层，全模型微调"""
    for param in model.llm.parameters():
        param.requires_grad = False
    # 只解冻最后 5 层
    for layer in model.llm.model.layers[-5:]:
        for param in layer.parameters():
            param.requires_grad = True
    # ... 训练逻辑同上`,
          },
        ],
        table: {
          headers: ["组件", "模型", "维度", "作用"],
          rows: [
            ["视觉编码器", "CLIP ViT-L/14", "1024D × 576 tokens", "提取图像视觉特征"],
            ["投影层", "2 层 MLP", "1024D → 4096D", "视觉特征对齐到 LLM 词嵌入"],
            ["LLM", "LLaMA-2 / Vicuna", "4096D hidden", "理解+生成多模态文本"],
            ["输出", "自回归生成", "词表大小 32K", "生成多模态回答"],
          ],
        },
        mermaid: `graph LR
    A["输入图像"] --> B["CLIP ViT-L/14"]
    B --> C["576 视觉 Tokens"]
    C --> D["MLP 投影层"]
    D --> E["576 视觉 Tokens (4096D)"]
    F["用户问题"] --> G["文本 Tokenization"]
    G --> H["文本 Tokens (4096D)"]
    E --> I["拼接 Tokens"]
    H --> I
    I --> J["LLaMA LLM"]
    J --> K["多模态回答"]`,
        tip: "LLaVA 的两阶段训练策略是其成功的关键：第一阶段冻结所有权重只训练投影层（高效对齐），第二阶段解冻部分 LLM 层进行指令微调（深度融合），这种渐进式训练比端到端训练更稳定。",
        warning: "视觉 token 数量直接影响显存消耗——576 个视觉 token 相当于约 100 个文本 token 的计算量。在长上下文场景下，需要特别注意 KV Cache 的显存占用，可能需要降低图像分辨率或使用 token 压缩策略。",
      },
      {
        title: "4. 多模态指令微调：教会模型看图说话",
        body: `多模态指令微调（Multimodal Instruction Fine-Tuning）是让视觉-语言模型真正「理解」图像内容并能用自然语言描述、推理和回答问题的关键步骤。与纯文本指令微调不同，多模态指令微调需要构造同时包含图像和文本的高质量指令数据。

LLaVA 团队构建了一个包含 665K 样本的多模态指令数据集，涵盖三大类任务：详细图像描述（让模型学会生成丰富的图像描述）、视觉问答（回答关于图像内容的各种具体问题）、复杂推理（需要模型结合视觉信息和常识进行多步推理）。这些数据的构造方式非常巧妙——先用 **GPT-4** 对 COCO 数据集的图像生成高质量的描述和问答对，再用这些数据微调模型。这种「教师模型生成数据 + 学生模型学习」的方式，使得 LLaVA 仅用 665K 样本就达到了与用更大数据集训练的模型相当的效果。

指令微调过程中有几个关键技术细节值得注意：对话模板需要正确区分图像 token、系统提示、用户指令和助手回答；损失计算只对助手回答部分计算（不计算图像 token 和用户输入的损失）；学习率要比预训练低很多（通常 2e-5 量级），以避免灾难性遗忘；批大小受限于视觉 token 带来的额外显存开销，通常需要更激进的梯度累积策略。`,
        code: [
          {
            lang: "python",
            code: `# 多模态指令数据格式
def build_multimodal_instruction(image_path, question, answer):
    """构建单条多模态指令样本"""
    return {
        "image": image_path,
        "conversations": [
            {
                "from": "human",
                "value": "<image>\\n" + question
            },
            {
                "from": "gpt",
                "value": answer
            }
        ]
    }

# 示例：视觉问答指令
sample = build_multimodal_instruction(
    image_path="coco/train2017/000000123.jpg",
    question="图中有几个人在跑步？",
    answer="图中有 3 个人在公园的小路上跑步，其中两人并肩跑在前面，一人在后面追赶。"
)`,
          },
          {
            lang: "python",
            code: `# 多模态指令微调（使用 transformers Trainer）
from transformers import TrainingArguments, Trainer

# 自定义数据整理器
class LLaVADataCollator:
    def __init__(self, tokenizer, image_processor):
        self.tokenizer = tokenizer
        self.image_processor = image_processor

    def __call__(self, features):
        # 处理图像
        images = [f["image"] for f in features]
        pixel_values = self.image_processor(images, return_tensors="pt")

        # 处理文本对话
        conversations = [f["conversations"] for f in features]
        texts = [self._format_conversation(conv) for conv in conversations]
        batch_encoding = self.tokenizer(texts, padding=True,
                                        return_tensors="pt")
        return {batch_encoding, pixel_values}

training_args = TrainingArguments(
    output_dir="./llava-sft",
    per_device_train_batch_size=2,
    gradient_accumulation_steps=16,
    learning_rate=2e-5,
    num_train_epochs=3,
    fp16=True,
    logging_steps=50,
    save_strategy="epoch",
)`,
          },
        ],
        table: {
          headers: ["指令类型", "样本数", "数据来源", "训练目标"],
          rows: [
            ["详细图像描述", "158K", "COCO captions + GPT-4 扩充", "生成丰富的图像描述"],
            ["视觉问答（VQA）", "258K", "VQAv2 + GPT-4 生成", "回答图像相关问题"],
            ["复杂推理", "249K", "GPT-4 多步推理生成", "结合视觉和常识推理"],
            ["对话", "30K", "ShareGPT 视觉扩展", "多轮视觉对话能力"],
          ],
        },
        mermaid: `graph LR
    A["COCO 图像"] --> B["GPT-4 描述生成"]
    B --> C["指令数据构造"]
    C --> D["对话模板格式化"]
    D --> E["视觉 Token 注入"]
    E --> F["微调数据 Loader"]
    F --> G["LLaVA 模型"]
    G --> H["仅回答部分计算损失"]`,
        tip: "构造多模态指令数据时，确保 <image> token 始终出现在对话的开头位置，这样模型能建立「先看图、再回答」的行为模式。随机化图像位置会显著降低模型表现。",
        warning: "多模态指令微调的数据量不需要非常大——LLaVA 只用 665K 样本就取得了很好的效果。关键在于数据质量而非数量，GPT-4 生成的高质量数据远比大量低质量网络数据有效。",
      },
      {
        title: "5. 视觉问答与图像描述：核心应用场景",
        body: `视觉问答（VQA）和图像描述（Image Captioning）是多模态 LLM 最直接、最重要的两个应用场景，它们分别代表了多模态理解的两种不同能力模式。

视觉问答要求模型同时理解图像内容和问题的语义，并将两者结合起来给出准确回答。这不仅仅是「看到」图像中的物体，还需要理解物体之间的关系、空间位置、数量属性，甚至需要进行简单的推理。例如，问题「桌子上左边的杯子是什么颜色的？」需要模型精确定位到「左边的杯子」并识别其颜色，这涉及空间推理和属性识别的复合能力。

图像描述则要求模型生成一段流畅、准确、信息丰富的自然文本来描述图像内容。好的图像描述不仅要包含图像中的主要物体和场景，还要捕捉物体的属性、关系、动作以及整体氛围。这需要模型同时具备视觉识别能力和语言表达能力——前者来自视觉编码器和预训练视觉知识，后者来自 LLM 的强大语言生成能力。多模态 LLM 在这两个任务上的表现已经接近甚至超越了专门设计的单任务模型。`,
        code: [
          {
            lang: "python",
            code: `# 视觉问答推理
from transformers import AutoProcessor, LlavaForConditionalGeneration
from PIL import Image
import torch

model_id = "llava-hf/llava-1.5-7b-hf"
processor = AutoProcessor.from_pretrained(model_id)
model = LlavaForConditionalGeneration.from_pretrained(
    model_id, torch_dtype=torch.float16, device_map="auto"
)

def ask_about_image(image_path, question):
    """视觉问答：根据图片回答问题"""
    image = Image.open(image_path)
    prompt = f"USER: <image>\\n{question}\\nASSISTANT:"
    inputs = processor(text=prompt, images=image, return_tensors="pt")
    inputs = {k: v.to("cuda") for k, v in inputs.items()}

    with torch.no_grad():
        output = model.generate(inputs, max_new_tokens=100)
    answer = processor.decode(output[0], skip_special_tokens=True)
    return answer.split("ASSISTANT:")[-1].strip()

result = ask_about_image("photo.jpg", "图中有几个人？他们穿什么颜色的衣服？")
print(f"回答: {result}")`,
          },
          {
            lang: "python",
            code: `# 图像描述生成
def generate_image_caption(image_path, style="detailed"):
    """生成不同风格的图像描述"""
    image = Image.open(image_path)

    prompts = {
        "brief": "USER: <image>\\n用一句话描述这张图片\\nASSISTANT:",
        "detailed": "USER: <image>\\n请详细描述这张图片中的所有细节，包括物体、颜色、位置和动作\\nASSISTANT:",
        "creative": "USER: <image>\\n以富有创意和诗意的方式描述这张图片\\nASSISTANT:",
        "technical": "USER: <image>\\n以技术分析的角度描述这张图片的构图、光影和色彩\\nASSISTANT:",
    }

    prompt = prompts.get(style, prompts["detailed"])
    inputs = processor(text=prompt, images=image, return_tensors="pt")

    output = model.generate(inputs, max_new_tokens=200,
                            do_sample=True, temperature=0.7)
    return processor.decode(output[0], skip_special_tokens=True)`,
          },
        ],
        table: {
          headers: ["任务", "输入", "输出", "典型评估指标", "代表数据集"],
          rows: [
            ["视觉问答 VQA", "图像 + 问题", "简短回答", "Accuracy", "VQAv2, GQA"],
            ["图像描述 Captioning", "图像", "描述文本", "CIDEr, BLEU, SPICE", "COCO Captions"],
            ["视觉推理", "图像 + 问题", "推理链 + 答案", "Accuracy", "ScienceQA"],
            ["视觉定位", "图像 + 描述", "边界框", "IoU", "RefCOCO+"],
          ],
        },
        mermaid: `graph LR
    A["输入图像"] --> B["视觉特征提取"]
    C["用户输入"] --> D["文本 Token 化"]
    B --> E["特征融合"]
    D --> E
    E --> F["多模态 LLM 推理"]
    F --> G["VQA 回答"]
    F --> H["图像描述"]
    F --> I["视觉推理"]`,
        tip: "在实际应用中，可以为不同场景定制 prompt 模板——医疗影像使用严谨的技术描述模板，电商图片使用吸引消费者的营销描述模板，这样可以大幅提升生成质量。",
        warning: "多模态 LLM 可能产生「幻觉」（hallucination）——描述图像中不存在的物体或属性。这是当前多模态模型最突出的问题之一，需要通过更好的训练数据和解码策略（如 Contrastive Decoding）来缓解。",
      },
      {
        title: "6. 视频理解扩展：从静态图像到动态视频",
        body: `将多模态 LLM 从图像理解扩展到视频理解是一个自然而又充满挑战的演进方向。视频本质上是一系列按时间排列的图像帧，但视频理解不仅仅是「对每一帧做图像理解」——它需要模型理解帧与帧之间的时序关系、动作的连续性、因果关系和动态变化。

视频理解面临几个核心技术挑战：帧数与计算量的权衡——一段 10 秒 30fps 的视频有 300 帧，全部输入模型会导致 token 数量爆炸。常见的解决方案包括均匀采样（每 N 帧取一帧）、关键帧提取（用场景检测算法找出有意义的帧）和自适应采样（根据运动量调整采样密度）。时序建模——如何让模型理解时间维度上的信息？除了直接将帧序列输入 LLM 让其自然学习时序外，还可以显式地加入时序位置编码（Temporal Position Embedding）或使用专用的时序融合模块（如 TimeSformer 中的时序注意力）。长视频理解——超过 1 分钟的视频即使采样后仍然 token 过多，需要层次化理解策略（先分段理解再全局整合）。

当前最先进的视频多模态模型包括 Video-LLaVA（直接扩展 LLaVA 架构）、LLaVA-Video、Qwen2-VL（原生支持视频输入）等。它们的核心思路大同小异：采样关键帧 → 逐帧视觉编码 → 时序融合 → 输入 LLM 生成。随着上下文窗口技术的进步，视频理解的精度和长度限制正在不断被突破。`,
        code: [
          {
            lang: "python",
            code: `# 视频帧采样策略
import cv2
import numpy as np

def uniform_sampling(video_path, num_frames=8):
    """均匀采样：等间隔抽取帧"""
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        _, frame = cap.read()
        frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    cap.release()
    return frames

def keyframe_sampling(video_path, max_frames=8):
    """关键帧采样：基于帧间差异选择代表性帧"""
    cap = cv2.VideoCapture(video_path)
    frames, prev_gray = [], None
    scores = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if prev_gray is not None:
            diff = cv2.absdiff(gray, prev_gray).mean()
            scores.append((len(frames), diff))
        frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        prev_gray = gray
    cap.release()
    # 选择差异最大的帧作为关键帧
    scores.sort(key=lambda x: x[1], reverse=True)
    indices = sorted([x[0] for x in scores[:max_frames]])
    return [frames[i] for i in indices]`,
          },
          {
            lang: "python",
            code: `# 视频理解管线
from transformers import AutoProcessor, AutoModelForVision2Seq
from PIL import Image

class VideoUnderstandingPipeline:
    """视频理解管线：采样 → 编码 → 生成"""
    def __init__(self, model_id="llava-hf/llava-1.5-7b-hf"):
        self.processor = AutoProcessor.from_pretrained(model_id)
        self.model = AutoModelForVision2Seq.from_pretrained(
            model_id, torch_dtype=torch.float16, device_map="auto"
        )

    def analyze_video(self, video_path, question, num_frames=8):
        """分析视频并回答问题"""
        # 1. 采样关键帧
        frames = uniform_sampling(video_path, num_frames)
        pil_frames = [Image.fromarray(f) for f in frames]

        # 2. 构建 prompt
        prompt = f"USER: <image>\\n这段视频展示了什么？{question}\\nASSISTANT:"

        # 3. 处理并推理
        inputs = self.processor(text=prompt, images=pil_frames,
                                return_tensors="pt")
        inputs = {k: v.to("cuda") for k, v in inputs.items()}

        output = self.model.generate(inputs, max_new_tokens=200)
        return self.processor.decode(output[0], skip_special_tokens=True)`,
          },
        ],
        table: {
          headers: ["视频理解方法", "帧采样", "时序建模", "代表模型"],
          rows: [
            ["逐帧独立", "均匀采样", "无（LLM 自然学习）", "早期 LLaVA-Video"],
            ["时序位置编码", "关键帧", "位置编码注入", "Video-LLaMA"],
            ["时序注意力", "自适应采样", "专用时序模块", "Video-LLaVA"],
            ["原生视频编码", "密集采样", "3D ViT 编码器", "Qwen2-VL"],
          ],
        },
        mermaid: `graph LR
    A["输入视频"] --> B["帧采样策略"]
    B --> C["N 帧图像"]
    C --> D["逐帧视觉编码"]
    D --> E["时序位置编码"]
    E --> F["时序融合"]
    F --> G["投影到 LLM 空间"]
    G --> H["多模态 LLM"]
    H --> I["视频理解输出"]`,
        tip: "对于大多数应用，均匀采样 8-16 帧已经能够捕捉视频的核心内容。只有在需要理解精细动作（如手势识别、体育分析）时，才需要更密集的采样策略。",
        warning: "视频理解的显存消耗是图像理解的 N 倍（N = 采样帧数）。8 帧视频相当于 8 张图的显存，在 7B 模型上可能需要 24GB+ 显存。生产环境中建议使用 LoRA 微调 + 量化来降低资源需求。",
      },
      {
        title: "7. HuggingFace 实战：使用多模态模型",
        body: `HuggingFace 生态系统为多模态 LLM 的使用提供了完整的工具链。从模型加载、推理到微调和部署，每个环节都有成熟的 API 支持。掌握 HuggingFace 的多模态工具，是将理论转化为实践的关键一步。

HuggingFace 上目前有多种开源多模态模型可供选择：LLaVA-1.5 系列是最流行的开源视觉-语言模型，提供 7B 和 13B 两个版本，在多个视觉问答基准上达到开源 SOTA；Qwen2-VL 是阿里云推出的新一代多模态模型，原生支持图像和视频输入，上下文窗口达 128K，在 OCR 和细粒度理解上表现优异；Phi-3-Vision 是微软的轻量级多模态模型（4.2B 参数），在资源受限的设备上也能运行；InternVL2 是上海人工智能实验室推出的模型，在 ImageNet 等视觉基准上达到了接近闭源模型的水平。

在实际使用中，HuggingFace 的 transformers 库提供了统一的接口来处理不同类型的多模态模型。核心组件包括：AutoProcessor（负责图像预处理和文本 tokenization 的统一封装）、AutoModelForVision2Seq（视觉到序列生成的模型接口）、Pipeline（高层 API，一行代码完成多模态推理）。理解这些组件的工作方式，能让你快速上手任何新的多模态模型。`,
        code: [
          {
            lang: "python",
            code: `# 使用 HuggingFace 进行多模态推理
from transformers import pipeline
from PIL import Image

# 方式一：使用高层 Pipeline API（最简单）
vqa_pipe = pipeline("visual-question-answering",
                     model="llava-hf/llava-1.5-7b-hf",
                     device=0)

image = Image.open("scene.jpg")
result = vqa_pipe(image, "图中有什么动物？",
                   max_new_tokens=50)
print(f"回答: {result[0]['answer']} (置信度: {result[0]['score']:.2f})")

# 方式二：使用低层 API（更灵活）
from transformers import AutoProcessor, LlavaForConditionalGeneration

processor = AutoProcessor.from_pretrained("llava-hf/llava-1.5-7b-hf")
model = LlavaForConditionalGeneration.from_pretrained(
    "llava-hf/llava-1.5-7b-hf",
    torch_dtype=torch.float16,
    device_map="auto",
)

prompt = "USER: <image>\\n描述这张图片\\nASSISTANT:"
inputs = processor(text=prompt, images=image, return_tensors="pt")
output = model.generate(inputs, max_new_tokens=200, do_sample=True)
print(processor.decode(output[0], skip_special_tokens=True))`,
          },
          {
            lang: "python",
            code: `# 多模型对比评测框架
from transformers import AutoProcessor, AutoModelForVision2Seq
import torch
import time

class MultimodalBenchmark:
    """多模态模型对比评测"""
    def __init__(self):
        self.models = {
            "llava-7b": "llava-hf/llava-1.5-7b-hf",
            "qwen2-vl": "Qwen/Qwen2-VL-7B-Instruct",
            "phi3-vision": "microsoft/Phi-3-vision-128k-instruct",
        }
        self.loaded = {}

    def load_model(self, name):
        if name not in self.loaded:
            model_id = self.models[name]
            proc = AutoProcessor.from_pretrained(model_id,
                                                  trust_remote_code=True)
            model = AutoModelForVision2Seq.from_pretrained(
                model_id, torch_dtype=torch.float16,
                device_map="auto", trust_remote_code=True
            )
            self.loaded[name] = (proc, model)
        return self.loaded[name]

    def evaluate(self, name, image, question):
        proc, model = self.load_model(name)
        prompt = f"USER: <image>\\n{question}\\nASSISTANT:"
        inputs = proc(text=prompt, images=image, return_tensors="pt")
        start = time.time()
        output = model.generate(**inputs, max_new_tokens=100)
        elapsed = time.time() - start
        return proc.decode(output[0], skip_special_tokens=True), elapsed`,
          },
        ],
        table: {
          headers: ["模型", "参数量", "视觉编码器", "上下文长度", "亮点"],
          rows: [
            ["LLaVA-1.5 7B", "7B", "CLIP ViT-L/14", "4K", "开源生态最完善"],
            ["LLaVA-1.5 13B", "13B", "CLIP ViT-L/14", "4K", "准确率更高"],
            ["Qwen2-VL 7B", "7B", "自研 ViT", "128K", "OCR + 视频原生支持"],
            ["Phi-3-Vision", "4.2B", "CLIP ViT", "128K", "轻量高效，端侧可运行"],
            ["InternVL2 26B", "26B", "InternViT", "8K", "视觉基准开源 SOTA"],
          ],
        },
        mermaid: `graph LR
    A["选择多模态模型"] --> B["AutoProcessor 加载"]
    A --> C["AutoModel 加载"]
    B --> D["图像预处理 + 文本编码"]
    C --> E["模型推理"]
    D --> E
    E --> F["generate() 生成"]
    F --> G["decode() 解码"]
    G --> H["多模态输出"]`,
        tip: "首次使用 HuggingFace 多模态模型时，建议先用 LLaVA-1.5 7B 上手——它的 API 最标准化、社区文档最完善、遇到问题的解决资源也最多。熟练后再尝试其他模型。",
        warning: "多模态模型的推理速度远慢于纯文本模型——7B LLaVA 处理一张图 + 一个问题的推理时间通常在 3-10 秒。生产环境中务必考虑使用 vLLM 的多模态推理支持、模型量化（AWQ/GPTQ）或 API 服务来降低延迟。",
      },
    ],
  };
