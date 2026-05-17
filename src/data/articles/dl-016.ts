import { Article } from '../knowledge';

export const article: Article = {
    id: "dl-016",
    title: "分布式训练：Data Parallel, Model Parallel",
    category: "dl",
    tags: ["分布式训练", "Data Parallel", "Model Parallel"],
    summary: "从单机到集群，掌握深度学习分布式训练的核心技术",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
        {
            title: "1. 为什么需要分布式训练",
            body: `随着模型规模从几百万参数膨胀到万亿级别（如 GPT-4、PaLM），单张 GPU 的显存和算力已经无法支撑训练。当模型参数量超过 GPU 显存容量时，即使 batch_size 设为 1 也无法放下完整的前向传播计算图，这就出现了 OOM（Out of Memory）错误。

分布式训练的核心思路是将计算任务拆分到多个设备（GPU/TPU）上并行执行。主要有两种拆分维度：数据并行（Data Parallel）将同一个模型复制多份，每份处理不同的数据子集；模型并行（Model Parallel）将模型本身拆分到不同设备上，每个设备只持有模型的一部分。

选择分布式策略时需要考虑三个关键因素：模型大小、可用硬件和通信开销。当模型能放入单张 GPU 但需要加速训练时，首选数据并行；当模型本身太大时，必须使用模型并行或两者的混合方案。`,
            code: [
                {
                    lang: "python",
                    code: `import torch

# 估算模型参数量和显存需求
def estimate_memory(model_params, batch_size, seq_len, hidden_dim, dtype_bytes=4):
    """估算训练时所需显存（GB）
    model_params: 模型总参数量
    batch_size * seq_len * hidden_dim: activation memory 的关键变量
    dtype_bytes: 精度字节数 (FP32=4, FP16=2, BF16=2)
    """
    param_memory = model_params * dtype_bytes / 1e9          # 参数本身
    optimizer_memory = model_params * dtype_bytes * 3 / 1e9  # Adam: param + moment1 + moment2
    grad_memory = model_params * dtype_bytes / 1e9           # 梯度
    activation_memory = batch_size * seq_len * hidden_dim * dtype_bytes / 1e9
    
    total = param_memory + optimizer_memory + grad_memory + activation_memory
    return total

# GPT-3 估算：175B 参数，batch=32, seq_len=2048, hidden=12288
gpt3_mem = estimate_memory(175e9, 32, 2048, 12288)
print(f"GPT-3 训练估计显存: {gpt3_mem:.1f} GB")
# 输出: GPT-3 训练估计显存: 4200.0 GB (远超单卡 80GB)`
                },
                {
                    lang: "python",
                    code: `import torch
import torch.distributed as dist

def get_world_info():
    """获取分布式环境信息"""
    if dist.is_available() and dist.is_initialized():
        world_size = dist.get_world_size()
        rank = dist.get_rank()
        local_rank = int(os.environ.get("LOCAL_RANK", 0))
        return world_size, rank, local_rank
    return 1, 0, 0

def print_gpu_stats():
    """打印所有 GPU 的显存使用统计"""
    for i in range(torch.cuda.device_count()):
        mem_alloc = torch.cuda.max_memory_allocated(i) / 1e9
        mem_reserved = torch.cuda.max_memory_reserved(i) / 1e9
        print(f"GPU {i}: 已分配 {mem_alloc:.2f} GB, 已预留 {mem_reserved:.2f} GB")
    
    # 检查 NCCL 通信后端
    print(f"NCCL 可用: {torch.distributed.is_nccl_available()}")
    print(f"后端: {dist.get_backend() if dist.is_initialized() else '未初始化'}")`
                },
            ],
            table: {
                headers: ["训练方式", "适用场景", "显存瓶颈", "通信开销"],
                rows: [
                    ["单机单卡", "小模型 (<1B)", "单卡显存", "无"],
                    ["数据并行 DDP", "模型可放入单卡", "单卡显存", "梯度 AllReduce"],
                    ["模型并行", "模型 > 单卡显存", "切分后单卡显存", "激活值传输"],
                    ["混合并行", "超大模型 (100B+)", "各维度拆分", "多维通信"],
                ],
            },
            mermaid: `graph TD
    A["模型规模"] -->|< 1B| B["单机单卡"]
    A -->|1B - 10B| C["数据并行 DDP"]
    A -->|10B - 100B| D["ZeRO + DDP"]
    A -->|> 100B| E["3D 混合并行"]
    C --> F["加速训练"]
    D --> G["减少显存占用"]
    E --> H["训练超大模型"]`,
            tip: "先用 torch.cuda.memory_summary() 分析显存瓶颈，再选择对应的分布式策略，不要盲目上多卡。",
            warning: "分布式训练的 debug 难度呈指数级增长，务必先在单卡上验证模型正确性后再扩展到多卡。",
        },
        {
            title: "2. Data Parallel 与 DDP 原理",
            body: `数据并行的基本思想非常直观：将模型复制到 N 张 GPU 上，每张 GPU 拿到 1/N 的 mini-batch 数据，独立进行前向和反向传播，然后在 backward 结束后对所有 GPU 的梯度求平均，再用平均后的梯度更新各自的模型副本。

早期的 DataParallel（DP）采用 Parameter Server 架构，主卡负责收集梯度、更新参数、再分发回各卡，这种中心化的方式在主卡形成了通信和计算的瓶颈。DistributedDataParallel（DDP）则采用 Ring-AllReduce 去中心化架构：每张 GPU 既是发送者也是接收者，梯度在 GPU 之间以环形拓扑传递和归约，没有单点瓶颈。

DDP 的训练流程分为三步：Forward - 每张 GPU 用本地数据独立前向传播得到 loss；Backward - 每张 GPU 独立反向传播计算本地梯度；AllReduce - 通过 NCCL 后端执行 AllReduce 操作对所有 GPU 的梯度求平均，然后各自更新参数。由于每轮结束后所有 GPU 的梯度相同，模型副本始终保持同步。`,
            code: [
                {
                    lang: "python",
                    code: `import os
import torch
import torch.distributed as dist
import torch.multiprocessing as mp
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader, DistributedSampler

def setup_distributed(rank, world_size):
    """初始化分布式进程组"""
    os.environ["MASTER_ADDR"] = "localhost"
    os.environ["MASTER_PORT"] = "29500"
    dist.init_process_group(backend="nccl", rank=rank, world_size=world_size)
    torch.cuda.set_device(rank)

def cleanup_distributed():
    """清理分布式环境"""
    dist.destroy_process_group()

def train_loop(rank, world_size):
    setup_distributed(rank, world_size)
    
    # 创建模型并移动到当前 GPU
    model = MyModel().to(rank)
    # 关键: 用 DDP 包裹模型，自动处理梯度同步
    model = DDP(model, device_ids=[rank], output_device=rank)
    
    # 使用 DistributedSampler 确保每张卡拿到不同的数据子集
    dataset = MyDataset()
    sampler = DistributedSampler(dataset, num_replicas=world_size, rank=rank)
    dataloader = DataLoader(dataset, batch_size=32, sampler=sampler)
    
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)
    
    for epoch in range(10):
        sampler.set_epoch(epoch)  # 每轮重新 shuffle
        for batch in dataloader:
            optimizer.zero_grad()
            loss = model(batch)
            loss.backward()        # 自动 AllReduce 梯度
            optimizer.step()
    
    cleanup_distributed()

if __name__ == "__main__":
    world_size = torch.cuda.device_count()
    mp.spawn(train_loop, args=(world_size,), nprocs=world_size)`
                },
                {
                    lang: "python",
                    code: `# DDP 底层通信原语详解
import torch.distributed as dist
import torch

# AllReduce: 所有进程的 tensor 归约求和/平均
tensor = torch.randn(4, device="cuda")
dist.all_reduce(tensor, op=dist.ReduceOp.SUM)
# tensor 现在在所有 GPU 上相同，值为各 GPU 原始值之和

# Broadcast: 从 rank 0 广播到所有进程
if dist.get_rank() == 0:
    data = torch.randn(4, device="cuda")
else:
    data = torch.zeros(4, device="cuda")
dist.broadcast(data, src=0)
# 现在所有 GPU 上的 data 都等于 rank 0 的原始值

# Reduce: 归约到指定进程（非 AllReduce，只有 dst 拿到结果）
tensor = torch.randn(4, device="cuda")
if dist.get_rank() == 0:
    dist.reduce(tensor, dst=0, op=dist.ReduceOp.SUM)
    
# Gather: 收集所有进程的 tensor 到指定进程
local_tensor = torch.randn(2, device="cuda")
if dist.get_rank() == 0:
    gather_list = [torch.zeros(2, device="cuda") for _ in range(dist.get_world_size())]
    dist.gather(local_tensor, gather_list, dst=0)
# rank 0 的 gather_list 包含所有 GPU 的 tensor`
                },
            ],
            table: {
                headers: ["通信原语", "操作", "结果", "DDP 中的用途"],
                rows: [
                    ["AllReduce", "归约 + 广播到所有进程", "所有 GPU 拿到相同结果", "梯度同步"],
                    ["Broadcast", "从 src 复制到所有进程", "所有 GPU 拿到 src 的数据", "参数初始化同步"],
                    ["Reduce", "归约到指定 dst 进程", "只有 dst 拿到结果", "日志聚合"],
                    ["AllGather", "收集所有进程数据", "每个 GPU 拿到全部数据", "分布式 batch norm"],
                ],
            },
            mermaid: `sequenceDiagram
    participant G0 as GPU 0
    participant G1 as GPU 1
    participant G2 as GPU 2
    participant G3 as GPU 3
    G0->>G0: Forward + Backward
    G1->>G1: Forward + Backward
    G2->>G2: Forward + Backward
    G3->>G3: Forward + Backward
    G0->>G1: Send Grad
    G1->>G2: Send Grad
    G2->>G3: Send Grad
    G3->>G0: Send Grad (Ring)
    Note over G0,G3: AllReduce 完成
    G0->>G0: Update Params
    G1->>G1: Update Params
    G2->>G2: Update Params
    G3->>G3: Update Params`,
            tip: "使用 find_unused_parameters=True 当模型中存在不被所有 GPU 使用的分支时，但会引入性能开销，尽量避免。",
            warning: "DDP 要求每张 GPU 的 batch_size 足够大（至少 8-16），否则 BN 层的统计量估计不准确，影响模型收敛。",
        },
        {
            title: "3. ZeRO 优化器：内存革命",
            body: `ZeRO（Zero Redundancy Optimizer）是 DeepSpeed 团队提出的内存优化技术，它解决了数据并行中最大的痛点：每张 GPU 都持有一份完整的模型参数、梯度和优化器状态，造成大量冗余。以 Adam 优化器为例，每个参数需要存储参数本身（FP32 master weight）、梯度和两个动量（moment1, moment2），内存开销是参数量的 4 倍（假设 FP32），这在 100B 参数模型中相当于 1.6TB 的冗余存储。

ZeRO 的核心思路是将这些冗余的内存状态在 GPU 之间进行分区（Partition），就像数据并行将数据分区一样，现在连参数、梯度和优化器状态也被分区。每个 GPU 只维护自己分区的状态，在需要时通过通信获取其他分区的数据。ZeRO 分三个阶段递进优化：ZeRO-1 仅分区优化器状态，ZeRO-2 额外分区梯度，ZeRO-3 连参数也分区，彻底消除所有冗余。

ZeRO-3 的效果尤为显著：N 张 GPU 下，每张 GPU 的内存占用从 O(模型大小) 降低到 O(模型大小/N)。这意味着原本需要 100 张 GPU 才能放下 100B 参数的模型，现在可能只需要 20 张。代价是通信量增加，但在现代高速网络（NVLink、InfiniBand）下，通信开销远小于显存瓶颈带来的收益。`,
            code: [
                {
                    lang: "python",
                    code: `# DeepSpeed ZeRO 配置示例 (deepspeed_config.json)
import json

deepspeed_config = {
    "train_batch_size": 256,
    "gradient_accumulation_steps": 4,
    "optimizer": {
        "type": "AdamW",
        "params": {
            "lr": 3e-4,
            "betas": [0.9, 0.95],
            "eps": 1e-8,
            "weight_decay": 0.1
        }
    },
    "zero_optimization": {
        "stage": 3,            # ZeRO-3: 分区参数+梯度+优化器状态
        "offload_optimizer": {
            "device": "cpu",   # 优化器状态卸载到 CPU 内存
            "pin_memory": True
        },
        "offload_param": {
            "device": "cpu",   # 参数卸载到 CPU 内存
            "pin_memory": True
        },
        "overlap_comm": True,   # 通信与计算重叠
        "contiguous_gradients": True,
        "reduce_bucket_size": 5e8,
        "stage3_prefetch_bucket_size": 5e8,
        "stage3_param_persistence_threshold": 1e5
    },
    "fp16": {
        "enabled": True,
        "loss_scale": 0,         # 动态 loss scaling
        "initial_scale_power": 16
    }
}

print(json.dumps(deepspeed_config, indent=2))`
                },
                {
                    lang: "python",
                    code: `# PyTorch FSDP (Fully Sharded Data Parallel) - ZeRO-3 的 PyTorch 原生实现
import torch
import torch.distributed as dist
from torch.distributed.fsdp import FullyShardedDataParallel as FSDP
from torch.distributed.fsdp import MixedPrecision, ShardingStrategy
from torch.distributed.fsdp.wrap import size_based_auto_wrap_policy

def setup_fsdp(model, rank, world_size):
    """使用 FSDP 包装模型，等效于 ZeRO-3"""
    
    # 混合精度策略
    mp_policy = MixedPrecision(
        param_dtype=torch.float16,      # 参数以 FP16 存储
        reduce_dtype=torch.float32,     # 梯度归约用 FP32
        buffer_dtype=torch.float16      # buffer 用 FP16
    )
    
    # 自动包装策略：大于 100M 参数的子模块独立分片
    auto_wrap_policy = size_based_auto_wrap_policy(min_num_params=1e8)
    
    fsdp_model = FSDP(
        model,
        sharding_strategy=ShardingStrategy.FULL_SHARD,  # ZeRO-3
        mixed_precision=mp_policy,
        auto_wrap_policy=auto_wrap_policy,
        device_id=rank,
        sync_module_states=True,       # 初始化时同步参数
        use_orig_params=True           # 保留原始参数名
    )
    
    return fsdp_model

# 训练循环与 DDP 几乎相同，FSDP 内部自动处理参数的 gather/shard
for batch in dataloader:
    optimizer.zero_grad()
    loss = fsdp_model(batch)
    loss.backward()
    optimizer.step()`
                },
            ],
            table: {
                headers: ["ZeRO 阶段", "分区内容", "显存节省", "通信增加"],
                rows: [
                    ["ZeRO-0 (DDP)", "无分区，全部冗余", "0%", "基准"],
                    ["ZeRO-1", "优化器状态", "~50-65%", "低"],
                    ["ZeRO-2", "优化器状态 + 梯度", "~65-75%", "中"],
                    ["ZeRO-3 (FSDP)", "参数 + 梯度 + 优化器", "~75-90%", "高"],
                ],
            },
            mermaid: `graph LR
    subgraph "ZeRO-0 (DDP)"
        A0["GPU0: 全部参数"]
        B0["GPU1: 全部参数"]
        C0["GPU2: 全部参数"]
    end
    subgraph "ZeRO-3 (FSDP)"
        A1["GPU0: 参数分区 0"]
        B1["GPU1: 参数分区 1"]
        C1["GPU2: 参数分区 2"]
    end
    A0 -.冗余.-> B0
    B0 -.冗余.-> C0
    A1 -.需要时通信.-> B1
    B1 -.需要时通信.-> C1`,
            tip: "ZeRO-3 配合 CPU Offload 可以在显存有限的 GPU 上训练更大的模型，但会显著增加训练时间（PCIe 带宽远低于 GPU 显存带宽）。",
            warning: "ZeRO 分片后，检查点保存和加载需要特殊处理。使用 FSDP.full_optim_state_dict() 而非普通的 state_dict()。",
        },
        {
            title: "4. Model Parallel：张量并行与流水线并行",
            body: `当模型大到即使 ZeRO-3 也无法放下时（例如万亿参数模型），就必须将模型本身拆分到多张 GPU 上。模型并行有两个主流实现：张量并行（Tensor Parallel）和流水线并行（Pipeline Parallel）。

张量并行将单个矩阵运算拆分到多张 GPU 上。以线性层 Y = XW + b 为例，如果将权重矩阵 W 按列切分为 [W₁, W₂]，则 Y = [XW₁, XW₂]，各 GPU 独立计算各自的矩阵乘法，最后通过 AllGather 拼接结果。Megatron-LM 提出的列并行（Column Parallel）和行并行（Row Parallel）交替排列，使得相邻层的 AllReduce/AllGather 可以相互抵消，将通信开销降到最低。

流水线并行将模型按层切分到不同 GPU。GPU 0 负责 Embedding + 前几层 Transformer，GPU 1 负责中间几层，GPU 2 负责最后几层 + Head。数据像流水线一样经过各 GPU：GPU 0 处理完 batch 后传给 GPU 1，GPU 1 处理完传给 GPU 2。但简单的流水线并行会导致 GPU 空闲（bubble），因此需要微批次（Micro-batch）划分来填满空闲时间，即 GPipe 和 PipeDream 等调度算法。`,
            code: [
                {
                    lang: "python",
                    code: `# 张量并行：Megatron-LM 风格的列并行 + 行并行
import torch
import torch.nn as nn
from torch.distributed import tensor as dist_tensor
from torch.distributed.device_mesh import init_device_mesh

class ColumnParallelLinear(nn.Module):
    """列并行线性层：将权重矩阵按列切分
    原始: Y = X @ [W1, W2] + [b1, b2]
    拆分: GPU0 计算 Y1 = X @ W1 + b1, GPU1 计算 Y2 = X @ W2 + b2
    """
    def __init__(self, in_features, out_features, world_size, bias=True):
        super().__init__()
        assert out_features % world_size == 0, "输出维度必须能被 GPU 数整除"
        self.local_out = out_features // world_size
        self.weight = nn.Parameter(torch.randn(in_features, self.local_out))
        if bias:
            self.bias = nn.Parameter(torch.zeros(self.local_out))
        else:
            self.register_parameter("bias", None)
    
    def forward(self, x):
        # x 在所有 GPU 上相同
        out = x @ self.weight   # (batch, in) @ (in, local_out) -> (batch, local_out)
        if self.bias is not None:
            out = out + self.bias
        return out  # 需要后续层的行并行来 AllGather

class RowParallelLinear(nn.Module):
    """行并行线性层：将权重矩阵按行切分，输出需要 AllReduce"""
    def __init__(self, in_features, out_features, world_size, bias=True):
        super().__init__()
        assert in_features % world_size == 0
        self.local_in = in_features // world_size
        self.weight = nn.Parameter(torch.randn(self.local_in, out_features))
        if bias:
            self.bias = nn.Parameter(torch.zeros(out_features))
    
    def forward(self, x):
        # x 是局部输入 (batch, local_in)
        out = x @ self.weight   # (batch, local_in) @ (local_in, out) -> (batch, out)
        # AllReduce 将各 GPU 的 partial sum 累加
        torch.distributed.all_reduce(out, op=torch.distributed.ReduceOp.SUM)
        if self.bias is not None:
            out = out + self.bias
        return out`
                },
                {
                    lang: "python",
                    code: `# 流水线并行：PyTorch Pipeline Parallel
import torch
from torch.distributed.pipelining import pipeline, SplitPoint
from torch.distributed.pipelining import ScheduleGPipe

class TransformerBlock(nn.Module):
    def __init__(self, dim, n_heads):
        super().__init__()
        self.attn = nn.MultiheadAttention(dim, n_heads, batch_first=True)
        self.ffn = nn.Sequential(
            nn.Linear(dim, dim * 4),
            nn.GELU(),
            nn.Linear(dim * 4, dim)
        )
        self.norm1 = nn.LayerNorm(dim)
        self.norm2 = nn.LayerNorm(dim)
    
    def forward(self, x):
        x = x + self.attn(self.norm1(x), self.norm1(x), self.norm1(x))[0]
        x = x + self.ffn(self.norm2(x))
        return x

class LargeModel(nn.Module):
    def __init__(self, vocab_size=50257, dim=768, n_layers=24, n_heads=12):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, dim)
        self.layers = nn.ModuleList([
            TransformerBlock(dim, n_heads) for _ in range(n_layers)
        ])
        self.head = nn.Linear(dim, vocab_size)
    
    def forward(self, input_ids):
        x = self.embedding(input_ids)
        for layer in self.layers:
            x = layer(x)
        return self.head(x)

# 使用 torch.distributed.pipelining 自动切分模型
model = LargeModel()
# 在每 6 层后设置切分点
split_spec = {
    f"layers.{5}": SplitPoint.BEGINNING,
    f"layers.{11}": SplitPoint.BEGINNING,
    f"layers.{17}": SplitPoint.BEGINNING,
}
pipe = pipeline(model, num_chunks=8, split_spec=split_spec)

# GPipe 调度：将 batch 分为多个 micro-batch
micro_batches = 8
schedule = ScheduleGPipe(pipe, micro_batches)
# 执行流水线
loss = schedule.step(input_ids)`
                },
            ],
            table: {
                headers: ["并行方式", "切分粒度", "通信类型", "GPU 利用率"],
                rows: [
                    ["张量并行", "单层内部矩阵", "AllGather/AllReduce", "高（无空闲）"],
                    ["流水线并行", "按层切分", "点对点传输", "中（有 bubble）"],
                    ["序列并行",  "按序列长度切分", "AllGather/ReduceScatter", "高"],
                    ["专家并行 MoE", "按专家网络切分", "All-to-All", "取决于路由"],
                ],
            },
            mermaid: `graph LR
    subgraph "张量并行"
        T1["GPU0: W1 列"] --> T2["GPU1: W2 列"]
    end
    subgraph "流水线并行"
        P1["GPU0: Layer 0-7"] --> P2["GPU1: Layer 8-15"]
        P2 --> P3["GPU2: Layer 16-23"]
    end
    T1 -.矩阵乘法分割.-. T2
    P1 -.激活值传递.-. P2
    P2 -.激活值传递.-. P3`,
            tip: "张量并行最好配合 NVLink 使用（同一节点内），跨节点的张量并行会因 PCIe/以太网带宽成为瓶颈。",
            warning: "流水线并行的 micro-batch 数量必须是 stage 数量的整数倍，否则会产生额外的 bubble。一般设置为 stage 数的 4 倍以上。",
        },
        {
            title: "5. 混合精度训练（Mixed Precision）",
            body: `混合精度训练是分布式训练中不可或缺的优化技术，它通过同时使用 FP16/BF16 和 FP32 两种精度来加速训练并减少显存占用。核心思想是将那些对精度不敏感的运算（如矩阵乘法、卷积）使用 FP16/BF16，而将需要高精度的运算（如梯度累加、优化器更新）保持 FP32。

FP16 相比 FP32 有两个关键优势：显存减半（每个参数/梯度从 4 字节变为 2 字节）和计算加速（现代 GPU 的 Tensor Core 对 FP16 矩阵乘法有 2-8 倍加速）。但 FP16 的表示范围（6.5e-5 ~ 6.5e4）远小于 FP32（1.4e-45 ~ 3.4e38），因此会面临两个问题：下溢（Underflow）导致小梯度变为零，以及溢出（Overflow）导致大梯度变为 NaN。

解决下溢的方法是 Loss Scaling：在前向传播后将 loss 乘以一个缩放因子（如 2^16），反向传播后梯度也相应放大，然后再缩放回来。溢出则通过梯度裁剪（Gradient Clipping）和动态 Loss Scaling 来处理。BF16（Brain Floating Point）是 Google 提出的替代方案，它保持了 FP32 的指数范围（8 bit），仅缩减了尾数精度（7 bit），因此几乎不需要 Loss Scaling，在 LLM 训练中已成为主流选择。`,
            code: [
                {
                    lang: "python",
                    code: `# PyTorch 原生 AMP (Automatic Mixed Precision)
import torch
from torch.cuda.amp import autocast, GradScaler

model = MyLargeModel().cuda()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)
scaler = GradScaler()  # 自动管理 loss scaling

for epoch in range(num_epochs):
    for batch in dataloader:
        optimizer.zero_grad()
        
        # autocast 自动选择精度：矩阵乘法用 FP16，其他用 FP32
        with autocast(dtype=torch.float16):
            output = model(batch["input_ids"])
            loss = criterion(output, batch["labels"])
        
        # scaler.scale 放大 loss 以避免梯度下溢
        scaler.scale(loss).backward()
        
        # scaler.unscale 反缩放梯度，然后 clip 避免溢出
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        
        # scaler.step 先 unscale 再 optimizer.step
        scaler.step(optimizer)
        scaler.update()  # 动态调整 scaling factor

# BF16 更简单：不需要 GradScaler（指数范围足够大）
for batch in dataloader:
    optimizer.zero_grad()
    with autocast(dtype=torch.bfloat16):
        output = model(batch["input_ids"])
        loss = criterion(output, batch["labels"])
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    optimizer.step()`
                },
                {
                    lang: "python",
                    code: `# FP16 vs BF16 vs FP32 精度对比
import struct

def float_info(name, exp_bits, mantissa_bits):
    """打印浮点数格式的精度信息"""
    max_val = (2 - 2(-mantissa_bits)) * 2(2**(exp_bits-1) - 1)
    min_normal = 2(-(2(exp_bits-1) - 2))
    print(f"{name}:")
    print(f"  最大可表示值: {max_val:.2e}")
    print(f"  最小正规数: {min_normal:.2e}")
    print(f"  精度(尾数): {mantissa_bits} bits")

float_info("FP32", 8, 23)
float_info("FP16", 5, 10)
float_info("BF16", 8, 7)
# 输出:
#   FP32: 最大可表示值: 3.40e+38, 最小正规数: 1.18e-38, 精度: 23 bits
#   FP16: 最大可表示值: 6.55e+04, 最小正规数: 6.10e-05, 精度: 10 bits
#   BF16: 最大可表示值: 3.39e+38, 最小正规数: 1.18e-38, 精度: 7 bits

# Tensor Core 加速测试
def benchmark_matmul(size=4096, dtype=torch.float16, device="cuda"):
    A = torch.randn(size, size, dtype=dtype, device=device)
    B = torch.randn(size, size, dtype=dtype, device=device)
    
    torch.cuda.synchronize()
    start = torch.cuda.Event(enable_timing=True)
    end = torch.cuda.Event(enable_timing=True)
    
    start.record()
    C = torch.matmul(A, B)
    end.record()
    torch.cuda.synchronize()
    
    elapsed_ms = start.elapsed_time(end)
    print(f"{dtype} {size}x{size}: {elapsed_ms:.2f} ms")

benchmark_matmul(dtype=torch.float32)  # FP32: 较慢
benchmark_matmul(dtype=torch.float16)  # FP16: Tensor Core 加速
benchmark_matmul(dtype=torch.bfloat16) # BF16: Tensor Core 加速`
                },
            ],
            table: {
                headers: ["精度格式", "总位数", "指数位", "尾数位", "最大值", "适用场景"],
                rows: [
                    ["FP32", "32", "8", "23", "3.4e38", "优化器状态、梯度累加"],
                    ["FP16", "16", "5", "10", "6.5e4", "前向/反向矩阵乘法"],
                    ["BF16", "16", "8", "7", "3.4e38", "LLM 训练（无需 scaling）"],
                    ["FP8", "8", "4/5", "3/2", "~448~2.4e38", "推理/实验性训练"],
                ],
            },
            mermaid: `graph TD
    A["FP32 前向"] --> B{"需要 FP16 加速?"}
    B -->|是| C["autocast: FP16 前向"]
    B -->|否| D["FP32 前向"]
    C --> E["FP16 loss"]
    D --> F["FP32 loss"]
    E --> G["Loss Scaling"]
    G --> H["FP16 反向传播"]
    H --> I["梯度 Unscale"]
    F --> J["FP32 反向传播"]
    I --> K["梯度 Clip (FP32)"]
    J --> K
    K --> L["Optimizer Step (FP32)"]`,
            tip: "Ampere 架构（RTX 3090/A100）及之后的 GPU 同时支持 FP16 和 BF16 Tensor Core，优先使用 BF16 可以避免 loss scaling 的调参工作。",
            warning: "FP16 训练中如果 loss 突然变为 NaN/Inf，通常是 loss scale 过大导致的溢出。检查 GradScaler 的 _scale 值并适当减小。",
        },
        {
            title: "6. 梯度累积（Gradient Accumulation）",
            body: `梯度累积是一种用时间换空间的训练技巧，它允许我们用较小的 per-GPU batch size 模拟大 batch size 的训练效果。在分布式训练中，每张 GPU 的 batch size 受限于显存，但较大的全局 batch size 通常能提供更稳定的梯度估计和更好的训练效果。

梯度累积的工作原理很简单：将一个大 batch 拆分为多个 micro-batch，依次进行前向和反向传播，但不立即更新参数，而是将梯度累加（累积）起来。当累积了足够多的 micro-batch 后，才执行一次 optimizer.step() 来更新参数，然后清零梯度。这样，有效 batch size = per-GPU batch_size * gradient_accumulation_steps * num_gpus。

梯度累积在 ZeRO 和流水线并行中尤为重要。ZeRO-3 因为参数被分片，前向传播时需要从其他 GPU gather 参数，频繁的参数更新会导致大量通信。通过梯度累积减少更新频率，可以显著降低通信开销。同样，在流水线并行中，梯度累积可以让 micro-batch 在流水线中填充 bubble，提高 GPU 利用率。但需要注意：梯度累积会增加训练时间，因为需要多次前向/反向传播；而且 BN 层的统计量只在每个 micro-batch 内计算，可能导致精度略有下降。`,
            code: [
                {
                    lang: "python",
                    code: `# 梯度累积的标准实现
import torch

def train_with_gradient_accumulation(model, dataloader, optimizer, criterion,
                                      accumulation_steps=4, max_grad_norm=1.0):
    """使用梯度累积训练模型
    
    Args:
        accumulation_steps: 累积多少个 micro-batch 后才更新
    有效 batch_size = per_gpu_batch_size * accumulation_steps * world_size
    """
    model.train()
    optimizer.zero_grad()
    
    for step, batch in enumerate(dataloader):
        # 前向传播
        output = model(batch["input_ids"])
        loss = criterion(output, batch["labels"])
        
        # 将 loss 除以累积步数，确保梯度尺度正确
        loss = loss / accumulation_steps
        loss.backward()
        
        # 每 accumulation_steps 步执行一次参数更新
        if (step + 1) % accumulation_steps == 0:
            # 梯度裁剪（在全局梯度上操作）
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_grad_norm)
            optimizer.step()
            optimizer.zero_grad()
    
    # 处理最后不足 accumulation_steps 的剩余 batch
    if (step + 1) % accumulation_steps != 0:
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_grad_norm)
        optimizer.step()
        optimizer.zero_grad()

# 使用示例：per-GPU batch_size=8, accumulation=4, 8张GPU
# 有效 batch_size = 8 * 4 * 8 = 256
print("有效 batch_size = 8 * 4 * 8 = 256")`
                },
                {
                    lang: "python",
                    code: `# DDP + 梯度累积 + 混合精度的完整训练循环
import torch
from torch.cuda.amp import autocast, GradScaler
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DistributedSampler

class Trainer:
    def __init__(self, model, dataloader, rank, world_size,
                 accumulation_steps=4, lr=1e-4):
        self.model = DDP(model.cuda(rank), device_ids=[rank])
        self.optimizer = torch.optim.AdamW(model.parameters(), lr=lr)
        self.scaler = GradScaler()
        self.accumulation_steps = accumulation_steps
        
        sampler = DistributedSampler(dataloader.dataset, 
                                      num_replicas=world_size, rank=rank)
        self.dataloader = torch.utils.data.DataLoader(
            dataloader.dataset, batch_size=8, sampler=sampler)
    
    def train_epoch(self, epoch):
        self.model.train()
        self.dataloader.sampler.set_epoch(epoch)
        self.optimizer.zero_grad()
        
        for step, batch in enumerate(self.dataloader):
            with autocast(dtype=torch.bfloat16):
                output = self.model(batch["input_ids"])
                loss = self.compute_loss(output, batch["labels"])
            
            # 标准化 loss 以支持梯度累积
            loss = loss / self.accumulation_steps
            self.scaler.scale(loss).backward()
            
            # 累积够步数后才更新
            if (step + 1) % self.accumulation_steps == 0:
                self.scaler.unscale_(self.optimizer)
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
                self.scaler.step(self.optimizer)
                self.scaler.update()
                self.optimizer.zero_grad()
        
        # 处理剩余 batch
        if (step + 1) % self.accumulation_steps != 0:
            self.scaler.unscale_(self.optimizer)
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            self.scaler.step(self.optimizer)
            self.scaler.update()
            self.optimizer.zero_grad()`
                },
            ],
            table: {
                headers: ["accumulation_steps", "有效 batch_size", "显存占用", "训练速度"],
                rows: [
                    ["1", "64 (8*8)", "正常", "最快"],
                    ["2", "128 (8*2*8)", "正常", "约慢 5%"],
                    ["4", "256 (8*4*8)", "正常", "约慢 10%"],
                    ["8", "512 (8*8*8)", "正常", "约慢 15%"],
                ],
            },
            mermaid: `graph TD
    A["Micro-batch 1"] --> B["Forward"]
    B --> C["Backward"]
    C --> D["梯度累加到 .grad"]
    D --> E{step ％ 4 == 0?}
    E -->|否| F["Micro-batch 2"]
    F --> G["Forward"]
    G --> H["Backward"]
    H --> D
    E -->|是| I["Clip Gradients"]
    I --> J["Optimizer Step"]
    J --> K["Zero Gradients"]`,
            tip: "梯度累积时的学习率 warmup 应该基于有效 batch size 计算，即按全局总步数（包含累积步）来设置 warmup ratio。",
            warning: "使用 BatchNorm 时，梯度累积的每个 micro-batch 的 BN 统计量是独立计算的，这与大 batch 训练不等价。考虑使用 SyncBatchNorm 将 BN 替换为跨 GPU 同步的版本。",
        },
        {
            title: "7. PyTorch 多 GPU 训练实战",
            body: `本章将前面所有章节的知识整合，构建一个完整的 PyTorch 多 GPU 分布式训练框架。我们将结合 DDP、混合精度训练、梯度累积、检查点保存等核心技术，搭建一个可以在 8 张 GPU 上训练大语言模型的训练脚本。

实际的分布式训练系统还需要考虑很多工程细节：如何优雅地启动和管理多个训练进程、如何处理 GPU 故障和恢复训练、如何在训练过程中动态调整学习率、如何记录和可视化训练指标、以及如何高效地保存和加载检查点。PyTorch 提供了 torchrun 启动器来简化多进程管理，它自动设置环境变量、分配 rank、并处理进程间通信的初始化。

一个生产级别的训练框架还需要支持：断点续训（从上次保存的 checkpoint 恢复）、学习率调度（Cosine Annealing + Warmup）、梯度检查点（Gradient Checkpointing 进一步节省显存）、以及训练日志的多级别聚合（local rank 日志汇总到 rank 0）。下面展示一个相对完整的训练框架。`,
            code: [
                {
                    lang: "python",
                    code: `#!/usr/bin/env python
"""多 GPU 训练入口 - 使用 torchrun 启动
torchrun --nproc_per_node=8 --master_port=29500 train_ddp.py
"""
import os
import argparse
import torch
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader, DistributedSampler
from torch.cuda.amp import autocast, GradScaler
from transformers import AutoModelForCausalLM, AutoTokenizer

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch_size", type=int, default=8)
    parser.add_argument("--accum_steps", type=int, default=4)
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--lr", type=float, default=2e-5)
    parser.add_argument("--max_grad_norm", type=float, default=1.0)
    parser.add_argument("--checkpoint_dir", type=str, default="./checkpoints")
    args = parser.parse_args()
    
    # torchrun 自动设置这些环境变量
    local_rank = int(os.environ["LOCAL_RANK"])
    world_size = int(os.environ["WORLD_SIZE"])
    rank = int(os.environ["RANK"])
    
    torch.cuda.set_device(local_rank)
    dist.init_process_group(backend="nccl")
    
    # 加载模型
    model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")
    model.gradient_checkpointing_enable()  # 用计算换显存
    model = model.to(local_rank)
    model = DDP(model, device_ids=[local_rank],
                gradient_as_bucket_view=True,  # 减少显存峰值
                static_graph=True)  # 静态图优化
    
    # 使用 SyncBatchNorm（如果模型中有 BN 层）
    model = torch.nn.SyncBatchNorm.convert_sync_batchnorm(model)
    
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, 
                                   betas=(0.9, 0.95), weight_decay=0.1)
    scaler = GradScaler()
    
    train_dataset = MyDataset()
    sampler = DistributedSampler(train_dataset, num_replicas=world_size, rank=rank)
    dataloader = DataLoader(train_dataset, batch_size=args.batch_size, 
                            sampler=sampler, num_workers=4, pin_memory=True)
    
    print(f"Rank {rank}: 开始训练，有效 batch_size = {args.batch_size * args.accum_steps * world_size}")
    # Rank 0: 开始训练，有效 batch_size = 8 * 4 * 8 = 256
    
    for epoch in range(args.epochs):
        train_one_epoch(model, dataloader, optimizer, scaler, sampler,
                        args, rank, epoch)
    
    dist.destroy_process_group()`,
                },
                {
                    lang: "python",
                    code: `# 检查点保存与断点续训
import os
import torch
import torch.distributed as dist

def save_checkpoint(model, optimizer, scaler, epoch, step, checkpoint_dir, rank):
    """保存分布式训练检查点"""
    os.makedirs(checkpoint_dir, exist_ok=True)
    
    # 只让 rank 0 保存，避免多进程写同一文件
    if rank == 0:
        checkpoint = {
            "epoch": epoch,
            "step": step,
            "model_state": model.module.state_dict(),  # DDP 包装的模型
            "optimizer_state": optimizer.state_dict(),
            "scaler_state": scaler.state_dict(),
        }
        path = os.path.join(checkpoint_dir, f"checkpoint_epoch{epoch}_step{step}.pt")
        torch.save(checkpoint, path)
        print(f"Rank 0: 检查点已保存: {path}")
    
    dist.barrier()  # 等待所有进程到达此处

def load_checkpoint(model, optimizer, scaler, checkpoint_path, map_location):
    """加载检查点并恢复训练状态"""
    checkpoint = torch.load(checkpoint_path, map_location=map_location)
    
    model.module.load_state_dict(checkpoint["model_state"])
    optimizer.load_state_dict(checkpoint["optimizer_state"])
    scaler.load_state_dict(checkpoint["scaler_state"])
    
    return checkpoint["epoch"], checkpoint["step"]

# 断点续训使用示例
def train_one_epoch(model, dataloader, optimizer, scaler, sampler,
                    args, rank, epoch):
    checkpoint_path = os.path.join(args.checkpoint_dir, 
                                    f"checkpoint_epoch{epoch - 1}_latest.pt")
    start_step = 0
    
    if os.path.exists(checkpoint_path):
        start_epoch, start_step = load_checkpoint(
            model, optimizer, scaler, checkpoint_path, 
            map_location=f"cuda:{rank}")
        print(f"Rank {rank}: 从 epoch {start_epoch} step {start_step} 恢复")
    
    model.train()
    optimizer.zero_grad()
    
    for step, batch in enumerate(dataloader):
        if step <= start_step:
            continue
        # ... 正常训练循环
        pass`
                },
            ],
            table: {
                headers: ["技术", "显存节省", "速度影响", "推荐优先级"],
                rows: [
                    ["DDP 数据并行", "无（需要模型放入单卡）", "加速 N 倍", "必选"],
                    ["梯度累积", "无（但可模拟大 batch）", "略降（5-15%）", "按需"],
                    ["混合精度 (BF16)", "~50%", "加速 2-3x", "必选"],
                    ["Gradient Checkpointing", "~60%", "降速 ~20%", "大模型推荐"],
                    ["ZeRO-3 (FSDP)", "~75-90%", "通信增加", "模型 > 单卡时必选"],
                ],
            },
            mermaid: `graph TD
    A["torchrun 启动 8 进程"] --> B["初始化 NCCL 进程组"]
    B --> C["加载模型到各 GPU"]
    C --> D["DDP 包装 + SyncBatchNorm"]
    D --> E["DistributedSampler 分配数据"]
    E --> F{"训练循环"}
    F --> G["AMP 前向传播"]
    G --> H["梯度累积 Backward"]
    H --> I{累积够了?}
    I -->|否| G
    I -->|是| J["Clip + Optimizer Step"]
    J --> K{需要保存?}
    K -->|是| L["Rank 0 保存 Checkpoint"]
    K -->|否| F
    L --> F`,
            tip: "使用 torchrun --standalone --nproc_per_node=NUM_GPUS your_script.py 可以方便地在单机多卡上启动训练，不需要手动配置 MASTER_ADDR。",
            warning: "在 DDP 中不要修改模型的结构（如动态添加/删除层）或使用控制流（if-else 分支），这会导致不同 GPU 的计算图不一致。如需动态结构，使用 find_unused_parameters=True。",
        },
    ],
};
