#!/usr/bin/env node
/**
 * 自我进化审查脚本
 * 
 * 在每次 cron 执行后运行，自动审查本次执行质量，
 * 发现策略盲区，提出进化建议。
 * 
 * 运行：node scripts/self-evolution-review.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DAILY_LOG = path.join(ROOT, '..', 'memory', 'ai-master-daily.md');
const EVOLUTION_LOG = path.join(ROOT, 'EVOLUTION-LOG.md');
const TOOLS_FILE = path.join(ROOT, 'src/data/tools.ts');
const KNOWLEDGE_FILE = path.join(ROOT, 'src/data/knowledge.ts');
const TOPICS_FILE = path.join(ROOT, 'data/ai-topics.json');

function getLatestEntry() {
  try {
    const content = fs.readFileSync(DAILY_LOG, 'utf8');
    const entries = content.split(/## 2026-/).slice(1);
    const latest = entries[entries.length - 1];
    return latest ? '2026-' + latest : '';
  } catch {
    return '';
  }
}

function countStats(entry) {
  const stats = {};
  const newsMatch = entry.match(/新闻\s*(\d+)\s*条/);
  const kbMatch = entry.match(/知识库\s*(\d+)\s*篇/);
  const blogMatch = entry.match(/博客\s*(\d+)\s*篇/);
  const toolMatch = entry.match(/工具\s*(\d+)\s*个/);
  const commitMatch = entry.match(/Commit:\s*([a-f0-9]+)/);
  
  if (newsMatch) stats.news = parseInt(newsMatch[1]);
  if (kbMatch) stats.kb = parseInt(kbMatch[1]);
  if (blogMatch) stats.blog = parseInt(blogMatch[1]);
  if (toolMatch) stats.tools = parseInt(toolMatch[1]);
  if (commitMatch) stats.commit = commitMatch[1];
  
  // 检查是否有新增内容
  stats.hasNewKB = /新增知识库|知识库.*\+\d|篇.*\+/.test(entry);
  stats.hasNewTool = /新增.*工具|工具.*\+\d/.test(entry);
  stats.hasNewBlog = /新增博客|博客.*\+\d|blog-\d+/.test(entry);
  stats.hasNewNews = /新增.*新闻|新闻.*\+\d|news-/.test(entry);
  
  // 检查是否做了 QA
  stats.didQA = /QA.*✅|QA.*正常|QA 测试/.test(entry);
  
  // 检查是否做了构建验证
  stats.didBuild = /build.*通过|构建成功|Build.*✅/.test(entry);
  
  return stats;
}

function checkCollectionDiversity(entry) {
  const sources = [];
  if (/GitHub Trending/.test(entry)) sources.push('GitHub Trending');
  if (/GitHub API/.test(entry)) sources.push('GitHub API');
  if (/arXiv/.test(entry)) sources.push('arXiv');
  if (/Simon Willison/.test(entry)) sources.push('Simon Willison');
  if (/TechCrunch/.test(entry)) sources.push('TechCrunch');
  if (/The Verge/.test(entry)) sources.push('The Verge');
  if (/MarkTechPost/.test(entry)) sources.push('MarkTechPost');
  if (/Topics/.test(entry)) sources.push('GitHub Topics');
  if (/HuggingFace/.test(entry)) sources.push('HuggingFace');
  if (/Product Hunt/.test(entry)) sources.push('Product Hunt');
  if (/VentureBeat/.test(entry)) sources.push('VentureBeat');
  if (/OpenAI Blog/.test(entry)) sources.push('OpenAI Blog');
  if (/Anthropic/.test(entry)) sources.push('Anthropic Blog');
  if (/Google Blog/.test(entry)) sources.push('Google Blog');
  return sources;
}

function main() {
  const entry = getLatestEntry();
  if (!entry) {
    console.error('❌ 无法读取最新日志');
    process.exit(1);
  }
  
  const stats = countStats(entry);
  const sources = checkCollectionDiversity(entry);
  
  console.error('🧬 自我进化审查报告\n');
  console.error('═'.repeat(50));
  
  // 1. 内容产出评估
  console.error('\n📊 内容产出评估：');
  let score = 0;
  
  if (stats.hasNewKB) { console.error('  ✅ 知识库有新增'); score += 2; }
  else { console.error('  ⚠️  知识库无新增'); }
  
  if (stats.hasNewTool) { console.error('  ✅ 工具有新增'); score += 1; }
  else { console.error('  ⚠️  工具无新增'); }
  
  if (stats.hasNewBlog) { console.error('  ✅ 博客有新增'); score += 2; }
  else { console.error('  ⚠️  博客无新增'); }
  
  if (stats.didQA) { console.error('  ✅ 做了 QA 测试'); score += 1; }
  else { console.error('  ❌ 未做 QA 测试'); }
  
  if (stats.didBuild) { console.error('  ✅ 构建验证通过'); score += 1; }
  else { console.error('  ❌ 未做构建验证'); }
  
  // 2. 收集渠道多样性
  console.error(`\n📡 收集渠道多样性（${sources.length} 个来源）：`);
  if (sources.length >= 4) { console.error('  ✅ 来源多样化'); score += 2; }
  else if (sources.length >= 2) { console.error('  ⚠️  来源偏少，建议扩展'); score += 1; }
  else { console.error('  ❌ 来源单一，必须扩展'); }
  sources.forEach(s => console.error(`    - ${s}`));
  
  // 3. 当前状态评估
  console.error(`\n📈 当前状态：`);
  if (stats.news !== undefined) console.error(`  新闻：${stats.news} 条`);
  if (stats.kb !== undefined) console.error(`  知识库：${stats.kb} 篇`);
  if (stats.blog !== undefined) console.error(`  博客：${stats.blog} 篇`);
  if (stats.tools !== undefined) console.error(`  工具：${stats.tools} 个`);
  
  // 4. 进化建议
  console.error('\n💡 进化建议：');
  
  const suggestions = [];
  if (!stats.hasNewKB && stats.kb !== undefined && stats.kb < 300) {
    suggestions.push('知识库还有增长空间，建议下一篇深度文章');
  }
  if (sources.length < 3) {
    suggestions.push('收集渠道太少，建议搜索更多来源（HuggingFace, Product Hunt AI, arXiv）');
  }
  if (!sources.includes('GitHub Topics')) {
    suggestions.push('未使用 GitHub Topics 扫描，可能遗漏高星项目');
  }
  if (!stats.didQA) {
    suggestions.push('必须做 QA 测试，用 browser 打开至少 3 个页面验证');
  }
  if (stats.news !== undefined && stats.news < 50) {
    suggestions.push('新闻数量偏少，建议补充');
  }
  
  if (suggestions.length === 0) {
    console.error('  ✅ 无明显改进空间，继续保持');
  } else {
    suggestions.forEach(s => console.error(`  → ${s}`));
  }
  
  // 5. 进化评分
  console.error(`\n🏆 进化评分：${score}/9`);
  if (score >= 7) console.error('  优秀！继续保持');
  else if (score >= 5) console.error('  良好，有改进空间');
  else console.error('  需要改进，下次注意覆盖更多维度');
  
  // 6. 生成进化日志更新建议
  console.error('\n📝 建议追加到 EVOLUTION-LOG.md：');
  console.error('─'.repeat(50));
  const date = new Date().toISOString().slice(0, 10);
  console.error(`### ${date} 自动审查`);
  console.error(`- 评分：${score}/9`);
  console.error(`- 收集渠道：${sources.join(', ') || '无'}`);
  console.error(`- 建议：${suggestions.join('；') || '无'}`);
  
  // 保存审查报告
  const report = {
    date: date,
    score,
    stats,
    sources,
    suggestions,
    total: score
  };
  const reportPath = path.join(ROOT, 'data/latest-evolution-review.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.error(`\n💾 审查报告已保存到 ${reportPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
