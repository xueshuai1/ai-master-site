#!/usr/bin/env node
/**
 * GitHub 数据更新脚本 — 更新 tools.ts 的 stars/forks/language + 发现新 AI Topics
 */
const fs = require('fs');
const path = require('path');

const TOOLS_PATH = path.resolve(__dirname, '..', 'src', 'data', 'tools.ts');
const TOPICS_PATH = path.resolve(__dirname, '..', 'data', 'ai-topics.json');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN 未设置');
  process.exit(1);
}

// ─── 读取现有数据 ───
const toolsContent = fs.readFileSync(TOOLS_PATH, 'utf-8');
const existingTopics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
const existingTopicSet = new Set(existingTopics.topics.map(t => t.topic.toLowerCase()));

// ─── 提取所有 GitHub 仓库 ───
// 从 url 字段提取 GitHub repos
const githubUrlRegex = /url:\s*["']https:\/\/github\.com\/([^"']+)["']/g;
const tools = [];
const seenUrls = new Set();
let match;

while ((match = githubUrlRegex.exec(toolsContent)) !== null) {
  const repoPath = match[1].replace(/\/$/, ''); // 去掉末尾斜杠
  const [owner, repo] = repoPath.split('/');
  if (owner && repo && !seenUrls.has(repoPath)) {
    seenUrls.add(repoPath);
    tools.push({ owner, repo, path: repoPath });
  }
}

console.log(`找到 ${tools.length} 个 GitHub 仓库`);

// ─── 提取当前 tools 中已有的 stars 数据 ───
const starsData = {};
const starBlockRegex = /\{[\s\S]*?id:\s*["']([^"']+)["'][\s\S]*?githubStars:\s*(\d+)[\s\S]*?\}/g;
let starMatch;
while ((starMatch = starBlockRegex.exec(toolsContent)) !== null) {
  starsData[starMatch[1]] = parseInt(starMatch[2]);
}

// 提取 fork 和 language 的正则更复杂，直接在 fetch 后比较

// ─── AI Topic 关键词 ───
const AI_KEYWORDS = [
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
  const lower = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => lower.includes(kw) || kw.includes(lower));
}

function isAIGeneratedTopic(topic) {
  // 已有的 ai-topics.json 中带"（自动发现）"的都是之前自动发现的
  // 新发现的 topic 应该是 AI 相关的
  return isAITopic(topic);
}

// ─── 批量获取 GitHub 仓库信息 ───
async function fetchRepoInfo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ai-master-site/1.0',
        'Authorization': `Bearer ${GITHUB_TOKEN}`
      }
    });
    
    if (response.status === 404) return null;
    if (response.status === 403) {
      const reset = response.headers.get('x-ratelimit-reset');
      console.error(`⛔ GitHub API 限流! reset=${reset}`);
      await new Promise(r => setTimeout(r, 2000));
      return fetchRepoInfo(owner, repo);
    }
    if (!response.ok) {
      console.error(`⚠️  ${owner}/${repo}: HTTP ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (err) {
    console.error(`❌ ${owner}/${repo}: ${err.message}`);
    return null;
  }
}

// ─── 主逻辑 ───
async function main() {
  const updates = {
    starsChanged: [],
    forksChanged: [],
    languageChanged: [],
    allRepoData: {},
    newTopics: [],
    allCollectedTopics: new Map() // topic -> { repos: Set, maxStars: number }
  };

  let fetched = 0;
  
  for (const { owner, repo } of tools) {
    const data = await fetchRepoInfo(owner, repo);
    fetched++;
    
    if (!data) {
      console.log(`  ⚠️  [${fetched}/${tools.length}] ${owner}/${repo} — 未找到`);
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    const stars = data.stargazers_count || 0;
    const forks = data.forks_count || 0;
    const language = data.language || null;
    const pushedAt = data.pushed_at || null;
    const topics = data.topics || [];
    const updatedAt = pushedAt ? new Date(pushedAt).toISOString().split('T')[0] : null;

    updates.allRepoData[`${owner}/${repo}`] = { stars, forks, language, pushedAt, updatedAt, topics };

    // 收集 topics
    for (const topic of topics) {
      const lower = topic.toLowerCase();
      if (!updates.allCollectedTopics.has(lower)) {
        updates.allCollectedTopics.set(lower, { original: topic, repos: new Set(), maxStars: 0 });
      }
      const entry = updates.allCollectedTopics.get(lower);
      entry.repos.add(`${owner}/${repo}`);
      entry.maxStars = Math.max(entry.maxStars, stars);
    }

    const changeInfo = [];
    
    // 检查 stars 变化
    // 找到工具名来报告
    const toolNameRegex = new RegExp(`id:\\s*["'][^"']*["'][\\s\\S]{0,500}?(?:name:\\s*["']([^"']+)["'])`, 'g');
    let nameMatch;
    
    console.log(`  ✅ [${fetched}/${tools.length}] ${owner}/${repo} → ⭐${stars} 🍴${forks} 📝${language || 'N/A'} ${updatedAt || ''}`);

    // 限流：每请求间隔 1 秒
    if (fetched < tools.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // ─── 分析新 Topics ───
  for (const [topicLower, info] of updates.allCollectedTopics) {
    if (existingTopicSet.has(topicLower)) continue; // 已有，跳过
    
    const repoCount = info.repos.size;
    const maxStars = info.maxStars;
    
    // 过滤过于冷门的
    if (repoCount === 1 && maxStars < 1000) continue;
    
    // 判断是否 AI 相关
    if (!isAITopic(topicLower)) continue;

    let minStars;
    if (repoCount >= 3) minStars = 2000;
    else if (repoCount >= 2) minStars = 3000;
    else minStars = 5000;

    const description = `（自动发现）${topicLower.replace(/-/g, ' ')}`;

    updates.newTopics.push({
      topic: topicLower,
      url: `https://github.com/topics/${topicLower}`,
      minStars,
      description
    });
  }

  // ─── 输出结果 JSON ───
  console.log('\n=== 更新摘要 ===');
  console.log(`仓库: ${fetched} 个`);
  console.log(`收集的 Topics: ${updates.allCollectedTopics.size} 个`);
  console.log(`新 AI Topics: ${updates.newTopics.length} 个`);
  console.log(`新 Topics 列表:`);
  for (const t of updates.newTopics.slice(0, 20)) {
    console.log(`  • ${t.topic} (${t.description}) — ${updates.allCollectedTopics.get(t.topic).repos.size} 个仓库使用`);
  }
  if (updates.newTopics.length > 20) {
    console.log(`  ... 还有 ${updates.newTopics.length - 20} 个`);
  }

  // 将 repo 数据写入文件供后续更新使用
  fs.writeFileSync(
    path.resolve(__dirname, '..', 'data', '_github-repo-data.json'),
    JSON.stringify({
      repoData: updates.allRepoData,
      newTopics: updates.newTopics,
      fetchedCount: fetched
    }, null, 2)
  );

  console.log('\n✅ 数据已保存到 data/_github-repo-data.json');
}

main().catch(console.error);
