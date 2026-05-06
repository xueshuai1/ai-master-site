#!/usr/bin/env node
const fs = require('fs');
const https = require('https');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
const TOOLS_FILE = path.join(__dirname, 'src/data/tools.ts');
const TOPICS_FILE = path.join(__dirname, 'data/ai-topics.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ai-master-site', 'Accept': 'application/vnd.github+json', 'Authorization': `Bearer ${TOKEN}` } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(JSON.parse(data));
        else if (res.statusCode === 404) resolve(null);
        else { console.error(`  HTTP ${res.statusCode}`); resolve(null); }
      });
    }).on('error', reject);
  });
}

function extractRepos(content) {
  const repoSet = new Map(); // url -> tool ids using it
  const idRegex = /id:\s*["']([^"']+)["']/g;
  const urlRegex = /url:\s*["']https:\/\/github\.com\/([^"']+)["']/g;
  
  let lastId = null;
  const idMatches = [...content.matchAll(/id:\s*["']([^"']+)["']/g)];
  const urlMatches = [...content.matchAll(/url:\s*["']https:\/\/github\.com\/([^"']+)["']/g)];
  
  // Build a map: for each URL, find which tool id it belongs to
  // by finding the nearest preceding id:
  for (const urlMatch of urlMatches) {
    const repo = urlMatch[1];
    const urlPos = urlMatch.index;
    // Find the id: that comes before this url: within the same tool block
    let bestId = null;
    let bestDist = Infinity;
    for (const idMatch of idMatches) {
      const dist = urlPos - idMatch.index;
      if (dist > 0 && dist < bestDist) {
        // Check there's no closing }, between id and url
        const between = content.substring(idMatch.index, urlPos);
        if (!between.includes('},')) {
          bestId = idMatch[1];
          bestDist = dist;
        }
      }
    }
    if (bestId && !repoSet.has(repo)) {
      repoSet.set(repo, bestId);
    }
  }
  return repoSet;
}

