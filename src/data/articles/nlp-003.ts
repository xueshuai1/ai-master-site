import { Article } from '../knowledge';

export const article: Article = {
    id: "nlp-003",
    title: "文本分类：情感分析与主题分类",
    category: "nlp",
    tags: ["文本分类", "情感分析", "NLP"],
    summary: "从 TF-IDF 到深度学习，掌握 NLP 最基础的分类任务",
    date: "2026-04-12",
    readTime: "18 min",
    level: "入门",
    content: [
        {
            title: "1. 文本分类任务定义与应用场景",
            body: `文本分类是 NLP 领域最基础也最广泛的任务之一。它的核心目标是将一段自然语言文本分配到预定义的类别标签中。从数学上看，给定输入文本序列 X = (x₁, x₂, ..., xₙ) 和标签集合 C = {c₁, c₂, ..., cₖ}，模型需要学习映射函数 f: X → C，使得分类准确率最大化。

文本分类在工业界有极其广泛的应用。情感分析用于电商评论的情感倾向判断、社交媒体舆情监控；主题分类用于新闻自动归类、邮件垃圾过滤；意图识别用于客服对话系统的意图路由；内容审核用于平台违规内容检测。可以说，几乎所有涉及文本理解的业务场景都离不开文本分类技术。

根据标签数量，文本分类可分为二分类（如正面/负面情感）、多分类（如新闻主题分类）、多标签分类（一篇文章可同时属于多个类别）。按分类粒度，又可分为文档级分类（整篇文档一个标签）、句子级分类（每句话独立分类）和词元级分类（序列标注，如命名实体识别）。本教程重点讲解文档级和句子级分类。`,
            code: [
                {
                    lang: "python",
                    code: `# 文本分类任务形式化定义
from typing import List, Dict, Tuple

class TextClassificationTask:
    """文本分类任务的抽象定义"""

    def __init__(self, name: str, labels: List[str], task_type: str):
        self.name = name
        self.labels = labels
        self.task_type = task_type  # "binary" | "multiclass" | "multilabel"
        self.label2id = {label: i for i, label in enumerate(labels)}
        self.id2label = {i: label for label, i in self.label2id.items()}

    @property
    def num_classes(self) -> int:
        return len(self.labels)

    def encode_labels(self, raw_labels: List[str]) -> List[int]:
        return [self.label2id[l] for l in raw_labels]

    def decode_labels(self, ids: List[int]) -> List[str]:
        return [self.id2label[i] for i in ids]

# 定义一个情感分析任务
sentiment_task = TextClassificationTask(
    name="情感分析",
    labels=["正面", "负面", "中性"],
    task_type="multiclass"
)
print(f"任务: {sentiment_task.name}")
print(f"类别数: {sentiment_task.num_classes}")
print(f"标签映射: {sentiment_task.label2id}")`
                },
                {
                    lang: "python",
                    code: `# 文本分类的典型评估指标
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from sklearn.metrics import classification_report, confusion_matrix

def evaluate_classifier(y_true, y_pred, labels):
    """全面评估文本分类模型"""
    # 基础指标
    accuracy = accuracy_score(y_true, y_pred)
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, labels=labels, average=None
    )

    print(f"{'类别':<8} {'精确率':>8} {'召回率':>8} {'F1':>8} {'样本数':>8}")
    print("-" * 45)
    for i, label in enumerate(labels):
        print(f"{label:<8} {precision[i]:>8.3f} {recall[i]:>8.3f} {f1[i]:>8.3f} {support[i]:>8}")
    print("-" * 45)
    print(f"整体准确率: {accuracy:.4f}")
    print(f"\n分类报告:")
    print(classification_report(y_true, y_pred, target_names=labels))

# 示例：模型在测试集上的预测
y_true = ["正面", "正面", "负面", "中性", "正面", "负面"]
y_pred = ["正面", "中性", "负面", "中性", "正面", "正面"]
evaluate_classifier(y_true, y_pred, ["正面", "负面", "中性"])`
                }
            ],
            table: {
                headers: ["任务类型", "类别数", "典型场景", "评估指标"],
                rows: [
                    ["二分类", "2", "情感正/负面、垃圾邮件检测", "Accuracy, AUC"],
                    ["多分类", ">2（互斥）", "新闻主题分类、意图识别", "Accuracy, Macro-F1"],
                    ["多标签", ">2（可多选）", "文章标签、内容审核", "Hamming Loss, Micro-F1"],
                    ["层次分类", "树状结构", "学科分类、产品类目", "层次准确率"],
                ]
            },
            mermaid: `graph TD
    A["原始文本"] --> B["文本预处理"]
    B --> C["特征提取"]
    C --> D["分类模型"]
    D --> E["类别预测"]
    B --> B1["分词/去停用词"]
    B --> B2["大小写/标点处理"]
    C --> C1["TF-IDF 向量"]
    C --> C2["词嵌入向量"]
    D --> D1["朴素贝叶斯"]
    D --> D2["SVM / CNN"]
    D --> D3["BERT / Transformer"]`,
            tip: "开始一个新分类任务时，先用 100-500 条人工标注数据做基线实验，不要一上来就收集几万条数据——先用小数据验证任务可行性，再决定投入规模。",
            warning: "类别标签定义必须互斥且穷尽（多分类场景）。如果标注指南模糊，不同标注员对同一条样本给出不同标签，模型上限将被严重限制。"
        },
        {
            title: "2. 传统方法：TF-IDF + 朴素贝叶斯 / SVM",
            body: `在深度学习统治 NLP 之前，TF-IDF 与经典机器学习算法的组合是文本分类的标配方案。这套方案至今仍在许多场景下表现出色，尤其当训练数据有限（几百到几千条）或需要极高推理速度时。

TF-IDF（词频-逆文档频率） 是一种统计方法，用于评估一个词在文档中的重要程度。词频 TF(t,d) 衡量词 t 在文档 d 中出现的次数，逆文档频率 IDF(t) = log(N / df(t)) 衡量词 t 在整个语料库中的稀有程度，其中 N 是文档总数，df(t) 是包含词 t 的文档数。TF-IDF = TF × IDF，核心思想是：在本文档中频繁出现但在其他文档中少见的词，最能代表本文档的主题。

朴素贝叶斯（Naive Bayes） 基于贝叶斯定理，假设特征（词）之间条件独立。虽然这个假设在自然语言中并不成立（词语之间有强依赖关系），但朴素贝叶斯在实践中效果出奇地好，尤其在短文本分类中。它的计算复杂度为 O(N × V)，N 为训练样本数，V 为词汇表大小，训练和推理都极快。

支持向量机（SVM） 通过寻找最优超平面来分隔不同类别的样本。在文本分类中，SVM 配合 TF-IDF 特征往往能取得比朴素贝叶斯更好的效果，尤其在高维稀疏特征空间中表现优异。SVM 的核心优势是泛化能力强，不易过拟合。`,
            code: [
                {
                    lang: "python",
                    code: `# TF-IDF 特征提取 + 朴素贝叶斯分类
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

# 示例数据集
texts = [
    "这部电影太精彩了，演员演技炸裂",
    "剧情拖沓，浪费时间，差评",
    "人工智能正在改变世界",
    "量子计算有望突破摩尔定律瓶颈",
    "服务太差，再也不会来了",
    "深度学习在医疗诊断中取得突破",
]
labels = ["正面", "负面", "科技", "科技", "负面", "科技"]

# 构建 Pipeline：TF-IDF + 朴素贝叶斯
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),    # 使用 unigram 和 bigram
        min_df=1,
        sublinear_tf=True      # 对 TF 做对数平滑
    )),
    ("clf", MultinomialNB(alpha=0.1))  # 拉普拉斯平滑
])

# 训练与评估
X_train, X_test, y_train, y_test = train_test_split(
    texts, labels, test_size=0.3, random_state=42
)
pipeline.fit(X_train, y_train)
preds = pipeline.predict(X_test)
print(f"准确率: {sum(p == t for p, t in zip(preds, y_test)) / len(y_test):.2f}")`
                },
                {
                    lang: "python",
                    code: `# TF-IDF + SVM 文本分类（通常效果更好）
from sklearn.svm import LinearSVC
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import GridSearchCV

# 更大的数据集示例
train_texts = [
    "产品非常好，质量超出预期",
    "快递太慢了，包装也破损",
    "新款 iPhone 搭载了 M4 芯片",
    "特斯拉发布新一代自动驾驶系统",
    "客服态度恶劣，要求退款",
    "这个手机拍照效果绝了",
    "谷歌发布 Gemini 2.0 模型",
    "物流速度很快，第二天就到了",
    "AMD 新一代处理器性能强劲",
    "食物已经变质，吃出异物",
]
train_labels = [
    "正面", "负面", "科技", "科技", "负面",
    "正面", "科技", "正面", "科技", "负面"
]

# Pipeline + 网格搜索最优参数
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(max_features=10000, ngram_range=(1, 2))),
    ("clf", LinearSVC(dual=True, class_weight="balanced"))
])

param_grid = {
    "tfidf__max_features": [5000, 10000],
    "tfidf__ngram_range": [(1, 1), (1, 2)],
    "clf__C": [0.1, 1.0, 10.0],
}

grid = GridSearchCV(pipeline, param_grid, cv=3, scoring="f1_macro")
grid.fit(train_texts, train_labels)
print(f"最佳参数: {grid.best_params_}")
print(f"最佳 Macro-F1: {grid.best_score_:.4f}")

# 查看 TF-IDF 最重要的特征
tfidf = grid.best_estimator_.named_steps["tfidf"]
feature_names = tfidf.get_feature_names_out()
print(f"词汇表大小: {len(feature_names)}")`
                }
            ],
            table: {
                headers: ["算法", "训练速度", "推理速度", "小数据表现", "大数据表现", "可解释性"],
                rows: [
                    ["朴素贝叶斯", "极快", "极快", "良好", "一般", "高（词权重可视化）"],
                    ["SVM (Linear)", "快", "快", "优秀", "优秀", "中（支持向量权重）"],
                    ["逻辑回归", "快", "快", "良好", "优秀", "高（系数即权重）"],
                    ["随机森林", "中", "中", "良好", "良好", "中（特征重要性）"],
                ]
            },
            mermaid: `graph LR
    A["原始语料库"] --> B["分词 Tokenize"]
    B --> C["计算 TF 词频"]
    C --> D["计算 IDF 逆文档频率"]
    D --> E["TF × IDF = 特征向量"]
    E --> F["朴素贝叶斯"]
    E --> G["SVM 线性分类器"]
    E --> H["逻辑回归"]
    F --> I["类别概率 P(c|d)"]
    G --> J["最优超平面"]
    H --> K["Sigmoid 输出"]`,
            tip: "TF-IDF 的 ngram_range=(1,2) 几乎总是比单纯的 unigram 效果好——bigram 能捕获「不 好」「非 常 差」等否定短语，对情感分析至关重要。",
            warning: "TF-IDF 有一个隐藏陷阱：如果测试集包含训练集未见过的新词，这些词会被忽略。在开放域场景中，考虑使用 sublinear_tf=True 和适当的 max_features 上限。"
        },
        {
            title: "3. 深度学习分类：TextCNN 与 LSTM",
            body: `深度学习方法在 2014 年之后迅速崛起，TextCNN 和 LSTM 是文本分类领域最具代表性的两个深度学习架构。它们不再依赖人工设计特征，而是通过端到端训练自动学习文本的语义表示。

TextCNN（Yoon Kim, 2014） 借鉴了计算机视觉中 CNN 的成功经验，将一维卷积应用于文本序列。不同大小的卷积核（如 3、4、5）相当于捕获不同长度的 n-gram 特征：大小为 3 的核捕获 trigram 级别的局部模式（如「太 好 了」），大小为 5 的核捕获更长的短语模式。多个卷积核并行处理后通过 max-pooling 提取最显著特征，最后接全连接层分类。TextCNN 的优势是训练速度快、参数少，特别适合短文本分类。

LSTM（长短期记忆网络） 通过门控机制解决了 RNN 的梯度消失问题，能够捕获文本中的长距离依赖关系。双向 LSTM（BiLSTM）同时从前向和后向两个方向编码文本，使每个位置的表示都包含完整上下文信息。LSTM 在处理需要理解长距离语义关联的任务（如长文档分类、篇章级情感分析）时表现优于 TextCNN。

Attention 机制 后来被引入文本分类，通过为不同词元分配不同的注意力权重，模型可以自动聚焦于最具判别力的词汇。例如在情感分析中，「精彩」「垃圾」等情感词会获得更高的注意力权重，而「的」「了」等功能词权重较低。`,
            code: [
                {
                    lang: "python",
                    code: `# TextCNN 模型实现（PyTorch）
import torch
import torch.nn as nn
import torch.nn.functional as F

class TextCNN(nn.Module):
    """Kim (2014) TextCNN 文本分类模型"""

    def __init__(self, vocab_size, embed_dim, num_classes,
                 kernel_sizes=(3, 4, 5), num_filters=100, dropout=0.5):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)

        # 多尺度卷积核：捕获不同长度的 n-gram 模式
        self.convs = nn.ModuleList([
            nn.Conv1d(in_channels=embed_dim,
                      out_channels=num_filters,
                      kernel_size=k)
            for k in kernel_sizes
        ])

        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(num_filters * len(kernel_sizes), num_classes)

    def forward(self, x):
        # x: (batch, seq_len) -> 词索引序列
        x = self.embedding(x)           # (batch, seq_len, embed_dim)
        x = x.permute(0, 2, 1)          # (batch, embed_dim, seq_len)

        # 多个卷积核并行处理
        conv_outs = []
        for conv in self.convs:
            c = F.relu(conv(x))         # 卷积 + ReLU
            c = F.max_pool1d(c, c.size(2)).squeeze(2)  # 1-max pooling
            conv_outs.append(c)

        x = torch.cat(conv_outs, dim=1) # 拼接所有卷积核的输出
        x = self.dropout(x)
        return self.fc(x)               # (batch, num_classes)

# 实例化模型
model = TextCNN(vocab_size=30000, embed_dim=300, num_classes=3)
print(f"参数量: {sum(p.numel() for p in model.parameters()):,}")`
                },
                {
                    lang: "python",
                    code: `# BiLSTM + Attention 文本分类模型
class AttentionLayer(nn.Module):
    """自注意力层：为每个时间步计算注意力权重"""

    def __init__(self, hidden_dim):
        super().__init__()
        self.attention = nn.Linear(hidden_dim, 1)

    def forward(self, lstm_out, mask=None):
        # lstm_out: (batch, seq_len, hidden_dim)
        scores = self.attention(lstm_out).squeeze(2)  # (batch, seq_len)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        weights = F.softmax(scores, dim=1)            # 归一化
        # 加权求和
        context = torch.bmm(weights.unsqueeze(1), lstm_out).squeeze(1)
        return context, weights

class BiLSTMAttention(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True,
                            bidirectional=True, num_layers=2)
        self.attention = AttentionLayer(hidden_dim * 2)
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)

    def forward(self, x, mask=None):
        x = self.embedding(x)
        lstm_out, _ = self.lstm(x)
        context, attn_weights = self.attention(lstm_out, mask)
        return self.fc(self.dropout(context)), attn_weights`
                }
            ],
            table: {
                headers: ["模型", "参数量", "训练速度", "适合文本长度", "核心优势"],
                rows: [
                    ["TextCNN", "小（100万以下）", "快", "短文本（<128词）", "多尺度 n-gram 捕获"],
                    ["BiLSTM", "中（100-500万）", "中", "中长文本（<512词）", "长距离依赖建模"],
                    ["BiLSTM+Attn", "中（100-500万）", "中", "中长文本（<512词）", "可解释注意力权重"],
                    ["TextRCNN", "中（100-500万）", "中慢", "中长文本", "上下文 + 局部特征融合"],
                ]
            },
            mermaid: `graph TD
    A["输入文本"] --> B["Embedding 层"]
    B --> C1["Conv1D (k=3)"]
    B --> C2["Conv1D (k=4)"]
    B --> C3["Conv1D (k=5)"]
    C1 --> D1["Max Pooling"]
    C2 --> D2["Max Pooling"]
    C3 --> D3["Max Pooling"]
    D1 --> E["Concat"]
    D2 --> E
    D3 --> E
    E --> F["Dropout"]
    F --> G["Fully Connected"]
    G --> H["Softmax 分类"]`,
            tip: "TextCNN 的核大小选择建议用 (2,3,4,5)——加入 size=2 的核可以捕获二元组（如「不 错」「太 贵」），对情感分析特别有效。",
            warning: "LSTM 在处理超长文本（>1024 词）时梯度仍然可能不稳定。如果遇到训练发散，尝试梯度裁剪（gradient clipping）：torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)。"
        },
        {
            title: "4. 预训练模型微调：BERT 分类实战",
            body: `BERT（Bidirectional Encoder Representations from Transformers, 2018）的出现彻底改变了文本分类的范式。通过在大规模无标注语料上进行自监督预训练，BERT 学到了深层的语言理解能力，只需少量标注数据微调即可在各类分类任务上取得 State-of-the-Art 效果。

预训练阶段 使用两个自监督任务：掩码语言建模（MLM）——随机遮盖 15% 的词让模型预测，以及下一句预测（NSP）——判断两句话是否连续。这两个任务使模型同时学到了词级别和句子级别的理解能力。预训练语料包括 Wikipedia（25 亿词）和 BooksCorpus（8 亿词）。

微调阶段 极其简洁：在 BERT 的 [CLS] token 输出后接一个线性分类层，用交叉熵损失端到端训练所有参数。对于序列长度为 L 的输入，BERT-base 有 12 层 Transformer 编码器，每层隐藏维度 768，总参数量约 1.1 亿。

BERT 的变体家族非常丰富：RoBERTa 去掉了 NSP 任务并增加训练数据；ALBERT 通过参数共享和因式分解减少参数量；DistilBERT 通过知识蒸馏将模型压缩到原大小的 40%；DeBERTa 引入了解码位置信息，在多项 GLUE 基准上取得最优成绩。中文场景常用的有 bert-base-chinese、macbert、roberta-wwm-ext 等。`,
            code: [
                {
                    lang: "python",
                    code: `# HuggingFace Transformers：BERT 微调完整流程
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    TrainingArguments, Trainer
)
from datasets import Dataset
import torch

# 1. 加载预训练模型和分词器
model_name = "bert-base-chinese"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(
    model_name, num_labels=3  # 正面/负面/中性
)

# 2. 准备数据
texts = ["这部电影太精彩了", "剧情很差，浪费时间", "中规中矩，没什么亮点"]
labels = [0, 1, 2]  # 0=正面, 1=负面, 2=中性
dataset = Dataset.from_dict({"text": texts, "label": labels})

# 3. 分词处理
def tokenize_fn(batch):
    return tokenizer(
        batch["text"],
        padding="max_length",
        truncation=True,
        max_length=128,
        return_tensors=None  # 返回 dict 而非 tensor
    )

dataset = dataset.map(tokenize_fn, batched=True)
dataset = dataset.rename_column("label", "labels")
dataset.set_format(type="torch", columns=[
    "input_ids", "attention_mask", "labels"
])

# 4. 训练配置
training_args = TrainingArguments(
    output_dir="./bert-sentiment",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    learning_rate=2e-5,
    weight_decay=0.01,
    evaluation_strategy="no",
    save_strategy="epoch",
    logging_steps=10,
)

trainer = Trainer(model=model, args=training_args, train_dataset=dataset)
trainer.train()  # 开始微调`
                },
                {
                    lang: "python",
                    code: `# BERT 分类推理 + 可解释性分析
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np

# 加载微调好的模型
model = AutoModelForSequenceClassification.from_pretrained(
    "./bert-sentiment/checkpoint-epoch-3"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)
model.eval()

def predict_with_confidence(text):
    """预测并返回置信度"""
    inputs = tokenizer(text, return_tensors="pt", truncation=True,
                       max_length=128, padding="max_length")
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=1)[0]
        pred_id = torch.argmax(probs).item()

    label2name = {0: "正面", 1: "负面", 2: "中性"}
    confidence = probs[pred_id].item()
    return label2name[pred_id], confidence, probs.tolist()

# 测试
test_sentences = [
    "这款手机性价比超高，拍照清晰",
    "质量太差了，用了三天就坏了",
    "一般般吧，没什么特别的",
]
for sent in test_sentences:
    label, conf, all_probs = predict_with_confidence(sent)
    print(f"文本: {sent}")
    print(f"预测: {label} (置信度: {conf:.2%})")
    print(f"概率分布: 正面={all_probs[0]:.3f}, 负面={all_probs[1]:.3f}, 中性={all_probs[2]:.3f}")
    print()`
                }
            ],
            table: {
                headers: ["模型", "参数量", "中文支持", "推荐场景"],
                rows: [
                    ["bert-base-chinese", "102M", "原生（简体+繁体）", "通用分类基线"],
                    ["macbert-base", "102M", "原生（纠错增强）", "对拼写鲁棒性要求高"],
                    ["roberta-wwm-ext", "102M", "原生（全词掩码）", "需要细粒度语义"],
                    ["ernie-3.0-base", "102M", "原生（知识增强）", "实体密集型分类"],
                    ["distilbert-base", "66M", "需适配", "资源受限/低延迟"],
                ]
            },
            mermaid: `graph LR
    A["原始文本"] --> B["Tokenizer 分词"]
    B --> C["[CLS] + tokens + [SEP]"]
    C --> D["BERT Encoder ×12"]
    D --> E["[CLS] 输出向量 (768维)"]
    E --> F["Dropout (p=0.1)"]
    F --> G["Linear (768→num_labels)"]
    G --> H["Softmax / CrossEntropy"]`,
            tip: "BERT 微调的学习率非常关键：2e-5 到 5e-5 是黄金范围。不要使用 1e-3 这样的大学习率——那会破坏预训练学到的语言表示。epochs=3-5 通常足够，过拟合 BERT 比过拟合 CNN 容易得多。",
            warning: "BERT 的输入长度上限是 512 tokens。如果文档超过这个长度，直接截断会丢失尾部信息。建议策略：首尾拼接（取前 250 个 + 后 250 个 token）或分段分类后投票。"
        },
        {
            title: "5. 类别不平衡处理策略",
            body: `在真实业务场景中，类别分布几乎总是不平衡的。垃圾邮件检测中正常邮件远多于垃圾邮件；医疗文本分类中正常报告远多于异常报告；舆情监控中中性评论远多于极端情感。如果不处理类别不平衡，模型会倾向于预测多数类，在准确率上看起来很高，但对少数类的预测能力极差。

类别不平衡的本质问题是损失函数被多数类主导。以二分类为例，如果正类占 95%，模型只需全部预测负类就能达到 95% 的准确率——但这完全失去了分类的意义。解决不平衡问题有三个层面的策略：数据层、算法层和后处理层。

数据层策略 包括过采样（复制少数类样本）、欠采样（删除多数类样本）和 SMOTE（合成少数类过采样技术）。SMOTE 通过在少数类样本的 K 近邻之间插值来生成新的合成样本，而不是简单复制，从而增加了数据的多样性。算法层策略 包括类别权重调整（给少数类更高的损失权重）和 Focal Loss（动态降低易分样本的权重）。后处理层策略 包括调整分类阈值——默认阈值 0.5 在类别不平衡时通常不是最优的。`,
            code: [
                {
                    lang: "python",
                    code: `# 方法一：类别权重 + Focal Loss
import torch
import torch.nn as nn
from sklearn.utils.class_weight import compute_class_weight
import numpy as np

# 假设训练数据中类别分布极度不平衡
train_labels = np.array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1])  # 80% vs 20%

# 计算类别权重（sklearn 自动平衡）
classes = np.unique(train_labels)
weights = compute_class_weight("balanced", classes=classes, y=train_labels)
class_weights = torch.FloatTensor(weights)
print(f"类别权重: {class_weights}")  # 少数类获得更高权重

# Focal Loss 实现
class FocalLoss(nn.Module):
    """Focal Loss: 降低易分样本的权重，聚焦难分样本"""
    def __init__(self, alpha=1.0, gamma=2.0):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.ce = nn.CrossEntropyLoss()

    def forward(self, logits, targets):
        ce_loss = self.ce(logits, targets)
        pt = torch.exp(-ce_loss)
        focal_loss = self.alpha * (1 - pt) ** self.gamma * ce_loss
        return focal_loss

# 对比：标准 CE vs Focal Loss
# gamma=2 时，pt=0.9（易分样本）的权重为 (1-0.9)^2 = 0.01
# pt=0.3（难分样本）的权重为 (1-0.3)^2 = 0.49
# Focal Loss 让模型关注那些难以分类的样本`
                },
                {
                    lang: "python",
                    code: `# 方法二：SMOTE 过采样 + 阈值调优
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
import numpy as np

# 模拟不平衡数据
texts_majority = ["产品很好", "非常满意", "推荐购买"] * 100
texts_minority = ["质量有问题", "售后服务差"] * 20
all_texts = texts_majority + texts_minority
all_labels = [0] * 300 + [1] * 40

print(f"类别分布: 0类={all_labels.count(0)}, 1类={all_labels.count(1)}")
print(f"不平衡比: {all_labels.count(0) / all_labels.count(1):.1f}:1")

# SMOTE 不能直接处理文本，需要先用 TF-IDF 转为数值特征
vectorizer = TfidfVectorizer(max_features=5000)
X = vectorizer.fit_transform(all_texts)

# SMOTE 过采样
smote = SMOTE(random_state=42, k_neighbors=3)
X_res, y_res = smote.fit_resample(X, all_labels)
print(f"过采样后: 0类={sum(1 for y in y_res if y==0)}, 1类={sum(1 for y in y_res if y==1)}")

# 阈值调优：找到最优分类阈值
from sklearn.metrics import f1_score
model = LogisticRegression(class_weight="balanced")
model.fit(X_res, y_res)
probs = model.predict_proba(X)[:, 1]

best_threshold, best_f1 = 0.5, 0
for threshold in np.arange(0.1, 0.9, 0.01):
    preds = (probs >= threshold).astype(int)
    f1 = f1_score(all_labels, preds)
    if f1 > best_f1:
        best_f1, best_threshold = f1, threshold

print(f"最优阈值: {best_threshold:.2f}, F1: {best_f1:.4f}")`
                }
            ],
            table: {
                headers: ["策略", "原理", "优点", "缺点", "适用场景"],
                rows: [
                    ["类别权重", "给少数类更高损失权重", "简单有效，不改变数据", "需要调参", "大多数场景首选"],
                    ["SMOTE", "插值生成合成样本", "增加少数类多样性", "可能生成噪声样本", "特征空间连续"],
                    ["Focal Loss", "动态降低易分样本权重", "自动聚焦困难样本", "增加训练时间", "极端不平衡"],
                    ["阈值调优", "移动分类决策边界", "推理阶段零成本", "需要验证集调参", "二分类优化"],
                ]
            },
            mermaid: `graph TD
    A["不平衡数据"] --> B{"不平衡比 > 10:1?"}
    B -->|是| C["Focal Loss + 类别权重"]
    B -->|否| D["类别权重 balanced"]
    C --> E["训练模型"]
    D --> E
    E --> F["在验证集上评估"]
    F --> G{"少数类 Recall > 0.7?"}
    G -->|否| H["调整阈值 / 过采样"]
    G -->|是| I["部署"]
    H --> F`,
            tip: "处理类别不平衡时，永远不要只看准确率（Accuracy）。使用 Macro-F1 或少数类的 Recall 作为主要评估指标，这样才能真实反映模型对少数类的预测能力。",
            warning: "SMOTE 在高维稀疏的 TF-IDF 特征空间上效果有限——在两个稀疏向量的连线上插值通常生成无意义的「混合文档」。建议先用 PCA/TruncatedSVD 降维再使用 SMOTE，或直接使用类别权重方案。"
        },
        {
            title: "6. 多标签分类：一篇文章，多个标签",
            body: `多标签分类（Multi-label Classification）与多分类的根本区别在于：每个样本可以同时属于多个类别，而非互斥地选择一个。例如一篇新闻可以同时属于「科技」和「商业」两个类别；一条社交媒体帖子可以同时标记为「政治」和「争议」。

多标签分类的挑战在于标签之间的相关性建模。标签之间可能存在正相关（「科技」和「AI」经常同时出现）、负相关（「正面情感」和「投诉」很少同时出现）或条件相关。理想的多标签分类器应该能利用这些相关性来提升整体预测性能。

解决多标签分类有两类主要方法：问题转换法（Problem Transformation） 将多标签问题转化为多个独立或关联的单标签问题，包括 Binary Relevance（每个标签独立训练一个分类器）、Classifier Chains（分类器链，前一个标签的预测作为后一个的输入特征）和 Label Powerset（将每种标签组合视为一个独立类别）。算法适应法（Algorithm Adaptation） 直接修改单标签算法以支持多标签输出，如多标签 SVM、多标签 kNN 等。

在深度学习中，最常用的方法是修改输出层：将最后一层的输出维度设为标签数量 K，使用 K 个独立的 Sigmoid 激活函数（而非 Softmax），配合 Binary Cross-Entropy 损失进行训练。这种方法天然支持多标签输出，且实现简单。`,
            code: [
                {
                    lang: "python",
                    code: `# sklearn 多标签分类：Binary Relevance vs Classifier Chains
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.multiclass import OneVsRestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.multioutput import ClassifierChain
from sklearn.metrics import hamming_loss, f1_score
import numpy as np

# 多标签数据集
texts = [
    "AI 技术在医疗领域取得重大突破",
    "苹果公司发布新一代 iPhone 手机",
    "央行宣布降息 0.25 个百分点",
    "世界杯决赛法国对阵阿根廷",
    "量子计算机实现 1000 量子比特突破",
    "美联储加息 75 个基点应对通胀",
]
# 多标签：每篇文章可同时属于多个类别
all_labels_set = ["科技", "商业", "金融", "体育", "医疗"]
labels = [
    [1, 0, 0, 0, 1],  # 科技 + 医疗
    [1, 1, 0, 0, 0],  # 科技 + 商业
    [0, 1, 1, 0, 0],  # 商业 + 金融
    [0, 0, 0, 1, 0],  # 体育
    [1, 0, 0, 0, 0],  # 科技
    [0, 1, 1, 0, 0],  # 商业 + 金融
]
labels = np.array(labels)

# Binary Relevance: 每个标签独立分类
br_model = OneVsRestClassifier(
    LogisticRegression(max_iter=1000)
)
X = TfidfVectorizer().fit_transform(texts)
br_model.fit(X, labels)
br_preds = br_model.predict(X)

# Classifier Chains: 利用标签相关性
cc_model = ClassifierChain(
    LogisticRegression(max_iter=1000),
    order="random", random_state=42
)
cc_model.fit(X, labels)
cc_preds = cc_model.predict(X)

print("=== Binary Relevance ===")
print(f"Hamming Loss: {hamming_loss(labels, br_preds):.4f}")
print(f"Micro-F1: {f1_score(labels, br_preds, average='micro'):.4f}")
print(f"Macro-F1: {f1_score(labels, br_preds, average='macro'):.4f}")
print("\\n=== Classifier Chains ===")
print(f"Hamming Loss: {hamming_loss(labels, cc_preds):.4f}")
print(f"Micro-F1: {f1_score(labels, cc_preds, average='micro'):.4f}")
print(f"Macro-F1: {f1_score(labels, cc_preds, average='macro'):.4f}")`
                },
                {
                    lang: "python",
                    code: `# 深度学习多标签分类：PyTorch + Sigmoid 输出
import torch
import torch.nn as nn

class MultiLabelTextClassifier(nn.Module):
    """多标签文本分类器：每标签独立的 Sigmoid 输出"""

    def __init__(self, vocab_size, embed_dim, num_labels,
                 hidden_dim=256, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True,
                            bidirectional=True)
        self.dropout = nn.Dropout(dropout)
        # 输出层：num_labels 个独立的 Sigmoid
        self.classifier = nn.Linear(hidden_dim * 2, num_labels)

    def forward(self, input_ids, attention_mask=None):
        x = self.embedding(input_ids)
        lstm_out, (h_n, _) = self.lstm(x)
        # 取最后一个时间步的双向隐藏状态拼接
        # 或使用 pooling：这里用 mean pooling
        if attention_mask is not None:
            mask = attention_mask.unsqueeze(-1).float()
            x = (lstm_out * mask).sum(dim=1) / mask.sum(dim=1)
        else:
            x = lstm_out.mean(dim=1)

        x = self.dropout(x)
        logits = self.classifier(x)   # (batch, num_labels)
        # 注意：训练时 BCEWithLogitsLoss 内部包含 Sigmoid
        # 推理时手动 Sigmoid 得到概率
        return logits

# 训练配置
num_labels = 5
criterion = nn.BCEWithLogitsLoss()  # 多标签 BCE（内置 Sigmoid）

# 推理
model.eval()
with torch.no_grad():
    logits = model(input_ids, attention_mask)
    probs = torch.sigmoid(logits)
    # 方法一：固定阈值 0.5
    predictions = (probs > 0.5).float()
    # 方法二：每标签自适应阈值
    # 需要在验证集上统计每标签的最优阈值`
                }
            ],
            table: {
                headers: ["方法", "标签相关性", "训练开销", "推理开销", "适用标签数"],
                rows: [
                    ["Binary Relevance", "忽略", "O(K)", "O(K)", "少（<20）"],
                    ["Classifier Chains", "利用（链式）", "O(K)", "O(K)", "少（<20）"],
                    ["Label Powerset", "完全建模", "O(2^K)", "O(1)", "极少（<10）"],
                    ["深度 Sigmoid", "隐式学习", "O(1)", "O(1)", "多（<500）"],
                ]
            },
            mermaid: `graph LR
    A["输入文本"] --> B["Encoder (BERT/CNN)"]
    B --> C["共享表示向量"]
    C --> D1["Sigmoid₁ → Label₁"]
    C --> D2["Sigmoid₂ → Label₂"]
    C --> D3["Sigmoid₃ → Label₃"]
    C --> DK["Sigmoidₖ → Labelₖ"]
    D1 --> E["预测标签集合"]
    D2 --> E
    D3 --> E
    DK --> E`,
            tip: "多标签分类的阈值不必统一为 0.5。如果某个标签（如「科技」）在训练集中出现频率高，可以降低其阈值以召回更多正例；出现频率低的标签则提高阈值以减少误报。",
            warning: "Label Powerset 方法将每种标签组合视为独立类别，当标签数为 K 时，理论上的类别组合数为 2^K。K>10 时会遭遇严重的类别稀疏问题——许多标签组合在训练集中从未出现，导致模型无法预测这些组合。"
        },
        {
            title: "7. 实战：sklearn + HuggingFace 完整项目",
            body: `理论最终要落地为代码。本节将用一个完整的新闻主题分类项目，串联前面介绍的所有知识点：从数据加载、预处理、特征工程、模型训练到评估部署，覆盖 sklearn 经典管线和 HuggingFace Transformer 两种实现方式。

我们以 THUCNews 中文新闻分类数据集为蓝本（14 个新闻类别，约 74 万篇文章），但在本教程中使用简化版——1000 条样本、10 个类别，让你能在本地机器上快速跑通全流程。实战的核心目标是建立一套可复现、可扩展的分类 pipeline。

sklearn 方案 适合快速验证和轻量部署。它的优势是代码简洁、依赖少、推理速度极快，适合对延迟敏感的场景（如实时内容审核）。HuggingFace 方案 适合追求最高精度的场景。通过微调预训练模型，通常能获得比 sklearn 方案高 5-15 个百分点的 F1 分数。两种方案各有优劣，实际项目中经常并存——sklearn 做基线和快速迭代，Transformer 做最终线上模型。

完整的分类项目还包括：模型持久化（保存/加载）、在线预测 API 封装、错误分析（查看分类错误的样本以指导迭代）、模型监控（线上准确率漂移检测）。这些工程实践同样重要，决定了模型能否从实验走向生产。`,
            code: [
                {
                    lang: "python",
                    code: `# 完整项目：sklearn 新闻分类 Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report
import joblib
import json

# 1. 加载数据
news_data = {
    "texts": [
        "央行今日开展 1000 亿元逆回购操作",
        "中国队在亚洲杯半决赛中战胜日本队",
        "SpaceX 星舰第四次试飞成功着陆",
        "华为发布鸿蒙 HarmonyOS 5.0 系统",
        "A 股三大指数集体高开，券商板块领涨",
        "NBA 总决赛湖人 4:2 击败凯尔特人",
        "新型 mRNA 疫苗对变异病毒有效率达 85%",
        "教育部推出双减政策实施细则",
        "特斯拉中国工厂产能突破 100 万辆",
        "世界杯预选赛中国队 3:0 获胜",
    ],
    "labels": ["财经", "体育", "科技", "科技", "财经", "体育", "科技", "社会", "财经", "体育"],
}

# 2. 划分数据集
X_train, X_test, y_train, y_test = train_test_split(
    news_data["texts"], news_data["labels"],
    test_size=0.2, random_state=42, stratify=news_data["labels"]
)

# 3. 构建分类 Pipeline
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        max_features=50000,
        ngram_range=(1, 2),
        min_df=2,
        sublinear_tf=True
    )),
    ("clf", LogisticRegression(
        C=1.0, max_iter=1000,
        class_weight="balanced",
        solver="lbfgs"
    ))
])

# 4. 训练
pipeline.fit(X_train, y_train)

# 5. 评估
y_pred = pipeline.predict(X_test)
print(classification_report(y_test, y_pred, zero_division=0))

# 6. 交叉验证
cv_scores = cross_val_score(pipeline, X_train, y_train, cv=3, scoring="f1_macro")
print(f"Cross-Validation Macro-F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

# 7. 保存模型
joblib.dump(pipeline, "news_classifier.pkl")
print("模型已保存到 news_classifier.pkl")`
                },
                {
                    lang: "python",
                    code: `# 完整项目：HuggingFace 新闻分类（含部署接口）
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
import json

class NewsClassifier:
    """生产级新闻分类器"""

    def __init__(self, model_path_or_name="hfl/chinese-macbert-base"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_path_or_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_path_or_name, num_labels=14
        )
        self.categories = [
            "财经", "房产", "教育", "科技", "军事",
            "汽车", "体育", "娱乐", "时尚", "社会",
            "游戏", "家居", "彩票", "星座",
        ]
        self.model.eval()

    def predict(self, text, top_k=3):
        """预测新闻类别，返回 top_k 个结果"""
        inputs = self.tokenizer(
            text, return_tensors="pt", truncation=True,
            max_length=512, padding="max_length"
        )
        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)[0]
            top_probs, top_ids = torch.topk(probs, top_k)

        results = []
        for prob, idx in zip(top_probs, top_ids):
            results.append({
                "category": self.categories[idx.item()],
                "confidence": round(prob.item(), 4),
            })
        return results

    def batch_predict(self, texts, batch_size=16):
        """批量预测"""
        all_results = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            for text in batch:
                all_results.append(self.predict(text))
        return all_results

# 使用示例
classifier = NewsClassifier()
text = "苹果发布会：iPhone 16 搭载 A18 芯片，支持 Apple Intelligence"
results = classifier.predict(text)
print(f"文本: {text}")
for r in results:
    print(f"  {r['category']}: {r['confidence']:.1%}")`
                }
            ],
            table: {
                headers: ["对比维度", "sklearn 方案", "HuggingFace 方案"],
                rows: [
                    ["开发速度", "快（10 行代码）", "中（需数据预处理）"],
                    ["训练时间", "秒级", "分钟到小时级"],
                    ["推理延迟", "<1ms", "10-100ms（CPU）"],
                    ["精度上限", "良好（F1 70-85%）", "优秀（F1 85-95%）"],
                    ["部署成本", "极低（纯 Python）", "中（需 GPU/ONNX）"],
                    ["可解释性", "高（TF-IDF 权重）", "低（黑盒模型）"],
                ]
            },
            mermaid: `graph TD
    A["原始文本数据"] --> B["数据清洗"]
    B --> C{"选择方案"}
    C -->|sklearn| D1["TF-IDF 特征"]
    C -->|HuggingFace| D2["Tokenize"]
    D1 --> E1["LogisticRegression / SVM"]
    D2 --> E2["BERT 微调"]
    E1 --> F["模型评估"]
    E2 --> F
    F --> G{"指标达标?"}
    G -->|否| B
    G -->|是| H["保存模型"]
    H --> I["部署上线"]
    I --> J["监控 & 迭代"]`,
            tip: "项目初期建议先用 sklearn 建立基线——如果 TF-IDF + 逻辑回归就能达到 80% 以上的 F1，说明任务相对简单，不必急于上 BERT。只有当经典方法触碰到精度天花板时，才值得投入 Transformer 微调的成本。",
            warning: "不要在训练集和测试集混合的情况下做特征提取（如 TF-IDF 的 fit_transform 必须只在训练集上 fit）。数据泄露会导致评估结果严重虚高，模型上线后性能暴跌。始终使用 Pipeline 或在 train_test_split 之后单独 fit。"
        },
    ],
};
