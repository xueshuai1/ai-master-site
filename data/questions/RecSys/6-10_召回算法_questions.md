# SVD / SVD++ / ALS / BPR 面试题（20 道）

## SVD 题目（5 道）

### 题目 1：SVD 与矩阵分解的关系

**问题：** SVD 和矩阵分解（MF）是什么关系？有什么区别？

**参考答案：**

**关系：**
- SVD 是矩阵分解的一种特殊形式
- 矩阵分解是更广义的概念

**区别对比：**

| 维度 | 经典 SVD | 矩阵分解 (MF) |
|------|----------|--------------|
| 数学基础 | 奇异值分解（线性代数定理） | 优化问题（损失函数最小化） |
| 数据要求 | 稠密矩阵 | 稀疏矩阵 |
| 缺失值 | 需填充 | 直接忽略 |
| 正交性 | U、V 正交 | 无正交约束 |
| 唯一性 | 唯一解 | 多解（依赖初始化） |
| 推荐适用性 | 差 | 好 |

**FunkSVD：**
- 专门为推荐设计的变体
- 只分解已知评分
- 用 SGD/ALS 优化

**评分：** 关系清晰 2 分，对比准确 3 分

---

### 题目 2：SVD 降维原理

**问题：** 为什么 SVD 可以用于降维？如何选择保留的奇异值数量 k？

**参考答案：**

**降维原理：**

1. **奇异值含义**：
   - 奇异值大小表示对应方向的重要性
   - 大奇异值对应主要信号
   - 小奇异值对应噪声

2. **能量集中**：
   - 前 k 个奇异值通常包含大部分信息
   - 截断后近似原矩阵

3. **最优近似**：
   - Eckart-Young 定理：截断 SVD 是秩 k 矩阵中的最优近似

**选择 k 的方法：**

```python
# 方法 1：解释方差比例
svd = TruncatedSVD(n_components=100)
svd.fit(X)
cumulative_var = np.cumsum(svd.explained_variance_ratio_)
k = np.argmax(cumulative_var >= 0.8) + 1  # 80% 方差

# 方法 2：交叉验证
best_k, best_rmse = None, float('inf')
for k in [10, 20, 50, 100, 200]:
    rmse = cross_validate(k, data)
    if rmse < best_rmse:
        best_k, best_rmse = k, rmse

# 方法 3：肘部法则
plt.plot(singular_values)
# 选择曲线拐点
```

**经验法则：**
- 小数据集：k=10~50
- 大数据集：k=50~200
- 通常远小于 min(m, n)

**评分：** 原理清晰 3 分，方法实用 2 分

---

### 题目 3：SVD 实现

**问题：** 使用 numpy 实现截断 SVD。

**参考答案：**

```python
import numpy as np
from scipy.sparse.linalg import svds

def truncated_svd(rating_matrix, k=20):
    """
    截断 SVD
    
    Args:
        rating_matrix: 稀疏矩阵 (用户×物品)
        k: 保留的奇异值数量
    
    Returns:
        U_k, Sigma_k, Vt_k
    """
    # 使用 scipy 的稀疏 SVD
    U, sigma, Vt = svds(rating_matrix.astype(float), k=k)
    
    # svds 返回的奇异值是升序，需要反转
    idx = np.argsort(sigma)[::-1]
    U = U[:, idx]
    sigma = sigma[idx]
    Vt = Vt[idx, :]
    
    return U, sigma, Vt

def predict_svd(U, sigma, Vt, user_idx, item_idx):
    """SVD 预测评分"""
    # R ≈ U × Σ × Vt
    # r_ui ≈ U[u] × Σ × Vt[:, i]
    return np.dot(U[user_idx] * sigma, Vt[:, item_idx])

# 使用示例
U, sigma, Vt = truncated_svd(R, k=20)
pred = predict_svd(U, sigma, Vt, user_idx=0, item_idx=5)
```

**评分：** 实现正确 5 分

---

### 题目 4：SVD 冷启动

