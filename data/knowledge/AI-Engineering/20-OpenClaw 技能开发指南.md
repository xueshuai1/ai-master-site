# OpenClaw 技能开发指南

## 核心概念

OpenClaw 技能开发是指按照 OpenClaw 框架规范创建可复用、可组合的技能模块。技能是 OpenClaw 的核心功能单元，掌握技能开发是构建 AI 应用的基础。

### 技能开发生命周期

```mermaid
graph LR
    A[需求分析] --> B[技能设计]
    B --> C[技能实现]
    C --> D[技能测试]
    D --> E[技能打包]
    E --> F[技能发布]
    F --> G[技能使用]
    G --> H[技能迭代]
```

### 技能分类

| 类型 | 描述 | 示例 |
|------|------|------|
| 工具型 | 调用外部 API/服务 | 天气查询、搜索 |
| 处理型 | 数据处理和转换 | 文本处理、数据分析 |
| 决策型 | 基于规则/模型决策 | 意图识别、分类 |
| 交互型 | 与用户交互 | 对话、通知 |
| 组合型 | 组合多个技能 | 工作流、管道 |

## 开发流程

### 1. 技能设计

```python
# 技能设计模板

class SkillDesign:
    """技能设计文档"""
    
    def __init__(self):
        self.basic_info = {
            'name': '技能名称',
            'version': '1.0.0',
            'description': '技能描述',
            'author': '作者',
            'category': '技能分类'
        }
        
        self.interface = {
            'input': {
                'parameters': [],
                'required': [],
                'optional': []
            },
            'output': {
                'format': '返回格式',
                'schema': {}
            }
        }
        
        self.dependencies = {
            'external_apis': [],
            'libraries': [],
            'other_skills': []
        }
        
        self.error_handling = {
            'error_types': [],
            'fallback_strategy': '降级策略'
        }
```

### 2. 技能实现

```python
# 技能实现示例：天气查询技能

# skills/weather_skill/__init__.py
from .main import WeatherSkill

__all__ = ['WeatherSkill']
__version__ = '1.0.0'

# skills/weather_skill/main.py
import httpx
from typing import Dict, Any, Optional
from openclaw.skill import Skill

class WeatherSkill(Skill):
    """天气查询技能"""
    
    name = "weather_query"
    version = "1.0.0"
    description = "查询指定城市的当前天气和预报信息"
    category = "tool"
    
    # 配置 schema
    config_schema = {
        "type": "object",
        "properties": {
            "api_key": {
                "type": "string",
                "description": "天气 API 密钥"
            },
            "base_url": {
                "type": "string",
                "default": "https://api.weather.com",
                "description": "API 基础 URL"
            },
            "units": {
                "type": "string",
                "enum": ["metric", "imperial"],
                "default": "metric",
                "description": "温度单位"
            }
        },
        "required": ["api_key"]
    }
    
    # 输入 schema
    input_schema = {
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "城市名称"
            },
            "days": {
                "type": "integer",
                "minimum": 1,
                "maximum": 7,
                "default": 3,
                "description": "预报天数"
            }
        },
        "required": ["city"]
    }
    
    def __init__(self, config: Optional[Dict] = None):
        super().__init__(config)
        self.api_key = self.config.get('api_key')
        self.base_url = self.config.get('base_url', 'https://api.weather.com')
        self.units = self.config.get('units', 'metric')
        self.session = None
    
    async def initialize(self):
        """初始化技能"""
        self.session = httpx.AsyncClient(
            timeout=30.0,
            headers={'Authorization': f'Bearer {self.api_key}'}
        )
    
    async def cleanup(self):
        """清理资源"""
        if self.session:
            await self.session.aclose()
    
    async def execute(self, city: str, days: int = 3) -> Dict[str, Any]:
        """
        执行天气查询
        
        Args:
            city: 城市名称
            days: 预报天数（1-7）
        
        Returns:
            包含天气信息的字典
        
        Raises:
            WeatherAPIError: API 调用失败
            ValidationError: 参数验证失败
        """
        # 参数验证
        self.validate_input(city=city, days=days)
        
        try:
            # 调用天气 API
            weather_data = await self.fetch_weather(city, days)
            
            # 格式化结果
            result = self.format_result(weather_data, city, days)
            
            return result
            
        except httpx.HTTPError as e:
            raise WeatherAPIError(f"Weather API error: {str(e)}")
        except Exception as e:
            raise SkillExecutionError(f"Execution failed: {str(e)}")
    
    async def fetch_weather(self, city: str, days: int) -> Dict:
        """获取天气数据"""
        response = await self.session.get(
            f"{self.base_url}/forecast",
            params={
                'city': city,
                'days': days,
                'units': self.units
            }
        )
        response.raise_for_status()
        return response.json()
    
    def format_result(self, data: Dict, city: str, days: int) -> Dict[str, Any]:
        """格式化天气结果"""
        return {
            'city': city,
            'units': self.units,
            'forecast_days': days,
            'current': {
                'temperature': data['current']['temp'],
                'condition': data['current']['condition'],
                'humidity': data['current']['humidity'],
                'wind_speed': data['current']['wind_speed']
            },
            'forecast': [
                {
                    'date': day['date'],
                    'high': day['max_temp'],
                    'low': day['min_temp'],
                    'condition': day['condition'],
                    'precipitation': day.get('precipitation', 0)
                }
                for day in data['forecast'][:days]
            ]
        }
    
    def validate_input(self, city: str, days: int):
        """验证输入参数"""
        if not city or not city.strip():
            raise ValidationError("City name is required")
        
        if not 1 <= days <= 7:
            raise ValidationError("Days must be between 1 and 7")
```

