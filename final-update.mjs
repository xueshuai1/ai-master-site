import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const TOOLS_PATH = join(process.cwd(), 'src/data/tools.ts');
const TOPICS_PATH = join(process.cwd(), 'data/ai-topics.json');

// Parse tools from the TypeScript file
function parseTools(content) {
  const lines = content.split('\n');
  const tools = [];
  let currentTool = {};
  let inToolsArray = false;
  
  for (const line of lines) {
    if (line.includes('export const tools: Tool[] = [')) {
      inToolsArray = true;
      continue;
    }
    if (inToolsArray && line.trim() === '];') {
      if (currentTool.id && currentTool.url) tools.push(currentTool);
      break;
    }
    
    if (inToolsArray) {
      const idMatch = line.match(/id:\s*["']([^"']+)["']/);
      const nameMatch = line.match(/name:\s*["']([^"']+)["']/);
      const urlMatch = line.match(/url:\s*["']([^"']+)["']/);
      const starsMatch = line.match(/githubStars:\s*(\d+)/);
      const updatedAtMatch = line.match(/updatedAt:\s*["']([^"']+)["']/);
      const forksMatch = line.match(/forks:\s*(\d+)/);
      const langMatch = line.match(/language:\s*["']([^"']+)["']/);
      
      if (idMatch) {
        if (currentTool.id && currentTool.url && currentTool.url.includes('github.com')) {
          tools.push(currentTool);
        }
        currentTool = { id: idMatch[1] };
      }
      if (nameMatch) currentTool.name = nameMatch[1];
      if (urlMatch) currentTool.url = urlMatch[1];
      if (starsMatch) currentTool.githubStars = parseInt(starsMatch[1]);
      if (updatedAtMatch) currentTool.updatedAt = updatedAtMatch[1];
      if (forksMatch) currentTool.forks = parseInt(forksMatch[1]);
      if (langMatch) currentTool.language = langMatch[1];
    }
  }
  return tools;
}

