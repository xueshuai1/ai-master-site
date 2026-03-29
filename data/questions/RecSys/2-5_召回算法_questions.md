# Item-Based CF / 矩阵分解 / SVD 面试题（15 道）

## Item-Based CF 题目（5 道）

### 题目 1：Item-Based vs User-Based

**问题：** Item-Based CF 和 User-Based CF 的核心区别是什么？为什么 Amazon 等电商巨头更倾向于使用 Item-Based CF？

**参考答案：**

**核心区别：**

| 维度 | User-Based CF | Item-Based CF |
|------|---------------|---------------|
| 相似度对象 | 用户之间 | 物品之间 |
| 推荐逻辑 | 相似用户喜欢的物品 | 与历史物品相似的物品 |
| 计算复杂度 | O(U²) | O(I²) |
| 稳定性 | 用户兴趣易变 | 物品关系稳定 |
| 更新频率 | 高 | 低 |

**Amazon 选择 Item-Based 的原因：**

1. **物品相对稳定**：商品库变化慢于用户行为
2. **用户量极大**：亿级用户，O(U²) 不可行
3. **离线计算**：物品相似度可预计算
4. **实时响应**：在线只需查表
5. **可解释性**："与你浏览过的商品相似"

**评分：** 5 分制，考察对比理解和工业思维

---

### 题目 2：Item 相似度计算

**问题：** Item-Based CF 中为什么常用"调整余弦相似度"而非普通余弦相似度？请给出公式并解释。

**参考答案：**

**调整余弦相似度公式：**

$$\text{sim}(i, j) = \frac{\sum_{u \in U_{ij}} (r_{ui} - \bar{r}_u)(r_{uj} - \bar{r}_u)}{\sqrt{\sum_{u \in U_i} (r_{ui} - \bar{r}_u)^2} \cdot \sqrt{\sum_{u \in U_j} (r_{uj} - \bar{r}_u)^2}}$$

**为什么需要调整：**

1. **消除用户偏置**：不同用户评分尺度不同
   - 用户 A 习惯打 4-5 分
   - 用户 B 习惯打 1-2 分
   - 但两人对物品的相对偏好可能一致

2. **普通余弦的问题**：
   - 直接用原始评分会认为 A 和 B 不相似
   - 实际上两人偏好模式相同

3. **调整后的效果**：
   - 减去用户平均分，只保留相对偏好
   - 更准确反映物品间关系

**评分：** 公式正确 2 分，解释清晰 3 分

---

### 题目 3：Item-Based 实现

**问题：** 请手写 Item-Based CF 的核心推荐函数。

**参考答案：**

```python
def item_based_recommend(user_id, user_items, item_sim, n_rec=10):
    """
    user_items: dict {item_id: rating} 用户历史
    item_sim: dict {(item_i, item_j): similarity}
    """
    scores = {}
    
    for hist_item, rating in user_items.items():
        for other_item in item_sim:
            if other_item in user_items:
                continue
            
            sim = item_sim.get((hist_item, other_item), 0)
            if sim > 0:
                scores[other_item] = scores.get(other_item, 0) + sim * rating
    
    # 排序
    recs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return recs[:n_rec]
```

**评分：** 逻辑正确 3 分，代码规范 2 分

---

### 题目 4：Item-Based 冷启动

**问题：** Item-Based CF 如何处理新物品冷启动问题？

**参考答案：**

**新物品冷启动挑战：**
- 新物品无交互记录，无法计算相似度
- 无法被推荐给任何用户

**解决方案：**

1. **基于内容**：用物品元数据找相似
   ```
   新电影 → 类型/导演/演员 → 相似老电影
   ```

2. **主动曝光**：给新物品一定流量测试
   - 探索与利用（Bandit 算法）
   - 收集初始反馈

3. **知识图谱**：利用外部知识建立关联

4. **混合策略**：CF + 内容 + 规则

**评分：** 方案全面 5 分，有深度 3 分

---

### 题目 5：Item-Based 优化

**问题：** 物品数量达到百万级时，如何优化 Item-Based CF？

**参考答案：**

**优化策略：**

1. **物品聚类**：
   - 先聚类，簇内计算相似度
   - 从 O(I²) 降到 O(I²/k)

