const fs = require('fs');

// === Add code to prac-002.ts ===
let kb = fs.readFileSync('src/data/articles/prac-002.ts', 'utf-8');
const kbCode = `
      code: [
        {
          lang: "python",
          title: "ndcg_eval.py — NDCG 评估指标计算",
          code: \`import numpy as np

def dcg_at_k(relevance_scores, k):
    """计算 Discounted Cumulative Gain"""
    scores = np.array(relevance_scores[:k])
    discounts = np.log2(np.arange(2, len(scores) + 2))
    return np.sum(scores / discounts)

def ndcg_at_k(relevance_scores, ideal_scores, k):
    """计算 Normalized DCG"""
    dcg = dcg_at_k(relevance_scores, k)
    ideal_dcg = dcg_at_k(ideal_scores, k)
    return dcg / ideal_dcg if ideal_dcg > 0 else 0.0

# 示例: 评估 Top-5 搜索结果
results = [3, 2, 0, 1, 2]  # 实际相关性分数 (0-3)
ideal =   [3, 3, 2, 2, 1]  # 理想排序
print(f"NDCG@5 = {ndcg_at_k(results, ideal, 5):.4f}")  # 约 0.7927\`,
        }
      ],`;

// Insert after section 7's warning
const kbMarker = '评估指标的「表面数字」可能误导你';
const kbIdx = kb.indexOf(kbMarker);
const kbEnd = kb.indexOf('"', kbIdx + kbMarker.length) + 1;
kb = kb.substring(0, kbEnd) + kbCode + kb.substring(kbEnd);
fs.writeFileSync('src/data/articles/prac-002.ts', kb);
console.log('Added code to prac-002.ts');

// === Add more content to blog-141.ts ===
let blog = fs.readFileSync('src/data/blogs/blog-141.ts', 'utf-8');

// Add content to section 8 (趋势预判) - more depth
const oldSection8 = '预判：到 2028 年，**AI 治理平台**将成为企业 AI 基础设施的**标准组件**';
const newSection8 = `预判：到 2028 年，**AI 治理平台**将成为企业 AI 基础设施的**标准组件**——类似于今天的**安全合规平台**和**数据治理平台**。云厂商将提供**内置的 AI 治理工具**，帮助企业满足监管要求。

**趋势六（补充）：AI 模型编排的标准化**

随着多模型共存成为常态，**模型编排（Model Orchestration）** 将走向**标准化**。当前的模型路由、故障转移、成本优化等逻辑大多由**各企业自行实现**，缺乏统一标准。未来可能出现**类似 Kubernetes 之于容器编排的模型编排标准**——定义统一的**模型接入协议、路由策略描述语言、服务质量 SLA 规范**。

**预判：到 2028 年，可能出现 **CNCF（云原生计算基金会）旗下的模型编排项目**，成为多模型架构的事实标准。`;

blog = blog.replace(oldSection8, newSection8);
fs.writeFileSync('src/data/blogs/blog-141.ts', blog);
console.log('Added content to blog-141.ts');
