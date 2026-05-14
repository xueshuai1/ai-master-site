#!/usr/bin/env node
/**
 * 将所有知识库文章和博客文章导出为标准 Markdown 格式
 * 
 * 用法:
 *   node scripts/export-markdown.mjs                    # 导出全部
 *   node scripts/export-markdown.mjs --articles          # 只导出知识库
 *   node scripts/export-markdown.mjs --blogs             # 只导出博客
 *   node scripts/export-markdown.mjs ai-law-001          # 单篇指定文章
 *   node scripts/export-markdown.mjs ai-law-001 blog-168 # 多篇指定
 * 
 * 输出目录: exports/markdown/
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT = join(ROOT, 'exports', 'markdown');
const ARTICLES_DIR = join(ROOT, 'src', 'data', 'articles');
const BLOGS_DIR = join(ROOT, 'src', 'data', 'blogs');

mkdirSync(OUTPUT, { recursive: true });
mkdirSync(join(OUTPUT, 'articles'), { recursive: true });
mkdirSync(join(OUTPUT, 'blogs'), { recursive: true });

const args = process.argv.slice(2);
const mode = args.includes('--articles') ? 'articles' : args.includes('--blogs') ? 'blogs' : 'all';
const specificIds = args.filter(a => !a.startsWith('--'));

let total = 0, success = 0, failed = 0;

/**
 * ArticleSection[] → 标准 Markdown
 * 
 * 映射关系:
 *   title    → ## 标题
 *   body     → 正文（本身就是 Markdown）
 *   body2    → 补充正文
 *   code     → ```lang ... ```
 *   mermaid  → ```mermaid ... ```
 *   table    → Markdown 表格
 *   list     → - 列表
 *   tip      → > 💡 提示
 *   warning  → > ⚠️ 注意
 */
function sectionsToMd(meta, sections) {
  let md = '';
  
  // YAML frontmatter
  md += `---\n`;
  md += `title: "${meta.title.replace(/"/g, '\\"')}"\n`;
  if (meta.date) md += `date: "${meta.date}"\n`;
  if (meta.readTime) md += `readTime: "${meta.readTime}"\n`;
  if (meta.level) md += `level: "${meta.level}"\n`;
  if (meta.category) md += `category: "${meta.category}"\n`;
  if (meta.summary) md += `summary: "${meta.summary.replace(/"/g, '\\"')}"\n`;
  if (meta.tags?.length) md += `tags: [${meta.tags.join(', ')}]\n`;
  md += `---\n\n`;
  
  // 摘要
  if (meta.summary) {
    md += `> ${meta.summary}\n\n---\n\n`;
  }
  
  // 正文章节
  for (const s of sections) {
    if (s.title) md += `## ${s.title}\n\n`;
    
    if (s.body) md += s.body + '\n\n';
    if (s.body2) md += s.body2 + '\n\n';
    
    if (s.code?.length) {
      for (const c of s.code) {
        if (c.title) md += `### ${c.title}\n\n`;
        md += `\`\`\`${c.lang || ''}\n${c.code}\n\`\`\`\n\n`;
      }
    }
    
    if (s.mermaid) {
      md += `\`\`\`mermaid\n${s.mermaid}\n\`\`\`\n\n`;
    }
    
    if (s.table) {
      md += `| ${s.table.headers.join(' | ')} |\n`;
      md += `| ${s.table.headers.map(() => '---').join(' | ')} |\n`;
      for (const row of s.table.rows) md += `| ${row.join(' | ')} |\n`;
      md += '\n';
    }
    
    if (s.list?.length) {
      for (const item of s.list) md += `- ${item}\n`;
      md += '\n';
    }
    
    if (s.tip) md += `> 💡 **提示**: ${s.tip}\n\n`;
    if (s.warning) md += `> ⚠️ **注意**: ${s.warning}\n\n`;
    
    md += `---\n\n`;
  }
  
  return md;
}

/**
 * 解析 TypeScript 文件，提取元信息和章节
 */
