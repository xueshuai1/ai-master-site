#!/usr/bin/env node
/**
 * 稳健更新 tools.ts — 用 AST 级正则替换，避免错误匹配
 * 策略：逐工具块定位，块内替换 githubStars / forks / language / updatedAt
 */
const fs = require('fs');
const path = require('path');

const TOOLS_PATH = path.resolve(__dirname, '..', 'src', 'data', 'tools.ts');
const REPO_DATA_PATH = path.resolve(__dirname, '..', 'data', '_github-repo-data.json');
const TOPICS_PATH = path.resolve(__dirname, '..', 'data', 'ai-topics.json');

const repoData = JSON.parse(fs.readFileSync(REPO_DATA_PATH, 'utf-8'));
const existingTopics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
const existingTopicSet = new Set(existingTopics.topics.map(t => t.topic.toLowerCase()));

// 构建 url_path_lower → data
const repoMap = new Map();
for (const [key, data] of Object.entries(repoData.repoData)) {
  repoMap.set(key.toLowerCase(), data);
}

let toolsContent = fs.readFileSync(TOOLS_PATH, 'utf-8');

const updates = {
  starsChanged: [],
  forksChanged: [],
  languageChanged: [],
  updatedAtChanged: []
};

// 提取所有 GitHub url
const urlRegex = /url:\s*["'](https:\/\/github\.com\/[^"']+)["']/gi;
let urlMatch;
const processedUrls = new Set();

while ((urlMatch = urlRegex.exec(toolsContent)) !== null) {
  const fullUrl = urlMatch[1];
  const urlPath = fullUrl.replace('https://github.com/', '').replace(/\/$/, '').toLowerCase();
  
  if (processedUrls.has(urlPath)) continue;
  processedUrls.add(urlPath);
  
  const data = repoMap.get(urlPath);
  if (!data) continue;
  
  const { stars, forks, language, updatedAt } = data;
  
  // 定位 url 行在内容中的位置
  const urlIdx = urlMatch.index;
  
  // 向前找工具块起始: 找最近的 { (工具对象开始)
  let blockStart = urlIdx;
  while (blockStart > 0 && toolsContent[blockStart] !== '{') blockStart--;
  
  // 向后找工具块结束: 匹配 {} 括号
  let braceCount = 0;
  let blockEnd = -1;
  for (let i = blockStart; i < toolsContent.length; i++) {
    if (toolsContent[i] === '{') braceCount++;
    if (toolsContent[i] === '}') {
      braceCount--;
      if (braceCount === 0) { blockEnd = i; break; }
    }
  }
  if (blockEnd === -1) continue;
  
  const block = toolsContent.substring(blockStart, blockEnd + 1);
  const blockPrefix = toolsContent.substring(0, blockStart);
  const blockSuffix = toolsContent.substring(blockEnd + 1);
  
  let newBlock = block;
  
  // 更新 githubStars
  const starsRegex = /githubStars:\s*\d+/;
  const starsInBlock = starsRegex.exec(newBlock);
  if (starsInBlock) {
    const oldStars = parseInt(starsInBlock[0].match(/\d+/)[0]);
    if (oldStars !== stars) {
      newBlock = newBlock.replace(starsRegex, `githubStars: ${stars}`);
      updates.starsChanged.push({ urlPath, old: oldStars, new: stars, delta: stars - oldStars });
    }
  }
  
  // 更新 forks
  const forksRegex = /forks:\s*\d+/;
  const forksInBlock = forksRegex.exec(newBlock);
  if (forksInBlock) {
    const oldForks = parseInt(forksInBlock[0].match(/\d+/)[0]);
    if (oldForks !== forks) {
      newBlock = newBlock.replace(forksRegex, `forks: ${forks}`);
      updates.forksChanged.push({ urlPath, old: oldForks, new: forks });
    }
  }
  
  // 更新 language
  if (language) {
    const langRegex = /language:\s*"[^"]*"/;
    const langInBlock = langRegex.exec(newBlock);
    if (langInBlock) {
      const oldLang = langInBlock[0].match(/"([^"]*)"/)[1];
      if (oldLang !== language) {
        newBlock = newBlock.replace(langRegex, `language: "${language}"`);
        updates.languageChanged.push({ urlPath, old: oldLang, new: language });
      }
    }
  }
  
  // 更新 updatedAt
  if (updatedAt) {
    const dateRegex = /updatedAt:\s*"[^"]*"/;
    const dateInBlock = dateRegex.exec(newBlock);
    if (dateInBlock) {
      const oldDate = dateInBlock[0].match(/"([^"]*)"/)[1];
      if (oldDate !== updatedAt) {
        newBlock = newBlock.replace(dateRegex, `updatedAt: "${updatedAt}"`);
        updates.updatedAtChanged.push({ urlPath, old: oldDate, new: updatedAt });
      }
    }
  }
  
  // 替换回原内容
  toolsContent = blockPrefix + newBlock + blockSuffix;
}

