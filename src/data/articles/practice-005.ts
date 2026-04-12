import { Article } from '../knowledge';

export const article: Article = {
    id: "practice-005",
    title: "异常检测在工业中的应用",
    category: "practice",
    tags: ["异常检测", "工业应用", "预测性维护"],
    summary: "从缺陷检测到预测性维护，掌握工业 AI 的核心应用",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
        {
            title: "1. 工业 AI 概述：从自动化到智能化",
            body: `工业 4.0 浪潮下，AI 正在重塑制造业的每一个环节。传统的自动化产线依赖预设规则和固定阈值，而 AI 驱动的异常检测系统能够从海量数据中自主学习正常模式，实时识别偏离行为。异常检测是工业 AI 最核心的应用场景之一，涵盖视觉缺陷检测、时序传感器分析、多模态数据融合等多个方向。当前主流方法包括基于统计的孤立森林、基于深度学习的自编码器、基于对比学习的 PaDiM 和 PatchCore 等。这些技术正在从实验室走向产线，为制造业带来降本增效的显著收益。`,
            code: [
                {
                    lang: "python",
                    code: `# 工业异常检测架构概览\nimport torch\nfrom torch import nn\n\nclass IndustrialAnomalyDetector(nn.Module):\n    """工业异常检测基础架构\"\"\"\n    def __init__(self, backbone: str = "resnet18", latent_dim: int = 128):\n        super().__init__()\n        self.encoder = self._build_backbone(backbone)\n        self.bottleneck = nn.Sequential(\n            nn.AdaptiveAvgPool2d(1),\n            nn.Flatten(),\n            nn.Linear(512, latent_dim),\n            nn.ReLU()\n        )\n        self.decoder = nn.Sequential(\n            nn.Linear(latent_dim, 512),\n            nn.Unflatten(1, (512, 1, 1)),\n            nn.ConvTranspose2d(512, 3, kernel_size=4, stride=2, padding=1)\n        )\n\n    def _build_backbone(self, name):\n        from torchvision.models import resnet18, ResNet18_Weights\n        model = resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)\n        return nn.Sequential(*list(model.children())[:-2])\n\n    def forward(self, x):\n        features = self.encoder(x)\n        latent = self.bottleneck(features)\n        reconstruction = self.decoder(latent)\n        return reconstruction, latent`
                },
                {
                    lang: "python",
                    code: `# 异常分数计算模块\nimport numpy as np\nfrom sklearn.neighbors import NearestNeighbors\n\nclass AnomalyScorer:\n    """计算异常分数并生成热力图\"\"\"\n    def __init__(self, n_neighbors: int = 5):\n        self.nn = NearestNeighbors(n_neighbors=n_neighbors, metric="euclidean")\n        self.memory_bank = None\n\n    def fit(self, features: np.ndarray):\n        self.nn.fit(features)\n        self.memory_bank = features\n        print(f"Memory bank built with {len(features)} normal samples")\n\n    def score(self, query: np.ndarray) -> np.ndarray:\n        distances, _ = self.nn.kneighbors(query)\n        anomaly_scores = distances.mean(axis=1)\n        normalized = (anomaly_scores - anomaly_scores.min()) / (anomaly_scores.max() - anomaly_scores.min() + 1e-8)\n        return normalized\n\n    def generate_heatmap(self, scores: np.ndarray, shape: tuple) -> np.ndarray:\n        heatmap = scores.reshape(shape)\n        from scipy.ndimage import gaussian_filter\n        return gaussian_filter(heatmap, sigma=3)`
                }
            ],
            table: {
                headers: ["技术方向", "典型算法", "适用场景", "检测精度"],
                rows: [
                    ["视觉缺陷检测", "PaDiM, PatchCore", "表面缺陷、划痕", "95-99%"],
                    ["时序异常检测", "LSTM-AE, OmniAnomaly", "振动、温度传感器", "90-96%"],
                    ["多模态融合", "Cross-modal AE", "复合工业场景", "93-98%"],
                    ["边缘部署", "MobileNet-AD", "产线实时检测", "88-94%"]
                ]
            },
            mermaid: `graph TD\n    A[工业数据源] --> B[数据采集层]\n    B --> C[特征提取]\n    C --> D[异常检测模型]\n    D --> E[异常分数]\n    E --> F{阈值判断}\n    F -->|正常| G[继续生产]\n    F -->|异常| H[告警+停机]\n    D --> I[模型更新]\n    I --> C`,
            tip: "工业 AI 项目的第一步是明确定义正常与异常的边界，这决定了后续所有技术选型。",
            warning: "不要直接用 ImageNet 预训练模型处理工业图像，工业场景的纹理分布与自然图像差异巨大。"
        },
        {
            title: "2. 视觉缺陷检测：从像素到缺陷",
            body: `视觉缺陷检测是工业异常检测中最成熟的应用方向。传统方法依赖人工设计的特征如 HOG、LBP 和 Gabor 滤波器，但这些方法对光照变化和复杂纹理极其敏感。深度学习方法通过端到端学习图像的深层语义表示，能够捕捉人眼难以察觉的微小缺陷。主流架构包括基于重构的自编码器、基于特征嵌入的 PatchCore 和基于对比学习的 CFlow。MVTec AD 数据集作为工业视觉异常检测的基准，包含 15 类工业对象和超过 5000 张图像，涵盖划痕、污渍、形变等多种缺陷类型。在真实产线中，还需要处理光照不均匀、相机抖动、产品位姿变化等工程挑战。`,
            code: [
                {
                    lang: "python",
                    code: `# PatchCore 核心实现\nimport torch\nfrom torch.nn import functional as F\n\nclass PatchCoreMemoryBank:\n    """PatchCore 记忆库构建与推理\"\"\"\n    def __init__(self, coreset_ratio: float = 0.1):\n        self.coreset_ratio = coreset_ratio\n        self.memory = None\n\n    def build_memory(self, features: torch.Tensor):\n        B, C, H, W = features.shape\n        patches = features.permute(0, 2, 3, 1).reshape(-1, C)\n        # 随机子采样构建核心集\n        n_samples = int(len(patches) * self.coreset_ratio)\n        indices = torch.randperm(len(patches))[:n_samples]\n        self.memory = patches[indices]\n        print(f"Memory bank: {self.memory.shape}")\n\n    def compute_anomaly_map(self, query_features: torch.Tensor) -> torch.Tensor:\n        B, C, H, W = query_features.shape\n        patches = query_features.permute(0, 2, 3, 1).reshape(-1, C)\n        # 归一化\n        patches = F.normalize(patches, dim=1)\n        memory = F.normalize(self.memory, dim=1)\n        # 计算最近邻距离\n        dists = torch.cdist(patches, memory)\n        min_dists = dists.min(dim=1).values\n        anomaly_map = min_dists.reshape(B, H, W)\n        return anomaly_map`
                },
                {
                    lang: "python",
                    code: `# MVTec AD 数据加载与预处理\nimport os\nfrom PIL import Image\nfrom torch.utils.data import Dataset, DataLoader\nimport torchvision.transforms as T\n\nclass MVTecDataset(Dataset):\n    def __init__(self, root: str, class_name: str, is_train: bool = True):\n        self.root = root\n        self.class_name = class_name\n        base_dir = os.path.join(root, class_name, "train" if is_train else "test")\n        self.image_paths = []\n        self.mask_paths = []\n        for subdir in os.listdir(base_dir):\n            for fname in os.listdir(os.path.join(base_dir, subdir)):\n                self.image_paths.append(os.path.join(base_dir, subdir, fname))\n                mask_path = os.path.join(root, class_name, "ground_truth", subdir, fname.replace(".png", "_mask.png"))\n                self.mask_paths.append(mask_path if os.path.exists(mask_path) else None)\n        self.transform = T.Compose([\n            T.Resize((256, 256)),\n            T.ToTensor(),\n            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])\n        ])\n\n    def __len__(self):\n        return len(self.image_paths)\n\n    def __getitem__(self, idx):\n        img = Image.open(self.image_paths[idx]).convert("RGB")\n        img = self.transform(img)\n        return img`
                }
            ],
            table: {
                headers: ["数据集", "类别数", "图像数", "缺陷类型", "标注级别"],
                rows: [
                    ["MVTec AD", "15", "5354", "10种缺陷", "像素级"],
                    ["VisA", "12", "10821", "多种工业缺陷", "像素级"],
                    ["BTAD", "3", "2830", "工业部件缺陷", "像素级"],
                    ["KolektorSDD", "1", "500", "电子元件缺陷", "像素级"]
                ]
            },
            mermaid: `graph LR\n    A[原始图像] --> B[数据增强]\n    B --> C[特征提取网络]\n    C --> D[多层特征拼接]\n    D --> E[核心集采样]\n    E --> F[记忆库]\n    F --> G[推理时最近邻搜索]\n    G --> H[异常热力图]\n    H --> I[阈值分割]`,
            tip: "使用数据增强时，只对正常样本进行增强。异常样本极少，增强可能引入虚假模式。",
            warning: "PatchCore 的记忆库大小直接影响显存占用，产线部署时建议将 coreset_ratio 控制在 0.01 到 0.05 之间。"
        },
        {
            title: "3. 时序异常检测：传感器数据的秘密",
            body: `工业设备运行过程中会产生大量时序传感器数据，包括振动、温度、压力、电流等信号。这些时序数据蕴含着设备健康状态的关键信息。时序异常检测的目标是在设备发生故障之前，识别出传感器信号中的异常模式。与静态图像不同，时序数据具有时间依赖性和多变量耦合性。常用的方法包括 LSTM 自编码器、TCN 时序卷积网络、以及基于注意力机制的 Transformer 架构。SWaT 和 WADI 数据集是工业控制系统异常检测的常用基准，包含数十个传感器变量和数百种攻击场景。在时序检测中，关键点检测比单纯的整体分类更具实用价值。`,
            code: [
                {
                    lang: "python",
                    code: `# LSTM 自编码器时序异常检测\nimport torch\nimport torch.nn as nn\n\nclass LSTMAutoEncoder(nn.Module):\n    def __init__(self, input_dim: int, hidden_dim: int = 64, num_layers: int = 2):\n        super().__init__()\n        self.hidden_dim = hidden_dim\n        self.num_layers = num_layers\n        self.encoder = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True)\n        self.decoder = nn.LSTM(hidden_dim, hidden_dim, num_layers, batch_first=True)\n        self.output_layer = nn.Linear(hidden_dim, input_dim)\n\n    def forward(self, x):\n        batch_size = x.size(0)\n        h0 = torch.zeros(self.num_layers, batch_size, self.hidden_dim, device=x.device)\n        c0 = torch.zeros(self.num_layers, batch_size, self.hidden_dim, device=x.device)\n        _, (h_n, c_n) = self.encoder(x, (h0, c0))\n        decoded, _ = self.decoder(h_n[-1].unsqueeze(1).repeat(1, x.size(1), 1).contiguous(), (h_n, c_n))\n        reconstructed = self.output_layer(decoded)\n        return reconstructed\n\n    def anomaly_score(self, x: torch.Tensor) -> torch.Tensor:\n        recon = self.forward(x)\n        mse = ((x - recon) ** 2).mean(dim=-1)\n        return mse`
                },
                {
                    lang: "python",
                    code: `# 多变量时序异常检测 - OmniAnomaly 简化版\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass OmniAnomaly(nn.Module):\n    def __init__(self, input_dim: int, hidden_dim: int = 100, latent_dim: int = 20):\n        super().__init__()\n        self.encoder_rnn = nn.GRU(input_dim, hidden_dim, batch_first=True)\n        self.fc_mu = nn.Linear(hidden_dim, latent_dim)\n        self.fc_var = nn.Linear(hidden_dim, latent_dim)\n        self.decoder_rnn = nn.GRU(latent_dim, hidden_dim, batch_first=True)\n        self.fc_out = nn.Linear(hidden_dim, input_dim)\n\n    def reparameterize(self, mu: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:\n        std = torch.exp(0.5 * logvar)\n        eps = torch.randn_like(std)\n        return mu + eps * std\n\n    def forward(self, x):\n        enc_out, _ = self.encoder_rnn(x)\n        mu = self.fc_mu(enc_out)\n        logvar = self.fc_var(enc_out)\n        z = self.reparameterize(mu, logvar)\n        dec_out, _ = self.decoder_rnn(z)\n        recon = self.fc_out(dec_out)\n        # VAE loss\n        recon_loss = F.mse_loss(recon, x, reduction="none").sum(dim=-1)\n        kl_loss = -0.5 * (1 + logvar - mu.pow(2) - logvar.exp()).sum(dim=-1)\n        return recon, recon_loss.mean(), kl_loss.mean()`
                }
            ],
            table: {
                headers: ["方法", "时间建模", "变量关系", "计算复杂度", "适用场景"],
                rows: [
                    ["LSTM-AE", "序列依赖", "隐式学习", "中等", "单变量/少变量"],
                    ["TCN-AD", "因果卷积", "并行计算", "低", "长时序"],
                    ["OmniAnomaly", "概率生成", "变量相关性", "高", "多变量耦合"],
                    ["TranAD", "自注意力", "全局依赖", "高", "长程依赖"]
                ]
            },
            mermaid: `graph TD\n    A[多变量传感器] --> B[滑动窗口切分]\n    B --> C[编码为隐变量]\n    C --> D[VAE 重构]\n    D --> E[重构误差]\n    E --> F[POT 极值理论阈值]\n    F --> G{是否异常}\n    G -->|是| H[定位异常变量]\n    G -->|否| I[正常标记]`,
            tip: "时序异常检测中，滑动窗口大小的选择至关重要。窗口太小会丢失长期依赖，太大会稀释局部异常信号。",
            warning: "传感器数据中的周期性变化不应被误判为异常，务必在训练数据中包含完整的生产周期。"
        },
        {
            title: "4. 预测性维护：从异常到预见",
            body: `预测性维护是工业异常检测的最终目标。与传统的事后维修和定期维护不同，预测性维护通过分析设备退化趋势，在故障发生前安排维护窗口。核心流程包括：剩余使用寿命预测、退化阶段划分、维护策略优化。PHM 数据集和 NASA C-MAPSS 发动机退化数据集是该领域的标准基准。深度学习在 RUL 预测中展现出强大能力，尤其是 CNN-LSTM 混合架构和 Transformer 模型。一个完整的预测性维护系统不仅要预测故障时间，还需要输出置信区间和维护建议，帮助工厂制定最优的生产计划。`,
            code: [
                {
                    lang: "python",
                    code: `# RUL 预测模型 - CNN-LSTM 混合架构\nimport torch\nimport torch.nn as nn\n\nclass RULPredictor(nn.Module):\n    def __init__(self, n_sensors: int, seq_len: int = 30, hidden: int = 64):\n        super().__init__()\n        self.cnn = nn.Sequential(\n            nn.Conv1d(n_sensors, 32, kernel_size=3, padding=1),\n            nn.ReLU(),\n            nn.Conv1d(32, 64, kernel_size=3, padding=1),\n            nn.ReLU(),\n            nn.MaxPool1d(2)\n        )\n        self.lstm = nn.LSTM(64, hidden, num_layers=2, batch_first=True, dropout=0.2)\n        self.fc = nn.Sequential(\n            nn.Linear(hidden, 32),\n            nn.ReLU(),\n            nn.Dropout(0.1),\n            nn.Linear(32, 1)\n        )\n\n    def forward(self, x):\n        cnn_out = self.cnn(x.permute(0, 2, 1))\n        lstm_in = cnn_out.permute(0, 2, 1)\n        lstm_out, _ = self.lstm(lstm_in)\n        last_hidden = lstm_out[:, -1, :]\n        rul = self.fc(last_hidden)\n        return rul.squeeze(-1)\n\n    def predict_with_uncertainty(self, x, n_samples: int = 50):\n        predictions = torch.stack([self(x) for _ in range(n_samples)])\n        mean = predictions.mean(dim=0)\n        std = predictions.std(dim=0)\n        return mean, std`
                },
                {
                    lang: "python",
                    code: `# 退化阶段划分 - 隐马尔可夫模型\nimport numpy as np\nfrom hmmlearn import hmm\n\nclass DegradationHMM:\n    def __init__(self, n_states: int = 4):\n        self.n_states = n_states\n        self.model = hmm.GaussianHMM(\n            n_components=n_states,\n            covariance_type="full",\n            n_iter=100\n        )\n        self.state_labels = ["健康", "轻度退化", "中度退化", "严重退化"]\n\n    def fit(self, sequences: np.ndarray, lengths: np.ndarray):\n        self.model.fit(sequences, lengths=lengths)\n        print(f"HMM trained with {self.n_states} degradation states")\n\n    def decode_state(self, observation: np.ndarray) -> tuple:\n        states = self.model.predict(observation)\n        probs = self.model.predict_proba(observation)\n        current_state = states[-1]\n        confidence = probs[-1, current_state]\n        return self.state_labels[current_state], confidence\n\n    def transition_probability(self) -> np.ndarray:\n        return self.model.transmat_`
                }
            ],
            table: {
                headers: ["维护策略", "触发条件", "成本", "停机时间", "适用范围"],
                rows: [
                    ["事后维修", "设备故障后", "低", "长", "非关键设备"],
                    ["定期维护", "固定周期", "中", "中", "一般设备"],
                    ["状态维护", "阈值触发", "中高", "短", "关键设备"],
                    ["预测性维护", "退化预测", "高", "最短", "高价值设备"]
                ]
            },
            mermaid: `graph TD\n    A[传感器数据] --> B[特征工程]\n    B --> C[退化状态识别]\n    C --> D[RUL 预测]\n    D --> E[维护决策]\n    E --> F[维护计划排程]\n    F --> G[执行维护]\n    G --> H[效果评估]\n    H --> B`,
            tip: "RUL 预测的标签设计很关键。分段线性标签比线性标签更符合真实的设备退化规律。",
            warning: "预测性维护模型需要在不同工况下验证泛化能力，单一工况的模型在产线切换时可能完全失效。"
        },
        {
            title: "5. 多模态工业数据融合",
            body: `现代工业场景中，单一数据源往往无法全面反映设备状态。多模态数据融合将视觉图像、振动信号、温度数据、声学信号等多种传感器信息整合，通过跨模态的互补信息提升异常检测的准确性和鲁棒性。多模态融合的关键挑战在于不同模态的采样频率、数据维度和语义层次差异巨大。常用的融合策略包括早期融合、晚期融合和混合融合。深度学习中的跨模态注意力机制和对比学习方法（如 CLIP 的工业适配版本）正在为这一领域带来突破。多模态方法在半导体制造、风力发电机监测、航空航天等领域展现出显著优势。`,
            code: [
                {
                    lang: "python",
                    code: `# 跨模态注意力融合模块\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass CrossModalAttention(nn.Module):\n    def __init__(self, visual_dim: int, temporal_dim: int, fusion_dim: int = 128):\n        super().__init__()\n        self.visual_proj = nn.Linear(visual_dim, fusion_dim)\n        self.temporal_proj = nn.Linear(temporal_dim, fusion_dim)\n        self.cross_attn = nn.MultiheadAttention(fusion_dim, num_heads=4, batch_first=True)\n        self.fusion = nn.Sequential(\n            nn.Linear(fusion_dim * 2, fusion_dim),\n            nn.LayerNorm(fusion_dim),\n            nn.ReLU(),\n            nn.Dropout(0.1),\n            nn.Linear(fusion_dim, 64)\n        )\n\n    def forward(self, visual_feat: torch.Tensor, temporal_feat: torch.Tensor) -> torch.Tensor:\n        v = self.visual_proj(visual_feat).unsqueeze(1)\n        t = self.temporal_proj(temporal_feat).unsqueeze(1)\n        # 交叉注意力\n        v_attended, _ = self.cross_attn(v, t, t)\n        t_attended, _ = self.cross_attn(t, v, v)\n        fused = torch.cat([v_attended.squeeze(1), t_attended.squeeze(1)], dim=-1)\n        return self.fusion(fused)`
                },
                {
                    lang: "python",
                    code: `# 多模态工业数据集构建\nimport torch\nfrom torch.utils.data import Dataset\nimport numpy as np\n\nclass MultiModalIndustrialDataset(Dataset):\n    def __init__(self, image_dir: str, sensor_file: str, acoustic_dir: str):\n        import pandas as pd\n        self.sensor_data = pd.read_csv(sensor_file).values.astype(np.float32)\n        self.image_paths = [f"{image_dir}/img_{i}.png" for i in range(len(self.sensor_data))]\n        self.acoustic_paths = [f"{acoustic_dir}/audio_{i}.npy" for i in range(len(self.sensor_data))]\n        self.labels = np.zeros(len(self.sensor_data))\n\n    def __len__(self):\n        return len(self.sensor_data)\n\n    def __getitem__(self, idx):\n        from PIL import Image\n        import torchvision.transforms as T\n        img = Image.open(self.image_paths[idx]).convert("RGB")\n        img = T.Compose([T.Resize(224), T.ToTensor()])(img)\n        sensor = torch.tensor(self.sensor_data[idx])\n        acoustic = torch.tensor(np.load(self.acoustic_paths[idx]))\n        return {"image": img, "sensor": sensor, "acoustic": acoustic}`
                }
            ],
            table: {
                headers: ["模态组合", "采样率", "特征维度", "融合策略", "典型应用"],
                rows: [
                    ["视觉+振动", "图像 30fps + 振动 10kHz", "512 + 128", "交叉注意力", "轴承监测"],
                    ["视觉+温度", "图像 30fps + 温度 1Hz", "512 + 32", "晚期融合", "焊接质量"],
                    ["声学+振动", "音频 44kHz + 振动 10kHz", "64 + 128", "早期融合", "齿轮箱"],
                    ["三模态融合", "多种传感器混合", "512 + 128 + 64", "混合融合", "半导体制造"]
                ]
            },
            mermaid: `graph TD\n    A[视觉传感器] --> D[特征编码器 V]\n    B[振动传感器] --> E[特征编码器 T]\n    C[声学传感器] --> F[特征编码器 A]\n    D --> G[跨模态注意力]\n    E --> G\n    F --> G\n    G --> H[融合特征]\n    H --> I[异常分类器]\n    I --> J[异常检测结果]`,
            tip: "多模态融合中，先用单模态模型建立基线，再逐步增加模态。这样可以量化每个模态的贡献度。",
            warning: "不同模态的时间对齐是多模态工业数据的最大陷阱。务必在数据预处理阶段完成精确的时钟同步。"
        },
        {
            title: "6. 边缘部署挑战：从云端到产线",
            body: `工业异常检测模型最终需要部署到产线边缘设备上，实现毫秒级实时推理。边缘部署面临三大核心挑战：模型体积受限、推理延迟要求严格、环境条件恶劣。模型压缩技术包括知识蒸馏、量化感知训练、剪枝和神经架构搜索。TensorRT、ONNX Runtime 和 OpenVINO 是工业边缘推理的主流框架。此外，边缘设备还需要处理持续学习和模型更新的问题。联邦学习可以在不集中数据的前提下，利用多个工厂的数据联合训练模型，既保护了数据隐私，又提升了模型泛化能力。`,
            code: [
                {
                    lang: "python",
                    code: `# 模型量化与 TensorRT 部署\nimport torch\nimport torch.nn as nn\n\ndef quantize_model(model: nn.Module, calib_loader: torch.utils.data.DataLoader):\n    model.eval()\n    model.qconfig = torch.quantization.get_default_qconfig("fbgemm")\n    torch.quantization.prepare(model, inplace=True)\n    with torch.no_grad():\n        for batch in calib_loader:\n            model(batch)\n    torch.quantization.convert(model, inplace=True)\n    original_size = sum(p.numel() * p.element_size() for p in model.parameters())\n    print(f"Original model size: {original_size / 1024:.1f} KB")\n    return model\n\ndef export_to_onnx(model: nn.Module, dummy_input: torch.Tensor, path: str):\n    torch.onnx.export(model, dummy_input, path,\n                      export_params=True,\n                      opset_version=14,\n                      input_names=["input"],\n                      output_names=["output"],\n                      dynamic_axes={"input": {0: "batch"}})\n    print(f"Model exported to {path}")`
                },
                {
                    lang: "python",
                    code: `# 边缘设备推理服务 - FastAPI\nfrom fastapi import FastAPI\nimport torch\nimport numpy as np\nfrom pydantic import BaseModel\nimport base64\nfrom io import BytesIO\nfrom PIL import Image\nimport torchvision.transforms as T\n\napp = FastAPI(title="工业异常检测 API")\nmodel = torch.jit.load("anomaly_detector.pt")\nmodel.eval()\n\nclass InferenceRequest(BaseModel):\n    image_b64: str\n    threshold: float = 0.5\n\n@app.post("/detect")\ndef detect_anomaly(req: InferenceRequest):\n    img_bytes = base64.b64decode(req.image_b64)\n    img = Image.open(BytesIO(img_bytes)).convert("RGB")\n    transform = T.Compose([\n        T.Resize((256, 256)),\n        T.ToTensor(),\n        T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])\n    ])\n    tensor = transform(img).unsqueeze(0)\n    with torch.no_grad():\n        score = model(tensor).item()\n    is_anomaly = score > req.threshold\n    return {"anomaly_score": round(score, 4), "is_anomaly": is_anomaly}`
                }
            ],
            table: {
                headers: ["部署平台", "推理延迟", "模型大小限制", "精度损失", "成本"],
                rows: [
                    ["NVIDIA Jetson", "<10ms", "<500MB", "<1%", "高"],
                    ["Intel OpenVINO", "<15ms", "<200MB", "<2%", "中"],
                    ["Raspberry Pi", "<50ms", "<100MB", "3-5%", "低"],
                    ["FPGA 加速", "<5ms", "可定制", "<0.5%", "极高"]
                ]
            },
            mermaid: `graph TD\n    A[云端训练] --> B[模型压缩]\n    B --> C{压缩策略}\n    C -->|量化| D[INT8 量化]\n    C -->|剪枝| E[结构化剪枝]\n    C -->|蒸馏| F[知识蒸馏]\n    D --> G[TensorRT 优化]\n    E --> G\n    F --> G\n    G --> H[边缘部署]\n    H --> I[持续监控]\n    I -->|性能下降| A`,
            tip: "边缘部署前，务必在目标设备上实测推理延迟。服务器上的测试结果不能直接迁移到边缘设备。",
            warning: "INT8 量化在某些视觉异常检测任务中会导致精度显著下降，建议先用 INT8 量化评估再决定是否采用。"
        },
        {
            title: "7. 实战：工业缺陷检测完整项目",
            body: `本章将整合前面所学的技术，从零构建一个完整的工业缺陷检测系统。我们选择 MVTec AD 数据集中的 bottle 类别作为示例，使用 PatchCore 算法实现异常检测和定位。整个项目包含数据准备、模型构建、记忆库建立、推理评估和部署五个阶段。在真实场景中，还需要加入数据版本管理、模型监控告警和自动化回滚机制。一个成熟的工业 AI 系统，模型本身只占 20% 的工作量，剩余 80% 是数据管道、基础设施和运维体系的构建。这也是为什么 MLOps 在工业 AI 项目中如此重要。`,
            code: [
                {
                    lang: "python",
                    code: `# 完整的 PatchCore 训练与评估流程\nimport torch\nfrom torchvision.models import resnet18, ResNet18_Weights\nimport torch.nn.functional as F\nfrom sklearn.metrics import roc_auc_score\nimport numpy as np\n\nclass CompletePatchCore:\n    def __init__(self, backbone: str = "resnet18", coreset_ratio: float = 0.01):\n        self.feature_extractor = self._build_extractor()\n        self.memory = None\n        self.coreset_ratio = coreset_ratio\n\n    def _build_extractor(self):\n        model = resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)\n        layers = list(model.children())\n        return torch.nn.Sequential(*layers[:-2]).eval()\n\n    def extract_features(self, images: torch.Tensor) -> torch.Tensor:\n        with torch.no_grad():\n            return self.feature_extractor(images)\n\n    def train(self, normal_images: torch.Tensor, batch_size: int = 32):\n        all_features = []\n        for i in range(0, len(normal_images), batch_size):\n            batch = normal_images[i:i+batch_size]\n            feat = self.extract_features(batch)\n            all_features.append(feat.cpu())\n        all_features = torch.cat(all_features, dim=0)\n        # 构建记忆库\n        n_patches = all_features.shape[0] * all_features.shape[2] * all_features.shape[3]\n        flat = all_features.permute(0, 2, 3, 1).reshape(-1, all_features.shape[1])\n        n_select = int(n_patches * self.coreset_ratio)\n        indices = torch.randperm(len(flat))[:n_select]\n        self.memory = flat[indices]\n        print(f"Memory bank: {self.memory.shape}")\n\n    def evaluate(self, test_images: torch.Tensor, labels: torch.Tensor) -> dict:\n        scores = []\n        for img in test_images:\n            feat = self.extract_features(img.unsqueeze(0))\n            patches = feat.permute(0, 2, 3, 1).reshape(-1, feat.shape[1])\n            patches = F.normalize(patches, dim=1)\n            mem = F.normalize(self.memory, dim=1)\n            dists = torch.cdist(patches, mem)\n            scores.append(dists.min(dim=1).values.max().item())\n        auc = roc_auc_score(labels.numpy(), scores)\n        return {"image_auc": auc, "n_test": len(test_images)}`
                },
                {
                    lang: "python",
                    code: `# MLOps 流水线 - 模型版本管理与监控\nimport mlflow\nimport json\nfrom datetime import datetime\n\nclass ModelRegistry:\n    def __init__(self, experiment_name: str = "industrial_anomaly_detection"):\n        mlflow.set_experiment(experiment_name)\n        self.experiment = mlflow.get_experiment_by_name(experiment_name)\n\n    def log_model(self, model: object, metrics: dict, tags: dict):\n        with mlflow.start_run() as run:\n            mlflow.log_params(tags)\n            mlflow.log_metrics(metrics)\n            mlflow.log_artifact("config.json")\n            model_uri = mlflow.pytorch.log_model(model, "model")\n            run_id = run.info.run_id\n            print(f"Model logged: run_id={run_id}")\n            return run_id\n\n    def promote_to_production(self, run_id: str):\n        client = mlflow.tracking.MlflowClient()\n        client.transition_model_version_stage(\n            name="PatchCoreDetector",\n            version=1,\n            stage="Production"\n        )\n        print(f"Model {run_id} promoted to Production")\n\n    def monitor_drift(self, current_data: np.ndarray, reference_data: np.ndarray) -> dict:\n        from scipy.stats import ks_2statistic\n        drift_scores = {}\n        for i in range(current_data.shape[1]):\n            stat, p_value = ks_2statistic(reference_data[:, i], current_data[:, i])\n            drift_scores[f"feature_{i}"] = {"ks_stat": stat, "p_value": p_value}\n        return drift_scores`
                }
            ],
            table: {
                headers: ["项目阶段", "关键产出", "时间占比", "常见风险"],
                rows: [
                    ["数据采集", "标注数据集", "15%", "样本不均衡、标注不一致"],
                    ["模型开发", "训练好的模型", "20%", "过拟合、泛化差"],
                    ["系统构建", "推理服务", "25%", "延迟超标、并发瓶颈"],
                    ["测试验证", "评估报告", "20%", "测试集偏差"],
                    ["部署运维", "上线系统", "20%", "数据漂移、性能衰减"]
                ]
            },
            mermaid: `graph TD\n    A[需求分析] --> B[数据采集]\n    B --> C[数据清洗标注]\n    C --> D[模型训练]\n    D --> E[离线评估]\n    E -->|达标| F[部署上线]\n    E -->|不达标| D\n    F --> G[在线监控]\n    G -->|数据漂移| H[模型重训]\n    H --> D\n    G -->|正常| I[持续运行]`,
            tip: "工业项目中，数据质量比模型复杂度重要 10 倍。先确保数据干净，再考虑换模型。",
            warning: "不要把训练集和测试集的数据来源混在一起。真实产线的数据分布可能和实验室完全不同。"
        }
    ],
};
