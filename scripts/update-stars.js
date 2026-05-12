#!/usr/bin/env node
// 批量更新 GitHub stars + 仓库信息 + Topic 发现
import { readFileSync, writeFileSync } from 'fs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TOOLS_PATH = 'src/data/tools.ts';
const TOPICS_PATH = 'data/ai-topics.json';

const headers = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ai-master-site-stars-bot'
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchRepo(owner, repo, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (res.status === 404) return { error: 'not_found' };
      if (res.status === 403) {
        const reset = res.headers.get('x-ratelimit-reset');
        console.error(`⚠️ GitHub API 限流，重置: ${new Date(reset * 1000).toISOString()}`);
        if (i < retries) { await sleep(5000); continue; }
        return { error: 'rate_limited' };
      }
      if (!res.ok) {
        console.error(`⚠️ HTTP ${res.status} for ${owner}/${repo}`);
        if (i < retries) { await sleep(2000); continue; }
        return { error: `http_${res.status}` };
      }
      return await res.json();
    } catch (e) {
      console.error(`⚠️ Fetch error for ${owner}/${repo}: ${e.message}`);
      if (i < retries) { await sleep(2000); continue; }
      return { error: e.message };
    }
  }
}

function extractRepoPath(url) {
  const m = url.match(/github\.com\/([^/]+\/[^/]+)/);
  return m ? m[1] : null;
}

function isAITopic(topic) {
  const aiKeywords = [
    'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
    'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
    'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
    'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
    'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
    'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
    'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
    'large-language-models', 'retrieval-augmented', 'instruction-tuning',
    'rlhf', 'alignment'
  ];
  const t = topic.toLowerCase();
  return aiKeywords.some(kw => t === kw || t.includes(kw) || kw.includes(t.replace(/-/g, '')));
}

// 解析 tools.ts 中的工具块
function parseToolBlocks(content) {
  const blocks = [];
  // 匹配每个工具对象块
  const regex = /\{\s*id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?url:\s*"(https:\/\/github\.com\/[^"]+)"[\s\S]*?\n\s*\}(?=\s*,\s*\n)/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const block = m[0];
    const blockStart = m.index;
    const id = m[1];
    const name = m[2];
    const url = m[3];
    const repoPath = extractRepoPath(url);
    
    const starsMatch = block.match(/githubStars:\s*(\d+)/);
    const forksMatch = block.match(/forks:\s*(\d+)/);
    const langMatch = block.match(/language:\s*"([^"]+)"/);
    const updatedMatch = block.match(/updatedAt:\s*"([^"]+)"/);
    
    blocks.push({
      id, name, url, repoPath,
      githubStars: starsMatch ? parseInt(starsMatch[1]) : null,
      forks: forksMatch ? parseInt(forksMatch[1]) : null,
      language: langMatch ? langMatch[1] : null,
      updatedAt: updatedMatch ? updatedMatch[1] : null,
      blockText: block,
      blockStart,
    });
  }
  return blocks;
}

