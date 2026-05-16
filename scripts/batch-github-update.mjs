/**
 * Batch update tools.ts:
 * 1. Add new discovered repos
 * 2. Refresh stars/forks/language for all existing GitHub repos
 */
import fs from 'fs';
import https from 'https';

const TOKEN = fs.readFileSync('.env.local', 'utf-8')
  .split('\n').find(l => l.startsWith('GITHUB_TOKEN='))
  ?.split('=')[1].trim();

const TOOLS_PATH = 'src/data/tools.ts';

// ── New repos to add (manually curated from topic scans) ──
const NEW_REPOS = [
  {
    repo: 'VectifyAI/PageIndex',
    category: 'rag',
    icon: '📑',
    tags: ['无向量RAG', '推理检索', '文档索引', '开源'],
    price: '开源',
    pros: ['无需向量数据库即可实现RAG', '基于推理的检索更精准', '开源免费', '31K+ stars 社区活跃'],
    cons: ['相对较新项目，生态仍在建设', '大规模文档索引性能待验证', '文档和示例较少'],
    useCase: '企业文档检索、知识库问答、无向量数据库的RAG系统',
    learnMore: 'https://github.com/VectifyAI/PageIndex',
  },
  {
    repo: '666ghj/BettaFish',
    category: 'agent',
    icon: '🐟',
    tags: ['舆情分析', '多Agent', '中文优化', '独立实现'],
    price: '开源',
    pros: ['从零实现不依赖框架', '多Agent协作舆情分析', '中文场景深度优化', '40K+ stars 社区活跃'],
    cons: ['主要面向中文舆情场景', '非通用Agent框架', '预测准确性需人工验证'],
    useCase: '舆情监控分析、公共事件趋势预测、市场调研辅助',
    learnMore: 'https://github.com/666ghj/BettaFish',
  },
  {
    repo: 'Kilo-Org/kilocode',
    category: 'coding',
    icon: '⚡',
    tags: ['编程Agent', '开源', 'VS Code', 'JetBrains', '多模型'],
    price: '开源',
    pros: ['最受欢迎的开源编程Agent', '支持 VS Code 和 JetBrains', '多模型支持 Claude/Gemini/Sonnet', '19K+ stars 增长迅速'],
    cons: ['相对 Claude Code 生态较小', '企业级部署案例较少', '文档仍在完善中'],
    useCase: '日常编程辅助、代码生成与审查、自动化调试',
    learnMore: 'https://github.com/Kilo-Org/kilocode',
  },
  {
    repo: 'oraios/serena',
    category: 'mcp',
    icon: '🎵',
    tags: ['MCP', '语义检索', '编码工具', 'JetBrains'],
    price: '开源',
    pros: ['为Agent打造的IDE级编码工具', '语义检索和编辑能力', '支持 JetBrains 和语言服务器', '24K+ stars'],
    cons: ['主要面向Python生态', 'IDE集成需要配置', '复杂项目可能需要额外工具'],
    useCase: 'AI Agent 编码辅助、代码语义检索、大规模代码编辑',
    learnMore: 'https://github.com/oraios/serena',
  },
  {
    repo: 'tirth8205/code-review-graph',
    category: 'coding',
    icon: '🕸️',
    tags: ['代码审查', '知识图谱', 'Claude Code', 'Token优化'],
    price: '开源',
    pros: ['代码库知识图谱持久化', 'Token消耗降低6.8倍（审查）至49倍（编码）', '与Claude Code深度集成', '16K+ stars'],
    cons: ['主要针对Claude Code生态', '知识图谱构建需要时间', '大规模代码库性能待验证'],
    useCase: 'AI代码审查加速、代码库理解、日常编码辅助',
    learnMore: 'https://github.com/tirth8205/code-review-graph',
  },
  {
    repo: 'Alibaba-NLP/DeepResearch',
    category: 'agent',
    icon: '🔬',
    tags: ['深度研究', '阿里巴巴', '开源', 'Web Agent'],
    price: '开源',
    pros: ['通义实验室出品', '领先的开源深度研究Agent', '信息检索和综合分析能力强', '18K+ stars'],
    cons: ['主要面向英文研究场景', '需要较强的LLM支持', '大规模研究消耗较多token'],
    useCase: '学术深度研究、行业分析报告、信息搜集与综合',
    learnMore: 'https://github.com/Alibaba-NLP/DeepResearch',
  },
  {
    repo: 'wanshuiyin/Auto-claude-code-research-in-sleep',
    category: 'agent',
    icon: '⚔️',
    tags: ['自主研究', 'Claude Code', 'ML研究', '技能包'],
    price: '开源',
    pros: ['轻量级Markdown技能包', '跨模型review循环', '无框架锁定兼容多Agent', '9.4K+ stars 快速增长'],
    cons: ['主要面向ML研究场景', '需要Claude Code等Agent平台', '实验自动化需一定ML基础'],
    useCase: '自主ML研究、论文评审自动化、实验创意发现',
    learnMore: 'https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep',
  },
];

