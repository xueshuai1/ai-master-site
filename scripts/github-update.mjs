#!/usr/bin/env node
/**
 * GitHub Stars Update + Topic Discovery Script (ESM version)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const TOOLS_PATH = path.join(process.cwd(), 'src', 'data', 'tools.ts');
const TOPICS_PATH = path.join(process.cwd(), 'data', 'ai-topics.json');
const ENV_PATH = path.join(process.cwd(), '.env.local');

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
  existingTopicsData.topics.map(t => t.topic.toLowerCase())
);

// Parse tool entries
const lines = toolsContent.split('\n');
const entries = [];
let currentId = null;
let currentRepo = null;
let currentStars = null;
let currentForks = null;
let currentLang = null;

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

  if (trimmed === '{' && !inToolObject && braceDepth === 0) {
    inToolObject = true;
    braceDepth = 1;
    continue;
  }

  if (inToolObject) {
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }

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

    if (braceDepth <= 0) {
      flushEntry();
      inToolObject = false;
      braceDepth = 0;
    }
  }
}

// Deduplicate by repo
const uniqueRepos = new Map();
for (const e of entries) {
  if (!uniqueRepos.has(e.repo)) {
    uniqueRepos.set(e.repo, e);
  }
}

const repoList = Array.from(uniqueRepos.values());
console.log(`Found ${repoList.length} unique GitHub repos`);

// Fetch GitHub API
async function fetchRepo(repo) {
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
      topics: data.topics || [],
    };
  } catch (e) {
    return { stars: 0, forks: 0, language: null, pushedAt: null, topics: [], error: e.message };
  }
}

async function main() {
  const repoResults = new Map();
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

  // Build changes for tools.ts
  let newContent = toolsContent;
  let starsUpdated = 0;
  let forksUpdated = 0;
  let langUpdated = 0;
  const starChanges = [];

  for (const entry of repoList) {
    const info = repoResults.get(entry.repo);
    if (!info || info.error) continue;

    if (entry.oldStars !== null && info.stars !== entry.oldStars) {
      const searchStr = `githubStars: ${entry.oldStars}`;
      if (newContent.includes(searchStr)) {
        newContent = newContent.replace(searchStr, `githubStars: ${info.stars}`);
        starsUpdated++;
        starChanges.push({ tool: entry.id, old: entry.oldStars, new: info.stars, delta: info.stars - entry.oldStars });
      }
    }

    if (entry.oldForks !== null && info.forks !== entry.oldForks) {
      const re = new RegExp(`forks:\\s*${entry.oldForks}\\b`, 'g');
      const matches = newContent.match(re);
      if (matches && matches.length === 1) {
        newContent = newContent.replace(re, `forks: ${info.forks}`);
        forksUpdated++;
      }
    }

    if (entry.oldLanguage && info.language && info.language !== entry.oldLanguage) {
      const escaped = entry.oldLanguage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`language:\\s*"${escaped}"`, 'g');
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

  // Topic Discovery
  const allTopics = new Map();
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

  const newAITopics = [];
  for (const [topic, data] of allTopics) {
    if (existingTopicNames.has(topic)) continue;

    const isAI = AI_KEYWORDS.some(kw =>
      topic === kw || topic.includes(kw) || kw.includes(topic)
    );
    if (!isAI) continue;

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

  // Write summary
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
    path.join(process.cwd(), '.github-update-result.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(console.error);