function parseArticle(filePath) {
  const src = readFileSync(filePath, 'utf-8');
  
  const getTitle = (k) => {
    const m = src.match(new RegExp(`^\\s*${k}\\s*:\\s*"([^"]*)"`, 'm'));
    return m ? m[1] : '';
  };
  const getTags = () => {
    const m = src.match(/tags\s*:\s*\[([^\]]*)\]/);
    return m ? m[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean) : [];
  };
  
  const meta = {
    title: getTitle('title'),
    summary: getTitle('summary'),
    date: getTitle('date'),
    readTime: getTitle('readTime'),
    level: getTitle('level'),
    category: getTitle('category'),
    tags: getTags()
  };
  
  // 找到 content: [ ... ] 的范围
  const contentIdx = src.indexOf('content');
  if (contentIdx === -1) return { meta, sections: [] };
  
  const bracketIdx = src.indexOf('[', contentIdx);
  if (bracketIdx === -1) return { meta, sections: [] };
  
  // 括号匹配找到数组结尾
  let depth = 0, endIdx = -1;
  for (let i = bracketIdx; i < src.length; i++) {
    if (src[i] === '`') {
      let j = i + 1;
      while (j < src.length && src[j] !== '`') j++;
      i = j;
      continue;
    }
    if (src[i] === '[') depth++;
    if (src[i] === ']') { depth--; if (depth === 0) { endIdx = i; break; } }
  }
  
  if (endIdx === -1) return { meta, sections: [] };
  
  const contentStr = src.substring(bracketIdx, endIdx + 1);
  
  // 按顶层 { ... } 分割 sections
  const sections = [];
  let secDepth = 0, secStart = -1;
  
  for (let i = 0; i < contentStr.length; i++) {
    if (contentStr[i] === '`') {
      let j = i + 1;
      while (j < contentStr.length && contentStr[j] !== '`') j++;
      i = j;
      continue;
    }
    if (contentStr[i] === '{') {
      if (secDepth === 0) secStart = i;
      secDepth++;
    } else if (contentStr[i] === '}') {
      secDepth--;
      if (secDepth === 0 && secStart !== -1) {
        const secStr = contentStr.substring(secStart, i + 1);
        const section = {};
        
        const tm = secStr.match(/title\s*:\s*"([^"]*)"/);
        if (tm) section.title = tm[1];
        
        // body: 模板字符串（可能跨多行）
        const bm = secStr.match(/body\s*:\s*`([\s\S]*?)`(?:\s*,?\s*\n|\s*$)/);
        if (bm) section.body = bm[1];
        
        const b2m = secStr.match(/body2\s*:\s*`([\s\S]*?)`(?:\s*,?\s*\n|\s*$)/);
        if (b2m) section.body2 = b2m[1];
        
        const mm = secStr.match(/mermaid\s*:\s*`([\s\S]*?)`(?:\s*,?\s*\n|\s*$)/);
        if (mm) section.mermaid = mm[1];
        
        const tipm = secStr.match(/tip\s*:\s*"([^"]*)"/);
        if (tipm) section.tip = tipm[1];
        
        const wm = secStr.match(/warning\s*:\s*"([^"]*)"/);
        if (wm) section.warning = wm[1];
        
        const lm = secStr.match(/list\s*:\s*\[([^\]]*)\]/);
        if (lm) section.list = lm[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        
        // code 数组
        const codeOuter = secStr.match(/code\s*:\s*\[([\s\S]*?)\](?:\s*,?\s*\n|\s*$)/);
        if (codeOuter) {
          const codeBlocks = [];
          const codeRegex = /{\s*lang\s*:\s*"([^"]*)"\s*,\s*title\s*:\s*"([^"]*)"\s*,\s*code\s*:\s*`([\s\S]*?)`/g;
          let cm;
          while ((cm = codeRegex.exec(codeOuter[1])) !== null) {
            codeBlocks.push({ lang: cm[1], title: cm[2], code: cm[3] });
          }
          if (codeBlocks.length) section.code = codeBlocks;
        }
        
        if (section.title || section.body || section.mermaid) {
          sections.push(section);
        }
        
        secStart = -1;
      }
    }
  }
  
  return { meta, sections };
}

// ===== 导出单个文件 =====
function exportOne(filePath, outputSubdir) {
  const id = basename(filePath, '.ts');
  try {
    const { meta, sections } = parseArticle(filePath);
    if (!sections.length) { console.log(`  ⚠️ ${id}: 无章节数据`); failed++; return; }
    
    const md = sectionsToMd(meta, sections);
    const outPath = join(OUTPUT, outputSubdir, `${id}.md`);
    writeFileSync(outPath, md, 'utf-8');
    success++;
    console.log(`  ✅ ${id}.md | ${sections.length} 章节 | ${(md.length / 1024).toFixed(0)}KB`);
  } catch (e) {
    console.log(`  ❌ ${id}: ${e.message.slice(0, 80)}`);
    failed++;
  }
}

// ===== 主流程 =====
if (specificIds.length) {
  console.log(`📄 导出指定文章: ${specificIds.join(', ')}\n`);
  for (const id of specificIds) {
    total++;
    const ap = join(ARTICLES_DIR, `${id}.ts`);
    const bp = join(BLOGS_DIR, `${id}.ts`);
    if (existsSync(ap)) exportOne(ap, 'articles');
    else if (existsSync(bp)) exportOne(bp, 'blogs');
    else { console.log(`  ⚠️ 未找到: ${id}`); failed++; }
  }
} else {
  if (mode === 'all' || mode === 'articles') {
    const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.ts'));
    console.log(`📚 导出知识库文章 (${files.length} 篇)...\n`);
    total += files.length;
    for (const f of files) exportOne(join(ARTICLES_DIR, f), 'articles');
  }
  if (mode === 'all' || mode === 'blogs') {
    const files = readdirSync(BLOGS_DIR).filter(f => f.endsWith('.ts'));
    console.log(`\n📝 导出博客文章 (${files.length} 篇)...\n`);
    total += files.length;
    for (const f of files) exportOne(join(BLOGS_DIR, f), 'blogs');
  }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`✅ 完成: 成功 ${success} | 失败 ${failed} | 总计 ${total}`);
console.log(`📂 输出: ${OUTPUT}/articles/ 和 ${OUTPUT}/blogs/`);
