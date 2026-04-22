import fs from 'fs';

// ESC = \`\`\` (backslash + backtick, 3 times) — 6 chars
// This is how markdown code blocks appear inside template strings in .ts source files
const ESC = String.fromCharCode(92, 96, 92, 96, 92, 96);

const files = process.argv.slice(2);

for (const file of files) {
  console.log(`\n=== ${file} ===`);
  const content = fs.readFileSync(file, 'utf8');
  const result = processFile(content);
  if (result.changed) {
    fs.writeFileSync(file, result.content, 'utf8');
    console.log(`  → ${result.count} code blocks extracted`);
  } else {
    console.log(`  → no changes`);
  }
}

function processFile(src) {
  const L = src.split('\n');
  const out = [];
  let changed = false;
  let count = 0;

  for (let i = 0; i < L.length; i++) {
    const line = L[i];
    // Detect "body: `" start
    const bm = line.match(/^(\s+)(body: `)(.*)$/s);
    if (!bm) { out.push(line); continue; }

    const indent = bm[1];
    const afterBt = bm[3];

    // Collect body lines until unescaped closing backtick
    const parts = afterBt ? [afterBt] : [];
    let j = i + 1;
    while (j < L.length) {
      const cp = findCloseBt(L[j]);
      if (cp >= 0) {
        if (cp > 0) parts.push(L[j].substring(0, cp));
        j++;
        break;
      }
      parts.push(L[j]);
      j++;
    }

    const body = parts.join('\n');
    const { text, blocks } = stripBlocks(body);

    if (blocks.length > 0) {
      changed = true;
      count += blocks.length;

      // Emit body: `cleanedBody`
      const bLines = text.split('\n');
      out.push(`${indent}body: \`${bLines[0]}`);
      for (let k = 1; k < bLines.length; k++) out.push(bLines[k]);

      // Ensure last line ends with `,
      let lastIdx = out.length - 1;
      let last = out[lastIdx];
      if (last.trimEnd().endsWith('`')) {
        out[lastIdx] = last + ',';
      } else {
        out[lastIdx] = last + '`,';
      }

      // Peek ahead: skip blank/indented lines, check for existing code field
      let k = j;
      const followLines = [];
      while (k < L.length) {
        const fl = L[k];
        if (fl.trim() === '' || fl.startsWith(indent + '  ') || fl.startsWith(indent + '\t')) {
          followLines.push(fl);
          k++;
        } else {
          break;
        }
      }

      const hasCode = followLines.some(fl => fl.trim().startsWith('code:'));

      if (!hasCode && blocks.length > 0) {
        out.push(`${indent}code: [`);
        for (const b of blocks) {
          const lang = b.lang || 'text';
          const escaped = b.code.replace(/`/g, '\\`');
          out.push(`${indent}  {`);
          out.push(`${indent}    lang: "${lang}",`);
          out.push(`${indent}    code: \`${escaped}\`,`);
          out.push(`${indent}  },`);
        }
        out.push(`${indent}],`);
      }

      for (const fl of followLines) out.push(fl);
      i = k - 1;
    } else {
      for (let x = i; x < j; x++) out.push(L[x]);
      i = j - 1;
    }
  }

  return { content: out.join('\n'), changed, count };
}

function findCloseBt(line) {
  const BT = String.fromCharCode(96);
  const BS = String.fromCharCode(92);
  for (let i = 0; i < line.length; i++) {
    if (line[i] === BT) {
      let sc = 0, p = i - 1;
      while (p >= 0 && line[p] === BS) { sc++; p--; }
      if (sc % 2 === 0) return i;
    }
  }
  return -1;
}

function stripBlocks(text) {
  const blocks = [];
  let out = '';
  let pos = 0;
  const BT = String.fromCharCode(96);
  const COMMA = String.fromCharCode(44);

  while (pos < text.length) {
    const idx = text.indexOf(ESC, pos);
    if (idx < 0) { out += text.slice(pos); break; }

    out += text.slice(pos, idx);
    const openEnd = idx + 6;

    let nl = text.indexOf('\n', openEnd);
    let lang, codeStart;
    if (nl < 0) {
      lang = 'text';
      codeStart = openEnd;
    } else {
      lang = text.substring(openEnd, nl).trim() || 'text';
      codeStart = nl + 1;
    }

    const closeIdx = text.indexOf(ESC, codeStart);
    if (closeIdx < 0) {
      blocks.push({ lang, code: text.slice(codeStart).trimEnd() });
      break;
    }

    blocks.push({ lang, code: text.substring(codeStart, closeIdx).trimEnd() });

    pos = closeIdx + 6;
    while (pos < text.length && text[pos] === BT) pos++;
    if (pos < text.length && text[pos] === COMMA) pos++;
  }

  return { text: out, blocks };
}
