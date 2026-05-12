#!/usr/bin/env node
// 🔴 文章深度校验脚本 — 2026-04-28 新增
// 技术博客深度必须 > 知识库！这是铁律。

import fs from 'fs';
import path from 'path';

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const isBlogFile = filePath.includes('/blogs/blog-');
  const isArticleFile = filePath.includes('/articles/');

  if (!isBlogFile && !isArticleFile) {
    return { ok: true, warnings: [], file: filePath };
  }

  const errors = [];
  const warnings = [];

  // 统计整个文件中的中文字符（正文 + 标题 + 标签等）
  // 但排除导入语句、类型定义和导出语句中的英文
  const chineseRegex = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g;
  const allChineseChars = content.match(chineseRegex) || [];
  const totalChineseChars = allChineseChars.length;

  // 更精确：统计 body 和 summary 字段中的中文字符
  // 解析 content 数组中的 body 和 summary
  let bodyChineseChars = 0;
  
  // 匹配 summary 字段（简短描述）
  const summaryMatches = content.match(/summary:\s*"[^"]*([\u4e00-\u9fff][^"]*)"/g);
  if (summaryMatches) {
    for (const m of summaryMatches) {
      const chars = m.match(chineseRegex) || [];
      bodyChineseChars += chars.length;
    }
  }
  
  // 提取 content 数组内容
  const contentStart = content.indexOf('content:');
  if (contentStart > 0) {
    const contentSection = content.substring(contentStart);
    // 逐段提取 body 字段
    const bodySections = contentSection.match(/body:\s*`([^`]*(?:`[^,][^`]*)*)`/g);
    if (bodySections) {
      for (const section of bodySections) {
        const chars = section.match(chineseRegex) || [];
        bodyChineseChars += chars.length;
      }
    }
  }

  // 如果 body 统计结果明显偏少（说明正则漏了），用全局中文字符数作为 fallback
  const chineseCharCount = bodyChineseChars > totalChineseChars * 0.3 ? bodyChineseChars : totalChineseChars;

  // 统计章节数（title: "..." 的数量）
  const titleMatches = content.match(/title:\s*"/g);
  const chapterCount = titleMatches ? titleMatches.length : 0;

  // 统计代码块数量 — 匹配 code 数组中的 { lang: ..., code: ... } 对象
  const codeBlockMatches = content.match(/\{\s*lang\s*:/g);
  const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0;

  // 统计图表（mermaid / table）— 支持 mermaid 数组格式和反引号格式
  const mermaidArrayMatches = content.match(/mermaid:\s*\[/g) || [];
  const mermaidInlineMatches = content.match(/mermaid:\s*`/g) || [];
  const mermaidCount = mermaidArrayMatches.length + mermaidInlineMatches.length;
  const tableCount = (content.match(/table:\s*\{/g) || []).length;
  const chartCount = mermaidCount + tableCount;

  const fileName = path.basename(filePath);

  if (isBlogFile) {
    // 博客硬性指标（字数 = 中文字数）
    if (chineseCharCount < 5000) {
      errors.push(`❌ 博客 ${fileName} 正文字数不足：${chineseCharCount} 中文字 < 5000 字要求`);
    }
    if (chapterCount < 8) {
      errors.push(`❌ 博客 ${fileName} 章节数不足：${chapterCount} 章 < 8 章要求`);
    }
    if (codeBlockCount < 2) {
      errors.push(`❌ 博客 ${fileName} 代码块不足：${codeBlockCount} 个 < 2 个要求`);
    }
    if (chartCount < 1) {
      warnings.push(`⚠️ 博客 ${fileName} 缺少图表（Mermaid 或对比表格），建议添加`);
    }
    if (chineseCharCount >= 5000 && chineseCharCount < 6000) {
      warnings.push(`⚠️ 博客 ${fileName} 正文字数刚达标：${chineseCharCount} 字，建议 6000+ 字`);
    }
  } else if (isArticleFile) {
    // 知识库硬性指标（字数 = 中文字数）
    if (chineseCharCount < 4000) {
      errors.push(`❌ 知识库 ${fileName} 正文字数不足：${chineseCharCount} 中文字 < 4000 字要求`);
    }
    if (chapterCount < 7) {
      errors.push(`❌ 知识库 ${fileName} 章节数不足：${chapterCount} 章 < 7 章要求`);
    }
    if (codeBlockCount < 2) {
      errors.push(`❌ 知识库 ${fileName} 代码块不足：${codeBlockCount} 个 < 2 个要求`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    file: fileName,
    stats: {
      chineseChars: chineseCharCount,
      chapters: chapterCount,
      codeBlocks: codeBlockCount,
      charts: chartCount,
      type: isBlogFile ? '博客' : '知识库'
    }
  };
}

// 主逻辑
const files = process.argv.slice(2);
if (files.length === 0) {
  // 默认检查最近修改的 5 篇博客和知识库
  const blogDir = path.join(process.cwd(), 'src/data/blogs');
  const articleDir = path.join(process.cwd(), 'src/data/articles');

  const blogs = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter(f => f.startsWith('blog-') && f.endsWith('.ts')).slice(-5)
    : [];
  const articles = fs.existsSync(articleDir)
    ? fs.readdirSync(articleDir).filter(f => f.endsWith('.ts')).slice(-5)
    : [];

  files.push(...blogs.map(f => path.join(blogDir, f)));
  files.push(...articles.map(f => path.join(articleDir, f)));
}

let hasError = false;
const results = [];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const r = validateFile(f);
  results.push(r);
  if (r.errors?.length) hasError = true;

  if (r.errors?.length || r.warnings?.length) {
    console.log(`\n📄 ${r.file} (${r.stats?.type || '未知'})`);
    if (r.stats) {
      console.log(`   正文: ${r.stats.chineseChars} 中文字 | 章节: ${r.stats.chapters} | 代码: ${r.stats.codeBlocks} | 图表: ${r.stats.charts}`);
    }
    for (const e of r.errors || []) console.log(`   ${e}`);
    for (const w of r.warnings || []) console.log(`   ${w}`);
  }
}

if (hasError) {
  console.log('\n❌ 深度校验未通过！请补充内容后再提交。');
  process.exit(1);
} else {
  console.log('\n✅ 所有文章深度校验通过。');
  process.exit(0);
}
