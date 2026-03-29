# Agent 记忆机制 - 面试题

## 题目 1：Agent 记忆系统分为哪几个层次？各有什么特点？

**参考答案：**

记忆系统分为三层：

1. **工作记忆（Working Memory）**
   - 容量有限（7±2 个项目）
   - 访问速度最快
   - 存储当前处理的信息
   - 示例：当前对话焦点

2. **短期记忆（Short-Term Memory）**
   - 存储最近的交互历史
   - 容量较大（最近 N 轮对话）
   - 支持快速检索
   - 示例：最近 10 轮对话

3. **长期记忆（Long-Term Memory）**
   - 使用向量数据库存储
   - 容量大，支持语义检索
   - 需要巩固机制转入
   - 示例：用户偏好、历史知识

**代码示例：**
```python
class HierarchicalMemory:
    def __init__(self):
        self.working = WorkingMemory(capacity=7)
        self.short_term = ShortTermMemory(max_turns=10)
        self.long_term = VectorMemory()
    
    async def store(self, data):
        # 先存入工作记忆
        self.working.add(data)
        # 定期巩固到短期
        if self.working.is_full():
            await self.consolidate_to_short()
        # 定期巩固到长期
        if self.short_term.is_full():
            await self.consolidate_to_long()
```

**考察重点：** 记忆层次理解、系统设计
**延伸追问：** 1)工作记忆如何管理注意力？2)短期记忆如何摘要？3)长期记忆如何索引？4)记忆巩固机制？5)如何检索跨层记忆？

---

## 题目 2：如何实现记忆的向量检索？

**参考答案：**

向量检索实现：

```python
class VectorMemory:
    def __init__(self):
        self.vector_store = ChromaDB()
        self.embedder = EmbeddingModel()
    
    async def store(self, content, metadata):
        # 生成嵌入向量
        embedding = await self.embedder.encode(content)
        # 存储到向量库
        await self.vector_store.add(
            embedding=embedding,
            metadata={'content': content, **metadata}
        )
    
    async def retrieve(self, query, k=5):
        # 查询向量
        query_embedding = await self.embedder.encode(query)
        # 相似度搜索
        results = await self.vector_store.search(
            embedding=query_embedding,
            k=k,
            include_metadata=True
        )
        return [r['metadata']['content'] for r in results]
```

**考察重点：** 向量检索、嵌入模型
**延伸追问：** 1)选择什么嵌入模型？2)如何优化检索速度？3)如何处理多语言？4)如何更新记忆？5)如何评估检索质量？

---

## 题目 3：记忆巩固机制如何工作？

**参考答案：**

记忆巩固机制：

```python
class MemoryConsolidator:
    def __init__(self):
        self.importance_threshold = 0.7
    
    async def consolidate(self, short_term, long_term):
        # 1. 评估重要性
        important_items = []
        for item in short_term.get_items():
            importance = await self.assess_importance(item)
            if importance > self.importance_threshold:
                important_items.append(item)
        
        # 2. 提取关键信息
        for item in important_items:
            key_info = await self.extract_key_information(item)
            
            # 3. 存储到长期记忆
            await long_term.store(
                content=key_info,
                metadata={'source': item, 'importance': importance}
            )
        
        # 4. 清理短期记忆
        short_term.clear_old()
    
    async def assess_importance(self, item):
        # 基于多个因素评估
        factors = [
            item.get('user_explicit_importance', 0.5),
            self.check_relevance(item),
            self.check_emotional_weight(item),
            self.check_action_required(item)
        ]
        return sum(factors) / len(factors)
```

**考察重点：** 记忆管理、重要性评估
**延伸追问：** 1)重要性评估标准？2)巩固时机选择？3)如何处理遗忘？4)如何优化存储？5)如何验证巩固效果？

---

## 题目 4：如何实现个性化记忆管理？

**参考答案：**

个性化记忆：

```python
class PersonalizedMemory:
    def __init__(self):
        self.user_profiles = {}
        self.memory = HierarchicalMemory()
    
    async def store_for_user(self, user_id, data):
        # 获取用户偏好
        profile = await self.get_user_profile(user_id)
        
        # 根据偏好调整存储策略
        if profile['detail_oriented']:
            # 详细存储
            await self.memory.store(data, detail_level='high')
        else:
            # 摘要存储
            summary = await self.summarize(data)
            await self.memory.store(summary, detail_level='low')
    
    async def retrieve_for_user(self, user_id, query):
        profile = await self.get_user_profile(user_id)
        
        # 根据偏好调整检索
        results = await self.memory.retrieve(query)
        
        if profile['prefers_brief']:
            return await self.summarize_results(results)
        return results
```

**考察重点：** 个性化、用户建模
**延伸追问：** 1)如何学习用户偏好？2)如何保护隐私？3)如何处理多用户？4)如何适应偏好变化？5)如何评估个性化效果？

---

## 题目 5：记忆系统如何处理遗忘和更新？

**参考答案：**

遗忘和更新机制：

```python
class MemoryWithForgetting:
    def __init__(self):
        self.decay_rate = 0.1  # 遗忘率
        self.update_threshold = 0.8
    
    async def update(self, key, new_data):
        # 检查是否存在
        existing = await self.get(key)
        
        if existing:
            # 计算相似度
            similarity = self.calculate_similarity(existing, new_data)
            
            if similarity > self.update_threshold:
                # 更新现有记忆
                await self.merge(key, existing, new_data)
            else:
                # 存储为新记忆
                await self.store(new_key, new_data)
        else:
            await self.store(key, new_data)
    
    async def apply_forgetting(self):
        # 基于时间衰减
        for memory in self.all_memories:
            age = time.time() - memory['timestamp']
            decay = math.exp(-self.decay_rate * age)
            
            # 访问频率提升重要性
            importance = memory['importance'] * decay * memory['access_count']
            
            # 低于阈值则删除
            if importance < 0.1:
                await self.delete(memory['id'])
```

**考察重点：** 记忆更新、遗忘曲线
**延伸追问：** 1)遗忘率如何设定？2)如何防止重要记忆丢失？3)如何合并相似记忆？4)如何处理矛盾记忆？5)如何评估遗忘策略？
