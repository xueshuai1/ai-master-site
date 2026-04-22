import { Article } from '../knowledge';

export const article: Article = {
    id: "aieng-002",
    title: "模型版本管理与实验追踪",
    category: "aieng",
    tags: ["实验追踪", "MLflow", "版本管理"],
    summary: "从 MLflow 到 W&B，掌握 ML 实验管理与模型版本控制",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么需要实验追踪",
            body: `在机器学习项目中，实验的可复现性是最容易被忽视却最重要的问题之一。当你调整了学习率、更换了数据预处理方式、修改了模型层数，如果不记录这些变化，一周后你根本不知道哪个配置产生了最好的结果。

实验追踪的核心价值在于建立因果链：什么输入、什么参数、什么代码版本，最终产出了什么指标。这不仅仅是为了论文发表时的可复现要求，更是团队作的基础——当多个工程师同时跑几十个实验时，没有追踪系统就等于蒙着眼睛跑马拉松。

更深层的问题是模型资产管理。训练好的模型文件本身没有意义，除非你知道它是用什么数据训练的、精度是多少、部署过没有、是否需要回滚。没有版本管理的模型就像没有 Git 的代码库，迟早会出事故。`,
            code: [
                {
                    lang: "python",
                    code: `# 典型痛点：没有实验追踪时的混乱代码
import json
import os

# 手动记录实验参数到 JSON 文件
def save_experiment_manual(params, metrics, model_path):
    experiment = {
        "params": params,
        "metrics": metrics,
        "model": model_path,
        "timestamp": "2024-03-15_14:30",  # 手动填写，容易出错
        "note": "这次调了 learning rate 试试",  # 非结构化备注
    }
    with open("experiments/exp_003.json", "w") as f:
        json.dump(experiment, f)

# 问题：没有代码版本、没有数据版本、无法比较`,
                },
                {
                    lang: "bash",
                    code: `# 开发者常见的"临时"实验管理方式
# 用文件名区分不同实验——很快失控
models/
  model_final.pth
  model_final_v2.pth
  model_final_v2_真的最终.pth
  model_final_改lr0.001.pth

logs/
  log_周一跑的那个.txt
  log_调大batch的.txt

# 三个月后：没人知道哪个模型最好`,
                },
            ],
            table: {
                headers: ["痛点", "手动管理", "实验追踪系统", "风险等级"],
                rows: [
                    ["参数记录", "口头/笔记/文件名", "自动记录所有超参数", "🔴 高"],
                    ["结果比较", "肉眼对比日志", "仪表盘可视化比较", "🟡 中"],
                    ["模型版本", "文件名加后缀", "自动版本注册+阶段管理", "🔴 高"],
                    ["可复现性", "靠记忆和笔记", "代码+数据+参数完整绑定", "🔴 高"],
                ],
            },
            mermaid: `graph TD
    A["实验需求"] --> B["调整参数"]
    B --> C["运行训练"]
    C --> D["记录指标"]
    D --> E["保存模型"]
    E --> F["比较结果"]
    F -->|选最优| G["注册模型"]
    F -->|不理想| B
    style G fill:#4CAF50,color:#1e293b,stroke:#388E3C`,
            tip: "实验追踪系统不是锦上添花，而是 ML 项目的必需品。项目第一天就配置好，比后期迁移成本低 100 倍。",
        },
        {
            title: "2. MLflow 核心组件",
            body: `MLflow 是 Databricks 开源的 ML 生命周期管理平台，由四个核心组件构成。Tracking 组件负责记录实验参数、代码版本、指标和模型文件，是日常使用频率最高的部分。Projects 组件定义了可复现的打包格式，让实验可以在任何环境中运行。

Models 组件提供了统一的模型格式，支持 TensorFlow、PyTorch、Scikit-learn 等主流框架的标准化保存和加载。Registry 组件则在此基础上增加了模型版本管理和生命周期阶段（Staging/Production/Archived），是模型从实验走向生产的关键桥梁。

这四个组件既独立又互补。你可以只使用 Tracking 记录实验，也可以将四个组件组合起来形成完整的 MLOps 流水线。理解每个组件的职责和它们之间的协作关系，是高效使用 MLflow 的前提。`,
            code: [
                {
                    lang: "python",
                    code: `import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# 启动 MLflow Tracking
mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("rf_classifier")

with mlflow.start_run() as run:
    # 自动记录参数
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 10)

    # 训练模型
    model = RandomForestClassifier(n_estimators=100, max_depth=10)
    model.fit(X_train, y_train)

    # 记录指标
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    mlflow.log_metric("accuracy", acc)

    # 自动保存模型（包含依赖信息）
    mlflow.sklearn.log_model(model, "model")
    print(f"Run ID: {run.info.run_id}")`,
                },
                {
                    lang: "yaml",
                    code: `# MLflow Project 定义文件 (MLproject)
name: rf_training

conda_env: conda.yaml

entry_points:
  main:
    parameters:
      n_estimators: {type: int, default: 100}
      max_depth: {type: int, default: 10}
      data_path: {type: string}
    command: "python train.py
            --n_estimators {n_estimators}
            --max_depth {max_depth}
            --data_path {data_path}"

# 运行命令：
# mlflow run . -P n_estimators=200 -P data_path=./data.csv`,
                },
            ],
            table: {
                headers: ["组件", "职责", "核心 API", "适用场景"],
                rows: [
                    ["Tracking", "实验参数与指标记录", "log_param/log_metric/log_model", "日常实验记录"],
                    ["Projects", "可复现的实验打包", "MLproject 定义 + conda 环境", "跨环境复现实验"],
                    ["Models", "统一模型格式", "pyfunc/sklearn/tensorflow 接口", "模型加载与推理"],
                    ["Registry", "版本与阶段管理", "create_version/transition_stage", "生产部署流水线"],
                ],
            },
            mermaid: `graph LR
    subgraph "MLflow 架构"
        A["Tracking Server"] --> B["实验记录"]
        A --> C["指标存储"]
        A --> D["模型仓库"]
        E["Projects"] -.->|打包| A
        F["Registry"] -.->|版本| D
    end
    style A fill:#1976D2,stroke:#0D47A1
    style B fill:#0c4a6e
    style C fill:#0c4a6e
    style D fill:#0c4a6e`,
            warning: "MLflow Tracking 默认使用本地文件系统存储，团队协作时必须配置远程后端（如 S3 + MySQL），否则数据会分散在各开发者的机器上。",
        },
        {
            title: "3. 实验记录与可视化",
            body: `MLflow Tracking 的核心设计哲学是将每次实验抽象为一个 Run，每个 Run 包含参数、指标、标签和产物四个维度的数据。参数是不可变的配置项，如学习率和批次大小；指标是数值型输出，可以在训练过程中持续追加，用于绘制学习曲线。

可视化方面，MLflow 提供了内置的 UI 界面，支持多维度筛选、散点图比较、并行坐标图分析。你可以在数千次实验中快速定位最佳配置，查看每次运行的完整上下文，包括代码 Git commit、conda 环境依赖和输入数据版本。

高级用法包括嵌套 Run（父 Run 管理超参数搜索，子 Run 记录每次尝试）、自动日志（一行代码自动捕获框架的训练指标）、以及自定义回调函数在训练过程中实时上报指标。这些能力让 MLflow 能够适配从简单实验到复杂超参搜索的各种场景。`,
            code: [
                {
                    lang: "python",
                    code: `import mlflow
from sklearn.model_selection import ParameterGrid

# 嵌套 Run 进行超参数搜索
param_grid = {
    "n_estimators": [50, 100, 200],
    "max_depth": [5, 10, None],
    "min_samples_split": [2, 5],
}

with mlflow.start_run(run_name="rf_grid_search") as parent:
    for params in ParameterGrid(param_grid):
        with mlflow.start_run(nested=True) as child:
            mlflow.log_params(params)
            model = RandomForestClassifier(**params)
            model.fit(X_train, y_train)

            acc = model.score(X_test, y_test)
            mlflow.log_metric("test_accuracy", acc)

            # 标记最优模型
            if acc > 0.92:
                mlflow.sklearn.log_model(model, "model")
                mlflow.set_tag("is_best", "true")`,
                },
                {
                    lang: "python",
                    code: `# 使用 MLflow REST API 查询实验
import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient("http://localhost:5000")
experiment = client.get_experiment_by_name("rf_classifier")

# 查询所有 Run 并按准确率排序
runs = client.search_runs(
    experiment_ids=[experiment.experiment_id],
    order_by=["metrics.accuracy DESC"],
    max_results=10,
)

for run in runs:
    print(f"Run: {run.info.run_id[:8]}")
    print(f"  Accuracy: {run.data.metrics['accuracy']:.4f}")
    print(f"  Params: {run.data.params}")`,
                },
            ],
            table: {
                headers: ["数据类别", "API", "可变性", "示例"],
                rows: [
                    ["参数", "log_param", "不可变", "learning_rate: 0.001"],
                    ["指标", "log_metric", "可追加", "accuracy: 0.953"],
                    ["标签", "set_tag", "可修改", "model_type: random_forest"],
                    ["产物", "log_artifact", "追加", "confusion_matrix.png"],
                ],
            },
            mermaid: `graph TD
    A["start_run"] --> B["log_param"]
    A --> C["log_metric"]
    A --> D["log_artifact"]
    A --> E["log_model"]
    B --> F["MLflow Server"]
    C --> F
    D --> F
    E --> F
    F --> G["UI Dashboard"]
    F --> H["REST API"]
    G --> I["可视化对比"]
    H --> J["程序化查询"]`,
            tip: "使用 mlflow.autolog() 可以在训练框架中自动捕获指标和参数，减少手动记录的工作量，同时保证不遗漏关键信息。",
        },
        {
            title: "4. 模型版本注册",
            body: `MLflow Model Registry 在 Tracking 的基础上增加了版本控制和生命周期管理。每次通过 register_model 保存模型时，Registry 会自动分配递增的版本号，形成模型的版本历史。这让你可以追溯任何一个生产模型是从哪次实验、什么参数、什么数据训练而来的。

版本之外的另一个核心概念是阶段（Stage）。模型从 None（刚注册）到 Staging（待验证）到 Production（生产环境）再到 Archived（已归档），每个阶段的转换都需要明确的审批。你可以为阶段转换配置自动化规则或手动审核流程，确保只有经过充分验证的模型才能进入生产。

Registry 还支持模型描述、注释和标签。团队成员可以在模型版本上添加说明，记录为什么选择这个版本、验证结果如何、有没有已知问题。这些信息对于模型的长期维护至关重要。`,
            code: [
                {
                    lang: "python",
                    code: `import mlflow

# 从已有 Run 注册模型到 Registry
result = mlflow.register_model(
    model_uri="runs:/<run_id>/model",
    name="fraud_detection_model",
)

print(f"Registered model version: {result.version}")
print(f"Current stage: {result.status}")

# 阶段转换：Staging -> Production
from mlflow.tracking import MlflowClient

client = MlflowClient()
client.transition_model_version_stage(
    name="fraud_detection_model",
    version=result.version,
    stage="Production",
)

# 为模型版本添加描述
client.update_model_version(
    name="fraud_detection_model",
    version=result.version,
    description="V1.2: 加入时间特征，AUC 提升 3.2%",
)`,
                },
                {
                    lang: "python",
                    code: `# 从 Registry 加载生产模型
import mlflow.pyfunc

# 加载最新版本
model_uri = "models:/fraud_detection_model/Production"
model = mlflow.pyfunc.load_model(model_uri)

# 批量推理
predictions = model.predict(new_data)

# 也可以加载特定版本
model_v1 = mlflow.pyfunc.load_model(
    "models:/fraud_detection_model/1"
)

# 对比两个版本的预测差异
pred_prod = model.predict(X_test)
pred_v1 = model_v1.predict(X_test)
diff = (pred_prod != pred_v1).mean()
print(f"版本间预测差异率: {diff:.2%}")`,
                },
            ],
            table: {
                headers: ["阶段", "含义", "自动化", "使用场景"],
                rows: [
                    ["None", "刚注册，未分类", "自动", "实验刚完成"],
                    ["Staging", "待验证", "CI/CD 触发测试", "QA 测试环境"],
                    ["Production", "生产部署", "审批流程通过", "线上服务"],
                    ["Archived", "已下线", "手动标记", "模型退役"],
                ],
            },
            mermaid: `graph LR
    A["None 新注册"] --> B["Staging 待验证"]
    B --> C["Production 生产"]
    C --> D["Archived 归档"]
    B -.->|测试失败| A
    C -.->|回滚| B
    style C fill:#4CAF50,color:#1e293b,stroke:#388E3C
    style A fill:#FFC107
    style B fill:#2196F3,color:#1e293b
    style D fill:#374151`,
            warning: "模型版本一旦进入 Production 阶段就不能直接删除。必须先将阶段转换为 Archived，然后才能删除。这是防止误删生产模型的安全机制。",
        },
        {
            title: "5. Weights & Biases 对比",
            body: `Weights & Biases（W&B）是 MLflow 最强大的竞争对手，两者在设计理念上有显著差异。MLflow 强调开源、自托管和与 ML 生态的深度集成，是 Databricks 生态的核心组件。W&B 则采用 SaaS 优先策略，提供开箱即用的协作体验和更精致的可视化效果。

在实验追踪方面，W&B 的 wandb.log API 更加简洁，支持更丰富的媒体类型（图片、视频、3D 模型、音频）。它的实时仪表盘和团队协作功能优于 MLflow，特别适合深度学习研究场景。MLflow 则在模型管理和生产部署方面更成熟，Model Registry 是 W&B 尚未完全覆盖的领域。

选择标准取决于团队需求：如果侧重实验协作和可视化体验，W&B 是更好的选择；如果需要完整的 MLOps 流水线和自托管能力，MLflow 更合适。很多团队同时使用两者——W&B 用于实验探索，MLflow 用于模型管理。`,
            code: [
                {
                    lang: "python",
                    code: `# Weights & Biases 实验记录示例
import wandb

# 初始化实验
wandb.init(
    project="my-ml-project",
    config={
        "learning_rate": 0.001,
        "epochs": 100,
        "batch_size": 32,
        "architecture": "ResNet-50",
    },
)

# 训练循环中记录指标
for epoch in range(wandb.config.epochs):
    loss, acc = train_one_epoch()
    wandb.log({"loss": loss, "accuracy": acc, "epoch": epoch})

    # 记录图片（如混淆矩阵、特征图）
    wandb.log({"confusion_matrix": wandb.plot.confusion_matrix()})

# 保存模型到 W&B Artifacts
artifact = wandb.Artifact("model-weights", type="model")
artifact.add_file("best_model.pth")
wandb.log_artifact(artifact)`,
                },
                {
                    lang: "python",
                    code: `# MLflow vs W&B API 对比
# MLflow 记录方式
import mlflow
mlflow.log_param("lr", 0.001)
mlflow.log_metric("loss", 0.23)
mlflow.log_artifact("model.pkl")

# W&B 记录方式
import wandb
wandb.config.lr = 0.001
wandb.log({"loss": 0.23})
wandb.save("model.pkl")

# MLflow 需要更多 API 但更细粒度
# W&B 更简洁但抽象层级更高
# 两者都能记录参数、指标、模型
# 选择取决于团队偏好和基础设施`,
                },
            ],
            table: {
                headers: ["特性", "MLflow", "Weights & Biases", "胜出方"],
                rows: [
                    ["开源", "完全开源 Apache 2.0", "核心闭源，部分开源", "MLflow"],
                    ["自托管", "原生支持", "有限支持", "MLflow"],
                    ["可视化", "基础仪表盘", "高级实时可视化", "W&B"],
                    ["模型 Registry", "完善的版本管理", "Artifacts 系统", "MLflow"],
                    ["团队协作", "基础", "优秀（实时同步）", "W&B"],
                    ["框架集成", "全框架", "深度学习优先", "平手"],
                ],
            },
            mermaid: `graph TD
    A["选择实验平台"] --> B{"需要自托管?"}
    B -->|是| C[MLflow]
    B -->|否| D{"侧重什么?"}
    D -->|协作+可视化| E[W&B]
    D -->|模型管理| C
    D -->|深度学习研究| E
    D -->|生产部署| C
    style C fill:#4CAF50,color:#1e293b
    style E fill:#2196F3,color:#1e293b`,
            tip: "不需要二选一。很多团队用 W&B 做实验探索（它的可视化更好），用 MLflow 做模型管理（它的 Registry 更成熟），两者互补而非互斥。",
        },
        {
            title: "6. DVC 数据版本控制",
            body: `模型版本管理只解决了一半问题——如果训练数据变了，同样的代码和参数也会产出不同的模型。DVC（Data Version Control）填补了这个空白，它用类似 Git 的方式管理数据和模型文件，但不会把这些大文件存入 Git 仓库。

DVC 的工作原理是将数据文件的内容哈希值存储为 .dvc 跟踪文件（很小，可以提交到 Git），而实际数据存放在远程存储（S3、GCS、NAS 等）中。当你 git checkout 切换分支时，DVC 会根据 .dvc 文件自动拉取对应版本的数据。这使得数据集和代码的变更可以同步管理。

DVC 与 MLflow 可以无缝集成。你可以在 DVC pipeline 中定义数据处理和训练步骤，同时用 MLflow 记录每次 pipeline 运行的参数和指标。这种组合实现了真正的端到端可复现性：代码版本 + 数据版本 + 实验参数 + 模型产物，四者完整绑定。`,
            code: [
                {
                    lang: "bash",
                    code: `# DVC 基础工作流
# 1. 初始化 DVC
dvc init

# 2. 跟踪数据文件
dvc add data/train.csv
dvc add data/test.csv

# 3. 提交到 Git（只提交 .dvc 文件）
git add data/train.csv.dvc data/test.csv.dvc
git commit -m "Add dataset v1"

# 4. 推送数据到远程存储
dvc remote add -d myremote s3://mybucket/dvcstore
dvc push

# 5. 切换分支时拉取对应数据
git checkout experiment-branch
dvc checkout`,
                },
                {
                    lang: "yaml",
                    code: `# DVC Pipeline 定义 (dvc.yaml)
stages:
  prepare:
    cmd: python prepare.py data/raw/ data/processed/
    deps:
      - data/raw/
      - prepare.py
    outs:
      - data/processed/

  train:
    cmd: python train.py --config config.yaml
    deps:
      - data/processed/
      - train.py
      - config.yaml
    outs:
      - models/model.pkl
    metrics:
      - metrics.json:
          cache: false

# 运行整个 pipeline：
# dvc repro

# 运行特定阶段：
# dvc repro train`,
                },
            ],
            table: {
                headers: ["工具", "管理对象", "存储方式", "与 Git 关系"],
                rows: [
                    ["Git", "代码文件", "直接存储", "原生"],
                    ["DVC", "数据和模型文件", "远程存储+哈希引用", "Git 插件"],
                    ["MLflow", "实验记录和模型", "Tracking Server", "记录 Git commit"],
                    ["Git LFS", "大文件", "远程存储", "Git 扩展"],
                ],
            },
            mermaid: `graph TD
    A["代码变更"] --> B["Git commit"]
    C["数据变更"] --> D["DVC add"]
    D --> E[".dvc 文件"]
    E --> B
    D --> F["远程存储 S3/GCS"]
    B --> G["完整可复现快照"]
    F -.->|按需拉取| G
    style G fill:#4CAF50,color:#1e293b,stroke:#388E3C`,
            warning: "DVC 不会自动同步 Git 和远程存储。切换 Git 分支后必须运行 dvc checkout 来同步数据。忘记这一步会导致代码和数据版本不匹配，产生难以调试的错误。",
        },
        {
            title: "7. 实战：完整 MLflow 工作流",
            body: `让我们将前面的知识整合为一个完整的 MLflow 工作流。这个工作流涵盖了从实验配置、训练记录、模型注册到生产加载的全生命周期，适用于一个典型的分类任务场景。

首先配置 MLflow 环境，包括设置 Tracking URI、创建实验、定义超参数搜索空间。然后运行训练，自动记录所有参数和指标。训练完成后，将最佳模型注册到 Model Registry，经过验证后推入生产阶段。最后在生产服务中通过 Registry 加载模型，实现模型更新时服务代码无需修改的优雅架构。

这个工作流的关键在于每个环节之间的松耦合。训练脚本不需要知道模型会被如何部署，服务代码不需要知道模型是怎么训练的，两者通过 Model Registry 这一契约层解耦。这种架构使得 ML 团队可以独立迭代训练和服务，是 MLOps 成熟度的重要标志。`,
            code: [
                {
                    lang: "python",
                    code: `"""
完整的 MLflow 工作流示例
涵盖: 实验配置 -> 训练记录 -> 模型注册 -> 生产加载
"""
import mlflow
import mlflow.sklearn
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report
import argparse

def train_and_register(config):
    # 1. 设置实验
    mlflow.set_experiment("gbm_production")

    # 2. 运行训练并记录
    with mlflow.start_run() as run:
        mlflow.log_params(config)

        model = GradientBoostingClassifier(
            n_estimators=config["n_estimators"],
            learning_rate=config["learning_rate"],
            max_depth=config["max_depth"],
        )
        model.fit(X_train, y_train)

        # 记录多项指标
        for split_name, X, y in [("train", X_train, y_train),
                                  ("test", X_test, y_test)]:
            preds = model.predict(X)
            report = classification_report(y, preds, output_dict=True)
            for metric_name in ["accuracy", "f1-score", "precision"]:
                mlflow.log_metric(f"{split_name}_{metric_name}",
                                  report[metric_name])

        # 3. 注册模型
        mlflow.sklearn.log_model(model, "model",
            registered_model_name="gbm_classifier")

    return run.info.run_id`,
                },
                {
                    lang: "python",
                    code: `"""
生产服务：从 Model Registry 加载模型
"""
import mlflow.pyfunc
from flask import Flask, request, jsonify

app = Flask(__name__)

# 启动时加载生产模型（无需硬编码版本号）
MODEL_URI = "models:/gbm_classifier/Production"
model = mlflow.pyfunc.load_model(MODEL_URI)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    features = data["features"]
    predictions = model.predict(features)
    return jsonify({"predictions": predictions.tolist()})

@app.route("/reload", methods=["POST"])
def reload():
    """热更新模型：从 Registry 重新加载最新版本"""
    global model
    model = mlflow.pyfunc.load_model(MODEL_URI)
    return {"status": "reloaded"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)`,
                },
            ],
            table: {
                headers: ["阶段", "工具", "产出", "验证方式"],
                rows: [
                    ["数据准备", "DVC pipeline", "处理后的数据集", "数据质量检查"],
                    ["实验训练", "MLflow Tracking", "指标+模型文件", "交叉验证"],
                    ["模型注册", "Model Registry", "版本化模型", "A/B 测试"],
                    ["生产部署", "MLflow pyfunc + API", "推理服务", "监控告警"],
                ],
            },
            mermaid: `sequenceDiagram
    participant D as DVC
    participant T as MLflow Tracking
    participant R as Model Registry
    participant S as Production Service

    D->>T: 提供数据版本
    T->>T: 记录参数+指标
    T->>R: 注册模型版本
    R->>R: 阶段: None -> Staging
    R->>R: 阶段: Staging -> Production
    S->>R: 加载 Production 模型
    R-->>S: 返回模型文件
    Note over S: 服务运行中
    R-->>S: 新版本推送通知
    S->>R: 重新加载模型`,
            tip: "在 CI/CD 流水线中集成 MLflow：每次代码提交自动触发训练，指标达标后自动注册并推进到 Staging 阶段，人工审批后进入 Production。这是 MLOps 自动化的最佳实践。",
        },
    ],
};