**问题：** SVD 如何处理新用户/新物品的冷启动问题？

**参考答案：**

**挑战：**
- 新用户：无历史行为，无法得到 U 向量
- 新物品：无交互记录，无法得到 V 向量

**解决方案：**

**1. 新用户处理：**
```
┌─────────────────────────────────────────────────┐
│  a. 内容初始化                                   │
│     - 用用户画像/注册信息初始化 U                │
│     - 相似用户平均作为初始值                     │
│                                                 │
│  b. 快速适应                                     │
│     - 收集少量反馈（引导评分）                   │
│     - 在线更新 U 向量                            │
│                                                 │
│  c. 混合策略                                     │
│     - 冷启动阶段用热门推荐                       │
│     - 有数据后切换 SVD                           │
└─────────────────────────────────────────────────┘
```

**2. 新物品处理：**
```
┌─────────────────────────────────────────────────┐
│  a. 内容初始化                                   │
│     - 用物品元数据初始化 V                       │
│     - 相似物品平均作为初始值                     │
│                                                 │
│  b. 主动曝光                                     │
│     - 给新物品一定流量                           │
│     - 收集初始反馈后更新 V                       │
│                                                 │
│  c. 混合推荐                                     │
│     - 新物品用内容推荐                           │
│     - 有交互后加入 SVD                           │
└─────────────────────────────────────────────────┘
```

**3. 增量 SVD：**
```python
def incremental_update(U, V, new_ratings):
    """新数据到来时增量更新"""
    # 只更新相关用户/物品的因子
    # 固定其他，SGD 几步
    pass
```

**评分：** 方案全面 5 分

---

### 题目 5：SVD 优缺点

**问题：** SVD 在推荐系统中的优缺点是什么？

**参考答案：**

**优点：**

| 优点 | 说明 |
|------|------|
| 降维去噪 | 保留主要信号，去除噪声 |
| 泛化能力强 | 可预测未见过的用户 - 物品对 |
| 数学保证 | 最优低秩近似定理 |
| 计算高效 | 预测只需点积 |
| 无需特征工程 | 自动学习隐因子 |

**缺点：**

| 缺点 | 说明 | 缓解方案 |
|------|------|----------|
| 冷启动 | 新用户/物品无法分解 | 混合推荐、内容初始化 |
| 可解释性差 | 隐因子含义不明 | 可视化、后分析 |
| 静态模型 | 无法捕捉时序变化 | 增量更新、时序模型 |
| 线性假设 | 内积是线性操作 | 核方法、神经网络 |
| 稀疏敏感 | 极端稀疏时效果差 | 正则化、贝叶斯方法 |

**评分：** 对比全面 5 分

---

## SVD++ 题目（3 道）

### 题目 6：SVD++ 改进点

**问题：** SVD++ 相比 SVD 有什么改进？写出预测公式。

**参考答案：**

**SVD++ 改进：**

1. **融入隐式反馈**：
   - 不仅用显式评分
   - 还利用浏览、点击、收藏等隐式行为
   - 隐式反馈数据更丰富

2. **用户偏置建模**：
   - 全局平均 μ
   - 用户偏置 b_u
   - 物品偏置 b_i

3. **增强用户表示**：
   - 用户因子 = 显式因子 + 隐式反馈聚合

**预测公式：**

$$\hat{r}_{ui} = \mu + b_u + b_i + q_i^T \left(p_u + |N(u)|^{-\frac{1}{2}} \sum_{j \in N(u)} y_j\right)$$

**符号说明：**
- $\mu$：全局平均评分
- $b_u$：用户偏置
- $b_i$：物品偏置
- $q_i$：物品显式因子
- $p_u$：用户显式因子
- $N(u)$：用户 $u$ 有隐式反馈的物品集合
- $y_j$：物品 $j$ 的隐式反馈因子

**核心思想：**
$$用户表示 = 显式偏好 + 隐式行为聚合$$

**评分：** 公式正确 3 分，解释清晰 2 分

---

### 题目 7：SVD++ 隐式反馈

