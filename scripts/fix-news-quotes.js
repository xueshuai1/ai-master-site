const fs = require('fs');
let content = fs.readFileSync('src/data/news.ts', 'utf-8');

// Fix unescaped " inside content: "..." strings
// These are ASCII " (U+0022) inside double-quoted strings
// We need to escape them as \"

// Use a regex-based approach for single-line content strings
// Match: content: "..." (all on one line)
content = content.replace(/(content:\s*)"(.*?)"/g, (match, prefix, inner) => {
  // Escape unescaped " within the inner content
  // Don't escape \" (already escaped) or \n (escaped newline)
  let fixed = '';
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === '"' && (i === 0 || inner[i-1] !== '\\')) {
      fixed += '\\"';
    } else {
      fixed += inner[i];
    }
  }
  return prefix + '"' + fixed + '"';
});

fs.writeFileSync('src/data/news.ts', content);
console.log('Fixed');