function ghRequest(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com',
      path,
      headers: {
        'User-Agent': 'ai-master-site-bot',
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    https.get(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) resolve(JSON.parse(data));
        else if (res.statusCode === 403) {
          console.error(`Rate limited on ${path}`);
          resolve(null);
        } else reject(new Error(`${res.statusCode} on ${path}`));
      });
    }).on('error', reject);
  });
}

async function main() {
  const content = fs.readFileSync(TOOLS_PATH, 'utf-8');

  // ── Phase 1: Fetch existing repos for star updates ──
  const repoRegex = /url:\s*['"]https:\/\/github\.com\/([^'"]+)['"]/g;
  const existingRepos = [];
  let m;
  while ((m = repoRegex.exec(content)) !== null) {
    existingRepos.push(m[1]);
  }
  const uniqueRepos = [...new Set(existingRepos)];
  console.log(`Found ${uniqueRepos.length} unique GitHub repos in tools.ts`);

  // ── Combine with new repos ──
  const allRepos = [...NEW_REPOS.map(n => n.repo), ...uniqueRepos.filter(r => !NEW_REPOS.some(n => n.repo === r))];

  const repoData = {};
  let fetched = 0;
  let rateLimited = 0;

  for (const repo of allRepos) {
    if (fetched % 20 === 0 && fetched > 0) {
      console.log(`Fetched ${fetched}/${allRepos.length}, waiting...`);
      await new Promise(r => setTimeout(r, 5000)); // Rate limit guard
    }

    const data = await ghRequest(`/repos/${repo}`);
    fetched++;
    if (!data) {
      rateLimited++;
      console.log(`  [${fetched}/${allRepos.length}] ⏸ ${repo} — rate limited`);
      await new Promise(r => setTimeout(r, 10000));
      const retry = await ghRequest(`/repos/${repo}`);
      fetched++;
      if (retry) {
        repoData[repo] = retry;
        console.log(`  [${fetched}] ✅ ${repo} — ${retry.stargazers_count} stars (retry)`);
      } else {
        console.log(`  [${fetched}] ❌ ${repo} — retry failed`);
      }
      continue;
    }
    repoData[repo] = data;
    console.log(`  [${fetched}/${allRepos.length}] ✅ ${repo} — ${data.stargazers_count} stars`);

    // 1s delay between requests
    if (fetched < allRepos.length) await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\nSummary: fetched ${fetched}, rate limited ${rateLimited}`);

  // ── Phase 2: Write output for next step ──
  fs.writeFileSync('scripts/github-data.json', JSON.stringify(repoData, null, 2));
  fs.writeFileSync('scripts/new-repos.json', JSON.stringify(NEW_REPOS, null, 2));
  console.log('Data saved to scripts/github-data.json and scripts/new-repos.json');
}

main().catch(console.error);