**问题：** SVD++ 中如何获取和处理隐式反馈？

**参考答案：**

**隐式反馈来源：**

| 行为类型 | 示例 | 信号强度 |
|----------|------|----------|
| 浏览 | 页面查看 | 弱 |
| 点击 | 点击链接/视频 | 中 |
| 收藏 | 加入收藏夹 | 强 |
| 分享 | 分享给他人 | 强 |
| 购买 | 下单购买 | 很强 |
| 评分 | 显式评分 | 最强 |

**处理方式：**

```python
class SVDPlusPlus:
    def __init__(self, n_factors=20):
        self.n_factors = n_factors
        # 显式因子
        self.p_u = None  # 用户
        self.q_i = None  # 物品
        # 隐式因子
        self.y_j = None  # 物品隐式反馈因子
        # 偏置
        self.mu = 0
        self.b_u = None
        self.b_i = None
    
    def fit(self, explicit_ratings, implicit_feedback):
        """
        explicit_ratings: [(u, i, r), ...]
        implicit_feedback: {u: [item1, item2, ...], ...}
        """
        # 初始化所有参数
        # SGD 优化损失函数
        # 同时更新显式和隐式因子
        pass
    
    def predict(self, u, i):
        # 获取用户隐式反馈物品
        N_u = self.implicit_feedback.get(u, [])
        
        # 隐式反馈聚合
        if len(N_u) > 0:
            implicit_sum = sum(self.y_j[j] for j in N_u)
            implicit_factor = implicit_sum / np.sqrt(len(N_u))
        else:
            implicit_factor = 0
        
        # 用户增强表示
        user_repr = self.p_u[u] + implicit_factor
        
        # 预测
        pred = self.mu + self.b_u[u] + self.b_i[i]
        pred += np.dot(self.q_i[i], user_repr)
        
        return pred
```

**评分：** 理解准确 5 分

---

### 题目 8：SVD++ 训练复杂度

**问题：** SVD++ 的训练复杂度是多少？如何优化？

**参考答案：**

**复杂度分析：**

设：
- $m$：用户数
- $n$：物品数
- $k$：因子维度
- $|K|$：显式评分数
- $|N|$：隐式反馈总数

**每轮 SGD 复杂度：**
- 显式评分更新：O($|K| \cdot k$)
- 隐式反馈更新：O($|N| \cdot k$)
- 总复杂度：O($(|K| + |N|) \cdot k$)

**优化方法：**

**1. 采样：**
```python
# 只采样部分隐式反馈
def sample_implicit_feedback(user_implicit, max_samples=100):
    if len(user_implicit) > max_samples:
        return random.sample(user_implicit, max_samples)
    return user_implicit
```

**2. 批量更新：**
```python
# Mini-batch SGD
batch_size = 256
for batch in data_loader:
    # 批量计算梯度
    # 批量更新
```

**3. 并行化：**
- 用户/物品独立，可并行更新
- 使用 Spark/PyTorch 分布式

**4. 增量更新：**
- 只更新受影响参数
- 在线学习

**评分：** 分析准确 3 分，优化实用 2 分

---

## ALS 题目（5 道）

### 题目 9：ALS 原理

**问题：** 请解释 ALS（交替最小二乘）的原理和更新公式。

**参考答案：**

**ALS 核心思想：**

矩阵分解的损失函数对 $U$ 和 $V$ 同时优化是非凸的，但：
- 固定 $V$ 时，对 $U$ 是凸的（有闭式解）
- 固定 $U$ 时，对 $V$ 是凸的（有闭式解）

交替优化：固定一个，求解另一个，反复迭代。

**更新公式：**

**固定 $V$，更新 $U$：**

对于用户 $u$，评分过的物品集合为 $I_u$：

$$u_u = \left(V_{I_u}^T V_{I_u} + \lambda I\right)^{-1} V_{I_u}^T r_u$$

其中：
- $V_{I_u}$：用户 $u$ 评分过的物品的因子矩阵
- $r_u$：用户 $u$ 的评分向量
- $\lambda$：正则化系数
- $I$：单位矩阵

