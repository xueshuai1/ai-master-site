// Screen AI & Visual AI Agents - 知识文章

import type { BlogPost } from './blog-types';

export const blog: BlogPost = {
  id: "blog-072",
  author: "AI Master",
  title: "Screen AI 与视觉 Agent 全景解析：从 Computer Use 到 Omi，AI 终于「看到」了世界",
  category: "agent",
  tags: ["Screen AI", "Computer Use", "视觉 Agent", "Omi", "GUI Agent", "多模态", "桌面自动化", "Anthropic", "2026"],
  summary: "2026 年最激动人心的 AI 范式转变之一：AI 不再仅仅通过文本交互，而是直接「看」屏幕、理解 GUI、操控鼠标键盘。本文深度解析 Computer Use API、屏幕视觉 Agent 架构、Omi 等热门项目，并附 Python 实战代码。",
  date: "2026-04-24",
  readTime: 35,
content: [
    {
      title: "一、什么是 Screen AI？为什么它突然火了？",
      body: `Screen AI（屏幕 AI） 是指能够直接「看」和理解计算机屏幕截图、GUI 界面，并据此执行操作的 AI 系统。

与传统 AI Agent 不同，Screen AI 不需要 API 接口、不需要结构化数据——它像人类一样，通过视觉观察屏幕来理解当前状态，然后通过模拟鼠标键盘操作来完成任务。

2026 年 4 月，Screen AI 迎来爆发式增长：

- Anthropic Computer Use：Claude 模型获得直接操控计算机的能力
- Omi（BasedHardware/omi）：12K+ stars 的开源项目，「AI that sees your screen, listens to your conversations」
- Desktop Control 工具链：OpenClaw、Playwright Agent 等项目将 Screen AI 推向桌面
- GitHub Trending：多个 Screen AI 相关项目进入周榜

这个范式之所以重要，是因为它绕过了 API 依赖——任何有 GUI 的软件，理论上都可以被 Screen AI 操控。`
    },
    {
      title: "二、Screen AI 的技术架构",
      body: `Screen AI Agent 的核心架构可以分为四个模块：视觉感知、状态理解、动作规划、执行反馈。`,
      mermaid: `graph TD
    A[屏幕截图] --> B[视觉感知模块]
    B --> C[GUI 元素识别]
    C --> D[状态理解引擎]
    D --> E{决策：下一步操作}
    E --> F[点击按钮]
    E --> G[输入文本]
    E --> H[滚动页面]
    E --> I[等待/重试]
    F --> J[执行层]
    G --> J
    H --> J
    I --> J
    J --> K[截图验证]
    K --> D
    class K s4
    class J s3
    class D s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f,color:#f1f5f9
    classDef s1 fill:#1e3a5f,color:#f1f5f9
    classDef s2 fill:#1e3a5f,color:#f1f5f9
    classDef s3 fill:#1e3a5f,color:#f1f5f9
    classDef s4 fill:#1e3a5f,color:#f1f5f9`
    },
    {
      title: "三、核心模块深度解析",
      body: `### 3.1 视觉感知：从截图到结构化理解

Screen AI 的第一步是获取屏幕信息。常见方式包括：

1. 全屏幕截图：最直接的方式，截取整个屏幕像素
2. 区域截图：只截取感兴趣的窗口区域，减少 token 消耗
3. Accessibility Tree：利用 OS 无障碍 API 获取结构化的 UI 元素树
4. DOM 快照：对于浏览器场景，直接获取 DOM 结构

其中，截图方式适合跨平台通用场景，而 Accessibility Tree 和 DOM 快照则提供更精准的结构化信息。

### 3.2 状态理解：从像素到语义

视觉模型（如 Claude Vision API、GPT-4V、Qwen-VL）将截图转换为结构化理解：

### 3.3 动作规划：从语义到操作指令

理解屏幕状态后，Agent 需要决定下一步操作：

| 操作类型 | 适用场景 | 实现方式 |
|----------|----------|----------|
| 点击（Click） | 按钮、链接、菜单 | pyautogui.click(x, y) |
| 输入（Type） | 表单、搜索框、聊天 | pyautogui.typewrite(text) |
| 滚动（Scroll） | 长页面、列表 | pyautogui.scroll(n) |
| 拖拽（Drag） | 文件管理、绘图 | pyautogui.dragTo(x, y) |
| 快捷键（Hotkey） | 系统级操作 | pyautogui.hotkey('ctrl', 'c') |

### 3.4 执行验证闭环

Screen AI 最关键的创新是闭环验证：执行操作后，立即截图对比，确认操作是否成功。`,
      mermaid: `sequenceDiagram
    participant U as 用户指令
    participant A as Screen Agent
    participant V as 视觉模型
    participant E as 执行引擎
    participant S as 屏幕

    U->>A: "帮我删除最近一封邮件"
    A->>V: 截图 + 分析当前状态
    V->>A: "在 Gmail 收件箱，找到目标邮件"
    A->>E: click(邮件位置)
    E->>S: 模拟点击
    S->>A: 新截图
    A->>V: 新截图 + 分析
    V->>A: "邮件已打开，看到删除按钮"
    A->>E: click(删除按钮)
    E->>S: 模拟点击
    S->>A: 新截图
    A->>V: 确认邮件已删除
    V->>A: "邮件已移至垃圾箱"
    A->>U: 返回结果`,
      },
    {
      title: "四、实战一：用 Python 构建 Screen AI Agent",
      body: `下面是一个完整的 Screen AI Agent 实现，它能够截图、调用视觉模型分析、并执行操作。`,
      code: [
        {
          lang: "python",
          code: `import base64
import time
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum
import pyautogui
import requests


class ActionType(Enum):
    CLICK = "click"
    TYPE = "type"
    SCROLL = "scroll"
    WAIT = "wait"
    HOTKEY = "hotkey"


@dataclass
class ScreenState:
    """屏幕状态的抽象表示"""
    screenshot_b64: str
    description: str = ""
    detected_elements: list = field(default_factory=list)
    timestamp: float = field(default_factory=time.time)

    def age_seconds(self) -> float:
        return time.time() - self.timestamp


@dataclass
class ScreenAction:
    """定义一个屏幕操作"""
    action_type: ActionType
    x: Optional[int] = None
    y: Optional[int] = None
    text: Optional[str] = None
    keys: Optional[list] = None
    scroll_amount: Optional[int] = None

    def execute(self) -> bool:
        """执行操作并返回结果"""
        try:
            if self.action_type == ActionType.CLICK:
                pyautogui.click(self.x, self.y)
            elif self.action_type == ActionType.TYPE:
                pyautogui.typewrite(self.text)
            elif self.action_type == ActionType.SCROLL:
                pyautogui.scroll(self.scroll_amount)
            elif self.action_type == ActionType.HOTKEY:
                pyautogui.hotkey(*self.keys)
            elif self.action_type == ActionType.WAIT:
                time.sleep(1)
            return True
        except Exception as e:
            print(f"操作执行失败: {e}")
            return False


class ScreenAIAgent:
    """Screen AI Agent 核心类"""

    def __init__(self, vision_api_url: str, api_key: str):
        self.vision_api_url = vision_api_url
        self.headers = {"Authorization": f"Bearer {api_key}"}
        self.history: list[ScreenState] = []

    def capture_screen(self) -> ScreenState:
        """截取屏幕并创建状态"""
        screenshot = pyautogui.screenshot()
        buffered = base64.b64encode(
            screenshot.tobytes()
        ).decode('utf-8')
        state = ScreenState(screenshot_b64=buffered)
        self.history.append(state)
        return state

    def analyze(self, state: ScreenState, goal: str) -> dict:
        """调用视觉模型分析屏幕状态"""
        payload = {
            "image": state.screenshot_b64,
            "goal": goal,
            "history": [s.description for s in self.history[-5:]]
        }
        response = requests.post(
            f"{self.vision_api_url}/analyze",
            headers=self.headers,
            json=payload
        )
        return response.json()

    def plan_and_execute(self, goal: str, max_steps: int = 10) -> str:
        """完整的 Screen AI 执行循环"""
        for step in range(max_steps):
            state = self.capture_screen()
            analysis = self.analyze(state, goal)
            state.description = analysis.get("description", "")
            
            if analysis.get("completed", False):
                return f"✅ 任务完成（{step + 1}步）"
            
            action_data = analysis.get("next_action", {})
            action = ScreenAction(
                action_type=ActionType(action_data.get("type", "wait")),
                x=action_data.get("x"),
                y=action_data.get("y"),
                text=action_data.get("text"),
                keys=action_data.get("keys"),
                scroll_amount=action_data.get("scroll")
            )
            
            success = action.execute()
            if not success:
                return f"❌ 第 {step + 1} 步执行失败"
            
            time.sleep(0.5)
        
        return "⏱️ 达到最大步数限制"


# 使用示例
agent = ScreenAIAgent(
    vision_api_url="http://localhost:8080",
    api_key="your-api-key"
)
result = agent.plan_and_execute("在浏览器中搜索 'AI Agent 最新进展'")
print(result)`
        }
      ]
    },
    {
      title: "五、实战二：带自我修正的 Screen AI Agent",
      body: `更高级的 Screen AI Agent 应该具备自我修正能力——当操作没有达到预期时，能够自动调整策略。`,
      code: [
        {
          lang: "python",
          code: `from dataclasses import dataclass, field
from typing import Optional
import hashlib
import json
import time


@dataclass
class ExecutionStep:
    """执行步骤记录"""
    step_num: int
    screenshot_hash: str
    action_taken: str
    expected_result: str
    actual_result: str
    success: bool
    timestamp: float = field(default_factory=time.time)


@dataclass
class CorrectionStrategy:
    """自我修正策略"""
    max_retries: int = 3
    retry_delay: float = 1.0
    fallback_actions: list = field(default_factory=list)
    learn_from_failures: bool = True


class SelfCorrectingScreenAgent:
    """带自我修正能力的 Screen AI Agent"""

    def __init__(self):
        self.execution_log: list[ExecutionStep] = []
        self.correction = CorrectionStrategy()
        self.failure_patterns: dict = {}

    def execute_with_correction(
        self,
        action: str,
        goal: str,
        verify_fn: callable
    ) -> bool:
        """执行操作，失败时自动修正"""
        for attempt in range(self.correction.max_retries):
            result = self._perform_action(action)
            
            screenshot = self._capture_screenshot()
            screenshot_hash = hashlib.md5(
                screenshot.tobytes()
            ).hexdigest()
            
            expected = f"操作后屏幕应显示: {goal}"
            actual = verify_fn(screenshot)
            success = actual == goal
            
            step = ExecutionStep(
                step_num=attempt,
                screenshot_hash=screenshot_hash,
                action_taken=action,
                expected_result=expected,
                actual_result=actual,
                success=success
            )
            self.execution_log.append(step)
            
            if success:
                return True
            
            if self.correction.learn_from_failures:
                pattern_key = f"{action}|{actual}"
                self.failure_patterns[pattern_key] = (
                    self.failure_patterns.get(pattern_key, 0) + 1
                )
            
            if attempt < self.correction.max_retries - 1:
                corrected_action = self._plan_correction(
                    action, actual, goal
                )
                if corrected_action:
                    action = corrected_action
                    print(f"  → 修正: {action}")
                time.sleep(self.correction.retry_delay)
        
        return False

    def _plan_correction(
        self,
        original_action: str,
        actual_state: str,
        expected_state: str
    ) -> Optional[str]:
        """根据失败情况规划修正操作"""
        if "click" in original_action:
            return f"click(备选坐标) for {original_action}"
        if "not visible" in actual_state:
            return f"scroll({{amount: 500}}) then {original_action}"
        if "loading" in actual_state:
            return f"wait(2s) then {original_action}"
        if "popup" in actual_state or "dialog" in actual_state:
            return "close_popup() then " + original_action
        return None

    def get_failure_report(self) -> dict:
        """生成失败分析报告"""
        total = len(self.execution_log)
        failed = sum(1 for s in self.execution_log if not s.success)
        return {
            "total_steps": total,
            "success_rate": round((total - failed) / total * 100, 1),
            "common_failures": sorted(
                self.failure_patterns.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5],
            "recent_log": [
                {"step": s.step_num, "action": s.action_taken, "success": s.success}
                for s in self.execution_log[-10:]
            ]
        }


# 使用示例
agent = SelfCorrectingScreenAgent()

def verify_search_result(screenshot) -> str:
    return "搜索结果显示"

result = agent.execute_with_correction(
    action="click(搜索按钮)",
    goal="显示搜索结果",
    verify_fn=verify_search_result
)
print(f"执行结果: {'成功' if result else '失败'}")
print(json.dumps(agent.get_failure_report(), indent=2))`
        }
      ]
    },
    {
      title: "六、Screen AI vs 传统 API 集成：全面对比",
      body: `Screen AI 和传统 API 集成各有优劣，理解它们的本质区别对于技术选型至关重要。`,
      table: {
        headers: ["维度", "Screen AI", "传统 API 集成", "对比结论"],
        rows: [
          ["适用性", "任何有 GUI 的软件", "需要开放 API 的软件", "Screen AI 适用范围更广"],
          ["开发成本", "训练视觉模型 + 坐标映射", "阅读 API 文档 + 编写调用代码", "API 集成开发更快"],
          ["稳定性", "受 UI 变化影响大", "API 版本稳定则稳定", "API 集成更稳定"],
          ["执行速度", "需要截图+分析，较慢", "直接调用，快", "API 集成速度更快"],
          ["安全性", "模拟人类操作，天然安全", "需要管理 API 密钥", "Screen AI 更安全"],
          ["可扩展性", "训练一次可跨平台", "每个平台需单独适配", "Screen AI 跨平台更好"],
          ["维护成本", "UI 大改时需要重新训练", "API 变更时需要更新代码", "视场景而定"],
          ["人类体验", "你可以看着 AI 操作", "后台静默执行", "Screen AI 更直观"],
        ]
      }
    },
    {
      title: "七、热门 Screen AI 项目对比",
      body: `2026 年 4 月，多个 Screen AI 相关项目在 GitHub 上获得关注。以下是主要项目的对比：

| 项目 | Stars | 定位 | 核心特点 |
|------|-------|------|----------|
| Omi | 12K+ | 屏幕+语音 AI 助手 | 看到屏幕、听到对话、给出建议 |
| Anthropic Computer Use | 内置功能 | Claude 操控计算机 | 官方支持、可靠性高 |
| OpenClaw Desktop Control | 社区项目 | 桌面自动化 | 集成 OpenClaw Agent |
| Claude-Mem | 66K+ | 记忆管理（配合 Screen AI） | 记住屏幕操作历史 |
| Playwright Agent | 社区项目 | 浏览器自动化 | 精准 DOM 操作 + 视觉验证 |

其中 Omi 是本周 GitHub Trending 的新星，它结合了屏幕视觉和语音对话两种输入方式，代表了 Screen AI 向「多模态感知」演进的方向。`
    },
    {
      title: "八、Screen AI 的安全风险与防护",
      body: `Screen AI 虽然强大，但也带来了独特的安全挑战：

### 8.1 主要风险

1. 屏幕内容泄露：截图可能包含密码、个人信息、机密数据
2. 误操作风险：AI 可能点击错误的按钮，导致不可逆操作
3. 视觉对抗攻击：恶意网页可能通过特殊图像误导视觉模型
4. 权限提升：Screen AI 通常拥有系统级输入权限

### 8.2 防护策略`,
      mermaid: `graph LR
    A[用户指令] --> B{安全检查}
    B -->|通过| C[执行操作]
    B -->|可疑| D[请求人类确认]
    C --> E{结果验证}
    E -->|正常| F[继续]
    E -->|异常| G[撤销操作]
    G --> D
    D --> H[人类批准/拒绝]
    H -->|批准| C
    H -->|拒绝| I[中止]
    class H s3
    class D s2
    class B s1
    class A s0
    classDef s0 fill:#1e3a5f,color:#f1f5f9
    classDef s1 fill:#1e3a5f,color:#f1f5f9
    classDef s2 fill:#1e3a5f,color:#f1f5f9
    classDef s3 fill:#1e3a5f,color:#f1f5f9`
    },
    {
      title: "九、2026 年 Screen AI 的未来趋势",
      body: `展望未来，Screen AI 有几个明确的发展方向：

### 9.1 多模态融合
Screen AI 将不再局限于视觉，而是融合：
- 听觉：听取系统声音、语音指令
- 触觉：感知鼠标阻力、键盘反馈
- 语义：结合系统日志、进程信息

Omi 项目已经迈出了第一步：「AI that sees your screen, listens to your conversations」。

### 9.2 从「模仿人类」到「超越人类」
当前 Screen AI 模拟人类的鼠标键盘操作。未来它将：
- 直接读取系统内存（比截图更快）
- 并行操作多个窗口（人类做不到的）
- 在后台静默执行（不需要屏幕显示）

### 9.3 标准化协议
类似于 MCP 标准化了 Agent 与工具的交互，Screen AI 领域也需要标准化：
- 屏幕描述语言：统一描述 GUI 元素的方式
- 操作协议：标准化的点击、输入、滚动指令
- 验证标准：统一的操作成功/失败判定

### 9.4 与 LLM 的深度集成
未来的 LLM 将内置 Screen AI 能力：
- 原生视觉理解（不仅是图片，还包括动态屏幕）
- 空间推理（理解 GUI 元素的层次关系）
- 时间推理（理解动画、加载状态、过渡效果）

总结：Screen AI 正在从「实验性技术」快速走向「主流生产力工具」。2026 年将是 Screen AI 的爆发年，值得每个 AI 从业者关注。`
    }
  ]
};
