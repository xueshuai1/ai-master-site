import { Article } from '../knowledge';

export const article: Article = {
    id: "aieng-008",
    title: "端到端 MLOps 架构设计",
    category: "aieng",
    tags: ["MLOps", "架构设计", "端到端"],
    summary: "从数据收集到模型退役，掌握完整的 MLOps 生命周期管理",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
        {
            title: "1. ML 生命周期概述",
            body: `机器学习项目的生命周期远比传统软件开发复杂。一个完整的 ML 系统不仅仅是一个训练好的模型文件，而是一整套从数据采集、处理、训练、评估、部署到监控的闭环体系。Google 提出的 MLOps 成熟度模型将 ML 工程化分为三个阶段：Level 0（手动流程）、Level 1（ML 管道自动化）、Level 2（CI/CD/CT 全自动化）。大多数团队停留在 Level 0 到 Level 1 之间，意味着他们虽然使用了 Jupyter Notebook 和 MLflow 等工具，但整个流程仍然高度依赖人工干预。端到端 MLOps 的核心目标是将机器学习从 "手工艺品" 转变为 "工业产品"。这要求我们将软件工程的最佳实践（版本控制、持续集成、自动化测试）与机器学习特有的需求（数据版本、实验追踪、模型监控、持续训练）深度融合。MLOps 不是单一工具，而是一种方法论和架构哲学。它承认 ML 系统的三个独特复杂性：数据依赖（模型质量取决于数据质量）、实验性质（训练是探索性过程，结果不确定）、以及环境敏感性（训练和推理环境的微小差异可能导致显著的性能变化）。理解这些特性是设计健壮 MLOps 架构的第一步。`,
            code: [
                {
                    lang: "python",
                    code: `from enum import Enum\nfrom dataclasses import dataclass\nfrom typing import List, Optional\nfrom datetime import datetime\n\n\nclass MLOpsLevel(Enum):\n    LEVEL_0 = "manual_process"      # 手动流程\n    LEVEL_1 = "ml_pipeline"         # 管道自动化\n    LEVEL_2 = "cicd_ct"             # CI/CD/CT 全自动化\n\n\n@dataclass\nclass MLOpsStage:\n    """MLOps 成熟度评估""" \n    name: str\n    description: str\n    capabilities: List[str]\n    level: MLOpsLevel\n    maturity_score: float  # 0.0 - 1.0\n\n\ndef assess_maturity(capabilities: List[str]) -> MLOpsStage:\n    """根据团队能力评估 MLOps 成熟度"""\n    l0_caps = {"manual_training", "notebook_development",\n               "manual_deployment", "basic_monitoring"}\n    l1_caps = {"automated_pipeline", "data_versioning",\n               "experiment_tracking", "model_registry",\n               "automated_testing"}\n    l2_caps = {"continuous_training", "continuous_deployment",\n               "feature_store", "automated_rollback",\n               "drift_detection", "a_b_testing"}\n\n    cap_set = set(capabilities)\n    l0_score = len(cap_set & l0_caps) / len(l0_caps)\n    l1_score = len(cap_set & l1_caps) / len(l1_caps)\n    l2_score = len(cap_set & l2_caps) / len(l2_caps)\n\n    if l2_score > 0.6:\n        return MLOpsStage("CT 阶段", "持续训练+部署",\n                          list(cap_set & l2_caps),\n                          MLOpsLevel.LEVEL_2, l2_score)\n    elif l1_score > 0.5:\n        return MLOpsStage("ML 管道", "自动化训练管道",\n                          list(cap_set & l1_caps),\n                          MLOpsLevel.LEVEL_1, l1_score)\n    else:\n        return MLOpsStage("手动流程", "实验性 ML 开发",\n                          list(cap_set & l0_caps),\n                          MLOpsLevel.LEVEL_0, l0_score)\n\n\nteam_caps = ["notebook_development", "experiment_tracking",\n             "model_registry", "manual_deployment"]\nresult = assess_maturity(team_caps)\nprint(f"Level: {result.level.value}, Score: {result.maturity_score:.2f}")`
                },
                {
                    lang: "python",
                    code: `from dataclasses import dataclass\nfrom typing import Dict, List\nfrom datetime import datetime\n\n\n@dataclass\nclass MLCycleEvent:\n    """ML 生命周期中的事件记录"""\n    event_type: str\n    timestamp: datetime\n    metadata: Dict[str, str]\n    status: str = "completed"\n\n\nclass MLLifecycleTracker:\n    """追踪 ML 系统全生命周期事件"""\n\n    def __init__(self, project_name: str):\n        self.project_name = project_name\n        self.events: List[MLCycleEvent] = []\n        self.phases = [\n            "data_collection", "data_preprocessing",\n            "feature_engineering", "experimentation",\n            "model_training", "model_evaluation",\n            "model_registration", "model_deployment",\n            "monitoring", "model_retirement"\n        ]\n\n    def record(self, event_type: str, **metadata):\n        event = MLCycleEvent(\n            event_type=event_type,\n            timestamp=datetime.now(),\n            metadata={k: str(v) for k, v in metadata.items()}\n        )\n        self.events.append(event)\n        return event\n\n    def get_phase_summary(self) -> Dict[str, int]:\n        """统计各阶段事件数量"""\n        summary = {p: 0 for p in self.phases}\n        for e in self.events:\n            if e.event_type in summary:\n                summary[e.event_type] += 1\n        return summary\n\n    def get_timeline(self) -> List[Dict]:\n        return [\n            {"type": e.event_type, "time": str(e.timestamp),\n             "status": e.status}\n            for e in sorted(self.events, key=lambda x: x.timestamp)\n        ]\n\n\ntracker = MLLifecycleTracker("recommendation_v3")\ntracker.record("data_collection", source="kafka_stream")\ntracker.record("feature_engineering", features=42)\ntracker.record("experimentation", framework="optuna")`
                }
            ],
            table: {
                headers: ["MLOps 级别", "核心特征", "工具需求", "团队规模"],
                rows: [
                    ["Level 0", "手动流程，Notebook 开发", "Jupyter, Git", "1-3 人"],
                    ["Level 1", "ML 管道自动化", "Airflow, MLflow, DVC", "3-10 人"],
                    ["Level 2", "CI/CD/CT 全自动化", "Kubeflow, TFX, Feature Store", "10+ 人"],
                    ["关键瓶颈", "数据质量与一致性", "环境可复现性", "组织协作"],
                    ["成功指标", "实验可追溯率", "模型部署频率", "模型线上稳定性"]
                ]
            },
            mermaid: `graph TD
    A[数据收集] --> B[数据预处理]
    B --> C[特征工程]
    C --> D[实验与训练]
    D --> E{评估达标?}
    E -->|No| D
    E -->|Yes| F[模型注册]
    F --> G[模型部署]
    G --> H[线上监控]
    H --> I{性能退化?}
    I -->|Yes| D
    I -->|No| H
    H --> J[模型退役]`,
            tip: "从 Level 0 迈向 Level 1 时，优先建立实验追踪和模型注册机制，这是投入产出比最高的两步。",
            warning: "不要一开始就追求 Level 2 的全自动化。MLOps 成熟度应该与团队规模和数据量匹配，过度工程化是最大的陷阱。"
        },
        {
            title: "2. 数据管理",
            body: `数据是机器学习系统的燃料，而数据管理是 MLOps 架构中最基础也最容易被忽视的环节。传统软件工程中的版本控制工具（如 Git）无法有效处理大型数据集，因此需要专门的数据版本管理方案。数据管理涵盖四个核心维度：数据版本控制、数据质量验证、数据血缘追踪和数据安全合规。数据版本控制确保每次模型训练使用的数据集都是可复现的。想象一个场景：两个月前训练的模型线上表现良好，但今天用 "相同代码" 重新训练却效果变差。问题往往出在数据上——训练数据在不知不觉中发生了变化。通过 DVC（Data Version Control）或 LakeFS 等工具，我们可以为每个数据集版本创建不可变的快照，并与模型版本建立一一映射关系。数据质量验证则是模型可靠性的第一道防线。在数据进入训练管道之前，必须验证其 schema 是否符合预期、是否存在异常值、类别分布是否在合理范围内。Great Expectations 和 TensorFlow Data Validation 是这一领域的代表性工具。数据血缘追踪记录了数据从原始来源到最终特征向量的完整转换路径，当模型出现问题时，可以快速追溯到是哪个数据源或哪个转换步骤出了问题。最后，数据安全合规在现代 MLOps 中越来越重要，特别是在处理用户隐私数据时，需要实现数据脱敏、访问控制和审计日志。`,
            code: [
                {
                    lang: "python",
                    code: `import great_expectations as gx\nfrom great_expectations.core import ExpectationSuite\nfrom typing import Dict, Any\n\n\ndef create_data_quality_suite() -> ExpectationSuite:\n    """创建数据质量验证规则集"""\n    suite = gx.core.ExpectationSuite(\n        expectation_suite_name="training_data_quality"\n    )\n    expectations = [\n        {\n            "expectation_type": "expect_table_row_count_to_be_between",\n            "kwargs": {"min_value": 1000, "max_value": 1000000}\n        },\n        {\n            "expectation_type": "expect_column_values_to_not_be_null",\n            "kwargs": {"column": "user_id"}\n        },\n        {\n            "expectation_type": "expect_column_values_to_be_between",\n            "kwargs": {"column": "age",\n                       "min_value": 18, "max_value": 100}\n        },\n        {\n            "expectation_type": "expect_column_mean_to_be_between",\n            "kwargs": {"column": "income",\n                       "min_value": 1000, "max_value": 500000}\n        },\n        {\n            "expectation_type": "expect_column_values_to_be_in_set",\n            "kwargs": {"column": "subscription_type",\n                       "value_set": ["free", "premium", "enterprise"]}\n        }\n    ]\n    for exp in expectations:\n        suite.add_expectation(\n            gx.ExpectationConfiguration(**exp)\n        )\n    return suite\n\n\nsuite = create_data_quality_suite()\nprint(f"Created {len(suite.expectations)} quality checks")`
                },
                {
                    lang: "python",
                    code: `import hashlib\nimport json\nfrom dataclasses import dataclass\nfrom typing import Dict, List, Optional\nfrom pathlib import Path\n\n\n@dataclass\nclass DatasetVersion:\n    """数据集版本元数据"""\n    dataset_name: str\n    version_id: str\n    file_paths: List[str]\n    row_count: int\n    schema_hash: str\n    created_at: str\n    source_query: Optional[str] = None\n    parent_version: Optional[str] = None\n\n\nclass DataVersionManager:\n    """数据版本管理系统"""\n\n    def __init__(self, storage_root: str):\n        self.storage_root = Path(storage_root)\n        self.registry: Dict[str, DatasetVersion] = {}\n\n    @staticmethod\n    def compute_schema_hash(schema: dict) -> str:\n        """计算数据 schema 的哈希值"""\n        normalized = json.dumps(schema, sort_keys=True)\n        return hashlib.sha256(normalized.encode()).hexdigest()[:12]\n\n    def register_version(self, name: str, paths: List[str],\n                         row_count: int, schema: dict,\n                         source_query: str = None,\n                         parent: str = None) -> str:\n        version_id = hashlib.md5(\n            f"{name}:{len(paths)}:{row_count}".encode()\n        ).hexdigest()[:8]\n        dv = DatasetVersion(\n            dataset_name=name,\n            version_id=version_id,\n            file_paths=paths,\n            row_count=row_count,\n            schema_hash=self.compute_schema_hash(schema),\n            created_at="2026-04-12T10:00:00Z",\n            source_query=source_query,\n            parent_version=parent\n        )\n        key = f"{name}@{version_id}"\n        self.registry[key] = dv\n        return version_id\n\n    def get_version(self, name: str, version_id: str) -> DatasetVersion:\n        return self.registry[f"{name}@{version_id}"]\n\n    def get_lineage(self, name: str, version_id: str) -> List[str]:\n        """追溯数据血缘链"""\n        chain = []\n        current = f"{name}@{version_id}"\n        while current in self.registry:\n            dv = self.registry[current]\n            chain.append(current)\n            if dv.parent_version:\n                current = f"{name}@{dv.parent_version}"\n            else:\n                break\n        return chain`
                }
            ],
            table: {
                headers: ["数据管理维度", "核心问题", "代表工具", "关键指标"],
                rows: [
                    ["数据版本控制", "训练数据可复现性", "DVC, LakeFS, Delta Lake", "版本覆盖率"],
                    ["数据质量验证", "异常数据检测", "Great Expectations, TFDV", "数据合格率"],
                    ["数据血缘追踪", "数据来源可追溯", "OpenLineage, Marquez", "血缘完整度"],
                    ["数据安全合规", "隐私保护与访问控制", "Apache Ranger, HashiCorp Vault", "审计覆盖率"],
                    ["特征存储", "特征一致性与复用", "Feast, Tecton, Hopsworks", "特征复用率"]
                ]
            },
            mermaid: `graph TD
    A[原始数据源] --> B[数据摄取]
    B --> C[数据质量检查]
    C --> D{质量达标?}
    D -->|No| E[告警并阻断]
    D -->|Yes| F[特征工程]
    F --> G[特征存储]
    G --> H[训练数据集]
    H --> I[数据版本注册]
    I --> J[训练管道]
    E --> K[数据修复流程]
    K --> B`,
            tip: "在训练管道中加入数据 schema 校验作为第一步，schema 变更时立即阻断训练，比训练完成后才发现数据问题成本低得多。",
            warning: "数据集版本化不等于数据备份。版本管理的核心是元数据追踪和可复现性，而非简单的数据拷贝。需要明确版本策略，避免存储成本失控。"
        },
        {
            title: "3. 实验管理",
            body: `机器学习开发本质上是一个高度实验性的过程。数据科学家需要尝试不同的特征组合、模型架构、超参数配置，然后比较它们的性能。没有系统的实验管理，这些尝试很快会变成一团乱麻——没人记得哪个模型用了什么参数，为什么选择了某个配置，以及某个结果是如何产生的。实验管理的核心目标是让每一次实验都可追踪、可比较、可复现。MLflow 是最广泛使用的实验管理工具，它通过 run、experiment 和 artifact 三层结构组织实验数据。每个 run 记录一组完整的参数、指标和输出文件；experiment 将相关的 runs 组织在一起；artifact 存储模型文件、图表等二进制输出。除了 MLflow，Weights & Biases（W&B）提供了更丰富的可视化和协作功能，特别适合团队协作场景。实验管理不仅仅是记录参数和指标，更重要的是建立实验之间的逻辑关联。比如，一次超参数搜索会产生数百个 runs，它们之间存在明确的比较关系；一个 ablation study 会系统地移除某些特征或组件，需要清晰地表达这些实验的因果关系。好的实验管理系统应该支持查询、过滤和可视化比较，让数据科学家能够快速回答 "哪个实验效果最好" 和 "为什么这个配置更好" 这样的关键问题。同时，实验数据本身也需要版本管理和权限控制，特别是涉及敏感业务数据时。`,
            code: [
                {
                    lang: "python",
                    code: `import mlflow\nimport mlflow.sklearn\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score\nfrom typing import Dict, List\nimport pandas as pd\n\n\nclass ExperimentManager:\n    """封装 MLflow 实验管理""" \n\n    def __init__(self, tracking_uri: str, experiment_name: str):\n        mlflow.set_tracking_uri(tracking_uri)\n        self.experiment = mlflow.set_experiment(experiment_name)\n\n    def log_run(self, params: Dict, metrics: Dict,\n                model=None, tags: Dict = None) -> str:\n        """记录一次实验 run"""\n        with mlflow.start_run() as run:\n            for k, v in params.items():\n                mlflow.log_param(k, v)\n            for k, v in metrics.items():\n                mlflow.log_metric(k, v)\n            if model:\n                mlflow.sklearn.log_model(model, "model")\n            if tags:\n                for k, v in tags.items():\n                    mlflow.set_tag(k, v)\n            return run.info.run_id\n\n    def compare_runs(self, metric: str,\n                     top_n: int = 5) -> pd.DataFrame:\n        """比较实验结果并返回 Top N"""\n        runs = mlflow.search_runs(\n            experiment_ids=[self.experiment.experiment_id],\n            order_by=[f"metrics.{metric} DESC"]\n        )\n        return runs.head(top_n)[\n            ["run_id"] +\n            [c for c in runs.columns\n             if c.startswith("params.") or c.startswith("metrics.")]\n        ]\n\n\nmgr = ExperimentManager(\n    "http://localhost:5000", "recommendation_model"\n)`
                },
                {
                    lang: "python",
                    code: `import optuna\nfrom typing import Callable, Dict\nimport pandas as pd\n\n\nclass HyperparameterSearch:\n    """基于 Optuna 的超参数搜索管理"""\n\n    def __init__(self, study_name: str, direction: str = "maximize"):\n        self.study_name = study_name\n        self.direction = direction\n        self.study = optuna.create_study(\n            study_name=study_name,\n            direction=direction,\n            storage="sqlite:///optuna.db",\n            load_if_exists=True\n        )\n\n    def add_trial(self, params: Dict[str, float],\n                  value: float):\n        """手动添加 trial 结果（用于集成已有实验）"""\n        trial = self.study.enqueue_trial(params)\n        self.study.add_trial(\n            optuna.trial.create_trial(\n                params=params,\n                distributions={\n                    k: optuna.distributions.FloatDistribution(\n                        0, 1\n                    ) for k in params\n                },\n                value=value\n            )\n        )\n\n    def optimize(self, objective_fn: Callable,\n                 n_trials: int = 100) -> Dict:\n        """运行优化搜索"""\n        self.study.optimize(objective_fn, n_trials=n_trials)\n        return {\n            "best_value": self.study.best_value,\n            "best_params": self.study.best_params,\n            "n_trials": len(self.study.trials)\n        }\n\n    def get_importance(self) -> Dict[str, float]:\n        """获取超参数重要性排序"""\n        from optuna.importance import get_param_importances\n        return get_param_importances(self.study)\n\n    def export_results(self) -> pd.DataFrame:\n        """导出所有 trial 结果"""\n        return self.study.trials_dataframe()`
                }
            ],
            table: {
                headers: ["实验管理工具", "核心能力", "部署方式", "协作支持"],
                rows: [
                    ["MLflow", "实验追踪+模型注册+Serving", "自托管", "基础"],
                    ["Weights & Biases", "可视化+报告+表格", "SaaS", "优秀"],
                    ["Comet ML", "实验对比+代码差异", "SaaS/私有", "良好"],
                    ["Optuna", "超参数优化", "本地/分布式", "有限"],
                    ["TensorBoard", "训练可视化", "本地", "基础"]
                ]
            },
            mermaid: `graph LR
    A[定义实验假设] --> B[设计实验参数]
    B --> C[运行训练]
    C --> D[记录参数和指标]
    D --> E[存储模型 artifact]
    E --> F[对比分析]
    F --> G{找到最优配置?}
    G -->|No| B
    G -->|Yes| H[注册最佳模型]
    F --> I[生成实验报告]
    I --> J[知识沉淀]`,
            tip: "为每次实验设置 meaningful 的 tags，比如 'baseline'、'ablation-no-features'、'hyperopt-round1'，后续查询时效率会大幅提升。",
            warning: "不要只记录最终指标，中间过程指标（如每个 epoch 的 loss 和 validation score）同样重要，它们能帮你诊断过拟合和学习率问题。"
        },
        {
            title: "4. 模型训练与验证",
            body: `模型训练是 ML 系统中计算最密集、资源消耗最大的环节。在端到端 MLOps 架构中，训练不再是一个 "在笔记本上跑一下" 的动作，而是一个可编排、可复现、可自动触发的管道化过程。训练管道需要处理几个关键挑战。首先是计算资源的弹性调度。训练任务可能从小型 CPU 任务到大规模 GPU 集群分布式训练，系统需要能够根据任务需求自动分配资源。Kubernetes 结合 Volcano 或 KubeFlow 提供了原生的 ML 工作负载调度能力。其次是训练过程的可复现性。同一个训练脚本在不同时间、不同环境、甚至不同随机种子下运行，可能产生不同的结果。MLOps 要求我们锁定训练环境的每一个变量：基础镜像版本、依赖库版本、随机种子、数据版本。第三是验证策略的设计。除了常规的 train/validation/test 分割，还需要实现交叉验证、时间序列分割、以及针对特定业务场景的验证策略。对于推荐系统，可能需要按用户群体分层验证；对于时间序列模型，必须使用滚动窗口验证而非随机分割。最后是模型验证，它不同于训练过程中的验证，而是在训练完成后、部署之前，对模型进行全面的质量检查，包括性能基准对比、公平性检测、鲁棒性测试等。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass\nfrom typing import Dict, List, Optional\nimport json\n\n\n@dataclass\nclass TrainingConfig:\n    """训练配置（锁定所有变量以确保可复现性）"""\n    model_type: str\n    data_version: str\n    feature_version: str\n    hyperparameters: Dict[str, float]\n    random_seed: int\n    base_image: str\n    dependency_lock: str  # requirements hash\n    gpu_count: int = 1\n    distributed: bool = False\n\n\nclass TrainingPipeline:\n    """可编排的训练管道"""\n\n    def __init__(self, config: TrainingConfig):\n        self.config = config\n        self.steps = []\n        self.artifacts = {}\n\n    def add_step(self, name: str, fn, kwargs):\n        self.steps.append({"name": name, "fn": fn,\n                           "kwargs": kwargs})\n\n    def execute(self) -> Dict:\n        """执行训练管道"""\n        results = {}\n        for step in self.steps:\n            print(f"Running step: {step['name']}")\n            result = step["fn"](step["kwargs"])\n            results[step["name"]] = result\n        return results\n\n    def get_reproducibility_report(self) -> Dict:\n        """生成可复现性报告"""\n        return {\n            "data_version": self.config.data_version,\n            "feature_version": self.config.feature_version,\n            "random_seed": self.config.random_seed,\n            "base_image": self.config.base_image,\n            "dependency_lock": self.config.dependency_lock,\n            "hyperparameters": self.config.hyperparameters\n        }\n\n\ndef train_model(kwargs):\n    return {"model_path": "models/v1.pkl", "steps": 100}\n\n\ndef evaluate_model(kwargs):\n    return {"accuracy": 0.92, "f1": 0.90}\n\n\nconfig = TrainingConfig(\n    model_type="random_forest",\n    data_version="dataset@v3.2.1",\n    feature_version="features@v1.0.0",\n    hyperparameters={"n_estimators": 100, "max_depth": 10},\n    random_seed=42,\n    base_image="pytorch/pytorch:2.1.0-cuda12.1",\n    dependency_lock="sha256:abc123"\n)\npipeline = TrainingPipeline(config)\npipeline.add_step("train", train_model)\npipeline.add_step("evaluate", evaluate_model)`
                },
                {
                    lang: "python",
                    code: `from sklearn.model_selection import (\n    cross_val_score, TimeSeriesSplit\n)\nfrom sklearn.metrics import (\n    classification_report, confusion_matrix\n)\nimport numpy as np\nfrom typing import Tuple, Dict\n\n\nclass ModelValidator:\n    """模型验证器 - 训练后质量检查"""\n\n    def __init__(self, model, X_test, y_test,\n                 baseline_metrics: Dict[str, float]):\n        self.model = model\n        self.X_test = X_test\n        self.y_test = y_test\n        self.baseline = baseline_metrics\n\n    def cross_validate(self, X, y, cv_folds: int = 5) -> Dict:\n        """交叉验证"""\n        scores = cross_val_score(\n            self.model, X, y, cv=cv_folds, scoring="f1_macro"\n        )\n        return {\n            "mean_f1": scores.mean(),\n            "std_f1": scores.std(),\n            "cv_scores": scores.tolist()\n        }\n\n    def time_series_validate(self, X, y, n_splits: int = 5):\n        """时间序列滚动验证"""\n        tscv = TimeSeriesSplit(n_splits=n_splits)\n        scores = []\n        for train_idx, val_idx in tscv.split(X):\n            X_train, X_val = X[train_idx], X[val_idx]\n            y_train, y_val = y[train_idx], y[val_idx]\n            self.model.fit(X_train, y_train)\n            score = self.model.score(X_val, y_val)\n            scores.append(score)\n        return scores\n\n    def compare_to_baseline(self) -> Dict[str, bool]:\n        """与基线模型比较"""\n        y_pred = self.model.predict(self.X_test)\n        from sklearn.metrics import accuracy_score, f1_score\n        current = {\n            "accuracy": accuracy_score(self.y_test, y_pred),\n            "f1": f1_score(self.y_test, y_pred, average="macro")\n        }\n        return {\n            metric: current[metric] > self.baseline[metric]\n            for metric in self.baseline\n        }\n\n    def robustness_check(self, noise_level: float = 0.01) -> Dict:\n        """鲁棒性检查 - 添加噪声后性能变化"""\n        X_noisy = self.X_test + np.random.normal(\n            0, noise_level, self.X_test.shape\n        )\n        orig_score = self.model.score(self.X_test, self.y_test)\n        noisy_score = self.model.score(X_noisy, self.y_test)\n        return {\n            "original_score": round(orig_score, 4),\n            "noisy_score": round(noisy_score, 4),\n            "degradation": round(orig_score - noisy_score, 4)\n        }`
                }
            ],
            table: {
                headers: ["验证策略", "适用场景", "优点", "局限"],
                rows: [
                    ["Hold-out", "大数据集，快速验证", "简单高效", "结果依赖划分方式"],
                    ["K-fold 交叉验证", "中小数据集", "充分利用数据", "计算成本高"],
                    ["时间序列分割", "时间序列模型", "符合时间因果", "不能随机打乱"],
                    ["分层抽样", "类别不平衡", "保持类别分布", "仅适用于分类"],
                    ["嵌套交叉验证", "超参数+模型选择", "无偏估计", "计算量极大"]
                ]
            },
            mermaid: `graph TD
    A[训练配置锁定] --> B[数据加载]
    B --> C[模型训练]
    C --> D[交叉验证]
    D --> E{CV 结果达标?}
    E -->|No| F[调整配置]
    F --> C
    E -->|Yes| G[测试集评估]
    G --> H[基线对比]
    H --> I{优于基线?}
    I -->|No| F
    I -->|Yes| J[鲁棒性检查]
    J --> K[生成验证报告]
    K --> L[模型注册候选]`,
            tip: "训练管道的每个步骤都应该输出明确的 artifact，这样即使中间步骤失败，也能从断点恢复，而不是从头开始。",
            warning: "测试集必须在整个开发过程中严格隔离，只能在最终验证时使用一次。频繁使用测试集调参会导致数据泄露，使测试结果失去意义。"
        },
        {
            title: "5. 模型部署与服务",
            body: `模型部署是将训练好的模型从实验环境推向生产环境的关键步骤。在 MLOps 架构中，部署不再是简单的 "把模型文件拷贝到服务器"，而是需要考虑多种部署模式、服务化策略和可扩展性设计。常见的模型部署模式包括批量预测（Batch Prediction）、实时在线服务（Real-time Serving）和边缘部署（Edge Deployment）。批量预测适用于不需要即时响应的场景，比如每天凌晨对用户进行推荐打分；实时在线服务则要求低延迟高吞吐，比如搜索排序、欺诈检测；边缘部署将模型推送到终端设备，适用于离线场景和低延迟需求。在服务化层面，有几种主流方案。直接使用框架内置 Serving（如 TensorFlow Serving、TorchServe）是最简单的方式；使用 KServe 或 Seldon Core 可以在 Kubernetes 上实现更高级的模型服务管理；而将模型封装为 REST API 或 gRPC 服务则提供了最大的灵活性。部署架构中还需要考虑模型版本共存（多版本同时服务）、动态路由（根据实验配置将请求路由到不同版本）、自动扩缩容（根据负载自动调整实例数）和容灾备份（模型服务不可用时的降级策略）。一个成熟的 MLOps 部署架构应该支持零停机更新，即在更新模型版本时不影响正在处理的请求。`,
            code: [
                {
                    lang: "python",
                    code: `from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\nfrom typing import List, Dict, Optional\nimport mlflow\nimport numpy as np\nfrom enum import Enum\n\n\nclass PredictionRequest(BaseModel):\n    user_id: str\n    features: Dict[str, float]\n    model_version: Optional[str] = None\n\n\nclass PredictionResponse(BaseModel):\n    prediction: float\n    confidence: float\n    model_version: str\n    latency_ms: float\n\n\nclass ModelServingService:\n    """模型在线服务"""\n\n    def __init__(self, model_name: str,\n                 tracking_uri: str = "http://localhost:5000"):\n        self.model_name = model_name\n        self.client = mlflow.tracking.MlflowClient(tracking_uri)\n        self._models = {}\n        self._load_production_models()\n\n    def _load_production_models(self):\n        """加载 Production 阶段的模型"""\n        versions = self.client.get_latest_versions(\n            self.model_name, stages=["Production"]\n        )\n        for v in versions:\n            uri = f"models:/{self.model_name}/{v.version}"\n            self._models[v.version] = mlflow.pyfunc.load_model(uri)\n            print(f"Loaded model version: {v.version}")\n\n    def predict(self, request: PredictionRequest) -> PredictionResponse:\n        import time\n        start = time.time()\n        version = request.model_version or list(self._models.keys())[-1]\n        if version not in self._models:\n            raise HTTPException(404, f"Model version {version} not found")\n        features = np.array(\n            [list(request.features.values())]\n        ).reshape(1, -1)\n        result = self._models[version].predict(features)\n        latency = (time.time() - start) * 1000\n        return PredictionResponse(\n            prediction=float(result[0]),\n            confidence=0.95,\n            model_version=version,\n            latency_ms=round(latency, 2)\n        )\n\n\napp = FastAPI()\nservice = ModelServingService("recommendation_model")\n\n\n@app.post("/predict", response_model=PredictionResponse)\ndef predict(req: PredictionRequest):\n    return service.predict(req)`
                },
                {
                    lang: "yaml",
                    code: `# KServe InferenceService 部署配置\napiVersion: serving.kserve.io/v1beta1\nkind: InferenceService\nmetadata:\n  name: recommendation-model\n  annotations:\n    autoscaling.knative.dev/minScale: "2"\n    autoscaling.knative.dev/maxScale: "10"\nspec:\n  predictor:\n    model:\n      modelFormat:\n        name: sklearn\n      storageUri: "gs://mlops-models/recommendation/v3"\n      resources:\n        requests:\n          cpu: "500m"\n          memory: "1Gi"\n        limits:\n          cpu: "2"\n          memory: "4Gi"\n    containerConcurrency: 10\n    timeout: 30s\n---\napiVersion: serving.kserve.io/v1beta1\nkind: InferenceService\nmetadata:\n  name: recommendation-model-canary\nspec:\n  predictor:\n    model:\n      modelFormat:\n        name: sklearn\n      storageUri: "gs://mlops-models/recommendation/v4-canary"\n---\n# 流量分割: 90% 稳定版, 10% 金丝雀\napiVersion: networking.istio.io/v1beta3\nkind: VirtualService\nmetadata:\n  name: model-traffic-split\nspec:\n  http:\n    - route:\n        - destination:\n            host: recommendation-model\n          weight: 90\n        - destination:\n            host: recommendation-model-canary\n          weight: 10`
                }
            ],
            table: {
                headers: ["部署模式", "延迟要求", "吞吐量", "典型场景", "技术栈"],
                rows: [
                    ["实时在线服务", "<100ms", "高", "搜索排序、欺诈检测", "KServe, TorchServe"],
                    ["批量预测", "分钟-小时", "极高", "推荐打分、用户画像", "Spark, Airflow"],
                    ["流式推理", "<1s", "中", "实时异常检测", "Flink, Kafka Streams"],
                    ["边缘部署", "<50ms", "低", "移动端、IoT", "TensorFlow Lite, ONNX"],
                    ["异步推理", "秒-分钟", "中", "图像生成、翻译", "Celery, Redis Queue"]
                ]
            },
            mermaid: `graph TD
    A[模型注册为 Production] --> B[构建服务镜像]
    B --> C[部署到 Kubernetes]
    C --> D[健康检查]
    D --> E{健康?}
    E -->|No| F[回滚]
    E -->|Yes| G[配置流量路由]
    G --> H[启动服务]
    H --> I[监控延迟和错误率]
    I --> J{指标正常?}
    J -->|No| K[自动扩缩容或告警]
    J -->|Yes| L[正常运行]
    K --> M{超过最大实例?}
    M -->|Yes| N[降级策略]`,
            tip: "在部署前用负载测试工具（如 k6 或 Locust）模拟生产流量，确认服务在预期 QPS 下的延迟和稳定性。",
            warning: "模型文件的加载是内存密集操作。在多模型共存的场景下，需要严格控制每个模型的内存配额，避免 OOM 导致全部服务崩溃。"
        },
        {
            title: "6. 监控与告警",
            body: `模型上线后，MLOps 的工作才刚刚开始。与传统软件不同，模型性能会随着时间自然退化，这种现象称为模型衰退（Model Decay）。导致衰退的原因包括数据分布变化（Data Drift）、概念漂移（Concept Drift）、上游依赖变更、以及用户行为模式的演变。因此，对生产中的 ML 系统进行持续监控不是可选项，而是必选项。ML 监控分为三个层次：基础设施监控、服务性能监控和业务效果监控。基础设施监控关注 CPU、内存、GPU 利用率等通用指标；服务性能监控关注推理延迟、错误率、QPS 等服务级别指标；业务效果监控则是最具 ML 特色的部分，它关注模型预测的准确性是否下降、输入数据分布是否偏移、模型对不同用户群体的表现是否公平。数据漂移检测是 ML 监控的核心技术之一。通过比较当前生产数据的统计特征与训练数据的统计特征，可以量化数据分布的变化程度。常用的漂移检测方法包括 PSI（Population Stability Index）、KS 检验、以及基于神经网络的漂移检测器。当检测到显著漂移时，系统应该自动触发告警，并根据预设策略决定是否需要重新训练模型。告警策略需要精心设计，避免告警疲劳（Alert Fatigue）。过多的告警会让团队对告警麻木，而关键告警被淹没在噪音中。建议采用分级告警：Critical 级别（需要立即处理）、Warning 级别（需要关注）、Info 级别（仅记录）。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np\nfrom scipy import stats\nfrom typing import Dict, Tuple\nfrom dataclasses import dataclass\nfrom enum import Enum\n\n\nclass AlertLevel(Enum):\n    INFO = "info"\n    WARNING = "warning"\n    CRITICAL = "critical"\n\n\n@dataclass\nclass DriftReport:\n    """数据漂移检测报告"""\n    feature_name: str\n    method: str\n    statistic: float\n    p_value: float\n    is_drift: bool\n    alert_level: AlertLevel\n\n\nclass DriftDetector:\n    """数据漂移检测器"""\n\n    def __init__(self, reference_data: np.ndarray,\n                 feature_names: list,\n                 psi_threshold: float = 0.2,\n                 ks_alpha: float = 0.05):\n        self.reference = reference_data\n        self.feature_names = feature_names\n        self.psi_threshold = psi_threshold\n        self.ks_alpha = ks_alpha\n\n    @staticmethod\n    def compute_psi(expected: np.ndarray,\n                    actual: np.ndarray,\n                    buckets: int = 10) -> float:\n        """计算 Population Stability Index"""\n        def bin_data(data: np.ndarray) -> np.ndarray:\n            breakpoints = np.percentile(\n                expected,\n                np.linspace(0, 100, buckets + 1)\n            )\n            counts = np.histogram(data, breakpoints)[0]\n            percentages = counts / counts.sum()\n            percentages = np.clip(percentages, 0.0001, None)\n            return percentages\n\n        exp_pct = bin_data(expected)\n        act_pct = bin_data(actual)\n        psi = np.sum((act_pct - exp_pct) *\n                      np.log(act_pct / exp_pct))\n        return round(float(psi), 4)\n\n    def detect(self, current_data: np.ndarray) -> list:\n        """检测所有特征的漂移"""\n        reports = []\n        for i, name in enumerate(self.feature_names):\n            psi = self.compute_psi(\n                self.reference[:, i], current_data[:, i]\n            )\n            ks_stat, p_val = stats.ks_2samp(\n                self.reference[:, i], current_data[:, i]\n            )\n            level = AlertLevel.INFO\n            if psi > 0.25 or p_val < 0.001:\n                level = AlertLevel.CRITICAL\n            elif psi > 0.1 or p_val < 0.01:\n                level = AlertLevel.WARNING\n            reports.append(DriftReport(\n                feature_name=name, method="PSI+KS",\n                statistic=psi, p_value=round(float(p_val), 6),\n                is_drift=psi > self.psi_threshold,\n                alert_level=level\n            ))\n        return reports`
                },
                {
                    lang: "python",
                    code: `from dataclasses import dataclass\nfrom typing import List, Dict, Callable\nfrom datetime import datetime\nfrom enum import Enum\n\n\nclass AlertSeverity(Enum):\n    P1 = "critical"   # 立即处理\n    P2 = "warning"    # 尽快处理\n    P3 = "info"       # 关注即可\n\n\n@dataclass\nclass AlertRule:\n    """告警规则定义"""\n    name: str\n    metric_name: str\n    condition: str  # ">", "<", ">=", "<=", "==", "!="\n    threshold: float\n    severity: AlertSeverity\n    cooldown_minutes: int = 30\n    enabled: bool = True\n\n\nclass AlertManager:\n    """告警管理器"""\n\n    def __init__(self):\n        self.rules: List[AlertRule] = []\n        self.alert_history: List[Dict] = []\n        self._cooldowns: Dict[str, datetime] = {}\n\n    def add_rule(self, rule: AlertRule):\n        self.rules.append(rule)\n\n    def check_metrics(self, metrics: Dict[str, float]) -> List[Dict]:\n        """检查当前指标是否触发告警"""\n        alerts = []\n        now = datetime.now()\n        for rule in self.rules:\n            if not rule.enabled:\n                continue\n            if rule.metric_name not in metrics:\n                continue\n            # 检查冷却期\n            last_alert = self._cooldowns.get(rule.name)\n            if last_alert:\n                elapsed = (now - last_alert).total_seconds() / 60\n                if elapsed < rule.cooldown_minutes:\n                    continue\n            value = metrics[rule.metric_name]\n            triggered = False\n            if rule.condition == ">" and value > rule.threshold:\n                triggered = True\n            elif rule.condition == "<" and value < rule.threshold:\n                triggered = True\n            if triggered:\n                alert = {\n                    "rule": rule.name,\n                    "metric": rule.metric_name,\n                    "value": value,\n                    "threshold": rule.threshold,\n                    "severity": rule.severity.value,\n                    "timestamp": str(now)\n                }\n                alerts.append(alert)\n                self._cooldowns[rule.name] = now\n                self.alert_history.append(alert)\n        return alerts\n\n\nmgr = AlertManager()\nmgr.add_rule(AlertRule(\n    name="high_error_rate", metric_name="error_rate",\n    condition=">", threshold=0.05,\n    severity=AlertSeverity.P1, cooldown_minutes=15\n))\nmgr.add_rule(AlertRule(\n    name="drift_detected", metric_name="drift_psi",\n    condition=">", threshold=0.2,\n    severity=AlertSeverity.P2, cooldown_minutes=60\n))`
                }
            ],
            table: {
                headers: ["监控维度", "关键指标", "告警阈值", "响应动作"],
                rows: [
                    ["数据漂移", "PSI, KS 统计量", "PSI > 0.2", "触发重新训练评估"],
                    ["概念漂移", "模型准确率变化", "下降 >5%", "紧急调查原因"],
                    ["服务性能", "P99 延迟", "超过 SLA", "自动扩容"],
                    ["基础设施", "GPU 利用率", "持续 <20%", "缩容降成本"],
                    ["业务效果", "转化率/ROI", "下降 >10%", "业务团队介入"],
                    ["公平性", "群体间性能差异", "差异 >15%", "偏差调查"]
                ]
            },
            mermaid: `graph TD
    A[生产推理请求] --> B[记录输入输出]
    B --> C[实时指标聚合]
    C --> D[漂移检测]
    C --> E[性能监控]
    D --> F{漂移超标?}
    E --> G{性能达标?}
    F -->|Yes| H[P2 告警]
    F -->|No| I[正常]
    G -->|No| J[P1 告警]
    G -->|Yes| I
    H --> K[评估是否需要重新训练]
    J --> L[自动扩容/降级]
    K --> M{需要重新训练?}
    M -->|Yes| N[触发 CT 管道]
    M -->|No| I
    L --> O{恢复?}
    O -->|No| P[升级告警]`,
            tip: "建立监控仪表板（Dashboard）是第一步，但更重要的是定义清晰的告警响应 Runbook，确保每条告警都有明确的负责人和处理流程。",
            warning: "避免设置过于敏感的告警阈值。如果团队每天收到 50+ 条告警，说明阈值设置不合理，会导致真正的 Critical 告警被忽略。"
        },
        {
            title: "7. 实战：完整 MLOps 项目",
            body: `理论框架需要落地到实践中才能真正产生价值。本节以一个推荐系统为例，演示如何从零搭建一个完整的端到端 MLOps 架构。这个推荐系统服务于一个中型电商平台，日活用户 50 万，需要为每个用户实时生成个性化推荐。整个架构分为数据层、训练层、服务层和监控层四个层次。数据层使用 Kafka 收集用户行为事件，通过 Flink 进行实时特征计算，Feast 作为特征存储统一管理线上线下特征一致性。训练层使用 Airflow 编排每日离线训练管道，MLflow 追踪实验和管理模型版本，Optuna 进行超参数优化。服务层使用 KServe 在 Kubernetes 上部署模型服务，Istio 实现流量管理和灰度发布。监控层结合 Prometheus 和 Grafana 实现基础设施和服务性能监控，自定义漂移检测服务监控数据质量。整个系统的关键设计原则是 "一切皆代码"（Everything as Code）：数据管道代码化、训练配置代码化、部署配置代码化、监控规则代码化。这样做的最大好处是可复现性和可审计性——任何时间点的系统状态都可以通过代码精确复现，任何变更都有明确的 commit 记录和审批流程。此外，系统实现了持续训练（Continuous Training）的闭环：当监控层检测到显著的数据漂移或模型性能退化时，自动触发训练管道，生成新模型，通过 A/B 测试验证后自动部署。这种闭环使得推荐系统能够在无人干预的情况下持续适应数据分布的变化。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass\nfrom typing import Dict, List, Optional\nfrom datetime import datetime\n\n\n@dataclass\nclass MLOpsProject:\n    """端到端 MLOps 项目配置"""\n    name: str\n    layers: Dict[str, List[str]]\n    cicd_config: Dict[str, str]\n    monitoring_config: Dict[str, float]\n\n\nclass RecommendationMLOps:\n    """推荐系统 MLOps 架构实现"""\n\n    def __init__(self):\n        self.project = MLOpsProject(\n            name="ecommerce-recommendation",\n            layers={\n                "data": ["kafka", "flink", "feast", "s3"],\n                "training": ["airflow", "mlflow", "optuna",\n                             "kubeflow"],\n                "serving": ["kserve", "istio", "kubernetes"],\n                "monitoring": ["prometheus", "grafana",\n                               "drift-detector"]\n            },\n            cicd_config={\n                "ci_tool": "GitHub Actions",\n                "cd_tool": "ArgoCD",\n                "test_framework": "pytest + great_expectations",\n                "deploy_strategy": "canary"\n            },\n            monitoring_config={\n                "drift_check_interval_hours": 6,\n                "retrain_threshold_psi": 0.25,\n                "ab_test_traffic_pct": 10,\n                "canary_max_duration_hours": 48\n            }\n        )\n\n    def describe_architecture(self) -> str:\n        layers_desc = []\n        for layer, tools in self.project.layers.items():\n            layers_desc.append(f"{layer}: {', '.join(tools)}")\n        return "\\n".join(layers_desc)\n\n    def get_pipeline_dag(self) -> Dict[str, List[str]]:\n        """返回 MLOps 管道依赖图"""\n        return {\n            "data_collection": ["kafka_ingestion"],\n            "feature_computation": ["flink_streaming"],\n            "feature_storage": ["feast_write"],\n            "model_training": ["data_load", "train",\n                               "evaluate", "register"],\n            "model_deployment": ["build_image",\n                                 "deploy_canary", "ab_test"],\n            "monitoring": ["metrics_collection",\n                           "drift_detection",\n                           "alert_evaluation"],\n            "continuous_training": ["drift_trigger",\n                                    "auto_retrain"]\n        }\n\n\nmlops = RecommendationMLOps()\nprint(mlops.describe_architecture())`
                },
                {
                    lang: "yaml",
                    code: `# GitHub Actions - CI/CD 管道定义\nname: MLOps Pipeline\non:\n  push:\n    branches: [main]\n  schedule:\n    - cron: "0 2 * * *"  # 每日 2AM 触发训练\n\njobs:\n  data-validation:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Validate Data Quality\n        run: |\n          python scripts/validate_data.py \\\n            --suite training_data_quality \\\n            --data-version latest\n\n  model-training:\n    needs: data-validation\n    runs-on: gpu-runner\n    steps:\n      - name: Train Model\n        run: |\n          mlflow run . --experiment-name recommendation \\\n            -P data_version=latest \\\n            -P model_type=lightgbm\n      - name: Register if Better\n        run: |\n          python scripts/register_if_better.py \\\n            --baseline-metric ndcg@10 \\\n            --threshold 0.02\n\n  model-deployment:\n    needs: model-training\n    runs-on: ubuntu-latest\n    if: github.ref == 'refs/heads/main'\n    steps:\n      - name: Canary Deploy\n        run: |\n          kubectl apply -f k8s/canary/\n          python scripts/run_ab_test.py \\\n            --traffic-pct 10 --duration 48h\n      - name: Auto Promote\n        run: |\n          if ab_test_passed; then\n            kubectl apply -f k8s/production/\n          fi`
                }
            ],
            table: {
                headers: ["架构层级", "组件", "职责", "SLA"],
                rows: [
                    ["数据层", "Kafka + Flink + Feast", "实时特征计算与存储", "99.9% 可用性"],
                    ["训练层", "Airflow + MLflow + Optuna", "自动化训练与实验", "每日按时完成"],
                    ["服务层", "KServe + Istio + K8s", "模型推理与流量管理", "P99 < 50ms"],
                    ["监控层", "Prometheus + Grafana", "指标采集与告警", "告警延迟 < 1min"],
                    ["持续训练", "Drift Detector + CT Pipeline", "自动触发重新训练", "漂移检测 < 6h"],
                    ["CI/CD", "GitHub Actions + ArgoCD", "代码到生产的自动化", "部署成功率 > 99%"]
                ]
            },
            mermaid: `graph TD
    subgraph 数据层
        A1[Kafka Events] --> A2[Flink Streaming]
        A2 --> A3[Feast Feature Store]
    end
    subgraph 训练层
        B1[Airflow DAG] --> B2[MLflow Training]
        B2 --> B3[Optuna Tuning]
        B3 --> B4[Model Registry]
    end
    subgraph 服务层
        C1[KServe] --> C2[Istio Routing]
        C2 --> C3[A/B Testing]
    end
    subgraph 监控层
        D1[Prometheus] --> D2[Drift Detection]
        D2 --> D3[Alert Manager]
    end
    A3 --> B1
    B4 --> C1
    C1 --> D1
    D3 -->|Trigger Retraining| B1`,
            tip: "MLOps 项目的成功不取决于工具的先进性，而取决于团队的工程纪律。从最简单的管道开始，逐步增加自动化程度。",
            warning: "不要在项目初期就引入所有工具。每个工具都会增加运维复杂度和学习成本。先解决核心问题（训练和部署），再逐步完善监控和持续训练。"
        }
    ],
};