**固定 $U$，更新 $V$：**

$$v_i = \left(U_{U_i}^T U_{U_i} + \lambda I\right)^{-1} U_{U_i}^T r_i$$

**算法流程：**
```
初始化 U, V
for iteration in 1..T:
    # 更新 U
    for each user u:
        u_u = (V_Iu^T V_Iu + λI)^(-1) V_Iu^T r_u
    
    # 更新 V
    for each item i:
        v_i = (U_Ui^T U_Ui + λI)^(-1) U_Ui^T r_i
    
    # 检查收敛
    if converged:
        break
```

**评分：** 原理清晰 3 分，公式正确 2 分

---

### 题目 10：ALS vs SGD

**问题：** ALS 和 SGD 各有什么优缺点？如何选择？

**参考答案：**

**对比分析：**

| 维度 | ALS | SGD |
|------|-----|-----|
| 优化方式 | 交替闭式解 | 梯度下降 |
| 并行性 | 高（用户/物品独立） | 低（需同步） |
| 收敛速度 | 快（迭代少） | 慢（迭代多） |
| 每轮成本 | 高（矩阵求逆） | 低（简单更新） |
| 稀疏数据 | 好 | 好 |
| 隐式反馈 | 原生支持 | 需负采样 |
| 实现难度 | 中 | 低 |
| 内存占用 | 高 | 低 |

**选择建议：**

```
┌─────────────────────────────────────────────────┐
│  选择 ALS 的场景：                               │
│  • 大规模分布式训练（Spark）                    │
│  • 隐式反馈数据                                 │
│  • 需要快速收敛                                 │
│  • 内存充足                                     │
├─────────────────────────────────────────────────┤
│  选择 SGD 的场景：                               │
│  • 中小规模数据                                 │
│  • 需要在线学习                                 │
│  • 内存受限                                     │
│  • 需要灵活定制损失函数                         │
└─────────────────────────────────────────────────┘
```

**工业实践：**
- Spark MLlib：ALS（分布式）
- 深度学习框架：SGD/Adam（灵活）

**评分：** 对比全面 5 分

---

### 题目 11：ALS 隐式反馈

**问题：** ALS 如何处理隐式反馈数据？

**参考答案：**

**隐式反馈特点：**
- 只有正样本（点击、浏览等）
- 没有明确的负样本
- 数据量远大于显式评分

**ALS 隐式反馈模型：**

**置信度权重：**
$$c_{ui} = 1 + \alpha \cdot r_{ui}$$

其中 $r_{ui}$ 是交互次数（如点击次数），$\alpha$ 是缩放参数。

**损失函数：**
$$\min_{U,V} \sum_{u,i} c_{ui} (p_{ui} - u_u^T v_i)^2 + \lambda(\sum_u ||u_u||^2 + \sum_i ||v_i||^2)$$

其中 $p_{ui} = 1$ 如果有交互，否则为 0。

**更新公式：**
$$u_u = \left(V^T C^u V + \lambda I\right)^{-1} V^T C^u p_u$$

其中 $C^u$ 是对角矩阵，对角线元素为 $c_{ui}$。

**代码实现：**
```python
from pyspark.mllib.recommendation import ALS

# Spark ALS 隐式反馈
model = ALS.trainImplicit(
    ratings_rdd,      # (user, item, count)
    rank=20,
    iterations=20,
    alpha=0.01,       # 置信度缩放
    regularization=0.1
)
```

**评分：** 理解准确 5 分

---

### 题目 12：ALS 实现

**问题：** 实现一个简单的 ALS 训练函数。

**参考答案：**

