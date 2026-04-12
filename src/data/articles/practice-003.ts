import { Article } from '../knowledge';

export const article: Article = {
  id: "practice-003",
  title: "智能客服与对话系统",
  category: "practice",
  tags: ["智能客服", "对话系统", "NLP"],
  summary: "从规则引擎到 LLM，掌握对话系统的演进与最佳实践",
  date: "2026-04-12",
  readTime: "18 min",
  level: "进阶",
  content: [
    {
      title: "1. 对话系统概述",
      body: `对话系统是人工智能在人机交互领域的重要应用，核心目标是让机器能够理解人类语言并给出合理的回复。对话系统经历了从早期的规则驱动、到统计学习方法、再到深度学习和大语言模型的演进过程。按技术架构可分为任务型对话、闲聊型对话和知识问答型对话三大类。任务型对话聚焦于完成特定业务目标，如订票、查询、退款等，需要精确的意图识别和槽位填充。闲聊型对话追求自然流畅的交流体验，不追求完成特定任务。知识问答型对话则基于知识库进行精准问答。一个完整的对话系统通常包含自然语言理解、对话管理、自然语言生成三大核心模块，分别负责理解用户输入、维护对话状态和生成系统回复。现代对话系统还融入了情感分析、多轮上下文追踪、个性化推荐等高级能力。`,
      code: [
        {
          lang: "python",
          code: `# 对话系统基础架构
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional
from enum import Enum

class DialogueAct(Enum):
    INFORM = "inform"
    REQUEST = "request"
    CONFIRM = "confirm"
    DENY = "deny"
    THANK = "thank"
    CLOSE = "close"

@dataclass
class DialogueState:
    intent: str = ""
    slots: dict = field(default_factory=dict)
    history: List[dict] = field(default_factory=list)
    confidence: float = 0.0
    turn_count: int = 0

@dataclass
class UserUtterance:
    text: str
    timestamp: float
    channel: str = "web"

@dataclass
class SystemResponse:
    text: str
    actions: List[str] = field(default_factory=list)
    suggestions: List[str] = field(default_factory=list)

class DialogueSystem(ABC):
    @abstractmethod
    def nlu(self, utterance: UserUtterance) -> dict:
        pass

    @abstractmethod
    def dialogue_management(self, state: DialogueState, nlu_result: dict) -> DialogueState:
        pass

    @abstractmethod
    def nlg(self, state: DialogueState) -> SystemResponse:
        pass

    def process(self, utterance: UserUtterance, state: DialogueState) -> SystemResponse:
        nlu_result = self.nlu(utterance)
        new_state = self.dialogue_management(state, nlu_result)
        return self.nlg(new_state)`
        },
        {
          lang: "python",
          code: `# 对话系统评估指标
import numpy as np
from collections import defaultdict

def task_success_rate(completed_tasks: int, total_tasks: int) -> float:
    """任务完成率：成功完成的任务占总任务的比例"""
    return completed_tasks / total_tasks if total_tasks > 0 else 0.0

def slot_filling_f1(predicted: dict, ground_truth: dict) -> dict:
    """槽位填充的精确率、召回率和 F1 分数"""
    tp = sum(1 for k, v in predicted.items()
             if k in ground_truth and ground_truth[k] == v)
    fp = sum(1 for k, v in predicted.items()
             if k not in ground_truth or ground_truth[k] != v)
    fn = sum(1 for k, v in ground_truth.items()
             if k not in predicted or predicted[k] != v)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    return {"precision": precision, "recall": recall, "f1": f1}

def dialogue_turn_efficiency(turns: List[int]) -> dict:
    """对话效率指标：完成任务的平均轮数和方差"""
    arr = np.array(turns)
    return {"mean_turns": float(arr.mean()), "std_turns": float(arr.std()), "median": float(np.median(arr))}`
        }
      ],
      table: {
        headers: ["对话类型", "核心目标", "评估指标", "典型应用"],
        rows: [
          ["任务型对话", "完成特定业务目标", "任务完成率、平均轮数", "订票、银行客服"],
          ["闲聊型对话", "自然流畅交流", "连贯性、用户满意度", "社交机器人、陪伴"],
          ["知识问答对话", "精准回答问题", "准确率、信息覆盖率", "产品咨询、FAQ"],
          ["混合对话", "兼顾任务与体验", "综合指标", "电商平台客服"]
        ]
      },
      mermaid: `graph LR
    A["用户输入"] --> B["NLU 自然语言理解"]
    B --> C["对话管理 DM"]
    C --> D["NLG 自然语言生成"]
    D --> E["系统回复"]
    B --> F["意图识别"]
    B --> G["槽位填充"]
    C --> H["状态追踪 DST"]
    C --> I["策略选择 POL"]`,
      tip: "设计对话系统时，先明确业务场景属于哪种对话类型，不同类型对 NLU 精度和 NLG 自然度的要求差异很大",
      warning: "不要试图用一套架构解决所有对话场景，任务型和闲聊型对话在技术选型和评估标准上存在根本差异"
    },
    {
      title: "2. 规则引擎与意图识别",
      body: `意图识别是对话系统的第一个关键环节，决定了系统能否正确理解用户的真实需求。早期的意图识别主要依赖规则引擎，通过关键词匹配、正则表达式和决策树等确定方式判断用户意图。规则引擎的优势在于完全可控、解释性强、不需要训练数据，在业务逻辑简单且意图种类较少的场景下表现稳定。随着意图种类增多，规则的维护成本呈指数增长，规则之间的冲突和优先级问题变得难以管理。基于机器学习的意图识别方法使用分类算法（如 SVM、朴素贝叶斯、TextCNN、BERT）自动学习意图的文本特征，大幅降低了维护成本。工业界通常采用规则和机器学习相结合的策略：高频明确意图用规则快速响应，长尾复杂意图用模型分类，同时设置兜底规则处理模型低置信度的情况。槽位填充作为意图识别的配套任务，使用序列标注方法（如 BiLSTM-CRF、BERT-CRF）提取关键信息。`,
      code: [
        {
          lang: "python",
          code: `# 规则引擎意图识别
import re
from typing import Tuple, Optional

class RuleIntentClassifier:
    def __init__(self):
        self.rules = []

    def add_rule(self, intent: str, patterns: list, priority: int = 0):
        compiled = [re.compile(p, re.IGNORECASE) for p in patterns]
        self.rules.append((intent, compiled, priority))
        self.rules.sort(key=lambda x: -x[2])

    def classify(self, text: str) -> Tuple[str, float]:
        for intent, patterns, priority in self.rules:
            for pattern in patterns:
                if pattern.search(text):
                    confidence = min(0.95, 0.5 + priority * 0.1)
                    return intent, confidence
        return "unknown", 0.0

    def extract_slots(self, text: str, slot_patterns: dict) -> dict:
        """从文本中提取槽位信息"""
        slots = {}
        for slot_name, pattern in slot_patterns.items():
            match = re.search(pattern, text)
            if match:
                slots[slot_name] = match.group(1) if match.groups() else match.group(0)
        return slots

# 使用示例
classifier = RuleIntentClassifier()
classifier.add_rule("check_order", [r"查询.*订单", r"订单.*状态", r"我的订单"], priority=3)
classifier.add_rule("refund", [r"退款", r"退货", r"取消订单"], priority=2)
slot_patterns = {"order_id": r"订单号[为是]*(\\S+)"}
print(classifier.extract_slots("查询订单号为ORD123456的状态", slot_patterns))`
        },
        {
          lang: "python",
          code: `# 基于 BERT 的意图识别
import torch
import torch.nn as nn
from transformers import BertModel, BertTokenizer

class BertIntentClassifier(nn.Module):
    def __init__(self, num_intents: int, model_name: str = "bert-base-chinese"):
        super().__init__()
        self.bert = BertModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(0.3)
        self.classifier = nn.Linear(self.bert.config.hidden_size, num_intents)

    def forward(self, input_ids: torch.Tensor,
                attention_mask: torch.Tensor) -> torch.Tensor:
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled = outputs.pooler_output
        pooled = self.dropout(pooled)
        logits = self.classifier(pooled)
        return logits

    def predict(self, text: str, tokenizer: BertTokenizer,
                device: str = "cpu") -> Tuple[str, float]:
        inputs = tokenizer(text, return_tensors="pt", padding=True,
                          truncation=True, max_length=128)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        self.eval()
        with torch.no_grad():
            logits = self.forward(**inputs)
            probs = torch.softmax(logits, dim=-1)
            conf, pred = torch.max(probs, dim=-1)
        return str(pred.item()), float(conf.item())

# 序列标注：槽位填充（BiLSTM-CRF）
class BiLSTMCRF(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, hidden_dim: int,
                 num_tags: int):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, bidirectional=True,
                           batch_first=True)
        self.hidden2tag = nn.Linear(hidden_dim * 2, num_tags)
        self.crf = nn.Linear(num_tags, num_tags)

    def forward(self, input_ids: torch.Tensor) -> torch.Tensor:
        embeds = self.embedding(input_ids)
        lstm_out, _ = self.lstm(embeds)
        emissions = self.hidden2tag(lstm_out)
        return emissions`
        }
      ],
      table: {
        headers: ["方法", "训练数据需求", "可解释性", "适用场景"],
        rows: [
          ["关键词匹配", "无需训练", "极高", "意图少、表达固定"],
          ["正则表达式", "无需训练", "高", "格式化的信息提取"],
          ["TextCNN", "数百条标注", "中等", "短文本快速分类"],
          ["BERT 微调", "千条级标注", "较低", "复杂语义理解"],
          ["规则+模型混合", "部分标注", "可配置", "工业级生产环境"]
        ]
      },
      mermaid: `graph TD
    A["用户输入文本"] --> B{"规则匹配?"}
    B -->|"匹配成功"| C["返回规则意图"]
    B -->|"未匹配"| D["ML 模型分类"]
    D --> E{"置信度 > 阈值?"}
    E -->|"是"| F["返回模型意图"]
    E -->|"否"| G["兜底策略"]
    G --> H["确认意图 / 转人工"]
    C --> I["槽位提取"]
    F --> I
    I --> J["结构化语义表示"]`,
      tip: "工业环境中规则引擎和模型分类必须配合使用，规则处理高频确定性场景，模型覆盖长尾情况，兜底策略保证系统鲁棒性",
      warning: "意图分类的类别设计要避免重叠，互斥的意图体系是高质量对话的基础，类别之间界限模糊会导致模型训练困难"
    },
    {
      title: "3. 检索式对话",
      body: `检索式对话系统从候选回复库中选择最合适的回复返回给用户，是工业界最早大规模落地的对话方案。其核心流程是将用户输入和候选回复映射到同一向量空间，通过相似度计算排序后选择最佳回复。候选回复来源包括人工编写的 FAQ 库、历史客服对话记录和产品文档等。检索式对话的优势在于回复质量可控、不会出现幻觉、响应速度快，特别适合知识问答型场景。向量检索技术是关键：传统方法使用 TF-IDF 和 BM25 计算文本相似度，现代方法使用双塔模型将文本编码为稠密向量，再用近似最近邻算法加速检索。检索式系统的瓶颈在于候选库的覆盖度——用户提问方式多样，如果候选库中没有匹配的问答对，系统就无法回复。因此需要结合改写、扩展等策略提升召回率。同时，检索式系统难以处理需要多轮交互的复杂任务，更适合单轮问答场景。`,
      code: [
        {
          lang: "python",
          code: `# BM25 检索式对话
import math
from collections import Counter, defaultdict
from typing import List, Tuple

class BM25Retriever:
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus = []
        self.doc_freq = defaultdict(int)
        self.doc_lengths = []
        self.avg_doc_length = 0.0

    def build(self, documents: List[str]):
        self.corpus = [doc.lower().split() for doc in documents]
        self.doc_lengths = [len(doc) for doc in self.corpus]
        self.avg_doc_length = sum(self.doc_lengths) / len(self.corpus) if self.corpus else 0

        for doc in self.corpus:
            for term in set(doc):
                self.doc_freq[term] += 1

    def score(self, query: str, doc_idx: int) -> float:
        query_terms = query.lower().split()
        doc = self.corpus[doc_idx]
        doc_len = self.doc_lengths[doc_idx]
        N = len(self.corpus)

        total_score = 0.0
        term_counts = Counter(doc)

        for term in query_terms:
            if term not in self.doc_freq or self.doc_freq[term] == 0:
                continue
            tf = term_counts.get(term, 0)
            idf = math.log((N - self.doc_freq[term] + 0.5) /
                          (self.doc_freq[term] + 0.5) + 1.0)
            numerator = tf * (self.k1 + 1)
            denominator = tf + self.k1 * (
                1 - self.b + self.b * doc_len / self.avg_doc_length
            )
            total_score += idf * numerator / denominator

        return total_score

    def retrieve(self, query: str, top_k: int = 5) -> List[Tuple[int, float]]:
        scores = [(i, self.score(query, i)) for i in range(len(self.corpus))]
        return sorted(scores, key=lambda x: -x[1])[:top_k]`
        },
        {
          lang: "python",
          code: `# 双塔向量检索对话
import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import BertModel

class DualTowerRetriever(nn.Module):
    def __init__(self, model_name: str = "bert-base-chinese",
                 temperature: float = 0.07):
        super().__init__()
        self.encoder = BertModel.from_pretrained(model_name)
        self.temperature = temperature
        self.projection = nn.Linear(768, 256)

    def encode(self, input_ids: torch.Tensor,
               attention_mask: torch.Tensor) -> torch.Tensor:
        outputs = self.encoder(input_ids, attention_mask=attention_mask)
        cls = outputs.last_hidden_state[:, 0, :]
        return F.normalize(self.projection(cls), p=2, dim=-1)

    def forward(self, query_ids: torch.Tensor, query_mask: torch.Tensor,
                doc_ids: torch.Tensor, doc_mask: torch.Tensor) -> torch.Tensor:
        q_emb = self.encode(query_ids, query_mask)
        d_emb = self.encode(doc_ids, doc_mask)
        return torch.sum(q_emb * d_emb, dim=-1) / self.temperature

    def retrieve(self, query_embedding: torch.Tensor,
                 doc_embeddings: torch.Tensor,
                 top_k: int = 5) -> Tuple[List[int], List[float]]:
        scores = query_embedding @ doc_embeddings.T
        top_scores, top_indices = torch.topk(scores, top_k)
        return top_indices.tolist(), top_scores.tolist()

# 构建索引并检索
class FAQRetrievalSystem:
    def __init__(self, model: DualTowerRetriever, faq_pairs: List[Tuple[str, str]]):
        self.model = model
        self.questions = [q for q, _ in faq_pairs]
        self.answers = [a for _, a in faq_pairs]

    def build_index(self, tokenizer, device: str = "cpu"):
        self.model.eval()
        with torch.no_grad():
            tokens = tokenizer(self.questions, padding=True,
                              return_tensors="pt", truncation=True, max_length=64)
            self.doc_embeddings = self.model.encode(
                tokens["input_ids"].to(device),
                tokens["attention_mask"].to(device)
            )

    def search(self, query: str, tokenizer, top_k: int = 3) -> List[str]:
        self.model.eval()
        with torch.no_grad():
            tokens = tokenizer(query, return_tensors="pt",
                              truncation=True, max_length=64)
            q_emb = self.model.encode(tokens["input_ids"], tokens["attention_mask"])
            indices, scores = self.model.retrieve(q_emb, self.doc_embeddings, top_k)
        return [self.answers[i] for i in indices]`
        }
      ],
      table: {
        headers: ["检索方法", "检索速度", "语义理解", "维护成本", "适用场景"],
        rows: [
          ["BM25 关键词", "极快", "无", "低", "精确匹配问答"],
          ["TF-IDF", "快", "弱", "低", "文档级别检索"],
          ["Sentence-BERT", "中等", "强", "中", "语义相似问答"],
          ["双塔模型 + Faiss", "快", "很强", "高", "大规模语义检索"],
          ["ColBERT 交叉编码", "较慢", "极强", "高", "高精度精排"]
        ]
      },
      mermaid: `graph LR
    A["用户问题"] --> B["文本预处理"]
    B --> C["向量化编码"]
    C --> D["Faiss 向量检索"]
    D --> E["Top-K 候选"]
    E --> F["交叉编码器精排"]
    F --> G["最佳回复"]
    G --> H["置信度检查"]
    H -->|"高置信"| I["直接回复"]
    H -->|"低置信"| J["转人工"]`,
      tip: "检索式系统的 FAQ 库应该定期更新和维护，建议每月分析未命中问题，补充新的问答对，保持候选库的时效性和覆盖率",
      warning: "向量检索虽然能理解语义相似性，但对否定句和反问句的判断容易出错，需要额外的后处理逻辑或交叉编码器校验"
    },
    {
      title: "4. 生成式对话",
      body: `生成式对话系统通过序列到序列模型直接生成回复文本，不再受限于预定义的候选回复库，具有更强的灵活性和表达能力。Seq2Seq 模型是最早的生成式对话架构，包含编码器（理解输入）和解码器（生成输出），通过注意力机制实现输入输出的软对齐。Transformer 架构的引入大幅提升了生成质量，自注意力机制能够捕获长距离依赖关系。生成式对话面临的经典挑战包括：通用回复问题（模型倾向生成"好的"、"不知道"等安全但无意义的回复）、前后矛盾（同一事实在不同对话中回答不一致）、缺乏知识（模型仅依赖训练数据中的知识）。针对这些问题，研究者们提出了多样化解码策略（如 top-k 采样、nucleus sampling）、知识增强生成（将外部知识注入生成过程）、一致性约束（通过强化学习惩罚矛盾回复）等解决方案。工业应用中，生成式对话多用于闲聊场景和简单问答，任务型场景仍以检索式和规则式为主。`,
      code: [
        {
          lang: "python",
          code: `# Seq2Seq 对话模型（PyTorch）
import torch
import torch.nn as nn
import torch.nn.functional as F

class Encoder(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, hidden_dim: int,
                 n_layers: int = 2, dropout: float = 0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, n_layers,
                           bidirectional=True, dropout=dropout, batch_first=True)
        self.fc = nn.Linear(hidden_dim * 2, hidden_dim)

    def forward(self, src: torch.Tensor) -> tuple:
        embedded = self.embedding(src)
        outputs, (hidden, cell) = self.lstm(embedded)
        hidden = torch.tanh(self.fc(torch.cat((hidden[-2], hidden[-1]), dim=-1)))
        cell = torch.tanh(self.fc(torch.cat((cell[-2], cell[-1]), dim=-1)))
        return outputs, hidden, cell

class Decoder(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, hidden_dim: int,
                 n_layers: int = 2, dropout: float = 0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, n_layers,
                           dropout=dropout, batch_first=True)
        self.fc_out = nn.Linear(hidden_dim, vocab_size)
        self.dropout = nn.Dropout(dropout)

    def forward(self, input: torch.Tensor, hidden: torch.Tensor,
                cell: torch.Tensor) -> tuple:
        input = input.unsqueeze(1)
        embedded = self.dropout(self.embedding(input))
        output, (hidden, cell) = self.lstm(embedded, (hidden, cell))
        prediction = self.fc_out(output.squeeze(1))
        return prediction, hidden, cell

class Seq2SeqDialogue(nn.Module):
    def __init__(self, encoder: Encoder, decoder: Decoder, device: str):
        super().__init__()
        self.encoder = encoder
        self.decoder = decoder
        self.device = device

    def forward(self, src: torch.Tensor, trg: torch.Tensor,
                teacher_forcing_ratio: float = 0.5) -> torch.Tensor:
        batch_size = src.shape[0]
        trg_len = trg.shape[1]
        trg_vocab_size = self.decoder.fc_out.out_features
        outputs = torch.zeros(batch_size, trg_len, trg_vocab_size).to(self.device)
        enc_outputs, hidden, cell = self.encoder(src)

        decoder_input = trg[:, 0]
        for t in range(1, trg_len):
            output, hidden, cell = self.decoder(decoder_input, hidden, cell)
            outputs[:, t] = output
            teacher_force = torch.rand(1).item() < teacher_forcing_ratio
            top1 = output.argmax(1)
            decoder_input = trg[:, t] if teacher_force else top1

        return outputs`
        },
        {
          lang: "python",
          code: `# 多样化解码策略
import torch
import torch.nn.functional as F

class DialogueGenerator:
    def __init__(self, model, tokenizer, device: str = "cpu"):
        self.model = model
        self.tokenizer = tokenizer
        self.device = device

    def greedy_decode(self, input_ids: torch.Tensor,
                      max_length: int = 50) -> str:
        """贪心解码：每步选择概率最高的 token，容易产生通用回复"""
        self.model.eval()
        generated = input_ids.clone()
        with torch.no_grad():
            for _ in range(max_length):
                outputs = self.model(generated)
                next_token = outputs[:, -1].argmax(dim=-1, keepdim=True)
                generated = torch.cat([generated, next_token], dim=-1)
                if next_token.item() == self.tokenizer.eos_token_id:
                    break
        return self.tokenizer.decode(generated[0], skip_special_tokens=True)

    def nucleus_sampling(self, input_ids: torch.Tensor,
                         max_length: int = 50, top_p: float = 0.9,
                         temperature: float = 0.8) -> str:
        """Nucleus Sampling：从累积概率达到 top_p 的最小 token 集合中采样"""
        self.model.eval()
        generated = input_ids.clone()
        with torch.no_grad():
            for _ in range(max_length):
                outputs = self.model(generated)
                logits = outputs[:, -1] / temperature
                probs = F.softmax(logits, dim=-1)
                sorted_probs, sorted_indices = torch.sort(probs, descending=True)
                cumulative_probs = torch.cumsum(sorted_probs, dim=-1)
                nucleus_mask = cumulative_probs <= top_p
                nucleus_mask[..., 1:] = nucleus_mask[..., :-1].clone()
                nucleus_mask[..., 0] = True
                filtered_probs = sorted_probs * nucleus_mask
                filtered_probs /= filtered_probs.sum()
                next_token = torch.multinomial(filtered_probs, 1)
                next_token = torch.gather(sorted_indices, -1, next_token)
                generated = torch.cat([generated, next_token], dim=-1)
                if next_token.item() == self.tokenizer.eos_token_id:
                    break
        return self.tokenizer.decode(generated[0], skip_special_tokens=True)`
        }
      ],
      table: {
        headers: ["解码策略", "多样性", "连贯性", "适用场景"],
        rows: [
          ["Greedy 贪心", "低", "高", "需要确定性回复"],
          ["Beam Search", "中低", "高", "翻译、摘要"],
          ["Top-k 采样", "中高", "中等", "对话生成"],
          ["Nucleus (top-p)", "高", "中高", "创意对话"],
          ["Temperature 调节", "可控", "可控", "风格调整"]
        ]
      },
      mermaid: `graph TD
    A["用户输入"] --> B["编码器 Encoder"]
    B --> C["上下文向量"]
    C --> D["解码器 Decoder"]
    D --> E{"解码策略"}
    E -->|"确定性"| F["Greedy / Beam"]
    E -->|"多样性"| G["Top-k / Top-p"]
    F --> H["生成回复"]
    G --> H
    H --> I["安全过滤"]
    I --> J["输出给用户"]`,
      tip: "生成式对话的解码策略选择直接影响用户体验，客服场景建议用 Beam Search 保证准确性和一致性，闲聊场景用 Nucleus Sampling 增加多样性",
      warning: "生成式模型容易产生幻觉——编造不存在的政策或事实，客服场景必须对生成结果做事实校验或后处理过滤"
    },
    {
      title: "5. RAG 增强客服",
      body: `检索增强生成（Retrieval-Augmented Generation, RAG）是将检索式系统和生成式模型结合的前沿方案，有效解决了纯生成模型的幻觉问题和知识滞后问题。RAG 的核心思想是在生成回复之前，先从知识库中检索相关文档作为上下文，然后让语言模型基于检索到的内容生成回复。这样既保证了回复的准确性和时效性，又保留了生成模型的自然表达能力。RAG 系统的架构包含三个关键环节：文档切分与向量化、语义检索和条件生成。文档切分需要平衡上下文完整性和检索精度，通常按语义段落或固定长度切分。检索环节使用向量相似度匹配，也可以用混合检索（向量 + 关键词）提升召回率。生成环节将检索到的文档与用户问题拼接为 prompt，让模型在限定范围内回答。RAG 在客服场景中的优势尤为明显：产品文档更新后只需更新向量库，无需重新训练模型，大幅降低了维护成本。同时，RAG 可以提供引用来源，增强回复的可信度。`,
      code: [
        {
          lang: "python",
          code: `# RAG 文档处理与检索
import hashlib
from typing import List, Tuple
from dataclasses import dataclass

@dataclass
class Document:
    content: str
    metadata: dict
    embedding: List[float] = None

class RAGDocumentProcessor:
    def __init__(self, embed_fn, chunk_size: int = 500,
                 chunk_overlap: int = 50):
        self.embed_fn = embed_fn
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_document(self, text: str) -> List[str]:
        """按固定长度重叠切分文档"""
        words = text.split()
        chunks = []
        start = 0
        while start < len(words):
            end = start + self.chunk_size
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            start = end - self.chunk_overlap
        return chunks

    def process(self, documents: List[Tuple[str, dict]]) -> List[Document]:
        """处理文档：切分 + 向量化"""
        processed = []
        for text, meta in documents:
            chunks = self.chunk_document(text)
            for i, chunk in enumerate(chunks):
                doc_id = hashlib.md5(f"{meta.get('source', '')}-{i}".encode()).hexdigest()
                embedding = self.embed_fn(chunk)
                processed.append(Document(
                    content=chunk,
                    metadata={**meta, "chunk_id": doc_id, "chunk_index": i},
                    embedding=embedding
                ))
        return processed

class RAGRetriever:
    def __init__(self, index, documents: List[Document], top_k: int = 3):
        self.index = index
        self.documents = documents
        self.top_k = top_k

    def search(self, query_embedding: List[float]) -> List[Document]:
        import numpy as np
        query_vec = np.array([query_embedding], dtype=np.float32)
        distances, indices = self.index.search(query_vec, self.top_k)
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1:
                doc = self.documents[idx]
                results.append(doc)
        return results`
        },
        {
          lang: "python",
          code: `# RAG 生成管道
from typing import List, Optional

class RAGPipeline:
    def __init__(self, retriever: RAGRetriever, llm,
                 embed_fn, prompt_template: str = None):
        self.retriever = retriever
        self.llm = llm
        self.embed_fn = embed_fn
        self.prompt_template = prompt_template or self._default_prompt()

    def _default_prompt(self) -> str:
        return (
            "你是一个专业的客服助手。请根据以下参考资料回答用户问题。\\n"
            "如果参考资料中没有相关信息，请如实告知用户，不要编造答案。\\n\\n"
            "参考资料：\\n{context}\\n\\n"
            "用户问题：{question}\\n\\n"
            "回答："
        )

    def query(self, question: str,
              filter_fn=None) -> dict:
        """完整的 RAG 查询流程"""
        # 1. 向量化查询
        query_embedding = self.embed_fn(question)

        # 2. 检索相关文档
        docs = self.retriever.search(query_embedding)

        # 3. 可选的后过滤
        if filter_fn:
            docs = [d for d in docs if filter_fn(d)]

        # 4. 构建上下文
        context = "\\n---\\n".join(
            [f"[{d.metadata.get('source', 'Unknown')}] {d.content}" for d in docs]
        )

        # 5. 生成回复
        prompt = self.prompt_template.format(context=context, question=question)
        response = self.llm.generate(prompt)

        return {
            "answer": response,
            "sources": [d.metadata for d in docs],
            "context": context
        }

    def batch_query(self, questions: List[str]) -> List[dict]:
        """批量查询"""
        return [self.query(q) for q in questions]`
        }
      ],
      table: {
        headers: ["RAG 组件", "功能", "常用工具", "关键参数"],
        rows: [
          ["文档加载器", "读取多种格式文档", "LangChain loaders", "支持格式"],
          ["文本切分器", "语义段落切分", "RecursiveCharacterTextSplitter", "chunk_size, overlap"],
          ["向量化器", "文本转稠密向量", "text-embedding-ada, BGE", "模型选择, 维度"],
          ["向量数据库", "存储和检索向量", "Faiss, Milvus, Pinecone", "索引类型, 距离度量"],
          ["生成模型", "基于上下文生成回复", "GPT, Claude, 开源模型", "temperature, max_tokens"]
        ]
      },
      mermaid: `graph LR
    A["产品文档/FAQ"] --> B["文档切分"]
    B --> C["向量化 Embedding"]
    C --> D["向量数据库"]
    E["用户问题"] --> F["问题向量化"]
    F --> G["向量检索"]
    D --> G
    G --> H["相关文档片段"]
    H --> I["构建 Prompt"]
    E --> I
    I --> J["LLM 生成回复"]
    J --> K["返回答案+引用"]`,
      tip: "RAG 系统中 chunk_size 的选择至关重要，建议根据文档类型设置：FAQ 用较小 chunk（200-300 字），产品文档用较大 chunk（500-800 字），并设置 10%-20% 的重叠率",
      warning: "检索质量直接决定 RAG 的回复质量，如果检索到的文档不相关，LLM 仍可能基于错误上下文生成看似合理但实际错误的答案，务必监控检索相关性"
    },
    {
      title: "6. LLM 驱动的现代客服",
      body: `大语言模型彻底改变了对话系统的构建方式。传统的对话系统需要分别开发 NLU、DM、NLG 模块，而 LLM 凭借其强大的理解和生成能力，可以用端到端的方式处理整个对话流程。Function Calling 是 LLM 在客服场景中的关键技术，它让模型能够识别何时需要调用外部 API（如查询订单、退款、修改地址），并自动生成结构化的 API 调用参数。这取代了传统的意图识别加槽位填充的复杂流水线。Agent 架构进一步扩展了 LLM 的能力，让模型可以规划多步骤操作、调用工具、处理异常情况。现代 LLM 客服系统通常采用路由架构：简单问题由 LLM 直接回答，涉及业务操作的问题通过 Function Calling 触发 API，复杂或敏感问题转接人工客服。成本优化是工业落地的关键考量，通过缓存高频问答、使用小模型处理简单任务、大模型处理复杂任务的分层策略，可以大幅降低 API 调用成本。安全和合规也不容忽视，需要设置内容过滤、敏感信息脱敏和对话审计等机制。`,
      code: [
        {
          lang: "python",
          code: `# LLM Function Calling 客服系统
import json
from typing import List, Dict, Any

# 定义工具（Function Schema）
CUSTOMER_SERVICE_TOOLS = [
    {
        "name": "query_order",
        "description": "查询订单状态和物流信息",
        "parameters": {
            "type": "object",
            "properties": {
                "order_id": {"type": "string", "description": "订单号"},
                "phone": {"type": "string", "description": "收货手机号"}
            },
            "required": ["order_id"]
        }
    },
    {
        "name": "process_refund",
        "description": "处理退款申请",
        "parameters": {
            "type": "object",
            "properties": {
                "order_id": {"type": "string", "description": "订单号"},
                "reason": {"type": "string", "description": "退款原因"},
                "amount": {"type": "number", "description": "退款金额"}
            },
            "required": ["order_id", "reason"]
        }
    },
    {
        "name": "check_warranty",
        "description": "查询商品保修状态",
        "parameters": {
            "type": "object",
            "properties": {
                "product_id": {"type": "string", "description": "商品编号"},
                "purchase_date": {"type": "string", "description": "购买日期"}
            },
            "required": ["product_id"]
        }
    }
]

# 工具执行函数
def execute_tool(tool_name: str, args: Dict[str, Any]) -> str:
    tools_map = {
        "query_order": lambda a: {"status": "已发货", "tracking": "SF1234567890", "eta": "2026-04-15"},
        "process_refund": lambda a: {"refund_id": "RF001", "status": "处理中", "eta": "3-5工作日"},
        "check_warranty": lambda a: {"warranty_status": "在保", "expires": "2027-04-12"}
    }
    if tool_name not in tools_map:
        return json.dumps({"error": "未知工具"})
    return json.dumps(tools_map[tool_name](args), ensure_ascii=False)

class LLMCustomerService:
    def __init__(self, llm_client):
        self.llm = llm_client
        self.tools = CUSTOMER_SERVICE_TOOLS
        self.system_prompt = "你是专业电商客服，使用工具查询信息后回答用户。"

    def handle(self, user_message: str, history: List[dict] = None) -> str:
        messages = [{"role": "system", "content": self.system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_message})

        response = self.llm.chat(messages, tools=self.tools)

        if response.get("tool_calls"):
            for tool_call in response["tool_calls"]:
                tool_name = tool_call["function"]["name"]
                args = json.loads(tool_call["function"]["arguments"])
                result = execute_tool(tool_name, args)
                messages.append(response)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "content": result
                })
            final_response = self.llm.chat(messages, tools=self.tools)
            return final_response.get("content", "抱歉，暂时无法处理")
        return response.get("content", "")`
        },
        {
          lang: "python",
          code: `# LLM 路由与分层成本优化
import hashlib
import time
from typing import Dict, Optional

class CacheEntry:
    def __init__(self, response: str, ttl: int = 3600):
        self.response = response
        self.expires_at = time.time() + ttl

    def is_valid(self) -> bool:
        return time.time() < self.expires_at

class LLMRouter:
    """根据问题复杂度路由到不同模型，优化成本"""
    def __init__(self, fast_model, smart_model, cache_ttl: int = 3600):
        self.fast_model = fast_model    # 便宜小模型（如 GPT-4o-mini）
        self.smart_model = smart_model  # 强大模型（如 GPT-4o）
        self.cache: Dict[str, CacheEntry] = {}
        self.cache_ttl = cache_ttl

    def _cache_key(self, message: str) -> str:
        return hashlib.md5(message.encode()).hexdigest()

    def route(self, message: str, history: list = None) -> str:
        # 1. 检查缓存
        key = self._cache_key(message)
        if key in self.cache and self.cache[key].is_valid():
            return self.cache[key].response

        # 2. 用轻量模型判断复杂度
        classification = self._classify_complexity(message)

        # 3. 根据复杂度选择模型
        if classification == "simple":
            response = self.fast_model.generate(message)
        else:
            response = self.smart_model.generate(message)

        # 4. 缓存结果
        self.cache[key] = CacheEntry(response, self.cache_ttl)
        return response

    def _classify_complexity(self, message: str) -> str:
        """简单分类：关键词判断 + 轻量模型辅助"""
        simple_patterns = ["你好", "谢谢", "再见", "在吗", "营业时间", "地址在哪"]
        for pattern in simple_patterns:
            if pattern in message:
                return "simple"
        if len(message) < 30:
            return "simple"
        return "complex"

    def get_stats(self) -> dict:
        total = len(self.cache)
        valid = sum(1 for e in self.cache.values() if e.is_valid())
        return {"cache_total": total, "cache_valid": valid, "hit_rate": valid / max(total, 1)}`
        }
      ],
      table: {
        headers: ["架构模式", "优势", "劣势", "适用场景"],
        rows: [
          ["纯 LLM 端到端", "开发简单，自然度高", "成本高，难控制", "闲聊、简单问答"],
          ["LLM + Function Calling", "可调用业务 API", "需要定义工具", "任务型对话"],
          ["LLM + RAG", "知识可更新，有依据", "依赖检索质量", "知识问答客服"],
          ["LLM Agent", "自主规划多步骤任务", "复杂度高", "复杂业务场景"],
          ["分层路由（大小模型）", "成本优化", "需要分类逻辑", "大规模部署"]
        ]
      },
      mermaid: `graph TD
    A["用户消息"] --> B{"缓存命中?"}
    B -->|"是"| C["返回缓存回复"]
    B -->|"否"| D["复杂度分类"]
    D -->|"简单"| E["小模型处理"]
    D -->|"中等"| F["中等模型"]
    D -->|"复杂"| G["大模型 + 工具调用"]
    E --> H["写入缓存"]
    F --> H
    G --> H
    H --> I["回复用户"]
    G --> J{"需要工具?"}
    J -->|"是"| K["执行业务 API"]
    K --> G
    J -->|"否"| G`,
      tip: "LLM 客服上线前务必建立评估集，覆盖常见问题、边界情况和恶意输入，自动化测试通过率达标后才能上线",
      warning: "LLM 可能泄露系统提示词或被越狱攻击，必须设置输入过滤、输出校验和敏感词拦截等多层安全防护"
    },
    {
      title: "7. 实战：LangChain 构建完整客服系统",
      body: `本节使用 LangChain 框架构建一个端到端的智能客服系统，整合 RAG、Function Calling 和多轮对话管理能力。系统以 LangChain 的 ChatPromptTemplate 定义对话模板，使用 RunnableWithMessageHistory 维护多轮对话状态，通过 RAG 检索产品知识库增强回复准确性，并利用 Tool 机制实现订单查询等业务操作。完整架构包含四个层次：数据层负责知识库的向量化存储，检索层使用 LangChain 的 Retriever 接口查询相关文档，Agent 层通过 LangChain Agent 编排工具调用和多步推理，交互层处理用户输入和格式化输出。这种分层设计使得每个模块可以独立测试和优化。系统还包含了对话历史管理、异常处理、性能监控等生产级功能。通过 LangChain 的声明式编程范式，我们可以用极少的代码构建出功能完整的客服系统，同时保持良好的可扩展性。`,
      code: [
        {
          lang: "python",
          code: `# LangChain 客服系统 - 核心架构
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain_core.runnables import RunnablePassthrough
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.memory import ConversationBufferMemory
from langchain.schema import Document
from typing import List
import json

# 定义业务工具
@tool
def query_order(order_id: str) -> str:
    """查询订单状态，输入为订单号。"""
    orders = {
        "ORD001": {"status": "已发货", "tracking": "SF12345", "items": ["无线耳机"]},
        "ORD002": {"status": "配送中", "tracking": "YT67890", "items": ["智能手表"]},
    }
    order = orders.get(order_id, {"status": "未找到", "tracking": "", "items": []})
    return json.dumps(order, ensure_ascii=False)

@tool
def check_return_policy(product_type: str) -> str:
    """查询退货政策，输入为商品类型。"""
    policies = {
        "电子产品": "7天无理由退货，需保持包装完整",
        "服装": "30天无理由退货，吊牌未拆",
        "食品": "不支持无理由退货，质量问题可协商",
        "default": "请咨询具体品类的退货政策"
    }
    return policies.get(product_type, policies["default"])

# 构建 RAG 检索器
class FAQRetriever:
    def __init__(self, faq_data: List[dict], embed_fn):
        self.embed_fn = embed_fn
        self.docs = []
        for faq in faq_data:
            doc = Document(
                page_content=f"问题: {faq['question']}\\n答案: {faq['answer']}",
                metadata={"source": "FAQ", "category": faq.get("category", "general")}
            )
            self.docs.append(doc)

    def invoke(self, query: str) -> List[Document]:
        query_emb = self.embed_fn(query)
        scored = []
        for doc in self.docs:
            doc_emb = self.embed_fn(doc.page_content)
            score = sum(a * b for a, b in zip(query_emb, doc_emb))
            scored.append((score, doc))
        scored.sort(key=lambda x: -x[0])
        return [doc for _, doc in scored[:3]]

# 构建 Agent
def build_agent(llm, faq_retriever, embed_fn):
    tools = [query_order, check_return_policy]

    system_template = """你是专业电商客服助手。你可以：
1. 使用 query_order 工具查询订单
2. 使用 check_return_policy 工具查询退货政策
3. 基于参考资料回答产品相关问题

如果以上都无法回答，请礼貌地告知用户并建议转人工客服。

参考资料：
{context}"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_template),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    def format_docs(docs: List[Document]) -> str:
        return "\\n\\n".join(doc.page_content for doc in docs)

    rag_chain = (
        {"context": faq_retriever | format_docs, "input": RunnablePassthrough()}
    )

    agent = create_tool_calling_agent(llm, tools, prompt)
    return AgentExecutor(
        agent=agent, tools=tools, verbose=True,
        handle_parsing_errors=True,
        max_iterations=5
    )`
        },
        {
          lang: "python",
          code: `# LangChain 客服系统 - 多轮对话与部署
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("customer_service")

class CustomerServiceSystem:
    def __init__(self, agent_executor, max_history: int = 10):
        self.agent = agent_executor
        self.sessions = {}
        self.max_history = max_history

    def get_session_history(self, session_id: str):
        if session_id not in self.sessions:
            self.sessions[session_id] = InMemoryChatMessageHistory()
        return self.sessions[session_id]

    def chat(self, session_id: str, user_input: str) -> str:
        start_time = time.time()

        try:
            history = self.get_session_history(session_id)

            # 限制历史长度
            messages = history.messages
            if len(messages) > self.max_history * 2:
                history.clear()
                for msg in messages[-self.max_history:]:
                    history.add_message(msg)

            response = self.agent.invoke({
                "input": user_input,
                "chat_history": messages
            })

            elapsed = time.time() - start_time
            logger.info(
                f"Session {session_id}: {elapsed:.2f}s - "
                f"Input: {user_input[:50]}..."
            )

            return response.get("output", "抱歉，我暂时无法回答您的问题。")

        except Exception as e:
            logger.error(f"Session {session_id} error: {str(e)}")
            return "系统暂时遇到问题，请稍后再试或转人工客服。"

    def get_session_stats(self, session_id: str) -> dict:
        history = self.get_session_history(session_id)
        return {
            "session_id": session_id,
            "turn_count": len(history.messages) // 2,
            "is_active": len(history.messages) > 0
        }

# 使用示例
def main():
    # 初始化系统（假设已配置好 LLM 和检索器）
    faq_data = [
        {"question": "如何退货？", "answer": "可在订单页面申请退货", "category": "售后"},
        {"question": "运费怎么算？", "answer": "满99元包邮，不足收取6元", "category": "物流"},
        {"question": "支持哪些支付方式？", "answer": "支持支付宝、微信、银行卡", "category": "支付"},
    ]
    retriever = FAQRetriever(faq_data, embed_fn=lambda x: [0.0] * 768)
    agent = build_agent(llm=None, faq_retriever=retriever, embed_fn=lambda x: [0.0] * 768)
    system = CustomerServiceSystem(agent)

    # 模拟多轮对话
    session = "user_001"
    while True:
        user_input = input("用户: ")
        if user_input.lower() in ["退出", "quit", "bye"]:
            break
        response = system.chat(session, user_input)
        print(f"客服: {response}")
        stats = system.get_session_stats(session)
        print(f"  [对话轮数: {stats['turn_count']}]")`
        }
      ],
      table: {
        headers: ["系统组件", "技术选型", "职责", "关键配置"],
        rows: [
          ["LLM 引擎", "GPT-4o / Claude", "意图理解与回复生成", "temperature, max_tokens"],
          ["RAG 检索", "LangChain Retriever", "知识库语义检索", "top_k, score_threshold"],
          ["工具集", "LangChain @tool 装饰器", "业务 API 调用", "工具描述, 参数校验"],
          ["对话记忆", "InMemoryChatMessageHistory", "多轮上下文维护", "max_history, 滑动窗口"],
          ["监控日志", "Python logging", "性能追踪与错误记录", "日志级别, 采样率"]
        ]
      },
      mermaid: `graph TB
    A["用户请求"] --> B["CustomerServiceSystem"]
    B --> C["加载会话历史"]
    C --> D["LangChain Agent"]
    D --> E{"是否需要工具?"}
    E -->|"是"| F["调用工具: 查询订单/退货政策"]
    E -->|"否"| G["RAG 检索知识库"]
    F --> D
    G --> H["检索结果注入 Prompt"]
    H --> D
    D --> I["生成回复"]
    I --> J["保存对话历史"]
    J --> K["返回用户"]
    D --> L{"解析错误?"}
    L -->|"是"| M["异常处理 + 重试"]
    M --> D`,
      tip: "LangChain Agent 的 max_iterations 建议设置为 3-5，避免工具调用陷入死循环；同时设置 handle_parsing_errors=True 提高鲁棒性",
      warning: "生产环境务必替换 InMemoryChatMessageHistory 为 Redis 或数据库存储，内存存储在服务重启后会丢失所有对话历史，且无法水平扩展"
    },
  ],
};
