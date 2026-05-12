import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-016",
    title: "特征工程：数据预处理与特征选择",
    category: "ml",
    tags: ["特征工程", "预处理", "特征选择"],
    summary: "数据和特征决定了模型的上限，掌握特征工程的核心技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 特征工程的重要性",
            body: `特征工程是机器学习中最关键也最容易被低估的环节。业界常说"数据和特征决定了模型的上限，而算法只是逼近这个上限"。好的特征能让简单模型（如线性回归）战胜未经良好特征处理的复杂模型（如深度神经网络）。

特征工程包含多个环节：数据清洗、缺失值处理、编码、缩放、选择和构造。每个环节都直接影响模型的性能。实践中，数据科学家往往花费 60% 到 80% 的时间在数据预处理上，这充分说明了其重要性。掌握系统的特征工程方法论，远比盲目调参更能提升模型效果。`,
            code: [
                {
                    lang: "python",
                    code: `import pandas as pd\nimport numpy as np\nfrom sklearn.datasets import load_breast_cancer\n\n# 加载示例数据\ndata = load_breast_cancer()\nX = pd.DataFrame(data.data, columns=data.feature_names)\ny = pd.Series(data.target, name="target")\n\nprint(f"数据形状: {X.shape}")\nprint(f"特征列数: {X.shape[1]}")\nprint(f"\\n前 3 个特征统计:")\nprint(X.iloc[:, :3].describe())`
                },
                {
                    lang: "python",
                    code: `# 特征质量评估\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.ensemble import RandomForestClassifier\n\n# 对比简单模型在不同特征子集上的表现\nlr_full = LogisticRegression(max_iter=1000)\nlr_score = cross_val_score(lr_full, X, y, cv=5, scoring="accuracy").mean()\nprint(f"逻辑回归(全部特征): {lr_score:.4f}")\n\n# 仅使用前 10 个特征\nlr_subset = LogisticRegression(max_iter=1000)\nsubset_score = cross_val_score(lr_subset, X.iloc[:, :10], y, cv=5, scoring="accuracy").mean()\nprint(f"逻辑回归(前10个特征): {subset_score:.4f}")`
                }
            ],
            table: {
                headers: ["环节", "作用", "影响程度"],
                rows: [
                    ["缺失值处理", "消除数据不完整的影响", "高"],
                    ["类别编码", "将文本转为数值", "高"],
                    ["特征缩放", "消除量纲差异", "中到高"],
                    ["特征选择", "剔除冗余和噪声", "高"],
                    ["特征构造", "创造更有表达力的特征", "极高"]
                ]
            },
            mermaid: `graph LR
    A["原始数据"] --> B["数据清洗"]
    B --> C["缺失值处理"]
    C --> D["编码与缩放"]
    D --> E["特征选择"]
    E --> F["特征构造"]
    F --> G["训练数据"]`,
            tip: "始终先做探索性数据分析（EDA），了解数据分布和特征关系后再选择处理方法。",
            warning: "不要用测试集来指导特征工程决策，会导致数据泄露和过拟合。"
        },
        {
            title: "2. 缺失值处理",
            body: `现实世界中的数据几乎总是包含缺失值。缺失值的产生机制分为三种：完全随机缺失（MCAR）、随机缺失（MAR）和非随机缺失（MNAR）。不同的缺失机制决定了最优的处理策略。

简单的删除法适用于缺失比例极低（小于 5%）的情况。填充法则更为常用：均值/中位数填充适合数值特征，众数填充适合类别特征。更高级的方法包括 KNN 填充、迭代填充（IterativeImputer）以及将缺失值作为独立类别处理。对于 MNAR 数据，缺失本身可能包含重要信息，此时应保留缺失指示变量。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.impute import SimpleImputer, KNNImputer\nimport pandas as pd\n\n# 创建含缺失值的示例\ndf = pd.DataFrame({\n    "age": [25, np.nan, 35, np.nan, 45],\n    "income": [50000, 60000, np.nan, 80000, 90000],\n    "city": ["北京", "上海", np.nan, "北京", np.nan]\n})\n\n# 均值/中位数填充\nnum_imputer = SimpleImputer(strategy="median")\ndf[["age", "income"]] = num_imputer.fit_transform(df[["age", "income"]])\n\n# 众数填充\ncat_imputer = SimpleImputer(strategy="most_frequent")\ndf[["city"]] = cat_imputer.fit_transform(df[["city"]])\nprint(df)`
                },
                {
                    lang: "python",
                    code: `from sklearn.experimental import enable_iterative_imputer\nfrom sklearn.impute import IterativeImputer\n\n# KNN 填充（利用相似样本填补）\nknn_imputer = KNNImputer(n_neighbors=3)\ndf_knn = pd.DataFrame(\n    knn_imputer.fit_transform(df[["age", "income"]]),\n    columns=["age", "income"]\n)\nprint("KNN 填充结果:")\nprint(df_knn)\n\n# 迭代填充（使用回归模型预测缺失值）\niter_imputer = IterativeImputer(max_iter=10, random_state=42)\ndf_iter = pd.DataFrame(\n    iter_imputer.fit_transform(df[["age", "income"]]),\n    columns=["age", "income"]\n)\nprint("\\n迭代填充结果:")\nprint(df_iter)`
                }
            ],
            table: {
                headers: ["方法", "适用场景", "优点", "缺点"],
                rows: [
                    ["删除", "缺失 < 5%", "简单快速", "可能丢失信息"],
                    ["均值/中位数填充", "数值特征，MCAR", "保留样本量", "低估方差"],
                    ["KNN 填充", "特征间有相关性", "利用样本关系", "计算开销大"],
                    ["迭代填充", "复杂缺失模式", "建模精度高", "可能过拟合"],
                    ["添加缺失指示列", "MNAR 机制", "保留缺失信息", "增加维度"]
                ]
            },
            mermaid: `graph TD
    A["发现缺失值"] --> B{"缺失比例?"}
    B -->|< 5％| C["删除缺失行"]
    B -->|5％ - 30％| D{"缺失机制?"}
    D -->|MCAR/MAR| E["均值/中位数/KNN 填充"]
    D -->|MNAR| F["填充 + 缺失指示列"]
    B -->|> 30％| G["考虑删除该特征"]`,
            tip: "对数值特征用中位数填充比均值更稳健，尤其当数据存在异常值时。",
            warning: "用训练集的统计量拟合 Imputer，再 transform 测试集，绝对不能反过来。"
        },
        {
            title: "3. 类别编码",
            body: `机器学习算法只能处理数值输入，因此类别特征必须转换为数值形式。最常见的编码方式包括独热编码（One-Hot Encoding）、标签编码（Label Encoding）和目标编码（Target Encoding）。

独热编码适用于无序类别且类别数较少（通常少于 15）的场景，它会为每个类别创建一个二元列。标签编码适用于有序类别，但用在无序类别上会引入不存在的序关系。目标编码用目标变量的统计量替代类别值，表达能力强但容易过拟合，需要配合交叉验证平滑。对于高基数类别特征（如城市、用户 ID），嵌入编码（Embedding）是更高级的解决方案。`,
            code: [
                {
                    lang: "python",
                    code: `import pandas as pd\nfrom sklearn.preprocessing import OneHotEncoder, OrdinalEncoder\n\ndf = pd.DataFrame({\n    "color": ["红", "蓝", "绿", "蓝", "红"],\n    "size": ["S", "M", "L", "M", "XL"],\n    "city": ["北京", "上海", "北京", "广州", "上海"]\n})\n\n# 独热编码（无序类别）\nohe = OneHotEncoder(sparse_output=False, drop="first")\nencoded = ohe.fit_transform(df[["color"]])\nprint("独热编码列:", ohe.get_feature_names_out(["color"]))\nprint(encoded)\n\n# 有序编码（有序类别）\nordinal = OrdinalEncoder(\n    categories=[["S", "M", "L", "XL"]]\n)\ndf["size_encoded"] = ordinal.fit_transform(df[["size"]])\nprint(df)`
                },
                {
                    lang: "python",
                    code: `# 目标编码（需要 category_encoders 库）\nimport category_encoders as ce\n\ndf_target = pd.DataFrame({\n    "city": ["北京", "上海", "北京", "广州", "上海", "北京"],\n    "target": [1, 0, 1, 0, 1, 0]\n})\n\n# 带平滑的目标编码，防止过拟合\nte = ce.TargetEncoder(smoothing=10)\ndf_target["city_encoded"] = te.fit_transform(\n    df_target[["city"]], df_target["target"]\n)\nprint(df_target)\n\n# pandas 原生方法：groupby 均值\ndf_target["city_mean"] = df_target.groupby("city")["target"].transform("mean")\nprint(df_target[["city", "city_mean"]])`
                }
            ],
            table: {
                headers: ["编码方式", "基数要求", "输出维度", "适用场景"],
                rows: [
                    ["独热编码", "低 (< 15)", "类别数 - 1", "无序类别"],
                    ["标签编码", "任意", "1", "有序类别"],
                    ["目标编码", "中高", "1", "与目标相关的类别"],
                    ["频率编码", "任意", "1", "高基数类别"],
                    ["嵌入编码", "极高", "可配置", "深度学习模型"]
                ]
            },
            mermaid: `graph LR
    A["类别特征"] --> B{"基数大小?"}
    B -->|低| C["独热编码"]
    B -->|中| D["目标编码"]
    B -->|高| E["频率编码 / Embedding"]
    A --> F{"是否有序?"}
    F -->|是| G["有序编码"]
    F -->|否| C`,
            tip: "决策树和随机森林对独热编码不敏感，直接用标签编码即可，因为它们不假设数值大小关系。",
            warning: "目标编码必须用交叉验证方式拟合，否则会将目标变量信息泄露到特征中，导致严重的过拟合。"
        },
        {
            title: "4. 特征缩放",
            body: `特征缩放将不同量纲和范围的特征转换到统一的尺度。这对基于距离和梯度的算法至关重要。KNN、SVM、K-Means 和神经网络等算法对特征尺度非常敏感，未缩放的特征会导致模型被大数值特征主导。

标准化（StandardScaler）将特征转换为均值为 0、标准差为 1 的分布，是最常用的缩放方法。归一化（MinMaxScaler）将特征压缩到 [0, 1] 区间，适合有明确边界的数据。鲁棒缩放（RobustScaler）使用中位数和四分位数，对异常值不敏感，适合存在离群点的场景。基于树的模型（如随机森林、XGBoost）不需要特征缩放，因为它们基于特征值的分裂而非距离计算。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler\nimport numpy as np\n\n# 创建含异常值的示例数据\nX = np.array([\n    [1.0, 100],\n    [2.0, 200],\n    [3.0, 150],\n    [4.0, 10000],  # 异常值\n    [5.0, 180]\n])\n\n# 标准化（Z-score）\nstd_scaler = StandardScaler()\nX_std = std_scaler.fit_transform(X)\nprint(f"标准化后均值: {X_std.mean(axis=0).round(4)}")\nprint(f"标准化后方差: {X_std.var(axis=0).round(4)}")\n\n# 归一化\nmm_scaler = MinMaxScaler()\nX_mm = mm_scaler.fit_transform(X)\nprint(f"归一化范围: [{X_mm.min()}, {X_mm.max()}]")`
                },
                {
                    lang: "python",
                    code: `# 鲁棒缩放（对异常值稳健）\nrobust_scaler = RobustScaler()\nX_robust = robust_scaler.fit_transform(X)\nprint("鲁棒缩放结果:")\nprint(X_robust.round(3))\n\nprint("\\n对比异常值行 (index=3) 的处理:")\nprint(f"原始值:    {X[3]}")\nprint(f"标准化:    {X_std[3].round(3)}")\nprint(f"归一化:    {X_mm[3].round(3)}")\nprint(f"鲁棒缩放:  {X_robust[3].round(3)}")\n\n# 哪种缩放适合哪种算法\nalgo_map = {\n    "KNN": "StandardScaler",\n    "SVM": "StandardScaler",\n    "神经网络": "MinMaxScaler 或 StandardScaler",\n    "K-Means": "StandardScaler",\n    "PCA": "StandardScaler",\n    "逻辑回归": "StandardScaler",\n    "随机森林": "不需要",\n    "XGBoost": "不需要"\n}\nfor algo, scaler in algo_map.items():\n    print(f"{algo}: {scaler}")`
                }
            ],
            table: {
                headers: ["缩放方法", "公式", "对异常值", "适用算法"],
                rows: [
                    ["StandardScaler", "(x - mean) / std", "敏感", "KNN, SVM, PCA, 逻辑回归"],
                    ["MinMaxScaler", "(x - min) / (max - min)", "非常敏感", "神经网络, 图像处理"],
                    ["RobustScaler", "(x - median) / IQR", "稳健", "含异常值的数据"],
                    ["MaxAbsScaler", "x / max(|x|)", "敏感", "稀疏数据"],
                    ["不需要", "-", "-", "随机森林, XGBoost, LightGBM"]
                ]
            },
            mermaid: `graph TD
    A["需要特征缩放?"] --> B{"算法类型?"}
    B -->|基于距离| C["StandardScaler"]
    B -->|基于梯度| D["MinMaxScaler"]
    B -->|基于树| E["不需要缩放"]
    C --> F{"有异常值?"}
    F -->|是| G["改用 RobustScaler"]
    F -->|否| C
    D --> H{"需要 [0,1] 范围?"}
    H -->|是| D
    H -->|否| C`,
            tip: "当不确定用哪种缩放时，StandardScaler 是最安全的选择，它在大多数场景下都表现良好。",
            warning: "缩放器必须在训练集上 fit，在测试集上 transform。如果在整个数据集上 fit，会导致数据泄露。"
        },
        {
            title: "5. 特征选择",
            body: `特征选择的目标是从原始特征中挑选出最有价值的子集，以减少过拟合、提高模型性能和可解释性。方法分为三大类：过滤法、包裹法和嵌入法。

过滤法基于统计指标独立评估每个特征与目标变量的相关性，计算效率高但忽略特征间的交互作用。包裹法通过实际训练模型来评估特征子集的效果，精度高但计算开销大。嵌入法在模型训练过程中自动进行特征选择，是效率和效果的平衡。L1 正则化和基于树的重要性评估是最常用的嵌入法。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.feature_selection import (\n    SelectKBest, f_classif, mutual_info_classif,\n    RFE, SelectFromModel\n)\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.datasets import load_breast_cancer\n\n# 加载数据\ndata = load_breast_cancer()\nX, y = data.data, data.target\n\n# 过滤法：ANOVA F 检验\nselector_f = SelectKBest(f_classif, k=10)\nX_f = selector_f.fit_transform(X, y)\nprint("F 检验选中特征数:", X_f.shape[1])\nprint("最高 F 分数:", selector_f.scores_.max().round(2))\n\n# 过滤法：互信息\nselector_mi = SelectKBest(mutual_info_classif, k=10)\nX_mi = selector_mi.fit_transform(X, y)\nprint("互信息选中特征数:", X_mi.shape[1])`
                },
                {
                    lang: "python",
                    code: `# 包裹法：递归特征消除 (RFE)\nrf = RandomForestClassifier(n_estimators=100, random_state=42)\nrfe = RFE(rf, n_features_to_select=10, step=2)\nrfe.fit(X, y)\nselected = data.feature_names[rfe.support_]\nprint("RFE 选中的特征:")\nfor f in selected:\n    print(f"  - {f}")\n\n# 嵌入法：基于 L1 正则化\nfrom sklearn.linear_model import LogisticRegression\nlr_l1 = LogisticRegression(penalty="l1", solver="liblinear", random_state=42)\nsfm = SelectFromModel(lr_l1, prefit=False)\nsfm.fit(X, y)\nprint(f"\\nL1 正则化选中 {sfm.get_support().sum()} 个特征")\n\n# 嵌入法：基于树的重要性\nsfm_rf = SelectFromModel(rf, threshold="median", prefit=False)\nsfm_rf.fit(X, y)\nprint(f"树模型选中 {sfm_rf.get_support().sum()} 个特征")`
                }
            ],
            table: {
                headers: ["方法", "原理", "计算开销", "考虑特征交互"],
                rows: [
                    ["过滤法 (F 检验)", "统计显著性", "低", "否"],
                    ["过滤法 (互信息)", "信息论度量", "中", "部分"],
                    ["包裹法 (RFE)", "递归消除", "高", "是"],
                    ["包裹法 (前向选择)", "逐步添加", "极高", "是"],
                    ["嵌入法 (L1)", "正则化稀疏", "中", "部分"],
                    ["嵌入法 (树模型)", "重要性排序", "中", "是"]
                ]
            },
            mermaid: `graph LR
    A["所有特征"] --> B{"选择策略?"}
    B -->|快速筛选| C["过滤法"]
    B -->|追求精度| D["包裹法"]
    B -->|平衡效率| E["嵌入法"]
    C --> F["Top-K 特征"]
    D --> F
    E --> F
    F --> G["最优特征子集"]`,
            tip: "实践中推荐组合使用：先用过滤法快速剔除明显无关特征，再用嵌入法或包裹法做精细选择。",
            warning: "包裹法在特征数量多时计算量会爆炸，超过 50 个特征时不建议使用穷举搜索。"
        },
        {
            title: "6. 特征构造",
            body: `特征构造是从已有特征中创造新特征的过程，是提升模型表现最有效但也最需要领域知识的手段。好的构造特征能揭示数据中隐藏的模式，让模型更容易学习。

交互特征通过组合两个或多个特征来捕捉它们之间的协同效应。多项式特征通过生成特征的高次项和交叉项来引入非线性关系。时间特征可以从日期时间中提取星期、月份、是否周末等信息。比率特征（如人均收入、密度）往往比原始特征更具解释力。分箱（Binning）将连续特征离散化，能降低噪声影响并引入非线性。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.preprocessing import PolynomialFeatures, KBinsDiscretizer\nimport pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    "length": [1.2, 2.5, 3.1, 1.8, 2.9],\n    "width": [0.5, 1.2, 0.8, 0.6, 1.1],\n    "height": [0.3, 0.7, 0.5, 0.4, 0.6],\n    "price": [100, 500, 300, 150, 450]\n})\n\n# 交互特征：面积 = 长 * 宽\ndf["area"] = df["length"] * df["width"]\ndf["volume"] = df["length"] * df["width"] * df["height"]\ndf["price_per_volume"] = df["price"] / df["volume"]\nprint("构造后的特征:")\nprint(df)\n\n# 多项式特征（自动生成交互项和平方项）\npoly = PolynomialFeatures(degree=2, include_bias=False)\nX_poly = poly.fit_transform(df[["length", "width"]])\nprint("\\n多项式特征名:", poly.get_feature_names_out(["length", "width"]))`
                },
                {
                    lang: "python",
                    code: `# 分箱（离散化）\ndiscretizer = KBinsDiscretizer(n_bins=4, encode="ordinal", strategy="quantile")\ndf["price_bin"] = discretizer.fit_transform(df[["price"]])\nprint("价格分箱结果:")\nprint(df[["price", "price_bin"]])\n\n# 日期时间特征提取\ndf_dates = pd.DataFrame({\n    "date": pd.date_range("2025-01-01", periods=10, freq="D")\n})\ndf_dates["year"] = df_dates["date"].dt.year\ndf_dates["month"] = df_dates["date"].dt.month\ndf_dates["day"] = df_dates["date"].dt.day\ndf_dates["dayofweek"] = df_dates["date"].dt.dayofweek\ndf_dates["is_weekend"] = df_dates["dayofweek"].isin([5, 6]).astype(int)\nprint("\\n日期特征提取:")\nprint(df_dates)\n\n# 聚合特征（groupby 统计）\ndf_agg = pd.DataFrame({\n    "user_id": [1, 1, 2, 2, 2, 3],\n    "purchase": [100, 200, 50, 150, 300, 80]\n})\nagg = df_agg.groupby("user_id")["purchase"].agg(["mean", "std", "count"])\nprint("\\n用户聚合特征:")\nprint(agg)`
                }
            ],
            table: {
                headers: ["构造类型", "示例", "适用场景", "风险"],
                rows: [
                    ["交互特征", "面积 = 长 x 宽", "特征间有协同效应", "维度爆炸"],
                    ["多项式特征", "x, x^2, xy", "需要非线性", "过拟合"],
                    ["比率特征", "人均 GDP", "消除规模影响", "除零错误"],
                    ["分箱", "年龄段", "降低噪声", "信息损失"],
                    ["时间特征", "星期/月份", "周期性模式", "类别膨胀"]
                ]
            },
            mermaid: `graph TD
    A["原始特征"] --> B["交互特征"]
    A --> C["多项式特征"]
    A --> D["比率特征"]
    A --> E["分箱特征"]
    A --> F["时间特征"]
    A --> G["聚合特征"]
    B --> H["扩展特征池"]
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I["特征选择"]
    I --> J["最终特征集"]`,
            tip: "构造特征后务必做特征选择，因为不是所有构造出的特征都有用，盲目添加会降低模型泛化能力。",
            warning: "多项式特征会使特征数量呈指数增长，degree=3 时 10 个原始特征会变成 219 个，务必先做特征选择再用。"
        },
        {
            title: "7. sklearn Pipeline 实战",
            body: `sklearn 的 Pipeline 将数据预处理步骤和模型串联成一个可复用的对象，是特征工程的最佳实践。Pipeline 确保每个步骤都严格按照训练-测试分割执行，避免了数据泄露。

Pipeline 的核心优势有三点：一是防止数据泄露，所有预处理步骤的 fit 只在训练数据上执行；二是简化代码，将复杂的预处理流程封装为单一对象；三是支持网格搜索，可以对 Pipeline 中任何步骤的超参数进行调优。配合 Column**Transformer**，可以对不同类型的特征应用不同的预处理策略，实现灵活而健壮的特征工程流程。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.pipeline import Pipeline\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import train_test_split, GridSearchCV\nimport pandas as pd\nimport numpy as np\n\n# 创建混合类型的示例数据\nnp.random.seed(42)\ndf = pd.DataFrame({\n    "age": np.random.randint(18, 70, 200),\n    "income": np.random.randint(20, 150, 200) * 1000,\n    "score": np.random.randn(200) * 20 + 70,\n    "city": np.random.choice(["北京", "上海", "广州"], 200),\n    "education": np.random.choice(["本科", "硕士", "博士"], 200)\n})\ndf.loc[np.random.choice(200, 20), "age"] = np.nan  # 引入缺失值\ndf.loc[np.random.choice(200, 15), "city"] = np.nan\n\n# 引入目标变量（示例）\ndf["target"] = (df["income"] > df["income"].median()).astype(int)\n\n# 分离特征和目标\nX = df.drop("target", axis=1)\ny = df["target"]\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)`
                },
                {
                    lang: "python",
                    code: `# 定义数值和类别特征的预处理\nnum_features = ["age", "income", "score"]\ncat_features = ["city", "education"]\n\n# 数值特征管道：填充 + 缩放\nnum_pipeline = Pipeline([\n    ("imputer", SimpleImputer(strategy="median")),\n    ("scaler", StandardScaler())\n])\n\n# 类别特征管道：填充 + 独热编码\ncat_pipeline = Pipeline([\n    ("imputer", SimpleImputer(strategy="most_frequent")),\n    ("onehot", OneHotEncoder(handle_unknown="ignore", drop="first"))\n])\n\n# 组合管道\npreprocessor = ColumnTransformer([\n    ("num", num_pipeline, num_features),\n    ("cat", cat_pipeline, cat_features)\n])\n\n# 完整 Pipeline\nfull_pipeline = Pipeline([\n    ("preprocessor", preprocessor),\n    ("classifier", RandomForestClassifier(random_state=42))\n])\n\n# 训练与评估\nfull_pipeline.fit(X_train, y_train)\ntrain_score = full_pipeline.score(X_train, y_train)\ntest_score = full_pipeline.score(X_test, y_test)\nprint(f"训练集准确率: {train_score:.4f}")\nprint(f"测试集准确率: {test_score:.4f}")\n\n# Pipeline + GridSearchCV 调参\nparam_grid = {\n    "classifier__n_estimators": [50, 100, 200],\n    "classifier__max_depth": [None, 5, 10],\n    "preprocessor__num__imputer__strategy": ["mean", "median"]\n}\ngrid = GridSearchCV(full_pipeline, param_grid, cv=5, n_jobs=-1)\ngrid.fit(X_train, y_train)\nprint(f"\\n最佳参数: {grid.best_params_}")\nprint(f"最佳交叉验证分数: {grid.best_score_:.4f}")`
                }
            ],
            table: {
                headers: ["Pipeline 组件", "作用", "对应 sklearn 类"],
                rows: [
                    ["缺失值填充", "处理不完整数据", "SimpleImputer"],
                    ["特征编码", "类别转数值", "OneHotEncoder / OrdinalEncoder"],
                    ["特征缩放", "统一量纲", "StandardScaler / MinMaxScaler"],
                    ["特征选择", "剔除冗余特征", "SelectKBest / SelectFromModel"],
                    ["ColumnTransformer", "多类型特征分别处理", "ColumnTransformer"],
                    ["Pipeline", "串联所有步骤", "Pipeline"]
                ]
            },
            mermaid: `graph LR
    A["原始数据"] --> B["ColumnTransformer"]
    B --> C["数值管道: Imputer + Scaler"]
    B --> D["类别管道: Imputer + Encoder"]
    C --> E["合并特征"]
    D --> E
    E --> F["特征选择 (可选)"]
    F --> G["分类器 / 回归器"]
    G --> H["预测结果"]`,
            tip: "Pipeline 中任何步骤的超参数都可以通过 '步骤名__参数名' 的格式在 GridSearchCV 中调优。",
            warning: "Pipeline 的 fit 方法只能在训练数据上调用，预测时用 predict 自动复用训练时学到的变换参数，绝对不要对测试数据重新 fit。"
        }
    ],
};
