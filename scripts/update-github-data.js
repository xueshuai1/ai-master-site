#!/usr/bin/env node
/**
 * 批量更新 GitHub stars + 仓库信息 + Topic 发现
 * 使用 Authorization header 认证
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TOOLS_PATH = path.join(__dirname, '..', 'src', 'data', 'tools.ts');
const TOPICS_PATH = path.join(__dirname, '..', 'data', 'ai-topics.json');
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error('GITHUB_TOKEN 未设置');
  process.exit(1);
}

// ========== 1. 解析 tools.ts ==========
const toolsContent = fs.readFileSync(TOOLS_PATH, 'utf-8');
const urlRegex = /url:\s*["'](https:\/\/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+))["']/g;
let match;
const repos = new Set();
while ((match = urlRegex.exec(toolsContent)) !== null) {
  repos.add(match[2].toLowerCase());
}

const filteredRepos = [...repos].filter(r => {
  const parts = r.split('/');
  return parts.length === 2 && parts[0] && parts[1]
    && r !== 'features/copilot' && r !== 'en/copilot';
});

console.log(`共找到 ${filteredRepos.length} 个 GitHub 仓库`);

// ========== 2. 读取已有 topics ==========
let topicsData;
try {
  topicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
} catch {
  topicsData = { description: '', lastUpdated: '', minStarsThreshold: 5000, topics: [] };
}
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// ========== 3. AI 关键词 ==========
const aiKeywords = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
  'large-language-models', 'retrieval-augmented', 'instruction-tuning', 'rlhf',
  'alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return aiKeywords.some(kw => t.includes(kw) || kw.includes(t));
}

// ========== 4. 用 curl 获取（带 Authorization 头） ==========
function fetchRepo(repo) {
  const cmd = `curl -s -H "Authorization: token ${TOKEN}" "https://api.github.com/repos/${repo}"`;
  try {
    const out = execSync(cmd, { encoding: 'utf-8', timeout: 15000 });
    const data = JSON.parse(out);
    if (data.message && data.message.includes('Not Found')) return null;
    return data;
  } catch (e) {
    console.error(`  ❌ ${repo}: ${e.message.substring(0, 100)}`);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const results = [];
  let count = 0;

  for (const repo of filteredRepos) {
    count++;
    if (count % 10 === 0) {
      console.log(`  已查询 ${count}/${filteredRepos.length}...`);
    }

    const data = fetchRepo(repo);
    if (data && data.stargazers_count !== undefined) {
      results.push({
        repo: repo.toLowerCase(),
        stargazers_count: data.stargazers_count,
        pushed_at: data.pushed_at,
        forks_count: data.forks_count || 0,
        language: data.language,
        topics: (data.topics || []).map(t => t.toLowerCase())
      });
    }

    // 限流保护
    if (count % 5 === 0) await sleep(1500);
    else await sleep(1000);
  }

  console.log(`\n成功获取 ${results.length}/${filteredRepos.length} 个仓库信息`);

  // ========== 5. 构建 stars 映射 ==========
  const starsMap = {};
  for (const r of results) {
    starsMap[r.repo] = {
      stargazers_count: r.stargazers_count,
      pushed_at: r.pushed_at ? new Date(r.pushed_at).toISOString().split('T')[0] : null,
      forks_count: r.forks_count,
      language: r.language,
      topics: r.topics
    };
  }

  // ========== 6. 更新 tools.ts ==========
  let toolsChanged = 0;
  let forksUpdated = 0;
  let languageUpdated = 0;
  let starsChanges = [];

  // 正则匹配每个工具对象
  const toolBlockRegex = /\{[\s\S]*?url:\s*["']https:\/\/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)["'][\s\S]*?\n\s*\}/g;
  let toolMatch;
  const replacements = [];

  while ((toolMatch = toolBlockRegex.exec(toolsContent)) !== null) {
    const repoPath = toolMatch[1].toLowerCase();
    const block = toolMatch[0];
    const info = starsMap[repoPath];
    if (!info) continue;

    let modified = false;
    let newBlock = block;

    // githubStars
    const starsM = newBlock.match(/githubStars:\s*(\d+)/);
    if (starsM) {
      const oldStars = parseInt(starsM[1]);
      const newStars = info.stargazers_count;
      if (oldStars !== newStars) {
        newBlock = newBlock.replace(/githubStars:\s*\d+/, `githubStars: ${newStars}`);
        toolsChanged++;
        starsChanges.push({ repo: repoPath, old: oldStars, new: newStars, diff: newStars - oldStars });
        modified = true;
      }
    }

    // updatedAt
    if (info.pushed_at) {
      const updM = newBlock.match(/updatedAt:\s*["']([\d-]+)["']/);
      if (updM) {
        const oldDate = updM[1];
        if (oldDate !== info.pushed_at) {
          newBlock = newBlock.replace(/updatedAt:\s*["'][\d-]+["']/, `updatedAt: "${info.pushed_at}"`);
          modified = true;
        }
      }
    }

    // forks
    if (info.forks_count) {
      const fkM = newBlock.match(/forks:\s*(\d+)/);
      if (fkM) {
        const oldForks = parseInt(fkM[1]);
        if (oldForks !== info.forks_count) {
          newBlock = newBlock.replace(/forks:\s*\d+/, `forks: ${info.forks_count}`);
          forksUpdated++;
          modified = true;
        }
      } else {
        if (newBlock.includes('createdAt:')) {
          newBlock = newBlock.replace(/(createdAt:\s*"[^"]+")/, `forks: ${info.forks_count},\n    $1`);
          forksUpdated++; modified = true;
        } else if (newBlock.includes('updatedAt:')) {
          newBlock = newBlock.replace(/(updatedAt:\s*"[^"]+")/, `$1,\n    forks: ${info.forks_count}`);
          forksUpdated++; modified = true;
        }
      }
    }

    // language
    if (info.language && info.language !== 'null' && info.language !== 'None') {
      const lgM = newBlock.match(/language:\s*["']([^'"]+)["']/);
      if (lgM) {
        if (lgM[1] !== info.language) {
          newBlock = newBlock.replace(/language:\s*["'][^'"]+["']/, `language: "${info.language}"`);
          languageUpdated++; modified = true;
        }
      } else {
        if (newBlock.includes('createdAt:')) {
          newBlock = newBlock.replace(/(createdAt:\s*"[^"]+")/, `language: "${info.language}",\n    $1`);
          languageUpdated++; modified = true;
        } else if (newBlock.includes('updatedAt:')) {
          newBlock = newBlock.replace(/(updatedAt:\s*"[^"]+")/, `$1,\n    language: "${info.language}"`);
          languageUpdated++; modified = true;
        }
      }
    }

    if (modified) {
      replacements.push({ old: block, new: newBlock });
    }
  }

  if (replacements.length > 0) {
    let updated = toolsContent;
    for (const r of replacements) {
      updated = updated.replace(r.old, r.new);
    }
    fs.writeFileSync(TOOLS_PATH, updated, 'utf-8');
    console.log(`\ntools.ts 更新完成: stars=${toolsChanged}, forks=${forksUpdated}, language=${languageUpdated}`);
  } else {
    console.log('\ntools.ts 无变化');
  }

  if (starsChanges.length > 0) {
    starsChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    console.log('\nStars 变化 Top 10:');
    starsChanges.slice(0, 10).forEach(c => {
      const sign = c.diff > 0 ? '+' : '';
      console.log(`  ${c.repo}: ${c.old} → ${c.new} (${sign}${c.diff})`);
    });
  }

  // ========== 7. 新 Topic 发现 ==========
  const allTopics = {};
  for (const r of results) {
    for (const t of r.topics) {
      if (!allTopics[t]) allTopics[t] = { count: 0, maxStars: 0 };
      allTopics[t].count++;
      if (r.stargazers_count > allTopics[t].maxStars) {
        allTopics[t].maxStars = r.stargazers_count;
      }
    }
  }

  const newTopics = [];
  for (const [topic, info] of Object.entries(allTopics)) {
    if (existingTopics.has(topic)) continue;
    if (info.count === 1 && info.maxStars < 1000) continue;
    if (!isAITopic(topic)) continue;

    let minStars;
    if (info.count >= 3) minStars = 2000;
    else if (info.count >= 2) minStars = 3000;
    else minStars = 5000;

    newTopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description: `（自动发现）${topic.replace(/-/g, ' ')}`
    });
  }

  if (newTopics.length > 0) {
    topicsData.topics.push(...newTopics);
    topicsData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2), 'utf-8');
    console.log(`\nai-topics.json 新增 ${newTopics.length} 个 Topic:`);
    newTopics.forEach(t => console.log(`  ${t.topic} (${t.minStars}+ stars)`));
  } else {
    console.log('\n未发现新的 AI Topic');
  }

  // ========== 8. 汇总 ==========
  let oldestRepo = '', oldestDays = 0;
  for (const r of results) {
    if (r.pushed_at) {
      const d = Math.floor((Date.now() - new Date(r.pushed_at).getTime()) / 86400000);
      if (d > oldestDays) { oldestDays = d; oldestRepo = r.repo; }
    }
  }

  console.log('\n========== 汇总 ==========');
  console.log(`仓库扫描: ${results.length}`);
  console.log(`Stars 更新: ${toolsChanged}`);
  console.log(`Forks 更新: ${forksUpdated}`);
  console.log(`Language 更新: ${languageUpdated}`);
  console.log(`新 Topic 发现: ${newTopics.length}`);
  console.log(`总 Topics: ${topicsData.topics.length}`);
  if (oldestRepo) console.log(`最后更新最久: ${oldestRepo}（${oldestDays} 天前）`);

  const summary = {
    reposScanned: results.length,
    starsUpdated: toolsChanged,
    forksUpdated,
    languageUpdated,
    starsChanges: starsChanges.slice(0, 5),
    oldestRepo, oldestDays,
    newTopicsCount: newTopics.length,
    newTopics: newTopics.slice(0, 15),
    totalTopics: topicsData.topics.length
  };
  fs.writeFileSync(path.join(__dirname, '..', 'scripts', 'update-summary.json'), JSON.stringify(summary, null, 2));
  console.log('汇总已写入 scripts/update-summary.json');
})();
