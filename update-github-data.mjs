import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN;
const TOOLS_FILE = path.join('src/data/tools.ts');
const TOPICS_FILE = path.join('data/ai-topics.json');

// AI 相关关键词
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

// 从 tools.ts 提取 GitHub URL
function extractGithubUrls(content) {
  const urls = content.match(/https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+/g);
  if (!urls) return [];
  // 去重（有些 URL 出现在 description 或 learnMore 中，只取 url 字段的）
  const urlFieldPattern = /url:\s*"(https:\/\/github\.com\/[^"]+)"/g;
  const urlFields = [];
  let match;
  while ((match = urlFieldPattern.exec(content)) !== null) {
    urlFields.push(match[1]);
  }
  // 去重
  return [...new Set(urlFields)];
}

// 从 URL 提取 owner/repo
function parseRepoUrl(url) {
  const parts = url.replace('https://github.com/', '').split('/');
  if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
  return null;
}

// 判断 topic 是否 AI 相关
function isAiRelated(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => t === kw || t.includes(kw) || kw.includes(t));
}

// 睡眠
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const toolsContent = fs.readFileSync(TOOLS_FILE, 'utf-8');
  const topicsData = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf-8'));
  
  // 已有 topic 集合（小写）
  const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
  
  // 提取所有 GitHub URL
  const urls = extractGithubUrls(toolsContent);
  console.log(`找到 ${urls.length} 个 GitHub 仓库 URL`);
  
  // 解析 repo 信息
  const repos = urls.map(u => parseRepoUrl(u)).filter(Boolean);
  console.log(`解析到 ${repos.length} 个仓库`);
  
  // 批量获取 GitHub API 数据
  const repoData = {};
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < repos.length; i++) {
    const { owner, repo } = repos[i];
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}?access_token=${TOKEN}`;
    
    try {
      const resp = await fetch(apiUrl, {
        headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'ai-master-site-bot' }
      });
      
      if (resp.status === 404) {
        console.log(`  [${i+1}/${repos.length}] 404: ${owner}/${repo}`);
        errorCount++;
        await sleep(1000);
        continue;
      }
      
      if (!resp.ok) {
        console.log(`  [${i+1}/${repos.length}] Error ${resp.status}: ${owner}/${repo}`);
        if (resp.status === 403) {
          const reset = resp.headers.get('x-ratelimit-reset');
          console.log(`  速率限制，等待到 ${new Date(reset * 1000).toISOString()}`);
          await sleep(5000);
        }
        errorCount++;
        await sleep(1000);
        continue;
      }
      
      const data = await resp.json();
      repoData[`${owner}/${repo}`] = data;
      successCount++;
      
      if (i % 10 === 0 || i === repos.length - 1) {
        console.log(`  [${i+1}/${repos.length}] 成功: ${owner}/${repo} ⭐${data.stargazers_count}`);
      }
      
      // 限流：每请求间隔 1 秒
      await sleep(1000);
    } catch (err) {
      console.log(`  [${i+1}/${repos.length}] 异常: ${owner}/${repo} - ${err.message}`);
      errorCount++;
      await sleep(1000);
    }
  }
  
  console.log(`\nAPI 请求完成: 成功 ${successCount}, 失败 ${errorCount}`);
  
  // 更新 tools.ts
  let starsUpdated = 0;
  let forksUpdated = 0;
  let langUpdated = 0;
  let topicsCollected = {}; // topic -> count
  
  // 解析 tools.ts 中的工具对象
  // 用正则匹配每个工具块
  const toolBlockRegex = /\{\s*id:\s*"([^"]+)"[\s\S]*?url:\s*"(https:\/\/github\.com\/[^"]+)"[\s\S]*?\}/g;
  
  let toolsUpdated = [];
  let match;
  while ((match = toolBlockRegex.exec(toolsContent)) !== null) {
    const id = match[1];
    const url = match[2];
    const block = match[0];
    const repo = parseRepoUrl(url);
    if (!repo) continue;
    
    const key = `${repo.owner}/${repo.repo}`;
    const ghData = repoData[key];
    if (!ghData) continue;
    
    const newStars = ghData.stargazers_count;
    const newForks = ghData.forks_count;
    const newLang = ghData.language;
    const pushedAt = ghData.pushed_at;
    const ghTopics = ghData.topics || [];
    
    // 收集 topics
    ghTopics.forEach(t => {
      const normalized = t.toLowerCase().replace(/\s+/g, '-');
      topicsCollected[normalized] = (topicsCollected[normalized] || 0) + 1;
    });
    
    // 检查是否需要更新
    const hasStarsChange = block.includes('githubStars:') && !block.includes(`githubStars: ${newStars}`);
    const hasForksField = block.includes('forks:');
    const currentForksMatch = block.match(/forks:\s*(\d+)/);
    const currentForks = currentForksMatch ? parseInt(currentForksMatch[1]) : null;
    const forksChanged = currentForks !== null && currentForks !== newForks;
    
    const hasLangField = block.includes('language:');
    const currentLangMatch = block.match(/language:\s*"([^"]+)"/);
    const currentLang = currentLangMatch ? currentLangMatch[1] : null;
    const langChanged = currentLang !== null && currentLang !== newLang;
    
    // 提取当前 stars
    const starsMatch = block.match(/githubStars:\s*(\d+)/);
    const currentStars = starsMatch ? parseInt(starsMatch[1]) : null;
    
    if (currentStars !== null && currentStars === newStars && !forksChanged && !langChanged) {
      continue; // 无变化
    }
    
    toolsUpdated.push({ id, key, oldStars: currentStars, newStars, oldForks: currentForks, newForks: hasForksField ? currentForks : '新增', newLang: newLang || 'N/A', oldLang: currentLang || 'N/A', pushedAt });
    
    if (currentStars !== newStars) starsUpdated++;
    if (forksChanged) forksUpdated++;
    if (langChanged) langUpdated++;
  }
  
  console.log(`\n工具更新统计:`);
  console.log(`  Stars 更新: ${starsUpdated}`);
  console.log(`  Forks 更新: ${forksUpdated}`);
  console.log(`  Language 更新: ${langUpdated}`);
  console.log(`  总更新工具数: ${toolsUpdated.length}`);
  
  // 显示变化最大的
  const changes = toolsUpdated
    .filter(t => t.oldStars !== null)
    .map(t => ({ ...t, delta: t.newStars - t.oldStars }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  
  if (changes.length > 0) {
    console.log('\n变化最大的工具:');
    changes.slice(0, 10).forEach(c => {
      console.log(`  ${c.id}: ${c.oldStars} → ${c.newStars} (${c.delta > 0 ? '+' : ''}${c.delta})`);
    });
  }
  
  // 执行实际的文件更新
  if (toolsUpdated.length > 0) {
    let newContent = toolsContent;
    
    // 对每个工具进行更新
    for (const t of toolsUpdated) {
      const repo = parseRepoUrl(t.key);
      const url = `https://github.com/${repo.owner}/${repo.repo}`;
      
      // 找到这个工具块的起始和结束
      const toolStart = newContent.indexOf(`id: "${t.id}"`);
      if (toolStart === -1) continue;
      
      // 找到工具块的结尾（下一个工具的开始或文件末尾）
      const nextToolMatch = newContent.slice(toolStart + 10).match(/\n\s*\{\s*id:\s*"/);
      const toolEnd = nextToolMatch ? toolStart + 10 + nextToolMatch.index : newContent.length;
      
      let block = newContent.slice(toolStart, toolEnd);
      
      const ghData = repoData[t.key];
      if (!ghData) continue;
      
      const newStars = ghData.stargazers_count;
      const newForks = ghData.forks_count;
      const newLang = ghData.language;
      const pushedAt = ghData.pushed_at;
      const dateStr = pushedAt ? pushedAt.split('T')[0] : null;
      
      // 更新 githubStars
      block = block.replace(/githubStars:\s*\d+/, `githubStars: ${newStars}`);
      
      // 更新 updatedAt
      if (dateStr) {
        if (block.includes('updatedAt:')) {
          block = block.replace(/updatedAt:\s*"[^"]*"/, `updatedAt: "${dateStr}"`);
        } else {
          // 在 githubStars 行后插入
          block = block.replace(/(githubStars:\s*\d+)/, `$1,\n    updatedAt: "${dateStr}"`);
        }
      }
      
      // 更新/新增 forks
      if (block.includes('forks:')) {
        block = block.replace(/forks:\s*\d+/, `forks: ${newForks}`);
      } else {
        block = block.replace(/(githubStars:\s*\d+)/, `$1,\n    forks: ${newForks}`);
      }
      
      // 更新/新增 language
      if (block.includes('language:')) {
        if (newLang) {
          block = block.replace(/language:\s*"[^"]*"/, `language: "${newLang}"`);
        }
      } else {
        if (newLang) {
          block = block.replace(/(forks:\s*\d+)/, `$1,\n    language: "${newLang}"`);
        }
      }
      
      newContent = newContent.slice(0, toolStart) + block + newContent.slice(toolEnd);
    }
    
    // 按分类内部 stars 排序
    // 这一步比较复杂，先不做排序，只更新数据
    // 实际上 tools.ts 的格式不太适合自动排序，容易破坏格式
    
    fs.writeFileSync(TOOLS_FILE, newContent);
    console.log('\n已更新 tools.ts');
  }
  
  // 分析新发现的 AI Topics
  const newTopics = [];
  const topicCounts = topicsCollected;
  
  for (const [topic, count] of Object.entries(topicCounts)) {
    if (existingTopics.has(topic)) continue;
    
    // 判断 AI 相关
    const aiRelated = isAiRelated(topic);
    
    // 过滤过于冷门的
    if (count < 2 && !aiRelated) continue;
    if (count === 1) {
      // 单个仓库使用，检查 stars 是否 >= 1000
      const reposWithTopic = Object.entries(repoData).filter(([k, v]) => 
        (v.topics || []).map(t => t.toLowerCase().replace(/\s+/g, '-')).includes(topic)
      );
      const maxStars = reposWithTopic.length > 0 ? Math.max(...reposWithTopic.map(([, v]) => v.stargazers_count)) : 0;
      if (maxStars < 1000) continue;
    }
    
    let minStars;
    if (count >= 3) minStars = 2000;
    else if (count >= 2) minStars = 3000;
    else minStars = 5000;
    
    // 生成描述
    let description;
    if (aiRelated) {
      description = `（自动发现）${topic.replace(/-/g, ' ')}`;
    } else {
      continue; // 只添加 AI 相关的
    }
    
    newTopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description
    });
  }
  
  console.log(`\n发现 ${newTopics.length} 个新的 AI Topic`);
  
  if (newTopics.length > 0) {
    // 追加到 topics 数组
    topicsData.topics.push(...newTopics);
    topicsData.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(TOPICS_FILE, JSON.stringify(topicsData, null, 2));
    console.log('已更新 ai-topics.json');
    
    console.log('\n新增 Topics:');
    newTopics.slice(0, 20).forEach(t => {
      console.log(`  ${t.topic} (${t.minStars}+ stars)`);
    });
    if (newTopics.length > 20) {
      console.log(`  ... 还有 ${newTopics.length - 20} 个`);
    }
  }
  
  // 输出 JSON 结果供提交脚本使用
  const result = {
    reposScanned: repos.length,
    starsUpdated,
    forksUpdated,
    langUpdated,
    totalToolsUpdated: toolsUpdated.length,
    newTopicsCount: newTopics.length,
    topChanges: changes.slice(0, 5).map(c => ({ id: c.id, delta: c.newStars - c.oldStars, old: c.oldStars, new: c.newStars })),
    newTopics: newTopics.slice(0, 10).map(t => t.topic),
    hasChanges: toolsUpdated.length > 0 || newTopics.length > 0
  };
  
  fs.writeFileSync('/tmp/github-update-result.json', JSON.stringify(result, null, 2));
  console.log('\n结果已写入 /tmp/github-update-result.json');
}

main().catch(console.error);
