import { Article } from '../knowledge';

export const article: Article = {
  id: "agent-028",
  title: "Computer Use 与屏幕理解：AI Agent 的视觉交互基础",
  category: "agent",
  tags: ["Computer Use", "屏幕理解", "视觉 Agent", "GUI 交互", "多模态", "Agent 架构"],
  summary: "Computer Use 让 AI Agent 从「只能调用 API」进化为「能看屏幕、能点鼠标、能敲键盘」。本文系统讲解屏幕理解的技术原理、视觉 grounding 方法、action 执行机制和安全边界设计。",
  date: "2026-04-28",
  readTime: "28 min",
  level: "进阶",
  content: [
    {
      title: "1. 什么是 Computer Use？从 API 交互到视觉交互的范式跃迁",
      body: `Computer Use（计算机使用）是 AI Agent 领域的一项核心能力：让 AI 模型通过视觉感知计算机屏幕内容，理解界面布局和元素含义，并通过鼠标点击、键盘输入等方式与 GUI 进行交互。

**这个概念的突破性在于**：传统 AI Agent 只能通过 API 与系统交互——你必须为每个操作编写专门的 API 接口。而 Computer Use 让 Agent 能够像人类用户一样，直接操作任何有图形界面的软件，不需要预先编写 API。

**举个具体例子**：如果你想让 AI 帮你填写一份在线表单，传统方式需要你为表单的每个字段编写 API 调用代码。而 Computer Use 方式下，AI 只需要「看」到表单页面，识别出各个输入框的位置和含义，然后模拟鼠标点击和键盘输入即可完成填写——无需任何额外的 API 开发。

这种能力的核心挑战在于：计算机屏幕上的像素本身没有结构化语义。AI 需要从一张图片中理解「这是一个按钮」「那是一个输入框」「这里有一个下拉菜单」，并且知道每个元素的可操作区域在哪里。这就是所谓的视觉 grounding（视觉定位）问题。

Computer Use 的出现标志着 AI Agent 从「工具调用者」向「界面操作者」的转变。它不是替代 API，而是在 API 不存在或不方便时的补充方案。`,
      mermaid: `graph TD
    A["传统 API Agent"] --> B["需要开发者编写接口"]
    B --> C["只能操作有 API 的系统"]
    D["Computer Use Agent"] --> E["通过视觉理解界面"]
    E --> F["模拟人类操作行为"]
    F --> G["可以操作任何 GUI 软件"]
    H["混合模式"] --> I["优先使用 API"]
    I --> J["API 不可用时回退到视觉操作"]`,
      tip: "Computer Use 不是让 AI「替代人类操作电脑」，而是让 AI 具备与人类相同的交互能力——看到什么就能操作什么，不需要开发者为每个软件写专用接口。",
    },
    {
      title: "2. 屏幕理解的技术架构：从像素到语义",
      body: `Computer Use 的核心技术栈可以分解为三个层次：感知层（看懂屏幕）、理解层（理解意图）和执行层（采取行动）。

感知层负责将屏幕像素转化为模型可以处理的信息。最简单的方式是直接截图——将整个屏幕或活动窗口截屏为一张图片。但这种方式效率低且包含大量无关信息。更先进的方法包括：区域截图（只截取当前关注的 UI 区域）、增量更新（只传输发生变化的屏幕区域）、以及 DOM 提取（对于网页应用，直接提取 HTML 结构而非截图）。

理解层是 Computer Use 的大脑。它需要完成两项任务：UI 元素识别（识别屏幕上有哪些可交互元素，如按钮、输入框、链接）和语义理解（理解每个元素的含义和当前状态）。多模态大模型（如 **GPT-4**o、**Claude** 的 vision 能力）可以在单步中同时完成这两项任务——输入一张截图，输出元素列表及其位置坐标。

执行层将理解层的决策转化为实际操作。关键的技术挑战是坐标映射：模型输出的是像素坐标，需要转换为操作系统层面的鼠标位置或按键事件。此外，执行层还需要处理操作反馈——点击后屏幕是否发生了变化？操作是否成功？是否需要重试？

这三种层次的协同工作形成了一个闭环：感知 → 理解 → 执行 → 观察变化 → 重新感知。这个循环就是 Computer Use Agent 的基本工作模式。`,
      mermaid: `flowchart TD
    subgraph 感知层
    A["屏幕截图"] --> B["图像预处理"]
    B --> C["多模态编码"]
    end
    subgraph 理解层
    C --> D["UI 元素检测"]
    D --> E["语义标注"]
    E --> F["操作决策"]
    end
    subgraph 执行层
    F --> G["坐标映射"]
    G --> H["模拟输入"]
    H --> A
    end`,
      table: {
        headers: ["技术层", "核心任务", "输入", "输出", "关键技术"],
        rows: [
          ["感知层", "将屏幕转化为可处理数据", "屏幕像素", "图像张量", "截图、区域裁剪、增量更新"],
          ["理解层", "识别元素并理解含义", "图像张量 + 任务描述", "元素列表 + 操作指令", "多模态大模型、目标检测"],
          ["执行层", "将指令转化为实际操作", "操作指令 + 坐标", "鼠标/键盘事件", "坐标映射、输入模拟、反馈检测"],
        ],
      },
      code: [
        {
          lang: "python",
          code: `# 屏幕理解的核心流程示例
import mss  # 高效截图库
from PIL import Image
import base64
import io

def capture_and_encode_screen(region=None):
    """截取屏幕并编码为 base64，供多模态模型处理"""
    with mss.mss() as sct:
        # 如果没有指定区域，截取整个主显示器
        if region is None:
            monitor = sct.monitors[1]  # 主显示器
        else:
            monitor = {"top": region[1], "left": region[0], 
                       "width": region[2], "height": region[3]}
        
        # 高效截图（比 PIL ImageGrab 快 3-5 倍）
        screenshot = sct.grab(monitor)
        img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
        
        # 压缩并编码为 base64
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        return base64.b64encode(buffer.getvalue()).decode("utf-8")

# 使用多模态模型理解屏幕内容
def understand_screen(image_base64: str, task: str) -> dict:
    """调用多模态模型理解屏幕并返回操作决策"""
    # 实际使用时替换为真实的 API 调用
    prompt = f"""你正在操作一个计算机界面。请分析以下截图并告诉我：
1. 当前界面上有哪些可交互元素？
2. 为了完成以下任务，下一步应该做什么？
任务：{task}"""
    
    # 返回格式化的操作决策
    return {
        "elements": [{"type": "button", "text": "提交", "bbox": [100, 200, 180, 240]}],
        "next_action": {"type": "click", "target": "提交按钮", "coords": [140, 220]}
    }`,
        },
      ],
    },
    {
      title: "3. 视觉 Grounding：如何精确定位 UI 元素",
      body: `视觉 Grounding（视觉定位）是 Computer Use 中最关键也最具挑战的技术环节。它的核心问题是：如何让模型准确地指出屏幕上某个元素在哪里？

目前业界有三种主流的 Grounding 方法，各有优劣。

基于边界框（Bounding Box）的方法是最直接的：模型输出元素的矩形边界框坐标 [x1, y1, x2, y2]。这种方法的优点是实现简单、兼容性好；缺点是精度有限——边界框可能包含不必要的区域，对于小元素（如复选框）尤其不准确。

基于坐标点（Point-based）的方法让模型直接输出一个点击坐标 [x, y]。这种方法精度更高，适合「点击某个位置」的操作；缺点是模型需要理解「点击区域」和「元素边界」的区别——比如点击按钮时，应该点击按钮的中心还是任意位置？

基于标记（Marker-based）的方法是一种更先进的方案：在截图上为每个可交互元素叠加半透明标记（如数字编号或彩色框），模型只需要输出标记编号即可。这种方法大幅降低了模型的理解难度，因为模型不需要精确输出坐标，只需要识别标记。**Anthropic** 的 **Claude** Computer Use 和 **OpenAI** 的 Operator 都采用了类似的思路。

在实际系统中，通常会组合使用多种方法。比如先用边界框方法粗定位元素区域，再用坐标点方法精确到具体点击位置。对于密集的 UI 元素（如表格中的单元格），标记方法更为可靠。

Grounding 的另一个重要维度是坐标系转换。模型输出的坐标是基于截图的像素坐标，需要转换为操作系统的屏幕坐标。这涉及到多个因素：显示器的缩放比例（如 Retina 显示屏的 2x 缩放）、多显示器环境下的坐标偏移、以及截图区域相对于全屏的偏移量。`,
      code: [
        {
          lang: "python",
          code: `# 视觉 Grounding 的三种方法对比实现
from typing import Tuple, List
from dataclasses import dataclass

@dataclass
class UIElement:
    """UI 元素的数据结构"""
    element_type: str  # button, input, checkbox, link, etc.
    text: str          # 元素的文本内容
    bbox: Tuple[int, int, int, int]  # [x1, y1, x2, y2]
    confidence: float  # 置信度

def grounding_by_bbox(elements: List[UIElement], target_text: str) -> Tuple[int, int]:
    """基于边界框的 Grounding：找到目标元素的中心点"""
    for elem in elements:
        if target_text.lower() in elem.text.lower():
            x1, y1, x2, y2 = elem.bbox
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            return (center_x, center_y)
    raise ValueError(f"未找到包含 '{target_text}' 的元素")

def grounding_by_marker(screenshot_with_markers: str, marker_id: int) -> Tuple[int, int]:
    """基于标记的 Grounding：通过标记 ID 定位点击位置
    这种方法需要预先在截图上叠加标记，然后查找标记的中心位置。
    """
    # 实际实现需要解析截图上的标记位置
    # 这里简化为从预定义的标记映射中查找
    marker_positions = {
        1: (150, 200),  # 标记 1 对应提交按钮中心
        2: (300, 200),  # 标记 2 对应取消按钮中心
        3: (150, 250),  # 标记 3 对应输入框中心
    }
    return marker_positions.get(marker_id, (0, 0))

def coordinate_transform(pixel_coords: Tuple[int, int], 
                         screenshot_offset: Tuple[int, int],
                         display_scale: float = 1.0) -> Tuple[int, int]:
    """将截图像素坐标转换为操作系统屏幕坐标"""
    px, py = pixel_coords
    ox, oy = screenshot_offset
    # 考虑显示器缩放（如 Retina 的 2x）
    return (int(px / display_scale) + ox, int(py / display_scale) + oy)`,
        },
      ],
    },
    {
      title: "4. Action 执行机制：从决策到操作",
      body: `理解了屏幕内容并做出决策后，Computer Use Agent 需要将决策转化为实际操作。这个环节涉及操作系统层面的输入模拟。

在 Linux 系统上，最常用的工具是 Xdotool 和 PyAutoGUI。Xdotool 通过 X11 协议发送鼠标和键盘事件，支持窗口管理、窗口聚焦、和精确的坐标点击。PyAutoGUI 则提供了更友好的 Python API，支持跨平台操作，并且内置了图像识别功能（可以在屏幕上搜索特定图像然后点击）。

在 macOS 上，可以通过 AppleScript 或 Python 的 quartz 库来实现输入模拟。AppleScript 提供了系统级的自动化能力，可以控制几乎所有 macOS 应用。quartz 库则允许直接发送底层输入事件。

在 Windows 上，pyautogui 和 win32api 是主要选择。pyautogui 同样跨平台，而 win32api 提供了更底层的 Windows API 访问。

无论使用哪种工具，Action 执行都需要注意几个关键问题。首先是时序控制——操作之间需要适当的延迟，让界面有时间响应。点击按钮后立即尝试读取结果往往会导致错误，因为页面可能还在加载。其次是焦点管理——确保目标窗口处于活动状态，否则输入事件可能发送到错误的窗口。最后是错误处理——操作可能失败（如元素被遮挡、窗口被移动），需要检测失败并尝试恢复。`,
      code: [
        {
          lang: "python",
          code: `# Computer Use Action 执行器
import pyautogui
import time
from typing import Tuple, Optional

class ComputerUseExecutor:
    """Computer Use 操作的执行引擎"""
    
    def __init__(self, delay: float = 0.5, safe_mode: bool = True):
        self.delay = delay  # 操作间隔延迟（秒）
        self.safe_mode = safe_mode  # 安全模式：操作前确认
    
    def click(self, x: int, y: int, button: str = 'left', clicks: int = 1) -> bool:
        """在指定坐标执行点击"""
        try:
            pyautogui.click(x, y, button=button, clicks=clicks)
            time.sleep(self.delay)  # 等待界面响应
            return True
        except Exception as e:
            print(f"点击失败: {e}")
            return False
    
    def type_text(self, text: str, interval: float = 0.05) -> bool:
        """模拟键盘输入文本"""
        try:
            pyautogui.write(text, interval=interval)
            time.sleep(self.delay)
            return True
        except Exception as e:
            print(f"输入失败: {e}")
            return False
    
    def press_key(self, key: str, modifiers: Optional[list] = None) -> bool:
        """按下指定按键（支持组合键）"""
        try:
            if modifiers:
                pyautogui.hotkey(*modifiers, key)
            else:
                pyautogui.press(key)
            time.sleep(self.delay)
            return True
        except Exception as e:
            print(f"按键失败: {e}")
            return False
    
    def scroll(self, clicks: int, x: Optional[int] = None, y: Optional[int] = None) -> bool:
        """滚动页面"""
        try:
            if x and y:
                pyautogui.scroll(clicks, x=x, y=y)
            else:
                pyautogui.scroll(clicks)
            time.sleep(self.delay)
            return True
        except Exception as e:
            print(f"滚动失败: {e}")
            return False
    
    def wait_for_change(self, timeout: float = 5.0, threshold: float = 0.01) -> bool:
        """等待屏幕发生变化（用于确认操作生效）"""
        import mss
        import numpy as np
        
        start = time.time()
        with mss.mss() as sct:
            monitor = sct.monitors[1]
            prev = np.array(sct.grab(monitor))
            
            while time.time() - start < timeout:
                time.sleep(0.3)
                curr = np.array(sct.grab(monitor))
                # 计算前后两帧的差异比例
                diff = np.abs(curr.astype(float) - prev.astype(float)).mean() / 255
                if diff > threshold:
                    return True  # 屏幕发生了变化
            
            return False  # 超时未检测到变化`,
        },
      ],
    },
    {
      title: "5. 不同交互范式的对比：何时用 Computer Use？",
      body: `Computer Use 不是万能的。理解它与其他交互范式的优缺点对比，有助于在正确的场景选择正确的方案。

API 集成是最传统的方案。优点是最稳定、速度最快、可靠性最高；缺点是需要开发者为每个操作编写接口，无法操作没有 API 的遗留系统。对于有良好 API 支持的现代软件，API 集成永远是首选。

RPA（机器人流程自动化）是 Computer Use 的前身。RPA 工具（如 UiPath、Automation Anywhere）通过录制和回放来实现自动化。优点是成熟稳定、有大量企业应用；缺点是规则驱动、缺乏灵活性，无法处理未预见的情况。

Computer Use 结合了 AI 的理解能力和 RPA 的操作能力。优点是可以操作任何有 GUI 的软件、无需预先编写接口、能够处理非标准情况；缺点是速度较慢（需要截图和理解）、可靠性不如 API（视觉识别可能出错）、成本较高（每次操作都需要调用大模型）。

混合策略是目前最实用的方案：优先使用 API，在 API 不可用或操作成本过高时回退到 Computer Use。这种策略兼顾了效率和灵活性。`,
      table: {
        headers: ["交互范式", "速度", "可靠性", "灵活性", "开发成本", "适用场景"],
        rows: [
          ["API 集成", "极快", "极高", "低（需预定义接口）", "高", "有 API 的现代软件"],
          ["RPA", "快", "高", "低（规则驱动）", "中", "标准化流程自动化"],
          ["Computer Use", "慢", "中", "极高（无需预定义）", "低", "无 API 的软件、临时任务"],
          ["混合策略", "可变", "高", "高", "中", "生产环境最佳实践"],
        ],
      },
      mermaid: `graph TD
    A["需要自动化操作"] --> B{"目标系统有 API?"}
    B -->|是| C["使用 API 集成"]
    B -->|否| D{"是标准化流程?"}
    D -->|是| E["使用 RPA"]
    D -->|否| F["使用 Computer Use"]
    C --> G["完成"]
    E --> G
    F --> H{"操作成功?"}
    H -->|否| I["回退到人工处理"]
    H -->|是| G`,
    },
    {
      title: "6. 安全边界与风险控制",
      body: `Computer Use 赋予了 AI 直接操作计算机的能力，这带来了显著的安全风险。设计安全的 Computer Use 系统需要考虑以下几个维度。

操作范围限制是最基础的安全措施。Agent 不应该有 unrestricted 的屏幕访问和操作权限。应该通过沙箱机制限制 Agent 只能操作特定的应用程序或窗口。例如，可以配置 Agent 只能操作浏览器窗口，不能访问文件系统或系统设置。

确认机制对于高风险操作至关重要。涉及数据删除、资金转移、敏感信息发送等操作时，应该要求用户确认。可以设计为：Agent 在执行高风险操作前暂停，向用户展示操作详情并等待确认。

审计日志记录了 Agent 的所有操作，包括截图、决策过程、执行的动作和执行结果。这不仅有助于调试，也是安全审计的重要依据。完整的审计日志应该包括时间戳、操作类型、目标元素、操作结果和前后屏幕截图。

异常检测可以识别 Agent 的异常行为模式。例如，如果 Agent 在短时间内尝试点击同一位置数十次，或者尝试访问非授权区域，系统应该自动暂停 Agent 并通知管理员。

数据隐私方面，截图可能包含敏感信息（如密码、个人数据）。需要确保截图数据在传输和处理过程中加密，并且不会被永久存储。对于处理敏感数据的场景，可以考虑使用本地部署的多模态模型而非云端 API。`,
    },
    {
      title: "7. 实战：构建一个简易的 Computer Use Agent",
      body: `下面我们通过一个完整的实战示例，展示如何构建一个能够理解屏幕并执行操作的 Computer Use Agent。这个示例将演示从截图到决策到执行的完整流程。

我们的目标是构建一个能够自动填写网页表单的 Agent。这个场景很有代表性：它需要识别表单元素、理解每个字段的含义、按正确顺序填写、并提交表单。`,
      code: [
        {
          lang: "python",
          code: `# 完整的 Computer Use Agent 实现
import mss
import pyautogui
import base64
import time
import json
from PIL import Image
from io import BytesIO
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class ScreenAction:
    """屏幕操作指令"""
    action_type: str  # click, type, scroll, press_key
    target: str       # 目标描述
    coords: Optional[tuple] = None
    text: Optional[str] = None
    key: Optional[str] = None

class ComputerUseAgent:
    """简易 Computer Use Agent"""
    
    def __init__(self, model_client, max_steps: int = 20):
        self.model_client = model_client  # 多模态模型客户端
        self.max_steps = max_steps
        self.history = []  # 操作历史
    
    def capture_screen(self) -> str:
        """截取当前屏幕并编码"""
        with mss.mss() as sct:
            screenshot = sct.grab(sct.monitors[1])
            img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=80)
            return base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    def decide_next_action(self, screen_b64: str, goal: str) -> ScreenAction:
        """调用多模态模型决定下一步操作"""
        prompt = f"""你是一个计算机操作助手。请分析当前屏幕截图，并决定下一步操作来完成以下目标：

目标：{goal}

请返回一个 JSON 对象，格式如下：
{{
    "action": "click" | "type" | "scroll" | "press_key" | "done",
    "target": "操作目标的描述",
    "coords": [x, y],  // 点击坐标（如果是 click 操作）
    "text": "要输入的文本",  // 如果是 type 操作
    "key": "按键名",  // 如果是 press_key 操作
    "reasoning": "为什么选择这个操作"
}}

重要规则：
1. 如果目标已完成，返回 action: "done"
2. 如果卡住了，描述你看到的问题
3. 每次只执行一个操作"""
        
        # 实际调用多模态模型 API
        response = self.model_client.analyze_image(screen_b64, prompt)
        result = json.loads(response)
        
        return ScreenAction(
            action_type=result["action"],
            target=result["target"],
            coords=tuple(result.get("coords", [])),
            text=result.get("text"),
            key=result.get("key")
        )
    
    def execute_action(self, action: ScreenAction) -> bool:
        """执行屏幕操作"""
        try:
            if action.action_type == "click" and action.coords:
                pyautogui.click(*action.coords)
            elif action.action_type == "type" and action.text:
                pyautogui.write(action.text, interval=0.05)
            elif action.action_type == "press_key" and action.key:
                pyautogui.press(action.key)
            elif action.action_type == "scroll":
                pyautogui.scroll(-3)  # 向下滚动
            elif action.action_type == "done":
                return True  # 任务完成
            
            time.sleep(0.8)  # 等待界面响应
            return True
        except Exception as e:
            print(f"操作执行失败: {e}")
            return False
    
    def run(self, goal: str) -> List[Dict]:
        """运行 Agent 完成目标"""
        self.history = []
        
        for step in range(self.max_steps):
            # 1. 感知：截取屏幕
            screen_b64 = self.capture_screen()
            
            # 2. 理解 + 规划：决定下一步
            action = self.decide_next_action(screen_b64, goal)
            
            # 记录决策过程
            step_record = {
                "step": step + 1,
                "action": action.action_type,
                "target": action.target,
                "success": False
            }
            
            # 3. 执行：执行操作
            if action.action_type == "done":
                step_record["success"] = True
                self.history.append(step_record)
                print(f"✅ 任务完成！共 {step + 1} 步")
                break
            
            success = self.execute_action(action)
            step_record["success"] = success
            self.history.append(step_record)
            
            if not success:
                print(f"⚠️ 第 {step + 1} 步操作失败")
        
        return self.history

# 使用示例
if __name__ == "__main__":
    # 假设有一个多模态模型客户端
    # agent = ComputerUseAgent(model_client=MyModelClient())
    # history = agent.run("在 Google 搜索 'AI Master' 并打开第一个结果")
    pass`,
        },
      ],
    },
    {
      title: "8. 总结与展望",
      body: `Computer Use 代表了 AI Agent 交互范式的重要演进方向。它让 AI 从「只能通过 API 交流」进化为「能像人一样看和操作界面」，大幅扩展了 AI Agent 的应用范围。

**核心要点回顾**：
- Computer Use 通过多模态视觉理解 + 输入模拟实现屏幕交互
- 视觉 Grounding 是核心技术，决定了操作的精确度
- 与 API 集成和 RPA 相比，Computer Use 提供了更高的灵活性但牺牲了部分速度和可靠性
- 混合策略（API 优先 + Computer Use 回退）是目前最实用的方案
- 安全边界和审计机制是生产环境不可或缺的组件

随着多模态模型能力的持续提升和屏幕理解技术的不断优化，Computer Use 将在越来越多的场景中发挥价值。它不会替代 API，而是与 API、RPA 等技术共同构成完整的 AI 自动化技术栈。

**未来发展方向包括**：更精确的细粒度 UI 理解（区分元素的子组件）、更快的实时处理能力（降低延迟）、更好的上下文保持（记住之前的操作状态）、以及更完善的异常恢复机制（自动从错误中恢复）。`,
      mermaid: `graph TD
    A["Computer Use"] --> B["视觉感知"]
    A --> C["语义理解"]
    A --> D["操作执行"]
    B --> E["截图/区域捕获"]
    C --> F["多模态模型"]
    D --> G["输入模拟"]
    E --> H["感知层"]
    F --> I["理解层"]
    G --> J["执行层"]
    H --> I --> J --> H`,
    },
  ],
};
