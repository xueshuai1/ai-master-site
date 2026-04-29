import { Article } from '../knowledge';

export const article: Article = {
    id: "mlops-001",
    title: "ML 流水线设计与自动化",
    category: "mlops",
    tags: ["MLOps", "流水线", "自动化"],
    summary: "从数据处理到模型部署，掌握 MLOps 流水线的最佳实践",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. MLOps 概述与成熟度模型",
            body: `MLOps 是 Machine Learning Operations 的缩写，它将 DevOps 的理念引入机器学习领域，旨在实现 ML 模型的自动化交付和持续运维。与传统软件开发不同，ML 系统不仅包含代码，还涉及数据、模型和基础设施三个维度，这使得 MLOps 的复杂度远超传统 DevOps。Google 提出的 MLOps 成熟度模型分为四个等级：Level 0 是手动流程，数据科学家手动训练和部署模型；Level 1 实现了 ML 流水线的自动化，训练过程可复现；Level 2 进一步实现了 CI/CD 流水线自动化，代码变更自动触发训练和部署；Level 3 达到最高级别，实现了持续训练，系统能够自动感知数据漂移并触发模型重训练。大多数企业处于 Level 0 到 Level 1 之间，要实现从手动到自动化的跨越，需要建立标准化的流水线框架、引入实验追踪工具和模型注册表。MLOps 的核心价值在于缩短模型从实验到生产的时间，同时保证模型质量的一致性和可追溯性。`,
            code: [
                {
                    lang: "python",
                    code: `from enum import Enum\n\nclass MLOpsLevel(Enum):\n    LEVEL_0 = "手动流程"\n    LEVEL_1 = "ML 流水线自动化"\n    LEVEL_2 = "CI/CD 流水线自动化"\n    LEVEL_3 = "持续训练"\n\n\ndef assess_mlops_level(\n    has_pipeline: bool,\n    has_cicd: bool,\n    has_continuous_training: bool\n) -> MLOpsLevel:\n    """评估当前 ML 项目的 MLOps 成熟度等级"""\n    if has_continuous_training and has_cicd and has_pipeline:\n        return MLOpsLevel.LEVEL_3\n    elif has_cicd and has_pipeline:\n        return MLOpsLevel.LEVEL_2\n    elif has_pipeline:\n        return MLOpsLevel.LEVEL_1\n    else:\n        return MLOpsLevel.LEVEL_0\n\nlevel = assess_mlops_level(\n    has_pipeline=True,\n    has_cicd=True,\n    has_continuous_training=False\n)\nprint(f"Current level: {level.value}")`
                },
                {
                    lang: "yaml",
                    code: `# mlops-maturity-checklist.yaml\nlevel_0:\n  - 手动数据探索\n  - Jupyter Notebook 训练\n  - 手工导出模型文件\nlevel_1:\n  - 自动化数据预处理\n  - 可复现的训练脚本\n  - 实验参数记录\nlevel_2:\n  - Git 触发训练流水线\n  - 自动化模型评估\n  - 一键部署到生产\nlevel_3:\n  - 数据漂移自动检测\n  - 定时或事件触发重训练\n  - 模型自动回滚机制`
                }
            ],
            table: {
                headers: ["成熟度等级", "核心能力", "自动化程度", "典型工具"],
                rows: [
                    ["Level 0", "手动训练与部署", "无", "Jupyter, sklearn"],
                    ["Level 1", "ML 流水线", "训练自动化", "MLflow, DVC"],
                    ["Level 2", "CI/CD 流水线", "代码到部署全自动化", "GitHub Actions, BentoML"],
                    ["Level 3", "持续训练", "端到端全自动", "Kubeflow, TFX"]
                ]
            },
            mermaid: `graph TD
    A[Level 0 手动流程] --> B[Level 1 ML流水线]
    B --> C[Level 2 CICD流水线]
    C --> D[Level 3 持续训练]
    B -.->|"数据版本控制"| E[DVC]
    C -.->|"实验追踪"| F[MLflow]
    D -.->|"编排引擎"| G[Kubeflow]`,
            tip: "从 Level 0 跃迁到 Level 1 的第一步是将 Notebook 中的代码重构为可复用的 Python 脚本，并建立参数化配置文件。",
            warning: "不要一上来就追求 Level 3 的完整架构。多数团队应该先从 Level 1 开始，先解决可复现性问题，再逐步自动化。"
        },
        {
            title: "2. 数据版本控制（DVC）",
            body: `在 ML 项目中，数据是决定模型性能的关键因素，但数据往往体积庞大、更新频繁且来源多样。传统的 Git 只能追踪代码变更，无法有效管理 GB 甚至 TB 级别的数据文件。DVC（Data Version Control）正是为了解决这一问题而设计的工具。它的核心理念是将数据文件的实际内容存储在远程存储后端（如 S3、GCS 或本地磁盘），而在 Git 仓库中只保存轻量级的元数据文件（.dvc 文件）。这样既保留了 Git 的版本控制能力，又避免了将大数据文件提交到代码仓库。DVC 支持数据版本追踪、数据流水线定义和实验复现三大核心功能。通过 dvc.yaml 文件，你可以定义从原始数据到特征工程到模型训练的完整数据处理流水线。DVC 的 dvc repro 命令能够智能地只重新运行发生变更的步骤，大幅节省计算资源。此外，DVC 与 MLflow 等实验追踪工具天然兼容，可以组合使用形成完整的 ML 工程化方案。在团队协作场景中，DVC 确保了所有成员使用相同版本的数据进行实验，消除了因为数据不一致导致的实验结果差异。`,
            code: [
                {
                    lang: "bash",
                    code: `# 初始化 DVC 并连接远程存储\ndvc init\ndvc remote add -d myremote s3://my-bucket/dvc-store\n\n# 追踪大型数据集\ndvc add data/raw/training_data.parquet\ndvc add data/processed/features.pkl\n\n# 提交元数据到 Git（不是数据本身）\ngit add data/raw/training_data.parquet.dvc\ngit add data/processed/features.pkl.dvc\ngit commit -m "Track training data v2.1"\n\n# 推送数据到远程存储\ndvc push\n\n# 在另一台机器上拉取数据\ndvc pull`
                },
                {
                    lang: "yaml",
                    code: `# dvc.yaml - 定义数据处理流水线\nstages:\n  data_ingestion:\n    cmd: python scripts/ingest.py --config configs/ingest.yaml\n    deps:\n      - scripts/ingest.py\n      - configs/ingest.yaml\n    outs:\n      - data/raw/dataset.csv\n\n  feature_engineering:\n    cmd: python scripts/features.py\n    deps:\n      - scripts/features.py\n      - data/raw/dataset.csv\n    outs:\n      - data/processed/features.pkl\n\n  train_model:\n    cmd: python scripts/train.py --epochs 50\n    deps:\n      - scripts/train.py\n      - data/processed/features.pkl\n    outs:\n      - models/model_v1.pkl\n    metrics:\n      - metrics/eval.json:`
                }
            ],
            table: {
                headers: ["DVC 核心概念", "说明", "对应 Git 概念", "存储位置"],
                rows: [
                    [".dvc 文件", "数据元数据与校验和", "Git blob", "Git 仓库"],
                    ["远程存储", "实际数据文件", "无对应", "S3/GCS/SSH"],
                    ["dvc.yaml", "流水线定义", "无对应", "Git 仓库"],
                    ["dvc.lock", "执行快照", "无对应", "Git 仓库"],
                    ["dvc repro", "增量重运行", "无对应", "命令行"]
                ]
            },
            mermaid: `graph LR
    A[原始数据] -->|dvc add| B[.dvc 元数据文件]
    B -->|git commit| C[Git 仓库]
    A -->|dvc push| D[S3 远程存储]
    C -->|git clone| E[新环境]
    D -->|dvc pull| E
    E -->|dvc repro| F[自动重建产物]`,
            tip: "为数据集使用语义化的版本标签，例如 dvc tag v1.2.0，这样在回滚实验时可以精确还原数据状态。",
            warning: "DVC 不会自动删除远程存储中不再被引用的数据文件。定期运行 dvc gc 来清理孤儿文件，但操作前务必备份。"
        },
        {
            title: "3. 实验追踪（MLflow/W&B）",
            body: `机器学习实验的本质是一个高维的搜索过程：你需要尝试不同的超参数组合、模型架构和特征工程策略，然后从中选出最优方案。没有实验追踪工具的情况下，数据科学家通常用电子表格或笔记本来记录每次实验的参数和结果，这种方式在实验次数增多后会迅速失控。MLflow 和 Weights & Biases（W&B）是目前最主流的两个实验追踪解决方案。MLflow 是开源且自托管友好的方案，它通过 Tracking Server 记录每次运行的参数、指标、模型文件和代码版本。W&B 则是云端优先的平台，除了基础的实验追踪外，还提供了实时的可视化面板、团队协作功能和自动化的超参数搜索（Sweep）。两者的核心 API 设计都很简洁，只需几行代码就能集成到现有的训练脚本中。实验追踪的关键实践包括：为每次实验记录完整的参数集合、保存关键指标的日志、存储最佳模型的 artifact、以及记录代码的 Git commit hash 以实现完全复现。当团队规模扩大时，实验追踪平台还承担着知识共享的功能，让团队成员可以查看、比较和复用彼此的实验结果。`,
            code: [
                {
                    lang: "python",
                    code: `import mlflow\nimport mlflow.sklearn\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score\n\nmlflow.set_tracking_uri("http://localhost:5000")\nmlflow.set_experiment("customer_churn_prediction")\n\nwith mlflow.start_run(run_name="rf_baseline") as run:\n    # 记录参数\n    params = {"n_estimators": 100, "max_depth": 10, "random_state": 42}\n    mlflow.log_params(params)\n\n    # 训练模型\n    model = RandomForestClassifier(**params)\n    model.fit(X_train, y_train)\n\n    # 记录指标\n    accuracy = accuracy_score(y_test, model.predict(X_test))\n    mlflow.log_metric("accuracy", accuracy)\n    mlflow.log_metric("f1_score", f1_score(y_test, model.predict(X_test), average="weighted"))\n\n    # 保存模型 artifact\n    mlflow.sklearn.log_model(model, "model")\n    print(f"Run ID: {run.info.run_id}")`
                },
                {
                    lang: "python",
                    code: `import wandb\nfrom transformers import Trainer, TrainingArguments\n\n# 初始化 W&B 实验\nwandb.init(project="sentiment-finetune", config={\n    "learning_rate": 2e-5,\n    "num_train_epochs": 3,\n    "batch_size": 32,\n    "model_name": "bert-base-chinese"\n})\n\ntraining_args = TrainingArguments(\n    output_dir="./results",\n    num_train_epochs=3,\n    per_device_train_batch_size=32,\n    report_to="wandb"  # 自动上报到 W&B\n)\n\ntrainer = Trainer(\n    model=model,\n    args=training_args,\n    train_dataset=train_dataset,\n    eval_dataset=val_dataset\n)\ntrainer.train()\n\n# 记录自定义指标\nwandb.log({"final_loss": trainer.state.log_history[-1]["loss"]})\nwandb.finish()`
                }
            ],
            table: {
                headers: ["功能", "MLflow", "W&B", "说明"],
                rows: [
                    ["实验追踪", "支持", "支持", "记录参数、指标、artifact"],
                    ["可视化", "基础 UI", "高级仪表盘", "W&B 可视化更丰富"],
                    ["超参搜索", "不直接支持", "Sweep", "W&B 内置贝叶斯搜索"],
                    ["部署", "MLflow Models", "W&B Artifacts", "MLflow 原生支持 serving"],
                    ["成本", "免费自托管", "免费额度 + 付费", "W&B 云端有免费 tier"],
                    ["团队协作", "需自建 Server", "原生支持", "W&B 协作功能更完善"]
                ]
            },
            mermaid: `graph TD
    A[训练脚本] -->|log_params| B[实验追踪系统]
    A -->|log_metrics| B
    A -->|log_model| B
    B --> C[参数数据库]
    B --> D[指标时间序列]
    B --> E[模型 Artifacts]
    C --> F[UI 对比面板]
    D --> F
    E --> F
    F --> G{选择最佳模型}
    G -->|注册| H[模型注册表]`,
            tip: "在 MLflow 中使用嵌套运行（nested runs）来组织实验：外层运行代表实验组，内层运行代表单次超参数尝试。",
            warning: "不要在实验追踪中记录敏感信息，如 API Key 或数据库密码。MLflow 的参数存储默认是明文可读的。"
        },
        {
            title: "4. 模型注册表",
            body: `模型注册表是 MLOps 架构中的核心组件，它充当了从实验环境到生产环境的桥梁。在实验追踪阶段，你可能会产生数百个模型变体，但只有少数几个适合部署到生产环境。模型注册表提供了一套标准化的流程来管理模型的生命周期：从实验阶段的开发中状态，到验证阶段的暂存状态，再到生产环境的已部署状态，最后到不再使用的废弃状态。MLflow Model Registry 是最常用的模型注册表实现之一，它支持模型版本管理、阶段转换、权限控制和模型描述文档。注册表中的每个模型都有一个唯一的名称和版本号，你可以为任意版本添加描述、标签和元数据。更重要的是，注册表支持模型签名的概念，即定义模型的输入输出 schema，这样下游系统可以自动验证请求格式是否正确。在团队规模扩大时，模型注册表还解决了模型归属和责任的问题：谁训练了这个模型、什么时候部署的、当前表现如何，所有信息都在注册表中一目了然。注册表与 CI/CD 流水线结合后，可以实现模型的自动化推进：当新版本模型通过所有质量检查后，自动从 Staging 阶段推进到 Production 阶段。`,
            code: [
                {
                    lang: "python",
                    code: `import mlflow\nfrom mlflow.tracking import MlflowClient\n\nclient = MlflowClient()\n\n# 将实验运行的模型注册到注册表\nresult = mlflow.register_model(\n    model_uri="runs:/<run_id>/model",\n    name="churn_prediction_model"\n)\nprint(f"Registered version: {result.version}")\n\n# 为模型版本添加描述\nclient.update_model_version(\n    name="churn_prediction_model",\n    version=result.version,\n    description="Random Forest baseline - accuracy 0.89"\n)\n\n# 推进到 Staging 阶段\nclient.transition_model_version_stage(\n    name="churn_prediction_model",\n    version=result.version,\n    stage="Staging"\n)`
                },
                {
                    lang: "python",
                    code: `import mlflow.pyfunc\n\n# 从注册表加载生产阶段的最佳模型\nmodel_name = "churn_prediction_model"\nmodel_uri = f"models:/{model_name}/Production"\n\nloaded_model = mlflow.pyfunc.load_model(model_uri)\n\n# 获取模型签名以验证输入格式\nmodel_info = mlflow.models.get_model_info(model_uri)\nprint(f"Model signature: {model_info.signature}")\n\n# 批量预测\nimport pandas as pd\ntest_data = pd.DataFrame({\n    "age": [35, 42, 28],\n    "tenure": [24, 6, 12],\n    "monthly_charges": [85.0, 95.5, 70.0]\n})\n\npredictions = loaded_model.predict(test_data)\nprint(f"Predictions: {predictions}")`
                }
            ],
            table: {
                headers: ["模型阶段", "含义", "触发转换", "自动操作"],
                rows: [
                    ["None", "刚注册，未验证", "手动注册", "无"],
                    ["Staging", "通过初步验证", "自动化测试通过", "运行集成测试"],
                    ["Production", "已部署到生产", "性能指标达标", "流量切换"],
                    ["Archived", "已下线退役", "新版本替代", "保留 artifact"]
                ]
            },
            mermaid: `graph LR
    A[实验模型] -->|register| B[Model Registry]
    B --> C{版本阶段}
    C -->|通过测试| D[Staging]
    D -->|性能达标| E[Production]
    E -->|新版本上线| F[Archived]
    D -->|测试失败| G[回退到 None]
    E -->|性能下降| H[告警 + 回滚]`,
            tip: "为每个注册模型维护一份 Model Card，记录训练数据、评估指标、已知限制和公平性分析，这是 AI 治理的重要实践。",
            warning: "模型注册表的权限控制容易被忽视。生产阶段的模型应该设置为只读，只有经过审批的流水线才能执行阶段转换。"
        },
        {
            title: "5. CI/CD for ML",
            body: `传统软件工程的 CI/CD 主要关注代码的构建、测试和部署，但 ML 系统的 CI/CD 流水线需要额外处理数据和模型这两个关键维度。ML 系统的持续集成（CI）不仅包括代码的单元测试和集成测试，还需要数据验证测试和模型质量测试。持续交付（CD）则意味着模型通过所有测试后，自动部署到生产环境或注册表中。在 ML 的 CI/CD 中，有几个关键测试类型：代码测试确保训练脚本和推理服务的逻辑正确；数据测试验证训练数据的完整性和分布；模型测试检查模型的性能指标是否达到预期基线。GitHub Actions、GitLab CI 和 Jenkins 等 CI/CD 工具都可以用来编排 ML 流水线。与传统的 CI/CD 不同，ML 流水线通常需要更长的执行时间（训练可能需要数小时），并且消耗大量计算资源（GPU）。因此，建议在 CI 中运行轻量级的冒烟测试和快速验证，而将完整的训练和评估放在专门的训练集群上执行。持续部署阶段还需要考虑 A/B 测试、金丝雀发布和自动回滚等策略，以确保新模型上线不会对生产服务造成负面影响。`,
            code: [
                {
                    lang: "yaml",
                    code: `# .github/workflows/ml-pipeline.yaml\nname: ML CI/CD Pipeline\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  test-code:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Run unit tests\n        run: pytest tests/ -v\n\n  validate-data:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Validate data schema\n        run: python scripts/validate_data.py\n\n  train-and-evaluate:\n    needs: [test-code, validate-data]\n    runs-on: gpu-runner\n    steps:\n      - uses: actions/checkout@v4\n      - name: Train model\n        run: python scripts/train.py --config configs/prod.yaml\n      - name: Evaluate model\n        run: python scripts/evaluate.py --threshold 0.85\n\n  deploy:\n    needs: [train-and-evaluate]\n    if: github.ref == 'refs/heads/main'\n    runs-on: ubuntu-latest\n    steps:\n      - name: Deploy to production\n        run: python scripts/deploy.py --env production`
                },
                {
                    lang: "python",
                    code: `import pytest\nimport mlflow\nimport numpy as np\n\ndef test_model_performance_threshold():\n    """测试模型性能是否达到最低要求"""\n    model = mlflow.sklearn.load_model("models:/churn_model/Production")\n    predictions = model.predict(X_test)\n    accuracy = accuracy_score(y_test, predictions)\n    assert accuracy >= 0.85, f"Accuracy {accuracy} below threshold 0.85"\n\ndef test_no_data_leakage():\n    """确保训练集和测试集没有重叠"""\n    train_ids = set(X_train.index)\n    test_ids = set(X_test.index)\n    overlap = train_ids & test_ids\n    assert len(overlap) == 0, f"Found {len(overlap)} overlapping samples"\n\ndef test_feature_distribution():\n    """检查特征分布是否合理"""\n    assert X_train["age"].between(0, 120).all()\n    assert X_train["monthly_charges"].min() >= 0\n    assert not X_train.isnull().any().any(), "Found null values in features"`
                }
            ],
            table: {
                headers: ["CI/CD 阶段", "测试类型", "触发条件", "失败处理"],
                rows: [
                    ["代码构建", "单元测试、lint", "代码 push/PR", "阻止合并"],
                    ["数据验证", "Schema 检查、漂移检测", "数据文件变更", "告警 + 阻止"],
                    ["模型训练", "训练成功、无 NaN", "CI 通过后", "重试 3 次后告警"],
                    ["模型评估", "指标阈值检查", "训练完成后", "阻止部署"],
                    ["生产部署", "集成测试、延迟测试", "评估通过后", "自动回滚"]
                ]
            },
            mermaid: `graph TD
    A[代码 Push] --> B[代码测试]
    B -->|通过| C[数据验证]
    C -->|通过| D[训练 + 评估]
    D -->|指标达标| E[部署到 Staging]
    E -->|A/B 测试通过| F[部署到 Production]
    B -->|失败| X[阻止合并]
    C -->|失败| X
    D -->|指标不达标| X
    F -->|线上异常| G[自动回滚]`,
            tip: "在 CI 中使用缓存（如 GitHub Actions 的 cache）来加速依赖安装和数据下载，可以显著缩短流水线执行时间。",
            warning: "不要在 CI 中训练完整的深度学习模型，这会消耗大量时间和资源。CI 中的训练应该使用小规模数据集和少量 epoch 做冒烟测试。"
        },
        {
            title: "6. 持续训练触发器",
            body: `持续训练（Continuous Training）是 MLOps 成熟度模型的最高级别，它意味着模型的重训练过程可以自动触发，无需人工干预。这与传统的定期手动训练有本质区别：持续训练系统能够实时感知环境变化并做出响应。触发持续训练的常见机制有三种：基于时间的调度（如每天凌晨自动训练）、基于数据的触发（当检测到数据漂移超过阈值时启动训练）和基于性能的触发（当模型在生产环境的性能下降到阈值以下时触发）。数据漂移检测是持续训练的核心能力之一，常用的检测方法包括 KS 检验（用于数值特征）、卡方检验（用于类别特征）和 PSI（Population Stability Index）用于整体分布比较。持续训练还需要解决一个关键问题：自动化不代表无监督。训练完成后，新模型必须经过自动化的评估流水线，与当前生产模型进行对比。只有当新模型在关键指标上显著优于旧模型时，才会被自动部署。此外，持续训练系统应该支持手动干预的能力，比如在业务发生重大变化时，数据科学家可以手动调整训练参数或暂停自动训练。`,
            code: [
                {
                    lang: "python",
                    code: `from evidently.report import Report\nfrom evidently.metric_preset import DataDriftPreset\nimport pandas as pd\n\n# 计算数据漂移报告\nreference_data = pd.read_csv("data/reference_monthly.csv")\ncurrent_data = pd.read_csv("data/current_monthly.csv")\n\ndrift_report = Report(metrics=[DataDriftPreset()])\ndrift_report.run(reference_data=reference_data,\n                 current_data=current_data)\n\n# 提取漂移检测结果\nreport_dict = drift_report.as_dict()\ndrifted_features = []\nfor feature, result in report_dict["metrics"][0]["result"]["drift_by_columns"].items():\n    if result["drift_detected"]:\n        drifted_features.append(feature)\n\nif len(drifted_features) > 3:\n    print(f"DRIFT ALERT: {len(drifted_features)} features drifted")\n    # 触发持续训练\n    trigger_continuous_training()`
                },
                {
                    lang: "python",
                    code: `import schedule\nimport time\nimport logging\nfrom datetime import datetime\n\nlogging.basicConfig(level=logging.INFO)\n\ndef continuous_training_pipeline():\n    """持续训练主函数"""\n    logging.info(f"Starting CT pipeline at {datetime.now()}")\n\n    # 1. 检查是否需要训练\n    if not should_trigger_training():\n        logging.info("No training trigger needed")\n        return\n\n    # 2. 拉取最新数据\n    data = fetch_latest_training_data()\n\n    # 3. 训练新模型\n    new_model = train_model(data)\n\n    # 4. 与生产模型对比\n    champion = load_production_model()\n    if evaluate_and_compare(new_model, champion):\n        # 5. 注册并部署\n        register_and_deploy(new_model)\n        logging.info("New model deployed successfully")\n    else:\n        logging.warning("New model did not outperform champion")\n\n# 每天凌晨 2 点执行\nschedule.every().day.at("02:00").do(continuous_training_pipeline)\n\nwhile True:\n    schedule.run_pending()\n    time.sleep(60)`
                }
            ],
            table: {
                headers: ["触发机制", "检测内容", "响应时间", "适用场景"],
                rows: [
                    ["时间调度", "固定周期", "按计划", "数据稳定更新"],
                    ["数据漂移", "特征分布变化", "近实时", "业务环境多变"],
                    ["性能下降", "线上指标恶化", "近实时", "高价值预测场景"],
                    ["手动触发", "人工判断", "即时", "重大业务变更"]
                ]
            },
            mermaid: `graph TD
    A[生产环境] -->|收集数据| B[数据监控]
    B --> C{漂移检测}
    C -->|漂移超标| D[触发训练]
    C -->|正常| B
    A -->|性能监控| E{性能检查}
    E -->|低于阈值| D
    E -->|正常| A
    D --> F[训练新模型]
    F --> G{评估对比}
    G -->|更优| H[自动部署]
    G -->|不优| I[记录并保留]`,
            tip: "为持续训练设置合理的冷却期（cooldown period），避免在短时间内因数据波动触发频繁训练，浪费计算资源。",
            warning: "持续训练不等于持续部署。训练完成的新模型必须经过严格的评估流程，否则可能将性能更差的模型部署到生产环境。"
        },
        {
            title: "7. Kubeflow Pipelines 实战",
            body: `Kubeflow Pipelines 是 Google 开源的 ML 工作流编排平台，运行在 Kubernetes 之上，是构建企业级 MLOps 流水线的强大工具。它通过声明式的 YAML 或 Python DSL 来定义流水线，每个步骤作为一个容器化组件运行在 Kubernetes Pod 中。这种架构天然支持弹性伸缩、资源隔离和故障恢复。Kubeflow Pipelines 的核心概念包括：Component（组件）是最小执行单元，通常是一个容器化的 Python 脚本；Pipeline（流水线）是多个组件的有向无环图（DAG），定义了执行顺序和依赖关系；Run（运行）是流水线的一次具体执行，可以追踪每次运行的输入、输出和状态。在实战中，我们通常使用 kfp 的 Python DSL 来编写流水线定义，这样可以利用 Python 的编程能力来动态生成流水线结构。Kubeflow 提供了丰富的内置组件，涵盖了数据下载、模型训练、模型评估和模型部署等常见场景。此外，Kubeflow 还支持条件分支、并行执行和参数化配置等高级特性，使得构建复杂的 ML 流水线变得更加灵活和高效。对于已经有 Kubernetes 基础设施的团队来说，Kubeflow Pipelines 是构建 MLOps Level 2 和 Level 3 的理想选择。`,
            code: [
                {
                    lang: "python",
                    code: `import kfp\nfrom kfp import dsl\nfrom kfp.dsl import component\n\n@component(\n    packages_to_install=["pandas", "scikit-learn"],\n    base_image="python:3.11"\n)\ndef preprocess_data(input_path: str, output_path: dsl.OutputPath("Dataset")):\n    import pandas as pd\n    from sklearn.model_selection import train_test_split\n\n    df = pd.read_csv(input_path)\n    df = df.dropna()\n    train_df, test_df = train_test_split(df, test_size=0.2)\n    train_df.to_csv(f"{output_path}_train.csv", index=False)\n    test_df.to_csv(f"{output_path}_test.csv", index=False)\n\n@component(\n    packages_to_install=["scikit-learn", "joblib"],\n    base_image="python:3.11"\n)\ndef train_model(\n    train_path: dsl.InputPath("Dataset"),\n    model_path: dsl.OutputPath("Model"),\n    n_estimators: int = 100\n):\n    import pandas as pd\n    from sklearn.ensemble import RandomForestClassifier\n    import joblib\n\n    train_df = pd.read_csv(train_path)\n    X = train_df.drop("target", axis=1)\n    y = train_df["target"]\n    model = RandomForestClassifier(n_estimators=n_estimators)\n    model.fit(X, y)\n    joblib.dump(model, model_path)\n\n@dsl.pipeline(name="ml-training-pipeline", description="End-to-end ML pipeline")\ndef ml_pipeline(data_path: str, n_estimators: int = 100):\n    preprocess_task = preprocess_data(input_path=data_path)\n    train_model(\n        train_path=preprocess_task.outputs["output_path"],\n        model_path="model.pkl",\n        n_estimators=n_estimators\n    )`
                },
                {
                    lang: "python",
                    code: `import kfp\n\n# 连接到 Kubeflow Pipelines 服务器\nclient = kfp.Client(host="http://kubeflow.example.com")\n\n# 编译流水线定义\nfrom kfp import compiler\ncompiler.Compiler().compile(\n    pipeline_func=ml_pipeline,\n    package_path="ml_pipeline.yaml"\n)\n\n# 创建实验并启动运行\nexperiment = client.create_experiment(name="production-runs")\n\nrun = client.run_pipeline(\n    experiment_id=experiment.id,\n    job_name="churn-model-v2",\n    pipeline_package_path="ml_pipeline.yaml",\n    params={\n        "data_path": "gs://my-bucket/data/churn_data.csv",\n        "n_estimators": 200\n    }\n)\nprint(f"Run ID: {run.run_id}")\n\n# 查看运行状态\nrun_detail = client.get_run(run.run_id)\nprint(f"Status: {run_detail.state}")`
                }
            ],
            table: {
                headers: ["Kubeflow 概念", "作用", "类比", "关键 API"],
                rows: [
                    ["Component", "最小执行单元（容器）", "函数", "@component 装饰器"],
                    ["Pipeline", "组件编排（DAG）", "工作流定义", "@dsl.pipeline"],
                    ["Run", "一次具体执行", "进程实例", "client.run_pipeline()"],
                    ["Experiment", "运行的分组", "项目文件夹", "client.create_experiment()"],
                    ["Artifact", "输入/输出数据", "文件/对象", "InputPath/OutputPath"]
                ]
            },
            mermaid: `graph TD
    A[数据源] -->|下载| B[数据预处理组件]
    B -->|训练集| C[模型训练组件]
    B -->|测试集| D[模型评估组件]
    C -->|模型文件| D
    D -->|指标| E{达标?}
    E -->|是| F[模型注册组件]
    E -->|否| G[告警组件]
    F --> H[部署到生产]
    G --> I[通知数据科学家]`,
            tip: "在 Kubeflow 中使用缓存机制（execution_caching），相同的输入和代码不会重复执行组件，可以显著节省开发调试时间。",
            warning: "Kubeflow Pipelines 的安装和维护成本较高，需要 Kubernetes 集群管理经验。对于小团队，建议先用 MLflow Pipelines 或 GitHub Actions 起步。"
        },
    ],
};
