#!/usr/bin/env node
/**
 * 按 GitHub Topics + 关键词 + 知名账号 发现优秀 AI 项目
 * 
 * 策略：
 * 1. 读取 data/ai-topics.json 中的 topics 列表，每次随机选取 50 个 topic 搜索（覆盖范围更广）
 * 2. 关键词兜底搜索：用 "ai coding" "claude code" "ai agent tool" 等关键词搜索（覆盖无 topics 的项目）
 * 3. 知名开发者/机构账号监控：扫描 garrytan, simonw, anthropic, etc. 的新项目
 * 4. 对比 src/data/tools.ts 已有项目，发现遗漏
 * 5. 输出遗漏项目列表，按 stars 排序
 * 
 * 运行：node scripts/discover-topic-projects.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load .env.local for GITHUB_TOKEN
const envPath = path.join(ROOT, '.env.local');
let GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GITHUB_TOKEN=(.+)/);
  if (match) GITHUB_TOKEN = match[1].trim();
} catch {}
const HAS_TOKEN = GITHUB_TOKEN.startsWith('ghp_') || GITHUB_TOKEN.startsWith('gho_');
// Search API 限额 30 次/小时，Topic 搜索用 Search API
// 50 个 topic 需要 50 × 120s = ~100 分钟，但实际会被限流中断
// 缩短到 2 秒间隔，优先在前 15 个 topic 内完成搜索
const REQUEST_DELAY = HAS_TOKEN ? 2000 : 3000;
const TOPIC_SEARCH_LIMIT = 15; // 每轮最多搜索 15 个 topic，避免触发 search API 限流

const TOOLS_FILE = path.join(ROOT, 'src/data/tools.ts');
const TOPICS_FILE = path.join(ROOT, 'data/ai-topics.json');

// 提取 tools.ts 中已有的 GitHub 仓库
function extractExistingRepos() {
  const content = fs.readFileSync(TOOLS_FILE, 'utf8');
  const urlRegex = /url:\s*"https:\/\/github\.com\/([^/"]+)\/([^/"]+)"/g;
  const repos = new Set();
  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    repos.add(`${m[1].toLowerCase()}/${m[2].toLowerCase()}`);
  }
  return repos;
}

// GitHub API 搜索
function searchGitHub(query, minStars, perPage = 30) {
  return new Promise((resolve) => {
    const headers = {
      'User-Agent': 'ai-master-site',
      'Accept': 'application/vnd.github.v3+json'
    };
    if (HAS_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    const q = encodeURIComponent(`${query} stars:>${minStars}`);
    const options = {
      hostname: 'api.github.com',
      path: `/search/repositories?q=${q}&sort=stars&order=desc&per_page=${perPage}`,
      headers,
      timeout: 15000
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const j = JSON.parse(data);
            resolve({
              success: true,
              totalCount: j.total_count || 0,
              items: (j.items || []).map(item => ({
                fullName: item.full_name.toLowerCase(),
                name: item.name,
                owner: item.owner.login,
                stars: item.stargazers_count,
                forks: item.forks_count,
                language: item.language,
                description: item.description || '',
                topics: item.topics || [],
                url: item.html_url,
                createdAt: item.created_at,
                updatedAt: item.updated_at
              }))
            });
          } catch {
            resolve({ success: false, error: 'parse', totalCount: 0, items: [] });
          }
        } else if (res.statusCode === 403 || res.statusCode === 429) {
          resolve({ success: false, error: 'rate_limited', totalCount: 0, items: [] });
        } else {
          resolve({ success: false, error: `http_${res.statusCode}`, totalCount: 0, items: [] });
        }
      });
    }).on('error', () => resolve({ success: false, error: 'network', totalCount: 0, items: [] }))
      .on('timeout', () => resolve({ success: false, error: 'timeout', totalCount: 0, items: [] }));
  });
}

// Fisher-Yates 洗牌
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function main() {
  console.error('🔍 开始发现优秀 AI 项目...\n');
  
  // 读取 topics 库
  const topicsData = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
  const allTopics = topicsData.topics;
  const globalMinStars = topicsData.minStarsThreshold || 5000;
  
  // 每次运行随机选取 50 个 topic，避免每次都扫相同的一批
  const MAX_TOPICS_PER_RUN = 50;
  const topics = shuffleArray([...allTopics]).slice(0, MAX_TOPICS_PER_RUN);
  console.error(`📋 从 ${allTopics.length} 个 topics 中随机选取 ${topics.length} 个（本轮）\n`);
  
  // 读取已有项目
  const existingRepos = extractExistingRepos();
  console.error(`📦 已有 ${existingRepos.size} 个 GitHub 项目在 tools.ts 中\n`);
  
  const missingProjects = [];
  const topicStats = [];
  let rateLimited = false;
  
  // ══════════════════════════════════════════════
  // 渠道 1：按 Topics 搜索
  // ══════════════════════════════════════════════
  console.error(`━━━ 渠道 1：Topics 搜索（本轮 ${topics.length}/${allTopics.length} 个 topic，最多搜索 ${TOPIC_SEARCH_LIMIT} 个）━━━\n`);
  
  for (let i = 0; i < topics.length; i++) {
    if (i >= TOPIC_SEARCH_LIMIT) {
      console.error(`\n⏸️  已搜索 ${TOPIC_SEARCH_LIMIT} 个 topic，剩余 ${topics.length - i} 个跳过（Search API 限流保护）`);
      break;
    }
    if (rateLimited) {
      console.error(`\n⏸️  触发限流，跳过剩余 ${topics.length - i} 个 topics`);
      break;
    }
    
    const topic = topics[i];
    const minStars = Math.max(topic.minStars || globalMinStars, globalMinStars);
    
    console.error(`  [${i + 1}/${topics.length}] 🔎 ${topic.topic} (minStars: ${minStars.toLocaleString()})`);
    
    const result = await searchGitHub(`topic:${topic.topic}`, minStars, 30);
    
    if (result.success) {
      console.error(`   ✅ 找到 ${result.totalCount} 个项目，扫描前 30 个`);
      
      let foundMissing = 0;
      for (const item of result.items) {
        if (!existingRepos.has(item.fullName)) {
          missingProjects.push({
            ...item,
            topic: topic.topic,
            topicDescription: topic.description,
            channel: 'topic'
          });
          foundMissing++;
        }
      }
      console.error(`   🆕 遗漏项目：${foundMissing} 个`);
      
      topicStats.push({
        topic: topic.topic,
        total: result.totalCount,
        scanned: result.items.length,
        missing: foundMissing
      });
    } else {
      console.error(`   ❌ ${result.error}`);
      if (result.error === 'rate_limited') {
        rateLimited = false; // don't break, try other channels
      }
    }
    
    if (i < topics.length - 1) {
      await new Promise(r => setTimeout(r, REQUEST_DELAY));
    }
  }
  
  // ══════════════════════════════════════════════
  // 渠道 2：关键词兜底搜索（覆盖无 topics 的项目）
  // ══════════════════════════════════════════════
  console.error(`\n━━━ 渠道 2：关键词兜底搜索 ━━━\n`);
  
  const keywordQueries = [
    { query: '"ai coding"', minStars: 5000, description: 'AI 编程' },
    { query: '"claude code"', minStars: 3000, description: 'Claude Code' },
    { query: '"ai agent tool"', minStars: 3000, description: 'AI Agent 工具' },
    { query: '"ai developer tool"', minStars: 5000, description: 'AI 开发者工具' },
    { query: '"llm tool"', minStars: 5000, description: 'LLM 工具' },
    { query: '"slash command"', minStars: 1000, description: 'Slash 命令扩展' },
    { query: '"code review" ai', minStars: 5000, description: 'AI 代码审查' },
    { query: 'ai workflow automation', minStars: 5000, description: 'AI 工作流自动化' },
  ];
  
  for (const kw of keywordQueries) {
    console.error(`🔎 "${kw.query}" (minStars: ${kw.minStars.toLocaleString()})`);
    
    const result = await searchGitHub(kw.query, kw.minStars, 20);
    
    if (result.success) {
      console.error(`   ✅ 找到 ${result.totalCount} 个项目，扫描前 20 个`);
      
      let foundMissing = 0;
      for (const item of result.items) {
        if (!existingRepos.has(item.fullName)) {
          const alreadyFound = missingProjects.some(p => p.fullName === item.fullName);
          if (!alreadyFound) {
            missingProjects.push({
              ...item,
              topic: kw.query,
              topicDescription: kw.description,
              channel: 'keyword'
            });
            foundMissing++;
          }
        }
      }
      console.error(`   🆕 遗漏项目：${foundMissing} 个`);
      
      topicStats.push({
        topic: `keyword:${kw.query}`,
        total: result.totalCount,
        scanned: result.items.length,
        missing: foundMissing
      });
    } else {
      console.error(`   ❌ ${result.error}`);
    }
    
    await new Promise(r => setTimeout(r, REQUEST_DELAY));
  }
  
  // ══════════════════════════════════════════════
  // 渠道 3：知名开发者/机构账号监控
  // ══════════════════════════════════════════════
  console.error(`\n━━━ 渠道 3：知名账号扫描 ━━━\n`);
  
  const notableAccounts = [
    { user: 'garrytan', desc: 'YC CEO' },
    { user: 'anthropics', desc: 'Anthropic 官方' },
    { user: 'openai', desc: 'OpenAI 官方' },
    { user: 'google-deepmind', desc: 'Google DeepMind' },
    { user: 'simonw', desc: 'Simon Willison' },
    { user: 'karpathy', desc: 'Andrej Karpathy' },
    { user: 'langchain-ai', desc: 'LangChain 官方' },
    { user: 'composable-models', desc: 'Composable' },
    { user: 'run-llama', desc: 'LlamaIndex' },
    { user: 'huggingface', desc: 'HuggingFace 官方' },
    { user: 'microsoft', desc: 'Microsoft AI' },
  ];
  
  for (const account of notableAccounts) {
    console.error(`🔎 @${account.user} (${account.desc})`);
    
    const result = await searchGitHub(`user:${account.user}`, 1000, 30);
    
    if (result.success) {
      console.error(`   ✅ 找到 ${result.totalCount} 个项目`);
      
      let foundMissing = 0;
      for (const item of result.items) {
        // 只看 AI 相关项目（描述或名字包含关键词）
        const aiKeywords = ['ai', 'llm', 'agent', 'claude', 'gpt', 'model', 'ml', 'nlp', 'chat', 'bot', 'skill', 'skillz'];
        const isAiRelated = aiKeywords.some(kw =>
          (item.description || '').toLowerCase().includes(kw) ||
          item.name.toLowerCase().includes(kw) ||
          (item.topics || []).some(t => t.includes(kw))
        );
        
        if (isAiRelated && !existingRepos.has(item.fullName)) {
          const alreadyFound = missingProjects.some(p => p.fullName === item.fullName);
          if (!alreadyFound) {
            missingProjects.push({
              ...item,
              topic: `user:${account.user}`,
              topicDescription: `${account.desc} 的项目`,
              channel: 'notable-account'
            });
            foundMissing++;
          }
        }
      }
      console.error(`   🆕 AI 相关遗漏项目：${foundMissing} 个`);
      
      topicStats.push({
        topic: `user:${account.user}`,
        total: result.totalCount,
        scanned: result.items.length,
        missing: foundMissing
      });
    } else {
      console.error(`   ❌ ${result.error}`);
    }
    
    await new Promise(r => setTimeout(r, REQUEST_DELAY));
  }
  
  // 去重（同一个项目可能出现在多个 topic）
  const uniqueMissing = [];
  const seen = new Set();
  for (const project of missingProjects) {
    if (!seen.has(project.fullName)) {
      seen.add(project.fullName);
      uniqueMissing.push(project);
    } else {
      // 更新已有项目的 topics
      const existing = uniqueMissing.find(p => p.fullName === project.fullName);
      if (existing && !existing.topics.includes(project.topic)) {
        existing.topics.push(project.topic);
      }
    }
  }
  
  // 按 stars 排序
  uniqueMissing.sort((a, b) => b.stars - a.stars);
  
  // 输出报告
  console.error(`\n${'='.repeat(60)}`);
  console.error(`📊 发现报告`);
  console.error(`${'='.repeat(60)}`);
  console.error(`\n📦 已有项目：${existingRepos.size} 个`);
  console.error(`🔍 扫描 topics：${topicStats.length} 个`);
  console.error(`🆕 遗漏项目：${uniqueMissing.length} 个（stars > ${globalMinStars.toLocaleString()}）\n`);
  
  // Top 遗漏项目（按 stars）
  console.error(`🌟 Top 遗漏项目（前 30）：`);
  console.error(`${'─'.repeat(60)}`);
  
  for (let i = 0; i < Math.min(30, uniqueMissing.length); i++) {
    const p = uniqueMissing[i];
    const starsStr = p.stars.toLocaleString();
    const topicsStr = Array.isArray(p.topics) ? p.topics.slice(0, 3).join(', ') : p.topic;
    console.error(`  ${i + 1}. ${p.fullName}`);
    console.error(`     ⭐ ${starsStr} | 🍴 ${p.forks.toLocaleString()} | 🏷️ ${topicsStr}`);
    if (p.description) {
      console.error(`     📝 ${p.description.slice(0, 80)}${p.description.length > 80 ? '...' : ''}`);
    }
    console.error();
  }
  
  // 保存遗漏项目列表
  const report = {
    generatedAt: new Date().toISOString(),
    existingCount: existingRepos.size,
    scannedTopics: topicStats.length,
    missingCount: uniqueMissing.length,
    minStarsThreshold: globalMinStars,
    missingProjects: uniqueMissing.slice(0, 100).map(p => ({
      fullName: p.fullName,
      name: p.name,
      stars: p.stars,
      forks: p.forks,
      language: p.language,
      description: p.description,
      topics: Array.isArray(p.topics) ? p.topics : [p.topic],
      url: p.url,
      createdAt: p.createdAt,
      suggestedCategory: suggestCategory(p.topics)
    })),
    topicStats
  };
  
  const reportPath = path.join(ROOT, 'data/missing-projects-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.error(`\n💾 详细报告已保存到 ${reportPath}`);

  // === 自动发现新 topics ===
  console.error(`\n\n🔎 开始自动发现新 topics...`);
  
  const existingTopics = new Set(topics.map(t => t.topic));
  const newTopics = [];
  const allDiscoveredTopics = new Set();
  
  // 从所有扫描到的项目中收集 topics
  for (const project of uniqueMissing) {
    if (Array.isArray(project.topics)) {
      for (const t of project.topics) {
        allDiscoveredTopics.add(t);
      }
    }
  }
  
  // 找出本地没有的新 topics
  const aiKeywords = [
    'ai', 'ml', 'deep', 'neural', 'llm', 'gpt', 'chat', 'agent',
    'transformer', 'diffusion', 'vision', 'nlp', 'language', 'model',
    'generative', 'machine-learning', 'reinforcement', 'embedding',
    'multimodal', 'speech', 'voice', 'image', 'video', 'text',
    'robot', 'autonomous', 'cognitive', 'inference', 'training',
    'rag', 'vector', 'mcp', 'prompt', 'fine-tune', 'quantiz',
    'cuda', 'gpu', 'tensor', 'pytorch', 'tensorflow', 'hugging',
    'openai', 'anthropic', 'gemini', 'claude', 'llama', 'mistral',
    'stable-diffusion', 'comfyui', 'langchain', 'crew', 'autogen',
    'webui', 'gradio', 'streamlit', 'pipeline', 'orchestrat',
    'knowledge-graph', 'semantic', 'retrieval', 'search',
    'face', 'pose', 'gesture', 'ocr', 'detection', 'segment',
    'gan', 'vae', 'diffusion', 'super-resolution', 'upscale',
    'audio', 'music', 'tts', 'stt', 'whisper', 'synthesis',
    'agi', 'world-model', 'embodied', 'sim-to-real',
    'federated', 'edge', 'on-device', 'mobile', 'lightweight',
    'benchmark', 'dataset', 'evaluation', 'alignment', 'safety',
    'explainable', 'interpret', 'bias', 'fairness', 'privacy',
  ];
  
  for (const topic of allDiscoveredTopics) {
    if (existingTopics.has(topic)) continue;
    
    // 检查是否包含 AI 关键词
    const isAiRelated = aiKeywords.some(keyword => 
      topic.toLowerCase().includes(keyword)
    );
    
    if (isAiRelated) {
      newTopics.push({
        topic: topic,
        url: `https://github.com/topics/${topic}`,
        minStars: 2000,  // 新发现的 topic 默认 2000 stars
        description: `（自动发现）${topic}`
      });
    }
  }
  
  if (newTopics.length > 0) {
    console.error(`\n🆕 发现 ${newTopics.length} 个新 AI 相关 topics！`);
    
    // 追加到 ai-topics.json
    topicsData.topics.push(...newTopics);
    topicsData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TOPICS_FILE, JSON.stringify(topicsData, null, 2), 'utf8');
    console.error(`✅ 已更新 ${TOPICS_FILE}`);
    
    // 列出新 topics
    console.error('\n新 topics 列表：');
    for (const t of newTopics.sort((a, b) => a.topic.localeCompare(b.topic))) {
      console.error(`  • ${t.topic} (minStars: ${t.minStars})`);
    }
  } else {
    console.error('\n✅ 没有发现新的 AI 相关 topics');
  }
}

// 根据 topics 建议分类
function suggestCategory(topics) {
  if (!topics || topics.length === 0) return 'other';
  
  const categoryMap = {
    'llm': 'llm',
    'large-language-models': 'llm',
    'ai-agent': 'agent',
    'ai-chatbot': 'agent',
    'chatbot': 'agent',
    'langchain': 'framework',
    'llm-framework': 'framework',
    'ai-tooling': 'framework',
    'mcp': 'plugin',
    'model-context-protocol': 'plugin',
    'vector-database': 'data',
    'knowledge-graph': 'data',
    'computer-vision': 'multimodal',
    'multimodal': 'multimodal',
    'text-to-image': 'multimodal',
    'text-to-video': 'multimodal',
    'stable-diffusion': 'multimodal',
    'diffusion-models': 'multimodal',
    'vision-language-model': 'multimodal',
    'speech-recognition': 'multimodal',
    'text-to-speech': 'multimodal',
    'ai-search': 'search',
    'ai-safety': 'security',
    'alignment': 'security',
    'edge-ai': 'devops',
    'llmops': 'devops',
    'fine-tuning': 'education',
    'prompt-engineering': 'education'
  };
  
  for (const topic of topics) {
    if (categoryMap[topic]) return categoryMap[topic];
  }
  
  return 'llm'; // 默认
}

main().catch(e => { console.error(e); process.exit(1); });
