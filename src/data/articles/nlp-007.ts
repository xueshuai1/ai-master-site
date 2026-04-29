import { Article } from '../knowledge';

export const article: Article = {
    id: "nlp-007",
    title: "问答系统：阅读理解与开放域 QA",
    category: "nlp",
    tags: ["问答系统", "阅读理解", "NLP"],
    summary: "从 SQuAD 到 RAG，掌握机器阅读问答的技术演进",
    date: "2026-04-12",
    readTime: "20 min",
    level: "高级",
    content: [
      {
        title: "1. QA 任务分类：抽取式、生成式与开放域",
        body: `问答系统（Question Answering, QA）是 NLP 中最具实用价值的任务之一，目标是从给定上下文中或直接生成答案来回答用户提出的自然语言问题。根据问题范围、答案来源和答案形式的不同，QA 任务可以分为三大类。

**抽取式问答（Extractive QA）：** 答案必须是给定上下文（如一段文本）中连续出现的子串。系统需要预测答案在文本中的起始位置和结束位置。这类任务的评估简单客观——答案要么正确要么错误，适合构建高质量基准数据集。SQuAD 1.0 就是典型的抽取式 QA 数据集。

**生成式问答（Generative QA）：** 不限制答案必须来自上下文，模型可以自由生成文本作为答案。这使得模型能够进行摘要、推理、组合多个信息源来生成答案。T5、BART 等序列到序列模型非常适合生成式 QA。但生成式 QA 也更容易产生幻觉（Hallucination）——生成看似合理但实际错误的答案。

**开放域问答（Open-Domain QA, ODQA）：** 问题不附带任何上下文，模型需要先从一个大规模知识库（如整个维基百科）中检索相关文档，然后从中提取或生成答案。ODQA 是最贴近真实应用场景的 QA 形式——用户提出问题，系统直接给出答案，不需要用户先提供文档。ODQA 通常采用「检索+阅读」两阶段架构：检索器（Retriever）从海量文档中召回候选，阅读器（Reader）从候选中生成最终答案。`,
        code: [
          {
            lang: "python",
            code: `# QA 任务分类与形式化定义
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class QAProblem:
    """QA 问题的统一表示"""
    question: str            # 问题
    context: Optional[str]   # 上下文（抽取式/生成式有，开放域无）
    answer: Optional[str]    # 标准答案
    answer_start: Optional[int]  # 抽取式的起始位置
    answer_end: Optional[int]    # 抽取式的结束位置

class ExtractiveQA:
    """抽取式 QA：从上下文中定位答案子串"""
    
    def predict(self, question: str, context: str) -> dict:
        """
        返回: {"answer": str, "start": int, "end": int, "score": float}
        模型预测答案在 context 中的起始和结束位置
        """
        # BERT 输出 start_logits 和 end_logits
        # answer = context[start:end]
        pass

class GenerativeQA:
    """生成式 QA：自由生成答案文本"""
    
    def predict(self, question: str, context: Optional[str] = None) -> str:
        """
        模型可以基于 context 生成答案，也可以仅基于问题生成
        适用于 T5/BART 等 Seq2Seq 模型
        """
        pass

class OpenDomainQA:
    """开放域 QA：检索+阅读两阶段"""
    
    def predict(self, question: str) -> str:
        """
        1. Retriever: 从大规模语料中检索 top-K 文档
        2. Reader: 从 top-K 文档中提取/生成答案
        """
        pass

# 任务分类对比
tasks = {
    "抽取式": {"上下文": "给定", "答案来源": "上下文子串", "评估": "精确匹配/ F1"},
    "生成式": {"上下文": "可选", "答案来源": "自由生成", "评估": "人工评估/ BLEU"},
    "开放域": {"上下文": "无", "答案来源": "检索+提取", "评估": "EM/F1/召回率"},
}
for task, info in tasks.items():
    print(f"{task}: {info}")`,
          },
          {
            lang: "python",
            code: `# 问答系统评估指标详解
import re
import string
from collections import Counter

def normalize_answer(text: str) -> str:
    """标准化答案文本：转小写、去标点、去多余空白"""
    def remove_articles(t):
        return re.sub(r'\\b(a|an|the)\\b', ' ', t)
    def white_space_fix(t):
        return ' '.join(t.split())
    def remove_punc(t):
        exclude = set(string.punctuation)
        return ''.join(ch for ch in t if ch not in exclude)
    def lower(t):
        return t.lower()
    return white_space_fix(remove_articles(remove_punc(lower(text))))

def exact_match(prediction: str, ground_truth: str) -> float:
    """精确匹配（EM）：预测答案与标准答案完全一致"""
    return float(normalize_answer(prediction) == normalize_answer(ground_truth))

def f1_score(prediction: str, ground_truth: str) -> float:
    """F1 分数：基于 token 级别的重叠度"""
    pred_tokens = normalize_answer(prediction).split()
    gt_tokens = normalize_answer(ground_truth).split()
    
    if len(pred_tokens) == 0 or len(gt_tokens) == 0:
        return float(pred_tokens == gt_tokens)
    
    common = Counter(pred_tokens) & Counter(gt_tokens)
    num_same = sum(common.values())
    
    if num_same == 0:
        return 0.0
    
    precision = num_same / len(pred_tokens)
    recall = num_same / len(gt_tokens)
    return 2 * (precision * recall) / (precision + recall)

# SQuAD 评估示例
print("=== SQuAD 评估示例 ===")
predictions = [
    ("the United States", "United States"),
    ("in 1990", "1990"),
    ("a neural network", "neural networks"),
    ("Paris", "London"),
]

for pred, gold in predictions:
    em = exact_match(pred, gold)
    f1 = f1_score(pred, gold)
    print(f"预测: \"{pred}\" | 标准: \"{gold}\" | EM: {em:.0f} | F1: {f1:.2f}")`,
          },
        ],
        table: {
          headers: ["QA 类型", "上下文", "答案形式", "代表数据集", "典型模型", "应用场景"],
          rows: [
            ["抽取式", "给定单段文本", "连续子串", "SQuAD 1.0", "BERT/RoBERTa", "文档检索问答"],
            ["抽取式多答案", "给定单段文本", "多个子串", "SQuAD 2.0", "BERT + NULL token", "含无解问题"],
            ["生成式", "可选/无", "自由文本", "Natural Questions", "T5/BART", "对话式问答"],
            ["开放域", "无（需检索）", "子串或自由", "HotpotQA/NQ", "DPR + FiD", "搜索引擎问答"],
            ["多跳推理", "多个文档", "跨文档组合", "HotpotQA/2WikiMultiHop", "GraphReader", "知识图谱问答"],
          ],
        },
        mermaid: `graph TD
    A["用户提问"] --> B{"是否有上下文?"}
    B -->|"有"| C{"答案必须来自上下文?"}
    B -->|"无"| D["开放域 QA"]
    C -->|"是"| E["抽取式 QA"]
    C -->|"否"| F["生成式 QA"]
    D --> G["检索相关文档"]
    G --> H["阅读理解"]
    H --> I["生成答案"]
    E --> J["预测 start/end 位置"]
    F --> K["Seq2Seq 生成"]
    class F s3
    class E s2
    class D s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87`,
        tip: "选择 QA 类型时应从用户需求出发：如果用户需要可验证、可追溯的答案（如法律、医疗领域），抽取式 QA 更合适；如果需要自然语言回答（如客服对话），生成式 QA 体验更好。",
        warning: "生成式 QA 的幻觉问题是工业部署的最大障碍。模型可能生成看似合理但事实错误的答案，且用户难以辨别。关键场景下必须结合检索增强（RAG）或后处理事实校验来降低幻觉风险。",
      },
      {
        title: "2. SQuAD 数据集：QA 领域的 ImageNet",
        body: `SQuAD（Stanford Question Answering Dataset）由 Rajpurkar 等人在 2016 年提出，是问答系统领域最具影响力的基准数据集，其地位相当于计算机视觉中的 ImageNet。

**SQuAD 1.0** 包含 107,785 个问题-答案对，由人工标注者基于 536 篇维基百科文章创建。每个问题由标注者阅读文章段落后提出，答案是文章中的一段连续文本。训练集 87,599 对，开发集 10,570 对。

**SQuAD 2.0** 在 1.0 的基础上增加了 53,775 个「无解问题」（Unanswerable Questions）——这些问题基于文章段落编写，但段落中实际上不包含答案。这迫使模型不仅要学会回答有答案的问题，还要学会判断「这个问题无法从给定文本中回答」，这对真实应用至关重要。

**评估指标：** EM（Exact Match，答案完全匹配）和 F1（基于 token 级别的重叠度）。EM 要求预测答案与标准答案经过标准化后完全一致；F1 衡量预测和标准答案之间共有 token 的比例，对部分正确的答案给予部分分数。两个指标结合使用，EM 反映「完美回答」的能力，F1 反映「部分正确」的程度。

SQuAD 推动了 QA 技术的快速发展：从 2016 年最好的系统 EM 约 60%，到 2019 年超越人类水平（EM > 89%）。这一突破很大程度上归功于 BERT 等预训练模型的出现。`,
        code: [
          {
            lang: "python",
            code: `# SQuAD 数据集加载与分析
from datasets import load_dataset

# 加载 SQuAD v2（包含无解问题）
squad = load_dataset("squad_v2")

print("=== SQuAD 2.0 数据集统计 ===")
print(f"训练集样本数: {len(squad['train'])}")
print(f"验证集样本数: {len(squad['validation'])}")

# 分析数据分布
train_data = squad['train']
answerable_count = sum(1 for a in train_data['answers'] if a['text'])
unanswerable_count = len(train_data) - answerable_count
print(f"\\n可回答问题数: {answerable_count:,}")
print(f"无解问题数: {unanswerable_count:,}")
print(f"无解问题比例: {unanswerable_count/len(train_data)*100:.1f}%")

# 答案长度分布
answer_lengths = [len(a['text'][0]) if a['text'] else 0 for a in train_data['answers']]
avg_length = sum(l for l in answer_lengths if l > 0) / max(answerable_count, 1)
print(f"\\n平均答案长度: {avg_length:.1f} 字符")
print(f"最短答案: {min(l for l in answer_lengths if l > 0)} 字符")
print(f"最长答案: {max(answer_lengths)} 字符")

# 查看一个样本
sample = train_data[0]
print(f"\\n=== 示例 ===")
print(f"标题: {sample['title']}")
print(f"上下文: {sample['context'][:200]}...")
print(f"问题: {sample['question']}")
print(f"答案: {sample['answers']['text'][:3]}")`,
          },
          {
            lang: "python",
            code: `# SQuAD 格式的 JSON 结构解析
import json

# SQuAD 原始 JSON 格式
squad_json = {
    "version": "2.0",
    "data": [
        {
            "title": "Normans",
            "paragraphs": [
                {
                    "context": "The Normans (Norman: Nourmands; French: Normands; Latin: Normanni) were the people who in the 10th and 11th centuries gave their name to Normandy, a region in France.",
                    "qas": [
                        {
                            "question": "In what country is Normandy located?",
                            "id": "56ddde6b9a695914005b9628",
                            "answers": [
                                {
                                    "text": "France",
                                    "answer_start": 159
                                }
                            ],
                            "is_impossible": false
                        },
                        {
                            "question": "When were the Normans in Normandy?",
                            "id": "56ddde6b9a695914005b9629",
                            "answers": [],
                            "is_impossible": true
                        }
                    ]
                }
            ]
        }
    ]
}

# 展平为 (context, question, answer) 三元组
def flatten_squad(data):
    """将嵌套的 SQuAD JSON 展平为扁平列表"""
    records = []
    for article in data["data"]:
        title = article["title"]
        for paragraph in article["paragraphs"]:
            context = paragraph["context"]
            for qa in paragraph["qas"]:
                is_impossible = qa.get("is_impossible", False)
                if not is_impossible and qa["answers"]:
                    answer = qa["answers"][0]
                    records.append({
                        "title": title,
                        "context": context,
                        "question": qa["question"],
                        "answer_text": answer["text"],
                        "answer_start": answer["answer_start"],
                    })
    return records

records = flatten_squad(squad_json)
for r in records:
    print(f"Q: {r['question']}")
    print(f"A: \"{r['answer_text']}\" (start={r['answer_start']})")
    print(f"Context preview: ...{r['context'][max(0,r['answer_start']-20):r['answer_start']+len(r['answer_text'])+20]}...")
    print()`,
          },
        ],
        table: {
          headers: ["数据集", "版本", "问题数", "文章数", "无解问题", "语言", "发布时间"],
          rows: [
            ["SQuAD 1.0", "1.0", "107,785", "536", "无", "英语", "2016"],
            ["SQuAD 2.0", "2.0", "150,000+", "536", "有 (约 35%)", "英语", "2018"],
            ["CoQA", "1.0", "127,185", "7,198", "无", "英语", "2018"],
            ["QuAC", "1.0", "100,000", "1,272", "有", "英语", "2018"],
            ["CMRC 2018", "1.0", "20,000", "~500", "无", "中文", "2018"],
          ],
        },
        mermaid: `graph TD
    A["维基百科文章"] --> B["人工标注者阅读"]
    B --> C["编写问题"]
    C --> D["标注答案起止位置"]
    D --> E["SQuAD 1.0 数据集"]
    E --> F["添加无解问题"]
    F --> G["SQuAD 2.0 数据集"]
    G --> H["训练集 87K"]
    G --> I["开发集 10K"]
    G --> J["无解问题 53K"]
    H --> K["模型训练"]
    I --> L["验证/调参"]
    class K s2
    class G s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d`,
        tip: "SQuAD 2.0 的无解问题占比约 35%，训练时建议使用 null token 策略——当模型判断问题无解时，让 start 和 end 位置都指向一个特殊的 [CLS] token，这样可以将「无解判断」转化为一个分类任务。",
        warning: "SQuAD 的答案全部是维基百科文章中的连续子串，这限制了数据集的多样性。真实场景中的答案可能是多句话、需要推理的组合信息，或者根本无法从单一文档中找到。SQuAD 上表现好的模型在开放域场景中可能大幅退化。",
      },
      {
        title: "3. BERT 抽取式 QA：预训练模型的革命",
        body: `BERT 的出现彻底改变了问答系统的技术路线。2018 年，Devlin 等人提出的 BERT 模型在 SQuAD 1.0 上将 F1 分数从 80% 提升到 93%，超越了人类标注者（86.8%）的表现。

**抽取式 QA 的 BERT 方案：** BERT 将 QA 建模为一个跨度预测（Span Prediction）任务。输入格式为 [CLS] 问题 [SEP] 上下文 [SEP]，BERT 对每个 token 输出一个隐状态向量。在此基础上添加两个线性分类器：一个预测答案的起始位置（Start Classifier），一个预测答案的结束位置（End Classifier）。

具体来说，每个 token i 的起始概率 P_start(i) = softmax(W_start · H_i)，结束概率 P_end(i) = softmax(W_end · H_i)，其中 H_i 是 token i 的隐状态向量，W_start 和 W_end 是可学习的权重向量。训练时最大化正确答案起止位置的对数概率，推理时选择使 P_start(i) × P_end(j) 最大的 (i, j) 作为答案跨度。

**长上下文处理：** BERT 的最大序列长度为 512 token，但 Wikipedia 段落可能超过这个长度。常用的策略是：将长上下文切分为多个 512 token 的窗口（窗口间有重叠），分别送入 BERT，然后聚合所有窗口的预测结果——取跨度概率最高的作为最终答案。

**SQuAD 2.0 适配：** 为了处理无解问题，BERT 需要额外判断「答案不存在」。一种常用方法是：当 start 和 end 都预测为 [CLS] token 时，认为问题无解。训练时将无解样本的起止位置都标注为 [CLS] 的位置（索引 0）。`,
        code: [
          {
            lang: "python",
            code: `# BERT 抽取式 QA 模型实现
import torch
import torch.nn as nn
from transformers import BertModel

class BertForExtractiveQA(nn.Module):
    """基于 BERT 的抽取式问答模型"""
    
    def __init__(self, model_name="bert-base-chinese"):
        super().__init__()
        self.bert = BertModel.from_pretrained(model_name)
        self.qa_start = nn.Linear(self.bert.config.hidden_size, 1)
        self.qa_end = nn.Linear(self.bert.config.hidden_size, 1)
    
    def forward(self, input_ids, attention_mask,
                start_positions=None, end_positions=None):
        """
        input_ids: (batch, seq_len)
        attention_mask: (batch, seq_len)
        start_positions: (batch,) 答案起始位置
        end_positions: (batch,) 答案结束位置
        """
        outputs = self.bert(
            input_ids,
            attention_mask=attention_mask,
            return_dict=True
        )
        sequence_output = outputs.last_hidden_state  # (batch, seq_len, hidden)
        
        # 预测起始和结束位置的 logits
        start_logits = self.qa_start(sequence_output).squeeze(-1)  # (batch, seq_len)
        end_logits = self.qa_end(sequence_output).squeeze(-1)      # (batch, seq_len)
        
        total_loss = None
        if start_positions is not None and end_positions is not None:
            # 如果位置超出序列长度，截断到序列末尾
            if start_positions.max() >= start_logits.shape[1]:
                start_positions = torch.clamp(
                    start_positions, max=start_logits.shape[1] - 1
                )
            if end_positions.max() >= end_logits.shape[1]:
                end_positions = torch.clamp(
                    end_positions, max=end_logits.shape[1] - 1
                )
            
            start_loss = nn.CrossEntropyLoss()(start_logits, start_positions)
            end_loss = nn.CrossEntropyLoss()(end_logits, end_positions)
            total_loss = (start_loss + end_loss) / 2
        
        return {
            "loss": total_loss,
            "start_logits": start_logits,
            "end_logits": end_logits,
        }

    def extract_answer(self, input_ids, attention_mask, tokenizer):
        """推理：提取答案"""
        outputs = self(input_ids, attention_mask)
        start_logits = outputs["start_logits"]
        end_logits = outputs["end_logits"]
        
        # 获取最高概率的起止位置
        start_idx = torch.argmax(start_logits, dim=-1).item()
        end_idx = torch.argmax(end_logits, dim=-1).item()
        
        # 确保 end >= start
        if end_idx < start_idx:
            end_idx = start_idx
        
        answer_ids = input_ids[0][start_idx:end_idx + 1]
        answer = tokenizer.decode(answer_ids, skip_special_tokens=True)
        return answer, start_idx, end_idx`,
          },
          {
            lang: "python",
            code: `# BERT QA 推理流程演示
from transformers import BertTokenizer
import torch

# 加载模型和分词器
model_name = "bert-base-uncased"
tokenizer = BertTokenizer.from_pretrained(model_name)

# 示例问题与上下文
question = "What year did the Normans give their name to Normandy?"
context = "The Normans (Norman: Nourmands; French: Normands; Latin: Normanni) were the people who in the 10th and 11th centuries gave their name to Normandy, a region in France."

# 编码输入
inputs = tokenizer(
    question, context,
    return_tensors="pt",
    max_length=512,
    truncation=True,
    padding="max_length"
)

print("=== BERT QA 推理 ===")
print(f"问题: {question}")
print(f"上下文: {context}")
print(f"\\n输入序列长度: {inputs['input_ids'].shape[1]} tokens")

# 解码 token 序列以可视化
tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
sep_indices = [i for i, t in enumerate(tokens) if t == '[SEP]']
print(f"\\nToken 序列可视化:")
print(f"  [CLS] + 问题 token → [SEP] (索引 {sep_indices[0]}) + 上下文 token → [SEP]")

# 模拟 BERT 输出（实际应调用模型）
# start_logits 和 end_logits 由 BERT + QA heads 生成
print(f"\\n=== 跨度预测 ===")
print("BERT 对每个 token 输出两个分数:")
print("  start_score[token_i] = W_start · H_i")
print("  end_score[token_i] = W_end · H_i")
print("答案 = tokens[argmax(start_score) : argmax(end_score) + 1]")

# 长上下文窗口切分策略
def split_context_into_windows(context, tokenizer, max_len=512, stride=128):
    """将长上下文切分为重叠窗口"""
    tokens = tokenizer.encode(context, add_special_tokens=False)
    windows = []
    for i in range(0, len(tokens), max_len - stride):
        window = tokens[i:i + max_len]
        windows.append({
            "tokens": window,
            "offset": i,
            "length": len(window)
        })
    return windows

# 模拟窗口切分
windows = split_context_into_windows("A" * 2000, tokenizer, max_len=512, stride=128)
print(f"\\n=== 长上下文处理 ===")
print(f"原文长度: 2000 字符")
print(f"窗口数: {len(windows)}")
print(f"窗口大小: 512 tokens, 步长: 128 tokens")`,
          },
        ],
        table: {
          headers: ["组件", "输入维度", "输出维度", "参数量", "作用"],
          rows: [
            ["BERT Base", "(batch, 512)", "(batch, 512, 768)", "110M", "上下文编码"],
            ["Start Classifier", "(batch, 512, 768)", "(batch, 512)", "768", "预测起始位置"],
            ["End Classifier", "(batch, 512, 768)", "(batch, 512)", "768", "预测结束位置"],
            ["窗口切分", "长文本", "多个 512 token 窗口", "0", "处理超长上下文"],
            ["跨度聚合", "多窗口预测", "最佳 (start, end)", "0", "合并多窗口结果"],
          ],
        },
        mermaid: `graph TD
    A["问题 + 上下文"] --> B["Tokenize"]
    B --> C["[CLS] 问题 [SEP] 上下文 [SEP]"]
    C --> D["BERT 编码"]
    D --> E["隐状态 H₁, H₂, ..., Hₙ"]
    E --> F["Start Classifier"]
    E --> G["End Classifier"]
    F --> H["P_start(i) for each i"]
    G --> I["P_end(j) for each j"]
    H --> J["argmax P_start(i) × P_end(j)"]
    I --> J
    J --> K["答案: context[start:end]"]
    class K s3
    class J s2
    class D s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87`,
        tip: "BERT QA 推理时，不要只取 start 和 end 各自概率最高的位置——应该考虑跨度约束（end >= start），并对所有合法 (start, end) 组合计算联合概率 P(start, end) = P_start(start) × P_end(end)，取概率最高的跨度。",
        warning: "BERT 的 512 token 限制是抽取式 QA 的最大瓶颈。当答案跨越 512 token 边界时，单个窗口无法捕获完整答案。解决方案：(1) 使用滑动窗口 + 重叠切分；(2) 采用 Longformer、BigBird 等支持长序列的模型；(3) 使用 hierarchical encoding（先段落编码再答案抽取）。",
      },
      {
        title: "4. 开放域 QA：检索+阅读两阶段架构",
        body: `开放域问答（Open-Domain QA）是最具挑战性的 QA 形式——用户提出问题，系统直接从整个知识库（如维基百科的 600 万篇文章）中找到答案。这不再是一个简单的阅读理解问题，而是一个检索（Retrieval）和理解（Reading）的组合任务。

**两阶段架构：** 第一阶段是检索器（Retriever），负责从海量文档中快速召回与问题最相关的 K 个候选文档。第二阶段是阅读器（Reader），对每个候选文档执行阅读理解，提取或生成答案，然后综合多个文档的结果给出最终答案。

**检索器的关键挑战：** 在 600 万篇文档中搜索，使用 BM25 等传统信息检索方法虽然简单有效，但无法理解语义相似度。DPR（Dense Passage Retrieval）用两个独立的 BERT 编码器分别编码问题和文档，在密集向量空间（dense embedding space）中计算相似度。问题编码器和文档编码器通过对比学习（Contrastive Learning）训练，使得相关的问题-文档对在向量空间中更接近。

**阅读器的选择：** 阅读器可以是 BERT（抽取式）、T5（生成式）或 FiD（Fusion-in-Decoder，融合解码器）。FiD 的核心思想是让解码器同时看到所有检索到的候选文档，通过交叉注意力机制融合多文档信息，从而生成更准确的答案。

**端到端训练：** 最新的趋势是将检索器和阅读器联合训练，通过可微检索（Differentiable Retrieval）或强化学习使两个模块协同优化。REALM 和 RAG 是这类方法的代表。`,
        code: [
          {
            lang: "python",
            code: `# DPR (Dense Passage Retrieval) 检索器实现
import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import BertModel, BertTokenizer

class DPRRetriever(nn.Module):
    """密集段落检索器"""
    
    def __init__(self, model_name="bert-base-uncased", projection_dim=768):
        super().__init__()
        self.question_encoder = BertModel.from_pretrained(model_name)
        self.context_encoder = BertModel.from_pretrained(model_name)
        self.projection_q = nn.Linear(768, projection_dim)
        self.projection_c = nn.Linear(768, projection_dim)
    
    def encode_question(self, input_ids, attention_mask):
        """将问题编码为稠密向量"""
        outputs = self.question_encoder(input_ids, attention_mask=attention_mask)
        pooled = outputs.pooler_output  # (batch, 768)
        return self.projection_q(pooled)  # (batch, projection_dim)
    
    def encode_context(self, input_ids, attention_mask):
        """将文档编码为稠密向量"""
        outputs = self.context_encoder(input_ids, attention_mask=attention_mask)
        pooled = outputs.pooler_output
        return self.projection_c(pooled)
    
    def contrastive_loss(self, q_embeds, pos_c_embeds, neg_c_embeds, temperature=0.07):
        """
        对比损失：拉近问题-正文档对，推远问题-负文档对
        q_embeds: (batch, d) 问题向量
        pos_c_embeds: (batch, d) 正文档向量
        neg_c_embeds: (batch, K, d) 负文档向量
        """
        # 计算正样本相似度
        pos_sim = torch.sum(q_embeds * pos_c_embeds, dim=-1) / temperature  # (batch,)
        
        # 计算负样本相似度
        neg_sim = torch.einsum('bd,bkd->bk', q_embeds, neg_c_embeds) / temperature
        
        # 拼接 logits
        logits = torch.cat([pos_sim.unsqueeze(1), neg_sim], dim=-1)  # (batch, K+1)
        labels = torch.zeros(q_embeds.shape[0], dtype=torch.long, device=q_embeds.device)
        
        return F.cross_entropy(logits, labels)

# FAISS 快速相似度检索
print("=== FAISS 检索流程 ===")
print("1. 将所有文档编码为稠密向量并构建 FAISS 索引")
print("2. 将问题编码为稠密向量")
print("3. 在 FAISS 索引中进行最近邻搜索")
print("4. 返回 top-K 相关文档")`,
          },
          {
            lang: "python",
            code: `# 开放域 QA 完整两阶段流程
import torch
import numpy as np

class OpenDomainQA:
    """开放域问答系统：检索 + 阅读"""
    
    def __init__(self, retriever, reader, document_index):
        """
        retriever: DPRRetriever 实例
        reader: BertForExtractiveQA 或 T5 实例
        document_index: 文档集合 + FAISS 索引
        """
        self.retriever = retriever
        self.reader = reader
        self.doc_index = document_index
        self.top_k = 5  # 检索 top-5 文档
    
    def answer(self, question: str) -> dict:
        """
        1. 编码问题 → 稠密向量
        2. FAISS 检索 → top-K 文档
        3. 阅读器对每个文档做阅读理解
        4. 聚合多个文档的答案
        """
        # 阶段 1: 检索
        q_embed = self.retriever.encode_question(question)
        doc_ids, scores = self.doc_index.search(q_embed, k=self.top_k)
        
        # 阶段 2: 阅读
        candidates = []
        for doc_id, score in zip(doc_ids, scores):
            context = self.doc_index.get_document(doc_id)
            answer, confidence = self.reader.predict(question, context)
            candidates.append({
                "doc_id": doc_id,
                "doc_title": self.doc_index.get_title(doc_id),
                "answer": answer,
                "retrieval_score": float(score),
                "reading_confidence": float(confidence),
                "combined_score": float(score) * float(confidence),
            })
        
        # 按综合分数排序
        candidates.sort(key=lambda x: x["combined_score"], reverse=True)
        return {
            "question": question,
            "best_answer": candidates[0]["answer"],
            "candidates": candidates,
        }

# 模拟执行
print("=== 开放域 QA 执行示例 ===")
question = "Who painted the Mona Lisa?"
print(f"问题: {question}")
print(f"\\n阶段 1 - 检索:")
print(f"  编码问题 → 768 维向量")
print(f"  FAISS 搜索 → 检索 top-5 文档")
print(f"\\n阶段 2 - 阅读:")
print(f"  文档1: Wikipedia - Leonardo da Vinci → 答案: Leonardo da Vinci")
print(f"  文档2: Wikipedia - Mona Lisa → 答案: Leonardo da Vinci")
print(f"  文档3: Wikipedia - Italian Renaissance → 答案: 无")
print(f"  文档4: Wikipedia - Louvre Museum → 答案: 无")
print(f"  文档5: Wikipedia - Renaissance Art → 答案: 无")
print(f"\\n最终答案: Leonardo da Vinci")
print(f"置信度: 0.97 (多文档一致)")`,
          },
        ],
        table: {
          headers: ["检索方法", "原理", "检索速度", "语义理解", "典型召回率", "适用场景"],
          rows: [
            ["BM25", "词频逆文档频率", "极快", "无 (关键词匹配)", "72%", "精确关键词查询"],
            ["DPR", "双编码器 + 稠密向量", "快 (FAISS)", "强 (语义匹配)", "82%", "语义理解查询"],
            ["ANCE", "近似最近邻对比学习", "快 (FAISS)", "更强", "85%", "大规模密集检索"],
            ["REALM", "端到端可微检索", "慢 (在线计算)", "最强", "87%", "需要联合训练"],
            ["ColBERT", "延迟交互匹配", "中等", "强 (细粒度)", "86%", "精确细粒度匹配"],
          ],
        },
        mermaid: `graph TD
    A["用户问题"] --> B["问题编码器 (DPR)"]
    B --> C["问题向量 q"]
    C --> D["FAISS 最近邻搜索"]
    E["文档索引
600万篇"] --> D
    D --> F["Top-K 候选文档"]
    F --> G["阅读器 (BERT/FiD)"]
    G --> H["对每篇文档做阅读理解"]
    H --> I["提取候选答案"]
    I --> J["答案聚合"]
    J --> K["最终答案 + 置信度"]
    class K s3
    class G s2
    class D s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87`,
        tip: "检索阶段的质量和效率决定了整个 ODQA 系统的上限。建议：(1) 文档编码器可以离线预计算，只需在 FAISS 中构建一次索引；(2) 使用产品量化（Product Quantization）压缩文档向量，将 768 维降至 64 维，可将内存占用降低 10 倍以上且召回率损失 < 2%。",
        warning: "开放域 QA 的最大陷阱是「检索失败即回答失败」——如果正确答案所在的文档没有被检索到，阅读器再好也无济于事。这就是为什么检索质量（Recall@K）比阅读器精度更重要。建议至少检索 top-20 文档，并定期更新文档索引。",
      },
      {
        title: "5. RAG 增强问答：检索增强生成",
        body: `RAG（Retrieval-Augmented Generation）由 Facebook AI 在 2020 年提出，将检索和生成统一在一个端到端框架中，是开放域 QA 的一次范式转变。与传统的「检索→阅读」管道不同，RAG 让生成模型直接利用检索到的文档内容来生成答案。

**核心架构：** RAG 由两个预训练模型组成——一个稠密检索器（基于 DPR）和一个序列到序列生成器（基于 BART）。当收到一个问题时，检索器从文档索引中检索 top-K 个相关文档，然后将问题和所有检索到的文档一起送入 BART 生成器。BART 的解码器在生成每个词时，通过交叉注意力机制同时关注问题和所有检索到的文档。

**RAG 的两种变体：** RAG-Sequence 使用同一篇检索文档来生成整个答案序列；RAG-Token 允许在生成每个 token 时选择不同的文档作为上下文来源。RAG-Token 更灵活，但也更复杂——需要对所有可能的文档路径进行边际化（Marginalization）。

**RAG 的优势：** 相比纯生成式模型（如 GPT），RAG 生成的答案有可追溯的来源文档，降低了幻觉风险；相比纯抽取式模型，RAG 可以综合多个文档的信息生成更完整的答案；相比传统两阶段 ODQA，RAG 可以端到端训练，检索器和生成器相互适应。

**RAG 在工业中的应用：** 企业知识库问答、客服系统、法律文档问答、医疗咨询等场景都广泛使用 RAG 架构。LangChain 等框架让 RAG 的实现门槛大大降低——只需几行代码就能构建一个基于 RAG 的问答系统。`,
        code: [
          {
            lang: "python",
            code: `# RAG (Retrieval-Augmented Generation) 实现
from transformers import RagTokenizer, RagRetriever, RagSequenceForGeneration
import torch

# 加载预训练 RAG 模型
model_name = "facebook/rag-sequence-nq"  # NQ 变体
tokenizer = RagTokenizer.from_pretrained(model_name)
retriever = RagRetriever.from_pretrained(model_name)
model = RagSequenceForGeneration.from_pretrained(model_name, retriever=retriever)

# RAG 问答
question = "What is the capital of France?"
input_ids = tokenizer(question, return_tensors="pt").input_ids

# 生成答案
outputs = model.generate(input_ids=input_ids)
answer = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
print(f"问题: {question}")
print(f"RAG 答案: {answer}")`,
          },
          {
            lang: "python",
            code: `# 自定义 RAG 系统（LangChain 风格）
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Document:
    content: str
    metadata: dict

class CustomRAG:
    """自定义 RAG 问答系统"""
    
    def __init__(self, retriever, generator):
        """
        retriever: 检索器 (BM25 / FAISS / embedding-based)
        generator: 生成模型 (LLM API / 本地模型)
        """
        self.retriever = retriever
        self.generator = generator
    
    def answer(self, question: str, top_k: int = 3) -> dict:
        """
        RAG 三步流程：
        1. Retrieve: 检索相关文档
        2. Augment: 构建增强提示词
        3. Generate: 生成答案
        """
        # 步骤 1: 检索
        docs: List[Document] = self.retriever.retrieve(question, k=top_k)
        
        # 步骤 2: 构建增强上下文
        context_parts = []
        for i, doc in enumerate(docs):
            context_parts.append(f"[Document {i+1}] {doc.content}")
        context = "\\n\\n".join(context_parts)
        
        # 步骤 3: 生成答案
        prompt = self._build_prompt(question, context)
        answer = self.generator.generate(prompt)
        
        return {
            "question": question,
            "answer": answer,
            "source_documents": [
                {"content": d.content[:200], "metadata": d.metadata}
                for d in docs
            ],
        }
    
    def _build_prompt(self, question: str, context: str) -> str:
        """构建 RAG 提示词模板"""
        return f"""基于以下参考文档回答问题。如果文档中没有足够信息，请说明无法回答。

参考文档:
{context}

问题: {question}

答案:"""

# 使用示例
print("=== 自定义 RAG 系统 ===")
print("步骤 1: 构建文档索引 (FAISS / BM25)")
print("步骤 2: 配置生成模型 (LLM)")
print("步骤 3: 调用 rag.answer(question)")
print("\\n优势: 答案可追溯、降低幻觉、支持实时更新知识库")`,
          },
        ],
        table: {
          headers: ["架构", "检索方式", "生成方式", "可追溯性", "幻觉风险", "端到端训练", "代表模型"],
          rows: [
            ["纯生成式", "无", "自由生成", "无", "高", "可", "GPT-3/4"],
            ["纯抽取式", "BM25/DPR", "跨度提取", "强", "低", "部分", "DPR+BERT"],
            ["RAG-Sequence", "DPR", "单文档生成", "强", "低", "是", "RAG (Facebook)"],
            ["RAG-Token", "DPR", "多文档生成", "强", "低", "是", "RAG-Token"],
            ["FiD", "BM25/DPR", "多文档融合生成", "强", "低", "部分", "FiD (T5)"],
            ["自修正 RAG", "DPR + 自检", "生成+验证", "极强", "极低", "是", "Self-RAG"],
          ],
        },
        mermaid: `graph TD
    A["用户问题"] --> B["检索器 DPR"]
    B --> C["Top-K 文档 D₁...Dₖ"]
    C --> D["构建提示: [问题 + 文档]"]
    D --> E["BART 生成器"]
    E --> F["P(y|x,D₁,...,Dₖ)"]
    F --> G["生成答案"]
    G --> H["答案 + 来源文档"]
    
    B -.-> I["FAISS 索引
(离线预计算)"]
    E -.-> J["交叉注意力
关注文档内容"]
    H -.-> K["可追溯验证"]
    class K s3
    class G s2
    class E s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87`,
        tip: "RAG 系统的提示词工程至关重要。建议在提示中明确要求模型「仅基于参考文档回答」并「引用来源文档编号」，这可以显著降低幻觉率。同时，在提示词末尾加上「如果文档中没有答案，请如实说明不知道」，避免模型编造答案。",
        warning: "RAG 的性能高度依赖于检索质量。如果检索器召回的文档与问题无关，生成器会基于错误信息生成答案，甚至比不检索更差（因为模型会「信任」错误的上下文）。建议在检索后增加一个「相关性过滤」步骤，用交叉编码器（Cross-Encoder）重新排序检索结果。",
      },
      {
        title: "6. 多跳推理：HotpotQA 与跨文档理解",
        body: `多跳问答（Multi-hop QA）要求模型跨多个文档进行推理才能得出答案——单一文档不足以回答问题，需要将多个文档中的信息串联起来。这比单文档阅读理解更具挑战性，也更接近人类真实的信息获取方式。

**HotpotQA 数据集：** 由 Yang 等人在 2018 年提出，包含 113,000 个问题，每个问题需要至少两个 Wikipedia 文档的联合推理。例如，问题是「Pavel Urysohn 和 Leonid Levin 在哪所大学是同事？」——需要先查到 Pavel Urysohn 的信息，再查到 Leonid Levin 的信息，然后找到两人共同的机构。

**多跳推理的两种范式：** (1) 管道式（Pipeline）——先通过问题找到第一个文档和中间实体，再用中间实体找第二个文档，依此类推；(2) 端到端（End-to-End）——将所有候选文档同时送入模型，让模型自行学习跨文档的推理路径。

**图神经网络方法：** 一种有效的多跳推理方法是构建文档-实体图（Document-Entity Graph）。每个文档和提到的实体作为图节点，实体共现关系作为边，然后使用图注意力网络（GAT）在图上进行消息传递，最终聚合全局信息来回答问题。

**评估指标：** 除了 EM 和 F1，HotpotQA 还引入了支持事实预测（Supporting Fact Prediction）评估——模型不仅要回答正确，还要指出支持答案的具体句子。这要求模型具有可解释的推理能力。`,
        code: [
          {
            lang: "python",
            code: `# HotpotQA 多跳推理：管道式方法
from collections import defaultdict

class PipelineMultiHopQA:
    """管道式多跳推理 QA"""
    
    def __init__(self, retriever, reader):
        self.retriever = retriever
        self.reader = reader
    
    def answer_multihop(self, question: str) -> dict:
        """
        多跳推理流程:
        跳 1: 问题 → 检索文档 → 提取中间实体
        跳 2: 中间实体 → 检索新文档 → 提取答案
        """
        # 第一跳：检索与问题直接相关的文档
        hop1_docs = self.retriever.retrieve(question, k=5)
        
        # 从第一跳文档中提取中间实体
        intermediate_entities = []
        for doc in hop1_docs:
            # 使用 NER 或关键词提取中间实体
            entities = self._extract_entities(question, doc)
            intermediate_entities.extend(entities)
        
        # 第二跳：用中间实体检索更多文档
        hop2_docs = []
        for entity in intermediate_entities[:3]:  # 最多取 3 个实体
            related_docs = self.retriever.retrieve(entity, k=3)
            hop2_docs.extend(related_docs)
        
        # 综合所有文档，生成答案
        all_docs = hop1_docs + hop2_docs
        answer, supporting_facts = self.reader.multidoc_read(question, all_docs)
        
        return {
            "answer": answer,
            "supporting_facts": supporting_facts,
            "hop1_docs": [d.title for d in hop1_docs],
            "hop2_docs": [d.title for d in hop2_docs],
            "intermediate_entities": intermediate_entities,
        }
    
    def _extract_entities(self, question, doc):
        """从文档中提取中间实体（简化版）"""
        return ["Entity1", "Entity2"]

# HotpotQA 问题类型
print("=== HotpotQA 问题类型 ===")
types = {
    "bridge": {"描述": "桥接推理", "示例": "A 的 B 是哪个国家的？"},
    "comparison": {"描述": "比较推理", "示例": "A 和 B 谁出生得更早？"},
    "inference": {"描述": "隐含推理", "示例": "A 的导师的学生是谁？"},
}
for t, info in types.items():
    print(f"  {t}: {info['描述']} - {info['示例']}")`,
          },
          {
            lang: "python",
            code: `# 文档-实体图构建与推理
import torch
import torch.nn as nn
import torch.nn.functional as F

class EntityGraph:
    """文档-实体图"""
    
    def __init__(self):
        self.nodes = []       # 节点列表 (文档节点 + 实体节点)
        self.edges = []       # 边列表 (实体共现关系)
        self.adj_matrix = None  # 邻接矩阵
    
    def build_from_documents(self, documents):
        """
        从文档集合构建图:
        - 每个文档作为一个节点
        - 每个命名实体作为一个节点
        - 如果两个实体在同一文档中出现，则添加边
        """
        node_id = 0
        doc_nodes = []
        entity_nodes = {}
        
        for doc in documents:
            # 添加文档节点
            doc_nodes.append(node_id)
            self.nodes.append({"type": "document", "content": doc.content})
            node_id += 1
            
            # 添加实体节点和边
            for entity in doc.entities:
                if entity not in entity_nodes:
                    entity_nodes[entity] = node_id
                    self.nodes.append({"type": "entity", "name": entity})
                    node_id += 1
                
                # 文档-实体边
                self.edges.append((doc_nodes[-1], entity_nodes[entity]))
        
        # 构建邻接矩阵
        n = len(self.nodes)
        self.adj_matrix = torch.zeros(n, n)
        for i, j in self.edges:
            self.adj_matrix[i][j] = 1
            self.adj_matrix[j][i] = 1  # 无向图
        
        print(f"图构建完成: {n} 个节点, {len(self.edges)} 条边")

class GraphAttentionNetwork(nn.Module):
    """图注意力网络 (GAT) 用于多跳推理"""
    
    def __init__(self, input_dim, hidden_dim, n_heads=4, dropout=0.1):
        super().__init__()
        self.attention = nn.MultiheadAttention(
            hidden_dim, n_heads, dropout=dropout, batch_first=True
        )
        self.linear_in = nn.Linear(input_dim, hidden_dim)
        self.linear_out = nn.Linear(hidden_dim, input_dim)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, node_features, adj_matrix):
        """
        node_features: (n_nodes, input_dim) 节点特征
        adj_matrix: (n_nodes, n_nodes) 邻接矩阵
        """
        h = self.linear_in(node_features)
        h = self.dropout(h)
        
        # 使用邻接矩阵作为注意力 mask
        mask = (adj_matrix == 0).bool()
        
        h_attn, _ = self.attention(h.unsqueeze(0), h.unsqueeze(0), h.unsqueeze(0),
                                    key_padding_mask=mask)
        h_attn = h_attn.squeeze(0)
        
        h_out = self.linear_out(h_attn + h)  # 残差连接
        return h_out

print("=== 图推理流程 ===")
print("1. 构建文档-实体图")
print("2. 初始化节点特征 (BERT 编码)")
print("3. GAT 消息传递 (2-3 层)")
print("4. 聚合全局信息 → 回答问题")`,
          },
        ],
        table: {
          headers: ["方法", "推理方式", "检索策略", "文档数", "HotpotQA Dev F1", "特点"],
          rows: [
            ["BERT single-doc", "单文档抽取", "BM25 top-1", "1", "42.1%", "基线方法"],
            ["BERT multi-doc", "多文档拼接", "BM25 top-5", "5", "51.7%", "简单拼接"],
            ["CogQA (Cognitive)", "管道式两跳", "检索+实体", "10+", "68.3%", "模拟人类推理"],
            ["GNN-based", "图神经网络", "实体图传播", "可变", "70.1%", "显式建模关系"],
            ["FiD", "融合解码", "DPR top-K", "20", "74.2%", "无需显式图构建"],
            ["Program-guided", "程序化推理", "推理路径规划", "可变", "76.5%", "可解释推理链"],
          ],
        },
        mermaid: `graph TD
    A["问题: Pavel Urysohn 和
Leonid Levin 在哪所大学是同事?"] --> B["第一跳: 检索 Pavel Urysohn"]
    B --> C["文档: Pavel Urysohn
→ 中间实体: Leonid Levin"]
    C --> D["第二跳: 检索 Leonid Levin"]
    D --> E["文档: Leonid Levin
→ 机构: Hebrew University"]
    E --> F["综合推理: 两人共同的机构"]
    F --> G["答案: Hebrew University"]
    
    C -.->|"桥接实体"| D
    E -.->|"桥接实体"| F
    class G s3
    class E s2
    class C s1
    class A s0
    classDef s0 fill:#1e3a5f
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#581c87`,
        tip: "多跳 QA 的成功关键不在于模型有多复杂，而在于检索是否能覆盖所有推理路径上的文档。建议采用「扩展检索」策略——不仅检索与问题直接相关的文档，还检索与问题中实体相关的文档，以提高推理路径的覆盖率。",
        warning: "多跳推理中的「误差累积」问题比单文档 QA 严重得多——如果第一跳检索或提取的中间实体错误，后续所有推理都会偏离正确路径。建议在每一步推理后进行「一致性检查」，确保中间结果与问题逻辑一致。",
      },
      {
        title: "7. HuggingFace 实战：构建完整 QA 系统",
        body: `本节通过 HuggingFace 的 Transformers 和 Datasets 库，从零构建一个完整的问答系统——包括数据加载、模型训练、评估和推理部署。我们将覆盖抽取式 QA 和开放域 QA 两种场景。

**抽取式 QA 微调：** 使用 HuggingFace 的 QuestionAnsweringPipeline 可以快速上手，但要获得最佳性能，需要用特定领域的数据微调预训练模型。HuggingFace Trainer API 提供了标准的训练循环，配合 DataCollator 自动处理变长序列的 padding。

**开放域 QA 部署：** 对于生产环境的 ODQA 系统，推荐使用 Haystack（由 deepset 开发的开源 QA 框架）或 LangChain。这些框架封装了检索器、阅读器和文档索引的完整 pipeline，支持多种后端（Elasticsearch、FAISS、Weaviate 等）。

**性能优化：** 在推理阶段，可以使用模型蒸馏（Distillation）将大模型压缩为小模型，保持 95% 以上精度的同时将推理速度提升 3-5 倍。ONNX Runtime 和 TensorRT 可以进一步优化推理延迟。对于高并发场景，建议将检索和阅读分离部署——检索器无状态、易于水平扩展；阅读器有状态、需要 GPU 资源。`,
        code: [
          {
            lang: "python",
            code: `# HuggingFace 抽取式 QA 完整训练流程
from datasets import load_dataset
from transformers import (
    AutoTokenizer, AutoModelForQuestionAnswering,
    TrainingArguments, Trainer, DataCollatorWithPadding,
    default_data_collator
)
import numpy as np

# 1. 加载数据和模型
dataset = load_dataset("squad")
model_name = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForQuestionAnswering.from_pretrained(model_name)

# 2. 预处理函数
max_length = 384
stride = 128

def preprocess_function(examples):
    questions = [q.strip() for q in examples["question"]]
    inputs = tokenizer(
        questions,
        examples["context"],
        max_length=max_length,
        truncation="only_second",
        stride=stride,
        return_overflowing_tokens=True,
        return_offsets_mapping=True,
        padding="max_length",
    )
    
    sample_map = inputs.pop("overflow_to_sample_mapping")
    answers = examples["answers"]
    start_positions = []
    end_positions = []
    
    for i, offset in enumerate(inputs["offset_mapping"]):
        sample_idx = sample_map[i]
        answer = answers[sample_idx]
        start_char = answer["answer_start"][0]
        end_char = start_char + len(answer["text"][0])
        
        # 判断答案是否在当前窗口内
        seq_ids = inputs.sequence_ids(i)
        context_start = seq_ids.index(1)
        context_end = len(seq_ids) - 1 - seq_ids[::-1].index(1)
        
        if offset[context_start][0] > end_char or offset[context_end][1] < start_char:
            start_positions.append(0)
            end_positions.append(0)
        else:
            idx = context_start
            while idx <= context_end and offset[idx][0] <= start_char:
                idx += 1
            start_positions.append(idx - 1)
            
            idx = context_end
            while idx >= context_start and offset[idx][1] >= end_char:
                idx -= 1
            end_positions.append(idx + 1)
    
    inputs["start_positions"] = start_positions
    inputs["end_positions"] = end_positions
    return inputs

# 3. 应用预处理
tokenized_datasets = dataset.map(
    preprocess_function,
    batched=True,
    remove_columns=dataset["train"].column_names,
)

print("=== 训练配置 ===")
print(f"训练集窗口数: {len(tokenized_datasets['train']):,}")
print(f"验证集窗口数: {len(tokenized_datasets['validation']):,}")`,
          },
          {
            lang: "python",
            code: `# QA 系统推理部署
from transformers import pipeline
import torch

# 方法 1: 使用 QuestionAnsweringPipeline（最简单）
qa_pipeline = pipeline(
    "question-answering",
    model="deepset/bert-base-cased-squad2",
    device=0 if torch.cuda.is_available() else -1,
)

result = qa_pipeline(
    question="What is the capital of France?",
    context="Paris is the capital and most populous city of France."
)
print(f"Pipeline 结果: {result}")

# 方法 2: 手动推理（更灵活）
from transformers import AutoTokenizer, AutoModelForQuestionAnswering

tokenizer = AutoTokenizer.from_pretrained("deepset/bert-base-cased-squad2")
model = AutoModelForQuestionAnswering.from_pretrained("deepset/bert-base-cased-squad2")
model.eval()

def answer_question(question: str, context: str, max_len: int = 512):
    """手动 QA 推理，支持长上下文窗口聚合"""
    # 编码
    inputs = tokenizer(
        question, context,
        return_tensors="pt",
        max_length=max_len,
        truncation=True,
        padding="max_length"
    )
    
    # 推理
    with torch.no_grad():
        outputs = model(**inputs)
        start_logits = outputs.start_logits
        end_logits = outputs.end_logits
    
    # 解码
    start_idx = torch.argmax(start_logits).item()
    end_idx = torch.argmax(end_logits).item()
    
    answer_tokens = inputs.input_ids[0][start_idx:end_idx + 1]
    answer = tokenizer.decode(answer_tokens, skip_special_tokens=True)
    
    return answer

# 方法 3: 长上下文多窗口推理
def answer_long_context(question: str, context: str, max_len: int = 512, stride: int = 128):
    """处理超过 max_len 的长上下文"""
    tokens = tokenizer.encode(context, add_special_tokens=False)
    
    best_score = float('-inf')
    best_answer = ""
    
    for i in range(0, len(tokens), max_len - stride):
        window = tokens[i:i + max_len]
        # 添加特殊 token
        window_with_specials = [tokenizer.cls_token_id] + tokenizer.encode(question) + \
                               [tokenizer.sep_token_id] + window + [tokenizer.sep_token_id]
        
        if len(window_with_specials) > max_len:
            continue
        
        input_ids = torch.tensor([window_with_specials])
        attention_mask = torch.ones_like(input_ids)
        
        with torch.no_grad():
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        
        # 计算联合概率
        start_probs = torch.softmax(outputs.start_logits, dim=-1)
        end_probs = torch.softmax(outputs.end_logits, dim=-1)
        
        # 在上下文范围内搜索
        question_len = len(tokenizer.encode(question)) + 2
        for s in range(question_len, len(window_with_specials)):
            for e in range(s, min(s + 30, len(window_with_specials))):
                score = start_probs[0][s].item() * end_probs[0][e].item()
                if score > best_score:
                    best_score = score
                    ans_tokens = input_ids[0][s:e+1]
                    best_answer = tokenizer.decode(ans_tokens, skip_special_tokens=True)
    
    return best_answer, best_score

print("=== 部署优化建议 ===")
print("1. 使用 ONNX 导出: python -m transformers.onnx --model=xxx onnx/")
print("2. 使用 ONNX Runtime 加速: pip install onnxruntime-gpu")
print("3. 量化压缩: INT8 量化可减少 75% 模型大小")
print("4. 批处理推理: 合并多个问题的推理请求")`,
          },
        ],
        table: {
          headers: ["部署方式", "延迟 (P50)", "吞吐量", "显存需求", "适用场景"],
          rows: [
            ["Pipeline API", "~50ms", "~20 QPS", "~1.5 GB", "快速原型/小规模"],
            ["ONNX Runtime", "~20ms", "~50 QPS", "~1.2 GB", "中等规模生产"],
            ["TensorRT", "~10ms", "~100 QPS", "~1.0 GB", "大规模高性能"],
            ["INT8 量化", "~15ms", "~60 QPS", "~400 MB", "边缘设备/移动端"],
            ["DistilBERT", "~25ms", "~40 QPS", "~300 MB", "资源受限环境"],
          ],
        },
        mermaid: `graph TD
    A["原始 BERT QA 模型"] --> B["模型蒸馏"]
    B --> C["DistilBERT QA"]
    C --> D["ONNX 导出"]
    D --> E["ONNX Runtime 推理"]
    E --> F["TensorRT 优化"]
    
    A --> G["INT8 量化"]
    G --> E
    
    C --> H["~25ms 延迟"]
    E --> I["~20ms 延迟"]
    F --> J["~10ms 延迟"]
    class J s3
    class F s2
    class C s1
    class A s0
    classDef s0 fill:#7f1d1d
    classDef s1 fill:#713f12
    classDef s2 fill:#14532d
    classDef s3 fill:#14532d`,
        tip: "生产环境部署 QA 系统时，建议采用「快速失败」策略——如果检索阶段的相关文档分数低于阈值，直接返回「无法回答」而不是强行生成答案。这比生成错误答案后再修正要好得多。",
        warning: "不要在推理时动态加载模型——每次加载 BERT 模型需要 2-3 秒，会严重影响响应时间。正确做法是在服务启动时预加载模型到内存或 GPU，推理时直接使用已加载的模型实例。对于多 GPU 部署，使用 torch.nn.DataParallel 或 HuggingFace Accelerate 实现模型并行。",
      },
    ],
};
