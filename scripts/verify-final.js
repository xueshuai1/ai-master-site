const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');

function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function contrastRatio(c1, c2) {
  const l1 = relativeLuminance(...hexToRgb(c1));
  const l2 = relativeLuminance(...hexToRgb(c2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const DEFAULT_TEXT = '#e2e8f0';
const MIN_CONTRAST = 4.5;

function getAllFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else if (entry.name.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

const allFiles = getAllFiles(DATA_DIR);
let totalIssues = 0;
let filesWithIssues = new Set();

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(DATA_DIR, filePath);
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('style ')) continue;

    const fillMatch = line.match(/fill:([#][0-9a-fA-F]+)/i);
    if (!fillMatch) continue;

    const fillColor = fillMatch[1];
    const colorMatch = line.match(/color:([#][0-9a-fA-F]+)/i);
    const textColor = colorMatch ? colorMatch[1] : DEFAULT_TEXT;
    const cr = contrastRatio(fillColor, textColor);

    if (cr < MIN_CONTRAST) {
      totalIssues++;
      filesWithIssues.add(relPath);
    }
  }
}

if (totalIssues === 0) {
  console.log('✅ 全部通过！零问题。');
} else {
  console.log(`❌ 还有 ${totalIssues} 处问题，${filesWithIssues.size} 个文件`);
}
