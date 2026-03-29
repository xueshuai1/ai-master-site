#!/usr/bin/env node

/**
 * 数据迁移脚本：将 MD 文件转换为结构化 JSON 格式
 * 
 * 使用方法：
 * node scripts/migrate-to-structured.js [questions|knowledge] [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const QUESTIONS_DIR = path.join(__dirname, '..', 'questions');
const KNOWLEDGE_BASE_DIR = path.join(__dirname, '..', '..', 'ai-knowledge-base');
const OUTPUT_QUESTIONS_DIR = path.join(__dirname, '..', 'data', 'questions');
const OUTPUT_KNOWLEDGE_DIR = path.join(__dirname, '..', 'data', 'knowledge');

// 解析 frontmatter
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = {};
  
  if (frontmatterMatch) {
    const lines = frontmatterMatch[1].split('\n');
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        let value = valueParts.join(':').trim();
        
        // 处理数组
        if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
        }
        // 处理带引号的字符串
        if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        frontmatter[key.trim()] = value;
      }
    }
  }
  
  return frontmatter;
}

// 提取正文内容
function extractBody(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
}

// 解析 Markdown 章节
function parseSections(content) {
  const sections = [];
  const lines = content.split('\n');
  let currentSection = null;
  let currentContent = [];
  
  for (const line of lines) {
    const headingMatch = line.match(/^(#{2,})\s+(.+)$/);
    
    if (headingMatch) {
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        sections.push(currentSection);
      }
      
      currentSection = {
        title: headingMatch[2],
        level: headingMatch[1].length - 1,
        content: ''
      };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  
  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
    sections.push(currentSection);
  }
  
  return sections;
}

// 提取代码块
function extractCodeBlocks(content) {
  const codeBlocks = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    });
  }
  
  return codeBlocks;
}

// 提取考察重点
function extractEvaluation(content) {
  const evalMatch = content.match(/## 考察重点[\s\S]*?(?=## |$)/);
  if (!evalMatch) return null;
  
  const evalContent = evalMatch[0];
  const knowledge = evalContent.match(/\*\*知识：\*\*\s*(.+)/)?.[1] || '';
  const ability = evalContent.match(/\*\*能力：\*\*\s*(.+)/)?.[1] || '';
  const thinking = evalContent.match(/\*\*思维：\*\*\s*(.+)/)?.[1] || '';
  
  return { knowledge, ability, thinking };
}

// 提取延伸追问
function extractFollowUpQuestions(content) {
  const followUpMatch = content.match(/## 延伸追问[\s\S]*?(?=## |$)/);
  if (!followUpMatch) return [];
  
  const followUpContent = followUpMatch[0];
  const questions = [];
  
  // 匹配 numbered questions
  const questionRegex = /(\d+)\.\s*(.+?)(?:\n|$)/g;
  let match;
  
  while ((match = questionRegex.exec(followUpContent)) !== null) {
    questions.push({
      question: match[2].trim(),
      points: 5, // 默认 5 分
      answerHint: ''
    });
  }
  
  return questions;
}

// 迁移面试题
function migrateQuestions(dryRun = false) {
  console.log('📝 开始迁移面试题...\n');
  
  if (!fs.existsSync(QUESTIONS_DIR)) {
    console.log('❌ 题目目录不存在:', QUESTIONS_DIR);
    return;
  }
  
  const categories = fs.readdirSync(QUESTIONS_DIR);
  let totalMigrated = 0;
  
  for (const category of categories) {
    const categoryDir = path.join(QUESTIONS_DIR, category);
    
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    
    const outputCategoryDir = path.join(OUTPUT_QUESTIONS_DIR, category);
    if (!dryRun && !fs.existsSync(outputCategoryDir)) {
      fs.mkdirSync(outputCategoryDir, { recursive: true });
    }
    
    const files = fs.readdirSync(categoryDir);
    let categoryCount = 0;
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(categoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = parseFrontmatter(content);
      const body = extractBody(content);
      const sections = parseSections(body);
      const codeBlocks = extractCodeBlocks(body);
      const evaluation = extractEvaluation(body);
      const followUpQuestions = extractFollowUpQuestions(body);
      
      // 构建结构化数据
      const structuredData = {
        id: file.replace('.md', ''),
        title: frontmatter.title || file.replace('.md', '').replace(/^[^-]+-/, ''),
        category: frontmatter.category || category,
        difficulty: frontmatter.difficulty || '⭐⭐',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        source: frontmatter.source || '',
        sourceUrl: frontmatter.sourceUrl || '',
        collectedAt: frontmatter.collectedAt || new Date().toISOString().split('T')[0],
        description: sections[0]?.content || body.slice(0, 500),
        requirements: [],
        answer: {
          summary: sections[0]?.content?.slice(0, 200) || '',
          coreFormula: codeBlocks[0]?.code || '',
          sections: sections.map((section, index) => ({
            title: section.title,
            content: section.content,
            code: codeBlocks[index] ? {
              language: codeBlocks[index].language,
              code: codeBlocks[index].code
            } : undefined
          }))
        },
        evaluation: evaluation || {
          knowledge: '',
          ability: '',
          thinking: ''
        },
        followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : [],
        version: {
          number: 'v1.0',
          updatedAt: new Date().toISOString(),
          changeLog: '从 MD 文件迁移'
        }
      };
      
      if (dryRun) {
        console.log(`  [DRY RUN] ${category}/${file} → ${structuredData.id}.json`);
      } else {
        const outputPath = path.join(outputCategoryDir, `${structuredData.id}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(structuredData, null, 2), 'utf-8');
        console.log(`  ✅ ${category}/${file} → ${structuredData.id}.json`);
      }
      
      categoryCount++;
      totalMigrated++;
    }
    
    if (categoryCount > 0) {
      console.log(`  📊 ${category}: ${categoryCount} 道题\n`);
    }
  }
  
  console.log(`\n✅ 面试题迁移完成！共迁移 ${totalMigrated} 道题\n`);
}

// 迁移知识库
function migrateKnowledge(dryRun = false) {
  console.log('📚 开始迁移知识库...\n');
  
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    console.log('❌ 知识库目录不存在:', KNOWLEDGE_BASE_DIR);
    return;
  }
  
  const categories = fs.readdirSync(KNOWLEDGE_BASE_DIR);
  let totalMigrated = 0;
  
  for (const category of categories) {
    const categoryDir = path.join(KNOWLEDGE_BASE_DIR, category);
    
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    
    const outputCategoryDir = path.join(OUTPUT_KNOWLEDGE_DIR, category);
    if (!dryRun && !fs.existsSync(outputCategoryDir)) {
      fs.mkdirSync(outputCategoryDir, { recursive: true });
    }
    
    const files = fs.readdirSync(categoryDir);
    let categoryCount = 0;
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(categoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = parseFrontmatter(content);
      const body = extractBody(content);
      const sections = parseSections(body);
      
      // 估算阅读时长
      const wordCount = content.length / 3;
      const readTime = Math.ceil(wordCount / 300);
      
      // 构建结构化数据
      const structuredData = {
        id: file.replace('.md', ''),
        title: frontmatter.title || file.replace('.md', ''),
        category: frontmatter.category || category,
        difficulty: frontmatter.difficulty || '⭐⭐',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        author: frontmatter.author || 'AI 面试题库',
        createdAt: frontmatter.createdAt || new Date().toISOString(),
        updatedAt: frontmatter.updatedAt || new Date().toISOString(),
        readTime,
        abstract: body.slice(0, 500).replace(/[#*`]/g, '') + '...',
        sections: sections.map((section, index) => ({
          id: `sec-${index + 1}`,
          title: section.title,
          level: section.level,
          content: section.content
        })),
        keyTakeaways: [],
        prerequisites: [],
        relatedArticles: [],
        version: 'v1.0'
      };
      
      if (dryRun) {
        console.log(`  [DRY RUN] ${category}/${file} → ${structuredData.id}.json`);
      } else {
        const outputPath = path.join(outputCategoryDir, `${structuredData.id}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(structuredData, null, 2), 'utf-8');
        console.log(`  ✅ ${category}/${file} → ${structuredData.id}.json`);
      }
      
      categoryCount++;
      totalMigrated++;
    }
    
    if (categoryCount > 0) {
      console.log(`  📊 ${category}: ${categoryCount} 篇文章\n`);
    }
  }
  
  console.log(`\n✅ 知识库迁移完成！共迁移 ${totalMigrated} 篇文章\n`);
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'both';
  const dryRun = args.includes('--dry-run');
  
  if (dryRun) {
    console.log('🔍 干运行模式：不会实际写入文件\n');
  }
  
  if (type === 'questions' || type === 'both') {
    migrateQuestions(dryRun);
  }
  
  if (type === 'knowledge' || type === 'both') {
    migrateKnowledge(dryRun);
  }
  
  console.log('🎉 迁移完成！');
  console.log('\n📁 输出目录:');
  console.log(`   面试题：${OUTPUT_QUESTIONS_DIR}`);
  console.log(`   知识库：${OUTPUT_KNOWLEDGE_DIR}`);
  console.log('\n💡 提示：原始 MD 文件已保留，可安全删除或归档。');
}

main();
