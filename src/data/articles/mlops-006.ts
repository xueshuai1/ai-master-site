import { Article } from '../knowledge';

export const article: Article = {
    id: "mlops-006",
    title: "MLOps 安全与合规",
    category: "mlops",
    tags: ["安全", "合规", "数据治理"],
    summary: "从模型安全到数据隐私，掌握 MLOps 中的安全合规实践",
    date: "2026-04-12",
    readTime: "16 min",
    level: "高级",
    content: [
        {
            title: "1. ML 威胁建模",
            body: `威胁建模是 ML 系统安全的第一道防线。与传统软件不同，机器学习系统引入了数据投毒、模型逆向、成员推理等独特的攻击面。STRIDE 框架可以扩展用于 ML 场景：Spoofing 涉及伪造训练数据身份，Tampering 对应训练数据或模型权重的篡改，Repudiation 指缺乏对模型决策的审计日志，Information Disclosure 包括通过模型 API 推断训练数据，Denial of Service 可能通过对抗样本触发模型拒绝服务，Elevation of Privilege 则对应攻击者通过模型漏洞获得更高权限。ML 威胁建模的关键步骤包括：绘制数据流图识别训练数据和推理请求的路径，列出每个组件的信任边界，识别潜在威胁并评估风险等级，最后制定对应的缓解策略。微软的威胁建模工具（TMT）和 OWASP ML Top 10 是实践中最常用的参考框架。威胁建模不是一次性工作，每当引入新模型、新数据源或新部署方式时，都需要重新审视威胁模型并更新安全策略。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass\nfrom enum import Enum\nfrom typing import List\n\n\nclass ThreatCategory(Enum):\n    DATA_POISONING = "数据投毒"\n    MODEL_INVERSION = "模型逆向"\n    MEMBERSHIP_INFERENCE = "成员推理"\n    ADVERSARIAL_EXAMPLE = "对抗样本"\n    MODEL_EXTRATION = "模型窃取"\n\n\n@dataclass\nclass Threat:\n    category: ThreatCategory\n    component: str\n    risk_level: int  # 1-10\n    mitigation: str\n\n\ndef build_ml_threat_model() -> List[Threat]:\n    """构建 ML 系统威胁模型"""\n    return [\n        Threat(\n            category=ThreatCategory.DATA_POISONING,\n            component="训练数据管道",\n            risk_level=9,\n            mitigation="数据完整性校验 + 异常值检测"\n        ),\n        Threat(\n            category=ThreatCategory.MODEL_INVERSION,\n            component="推理 API",\n            risk_level=7,\n            mitigation="限制 API 输出精度 + 差分隐私"\n        ),\n        Threat(\n            category=ThreatCategory.MEMBERSHIP_INFERENCE,\n            component="模型输出层",\n            risk_level=6,\n            mitigation="输出置信度截断 + 正则化"\n        ),\n        Threat(\n            category=ThreatCategory.ADVERSARIAL_EXAMPLE,\n            component="输入预处理",\n            risk_level=8,\n            mitigation="对抗训练 + 输入消毒"\n        ),\n        Threat(\n            category=ThreatCategory.MODEL_EXTRATION,\n            component="推理端点",\n            risk_level=5,\n            mitigation="速率限制 + 查询异常检测"\n        ),\n    ]\n\nthreats = build_ml_threat_model()\nfor t in sorted(threats, key=lambda x: x.risk_level, reverse=True):\n    print(f"[{t.risk_level}/10] {t.category.value} -> {t.mitigation}")`
                },
                {
                    lang: "yaml",
                    code: `# threat-model-config.yaml\n# ML 系统威胁模型配置文件\n\nsystem_name: "fraud-detection-ml"\ntrust_boundaries:\n  - name: "数据摄入边界"\n    description: "外部数据源到内部数据湖"\n    threats:\n      - type: "data_poisoning"\n        likelihood: "high"\n        impact: "critical"\n        controls:\n          - "数据签名验证"\n          - "来源白名单"\n  - name: "推理 API 边界"\n    description: "客户端到模型服务端"\n    threats:\n      - type: "adversarial_input"\n        likelihood: "medium"\n        impact: "high"\n        controls:\n          - "输入范围检查"\n          - "对抗样本检测器"\n  - name: "模型存储边界"\n    description: "模型注册表到推理服务"\n    threats:\n      - type: "model_tampering"\n        likelihood: "low"\n        impact: "critical"\n        controls:\n          - "模型签名验证"\n          - "不可变存储"`
                }
            ],
            table: {
                headers: ["威胁类型", "攻击目标", "风险等级", "缓解策略", "检测难度"],
                rows: [
                    ["数据投毒", "训练数据", "极高", "数据签名 + 异常检测", "困难"],
                    ["对抗样本", "推理输入", "高", "对抗训练", "中等"],
                    ["模型逆向", "模型输出", "中高", "输出截断 + 差分隐私", "困难"],
                    ["成员推理", "模型置信度", "中", "置信度正则化", "中等"],
                    ["模型窃取", "推理 API", "中", "速率限制", "容易"],
                    ["模型篡改", "模型文件", "极高", "签名验证 + 不可变存储", "容易"]
                ]
            },
            mermaid: `graph TD
    A[外部数据源] -->|数据投毒风险| B[数据摄入层]
    B -->|信任边界 1| C[训练管道]
    C --> D[模型注册表]
    D -->|模型篡改风险| E[推理服务]
    E -->|对抗样本风险| F[客户端请求]
    E -->|模型逆向风险| G[输出结果]
    F -.->|速率限制| E
    G -.->|差分隐私| E`,
            tip: "使用 MITRE ATLAS（Adversarial Threat Landscape for AI Systems）作为 ML 威胁建模的参考框架，它提供了超过 100 种已知 ML 攻击技术的分类和防御建议。",
            warning: "威胁建模最常见的错误是只关注外部攻击者而忽视内部威胁。数据科学家拥有对训练数据的完全访问权限，需要建立最小权限原则和操作审计。"
        },
        {
            title: "2. 对抗攻击与防御",
            body: `对抗攻击是机器学习领域最独特的安全威胁之一。攻击者通过对输入数据施加人类无法察觉的微小扰动，就能让模型产生完全错误的预测。FGSM（Fast Gradient Sign Method）是最经典的白盒攻击方法，它利用模型的梯度信息生成对抗样本；PGD（Projected Gradient Descent）则通过迭代扰动实现更强的攻击效果；在无梯度信息的黑盒场景下，基于查询的攻击方法也能通过有限次 API 调用实现模型窃取和对抗样本生成。防御方面，对抗训练是目前最有效的方法，它在训练过程中主动注入对抗样本，让模型学会鲁棒决策。其他防御策略包括输入预处理（如 JPEG 压缩、随机噪声注入来破坏对抗扰动）、集成防御（组合多种检测器）和认证鲁棒性（通过数学证明保证在特定扰动范围内模型输出不变）。需要强调的是，对抗防御是一个军备竞赛，没有银弹。最佳实践是多层防御：输入层做异常检测、模型层做对抗训练、部署层做监控和速率限制。`,
            code: [
                {
                    lang: "python",
                    code: `import torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\n\ndef fgsm_attack(model, data, target, epsilon=0.03):\n    """FGSM 对抗攻击 - 生成对抗样本"""\n    data.requires_grad = True\n    output = model(data)\n    loss = F.cross_entropy(output, target)\n    model.zero_grad()\n    loss.backward()\n    data_grad = data.grad.data.sign()\n    adversarial_data = data + epsilon * data_grad\n    adversarial_data = torch.clamp(adversarial_data, 0, 1)\n    return adversarial_data\n\n\ndef adversarial_training(model, train_loader, optimizer, epochs=10, epsilon=0.03):\n    """对抗训练 - 提升模型鲁棒性"""\n    model.train()\n    for epoch in range(epochs):\n        for batch_data, batch_target in train_loader:\n            # 正常训练\n            optimizer.zero_grad()\n            output = model(batch_data)\n            normal_loss = F.cross_entropy(output, batch_target)\n\n            # 对抗训练\n            adv_data = fgsm_attack(model, batch_data, batch_target, epsilon)\n            adv_output = model(adv_data)\n            adv_loss = F.cross_entropy(adv_output, batch_target)\n\n            # 混合损失\n            total_loss = 0.5 * normal_loss + 0.5 * adv_loss\n            total_loss.backward()\n            optimizer.step()`
                },
                {
                    lang: "python",
                    code: `import numpy as np\nfrom scipy.ndimage import gaussian_filter\n\n\nclass AdversarialDetector:\n    """多层对抗样本检测器"""\n\n    def __init__(self, sensitivity_threshold=0.15, smooth_sigma=1.0):\n        self.threshold = sensitivity_threshold\n        self.sigma = smooth_sigma\n\n    def detect(self, model, input_tensor, original_pred=None):\n        """检测输入是否为对抗样本"""\n        # 方法 1: 平滑一致性检测\n        if original_pred is None:\n            original_pred = model.predict(input_tensor)\n\n        smoothed = gaussian_filter(\n            input_tensor.numpy(), sigma=self.sigma\n        )\n        smoothed_pred = model.predict(\n            torch.from_numpy(smoothed)\n        )\n        smooth_confidence = (\n            np.mean(original_pred != smoothed_pred)\n        )\n\n        # 方法 2: 输入空间异常检测\n        input_norm = np.linalg.norm(input_tensor.numpy())\n        is_anomalous = input_norm > self.threshold\n\n        # 综合判定\n        is_adversarial = smooth_confidence > 0.3 or is_anomalous\n        return {\n            "is_adversarial": is_adversarial,\n            "smooth_disagreement": float(smooth_confidence),\n            "input_norm": float(input_norm)\n        }\n\n\n# 使用示例\ndetector = AdversarialDetector()\nresult = detector.detect(model, suspicious_input)\nif result["is_adversarial"]:\n    print("Warning: Adversarial input detected!")\n    print(f"Confidence: {result['smooth_disagreement']:.3f}")`
                }
            ],
            table: {
                headers: ["攻击方法", "知识要求", "攻击强度", "计算成本", "适用场景"],
                rows: [
                    ["FGSM", "白盒（梯度）", "中等", "低", "快速评估模型鲁棒性"],
                    ["PGD", "白盒（梯度）", "高", "中", "最标准的白盒攻击"],
                    ["C&W 攻击", "白盒（梯度）", "极高", "高", "绕过大多数防御"],
                    ["黑盒查询攻击", "仅需 API 访问", "中等", "高", "真实渗透测试"],
                    ["迁移攻击", "替代模型", "中等", "中", "跨模型泛化评估"]
                ]
            },
            mermaid: `graph LR
    A[原始输入] --> B{对抗攻击?}
    B -->|FGSM| C[梯度符号扰动]
    B -->|PGD| D[迭代投影扰动]
    B -->|黑盒| E[查询优化扰动]
    C --> F[对抗样本]
    D --> F
    E --> F
    F --> G{防御层}
    G -->|对抗训练| H[鲁棒模型]
    G -->|输入预处理| I[消毒输入]
    G -->|检测器| J[拒绝可疑输入]`,
            tip: "在训练时使用 AutoAttack 作为评估基准，它是一个集成攻击框架，能同时使用多种攻击方法评估模型的鲁棒性，比单一攻击方法更可靠。",
            warning: "梯度掩蔽（Gradient Masking）不是真正的防御。某些方法通过隐藏梯度信息让攻击看似失败，但实际上模型仍然脆弱。务必用迁移攻击验证防御的真实性。"
        },
        {
            title: "3. 数据隐私保护：差分隐私与联邦学习",
            body: `数据隐私是 MLOps 安全的核心议题。差分隐私通过在训练过程中注入经过数学证明的噪声，保证无法从模型输出中推断出任何单个训练样本的信息。其核心参数 epsilon 控制隐私预算，epsilon 越小隐私保护越强但模型性能下降越多。Opacus 是 PyTorch 生态中最成熟的差分隐私训练库，它通过修改梯度裁剪和噪声注入机制，以极小的代码改动实现 DP-SGD。联邦学习则采取了另一条路径：模型在数据本地进行训练，只有模型更新（梯度）被聚合到中央服务器，原始数据始终不离开本地设备。这特别适合医疗、金融等数据高度敏感的场景。TF-Federated 是 Google 开源的联邦学习框架，支持多种聚合策略（FedAvg、FedProx）和隐私增强技术。在实际应用中，差分隐私和联邦学习可以结合使用：联邦学习确保数据不出域，差分隐私确保上传的梯度不泄露个体信息。但需要注意，这两种技术都会带来性能开销，需要在隐私保护和模型精度之间找到平衡点。`,
            code: [
                {
                    lang: "python",
                    code: `import torch\nfrom opacus import PrivacyEngine\nfrom opacus.validators import ModuleValidator\n\n\ndef train_with_differential_privacy(\n    model, train_loader, optimizer, criterion,\n    device, epochs=10, max_grad_norm=1.0,\n    noise_multiplier=0.5, sample_rate=0.04,\n    delta=1e-5\n):\n    """使用差分隐私训练模型"""\n    # 修复不支持 DP 的模块\n    model = ModuleValidator.fix(model)\n    model = model.to(device)\n\n    # 附加隐私引擎\n    privacy_engine = PrivacyEngine()\n    model, optimizer, train_loader = privacy_engine.make_private(\n        module=model,\n        optimizer=optimizer,\n        data_loader=train_loader,\n        noise_multiplier=noise_multiplier,\n        max_grad_norm=max_grad_norm,\n    )\n\n    for epoch in range(epochs):\n        model.train()\n        for inputs, targets in train_loader:\n            inputs, targets = inputs.to(device), targets.to(device)\n            optimizer.zero_grad()\n            outputs = model(inputs)\n            loss = criterion(outputs, targets)\n            loss.backward()\n            optimizer.step()\n\n        # 获取当前隐私预算\n        epsilon = privacy_engine.get_epsilon(delta)\n        print(f"Epoch {epoch+1}, Epsilon: {epsilon:.2f}")\n\n    return model, privacy_engine`
                },
                {
                    lang: "python",
                    code: `import tensorflow_federated as tff\nimport tensorflow as tf\n\n\ndef create_federated_learning_process():\n    """创建联邦学习训练流程"""\n    # 定义客户端模型\n    def model_fn():\n        keras_model = tf.keras.Sequential([\n            tf.keras.layers.Dense(64, activation="relu"),\n            tf.keras.layers.Dropout(0.2),\n            tf.keras.layers.Dense(10, activation="softmax")\n        ])\n        return tff.learning.models.from_keras_model(\n            keras_model,\n            input_spec=tf.TensorSpec(shape=[None, 784], dtype=tf.float32),\n            loss=tf.keras.losses.SparseCategoricalCrossentropy(),\n            metrics=[tf.keras.metrics.SparseCategoricalAccuracy()]\n        )\n\n    # 创建联邦平均算法\n    iterative_process = tff.learning.algorithms.build_weighted_fed_avg(\n        model_fn,\n        server_optimizer=tf.keras.optimizers.SGD(learning_rate=1.0),\n        # 启用差分隐私梯度保护\n        differential_privacy=tff.learning.dp_aggregator(\n            noise_multiplier=0.5,\n            clients_per_round=50,\n            clipping_norm=1.0\n        )\n    )\n    return iterative_process\n\n\n# 模拟多客户端数据\nfederated_data = {\n    "client_0": [("x0", "y0"), ("x1", "y1")],\n    "client_1": [("x2", "y2"), ("x3", "y3")],\n    "client_2": [("x4", "y4"), ("x5", "y5")],\n}`
                }
            ],
            table: {
                headers: ["隐私技术", "数据位置", "隐私保证", "性能影响", "适用场景"],
                rows: [
                    ["差分隐私（DP）", "集中式训练", "严格的数学证明", "精度下降 1-5%", "所有场景"],
                    ["联邦学习（FL）", "数据不出域", "梯度级保护", "通信开销大", "多机构协作"],
                    ["DP + FL 结合", "数据不出域 + 噪声梯度", "最强保护", "精度下降 3-10%", "高敏感场景"],
                    ["安全多方计算", "分布式加密计算", "密码学保证", "计算开销极大", "金融场景"],
                    ["同态加密", "密文计算", "密码学保证", "计算慢 100-1000x", "特定运算"]
                ]
            },
            mermaid: `graph TD
    A[客户端 1 数据] -->|本地训练| B[梯度 1]
    C[客户端 2 数据] -->|本地训练| D[梯度 2]
    E[客户端 N 数据] -->|本地训练| F[梯度 N]
    B -->|添加 DP 噪声| G[安全梯度 1]
    D -->|添加 DP 噪声| H[安全梯度 2]
    F -->|添加 DP 噪声| I[安全梯度 N]
    G --> J[安全聚合服务器]
    H --> J
    I --> J
    J -->|全局模型更新| K[下发更新]
    K --> A
    K --> C
    K --> E`,
            tip: "差分隐私的 epsilon 参数选择没有统一标准。对于推荐系统等对精度要求不极端敏感的场景，epsilon 设为 1-3 是合理的起点。",
            warning: "联邦学习不能单独保证隐私安全。研究表明，通过梯度反演攻击可以从共享的梯度中重构出原始训练数据。必须结合差分隐私使用。"
        },
        {
            title: "4. 模型审计与追踪",
            body: `模型审计是 MLOps 安全治理的基石，它确保每个上线模型都可以追溯到其训练数据、代码版本、超参数配置和评估结果。完整的审计链包括四个维度：数据谱系记录训练数据的来源、版本、预处理步骤和数据质量报告；代码追踪记录模型训练所使用的代码版本、依赖库和构建环境；实验审计记录所有实验的参数组合、评估指标和选择依据；决策审计记录模型上线的审批流程、负责人和时间戳。在监管要求严格的行业（金融、医疗），模型审计不是可选项而是强制要求。MLflow 的 Lineage 功能和 Kubeflow 的 Metadata Store 提供了原生的审计追踪能力。此外，DVC 的数据版本追踪与 Git 的代码版本追踪可以组合使用，形成端到端的可追溯链。审计系统的设计原则是不可变性（audit trail 一旦写入不可修改）和完整性（记录所有关键操作），建议将审计日志写入 WORM（Write Once Read Many）存储介质。`,
            code: [
                {
                    lang: "python",
                    code: `import mlflow\nimport hashlib\nimport json\nfrom datetime import datetime\n\n\nclass ModelAuditTrail:\n    """模型审计追踪器"""\n\n    def __init__(self, experiment_name, registry_name):\n        self.experiment_name = experiment_name\n        self.registry_name = registry_name\n        mlflow.set_experiment(experiment_name)\n\n    def log_full_audit(self, model, metrics, params,\n                       data_version, code_commit):\n        """记录完整的模型审计信息"""\n        audit_data = {\n            "timestamp": datetime.utcnow().isoformat(),\n            "data_version": data_version,\n            "code_commit": code_commit,\n            "environment": {\n                "python_version": "3.11.0",\n                "framework": "pytorch-2.1.0",\n                "hardware": "NVIDIA A100"\n            },\n            "approver": "reviewer@company.com",\n            "approval_date": "2026-04-12"\n        }\n\n        with mlflow.start_run() as run:\n            # 记录参数\n            mlflow.log_params(params)\n            # 记录指标\n            mlflow.log_metrics(metrics)\n            # 记录数据版本\n            mlflow.log_param("training_data_version", data_version)\n            mlflow.log_param("code_commit_hash", code_commit)\n            # 记录审计元数据\n            mlflow.log_dict(audit_data, "audit_trail.json")\n            # 注册模型\n            mlflow.register_model(\n                model_uri=f"runs:/{run.info.run_id}/model",\n                name=self.registry_name\n            )\n            return run.info.run_id\n\n\n# 使用示例\nauditor = ModelAuditTrail(\n    experiment_name="fraud_detection",\n    registry_name="fraud_model_v3"\n)\nrun_id = auditor.log_full_audit(\n    model=my_model,\n    metrics={"auc": 0.95, "f1": 0.89},\n    params={"lr": 0.001, "epochs": 50},\n    data_version="v2.3.1",\n    code_commit="abc123def"\n)`
                },
                {
                    lang: "yaml",
                    code: `# model-audit-policy.yaml\n# 模型审计策略配置\n\naudit_policy:\n  required_artifacts:\n    - training_data_manifest:  # 数据清单\n        - source_url\n        - data_hash_sha256\n        - preprocessing_steps\n        - data_quality_report\n    - model_card:  # 模型卡片\n        - intended_use\n        - limitations\n        - ethical_considerations\n        - performance_metrics\n    - code_snapshot:  # 代码快照\n        - git_commit_hash\n        - docker_image_tag\n        - dependency_versions\n    - evaluation_report:  # 评估报告\n        - test_set_metrics\n        - fairness_analysis\n        - bias_audit\n        - robustness_test\n\n  approval_workflow:\n    stages:\n      - name: "数据审查"\n        approver_role: "data_engineer_lead"\n        required_checks:\n          - data_quality_pass\n          - bias_screening\n      - name: "模型审查"\n        approver_role: "ml_engineer_lead"\n        required_checks:\n          - performance_threshold\n          - adversarial_robustness\n      - name: "合规审查"\n        approver_role: "compliance_officer"\n        required_checks:\n          - gdpr_compliance\n          - privacy_impact_assessment\n      - name: "上线审批"\n        approver_role: "mlops_director"\n        required_checks:\n          - all_previous_stages_passed\n          - rollback_plan_verified`
                }
            ],
            table: {
                headers: ["审计维度", "记录内容", "存储方式", "保留期限", "监管要求"],
                rows: [
                    ["数据谱系", "来源、版本、质量", "元数据库 + DVC", "永久", "GDPR 第 30 条"],
                    ["代码版本", "commit、依赖、构建", "Git + 容器注册表", "永久", "SOX 合规"],
                    ["实验记录", "参数、指标、artifact", "MLflow Server", "3 年", "FDA 21 CFR Part 11"],
                    ["审批流程", "审批人、时间、意见", "不可变审计日志", "永久", "欧盟 AI Act"],
                    ["运行监控", "性能漂移、异常", "时序数据库", "1 年", "行业监管"]
                ]
            },
            mermaid: `graph TD
    A[数据采集] -->|记录来源| B[数据谱系]
    C[代码开发] -->|Git commit| D[代码版本]
    B --> E[模型训练]
    D --> E
    E -->|参数 + 指标| F[实验记录]
    E -->|生成模型| G[模型注册表]
    F --> H[审批流程]
    G --> H
    H -->|通过| I[生产部署]
    H -->|拒绝| J[返回修改]
    I -->|监控数据| K[运行审计]
    K --> L[不可变审计日志]
    F -.-> L
    H -.-> L`,
            tip: "为每个模型创建 Model Card，记录其预期用途、局限性、训练数据特征和已知偏差。这不仅是审计要求，也是团队沟通的有效工具。",
            warning: "审计日志的可变性是致命缺陷。一旦审计记录可以被修改，整个信任链就崩溃了。务必使用 WORM 存储或区块链技术确保审计日志的不可篡改性。"
        },
        {
            title: "5. 合规框架：GDPR 与 HIPAA 的 ML 实践",
            body: `**GDPR**（欧盟通用数据保护条例）和 HIPAA（美国健康保险可移植性和责任法案）是目前对 ML 系统影响最大的两部数据保护法规。**GDPR** 的自动化决策条款（第 22 条）赋予用户拒绝纯自动化决策的权利，并要求数据控制者提供决策的可解释性。这意味着在欧盟部署的任何 ML 模型，如果用于个人信用评估、招聘筛选或保险定价等场景，都必须提供人类可理解的决策依据。HIPAA 则对医疗健康数据的收集、存储和处理设置了严格要求，涉及 PHI（受保护健康信息）的 ML 系统必须实施访问控制、审计日志、加密传输和最小必要原则。在 ML 场景下，合规的关键挑战包括：训练数据中的个人信息识别和脱敏、模型输出是否泄露训练数据（成员推理攻击）、自动化决策的可解释性要求、以及跨境数据传输的限制。实践中，建立 Data Protection Impact Assessment（DPIA）流程是应对 GDPR 要求的有效方法，在引入新 ML 系统前系统性地评估隐私风险。`,
            code: [
                {
                    lang: "python",
                    code: `from presidio_analyzer import AnalyzerEngine\nfrom presidio_anonymizer import AnonymizerEngine\n\n\nclass GDPRComplianceProcessor:\n    """GDPR 合规数据处理器"""\n\n    def __init__(self):\n        self.analyzer = AnalyzerEngine()\n        self.anonymizer = AnonymizerEngine()\n\n    def scan_and_anonymize(self, text: str) -> dict:\n        """扫描并匿名化处理文本数据"""\n        # 检测 PII（个人可识别信息）\n        analysis_results = self.analyzer.analyze(\n            text=text,\n            language="zh",\n            entities=["PHONE_NUMBER", "EMAIL_ADDRESS",\n                      "ID_CARD", "CREDIT_CARD",\n                      "LOCATION", "PERSON"]\n        )\n\n        # 匿名化处理\n        anonymized = self.anonymizer.anonymize(\n            text=text,\n            analyzer_results=analysis_results,\n            operators={\n                "PHONE_NUMBER": {"type": "mask", "masking_char": "*",\n                                 "chars_to_mask": 8},\n                "EMAIL_ADDRESS": {"type": "replace",\n                                  "new_value": "[EMAIL_REDACTED]"},\n                "ID_CARD": {"type": "hash", "hash_type": "sha256"},\n                "PERSON": {"type": "replace",\n                          "new_value": "[PERSON_ANONYMIZED]"},\n            }\n        )\n\n        return {\n            "original_length": len(text),\n            "pii_entities_found": len(analysis_results),\n            "anonymized_text": anonymized.text,\n            "compliance_status": "pass" if len(analysis_results) == 0 else "anonymized"\n        }\n\n\nprocessor = GDPRComplianceProcessor()\nresult = processor.scan_and_anonymize(\n    "用户张三的电话是 138-0000-1234，邮箱 test@example.com"\n)\nprint(f"Found {result['pii_entities_found']} PII entities")`
                },
                {
                    lang: "python",
                    code: `from dataclasses import dataclass\nfrom typing import List, Optional\nfrom enum import Enum\n\n\nclass ComplianceStandard(Enum):\n    GDPR = "GDPR"  # 欧盟通用数据保护条例\n    HIPAA = "HIPAA"  # 美国医疗健康数据保护法\n    CCPA = "CCPA"  # 加州消费者隐私法\n    AI_ACT = "EU AI Act"  # 欧盟人工智能法案\n\n\nclass DataSubject(Enum):\n    HEALTH_DATA = "健康数据"\n    FINANCIAL_DATA = "金融数据"\n    BIOMETRIC_DATA = "生物识别数据"\n    MINOR_DATA = "未成年人数据"\n\n\n@dataclass\nclass ComplianceChecklist:\n    standard: ComplianceStandard\n    data_subjects: List[DataSubject]\n    checks: dict\n\n\ndef get_hipaa_checklist() -> ComplianceChecklist:\n    """获取 HIPAA 合规检查清单"""\n    return ComplianceChecklist(\n        standard=ComplianceStandard.HIPAA,\n        data_subjects=[DataSubject.HEALTH_DATA],\n        checks={\n            "access_control": {\n                "requirement": "唯一用户标识 + 自动注销",\n                "status": "pending",\n                "evidence": ""\n            },\n            "audit_controls": {\n                "requirement": "记录所有 PHI 访问操作",\n                "status": "pending",\n                "evidence": ""\n            },\n            "encryption_at_rest": {\n                "requirement": "静态数据 AES-256 加密",\n                "status": "pending",\n                "evidence": ""\n            },\n            "encryption_in_transit": {\n                "requirement": "传输中 TLS 1.2+",\n                "status": "pending",\n                "evidence": ""\n            },\n            "breach_notification": {\n                "requirement": "60 天内通知受影响个体",\n                "status": "pending",\n                "evidence": ""\n            },\n            "minimum_necessary": {\n                "requirement": "仅访问完成任务所需的最小数据",\n                "status": "pending",\n                "evidence": ""\n            }\n        }\n    )\n\nchecklist = get_hipaa_checklist()\nprint(f"Standard: {checklist.standard.value}")\nprint(f"Total checks: {len(checklist.checks)}")`
                }
            ],
            table: {
                headers: ["合规要求", "GDPR", "HIPAA", "EU AI Act", "ML 系统影响"],
                rows: [
                    ["数据最小化", "要求", "要求", "要求", "仅收集必要训练数据"],
                    ["可解释权", "要求（第 22 条）", "不直接要求", "高风险系统强制", "选择可解释模型或后验解释"],
                    ["数据删除权", "要求（被遗忘权）", "有限要求", "不直接要求", "支持模型遗忘训练"],
                    ["影响评估", "DPIA 要求", "安全风险评估", "高风险系统合规评估", "新增评估流程"],
                    ["跨境传输", "充分性决定/SCC", "BAA 协议", "限制向第三国转移", "数据本地化部署"],
                    ["违规通知", "72 小时内", "60 天内", "按严重程度", "建立事件响应流程"]
                ]
            },
            mermaid: `graph TD
    A[ML 系统上线前] --> B{数据类型判定}
    B -->|个人数据| C[GDPR 合规检查]
    B -->|医疗数据| D[HIPAA 合规检查]
    B -->|高风险 AI| E[EU AI Act 合规]
    C --> F[隐私影响评估 DPIA]
    D --> G[安全风险评估]
    E --> H[技术文档 + 合规评估]
    F --> I[法律审查]
    G --> I
    H --> I
    I -->|通过| J[部署生产]
    I -->|不通过| K[整改]
    K --> A
    J -->|持续监控| L[合规审计]
    L -->|法规变更| M[重新评估]`,
            tip: "GDPR 的数据删除权在 ML 场景下尤为棘手。传统数据库删除记录很简单，但 ML 模型已经学习了这些数据。考虑使用 Machine Unlearning（机器遗忘）技术来实现合规。",
            warning: "不要假设使用了匿名化技术就自动满足 GDPR 要求。研究表明，在大数据集中即使是匿名化的数据也可能通过关联分析重新识别个人。GDPR 下真正的匿名化标准极其严格。"
        },
        {
            title: "6. ML 供应链安全",
            body: `ML 供应链涵盖了从数据收集、特征工程、模型训练、模型注册到部署推理的完整链路，每个环节都可能成为攻击者的切入点。供应链安全的核心挑战在于 ML 项目高度依赖外部组件：预训练模型（如 Hugging Face 上的模型权重）、第三方数据集、开源 ML 库（PyTorch、TensorFlow）、以及容器化的部署环境。2023 年 Hugging Face 上发现了多个包含恶意 pickle 载荷的模型文件，攻击者利用 pickle 反序列化的特性在模型加载时执行任意代码。ML 供应链安全的关键实践包括：对所有外部模型和数据集进行完整性校验（SHA-256 哈希验证），使用安全的模型格式（如 Safetensors 替代 Pickle），建立内部模型注册表作为唯一可信来源，以及实施依赖项漏洞扫描（pip-audit、Safety）和容器镜像扫描（Trivy）。SBOM（Software Bill of Materials）概念也应该扩展到 ML 领域，形成 ML-BOM（Machine Learning Bill of Materials），完整记录模型的训练数据来源、基础模型、依赖库、构建环境等全部组件。`,
            code: [
                {
                    lang: "python",
                    code: `import hashlib\nimport json\nimport os\nfrom pathlib import Path\n\n\nclass ModelSupplyChainVerifier:\n    """ML 供应链完整性验证器"""\n\n    def __init__(self, manifest_path: str):\n        with open(manifest_path) as f:\n            self.manifest = json.load(f)\n\n    def verify_model_file(self, model_path: str) -> dict:\n        """验证模型文件的完整性"""\n        file_hash = self._compute_sha256(model_path)\n        expected = self.manifest.get(\n            os.path.basename(model_path), {}\n        ).get("sha256", "")\n\n        return {\n            "file": model_path,\n            "expected_hash": expected,\n            "actual_hash": file_hash,\n            "integrity_ok": file_hash == expected,\n        }\n\n    def verify_all(self, model_dir: str) -> bool:\n        """验证目录下所有模型文件"""\n        all_ok = True\n        for filename in self.manifest:\n            filepath = os.path.join(model_dir, filename)\n            if not os.path.exists(filepath):\n                print(f"MISSING: {filepath}")\n                all_ok = False\n                continue\n\n            result = self.verify_model_file(filepath)\n            if not result["integrity_ok"]:\n                print(f"FAILED: {filename} hash mismatch!")\n                all_ok = False\n            else:\n                print(f"OK: {filename}")\n\n        return all_ok\n\n    @staticmethod\n    def _compute_sha256(filepath: str) -> str:\n        h = hashlib.sha256()\n        with open(filepath, "rb") as f:\n            for chunk in iter(lambda: f.read(8192), b""):\n                h.update(chunk)\n        return h.hexdigest()\n\n\nverifier = ModelSupplyChainVerifier("models/manifest.json")\nif not verifier.verify_all("models/"):\n    raise RuntimeError("Model supply chain integrity check failed!")`
                },
                {
                    lang: "yaml",
                    code: `# ml-bom.yaml - Machine Learning Bill of Materials\n\nml_bom:\n  model_name: "fraud-detection-v3"\n  version: "3.2.1"\n  created: "2026-04-12T10:00:00Z"\n\n  base_model:\n    name: "xgboost"\n    version: "2.0.3"\n    source: "pypi.org"\n    hash: "sha256:abc123..."\n\n  training_data:\n    - name: "transaction_history"\n      version: "v2.3.1"\n      source: "internal-datalake"\n      hash: "sha256:def456..."\n      license: "proprietary"\n    - name: "fraud_labels"\n      version: "v1.1.0"\n      source: "manual-annotation"\n      hash: "sha256:ghi789..."\n      license: "proprietary"\n\n  dependencies:\n    - "pytorch==2.1.0"\n    - "pandas==2.1.4"\n    - "xgboost==2.0.3"\n    - "mlflow==2.9.0"\n    - "scikit-learn==1.3.2"\n\n  build_environment:\n    base_image: "python:3.11-slim"\n    image_hash: "sha256:jkl012..."\n    platform: "linux/amd64"\n\n  signatures:\n    model_artifact: "sigstore-abc..."\n    container_image: "cosign-xyz..."\n    sbom: "syft-report-v1.2"`
                }
            ],
            table: {
                headers: ["供应链环节", "潜在威胁", "检测工具", "缓解措施", "严重性"],
                rows: [
                    ["模型下载", "恶意 pickle 载荷", "Safetensors 格式", "只使用安全格式", "极高"],
                    ["依赖安装", "依赖混淆攻击", "pip-audit, Safety", "锁定依赖版本", "高"],
                    ["容器镜像", "CVE 漏洞", "Trivy, Grype", "基础镜像最小化", "高"],
                    ["数据集", "数据投毒", "数据验证工具", "数据签名验证", "极高"],
                    ["CI/CD 管道", "构建劫持", "SLSA 框架", "签名构建产物", "高"],
                    ["模型注册表", "未授权篡改", "Cosign 签名", "Sigstore 验证", "极高"]
                ]
            },
            mermaid: `graph TD
    A[外部模型仓库] -->|完整性校验| B[模型扫描器]
    C[第三方数据集] -->|数据签名| B
    D[开源依赖] -->|漏洞扫描| E[依赖检查]
    B -->|通过| F[内部注册表]
    B -->|失败| G[隔离区]
    E -->|通过| F
    E -->|失败| G
    F -->|签名验证| H[CI 构建]
    H -->|SBOM 生成| I[部署包]
    I -->|Cosign 签名| J[生产部署]
    G -.->|告警| K[安全团队]`,
            tip: "全面转向使用 Safetensors 格式存储和分发模型权重。它不依赖 pickle 反序列化，从根本上杜绝了模型加载时的代码执行风险。Hugging Face 已默认支持。",
            warning: "pip install 的依赖混淆攻击在 ML 项目中尤为危险。攻击者可以在公共 PyPI 上注册与内部包同名的恶意包。务必配置 --trusted-host 并使用内部 PyPI 镜像。"
        },
        {
            title: "7. 实战：模型安全扫描工作流",
            body: `将安全集成到 ML 流水线中是 MLOps 安全的最终落地方式。一个完整的模型安全扫描工作流应该在模型的整个生命周期中持续运行：在训练前扫描训练数据的质量问题和隐私泄露风险，在训练过程中监控异常模式（如过拟合可能暗示数据泄露），在模型注册前进行对抗鲁棒性测试和公平性评估，在部署前验证依赖安全和容器安全，在运行中持续监控性能漂移和安全事件。自动化是实现安全扫描可持续性的关键，安全扫描应该作为 CI/CD 流水线的强制关卡（gating），任何安全检查失败都会阻止模型推进到下一阶段。OWASP ML Security Verification Standard 和 MITRE ATLAS 提供了系统化的安全验证清单。实践中，建议使用安全扫描矩阵：不同风险级别的模型对应不同深度的扫描策略，内部低风险工具模型执行基础扫描，面向客户的模型执行全面扫描，涉及个人数据的模型还需要额外的隐私合规扫描。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass\nfrom enum import Enum\nfrom typing import List, Callable\n\n\nclass ScanResult(Enum):\n    PASS = "通过"\n    WARN = "警告"\n    FAIL = "失败"\n    SKIP = "跳过"\n\n\n@dataclass\nclass SecurityScan:\n    name: str\n    result: ScanResult\n    details: str\n    duration_ms: float\n\n\nclass ModelSecurityScanner:\n    """模型安全扫描器 - 集成到 CI/CD 流水线"""\n\n    def __init__(self, risk_level: str = "high"):\n        self.risk_level = risk_level\n        self.scans: List[SecurityScan] = []\n\n    def run_pipeline(self, model, data) -> bool:\n        """执行完整的安全扫描流水线"""\n        pipeline = [\n            ("对抗鲁棒性扫描", self._adversarial_scan),\n            ("成员推理扫描", self._membership_inference_scan),\n            ("公平性审计", self._fairness_audit),\n            ("隐私泄露检测", self._privacy_leak_scan),\n            ("依赖安全检查", self._dependency_scan),\n            ("模型签名验证", self._signature_verify),\n        ]\n\n        all_passed = True\n        for name, scan_fn in pipeline:\n            result = scan_fn(model, data)\n            self.scans.append(result)\n            if result.result == ScanResult.FAIL:\n                all_passed = False\n                break\n\n        return all_passed\n\n    def _adversarial_scan(self, model, data) -> SecurityScan:\n        """对抗鲁棒性扫描"""\n        import time\n        start = time.time()\n        robustness = self._compute_robustness(model, data)\n        duration = (time.time() - start) * 1000\n        if robustness > 0.8:\n            return SecurityScan("对抗鲁棒性", ScanResult.PASS,\n                                f"鲁棒性得分: {robustness:.2f}", duration)\n        elif robustness > 0.6:\n            return SecurityScan("对抗鲁棒性", ScanResult.WARN,\n                                f"鲁棒性偏低: {robustness:.2f}", duration)\n        else:\n            return SecurityScan("对抗鲁棒性", ScanResult.FAIL,\n                                f"鲁棒性不足: {robustness:.2f}", duration)\n\n    def _membership_inference_scan(self, model, data) -> SecurityScan:\n        """成员推理攻击风险扫描（简化实现）"""\n        return SecurityScan("成员推理", ScanResult.PASS,\n                            "置信度方差在安全范围内", 120.0)\n\n    def _fairness_audit(self, model, data) -> SecurityScan:\n        """公平性审计"""\n        return SecurityScan("公平性", ScanResult.PASS,\n                            "各子群体性能差异 < 5%", 340.0)\n\n    def _privacy_leak_scan(self, model, data) -> SecurityScan:\n        """隐私泄露检测"""\n        return SecurityScan("隐私泄露", ScanResult.PASS,\n                            "未检测到训练数据泄露", 200.0)\n\n    def _dependency_scan(self, model, data) -> SecurityScan:\n        """依赖安全检查"""\n        return SecurityScan("依赖安全", ScanResult.PASS,\n                            "所有依赖版本安全", 50.0)\n\n    def _signature_verify(self, model, data) -> SecurityScan:\n        """模型签名验证"""\n        return SecurityScan("签名验证", ScanResult.PASS,\n                            "模型签名有效", 30.0)\n\n    def _compute_robustness(self, model, data):\n        return 0.85  # 简化实现`
                },
                {
                    lang: "yaml",
                    code: `# .github/workflows/model-security-scan.yaml\n# 模型安全扫描 CI/CD 流水线\n\nname: "Model Security Scan"\n\non:\n  push:\n    paths:\n      - "models/"\n      - "training/"\n  pull_request:\n    branches: [main]\n\njobs:\n  security-scan:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n\n      - name: "Setup Python"\n        uses: actions/setup-python@v5\n        with:\n          python-version: "3.11"\n\n      - name: "Scan dependencies"\n        run: |\n          pip install pip-audit\n          pip-audit -r requirements.txt\n\n      - name: "Scan container image"\n        uses: aquasecurity/trivy-action@master\n        with:\n          image-ref: "myregistry/ml-model:latest"\n          format: "table"\n          exit-code: "1"\n\n      - name: "Adversarial robustness test"\n        run: |\n          python scripts/security/robustness_test.py \\\n            --model-path models/latest.pkl \\\n            --attack-methods "fgsm,pgd" \\\n            --threshold 0.7\n\n      - name: "Privacy leak detection"\n        run: |\n          python scripts/security/privacy_scan.py \\\n            --model models/latest.pkl \\\n            --method membership_inference\n\n      - name: "Generate security report"\n        if: always()\n        run: |\n          python scripts/security/report_generator.py \\\n            --output reports/security-scan-$(date +%Y%m%d).md\n\n      - name: "Upload scan results"\n        if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: security-scan-results\n          path: reports/`
                }
            ],
            table: {
                headers: ["扫描类型", "触发时机", "执行时长", "失败处理", "阻塞部署"],
                rows: [
                    ["依赖安全扫描", "每次 PR", "1-2 分钟", "阻止合并", "是"],
                    ["容器镜像扫描", "每次构建", "2-5 分钟", "阻止推送", "是"],
                    ["对抗鲁棒性测试", "模型变更时", "10-30 分钟", "标记警告", "视风险等级"],
                    ["隐私泄露检测", "模型注册前", "15-60 分钟", "阻止注册", "是"],
                    ["公平性审计", "模型注册前", "5-15 分钟", "标记警告", "否"],
                    ["签名验证", "部署前", "< 1 分钟", "阻止部署", "是"]
                ]
            },
            mermaid: `graph TD
    A[代码提交] --> B[依赖扫描]
    B -->|通过| C[构建容器镜像]
    C --> D[镜像漏洞扫描]
    D -->|通过| E[训练模型]
    E --> F[对抗鲁棒性测试]
    F -->|通过| G[隐私泄露检测]
    G -->|通过| H[公平性审计]
    H --> I[模型注册]
    I --> J[签名验证]
    J -->|通过| K[部署到生产]
    K --> L[运行时安全监控]
    L -->|异常| M[自动回滚]
    B -.->|失败| N[PR 被阻止]
    D -.->|失败| N
    F -.->|失败| O[安全警告]
    G -.->|失败| P[注册被阻止]`,
            tip: "将安全扫描结果集成到 Pull Request 的评论中，让开发人员在代码审查阶段就能看到安全状态。GitHub Actions 的 check_run API 可以实现这一点。",
            warning: "安全扫描不是万能的。自动化扫描只能检测已知模式，对零日攻击和新型对抗方法无能为力。定期组织红队演练，人工模拟攻击者视角来发现自动化工具遗漏的漏洞。"
        },
    ],
};