```python
import numpy as np

def als_train(rating_matrix, n_factors=20, n_iterations=20, reg=0.1):
    """
    ALS 训练
    
    Args:
        rating_matrix: 稀疏矩阵 (用户×物品)
        n_factors: 隐因子维度
        n_iterations: 迭代次数
        reg: 正则化系数
    
    Returns:
        U, V: 用户和物品因子矩阵
    """
    from scipy.sparse import csr_matrix
    
    n_users, n_items = rating_matrix.shape
    
    # 初始化
    U = np.random.normal(0, 0.1, (n_users, n_factors))
    V = np.random.normal(0, 0.1, (n_items, n_factors))
    
    # 正则化矩阵
    reg_matrix = reg * np.eye(n_factors)
    
    for iteration in range(n_iterations):
        # 更新 U
        for u in range(n_users):
            items_u = rating_matrix[u].nonzero()[1]
            if len(items_u) == 0:
                continue
            
            V_u = V[items_u]
            r_u = rating_matrix[u, items_u].toarray().flatten()
            
            A = V_u.T @ V_u + reg_matrix
            b = V_u.T @ r_u
            U[u] = np.linalg.solve(A, b)
        
        # 更新 V
        for i in range(n_items):
            users_i = rating_matrix[:, i].nonzero()[0]
            if len(users_i) == 0:
                continue
            
            U_i = U[users_i]
            r_i = rating_matrix[users_i, i].toarray().flatten()
            
            A = U_i.T @ U_i + reg_matrix
            b = U_i.T @ r_i
            V[i] = np.linalg.solve(A, b)
        
        # 计算 RMSE
        if (iteration + 1) % 5 == 0:
            pred = U @ V.T
            mask = rating_matrix.toarray() > 0
            rmse = np.sqrt(np.mean((rating_matrix.toarray()[mask] - pred[mask]) ** 2))
            print(f"Iter {iteration + 1}, RMSE: {rmse:.4f}")
    
    return U, V
```

**评分：** 完整正确 5 分

---

### 题目 13：ALS 分布式

**问题：** 如何在 Spark 上分布式实现 ALS？

**参考答案：**

**Spark ALS 架构：**

```
Driver
  ├── 初始化 U, V
  ├── 分发数据到 Executor
  └── 聚合更新结果

Executor (多个)
  ├── 本地更新 U 或 V
  ├── 计算梯度
  └── 返回更新
```

**Spark MLlib 使用：**

```python
from pyspark.ml.recommendation import ALS
from pyspark.sql import SparkSession

# 创建 SparkSession
spark = SparkSession.builder.appName("ALS").getOrCreate()

# 准备数据
ratings = spark.read.csv("ratings.csv", header=True, inferSchema=True)

# 配置 ALS
als = ALS(
    userCol="user_id",
    itemCol="item_id",
    ratingCol="rating",
    rank=20,
    maxIter=20,
    regParam=0.1,
    coldStartStrategy="drop"
)

# 训练
model = als.fit(ratings)

# 预测
predictions = model.transform(ratings)

# 推荐
user_recs = model.recommendForAllUsers(10)
item_recs = model.recommendForAllItems(10)
```

**优化技巧：**
1. 数据分区：按用户/物品分区
2. 缓存中间结果
3. 调整并行度
4. 检查点防止 lineage 过长

**评分：** 架构清晰 3 分，代码实用 2 分

---

## BPR 题目（5 道）

### 题目 14：BPR 原理

**问题：** 请解释 BPR（Bayesian Personalized Ranking）的核心思想和损失函数。

**参考答案：**

**BPR 核心思想：**

传统矩阵分解优化评分预测误差，但：
- 推荐任务是排序，不是评分预测
- 隐式反馈只有正样本，无评分

BPR 直接优化**排序关系**：
- 对用户 $u$，物品 $i$（正样本）应排在 $j$（负样本）前面
- 优化成对排序损失

**BPR 损失函数：**

$$\text{BPR-OPT} = \sum_{(u, i, j) \in D} -\ln \sigma(\hat{y}_{ui} - \hat{y}_{uj}) + \lambda \Theta$$

其中：
- $D = \{(u, i, j) | u \in U, i \in I_u^+, j \in I \setminus I_u^+\}$
- $I_u^+$：用户 $u$ 有正反馈的物品
- $\hat{y}_{ui} = u_u^T v_i$：预测分数
- $\sigma$：sigmoid 函数
- $\Theta$：模型参数（正则化项）

