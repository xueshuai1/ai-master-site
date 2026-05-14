#!/usr/bin/env node
/**
 * Batch fetch GitHub repo data and update tools.ts + ai-topics.json
 */
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
const TOOLS_PATH = path.join(__dirname, '..', 'src', 'data', 'tools.ts');
const TOPICS_PATH = path.join(__dirname, '..', 'data', 'ai-topics.json');

// AI Topic keywords for matching
const AI_KEYWORDS = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models','large-language-models',
  'retrieval-augmented','instruction-tuning','rlhf','alignment'
];

// Extract tools with GitHub URLs from tools.ts
function extractTools(content) {
  const urlRegex = /url:\s*"(https:\/\/github\.com\/[^"]+)"/g;
  const tools = [];
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[1];
    // Skip non-repo URLs like github.com/features/copilot
    const parts = url.replace('https://github.com/', '').split('/');
    if (parts.length < 2) continue;
    const owner = parts[0];
    const repo = parts[1];
    tools.push({ url, owner, repo, ownerRepo: `${owner}/${repo}` });
  }
  return tools;
}

// Fetch a single repo from GitHub API with rate limit protection
async function fetchRepo(ownerRepo) {
  const url = `https://api.github.com/repos/${ownerRepo}?access_token=${TOKEN}`;
  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ai-master-site-updater'
      }
    });
    if (resp.status === 404) return null;
    if (resp.status === 403) {
      const reset = resp.headers.get('x-ratelimit-reset');
      console.error(`Rate limited! Reset at ${new Date(Number(reset)*1000).toISOString()}`);
      // Wait for reset
      if (reset) {
        const wait = Number(reset) * 1000 - Date.now() + 1000;
        if (wait > 0 && wait < 120000) {
          console.log(`Waiting ${Math.round(wait/1000)}s for rate limit reset...`);
          await sleep(wait);
          return fetchRepo(ownerRepo);
        }
      }
      return null;
    }
    if (!resp.ok) {
      console.error(`HTTP ${resp.status} for ${ownerRepo}`);
      return null;
    }
    return await resp.json();
  } catch (e) {
    console.error(`Error fetching ${ownerRepo}: ${e.message}`);
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isAiRelated(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => t === kw || t.includes(kw) || kw.includes(t));
}