2. **采样**：
   - 只计算热门物品相似度
   - 长尾物品用内容替代

3. **分布式计算**：
   - Spark 并行计算
   - MapReduce 架构

4. **近似最近邻**：
   - LSH（局部敏感哈希）
   - Annoy/FAISS

5. **增量更新**：
   - 只更新受影响物品
   - 在线学习

**评分：** 系统性 5 分，列举 3 分

---

## 矩阵分解题目（5 道）

### 题目 6：矩阵分解原理

**问题：** 请解释矩阵分解在推荐系统中的原理，写出基本公式。

**参考答案：**

**核心思想：**
将稀疏的用户 - 物品评分矩阵分解为两个低维稠密矩阵的乘积。

**公式：**

$$R \approx U \times V^T$$

其中：
- $R \in \mathbb{R}^{m \times n}$：评分矩阵
- $U \in \mathbb{R}^{m \times k}$：用户隐因子矩阵
- $V \in \mathbb{R}^{n \times k}$：物品隐因子矩阵
- $k \ll m, n$：隐因子维度

**预测评分：**

$$\hat{r}_{ui} = u_u^T \cdot v_i = \sum_{f=1}^{k} u_{uf} \cdot v_{if}$$

**损失函数：**

$$\min_{U,V} \sum_{(u,i) \in K} (r_{ui} - u_u^T v_i)^2 + \lambda(||U||^2 + ||V||^2)$$

**评分：** 公式正确 3 分，解释清晰 2 分

---

### 题目 7：隐因子含义

**问题：** 矩阵分解中的"隐因子"是什么含义？如何理解？

**参考答案：**

**隐因子（Latent Factor）：**

1. **定义**：通过数学方法自动学习到的抽象特征维度

2. **直观理解**：
   - 电影推荐：可能是"动作程度"、"喜剧程度"、"艺术性"等
   - 但算法不知道具体含义，是"隐式"的

3. **与显式特征对比**：
   | 显式特征 | 隐因子 |
   |----------|--------|
   | 类型、导演、演员 | 自动学习 |
   | 人工定义 | 数据驱动 |
   | 可解释 | 黑盒 |
   | 有限 | 可任意维度 |

4. **优势**：
   - 发现人类未定义的特征组合
   - 捕捉复杂模式

**评分：** 理解深入 5 分，基本理解 3 分

---

### 题目 8：SGD 优化

**问题：** 如何用随机梯度下降（SGD）训练矩阵分解模型？写出更新公式。

**参考答案：**

**SGD 更新步骤：**

1. 随机采样一个评分 $(u, i, r_{ui})$

2. 计算误差：
   $$e_{ui} = r_{ui} - \hat{r}_{ui} = r_{ui} - u_u^T v_i$$

3. 更新用户因子：
   $$u_u \leftarrow u_u + \alpha \cdot (e_{ui} \cdot v_i - \lambda \cdot u_u)$$

4. 更新物品因子：
   $$v_i \leftarrow v_i + \alpha \cdot (e_{ui} \cdot u_u - \lambda \cdot v_i)$$

其中：
- $\alpha$：学习率
- $\lambda$：正则化系数

**代码实现：**
```python
for epoch in range(n_epochs):
    for u, i, r in shuffle(ratings):
        pred = np.dot(U[u], V[i])
        error = r - pred
        U[u] += lr * (error * V[i] - reg * U[u])
        V[i] += lr * (error * U[u] - reg * V[i])
```

**评分：** 公式正确 3 分，代码 2 分

---

### 题目 9：矩阵分解 vs CF

**问题：** 矩阵分解相比传统协同过滤有什么优势和劣势？

**参考答案：**

**优势：**

| 优势 | 说明 |
|------|------|
| 解决稀疏性 | 低维稠密表示，缓解稀疏问题 |
| 泛化能力强 | 可预测未直接关联的用户 - 物品对 |
| 计算效率 | 预测时只需向量点积 O(k) |
| 可扩展性 | 适合大规模数据 |
| 可融合特征 | 易扩展加入偏置、特征等 |

**劣势：**

