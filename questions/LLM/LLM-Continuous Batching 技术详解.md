---
title: "Continuous Batching 技术详解"
category: "LLM"
difficulty: "⭐⭐⭐"
tags: ["Continuous Batching", "推理优化", "并发", "吞吐量"]

collectedAt: "2026-03-29"
---

## 题目描述
请解释 Continuous Batching（又称 Iteration-level Batching）的原理，它如何提升 LLM 推理的吞吐量。

**标签：** Continuous Batching，推理优化，并发，吞吐量

## 参考答案

**问题背景：**
传统 batching 要求 batch 内所有请求同时开始、同时结束，但 LLM 生成是动态的：
- 不同请求的输出长度不同
- 短的请求要等长的请求完成
- GPU 利用率低

**Continuous Batching 原理：**
```
传统 Batching:
请求 1: [████████████]
请求 2: [████████████] (即使生成了 3 个 token 也要等待)

Continuous Batching:
请求 1: [████████████]
请求 2: [████] → 完成，立即插入新请求 3
请求 3:     [████████]
```

**核心机制：**
1. **动态插入：** 请求完成立即腾出位置
2. **异步调度：** 不同请求处于不同生成阶段
3. **统一计算：** 每步对所有活跃请求做 batch 前向

**实现伪代码：**
```python
active_requests = []
pending_requests = queue()

while True:
    # 1. 移除完成的请求
    active_requests = [r for r in active_requests if not r.done]
    
    # 2. 填充新请求
    while len(active_requests) < max_batch and pending_requests:
        active_requests.append(pending_requests.pop())
    
    # 3. 批量前向传播
    if active_requests:
        outputs = model.forward(active_requests)
        
        # 4. 更新状态
        for req, out in zip(active_requests, outputs):
            req.append_token(out)
            if req.is_complete():
                req.done = True
                send_response(req)
```

**优势：**
- **吞吐量提升：** 2-10 倍（取决于请求长度分布）
- **延迟降低：** 短请求无需等待
- **GPU 利用率高：** 减少空闲时间

**挑战：**
1. **调度复杂度：** 需要高效管理请求状态
2. **显存管理：** 动态分配 KV Cache
3. **公平性：** 防止长请求饥饿

**相关技术：**
- **Chunked Prefill：** 拆分长 prompt，避免阻塞
- **Prefix Caching：** 共享公共前缀的 KV Cache
- **Speculative Decoding：** 小模型猜测，大模型验证

**应用：**
- vLLM、TGI、TensorRT-LLM 等推理引擎
- 高并发 API 服务必备技术

## 考察重点
- **知识：** Continuous Batching 的调度机制
- **能力：** 理解吞吐量优化的核心思路
- **思维：** 系统级优化的工程视角

## 延伸追问（25 分）
1. 传统 batching 的吞吐量瓶颈在哪里？（5 分）
2. 如何处理不同长度的 prompt？（5 分）
3. 什么是 Chunked Prefill？（5 分）
4. Continuous Batching 对延迟有什么影响？（5 分）
5. 如何设计请求调度策略？（5 分）

## 深入理解
Continuous Batching 是 LLM 服务高并发的关键技术，让推理引擎能高效处理动态请求。

## 更新历史
- v1 (2026-03-29): 初始版本