// Main
async function main() {
  const content = fs.readFileSync(TOOLS_PATH, 'utf-8');
  const tools = extractTools(content);
  
  console.log(`Found ${tools.length} GitHub repos to check`);
  
  // Load existing topics
  const topicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
  const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));
  
  // Track changes
  let starsUpdated = 0;
  let forksUpdated = 0;
  let langUpdated = 0;
  let sorted = 0;
  const changes = [];
  const allTopics = new Map(); // topic -> count of repos using it
  const allReposFetched = [];
  
  // Fetch repos sequentially with 1s delay
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const data = await fetchRepo(tool.ownerRepo);
    
    if (!data) {
      console.log(`[${i+1}/${tools.length}] ${tool.ownerRepo} → NOT FOUND`);
      await sleep(1000);
      continue;
    }
    
    allReposFetched.push({ ...tool, data });
    
    // Collect topics
    if (data.topics && Array.isArray(data.topics)) {
      for (const t of data.topics) {
        const normalized = t.toLowerCase().replace(/\s+/g, '-');
        allTopics.set(normalized, (allTopics.get(normalized) || 0) + 1);
      }
    }
    
    console.log(`[${i+1}/${tools.length}] ${tool.ownerRepo} → ${data.stargazers_count}⭐ ${data.language || ''}`);
    
    await sleep(1000); // Rate limit protection
  }
  
  // Build a map of ownerRepo → data for quick lookup
  const repoDataMap = new Map();
  for (const r of allReposFetched) {
    repoDataMap.set(r.ownerRepo, r.data);
  }
  
  // Now update tools.ts
  // Parse tool objects from the file content
  // We'll do regex-based extraction and update
  
  let newContent = content;
  let toolsToUpdate = [];
  
  // Extract each tool block with its current githubStars
  const toolIdRegex = /id:\s*"[^"]+"/g;
  const ids = [];
  let idMatch;
  while ((idMatch = toolIdRegex.exec(content)) !== null) {
    ids.push(idMatch[0]);
  }
  
  // For each tool, find the url and update githubStars/forks/language
  for (const tool of tools) {
    const data = repoDataMap.get(tool.ownerRepo);
    if (!data) continue;
    
    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLang = data.language;
    const newPushedAt = data.pushed_at ? new Date(data.pushed_at).toISOString().slice(0, 10) : undefined;
    
    // We'll track what needs updating and do it with a smarter approach
    toolsToUpdate.push({
      tool,
      data,
      newStars,
      newForks,
      newLang,
      newPushedAt
    });
  }
  
  // Use a Node.js approach: parse the TypeScript, update fields, rewrite
  // Since the file is TypeScript, let's do careful regex replacement
  
  let starsChanged = 0;
  let forksChanged = 0;
  let langChanged = 0;
  let updatedAtChanged = 0;
  const starChanges = [];
  const lastUpdatedInfo = [];
  
  for (const item of toolsToUpdate) {
    const { tool, data, newStars, newForks, newLang, newPushedAt } = item;
    const escapedUrl = tool.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Find githubStars in the tool block after this url
    // Pattern: url: "...", ... githubStars: NUMBER
    // We need to find the tool block that contains this url and update its fields
    
    // Find the section of the file for this tool
    // Strategy: find the url line, then look for githubStars after it until the next tool
    const urlIdx = newContent.indexOf(tool.url);
    if (urlIdx === -1) continue;
    
    // Find the end of this tool (next `id:` or end of array)
    const afterUrl = newContent.slice(urlIdx);
    const nextToolIdx = afterUrl.indexOf('\n    id:', 1); // skip current id
    const toolBlockEnd = nextToolIdx === -1 ? afterUrl.length : nextToolIdx;
    const toolBlock = afterUrl.slice(0, toolBlockEnd);
    
    // Check current githubStars
    const currentStarsMatch = toolBlock.match(/githubStars:\s*(\d+)/);
    const currentStars = currentStarsMatch ? parseInt(currentStarsMatch[1]) : 0;
    
    // Update githubStars
    if (currentStars !== newStars) {
      newContent = newContent.replace(
        new RegExp(`(url:\\s*"${escapedUrl}"[\\s\\S]*?githubStars:\\s*)\\d+`),
        `$1${newStars}`
      );
      starsChanged++;
      starChanges.push({ id: tool.tool?.id || tool.ownerRepo, old: currentStars, new: newStars, delta: newStars - currentStars });
    }
    
    // Update forks
    const currentForksMatch = toolBlock.match(/forks:\s*(\d+)/);
    const currentForks = currentForksMatch ? parseInt(currentForksMatch[1]) : undefined;
    if (currentForks === undefined || currentForks !== newForks) {
      if (currentForksMatch) {
        newContent = newContent.replace(
          new RegExp(`(url:\\s*"${escapedUrl}"[\\s\\S]*?forks:\\s*)\\d+`),
          `$1${newForks}`
        );
      } else {
        // Insert forks after githubStars
        newContent = newContent.replace(
          new RegExp(`(url:\\s*"${escapedUrl}"[\\s\\S]*?githubStars:\\s*\\d+)`),
          `$1,\n    forks: ${newForks}`
        );
      }
      forksChanged++;
    }
    
    // Update language
    const currentLangMatch = toolBlock.match(/language:\s*"([^"]*)"/);
    const currentLang = currentLangMatch ? currentLangMatch[1] : undefined;
    if (newLang && currentLang !== newLang) {
      if (currentLangMatch) {
        newContent = newContent.replace(
          new RegExp(`(url:\\s*"${escapedUrl}"[\\s\\S]*?language:\\s*)"([^"]*)"`),
          `$1"${newLang}"`
        );
      } else {
        // Insert after forks or githubStars
        newContent = newContent.replace(
          new RegExp(`(url:\\s*"${escapedUrl}"[\\s\\S]*?forks:\\s*\\d+)`),
          `$1,\n    language: "${newLang}"`
        );
      }
      langChanged++;
    }
    
    // Track last updated info
    if (newPushedAt) {
      const daysAgo = Math.round((Date.now() - new Date(data.pushed_at).getTime()) / 86400000);
      lastUpdatedInfo.push({ id: tool.ownerRepo, pushedAt: newPushedAt, daysAgo });
    }
  }
  
  // Sort within each category by stars (descending)
  // Extract category blocks and sort
  // This is complex with regex, let's do a simpler approach: just rewrite the whole file
  
  // For now, write the updated content
  if (starsChanged > 0 || forksChanged > 0 || langChanged > 0) {
    fs.writeFileSync(TOOLS_PATH, newContent, 'utf-8');
    console.log(`\nUpdated: ${starsChanged} stars, ${forksChanged} forks, ${langChanged} languages`);
  } else {
    console.log('\nNo changes needed in tools.ts');
  }
  
  // Topic analysis
  const newAiTopics = [];
  for (const [topic, count] of allTopics.entries()) {
    if (existingTopics.has(topic)) continue;
    if (!isAiRelated(topic)) continue;
    // Skip if only 1 repo and stars < 1000
    if (count === 1) {
      // Check the max stars of repos using this topic
      const maxStars = Math.max(...allReposFetched
        .filter(r => r.data.topics && r.data.topics.map(t => t.toLowerCase().replace(/\s+/g, '-')).includes(topic))
        .map(r => r.data.stargazers_count));
      if (maxStars < 1000) continue;
    }
    
    let minStars = 5000;
    if (count >= 3) minStars = 2000;
    else if (count >= 2) minStars = 3000;
    
    newAiTopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description: `（自动发现）${topic.replace(/-/g, ' ')}`
    });
  }
  
  if (newAiTopics.length > 0) {
    topicsData.topics.push(...newAiTopics);
    topicsData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2), 'utf-8');
    console.log(`Added ${newAiTopics.length} new AI topics`);
    for (const t of newAiTopics) {
      console.log(`  - ${t.topic} (${allTopics.get(t.topic)} repos)`);
    }
  } else {
    console.log('No new AI topics found');
  }
  
  // Output summary for the message
  console.log('\n=== SUMMARY ===');
  console.log(`Repos scanned: ${allReposFetched.length}`);
  console.log(`Stars updated: ${starsChanged}`);
  console.log(`Forks updated: ${forksChanged}`);
  console.log(`Languages updated: ${langChanged}`);
  console.log(`New topics: ${newAiTopics.length}`);
  
  // Top star changes
  const sortedChanges = starChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  console.log('\nTop star changes:');
  for (const c of sortedChanges.slice(0, 10)) {
    console.log(`  ${c.id}: ${c.old} → ${c.new} (${c.delta > 0 ? '+' : ''}${c.delta})`);
  }
  
  // Last updated
  if (lastUpdatedInfo.length > 0) {
    const oldest = lastUpdatedInfo.sort((a, b) => b.daysAgo - a.daysAgo)[0];
    console.log(`\nLast updated longest ago: ${oldest.id} (${oldest.pushedAt}, ${oldest.daysAgo} days)`);
  }
  
  // Write summary to temp file for the reporting step
  const summary = {
    reposScanned: allReposFetched.length,
    starsUpdated: starsChanged,
    forksUpdated: forksChanged,
    langUpdated: langChanged,
    newTopics: newAiTopics.length,
    newTopicList: newAiTopics.map(t => ({ ...t, repoCount: allTopics.get(t.topic) })),
    topStarChanges: sortedChanges.slice(0, 5),
    oldestUpdate: lastUpdatedInfo.length > 0 ? lastUpdatedInfo.sort((a, b) => b.daysAgo - a.daysAgo)[0] : null,
    topicsTotal: topicsData.topics.length,
    totalTopicsBefore: topicsData.topics.length - newAiTopics.length
  };
  
  fs.writeFileSync('/tmp/github-update-summary.json', JSON.stringify(summary, null, 2));
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
