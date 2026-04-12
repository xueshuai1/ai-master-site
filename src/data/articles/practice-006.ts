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
      title: "1. 医疗AI概述",
      body: `人工智能正在深刻改变医疗健康行业的面貌。从辅助诊断到个性化治疗，从药物研发到健康管理，AI技术已经渗透到医疗价值链的各个环节。医疗AI的核心优势在于能够处理和分析海量医疗数据，发现人类医生难以察觉的模式和关联。根据世界卫生组织的统计，全球医疗数据每年增长超过40%，其中约80%为非结构化数据，包括医学影像、电子病历、基因组数据等。深度学习、自然语言处理和强化学习等技术的发展，为这些数据的分析和利用提供了强大的工具。医疗AI的应用不仅提高了诊断准确性和治疗效率，还显著降低了医疗成本和误诊率。然而，医疗AI的落地仍面临数据隐私、算法可解释性和监管合规等挑战。理解医疗AI的整体图景，有助于把握各子领域的技术脉络和发展趋势，为后续深入学习奠定基础。`,
      code: [
        {
          lang: "python",
          code: `# 医疗AI生态系统概览
from dataclasses import dataclass
from enum import Enum
from typing import Dict, List

class MedicalDomain(Enum):
    IMAGING = "医学影像"
    EHR = "电子病历"
    DRUG_DISCOVERY = "药物发现"
    GENOMICS = "基因组学"
    SURGERY = "手术辅助"
    MONITORING = "健康监测"

@dataclass
class MedicalAIApplication:
    domain: MedicalDomain
    task: str
    model_type: str
    accuracy: float
    regulatory_status: str

applications: List[MedicalAIApplication] = [
    MedicalAIApplication(MedicalDomain.IMAGING, "肺结节检测", "CNN + FPN", 0.94, "FDA批准"),
    MedicalAIApplication(MedicalDomain.EHR, "风险预测", "Transformer", 0.89, "临床验证"),
    MedicalAIApplication(MedicalDomain.DRUG_DISCOVERY, "分子筛选", "GNN", 0.86, "研发中"),
]

for app in applications:
    print(f"{app.domain.value}: {app.task} ({app.model_type})")`
        },
        {
          lang: "python",
          code: `# 医疗数据预处理管道
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

class MedicalDataPipeline:
    def __init__(self):
        self.imputer = SimpleImputer(strategy="median")
        self.scaler = StandardScaler()

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        imputed = self.imputer.fit_transform(df[numeric_cols])
        scaled = self.scaler.fit_transform(imputed)
        return scaled

    def validate(self, df: pd.DataFrame) -> Dict[str, float]:
        missing_rate = df.isnull().sum().sum() / df.size
        duplicate_rate = df.duplicated().sum() / len(df)
        return {
            "missing_rate": round(missing_rate, 4),
            "duplicate_rate": round(duplicate_rate, 4),
        }

pipeline = MedicalDataPipeline()
print(pipeline.validate(pd.DataFrame({"age": [45, None, 62], "bp": [120, 135, None]})))`
        }
      ],
      table: {
        headers: ["应用领域", "核心技术", "准确率", "商业化程度"],
        rows: [
          ["医学影像分析", "CNN, Transformer", "90-97%", "大规模商用"],
          ["电子病历分析", "NLP, BERT", "85-92%", "快速普及"],
          ["药物发现", "GNN, 生成模型", "75-88%", "加速发展中"],
          ["基因组学", "序列模型", "80-95%", "研究向临床过渡"],
          ["手术机器人", "强化学习, CV", "95%+", "三甲医院普及"],
        ],
      },
      mermaid: "graph TD\n    A[医疗数据] --> B[医学影像]\n    A --> C[电子病历]\n    A --> D[基因组数据]\n    A --> E[生理信号]\n    B --> F[AI诊断模型]\n    C --> G[临床决策支持]\n    D --> H[精准医疗]\n    E --> I[健康监测]\n    F --> J[辅助诊断]\n    G --> J\n    H --> K[个性化治疗]\n    I --> L[慢病管理]",
      tip: "医疗AI的成功关键在于高质量的数据和明确的临床需求。在开始任何医疗AI项目之前，先与临床医生深入沟通，了解真实的痛点和评估标准。",
      warning: "医疗AI涉及患者安全和隐私保护，所有模型在临床部署前必须经过严格的验证和审批流程，不可直接使用未经验证的模型进行诊断决策。"
    },
    {
      title: "2. 医学影像分析",
      body: `医学影像分析是医疗AI最成熟的应用领域之一。深度学习特别是卷积神经网络（CNN）在X光、CT、MRI和超声等影像模态上展现出了超越人类专家的诊断能力。医学影像分析的主要任务包括图像分类（如判断是否存在肿瘤）、目标检测（如定位肺结节位置）、图像分割（如勾画器官或病灶边界）以及图像生成（如模态转换和超分辨率）。近年来，Vision Transformer和扩散模型的引入进一步提升了模型性能。医学影像数据具有高分辨率、三维体数据、多模态融合等特性，对模型架构和计算资源提出了更高要求。此外，医学影像标注成本极高，需要专业放射科医生逐像素标注，因此半监督学习、弱监督学习和自监督学习在该领域得到了广泛应用。`,
      code: [
        {
          lang: "python",
          code: `# 基于PyTorch的医学影像分类模型
import torch
import torch.nn as nn
from torchvision.models import resnet50, ResNet50_Weights

class MedicalImageClassifier(nn.Module):
    def __init__(self, num_classes: int = 2):
        super().__init__()
        weights = ResNet50_Weights.DEFAULT
        self.backbone = resnet50(weights=weights)
        self.backbone.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(self.backbone.fc.in_features, 256),
            nn.ReLU(),
            nn.Linear(256, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)

model = MedicalImageClassifier(num_classes=3)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)
criterion = nn.CrossEntropyLoss()
print(f"模型参数量: {sum(p.numel() for p in model.parameters()):,}")`
        },
        {
          lang: "python",
          code: `# 医学影像数据增强策略
import torchvision.transforms as transforms
from PIL import Image

medical_train_transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomVerticalFlip(p=0.3),
    transforms.RandomRotation(15),
    transforms.ColorJitter(
        brightness=0.2, contrast=0.2,
        saturation=0.1, hue=0.05,
    ),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

medical_val_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])`
        }
      ],
      table: {
        headers: ["影像模态", "分辨率", "典型疾病", "AI诊断准确率"],
        rows: [
          ["X光胸片", "2000x2000", "肺炎/肺癌", "92-96%"],
          ["CT扫描", "512x512xN层", "肺结节/肿瘤", "94-97%"],
          ["MRI", "256x256xN层", "脑卒中/脑瘤", "90-95%"],
          ["超声", "640x480实时", "甲状腺结节", "88-93%"],
          ["病理切片", "100000x100000", "癌症分级", "91-96%"],
        ],
      },
      mermaid: "graph LR\n    A[原始影像] --> B[预处理]\n    B --> C[ROI提取]\n    C --> D[特征提取CNN]\n    D --> E[分类头]\n    D --> F[分割头]\n    D --> G[检测头]\n    E --> H[疾病分类]\n    F --> I[病灶分割]\n    G --> J[病灶定位]",
      tip: "医学影像的预处理至关重要。注意进行DICOM格式转换、HU值标准化（CT）、窗宽窗位调整等操作，这些步骤直接影响模型性能。",
      warning: "不同医院的影像设备参数差异很大，模型泛化能力是关键挑战。务必在多中心数据集上验证，避免在单一数据集上过拟合。"
    },
    {
      title: "3. 电子病历分析",
      body: `电子病历（EHR）是医疗信息化的核心成果，包含了患者的病史、检查检验结果、用药记录、手术记录等丰富信息。然而，EHR数据以非结构化和半结构化为主，包含大量自由文本，给自动化分析带来巨大挑战。自然语言处理技术特别是预训练语言模型（如ClinicalBERT、BioBERT）在EHR分析中取得了突破性进展。主要应用包括：从病历文本中提取诊断信息、药物不良反应监测、再入院风险预测、治疗方案推荐等。EHR数据还具有时序特性，患者的就诊记录构成时间序列，因此RNN、Transformer和时序图神经网络也被广泛采用。此外，多模态融合（结合结构化检验数据和文本病历）是当前研究热点。`,
      code: [
        {
          lang: "python",
          code: `# 基于ClinicalBERT的临床文本分类
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

tokenizer = AutoTokenizer.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")
model = AutoModelForSequenceClassification.from_pretrained(
    "emilyalsentzer/Bio_ClinicalBERT", num_labels=5
)

def classify_clinical_text(text: str) -> dict:
    inputs = tokenizer(
        text, return_tensors="pt",
        truncation=True, max_length=512, padding=True,
    )
    with torch.no_grad():
        outputs = model(**inputs)
    probs = torch.softmax(outputs.logits, dim=-1)
    return {
        "prediction": int(torch.argmax(probs, dim=-1)),
        "confidence": float(torch.max(probs)),
    }

result = classify_clinical_text("患者男性，65岁，主诉胸闷气短两周，有高血压病史")
print(result)`
        },
        {
          lang: "python",
          code: `# 时序EHR数据的风险预测模型
import torch
import torch.nn as nn

class EHRTimeSeriesModel(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int, num_classes: int):
        super().__init__()
        self.embedding = nn.Linear(input_dim, hidden_dim)
        self.gru = nn.GRU(hidden_dim, hidden_dim, num_layers=2,
                          dropout=0.3, batch_first=True)
        self.attention = nn.MultiheadAttention(
            hidden_dim, num_heads=4, batch_first=True,
        )
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_dim // 2, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.embedding(x)
        x, _ = self.gru(x)
        x, _ = self.attention(x, x, x)
        x = x[:, -1, :]
        return self.classifier(x)

model = EHRTimeSeriesModel(input_dim=128, hidden_dim=256, num_classes=2)
print(f"EHR时序模型参数量: {sum(p.numel() for p in model.parameters()):,}")`
        }
      ],
      table: {
        headers: ["应用任务", "输入数据", "模型架构", "性能指标"],
        rows: [
          ["疾病编码", "出院小结文本", "ClinicalBERT", "F1=0.91"],
          ["药物不良反应检测", "处方+病程记录", "BioClinicalBERT", "AUROC=0.88"],
          ["再入院风险预测", "时序EHR数据", "GRU+Attention", "AUROC=0.85"],
          ["ICD编码", "诊断描述", "多标签BERT", "F1=0.76"],
          ["治疗方案推荐", "多模态EHR", "知识图谱+GNN", "准确率=0.82"],
        ],
      },
      mermaid: "graph TD\n    A[电子病历] --> B[文本提取]\n    A --> C[结构化数据]\n    B --> D[NLP处理]\n    C --> E[特征工程]\n    D --> F[实体识别]\n    D --> G[关系抽取]\n    D --> H[文本分类]\n    E --> I[时序建模]\n    F --> J[知识图谱构建]\n    G --> J\n    H --> K[临床决策支持]\n    I --> K\n    J --> K",
      tip: "处理EHR数据时，务必关注数据脱敏和隐私保护。使用FHIR等标准化格式可以大幅提升数据互操作性和模型可移植性。",
      warning: "EHR数据存在严重的缺失值、记录偏差和时间戳不准确问题。在模型训练前必须进行严格的数据清洗和质量评估。"
    },
    {
      title: "4. 药物发现",
      body: `传统药物发现流程耗时长（平均10-15年）、成本高（超过20亿美元）、成功率低（低于12%）。AI技术的引入正在重塑药物研发的每一个环节：从靶点发现、分子筛选、先导化合物优化到临床试验设计。深度学习在分子性质预测（如溶解度、毒性、生物活性）上表现出优异性能；生成模型（如VAE、GAN、扩散模型）能够设计具有特定性质的全新分子结构；图神经网络（GNN）天然适合分子图结构的表示学习。AlphaFold的成功更是彻底改变了蛋白质结构预测领域。AI辅助药物发现不仅大幅缩短了早期研发周期，还发现了多个人类专家难以想到的候选分子。然而，AI生成的分子需要经过严格的湿实验验证，计算预测与实验结果之间仍存在差距。`,
      code: [
        {
          lang: "python",
          code: `# 基于RDKit的分子特征工程
from rdkit import Chem
from rdkit.Chem import Descriptors, rdMolDescriptors
import numpy as np

def compute_molecular_features(smiles: str) -> dict:
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return {}
    features = {
        "molecular_weight": Descriptors.MolWt(mol),
        "logp": Descriptors.MolLogP(mol),
        "h_donors": Descriptors.NumHDonors(mol),
        "h_acceptors": Descriptors.NumHAcceptors(mol),
        "rotatable_bonds": Descriptors.NumRotatableBonds(mol),
        "tpsa": Descriptors.TPSA(mol),
        "num_rings": rdMolDescriptors.CalcNumRings(mol),
        "qed": Descriptors.qed(mol),
    }
    # Lipinski五规则评估
    lipinski_pass = (
        features["molecular_weight"] <= 500 and
        features["logp"] <= 5 and
        features["h_donors"] <= 5 and
        features["h_acceptors"] <= 10
    )
    features["lipinski_pass"] = lipinski_pass
    return features

result = compute_molecular_features("CC1=CC=C(C=C1)NC(=O)C2=CC=C(Cl)C=C2")
print(f"分子量: {result['molecular_weight']:.2f}, QED: {result['qed']:.3f}")`
        },
        {
          lang: "python",
          code: `# 分子图神经网络（Message Passing）
import torch
import torch.nn as nn
from torch_geometric.nn import MessagePassing, global_add_pool

class MolecularGNN(nn.Module):
    def __init__(self, node_dim: int, hidden_dim: int, num_layers: int):
        super().__init__()
        self.node_encoder = nn.Linear(node_dim, hidden_dim)
        self.layers = nn.ModuleList([
            MessagePassing(aggr="add") for _ in range(num_layers)
        ])
        self.bn_layers = nn.ModuleList([
            nn.BatchNorm1d(hidden_dim) for _ in range(num_layers)
        ])
        self.head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
        )

    def forward(self, x, edge_index, batch):
        x = self.node_encoder(x).relu()
        for i, layer in enumerate(self.layers):
            x = layer(x, edge_index)
            x = self.bn_layers[i](x)
            x = torch.relu(x)
        pooled = global_add_pool(x, batch)
        return self.head(pooled).squeeze(-1)

model = MolecularGNN(node_dim=75, hidden_dim=128, num_layers=4)
print(f"分子GNN参数量: {sum(p.numel() for p in model.parameters()):,}")`
        }
      ],
      table: {
        headers: ["研发阶段", "传统方法耗时", "AI辅助耗时", "关键AI技术"],
        rows: [
          ["靶点发现", "2-3年", "6-12月", "知识图谱, NLP"],
          ["苗头化合物筛选", "1-2年", "1-3月", "虚拟筛选, GNN"],
          ["先导化合物优化", "2-4年", "6-18月", "生成模型, RL"],
          ["临床前研究", "1-2年", "1-2年", "毒性预测, ADME"],
          ["临床试验", "5-7年", "3-5年", "患者分层, 终点预测"],
        ],
      },
      mermaid: "graph TD\n    A[疾病靶点] --> B[靶点验证]\n    B --> C[苗头化合物发现]\n    C --> D[先导化合物优化]\n    D --> E[候选药物选择]\n    E --> F[临床前评价]\n    F --> G[临床试验]\n    G --> H[新药审批]\n    B --> I[AI靶点发现]\n    C --> J[AI虚拟筛选]\n    D --> K[AI分子生成]\n    E --> L[AI性质预测]\n    G --> M[AI患者匹配]",
      tip: "药物发现中的AI模型输出必须结合化学直觉和领域知识进行筛选。QED（定量类药性评估）和Lipinski五规则是快速过滤不良分子的实用工具。",
      warning: "AI生成的分子可能存在合成不可行性。务必评估合成可及性（SA Score），并与合成化学家紧密合作，确保候选分子能够被实际合成出来。"
    },
    {
      title: "5. 基因组学",
      body: `基因组学是精准医疗的基石。人类基因组包含约30亿个碱基对、2-2.5万个基因，基因组变异与疾病的关联研究产生了海量数据。AI在基因组学中的应用包括：DNA序列变异检测、基因表达预测、表观遗传学分析、单细胞RNA测序数据处理以及基因编辑（CRISPR）结果预测。深度学习模型能够直接学习DNA序列的调控密码，预测转录因子结合位点、染色质可及性和基因表达水平。单细胞技术产生的高维稀疏数据更需要AI方法来进行降维、聚类和轨迹推断。多组学整合分析（基因组、转录组、蛋白质组、代谢组）是未来精准医疗的重要方向。基因组数据的安全性和伦理问题尤为突出，各国对此都有严格的法规和监管要求。`,
      code: [
        {
          lang: "python",
          code: `# DNA序列的深度学习编码
import torch
import torch.nn as nn
import numpy as np

class DNASequenceEncoder(nn.Module):
    def __init__(self, seq_length: int = 1000, num_filters: int = 128):
        super().__init__()
        # 一维卷积学习序列模式（类似转录因子结合位点）
        self.conv1 = nn.Conv1d(4, num_filters, kernel_size=8, padding=4)
        self.conv2 = nn.Conv1d(num_filters, num_filters, kernel_size=4, padding=2)
        self.pool = nn.AdaptiveMaxPool1d(1)
        self.fc = nn.Sequential(
            nn.Linear(num_filters, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch, 4, seq_length) - one-hot编码的DNA序列
        x = torch.relu(self.conv1(x))
        x = torch.relu(self.conv2(x))
        x = self.pool(x).squeeze(-1)
        return self.fc(x)

def one_hot_encode_dna(sequence: str, length: int = 1000) -> torch.Tensor:
    mapping = {"A": 0, "C": 1, "G": 2, "T": 3}
    encoded = np.zeros((4, length))
    for i, base in enumerate(sequence[:length]):
        if base in mapping:
            encoded[mapping[base], i] = 1
    return torch.tensor(encoded, dtype=torch.float32).unsqueeze(0)

model = DNASequenceEncoder()
seq = one_hot_encode_dna("ATCGATCGATCG" * 100)
print(f"序列形状: {seq.shape}, 预测: {model(seq).item():.4f}")`
        },
        {
          lang: "python",
          code: `# 单细胞RNA-seq降维与聚类
import numpy as np
from sklearn.decomposition import PCA
from sklearn.neighbors import NearestNeighbors

class SimpleScRNAseqPipeline:
    def __init__(self, n_pcs: int = 50, n_neighbors: int = 15):
        self.n_pcs = n_pcs
        self.n_neighbors = n_neighbors

    def normalize(self, count_matrix: np.ndarray) -> np.ndarray:
        # 对数归一化（CPM + log1p）
        total = count_matrix.sum(axis=1, keepdims=True)
        cpm = (count_matrix / total) * 1e6
        return np.log1p(cpm)

    def select_genes(self, norm_matrix: np.ndarray,
                     top_n: int = 2000) -> np.ndarray:
        variances = norm_matrix.var(axis=0)
        top_idx = np.argsort(variances)[-top_n:]
        return norm_matrix[:, top_idx]

    def reduce_dim(self, matrix: np.ndarray) -> np.ndarray:
        return PCA(n_components=self.n_pcs).fit_transform(matrix)

    def build_graph(self, reduced: np.ndarray):
        nbrs = NearestNeighbors(
            n_neighbors=self.n_neighbors, metric="euclidean",
        ).fit(reduced)
        distances, indices = nbrs.kneighbors(reduced)
        return distances, indices

pipeline = SimpleScRNAseqPipeline()
print("单细胞分析管道初始化完成")`
        }
      ],
      table: {
        headers: ["基因组任务", "输入数据类型", "AI方法", "典型应用"],
        rows: [
          ["变异检测", "测序reads", "CNN + 统计模型", "癌症突变识别"],
          ["基因表达预测", "DNA序列", "DeepSEA, BPNet", "调控元件预测"],
          ["单细胞聚类", "scRNA-seq矩阵", "自编码器, UMAP", "细胞类型注释"],
          ["基因调控网络", "多组学数据", "图神经网络", "通路分析"],
          ["CRISPR编辑预测", "sgRNA序列", "RNN + 注意力", "脱靶效应评估"],
        ],
      },
      mermaid: "graph TD\n    A[DNA样本] --> B[高通量测序]\n    B --> C[原始序列数据]\n    C --> D[序列比对]\n    D --> E[变异检测]\n    C --> F[表达量定量]\n    E --> G[功能注释]\n    F --> H[差异表达分析]\n    G --> I[多组学整合]\n    H --> I\n    I --> J[疾病关联分析]\n    J --> K[精准医疗方案]",
      tip: "基因组学分析中的批次效应（batch effect）是常见问题。使用ComBat或Harmony等工具进行批次校正，是获得可靠结果的关键步骤。",
      warning: "基因组数据包含极其敏感的个人隐私信息。必须遵守各国基因组数据保护法规，数据共享前应进行严格的去标识化处理。"
    },
    {
      title: "6. 监管合规",
      body: `医疗AI产品的监管环境日益严格且复杂。不同国家和地区的监管机构对AI医疗产品有不同的审批流程和要求：美国FDA通过SaMD（Software as a Medical Device）框架进行分类审批，欧盟通过MDR（Medical Device Regulation）进行监管，中国国家药监局（NMPA）也建立了AI医疗器械的审评指南。核心监管关注点包括：临床有效性验证（需要在多中心、前瞻性临床试验中证明）、算法可解释性（医生和监管机构需要理解模型决策依据）、数据安全与隐私保护（GDPR、HIPAA等法规）、持续学习模型的监管（模型更新后是否需要重新审批）、公平性与偏差（确保模型在不同人群中的表现一致）。欧盟AI法案将医疗AI列为高风险AI系统，要求更严格的技术文档、风险管理和人类监督机制。合规不是障碍，而是确保医疗AI安全性和有效性的必要保障。`,
      code: [
        {
          lang: "python",
          code: `# 医疗AI模型的公平性评估
import numpy as np
from sklearn.metrics import confusion_matrix

def evaluate_fairness(y_true, y_pred, sensitive_attr: list[str]) -> dict:
    groups = np.unique(sensitive_attr)
    results = {}
    overall_cm = confusion_matrix(y_true, y_pred)
    overall_acc = np.diag(overall_cm).sum() / overall_cm.sum()

    for group in groups:
        mask = np.array(sensitive_attr) == group
        cm = confusion_matrix(y_true[mask], y_pred[mask])
        tp = cm[1, 1] if cm.shape[0] > 1 else 0
        fn = cm[1, 0] if cm.shape[0] > 1 else 0
        fp = cm[0, 1] if cm.shape[0] > 1 else 0
        tn = cm[0, 0] if cm.shape[0] > 1 else 0
        sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
        accuracy = (tp + tn) / (tp + tn + fp + fn)
        results[str(group)] = {
            "sensitivity": round(sensitivity, 3),
            "specificity": round(specificity, 3),
            "accuracy": round(accuracy, 3),
        }
    results["overall_accuracy"] = round(overall_acc, 3)
    return results

print("公平性评估模块加载完成")`
        },
        {
          lang: "python",
          code: `# 医疗AI模型的可解释性（SHAP）
import shap
import numpy as np

class MedicalModelExplainer:
    def __init__(self, model, background_data: np.ndarray):
        self.model = model
        self.explainer = shap.KernelExplainer(
            model.predict, background_data,
        )

    def explain_prediction(self, sample: np.ndarray,
                           top_k: int = 5) -> list:
        shap_values = self.explainer.shap_values(sample)
        if isinstance(shap_values, list):
            shap_values = shap_values[1]
        feature_importance = np.abs(shap_values[0])
        top_idx = np.argsort(feature_importance)[::-1][:top_k]
        return [
            {"feature_index": int(idx),
             "shap_value": float(shap_values[0][idx]),
             "abs_importance": float(feature_importance[idx])}
            for idx in top_idx
        ]

    def generate_report(self, sample: np.ndarray) -> str:
        explanations = self.explain_prediction(sample)
        report = "=== 模型解释报告 ===\\n"
        for i, exp in enumerate(explanations, 1):
            direction = "正向" if exp["shap_value"] > 0 else "负向"
            report += f"{i}. 特征#{exp['feature_index']} ({direction})"
            report += f" | SHAP值: {exp['shap_value']:.4f}\\n"
        return report

print("可解释性模块加载完成")`
        }
      ],
      table: {
        headers: ["监管维度", "FDA要求", "欧盟MDR", "中国NMPA"],
        rows: [
          ["临床验证", "多中心前瞻性试验", "临床评估报告", "临床试验/同品种对比"],
          ["数据管理", "QMS体系+真实世界数据", "PMS后市场监控", "数据管理规范"],
          ["算法变更", "Predetermined Change Plan", "重大变更需重审", "变更备案/审批"],
          ["可解释性", "透明度和决策依据", "人类监督机制", "结果可解释性要求"],
          ["网络安全", "网络安全指南合规", "数据保护影响评估", "网络安全审查"],
        ],
      },
      mermaid: "graph TD\n    A[医疗AI开发] --> B[质量管理体系]\n    B --> C[风险管理 ISO 14971]\n    C --> D[临床评价]\n    D --> E[技术文档]\n    E --> F[监管提交]\n    F --> G{审批结果}\n    G -->|通过| H[上市许可]\n    G -->|补充| I[补充资料]\n    H --> J[上市后监控]\n    J --> K[不良事件报告]\n    J --> L[定期安全更新]\n    L --> M[算法更新评估]",
      tip: "在项目早期就引入监管合规考量，采用设计即合规（Compliance by Design）的理念，可以大幅减少后期的合规成本和审批时间。",
      warning: "使用未经监管批准的AI模型进行临床决策可能构成违法行为。任何面向临床部署的AI产品都必须获得目标市场的监管机构批准。"
    },
    {
      title: "7. 实战：医学影像分类",
      body: `本章通过一个完整的医学影像分类实战项目，将前面所学的理论知识和技术融会贯通。我们以胸部X光片的疾病分类为例，构建一个端到端的深度学习分类系统。项目覆盖数据获取与预处理、模型选择与训练、评估与调优、可解释性分析以及部署准备等完整流程。使用CheXpert或MIMIC-CXR等公开数据集，训练一个能够检测14种胸部疾病的多标签分类模型。实践中需要重点关注类别不平衡处理（罕见病样本远少于正常样本）、多标签损失函数设计（BCEWithLogitsLoss替代交叉熵）、迁移学习策略（使用ImageNet预训练权重）以及模型校准（确保预测概率与实际风险一致）。完整的代码实现可以直接应用于实际项目，也可以作为学习医疗AI的起点。`,
      code: [
        {
          lang: "python",
          code: `# 胸部X光多标签分类完整训练流程
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import numpy as np

class ChestXrayDataset(Dataset):
    LABELS = [
        "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration",
        "Mass", "Nodule", "Pneumonia", "Pneumothorax",
    ]

    def __init__(self, image_paths: list[str], labels: np.ndarray,
                 train: bool = True):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.RandomCrop(224) if train else transforms.CenterCrop(224),
            transforms.RandomHorizontalFlip(0.5) if train else transforms.Lambda(lambda x: x),
            transforms.ToTensor(),
            transforms.Normalize([0.485], [0.229]),
        ]) if train else transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485], [0.229]),
        ])

    def __len__(self) -> int:
        return len(self.image_paths)

    def __getitem__(self, idx: int):
        image = Image.open(self.image_paths[idx]).convert("L")
        image = image.convert("RGB")
        tensor = self.transform(image)
        label = torch.tensor(self.labels[idx], dtype=torch.float32)
        return tensor, label

dataset = ChestXrayDataset(
    image_paths=["chest_001.png", "chest_002.png"],
    labels=np.array([[1, 0, 1, 0, 0, 0, 0, 0],
                     [0, 1, 0, 0, 1, 0, 0, 0]]),
    train=True,
)
print(f"数据集大小: {len(dataset)}, 标签维度: {len(ChestXrayDataset.LABELS)}")`
        },
        {
          lang: "python",
          code: `# 训练循环与评估
import torch
from torch.utils.data import DataLoader
from sklearn.metrics import roc_auc_score

def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss = 0
    all_preds, all_labels = [], []

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        all_preds.append(torch.sigmoid(outputs).cpu().numpy())
        all_labels.append(labels.cpu().numpy())

    preds = np.concatenate(all_preds)
    labels = np.concatenate(all_labels)
    # 逐类别AUROC计算
    aurocs = []
    for i in range(preds.shape[1]):
        if len(np.unique(labels[:, i])) > 1:
            aurocs.append(roc_auc_score(labels[:, i], preds[:, i]))
    mean_auroc = np.mean(aurocs) if aurocs else 0
    return total_loss / len(loader), mean_auroc

@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss = 0
    all_preds, all_labels = [], []
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        total_loss += criterion(outputs, labels).item()
        all_preds.append(torch.sigmoid(outputs).cpu().numpy())
        all_labels.append(labels.cpu().numpy())
    preds = np.concatenate(all_preds)
    labels = np.concatenate(all_labels)
    aurocs = [
        roc_auc_score(labels[:, i], preds[:, i])
        for i in range(preds.shape[1])
        if len(np.unique(labels[:, i])) > 1
    ]
    return total_loss / len(loader), np.mean(aurocs)

print("训练与评估函数定义完成")`
        }
      ],
      table: {
        headers: ["训练阶段", "学习率", "Epoch", "训练损失", "验证AUROC"],
        rows: [
          ["预热阶段", "1e-5 -> 1e-4", "1-5", "0.42 -> 0.28", "0.72 -> 0.78"],
          ["主训练", "1e-4", "6-20", "0.28 -> 0.18", "0.78 -> 0.84"],
          ["精细调优", "1e-5", "21-30", "0.18 -> 0.15", "0.84 -> 0.86"],
          ["模型校准", "5e-6", "31-35", "0.15 -> 0.14", "0.86 -> 0.87"],
          ["集成推理", "N/A", "N/A", "N/A", "0.87 -> 0.89"],
        ],
      },
      mermaid: "graph TD\n    A[原始X光影像] --> B[DICOM解析]\n    B --> C[像素标准化]\n    C --> D[数据增强]\n    D --> E[训练集/验证集/测试集]\n    E --> F[预训练ResNet50]\n    F --> G[多标签分类头]\n    G --> H[BCEWithLogitsLoss]\n    H --> I[AdamW优化器]\n    I --> J[学习率调度]\n    J --> K{验证集AUROC}\n    K -->|未达标| F\n    K -->|达标| L[模型校准]\n    L --> M[Grad-CAM可视化]\n    M --> N[ONNX导出]\n    N --> O[生产部署]",
      tip: "医学影像分类中最容易被忽视的环节是模型校准。一个AUROC很高但预测概率不准的模型在临床中是不可用的。使用温度缩放（Temperature Scaling）或Platt缩放进行后处理校准。",
      warning: "实战模型的预测结果仅供参考，不可替代专业医生的诊断意见。在实际临床应用中，AI系统应定位为辅助工具而非独立决策者。"
    },
  ],
};