async function main() {
  const toolsContent = readFileSync(TOOLS_PATH, 'utf8');
  const topicsData = JSON.parse(readFileSync(TOPICS_PATH, 'utf8'));
  
  const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
  
  const toolBlocks = parseToolBlocks(toolsContent);
  console.log(`📦 找到 ${toolBlocks.length} 个 GitHub 仓库工具`);
  
  // 按仓库去重
  const repoMap = {};
  for (const block of toolBlocks) {
    if (!block.repoPath) continue;
    if (!repoMap[block.repoPath]) repoMap[block.repoPath] = [];
    repoMap[block.repoPath].push(block);
  }
  
  const uniqueRepos = Object.keys(repoMap);
  console.log(`🔗 去重后 ${uniqueRepos.length} 个唯一仓库`);
  
  const results = [];
  const allTopics = new Map();
  
  for (let i = 0; i < uniqueRepos.length; i++) {
    const [owner, repo] = uniqueRepos[i].split('/');
    console.log(`[${i+1}/${uniqueRepos.length}] 获取 ${owner}/${repo}...`);
    
    const data = await fetchRepo(owner, repo);
    if (data.error) {
      console.error(`  ❌ ${data.error}`);
      results.push({ repoPath: uniqueRepos[i], error: data.error, blocks: repoMap[uniqueRepos[i]] });
      await sleep(1100);
      continue;
    }
    
    const stars = data.stargazers_count;
    const forks = data.forks_count;
    const language = data.language || null;
    const pushedAt = data.pushed_at || null;
    const updatedAt = pushedAt ? pushedAt.split('T')[0] : null;
    const topics = data.topics || [];
    
    results.push({
      repoPath: uniqueRepos[i],
      stars, forks, language, updatedAt, topics,
      blocks: repoMap[uniqueRepos[i]],
    });
    
    // 收集 topics
    for (const topic of topics) {
      const t = topic.toLowerCase().replace(/\s+/g, '-');
      if (!allTopics.has(t)) allTopics.set(t, { repos: new Set() });
      allTopics.get(t).repos.add(uniqueRepos[i]);
    }
    
    if (i < uniqueRepos.length - 1) await sleep(1100);
  }
  
  // ── 更新 tools.ts ──
  let updatedContent = toolsContent;
  let starsUpdated = 0;
  let forksUpdated = 0;
  let langUpdated = 0;
  let updatedUpdated = 0;
  let changes = [];
  
  const allBlockUpdates = [];
  
  for (const result of results) {
    if (result.error) continue;
    for (const block of result.blocks) {
      let blockText = block.blockText;
      let hasChange = false;
      
      // 更新 githubStars
      if (result.stars !== null && result.stars !== block.githubStars) {
        if (blockText.includes('githubStars:')) {
          blockText = blockText.replace(/githubStars:\s*\d+/, `githubStars: ${result.stars}`);
        } else {
          // 找到插入位置：在 url 行之后
          const insertPoint = blockText.indexOf('url:') + blockText.match(/url:\s*"[^"]*"/)[0].length;
          const beforeInsert = blockText.substring(0, insertPoint);
          const afterInsert = blockText.substring(insertPoint);
          blockText = beforeInsert + `\n    githubStars: ${result.stars},` + afterInsert;
        }
        changes.push({ id: block.id, name: block.name, field: 'stars', old: block.githubStars, new: result.stars });
        starsUpdated++;
        hasChange = true;
      }
      
      // 更新 forks
      if (result.forks !== null && result.forks !== block.forks) {
        if (blockText.includes('forks:')) {
          blockText = blockText.replace(/forks:\s*\d+/, `forks: ${result.forks}`);
        } else if (blockText.includes('githubStars:')) {
          const insertPoint = blockText.indexOf('githubStars:') + blockText.match(/githubStars:\s*\d+/)[0].length;
          const before = blockText.substring(0, insertPoint);
          const after = blockText.substring(insertPoint);
          blockText = before + `,` + `\n    forks: ${result.forks},` + after.replace(/^,/, '').trimStart();
        } else {
          const insertPoint = blockText.indexOf('updatedAt:') + blockText.match(/updatedAt:\s*"[^"]*"/)[0].length;
          const before = blockText.substring(0, insertPoint);
          const after = blockText.substring(insertPoint);
          blockText = before + `,` + `\n    forks: ${result.forks},` + after.replace(/^,/, '').trimStart();
        }
        forksUpdated++;
        hasChange = true;
      }
      
      // 更新 language
      if (result.language && result.language !== 'null' && result.language !== block.language) {
        if (blockText.includes('language:')) {
          blockText = blockText.replace(/language:\s*"[^"]*"/, `language: "${result.language}"`);
        } else if (blockText.includes('forks:')) {
          const match = blockText.match(/forks:\s*\d+,?/);
          const insertPoint = blockText.indexOf('forks:') + match[0].length;
          const before = blockText.substring(0, insertPoint);
          const after = blockText.substring(insertPoint).trimStart();
          blockText = before + `\n    language: "${result.language}",` + after;
        } else if (blockText.includes('githubStars:')) {
          const match = blockText.match(/githubStars:\s*\d+,?/);
          const insertPoint = blockText.indexOf('githubStars:') + match[0].length;
          const before = blockText.substring(0, insertPoint);
          const after = blockText.substring(insertPoint).trimStart();
          blockText = before + `\n    language: "${result.language}",` + after;
        } else {
          const match = blockText.match(/updatedAt:\s*"[^"]*",?/);
          const insertPoint = blockText.indexOf('updatedAt:') + match[0].length;
          const before = blockText.substring(0, insertPoint);
          const after = blockText.substring(insertPoint).trimStart();
          blockText = before + `\n    language: "${result.language}",` + after;
        }
        langUpdated++;
        hasChange = true;
      }
      
      // 更新 updatedAt
      if (result.updatedAt && result.updatedAt !== block.updatedAt) {
        if (blockText.includes('updatedAt:')) {
          blockText = blockText.replace(/updatedAt:\s*"[^"]*"/, `updatedAt: "${result.updatedAt}"`);
        } else if (blockText.includes('githubStars:')) {
          const match = blockText.match(/githubStars:\s*\d+,?/);
          const insertPoint = blockText.indexOf('githubStars:') + match[0].length;
          const before = blockText.substring(0, insertPoint);
          const after = blockText.substring(insertPoint).trimStart();
          blockText = before + `\n    updatedAt: "${result.updatedAt}",` + after;
        }
        updatedUpdated++;
        hasChange = true;
      }
      
      if (hasChange) {
        allBlockUpdates.push({ start: block.blockStart, oldText: block.blockText, newText: blockText });
      }
    }
  }
  
  // 倒序替换
  allBlockUpdates.sort((a, b) => b.start - a.start);
  for (const update of allBlockUpdates) {
    updatedContent = updatedContent.substring(0, update.start) + update.newText + updatedContent.substring(update.start + update.oldText.length);
  }
  
  console.log(`\n📊 Stars 更新: ${starsUpdated}`);
  console.log(`📊 Forks 更新: ${forksUpdated}`);
  console.log(`📊 Language 更新: ${langUpdated}`);
  console.log(`📊 UpdatedAt 更新: ${updatedUpdated}`);
  
  // ── 新 Topic 发现 ──
  const newAITopics = [];
  for (const [topic, info] of allTopics) {
    if (existingTopics.has(topic)) continue;
    if (!isAITopic(topic)) continue;
    
    // 过于冷门跳过
    if (info.repos.size <= 1) {
      const repoStars = [...info.repos].map(r => {
        const result = results.find(rr => rr.repoPath === r);
        return result && !result.error ? result.stars : 0;
      });
      if (Math.max(...repoStars) < 1000) continue;
    }
    
    let minStars = info.repos.size >= 3 ? 2000 : info.repos.size >= 2 ? 3000 : 5000;
    const description = topic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    newAITopics.push({ topic, url: `https://github.com/topics/${topic}`, minStars, description: `（自动发现）${description}` });
  }
  
  console.log(`🔍 发现 ${newAITopics.length} 个新 AI Topic`);
  
  // ── 写文件 ──
  if (allBlockUpdates.length > 0) {
    writeFileSync(TOOLS_PATH, updatedContent, 'utf8');
    console.log('✅ tools.ts 已更新');
  } else {
    console.log('⏭️ tools.ts 无变化');
  }
  
  if (newAITopics.length > 0) {
    topicsData.topics.push(...newAITopics);
    topicsData.lastUpdated = new Date().toISOString();
    writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2), 'utf8');
    console.log('✅ ai-topics.json 已更新');
  } else {
    console.log('⏭️ ai-topics.json 无新 Topic');
  }
  
  // ── 变更摘要 ──
  const starChanges = changes.filter(c => c.field === 'stars').sort((a, b) => Math.abs(b.new - b.old) - Math.abs(a.new - a.old));
  const oldestTools = results
    .filter(r => r.updatedAt && !r.error)
    .map(r => ({ id: r.blocks[0].id, date: r.updatedAt, days: Math.floor((Date.now() - new Date(r.updatedAt).getTime()) / 86400000) }))
    .sort((a, b) => b.days - a.days)
    .slice(0, 5);
  
  const summary = {
    reposScanned: uniqueRepos.length,
    successCount: results.filter(r => !r.error).length,
    errorCount: results.filter(r => r.error).length,
    starsUpdated, forksUpdated, langUpdated, updatedUpdated,
    topStarChanges: starChanges.slice(0, 10),
    oldestTools,
    newTopicsCount: newAITopics.length,
    newTopics: newAITopics.slice(0, 15),
    totalTopics: topicsData.topics.length,
    fileChanges: allBlockUpdates.length,
  };
  
  writeFileSync('/tmp/update-summary.json', JSON.stringify(summary, null, 2));
  
  console.log('\n=== 变更摘要 ===');
  console.log(`仓库扫描: ${summary.reposScanned} 个，成功: ${summary.successCount}，失败: ${summary.errorCount}`);
  if (starChanges.length > 0) {
    console.log('⭐ Stars 变化最大的:');
    starChanges.slice(0, 5).forEach(c => console.log(`  ${c.name}: ${c.old} → ${c.new} (${c.new - c.old > 0 ? '+' : ''}${c.new - c.old})`));
  }
  console.log('📅 更新最旧的:');
  oldestTools.forEach(t => console.log(`  ${t.id}: ${t.date} (${t.days} 天前)`));
  if (newAITopics.length > 0) {
    console.log('🔍 新 Topic:');
    newAITopics.slice(0, 10).forEach(t => console.log(`  ${t.topic} — ${t.description} (${t.minStars}+ stars)`));
  }
}

main().catch(console.error);