| 劣势 | 说明 |
|------|------|
| 可解释性差 | 隐因子含义不明确 |
| 冷启动 | 新用户/物品无法得到因子 |
| 训练成本 | 需迭代训练，不如 CF 直接 |
| 超参数敏感 | 维度 k、学习率等需调优 |

**评分：** 对比全面 5 分

---

### 题目 10：矩阵分解实现

**问题：** 请实现一个简单的矩阵分解训练函数。

**参考答案：**

```python
import numpy as np

class MatrixFactorization:
    def __init__(self, n_factors=20, lr=0.01, reg=0.02, epochs=100):
        self.n_factors = n_factors
        self.lr = lr
        self.reg = reg
        self.epochs = epochs
        self.U = None
        self.V = None
    
    def fit(self, ratings, n_users, n_items):
        # 初始化
        self.U = np.random.normal(0, 0.1, (n_users, self.n_factors))
        self.V = np.random.normal(0, 0.1, (n_items, self.n_factors))
        
        # SGD 训练
        for epoch in range(self.epochs):
            np.random.shuffle(ratings)
            for u, i, r in ratings:
                pred = np.dot(self.U[u], self.V[i])
                error = r - pred
                
                self.U[u] += self.lr * (error * self.V[i] - self.reg * self.U[u])
                self.V[i] += self.lr * (error * self.U[u] - self.reg * self.V[i])
        
        return self
    
    def predict(self, u, i):
        return np.dot(self.U[u], self.V[i])
```

**评分：** 完整正确 5 分

---

## SVD 题目（5 道）

### 题目 11：SVD 原理

**问题：** 请解释 SVD（奇异值分解）的数学原理及其在推荐系统中的应用。

**参考答案：**

**SVD 数学定义：**

对于矩阵 $R \in \mathbb{R}^{m \times n}$，SVD 分解为：

$$R = U \Sigma V^T$$

其中：
- $U \in \mathbb{R}^{m \times m}$：左奇异向量（正交矩阵）
- $\Sigma \in \mathbb{R}^{m \times n}$：奇异值对角矩阵
- $V \in \mathbb{R}^{n \times n}$：右奇异向量（正交矩阵）

**降维近似：**

取前 $k$ 个最大奇异值：

$$R \approx U_k \Sigma_k V_k^T$$

**推荐系统应用：**

1. 对用户 - 物品矩阵进行 SVD
2. 用 $U_k \Sigma_k$ 作为用户表示
3. 用 $V_k \Sigma_k$ 作为物品表示
4. 预测：$\hat{r}_{ui} = (U_k \Sigma_k)_u \cdot (V_k \Sigma_k)_i^T$

**与矩阵分解关系：**
- 经典 SVD 要求稠密矩阵
- 推荐中常用 FunkSVD（只处理已知评分）

**评分：** 数学正确 3 分，应用清晰 2 分

---

### 题目 12：FunkSVD

**问题：** 什么是 FunkSVD？它与传统 SVD 有什么区别？

**参考答案：**

**FunkSVD 核心思想：**

传统 SVD 的问题：
- 要求矩阵稠密
- 推荐评分矩阵极其稀疏（<1%）
- 填充缺失值会引入噪声

FunkSVD 解决方案：
- 只分解已知的评分
- 忽略缺失值
- 目标函数只考虑观测值

**损失函数：**

$$\min_{U,V} \sum_{(u,i) \in K} (r_{ui} - u_u^T v_i)^2 + \lambda(||U||^2 + ||V||^2)$$

其中 $K$ 是已知评分集合。

**区别对比：**

| 特性 | 传统 SVD | FunkSVD |
|------|----------|---------|
| 数据要求 | 稠密矩阵 | 稀疏矩阵 |
| 缺失值处理 | 需填充 | 直接忽略 |
| 优化方法 | 特征分解 | SGD/ALS |
| 推荐适用性 | 差 | 好 |

**评分：** 理解准确 5 分

---

### 题目 13：SVD++

**问题：** SVD++ 相比 SVD 有什么改进？请写出 SVD++ 的预测公式。

**参考答案：**

**SVD++ 改进：**

1. **融入隐式反馈**：
   - 不仅用显式评分
   - 还利用浏览、点击等隐式行为

