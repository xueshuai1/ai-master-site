const fs = require('fs');

const results = JSON.parse(fs.readFileSync('github-fetch-results.json', 'utf8'));
let toolsContent = fs.readFileSync('src/data/tools.ts', 'utf8');
const aiTopics = JSON.parse(fs.readFileSync('data/ai-topics.json', 'utf8'));

const repoData = {};
for (const u of results.updates) {
  if (u.stars !== undefined) repoData[u.repo] = u;
}

let starsUpdated = 0;
let forksUpdated = 0;
let langUpdated = 0;
let dateUpdated = 0;
const changes = [];

for (const [repo, data] of Object.entries(repoData)) {
  const escapedUrl = `https://github.com/${repo}`;
  const urlIdx = toolsContent.indexOf(`url: "${escapedUrl}"`);
  if (urlIdx === -1) continue;
  
  // Find start of this tool block (go back to the { that starts it)
  let braceCount = 0;
  let startIdx = urlIdx;
  for (let i = urlIdx; i >= 0; i--) {
    if (toolsContent[i] === '}') braceCount++;
    if (toolsContent[i] === '{') {
      if (braceCount === 0) { startIdx = i; break; }
      braceCount--;
    }
  }
  
  // Calculate braceCount at urlIdx (how many open braces are unclosed between startIdx and urlIdx)
  let braceAtUrl = 0;
  for (let i = startIdx; i <= urlIdx; i++) {
    if (toolsContent[i] === '{') braceAtUrl++;
    if (toolsContent[i] === '}') braceAtUrl--;
  }
  
  // Find end of this tool block (the } that closes the object)
  let endIdx = urlIdx;
  for (let i = urlIdx; i < toolsContent.length; i++) {
    if (toolsContent[i] === '{') braceAtUrl++;
    if (toolsContent[i] === '}') {
      braceAtUrl--;
      if (braceAtUrl === 0) { endIdx = i; break; }
    }
  }
  
  const blockText = toolsContent.substring(startIdx, endIdx + 1);
  
  const currentStarsMatch = blockText.match(/githubStars:\s*(\d+)/);
  const currentForksMatch = blockText.match(/forks:\s*(\d+)/);
  const currentLangMatch = blockText.match(/language:\s*["']([^"']+)["']/);
  const currentUpdatedMatch = blockText.match(/updatedAt:\s*["']([^"']+)["']/);
  
  const currentStars = currentStarsMatch ? parseInt(currentStarsMatch[1]) : null;
  const currentForks = currentForksMatch ? parseInt(currentForksMatch[1]) : null;
  const currentLang = currentLangMatch ? currentLangMatch[1] : null;
  const currentUpdated = currentUpdatedMatch ? currentUpdatedMatch[1] : null;
  
  let newBlockText = blockText;
  let changed = false;
  
  // Update stars
  if (data.stars !== undefined && currentStars !== null && data.stars !== currentStars) {
    newBlockText = newBlockText.replace(
      /githubStars:\s*\d+/,
      `githubStars: ${data.stars}`
    );
    starsUpdated++;
    changes.push(`${repo}: stars ${currentStars} → ${data.stars} (${data.stars > currentStars ? '+' : ''}${data.stars - currentStars})`);
    changed = true;
  }
  
  // Update forks
  if (data.forks !== undefined) {
    if (currentForksMatch) {
      if (data.forks !== currentForks) {
        newBlockText = newBlockText.replace(/forks:\s*\d+/, `forks: ${data.forks}`);
        forksUpdated++;
        changed = true;
      }
    } else {
      newBlockText = newBlockText.replace(/(\s*createdAt:[^\n,]*,?)/, `forks: ${data.forks},\n$1`);
      forksUpdated++;
      changed = true;
    }
  }
  
  // Update language
  if (data.language) {
    if (currentLangMatch) {
      if (data.language !== currentLang) {
        newBlockText = newBlockText.replace(/language:\s*["'][^"']+["']/, `language: "${data.language}"`);
        langUpdated++;
        changed = true;
      }
    } else {
      newBlockText = newBlockText.replace(/(\s*createdAt:[^\n,]*,?)/, `language: "${data.language}",\n$1`);
      langUpdated++;
      changed = true;
    }
  }
  
  // Update updatedAt
  if (data.pushedAt && data.pushedAt !== currentUpdated) {
    if (currentUpdatedMatch) {
      newBlockText = newBlockText.replace(/updatedAt:\s*["'][^"']+["']/, `updatedAt: "${data.pushedAt}"`);
      dateUpdated++;
      changed = true;
    } else {
      newBlockText = newBlockText.replace(/(\s*createdAt:[^\n,]*,?)/, `updatedAt: "${data.pushedAt}",\n$1`);
      dateUpdated++;
      changed = true;
    }
  }
  
  if (changed) {
    toolsContent = toolsContent.substring(0, startIdx) + newBlockText + toolsContent.substring(endIdx + 1);
  }
}

fs.writeFileSync('src/data/tools.ts', toolsContent);

// Add new AI topics
const newTopics = results.newAITopics || [];
const existingTopicSet = new Set(aiTopics.topics.map(t => t.topic.toLowerCase()));
let topicsAdded = 0;
for (const nt of newTopics) {
  if (existingTopicSet.has(nt.topic.toLowerCase())) continue;
  aiTopics.topics.push(nt);
  existingTopicSet.add(nt.topic.toLowerCase());
  topicsAdded++;
}
aiTopics.lastUpdated = new Date().toISOString();
fs.writeFileSync('data/ai-topics.json', JSON.stringify(aiTopics, null, 2));

console.log(`=== Tools.ts Updates ===`);
console.log(`Stars updated: ${starsUpdated}`);
console.log(`Forks updated: ${forksUpdated}`);
console.log(`Language updated: ${langUpdated}`);
console.log(`updatedAt updated: ${dateUpdated}`);
if (changes.length > 0) {
  console.log(`\nTop star changes:`);
  changes.sort((a, b) => {
    const getNum = (s) => { const m = s.match(/[-+]?\d+/g); return m ? parseInt(m[m.length - 1]) : 0; };
    return getNum(b) - getNum(a);
  });
  changes.slice(0, 15).forEach(c => console.log(`  ${c}`));
}
console.log(`\n=== AI Topics ===`);
console.log(`New topics added: ${topicsAdded}`);
console.log(`Total topics: ${aiTopics.topics.length}`);

fs.writeFileSync('update-summary.json', JSON.stringify({
  starsUpdated, forksUpdated, langUpdated, dateUpdated,
  topicsAdded, totalTopics: aiTopics.topics.length,
  changes: changes.slice(0, 20),
  newTopics: newTopics.slice(0, 20),
  errors: results.errors || []
}, null, 2));
