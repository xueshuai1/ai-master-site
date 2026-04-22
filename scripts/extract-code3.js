/**
 * Extract code blocks from body fields in article TS files.
 * Usage: node extract-code3.js <input> <output>
 */
const fs = require('fs');
const inFile = process.argv[2];
const outFile = process.argv[3];
const src = fs.readFileSync(inFile, 'utf8');

// Parse the content array to find section objects
function parseSections(src) {
  const cs = src.indexOf('content: [');
  if (cs < 0) throw new Error('no content array');
  const prefix = src.slice(0, cs + 'content: '.length);
  
  // Find matching ] with proper tracking of template literals and strings
  let d = 0, inTpl = false, inStr = false, strC = '', esc = false, ce = -1;
  for (let i = cs + 'content: ['.length; i < src.length; i++) {
    const c = src[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { 
      if (i+1 < src.length && src[i+1] === '`') { esc = true; continue; }
      esc = true; continue; 
    }
    if (c === '`' && !inStr) { inTpl = !inTpl; continue; }
    if (!inTpl && (c === '"' || c === "'")) {
      if (!inStr) { inStr = true; strC = c; }
      else if (c === strC) inStr = false;
      continue;
    }
    if (inTpl || inStr) continue;
    if (c === '[') d++;
    else if (c === ']') { d--; if (d === 0) { ce = i; break; } }
  }
  if (ce < 0) throw new Error('no content end');
  const suffix = src.slice(ce);
  const inner = src.slice(cs + 'content: ['.length, ce);
  
  // Extract top-level section objects
  const sections = [];
  let sd = 0, ss = -1;
  inTpl = false; inStr = false; esc = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') {
      if (i+1 < inner.length && inner[i+1] === '`') { esc = true; continue; }
      esc = true; continue;
    }
    if (c === '`' && !inStr) { inTpl = !inTpl; continue; }
    if (!inTpl && (c === '"' || c === "'")) {
      if (!inStr) { inStr = true; strC = c; }
      else if (c === strC) inStr = false;
      continue;
    }
    if (inTpl || inStr) continue;
    if (c === '{') { if (sd === 0) ss = i; sd++; }
    else if (c === '}') { sd--; if (sd === 0 && ss >= 0) { sections.push(inner.slice(ss, i+1)); ss = -1; } }
  }
  return { prefix, sections, suffix };
}

function findTplEnd(t, s) {
  let esc = false;
  for (let i = s + 1; i < t.length; i++) {
    if (esc) { esc = false; continue; }
    if (t[i] === '\\') {
      if (i+1 < t.length && t[i+1] === '`') { esc = true; continue; }
      esc = true; continue;
    }
    if (t[i] === '`') return i;
  }
  return -1;
}

function extractBlocks(body) {
  const blocks = [];
  const re = /\\\`\\\`\\\`(\w*)\n([\s\S]*?)\\\`\\\`\\\`/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    blocks.push({ lang: m[1]||'text', code: m[2], s: m.index, e: m.index + m[0].length });
  }
  return blocks;
}

function processSection(st) {
  // Find body: `
  const bm = st.match(/(,\s*)body:\s*`/);
  if (!bm) {
    // Try without comma (first field)
    const bm2 = st.match(/^(\s*)body:\s*`/m);
    if (!bm2) return { t: st, n: 0 };
    return processBody(st, bm2.index + bm2[0].length, bm2.index);
  }
  const bs = bm.index + bm[0].length;
  return processBody(st, bs, bm.index);
}

function processBody(st, bodyStart, fieldIdx) {
  const bodyEnd = findTplEnd(st, bodyStart - 1);
  if (bodyEnd < 0) return { t: st, n: 0 };
  
  const before = st.slice(0, bodyStart);
  const body = st.slice(bodyStart, bodyEnd);
  const after = st.slice(bodyEnd);
  
  const blocks = extractBlocks(body);
  if (blocks.length === 0) return { t: st, n: 0 };
  
  // Remove blocks from body (reverse order)
  let newBody = body;
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    let s = b.s, e = b.e;
    // Remove up to 2 leading newlines
    if (s > 0 && newBody[s-1] === '\n') { s--; if (s > 0 && newBody[s-1] === '\n') s--; }
    // Remove trailing newlines
    while (e < newBody.length && newBody[e] === '\n') e++;
    newBody = newBody.slice(0, s) + newBody.slice(e);
  }
  newBody = newBody.replace(/\n{3,}/g, '\n\n').trimEnd();
  
  // Build code array
  const items = blocks.map(b => {
    const safe = b.code.replace(/`/g, '\\`');
    return `    {\n      lang: "${b.lang}",\n      code: \`${safe}\`,\n    }`;
  }).join(',\n');
  const codeArr = `\n    code: [\n${items},\n    ]`;
  
  // Insert after body: ` + code array + after
  const newSec = before + newBody + '`' + ',' + codeArr + after;
  return { t: newSec, n: blocks.length };
}

// Main
const { prefix, sections, suffix } = parseSections(src);
let total = 0;
const newSecs = sections.map((s, i) => {
  const r = processSection(s);
  total += r.n;
  if (r.n > 0) console.error(`  Sec ${i+1}: ${r.n} blocks`);
  return r.t;
});
console.error(`Total: ${total} blocks`);

const out = prefix + '\n    ' + newSecs.join(',\n    ') + '\n  ' + suffix;
fs.writeFileSync(outFile, out);
console.error(`Written: ${outFile}`);