**梯度：**

$$\frac{\partial \text{BPR-OPT}}{\partial \Theta} = \sum_{(u,i,j) \in D} \frac{-\sigma(-(\hat{y}_{ui} - \hat{y}_{uj}))}{\lambda} \frac{\partial (\hat{y}_{ui} - \hat{y}_{uj})}{\partial \Theta}$$

**评分：** 思想清晰 3 分，公式正确 2 分

---

### 题目 15：BPR 采样

**问题：** BPR 训练时如何采样三元组 (u, i, j)？

**参考答案：**

**采样策略：**

```python
def sample_bpr_triplet(user_items, n_items):
    """
    采样 BPR 三元组 (user, positive_item, negative_item)
    
    Args:
        user_items: dict {user: [positive_items]}
        n_items: 总物品数
    
    Returns:
        (u, i, j): 三元组
    """
    import random
    
    # 随机选用户
    u = random.choice(list(user_items.keys()))
    pos_items = user_items[u]
    
    if len(pos_items) == 0:
        return None
    
    # 随机选正样本
    i = random.choice(pos_items)
    
    # 随机选负样本（用户未交互的物品）
    while True:
        j = random.randint(0, n_items - 1)
        if j not in pos_items:
            break
    
    return u, i, j
```

**采样优化：**

**1. 流行度加权采样：**
```python
# 热门物品更可能作为负样本（更难区分）
def sample_negative_popularity_weighted(pos_items, item_popularity):
    probs = np.array([item_popularity[i] for i in range(n_items)])
    probs[list(pos_items)] = 0  # 排除正样本
    probs /= probs.sum()
    return np.random.choice(n_items, p=probs)
```

**2. 难例挖掘：**
```python
# 选择预测分数高的负样本（更难区分）
def sample_hard_negative(u, pos_items, V, u_factor):
    scores = V @ u_factor
    scores[list(pos_items)] = -float('inf')
    # 从高分中采样
    return np.argmax(scores)
```

**评分：** 采样正确 3 分，优化 2 分

---

### 题目 16：BPR 实现

**问题：** 实现 BPR 训练代码。

**参考答案：**

```python
import numpy as np

class BPR:
    """Bayesian Personalized Ranking"""
    
    def __init__(self, n_factors=20, lr=0.01, reg=0.01, n_iterations=100):
        self.n_factors = n_factors
        self.lr = lr
        self.reg = reg
        self.n_iterations = n_iterations
        self.U = None
        self.V = None
    
    def fit(self, user_items, n_items):
        """
        Args:
            user_items: dict {user: [positive_items]}
            n_items: 总物品数
        """
        n_users = len(user_items)
        users = list(user_items.keys())
        user_to_idx = {u: i for i, u in enumerate(users)}
        
        # 初始化
        self.U = np.random.normal(0, 0.01, (n_users, self.n_factors))
        self.V = np.random.normal(0, 0.01, (n_items, self.n_factors))
        
        # 训练
        n_samples = sum(len(items) for items in user_items.values())
        
        for iteration in range(self.n_iterations):
            for _ in range(n_samples):
                # 采样三元组
                u = random.choice(users)
                u_idx = user_to_idx[u]
                pos_items = user_items[u]
                
                if len(pos_items) == 0:
                    continue
                
                i = random.choice(pos_items)
                
                while True:
                    j = random.randint(0, n_items - 1)
                    if j not in pos_items:
                        break
                
                # 计算分数差
                x_uij = np.dot(self.U[u_idx], self.V[i]) - np.dot(self.U[u_idx], self.V[j])
                
                # sigmoid 梯度
                sigmoid = 1 / (1 + np.exp(-x_uij))
                
                # 更新
                self.U[u_idx] += self.lr * (sigmoid * (self.V[i] - self.V[j]) - self.reg * self.U[u_idx])
                self.V[i] += self.lr * (sigmoid * self.U[u_idx] - self.reg * self.V[i])
                self.V[j] += self.lr * (-sigmoid * self.U[u_idx] - self.reg * self.V[j])
        
        return self
    
    def predict(self, u, i):
        u_idx = list(self.user_to_idx.values()).index(u) if u in self.user_to_idx else -1
        if u_idx == -1:
            return 0
        return np.dot(self.U[u_idx], self.V[i])
    
    def recommend(self, u, user_pos_items, n_rec=10):
        u_idx = list(self.user_to_idx.values()).index(u)
        scores = self.V @ self.U[u_idx]
        
        # 排除已交互
        for i in user_pos_items:
            scores[i] = -float('inf')
        
        top_items = np.argsort(scores)[::-1][:n_rec]
        return [(i, scores[i]) for i in top_items]
```

