// AI for Science 全景指南：从蛋白质折叠到气候建模

import { Article } from '../knowledge';

export const article: Article = {
  id: "ai4science-001",
  title: "AI for Science 全景指南：从蛋白质折叠到气候建模的科学革命",
  category: "practice",
  tags: ["AI for Science", "蛋白质折叠", "AlphaFold", "药物发现", "材料科学", "气候建模", "Protenix", "科学计算", "分子模拟"],
  summary: "AI 正在彻底改变科学研究范式。从 DeepMind AlphaFold 破解蛋白质折叠难题，到字节跳动 Protenix 开源高精度分子结构预测；从 AI 加速新材料发现，到大模型驱动的地球气候模拟——AI for Science 已经从概念验证走向规模化应用。本文系统梳理 AI 在生命科学、材料科学、气候科学、物理学、化学等核心科学领域的应用全景、技术架构、关键项目和未来趋势。",
  date: "2026-04-18",
  readTime: "28 min",
  level: "进阶",
  content: [
    {
      title: "一、什么是 AI for Science？为什么它如此重要？",
      body: `**AI for Science（AI4S）** 是指将人工智能技术应用于基础科学研究，以加速科学发现、优化实验设计、建立理论模型和解决传统方法无法处理的复杂科学问题。

### 1.1 科学研究的「第四范式」

科学研究经历了三次范式转变：

**第一范式（经验科学）**：观察和描述自然现象，如达尔文的物种观察、门捷列夫的元素周期表。

**第二范式（理论科学）**：建立数学模型和理论框架，如牛顿力学、麦克斯韦方程组。

**第三范式（计算科学）**：利用计算机模拟和数值计算，如分子动力学模拟、气候模型。

**第四范式（数据驱动科学）**：AI 从海量科学数据中发现规律、生成假设、设计实验——这正是 AI for Science 的本质。

### 1.2 为什么 2026 年是 AI for Science 的关键年份？

三个标志性事件定义了 2026 年的 AI for Science 格局：

- **AlphaFold 3 发布（2025）**：不仅能预测蛋白质结构，还能预测蛋白质-配体、蛋白质-核酸的复合物结构，直接覆盖药物发现核心场景
- **字节跳动 Protenix 开源（2026）**：中国科技公司首次开源高精度蛋白质结构预测工具，总 stars 突破 1,800，打破了 DeepMind 的垄断
- **OpenAI 设立 AI for Science 副总裁（2026）**：尽管该职位近期发生人事变动，但标志着顶级 AI 公司正式将科学研究作为战略方向

**市场规模：** 根据麦肯锡 2026 年报告，AI for Science 相关市场规模预计超过 200 亿美元，涵盖药物发现、材料设计、气候预测等多个子领域。`,
      mermaid: `graph TD
    A["AI for Science"] --> B["生命科学
蛋白质/药物/基因组"]
    A --> C["材料科学
新材料发现
电池材料"]
    A --> D["气候科学
天气预报
气候建模"]
    A --> E["物理学
粒子物理
量子化学"]
    A --> F["化学
反应预测
分子设计"]
    A --> G["数学
自动定理证明
方程求解"]

    B --> H["AlphaFold 3
Protenix
ESMFold"]
    C --> I["GNoME
MatterGen
CDVAE"]
    D --> J["GraphCast
FourCastNet
Pangu-Weather"]
    E --> K["Neural Operator
PINN"]
    F --> L["DiffDock
EquiBind
GNNFF"]
    G --> M["AlphaProof
LeanDojo"]`,
    },
    {
      title: "二、生命科学：AI 如何改变生物学和医学",
      body: `生命科学是 AI for Science 最成熟、影响力最大的领域。2026 年，AI 在蛋白质结构预测、药物发现、基因组学和细胞生物学方面都取得了突破性进展。

### 2.1 蛋白质结构预测：从 AlphaFold 到 Protenix

蛋白质是生命的基本功能单元。理解蛋白质的三维结构是药物发现、酶设计和疾病研究的基础。但实验测定蛋白质结构（X 射线晶体学、冷冻电镜）耗时且昂贵——截至 2026 年，PDB 数据库中仅有约 23 万个实验解析的蛋白质结构，而地球上估计存在超过 2 亿种不同的蛋白质。

AI 蛋白质结构预测技术的发展经历了几个关键阶段：`,
      table: {
        headers: ["模型", "发布方", "年份", "核心方法", "特点"],
        rows: [
          ["AlphaFold 2", "DeepMind", "2021", "Evoformer + SE(3)-Transformer", "CASP14 冠军，中位 GDT 92.4"],
          ["ESMFold", "Meta AI", "2022", "ESM-2 语言模型 + 结构模块", "无需 MSA，速度比 AF2 快 60 倍"],
          ["OmegaFold", "清华大学", "2022", "隐空间表示 + 几何约束", "无需 MSA，适合孤儿蛋白"],
          ["AlphaFold 3", "Google DeepMind", "2024", "Diffusion + 配对表示", "预测蛋白质-配体/核酸复合物"],
          ["Protenix", "字节跳动", "2026", "多尺度表示学习 + 几何深度学习", "开源高精度预测，对标 AlphaFold 3"],
        ],
      },
    },
    {
      title: "2.2 蛋白质结构预测技术深度解析",
      body: `**AlphaFold 2 的核心突破** 在于引入了 Evoformer 模块——一个同时处理序列信息（MSA）和空间信息（pair representation）的双流架构。Evoformer 通过自注意力和三角注意力机制，将进化信息转化为空间几何约束，最终通过 SE(3)-Transformer 生成 3D 坐标。

**关键创新点：**
- **MSA（多序列比对）编码**：从同源序列中提取进化约束信息
- **Pair representation**：用残基对之间的距离和角度表示空间关系
- **结构模块（Structure Module）**：在 SO(3) 空间中进行旋转和平移不变的坐标预测
- **端到端可微**：整个流程可以反向传播优化

**Protenix 的差异化优势：**
- 字节跳动的 Protenix 在 2026 年开源，采用多尺度表示学习策略，在保持预测精度的同时显著降低了计算资源需求
- 支持蛋白质-配体复合物的联合预测，对药物发现场景有直接价值
- 完全开源（Apache 2.0），为研究机构提供了 DeepMind 之外的选择`,
      code: [
        {
          lang: "python",
          code: `# 使用 Protenix 进行蛋白质结构预测
import torch
from protenix import ProtenixModel, ProtenixConfig

# 配置模型
config = ProtenixConfig(
    model_name="protenix-large",
    device="cuda",
    use_amp=True  # 混合精度加速
)
model = ProtenixModel(config)

# 输入蛋白质序列
sequence = "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSH"
result = model.predict(sequence)

# 输出结构
print(f"预测 RMSD: {result.rmsd:.2f} Å")
print(f"预测 pLDDT: {result.plddt:.2f}")

# 保存 PDB 文件
result.save_pdb("output/predicted_structure.pdb")

# 预测蛋白质-配体复合物
complex_result = model.predict_complex(
    protein_sequence=sequence,
    ligand_smiles="CC(C)CC1=CC=C(C=C1)C(C)C(=O)O"  # 布洛芬
)
complex_result.save_pdb("output/complex_structure.pdb")`,
          filename: "protenix_prediction.py",
        },
      ],
    },
    {
      title: "2.3 药物发现：AI 如何加速新药研发",
      body: `传统药物发现需要 10-15 年、花费 20-30 亿美元，而 AI 正在将这个过程大幅压缩。2026 年，AI 辅助药物发现已经从「概念验证」进入「实际产出」阶段。

**AI 在药物发现中的核心应用：**

1. **靶点发现**：从基因组、转录组、蛋白质组数据中识别疾病相关的药物靶点
2. **分子对接（Molecular Docking）**：预测小分子药物与靶蛋白的结合亲和力和结合模式
3. **分子生成**：使用生成模型（扩散模型、VAE、GAN）设计具有特定性质的新分子
4. **ADMET 预测**：预测分子的吸收、分布、代谢、排泄和毒性
5. **临床试验优化**：利用真实世界数据优化患者招募和试验设计

**2026 年的标志性成果：**
- **Insilico Medicine**：AI 发现的 IPF 药物进入 II 期临床试验
- **Recursion Pharmaceuticals**：基于 AI 的药物管线扩展到 40+ 候选药物
- **Exscientia**：AI 设计的 oncology 药物进入临床验证
- **华为云盘古药物分子大模型**：在中国市场推动 AI 辅助药物发现产业化`,
      mermaid: `graph LR
    A["靶点发现
AI 分析组学数据"] --> B["苗头化合物
分子生成模型"]
    B --> C["先导化合物优化
分子对接 + ADMET"]
    C --> D["临床前研究
AI 毒性预测"]
    D --> E["临床试验
AI 优化患者招募"]
    E --> F["获批上市"]
    class F s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#0d6b3d`,
    },
    {
      title: "2.4 基因组学与单细胞生物学",
      body: `AI 在基因组学领域的应用正在从「序列分析」升级到「功能预测」和「调控建模」。

**关键进展：**

- **DNABERT / Nucleotide Transformer**：将 BERT 架构应用于 DNA 序列，预测启动子活性、剪接位点、增强子功能
- **scBERT / scGPT**：单细胞转录组分析的基础模型，支持细胞类型注释、差异表达分析和细胞轨迹推断
- **Enformer**：DeepMind 开发的模型，能从 DNA 序列预测基因表达和染色质可及性，感受野达 200kb
- **Evo**：Stanford 团队开发的 DNA/RNA 基础模型，在多种基因组任务上达到 SOTA

**实际应用价值：**
- 罕见病基因诊断：AI 能在几分钟内分析全基因组数据，识别致病突变
- 癌症精准医疗：基于 AI 的突变功能预测，指导靶向治疗选择
- 基因编辑优化：预测 CRISPR 编辑的脱靶效应和编辑效率`,
    },
    {
      title: "三、材料科学：AI 驱动的「新材料发现引擎」",
      body: `材料科学是 AI for Science 的第二大应用场景。从电池材料到半导体、从催化剂到超导材料，AI 正在将材料发现从「试错实验」转变为「计算设计」。

### 3.1 Google DeepMind GNoME：材料发现的范式转变

2023 年，DeepMind 发布 GNoME（Graph Networks for Materials Exploration），使用图神经网络预测晶体结构的稳定性，发现了 38 万个新的稳定晶体结构——相当于人类 800 年积累的材料知识。

**GNoME 的核心方法：**
- 将晶体结构表示为图（原子=节点，键=边）
- 使用图神经网络（GNN）预测形成能（formation energy）
- 通过主动学习策略迭代优化预测
- 结合 DFT（密度泛函理论）计算验证

**2026 年的延伸发展：**
- **MatterGen（Microsoft）**：基于扩散模型的逆向材料设计——给定目标性质，生成满足条件的材料结构
- **CDVAE（Crystal Diffusion VAE）**：端到端的晶体结构生成模型
- **华为云材料大模型**：面向中国市场的材料发现平台，覆盖电池、催化、合金等领域`,
      table: {
        headers: ["平台/模型", "开发方", "方法", "已发现材料数", "主要应用"],
        rows: [
          ["GNoME", "DeepMind", "GNN + 主动学习", "380,000+", "晶体结构预测"],
          ["MatterGen", "Microsoft", "扩散模型", "50,000+", "逆向材料设计"],
          ["CDVAE", "学术界", "变分自编码器", "100,000+", "晶体生成"],
          ["MEGNet", "UCSD", "图网络", "50,000+", "形成能预测"],
          ["材料大模型", "华为云", "多模态预训练", "覆盖主流材料库", "电池/催化/合金"],
        ],
      },
    },
    {
      title: "3.2 AI 在电池材料发现中的实际应用",
      body: `电池材料是 AI 材料科学最成功的应用场景之一。电动汽车和储能市场的爆发式增长对电池性能提出了更高要求——更高的能量密度、更快的充电速度、更长的循环寿命、更低的成本。

**AI 如何加速电池材料发现：**

1. **电解液设计**：AI 模型预测离子电导率、电化学稳定性和界面稳定性
2. **正极材料优化**：GNN 预测层状氧化物、磷酸铁锂等正极材料的容量和循环稳定性
3. **固态电解质筛选**：从数千种候选材料中快速筛选出高离子电导率的固态电解质
4. **电池寿命预测**：机器学习模型从充放电曲线预测电池剩余寿命

**实际成果：**
- **Samsung SDI**：使用 AI 加速固态电池电解质开发，研发周期缩短 40%
- **CATL（宁德时代）**：AI 辅助正极材料优化，提升磷酸铁锂电池能量密度 15%
- **丰田**：AI 驱动的全固态电池材料筛选，计划 2027-2028 年实现量产`,
    },
    {
      title: "四、气候科学：AI 如何改变天气预报和气候建模",
      body: `气候和天气预测是 AI for Science 另一个取得突破性进展的领域。2026 年，多个 AI 气象模型已经在预测精度上超越传统数值天气预报（NWP）系统。

### 4.1 AI 气象模型的爆发

传统数值天气预报依赖于求解流体力学和热力学方程组（Navier-Stokes 方程），计算成本极高。AI 气象模型则直接从历史数据中学习大气动力学规律，推理速度比传统方法快 4-5 个数量级。`,
      table: {
        headers: ["模型", "开发方", "年份", "分辨率", "关键指标"],
        rows: [
          ["FourCastNet", "NVIDIA", "2023", "0.25° (~25km)", "ACC > 0.95（500hPa, 3天）"],
          ["Pangu-Weather", "华为", "2023", "0.25° (~25km)", "NWP 之上提升台风路径预测"],
          ["GraphCast", "DeepMind", "2023", "0.25° (~25km)", "90%+ 任务优于 ECMWF IFS"],
          ["FengWu", "上海人工智能实验室", "2023", "0.25° (~25km)", "10 天预报精度 SOTA"],
          ["Aurora", "Microsoft", "2024", "0.1° (~10km)", "高分辨率 + 多变量联合预测"],
          ["FuXi", "复旦大学", "2023", "0.25° (~25km)", "集合预报系统"],
        ],
      },
    },
    {
      title: "4.2 AI 气象模型的技术架构",
      body: `**GraphCast 的成功秘诀** 在于将全球大气数据表示为图结构（网格点=节点，相邻关系=边），然后使用消息传递图神经网络进行时空预测。这种架构天然适合地球科学中的球面网格数据。

**核心架构组件：**
- **编码器**：将 ERA5 再分析数据（温度、湿度、风速等 69 个变量）编码为图表示
- **处理器**：多层消息传递 GNN，捕获大气动力学的空间和时间依赖
- **解码器**：将图表示解码为未来时刻的气象变量预测

**与传统 NWP 的对比：**

| 维度 | 传统 NWP | AI 气象模型 |
|------|----------|-------------|
| 计算时间 | 数小时（HPC 集群） | 数秒到数分钟（单 GPU） |
| 物理约束 | 严格（方程驱动） | 隐式（数据驱动） |
| 泛化能力 | 好（基于物理定律） | 依赖训练数据覆盖 |
| 极端事件 | 较好 | 需要针对性训练 |
| 可解释性 | 高 | 低（黑箱） |

**混合方法是未来方向：** 将 AI 模型作为传统 NWP 的参数化方案或初始条件优化器，结合两者的优势。`,
      mermaid: `graph TD
    A["历史气象数据
ERA5 再分析"] --> B["图编码
网格点 → 节点"]
    B --> C["消息传递 GNN
多层时空推理"]
    C --> D["解码器
节点 → 气象变量"]
    D --> E["6h/24h/72h/120h
预报结果"]

    E --> F["与 NWP 混合
AI 初始场 + 物理约束"]
    E --> G["集合预报
多模型集成"]
    E --> H["极端天气
AI 预警系统"]
    class E s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#0d6b3d`,
      code: [
        {
          lang: "python",
          code: `# 使用 GraphCast 进行天气预测（伪代码）
import xarray as xr
import jax
import graphcast

# 加载预训练模型
model = graphcast.load_model(
    checkpoint_path="graphcast.ckpt",
    run_once=False
)

# 加载 ERA5 历史数据
dataset = xr.open_zarr("era5-data.zarr")
inputs = dataset.sel(time=slice("2024-01-01", "2024-01-10"))

# 运行预测
rng_key = jax.random.PRNGKey(0)
forecast = graphcast.run_prediction(
    model=model,
    inputs=inputs,
    targets=None,  # 推理模式
    rng_key=rng_key,
    steps=20  # 预测 5 天（每 6 小时一步）
)

# 输出预报结果
print(f"预测变量: {list(forecast.data_vars)}")
print(f"时间范围: {forecast.time.values}")

# 可视化 500hPa 位势高度
forecast["geopotential_500"].isel(time=0).plot()`,
          filename: "graphcast_prediction.py",
        },
      ],
    },
    {
      title: "五、物理学与化学：从量子化学到粒子物理",
      body: `AI 在物理学和化学中的应用覆盖了从微观粒子到宏观宇宙的多个尺度。

### 5.1 量子化学：AI 加速分子模拟

量子化学计算（如 DFT、CCSD(T)）的精度很高但计算成本极其昂贵——CCSD(T) 的计算复杂度为 O(N⁷)，只能处理几十个原子的体系。AI 正在将高精度量子化学计算的适用范围扩展到大分子体系。

**关键方法：**
- **Neural Network Potentials（NNP）**：用神经网络拟合量子化学计算的势能面，实现接近 DFT 精度的分子动力学模拟，计算成本降低 3-4 个数量级
- **SchNet / DimeNet / GemNet**：专门用于分子性质预测的几何深度学习模型
- **DeepMD-kit**：将深度学习与分子动力学结合，支持百万原子级别模拟
- ** orb-net / Allegro**：严格满足物理对称性约束的神经网络力场

### 5.2 反应预测与逆合成分析

AI 在化学反应预测中的应用正在改变有机合成和药物化学的工作方式：

- **正向反应预测**：给定反应物和条件，预测产物和产率
- **逆合成分析（Retrosynthesis）**：给定目标分子，AI 规划合成路线
- **反应条件优化**：AI 推荐最佳催化剂、溶剂、温度等条件

**代表性工具：**
- **IBM RXN**：基于 Transformer 的反应预测平台
- **Molecular Transformer**：用 NLP 方法处理化学反应，达到 SOTA 预测精度
- **ASKCOS**：MIT 开发的计算机辅助合成规划系统`,
    },
    {
      title: "六、AI for Science 的通用技术栈",
      body: `尽管 AI for Science 覆盖了多个科学领域，但底层的 AI 技术栈有显著的共性。

### 6.1 核心技术模块`,
      mermaid: `graph TD
    subgraph "数据层"
        A["科学数据库
PDB / Materials Project / ERA5"]
        B["高通量实验数据"]
        C["模拟/仿真数据"]
    end

    subgraph "表示层"
        D["分子图表示
GNN / Graph Transformer"]
        E["3D 几何表示
SE(3) 等变网络"]
        F["序列表示
Transformer"]
        G["网格/场表示
CNN / FNO"]
    end

    subgraph "模型层"
        H["基础模型
科学预训练大模型"]
        I["生成模型
扩散模型 / VAE"]
        J["预测模型
GNN / Transformer"]
        K["物理约束模型
PINN"]
    end

    subgraph "验证层"
        L["DFT / CCSD(T) 验证"]
        M["实验验证"]
        N["仿真验证"]
    end

    A --> D
    A --> E
    A --> F
    A --> G
    B --> D
    C --> G

    D --> H
    E --> H
    F --> I
    G --> J

    H --> K
    I --> K
    J --> K

    K --> L
    K --> M
    K --> N`,
    },
    {
      title: "6.2 物理信息神经网络（PINN）：将物理定律嵌入 AI",
      body: `**PINN（Physics-Informed Neural Networks）** 是 AI for Science 中最重要的方法论创新之一。传统神经网络是纯粹的数据驱动——它们在训练数据上拟合，但可能产生违反物理定律的预测。PINN 将物理方程（如偏微分方程）作为损失函数的一部分，确保模型输出始终满足物理约束。

**PINN 的核心思想：**

损失函数 = 数据拟合损失 + λ × 物理方程残差

这意味着模型不仅要拟合已有的实验数据，还要满足物理方程——即使在数据稀疏的区域，物理约束也能引导模型做出合理的预测。

**应用场景：**
- 流体力学：求解 Navier-Stokes 方程
- 热传导：预测温度场分布
- 电磁学：求解 Maxwell 方程
- 固体力学：预测应力应变分布`,
      code: [
        {
          lang: "python",
          code: `# PINN 求解一维 Burgers 方程（简化示例）
import torch
import torch.nn as nn
import numpy as np

class PINN(nn.Module):
    """物理信息神经网络"""
    def __init__(self, layers=[2, 64, 64, 1]):
        super().__init__()
        self.layers = nn.Sequential()
        for i in range(len(layers) - 1):
            self.layers.add_module(
                f"layer{i}",
                nn.Linear(layers[i], layers[i+1])
            )
            if i < len(layers) - 2:
                self.layers.add_module(f"act{i}", nn.Tanh())

    def forward(self, x, t):
        u = self.layers(torch.cat([x, t], dim=1))
        return u

    def pde_residual(self, x, t, nu=0.01/np.pi):
        """Burgers 方程残差: u_t + u*u_x - nu*u_xx = 0"""
        x.requires_grad_(True)
        t.requires_grad_(True)
        u = self.forward(x, t)

        # 一阶导数
        u_t = torch.autograd.grad(u, t, torch.ones_like(u),
                                   create_graph=True)[0]
        u_x = torch.autograd.grad(u, x, torch.ones_like(u),
                                   create_graph=True)[0]

        # 二阶导数
        u_xx = torch.autograd.grad(u_x, x, torch.ones_like(u_x),
                                    create_graph=True)[0]

        # Burgers 方程残差
        residual = u_t + u * u_x - nu * u_xx
        return residual

# 训练循环
model = PINN()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(10000):
    # 数据损失（边界条件 + 初始条件）
    x_data, t_data, u_data = get_collocation_points()
    u_pred = model(x_data, t_data)
    data_loss = nn.MSELoss()(u_pred, u_data)

    # 物理损失（PDE 残差）
    x_col, t_col = get_collocation_points(N=1000)
    residual = model.pde_residual(x_col, t_col)
    pde_loss = torch.mean(residual**2)

    # 总损失
    loss = data_loss + pde_loss

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if epoch % 1000 == 0:
        print(f"Epoch {epoch}: loss={loss.item():.6f}",
              f"data={data_loss.item():.6f}",
              f"pde={pde_loss.item():.6f}")`,
          filename: "pinn_burgers.py",
        },
      ],
    },
    {
      title: "七、AI for Science 的主要挑战与未来方向",
      body: `尽管 AI for Science 取得了巨大进展，但仍面临一系列关键挑战。

### 7.1 核心挑战

**数据稀缺与质量**：
- 高质量科学数据（如实验测定的蛋白质结构、高精度量子化学计算）获取成本极高
- 不同来源的数据格式和标准不统一，难以整合
- 负结果（失败的实验）通常不发表，导致数据偏差

**可解释性与可信度**：
- 科学家需要理解 AI 的预测依据，而不仅仅是结果
- 在药物发现等高风险场景中，AI 的「黑箱」特性是一个障碍
- 需要发展 AI 可解释性方法，如注意力可视化、特征重要性分析

**泛化与外推能力**：
- AI 模型在训练数据分布内表现优秀，但对未知化学空间/材料空间的外推能力有限
- 需要更好的 OOD（Out-of-Distribution）检测和不确定性量化方法

**物理一致性与约束**：
- AI 预测必须满足基本物理定律（守恒律、对称性、热力学约束）
- PINN 是一个方向，但仍需要更系统的方法

**人机协作模式**：
- 科学家如何使用 AI 工具？AI 如何理解科学家的意图？
- 需要开发面向科学家的交互式 AI 工具，而非纯粹的自动化系统

### 7.2 未来趋势

**科学基础模型（Scientific Foundation Models）**：
- 类似 LLM 在自然语言处理中的角色，AI for Science 正在发展跨领域的科学基础模型
- 例如：MolFormer（分子基础模型）、BioMedLM（生物医学语言模型）
- 这些模型将在大规模科学数据上预训练，然后通过微调适配具体任务

**闭环自主发现（Closed-Loop Autonomous Discovery）**：
- AI 不仅预测，还设计实验、控制机器人实验平台、分析结果、迭代优化
- 例如：Carnegie Mellon 的「AI 化学家」、利物浦的自主实验机器人
- 这代表了从「AI 辅助」到「AI 自主」科学发现的范式转变

**开源生态与数据共享**：
- Hugging Face 的「AI for Science」社区正在聚合开源科学 AI 模型
- 开放数据集（如 Open Catalysis Project、Materials Project）降低了研究门槛
- Protenix 等中国开源项目正在打破 DeepMind 等西方机构的垄断`,
    },
    {
      title: "八、学习路线：如何进入 AI for Science 领域",
      body: `如果你对 AI for Science 感兴趣，以下是一个系统性的学习路线：

### 8.1 基础准备

**必要的科学知识：**
- 化学：有机化学、物理化学、结构化学基础
- 生物：分子生物学、生物化学基础
- 物理：量子力学基础、统计物理
- 数学：线性代数、微积分、概率论、图论

**必要的 AI/编程技能：**
- Python 编程
- PyTorch 或 JAX
- 图神经网络（PyG、DGL）
- 分子模拟基础（RDKit、OpenMM）

### 8.2 推荐学习资源`,
      table: {
        headers: ["方向", "推荐资源", "难度", "时间"],
        rows: [
          ["AI + 化学", "Deep Learning for Molecules & Materials (MIT)", "中", "3-4 月"],
          ["AI + 生物", "CS 273B: Deep Learning in Genomics (Stanford)", "中高", "3-4 月"],
          ["AI + 材料", "ML for Materials Science (CMU)", "中", "3 月"],
          ["AI + 气候", "Climate Informatics Workshop 教程", "中", "1-2 月"],
          ["PINN", "DeepXDE 文档 + 教程", "中", "1 月"],
          ["GNN", "Stanford CS224W 课程", "中", "3 月"],
        ],
      },
    },
    {
      title: "8.3 实践项目建议",
      body: `从实际项目入手是学习 AI for Science 最快的方式：

1. **蛋白质结构预测**：使用 AlphaFold-Colab 或 Protenix 预测一个感兴趣的蛋白质结构，与实验结构对比
2. **分子性质预测**：用 RDKit + PyG 构建分子性质预测模型（如溶解度、毒性）
3. **天气预测**：用 FourCastNet 或 Pangu-Weather 的开源代码预测未来天气
4. **反应预测**：使用 IBM RXN API 预测化学反应的产物
5. **材料发现**：用 Materials Project API 筛选满足特定条件的晶体材料

**开源项目推荐：**
- [DeepXDE](https://github.com/lululxvf/deepxde)：PINN 框架
- [PyTorch Geometric](https://github.com/pyg-team/pytorch_geometric)：图神经网络
- [OpenFF](https://github.com/openforcefield)：开放力场项目
- [MatterSim](https://github.com/microsoft/mattersim)：Microsoft 的材料模拟框架
- [ESMFold](https://github.com/facebookresearch/esm)：Meta 的蛋白质结构预测`,
    },
    {
      title: "九、总结：AI for Science 的历史性机遇",
      body: `AI for Science 不仅仅是一个技术应用方向，它正在重新定义「什么是科学研究」。

**回顾历史：**
- 望远镜让人类看到更远的星空
- 显微镜让人类看到更小的细胞
- 粒子加速器让人类看到更基本的粒子

**现在，AI 让人类看到更复杂的模式、更深层的规律、更广阔的可能性。**

蛋白质折叠问题困扰了生物学界 50 年，AlphaFold 用不到 5 年彻底解决。材料发现的传统周期是 10-20 年，AI 将其压缩到几个月。天气预报的精度在过去 5 年的提升超过了过去 50 年的总和。

这不是替代科学家——而是让科学家站在 AI 的肩膀上，看到更远的地方。

**2026 年，AI for Science 正处于从「突破」走向「常态化」的拐点。** 未来几年，我们将看到更多科学发现由 AI 驱动，更多实验室配备 AI 平台，更多科学家将 AI 作为日常研究工具。

作为学习者和从业者，现在正是进入这个领域的最佳时机。`,
    },
  ],
};
