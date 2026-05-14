#!/usr/bin/env node
/**
 * GitHub Stars Update + Topic Discovery Script
 * Fetches live data from GitHub API for all tools in tools.ts,
 * updates stars/forks/language/updatedAt, and discovers new AI topics.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const TOOLS_PATH = path.join(__dirname, '..', 'src', 'data', 'tools.ts');
const TOPICS_PATH = path.join(__dirname, '..', 'data', 'ai-topics.json');
const ENV_PATH = path.join(__dirname, '..', '.env.local');

const GITHUB_TOKEN = execSync(
  `grep GITHUB_TOKEN "${ENV_PATH}" | cut -d= -f2 | tr -d '"' | tr -d "'"`
).toString().trim();

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

// Read files
const toolsContent = fs.readFileSync(TOOLS_PATH, 'utf-8');
const existingTopicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
const existingTopicNames = new Set(
  existingTopicsData.topics.map((t: any) => t.topic.toLowerCase())
);

// Extract tool entries with their GitHub repos and current values
interface ToolEntry {
  id: string;
  repo: string;
  oldStars: number | null;
  oldForks: number | null;
  oldLanguage: string | null;
}

// Parse: find each tool object, extract id, url (github), githubStars, forks, language
// Use line-by-line approach for reliability
const lines = toolsContent.split('\n');
const entries: ToolEntry[] = [];
let currentId: string | null = null;
let currentRepo: string | null = null;
let currentStars: number | null = null;
let currentForks: number | null = null;
let currentLang: string | null = null;

function flushEntry() {
  if (currentId && currentRepo) {
    entries.push({
      id: currentId,
      repo: currentRepo,
      oldStars: currentStars,
      oldForks: currentForks,
      oldLanguage: currentLang,
    });
  }
  currentId = null;
  currentRepo = null;
  currentStars = null;
  currentForks = null;
  currentLang = null;
}

let inToolObject = false;
let braceDepth = 0;

for (const line of lines) {
  const trimmed = line.trim();

  // Detect start of a tool object: { inside the tools array
  if (trimmed === '{' && !inToolObject && braceDepth === 0) {
    inToolObject = true;
    braceDepth = 1;
    continue;
  }

  if (inToolObject) {
    // Count braces
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }

    // Extract fields
    const idMatch = trimmed.match(/^id:\s*"([^"]+)"/);
    if (idMatch) currentId = idMatch[1];

    const urlMatch = trimmed.match(/^url:\s*"https:\/\/github\.com\/([^"]+)"/);
    if (urlMatch) currentRepo = urlMatch[1].replace(/\/$/, '');

    const starsMatch = trimmed.match(/^githubStars:\s*(\d+)/);
    if (starsMatch) currentStars = parseInt(starsMatch[1]);

    const forksMatch = trimmed.match(/^forks:\s*(\d+)/);
    if (forksMatch) currentForks = parseInt(forksMatch[1]);

    const langMatch = trimmed.match(/^language:\s*"([^"]+)"/);
    if (langMatch) currentLang = langMatch[1];

    // End of tool object
    if (braceDepth <= 0) {
      flushEntry();
      inToolObject = false;
      braceDepth = 0;
    }
  }
}

// Deduplicate by repo
const uniqueRepos = new Map<string, ToolEntry>();
for (const e of entries) {
  if (!uniqueRepos.has(e.repo)) {
    uniqueRepos.set(e.repo, e);
  }
}

const repoList = Array.from(uniqueRepos.values());
console.log(`Found ${repoList.length} unique GitHub repos`);

// Fetch GitHub API
interface RepoInfo {
  stars: number;
  forks: number;
  language: string | null;
  pushedAt: string | null;
  topics: string[];
  error?: string;
}

async function fetchRepo(repo: string): Promise<RepoInfo> {
  const url = `https://api.github.com/repos/${repo}?access_token=${GITHUB_TOKEN}`;
  try {
    const resp = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'User-Agent': 'ai-master-site',
      },
    });
    if (!resp.ok) {
      if (resp.status === 404) return { stars: 0, forks: 0, language: null, pushedAt: null, topics: [], error: '404' };
      if (resp.status === 403) return { stars: 0, forks: 0, language: null, pushedAt: null, topics: [], error: `403` };
      return { stars: 0, forks: 0, language: null, pushedAt: null, topics: [], error: `${resp.status}` };
    }
    const data = await resp.json();
    return {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      language: data.language || null,
      pushedAt: data.pushed_at ? new Date(data.pushed_at).toISOString().split('T')[0] : null,
      topics: (data.topics || []) as string[],
    };
  } catch (e: any) {
    return { stars: 0, forks: 0, language: null, pushedAt: null, topics: [], error: e.message };
  }
}

const repoResults = new Map<string, RepoInfo>();
let successCount = 0;
let errorCount = 0;

for (let i = 0; i < repoList.length; i++) {
  const entry = repoList[i];
  if (i > 0) await new Promise(r => setTimeout(r, 1000));

  const result = await fetchRepo(entry.repo);
  repoResults.set(entry.repo, result);

  if (result.error) {
    errorCount++;
    console.log(`  ❌ ${entry.repo}: ${result.error}`);
  } else {
    successCount++;
    const delta = entry.oldStars !== null ? result.stars - entry.oldStars : 0;
    const changed = entry.oldStars !== null && result.stars !== entry.oldStars;
    console.log(`  ✅ ${entry.repo}: ${result.stars} stars${changed ? ` (${delta > 0 ? '+' : ''}${delta})` : ''}`);
  }
}

// ─── Build changes for tools.ts ──────────────────────────
// We'll use exact string replacement - each pattern should be unique
let newContent = toolsContent;
let starsUpdated = 0;
let forksUpdated = 0;
let langUpdated = 0;

const starChanges: { tool: string; old: number; new: number; delta: number }[] = [];

for (const entry of repoList) {
  const info = repoResults.get(entry.repo);
  if (!info || info.error) continue;

  // Update githubStars
  if (entry.oldStars !== null && info.stars !== entry.oldStars) {
    const searchStr = `githubStars: ${entry.oldStars}`;
    if (newContent.includes(searchStr)) {
      newContent = newContent.replace(searchStr, `githubStars: ${info.stars}`);
      starsUpdated++;
      starChanges.push({ tool: entry.id, old: entry.oldStars, new: info.stars, delta: info.stars - entry.oldStars });
    }
  }

  // Update forks (only if field exists and value changed)
  if (entry.oldForks !== null && info.forks !== entry.oldForks) {
    const searchStr = `forks: ${entry.oldForks}`;
    // Only replace if it appears exactly once in the file
    const re = new RegExp(`forks:\\s*${entry.oldForks}\\b`, 'g');
    const matches = newContent.match(re);
    if (matches && matches.length === 1) {
      newContent = newContent.replace(re, `forks: ${info.forks}`);
      forksUpdated++;
    }
  }

  // Update language (only if field exists and value changed)
  if (entry.oldLanguage && info.language && info.language !== entry.oldLanguage) {
    const searchStr = `language: "${entry.oldLanguage}"`;
    const re = new RegExp(`language:\\s*"${entry.oldLanguage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
    const matches = newContent.match(re);
    if (matches && matches.length === 1) {
      newContent = newContent.replace(re, `language: "${info.language}"`);
      langUpdated++;
    }
  }
}

if (newContent !== toolsContent) {
  fs.writeFileSync(TOOLS_PATH, newContent);
  console.log(`\nUpdated tools.ts: ${starsUpdated} stars, ${forksUpdated} forks, ${langUpdated} languages`);
} else {
  console.log('\nNo changes needed in tools.ts');
}

// ─── Topic Discovery ────────────────────────────────────
const allTopics = new Map<string, { count: number; repos: string[] }>();
for (const [repo, info] of repoResults) {
  if (info.error || !info.topics.length) continue;
  for (const topic of info.topics) {
    const normalized = topic.toLowerCase().replace(/\s+/g, '-');
    const existing = allTopics.get(normalized) || { count: 0, repos: [] };
    existing.count++;
    existing.repos.push(repo);
    allTopics.set(normalized, existing);
  }
}

const newAITopics: { topic: string; url: string; minStars: number; description: string; count: number }[] = [];

for (const [topic, data] of allTopics) {
  if (existingTopicNames.has(topic)) continue;

  const isAI = AI_KEYWORDS.some(kw =>
    topic === kw || topic.includes(kw) || kw.includes(topic)
  );
  if (!isAI) continue;

  // Skip too niche
  if (data.count === 1) {
    const repoInfo = repoResults.get(data.repos[0]);
    if (repoInfo && repoInfo.stars < 1000) continue;
  }

  let minStars = 5000;
  if (data.count >= 3) minStars = 2000;
  else if (data.count >= 2) minStars = 3000;

  newAITopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${topic.replace(/-/g, ' ')}`,
    count: data.count,
  });
}

newAITopics.sort((a, b) => b.count - a.count);

if (newAITopics.length > 0) {
  for (const nt of newAITopics) {
    existingTopicsData.topics.push({
      topic: nt.topic,
      url: nt.url,
      minStars: nt.minStars,
      description: nt.description,
    });
  }
  existingTopicsData.lastUpdated = new Date().toISOString();
  fs.writeFileSync(TOPICS_PATH, JSON.stringify(existingTopicsData, null, 2) + '\n');
  console.log(`Added ${newAITopics.length} new topics to ai-topics.json`);
} else {
  console.log('No new AI topics found');
}

// ─── Write summary ──────────────────────────────────────
const summary = {
  totalRepos: repoResults.size,
  successCount,
  errorCount,
  starsUpdated,
  forksUpdated,
  langUpdated,
  newTopicsFound: newAITopics.length,
  newTopics: newAITopics,
  starChanges: starChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 10),
  filesModified: newContent !== toolsContent || newAITopics.length > 0,
};

fs.writeFileSync(
  path.join(__dirname, '..', '.github-update-result.json'),
  JSON.stringify(summary, null, 2)
);

console.log('\n=== SUMMARY ===');
console.log(JSON.stringify(summary, null, 2));
