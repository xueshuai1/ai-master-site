#!/usr/bin/env node
// Extract code blocks from article body fields into section.code arrays
const fs = require('fs');

const files = process.argv.slice(2);
const totalStats = {};

for (const filePath of files) {
  console.log(`\n=== Processing ${filePath} ===`);
  let raw = fs.readFileSync(filePath, 'utf-8');
  
  // Match code blocks: \`\`\`lang\n...\`\`\`
  // In raw file, each backtick is escaped as \ + backtick
  const codeBlockRe = /\\`\\`\\`(\w*)\n([\s\S]*?)\\`\\`\\`/g;
  
  const blocks = [];
  let m;
  while ((m = codeBlockRe.exec(raw)) !== null) {
    blocks.push({
      full: m[0],
      lang: m[1] || 'text',
      code: m[2],
      idx: m.index,
      end: m.index + m[0].length,
    });
  }
  
  console.log(`Found ${blocks.length} code blocks`);
  
  if (blocks.length === 0) continue;
  
  // Find section bodies: locate each `body: ` then find its content
  // A body is: body: `...content...`
  // The closing backtick is an unescaped ` followed by , or }
  
  // Find all body: ` positions
  const bodyRe = /body:\s*`/g;
  const bodyStarts = [];
  let bm;
  while ((bm = bodyRe.exec(raw)) !== null) {
    // The backtick is at bm.index + bm[0].length - 1
    bodyStarts.push(bm.index + bm[0].length - 1);
  }
  
  console.log(`Found ${bodyStarts.length} body fields`);
  
  // For each body, find its closing backtick
  // Scan from position+1, skip \`, stop at unescaped `
  const sections = [];
  for (const startIdx of bodyStarts) {
    let p = startIdx + 1;
    while (p < raw.length) {
      if (raw[p] === '\\' && raw[p + 1] === '`') {
        p += 2;
        continue;
      }
      if (raw[p] === '`' && raw[p + 1] === ',') {
        // Found closing backtick
        sections.push({
          start: startIdx + 1, // content starts after opening backtick
          end: p, // content ends at closing backtick
        });
        break;
      }
      p++;
    }
  }
  
  // Assign code blocks to sections
  for (const block of blocks) {
    for (let si = 0; si < sections.length; si++) {
      if (block.idx >= sections[si].start && block.end <= sections[si].end) {
        if (!sections[si].blocks) sections[si].blocks = [];
        sections[si].blocks.push(block);
        block.si = si;
        break;
      }
    }
  }
  
  // Print section summary
  for (let si = 0; si < sections.length; si++) {
    // Find section title
    const before = raw.substring(Math.max(0, sections[si].start - 300), sections[si].start);
    const tm = before.match(/title:\s*"([^"]*)"/);
    const title = tm ? tm[1] : '?';
    const bCount = (sections[si].blocks || []).length;
    console.log(`  Section "${title}": ${bCount} code blocks`);
  }
  
  // Process sections from end to start (preserve indices)
  let totalExtracted = 0;
  for (let si = sections.length - 1; si >= 0; si--) {
    const sec = sections[si];
    if (!sec.blocks || sec.blocks.length === 0) continue;
    
    // Reverse blocks for removal (highest index first)
    const orderedBlocks = [...sec.blocks].sort((a, b) => a.idx - b.idx);
    
    // Build code array
    const codeEntries = orderedBlocks.map(b => {
      const escapedCode = b.code.replace(/`/g, '\\`');
      return `    {\n      lang: "${b.lang}",\n      code: \`${escapedCode}\`,\n    }`;
    });
    
    const codeArrayStr = codeEntries.join(',\n');
    const newCodeField = `,\n      code: [\n${codeArrayStr}\n      ]`;
    
    // Remove code blocks from body (from end to start to preserve indices)
    let newBody = raw.substring(sec.start, sec.end);
    let offsetAdjustment = 0;
    
    for (let bi = orderedBlocks.length - 1; bi >= 0; bi--) {
      const block = orderedBlocks[bi];
      const relStart = block.idx - sec.start;
      const relEnd = block.end - sec.start;
      
      // Determine replacement text
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
      
      newBody = newBody.substring(0, relStart) + replacement + newBody.substring(relEnd);
    }
    
    // Find position to insert code field: after body closing backtick
    // The body closing backtick position in the full raw string
    const bodyCloseIdx = sec.end; // position of closing backtick
    // We need to insert after `, (backtick + comma)
    const insertAfter = bodyCloseIdx + 2; // skip ` and ,
    
    // Calculate the new insert position accounting for body changes
    const bodyDelta = newBody.length - (sec.end - sec.start);
    const actualInsertPos = insertAfter + bodyDelta;
    
    // Reconstruct the file
    // The new body replaces raw[sec.start:sec.end]
    raw = raw.substring(0, sec.start) + newBody + raw.substring(sec.end);
    
    // Now insert the code field
    // After adjustment, the position after bodyCloseIdx+2 shifts by bodyDelta
    const finalInsertPos = insertAfter + bodyDelta;
    raw = raw.substring(0, finalInsertPos) + newCodeField + raw.substring(finalInsertPos);
    
    totalExtracted += orderedBlocks.length;
  }
  
  fs.writeFileSync(filePath, raw);
  console.log(`  -> Extracted ${totalExtracted} code blocks`);
  totalStats[filePath] = totalExtracted;
}

console.log('\n=== Summary ===');
let grandTotal = 0;
for (const [f, c] of Object.entries(totalStats)) {
  console.log(`  ${f}: ${c}`);
  grandTotal += c;
}
console.log(`  Total: ${grandTotal}`);
