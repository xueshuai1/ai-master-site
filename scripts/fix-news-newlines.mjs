import { readFileSync, writeFileSync } from 'fs';

const file = 'src/data/news.ts';
let content = readFileSync(file, 'utf8');

// Strategy: find content strings (double-quoted) that span multiple lines
// and join them into single lines, preserving \n escape sequences

// Match lines that are part of a content string spanning multiple lines
// Pattern: content: " ... \n (literal newline continues the string)
const lines = content.split('\n');
const result = [];
let inMultilineContent = false;
let accumulatedLine = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (inMultilineContent) {
    // We're continuing a multiline content string
    if (line.trim().endsWith('",')) {
      // This is the last line of the content string
      accumulatedLine += line;
      result.push(accumulatedLine);
      accumulatedLine = '';
      inMultilineContent = false;
    } else if (line.trim() === '') {
      // Empty line - add \n
      accumulatedLine += '\\n';
    } else {
      // Continuation line - append with \n prefix
      accumulatedLine += '\\n' + line.trimStart();
    }
    continue;
  }
  
  // Check if this line starts a potentially multiline content string
  // Pattern: content: " ... (doesn't end with ", on same line)
  const contentMatch = line.match(/^(.*content:\s*")(.*)$/);
  if (contentMatch && !contentMatch[2].trimEnd().endsWith('",')) {
    // This might be a multiline string
    // But it could also be a backtick string which is fine
    if (contentMatch[1].trimEnd().endsWith('`')) {
      // Backtick string - fine as-is
      result.push(line);
      continue;
    }
    // Double-quoted string that doesn't end with ",
    inMultilineContent = true;
    accumulatedLine = line;
    continue;
  }
  
  result.push(line);
}

const fixed = result.join('\n');

if (fixed !== content) {
  writeFileSync(file, fixed, 'utf8');
  const diff = content.split('\n').length - fixed.split('\n').length;
  console.log(`✅ Fixed: removed ${diff} extra lines from multiline content strings`);
} else {
  console.log('✅ No multiline content strings found');
}
