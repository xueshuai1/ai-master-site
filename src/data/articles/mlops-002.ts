import { Article } from '../knowledge';

export const article: Article = {
    id: "mlops-002",
    title: "MLOps 实战：模型版本管理与实验追踪",
    category: "mlops",
    tags: ["模型版本管理", "实验追踪", "MLflow", "WandB"],
    summary: "从 MLflow 到 WandB，掌握机器学习实验追踪与模型版本管理的最佳实践",
    date: "2026-04-12",
    readTime: "16 min",
    level: "入门",
    content: [
        {
            title: "1. 为什么需要实验追踪",
            body: `在机器学习项目中，实验管理是最容易被忽视但最重要的环节之一。每次调整超参数、更换模型架构、使用不同的数据集划分，都会产生一个新的实验。如果不进行系统化的追踪，你很快就会迷失在无数的模型文件和配置中。

想象一下这样的场景：三个月前你训练了一个效果很好的模型，但现在忘了它用的是哪些超参数、哪个版本的数据集、甚至用的是哪个随机种子。没有实验追踪，重现结果几乎是不可能的。

实验追踪系统帮你记录每次实验的所有关键信息：超参数、指标、代码版本、数据版本、环境配置等。这不仅是为了复现，更是为了科学地迭代和改进你的模型。`,
            code: [
                {
                    lang: "python",
                    code: `# 没有实验追踪的典型混乱场景
models = {
    "final_v1.pkl": "不知道用的什么参数",
    "final_v2.pkl": "这个好像更好？",
    "best_model.pkl": "等等，哪个是best？",
    "model_20260301.pkl": "这是哪天训练的？",
    "model_final_final.pkl": "这个真的是final吗...",
}
# 三个月后：完全无法复现任何结果`,
                },
                {
                    lang: "python",
                    code: `# 使用 MLflow 追踪实验
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

mlflow.set_experiment("customer-churn-prediction")

with mlflow.start_run():
    # 自动记录参数
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 10)
    mlflow.log_param("random_state", 42)
    
    # 训练模型
    model = RandomForestClassifier(
        n_estimators=100, max_depth=10, random_state=42
    )
    model.fit(X_train, y_train)
    
    # 记录指标
    accuracy = accuracy_score(y_test, model.predict(X_test))
    mlflow.log_metric("accuracy", accuracy)
    
    # 保存模型
    mlflow.sklearn.log_model(model, "model")
    
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Run ID: {mlflow.active_run().info.run_id}")`,
                }
            ],
            table: {
                headers: ["问题", "没有追踪", "有追踪系统"],
                rows: [
                    ["复现实验", "几乎不可能", "一键复现"],
                    ["比较模型", "凭记忆", "可视化对比"],
                    ["超参数搜索", "手动记录", "自动记录"],
                    ["团队协作", "无法共享", "集中管理"],
                    ["生产部署", "不确定用哪个", "精确定位"],
                ],
            },
            mermaid: `graph LR
    A["定义实验"] --> B["运行训练"]
    B --> C["记录参数和指标"]
    C --> D["保存模型"]
    D --> E["分析比较"]
    E --> F{"效果更好?"}
    F -->|"是"| G["部署到生产"]
    F -->|"否"| A`,
            tip: "开始一个新项目时，第一件事就是设置实验追踪系统。不要等到项目混乱了才想起来要管理。",
            warning: "永远不要依赖手动命名文件来管理模型版本。这是机器学习项目中最常见的反模式。",
        },
        {
            title: "2. MLflow 核心概念",
            body: `MLflow 是目前最流行的开源 MLOps 平台，由 Databricks 开发。它提供了四个核心组件：MLflow Tracking（实验追踪）、MLflow Projects（项目打包）、MLflow Models（模型格式）和 MLflow Registry（模型注册表）。

MLflow Tracking 是最常用的组件，它通过 Run 来组织实验。每个 Run 代表一次模型训练，包含参数、指标、标签和模型文件。Runs 被组织在 Experiments 中，一个 Experiment 通常对应一个项目或一个模型系列。

MLflow 支持本地文件系统、数据库或远程服务器作为后端存储，可以很好地支持团队协作。`,
            code: [
                {
                    lang: "python",
                    code: `# MLflow 实验层级结构
import mlflow

# 创建实验
mlflow.set_experiment("recommendation-system")

# 查看实验信息
experiment = mlflow.get_experiment_by_name("recommendation-system")
print(f"Experiment ID: {experiment.experiment_id}")
print(f"Artifact Location: {experiment.artifact_location}")

# 搜索历史 runs
runs = mlflow.search_runs(
    experiment_ids=[experiment.experiment_id],
    filter_string="metrics.accuracy > 0.9",
    order_by=["metrics.accuracy DESC"]
)
print(f"找到 {len(runs)} 个高精度实验")`,
                },
                {
                    lang: "bash",
                    code: `# 启动 MLflow UI 查看实验
mlflow ui --host 0.0.0.0 --port 5000

# 或指定后端存储
mlflow server \\
    --backend-store-uri sqlite:///mlflow.db \\
    --default-artifact-root ./artifacts \\
    --host 0.0.0.0 \\
    --port 5000

# 访问 http://localhost:5000 查看实验`,
                },
            ],
            table: {
                headers: ["MLflow 组件", "功能", "使用场景"],
                rows: [
                    ["Tracking", "记录参数、指标、模型", "实验管理和对比"],
                    ["Projects", "标准化项目格式", "可复现的训练流程"],
                    ["Models", "统一模型格式", "多框架部署"],
                    ["Registry", "模型版本管理", "生产环境部署"],
                ],
            },
            mermaid: `graph TD
    A["MLflow"] --> B["Tracking"]
    A --> C["Projects"]
    A --> D["Models"]
    A --> E["Registry"]
    B --> F["Parameters"]
    B --> G["Metrics"]
    B --> H["Artifacts"]
    D --> I["Sklearn"]
    D --> J["PyTorch"]
    D --> K["TensorFlow"]
    D --> L["XGBoost"]`,
            tip: "使用 MLflow 时，建议将 backend-store-uri 设置为数据库（如 PostgreSQL），这样支持多用户并发访问。",
            warning: "默认情况下 MLflow 使用本地文件系统存储 artifacts。在生产环境中，应该配置远程存储（如 S3、GCS）。",
        },
        {
            title: "3. Weights & Biases：可视化实验分析",
            body: `**Weights & Biases**（WandB）是另一个流行的实验追踪平台，以其强大的可视化功能和团队协作能力著称。与 MLflow 相比，WandB 的界面更加现代，交互式图表更加丰富，特别适合需要频繁比较大量实验的场景。

WandB 的核心优势在于它的 Dashboard。你可以实时查看训练曲线、比较不同实验的超参数影响、自动生成实验报告。对于深度学习项目，WandB 还能自动记录梯度分布、激活值等详细信息。

WandB 提供免费的个人套餐，适合个人开发者和小型团队使用。`,
            code: [
                {
                    lang: "python",
                    code: `import wandb
import torch
import torch.nn as nn

# 初始化实验
wandb.init(
    project="image-classification",
    config={
        "learning_rate": 0.001,
        "epochs": 50,
        "batch_size": 32,
        "model": "resnet18",
    }
)

# 自动记录配置
config = wandb.config

# 训练循环中记录指标
for epoch in range(config.epochs):
    train_loss = train_one_epoch(model, train_loader)
    val_acc = evaluate(model, val_loader)
    
    wandb.log({
        "train_loss": train_loss,
        "val_accuracy": val_acc,
        "epoch": epoch,
    })`,
                },
                {
                    lang: "python",
                    code: `# WandB 超参数扫描（Sweep）
sweep_config = {
    "method": "bayes",  # 贝叶斯优化
    "metric": {"name": "val_accuracy", "goal": "maximize"},
    "parameters": {
        "learning_rate": {"min": 1e-5, "max": 1e-2, "distribution": "log_uniform"},
        "batch_size": {"values": [16, 32, 64, 128]},
        "hidden_dim": {"values": [64, 128, 256, 512]},
    }
}

# 创建 sweep
sweep_id = wandb.sweep(sweep_config, project="hyperparameter-search")

# 运行 agent
wandb.agent(sweep_id, function=train, count=50)
# 自动运行 50 次实验，寻找最优超参数`,
                },
            ],
            table: {
                headers: ["功能", "MLflow", "Weights & Biases"],
                rows: [
                    ["开源", "完全开源", "客户端开源，服务端闭源"],
                    ["可视化", "基础图表", "丰富的交互式图表"],
                    ["超参数搜索", "不支持", "内置 Sweep 功能"],
                    ["团队协作", "需要自建服务器", "云端协作"],
                    ["价格", "免费", "免费+付费"],
                ],
            },
            mermaid: `graph LR
    A["定义实验配置"] --> B["启动 WandB Run"]
    B --> C["训练模型"]
    C --> D["实时记录指标"]
    D --> E["Dashboard 可视化"]
    E --> F["对比多个实验"]
    F --> G["生成实验报告"]`,
            tip: "WandB 的 Sweep 功能使用贝叶斯优化，比随机搜索更高效。对于超参数调优，建议优先使用 Sweep 而不是手动尝试。",
            warning: "WandB 免费版有 100GB 的存储限制。对于大型模型和大量实验，需要升级到付费套餐或定期清理旧 artifacts。",
        },
        {
            title: "4. DVC：数据版本管理",
            body: `模型只是机器学习系统的一部分。数据集的版本同样重要，甚至更加重要。如果数据集发生了变化，即使模型代码和超参数完全一样，训练结果也可能截然不同。

DVC（Data Version Control）是专门用于数据版本管理的工具，它的设计理念与 Git 类似，但是针对大文件进行了优化。DVC 不直接将数据存储在 Git 仓库中，而是通过 .dvc 元文件跟踪数据，实际数据存储在远程存储（如 S3、GCS、本地硬盘）中。

使用 DVC，你可以轻松切换不同版本的数据集，确保实验的可复现性。`,
            code: [
                {
                    lang: "bash",
                    code: `# 初始化 DVC
dvc init

# 跟踪数据集
dvc add data/train.csv
dvc add data/test.csv

# 提交到 Git（只提交元文件）
git add data/train.csv.dvc data/test.csv.dvc .dvc
git commit -m "Add dataset v1.0"

# 推送数据到远程存储
dvc remote add -d myremote s3://my-bucket/dvc-store
dvc push`,
                },
                {
                    lang: "bash",
                    code: `# 在不同数据集版本之间切换
git checkout experiment-v2  # 切换到另一个分支
dvc checkout               # 切换对应的数据

# 比较数据集变化
dvc diff HEAD~1

# 复现特定实验
git checkout abc1234  # 切换到特定 commit
dvc checkout          # 恢复对应的数据集
python train.py       # 运行训练`,
                },
            ],
            table: {
                headers: ["方案", "适用场景", "优点", "缺点"],
                rows: [
                    ["Git LFS", "小数据集", "与 Git 集成好", "大文件性能差"],
                    ["DVC", "中大型数据集", "专为 ML 设计", "需要额外学习"],
                    ["云存储手动管理", "任何规模", "灵活", "容易混乱"],
                    ["LakeFS", "企业级", "类似 Git 的体验", "部署复杂"],
                ],
            },
            mermaid: `graph TD
    A["Git 仓库"] -->|跟踪元文件| B[".dvc 文件"]
    B -->|指向| C["远程存储"]
    C --> D["S3"]
    C --> E["GCS"]
    C --> F["本地 NAS"]
    A -->|git checkout| G["切换数据版本"]
    G --> H["dvc checkout"]
    H --> I["恢复数据集"]`,
            tip: "将 DVC 与 MLflow 结合使用：用 DVC 管理数据版本，用 MLflow 记录实验参数和指标。在 MLflow run 中记录 DVC commit hash，可以精确关联数据和实验。",
            warning: "不要把大型数据集直接提交到 Git 仓库。即使使用 Git LFS，也会影响仓库性能和协作效率。",
        },
        {
            title: "5. 自动化实验流水线",
            body: `当实验追踪系统建立后，下一步是让实验流程自动化。手动运行实验不仅效率低下，而且容易出错。自动化实验流水线可以帮你自动搜索超参数、自动对比模型、自动选择最佳模型。

一个典型的自动化实验流水线包括：数据准备、特征工程、模型训练、评估比较、模型选择。每个步骤都应该有版本控制和日志记录。

使用 MLflow Projects 可以标准化实验流程，确保在任何环境中都能复现相同的结果。`,
            code: [
                {
                    lang: "python",
                    code: `# MLflow Projects 定义实验流程
# MLproject 文件
name: churn-prediction
conda_env: conda.yaml

entry_points:
  main:
    parameters:
      n_estimators: {type: int, default: 100}
      max_depth: {type: int, default: 10}
      data_version: {type: string, default: "v1.0"}
    command: "python train.py {n_estimators} {max_depth} {data_version}"

# 运行项目
mlflow run . -P n_estimators=200 -P max_depth=15 -P data_version=v2.0`,
                },
                {
                    lang: "python",
                    code: `# 自动化实验调度
import mlflow
import itertools
import pandas as pd

param_grid = {
    "n_estimators": [50, 100, 200],
    "max_depth": [5, 10, 15, None],
    "min_samples_split": [2, 5, 10],
}

mlflow.set_experiment("hyperparameter-grid-search")
results = []

for params in itertools.product(*param_grid.values()):
    param_dict = dict(zip(param_grid.keys(), params))
    
    with mlflow.start_run():
        for k, v in param_dict.items():
            mlflow.log_param(k, v)
        
        model = RandomForestClassifier(**param_dict)
        model.fit(X_train, y_train)
        accuracy = model.score(X_test, y_test)
        mlflow.log_metric("accuracy", accuracy)
        mlflow.sklearn.log_model(model, "model")
        
        results.append({**param_dict, "accuracy": accuracy})

# 分析结果
df = pd.DataFrame(results)
best = df.loc[df["accuracy"].idxmax()]
print(f"最佳配置: {best.to_dict()}")`,
                },
            ],
            table: {
                headers: ["流水线阶段", "工具", "产出物"],
                rows: [
                    ["数据准备", "DVC", "版本化数据集"],
                    ["特征工程", "MLflow", "特征配置记录"],
                    ["模型训练", "MLflow/WandB", "模型+指标"],
                    ["评估比较", "MLflow UI", "实验对比报告"],
                    ["模型选择", "MLflow Registry", "生产候选模型"],
                ],
            },
            mermaid: `graph LR
    A["DVC 数据版本"] --> B["MLflow 实验"]
    B --> C["自动记录参数"]
    B --> D["自动记录指标"]
    C --> E["搜索 Runs"]
    D --> E
    E --> F{"找到最佳模型?"}
    F -->|"是"| G["注册到 Registry"]
    F -->|"否"| H["调整参数"]
    H --> B
    G --> I["部署到生产"]`,
            tip: "使用 MLflow Projects 时，将 conda 环境配置文件（conda.yaml）与代码一起版本化，确保环境可复现。",
            warning: "自动化实验调度可能产生大量 runs。建议设置过滤条件，只保留指标优于阈值的实验，避免存储膨胀。",
        },
        {
            title: "6. 实验记录的最佳实践",
            body: `良好的实验记录习惯是高质量机器学习项目的基础。以下是一些经过验证的最佳实践，可以帮助你建立高效的实验管理流程。

首先，为每个项目创建清晰的实验命名规范。不要使用 "experiment1"、"test2" 这样没有意义的名称，而是使用描述性的标签，如 "resnet50-lr0.001-augmentation"。

其次，确保每次实验都记录了足够的信息。至少应该包括：数据集版本、模型架构、超参数、评估指标、训练时长、硬件环境。

最后，定期回顾和清理实验记录。删除失败的实验，标记成功的实验，为团队创建实验指南。`,
            code: [
                {
                    lang: "python",
                    code: `# 完整的实验记录模板
import mlflow
import json
from datetime import datetime

def log_complete_experiment(model, params, metrics, X_train, tags=None):
    with mlflow.start_run() as run:
        # 基础参数
        for k, v in params.items():
            mlflow.log_param(k, v)
        
        # 所有指标
        for k, v in metrics.items():
            mlflow.log_metric(k, v)
        
        # 保存模型
        mlflow.sklearn.log_model(model, "model")
        
        # 记录环境信息
        env_info = {
            "python_version": "3.10",
            "timestamp": datetime.now().isoformat(),
            "dataset_hash": "abc123",  # 来自 DVC
            "git_commit": "def456",   # 来自 Git
        }
        mlflow.log_dict(env_info, "env_info.json")
        
        # 设置标签
        if tags:
            for k, v in tags.items():
                mlflow.set_tag(k, v)
        
        return run.info.run_id

# 使用示例
run_id = log_complete_experiment(
    model=trained_model,
    params={"n_estimators": 100, "max_depth": 10},
    metrics={"accuracy": 0.95, "f1": 0.93},
    X_train=X_train,
    tags={"status": "success", "author": "alice"}
)`,
                },
                {
                    lang: "python",
                    code: `# 实验对比分析
import mlflow
import pandas as pd

# 搜索所有成功的实验
runs = mlflow.search_runs(
    experiment_names=["customer-churn"],
    filter_string="tags.status = 'success'",
    order_by=["metrics.f1 DESC"],
)

# 分析超参数影响
import seaborn as sns
import matplotlib.pyplot as plt

sns.scatterplot(
    data=runs,
    x="params.n_estimators",
    y="metrics.accuracy",
    hue="params.max_depth",
    size="params.min_samples_split",
)
plt.title("超参数对准确率的影响")
plt.savefig("hyperparameter_analysis.png")
mlflow.log_artifact("hyperparameter_analysis.png")`,
                },
            ],
            table: {
                headers: ["记录项", "重要性", "示例"],
                rows: [
                    ["超参数", "必须", "learning_rate=0.001"],
                    ["评估指标", "必须", "accuracy=0.95"],
                    ["数据集版本", "必须", "DVC commit: abc123"],
                    ["代码版本", "必须", "Git commit: def456"],
                    ["训练时长", "建议", "2h 15m"],
                    ["硬件环境", "建议", "GPU: A100, RAM: 32GB"],
                ],
            },
            mermaid: `graph TD
    A["开始实验"] --> B["记录实验配置"]
    B --> C["运行训练"]
    C --> D["记录所有指标"]
    D --> E["保存模型"]
    E --> F["记录环境信息"]
    F --> G["设置标签"]
    G --> H["分析结果"]
    H --> I{"满意?"}
    I -->|"是"| J["标记为 success"]
    I -->|"否"| K["标记为 failed"]`,
            tip: "为每个实验添加 tags，如 status（success/failed/pending）、author（负责人）、priority（高/中/低），方便后续筛选和管理。",
            warning: "不要只记录最终指标。训练过程中的中间指标（如每个 epoch 的 loss 和 accuracy）对于诊断模型问题至关重要。",
        },
        {
            title: "7. 实战：完整的实验管理流程",
            body: `在本章中，我们将构建一个完整的实验管理流程，整合 MLflow、WandB 和 DVC 三个工具。这个流程将涵盖从数据准备到模型部署的完整生命周期。

我们将以一个客户流失预测项目为例，展示如何在实际项目中应用实验追踪的最佳实践。这个项目将包括数据版本管理、超参数搜索、实验对比和模型注册。`,
            code: [
                {
                    lang: "python",
                    code: `# 完整实验管理流程
import mlflow
import wandb
import dvc.api
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import yaml

# 1. 加载版本化数据
with dvc.api.open("data/train.csv", repo="git@github.com:org/project.git") as f:
    import pandas as pd
    df = pd.read_csv(f)

# 2. 加载实验配置
with open("config/experiment.yaml") as f:
    config = yaml.safe_load(f)

# 3. 同时使用 MLflow 和 WandB
mlflow.set_experiment(config["experiment_name"])
wandb.init(project=config["experiment_name"], config=config["params"])

X_train, X_test, y_train, y_test = train_test_split(
    df.drop("churn", axis=1), df["churn"], test_size=0.2
)

with mlflow.start_run() as run:
    # 记录参数到两个系统
    for k, v in config["params"].items():
        mlflow.log_param(k, v)
        wandb.config[k] = v
    
    # 训练
    model = RandomForestClassifier(**config["params"])
    model.fit(X_train, y_train)
    
    # 评估
    report = classification_report(y_test, model.predict(X_test), output_dict=True)
    for metric, value in report["accuracy"].items():
        if isinstance(value, (int, float)):
            mlflow.log_metric(metric, value)
            wandb.log({metric: value})
    
    # 保存
    mlflow.sklearn.log_model(model, "model")
    wandb.sklearn.plot_classifier(model, X_train, X_test, y_train, y_test)
    
    print(f"Run ID: {run.info.run_id}")`,
                },
                {
                    lang: "yaml",
                    code: `# config/experiment.yaml
experiment_name: "customer-churn-prediction"

params:
  n_estimators: 200
  max_depth: 15
  min_samples_split: 5
  random_state: 42

data:
  train: "data/train.csv"
  test: "data/test.csv"
  version: "v2.0"

tracking:
  mlflow:
    uri: "sqlite:///mlflow.db"
    artifact_root: "s3://my-bucket/artifacts"
  wandb:
    entity: "my-team"
    project: "customer-churn"`,
                },
            ],
            table: {
                headers: ["工具", "职责", "存储内容"],
                rows: [
                    ["DVC", "数据版本管理", "数据集、特征文件"],
                    ["MLflow", "实验追踪", "参数、指标、模型"],
                    ["WandB", "可视化分析", "训练曲线、图表"],
                    ["Git", "代码版本管理", "训练脚本、配置"],
                    ["MLflow Registry", "模型注册", "生产候选模型"],
                ],
            },
            mermaid: `graph LR
    A["DVC 数据版本"] --> B["训练脚本"]
    C["Git 代码版本"] --> B
    D["配置文件"] --> B
    B --> E["MLflow 记录"]
    B --> F["WandB 记录"]
    E --> G["实验对比"]
    F --> G
    G --> H["最佳模型"]
    H --> I["MLflow Registry"]
    I --> J["生产部署"]`,
            tip: "在团队项目中，建立一个统一的实验配置模板（如 experiment.yaml），确保所有成员使用相同的记录格式。",
            warning: "不要在代码中硬编码敏感信息（如 API 密钥、数据库密码）。使用环境变量或密钥管理工具来管理敏感配置。",
        },
    ],
};
