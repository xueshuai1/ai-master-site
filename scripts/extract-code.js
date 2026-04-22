#!/usr/bin/env node
// Extract code blocks from article body fields into section.code arrays
const fs = require('fs');

const file = process.argv[2];
if (!file) { console.error('Usage: node extract-code.js <file>'); process.exit(1); }

let raw = fs.readFileSync(file, 'utf-8');
const origLen = raw.length;

// Step 1: Find all code blocks
const codeBlockRe = /\\`\\`\\`(\w*)\n([\s\S]*?)\\`\\`\\`/g;
const allBlocks = [];
let m;
while ((m = codeBlockRe.exec(raw)) !== null) {
  allBlocks.push({
    lang: m[1] || 'text',
    code: m[2],
    idx: m.index,
    len: m[0].length,
  });
}
console.log(`Found ${allBlocks.length} code blocks`);

// Step 2: Find all body: ` positions
const bodyStartRe = /body:\s*`/g;
const bodyPositions = [];
let bm;
while ((bm = bodyStartRe.exec(raw)) !== null) {
  const backtickPos = bm.index + bm[0].length - 1;
  bodyPositions.push(backtickPos);
}
console.log(`Found ${bodyPositions.length} body fields`);

// Step 3: For each body, find content boundaries
// The body content is between opening ` and closing `
// The closing ` is followed by optional whitespace then , or }
const sections = [];
for (const backtickPos of bodyPositions) {
  let p = backtickPos + 1;
  while (p < raw.length) {
    if (raw[p] === '\\' && raw[p + 1] === '`') {
      p += 2;
      continue;
    }
    if (raw[p] === '`') {
      // Check if followed by , or } (possibly with whitespace between)
      let q = p + 1;
      while (q < raw.length && /\s/.test(raw[q])) q++;
      if (q < raw.length && (raw[q] === ',' || raw[q] === '}')) {
        sections.push({
          contentStart: backtickPos + 1,
          contentEnd: p,
          closeBacktick: p,
          closeCommaOrBrace: q,
        });
        break;
      }
    }
    p++;
  }
}
console.log(`Parsed ${sections.length} sections`);

// Step 4: Assign code blocks to sections
for (const block of allBlocks) {
  const blockEnd = block.idx + block.len;
  for (let si = 0; si < sections.length; si++) {
    if (block.idx >= sections[si].contentStart && blockEnd <= sections[si].contentEnd) {
      if (!sections[si].blocks) sections[si].blocks = [];
      sections[si].blocks.push(block);
      break;
    }
  }
}

for (let si = 0; si < sections.length; si++) {
  const before = raw.substring(Math.max(0, sections[si].contentStart - 400), sections[si].contentStart);
  const tm = before.match(/title:\s*"([^"]*)"/);
  const title = tm ? tm[1] : '?';
  const bCount = (sections[si].blocks || []).length;
  console.log(`  [${si}] "${title}": ${bCount} code blocks`);
}

// Step 5: Transform sections from end to start
let totalExtracted = 0;
for (let si = sections.length - 1; si >= 0; si--) {
  const sec = sections[si];
  if (!sec.blocks || sec.blocks.length === 0) continue;
  
  const blocks = [...sec.blocks].sort((a, b) => a.idx - b.idx);
  
  // Step 5a: Remove code blocks from body content
  let bodyContent = raw.substring(sec.contentStart, sec.contentEnd);
  for (let bi = blocks.length - 1; bi >= 0; bi--) {
    const block = blocks[bi];
    const relStart = block.idx - sec.contentStart;
    const relEnd = relStart + block.len;
    
    let replacement = '';
    if (block.lang === 'text' && (block.code.includes('┌') || block.code.includes('──') || block.code.includes('│'))) {
      replacement = '结构如下：';
    } else if (block.lang === 'text') {
      replacement = '流程如下：';
    } else if (block.lang === 'bash') {
      replacement = 'bash 代码如下：';
    } else if (block.lang === 'yaml') {
      replacement = 'yaml 代码如下：';
    } else if (block.lang === 'json') {
      replacement = 'json 代码如下：';
    } else {
      replacement = `${block.lang} 代码如下：`;
    }
    
    bodyContent = bodyContent.substring(0, relStart) + replacement + bodyContent.substring(relEnd);
  }
  
  // Step 5b: Build code array
  const codeArrayParts = blocks.map(b => {
    const escaped = b.code.replace(/`/g, '\\`');
    return `    {\n      lang: "${b.lang}",\n      code: \`${escaped}\`,\n    }`;
  });
  const codeField = `,\n      code: [\n${codeArrayParts.join(',\n')}\n      ]`;
  
  // Step 5c: Reconstruct file
  const oldBodyLen = sec.contentEnd - sec.contentStart;
  const newBodyLen = bodyContent.length;
  const delta = newBodyLen - oldBodyLen;
  
  // Replace body content
  raw = raw.substring(0, sec.contentStart) + bodyContent + raw.substring(sec.contentEnd);
  
  // Insert code field at the position after the closing backtick
  // closeBacktick was at sec.closeBacktick, after replacement it's at sec.closeBacktick + delta
  // Insert the codeField right after the backtick (replacing the whitespace and ,/} with codeField)
  const insertPos = sec.closeBacktick + delta;
  raw = raw.substring(0, insertPos) + codeField + raw.substring(insertPos);
  
  totalExtracted += blocks.length;
  console.log(`  Section [${si}]: extracted ${blocks.length} code blocks`);
}

// Step 6: Verify
const remainingBlocks = (raw.match(/\\`\\`\\`\w*\n[\s\S]*?\\`\\`\\`/g) || []).length;
console.log(`\nRemaining code blocks in file: ${remainingBlocks}`);

// Step 7: Write
fs.writeFileSync(file, raw);
const change = raw.length - origLen;
console.log(`File size: ${origLen} -> ${raw.length} (${change > 0 ? '+' : ''}${change} bytes)`);
console.log(`Total extracted: ${totalExtracted} code blocks`);
