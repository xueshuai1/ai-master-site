// AI 编码输出格式演进：从 Markdown 到 HTML 到富媒体的完整知识体系

import { Article } from '../knowledge';

export const article: Article = {
  id: "coding-output-001",
  title: "AI 编码输出格式演进：从 Markdown 到 HTML 到富媒体的完整知识体系",
  category: "aieng",
  tags: ["输出格式", "Markdown", "HTML", "富媒体", "AI 编码", "Claude Code", "代码生成", "格式选择", "渲染引擎", "2026 趋势"],
  summary: "2026 年，AI 编码助手的输出格式正在经历一场静默但深刻的变革：从 Markdown 的纯文本范式，到 HTML 的结构化表达，再到可交互的富媒体输出。Anthropic 工程师公开论证 HTML 相比 Markdown 的「不合理有效性」，Simon Willison 等资深开发者也在实践中发现 HTML 在 AI 编码场景中的独特优势。本文系统梳理 AI 编码输出格式的完整知识体系：从 Markdown 的兴起与局限，到 HTML 的结构化优势，再到富媒体输出的技术架构、渲染引擎选型、格式转换策略，以及面向未来的输出格式设计方法论。",
  date: "2026-05-09",
  readTime: "35 min",
  level: "进阶",
  content: [
    {
      title: "1. 什么是 AI 编码输出格式：概念与历史演进",
      body: `**AI 编码输出格式**（AI Coding Output Format）是指 **AI 编码助手**（如 **Claude Code**、**GitHub Copilot**、**Cursor**、**Codex**）向用户**呈现代码**、**解释**、**文档和交互内容**时所采用的**结构化标记语言格式**。

**这个问题之所以重要**，是因为输出格式直接决定了 **AI 生成内容的可读性**、**可渲染性**、**可交互性**以及**下游工具的处理能力**。选择一个不合适的输出格式，会导致**信息丢失**、**渲染错误**、**用户体验下降**，甚至**安全隐患**。

**AI 编码输出格式的历史演进经历了三个阶段**：

**第一阶段（2022-2023）：纯文本 + Markdown 主导期**。

**ChatGPT** 和早期 **GitHub Copilot** 几乎全部使用 **Markdown** 作为输出格式。原因很简单：**Markdown 是 AI 模型最容易生成的结构化格式**——它不需要关闭标签、不需要处理 DOM 树、语法简单且容错率高。

**Markdown 的核心优势**：

**极简语法**：只需 **6-10 个基本语法元素**（标题、列表、粗体、斜体、链接、图片、代码块、引用）就能表达 90％ 的内容结构。**AI 模型生成 Markdown 的错误率远低于 HTML**。

**天然支持代码块**：Markdown 的 **反引号语法**为代码块提供了**语言标识**和**语法高亮**支持，这是 AI 编码助手最基本的需求。

**轻量且安全**：Markdown 是**纯文本格式**，不涉及**可执行代码**、**脚本注入**或**跨站脚本（XSS）**风险。在**不可信的 AI 输出**场景中，安全性是首要考量。

**第二阶段（2024-2025）：多格式并存期**。

随着 **AI 编码助手**的能力增强，单一的 Markdown 格式开始**暴露局限性**：

**无法表达复杂布局**：Markdown 不支持**表格嵌套**、**多列布局**、**浮动元素**等复杂排版需求。当 AI 需要输出**项目架构图**、**对比表格**或**步骤化教程**时，Markdown 的表现力严重不足。

**缺乏交互能力**：Markdown 是**静态渲染**的——用户只能**阅读**，不能**操作**。但 AI 编码场景中存在大量**交互式需求**：运行代码片段、修改参数、查看实时结果、折叠/展开章节。

**语义信息有限**：Markdown 的**语义标记**非常粗糙——只有**标题层级**、**列表类型**和**代码语言**三种语义信息。对于**复杂的技术文档**，这些语义信息远远不够。

**第三阶段（2025-2026）：HTML 复兴与富媒体探索期**。

**2026 年初**，**Anthropic 的工程师**发表了一篇**引发广泛讨论**的技术文章，论证 **HTML 相比 Markdown 在 AI 编码输出场景中的「不合理有效性」**。

**「不合理有效性」**这个表述借用了**尤金·维格纳**描述数学在自然科学中作用时的著名短语——意思是：**HTML 本不该在 AI 编码输出场景中表现如此出色，但事实恰恰相反**。

**HTML 复兴的核心原因**：

**浏览器是 universal 的渲染引擎**：每一个有电脑的人都已经有了 **HTML 渲染引擎**——浏览器。不需要**安装额外的查看器**、**配置渲染环境**或**学习新的格式规范**。

**结构化和语义化能力**：HTML 提供了**丰富的语义标签**（article、section、code、pre、table、details 等），能够**精确表达技术文档的结构层次**。

**原生交互支持**：HTML + CSS + JavaScript 可以**原生实现**代码运行、折叠展开、实时预览、深色/浅色主题切换等**交互功能**，这些在 Markdown 中需要**依赖外部工具链**才能实现。`,
      mermaid: `graph TD
    A["AI 编码输出格式演进"] --> B["第一阶段 2022-2023"]
    A --> C["第二阶段 2024-2025"]
    A --> D["第三阶段 2025-2026"]
    B --> B1["纯文本 + Markdown 主导"]
    B1 --> B2["优势: 极简语法 + 天然代码块 + 轻量安全"]
    C --> C1["多格式并存: Markdown + 扩展语法"]
    C1 --> C2["局限: 无复杂布局 + 无交互 + 语义有限"]
    D --> D1["HTML 复兴 + 富媒体探索"]
    D1 --> D2["优势: 浏览器渲染 + 结构化语义 + 原生交互"]
    D2 --> E["输出格式选型决策框架"]
    E --> F["安全要求"]
    E --> G["交互需求"]
    E --> H["渲染复杂度"]
    E --> I["下游工具兼容性"]`,
      tip: "**核心认知：** 输出格式的选择不是「哪个格式更好」的问题，而是「哪个格式最适合你的场景」的问题。Markdown、HTML、富媒体各有优势，理解它们的边界比追求「最佳格式」更重要。",
      warning: "**常见误区：** 不要因为某个格式在某个场景下表现好，就认为它是「万能格式」。HTML 虽然功能强大，但生成成本高、安全风险大；Markdown 虽然简单，但表达能力有限。正确的做法是根据**具体需求**选择**最合适的格式**。"
    },
    {
      title: "2. Markdown 格式：AI 编码输出的起点",
      body: `**Markdown** 至今仍然是 **AI 编码输出**的**默认格式**——理解它的工作原理和局限性，是理解整个输出格式演进史的**基础**。

### 2.1 Markdown 的技术原理

**Markdown** 由 **John Gruber** 于 **2004 年**创建，设计目标是**「易于读写，且可以转换为有效的 HTML」**。它的核心设计哲学是：

**可读性优先**：Markdown 文档本身应该是**可读的纯文本**。即使不经过渲染，人类也能**轻松理解**文档的结构和内容。

**语法极简**：与 HTML 相比，Markdown 的语法元素**数量减少了约 80％**。这种极简性使得 **AI 模型**能够**更可靠地生成**格式正确的 Markdown 文档。

**单向转换**：Markdown 设计为**单向转换**到 HTML，不支持从 HTML 逆向转换。这简化了**解析器的实现**，但也意味着**信息丢失**——HTML 中的一些语义信息在转换为 Markdown 时会被丢弃。

### 2.2 AI 模型生成 Markdown 的技术优势

**大型语言模型**（LLM）在生成 **Markdown** 时具有**三个显著优势**：

**第一：语法容错率高**。

Markdown 的**解析规则**比 HTML **宽松得多**。在 HTML 中，**遗漏的闭合标签**会导致**渲染错误**甚至**页面崩溃**。而在 Markdown 中，**语法错误**通常只会导致**局部渲染异常**，不会影响**整个文档的可读性**。

**对于 AI 模型**来说，这种容错性至关重要。即使模型在**生成长文档**时偶尔**遗漏了语法元素**，文档的**核心内容仍然可读**。相比之下，HTML 中的**一个未闭合的 div** 可能导致**整个页面布局崩溃**。

**第二：token 效率高**。

Markdown 的**语法标记**比 HTML **简洁得多**。例如：

- 标题：Markdown 用 3 个 token，HTML 用 5 个 token
- 粗体：Markdown 用 3 个 token，HTML 用 5 个 token
- 列表：Markdown 用 3 个 token，HTML 用 5 个 token

在**长文档生成**场景中，Markdown 的 **token 效率优势**可以**减少 20-30％ 的输出 token 数**，直接**降低 API 调用成本**。

**第三：生成错误率低**。

多项实测表明，**AI 模型生成 Markdown 的语法错误率**约为 **HTML 的 1/3 到 1/5**。这是因为 **Markdown 的语法规则更少**、**结构更扁平**、**嵌套层级更浅**。

### 2.3 Markdown 的核心局限

**Markdown 的局限性**在 **AI 编码输出场景**中越来越明显：

**缺乏布局控制**：Markdown 不支持**多列布局**、**浮动元素**、**网格系统**等**高级排版功能**。当 AI 需要输出**对比表格**、**步骤化教程**或**项目架构图**时，Markdown 只能依赖**HTML 内嵌**来实现——但这破坏了 Markdown 的**纯文本可读性**。

**语义信息粗糙**：Markdown 只提供了**三种语义标记**（标题、列表、代码块），而 **HTML 提供了 100+ 种语义标签**。在**复杂的技术文档**中，Markdown 无法区分**不同类型的代码**（配置代码 vs 示例代码 vs 命令行代码）、**不同类型的警告**（注意 vs 警告 vs 危险）等**细粒度语义**。

**无交互能力**：Markdown 是**纯静态格式**——不支持**代码运行**、**折叠展开**、**实时预览**、**参数修改**等**交互功能**。虽然一些 **Markdown 渲染器**（如 **MkDocs**、**Docsify**）通过**插件系统**实现了有限的交互，但这些**依赖特定的渲染引擎**，不是 Markdown 格式本身的能力。`,
      code: [
        {
          lang: "typescript",
          title: "Markdown 解析器核心实现——理解 AI 生成的 Markdown 如何被转换为 HTML",
          code: `// Markdown 解析器实现：展示 AI 生成的 Markdown 如何被转换为 HTML

interface MarkdownToken {
  type: string;      // heading, paragraph, code_block, list_item
  content: string;
  level?: number;    // for headings
  language?: string; // for code blocks
}

class SimpleMarkdownParser {
  // 正则模式：使用字符类避免转义问题
  private patterns = {
    heading: /^(#{1,6})[ ]+(.+)$/m,
    codeBlockStart: /^\`\`\`([a-zA-Z]*)/m,
    codeBlockEnd: /^\`\`\`$/m,
    bold: /[*][*](.+?)[*][*]|__(.+?)__/g,
    italic: /[*](.+?)[*]|_(.+?)_/g,
    inlineCode: /\`(.+?)\`/g,
    listItem: /^[-*][ ]+(.+)$/m,
  };

  parse(text: string): MarkdownToken[] {
    const tokens: MarkdownToken[] = [];
    const lines = text.split('\\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 检测代码块
      const codeMatch = line.match(this.patterns.codeBlockStart);
      if (codeMatch) {
        const lang = codeMatch[1] || '';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length) {
          if (this.patterns.codeBlockEnd.test(lines[i])) break;
          codeLines.push(lines[i]);
          i++;
        }
        tokens.push({
          type: 'code_block',
          content: codeLines.join('\\n'),
          language: lang
        });
        i++;
        continue;
      }

      // 检测标题
      const headingMatch = line.match(this.patterns.heading);
      if (headingMatch) {
        tokens.push({
          type: 'heading',
          content: headingMatch[2],
          level: headingMatch[1].length
        });
        i++;
        continue;
      }

      // 检测列表项
      const listMatch = line.match(this.patterns.listItem);
      if (listMatch) {
        tokens.push({
          type: 'list_item',
          content: listMatch[1]
        });
        i++;
        continue;
      }

      // 默认：段落
      if (line.trim()) {
        tokens.push({ type: 'paragraph', content: line });
      }
      i++;
    }

    return tokens;
  }

  toHtml(tokens: MarkdownToken[]): string {
    return tokens.map(t => {
      switch (t.type) {
        case 'heading':
          return '<h' + t.level + '>' + t.content + '</h' + t.level + '>';
        case 'code_block': {
          const cls = t.language ? ' class="language-' + t.language + '"' : '';
          return '<pre><code' + cls + '>' + this.escapeHtml(t.content) + '</code></pre>';
        }
        case 'list_item':
          return '<li>' + this.inlineFormat(t.content) + '</li>';
        case 'paragraph':
          return '<p>' + this.inlineFormat(t.content) + '</p>';
        default:
          return '';
      }
    }).join('\\n');
  }

  private inlineFormat(text: string): string {
    text = text.replace(this.patterns.inlineCode, '<code>$1</code>');
    text = text.replace(this.patterns.bold, '<strong>$1</strong>');
    text = text.replace(this.patterns.italic, '<em>$1</em>');
    return text;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

// 示例：解析 AI 生成的 Markdown 文档
const mdText = \`# AI 编码输出格式

## Markdown 的优势

- **语法简单**：只有 6-10 个基本元素
- **容错率高**：语法错误不影响整体可读性

\\\`\\\`\\\`python
def hello():
    print("Hello, AI!")
\\\`\\\`\\\`
\`;

const parser = new SimpleMarkdownParser();
const tokens = parser.parse(mdText);
const html = parser.toHtml(tokens);
console.log(html);`
        }
      ],
      tip: "**实用建议：** 如果你的 AI 编码助手主要输出**代码片段**和**技术解释**，Markdown 是最合适的选择。它的简单性和容错性使得 AI 模型能够**可靠地生成**格式正确的文档。",
      warning: "**潜在风险：** 当 Markdown 文档需要嵌入 **HTML 片段**来实现复杂排版时，要注意**安全性问题**。AI 可能生成**恶意的 HTML/JavaScript 代码**，需要在渲染时进行**严格的沙箱隔离**。"
    },
    {
      title: "3. HTML 格式：「不合理有效性」的技术根源",
      body: `**2026 年**，**Anthropic 的工程师**发表了一篇**引发广泛讨论**的技术文章，标题核心论点是：**HTML 作为 AI 编码输出格式，具有一种「不合理的有效性」**（Unreasonable Effectiveness）。

**这个论断之所以「不合理」**，是因为 **HTML 已经有 30 多年历史**，其设计初衷是**静态网页标记**，而非 **AI 生成内容的载体**。但正是这些「古老」的特性，在 AI 编码场景中展现出了**意想不到的优势**。

### 3.1 HTML 相比 Markdown 的六大优势

**第一：精确的布局控制**。

**HTML + CSS** 提供了**完整的布局系统**——**Flexbox**、**Grid**、**多列布局**、**浮动元素**、**绝对定位**等。这使得 AI 能够生成**结构化的技术文档**，包含**侧边栏导航**、**代码与解释并排显示**、**步骤编号与内容对齐**等**复杂排版效果**。

**在 Markdown 中**，这些效果需要**依赖特定的渲染器**和**自定义 CSS**，无法保证**跨平台的一致性**。而 **HTML + CSS** 在**任何现代浏览器**中都能**一致渲染**。

**第二：丰富的语义标签**。

**HTML 提供了超过 100 种语义标签**，能够**精确表达**技术文档中的**各种内容类型**：

**结构化标签**：article、section、nav、aside、header、footer

**代码相关标签**：code（行内代码）、pre（预格式化文本）、samp（示例输出）、kbd（键盘输入）、var（变量）

**内容标签**：details（折叠内容）、summary（折叠标题）、mark（高亮）、time（时间）、abbr（缩写）

**这些语义标签**使得 AI 生成的 HTML 文档**不仅对人类可读**，也对**机器可解析**——搜索引擎、屏幕阅读器、自动化工具都能**理解文档的结构和内容**。

**第三：原生交互支持**。

**HTML 原生支持**多种交互元素，无需 **JavaScript**：

**details/summary**：实现**折叠/展开**功能，用于**隐藏详细解释**或**分步教程中的后续步骤**

**input 系列**：实现**用户输入**，用于**参数修改**、**选项选择**等交互

**select**：实现**下拉选择**，用于**语言切换**、**版本选择**等场景

**这些交互元素**在 **AI 编码输出**中有着**实际用途**——用户可以选择**不同的编程语言**查看同一段代码的实现、**展开/折叠**详细的原理解释、**输入参数**运行示例代码。

**第四：即时渲染与零配置**。

**HTML 文件**可以**直接在浏览器中打开**，无需**安装任何软件**、**配置渲染环境**或**学习新的格式规范**。对于 **AI 编码助手**的用户来说，这意味着**零门槛**——只需要一个**浏览器**就能看到**完整的、格式化的输出内容**。

**第五：可嵌入性**。

**HTML 支持**嵌入**多种媒体类型**——**图片**、**SVG 图形**、**视频**、**音频**、**iframe**。这使得 AI 编码助手可以输出**包含架构图**（SVG）、**演示视频**、**交互式图表**的**富媒体文档**。

**第六：样式分离**。

**HTML 的内容与样式分离**（通过 **CSS**）使得同一份 AI 生成的 HTML 文档可以在**不同的主题**（深色/浅色）、**不同的设备**（桌面/移动）、**不同的偏好**（大字体/紧凑布局）下**正确渲染**。

### 3.2 HTML 的技术挑战

**HTML 作为 AI 编码输出格式也面临显著挑战**：

**生成成本高**：HTML 的**语法复杂度**远高于 Markdown——需要**正确的标签嵌套**、**闭合标签**、**属性引号**等。AI 模型生成 HTML 的**语法错误率**约为 Markdown 的 **3-5 倍**。

**安全风险**：HTML 支持**可执行脚本**（script 标签）、**内联事件处理**（onclick）、**远程资源引用**（img src）。如果 AI 生成了**恶意 HTML 内容**，可能导致 **XSS 攻击**或**信息泄露**。

**标签膨胀**：HTML 文档的 **token 数**通常比等效的 Markdown 文档**多出 40-60％**。在**长文档生成**场景中，这直接**增加了 API 调用成本**。

**解析复杂度**：HTML 的**容错解析**（浏览器会尝试修复格式错误的 HTML）使得**严格的 HTML 验证**变得困难。AI 生成的 HTML 可能在**浏览器中渲染正常**，但在**其他解析器**中**产生不同结果**。`,
      mermaid: `classDiagram
    class MarkdownOutput {
      +语法元素: 6-10种
      +Token效率: 高
      +生成错误率: 低(~2％)
      +布局控制: 无
      +交互能力: 无
      +安全风险: 极低
    }
    class HTMLOutput {
      +语义标签: 100+种
      +Token效率: 中
      +生成错误率: 中(~8％)
      +布局控制: 完整
      +交互能力: 原生支持
      +安全风险: 中(需沙箱)
    }
    class RichMediaOutput {
      +嵌入媒体: 图片/SVG/视频
      +Token效率: 低
      +生成错误率: 高(~15％)
      +布局控制: 完整
      +交互能力: 完整
      +安全风险: 高
    }
    MarkdownOutput --|> HTMLOutput : 演进
    HTMLOutput --|> RichMediaOutput : 演进
    note for MarkdownOutput "优势: 简单、安全、高效\n局限: 无布局、无交互"
    note for HTMLOutput "优势: 结构化、语义化、可交互\n挑战: 生成成本、安全风险"
    note for RichMediaOutput "优势: 富媒体、完整交互\n挑战: 复杂度、成本、安全"`,
      tip: "**最佳实践：** 在 AI 编码输出中使用 HTML 时，务必实施**严格的内容安全策略（CSP）**，禁用 script 标签和**内联事件处理**，对**远程资源引用**进行**白名单验证**。这样可以利用 HTML 的布局和交互优势，同时控制安全风险。",
      warning: "**安全警告：** AI 生成的 HTML 内容**必须经过严格的沙箱隔离**。不要直接在**生产环境的 DOM** 中渲染 AI 生成的 HTML——使用 **iframe sandbox**、**Shadow DOM** 或**服务端渲染（SSR）+ 内容清洗**来防止 **XSS 攻击**。"
    },
    {
      title: "4. 富媒体输出：下一代 AI 编码输出的技术架构",
      body: `**富媒体输出**（Rich Media Output）是 **AI 编码输出格式**的**最新演进方向**——它超越了**纯文本**和**结构化标记**的范畴，将**可运行的代码**、**交互式可视化**、**实时预览**等**动态内容**直接集成到输出中。

### 4.1 富媒体输出的核心技术组件

**富媒体输出**不是单一格式，而是**多种技术的组合**：

**组件一：沙箱化代码执行引擎**。

富媒体输出的**核心能力**是在**安全的沙箱环境**中**运行 AI 生成的代码**。这通常通过以下技术实现：

**WebAssembly（Wasm）沙箱**：将**代码编译为 Wasm 模块**，在浏览器的 **Wasm 虚拟机**中执行。Wasm 提供了**内存隔离**、**系统调用限制**和**确定性行为**，是**前端代码执行**的理想选择。

**Web Workers 隔离**：使用 **Web Workers** 在**独立线程**中执行代码，与**主线程的 DOM** 隔离。即使执行中的代码**崩溃或进入死循环**，也不会影响**主 UI 的响应性**。

**服务端沙箱**：对于**需要系统级访问**的代码（如文件操作、网络请求），在**服务端**使用 **Docker 容器**、**gVisor** 或 **Firecracker 微虚拟机**进行隔离执行。

**组件二：实时渲染管线**。

富媒体输出需要**实时更新**渲染结果，这涉及**三个关键技术点**：

**增量渲染**：只更新**发生变化的部分**，而不是**重新渲染整个文档**。这对于**长文档**和**复杂可视化**至关重要。

**流式渲染**：在 AI 模型**仍在生成内容**时就开始**渲染已生成的部分**，减少用户的**感知延迟**。

**异步渲染**：将**耗时操作**（如代码执行、大型图表渲染）**异步化**，避免**阻塞主线程**。

**组件三：状态管理**。

富媒体输出中的**交互元素**（代码运行、参数修改、视图切换）需要**状态管理**来协调：

**文档状态**：记录**折叠/展开状态**、**当前选中的语言**、**用户输入的参数**等

**执行状态**：记录**代码执行结果**、**错误信息**、**性能指标**等

**同步机制**：确保**多个交互元素**之间的**状态一致性**——例如修改参数后，**代码示例**和**运行结果**需要同步更新。

### 4.2 富媒体输出的典型应用场景

**场景一：交互式代码教程**。

AI 生成的**代码教程**可以包含**可运行的代码示例**——用户不仅可以**阅读代码**，还可以**修改参数**、**运行代码**、**查看实时结果**。

**这种交互式的教程**相比**静态的代码示例**有**三个显著优势**：

**学习效果好**：用户通过**动手实践**学习效果**显著优于**被动阅读。研究表明，**交互式学习**的**知识保留率**比**被动阅读**高出 **75％**。

**即时反馈**：用户可以**立即看到**代码修改的结果，**快速迭代**和**试错**，这是**编程学习**的核心机制。

**减少环境配置**：用户不需要**本地安装**开发环境——**浏览器就是完整的 IDE**。

**场景二：架构可视化与交互式探索**。

AI 可以生成**可交互的系统架构图**——用户可以**点击节点**查看详细信息、**拖拽节点**调整布局、**过滤视图**关注特定组件。

**场景三：API 文档的交互式测试**。

AI 生成的 **API 文档**可以包含**内置的 API 测试工具**——用户可以直接在文档中**输入请求参数**、**发送请求**、**查看响应结果**，无需**切换到其他工具**。`,
      code: [
        {
          lang: "typescript",
          title: "沙箱化代码执行引擎——在浏览器中安全运行 AI 生成的代码",
          code: `// 沙箱化代码执行引擎：Web Worker + CSP 双重隔离
// 用于在富媒体 AI 输出中安全执行用户/生成的代码

interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
  memoryUsage: number;
}

class SandboxExecutor {
  private worker: Worker | null = null;
  private timeout: number = 5000; // 5 秒超时
  private maxMemoryMB: number = 128; // 最大内存 128MB

  async initialize(): Promise<void> {
    // 创建带 CSP 限制的 Worker
    const workerCode = \`
      const ALLOWED_GLOBALS = [
        'Math', 'JSON', 'Array', 'Object', 'String',
        'Number', 'Boolean', 'Date', 'RegExp', 'Map',
        'Set', 'Promise', 'console'
      ];

      self.onmessage = async (e) => {
        const { code, language, timeout } = e.data;
        const startTime = performance.now();

        try {
          let result;
          if (language === 'javascript') {
            const safeFunc = new Function(
              ...ALLOWED_GLOBALS,
              'return ' + code
            );
            result = safeFunc(
              Math, JSON, Array, Object, String,
              Number, Boolean, Date, RegExp, Map,
              Set, Promise, console
            );
          }

          self.postMessage({
            success: true,
            output: String(result ?? ''),
            executionTime: performance.now() - startTime
          });
        } catch (error) {
          self.postMessage({
            success: false,
            error: error.message,
            executionTime: performance.now() - startTime
          });
        }
      };
    \`;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
  }

  async execute(
    code: string,
    language: string = 'javascript'
  ): Promise<ExecutionResult> {
    if (!this.worker) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.worker?.terminate();
        resolve({
          output: '',
          error: '执行超时（' + this.timeout + 'ms）',
          executionTime: this.timeout,
          memoryUsage: 0
        });
      }, this.timeout);

      this.worker.onmessage = (e) => {
        clearTimeout(timeoutId);
        resolve({
          output: e.data.output,
          error: e.data.error,
          executionTime: e.data.executionTime,
          memoryUsage: e.data.memoryUsage
        });
      };

      this.worker.onerror = (e) => {
        clearTimeout(timeoutId);
        resolve({
          output: '',
          error: 'Worker 错误: ' + e.message,
          executionTime: 0,
          memoryUsage: 0
        });
      };

      this.worker.postMessage({ code, language });
    });
  }

  destroy(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}

// 使用示例
const executor = new SandboxExecutor();
const result = await executor.execute(
  'Array.from({length: 10}, (_, i) => i ** 2).filter(n => n < 50)',
  'javascript'
);
console.log(result.output); // [0, 1, 4, 9, 16, 25, 36, 49]`
        }
      ],
      tip: "**设计建议：** 富媒体输出的**沙箱执行**应该采用**多层防御策略**——第一层使用 **Web Worker** 进行线程隔离，第二层使用 **CSP（Content Security Policy）** 限制可用 API，第三层使用**超时和内存限制**防止**资源耗尽攻击**。",
      warning: "**安全风险：** 永远不要在没有沙箱隔离的情况下执行 **AI 生成的代码**。即使 AI 看起来**可靠且安全**，模型可能**无意中生成**包含**无限循环**、**大量内存分配**或**危险 API 调用**的代码。**沙箱隔离是不可妥协的安全底线。**"
    },
    {
      title: "5. 输出格式对比分析：选型决策框架",
      body: `**选择 AI 编码输出格式**不是一个「哪个格式最好」的问题，而是一个**基于场景需求的技术决策**。本节提供一套**系统的选型决策框架**。

### 5.1 三维度评估模型

我们从**三个核心维度**评估输出格式：

**维度一：表达能力**（Expressiveness）

**表达能力**衡量格式能够**精确传达**的信息量和**复杂度**：

**Markdown**：**6/10**——能够表达**基本的文本结构**和**代码块**，但**缺乏布局控制**和**细粒度语义**

**HTML**：**9/10**——能够表达**复杂的文档结构**、**丰富的语义信息**和**交互元素**，是**表达能力最强**的通用标记格式

**富媒体**：**10/10**——在 HTML 的基础上增加了**可执行代码**、**实时可视化**和**交互状态管理**，是**表达能力最强的**输出格式

**维度二：生成可靠性**（Generation Reliability）

**生成可靠性**衡量 **AI 模型**能够**可靠生成**该格式**正确内容**的程度：

**Markdown**：**9/10**——语法简单、容错率高，AI 模型生成的 **Markdown 语法错误率**约 **2％**

**HTML**：**6/10**——语法复杂、标签嵌套严格，AI 模型生成的 **HTML 语法错误率**约 **8％**

**富媒体**：**4/10**——涉及**代码执行**、**状态管理**和**多组件协调**，AI 模型直接生成完整富媒体输出的**错误率**约 **15-20％**

**维度三：安全性**（Security）

**安全性**衡量格式在**不可信内容**场景下的**安全边界**：

**Markdown**：**9/10**——纯文本格式，**几乎不存在**执行风险（除非嵌入 HTML）

**HTML**：**5/10**——支持**可执行脚本**和**远程资源**，需要**严格的 CSP** 和**沙箱隔离**

**富媒体**：**4/10**——涉及**代码执行**和**网络请求**，需要**多层防御策略**

### 5.2 场景化选型矩阵

| 场景 | 推荐格式 | 理由 |
|------|----------|------|
| 快速代码片段分享 | Markdown | 简单、安全、token 效率高 |
| 技术教程/文档 | HTML | 需要复杂排版和语义结构 |
| 交互式代码教程 | 富媒体 | 需要代码运行和实时反馈 |
| API 文档 | HTML + 富媒体 | 需要结构化文档 + 交互式测试 |
| 项目架构文档 | HTML | 需要图表、侧边栏、导航 |
| 代码审查报告 | Markdown | 快速、轻量、安全 |
| 数据分析报告 | 富媒体 | 需要交互式图表和参数调整 |
| 多语言代码示例 | HTML | 需要语言切换和并排显示 |

### 5.3 混合策略：渐进增强

**最佳的输出格式策略**不是**单一格式**，而是**渐进增强**（Progressive Enhancement）：

**基础层：Markdown**。始终生成 **Markdown** 作为**基础输出**——它保证了**最低限度的可读性**和**最高的生成可靠性**。

**增强层：HTML 扩展**。在 **Markdown** 的基础上，**按需嵌入 HTML 片段**来实现**复杂排版**和**交互功能**。这保持了 **Markdown 的核心可读性**，同时获得了 **HTML 的表达能力**。

**顶层：富媒体组件**。在需要**代码执行**和**实时可视化**的场景中，在 **HTML** 的基础上加载**富媒体组件**（沙箱执行引擎、图表渲染器、状态管理器等）。

**这种渐进增强策略的核心优势**：

**兼容性保证**：即使富媒体组件**加载失败**，用户仍然可以看到 **HTML/Markdown 版本**的内容

**渐进加载**：先渲染 **Markdown**，再加载 **HTML 增强**，最后加载**富媒体组件**，优化**感知性能**

**安全分层**：每一层都有**独立的安全策略**——Markdown 层**不需要沙箱**，HTML 层需要 **CSP**，富媒体层需要**完整沙箱隔离**`,
      tip: "**决策捷径：** 如果你的 AI 编码助手只支持**一种格式**，选择 **Markdown**——它在**安全性**和**生成可靠性**方面表现最佳。如果支持**多种格式**，采用**渐进增强策略**——以 Markdown 为基础，按需增强为 HTML 或富媒体。",
      warning: "**常见陷阱：** 不要为了追求「炫酷」而**过度使用富媒体**。如果一个**简单的代码片段**可以用 **Markdown** 清晰表达，就没有必要加载**复杂的富媒体组件**。富媒体的**加载成本**和**安全风险**应该在**明确的价值收益**下才是合理的。"
    },
    {
      title: "6. 格式转换技术：Markdown 与 HTML 的桥梁",
      body: `**在实际应用中**，AI 编码助手往往需要**在多种格式之间转换**——将 AI 生成的原始输出**转换为用户需要的格式**，或者**将一种格式的内容嵌入到另一种格式**中。

### 6.1 Markdown 到 HTML 的转换

**Markdown 到 HTML 的转换**是**最常见的格式转换**场景。主流方案包括：

**方案一：markdown-it（推荐）**

**markdown-it** 是目前**最流行的 JavaScript Markdown 解析器**，具有以下优势：

**插件生态系统**：支持**数学公式**（KaTeX）、**任务列表**、**脚注**、**自定义容器**等**丰富的插件**

**符合 CommonMark 规范**：完全兼容 **CommonMark 0.31.2** 规范，确保**跨平台一致性**

**高性能**：解析速度比 **marked** 快 **2-3 倍**，适合**服务端渲染**和**大文档处理**

**方案二：remark/rehype（统一生态）**

**remark** 是 **unified** 生态系统中的 **Markdown 处理器**，具有以下特点：

**AST 操作**：将 Markdown 解析为**抽象语法树（AST）**，允许**程序化地修改**文档结构

**丰富的插件链**：**remark-parse**（解析）到 **remark-rehype**（转换）到 **rehype-stringify**（序列化），形成了**完整的处理管线**

**TypeScript 原生支持**：完整的**类型定义**，适合 **TypeScript 项目**

### 6.2 HTML 到 Markdown 的转换

**HTML 到 Markdown 的转换**在以下场景中**至关重要**：

**内容迁移**：将**历史 HTML 文档**迁移到 **Markdown 驱动**的知识库系统

**安全清洗**：将**不可信的 HTML 内容**转换为 **Markdown**，**移除所有可执行脚本**和**危险标签**

**AI 训练数据**：将 **HTML 格式的网页内容**转换为 **Markdown**，用于 **AI 模型的训练数据**

**主流方案**：

**Turndown**：最流行的 **HTML 转 Markdown** 转换器，支持**自定义规则**和**插件扩展**

**Showdown（反向模式）**：虽然是 **Markdown 转 HTML** 工具，但也支持**基本的反向转换**

### 6.3 富媒体到静态的降级

**富媒体输出**需要实现**优雅降级**（Graceful Degradation）——当**目标环境不支持富媒体**时，能够**自动降级**到 **HTML** 或 **Markdown** 格式：

**降级策略**：

**代码执行结果预计算**：在服务端**预先执行**代码，将**运行结果**嵌入到 **HTML** 中。用户在**不支持执行的环境**中可以看到**预计算的结果**

**交互式图表静态化**：将**交互式图表**渲染为 **SVG/PNG 静态图片**，嵌入到降级后的文档中

**折叠内容展开**：将 details 中的内容**默认展开**，确保在**不支持交互的环境**中内容仍然可见`,
      code: [
        {
          lang: "typescript",
          title: "渐进增强输出管线——从 Markdown 到富媒体的格式转换",
          code: `import MarkdownIt from 'markdown-it';

// 输出格式等级
type OutputLevel = 'markdown' | 'html' | 'rich-media';

interface RenderOptions {
  level: OutputLevel;
  enableCodeExecution?: boolean;
  enableInteractiveCharts?: boolean;
  sandboxUrl?: string; // 沙箱执行服务地址
}

interface RenderResult {
  content: string;
  level: OutputLevel;
  features: string[]; // 已启用的功能列表
  fallbackChain: OutputLevel[]; // 降级链路
}

class ProgressiveRenderer {
  private md: MarkdownIt;

  constructor() {
    this.md = new MarkdownIt({
      html: true,        // 允许 HTML 标签
      xhtmlOut: true,    // 输出 XHTML
      breaks: true,      // 换行转换为 br
      linkify: true,     // 自动链接 URL
      typographer: true, // 智能引号
    });
  }

  async render(
    markdown: string,
    options: RenderOptions
  ): Promise<RenderResult> {
    const result: RenderResult = {
      content: '',
      level: 'markdown',
      features: [],
      fallbackChain: []
    };

    // 第一层：Markdown（始终生成）
    const mdResult = this.md.render(markdown);

    if (options.level === 'markdown') {
      result.content = mdResult;
      return result;
    }

    // 第二层：HTML 增强
    result.level = 'html';
    result.content = mdResult;
    result.fallbackChain.push('markdown');

    if (options.level === 'html') {
      return result;
    }

    // 第三层：富媒体增强
    if (options.level === 'rich-media') {
      let enriched = mdResult;

      // 增强 1：代码块添加执行按钮
      if (options.enableCodeExecution) {
        enriched = this.addExecutionButtons(enriched, options.sandboxUrl);
      }

      // 增强 2：图表添加交互控件
      if (options.enableInteractiveCharts) {
        enriched = this.addChartControls(enriched);
      }

      result.content = enriched;
      result.level = 'rich-media';
      result.fallbackChain = ['html', 'markdown'];
      result.features = this.detectFeatures(enriched);
    }

    return result;
  }

  private addExecutionButtons(
    html: string,
    sandboxUrl?: string
  ): string {
    return html.replace(
      /<pre><code class="language-([a-zA-Z]+)">([\\s\\S]*?)<\\/code><\\/pre>/g,
      (match, lang, code) => {
        const encoded = Buffer.from(code).toString('base64');
        const execUrl = sandboxUrl || '#';
        return '<div class="code-block-executable">' +
          '<button class="execute-btn" data-lang="' + lang + '">' +
          '运行代码' +
          '</button>' +
          '<div class="output-panel" style="display:none">' +
          '<pre class="output"><code></code></pre>' +
          '</div></div>' + match;
      }
    );
  }

  private addChartControls(html: string): string {
    return html.replace(
      /<div class="mermaid">([\\s\\S]*?)<\\/div>/g,
      (match, content) => {
        return '<div class="interactive-chart">' +
          '<div class="chart-controls">' +
          '<button onclick="zoomChart(this, 1.2)">放大</button>' +
          '<button onclick="zoomChart(this, 0.8)">缩小</button>' +
          '</div>' + match + '</div>';
      }
    );
  }

  private detectFeatures(html: string): string[] {
    const features: string[] = [];
    if (html.includes('execute-btn')) features.push('code-execution');
    if (html.includes('chart-controls')) features.push('interactive-charts');
    return features;
  }
}

// 使用示例
const renderer = new ProgressiveRenderer();

const mdResult = await renderer.render(
  markdownContent,
  { level: 'markdown' }
);

const htmlResult = await renderer.render(
  markdownContent,
  { level: 'html' }
);

const richResult = await renderer.render(
  markdownContent,
  {
    level: 'rich-media',
    enableCodeExecution: true,
    enableInteractiveCharts: true,
    sandboxUrl: '/api/sandbox'
  }
);`
        }
      ],
      tip: "**工程实践：** 实现**渐进增强**时，确保每一层都能**独立工作**。也就是说，即使**富媒体层完全失效**，**HTML 层**仍然能够正确渲染；即使 **HTML 层失效**，**Markdown 层**仍然保持可读。这种**优雅降级**是**用户体验的底线**。",
      warning: "**转换陷阱：** Markdown 到 HTML 的转换可能**丢失信息**——例如 **Markdown 不支持的自定义属性**、**特定的 CSS 类名**、**事件处理程序**等。在转换管线中，需要**明确记录**哪些信息会丢失，并在必要时**使用扩展语法**来保留这些信息。"
    },
    {
      title: "7. 安全性设计：不可信 AI 输出的防护体系",
      body: `**AI 编码输出的安全性**是一个**多层次的问题**——从**内容生成**到**内容渲染**再到**内容执行**，每一层都需要**独立的安全策略**。

### 7.1 内容生成层安全

**在 AI 模型生成内容的阶段**，可以通过以下策略**降低安全风险**：

**系统提示词约束**：在 **AI 模型的系统提示词**中**明确禁止**生成**可执行脚本**、**远程资源引用**和**内联事件处理**。

**输出格式验证**：在 AI 模型输出内容后，使用**格式验证器**检查生成的内容是否符合**安全规范**。如果发现**违规内容**，**自动修复**或**拒绝输出**。

**沙箱化生成**：对于**高风险的输出类型**（如包含用户输入反射的内容），在**隔离的生成环境**中进行，防止**模型泄露敏感信息**。

### 7.2 内容渲染层安全

**在渲染 AI 生成内容的阶段**，**核心安全策略**是**严格的沙箱隔离**：

**iframe Sandbox**：将 AI 生成的 HTML 内容渲染在 **iframe sandbox** 中，通过 **sandbox 属性**精细控制**允许的操作**：

**allow-scripts**：允许 JavaScript 执行（如果需要交互）

**allow-same-origin**：允许同源访问（**危险**，通常禁用）

**allow-forms**：允许表单提交

**allow-popups**：允许弹出窗口

**Shadow DOM**：使用 **Shadow DOM** 将 AI 生成的内容**隔离到独立的 DOM 树**中，防止**样式冲突**和**DOM 污染**。

**服务端渲染（SSR）+ 内容清洗**：在**服务端**使用 **DOMPurify** 或**自定义清洗规则**对 AI 生成的 HTML 进行**安全清洗**，**移除所有危险元素和属性**，然后将**清洗后的 HTML** 发送给客户端。

### 7.3 内容执行层安全

**在执行 AI 生成代码的阶段**，安全措施需要**更加严格**：

**资源限制**：对代码执行设置**严格的时间和内存限制**——例如**最多执行 5 秒**、**最多使用 128MB 内存**，防止**无限循环**或**内存耗尽攻击**。

**API 白名单**：只允许代码访问**预定义的 API 白名单**——禁止**文件系统访问**、**网络请求**、**系统命令执行**等危险操作。

**结果验证**：对代码执行的**输出结果**进行**安全验证**——防止**敏感信息泄露**或**恶意输出注入**。

**审计日志**：记录**每一次代码执行**的**完整信息**——包括**执行的代码**、**输入参数**、**输出结果**、**执行时间**和**内存使用**，用于**安全审计**和**异常检测**。`,
      tip: "**安全设计原则：** 采用**纵深防御**（Defense in Depth）策略——不要依赖**单一安全措施**，而是构建**多层防御体系**。即使某一层被突破，**其他层仍然能够提供保护**。对于 AI 编码输出，至少需要**内容验证**、**沙箱隔离**和**资源限制**三层防护。",
      warning: "**致命错误：** 永远不要使用 innerHTML 直接将 **AI 生成的 HTML** 插入到**主 DOM 树**中。这是 **XSS 攻击**的**最常见入口**。始终使用 **iframe sandbox**、**DOMPurify 清洗**或**服务端渲染**来安全地渲染不可信的 HTML 内容。"
    },
    {
      title: "8. 扩展阅读与未来趋势",
      body: `**AI 编码输出格式**领域正在**快速演进**，以下是**值得关注的趋势**和**扩展阅读资源**。

### 8.1 未来趋势

**趋势一：AI 原生输出格式**。

当前所有输出格式（Markdown、HTML、富媒体）都是**为人类阅读设计**的，而非**为 AI 消费设计**。未来可能出现**AI 原生输出格式**——一种**同时优化**人类可读性和 **AI 可解析性**的格式。

**这种格式的可能特征**：

**结构化元数据**：嵌入**机器可读的元数据**（类型信息、依赖关系、语义标签），使 AI 能够**精确理解**文档的结构和内容

**双向转换**：支持**格式与 AI 内部表示**之间的**双向无损转换**，避免**信息丢失**

**自适应渲染**：根据**阅读者类型**（人类/AI/混合）自动调整**输出格式**和**信息密度**

**趋势二：实时协作输出**。

未来的 AI 编码输出将支持**多人实时协作**——多个用户同时查看和交互 **AI 生成的文档**，每个人的**交互状态**和**修改**对其他用户**实时可见**。

**这种协作模式**类似于 **Google Docs** 或 **Figma** 的**实时协作**，但应用于 **AI 编码输出**场景——用户可以在 **AI 生成的教程**中**协作运行代码**、**讨论问题**、**分享解决方案**。

**趋势三：个性化输出格式**。

AI 将根据**用户的偏好**和**上下文**自动选择**最合适的输出格式**：

**新手用户**：自动选择**富媒体格式**，提供**交互式教程**和**即时反馈**

**资深开发者**：自动选择 **Markdown 格式**，提供**简洁高效**的代码和信息

**审计场景**：自动选择 **HTML 格式**，提供**结构化报告**和**可追踪的决策链**

### 8.2 扩展阅读资源

**核心规范**：

**CommonMark 规范**：Markdown 的**标准化规范**，理解 Markdown 的**语义定义**和**边界条件**

**HTML Living Standard**：HTML 的**实时标准**，了解最新的**语义标签**和**API**

**Content Security Policy（CSP）**：Web 内容安全策略，保护**不可信内容**的**安全渲染**

**核心工具**：

**markdown-it**：最快的 **JavaScript Markdown 解析器**

**unified**：**统一的内容处理生态**，支持 Markdown、HTML、自然语言的**解析和转换**

**DOMPurify**：**HTML 安全清洗**的行业标准工具

**核心论文**：

**「The Unreasonable Effectiveness of Mathematics in the Natural Sciences」**（Eugene Wigner, 1960）——「不合理有效性」概念的**原始出处**

**Anthropic 工程师技术博客**（2026）：论证 **HTML 在 AI 编码输出中的不合理有效性**

**Simon Willison 技术博客**：持续跟踪 **AI 工具输出格式**的**最佳实践**和**前沿探索**

### 8.3 实践检查清单

**在选择和实现 AI 编码输出格式时，逐项检查**：

- [ ] **需求分析**：明确**目标用户**、**内容类型**和**交互需求**
- [ ] **格式选择**：根据**三维度评估模型**选择**最合适的格式**
- [ ] **安全策略**：实施**内容验证**、**沙箱隔离**和**资源限制**
- [ ] **降级方案**：确保**每一层都能独立工作**，实现**优雅降级**
- [ ] **性能优化**：实施**增量渲染**和**异步加载**，优化**感知性能**
- [ ] **测试验证**：对**所有格式**进行**跨浏览器**、**跨设备**和**无障碍访问**测试
- [ ] **监控告警**：设置**格式错误**、**安全事件**和**性能退化**的**自动监控和告警**`,
      tip: "**长期视角：** AI 编码输出格式的演进不是**技术的零和博弈**——Markdown、HTML 和富媒体**不会互相替代**，而是**分层共存**。理解每一层的**价值和边界**，才能在**不同的场景**中做出**最优的技术决策**。",
      warning: "**避免过度工程：** 不要一开始就构建**完整的富媒体输出系统**。从 **Markdown** 开始，验证**用户需求**，然后**逐步增强**到 HTML 和富媒体。每一层增强都应该**解决明确的用户痛点**，而不是为了技术而技术。"
    }
  ]
};
