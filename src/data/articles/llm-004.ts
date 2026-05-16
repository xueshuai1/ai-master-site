import { Article } from '../knowledge';

export const article: Article = {
    id: "llm-004",
    title: "大语言模型预训练：数据准备与训练策略完全指南",
    category: "llm",
    tags: ["预训练", "数据工程", "训练策略", "数据清洗", "Tokenization", "混合精度训练"],
    summary: "大语言模型预训练的全流程——从数据收集、清洗、去重、Tokenization 到训练策略、学习率调度、分布式训练",
    date: "2026-05-13",
    readTime: "26 min",
    level: "高级",
    content: [
      {
        title: "1. 预训练是什么？为什么数据决定模型上限",
        body: `预训练（Pre-training）是大语言模型生命周期中最核心的环节。它决定了模型的知识容量、语言能力和推理基础——后续的微调（Fine-tuning）和对齐（Alignment）只能在这个基础上优化，而无法突破预训练设定的能力天花板。

预训练的核心思想很简单：让模型在海量文本数据上学习语言的统计规律和世界的知识表示。具体来说，模型通过自监督学习（Self-Supervised Learning）的方式，预测文本中的下一个 Token（Next Token Prediction），在这个过程中逐渐学会语法、语义、常识推理和专业知识。

数据决定模型上限：一个模型的能力上限取决于它在预训练阶段见过多少高质量数据。如果预训练数据只有 100 GB，模型可能连基本的常识都无法掌握；如果预训练数据达到 **10 TB**（如 GPT-4 级别），模型就能展现出令人惊叹的涌现能力（Emergent Abilities）——零样本学习、多步推理、代码生成。

预训练的三大支柱：

数据（Data）——预训练的质量70% 取决于数据。数据的规模（多少 Token）、质量（文本是否干净、信息密度是否高）、多样性（是否覆盖多语言、多领域、多文体）共同决定了模型的能力边界。

架构（Architecture）——Transformer 架构、注意力机制的类型、层数、隐藏维度等。架构决定了模型的参数容量和表达能力，但架构的改进空间已经相对有限——当前主流模型都基于相似的 Transformer 变体。

训练策略（Training Strategy）——学习率调度、优化器选择、批次大小、训练步数等。好的训练策略可以最大化数据的利用效率，差的训练策略则可能浪费大量计算资源。

预训练成本：

训练一个 70B 参数的模型，使用 6 万亿 Token 的预训练数据，大约需要 100 万 GPU 小时（以 A100 80GB 为例），按云成本约 500-1000 万美元。这就是为什么说数据质量至关重要——如果数据质量差，这 1000 万美元就打水漂了。`,
        mermaid: `graph TD
    A["原始数据收集"] --> B["数据清洗\n去重/过滤/去毒"]
    B --> C["数据分类与配比"]
    C --> D["Tokenization\n分词器训练"]
    D --> E["预训练\nNext Token Prediction"]
    E --> F["检查点保存\n评估验证"]
    F --> G["后训练\nSFT + RLHF"]
    class A s0
    class B s1
    class C s1
    class D s2
    class E s2
    class F s3
    class G s3
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#0c4a6e
    classDef s2 fill:#14532d
    classDef s3 fill:#7c2d12`,
        tip: "预训练的核心认知：数据质量 > 数据数量 > 模型架构 > 训练策略。在预算有限的情况下，优先把钱花在数据工程上——清洗、去重、分类，比买更多的 GPU 划算得多。",
        warning: "预训练最大的误区是「越多越好」——不加筛选地把所有能找到的数据都喂给模型。低质量数据（如 SEO 垃圾、机器生成文本、重复内容）不仅不能提升模型能力，反而会损害模型的语言质量和推理能力。宁可只用 1 TB 高质量数据，也不要用 10 TB 混合质量数据。",
      },
      {
        title: "2. 数据收集：构建预训练语料库的完整流程",
        body: `预训练语料库的构建是预训练流程中最耗时、最复杂的环节。一个高质量的语料库需要覆盖多种数据类型，每种类型都有其独特的价值和挑战。

网页数据：

网页数据是预训练语料库中占比最大的部分（通常 40-60%）。主要来源包括：

**Common Crawl**——一个非营利组织维护的大规模网页爬虫数据集，每两个月更新一次，包含数百亿个网页的原始 HTML。这是几乎所有开源大模型的基础数据来源。但 Common Crawl 的原始数据质量参差不齐——包含大量广告、导航菜单、SEO 垃圾和机器生成文本。

精选网页数据集——如 **C4**（Colossal Clean Crawled Corpus）、**RefinedWeb**（Falcon 模型使用）、**FineWeb**（Hugging Face 推出）等。这些数据集在 Common Crawl 的基础上进行了深度清洗和过滤，质量显著高于原始数据。

学术与专业数据：

学术数据为模型提供深度知识和专业推理能力。主要来源包括：

**arXiv**——超过 200 万篇学术论文的全文，覆盖物理学、计算机科学、数学、生物学等领域。

**PubMed**——生物医学领域的学术论文和摘要。

书籍和教科书——提供系统性、结构化的知识。书籍的质量远高于网页，因为经过编辑和同行评审。

代码数据：

代码数据让模型学会编程能力和逻辑推理。主要来源包括：

**GitHub**——全球最大的代码托管平台，包含数十亿个代码仓库。需要过滤掉非代码文件（图片、二进制文件）、低质量仓库（只有 README、自动生成的代码）和许可证受限的代码。

**Stack Overflow**——编程问答社区，提供代码 + 解释的高质量配对数据。

多语言数据：

如果目标是构建多语言模型，需要收集多种语言的数据。主流做法是：

高资源语言（英语、中文、西班牙语、法语等）——数据量充足，质量较高。

低资源语言（阿拉伯语、印地语、斯瓦希里语等）——数据量有限，需要特别收集和处理。

数据配比的重要性：

不同数据类型的配比直接影响模型的能力倾向。如果网页数据占比过高，模型可能擅长通用对话但代码能力弱；如果代码数据占比过高，模型可能在数学和逻辑推理上表现更好但自然语言流畅度下降。

典型的配比方案（以 Llama 3 为例）：67% 网页 + 4.5% 代码 + 4.5% 学术 + 8% 多语言 + 16% 其他。`,
        code: [
          {
            lang: "python",
            code: `# 预训练数据收集 Pipeline 示例
import requests
from typing import List, Dict
import hashlib

class DataCollector:
    """预训练数据收集器"""
    
    def __init__(self, output_dir: str, target_size_gb: float = 100):
        self.output_dir = output_dir
        self.target_bytes = int(target_size_gb * 1e9)
        self.collected_bytes = 0
        self.seen_hashes = set()
    
    def fetch_common_crawl(self, snapshot: str) -> List[str]:
        """从 Common Crawl 获取指定快照的 URL 列表"""
        index_url = f"https://index.commoncrawl.org/{snapshot}-index"
        # 实际实现需要解析 CDX 索引
        return []  # 简化示例
    
    def download_and_dedup(self, url: str) -> bool:
        """下载网页并去重"""
        try:
            resp = requests.get(url, timeout=10)
            content = resp.text
            
            # 计算内容哈希（用于去重）
            content_hash = hashlib.sha256(
                content.encode()
            ).hexdigest()
            
            if content_hash in self.seen_hashes:
                return False  # 重复内容，跳过
            
            self.seen_hashes.add(content_hash)
            
            # 写入文件
            filename = f"{content_hash[:12]}.txt"
            with open(f"{self.output_dir}/{filename}", "w") as f:
                f.write(content)
            
            self.collected_bytes += len(content.encode())
            return True
        except Exception:
            return False
    
    def collect_stats(self) -> Dict:
        """收集统计信息"""
        return {
            "total_bytes": self.collected_bytes,
            "total_gb": self.collected_bytes / 1e9,
            "progress": self.collected_bytes / self.target_bytes,
            "unique_pages": len(self.seen_hashes),
        }

# 使用示例
# collector = DataCollector("./raw_data", target_size_gb=500)
# urls = collector.fetch_common_crawl("CC-MAIN-2024-10")
# for url in urls[:100000]:
#     collector.download_and_dedup(url)
# print(collector.collect_stats())`
          }
        ],
        table: {
          headers: ["数据类型", "典型占比", "信息密度", "主要来源", "清洗难度"],
          rows: [
            ["网页", "40-60%", "低-中", "Common Crawl, RefinedWeb", "高（广告/SEO/重复）"],
            ["学术", "5-15%", "高", "arXiv, PubMed, 书籍", "中（格式不统一）"],
            ["代码", "3-10%", "极高", "GitHub, Stack Overflow", "中（需过滤非代码）"],
            ["对话", "1-5%", "中", "Reddit, 论坛, 聊天记录", "高（低质量内容多）"],
            ["多语言", "5-20%", "中-高", "Wikipedia, 多语言网页", "高（语言检测）"],
          ]
        },
        tip: "数据收集的最佳实践：优先使用已经清洗过的数据集（如 RefinedWeb、FineWeb），而不是从零开始爬取和清洗 Common Crawl。这些数据集由专业团队维护，清洗质量有保证，可以节省数月的数据工程时间。",
        warning: "数据收集阶段最常见的错误是忽视版权和许可证问题。GitHub 上的代码、学术论文的全文、书籍的内容都受到版权保护。在商业用途中使用这些数据可能面临法律风险。务必在数据收集阶段就做好许可证筛选（License Filtering），只保留允许商业使用的数据。",
      },
      {
        title: "3. 数据清洗：从原始文本到高质量语料",
        body: `数据清洗是预训练数据工程中最重要的环节。原始数据中通常包含 60-90% 的低质量内容，如果不经过清洗直接使用，会严重损害模型的质量。

去重（Deduplication）：

数据重复是预训练语料库中最常见的问题。同一篇文章可能出现在多个网站上（转载、镜像、缓存），同一个 GitHub 仓库可能被多次 fork。如果不对这些重复内容进行处理，模型会在相同的内容上反复学习，导致过拟合——模型对重复内容的记忆能力很强，但对未见过内容的泛化能力很差。

去重的两个层次：

精确去重（Exact Deduplication）——对整篇文档计算 **MinHash** 或 **SHA256** 哈希值，移除哈希值完全相同的文档。这种方法可以消除完全重复的内容，但无法处理轻微修改后的重复（如改写几个词、调整段落顺序）。

模糊去重（Fuzzy Deduplication）——使用 MinHash + LSH（Locality Sensitive Hashing） 或 **SimHash** 技术，找出相似度超过阈值（如 80%）的文档对，并移除其中一个。这种方法可以消除近似重复的内容，但计算成本更高。

过滤（Filtering）：

过滤的目标是移除低质量和有害的内容。主要过滤维度包括：

语言过滤——确保数据中的文本是目标语言。使用 fastText 语言分类器可以准确识别文档的语言。对于多语言模型，需要保留多种语言，但对每种语言单独标记。

质量过滤——移除低质量文本。判断标准包括：

- 困惑度（Perplexity）：使用一个小的语言模型（如 GPT-2）计算文本的困惑度。困惑度越高的文本越「不像自然语言」，可能是机器生成的垃圾或乱码。

- 文本统计特征：移除过短的文本（< 200 字）、符号比例异常（如全是 emoji 或特殊字符）、单词重复率过高的文本。

- HTML 残留：移除仍然包含 HTML 标签、JavaScript 代码、CSS 样式的文本。

毒性过滤（De-toxication）——移除包含仇恨言论、暴力内容、色情内容、个人信息泄露的文本。这对模型的安全性至关重要——如果预训练数据中包含大量毒性内容，模型在生成文本时也会倾向于产生毒性内容。`,
        code: [
          {
            lang: "python",
            code: `# 预训练数据质量过滤 Pipeline
import re
from typing import Optional

class TextFilter:
    """文本质量过滤器"""
    
    def __init__(self, min_length: int = 200,
                 max_special_char_ratio: float = 0.1,
                 max_repetition_ratio: float = 0.3,
                 perplexity_threshold: float = 1000):
        self.min_length = min_length
        self.max_special_char_ratio = max_special_char_ratio
        self.max_repetition_ratio = max_repetition_ratio
        self.perplexity_threshold = perplexity_threshold
    
    def is_valid_length(self, text: str) -> bool:
        """检查文本长度是否合理"""
        return len(text.strip()) >= self.min_length
    
    def has_html_tags(self, text: str) -> bool:
        """检查是否残留 HTML 标签"""
        html_pattern = r'<[^>]+>'
        return bool(re.search(html_pattern, text))
    
    def special_char_ratio(self, text: str) -> float:
        """计算特殊字符占比"""
        if not text:
            return 0
        special_chars = sum(1 for c in text 
                          if not c.isalnum() and not c.isspace()
                          and c not in '，。！？、；：""''（）【】《》')
        return special_chars / len(text)
    
    def repetition_ratio(self, text: str) -> float:
        """计算重复内容占比（基于 n-gram）"""
        words = text.split()
        if len(words) < 10:
            return 0
        # 检查连续重复的 trigram
        trigrams = [tuple(words[i:i+3]) for i in range(len(words)-2)]
        if not trigrams:
            return 0
        unique_trigrams = set(trigrams)
        return 1 - len(unique_trigrams) / len(trigrams)
    
    def filter(self, text: str) -> Optional[str]:
        """综合过滤，返回清洗后的文本或 None"""
        if not self.is_valid_length(text):
            return None
        if self.has_html_tags(text):
            return None
        if self.special_char_ratio(text) > self.max_special_char_ratio:
            return None
        if self.repetition_ratio(text) > self.max_repetition_ratio:
            return None
        # perplexity 检查需要加载语言模型，此处省略
        return text.strip()

# 使用示例
# filter = TextFilter(min_length=200)
# with open("raw_data.txt") as f:
#     for line in f:
#         cleaned = filter.filter(line)
#         if cleaned:
#             # 写入清洗后的数据
#             pass`
          }
        ],
        table: {
          headers: ["过滤维度", "过滤什么", "常用方法", "典型过滤率"],
          rows: [
            ["精确去重", "完全相同的文档", "SHA256 / MD5 哈希", "10-30%"],
            ["模糊去重", "近似重复的文档", "MinHash + LSH", "15-25%"],
            ["语言过滤", "非目标语言的文档", "fastText 分类器", "20-50%（取决于来源）"],
            ["质量过滤", "低质量/乱码/垃圾文本", "困惑度 + 统计特征", "30-60%"],
            ["毒性过滤", "仇恨/暴力/色情内容", "关键词 + 分类器", "1-5%"],
            ["HTML 残留", "包含 HTML/JS/CSS 的文本", "正则表达式", "5-15%"],
          ]
        },
        tip: "数据清洗的黄金法则：宁可丢弃好数据，不可保留坏数据。如果一篇文档的质量处于边界状态（不确定是好是坏），丢弃它。保留一篇坏文档对模型的负面影响，远大于丢弃一篇好文档的损失。",
        warning: "毒性过滤是一个容易被低估的环节。即使毒性内容只占预训练数据的 1%，模型也可能在生成时产生不可预测的毒性输出。因为模型的生成是概率性的，即使是少数毒性模式也可能在特定触发条件下被激活。务必在毒性过滤环节投入足够的精力。",
      },
      {
        title: "4. Tokenization：将文本转化为模型可理解的单元",
        body: `**Tokenization**（分词）是将原始文本切分为模型可以处理的离散单元（Token）的过程。它是预训练流程中连接原始文本和模型架构的桥梁，分词器的质量直接影响模型的学习效率和表达能力。

为什么需要 Tokenization？

神经网络无法直接处理字符串——它们需要数字作为输入。Tokenization 的作用就是将任意长度的文本映射为整数序列，然后模型通过嵌入层（Embedding Layer）将整数转换为向量。

主流分词算法：

BPE（Byte-Pair Encoding）——最广泛使用的分词算法。它的核心思想是从字符级别开始，通过迭代合并最频繁出现的字符对，逐步构建词汇表。

例如，初始词汇表包含所有单字符（a, b, c, ...），然后统计所有相邻字符对的出现频率。如果 "th" 是最高频的字符对，就将 "th" 合并为一个 Token。重复这个过程，直到词汇表达到目标大小（如 50,000 或 100,000）。

BPE 的优势是：它可以在词汇表大小和Token 粒度之间灵活权衡。词汇表越大，单个 Token 可以表示更长的词或词组，文本的 Token 数越少（推理成本越低），但词汇表的存储开销越大。

**WordPiece**——Google 提出的分词算法，与 BPE 类似，但在合并时使用的是语言模型似然而非简单的频率统计。BERT 系列模型使用 WordPiece。

**SentencePiece**——Google 提出的统一分词框架，支持 BPE 和 Unigram 两种算法。它的特点是不需要预分词（不需要先按空格分割），可以直接处理任意语言的文本（包括中文、日文等不分词的语言）。

分词器大小的权衡：

小词汇表（16K-32K Token）——每个 Token 代表的文本较短，同样长度的文本需要更多的 Token。优点是嵌入层参数少（嵌入层大小 = 词汇表大小 × 嵌入维度），模型更紧凑。缺点是推理速度慢（需要处理更多 Token）。

大词汇表（100K-256K Token）——每个 Token 可以表示更长的词或词组，同样长度的文本需要更少的 Token。优点是推理速度快、Token 效率高。缺点是嵌入层参数多（256K × 4096 维 = 约 4 GB，仅嵌入层就占模型总参数的 5-10%）。

多语言分词的挑战：

对于多语言模型，分词器需要处理多种语言的文本。不同语言的字符集和词法规则差异很大：

英语——单词之间用空格分隔，BPE 效果很好。

中文——没有天然的分词边界，需要分词器学会识别词的边界。SentencePiece 可以直接处理中文字符，但效率较低（每个汉字一个 Token）。专门的中文分词器（如 Jieba + BPE）可以更高效地处理中文。

日文——混合使用汉字、平假名、片假名，分词复杂度更高。

阿拉伯语——从右向左书写，字符有连写形态。

分词器训练：

训练分词器需要高质量的语料库。通常使用预训练语料库的一个子集（如 10-100 GB 文本）来训练分词器。训练过程：

1. 对语料库进行字符频率统计
2. 使用选定的算法（BPE / WordPiece / Unigram）迭代合并字符对
3. 当词汇表达到目标大小时停止

训练完成后，分词器就可以用于将任何文本转换为 Token 序列。`,
        code: [
          {
            lang: "python",
            code: `# 训练 BPE 分词器示例
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import Whitespace
from tokenizers.processors import TemplateProcessing

# 创建 BPE 分词器
tokenizer = Tokenizer(BPE(unk_token="[UNK]"))

# 设置预分词器
tokenizer.pre_tokenizer = Whitespace()

# 配置训练器
trainer = BpeTrainer(
    vocab_size=50000,           # 词汇表大小
    min_frequency=2,            # 最小出现频率
    special_tokens=[
        "[PAD]", "[UNK]", "[CLS]", 
        "[SEP]", "[MASK]"
    ],
    show_progress=True
)

# 训练分词器
files = ["corpus_part_1.txt", "corpus_part_2.txt"]
tokenizer.train(files, trainer)

# 保存分词器
tokenizer.save("tokenizer.json")
tokenizer.model.save("tokenizer", "bpe")

# 使用分词器
from tokenizers import Tokenizer
tokenizer = Tokenizer.from_file("tokenizer.json")

text = "预训练是大语言模型的核心环节"
encoded = tokenizer.encode(text)
print(f"文本: {text}")
print(f"Token 数: {len(encoded.ids)}")
print(f"Token IDs: {encoded.ids}")
print(f"Tokens: {encoded.tokens}")
# 输出: Tokens: ['预', '训', '练', '是', '大', '语', '言', '模', '型', '的', '核', '心', '环', '节']`
          }
        ],
        table: {
          headers: ["分词算法", "代表模型", "优点", "缺点", "典型词汇表大小"],
          rows: [
            ["BPE", "GPT 系列, Llama", "简单高效, 广泛支持", "对中文效率低", "32K-256K"],
            ["WordPiece", "BERT", "语言模型驱动", "训练较慢", "30K"],
            ["SentencePiece", "T5, mBART", "无需预分词, 多语言", "词汇表膨胀", "32K-250K"],
            ["Unigram", "Flan-T5", "概率模型, 灵活", "实现复杂", "32K"],
          ]
        },
        tip: "分词器选择的实用建议：如果你的模型是中英双语的，优先选择 **SentencePiece** 或专门优化的中英混合 BPE 分词器。纯英文场景下，**BPE** 是默认选择。不要在分词器上省时间——一个好的分词器可以提升 5-15% 的训练效率。",
        warning: "分词器的词汇表一旦确定就很难更改。如果在预训练中途发现分词器质量不佳（如某些高频词被拆分为多个 Token），更换分词器意味着重新训练嵌入层，这对预训练成本的影响是巨大的。务必在预训练开始前充分评估分词器的质量。",
      },
      {
        title: "5. 训练策略：从优化器到学习率调度的完整方案",
        body: `预训练策略决定了模型如何利用数据进行学习。即使数据和架构都相同，不同的训练策略也可能导致截然不同的最终效果。

优化器选择：

**AdamW**——预训练中最常用的优化器。它在 **Adam** 的基础上加入了权重衰减（Weight Decay），防止模型过拟合。AdamW 的核心参数：

- 学习率（Learning Rate）——最关键的超参数，决定了每次参数更新的步长。
- β1, β2——一阶和二阶动量衰减率，通常设为 **0.9** 和 **0.999**。
- ε——数值稳定性参数，通常设为 **1e-8**。
- 权重衰减（Weight Decay）——L2 正则化系数，通常设为 **0.1**。

AdamW 的变体：

**Lion**——Google 提出的优化器，使用符号函数（Sign）代替 Adam 中的自适应学习率。Lion 在某些任务上比 AdamW 快 1.5-2 倍，但稳定性略差。

**Sophia**——2023 年提出的二阶优化器，使用Hessian 矩阵的对角线近似来调整学习率。在相同计算量下，Sophia 的收敛速度比 AdamW 快 2 倍，但实现更复杂。

学习率调度：

学习率调度决定了训练过程中学习率如何变化。主流的调度策略：

**Warmup + Cosine Decay**——这是目前最标准的预训练学习率调度方案。

- Warmup 阶段：训练开始时，学习率从 **0** 线性增长到峰值学习率（如 3e-4）。Warmup 的步数通常是总训练步数的 1-5%。Warmup 的作用是稳定训练初期——在模型参数随机初始化的情况下，较大的学习率可能导致梯度爆炸，Warmup 让模型「热身」后再使用正常学习率。

- Cosine Decay 阶段：Warmup 结束后，学习率按照余弦曲线从峰值逐渐衰减到 **0**（或一个极小的值，如峰值的 10%）。Cosine Decay 的优势是平滑衰减——学习率不会突然变化，模型可以在整个训练过程中稳定学习。

批次大小（Batch Size）：

批次大小决定了每次参数更新使用多少样本。更大的批次大小意味着更稳定的梯度估计和更高的硬件利用率，但也需要更多的显存。

预训练中常用的批次大小是 百万级 Token——即每次更新使用约 100-400 万个 Token 的数据。例如，如果每个序列是 4096 个 Token，那么批次大小约为 256-1024 个序列。

梯度累积（Gradient Accumulation）：

当硬件无法容纳完整的批次大小时，可以使用梯度累积技术——将大批次拆分为多个小批次，分别计算梯度后累加，最后统一更新参数。这等价于使用大批次进行训练，但显存需求大幅降低。

混合精度训练：

混合精度训练（Mixed Precision Training）使用 **FP16** 或 **BF16**（16 位浮点数）进行前向和反向传播的计算，但用 **FP32**（32 位浮点数）保存模型参数的主副本。这种方法可以将显存需求减半，同时利用 GPU 的 **Tensor Core** 加速计算，训练速度提升 2-3 倍，而精度损失可以忽略不计。`,
        code: [
          {
            lang: "python",
            code: `# 预训练学习率调度与优化器配置
import torch
from torch.optim import AdamW
from transformers import get_cosine_schedule_with_warmup

# 模型参数
model = ...  # 你的模型
total_steps = 100000           # 总训练步数
warmup_steps = 2000            # Warmup 步数 (2%)
peak_lr = 3e-4                 # 峰值学习率
weight_decay = 0.1             # 权重衰减

# 优化器：AdamW
optimizer = AdamW(
    model.parameters(),
    lr=peak_lr,
    betas=(0.9, 0.999),
    eps=1e-8,
    weight_decay=weight_decay
)

# 学习率调度：Warmup + Cosine Decay
scheduler = get_cosine_schedule_with_warmup(
    optimizer,
    num_warmup_steps=warmup_steps,
    num_training_steps=total_steps
)

# 训练循环
for step in range(total_steps):
    # 前向传播
    outputs = model(batch)
    loss = outputs.loss
    
    # 反向传播
    loss.backward()
    
    # 梯度裁剪（防止梯度爆炸）
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    
    # 参数更新
    optimizer.step()
    scheduler.step()  # 更新学习率
    optimizer.zero_grad()
    
    if step % 100 == 0:
        current_lr = scheduler.get_last_lr()[0]
        print(f"Step {step}: loss={loss:.4f}, lr={current_lr:.2e}")`
          }
        ],
        table: {
          headers: ["超参数", "推荐值", "影响", "调整建议"],
          rows: [
            ["峰值学习率", "1e-4 ~ 5e-4", "太大 → 训练不稳定，太小 → 收敛慢", "从小值开始，观察 loss 曲线"],
            ["Warmup 比例", "1-5%", "太短 → 初期不稳定，太长 → 浪费训练步", "7B 以下 2%，70B+ 5%"],
            ["权重衰减", "0.05 ~ 0.1", "太大 → 欠拟合，太小 → 过拟合", "默认 0.1，过拟合时增大"],
            ["梯度裁剪", "0.5 ~ 1.0", "太大 → 梯度爆炸风险，太小 → 限制学习", "默认 1.0"],
            ["批次大小", "100万~400万 Token", "越大越稳定，但需要更多显存", "根据硬件调整，用梯度累积"],
            ["训练步数", "根据数据量计算", "太少 → 欠训练，太多 → 过拟合", "总 Token 数 / 批次大小"],
          ]
        },
        tip: "学习率是最重要的超参数。如果只能调一个超参数，调学习率。经验法则是：从 3e-4 开始，观察训练初期的 loss 曲线——如果 loss 在前 100 步内快速下降，说明学习率合适；如果 loss 波动或上升，降低学习率；如果 loss 下降太慢，提高学习率。",
        warning: "预训练中最危险的错误是学习率设置过高导致训练崩溃。一旦训练崩溃（loss 变为 NaN 或无穷大），很难恢复——即使降低学习率，模型的参数已经被破坏。建议在 Warmup 阶段密切监控 loss，如果 loss 出现异常，立即降低学习率并重新 Warmup。",
      },
      {
        title: "6. 分布式训练：如何在数百张 GPU 上高效训练",
        body: `训练一个大语言模型不可能在单张 GPU上完成——即使是最强的 A100 80GB 也无法容纳 70B 参数的模型（需要 140 GB 显存）。分布式训练将模型和计算切分到多张 GPU上，使大规模训练成为可能。

分布式训练的三种策略：

数据并行（Data Parallelism, DP）——最简单的分布式策略。每张 GPU 保存完整的模型副本，但处理不同的数据批次。训练时，每张 GPU 独立计算梯度，然后聚合所有 GPU 的梯度并同步更新模型参数。

数据并行的优点是实现简单——PyTorch 的 DistributedDataParallel（DDP） 只需要几行代码就能启用。缺点是显存需求不降低——每张 GPU 都需要保存完整的模型参数、优化器状态和梯度。对于 70B 模型，单张 GPU 的显存需求约 **420 GB**（参数 140 GB + 优化器状态 280 GB），即使有 16 张 A100 80GB 也无法满足。

张量并行（Tensor Parallelism, TP）——将模型的每一层切分到多张 GPU上。例如，Transformer 的注意力层的 Q、K、V 投影矩阵可以按列切分到两张 GPU 上，每张 GPU 计算一部分。前向传播时，GPU 之间需要频繁通信来交换中间结果。

张量并行的优点是显存需求随 GPU 数量线性降低——70B 模型在 2 张 GPU 上每张只需要 70 GB 显存（参数）+ 140 GB（优化器）= 210 GB，仍然超出 A100 80GB 的容量，但在 4 张 GPU 上每张只需要 105 GB，可以通过混合精度进一步降低到可接受的范围。

张量并行的缺点是通信开销大——每一层的前向和反向传播都需要 GPU 间通信，这会显著增加训练时间。

流水线并行（Pipeline Parallelism, PP）——将模型的不同层分配到不同 GPU上。例如，GPU 0 处理第 1-20 层，GPU 1 处理第 21-40 层，GPU 2 处理第 41-60 层，GPU 3 处理第 61-80 层。数据从 GPU 0 流到 GPU 3，像一个流水线。

流水线并行的优点是通信量相对较少——只需要在层与层之间的边界处传输数据。缺点是流水线气泡（Pipeline Bubble）——当第一批数据在 GPU 之间流动时，后面的 GPU 处于空闲等待状态，降低了硬件利用率。

3D 并行（混合策略）：

实际的大规模预训练通常结合三种并行策略——这就是所谓的 3D 并行：

- 数据并行处理批次维度——增加 GPU 数量来处理更多数据
- 张量并行处理模型层内维度——将大层切分到多张 GPU
- 流水线并行处理模型层间维度——将不同层分配到不同 GPU

Megatron-LM 和 DeepSpeed 是两个主流的 3D 并行训练框架。

ZeRO（Zero Redundancy Optimizer）：

DeepSpeed 提出的 **ZeRO** 优化器是分布式训练中的革命性技术。ZeRO 的核心思想是：不复制优化器状态、梯度和参数，而是将它们切分到不同的 GPU 上。

**ZeRO-1**：切分优化器状态，节省约 75% 的显存。

**ZeRO-2**：切分优化器状态 + 梯度，节省约 85% 的显存。

**ZeRO-3**：切分优化器状态 + 梯度 + 参数，节省约 90% 的显存。

ZeRO-3 使得在相对较少的 GPU 上训练超大模型成为可能。例如，使用 ZeRO-3 和 CPU Offload（将部分数据转移到 CPU 内存），可以在 8 张 A100 80GB 上训练 175B 参数的模型。`,
        mermaid: `graph TD
    A["单卡无法容纳\n70B 模型"] --> B["分布式训练策略"]
    B --> C["数据并行 DP\n每张 GPU 完整模型"]
    B --> D["张量并行 TP\n层内切分"]
    B --> E["流水线并行 PP\n层间分配"]
    C --> F["DDP / FSDP\n梯度同步"]
    D --> G["Megatron-LM\n列/行切分"]
    E --> H["GPipe / PipeDream\n流水线调度"]
    F --> I["3D 并行组合\nDP + TP + PP"]
    G --> I
    H --> I
    I --> J["ZeRO 优化\n消除冗余显存"]
    class A s0
    classDef s0 fill:#1e3a5f`,
        tip: "分布式训练的黄金组合：FSDP（Fully Sharded Data Parallel）+ ZeRO-3 是目前性价比最高的方案。FSDP 是 PyTorch 原生支持的，不需要额外的框架依赖，同时提供了接近 DeepSpeed ZeRO-3 的显存优化效果。如果你使用 PyTorch，优先选择 FSDP。",
        warning: "分布式训练的通信瓶颈经常被低估。当使用 100+ 张 GPU 时，GPU 间的通信开销可能占总训练时间的 30-50%。确保你的 GPU 集群配备了高速互连（如 InfiniBand 或 NVLink），否则训练效率会严重受限。",
      },
      {
        title: "7. 训练过程中的监控与评估",
        body: `预训练是一个漫长的过程——可能需要数周到数月。在这个过程中，持续的监控和评估是确保训练按预期进行的关键。

训练监控指标：

训练损失（Training Loss）——最基础的指标。训练损失应该持续下降，并且下降速度应该逐渐变缓（因为学习率在衰减）。如果训练损失出现突然上升，可能是学习率过高、梯度爆炸或数据异常。

验证损失（Validation Loss）——在保留的验证集上计算的损失。验证损失应该与训练损失同步下降。如果训练损失持续下降但验证损失开始上升，说明模型过拟合了。

梯度范数（Gradient Norm）——梯度的大小。梯度范数应该在合理范围内（通常 0.1-10）。如果梯度范数突然变得非常大（> 100），可能是梯度爆炸；如果梯度范数接近 0，可能是梯度消失。

学习率（Learning Rate）——当前的学习率值。应该按照预定的调度曲线变化。

吞吐量（Throughput）——每秒处理的 Token 数量。吞吐量应该保持稳定，如果突然下降，可能是硬件故障或通信瓶颈。

评估方法：

在预训练过程中，需要定期（如每 1000 步）对模型进行评估，以检查模型的能力进展。常用的评估基准包括：

**MMLU**（Massive Multitask Language Understanding）——涵盖 57 个学科的多任务评测基准，测试模型的通识知识和推理能力。

**HellaSwag**——测试模型的常识推理能力，要求模型从多个选项中选择最合理的续写。

**ARC**（AI2 Reasoning Challenge）——测试模型的科学推理能力，包含小学到高中水平的科学问题。

**GSM8K**——测试模型的数学推理能力，包含 8,500 道小学数学应用题。

**HumanEval**——测试模型的代码生成能力，包含 164 道编程题目。

检查点管理：

预训练过程中需要定期保存检查点（Checkpoint），以防止训练中断导致进度丢失。检查点保存频率需要权衡两个因素：

- 保存频率越高，中断后丢失的进度越少，但I/O 开销越大（每次保存需要数十 GB 的写入）。
- 保存频率越低，I/O 开销越小，但中断后丢失的进度越多。

典型的检查点保存策略是：每 1000-5000 步保存一次，同时保留最近 3-5 个检查点，更早的检查点自动删除以节省存储空间。`,
        code: [
          {
            lang: "python",
            code: `# 预训练监控与评估框架
import json
import time
from typing import Dict, Optional
from dataclasses import dataclass

@dataclass
class TrainingMetrics:
    step: int
    train_loss: float
    val_loss: Optional[float]
    learning_rate: float
    gradient_norm: float
    throughput_tok_s: float
    gpu_memory_gb: float

class TrainingMonitor:
    """训练监控器"""
    
    def __init__(self, log_file: str = "training.log"):
        self.log_file = log_file
        self.history = []
    
    def record(self, metrics: TrainingMetrics):
        """记录当前步的指标"""
        self.history.append(metrics)
        
        # 写入日志
        log_entry = {
            "step": metrics.step,
            "train_loss": metrics.train_loss,
            "val_loss": metrics.val_loss,
            "lr": metrics.learning_rate,
            "grad_norm": metrics.gradient_norm,
            "throughput": metrics.throughput_tok_s,
        }
        with open(self.log_file, "a") as f:
            f.write(json.dumps(log_entry) + "\\n")
        
        # 检查异常
        self._check_anomalies(metrics)
    
    def _check_anomalies(self, metrics: TrainingMetrics):
        """检查训练异常"""
        if metrics.train_loss != metrics.train_loss:  # NaN 检查
            raise ValueError(f"Step {metrics.step}: Loss is NaN!")
        if metrics.gradient_norm > 100:
            print(f"WARNING: Step {metrics.step}: "
                  f"Gradient norm {metrics.gradient_norm:.1f} is very high!")
        if metrics.gradient_norm < 1e-6:
            print(f"WARNING: Step {metrics.step}: "
                  f"Gradient norm {metrics.gradient_norm:.2e} is near zero!")
    
    def get_summary(self) -> Dict:
        """获取训练摘要"""
        if not self.history:
            return {}
        latest = self.history[-1]
        return {
            "latest_step": latest.step,
            "latest_loss": latest.train_loss,
            "avg_throughput": sum(
                m.throughput_tok_s for m in self.history[-100:]
            ) / min(100, len(self.history)),
            "total_steps_trained": len(self.history),
        }

# 使用示例
# monitor = TrainingMonitor()
# for step, batch in enumerate(dataloader):
#     loss = model(batch).loss
#     loss.backward()
#     optimizer.step()
#     
#     monitor.record(TrainingMetrics(
#         step=step,
#         train_loss=loss.item(),
#         val_loss=evaluate_every_1000_steps(),
#         learning_rate=scheduler.get_last_lr()[0],
#         gradient_norm=get_grad_norm(model),
#         throughput_tok_s=compute_throughput(),
#         gpu_memory_gb=get_gpu_memory(),
#     ))`
          }
        ],
        table: {
          headers: ["监控指标", "正常范围", "异常信号", "应对措施"],
          rows: [
            ["训练损失", "持续下降", "突然上升或 NaN", "降低学习率，检查数据"],
            ["验证损失", "与训练损失同步下降", "上升（过拟合）", "增加正则化，减少训练步数"],
            ["梯度范数", "0.1-10", ">100（爆炸）或 <1e-6（消失）", "梯度裁剪或检查初始化"],
            ["吞吐量", "稳定", "突然下降 >30%", "检查硬件状态和网络连接"],
            ["显存使用", "稳定在 70-90%", "OOM 错误", "减小批次大小或启用 ZeRO"],
          ]
        },
        tip: "训练监控的最佳实践是使用 Weights & Biases（W&B） 或 **TensorBoard** 进行可视化监控。将训练损失、验证损失、学习率、梯度范数等关键指标绘制为实时曲线，可以一眼看出训练是否正常。不要只依赖命令行输出的文本日志——可视化是发现训练异常最快的方式。",
        warning: "预训练中最容易被忽视的异常是静默退化——训练损失看起来正常，但模型的实际能力在退化（如语言流畅度下降、推理能力减弱）。这种异常只有通过定期的人类评估（人工阅读模型生成的文本）才能发现。建议每周至少进行一次人工评估。",
      },
      {
        title: "8. 预训练后的评估与扩展阅读",
        body: `预训练完成后，需要对模型进行全面评估，以确定其能力水平和后续优化方向。

预训练后评估的三个层次：

基准测试（Benchmark Evaluation）——在标准评测基准（MMLU、HellaSwag、ARC、GSM8K、HumanEval 等）上评估模型的表现。这是最量化的评估方式，可以直接与其他模型进行对比。

人工评估（Human Evaluation）——让评估人员对模型生成的文本进行主观评分。评估维度包括：语言流畅度（文本是否通顺自然）、知识准确性（信息是否正确）、推理能力（能否进行逻辑推理）、指令遵循（能否按照指令执行任务）。

红队测试（Red Teaming）——模拟攻击者的角度，尝试让模型产生有害输出（如仇恨言论、错误信息、代码漏洞）。这是评估模型安全性的关键环节。

扩展阅读推荐：

论文：
- 「Training Compute-Optimal Large Language Models」（Kaplan 等，2020）——提出了 Chinchilla 缩放定律，确定了模型参数量和训练数据量的最优配比
- 「Emergent Abilities of Large Language Models」（Wei 等，2022）——首次系统性描述了大语言模型的涌现能力
- 「The Clustered Organization of Language Model Representations」（Gurnee 等，2023）——揭示了预训练模型内部表征的结构

开源项目：
- **Megatron-LM**（NVIDIA）——大规模的 Transformer 训练框架，支持 3D 并行
- **DeepSpeed**（Microsoft）——包含 ZeRO 优化器的分布式训练框架
- **LLaMA-Factory**——轻量级的 LLM 训练和微调框架
- **OpenDataHub**——大规模预训练数据集的整理和管理工具

书籍：
- 「Build a Large Language Model (From Scratch)」by Sebastian Raschka——从零构建 LLM 的实战指南
- 「Speech and Language Processing」by Jurafsky & Martin——自然语言处理的经典教材，涵盖了预训练的理论基础`,
        mermaid: `graph LR
    A["预训练完成"] --> B["基准测试\nMMLU/HellaSwag/GSM8K"]
    A --> C["人工评估\n流畅度/知识/推理"]
    A --> D["红队测试\n安全性/鲁棒性"]
    B --> E["能力画像\n雷达图"]
    C --> E
    D --> E
    E --> F["后续优化方向\nSFT / RLHF / 继续训练"]`,
        tip: "预训练评估的核心原则：不要只看基准测试分数。基准测试可以反映模型的相对能力，但不能反映模型的实际用户体验。一个在 MMLU 上得分 85% 的模型，可能在实际对话中表现得很生硬或产生大量幻觉。人工评估和红队测试是不可或缺的补充。",
        warning: "预训练完成后不要立即进入微调。先花时间做全面的评估——了解模型的优势和短板。如果模型在数学推理上很弱，后续的微调数据应该增加数学内容的比例；如果模型在代码生成上很强，可以减少代码微调数据的比例。微调应该是有针对性地补短板，而不是盲目地全量微调。",
      },
    ],
  };