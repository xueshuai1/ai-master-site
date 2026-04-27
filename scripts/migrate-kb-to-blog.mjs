// 知识库 → 博客 迁移脚本
// 将热点/产品解读类文章从知识库移到博客
// 需要修改导出格式：article: Article → blog: BlogPost

import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

const ROOT = '/Users/xueshuai/.openclaw/workspace/ai-master-site';

// 要迁移的文章（热点解读/产品发布 → 博客）
// 每个条目: [源文件名(不含.ts), 在knowledge.ts中的变量名]
const toMove = [
  ['autoresearch-001',   'autoresearch001'],
  ['dspy-001',           'dspy001'],
  ['aieng020',           'aieng020'],
  ['agent-031',          'agent031'],
  ['aieng-018',          'aieng018'],
  ['context-001',        'context001'],
  ['gpt55-guide',        'gpt55Guide'],
  ['agent-030',          'agent030'],
  ['aieng-016',          'aieng016'],
  ['llm-020',            'llm020'],
  ['agent-029',          'agent029'],
  ['deepseek-v4',        'deepseekV4'],
  ['screen-ai-001',      'screenAi001'],
  ['self-evolving-agent', 'selfEvolvingAgent'],
  ['agent-028',          'agent028'],
  ['practice-014',       'practice014'],
];

// 保留知识库的（系统性基础知识）
const toKeep = [
  'aieng-021',   // Agentic Engineering 生产级实战
  'aieng-019',   // MCP 代码搜索
  'llm-021',     // FP8 推理基础设施
  'prompt-003',  // 高级 Prompt 工程
  'aieng-017',   // honker 深度解析
  'aieng-015',   // AI Coding Agent 质量保障
  'aiobs-001',   // AI 可观测性
  'prompt-002',  // Prompt 优化与评估
  'infer-001',   // LLM 推理加速技术全景
];

console.log(`📋 计划迁移 ${toMove.length} 篇知识库文章到博客...`);
console.log(`📚 保留 ${toKeep.length} 篇系统性基础知识在知识库...\n`);

// 找到下一个博客编号
const blogFiles = readdirSync(join(ROOT, 'src/data/blogs')).filter(f => f.startsWith('blog-') && f.endsWith('.ts'));
let maxNum = 0;
blogFiles.forEach(f => {
  const m = f.match(/blog-(\d+)/);
  if (m) maxNum = Math.max(maxNum, parseInt(m[1]));
});
console.log(`📊 当前最大博客编号: blog-${String(maxNum).padStart(3, '0')}.ts\n`);

// 读取 knowledge.ts 和 blogs.ts
const knowledgePath = join(ROOT, 'src/data/knowledge.ts');
const blogsPath = join(ROOT, 'src/data/blogs.ts');
let knowledgeContent = readFileSync(knowledgePath, 'utf-8');
let blogsContent = readFileSync(blogsPath, 'utf-8');

const movedFiles = [];

