#!/usr/bin/env node
/**
 * 生成 sitemap.xml 到 public/ 目录
 * 运行: node scripts/generate-sitemap.mjs
 */
import { readdirSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const baseUrl = 'https://www.ai-master.cc';
const today = new Date().toISOString().split('T')[0];

// 固定页面
const urls = [
  { loc: baseUrl, lastmod: today, changefreq: 'daily', priority: 1.0 },
  { loc: `${baseUrl}/knowledge`, lastmod: today, changefreq: 'weekly', priority: 0.9 },
  { loc: `${baseUrl}/blog`, lastmod: today, changefreq: 'weekly', priority: 0.9 },
  { loc: `${baseUrl}/news`, lastmod: today, changefreq: 'daily', priority: 0.8 },
  { loc: `${baseUrl}/tools`, lastmod: today, changefreq: 'weekly', priority: 0.8 },
  { loc: `${baseUrl}/about`, lastmod: today, changefreq: 'monthly', priority: 0.5 },
];

// 知识库文章
const articlesDir = join(projectRoot, 'src', 'data', 'articles');
if (existsSync(articlesDir)) {
  readdirSync(articlesDir).filter(f => f.endsWith('.ts')).forEach(f => {
    urls.push({ loc: `${baseUrl}/article/${f.replace('.ts', '')}`, lastmod: today, changefreq: 'weekly', priority: 0.7 });
  });
}

// 博客文章
const blogsDir = join(projectRoot, 'src', 'data', 'blogs');
if (existsSync(blogsDir)) {
  readdirSync(blogsDir).filter(f => f.startsWith('blog-') && f.endsWith('.ts')).forEach(f => {
    urls.push({ loc: `${baseUrl}/blog/${f.replace('.ts', '')}`, lastmod: today, changefreq: 'weekly', priority: 0.7 });
  });
}

// 新闻（最近 2 周）
const newsFile = join(projectRoot, 'src', 'data', 'news.ts');
if (existsSync(newsFile)) {
  const content = readFileSync(newsFile, 'utf-8');
  const ids = content.match(/id:\s*"(news-\d+)"/g) || [];
  const dates = content.match(/date:\s*"([^"]+)"/g) || [];
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i].match(/"(news-\d+)"/)?.[1];
    const dateStr = dates[i]?.match(/"([^"]+)"/)?.[1];
    if (id && dateStr) {
      const date = dateStr.split(' ')[0];
      if (new Date(date) >= twoWeeksAgo) {
        urls.push({ loc: `${baseUrl}/news/${id}`, lastmod: date, changefreq: 'daily', priority: 0.6 });
      }
    }
  }
}

// 生成 XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for (const u of urls) {
  xml += '<url>\n';
  xml += `<loc>${u.loc}</loc>\n`;
  xml += `<lastmod>${u.lastmod}</lastmod>\n`;
  xml += `<changefreq>${u.changefreq}</changefreq>\n`;
  xml += `<priority>${u.priority}</priority>\n`;
  xml += '</url>\n';
}
xml += '</urlset>\n';

const publicDir = join(projectRoot, 'public');
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, 'sitemap.xml'), xml, 'utf-8');

console.log(`✅ sitemap.xml 已生成: ${urls.length} 个 URL`);
