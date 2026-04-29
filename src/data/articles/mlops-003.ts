import { Article } from '../knowledge';

export const article: Article = {
    id: "mlops-003",
    title: "模型版本管理与注册表",
    category: "mlops",
    tags: ["模型注册表", "版本管理", "MLOps"],
    summary: "从模型版本控制到注册表管理，掌握 ML 模型的生命周期管理",
    date: "2026-04-12",
    readTime: "16 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么需要模型版本管理？",
            body: `在生产环境中运行机器学习模型，最大的风险之一不是模型效果差，而是不知道当前线上跑的是哪个版本。当用户报告异常预测时，如果没有版本管理，你甚至无法确定问题出在代码、数据还是模型权重上。版本管理是 MLOps 的基石，它为每一次模型变更提供了可追溯的审计轨迹。

传统软件工程中，Git 已经很好地解决了代码版本问题。但 ML 系统远比纯软件复杂——除了代码，还有训练数据、特征工程逻辑、超参数配置、模型权重文件，以及训练环境的依赖。任何一个维度的变化都可能导致模型行为的改变。如果只跟踪代码而忽略模型权重，当出现线上事故时，你无法复现那个特定版本的模型。

模型版本管理的核心目标可以概括为三个词：可追溯、可复现、可回滚。可追溯意味着知道每个模型是谁训练的、用的什么数据、结果如何；可复现意味着能够精确重现训练过程；可回滚意味着当新版本出现问题时，能迅速切回之前的稳定版本。这三者共同构成了 ML 系统的保险网。`,
            code: [
                {
                    lang: "python",
                    code: `import hashlib
import json
import os
from pathlib import Path

class ModelVersionTracker:
    """轻量级模型版本跟踪器（无外部依赖）"""

    def __init__(self, registry_dir="model_registry"):
        self.registry_dir = Path(registry_dir)
        self.registry_dir.mkdir(exist_ok=True)

    def compute_model_hash(self, model_path: str) -> str:
        """计算模型文件的 SHA-256 指纹"""
        sha = hashlib.sha256()
        with open(model_path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha.update(chunk)
        return sha.hexdigest()[:12]

    def register(self, model_path: str, metadata: dict) -> str:
        """注册模型版本，返回版本号"""
        model_hash = self.compute_model_hash(model_path)
        version = f"v{len(list(self.registry_dir.glob('*.json')))+1:03d}_{model_hash}"

        record = {
            "version": version,
            "model_hash": model_hash,
            "model_path": os.path.abspath(model_path),
            "registered_at": metadata.get("timestamp", ""),
            "training_data": metadata.get("training_data", ""),
            "metrics": metadata.get("metrics", {}),
            "trainer": metadata.get("trainer", "unknown"),
        }

        record_path = self.registry_dir / f"{version}.json"
        with open(record_path, "w") as f:
            json.dump(record, f, indent=2)
        return version`
                },
                {
                    lang: "bash",
                    code: `# 实际注册一个模型
python -c "
from model_tracker import ModelVersionTracker

tracker = ModelVersionTracker('model_registry')
version = tracker.register(
    model_path='models/xgboost_churn_v2.pkl',
    metadata={
        'timestamp': '2026-04-12T14:30:00Z',
        'training_data': 's3://data-lake/churn/training/2026-03',
        'metrics': {'auc': 0.91, 'f1': 0.87, 'latency_ms': 12},
        'trainer': 'data-team@company.com',
    }
)
print(f'Registered: {version}')
"
# 输出: Registered: v001_a3f8b2c1d4e5

# 查看注册表内容
ls -la model_registry/
# v001_a3f8b2c1d4e5.json  v002_f7e9a1b3c2d4.json  v003_d5c4b3a2e1f0.json

cat model_registry/v001_a3f8b2c1d4e5.json
# {"version": "v001_a3f8b2c1d4e5", "model_hash": "a3f8b2c1d4e5", ...}`
                }
            ],
            table: {
                headers: ["管理对象", "版本痛点", "传统方案", "MLOps 方案"],
                rows: [
                    ["模型权重", "文件覆盖无法回滚", "手动命名 model_v1.pkl", "带 hash 的版本注册表"],
                    ["训练数据", "数据集静默更新", "数据快照手动备份", "数据版本控制(DVC)"],
                    ["超参数", "实验记录散落各处", "Excel 记录", "实验跟踪系统"],
                    ["依赖环境", "训练/推理环境不一致", "口头传达配置", "容器化+环境锁定"],
                ]
            },
            mermaid: `graph LR
    A["训练完成"] --> B["计算模型指纹"]
    B --> C["记录元数据"]
    C --> D["注册到版本库"]
    D --> E["分配版本号"]
    E --> F["上线部署"]
    F --> G["持续监控"]
    G -->|"效果下降"| A
    G -->|"效果稳定"| H["保持当前版本"]`,
            tip: "模型指纹（hash）比版本号更可靠——版本号可以重复，但 hash 永远唯一。建议将 hash 作为版本标识的核心部分。",
            warning: "不要只保存模型权重文件而不保存训练数据信息。没有数据来源记录的模型版本，在审计和复现时形同虚设。",
        },
        {
            title: "2. 模型版本控制基础",
            body: `模型版本控制的第一课：模型不是单一文件。一个完整的模型版本至少包含模型权重、模型架构定义、预处理管线配置、以及训练时的超参数。这四个要素中任何一个发生变化，都应该被视为一个新的模型版本。如果把模型比作一道菜，光保存成品照片（权重）是不够的，你还需要菜谱（架构）、切菜手法（预处理）和调料比例（超参数）。

版本控制策略有多种选择，需要根据团队规模和应用场景来决定。语义化版本号（SemVer）在 ML 领域同样适用：主版本号表示模型架构变更，次版本号表示训练数据或特征变更，修订号表示超参数微调。例如 v2.1.0 表示架构不变、数据更新的小版本。这种约定让团队成员通过版本号就能判断变更的影响范围。

Git LFS（Large File Storage）是管理模型文件的主流方案之一。它将大文件存储在远程存储中，Git 仓库只保存指针。这使得模型文件的版本历史可以和代码版本历史统一管理，开发者用熟悉的 Git 工作流就能操作模型。但对于超过 GB 级别的超大模型，专门的模型注册表（如 MLflow Model Registry、Weights & Biases）是更专业的选择。`,
            code: [
                {
                    lang: "python",
                    code: `import dvc.api
from pathlib import Path

class DVCModelVersioner:
    """使用 DVC 管理模型版本"""

    def __init__(self, repo_path="."):
        self.repo_path = Path(repo_path)

    def track_model(self, model_path: str, stage_name="train") -> str:
        """将模型加入 DVC 跟踪"""
        import subprocess
        result = subprocess.run(
            ["dvc", "add", model_path],
            capture_output=True, text=True, cwd=self.repo_path
        )
        if result.returncode != 0:
            raise RuntimeError(f"DVC add failed: {result.stderr}")

        # 读取 .dvc 文件获取版本信息
        dvc_file = Path(model_path + ".dvc")
        if dvc_file.exists():
            import yaml
            with open(dvc_file) as f:
                dvc_meta = yaml.safe_load(f)
            return dvc_meta.get("outs", [{}])[0].get("md5", "unknown")
        return "tracked"

    def checkout_version(self, model_path: str, version_hash: str):
        """切换到指定版本"""
        import subprocess
        subprocess.run(
            ["dvc", "checkout", f"{model_path}@{version_hash}"],
            cwd=self.repo_path, check=True
        )`
                },
                {
                    lang: "bash",
                    code: `# DVC 初始化
dvc init
git add .dvc .dvcignore
git commit -m "Initialize DVC"

# 追踪模型文件
dvc add models/model.pkl
git add models/model.pkl.dvc .gitignore
git commit -m "Add model v1"

# 训练新版本后
dvc add models/model.pkl  # 更新追踪
git add models/model.pkl.dvc
git commit -m "Update model to v2"

# 查看版本历史
git log --oneline -- models/model.pkl.dvc
# a1b2c3d Update model to v2
# e4f5g6h Add model v1

# 回退到 v1
git checkout e4f5g6h -- models/model.pkl.dvc
dvc checkout

# 推送到远程存储（S3/GCS/Azure）
dvc remote add -d storage s3://my-bucket/dvc-store
dvc push`
                }
            ],
            table: {
                headers: ["版本策略", "适用场景", "优势", "局限"],
                rows: [
                    ["语义化版本号", "面向产品/业务的模型", "人类可读，影响范围明确", "需要人为判断版本号"],
                    ["Git Hash", "研究/实验环境", "精确唯一，与代码关联", "不可读，不适合对外沟通"],
                    ["时间戳", "自动化流水线", "天然有序，自动生成", "同一时刻多次训练会冲突"],
                    ["DVC Hash", "大模型/大数据集", "自动计算，内容寻址", "需要 DVC 工具链"],
                ]
            },
            mermaid: `graph TD
    A["代码变更"] -->|"架构修改"| B["主版本号 +1"]
    C["数据变更"] -->|"特征/样本更新"| D["次版本号 +1"]
    E["超参调整"] -->|"微调/重训"| F["修订号 +1"]
    B --> G["v3.0.0"]
    D --> G
    F --> G
    G --> H["完整版本标识"]`,
            tip: "为团队制定明确的版本号规则文档，并在 CI/CD 流水线中自动检查版本号的递增，避免人为疏漏。",
            warning: "不要混用多种版本策略。一旦选择了语义化版本号，就全团队统一使用，否则版本比较和回滚会变成噩梦。",
        },
        {
            title: "3. MLflow Model Registry 深度解析",
            body: `MLflow Model Registry 是目前最流行的开源模型注册表解决方案。它在 MLflow Tracking 的基础上，为模型添加了版本管理和生命周期控制能力。你可以将 MLflow 注册表理解为模型的"应用商店"——每个模型有明确的名称、版本号、阶段状态（Staging、Production、Archived），以及完整的元数据记录。

注册表的核心工作流是：训练脚本调用 mlflow.log_model 将模型记录到 Tracking Server，然后使用 mlflow.register_model 将其提升到注册表中。注册后，模型进入 None 状态（未分类），随后通过状态转换 API 将其推进到 Staging 进行测试，最终推向 Production。这个流程天然支持多人协作，因为注册表是集中式的，所有团队成员都能看到模型的完整历史。

MLflow 注册表支持多种后端存储：文件系统和数据库适合小团队，SQL Server/PostgreSQL 适合企业部署，而 Databricks 则提供托管服务。无论哪种后端，API 保持一致，这为后续的迁移提供了灵活性。注册表还支持模型别名（Aliases），这是 v2.x 引入的功能，允许用语义化名称代替版本号引用模型。`,
            code: [
                {
                    lang: "python",
                    code: `import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from mlflow.tracking import MlflowClient

# 训练并自动注册模型
mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("churn_prediction")

with mlflow.start_run(run_name="rf_churn_v3") as run:
    model = RandomForestClassifier(n_estimators=200, max_depth=10)
    model.fit(X_train, y_train)

    mlflow.log_param("n_estimators", 200)
    mlflow.log_param("max_depth", 10)
    mlflow.log_metric("accuracy", 0.92)
    mlflow.log_metric("f1_score", 0.89)

    # 自动注册到 Model Registry
    model_info = mlflow.sklearn.log_model(
        model,
        artifact_path="model",
        registered_model_name="churn_predictor"
    )

print(f"Model URI: {model_info.model_uri}")
print(f"Run ID: {run.info.run_id}")`
                },
                {
                    lang: "python",
                    code: `# 模型注册后的生命周期管理
client = MlflowClient()

# 查看模型所有版本
versions = client.search_model_versions("name = 'churn_predictor'")
for v in sorted(versions, key=lambda x: int(x.version), reverse=True):
    print(f"Version {v.version}: stage={v.current_stage}, run={v.run_id}")

# 将最新版本推到 Production
latest = max(versions, key=lambda x: int(x.version))
client.transition_model_version_stage(
    name="churn_predictor",
    version=latest.version,
    stage="Production",
    archive_existing_versions=True  # 自动归档旧版本
)

# 使用别名引用（MLflow 2.x）
client.set_registered_model_alias(
    name="churn_predictor",
    alias="production",
    version=latest.version
)

# 通过别名加载模型
model_uri = "models:/churn_predictor@production"
loaded_model = mlflow.sklearn.load_model(model_uri)`
                }
            ],
            table: {
                headers: ["阶段", "含义", "自动触发条件", "访问权限"],
                rows: [
                    ["None", "刚注册，未分类", "无", "所有开发者"],
                    ["Staging", "测试/验证中", "CI 测试通过后", "测试团队"],
                    ["Production", "线上服务版本", "审批通过后", "只读(推理服务)"],
                    ["Archived", "已下线/弃用", "被新版本替换", "只读(审计)"],
                ]
            },
            mermaid: `graph LR
    A["log_model"] --> B["Version N
(None)"]
    B -->|"transition"| C["Staging"]
    C -->|"测试通过"| D["Production"]
    C -->|"测试失败"| E["Archived"]
    D -->|"新版本就绪"| F["Archive +
新版本 Production"]
    F --> G["Version N+1
(Production)"]`,
            tip: "使用 MLflow 别名功能代替硬编码版本号加载模型。这样可以在不修改推理代码的情况下切换模型版本。",
            warning: "archive_existing_versions=True 会自动将旧版本归档。在调用前确认旧版本确实不需要保留在生产状态，避免误操作导致服务中断。",
        },
        {
            title: "4. 模型元数据与标签管理",
            body: `模型元数据是模型版本的"身份证"。一个模型光有版本号远远不够，你需要知道它是谁训练的、什么时候训练的、用了哪些数据、指标表现如何、跑了什么硬件。这些信息构成了模型的完整画像，使得任何一个团队成员都能在不需要找原始训练者的情况下理解这个模型。

MLflow 的元数据系统分为两个层次：系统元数据和用户自定义标签。系统元数据由框架自动记录，包括创建时间、运行 ID、模型格式等。用户自定义标签则更加灵活，可以是业务维度（"适用于北美市场"）、技术维度（"使用 GPU 训练"）、或者合规维度（"已通过 GDPR 审查"）。标签的搜索能力使得在大量模型中快速定位特定模型成为可能。

元数据治理的关键是制定标签规范。如果每个工程师按照自己的习惯打标签，注册表很快会变成"标签垃圾场"。建议在项目初期就定义好标签命名空间、取值范围和必填字段。例如，强制要求所有生产模型必须包含 "data_version"、"metrics"、"owner" 三个标签，其他标签可选。这种约定保证了注册表的可搜索性和可维护性。`,
            code: [
                {
                    lang: "python",
                    code: `import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient(tracking_uri="http://localhost:5000")

# 注册时附加标签
mlflow.set_experiment("fraud_detection")
with mlflow.start_run() as run:
    model = train_fraud_model()  # 自定义训练函数

    mlflow.sklearn.log_model(model, "model")

    # 设置标签
    client.set_model_version_tag(
        name="fraud_detector",
        version="1",
        key="data_version",
        value="fraud_data_2026_q1"
    )
    client.set_model_version_tag(
        name="fraud_detector",
        version="1",
        key="training_time_hours",
        value="4.5"
    )
    client.set_model_version_tag(
        name="fraud_detector",
        version="1",
        key="gpu_type",
        value="A100-80GB"
    )
    client.set_model_version_tag(
        name="fraud_detector",
        version="1",
        key="compliance_approved",
        value="true"
    )`
                },
                {
                    lang: "python",
                    code: `# 基于标签搜索模型
def find_models_by_tag(tag_key: str, tag_value: str) -> list:
    """按标签搜索模型版本"""
    client = MlflowClient()
    all_versions = client.search_model_versions("name != ''")

    results = []
    for mv in all_versions:
        tags = client.get_model_version_by_name(
            name=mv.name, version=mv.version
        ).tags
        if tags.get(tag_key) == tag_value:
            results.append({
                "name": mv.name,
                "version": mv.version,
                "stage": mv.current_stage,
                "description": mv.description,
            })
    return results

# 使用示例：找到所有通过合规审批的模型
approved_models = find_models_by_tag("compliance_approved", "true")
for m in approved_models:
    print(f"{m['name']} v{m['version']} -> {m['stage']}")

# 找到所有使用 A100 训练的模型
gpu_models = find_models_by_tag("gpu_type", "A100-80GB")
print(f"Found {len(gpu_models)} models trained on A100")`
                }
            ],
            table: {
                headers: ["标签类别", "标签 Key 示例", "标签 Value 示例", "是否必填"],
                rows: [
                    ["数据来源", "data_version", "churn_data_2026_03", "是"],
                    ["性能指标", "auc_score", "0.91", "是"],
                    ["负责人", "owner", "ml-team@company.com", "是"],
                    ["计算资源", "gpu_type", "A100-80GB", "否"],
                    ["合规状态", "compliance_approved", "true/false", "是"],
                    ["业务场景", "business_unit", "retail/fintech/healthcare", "否"],
                ]
            },
            mermaid: `graph TD
    A["模型注册"] --> B["系统元数据
自动采集"]
    A --> C["自定义标签
手动设置"]
    B --> D["创建时间/运行ID/
模型格式"]
    C --> E["data_version
owner/compliance"]
    D --> F["完整模型画像"]
    E --> F
    F --> G["可搜索/可过滤
可审计"]`,
            tip: "在训练脚本中内置标签自动采集逻辑，避免人工遗忘。例如使用装饰器自动记录训练时长和数据版本。",
            warning: "标签值是字符串类型，不要用标签存储大段文本或二进制数据。对于复杂元数据，使用 MLflow 的 log_param 或外部文档链接。",
        },
        {
            title: "5. 模型过渡与审批流程",
            body: `模型从开发到上线不是"一键部署"那么简单，而是需要经历严格的审批流程。想象一下：你的工程师训练了一个新版本的推荐模型，AUC 提升了 2%。但 AUC 提升不等于业务指标提升，这个模型可能在某些用户群体上表现更差。因此，模型过渡（Transition）需要一套标准化的审批机制，确保每个进入 Production 的模型都经过了充分验证。

标准的模型审批流程包含三个关键环节：自动验证、人工审核和灰度发布。自动验证阶段，CI/CD 流水线会跑一系列预定义的测试——模型加载测试、输入输出格式测试、性能基准测试、以及 A/B 测试的预分析。人工审核阶段，由资深工程师或技术负责人审查训练报告、数据变更说明和业务影响评估。灰度发布阶段，模型先在 5% 的流量上运行，逐步放大到 100%。

MLflow 支持通过 Webhook 和 REST API 将审批流程集成到外部系统中。例如，当模型被请求从 Staging 过渡到 Production 时，可以触发一个 Webhook 通知审批系统，审批通过后再调用 transition API 完成状态转换。这种模式将 MLflow 的角色限定为"记录者"，而审批逻辑由企业现有的工单系统或自定义服务处理。`,
            code: [
                {
                    lang: "python",
                    code: `import requests
from mlflow.tracking import MlflowClient

class ModelApprovalPipeline:
    """模型审批流水线"""

    def __init__(self, mlflow_uri, approval_api_url):
        self.client = MlflowClient(mlflow_uri)
        self.approval_api = approval_api_url

    def request_production_approval(self, model_name: str, version: str):
        """请求将模型版本推向 Production"""
        # 1. 收集模型信息
        mv = self.client.get_model_version(model_name, version)
        run = self.client.get_run(mv.run_id)
        metrics = run.data.metrics
        params = run.data.params

        # 2. 提交审批请求
        approval_request = {
            "model_name": model_name,
            "version": version,
            "metrics": metrics,
            "params": params,
            "requester": "ml-pipeline@company.com",
            "auto_tests": {
                "load_test": True,
                "schema_test": True,
                "benchmark_passed": metrics.get("latency_p95", 999) < 100,
            }
        }

        response = requests.post(
            f"{self.approval_api}/request",
            json=approval_request
        )
        return response.json()["approval_id"]

    def on_approval_granted(self, approval_id: str, model_name: str, version: str):
        """审批通过后执行过渡"""
        self.client.transition_model_version_stage(
            name=model_name,
            version=version,
            stage="Production",
            archive_existing_versions=True
        )
        print(f"Model {model_name} v{version} -> Production")`
                },
                {
                    lang: "yaml",
                    code: `# GitHub Actions: 模型审批流水线
name: Model Approval Pipeline
on:
  pull_request:
    paths: ['models/**', 'training/**']

jobs:
  model-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Load and test model
        run: |
          python scripts/validate_model.py \\
            --model models/latest.pkl \\
            --test-data tests/validation_data.csv

      - name: Performance benchmark
        run: |
          python scripts/benchmark.py \\
            --threshold-latency 100 \\
            --threshold-accuracy 0.85

      - name: Request MLflow promotion
        if: success()
        run: |
          python scripts/request_promotion.py \\
            --model churn_predictor \\
            --version \\\${{ github.run_number }} \\
            --mlflow-uri \${{ secrets.MLFLOW_URI }}

      - name: Notify team
        if: always()
        uses: slackapi/slack-notify@v1
        with:
          channel: "#ml-reviews"
          message: "Model review ready: \${{ github.run_number }}"`
                }
            ],
            table: {
                headers: ["审批阶段", "检查项", "通过标准", "负责人"],
                rows: [
                    ["自动验证", "模型加载/格式/性能", "所有测试用例通过", "CI 系统"],
                    ["数据审查", "训练数据变更说明", "数据版本已记录", "数据工程师"],
                    ["业务评审", "A/B 测试报告", "核心指标正向", "业务负责人"],
                    ["合规审批", "隐私/公平性检查", "合规标签为 true", "合规团队"],
                    ["灰度发布", "小流量运行结果", "错误率 < 0.1%", "运维团队"],
                ]
            },
            mermaid: `graph LR
    A["Staging"] --> B["自动验证"]
    B -->|"通过"| C["数据审查"]
    B -->|"失败"| X["驳回修复"]
    C -->|"通过"| D["业务评审"]
    D -->|"通过"| E["合规审批"]
    E -->|"通过"| F["灰度发布"]
    F -->|"通过"| G["Production"]
    F -->|"异常"| H["回滚到
上一版本"]`,
            tip: "将审批流程自动化到最大程度。自动验证应该覆盖 80% 以上的检查项，人工只关注剩余 20% 需要专业判断的部分。",
            warning: "跳过审批流程直接推 Production 是 ML 系统的最大风险之一。即使在紧急情况下，也应走快速审批通道而不是完全绕过审批。",
        },
        {
            title: "6. 模型血缘与可追溯性",
            body: `模型血缘（Model Lineage）回答了一个核心问题：这个模型从哪里来？它由什么数据训练而成？使用了哪些特征？经过了哪些处理步骤？当线上模型出现问题时，血缘信息能让你从模型反向追溯到训练数据和代码，快速定位根因。这就像食品的溯源系统——你吃到一块牛排，可以通过标签查到它来自哪个牧场、吃了什么饲料、经过哪些检疫环节。

血缘追踪的挑战在于 ML 流水线的复杂性。一个模型可能经过了数据收集、清洗、特征工程、模型训练、超参数搜索、模型评估等多个阶段，每个阶段都有输入和输出。手动记录这些信息不现实，因此需要自动化的血缘追踪工具。MLflow 通过运行 ID 将模型版本与训练运行关联，但更完整的血缘需要借助 OpenLineage 或 Marquez 这样的专用系统。

可追溯性的最高境界是端到端的自动化记录。从数据进入系统的那一刻起，每一个变换步骤都被记录下来，最终汇聚成一条完整的"数据流图"。当某个上游数据源出现问题时，系统能自动识别出所有受影响的模型版本，并发出预警。这种能力在金融、医疗等受监管行业中是硬性要求。`,
            code: [
                {
                    lang: "python",
                    code: `from mlflow.tracking import MlflowClient
import networkx as nx

class ModelLineageTracker:
    """构建模型血缘图谱"""

    def __init__(self, mlflow_uri):
        self.client = MlflowClient(mlflow_uri)
        self.graph = nx.DiGraph()

    def build_lineage(self, model_name: str, version: str) -> nx.DiGraph:
        """为指定模型版本构建血缘图"""
        mv = self.client.get_model_version(model_name, version)
        run_id = mv.run_id
        run = self.client.get_run(run_id)

        # 添加模型节点
        model_node = f"{model_name}:v{version}"
        self.graph.add_node(model_node, type="model", version=version)

        # 关联运行参数
        for key, value in run.data.params.items():
            if "data" in key.lower() or "path" in key.lower():
                self.graph.add_node(value, type="data_source")
                self.graph.add_edge(value, model_node, relation="trained_on")

        # 关联输入数据集
        for input_uri in run.inputs.dataset_inputs or []:
            ds_name = input_uri.dataset.name
            self.graph.add_node(ds_name, type="dataset",
                              digest=input_uri.dataset.digest)
            self.graph.add_edge(ds_name, model_node, relation="input")

        return self.graph

    def find_impact(self, dataset_name: str) -> list:
        """找出受某数据集影响的所有模型"""
        affected = []
        for node in self.graph.nodes:
            if node == dataset_name:
                for successor in nx.descendants(self.graph, node):
                    if self.graph.nodes[successor].get("type") == "model":
                        affected.append(successor)
        return affected`
                },
                {
                    lang: "python",
                    code: `# 使用 lineage tracker
tracker = ModelLineageTracker("http://localhost:5000")

# 构建某个模型的血缘图
graph = tracker.build_lineage("churn_predictor", "3")

# 可视化
import matplotlib.pyplot as plt

pos = nx.spring_layout(graph, seed=42)
node_colors = {
    "model": "#3498db",
    "data_source": "#2ecc71",
    "dataset": "#e74c3c",
}

colors = [node_colors.get(graph.nodes[n].get("type", ""), "#95a5a6")
          for n in graph.nodes()]

plt.figure(figsize=(12, 8))
nx.draw(graph, pos, node_color=colors, with_labels=True,
        node_size=2000, font_size=8, edge_color="#bdc3c7")
plt.title("Model Lineage Graph")
plt.savefig("lineage_graph.png", dpi=150)

# 数据变更影响分析
if "s3://data-lake/churn/v2.parquet" in graph.nodes:
    affected = tracker.find_impact("s3://data-lake/churn/v2.parquet")
    print(f"Data change affects {len(affected)} models: {affected}")`
                }
            ],
            table: {
                headers: ["血缘层级", "追踪内容", "自动记录工具", "手动补充内容"],
                rows: [
                    ["数据层", "原始数据源、版本号", "DVC/数据目录", "数据质量说明"],
                    ["特征层", "特征工程代码、转换逻辑", "特征存储系统", "业务含义说明"],
                    ["训练层", "运行 ID、超参数、代码版本", "MLflow/W&B", "训练策略说明"],
                    ["部署层", "部署时间、服务地址、流量", "CI/CD 系统", "回滚预案"],
                    ["业务层", "关联的 A/B 实验、业务指标", "实验平台", "业务影响分析"],
                ]
            },
            mermaid: `graph TD
    A["原始数据
s3://raw/churn/"] --> B["特征工程
feature_store"]
    B --> C["训练运行
run_id: abc123"]
    C --> D["模型权重
churn_predictor:v3"]
    D --> E["部署服务
/api/v1/predict"]
    E --> F["业务指标
A/B 实验结果"]
    A -.->|"血缘追溯"| D
    B -.->|"血缘追溯"| D
    C -.->|"血缘追溯"| D`,
            tip: "在 CI/CD 流水线中自动记录血缘信息，而不是事后补填。每次训练运行都应将完整血缘写入元数据存储。",
            warning: "血缘图可能变得非常庞大和复杂。对于超过 100 个节点的图，建议按时间窗口或模型系列进行切片查看，而不是一次性加载全量数据。",
        },
        {
            title: "7. 实战：完整模型注册表工作流",
            body: `前面各章覆盖了模型版本管理的各个维度，现在把它们整合成一个完整的生产工作流。这个工作流模拟了一个典型的数据科学团队从训练到部署模型的全过程：训练脚本自动记录所有元数据、模型注册到 MLflow 注册表、通过自动化审批流程、最终推向生产并持续监控。

我们的示例场景是一个客户流失预测系统。训练流水线每次运行都会生成一个新的模型版本，自动注册到 MLflow，并触发一系列验证测试。只有通过所有测试的模型才会被标记为"推荐上线"，等待人工最终审批。一旦获批，模型自动部署到生产环境，旧模型被优雅地归档。

这个工作流的关键在于"自动化一切可以自动化的，人工只处理需要判断的"。模型注册、元数据采集、自动测试、版本过渡的 API 调用全部由流水线完成。人工只需要在关键决策点（业务评审、合规审批）介入。这种半自动化的模式既保证了效率，又保留了人工把关的安全网。`,
            code: [
                {
                    lang: "python",
                    code: `"""
complete_model_pipeline.py - 完整模型注册表工作流
运行: python complete_model_pipeline.py --env staging
"""
import argparse
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score
from mlflow.tracking import MlflowClient

MODEL_NAME = "churn_predictor"

def train_and_register(env: str = "staging"):
    """训练、评估、注册、推进的完整流程"""
    mlflow.set_tracking_uri("http://localhost:5000")
    mlflow.set_experiment("churn_prediction_prod")

    # 1. 训练模型
    with mlflow.start_run(run_name=f"churn_{env}") as run:
        model = RandomForestClassifier(n_estimators=300, max_depth=12)
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)

        # 记录所有元数据
        mlflow.log_param("n_estimators", 300)
        mlflow.log_param("max_depth", 12)
        mlflow.log_param("env", env)
        mlflow.log_metric("accuracy", acc)
        mlflow.log_metric("f1_score", f1)

        # 注册模型
        mlflow.sklearn.log_model(
            model, "model",
            registered_model_name=MODEL_NAME
        )

        print(f"Run {run.info.run_id} | acc={acc:.4f} | f1={f1:.4f}")
        return run.info.run_id, acc, f1

def promote_to_production(run_id: str, acc_threshold=0.90):
    """自动审批并推向生产"""
    client = MlflowClient()
    versions = client.search_model_versions(f"run_id = '{run_id}'")

    if not versions:
        raise ValueError("No registered model found for this run")

    mv = versions[0]

    # 自动验证
    if acc_threshold and float(mv.tags.get("accuracy", 0)) < acc_threshold:
        print(f"Accuracy below threshold, not promoting")
        return

    # 推向 Production
    client.transition_model_version_stage(
        name=MODEL_NAME,
        version=mv.version,
        stage="Production",
        archive_existing_versions=True
    )
    print(f"{MODEL_NAME} v{mv.version} -> Production")`
                },
                {
                    lang: "bash",
                    code: `# ============================================
# 完整工作流演练
# ============================================

# Step 1: 训练并注册到 Staging
python complete_model_pipeline.py --env staging
# Run a1b2c3d | acc=0.9234 | f1=0.8912
# Registered as churn_predictor v5

# Step 2: 查看注册表状态
mlflow models list --name churn_predictor
# Version 1: Archived
# Version 2: Archived
# Version 3: Archived
# Version 4: Production
# Version 5: Staging

# Step 3: 验证 Staging 模型
python -c "
import mlflow
model = mlflow.sklearn.load_model('models:/churn_predictor@staging')
print(f'Loaded staging model: {model}')
# Run validation tests
python tests/model_validation.py --model 'models:/churn_predictor@staging'
"

# Step 4: 审批通过后推到 Production
python -c "
from mlflow.tracking import MlflowClient
client = MlflowClient()
client.transition_model_version_stage(
    name='churn_predictor',
    version='5',
    stage='Production',
    archive_existing_versions=True
)
"
# churn_predictor v5 -> Production

# Step 5: 在推理服务中加载生产模型
python inference_server.py \\
  --model-uri models:/churn_predictor@production \\
  --port 8080`
                }
            ],
            table: {
                headers: ["步骤", "操作", "工具", "输出"],
                rows: [
                    ["1. 训练", "运行训练脚本", "Python + sklearn", "模型文件 + MLflow Run"],
                    ["2. 注册", "自动注册到注册表", "MLflow log_model", "模型版本记录"],
                    ["3. 验证", "自动测试集验证", "pytest + 自定义脚本", "测试报告"],
                    ["4. 审批", "人工审核+审批", "Webhook + 工单系统", "审批通过记录"],
                    ["5. 部署", "推向 Production", "MLflow transition API", "服务地址更新"],
                    ["6. 监控", "持续监控性能", "Prometheus + Grafana", "监控仪表盘"],
                ]
            },
            mermaid: `sequenceDiagram
    participant D as 数据工程师
    participant P as 训练流水线
    participant M as MLflow Registry
    participant A as 审批系统
    participant S as 推理服务

    D->>P: 触发训练
    P->>P: 训练模型
    P->>M: log_model + register
    M-->>D: 返回版本号 v5
    P->>A: 请求审批
    A->>A: 自动验证 + 人工审核
    A-->>P: 审批通过
    P->>M: transition -> Production
    M->>S: 通知新模型就绪
    S->>M: 加载 models:/model@production
    S-->>D: 部署完成通知`,
            tip: "将整个工作流封装为一条命令（如 make deploy-model），降低操作门槛。新人也能通过一条命令完成从训练到部署的全过程。",
            warning: "生产环境的模型切换需要考虑服务不中断。使用蓝绿部署或金丝雀发布策略，而不是一次性替换所有实例。MLflow 的模型别名功能可以帮助实现无缝切换。",
        },
    ],
};
