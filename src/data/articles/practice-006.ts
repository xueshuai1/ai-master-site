import { Article } from '../knowledge';

export const article: Article = {
  id: "practice-006",
  title: "AI 在医疗健康中的应用",
  category: "practice",
  tags: ["医疗健康", "AI应用", "医学影像"],
  summary: "从医学影像到药物发现，掌握 AI 在医疗健康领域的核心应用",
  date: "2026-04-12",
  readTime: "18 min",
  level: "高级",
  content: [
    {
      title: "1. 医疗 AI 概述",
      body: `人工智能正在深刻改变医疗健康行业的面貌。从辅助诊断到药物研发，从基因组学到公共卫生监测，AI 技术在医疗领域的渗透速度远超其他行业。医疗 AI 的核心价值在于处理海量、高维的医学数据——影像、病历、基因序列、生理信号——这些数据远超人类医生的处理能力。深度学习在图像识别领域的突破直接推动了医学影像分析的革命，自然语言处理技术使得电子病历的结构化成为可能，图神经网络则加速了分子相互作用预测。医疗 AI 系统面临着独特的挑战：数据隐私保护、模型可解释性、标注数据稀缺、类别极度不均衡以及监管审批。这些挑战要求工程师不仅要掌握算法，还要理解医疗行业的运作方式和合规要求。医疗 AI 不是替代医生，而是增强医生的能力——让医生从重复性工作中解放出来，将更多时间投入患者关怀和复杂决策中。`,
      code: [
        {
          lang: "python",
          code: `# 医疗 AI 系统架构
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Dict
import numpy as np

@dataclass
class PatientRecord:
    patient_id: str
    age: int
    gender: str
    vital_signs: Dict[str, float]
    lab_results: Dict[str, float]
    imaging_data: Optional[np.ndarray] = None
    medical_history: List[str] = None

@dataclass
class PredictionResult:
    diagnosis: str
    confidence: float
    explanation: str
    recommended_actions: List[str]

class MedicalAIModel(ABC):
    @abstractmethod
    def predict(self, patient: PatientRecord) -> PredictionResult:
        pass

    @abstractmethod
    def explain(self, patient: PatientRecord) -> str:
        pass

    @abstractmethod
    def get_uncertainty(self, patient: PatientRecord) -> float:
        pass`
        },
        {
          lang: "python",
          code: `# 医疗数据评估指标
import numpy as np
from sklearn.metrics import confusion_matrix, roc_auc_score

def medical_metrics(y_true: np.ndarray, y_pred: np.ndarray,
                    y_prob: np.ndarray) -> dict:
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    sensitivity = tp / (tp + fn)
    specificity = tn / (tn + fp)
    precision = tp / (tp + fp)
    f1 = 2 * precision * sensitivity / (precision + sensitivity)
    npv = tn / (tn + fn)
    auc = roc_auc_score(y_true, y_prob)
    youden = sensitivity + specificity - 1
    return {
        "sensitivity": round(sensitivity, 4),
        "specificity": round(specificity, 4),
        "precision": round(precision, 4),
        "f1_score": round(f1, 4),
        "npv": round(npv, 4),
        "auc_roc": round(auc, 4),
        "youden_index": round(youden, 4)
    }`
        }
      ],
      table: {
        headers: ["应用领域", "核心技术", "数据模态", "典型准确率"],
        rows: [
          ["医学影像", "CNN, Vision Transformer", "X光, CT, MRI", "90%-98%"],
          ["电子病历", "NLP, BERT", "文本, 结构化数据", "85%-95%"],
          ["药物发现", "GNN, 生成模型", "分子图, 蛋白质序列", "60%-80%"],
          ["基因组学", "深度学习, 统计方法", "DNA 序列, 表达量", "75%-92%"],
          ["生理监测", "时序模型, 异常检测", "ECG, EEG, 血氧", "88%-96%"]
        ]
      },
      mermaid: `graph TD
    A["医疗数据源"] --> B["影像数据"]
    A --> C["电子病历"]
    A --> D["基因组数据"]
    A --> E["生理信号"]
    B --> F["AI 分析引擎"]
    C --> F
    D --> F
    E --> F
    F --> G["辅助诊断"]
    F --> H["风险预警"]
    F --> I["治疗方案推荐"]
    G --> J["医生决策"]
    H --> J
    I --> J`,
      tip: "医疗 AI 项目启动前，先与临床医生深入沟通，明确真正的临床痛点和评估标准，技术先进不等于临床有用",
      warning: "医疗 AI 模型的输出永远不能替代医生的最终诊断，系统必须明确标注辅助定位并保留人工审核环节"
    },
    {
      title: "2. 医学影像分析",
      body: `医学影像是医疗 AI 最成熟的应用领域。X 光、CT、MRI、超声、病理切片等影像数据天然适合深度学习处理，因为卷积神经网络在图像识别任务上已经超越了人类专家的水平。在肺结节检测中，AI 系统可以在 CT 扫描中自动定位毫米级别的微小结节，灵敏度达到 95% 以上。乳腺癌筛查方面，AI 辅助阅片可以将假阳性率降低 5% 到 10%，显著减少不必要的活检。眼底影像分析可以自动检测糖尿病视网膜病变的五个严重程度等级，在资源匮乏地区发挥重要作用。医学影像分析的核心技术包括图像分割（U-Net 及其变体）、目标检测（Faster R-CNN、YOLO 适配版）、图像分类（ResNet、EfficientNet、Vision Transformer）和图像配准。当前的前沿方向是多模态影像融合、自监督预训练以及可解释性分析——医生需要知道 AI 是基于哪些影像特征做出判断的。`,
      code: [
        {
          lang: "python",
          code: `# U-Net 医学图像分割（PyTorch）
import torch
import torch.nn as nn

class DoubleConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True)
        )
    def forward(self, x):
        return self.conv(x)

class UNet(nn.Module):
    def __init__(self, in_channels=1, num_classes=2):
        super().__init__()
        self.enc1 = DoubleConv(in_channels, 64)
        self.enc2 = DoubleConv(64, 128)
        self.enc3 = DoubleConv(128, 256)
        self.enc4 = DoubleConv(256, 512)
        self.pool = nn.MaxPool2d(2)
        self.bottleneck = DoubleConv(512, 1024)
        self.up4 = nn.ConvTranspose2d(1024, 512, 2, stride=2)
        self.dec4 = DoubleConv(1024, 512)
        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec3 = DoubleConv(512, 256)
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = DoubleConv(256, 128)
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = DoubleConv(128, 64)
        self.out = nn.Conv2d(64, num_classes, 1)
    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2))
        e4 = self.enc4(self.pool(e3))
        b = self.bottleneck(self.pool(e4))
        d4 = self.dec4(torch.cat([self.up4(b), e4], dim=1))
        d3 = self.dec3(torch.cat([self.up3(d4), e3], dim=1))
        d2 = self.dec2(torch.cat([self.up2(d3), e2], dim=1))
        d1 = self.dec1(torch.cat([self.up1(d2), e1], dim=1))
        return self.out(d1)`
        },
        {
          lang: "python",
          code: `# 医学影像数据增强与预处理
import albumentations as A
import numpy as np

class MedicalImageAugmentor:
    def __init__(self, train=True):
        if train:
            self.transform = A.Compose([
                A.HorizontalFlip(p=0.5),
                A.RandomBrightnessContrast(brightness_limit=0.15, contrast_limit=0.15, p=0.5),
                A.ShiftScaleRotate(shift_limit=0.05, scale_limit=0.1, rotate_limit=15, p=0.5),
                A.GaussNoise(var_limit=(10.0, 50.0), p=0.3),
                A.Normalize(mean=[0.5], std=[0.5])
            ])
        else:
            self.transform = A.Compose([A.Normalize(mean=[0.5], std=[0.5])])
    def __call__(self, image, mask=None):
        if mask is not None:
            transformed = self.transform(image=image, mask=mask)
            return transformed["image"], transformed["mask"]
        return self.transform(image=image)["image"]

def load_dicom_image(filepath: str) -> np.ndarray:
    import pydicom
    ds = pydicom.dcmread(filepath)
    image = ds.pixel_array.astype(np.float32)
    image = image * ds.RescaleSlope + ds.RescaleIntercept
    image = np.clip(image, -1000, 1000)
    image = (image + 1000) / 2000.0
    return image`
        }
      ],
      table: {
        headers: ["影像模态", "分辨率", "常用模型", "主要挑战"],
        rows: [
          ["X 光胸片", "1024x1024", "DenseNet-121, EfficientNet", "重叠结构遮挡"],
          ["CT 扫描", "512x512xN 层", "3D U-Net, nnU-Net", "三维计算量大"],
          ["MRI", "256x256xN 层", "nnU-Net, TransUNet", "多序列配准"],
          ["病理切片", "100000x100000", "ResNet + 多实例学习", "超高分辨率"],
          ["超声影像", "640x480", "MobileNetV3, YOLO", "噪声多, 实时性"]
        ]
      },
      mermaid: `graph LR
    A["原始影像"] --> B["预处理
HU归一化"]
    B --> C["数据增强
翻转/旋转/噪声"]
    C --> D["特征提取
CNN/Transformer"]
    D --> E["多尺度融合
跳跃连接"]
    E --> F["分割/检测头"]
    F --> G["后处理
连通域分析"]
    G --> H["临床报告"]`,
      tip: "医学影像分割首选 nnU-Net，它自适应配置网络架构和训练策略，在多个医疗分割基准上取得最优结果",
      warning: "DICOM 影像必须做 HU 值转换和窗宽窗位调整，直接使用原始像素值会导致模型完全无法学习"
    },
    {
      title: "3. 电子病历分析",
      body: `电子病历包含患者的完整医疗记录，涵盖主诉、诊断、处方、检验报告、病程记录等丰富信息。然而电子病历数据的 80% 以上是非结构化文本，传统方法难以有效利用。自然语言处理技术，特别是预训练语言模型如 BERT 和 ClinicalBERT，为电子病历分析带来了革命性变化。实体识别可以自动提取病历中的疾病、药物、检验指标等关键实体；关系抽取能够建立实体之间的关联，如药物与副作用关系；文本分类可以用于自动编码、入院风险评估和再入院预测。时序电子病历分析则关注患者多次就诊记录的演变模式，使用 LSTM、Transformer 等时序模型预测疾病进展和并发症风险。电子病历分析面临的核心挑战包括医学术语标准化、数据缺失处理、时间戳不统一以及隐私保护。`,
      code: [
        {
          lang: "python",
          code: `# 临床 NER - 医疗实体识别
import torch
import torch.nn as nn
from transformers import AutoModel

class ClinicalNER(nn.Module):
    def __init__(self, model_name="emilyalsentzer/Bio_ClinicalBERT", num_labels=13, dropout=0.1):
        super().__init__()
        self.bert = AutoModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(self.bert.config.hidden_size, num_labels)
        self.id2label = {
            0: "O", 1: "B-DISEASE", 2: "I-DISEASE",
            3: "B-DRUG", 4: "I-DRUG",
            5: "B-SYMPTOM", 6: "I-SYMPTOM",
            7: "B-PROCEDURE", 8: "I-PROCEDURE",
            9: "B-LAB", 10: "I-LAB",
            11: "B-ANATOMY", 12: "I-ANATOMY"
        }
    def forward(self, input_ids, attention_mask, labels=None):
        outputs = self.bert(input_ids, attention_mask=attention_mask)
        sequence_output = self.dropout(outputs.last_hidden_state)
        logits = self.classifier(sequence_output)
        if labels is not None:
            loss_fn = nn.CrossEntropyLoss()
            loss = loss_fn(logits.view(-1, 13), labels.view(-1))
            return {"loss": loss, "logits": logits}
        return {"logits": logits}

    def predict_entities(self, text, tokenizer):
        inputs = tokenizer(text, return_tensors="pt", truncation=True)
        with torch.no_grad():
            outputs = self(**inputs)
        preds = torch.argmax(outputs["logits"], dim=-1)[0].tolist()
        tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
        return self._decode_biluo(tokens, preds)`
        },
        {
          lang: "python",
          code: `# 时序电子病历 - 疾病风险预测
import torch
import torch.nn as nn
import math

class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=512):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2) * -(math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer("pe", pe)
    def forward(self, x):
        return x + self.pe[:x.size(0)]

class EHRTransformer(nn.Module):
    def __init__(self, n_codes=10000, d_model=256, nhead=8, num_layers=4, num_classes=5):
        super().__init__()
        self.embedding = nn.Embedding(n_codes, d_model)
        self.pos_encoder = PositionalEncoding(d_model)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=nhead, dim_feedforward=512,
            dropout=0.1, batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.classifier = nn.Sequential(
            nn.Linear(d_model, 128), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )
    def forward(self, visits, mask=None):
        x = self.embedding(visits) * math.sqrt(256)
        x = self.pos_encoder(x)
        x = self.transformer(x, src_key_padding_mask=mask)
        lengths = mask.eq(False).sum(dim=1) - 1
        last_visit = x[torch.arange(x.size(0)), lengths]
        return self.classifier(last_visit)`
        }
      ],
      table: {
        headers: ["任务类型", "输入数据", "输出形式", "常用模型"],
        rows: [
          ["实体识别", "临床文本", "实体边界+类型", "ClinicalBERT, BioBERT"],
          ["ICD 编码", "出院摘要", "诊断编码列表", "CAML, PLM-ICD"],
          ["再入院预测", "时序就诊记录", "概率+时间窗", "Transformer, GRU"],
          ["表型提取", "混合数据", "患者分组", "聚类+规则引擎"],
          ["药物相互作用", "处方+文献", "相互作用类型", "知识图谱+LLM"]
        ]
      },
      mermaid: `graph TD
    A["电子病历原文"] --> B["文本预处理"]
    B --> C["分词与标准化"]
    C --> D["预训练语言模型"]
    D --> E["任务适配层"]
    E --> F["实体识别"]
    E --> G["关系抽取"]
    E --> H["文本分类"]
    F --> I["结构化知识库"]
    G --> I
    H --> J["风险评估"]
    I --> K["临床决策支持"]
    J --> K`,
      tip: "处理中文电子病历时，建议使用哈工大 CINO 或中医大中文临床 BERT，这些模型在中文医疗 NLP 任务上预训练过",
      warning: "电子病历包含大量缩写和简写，同一术语在不同医院甚至不同医生之间可能有不同表述，必须先做术语标准化"
    },
    {
      title: "4. 药物发现与分子设计",
      body: `传统药物发现是一个耗时 10 到 15 年、花费超过 20 亿美元的漫长过程，AI 正在从根本上加速这一流程。AI 辅助药物发现覆盖了从靶点识别、分子筛选、先导化合物优化到临床试验设计的完整链条。在分子表征方面，SMILES 字符串、分子图和 3D 构象是最常用的表示方法。图神经网络可以自然地处理分子的图结构，学习原子和化学键的表征。生成模型（VAE、GAN、扩散模型、流模型）被用于从头设计具有特定性质的新分子。分子对接预测小分子与靶蛋白的结合亲和力，深度学习模型显著提升了预测精度。AI 在药物发现中的关键突破是 AlphaFold——它解决了蛋白质结构预测这一五十年难题，为基于结构的药物设计提供了可靠的基础。ADMET 性质的早期预测可以避免后期失败，大幅降低研发成本。`,
      code: [
        {
          lang: "python",
          code: `# 分子图神经网络（PyTorch + DGL）
import torch
import torch.nn as nn

class AtomEncoder(nn.Module):
    def __init__(self, emb_dim=64):
        super().__init__()
        self.atomic_number_emb = nn.Embedding(100, emb_dim)
        self.degree_emb = nn.Embedding(6, emb_dim)
        self.formal_charge_emb = nn.Embedding(22, emb_dim)
        self.hybridization_emb = nn.Embedding(5, emb_dim)
    def forward(self, atom_features):
        h = (
            self.atomic_number_emb(atom_features["atomic_number"])
            + self.degree_emb(atom_features["degree"])
            + self.formal_charge_emb(atom_features["formal_charge"])
            + self.hybridization_emb(atom_features["hybridization"])
        )
        return h

class BondEncoder(nn.Module):
    def __init__(self, emb_dim=64):
        super().__init__()
        self.bond_type_emb = nn.Embedding(4, emb_dim)
        self.conjugated_emb = nn.Embedding(2, emb_dim)
        self.in_ring_emb = nn.Embedding(2, emb_dim)
    def forward(self, bond_features):
        return (
            self.bond_type_emb(bond_features["bond_type"])
            + self.conjugated_emb(bond_features["conjugated"])
            + self.in_ring_emb(bond_features["in_ring"])
        )

class MPNN(nn.Module):
    def __init__(self, node_dim=64, edge_dim=64, n_layers=4, out_dim=1):
        super().__init__()
        self.atom_encoder = AtomEncoder(node_dim)
        self.bond_encoder = BondEncoder(edge_dim)
        self.message_layers = nn.ModuleList([
            nn.Sequential(
                nn.Linear(node_dim * 2 + edge_dim, node_dim * 2),
                nn.ReLU(),
                nn.Linear(node_dim * 2, node_dim)
            ) for _ in range(n_layers)
        ])
        self.readout = nn.Sequential(
            nn.Linear(node_dim, 64), nn.ReLU(), nn.Linear(64, out_dim)
        )
    def forward(self, graph):
        h = self.atom_encoder(graph.ndata)
        e = self.bond_encoder(graph.edata)
        for msg_layer in self.message_layers:
            graph.ndata["h"] = h
            graph.edata["e"] = e
            graph.update_all(
                message_func=lambda edges: {"m": msg_layer(torch.cat([edges.src["h"], edges.dst["h"], edges.data["e"]], dim=-1))},
                reduce_func=lambda nodes: {"h_new": torch.sum(nodes.mailbox["m"], dim=1)}
            )
            h = h + graph.ndata["h_new"]
        with graph.local_scope():
            graph.ndata["h"] = h
            return self.readout(dgl.sum_nodes(graph, "h"))`
        },
        {
          lang: "python",
          code: `# 分子生成 - 基于 VAE 的分子设计
import torch
import torch.nn as nn
import torch.nn.functional as F

class MoleculeVAE(nn.Module):
    def __init__(self, vocab_size=64, max_len=120, hidden_dim=256, latent_dim=56):
        super().__init__()
        self.max_len = max_len
        self.vocab_size = vocab_size
        self.hidden_dim = hidden_dim
        self.latent_dim = latent_dim
        self.encoder = nn.GRU(input_size=vocab_size, hidden_size=hidden_dim, num_layers=3, dropout=0.2, batch_first=True)
        self.fc_mu = nn.Linear(hidden_dim, latent_dim)
        self.fc_logvar = nn.Linear(hidden_dim, latent_dim)
        self.decoder = nn.GRU(input_size=vocab_size, hidden_size=hidden_dim, num_layers=3, dropout=0.2, batch_first=True)
        self.fc_out = nn.Linear(hidden_dim, vocab_size)
    def encode(self, smiles_onehot):
        _, h = self.encoder(smiles_onehot)
        mu = self.fc_mu(h[-1])
        logvar = self.fc_logvar(h[-1])
        return mu, logvar
    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std
    def decode(self, z):
        batch_size = z.size(0)
        h = z.unsqueeze(0).repeat(3, 1, 1)
        outputs = []
        x = torch.zeros(batch_size, 1, self.vocab_size, device=z.device)
        for _ in range(self.max_len):
            out, h = self.decoder(x, h)
            logits = self.fc_out(out[:, -1, :])
            outputs.append(logits)
            next_token = F.gumbel_softmax(logits, hard=True)
            x = next_token.unsqueeze(1)
        return torch.stack(outputs, dim=1)
    def forward(self, smiles_onehot):
        mu, logvar = self.encode(smiles_onehot)
        z = self.reparameterize(mu, logvar)
        return self.decode(z), mu, logvar`
        }
      ],
      table: {
        headers: ["方法", "表示方式", "优势", "局限"],
        rows: [
          ["SMILES + RNN", "字符串序列", "简单, 数据丰富", "语法无效分子多"],
          ["分子图 + GNN", "图结构", "天然表达化学键", "3D 构象信息丢失"],
          ["3D 等变网络", "原子坐标+特征", "捕获空间相互作用", "计算成本高"],
          ["扩散模型生成", "渐进去噪", "生成质量高, 多样性好", "推理速度慢"],
          ["片段连接", "分子片段组装", "保证化学合理性", "片段库依赖性强"]
        ]
      },
      mermaid: `graph LR
    A["靶点蛋白"] --> B["结构预测
AlphaFold"]
    B --> C["结合口袋分析"]
    D["化合物库"] --> E["虚拟筛选
GNN 评分"]
    C --> E
    E --> F["命中化合物"]
    F --> G["先导优化
生成模型"]
    G --> H["ADMET 预测"]
    H --> I{"性质达标?"}
    I -->|"否"| G
    I -->|"是"| J["临床前候选药物"]`,
      tip: "分子生成模型必须配合有效性检查，确保生成的 SMILES 字符串能转化为合法化学结构",
      warning: "AI 生成的分子可能在化学上合法但合成难度极高，需要同时训练合成可及性评分模型过滤不切实际的候选物"
    },
    {
      title: "5. 基因组学与精准医疗",
      body: `基因组学是医疗 AI 中数据量最大、复杂度最高的领域。人类基因组包含约 30 亿个碱基对，每个人的基因组变异构成了个体化医疗的基础。深度学习在基因组学中的应用包括变异检测、基因表达预测、调控元件识别和表型关联分析。DeepVariant 使用 CNN 将基因组变异检测的准确率提升到了传统统计方法之上，被 Google 开源后成为行业标准之一。Enformer 模型能够直接从 DNA 序列预测基因表达和表观遗传修饰，揭示了非编码区调控机制。精准医疗的核心理念是根据患者的基因组特征制定个性化治疗方案——同一药物在不同基因型患者身上的疗效和副作用可能截然不同。药物基因组学分析可以预测患者对特定药物的代谢能力，避免严重不良反应。多组学整合分析正在构建更全面的疾病分子图谱。`,
      code: [
        {
          lang: "python",
          code: `# DNA 序列分类模型
import torch
import torch.nn as nn
import torch.nn.functional as F

class DNABertClassifier(nn.Module):
    def __init__(self, vocab_size=6, max_seq=1000, n_classes=2, embed_dim=128):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.conv1 = nn.Conv1d(embed_dim, 256, kernel_size=8, padding=3)
        self.conv2 = nn.Conv1d(256, 512, kernel_size=4, padding=1)
        self.conv3 = nn.Conv1d(512, 256, kernel_size=4, padding=1)
        self.bn1 = nn.BatchNorm1d(256)
        self.bn2 = nn.BatchNorm1d(512)
        self.bn3 = nn.BatchNorm1d(256)
        self.pool = nn.AdaptiveMaxPool1d(1)
        self.classifier = nn.Sequential(
            nn.Linear(256, 128), nn.ReLU(), nn.Dropout(0.4),
            nn.Linear(128, 64), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(64, n_classes)
        )
    def forward(self, x):
        x = self.embedding(x).transpose(1, 2)
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.max_pool1d(x, 4)
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.max_pool1d(x, 4)
        x = F.relu(self.bn3(self.conv3(x)))
        x = self.pool(x).squeeze(-1)
        return self.classifier(x)

def encode_dna(sequence: str, max_len: int = 1000) -> torch.Tensor:
    base_to_idx = {"A": 0, "C": 1, "G": 2, "T": 3, "N": 4}
    encoded = [base_to_idx.get(b.upper(), 4) for b in sequence[:max_len]]
    while len(encoded) < max_len:
        encoded.append(4)
    return torch.tensor(encoded[:max_len])`
        },
        {
          lang: "python",
          code: `# 药物基因组学 - 药物反应预测
import torch
import torch.nn as nn
from sklearn.preprocessing import StandardScaler

class DrugResponsePredictor(nn.Module):
    def __init__(self, n_genes=1000, n_drug_features=256, hidden_dim=512):
        super().__init__()
        self.gene_encoder = nn.Sequential(
            nn.Linear(n_genes, 1024), nn.BatchNorm1d(1024), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(1024, 256), nn.ReLU(),
        )
        self.drug_encoder = nn.Sequential(
            nn.Linear(n_drug_features, 256), nn.ReLU(),
            nn.Linear(256, 128), nn.ReLU(),
        )
        self.predictor = nn.Sequential(
            nn.Linear(256 + 128, 256), nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(256, 128), nn.ReLU(),
            nn.Linear(128, 1)
        )
    def forward(self, gene_expr, drug_feat):
        g = self.gene_encoder(gene_expr)
        d = self.drug_encoder(drug_feat)
        combined = torch.cat([g, d], dim=1)
        return self.predictor(combined)

def predict_drug_sensitivity(model, gene_data, drug_data, scaler):
    model.eval()
    gene_norm = torch.tensor(scaler.transform(gene_data), dtype=torch.float32)
    drug_tensor = torch.tensor(drug_data, dtype=torch.float32)
    with torch.no_grad():
        ic50_pred = model(gene_norm, drug_tensor)
    sensitivity = -torch.log10(ic50_pred.squeeze())
    return sensitivity.numpy()`
        }
      ],
      table: {
        headers: ["分析任务", "输入数据", "AI 方法", "应用场景"],
        rows: [
          ["变异检测", "测序 reads", "DeepVariant (CNN)", "遗传病诊断"],
          ["基因表达预测", "DNA 序列", "Enformer (Transformer)", "调控机制研究"],
          ["药物反应预测", "基因表达谱", "多模态融合网络", "精准用药"],
          ["癌症亚型分类", "多组学数据", "自编码器+聚类", "个体化治疗"],
          ["启动子预测", "基因组序列", "卷积+注意力", "基因工程"]
        ]
      },
      mermaid: `graph TD
    A["患者样本"] --> B["全基因组测序"]
    B --> C["变异检测
DeepVariant"]
    C --> D["变异注释"]
    D --> E["药物基因组分析"]
    E --> F["药物敏感性矩阵"]
    F --> G["治疗方案推荐"]
    D --> H["遗传风险评估"]
    H --> I["预防策略"]
    G --> J["精准医疗方案"]
    I --> J`,
      tip: "基因组数据分析需要大量计算资源，建议先在染色体子集上验证管道，确认无误后再扩展到全基因组",
      warning: "基因数据的隐私风险极高，必须做匿名化处理，遵循 HIPAA 和 GDPR 等法规要求，不可直接用于模型训练"
    },
    {
      title: "6. 监管合规与隐私保护",
      body: `医疗 AI 面临的监管要求是所有行业中最严格的。FDA 于 2021 年发布了 AI/ML 医疗设备软件行动框架，确立了预先确定变更控制计划的概念，允许 AI 模型在获批后安全地持续学习。中国国家药监局也发布了深度学习辅助决策医疗器械软件审评要点，明确了临床评价和算法变更的管理要求。隐私保护是医疗 AI 的另一大挑战——患者的健康信息是最敏感的个人数据。联邦学习允许多家医疗机构在不共享原始数据的前提下联合训练模型，已经在真实场景中验证了这一技术。差分隐私通过在训练过程中添加受控噪声，从数学上保证模型不会泄露任何个体的信息。模型的安全性和鲁棒性也至关重要——医疗 AI 对对抗样本的敏感性可能导致错误诊断。合规性要求贯穿整个 AI 生命周期：数据采集需获得知情同意，模型开发需遵循良好机器学习规范，部署后需持续监控性能漂移。`,
      code: [
        {
          lang: "python",
          code: `# 联邦学习 - 多医院联合训练
import torch
import torch.nn as nn
import copy

class FederatedAveraging:
    def __init__(self, model_class, n_clients=5, lr=0.01):
        self.global_model = model_class()
        self.n_clients = n_clients
        self.lr = lr
    def client_update(self, client_data, client_labels, local_epochs=5):
        model = copy.deepcopy(self.global_model)
        optimizer = torch.optim.SGD(model.parameters(), lr=self.lr)
        criterion = nn.CrossEntropyLoss()
        for epoch in range(local_epochs):
            optimizer.zero_grad()
            outputs = model(client_data)
            loss = criterion(outputs, client_labels)
            loss.backward()
            optimizer.step()
        return model.state_dict()
    def federated_round(self, client_datasets):
        client_weights = []
        for data, labels in client_datasets:
            local_weights = self.client_update(data, labels)
            client_weights.append(local_weights)
        global_weights = copy.deepcopy(self.global_model.state_dict())
        for key in global_weights:
            global_weights[key] = torch.stack([w[key] for w in client_weights]).mean(dim=0)
        self.global_model.load_state_dict(global_weights)
        return global_weights`
        },
        {
          lang: "python",
          code: `# 差分隐私 - DP-SGD 实现
import torch
from torch.nn.utils import clip_grad_norm_
import numpy as np

class DPSGDTrainer:
    def __init__(self, model, noise_multiplier=1.0, max_grad_norm=1.0, batch_size=64):
        self.model = model
        self.noise_multiplier = noise_multiplier
        self.max_grad_norm = max_grad_norm
        self.batch_size = batch_size
    def compute_dp_noise(self):
        return self.noise_multiplier * self.max_grad_norm
    def train_step_dp(self, data, labels, optimizer):
        optimizer.zero_grad()
        outputs = self.model(data)
        loss = torch.nn.functional.cross_entropy(outputs, labels, reduction="none")
        for i in range(len(loss)):
            loss[i].backward(retain_graph=True)
        clip_grad_norm_(self.model.parameters(), self.max_grad_norm)
        noise_std = self.compute_dp_noise()
        for param in self.model.parameters():
            noise = torch.normal(0, noise_std, param.grad.shape, device=param.device)
            param.grad += noise
        optimizer.step()
        return loss.mean().item()
    def estimate_privacy_budget(self, n_steps, dataset_size):
        q = self.batch_size / dataset_size
        sigma = self.noise_multiplier
        epsilon = np.sqrt(2 * n_steps * np.log(1.25 / 1e-5)) * q / sigma
        return epsilon`
        }
      ],
      table: {
        headers: ["合规框架", "适用范围", "核心要求", "AI 特殊要求"],
        rows: [
          ["HIPAA", "美国医疗数据", "最小必要原则, 访问控制", "AI 推理日志审计"],
          ["GDPR", "欧盟个人数据", "数据主体权利, 跨境传输", "自动化决策解释权"],
          ["FDA AI/ML 框架", "美国医疗器械", "临床验证, 变更管理", "PCCP, 真实世界监控"],
          ["NMPA 指南", "中国医疗器械", "算法变更管理, 临床评价", "训练数据代表性"],
          ["ISO 13485", "质量管理", "全生命周期管理", "模型版本追溯"]
        ]
      },
      mermaid: `graph TD
    A["原始医疗数据"] --> B["匿名化处理"]
    B --> C["差分隐私训练"]
    C --> D["联邦学习聚合"]
    D --> E["全局模型"]
    E --> F["模型验证"]
    F --> G["监管审批"]
    G --> H["临床部署"]
    H --> I["持续监控"]
    I --> J["性能漂移检测"]
    J -->|"漂移"| K["模型更新审批"]
    K --> E
    J -->|"正常"| H`,
      tip: "联邦学习项目启动前，先做通信成本评估——模型参数大小乘以通信轮数，可能远超预期",
      warning: "差分隐私的噪声会直接降低模型准确率，epsilon 值需要与临床精度要求做权衡，一般建议 epsilon >= 3 才能保证医疗级精度"
    },
    {
      title: "7. 实战：医学影像分类项目",
      body: `本节从零构建一个完整的胸部 X 光影像分类系统，用于自动检测肺炎。项目基于 ChestX-ray14 数据集，包含超过 11 万张胸部 X 光片和 14 种病理标注。系统涵盖数据加载与增强、迁移学习模型微调、类别不平衡处理、模型评估与解释以及部署推理的完整流程。胸部 X 光分类的关键挑战在于类别极度不均衡——正常样本占大多数，而某些罕见病理的样本极少。我们采用加权交叉熵损失和 Focal Loss 来解决这一问题。模型选用 EfficientNet-B0 作为骨干网络，它通过复合缩放策略在参数量和精度之间取得了优秀的平衡。Grad-CAM 可视化帮助我们理解模型的决策依据，确保 AI 是基于医学相关特征而非无关因素进行分类的。这是医疗 AI 可解释性的基本要求。`,
      code: [
        {
          lang: "python",
          code: `# 胸部 X 光分类 - 数据处理与模型
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
import pandas as pd
import numpy as np
from PIL import Image

class ChestXRayDataset(Dataset):
    def __init__(self, csv_path, image_dir, mode="train"):
        self.df = pd.read_csv(csv_path)
        self.image_dir = image_dir
        self.mode = mode
        self.labels = [
            "Atelectasis", "Cardiomegaly", "Effusion",
            "Infiltration", "Mass", "Nodule", "Pneumonia",
            "Pneumothorax"
        ]
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomAffine(degrees=10, translate=(0.1, 0.1)),
            transforms.ColorJitter(brightness=0.1, contrast=0.1),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485], std=[0.229])
        ])
        self.val_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485], std=[0.229])
        ])
    def __len__(self):
        return len(self.df)
    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img = Image.open(f"{self.image_dir}/{row['Image Index']}").convert("RGB")
        if self.mode == "train":
            img = self.transform(img)
        else:
            img = self.val_transform(img)
        labels = torch.tensor([row[label] for label in self.labels], dtype=torch.float32)
        return img, labels

class PneumoniaClassifier(nn.Module):
    def __init__(self, num_classes=8, pretrained=True):
        super().__init__()
        from torchvision.models import efficientnet_b0
        weights = "DEFAULT" if pretrained else None
        self.backbone = efficientnet_b0(weights=weights)
        n_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(n_features, num_classes)
        )
    def forward(self, x):
        return self.backbone(x)`
        },
        {
          lang: "python",
          code: `# 训练与评估 - 类别不平衡 + Grad-CAM
import torch
import torch.nn.functional as F
from sklearn.metrics import roc_auc_score

class FocalLoss(nn.Module):
    def __init__(self, alpha=1.0, gamma=2.0):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
    def forward(self, logits, targets):
        bce_loss = F.binary_cross_entropy_with_logits(logits, targets, reduction="none")
        pt = torch.exp(-bce_loss)
        focal_loss = self.alpha * (1 - pt) ** self.gamma * bce_loss
        return focal_loss.mean()

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        target_layer.register_forward_hook(self._save_activation)
        target_layer.register_full_backward_hook(self._save_gradient)
    def _save_activation(self, module, input, output):
        self.activations = output.detach()
    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()
    def __call__(self, x, class_idx=None):
        output = self.model(x)
        if class_idx is None:
            class_idx = torch.argmax(output, dim=1)
        self.model.zero_grad()
        output[:, class_idx].backward()
        weights = F.adaptive_avg_pool2d(self.gradients, 1)
        cam = (weights * self.activations).sum(dim=1, keepdim=True)
        cam = F.relu(cam)
        cam = F.interpolate(cam, size=(224, 224), mode="bilinear")
        cam = cam - cam.min()
        cam = cam / (cam.max() + 1e-8)
        return cam.squeeze()

def train_epoch(model, dataloader, criterion, optimizer, device):
    model.train()
    total_loss = 0
    all_labels, all_preds = [], []
    for images, labels in dataloader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        loss = criterion(outputs, labels)
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        total_loss += loss.item()
        all_labels.append(labels.cpu())
        all_preds.append(torch.sigmoid(outputs).cpu())
    all_labels = torch.cat(all_labels)
    all_preds = torch.cat(all_preds)
    aucs = []
    for i in range(all_labels.size(1)):
        try:
            auc = roc_auc_score(all_labels[:, i], all_preds[:, i])
            aucs.append(auc)
        except ValueError:
            aucs.append(0.0)
    return total_loss / len(dataloader), np.mean(aucs)`
        }
      ],
      table: {
        headers: ["组件", "技术方案", "参数设置", "预期效果"],
        rows: [
          ["骨干网络", "EfficientNet-B0", "ImageNet 预训练", "准确率约 85%"],
          ["损失函数", "Focal Loss", "gamma=2.0, alpha=类别权重", "缓解不平衡"],
          ["优化器", "AdamW", "lr=3e-4, weight_decay=1e-4", "稳定收敛"],
          ["数据增强", "翻转+仿射+调色", "p=0.5", "提升泛化"],
          ["可解释性", "Grad-CAM", "最后一层卷积", "定位病灶区域"]
        ]
      },
      mermaid: `graph TD
    A["X 光影像
ChestX-ray14"] --> B["预处理
Resize+归一化"]
    B --> C["数据增强
翻转/仿射/调色"]
    C --> D["EfficientNet-B0
迁移学习"]
    D --> E["Focal Loss
处理不平衡"]
    E --> F["多标签分类
8 种病理"]
    F --> G["评估
AUC + Grad-CAM"]
    G --> H{"AUC > 0.85?"}
    H -->|"否"| I["调整学习率
增加增强"]
    I --> D
    H -->|"是"| J["导出 TorchScript"]
    J --> K["部署推理服务"]
    K --> L["医生辅助诊断"]`,
      tip: "训练多标签分类模型时，建议使用学习率预热——前 5 个 epoch 线性增加学习率，可以避免模型在初期被少数主导类别误导",
      warning: "Grad-CAM 可视化是验证模型是否学到正确特征的关键步骤——如果热力图集中在 X 光片角落的水印或标记上，说明模型学到了错误的偏差，必须重新训练"
    },
  ],
};