async function main() {
  const content = fs.readFileSync(TOOLS_FILE, 'utf8');
  const repos = extractRepos(content);
  const uniqueRepos = [...repos.keys()];
  console.log(`Found ${uniqueRepos.length} unique GitHub repos`);
  
  // Load existing topics
  const topicsData = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
  const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
  console.log(`Existing topics: ${existingTopics.size}`);
  
  // Fetch data for each repo
  const repoData = {};
  for (let i = 0; i < uniqueRepos.length; i++) {
    const repo = uniqueRepos[i];
    const toolId = repos.get(repo);
    const url = `https://api.github.com/repos/${repo}`;
    const data = await fetchJSON(url);
    if (!data) { console.log(`[${i+1}] ⚠️ ${repo} (${toolId}) — skipped`); await sleep(1000); continue; }
    repoData[repo] = data;
    console.log(`[${i+1}] ✅ ${repo} (${toolId}) — ⭐${data.stargazers_count} 🍴${data.forks_count} 💻${data.language} 📅${data.pushed_at?.split('T')[0]}`);
    if (i < uniqueRepos.length - 1) await sleep(1000);
  }
  
  // Parse tools.ts into blocks for updating
  const lines = content.split('\n');
  const tools = [];
  let current = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const idMatch = line.match(/id:\s*["']([^"']+)["']/);
    if (idMatch) {
      current = { id: idMatch[1], startLine: i, endLine: -1, url: '', urlLine: -1, stars: 0, starsLine: -1, forks: 0, forksLine: -1, lang: '', langLine: -1, updatedAtLine: -1 };
      tools.push(current);
    }
    if (current) {
      if (line.match(/githubStars:\s*\d+/)) {
        const m = line.match(/githubStars:\s*(\d+)/);
        current.stars = parseInt(m[1]);
        current.starsLine = i;
      }
      if (line.match(/forks:\s*\d+/)) {
        const m = line.match(/forks:\s*(\d+)/);
        current.forks = parseInt(m[1]);
        current.forksLine = i;
      }
      if (line.match(/language:\s*["'][^"']+["']/)) {
        const m = line.match(/language:\s*["']([^"']+)["']/);
        current.lang = m[1];
        current.langLine = i;
      }
      if (line.includes('updatedAt:')) {
        current.updatedAtLine = i;
      }
      const urlM = line.match(/url:\s*["']https:\/\/github\.com\/([^"']+)["']/);
      if (urlM) {
        current.url = urlM[1];
        current.urlLine = i;
      }
      if (line.trim() === '},') {
        current.endLine = i;
        current = null;
      }
    }
  }
  
  // Apply updates
  let starsUpdated = 0, forksUpdated = 0, langUpdated = 0, dateUpdated = 0;
  const starsChanges = [];
  
  for (const tool of tools) {
    if (!repoData[tool.url]) continue;
    const data = repoData[tool.url];
    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLang = data.language;
    const newDate = data.pushed_at ? data.pushed_at.split('T')[0] : null;
    
    const indent = (ln) => { const l = lines[ln]; const m = l.match(/^(\s*)/); return m ? m[1] : '    '; };
    
    // Stars
    if (tool.starsLine >= 0 && newStars !== tool.stars) {
      const diff = newStars - tool.stars;
      starsChanges.push({ id: tool.id, old: tool.stars, new: newStars, diff });
      lines[tool.starsLine] = `${indent(tool.starsLine)}githubStars: ${newStars},`;
      starsUpdated++;
      console.log(`  ✏️ ${tool.id}: stars ${tool.stars} → ${newStars} (${diff > 0 ? '+' : ''}${diff})`);
    }
    
    // Forks
    if (tool.forksLine >= 0 && newForks !== tool.forks) {
      lines[tool.forksLine] = `${indent(tool.forksLine)}forks: ${newForks},`;
      forksUpdated++;
    } else if (tool.forksLine < 0 && tool.endLine > 0) {
      // Insert forks after the line with githubStars or createdAt
      const insertAt = tool.starsLine >= 0 ? tool.starsLine : tool.startLine + 2;
      // Actually find the line after stars or before createdAt
      let target = tool.starsLine >= 0 ? tool.starsLine : insertAt;
      // Insert after this line
      lines.splice(target + 1, 0, `${indent(target)}forks: ${newForks},`);
      forksUpdated++;
      // Fix line numbers for all subsequent tools
      for (const t of tools) {
        if (t.starsLine > target) t.starsLine++;
        if (t.forksLine > target) t.forksLine++;
        if (t.langLine > target) t.langLine++;
        if (t.updatedAtLine > target) t.updatedAtLine++;
        if (t.endLine > target) t.endLine++;
      }
    }
    
    // Language
    if (newLang && newLang !== 'null') {
      if (tool.langLine >= 0 && newLang !== tool.lang) {
        lines[tool.langLine] = `${indent(tool.langLine)}language: "${newLang}",`;
        langUpdated++;
      } else if (tool.langLine < 0) {
        const insertAt = tool.forksLine >= 0 ? tool.forksLine : (tool.starsLine >= 0 ? tool.starsLine : tool.startLine + 2);
        lines.splice(insertAt + 1, 0, `${indent(insertAt)}language: "${newLang}",`);
        langUpdated++;
        for (const t of tools) {
          if (t.starsLine > insertAt) t.starsLine++;
          if (t.forksLine > insertAt) t.forksLine++;
          if (t.langLine > insertAt) t.langLine++;
          if (t.updatedAtLine > insertAt) t.updatedAtLine++;
          if (t.endLine > insertAt) t.endLine++;
        }
      }
    }
    
    // UpdatedAt
    if (newDate && tool.updatedAtLine >= 0) {
      const oldDate = lines[tool.updatedAtLine].match(/updatedAt:\s*["']([^"']+)["']/);
      if (oldDate && oldDate[1] !== newDate) {
        lines[tool.updatedAtLine] = `${indent(tool.updatedAtLine)}updatedAt: "${newDate}",`;
        dateUpdated++;
      }
    }
  }
  
  const totalChanges = starsUpdated + forksUpdated + langUpdated + dateUpdated;
  if (totalChanges > 0) {
    fs.writeFileSync(TOOLS_FILE, lines.join('\n'));
    console.log(`\nUpdated tools.ts: ${totalChanges} changes`);
  } else {
    console.log('\nNo changes to tools.ts');
  }
  
  // Discover new AI topics
  const aiKeywords = [
    'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision',
    'language','neural','learning','generative','prompt','chatbot','deep-learning',
    'machine-learning','transformer','gpt','diffusion','rag','embedding','inference',
    'fine-tuning','llmops','mlops','model-serving','vector-search','semantic-search',
    'knowledge-graph','multimodal','speech','text-to-speech','image-generation',
    'video-generation','code-generation','autonomous','embodied-ai','world-models',
    'foundation-models','large-language-models','retrieval-augmented','instruction-tuning',
    'rlhf','alignment'
  ];
  
  const topicMap = {};
  for (const [repo, data] of Object.entries(repoData)) {
    for (const t of (data.topics || [])) {
      const norm = t.toLowerCase().replace(/\s+/g, '-');
      if (!topicMap[norm]) topicMap[norm] = { count: 0, repos: [], maxStars: 0 };
      topicMap[norm].count++;
      topicMap[norm].repos.push(repo);
      topicMap[norm].maxStars = Math.max(topicMap[norm].maxStars, data.stargazers_count);
    }
  }
  
  const newTopics = [];
  for (const [topic, info] of Object.entries(topicMap)) {
    if (existingTopics.has(topic)) continue;
    
    const isAi = aiKeywords.some(kw => {
      const tn = topic.toLowerCase();
      return tn.includes(kw) || kw.includes(tn.replace(/-/g, '')) || 
             tn.split('-').some(p => kw.includes(p)) ||
             kw.split('-').some(p => tn.includes(p));
    });
    
    if (!isAi) continue;
    
    // Filter: single repo with < 1000 stars → skip
    if (info.count === 1 && info.maxStars < 1000) continue;
    
    let minStars = 5000;
    if (info.count >= 3) minStars = 2000;
    else if (info.count >= 2) minStars = 3000;
    
    newTopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description: `（自动发现）${topic}`,
    });
  }
  
  if (newTopics.length > 0) {
    console.log(`\nDiscovered ${newTopics.length} new AI topics:`);
    for (const t of newTopics) {
      console.log(`  🔖 ${t.topic} — ${topicMap[t.topic].count} repos, max ⭐${topicMap[t.topic].maxStars}`);
    }
    topicsData.topics.push(...newTopics);
    topicsData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TOPICS_FILE, JSON.stringify(topicsData, null, 2));
    console.log(`ai-topics.json: ${topicsData.topics.length} topics total`);
  } else {
    console.log('\nNo new AI topics discovered');
  }
  
  // Write summary
  const summary = {
    totalRepos: uniqueRepos.length,
    starsUpdated,
    forksUpdated,
    langUpdated,
    dateUpdated,
    totalChanges,
    starsChanges: starsChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 5),
    newTopicsFound: newTopics.length,
    totalTopics: topicsData.topics.length,
    newTopics: newTopics.map(t => ({
      topic: t.topic,
      repos: topicMap[t.topic].count,
      description: t.description,
    })),
    lastUpdated: new Date().toISOString(),
  };
  
  fs.writeFileSync('/tmp/github-update-summary.json', JSON.stringify(summary, null, 2));
  console.log('\nDone.');
}

main().catch(e => { console.error(e); process.exit(1); });
