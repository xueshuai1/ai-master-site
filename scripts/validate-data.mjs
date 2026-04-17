// 数据验证脚本 - 构建前运行，阻止无效数据进入构建
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const VALID_CATEGORIES = ["ml", "dl", "nlp", "cv", "llm", "agent", "rl", "genai", "multimodal", "aieng", "practice", "mlops", "ethics", "math"];
const ARTICLES_DIR = './src/data/articles';

let errors = [];
let warnings = [];

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

// 输出结果
if (errors.length > 0) {
  console.error('\n❌ 数据验证失败：\n');
  errors.forEach(e => console.error(e));
  console.error(`\n共 ${errors.length} 个错误，请修复后再构建。\n`);
  process.exit(1);
} else {
  console.log(`✅ 数据验证通过（检查了 ${articleFiles.length} 篇文章、分类定义、工具数据）`);
}

if (warnings.length > 0) {
  console.warn('\n⚠️  警告：\n');
  warnings.forEach(w => console.warn(w));
}