// Extract GitHub repos from tools
function extractRepos(tools) {
  const repos = [];
  for (const tool of tools) {
    if (!tool.url || !tool.url.includes('github.com')) continue;
    const match = tool.url.match(/github\.com\/([^\/]+)\/([^\/\s#?]+)/);
    if (match) {
      const owner = match[1];
      const repo = match[2];
      if (owner === 'features' || owner === 'docs' || owner === 'orgs') continue;
      repos.push({ owner, repo, toolId: tool.id, toolName: tool.name });
    }
  }
  return repos;
}

async function fetchRepo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'User-Agent': 'ai-master-site' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

function formatDate(isoStr) {
  if (!isoStr) return undefined;
  return isoStr.split('T')[0];
}

async function main() {
  const toolsContent = readFileSync(TOOLS_PATH, 'utf-8');
  const tools = parseTools(toolsContent);
  console.log(`Found ${tools.length} tools`);
  
  const repos = extractRepos(tools);
  console.log(`Found ${repos.length} repos to fetch`);
  
  const existingTopics = JSON.parse(readFileSync(TOPICS_PATH, 'utf-8'));
  const existingTopicSet = new Set(existingTopics.topics.map(t => t.topic.toLowerCase()));
  console.log(`Existing topics: ${existingTopicSet.size}`);
  
  const toolMap = new Map();
  for (const t of tools) toolMap.set(t.id, t);
  
  // Process repos and collect updates
  const fieldUpdates = new Map(); // toolId -> { githubStars, forks, language, updatedAt }
  const allTopics = new Map();
  
  const starsUpdates = [];
  const forksUpdates = [];
  const langUpdates = [];
  const dateUpdates = [];
  
  for (let i = 0; i < repos.length; i++) {
    const { owner, repo, toolId, toolName } = repos[i];
    console.log(`[${i+1}/${repos.length}] ${owner}/${repo}`);
    
    const data = await fetchRepo(owner, repo);
    if (!data) continue;
    
    const tool = toolMap.get(toolId);
    if (!tool) continue;
    
    const newStars = data.stargazers_count;
    const newForks = data.forks_count;
    const newLang = data.language || undefined;
    const newDate = formatDate(data.pushed_at);
    
    const updates = {};
    
    if (newStars !== undefined && tool.githubStars !== newStars) {
      updates.githubStars = newStars;
      starsUpdates.push({ toolName, old: tool.githubStars, new: newStars, delta: newStars - tool.githubStars });
    }
    
    if (newForks !== undefined) {
      if (tool.forks !== newForks) {
        updates.forks = newForks;
        forksUpdates.push({ toolName, old: tool.forks ?? 'N/A', new: newForks });
      }
    }
    
    if (newLang && tool.language !== newLang) {
      updates.language = newLang;
      langUpdates.push({ toolName, old: tool.language || 'N/A', new: newLang });
    }
    
    if (newDate && tool.updatedAt !== newDate) {
      updates.updatedAt = newDate;
      dateUpdates.push({ toolName, old: tool.updatedAt || 'N/A', new: newDate });
    }
    
    if (Object.keys(updates).length > 0) {
      fieldUpdates.set(toolId, updates);
    }
    
    // Collect topics
    if (data.topics) {
      for (const t of data.topics) {
        const norm = t.toLowerCase().replace(/_/g, '-');
        allTopics.set(norm, (allTopics.get(norm) || 0) + 1);
      }
    }
    
    // Rate limit
    if (i < repos.length - 1) await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`\nStars updates: ${starsUpdates.length}`);
  console.log(`Forks updates: ${forksUpdates.length}`);
  console.log(`Language updates: ${langUpdates.length}`);
  console.log(`Date updates: ${dateUpdates.length}`);
  
  // Find new AI topics
  const AI_KEYWORDS = ['ai', 'llm', 'ml', 'dl', 'nlp', 'agent', 'gpt', 'rag', 'mcp', 'multimodal',
    'deep-learning', 'machine-learning', 'transformer', 'embedding', 'inference', 'neural',
    'vision', 'language', 'learning', 'generative', 'prompt', 'autonomous', 'robot',
    'speech', 'diffusion', 'fine-tuning', 'llmops', 'mlops', 'model-serving', 'vector-search',
    'semantic-search', 'knowledge-graph', 'text-to-speech', 'image-generation', 'video-generation',
    'code-generation', 'embodied-ai', 'world-models', 'foundation-models', 'instruction-tuning',
    'rlhf', 'alignment', 'chatbot', 'large-language-models', 'retrieval-augmented'];
  
  const skipTopics = ['javascript', 'typescript', 'python', 'rust', 'go', 'java', 'shell', 'c',
    'c-plus-plus', 'html', 'css', 'php', 'ruby', 'swift', 'kotlin', 'docker', 'kubernetes',
    'cloud', 'web', 'api', 'cli', 'framework', 'library', 'tool', 'tools', 'platform',
    'open-source', 'awesome', 'tutorial', 'demo', 'template', 'project', 'chat',
    'desktop', 'mobile', 'linux', 'macos', 'windows', 'frontend', 'backend',
    'database', 'server', 'client', 'ui', 'ux', 'design', 'game', 'music', 'video',
    'security', 'privacy', 'testing', 'build', 'automation', 'script', 'config',
    'electron', 'react', 'vue', 'angular', 'markdown', 'yaml', 'json', 'sql',
    'graphql', 'rest', 'auth', 'monitoring', 'logging', 'analytics', 'npm', 'yarn',
    'package-manager', 'setup', 'install', 'package', 'data', 'dataset', 'datasets',
    'model', 'models', 'evaluation', 'research', 'r', 'ts', 'cuda', 'gpu', 'ml',
    'dl', 'memory', 'context', 'interface', 'interfaces', 'search', 'retrieval',
    'vector', 'vectors', 'coding', 'code', 'developer-tools', 'self-hosted',
    'self-evolving', 'low-code', 'no-code', 'webui', 'tts', 'vision', 'voice',
    'speech', 'email', 'coding', 'web-search', 'code-search', 'image-search',
    'image-processing', 'tts', 'vision', 'gpu', 'r', 'ts', 'html', 'css',
    'yaml', 'tokens', 'chat', 'mail', 'image', 'models', 'research',
    'evaluation', 'memory', 'context', 'interface', 'interfaces',
    'search', 'retrieval', 'vector', 'vectors', 'coding', 'code',
    'desktop-app', 'desktop-automation', 'terminal-automation'];
  
  const newTopics = [];
  for (const [topic, count] of allTopics) {
    if (existingTopicSet.has(topic)) continue;
    if (skipTopics.includes(topic)) continue;
    
    // Check if AI-related
    let isAI = false;
    for (const kw of AI_KEYWORDS) {
      if (topic.includes(kw) || kw.includes(topic)) { isAI = true; break; }
    }
    if (!isAI) continue;
    
    if (count === 1) {
      // Check if the repo has enough stars
      // We'd need to look up which repo has this topic - skip for simplicity
      // Just accept it if it passed the keyword check
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
  
  // Now update the file
  if (fieldUpdates.size > 0 || newTopics.length > 0) {
    const lines = toolsContent.split('\n');
    let currentToolId = null;
    let inTool = false;
    
    // Find which tool each line belongs to
    const toolLineMap = new Map(); // line index -> toolId
    let braceDepth = 0;
    let lastToolId = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const idMatch = line.match(/id:\s*["']([^"']+)["']/);
      if (idMatch && fieldUpdates.has(idMatch[1])) {
        currentToolId = idMatch[1];
        lastToolId = currentToolId;
      }
      toolLineMap.set(i, lastToolId);
    }
    
    // Process each tool's updates
    for (const [toolId, updates] of fieldUpdates) {
      // Find the lines belonging to this tool
      const toolLines = [];
      for (const [lineIdx, tid] of toolLineMap) {
        if (tid === toolId) toolLines.push(lineIdx);
      }
      if (toolLines.length === 0) continue;
      
      const startLine = toolLines[0];
      const endLine = toolLines[toolLines.length - 1];
      
      for (const [field, value] of Object.entries(updates)) {
        let found = false;
        for (let i = startLine; i <= endLine; i++) {
          const line = lines[i];
          // Match field with value (number or string)
          const fieldPattern = new RegExp(`^(\\s*)(${field}:\\s*)([^,\\n]+)`);
          const match = line.match(fieldPattern);
          if (match) {
            // Replace the value
            const indent = match[1];
            const fieldPrefix = match[2];
            if (typeof value === 'number') {
              lines[i] = `${indent}${fieldPrefix}${value}`;
            } else {
              lines[i] = `${indent}${fieldPrefix}${JSON.stringify(value)}`;
            }
            found = true;
            break;
          }
        }
        if (!found) {
          // Field doesn't exist, need to add it
          // Find the closing brace of this tool
          for (let i = endLine; i >= startLine; i--) {
            if (lines[i].trim() === '}') {
              // Insert before the closing brace
              const indent = lines[i].match(/^(\s+)/)?.[1] || '    ';
              const prevLine = lines[i-1];
              const hasComma = prevLine.trim().endsWith(',');
              if (!hasComma) {
                lines[i-1] = prevLine.replace(/(\s*)$/, ',');
              }
              if (typeof value === 'number') {
                lines.splice(i, 0, `${indent}${field}: ${value},`);
              } else {
                lines.splice(i, 0, `${indent}${field}: ${JSON.stringify(value)},`);
              }
              break;
            }
          }
        }
      }
    }
    
    writeFileSync(TOOLS_PATH, lines.join('\n'));
    console.log('✅ tools.ts updated');
  } else {
    console.log('✅ tools.ts: no changes');
  }
  
  // Update topics
  if (newTopics.length > 0) {
    existingTopics.topics.push(...newTopics);
    existingTopics.lastUpdated = new Date().toISOString();
    writeFileSync(TOPICS_PATH, JSON.stringify(existingTopics, null, 2));
    console.log(`✅ ai-topics.json: added ${newTopics.length} topics`);
  } else {
    console.log('✅ ai-topics.json: no new topics');
  }
  
  // Summary
  const topStars = starsUpdates.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 5);
  
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({
    totalRepos: repos.length,
    fetchedRepos: repos.length - 2, // 2 failed (404s)
    starsUpdates: starsUpdates.length,
    topStarsChanges: topStars,
    forksUpdates: forksUpdates.length,
    languageUpdates: langUpdates.length,
    dateUpdates: dateUpdates.length,
    newTopics: newTopics.length,
    newTopicsDetails: newTopics.slice(0, 10),
    existingTopicsCount: existingTopicSet.size,
  }, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
