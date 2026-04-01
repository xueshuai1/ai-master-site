const fs = require('fs');
const path = require('path');

const ML_DIR = path.join(__dirname, '..', 'content', 'knowledge', 'ML');

const files = fs.readdirSync(ML_DIR).filter(f => f.endsWith('.mdx'));

for (const file of files) {
  const filePath = path.join(ML_DIR, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 检查是否已有摘要
  if (content.includes('**摘要**:')) {
    console.log(`✅ ${file} - 已有摘要`);
    continue;
  }
  
  // 解析 frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) continue;
  
  const frontmatter = {};
  const lines = frontmatterMatch[1].split('\n');
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim();
      if (value.startsWith('[') || value.startsWith("'")) {
        value = value.slice(1, -1);
      }
      frontmatter[key.trim()] = value;
    }
  }
  
  // 从正文第一段提取摘要
  const body = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  const firstParaMatch = body.match(/^##\s*\d*\.\s*概述\s*\n\n([\s\S]+?)(?:\n\n|##|$)/);
  
  let summary = '';
  if (firstParaMatch) {
    summary = firstParaMatch[1].replace(/[#*`\n]/g, '').trim().slice(0, 150) + '...';
  } else {
    summary = body.replace(/[#*`\n>]/g, '').trim().slice(0, 150) + '...';
  }
  
  // 在 frontmatter 后添加摘要
  const summaryLine = `\n**摘要**: ${summary}\n`;
  const newContent = content.replace(/^---\n[\s\S]*?\n---\n/, match => match + summaryLine);
  
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`✅ ${file} - 添加摘要`);
}

console.log('\n完成！');
