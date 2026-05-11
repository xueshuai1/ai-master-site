#!/usr/bin/env node
/**
 * 知识库去重脚本 — 精准版
 * 1. 删除重复文章 .ts 文件
 * 2. 从 knowledge.ts 移除对应 import + 数组引用
 */
const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'data', 'articles');
const KNOWLEDGE_PATH = path.join(__dirname, '..', 'src', 'data', 'knowledge.ts');

// 要删除的重复文件（保留更完整/更新的版本）
const DELETE_FILES = [
  // Agent 垂直化 ×4 → 保留 agent-017
  'agent-013.ts', 'agent-014.ts', 'agent-015.ts',
  // LLM 推理优化 — llm-007 与 aieng-025 重复 → 删除 llm-007
  'llm-007.ts',
  // MCP 协议 — agent-009 和 aieng-009 重复 → 删除 aieng-009
  'aieng-009.ts',
  // ML 流水线 — aieng-001 和 mlops-001 重复 → 删除 aieng-001
  'aieng-001.ts',
  // 模型版本管理 — aieng-002、mlops-003 与 mlops-002 重复 → 删除
  'aieng-002.ts', 'mlops-003.ts',
  // SVM — ml-003 和 ml-007 重复 → 删除 ml-007
  'ml-007.ts',
  // 推荐系统 ×2 标题完全相同 → 删除 prac-xxx
  'prac-001.ts', 'prac-002.ts',
  // Protenix ×2 重复 → 删除 aieng-011
  'aieng-011.ts',
  // AI 编程工具竞争 ×2 重复 → 删除 aieng-022
  'aieng-022.ts',
  // 企业成本 ×2 重复 → 删除 practice-010
  'practice-010.ts',
  // 语音 AI ×2 标题几乎相同 → 删除 voice-005
  'voice-005.ts',
  // Prompt 导览 — prompt-guide 与 llm-006 重复 → 删除
  'prompt-guide.ts',
  // LLM 推理加速 — dl-018 与 infer-001 重复 → 删除 dl-018
  'dl-018.ts',
];

// ====== Step 1: 删除 .ts 文件 ======
console.log('🗑️  删除重复文件：');
for (const f of DELETE_FILES) {
  const fp = path.join(ARTICLES_DIR, f);
  if (fs.existsSync(fp)) {
    fs.rmSync(fp);
    console.log(`   ✅ ${f}`);
  }
}

// ====== Step 2: 从 knowledge.ts 中找到被删文件的 alias ======
let kContent = fs.readFileSync(KNOWLEDGE_PATH, 'utf-8');

// 解析 import 行，建立 alias -> filename 映射
const importLines = kContent.match(/import \{ article as (\w+) \} from '\.\/articles\/([^']+)';/g) || [];
const aliasMap = {}; // alias -> base filename (without .ts)
const aliasToLine = {}; // alias -> full import line
for (const line of importLines) {
  const m = line.match(/import \{ article as (\w+) \} from '\.\/articles\/([^']+)';/);
  if (m) {
    aliasMap[m[1]] = m[2];
    aliasToLine[m[1]] = line;
  }
}

// 找出要删除的 alias
const toDeleteAlias = [];
for (const f of DELETE_FILES) {
  const base = f.replace('.ts', '');
  for (const [alias, fileBase] of Object.entries(aliasMap)) {
    if (fileBase === base) {
      toDeleteAlias.push(alias);
      console.log(`   📌 ${f} → alias: ${alias}`);
    }
  }
}

// ====== Step 3: 移除 import 行 ======
const allLines = kContent.split('\n');
const filteredLines = allLines.filter(line => {
  const m = line.match(/import \{ article as (\w+) \} from '\.\/articles\/([^']+)';/);
  return !(m && toDeleteAlias.includes(m[1]));
});
kContent = filteredLines.join('\n');

// ====== Step 4: 从 articles 数组中移除 alias ======
const arrMatch = kContent.match(/(export const articles:\s*Article\[\]\s*=\s*\[)([\s\S]*?)(\];)/);
if (!arrMatch) { console.error('❌ 未找到 articles 数组'); process.exit(1); }

const items = arrMatch[2].split(',').map(s => s.trim()).filter(Boolean);
const kept = items.filter(x => !toDeleteAlias.includes(x));
const removed = items.filter(x => toDeleteAlias.includes(x));

console.log(`\n📊 从数组移除 ${removed.length} 项: ${removed.join(', ')}`);

const newArr = '\n' + kept.map(x => `  ${x},`).join('\n') + '\n';
kContent = kContent.replace(/(export const articles:\s*Article\[\]\s*=\s*\[)[\s\S]*?(\];)/, `$1${newArr}$2`);

fs.writeFileSync(KNOWLEDGE_PATH, kContent, 'utf-8');
console.log(`\n✅ 去重完成！删除 ${DELETE_FILES.length} 个文件，移除 ${toDeleteAlias.length} 个引用`);
