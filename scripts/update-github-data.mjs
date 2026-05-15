import { readFileSync, writeFileSync } from 'fs';

// Load GITHUB_TOKEN
const envContent = readFileSync('/Users/xueshuai/.openclaw/workspace/ai-master-site/.env.local', 'utf8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) { console.error('No token'); process.exit(1); }

// Read tools.ts
const toolsPath = '/Users/xueshuai/.openclaw/workspace/ai-master-site/src/data/tools.ts';
let toolsContent = readFileSync(toolsPath, 'utf8');

// Extract GitHub repos: find all url: "https://github.com/..." entries
const urlRegex = /url:\s*"https:\/\/github\.com\/([^/]+)\/([^"]+)"/g;
const repos = [];
let m;
while ((m = urlRegex.exec(toolsContent)) !== null) {
  repos.push({ owner: m[1], repo: m[2], url: `https://github.com/${m[1]}/${m[2]}`, startIndex: m.index, fullMatch: m[0] });
}
console.log(`Found ${repos.length} GitHub repos`);

// Read existing topics
const topicsPath = '/Users/xueshuai/.openclaw/workspace/ai-master-site/data/ai-topics.json';
const topicsData = JSON.parse(readFileSync(topicsPath, 'utf8'));
const existingTopicsSet = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// AI keywords for topic classification
const aiKeywords = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models','large-language-models',
  'retrieval-augmented','instruction-tuning','rlhf','alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return aiKeywords.some(kw => t.includes(kw) || kw.includes(t.replace(/-/g, '')));
}

