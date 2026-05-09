/**
 * Mermaid 批量检查脚本
 * 
 * 检查所有博客和知识库文章中的 Mermaid 图表块，找出会导致渲染失败的问题：
 * 1. 字面量 \n 字符（不是真正的换行符）
 * 2. 不支持的图表类型（如 timeline）
 * 3. graph TD 声明但内容包含非 graph 语法（title、年份: 等）
 * 4. 缺少闭合反引号
 * 5. 闭合反引号后缺少逗号分隔符
 * 6. mermaid 内容中包含 \\（双反斜杠，可能是转义错误）
 * 7. 空 mermaid 块
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// ─── 配置 ───
const DIRS = [
  'src/data/articles',
  'src/data/blogs',
];

// Mermaid v11 支持的图表类型（用于语法检查）
const VALID_TYPES = [
  'graph TD', 'graph LR', 'graph BT', 'graph RL',
  'flowchart TD', 'flowchart LR', 'flowchart BT', 'flowchart RL',
  'sequenceDiagram', 'classDiagram', 'classDiagram-v2',
  'stateDiagram', 'stateDiagram-v2',
  'erDiagram', 'gantt', 'pie', 'journey', 'gitgraph',
  'mindmap', 'quadrantChart', 'xychart-beta', 'sankey-beta',
  'c4Context', 'c4Container', 'c4Component', 'c4Dynamic',
];

interface Bug {
  file: string;
  line: number;
  type: string;
  severity: 'error' | 'warning';
  message: string;
  hash: string;
  snippet: string;
}

// ─── 工具函数 ───
function fileHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

function findAllTSFiles(dirs: string[]): string[] {
  const files: string[] = [];
  for (const dir of dirs) {
    const fullDir = path.resolve(dir);
    if (!fs.existsSync(fullDir)) continue;
    for (const file of fs.readdirSync(fullDir)) {
      if (file.endsWith('.ts')) {
        files.push(path.join(fullDir, file));
      }
    }
  }
  return files.sort();
}

// ─── 检查函数 ───
function checkMermaidBugs(filePath: string): Bug[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(process.cwd(), filePath);
  const bugs: Bug[] = [];
  const lines = content.split('\n');
  
  // 查找所有 mermaid: `...` 块
  // 格式1: mermaid: `...`（单行）
  // 格式2: mermaid: `\n...\n`（多行模板字符串）
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const mermaidMatch = line.match(/^(\s*)mermaid:\s*`(.*)$/);
    
    if (mermaidMatch) {
      const indent = mermaidMatch[1];
      const firstLine = mermaidMatch[2];
      const startLine = i + 1; // 1-based
      
      // 检查是否是单行闭合：mermaid: `xxx`
      if (firstLine.endsWith('`') && !firstLine.endsWith('\\`')) {
        // 检查闭合反引号后面是否有逗号（或行尾）
        const trimmed = firstLine.trim();
        if (trimmed.endsWith('`')) {
          const afterBacktick = trimmed.slice(trimmed.lastIndexOf('`') + 1).trim();
          if (afterBacktick && afterBacktick !== ',' && afterBacktick !== '`,') {
            bugs.push({
              file: relPath,
              line: startLine,
              type: 'MISSING_COMMA_AFTER_BACKTICK',
              severity: 'error',
              message: '闭合反引号后缺少逗号分隔符',
              hash: '',
              snippet: line.slice(0, 100),
            });
          }
        }
        
        // 检查单行 mermaid 块的问题
        const mermaidContent = firstLine.slice(0, firstLine.lastIndexOf('`'));
        checkMermaidContent(relPath, startLine, mermaidContent, bugs);
        
        i++;
        continue;
      }
      
      // 多行 mermaid 块：找到闭合反引号
      const mermaidLines: string[] = [];
      if (firstLine) mermaidLines.push(firstLine);
      
      let j = i + 1;
      let foundClose = false;
      while (j < lines.length) {
        const l = lines[j];
        // 检查是否以 ` 结尾（且不是 \`）
        if (l.trim().endsWith('`') && !l.trim().endsWith('\\`')) {
          // 去掉最后的反引号
          const lastContent = l.slice(0, l.lastIndexOf('`'));
          if (lastContent.trim()) mermaidLines.push(lastContent);
          foundClose = true;
          break;
        }
        mermaidLines.push(l);
        j++;
      }
      
      const endLine = j + 1; // 1-based
      const fullContent = mermaidLines.join('\n');
      
      if (!foundClose) {
        bugs.push({
          file: relPath,
          line: startLine,
          type: 'UNCLOSED_BACKTICK',
          severity: 'error',
          message: `Mermaid 块缺少闭合反引号（从第 ${startLine} 行开始）`,
          hash: '',
          snippet: `${startLine}-${endLine}`,
        });
        i = j;
        continue;
      }
      
      // 检查闭合反引号后面的内容
      const afterLine = lines[j];
      const afterBacktick = afterLine.slice(afterLine.lastIndexOf('`') + 1).trim();
      if (afterBacktick && afterBacktick !== ',' && afterBacktick !== '`,') {
        bugs.push({
          file: relPath,
          line: endLine,
          type: 'MISSING_COMMA_AFTER_BACKTICK',
          severity: 'error',
          message: `闭合反引号后有非法字符: "${afterBacktick.slice(0, 30)}"` ,
          hash: '',
          snippet: afterLine.slice(0, 100),
        });
      }
      
      // 检查多行 mermaid 内容
      checkMermaidContent(relPath, startLine, fullContent, bugs);
      
      i = j + 1;
    } else {
      // 额外检查：扫描整行是否有字面量 \n（在 mermaid 块内部可能出现）
      if (line.includes('\\n') && line.includes('mermaid')) {
        bugs.push({
          file: relPath,
          line: i + 1,
          type: 'LITERAL_NEWLINE_ESCAPE',
          severity: 'error',
          message: '检测到字面量 \\n 字符（应为真正换行符）',
          hash: '',
          snippet: line.slice(0, 120),
        });
      }
      i++;
    }
  }
  
  // 计算每个 bug 的 hash
  for (const bug of bugs) {
    bug.hash = fileHash(`${bug.file}:${bug.line}:${bug.type}:${bug.message}`);
  }
  
  return bugs;
}

function checkMermaidContent(file: string, line: number, content: string, bugs: Bug[]) {
  const firstLine = content.split('\n')[0].trim();
  
  // 1. 检查空内容
  if (!content.trim()) {
    bugs.push({
      file,
      line,
      type: 'EMPTY_MERMAID',
      severity: 'warning',
      message: 'Mermaid 块为空',
      hash: '',
      snippet: '(empty)',
    });
    return;
  }
  
  // 2. 检查字面量 \n 字符
  if (content.includes('\\n')) {
    bugs.push({
      file,
      line,
      type: 'LITERAL_NEWLINE_ESCAPE',
      severity: 'error',
      message: `Mermaid 内容中包含 ${content.split('\\n').length - 1} 个字面量 \\n 字符`,
      hash: '',
      snippet: content.slice(0, 80),
    });
  }
  
  // 3. 检查双反斜杠
  if (content.includes('\\\\')) {
    bugs.push({
      file,
      line,
      type: 'DOUBLE_BACKSLASH',
      severity: 'warning',
      message: 'Mermaid 内容中包含 \\\\（双反斜杠），可能是转义错误',
      hash: '',
      snippet: content.slice(0, 80),
    });
  }
  
  // 4. 检查图表类型声明
  const typeMatch = firstLine.match(/^(graph|flowchart|sequenceDiagram|classDiagram|classDiagram-v2|stateDiagram|stateDiagram-v2|erDiagram|gantt|pie|journey|gitgraph|mindmap|quadrantChart|xychart-beta|sankey-beta|c4Context|c4Container|c4Component|c4Dynamic|timeline)(\s+(TD|LR|BT|RL))?/);
  
  if (typeMatch) {
    const declaredType = typeMatch[1] + (typeMatch[2] ? typeMatch[2] : '');
    
    // 检查 timeline（不被项目校验支持）
    if (declaredType === 'timeline') {
      bugs.push({
        file,
        line,
        type: 'UNSUPPORTED_TYPE',
        severity: 'error',
        message: `使用了不支持的图表类型: timeline（项目校验仅支持 graph TD/LR 等）`,
        hash: '',
        snippet: firstLine.slice(0, 80),
      });
    }
    
    // 检查 graph TD 声明但内容包含非 graph 语法
    if (declaredType.startsWith('graph ') || declaredType.startsWith('flowchart ')) {
      const contentLines = content.split('\n');
      for (const cl of contentLines) {
        const trimmed = cl.trim();
        // title 关键字只在 mindmap/gantt 等中有效，graph 中不合法
        if (trimmed.startsWith('title ') && !trimmed.includes(':')) {
          bugs.push({
            file,
            line,
            type: 'INVALID_GRAPH_TITLE',
            severity: 'error',
            message: `graph/flowchart 中使用了 title 声明（应使用 subgraph 或注释）`,
            hash: '',
            snippet: trimmed.slice(0, 80),
          });
          break;
        }
        // 检查类似 "2023 Q1 : xxx" 的 timeline 语法混入 graph
        if (/^\d{4}\s+Q[1-4]\s*:/.test(trimmed)) {
          bugs.push({
            file,
            line,
            type: 'TIMELINE_SYNTAX_IN_GRAPH',
            severity: 'error',
            message: `graph/flowchart 中混入了 timeline 语法（如 "${trimmed.slice(0, 30)}"）`,
            hash: '',
            snippet: trimmed.slice(0, 80),
          });
          break;
        }
      }
    }
  } else {
    // 无法识别的声明
    if (!content.trim().startsWith('//') && content.trim().length > 5) {
      bugs.push({
        file,
        line,
        type: 'UNKNOWN_DECLARATION',
        severity: 'warning',
        message: `无法识别 Mermaid 声明: "${firstLine.slice(0, 40)}"`,
        hash: '',
        snippet: firstLine.slice(0, 80),
      });
    }
  }
}

// ─── 主流程 ───
function main() {
  console.log('🔍 Mermaid 批量检查启动...\n');
  
  const files = findAllTSFiles(DIRS);
  console.log(`📂 扫描 ${files.length} 个文件\n`);
  
  const allBugs: Bug[] = [];
  
  for (const file of files) {
    try {
      const bugs = checkMermaidBugs(file);
      allBugs.push(...bugs);
    } catch (e: any) {
      console.error(`❌ 检查失败: ${file} - ${e.message}`);
    }
  }
  
  // 按严重程度排序
  allBugs.sort((a, b) => {
    if (a.severity === 'error' && b.severity !== 'error') return -1;
    if (a.severity !== 'error' && b.severity === 'error') return 1;
    return a.file.localeCompare(b.file);
  });
  
  // 统计
  const errorCount = allBugs.filter(b => b.severity === 'error').length;
  const warningCount = allBugs.filter(b => b.severity === 'warning').length;
  const affectedFiles = new Set(allBugs.map(b => b.file)).size;
  
  console.log(`📊 检查完成: ${allBugs.length} 个问题（${errorCount} 个错误, ${warningCount} 个警告）`);
  console.log(`📁 影响 ${affectedFiles} 个文件\n`);
  
  if (allBugs.length === 0) {
    console.log('✅ 所有 Mermaid 图表正常！');
    return;
  }
  
  // 输出详情
  for (let idx = 0; idx < allBugs.length; idx++) {
    const bug = allBugs[idx];
    const icon = bug.severity === 'error' ? '❌' : '⚠️';
    console.log(`${icon} [${idx + 1}] ${bug.file}:${bug.line}`);
    console.log(`   类型: ${bug.type}`);
    console.log(`   信息: ${bug.message}`);
    console.log(`   Hash: ${bug.hash}`);
    console.log(`   代码: ${bug.snippet}`);
    console.log('');
  }
  
  // 生成修复报告 JSON
  const reportPath = path.resolve('scripts/mermaid-bug-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    total: allBugs.length,
    errors: errorCount,
    warnings: warningCount,
    affectedFiles,
    bugs: allBugs,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📋 修复报告已保存: ${reportPath}`);
}

main();