### 3. 技能测试

```python
# skills/weather_skill/tests/test_main.py
import pytest
from unittest.mock import AsyncMock, patch
from ..main import WeatherSkill, WeatherAPIError, ValidationError

class TestWeatherSkill:
    """天气技能测试"""
    
    @pytest.fixture
    def skill_config(self):
        return {'api_key': 'test_key'}
    
    @pytest.fixture
    async def skill(self, skill_config):
        """创建技能实例"""
        s = WeatherSkill(skill_config)
        await s.initialize()
        yield s
        await s.cleanup()
    
    @pytest.mark.asyncio
    async def test_valid_city_query(self, skill):
        """测试有效城市查询"""
        mock_response = {
            'current': {'temp': 25, 'condition': 'Sunny', 'humidity': 60, 'wind_speed': 10},
            'forecast': [
                {'date': '2024-01-01', 'max_temp': 28, 'min_temp': 20, 'condition': 'Sunny'}
            ]
        }
        
        with patch.object(skill.session, 'get', return_value=AsyncMock(json=AsyncMock(return_value=mock_response))):
            result = await skill.execute('Beijing', days=1)
            
            assert result['city'] == 'Beijing'
            assert result['current']['temperature'] == 25
            assert len(result['forecast']) == 1
    
    @pytest.mark.asyncio
    async def test_invalid_city(self, skill):
        """测试无效城市名"""
        with pytest.raises(ValidationError, match="City name is required"):
            await skill.execute('', days=1)
    
    @pytest.mark.asyncio
    async def test_invalid_days(self, skill):
        """测试无效天数"""
        with pytest.raises(ValidationError, match="Days must be between 1 and 7"):
            await skill.execute('Beijing', days=10)
    
    @pytest.mark.asyncio
    async def test_api_error(self, skill):
        """测试 API 错误处理"""
        with patch.object(skill.session, 'get', side_effect=Exception("API Error")):
            with pytest.raises(WeatherAPIError):
                await skill.execute('Beijing', days=1)
    
    @pytest.mark.asyncio
    async def test_multiple_days(self, skill):
        """测试多日预报"""
        mock_response = {
            'current': {'temp': 25, 'condition': 'Sunny', 'humidity': 60, 'wind_speed': 10},
            'forecast': [
                {'date': f'2024-01-0{i}', 'max_temp': 28, 'min_temp': 20, 'condition': 'Sunny'}
                for i in range(1, 8)
            ]
        }
        
        with patch.object(skill.session, 'get', return_value=AsyncMock(json=AsyncMock(return_value=mock_response))):
            result = await skill.execute('Beijing', days=7)
            
            assert len(result['forecast']) == 7
```

### 4. 技能文档

```markdown
# 天气查询技能

## 描述
查询指定城市的当前天气和预报信息。

## 配置

```yaml
api_key: "your_weather_api_key"  # 必需
base_url: "https://api.weather.com"  # 可选，默认值
units: "metric"  # 可选，metric 或 imperial
```

## 输入

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| city | string | 是 | 城市名称 |
| days | integer | 否 | 预报天数（1-7），默认 3 |

## 输出

```json
{
  "city": "Beijing",
  "units": "metric",
  "forecast_days": 3,
  "current": {
    "temperature": 25,
    "condition": "Sunny",
    "humidity": 60,
    "wind_speed": 10
  },
  "forecast": [
    {
      "date": "2024-01-01",
      "high": 28,
      "low": 20,
      "condition": "Sunny",
      "precipitation": 0
    }
  ]
}
```

## 示例

### Python
```python
from openclaw import Client

