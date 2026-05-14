#!/usr/bin/env node
// Update GitHub stars, forks, language, updatedAt (only existing fields) + discover new AI topics
const fs = require('fs');
const path = require('path');

const TOOLS_PATH = path.resolve(__dirname, '../src/data/tools.ts');
const TOPICS_PATH = path.resolve(__dirname, '../data/ai-topics.json');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const AI_KEYWORDS = [
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
  return AI_KEYWORDS.some(kw => t.includes(kw) || kw.includes(t));
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchRepo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const resp = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`
      }
    });
    if (!resp.ok) {
      console.error(`  ❌ ${owner}/${repo}: HTTP ${resp.status}`);
      return null;
    }
    return await resp.json();
  } catch (e) {
    console.error(`  ❌ ${owner}/${repo}: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('🔍 Reading files...');
  const toolsContent = fs.readFileSync(TOOLS_PATH, 'utf8');
  const topicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'));
  const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

  // Parse tool blocks
  const lines = toolsContent.split('\n');
  const toolsArrayIdx = lines.findIndex(l => l.includes('export const tools: Tool[] = ['));
  if (toolsArrayIdx === -1) { console.error('Cannot find tools array'); process.exit(1); }

  const toolBlocks = [];
  let currentId = null;
  let currentUrl = null;
  let currentBlockStart = -1;
  let braceDepth = 0;

  for (let i = toolsArrayIdx; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '{') {
        braceDepth++;
        if (braceDepth === 1 && i > toolsArrayIdx) {
          currentBlockStart = i;
          currentId = null;
          currentUrl = null;
        }
      }
      if (ch === '}') {
        braceDepth--;
        if (braceDepth === 0 && currentBlockStart >= 0) {
          if (currentId && currentUrl) {
            toolBlocks.push({ id: currentId, url: currentUrl, startLine: currentBlockStart, endLine: i });
          }
          currentBlockStart = -1;
        }
      }
    }
    if (braceDepth === 1) {
      const idMatch = /^\s*id:\s*["']([^"']+)["']/.exec(line);
      if (idMatch) currentId = idMatch[1];
      const urlMatch = /^\s*url:\s*["'](https:\/\/github\.com\/([^"']+))["']/.exec(line);
      if (urlMatch && !urlMatch[1].includes('/features/')) {
        currentUrl = urlMatch[1].replace(/\/+$/, '');
      }
    }
  }

  console.log(`📡 Found ${toolBlocks.length} tools, fetching data...`);

  // Build unique repo set
  const repoSet = new Map();
  for (const block of toolBlocks) {
    const repoPath = block.url.replace('https://github.com/', '');
    if (!repoSet.has(repoPath)) repoSet.set(repoPath, []);
    repoSet.get(repoPath).push(block.id);
  }

  // Fetch all repo data
  const repoDataMap = new Map();
  let idx = 0;
  for (const repoPath of repoSet.keys()) {
    idx++;
    const [owner, repo] = repoPath.split('/');
    console.log(`  [${idx}/${repoSet.size}] ${owner}/${repo}`);
    const data = await fetchRepo(owner, repo);
    if (data) repoDataMap.set(repoPath, data);
    if (idx < repoSet.size) await sleep(1000);
  }

  // Apply changes from bottom to top
  const starChanges = [];
  let forksUpdated = 0, langUpdated = 0, starsUpdated = 0, updatedAtUpdated = 0;
  const allTopics = new Map();
  let errors = [];
  let lastUpdatedOldest = { days: 0, id: '', date: '' };

  // Helper to find a field that can span inline (forks/language might be on same line as other fields)
  function findAndUpdate(line, startLine, endLine, field, updater) {
    for (let i = startLine; i <= endLine; i++) {
      if (lines[i].includes(`${field}:`) || lines[i].includes(`${field} :`)) {
        const newValue = updater(lines[i]);
        if (newValue !== null && newValue !== lines[i]) {
          lines[i] = newValue;
          return true;
        }
        return false;
      }
    }
    return false;
  }

  for (let bi = toolBlocks.length - 1; bi >= 0; bi--) {
    const block = toolBlocks[bi];
    const repoPath = block.url.replace('https://github.com/', '');
    const data = repoDataMap.get(repoPath);
    if (!data) {
      errors.push(`${repoPath}: no data`);
      continue;
    }

    const { startLine, endLine, id } = block;
    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLang = data.language || '';
    const newUpdatedAt = data.pushed_at ? new Date(data.pushed_at).toISOString().split('T')[0] : '';

    // Collect topics
    if (data.topics && Array.isArray(data.topics)) {
      for (const t of data.topics) {
        const normalized = t.toLowerCase().replace(/\s+/g, '-');
        allTopics.set(normalized, (allTopics.get(normalized) || 0) + 1);
      }
    }

    if (newUpdatedAt) {
      const daysAgo = Math.floor((Date.now() - new Date(newUpdatedAt).getTime()) / 86400000);
      if (daysAgo > lastUpdatedOldest.days) {
        lastUpdatedOldest = { days: daysAgo, id, date: newUpdatedAt };
      }
    }

    // Update githubStars
    let changed = false;
    for (let i = startLine; i <= endLine; i++) {
      if (lines[i].includes('githubStars:')) {
        const oldStars = parseInt(lines[i].match(/githubStars:\s*(\d+)/)?.[1] || '0');
        if (oldStars !== newStars) {
          lines[i] = lines[i].replace(/githubStars:\s*\d+/, `githubStars: ${newStars}`);
          starsUpdated++;
          starChanges.push({ id, old: oldStars, new: newStars, delta: newStars - oldStars });
          console.log(`    ⭐ ${id}: ${oldStars} → ${newStars} (${newStars - oldStars > 0 ? '+' : ''}${newStars - oldStars})`);
        }
        break;
      }
    }

    // Update updatedAt
    for (let i = startLine; i <= endLine; i++) {
      if (lines[i].includes('updatedAt:')) {
        const oldDate = lines[i].match(/updatedAt:\s*["']([^"']+)["']/)?.[1] || '';
        if (oldDate !== newUpdatedAt) {
          lines[i] = lines[i].replace(/updatedAt:\s*["'][^"']+["']/, `updatedAt: "${newUpdatedAt}"`);
          updatedAtUpdated++;
        }
        break;
      }
    }

    // Update forks (only if field exists)
    for (let i = startLine; i <= endLine; i++) {
      if (lines[i].includes('forks:')) {
        const oldForks = parseInt(lines[i].match(/forks:\s*(\d+)/)?.[1] || '0');
        if (oldForks !== newForks) {
          lines[i] = lines[i].replace(/forks:\s*\d+/, `forks: ${newForks}`);
          forksUpdated++;
        }
        break;
      }
    }

    // Update language (only if field exists)
    for (let i = startLine; i <= endLine; i++) {
      if (lines[i].includes('language:')) {
        const oldLang = lines[i].match(/language:\s*["']([^"']+)["']/)?.[1] || '';
        if (oldLang !== newLang) {
          lines[i] = lines[i].replace(/language:\s*["'][^"']*["']/, `language: "${newLang}"`);
          langUpdated++;
        }
        break;
      }
    }
  }

  // Write updated tools.ts
  console.log('\n💾 Writing updated tools.ts...');
  fs.writeFileSync(TOOLS_PATH, lines.join('\n'), 'utf8');

  // Discover new AI topics
  console.log('\n🔍 Discovering new AI topics...');
  const newTopics = [];
  for (const [topic, count] of allTopics) {
    if (existingTopics.has(topic)) continue;
    if (!isAITopic(topic)) continue;
    if (count < 1) continue;

    let minStars;
    if (count >= 3) minStars = 2000;
    else if (count >= 2) minStars = 3000;
    else minStars = 5000;

    newTopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description: `（自动发现）${topic.replace(/-/g, ' ')}`
    });
  }

  console.log(`   Found ${newTopics.length} new AI topics`);
  if (newTopics.length > 0) {
    topicsData.topics.push(...newTopics);
    topicsData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2) + '\n', 'utf8');
  }

  starChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  console.log('\n📊 Summary:');
  console.log(`   Repos scanned: ${repoDataMap.size}`);
  console.log(`   Stars updated: ${starsUpdated}`);
  console.log(`   UpdatedAt updated: ${updatedAtUpdated}`);
  console.log(`   Forks updated: ${forksUpdated}`);
  console.log(`   Language updated: ${langUpdated}`);
  console.log(`   New topics: ${newTopics.length}`);
  if (starChanges.length > 0) {
    console.log('   Top star changes:');
    starChanges.slice(0, 10).forEach(c => {
      console.log(`     ${c.id}: ${c.old} → ${c.new} (${c.delta > 0 ? '+' : ''}${c.delta})`);
    });
  }
  if (errors.length > 0) {
    console.log('   Errors:');
    errors.forEach(e => console.log(`     ❌ ${e}`));
  }

  // Write summary
  const summary = {
    reposScanned: repoDataMap.size,
    starsUpdated, updatedAtUpdated, forksUpdated, langUpdated,
    newTopics: newTopics.length,
    starChanges: starChanges.slice(0, 10),
    lastUpdatedOldest,
    errors,
    newTopicsList: newTopics.slice(0, 20),
    existingTopicsCount: topicsData.topics.length,
    hasChanges: starsUpdated > 0 || updatedAtUpdated > 0 || forksUpdated > 0 || langUpdated > 0 || newTopics.length > 0
  };
  fs.writeFileSync(path.resolve(__dirname, 'update-summary.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log('\n✅ Done!');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
