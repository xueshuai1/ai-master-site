import { Article } from '../knowledge';

export const article: Article = {
    id: 'nlp-001',
    title: 'NLP 基础：从词嵌入到 Transformer',
    category: 'nlp',
    tags: ['词嵌入', 'Word2Vec', '注意力机制', 'Transformer', 'NLP 基础'],
    summary: '自然语言处理的核心技术路线。从 One-Hot 到 Word2Vec，从 RNN/LSTM 到注意力机制，再到 Transformer 架构的完整演进历程。包含词向量可视化、注意力权重计算和简易 Transformer 的 Python 实现。',
    date: '2026-04-22',
    readTime: '25 min',
    level: '入门',
    content: [
      {
        title: '1. NLP 的核心任务',
        body: `自然语言处理（Natural Language Processing, NLP）是人工智能的重要分支，研究如何让计算机理解、生成和处理人类语言。语言是人类最重要的信息载体，蕴含着极其丰富的语义、情感、意图和知识结构。让机器理解语言，是通向通用人工智能（AGI）的必经之路。

NLP 的任务层次可以从低到高分为三个层面。基础层任务关注语言的底层结构：分词（将连续文本切分为词或子词单元）、词性标注（判断每个词是名词、动词还是形容词）、命名实体识别（识别人名、地名、机构名等）、句法分析（构建句子的语法树）。这些任务为上层应用提供结构化的语言表征。

理解层任务关注语义的提取：文本分类（判断文本的主题或情感）、情感分析（判断文本表达的情绪倾向）、自然语言推理（判断两个句子之间是蕴含、矛盾还是中立）、语义相似度计算（衡量两个句子或段落的语义接近程度）。

生成层任务关注语言的产生：机器翻译（将一种语言的文本转换为另一种语言）、文本摘要（将长文本压缩为简短的摘要）、问答系统（根据问题从文本中检索或生成答案）、对话系统（与人类进行多轮自然语言交互）、代码生成（将自然语言描述转换为可执行代码）。

NLP 的难点在于语言的歧义性（'我想起来了'是'我回忆起来了'还是'我想起床了'？）、上下文依赖性（'这个苹果真好吃'中的'苹果'是水果还是手机？）、以及语言本身的开放性和创造性。解决这些问题的核心挑战是：如何将离散、符号化、高度结构化的自然语言，转化为计算机可以处理的连续数值表示。`,
        mermaid: `graph TD
    A['NLP 任务体系'] --> B['基础层']
    A --> C['理解层']
    A --> D['生成层']

    B --> B1['分词 / Tokenization']
    B --> B2['词性标注 / POS Tagging']
    B --> B3['命名实体识别 / NER']
    B --> B4['句法分析 / Parsing']

    C --> C1['文本分类']
    C --> C2['情感分析']
    C --> C3['自然语言推理']
    C --> C4['语义相似度']

    D --> D1['机器翻译']
    D --> D2['文本摘要']
    D --> D3['对话系统']
    D --> D4['代码生成']

    classDef level1 fill:#0c4a6e
    classDef level2 fill:#7c2d12
    classDef level3 fill:#14532d
    class A level1
    class B,C level2
    class D level3`,
      },
      {
        title: '2. 文本表示的演进：从 One-Hot 到稠密向量',
        body: `让计算机理解语言的第一步，是将文字转化为数字。这个看似简单的问题，困扰了 NLP 研究者数十年，直到词嵌入技术的出现才得到根本性的突破。

One-Hot 编码 是最直接的表示方法。假设词汇表有 V 个词，每个词用一个 V 维向量表示，其中只有一个位置为 1，其余全为 0。例如，词汇表 ['我', '爱', '学习', '自然语言处理'] 中，'爱'的 one-hot 编码是 [0, 1, 0, 0]。这种方法的问题显而易见：维度等于词汇表大小（中文可能达到百万级），极度稀疏；任意两个词的向量正交（内积为 0），完全无法表达语义相似性——'猫'和'狗'的相似度与'猫'和'宇宙飞船'的相似度一样，都是 0。

TF-IDF（Term Frequency-Inverse Document Frequency）是 One-Hot 的改进版本。它不再用 0/1 表示词的出现与否，而是用 TF（词频）衡量词在文档中的重要性，用 IDF（逆文档频率）降低常见词（如'的'、'是'）的权重。TF-IDF 向量的每一维代表一个词，值是该词的 TF-IDF 分数。这种方法在信息检索和文本分类中表现不错，但仍然无法捕捉语义相似性，且维度依然很高。

Word2Vec（Mikolov et al., 2013）是词表示领域的革命性突破。它基于分布式假设（Distributional Hypothesis）：'一个词的含义由它出现的上下文决定'。Word2Vec 通过一个简单的预测任务来学习词向量：给定一个词的上下文，预测这个词（CBOW 模型），或者给定一个词，预测它的上下文（Skip-gram 模型）。训练完成后，每个词对应一个低维稠密向量（通常 100-300 维）。神奇的是，这些向量捕捉到了丰富的语义和句法关系：vector('国王') - vector('男人') + vector('女人') ≈ vector('女王')；vector('巴黎') - vector('法国') + vector('日本') ≈ vector('东京')。

GloVe（Global Vectors, Pennington et al., 2014）结合了全局矩阵分解和局部上下文窗口的优点。它首先统计全局的词-词共现矩阵，然后通过优化目标学习词向量，使得两个词向量的点积近似等于它们共现概率的对数。GloVe 在词类比任务上表现优于 Word2Vec。

FastText（Bojanowski et al., 2017）进一步将词的表示分解为字符级 n-gram 的和。这使得 FastText 能够为训练集中未出现的词生成合理的向量（OOV, Out-of-Vocabulary 问题），并且对拼写错误和形态变化更鲁棒。对于中文等没有空格分隔的语言，FastText 使用字符级 n-gram 也能取得不错的效果。

上下文感知的表示（如 BERT、GPT）则更进一步：同一个词在不同上下文中应该有不同的表示。'苹果'在'我吃了一个苹果'和'苹果发布了新 iPhone'中的向量应该是不同的。这是预训练语言模型相对于静态词嵌入的最大优势。`,
        table: {
          headers: ['表示方法', '维度', '语义相似性', '上下文感知', 'OOV 支持'],
          rows: [
            ['One-Hot', 'V (百万级)', '❌ 完全不能', '❌ 不能', '❌ 不支持'],
            ['TF-IDF', 'V (词表大小)', '❌ 不能', '❌ 不能', '❌ 不支持'],
            ['Word2Vec', '100-300', '✅ 优秀', '❌ 静态向量', '❌ 不支持'],
            ['GloVe', '100-300', '✅ 优秀', '❌ 静态向量', '❌ 不支持'],
            ['FastText', '100-300', '✅ 优秀', '❌ 静态向量', '✅ 支持'],
            ['BERT/GPT', '768-4096', '✅ 极佳', '✅ 动态表示', '✅ 子词级支持'],
          ],
        },
      },
      {
        title: '3. 词嵌入的可视化：语义空间的几何直觉',
        body: `词嵌入最迷人的地方在于：语义关系在向量空间中表现为几何关系。两个语义相近的词，它们的向量在空间中距离很近；语义相反的词，它们的向量方向相反。这种几何直觉使得我们可以通过可视化和数学运算来直观地理解词向量的性质。

降维可视化是理解词嵌入最直接的方式。常用的降维方法有 PCA（主成分分析）和 t-SNE（t-分布随机邻居嵌入）。PCA 是线性降维，保留了全局结构但可能丢失局部细节；t-SNE 是非线性降维，更擅长保留局部相似性关系。

通过词向量的向量运算，我们可以直观地看到语义关系的'平移不变性'：国家-首都关系、性别关系、时态关系等，在高维向量空间中表现为大致平行的向量。这说明神经网络学到的不仅仅是统计共现，而是某种抽象的语义结构。`,
        code: [
          {
            lang: 'python',
            code: `import numpy as np
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

# ===== 1. 构建简化的词向量空间 =====
# 模拟训练好的词向量（实际中从预训练模型加载）
word_vectors = {
    'king':    [0.8,  0.9, -0.2,  0.1,  0.3],
    'queen':   [0.7,  0.8,  0.6,  0.2,  0.2],
    'man':     [0.6,  0.7, -0.3,  0.1,  0.1],
    'woman':   [0.5,  0.6,  0.5,  0.2,  0.0],
    'paris':   [0.3, -0.1,  0.8, -0.6,  0.4],
    'france':  [0.4, -0.2,  0.9, -0.5,  0.3],
    'tokyo':   [-0.2, 0.1,  0.7,  0.8, -0.3],
    'japan':   [-0.1, 0.0,  0.8,  0.9, -0.2],
    'cat':     [-0.5, -0.3, -0.1,  0.3,  0.6],
    'dog':     [-0.4, -0.2, -0.2,  0.4,  0.5],
    'car':     [0.1, -0.6,  0.0,  0.5, -0.5],
    'bicycle': [0.0, -0.5,  0.1,  0.6, -0.4],
    'happy':   [-0.3,  0.5,  0.2, -0.1,  0.7],
    'sad':     [-0.2, -0.4, -0.1, -0.2, -0.6],
}

words = list(word_vectors.keys())
vectors = np.array([word_vectors[w] for w in words])

# ===== 2. t-SNE 降维到 2D =====
tsne = TSNE(n_components=2, random_state=42, perplexity=5)
vectors_2d = tsne.fit_transform(vectors)

# ===== 3. 可视化 =====
fig, ax = plt.subplots(1, 1, figsize=(10, 8))
colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
          '#1abc9c', '#e67e22', '#34495e']
groups = {
    '皇室': ['king', 'queen', 'man', 'woman'],
    '城市': ['paris', 'france', 'tokyo', 'japan'],
    '动物': ['cat', 'dog'],
    '交通': ['car', 'bicycle'],
    '情感': ['happy', 'sad'],
}

for group, group_words in groups.items():
    for w in group_words:
        idx = words.index(w)
        ax.scatter(vectors_2d[idx, 0], vectors_2d[idx, 1],
                   label=group, s=100)
        ax.annotate(w, (vectors_2d[idx, 0], vectors_2d[idx, 1]),
                    fontsize=10, ha='center', va='bottom')

# 验证向量关系: king - man + woman ≈ queen
relation = (np.array(word_vectors['king']) - np.array(word_vectors['man'])
            + np.array(word_vectors['woman']))
print('king - man + woman =', relation)
print('queen              =', np.array(word_vectors['queen']))
print('余弦相似度:', np.dot(relation, np.array(word_vectors['queen']))
      / (np.linalg.norm(relation) * np.linalg.norm(word_vectors['queen'])))

ax.set_title('Word Embedding t-SNE Visualization')
ax.legend(loc='upper right')
plt.tight_layout()
plt.show()`,
          },
        ],
        tip: `在真实项目中，使用 gensim 库加载预训练的 Word2Vec 或 GloVe 模型，然后用 \`model.most_similar('king')\` 查看语义最接近的词，用 \`model.most_similar(positive=['king', 'woman'], negative=['man'])\` 做词向量运算。`,
      },
      {
        title: '4. 序列模型：RNN、LSTM、GRU',
        body: `在 Transformer 出现之前，循环神经网络（Recurrent Neural Network, RNN）是处理序列数据（如文本、语音、时间序列）的主流架构。RNN 的核心思想是：网络在处理当前输入时，会参考之前的'记忆'（隐藏状态）。

RNN 的前向计算公式为：hₜ = f(W·xₜ + U·hₜ₋₁ + b)，其中 xₜ 是当前时刻的输入，hₜ₋₁ 是上一时刻的隐藏状态，hₜ 是当前时刻的隐藏状态。这个公式的关键在于 U·hₜ₋₁ 项——它使得网络具有了'记忆'能力，当前输出不仅取决于当前输入，还取决于历史输入。

理论上，RNN 可以记住任意长度的历史信息。但实际中，由于梯度消失/爆炸问题，标准的 RNN 只能捕捉很短的依赖关系（通常不超过 10 个时间步）。这是因为反向传播时，梯度需要经过多次矩阵连乘（Uᵀ 的幂次），当 U 的特征值小于 1 时梯度指数衰减（消失），大于 1 时梯度指数增长（爆炸）。

LSTM（Long Short-Term Memory, Hochreiter & Schmidhuber, 1997）通过引入门控机制解决了梯度消失问题。LSTM 有三个门：遗忘门（Forget Gate）决定丢弃多少历史信息，输入门（Input Gate）决定保留多少新信息，输出门（Output Gate）决定输出多少当前状态。这些门控机制使得 LSTM 可以选择性地记住或遗忘信息，有效捕捉长距离依赖。

GRU（Gated Recurrent Unit, Cho et al., 2014）是 LSTM 的简化版本，只有两个门：重置门（Reset Gate）和更新门（Update Gate）。GRU 的参数更少、计算更快，在许多任务上与 LSTM 表现相当。

序列模型的核心局限在于它们的'串行'计算模式：h₁ → h₂ → h₃ → ...，每个时间步必须等待前一步完成才能计算。这使得 RNN/LSTM/GRU 难以充分利用 GPU 的并行计算能力，在长序列上的训练速度远慢于 Transformer。`,
        mermaid: `graph LR
    A['RNN 1990'] -->|'梯度消失'| B['无法处理长序列']
    B --> C['LSTM 1997']
    C -->|'三门控结构'| D['遗忘门 / 输入门 / 输出门']
    C --> E['解决长程依赖']
    C --> F['GRU 2014']
    F -->|'两门结构'| G['重置门 / 更新门']
    G --> H['参数更少、速度更快']
    D --> I['计算串行、无法并行']
    G --> I
    I --> J['Transformer 2017']
    J -->|'自注意力'| K['完全并行、捕捉全局依赖']

    classDef problem fill:#7f1d1d
    classDef solution fill:#14532d
    classDef limit fill:#7c2d12
    class B,I problem
    class C,D,E,F,G,H,J,K solution
    class A limit`,
      },
      {
        title: "5. 注意力机制：让模型学会'关注'",
        body: `注意力机制（Attention Mechanism）是 NLP 领域最重要的创新之一，也是 Transformer 架构的核心。它的灵感来源于人类的视觉注意力系统——我们不会平等地处理视野中的所有信息，而是聚焦于最相关的部分。

在 Seq2Seq（编码器-解码器）架构中，编码器将整个输入序列压缩为一个固定长度的向量，然后解码器基于这个向量生成输出。这种设计有一个致命缺陷：无论输入序列多长，编码器只能用同一个固定长度的向量来承载所有信息。当序列很长时，大量的信息必然丢失。

Bahdanau 等人（2015）提出的注意力机制解决了这个问题。解码器在生成每个输出词时，不是只看编码器的最终状态，而是'回头看'编码器在所有时间步的隐藏状态，并根据相关性分配不同的权重。这样，解码器可以动态地关注输入序列中最相关的部分。

注意力权重的计算过程如下：对于解码器的当前状态 sₜ 和编码器的每个隐藏状态 hᵢ，计算注意力分数 eᵢₜ = score(sₜ, hᵢ)（通常是一个小型神经网络），然后通过 Softmax 得到注意力权重 αᵢₜ = exp(eᵢₜ) / Σⱼ exp(eⱼₜ)。这些权重表示编码器每个位置对当前解码步骤的'重要程度'。最后，计算加权和 cₜ = Σᵢ αᵢₜ·hᵢ，得到当前步骤的上下文向量。

注意力机制的优势是革命性的：它允许模型直接建立输入和输出任意位置之间的连接，无论它们之间的距离有多远。这解决了 RNN 长程依赖的根本问题——不是通过更复杂的门控来勉强记住远处的信息，而是通过直接'看到'远处的信息。`,
        code: [
          {
            lang: 'python',
            code: `import numpy as np

# ===== 注意力机制的 NumPy 实现 =====

class SimpleAttention:
    '''加性注意力（Bahdanau Attention）'''
    def __init__(self, encoder_dim, decoder_dim):
        self.encoder_dim = encoder_dim
        self.decoder_dim = decoder_dim
        # 可学习的注意力权重
        self.W_a = np.random.randn(encoder_dim, decoder_dim) * 0.1
        self.v_a = np.random.randn(decoder_dim) * 0.1
    
    def compute_attention(self, encoder_hidden_states, decoder_state):
        '''
        encoder_hidden_states: [seq_len, encoder_dim] 编码器的所有隐藏状态
        decoder_state: [decoder_dim] 解码器当前状态
        '''
        seq_len = encoder_hidden_states.shape[0]
        
        # 计算注意力分数: e_i = v_a^T · tanh(W_a · h_i)
        scores = np.zeros(seq_len)
        for i in range(seq_len):
            # 简化版本：直接计算点积
            transformed = np.tanh(self.W_a.T @ encoder_hidden_states[i])
            scores[i] = self.v_a @ transformed
        
        # Softmax 得到注意力权重
        exp_scores = np.exp(scores - np.max(scores))
        attention_weights = exp_scores / exp_scores.sum()
        
        # 计算上下文向量: c = Σ α_i · h_i
        context_vector = attention_weights @ encoder_hidden_states
        
        return context_vector, attention_weights

# ===== 测试 =====
np.random.seed(42)
encoder_dim, decoder_dim, seq_len = 8, 8, 12
encoder_states = np.random.randn(seq_len, encoder_dim)
decoder_state = np.random.randn(decoder_dim)

attn = SimpleAttention(encoder_dim, decoder_dim)
context, weights = attn.compute_attention(encoder_states, decoder_state)

print('注意力权重:', np.round(weights, 3))
print(f'权重总和: {weights.sum():.6f}')
print(f'上下文向量形状: {context.shape}')
print(f'最关注的位置: 第 {weights.argmax()+1} 步 (权重={weights.max():.3f})')

# 可视化注意力权重
import matplotlib.pyplot as plt
plt.figure(figsize=(12, 3))
plt.bar(range(seq_len), weights, color='steelblue', edgecolor='black')
plt.xlabel('编码器位置')
plt.ylabel('注意力权重')
plt.title('注意力权重分布')
plt.xticks(range(seq_len))
plt.axhline(1/seq_len, color='red', linestyle='--', label='均匀分布基线')
plt.legend()
plt.tight_layout()
plt.show()`,
          },
        ],
      },
      {
        title: '6. Transformer 架构：自注意力的革命',
        body: `Transformer（Vaswani et al., 2017, 'Attention Is All You Need'）彻底改变了 NLP 乃至整个深度学习领域。它抛弃了 RNN 的串行计算模式，完全基于注意力机制，实现了训练的高度并行化。

Transformer 的核心是自注意力机制（Self-Attention）。与 Seq2Seq 中的交叉注意力不同，自注意力让序列中的每个位置都能关注到序列中的所有其他位置（包括自己）。计算过程可以用一个简洁的公式概括：Attention(Q, K, V) = Softmax(QKᵀ / √dₖ) · V。

这里的 Q（Query）、K（Key）、V（Value）是通过将输入分别乘以三个可学习的权重矩阵 W^Q、W^K、W^V 得到的。QKᵀ 计算了所有位置对之间的相关性分数，除以 √dₖ 是为了防止点积过大导致 Softmax 梯度消失，最后的矩阵乘法 V 得到加权后的输出。

Transformer 引入了多头注意力（Multi-Head Attention）：不是只计算一组 Q、K、V，而是计算多组（通常 8 或 12 组），每组学习不同的'关注模式'。比如，一个头可能关注语法关系（主谓一致），另一个头可能关注语义关系（代词指代），还有一个头可能关注位置关系。多个头的输出被拼接后再经过一个线性变换，得到最终的多头注意力输出。

位置编码（Positional Encoding）是 Transformer 的另一个关键组件。由于自注意力机制本身不包含位置信息（QKᵀ 的计算与位置无关），必须显式地注入位置信息。原始 Transformer 使用正弦/余弦函数生成位置编码：PE(pos, 2i) = sin(pos / 10000^(2i/d))，PE(pos, 2i+1) = cos(pos / 10000^(2i/d))。这种设计的优点是可以外推到未见过的序列长度。

完整的 Transformer 由 Encoder 和 Decoder 堆叠而成。Encoder 由 N 层（通常 6 或 12 层）组成，每层包含多头自注意力和前馈神经网络（FFN），两者之间都有残差连接和层归一化。Decoder 在 Encoder 的基础上增加了交叉注意力层（关注 Encoder 的输出），并且自注意力层使用了掩码（Mask）来防止看到未来的信息（因果性约束）。`,
        mermaid: `graph TD
    A['输入序列
x₁, x₂, ..., xₙ'] --> B['位置编码
Positional Encoding']
    B --> C['多头自注意力
Multi-Head Self-Attention']
    C --> D['残差连接 + 层归一化
Add & Norm']
    D --> E['前馈网络
FFN = ReLU(xW₁+b₁)W₂+b₂']
    E --> F['残差连接 + 层归一化
Add & Norm']
    F --> G['输出
h₁, h₂, ..., hₙ']

    C --> H['Q = xW^Q']
    C --> I['K = xW^K']
    C --> J['V = xW^V']
    H --> K['Softmax(QKᵀ/√dₖ)·V']
    I --> K
    J --> K

    classDef input fill:#0c4a6e
    classDef layer fill:#7c2d12
    classDef attn fill:#14532d
    class A,B input
    class C,D,E,F layer
    class H,I,J,K attn`,
        tip: "理解 Transformer 的捷径：把自注意力想象成一个'查询系统'。每个位置发出一个 Query（'我在找什么'），所有位置提供各自的 Key（'我有什么'）和 Value（'我的内容'）。Query 和 Key 匹配度高的位置，其 Value 会被更多地聚合到输出中。",
      },
      {
        title: '7. BERT 与 GPT：两条路线的巅峰',
        body: `Transformer 架构发表后，NLP 领域迎来了'预训练 + 微调'（Pre-train + Fine-tune）的范式转移。在大规模无标注文本上预训练一个 Transformer 模型，然后在具体任务上进行微调，这种方法几乎在所有 NLP 基准上都取得了 state-of-the-art 的结果。

BERT（Bidirectional Encoder Representations from Transformers, Devlin et al., 2019）基于 Transformer 的 Encoder 部分。它的预训练任务有两个：掩码语言模型（Masked Language Model, MLM）——随机掩码输入中 15% 的词，让模型预测被掩码的词；下一句预测（Next Sentence Prediction, NSP）——判断两个句子是否连续。BERT 的关键优势是'双向'——由于 MLM 任务可以关注左右两侧的上下文，BERT 对语言的理解比单向模型更深入。

GPT（Generative Pre-trained Transformer, Radford et al., 2018）基于 Transformer 的 Decoder 部分。它的预训练任务只有一个：自回归语言模型——根据前面的词预测下一个词。GPT 的优势在于'生成'能力——由于它天生就是按顺序生成下一个词的，所以非常适合文本生成、对话、代码生成等任务。

这两种架构的对比反映了两种不同的'理解'语言的方式：BERT 通过双向上下文获得深度的语义理解，适合分类、NER、问答等理解型任务；GPT 通过从左到右的自回归训练获得了强大的生成能力，适合翻译、摘要、对话等生成型任务。从 GPT-3 开始，人们发现大规模的 GPT 模型还涌现出了少样本学习（Few-shot Learning）和思维链推理（Chain-of-Thought Reasoning）的能力，这进一步推动了大语言模型的发展。`,
        table: {
          headers: ['特性', 'BERT (Encoder)', 'GPT (Decoder)', 'T5 (Encoder-Decoder)'],
          rows: [
            ['预训练任务', 'MLM + NSP', '自回归语言建模', 'Text-to-Text 转换'],
            ['上下文', '双向', '单向（因果）', '双向（Encoder）+ 单向（Decoder）'],
            ['擅长任务', '分类、NER、QA', '生成、对话、翻译', '统一的序列到序列任务'],
            ['参数规模', '110M (Base) / 340M (Large)', '125M ~ 1.8T+', '60M ~ 11B'],
            ['推理方式', '一次性编码', '自回归逐步生成', '编码后自回归解码'],
          ],
        },
      },
      {
        title: '8. NLP 技术演进路线图',
        body: `NLP 的发展是一部从规则到统计、从浅层到深层、从专用到通用的演进史。了解这段历史，有助于理解当前技术的设计动机和未来可能的方向。`,
        mermaid: `graph LR
    A['规则方法
1950s-1980s'] -->|'Chomsky 语法
手工规则'| B['统计方法
1990s-2000s']
    B -->|'HMM、n-gram
IBM 翻译模型'| C['深度学习
2013-2017']
    C -->|'Word2Vec
RNN/LSTM
Seq2Seq'| D['注意力时代
2017-2020']
    D -->|'Transformer
BERT
GPT-2/3'| E['大模型时代
2020-2023']
    E -->|'GPT-4
ChatGPT
LLaMA'| F['智能体时代
2023-']
    F -->|'多模态
Agent
工具调用'

        classDef era fill:#0c4a6e
    class A,B,C,D,E,F era`,
      },
      {
        title: '9. Python 实战：实现简易 Self-Attention',
        body: `理论理解得再好，也不如亲手实现一次 Self-Attention 来得深刻。下面我们使用 NumPy 实现一个完整的缩放点积注意力（Scaled Dot-Product Attention），这是 Transformer 最核心的组件。

实现 Self-Attention 需要理解以下关键步骤：首先将输入分别投影到 Query、Key、Value 三个子空间；然后计算 Q 和 K 的点积得到注意力分数；接着除以 √dₖ 进行缩放（这一步至关重要，否则点积过大导致 Softmax 饱和）；应用 Softmax 得到注意力权重；最后用注意力权重对 V 进行加权求和。`,
        code: [
          {
            lang: 'python',
            code: `import numpy as np

class ScaledDotProductAttention:
    '''缩放点积注意力（Transformer 核心组件）'''
    def __init__(self, d_model):
        self.d_model = d_model
        self.d_k = d_model  # 单头注意力，d_k = d_model
    
    def forward(self, Q, K, V, mask=None):
        '''
        Q, K, V: [batch_size, seq_len, d_model]
        mask: 可选，用于防止看到未来信息
        '''
        # 1. 计算注意力分数: Q · K^T
        scores = Q @ K.transpose(0, 2, 1)  # [batch, seq_len, seq_len]
        
        # 2. 缩放: 除以 sqrt(d_k)
        scores = scores / np.sqrt(self.d_k)
        
        # 3. 应用掩码（如果有）
        if mask is not None:
            scores = np.where(mask == 0, -1e9, scores)
        
        # 4. Softmax 得到注意力权重
        exp_scores = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
        attention_weights = exp_scores / exp_scores.sum(axis=-1, keepdims=True)
        
        # 5. 加权求和: attention · V
        output = attention_weights @ V
        
        return output, attention_weights

class MultiHeadAttention:
    '''多头注意力'''
    def __init__(self, d_model, num_heads):
        assert d_model % num_heads == 0
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        # 线性投影矩阵
        self.W_Q = np.random.randn(d_model, d_model) * 0.02
        self.W_K = np.random.randn(d_model, d_model) * 0.02
        self.W_V = np.random.randn(d_model, d_model) * 0.02
        self.W_O = np.random.randn(d_model, d_model) * 0.02
        
        self.attention = ScaledDotProductAttention(self.d_k)
    
    def _split_heads(self, x):
        '''将 [batch, seq_len, d_model] 拆分为 [batch, seq_len, num_heads, d_k]'''
        batch_size, seq_len, _ = x.shape
        x = x.reshape(batch_size, seq_len, self.num_heads, self.d_k)
        return x.transpose(0, 2, 1, 3)  # [batch, num_heads, seq_len, d_k]
    
    def forward(self, Q, K, V, mask=None):
        batch_size = Q.shape[0]
        
        # 线性投影
        Q = Q @ self.W_Q
        K = K @ self.W_K
        V = V @ self.W_V
        
        # 分头
        Q = self._split_heads(Q)
        K = self._split_heads(K)
        V = self._split_heads(V)
        
        # 每个头独立计算注意力
        attention_out, attn_weights = self.attention.forward(Q, K, V, mask)
        
        # 合并头: [batch, num_heads, seq_len, d_k] -> [batch, seq_len, d_model]
        attention_out = attention_out.transpose(0, 2, 1, 3).reshape(
            batch_size, -1, self.d_model
        )
        
        # 输出线性投影
        output = attention_out @ self.W_O
        
        return output, attn_weights

# ===== 测试 =====
np.random.seed(42)
batch_size, seq_len, d_model, num_heads = 2, 10, 64, 8
x = np.random.randn(batch_size, seq_len, d_model)

mha = MultiHeadAttention(d_model, num_heads)
output, weights = mha.forward(x, x, x)

print(f'输入形状: {x.shape}')
print(f'输出形状: {output.shape}')
print(f'注意力权重形状: {weights.shape}')
print(f'头 0 的注意力权重 (batch 0):\n{np.round(weights[0, 0, :5, :5], 3)}')

# 检查每行权重和为 1
row_sums = weights.sum(axis=-1)
print(f'\n注意力权重行和 (应全为 1): min={row_sums.min():.6f}, max={row_sums.max():.6f}')`,
          },
        ],
        warning: '实现 Self-Attention 时常见的数值问题：1）忘记除以 √dₖ，导致 Softmax 饱和（梯度为 0）；2）忘记在 Softmax 前减去最大值，导致 exp() 溢出；3）掩码值应该设为 -1e9（或 -inf），而不是 0——设为 0 只是让权重为 0，而不是让 Softmax 忽略该位置。',
      },
      {
        title: '10. 从 Transformer 到大语言模型',
        body: `Transformer 的发表（2017）到 ChatGPT 的爆火（2022）仅仅用了 5 年时间，但 NLP 领域发生了翻天覆地的变化。理解这段演进历程，有助于把握当前技术的来龙去脉。

第一阶段：预训练范式的确立（2018-2019）。BERT 和 GPT-2 证明了在大规模无标注文本上预训练 Transformer 的价值。这一阶段的核心发现是：预训练学到的语言表示可以迁移到各种下游任务，只需少量标注数据进行微调即可取得优异效果。

第二阶段：规模法则的浮现（2020-2021）。GPT-3（175B 参数）的出现揭示了一个重要规律：语言模型的性能随模型规模、数据量和计算量的增加而呈现可预测的幂律增长（Kaplan et al., 2020; Hoffmann et al., 2022）。这意味着只要投入足够多的计算资源，模型的能力就会持续提升。

第三阶段：指令微调与对齐（2022-2023）。人们发现，单纯的预训练得到的模型虽然'懂'很多知识，但不知道如何按人类的意图行事。指令微调（Instruction Tuning，如 FLAN-T5、Alpaca）让模型学会遵循指令；基于人类反馈的强化学习（RLHF，如 InstructGPT、ChatGPT）进一步让模型的输出与人类价值观对齐。

第四阶段：开源与多模态（2023-至今）。LLaMA、Mistral 等开源模型的发布降低了大模型的使用门槛；多模态大模型（GPT-4V、Gemini）开始同时处理文本、图像、音频等多种模态；Agent 框架让大模型具备了使用工具、执行代码、规划任务的自主能力。

当前的前沿方向包括：更高效的架构（如 MoE、状态空间模型 Mamba）、更长的上下文窗口（128K-1M token）、更强的推理能力（思维链、思维树）、以及更可靠的对齐机制。NLP 正在从'自然语言处理'走向'自然语言理解与生成'，最终可能实现机器与人类的无缝交流。`,
        tip: '入门大语言模型开发的最佳路径：1）先用 OpenAI API 或开源模型体验 Prompt Engineering；2）学习 LangChain/LlamaIndex 等框架构建 RAG 应用；3）尝试微调开源模型（如 LLaMA、Qwen）适应特定领域；4）深入理解 Transformer 架构，为创新打基础。不要跳过基础——理解 Self-Attention 和词嵌入，比盲目调 API 更有长远价值。',
      },
    ],
};
