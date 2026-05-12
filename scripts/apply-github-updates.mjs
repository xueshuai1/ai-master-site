import fs from 'fs';
import path from 'path';

const SUMMARY_FILE = '/tmp/github-update-summary.json';
const TOOLS_FILE = path.join(process.cwd(), 'src/data/tools.ts');

const summary = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf8'));
const repoMap = {};
for (const t of summary.updatedTools) {
  repoMap[t.repo] = t;
}

let content = fs.readFileSync(TOOLS_FILE, 'utf8');

let starsUpdated = 0;
let forksUpdated = 0;
let langUpdated = 0;
let dateUpdated = 0;

// Parse tool blocks from tools.ts and update fields
// We need to be very careful to preserve the file structure

// Find all tools and their positions
const toolRegex = /(\{\s*id:\s*"[^"]+",\s*name:\s*"[^"]+",\s*category:\s*"[^"]+",)/g;
let match;
const toolPositions = [];
while ((match = toolRegex.exec(content)) !== null) {
  toolPositions.push(match.index);
}

// For each tool, find the url field, extract the repo, then update the corresponding fields
// We'll work backwards to avoid offset issues

// Parse individual tool blocks
const toolBlockRegex = /\{[\s\S]*?url:\s*"(https:\/\/github\.com\/[^"]+)"[\s\S]*?\}/g;
let blockMatch;
const replacements = [];

while ((blockMatch = toolBlockRegex.exec(content)) !== null) {
  const block = blockMatch[0];
  const url = blockMatch[1];
  const repoPath = url.replace('https://github.com/', '');
  
  const data = repoMap[repoPath];
  if (!data) continue;
  
  let modified = false;
  let newBlock = block;
  
  // Update githubStars
  const starsRegex = /githubStars:\s*(\d+)/;
  const starsMatch = starsRegex.exec(newBlock);
  if (starsMatch && parseInt(starsMatch[1]) !== data.stars) {
    newBlock = newBlock.replace(starsRegex, `githubStars: ${data.stars}`);
    starsUpdated++;
    modified = true;
  }
  
  // Update or add forks
  const forksRegex = /forks:\s*(\d+)/;
  const forksMatch = forksRegex.exec(newBlock);
  if (forksMatch && parseInt(forksMatch[1]) !== data.forks) {
    newBlock = newBlock.replace(forksRegex, `forks: ${data.forks}`);
    forksUpdated++;
    modified = true;
  } else if (!forksMatch && data.forks > 0) {
    // Add forks field before the closing brace (find a good insertion point)
    // Insert before createdAt if present, otherwise before the closing brace
    if (newBlock.includes('createdAt:')) {
      newBlock = newBlock.replace(/(\n\s*)(createdAt:)/, `$1forks: ${data.forks},$1$2`);
    } else if (newBlock.includes('language:')) {
      newBlock = newBlock.replace(/(\n\s*)(language:)/, `$1forks: ${data.forks},$1$2`);
    } else {
      // Insert before last }
      newBlock = newBlock.replace(/(\n\s*)(\})$/, `$1forks: ${data.forks},$1$2`);
    }
    forksUpdated++;
    modified = true;
  }
  
  // Update or add language
  const langRegex = /language:\s*"[^"]+"/;
  const langMatch = langRegex.exec(newBlock);
  if (langMatch) {
    if (data.language && langMatch[0] !== `language: "${data.language}"`) {
      newBlock = newBlock.replace(langRegex, `language: "${data.language}"`);
      langUpdated++;
      modified = true;
    }
  } else if (data.language && data.language !== 'None' && data.language !== 'null') {
    // Add language field
    if (newBlock.includes('createdAt:')) {
      newBlock = newBlock.replace(/(\n\s*)(createdAt:)/, `$1language: "${data.language}",$1$2`);
    } else if (newBlock.includes('forks:')) {
      newBlock = newBlock.replace(/(\n\s*)(language:)/, ``); // already checked, no language
      newBlock = newBlock.replace(/(\n\s*)(forks:.*?)(,?)(\n)/, `$1$2,$1language: "${data.language}",$4`);
    } else {
      newBlock = newBlock.replace(/(\n\s*)(\})$/, `$1language: "${data.language}",$1$2`);
    }
    langUpdated++;
    modified = true;
  }
  
  // Update updatedAt
  const updatedRegex = /updatedAt:\s*"[^"]+"/;
  const updatedMatch = updatedRegex.exec(newBlock);
  if (updatedMatch && data.pushedAt && updatedMatch[0] !== `updatedAt: "${data.pushedAt}"`) {
    newBlock = newBlock.replace(updatedRegex, `updatedAt: "${data.pushedAt}"`);
    dateUpdated++;
    modified = true;
  }
  
  if (modified) {
    replacements.push({
      start: blockMatch.index,
      end: blockMatch.index + block.length,
      oldBlock: block,
      newBlock: newBlock
    });
  }
}

// Apply replacements from end to start
replacements.sort((a, b) => b.start - a.start);
for (const r of replacements) {
  content = content.substring(0, r.start) + r.newBlock + content.substring(r.end);
}

fs.writeFileSync(TOOLS_FILE, content);

console.log(`✅ Stars updated: ${starsUpdated}`);
console.log(`✅ Forks updated: ${forksUpdated}`);
console.log(`✅ Language updated: ${langUpdated}`);
console.log(`✅ Date updated: ${dateUpdated}`);
console.log(`✅ Total replacements: ${replacements.length}`);
