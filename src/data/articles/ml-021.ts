import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-021",
    title: "超参数调优：Grid Search, Random Search, Optuna",
    category: "ml",
    tags: ["超参数", "调优", "Optuna"],
    summary: "从网格搜索到贝叶斯优化，掌握模型调参的系统方法",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 超参数 vs 模型参数：理解调参的本质",
            body: "在机器学习中，参数（Parameters）和超参数（Hyperparameters）是两个截然不同的概念。模型参数是算法在训练过程中自动学习得到的——比如线性回归的权重系数、神经网络的连接权重，它们通过梯度下降等优化算法从数据中拟合出来。而超参数是我们在训练之前必须手动设定的配置项，它们控制着模型的学习行为本身。\n\n超参数调优之所以困难，是因为我们无法通过训练数据直接计算超参数的最优值。每个超参数组合都需要完整训练一次模型，然后用验证集评估效果。这意味着调参本质上是一个黑盒优化问题——输入一组超参数，运行训练流程，输出一个性能指标。当超参数空间包含十几个维度时，可能的组合数量呈指数级爆炸，穷举所有可能性在计算上完全不可行。\n\n理解超参数和模型参数的区别是调参的第一步。常见的超参数包括学习率、正则化强度、树的最大深度、神经网络的层数和每层的神经元数量等。它们不像模型参数那样可以通过反向传播自动优化，必须依靠系统化的搜索策略来找到较优的组合。",
            code: [
                {
                    lang: "python",
                    code: "from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.datasets import load_breast_cancer\n\n# 加载数据\nX, y = load_breast_cancer(return_X_y=True)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n# 模型参数：通过训练自动学习（如每棵树的分裂点）\n# 超参数：训练前手动设定（如下面的配置）\nrf = RandomForestClassifier(\n    n_estimators=100,      # 超参数：树的数量\n    max_depth=5,           # 超参数：最大深度\n    min_samples_split=2,   # 超参数：分裂所需最小样本数\n    min_samples_leaf=1,    # 超参数：叶节点最小样本数\n    random_state=42\n)\nrf.fit(X_train, y_train)\nprint(f\"Test accuracy: {rf.score(X_test, y_test):.4f}\")"
                },
                {
                    lang: "python",
                    code: "import inspect\nfrom sklearn.linear_model import LogisticRegression\n\n# 区分哪些是超参数、哪些是模型参数\nlr = LogisticRegression()\n\n# 获取所有超参数（构造函数的 __init__ 参数）\nsig = inspect.signature(lr.__init__)\nhyperparams = [p for p in sig.parameters if p != 'self']\nprint(\"超参数:\", hyperparams)\n\n# 训练后查看模型参数\nfrom sklearn.datasets import make_classification\nX, y = make_classification(n_samples=1000, n_features=10, random_state=42)\nlr.fit(X, y)\nprint(f\"模型参数(coef_) 形状: {lr.coef_.shape}\")\nprint(f\"模型参数(intercept_): {lr.intercept_}\")"
                }
            ],
            table: {
                headers: ["类型", "决定方式", "示例", "是否可训练"],
                rows: [
                    ["模型参数", "训练过程自动学习", "权重 W, 偏置 b", "是"],
                    ["超参数", "训练前人工设定", "学习率, 树深度", "否"],
                    ["元超参数", "调参框架的配置", "搜索空间大小, 迭代次数", "否"]
                ]
            },
            mermaid: "graph TD\n    A[\"数据\"] --> B[\"设定超参数\"]\n    B --> C[\"训练模型\"]\n    C --> D[\"学习模型参数\"]\n    D --> E[\"验证集评估\"]\n    E --> F{\"性能达标?\"}\n    F -->|\"否\"| B\n    F -->|\"是\"| G[\"测试集最终评估\"]",
            tip: "建议：始终将训练集、验证集和测试集严格分离。验证集用于调参选择，测试集只在整个调参流程结束后评估一次，避免数据泄露导致的过拟合评估。",
            warning: "陷阱：不要混淆超参数和模型参数。在 scikit-learn 中，超参数写在 fit() 之前，模型参数在 fit() 之后通过 coef_、feature_importances_ 等属性获取。"
        },
        {
            title: "2. 网格搜索（Grid Search）：穷举但低效",
            body: "网格搜索是最直观的超参数调优方法。它的基本思想非常朴素：为每个超参数定义一组候选值，然后遍历所有可能的组合，对每种组合进行交叉验证，最终选择验证集表现最好的那一组。这种方法的优势在于实现简单、逻辑清晰，并且只要搜索空间覆盖了最优解，就一定能找到它。\n\n然而，网格搜索的效率问题同样明显。假设我们要调优三个超参数，分别有 5、4、3 个候选值，那么总共需要评估 5 乘以 4 乘以 3 等于 60 种组合。如果采用 5 折交叉验证，就需要训练 300 次模型。当超参数增加到 5 个，每个有 10 个候选值时，组合数量暴增到 10 万种，这在计算上几乎不可行。更关键的是，网格搜索对所有维度采用均匀采样，这意味着它在重要的维度上可能采样不够精细，而在不重要的维度上又浪费了大量计算资源。",
            code: [
                {
                    lang: "python",
                    code: "from sklearn.model_selection import GridSearchCV\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.datasets import load_breast_cancer\n\nX, y = load_breast_cancer(return_X_y=True)\n\n# 定义搜索网格\nparam_grid = {\n    \"n_estimators\": [50, 100, 200],\n    \"max_depth\": [3, 5, 7, None],\n    \"min_samples_split\": [2, 5, 10],\n    \"min_samples_leaf\": [1, 2, 4],\n}\n# 总共 3 x 4 x 3 x 3 = 108 种组合\n\nrf = RandomForestClassifier(random_state=42)\ngrid_search = GridSearchCV(\n    rf, param_grid, cv=5, scoring=\"accuracy\", n_jobs=-1, verbose=1\n)\ngrid_search.fit(X, y)\n\nprint(f\"最佳参数: {grid_search.best_params_}\")\nprint(f\"最佳分数: {grid_search.best_score_:.4f}\")"
                },
                {
                    lang: "python",
                    code: "import pandas as pd\nimport matplotlib.pyplot as plt\n\n# 分析网格搜索结果\nresults = pd.DataFrame(grid_search.cv_results_)\n\n# 可视化 max_depth 和 n_estimators 对性能的影响\npivot = results.pivot_table(\n    index=\"param_max_depth\",\n    columns=\"param_n_estimators\",\n    values=\"mean_test_score\"\n)\n\nplt.figure(figsize=(8, 5))\nim = plt.imshow(pivot.values, cmap=\"viridis\", aspect=\"auto\")\nplt.colorbar(im, label=\"CV Accuracy\")\nplt.xticks(range(len(pivot.columns)), pivot.columns)\nplt.yticks(range(len(pivot.index)), pivot.index)\nplt.xlabel(\"n_estimators\")\nplt.ylabel(\"max_depth\")\nplt.title(\"Grid Search Heatmap\")\nplt.show()"
                }
            ],
            table: {
                headers: ["超参数", "候选值", "数量"],
                rows: [
                    ["n_estimators", "[50, 100, 200]", "3"],
                    ["max_depth", "[3, 5, 7, None]", "4"],
                    ["min_samples_split", "[2, 5, 10]", "3"],
                    ["min_samples_leaf", "[1, 2, 4]", "3"]
                ]
            },
            mermaid: "graph LR\n    A[\"定义网格\"] --> B[\"组合1: 训练+验证\"]\n    A --> C[\"组合2: 训练+验证\"]\n    A --> D[\"...\"]\n    A --> E[\"组合N: 训练+验证\"]\n    B --> F[\"比较分数\"]\n    C --> F\n    D --> F\n    E --> F\n    F --> G[\"选择最佳组合\"]",
            tip: "建议：使用 GridSearchCV 时设置 n_jobs=-1 充分利用多核 CPU，同时设置 verbose=1 观察进度。对于初次探索，先用粗粒度网格（每个超参数 3-4 个值）快速定位大致范围。",
            warning: "陷阱：网格搜索在超过 4 个超参数时计算成本急剧上升。如果某个超参数的最优值在网格端点附近，说明搜索范围不够，需要扩大范围重新搜索，而不是简单增加网格密度。"
        },
        {
            title: "3. 随机搜索（Random Search）：更高效的选择",
            body: "随机搜索的核心洞察来自一篇 2012 年的经典论文。作者发现，在高维超参数空间中，通常只有少数几个超参数对模型性能有显著影响，其余超参数的影响相对较小。网格搜索对所有维度一视同仁地均匀采样，这意味着在不重要的维度上浪费了大量评估机会。随机搜索则不同，它为每个超参数独立地从指定分布中采样，这样即使总的评估次数较少，也能在每个重要维度上获得更充分的探索。\n\n具体来说，假设我们进行 60 次评估。网格搜索如果是 3 乘以 4 乘以 5 的组合，那么在第一个维度上只尝试了 3 个不同的值。而随机搜索的 60 次评估中，每个超参数都会有 60 个不同的采样值，覆盖范围更广。论文的实验结果表明，在相同的计算预算下，随机搜索往往能找到比网格搜索更好的超参数组合，尤其是在低有效维度的场景中。\n\n随机搜索的另一个优势是实现极其简单，而且天然支持连续型超参数分布——比如对数均匀分布，这对于学习率这种跨数量级变化的超参数特别有用。",
            code: [
                {
                    lang: "python",
                    code: "from sklearn.model_selection import RandomizedSearchCV\nfrom sklearn.ensemble import RandomForestClassifier\nfrom scipy.stats import randint, uniform\n\nparam_dist = {\n    \"n_estimators\": randint(50, 500),       # 均匀分布 50-499\n    \"max_depth\": randint(3, 20),            # 均匀分布 3-22\n    \"min_samples_split\": randint(2, 20),    # 均匀分布 2-21\n    \"min_samples_leaf\": randint(1, 10),     # 均匀分布 1-10\n    \"max_features\": uniform(0.1, 0.9),      # 均匀分布 0.1-1.0\n}\n\nrf = RandomForestClassifier(random_state=42)\nrandom_search = RandomizedSearchCV(\n    rf, param_dist, n_iter=60, cv=5,\n    scoring=\"accuracy\", n_jobs=-1, random_state=42\n)\nrandom_search.fit(X, y)\n\nprint(f\"最佳参数: {random_search.best_params_}\")\nprint(f\"最佳分数: {random_search.best_score_:.4f}\")"
                },
                {
                    lang: "python",
                    code: "import matplotlib.pyplot as plt\nimport pandas as pd\n\n# 可视化随机搜索的收敛曲线\nscores = random_search.cv_results_[\"mean_test_score\"]\niterations = range(1, len(scores) + 1)\n\nplt.figure(figsize=(10, 5))\nplt.plot(iterations, scores, \"o-\", alpha=0.6, label=\"单次评估\")\nplt.plot(iterations, pd.Series(scores).expanding().max(),\n         \"r-\", linewidth=2, label=\"历史最优\")\nplt.axhline(grid_search.best_score_, color=\"green\",\n            linestyle=\"--\", label=\"Grid Search 最佳\")\nplt.xlabel(\"迭代次数\")\nplt.ylabel(\"CV Accuracy\")\nplt.legend()\nplt.title(\"Random Search Convergence vs Grid Search\")\nplt.show()"
                }
            ],
            table: {
                headers: ["维度", "分布类型", "适用场景"],
                rows: [
                    ["n_estimators", "均匀整数分布", "离散值，范围较广"],
                    ["max_depth", "均匀整数分布", "离散值，对性能影响大"],
                    ["learning_rate", "对数均匀分布", "跨数量级变化"],
                    ["dropout_rate", "均匀连续分布", "连续值，0-1 之间"]
                ]
            },
            mermaid: "graph TD\n    A[\"定义超参数分布\"] --> B[\"采样组合1\"]\n    A --> C[\"采样组合2\"]\n    B --> D[\"训练+评估\"]\n    C --> E[\"训练+评估\"]\n    D --> F[\"记录结果\"]\n    E --> F\n    F --> G{\"达到 n_iter?\"}\n    G -->|\"否\"| B\n    G -->|\"是\"| H[\"返回历史最优\"]",
            tip: "建议：随机搜索中，为学习率等跨数量级的超参数使用对数均匀分布（loguniform），这样能同时覆盖 0.001 到 1.0 的广阔范围，比线性均匀分布更高效。",
            warning: "陷阱：随机搜索不会记住历史评估结果，每次采样都是独立的。这意味着它可能重复评估相似的超参数组合，也无法利用已有的评估信息来指导后续搜索。"
        },
        {
            title: "4. 贝叶斯优化（TPE 算法）：智能搜索",
            body: "贝叶斯优化的核心思想是用已有的评估结果来指导未来的搜索方向。与网格搜索和随机搜索这种无记忆的方法不同，贝叶斯优化维护一个概率模型（称为代理模型），用它来预测哪些超参数组合更有可能产生好的结果。每次评估后，模型会更新，下一轮搜索会更有针对性。\n\nTPE（Tree-structured Parzen Estimator）是贝叶斯优化中最常用的算法之一。它的核心机制是将已经评估过的超参数组合按性能分为两组：好的一组（比如前 25%）和差的一组（剩余 75%）。然后分别对这两组建模——好的组合服从什么样的分布，差的组合服从什么样的分布。新的采样点会选择那些在好组中概率高、在差组中概率低的区域，从而实现高效探索。\n\n与网格搜索和随机搜索相比，贝叶斯优化通常只需要 10 到 50 次迭代就能找到接近最优的超参数组合，这在计算成本高昂的场景中（比如深度神经网络训练）带来了数量级的效率提升。代价是算法实现更复杂，且需要选择合适的代理模型和采集函数。",
            code: [
                {
                    lang: "python",
                    code: "from hyperopt import fmin, tpe, hp, Trials\n\n# 定义搜索空间\nspace = {\n    \"n_estimators\": hp.quniform(\"n_estimators\", 50, 500, 10),\n    \"max_depth\": hp.quniform(\"max_depth\", 3, 20, 1),\n    \"min_samples_split\": hp.quniform(\"min_samples_split\", 2, 20, 1),\n    \"learning_rate\": hp.loguniform(\"learning_rate\", -5, 0),\n}\n\ndef objective(params):\n    from sklearn.ensemble import GradientBoostingClassifier\n    from sklearn.model_selection import cross_val_score\n\n    params[\"n_estimators\"] = int(params[\"n_estimators\"])\n    params[\"max_depth\"] = int(params[\"max_depth\"])\n    params[\"min_samples_split\"] = int(params[\"min_samples_split\"])\n\n    model = GradientBoostingClassifier(**params, random_state=42)\n    score = cross_val_score(model, X, y, cv=5, scoring=\"accuracy\").mean()\n    return -score  # hyperopt 最小化，所以取负\n\ntrials = Trials()\nbest = fmin(\n    fn=objective, space=space, algo=tpe.suggest,\n    max_evals=50, trials=trials, verbose=1\n)\nprint(f\"最佳超参数: {best}\")"
                },
                {
                    lang: "python",
                    code: "import matplotlib.pyplot as plt\nimport numpy as np\n\n# 可视化 TPE 的探索过程\nlosses = [-t[\"result\"][\"loss\"] for t in trials.trials]\nplt.figure(figsize=(10, 4))\n\nplt.subplot(1, 2, 1)\nplt.plot(range(len(losses)), losses, \"bo-\", alpha=0.6)\nplt.plot(range(len(losses)), np.maximum.accumulate(losses), \"r-\", linewidth=2)\nplt.xlabel(\"Trial\")\nplt.ylabel(\"Accuracy\")\nplt.title(\"TPE Convergence\")\n\nplt.subplot(1, 2, 2)\n# 绘制 max_depth 的采样分布\ndepths = [t[\"misc\"][\"vals\"][\"max_depth\"][0] for t in trials.trials]\ngood = [d for d, l in zip(depths, losses) if l > np.median(losses)]\nbad = [d for d, l in zip(depths, losses) if l <= np.median(losses)]\nplt.hist(good, bins=10, alpha=0.5, label=\"Good trials\", color=\"green\")\nplt.hist(bad, bins=10, alpha=0.5, label=\"Bad trials\", color=\"red\")\nplt.xlabel(\"max_depth\")\nplt.legend()\nplt.title(\"TPE: Good vs Bad Distribution\")\nplt.tight_layout()\nplt.show()"
                }
            ],
            table: {
                headers: ["方法", "评估次数", "是否利用历史信息", "适用场景"],
                rows: [
                    ["网格搜索", "指数级", "否", "低维空间，精确搜索"],
                    ["随机搜索", "固定次数", "否", "中等维度，快速探索"],
                    ["TPE 贝叶斯优化", "10-50 次", "是", "高维空间，昂贵评估"],
                    ["高斯过程 BO", "10-30 次", "是", "连续空间，平滑目标"]
                ]
            },
            mermaid: "graph TD\n    A[\"初始化：随机采样 N 个点\"] --> B[\"评估所有点\"]\n    B --> C[\"拟合代理模型 TPE\"]\n    C --> D[\"计算采集函数 EI\"]\n    D --> E[\"选择下一个采样点\"]\n    E --> F[\"评估新点\"]\n    F --> G{\"达到 max_evals?\"}\n    G -->|\"否\"| C\n    G -->|\"是\"| H[\"返回全局最优\"]",
            tip: "建议：TPE 算法的前 10-20 次评估是随机探索，用于构建初始的代理模型。因此总评估次数建议至少 30 次，否则代理模型没有足够的数据来做出好的预测。",
            warning: "陷阱：TPE 的搜索空间定义需要谨慎。对于整数型超参数使用 quniform 或 qloguniform，对于连续型使用 uniform 或 loguniform，类型错误会导致搜索行为异常。"
        },
        {
            title: "5. Optuna 框架：定义-优化-可视化",
            body: "Optuna 是由 Preferred Networks 开发的现代超参数优化框架，它将贝叶斯优化的理论包装成了一个极其易用的 API。Optuna 的核心设计哲学是 Define-by-Run，搜索空间在目标函数内部动态定义，而不是像 Hyperopt 那样需要预先声明。这意味着你可以根据前面采样的超参数值来决定后续参数的范围，实现条件搜索空间。\n\nOptuna 提供了三种内建的采样器：TPESampler（默认的 TPE 实现）、CmaEsSampler（基于 CMA-ES 进化策略）和 RandomSampler（随机搜索基线）。它还内置了强大的可视化模块，可以绘制参数重要性图、优化历史曲线、平行坐标图等，帮助你理解哪些超参数对模型性能影响最大。\n\n另一个亮点是 Optuna 的持久化能力。通过指定 study_name 和 storage，可以将优化过程保存到数据库中，随时暂停和恢复。这对于需要运行数小时甚至数天的调参任务来说，是不可或缺的保险措施。",
            code: [
                {
                    lang: "python",
                    code: "import optuna\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import cross_val_score\n\ndef objective(trial):\n    # Define-by-Run：搜索空间在函数内部动态定义\n    n_estimators = trial.suggest_int(\"n_estimators\", 50, 500)\n    max_depth = trial.suggest_int(\"max_depth\", 3, 20)\n    min_samples_split = trial.suggest_int(\"min_samples_split\", 2, 20)\n    min_samples_leaf = trial.suggest_int(\"min_samples_leaf\", 1, 10)\n    max_features = trial.suggest_float(\"max_features\", 0.1, 1.0)\n\n    # 条件搜索空间：只有树数量大于 100 时才采样 subsample\n    if n_estimators > 100:\n        subsample = trial.suggest_float(\"subsample\", 0.5, 1.0)\n    else:\n        subsample = 1.0\n\n    model = RandomForestClassifier(\n        n_estimators=n_estimators, max_depth=max_depth,\n        min_samples_split=min_samples_split, min_samples_leaf=min_samples_leaf,\n        max_features=max_features, random_state=42\n    )\n    score = cross_val_score(model, X, y, cv=5, scoring=\"accuracy\").mean()\n    return score\n\n# 创建 Study 并运行优化\nstudy = optuna.create_study(\n    direction=\"maximize\",\n    sampler=optuna.samplers.TPESampler(seed=42)\n)\nstudy.optimize(objective, n_trials=100)\n\nprint(f\"最佳值: {study.best_value:.4f}\")\nprint(f\"最佳参数: {study.best_params}\")"
                },
                {
                    lang: "python",
                    code: "import optuna.visualization as vis\n\n# 优化历史：展示搜索的收敛过程\nfig1 = vis.plot_optimization_history(study)\nfig1.show()\n\n# 参数重要性：哪些超参数对结果影响最大\nfig2 = vis.plot_param_importances(study)\nfig2.show()\n\n# 平行坐标图：观察高维参数空间的搜索轨迹\nfig3 = vis.plot_parallel_coordinate(study)\nfig3.show()\n\n# 等高线图：二维超参数交互效应\nfig4 = vis.plot_contour(study, params=[\"max_depth\", \"n_estimators\"])\nfig4.show()\n\n# 导出结果为 CSV\ndf = study.trials_dataframe()\ndf.to_csv(\"optuna_results.csv\", index=False)\nprint(f\"共完成 {len(study.trials)} 次试验\")"
                }
            ],
            table: {
                headers: ["API 方法", "参数类型", "示例"],
                rows: [
                    ["suggest_int", "整数", "trial.suggest_int('depth', 3, 20)"],
                    ["suggest_float", "浮点数", "trial.suggest_float('lr', 0.001, 0.1)"],
                    ["suggest_categorical", "分类", "trial.suggest_categorical('boost', ['gbdt', 'dart'])"],
                    ["suggest_discrete_uniform", "离散均匀", "trial.suggest_discrete_uniform('gamma', 0.01, 0.5, 0.01)"]
                ]
            },
            mermaid: "graph LR\n    A[\"定义目标函数\"] --> B[\"创建 Study\"]\n    B --> C[\"采样超参数\"]\n    C --> D[\"训练+评估\"]\n    D --> E[\"更新 TPE 模型\"]\n    E --> F{\"达到 n_trials?\"}\n    F -->|\"否\"| C\n    F -->|\"是\"| G[\"可视化分析\"]\n    G --> H[\"导出最佳模型\"]",
            tip: "建议：使用 optuna.visualization 模块的 plot_param_importances() 可以快速识别哪些超参数对结果影响最大，从而在下一次搜索中聚焦于关键参数，缩小搜索空间。",
            warning: "陷阱：Optuna 默认使用内存存储，进程结束后所有试验数据丢失。对于长时间运行的调参任务，务必使用 storage 参数指定 SQLite 数据库路径进行持久化。"
        },
        {
            title: "6. 早停与剪枝：加速调参过程",
            body: "早停（Early Stopping）和剪枝（Pruning）是优化超参数搜索效率的两项关键技术。它们的核心思想是一样的：如果一个超参数组合在训练初期就表现不佳，就没有必要继续训练下去，应该尽早终止并将计算资源分配给更有希望的组合。\n\n在 Optuna 中，剪枝通过 Pruner 实现。常用的剪枝器包括 MedianPruner（如果当前 trial 的中间结果低于历史 trial 的中位数则剪枝）、HyperbandPruner（基于 successive halving 算法，自动分配资源）和 PatientPruner（包装其他剪枝器，增加耐心值避免过早剪枝）。这些剪枝器通过 trial.report() 和 trial.should_prune() 在训练过程中定期判断是否应该提前终止。\n\n早停在梯度提升树和神经网络中尤为有效。比如 XGBoost 的原生早停机制可以在验证集损失连续 N 轮不改善时停止训练，这不仅节省了计算时间，还能防止模型过拟合。将早停和 Optuna 剪枝结合使用，可以带来数倍到数十倍的加速效果。",
            code: [
                {
                    lang: "python",
                    code: "import optuna\nimport xgboost as xgb\nfrom sklearn.model_selection import train_test_split\n\nX_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)\n\ndef objective(trial):\n    params = {\n        \"max_depth\": trial.suggest_int(\"max_depth\", 3, 12),\n        \"learning_rate\": trial.suggest_float(\"learning_rate\", 0.01, 0.3, log=True),\n        \"n_estimators\": trial.suggest_int(\"n_estimators\", 100, 1000),\n        \"subsample\": trial.suggest_float(\"subsample\", 0.6, 1.0),\n        \"colsample_bytree\": trial.suggest_float(\"colsample_bytree\", 0.6, 1.0),\n        \"reg_alpha\": trial.suggest_float(\"reg_alpha\", 0.0, 10.0),\n        \"reg_lambda\": trial.suggest_float(\"reg_lambda\", 0.0, 10.0),\n    }\n\n    model = xgb.XGBClassifier(**params, eval_metric=\"logloss\", random_state=42)\n    model.fit(\n        X_train, y_train,\n        eval_set=[(X_val, y_val)],\n        verbose=False\n    )\n    return model.score(X_val, y_val)\n\n# 使用 HyperbandPruner 自动剪枝表现差的 trial\nstudy = optuna.create_study(\n    direction=\"maximize\",\n    pruner=optuna.pruners.HyperbandPruner(\n        min_resource=100, max_resource=1000, reduction_factor=3\n    )\n)\nstudy.optimize(objective, n_trials=50)"
                },
                {
                    lang: "python",
                    code: "import optuna\nimport xgboost as xgb\n\n# 结合 Optuna 剪枝和 XGBoost 原生早停\ndef objective_with_callback(trial):\n    params = {\n        \"max_depth\": trial.suggest_int(\"max_depth\", 3, 12),\n        \"learning_rate\": trial.suggest_float(\"learning_rate\", 0.01, 0.3, log=True),\n        \"n_estimators\": 1000,  # 设大，让早停决定实际迭代数\n        \"subsample\": trial.suggest_float(\"subsample\", 0.6, 1.0),\n    }\n\n    model = xgb.XGBClassifier(**params, eval_metric=\"logloss\", random_state=42)\n\n    # Optuna Pruning Callback：每轮训练后向 Optuna 报告\n    pruning_callback = optuna.integration.XGBoostPruningCallback(trial, \"validation_0-logloss\")\n\n    model.fit(\n        X_train, y_train,\n        eval_set=[(X_val, y_val)],\n        callbacks=[pruning_callback],\n        verbose=False\n    )\n\n    # 如果 trial 被剪枝，返回一个较差的值\n    try:\n        return model.score(X_val, y_val)\n    except optuna.TrialPruned:\n        return study.best_value * 0.9 if hasattr(study, \"best_value\") else 0.5"
                }
            ],
            table: {
                headers: ["剪枝器", "原理", "适用场景"],
                rows: [
                    ["MedianPruner", "低于历史中位数则剪枝", "通用场景，简单可靠"],
                    ["HyperbandPruner", "Successive Halving 自动资源分配", "计算预算固定时"],
                    ["PatientPruner", "连续 N 次低于阈值才剪枝", "训练曲线波动大时"],
                    ["PercentilePruner", "低于历史百分位则剪枝", "更激进的剪枝策略"]
                ]
            },
            mermaid: "graph TD\n    A[\"启动 Trial\"] --> B[\"训练第1轮\"]\n    B --> C[\"report 中间结果\"]\n    C --> D[\"should_prune?\"]\n    D -->|\"是\"| E[\"TrialPruned，终止\"]\n    D -->|\"否\"| F[\"继续训练下一轮\"]\n    F --> C\n    F --> G[\"训练完成\"]\n    G --> H[\"返回最终分数\"]",
            tip: "建议：HyperbandPruner 是最省心的选择——你只需要指定最小资源（min_resource）、最大资源（max_resource）和缩减因子（reduction_factor），它会自动在探索和开发之间取得平衡。",
            warning: "陷阱：剪枝过于激进可能导致错过最终表现优秀但初期表现不佳的超参数组合。对于学习率较低的模型，初期收敛慢是正常现象，应使用 PatientPruner 增加耐心值。"
        },
        {
            title: "7. 实战：XGBoost + Optuna 完整调参流程",
            body: "现在我们把所有知识点整合起来，完成一个完整的超参数调优实战。我们选择 XGBoost 作为目标模型，因为它是结构化数据比赛中最常用的算法，同时也是超参数数量较多、调参收益明显的典型代表。XGBoost 的核心超参数可以分为三类：树结构参数（max_depth、min_child_weight）、正则化参数（reg_alpha、reg_lambda、gamma）和学习率参数（learning_rate、n_estimators）。\n\n完整的调参流程应该分阶段进行。第一阶段用较大的搜索范围和较少的试验次数快速定位有希望的区域；第二阶段缩小范围，增加试验次数进行精细搜索；第三阶段用最佳超参数重新训练整个数据集。每个阶段都使用剪枝来加速，最终通过 Optuna 的可视化模块分析结果，确保调参过程的透明和可复现。\n\n这种分阶段策略比一次性用大量试验搜索整个空间更高效，因为第一阶段的粗搜索可以排除掉明显不好的区域，第二阶段的精搜索可以集中在真正有潜力的子空间中。这是工业界常用的调参范式。",
            code: [
                {
                    lang: "python",
                    code: "import optuna\nimport xgboost as xgb\nfrom sklearn.datasets import load_breast_cancer\nfrom sklearn.model_selection import train_test_split, StratifiedKFold\nimport numpy as np\n\n# 数据准备\nX, y = load_breast_cancer(return_X_y=True)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\ndef objective(trial):\n    # 第一阶段：树结构参数\n    max_depth = trial.suggest_int(\"max_depth\", 3, 15)\n    min_child_weight = trial.suggest_int(\"min_child_weight\", 1, 10)\n    gamma = trial.suggest_float(\"gamma\", 0.0, 5.0)\n\n    # 第二阶段：学习率和正则化\n    learning_rate = trial.suggest_float(\"learning_rate\", 0.01, 0.3, log=True)\n    subsample = trial.suggest_float(\"subsample\", 0.6, 1.0)\n    colsample_bytree = trial.suggest_float(\"colsample_bytree\", 0.6, 1.0)\n    reg_alpha = trial.suggest_float(\"reg_alpha\", 0.0, 10.0, log=True)\n    reg_lambda = trial.suggest_float(\"reg_lambda\", 0.0, 10.0, log=True)\n\n    model = xgb.XGBClassifier(\n        n_estimators=500, learning_rate=learning_rate,\n        max_depth=max_depth, min_child_weight=min_child_weight,\n        gamma=gamma, subsample=subsample, colsample_bytree=colsample_bytree,\n        reg_alpha=reg_alpha, reg_lambda=reg_lambda,\n        eval_metric=\"logloss\", random_state=42,\n        use_label_encoder=False\n    )\n\n    # 5 折交叉验证\n    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\n    scores = []\n    for fold, (tr_idx, va_idx) in enumerate(skf.split(X_train, y_train)):\n        X_tr, X_va = X_train[tr_idx], X_train[va_idx]\n        y_tr, y_va = y_train[tr_idx], y_train[va_idx]\n\n        model.fit(\n            X_tr, y_tr, eval_set=[(X_va, y_va)],\n            callbacks=[optuna.integration.XGBoostPruningCallback(trial, \"validation_0-logloss\")],\n            verbose=False\n        )\n        scores.append(model.score(X_va, y_va))\n        trial.report(np.mean(scores), step=fold)\n        if trial.should_prune():\n            raise optuna.TrialPruned()\n\n    return np.mean(scores)\n\nstudy = optuna.create_study(\n    direction=\"maximize\",\n    sampler=optuna.samplers.TPESampler(seed=42),\n    pruner=optuna.pruners.MedianPruner(n_startup_trials=10, n_warmup_steps=2)\n)\nstudy.optimize(objective, n_trials=100)"
                },
                {
                    lang: "python",
                    code: "# 用最佳超参数训练最终模型\nbest_params = study.best_params\nprint(f\"最佳 CV 分数: {study.best_value:.4f}\")\nprint(f\"最佳超参数: {best_params}\")\n\n# 用全部训练数据训练最终模型\nfinal_model = xgb.XGBClassifier(\n    **best_params, n_estimators=500,\n    eval_metric=\"logloss\", random_state=42,\n    use_label_encoder=False\n)\nfinal_model.fit(X_train, y_train)\n\n# 测试集评估\ntest_score = final_model.score(X_test, y_test)\nprint(f\"测试集分数: {test_score:.4f}\")\n\n# 特征重要性分析\nimport matplotlib.pyplot as plt\nxgb.plot_importance(final_model, max_num_features=10, height=0.6)\nplt.title(\"XGBoost Feature Importance\")\nplt.tight_layout()\nplt.show()\n\n# 保存 Study 以供后续分析\nstudy.trials_dataframe().to_csv(\"xgb_optuna_results.csv\", index=False)\noptuna.visualization.plot_optimization_history(study).show()\noptuna.visualization.plot_param_importances(study).show()"
                }
            ],
            table: {
                headers: ["调参阶段", "试验次数", "搜索范围", "目标"],
                rows: [
                    ["阶段一：粗搜索", "30", "宽范围，大步长", "排除明显不好的区域"],
                    ["阶段二：精搜索", "100", "缩小范围，细步长", "定位最优区域"],
                    ["阶段三：最终训练", "1", "固定最佳参数", "在全部训练数据上训练"]
                ]
            },
            mermaid: "graph TD\n    A[\"加载数据\"] --> B[\"阶段一：粗搜索 30 trials\"]\n    B --> C[\"分析结果，缩小范围\"]\n    C --> D[\"阶段二：精搜索 100 trials\"]\n    D --> E[\"提取最佳参数\"]\n    E --> F[\"阶段三：全量训练\"]\n    F --> G[\"测试集评估\"]\n    G --> H[\"可视化+保存结果\"]",
            tip: "建议：分阶段调参是工业界的标准做法。第一阶段的粗搜索帮你了解每个超参数的敏感性——如果某个超参数在粗搜索中影响很小，第二阶段就可以固定它，把计算资源集中在真正重要的参数上。",
            warning: "陷阱：不要在测试集上做超参数选择。即使使用交叉验证，也要确保测试集完全独立。正确的流程是：训练集交叉验证调参 -> 全量训练集训练 -> 测试集仅做一次最终评估。"
        }
    ],
};
