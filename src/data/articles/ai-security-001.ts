import { Article } from '../knowledge';

export const article: Article = {
    id: "ai-security-001",
    title: "AI 对抗攻击与防御：当神经网络被「欺骗」",
    category: "ethics",
    tags: ["对抗攻击", "对抗样本", "对抗训练", "鲁棒性", "AI 安全", "FGSM", "PGD", "防御策略"],
    summary: "深入解析对抗攻击的原理、经典算法、防御策略与行业实践，帮助 AI 从业者理解并应对神经网络的安全脆弱性",
    date: "2026-04-13",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 什么是 AI 对抗攻击？——从一张「不可见」的图片说起",
            body: `2014 年，Goodfellow 等人在论文中展示了一个令人不安的现象：在一张熊猫图片上添加人类肉眼几乎无法察觉的扰动，就能让最先进的图像分类器以 99.3% 的置信度将其识别为长臂猿。这就是对抗样本（Adversarial Example）——AI 系统的「视觉错觉」。

对抗攻击的核心思想很简单：在输入数据中加入精心设计的微小扰动，使模型产生错误的输出，同时扰动小到人类无法察觉。

这种现象揭示了深度学习模型的一个根本性缺陷：它们学习到的决策边界与人类的感知方式存在系统性差异。模型可能学会了依赖一些人类不会注意到的纹理模式或统计特征来做决策，而这些特征恰恰可以被攻击者利用。

对抗攻击的威胁等级正在快速升级：

- 物理世界攻击：在交通标志上贴几张贴纸，就能让自动驾驶汽车的视觉系统将「停车」标志误认为「限速 45」
- 语音对抗攻击：在语音指令中嵌入人类听不见的超声频段信号，就能让智能音箱执行未经授权的操作
- 大语言模型对抗攻击：通过精心构造的提示词（Jailbreak Prompt），可以绕过大语言模型的安全护栏，诱导其生成有害内容
- 多模态对抗攻击：在图像-文本对中加入对抗扰动，可以同时影响视觉和语言理解模块

2026 年，随着 AI 系统被部署到金融、医疗、自动驾驶等高风险领域，对抗攻击已从学术研究演变为真实的安全威胁。理解对抗攻击的原理和防御方法，已经成为每个 AI 从业者的必修课。`,
            mermaid: `graph LR
    A["干净输入"] -->|"正常推理"| B["正确输出"]
    C["对抗扰动"] -->|"添加"| A
    A -->|"被攻击后"| D["错误输出"]
    E["人类感知"] -->|"无法察觉"| C
    F["模型决策边界"] -->|"非线性漏洞"| C`,
        },
        {
            title: "2. 对抗攻击的分类体系",
            body: `对抗攻击可以按照多个维度进行分类。理解这些分类有助于选择正确的攻击方法和防御策略。

按攻击者知识程度分类：

白盒攻击（White-box Attack）：攻击者完全了解模型的结构、参数和训练数据。这是最强大的攻击设定，攻击者可以利用梯度信息精确计算最优扰动。FGSM、PGD、C&W 等经典算法都属于白盒攻击。在实际场景中，开源模型的权重公开，白盒攻击是完全可行的。

黑盒攻击（Black-box Attack）：攻击者只能访问模型的输入和输出，无法获取内部参数或梯度。黑盒攻击又分为两类：基于查询的攻击通过大量查询模型来估计梯度方向；基于迁移的攻击利用对抗样本在不同模型间的可迁移性，先在本地替代模型上生成对抗样本，再攻击目标模型。2026 年，黑盒攻击的效率和成功率都在快速提升。

灰盒攻击（Gray-box Attack）：攻击者了解模型的部分信息（如架构或训练数据集），但不完全知道参数。这是现实中最常见的攻击设定。

按攻击目标分类：

有目标攻击（Targeted Attack）：攻击者指定模型应该输出的错误类别。例如，将「停车标志」强制分类为「限速标志」。这种攻击更难实现，但危害更大。

无目标攻击（Untargeted Attack）：攻击者只需要让模型输出任何错误的类别。这种攻击更容易成功。

按扰动范围分类：

**数字域攻击**：直接在数字图像或文本上添加扰动。扰动可以精确到像素级别。

**物理域攻击**：在现实世界中实施攻击。例如，在物体表面打印对抗图案，或通过特定角度和光照条件触发误分类。物理域攻击需要考虑环境变化（光照、角度、距离）的鲁棒性，技术难度更高。`,
            table: {
                headers: ["攻击类型", "知识需求", "成功率", "现实威胁", "代表方法"],
                rows: [
                    ["白盒攻击", "完全了解模型", "极高", "开源模型", "FGSM, PGD, C&W"],
                    ["黑盒查询攻击", "仅输入输出", "中等", "API 服务", "NES, ZOO"],
                    ["黑盒迁移攻击", "替代模型", "中等-高", "商用模型", "MI-FGSM, DI-FGSM"],
                    ["物理域攻击", "部分了解", "中等", "自动驾驶", "对抗补丁"],
                    ["提示注入攻击", "接口格式", "高", "LLM 应用", "Jailbreak, DAN"],
                ],
            },
        },
        {
            title: "3. 经典对抗攻击算法详解",
            body: `理解对抗攻击算法是构建有效防御的基础。下面我们深入分析三种最具代表性的攻击方法。

FGSM（Fast Gradient Sign Method）是最早也是最简单的对抗攻击算法。它的核心思想非常直观：计算损失函数对输入的梯度，然后沿着梯度方向添加一个小扰动。

具体来说，假设我们有一个图像分类模型 f(x)，输入图像为 x，真实标签为 y。损失函数为 L(f(x), y)。FGSM 计算损失对输入的梯度 ∇ₓL，然后取梯度的符号（sign），乘以扰动大小 ε，得到对抗样本：x' = x + ε · sign(∇ₓL)。

FGSM 的优势是计算效率极高，只需要一次前向传播和一次反向传播。但它生成的对抗样本不够强，容易被简单防御抵御。

PGD（Projected Gradient Descent）可以理解为 FGSM 的「多步加强版」。PGD 不是一次性添加扰动，而是在多个小步骤中迭代地添加扰动，每步之后将扰动投影到允许的范围内（通常是 ℓ∞ 球）。

PGD 的迭代公式为：xₜ₊₁ = Π(xₜ + α · sign(∇ₓₜL))，其中 Π 是投影操作，α 是步长。Madry 等人的研究表明，PGD 是「一阶攻击中最强的」——如果一个模型能抵抗 PGD 攻击，那么它也能抵抗其他一阶攻击。

C&W（Carlini & Wagner）攻击通过优化方法生成对抗样本。它将对抗样本的生成建模为一个约束优化问题：在扰动不超过 ε 的前提下，最小化模型对正确类别的置信度。C&W 攻击使用 Adam 优化器求解这个优化问题，生成的对抗样本质量极高，能突破许多防御方法。

对大语言模型的对抗攻击有其特殊性。由于 LLM 的输入是离散的文字（token），梯度无法直接回传到输入上。主要的攻击方法包括：

- HotFlip：通过近似梯度来指导 token 替换
- AutoPrompt：自动搜索能触发特定行为的提示前缀
- GCG（Greedy Coordinate Gradient）：利用梯度信息选择最优的 token 替换位置
- PAIR/Tree of Attacks：使用 LLM 自身作为攻击者，通过多轮对话生成越狱提示`,
            code: [
                {
                    lang: "python",
                    code: `import torch
import torch.nn as nn
import torch.optim as optim

# ==================== FGSM 攻击 ====================
def fgsm_attack(model, image, label, epsilon=0.03):
    """
    Fast Gradient Sign Method (FGSM)
    最经典的单步对抗攻击
    """
    model.eval()
    image.requires_grad = True
    
    # 前向传播
    output = model(image)
    loss = nn.CrossEntropyLoss()(output, label)
    
    # 反向传播计算梯度
    model.zero_grad()
    loss.backward()
    
    # 收集输入图像的梯度
    data_grad = image.grad.data
    
    # 生成对抗样本：x' = x + ε * sign(∇ₓL)
    perturbation = epsilon * data_grad.sign()
    adversarial_image = image + perturbation
    
    # 裁剪到合法范围 [0, 1]
    adversarial_image = torch.clamp(adversarial_image, 0, 1)
    
    return adversarial_image

# ==================== PGD 攻击 ====================
def pgd_attack(model, image, label, epsilon=0.03, 
               alpha=0.01, num_steps=20):
    """
    Projected Gradient Descent (PGD) 攻击
    多步迭代攻击，一阶攻击中最强
    """
    model.eval()
    adversarial_image = image.clone().detach()
    
    # 随机初始化起点（增强攻击效果）
    adversarial_image += torch.randn_like(image) * epsilon * 0.5
    adversarial_image = torch.clamp(adversarial_image, 0, 1)
    
    for step in range(num_steps):
        adversarial_image.requires_grad = True
        
        output = model(adversarial_image)
        loss = nn.CrossEntropyLoss()(output, label)
        
        model.zero_grad()
        loss.backward()
        
        # 更新对抗样本
        with torch.no_grad():
            grad = adversarial_image.grad.data
            adversarial_image = adversarial_image + alpha * grad.sign()
            
            # 投影到 ε 球内
            perturbation = torch.clamp(
                adversarial_image - image, -epsilon, epsilon
            )
            adversarial_image = torch.clamp(
                image + perturbation, 0, 1
            )
            adversarial_image = adversarial_image.detach()
    
    return adversarial_image

# 使用示例
# adv_image = fgsm_attack(model, clean_image, label, epsilon=0.03)
# adv_image = pgd_attack(model, clean_image, label, 
#                        epsilon=0.03, alpha=0.005, num_steps=20)`,
                    filename: "adversarial_attacks.py",
                },
            ],
        },
        {
            title: "4. 对抗防御：构建鲁棒的 AI 模型",
            body: `对抗防御是 AI 安全领域的核心研究方向。经过近十年的研究，社区已经发展出多种防御策略，但没有一种方法是银弹。下面我们分析主流的防御方法及其优缺点。

对抗训练（Adversarial Training）是目前最有效的防御方法。其核心思想是：在训练过程中主动加入对抗样本，让模型在训练阶段就「见识」过各种攻击，从而提高鲁棒性。

对抗训练的过程是：对每个训练样本，先生成对抗样本（通常用 PGD），然后将对抗样本和原始样本一起用于训练。这个过程可以形式化为一个极小极大优化问题：min_θ E[max_δ L(f_θ(x+δ), y)]。

对抗训练的缺点也很明显：训练时间增加 3-7 倍；可能降低模型在干净数据上的准确率（鲁棒性与准确率的权衡）；对未见过的攻击类型的泛化能力有限。

输入预处理（Input Preprocessing）在数据进入模型之前，先对其进行净化处理，去除可能的对抗扰动。常见方法包括：

- 随机平滑（Randomized Smoothing）：向输入添加随机噪声，然后多次推理并投票。这种方法可以提供可证明的鲁棒性保证。
- JPEG 压缩：利用 JPEG 压缩的有损特性破坏对抗扰动。简单但有效，尤其对 ℓ∞ 攻击。
- 特征压缩（Feature Squeezing）：降低输入的颜色位深度或空间分辨率，减少攻击者可利用的搜索空间。
- 扩散净化（Diffusion Purification）：2024-2026 年的新方法，利用扩散模型的前向-反向过程去除对抗扰动。

模型架构改进通过设计更鲁棒的神经网络架构来天然抵抗对抗攻击：

- 对抗性正则化：在损失函数中添加正则化项，惩罚对输入扰动敏感的模型
- 随机深度（Stochastic Depth）：训练时随机丢弃层，增加模型的冗余性
- 集成防御（Ensemble Defense）：使用多个模型进行集成，增加攻击者同时欺骗多个模型的难度
- 认证鲁棒性（Certified Robustness）：通过数学证明保证在一定扰动范围内模型的预测不会改变

大语言模型的安全护栏针对 LLM 的对抗攻击（越狱、提示注入），防御策略包括：

- **RLHF**（基于人类反馈的强化学习）：通过人类标注数据微调模型，使其对有害请求产生拒绝行为
-  Constitutional AI（宪法 AI）：让模型按照一套预设的「宪法原则」自我审查
**- 输入过滤**：检测和拦截恶意的提示词模式
**- 输出验证**：对模型输出进行二次检查，过滤不安全内容
**- 沙箱执行**：限制 Agent 的工具调用范围，防止越权操作`,
            tip: `对抗防御没有银弹！2026 年的最佳实践是「纵深防御」：同时采用对抗训练 + 输入预处理 + 运行时监控 + 输出验证，多层防护叠加，即使一层被突破，其他层仍能提供保护。`,
        },
        {
            title: "5. 对抗攻击的现实案例与行业影响",
            body: `对抗攻击不仅仅是实验室里的理论——它正在对现实世界的 AI 系统产生实质性影响。

自动驾驶领域的对抗攻击是最令人担忧的场景之一。研究人员已经证明：

- 在「停车」标志上贴两张特殊设计的贴纸，就能让特斯拉的视觉系统将停车标志误认为限速标志。在 37 米外即可成功触发。
- 在路面上绘制对抗图案，可以诱导自动驾驶汽车偏离车道。
- 通过在行人衣物上打印对抗图案，可以使检测系统在关键时刻「看不见」行人。

这些发现促使自动驾驶行业重新思考安全验证流程。2026 年，主要自动驾驶公司都建立了专门的对抗测试团队，将对抗鲁棒性纳入安全认证的必检项目。

人脸识别系统的对抗攻击同样值得关注。通过在眼镜框上打印对抗图案，可以让面部识别系统将一个人误认为另一个人。这种攻击已经被用于绕过某些商业人脸识别系统。

金融领域的对抗攻击更加隐蔽。研究者发现，通过对信用卡交易数据添加微小扰动，可以欺骗欺诈检测模型，使欺诈交易被标记为正常。这种攻击的隐蔽性极高，因为扰动幅度远小于正常的交易波动。

大语言模型的安全事件在 2024-2026 年频繁出现：

- DAN 模式：通过角色扮演提示词绕过 ChatGPT 的安全限制，使其扮演一个「没有规则的 AI」
**- 越狱竞赛**：社区不断发现新的越狱方法，而模型厂商不断修补——这是一场持续的安全攻防战
- 提示注入攻击：在网页内容中嵌入隐藏指令，当 LLM 读取该网页时执行恶意操作
- 间接提示注入：通过第三方数据源（搜索结果、API 返回）向 LLM 注入恶意指令

这些事件推动了 AI 安全行业的快速发展。2026 年，全球 AI 安全市场规模预计超过 50 亿美元，涵盖对抗测试工具、安全审计服务、鲁棒模型训练平台等多个细分领域。`,
            mermaid: `graph TD
    A["对抗攻击威胁"] --> B["自动驾驶"]
    A --> C["人脸识别"]
    A --> D["金融风控"]
    A --> E["大语言模型"]
    A --> F["医疗诊断"]
    
    B --> B1["交通标志误识别"]
    C --> C1["身份伪造"]
    D --> D1["欺诈绕过"]
    E --> E1["越狱攻击"]
    F --> F1["误诊"]
    
    B1 --> G["行业应对"]
    C1 --> G
    D1 --> G
    E1 --> G
    F1 --> G
    
    G --> H["对抗测试团队"]
    G --> I["安全认证标准"]
    G --> J["纵深防御体系"]`,
        },
        {
            title: "6. 对抗鲁棒性评估：如何测试你的模型",
            body: `在部署 AI 模型之前，评估其对抗鲁棒性是必不可少的安全步骤。下面我们介绍一套完整的评估流程。

**第一步**：选择评估基准。常用的对抗鲁棒性评估基准包括：

- RobustBench：标准化的对抗鲁棒性排行榜，支持 CIFAR-10、CIFAR-100、ImageNet 等数据集。提供统一的评估协议，方便不同方法的横向比较。
- AdvBench：针对大语言模型的对抗攻击基准，包含数百条精心设计的越狱提示。
- **HELM** Safety：Stanford 发布的综合评估框架，涵盖公平性、隐私、安全等多个维度。
- TrustLLM：全面评估 LLM 的可信度，包括鲁棒性、公平性、隐私保护、透明度等。

**第二步**：选择攻击方法进行评估。建议使用多种攻击方法进行综合评估：

| 攻击方法 | 强度 | 速度 | 适用场景 |
|---------|------|------|---------|
| FGSM | 低 | 极快 | 快速筛查 |
| PGD-20 | 高 | 中等 | 标准评估 |
| PGD-100 | 很高 | 较慢 | 深度评估 |
| C&W | 很高 | 慢 | 突破测试 |
| AutoAttack | 极高 | 中等 | 自动评估套件 |

AutoAttack是 2020 年提出的自动化对抗攻击评估工具，它组合了 4 种不同的攻击方法（APGD-CE、APGD-DLR、APGD-T、Square Attack），能提供更全面和可靠的鲁棒性评估。AutoAttack 已成为学术界和工业界的标准评估工具。

**第三步**：报告评估结果。一个完整的对抗鲁棒性评估报告应包含：

1. 干净准确率：模型在无攻击情况下的准确率
2. 鲁棒准确率：模型在不同攻击强度和攻击方法下的准确率
3. 扰动-准确率曲线：展示不同扰动强度（ε）下的准确率变化
4. 攻击成功率分析：按攻击类型和类别分析攻击成功率
5. 对抗样本可视化：展示原始输入和对抗样本的对比

**第四步**：持续监控。模型部署后，需要持续监控其鲁棒性表现：

- 在线对抗检测：部署实时监控系统，检测异常的输入模式和模型行为
- 定期重评估：每季度或每当模型更新后，重新进行对抗鲁棒性评估
**- 红队演练**：组建安全团队，模拟真实攻击者的行为，发现模型的潜在漏洞
**- 威胁情报**：跟踪最新对抗攻击技术的发展，及时更新防御策略`,
            code: [
                {
                    lang: "python",
                    code: `# 使用 AutoAttack 进行对抗鲁棒性评估
import torch
import torchvision
from autoattack import AutoAttack

# 加载预训练模型
model = torchvision.models.resnet18(weights='IMAGENET1K_V1')
model.eval().cuda()

# 定义测试数据集
test_loader = torch.utils.data.DataLoader(
    torchvision.datasets.CIFAR10(
        root='./data', train=False, download=True,
        transform=torchvision.transforms.ToTensor()
    ),
    batch_size=1000, shuffle=False
)

# 获取测试数据
x_test, y_test = next(iter(test_loader))
x_test, y_test = x_test.cuda(), y_test.cuda()

# 创建 AutoAttack 实例
adversary = AutoAttack(
    model,
    norm='Linf',           # 使用 L∞ 范数
    eps=8/255,             # 扰动上限 (8/255 ≈ 0.031)
    version='standard',    # 使用标准攻击组合
    verbose=True
)

# 执行攻击评估
x_adv = adversary.run_standard_evaluation(
    x_test, y_test,
    bs=256  # 批次大小
)

# 分析结果
# AutoAttack 会自动运行以下攻击：
# 1. APGD-CE (交叉熵损失)
# 2. APGD-DLR (DLR 损失)
# 3. APGD-T (有目标攻击)
# 4. Square Attack (无梯度黑盒攻击)

# 输出示例：
# initial accuracy: 95.20%
# robust accuracy after APGD-CE: 62.30%
# robust accuracy after APGD-DLR: 58.70%
# robust accuracy after APGD-T: 55.10%
# robust accuracy after Square: 61.80%
# final robust accuracy: 55.10%`,
                    filename: "evaluate_robustness.py",
                },
            ],
        },
        {
            title: "7. AI 对抗安全的未来：从猫鼠游戏到体系化防御",
            body: `对抗攻击与防御的博弈是一场持续的猫鼠游戏。但随着 AI 系统越来越多地进入高风险领域，我们需要从「打补丁」式的防御转向体系化的安全工程。

可证明鲁棒性（Provable Robustness）是 2026 年最具前景的研究方向之一。传统的对抗防御只能提供经验性保护——我们观察到模型在测试中抵抗了某些攻击，但无法保证它能抵抗所有可能的攻击。可证明鲁棒性则通过数学方法，严格证明在给定扰动范围内模型的预测不会改变。

目前的主要方法包括：
- 区间边界传播（IBP）：通过网络逐层传播输入的扰动区间，计算输出的保守边界
- 线性松弛（CROWN）：为每个非线性激活函数构建线性上界和下界，得到更紧的输出边界
- 随机平滑（Randomized Smoothing）：通过向输入添加随机噪声，将经验性鲁棒性转化为可证明的鲁棒性保证

AI 安全标准化正在快速推进。NIST、ISO/IEC 等标准组织正在制定 AI 系统安全性的评估标准，对抗鲁棒性预计将成为核心指标之一。2026 年，欧盟 AI Act 已经生效，要求高风险 AI 系统必须通过包括对抗鲁棒性测试在内的安全认证。

大模型安全的新挑战随着 LLM 能力的增强而不断涌现：
- 涌现能力的安全风险：模型在规模扩大后可能涌现出训练者未预料到的能力，包括潜在的有害能力
- 多智能体系统安全：当多个 AI Agent 协作时，对抗攻击可能通过 Agent 之间的交互传播和放大
- 供应链安全：预训练模型、微调数据集、推理框架——AI 系统的每一个环节都可能被植入后门
- 对齐税（Alignment Tax）：安全对齐措施可能降低模型的能力表现，如何在安全性和能力之间取得平衡是一个开放问题

给 AI 从业者的安全建议：

1. 安全左移：在模型设计阶段就考虑对抗鲁棒性，而不是部署后再修补
2. 纵深防御：不依赖单一防御方法，采用多层防护策略
3. 持续评估：定期进行对抗测试，跟踪最新攻击技术
4. 透明报告：公开模型的鲁棒性评估结果，帮助用户做出知情决策
5. 社区协作：参与安全研究和信息共享，共同提升行业安全水平

对抗安全不是 AI 系统的可选功能——它是 AI 可信度的基石。在 AI 日益深入人类生活的时代，构建安全、鲁棒、可信的 AI 系统是每个 AI 从业者的责任。`,
            tip: `安全不是功能，而是属性。正如建筑安全不是事后添加的消防栓，而是贯穿设计始终的结构原则——AI 安全也应该从第一行代码开始，贯穿模型生命周期的每一个环节。`,
        },
    ],
};
