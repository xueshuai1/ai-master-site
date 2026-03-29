# 单 Agent 开发实践 - 面试题

## 题目 1：单 Agent 开发的核心流程是什么？

**参考答案：**

单 Agent 开发流程包括 6 个阶段：

1. **需求分析**：明确 Agent 职责和边界
2. **架构设计**：设计模块和接口
3. **核心实现**：实现感知、决策、行动模块
4. **集成测试**：测试各模块协作
5. **部署上线**：配置和部署
6. **监控优化**：持续监控和改进

**代码示例：**
```python
# 1. 定义 Agent 类
class MyAgent:
    def __init__(self, config):
        self.config = config
        self.llm = LLMClient(config['llm'])
        self.memory = MemoryManager()
        self.tools = self.load_tools(config['tools'])
    
    async def process(self, input):
        context = await self.memory.get_context()
        response = await self.llm.generate(input, context)
        await self.memory.store(input, response)
        return response

# 2. 配置和启动
agent = MyAgent(config)
response = await agent.process("Hello")
```

**考察重点：** 开发流程理解、实践能力
**延伸追问：** 1)如何确定 Agent 边界？2)如何设计测试用例？3)如何监控 Agent 性能？4)如何处理版本升级？5)如何保证 Agent 安全？

---

## 题目 2：单 Agent 中如何管理对话上下文？

**参考答案：**

上下文管理策略：

```python
class ContextManager:
    def __init__(self, max_length=10):
        self.recent_messages = []
        self.summary = None
        self.max_length = max_length
    
    async def add_message(self, role, content):
        self.recent_messages.append({
            'role': role,
            'content': content,
            'timestamp': time.time()
        })
        
        # 保持固定长度
        if len(self.recent_messages) > self.max_length:
            # 生成摘要并存储
            old_messages = self.recent_messages[:2]
            self.summary = await self.summarize(old_messages)
            self.recent_messages = self.recent_messages[2:]
    
    def get_context(self):
        context = []
        if self.summary:
            context.append({'role': 'system', 'content': f'对话摘要：{self.summary}'})
        context.extend(self.recent_messages)
        return context
```

**考察重点：** 上下文管理、内存优化
**延伸追问：** 1)如何选择上下文长度？2)摘要生成的时机？3)如何检索长期记忆？4)如何处理多话题对话？5)如何优化上下文 token 使用？

---

## 题目 3：单 Agent 如何实现工具调用功能？

**参考答案：**

工具调用实现：

```python
class ToolCallingAgent:
    def __init__(self):
        self.tools = {
            'search': SearchTool(),
            'calculator': CalculatorTool(),
            'weather': WeatherTool()
        }
        self.llm = LLMClient()
    
    async def process(self, user_input):
        # 1. 判断是否需要工具
        tool_plan = await self.llm.generate(f"""
        用户输入：{user_input}
        可用工具：{list(self.tools.keys())}
        是否需要工具？返回工具名和参数。
        """)
        
        # 2. 执行工具
        if tool_plan['need_tool']:
            tool = self.tools[tool_plan['tool_name']]
            result = await tool.execute(**tool_plan['params'])
            
            # 3. 生成响应
            response = await self.llm.generate(f"""
            工具结果：{result}
            请生成自然语言回复。
            """)
            return response
        
        # 直接回复
        return await self.llm.generate(user_input)
```

**考察重点：** 工具调用、LLM 协调
**延伸追问：** 1)如何描述工具给 LLM？2)如何处理工具错误？3)如何支持多工具调用？4)如何缓存工具结果？5)如何保证工具调用安全？

---

## 题目 4：单 Agent 开发中如何处理错误和异常？

**参考答案：**

错误处理策略：

```python
class RobustAgent:
    async def process(self, input):
        try:
            return await self._process(input)
        except InputValidationError as e:
            return f"输入错误：{e}"
        except ToolError as e:
            await self.log_error(e)
            return await self.fallback_response(input)
        except LLMError as e:
            return "服务暂时不可用，请稍后重试"
        except Exception as e:
            await self.log_error(e)
            return "发生错误，已记录日志"
    
    async def fallback_response(self, input):
        # 降级策略
        return self.get_cached_response(input)
```

**考察重点：** 错误处理、系统健壮性
**延伸追问：** 1)如何分类错误？2)重试策略如何设计？3)如何记录错误日志？4)如何通知用户？5)如何从错误中学习？

---

## 题目 5：单 Agent 如何实现个性化服务？

**参考答案：**

个性化实现：

```python
class PersonalizedAgent:
    def __init__(self):
        self.user_profiles = {}
        self.memory = MemoryManager()
    
    async def process(self, user_id, input):
        # 获取用户画像
        profile = await self.get_user_profile(user_id)
        
        # 检索用户历史
        history = await self.memory.get_user_history(user_id)
        
        # 构建个性化上下文
        context = self.build_context(profile, history)
        
        # 生成个性化响应
        response = await self.llm.generate(input, context)
        
        # 更新用户画像
        await self.update_profile(user_id, input, response)
        
        return response
    
    def build_context(self, profile, history):
        return f"""
        用户偏好：{profile['preferences']}
        历史对话：{history}
        请根据用户偏好生成回复。
        """
```

**考察重点：** 个性化、用户建模
**延伸追问：** 1)如何收集用户偏好？2)如何保护用户隐私？3)如何冷启动？4)如何更新用户画像？5)如何评估个性化效果？
