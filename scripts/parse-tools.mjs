import fs from 'fs';

const content = fs.readFileSync('src/data/tools.ts', 'utf-8');

// Parse by tracking brace depth - find tool objects within the tools array
const tools = [];
let depth = 0;
let currentToolStart = -1;
let toolLines = [];

const allLines = content.split('\n');

for (let i = 0; i < allLines.length; i++) {
  const line = allLines[i];
  
  for (const ch of line) {
    if (ch === '{') {
      if (depth === 1) {
        // This is a tool object start
        currentToolStart = i;
        toolLines = [line];
      }
      depth++;
    }
    if (ch === '}') {
      depth--;
      if (depth === 2 && currentToolStart >= 0) {
        // We were inside a tool object (depth 2 is inside the { that opened at depth 1)
        // Actually depth 2 means we're inside tools[{...}]
        // When depth goes from 2 to 1, we closed a tool object
      }
      if (depth === 1 && currentToolStart >= 0) {
        // Just closed a tool object
        toolLines.push(line);
        const block = toolLines.join('\n');
        
        const id = block.match(/id:\s*["']([^"']+)["']/)?.[1];
        const name = block.match(/name:\s*["']([^"']+)["']/)?.[1];
        const url = block.match(/url:\s*["'](https:\/\/github\.com\/[^"']+)["']/)?.[1];
        const stars = block.match(/githubStars:\s*(\d+)/)?.[1];
        const updatedAt = block.match(/updatedAt:\s*["']([^"']+)["']/)?.[1];
        const forks = block.match(/forks:\s*(\d+)/)?.[1];
        const language = block.match(/language:\s*["']([^"']+)["']/)?.[1];
        
        if (id && url && stars) {
          tools.push({
            id,
            name,
            repo: url.replace('https://github.com/', ''),
            githubStars: parseInt(stars),
            updatedAt: updatedAt || null,
            forks: forks ? parseInt(forks) : null,
            language: language || null
          });
        }
        
        currentToolStart = -1;
        toolLines = [];
      } else {
        if (currentToolStart >= 0) {
          toolLines.push(line);
        }
      }
    }
  }
  
  if (currentToolStart >= 0 && !line.includes('{') && !line.includes('}')) {
    toolLines.push(line);
  }
}

console.log(`Found ${tools.length} GitHub repos`);
fs.writeFileSync('/tmp/github-repos-list.json', JSON.stringify(tools, null, 2));
tools.slice(0, 3).forEach(t => console.log(`  ${t.id} (${t.repo}) - ${t.githubStars} stars`));
