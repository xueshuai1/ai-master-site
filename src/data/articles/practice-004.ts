import { Article } from '../knowledge';

export const article: Article = {
  id: "practice-004",
  title: "内容生成与自动化",
  category: "practice",
  tags: ["内容生成", "自动化", "AIGC"],
  summary: "从自动摘要到营销文案，掌握 AI 内容生成的核心应用",
  date: "2026-04-12",
  readTime: "16 min",
  level: "进阶",
  content: [
    {
      title: "1. AI 内容生成概述",
      body: `AI 内容生成（AIGC）已经从实验性技术发展为生产力工具的核心组成部分。从 GPT 系列的语言生成到 Diffusion 模型的图像创作，再到多模态大模型的图文理解，AIGC 正在重塑内容产业的各个环节。核心原理在于大语言模型通过海量文本预训练，学习到了语言的结构规律和世界知识，再通过指令微调和对齐训练，使其能够按照人类意图生成高质量内容。当前 AIGC 的典型应用包括文本生成、图像创作、代码编写、音视频合成等。内容生成流水线通常包含需求解析、提示工程、模型推理、后处理和人工审核五个环节。理解 AIGC 的能力边界和局限性，是高效利用这项技术的前提。模型存在幻觉、知识截止日期和上下文窗口限制等固有约束，工程实践中需要通过合理的架构设计来规避这些风险。`,
      code: [
        {
          lang: "python",
          code: `# AIGC 基础调用框架
import os
from openai import OpenAI
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class GenerationRequest:
    prompt: str
    model: str = "gpt-4"
    max_tokens: int = 2048
    temperature: float = 0.7
    system_prompt: Optional[str] = None

@dataclass
class GenerationResult:
    content: str
    model: str
    usage: dict
    finish_reason: str

class AIGCPipeline:
    def __init__(self, api_key: str = None):
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
        self.history: List[dict] = []

    def generate(self, request: GenerationRequest) -> GenerationResult:
        messages = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        messages.append({"role": "user", "content": request.prompt})

        response = self.client.chat.completions.create(
            model=request.model,
            messages=messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )

        choice = response.choices[0]
        return GenerationResult(
            content=choice.message.content,
            model=response.model,
            usage=response.usage.model_dump(),
            finish_reason=choice.finish_reason
        )`
        },
        {
          lang: "python",
          code: `# 提示词模板引擎
from string import Template
from typing import Dict, Any
import json

class PromptTemplate:
    def __init__(self, template: str):
        self.template = Template(template)

    def render(self, kwargs: Any) -> str:
        return self.template.safe_substitute(kwargs)

    def render_json(self, kwargs: Any) -> str:
        data = self.render(kwargs)
        return json.dumps({"prompt": data}, ensure_ascii=False)

# 预定义模板库
TEMPLATES = {
    "article_outline": PromptTemplate(
        "请为主题 \"$topic\" 生成文章大纲，要求包含 $n_sections 个章节，"
        "目标读者为 $audience，风格为 $style。输出 JSON 格式。"
    ),
    "content_rewrite": PromptTemplate(
        "将以下内容改写为 $tone 风格，保持核心信息不变：\n\n$content"
    ),
    "multi_language": PromptTemplate(
        "将以下文本翻译为 $language，要求：$requirements\n\n$text"
    ),
}`
        }
      ],
      table: {
        headers: ["生成类型", "代表模型", "适用场景", "关键参数"],
        rows: [
          ["文本生成", "GPT-4, Claude", "文章、摘要、对话", "temperature, max_tokens"],
          ["图像生成", "DALL-E 3, Midjourney", "营销图、插画", "size, style, quality"],
          ["代码生成", "Codex, StarCoder", "函数、脚本、调试", "language, context"],
          ["音频生成", "Whisper, ElevenLabs", "配音、转录、TTS", "voice, speed, pitch"]
        ]
      },
      mermaid: `graph LR
    A["内容需求"] --> B["提示词构建"]
    B --> C["模型推理"]
    C --> D["后处理"]
    D --> E["质量审核"]
    E --> F{"是否达标"}
    F -->|"否"| B
    F -->|"是"| G["发布"]`,
      tip: "构建 AIGC 应用时，先用 temperature=0 测试确定性输出，再逐步调高探索性，这样能快速验证提示词是否正确",
      warning: "大模型存在幻觉问题，生成的事实性内容必须经过人工或外部工具验证，不能直接用于严肃场景"
    },
    {
      title: "2. 自动摘要与改写",
      body: `自动摘要是 NLP 最成熟的应用之一，分为抽取式和生成式两大技术路线。抽取式摘要通过算法识别原文中的关键句子，直接拼接形成摘要，优势是保证事实准确性，缺点是连贯性较差。生成式摘要利用大语言模型重新组织语言，生成流畅的摘要文本，质量更高但可能引入事实偏差。主流方案采用先抽取后生成的混合策略——先用 TextRank 或 BERT 提取关键段落，再用 GPT 进行语言润色。内容改写则是在保持核心语义不变的前提下，调整文本的风格、长度、复杂度或目标受众。应用场景包括长文缩短、学术改写为通俗文本、正式语气转换为口语化表达等。自动化改写流水线需要处理的关键问题包括语义一致性校验、信息完整性检查和风格一致性控制。`,
      code: [
        {
          lang: "python",
          code: `# 抽取式摘要（TextRank 算法）
import networkx as nx
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List

class TextRankSummarizer:
    def __init__(self, ratio: float = 0.2):
        self.ratio = ratio

    def _split_sentences(self, text: str) -> List[str]:
        import re
        sentences = re.split(r'(?<=[.!?。！？])\s+', text.strip())
        return [s.strip() for s in sentences if len(s.strip()) > 10]

    def summarize(self, text: str) -> str:
        sentences = self._split_sentences(text)
        if len(sentences) < 3:
            return text

        vectorizer = TfidfVectorizer().fit(sentences)
        matrix = vectorizer.transform(sentences)
        similarity = (matrix * matrix.T).A

        graph = nx.Graph()
        for i in range(len(sentences)):
            graph.add_node(i)
            for j in range(i + 1, len(sentences)):
                if similarity[i, j] > 0.1:
                    graph.add_edge(i, j, weight=similarity[i, j])

        scores = nx.pagerank(graph, weight='weight')
        n = max(1, int(len(sentences) * self.ratio))
        top_indices = sorted(scores, key=scores.get, reverse=True)[:n]
        top_indices.sort()
        return ' '.join(sentences[i] for i in top_indices)`
        },
        {
          lang: "python",
          code: `# 生成式摘要与改写（LLM）
from openai import OpenAI
import json

class LLMRewriter:
    def __init__(self):
        self.client = OpenAI()

    def summarize(self, text: str, max_words: int = 200) -> str:
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "你是一个专业的文本摘要助手。"},
                {"role": "user", "content":
                    f"请将以下文本摘要为 {max_words} 字以内的精炼摘要，"
                    f"保留核心事实和关键数据：\n\n{text}"}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content

    def rewrite(self, text: str, style: str, audience: str = "general") -> str:
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"将文本改写为{style}风格，"
                                              f"目标受众为{audience}。"},
                {"role": "user", "content": f"改写以下内容：\n\n{text}"}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content

    def simplify(self, text: str, grade_level: int = 8) -> str:
        return self.rewrite(text, style="通俗易懂，适合" + str(grade_level) + "年级阅读")`
        }
      ],
      table: {
        headers: ["方法", "技术原理", "优点", "缺点"],
        rows: [
          ["TextRank", "图排序算法", "无需训练，事实准确", "连贯性差，忽略上下文"],
          ["BERT 抽取", "预训练模型评分", "语义理解强", "需要 GPU 推理"],
          ["生成式 GPT", "大模型重新组织语言", "流畅自然，可定制", "可能引入幻觉"],
          ["混合策略", "抽取 + 生成两阶段", "兼顾准确与流畅", "流水线复杂度高"]
        ]
      },
      mermaid: `graph TD
    A["原始长文"] --> B{"摘要策略"}
    B -->|"快速"| C["TextRank 抽取"]
    B -->|"高质量"| D["LLM 生成"]
    B -->|"生产环境"| E["混合：抽取 + 润色"]
    C --> F["关键句拼接"]
    D --> G["重新生成"]
    E --> H["提取关键段 -> GPT 润色"]
    F --> I["输出摘要"]
    G --> I
    H --> I`,
      tip: "学术文献摘要建议用抽取式方法确保事实准确，营销文案摘要则用生成式方法追求表达吸引力",
      warning: "生成式摘要可能遗漏原文的关键数据和限定条件，涉及法律、医疗等严肃领域时务必人工审核"
    },
    {
      title: "3. 营销文案生成",
      body: `营销文案生成是 AIGC 最具商业价值的应用方向之一。优秀的营销文案需要在有限篇幅内完成吸引注意、传递价值、建立信任和驱动行动四个步骤。AI 文案生成的核心挑战在于如何在保持品牌调性的同时实现创意多样性。实现方案通常分为三层：第一层是品牌知识库，存储品牌指南、过往优秀案例、禁用语清单等约束信息；第二层是提示词框架，将营销理论（如 AIDA 模型、PAS 框架）编码为结构化提示词；第三层是生成与筛选，批量生成多个候选方案，通过自动化评分和人工审核选出最优版本。社交媒体文案、邮件营销、产品描述和广告标题是四大高频场景，每种场景的篇幅限制、风格要求和转化目标都不同，需要针对性的提示词设计和评估标准。`,
      code: [
        {
          lang: "python",
          code: `# 营销文案生成器（AIDA 框架）
from openai import OpenAI
from dataclasses import dataclass
from typing import List
import random

@dataclass
class BrandProfile:
    name: str
    tone: str
    target_audience: str
    banned_words: List[str]
    key_messages: List[str]

class MarketingCopyGenerator:
    def __init__(self, brand: BrandProfile):
        self.client = OpenAI()
        self.brand = brand

    def generate_aida(self, product: str, features: List[str]) -> dict:
        system_prompt = (
            f"你是{self.brand.name}的文案专家。品牌调性：{self.brand.tone}。"
            f"目标受众：{self.brand.target_audience}。"
            f"禁用词：{', '.join(self.brand.banned_words)}。"
            f"核心信息：{', '.join(self.brand.key_messages)}。"
            f"使用 AIDA 模型（Attention, Interest, Desire, Action）生成文案。"
            f"输出 JSON 格式，包含 attention、interest、desire、action 四个字段。"
        )
        user_prompt = (
            f"为产品 '{product}' 生成营销文案。\n"
            f"产品特点：{', '.join(features)}"
        )
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.8,
            response_format={"type": "json_object"}
        )
        return response.choices[0].message.content

    def generate_variants(self, product: str, features: List[str],
                          n: int = 5) -> List[str]:
        variants = []
        for _ in range(n):
            seed = random.randint(1, 10000)
            aida = self.generate_aida(product, features)
            variants.append(aida)
        return variants`
        },
        {
          lang: "python",
          code: `# 文案质量自动化评分
import re
from typing import Dict, List

class CopyScorer:
    def __init__(self, banned_words: List[str] = None):
        self.banned_words = banned_words or []

    def score(self, copy: str) -> Dict[str, float]:
        return {
            "readability": self._readability(copy),
            "sentiment": self._sentiment_score(copy),
            "call_to_action": self._cta_strength(copy),
            "banned_word_penalty": self._banned_penalty(copy),
            "overall": 0.0
        }

    def _readability(self, text: str) -> float:
        sentences = re.split(r'[.!?。！？]', text)
        words = text.split()
        if not sentences or not words:
            return 0.0
        avg_sent_len = len(words) / max(len(sentences), 1)
        # 理想句长 10-20 词
        score = max(0, 1.0 - abs(avg_sent_len - 15) / 15)
        return round(score * 100, 1)

    def _cta_strength(self, text: str) -> float:
        cta_keywords = [
            "立即购买", "立即体验", "马上行动", "限时优惠",
            "免费注册", "立即订阅", "Get started", "Try now"
        ]
        found = sum(1 for kw in cta_keywords if kw.lower() in text.lower())
        return min(found * 25.0, 100.0)

    def _sentiment_score(self, text: str) -> float:
        positive = ["优秀", "卓越", "创新", "领先", "高效", "卓越", "amazing"]
        negative = ["问题", "困难", "挑战", "复杂", "昂贵"]
        pos_count = sum(1 for w in positive if w in text)
        neg_count = sum(1 for w in negative if w in text)
        total = pos_count + neg_count
        if total == 0:
            return 50.0
        return round((pos_count / total) * 100, 1)

    def _banned_penalty(self, text: str) -> float:
        found = [w for w in self.banned_words if w in text]
        return max(0, 100.0 - len(found) * 20.0)`
        }
      ],
      table: {
        headers: ["文案类型", "篇幅", "核心目标", "评估指标"],
        rows: [
          ["广告标题", "5-15 字", "吸引点击", "CTR, 打开率"],
          ["产品描述", "100-300 字", "传递价值", "转化率, 停留时间"],
          ["社交媒体", "50-200 字", "互动传播", "点赞, 评论, 转发"],
          ["邮件营销", "200-500 字", "驱动行动", "打开率, 点击率"]
        ]
      },
      mermaid: `graph LR
    A["产品信息"] --> B["品牌知识库"]
    B --> C["AIDA 提示词"]
    C --> D["批量生成 5-10 版"]
    D --> E["自动化评分"]
    E --> F["Top 3 人工审核"]
    F --> G["最终发布"]`,
      tip: "文案生成时先用 temperature=0.3 生成一版确定性好文案作为基准，再用 temperature=0.8 生成创意变体，最后综合筛选",
      warning: "营销文案必须检查品牌合规性，AI 可能无意中使用了禁用词汇或做出了不合规的承诺"
    },
    {
      title: "4. 代码生成（Copilot/Codeium）",
      body: `AI 代码生成已经深度融入现代开发工作流。GitHub Copilot 基于 **OpenAI** Codex 模型，通过分析代码上下文提供实时补全和函数级生成。Codeium 则提供免费的替代方案，支持多 IDE 集成。代码生成的核心优势在于减少样板代码编写、加速 API 调用实现、辅助单元测试编写和快速原型开发。但 AI 生成的代码存在安全风险（可能引入漏洞）、依赖风险（使用不存在的库或过时 API）和逻辑风险（表面正确但边界条件错误）。最佳实践是将 AI 代码生成定位为"高级结对编程"——AI 负责初稿，人类负责审核和优化。工程化部署中，需要结合代码静态分析（lint）、类型检查和单元测试，确保生成代码的质量和安全性。自动化流水线还可以将代码生成与 CI/CD 集成，实现从需求到可运行代码的快速迭代。`,
      code: [
        {
          lang: "python",
          code: `# AI 代码生成 + 静态验证流水线
import subprocess
import tempfile
import os
from openai import OpenAI

class CodeGenPipeline:
    def __init__(self):
        self.client = OpenAI()

    def generate_function(self, description: str, language: str = "python",
                          context: str = "") -> str:
        prompt = (
            f"用 {language} 编写一个函数，满足以下需求：\n"
            f"{description}\n\n"
            f"要求：包含类型注解、文档字符串和错误处理。\n"
            f"{context}"
        )
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "你是一个资深软件工程师，"
                    "编写生产级别的代码。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        return self._extract_code(response.choices[0].message.content)

    def _extract_code(self, text: str) -> str:
        lines = text.split('\n')
        code_lines = []
        in_code = False
        for line in lines:
            if line.strip().startswith('\`\`\`'):
                in_code = not in_code
                continue
            if in_code or not text.strip().startswith('\`\`\`'):
                code_lines.append(line)
        return '\n'.join(code_lines).strip()

    def validate(self, code: str) -> dict:
        # 运行 pylint 静态检查
        with tempfile.NamedTemporaryFile(
            mode='w', suffix='.py', delete=False
        ) as f:
            f.write(code)
            f.flush()
            result = subprocess.run(
                ['pylint', '--errors-only', f.name],
                capture_output=True, text=True
            )
            os.unlink(f.name)
            return {
                "passed": result.returncode == 0,
                "errors": result.stdout.strip()
            }`
        },
        {
          lang: "python",
          code: `# AI 辅助单元测试生成
import ast
import re
from typing import List
from openai import OpenAI

class TestGenerator:
    def __init__(self):
        self.client = OpenAI()

    def generate_tests(self, source_code: str) -> str:
        prompt = (
            "为以下 Python 代码生成完整的单元测试。\n"
            "要求：\n"
            "1. 使用 pytest 框架\n"
            "2. 覆盖正常路径和边界条件\n"
            "3. 包含 fixture 和 parametrize\n"
            "4. 测试函数命名以 test_ 开头\n\n"
            f"源代码：\n{source_code}"
        )
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "你是测试专家，编写高质量的单元测试。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        return response.choices[0].message.content

    def run_tests(self, test_code: str, source_code: str) -> dict:
        full_code = source_code + "\n\n" + test_code
        with tempfile.NamedTemporaryFile(
            mode='w', suffix='_test.py', delete=False
        ) as f:
            f.write(full_code)
            f.flush()
            result = subprocess.run(
                ['pytest', f.name, '-v', '--tb=short'],
                capture_output=True, text=True
            )
            os.unlink(f.name)
            return {
                "passed": result.returncode == 0,
                "output": result.stdout,
                "errors": result.stderr
            }`
        }
      ],
      table: {
        headers: ["工具", "基础模型", "IDE 支持", "核心功能"],
        rows: [
          ["GitHub Copilot", "OpenAI Codex", "VS Code, JetBrains", "行级补全, 对话"],
          ["Codeium", "自研模型", "40+ IDE", "免费, 企业知识库"],
          ["Amazon CodeWhisperer", "自研模型", "VS Code, JetBrains", "AWS 集成, 安全扫描"],
          ["Tabnine", "多模型支持", "全平台", "本地部署, 隐私优先"]
        ]
      },
      mermaid: `graph LR
    A["开发需求"] --> B["AI 生成代码"]
    B --> C["静态分析 Lint"]
    C --> D{"通过?"}
    D -->|"否"| E["反馈修正"]
    E --> B
    D -->|"是"| F["单元测试生成"]
    F --> G["运行测试"]
    G --> H{"全部通过?"}
    H -->|"否"| E
    H -->|"是"| I["代码审查"]
    I --> J["合并到主分支"]`,
      tip: "给 AI 提供尽可能多的上下文——现有代码结构、依赖版本、编码规范，生成的代码质量会显著提升",
      warning: "永远不要直接部署未经人工审核的 AI 生成代码，尤其涉及身份验证、加密、数据库操作等敏感模块"
    },
    {
      title: "5. 多语言内容生成",
      body: `多语言内容生成是全球化企业的刚需，涵盖翻译、本地化和跨文化适配三个层面。机器翻译已经经历了从规则翻译、统计翻译到神经翻译的三代演进。基于 **Transformer** 的神经翻译模型（NMT）在 BLEU 分数上已经接近人类翻译水平，但在文化适配、习语翻译和领域专业术语方面仍有不足。生产级多语言流水线需要处理的关键环节包括：语言检测、翻译生成、术语一致性校验、格式保持和文化适配调整。现代大语言模型支持超过 100 种语言的翻译，相比传统翻译 API 的优势在于能够理解上下文、保持语气一致性和处理复杂排版。但对于法律合同、医疗文献等专业领域，仍然需要结合领域词典和术语库进行后处理。本地化不仅仅是翻译，还包括日期格式、货币单位、颜色偏好和阅读方向等文化适配。`,
      code: [
        {
          lang: "python",
          code: `# 多语言翻译流水线
from openai import OpenAI
from typing import Dict, List
from dataclasses import dataclass
import langdetect

@dataclass
class TranslationResult:
    source_lang: str
    target_lang: str
    original: str
    translated: str
    confidence: float

class TranslationPipeline:
    def __init__(self, glossary: Dict[str, Dict[str, str]] = None):
        self.client = OpenAI()
        self.glossary = glossary or {}

    def detect_language(self, text: str) -> str:
        return langdetect.detect(text)

    def translate(self, text: str, target_lang: str,
                  domain: str = "general") -> TranslationResult:
        source_lang = self.detect_language(text)

        # 构建术语约束
        domain_terms = self.glossary.get(domain, {})
        term_constraints = ""
        if source_lang in domain_terms:
            terms = domain_terms[source_lang].get(target_lang, {})
            if terms:
                term_constraints = "术语映射：" + ", ".join(
                    f"{k} -> {v}" for k, v in terms.items()
                )

        prompt = (
            f"将以下{source_lang}文本翻译为{target_lang}。\n"
            f"领域：{domain}\n"
            f"{term_constraints}\n"
            f"保持原文的格式和语气。\n\n"
            f"原文：{text}"
        )
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content":
                    f"你是专业翻译家，擅长{source_lang}与{target_lang}互译。"
                    f"输出纯翻译结果，不添加额外说明。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )
        return TranslationResult(
            source_lang=source_lang,
            target_lang=target_lang,
            original=text,
            translated=response.choices[0].message.content.strip(),
            confidence=0.9
        )`
        },
        {
          lang: "python",
          code: `# 本地化格式适配
from datetime import datetime
from typing import Dict
import re

class LocalizationAdapter:
    LOCALE_FORMATS = {
        "en-US": {
            "date": "%B %d, %Y",
            "currency": "\${:,.2f}",
            "number": "{:,}",
            "reading_direction": "ltr"
        },
        "zh-CN": {
            "date": "%Y年%m月%d日",
            "currency": "¥{:,.2f}",
            "number": "{:,.0f}",
            "reading_direction": "ltr"
        },
        "ja-JP": {
            "date": "%Y年%m月%d日",
            "currency": "¥{:,.0f}",
            "number": "{:,}",
            "reading_direction": "ltr"
        },
        "ar-SA": {
            "date": "%Y/%m/%d",
            "currency": "{:,.2f} SAR",
            "number": "{:,}",
            "reading_direction": "rtl"
        }
    }

    def format_date(self, date: datetime, locale: str) -> str:
        fmt = self.LOCALE_FORMATS.get(locale,
            self.LOCALE_FORMATS["en-US"])["date"]
        return date.strftime(fmt)

    def format_currency(self, amount: float, locale: str) -> str:
        fmt = self.LOCALE_FORMATS.get(locale,
            self.LOCALE_FORMATS["en-US"])["currency"]
        return fmt.format(amount)

    def adapt_content(self, content: str, locale: str) -> str:
        # 替换日期格式
        date_pattern = r'\d{4}-\d{2}-\d{2}'
        for match in re.finditer(date_pattern, content):
            date = datetime.strptime(match.group(), "%Y-%m-%d")
            content = content.replace(
                match.group(), self.format_date(date, locale)
            )
        # 添加阅读方向
        fmt = self.LOCALE_FORMATS.get(locale, {}).get(
            "reading_direction", "ltr")
        dir_attr = f'dir="{fmt}"'
        return "<div " + dir_attr + ">" + content + "</div>"`
        }
      ],
      table: {
        headers: ["翻译方法", "准确度", "速度", "适用场景"],
        rows: [
          ["神经翻译 NMT", "BLEU 40-60", "极快", "通用文本、网页"],
          ["大语言模型", "BLEU 50-70", "中等", "上下文敏感、创意内容"],
          ["术语库 + NMT", "BLEU 60-75", "快", "专业领域、技术文档"],
          ["人工 + AI 辅助", "BLEU 80+", "慢", "法律合同、营销文案"]
        ]
      },
      mermaid: `graph LR
    A["源内容"] --> B["语言检测"]
    B --> C["术语提取"]
    C --> D["神经翻译"]
    D --> E["术语替换"]
    E --> F["格式适配"]
    F --> G["文化适配检查"]
    G --> H["本地化输出"]`,
      tip: "翻译技术文档时先构建领域术语表，注入到翻译提示词中，可以大幅提升专业术语的一致性",
      warning: "机器翻译在法律和医疗场景可能产生严重后果，关键内容必须由具备资质的专业译员审核"
    },
    {
      title: "6. 内容质量评估",
      body: `AI 生成内容的质量评估是 AIGC 工程化的核心挑战。评估维度包括准确性、流畅性、一致性、原创性和安全性五个方面。准确性检查内容的事实正确性，可以通过外部知识检索和交叉验证实现。流畅性评估文本的语言自然度，通常用语言模型困惑度（Perplexity）衡量。一致性检查内容内部是否存在逻辑矛盾或前后冲突。原创性检测内容是否过度依赖训练数据，避免侵权风险。安全性检查内容是否包含有害信息、偏见或不当内容。自动化评估流水线通常结合多种方法：基于规则的关键词检测、基于模型的语义评分、基于检索的事实验证和基于人类标注的黄金标准集。对于大规模内容生成场景，建议建立分级评估机制——低风险内容用自动化检查，高风险内容追加人工审核。`,
      code: [
        {
          lang: "python",
          code: `# 多维度内容质量评估器
from openai import OpenAI
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class QualityScore:
    accuracy: float
    fluency: float
    consistency: float
    originality: float
    safety: float
    overall: float
    issues: List[str]

class ContentQualityEvaluator:
    def __init__(self):
        self.client = OpenAI()

    def evaluate(self, content: str, reference: str = None) -> QualityScore:
        scores = {}
        issues = []

        # 流畅性：计算困惑度近似值
        scores["fluency"] = self._check_fluency(content)

        # 一致性：检测内部矛盾
        consistency, consistency_issues = self._check_consistency(content)
        scores["consistency"] = consistency
        issues.extend(consistency_issues)

        # 安全性：敏感内容检测
        safety, safety_issues = self._check_safety(content)
        scores["safety"] = safety
        issues.extend(safety_issues)

        # 准确性：与参考文本对比
        if reference:
            scores["accuracy"] = self._check_accuracy(content, reference)

        # 原创性：相似度检测
        scores["originality"] = self._check_originality(content)

        scores["overall"] = sum(scores.values()) / len(scores)
        return QualityScore(
            accuracy=scores.get("accuracy", 80.0),
            **{k: v for k, v in scores.items() if k != "accuracy"},
            issues=issues,
            overall=scores["overall"]
        )

    def _check_fluency(self, text: str) -> float:
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content":
                f"请为以下文本的流畅度打分（0-100）：\n{text}"}],
            temperature=0
        )
        return self._parse_score(response.choices[0].message.content)

    def _check_consistency(self, text: str) -> Tuple[float, List[str]]:
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content":
                f"检查以下文本中的逻辑矛盾和前后不一致之处，"
                f"输出 JSON：{{\"score\": 分数, \"issues\": [问题列表]}}\n"
                f"文本：{text}"}],
            temperature=0,
            response_format={"type": "json_object"}
        )
        return 80.0, []

    def _check_safety(self, text: str) -> Tuple[float, List[str]]:
        # 简化实现：关键词检测
        risky_words = ["暴力", "歧视", "仇恨", "违法"]
        found = [w for w in risky_words if w in text]
        return (0.0, found) if found else (100.0, [])

    def _check_accuracy(self, content: str, reference: str) -> float:
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content":
                f"对比以下两段内容，评估生成内容的准确性（0-100）：\n"
                f"参考：{reference}\n生成：{content}"}],
            temperature=0
        )
        return self._parse_score(response.choices[0].message.content)

    def _check_originality(self, text: str) -> float:
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content":
                f"评估以下文本的原创性（0-100）：\n{text}"}],
            temperature=0
        )
        return self._parse_score(response.choices[0].message.content)

    def _parse_score(self, text: str) -> float:
        import re
        match = re.search(r'(\d+(?:\.\d+)?)', text)
        return float(match.group(1)) if match else 50.0`
        },
        {
          lang: "python",
          code: `# 自动化评估流水线
from concurrent.futures import ThreadPoolExecutor
from typing import List, Callable
import time

class EvaluationPipeline:
    def __init__(self, max_workers: int = 4):
        self.max_workers = max_workers
        self.checkers: List[Callable] = []

    def add_checker(self, checker: Callable):
        self.checkers.append(checker)

    def evaluate_batch(self, contents: List[str]) -> List[dict]:
        results = []
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = []
            for content in contents:
                future = executor.submit(self._evaluate_single, content)
                futures.append(future)
            for future in futures:
                results.append(future.result())
        return results

    def _evaluate_single(self, content: str) -> dict:
        start = time.time()
        check_results = {}
        for checker in self.checkers:
            try:
                result = checker(content)
                check_results[checker.__name__] = result
            except Exception as e:
                check_results[checker.__name__] = {"error": str(e)}

        elapsed = time.time() - start
        return {
            "content_preview": content[:50] + "...",
            "checks": check_results,
            "eval_time": round(elapsed, 2)
        }

# 使用示例
pipeline = EvaluationPipeline(max_workers=4)
pipeline.add_checker(ContentQualityEvaluator()._check_fluency)
pipeline.add_checker(ContentQualityEvaluator()._check_safety)
results = pipeline.evaluate_batch(["文章1", "文章2", "文章3"])`
        }
      ],
      table: {
        headers: ["评估维度", "检测方法", "工具", "阈值建议"],
        rows: [
          ["准确性", "事实验证、交叉比对", "知识检索、GPT 评分", "> 85 分"],
          ["流畅性", "困惑度、语言模型", "Perplexity 计算", "< 30"],
          ["一致性", "逻辑矛盾检测", "NLI 模型、GPT", "> 90 分"],
          ["安全性", "敏感词、毒性检测", "Perspective API", "零容忍"]
        ]
      },
      mermaid: `graph TD
    A["生成内容"] --> B["自动化评估"]
    B --> C{"综合评分"}
    C -->|">= 85"| D["直接发布"]
    C -->|"70-85"| E["标记待审"]
    C -->|"< 70"| F["重新生成"]
    E --> G["人工审核"]
    G --> H{"人工通过?"}
    H -->|"是"| D
    H -->|"否"| F
    F --> I["调整提示词"]
    I --> A`,
      tip: "建立自己的黄金测试集——收集 100 篇人工标注的高质量内容，作为评估模型的基准参考",
      warning: "自动化评估无法完全替代人工审核，特别是涉及品牌形象、法律合规和情感敏感的内容"
    },
    {
      title: "7. 实战：完整内容生成流水线",
      body: `本节构建一个端到端的内容生成自动化流水线，整合前面介绍的所有技术模块。流水线从原始需求输入开始，经过内容规划、批量生成、质量评估、多语言翻译到最终发布的全流程自动化。核心设计理念是模块化、可扩展和可监控。每个模块都有清晰的输入输出接口，可以独立替换和升级。流水线支持多种内容类型：博客文章、产品文档、社交媒体帖子和营销邮件。关键工程实践包括：异步并发生成提升吞吐量、断点续传保证可靠性、详细日志支持审计追溯、指标看板实现运营监控。整个流水线通过配置文件驱动，无需修改代码即可调整生成策略。实战中需要注意的要点包括：设置合理的并发度避免触发 API 限流、为每个生成任务设置超时和重试机制、保留所有中间产物便于回溯分析。`,
      code: [
        {
          lang: "python",
          code: `# 完整内容生成流水线 - 核心引擎
import asyncio
import json
import logging
from dataclasses import dataclass, asdict
from typing import List, Optional, Callable
from datetime import datetime
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ContentPipeline")

@dataclass
class ContentSpec:
    topic: str
    content_type: str
    target_language: str
    word_count: int
    tone: str
    keywords: List[str]

@dataclass
class PipelineResult:
    spec: ContentSpec
    content: str
    translations: dict
    quality_score: dict
    generated_at: str
    status: str

class ContentPipeline:
    def __init__(self, config_path: str):
        with open(config_path) as f:
            self.config = json.load(f)
        self.output_dir = Path(self.config.get("output_dir", "output"))
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.concurrency = self.config.get("max_concurrency", 5)
        self.semaphore = asyncio.Semaphore(self.concurrency)

    async def process(self, specs: List[ContentSpec]) -> List[PipelineResult]:
        logger.info(f"Starting pipeline with {len(specs)} specs")
        tasks = [self._process_one(spec) for spec in specs]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        successful = [r for r in results if isinstance(r, PipelineResult)]
        logger.info(f"Completed: {len(successful)}/{len(specs)}")
        return successful

    async def _process_one(self, spec: ContentSpec) -> PipelineResult:
        async with self.semaphore:
            try:
                # Step 1: 生成大纲
                outline = await self._generate_outline(spec)
                # Step 2: 生成正文
                content = await self._generate_content(spec, outline)
                # Step 3: 质量评估
                quality = await self._evaluate(content)
                # Step 4: 多语言翻译
                translations = await self._translate(content, spec)
                # Step 5: 持久化
                result = PipelineResult(
                    spec=spec,
                    content=content,
                    translations=translations,
                    quality_score=quality,
                    generated_at=datetime.now().isoformat(),
                    status="success"
                )
                self._save_result(result)
                return result
            except Exception as e:
                logger.error(f"Failed for {spec.topic}: {e}")
                return PipelineResult(
                    spec=spec, content="", translations={},
                    quality_score={}, generated_at=datetime.now().isoformat(),
                    status=f"failed: {e}"
                )`
        },
        {
          lang: "python",
          code: `# 流水线配置与监控
import json
from typing import Dict, Any
from collections import defaultdict
import time

class PipelineMonitor:
    def __init__(self):
        self.metrics: Dict[str, Any] = defaultdict(list)
        self.start_time = time.time()

    def record(self, event: str, duration: float, status: str):
        self.metrics[event].append({
            "duration": duration,
            "status": status,
            "timestamp": time.time()
        })

    def get_summary(self) -> dict:
        total = time.time() - self.start_time
        summary = {
            "uptime_seconds": round(total, 1),
            "events": {}
        }
        for event, records in self.metrics.items():
            durations = [r["duration"] for r in records]
            successes = sum(1 for r in records if r["status"] == "success")
            summary["events"][event] = {
                "count": len(records),
                "success_rate": round(successes / len(records) * 100, 1),
                "avg_duration": round(sum(durations) / len(durations), 2),
                "p95_duration": round(
                    sorted(durations)[int(len(durations) * 0.95)], 2
                ) if durations else 0
            }
        return summary

    def export_report(self, path: str):
        with open(path, 'w') as f:
            json.dump(self.get_summary(), f, indent=2, ensure_ascii=False)

# 配置文件示例
DEFAULT_CONFIG = {
    "pipeline": {
        "max_concurrency": 5,
        "retry_attempts": 3,
        "timeout_seconds": 120,
        "output_dir": "generated_content"
    },
    "generation": {
        "model": "gpt-4",
        "temperature": 0.7,
        "max_tokens": 4096
    },
    "quality": {
        "min_score": 80.0,
        "auto_retry_below": 70.0
    },
    "translation": {
        "target_languages": ["en", "zh", "ja"],
        "domain": "tech"
    }
}`
        }
      ],
      table: {
        headers: ["流水线阶段", "输入", "输出", "关键指标"],
        rows: [
          ["内容规划", "需求列表", "内容规格清单", "规划覆盖率"],
          ["大纲生成", "内容规格", "结构化大纲", "大纲完整度"],
          ["正文生成", "大纲 + 规格", "原始内容", "生成成功率"],
          ["质量评估", "原始内容", "评分 + 问题列表", "质量达标率"],
          ["翻译输出", "审核通过内容", "多语言版本", "翻译一致性"]
        ]
      },
      mermaid: `graph TD
    A["需求输入"] --> B["内容规划"]
    B --> C["大纲生成"]
    C --> D["正文生成"]
    D --> E["质量评估"]
    E --> F{"达标?"}
    F -->|"否"| G["重新生成"]
    G --> D
    F -->|"是"| H["多语言翻译"]
    H --> I["格式排版"]
    I --> J["发布到平台"]
    J --> K["数据回流"]
    K --> L["优化提示词"]
    L --> C`,
      tip: "流水线并发度设置建议为 API 限流的 80%，预留缓冲空间，避免触发限流导致大规模失败",
      warning: "内容生成流水线必须设置熔断机制——当失败率超过阈值时自动暂停，避免持续消耗 API 配额"
    }
  ],
};
