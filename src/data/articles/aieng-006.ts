import { Article } from '../knowledge';

export const article: Article = {
    id: "aieng-006",
    title: "特征平台：Feast 实战",
    category: "aieng",
    tags: ["特征平台", "Feast", "MLOps"],
    summary: "从特征存储到在线/离线一致性，掌握特征工程的基础设施",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
        {
            title: "1. 为什么需要特征平台",
            body: `在机器学习项目规模化之后，特征工程成为最大的痛点之一。一个中型团队可能同时维护上百个模型，每个模型依赖数十甚至数百个特征。当特征散落在各个 Notebook、脚本和数据管道中时，就会出现特征重复计算、线上线下不一致、特征发现困难等严重问题。特征重复计算意味着同一份特征被多个团队各自实现一遍，浪费计算资源且容易引入偏差。线上线下不一致是更致命的问题：训练时使用的特征计算逻辑与推理时的逻辑存在微小差异，导致模型在生产环境中表现骤降，这种 training-serving skew 极难排查。特征发现困难则表现为新加入团队的工程师不知道已有哪些可用特征，只能重新造轮子。特征平台正是为了解决这些问题而诞生的基础设施层。它提供了特征注册表、统一的特征计算框架、在线和离线特征存储以及特征监控能力，使得特征成为团队共享的一等公民。Feast 是 Tecton 开源的特征存储系统，目前已成为 CNCF 沙箱项目，被多家企业用于生产环境。理解特征平台的核心价值，是构建现代化 ML 基础设施的第一步。`,
            code: [
                {
                    lang: "python",
                    code: `# 没有特征平台时的典型混乱场景\n# 团队 A 的模型训练脚本\nimport pandas as pd\n\ndef compute_user_avg_spend(user_id: str) -> float:\n    """计算用户平均消费 - 团队 A 的实现"""\n    orders = pd.read_csv("data/orders.csv")\n    return orders[orders["user_id"] == user_id]["amount"].mean()\n\n# 团队 B 的推理服务 - 同样的逻辑重新写了一遍\ndef get_user_avg_spend(user_id: str) -> float:\n    """获取用户平均消费 - 团队 B 的实现"""\n    import sqlite3\n    conn = sqlite3.connect("app.db")\n    cursor = conn.execute(\n        "SELECT AVG(amount) FROM orders WHERE user_id = ?",\n        (user_id,)\n    )\n    return cursor.fetchone()[0]`
                },
                {
                    lang: "python",
                    code: `# 使用 Feast 统一管理特征后的场景\nfrom feast import FeatureStore\n\nstore = FeatureStore(repo_path="./feature_repo")\n\n# 训练和推理使用完全相同的 API\nfeature_vector = store.get_online_features(\n    features=[\n        "driver_stats:conv_rate",\n        "driver_stats:acc_rate",\n        "driver_stats:avg_daily_trips",\n    ],\n    entity_rows=[{"driver_id": "1001"}],\n).to_dict()\n\nprint(feature_vector)\n# {'driver_id': ['1001'], 'conv_rate': [0.85],\n#  'acc_rate': [0.92], 'avg_daily_trips': [42]}`
                }
            ],
            table: {
                headers: ["痛点", "无特征平台", "使用 Feast 后"],
                rows: [
                    ["特征发现", "口头沟通/翻代码", "注册表自动检索"],
                    ["特征复用", "重复实现多次", "一次定义多处使用"],
                    ["一致性", "手工对齐易出错", "同一来源自动保证"],
                    ["时效性", "离线批处理延迟高", "在线存储毫秒级"],
                    ["版本管理", "靠 Git 提交记录", "注册表版本快照"],
                    ["监控告警", "出了问题才发现", "主动检测 drift"]
                ]
            },
            mermaid: `graph TD
    A[特征痛点] --> B[特征重复计算]
    A --> C[线上线下不一致]
    A --> D[特征发现困难]
    A --> E[缺乏监控]
    B --> F[特征平台]
    C --> F
    D --> F
    E --> F
    F --> G[特征注册表]
    F --> H[在线存储]
    F --> I[离线存储]
    F --> J[统一 API]`,
            tip: "在引入特征平台之前，先盘点团队现有的特征数量和复用情况。如果特征少于 10 个且只有一个模型，可能还不需要特征平台。",
            warning: "不要试图一次性将所有历史特征迁移到特征平台。应该从新的特征开始，逐步迁移，避免大规模重构带来风险。"
        },
        {
            title: "2. 特征存储架构：离线与在线",
            body: `特征存储是特征平台的核心组件，它需要同时满足两种截然不同的访问模式。离线存储用于模型训练和批量特征生成，要求能够处理海量历史数据、支持复杂的时间范围查询和大规模批读取。在线存储用于实时推理场景，要求在毫秒级别返回单个实体的最新特征值，支持高并发低延迟的点查询。这两种存储的数据来源可以相同，但底层技术和访问接口完全不同。Feast 通过统一的 FeatureService 抽象屏蔽了这种差异，用户只需声明需要哪些特征，Feast 自动从合适的存储中获取数据。离线存储通常基于数据湖或数据仓库，如 Parquet 文件、BigQuery、Snowflake 或 Redshift。在线存储则选择低延迟的键值数据库，如 Redis、DynamoDB 或 Datastore。Feast 的离线存储不仅保存特征的当前值，还保存特征的历史快照，这使得我们可以进行时间旅行查询，即获取某个历史时间点的特征状态，这对防止数据泄漏至关重要。在线/离线存储之间的数据同步由 Feast 的 materialize 命令完成，它定期将离线存储中的新特征数据推送到在线存储。`,
            code: [
                {
                    lang: "python",
                    code: `from feast import FeatureStore\nfrom datetime import datetime, timedelta\n\nstore = FeatureStore(repo_path="./feature_repo")\n\n# 离线历史数据查询 - 用于训练\nentity_df = pd.DataFrame({\n    "driver_id": ["1001", "1002", "1003"],\n    "event_timestamp": [\n        datetime(2026, 4, 1, 10, 0, 0),\n        datetime(2026, 4, 1, 11, 0, 0),\n        datetime(2026, 4, 1, 12, 0, 0),\n    ],\n})\n\ntraining_df = store.get_historical_features(\n    entity_df=entity_df,\n    features=[\n        "driver_stats:conv_rate",\n        "driver_stats:acc_rate",\n    ],\n).to_df()\n\nprint(training_df.shape)\n# (3, 5) - 包含 entity key, timestamp 和特征值`
                },
                {
                    lang: "python",
                    code: `from feast import FeatureStore\n\nstore = FeatureStore(repo_path="./feature_repo")\n\n# 在线特征查询 - 用于实时推理\nfeature_vector = store.get_online_features(\n    features=[\n        "driver_stats:conv_rate",\n        "driver_stats:acc_rate",\n        "driver_stats:avg_daily_trips",\n    ],\n    entity_rows=[\n        {"driver_id": "1001"},\n        {"driver_id": "1002"},\n    ],\n).to_dict()\n\n# 在推理服务中使用\ndef predict(driver_id: str) -> float:\n    features = store.get_online_features(\n        features=["driver_stats:conv_rate", "driver_stats:acc_rate"],\n        entity_rows=[{"driver_id": driver_id}],\n    ).to_dict()\n    return model.predict(features)[0]`
                }
            ],
            table: {
                headers: ["特性", "离线存储", "在线存储"],
                rows: [
                    ["用途", "模型训练/批量分析", "实时推理"],
                    ["查询模式", "批量范围查询", "单实体点查询"],
                    ["延迟要求", "秒到分钟级", "毫秒级"],
                    ["典型技术", "Parquet, BigQuery", "Redis, DynamoDB"],
                    ["数据范围", "完整历史快照", "最新特征值"],
                    ["容量规模", "TB 到 PB 级", "GB 到 TB 级"]
                ]
            },
            mermaid: `graph LR
    A[数据源] --> B[离线存储]
    B -->|Parquet/BigQuery| C[批量训练]
    B -->|materialize| D[在线存储]
    D -->|Redis/DynamoDB| E[实时推理]
    B -->|时间旅行查询| C
    D -->|毫秒级读取| E`,
            tip: "选择在线存储时，优先考虑 Redis，它社区成熟、文档丰富，且 Feast 对 Redis 的支持最完善。生产环境建议使用 Redis Cluster 保证高可用。",
            warning: "离线和在线存储之间的 materialize 任务如果延迟执行，会导致在线特征不是最新的，直接影响推理质量。必须监控 materialize 的执行状态。"
        },
        {
            title: "3. Feast 核心概念：Entity 与 Feature View",
            body: `理解 Feast 的核心概念是有效使用它的前提。Entity 是你想要描述的业务对象，比如用户、司机、商品或订单。Entity 定义了特征的归属主体，是特征存储的主键。一个 Entity 通常对应业务数据库中的一张表或一个实体模型。Feature View 是 Feast 中最关键的概念，它将数据源中的原始列映射为可供查询的特征。每个 Feature View 绑定到一个 Entity，声明了特征的 schema、数据来源和计算逻辑。Feast 支持多种 Feature View 类型：BatchFeatureView 用于批处理数据源，StreamFeatureView 用于流式数据源，OnDemandFeatureView 用于实时计算派生特征。DataSource 定义了特征的原始数据来源，可以是文件、数据库、数据仓库或消息队列。Feature Service 则将多个 Feature View 中的特征组合在一起，形成一个面向特定模型的特征集合。这种分层设计使得特征可以独立定义，按需组合。在实践中，建议按照业务域组织 Feature View，例如将用户行为相关的特征放在一个 View 中，将用户画像相关的特征放在另一个 View 中。`,
            code: [
                {
                    lang: "python",
                    code: `from feast import Entity, FeatureView, Field\nfrom feast.types import Float32, Int64, String\nfrom feast.data_source import FileSource\nfrom datetime import timedelta\n\n# 定义 Entity - 司机\ndriver = Entity(\n    name="driver",\n    join_keys=["driver_id"],\n    description="网约车司机",\n)\n\n# 定义数据源\ndriver_stats_source = FileSource(\n    path="data/driver_stats.parquet",\n    timestamp_field="event_timestamp",\n)\n\n# 定义 Feature View\ndriver_stats_fv = FeatureView(\n    name="driver_stats",\n    entities=[driver],\n    ttl=timedelta(days=30),\n    schema=[\n        Field(name="conv_rate", dtype=Float32),\n        Field(name="acc_rate", dtype=Float32),\n        Field(name="avg_daily_trips", dtype=Int64),\n    ],\n    source=driver_stats_source,\n    online=True,\n)`
                },
                {
                    lang: "python",
                    code: `from feast import OnDemandFeatureView, FeatureService\nfrom feast.on_demand_feature_view import on_demand_feature_view\nfrom typing import Dict\n\n# On-Demand Feature View - 实时计算派生特征\n@on_demand_feature_view(\n    sources=[driver_stats_fv],\n    schema=[Field(name="trip_efficiency", dtype=Float32)],\n)\ndef trip_efficiency(features: Dict[str, float]) -> Dict[str, float]:\n    """计算行程效率 = 成交率 * 活跃率 * 日均行程归一化"""\n    conv = features.get("conv_rate", 0.0)\n    acc = features.get("acc_rate", 0.0)\n    trips = features.get("avg_daily_trips", 0.0)\n    normalized_trips = min(trips / 100.0, 1.0)\n    return {"trip_efficiency": conv * acc * normalized_trips}\n\n# Feature Service - 组合特征供模型使用\nride_prediction_service = FeatureService(\n    name="ride_prediction_features",\n    features=[\n        driver_stats_fv,\n        trip_efficiency,\n    ],\n)`
                }
            ],
            table: {
                headers: ["概念", "作用", "类比"],
                rows: [
                    ["Entity", "特征归属主体", "数据库表的主键"],
                    ["Feature View", "特征定义和来源", "数据库的视图"],
                    ["DataSource", "原始数据接入", "ETL 的数据源"],
                    ["Feature Service", "特征组合集合", "API 的响应 schema"],
                    ["OnDemand View", "实时派生特征", "计算列"],
                    ["Stream View", "流式特征来源", "实时数据管道"]
                ]
            },
            mermaid: `graph TD
    A[DataSource] --> B[Feature View]
    B --> C[Feature Service]
    E[Entity] --> B
    E --> C
    B -->|materialize| D[Online Store]
    C -->|get_online_features| F[模型推理]
    B -->|get_historical_features| G[模型训练]`,
            tip: "Feature View 的 ttl 设置要谨慎：ttl 过短会导致在线特征过早过期，ttl 过长会浪费存储空间。根据业务场景设置合理的 ttl。",
            warning: "Feature View 的 schema 必须与数据源中的实际列名和类型严格匹配。类型不匹配会在 materialize 时导致静默的数据丢失。"
        },
        {
            title: "4. 特征注册与版本管理",
            body: `特征注册表是 Feast 的元数据存储中心，它记录了所有 Entity、Feature View、Feature Service 和 DataSource 的定义及其版本信息。注册表使得团队可以像查询字典一样发现和理解已有的特征，而不是通过翻阅代码或口头沟通。Feast 的注册表默认使用本地 SQLite 文件，适合开发和小型项目。在生产环境中，推荐使用远程注册表，如 GCS、S3 或数据库后端，以实现多用户共享和版本控制。注册表的核心价值在于提供了特征的全局视图。新工程师可以通过 feast apply 命令查看当前注册表中的所有特征定义，了解系统有哪些可用特征、每个特征的含义、数据类型和数据来源。版本管理通过注册表的快照机制实现。每次执行 feast apply 时，Feast 会生成一个新的注册表快照，记录当前所有特征定义的完整状态。这使得我们可以回滚到任意历史版本，排查因特征定义变更导致的问题。在 CI/CD 流程中，应该将特征定义文件纳入版本控制，每次变更都通过代码审查，确保特征变更的可追溯性。`,
            code: [
                {
                    lang: "python",
                    code: `# 查看注册表中的所有特征定义\nfrom feast import FeatureStore\nfrom feast.infra.registry.sql import SqlRegistry\n\nstore = FeatureStore(repo_path="./feature_repo")\n\n# 列出所有 Entity\nfor entity in store.list_entities():\n    print(f"Entity: {entity.name}, keys: {entity.join_keys}")\n\n# 列出所有 Feature View\nfor fv in store.list_feature_views():\n    print(f"FeatureView: {fv.name}")\n    for field in fv.schema:\n        print(f"  {field.name}: {field.dtype}")\n\n# 列出所有 Feature Service\nfor fs in store.list_feature_services():\n    print(f"FeatureService: {fs.name}")\n    for fv in fs.features:\n        print(f"  includes: {fv.name}")`
                },
                {
                    lang: "yaml",
                    code: `# feature_store.yaml - 生产环境注册表配置\nproject: ride_prediction\n\n# 使用远程注册表（S3 后端）\nregistry:\n  path: s3://my-feast-registry/registry.db\n  cache_ttl_seconds: 600\n\n# 离线存储使用 BigQuery\noffline_store:\n  type: bigquery\n  project_id: my-gcp-project\n  dataset: feast_offline\n\n# 在线存储使用 Redis\nonline_store:\n  type: redis\n  connection_string: "redis://redis-cluster:6379"\n\nprovider: gcp\n\n# 监控配置\nfeature_server:\n  enabled: true\n  auth:\n    type: mtls`
                }
            ],
            table: {
                headers: ["注册表后端", "适用场景", "优势", "劣势"],
                rows: [
                    ["SQL (SQLite)", "开发/测试", "零配置，开箱即用", "单节点，不共享"],
                    ["S3", "AWS 生产环境", "高可用，跨区域", "有读取延迟"],
                    ["GCS", "GCP 生产环境", "与 BigQuery 集成", "需要 GCP 账号"],
                    ["Snowflake", "企业数据仓库", "统一数据平台", "成本较高"],
                    ["PostgreSQL", "自有基础设施", "完全可控", "需要运维"],
                    ["DynamoDB", "AWS 高并发", "极低延迟", "按读写计费"]
                ]
            },
            mermaid: `graph TD
    A[特征定义文件] -->|feast apply| B[注册表]
    B -->|快照| C[S3/GCS 存储]
    B -->|缓存| D[本地缓存 600s]
    D --> E[查询请求]
    C -->|TTL 过期| D
    A -->|版本控制| F[Git]
    F -->|PR 审查| A`,
            tip: "注册表的 cache_ttl 需要根据实际查询频率调整。高并发场景下设置较短的 TTL 以保证数据新鲜度，低频场景可以设置更长的 TTL 减少远程读取。",
            warning: "注册表文件是 Feast 系统的核心元数据，必须做好备份。如果注册表丢失，所有的特征定义和版本历史都会丢失，即使底层数据还在也无法使用。"
        },
        {
            title: "5. 在线/离线一致性保证",
            body: `训练和推理之间的特征不一致是机器学习系统中最隐蔽也最危险的问题之一，被称为 training-serving skew。这种不一致可能来源于多个方面：特征计算的时间窗口不同，比如训练使用过去 30 天的数据而推理使用过去 7 天；特征的预处理逻辑不同，比如训练时对缺失值填充了均值而推理时填充了零；数据源的更新延迟，比如离线数据是 T+1 更新而在线数据是实时更新。Feast 通过统一的特征定义从根本上解决了这个问题。特征的计算逻辑只在 Feature View 中定义一次，无论是训练还是推理都使用同一份定义。Feast 的 get_historical_features 和 get_online_features 方法虽然底层访问不同的存储，但返回的特征格式和计算逻辑完全一致。时间旅行查询是保证一致性的另一个关键机制。在训练时，我们需要获取样本产生时刻的历史特征值，而不是当前最新值。如果使用当前最新值，会导致数据泄漏，因为模型可能间接看到了未来的信息。Feast 的 point-in-time join 通过 entity_df 中的 event_timestamp 字段，精确获取每个样本在对应时间点的特征快照，确保训练数据的时序正确性。这种机制对于时间敏感的预测场景尤其重要。`,
            code: [
                {
                    lang: "python",
                    code: `import pandas as pd\nfrom datetime import datetime\nfrom feast import FeatureStore\n\nstore = FeatureStore(repo_path="./feature_repo")\n\n# 训练数据 - 使用 point-in-time join\nentity_df = pd.DataFrame({\n    "driver_id": ["1001", "1001", "1002", "1003"],\n    "event_timestamp": [\n        datetime(2026, 3, 1, 10, 0, 0),\n        datetime(2026, 3, 15, 10, 0, 0),\n        datetime(2026, 3, 1, 11, 0, 0),\n        datetime(2026, 3, 1, 12, 0, 0),\n    ],\n    "label": [1, 0, 1, 0],\n})\n\n# Feast 确保每个 timestamp 只使用该时间点之前的特征\ntraining_data = store.get_historical_features(\n    entity_df=entity_df,\n    features=[\n        "driver_stats:conv_rate",\n        "driver_stats:acc_rate",\n    ],\n).to_df()\n\n# 验证：同一 driver 在不同时间点的特征值不同\nprint(training_data.groupby("driver_id")["conv_rate"].nunique())`
                },
                {
                    lang: "python",
                    code: `# 检测 training-serving skew\nimport pandas as pd\nimport numpy as np\nfrom scipy import stats\n\ndef detect_training_serving_skew(\n    training_features: pd.DataFrame,\n    serving_features: pd.DataFrame,\n    feature_name: str,\n    threshold: float = 0.1,\n) -> dict:\n    """\n    使用 PSI (Population Stability Index) 检测特征分布差异\n    PSI < 0.1: 无显著变化\n    0.1 <= PSI < 0.2: 轻微变化\n    PSI >= 0.2: 显著变化，需要调查\n    """\n    def calculate_psi(expected: np.ndarray, actual: np.ndarray, bins: int = 10):\n        breakpoints = np.percentile(expected, np.linspace(0, 100, bins + 1))\n        breakpoints[-1] = float("inf")\n        expected_counts = np.histogram(expected, breakpoints)[0]\n        actual_counts = np.histogram(actual, breakpoints)[0]\n        expected_pct = (expected_counts + 1e-6) / len(expected)\n        actual_pct = (actual_counts + 1e-6) / len(actual)\n        psi = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))\n        return psi\n\n    psi = calculate_psi(\n        training_features[feature_name].values,\n        serving_features[feature_name].values,\n    )\n    return {"feature": feature_name, "psi": psi, "needs_attention": psi >= threshold}`
                }
            ],
            table: {
                headers: ["不一致类型", "产生原因", "Feast 解决方案", "检测方式"],
                rows: [
                    ["时间窗口差异", "训练/推理使用不同时间范围", "统一 TTL 定义", "PSI 分布检测"],
                    ["数据泄漏", "训练使用未来特征值", "point-in-time join", "特征时间戳审计"],
                    ["预处理差异", "训练/推理预处理逻辑不同", "OnDemand Feature View", "特征值对比测试"],
                    ["缺失值处理", "填充策略不一致", "Feature View 统一声明", "空值率监控"],
                    ["类型转换", "数值精度不一致", "严格 schema 定义", "数据类型校验"],
                    ["更新延迟", "在线存储未及时同步", "materialize 调度", "数据新鲜度监控"]
                ]
            },
            mermaid: `graph TD
    A[训练请求] --> B[point-in-time join]
    B --> C[离线存储]
    C -->|历史快照| D[训练数据集]
    E[推理请求] --> F[在线查询]
    F --> G[在线存储]
    G -->|最新值| H[推理结果]
    B -.->|同一 Feature View| F
    I[PSI 检测] --> D
    I --> H`,
            tip: "在模型上线前，务必使用 PSI 等统计方法对比训练集和推理集的特征分布。即使 Feast 保证了一致性，上游数据源的变化也可能导致 drift。",
            warning: "point-in-time join 要求 entity_df 中的 event_timestamp 必须准确。如果时间戳有误，训练数据中可能混入未来信息，导致模型评估结果虚高但线上表现糟糕。"
        },
        {
            title: "6. 特征监控与质量保障",
            body: `特征监控是特征平台中容易被忽视但至关重要的环节。即使特征定义和存储架构设计得再完美，如果没有监控机制，特征质量问题也不会在第一时间被发现。特征监控涵盖多个维度：数据新鲜度监控确保在线存储中的特征数据是最新的，如果 materialize 任务失败或延迟，特征值可能已经过期；特征值范围监控检测特征值是否超出了预期的范围，比如年龄字段突然出现负数或超过 200 的值；特征缺失率监控跟踪每个特征的缺失值比例，如果缺失率突然上升，说明上游数据源可能出现了问题；特征分布监控使用统计方法检测特征值的分布是否发生了显著变化。Feast 本身提供了基础的元数据和数据访问能力，但完整的监控通常需要结合外部工具实现。Prometheus 和 Grafana 是监控 Feast 的常用组合，可以采集 materialize 任务的执行时间、在线查询的延迟和错误率等指标。对于特征值的业务监控，建议建立特征质量仪表盘，展示每个 Feature View 的关键质量指标，并设置告警规则，当质量指标异常时自动通知相关负责人。`,
            code: [
                {
                    lang: "python",
                    code: `from feast import FeatureStore\nfrom datetime import datetime, timedelta\nimport pandas as pd\n\ndef check_feature_freshness(\n    store: FeatureStore,\n    feature_view_name: str,\n    max_age_hours: int = 24,\n) -> dict:\n    """检查特征新鲜度""" \n    fv = store.get_feature_view(feature_view_name)\n    registry = store.registry\n    project = store.project\n\n    # 获取注册表中的特征元数据\n    fv_meta = registry.get_feature_view(feature_view_name, project)\n\n    # 检查 data_source 中的最新时间戳\n    if hasattr(fv_meta.source, "get_latest_timestamp"):\n        latest_ts = fv_meta.source.get_latest_timestamp(\n            start_date=datetime(2020, 1, 1),\n            end_date=datetime.now(),\n        )\n        age = datetime.now() - latest_ts\n        is_fresh = age < timedelta(hours=max_age_hours)\n        return {\n            "feature_view": feature_view_name,\n            "latest_timestamp": latest_ts,\n            "age_hours": age.total_seconds() / 3600,\n            "is_fresh": is_fresh,\n        }\n    return {"feature_view": feature_view_name, "status": "unknown"}`
                },
                {
                    lang: "python",
                    code: `# 特征质量监控仪表盘数据采集\ndef collect_feature_quality_metrics(\n    store: FeatureStore,\n    feature_view_name: str,\n    entity_ids: list,\n) -> dict:\n    """收集特征质量指标""" \n    results = {\n        "missing_rate": {},\n        "out_of_range": {},\n        "query_latency_ms": [],\n    }\n\n    range_checks = {\n        "conv_rate": (0.0, 1.0),\n        "acc_rate": (0.0, 1.0),\n        "avg_daily_trips": (0, 1000),\n    }\n\n    import time\n    for eid in entity_ids:\n        start = time.time()\n        features = store.get_online_features(\n            features=[\n                f"{feature_view_name}:conv_rate",\n                f"{feature_view_name}:acc_rate",\n            ],\n            entity_rows=[{"driver_id": eid}],\n        ).to_dict()\n        elapsed = (time.time() - start) * 1000\n        results["query_latency_ms"].append(elapsed)\n\n        for fname, (min_val, max_val) in range_checks.items():\n            val = features.get(fname, [None])[0]\n            if val is None:\n                results["missing_rate"][fname] = results["missing_rate"].get(fname, 0) + 1\n            elif val < min_val or val > max_val:\n                results["out_of_range"][fname] = results["out_of_range"].get(fname, 0) + 1\n\n    return results`
                }
            ],
            table: {
                headers: ["监控指标", "告警阈值", "告警级别", "处理动作"],
                rows: [
                    ["数据新鲜度", "超过 24 小时未更新", "P1", "检查 materialize 任务"],
                    ["缺失率", "超过 5%", "P2", "检查上游数据源"],
                    ["值范围异常", "超出预定义范围", "P2", "检查数据清洗逻辑"],
                    ["查询延迟 P99", "超过 100ms", "P1", "检查在线存储状态"],
                    ["分布漂移 PSI", "超过 0.2", "P2", "调查数据源变更"],
                    ["错误率", "超过 1%", "P1", "检查系统日志"]
                ]
            },
            mermaid: `graph TD
    A[Feature View] --> B[新鲜度检查]
    A --> C[缺失率检查]
    A --> D[值范围检查]
    A --> E[分布漂移检测]
    B --> F{异常?}
    C --> F
    D --> F
    E --> F
    F -->|"Yes"| G[触发告警]
    F -->|"No"| H[记录指标]
    G --> I[通知负责人]
    I --> J[排查修复]
    H --> K[Grafana 仪表盘]`,
            tip: "为新上线的特征设置更严格的监控阈值，运行 2-4 周确认稳定后再调整为正常阈值。新特征的数据模式往往需要一段时间才能稳定。",
            warning: "监控告警过多会导致告警疲劳，团队会开始忽略告警。应该区分告警级别，只有 P1 级别的告警才需要立即响应，P2 可以在工作时间内处理。"
        },
        {
            title: "7. 实战：完整 Feast 项目",
            body: `本节通过一个完整的网约车司机评分预测项目，演示如何从零构建一个基于 Feast 的特征平台。项目目标是预测司机的服务质量评分，用于订单匹配和激励策略。整个项目包含四个阶段：项目初始化与数据源配置、特征定义与注册、数据填充与验证、训练与推理服务集成。首先创建项目目录结构，定义 feature_store.yaml 配置文件，指定离线和在线存储的后端。然后定义 Entity、DataSource、FeatureView 和 FeatureService，使用 feast apply 将它们注册到注册表中。接着准备历史数据，使用 feast materialize 将特征数据同步到在线存储。最后编写训练脚本和推理服务代码，展示如何在实际 ML 流程中使用 Feast。这个实战项目涵盖了 Feast 的完整使用链路，可以直接作为团队引入特征平台的参考模板。在实际项目中，建议将特征定义文件纳入 Git 版本控制，通过 CI/CD 流水线自动执行 feast apply 和 materialize，确保特征定义的变更经过审查并自动部署。`,
            code: [
                {
                    lang: "python",
                    code: `# feature_repo/driver_repo.py - 完整的特征定义\nfrom feast import Entity, FeatureView, Field, FeatureStore\nfrom feast.types import Float32, Int64, String\nfrom feast.data_source import FileSource\nfrom datetime import timedelta\n\n# 1. Entity\ndriver = Entity(name="driver", join_keys=["driver_id"])\n\n# 2. Data Source\ndriver_stats_source = FileSource(\n    name="driver_stats_source",\n    path="data/driver_stats.parquet",\n    timestamp_field="event_timestamp",\n    created_timestamp_column="created_timestamp",\n)\n\n# 3. Feature View\ndriver_stats_fv = FeatureView(\n    name="driver_stats",\n    entities=[driver],\n    ttl=timedelta(days=30),\n    schema=[\n        Field(name="conv_rate", dtype=Float32),\n        Field(name="acc_rate", dtype=Float32),\n        Field(name="avg_daily_trips", dtype=Int64),\n        Field(name="rating", dtype=Float32),\n    ],\n    source=driver_stats_source,\n    online=True,\n)\n\n# 4. Feature Service\ndriver_score_service = FeatureService(\n    name="driver_score_service",\n    features=[driver_stats_fv],\n)`
                },
                {
                    lang: "python",
                    code: `# train_and_serve.py - 训练与推理全流程\nimport pandas as pd\nimport joblib\nfrom datetime import datetime\nfrom sklearn.ensemble import GradientBoostingRegressor\nfrom feast import FeatureStore\n\nstore = FeatureStore(repo_path="./feature_repo")\n\n# === 阶段 1: 获取训练数据 ===\nentity_df = pd.read_csv("data/training_entity_df.csv")\nentity_df["event_timestamp"] = pd.to_datetime(entity_df["event_timestamp"])\n\ntraining_data = store.get_historical_features(\n    entity_df=entity_df,\n    features=["driver_stats:conv_rate", "driver_stats:acc_rate",\n              "driver_stats:avg_daily_trips"],\n).to_df()\n\nX = training_data[["conv_rate", "acc_rate", "avg_daily_trips"]]\ny = training_data["label"]\nmodel = GradientBoostingRegressor(n_estimators=100)\nmodel.fit(X, y)\njoblib.dump(model, "models/driver_score_model.pkl")\n\n# === 阶段 2: 填充在线存储 ===\nstore.materialize(\n    start_date=datetime(2026, 1, 1),\n    end_date=datetime.now(),\n)\n\n# === 阶段 3: 在线推理 ===\ndef predict_driver_score(driver_id: str) -> float:\n    features = store.get_online_features(\n        features=["driver_stats:conv_rate", "driver_stats:acc_rate",\n                  "driver_stats:avg_daily_trips"],\n        entity_rows=[{"driver_id": driver_id}],\n    ).to_dict()\n    return model.predict([features])[0]`
                }
            ],
            table: {
                headers: ["阶段", "命令/操作", "产出", "验证方式"],
                rows: [
                    ["项目初始化", "feast init driver_repo", "目录结构", "检查文件存在"],
                    ["特征定义", "编写 Python 定义文件", "Entity/View/Service", "语法检查"],
                    ["注册特征", "feast apply", "注册表更新", "feast registry dump"],
                    ["填充数据", "feast materialize", "在线存储写入", "get_online_features"],
                    ["训练集成", "get_historical_features", "训练数据集", "检查时间顺序"],
                    ["推理集成", "get_online_features", "特征向量", "检查延迟和准确性"]
                ]
            },
            mermaid: `graph TD
    A[feast init] --> B[创建项目结构]
    B --> C[定义 Entity + View]
    C --> D[feast apply]
    D --> E[注册表更新]
    E --> F[feast materialize]
    F --> G[在线存储填充]
    G --> H[训练: get_historical]
    G --> I[推理: get_online]
    H --> J[训练模型]
    I --> K[实时预测]
    D -.->|CI/CD| L[自动化部署]`,
            tip: "在团队中推广 Feast 时，先做一个小型的端到端 POC 项目，让团队成员看到从特征定义到推理服务的完整流程，比单纯讲解概念更有说服力。",
            warning: "生产环境部署时，feast apply 和 materialize 应该在 CI/CD 流水线中自动执行，而不是手动运行。手动操作容易遗漏步骤或在不恰当的时间执行。"
        },
    ],
};