**评分：** 完整正确 5 分

---

### 题目 17：BPR 评估指标

**问题：** BPR 模型用什么指标评估？为什么不用 RMSE？

**参考答案：**

**为什么不用 RMSE：**

1. **隐式反馈无真实评分**：只有 0/1 或有无交互
2. **推荐是排序任务**：关心相对顺序，不是绝对分数
3. **正负样本不平衡**：负样本是未观测，不一定是真负

**BPR 评估指标：**

**1. AUC（Area Under ROC Curve）：**
$$\text{AUC} = \frac{1}{|U|} \sum_{u \in U} \frac{1}{|I_u^+| \cdot |I \setminus I_u^+|} \sum_{i \in I_u^+} \sum_{j \in I \setminus I_u^+} \mathbb{I}(\hat{y}_{ui} > \hat{y}_{uj})$$

直观：随机选一对 (正，负)，正样本分数更高的概率。

**2. Hit Rate @ K：**
$$\text{HR@K} = \frac{1}{|U|} \sum_{u \in U} \mathbb{I}(\text{至少一个正样本在 Top-K})$$

**3. NDCG @ K：**
考虑位置的排序质量。

**代码实现：**
```python
def evaluate_auc(model, test_data, n_items):
    correct = 0
    total = 0
    
    for u, pos_items in test_data.items():
        for i in pos_items:
            for j in range(n_items):
                if j not in pos_items:
                    pred_i = model.predict(u, i)
                    pred_j = model.predict(u, j)
                    if pred_i > pred_j:
                        correct += 1
                    total += 1
    
    return correct / total if total > 0 else 0
```

**评分：** 理解准确 5 分

---

### 题目 18：BPR 应用场景

**问题：** BPR 适合什么场景？与矩阵分解对比。

**参考答案：**

**BPR 适用场景：**

| 场景 | 说明 | 示例 |
|------|------|------|
| 隐式反馈 | 只有点击/浏览，无评分 | 电商、视频、新闻 |
| 排序任务 | 关心相对顺序 | Top-N 推荐 |
| 正负样本不平衡 | 负样本是未观测 | 大多数推荐场景 |
| One-Class CF | 只有正样本 | 社交网络关注 |

**与矩阵分解对比：**

| 维度 | 矩阵分解 | BPR |
|------|----------|-----|
| 优化目标 | 评分预测误差 | 排序关系 |
| 数据类型 | 显式评分 | 隐式反馈 |
| 损失函数 | 平方误差 | 成对排序 |
| 评估指标 | RMSE | AUC/HR/NDCG |
| 适用场景 | 有评分数据 | 隐式反馈 |

**选择建议：**
```
有显式评分 → 矩阵分解 (SVD/BiasSVD)
只有隐式反馈 → BPR
两者都有 → 融合或分别训练
```

**评分：** 对比清晰 5 分

---

## 综合评分标准

| 总分 | 等级 | 说明 |
|------|------|------|
| 90-100 | 优秀 | 深入理解，灵活运用 |
| 75-89 | 良好 | 掌握核心，解决常见问题 |
| 60-74 | 一般 | 了解基础，缺乏深度 |
| <60 | 较差 | 概念不清，需加强学习 |
