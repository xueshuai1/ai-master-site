#!/usr/bin/env node
/**
 * ai-master.cc QA 测试脚本 — 轻量版
 * 复用 browser context，减少内存占用
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readdirSync, statSync, unlinkSync, readdir } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.argv[2] || 'https://www.ai-master.cc';
const REPORTS_DIR = join(__dirname, '..', 'reports');
const SCREENSHOT_DIR = join(REPORTS_DIR, 'screenshots');
const DATA_DIR = join(__dirname, '..', 'src', 'data');

const VIEWPORTS = {
  pc: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const PAGES = [
  { path: '/', name: '首页', priority: 'P0' },
  { path: '/knowledge', name: '知识库', priority: 'P0' },
  { path: '/blog', name: '博客', priority: 'P0' },
  { path: '/news', name: '新闻', priority: 'P0' },
  { path: '/tools', name: 'AI 工具', priority: 'P0' },
  { path: '/about', name: '关于', priority: 'P1' },
];

/**
 * 扫描最近修改的文章文件（按 mtime 排序，取最新的 N 个）
 * 用于 QA 时额外检查文章详情页
 */
async function getRecentArticlePages(maxArticles = 5) {
  const articles = [];
  
  // 扫描知识库文章
  try {
    const articleDir = join(DATA_DIR, 'articles');
    const files = readdirSync(articleDir).filter(f => f.endsWith('.ts'));
    const withMtime = files.map(f => ({
      file: f,
      mtime: statSync(join(articleDir, f)).mtimeMs,
      type: 'knowledge'
    }));
    articles.push(...withMtime);
  } catch(e) {}
  
  // 扫描博客文章
  try {
    const blogDir = join(DATA_DIR, 'blogs');
    const files = readdirSync(blogDir).filter(f => f.endsWith('.ts'));
    const withMtime = files.map(f => ({
      file: f,
      mtime: statSync(join(blogDir, f)).mtimeMs,
      type: 'blog'
    }));
    articles.push(...withMtime);
  } catch(e) {}
  
  // 按修改时间排序，取最新的 N 个
  articles.sort((a, b) => b.mtime - a.mtime);
  
  return articles.slice(0, maxArticles).map(a => {
    const id = a.file.replace('.ts', '');
    if (a.type === 'knowledge') {
      return { path: `/article/${id}`, name: `知识库: ${id}`, priority: 'P0' };
    } else {
      return { path: `/blog/${id}`, name: `博客: ${id}`, priority: 'P0' };
    }
  });
}

async function main() {
  console.log(`🔍 QA 测试: ${BASE_URL}`);
  
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  // 清理旧截图
  try {
    for (const f of readdirSync(SCREENSHOT_DIR)) {
      if (f.endsWith('.png')) {
        const fp = join(SCREENSHOT_DIR, f);
        if (Date.now() - statSync(fp).mtimeMs > 24 * 3600000) unlinkSync(fp);
      }
    }
  } catch(e) {}
  
  // 获取最近修改的文章页（额外检查）
  const recentArticles = await getRecentArticlePages(5);
  const allPages = [...PAGES, ...recentArticles];
  
  console.log(`📄 测试 ${PAGES.length} 个主页面 + ${recentArticles.length} 个文章页`);
  
  const browser = await chromium.launch({ headless: true });
  const results = { pages: [], issues: [], passed: 0 };
  
  for (const pg of allPages) {
    console.log(`  ${pg.name}...`);
    const r = await testPage(browser, pg);
    results.pages.push(r);
    results.issues.push(...r.issues);
    if (r.status === 'pass') results.passed++;
    // 强制 GC hint
    global.gc?.();
  }
  
  await browser.close();
  
  const report = buildReport(results, allPages.length);
  writeFileSync(join(REPORTS_DIR, 'latest-qa-report.md'), report);
  
  console.log(`✅ 报告: ${results.passed}/${allPages.length} 通过 | ${results.issues.length} 个问题`);
}

