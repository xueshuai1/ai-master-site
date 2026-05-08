const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const TOOLS_PATH = path.join(__dirname, '..', 'src', 'data', 'tools.ts');
const TOPICS_PATH = path.join(__dirname, '..', 'data', 'ai-topics.json');

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

function isAiRelated(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => t.includes(kw) || kw.includes(t));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse repos from tools.ts URL patterns
const toolsContent = fs.readFileSync(TOOLS_PATH, 'utf-8');
const urlRegex = /https:\/\/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/g;
const repos = [];
let m;
while ((m = urlRegex.exec(toolsContent)) !== null) {
  repos.push(m[1]);
}
const uniqueRepos = [...new Set(repos)];
console.log(`Found ${uniqueRepos.length} unique repos`);

// Load existing topics
const topicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
console.log(`Existing topics: ${existingTopics.size}`);

// Build tool ID -> repo mapping
const idRepoMap = new Map();
const lines = toolsContent.split('\n');
let currentId = '';
for (const line of lines) {
  const idMatch = /id:\s*['"]([^'"]+)['"]/.exec(line);
  const repoMatch = /githubRepo:\s*['"]([^'"]+)['"]/.exec(line);
  const urlMatch = /url:\s*['"]https:\/\/github\.com\/([^'"]+)['"]/.exec(line);
  if (idMatch) currentId = idMatch[1];
  if (repoMatch && currentId) idRepoMap.set(currentId, repoMatch[1]);
  if (urlMatch && currentId && !idRepoMap.has(currentId)) idRepoMap.set(currentId, urlMatch[1]);
}

