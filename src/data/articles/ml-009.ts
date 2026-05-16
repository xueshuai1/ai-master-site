import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-009",
    title: "DBSCAN：基于密度的聚类",
    category: "ml",
    tags: ["聚类", "无监督学习", "DBSCAN"],
    summary: "从密度reachable到噪声点识别，掌握不需要预设K的聚类算法",
    date: "2026-04-12",
    readTime: "16 min",
    level: "进阶",
    content: [
      {
        title: "1. 从「距离」到「密度」的范式转换",
        body: `大多数聚类算法的直觉都建立在"距离"上：K-Means 把数据分配到最近的簇中心，层次聚类基于点对之间的距离构建树状图。但"距离近"不等于"属于同一组"——如果两个点之间隔着一条稀疏的空隙，即使它们的绝对距离不远，直觉上它们也不应该被归为一类。

DBSCAN（Density-Based Spatial Clustering of Applications with Noise）的核心洞察来自一个简单的观察：簇不是点的集合，而是高密度区域的连通分量。如果一片区域中点的密度足够高，我们就认为这是一个簇；如果某个点周围很稀疏，它就是噪声。这个直觉使得 DBSCAN 能发现任意形状的簇——月牙形、环形、螺旋形，而不只是 K-Means 擅长的球形簇。

理解 DBSCAN 的关键是转换视角：不再问"这个点离哪个中心最近"，而是问"这个点周围够不够密"。这个看似微小的转变，带来了聚类能力质的飞跃。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_moons, make_blobs
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler

# 生成非线性可分的数据
X_moons, _ = make_moons(n_samples=300, noise=0.08, random_state=42)
X_moons = StandardScaler().fit_transform(X_moons)

# K-Means 失败
km = KMeans(n_clusters=2, random_state=42).fit(X_moons)

# DBSCAN 成功
db = DBSCAN(eps=0.3, min_samples=5).fit(X_moons)

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
axes[0].scatter(X_moons[:, 0], X_moons[:, 1], c='gray', s=10)
axes[0].set_title('原始数据（月牙形）')

axes[1].scatter(X_moons[:, 0], X_moons[:, 1], c=km.labels_, cmap='viridis', s=10)
axes[1].set_title(f'K-Means (ARI={np.round(adjusted_rand_score, 2)})')

axes[2].scatter(X_moons[:, 0], X_moons[:, 1], c=db.labels_, cmap='viridis', s=10)
axes[2].set_title(f'DBSCAN (簇数={len(set(db.labels_)) - (1 if -1 in db.labels_ else 0)})')
plt.tight_layout()
plt.show()`
          },
          {
            lang: "python",
            code: `# 直观理解：密度 vs 距离
def visualize_density(X, eps, query_point_idx):
    """可视化某一点的 eps 邻域内的密度"""
    from scipy.spatial.distance import cdist
    
    query_point = X[query_point_idx:query_point_idx+1]
    distances = cdist(query_point, X).flatten()
    neighbors = np.where(distances <= eps)[0]
    
    plt.figure(figsize=(8, 6))
    plt.scatter(X[:, 0], X[:, 1], c='lightgray', s=20, label='所有点')
    plt.scatter(X[neighbors, 0], X[neighbors, 1], c='red', s=30, label='eps 邻域内的点')
    plt.scatter(X[query_point_idx, 0], X[query_point_idx, 1],
                c='blue', s=100, marker='*', zorder=5, label='查询点')
    
    circle = plt.Circle(X[query_point_idx], eps, fill=False, color='green', linewidth=2)
    plt.gca().add_patch(circle)
    plt.legend()
    plt.title(f'eps={eps}, 邻域内 {len(neighbors)} 个点')
    plt.axis('equal')
    plt.show()
    
    print(f"查询点周围密度: {len(neighbors)} 个点 / 面积 {np.pi * eps2:.2f}")`
          }
        ],
        table: {
          headers: ["聚类方法", "簇形状假设", "需要预设K", "能识别噪声", "复杂度"],
          rows: [
            ["K-Means", "球形（凸形）", "是", "否", "O(n·K·d·iter)"],
            ["层次聚类", "任意", "否（可后切）", "否", "O(n²·d)"],
            ["DBSCAN", "任意形状", "否", "是", "O(n·log n)~O(n²)"],
            ["GMM", "椭球形", "是", "软分配", "O(n·K·d·iter)"],
          ]
        },
        mermaid: `graph TD
    A["聚类直觉"] --> B["基于距离：K-Means"]
    A --> C["基于密度：DBSCAN"]
    B --> D["假设球形簇"]
    B --> E["需要预设 K"]
    C --> F["任意形状簇"]
    C --> G["自动发现簇数"]
    C --> H["识别噪声点"]`,
        tip: "当你不知道数据有多少个簇，或者怀疑簇不是球形的时候，优先尝试 DBSCAN 而不是 K-Means。"
      },
      {
        title: "2. 三种点的角色：核心点、边界点、噪声点",
        body: `DBSCAN 将所有数据点分为三类，这是理解整个算法的基础。核心点（Core Point）：在半径 eps 的邻域内至少包含 min_samples 个点（包括自身）。边界点（Border Point）：不是核心点，但位于某个核心点的 eps 邻域内。噪声点（Noise Point）：既不是核心点也不在任何核心点的邻域内。

这三类点的划分不是基于它们到某个中心的距离，而是基于局部的密度条件。核心点位于高密度区域内部——它们周围有足够的邻居，说明这里"够密"。边界点在高密度区域的边缘——它们自己不够密，但紧挨着高密度区域，所以被"拉入"了簇。噪声点则孤立地存在于低密度区域，不属于任何簇。

理解这三类点的关键是**：一个点是什么角色完全取决于 eps 和 min_samples 这两个参数。同一个点在不同参数下可能是核心点、边界点或噪声点。参数选择决定了密度的"门槛"高低。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.neighbors import NearestNeighbors
from sklearn.datasets import make_blobs

# 生成包含噪声的数据
X, _ = make_blobs(n_samples=200, centers=3, cluster_std=0.6, random_state=42)
noise = np.random.uniform(-5, 5, (20, 2))
X = np.vstack([X, noise])

eps = 0.5
min_samples = 5

# 手动识别三种点
nn = NearestNeighbors(radius=eps).fit(X)
distances, indices = nn.radius_neighbors(X)

core_mask = np.array([len(idx) >= min_samples for idx in indices])
border_mask = np.zeros(len(X), dtype=bool)
noise_mask = np.ones(len(X), dtype=bool)

for i in range(len(X)):
    if not core_mask[i]:
        # 检查是否在某个核心点的邻域内
        for j in range(len(X)):
            if core_mask[j] and i in indices[j]:
                border_mask[i] = True
                noise_mask[i] = False
                break
    else:
        noise_mask[i] = False

print(f"核心点: {core_mask.sum()}, 边界点: {border_mask.sum()}, 噪声点: {noise_mask.sum()}")

plt.figure(figsize=(10, 8))
plt.scatter(X[core_mask, 0], X[core_mask, 1], c='red', s=50, label='核心点', marker='o')
plt.scatter(X[border_mask, 0], X[border_mask, 1], c='orange', s=30, label='边界点', marker='^')
plt.scatter(X[noise_mask, 0], X[noise_mask, 1], c='black', s=20, label='噪声点', marker='x')
plt.legend(fontsize=12)
plt.title('DBSCAN 三种点的角色')
plt.axis('equal')
plt.show()`
          },
          {
            lang: "python",
            code: `# 验证 sklearn 的分类结果
from sklearn.cluster import DBSCAN
from collections import Counter

db = DBSCAN(eps=0.5, min_samples=5).fit(X)
labels = db.labels_
core_sample_indices = db.core_sample_indices_

# 重建点的角色
sklearn_core = np.zeros(len(X), dtype=bool)
sklearn_core[core_sample_indices] = True
sklearn_border = (labels >= 0) & (~sklearn_core)
sklearn_noise = (labels == -1)

print(f"sklearn - 核心点: {sklearn_core.sum()}, 边界点: {sklearn_border.sum()}, 噪声点: {sklearn_noise.sum()}")
print(f"簇分配: {Counter(labels)}")

# 可视化
fig, axes = plt.subplots(1, 2, figsize=(14, 6))
axes[0].scatter(X[sklearn_core, 0], X[sklearn_core, 1], c='red', s=50, marker='o')
axes[0].scatter(X[sklearn_border, 0], X[sklearn_border, 1], c='orange', s=30, marker='^')
axes[0].scatter(X[sklearn_noise, 0], X[sklearn_noise, 1], c='black', s=20, marker='x')
axes[0].set_title('手动实现')

colors = plt.cm.viridis(np.linspace(0, 1, len(set(labels)) - (1 if -1 in labels else 0)))
for i, label in enumerate(sorted(set(labels))):
    if label == -1:
        axes[1].scatter(X[labels == -1, 0], X[labels == -1, 1], c='black', s=20, marker='x', label='噪声')
    else:
        axes[1].scatter(X[labels == label, 0], X[labels == label, 1], c=[colors[label]], s=30, label=f'簇 {label}')
axes[1].set_title(f'sklearn DBSCAN ({len(set(labels)) - (1 if -1 in labels else 0)} 个簇)')
axes[1].legend()
plt.tight_layout()
plt.show()`
          }
        ],
        table: {
          headers: ["点的类型", "密度条件", "是否属于簇", "直观理解"],
          rows: [
            ["核心点", "eps 内 ≥ min_samples", "是", "高密度区域内部"],
            ["边界点", "eps 内 < min_samples，但在某核心点邻域内", "是（归属该核心点的簇）", "高密度区域边缘"],
            ["噪声点", "既不是核心点也不在任何核心点邻域内", "否（标记为 -1）", "孤立的低密度区域"],
          ]
        },
        mermaid: `graph TD
    A["给定点 p"] --> B{"eps 邻域内点数 ≥ min_samples?"}
    B -->|"是"| C["核心点 Core Point"]
    B -->|"否"| D{"在某核心点的 eps 邻域内?"}
    D -->|"是"| E["边界点 Border Point"]
    D -->|"否"| F["噪声点 Noise Point"]
    C --> G["可以发起密度可达传播"]
    E --> H["被核心点吸收进簇"]
    F --> I["不属于任何簇"]`,
        warning: "边界点可能被多个核心点的邻域覆盖，DBSCAN 会把它分配给第一个发现它的核心点所在的簇——这意味着边界点的簇归属在某种程度上是任意的。"
      },
      {
        title: "3. eps 和 min_samples：决定密度的两个参数",
        body: `DBSCAN 只有两个参数，但这两个参数的选择直接决定了聚类结果的质量。eps（epsilon）定义了"近"的半径——在这个距离内的点被认为是邻居。min_samples 定义了"密"的门槛——一个点周围至少需要多少个邻居才算核心点。

eps 的影响最为直观：eps 太小，大部分点都达不到密度门槛，被判定为噪声，簇支离破碎；eps 太大，多个簇会合并成一个大簇，边界模糊。min_samples 控制的是密度的"严格程度"：值越大，对密度的要求越高，越多的点被判定为噪声；值越小，密度门槛越低，越容易形成簇。

参数选择有一个经验法则：min_samples ≥ 维度数 + 1（最低限度），推荐 min_samples ≥ 2 × 维度数。对于二维数据，min_samples=5 是一个不错的起点。eps 的选择则可以通过 K-距离图来辅助确定——计算每个点到其第 min_samples 个最近邻居的距离，排序后画出曲线，肘部对应的 eps 值是一个合理的选择。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.neighbors import NearestNeighbors
import matplotlib.pyplot as plt
import numpy as np

# K-距离图：帮助选择 eps
def k_distance_graph(X, min_samples=5):
    nn = NearestNeighbors(n_neighbors=min_samples).fit(X)
    distances, _ = nn.kneighbors(X)
    # 每个点到其第 min_samples 个最近邻居的距离
    k_distances = np.sort(distances[:, -1])
    
    plt.figure(figsize=(10, 5))
    plt.plot(k_distances, 'b-', linewidth=1)
    plt.axhline(y=0.3, color='r', linestyle='--', label='eps=0.3')
    plt.xlabel('按距离排序后的样本索引')
    plt.ylabel(f'第 {min_samples} 个最近邻的距离')
    plt.title(f'K-距离图 (min_samples={min_samples})')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.show()
    
    print("肘部对应的 eps 值约 = ", np.percentile(k_distances, 80))
    return k_distances

k_distance_graph(X_moons, min_samples=5)`
          },
          {
            lang: "python",
            code: `# 参数扫描：观察 eps 和 min_samples 对聚类结果的影响
from sklearn.cluster import DBSCAN
import matplotlib.pyplot as plt

eps_range = [0.1, 0.2, 0.3, 0.5, 0.8]
min_samples_range = [3, 5, 10]

fig, axes = plt.subplots(len(eps_range), len(min_samples_range),
                          figsize=(15, 20))

for i, eps in enumerate(eps_range):
    for j, ms in enumerate(min_samples_range):
        db = DBSCAN(eps=eps, min_samples=ms).fit(X_moons)
        labels = db.labels_
        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        n_noise = list(labels).count(-1)
        
        cmap = plt.cm.get_cmap('viridis', n_clusters + 1)
        sc = axes[i, j].scatter(X_moons[:, 0], X_moons[:, 1],
                                 c=labels, cmap=cmap, s=10)
        axes[i, j].set_title(f'eps={eps}, min_samples={ms}\\n{n_clusters} 个簇, {n_noise} 噪声',
                              fontsize=9)
        axes[i, j].set_xticks([])
        axes[i, j].set_yticks([])

plt.suptitle('DBSCAN 参数扫描', fontsize=14, y=1.01)
plt.tight_layout()
plt.show()`
          }
        ],
        table: {
          headers: ["参数组合", "簇数量", "噪声比例", "适合场景"],
          rows: [
            ["小 eps, 小 min_samples", "多（过分割）", "低", "精细结构发现"],
            ["小 eps, 大 min_samples", "极少或零", "极高", "异常检测"],
            ["大 eps, 小 min_samples", "少（欠分割）", "低", "粗略分组"],
            ["大 eps, 大 min_samples", "少", "中等", "高密度核心区域"],
          ]
        },
        mermaid: `graph TD
    A["选择 min_samples"] --> B["经验公式: ≥ 维度数+1"]
    B --> C["计算 K-距离"]
    C --> D["画出 K-距离图"]
    D --> E["找肘部点"]
    E --> F["肘部距离 ≈ eps"]
    F --> G["运行 DBSCAN"]
    G --> H{"结果合理?"}
    H -->|簇太少| I["增大 eps"]
    H -->|簇太多| J["减小 eps"]
    H -->|噪声太多| K["减小 min_samples"]
    H -->|合理| L["完成"]`,
        tip: "K-距离图的肘部不一定总是明显。如果曲线很平滑，可以尝试多个 eps 值，结合业务知识来判断哪个聚类结果最有意义。"
      },
      {
        title: "4. 密度可达与密度连通：DBSCAN 的传播机制",
        body: `DBSCAN 如何从单个核心点"生长"出一个完整的簇？答案是通过两个关键概念：密度直达（Directly Density-Reachable）和密度可达（Density-Reachable）。如果点 q 在点 p 的 eps 邻域内，且 p 是核心点，那么 q 从 p 密度直达。密度可达则是密度直达的传递闭包——如果 p 到 q1 密度直达，q1 到 q2 密度直达，那么 p 到 q2 密度可达。

密度连通（Density-Connected）进一步放宽了条件：如果存在一个点 o，使得 p 和 q 都从 o 密度可达，那么 p 和 q 是密度连通的。注意这里 p 和 q 不需要互相密度可达，只要它们都能从同一个"源头"到达就行——这个源头通常是簇内部的一个核心点。

DBSCAN 的簇定义就是：一个簇是最大的密度连通点集。这意味着算法会尽可能多地把密度连通的点归入同一个簇，直到无法再扩展为止。这个定义保证了簇的"最大性"——不会把一个本应属于同一簇的点集割裂成两个簇。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from sklearn.neighbors import NearestNeighbors

# 手动实现 DBSCAN 的传播过程
def manual_dbscan(X, eps, min_samples):
    """简化版 DBSCAN，展示密度可达的传播机制"""
    n = len(X)
    labels = np.full(n, -1)  # 初始全部为噪声
    nn = NearestNeighbors(radius=eps).fit(X)
    distances, indices = nn.radius_neighbors(X)
    
    # 识别核心点
    is_core = np.array([len(idx) >= min_samples for idx in indices])
    
    cluster_id = 0
    for i in range(n):
        if labels[i] != -1:  # 已处理
            continue
        if not is_core[i]:  # 非核心点跳过
            continue
        
        # 从核心点 i 开始 BFS 扩展
        queue = [i]
        labels[i] = cluster_id
        
        while queue:
            current = queue.pop(0)
            neighbors = indices[current]
            
            for neighbor in neighbors:
                if labels[neighbor] == -1:  # 未标记 → 加入当前簇
                    labels[neighbor] = cluster_id
                    if is_core[neighbor]:  # 如果是核心点，继续扩展
                        queue.append(neighbor)
        
        cluster_id += 1
    
    return labels

labels = manual_dbscan(X, eps=0.5, min_samples=5)
print(f"发现 {len(set(labels)) - (1 if -1 in labels else 0)} 个簇")
print(f"噪声点: {list(labels).count(-1)}")`
          },
          {
            lang: "python",
            code: `# 可视化密度可达的传播路径
def visualize_reachability(X, eps, min_samples, seed_point):
    from sklearn.neighbors import NearestNeighbors
    from collections import deque
    
    nn = NearestNeighbors(radius=eps).fit(X)
    _, indices = nn.radius_neighbors(X)
    is_core = np.array([len(idx) >= min_samples for idx in indices])
    
    # BFS 追踪传播层级
    visited = set()
    levels = {seed_point: 0}
    queue = deque([seed_point])
    visited.add(seed_point)
    
    while queue:
        current = queue.popleft()
        for neighbor in indices[current]:
            if neighbor not in visited:
                levels[neighbor] = levels[current] + 1
                visited.add(neighbor)
                if is_core[neighbor]:
                    queue.append(neighbor)
    
    # 可视化
    colors = plt.cm.plasma(np.array(list(levels.values())) / max(levels.values()))
    plt.figure(figsize=(8, 6))
    plt.scatter(X[:, 0], X[:, 1], c='lightgray', s=10, alpha=0.5)
    for idx, level in levels.items():
        plt.scatter(X[idx, 0], X[idx, 1], c=[colors[list(levels.keys()).index(idx)]],
                     s=30, zorder=3)
    plt.scatter(X[seed_point, 0], X[seed_point, 1], c='red', s=100, marker='*', zorder=5)
    plt.title(f'从点 {seed_point} 开始的密度可达传播')
    plt.axis('equal')
    plt.show()
    
    print(f"传播范围: {len(levels)} 个点, 最大深度: {max(levels.values())}")`
          }
        ],
        table: {
          headers: ["概念", "定义", "对称性", "传递性"],
          rows: [
            ["密度直达", "q 在 p 的 eps 内，p 是核心点", "否（p→q≠q→p）", "否"],
            ["密度可达", "密度直达的传递链", "否", "是"],
            ["密度连通", "存在公共源头 o，p、q 都从 o 密度可达", "是", "是"],
            ["簇", "最大的密度连通点集", "—", "—"],
          ]
        },
        mermaid: `graph TD
    A["核心点 p"] -->|"密度直达"| B["邻居 q1"]
    B -->|"密度直达"| C["邻居 q2"]
    A -->|"密度可达(传递)"| C
    A --> D["源头 o"]
    D -.->|密度可达| E["点 p"]
    D -.->|密度可达| F["点 q"]
    E -.->|密度连通| F
    F -.->|密度连通| E`,
        warning: "密度可达的不对称性是 DBSCAN 的一个微妙之处：核心点 p 可以密度直达边界点 q，但 q 不能密度直达 p（因为 q 不是核心点）。这意味着从不同种子点出发可能发现不同的传播路径。"
      },
      {
        title: "5. 任意形状簇：DBSCAN 的真正优势",
        body: `DBSCAN 最引人注目的能力是发现任意形状的簇。K-Means 假设簇是凸形的（在欧氏空间中近似球形），这在很多真实场景中是一个过于强硬的假设。想象一下地理数据中的城市——沿河流分布的城镇、环湖而建的社区、沿高速公路延伸的卫星城——这些都不是球形结构。

DBSCAN 不假设任何特定的簇形状。它只需要簇内部是"连通的高密度区域"。只要两个高密度区域之间被低密度区域隔开，DBSCAN 就能把它们分成两个簇。这使得 DBSCAN 特别适合处理以下场景：空间数据挖掘（如犯罪热点识别）、图像处理中的连通区域检测、社交网络中的社区发现、以及任何簇具有非凸形状的数据集。

但要注意"任意形状"不等于"所有形状都能识别"。如果两个簇之间的密度差异不明显，或者存在密度梯度（一个簇密度逐渐过渡到另一个簇），DBSCAN 可能会将它们合并。这就是为什么 HDBSCAN 等改进版本引入了密度层次结构。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.datasets import make_circles, make_moons
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.metrics import adjusted_rand_score, silhouette_score

# 生成各种形状的测试数据
datasets = {
    '环形': make_circles(n_samples=500, noise=0.06, factor=0.5, random_state=42)[0],
    '月牙形': make_moons(n_samples=500, noise=0.08, random_state=42)[0],
    '环形+月牙形': np.vstack([
        make_circles(n_samples=200, noise=0.05, factor=0.4, random_state=42)[0],
        make_moons(n_samples=300, noise=0.06, random_state=42)[0]
    ]),
}

for name, X in datasets.items():
    print(f"\n=== {name} ===")
    from sklearn.preprocessing import StandardScaler
    X = StandardScaler().fit_transform(X)
    
    for algo_name, algo in [
        ('K-Means(2)', KMeans(n_clusters=2, random_state=42)),
        ('DBSCAN', DBSCAN(eps=0.3, min_samples=5)),
    ]:
        labels = algo.fit_predict(X)
        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        n_noise = list(labels).count(-1)
        print(f"  {algo_name:15s} | 簇数={n_clusters}, 噪声={n_noise}")`
          },
          {
            lang: "python",
            code: `# 实际案例：用 DBSCAN 做地理热点检测
import numpy as np

# 模拟城市犯罪数据
np.random.seed(42)
# 热点区域 1：市中心（高密度）
center1 = np.random.randn(150, 2) * 0.3 + np.array([0, 0])
# 热点区域 2：沿一条线分布（线性结构）
t = np.random.uniform(0, 1, 100)
center2 = np.column_stack([t * 3 - 1.5, np.sin(t * np.pi) * 0.3 + np.random.randn(100) * 0.1])
# 随机分布的噪声点
noise_points = np.random.uniform(-3, 3, (50, 2))

X_geo = np.vstack([center1, center2, noise_points])

db_geo = DBSCAN(eps=0.25, min_samples=8).fit(X_geo)
labels_geo = db_geo.labels_

plt.figure(figsize=(10, 8))
unique_labels = set(labels_geo)
colors = plt.cm.Set1(np.linspace(0, 1, len(unique_labels)))
for k, col in zip(unique_labels, colors):
    if k == -1:
        col = [0, 0, 0, 0.3]
    class_member_mask = (labels_geo == k)
    plt.scatter(X_geo[class_member_mask, 0], X_geo[class_member_mask, 1],
                c=[col], s=20, label=f'簇 {k}' if k != -1 else '噪声')
plt.title('地理热点检测：DBSCAN 识别非球形簇')
plt.legend(markerscale=2)
plt.axis('equal')
plt.show()

print(f"识别出 {len(unique_labels) - (1 if -1 in labels_geo else 0)} 个热点区域")`
          }
        ],
        table: {
          headers: ["簇形状", "K-Means", "DBSCAN", "层次聚类"],
          rows: [
            ["球形/凸形", "✅ 很好", "✅ 可以", "✅ 可以"],
            ["环形", "❌ 失败", "✅ 成功", "⚠️ 部分成功"],
            ["月牙形", "❌ 失败", "✅ 成功", "✅ 成功"],
            ["线形/流形", "❌ 失败", "✅ 成功", "⚠️ 取决于链接方式"],
            ["密度梯度", "⚠️ 可能", "❌ 可能合并", "⚠️ 需要后切"],
          ]
        },
        mermaid: `graph TD
    A["数据分布"] --> B{"簇的形状?"}
    B -->|"球形/凸形"| C["K-Means 或 GMM"]
    B -->|"任意形状"| D{"密度均匀?"}
    D -->|"是"| E["DBSCAN"]
    D -->|"否(密度变化大)"| F["HDBSCAN 或层次聚类"]
    B -->|"需要层次结构"| G["层次聚类"]
    E --> H["成功识别非凸形簇"]
    F --> I["处理多密度场景"]`,
        tip: "在空间数据分析中，DBSCAN 几乎是首选聚类方法。地理数据天然具有「高密度热点 + 低密度背景」的结构，与 DBSCAN 的设计直觉完美契合。"
      },
      {
        title: "6. HDBSCAN：密度层次的革命性改进",
        body: `DBSCAN 有一个根本性的局限：它使用全局单一的 eps 和 min_samples，这意味着它假设所有簇的密度大致相同。但真实世界的数据往往包含不同密度的簇——有些区域非常密集，有些区域相对稀疏。全局密度门槛要么把稀疏簇切成碎片（门槛太高），要么把密集簇和背景噪声混在一起（门槛太低）。

HDBSCAN（Hierarchical DBSCAN）解决了这个问题。它不再寻找单一密度下的连通区域，而是构建一个完整的密度层次树：从极高密度（极小有效 eps）到极低密度（极大有效 eps），观察簇如何在不同密度下分裂和合并。然后通过"簇持久性"（Persistence）——簇存在的密度范围宽度——来选择最稳定的簇。

HDBSCAN 的优势是自动的：不需要指定 eps，只需要 min_cluster_size（大致对应 DBSCAN 的 min_samples）。它天然处理多密度场景，并且提供更清晰的聚类质量度量。在大多数 DBSCAN 适用的场景中，HDBSCAN 都是更好的选择。`,
        code: [
          {
            lang: "python",
            code: `# HDBSCAN 处理多密度数据
try:
    import hdbscan
except ImportError:
    !pip install hdbscan
    import hdbscan

import numpy as np
import matplotlib.pyplot as plt

# 创建不同密度的簇
dense_cluster = np.random.randn(200, 2) * 0.3 + np.array([0, 0])
sparse_cluster = np.random.randn(150, 2) * 1.0 + np.array([5, 5])
noise = np.random.uniform(-3, 8, (50, 2))
X_multi = np.vstack([dense_cluster, sparse_cluster, noise])

# DBSCAN 的困境
db = DBSCAN(eps=0.5, min_samples=5).fit(X_multi)
print(f"DBSCAN: eps=0.5 → {len(set(db.labels_)) - (1 if -1 in db.labels_ else 0)} 个簇, {list(db.labels_).count(-1)} 噪声")

db2 = DBSCAN(eps=1.0, min_samples=5).fit(X_multi)
print(f"DBSCAN: eps=1.0 → {len(set(db2.labels_)) - (1 if -1 in db2.labels_ else 0)} 个簇, {list(db2.labels_).count(-1)} 噪声")

# HDBSCAN 自动适应
hdb = hdbscan.HDBSCAN(min_cluster_size=15).fit(X_multi)
print(f"HDBSCAN: {len(set(hdb.labels_)) - (1 if -1 in hdb.labels_ else 0)} 个簇, {list(hdb.labels_).count(-1)} 噪声")

# 可视化
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
for ax, labels, title in [
    (axes[0], db.labels_, 'DBSCAN eps=0.5'),
    (axes[1], db2.labels_, 'DBSCAN eps=1.0'),
    (axes[2], hdb.labels_, 'HDBSCAN'),
]:
    ax.scatter(X_multi[:, 0], X_multi[:, 1], c=labels, cmap='viridis', s=15)
    ax.set_title(title)
    ax.axis('equal')
plt.tight_layout()
plt.show()`
          },
          {
            lang: "python",
            code: `# HDBSCAN 的密度层次树可视化
import hdbscan

hdb = hdbscan.HDBSCAN(min_cluster_size=15, gen_min_span_tree=True).fit(X_multi)

# 查看簇的层次结构
print("=== 簇持久性排名 ===")
for i, persistence in enumerate(hdb.cluster_persistence_):
    size = (hdb.labels_ == i).sum()
    print(f"  簇 {i}: 持久性={persistence:.4f}, 大小={size}")

# 可视化层次树
plt.figure(figsize=(10, 6))
hdb.condensed_tree_.plot(select_clusters=True, selection_palette=['r', 'g', 'b'])
plt.title('HDBSCAN 凝聚树')
plt.show()

# 异常值分数：每个点的不寻常程度
outlier_scores = hdb.outlier_scores_
top_outliers = np.argsort(outlier_scores)[-10:]
print("\\nTop 10 异常点（最高 outlier scores）:")
for idx in top_outliers[::-1]:
    print(f"  点 {idx}: score={outlier_scores[idx]:.4f}, 位置=({X_multi[idx, 0]:.2f}, {X_multi[idx, 1]:.2f})")`
          }
        ],
        table: {
          headers: ["特性", "DBSCAN", "HDBSCAN", "改进"],
          rows: [
            ["参数", "eps + min_samples", "min_cluster_size", "减少一个参数"],
            ["多密度簇", "❌ 不支持", "✅ 自动处理", "层次树适应密度变化"],
            ["簇稳定性", "无度量", "持久性评分", "可量化簇质量"],
            ["异常值检测", "噪声点标记", "outlier_scores", "提供连续分数"],
            ["参数敏感性", "高（eps 很关键）", "低", "更鲁棒"],
          ]
        },
        mermaid: `graph TD
    A["HDBSCAN 流程"] --> B["构建最小生成树 MST"]
    B --> C["按距离排序边"]
    C --> D["依次删除边（密度递减）"]
    D --> E["构建凝聚树"]
    E --> F["计算簇持久性"]
    F --> G["选择最持久簇"]
    G --> H["最终聚类结果"]
    H --> I["outlier_scores 异常值检测"]`,
        warning: "HDBSCAN 的计算复杂度比 DBSCAN 更高，大数据集（>10万条）可能很慢。可以考虑使用 approx_min_span_tree=True 加速，或者先做降维预处理。"
      },
      {
        title: "7. sklearn 实战：DBSCAN 的完整工作流",
        body: `掌握了理论之后，让我们用一个完整的实战案例来巩固。我们将使用 UCI Wine 数据集，演示从数据探索、参数选择、模型训练到结果评估的完整流程。DBSCAN 在 sklearn 中的接口非常简单——只需 fit 即可，但参数调优和结果解读需要一些经验。

实战中最重要的不是调出完美的参数，而是理解 DBSCAN 给你的结果意味着什么。聚类是无监督学习，没有标准答案来验证对错。你需要结合业务背景来判断聚类结果是否有意义。DBSCAN 的噪声点标签尤其有价值——它们可能是异常值、数据质量问题、或者是真正值得关注的边缘案例。

最后，DBSCAN 的一个常见用法是作为数据预处理步骤：先用 DBSCAN 发现高密度区域，然后对每个簇分别建立模型（分组建模），或者用 DBSCAN 的噪声点做异常检测。这种"聚类→下游任务"的流水线在实际项目中非常常见。`,
        code: [
          {
            lang: "python",
            code: `from sklearn.datasets import load_wine
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, calinski_harabasz_score
import matplotlib.pyplot as plt
import numpy as np

# 加载数据
wine = load_wine()
X, y_true = wine.data, wine.target
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 步骤 1: K-距离图选择 eps
from sklearn.neighbors import NearestNeighbors
nn = NearestNeighbors(n_neighbors=5).fit(X_scaled)
distances, _ = nn.kneighbors(X_scaled)
k_distances = np.sort(distances[:, 4])  # 第5近邻

plt.figure(figsize=(8, 4))
plt.plot(k_distances)
plt.axhline(y=1.2, color='r', linestyle='--', label='eps=1.2')
plt.xlabel('样本索引')
plt.ylabel('第5近邻距离')
plt.legend()
plt.title('Wine 数据集 K-距离图')
plt.show()

# 步骤 2: 运行 DBSCAN
db = DBSCAN(eps=1.2, min_samples=5).fit(X_scaled)
labels = db.labels_
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise = list(labels).count(-1)

print(f"DBSCAN 结果:")
print(f"  簇数: {n_clusters}")
print(f"  噪声点: {n_noise} ({n_noise/len(labels)*100:.1f}%)")

if n_clusters > 1:
    core_mask = labels != -1
    print(f"  轮廓系数(仅簇内点): {silhouette_score(X_scaled[core_mask], labels[core_mask]):.4f}")
    print(f"  Calinski-Harabasz: {calinski_harabasz_score(X_scaled[core_mask], labels[core_mask]):.2f}")`
          },
          {
            lang: "python",
            code: `# 步骤 3: 可视化（PCA 降维到 2D）
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

fig, axes = plt.subplots(1, 3, figsize=(16, 5))

# 原始标签
axes[0].scatter(X_pca[:, 0], X_pca[:, 1], c=y_true, cmap='viridis', s=40)
axes[0].set_title(f'真实标签 (3类)\\nPCA解释方差: {pca.explained_variance_ratio_.sum()*100:.1f}%')

# DBSCAN 结果
cmap_db = plt.cm.get_cmap('tab10', max(labels) + 2)
axes[1].scatter(X_pca[:, 0], X_pca[:, 1], c=labels, cmap=cmap_db, s=40)
axes[1].set_title(f'DBSCAN ({n_clusters} 个簇, {n_noise} 噪声)')

# 噪声点高亮
axes[2].scatter(X_pca[labels != -1, 0], X_pca[labels != -1, 1],
                c=labels[labels != -1], cmap=cmap_db, s=40, label='簇内点')
axes[2].scatter(X_pca[labels == -1, 0], X_pca[labels == -1, 1],
                c='black', s=60, marker='x', label='噪声点', zorder=5)
axes[2].set_title(f'DBSCAN 噪声分析')
axes[2].legend()

plt.tight_layout()
plt.show()

# 步骤 4: 噪声点分析
noise_indices = np.where(labels == -1)[0]
print("\\n=== 噪声点分析 ===")
print(f"噪声点在各真实类别中的分布:")
for true_class in range(3):
    noise_in_class = sum(1 for idx in noise_indices if y_true[idx] == true_class)
    total_in_class = sum(1 for y in y_true if y == true_class)
    print(f"  真实类别 {true_class}: {noise_in_class}/{total_in_class} ({noise_in_class/total_in_class*100:.1f}%) 被标记为噪声")

# 步骤 5: 用 DBSCAN 噪声做异常检测
print("\\n=== 异常检测应用 ===")
noise_features = X_scaled[labels == -1]
if len(noise_features) > 0:
    print(f"噪声点特征统计 (均值):")
    for i, name in enumerate(wine.feature_names):
        print(f"  {name:25s}: {noise_features[:, i].mean():.3f}")`
          }
        ],
        table: {
          headers: ["评估指标", "含义", "DBSCAN 适用性", "注意事项"],
          rows: [
            ["轮廓系数", "簇内紧密 vs 簇间分离", "⚠️ 仅适用于非噪声点", "噪声点排除后计算"],
            ["Calinski-Harabasz", "簇间方差 / 簇内方差", "⚠️ 偏好凸形簇", "对 DBSCAN 有偏差"],
            ["噪声比例", "未被分配到任何簇的比例", "✅ 核心指标", "太高说明参数太严格"],
            ["簇稳定性", "扰动数据后的标签一致性", "✅ 推荐", "Bootstrap 多次运行"],
            ["业务合理性", "结果是否符合领域知识", "✅ 最重要", "无监督学习的终极判断"],
          ]
        },
        mermaid: `graph TD
    A["原始数据"] --> B["标准化处理"]
    B --> C["K-距离图选 eps"]
    C --> D["运行 DBSCAN"]
    D --> E{"噪声比例合理?"}
    E -->|太高(>30％)| F["增大 eps 或减小 min_samples"]
    E -->|太低(=0％)| G["减小 eps 或增大 min_samples"]
    E -->|合理| H["分析聚类结果"]
    H --> I["PCA 可视化"]
    H --> J["噪声点分析"]
    H --> K["下游任务"]
    J --> L["异常检测"]
    K --> M["分组建模"]`,
        tip: "DBSCAN 对特征的尺度极其敏感——不同尺度的特征会导致距离计算被大尺度特征主导。聚类前务必做标准化（StandardScaler）。对于高维数据，建议先用 PCA 或 UMAP 降维再聚类。"
      },
    ],
};
