// 具身智能全景：从世界模型到人形机器人的技术栈

import { Article } from '../knowledge';

export const article: Article = {
  id: "physical-002",
  title: "具身智能（二）：机器人大脑与行为控制",
  category: "practice",
  tags: ["具身智能", "人形机器人", "世界模型", "Sim-to-Real", "Figure 02", "Gemini Robotics", "机器人学习", "VLA"],
  summary: "2026 年具身智能（Embodied AI）迎来爆发元年：Figure 02 人形机器人进入汽车工厂流水线，Google Gemini Robotics-ER 1.6 实现工业巡检，Tesla Optimus 开始在仓库部署。本文系统梳理具身智能的技术全景——从世界模型建模、视觉-语言-动作（VLA）模型，到 Sim-to-Real 迁移和真实机器人部署，帮你建立完整的具身智能知识体系。",
  date: "2026-04-18",
  readTime: "22 min",
  level: "进阶",
  learningPath: {
    routeId: "embodied-ai",
    phase: 2,
    order: 2,
    nextStep: "agent-040",
    prevStep: "physical-001",
  },
  content: [
    {
      title: "为什么 2026 年是具身智能元年",
      body: `具身智能（Embodied AI）指的是拥有物理身体的 AI 系统——机器人、无人车、无人机等——它们通过感知环境、做出决策并执行物理动作来完成任务。与纯软件的 AI 不同，具身智能必须在真实物理世界中运作，面对噪声、延迟、不确定性和安全风险。

2026 年被广泛认为是「具身智能元年」，几个标志性事件同时发生：

产业里程碑：
- Figure 02：Figure AI 的人形机器人已进入 BMW 汽车工厂执行真实装配任务，支持开放词汇的自然语言指令，能理解「把那把螺丝刀递给我」这样的日常语言
- Tesla Optimus Gen 3：开始在 Tesla 仓库执行分拣、搬运任务，成本目标降至 2 万美元以下
- Google **Gemini** Robotics-ER 1.6 + Boston Dynamics Spot：工业巡检场景落地，能读取压力表、液位计等仪器数据
- Agility Robotics Digit：在 Amazon 仓库部署，执行包裹分拣和搬运

技术突破：
- VLA（Vision-Language-Action）模型：将视觉理解、语言推理和动作控制统一到一个端到端模型中
- 世界模型（World Models）：机器人内部构建环境的物理模型，支持预测和规划
- Sim-to-Real 迁移：在仿真环境中训练的策略能直接迁移到真实机器人
- 大模型赋能机器人：LLM 提供高级任务分解和推理，底层策略模型负责精确控制

资本投入：
- Figure AI 估值 26 亿美元，投资方包括 **OpenAI**、**NVIDIA**、**Microsoft**
- Boston Dynamics 被 Hyundai 收购后加速商业化
- Tesla Optimus 被 Elon Musk 定位为 Tesla 未来最大的价值来源

这些事件共同指向一个趋势：机器人不再是「编程执行固定动作」的自动化设备，而是能理解自然语言、适应新环境、自主完成任务的「智能体」。`,
      mermaid: `graph TD
    A["具身智能技术栈"] --> B["感知层"]
    A --> C["认知层"]
    A --> D["控制层"]
    A --> E["物理层"]

    B --> B1["视觉传感器
摄像头/LiDAR"]
    B --> B2["力觉传感器
力矩/触觉"]
    B --> B3["本体感知
关节角度/速度"]

    C --> C1["世界模型
环境建模与预测"]
    C --> C2["VLA 模型
视觉-语言-动作"]
    C --> C3["任务规划
LLM 高级推理"]

    D --> D1["运动控制
关节力矩控制"]
    D --> D2["步态生成
双足/四足行走"]
    D --> D3["抓取操作
灵巧手控制"]

    E --> E1["人形机器人
Figure 02 / Optimus"]
    E --> E2["四足机器人
Spot / Go2"]
    E --> E3["机械臂
Franka / UR"]`,
    },
    {
      title: "第一层：具身智能的感知系统",
      body: `具身智能的第一步是「感知」——理解自己所处的环境。这与纯软件 AI 的「读取数据」有本质区别：机器人必须从多模态传感器中实时重建对环境的理解。

1. 视觉感知

视觉是具身智能最重要的感知模态：

- RGB 摄像头：提供颜色和纹理信息，成本低但深度信息缺失
- 深度相机（RGB-D）：Intel RealSense、**Azure** Kinect 等，直接获取深度信息
- LiDAR：激光雷达，精确的 3D 点云，但成本高、体积大
- 事件相机（Event Camera）：只在像素亮度变化时输出信号，极低延迟、高动态范围

2. 力觉与触觉感知

这是具身智能区别于纯视觉 AI 的关键：

- 六维力/力矩传感器：安装在机械臂末端，感知接触力和力矩
- 触觉传感器阵列：分布在机器人手指或皮肤上，感知压力分布
- 关节力矩传感器：每个关节内置力矩传感器，实现阻抗控制

3. 本体感知（Proprioception）

机器人对自己身体状态的感知：

- 关节编码器：精确测量每个关节的角度和角速度
- IMU（惯性测量单元）：感知机器人的姿态和加速度
- 电流传感器：通过电机电流间接估计力矩

4. 多模态融合

单一传感器不足以支撑复杂的具身智能任务。2026 年的主流方法是多模态融合：

- 早期融合：在输入层拼接不同模态的特征（如 RGB + 深度 + 力觉）
- 晚期融合：各模态独立处理后融合决策结果
- 交叉注意力融合：使用 Transformer 的交叉注意力机制动态加权不同模态

Figure 02 的感知系统就融合了 RGB 摄像头、深度相机、力觉传感器和关节编码器，在 30Hz 的循环频率下完成感知-决策-控制的闭环。`,
      code: [
        {
          lang: "python",
          code: `# 多模态感知融合示例
import torch
import torch.nn as nn
from typing import Dict, Tuple

class MultimodalPerception(nn.Module):
    """具身智能的多模态感知融合模块"""
    
    def __init__(self, rgb_dim: int = 512, depth_dim: int = 256,
                 force_dim: int = 128, proprio_dim: int = 64,
                 fusion_dim: int = 512):
        super().__init__()
        
        # 各模态的编码器
        self.rgb_encoder = nn.Sequential(
            nn.Linear(rgb_dim, fusion_dim),
            nn.LayerNorm(fusion_dim),
            nn.GELU(),
        )
        self.depth_encoder = nn.Sequential(
            nn.Linear(depth_dim, fusion_dim),
            nn.LayerNorm(fusion_dim),
            nn.GELU(),
        )
        self.force_encoder = nn.Sequential(
            nn.Linear(force_dim, fusion_dim),
            nn.LayerNorm(fusion_dim),
            nn.GELU(),
        )
        self.proprio_encoder = nn.Sequential(
            nn.Linear(proprio_dim, fusion_dim),
            nn.LayerNorm(fusion_dim),
            nn.GELU(),
        )
        
        # 交叉注意力融合
        self.cross_attention = nn.MultiheadAttention(
            embed_dim=fusion_dim,
            num_heads=8,
            batch_first=True,
        )
        self.fusion_mlp = nn.Sequential(
            nn.Linear(fusion_dim, fusion_dim * 2),
            nn.GELU(),
            nn.Linear(fusion_dim * 2, fusion_dim),
        )
    
    def forward(self, observations: Dict[str, torch.Tensor]) -> torch.Tensor:
        """
        observations: {
            'rgb': (B, rgb_dim),
            'depth': (B, depth_dim),
            'force': (B, force_dim),
            'proprio': (B, proprio_dim),
        }
        """
        # 各模态编码
        rgb_feat = self.rgb_encoder(observations['rgb'])      # (B, D)
        depth_feat = self.depth_encoder(observations['depth']) # (B, D)
        force_feat = self.force_encoder(observations['force']) # (B, D)
        proprio_feat = self.proprio_encoder(observations['proprio'])  # (B, D)
        
        # 拼接为序列: (B, 4, D)
        features = torch.stack([rgb_feat, depth_feat, force_feat, proprio_feat], dim=1)
        
        # 交叉注意力融合（以 RGB 为 query）
        query = rgb_feat.unsqueeze(1)  # (B, 1, D)
        attended, _ = self.cross_attention(query, features, features)
        
        # 融合输出
        fused = self.fusion_mlp(attended.squeeze(1))  # (B, D)
        return fused`,
        },
      ],
    },
    {
      title: "第二层：世界模型（World Models）",
      body: `世界模型是具身智能的「大脑」——它让机器人在内部构建环境的物理模型，能够预测「如果我做 X，环境会变成什么样」。这是具身智能从「被动反应」走向「主动规划」的关键。

世界模型的核心能力：

1. 环境状态编码

将高维的传感器输入（图像、点云等）压缩为低维的隐状态表示：

- VAE（变分自编码器）：学习环境的概率隐表示
- 对比学习：通过对比正负样本学习鲁棒的状态表示
- 多模态对齐：将视觉、力觉等不同模态映射到统一的状态空间

2. 动态预测

给定当前状态和动作，预测下一时刻的状态：

- RNN/LSTM 建模：经典的时间序列预测方法
- **Transformer** 建模：用注意力机制捕获长程依赖
- 扩散模型建模：2026 年新趋势，用扩散模型生成可能的未来状态分布

3. 奖励/价值预测

预测在某个状态下执行某个动作的预期回报：

- 学习到的价值函数可以替代手工设计的奖励函数
- 支持「零样本」任务执行：只需语言描述目标，模型自动评估动作价值

Google **Gemini** Robotics-ER 1.6 的世界模型：

2026 年 4 月发布的 **Gemini** Robotics-ER 1.6 代表了世界模型的最新水平：

- 双模型架构：ER 1.6 负责高层推理（环境理解、任务分解），Robotics 1.5 负责底层执行（关节控制、步态生成）
- 仪器读取能力：能理解压力表、液位计等工业仪器的物理状态，这是传统机器人做不到的
- 空间推理增强：精准指向目标物体、计数场景中的物品数量
- 多视角理解：从不同视角观察同一场景，构建一致的 3D 理解
- 任务成功检测：自主判断任务是否完成，无需外部确认

世界模型的训练方式：

1. 自监督学习：让模型预测视频的下一帧，无需人工标注
2. 互动学习：机器人在环境中随机探索，记录 (状态, 动作, 新状态) 三元组
3. 仿真预训练 + 真实微调：先在仿真中训练世界模型，再用真实数据微调`,
      mermaid: `graph LR
    A["当前观测 s_t"] --> B["状态编码器"]
    B --> C["隐状态 z_t"]
    
    D["动作 a_t"] --> E["动态模型"]
    C --> E
    
    E --> F["预测隐状态 z_{t+1}"]
    F --> G["状态解码器"]
    G --> H["预测观测 o_{t+1}"]
    
    C --> I["价值函数 V(z_t)"]
    F --> J["奖励预测 R(z_t, a_t)"]
    
    subgraph "世界模型核心组件"
    B
    E
    G
    I
    J
    end`,
      code: [
        {
          lang: "python",
          code: `# 简化的世界模型实现
import torch
import torch.nn as nn
import torch.distributions as dist

class RSSM(nn.Module):
    """Recurrent State Space Model - 经典世界模型架构
    出自: Hafner et al., "Learning Latent Dynamics for Planning from Pixels"
    """
    
    def __init__(self, obs_dim: int = 64, action_dim: int = 10,
                 state_dim: int = 30, deterministic_dim: int = 200,
                 stochastic_dim: int = 30):
        super().__init__()
        self.state_dim = state_dim
        
        # GRU 核心（确定性状态转移）
        self.gru = nn.GRUCell(deterministic_dim, deterministic_dim)
        
        # 随机状态的后验编码器（观测 + 确定性状态 → 随机状态）
        self.posterior_encoder = nn.Sequential(
            nn.Linear(obs_dim + deterministic_dim, 128),
            nn.ELU(),
            nn.Linear(128, stochastic_dim * 2),  # mean, std
        )
        
        # 随机状态的先验（上一状态 + 动作 → 随机状态）
        self.prior_encoder = nn.Sequential(
            nn.Linear(state_dim + action_dim, 128),
            nn.ELU(),
            nn.Linear(128, stochastic_dim * 2),
        )
        
        # 观测解码器（状态 → 重建观测）
        self.obs_decoder = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ELU(),
            nn.Linear(128, obs_dim),
        )
        
        # 奖励预测
        self.reward_predictor = nn.Sequential(
            nn.Linear(state_dim + action_dim, 64),
            nn.ELU(),
            nn.Linear(64, 1),
        )
    
    def forward(self, observations: torch.Tensor, 
                actions: torch.Tensor) -> dict:
        """
        observations: (T, B, obs_dim)
        actions: (T, B, action_dim)
        """
        T, B, _ = observations.shape
        h = torch.zeros(B, 200)  # GRU 隐状态
        states = []
        posteriors = []
        priors = []
        
        for t in range(T):
            # 后验编码（有观测时）
            z_post = self._posterior(observations[t], h)
            
            # 先验预测（无观测时也可用）
            if t > 0:
                z_prior = self._prior(states[-1], actions[t-1])
                priors.append(z_prior)
            
            states.append(z_post)
            posteriors.append(z_post)
            
            # 更新 GRU
            concat = torch.cat([z_post, actions[t]], dim=-1)
            h = self.gru(concat, h)
        
        return {
            "states": torch.stack(states),
            "posteriors": posteriors,
            "priors": priors if priors else None,
        }
    
    def _posterior(self, obs: torch.Tensor, h: torch.Tensor) -> torch.Tensor:
        inp = torch.cat([obs, h], dim=-1)
        mean, logstd = self.posterior_encoder(inp).chunk(2, dim=-1)
        return dist.Normal(mean, torch.exp(logstd)).rsample()
    
    def _prior(self, prev_state: torch.Tensor, action: torch.Tensor) -> torch.Tensor:
        inp = torch.cat([prev_state, action], dim=-1)
        mean, logstd = self.prior_encoder(inp).chunk(2, dim=-1)
        return dist.Normal(mean, torch.exp(logstd)).rsample()`,
        },
      ],
    },
    {
      title: "第三层：视觉-语言-动作（VLA）模型",
      body: `VLA（Vision-Language-Action）模型是 2026 年具身智能最热门的技术方向。它将视觉理解、语言推理和动作生成统一到一个端到端模型中——你给它一张图片和一条语言指令，它直接输出机器人的关节力矩或末端位姿。

VLA 的架构演进：

1. RT-2（Google, 2023）—— VLA 的开山之作

RT-2（Robotic **Transformer** 2）首次证明了预训练 VLM（视觉-语言模型）可以直接输出机器人动作：

- 基于 **PaLM**-E 架构，将机器人动作表示为文本 token
- 训练数据：互联网规模的图像-文本数据 + 机器人演示数据
- 关键发现：VLM 的泛化能力可以迁移到机器人控制
- 局限：动作粒度不够精细，对力觉敏感任务表现差

2. OpenVLA（2024-2025）—— 开源 VLA 标杆

- 基于开源 LLaVA 架构
- 7B 参数，单 GPU 可推理
- 在 Open X-Embodiment 数据集上训练，支持 50+ 种机器人
- 社区贡献了微调版本，适配各种机器人平台

3. Figure 02 的 VLA 系统（2026）

Figure 02 的 VLA 系统是 2026 年最先进的具身智能系统之一：

- 开放词汇理解：能理解训练中未见过的物体和指令
- 多任务泛化：同一模型执行分拣、装配、搬运等多种任务
- 自然语言交互：人类可以用日常语言与机器人对话式交互
- 实时控制：50Hz 控制频率，满足工业场景的实时性要求

4. 2026 年 VLA 新趋势

- 多模态 VLA：融合视觉、力觉、听觉等多模态输入
- 分层 VLA：高层 LLM 负责任务分解，底层 VLA 负责动作执行
- 持续学习 VLA：在真实环境中持续学习新技能，不遗忘旧技能
- 安全约束 VLA：在动作输出层加入安全约束，防止危险动作`,
      table: {
        headers: ["VLA 模型", "参数量", "训练数据", "支持的机器人", "核心特点"],
        rows: [
          ["RT-2 (Google)", "55B", "互联网 + 机器人数据", "单臂机器人", "首创 VLA 范式"],
          ["OpenVLA", "7B", "Open X-Embodiment", "50+ 种机器人", "开源、单 GPU 推理"],
          ["Figure 02 VLA", "未公开", "自有工厂数据", "Figure 02 人形", "工业部署、开放词汇"],
          ["π₀ (Physical Intelligence)", "未公开", "大规模机器人数据", "多平台", "流匹配动作生成"],
          ["Gemini Robotics", "未公开", "多模态机器人数据", "Spot + 机械臂", "双模型架构"],
        ],
      },
      code: [
        {
          lang: "python",
          code: `# VLA 模型推理示例（基于 OpenVLA 风格）
import torch
from transformers import AutoModelForVision2Seq, AutoProcessor
from PIL import Image
import numpy as np

class VLAPolicy:
    """简化的 VLA 策略模型"""
    
    def __init__(self, model_name: str = "openvla/openvla-7b"):
        self.processor = AutoProcessor.from_pretrained(model_name)
        self.model = AutoModelForVision2Seq.from_pretrained(
            model_name,
            torch_dtype=torch.bfloat16,
            device_map="auto",
        )
    
    def predict_action(self, image: Image.Image, 
                       instruction: str,
                       state: np.ndarray = None) -> np.ndarray:
        """
        给定图像和语言指令，预测机器人动作
        
        Args:
            image: 当前相机观测
            instruction: 自然语言任务指令，如"拿起红色方块"
            state: 可选的机器人本体状态（关节角度等）
        
        Returns:
            action: 7 维动作向量 [x, y, z, roll, pitch, yaw, gripper]
        """
        # 构建提示词
        prompt = f"In: What action should the robot take to execute: '{instruction}'?\nOut:"
        
        # 处理输入
        inputs = self.processor(
            text=prompt,
            images=image,
            return_tensors="pt",
        ).to(self.model.device)
        
        # 自回归生成动作 token
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=32,
            do_sample=False,
        )
        
        # 解码动作 token 为连续动作向量
        action_tokens = outputs[:, -7:]  # 取最后 7 个 token
        action = self._decode_tokens(action_tokens)
        return action
    
    def _decode_tokens(self, tokens: torch.Tensor) -> np.ndarray:
        """将离散的 action token 解码为连续动作值"""
        # OpenVLA 将每个动作维度离散化为 256 个 bin
        # 需要反归一化到实际动作范围
        action = (tokens.float() / 255.0) * 2.0 - 1.0  # [-1, 1]
        return action.squeeze().cpu().numpy()

# 使用示例
# policy = VLAPolicy()
# image = Image.open("robot_camera_view.jpg")
# action = policy.predict_action(image, "把杯子放到桌子上")
# robot.execute_action(action)`,
        },
      ],
    },
    {
      title: "第四层：Sim-to-Real 迁移",
      body: `Sim-to-Real 迁移是具身智能最核心的挑战之一——如何在仿真环境中训练出能在真实世界中工作的策略。真实机器人训练成本极高（时间、硬件损耗、安全风险），仿真提供了低成本、高并发的训练环境，但仿真与现实之间存在「Reality Gap」。

Reality Gap 的来源：

1. 物理引擎不精确：摩擦力、碰撞、变形等物理参数难以精确建模
2. 传感器噪声：真实传感器的噪声模式很难在仿真中复现
3. 视觉域差异：仿真渲染的图像与真实相机图像存在域差异
4. 未建模动态：线缆、流体、软体等复杂动态难以仿真

主流的 Sim-to-Real 方法：

1. 域随机化（Domain Randomization）

在仿真中随机化各种参数（纹理、光照、物理参数），让策略在「所有可能的现实」上都能工作：

- 视觉域随机化：随机化纹理、光照、相机参数
- 物理域随机化：随机化摩擦系数、质量、关节阻尼
- 核心思想：如果策略能在足够多样的仿真环境中工作，它也能在真实环境中工作

2. 域适应（Domain Adaptation）

在仿真中训练，在真实数据上适应：

- 对抗式域适应：训练一个域分类器，让特征提取器学习域不变的表示
- 风格迁移：将仿真图像的风格迁移到真实图像风格
- 对比学习：学习仿真和真实图像的共同表示

3. 系统辨识（System Identification）

用真实数据校准仿真参数：

- 在真实机器人上采集数据（关节角度、力矩、运动轨迹）
- 优化仿真参数使仿真输出与真实数据最匹配
- 在标定后的仿真中训练策略

4. 在线适应（Online Adaptation）

策略在真实环境中持续微调：

- 先在仿真中预训练策略
- 部署到真实机器人后，用少量真实交互数据微调
- 关键挑战：样本效率（真实交互成本高）和安全约束

2026 年的新进展：

- Genesis 仿真平台（MIT + 多机构）：新一代机器人仿真器，支持可微物理、GPU 加速、大规模并行
- Isaac Gym / Isaac Lab（**NVIDIA**）：GPU 加速的物理仿真，支持数千个仿真环境并行训练
- 强化学习 + 世界模型：先在仿真中学习世界模型，再用世界模型在真实环境中做规划

Sim-to-Real 成功的关键原则：

1. 仿真越真实越好，但不是越复杂越好：在关键物理参数上精确，在不重要的细节上可以简化
2. 随机化范围要覆盖真实场景：如果真实场景的某个参数范围不在随机化范围内，迁移必然失败
3. 逐步缩小 gap：先在仿真中训练基础技能，再用真实数据微调高级技能
4. 安全优先：Sim-to-Real 迁移的第一步必须加严格的安全约束`,
      mermaid: `graph TD
    A["仿真环境训练"] --> B["域随机化"]
    A --> C["域适应"]
    A --> D["系统辨识"]

    B --> B1["随机化纹理/光照"]
    B --> B2["随机化物理参数"]
    B --> B3["随机化传感器噪声"]

    C --> C1["对抗式域适应"]
    C --> C2["风格迁移"]
    C --> C3["对比学习"]

    D --> D1["采集真实数据"]
    D --> D2["优化仿真参数"]
    D --> D3["标定仿真模型"]

    B --> E["仿真策略"]
    C --> E
    D --> E

    E --> F{"Reality Gap < 阈值?"}
    F -->|是| G["部署到真实机器人"]
    F -->|否| H["在线适应微调"]
    H --> I["真实数据微调"]
    I --> E

    G --> J["持续学习"]
    J --> K["技能库扩展"]`,
    },
    {
      title: "第五层：人形机器人平台",
      body: `人形机器人是具身智能最受关注的物理平台。双足行走、双手操作、类人形态——这些特性让「具身智能」的研究成果能够最直接地服务于人类的生活和工作环境（楼梯、门把手、工具等都是为人类设计的）。

主流人形机器人平台对比：

1. Figure 02（Figure AI）

- 自由度：全身 40+ 自由度
- 手部：灵巧手，支持精细操作
- 感知：RGB-D 摄像头 + 力觉传感器 + 本体感知
- AI 系统：自研 VLA 模型，支持开放词汇自然语言指令
- 部署场景：BMW 汽车工厂装配线
- 特点：2026 年唯一进入真实工厂部署的人形机器人

2. Tesla Optimus Gen 3

- 自由度：全身约 40 自由度
- 手部：5 指灵巧手
- 感知：Tesla 自研视觉系统（复用 FSD 摄像头技术）
- AI 系统：基于 Tesla FSD 芯片和 Dojo 超算训练
- 部署场景：Tesla 仓库分拣、搬运
- 特点：成本目标 2 万美元以下，规模化潜力最大

3. Unitree H2（宇树科技）

- 自由度：全身 43 自由度
- 行走速度：最高 3.3 m/s（人形机器人世界纪录）
- 感知：3D LiDAR + RGB-D 摄像头
- 部署场景：科研、工业巡检
- 特点：中国最快的人形机器人，性价比高

4. Agility Robotics Digit

- 自由度：全身约 30 自由度
- 手部：简化版夹爪（非灵巧手）
- 部署场景：Amazon 仓库包裹分拣
- 特点：专注于物流场景，不追求类人外观

人形机器人的核心技术挑战：

| 挑战 | 难度 | 现状 | 解决方案方向 |
|------|------|------|-------------|
| 双足行走 | ⭐⭐⭐⭐⭐ | 已解决（静态环境） | RL + 阻抗控制 |
| 动态平衡 | ⭐⭐⭐⭐⭐ | 部分解决 | 全身控制 + MPC |
| 灵巧操作 | ⭐⭐⭐⭐⭐ | 早期阶段 | VLA + 触觉反馈 |
| 安全交互 | ⭐⭐⭐⭐ | 发展中 | 力矩限制 + 碰撞检测 |
| 长时序任务 | ⭐⭐⭐⭐ | 发展中 | LLM 任务分解 + 世界模型 |
| 能源管理 | ⭐⭐⭐ | 发展中 | 高效驱动器 + 能量回收 |
| 成本控制 | ⭐⭐⭐ | 快速进步 | 规模化生产 + 国产替代 |`,
    },
    {
      title: "动手实践：搭建你的第一个具身智能仿真环境",
      body: `让我们用 MuJoCo 搭建一个简单的机械臂抓取仿真环境，并训练一个强化学习策略。

环境搭建：

MuJoCo 是目前最流行的机器人物理仿真器，支持精确的物理模拟和 GPU 加速。`,
      code: [
        {
          lang: "python",
          code: `"""
具身智能入门：MuJoCo 机械臂抓取仿真
训练一个 RL 策略让机械臂抓取目标物体
"""
import mujoco
import mujoco_viewer
import numpy as np
from collections import deque

class RobotArmEnv:
    """简化的机械臂抓取环境"""
    
    def __init__(self, xml_path: str = "robot_arm.xml"):
        self.model = mujoco.MjModel.from_xml_path(xml_path)
        self.data = mujoco.MjData(self.model)
        self.viewer = None
        
        # 环境配置
        self.max_steps = 200
        self.action_scale = 0.05  # 动作幅度（米）
        
        # 状态历史（用于时间信息）
        self.state_history = deque(maxlen=4)
    
    def reset(self) -> np.ndarray:
        """重置环境"""
        mujoco.mj_resetData(self.model, self.data)
        
        # 随机化目标物体位置
        target_pos = self.data.geom("target").pos
        target_pos[:2] += np.random.uniform(-0.1, 0.1, 2)
        self.data.geom("target").pos = target_pos
        
        # 随机化初始关节角度
        self.data.qpos[:7] = np.random.uniform(
            self.model.jnt_range[:7, 0],
            self.model.jnt_range[:7, 1],
        )
        mujoco.mj_forward(self.model, self.data)
        
        self.state_history.clear()
        self.step_count = 0
        
        return self._get_observation()
    
    def step(self, action: np.ndarray) -> tuple:
        """执行一步动作"""
        # 动作空间：7 维 [dx, dy, dz, droll, dpitch, dyaw, gripper]
        clipped_action = np.clip(action, -1, 1) * self.action_scale
        
        # 设置关节速度目标
        self.data.ctrl[:6] = self.data.qpos[3:9] + clipped_action[:6]
        self.data.ctrl[6] = clipped_action[6]  # 夹爪开合
        
        # 物理步进
        mujoco.mj_step(self.model, self.data)
        self.step_count += 1
        
        # 计算奖励
        reward = self._compute_reward()
        done = self.step_count >= self.max_steps
        truncated = False
        
        return self._get_observation(), reward, done, truncated, {}
    
    def _get_observation(self) -> np.ndarray:
        """获取观测：关节状态 + 末端位置 + 目标位置"""
        qpos = self.data.qpos[:7]  # 关节角度
        qvel = self.data.qvel[:6]  # 关节速度
        end_effector = self.data.body("end_effector").xpos[:3]
        target_pos = self.data.geom("target").pos[:3]
        
        obs = np.concatenate([qpos, qvel, end_effector, target_pos])
        self.state_history.append(obs)
        
        # 拼接历史观测（提供时间信息）
        while len(self.state_history) < 4:
            self.state_history.append(np.zeros_like(obs))
        
        return np.concatenate(list(self.state_history))
    
    def _compute_reward(self) -> float:
        """奖励函数设计"""
        end_effector = self.data.body("end_effector").xpos[:3]
        target_pos = self.data.geom("target").pos[:3]
        
        # 距离奖励（负距离）
        distance = np.linalg.norm(end_effector - target_pos)
        dist_reward = -distance
        
        # 成功抓取奖励
        gripper_pos = self.data.ctrl[6]
        if distance < 0.02 and gripper_pos < 0:  # 靠近且夹爪闭合
            return 100.0
        
        return dist_reward

# RL 训练（简化的 SAC 算法）
from stable_baselines3 import SAC
from stable_baselines3.common.env_util import make_vec_env

def train_robot_arm():
    env = make_vec_env(lambda: RobotArmEnv(), n_envs=4)
    
    model = SAC(
        "MultiInputPolicy",
        env,
        learning_rate=3e-4,
        buffer_size=100000,
        batch_size=256,
        gamma=0.99,
        verbose=1,
    )
    
    model.learn(total_timesteps=500000)
    model.save("robot_arm_sac")
    return model

# 训练完成后部署
# model = SAC.load("robot_arm_sac")
# env = RobotArmEnv()
# obs = env.reset()
# for _ in range(200):
#     action, _ = model.predict(obs, deterministic=True)
#     obs, reward, done, _, _ = env.step(action)
#     if done:
#         break`,
        },
      ],
      tip: "推荐使用 Isaac Lab（NVIDIA）或 Genesis（MIT）作为新一代仿真平台，它们支持 GPU 加速的大规模并行训练，训练速度比 MuJoCo 快 10-100 倍。",
    },
    {
      title: "2026 年具身智能工具与框架生态",
      body: `2026 年的具身智能工具生态已经形成了完整的链条，从仿真、训练到部署。

仿真平台：

| 平台 | 开发者 | 物理引擎 | GPU 加速 | 特点 |
|------|--------|---------|---------|------|
| MuJoCo | Google | 自研 | 部分 | 精确物理模拟，机器人研究标准 |
| Isaac Lab | **NVIDIA** | PhysX | ✅ 全面 | 大规模并行，数千环境同时训练 |
| Genesis | MIT 等 | 自研可微 | ✅ 全面 | 可微物理，支持优化 |
| Habitat | Meta | Bullet | ✅ | 室内场景仿真，导航任务 |
| SAPIEN | UCSD | PhysX | ✅ | 强调交互和可操作性 |

训练框架：

| 框架 | 类型 | 特点 |
|------|------|------|
| RLlib | 强化学习 | 大规模分布式 RL 训练 |
| Stable Baselines3 | 强化学习 | 简单易用，适合入门 |
| OpenVLA | VLA 模型 | 开源 VLA，7B 参数 |
| LeRobot | **HuggingFace** | 机器人学习的数据集和模型 |
| Robomimic | 模仿学习 | 从人类演示中学习策略 |

数据集：

| 数据集 | 规模 | 内容 |
|--------|------|------|
| Open X-Embodiment | 100 万+ 轨迹 | 50+ 种机器人的多任务演示 |
| DROID | 5 万+ 轨迹 | 真实环境中的双臂操作数据 |
| Bridge V2 | 8 万+ 轨迹 | 厨房场景的抓取和操作 |
| ALOHA | 数千 轨迹 | 精密操作（折纸、插花等） |`,
      mermaid: `graph TD
    A["具身智能开发流程"] --> B["仿真环境搭建"]
    B --> C["策略训练"]
    C --> D["Sim-to-Real 迁移"]
    D --> E["真实部署"]

    B --> B1["MuJoCo / Isaac Lab"]
    B --> B2["定义机器人 URDF"]
    B --> B3["配置传感器和场景"]

    C --> C1["强化学习 SAC/PPO"]
    C --> C2["模仿学习"]
    C --> C3["VLA 微调"]

    D --> D1["域随机化"]
    D --> D2["域适应"]
    D --> D3["在线微调"]

    E --> E1["安全约束层"]
    E --> E2["实时监控"]
    E --> E3["持续学习"]`,
    },
    {
      title: "总结与展望",
      body: `具身智能正在从实验室走向真实世界，2026 年是一个关键的转折年。

技术趋势：
1. VLA 模型成为标准架构：视觉-语言-动作的统一建模正在取代传统的「感知 → 规划 → 控制」管道
2. 世界模型从辅助变为核心：不再只是预测下一帧，而是支撑推理、规划和安全评估的基础设施
3. Sim-to-Real gap 持续缩小：可微物理仿真和域随机化的进步让迁移成功率大幅提高
4. 人形机器人进入工业场景：Figure 02 在 BMW 工厂的部署是标志性事件
5. 大模型赋能机器人：LLM 提供高级任务理解和分解，与底层策略模型形成分层架构

待解决挑战：
1. 安全性：真实环境中的安全保障仍不完善，需要形式化验证
2. 长时序任务：超过 100 步的复杂任务成功率仍然很低
3. 泛化能力：在新环境、新物体上的表现需要提升
4. 成本和可及性：人形机器人价格仍然高昂，限制了研究和应用
5. 评估基准：缺乏统一的具身智能评估基准，难以比较不同方法

学习建议：
- 入门：从 MuJoCo + RL 开始，训练简单的机械臂抓取任务
- 进阶：学习 OpenVLA，在 Open X-Embodiment 数据集上微调 VLA 模型
- 高级：参与 Isaac Lab 或 Genesis 仿真平台的开发，推动 Sim-to-Real 迁移

具身智能的终极目标是创造出能在人类环境中自主工作的通用机器人。这个目标还很遥远，但 2026 年的进展让我们看到了清晰的技术路径。`,
      warning: "具身智能涉及真实物理系统，在真实机器人上运行未经充分验证的策略可能导致硬件损坏或人身伤害。务必在仿真中充分测试，并在真实环境中加入安全约束（力矩限制、速度限制、碰撞检测）。",
    },
  ],
};
