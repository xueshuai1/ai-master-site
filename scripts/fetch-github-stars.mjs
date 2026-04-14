#!/usr/bin/env node
/**
 * 批量获取 GitHub 仓库 star 数
 * 输出到 src/data/github-stars.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 从 tools.ts 提取所有 GitHub 仓库信息
function extractGithubRepos() {
  const toolsPath = join(__dirname, '..', 'src', 'data', 'tools.ts');
  const content = readFileSync(toolsPath, 'utf-8');

  // 匹配 id + url 组合
  const regex = /id:\s*"([^"]+)"[^}]*?url:\s*"([^"]+)"/gs;
  const repos = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    const url = match[2];
    if (url.includes('github.com')) {
      // 提取 owner/repo
      const urlMatch = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
      if (urlMatch) {
        repos.push({
          id,
          owner: urlMatch[1],
          repo: urlMatch[2],
          url,
        });
      }
    }
  }

  return repos;
}

// GitHub GraphQL 查询（批量查询）
async function fetchStarsBatch(repos, token) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `bearer ${token}`;
  }

  // 构建 GraphQL 查询，批量查询所有仓库
  const queryParts = repos.map((r, i) => {
    return `repo_${i}: repository(owner: "${r.owner}", name: "${r.repo}") {
      stargazerCount
      forkCount
      updatedAt
      primaryLanguage { name }
    }`;
  });

  const query = `query { ${queryParts.join('\n')} }`;

  const resp = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error(`GraphQL API error: ${resp.status} ${text}`);
    return null;
  }

  return resp.json();
}

// REST API fallback（单个查询，用于没有 token 时）
async function fetchStarREST(owner, repo) {
  const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!resp.ok) {
    if (resp.status === 403) {
      // Rate limited
      return null;
    }
    return null;
  }
  const data = await resp.json();
  return {
    stargazerCount: data.stargazers_count,
    forkCount: data.forks_count,
    updatedAt: data.updated_at,
    primaryLanguage: data.language,
  };
}

async function main() {
  const repos = extractGithubRepos();
  console.log(`Found ${repos.length} GitHub repos to check`);

  const token = process.env.GITHUB_TOKEN;
  const starData = {};
  const errors = [];

  if (token) {
    console.log('Using GitHub GraphQL API (batch query)');
    // 分批查询，每批 25 个（GraphQL 限制）
    const batchSize = 25;
    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize);
      console.log(`Fetching batch ${Math.floor(i / batchSize) + 1} (${batch.length} repos)...`);

      const result = await fetchStarsBatch(batch, token);
      if (!result || result.errors) {
        console.error('Batch query failed:', result?.errors);
        errors.push(...batch.map(r => r.id));
        continue;
      }

      for (let j = 0; j < batch.length; j++) {
        const key = `repo_${j}`;
        const repoData = result.data[key];
        if (repoData) {
          starData[batch[j].id] = {
            stars: repoData.stargazerCount,
            forks: repoData.forkCount,
            language: repoData.primaryLanguage?.name || null,
            updatedAt: repoData.updatedAt,
            fetchedAt: new Date().toISOString(),
          };
          console.log(`  ✅ ${batch[j].id}: ${repoData.stargazerCount.toLocaleString()} ⭐`);
        } else {
          console.log(`  ⚠️ ${batch[j].id}: not found`);
          errors.push(batch[j].id);
        }
      }

      // 避免 rate limit
      if (i + batchSize < repos.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  } else {
    console.log('No GITHUB_TOKEN set, using REST API (slower, rate-limited)');
    for (const repo of repos) {
      console.log(`Fetching ${repo.id}...`);
      const data = await fetchStarREST(repo.owner, repo.repo);
      if (data) {
        starData[repo.id] = {
          stars: data.stargazerCount,
          forks: data.forkCount,
          language: data.primaryLanguage || null,
          updatedAt: data.updatedAt,
          fetchedAt: new Date().toISOString(),
        };
        console.log(`  ✅ ${repo.id}: ${data.stargazerCount.toLocaleString()} ⭐`);
      } else {
        console.log(`  ⚠️ ${repo.id}: failed`);
        errors.push(repo.id);
      }
      // GitHub REST API: 60 req/hr without token, wait 65s between requests
      await new Promise(r => setTimeout(r, 65000));
    }
  }

  // Write to JSON
  const outputPath = join(__dirname, '..', 'src', 'data', 'github-stars.json');
  writeFileSync(
    outputPath,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        totalRepos: repos.length,
        successCount: Object.keys(starData).length,
        errors,
        stars: starData,
      },
      null,
      2,
    ),
    'utf-8',
  );

  console.log(`\n✅ Saved to github-stars.json`);
  console.log(`   Success: ${Object.keys(starData).length}/${repos.length}`);
  if (errors.length > 0) {
    console.log(`   Errors: ${errors.join(', ')}`);
  }
}

main().catch(console.error);
