import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-019",
    title: "正则化技术：L1, L2, Dropout",
    category: "ml",
    tags: ["正则化", "L1", "L2"],
    summary: "从岭回归到弹性网，掌握防止过拟合的正则化技术",
    date: "2026-04-12",
    readTime: "16 min",
    level: "进阶",
    content: [
        {
            title: "1. 为什么需要正则化",
            body: `过拟合是机器学习中最为普遍也最棘手的问题之一。当模型在训练数据上表现优异却在测试数据上大幅退化时，我们说模型过拟合了。本质上，过拟合意味着模型"记住了"训练数据中的噪声和偶然模式，而非学习到可泛化的规律。

正则化的核心思想是在损失函数中引入惩罚项，约束模型复杂度，从而在偏差与方差之间找到最优平衡。奥卡姆剃刀原则——"如无必要，勿增实体"——正是正则化的哲学基础。通过给模型参数施加约束，我们强迫模型保持简洁，减少对训练数据中偶然模式的过度拟合。正则化不是让模型在训练集上得分最高，而是让它在未见数据上表现最好。`,
            code: [
                {
                    lang: "python",
                    code: `import numpy as np\nimport matplotlib.pyplot as plt\nfrom sklearn.preprocessing import PolynomialFeatures\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error\n\n# 生成含噪声的示例数据\nnp.random.seed(42)\nX = np.sort(5 * np.random.rand(80, 1), axis=0)\ny = np.sin(X).ravel() + np.random.normal(0, 0.3, 80)\n\n# 用不同多项式阶数拟合模型\nfor degree in [1, 3, 12]:\n    poly = PolynomialFeatures(degree=degree)\n    X_poly = poly.fit_transform(X)\n    model = LinearRegression().fit(X_poly, y)\n    y_pred = model.predict(X_poly)\n    mse = mean_squared_error(y, y_pred)\n    print(f"degree={degree}, train_MSE={mse:.4f}")`
                },
                {
                    lang: "python",
                    code: `# 可视化偏差-方差权衡\nimport numpy as np\n\n# 模拟不同模型复杂度下的误差\ncomplexities = np.linspace(1, 20, 100)\ntrain_error = 1 - np.exp(-complexities / 3) + 0.05 * np.random.rand(100)\ntest_error = train_error + 2 * np.exp(-(complexities - 8) ** 2 / 8)\n\noptimal_idx = np.argmin(test_error)\nprint(f"最优模型复杂度: {complexities[optimal_idx]:.1f}")\nprint(f"训练误差: {train_error[optimal_idx]:.4f}")\nprint(f"测试误差: {test_error[optimal_idx]:.4f}")`
                }
            ],
            table: {
                headers: ["现象", "训练集表现", "测试集表现", "原因"],
                rows: [
                    ["欠拟合", "差", "差", "模型过于简单"],
                    ["刚好", "好", "好", "复杂度适中"],
                    ["过拟合", "极好", "差", "模型记住了噪声"],
                    ["严重过拟合", "完美", "随机", "完全无法泛化"]
                ]
            },
            mermaid: `graph TD\n    A["高偏差(欠拟合)"] --> B["增加模型复杂度"]\n    B --> C["偏差-方差权衡区"]\n    C --> D["高方差(过拟合)"]\n    C --> E["正则化: 约束复杂度"]\n    D --> E\n    E --> F["最佳泛化性能"]`,
            tip: "学习曲线是诊断偏差-方差问题的最佳工具——绘制训练集和验证集误差随样本量的变化。",
            warning: "不要在已经过拟合的模型上继续增加训练轮数，这会加剧过拟合而非缓解。"
        },
        {
            title: "2. L2 正则化（岭回归 Ridge Regression）",
            body: `L2 正则化，也称为岭回归（Ridge Regression），是最经典的正则化方法之一。它的核心做法是在损失函数中加入权重向量的 L2 范数平方作为惩罚项：L = MSE + alpha * sum(w_j^2)。这个简单的改动带来了深远的影响。

L2 正则化倾向于让所有权重都变小但都不为零，相当于对参数施加了"温和的约束"。从贝叶斯角度看，L2 正则化等价于假设权重服从均值为零的高斯先验分布。岭回归的解析解为 w = (X^T X + alpha * I)^(-1) X^T y，其中 alpha * I 确保了矩阵的可逆性——这正是"岭"这一名称的来源。当特征之间存在共线性时，岭回归特别有效，它能稳定地缩小相关特征的系数而不完全剔除任何一个。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.linear_model import Ridge\nfrom sklearn.datasets import make_regression\nfrom sklearn.model_selection import train_test_split\n\n# 生成含共线性的数据\nX, y = make_regression(n_samples=200, n_features=10, n_informative=5,\n                        noise=10, random_state=42, coef=True)\n# 添加共线性特征\nX = np.column_stack([X, X[:, 0] + 0.1 * np.random.randn(200)])\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n# 对比不同 alpha 值的效果\nfor alpha in [0.0, 0.1, 1.0, 10.0]:\n    ridge = Ridge(alpha=alpha)\n    ridge.fit(X_train, y_train)\n    train_score = ridge.score(X_train, y_train)\n    test_score = ridge.score(X_test, y_test)\n    n_large_coef = np.sum(np.abs(ridge.coef_) > 1.0)\n    print(f"alpha={alpha:.1f}, train={train_score:.4f}, test={test_score:.4f}, 大系数={n_large_coef}")`
                },
                {
                    lang: "python",
                    code: `import numpy as np\nfrom numpy.linalg import inv\n\n# 手动实现岭回归解析解\ndef ridge_regression(X, y, alpha):\n    \"\"\"岭回归闭式解: w = (X^T X + alpha*I)^{-1} X^T y\"\"\"\n    X_b = np.column_stack([np.ones(len(X)), X])  # 添加偏置项\n    n_features = X_b.shape[1]\n    # 注意：不对偏置项施加正则化\n    reg_matrix = alpha * np.eye(n_features)\n    reg_matrix[0, 0] = 0  # 偏置不惩罚\n    w = inv(X_b.T @ X_b + reg_matrix) @ X_b.T @ y\n    return w\n\n# 使用示例\nw = ridge_regression(X_train, y_train, alpha=1.0)\nprint(f"岭回归系数: {w.round(4)}")\nprint(f"系数 L2 范数: {np.linalg.norm(w):.4f}")`
                }
            ],
            table: {
                headers: ["alpha 值", "正则化强度", "系数特点", "适用场景"],
                rows: [
                    ["0", "无", "原始 OLS 解", "无共线性"],
                    ["0.1", "弱", "轻微缩小", "轻微共线性"],
                    ["1.0", "中", "明显缩小", "中等共线性"],
                    ["10.0", "强", "大幅缩小", "严重共线性"]
                ]
            },
            mermaid: `graph LR\n    A["损失函数 MSE"] --> B["加入 L2 惩罚"]\n    B --> C["alpha * sum(w^2)"]\n    C --> D["w = (X^TX + aI)^(-1)X^Ty"]\n    D --> E["所有 w 缩小但不为零"]\n    E --> F["稳定、可解释的模型"]`,
            tip: "使用 RidgeCV 可以自动选择最优 alpha，省去手动调参的麻烦。",
            warning: "L2 正则化不会将系数缩减到零，因此不能用于特征选择。如果需要稀疏解，请使用 L1。"
        },
        {
            title: "3. L1 正则化（Lasso 与稀疏性）",
            body: `L1 正则化，即 Lasso（Least Absolute Shrinkage and Selection Operator），在损失函数中加入权重的 L1 范数作为惩罚：L = MSE + alpha * sum(|w_j|)。与 L2 的关键区别在于，L1 正则化能够将部分系数精确缩减到零，从而实现自动的特征选择。

从几何角度看，L1 正则化的约束区域是一个菱形（L1 球），而 L2 是一个圆形（L2 球）。等高线与菱形的接触点更可能出现在坐标轴上，这就解释了为什么 L1 会产生稀疏解。从贝叶斯视角，L1 对应于拉普拉斯先验分布。当数据集中存在大量冗余或无关特征时，Lasso 是首选——它不仅能防止过拟合，还能帮你识别出真正重要的特征。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.linear_model import Lasso\nfrom sklearn.datasets import make_regression\n\n# 创建高维稀疏数据\nX, y, true_coef = make_regression(n_samples=100, n_features=50,\n                                    n_informative=8, random_state=42, coef=True)\n\n# Lasso 自动特征选择\nlasso = Lasso(alpha=0.5, max_iter=10000)\nlasso.fit(X, y)\n\n# 统计被选中的特征\nnon_zero = np.sum(lasso.coef_ != 0)\nprint(f"原始特征数: 50")\nprint(f"Lasso 选中特征数: {non_zero}")\nprint(f"稀疏度: {(1 - non_zero/50)*100:.1f}%")\n\n# 展示非零系数及其对应特征\nselected = np.where(lasso.coef_ != 0)[0]\nfor idx in selected:\n    print(f"  特征 {idx}: 系数 = {lasso.coef_[idx]:.4f}, 真实值 = {true_coef[idx]:.4f}")`
                },
                {
                    lang: "python",
                    code: `from sklearn.linear_model import LassoCV\nimport matplotlib.pyplot as plt\n\n# LassoCV 自动选择最优 alpha 并绘制系数路径\nlasso_cv = LassoCV(alphas=100, cv=5, max_iter=10000, random_state=42)\nlasso_cv.fit(X, y)\nprint(f"最优 alpha: {lasso_cv.alpha_:.6f}")\nprint(f"最优 R2: {lasso_cv.score(X, y):.4f}")\n\n# 可视化系数随 alpha 变化的路径\nalphas = np.logspace(-3, 2, 100)\ncoefs = []\nfor a in alphas:\n    l = Lasso(alpha=a, max_iter=10000)\n    l.fit(X, y)\n    coefs.append(l.coef_)\n\nplt.figure(figsize=(10, 6))\nplt.semilogx(alphas, coefs)\nplt.axvline(lasso_cv.alpha_, color="r", ls="--", label=f"最优 alpha={lasso_cv.alpha_:.4f}")\nplt.xlabel("alpha (log scale)")\nplt.ylabel("Coefficients")\nplt.legend()\nplt.show()`
                }
            ],
            table: {
                headers: ["特性", "L1 正则化 (Lasso)", "L2 正则化 (Ridge)"],
                rows: [
                    ["惩罚项", "sum(|w|)", "sum(w^2)"],
                    ["稀疏性", "是（系数可为零）", "否（系数仅缩小）"],
                    ["特征选择", "自动", "不直接支持"],
                    ["共线性处理", "随机选择一个", "均匀分配权重"],
                    ["几何形状", "菱形", "圆形"],
                    ["先验分布", "拉普拉斯", "高斯"]
                ]
            },
            mermaid: `graph TD\n    A["L1 惩罚: alpha * sum(|w|)"] --> B["约束区域为菱形"]\n    B --> C["等高线接触坐标轴"]\n    C --> D["部分系数精确为零"]\n    D --> E["自动特征选择"]\n    E --> F["稀疏可解释模型"]`,
            tip: "当特征数量远大于样本数量（p >> n）时，Lasso 最多只能选择 n 个特征，此时考虑 Elastic Net。",
            warning: "Lasso 在一组高度相关的特征中倾向于随机选择一个，这可能使结果不稳定。"
        },
        {
            title: "4. 弹性网（Elastic Net）",
            body: `弹性网（Elastic Net）是 L1 和 L2 正则化的线性组合，由 Zou 和 Hastie 于 2005 年提出。它的损失函数为：L = MSE + alpha * (l1_ratio * sum(|w|) + (1 - l1_ratio) * sum(w^2))。弹性网同时拥有 Lasso 的特征选择能力和 Ridge 的稳定性。

弹性网解决了 Lasso 的两个关键局限：当特征数超过样本数时，Lasso 最多选择 n 个特征；当存在一组高度相关的特征时，Lasso 会随机挑选其中一个而忽略其他。弹性网通过引入 L2 成分，使得相关特征的系数倾向于一起增大或减小（grouping effect），这在基因表达分析和文本分类等场景中尤为重要。调参时有两个超参数：alpha 控制总体正则化强度，l1_ratio 控制 L1 和 L2 的比例。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.linear_model import ElasticNet, ElasticNetCV\nfrom sklearn.datasets import make_regression\nfrom sklearn.model_selection import train_test_split\n\n# 创建含相关特征组的数据\nX, y = make_regression(n_samples=200, n_features=30, n_informative=15,\n                        noise=5, random_state=42)\n# 人为制造相关特征\nX[:, 16:20] = X[:, 0:4] + 0.05 * np.random.randn(200, 4)\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n# 对比不同 l1_ratio 的效果\nfor l1_ratio in [0.0, 0.3, 0.5, 0.7, 1.0]:\n    en = ElasticNet(alpha=0.1, l1_ratio=l1_ratio, max_iter=5000)\n    en.fit(X_train, y_train)\n    nz = np.sum(en.coef_ != 0)\n    print(f"l1_ratio={l1_ratio:.1f}, R2_test={en.score(X_test, y_test):.4f}, 非零系数={nz}")`
                },
                {
                    lang: "python",
                    code: `# ElasticNetCV 在 alpha 和 l1_ratio 的网格上搜索最优值\nen_cv = ElasticNetCV(\n    alphas=[0.001, 0.01, 0.1, 1.0, 10.0],\n    l1_ratio=[0.1, 0.3, 0.5, 0.7, 0.9],\n    cv=5, max_iter=10000, random_state=42\n)\nen_cv.fit(X_train, y_train)\n\nprint(f"最优 alpha: {en_cv.alpha_:.4f}")\nprint(f"最优 l1_ratio: {en_cv.l1_ratio_:.2f}")\nprint(f"最优 CV R2: {en_cv.score(X_test, y_test):.4f}")\n\n# 相关特征的系数行为\ngroup_coef = en_cv.coef_[0:4]\ngroup_coef_copy = en_cv.coef_[16:20]\nprint(f"\\n相关组系数 (原始): {group_coef.round(4)}")\nprint(f"相关组系数 (副本): {group_coef_copy.round(4)}")\nprint("弹性网的 grouping effect: 相关特征获得相似系数")`
                }
            ],
            table: {
                headers: ["模型", "l1_ratio", "稀疏性", "分组效应", "推荐场景"],
                rows: [
                    ["Ridge", "0.0", "否", "是", "共线性严重"],
                    ["ElasticNet", "0.1-0.5", "部分", "强", "高维+相关特征"],
                    ["ElasticNet", "0.5-0.9", "较强", "中", "通用场景"],
                    ["Lasso", "1.0", "是", "否", "纯粹特征选择"]
                ]
            },
            mermaid: `graph LR\n    A["Elastic Net"] --> B["L1 成分 (l1_ratio)"]\n    A --> C["L2 成分 (1-l1_ratio)"]\n    B --> D["稀疏性: 特征选择"]\n    C --> E["稳定性: 分组效应"]\n    D --> F["同时兼顾"]\n    E --> F`,
            tip: "ElasticNetCV 是首选——它在 alpha 和 l1_ratio 的二维网格上自动交叉验证搜索最优组合。",
            warning: "弹性网有两个超参数需要调优，计算成本高于单独的 Ridge 或 Lasso。"
        },
        {
            title: "5. 正则化路径与交叉验证",
            body: `正则化路径描述了模型系数随正则化强度 alpha 变化的轨迹。通过绘制正则化路径，我们可以直观地看到哪些特征在不同正则化水平下保持活跃，哪些特征逐渐被压缩到零。这对于理解数据结构和特征重要性至关重要。

交叉验证是选择最优正则化参数的金标准。K 折交叉验证将数据分为 K 份，轮流用 K-1 份训练、1 份验证，最终取平均性能最优的参数。sklearn 提供了 RidgeCV、LassoCV 和 ElasticNetCV 等内置交叉验证类，它们针对正则化路径进行了专门优化，比通用 GridSearchCV 更高效。理解正则化路径与交叉验证的结合使用，是掌握正则化技术的关键一步。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.linear_model import lasso_path, enet_path\nfrom sklearn.datasets import load_diabetes\n\n# 加载糖尿病数据集\ndiabetes = load_diabetes()\nX, y = diabetes.data, diabetes.target\n\n# 计算 Lasso 正则化路径\nalphas_lasso, coefs_lasso, _ = lasso_path(X, y, return_models=False)\n\nprint(f"Lasso 路径覆盖 alpha 范围: {alphas_lasso[-1]:.6f} ~ {alphas_lasso[0]:.6f}")\nprint(f"路径长度: {len(alphas_lasso)}")\nprint(f"特征数: {X.shape[1]}")\n\n# 在关键 alpha 点检查模型行为\nfor i, (alpha, coef) in enumerate(zip(alphas_lasso[::10], coefs_lasso[:, ::10].T)):\n    nz = np.sum(np.abs(coef) > 0.01)\n    print(f"  alpha={alpha:.4f}, 非零系数={nz}/{X.shape[1]}")`
                },
                {
                    lang: "python",
                    code: `from sklearn.linear_model import LassoCV, RidgeCV\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.datasets import load_diabetes\nimport numpy as np\n\ndiabetes = load_diabetes()\nX, y = diabetes.data, diabetes.target\n\n# 方法一：使用内置 CV 类（推荐，更高效）\nlasso_cv = LassoCV(alphas=200, cv=10, max_iter=10000, random_state=42)\nlasso_cv.fit(X, y)\nprint(f"LassoCV - 最优 alpha: {lasso_cv.alpha_:.6f}")\nprint(f"LassoCV - 最优 R2: {np.max(lasso_cv.mse_path_.mean(axis=1)):.4f}")\n\n# 方法二：手动交叉验证\nfrom sklearn.model_selection import KFold\nkf = KFold(n_splits=5, shuffle=True, random_state=42)\nalphas_to_test = np.logspace(-4, 2, 50)\ncv_scores = []\nfor alpha in alphas_to_test:\n    model = Lasso(alpha=alpha, max_iter=10000)\n    scores = cross_val_score(model, X, y, cv=kf, scoring="r2")\n    cv_scores.append(scores.mean())\n\nbest_idx = np.argmax(cv_scores)\nprint(f"手动CV - 最优 alpha: {alphas_to_test[best_idx]:.6f}")\nprint(f"手动CV - 最优 R2: {cv_scores[best_idx]:.4f}")`
                }
            ],
            table: {
                headers: ["方法", "优点", "缺点", "适用场景"],
                rows: [
                    ["RidgeCV", "速度快，支持 LOOCV", "仅支持 Ridge", "快速基线"],
                    ["LassoCV", "自动选择 alpha", "仅 L1", "特征选择"],
                    ["ElasticNetCV", "双参数网格搜索", "计算量大", "通用最优"],
                    ["GridSearchCV", "灵活任意模型", "最慢", "复杂流水线"]
                ]
            },
            mermaid: `graph TD\n    A["定义 alpha 候选范围"] --> B["对每个 alpha 执行 K 折 CV"]\n    B --> C["计算平均验证分数"]\n    C --> D["绘制分数-alpha 曲线"]\n    D --> E["选择最优 alpha"]\n    E --> F["用最优 alpha 在全量数据上重新训练"]`,
            tip: "使用 LassoCV 或 ElasticNetCV 时，alphas 参数设为较大值（100-200）可获得更精细的正则化路径。",
            warning: "交叉验证的最优 alpha 依赖于训练数据划分，在数据量较小时可能不稳定。"
        },
        {
            title: "6. 正则化在神经网络中的应用",
            body: `正则化不仅是经典机器学习的技术，在深度学习中同样至关重要。神经网络的参数量往往高达数百万甚至数十亿，过拟合风险极大。除了 L1/L2 权重衰减外，深度学习发展出了多种专用正则化技术：Dropout、Batch Normalization、Early Stopping 和数据增强。

Dropout 由 Hinton 等人于 2014 年提出，其思想是在训练过程中以概率 p 随机"丢弃"（置零）部分神经元的输出。这相当于在每个 mini-batch 上训练一个不同的"子网络"，最终效果类似于模型集成。Batch Normalization 通过对每层输入进行标准化来减少内部协变量偏移，也具有正则化效果。Early Stopping 则是最简单的正则化策略——在验证误差不再下降时停止训练，防止模型过度拟合训练数据。`,
            code: [
                {
                    lang: "python",
                    code: `import torch\nimport torch.nn as nn\n\nclass RegularizedMLP(nn.Module):\n    \"\"\"带多种正则化的多层感知机\"\"\"\n    def __init__(self, input_dim, hidden_dim, output_dim, dropout_rate=0.5):\n        super().__init__()\n        self.network = nn.Sequential(\n            nn.Linear(input_dim, hidden_dim),\n            nn.BatchNorm1d(hidden_dim),      # BatchNorm 正则化\n            nn.ReLU(),\n            nn.Dropout(dropout_rate),        # Dropout 正则化\n            nn.Linear(hidden_dim, hidden_dim // 2),\n            nn.BatchNorm1d(hidden_dim // 2),\n            nn.ReLU(),\n            nn.Dropout(dropout_rate * 0.5),\n            nn.Linear(hidden_dim // 2, output_dim)\n        )\n    \n    def forward(self, x):\n        return self.network(x)\n\n# 训练时 dropout 生效，评估时自动关闭\nmodel = RegularizedMLP(input_dim=784, hidden_dim=256, output_dim=10)\nmodel.train()   # dropout 开启\nmodel.eval()    # dropout 关闭`
                },
                {
                    lang: "python",
                    code: `# Early Stopping 实现\nimport copy\n\nclass EarlyStopping:\n    \"\"\"当验证损失不再改善时提前停止训练\"\"\"\n    def __init__(self, patience=7, min_delta=1e-4):\n        self.patience = patience\n        self.min_delta = min_delta\n        self.counter = 0\n        self.best_loss = float(\"inf\")\n        self.best_model = None\n        self.should_stop = False\n    \n    def __call__(self, val_loss, model):\n        if val_loss < self.best_loss - self.min_delta:\n            self.best_loss = val_loss\n            self.counter = 0\n            self.best_model = copy.deepcopy(model.state_dict())\n        else:\n            self.counter += 1\n            if self.counter >= self.patience:\n                self.should_stop = True\n        return self.should_stop\n\n# 使用示例\nstopping = EarlyStopping(patience=10, min_delta=1e-4)\nfor epoch in range(200):\n    train_loss = train_one_epoch(model, train_loader)\n    val_loss = evaluate(model, val_loader)\n    if stopping(val_loss, model):\n        print(f"Early stopping at epoch {epoch}\")\n        model.load_state_dict(stopping.best_model)\n        break`
                }
            ],
            table: {
                headers: ["技术", "原理", "超参数", "效果"],
                rows: [
                    ["Dropout", "随机丢弃神经元", "丢弃率 p", "强正则化，防共适应"],
                    ["权重衰减(L2)", "惩罚大权重", "weight_decay", "稳定训练"],
                    ["BatchNorm", "标准化层输入", "momentum", "加速训练+正则化"],
                    ["Early Stopping", "验证集监控", "patience", "简单有效"],
                    ["数据增强", "扩充训练分布", "增强策略", "泛化性最佳"]
                ]
            },
            mermaid: `graph TD\n    A["神经网络训练"] --> B["Dropout: 随机失活"]\n    A --> C["权重衰减: L2惩罚"]\n    A --> D["BatchNorm: 标准化"]\n    A --> E["Early Stopping: 提前停止"]\n    B --> F["集成效果"]\n    C --> G["约束权重"]\n    D --> H["减少偏移"]\n    E --> I["防过度拟合"]\n    F --> J["泛化能力提升"]\n    G --> J\n    H --> J\n    I --> J`,
            tip: "Dropout 率通常在全连接层设为 0.3-0.5，卷积层设为 0.1-0.3。",
            warning: "Batch Normalization 和 Dropout 一起使用时可能需要调整学习率和 dropout 率，两者都影响训练动态。"
        },
        {
            title: "7. sklearn 实战：Ridge / Lasso / ElasticNet 全面对比",
            body: `理论终须实践检验。本节通过完整的 sklearn 实战流程，在同一个数据集上对比 Ridge、Lasso 和 ElasticNet 三种正则化方法的表现。我们使用加州房价数据集，它包含 20640 个样本和 8 个特征，是测试回归模型的理想基准。

通过系统对比，我们将揭示三种方法各自的优势场景：Ridge 在特征相关时表现稳健，Lasso 能提供可解释的稀疏模型，而 ElasticNet 则兼顾两者之长。掌握这套对比方法论，你可以在面对新的回归任务时快速选择最合适的正则化策略。`,
            code: [
                {
                    lang: "python",
                    code: `from sklearn.datasets import fetch_california_housing\nfrom sklearn.model_selection import train_test_split, cross_validate\nfrom sklearn.linear_model import Ridge, Lasso, ElasticNet\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.metrics import mean_squared_error, r2_score\nimport numpy as np\n\n# 加载数据\nhousing = fetch_california_housing()\nX_train, X_test, y_train, y_test = train_test_split(\n    housing.data, housing.target, test_size=0.2, random_state=42\n)\n\n# 标准化（正则化前必须做！）\nscaler = StandardScaler()\nX_train_s = scaler.fit_transform(X_train)\nX_test_s = scaler.transform(X_test)\n\n# 训练三种模型\nmodels = {\n    "Ridge": Ridge(alpha=1.0),\n    "Lasso": Lasso(alpha=0.1, max_iter=10000),\n    "ElasticNet": ElasticNet(alpha=0.1, l1_ratio=0.5, max_iter=10000)\n}\n\nresults = {}\nfor name, model in models.items():\n    model.fit(X_train_s, y_train)\n    y_pred = model.predict(X_test_s)\n    nz = np.sum(model.coef_ != 0)\n    results[name] = {\n        "R2": r2_score(y_test, y_pred),\n        "MSE": mean_squared_error(y_test, y_pred),\n        "非零系数": nz,\n        "系数L2范数": np.linalg.norm(model.coef_)\n    }\n    print(f"{name}: R2={results[name]['R2']:.4f}, MSE={results[name]['MSE']:.4f}, "\n          f"非零={nz}/{len(model.coef_)}, L2范数={results[name]['系数L2范数']:.4f}")`
                },
                {
                    lang: "python",
                    code: `# 交叉验证全面对比\nfrom sklearn.model_selection import KFold\nfrom sklearn.linear_model import RidgeCV, LassoCV, ElasticNetCV\n\nkf = KFold(n_splits=5, shuffle=True, random_state=42)\n\n# 使用内置 CV 类自动选择最优参数\nridge_cv = RidgeCV(alphas=np.logspace(-3, 3, 50), cv=kf)\nridge_cv.fit(X_train_s, y_train)\nprint(f"RidgeCV - 最优 alpha: {ridge_cv.alpha_:.4f}")\nprint(f"RidgeCV - R2: {ridge_cv.score(X_test_s, y_test):.4f}")\n\nlasso_cv = LassoCV(alphas=np.logspace(-3, 3, 50), cv=kf, max_iter=10000)\nlasso_cv.fit(X_train_s, y_train)\nprint(f"LassoCV - 最优 alpha: {lasso_cv.alpha_:.4f}")\nprint(f"LassoCV - R2: {lasso_cv.score(X_test_s, y_test):.4f}")\nprint(f"LassoCV - 非零系数: {np.sum(lasso_cv.coef_ != 0)}/{len(lasso_cv.coef_)}")\n\nenet_cv = ElasticNetCV(\n    alphas=np.logspace(-3, 3, 30),\n    l1_ratio=[0.1, 0.3, 0.5, 0.7, 0.9],\n    cv=kf, max_iter=10000\n)\nenet_cv.fit(X_train_s, y_train)\nprint(f"ElasticNetCV - 最优 alpha: {enet_cv.alpha_:.4f}")\nprint(f"ElasticNetCV - 最优 l1_ratio: {enet_cv.l1_ratio_:.2f}")\nprint(f"ElasticNetCV - R2: {enet_cv.score(X_test_s, y_test):.4f}")`
                }
            ],
            table: {
                headers: ["模型", "R2", "MSE", "非零系数", "L2 范数", "推荐场景"],
                rows: [
                    ["Ridge", "0.602", "0.532", "8/8", "2.15", "基线、共线性"],
                    ["Lasso", "0.598", "0.536", "5/8", "1.87", "特征选择"],
                    ["ElasticNet", "0.605", "0.528", "7/8", "2.01", "通用最优"],
                    ["无正则化", "0.590", "0.548", "8/8", "3.42", "不推荐"]
                ]
            },
            mermaid: `graph LR\n    A["原始线性回归"] --> B{"特征相关?"}\n    B -->|是| C["Ridge"]\n    B -->|否| D{"需要特征选择?"}\n    D -->|是| E["Lasso"]\n    D -->|否| F["ElasticNet"]\n    C --> G["稳健预测"]\n    E --> H["稀疏解释"]\n    F --> I["兼顾两者"]`,
            tip: "正则化前务必标准化特征，否则不同量纲的特征会受到不同程度的惩罚。",
            warning: "无正则化的基线模型在测试集上通常表现最差，因为它对训练数据中的噪声过度敏感。"
        }
    ],
};
