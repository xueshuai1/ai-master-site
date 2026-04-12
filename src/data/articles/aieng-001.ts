import { Article } from '../knowledge';

export const article: Article = {
    id: "aieng-001",
    title: "ML 流水线设计",
    category: "aieng",
    tags: ["ML流水线", "MLOps", "工程化"],
    summary: "从数据处理到模型部署，掌握 ML 流水线的最佳实践",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. ML 流水线概述",
            body: `ML 流水线是将机器学习项目从实验环境推向生产环境的核心基础设施。一条完整的 ML 流水线涵盖了数据收集、预处理、特征工程、模型训练、评估、部署和监控等环节。传统的数据科学项目往往以 Jupyter Notebook 为中心，这种方式在探索阶段非常高效，但一旦进入生产环境就会暴露出可复现性差、版本混乱、手动操作过多等问题。ML 流水线通过将这些步骤模块化、自动化和可追溯化，解决了上述痛点。一个设计良好的流水线应当具备以下特征：每个步骤都是幂等的，即重复执行不会产生不同结果；所有步骤都有明确的输入输出契约；流水线本身可以被版本控制；当某个环节失败时能够自动重试或告警。在工程实践中，我们通常将流水线分为离线训练流水线和在线推理流水线两种。离线流水线负责模型的重训练和评估，通常按天或按周运行；在线流水线则负责实时推理服务，要求低延迟和高可用性。理解这两种流水线的差异和联系，是构建完整 ML 系统的基础。`,
            code: [
                {
                    lang: "python",
                    code: `from abc import ABC, abstractmethod\nfrom typing import Any, Dict\n\nclass PipelineStep(ABC):\n    """ML 流水线的抽象基类"""\n\n    @abstractmethod\n    def execute(self, input_data: Any) -> Dict[str, Any]:\n        """执行当前步骤，返回结果字典"""\n        pass\n\n    @abstractmethod\n    def validate_input(self, input_data: Any) -> bool:\n        """验证输入数据是否符合要求"""\n        pass\n\n\nclass DataIngestionStep(PipelineStep):\n    """数据摄入步骤"""\n\n    def __init__(self, source: str):\n        self.source = source\n\n    def execute(self, input_data: Any) -> Dict[str, Any]:\n        import pandas as pd\n        df = pd.read_csv(self.source)\n        return {"data": df, "shape": df.shape, "source": self.source}\n\n    def validate_input(self, input_data: Any) -> bool:\n        return isinstance(self.source, str) and len(self.source) > 0`
                },
                {
                    lang: "python",
                    code: `from typing import List\nimport logging\n\nlogging.basicConfig(level=logging.INFO)\nlogger = logging.getLogger(__name__)\n\n\nclass Pipeline:\n    """编排多个步骤形成完整流水线"""\n\n    def __init__(self, name: str):\n        self.name = name\n        self.steps: List[PipelineStep] = []\n\n    def add_step(self, step: PipelineStep) -> "Pipeline":\n        self.steps.append(step)\n        return self\n\n    def run(self, initial_data: Any = None) -> Dict[str, Any]:\n        result = {"pipeline": self.name, "step_results": {}}\n        current_data = initial_data\n\n        for i, step in enumerate(self.steps):\n            logger.info(f"Executing step {i}: {step.__class__.__name__}")\n            if not step.validate_input(current_data):\n                raise ValueError(f"Step {i} input validation failed")\n            current_data = step.execute(current_data)\n            result["step_results"][i] = current_data\n\n        return result`
                }
            ],
            table: {
                headers: ["流水线阶段", "输入", "输出", "常见工具"],
                rows: [
                    ["数据收集", "原始数据源", "Raw Dataset", "Kafka, Airflow"],
                    ["数据验证", "Raw Dataset", "Clean Dataset", "Great Expectations"],
                    ["特征工程", "Clean Dataset", "Feature Matrix", "Featureform, Feast"],
                    ["模型训练", "Feature Matrix", "Trained Model", "PyTorch, sklearn"],
                    ["模型评估", "Trained Model", "Eval Metrics", "MLflow, W&B"],
                    ["模型部署", "Eval Metrics", "Serving Endpoint", "BentoML, Seldon"]
                ]
            },
            mermaid: `graph LR\n    A[数据源] --> B[数据收集]\n    B --> C[数据验证]\n    C --> D[特征工程]\n    D --> E[模型训练]\n    E --> F[模型评估]\n    F --> G{是否达标?}\n    G -->|"Yes"| H[模型部署]\n    G -->|"No"| D`,
            tip: "设计流水线时，先定义清晰的输入输出契约，再实现具体逻辑。这样每个步骤都可以独立测试和替换。",
            warning: "不要在流水线步骤中硬编码路径或配置参数，应使用环境变量或配置文件统一管理。"
        },
        {
            title: "2. 数据收集与验证",
            body: `数据是 ML 系统的燃料，数据质量直接决定了模型的性能上限。数据收集阶段需要从各种异构数据源中抽取数据，包括数据库、API、消息队列和文件系统等。收集到的原始数据往往包含缺失值、异常值、重复记录和格式不一致等问题，这些问题如果不经过验证和处理，会在后续环节被放大。数据验证是保证数据质量的关键防线，它通过定义数据契约来约束数据的类型、范围、分布和完整性。Great Expectations 是目前最流行的数据验证框架之一，它允许开发者用声明式的方式编写数据质量断言，并将验证结果可视化和报告化。另一个重要概念是数据漂移检测，即监控生产数据分布与训练数据分布之间的偏差。当漂移超过阈值时，说明模型可能需要重新训练。在实践中，建议为每个数据源建立数据档案，记录其更新频率、数据量和质量指标，以便快速定位问题。数据收集流水线应当支持增量更新，避免每次全量读取造成资源浪费。`,
            code: [
                {
                    lang: "python",
                    code: `import great_expectations as gx\nimport pandas as pd\n\ncontext = gx.get_context()\ndf = pd.read_csv("data/raw/customer_transactions.csv")\nvalidator = context.sources.pandas_default.read_dataframe(df)\n\nvalidator.expect_column_values_to_not_be_null("customer_id")\nvalidator.expect_column_values_to_be_between("amount", min_value=0, max_value=100000)\nvalidator.expect_column_values_to_be_in_set(\n    "status", ["active", "inactive", "pending"]\n)\nvalidator.expect_table_row_count_to_be_between(\n    min_value=1000, max_value=1000000\n)\n\nresults = validator.validate()\nprint(f"Success: {results.success}")`
                },
                {
                    lang: "python",
                    code: `import numpy as np\nfrom scipy import stats\nfrom typing import Tuple\n\n\ndef detect_data_drift(\n    reference: np.ndarray,\n    current: np.ndarray,\n    p_threshold: float = 0.05\n) -> Tuple[bool, float]:\n    """使用 KS 检验检测数值型数据漂移"""\n    statistic, p_value = stats.ks_2samp(reference, current)\n    drift_detected = p_value < p_threshold\n    return drift_detected, p_value\n\n\ndef detect_categorical_drift(\n    reference: np.ndarray,\n    current: np.ndarray,\n    p_threshold: float = 0.05\n) -> Tuple[bool, float]:\n    """使用卡方检验检测分类型数据漂移"""\n    unique_vals = np.unique(np.concatenate([reference, current]))\n    ref_counts = np.array([(reference == v).sum() for v in unique_vals])\n    cur_counts = np.array([(current == v).sum() for v in unique_vals])\n    chi2, p_value = stats.chisquare(cur_counts, f_exp=ref_counts)\n    return p_value < p_threshold, p_value`
                }
            ],
            table: {
                headers: ["数据质量问题", "检测方法", "处理策略", "影响程度"],
                rows: [
                    ["缺失值", "null count", "插值/删除/标记", "高"],
                    ["异常值", "IQR/Z-score", "截断/变换/移除", "高"],
                    ["重复记录", "行哈希去重", "保留最新/合并", "中"],
                    ["类型不一致", "schema 验证", "强制转换/拒绝", "中"],
                    ["数据漂移", "KS 检验/PSI", "触发重训练", "高"],
                    ["标签泄漏", "特征相关性分析", "移除泄漏特征", "极高"]
                ]
            },
            mermaid: `graph TD\n    A[原始数据源] --> B[数据抽取]\n    B --> C[Schema 验证]\n    C --> D{验证通过?}\n    D -->|"No"| E[告警 + 隔离]\n    D -->|"Yes"| F[质量检查]\n    F --> G{质量达标?}\n    G -->|"No"| E\n    G -->|"Yes"| H[漂移检测]\n    H --> I[存储到数据仓库]`,
            tip: "为每个数据源设置数据契约文档，明确字段含义、类型约束和更新频率，这比事后排查数据问题高效得多。",
            warning: "数据验证失败时不要静默跳过，必须阻断流水线并触发告警，否则劣质数据会污染整个训练过程。"
        },
        {
            title: "3. 特征工程流水线",
            body: `特征工程是将原始数据转换为模型可理解的特征表示的过程，它直接决定了模型能够学习到什么信息。在流水线化的特征工程中，我们需要解决三个核心问题：可复现性、一致性和效率。可复现性意味着相同的输入数据在任何时间运行都会产生相同的特征；一致性意味着训练时和推理时的特征计算逻辑完全一致；效率意味着特征计算不会成为流水线的瓶颈。Feast 是一个流行的特征存储方案，它提供了特征注册表、在线存储和离线存储三层架构，使得特征可以在训练和推理之间共享。特征流水线通常包括特征提取、特征变换、特征选择和特征存储四个阶段。在特征变换阶段，常用的操作包括标准化、归一化、分箱、编码和交叉特征等。特征选择则通过统计检验、模型重要性或递归消除等方法筛选出对预测最有价值的特征。良好的特征工程流水线应该是声明式的，即通过配置文件定义特征而非硬编码逻辑。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.pipeline import Pipeline as SklearnPipeline\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.impute import SimpleImputer\n\nnumeric_features = ["age", "income", "balance"]\ncategorical_features = ["gender", "region", "product_type"]\n\nnumeric_transformer = SklearnPipeline(steps=[\n    ("imputer", SimpleImputer(strategy="median")),\n    ("scaler", StandardScaler()),\n])\n\ncategorical_transformer = SklearnPipeline(steps=[\n    ("imputer", SimpleImputer(strategy="most_frequent")),\n    ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),\n])\n\npreprocessor = ColumnTransformer(\n    transformers=[\n        ("num", numeric_transformer, numeric_features),\n        ("cat", categorical_transformer, categorical_features),\n    ]\n)`
                },
                {
                    lang: "yaml",
                    code: `# feature_store.yaml - Feast 特征仓库配置\nproject: customer_churn\nregistry: data/registry.db\nprovider: local\n\nsources:\n  customer_source:\n    type: file\n    path: data/raw/customers.parquet\n    timestamp_field: event_timestamp\n\nfeatures:\n  - name: customer_age_days\n    dtype: INT64\n    description: "客户注册天数"\n    source: customer_source\n  - name: avg_transaction_amount\n    dtype: FLOAT64\n    description: "平均交易金额"\n    source: customer_source\n  - name: login_frequency_30d\n    dtype: INT64\n    description: "近30天登录频次"\n    source: customer_source\n    aggregation: mean\n    window: 30d`
                }
            ],
            table: {
                headers: ["特征类型", "变换方法", "适用场景", "注意事项"],
                rows: [
                    ["数值特征", "标准化/归一化", "距离敏感模型", "注意异常值影响"],
                    ["类别特征", "独热编码/目标编码", "所有模型", "高基数类别慎用独热"],
                    ["时间特征", "时间窗聚合", "时序预测", "注意时间泄漏"],
                    ["文本特征", "TF-IDF/Embedding", "NLP 任务", "维度可能爆炸"],
                    ["交叉特征", "多项式组合", "线性模型增强", "组合爆炸问题"],
                    ["降维特征", "PCA/UMAP", "高维数据", "可解释性降低"]
                ]
            },
            mermaid: `graph LR\n    A[原始数据] --> B[特征提取]\n    B --> C[特征变换]\n    C --> D[特征选择]\n    D --> E[特征存储]\n    E --> F[在线存储 Redis]\n    E --> G[离线存储 Parquet]\n    F --> H[实时推理]\n    G --> I[离线训练]`,
            tip: "使用 Feast 等特征存储可以确保训练和推理使用完全一致的特征计算逻辑，这是防止训练推理偏差的关键手段。",
            warning: "特征工程中严禁使用未来信息，特别是在时间序列场景中，必须确保每个时间点的特征只依赖历史数据。"
        },
        {
            title: "4. 模型训练与验证",
            body: `模型训练是 ML 流水线的核心环节，但训练本身不仅仅是调用 fit 方法那么简单。一个生产级的训练流水线需要考虑超参数搜索、交叉验证、早停机制、检查点保存和实验跟踪等多个方面。超参数搜索可以通过网格搜索、随机搜索或贝叶斯优化来实现，其中 Optuna 是目前最受欢迎的自动超参数优化框架。交叉验证通过将数据划分为多个折来更可靠地评估模型泛化能力，K 折交叉验证是最常用的策略。早停机制通过监控验证集损失来防止过拟合，当验证损失连续若干轮不再下降时停止训练。实验跟踪工具如 MLflow 或 Weights & Biases 可以记录每次训练的参数、指标和模型产物，方便后续对比和复现。在分布式训练场景中，还需要考虑数据并行和模型并行的策略选择。`,
            code: [
                {
                    lang: "python",
                    code: `import optuna\nimport xgboost as xgb\nfrom sklearn.model_selection import cross_val_score\n\n\ndef objective(trial):\n    """Optuna 超参数优化目标函数"""\n    params = {\n        "n_estimators": trial.suggest_int("n_estimators", 100, 1000),\n        "max_depth": trial.suggest_int("max_depth", 3, 12),\n        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),\n        "subsample": trial.suggest_float("subsample", 0.5, 1.0),\n        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),\n        "reg_alpha": trial.suggest_float("reg_alpha", 1e-8, 10.0, log=True),\n        "reg_lambda": trial.suggest_float("reg_lambda", 1e-8, 10.0, log=True),\n    }\n    model = xgb.XGBClassifier(**params, eval_metric="logloss")\n    scores = cross_val_score(model, X_train, y_train, cv=5, scoring="roc_auc")\n    return scores.mean()\n\nstudy = optuna.create_study(direction="maximize")\nstudy.optimize(objective, n_trials=50)`
                },
                {
                    lang: "python",
                    code: `import mlflow\nimport mlflow.sklearn\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import train_test_split\n\nX_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2)\n\nwith mlflow.start_run(run_name="rf_baseline") as run:\n    # 记录参数\n    mlflow.log_param("n_estimators", 200)\n    mlflow.log_param("max_depth", 10)\n    mlflow.log_param("min_samples_split", 5)\n\n    model = RandomForestClassifier(\n        n_estimators=200, max_depth=10, min_samples_split=5\n    )\n    model.fit(X_train, y_train)\n\n    # 记录指标\n    val_score = model.score(X_val, y_val)\n    mlflow.log_metric("val_accuracy", val_score)\n\n    # 保存模型\n    mlflow.sklearn.log_model(model, "model")\n    print(f"Run ID: {run.info.run_id}, Val Accuracy: {val_score:.4f}")`
                }
            ],
            table: {
                headers: ["验证策略", "数据划分", "适用场景", "计算开销"],
                rows: [
                    ["简单划分", "70/15/15", "大数据集", "低"],
                    ["K 折交叉验证", "K 等分", "中小数据集", "中"],
                    ["分层 K 折", "按比例分层", "类别不均衡", "中"],
                    ["时间序列分割", "按时间顺序", "时序数据", "低"],
                    ["留一法", "N-1 训练", "极小数据集", "极高"],
                    ["嵌套交叉验证", "内外双层", "模型选择+评估", "极高"]
                ]
            },
            mermaid: `graph TD\n    A[训练数据] --> B[数据划分]\n    B --> C[K 折交叉验证]\n    C --> D[超参数搜索]\n    D --> E[Optuna 调优]\n    E --> F{找到最优?}\n    F -->|"No"| D\n    F -->|"Yes"| G[最终训练]\n    G --> H[MLflow 记录]\n    H --> I[模型注册]`,
            tip: "使用 Optuna 的 prune 功能可以在训练早期终止表现不佳的 trial，大幅节省计算资源。",
            warning: "超参数搜索时必须在验证集上评估，绝不能使用测试集，否则会导致模型对测试集过拟合。"
        },
        {
            title: "5. 模型评估与选择",
            body: `模型评估是决定哪个模型可以进入生产环境的关键决策环节。选择合适的评估指标需要根据业务场景来定：分类任务常用准确率、精确率、召回率、F1 分数和 AUC-ROC；回归任务常用 MAE、MSE、RMSE 和 R 方。但仅仅看单一指标是不够的，我们需要综合多个维度的评估结果。混淆矩阵提供了更细粒度的分类表现分析，特别是在类别不均衡的场景下。ROC 曲线和 PR 曲线可以帮助我们理解模型在不同阈值下的表现。除了性能指标，还需要考虑模型的可解释性、推理延迟、模型大小和资源消耗等工程指标。模型注册表用于管理不同版本的模型及其元数据，支持模型的生命周期管理，包括从 staging 到 production 的状态迁移。A/B 测试是在线评估模型真实效果的重要手段，通过将流量分配到新旧模型来对比业务指标。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.metrics import (\n    classification_report, confusion_matrix,\n    roc_curve, auc, precision_recall_curve\n)\nimport matplotlib.pyplot as plt\nimport numpy as np\n\n\ndef comprehensive_evaluation(y_true, y_pred, y_prob):\n    """综合模型评估"""\n    report = classification_report(y_true, y_pred, output_dict=True)\n    cm = confusion_matrix(y_true, y_pred)\n    fpr, tpr, _ = roc_curve(y_true, y_prob)\n    roc_auc = auc(fpr, tpr)\n    precision, recall, _ = precision_recall_curve(y_true, y_prob)\n\n    print("=== Classification Report ===")\n    print(classification_report(y_true, y_pred))\n    print(f"ROC AUC: {roc_auc:.4f}")\n    print(f"Confusion Matrix:\n{cm}")\n\n    return {\n        "roc_auc": roc_auc,\n        "macro_f1": report["macro avg"]["f1-score"],\n        "weighted_f1": report["weighted avg"]["f1-score"],\n        "confusion_matrix": cm.tolist(),\n    }`
                },
                {
                    lang: "python",
                    code: `import mlflow\nfrom mlflow.tracking import MlflowClient\n\nclient = MlflowClient()\n\n\ndef promote_best_model(experiment_name: str, metric: str = "val_accuracy"):\n    """从实验中选择最佳模型并提升到 production"""\n    experiment = client.get_experiment_by_name(experiment_name)\n    runs = client.search_runs(\n        experiment_ids=[experiment.experiment_id],\n        order_by=[f"metrics.{metric} DESC"],\n        max_results=10,\n    )\n\n    best_run = runs[0]\n    model_uri = f"runs:/{best_run.info.run_id}/model"\n\n    # 注册模型\n    mv = client.create_registered_model("churn_model")\n    client.create_model_version(\n        name="churn_model",\n        source=model_uri,\n        run_id=best_run.info.run_id,\n    )\n\n    # 提升到 production\n    client.transition_model_version_stage(\n        name="churn_model", version=1, stage="Production"\n    )\n    print(f"Promoted run {best_run.info.run_id} to Production")`
                }
            ],
            table: {
                headers: ["评估指标", "公式", "适用场景", "局限性"],
                rows: [
                    ["准确率", "TP+TN/Total", "类别均衡", "不均衡数据失真"],
                    ["精确率", "TP/TP+FP", "关注误报", "忽略漏报"],
                    ["召回率", "TP/TP+FN", "关注漏报", "忽略误报"],
                    ["F1 分数", "2*P*R/P+R", "综合评估", "未考虑 TN"],
                    ["AUC-ROC", "ROC 曲线下面积", "阈值无关", "极度不均衡时失真"],
                    ["RMSE", "sqrt(MSE)", "回归任务", "对异常值敏感"]
                ]
            },
            mermaid: `graph LR\n    A[候选模型集] --> B[离线评估]\n    B --> C[多指标对比]\n    C --> D{指标达标?}\n    D -->|"No"| E[重新训练]\n    D -->|"Yes"| F[模型注册]\n    F --> G[A/B 测试]\n    G --> H{业务指标提升?}\n    H -->|"Yes"| I[全量发布]\n    H -->|"No"| J[回滚]`,
            tip: "在类别不均衡场景中，优先关注精确率和召回率的平衡，而不是单纯追求准确率。",
            warning: "模型评估必须使用完全独立于训练和调优过程的测试集，否则会给出过于乐观的评估结果。"
        },
        {
            title: "6. CI/CD for ML",
            body: `持续集成和持续部署在 ML 领域有着不同于传统软件工程的新维度。传统 CI/CD 关注代码变更的自动化测试和部署，而 ML 的 CI/CD 还需要处理数据变更和模型变更，这就是所谓的 CT（持续训练）。代码变更触发模型重新训练，数据变更也可能触发模型更新，模型变更则需要经过自动化评估才能部署。ML CI/CD 流水线通常包含三个阶段的 CI：代码验证、数据验证和模型验证。代码验证确保训练代码的语法正确性和单元测试通过；数据验证检查输入数据的质量和分布；模型验证评估新模型相比当前生产模型的性能是否有所提升。在 CD 阶段，通过的模型会被自动部署到 staging 环境，经过进一步的集成测试后推送到 production。自动化测试在 ML CI/CD 中尤为重要，包括单元测试、集成测试、数据测试和模型测试四个层次。`,
            code: [
                {
                    lang: "yaml",
                    code: `# .github/workflows/ml-ci.yml\nname: ML CI/CD Pipeline\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Set up Python\n        uses: actions/setup-python@v5\n        with:\n          python-version: "3.11"\n      - run: pip install -r requirements.txt\n      - run: pytest tests/ -v --cov=src\n\n  data-validation:\n    needs: test\n    runs-on: ubuntu-latest\n    steps:\n      - run: python scripts/validate_data.py\n\n  train-model:\n    needs: data-validation\n    runs-on: ubuntu-latest\n    steps:\n      - run: python scripts/train.py\n      - run: python scripts/evaluate.py\n\n  deploy:\n    needs: train-model\n    if: github.ref == 'refs/heads/main'\n    runs-on: ubuntu-latest\n    steps:\n      - run: python scripts/deploy.py --env production`
                },
                {
                    lang: "python",
                    code: `import pytest\nimport numpy as np\nfrom src.model import load_model, predict\n\ndef test_model_output_shape():\n    """测试模型输出形状是否正确"""\n    model = load_model("models/latest")\n    X_test = np.random.randn(100, 20)\n    preds = predict(model, X_test)\n    assert preds.shape == (100,), f"Expected (100,), got {preds.shape}"\n\n\ndef test_model_performance_regression():\n    """测试模型性能不低于基线"""\n    model = load_model("models/latest")\n    score = evaluate_model(model, "data/test.parquet")\n    baseline = 0.85\n    assert score["roc_auc"] >= baseline, (\n        f"ROC AUC {score['roc_auc']:.4f} < baseline {baseline}"\n    )\n\n\ndef test_prediction_latency():\n    """测试推理延迟是否满足 SLA"""\n    import time\n    model = load_model("models/latest")\n    X = np.random.randn(1, 20)\n    times = []\n    for _ in range(100):\n        start = time.time()\n        predict(model, X)\n        times.append(time.time() - start)\n    p99_latency = np.percentile(times, 99) * 1000\n    assert p99_latency < 50, f"P99 latency {p99_latency:.1f}ms exceeds 50ms SLA"`
                }
            ],
            table: {
                headers: ["测试层级", "测试内容", "触发时机", "失败处理"],
                rows: [
                    ["代码测试", "单元测试/集成测试", "代码提交", "阻止合并"],
                    ["数据测试", "Schema/质量/漂移", "数据更新", "告警+阻断"],
                    ["模型测试", "性能/公平性/鲁棒性", "训练完成", "阻止部署"],
                    ["集成测试", "端到端流水线", "部署前", "回滚"],
                    ["负载测试", "QPS/延迟/资源", "部署前", "扩容/优化"],
                    ["金丝雀发布", "小流量验证", "生产发布", "自动回滚"]
                ]
            },
            mermaid: `graph TD\n    A[代码提交] --> B[代码测试]\n    B --> C{通过?}\n    C -->|"No"| D[修复代码]\n    C -->|"Yes"| E[数据验证]\n    E --> F{通过?}\n    F -->|"No"| G[检查数据]\n    F -->|"Yes"| H[模型训练]\n    H --> I[模型评估]\n    I --> J{优于基线?}\n    J -->|"No"| K[分析原因]\n    J -->|"Yes"| L[自动部署]\n    L --> M[监控告警]`,
            tip: "将模型性能回归测试集成到 CI 中，可以自动拦截性能下降的模型变更，防止劣质模型进入生产环境。",
            warning: "ML 流水线的 CI/CD 比传统软件更复杂，因为除了代码和数据两个维度，模型本身也是一个独立的变更源。"
        },
        {
            title: "7. Kubeflow/Airflow 实战",
            body: `Kubeflow 和 Apache Airflow 是目前最主流的 ML 编排平台，它们各有侧重。Kubeflow 是专门为 Kubernetes 上的机器学习工作流设计的平台，提供了从 Notebooks 到 Pipelines 再到 Serving 的完整工具链。Kubeflow Pipelines 使用 Python SDK 定义流水线，每个组件被打包为容器镜像，天然支持分布式和弹性扩展。Airflow 则是一个通用的工作流编排平台，通过 DAG 定义任务依赖关系，拥有更丰富的运营商生态和调度能力。在实践中，Airflow 常用于编排数据处理和模型训练的整体流程，而 Kubeflow 更适合在 Kubernetes 集群上运行大规模分布式训练任务。两者也可以结合使用：Airflow 负责高层编排和调度，Kubeflow 负责具体的训练执行。无论选择哪个平台，关键原则都是将流水线定义为代码、版本控制所有配置、确保组件的幂等性和可重入性。`,
            code: [
                {
                    lang: "python",
                    code: `import kfp\nfrom kfp import dsl\nfrom kfp.dsl import component\n\n\n@component(\n    packages_to_install=["pandas", "scikit-learn"],\n    base_image="python:3.11-slim",\n)\ndef preprocess_data(input_path: str, output_path: str) -> float:\n    import pandas as pd\n    from sklearn.model_selection import train_test_split\n\n    df = pd.read_csv(input_path)\n    df = df.dropna()\n    train, test = train_test_split(df, test_size=0.2)\n    train.to_csv(output_path, index=False)\n    return len(train)\n\n\n@component(\n    packages_to_install=["xgboost", "joblib"],\n    base_image="python:3.11-slim",\n)\ndef train_model(train_path: str, model_path: str) -> float:\n    import pandas as pd\n    import xgboost as xgb\n    import joblib\n\n    df = pd.read_csv(train_path)\n    X, y = df.drop("target", axis=1), df["target"]\n    model = xgb.XGBClassifier(n_estimators=100, max_depth=5)\n    model.fit(X, y)\n    joblib.dump(model, model_path)\n    return model.score(X, y)\n\n\n@dsl.pipeline(name="ml-training-pipeline")\ndef pipeline(input_csv: str):\n    prep = preprocess_data(input_path=input_csv)\n    train = train_model(train_path=prep.output)`
                },
                {
                    lang: "python",
                    code: `from airflow import DAG\nfrom airflow.operators.python import PythonOperator\nfrom airflow.utils.dates import days_ago\nfrom datetime import timedelta\n\n\ndef extract_data(**kwargs):\n    print("Extracting data from source...")\n    return {"rows": 10000}\n\n\ndef validate_data(**kwargs):\n    ti = kwargs["ti"]\n    rows = ti.xcom_pull(task_ids="extract")["rows"]\n    assert rows > 0, "No data extracted"\n    print(f"Validated {rows} rows")\n\n\ndef train_and_register(**kwargs):\n    print("Training model and registering to MLflow...")\n\n\ndef evaluate_and_deploy(**kwargs):\n    print("Evaluating model and deploying if passed...")\n\n\ndefault_args = {\n    "owner": "ml-team",\n    "retries": 2,\n    "retry_delay": timedelta(minutes=5),\n}\n\ndag = DAG(\n    "daily_model_training",\n    default_args=default_args,\n    description="Daily ML model retraining pipeline",\n    schedule_interval="@daily",\n    start_date=days_ago(1),\n    catchup=False,\n)\n\nextract = PythonOperator(task_id="extract", python_callable=extract_data, dag=dag)\nvalidate = PythonOperator(task_id="validate", python_callable=validate_data, dag=dag)\ntrain = PythonOperator(task_id="train", python_callable=train_and_register, dag=dag)\nevaluate = PythonOperator(task_id="evaluate", python_callable=evaluate_and_deploy, dag=dag)\n\nextract >> validate >> train >> evaluate`
                }
            ],
            table: {
                headers: ["特性", "Kubeflow Pipelines", "Apache Airflow", "Metaflow"],
                rows: [
                    ["编排引擎", "Kubernetes CRD", "DAG Scheduler", "Python SDK"],
                    ["组件形式", "容器镜像", "Operators", "Python 函数"],
                    ["适用场景", "大规模训练", "通用工作流", "数据科学"],
                    ["学习曲线", "较陡", "中等", "平缓"],
                    ["可扩展性", "极高", "高", "中"],
                    ["可视化", "优秀", "优秀", "一般"]
                ]
            },
            mermaid: `graph TD\n    A[数据到达] --> B[Airflow DAG 触发]\n    B --> C[数据抽取]\n    C --> D[数据验证]\n    D --> E[Kubeflow Pipeline]\n    E --> F[特征工程]\n    F --> G[分布式训练]\n    G --> H[模型评估]\n    H --> I{通过?}\n    I -->|"Yes"| J[部署到生产]\n    I -->|"No"| K[通知团队]`,
            tip: "小规模团队可以先从 Airflow 开始，它上手更简单且生态成熟；当需要大规模分布式训练时再考虑 Kubeflow。",
            warning: "Kubeflow 需要完善的 Kubernetes 运维能力支撑，如果没有 K8s 经验，建议从托管服务开始而非自建。"
        },
    ],
};
