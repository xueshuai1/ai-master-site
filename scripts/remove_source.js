#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const QUESTIONS_DIR = path.join(__dirname, '..', 'questions');

function removeSourceFromFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // 移除 frontmatter 中的 source 字段
  const frontmatterSourceRegex = /^source:\s*["'].*["']\s*$/gm;
  if (frontmatterSourceRegex.test(content)) {
    content = content.replace(frontmatterSourceRegex, '');
    modified = true;
  }
  
  // 移除 frontmatter 中的 sourceUrl 字段
  const frontmatterSourceUrlRegex = /^sourceUrl:\s*["'].*["']\s*$/gm;
  if (frontmatterSourceUrlRegex.test(content)) {
    content = content.replace(frontmatterSourceUrlRegex, '');
    modified = true;
  }
  
  // 移除内容中的"**来源：** xxx"行
  const contentSourceRegex = /^\*\*来源：\*\*\s*.+$/gm;
  if (contentSourceRegex.test(content)) {
    content = content.replace(contentSourceRegex, '');
    modified = true;
  }
  
  // 移除内容中的"来源：xxx"行（无粗体）
  const plainSourceRegex = /^来源：.+$ /gm;
  if (plainSourceRegex.test(content)) {
    content = content.replace(plainSourceRegex, '');
    modified = true;
  }
  
  // 清理多余的空行
  content = content.replace(/\n{3,}/g, '\n\n');
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

function processCategory(categoryDir) {
  const files = fs.readdirSync(categoryDir);
  let modifiedCount = 0;
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    const filePath = path.join(categoryDir, file);
    if (removeSourceFromFile(filePath)) {
      modifiedCount++;
      console.log(`✓ ${file}`);
    }
  }
  
  return modifiedCount;
}

function main() {
  console.log('开始清理题目文件中的来源信息...\n');
  
  const categories = fs.readdirSync(QUESTIONS_DIR);
  let totalModified = 0;
  
  for (const category of categories) {
    const categoryPath = path.join(QUESTIONS_DIR, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    
    console.log(`处理分类：${category}`);
    const modified = processCategory(categoryPath);
    totalModified += modified;
    console.log(`  修改了 ${modified} 个文件\n`);
  }
  
  console.log(`\n完成！共修改 ${totalModified} 个文件`);
}

main();
