import { Article } from '../knowledge';

export const article: Article = {
    id: "ml-023",
    title: "世界模型与持续学习：AI 的下一个前沿",
    category: "ml",
    tags: ["世界模型", "持续学习", "AGI", "Genie", "记忆架构"],
    summary: "从 DeepMind Genie 3 到持续学习原型，探索让世界模型与记忆架构结合实现真正持续学习的 AI 系统",
    date: "2026-04-13",
    readTime: "22 min",
    level: "高级",
    content: [
        {
            title: "Introduction and Overview",
            body: `The field of artificial intelligence is undergoing a fundamental transition. After years dominated by the scaling paradigm, where capability gains came primarily from building larger models on larger datasets, researchers and industry leaders are converging on a new frontier: world models combined with continual learning. This shift was prominently highlighted in early 2026 by DeepMind CEO Demis Hassabis and echoed across leading AI labs worldwide.

World models are internal representations of how the world works. Unlike language models that predict the next token, world models learn the underlying dynamics of environments, enabling agents to simulate outcomes before acting. When combined with continual learning, the ability to acquire new knowledge over time without forgetting previously learned skills, these systems represent a qualitatively different class of AI.

The significance of this direction lies in its potential to address fundamental limitations of current AI. Language models are static after training, cannot learn from new experiences in deployment, and lack genuine understanding of physical causality. World models with continual learning aim to solve all three problems simultaneously. This article explores the theory, architecture, and practical implementation of these emerging systems.`,
            mermaid: `graph TD
    A["Static LLMs"] --> B["Limitation: No post-training learning"]
    A --> C["Limitation: No physical understanding"]
    A --> D["Limitation: No memory across sessions"]
    B --> E["Continual Learning"]
    C --> F["World Models"]
    D --> G["Memory Architectures"]
    E --> H["Continuously Learning Agent"]
    F --> H
    G --> H
            `,
        },
        {
            title: "Historical Background and Evolution",
            body: `The concept of world models in AI dates back to Kenneth Craik's 1943 book "The Nature of Explanation," which proposed that the mind constructs small-scale models of reality to anticipate events. In machine learning, Yann LeCun championed world models as a path to human-level AI, arguing that understanding the physical world through prediction is more fundamental than language understanding.

The timeline of world model development has accelerated dramatically. Early work like Ha and Schmidhuber's World Models (2018) demonstrated that a simple variational autoencoder plus recurrent network could learn to navigate a car racing game in a learned latent space. DeepMind's Genie (2024) took a major leap by training a foundation world model on unlabeled video data, producing a model that could generate interactive 2D environments from text prompts.

Genie 2 (late 2024) extended this to 3D environments with action-controllable simulation, demonstrating that the model learned genuine physics and spatial reasoning without explicit supervision. Genie 3, announced in early 2026, further scaled this approach to produce photorealistic interactive environments with persistent world states.

Parallel developments in continual learning addressed the complementary challenge. Catastrophic forgetting, where neural networks overwrite previous knowledge when learning new tasks, was identified as early as 1989. Recent breakthroughs include memory replay architectures (like DeepMind's Titans), which maintain a separate long-term memory module, and elastic weight consolidation methods that protect important weights during new learning.

The convergence of these two lines of research, world models for understanding and continual learning for adaptation, defines the cutting edge of AI in 2026. Leading researchers including Hassabis, Altman, Amodei, Karpathy, and Dean have all emphasized this direction as the most promising path toward more capable and robust AI systems.`,
        },
        {
            title: "Core Principles and Architecture",
            body: `A complete world model with continual learning system comprises several interconnected components. Understanding each component and their interactions is essential for building effective systems.

The world model component learns a compressed latent representation of the environment's state and dynamics. Modern approaches use a combination of variational autoencoders for state encoding, diffusion models for state prediction, and transformer architectures for temporal modeling. The key insight is that the model should learn not just to predict raw pixels, but to predict in a structured latent space where the underlying physics and causal relationships are more easily captured.

The continual learning component manages the acquisition of new knowledge over time. Three primary strategies have emerged. Replay-based methods store a subset of past experiences and periodically replay them during training on new tasks, preventing catastrophic forgetting. Regularization-based methods identify important parameters for previous tasks and penalize their modification during new learning. Architecture-based methods dynamically grow the network or allocate separate sub-networks for different tasks.

Memory architectures bridge these two components. Recent work distinguishes between working memory (short-term context within a single episode), episodic memory (stored experiences for replay), and semantic memory (consolidated knowledge abstracted across experiences). The Titans architecture implements this hierarchy explicitly, with separate neural modules for each memory type.

The planning and reasoning layer operates on top of the world model. Instead of acting purely reactively, the agent can simulate potential action sequences in its learned world model and select the sequence with the best predicted outcome. This is the essence of model-based reinforcement learning, where the world model serves as an internal simulator for planning.

Test-time training has emerged as a crucial mechanism for continual learning in deployed systems. Unlike traditional fine-tuning, which requires labeled data and careful hyperparameter tuning, test-time training adapts the model using only the inference stream. Techniques include self-supervised prediction losses on incoming data, entropy minimization for confident predictions, and contrastive learning against stored memories.`,
            code: [
                {
                    lang: "python",
                    code: `# Simplified world model with continual learning
import torch
import torch.nn as nn
import torch.nn.functional as F

class WorldModel(nn.Module):
    """A basic world model with VAE encoder and dynamics predictor."""

    def __init__(self, latent_dim=64, hidden_dim=256, action_dim=4):
        super().__init__()
        # Encoder: observation -> latent state
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 32, 4, stride=2),
            nn.ReLU(),
            nn.Conv2d(32, 64, 4, stride=2),
            nn.ReLU(),
            nn.Flatten(),
            nn.Linear(64 * 14 * 14, 2 * latent_dim),  # mu and log_var
        )
        # Decoder: latent state -> observation reconstruction
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 64 * 14 * 14),
            nn.Unflatten(1, (64, 14, 14)),
            nn.ConvTranspose2d(64, 32, 4, stride=2),
            nn.ReLU(),
            nn.ConvTranspose2d(32, 3, 4, stride=2),
            nn.Sigmoid(),
        )
        # Dynamics: (latent, action) -> next latent
        self.dynamics = nn.Sequential(
            nn.Linear(latent_dim + action_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, latent_dim),
        )
        # Reward predictor
        self.reward_head = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1),
        )

    def encode(self, obs):
        params = self.encoder(obs)
        mu, log_var = params.chunk(2, dim=-1)
        std = torch.exp(0.5 * log_var)
        z = mu + std * torch.randn_like(std)
        return z, mu, log_var

    def predict_next(self, z, action):
        return self.dynamics(torch.cat([z, action], dim=-1))

    def decode(self, z):
        return self.decoder(z)

    def forward(self, obs, action):
        z, mu, log_var = self.encode(obs)
        z_next = self.predict_next(z, action)
        recon = self.decode(z_next)
        reward = self.reward_head(z_next)
        return recon, reward, mu, log_var


class EpisodicMemory:
    """Simple episodic memory for experience replay."""

    def __init__(self, capacity=10000):
        self.capacity = capacity
        self.buffer = []
        self.position = 0

    def push(self, experience):
        if len(self.buffer) < self.capacity:
            self.buffer.append(None)
        self.buffer[self.position] = experience
        self.position = (self.position + 1) % self.capacity

    def sample(self, batch_size=32):
        indices = torch.randint(0, len(self.buffer), (batch_size,))
        return [self.buffer[i] for i in indices]

    def __len__(self):
        return len(self.buffer)
`,
                },
            ],
        },
        {
            title: "Practical Implementation Guide",
            body: `Building a world model with continual learning requires careful attention to several practical considerations. This section provides a step-by-step guide from data collection through deployment.

Step 1: Data Collection and Preprocessing. World models require rich, multi-modal observations. For physical domains, this means video streams, sensor readings, and action labels. For language domains, it means sequences of interactions with explicit state transitions. The critical preprocessing step is temporal alignment, ensuring that observations, actions, and outcomes are correctly synchronized. Without this, the model learns spurious correlations.

Step 2: Training the World Model. The training objective typically combines three losses: reconstruction loss (how well the decoder reproduces observations), dynamics prediction loss (how accurately the model predicts the next latent state), and optionally a reward prediction loss. A common weighting is 1.0 for reconstruction, 0.1 for dynamics, and 0.1 for reward. Training proceeds in phases: first train the encoder-decoder pair on static observations, then freeze them and train the dynamics model on sequences, and finally jointly fine-tune all components.

Step 3: Implementing Continual Learning. For deployment scenarios where the model must learn from new experiences, implement a replay buffer with prioritized sampling. Prioritize experiences that are surprising under the current model (high prediction error) but not extreme outliers. This focuses learning on the "zone of proximal development" where the model can actually improve. Set the replay ratio to approximately 1:1 between new experiences and stored memories to balance learning and retention.

Step 4: Planning and Action Selection. Use the trained world model for model-predictive control. For each candidate action sequence, simulate the trajectory in the latent space and evaluate the predicted cumulative reward. Select the action that maximizes this prediction. For computational efficiency, use a limited-horizon search (e.g., depth 5-10) with action discretization.

Step 5: Monitoring and Adaptation. Continuously monitor prediction error as a proxy for world model accuracy. When prediction error exceeds a threshold, trigger focused retraining on recent experiences. Maintain a validation set of held-out experiences to detect catastrophic forgetting: if performance on old experiences degrades by more than 10%, increase the replay ratio.`,
            table: {
                headers: ["Component", "Recommended Approach", "Key Hyperparameter", "Failure Mode"],
                rows: [
                    ["State Encoder", "VAE with beta=0.5", "Latent dimension: 64-256", "Posterior collapse"],
                    ["Dynamics Model", "Transformer + MLP", "Sequence length: 64-256", "Error accumulation"],
                    ["Memory System", "Prioritized replay buffer", "Capacity: 10K-100K", "Memory overflow"],
                    ["Planning", "MPC with CEM", "Horizon: 5-10 steps", "Computation budget"],
                    ["Continual Learning", "EWC + replay", "EWC lambda: 100-1000", "Forgetting vs plasticity"],
                ],
            },
            tip: "Start small: train your world model on a simple domain like CartPole or a 2D grid world before scaling to complex environments. This helps you debug each component in isolation.",
            code: [
                {
                    lang: "python",
                    code: `# Test-Time Training with Elastic Weight Consolidation (EWC)
# EWC 防止持续学习中的灾难性遗忘：对重要参数施加更大的正则化惩罚
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader


class EWC:
    """Elastic Weight Consolidation: 保护重要参数不被覆盖"""

    def __init__(self, model: nn.Module, dataloader: DataLoader, device: str = "cpu"):
        self.model = model
        self.device = device
        # Fisher 信息矩阵的对角线近似（存储在参数平方的梯度期望中）
        self.fisher = {n: torch.zeros_like(p) for n, p in model.named_parameters() if p.requires_grad}
        # 任务结束时的最优参数（作为正则化目标）
        self.optimal_params = {n: p.clone().detach() for n, p in model.named_parameters() if p.requires_grad}
        # 计算 Fisher 信息
        self._compute_fisher(dataloader)

    def _compute_fisher(self, dataloader: DataLoader):
        """通过 empirical Fisher 近似计算参数重要性"""
        self.model.train()
        for n, p in self.fisher.items():
            p.zero_()

        n_samples = 0
        for obs, action in dataloader:
            obs, action = obs.to(self.device), action.to(self.device)
            # 用负 log 似然作为 Fisher 的代理
            _, _, mu, log_var = self.model.encode(obs)
            # VAE 的负 log 似然近似
            recon, _, _, _ = self.model(obs, action)
            nll = nn.MSELoss()(recon, obs)
            
            self.model.zero_grad()
            nll.backward()
            
            for n, p in self.model.named_parameters():
                if p.requires_grad and p.grad is not None:
                    self.fisher[n] += p.grad.pow(2) * obs.size(0)
            n_samples += obs.size(0)

        # 归一化
        for n in self.fisher:
            self.fisher[n] /= n_samples

    def penalty(self) -> torch.Tensor:
        """计算 EWC 正则化惩罚项: Σ (λ/2) * F_i * (θ_i - θ*_i)²"""
        penalty = torch.tensor(0.0, device=self.device)
        for n, p in self.model.named_parameters():
            if p.requires_grad and n in self.fisher:
                penalty += (self.fisher[n] * (p - self.optimal_params[n]).pow(2)).sum()
        return 0.5 * penalty


# 持续学习训练循环示例
def continual_training_loop(world_model, task_dataloaders, ewc_lambda=100.0, epochs=10, device="cpu"):
    """在多任务流上进行持续学习，使用 EWC 防止遗忘
    
    参数:
        world_model: WorldModel 实例
        task_dataloaders: 每个任务的数据加载器列表
        ewc_lambda: EWC 正则化强度（越大越保守）
    """
    optimizer = optim.Adam(world_model.parameters(), lr=1e-3)
    ewc = None  # 第一个任务不需要 EWC

    for task_id, dataloader in enumerate(task_dataloaders):
        print(f"\n=== 训练任务 {task_id + 1} ===")
        
        for epoch in range(epochs):
            total_loss = 0
            for obs, action in dataloader:
                obs, action = obs.to(device), action.to(device)
                recon, reward, mu, log_var = world_model(obs, action)
                
                # 重建损失 + KL 散度
                recon_loss = nn.MSELoss()(recon, obs)
                kl_loss = -0.5 * torch.sum(1 + log_var - mu.pow(2) - log_var.exp())
                model_loss = recon_loss + 0.01 * kl_loss
                
                # EWC 正则化（保护之前任务学到的参数）
                if ewc is not None:
                    ewc_loss = ewc_lambda * ewc.penalty()
                    loss = model_loss + ewc_loss
                else:
                    loss = model_loss
                
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
            
            print(f"  Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(dataloader):.4f}")
        
        # 任务完成后，更新 EWC 保护参数
        ewc = EWC(world_model, dataloader, device)
        print(f"  任务 {task_id + 1} 完成，EWC 已更新")
    
    return world_model`,
                },
            ],
        },
        {
            title: "Current Challenges and Open Problems",
            body: `Despite rapid progress, world models with continual learning face several significant challenges that remain active research areas.

The Reality Gap. World models learned from limited data inevitably diverge from reality, especially in long-horizon predictions. Each prediction step introduces error, and these errors compound exponentially. While techniques like latent space rollouts and uncertainty quantification help, the fundamental problem persists. DeepMind's Genie series has shown that scaling data and compute can narrow this gap, but it remains a critical limitation for real-world deployment.

Catastrophic Forgetting. Even with sophisticated continual learning techniques, some degree of forgetting is inevitable. The trade-off between stability (retaining old knowledge) and plasticity (acquiring new knowledge) is fundamental. Current approaches like elastic weight consolidation and experience replay can mitigate but not eliminate forgetting. Finding the right balance requires careful tuning and often depends on the specific application.

Computational Requirements. Training world models at scale requires enormous computational resources. Genie 3 reportedly used thousands of TPU v5 chips for weeks. Continual learning adds additional overhead through memory storage, replay computation, and periodic consolidation. For most organizations, this makes training world models from scratch infeasible, though fine-tuning pre-trained models is becoming more accessible.

Evaluation Benchmarks. Unlike language models with standardized benchmarks like **MMLU** and GSM8K, world models lack widely accepted evaluation standards. Existing benchmarks like Procgen, Crafter, and MineRL cover limited domains and do not adequately test generalization across environments. The research community is working toward more comprehensive benchmarks, but none have achieved the status of ImageNet for vision or GLUE for NLP.

Safety and Alignment. As world models become more capable, ensuring their safe operation becomes critical. A world model that learns incorrect causal relationships could suggest harmful actions with high confidence. Aligning world model predictions with human values requires additional supervision beyond simple prediction accuracy. This is an active area of research, with approaches including constitutional AI applied to world model outputs and human-in-the-loop verification.`,
        },
        {
            title: "Future Directions and Outlook",
            body: `The trajectory of world model and continual learning research points toward several exciting developments in the near term.

Unified Foundation World Models. By 2027, the research community expects convergence on unified foundation world models that can represent multiple domains simultaneously, similar to how language models represent multiple languages and tasks. These models would combine video, language, audio, and action modalities into a single coherent world representation. DeepMind's trajectory with the Genie series and similar efforts from other labs suggest this is achievable within 1-2 years.

Persistent Memory Across Sessions. Current AI systems lose all context between sessions. Future systems will maintain persistent memories that accumulate over weeks, months, and years of interaction. This requires not just larger memory capacity, but sophisticated memory organization, consolidation, and retrieval mechanisms inspired by human hippocampal-neocortical systems.

Autonomous Self-Improvement. When world models are sufficiently accurate and continual learning is sufficiently stable, systems may enter self-improvement loops where they generate their own training data by exploring their environment and learning from the outcomes. This is the point where AI development transitions from human-directed to autonomous, with profound implications for capability and safety.

Embodied AI and Robotics. World models are the missing link between perception and action in robotics. A robot with a good world model can predict the consequences of its actions before executing them, enabling safer and more efficient learning. Companies like Tesla, Figure, and Boston Dynamics are investing heavily in this direction, and we expect to see significant breakthroughs in robot learning through world model simulation in the next 2-3 years.

AI for Scientific Discovery. World models trained on scientific data could simulate experiments, predict outcomes, and suggest new hypotheses. This application is already showing promise in molecular dynamics simulation, drug discovery, and materials science. The combination of world model simulation with continual learning from experimental feedback could accelerate scientific discovery by orders of magnitude.`,
            list: [
                "Foundation world models: unified multimodal world understanding by 2027",
                "Persistent memory: AI systems that remember and learn across sessions",
                "Self-improvement: autonomous learning loops when accuracy is sufficient",
                "Embodied AI: world models as the bridge from perception to robot action",
                "Scientific AI: simulation-driven hypothesis generation and testing",
            ],
        },
        {
            title: "References and Further Reading",
            body: `The following resources provide deeper technical detail and broader context on world models and continual learning.

Foundational Papers. "World Models" by Ha and Schmidhuber (2018) introduced the concept of learning a world model in latent space. "Mastering Atari with Discrete World Models" by Hafner et al. (2020) demonstrated Dreamer, a model-based RL agent that learns entirely in a learned world model. "Genie: Generative Interactive Environments" by DeepMind (2024) presented the first foundation world model trained on unlabeled video. "Genie 3: Interactive 3D World Models" extended this to controllable 3D environments.

Continual Learning. "Overcoming Catastrophic Forgetting in Neural Networks" by Kirkpatrick et al. (2017) introduced elastic weight consolidation. "Titans: Learning to Memorize at Test Time" by Behrouz et al. (2025) presented a neural memory architecture for continual learning. "Experience Replay for Continual Learning" by Rolnick et al. (2019) analyzed the effectiveness of replay-based approaches.

Planning and Reasoning. "Mastering Chess and Shogi by Self-Play with a General Reinforcement Learning Algorithm" (AlphaZero, Silver et al., 2017) demonstrated the power of model-based planning. "MuZero" (Schrittwieser et al., 2020) combined world model learning with Monte Carlo tree search. "IRIS: Imagination-Driven Reinforcement Learning" (Micheli et al., 2023) showed planning in learned world models for complex environments.

Industry Reports. Demis Hassabis's keynote at NeurIPS 2025 on "The Path to AGI Through World Models and Memory." The MIT Technology Review's "10 Breakthrough Technologies 2026" featured world models and mechanistic interpretability as key technologies. Stanford HAI's 2026 AI Index Report includes a comprehensive analysis of world model progress and deployment readiness.`,
        },
        {
            title: "架构图示",
            mermaid: `graph TD
    subgraph "世界模型架构"
        E1["编码器<br/>Observation → 潜变量"] --> D1["动力学模型<br/>预测下一状态"]
        D1 --> R1["奖励模型<br/>预测奖励信号"]
        D1 --> V1["价值模型<br/>评估状态价值"]
        V1 --> P1["策略模型<br/>选择最优行动"]
    end
    
    subgraph "持续学习循环"
        L1["收集经验"] --> L2["更新世界模型"]
        L2 --> L3["规划行动"]
        L3 --> L4["执行+观察"]
        L4 --> L1
    end
    
    style D1 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style L2 fill:#1e3a5f,stroke:#2563eb,color:#fff`,
        },
    ],
};
