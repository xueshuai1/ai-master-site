// 数据验证脚本 - 构建前运行，阻止无效数据进入构建
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const VALID_CATEGORIES = ["ml", "dl", "nlp", "cv", "llm", "agent", "rl", "genai", "multimodal", "aieng", "practice", "mlops", "ethics", "math", "prompt"];
const ARTICLES_DIR = './src/data/articles';

let errors = [];
let warnings = [];

// 🔴 0. 验证 news.ts 所有 href 必须指向 /news/news-XXX
console.log('🔍 验证新闻链接...');
const newsContent = readFileSync('./src/data/news.ts', 'utf-8');
const newsItems = newsContent.match(/id:\s*"([^"]+)"[\s\S]*?href:\s*"([^"]+)"/g);
if (newsItems) {
  for (const match of newsContent.matchAll(/id:\s*"([^"]+)"[\s\S]*?href:\s*"([^"]+)"/g)) {
    const id = match[1];
    const href = match[2];
    const expected = `/news/${id}`;
    if (!href.startsWith('/news/news-')) {
      errors.push(`  ❌ 新闻 ${id} 的 href 为 "${href}"，必须指向 "${expected}"`);
    } else if (href !== expected) {
      warnings.push(`  ⚠️ 新闻 ${id} 的 href "${href}" 与 ID 不匹配，预期 "${expected}"`);
    }
  }
}

// 1. 验证所有文章分类 key
console.log('🔍 验证文章数据...');
const articleFiles = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.ts'));

for (const file of articleFiles) {
  const content = readFileSync(join(ARTICLES_DIR, file), 'utf-8');
  
  // 提取 category 值
  const categoryMatch = content.match(/category:\s*["']([^"']+)["']/);
  if (!categoryMatch) {
    errors.push(`  ❌ ${file}: 缺少 category 字段`);
    continue;
  }
  
  const category = categoryMatch[1];
  if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`  ❌ ${file}: 无效分类 key "${category}"，有效值: ${VALID_CATEGORIES.join(', ')}`);
  }
}

// 2. 验证 knowledge.ts 中的 categories 完整性
console.log('🔍 验证分类定义...');
const knowledgeContent = readFileSync('./src/data/knowledge.ts', 'utf-8');
const categoryKeysMatch = knowledgeContent.match(/export type CategoryKey = ([^;]+);/);
if (categoryKeysMatch) {
  const typeDef = categoryKeysMatch[1];
  const typeKeys = typeDef.split('|').map(k => k.trim().replace(/["']/g, ''));
  const missing = VALID_CATEGORIES.filter(c => !typeKeys.includes(c));
  if (missing.length > 0) {
    errors.push(`  ❌ CategoryKey 类型缺少: ${missing.join(', ')}`);
  }
}

// 3. 验证 tools 分类
console.log('🔍 验证工具数据...');
const toolsContent = readFileSync('./src/data/tools.ts', 'utf-8');
const toolCategoriesMatch = toolsContent.match(/export const toolCategories = (\[[\s\S]*?\]);/);
if (toolCategoriesMatch) {
  const definedKeys = [...toolCategoriesMatch[1].matchAll(/key:\s*"([^"]+)"/g)].map(m => m[1]);
  const toolCategoryKeys = definedKeys.filter(k => k !== 'all');
  // 检查每个工具的分类是否在定义中
  const toolsMatch = toolsContent.match(/export const tools: Tool\[\] = ([\s\S]*?);$/m);
  if (toolsMatch) {
    const toolEntries = [...toolsMatch[1].matchAll(/category:\s*"([^"]+)"/g)];
    for (const match of toolEntries) {
      const cat = match[1];
      if (!toolCategoryKeys.includes(cat)) {
        errors.push(`  ❌ 工具使用了未定义的分类 key "${cat}"`);
      }
    }
  }
}

// 🔴 选题查重：检查所有文章标题是否有高度重复
console.log('🔍 选题查重验证...');
const titles = [];
for (const file of articleFiles) {
  const content = readFileSync(join(ARTICLES_DIR, file), 'utf-8');
  const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
  if (titleMatch) {
    titles.push({ file, title: titleMatch[1] });
  }
}

// 计算两两相似度（简化版：核心关键词匹配）
function similarity(a, b) {
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0 || lenB === 0) return 0;
  const matrix = Array(lenB + 1).fill(null).map(() => Array(lenA + 1).fill(0));
  for (let i = 0; i <= lenA; i++) matrix[0][i] = i;
  for (let j = 0; j <= lenB; j++) matrix[j][0] = j;
  for (let j = 1; j <= lenB; j++) {
    for (let i = 1; i <= lenA; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + cost);
    }
  }
  return 1 - matrix[lenB][lenA] / Math.max(lenA, lenB);
}

function isSameSeries(a, b) {
  const matchA = a.match(/^(.+?)[（(]([一二三四五六七八九十\d]+)[)）]/);
  const matchB = b.match(/^(.+?)[（(]([一二三四五六七八九十\d]+)[)）]/);
  if (!matchA || !matchB) return false;
  // 提取核心关键词（去掉修饰词如 "标准"/"模式"/"AI"/"LLM"）
  const cleanA = matchA[1].trim().replace(/^(AI|LLM)\s*/, '').replace(/标准|模式|全面|深度|全景|实战|指南|详解|体系|全景解析|深度解读/g, '').trim();
  const cleanB = matchB[1].trim().replace(/^(AI|LLM)\s*/, '').replace(/标准|模式|全面|深度|全景|实战|指南|详解|体系|全景解析|深度解读/g, '').trim();
  return cleanA === cleanB && matchA[2] !== matchB[2];
}

for (let i = 0; i < titles.length; i++) {
  for (let j = i + 1; j < titles.length; j++) {
    if (isSameSeries(titles[i].title, titles[j].title)) continue;
    const sim = similarity(titles[i].title, titles[j].title);
    if (sim >= 0.7) {
      errors.push(`  ❌ 标题高度相似（${Math.round(sim * 100)}%）: [${titles[i].file}]「${titles[i].title}」 vs [${titles[j].file}]「${titles[j].title}」`);
    }
  }
}

// 输出结果
if (errors.length > 0) {
  console.error('\n❌ 数据验证失败：\n');
  errors.forEach(e => console.error(e));
  console.error(`\n共 ${errors.length} 个错误，请修复后再构建。\n`);
  process.exit(1);
} else {
  console.log(`✅ 数据验证通过（检查了 ${articleFiles.length} 篇文章、分类定义、工具数据、新闻链接）`);
}

if (warnings.length > 0) {
  console.warn('\n⚠️  警告：\n');
  warnings.forEach(w => console.warn(w));
}
