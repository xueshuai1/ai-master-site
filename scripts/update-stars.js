#!/usr/bin/env node
// Script: Update GitHub stars, forks, language for tools in tools.ts
// and discover new AI topics from repo topics.

const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}

const TOOLS_PATH = path.join(__dirname, '..', 'src', 'data', 'tools.ts');
const TOPICS_PATH = path.join(__dirname, '..', 'data', 'ai-topics.json');

// AI-related keywords for topic filtering
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

function extractReposFromToolsTS(content) {
  const repos = [];
  // Match tools with GitHub URLs in the form: url: "https://github.com/owner/repo"
  const urlRegex = /url:\s*["']https:\/\/github\.com\/([^"']+)["']/g;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const repo = match[1].trim();
    if (!repos.includes(repo)) {
      repos.push(repo);
    }
  }
  return repos;
}

function extractToolNames(content) {
  const tools = [];
  const nameRegex = /name:\s*["']([^"']+)["']/g;
  let match;
  while ((match = nameRegex.exec(content)) !== null) {
    tools.push(match[1]);
  }
  return tools;
}

function extractGitHubStars(content) {
  const stars = {};
  const regex = /githubStars:\s*(\d+)/g;
  let match;
  // We need to map stars to tools by tracking position
  // Instead, let's use a simpler approach: extract tool blocks
  return stars;
}

async function fetchRepo(repo, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const url = `https://api.github.com/repos/${repo}?access_token=${GITHUB_TOKEN}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ai-master-stars-updater'
        }
      });
      
      if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
        const resetTime = parseInt(res.headers.get('x-ratelimit-reset') || '0') * 1000;
        const waitMs = resetTime - Date.now();
        if (waitMs > 0 && waitMs < 300000) {
          console.log(`Rate limited, waiting ${Math.ceil(waitMs/1000)}s...`);
          await new Promise(r => setTimeout(r, waitMs));
          continue;
        } else {
          console.error(`Rate limit exceeded, reset at ${new Date(resetTime).toISOString()}`);
          return null;
        }
      }
      
      if (res.status === 404) {
        console.log(`  ⚠️  Repo not found: ${repo}`);
        return null;
      }
      
      if (!res.ok) {
        console.log(`  ⚠️  HTTP ${res.status} for ${repo}`);
        if (i < retries) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        return null;
      }
      
      return await res.json();
    } catch (e) {
      console.log(`  ⚠️  Error fetching ${repo}: ${e.message}`);
      if (i < retries) {
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      return null;
    }
  }
  return null;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => {
    if (kw.includes('-')) {
      return t === kw || t.includes(kw);
    }
    // For single-word keywords, match exact or as part of hyphenated word
    return t === kw || t.includes(`-${kw}`) || t.includes(`${kw}-`) || t.includes(`-${kw}-`);
  });
}

function parseDateISO(isoStr) {
  if (!isoStr) return '';
  return isoStr.split('T')[0];
}

async function main() {
  console.log('🔍 Reading tools.ts...');
  const toolsContent = fs.readFileSync(TOOLS_PATH, 'utf-8');
  const repos = extractReposFromToolsTS(toolsContent);
  console.log(`Found ${repos.length} GitHub repos`);

  // Load existing topics
  const topicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
  const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
  console.log(`Existing topics: ${existingTopics.size}`);

  const results = [];
  const allTopics = new Set();
  
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    console.log(`[${i+1}/${repos.length}] Fetching ${repo}...`);
    
    const data = await fetchRepo(repo);
    if (!data) {
      results.push({ repo, error: true });
      continue;
    }
    
    const stars = data.stargazers_count;
    const pushedAt = parseDateISO(data.pushed_at);
    const forks = data.forks_count;
    const language = data.language;
    const repoTopics = (data.topics || []).map(t => t.toLowerCase());
    
    repoTopics.forEach(t => allTopics.add(t));
    
    results.push({
      repo,
      stars,
      pushedAt,
      forks,
      language: language || null,
      topics: repoTopics,
      error: false
    });
    
    // Rate limit protection: 1s between requests
    if (i < repos.length - 1) {
      await sleep(1000);
    }
  }

  // Analyze results
  console.log('\n📊 Analysis:');
  
  // Count stars changes, forks changes, language changes
  let starsChanges = [];
  let forksUpdates = 0;
  let languageUpdates = 0;
  let allRepoTopics = [];

  for (const r of results) {
    if (r.error) continue;
    allRepoTopics.push(...r.topics);
  }

  // Find new AI topics
  const uniqueTopics = [...new Set(allRepoTopics)];
  const newAITopics = [];
  
  for (const topic of uniqueTopics) {
    if (existingTopics.has(topic)) continue;
    if (isAITopic(topic)) {
      // Count how many repos use this topic
      const usageCount = allRepoTopics.filter(t => t === topic).length;
      // Find max stars among repos using this topic
      const maxStars = Math.max(
        ...results.filter(r => !r.error && r.topics.includes(topic)).map(r => r.stars)
      );
      
      // Skip if only 1 repo uses it and stars < 1000
      if (usageCount === 1 && maxStars < 1000) continue;
      
      // Determine minStars based on usage
      let minStars;
      if (usageCount >= 3) minStars = 2000;
      else if (usageCount >= 2) minStars = 3000;
      else minStars = 5000;
      
      // Generate description
      const desc = generateDescription(topic);
      
      newAITopics.push({
        topic,
        url: `https://github.com/topics/${topic}`,
        minStars,
        description: desc,
        usageCount
      });
    }
  }

  console.log(`Stars changes: ${starsChanges.length}`);
  console.log(`Forks updates: ${forksUpdates}`);
  console.log(`Language updates: ${languageUpdates}`);
  console.log(`New AI topics found: ${newAITopics.length}`);
  
  // Output results as JSON for the next step
  const output = {
    results: results.map(r => ({
      repo: r.repo,
      stars: r.stars,
      pushedAt: r.pushedAt,
      forks: r.forks,
      language: r.language,
      topics: r.topics,
      error: r.error
    })),
    newAITopics,
    allTopics: uniqueTopics.length,
    existingTopicsCount: existingTopics.size
  };
  
  fs.writeFileSync('/tmp/stars-update-results.json', JSON.stringify(output, null, 2));
  console.log('\n✅ Results saved to /tmp/stars-update-results.json');
}

