import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TOOLS_FILE = path.join(process.cwd(), 'src/data/tools.ts');
const TOPICS_FILE = path.join(process.cwd(), 'data/ai-topics.json');

// AI-related topic keywords
const AI_KEYWORDS = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
  'large-language-models', 'retrieval-augmented', 'instruction-tuning', 'rlhf',
  'alignment', 'genai', 'agentic', 'multimodal', 'self-hosted', 'llm-runtime',
  'agent-framework', 'deep-research', 'coding-agent', 'model-parallelism',
  'quantization', 'reinforcement-learning', 'knowledge-curation', 'orchestration',
  'conversational-ai', 'speech-synthesis', 'voice-ai', 'tts', 'gpu', 'cuda',
  'fp8', 'speculative-decoding', 'flash-attention', 'ragflow', 'vector-db'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => t.includes(kw) || kw.includes(t));
}

// Parse tools.ts to find GitHub repos
function parseReposFromTools() {
  const content = fs.readFileSync(TOOLS_FILE, 'utf8');
  const regex = /url:\s*["'](https:\/\/github\.com\/([^"']+)?)["']/g;
  const repos = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const repoPath = match[2];
    if (!repos.includes(repoPath)) {
      repos.push(repoPath);
    }
  }
  return repos;
}

// Load existing topics
function loadExistingTopics() {
  const data = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
  return {
    existing: new Set(data.topics.map(t => t.topic.toLowerCase())),
    topics: data.topics,
    lastUpdated: data.lastUpdated,
    minStarsThreshold: data.minStarsThreshold
  };
}

// Fetch repo data from GitHub API
async function fetchRepo(repoPath, retries = 3) {
  const url = `https://api.github.com/repos/${repoPath}`;
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'User-Agent': 'ai-master-cc-updater'
        }
      });
      if (resp.status === 200) return await resp.json();
      if (resp.status === 404) {
        console.log(`  ⚠️ 404: ${repoPath}`);
        return null;
      }
      if (resp.status === 403 || resp.status === 429) {
        const wait = (i + 1) * 2000;
        console.log(`  ⏳ Rate limited for ${repoPath}, waiting ${wait}ms...`);
        await sleep(wait);
        continue;
      }
      console.log(`  ⚠️ ${resp.status} for ${repoPath}`);
      return null;
    } catch (e) {
      console.log(`  ❌ Error fetching ${repoPath}: ${e.message}`);
      if (i < retries - 1) {
        await sleep(2000);
      }
    }
  }
  return null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔍 开始更新 GitHub stars 数据...');
  
  const repos = parseReposFromTools();
  console.log(`📦 找到 ${repos.length} 个 GitHub 仓库`);
  
  const existingTopics = loadExistingTopics();
  console.log(`📋 已有 ${existingTopics.topics.length} 个 topics`);
  
  // Process repos in batches with rate limiting
  const updatedTools = [];
  const allRepoTopics = [];
  const topicUsage = {};
  const oldestUpdate = { name: '', days: 0 };
  
  for (let i = 0; i < repos.length; i++) {
    const repoPath = repos[i];
    const progress = `(${i+1}/${repos.length})`;
    
    const data = await fetchRepo(repoPath);
    
    if (!data) {
      continue;
    }
    
    const stars = data.stargazers_count || 0;
    const pushedAt = data.pushed_at ? new Date(data.pushed_at).toISOString().split('T')[0] : undefined;
    const forks = data.forks_count || 0;
    const language = data.language || null;
    const topics = data.topics || [];
    
    // Track oldest update
    const daysSincePush = data.pushed_at ? Math.floor((Date.now() - new Date(data.pushed_at).getTime()) / 86400000) : 999;
    // We'll find the tool name for this later
    
    // Track topics
    for (const t of topics) {
      const tl = t.toLowerCase();
      topicUsage[tl] = (topicUsage[tl] || 0) + 1;
      allRepoTopics.push(tl);
    }
    
    console.log(`  ✅ ${repoPath}: ⭐${stars} 🍴${forks} 📅${pushedAt || 'N/A'} ${language ? '🔷'+language : ''}`);
    
    updatedTools.push({
      repo: repoPath,
      stars,
      pushedAt,
      forks,
      language,
      topics
    });
    
    // Rate limit: 1 request per second
    if (i < repos.length - 1) {
      await sleep(1100);
    }
  }
  
  console.log(`\n📊 成功获取 ${updatedTools.length} 个仓库数据`);
  
  // Find new AI topics
  const uniqueTopics = [...new Set(allRepoTopics)];
  const newTopics = [];
  
  for (const topic of uniqueTopics) {
    if (existingTopics.existing.has(topic)) continue;
    if (!isAITopic(topic)) continue;
    
    const count = topicUsage[topic] || 0;
    const maxStarsForTopic = updatedTools
      .filter(t => t.topics.includes(topic))
      .reduce((max, t) => Math.max(max, t.stars), 0);
    
    // Skip if too niche: only 1 repo using it AND stars < 1000
    if (count <= 1 && maxStarsForTopic < 1000) {
      console.log(`  🚫 跳过冷门 topic: ${topic} (${count} repos, max stars=${maxStarsForTopic})`);
      continue;
    }
    
    // Determine minStars based on usage count
    let minStars;
    if (count >= 3) minStars = 2000;
    else if (count >= 2) minStars = 3000;
    else minStars = 5000;
    
    newTopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description: `（自动发现）${topic}`
    });
  }
  
  console.log(`\n🔍 发现 ${newTopics.length} 个新的 AI Topics`);
  for (const nt of newTopics) {
    console.log(`  ✨ ${nt.topic} — ${nt.description} (${topicUsage[nt.topic]} repos)`);
  }
  
  // Update ai-topics.json
  if (newTopics.length > 0) {
    const topicData = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
    for (const nt of newTopics) {
      // Skip if already exists (case insensitive)
      const exists = topicData.topics.some(t => t.topic.toLowerCase() === nt.topic.toLowerCase());
      if (!exists) {
        topicData.topics.push(nt);
      }
    }
    topicData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TOPICS_FILE, JSON.stringify(topicData, null, 2));
    console.log(`\n💾 已更新 ai-topics.json (${topicData.topics.length} topics)`);
  }
  
  // Output summary for the caller to process
  const summary = {
    totalRepos: repos.length,
    fetchedRepos: updatedTools.length,
    updatedTools: updatedTools.map(t => ({
      repo: t.repo,
      stars: t.stars,
      pushedAt: t.pushedAt,
      forks: t.forks,
      language: t.language
    })),
    newTopics: newTopics,
    newTopicCount: newTopics.length,
    totalTopicCount: existingTopics.topics.length + newTopics.length
  };
  
  fs.writeFileSync('/tmp/github-update-summary.json', JSON.stringify(summary, null, 2));
  console.log('\n✅ 完成！摘要已保存到 /tmp/github-update-summary.json');
}

main().catch(e => {
  console.error('❌ 执行失败:', e);
  process.exit(1);
});
