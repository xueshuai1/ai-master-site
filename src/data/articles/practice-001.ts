import { Article } from '../knowledge';

export const article: Article = {
  id: "practice-001",
  title: "推荐系统实战",
  category: "practice",
  tags: ["推荐系统", "协同过滤", "深度学习"],
  summary: "从协同过滤到深度学习推荐，掌握推荐系统的核心技术",
  date: "2026-04-12",
  readTime: "20 min",
  level: "高级",
  content: [
    {
      title: "1. 推荐系统概述",
      body: `推荐系统是现代互联网产品的核心组件，广泛应用于电商、视频、音乐和社交等领域。它的本质是一个信息过滤系统，通过分析用户行为和内容特征，从海量候选集中筛选出用户最可能感兴趣的项目。推荐系统经历了从早期的基于规则、协同过滤，到矩阵分解，再到深度学习推荐模型的演进过程。一个完整的推荐系统通常包含召回层、粗排层、精排层和重排层，每一层承担不同的职责。召回层负责从百万级候选中快速筛选出千级候选，排序层则对候选进行精细打分。工业界的推荐系统需要在准确性、多样性、新颖性和实时性之间做出权衡，这要求工程师既掌握算法原理，又具备工程化能力。`,
      code: [
        {
          lang: "python",
          code: `# 推荐系统基础架构
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List

@dataclass
class RecommendationRequest:
    user_id: str
    context: dict
    top_k: int = 10

@dataclass
class RecommendationResult:
    item_id: str
    score: float
    reason: str = ""

class Recommender(ABC):
    @abstractmethod
    def recommend(self, request: RecommendationRequest) -> List[RecommendationResult]:
        pass`
        },
        {
          lang: "python",
          code: `# 评估指标计算
import numpy as np

def precision_at_k(y_true: np.ndarray, y_pred: np.ndarray, k: int) -> float:
    top_k_idx = np.argsort(y_pred)[::-1][:k]
    relevant = y_true[top_k_idx].sum()
    return relevant / k

def ndcg_at_k(y_true: np.ndarray, y_pred: np.ndarray, k: int) -> float:
    top_k_idx = np.argsort(y_pred)[::-1][:k]
    dcg = np.sum(y_true[top_k_idx] / np.log2(np.arange(2, k + 2)))
    ideal = np.sort(y_true)[::-1][:k]
    idcg = np.sum(ideal / np.log2(np.arange(2, k + 2)))
    return dcg / idcg if idcg > 0 else 0.0`
        }
      ],
      table: {
        headers: ["组件", "职责", "典型算法", "候选规模"],
        rows: [
          ["召回层", "快速筛选候选", "Item-CF, 双塔模型", "百万 -> 千"],
          ["粗排层", "初步排序过滤", "浅层神经网络", "千 -> 百"],
          ["精排层", "精准打分排序", "DeepFM, DIN", "百 -> 十"],
          ["重排层", "多样性与业务规则", "MMR, 打散策略", "十 -> 展示"]
        ]
      },
      mermaid: `graph LR
    A["用户行为日志"] --> B["召回层"]
    B --> C["粗排层"]
    C --> D["精排层"]
    D --> E["重排层"]
    E --> F["推荐结果"]`,
      tip: "推荐系统设计首先要明确业务目标，是提升点击率、转化率还是用户留存率，不同目标决定了模型优化方向",
      warning: "不要过度追求模型复杂度，简单的协同过滤在很多场景下已经足够好，模型复杂度应该与数据规模相匹配"
    },
    {
      title: "2. 协同过滤实战",
      body: `协同过滤是最经典的推荐算法之一，核心思想是"物以类聚，人以群分"。User-Based CF 找到与目标用户兴趣相似的其他用户，推荐他们喜欢但目标用户还没接触过的项目。Item-Based CF 则计算物品之间的相似度，根据用户历史行为推荐相似物品。两者各有优劣：User-CF 适合用户少、物品多的场景，能发现用户的潜在兴趣；Item-CF 适合物品少、用户多的场景，推荐结果可解释性强。相似度计算常用余弦相似度、皮尔逊相关系数和 Jaccard 系数。协同过滤的局限在于稀疏性问题——当用户-物品交互矩阵非常稀疏时，很难找到可靠的相似邻居，这也催生了矩阵分解等更高级的方法。`,
      code: [
        {
          lang: "python",
          code: `# User-Based 协同过滤
from collections import defaultdict
import numpy as np

class UserCF:
    def __init__(self, k=20):
        self.k = k
        self.user_sim = {}

    def build(self, user_items: dict):
        # 构建物品-用户倒排表
        item_users = defaultdict(set)
        for uid, items in user_items.items():
            for item in items:
                item_users[item].add(uid)

        # 计算用户相似度（余弦相似度）
        sim = defaultdict(lambda: defaultdict(float))
        for item, users in item_users.items():
            for u1 in users:
                for u2 in users:
                    if u1 != u2:
                        sim[u1][u2] += 1

        for u1 in sim:
            norm1 = len(user_items.get(u1, set()))
            for u2 in sim[u1]:
                norm2 = len(user_items.get(u2, set()))
                sim[u1][u2] /= np.sqrt(norm1 * norm2)

        self.user_sim = sim

    def recommend(self, user_id, user_items, top_k=10):
        scores = defaultdict(float)
        for neighbor, s in sorted(
            self.user_sim[user_id].items(), key=lambda x: -x[1]
        )[:self.k]:
            for item in user_items.get(neighbor, set()):
                if item not in user_items.get(user_id, set()):
                    scores[item] += s
        return sorted(scores.items(), key=lambda x: -x[1])[:top_k]`
        },
        {
          lang: "python",
          code: `# Item-Based 协同过滤
class ItemCF:
    def __init__(self, k=10):
        self.k = k
        self.item_sim = {}

    def build(self, user_items: dict):
        item_count = defaultdict(int)
        item_pair_count = defaultdict(int)

        for uid, items in user_items.items():
            for item in items:
                item_count[item] += 1
            items_list = list(items)
            for i in range(len(items_list)):
                for j in range(i + 1, len(items_list)):
                    item_pair_count[items_list[i]][items_list[j]] += 1
                    item_pair_count[items_list[j]][items_list[i]] += 1

        sim = defaultdict(lambda: defaultdict(float))
        for i1 in item_pair_count:
            for i2, count in item_pair_count[i1].items():
                sim[i1][i2] = count / np.sqrt(item_count[i1] * item_count[i2])

        self.item_sim = sim

    def recommend(self, user_id, user_items, top_k=10):
        scores = defaultdict(float)
        for item in user_items.get(user_id, set()):
            for related, s in sorted(
                self.item_sim[item].items(), key=lambda x: -x[1]
            )[:self.k]:
                if related not in user_items.get(user_id, set()):
                    scores[related] += s
        return sorted(scores.items(), key=lambda x: -x[1])[:top_k]`
        }
      ],
      table: {
        headers: ["算法", "相似度计算", "适用场景", "计算复杂度"],
        rows: [
          ["User-CF", "用户向量余弦相似度", "用户少物品多", "O(U^2 * I)"],
          ["Item-CF", "物品共现归一化", "物品少用户多", "O(I^2 * U)"],
          ["Slope One", "平均评分差", "实时推荐", "O(I^2)"],
          ["KNN-CF", "k近邻搜索", "大规模数据", "O(U * log U)"]
        ]
      },
      mermaid: `graph TD
    A["用户评分矩阵"] --> B{"选择算法"}
    B -->|"用户相似"| C["User-CF"]
    B -->|"物品相似"| D["Item-CF"]
    C --> E["找相似用户"]
    D --> F["找相似物品"]
    E --> G["加权评分聚合"]
    F --> G
    G --> H["Top-N 推荐"]`,
      tip: "实现协同过滤时，先用稀疏矩阵（scipy.sparse）存储用户-物品交互数据，可以大幅降低内存消耗",
      warning: "协同过滤存在热门物品偏差问题，热门物品会与几乎所有物品都产生高相似度，需要做 popularity normalization"
    },
    {
      title: "3. 矩阵分解技术",
      body: `矩阵分解将高维稀疏的用户-物品评分矩阵分解为两个低维稠密矩阵的乘积，从而挖掘用户和物品的隐向量表示。SVD 是最基础的矩阵分解方法，但传统 SVD 要求矩阵稠密，无法直接处理含有大量缺失值的推荐场景。FunkSVD 通过随机梯度下降只优化已知评分项，巧妙解决了稀疏性问题。ALS（交替最小二乘）是另一种广泛使用的优化方法，它固定一个矩阵来优化另一个矩阵，交替迭代直到收敛。矩阵分解的优势在于能够捕获用户和物品的潜在特征，比如电影推荐中可能自动学习到"动作片偏好"、"文艺片偏好"等隐语义。相比协同过滤，矩阵分解泛化能力更强，能推荐用户从未交互过的物品类别。`,
      code: [
        {
          lang: "python",
          code: `# FunkSVD 矩阵分解
import numpy as np
from tqdm import tqdm

class FunkSVD:
    def __init__(self, n_factors=50, lr=0.005, reg=0.02, n_epochs=20):
        self.n_factors = n_factors
        self.lr = lr
        self.reg = reg
        self.n_epochs = n_epochs

    def fit(self, ratings: np.ndarray, n_users: int, n_items: int):
        # 初始化用户和物品隐向量
        self.P = np.random.normal(0, 0.1, (n_users, self.n_factors))
        self.Q = np.random.normal(0, 0.1, (n_items, self.n_factors))
        self.bu = np.zeros(n_users)
        self.bi = np.zeros(n_items)
        self.mu = ratings[:, 2].mean()

        for epoch in range(self.n_epochs):
            np.random.shuffle(ratings)
            total_loss = 0.0
            for uid, iid, r in ratings:
                pred = self.mu + self.bu[uid] + self.bi[iid] + \
                       self.P[uid] @ self.Q[iid]
                err = r - pred
                total_loss += err ** 2

                # 梯度下降更新
                self.bu[uid] += self.lr * (err - self.reg * self.bu[uid])
                self.bi[iid] += self.lr * (err - self.reg * self.bi[iid])
                self.P[uid] += self.lr * (err * self.Q[iid] - self.reg * self.P[uid])
                self.Q[iid] += self.lr * (err * self.P[uid] - self.reg * self.Q[iid])

            rmse = np.sqrt(total_loss / len(ratings))
            print(f"Epoch {epoch}: RMSE = {rmse:.4f}")

    def predict(self, uid: int, iid: int) -> float:
        return self.mu + self.bu[uid] + self.bi[iid] + self.P[uid] @ self.Q[iid]`
        },
        {
          lang: "python",
          code: `# ALS 矩阵分解
from scipy.sparse import csr_matrix
import numpy as np

class ALS:
    def __init__(self, n_factors=50, reg=0.1, n_iters=15):
        self.n_factors = n_factors
        self.reg = reg
        self.n_iters = n_iters

    def fit(self, R: csr_matrix):
        n_users, n_items = R.shape
        self.U = np.random.normal(0, 0.1, (n_users, self.n_factors))
        self.V = np.random.normal(0, 0.1, (n_items, self.n_factors))

        I = np.eye(self.n_factors)
        R_dense = R.toarray()

        for iteration in range(self.n_iters):
            # 固定 V，更新 U
            for u in range(n_users):
                rated_items = np.where(R_dense[u, :] > 0)[0]
                V_rated = self.V[rated_items, :]
                A = V_rated.T @ V_rated + self.reg * I
                b = V_rated.T @ R_dense[u, rated_items]
                self.U[u, :] = np.linalg.solve(A, b)

            # 固定 U，更新 V
            for i in range(n_items):
                rated_users = np.where(R_dense[:, i] > 0)[0]
                U_rated = self.U[rated_users, :]
                A = U_rated.T @ U_rated + self.reg * I
                b = U_rated.T @ R_dense[rated_users, i]
                self.V[i, :] = np.linalg.solve(A, b)

    def predict(self, uid: int, iid: int) -> float:
        return self.U[uid] @ self.V[iid]`
        }
      ],
      table: {
        headers: ["方法", "优化算法", "优点", "缺点"],
        rows: [
          ["FunkSVD", "SGD", "实现简单，内存占用低", "需要调学习率，收敛慢"],
          ["ALS", "交替最小二乘", "可并行，收敛稳定", "内存消耗大"],
          ["BPR-MF", "贝叶斯个性化排序", "优化排序指标", "需要负采样策略"],
          ["SVD++", "SGD + 隐式反馈", "利用隐式反馈", "计算复杂度高"]
        ]
      },
      mermaid: `graph LR
    A["评分矩阵 R(m*n)"] --> B["分解"]
    B --> C["用户矩阵 P(m*k)"]
    B --> D["物品矩阵 Q(n*k)"]
    C --> E["隐向量"]
    D --> E
    E --> F["预测评分 = P * Q^T"]
    F --> G["Top-N 推荐"]`,
      tip: "矩阵分解的隐向量维度一般取 50-200，过小无法捕获足够特征，过大容易过拟合，建议用交叉验证选择",
      warning: "矩阵分解无法利用用户和物品的侧信息（如用户年龄、物品类别），这是它不如深度学习模型的关键局限"
    },
    {
      title: "4. 深度学习推荐模型",
      body: `深度学习推荐模型通过神经网络强大的特征表达能力，突破了传统推荐算法的局限。Wide & Deep 模型将记忆（Wide 侧的线性模型）与泛化（Deep 侧的神经网络）结合，既保留了对历史规则的精确记忆，又具备了对未知组合的泛化能力。DeepFM 进一步统一了 Wide 和 Deep 部分，用 FM 层替代 Wide 侧，实现了端到端的联合训练。DIN（深度兴趣网络）通过注意力机制建模用户历史行为与候选物品的相关性，使推荐结果更加个性化。神经协同过滤（NCF）用多层感知机替代矩阵分解的内积运算，能够学习更复杂的用户-物品交互函数。这些模型的核心思想是将推荐问题转化为特征工程和表征学习问题。`,
      code: [
        {
          lang: "python",
          code: `# DeepFM 模型（PyTorch 简化版）
import torch
import torch.nn as nn
import torch.nn.functional as F

class DeepFM(nn.Module):
    def __init__(self, field_dims, embed_dim=16, mlp_dims=(256, 128, 64)):
        super().__init__()
        self.embedding = nn.Embedding(sum(field_dims), embed_dim)
        self.offsets = torch.tensor(
            (0, *torch.cumsum(torch.tensor(field_dims[:-1]), dim=0).numpy()),
            dtype=torch.long
        )
        self.fm_first = nn.Embedding(sum(field_dims), 1)

        # FM 二阶交互
        self.fm_second = nn.ModuleList([
            nn.Embedding(field_dims[i], embed_dim) for i in range(len(field_dims))
        ])

        # DNN 部分
        input_dim = len(field_dims) * embed_dim
        layers = []
        for dim in mlp_dims:
            layers.append(nn.Linear(input_dim, dim))
            layers.append(nn.BatchNorm1d(dim))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(0.3))
            input_dim = dim
        layers.append(nn.Linear(input_dim, 1))
        self.dnn = nn.Sequential(*layers)

    def forward(self, x):
        x = x + self.offsets.unsqueeze(0)
        # FM 一阶
        fm_first = self.fm_first(x).sum(dim=1)
        # FM 二阶
        embeds = [fm(x[:, i:i+1]) for i, fm in enumerate(self.fm_second)]
        embeds = torch.cat(embeds, dim=1)
        sum_square = torch.sum(embeds, dim=1) ** 2
        square_sum = torch.sum(embeds ** 2, dim=1)
        fm_second = 0.5 * torch.sum(sum_square - square_sum, dim=1, keepdim=True)
        # DNN
        dnn_out = self.dnn(embeds.view(embeds.size(0), -1))
        return torch.sigmoid(fm_first + fm_second + dnn_out)`
        },
        {
          lang: "python",
          code: `# DIN 注意力网络（PyTorch）
class DINAttention(nn.Module):
    def __init__(self, hidden_dim=64):
        super().__init__()
        self.attention = nn.Sequential(
            nn.Linear(hidden_dim * 4, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1)
        )

    def forward(self, candidate, history, mask):
        # candidate: (batch, hidden_dim)
        # history: (batch, seq_len, hidden_dim)
        # mask: (batch, seq_len)
        batch_size, seq_len, hidden_dim = history.shape

        # 扩展 candidate
        candidate = candidate.unsqueeze(1).expand(-1, seq_len, -1)

        # 构造注意力输入
        attn_input = torch.cat([
            candidate, history,
            candidate - history, candidate * history
        ], dim=-1)

        # 计算注意力权重
        attn_weights = self.attention(attn_input).squeeze(-1)
        attn_weights = attn_weights.masked_fill(mask == 0, -1e9)
        attn_weights = F.softmax(attn_weights, dim=1)

        # 加权求和
        output = (history * attn_weights.unsqueeze(-1)).sum(dim=1)
        return output`
        }
      ],
      table: {
        headers: ["模型", "核心思想", "特征交互", "典型应用"],
        rows: [
          ["Wide & Deep", "记忆 + 泛化", "手动交叉 + DNN", "Google Play"],
          ["DeepFM", "端到端特征交互", "FM 层 + DNN", "华为推荐"],
          ["DIN", "用户兴趣注意力", "注意力加权历史", "淘宝推荐"],
          ["NCF", "神经网络替代内积", "MLP 隐式交互", "通用推荐"]
        ]
      },
      mermaid: `graph TD
    A["输入特征"] --> B["Embedding 层"]
    B --> C["FM 层"]
    B --> D["DNN 层"]
    C --> E["一阶特征"]
    C --> F["二阶特征"]
    D --> G["高阶特征"]
    E --> H["拼接"]
    F --> H
    G --> H
    H --> I["输出层 Sigmoid"]`,
      tip: "深度学习推荐模型训练时，建议先用 FM 或 LR 建立 baseline，再逐步叠加 DNN 组件，这样能清楚定位每一层的效果",
      warning: "深度学习模型容易过拟合，尤其是 embedding 维度设置过高时，务必加入 Dropout、L2 正则化和 Early Stopping"
    },
    {
      title: "5. 召回与排序两阶段架构",
      body: `工业级推荐系统普遍采用召回加排序的两阶段架构。召回层负责从海量候选中快速筛选，要求极高的查询速度和覆盖率，常用方法包括 Item-CF 召回、向量召回（双塔模型）、热门召回和新物品召回等。排序层则对召回的候选进行精准打分，可以使用复杂的深度学习模型如 DeepFM、DIN 等。双塔模型是召回层的核心技术之一，用户塔和物品塔分别编码用户和物品特征，通过向量内积计算匹配度，支持用近似最近邻（ANN）索引进行快速检索。两阶段架构的关键在于召回和排序的协同——召回决定了排序的上限，排序决定了召回的利用率。如果召回阶段遗漏了用户真正感兴趣的内容，再强大的排序模型也无能为力。`,
      code: [
        {
          lang: "python",
          code: `# 双塔模型（PyTorch）
import torch
import torch.nn as nn

class TwoTowerModel(nn.Module):
    def __init__(self, user_dims, item_dims, embed_dim=64):
        super().__init__()
        # 用户塔
        user_layers = []
        for in_dim, out_dim in zip(user_dims[:-1], user_dims[1:]):
            user_layers.extend([
                nn.Linear(in_dim, out_dim),
                nn.ReLU(),
                nn.Dropout(0.2)
            ])
        user_layers.append(nn.Linear(user_dims[-1], embed_dim))
        self.user_tower = nn.Sequential(*user_layers)

        # 物品塔
        item_layers = []
        for in_dim, out_dim in zip(item_dims[:-1], item_dims[1:]):
            item_layers.extend([
                nn.Linear(in_dim, out_dim),
                nn.ReLU(),
                nn.Dropout(0.2)
            ])
        item_layers.append(nn.Linear(item_dims[-1], embed_dim))
        self.item_tower = nn.Sequential(*item_layers)

    def forward(self, user_input, item_input):
        user_emb = self.user_tower(user_input)
        item_emb = self.item_tower(item_input)
        # L2 归一化
        user_emb = F.normalize(user_emb, p=2, dim=-1)
        item_emb = F.normalize(item_emb, p=2, dim=-1)
        return torch.sum(user_emb * item_emb, dim=-1)`
        },
        {
          lang: "python",
          code: `# ANN 向量召回（faiss 集成）
import faiss
import numpy as np

class VectorRecall:
    def __init__(self, dim: int, nlist: int = 100):
        self.dim = dim
        self.quantizer = faiss.IndexFlatIP(dim)
        self.index = faiss.IndexIVFFlat(
            self.quantizer, dim, nlist, faiss.METRIC_INNER_PRODUCT
        )
        self.id_mapping = []

    def build(self, item_vectors: np.ndarray, item_ids: list):
        self.index.train(item_vectors)
        self.index.add(item_vectors.astype(np.float32))
        self.id_mapping = item_ids
        self.index.nprobe = 10

    def search(self, user_vector: np.ndarray, top_k: int = 100):
        user_vec = user_vector.reshape(1, -1).astype(np.float32)
        scores, indices = self.index.search(user_vec, top_k)
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:
                results.append((self.id_mapping[idx], float(score)))
        return results

    def add_items(self, vectors: np.ndarray, ids: list):
        self.index.add(vectors.astype(np.float32))
        self.id_mapping.extend(ids)`
        }
      ],
      table: {
        headers: ["召回策略", "召回数量", "延迟要求", "核心指标"],
        rows: [
          ["Item-CF 召回", "500-1000", "< 50ms", "覆盖率"],
          ["向量召回（双塔）", "500-2000", "< 30ms", "命中率"],
          ["热门召回", "100-200", "< 10ms", "兜底率"],
          ["实时行为召回", "200-500", "< 100ms", "时效性"]
        ]
      },
      mermaid: `graph LR
    A["用户请求"] --> B["多路召回"]
    B --> C["Item-CF"]
    B --> D["向量召回"]
    B --> E["热门召回"]
    C --> F["Merge & Dedup"]
    D --> F
    E --> F
    F --> G["排序模型"]
    G --> H["业务策略"]
    H --> I["最终推荐"]`,
      tip: "多路召回时，各路召回结果需要做 Merge 和去重，建议给每路结果分配不同权重，避免单一策略主导",
      warning: "向量召回的 ANN 索引在物品更新后需要及时增量更新，否则新旧物品向量不一致会导致推荐质量下降"
    },
    {
      title: "6. 冷启动问题与解决方案",
      body: `冷启动是推荐系统的经典难题，分为用户冷启动、物品冷启动和系统冷启动三种情况。用户冷指新用户没有任何历史行为数据，无法建立兴趣画像。物品冷启动指新物品没有被任何用户交互过，难以被推荐系统发现。系统冷启动则指全新平台缺乏用户和物品数据。解决冷启动的核心思路是利用辅助信息：对于用户，可以采集注册信息（性别、年龄、地区）、设备信息和初始兴趣选择；对于物品，可以提取文本特征、图像特征、类别标签等。内容推荐（Content-Based）在冷启动阶段尤为关键，它通过分析物品内容特征进行推荐，不依赖用户行为数据。另一种策略是探索与利用（Exploration & Exploitation），通过 Thompson Sampling 或 UCB 算法在推荐新物品的同时保证推荐质量。`,
      code: [
        {
          lang: "python",
          code: `# 基于内容的冷启动推荐
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class ContentBasedRecommender:
    def __init__(self):
        self.tfidf = TfidfVectorizer(
            stop_words='english', max_features=5000
        )
        self.item_profiles = None
        self.item_ids = []

    def build(self, items: list, descriptions: list):
        self.item_ids = items
        self.item_profiles = self.tfidf.fit_transform(descriptions)

    def recommend(self, liked_indices: list, top_k: int = 10):
        if not liked_indices:
            return []

        # 用户兴趣画像 = 喜欢物品的平均 TF-IDF
        user_profile = self.item_profiles[liked_indices].mean(axis=0)
        similarities = cosine_similarity(user_profile, self.item_profiles)[0]

        # 排除已喜欢的物品
        similarities[liked_indices] = -1
        top_indices = np.argsort(similarities)[::-1][:top_k]
        return [
            (self.item_ids[i], float(similarities[i]))
            for i in top_indices
        ]

    def recommend_for_new_item(self, item_desc: str, top_k: int = 10):
        vec = self.tfidf.transform([item_desc])
        sims = cosine_similarity(vec, self.item_profiles)[0]
        top_idx = np.argsort(sims)[::-1][:top_k]
        return [(self.item_ids[i], float(sims[i])) for i in top_idx]`
        },
        {
          lang: "python",
          code: `# Thompson Sampling 探索与利用
import numpy as np

class ThompsonSampling:
    def __init__(self, n_items: int):
        self.n_items = n_items
        # Beta 分布参数 alpha=成功+1, beta=失败+1
        self.alpha = np.ones(n_items)
        self.beta = np.ones(n_items)

    def select(self) -> int:
        # 从每个物品的 Beta 分布采样
        samples = np.random.beta(self.alpha, self.beta)
        return int(np.argmax(samples))

    def update(self, item_id: int, reward: float):
        # reward=1 表示点击，reward=0 表示未点击
        self.alpha[item_id] += reward
        self.beta[item_id] += (1 - reward)

    def get_ctr_estimate(self, item_id: int) -> float:
        return self.alpha[item_id] / (self.alpha[item_id] + self.beta[item_id])

# 使用示例
ts = ThompsonSampling(n_items=100)
for round in range(10000):
    item = ts.select()
    clicked = simulate_user_click(item)
    ts.update(item, int(clicked))`
        }
      ],
      table: {
        headers: ["冷启动类型", "挑战", "解决方案", "效果评估"],
        rows: [
          ["用户冷启动", "无行为数据", "注册信息 + 热门 + 探索", "首日点击率"],
          ["物品冷启动", "无交互记录", "内容特征 + 相似物品", "新物品曝光率"],
          ["系统冷启动", "数据全面缺失", "导入外部数据 + 规则", "冷启动转化率"],
          ["区域冷启动", "本地数据不足", "迁移学习 + 全局模型", "区域留存率"]
        ]
      },
      mermaid: `graph TD
    A["新物品/新用户"] --> B{"冷启动类型"}
    B -->|"新物品"| C["内容特征提取"]
    B -->|"新用户"| D["兴趣问卷"]
    B -->|"新系统"| E["导入外部数据"]
    C --> F["Content-Based 推荐"]
    D --> G["热门 + 探索策略"]
    E --> H["迁移学习"]
    F --> I["积累交互数据"]
    G --> I
    H --> I
    I --> J["切换到协同过滤"]`,
      tip: "冷启动阶段建议设置新物品流量扶持策略，给新物品一定的曝光机会，否则新物品永远无法积累交互数据",
      warning: "探索策略（如 Thompson Sampling）会影响短期用户体验，需要控制探索比例，一般在 5%-15% 之间"
    },
    {
      title: "7. PyTorch 完整推荐系统实战",
      body: `本节将构建一个端到端的推荐系统，整合前面介绍的核心技术。系统包含数据预处理、模型训练、评估和在线推理四个模块。数据预处理负责将原始用户行为数据转换为模型可用的格式，包括特征编码、序列构建和负样本采样。模型训练采用 DeepFM 架构，结合用户行为序列特征，实现精准的用户偏好建模。评估模块计算 AUC、NDCG 和 HitRate 等核心指标，全面衡量推荐效果。在线推理模块支持实时推荐请求，结合召回和排序流程，产出最终推荐结果。完整系统需要处理的关键工程问题包括：特征存储和实时更新、模型在线推理加速、AB 测试框架搭建以及推荐结果的多样性控制。`,
      code: [
        {
          lang: "python",
          code: `# 完整推荐系统 - 数据处理
import torch
from torch.utils.data import Dataset, DataLoader
import numpy as np
from collections import defaultdict

class RecDataset(Dataset):
    def __init__(self, interactions, user_features, item_features,
                 n_negatives=4):
        self.interactions = interactions
        self.user_features = user_features
        self.item_features = item_features
        self.n_negatives = n_negatives

        # 构建用户交互映射
        self.user_pos = defaultdict(set)
        for uid, iid in interactions:
            self.user_pos[uid].add(iid)

    def __len__(self):
        return len(self.interactions)

    def __getitem__(self, idx):
        uid, iid, label = self.interactions[idx]

        # 负采样
        if label == 0:
            while iid in self.user_pos[uid]:
                iid = np.random.randint(
                    0, len(self.item_features)
                )

        user_feat = self.user_features[uid]
        item_feat = self.item_features[iid]

        return {
            'user': torch.tensor(user_feat, dtype=torch.long),
            'item': torch.tensor(item_feat, dtype=torch.long),
            'label': torch.tensor(label, dtype=torch.float32)
        }

def build_dataloader(interactions, user_feat, item_feat,
                     batch_size=256, shuffle=True):
    dataset = RecDataset(interactions, user_feat, item_feat)
    return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle)`
        },
        {
          lang: "python",
          code: `# 完整推荐系统 - 训练与推理
import torch
import torch.nn as nn
from torch.optim import Adam
from sklearn.metrics import roc_auc_score

class CompleteRecommender:
    def __init__(self, model, lr=0.001):
        self.model = model
        self.optimizer = Adam(model.parameters(), lr=lr, weight_decay=1e-5)
        self.loss_fn = nn.BCELoss()

    def train_epoch(self, dataloader):
        self.model.train()
        total_loss = 0.0
        all_labels = []
        all_preds = []

        for batch in dataloader:
            preds = self.model(batch['user'], batch['item'])
            loss = self.loss_fn(preds, batch['label'])

            self.optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            self.optimizer.step()

            total_loss += loss.item()
            all_labels.extend(batch['label'].tolist())
            all_preds.extend(preds.detach().tolist())

        auc = roc_auc_score(all_labels, all_preds)
        return total_loss / len(dataloader), auc

    def recommend(self, user_id: int, item_features: np.ndarray,
                  user_features: np.ndarray, top_k: int = 10):
        self.model.eval()
        user_feat = torch.tensor(
            user_features[user_id:user_id+1], dtype=torch.long
        )
        item_feats = torch.tensor(item_features, dtype=torch.long)

        with torch.no_grad():
            user_expanded = user_feat.expand(len(item_feats), -1)
            scores = self.model(user_expanded, item_feats)

        top_indices = torch.argsort(scores, descending=True)[:top_k]
        return [
            (int(idx), float(scores[idx]))
            for idx in top_indices
        ]

    def save(self, path: str):
        torch.save({
            'model_state': self.model.state_dict(),
            'optimizer_state': self.optimizer.state_dict(),
        }, path)

    def load(self, path: str):
        checkpoint = torch.load(path)
        self.model.load_state_dict(checkpoint['model_state'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state'])`
        }
      ],
      table: {
        headers: ["模块", "职责", "技术选型", "关键指标"],
        rows: [
          ["数据处理", "特征工程与负采样", "PyTorch Dataset", "数据覆盖率"],
          ["模型训练", "参数优化与验证", "Adam + BCELoss", "AUC > 0.85"],
          ["在线推理", "实时推荐生成", "Faiss + TorchScript", "P99 < 50ms"],
          ["AB 实验", "效果验证与迭代", "分流 + 统计检验", "统计显著性"]
        ]
      },
      mermaid: `graph TD
    A["原始数据"] --> B["特征工程"]
    B --> C["训练数据集"]
    C --> D["模型训练"]
    D --> E["离线评估"]
    E --> F{"AUC达标?"}
    F -->|"否"| D
    F -->|"是"| G["导出模型"]
    G --> H["在线服务"]
    H --> I["推荐结果"]
    I --> J["用户反馈"]
    J --> B`,
      tip: "训练推荐模型时，负样本比例建议设置为 1:3 到 1:5（正:负），过多的负样本会降低训练效率，过少则模型区分能力不足",
      warning: "在线推理时务必对模型输入做格式校验和异常处理，脏数据可能导致模型输出异常推荐结果"
    },
  ],
};