async function testPage(browser, { path, name }) {
  const url = path === '/' ? BASE_URL : BASE_URL + path;
  const result = { name, path, status: 'pass', screenshots: [], issues: [], loadTime: 0, jsErrors: [] };
  
  for (const [key, vp] of Object.entries(VIEWPORTS)) {
    const t0 = Date.now();
    try {
      const ctx = await browser.newContext({ viewport: vp });
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', e => errs.push(e.message.slice(0, 200)));
      page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
      
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
      result.loadTime = Date.now() - t0;
      
      if (resp.status() >= 400) {
        result.issues.push({ severity: 'P0', desc: `${key} HTTP ${resp.status()}` });
        result.status = 'fail';
      }
      
      const fname = `${name}-${key}.png`.replace(/\s+/g, '-');
      await page.screenshot({ path: join(SCREENSHOT_DIR, fname) });
      result.screenshots.push({ key, fname });
      
      // 移动端溢出
      if (key === 'mobile') {
        try {
          const w = await page.evaluate(() => document.documentElement.scrollWidth);
          if (w > vp.width + 5) {
            result.issues.push({ severity: 'P0', desc: `移动端溢出 ${w}px` });
            result.status = 'fail';
          }
        } catch(e) {}
      }
      
      result.jsErrors = errs.slice(0, 3);
      errs.slice(0, 2).forEach(e => result.issues.push({ severity: 'P1', desc: `JS: ${e}` }));
      
      await ctx.close();
    } catch (e) {
      result.issues.push({ severity: 'P0', desc: `${key} 加载失败: ${e.message.slice(0, 100)}` });
      result.status = 'fail';
      result.loadTime = Date.now() - t0;
    }
  }
  
  return result;
}

function buildReport(results, total) {
  const { pages, issues, passed } = results;
  const ts = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const p0 = issues.filter(i => i.severity === 'P0');
  const p1 = issues.filter(i => i.severity === 'P1');
  
  let md = `#  QA 测试报告\n\n`;
  md += `**测试时间**: ${ts}\n**测试环境**: ${BASE_URL}\n`;
  md += `**范围**: ${total} 页面 × 2 视口\n\n---\n\n`;
  md += `## 📊 总览\n\n| 指标 | 数值 |\n|------|------|\n`;
  md += `| 页面数 | ${total} |\n| 通过 | ${passed} |\n| 失败 | ${total - passed} |\n`;
  md += `| P0 | ${p0.length} | P1 | ${p1.length} |\n`;
  md += `| 通过率 | **${Math.round(passed / total * 100)}%** |\n\n---\n\n## 📄 页面详情\n\n`;
  
  for (const p of pages) {
    const ok = p.status === 'pass';
    md += `### ${ok ? '✅' : '❌'} ${p.name} (\`${p.path}\`)\n\n`;
    md += `加载: ${p.loadTime}ms | 问题: ${p.issues.length}\n\n`;
    md += `| 桌面端 | 移动端 |\n|---------|--------|\n`;
    const pc = p.screenshots.find(s => s.key === 'pc');
    const mob = p.screenshots.find(s => s.key === 'mobile');
    md += `| ![${pc?.fname || 'pc'}](${pc?.fname || ''}) | ![${mob?.fname || 'mobile'}](${mob?.fname || ''}) |\n\n`;
    if (p.issues.length) {
      md += `**问题**:\n`;
      for (const i of p.issues) {
        md += `- ${i.severity === 'P0' ? '🔴' : '🟡'} ${i.desc}\n`;
      }
      md += '\n';
    }
    md += `---\n\n`;
  }
  
  if (issues.length) {
    md += `## 📋 汇总\n\n| # | 页面 | 严重度 | 描述 |\n|---|------|--------|------|\n`;
    issues.forEach((i, idx) => { md += `| ${idx+1} | ${i.page || '-'} | ${i.severity} | ${i.desc} |\n`; });
  } else {
    md += `## ✅ 全部通过\n`;
  }
  
  return md;
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