2. **用户偏置建模**：
   - 用户平均评分倾向
   - 物品平均评分倾向

**SVD++ 预测公式：**

$$\hat{r}_{ui} = \mu + b_u + b_i + q_i^T \left(p_u + |N(u)|^{-\frac{1}{2}} \sum_{j \in N(u)} y_j\right)$$

其中：
- $\mu$：全局平均评分
- $b_u$：用户偏置
- $b_i$：物品偏置
- $p_u$：用户隐因子
- $q_i$：物品隐因子
- $N(u)$：用户 $u$ 有隐式反馈的物品集合
- $y_j$：物品 $j$ 的隐式反馈因子

**核心改进：**
- 用户表示 = 显式因子 + 隐式反馈聚合
- 更全面捕捉用户偏好

**评分：** 公式正确 3 分，解释 2 分

---

### 题目 14：截断 SVD

**问题：** 为什么在推荐系统中使用截断 SVD（Truncated SVD）？如何选择截断维度 k？

**参考答案：**

**截断 SVD 的作用：**

1. **降维**：
   - 从 $m \times n$ 降到 $m \times k$
   - 减少存储和计算

2. **去噪**：
   - 小奇异值通常对应噪声
   - 保留主要信号

3. **防止过拟合**：
   - 限制模型复杂度
   - 提高泛化能力

**选择 k 的方法：**

1. **解释方差比例**：
   ```python
   svd = TruncatedSVD(n_components=k)
   svd.fit(rating_matrix)
   explained_var = svd.explained_variance_ratio_.sum()
   # 选择使累计方差>80% 的 k
   ```

2. **交叉验证**：
   - 尝试不同 k 值
   - 选择验证集 RMSE 最小的

3. **经验法则**：
   - 小数据集：k=10~50
   - 大数据集：k=50~200
   - 通常 k << min(m, n)

4. **肘部法则**：
   - 画奇异值 scree plot
   - 选择曲线拐点

**评分：** 理解深入 5 分

---

### 题目 15：SVD 实现

**问题：** 使用 sklearn 实现 SVD 推荐。

**参考答案：**

```python
from sklearn.decomposition import TruncatedSVD
from scipy.sparse import csr_matrix
import numpy as np

class SVDRecommender:
    def __init__(self, n_components=20):
        self.svd = TruncatedSVD(n_components=n_components)
        self.user_map = {}
        self.item_map = {}
        self.U = None
        self.Vt = None
    
    def fit(self, ratings_df):
        # 构建映射
        users = ratings_df['user_id'].unique()
        items = ratings_df['item_id'].unique()
        self.user_map = {u: i for i, u in enumerate(users)}
        self.item_map = {i: j for j, i in enumerate(items)}
        
        # 构建稀疏矩阵
        row = [self.user_map[u] for u in ratings_df['user_id']]
        col = [self.item_map[i] for i in ratings_df['item_id']]
        data = ratings_df['rating'].values
        R = csr_matrix((data, (row, col)), 
                       shape=(len(users), len(items)))
        
        # SVD 分解
        self.U = self.svd.fit_transform(R)
        self.Vt = self.svd.components_
        
        return self
    
    def predict(self, user_id, item_id):
        u_idx = self.user_map[user_id]
        i_idx = self.item_map[item_id]
        return np.dot(self.U[u_idx], self.Vt[:, i_idx])
    
    def recommend(self, user_id, n_rec=10):
        u_idx = self.user_map[user_id]
        user_vector = self.U[u_idx]
        
        # 计算与所有物品的分数
        scores = np.dot(self.Vt.T, user_vector)
        
        # 排序
        top_items = np.argsort(scores)[::-1][:n_rec]
        
        # 转换回 ID
        reverse_map = {j: i for i, j in self.item_map.items()}
        return [(reverse_map[i], scores[i]) for i in top_items]
```

**评分：** 完整可运行 5 分

---

## 综合评分标准

| 总分 | 等级 | 说明 |
|------|------|------|
| 68-75 | 优秀 | 深入理解，能灵活运用 |
| 55-67 | 良好 | 掌握核心，能解决常见问题 |
| 40-54 | 一般 | 了解基础，缺乏深度 |
| <40 | 较差 | 概念不清，需加强学习 |
