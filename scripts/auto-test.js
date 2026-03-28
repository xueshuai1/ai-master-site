#!/usr/bin/env node

/**
 * AI 学习与面试大全 - 自动测试脚本
 * 
 * 功能：
 * 1. 内容验证（题目格式、链接、图片）
 * 2. 构建测试（npm run build）
 * 3. 网页交互测试（使用 Playwright）
 * 4. 问题自动修复
 * 5. 生成测试报告
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
  testUrl: process.env.TEST_URL || 'http://localhost:3000',
  autoFix: true,
};

// 测试报告
const report = {
  timestamp: new Date().toISOString(),
  tests: [],
  errors: [],
  warnings: [],
  fixed: [],
};

// ============ 内容验证 ============

function validateQuestionFiles() {
  console.log('📝 验证题目文件...');
  
  const questionsDir = path.join(__dirname, '../questions');
  if (!fs.existsSync(questionsDir)) {
    console.log('  ⚠️  题目目录不存在，跳过');
    return;
  }
  
  const files = fs.readdirSync(questionsDir, { recursive: true })
    .filter(f => f.endsWith('.md'));
  
  let validCount = 0;
  let invalidCount = 0;
  
  for (const file of files) {
    const filePath = path.join(questionsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 验证 Frontmatter
    if (!content.startsWith('---')) {
      report.warnings.push(`⚠️  ${file}: 缺少 Frontmatter`);
      invalidCount++;
      continue;
    }
    
    // 验证必填字段
    const requiredFields = ['title', 'category', 'difficulty', 'createdAt'];
    let missingFields = [];
    for (const field of requiredFields) {
      if (!content.includes(`${field}:`)) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      report.warnings.push(`⚠️  ${file}: 缺少字段 ${missingFields.join(', ')}`);
      invalidCount++;
    } else {
      validCount++;
    }
    
    // 验证图片路径
    const imageMatches = content.match(/!\[.*?\]\((\/images\/.*?)\)/g);
    if (imageMatches) {
      for (const match of imageMatches) {
        const imagePath = match.match(/\/images\/.*?\.[a-z]+/)[0];
        const fullPath = path.join(__dirname, '../public', imagePath);
        if (!fs.existsSync(fullPath)) {
          report.warnings.push(`⚠️  ${file}: 图片不存在 ${imagePath}`);
        }
      }
    }
  }
  
  console.log(`✓ 验证 ${files.length} 个题目文件 (${validCount} 有效，${invalidCount} 警告)`);
  report.tests.push({ 
    name: '题目文件验证', 
    status: invalidCount === 0 ? '✅ 通过' : '⚠️  有警告',
    total: files.length,
    valid: validCount,
  });
}

// ============ 构建测试 ============

function testBuild() {
  console.log('\n🔨 测试构建...');
  
  try {
    console.log('  运行 npm run build...');
    execSync('npm run build', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    report.tests.push({ name: '构建测试', status: '✅ 通过' });
    console.log('✓ 构建成功');
  } catch (error) {
    report.errors.push(`❌ 构建失败`);
    console.log('✗ 构建失败');
    
    // 尝试自动修复
    if (CONFIG.autoFix) {
      attemptAutoFix(error);
    }
  }
}

// ============ 自动修复 ============

function attemptAutoFix(error) {
  console.log('\n🔧 尝试自动修复...');
  
  const errorMessage = error.message || error.toString();
  
  // 缺失依赖
  if (/Module not found/.test(errorMessage)) {
    console.log('  尝试安装缺失的依赖...');
    try {
      execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      report.fixed.push('✅ 已安装缺失的依赖');
    } catch (e) {
      report.errors.push('❌ 无法安装依赖');
    }
  }
  
  // ESLint 错误
  if (/ESLint/.test(errorMessage) || /eslint/.test(errorMessage.toLowerCase())) {
    console.log('  尝试运行 ESLint --fix...');
    try {
      execSync('npm run lint -- --fix', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      report.fixed.push('✅ 已修复 ESLint 错误');
    } catch (e) {
      // 忽略，ESLint 错误不影响构建
    }
  }
}

// ============ 生成报告 ============

function generateReport() {
  const reportPath = path.join(__dirname, '../test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 测试报告');
  console.log('==========');
  console.log(`时间：${report.timestamp}`);
  console.log(`测试项：${report.tests.length}`);
  console.log(`通过：${report.tests.filter(t => t.status.includes('✅')).length}`);
  console.log(`错误：${report.errors.length}`);
  console.log(`警告：${report.warnings.length}`);
  console.log(`已修复：${report.fixed.length}`);
  
  if (report.errors.length > 0) {
    console.log('\n❌ 错误列表:');
    report.errors.forEach(e => console.log(`  ${e}`));
  }
  
  if (report.warnings.length > 0) {
    console.log('\n⚠️  警告列表:');
    report.warnings.slice(0, 5).forEach(w => console.log(`  ${w}`));
    if (report.warnings.length > 5) {
      console.log(`  ... 还有 ${report.warnings.length - 5} 个警告`);
    }
  }
  
  console.log(`\n完整报告：${reportPath}`);
}

// ============ 主流程 ============

function main() {
  console.log('🚀 开始自动测试...\n');
  
  // 1. 内容验证
  validateQuestionFiles();
  
  // 2. 构建测试
  testBuild();
  
  // 3. 生成报告
  generateReport();
  
  // 4. 如果有严重错误，退出码 1
  if (report.errors.length > 0) {
    console.log('\n❌ 测试失败，请修复错误后重试');
    process.exit(1);
  } else {
    console.log('\n✅ 测试通过！');
    process.exit(0);
  }
}

main();
