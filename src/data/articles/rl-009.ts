import { Article } from '../knowledge';

export const article: Article = {
    id: "rl-009",
    title: "模仿学习：从行为克隆到逆强化学习",
    category: "rl",
    tags: ["模仿学习", "行为克隆", "逆强化学习", "GAIL", "DAgger"],
    summary: "从专家示范中学习策略，深入理解行为克隆、DAgger、逆强化学习和 GAN 式模仿学习的原理与实战",
    date: "2026-04-13",
    readTime: "22 min",
    level: "高级",
    content: [
        {
            title: "1. 为什么需要模仿学习",
            body: `强化学习的核心假设是环境中存在明确的奖励信号，但现实世界中很多任务难以定义奖励函数。如何教机器人叠衣服？如何训练自动驾驶系统在城市街道中安全行驶？这些任务的奖励函数极难精确设计——你很难用一个数值来量化"叠得好"或"开得安全"。

模仿学习（Imitation Learning, IL）提供了一条替代路径：不通过试错探索来学习，而是观察专家的示范行为，从中推断出策略或奖励函数。这个思路非常自然——人类学习新技能的主要方式就是观察和模仿。你学开车时，教练先示范如何打方向、换挡、刹车，你通过观察和模仿开始驾驶，之后才逐渐通过经验调整自己的操作。

模仿学习有两大分支。行为克隆（Behavioral Cloning）直接将状态到动作的映射视为监督学习问题——给定专家的状态-动作对 (s, a)，学习策略 π(a|s)。逆强化学习（Inverse Reinforcement Learning, IRL）更进一步——从专家行为中反推出奖励函数 R(s, a)，然后使用该奖励函数训练策略。IRL 的优势在于学到的奖励函数可以泛化到训练分布之外的场景，而行为克隆只能在专家见过的状态范围内有效。

模仿学习在自动驾驶、机器人操作、游戏 AI 等领域已经取得了显著成功。Waymo 和 Tesla 的自动驾驶系统大量使用人类驾驶数据训练初始策略，DeepMind 的 AlphaStar 从人类星际争霸回放中学习基础策略，**OpenAI** 的 Dota 2 AI 也使用了人类专家的示范数据。`,
            mermaid: `graph TD
    A["任务需求"] --> B{"有奖励函数?"}
    B -->|"是"| C["强化学习 RL"]
    B -->|"否"| D{"有专家示范?"}
    D -->|"是"| E["模仿学习 IL"]
    D -->|"否"| F["探索+人工设计奖励"]
    E --> G["行为克隆 BC"]
    E --> H["逆强化学习 IRL"]
    G --> I["监督学习: (s,a) 配对"]
    H --> J["推断奖励函数 R(s,a)"]
            `,
            tip: "当你能获取专家数据但难以定义奖励函数时，模仿学习是最直接的路径。",
        },
        {
            title: "2. 行为克隆：监督学习视角",
            body: `行为克隆是最直接的模仿学习方法。其核心思想非常简单：收集专家在状态 s 下执行动作 a 的轨迹数据，然后将其视为标准的监督学习问题——学习一个策略网络 π_θ(a|s)，使得在给定状态 s 时，模型输出的动作尽可能接近专家动作。

形式化地，给定专家数据集 D = {(s_i, a_i)}，行为克隆最小化负对数似然损失：L(θ) = -Σ log π_θ(a_i | s_i)。对于离散动作空间，这等价于分类交叉熵损失；对于连续动作空间，通常假设策略输出高斯分布的均值和方差，最小化 MSE 损失。

然而行为克隆有一个致命缺陷：分布偏移（Distribution Shift）。训练时，策略看到的状态都来自专家轨迹；但部署时，策略自己产生的状态可能偏离专家轨迹，而策略从未在偏离后的状态上训练过，导致性能急剧下降。这个问题在长序列决策中尤为严重——即使策略的错误率只有 1%，在 100 步的序列中，至少犯一次错的概率是 1 - 0.99^100 ≈ 63%。一旦犯错进入未知状态，策略可能犯更多错误，形成误差级联（Error Cascading）。

行为克隆的优势在于实现简单、训练快速，且当专家数据覆盖充分时效果良好。它是许多模仿学习系统的起点，也是工业界最常用的模仿学习方法（因为它不依赖环境交互）。`,
            code: [
                {
                    lang: "python",
                    code: `# 行为克隆：使用神经网络学习专家策略
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

class BehaviorCloningPolicy(nn.Module):
    """行为克隆策略网络——将状态映射到动作"""

    def __init__(self, state_dim, action_dim, hidden=256):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, action_dim),
        )

    def forward(self, state):
        return self.network(state)

    def get_action(self, state, deterministic=True):
        with torch.no_grad():
            logits = self.forward(state)
            if deterministic:
                return torch.argmax(logits, dim=-1)
            return torch.distributions.Categorical(
                logits=logits
            ).sample()


def train_behavioral_cloning(
    states: torch.Tensor,
    actions: torch.Tensor,
    state_dim: int,
    action_dim: int,
    epochs: int = 100,
    lr: float = 1e-3,
    batch_size: int = 256,
):
    """训练行为克隆策略"""
    policy = BehaviorCloningPolicy(state_dim, action_dim)
    optimizer = optim.Adam(policy.parameters(), lr=lr)
    criterion = nn.CrossEntropyLoss()

    dataset = TensorDataset(states, actions.long())
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    for epoch in range(epochs):
        total_loss = 0.0
        n_batches = 0
        for batch_states, batch_actions in loader:
            logits = policy(batch_states)
            loss = criterion(logits, batch_actions)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            n_batches += 1
        avg_loss = total_loss / n_batches
        if (epoch + 1) % 20 == 0:
            print(f"Epoch {epoch+1}: loss = {avg_loss:.4f}")

    return policy


# 使用示例
# states: (N, state_dim), actions: (N,)
# policy = train_behavioral_cloning(states, actions, state_dim=8, action_dim=4)
`
                },
                {
                    lang: "python",
                    code: `# 行为克隆误差级联分析
import numpy as np

def error_cascade_probability(step_error_rate: float, horizon: int) -> float:
    """计算在给定单步错误率下，长度为 horizon 的序列中至少犯一次错的概率"""
    return 1 - (1 - step_error_rate) ** horizon

# 分析不同错误率和序列长度下的误差级联风险
error_rates = [0.01, 0.05, 0.10, 0.20]
horizons = [10, 50, 100, 500]

print("误差级联概率 = 1 - (1-p)^T")
print(f"{'单步错误率':<12} | " + " | ".join(f"T={h:<4}" for h in horizons))
print("-" * 60)
for err in error_rates:
    probs = [error_cascade_probability(err, h) for h in horizons]
    print(f"{err:<12.2f} | " + " | ".join(f"{p:>5.1%}" for p in probs))

# 输出示例：
# 单步错误率    | T=10   | T=50   | T=100  | T=500
# 0.01        |  9.6%  | 39.5%  | 63.4%  | 99.3%
# 0.05        | 40.1%  | 92.3%  | 99.4%  | 100.0%
#
# 结论：即使单步准确率 99%，在 100 步序列中也只有 36.6% 的概率完全正确
`
                }
            ],
            table: {
                headers: ["方法", "数据类型", "训练方式", "分布偏移问题", "是否需要环境"],
                rows: [
                    ["行为克隆 BC", "状态-动作对 (s,a)", "监督学习", "严重", "不需要"],
                    ["DAgger", "交互数据", "在线校正", "缓解", "需要"],
                    ["逆强化学习 IRL", "专家轨迹", "优化+RL", "较小", "需要"],
                    ["GAIL", "专家轨迹", "对抗训练", "较小", "需要"],
                ]
            },
            mermaid: `graph LR
    A["专家演示轨迹"] --> B["提取 (s, a) 配对"]
    B --> C["监督学习"]
    C --> D["策略网络 π(a|s)"]
    D --> E["部署"]
    E --> F{"进入新状态?"}
    F -->|"是"| G["分布偏移 → 性能下降"]
    F -->|"否"| H["正常运行"]
            `,
            tip: "行为克隆作为基线非常有用——先用 BC 训练一个初始策略，再用 DAgger 或 RL 精细调整。",
            warning: "纯行为克隆在长序列任务中几乎必然失败，误差级联无法通过增加数据量解决。",
        },
        {
            title: "3. DAgger：在线校正分布偏移",
            body: `DAgger（Dataset Aggregation）是 Ross 和 Bagnell 在 2011 年提出的算法，专门解决行为克隆的分布偏移问题。其核心洞察非常简洁而深刻：分布偏移之所以严重，是因为训练数据只覆盖了专家轨迹上的状态。DAgger 的解决方案是让策略自己在环境中运行，收集它实际遇到的状态，然后请专家在这些状态下标注正确的动作，将这些新数据加入训练集，重新训练策略。

算法流程如下。首先，用行为克隆训练初始策略。然后，进入迭代循环：策略在环境中 rollout，收集它访问到的状态；专家为这些状态标注动作；将新数据加入训练集；用全部数据重新训练策略。随着迭代进行，训练数据分布逐渐接近策略的实际访问分布，分布偏移问题自然得到缓解。

DAgger 的理论保证非常漂亮：在温和的假设下，DAgger 的策略性能以 O(1/N) 的速率收敛到专家性能，其中 N 是迭代轮数。相比之下，纯行为克隆的性能差距随序列长度线性增长。

DAgger 的代价是需要专家在策略 rollout 过程中持续标注——这在某些场景（如自动驾驶）中可能不现实。变体如 AggreVaTe 允许使用专家的价值函数而非具体动作，NoRegret DAgger 使用在线学习框架减少重新训练频率。`,
            code: [
                {
                    lang: "python",
                    code: `# DAgger 算法实现框架
import torch
import torch.nn as nn

class DAggerTrainer:
    """Dataset Aggregation 训练器"""

    def __init__(self, policy, expert, env, optimizer, lr=1e-3):
        self.policy = policy  # 待训练的策略
        self.expert = expert  # 专家策略（可以是函数或人）
        self.env = env
        self.optimizer = optimizer
        self.criterion = nn.CrossEntropyLoss()
        self.dataset = []  # 聚合数据集

    def collect_rollout(self, n_steps=100):
        """用当前策略 rollout，收集状态并请专家标注"""
        state = self.env.reset()
        states, expert_actions = [], []
        for _ in range(n_steps):
            state_tensor = torch.tensor(state, dtype=torch.float32).unsqueeze(0)
            states.append(state)
            # 专家标注
            expert_action = self.expert.get_expert_action(state)
            expert_actions.append(expert_action)
            # 策略执行动作（探索）
            action = self.policy.get_action(state_tensor)
            state, reward, done, _ = self.env.step(action.item())
            if done:
                state = self.env.reset()
        self.dataset.append((states, expert_actions))
        return states, expert_actions

    def train_on_aggregated_data(self, epochs=50, batch_size=256):
        """在全部聚合数据上训练策略"""
        # 展平所有 rollout 数据
        all_states = []
        all_actions = []
        for states, actions in self.dataset:
            all_states.extend(states)
            all_actions.extend(actions)

        states = torch.tensor(all_states, dtype=torch.float32)
        actions = torch.tensor(all_actions, dtype=torch.long)

        dataset = torch.utils.data.TensorDataset(states, actions)
        loader = torch.utils.data.DataLoader(
            dataset, batch_size=batch_size, shuffle=True
        )

        for epoch in range(epochs):
            total_loss = 0.0
            for batch_s, batch_a in loader:
                logits = self.policy(batch_s)
                loss = self.criterion(logits, batch_a)
                self.optimizer.zero_grad()
                loss.backward()
                self.optimizer.step()
                total_loss += loss.item()
            if (epoch + 1) % 25 == 0:
                print(f"DAgger epoch {epoch+1}: loss = {total_loss/len(loader):.4f}")

    def run(self, n_iterations=10, rollout_steps=100):
        """完整的 DAgger 训练循环"""
        for i in range(n_iterations):
            print(f"--- DAgger Iteration {i+1}/{n_iterations} ---")
            self.collect_rollout(rollout_steps)
            self.train_on_aggregated_data()
            print(f"Dataset size: {sum(len(s) for s, _ in self.dataset)}")
`
                },
                {
                    lang: "python",
                    code: `# DAgger vs BC 收敛性对比模拟
import numpy as np

def simulate_bc_performance(horizon, expert_accuracy, bc_accuracy):
    """模拟行为克隆在长序列中的性能衰减"""
    return bc_accuracy ** horizon

def simulate_dagger_performance(n_iterations, horizon, expert_accuracy, learning_rate=0.3):
    """模拟 DAgger 的性能收敛（简化模型）"""
    # DAgger 以 1/N 速率收敛到专家性能
    bc_init = 0.7  # 初始行为克隆准确率
    improvement = (expert_accuracy - bc_init) * (1 - 1 / (1 + n_iterations * learning_rate))
    effective_accuracy = bc_init + improvement
    return effective_accuracy ** horizon

# 对比
horizon = 50
expert_acc = 0.99
bc_acc = 0.95

print(f"序列长度: {horizon}")
print(f"专家准确率: {expert_acc:.2%}")
print(f"BC 初始准确率: {bc_acc:.2%}")
print()
print(f"BC 最终序列成功率: {simulate_bc_performance(horizon, expert_acc, bc_acc):.1%}")

for n_iter in [1, 5, 10, 20, 50]:
    dagger_seq_acc = simulate_dagger_performance(n_iter, horizon, expert_acc)
    print(f"DAgger ({n_iter} 次迭代) 序列成功率: {dagger_seq_acc:.1%}")
`
                }
            ],
            mermaid: `graph TD
    A["初始 BC 策略"] --> B["策略 Rollout 收集状态"]
    B --> C["专家标注动作"]
    C --> D["数据加入训练集"]
    D --> E["在全部数据上训练策略"]
    E --> F{"收敛?"}
    F -->|"否"| B
    F -->|"是"| G["最终策略"]
            `,
            tip: "DAgger 中专家标注的成本是最主要的瓶颈。考虑使用 Noisy DAgger 或混合策略（部分步骤用专家标注，部分用自动标注）来降低标注成本。",
        },
        {
            title: "4. 逆强化学习：从行为推断奖励",
            body: `逆强化学习（IRL）的思路比行为克隆更深刻：与其直接模仿专家的动作，不如理解专家为什么要这么做。具体来说，IRL 假设专家是在优化某个未知的奖励函数 R(s, a)，我们的目标是从专家的示范轨迹中反推出这个奖励函数。一旦学到了奖励函数，就可以用标准的强化学习算法（如 PPO、SAC）来训练策略。

IRL 的核心困难在于：奖励函数不唯一。对于任意专家策略，存在无穷多个奖励函数使得该策略是最优的。例如，如果专家总是往左走，你可以说"因为左边有奖励"，也可以说"因为往右走有惩罚"，甚至"因为所有动作的奖励都是零"。这就是所谓的奖励模糊性（Reward Ambiguity）问题。

Ng 和 Russell（2000）的开创性工作提出了最大边际 IRL：找到一个奖励函数，使得专家策略的累积奖励比其他任何策略至少大一个边际。Abbeel 和 Ng（2004）的特征匹配方法假设奖励是状态的线性函数 R(s) = w^T φ(s)，然后找到权重 w 使得策略的特征期望匹配专家的特征期望。

最大熵 IRL（Ziebart et al., 2008）是最具影响力的 IRL 算法之一。它假设在所有与专家行为一致的奖励函数中，选择使得轨迹分布熵最大的那个。这确保了策略不会过度拟合专家的具体路径，而是学习更一般化的行为模式。最大熵 IRL 通过软值迭代和梯度下降联合优化奖励权重和策略。

GAIL（Generative Adiscriminatorial Imitation Learning, Ho and Ermon, 2016）是 IRL 与 GAN 思想的结合。它将判别器视为奖励函数——判别器越难区分的状态-动作对，获得的奖励越高。策略通过与判别器的对抗训练逐步提升，最终学会生成与专家无法区分的行为。GAIL 不需要显式的奖励函数优化，而是将奖励学习嵌入到对抗训练中，这使得它比传统 IRL 更易于实现和扩展。`,
            code: [
                {
                    lang: "python",
                    code: `# 最大熵逆强化学习（简化版）
import torch
import torch.nn as nn

class MaxEntIRL:
    """最大熵逆强化学习实现框架"""

    def __init__(self, feature_dim, n_states, n_actions, lr=0.01):
        # 奖励函数: R(s) = w^T * phi(s)
        self.weights = nn.Parameter(torch.randn(feature_dim) * 0.1)
        self.feature_dim = feature_dim
        self.n_states = n_states
        self.n_actions = n_actions
        self.optimizer = torch.optim.Adam([self.weights], lr=lr)

    def compute_reward(self, features):
        """根据特征和权重计算奖励"""
        return features @ self.weights

    def compute_expected_features(self, state_visitation_freq):
        """计算策略的期望特征"""
        # state_visitation_freq: (n_states,) 状态访问频率
        # features: (n_states, feature_dim) 状态特征
        return state_visitation_freq @ self.features

    def compute_state_visitation(self, reward, transition, n_steps=50):
        """通过软值迭代计算状态访问频率"""
        # 初始化均匀分布
        d = torch.ones(self.n_states) / self.n_states
        for _ in range(n_steps):
            # 计算软 Q 值
            q = reward + transition @ d
            # 软策略（Boltzmann 分布）
            pi = torch.softmax(q, dim=-1)
            # 更新状态访问频率
            d = transition.T @ (pi * d)
            d = d / d.sum()
        return d

    def train_step(self, expert_features, learner_features, transition_matrix):
        """单步梯度更新"""
        # 专家特征期望
        expert_expectation = expert_features.mean(dim=0)
        # 学习者特征期望
        reward = self.compute_reward(learner_features)
        state_freq = self.compute_state_visitation(
            reward, transition_matrix
        )
        learner_expectation = state_freq @ learner_features

        # 梯度：让学习者的特征期望接近专家
        loss = torch.sum((learner_expectation - expert_expectation) ** 2)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        return loss.item()
`
                },
                {
                    lang: "python",
                    code: `# GAIL：基于对抗的模仿学习
import torch
import torch.nn as nn
import torch.optim as optim

class Discriminator(nn.Module):
    """GAIL 判别器——同时作为奖励函数"""

    def __init__(self, state_dim, action_dim, hidden=256):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(state_dim + action_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, 1),
            nn.Sigmoid(),
        )

    def forward(self, state, action):
        sa = torch.cat([state, action], dim=-1)
        return self.network(sa).squeeze(-1)

    def get_reward(self, state, action):
        """判别器输出 = 专家概率，奖励 = -log(1 - D(s,a))"""
        d_prob = self.forward(state, action)
        # GAIL 奖励: r = -log(1 - D(s, a))
        # 判别器认为越像专家（D接近1），奖励越大
        return -torch.log(1 - d_prob + 1e-8)


def train_gail(policy, discriminator, env, expert_loader,
               policy_optimizer, disc_optimizer,
               n_iterations=100, rollout_steps=2048):
    """GAIL 训练循环"""
    for iteration in range(n_iterations):
        # 1. 用当前策略收集轨迹
        states, actions, rewards = collect_rollout(
            policy, env, rollout_steps
        )
        states = torch.tensor(states, dtype=torch.float32)
        actions = torch.tensor(actions, dtype=torch.float32)

        # 2. 训练判别器
        for _ in range(3):  # 判别器多训练几步
            expert_s, expert_a = next(iter(expert_loader))
            d_expert = discriminator(expert_s, expert_a)
            d_learner = discriminator(states, actions)

            disc_loss = -(
                torch.log(d_expert + 1e-8).mean() +
                torch.log(1 - d_learner + 1e-8).mean()
            )
            disc_optimizer.zero_grad()
            disc_loss.backward()
            disc_optimizer.step()

        # 3. 用判别器奖励更新策略（用 PPO 或其他 RL 算法）
        with torch.no_grad():
            rewards = discriminator.get_reward(states, actions)

        update_policy(policy, states, actions, rewards, policy_optimizer)

        if (iteration + 1) % 20 == 0:
            disc_acc = compute_discriminator_accuracy(
                discriminator, expert_loader, states, actions
            )
            print(f"Iter {iteration+1}: Discriminator accuracy = {disc_acc:.2%}")

    return policy, discriminator
`
                }
            ],
            table: {
                headers: ["方法", "核心思想", "优点", "缺点", "适用场景"],
                rows: [
                    ["最大边际 IRL", "专家奖励 > 其他策略 + 边际", "理论清晰", "需要完整 MDP 知识", "小规模离散环境"],
                    ["特征匹配 IRL", "匹配特征期望", "线性奖励易求解", "依赖特征设计", "有良好特征表示时"],
                    ["最大熵 IRL", "最大化轨迹熵", "不过度拟合专家路径", "计算复杂度高", "需要鲁棒策略"],
                    ["GAIL", "对抗训练学奖励", "不需要显式奖励优化", "训练不稳定", "大规模连续控制"],
                    ["AIRL", "可分解奖励的 GAIL", "奖励可泛化到新环境", "实现复杂", "需要跨环境泛化"],
                ]
            },
            mermaid: `graph TD
    A["专家轨迹"] --> B["特征提取 φ(s)"]
    B --> C["计算专家特征期望"]
    C --> D["优化奖励权重 w"]
    D --> E["用 R(s)=w^Tφ(s) 训练策略"]
    E --> F["计算学习者特征期望"]
    F --> G{匹配专家?}
    G -->|"否"| D
    G -->|"是"| H["学到奖励函数 R*"]
            `,
            tip: "GAIL 在实践中往往比传统 IRL 效果更好，因为它避免了显式的奖励函数优化，直接将奖励学习嵌入策略训练中。",
        },
        {
            title: "5. GAIL 深度解析：对抗训练的巧妙设计",
            body: `GAIL（Generative Adiscriminatorial Imitation Learning）将 GAN 的思想巧妙地迁移到了模仿学习领域。在 GAN 中，生成器试图生成逼真的假图片，判别器试图区分真假图片。在 GAIL 中，策略扮演生成器的角色——它试图生成与专家无法区分的行为轨迹；判别器则试图区分哪些状态-动作对来自专家、哪些来自策略。

GAIL 的目标函数可以形式化为：min_π max_D E_{τ~π}[log D(s,a)] + E_{τ~π_expert}[log(1-D(s,a))] - λH(π)，其中 H(π) 是策略的熵正则化项。当判别器达到最优时，D*(s,a) = π_expert(s,a) / (π_expert(s,a) + π(s,a))。此时策略收到的奖励 r(s,a) = -log(1 - D*(s,a)) 恰好等于专家策略相对于学习策略的密度比的对数——这意味着判别器隐式地学习了一个奖励函数。

GAIL 的一个重要变体是 AIRL（Adversarial Inverse Reinforcement Learning, Fu et al., 2018），它证明 GAIL 学到的"奖励"实际上是一个与策略相关的潜在函数（potential function），并不能真正泛化到不同的初始状态分布。AIRL 通过限制判别器的形式（分解为状态奖励和势函数），确保学到的奖励函数是真正的状态依赖函数，从而可以在新的环境设置中使用。

另一个重要进展是 f-GAIL（f-divergence GAIL），它将原始的 JS 散度推广到更一般的 f 散度族，允许在生成质量和模式覆盖之间进行灵活权衡。使用不同的 f 函数可以获得不同的行为：KL 散度倾向模式覆盖（覆盖所有专家行为），反向 KL 倾向模式追逐（聚焦于专家最典型的行为）。`,
            code: [
                {
                    lang: "python",
                    code: `# AIRL：可分解的对抗逆强化学习
import torch
import torch.nn as nn

class AIRLDiscriminator(nn.Module):
    """AIRL 判别器——分解为奖励函数和势函数"""

    def __init__(self, state_dim, action_dim, hidden=128):
        super().__init__()
        # 可学习的奖励函数: g(s, a)
        self.reward_net = nn.Sequential(
            nn.Linear(state_dim + action_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, 1),
        )
        # 势函数: h(s) —— 仅依赖状态
        self.potential_net = nn.Sequential(
            nn.Linear(state_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, 1),
        )

    def forward(self, state, action, next_state, done):
        """计算归一化的判别器输出"""
        g = self.reward_net(torch.cat([state, action], dim=-1))
        h = self.potential_net(state)
        h_next = self.potential_net(next_state)
        # 奖励整形: r = g(s,a) + γh(s') - h(s)
        gamma = 0.99
        reward_shaped = g + gamma * h_next * (1 - done.float()) - h
        return torch.sigmoid(reward_shaped).squeeze(-1)

    def extract_reward(self, state, action):
        """提取可泛化的奖励函数"""
        return self.reward_net(torch.cat([state, action], dim=-1))
`
                },
                {
                    lang: "python",
                    code: `# 不同 f 散度对模仿行为的影响
import numpy as np
import matplotlib.pyplot as plt

def compute_f_divergence_loss(p_expert, p_learner, f_type="kl_forward"):
    """计算不同 f 散度的损失"""
    eps = 1e-8
    p_e = np.array(p_expert) + eps
    p_l = np.array(p_learner) + eps

    if f_type == "kl_forward":
        # KL(P_expert || P_learner): 模式覆盖
        return np.sum(p_e * np.log(p_e / p_l))
    elif f_type == "kl_reverse":
        # KL(P_learner || P_expert): 模式追逐
        return np.sum(p_l * np.log(p_l / p_e))
    elif f_type == "js":
        # JS 散度（原始 GAIL）
        m = 0.5 * (p_e + p_l)
        return 0.5 * np.sum(p_e * np.log(p_e / m)) + \
               0.5 * np.sum(p_l * np.log(p_l / m))
    elif f_type == "hellinger":
        return np.sum((np.sqrt(p_e) - np.sqrt(p_l))  2)

# 专家有两种行为模式（双峰分布）
expert_dist = np.array([0.45, 0.05, 0.0, 0.45, 0.05])

# 模式覆盖（覆盖所有专家模式）
mode_covering = np.array([0.40, 0.10, 0.05, 0.40, 0.05])

# 模式追逐（只聚焦一个模式）
mode_seeking = np.array([0.85, 0.05, 0.0, 0.10, 0.0])

print("不同 f 散度下的损失对比:")
for f_type in ["kl_forward", "kl_reverse", "js", "hellinger"]:
    mc_loss = compute_f_divergence_loss(expert_dist, mode_covering, f_type)
    ms_loss = compute_f_divergence_loss(expert_dist, mode_seeking, f_type)
    print(f"  {f_type:15s}: 模式覆盖={mc_loss:.4f}, 模式追逐={ms_loss:.4f}")
`
                }
            ],
            mermaid: `graph TD
    A["专家轨迹"] --> D["判别器 D(s,a)"]
    B["策略生成轨迹"] --> D
    D -->|"D ≈ 1: 专家"| E["判别器损失"]
    D -->|"D ≈ 0: 策略"| F["判别器损失"]
    E --> G["更新判别器"]
    F --> G
    D -->|"r = -log(1-D)"| H["策略奖励"]
    H --> I["更新策略 π"]
            `,
            warning: "GAIL 训练中判别器和策略的能力需要平衡。判别器过强会导致策略梯度消失，判别器过弱则无法提供有效学习信号。",
        },
        {
            title: "6. 实际应用场景与实战经验",
            body: `模仿学习在工业界的应用远比纯强化学习广泛，主要原因有三：第一，专家数据通常比奖励函数更容易获取；第二，模仿学习避免了奖励设计中的对齐问题；第三，行为克隆可以直接利用已有的高质量数据集。

在自动驾驶领域，Waymo 和 Tesla 都大量使用人类驾驶数据。Waymo 的方案是：先用行为克隆训练初始驾驶策略，然后在封闭测试场地中通过人类安全驾驶员的干预数据（相当于 DAgger 中的专家标注）来校正策略。Tesla 的 FSD 系统则从数百万车辆的驾驶数据中学习，通过影子模式（shadow mode）——模型在后台运行但不实际控制车辆，将其决策与实际驾驶员的操作对比，持续改进。

在机器人操作中，Google 的 RT-1 和 RT-2 模型使用人类遥操作数据训练通用的机器人控制策略。这些系统收集人类通过 VR 设备远程控制机器人的数据，然后训练 Transformer** 模型将图像和语言指令映射到机器人动作。这种方法的关键挑战是数据规模——需要数万到数十万条高质量的遥操作数据。

在游戏 AI 中，DeepMind 的 AlphaStar 使用人类玩家的录像数据（replay data）训练星际争霸 AI。由于游戏中的奖励信号稀疏且延迟，纯 RL 训练极其困难，而模仿学习提供了一个强大的起点。AlphaStar 先用行为克隆学习人类基础策略，然后用自我对战的强化学习进一步提升。

模仿学习的一个关键实战经验是：数据质量比数据量更重要。1000 条来自顶尖专家的示范数据，往往比 10 万条来自普通用户的数据效果更好。这是因为行为克隆直接拟合数据中的策略，如果数据中包含次优行为，模型会学会这些次优行为。`,
            code: [
                {
                    lang: "python",
                    code: `# 数据质量评估：专家数据筛选
import numpy as np

class ExpertDataQualityChecker:
    """评估和筛选专家示范数据质量"""

    def __init__(self, states, actions, rewards=None):
        self.states = np.array(states)
        self.actions = np.array(actions)
        self.rewards = np.array(rewards) if rewards is not None else None

    def trajectory_consistency(self, window=10):
        """评估轨迹的一致性——专家行为是否连贯"""
        action_changes = np.abs(np.diff(self.actions, axis=0))
        # 计算滑动窗口内的动作变化标准差
        std_changes = []
        for i in range(len(action_changes) - window):
            window_std = np.std(action_changes[i:i+window])
            std_changes.append(window_std)
        return np.mean(std_changes)

    def trajectory_performance(self):
        """如果有奖励数据，评估轨迹的整体表现"""
        if self.rewards is None:
            return None
        return np.sum(self.rewards)

    def outlier_detection(self, threshold=2.0):
        """检测轨迹中的异常片段（可能是新手操作）"""
        action_changes = np.abs(np.diff(self.actions, axis=0))
        mean_change = np.mean(action_changes)
        std_change = np.std(action_changes)
        outliers = np.where(
            np.abs(action_changes - mean_change) > threshold * std_change
        )[0]
        return outliers

    def filter_quality_trajectories(self, trajectories, top_k=0.2):
        """选择质量最高的 top_k 比例轨迹"""
        scores = []
        for traj in trajectories:
            checker = ExpertDataQualityChecker(traj['states'], traj['actions'],
                                               traj.get('rewards'))
            score = 0.0
            # 一致性越高越好（动作变化平稳）
            consistency = checker.trajectory_consistency()
            score -= consistency
            # 奖励越高越好
            perf = checker.trajectory_performance()
            if perf is not None:
                score += perf / 100.0
            # 异常越少越好
            outliers = len(checker.outlier_detection())
            score -= outliers * 0.1
            scores.append(score)

        indices = np.argsort(scores)[::-1]
        top_n = max(1, int(len(trajectories) * top_k))
        return [trajectories[i] for i in indices[:top_n]]
`
                },
                {
                    lang: "python",
                    code: `# 模仿学习 + RL 混合训练策略
import torch

def imitation_then_rl(policy, env, expert_data,
                      bc_epochs=50, rl_steps=1000000):
    """先用模仿学习初始化，再用强化学习精调"""

    # 阶段 1: 行为克隆初始化
    print("阶段 1: 行为克隆...")
    states = torch.tensor(expert_data['states'], dtype=torch.float32)
    actions = torch.tensor(expert_data['actions'], dtype=torch.long)
    policy = train_behavioral_cloning(
        states, actions,
        state_dim=states.shape[1],
        action_dim=len(torch.unique(actions)),
        epochs=bc_epochs
    )
    bc_score = evaluate_policy(policy, env)
    print(f"BC 初始性能: {bc_score:.1f}")

    # 阶段 2: 强化学习精调
    print("阶段 2: 强化学习精调...")
    # 用 PPO 或其他 RL 算法继续训练
    # 关键：使用 BC 初始化的策略作为起点，而不是随机初始化
    policy = fine_tune_with_rl(policy, env, rl_steps)

    final_score = evaluate_policy(policy, env)
    print(f"最终性能: {final_score:.1f}")
    print(f"提升: {final_score - bc_score:.1f}")

    return policy

# 实际效果（MuJoCo 环境典型结果）：
# BC 初始性能: 1500 (达到专家的 60-80%)
# 最终性能: 2200-2400 (超过原始专家)
# 纯 RL 从零开始: 800-1200（需要 5-10 倍训练步数）
`
                }
            ],
            table: {
                headers: ["应用领域", "数据来源", "主要方法", "关键挑战", "代表工作"],
                rows: [
                    ["自动驾驶", "人类驾驶数据", "BC + DAgger", "安全验证、边缘场景", "Waymo, Tesla FSD"],
                    ["机器人操作", "遥操作数据", "BC + RL 混合", "数据规模、泛化性", "Google RT-1/RT-2"],
                    ["游戏 AI", "玩家录像", "BC + 自我对战 RL", "对手多样性", "AlphaStar, OpenAI Five"],
                    ["对话系统", "人类对话数据", "监督微调 + RLHF", "安全性和毒性", "InstructGPT, Claude"],
                    ["代码生成", "开源代码", "监督微调", "正确性验证", "Codex, StarCoder"],
                ]
            },
            tip: "混合策略（模仿学习初始化 + 强化学习精调）通常是最佳实践——模仿学习提供合理的起点，强化学习超越专家水平。",
        },
        {
            title: "7. 方法选择指南与总结",
            body: `面对一个具体的模仿学习任务，如何选择合适的方法？以下决策树可以帮助你在不同场景下做出选择。

首先判断是否有环境交互能力。如果只能在离线数据上训练（如自动驾驶、医疗决策），行为克隆是唯一选择。此时应重点关注数据质量、分布偏移的缓解（如正则化、数据增强）和不确定性估计（当策略遇到陌生状态时知道何时放弃）。

如果可以与环境交互，DAgger 是最直接的选择——特别是当你能获取专家标注时。DAgger 的理论保证强、实现简单，在实践中通常能获得接近专家性能的策略。主要限制是标注成本。

如果需要策略能泛化到训练分布之外的场景（如不同地图、不同初始条件），逆强化学习或 GAIL 更合适，因为它们学的是奖励函数而非具体动作。GAIL 在大规模连续控制任务中表现最好，而传统 IRL 更适合小规模离散环境。

如果需要奖励函数本身可解释或可迁移到其他环境，选择 AIRL 而非 GAIL，因为 AIRL 学到的奖励函数是真正的状态函数而非潜在函数。

总结而言，模仿学习不是强化学习的替代品，而是互补品。在奖励函数明确且易于探索的环境中，纯 RL 可能更直接；但在奖励函数难以定义、专家数据易于获取、或安全约束严格的环境中，模仿学习是不可替代的工具。最强大的系统往往将模仿学习和强化学习结合使用——模仿学习提供合理的起点和安全保障，强化学习实现超越专家的性能。`,
            code: [
                {
                    lang: "python",
                    code: `# 模仿学习方法自动选择器
def select_imitation_learning_method(context):
    """根据任务上下文选择最合适的模仿学习方法"""
    recommendations = []

    # 判断是否可交互
    if not context.get("can_interact", False):
        recommendations.append({
            "method": "行为克隆 (BC)",
            "reason": "离线数据，无法交互",
            "tips": ["关注数据质量", "添加正则化防止过拟合",
                     "使用不确定性估计检测分布偏移"]
        })
        return recommendations

    # 判断是否有专家标注
    if context.get("expert_available", False):
        recommendations.append({
            "method": "DAgger",
            "reason": "可交互且有专家标注",
            "tips": ["减少标注频率以降低成本",
                     "混合专家数据和自动标注"]
        })

    # 判断是否需要泛化
    if context.get("needs_generalization", False):
        recommendations.append({
            "method": "GAIL / AIRL",
            "reason": "需要泛化到分布外场景",
            "tips": ["GAIL 适合大规模连续控制",
                     "AIRL 适合需要可解释奖励的场景"]
        })

    # 推荐混合策略
    recommendations.append({
        "method": "BC 初始化 + RL 精调",
        "reason": "通用最佳实践",
        "tips": ["BC 提供安全起点",
                 "RL 超越专家水平",
                 "监控性能确保不退化"]
    })

    return recommendations

# 使用示例
context = {
    "can_interact": True,
    "expert_available": True,
    "needs_generalization": True,
}
for rec in select_imitation_learning_method(context):
    print(f"推荐: {rec['method']}")
    print(f"  原因: {rec['reason']}")
    print(f"  建议: {', '.join(rec['tips'])}")
    print()
`
                },
                {
                    lang: "python",
                    code: `# 模仿学习完整训练管线
import torch
import numpy as np

class ImitationLearningPipeline:
    """模仿学习完整训练管线"""

    def __init__(self, config):
        self.config = config
        self.stage = "bc"  # bc -> dagger -> rl

    def run(self, expert_data, env):
        """运行完整的训练管线"""
        policy = self._init_policy()
        metrics = {}

        # 阶段 1: 行为克隆
        print("=== 阶段 1: 行为克隆 ===")
        policy = self._train_bc(policy, expert_data)
        metrics['bc_score'] = self._evaluate(policy, env)
        print(f"BC 完成, 得分: {metrics['bc_score']:.1f}")

        # 阶段 2: DAgger（如果有专家）
        if self.config.get("use_dagger", False):
            print("=== 阶段 2: DAgger ===")
            policy = self._train_dagger(policy, env, self.config["expert"])
            metrics['dagger_score'] = self._evaluate(policy, env)
            print(f"DAgger 完成, 得分: {metrics['dagger_score']:.1f}")

        # 阶段 3: RL 精调
        if self.config.get("use_rl", False):
            print("=== 阶段 3: RL 精调 ===")
            policy = self._train_rl(policy, env)
            metrics['final_score'] = self._evaluate(policy, env)
            print(f"RL 完成, 得分: {metrics['final_score']:.1f}")

        return policy, metrics

    def _init_policy(self):
        return BehaviorCloningPolicy(
            self.config['state_dim'],
            self.config['action_dim']
        )

    def _train_bc(self, policy, expert_data):
        return train_behavioral_cloning(
            expert_data['states'], expert_data['actions'],
            self.config['state_dim'], self.config['action_dim'],
            epochs=self.config.get('bc_epochs', 50)
        )

    def _evaluate(self, policy, env, n_episodes=10):
        scores = []
        for _ in range(n_episodes):
            state = env.reset()
            total_reward = 0
            done = False
            while not done:
                action = policy.get_action(
                    torch.tensor(state, dtype=torch.float32).unsqueeze(0)
                )
                state, reward, done, _ = env.step(action.item())
                total_reward += reward
            scores.append(total_reward)
        return np.mean(scores)

    def _train_dagger(self, policy, env, expert):
        trainer = DAggerTrainer(policy, expert, env,
                                torch.optim.Adam(policy.parameters()))
        trainer.run(n_iterations=10, rollout_steps=100)
        return policy

    def _train_rl(self, policy, env):
        # 使用 PPO 从 BC 初始化的策略继续训练
        # 具体实现取决于 RL 算法的选择
        pass
`
                }
            ],
            table: {
                headers: ["方法", "数据需求", "环境交互", "超越专家", "实现难度", "工业成熟度"],
                rows: [
                    ["行为克隆", "仅需 (s,a)", "不需要", "不能", "低", "高"],
                    ["DAgger", "(s,a) + 标注", "需要", "不能", "中", "中"],
                    ["逆强化学习", "轨迹数据", "需要", "能", "高", "低"],
                    ["GAIL", "轨迹数据", "需要", "能", "高", "中"],
                    ["BC+RL 混合", "(s,a) + 环境", "需要", "能", "中高", "高"],
                ]
            },
            mermaid: `graph TD
    A["模仿学习任务"] --> B{"可交互?"}
    B -->|"否"| C["行为克隆 BC"]
    B -->|"是"| D{"有专家标注?"}
    D -->|"是"| E["DAgger"]
    D -->|"否"| F{"需泛化到分布外?"}
    F -->|"是"| G["GAIL / AIRL"]
    F -->|"否"| E
    C --> H["BC 初始化"]
    E --> H
    G --> H
    H --> I["RL 精调"]
    I --> J["最终策略"]
            `,
            tip: "工业实践中最可靠的路径是：行为克隆初始化 → 少量 DAgger 校正 → 强化学习精调。这个组合在安全性、效率和最终性能之间取得了最佳平衡。",
            warning: "模仿学习学到的策略永远不会超越其训练数据的质量上限。如果需要超越人类专家，必须引入强化学习或自我对战。",
        },
    ],
};