client = Client()
result = await client.skills.weather_query.execute(
    city='Beijing',
    days=3
)
print(result)
```

### 自然语言
```
查询北京未来 3 天的天气
```

## 错误处理

| 错误类型 | 描述 | 处理建议 |
|---------|------|---------|
| ValidationError | 参数验证失败 | 检查输入参数 |
| WeatherAPIError | API 调用失败 | 检查网络和 API 密钥 |
| SkillExecutionError | 执行失败 | 查看日志详情 |

## 依赖

- httpx
- openclaw

## 作者

Your Name <your.email@example.com>

## 许可证

MIT
```

### 5. 技能发布

```yaml
# skill.yaml - 技能发布配置
name: weather_skill
version: 1.0.0
description: 天气查询技能
author: Your Name
license: MIT

repository:
  type: git
  url: https://github.com/yourname/weather_skill

dependencies:
  - httpx>=0.24.0
  - openclaw>=1.0.0

entry_point: weather_skill.main:WeatherSkill

keywords:
  - weather
  - forecast
  - tool
```

## 最佳实践

### 1. 技能设计原则

```python
# SOLID 原则在技能开发中的应用

# 单一职责原则
class WeatherSkill(Skill):
    """只负责天气查询"""
    pass

# 开闭原则
class SearchSkill(Skill):
    """支持多种搜索引擎"""
    def __init__(self, engine='google'):
        self.engine = self.get_engine(engine)
    
    def get_engine(self, name):
        # 可以添加新引擎而不修改现有代码
        engines = {
            'google': GoogleEngine(),
            'bing': BingEngine(),
            'baidu': BaiduEngine()
        }
        return engines.get(name, GoogleEngine())

# 依赖倒置原则
class NotificationSkill(Skill):
    """依赖抽象而非具体实现"""
    def __init__(self, sender: MessageSender):
        self.sender = sender  # 依赖接口
```

### 2. 错误处理

```python
# 完善的错误处理

class SkillError(Exception):
    """技能基础异常"""
    pass

class ValidationError(SkillError):
    """验证错误"""
    pass

class ExecutionError(SkillError):
    """执行错误"""
    pass

class ExternalAPIError(SkillError):
    """外部 API 错误"""
    def __init__(self, message, status_code=None, retry_after=None):
        super().__init__(message)
        self.status_code = status_code
        self.retry_after = retry_after

# 使用示例
class MySkill(Skill):
    async def execute(self, **kwargs):
        try:
            # 参数验证
            self.validate(kwargs)
            
            # 执行业务逻辑
            result = await self.do_work(kwargs)
            
            return result
            
        except ValidationError as e:
            # 用户错误，直接抛出
            raise
        except ExternalAPIError as e:
            # 外部错误，尝试重试
            if e.retry_after:
                await asyncio.sleep(e.retry_after)
                return await self.execute(**kwargs)
            raise
        except Exception as e:
            # 未知错误，记录日志
            logger.error(f"Unexpected error: {e}")
            raise ExecutionError(f"Execution failed: {e}")
```

### 3. 性能优化

```python
# 性能优化技巧

class OptimizedSkill(Skill):
    def __init__(self, config):
        super().__init__(config)
        # 使用连接池
        self.session = httpx.AsyncClient(
            limits=httpx.Limits(max_connections=100),
            timeout=30.0
        )
        # 使用缓存
        self.cache = TTLCache(maxsize=1000, ttl=300)
    
    async def execute(self, **kwargs):
        # 检查缓存
        cache_key = self.get_cache_key(kwargs)
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # 并发请求
        results = await asyncio.gather(
            self.fetch_data1(kwargs),
            self.fetch_data2(kwargs),
            self.fetch_data3(kwargs)
        )
        
        # 缓存结果
        result = self.merge_results(results)
        self.cache[cache_key] = result
        
        return result
```

## 优缺点对比

| 开发方式 | 优点 | 缺点 | 适用场景 |
|---------|------|------|---------|
| 遵循规范 | 易集成、可复用 | 初期学习成本 | 团队开发 |
| 自由开发 | 灵活快速 | 难维护、难复用 | 个人项目 |
| 完整测试 | 质量可靠 | 开发时间长 | 生产环境 |
| 最小实现 | 快速上线 | 风险较高 | 原型验证 |

## 总结

OpenClaw 技能开发是构建 AI 应用的基础。关键要点：

1. **遵循规范**：按照标准结构开发
2. **完善测试**：保证技能质量
3. **详细文档**：便于他人使用
4. **错误处理**：健壮的错误处理
5. **持续优化**：性能和体验优化

掌握技能开发，构建强大 AI 应用。
