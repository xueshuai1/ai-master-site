import { Article } from '../knowledge';

export const article: Article = {
    id: "mm-005",
    title: "多模态检索与推荐",
    category: "multimodal",
    tags: ["多模态检索", "向量搜索", "推荐系统"],
    summary: "从向量数据库到跨模态检索，掌握多模态检索的核心技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
      {
        title: "1. 向量检索基础",
        body: `向量检索是现代信息检索系统的核心技术。传统的基于关键词匹配的方法（如 BM25）依赖精确的词汇重叠，但无法理解语义层面的相似性。向量检索将数据映射到高维嵌入空间，通过度量向量之间的距离或余弦相似度来判断语义相关性。

多模态向量检索的特殊性在于需要同时处理多种模态的嵌入。图像经过视觉编码器映射为视觉向量，文本经过语言编码器映射为文本向量。在理想的嵌入空间中，语义相关的跨模态样本应该彼此靠近。例如，"一只奔跑的狗"的文本向量应该与对应的狗的图像向量距离很近。

向量检索的性能由三个维度衡量：准确率（召回的语义相关性）、延迟（单次查询的响应时间）、以及吞吐量（单位时间处理的查询数）。这三个目标通常存在权衡关系，系统设计需要根据业务场景选择最优策略。

在推荐系统中，向量检索用于候选召回阶段，从百万级商品库中快速筛选出与用户兴趣最接近的候选集。这一步的效率直接决定了推荐系统的实时性和覆盖能力。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from numpy.linalg import norm

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """计算两个向量的余弦相似度
    返回值在 [-1, 1] 之间，1 表示完全相同方向
    """
    dot = np.dot(a, b)
    norm_a = norm(a)
    norm_b = norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))

def euclidean_distance(a: np.ndarray, b: np.ndarray) -> float:
    """计算欧氏距离
    对归一化向量，欧氏距离和余弦相似度等价
    d = sqrt(2 * (1 - cos))
    """
    return float(np.sqrt(np.sum((a - b)  2)))

# 多模态相似度计算示例
# image_embed: [512] 从 CLIP 图像编码器获得
# text_embed:  [512] 从 CLIP 文本编码器获得
image_embed = np.random.randn(512).astype(np.float32)
text_embed = np.random.randn(512).astype(np.float32)
sim = cosine_similarity(image_embed, text_embed)
print(f"跨模态相似度: {sim:.4f}")`
          },
          {
            lang: "python",
            code: `# 暴力检索（Brute-Force）作为基准
import numpy as np
import time

class BruteForceSearcher:
    """暴力检索器：计算查询向量与所有库向量的相似度"""

    def __init__(self, dim: int, metric: str = "cosine"):
        self.dim = dim
        self.metric = metric
        self.vectors = None
        self.ids = None

    def add(self, vectors: np.ndarray, ids: list):
        """添加向量到索引"""
        self.vectors = vectors.astype(np.float32)
        self.ids = ids
        if self.metric == "cosine":
            # 预归一化
            norms = norm(self.vectors, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            self.vectors = self.vectors / norms

    def search(self, query: np.ndarray, top_k: int = 10):
        """搜索最近邻"""
        query = query.astype(np.float32).reshape(1, -1)
        if self.metric == "cosine":
            query = query / norm(query, axis=1, keepdims=True)
            scores = query @ self.vectors.T  # [1, N]
        else:
            # 欧氏距离
            diff = self.vectors - query  # [N, D]
            scores = -np.sum(diff  2, axis=1).reshape(1, -1)

        # Top-K
        indices = np.argpartition(scores[0], -top_k)[-top_k:]
        top_indices = indices[np.argsort(-scores[0, indices])]
        return [(self.ids[i], float(scores[0, i])) for i in top_indices]

# 性能参考: 100 万条 512 维向量，暴力检索约 50-200ms
# 超过 1000 万条时延迟显著增加，需要 ANN 加速`
          }
        ],
        table: {
          headers: ["距离度量", "公式", "适用场景", "归一化要求", "数值范围"],
          rows: [
            ["余弦相似度", "a.b / (|a||b|)", "文本/图像嵌入", "不需要(但推荐)", "[-1, 1]"],
            ["欧氏距离", "sqrt(sum((a-b)^2))", "空间坐标/低维向量", "不需要", "[0, inf]"],
            ["内积", "sum(a*b)", "推荐系统", "不需要", "(-inf, inf]"],
            ["曼哈顿距离", "sum(|a-b|)", "稀疏高维向量", "不需要", "[0, inf]"],
            ["汉明距离", "sum(a XOR b)", "二值向量/哈希", "需要二值化", "[0, 位数]"]
          ]
        },
        mermaid: `graph LR
    A["原始数据
图片/文本/音频"] --> B["模态编码器
CLIP/BERT/Wav2Vec"]
    B --> C["高维向量
[512/768/1024]"]
    C --> D["向量数据库
FAISS/Milvus"]
    E["查询"] --> F["编码为向量"]
    F --> G["相似度计算"]
    D --> G
    G --> H["排序
Top-K"]
    H --> I["返回结果"]`,
        tip: "在大多数多模态场景中，余弦相似度是首选度量，因为嵌入方向比幅度承载了更多语义信息",
        warning: "暴力检索在数据量超过 1000 万条时延迟不可接受，必须切换到近似最近邻（ANN）算法"
      },
      {
        title: "2. 近似最近邻（ANN）算法",
        body: `当向量库规模达到百万甚至亿级别时，暴力检索的计算复杂度 O(N*D) 成为瓶颈。近似最近邻（ANN）算法通过在准确率和效率之间做可控的妥协，将检索复杂度降低到亚线性级别。

ANN 的核心思想可以概括为三类策略：基于树的划分（Tree-based）、基于哈希的映射（Hashing-based）、以及基于量化的压缩（Quantization-based）。每种策略在不同的数据分布和精度需求下表现各异。

乘积量化（Product Quantization, PQ）是最成功的 ANN 算法之一。它将高维向量空间分解为多个低维子空间，在每个子空间上独立执行 K-means 聚类。查询时只需计算到子空间聚类中心的距离并查表求和，避免了全维度的精确计算。PQ 可以将 512 维的 float32 向量压缩到 32 字节，压缩比高达 64 倍。

HNSW（Hierarchical Navigable Small World）是当前精度最高的 ANN 算法之一。它构建多层图结构，上层用于快速跳转到目标区域，下层用于精细搜索。HNSW 在 recall@10 指标上通常能达到 99% 以上，但内存消耗较大，因为需要存储图的邻接关系。`,
        code: [
          {
            lang: "python",
            code: `import numpy as np
from sklearn.cluster import KMeans

class ProductQuantizer:
    """乘积量化（PQ）实现"""

    def __init__(self, dim: int, M: int, nbits: int = 8):
        """
        dim: 向量维度
        M: 子空间数量
        nbits: 每个子空间的编码位数
        每个子空间有 2^nbits 个聚类中心
        """
        self.dim = dim
        self.M = M
        self.nbits = nbits
        self.K = 2  nbits  # 每个子空间的聚类数
        self.sub_dim = dim // M
        self.codebooks = np.zeros((M, self.K, self.sub_dim))

    def train(self, vectors: np.ndarray):
        """在每个子空间上训练 K-means"""
        N = vectors.shape[0]
        vectors = vectors.reshape(N, self.M, self.sub_dim)
        for m in range(self.M):
            kmeans = KMeans(n_clusters=self.K, n_init=10)
            kmeans.fit(vectors[:, m, :])
            self.codebooks[m] = kmeans.cluster_centers_

    def encode(self, vectors: np.ndarray) -> np.ndarray:
        """将向量编码为 PQ 码本索引"""
        N = vectors.shape[0]
        vectors = vectors.reshape(N, self.M, self.sub_dim)
        codes = np.zeros((N, self.M), dtype=np.uint8)

        for m in range(self.M):
            # 计算到所有聚类中心的距离
            sub_vectors = vectors[:, m, :]  # [N, sub_dim]
            dists = np.sum(
                (sub_vectors[:, np.newaxis, :] - self.codebooks[m][np.newaxis, :, :])  2,
                axis=2
            )  # [N, K]
            codes[:, m] = np.argmin(dists, axis=1)

        return codes

    def compute_distances(self, query: np.ndarray, codes: np.ndarray) -> np.ndarray:
        """非对称距离计算：查询使用原始向量，数据库使用编码"""
        N = codes.shape[0]
        query = query.reshape(self.M, self.sub_dim)
        distances = np.zeros(N)

        for m in range(self.M):
            query_sub = query[m]  # [sub_dim]
            # 查询到该子空间所有聚类中心的距离（查表优化）
            dists = np.sum((self.codebooks[m] - query_sub) ** 2, axis=1)  # [K]
            # 累加对应的码本距离
            distances += dists[codes[:, m]]

        return distances`
          },
          {
            lang: "python",
            code: `# HNSW 算法概念模拟
import numpy as np
import heapq

class HNSWNode:
    """HNSW 图中的节点"""

    def __init__(self, vector: np.ndarray, node_id: int, max_layer: int):
        self.vector = vector
        self.node_id = node_id
        # 每层的邻居列表
        self.connections = [[] for _ in range(max_layer + 1)]
        self.max_layer = max_layer

class SimpleHNSW:
    """简化的 HNSW 实现（概念演示）"""

    def __init__(self, dim: int, M: int = 16, ef_construction: int = 200):
        self.dim = dim
        self.M = M
        self.ef_construction = ef_construction
        self.nodes: list[HNSWNode] = []
        self.entry_point = None
        self.max_layer = 0

    def _random_level(self, mL: float = 1.0 / np.log(M)) -> int:
        """根据几何分布随机生成层数"""
        level = 0
        while np.random.random() < 1.0 / mL and level < 16:
            level += 1
        return level

    def _search_layer(self, query: np.ndarray, entry: HNSWNode, ef: int, layer: int):
        """在指定层执行贪心搜索"""
        visited = {entry.node_id}
        candidates = [(-np.dot(entry.vector, query), entry)]  # max-heap
        results = candidates[:]

        while candidates:
            _, current = heapq.heappop(candidates)
            # 最远距离
            worst_dist = -results[0][0] if results else float("inf")
            if np.dot(current.vector, query) < worst_dist:
                break
            for neighbor_id in current.connections[layer]:
                if neighbor_id not in visited:
                    visited.add(neighbor_id)
                    neighbor = self.nodes[neighbor_id]
                    dist = -np.dot(neighbor.vector, query)
                    heapq.heappush(candidates, (dist, neighbor))
                    if len(results) < ef:
                        heapq.heappush(results, (dist, neighbor))
                    elif dist > results[0][0]:
                        heapq.heapreplace(results, (dist, neighbor))

        return results

    def search(self, query: np.ndarray, top_k: int = 10):
        """多层 HNSW 搜索"""
        current = self.entry_point
        # 从上到下逐层搜索
        for layer in range(current.max_layer, 0, -1):
            candidates = self._search_layer(query, current, 1, layer)
            if candidates:
                current = candidates[0][1]
        # 最底层精细搜索
        final_candidates = self._search_layer(query, current, ef=top_k * 2, layer=0)
        final_candidates.sort(key=lambda x: x[0], reverse=True)
        return [(self.nodes[i].node_id, float(d)) for d, node in final_candidates[:top_k]
                for i in [node.node_id]]`
          }
        ],
        table: {
          headers: ["算法", "内存占用", "索引构建速度", "查询延迟", "召回率@10", "适用场景"],
          rows: [
            ["IVF (倒排)", "中 (存储原向量)", "快", "低-中", "90-95%", "中等规模"],
            ["PQ (乘积量化)", "低 (压缩 64 倍)", "中", "很低", "85-92%", "超大规模"],
            ["HNSW", "高 (图结构开销)", "慢", "极低", "98-99.5%", "高精度要求"],
            ["LSH (局部敏感哈希)", "低", "快", "低", "75-85%", "极大规模/可容忍低召回"],
            ["DiskANN", "中 (磁盘+内存混合)", "中", "中", "95-99%", "成本敏感的大规模"]
          ]
        },
        mermaid: `graph TD
    A["高维向量库
[N, D]"] --> B{"选择 ANN 算法"}
    B --> C["IVF 倒排"]
    B --> D["PQ 量化"]
    B --> E["HNSW 图"]
    C --> C1["K-means 聚类
粗筛候选"]
    C1 --> C2["子集内暴力搜索"]
    D --> D1["子空间分解"]
    D1 --> D2["码本查表求和"]
    E --> E1["多层图结构"]
    E1 --> E2["逐层贪心搜索"]
    C2 --> F["Top-K 结果"]
    D2 --> F
    E2 --> F`,
        tip: "实际工程中常用 IVF+PQ 组合：先用 IVF 粗筛减少候选数量，再用 PQ 做精细排序，兼顾效率和精度",
        warning: "HNSW 在召回率上表现最优，但内存开销通常是原始向量数据的 10-30 倍，需要根据硬件容量选择"
      },
      {
        title: "3. 多模态嵌入对齐",
        body: `多模态嵌入对齐是多模态检索的基石。不同模态的编码器（视觉编码器、文本编码器、音频编码器等）独立训练时，其输出向量空间彼此无关，无法直接比较相似度。嵌入对齐的目标是将不同模态的向量映射到共享的语义空间中，使得语义相关的跨模态样本在空间中彼此靠近。

对齐策略可以分为两大类：后期对齐和联合训练。后期对齐指分别训练各模态编码器后，通过学习一个映射函数（如线性投影或 MLP）将不同模态的向量空间对齐。联合训练则在训练过程中同时优化多个模态的编码器，通常使用对比学习目标。

对比学习是目前最主流的对齐方法。给定一组匹配的图文对，模型学习最大化匹配对之间的相似度，同时最小化非匹配对之间的相似度。CLIP 是这种方法的经典代表，它使用 InfoNCE 损失在 4 亿图文对上训练，成功地将视觉和语言嵌入对齐到统一空间。

然而，对比学习面临负样本质量的挑战。互联网图文对中的噪声会导致错误对齐。后续的改进工作包括：使用难负样本挖掘（Hard Negative Mining）来提升模型区分力、引入模态内对齐约束来防止模态坍塌、以及使用课程学习（Curriculum Learning）从简单样本逐步过渡到困难样本。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class MultimodalAligner(nn.Module):
    """多模态嵌入对齐模块
    将不同模态的编码器输出投影到共享空间
    """

    def __init__(self, image_dim: int, text_dim: int, shared_dim: int = 512):
        super().__init__()
        # 图像投影头
        self.image_proj = nn.Sequential(
            nn.Linear(image_dim, shared_dim),
            nn.LayerNorm(shared_dim),
            nn.ReLU(),
            nn.Linear(shared_dim, shared_dim)
        )
        # 文本投影头
        self.text_proj = nn.Sequential(
            nn.Linear(text_dim, shared_dim),
            nn.LayerNorm(shared_dim),
            nn.ReLU(),
            nn.Linear(shared_dim, shared_dim)
        )
        # 可学习的温度参数
        self.logit_scale = nn.Parameter(torch.ones([]) * torch.log(torch.tensor(1.0 / 0.07)))

    def forward(self, image_features: torch.Tensor, text_features: torch.Tensor):
        """计算对比损失"""
        # 投影到共享空间
        image_embeds = F.normalize(self.image_proj(image_features), dim=-1)
        text_embeds = F.normalize(self.text_proj(text_features), dim=-1)

        # 相似度矩阵
        scale = self.logit_scale.exp()
        logits = scale * image_embeds @ text_embeds.T
        batch_size = image_embeds.size(0)
        labels = torch.arange(batch_size, device=image_embeds.device)

        # 对称对比损失
        loss_image = F.cross_entropy(logits, labels)
        loss_text = F.cross_entropy(logits.T, labels)
        return (loss_image + loss_text) / 2

    def get_similarity(self, image_features: torch.Tensor, text_features: torch.Tensor):
        """获取跨模态相似度"""
        image_embeds = F.normalize(self.image_proj(image_features), dim=-1)
        text_embeds = F.normalize(self.text_proj(text_features), dim=-1)
        return image_embeds @ text_embeds.T`
          },
          {
            lang: "python",
            code: `# 模态鸿沟量化与分析
import torch
import numpy as np

def measure_modality_gap(image_embeddings: torch.Tensor, text_embeddings: torch.Tensor):
    """量化评估模态鸿沟的多个维度"""

    # 1. 中心距离：两个模态均值向量之间的距离
    image_mean = image_embeddings.mean(dim=0)
    text_mean = text_embeddings.mean(dim=0)
    center_dist = torch.norm(image_mean - text_mean, p=2).item()

    # 2. 方差比率：两个模态的方差是否一致
    image_var = image_embeddings.var(dim=0).mean().item()
    text_var = text_embeddings.var(dim=0).mean().item()
    var_ratio = image_var / (text_var + 1e-8)

    # 3. 类间可分性：同类样本是否跨模态对齐
    # 使用类内相似度 vs 类间相似度
    image_norm = F.normalize(image_embeddings, dim=-1)
    text_norm = F.normalize(text_embeddings, dim=-1)
    cross_sim = torch.diag(image_norm @ text_norm.T).mean().item()

    # 4. 各向异性：嵌入空间的分布均匀性
    def anisotropy(embeddings: torch.Tensor) -> float:
        normalized = F.normalize(embeddings, dim=-1)
        mean_vec = normalized.mean(dim=0)
        return float(torch.norm(mean_vec, p=2))

    image_aniso = anisotropy(image_embeddings)
    text_aniso = anisotropy(text_embeddings)

    return {
        "center_distance": center_dist,
        "variance_ratio": var_ratio,
        "cross_modal_similarity": cross_sim,
        "image_anisotropy": image_aniso,
        "text_anisotropy": text_aniso
    }

# 典型结果 (对齐前 vs 对齐后):
# center_distance:     25.3 -> 2.1
# cross_similarity:     0.12 -> 0.78
# image_anisotropy:     0.95 -> 0.45
# text_anisotropy:      0.88 -> 0.42`
          }
        ],
        table: {
          headers: ["对齐方法", "训练方式", "需要配对数据", "典型场景", "优势", "劣势"],
          rows: [
            ["对比学习 (CLIP)", "联合训练", "是 (弱配对)", "通用图文对齐", "零样本能力强", "负样本质量依赖大"],
            ["交叉注意力", "联合训练", "是 (强配对)", "细粒度对齐", "细粒度交互", "计算开销大"],
            ["线性映射", "后期对齐", "是", "跨语言检索", "训练成本低", "表达能力有限"],
            ["对抗对齐", "后期对齐", "否", "无配对跨模态", "不需要配对数据", "训练不稳定"],
            ["三元组损失", "联合训练", "是 (三元组)", "人脸/商品检索", "直观易理解", "需要三元组挖掘"]
          ]
        },
        mermaid: `graph TD
    A["图像编码器"] --> B["图像嵌入
[原始空间]"]
    C["文本编码器"] --> D["文本嵌入
[原始空间]"]
    B --> E["投影头
Image Proj"]
    D --> F["投影头
Text Proj"]
    E --> G["共享语义空间
[512 维]"]
    F --> G
    G --> H["匹配对靠近
非匹配对远离"]
    H --> I["InfoNCE 损失"]
    I --> J["反向传播
更新投影头"]
    J --> E
    J --> F`,
        tip: "在资源有限时，可以先用预训练模型（如 CLIP）提取特征，再训练一个轻量投影头做域适配，效果接近从头联合训练",
        warning: "模态鸿沟严重时直接使用跨模态检索会导致性能极差，务必先量化对齐质量再决定检索策略"
      },
      {
        title: "4. 跨模态检索（图文/文图）",
        body: `跨模态检索（Cross-Modal Retrieval）是多模态理解中最具实用价值的任务之一。它包含两个方向：以文搜图（Text-to-Image Retrieval）和以图搜文（Image-to-Text Retrieval）。前者让用户用自然语言描述搜索对应图像，后者则用图像查询相关的文本描述。

跨模态检索的技术栈可以分为三个层次：编码层、对齐层和检索层。编码层负责将不同模态的原始数据转换为向量表示，对齐层确保这些向量在共享空间中语义一致，检索层则在大规模向量库中高效地找到最近邻。

以文搜图是最常见的跨模态检索场景。用户输入查询文本，系统将其编码为文本向量，然后在图像向量索引中搜索最近邻。这种场景的关键挑战在于查询文本通常很短（几个到十几个词），而训练数据中的描述往往更丰富。查询文本的嵌入分布与训练数据的描述嵌入分布存在差异，即所谓的 "域偏移" 问题。

为了提高检索精度，现代跨模态检索系统通常采用两阶段策略：第一阶段用轻量模型（如双塔 CLIP）快速召回候选集，第二阶段用更精细的交叉注意力模型（如 BLIP、FLAVA）对候选进行重排序。这种 "召回 + 精排" 的架构在精度和效率之间取得了良好平衡。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn.functional as F

class CrossModalRetrieval:
    """跨模态检索系统 (以文搜图 + 以图搜文)"""

    def __init__(self, image_index, text_index, image_model, text_model, device="cpu"):
        """
        image_index: 图像向量索引 (如 FAISS)
        text_index: 文本向量索引
        image_model: 图像编码器
        text_model: 文本编码器
        """
        self.image_index = image_index
        self.text_index = text_index
        self.image_model = image_model.to(device)
        self.text_model = text_model.to(device)
        self.device = device

    @torch.no_grad()
    def text_to_image(self, query_text: str, top_k: int = 10):
        """以文搜图：用文本查询检索最相关的图像"""
        # 编码查询文本
        text_input = self._tokenize_text(query_text)
        text_feat = self.text_model(text_input)
        text_feat = F.normalize(text_feat, dim=-1).cpu().numpy()

        # 在图像索引中搜索
        scores, indices = self.image_index.search(text_feat, top_k)
        return [(int(indices[0, i]), float(scores[0, i])) for i in range(top_k)]

    @torch.no_grad()
    def image_to_text(self, query_image: torch.Tensor, top_k: int = 10):
        """以图搜文：用图像查询检索最相关的文本"""
        image_feat = self.image_model(query_image.to(self.device))
        image_feat = F.normalize(image_feat, dim=-1).cpu().numpy()

        scores, indices = self.text_index.search(image_feat, top_k)
        return [(int(indices[0, i]), float(scores[0, i])) for i in range(top_k)]

    def evaluate(self, test_images, test_texts, ground_truth, k_values=(1, 5, 10)):
        """评估检索性能: Recall@K"""
        results = {"t2i": {}, "i2t": {}}

        # 以文搜图 Recall
        for q_text, gt_indices in zip(test_texts, ground_truth):
            retrieved = self.text_to_image(q_text, top_k=max(k_values))
            retrieved_ids = [r[0] for r in retrieved]
            for k in k_values:
                recall = len(set(retrieved_ids[:k]) & set(gt_indices)) / len(gt_indices)
                results["t2i"][k] = results["t2i"].get(k, []) + [recall]

        # 取平均
        for k in k_values:
            results["t2i"][k] = sum(results["t2i"][k]) / len(results["t2i"][k])

        return results`
          },
          {
            lang: "python",
            code: `# 两阶段检索：召回 + 精排
import torch
from transformers import BlipProcessor, BlipForImageTextRetrieval

class TwoStageRetrieval:
    """两阶段跨模态检索系统"""

    def __init__(self, clip_model, clip_processor, blip_model, blip_processor):
        # 阶段 1: CLIP (快速召回)
        self.clip_model = clip_model
        self.clip_processor = clip_processor

        # 阶段 2: BLIP (精排序)
        self.blip_model = blip_model
        self.blip_processor = blip_processor

    def retrieve(self, query_text: str, image_database: list,
                 recall_k: int = 100, rerank_k: int = 10):
        """
        阶段 1: CLIP 召回 top-K 候选
        阶段 2: BLIP 交叉注意力重排序
        """
        # 阶段 1: CLIP 快速召回
        text_input = self.clip_processor(text=query_text, return_tensors="pt")
        text_feat = self.clip_model.get_text_features(text_input)
        text_feat = F.normalize(text_feat, dim=-1)

        image_feats = []
        for img in image_database:
            img_input = self.clip_processor(images=img, return_tensors="pt")
            img_feat = self.clip_model.get_image_features(img_input)
            img_feat = F.normalize(img_feat, dim=-1)
            image_feats.append(img_feat)

        all_image_feats = torch.cat(image_feats, dim=0)
        similarities = (text_feat @ all_image_feats.T)[0]

        # 取 top-K 候选
        top_k_indices = similarities.topk(recall_k).indices.tolist()
        candidates = [(image_database[i], float(similarities[i])) for i in top_k_indices]

        # 阶段 2: BLIP 精排
        reranked = []
        for img, clip_score in candidates[:rerank_k * 2]:
            inputs = self.blip_processor(
                images=img, text=query_text, return_tensors="pt"
            )
            with torch.no_grad():
                output = self.blip_model(**inputs)
                blip_score = output.logits.item()

            # 融合 CLIP 和 BLIP 分数
            fused_score = 0.3 * clip_score + 0.7 * blip_score
            reranked.append((img, fused_score))

        reranked.sort(key=lambda x: x[1], reverse=True)
        return reranked[:rerank_k]`
          }
        ],
        table: {
          headers: ["检索方向", "查询模态", "目标模态", "典型应用", "主流模型", "难点"],
          rows: [
            ["以文搜图 (T2I)", "文本", "图像", "搜索引擎/相册搜索", "CLIP/BLIP", "查询文本短/信息量少"],
            ["以图搜文 (I2T)", "图像", "文本", "图像描述/OCR", "CLIP/ViLT", "图像语义歧义"],
            ["以图搜图 (I2I)", "图像", "图像", "商品推荐/去重", "DINOv2/CLIP", "视角/光照变化"],
            ["以文搜文 (T2T)", "文本", "文本", "语义搜索", "BERT/SimCSE", "词汇重叠陷阱"],
            ["视频-文本 (V2T)", "文本", "视频", "视频搜索", "CLIP4Clip", "时序信息建模"]
          ]
        },
        mermaid: `graph LR
    A["用户查询
自然语言文本"] --> B["文本编码器
CLIP Text"]
    B --> C["查询向量"]
    C --> D["阶段1: 召回
FAISS 搜索"]
    D --> E["候选集
Top-100"]
    E --> F["阶段2: 精排
BLIP 交叉注意力"]
    F --> G["最终排序
Top-10"]
    G --> H["返回图像结果"]
    I["图像数据库"] -.-> D`,
        tip: "两阶段检索是工业界标准方案：CLIP 召回保证效率（毫秒级），BLIP 精排保证精度（融合分数可调节权重）",
        warning: "查询文本过短（1-2 个词）时 CLIP 召回质量显著下降，建议加入查询扩展或上下文信息"
      },
      {
        title: "5. 向量数据库（FAISS/Milvus）",
        body: `向量数据库是多模态检索系统的基础设施。与传统关系数据库不同，向量数据库专门针对高维向量的存储、索引和相似性搜索进行了优化。目前主流的向量数据库可以分为两类：专用库（如 FAISS）和分布式数据库（如 Milvus、Pinecone）。

FAISS 由 Meta AI 开源，是目前最流行的向量检索库。它提供了多种索引类型（IVF、PQ、HNSW、Flat），支持 GPU 加速，并且可以在单机上处理上亿级向量。FAISS 的设计哲学是灵活性：开发者可以根据精度和效率需求自由组合不同的索引策略。

Milvus 是一个云原生的分布式向量数据库，支持水平扩展、数据分片、副本复制等企业级特性。它底层可以使用 FAISS 或其他索引引擎，但在架构上提供了更高抽象：数据管理、元数据存储、权限控制等。对于需要高可用和大规模部署的场景，Milvus 是更合适的选择。

Pinecone 则是完全托管的 SaaS 向量数据库，用户无需关心底层基础设施。它的特点是开箱即用、自动扩缩容、以及内置的元数据过滤能力。对于快速原型和中小规模应用，Pinecone 可以显著降低运维成本。`,
        code: [
          {
            lang: "python",
            code: `import faiss
import numpy as np

class FAISSIndex:
    """FAISS 向量索引封装"""

    def __init__(self, dim: int, index_type: str = "IVF"):
        self.dim = dim
        self.index_type = index_type
        self.index = None
        self.trained = False

    def build(self, vectors: np.ndarray):
        """构建并训练索引"""
        n = vectors.shape[0]

        if self.index_type == "Flat":
            # 精确检索，无需训练
            self.index = faiss.IndexFlatIP(self.dim)
            self.index.add(vectors)
            self.trained = True

        elif self.index_type == "IVF":
            # IVF 倒排索引
            nlist = min(4096, int(np.sqrt(n)))
            quantizer = faiss.IndexFlatIP(self.dim)
            self.index = faiss.IndexIVFFlat(quantizer, self.dim, nlist, faiss.METRIC_INNER_PRODUCT)

            # 训练
            self.index.train(vectors)
            self.index.add(vectors)
            self.trained = True
            print(f"IVF 索引: {nlist} 个聚类, {n} 个向量")

        elif self.index_type == "IVF_PQ":
            # IVF + 乘积量化（压缩存储）
            nlist = min(4096, int(np.sqrt(n)))
            M = 8  # 子空间数量
            nbits = 8  # 每子空间编码位数
            quantizer = faiss.IndexFlatIP(self.dim)
            self.index = faiss.IndexIVFPQ(quantizer, self.dim, nlist, M, nbits)

            self.index.train(vectors)
            self.index.add(vectors)
            self.trained = True
            print(f"IVF+PQ 索引: {nlist} 聚类, M={M}, 压缩比 {self.dim * 4 / (M + 8):.0f}x")

    def search(self, query: np.ndarray, top_k: int = 10, nprobe: int = 64):
        """搜索最近邻"""
        assert self.trained, "索引未训练"
        if self.index_type in ("IVF", "IVF_PQ"):
            self.index.nprobe = nprobe  # 搜索的聚类数
        scores, indices = self.index.search(query.reshape(1, -1).astype(np.float32), top_k)
        return scores[0], indices[0]

    def save(self, path: str):
        faiss.write_index(self.index, path)

    def load(self, path: str):
        self.index = faiss.read_index(path)
        self.trained = True`
          },
          {
            lang: "python",
            code: `# Milvus 使用示例
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection
import numpy as np

class MilvusVectorDB:
    """Milvus 向量数据库操作封装"""

    def __init__(self, host="localhost", port="19530"):
        connections.connect("default", host=host, port=port)
        self.collection = None

    def create_collection(self, name: str, dim: int, enable_metadata: bool = True):
        """创建集合"""
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=dim),
        ]

        if enable_metadata:
            fields.append(FieldSchema(name="modality", dtype=DataType.VARCHAR, max_length=20))
            fields.append(FieldSchema(name="source_id", dtype=DataType.VARCHAR, max_length=256))
            fields.append(FieldSchema(name="timestamp", dtype=DataType.INT64))

        schema = CollectionSchema(fields, description=f"Collection: {name}")
        self.collection = Collection(name, schema)

        # 创建向量索引 (IVF_FLAT)
        index_params = {
            "index_type": "IVF_FLAT",
            "metric_type": "IP",  # 内积
            "params": {"nlist": 1024}
        }
        self.collection.create_index("embedding", index_params)
        print(f"集合 {name} 创建完成, 维度={dim}")

    def insert(self, embeddings: np.ndarray, metadata: list = None):
        """插入向量数据"""
        data = [embeddings.tolist()]
        if metadata:
            data.extend([m.get(k) for m in metadata for k in metadata[0].keys()])
        self.collection.insert(data)

    def search(self, query: np.ndarray, top_k: int = 10, expr: str = ""):
        """带过滤条件的向量搜索"""
        self.collection.load()
        search_params = {"metric_type": "IP", "params": {"nprobe": 64}}

        results = self.collection.search(
            data=[query.tolist()],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            expr=expr,  # 元数据过滤条件
            output_fields=["modality", "source_id"]
        )
        return results[0]  # [Hit]

    def flush(self):
        """持久化数据"""
        self.collection.flush()`
          }
        ],
        table: {
          headers: ["特性", "FAISS", "Milvus", "Pinecone", "Weaviate", "Qdrant"],
          rows: [
            ["类型", "C++ 库", "分布式数据库", "SaaS 服务", "向量数据库", "向量数据库"],
            ["部署", "嵌入式", "Kubernetes/Docker", "全托管", "Docker/K8s", "Docker/Rust"],
            ["最大规模", "十亿级 (单机)", "十亿级 (分布式)", "十亿级", "亿级", "亿级"],
            ["元数据过滤", "不支持 (需自行实现)", "原生支持", "原生支持", "原生支持", "原生支持"],
            ["GPU 加速", "支持", "支持", "不支持", "不支持", "支持"],
            ["许可协议", "MIT", "Apache 2.0", "商业", "BSD", "Apache 2.0"],
            ["适用场景", "研究/单机检索", "企业级生产", "快速原型", "语义搜索", "实时检索"]
          ]
        },
        mermaid: `graph TD
    A["应用层
检索/推荐"] --> B["向量数据库"]
    B --> C{"选择方案"}
    C --> D["FAISS
嵌入式库"]
    C --> E["Milvus
分布式"]
    C --> F["Pinecone
SaaS"]
    D --> D1["IVF/PQ/HNSW"]
    D1 --> D2["单节点存储"]
    D2 --> D3["GPU 加速"]
    E --> E1["数据分片"]
    E1 --> E2["副本复制"]
    E2 --> E3["水平扩展"]
    F --> F1["自动扩缩容"]
    F1 --> F2["元数据过滤"]
    F2 --> F3["零运维"]`,
        tip: "生产环境中优先考虑 Milvus 或 Qdrant，它们同时支持向量搜索和元数据过滤，避免了 FAISS 需要额外开发过滤逻辑的问题",
        warning: "FAISS 的索引一旦构建无法直接删除单个向量，如果需要频繁增删改，建议使用 Milvus 或其他支持 CRUD 的数据库"
      },
      {
        title: "6. 多模态推荐系统",
        body: `传统推荐系统主要依赖用户-物品的交互数据（点击、购买、评分），使用协同过滤或矩阵分解来预测用户偏好。然而，这种方法面临冷启动问题：新用户或新物品因为缺乏交互历史而无法获得准确推荐。多模态推荐系统通过引入物品的视觉、文本、音频等多模态特征，显著缓解了这一挑战。

多模态推荐的核心思想是：即使某个物品没有交互历史，它的视觉特征（如图片）和文本描述（如标题、标签）已经包含了丰富的信息，可以用来推断其潜在的受众群体。例如，一张红色运动鞋的图片天然暗示了目标用户的运动偏好和审美风格。

现代多模态推荐系统通常采用三塔架构：用户塔、物品多模态塔和交互融合塔。用户塔根据用户历史行为编码用户兴趣向量，物品塔提取多模态特征（图像用视觉编码器，文本用语言编码器），交互塔则将两者融合并预测点击率或评分。

在电商场景中，多模态推荐的效果提升尤为明显。淘宝和亚马逊的研究表明，引入商品的图像特征可以将点击率提升 5-15%，特别是在冷启动阶段（新商品上架前 7 天），多模态特征的作用远超交互历史特征。此外，多模态特征还能帮助发现传统方法难以捕捉的细粒度偏好，如对特定颜色、风格或材质的偏好。`,
        code: [
          {
            lang: "python",
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class MultimodalRecommender(nn.Module):
    """三塔多模态推荐系统"""

    def __init__(self, num_users: int, num_items: int,
                 user_dim: int = 128, item_dim: int = 512,
                 text_dim: int = 768, image_dim: int = 512,
                 embed_dim: int = 128):
        super().__init__()
        # 用户塔: 用户 ID 嵌入 + 历史行为编码
        self.user_embedding = nn.Embedding(num_users, user_dim)
        self.user_tower = nn.Sequential(
            nn.Linear(user_dim, embed_dim),
            nn.ReLU(),
            nn.Linear(embed_dim, embed_dim)
        )

        # 物品塔: 多模态特征融合
        self.image_proj = nn.Linear(image_dim, embed_dim)
        self.text_proj = nn.Linear(text_dim, embed_dim)
        self.item_tower = nn.Sequential(
            nn.Linear(embed_dim * 2, embed_dim),
            nn.LayerNorm(embed_dim),
            nn.ReLU(),
            nn.Linear(embed_dim, embed_dim)
        )

        # 交互层: 用户-物品匹配
        self.interaction = nn.Sequential(
            nn.Linear(embed_dim * 2, embed_dim),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(embed_dim, 1)
        )

    def forward(self, user_ids: torch.Tensor, image_feats: torch.Tensor,
                text_feats: torch.Tensor):
        # 用户表示
        user_emb = self.user_embedding(user_ids)
        user_vec = self.user_tower(user_emb)

        # 物品多模态表示
        img_vec = F.normalize(self.image_proj(image_feats), dim=-1)
        txt_vec = F.normalize(self.text_proj(text_feats), dim=-1)
        item_multimodal = torch.cat([img_vec, txt_vec], dim=-1)
        item_vec = self.item_tower(item_multimodal)

        # 交互预测
        combined = torch.cat([user_vec, item_vec], dim=-1)
        score = self.interaction(combined).squeeze(-1)
        return score

    def get_user_vector(self, user_ids: torch.Tensor):
        return self.user_tower(self.user_embedding(user_ids))

    def get_item_vector(self, image_feats: torch.Tensor, text_feats: torch.Tensor):
        img_vec = F.normalize(self.image_proj(image_feats), dim=-1)
        txt_vec = F.normalize(self.text_proj(text_feats), dim=-1)
        item_combined = torch.cat([img_vec, txt_vec], dim=-1)
        return self.item_tower(item_combined)`
          },
          {
            lang: "python",
            code: `# 冷启动推荐：纯多模态策略
import torch
import numpy as np

class ColdStartRecommender:
    """新物品冷启动推荐：仅依赖多模态特征"""

    def __init__(self, user_vectors: np.ndarray, faiss_index):
        """
        user_vectors: 所有用户的兴趣向量 [num_users, dim]
        faiss_index: 物品多模态向量索引
        """
        self.user_vectors = user_vectors
        self.faiss_index = faiss_index

    def recommend_for_user(self, user_id: int, new_items: np.ndarray,
                          item_ids: list, top_k: int = 20):
        """为新物品找到最可能感兴趣的用户"""
        user_vec = self.user_vectors[user_id].reshape(1, -1).astype(np.float32)

        # 在多模态索引中搜索与用户兴趣最接近的新物品
        scores, indices = self.faiss_index.search(user_vec, top_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(item_ids):
                results.append({
                    "item_id": item_ids[idx],
                    "match_score": float(score),
                    "reason": self._explain_match(user_id, idx)
                })
        return results

    def _explain_match(self, user_id: int, item_idx: int):
        """生成推荐解释"""
        explanations = [
            "与您收藏的商品风格相似",
            "匹配您的审美偏好",
            "与您近期浏览的商品类别一致",
            "符合您的品牌偏好"
        ]
        return explanations[item_idx % len(explanations)]

# 冷启动推荐的关键指标:
# 新物品曝光率: 提升 3-5x (相比纯协同过滤)
# 新物品点击率: 提升 2-3x
# 长尾物品覆盖率: 提升 40-60%`
          }
        ],
        table: {
          headers: ["推荐策略", "所需数据", "冷启动能力", "精度", "可扩展性", "代表方法"],
          rows: [
            ["协同过滤", "交互历史", "差", "高 (有数据时)", "好", "矩阵分解"],
            ["内容推荐", "物品特征", "好", "中", "好", "TF-IDF/BM25"],
            ["多模态推荐", "图像+文本+交互", "很好", "很高", "中", "VBPR/MMGCN"],
            ["图神经网络", "用户-物品图", "中", "很高", "差 (大图)", "LightGCN/SGL"],
            ["序列推荐", "交互序列", "中", "高", "中", "SASRec/BERT4Rec"]
          ]
        },
        mermaid: `graph TD
    A["用户行为
点击/收藏/购买"] --> B["用户塔
User Embedding"]
    C["商品图片"] --> D["视觉编码器
ResNet/CLIP"]
    E["商品描述"] --> F["文本编码器
BERT/CLIP"]
    D --> G["物品多模态塔
特征融合"]
    F --> G
    B --> H["交互融合
MLP + Attention"]
    G --> H
    H --> I["预测分数
CTR/评分"]
    I --> J["排序
Top-N 推荐"]
    J --> K["用户反馈
点击/跳过"]
    K --> A`,
        tip: "多模态特征与协同过滤信号结合（多任务学习）是最佳实践，比单一信号提升 10-20% 的推荐精度",
        warning: "多模态推荐系统需要处理大量的图像和文本特征，存储和计算开销是纯协同过滤系统的 3-5 倍"
      },
      {
        title: "7. 实战：构建图文检索系统",
        body: `本节通过一个完整的实战项目，将前面介绍的所有技术串联起来，构建一个端到端的图文检索系统。该系统支持用户上传图像库、构建向量索引、然后通过自然语言查询来检索相关图像。

系统架构分为四个模块：数据预处理模块负责加载和编码图像文本对，索引构建模块使用 FAISS 建立高效检索索引，查询服务模块处理用户的自然语言查询并返回结果，评估模块用于测试系统的检索精度。

整个系统的设计遵循模块化原则，每个模块都可以独立替换和升级。例如，图像编码器可以从 CLIP 替换为 OpenCLIP 以获得更好的效果，索引引擎可以从 FAISS 替换为 Milvus 以支持分布式部署。

在部署方面，系统可以打包为 FastAPI 服务，提供 RESTful API 接口。前端可以通过简单的 HTTP 请求实现图像上传、文本查询和结果展示。对于生产环境，还需要加入缓存层（如 Redis）来缓存热门查询结果，进一步降低延迟。`,
        code: [
          {
            lang: "python",
            code: `from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
import torch
from transformers import CLIPProcessor, CLIPModel
import faiss
import numpy as np
from PIL import Image
import io
from typing import Optional

app = FastAPI(title="图文检索系统")

# 全局模型和索引
model = None
processor = None
faiss_index = None
image_store = {}  # id -> Image

class SearchResult(BaseModel):
    image_id: str
    score: float
    description: Optional[str] = None

class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]
    total: int

@app.on_event("startup")
def load_model():
    global model, processor
    model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    print("CLIP 模型加载完成")

@app.post("/index")
async def build_index(files: list[UploadFile] = File(...)):
    """上传图像并构建检索索引"""
    global faiss_index, image_store, model, processor

    vectors = []
    for idx, file in enumerate(files):
        content = await file.read()
        image = Image.open(io.BytesIO(content))
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            feat = model.get_image_features(inputs)
            feat = F.normalize(feat, dim=-1)
        vectors.append(feat.numpy())
        image_store[f"img_{idx}"] = image

    vectors = np.vstack(vectors).astype(np.float32)
    dim = vectors.shape[1]
    faiss_index = faiss.IndexFlatIP(dim)
    faiss_index.add(vectors)

    return {"status": "ok", "indexed": len(files), "dimension": dim}

@app.get("/search", response_model=SearchResponse)
async def search(query: str, top_k: int = 10):
    """文本查询检索图像"""
    global model, processor, faiss_index

    inputs = processor(text=query, return_tensors="pt", padding=True)
    with torch.no_grad():
        text_feat = model.get_text_features(inputs)
        text_feat = F.normalize(text_feat, dim=-1).numpy()

    scores, indices = faiss_index.search(text_feat, top_k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx != -1:
            results.append(SearchResult(
                image_id=f"img_{idx}",
                score=float(score)
            ))

    return SearchResponse(query=query, results=results, total=len(results))`
          },
          {
            lang: "python",
            code: `# 检索系统评估脚本
import torch
from transformers import CLIPProcessor, CLIPModel
import numpy as np
import json
from PIL import Image
from tqdm import tqdm

class RetrievalEvaluator:
    """图文检索系统评估工具"""

    def __init__(self, model_name="openai/clip-vit-base-patch32"):
        self.model = CLIPModel.from_pretrained(model_name)
        self.processor = CLIPProcessor.from_pretrained(model_name)

    def load_dataset(self, dataset_path: str):
        """加载评估数据集
        数据格式: JSONL, 每行 {"image": "path.jpg", "caption": "描述"}
        """
        self.images = []
        self.captions = []
        with open(dataset_path) as f:
            for line in f:
                data = json.loads(line)
                self.images.append(Image.open(data["image"]))
                self.captions.append(data["caption"])
        print(f"加载 {len(self.images)} 个图文对")

    @torch.no_grad()
    def evaluate(self, batch_size=64):
        """计算 Recall@K 指标"""
        # 批量编码所有图像
        image_features = []
        for i in tqdm(range(0, len(self.images), batch_size)):
            batch = self.images[i:i+batch_size]
            inputs = self.processor(images=batch, return_tensors="pt")
            feat = self.model.get_image_features(inputs)
            image_features.append(F.normalize(feat, dim=-1))
        image_features = torch.cat(image_features, dim=0)  # [N, D]

        # 批量编码所有文本
        text_features = []
        for i in tqdm(range(0, len(self.captions), batch_size)):
            batch = self.captions[i:i+batch_size]
            inputs = self.processor(text=batch, return_tensors="pt", padding=True)
            feat = self.model.get_text_features(inputs)
            text_features.append(F.normalize(feat, dim=-1))
        text_features = torch.cat(text_features, dim=0)  # [N, D]

        # 计算相似度矩阵
        similarity = image_features @ text_features.T  # [N, N]

        # Recall@K
        results = {}
        n = len(self.images)
        for k in [1, 5, 10, 50]:
            # 以文搜图
            _, topk_indices = similarity.topk(k, dim=0)
            t2i_correct = sum(
                1 for i in range(n) if i in topk_indices[:, i]
            )
            t2i_recall = t2i_correct / n

            # 以图搜文
            _, topk_indices = similarity.topk(k, dim=1)
            i2t_correct = sum(
                1 for i in range(n) if i in topk_indices[i]
            )
            i2t_recall = i2t_correct / n

            results[f"t2i_recall@{k}"] = f"{t2i_recall:.2%}"
            results[f"i2t_recall@{k}"] = f"{i2t_recall:.2%}"

        return results

# 典型评估结果 (MSCOCO val2017):
# t2i_recall@1:  54.2%
# t2i_recall@5:  81.7%
# t2i_recall@10: 89.3%
# i2t_recall@1:  72.4%
# i2t_recall@5:  93.1%
# i2t_recall@10: 96.5%`
          }
        ],
        table: {
          headers: ["系统组件", "技术选择", "替代方案", "升级路径"],
          rows: [
            ["图像编码器", "CLIP ViT-B/32", "OpenCLIP ViT-L/14", "换更大模型，无需改接口"],
            ["文本编码器", "CLIP Text", "Chinese-CLIP (中文)", "中文化只需换模型"],
            ["索引引擎", "FAISS IVF-Flat", "Milvus/Qdrant", "分布式扩展"],
            ["服务框架", "FastAPI", "Flask/gRPC", "gRPC 用于内部调用"],
            ["评估数据集", "MSCOCO", "Flickr30K", "自定义业务数据"],
            ["缓存层", "无", "Redis", "缓存热门查询结果"]
          ]
        },
        mermaid: `graph TD
    A["用户"] --> B["FastAPI 服务"]
    B --> C{"操作类型"}
    C --> D["上传图像"]
    C --> E["文本查询"]
    C --> F["系统评估"]
    D --> G["CLIP 图像编码"]
    G --> H["FAISS 索引构建"]
    E --> I["CLIP 文本编码"]
    I --> J["FAISS 相似度搜索"]
    J --> K["返回 Top-K 图像"]
    F --> L["批量编码测试集"]
    L --> M["计算 Recall@K"]
    M --> N["生成评估报告"]
    H --> O["持久化存储"]
    O -.-> J`,
        tip: "在生产部署时，务必先将 FAISS 索引和模型加载到内存预热，首次查询延迟可能比后续查询高 5-10 倍",
        warning: "公开部署的图文检索系统需要加入内容安全审核，避免检索到违规图像。可以在 FAISS 检索后加入图像审核模块"
      }
    ],
};
