#!/usr/bin/env node
/**
 * 按 GitHub Topics 发现优秀 AI 项目
 * 
 * 策略：
 * 1. 读取 data/ai-topics.json 中的 topics 列表
 * 2. 对每个 topic，用 GitHub API 搜索 stars > minStars 的项目
 * 3. 对比 src/data/tools.ts 已有项目，发现遗漏
 * 4. 输出遗漏项目列表，按 stars 排序
 * 
 * 运行：node scripts/discover-topic-projects.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load .env.local for GITHUB_TOKEN
const envPath = path.join(ROOT, '.env.local');
let GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GITHUB_TOKEN=(.+)/);
  if (match) GITHUB_TOKEN = match[1].trim();
} catch {}
const HAS_TOKEN = GITHUB_TOKEN.startsWith('ghp_') || GITHUB_TOKEN.startsWith('gho_');
const REQUEST_DELAY = HAS_TOKEN ? 200 : 1500;

const TOOLS_FILE = path.join(ROOT, 'src/data/tools.ts');
const TOPICS_FILE = path.join(ROOT, 'data/ai-topics.json');

// 提取 tools.ts 中已有的 GitHub 仓库
function extractExistingRepos() {
  const content = fs.readFileSync(TOOLS_FILE, 'utf8');
  const urlRegex = /url:\s*"https:\/\/github\.com\/([^/"]+)\/([^/"]+)"/g;
  const repos = new Set();
  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    repos.add(`${m[1].toLowerCase()}/${m[2].toLowerCase()}`);
  }
  return repos;
}

// GitHub API 搜索
function searchGitHub(query, minStars, perPage = 30) {
  return new Promise((resolve) => {
    const headers = {
      'User-Agent': 'ai-master-site',
      'Accept': 'application/vnd.github.v3+json'
    };
    if (HAS_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    const q = encodeURIComponent(`${query} stars:>${minStars}`);
    const options = {
      hostname: 'api.github.com',
      path: `/search/repositories?q=${q}&sort=stars&order=desc&per_page=${perPage}`,
      headers,
      timeout: 15000
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const j = JSON.parse(data);
            resolve({
              success: true,
              totalCount: j.total_count || 0,
              items: (j.items || []).map(item => ({
                fullName: item.full_name.toLowerCase(),
                name: item.name,
                owner: item.owner.login,
                stars: item.stargazers_count,
                forks: item.forks_count,
                language: item.language,
                description: item.description || '',
                topics: item.topics || [],
                url: item.html_url,
                createdAt: item.created_at,
                updatedAt: item.updated_at
              }))
            });
          } catch {
            resolve({ success: false, error: 'parse', totalCount: 0, items: [] });
          }
        } else if (res.statusCode === 403 || res.statusCode === 429) {
          resolve({ success: false, error: 'rate_limited', totalCount: 0, items: [] });
        } else {
          resolve({ success: false, error: `http_${res.statusCode}`, totalCount: 0, items: [] });
        }
      });
    }).on('error', () => resolve({ success: false, error: 'network', totalCount: 0, items: [] }))
      .on('timeout', () => resolve({ success: false, error: 'timeout', totalCount: 0, items: [] }));
  });
}

async function main() {
  console.error('🔍 开始按 Topics 发现优秀 AI 项目...\n');
  
  // 读取 topics 库
  const topicsData = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
  const topics = topicsData.topics;
  const globalMinStars = topicsData.minStarsThreshold || 5000;
  
  // 读取已有项目
  const existingRepos = extractExistingRepos();
  console.error(`📦 已有 ${existingRepos.size} 个 GitHub 项目在 tools.ts 中\n`);
  
  const missingProjects = [];
  const topicStats = [];
  let rateLimited = false;
  
  for (let i = 0; i < topics.length; i++) {
    if (rateLimited) {
      console.error(`\n⏸️  触发限流，跳过剩余 ${topics.length - i} 个 topics`);
      break;
    }
    
    const topic = topics[i];
    const minStars = Math.max(topic.minStars || globalMinStars, globalMinStars);
    
    console.error(`[${i + 1}/${topics.length}] 🔎 ${topic.topic} (minStars: ${minStars.toLocaleString()})`);
    
    const result = await searchGitHub(`topic:${topic.topic}`, minStars, 30);
    
    if (result.success) {
      console.error(`   ✅ 找到 ${result.totalCount} 个项目，扫描前 30 个`);
      
      let foundMissing = 0;
      for (const item of result.items) {
        if (!existingRepos.has(item.fullName)) {
          missingProjects.push({
            ...item,
            topic: topic.topic,
            topicDescription: topic.description
          });
          foundMissing++;
        }
      }
      console.error(`   🆕 遗漏项目：${foundMissing} 个`);
      
      topicStats.push({
        topic: topic.topic,
        total: result.totalCount,
        scanned: result.items.length,
        missing: foundMissing
      });
    } else {
      console.error(`   ❌ ${result.error}`);
      if (result.error === 'rate_limited') {
        rateLimited = true;
      }
    }
    
    if (i < topics.length - 1 && !rateLimited) {
      await new Promise(r => setTimeout(r, REQUEST_DELAY));
    }
  }
  
  // 去重（同一个项目可能出现在多个 topic）
  const uniqueMissing = [];
  const seen = new Set();
  for (const project of missingProjects) {
    if (!seen.has(project.fullName)) {
      seen.add(project.fullName);
      uniqueMissing.push(project);
    } else {
      // 更新已有项目的 topics
      const existing = uniqueMissing.find(p => p.fullName === project.fullName);
      if (existing && !existing.topics.includes(project.topic)) {
        existing.topics.push(project.topic);
      }
    }
  }
  
  // 按 stars 排序
  uniqueMissing.sort((a, b) => b.stars - a.stars);
  
  // 输出报告
  console.error(`\n${'='.repeat(60)}`);
  console.error(`📊 发现报告`);
  console.error(`${'='.repeat(60)}`);
  console.error(`\n📦 已有项目：${existingRepos.size} 个`);
  console.error(`🔍 扫描 topics：${topicStats.length} 个`);
  console.error(`🆕 遗漏项目：${uniqueMissing.length} 个（stars > ${globalMinStars.toLocaleString()}）\n`);
  
  // Top 遗漏项目（按 stars）
  console.error(`🌟 Top 遗漏项目（前 30）：`);
  console.error(`${'─'.repeat(60)}`);
  
  for (let i = 0; i < Math.min(30, uniqueMissing.length); i++) {
    const p = uniqueMissing[i];
    const starsStr = p.stars.toLocaleString();
    const topicsStr = Array.isArray(p.topics) ? p.topics.slice(0, 3).join(', ') : p.topic;
    console.error(`  ${i + 1}. ${p.fullName}`);
    console.error(`     ⭐ ${starsStr} | 🍴 ${p.forks.toLocaleString()} | 🏷️ ${topicsStr}`);
    if (p.description) {
      console.error(`     📝 ${p.description.slice(0, 80)}${p.description.length > 80 ? '...' : ''}`);
    }
    console.error();
  }
  
  // 保存遗漏项目列表
  const report = {
    generatedAt: new Date().toISOString(),
    existingCount: existingRepos.size,
    scannedTopics: topicStats.length,
    missingCount: uniqueMissing.length,
    minStarsThreshold: globalMinStars,
    missingProjects: uniqueMissing.slice(0, 100).map(p => ({
      fullName: p.fullName,
      name: p.name,
      stars: p.stars,
      forks: p.forks,
      language: p.language,
      description: p.description,
      topics: Array.isArray(p.topics) ? p.topics : [p.topic],
      url: p.url,
      createdAt: p.createdAt,
      suggestedCategory: suggestCategory(p.topics)
    })),
    topicStats
  };
  
  const reportPath = path.join(ROOT, 'data/missing-projects-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.error(`\n💾 详细报告已保存到 ${reportPath}`);
}

// 根据 topics 建议分类
function suggestCategory(topics) {
  if (!topics || topics.length === 0) return 'other';
  
  const categoryMap = {
    'llm': 'llm',
    'large-language-models': 'llm',
    'ai-agent': 'agent',
    'ai-chatbot': 'agent',
    'chatbot': 'agent',
    'langchain': 'framework',
    'llm-framework': 'framework',
    'ai-tooling': 'framework',
    'mcp': 'plugin',
    'model-context-protocol': 'plugin',
    'vector-database': 'data',
    'knowledge-graph': 'data',
    'computer-vision': 'multimodal',
    'multimodal': 'multimodal',
    'text-to-image': 'multimodal',
    'text-to-video': 'multimodal',
    'stable-diffusion': 'multimodal',
    'diffusion-models': 'multimodal',
    'vision-language-model': 'multimodal',
    'speech-recognition': 'multimodal',
    'text-to-speech': 'multimodal',
    'ai-search': 'search',
    'ai-safety': 'security',
    'alignment': 'security',
    'edge-ai': 'devops',
    'llmops': 'devops',
    'fine-tuning': 'education',
    'prompt-engineering': 'education'
  };
  
  for (const topic of topics) {
    if (categoryMap[topic]) return categoryMap[topic];
  }
  
  return 'llm'; // 默认
}

main().catch(e => { console.error(e); process.exit(1); });