fs.writeFileSync(TOOLS_PATH, toolsContent);

console.log('\n=== tools.ts 更新 ===');
console.log(`Stars 变化: ${updates.starsChanged.length}`);
updates.starsChanged.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
for (const s of updates.starsChanged.slice(0, 10)) {
  console.log(`  ${s.urlPath}: ${s.old} → ${s.new} (${s.delta > 0 ? '+' : ''}${s.delta})`);
}
if (updates.starsChanged.length > 10) console.log(`  ... +${updates.starsChanged.length - 10}`);

console.log(`\nForks 变化: ${updates.forksChanged.length}`);
for (const f of updates.forksChanged.slice(0, 5)) {
  console.log(`  ${f.urlPath}: ${f.old} → ${f.new}`);
}

console.log(`\nLanguage 变化: ${updates.languageChanged.length}`);
for (const l of updates.languageChanged.slice(0, 5)) {
  console.log(`  ${l.urlPath}: "${l.old}" → "${l.new}"`);
}

console.log(`\nUpdatedAt 变化: ${updates.updatedAtChanged.length}`);
for (const u of updates.updatedAtChanged.slice(0, 5)) {
  console.log(`  ${u.urlPath}: ${u.old} → ${u.new}`);
}

// 分析新 Topics
const allTopics = new Map(); // topic_lower → { original, repos: Set, maxStars }
for (const [key, data] of Object.entries(repoData.repoData)) {
  if (data.topics) {
    for (const t of data.topics) {
      const lower = t.toLowerCase();
      if (!allTopics.has(lower)) {
        allTopics.set(lower, { original: t, repos: new Set(), maxStars: 0 });
      }
      const entry = allTopics.get(lower);
      entry.repos.add(key);
      entry.maxStars = Math.max(entry.maxStars, data.stars || 0);
    }
  }
}

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

const newTopics = [];
for (const [lower, info] of allTopics) {
  if (existingTopicSet.has(lower)) continue;
  if (info.repos.size === 1 && info.maxStars < 1000) continue;
  if (!isAITopic(lower)) continue;
  
  let minStars;
  if (info.repos.size >= 3) minStars = 2000;
  else if (info.repos.size >= 2) minStars = 3000;
  else minStars = 5000;

  newTopics.push({
    topic: lower,
    url: `https://github.com/topics/${lower}`,
    minStars,
    description: `（自动发现）${lower.replace(/-/g, ' ')}`
  });
}

console.log(`\n新 AI Topics: ${newTopics.length}`);
for (const t of newTopics.slice(0, 20)) {
  const info = allTopics.get(t.topic);
  console.log(`  • ${t.topic} — ${info.repos.size} 个仓库使用, max ⭐${info.maxStars}`);
}
if (newTopics.length > 20) console.log(`  ... +${newTopics.length - 20}`);

// 保存更新摘要
fs.writeFileSync(
  path.resolve(__dirname, '..', 'data', '_update-summary.json'),
  JSON.stringify({ updates, newTopics }, null, 2)
);