function generateDescription(topic) {
  const descriptions = {
    'agentic-coding': 'Agentic 编程（AI 自主编码）',
    'agentic-code': 'Agentic 代码生成',
    'coding-agents': '编码智能体',
    'agentic-skills': '智能体技能',
    'background-agents': '后台智能体',
    'agents-sdk': 'Agents SDK',
    'agentscope': 'AgentScope 框架',
    'agentscope-runtime': 'AgentScope 运行时',
    'multi-agents-collaboration': '多智能体协作',
    'claude-code-agents': 'Claude Code 智能体',
    'distributed-training': '分布式训练',
    'langchain4j': 'LangChain Java 版',
    'azure-openai': 'Azure OpenAI 服务',
    'litellm': 'LiteLLM 代理',
    'openai-proxy': 'OpenAI 代理',
    'agency-agents': 'Agency 智能体',
    'chatgpt-on-wechat': 'ChatGPT 接入微信',
    'linkai': 'LinkAI 平台',
    'models': 'AI 模型',
    'gpt-5': 'GPT-5 生态',
    'chat': 'AI 对话',
    'chinese-language': '中文语言处理',
    'english-language': '英文语言处理',
    'ts': 'TypeScript AI 项目',
    'mlx': 'Apple MLX 框架',
    'interactive-learning': '交互式学习',
    'yaml': 'YAML 配置（AI）',
    'c': 'C 语言 AI 项目',
    'headless-browser': '无头浏览器（AI 驱动）',
    'voice-clone': '声音克隆',
    'deep-fake': 'Deepfake 技术',
    'deepfake': 'Deepfake 技术',
    'deepfake-webcam': 'Deepfake 摄像头',
    'real-time-deepfake': '实时 Deepfake',
    'realtime-deepfake': '实时 Deepfake',
    'video-deepfake': '视频 Deepfake',
    'semantic-kernel': 'Semantic Kernel 框架',
    'deep-face-swap': 'Deep Face Swap',
  };
  
  if (descriptions[topic]) return descriptions[topic];
  
  // Generic description from topic name
  const parts = topic.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  return `${parts}（AI 相关）`;
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