function normalizeTopic(topic) {
  return topic.toLowerCase().replace(/\s+/g, '-');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Fetch repo data
async function fetchRepo(owner, repo) {
  try {
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}?access_token=${GITHUB_TOKEN}`);
    if (resp.status === 404) return null;
    if (!resp.ok) {
      console.log(`  ⚠️ ${owner}/${repo}: HTTP ${resp.status}`);
      return null;
    }
    const data = await resp.json();
    return {
      stargazers_count: data.stargazers_count,
      pushed_at: data.pushed_at,
      forks_count: data.forks_count,
      language: data.language,
      topics: data.topics || []
    };
  } catch (e) {
    console.log(`  ❌ ${owner}/${repo}: ${e.message}`);
    return null;
  }
}

// Process with rate limiting
const repoData = [];
const allTopicCounts = new Map();

for (let i = 0; i < repos.length; i++) {
  const r = repos[i];
  if (i % 10 === 0) console.log(`Progress: ${i}/${repos.length}`);
  const data = await fetchRepo(r.owner, r.repo);
  if (data) {
    repoData.push({ ...r, ...data });
    data.topics.forEach(t => {
      const n = normalizeTopic(t);
      allTopicCounts.set(n, (allTopicCounts.get(n) || 0) + 1);
    });
  }
  if (i < repos.length - 1) await sleep(1200);
}

console.log(`\n✅ Fetched ${repoData.length}/${repos.length} repos`);

// --- Find oldest updated tool ---
let oldestTool = null;
let oldestDate = null;
for (const r of repoData) {
  // Find the tool id near this url
  const beforeUrl = toolsContent.substring(0, r.startIndex);
  const idMatches = [...beforeUrl.matchAll(/id:\s*"([^"]+)"/g)];
  const toolId = idMatches.length > 0 ? idMatches[idMatches.length - 1][1] : null;
  const pushedDate = r.pushed_at ? r.pushed_at.split('T')[0] : null;
  if (pushedDate && (!oldestDate || pushedDate < oldestDate)) {
    oldestDate = pushedDate;
    oldestTool = { id: toolId, name: r.repo, pushed_at: pushedDate };
  }
}

// --- Calculate star changes ---
const changes = [];
const toolsChanged = new Set();

for (const r of repoData) {
  // Find the tool id
  const beforeUrl = toolsContent.substring(0, r.startIndex);
  const idMatches = [...beforeUrl.matchAll(/id:\s*"([^"]+)"/g)];
  const toolId = idMatches.length > 0 ? idMatches[idMatches.length - 1][1] : null;
  
  // Find githubStars near this position (within 2000 chars after url)
  const afterUrl = toolsContent.substring(r.startIndex, r.startIndex + 2000);
  const starsMatch = afterUrl.match(/githubStars:\s*(\d+)/);
  const existingStars = starsMatch ? parseInt(starsMatch[1]) : null;
  
  if (existingStars !== null && existingStars !== r.stargazers_count) {
    changes.push({
      toolId,
      type: 'stars',
      old: existingStars,
      new: r.stargazers_count,
      delta: r.stargazers_count - existingStars,
      // We'll find the exact text to replace
      contextStart: r.startIndex + starsMatch.index
    });
    toolsChanged.add(toolId);
  }
  
  // Check forks
  const forksMatch = afterUrl.match(/forks:\s*(\d+)/);
  const existingForks = forksMatch ? parseInt(forksMatch[1]) : null;
  if (r.forks_count > 0 && existingForks !== null && existingForks !== r.forks_count) {
    changes.push({
      toolId,
      type: 'forks',
      old: existingForks,
      new: r.forks_count,
      contextStart: r.startIndex + forksMatch.index
    });
    toolsChanged.add(toolId);
  }
  
  // Check language
  const langMatch = afterUrl.match(/language:\s*"([^"]+)"/);
  const existingLang = langMatch ? langMatch[1] : null;
  if (r.language && r.language !== 'null' && existingLang !== r.language) {
    changes.push({
      toolId,
      type: 'language',
      old: existingLang,
      new: r.language,
      contextStart: r.startIndex + langMatch.index
    });
    toolsChanged.add(toolId);
  }
}

// --- Build patch data ---
// We need exact oldText -> newText for each change
// Since many values might be duplicated, we use context to disambiguate

function getUniqueReplacement(content, position, oldText, newText, windowSize = 500) {
  const before = content.substring(Math.max(0, position - windowSize), position);
  const after = content.substring(position + oldText.length, position + oldText.length + windowSize);
  // Find if the exact oldText + context is unique
  const ctxBefore = before.slice(-200);
  const ctxAfter = after.slice(0, 200);
  
  // Try to find a unique replacement
  const searchText = oldText;
  const allOccurrences = [];
  let idx = 0;
  while ((idx = content.indexOf(searchText, idx)) !== -1) {
    const ctxB = content.substring(Math.max(0, idx - 200), idx);
    const ctxA = content.substring(idx + searchText.length, idx + searchText.length + 200);
    allOccurrences.push({ idx, ctxB, ctxA });
    idx += 1;
  }
  
  if (allOccurrences.length === 1) {
    return { oldText, newText, unique: true };
  }
  
  // Try to find context that makes it unique
  for (let w = 50; w <= 500; w += 50) {
    for (const occ of allOccurrences) {
      if (occ.idx === position) {
        const candidate = occ.ctxB.slice(-w) + searchText + occ.ctxA.slice(0, w);
        // Check uniqueness
        const matches = allOccurrences.filter(o => {
          const oCandidate = o.ctxB.slice(-w) + searchText + o.ctxA.slice(0, w);
          return oCandidate === candidate;
        });
        if (matches.length === 1) {
          return { oldText: candidate, newText: occ.ctxB.slice(-w) + newText + occ.ctxA.slice(0, w), unique: true };
        }
      }
    }
  }
  
  return { oldText, newText, unique: false };
}

// --- Apply patches ---
let patchesApplied = 0;
let patchesSkipped = 0;

for (const c of changes) {
  const result = getUniqueReplacement(toolsContent, c.contextStart, 
    c.type === 'stars' ? `githubStars: ${c.old}` : 
    c.type === 'forks' ? `forks: ${c.forks !== undefined ? c.old : ''}` : '',
    c.type === 'stars' ? `githubStars: ${c.new}` :
    c.type === 'forks' ? `forks: ${c.new}` : '',
    500
  );
  
  // Actually let's be more careful - just use the simple value replacement
  // and verify uniqueness
  const oldValue = c.type === 'stars' ? `githubStars: ${c.old}` : 
                   c.type === 'forks' ? `forks: ${c.old}` :
                   `language: "${c.old}"`;
  const newValue = c.type === 'stars' ? `githubStars: ${c.new}` :
                   c.type === 'forks' ? `forks: ${c.new}` :
                   `language: "${c.new}"`;
  
  // Count occurrences
  const escapedOld = oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const allIdx = [];
  let searchIdx = 0;
  while ((searchIdx = toolsContent.indexOf(oldValue, searchIdx)) !== -1) {
    allIdx.push(searchIdx);
    searchIdx += 1;
  }
  
  if (allIdx.length === 1) {
    toolsContent = toolsContent.replace(oldValue, newValue);
    patchesApplied++;
  } else {
    // Try with surrounding context
    let found = false;
    for (const pos of allIdx) {
      if (Math.abs(pos - c.contextStart) < 100) {
        // This is our target
        const ctxBefore = toolsContent.substring(Math.max(0, pos - 300), pos);
        const ctxAfter = toolsContent.substring(pos + oldValue.length, pos + oldValue.length + 300);
        // Check if this context combo is unique
        for (const otherPos of allIdx) {
          if (otherPos === pos) continue;
          const oCtxB = toolsContent.substring(Math.max(0, otherPos - 300), otherPos);
          const oCtxA = toolsContent.substring(otherPos + oldValue.length, otherPos + oldValue.length + 300);
          if (oCtxB === ctxBefore && oCtxA === ctxAfter) {
            found = false;
            break;
          }
          found = true;
        }
        if (found || allIdx.length === 2) {
          // Use ctx to disambiguate
          const bigOld = ctxBefore.slice(-150) + oldValue + ctxAfter.slice(0, 150);
          const bigNew = ctxBefore.slice(-150) + newValue + ctxAfter.slice(0, 150);
          // Check uniqueness of bigOld
          let bigCount = 0;
          let bi = 0;
          while ((bi = toolsContent.indexOf(bigOld, bi)) !== -1) { bigCount++; bi += 1; }
          if (bigCount === 1) {
            toolsContent = toolsContent.replace(bigOld, bigNew);
            patchesApplied++;
            found = true;
          }
        }
        break;
      }
    }
    if (!found) patchesSkipped++;
  }
}

// Sort within each category by stars (descending)
// This is complex, skip for now unless there are significant changes
console.log(`Patches applied: ${patchesApplied}, skipped: ${patchesSkipped}`);

// --- New AI Topics ---
const newTopics = [];
for (const [topic, count] of allTopicCounts.entries()) {
  if (existingTopicsSet.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  
  // Check min stars threshold
  if (count === 1) {
    const hasHighStars = repoData.some(r =>
      r.topics.map(normalizeTopic).includes(topic) && r.stargazers_count >= 1000
    );
    if (!hasHighStars) continue;
  }
  
  let minStars = 5000;
  if (count >= 3) minStars = 2000;
  else if (count >= 2) minStars = 3000;
  
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${topic.replace(/-/g, ' ')}`
  });
}

