#!/usr/bin/env node
/**
 * 批量为文章添加 learningPath 数据
 * 按 category + level 自动分配到各路线的阶段中
 */
const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'data', 'articles');

// 路线定义：每个阶段对应哪些 category，以及导览文章
const ROUTES = {
  foundation: {
    phases: [
      { id: 'f1', categories: ['practice'], guide: 'ai-000' },
      { id: 'f2', categories: ['math', 'ml'], guide: 'math-ml-guide' },
      { id: 'f3', categories: ['ml'], guide: null },
      { id: 'f4', categories: ['dl'], guide: 'dl-guide' },
      { id: 'f5', categories: ['nlp', 'cv', 'rl'], guides: { nlp: 'nlp-guide', cv: 'cv-guide', rl: 'rl-guide' } },
      { id: 'f6', categories: ['llm'], guide: 'llm-app-guide' },
      { id: 'f7', categories: ['agent'], guide: 'agent-guide' },
    ]
  },
  fast: {
    phases: [
      { id: 'f1', categories: ['practice'], guide: 'ai-000' },
      { id: 'f2', categories: ['prompt'], guide: null },
      { id: 'f3', categories: ['llm'], guide: 'llm-app-guide' },
      { id: 'f4', categories: ['agent'], guide: 'agent-guide' },
      { id: 'f5', categories: ['aieng', 'mlops'], guide: 'aieng-guide' },
    ]
  },
  'ai-dev': {
    phases: [
      { id: 'd1', categories: ['llm', 'prompt'], guide: 'llm-app-guide' },
      { id: 'd2', categories: ['llm', 'practice'], guide: null },
      { id: 'd3', categories: ['llm'], guide: null },
      { id: 'd4', categories: ['agent'], guide: 'agent-guide' },
      { id: 'd5', categories: ['aieng', 'mlops'], guide: 'aieng-guide' },
    ]
  },
  algo: {
    phases: [
      { id: 'a1', categories: ['math'], guide: 'math-ml-guide' },
      { id: 'a2', categories: ['ml'], guide: null },
      { id: 'a3', categories: ['dl'], guide: 'dl-guide' },
      { id: 'a4', categories: ['llm'], guide: 'llm-app-guide' },
      { id: 'a5', categories: ['rl'], guide: 'rl-guide' },
    ]
  },
  pm: {
    phases: [
      { id: 'p1', categories: ['practice'], guide: 'ai-000' },
      { id: 'p2', categories: ['prompt', 'agent'], guide: null },
      { id: 'p3', categories: ['ethics', 'practice'], guide: null },
    ]
  },
  'data-scientist': {
    phases: [
      { id: 's1', categories: ['math', 'ml'], guide: 'math-ml-guide' },
      { id: 's2', categories: ['dl', 'nlp', 'cv'], guide: 'dl-guide' },
      { id: 's3', categories: ['llm', 'genai'], guide: 'llm-app-guide' },
      { id: 's4', categories: ['mlops', 'aieng'], guide: 'aieng-guide' },
    ]
  },
  security: {
    phases: [
      { id: 'e1', categories: ['ethics'], guide: 'security-guide' },
      { id: 'e2', categories: ['ethics'], guide: null },
      { id: 'e3', categories: ['ethics'], guide: null },
      { id: 'e4', categories: ['ethics', 'llm'], guide: null },
    ]
  }
};

const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.ts'));

const assignments = {};

for (const f of files) {
  const content = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf-8');
  const idMatch = content.match(/id:\s*["']([^"']+)["']/);
  const catMatch = content.match(/category:\s*["']([^"']+)["']/);
  const levelMatch = content.match(/level:\s*["']([^"']+)["']/);
  
  if (!idMatch || !catMatch) continue;
  
  const id = idMatch[1];
  const cat = catMatch[1];
  const level = levelMatch ? levelMatch[1] : '进阶';
  
  // 跳过导览文章本身
  if (f.includes('guide') || id === 'ai-000') continue;
  
  // 找到文章在每个路线中应该属于哪个阶段
  for (const [routeId, route] of Object.entries(ROUTES)) {
    for (let phaseIdx = 0; phaseIdx < route.phases.length; phaseIdx++) {
      const phase = route.phases[phaseIdx];
      if (phase.categories.includes(cat)) {
        if (!assignments[id]) assignments[id] = {};
        if (!assignments[id][routeId]) assignments[id][routeId] = [];
        assignments[id][routeId].push({ phase: phaseIdx + 1, cat, level });
      }
    }
  }
}

// 输出分配结果统计
console.log('=== 学习路线分配统计 ===');
for (const [routeId, route] of Object.entries(ROUTES)) {
  let count = 0;
  for (const arts of Object.values(assignments)) {
    if (arts[routeId]) count += arts[routeId].length;
  }
  console.log(`  ${routeId}: ${count} 篇文章`);
}

console.log(`\n总共 ${Object.keys(assignments).length} 篇文章被分配到路线`);

// 输出未分配的文章
const unassigned = files.filter(f => {
  if (!f.endsWith('.ts')) return false;
  const content = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf-8');
  const idMatch = content.match(/id:\s*["']([^"']+)["']/);
  if (!idMatch) return false;
  const id = idMatch[1];
  return !assignments[id];
});

if (unassigned.length > 0) {
  console.log(`\n未分配到任何路线的文章 (${unassigned.length}篇):`);
  for (const f of unassigned.slice(0, 20)) {
    const content = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf-8');
    const id = content.match(/id:\s*["']([^"']+)["']/)?.[1] || f;
    const cat = content.match(/category:\s*["']([^"']+)["']/)?.[1] || '?';
    console.log(`  ${id} (${cat})`);
  }
  if (unassigned.length > 20) console.log(`  ... 还有 ${unassigned.length - 20} 篇`);
}
