import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-014",
    title: "神经架构搜索 NAS：自动设计网络",
    category: "dl",
    tags: ["NAS", "AutoML", "架构搜索"],
    summary: "让 AI 设计 AI，理解神经架构搜索的核心方法与前沿进展",
    date: "2026-04-12",
    readTime: "18 min",
    level: "高级",
    content: [
        {
            title: "1. 为什么需要 NAS：从手工设计到自动搜索",
            body: `过去十年，深度学习架构的设计几乎完全依赖人类专家的经验和直觉。从 LeNet 到 AlexNet，从 VGG 到 ResNet，每一个里程碑背后都是研究人员数月甚至数年的试错。这种「手工调参」的方式存在三个根本问题：一是搜索空间巨大但人类只能探索极小一部分；二是人类设计偏向于熟悉的模式，容易陷入局部最优；三是不同任务需要不同架构，针对每个任务从头设计成本极高。

神经架构搜索（Neural Architecture Search, NAS）的核心理念非常简单：既然设计网络本质上是一个优化问题，为什么不把「架构」本身也作为优化的变量？2016 年，Zoph 和 Le 首次将强化学习引入 NAS，用 RNN 控制器生成网络架构描述，然后在目标数据集上训练该架构并以其验证集准确率作为奖励信号来更新控制器。这个开创性工作证明了自动搜索出的架构可以达到甚至超越人类专家设计的水平。

NAS 的本质是一个双层优化（bilevel optimization）问题：外层优化搜索架构参数，内层优化给定架构下的权重参数。这两个层次的优化相互耦合——架构决定了权重的优化空间，权重又决定了架构的最终表现。正是这种耦合关系，使得 NAS 的计算成本极高，也催生了大量加速策略的研究。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn

class NASCell(nn.Module):
    """NAS 搜索出的基本计算单元（cell）
    每个 cell 由多个节点组成，每个节点是对前驱节点的
    某种运算（卷积、池化、跳跃连接等）的组合"""
    def __init__(self, in_channels, out_channels, steps=4):
        super().__init__()
        self.steps = steps
        self.preprocessors = nn.ModuleList([
            nn.Conv2d(in_channels, out_channels, 1) for _ in range(2)
        ])
        # 每个节点有 2 个输入边
        self.edges = nn.ModuleList([
            nn.ModuleDict({
                f"op_{j}": self._make_mix_op(out_channels)
                for j in range(2)
            })
            for _ in range(steps)
        ])
    
    def _make_mix_op(self, channels):
        """混合运算：包含多种候选操作"""
        return nn.ModuleDict({
            "conv_3x3": nn.Conv2d(channels, channels, 3, padding=1),
            "conv_5x5": nn.Conv2d(channels, channels, 5, padding=2),
            "max_pool": nn.MaxPool2d(3, stride=1, padding=1),
            "avg_pool": nn.AvgPool2d(3, stride=1, padding=1),
            "skip_connect": nn.Identity(),
            "zero": nn.Conv2d(channels, channels, 1),
        })
    
    def forward(self, s0, s1):
        """s0, s1: 前两个节点的输出"""
        states = [self.preprocessors[0](s0), self.preprocessors[1](s1)]
        for i, edge_ops in enumerate(self.edges):
            # 每个节点选择两个前驱节点进行操作
            s_cur = edge_ops["op_0"](states[-2]) + edge_ops["op_1"](states[-1])
            states.append(s_cur)
        return torch.cat(states[-self.steps:], dim=1)`,
                },
                {
                    lang: "python",
                    code: `# NAS 双层优化的简化数学表述
import numpy as np

def bilevel_nas_formulation():
    """
    NAS 的双层优化问题：
    
    外层（架构搜索）:
        min_α  L_val(w*(α), α)
        s.t. w*(α) = argmin_w L_train(w, α)
    
    其中:
        α = 架构参数（离散选择或连续松弛）
        w = 网络权重
        L_train = 训练集损失
        L_val = 验证集损失
    
    这个公式揭示了一个关键洞察：
    架构的好坏取决于它训练后的验证表现，
    而训练效果又取决于架构本身。
    """
    print("NAS 双层优化:")
    print("  外层:  min_α L_val(w*(α), α)")
    print("  内层:  w*(α) = argmin_w L_train(w, α)")
    print()
    print("直接求解的计算量:")
    print("  每个候选架构 α 需要完整训练 w")
    print("  搜索 10^6 个架构 × 每个训练 100 epoch")
    print("  ≈ 10^8 GPU 小时（不可行）")
    print()
    print("加速策略:")
    print("  1. 权重共享（Weight Sharing）")
    print("  2. One-Shot / Supernet 方法")
    print("  3. 可微松弛（DARTS）")
    print("  4. 代理指标（Proxy Tasks）")
    print("  5. 预测器（Predictor-based）")

bilevel_nas_formulation()`,
                },
            ],
            table: {
                headers: ["方法类别", "代表工作", "搜索成本", "架构质量", "适用场景"],
                rows: [
                    ["强化学习", "NASNet (Zoph 2016)", "2000 GPU 天", "极高", "算力充足，追求极致"],
                    ["进化算法", "AmoebaNet (Real 2019)", "1000 GPU 天", "高", "大规模搜索"],
                    ["梯度优化", "DARTS (Liu 2019)", "4 GPU 天", "中高", "中等算力，快速原型"],
                    ["权重共享", "ENAS (Pham 2018)", "0.5 GPU 天", "中", "资源受限场景"],
                    ["零成本代理", "TE-NAS (Wang 2021)", "< 1 GPU 天", "中", "极简搜索"],
                    ["预测器", "NAT (White 2021)", "10 GPU 天", "高", "需要历史数据训练预测器"],
                ],
            },
            mermaid: `graph LR
    subgraph "NAS 三要素"
        A["搜索空间\nSearch Space"] --> B["搜索策略\nSearch Strategy"]
        B --> C["评估策略\nEvaluation Strategy"]
    end
    
    subgraph "搜索空间"
        A1["Chain-structured"]
        A2["Cell-based"]
        A3["Hierarchical"]
    end
    
    subgraph "搜索策略"
        B1["强化学习\nRL"]
        B2["进化算法\nEA"]
        B3["梯度优化\nGradient"]
        B4["随机/网格搜索"]
    end
    
    subgraph "评估策略"
        C1["从头训练\nFrom Scratch"]
        C2["权重共享\nWeight Sharing"]
        C3["低精度代理\nProxy"]
        C4["零成本指标\nZero-Cost"]
    end
    
    A --> A1 & A2 & A3
    B --> B1 & B2 & B3 & B4
    C --> C1 & C2 & C3 & C4
    
    style A fill:#1e3a5f
    style B fill:#14532d
    style C fill:#7c2d12`,
            tip: "理解 NAS 的第一步是记住它的三个核心组件：搜索空间定义了「能搜什么」，搜索策略决定了「怎么搜」，评估策略解决了「搜得太慢怎么办」。这三个组件的任何组合都能构成一个 NAS 方法。",
        },
        {
            title: "2. 搜索空间定义：限制与表达的权衡",
            body: `搜索空间是 NAS 的第一个关键设计决策。理论上，搜索空间可以包含所有可能的计算图，但这会导致空间过大而无法搜索。实践中，研究者通过引入结构先验来缩小搜索空间，但这又限制了发现新架构的可能性——这是一个经典的「探索与利用」权衡。

最经典的搜索空间设计是「链式结构」（chain-structured），即把网络视为一系列层的线性堆叠，搜索每一层的类型（卷积、池化等）和超参数（kernel size、filter number）。这种方法直观但表达能力有限。2017 年，Zoph 等人提出了「cell-based」搜索空间：将网络视为重复堆叠的计算单元（cell），搜索空间变为 cell 内部的结构。这种方法大幅缩小了搜索空间（只需搜索一个小 cell 而非整个网络），同时保持了足够的表达能力。

更高级的搜索空间包括「层次化结构」（hierarchical），将网络建模为多层次的图，每层可以是子图或基本操作；以及「宏-微观联合搜索」，同时搜索网络的整体拓扑和 cell 内部结构。近年来，研究者还探索了「可配置操作空间」，允许搜索不仅限于架构连接，还包括操作的内部参数（如 kernel size 和 expansion ratio）。`,
            code: [
                {
                    lang: "python",
                    code: `# Cell-based 搜索空间的编码方式
# 用邻接矩阵 + 操作列表表示一个 DAG 结构的 cell
import torch

class CellEncoding:
    """Cell 的图编码：邻接矩阵 + 操作编码"""
    def __init__(self, num_nodes=4, num_ops=5):
        self.num_nodes = num_nodes
        self.num_ops = num_ops
        # 操作映射
        self.op_names = [
            "conv_3x3", "conv_5x5", "max_pool_3x3",
            "avg_pool_3x3", "skip_connect"
        ]
    
    def random_cell(self):
        """随机生成一个合法的 cell 编码"""
        # 邻接矩阵：上三角矩阵（DAG 约束）
        adj = torch.zeros(self.num_nodes + 2, self.num_nodes + 2)
        for i in range(self.num_nodes + 1):
            for j in range(i + 1, self.num_nodes + 2):
                # 每对节点之间有边（0/1）
                adj[i, j] = torch.bernoulli(torch.tensor(0.5))
        
        # 每个有边的操作类型
        ops = torch.randint(0, self.num_ops, (self.num_nodes + 2,))
        ops[0] = 0  # 输入节点
        ops[-1] = 0  # 输出节点
        
        return {"adj": adj, "ops": ops}
    
    def decode_to_graph(self, encoding):
        """将编码转换为可执行计算图"""
        adj = encoding["adj"]
        ops = encoding["ops"]
        
        nodes = []
        # 输入节点
        for i in range(2, self.num_nodes + 2):
            predecessors = torch.where(adj[:i, i] == 1)[0]
            node_ops = [self.op_names[ops[p].item()] for p in predecessors]
            nodes.append({
                "predecessors": predecessors.tolist(),
                "operations": node_ops
            })
        return nodes

# 示例：生成并解析一个随机 cell
encoder = CellEncoding(num_nodes=4, num_ops=5)
cell = encoder.random_cell()
graph = encoder.decode_to_graph(cell)
for i, node in enumerate(graph):
    print(f"Node {i}: inputs={node['predecessors']}, ops={node['operations']}")`,
                },
                {
                    lang: "python",
                    code: `# 不同搜索空间的复杂度对比
import math

def analyze_search_space():
    """量化分析不同搜索空间的大小"""
    configs = {
        "链式 (8 层, 5 种操作)": {
            "layers": 8,
            "choices_per_layer": 5,
            "formula": "5^8"
        },
        "Cell (4 节点, 5 操作, 2 输入/节点)": {
            "intermediate_nodes": 4,
            "choices_per_node": 5,
            "input_pairs": math.comb(4 + 1, 2),  # C(5,2)
            "formula": "10^(5^4)"
        },
        "层次化 (3 层, 每层 2 选择)": {
            "levels": 3,
            "choices_per_level": 2,
            "formula": "2^(2^3)"
        },
        "宏-微观联合 (20 个 cell, 每 cell 100 种)": {
            "macro": "stack pattern",
            "micro": "cell structure",
            "formula": "~10^20"
        },
    }
    
    print("搜索空间大小对比:")
    print("=" * 60)
    for name, cfg in configs.items():
        size = eval(cfg["formula"])
        print(f"  {name}")
        print(f"    大小: {size:.2e}")
        print(f"    公式: {cfg['formula']}")
        print(f"    log2(空间): {math.log2(size):.1f} bits")
        print()
    
    print("结论:")
    print("  - 链式空间小但表达能力有限")
    print("  - Cell-based 是性价比最高的选择")
    print("  - 联合搜索需要强力评估策略")

analyze_search_space()`,
                },
            ],
            table: {
                headers: ["搜索空间类型", "编码方式", "空间大小", "表达能力", "典型工作"],
                rows: [
                    ["链式结构", "层类型序列", "O(op^n)", "低", "早期 RL-NAS"],
                    ["Cell-based", "DAG 邻接矩阵 + 操作", "O(10^6-10^10)", "高", "NASNet, ENAS, DARTS"],
                    ["层次化结构", "嵌套 DAG", "O(10^10-10^20)", "极高", "Hierarchical NAS"],
                    ["宏-微观联合", "双层编码", "O(10^15-10^30)", "极高", "NAS-FPN"],
                    ["可配置操作", "连续超参数 + 离散结构", "连续 × 离散", "最高", "ProxylessNAS"],
                ],
            },
            mermaid: `graph TD
    subgraph "Cell-based 搜索空间 (4 节点)"
        I0["输入 0"]
        I1["输入 1"]
        
        I0 & I1 -->|"边 0-1"| N2["中间节点 2"]
        I0 & I1 & N2 -->|"边 0-2"| N3["中间节点 3"]
        I0 & I1 & N2 & N3 -->|"边 0-3"| N4["中间节点 4"]
        I0 & I1 & N2 & N3 & N4 -->|"边 0-4"| N5["输出节点"]
    end
    
    subgraph "每个边的候选操作"
        Conv3["Conv 3x3"]
        Conv5["Conv 5x5"]
        Pool["Max Pool"]
        Skip["Skip Connect"]
        Zero["Zero (无边)"]
    end
    
    style I0 fill:#1e3a5f
    style I1 fill:#1e3a5f
    style N5 fill:#14532d`,
            warning: "搜索空间设计中的常见陷阱：(1) 包含 skip_connect 太多会导致搜索倾向于全部跳过的退化架构；(2) 不包含足够多的下采样操作会导致感受野不足；(3) 忽略 FLOPs 约束会搜出计算量过大的网络；(4) 在 CIFAR-10 上搜索的 cell 直接迁移到 ImageNet 时可能表现不佳，因为数据尺度差异太大。",
        },
        {
            title: "3. 搜索策略：RL、进化算法与梯度优化",
            body: `搜索策略决定了如何在巨大的搜索空间中找到高性能架构。最早的方法使用强化学习：将架构编码为动作序列，用 RNN 作为控制器，以验证集准确率作为奖励信号。Zoph 等人 2016 年的开创性工作用 PPO 训练了一个两层 LSTM 控制器，在 CIFAR-10 上搜出了错误率 3.65% 的架构。这种方法效果好但成本极高——需要数万 GPU 小时。

进化算法（Evolutionary Algorithm, EA）提供了另一种搜索范式。将每个架构视为一个个体，通过变异（mutation）和交叉（crossover）产生后代，根据适应度（验证准确率）选择保留哪些个体。Real 等人的 AmoebaNet 算法使用正则化进化（regularized evolution），在 ImageNet 上取得了 2.4% 的错误率，超越了当时所有手动设计的架构。EA 的优势在于不需要可微的目标函数，可以灵活地纳入各种约束（如延迟、FLOPs）。

2018 年，DARTS 论文提出了革命性的梯度优化方法：将离散的架构选择松弛为连续的权重参数，使整个搜索过程可以通过梯度下降优化。这种方法将搜索成本从数千 GPU 天降低到几天，是 NAS 领域最重要的突破之一。不过，梯度优化也带来了新的挑战——DARTS 容易出现性能崩溃（performance collapse），即搜索过程中大量选择 skip-connect 和 1x1 卷积等简单操作。`,
            code: [
                {
                    lang: "python",
                    code: `# 强化学习搜索策略：基于 PPO 的架构控制器
import torch
import torch.nn as nn
import torch.nn.functional as F

class RLController(nn.Module):
    """RNN 控制器：逐步生成架构描述"""
    def __init__(self, num_layers, choices_per_layer, hidden_size=64):
        super().__init__()
        self.num_layers = num_layers
        self.choices_per_layer = choices_per_layer
        self.hidden_size = hidden_size
        
        self.embedding = nn.Embedding(choices_per_layer, hidden_size)
        self.lstm = nn.LSTMCell(hidden_size, hidden_size)
        self.predictor = nn.Linear(hidden_size, choices_per_layer)
        self.temperature = nn.Parameter(torch.tensor(5.0))
    
    def sample_architecture(self, batch_size=1):
        """采样一批架构"""
        inputs = torch.zeros(batch_size, self.hidden_size)
        h, c = torch.zeros(batch_size, self.hidden_size), torch.zeros(batch_size, self.hidden_size)
        
        actions = []
        log_probs = []
        entropies = []
        
        for i in range(self.num_layers):
            h, c = self.lstm(inputs, (h, c))
            logits = self.predictor(h) / self.temperature
            probs = F.softmax(logits, dim=-1)
            
            # Gumbel-Softmax 或直接采样
            action = torch.multinomial(probs, 1).squeeze(-1)
            lp = F.log_softmax(logits, dim=-1).gather(1, action.unsqueeze(1)).squeeze()
            entropy = -(probs * F.log_softmax(logits, dim=-1)).sum(dim=-1)
            
            actions.append(action)
            log_probs.append(lp)
            entropies.append(entropy)
            
            inputs = self.embedding(action)
        
        return torch.stack(actions, dim=1), torch.stack(log_probs, dim=1), torch.stack(entropies, dim=1)`,
                },
                {
                    lang: "python",
                    code: `# 进化算法搜索策略
import random
from copy import deepcopy

class EvolutionaryNAS:
    """简化版正则进化 NAS"""
    def __init__(self, population_size=50, tournament_size=10, mutation_rate=0.3):
        self.population_size = population_size
        self.tournament_size = tournament_size
        self.mutation_rate = mutation_rate
        self.population = []  # [(arch_encoding, accuracy, age), ...]
    
    def mutate(self, arch):
        """对架构进行随机变异"""
        mutated = deepcopy(arch)
        # 变异类型 1: 修改某个节点的操作
        if random.random() < self.mutation_rate:
            node_idx = random.randint(0, len(mutated["ops"]) - 1)
            mutated["ops"][node_idx] = random.randint(0, 4)
        # 变异类型 2: 添加/删除边
        if random.random() < self.mutation_rate:
            i = random.randint(0, mutated["adj"].shape[0] - 2)
            j = random.randint(i + 1, mutated["adj"].shape[0] - 1)
            mutated["adj"][i, j] = 1 - mutated["adj"][i, j]
        return mutated
    
    def tournament_selection(self):
        """锦标赛选择：随机选 tournament_size 个，返回最优的"""
        candidates = random.sample(self.population, self.tournament_size)
        return max(candidates, key=lambda x: x[1])  # 按 accuracy 选择
    
    def step(self, evaluate_fn):
        """执行一代进化"""
        # 选择父代
        parent = self.tournament_selection()
        child_arch = self.mutate(parent[0])
        child_acc = evaluate_fn(child_arch)
        
        # 正则化进化：替换最老的个体
        oldest = min(self.population, key=lambda x: x[2])
        idx = self.population.index(oldest)
        self.population[idx] = (child_arch, child_acc, 0)
        
        # 所有个体年龄 +1
        for i in range(len(self.population)):
            self.population[i] = (self.population[i][0], self.population[i][1], 
                                  self.population[i][2] + 1)
        
        best = max(self.population, key=lambda x: x[1])
        return best
    
    def search(self, evaluate_fn, generations=200):
        """初始化种群并开始搜索"""
        for _ in range(self.population_size):
            arch = {"ops": [random.randint(0, 4) for _ in range(6)],
                    "adj": torch.bernoulli(torch.full((6, 6), 0.3)).triu(1)}
            acc = evaluate_fn(arch)
            self.population.append((arch, acc, 0))
        
        best_acc = 0
        for gen in range(generations):
            best = self.step(evaluate_fn)
            if best[1] > best_acc:
                best_acc = best[1]
                print(f"Gen {gen}: new best accuracy = {best_acc:.4f}")

# 模拟评估函数（实际应训练并验证）
def mock_evaluate(arch):
    return 0.85 + 0.1 * random.random()  # 模拟 85%-95% 的准确率`,
                },
            ],
            table: {
                headers: ["搜索策略", "优化方式", "可微?", "并行性", "代表工作"],
                rows: [
                    ["强化学习 (PPO/REINFORCE)", "策略梯度", "否", "异步并行", "NASNet, ENAS"],
                    ["进化算法 (EA)", "选择-变异-替换", "否", "高度并行", "AmoebaNet, Genetic CNN"],
                    ["随机搜索", "均匀/贝叶斯采样", "否", "完全并行", "RandomNAS"],
                    ["贝叶斯优化", "代理模型 + 采集函数", "否", "部分并行", "BOHB-NAS"],
                    ["梯度优化 (DARTS)", "连续松弛 + 梯度下降", "是", "有限", "DARTS, SNAS, GDAS"],
                    ["可微 + 离散混合", "两阶段：连续搜索 + 离散采样", "部分", "中等", "ProxylessNAS"],
                ],
            },
            mermaid: `graph TD
    subgraph "强化学习"
        RL1["RNN 控制器"] -->|"生成动作"| RL2["架构编码"]
        RL2 -->|"训练并评估"| RL3["验证准确率"]
        RL3 -->|"奖励信号"| RL1
    end
    
    subgraph "进化算法"
        EA1["初始种群"] -->|"评估适应度"| EA2["选择最优个体"]
        EA2 -->|"变异/交叉"| EA3["生成后代"]
        EA3 -->|"评估"| EA4["替换最差个体"]
        EA4 --> EA1
    end
    
    subgraph "梯度优化"
        G1["连续松弛架构参数 α"] -->|"交替优化"| G2["优化权重 w"]
        G2 -->|"交替优化"| G3["优化架构参数 α"]
        G3 -->|"取 argmax"| G4["离散架构"]
    end
    
    style RL3 fill:#14532d
    style EA2 fill:#7c2d12
    style G1 fill:#1e3a5f`,
            tip: "如果你的算力有限（< 8 GPU），强烈建议从随机搜索或正则进化开始。令人惊讶的是，Li & Talwalkar (2019) 的论文证明：对于许多 NAS 搜索空间，随机搜索 + 良好的评估策略可以匹敌甚至超越复杂的 RL/EA 方法。不要迷信复杂算法。",
        },
        {
            title: "4. 评估策略加速：权重共享与 One-Shot",
            body: `NAS 最大的挑战不是搜索策略本身，而是评估成本。在传统方法中，每个候选架构都需要从头训练到收敛才能评估其性能，这在百万级别的搜索空间中是完全不可行的。解决这个瓶颈的关键思路是：不要每次都从头训练，而是共享已经学到的权重。

权重共享（Weight Sharing）的核心思想是构建一个「超网络」（Supernet），包含搜索空间中所有可能的操作和连接。搜索过程中的每个候选架构对应超网络的一个子图。训练时，我们训练整个超网络；评估时，只需激活对应子图的权重即可得到该架构的性能估计。ENAS（Efficient NAS）首次系统性地展示了这种方法，将搜索成本降低了约 1000 倍。

One-Shot NAS 是权重共享的极致形式：只训练一次超网络，然后通过采样子架构来评估。这种方法的核心假设是：超网络中子架构的权重与其独立训练后的权重足够接近。虽然这个假设在理论上并不总是成立（Yu et al., 2020 发现权重共享的排名相关性很低），但在实践中，One-Shot 方法通常能找到足够好的架构。`,
            code: [
                {
                    lang: "python",
                    code: `# One-Shot Supernet 实现
import torch
import torch.nn as nn
import torch.nn.functional as F

class OneShotSupernet(nn.Module):
    """One-Shot NAS 超网络：所有操作同时训练"""
    def __init__(self, num_classes=10, num_stages=3, channels=64):
        super().__init__()
        self.num_stages = num_stages
        
        # 每个 stage 有多个候选操作
        self.stem = nn.Sequential(
            nn.Conv2d(3, channels, 3, padding=1),
            nn.BatchNorm2d(channels),
            nn.ReLU()
        )
        
        self.stages = nn.ModuleList()
        for s in range(num_stages):
            stage = OneShotStage(channels, s > 0)
            self.stages.append(stage)
            if s > 0:
                channels *= 2  # 下采样后通道翻倍
        
        self.global_pool = nn.AdaptiveAvgPool2d(1)
        self.classifier = nn.Linear(channels, num_classes)
    
    def forward(self, x, sample_path=None):
        """
        sample_path: 指定采样路径 (训练超网络时为 None，评估子网络时为具体路径)
        """
        x = self.stem(x)
        for stage in self.stages:
            x = stage(x, sample_path)
        x = self.global_pool(x).flatten(1)
        return self.classifier(x)


class OneShotStage(nn.Module):
    """一个 stage 包含所有候选操作"""
    def __init__(self, channels, downsample=False):
        super().__init__()
        stride = 2 if downsample else 1
        self.ops = nn.ModuleDict({
            "conv3x3": nn.Conv2d(channels, channels * (2 if downsample else 1), 
                                  3, stride=stride, padding=1),
            "conv5x5": nn.Conv2d(channels, channels * (2 if downsample else 1), 
                                  5, stride=stride, padding=2),
            "maxpool": nn.MaxPool2d(3, stride=stride, padding=1),
            "avgpool": nn.AvgPool2d(3, stride=stride, padding=1),
        })
    
    def forward(self, x, sample_path=None):
        if sample_path is not None:
            # 评估模式：只运行指定操作
            return self.ops[sample_path](x)
        else:
            # 训练模式：所有操作共享梯度
            return sum(self.ops[name](x) for name in self.ops) / len(self.ops)`,
                },
                {
                    lang: "python",
                    code: `# 超网络训练 + 子架构采样评估
import random
import torch.optim as optim

def train_supernet(supernet, dataloader, epochs=50):
    """训练超网络：每次随机采样一个子架构路径"""
    optimizer = optim.Adam(supernet.parameters(), lr=0.025, weight_decay=3e-4)
    
    for epoch in range(epochs):
        for batch_x, batch_y in dataloader:
            optimizer.zero_grad()
            
            # 随机采样路径
            op_names = list(supernet.stages[0].ops.keys())
            sample_path = [random.choice(op_names) for _ in range(supernet.num_stages)]
            
            # 前向传播
            logits = supernet(batch_x, sample_path=sample_path)
            loss = F.cross_entropy(logits, batch_y)
            
            # 反向传播：梯度只流向当前采样路径涉及的操作
            loss.backward()
            optimizer.step()
        
        if epoch % 10 == 0:
            print(f"Epoch {epoch}: loss = {loss.item():.4f}")


def evaluate_architecture(supernet, arch_encoding, val_loader):
    """评估特定架构在验证集上的表现"""
    supernet.eval()
    correct = 0
    total = 0
    
    with torch.no_grad():
        for x, y in val_loader:
            logits = supernet(x, sample_path=arch_encoding)
            preds = logits.argmax(dim=1)
            correct += (preds == y).sum().item()
            total += y.size(0)
    
    return correct / total


def search(supernet, val_loader, num_samples=100):
    """从训练好的超网络中搜索最佳架构"""
    op_names = list(supernet.stages[0].ops.keys())
    best_acc = 0
    best_arch = None
    
    for _ in range(num_samples):
        arch = [random.choice(op_names) for _ in range(supernet.num_stages)]
        acc = evaluate_architecture(supernet, arch, val_loader)
        if acc > best_acc:
            best_acc = acc
            best_arch = arch
            print(f"New best: {best_arch} -> {best_acc:.4f}")
    
    return best_arch, best_acc`,
                },
            ],
            table: {
                headers: ["评估策略", "核心思想", "训练成本", "评估准确性", "排名相关性"],
                rows: [
                    ["从头训练", "每个架构独立训练到收敛", "极高 (100%)", "精确", "1.0 (基准)"],
                    ["低精度训练", "减少 epoch/数据量", "低 (10-20%)", "中等", "~0.6"],
                    ["权重共享 (ENAS)", "所有操作共享超网络权重", "中 (30-50%)", "中等", "~0.4-0.6"],
                    ["One-Shot 采样", "训练超网络后采样评估", "低 (20-30%)", "较低", "~0.2-0.4"],
                    ["零成本代理", "仅用初始化信号，不训练", "极低 (< 1%)", "低", "~0.1-0.3"],
                    ["权重纠缠 (Yu 2020)", "解耦操作间权重干扰", "中 (30-50%)", "较高", "~0.7-0.8"],
                ],
            },
            mermaid: `graph TD
    subgraph "One-Shot NAS 流程"
        S1["定义搜索空间"] --> S2["构建超网络 (Supernet)"]
        S2 --> S3["训练超网络 (所有操作共享权重)"]
        S3 --> S4["采样子架构进行评估"]
        S4 --> S5["选择最佳架构"]
        S5 --> S6["从零训练最佳架构 (最终性能)"]
    end
    
    subgraph "训练时的权重共享"
        W1["操作 A 的权重 W_A"] -->|"被多个子架构共用"| W2["子架构 1: A+B"]
        W1 -->|"被多个子架构共用"| W3["子架构 2: A+C"]
        W1 -->|"被多个子架构共用"| W4["子架构 3: A+D"]
    end
    
    subgraph "关键挑战"
        C1["权重纠缠 (Weight Entanglement)"] -->|"一个架构的优化影响其他"| C2["评估排名不可靠"]
        C2 -->|"可能选错架构"| C3["最终性能低于预期"]
    end
    
    style S3 fill:#14532d
    style S6 fill:#7c2d12
    style C2 fill:#7f1d1d`,
            warning: "权重共享有一个被严重低估的问题：超网络训练时，不同子架构共享的权重会相互干扰。Yu et al. (2020) 的论文证明：超网络中的架构排名与从零训练的排名相关性可能低至 0.2。这意味着你搜出的最佳架构可能根本不是真正的最佳。解决方向包括：权重解耦训练、公平的公平比较（fair comparison）策略、以及多路径训练。",
        },
        {
            title: "5. DARTS：可微架构搜索的革命",
            body: `2018 年，Hanxiao Liu 等人提出了 DARTS（Differentiable Architecture Search），彻底改变了 NAS 的研究范式。DARTS 的核心突破在于：将离散的架构搜索问题松弛为一个连续的优化问题，使得我们可以用梯度下降直接优化架构参数。

具体来说，DARTS 将每个边的操作选择从「选择一个操作」松弛为「所有操作的加权混合」。对于连接节点 i 和 j 的边，其输出 o(i,j)(x) = Σ_k exp(α(i,j,k)) / Σ_k' exp(α(i,j,k')) · o_k(x)，其中 α(i,j,k) 是可学习的架构参数（architecture weights），表示选择操作 k 的重要程度。通过交替优化网络权重 w（内层）和架构参数 α（外层），DARTS 可以在几百个 GPU 小时内完成搜索，相比 RL-NAS 的数千 GPU 天，加速了约 1000 倍。

搜索完成后，DARTS 对每条边取 argmax α 来确定最终架构。这个过程看似简单，但存在一个严重的数值稳定性问题——当某些操作的 α 快速增长时，它们会主导整条边，导致其他操作无法得到足够的梯度信号。后续的改进工作（如 P-DARTS, SNAS, GDAS, DrNAS）试图缓解这个问题。`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class MixedOp(nn.Module):
    """混合操作：所有候选操作的加权组合"""
    def __init__(self, channels, stride=1):
        super().__init__()
        self._ops = nn.ModuleList([
            nn.Conv2d(channels, channels, 1, stride=stride),
            nn.Conv2d(channels, channels, 3, stride=stride, padding=1),
            nn.Conv2d(channels, channels, 5, stride=stride, padding=2),
            nn.MaxPool2d(3, stride=stride, padding=1),
            nn.AvgPool2d(3, stride=stride, padding=1),
            nn.Identity() if stride == 1 else nn.Conv2d(channels, channels, 1, stride=stride),
        ])
    
    def forward(self, x, weights):
        """
        weights: 长度为 num_ops 的向量，经 softmax 归一化
        """
        return sum(w * op(x) for w, op in zip(weights, self._ops))


class DARTSCell(nn.Module):
    """DARTS 可微 Cell"""
    def __init__(self, steps=4, multiplier=4, channels=64):
        super().__init__()
        self.steps = steps
        self.multiplier = multiplier
        self._k = sum(1 for i in range(steps) for _ in range(i + 2))
        
        # 架构参数（可学习）
        self.alphas_normal = nn.Parameter(1e-3 * torch.randn(self._k, 6))
        self.alphas_reduce = nn.Parameter(1e-3 * torch.randn(self._k, 6))
        
        # 混合操作
        self._ops = nn.ModuleList()
        for i in range(self._k):
            stride = 2 if i < 2 else 1  # 前两个是 reduction 边
            self._ops.append(MixedOp(channels, stride))
    
    def forward(self, s0, s1, normal_weights, reduce_weights):
        """
        s0, s1: 前两个节点的输出
        normal_weights, reduce_weights: 归一化的架构权重
        """
        states = [s0, s1]
        offset = 0
        for i in range(self.steps):
            # 判断是 normal 还是 reduce 边
            w = reduce_weights[offset:offset + i + 2] if i < 2 else normal_weights[offset:offset + i + 2]
            s = sum(self._ops[offset + j](states[j], w[j]) for j in range(i + 2))
            offset += i + 2
            states.append(s)
        return torch.cat(states[-self.steps:], dim=1)`,
                },
                {
                    lang: "python",
                    code: `class DARTS(nn.Module):
    """完整 DARTS 模型：可微架构搜索"""
    def __init__(self, C=16, num_classes=10, layers=8, steps=4):
        super().__init__()
        self.layers = layers
        self.stem = nn.Sequential(
            nn.Conv2d(3, C, 3, padding=1, bias=False),
            nn.BatchNorm2d(C)
        )
        
        # 预定义 reduction 位置（1/3 和 2/3 处）
        self.cells = nn.ModuleList()
        C_prev_prev, C_prev, C_curr = C, C, C
        
        for i in range(layers):
            if i in [layers // 3, 2 * layers // 3]:
                C_curr *= 2
            
            cell = DARTSCell(steps, 4, C_curr)
            self.cells.append(cell)
            C_prev = C_curr * steps
        
        self.global_pool = nn.AdaptiveAvgPool2d(1)
        self.classifier = nn.Linear(C_prev, num_classes)
    
    def normal_weights(self):
        return F.softmax(self.cells[0].alphas_normal, dim=-1)
    
    def reduce_weights(self):
        return F.softmax(self.cells[0].alphas_reduce, dim=-1)
    
    def forward(self, x):
        s0 = s1 = self.stem(x)
        for i, cell in enumerate(self.cells):
            s0, s1 = s1, cell(s0, s1, self.normal_weights(), self.reduce_weights())
        out = self.global_pool(s1).flatten(1)
        return self.classifier(out)


# DARTS 交替优化训练循环
def train_darts_step(model, train_loader, val_loader, opt_w, opt_alpha, device):
    """交替优化：先优化权重 w，再优化架构参数 α"""
    # Step 1: 优化权重 w (在训练集上)
    model.train()
    for batch_x, batch_y in train_loader:
        batch_x, batch_y = batch_x.to(device), batch_y.to(device)
        logits = model(batch_x)
        loss_w = F.cross_entropy(logits, batch_y)
        opt_w.zero_grad()
        loss_w.backward()
        opt_w.step()
    
    # Step 2: 优化架构参数 α (在验证集上)
    for batch_x, batch_y in val_loader:
        batch_x, batch_y = batch_x.to(device), batch_y.to(device)
        logits = model(batch_x)
        loss_alpha = F.cross_entropy(logits, batch_y)
        opt_alpha.zero_grad()
        loss_alpha.backward()
        opt_alpha.step()`,
                },
            ],
            table: {
                headers: ["DARTS 变体", "改进点", "搜索成本", "CIFAR-10 错误率", "核心贡献"],
                rows: [
                    ["DARTS (原版)", "连续松弛 + 交替优化", "4 GPU 天", "2.76%", "开创可微 NAS"],
                    ["P-DARTS", "逐步加深网络 + 丢弃多余操作", "0.3 GPU 天", "2.50%", "渐进式搜索"],
                    ["SNAS", "基于 REINFORCE 的随机 NAS", "1.5 GPU 天", "2.85%", "随机离散采样"],
                    ["GDAS", "Gumbel-Softmax 采样", "1 GPU 天", "2.82%", "离散采样梯度估计"],
                    ["DrNAS", "Dirichlet 采样替代 Softmax", "3 GPU 天", "2.54%", "解决性能崩溃"],
                    ["Fair DARTS", "消除 skip-connect 偏向", "4 GPU 天", "2.64%", "公平比较所有操作"],
                ],
            },
            mermaid: `graph TD
    subgraph "DARTS 核心机制"
        A["边 (i,j)"] -->|"松弛为加权和"| B["Σ softmax(α_k) · op_k(x)"]
        B -->|"训练时"| C["所有操作同时参与"]
        B -->|"搜索后"| D["取 argmax α_k 确定操作"]
    end
    
    subgraph "交替优化"
        E["训练集: 优化 w"] -->|"固定 α"| F["更新网络权重"]
        G["验证集: 优化 α"] -->|"固定 w"| H["更新架构参数"]
        F --> E
        H --> G
    end
    
    subgraph "性能崩溃问题"
        I["skip-connect α 快速增长"] -->|"主导梯度"| J["其他操作无法更新"]
        J -->|"退化架构"| K["网络变成浅层 skip 堆叠"]
    end
    
    style B fill:#7c2d12
    style D fill:#14532d
    style K fill:#7f1d1d`,
            tip: "DARTS 的性能崩溃是搜索过程中最值得警惕的问题。一个实用的防御策略是：在搜索过程中监控每条边上各操作的权重分布。如果某条边过早地集中到单一操作（熵低于阈值），可以对该边施加熵正则化或温度退火来延缓决策。另一个技巧是增加验证集的比例，因为架构参数 α 的优化完全依赖验证集信号。",
        },
        {
            title: "6. EfficientNet 与 MNASNet：NAS 的实际成功案例",
            body: `如果说 DARTS 展示了 NAS 的方法论创新，那么 EfficientNet 和 MNASNet 则证明了 NAS 在工业界的实用价值。这两个工作都使用了 NAS 来自动设计高效的卷积神经网络，但它们的方法和目标有所不同。

MNASNet（2018）由 Google 提出，使用强化学习在移动端设备上搜索兼顾精度和延迟的架构。其关键创新是在奖励函数中显式地引入了延迟惩罚：R(α) = ACC(α) · [LAT(α) / TARGET]^w，其中 ACC 是准确率，LAT 是目标设备上的实际推理延迟，TARGET 是目标延迟，w 是权重系数。这种方法搜出的架构在 ImageNet 上达到了 75.2% 的 top-1 准确率，同时 Pixel 1 手机上的推理延迟仅为 78ms。

EfficientNet（2019）提出了一个全新的思路：与其从头搜索整个网络，不如先搜索一个「基线小网络」（baseline network），然后通过「复合缩放」（compound scaling）方法，统一地调整网络的深度、宽度和分辨率。复合缩放使用一个复合系数 φ 同时控制三个维度：depth = α^φ, width = β^φ, resolution = γ^φ，其中 α, β, γ 是通过小规模网格搜索确定的最优缩放比例。这种方法在 ImageNet 上取得了 84.4% 的 top-1 准确率，同时参数量仅为 EfficientNet-B7 的 8.4 倍于 B0，却比当时的最优模型少了 6.6 倍参数。`,
            code: [
                {
                    lang: "python",
                    code: `# MNASNet 风格的延迟感知奖励函数
import time
import torch

class LatencyAwareReward:
    """MNASNet 的延迟感知奖励计算"""
    def __init__(self, target_latency_ms=78.0, weight_w=-0.07):
        self.target_latency_ms = target_latency_ms
        self.w = weight_w
    
    def measure_latency(self, model, input_shape=(1, 3, 224, 224), warmup=10, trials=100):
        """在目标设备上测量推理延迟"""
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model = model.to(device).eval()
        x = torch.randn(input_shape).to(device)
        
        # Warmup
        with torch.no_grad():
            for _ in range(warmup):
                _ = model(x)
        
        # Timing
        torch.cuda.synchronize() if torch.cuda.is_available() else None
        start = time.perf_counter()
        with torch.no_grad():
            for _ in range(trials):
                _ = model(x)
        torch.cuda.synchronize() if torch.cuda.is_available() else None
        end = time.perf_counter()
        
        return (end - start) / trials * 1000  # ms
    
    def compute_reward(self, accuracy, latency_ms):
        """MNASNet 奖励函数: R = ACC * (LAT / TARGET)^w"""
        if latency_ms <= 0:
            return accuracy
        ratio = latency_ms / self.target_latency_ms
        reward = accuracy * (ratio ** self.w)
        return reward
    
    def __call__(self, model, accuracy, input_shape=(1, 3, 224, 224)):
        latency = self.measure_latency(model, input_shape)
        reward = self.compute_reward(accuracy, latency)
        print(f"Accuracy: {accuracy:.4f}, Latency: {latency:.1f}ms, Reward: {reward:.4f}")
        return reward, latency`,
                },
                {
                    lang: "python",
                    code: `# EfficientNet 复合缩放实现
import torch
import torch.nn as nn
import math

def efficientnet_coefficients():
    """
    EfficientNet 复合缩放参数
    通过小规模网格搜索确定最优 (α, β, γ)
    """
    # B0 到 B7 的缩放系数
    configs = {
        "b0": {"width": 1.0, "depth": 1.0, "resolution": 224, "dropout": 0.2},
        "b1": {"width": 1.0, "depth": 1.1, "resolution": 240, "dropout": 0.2},
        "b2": {"width": 1.1, "depth": 1.2, "resolution": 260, "dropout": 0.3},
        "b3": {"width": 1.2, "depth": 1.4, "resolution": 300, "dropout": 0.3},
        "b4": {"width": 1.4, "depth": 1.8, "resolution": 380, "dropout": 0.4},
        "b5": {"width": 1.6, "depth": 2.2, "resolution": 456, "dropout": 0.4},
        "b6": {"width": 1.8, "depth": 2.6, "resolution": 528, "dropout": 0.5},
        "b7": {"width": 2.0, "depth": 3.1, "resolution": 600, "dropout": 0.5},
    }
    return configs


class EfficientNetBlock(nn.Module):
    """MBConv 倒置瓶颈块 (Mobile Inverted Bottleneck)"""
    def __init__(self, in_channels, out_channels, kernel_size, 
                 expand_ratio=1, stride=1, se_ratio=0.25):
        super().__init__()
        mid_channels = in_channels * expand_ratio
        self.use_residual = stride == 1 and in_channels == out_channels
        
        layers = []
        # 1x1 扩展卷积 (扩展通道)
        if expand_ratio != 1:
            layers.extend([
                nn.Conv2d(in_channels, mid_channels, 1, bias=False),
                nn.BatchNorm2d(mid_channels),
                nn.SiLU()
            ])
        
        # 深度可分离卷积 (KxK)
        layers.extend([
            nn.Conv2d(mid_channels, mid_channels, kernel_size, 
                     stride=stride, padding=kernel_size//2,
                     groups=mid_channels, bias=False),
            nn.BatchNorm2d(mid_channels),
            nn.SiLU()
        ])
        
        # Squeeze-and-Excitation (注意力)
        se_channels = max(1, int(in_channels * se_ratio))
        layers.extend([
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(mid_channels, se_channels, 1),
            nn.SiLU(),
            nn.Conv2d(se_channels, mid_channels, 1),
            nn.Sigmoid()
        ])
        
        # 1x1 投影卷积 (压缩通道)
        layers.extend([
            nn.Conv2d(mid_channels, out_channels, 1, bias=False),
            nn.BatchNorm2d(out_channels)
        ])
        
        self.block = nn.Sequential(*layers)
    
    def forward(self, x):
        out = self.block(x)
        # 分离 Squeeze-and-Excitation 的输出
        return out + x if self.use_residual else out


class CompoundScaler:
    """EfficientNet 复合缩放"""
    def __init__(self, phi=1.0, alpha=1.2, beta=1.1, gamma=1.15):
        self.phi = phi
        self.alpha = alpha  # 深度系数
        self.beta = beta    # 宽度系数
        self.gamma = gamma  # 分辨率系数
    
    def scale(self, depth, width, resolution):
        """应用复合缩放"""
        new_depth = int(math.ceil(self.alpha ** self.phi * depth))
        new_width = int(math.ceil(self.beta ** self.phi * width) / 8) * 8
        new_resolution = int(math.ceil(self.gamma ** self.phi * resolution) / 32) * 32
        return new_depth, new_width, new_resolution

# 示例：从 B0 缩放到 B3
scaler = CompoundScaler(phi=3.0, alpha=1.2, beta=1.1, gamma=1.15)
for i in range(4):
    s = CompoundScaler(phi=float(i))
    d, w, r = s.scale(1, 32, 224)
    print(f"B{i}: depth_mult={s.alpha**i:.2f}, width={w}, resolution={r}")`,
                },
            ],
            table: {
                headers: ["模型", "Top-1 Acc", "参数量", "FLOPs", "方法", "特点"],
                rows: [
                    ["ResNet-152", "77.8%", "60M", "11.5G", "手动设计", "残差连接，深度"],
                    ["MNASNet-A1", "75.2%", "3.9M", "312M", "RL + 延迟奖励", "移动端优化"],
                    ["EfficientNet-B0", "77.1%", "5.3M", "390M", "NAS + 复合缩放", "平衡效率"],
                    ["EfficientNet-B1", "79.1%", "7.8M", "690M", "复合缩放 (φ=1)", "适度放大"],
                    ["EfficientNet-B3", "81.6%", "12M", "1.8G", "复合缩放 (φ=3)", "中等规模"],
                    ["EfficientNet-B7", "84.4%", "66M", "37G", "复合缩放 (φ=7)", "SOTA 但重"],
                ],
            },
            mermaid: `graph TD
    subgraph "EfficientNet 设计流程"
        A["基线搜索\n(NAS 搜索 B0)"] --> B["复合缩放\n(α, β, γ 网格搜索)"]
        B --> C["统一缩放\ndepth × width × resolution"]
        C --> D["EfficientNet B0 → B7"]
    end
    
    subgraph "MNASNet 设计流程"
        E["强化学习控制器"] --> F["生成候选架构"]
        F --> G["评估: ACC × LAT^w"]
        G -->|"奖励信号"| E
        G --> H["MNASNet 架构"]
    end
    
    subgraph "核心差异"
        I["MNASNet: 端到端搜索完整架构"] -->|"直接搜大网络"| J["搜索成本高"]
        K["EfficientNet: 小网络 + 缩放规则"] -->|"间接高效"| L["搜索成本低"]
    end
    
    style A fill:#14532d
    style E fill:#14532d
    style K fill:#1e3a5f`,
            warning: "复合缩放虽然优雅，但有一个隐藏假设：深度、宽度和分辨率的最优缩放比例在模型规模变化时保持不变。后续研究（Tan & Le 2021, EfficientNetV2）发现这个假设在大规模模型上并不完全成立——更大模型需要更少的扩展（尤其是分辨率）。EfficientNetV2 因此引入了「渐进学习」策略，在训练过程中逐步增加图像大小，避免早期阶段训练不稳定。",
        },
        {
            title: "7. 实战：用微软 NNI 进行 NAS",
            body: `微软 Neural Network Intelligence (NNI) 是目前最成熟的开源 AutoML 框架之一，提供了完整的 NAS 支持。NNI 将 NAS 流程标准化为三个步骤：定义搜索空间（JSON 格式）、定义模型（使用 NNI 的 API 声明可搜索操作）、运行 tuner（选择搜索算法并执行）。这种标准化的好处是你可以轻松切换不同的搜索策略——从随机搜索到贝叶斯优化到基于 RL 的方法，只需要修改配置文件。

NNI 的搜索空间定义非常灵活：使用 _choice 表示离散选择（如卷积核大小），_range 表示连续范围（如 filter 数量），_grid 表示网格搜索。模型代码中使用 nni.retain_final_parameters() 在搜索结束后获取最优架构。整个过程对用户代码的侵入性极小——大多数情况下只需要添加几行 NNI API 调用。

本节通过一个完整的 CIFAR-10 分类任务来演示 NNI 的 NAS 流程。我们将搜索一个小型卷积网络的架构，包括每层的卷积核大小、通道数和是否使用 dropout。搜索策略选择 TPE（Tree Parzen Estimator），这是一种高效的贝叶斯优化方法，在离散搜索空间中表现优于随机搜索。`,
            code: [
                {
                    lang: "python",
                    code: `# search_space.json: NNI 搜索空间定义
"""
{
    "conv1_kernel": {"_type": "choice", "_value": [3, 5, 7]},
    "conv1_channels": {"_type": "choice", "_value": [16, 32, 64]},
    "conv2_kernel": {"_type": "choice", "_value": [3, 5, 7]},
    "conv2_channels": {"_type": "choice", "_value": [32, 64, 128]},
    "conv3_kernel": {"_type": "choice", "_value": [3, 5]},
    "conv3_channels": {"_type": "choice", "_value": [64, 128, 256]},
    "dropout_rate": {"_type": "uniform", "_value": [0.1, 0.5]},
    "use_bn": {"_type": "choice", "_value": [true, false]},
    "fc_hidden": {"_type": "choice", "_value": [64, 128, 256, 512]}
}

这个搜索空间定义了 3*3*3*3*2*3 * 连续 * 2 * 4 ≈ 3888 种离散组合
加上连续的 dropout_rate，总空间远大于此。
TPE tuner 可以在 50-100 次 trial 内找到接近最优的配置。
"""
import json

search_space = {
    "conv1_kernel": {"_type": "choice", "_value": [3, 5, 7]},
    "conv1_channels": {"_type": "choice", "_value": [16, 32, 64]},
    "conv2_kernel": {"_type": "choice", "_value": [3, 5, 7]},
    "conv2_channels": {"_type": "choice", "_value": [32, 64, 128]},
    "conv3_kernel": {"_type": "choice", "_value": [3, 5]},
    "conv3_channels": {"_type": "choice", "_value": [64, 128, 256]},
    "dropout_rate": {"_type": "uniform", "_value": [0.1, 0.5]},
    "use_bn": {"_type": "choice", "_value": [True, False]},
    "fc_hidden": {"_type": "choice", "_value": [64, 128, 256, 512]},
}

with open("search_space.json", "w") as f:
    json.dump(search_space, f, indent=2)
print("search_space.json 已生成")
print(f"搜索空间大小估算: {3*3*3*3*2*3*2*4} 种离散组合")`,
                },
                {
                    lang: "python",
                    code: `# model.py: NNI 可搜索模型 + 训练脚本
import nni
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim


class SearchableCNN(nn.Module):
    """使用 NNI 参数的可搜索 CNN"""
    def __init__(self, params):
        super().__init__()
        self.conv1 = nn.Conv2d(3, params["conv1_channels"], 
                                params["conv1_kernel"], padding=params["conv1_kernel"]//2)
        self.conv2 = nn.Conv2d(params["conv1_channels"], params["conv2_channels"],
                                params["conv2_kernel"], padding=params["conv2_kernel"]//2)
        self.conv3 = nn.Conv2d(params["conv2_channels"], params["conv3_channels"],
                                params["conv3_kernel"], padding=params["conv3_kernel"]//2)
        
        if params["use_bn"]:
            self.bn1 = nn.BatchNorm2d(params["conv1_channels"])
            self.bn2 = nn.BatchNorm2d(params["conv2_channels"])
            self.bn3 = nn.BatchNorm2d(params["conv3_channels"])
        else:
            self.bn1 = self.bn2 = self.bn3 = nn.Identity()
        
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(params["dropout_rate"])
        
        # 自适应计算 FC 输入维度
        self.fc1 = nn.Linear(params["conv3_channels"] * 4 * 4, params["fc_hidden"])
        self.fc2 = nn.Linear(params["fc_hidden"], 10)
    
    def forward(self, x):
        x = self.pool(F.relu(self.bn1(self.conv1(x))))
        x = self.pool(F.relu(self.bn2(self.conv2(x))))
        x = self.pool(F.relu(self.bn3(self.conv3(x))))
        x = x.view(x.size(0), -1)
        x = self.dropout(x)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x


def train_and_evaluate(params, epochs=10):
    """训练模型并返回验证准确率"""
    model = SearchableCNN(params)
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()
    
    # 模拟训练循环（实际应使用真实数据加载器）
    for epoch in range(epochs):
        model.train()
        # 模拟训练步
        dummy_x = torch.randn(32, 3, 32, 32)
        dummy_y = torch.randint(0, 10, (32,))
        logits = model(dummy_x)
        loss = criterion(logits, dummy_y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
    
    # 评估
    model.eval()
    with torch.no_grad():
        test_x = torch.randn(1000, 3, 32, 32)
        test_y = torch.randint(0, 10, (1000,))
        logits = model(test_x)
        acc = (logits.argmax(1) == test_y).float().mean().item()
    
    return acc


def main():
    """NNI Trial 入口"""
    # 获取 NNI 传入的超参数
    params = nni.get_next_parameter()
    
    # 训练并评估
    accuracy = train_and_evaluate(params)
    
    # 报告结果给 NNI
    nni.report_final_result(accuracy)
    print(f"Trial 完成: accuracy = {accuracy:.4f}")
    print(f"Params: {params}")


if __name__ == "__main__":
    main()`,
                },
            ],
            table: {
                headers: ["NNI Tuner", "算法类型", "适合场景", "并行支持", "推荐配置"],
                rows: [
                    ["Random", "随机搜索", "基线对比", "完全并行", "maxTrialNumber=100"],
                    ["TPE", "贝叶斯优化", "离散/混合空间", "部分并行", "maxTrialNumber=200"],
                    ["Anneal", "模拟退火", "连续空间", "顺序", "maxTrialNumber=150"],
                    ["Evolution", "进化算法", "大离散空间", "完全并行", "maxTrialNumber=500"],
                    ["SMAC", "贝叶斯优化 (RF)", "复杂约束", "部分并行", "maxTrialNumber=300"],
                    ["Hyperband", "连续减半", "快速筛选", "完全并行", "maxExecDuration=2h"],
                ],
            },
            mermaid: `graph TD
    subgraph "NNI NAS 完整流程"
        A["定义搜索空间\nJSON 格式"] --> B["编写可搜索模型\n使用 nni.get_next_parameter()"]
        B --> C["配置实验\nconfig.yaml"]
        C --> D["启动 NNI\nnnictl create"]
        D --> E["Tuner 采样参数"]
        E --> F["Trial 训练模型"]
        F --> G["报告准确率\nnni.report_final_result()"]
        G -->|"反馈"| E
        G --> H["搜索完成\nnni.retain_final_parameters()"]
    end
    
    subgraph "NNI Web UI"
        I["http://localhost:8080"] -->|"实时查看"| J["Trial 列表"]
        I -->|"可视化"| K["超参数影响"]
        I -->|"对比"| L["最佳配置"]
    end
    
    style A fill:#1e3a5f
    style H fill:#14532d
    style E fill:#7c2d12`,
            tip: "NNI 实战建议：(1) 先用 Random tuner 跑 50 个 trial 作为基线，再换 TPE 搜索，这样可以直观看到贝叶斯优化的效果；(2) 设置合理的 trial 预算——每个 trial 的训练 epoch 不必太多（10-20 即可），NAS 关注的是相对排名而非绝对精度；(3) 使用 NNI 的 Web UI（默认 localhost:8080）实时监控搜索进度，可以提前终止明显不好的 trial；(4) 搜索完成后，用 nni.retain_final_parameters() 获取最优配置，然后从零完整训练该架构以获得最终性能。",
        },
    ],
};
