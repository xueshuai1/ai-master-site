import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-015",
    title: "迁移学习：预训练 + 微调范式",
    category: "dl",
    tags: ["迁移学习", "预训练", "微调"],
    summary: "站在巨人的肩膀上，掌握迁移学习的策略与最佳实践",
    date: "2026-04-12",
    readTime: "16 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么需要迁移学习",
            body: `深度学习模型通常需要海量标注数据才能达到理想性能，但现实场景中高质量标注数据往往稀缺且昂贵。迁移学习的核心思想是将从源领域学到的知识迁移到目标领域，从而大幅降低对目标数据量的需求。以 ImageNet 预训练模型为例，一个在 1400 万张图片上训练过的 ResNet 已经学会了丰富的视觉特征表示，这些通用特征（边缘、纹理、形状）可以直接复用到医学影像、卫星图像等完全不同的领域。迁移学习不仅解决了数据稀缺问题，还能显著缩短训练时间——从零训练一个大型模型可能需要数天甚至数周，而基于预训练权重微调只需数小时。此外，迁移学习已被证明在泛化能力上优于从头训练，因为预训练模型已经在多样化数据上学习到了更鲁棒的特征表示。当前主流的大语言模型（LLM）同样遵循这一范式：先在海量语料上预训练，再通过指令微调适配下游任务。`,
            code: [
                {
                    lang: "python",
                    code: `# 对比：从零训练 vs 迁移学习的效率差异\nimport torch\nimport torchvision.models as models\n\n# 从零训练：需要大量数据和时间\n# 预训练模型：加载即具备丰富特征表示\npretrained_model = models.resnet50(\n    weights=models.ResNet50_Weights.IMAGENET1K_V2\n)\nprint(f"预训练权重加载完成")\nprint(f"参数量: {sum(p.numel() for p in pretrained_model.parameters()):,}")`
                },
                {
                    lang: "python",
                    code: `# 迁移学习的核心优势量化\nimport time\nfrom torchvision import datasets, transforms\n\n# 场景模拟：小样本目标域训练\ntrain_time_scratch = "约 72 小时 (从零训练 ResNet-50)"\ntrain_time_transfer = "约 2 小时 (微调预训练模型)"\n\nprint(f"从零训练: {train_time_scratch}")\nprint(f"迁移学习: {train_time_transfer}")\nprint(f"时间节省: {((72 - 2) / 72 * 100):.0f}%")`
                }
            ],
            table: {
                headers: ["训练方式", "所需数据量", "训练时间", "准确率"],
                rows: [
                    ["从零训练", "100万+ 标注", "~72小时", "78.5%"],
                    ["迁移学习", "1万 标注", "~2小时", "85.2%"],
                    ["少样本微调", "500 标注", "~30分钟", "82.1%"]
                ]
            },
            mermaid: `graph LR\n    A["大规模源域数据"] --> B["预训练模型"]\n    B --> C["通用特征表示"]\n    C --> D["目标任务适配"]\n    D --> E["高性能目标模型"]`,
            tip: "优先选择与目标领域数据分布接近的预训练模型，例如医学图像使用 MedPretrain 权重而非 ImageNet 权重",
            warning: "源领域和目标领域差异过大时，负迁移会导致性能下降而非提升"
        },
        {
            title: "2. 迁移学习三大策略",
            body: `迁移学习并非一种固定方法，而是一套策略体系。根据目标数据量和任务相似度，有三种主流策略可供选择。第一种是特征提取（Feature Extraction），即冻结预训练模型的绝大部分层，仅替换并训练最后的分类头。这种策略适合目标数据极少（几百到几千样本）且任务与源任务相似的场景。第二种是微调（Fine-tuning），在特征提取的基础上，解冻部分或全部网络层，使用较低的学习率对整个模型进行端到端训练。这是最常用的策略，适用于中等规模数据和中等任务差异。第三种是线性探测（Linear Probing），仅训练一个线性分类器而不改动预训练特征提取器，适合快速验证预训练特征的有效性。在实际工程中，通常会先做线性探测评估特征质量，再决定是否进入微调阶段。PyTorch 的参数requires_grad控制使得这几种策略可以灵活切换。`,
            code: [
                {
                    lang: "python",
                    code: `# 策略一：特征提取（冻结全部层）\nimport torch.nn as nn\nimport torchvision.models as models\n\nmodel = models.resnet50(weights="IMAGENET1K_V2")\n\n# 冻结所有预训练参数\nfor param in model.parameters():\n    param.requires_grad = False\n\n# 替换分类头\nnum_features = model.fc.in_features\nmodel.fc = nn.Sequential(\n    nn.Linear(num_features, 256),\n    nn.ReLU(),\n    nn.Dropout(0.5),\n    nn.Linear(256, 10)  # 10类目标\n)\n\n# 只有分类头的参数可训练\ntrainable = [p.numel() for p in model.parameters() if p.requires_grad]\nprint(f"可训练参数: {sum(trainable):,}")`
                },
                {
                    lang: "python",
                    code: `# 策略二：微调（部分解冻 + 低学习率）\ndef setup_fine_tune(model, unfreeze_from: str = "layer3"):\n    """从指定层开始解冻"""\n    freeze = True\n    for name, param in model.named_parameters():\n        if name.startswith(unfreeze_from):\n            freeze = False\n        param.requires_grad = not freeze\n    return model\n\nmodel = setup_fine_tune(model, unfreeze_from="layer3")\n\n# 不同层使用不同学习率\noptimizer = torch.optim.Adam([\n    {"params": model.layer3.parameters(), "lr": 1e-5},\n    {"params": model.layer4.parameters(), "lr": 1e-4},\n    {"params": model.fc.parameters(), "lr": 1e-3},\n])`
                }
            ],
            table: {
                headers: ["策略", "解冻层数", "适用数据量", "训练速度"],
                rows: [
                    ["线性探测", "仅分类头", "< 500", "极快"],
                    ["特征提取", "仅分类头", "500 - 5000", "快"],
                    ["全量微调", "全部层", "5000+", "较慢"]
                ]
            },
            mermaid: `graph TD\n    A["预训练模型"] --> B["线性探测"]\n    A --> C["特征提取"]\n    A --> D["全量微调"]\n    B --> E["评估特征质量"]\n    C --> F["冻结骨干 + 训练分类头"]\n    D --> G["低学习率端到端训练"]`,
            tip: "先用线性探测验证预训练特征有效性，再做特征提取，最后考虑全量微调，这是一个稳妥的递进流程",
            warning: "全量微调在小数据集上极易过拟合，务必配合早停和数据增强"
        },
        {
            title: "3. 冻结策略与学习率调度",
            body: `迁移学习中，冻结策略与学习率调度的配合是决定成败的关键细节。简单冻结全部参数然后训练分类头只是起点，更精细的做法是逐层解冻（Progressive Unfreezing）：先训练分类头若干轮，然后逐步解冻深层网络，最后解冻浅层网络。这种渐进式策略避免了早期大梯度对预训练权重的破坏。学习率方面，推荐使用差异化学习率（Discriminative Learning Rate），即靠近输出的深层使用较高学习率，靠近输入的浅层使用更低学习率，因为浅层学到的是通用特征（边缘检测等），改动应更谨慎。配合余弦退火或 OneCycleLR 等学习率调度策略，可以在训练初期快速收敛，后期精细调优。PyTorch 的 torch.optim.lr_scheduler 提供了丰富的调度选项，合理组合这些工具可以让迁移训练效果提升 3-5 个百分点。`,
            code: [
                {
                    lang: "python",
                    code: `# 渐进式解冻 + 差异化学习率\nimport torch.nn as nn\n\ndef progressive_unfreeze(model, epochs_per_stage=3):\n    """分阶段解冻网络层"""\n    stage_groups = [\n        model.fc,              # 阶段1: 仅分类头\n        model.layer4,          # 阶段2: 解冻layer4\n        model.layer3,          # 阶段3: 解冻layer3\n        [model.layer1, model.layer2]  # 阶段4: 解冻浅层\n    ]\n    return stage_groups\n\n# 每个阶段使用递减学习率\nlr_stages = [1e-3, 5e-4, 1e-4, 5e-5]\nprint(f"共 {len(lr_stages)} 个训练阶段")\nfor i, lr in enumerate(lr_stages):\n    print(f"阶段 {i+1}: lr={lr:.0e}")`
                },
                {
                    lang: "python",
                    code: `# 学习率调度组合拳\nfrom torch.optim.lr_scheduler import (\n    OneCycleLR, CosineAnnealingWarmRestarts\n)\n\n# 方案A: OneCycleLR（适合快速微调）\nscheduler_one_cycle = OneCycleLR(\n    optimizer,\n    max_lr=1e-3,\n    total_steps=1000,\n    pct_start=0.3,       # 30%时间预热\n    div_factor=25,       # 初始lr = max_lr / 25\n    final_div_factor=1e4 # 最终lr = max_lr / 1e4\n)\n\n# 方案B: 余弦退火 + 热重启（适合精细微调）\nscheduler_cosine = CosineAnnealingWarmRestarts(\n    optimizer, T_0=10, T_mult=2, eta_min=1e-6\n)`
                }
            ],
            table: {
                headers: ["调度策略", "适用场景", "优势", "缺点"],
                rows: [
                    ["OneCycleLR", "快速微调", "收敛快，泛化好", "需预设总步数"],
                    ["余弦退火", "精细微调", "平滑收敛", "可能陷入局部最优"],
                    ["Warm + Cosine", "全量微调", "兼顾稳定与精度", "超参数较多"],
                    ["ReduceLROnPlateau", "自适应", "自动调整", "需监控指标"]
                ]
            },
            mermaid: `graph LR\n    A["高学习率训练分类头"] --> B["解冻深层"]\n    B --> C["中等学习率微调"]\n    C --> D["解冻浅层"]\n    D --> E["极低学习率精调"]\n    E --> F["收敛"]`,
            tip: "使用 torch.optim.lr_scheduler.ReduceLROnPlateau 在验证指标不再提升时自动降低学习率，这是最安全的默认选择",
            warning: "解冻浅层网络后学习率必须极低（1e-5 以下），否则预训练的通用特征会被快速破坏"
        },
        {
            title: "4. 数据增强与领域适配",
            body: `迁移学习的效果很大程度上取决于源域与目标域之间的分布差异。当差异较大时，仅靠调整网络结构和训练策略是不够的，还需要通过数据增强和领域适配技术来桥接这一鸿沟。数据增强是成本最低且最有效的适配手段：通过随机裁剪、色彩抖动、MixUp 等变换扩充训练集的多样性，使模型对领域偏移更加鲁棒。对于图像任务，Albumentations 库提供了超过 70 种增强变换，可以组合出极其丰富的增强流水线。在更复杂的场景下，可以使用领域自适应（Domain Adaptation）方法，如对抗训练（DANN）或风格迁移（Style Transfer），显式地减少源域和目标域特征分布的差异。此外，测试时增强（Test-Time Augmentation）和伪标签（Pseudo-labeling）也能在无目标标签的情况下进一步提升性能。`,
            code: [
                {
                    lang: "python",
                    code: `# 领域适配型数据增强流水线\nimport albumentations as A\nfrom albumentations.pytorch import ToTensorV2\n\ndef get_train_augmentations(img_size=224):\n    """针对领域偏移的鲁棒增强策略"""\n    return A.Compose([\n        A.RandomResizedCrop(img_size, img_size,\n                           scale=(0.6, 1.0)),\n        A.HorizontalFlip(p=0.5),\n        A.ColorJitter(\n            brightness=0.3, contrast=0.3,\n            saturation=0.3, hue=0.1, p=0.8\n        ),\n        A.GaussianBlur(blur_limit=7, p=0.3),\n        A.Normalize(mean=[0.485, 0.456, 0.406],\n                    std=[0.229, 0.224, 0.225]),\n        ToTensorV2()\n    ])`
                },
                {
                    lang: "python",
                    code: `# MixUp 数据增强（缓解领域偏移）\nimport torch.nn.functional as F\n\ndef mixup_data(x, y, alpha=0.2):\n    """MixUp: 线性插值样本对"""\n    if alpha > 0:\n        lam = torch.distributions.Beta(\n            alpha, alpha\n        ).sample().item()\n    else:\n        lam = 1.0\n\n    batch_size = x.size(0)\n    index = torch.randperm(batch_size).to(x.device)\n    \n    mixed_x = lam * x + (1 - lam) * x[index]\n    y_a, y_b = y, y[index]\n    return mixed_x, y_a, y_b, lam\n\n# 损失函数调整\ndef mixup_criterion(pred, y_a, y_b, lam):\n    return lam * F.cross_entropy(pred, y_a) + \\\n           (1 - lam) * F.cross_entropy(pred, y_b)`
                }
            ],
            table: {
                headers: ["增强技术", "领域差异大时", "数据量少时", "计算开销"],
                rows: [
                    ["基础变换", "有效", "必要", "低"],
                    ["MixUp/CutMix", "很有效", "推荐", "极低"],
                    ["色彩扰动", "关键", "可选", "低"],
                    ["风格迁移", "最有效", "可选", "高"]
                ]
            },
            mermaid: `graph TD\n    A["源域数据"] --> B["领域差异检测"]\n    B --> C["差异较小"]\n    B --> D["差异较大"]\n    C --> E["基础增强"]\n    D --> F["MixUp + 色彩扰动"]\n    D --> G["对抗领域适配"]\n    E --> H["目标域训练"]\n    F --> H\n    G --> H`,
            tip: "在目标域上运行 t-SNE 可视化源域和目标域特征分布，直观判断领域差异大小，再选择对应增强强度",
            warning: "过度增强会降低训练效率，导致模型学到的都是扭曲数据而非真实模式，监控训练损失曲线至关重要"
        },
        {
            title: "5. 预训练模型选择",
            body: `选择正确的预训练模型是迁移学习成功的前提。当前可用的预训练模型生态极其丰富，从经典的 ResNet、VGG 到现代的 Vision Transformer（ViT）、Swin Transformer，再到多模态的 CLIP 模型。选择时需要综合考虑多个维度：首先是任务类型，分类任务首选 ResNet/EfficientNet，检测任务选 FPN/DETR 架构，分割任务选 DeepLab/SAM 架构。其次是模型容量，小数据集用较小模型（ResNet-18/34）避免过拟合，大数据集用较大模型（ResNet-101/ViT-L）获取更好性能。第三是计算资源约束，移动端部署必须考虑模型大小和推理延迟。第四是预训练数据的质量和相关性，通用 ImageNet 预训练是安全基线，但如果有领域特定的预训练模型（如 BioMedCLIP 用于医学影像），优先使用领域模型。最后是许可证和商业使用限制，部分预训练权重有非商用条款。`,
            code: [
                {
                    lang: "python",
                    code: `# 多模型基准对比\nimport torchvision.models as models\nfrom timm import list_models, create_model\n\ndef compare_models():\n    """对比候选预训练模型"""\n    candidates = {\n        "resnet50": models.resnet50(\n            weights="IMAGENET1K_V2"),\n        "efficientnet_b0": models.efficientnet_b0(\n            weights="IMAGENET1K_V1"),\n        "convnext_tiny": models.convnext_tiny(\n            weights="IMAGENET1K_V1"),\n    }\n    \n    results = []\n    for name, model in candidates.items():\n        params = sum(p.numel() for p in model.parameters())\n        results.append((name, params))\n    \n    for name, params in sorted(results, key=lambda x: x[1]):\n        print(f"{name:20s} {params:>10,} params")\n\ncompare_models()`
                },
                {
                    lang: "python",
                    code: `# TIMM 库：一站式预训练模型仓库\nimport timm\n\n# 列出所有可用预训练模型\nall_models = timm.list_models(pretrained=True)\nprint(f"可用预训练模型: {len(all_models)} 个")\n\n# 加载特定预训练权重\nmodel = timm.create_model(\n    "convnext_large",\n    pretrained=True,\n    num_classes=10,        # 自定义类别数\n    drop_path_rate=0.2     # 随机深度正则化\n)\n\n# 查看模型默认配置\ndata_cfg = timm.data.resolve_model_data_config(model)\nprint(f"输入尺寸: {data_cfg['input_size']}")\nprint(f"归一化均值: {data_cfg['mean']}")\nprint(f"归一化标准差: {data_cfg['std']}")`
                }
            ],
            table: {
                headers: ["模型", "参数量", "Top-1 精度", "适用场景"],
                rows: [
                    ["ResNet-50", "25.6M", "80.8%", "通用分类基线"],
                    ["EfficientNet-B3", "12.2M", "81.6%", "移动端部署"],
                    ["ConvNeXt-Large", "198M", "87.8%", "高精度场景"],
                    ["ViT-Base", "86.6M", "84.2%", "大数据 + 强算力"],
                    ["CLIP-ViT", "151M", "N/A*", "多模态/零样本"]
                ]
            },
            mermaid: `graph LR\n    A["明确任务需求"] --> B["分类/检测/分割"]\n    B --> C["评估数据量"]\n    C --> D["评估算力"]\n    D --> E["候选模型池"]\n    E --> F["基准测试对比"]\n    F --> G["选择最优模型"]`,
            tip: "使用 TIMM 库的 timm.list_models(pretrained=True) 快速浏览可用模型，再用 timm.create_model 一行加载，比 torchvision 更灵活",
            warning: "ViT 等 Transformer 架构在数据量少于 1 万时通常不如 CNN，不要盲目追求最新架构"
        },
        {
            title: "6. 小样本学习技巧",
            body: `当目标域标注数据极少（几十到几百样本）时，标准微调策略仍然容易过拟合。小样本学习（Few-shot Learning）需要一整套针对性的技巧。首先是更激进的冻结策略，只解冻最后 1-2 层，保持预训练特征的完整性。其次使用更强的正则化：增大权重衰减系数、提高 Dropout 比例、添加标签平滑。第三是元学习（Meta-Learning）思路，如原型网络（Prototypical Networks）和支持集-查询集（Support-Query）范式，通过模拟少样本场景让模型学会如何快速适应新类别。第四是数据层面的策略，包括更强的数据增强、半监督学习（利用未标注数据）、以及自训练（Self-training）用模型自身预测生成伪标签。此外，提示学习（Prompt Learning）在视觉领域也开始崭露头角，通过优化可学习的提示向量而非修改模型权重，实现更高效的小样本适配。`,
            code: [
                {
                    lang: "python",
                    code: `# 原型网络（Prototypical Network）\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass PrototypicalNetwork(nn.Module):\n    def __init__(self, encoder):\n        super().__init__()\n        self.encoder = encoder  # 冻结的预训练特征提取器\n    \n    def forward(self, support_x, support_y, query_x):\n        # 提取支持集特征并计算类原型\n        support_feat = self.encoder(support_x)\n        prototypes = self.compute_prototypes(\n            support_feat, support_y\n        )\n        # 计算查询样本到原型的距离\n        query_feat = self.encoder(query_x)\n        dists = self.euclidean_dist(query_feat, prototypes)\n        return -dists  # 负距离作为 logits\n    \n    def compute_prototypes(self, feat, labels):\n        classes = torch.unique(labels)\n        prototypes = torch.stack([\n            feat[labels == c].mean(dim=0) for c in classes\n        ])\n        return prototypes\n    \n    def euclidean_dist(self, x, y):\n        return torch.cdist(x, y, p=2)`
                },
                {
                    lang: "python",
                    code: `# 小样本微调的超参数配置\nfew_shot_config = {\n    # 冻结策略\n    "unfreeze_layers": 1,        # 仅解冻最后1层\n    \n    # 激进正则化\n    "weight_decay": 1e-3,        # 比常规大10倍\n    "dropout_rate": 0.6,         # 高Dropout\n    "label_smoothing": 0.15,     # 标签平滑\n    \n    # 学习率\n    "lr": 5e-5,                  # 极低学习率\n    "warmup_epochs": 5,          # 较长预热\n    \n    # 训练轮次\n    "max_epochs": 50,            # 多轮次精细训练\n    "early_stop_patience": 10,   # 耐心早停\n}\n\nfor k, v in few_shot_config.items():\n    print(f"{k}: {v}")`
                }
            ],
            table: {
                headers: ["技巧", "数据量 <100", "数据量 100-1000", "实施难度"],
                rows: [
                    ["仅解冻分类头", "必须", "可选", "低"],
                    ["强正则化", "必须", "推荐", "低"],
                    ["原型网络", "推荐", "可选", "中"],
                    ["半监督学习", "强烈推荐", "推荐", "高"],
                    ["提示学习", "可选", "可选", "中"]
                ]
            },
            mermaid: `graph TD\n    A["极少标注数据"] --> B["冻结主干网络"]\n    B --> C["强正则化"]\n    C --> D["数据增强"]\n    D --> E["半监督/自训练"]\n    E --> F["原型/度量学习"]\n    F --> G["最优小样本模型"]`,
            tip: "5-way 1-shot 场景下，原型网络配合强数据增强是最稳定的基线方案，先跑通再考虑更复杂方法",
            warning: "小样本场景下验证集划分极其重要，确保验证集和测试集来自相同分布，否则早停策略会失效"
        },
        {
            title: "7. PyTorch 实战：ImageNet 预训练到自定义数据集微调",
            body: `理论再完善也需要落地到代码。本节以完整的 PyTorch 实战流程为例，展示从加载 ImageNet 预训练的 ResNet-50 到在自定义数据集上微调的全部步骤。整个流程包括：数据准备（使用 ImageFolder 加载自定义目录结构）、模型构建（加载预训练权重 + 替换分类头）、训练循环（带学习率调度和早停机制）、以及模型评估。关键细节在于使用参数分组实现差异化学习率，配合 ReduceLROnPlateau 调度器在验证损失不下降时自动降低学习率，并通过早停防止过拟合。训练完成后保存最佳权重和训练日志，方便后续分析和部署。这个完整流程可以直接套用到图像分类任务，只需替换数据路径和类别数即可。对于非分类任务（如检测、分割），核心思路相同，只需替换最后的任务头。`,
            code: [
                {
                    lang: "python",
                    code: `# 完整迁移学习训练流程\nimport torch\nimport torch.nn as nn\nfrom torchvision import datasets, transforms, models\nfrom torch.utils.data import DataLoader\nimport os\n\n# 1. 数据加载\ntrain_transform = transforms.Compose([\n    transforms.RandomResizedCrop(224),\n    transforms.RandomHorizontalFlip(),\n    transforms.ToTensor(),\n    transforms.Normalize(\n        [0.485, 0.456, 0.406],\n        [0.229, 0.224, 0.225]\n    )\n])\n\ntrain_dataset = datasets.ImageFolder(\n    "data/train", transform=train_transform\n)\ntrain_loader = DataLoader(\n    train_dataset, batch_size=32, shuffle=True, num_workers=4\n)\n\n# 2. 模型构建\nmodel = models.resnet50(weights="IMAGENET1K_V2")\nnum_ftrs = model.fc.in_features\nmodel.fc = nn.Linear(num_ftrs, 10)  # 自定义10类\n\n# 3. 差异化学习率\noptimizer = torch.optim.AdamW([\n    {"params": model.conv1.parameters(), "lr": 1e-5},\n    {"params": model.layer1.parameters(), "lr": 1e-5},\n    {"params": model.layer2.parameters(), "lr": 3e-5},\n    {"params": model.layer3.parameters(), "lr": 1e-4},\n    {"params": model.layer4.parameters(), "lr": 3e-4},\n    {"params": model.fc.parameters(), "lr": 1e-3},\n], weight_decay=1e-4)`
                },
                {
                    lang: "python",
                    code: `# 4. 训练循环 + 早停机制\ndef train_model(model, train_loader, val_loader, epochs=30):\n    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")\n    model = model.to(device)\n    \n    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)\n    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(\n        optimizer, mode="min", factor=0.5, patience=3\n    )\n    \n    best_acc = 0.0\n    patience_counter = 0\n    max_patience = 7\n    \n    for epoch in range(epochs):\n        # 训练阶段\n        model.train()\n        train_loss = 0.0\n        for inputs, labels in train_loader:\n            inputs, labels = inputs.to(device), labels.to(device)\n            optimizer.zero_grad()\n            outputs = model(inputs)\n            loss = criterion(outputs, labels)\n            loss.backward()\n            optimizer.step()\n            train_loss += loss.item()\n        \n        # 验证阶段\n        model.eval()\n        correct = 0\n        total = 0\n        with torch.no_grad():\n            for inputs, labels in val_loader:\n                inputs, labels = inputs.to(device), labels.to(device)\n                outputs = model(inputs)\n                _, predicted = outputs.max(1)\n                total += labels.size(0)\n                correct += predicted.eq(labels).sum().item()\n        \n        val_acc = correct / total\n        scheduler.step(val_acc)\n        \n        # 保存最佳模型\n        if val_acc > best_acc:\n            best_acc = val_acc\n            patience_counter = 0\n            torch.save(model.state_dict(), "best_model.pth")\n        else:\n            patience_counter += 1\n        \n        print(f"Epoch {epoch+1}: val_acc={val_acc:.4f}, best={best_acc:.4f}")\n        \n        # 早停检查\n        if patience_counter >= max_patience:\n            print(f"Early stopping at epoch {epoch+1}")\n            break\n    \n    return best_acc\n\nbest_acc = train_model(model, train_loader, val_loader)\nprint(f"最佳验证准确率: {best_acc:.4f}")`
                }
            ],
            table: {
                headers: ["训练阶段", "学习率", "解冻范围", "监控指标"],
                rows: [
                    ["Warmup (1-3轮)", "1e-5 -> 1e-3", "仅分类头", "训练损失"],
                    ["微调 (4-15轮)", "自适应", "后两层+分类头", "验证准确率"],
                    ["精调 (16-30轮)", "1e-5 以下", "全部层", "验证损失"],
                    ["早停触发", "停止", "全部", "patience计数"]
                ]
            },
            mermaid: `graph LR\n    A["加载预训练权重"] --> B["替换分类头"]\n    B --> C["差异化学习率"]\n    C --> D["训练循环"]\n    D --> E["验证评估"]\n    E --> F{"指标提升?"}\n    F -->|"是"| G["保存最佳权重"]\n    F -->|"否"| H["patience + 1"]\n    G --> D\n    H --> I{"达到上限?"}\n    I -->|"否"| D\n    I -->|"是"| J["Early Stop"]`,
            tip: "使用 torch.save(model.state_dict(), 'best_model.pth') 只保存权重而非整个模型对象，这样可以在不同代码环境中灵活加载",
            warning: "训练前务必验证数据加载正确：打印一个 batch 的 shapes 和 label 分布，避免数据管道错误导致训练无声失败"
        }
    ],
};
