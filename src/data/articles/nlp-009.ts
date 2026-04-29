import { Article } from '../knowledge';

export const article: Article = {
    id: "nlp-009",
    title: "句法分析：依存分析与成分分析",
    category: "nlp",
    tags: ["句法分析", "依存分析", "NLP"],
    summary: "从 CFG 到神经句法分析，理解句子的结构之美",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 什么是句法分析？NLP 的结构之眼",
            body: `句法分析（Syntactic Parsing）是自然语言处理的核心任务之一，其目标是分析句子的语法结构，揭示词与词之间的组织关系。与词性标注只关注单个词的语法角色不同，句法分析关注的是**整个句子的结构**——哪些词是核心，哪些词是修饰，它们之间如何连接。

句法分析有两种主要范式：成分分析（Constituency Parsing）将句子递归地分解为短语成分（名词短语、动词短语等），形成一棵短语结构树；依存分析（Dependency Parsing）则直接建模词与词之间的依存关系（主谓、动宾、定中等），形成一棵依存树。两者各有优势：成分分析适合需要短语边界信息的任务（如机器翻译），依存分析更适合语义角色标注和信息抽取。

理解句法分析的关键在于认识到：语言不是线性排列的词串，而是具有**层次结构**的系统。"猫追老鼠" 和 "老鼠追猫" 用同样的三个词，但句法结构完全不同，含义也截然相反。句法分析就是要捕捉这种结构差异。`,
            code: [
                {
                    lang: "python",
                    code: `# 句法分析示例：同一个句子的两种视角
sentence = "猫 追 老鼠"

# 成分分析视角（短语结构）
#       S
#     /   \\
#    NP    VP
#    |    /  \\
#    猫   V    NP
#        |     |
#        追    老鼠
constituency_tree = {
    "type": "S",
    "children": [
        {"type": "NP", "word": "猫"},
        {"type": "VP", "children": [
            {"type": "V", "word": "追"},
            {"type": "NP", "word": "老鼠"}
        ]}
    ]
}

# 依存分析视角（依存关系）
#   追 <--root--
#  /  \\
# 猫  老鼠
# ↑    ↑
# 主谓  动宾
dependency_tree = {
    "head": "追",
    "relations": [
        {"head": "追", "dep": "nsubj", "child": "猫"},
        {"head": "追", "dep": "dobj", "child": "老鼠"}
    ]
}`,
                },
                {
                    lang: "python",
                    code: `# 用 nltk 进行快速句法分析演示
import nltk
from nltk import CFG

# 定义一个简单的上下文无关文法
grammar = CFG.fromstring("""
  S -> NP VP
  NP -> Det N | Det N PP
  VP -> V NP | V NP PP
  PP -> P NP
  Det -> 'the' | 'a'
  N -> 'cat' | 'dog' | 'park' | 'ball'
  V -> 'chased' | 'saw'
  P -> 'in' | 'with'
""")

sentence = "the cat chased the dog".split()
print(f"句子: {' '.join(sentence)}")
print(f"词数: {len(sentence)}")

# 成分分析输出会显示所有可能的短语结构树
# 一个句子可能有多个合法的句法分析（歧义）`,
                },
            ],
            table: {
                headers: ["特性", "成分分析", "依存分析"],
                rows: [
                    ["结构单位", "短语（NP、VP 等）", "词与词之间的边"],
                    ["树节点", "非终结符 + 终结符", "仅词（终结符）"],
                    ["适用场景", "机器翻译、语法检查", "信息抽取、语义分析"],
                    ["树形特点", "分支较多，层次深", "更扁平，更接近语义"],
                    ["经典算法", "CKY、Earley", "转移系统、MST、Eisner"],
                ],
            },
            mermaid: `graph TD
    A["原始句子\ 词序列"] --> B["句法分析器"]
    B --> C["成分分析\ 短语结构树"]
    B --> D["依存分析\ 依存关系树"]
    C --> E["应用场景：\ 机器翻译\ 语法纠错"]
    D --> F["应用场景：\ 信息抽取\ 问答系统"]
    B -.->|共同基础| G["上下文无关文法\ CFG"]`,
            tip: "成分分析和依存分析不是竞争关系——它们从不同视角刻画句子结构。实际工程中，依存分析因其简洁性和与语义的直接对应关系，在现代 NLP 中使用更广泛。",
            warning: "句法分析不等于语义分析！句法关注的是语法结构的合法性，一个句法正确的句子可能语义荒谬（如「颜色无色的绿色想法激烈地睡觉」，Chomsky 的经典例子）。",
        },
        {
            title: "2. 上下文无关文法（CFG）：句法的形式化基石",
            body: `上下文无关文法（Context-Free Grammar, CFG）是描述自然语言句法结构的最基础形式化工具。一个 CFG 由四部分组成：终结符集合（实际的词）、非终结符集合（语法范畴如 NP、VP）、产生式规则集合（如 S → NP VP）、以及起始符号（通常是 S）。

CFG 的核心思想是「递归分解」：从起始符号 S 开始，用产生式规则逐步替换非终结符，直到所有符号都是终结符。例如 S → NP VP，然后 NP → Det N，VP → V NP，最终得到 "the cat chased the dog"。这个过程恰好对应成分树的自顶向下构建。

为什么说 CFG 是「上下文无关」的？因为产生式规则的适用只取决于当前的非终结符本身，而不取决于它周围的上下文。这意味着规则 NP → Det N 在任何位置都可以使用，无论 NP 前面是动词还是介词。这一特性既是 CFG 的优势（简洁、通用），也是其局限（自然语言中存在大量上下文依赖现象）。

CFG 的形式化定义使其具备数学上的可分析性：我们可以精确判断一个句子是否属于某个文法生成的语言，可以枚举所有可能的分析树，可以计算解析的时间复杂度。这些理论性质是构建高效句法分析算法的基础。`,
            code: [
                {
                    lang: "python",
                    code: `# CFG 的完整 Python 实现
from typing import List, Dict, Set, Tuple
from collections import defaultdict

class ContextFreeGrammar:
    """上下文无关文法的实现"""
    
    def __init__(self):
        self.productions: Dict[str, List[List[str]]] = defaultdict(list)
        self.start_symbol = "S"
    
    def add_rule(self, lhs: str, rhs: List[str]):
        """添加产生式规则：lhs → rhs"""
        self.productions[lhs].append(rhs)
    
    def get_nonterminals(self) -> Set[str]:
        """获取所有非终结符"""
        return set(self.productions.keys())
    
    def get_terminals(self) -> Set[str]:
        """获取所有终结符"""
        terminals = set()
        for rhs_list in self.productions.values():
            for rhs in rhs_list:
                for sym in rhs:
                    if sym not in self.get_nonterminals():
                        terminals.add(sym)
        return terminals
    
    def is_chomsky_normal(self) -> bool:
        """检查是否为乔姆斯基范式（CNF）"""
        nonterminals = self.get_nonterminals()
        for lhs, rhs_list in self.productions.items():
            for rhs in rhs_list:
                if len(rhs) == 1:
                    if rhs[0] not in nonterminals:
                        continue  # 允许终结符
                    return False
                elif len(rhs) == 2:
                    if not all(s in nonterminals for s in rhs):
                        return False
                else:
                    return False  # CNF 只允许 1 或 2 个符号
        return True

# 构建一个简单英语 CFG
grammar = ContextFreeGrammar()
grammar.add_rule("S", ["NP", "VP"])
grammar.add_rule("NP", ["Det", "N"])
grammar.add_rule("NP", ["Det", "N", "PP"])
grammar.add_rule("VP", ["V", "NP"])
grammar.add_rule("PP", ["P", "NP"])
print(f"CNF 检查: {grammar.is_chomsky_normal()}")`,
                },
                {
                    lang: "python",
                    code: `# 将 CFG 转换为乔姆斯基范式（CNF）
def to_cnf(grammar_rules: Dict[str, List[List[str]]]) -> Dict[str, List[List[str]]]:
    """将 CFG 转换为乔姆斯基范式
    CNF 要求每条规则要么是 A → BC（两个非终结符），要么是 A → a（一个终结符）
    """
    cnf = {}
    counter = [0]  # 用于生成新的非终结符名
    
    def new_symbol():
        counter[0] += 1
        return f"X{counter[0]}"
    
    # 第一步：处理长规则（>2个非终结符）
    for lhs, rhs_list in grammar_rules.items():
        cnf[lhs] = []
        for rhs in rhs_list:
            if len(rhs) > 2:
                # A → B C D E 变为：
                # A → B X1, X1 → C X2, X2 → D E
                current = rhs[0]
                for i in range(1, len(rhs) - 2):
                    new_sym = new_symbol()
                    cnf[lhs].append([current, new_sym])
                    lhs = new_sym
                    current = rhs[i]
                cnf[lhs].append([current, rhs[-2], rhs[-1]])
            else:
                cnf[lhs].append(rhs)
    
    return cnf

# 测试转换
rules = {"S": [["NP", "VP"]], "VP": [["V", "NP", "PP"]]}
cnf_rules = to_cnf(rules)
for lhs, rhs_list in cnf_rules.items():
    for rhs in rhs_list:
        print(f"{lhs} -> {' '.join(rhs)}")`,
                },
            ],
            table: {
                headers: ["文法类型", "规则形式", "表达能力", "解析复杂度"],
                rows: [
                    ["正则文法（3 型）", "A → aB 或 A → a", "最低（正则语言）", "O(n)"],
                    ["上下文无关文法（2 型）", "A → α（任意串）", "可描述嵌套结构", "O(n³)"],
                    ["上下文有关文法（1 型）", "αAβ → αγβ", "更高（但很少用）", "指数级"],
                    ["无限制文法（0 型）", "α → β（无限制）", "图灵完备", "不可判定"],
                ],
            },
            mermaid: `graph LR
    A["S"] -->|"→"| B["NP"]
    A -->|"→"| C["VP"]
    B -->|"→"| D["Det"]
    B -->|"→"| E["N"]
    C -->|"→"| F["V"]
    C -->|"→"| G["NP"]
    G -->|"→"| H["Det"]
    G -->|"→"| I["N"]
    class I s5
    class H s4
    class F s3
    class E s2
    class D s1
    class A s0
    classDef s0 fill:#7c2d12,stroke:#333
    classDef s1 fill:#1e3a5f,stroke:#333
    classDef s2 fill:#1e3a5f,stroke:#333
    classDef s3 fill:#1e3a5f,stroke:#333
    classDef s4 fill:#1e3a5f,stroke:#333
    classDef s5 fill:#1e3a5f,stroke:#333`,
            tip: "CKY 算法要求 CFG 必须是乔姆斯基范式（CNF）。任何 CFG 都可以等价转换为 CNF，转换过程中可能引入新的非终结符，但不改变文法生成的语言。",
            warning: "CFG 无法捕获自然语言中的某些现象，如跨距依赖（cross-serial dependencies）和某些一致关系（agreement）。这也是为什么后续发展出了树邻接文法（TAG）等更强的形式化方法。",
        },
        {
            title: "3. CKY 算法：自底向上的高效成分分析",
            body: `CKY 算法（Cocke-Kasami-Younger 算法）是句法分析领域最经典的动态规划算法之一。它的核心思想非常优雅：对于一个长度为 n 的句子，我们不需要尝试所有可能的树（指数级），而是可以通过填充一个 n×n 的上三角表格，在 O(n³) 的时间内找到所有可能的成分分析。

算法的工作方式是自底向上的：首先填充对角线（每个单词本身可能属于哪些语法范畴），然后依次填充宽度为 2、3、…、n 的对角线。对于每个跨度 (i, j)，我们枚举所有可能的分割点 k，检查是否存在规则 A → BC 使得 B 覆盖了 (i, k) 且 C 覆盖了 (k, j)。如果是，就将 A 加入 (i, j) 的单元格中。

CKY 算法的关键优势在于它天然支持歧义处理——每个单元格存储的是所有可能的非终结符集合，而不是单一分析。这意味着一个句子如果有多种合法的句法分析（如经典的 "I saw the man with the telescope"），CKY 可以高效地找到所有分析。

然而，CKY 算法也有明显的局限：它要求文法必须是 CNF 形式，且纯 CKY 不考虑概率信息。在实际应用中，我们通常使用 PCFG（概率上下文无关文法）的 CKY 变体，通过概率来选择最优分析树。`,
            code: [
                {
                    lang: "python",
                    code: `# CKY 算法的完整实现
def cky_parse(words: list, grammar: dict, start: str = "S"):
    """CKY 解析算法
    
    Args:
        words: 输入句子（词列表）
        grammar: 文法规则 {A: [(B, C), ...]} 仅 CNF 形式
        start: 起始符号
    
    Returns:
        table: n×n 的解析表
        backpointers: 回溯指针（用于重建树）
    """
    n = len(words)
    # table[i][j] = 覆盖 words[i..j] 的所有非终结符
    table = [[set() for _ in range(n)] for _ in range(n)]
    # backpointers[i][j][A] = (B, C, k) 表示 A→BC 在 k 处分割
    backpointers = [[{} for _ in range(n)] for _ in range(n)]
    
    # 反转规则索引：(B, C) → [A]
    bin_rules = {}
    for A, rules in grammar.items():
        for B, C in rules:
            bin_rules.setdefault((B, C), []).append(A)
    
    # 步骤1: 填充对角线（单个词）
    for i, word in enumerate(words):
        # 假设 lexicon 将词映射到可能的词性
        lexicon = {"the": ["Det"], "cat": ["N"], "chased": ["V"], "dog": ["N"]}
        for tag in lexicon.get(word, []):
            table[i][i].add(tag)
    
    # 步骤2: 填充上层对角线
    for span in range(1, n):  # 跨度 1, 2, ..., n-1
        for i in range(n - span):
            j = i + span
            for k in range(i, j):
                for B in table[i][k]:
                    for C in table[k + 1][j]:
                        if (B, C) in bin_rules:
                            for A in bin_rules[(B, C)]:
                                table[i][j].add(A)
                                backpointers[i][j][A] = (B, C, k)
    
    return table, backpointers

# 测试
words = ["the", "cat", "chased", "the", "dog"]
grammar = {
    "S": [("NP", "VP")],
    "NP": [("Det", "N")],
    "VP": [("V", "NP")],
}
table, bp = cky_parse(words, grammar)
print(f"完整句子的可能分析: {table[0][4]}")`,
                },
                {
                    lang: "python",
                    code: `# 概率 CKY（PCFG 版本）- 选择最优分析树
import math

def probabilistic_cky(words, pcfg_rules, lexicon, start="S"):
    """概率 CKY 算法：为每个单元格保留最优概率"""
    n = len(words)
    # score[i][j][A] = 以 A 为根覆盖 words[i..j] 的最大概率
    score = [[{} for _ in range(n)] for _ in range(n)]
    bp = [[{} for _ in range(n)] for _ in range(n)]
    
    # 填充对角线：词 → 词性的概率
    for i, word in enumerate(words):
        for tag, prob in lexicon.get(word, {}).items():
            score[i][i][tag] = prob
    
    # 动态规划
    for span in range(1, n):
        for i in range(n - span):
            j = i + span
            for k in range(i, j):
                for (B, C), rules in pcfg_rules.items():
                    if B not in score[i][k] or C not in score[k+1][j]:
                        continue
                    for A, rule_prob in rules:
                        prob = rule_prob * score[i][k][B] * score[k+1][j][C]
                        if A not in score[i][j] or prob > score[i][j][A]:
                            score[i][j][A] = prob
                            bp[i][j][A] = (B, C, k)
    
    if start in score[0][n-1]:
        print(f"最优分析概率: {score[0][n-1][start]:.6f}")
    else:
        print("无法解析该句子")
    return score, bp

# PCFG 规则：(B, C) → [(A, 概率), ...]
pcfg = {
    ("Det", "N"): [("NP", 1.0)],
    ("V", "NP"): [("VP", 0.7), ("VP", 0.3)],
    ("NP", "VP"): [("S", 1.0)],
}
lex = {"the": {"Det": 1.0}, "cat": {"N": 1.0}, "chased": {"V": 1.0}, "dog": {"N": 1.0}}
probabilistic_cky(["the", "cat", "chased", "the", "dog"], pcfg, lex)`,
                },
            ],
            table: {
                headers: ["算法", "时间复杂度", "空间复杂度", "特点"],
                rows: [
                    ["CKY", "O(n³|G|)", "O(n²|G|)", "自底向上，需 CNF 文法"],
                    ["Earley", "O(n³|G|)", "O(n²|G|)", "支持任意 CFG，自顶向下"],
                    ["概率 CKY", "O(n³|G|)", "O(n²|G|)", "返回最优分析树"],
                    ["Beam Search CKY", "O(n³b|G|)", "O(nb|G|)", "b 为 beam 宽度，节省内存"],
                ],
            },
            mermaid: `graph TD
    A["CKY 表格填充"] --> B["span=1 填充对角线"]
    B --> C["span=2 宽度为2的跨度"]
    C --> D["span=3 宽度为3的跨度"]
    D --> E["span=n-1 完整句子"]
    E --> F{"start 在 table[0][n-1]?"}
    F -->|是| G["重建树结构"]
    F -->|否| H["句子不在文法中"]
    class H s2
    class G s1
    class A s0
    classDef s0 fill:#7c2d12,stroke:#333
    classDef s1 fill:#14532d,stroke:#333
    classDef s2 fill:#881337,stroke:#333`,
            tip: "CKY 算法的三重循环（span → i → k）是经典的动态规划模式。理解这个循环顺序是掌握 CKY 的关键：外层枚举跨度大小，确保计算 (i,j) 时所有更小的子问题已经解决。",
            warning: "CKY 的 O(n³) 复杂度对长句子来说仍然很慢。实际系统中通常使用带剪枝的 CKY（只保留高概率候选）或直接使用神经句法分析器。",
        },
        {
            title: "4. 依存分析 vs 成分分析：两种结构观",
            body: `依存分析和成分分析是句法分析的两大范式，它们对句子结构有着本质不同的理解方式。成分分析将句子视为短语的递归组合，每个节点代表一个语法范畴（如 NP、VP），叶子节点是词。依存分析则直接建模词与词之间的二元关系，每个节点就是一个词，边标记了语法关系类型。

依存分析的核心优势在于其与语义的天然对应。在依存树中，「动词」通常是句子的核心（根节点），名词短语作为其论元直接连接到动词上。这种结构直接反映了「谁对谁做了什么」的语义关系。例如在 "The cat chased the dog" 中，依存树的根是 "chased"，"cat" 是其主语（nsubj），"dog" 是其宾语（dobj）——这与语义角色几乎一一对应。

成分分析则在捕捉短语边界方面更具优势。如果你需要知道 "the big red ball" 是否构成一个完整的名词短语，成分分析可以直接回答，而依存分析需要额外推理。此外，成分分析对于处理嵌套结构（如嵌套的定语从句）更加自然。

现代 NLP 实践中，依存分析因其简洁性和与下游任务的良好兼容性而更受青睐。Universal Dependencies（UD）项目为 100+ 种语言提供了统一的依存标注体系，已成为依存分析的事实标准。`,
            code: [
                {
                    lang: "python",
                    code: `# 对比同一句子的两种分析结果
sentence = "The big cat quickly chased the small dog"

# === 成分分析（短语结构树）===
#              S
#       _______|_______
#      NP              VP
#   ___|___        ____|_____
#  Det   AdjP     Adv       VP
#   |     |       |     ___|___
#  The  big     quickly V     NP
#               |      |   ___|___
#             chased Det  Adj    N
#                   |     |      |
#                  the  small   dog
constituency_repr = {
    "S": {
        "NP": {"Det": "The", "AdjP": "big", "N": "cat"},
        "VP": {
            "Adv": "quickly",
            "VP": {
                "V": "chased",
                "NP": {"Det": "the", "AdjP": "small", "N": "dog"}
            }
        }
    }
}

# === 依存分析（依存关系）===
#    chased (ROOT)
#    /  |   \\
#  cat  |   dog
#  / \\     / \\
#The big quickly the small
dependency_repr = [
    ("chased", "ROOT", "ROOT"),
    ("cat", "nsubj", "chased"),
    ("dog", "dobj", "chased"),
    ("The", "det", "cat"),
    ("big", "amod", "cat"),
    ("quickly", "advmod", "chased"),
    ("the", "det", "dog"),
    ("small", "amod", "dog"),
]
print("=== 依存关系 ===")
for child, rel, head in dependency_repr:
    print(f"  {child} --[{rel}]--> {head}")`,
                },
                {
                    lang: "python",
                    code: `# 使用 spaCy 对比两种分析
import spacy

nlp = spacy.load("en_core_web_sm")
doc = nlp("The cat chased the dog in the park")

print("=== 依存分析 ===")
for token in doc:
    print(f"  {token.text:10s} | "
          f"{token.pos_:8s} | "
          f"head={token.head.text:10s} | "
          f"dep={token.dep_}")

print("\ === 成分分析 ===")
# spaCy 的成分分析需要额外模型
# 这里展示如何提取名词短语作为成分的近似
for np in doc.noun_chunks:
    print(f"  NP: {np.text} (root={np.root.text})")

print("\ === 依存树可视化 ===")
# 构建邻接表
adj = {}
for token in doc:
    if token.head != token:
        adj.setdefault(token.head.i, []).append(token.i)
for head_idx, children in adj.items():
    print(f"  {doc[head_idx].text} → {[doc[c].text for c in children]}")`,
                },
            ],
            table: {
                headers: ["对比维度", "成分分析", "依存分析"],
                rows: [
                    ["节点", "短语范畴（NP、VP）", "具体的词"],
                    ["边", "组成关系", "依存关系（带标签）"],
                    ["根节点", "S（句子）", "句子的核心动词"],
                    ["歧义表示", "多棵树", "多棵依存树"],
                    ["标注体系", "Penn Treebank", "Universal Dependencies"],
                    ["下游任务", "翻译、语法检查", "信息抽取、问答"],
                ],
            },
            mermaid: `graph TD
    A["句子结构分析"] --> B["成分分析 Constituency"]
    A --> C["依存分析 Dependency"]
    B --> D["短语递归 NP/VP/PP"]
    B --> E["Penn Treebank"]
    C --> F["二元关系 head-dependent"]
    C --> G["Universal Dependencies"]
    D --> H["优点：短语边界清晰"]
    E --> I["缺点：标注成本高"]
    F --> J["优点：简洁、语义接近"]
    G --> K["缺点：丢失短语信息"]
    H -.->|现代趋势| L["依存分析更流行"]
    J -.->|现代趋势| L
    class L s0
    classDef s0 fill:#14532d,stroke:#333`,
            tip: "Universal Dependencies 是当前最主流的依存标注体系，覆盖了 100+ 种语言。如果你的项目涉及多语言 NLP，强烈建议以 UD 作为依存分析的标注标准。",
            warning: "成分树和依存树之间可以相互转换，但转换过程中会丢失信息。不要假设一种表示可以完全无损地转换为另一种。",
        },
        {
            title: "5. 转移-based 依存分析：Arc-Standard 与 Arc-Eager",
            body: `转移系统（Transition-Based Parsing）是依存分析中最实用的方法之一。它的核心思想是将句法分析建模为一个状态机的搜索过程：从一个初始状态（缓冲区中有所有词，栈为空，依存边集合为空）开始，通过一系列「转移动作」逐步构建依存树，直到缓冲区为空且栈中只剩根节点。

最经典的两种转移动作系统是 Arc-Standard 和 Arc-Eager。Arc-Standard 只有三个动作：SHIFT（将缓冲区的第一个词压入栈）、LEFT-ARC（将栈顶词作为栈次顶词的头，并弹出栈顶）、RIGHT-ARC（将栈次顶词作为栈顶词的头，并弹出次顶）。Arc-Standard 是确定性（deterministic）的——对于给定的状态和正确的 oracle，它总是能构建出正确的依存树。

Arc-Eager 则更加激进：它在 RIGHT-ARC 时不弹出栈顶词，允许同一个词在后续步骤中成为其他词的左依存对象。这使得 Arc-Eager 可以处理 Arc-Standard 无法直接处理的某些结构，但也引入了更多的状态空间。

转移系统的最大优势是效率：它可以在 O(n) 的时间内完成一个 n 词句子的依存分析，远优于基于图的 O(n²) 或 O(n³) 方法。现代神经依存分析器（如 spaCy 的默认分析器）都基于转移系统。`,
            code: [
                {
                    lang: "python",
                    code: `# Arc-Standard 转移系统实现
from typing import List, Tuple

class ArcStandardParser:
    """Arc-Standard 转移依存分析器"""
    
    def __init__(self):
        self.stack = ["ROOT"]  # 栈，初始包含 ROOT
        self.buffer = []       # 缓冲区
        self.arcs = []         # 依存边集合
    
    def shift(self):
        """SHIFT: buffer[0] → stack"""
        if self.buffer:
            self.stack.append(self.buffer.pop(0))
            return True
        return False
    
    def left_arc(self, label: str = "dep") -> bool:
        """LEFT-ARC: stack[-2] → stack[-1]（stack[-1] 是头）"""
        if len(self.stack) >= 2 and self.stack[-2] != "ROOT":
            self.arcs.append((self.stack[-1], label, self.stack[-2]))
            self.stack.pop(-2)  # 弹出次顶元素
            return True
        return False
    
    def right_arc(self, label: str = "dep") -> bool:
        """RIGHT-ARC: stack[-1] → stack[-2]（stack[-1] 是头）"""
        if len(self.stack) >= 2:
            self.arcs.append((self.stack[-2], label, self.stack[-1]))
            self.stack.pop()  # 弹出栈顶
            return True
        return False
    
    def parse(self, words: List[str], oracle: List[str]):
        """使用 oracle 指导的解析过程
        
        Args:
            words: 输入词序列
            oracle: 转移动作序列，如 ["S", "S", "LA", "RA"]
        """
        self.buffer = list(words)
        self.stack = ["ROOT"]
        self.arcs = []
        
        for action in oracle:
            if action == "S":
                self.shift()
            elif action == "LA":
                self.left_arc()
            elif action == "RA":
                self.right_arc()
        
        return self.arcs

# 示例："cat chased dog" 的 Arc-Standard 解析
parser = ArcStandardParser()
# Oracle: S(shift cat), S(shift chased), LA(cat←chased), S(shift dog), RA(chased→dog)
arcs = parser.parse(["cat", "chased", "dog"], ["S", "S", "LA", "S", "RA"])
for head, label, child in arcs:
    print(f"  {child} --[{label}]--> {head}")`,
                },
                {
                    lang: "python",
                    code: `# Arc-Eager 转移系统（更激进）
class ArcEagerParser:
    """Arc-Eager 转移依存分析器
    
    四个动作：
    - LEFT-ARC: 建立依存并弹出栈顶
    - RIGHT-ARC: 建立依存但保留栈顶
    - REDUCE: 弹出已处理完的栈顶
    - SHIFT: 压入新词
    """
    
    def __init__(self):
        self.stack = ["ROOT"]
        self.buffer = []
        self.arcs = []
    
    def left_arc(self, label: str = "dep") -> bool:
        """stack[-2] 作为 stack[-1] 的孩子"""
        if len(self.stack) >= 2 and self.stack[-2] != "ROOT":
            self.arcs.append((self.stack[-1], label, self.stack[-2]))
            self.stack.pop(-2)
            return True
        return False
    
    def right_arc(self, label: str = "dep") -> bool:
        """stack[-1] 作为 buffer[0] 的头（buffer[0] 不弹出）"""
        if len(self.stack) >= 2 and self.buffer:
            self.arcs.append((self.stack[-1], label, self.buffer[0]))
            return True
        return False
    
    def reduce(self) -> bool:
        """弹出已有头的栈顶词"""
        if len(self.stack) >= 2:
            has_head = any(child == self.stack[-1] for _, _, child in self.arcs)
            if has_head:
                self.stack.pop()
                return True
        return False
    
    def shift(self):
        """buffer[0] → stack"""
        if self.buffer:
            self.stack.append(self.buffer.pop(0))
            return True
        return False

# 对比 Arc-Standard 和 Arc-Eager 的差异
print("Arc-Standard 特点：")
print("  - 动作数少（3个），状态空间小")
print("  - RIGHT-ARC 后立即弹出，效率高")
print("  - 某些结构需要特殊处理")
print("")
print("Arc-Eager 特点：")
print("  - 动作数多（4个），更灵活")
print("  - RIGHT-ARC 保留栈顶，支持后续 LEFT-ARC")
print("  - 更适合神经网络学习（动作选择更局部）")`,
                },
            ],
            table: {
                headers: ["特性", "Arc-Standard", "Arc-Eager"],
                rows: [
                    ["动作集合", "SHIFT, LEFT-ARC, RIGHT-ARC", "SHIFT, LEFT-ARC, RIGHT-ARC, REDUCE"],
                    ["RIGHT-ARC 行为", "弹出栈顶", "保留栈顶"],
                    ["确定性", "是（对 projective 树）", "是（对 projective 树）"],
                    ["状态空间", "较小", "较大"],
                    ["非投射性", "不支持", "需扩展支持"],
                    ["神经实现", "较少使用", "spaCy 默认"],
                ],
            },
            mermaid: `graph LR
    A["初始状态 Stack=[ROOT] Buffer=[w1,w2,...,wn]"] --> B{"Oracle 决策"}
    B -->|"SHIFT"| C["w1 入栈 Stack=[ROOT,w1]"]
    B -->|"LEFT-ARC"| D["建立左依存 弹出栈顶"]
    B -->|"RIGHT-ARC"| E["建立右依存 弹出次顶"]
    C --> B
    D --> B
    E --> B
    B -->|"Buffer 空 + Stack=[ROOT]"| F["解析完成 输出依存树"]
    class F s1
    class A s0
    classDef s0 fill:#7c2d12,stroke:#333
    classDef s1 fill:#14532d,stroke:#333`,
            tip: "转移动作的选择（oracle）是训练转移分析器的关键。Oracle 可以从 gold 依存树中自动提取——这称为动态 oracle（dynamic oracle），它允许在训练过程中容忍错误并恢复。",
            warning: "基础的 Arc-Standard/Arc-Eager 只能处理投射性（projective）依存树，即没有交叉边的树。自然语言中存在约 25% 的非投射结构，需要额外扩展（如 swap 动作）来处理。",
        },
        {
            title: "6. 图-based 依存分析：MST 与 Eisner 算法",
            body: `与转移系统逐步构建依存树不同，图-based 方法将依存分析建模为在有向图中寻找最优生成树的问题。具体来说，给定一个句子，我们首先构建一个完全有向图：每个词是一个节点，每对词之间存在两条有向边（两个方向各一条），每条边都有一个分数（由模型预测）。然后，目标是找到一棵以 ROOT 为根的有向生成树，使得树上所有边的分数之和最大。

最大生成树（Maximum Spanning Tree, MST）方法的关键优势在于它天然支持非投射性（non-projective）结构。Chu-Liu/Edmonds 算法可以在 O(n²) 的时间内找到有向图的最大生成树，无论是否存在交叉边。这对于依存关系中存在长距离依赖或非投射结构的语言（如捷克语、德语）非常重要。

对于投射性树，Eisner 算法提供了一个更高效的 O(n³) 动态规划解法。Eisner 算法的核心洞察是：投射性依存树可以递归地分解为「完整跨度」和「不完整跨度」两类子结构。完整跨度指该跨度内所有词的头都在跨度内；不完整跨度则恰好有一个词的头在跨度外。这种分解使得我们可以用动态规划高效地搜索最优投射树。

图-based 方法的另一个优势是它可以与任意打分模型结合——无论是传统的基于特征的分类器，还是现代的 BiLSTM 或 Transformer 编码器。这使得图-based 方法在神经句法分析时代仍然保持竞争力。`,
            code: [
                {
                    lang: "python",
                    code: `# Chu-Liu/Edmonds MST 算法简化实现
def mst_parse(scores, n):
    """Chu-Liu/Edmonds 最大生成树算法
    
    Args:
        scores: n×n 矩阵，scores[i][j] = 词 i 作为词 j 的头的分数
        n: 词数（含 ROOT，索引 0 是 ROOT）
    
    Returns:
        heads: 每个词的头节点索引
    """
    # 简化版本：贪心选择每个节点的最高分入边
    # 注意：完整实现需要处理环的收缩
    heads = [-1] * n
    in_weights = [-float('inf')] * n
    
    for j in range(1, n):  # 每个非根节点
        for i in range(n):
            if i != j and scores[i][j] > in_weights[j]:
                in_weights[j] = scores[i][j]
                heads[j] = i
    
    # 检查是否有环（简化版，实际需要环收缩）
    visited = set()
    has_cycle = False
    for node in range(1, n):
        path = []
        curr = node
        while curr != -1 and curr not in visited:
            path.append(curr)
            visited.add(curr)
            curr = heads[curr]
        if curr in path:
            has_cycle = True
            break
    
    total_score = sum(in_weights[1:])
    return heads, total_score, has_cycle

# 示例打分矩阵
scores = [
    [0.0, 0.1, 0.8, 0.3],  # ROOT 的头分数
    [0.9, 0.0, 0.2, 0.1],  # "cat" 的头分数
    [0.1, 0.7, 0.0, 0.6],  # "chased" 的头分数
    [0.2, 0.1, 0.8, 0.0],  # "dog" 的头分数
]
words = ["ROOT", "cat", "chased", "dog"]
heads, score, cycle = mst_parse(scores, 4)
print(f"最优生成树分数: {score}")
for i, h in enumerate(heads):
    if i > 0:
        print(f"  {words[i]} --head--> {words[h]}")`,
                },
                {
                    lang: "python",
                    code: `# Eisner 算法：投射性依存分析的动态规划
def eisner(scores, n):
    """Eisner 算法寻找最优投射依存树
    
    核心思想：用两种类型的 span 来递归分解
    - complete[i][j]: words[i..j] 形成完整子树，i 或 j 是根
    - incomplete[i][j]: words[i..j] 形成不完整子树
    
    状态: dp[k][i][j]
    k=0: incomplete, j 是根 (i ≤ j)
    k=1: incomplete, i 是根 (i ≤ j)
    k=2: complete, i 是根 (i ≤ j)
    k=3: complete, j 是根 (i ≤ j)
    """
    # 初始化
    INF = float('-inf')
    dp = [[[[INF] * 4 for _ in range(n)] for _ in range(n)] for _ in range(n)]
    
    # 基线情况
    for i in range(n):
        for k in range(4):
            dp[0][i][i][k] = 0.0
    
    # 动态规划
    for span in range(1, n):
        for i in range(n - span):
            j = i + span
            for r in range(i, j):
                # incomplete: 分解为两个 complete
                dp[0][i][j][0] = max(dp[0][i][j][0],
                    dp[2][i][r][2] + dp[3][r+1][j][3])
                dp[1][i][j][1] = max(dp[1][i][j][1],
                    dp[2][i][r][2] + dp[3][r+1][j][3])
            
            for r in range(i, j + 1):
                # complete: 添加边 i→j 或 j→i
                dp[2][i][j][2] = max(dp[2][i][j][2],
                    dp[1][i][j][1] + scores[i][j])
                dp[3][i][j][3] = max(dp[3][i][j][3],
                    dp[0][i][j][0] + scores[j][i])
    
    return dp[2][0][n-1][2]

# 使用 BiLSTM 编码生成打分矩阵
import numpy as np
np.random.seed(42)
n_words = 5  # ROOT + 4 words
arc_scores = np.random.randn(n_words, n_words)
result = eisner(arc_scores, n_words)
print(f"Eisner 最优分数: {result:.4f}")`,
                },
            ],
            table: {
                headers: ["方法", "时间复杂度", "投射性", "非投射性", "核心算法"],
                rows: [
                    ["转移-based", "O(n)", "✓", "需扩展", "Arc-Standard/Eager"],
                    ["Eisner", "O(n³)", "✓", "✗", "动态规划"],
                    ["Chu-Liu/Edmonds", "O(n²)", "✓", "✓", "MST 环收缩"],
                    ["Tarjan 改进", "O(n²)", "✓", "✓", "MST 高效实现"],
                ],
            },
            mermaid: `graph TD
    A["句子 w1...wn"] --> B["编码器 BiLSTM/Transformer"]
    B --> C["打分矩阵 scores[i][j]"]
    C --> D{"是否投射？"}
    D -->|是| E["Eisner 算法 O(n³)"]
    D -->|否| F["Chu-Liu/Edmonds O(n²)"]
    E --> G["最优投射树"]
    F --> H["最优非投射树"]
    G --> I["依存关系输出"]
    H --> I
    class I s1
    class C s0
    classDef s0 fill:#7c2d12,stroke:#333
    classDef s1 fill:#14532d,stroke:#333`,
            tip: "在实际系统中，图-based 和转移-based 方法经常结合使用：转移-based 用于快速推断（O(n)），图-based 用于生成训练数据或后处理修正。",
            warning: "Eisner 算法只适用于投射性树。如果你的语料包含大量非投射结构（如自由语序语言），必须使用 Chu-Liu/Edmonds 算法。",
        },
        {
            title: "7. 实战：用 spaCy 和 Stanza 进行句法分析",
            body: `理论学完了，让我们进入实战。spaCy 和 Stanza 是当前最流行的两个工业级 NLP 工具包，它们都提供了开箱即用的依存分析和成分分析功能，但设计理念和使用方式有所不同。

spaCy 以其速度和工程化著称。它的依存分析基于转移系统（Arc-Eager），通过 BiLSTM 或 Transformer 编码，在 CPU 上即可实现实时分析。spaCy 的设计哲学是「默认就能用得很好」——加载模型后，一行代码即可完成依存分析。它还提供了丰富的可视化工具（displacy）和便捷的属性访问接口。

Stanza（原 StanfordNLP）由 Stanford NLP 组开发，更注重准确性和学术严谨性。它使用基于图的依存分析（BiAF/Biaffine 注意力机制），在多个基准数据集上取得了最先进的准确率。Stanza 不仅支持依存分析，还提供完整的 NLP 流水线（分词、词性标注、形态分析、依存分析、命名实体识别）。

两者都支持 Universal Dependencies 标注体系，这意味着它们的输出格式是兼容的。选择哪个取决于你的需求：追求速度和工程化选 spaCy，追求准确性和学术分析选 Stanza。`,
            code: [
                {
                    lang: "python",
                    code: `# spaCy 依存分析实战
import spacy
from spacy import displacy

# 加载英文模型
nlp = spacy.load("en_core_web_trf")  # Transformer 版本

# 分析句子
doc = nlp("The curious cat cautiously chased the tiny mouse")

# 获取依存关系
print(f"{'Token':<12} {'POS':<8} {'Head':<12} {'Dep Relation'}")
print("-" * 50)
for token in doc:
    print(f"{token.text:<12} {token.pos_:<8} {token.head.text:<12} {token.dep_}")

# 提取主语-动词-宾语三元组
def extract_svo(doc):
    """从依存树中提取 SVO 三元组"""
    svos = []
    for token in doc:
        if token.pos_ == "VERB":
            subject = None
            obj = None
            for child in token.children:
                if child.dep_ in ("nsubj", "nsubjpass"):
                    subject = child.text
                elif child.dep_ in ("dobj", "obj", "pobj"):
                    obj = child.text
            if subject and obj:
                svos.append((subject, token.text, obj))
    return svos

svos = extract_svo(doc)
print(f"\ SVO 三元组: {svos}")
# 输出: [('cat', 'chased', 'mouse')]`,
                },
                {
                    lang: "python",
                    code: `# Stanza 依存分析实战
import stanza

# 下载并加载英文模型
stanza.download("en")
nlp = stanza.Pipeline("en", processors="tokenize,pos,lemma,depparse")

# 分析句子
doc = nlp("The curious cat cautiously chased the tiny mouse")

# 遍历依存关系
print("=== Stanza 依存分析 ===")
for sentence in doc.sentences:
    print(f"句子: {' '.join(w.text for w in sentence.words)}")
    print(f"{'ID':<4} {'Form':<12} {'UPOS':<6} {'Head':<6} {'DepRel'}")
    print("-" * 45)
    for word in sentence.words:
        head_text = sentence.words[word.head - 1].text if word.head > 0 else "ROOT"
        print(f"{word.id:<4} {word.text:<12} {word.upos:<6} {head_text:<6} {word.deprel}")

# 成分分析（Stanza 也支持）
nlp_const = stanza.Pipeline("en", processors="tokenize,pos,constituency")
doc_const = nlp_const("The cat chased the dog")
for sent in doc_const.sentences:
    print(f"\ 成分树: {sent.constituency}")

# 批量处理
sentences = [
    "The cat chased the dog.",
    "The dog ran away quickly.",
    "Both animals lived happily.",
]
docs = nlp("\ ".join(sentences))
for i, sent in enumerate(docs.sentences):
    print(f"\ 句子 {i+1}: {[w.text for w in sent.words]}")`,
                },
            ],
            table: {
                headers: ["特性", "spaCy", "Stanza"],
                rows: [
                    ["分析器类型", "转移-based (Arc-Eager)", "图-based (Biaffine)"],
                    ["依存分析速度", "极快（~1000 词/秒）", "中等（~200 词/秒）"],
                    ["UD 准确率", "~85-90%", "~90-93%"],
                    ["成分分析", "需额外模型", "内置支持"],
                    ["GPU 加速", "支持", "支持"],
                    ["模型大小", "中等（~50MB）", "较大（~500MB）"],
                    ["多语言支持", "20+ 语言", "70+ 语言"],
                    ["易用性", "★★★★★", "★★★★"],
                ],
            },
            mermaid: `graph LR
    A["原始文本"] --> B{"选择工具"}
    B -->|"工业场景 速度优先"| C["spaCy"]
    B -->|"学术场景 准确率优先"| D["Stanza"]
    C --> E["BiLSTM/Transformer + Arc-Eager"]
    D --> F["Biaffine Attention + 图算法"]
    E --> G["Universal Dependencies 输出"]
    F --> G
    G --> H["下游应用： 信息抽取 问答 机器翻译"]
    class H s1
    class A s0
    classDef s0 fill:#7c2d12,stroke:#333
    classDef s1 fill:#14532d,stroke:#333`,
            tip: "spaCy 的 Transformer 模型（en_core_web_trf）比默认的 en_core_web_sm 准确率更高，但速度稍慢。生产环境中可以用小模型做快速过滤，大模型做精分析。",
            warning: "spaCy 的依存分析模型是在特定语料上训练的，对于非标准英语（如社交媒体文本、方言）效果可能下降。如果处理特殊领域文本，建议使用领域数据微调模型。",
        },
    ],
};
