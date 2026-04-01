const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.join(__dirname, '..', 'content', 'knowledge');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'knowledge-index.json');

const articles = [];

// 遍历所有分类目录
const categories = fs.readdirSync(KNOWLEDGE_DIR).filter(item => {
  const stat = fs.statSync(path.join(KNOWLEDGE_DIR, item));
  return stat.isDirectory();
});

for (const category of categories) {
  const categoryDir = path.join(KNOWLEDGE_DIR, category);
  const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.mdx'));
  
  for (const file of files) {
    const filePath = path.join(categoryDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 解析 frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) continue;
    
    const frontmatter = {};
    const lines = frontmatterMatch[1].split('\n');
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        let value = valueParts.join(':').trim();
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
        } else if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        frontmatter[key.trim()] = value;
      }
    }
    
    // 解析摘要（第一行非空文本）
    const body = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    const summaryMatch = body.match(/^\*\*摘要\*\*:\s*(.+)/);
    let description = '';
    if (summaryMatch) {
      description = summaryMatch[1].trim();
    } else {
      // 如果没有摘要，取正文前 200 字
      description = body.replace(/[#*`\n]/g, '').trim().slice(0, 200) + '...';
    }
    
    // 解析难度
    const difficultyStr = frontmatter.difficulty || '';
    const starCount = (difficultyStr.match(/⭐/g) || []).length;
    const difficulty = starCount > 0 ? starCount : 3;
    
    // 估算阅读时间
    const wordCount = content.length / 3;
    const readTime = `${Math.ceil(wordCount / 300)}分钟`;
    
    const id = file.replace('.mdx', '');
    
    // 使用目录名作为主分类（CV、DL、LLM、ML）
    const mainCategory = category;
    
    articles.push({
      id,
      category: mainCategory,
      subCategory: frontmatter.category, // 子分类保留
      title: frontmatter.title || id,
      description,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      difficulty,
      readTime,
    });
  }
}

// 按分类和编号排序
articles.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.id.localeCompare(b.id);
});

const output = {
  articles,
  total: articles.length,
  lastUpdated: new Date().toISOString().split('T')[0],
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

console.log(`✅ 生成知识索引：${articles.length} 篇文章`);
console.log(`📁 输出文件：${OUTPUT_FILE}`);
console.log(`📊 分类统计:`);

const categoryCount = {};
for (const article of articles) {
  categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
}

for (const [category, count] of Object.entries(categoryCount)) {
  console.log(`   - ${category}: ${count} 篇`);
}
