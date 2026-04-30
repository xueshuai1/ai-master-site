#!/usr/bin/env node
// Apply stars/forks/language updates to tools.ts based on fetched GitHub data

const fs = require('fs');
const path = require('path');

const TOOLS_PATH = path.join(__dirname, '..', 'src', 'data', 'tools.ts');
const RESULTS_PATH = '/tmp/stars-update-results.json';
const TOPICS_PATH = path.join(__dirname, '..', 'data', 'ai-topics.json');

const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8'));
let toolsContent = fs.readFileSync(TOOLS_PATH, 'utf-8');

const resultMap = {};
for (const r of results.results) {
  if (!r.error) {
    resultMap[r.repo] = r;
  }
}

// Build a map from URL pattern to repo
// Extract each tool's URL and match against repo
const urlToRepo = {};
for (const repo of Object.keys(resultMap)) {
  const urlPattern = `github.com/${repo}`;
  urlToRepo[urlPattern] = repo;
}

let starsUpdated = 0;
let forksUpdated = 0;
let languageUpdated = 0;
let starsChanges = [];

// Parse tools.ts to find each tool block and update
// We need to be more careful about regex matching

// Find all tools with url and githubStars
// Pattern: find a tool object, extract url, match with repo, update fields

// Strategy: process the file line by line, track current tool's URL
const lines = toolsContent.split('\n');
const output = [];
let currentUrl = null;
let currentStars = null;
let currentForks = null;
let currentLanguage = null;
let currentRepo = null;
let inTool = false;
let braceDepth = 0;
let toolStartLine = -1;

function resetTool() {
  currentUrl = null;
  currentStars = null;
  currentForks = null;
  currentLanguage = null;
  currentRepo = null;
  inTool = false;
  toolStartLine = -1;
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Track tool object boundaries
  const openBraces = (line.match(/{/g) || []).length;
  const closeBraces = (line.match(/}/g) || []).length;
  
  // Detect start of a tool object (name: "...")
  const nameMatch = line.match(/^\s*name:\s*["']([^"']+)["']/);
  if (nameMatch && !inTool) {
    inTool = true;
    toolStartLine = i;
    braceDepth = openBraces - closeBraces;
    // But we need to find the url field too
  }
  
  if (inTool) {
    braceDepth += openBraces - closeBraces;
    
    // Extract URL
    const urlMatch = line.match(/url:\s*["'](https:\/\/github\.com\/[^"']+)["']/);
    if (urlMatch) {
      currentUrl = urlMatch[1];
      // Map URL to repo
      for (const [pattern, repo] of Object.entries(urlToRepo)) {
        if (currentUrl.includes(pattern)) {
          currentRepo = repo;
          break;
        }
      }
    }
    
    // Extract githubStars
    const starsMatch = line.match(/githubStars:\s*(\d+)/);
    if (starsMatch) {
      currentStars = parseInt(starsMatch[1]);
    }
    
    // Extract forks
    const forksMatch = line.match(/forks:\s*(\d+)/);
    if (forksMatch) {
      currentForks = parseInt(forksMatch[1]);
    }
    
    // Extract language
    const langMatch = line.match(/language:\s*["']([^"']+)["']/);
    if (langMatch) {
      currentLanguage = langMatch[1];
    }
    
    // End of tool object
    if (braceDepth <= 0) {
      if (currentRepo && resultMap[currentRepo]) {
        const data = resultMap[currentRepo];
        
        // Update stars if changed
        if (currentStars !== null && data.stars !== currentStars) {
          starsChanges.push({
            repo: currentRepo,
            old: currentStars,
            new: data.stars,
            delta: data.stars - currentStars
          });
          starsUpdated++;
          // Replace githubStars value
          output[output.length - 1] = output[output.length - 1].replace(
            /githubStars:\s*\d+/,
            `githubStars: ${data.stars}`
          );
        }
        
        // Update forks if changed or missing
        if (data.forks !== undefined && data.forks !== null) {
          if (currentForks !== null && data.forks !== currentForks) {
            // Update existing forks value
            output[output.length - 1] = output[output.length - 1].replace(
              /forks:\s*\d+/,
              `forks: ${data.forks}`
            );
            forksUpdated++;
          } else if (currentForks === null) {
            // Add forks field before closing brace
            const lastLine = output[output.length - 1];
            output[output.length - 1] = lastLine.replace(
              /^(\s*)\}/,
              `$1forks: ${data.forks},\n$1}`
            );
            forksUpdated++;
          }
        }
        
        // Update language if changed or missing
        if (data.language && data.language !== 'null') {
          if (currentLanguage && data.language !== currentLanguage) {
            output[output.length - 1] = output[output.length - 1].replace(
              /language:\s*["'][^"']+["']/,
              `language: "${data.language}"`
            );
            languageUpdated++;
          } else if (!currentLanguage) {
            const lastLine = output[output.length - 1];
            output[output.length - 1] = lastLine.replace(
              /^(\s*)\}/,
              `$1language: "${data.language}",\n$1}`
            );
            languageUpdated++;
          }
        }
      }
      resetTool();
    }
  }
  
  output.push(line);
}

// Print summary
console.log(`\n📊 Update Summary:`);
console.log(`   Stars updated: ${starsUpdated}`);
console.log(`   Forks updated: ${forksUpdated}`);
console.log(`   Language updated: ${languageUpdated}`);

console.log(`\n⭐ Stars changes:`);
const sorted = starsChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
for (const c of sorted.slice(0, 10)) {
  const sign = c.delta >= 0 ? '+' : '';
  console.log(`   ${c.repo}: ${c.old} → ${c.new} (${sign}${c.delta})`);
}

// Write updated content if changes were made
if (starsUpdated > 0 || forksUpdated > 0 || languageUpdated > 0) {
  const newContent = output.join('\n');
  fs.writeFileSync(TOOLS_PATH, newContent);
  console.log(`\n✅ tools.ts updated (${starsUpdated + forksUpdated + languageUpdated} fields)`);
} else {
  console.log(`\n✅ No changes needed`);
}