// Write updated files
if (toolsContent !== readFileSync(toolsPath, 'utf8')) {
  writeFileSync(toolsPath, toolsContent);
  console.log('✅ tools.ts written');
}

if (newTopics.length > 0) {
  topicsData.topics.push(...newTopics);
  topicsData.lastUpdated = new Date().toISOString();
  writeFileSync(topicsPath, JSON.stringify(topicsData, null, 2));
  console.log(`✅ ai-topics.json: +${newTopics.length} topics`);
}

// Write summary
const summary = {
  totalRepos: repos.length,
  fetchedRepos: repoData.length,
  changes: changes.map(c => ({ toolId: c.toolId, type: c.type, old: c.old, new: c.new, delta: c.delta })),
  patchesApplied,
  patchesSkipped,
  newTopicsCount: newTopics.length,
  totalTopics: topicsData.topics.length,
  toolsChanged: toolsChanged.size,
  topChanges: changes.filter(c => c.type === 'stars').sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 5),
  oldestTool,
  newTopicsList: newTopics.slice(0, 20),
  forksUpdated: changes.filter(c => c.type === 'forks').length,
  langUpdated: changes.filter(c => c.type === 'language').length,
  starsUpdated: changes.filter(c => c.type === 'stars').length
};

writeFileSync('/tmp/github-update-summary.json', JSON.stringify(summary, null, 2));
console.log('\nSummary:', JSON.stringify(summary, null, 2));