async function main() {
  const results = [];
  const allTopics = new Map();
  let rateLimitHits = 0;

  for (const repo of uniqueRepos) {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (response.status === 403) {
        rateLimitHits++;
        const body = await response.json();
        const resetTime = body.message?.includes('rate limit') ? response.headers.get('x-ratelimit-reset') : null;
        console.log(`⚠️ Rate limited (${rateLimitHits}), waiting 65s...`);
        await sleep(65000);
        // Retry once
        const retry = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
        });
        if (!retry.ok) { console.log(`❌ Retry failed for ${repo}: ${retry.status}`); continue; }
        const data = await retry.json();
        results.push({ repo, stargazers_count: data.stargazers_count, pushed_at: data.pushed_at, forks_count: data.forks_count || 0, language: data.language, topics: data.topics || [] });
        (data.topics || []).forEach(t => allTopics.set(t, (allTopics.get(t) || 0) + 1));
        console.log(`✅ ${repo}: ${data.stargazers_count} ⭐`);
        await sleep(1100);
        continue;
      }

      if (response.status === 404) {
        console.log(`⚠️ Not found: ${repo}`);
        await sleep(200);
        continue;
      }

      if (!response.ok) {
        console.log(`❌ ${repo}: HTTP ${response.status}`);
        await sleep(1000);
        continue;
      }

      const data = await response.json();
      results.push({
        repo,
        stargazers_count: data.stargazers_count,
        pushed_at: data.pushed_at,
        forks_count: data.forks_count || 0,
        language: data.language,
        topics: data.topics || []
      });
      (data.topics || []).forEach(t => allTopics.set(t, (allTopics.get(t) || 0) + 1));
      console.log(`✅ ${repo}: ${data.stargazers_count} ⭐`);
      await sleep(1100);
    } catch (e) {
      console.log(`❌ Error ${repo}: ${e.message}`);
      await sleep(1000);
    }
  }

  // Process results
  const repoMap = new Map();
  results.forEach(r => repoMap.set(r.repo, r));

  let updatedContent = toolsContent;
  const starChanges = [];
  let forksUpdated = 0;
  let languageUpdated = 0;
  let updatedAtUpdated = 0;

  for (const [id, repo] of idRepoMap) {
    const rd = repoMap.get(repo);
    if (!rd) continue;

    const blockStart = updatedContent.indexOf(`id: "${id}"`);
    if (blockStart === -1) continue;
    const nextIdPos = updatedContent.indexOf(`id: "`, blockStart + 1);
    const blockEnd = nextIdPos === -1 ? updatedContent.length : nextIdPos;
    const block = updatedContent.substring(blockStart, blockEnd);
    const nameM = /name:\s*['"]([^'"]+)['"]/.exec(block);
    const toolName = nameM ? nameM[1] : id;

    // githubStars
    const starsM = block.match(/githubStars:\s*(\d+)/);
    if (starsM) {
      const oldS = parseInt(starsM[1]);
      const newS = rd.stargazers_count;
      if (oldS !== newS) {
        updatedContent = updatedContent.replace(`githubStars: ${oldS}`, `githubStars: ${newS}`);
        starChanges.push({ name: toolName, old: oldS, new: newS });
      }
    }

    // forks
    const forksM = block.match(/forks:\s*(\d+)/);
    if (forksM) {
      const oldF = parseInt(forksM[1]);
      const newF = rd.forks_count;
      if (oldF !== newF) {
        updatedContent = updatedContent.replace(`forks: ${oldF}`, `forks: ${newF}`);
        forksUpdated++;
      }
    } else if (rd.forks_count != null) {
      const insPt = block.search(/createdAt:/);
      if (insPt !== -1) {
        const abs = blockStart + insPt;
        updatedContent = updatedContent.substring(0, abs) + `forks: ${rd.forks_count},\n    ` + updatedContent.substring(abs);
        forksUpdated++;
      }
    }

    // language
    const langM = block.match(/language:\s*['"]([^'"]+)['"]/);
    if (langM) {
      if (rd.language && langM[1] !== rd.language) {
        updatedContent = updatedContent.replace(`language: "${langM[1]}"`, `language: "${rd.language}"`);
        languageUpdated++;
      }
    } else if (rd.language) {
      const insPt = block.search(/createdAt:/);
      if (insPt !== -1) {
        const abs = blockStart + insPt;
        updatedContent = updatedContent.substring(0, abs) + `language: "${rd.language}",\n    ` + updatedContent.substring(abs);
        languageUpdated++;
      }
    }

    // updatedAt
    if (rd.pushed_at) {
      const dateStr = new Date(rd.pushed_at).toISOString().split('T')[0];
      const upM = block.match(/updatedAt:\s*['"]([^'"]+)['"]/);
      if (upM && upM[1] !== dateStr) {
        updatedContent = updatedContent.replace(`updatedAt: "${upM[1]}"`, `updatedAt: "${dateStr}"`);
        updatedAtUpdated++;
      }
    }
  }

  fs.writeFileSync(TOOLS_PATH, updatedContent);
  console.log(`\n📊 Star changes: ${starChanges.length}`);
  starChanges.forEach(c => { const d = c.new - c.old; console.log(`  ${c.name}: ${c.old} → ${c.new} (${d > 0 ? '+' : ''}${d})`); });
  console.log(`Forks updated: ${forksUpdated}`);
  console.log(`Language updated: ${languageUpdated}`);
  console.log(`Updated dates updated: ${updatedAtUpdated}`);

  // New AI topics
  const newTopics = [];
  for (const [topic, count] of allTopics) {
    if (existingTopics.has(topic.toLowerCase())) continue;
    if (!isAiRelated(topic)) continue;
    const reposWithTopic = results.filter(r => r.topics.includes(topic));
    const maxStars = Math.max(...reposWithTopic.map(r => r.stargazers_count));
    if (reposWithTopic.length === 1 && maxStars < 1000) continue;

    let minStars = reposWithTopic.length >= 3 ? 2000 : reposWithTopic.length >= 2 ? 3000 : 5000;
    const norm = topic.toLowerCase().replace(/\s+/g, '-');
    newTopics.push({ topic: norm, url: `https://github.com/topics/${norm}`, minStars, description: `（自动发现）${topic}` });
  }

  console.log(`\n🔍 New AI topics: ${newTopics.length}`);
  newTopics.forEach(t => console.log(`  ${t.topic} — ${t.description}`));

  if (newTopics.length > 0) {
    topicsData.topics.push(...newTopics);
    topicsData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2) + '\n');
    console.log(`Total topics: ${topicsData.topics.length}`);
  }

  const summary = {
    reposScanned: uniqueRepos.length,
    reposFetched: results.length,
    starChanges: starChanges.length,
    starChangeDetails: starChanges.slice(0, 5),
    forksUpdated, languageUpdated, updatedAtUpdated,
    newTopicsFound: newTopics.length,
    newTopics: newTopics.slice(0, 10),
    totalTopics: topicsData.topics.length,
    toolsWithStars: (updatedContent.match(/githubStars:/g) || []).length
  };
  fs.writeFileSync('/tmp/update-summary.json', JSON.stringify(summary, null, 2));
  console.log('\n✅ Done');
}

main().catch(e => { console.error(e); process.exit(1); });
