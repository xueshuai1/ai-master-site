#!/usr/bin/env node
/**
 * 自主 UX 巡检脚本
 * 
 * 检查项:
 * 1. Mermaid 图表配色对比度 (P0)
 * 2. 事件冒泡问题 (P1)
 * 3. 移动端按钮可见性 (P2)
 * 4. 无障碍 aria-label (P3)
 * 5. 图片 alt 缺失 (P2)
 * 6. console.log 残留 (P3)
 * 
 * 运行: node scripts/ux-audit.js
 * 输出: reports/latest-ux-audit.md
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../src');
const DATA = path.join(__dirname, '../src/data');
const REPORT_DIR = path.join(__dirname, '../reports');
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

const issues = [];

function addIssue(severity, type, file, line, message, fix) {
  issues.push({ severity, type, file, line, message, fix });
}

// ========== 工具 ==========
function lum(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function cr(c1, c2) { const l1 = lum(...hexRgb(c1)), l2 = lum(...hexRgb(c2)); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }

function allFiles(dir, ext = '.ts') {
  let r = [];
  try { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) r = r.concat(allFiles(p, ext)); else if (e.name.endsWith(ext)) r.push(p); } } catch (e) {}
  return r;
}

// ========== 1. Mermaid 对比度 ==========
function checkMermaid() {
  for (const f of allFiles(DATA)) {
    const content = fs.readFileSync(f, 'utf8');
    const rel = path.relative(SRC, f);
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith('style ')) continue;
      const m = line.match(/fill:([#][0-9a-fA-F]+)/i);
      if (!m) continue;
      const fill = m[1];
      const cm = line.match(/color:([#][0-9a-fA-F]+)/i);
      const txt = cm ? cm[1] : '#e2e8f0';
      const ratio = cr(fill, txt);
      if (ratio < 4.5) addIssue('P0', 'mermaid-contrast', rel, i + 1, `fill:${fill} + color:${txt} → ${ratio.toFixed(1)}:1`, '深色背景或亮色文字');
    }
  }
}

// ========== 2. 事件冒泡 ==========
function checkBubble() {
  for (const f of allFiles(path.join(SRC, 'components'), '.tsx')) {
    const content = fs.readFileSync(f, 'utf8');
    const rel = path.relative(SRC, f);
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 全屏 modal 且未阻止冒泡
      if (line.includes('fixed inset-0') && line.includes('z-50') && line.includes('onClick') && !line.includes('e.target === e.currentTarget') && !line.includes('e.stopPropagation'))
        addIssue('P1', 'event-bubble', rel, i + 1, '全屏 modal onClick 未阻止冒泡', 'e.target === e.currentTarget');
    }
  }
}

// ========== 3. 移动端按钮 ==========
function checkMobileBtn() {
  for (const f of allFiles(path.join(SRC, 'components'), '.tsx')) {
    const content = fs.readFileSync(f, 'utf8');
    const rel = path.relative(SRC, f);
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 检查 button 行和 className 行（可能跨行）
      if (line.includes('handleZoom') && line.includes('<button')) {
        const nextLine = lines[i + 1] || '';
        if (!line.includes('hidden md:') && !nextLine.includes('hidden md:'))
          addIssue('P2', 'mobile-btn', rel, i + 1, '放大按钮移动端也显示', 'hidden md:inline-flex');
      }
    }
  }
}

// ========== 4. aria-label ==========
function checkAria() {
  for (const f of allFiles(path.join(SRC, 'components'), '.tsx')) {
    const content = fs.readFileSync(f, 'utf8');
    const rel = path.relative(SRC, f);
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('<button') && (line.includes('<svg') || (lines[i+1] || '').includes('<svg')) && !line.includes('aria-label') && !line.includes('title='))
        addIssue('P3', 'a11y', rel, i + 1, '图标按钮缺 aria-label', 'aria-label="..."');
    }
  }
}

// ========== 5. 图片 alt ==========
function checkAlt() {
  for (const f of allFiles(path.join(SRC, 'components'), '.tsx')) {
    const content = fs.readFileSync(f, 'utf8');
    const rel = path.relative(SRC, f);
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<img') && !lines[i].includes('alt='))
        addIssue('P2', 'img-alt', rel, i + 1, '图片缺 alt', '添加 alt');
    }
  }
}

// ========== 6. console.log ==========
function checkConsole() {
  for (const f of allFiles(path.join(SRC, 'components'), '.tsx')) {
    const content = fs.readFileSync(f, 'utf8');
    const rel = path.relative(SRC, f);
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().includes('console.log') && !lines[i].includes('//'))
        addIssue('P3', 'console', rel, i + 1, 'console.log 残留', '移除');
    }
  }
}

// ========== 运行 ==========
console.log('🔍 UX 巡检...\n');
checkMermaid();
checkBubble();
checkMobileBtn();
checkAria();
checkAlt();
checkConsole();

// 统计
const sev = { P0: 0, P1: 0, P2: 0, P3: 0 };
issues.forEach(i => sev[i.severity]++);
const total = issues.length;

// 报告
const now = new Date();
const ts = now.toISOString().replace('T', ' ').slice(0, 19);
let report = `# 🔍 UX 巡检\n\n> ${ts}\n\n## ${total === 0 ? '✅ 全部通过' : `${total} 个问题`}\n\n`;
report += `P0=${sev.P0} P1=${sev.P1} P2=${sev.P2} P3=${sev.P3}\n\n`;
if (total > 0) {
  report += `## 详情\n\n`;
  issues.forEach((i, idx) => {
    const e = { P0: '🔴', P1: '🟠', P2: '🟡', P3: '🔵' }[i.severity];
    report += `${idx + 1}. ${e} **${i.type}** — \`${i.file}\`${i.line ? ':' + i.line : ''}\n`;
    report += `   - ${i.message}\n`;
    report += `   - 💡 ${i.fix}\n\n`;
  });
}

fs.writeFileSync(path.join(REPORT_DIR, `ux-audit-${now.toISOString().slice(0, 10)}.md`), report);
fs.writeFileSync(path.join(REPORT_DIR, 'latest-ux-audit.md'), report);

// 输出
if (total === 0) {
  console.log('✅ 全部通过');
} else {
  console.log(`${total} 个问题: P0=${sev.P0} P1=${sev.P1} P2=${sev.P2} P3=${sev.P3}\n`);
  issues.forEach((i, idx) => {
    const e = { P0: '🔴', P1: '🟠', P2: '🟡', P3: '🔵' }[i.severity];
    console.log(`${idx + 1}. ${e} [${i.severity}] ${i.type} — ${i.file}${i.line ? ':' + i.line : ''}`);
    console.log(`   ${i.message}`);
  });
  console.log(`\n📄 reports/latest-ux-audit.md`);
}

process.exit(total > 0 ? 1 : 0);
