"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ContentLayout from "@/components/ContentLayout";
import CodeBlock from "@/components/CodeBlock";
import Callout from "@/components/Callout";
import Collapsible from "@/components/Collapsible";

export default function KnowledgeArticlePage() {
  const params = useParams();
  const category = params.category as string;
  const articleId = params.articleId as string;

  const sidebarContent = (
    <div className="sticky top-6 space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>📊</span>
          学习进度
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">本节进度</span>
              <span className="text-blue-600 font-medium">0%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-0 transition-all duration-300"></div>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            标记为已读
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>🔗</span>
          相关推荐
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              Transformer 架构详解
            </a>
          </li>
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              Attention 机制入门
            </a>
          </li>
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              BERT 模型实践
            </a>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <ContentLayout
      title="什么是 Transformer？"
      subtitle="深入理解现代深度学习的基础架构"
      category={category}
      tags={["深度学习", "NLP", "Transformer", "Attention"]}
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: "知识库", href: "/knowledge" },
        { label: category.toUpperCase(), href: `/knowledge/${category}` },
        { label: "文章详情" },
      ]}
      sidebarContent={sidebarContent}
    >
      {/* 引言 */}
      <Callout type="info" title="💡 核心概念" icon="🎯">
        <p>
          Transformer 是 2017 年由 Google 团队在论文
          <a href="https://arxiv.org/abs/1706.03762" className="text-blue-600 underline ml-1" target="_blank" rel="noopener noreferrer">
            "Attention Is All You Need"
          </a>
          中提出的深度学习架构，它彻底改变了自然语言处理领域。
        </p>
      </Callout>

      {/* 什么是 Transformer */}
      <h2 id="什么是-transformer">什么是 Transformer？</h2>
      <p className="text-gray-700 leading-relaxed">
        Transformer 是一种基于自注意力机制（Self-Attention）的神经网络架构，
        它不再依赖传统的循环神经网络（RNN）或卷积神经网络（CNN），
        而是完全基于注意力机制来处理序列数据。
      </p>

      <Callout type="tip" title="✨ 为什么重要？">
        <ul className="list-disc list-inside space-y-1">
          <li>并行计算能力强，训练速度快</li>
          <li>能够捕捉长距离依赖关系</li>
          <li>成为了 BERT、GPT 等模型的基础</li>
        </ul>
      </Callout>

      {/* 核心架构 */}
      <h2 id="核心架构">核心架构</h2>
      <p className="text-gray-700 mb-4">
        Transformer 由 Encoder 和 Decoder 两部分组成，每部分都包含多个相同的层：
      </p>

      <Collapsible title="📦 Encoder 编码器" variant="card" defaultOpen={true}>
        <p className="text-gray-700 mb-4">
          Encoder 负责将输入序列转换为上下文表示。它包含 6 个相同的层，每层有两个子层：
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>多头自注意力机制（Multi-Head Self-Attention）</li>
          <li>前馈神经网络（Feed-Forward Neural Network）</li>
        </ul>
      </Collapsible>

      <Collapsible title="📦 Decoder 解码器" variant="card">
        <p className="text-gray-700 mb-4">
          Decoder 负责将编码后的表示转换为输出序列。它也包含 6 个相同的层，每层有三个子层：
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>掩码多头自注意力机制（Masked Multi-Head Self-Attention）</li>
          <li>多头注意力机制（Multi-Head Attention）</li>
          <li>前馈神经网络（Feed-Forward Neural Network）</li>
        </ul>
      </Collapsible>

      {/* 代码示例 */}
      <h2 id="代码实现">代码实现</h2>
      <p className="text-gray-700 mb-4">
        下面是一个简化的 Transformer 模型实现示例：
      </p>

      <CodeBlock 
        language="python" 
        title="Transformer 模型结构"
        collapsible={true}
      >
{`import torch
import torch.nn as nn
import math

class Transformer(nn.Module):
    def __init__(self, d_model=512, nhead=8, num_layers=6):
        super().__init__()
        self.attention = nn.MultiheadAttention(
            embed_dim=d_model, 
            num_heads=nhead
        )
        self.feed_forward = nn.Sequential(
            nn.Linear(d_model, d_model * 4),
            nn.ReLU(),
            nn.Linear(d_model * 4, d_model)
        )
        self.norm = nn.LayerNorm(d_model)
        
    def forward(self, x, mask=None):
        # Self-Attention
        attn_output, _ = self.attention(x, x, x, attn_mask=mask)
        x = self.norm(x + attn_output)
        
        # Feed-Forward
        ff_output = self.feed_forward(x)
        x = self.norm(x + ff_output)
        
        return x`}
      </CodeBlock>

      <Callout type="warning" title="⚠️ 注意事项">
        <p>
          实际应用中需要考虑位置编码（Positional Encoding）、残差连接（Residual Connection）
          和层归一化（Layer Normalization）等细节。
        </p>
      </Callout>

      {/* 自注意力机制 */}
      <h2 id="自注意力机制">自注意力机制（Self-Attention）</h2>
      <p className="text-gray-700 mb-4">
        自注意力机制是 Transformer 的核心，它允许模型在处理每个位置的词时，
        能够关注到序列中的其他位置。计算公式如下：
      </p>

      <CodeBlock language="python" title="Attention 计算">
{`def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Q: Query matrix
    K: Key matrix  
    V: Value matrix
    """
    d_k = Q.size(-1)
    
    # 计算注意力分数
    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)
    
    # 应用掩码（如果有）
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    
    # Softmax 归一化
    attention_weights = torch.softmax(scores, dim=-1)
    
    # 加权求和
    output = torch.matmul(attention_weights, V)
    
    return output, attention_weights`}
      </CodeBlock>

      {/* 学习要点 */}
      <h2 id="学习要点">学习要点</h2>
      
      <Collapsible title="🎯 关键知识点" variant="default">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">多头注意力</h4>
            <p className="text-sm text-blue-700">
              通过多个注意力头并行计算，让模型能够同时关注不同位置的不同信息
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">位置编码</h4>
            <p className="text-sm text-green-700">
              由于 Transformer 没有递归和卷积，需要位置编码来注入序列顺序信息
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">残差连接</h4>
            <p className="text-sm text-purple-700">
              每个子层都有残差连接，帮助梯度流动，使深层网络更容易训练
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">层归一化</h4>
            <p className="text-sm text-yellow-700">
              在每个残差连接后应用层归一化，稳定训练过程
            </p>
          </div>
        </div>
      </Collapsible>

      {/* 总结 */}
      <Callout type="success" title="✅ 总结" icon="🎓">
        <p>
          Transformer 通过完全基于注意力机制的架构，实现了高效的并行计算和强大的长距离依赖捕捉能力。
          它是现代大语言模型（如 GPT、BERT）的基础，理解 Transformer 是深入学习 NLP 的关键。
        </p>
      </Callout>

      {/* 下一步 */}
      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
        <Link
          href={`/knowledge/${category}`}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
        >
          浏览该分类其他文章
        </Link>
        <Link
          href="/knowledge"
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium"
        >
          返回知识库
        </Link>
      </div>
    </ContentLayout>
  );
}
