/**
 * Process a single article file: extract code blocks from body fields into code arrays.
 * Outputs the corrected file to stdout. Stderr for progress messages.
 * 
 * Usage: node extract-code2.js <input-file>
 */

const fs = require('fs');
const inputPath = process.argv[2];
const content = fs.readFileSync(inputPath, 'utf-8');

// Find content: [...] boundaries
const contentStartIdx = content.indexOf('content: [');
if (contentStartIdx === -1) { process.exit(1); }

const afterContentStart = contentStartIdx + 'content: ['.length;
const prefix = content.substring(0, afterContentStart);

// Find matching ]
let depth = 0, contentEndIdx = -1, inTpl = false, inStr = false, strCh = '', esc = false;
for (let i = afterContentStart; i < content.length; i++) {
  const ch = content[i];
  if (esc) { esc = false; continue; }
  if (ch === '\\') { esc = true; continue; }
  if (ch === '`' && !inStr) { inTpl = !inTpl; continue; }
  if (!inTpl && (ch === '"' || ch === "'")) {
    if (!inStr) { inStr = true; strCh = ch; }
    else if (ch === strCh) inStr = false;
    continue;
  }
  if (inTpl || inStr) continue;
  if (ch === '[') depth++;
  else if (ch === ']') { depth--; if (depth === 0) { contentEndIdx = i; break; } }
}

if (contentEndIdx === -1) { process.exit(1); }
const suffix = content.substring(contentEndIdx);
const contentInner = content.substring(afterContentStart, contentEndIdx);

// Extract sections by finding top-level { } objects
const sections = [];
let secDepth = 0, secStart = -1;
inTpl = false; inStr = false; esc = false;
for (let i = 0; i < contentInner.length; i++) {
  const ch = contentInner[i];
  if (esc) { esc = false; continue; }
  if (ch === '\\') { esc = true; continue; }
  if (ch === '`' && !inStr) { inTpl = !inTpl; continue; }
  if (!inTpl && (ch === '"' || ch === "'")) {
    if (!inStr) { inStr = true; strCh = ch; }
    else if (ch === strCh) inStr = false;
    continue;
  }
  if (inTpl || inStr) continue;
  if (ch === '{') { if (secDepth === 0) secStart = i; secDepth++; }
  else if (ch === '}') { secDepth--; if (secDepth === 0 && secStart >= 0) {
    sections.push(contentInner.substring(secStart, i + 1));
    secStart = -1;
  }}
}

console.error(`Found ${sections.length} sections`);

function findTplEnd(text, tplStart) {
  // text[tplStart] is the opening `
  let esc = false;
  for (let i = tplStart + 1; i < text.length; i++) {
    if (esc) { esc = false; continue; }
    if (text[i] === '\\') {
      if (i + 1 < text.length && text[i + 1] === '`') { esc = true; continue; }
      esc = true; continue;
    }
    if (text[i] === '`') return i;
  }
  return -1;
}

function findMatchingBracket(text, openIdx) {
  let d = 1;
  for (let i = openIdx + 1; i < text.length; i++) {
    if (text[i] === '[') d++;
    else if (text[i] === ']') { d--; if (d === 0) return i; }
  }
  return -1;
}

function processSection(secText) {
  // Find "body: `"
  const bodyMatch = secText.match(/,\s*body:\s*`/);
  if (!bodyMatch) {
    const bodyMatch2 = secText.match(/^(\s*)body:\s*`/m);
    if (!bodyMatch2) return { text: secText, count: 0 };
    // body at start - find it
    const idx = secText.indexOf('body: `');
    if (idx === -1) return { text: secText, count: 0 };
    return processBody(secText, idx + 'body: `'.length, idx);
  }
  const bodyStart = bodyMatch.index + bodyMatch[0].length;
  return processBody(secText, bodyStart, bodyMatch.index);
}

function processBody(secText, bodyStart, fieldStart) {
  const bodyEnd = findTplEnd(secText, bodyStart - 1);
  if (bodyEnd === -1) return { text: secText, count: 0 };
  
  const beforeBody = secText.substring(0, bodyStart);
  const bodyContent = secText.substring(bodyStart, bodyEnd);
  const afterBody = secText.substring(bodyEnd); // starts with `,`
  
  // Find all \`\`\`...\`\`\` code blocks
  const codeBlocks = [];
  const regex = /\\\`\\\`\\\`(\w*)\n([\s\S]*?)\\\`\\\`\\\`/g;
  let match;
  while ((match = regex.exec(bodyContent)) !== null) {
    codeBlocks.push({
      lang: match[1] || 'text',
      code: match[2],
      fullStart: match.index,
      fullEnd: match.index + match[0].length,
    });
  }
  
  if (codeBlocks.length === 0) return { text: secText, count: 0 };
  
  // Remove code blocks from body (reverse order to preserve indices)
  let newBody = bodyContent;
  for (let i = codeBlocks.length - 1; i >= 0; i--) {
    const cb = codeBlocks[i];
    let start = cb.fullStart;
    let end = cb.fullEnd;
    
    // Remove exactly one leading newline (or \n\n) before code block
    // but don't go past a non-whitespace character
    if (start > 0 && newBody[start - 1] === '\n') {
      start--;
      if (start > 0 && newBody[start - 1] === '\n') start--;
    }
    
    // Remove exactly trailing newline(s) after code block
    while (end < newBody.length && newBody[end] === '\n') end++;
    
    newBody = newBody.substring(0, start) + newBody.substring(end);
  }
  
  // Clean up: collapse 3+ newlines to 2
  newBody = newBody.replace(/\n{3,}/g, '\n\n').trimEnd();
  
  // Build code array string
  const codeItems = codeBlocks.map(cb => {
    const safeCode = cb.code.replace(/`/g, '\\`');
    return `    {\n      lang: "${cb.lang}",\n      code: \`${safeCode}\`,\n    }`;
  }).join(',\n');
  const codeArrayStr = `\n    code: [\n${codeItems},\n    ]`;
  
  // Insert code array after body, before afterBody
  // afterBody starts with `,` followed by more fields or just `,`
  const newSec = beforeBody + newBody + '`' + ',' + codeArrayStr + afterBody;
  
  return { text: newSec, count: codeBlocks.length };
}

// Process
let totalBlocks = 0;
const newSections = sections.map((sec, i) => {
  const result = processSection(sec);
  totalBlocks += result.count;
  if (result.count > 0) console.error(`  Section ${i + 1}: ${result.count} code blocks extracted`);
  return result.text;
});

console.error(`Total: ${totalBlocks} code blocks`);

// Reconstruct
const output = prefix + '\n    ' + newSections.join(',\n    ') + '\n  ' + suffix;
console.log(output);