for (const [srcFile, varName] of toMove) {
  maxNum++;
  const blogName = `blog-${String(maxNum).padStart(3, '0')}`;
  const srcPath = join(ROOT, 'src/data/articles', `${srcFile}.ts`);
  const destPath = join(ROOT, 'src/data/blogs', `${blogName}.ts`);

  if (!existsSync(srcPath)) {
    console.log(`⚠️  跳过（文件不存在）: ${srcFile}.ts`);
    maxNum--; // 回退编号
    continue;
  }

  try {
    let content = readFileSync(srcPath, 'utf-8');

    // 1. 替换 import：从 knowledge.ts 的 Article 类型改为 blog-types 的 BlogPost 类型
    content = content.replace(
      /import \{ Article \} from ['"]\.\.\/knowledge['"];/,
      "import type { BlogPost } from './blog-types';"
    );
    // 也处理 import type { Article } from ...
    content = content.replace(
      /import type \{ Article \} from ['"]\.\.\/knowledge['"];/,
      "import type { BlogPost } from './blog-types';"
    );

    // 2. 替换导出：export const article: Article → const blog: BlogPost
    content = content.replace(
      /export const article: Article\s*=/,
      'const blog: BlogPost ='
    );
    // 也处理没有类型注解的情况
    content = content.replace(
      /export const article\s*=/,
      'const blog ='
    );

    // 3. 添加 id 字段（如果文件中没有）
    if (!content.includes('id:')) {
      // 在 const blog: BlogPost = { 之后添加 id
      content = content.replace(
        /(const blog:?\s*BlogPost?\s*=\s*\{)/,
        `$1\n  id: "${blogName}",`
      );
    } else {
      // 更新已有的 id
      content = content.replace(
        /id:\s*"[^"]*"/,
        `id: "${blogName}"`
      );
    }

    // 4. 添加 author 字段（如果文件中没有）
    if (!content.includes('author:')) {
      content = content.replace(
        /(const blog:?\s*BlogPost?\s*=\s*\{[\s\S]*?id:[^,]*,)/,
        `$1\n  author: "AI Master",`
      );
    }

    // 5. 删除 level 字段（BlogPost 没有这个字段）
    content = content.replace(/\s*level:\s*"[^"]*"[,]?\s*/g, '\n');

    // 6. 转换 readTime：如果是字符串，提取数字
    // readTime: "15 min" → readTime: 15
    content = content.replace(
      /readTime:\s*"(\d+)\s*min"/,
      'readTime: $1'
    );
    // readTime: "15分钟" → readTime: 15
    content = content.replace(
      /readTime:\s*"(\d+)\s*分钟"/,
      'readTime: $1'
    );

    // 7. 转换 category：CategoryKey → string
    // category: "llm" 保持不变（string 兼容）

    // 写入博客目录
    writeFileSync(destPath, content, 'utf-8');

    // 在 blogs.ts 中添加 import（在最后一条 import 之后）
    const importLine = `import { blog as ${varName} } from './blogs/${blogName}';`;
    // 找到最后一个 import 行，在其后添加
    const lastImportMatch = blogsContent.match(/(import \{ blog as \w+ \} from '[^']+';\n?)(?!.*import)/);
    if (lastImportMatch) {
      blogsContent = blogsContent.replace(lastImportMatch[1], `${lastImportMatch[1]}${importLine}\n`);
    } else {
      //  fallback：在文件开头添加
      blogsContent = blogsContent.replace(/(import type)/, `${importLine}\n$1`);
    }

    // 在 blogs.ts export 数组中添加变量
    // 找到 export const blogs 数组的末尾
    const blogsArrayRegex = /(export const blogs:\s*BlogPost\[\]\s*=\s*\[[\s\S]*?),\s*\];/;
    const blogsArrayMatch = blogsContent.match(blogsArrayRegex);
    if (blogsArrayMatch) {
      blogsContent = blogsContent.replace(
        blogsArrayRegex,
        `$1,\n  ${varName},\n];`
      );
    }

    // 从 knowledge.ts 中删除 import 行
    const importRegex = new RegExp(`import \\{ article as ${varName} \\} from '\\./articles/${srcFile}';\\s*\\n?`, 'g');
    knowledgeContent = knowledgeContent.replace(importRegex, '');
    // 也处理 import type
    const importTypeRegex = new RegExp(`import type \\{ article as ${varName} \\} from '\\./articles/${srcFile}';\\s*\\n?`, 'g');
    knowledgeContent = knowledgeContent.replace(importTypeRegex, '');

    // 从 knowledge.ts export 数组中删除变量
    const exportRegex = new RegExp(`,?\\s*${varName}(?=\\s*[,\\]])`, 'g');
    knowledgeContent = knowledgeContent.replace(exportRegex, '');

    // 删除源文件
    unlinkSync(srcPath);

    console.log(`✅ ${srcFile}.ts → ${blogName}.ts`);
    movedFiles.push({ srcFile, blogName, varName });
  } catch (e) {
    console.log(`❌ 失败: ${srcFile}.ts — ${e.message}`);
    console.log(e.stack);
    maxNum--; // 回退编号
  }
}

if (movedFiles.length > 0) {
  writeFileSync(blogsPath, blogsContent, 'utf-8');
  writeFileSync(knowledgePath, knowledgeContent, 'utf-8');

  console.log(`\n✅ 完成！${movedFiles.length} 篇已迁移到博客`);
  console.log(`   博客编号: ${movedFiles[0].blogName} ~ ${movedFiles[movedFiles.length - 1].blogName}`);
  console.log('\n📝 迁移详情:');
  movedFiles.forEach(({ srcFile, blogName }) => {
    console.log(`   ${srcFile}.ts → ${blogName}.ts`);
  });
  console.log(`\n📚 保留在知识库的 ${toKeep.length} 篇:`);
  toKeep.forEach(f => console.log(`   ${f}.ts`));
} else {
  console.log('\n⚠️ 没有成功迁移任何文章');
}
