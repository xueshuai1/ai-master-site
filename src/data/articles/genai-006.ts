import { Article } from '../knowledge';

export const article: Article = {
    id: "genai-006",
    title: "生成模型评估：FID, IS, CLIP Score",
    category: "genai",
    tags: ["评估指标", "FID", "生成模型"],
    summary: "如何客观评估生成模型的质量，理解主流评估指标的原理与应用",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 生成模型评估的挑战",
            body: "生成模型评估是生成式 AI 领域最困难的课题之一。**与分类任务不同，生成任务没有唯一的正确答案，评估必须同时考虑多个维度：样本质量、多样性、模式覆盖以及与条件输入的一致性**。传统的像素级指标如 MSE 或 PSNR 无法反映人类对图像质量的感知，因为两张视觉上几乎相同的图片在像素层面可能有巨大差异。这催生了基于深度特征的评估方法，通过预训练网络提取高维特征空间中的统计量来衡量生成质量。**另一个核心挑战是模式崩溃问题**，生成器可能只学会生成少数几种高质量样本而忽略数据分布的多样性。一个好的评估指标需要同时捕捉质量和多样性，这对设计提出了极高的要求。",
            code: [
                {
                    lang: "python",
                    code: "import torch\nimport torch.nn.functional as F\nfrom torchvision import models\n\n# 加载预训练 Inception 网络作为特征提取器\ninception = models.inception_v3(weights=models.Inception_V3_Weights.DEFAULT)\ninception.fc = torch.nn.Identity()  # 移除分类头\ninception.eval()\n\ndef extract_features(images: torch.Tensor) -> torch.Tensor:\n    \"\"\"提取 2048 维 Inception 特征\"\"\"\n    with torch.no_grad():\n        features = inception(images)\n    return features  # shape: (N, 2048)"
                },
                {
                    lang: "python",
                    code: "import numpy as np\nfrom scipy import linalg\n\ndef compute_statistics(features: np.ndarray):\n    \"\"\"计算特征的均值向量和协方差矩阵\"\"\"\n    mu = np.mean(features, axis=0)\n    sigma = np.cov(features, rowvar=False)\n    return mu, sigma\n\n# 使用示例\nreal_features = extract_features(real_images).numpy()\nfake_features = extract_features(fake_images).numpy()\nmu_r, sigma_r = compute_statistics(real_features)\nmu_f, sigma_f = compute_statistics(fake_features)\nprint(f\"Real mu shape: {mu_r.shape}, Sigma shape: {sigma_r.shape}\")"
                }
            ],
            table: {
                headers: ["评估维度", "描述", "典型指标"],
                rows: [
                    ["图像质量", "单张图像的逼真度", "IS, CLIP Score"],
                    ["多样性", "生成样本的丰富程度", "FID, Precision/Recall"],
                    ["模式覆盖", "是否覆盖真实数据分布", "Recall, Coverage"],
                    ["条件一致性", "生成结果与文本/条件匹配", "CLIP Score, R-precision"]
                ]
            },
            mermaid: `graph LR
    A["生成模型输出"] --> B["特征提取器"]
    B --> C["统计量计算"]
    C --> D["距离/分数度量"]
    D --> E["最终评分"]`,
            tip: "选择评估指标时，应根据具体任务场景决定，单一指标无法全面反映生成模型性能",
            warning: "不要仅依赖单一指标来评估模型，质量与多样性需要综合权衡"
        },
        {
            title: "2. Inception Score (IS) 原理与计算",
            body: "Inception Score 是最早广泛使用的生成图像评估指标之一，由 Salimans 等人在 2016 年提出。其核心思想利用预训练 Inception 网络对生成图像进行预测，从两个维度进行评估。第一个维度是预测概率的清晰度，高质量的图像应该让分类器给出高置信度的预测，这通过计算 KL 散度来衡量。第二个维度是生成样本的多样性，如果模型只生成同一类别的图像，类别边缘分布会很集中，多样性指标就会很低。IS 的计算公式为 exp(E[KL(p(y|x) || p(y))])，其中 p(y|x) 是条件类别分布，p(y) 是边缘类别分布。IS 越高说明生成质量越好且多样性越丰富。**然而 IS 存在明显缺陷，它只评估生成图像而不与真实数据比较**，因此无法检测模式崩溃的严重程度，也无法识别生成了真实数据中不存在的类别。",
            code: [
                {
                    lang: "python",
                    code: "import torch\nimport torch.nn.functional as F\nimport numpy as np\n\ndef compute_inception_score(preds: np.ndarray, splits: int = 10):\n    \"\"\"\n    计算 Inception Score\n    preds: (N, 1000) Inception 网络预测概率\n    \"\"\"\n    scores = []\n    N = preds.shape[0]\n    split_size = N // splits\n\n    for i in range(splits):\n        part = preds[i * split_size : (i + 1) * split_size]\n        # KL 散度: KL(p(y|x) || p(y))\n        marginal = np.mean(part, axis=0)  # p(y)\n        kl = part * (np.log(part) - np.log(marginal))  # KL per sample\n        kl = np.sum(kl, axis=1)  # sum over classes\n        scores.append(np.exp(np.mean(kl)))  # exp(E[KL])\n\n    return np.mean(scores), np.std(scores)\n\nprint(f\"IS = {mean_is:.2f} +/- {std_is:.2f}\")"
                },
                {
                    lang: "python",
                    code: "import torch\nfrom torch.utils.data import DataLoader\nfrom torchvision import transforms\n\n# 完整的 IS 计算流程\n@torch.no_grad()\ndef get_inception_predictions(\n    generator: torch.nn.Module,\n    inception: torch.nn.Module,\n    num_samples: int = 50000,\n    batch_size: int = 100,\n    device: str = \"cuda\"\n):\n    \"\"\"从生成器采样并通过 Inception 获取预测\"\"\"\n    all_preds = []\n    num_batches = num_samples // batch_size\n\n    for _ in range(num_batches):\n        noise = torch.randn(batch_size, 100, device=device)\n        fake_images = generator(noise)\n        fake_images = F.interpolate(fake_images, size=(299, 299), mode=\"bilinear\")\n        preds = torch.softmax(inception(fake_images), dim=1)\n        all_preds.append(preds.cpu().numpy())\n\n    return np.concatenate(all_preds, axis=0)\n\npreds = get_inception_predictions(G, inception, num_samples=50000)\nmean_is, std_is = compute_inception_score(preds)\nprint(f\"Inception Score: {mean_is:.2f} +/- {std_is:.2f}\")"
                }
            ],
            table: {
                headers: ["IS 特性", "说明"],
                rows: [
                    ["优点", "计算简单，不需要真实图像参考"],
                    ["缺点1", "无法检测模式崩溃"],
                    ["缺点2", "对 Inception 类别集合有偏"],
                    ["缺点3", "无法衡量与真实数据的差距"],
                    ["适用场景", "快速初步评估生成质量"]
                ]
            },
            mermaid: `graph TD
    A["生成图像 x"] --> B["Inception 预测 p(y|x)"]
    B --> C["边缘分布 p(y)"]
    C --> D["KL(p(y|x) || p(y))"]
    D --> E["exp(E[KL]) = IS"]`,
            tip: "IS 的标准做法是使用 50000 张生成图像分 10 组计算，取均值和标准差作为最终结果",
            warning: "IS 不包含与真实数据的比较，可能出现生成了高质量但完全偏离真实分布的图像却得到高分的情况"
        },
        {
            title: "3. Fréchet Inception Distance (FID)",
            body: "Fréchet Inception Distance 由 Heusel 等人在 2017 年提出，目前是最主流的生成模型评估指标。FID 的核心思想是将真实图像和生成图像分别通过 Inception 网络映射到 2048 维特征空间，然后假设两个特征集合都服从多元高斯分布，计算两个高斯分布之间的 Fréchet 距离。**FID 同时衡量了生成质量和多样性，因为它比较的是整个分布而非单个样本**。FID 值越小表示两个分布越接近，理论下限为零。与 IS 相比，FID 的关键优势在于它直接比较真实数据和生成数据的分布差异，对模式崩溃更加敏感。然而 FID 也有局限性，它依赖于高斯分布假设，而实际特征分布可能并非严格高斯分布。此外 FID 对样本数量敏感，样本量不足时估计会有较大偏差，**通常需要至少一万张图像才能获得稳定的估计值**。计算协方差矩阵的平方根是 FID 计算的核心步骤，需要使用矩阵平方根运算。",
            code: [
                {
                    lang: "python",
                    code: "import numpy as np\nfrom scipy import linalg\n\ndef calculate_fid(\n    mu1: np.ndarray, sigma1: np.ndarray,\n    mu2: np.ndarray, sigma2: np.ndarray\n) -> float:\n    \"\"\"\n    计算 Fréchet Inception Distance\n    mu1, sigma1: 真实图像特征的均值和协方差\n    mu2, sigma2: 生成图像特征的均值和协方差\n    \"\"\"\n    diff = mu1 - mu2\n    covmean, _ = linalg.sqrtm(sigma1 @ sigma2, disp=False)\n\n    # 处理数值不稳定产生的复数部分\n    if np.iscomplexobj(covmean):\n        covmean = covmean.real\n\n    fid = diff @ diff + np.trace(sigma1) + np.trace(sigma2) - 2 * np.trace(covmean)\n    return float(fid)\n\n# 示例: mu shape=(2048,), sigma shape=(2048, 2048)\nfid_value = calculate_fid(mu_real, sigma_real, mu_fake, sigma_fake)\nprint(f\"FID: {fid_value:.2f}\")  # 越低越好"
                },
                {
                    lang: "python",
                    code: "import torch\nimport numpy as np\nfrom torch.utils.data import DataLoader\n\n@torch.no_grad()\ndef compute_fid_features(\n    model: torch.nn.Module,\n    dataloader: DataLoader,\n    device: str = \"cuda\"\n) -> tuple:\n    \"\"\"从数据加载器提取特征并计算统计量\"\"\"\n    features_list = []\n    model.eval()\n\n    for batch in dataloader:\n        images = batch[0].to(device)\n        if images.shape[1] == 1:\n            images = images.repeat(1, 3, 1, 1)  # 灰度转 RGB\n        images = F.interpolate(images, size=(299, 299), mode=\"bilinear\")\n        features = model(images)\n        features_list.append(features.cpu().numpy())\n\n    all_features = np.concatenate(features_list, axis=0)\n    mu = np.mean(all_features, axis=0)\n    sigma = np.cov(all_features, rowvar=False)\n    return mu, sigma\n\n# 完整 FID 计算\nmu_r, sigma_r = compute_fid_features(inception, real_loader)\nmu_f, sigma_f = compute_fid_features(inception, fake_loader)\nfid = calculate_fid(mu_r, sigma_r, mu_f, sigma_f)\nprint(f\"Fréchet Inception Distance: {fid:.2f}\")"
                }
            ],
            table: {
                headers: ["FID 范围", "生成质量评价"],
                rows: [
                    ["0-10", "极高，接近真实数据分布"],
                    ["10-30", "优秀，常见于先进 GAN"],
                    ["30-60", "良好，多数实用模型"],
                    ["60-100", "一般，有明显改进空间"],
                    ["100+", "较差，模式崩溃或质量低"]
                ]
            },
            mermaid: `graph LR
    A["真实图像"] --> C["Inception 特征"]
    B["生成图像"] --> C
    C --> D["N(mu, sigma)"]
    D --> E["Fréchet 距离"]
    E --> F["FID 分数"]`,
            tip: "FID 计算时应确保真实图像和生成图像数量一致，且至少使用 5000 张图像以获得稳定结果",
            warning: "矩阵平方根计算在协方差矩阵接近奇异时会数值不稳定，需检查特征维度是否远小于样本数量"
        },
        {
            title: "4. CLIP Score 文本-图像对齐评估",
            body: "随着文本到图像生成模型的快速发展，评估生成图像与文本提示之间的一致性成为一个关键问题。**CLIP Score 利用 CLIP 模型的跨模态理解能力，计算图像特征和文本特征在共享嵌入空间中的余弦相似度**。CLIP 在大规模图像-文本对上进行了对比学习训练，能够有效衡量图文语义匹配程度。CLIP Score 的计算非常直接，将图像和文本分别通过 CLIP 的图像编码器和文本编码器得到特征向量，然后计算两者的余弦相似度。该指标的优势在于不需要人工标注，可以自动大规模评估。但 CLIP Score 也有局限，它对 CLIP 训练数据中常见的概念评估效果更好，对罕见概念或新颖组合可能不够准确。此外 CLIP Score 只衡量语义对齐，不评估图像质量，因此需要与 FID 等质量指标配合使用。**实践中通常报告 CLIP Score 和 FID 两个指标来全面评估文本到图像生成模型**。",
            code: [
                {
                    lang: "python",
                    code: "import torch\nimport clip\n\n# 加载 CLIP 模型\ndevice = \"cuda\" if torch.cuda.is_available() else \"cpu\"\nmodel, preprocess = clip.load(\"ViT-B/32\", device=device)\n\n@torch.no_grad()\ndef compute_clip_score(\n    images: torch.Tensor,\n    texts: list[str],\n    batch_size: int = 32\n) -> torch.Tensor:\n    \"\"\"\n    计算批量图像-文本对的 CLIP Score\n    images: (N, 3, 224, 224) 预处理后的图像\n    texts: N 个文本提示\n    \"\"\"\n    text_tokens = clip.tokenize(texts).to(device)\n    image_features = model.encode_image(images)\n    text_features = model.encode_text(text_tokens)\n\n    # 归一化后计算余弦相似度\n    image_features = image_features / image_features.norm(dim=-1, keepdim=True)\n    text_features = text_features / text_features.norm(dim=-1, keepdim=True)\n\n    scores = (image_features * text_features).sum(dim=-1)\n    # 缩放到 [0, 100] 范围\n    scores = scores * 100.0\n    return scores\n\nscores = compute_clip_score(image_batch, text_prompts)\nprint(f\"Mean CLIP Score: {scores.mean().item():.2f}\")"
                },
                {
                    lang: "python",
                    code: "from transformers import CLIPProcessor, CLIPModel\nimport torch\n\n# 使用 HuggingFace transformers 的替代方案\nprocessor = CLIPProcessor.from_pretrained(\"openai/clip-vit-base-patch32\")\nclip_model = CLIPModel.from_pretrained(\"openai/clip-vit-base-patch32\")\n\ndef evaluate_t2i_model(\n    generator, prompts: list[str],\n    images_per_prompt: int = 5\n) -> dict:\n    \"\"\"全面评估文本到图像生成模型\"\"\"\n    all_scores = []\n\n    for prompt in prompts:\n        images = generator.generate(prompt, num_images=images_per_prompt)\n        inputs = processor(\n            text=[prompt] * len(images),\n            images=images,\n            return_tensors=\"pt\",\n            padding=True\n        )\n        outputs = clip_model(**inputs)\n        logits_per_image = outputs.logits_per_image\n        scores = torch.diag(logits_per_image).numpy()\n        all_scores.extend(scores.tolist())\n\n    return {\n        \"mean_clip_score\": np.mean(all_scores),\n        \"std_clip_score\": np.std(all_scores),\n        \"min_score\": np.min(all_scores),\n        \"max_score\": np.max(all_scores)\n    }\n\nresults = evaluate_t2i_model(my_generator, test_prompts)\nprint(f\"CLIP Score: {results['mean_clip_score']:.2f} +/- {results['std_clip_score']:.2f}\")"
                }
            ],
            table: {
                headers: ["指标", "评估对象", "数值范围", "方向"],
                rows: [
                    ["FID", "图像质量+多样性", "[0, +inf)", "越低越好"],
                    ["IS", "质量+多样性(无参考)", "[1, +inf)", "越高越好"],
                    ["CLIP Score", "图文语义对齐", "[0, 100]", "越高越好"],
                    ["R-Precision", "图文检索精度", "[0, 1]", "越高越好"]
                ]
            },
            mermaid: `graph TD
    A["文本提示"] --> B["CLIP 文本编码器"]
    C["生成图像"] --> D["CLIP 图像编码器"]
    B --> E["文本特征向量"]
    D --> F["图像特征向量"]
    E --> G["余弦相似度"]
    F --> G
    G --> H["CLIP Score"]`,
            tip: "建议使用多个不同的文本提示集进行评估，包括简单描述和复杂场景，以获得更全面的 CLIP Score",
            warning: "CLIP Score 高不代表图像质量好，可能生成模糊但语义相关的图像也得到高分，必须与 FID 配合使用"
        },
        {
            title: "5. Precision 和 Recall 用于生成模型",
            body: "传统的 Precision 和 Recall 概念被引入到生成模型评估中，用于分别衡量生成样本的质量和多样性。这一方法由 Kynkaanniemi 等人在 2019 年提出，核心思想是在特征空间中为真实数据构建流形，然后判断生成样本是否落在该流形内。**Precision 反映生成质量、Recall 反映多样性**：前者是落在真实流形内的生成样本比例，后者是被生成流形覆盖的真实样本比例。这种方法的优势在于能够独立分析质量和多样性两个维度，帮助研究者更精确地定位模型的问题。**例如高 Precision 低 Recall 意味着模型生成了高质量但单一类型的样本，即存在模式崩溃**。相反低 Precision 高 Recall 意味着模型覆盖了广泛的模式但单个样本质量不高。计算过程需要在特征空间中使用 K 近邻方法估计流形覆盖范围，对计算资源有一定要求。",
            code: [
                {
                    lang: "python",
                    code: "import torch\n\ndef compute_precision_recall(\n    real_features: torch.Tensor,\n    fake_features: torch.Tensor,\n    k: int = 5\n) -> tuple:\n    \"\"\"\n    计算生成模型的 Precision 和 Recall\n    基于 K 近邻的流形估计方法\n    \"\"\"\n    # 计算真实特征到自身第 k 近邻的距离\n    real_dists = torch.cdist(real_features, real_features)\n    real_dists = torch.sort(real_dists, dim=1)[0]\n    real_radii = real_dists[:, k]  # 第 k 近邻距离\n\n    # 计算生成特征到真实特征的距离\n    fake_to_real = torch.cdist(fake_features, real_features)\n    # Precision: 生成样本有多少在真实流形内\n    precision = (fake_to_real < real_radii.unsqueeze(0)).any(dim=1).float().mean()\n\n    # 计算生成特征到自身第 k 近邻的距离\n    fake_dists = torch.cdist(fake_features, fake_features)\n    fake_dists = torch.sort(fake_dists, dim=1)[0]\n    fake_radii = fake_dists[:, k]\n    # Recall: 真实样本有多少被生成分布覆盖\n    real_to_fake = torch.cdist(real_features, fake_features)\n    recall = (real_to_fake < fake_radii.unsqueeze(0)).any(dim=1).float().mean()\n\n    return precision.item(), recall.item()\n\np, r = compute_precision_recall(real_feats, fake_feats, k=5)\nprint(f\"Precision: {p:.4f}, Recall: {r:.4f}\")"
                },
                {
                    lang: "python",
                    code: "import numpy as np\nimport torch\n\nclass ImprovedPrecisionRecall:\n    \"\"\"改进的 Precision/Recall 计算(Mani 等人 2020)\"\"\"\n\n    def __init__(self, k: int = 5, num_center: int = 20000):\n        self.k = k\n        self.num_center = num_center\n\n    def _compute_nearest_distances(self, X, Y):\n        \"\"\"计算 X 中每个点到 Y 的第 k 近邻距离\"\"\"\n        dists = torch.cdist(X, Y)\n        knn_dists = torch.topk(dists, k=self.k + 1, largest=False)[0]\n        return knn_dists[:, -1]  # 第 k 近邻距离\n\n    def fit(self, real_features: torch.Tensor, fake_features: torch.Tensor):\n        \"\"\"拟合真实和生成分布的流形\"\"\"\n        r_idx = torch.randperm(len(real_features))[:self.num_center]\n        f_idx = torch.randperm(len(fake_features))[:self.num_center]\n\n        self.real_centers = real_features[r_idx]\n        self.fake_centers = fake_features[f_idx]\n\n        self.real_radii = self._compute_nearest_distances(\n            self.real_centers, real_features\n        )\n        self.fake_radii = self._compute_nearest_distances(\n            self.fake_centers, fake_features\n        )\n\n    def compute(self, real_features, fake_features):\n        \"\"\"计算 Precision 和 Recall\"\"\"\n        precision = self._compute_fraction_inside(\n            fake_features, self.real_centers, self.real_radii\n        )\n        recall = self._compute_fraction_inside(\n            real_features, self.fake_centers, self.fake_radii\n        )\n        return precision, recall\n\npr = ImprovedPrecisionRecall(k=5)\npr.fit(real_feats, fake_feats)\nprecision, recall = pr.compute(real_feats, fake_feats)\nf_score = 2 * precision * recall / (precision + recall + 1e-8)\nprint(f\"P={precision:.3f}, R={recall:.3f}, F={f_score:.3f}\")"
                }
            ],
            table: {
                headers: ["场景", "Precision", "Recall", "问题诊断"],
                rows: [
                    ["模式崩溃", "高", "低", "生成质量高但种类少"],
                    ["过度泛化", "低", "高", "覆盖广但质量差"],
                    ["理想状态", "高", "高", "质量与多样性兼备"],
                    ["完全失败", "低", "低", "模型未收敛或训练不当"]
                ]
            },
            mermaid: `graph TD
    A["真实数据分布"] --> B["真实流形 M_real"]
    C["生成数据分布"] --> D["生成分布流形 M_fake"]
    B --> E["Precision = M_fake 落入 M_real 比例"]
    D --> F["Recall = M_real 被 M_fake 覆盖比例"]
    E --> G["质量评估"]
    F --> H["多样性评估"]`,
            tip: "K 值的选择会影响结果，较小的 K 对异常值更敏感，较大的 K 估计更平滑但计算成本更高，建议 K=3 到 5",
            warning: "Precision 和 Recall 计算在高维特征空间中对距离度量敏感，确保特征已归一化且维度适当"
        },
        {
            title: "6. 人工评估方法",
            body: "尽管自动化指标如 FID 和 CLIP Score 已被广泛采用，**人工评估仍然是生成模型评估的金标准**。自动化指标可能与人主观感知存在偏差，特别是对于创意性任务，机器指标难以完全捕捉人类的审美标准。常用的人工评估方法包括平均意见评分、两两比较、真实与生成图像辨别和条件一致性评分。平均意见评分让评估者对生成图像从一到五分进行打分，结果直观但成本高且受主观因素影响。两两比较让评估者在两张图像中选择更偏好的一张，可以减少评分偏差但需要更多比较次数。真实与生成图像辨别任务测试人类能否区分真实图像和生成图像，如果人类无法区分则说明生成质量极高。条件一致性评分专门针对文本到图像生成，评估者判断生成图像是否符合文本描述。**近年来研究者尝试将人工评估与自动化指标结合，通过人类反馈来校准自动指标**，提高其与人感知的一致性。",
            code: [
                {
                    lang: "python",
                    code: "import csv\nfrom dataclasses import dataclass\nfrom typing import List\n\n@dataclass\nclass HumanEvalSample:\n    image_id: str\n    prompt: str\n    mos_score: float      # 1-5 平均意见评分\n    realism_score: float  # 1-5 真实度评分\n    alignment_score: float  # 1-5 图文一致性评分\n    is_real_guess: bool   # 人类猜是否真实\n\ndef analyze_human_eval(samples: List[HumanEvalSample]) -> dict:\n    \"\"\"分析人工评估结果\"\"\"\n    n = len(samples)\n    mos = sum(s.mos_score for s in samples) / n\n    realism = sum(s.realism_score for s in samples) / n\n    alignment = sum(s.alignment_score for s in samples) / n\n    # 人类辨别准确率（理想情况应接近 50%）\n    accuracy = sum(1 for s in samples if s.is_real_guess) / n\n\n    return {\n        \"num_evaluations\": n,\n        \"mean_opinion_score\": round(mos, 3),\n        \"mean_realism_score\": round(realism, 3),\n        \"mean_alignment_score\": round(alignment, 3),\n        \"human_accuracy\": round(accuracy, 3)\n    }\n\n# 从 CSV 读取评估结果\nresults = []\nwith open(\"human_eval_results.csv\") as f:\n    reader = csv.DictReader(f)\n    for row in reader:\n        results.append(HumanEvalSample(**row))\n\nstats = analyze_human_eval(results)\nprint(f\"MOS: {stats['mean_opinion_score']}, Human Acc: {stats['human_accuracy']}\")"
                },
                {
                    lang: "python",
                    code: "import numpy as np\nfrom scipy import stats\n\ndef pairwise_preference_analysis(\n    preferences: np.ndarray,\n    model_names: list[str]\n) -> dict:\n    \"\"\"\n    分析两两比较实验结果\n    preferences[i,j] = model_i 胜过 model_j 的次数\n    \"\"\"\n    n_models = len(model_names)\n    total_comparisons = preferences + preferences.T\n\n    # Elo 风格的胜率计算\n    win_rates = np.zeros(n_models)\n    for i in range(n_models):\n        for j in range(n_models):\n            if i != j and total_comparisons[i, j] > 0:\n                win_rates[i] += preferences[i, j] / total_comparisons[i, j]\n    win_rates /= (n_models - 1)\n\n    # 统计显著性检验\n    significance = {}\n    for i in range(n_models):\n        for j in range(i + 1, n_models):\n            n = total_comparisons[i, j]\n            if n > 0:\n                p_value = stats.binom_test(\n                    preferences[i, j], n, p=0.5\n                )\n                significance[f\"{model_names[i]} vs {model_names[j]}\"] = {\n                    \"preference_ratio\": preferences[i, j] / n,\n                    \"p_value\": round(p_value, 4),\n                    \"significant\": p_value < 0.05\n                }\n\n    return {\"win_rates\": dict(zip(model_names, win_rates)), \"significance\": significance}\n\n# 示例: preferences[i,j] 表示模型 i 胜过模型 j 的次数\nprefs = np.array([[0, 60, 45], [40, 0, 30], [55, 70, 0]])\nresult = pairwise_preference_analysis(prefs, [\"ModelA\", \"ModelB\", \"ModelC\"])\nprint(result)"
                }
            ],
            table: {
                headers: ["评估方法", "成本", "可靠性", "适用场景"],
                rows: [
                    ["平均意见评分", "高", "中", "通用质量评估"],
                    ["两两比较", "中高", "高", "模型排序对比"],
                    ["真实与生成辨别", "中", "高", "评估逼真度"],
                    ["条件一致性评分", "高", "高", "文本到图像评估"],
                    ["FID/IS 自动指标", "低", "中", "快速迭代优化"]
                ]
            },
            mermaid: `graph LR
    A["人工评估设计"] --> B["选择评估者"]
    B --> C["制定评分标准"]
    C --> D["收集评分数据"]
    D --> E["统计分析"]
    E --> F["与自动指标对比"]
    F --> G["校准自动指标"]`,
            tip: "进行人工评估时应确保评估者数量充足，建议至少 20 名评估者，并使用 Cohen Kappa 系数评估评分者间一致性",
            warning: "人工评估结果受评估者文化背景和经验影响，跨文化比较时需要特别谨慎，建议在报告评估结果时注明评估者构成"
        },
        {
            title: "7. torchmetrics 实战计算",
            body: "在实际项目中，推荐使用 torchmetrics 库来简化生成模型评估指标的计算。torchmetrics 提供了 FID、KID、Inception Score 等多种指标的官方实现，支持增量计算和分布式训练。**使用 torchmetrics 的主要优势在于 API 统一、底层优化良好、支持 GPU 加速和大规模数据集处理**。FID 指标在 torchmetrics 中的实现基于干净的 InceptionV3 特征提取，自动处理图像预处理和统计计算。KID 即 Kernel Inception Distance 是 FID 的无偏估计版本，使用多项式核的 MMD 统计量。对于文本到图像生成任务，可以结合 torchmetrics 的 CLIP 相关指标和自定义评估流程。**在实际部署时，建议建立一个评估流水线**，在训练过程中定期计算关键指标并记录到 TensorBoard 或 WandB，以便跟踪模型改进趋势。",
            code: [
                {
                    lang: "python",
                    code: "import torch\nfrom torchmetrics.image.fid import FrechetInceptionDistance\nfrom torchmetrics.image.kid import KernelInceptionDistance\nfrom torchmetrics.image.inception import InceptionScore\n\n# FID 计算\nfid = FrechetInceptionDistance(feature=2048)\nfid.update(real_images, real=True)\nfid.update(fake_images, real=False)\nfid_score = fid.compute()\nprint(f\"FID: {fid_score:.2f}\")\n\n# KID (Kernel Inception Distance) - 无偏估计\nkid = KernelInceptionDistance(subset_size=1000)\nkid.update(real_images, real=True)\nkid.update(fake_images, real=False)\nkid_mean, kid_std = kid.compute()\nprint(f\"KID: {kid_mean:.4f} +/- {kid_std:.4f}\")\n\n# Inception Score\ninception = InceptionScore()\ninception.update(fake_images)\nis_mean, is_std = inception.compute()\nprint(f\"IS: {is_mean:.2f} +/- {is_std:.2f}\")"
                },
                {
                    lang: "python",
                    code: "import torch\nfrom torchmetrics.image.fid import FrechetInceptionDistance\nfrom torch.utils.tensorboard import SummaryWriter\nimport os\n\nclass GenerationEvaluator:\n    \"\"\"集成化的生成模型评估器\"\"\"\n\n    def __init__(self, device: str = \"cuda\", log_dir: str = \"logs\"):\n        self.device = device\n        self.fid = FrechetInceptionDistance(feature=2048).to(device)\n        self.writer = SummaryWriter(log_dir)\n        os.makedirs(\"checkpoints\", exist_ok=True)\n\n    def evaluate_epoch(\n        self,\n        generator: torch.nn.Module,\n        real_loader: torch.utils.data.DataLoader,\n        epoch: int,\n        num_samples: int = 5000\n    ) -> dict:\n        \"\"\"每个 epoch 评估生成模型\"\"\"\n        generator.eval()\n\n        # 更新真实数据特征\n        for batch in real_loader:\n            self.fid.update(batch[0].to(self.device), real=True)\n\n        # 生成图像并更新\n        with torch.no_grad():\n            noise = torch.randn(num_samples, 100, device=self.device)\n            fake_images = generator(noise)\n            self.fid.update(fake_images, real=False)\n\n        fid_score = self.fid.compute().item()\n\n        # 记录到 TensorBoard\n        self.writer.add_scalar(\"Metrics/FID\", fid_score, epoch)\n        self.writer.add_images(\"Generated\", fake_images[:8], epoch)\n\n        # 保存最佳模型\n        if fid_score < getattr(self, \"best_fid\", float(\"inf\")):\n            self.best_fid = fid_score\n            torch.save(generator.state_dict(), \"checkpoints/best_generator.pt\")\n            print(f\"New best FID: {fid_score:.2f} at epoch {epoch}\")\n\n        self.fid.reset()\n        return {\"fid\": fid_score, \"best_fid\": self.best_fid}\n\nevaluator = GenerationEvaluator(device=\"cuda\")\nfor epoch in range(num_epochs):\n    train_one_epoch(generator, dataloader, epoch)\n    metrics = evaluator.evaluate_epoch(generator, real_loader, epoch)\n    print(f\"Epoch {epoch}: FID={metrics['fid']:.2f}\")"
                }
            ],
            table: {
                headers: ["torchmetrics 指标", "类名", "关键参数", "计算开销"],
                rows: [
                    ["FID", "FrechetInceptionDistance", "feature: 64/192/768/2048", "中"],
                    ["KID", "KernelInceptionDistance", "subset_size: 子集大小", "中高"],
                    ["IS", "InceptionScore", "splits: 分组数", "低"],
                    ["LPIPS", "LearnedPerceptualImagePatchSimilarity", "net_type: alex/vgg", "低"],
                    ["SSIM", "StructuralSimilarityIndexMeasure", "data_range: 数据范围", "极低"]
                ]
            },
            mermaid: `graph TD
    A["训练循环"] --> B["生成样本"]
    B --> C["torchmetrics 更新"]
    C --> D["compute 指标"]
    D --> E["TensorBoard 记录"]
    E --> F["检查最佳模型"]
    F --> G["保存 checkpoint"]`,
            tip: "使用 torchmetrics 时调用 reset() 方法很重要，否则指标会在多个 epoch 之间累积导致结果错误",
            warning: "FID 计算需要较大内存存储协方差矩阵，2048 维特征约 32MB，在显存有限的情况下可以分批更新或使用较小的 feature 维度"
        }
    ],
};
