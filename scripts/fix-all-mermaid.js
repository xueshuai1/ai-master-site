const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');

// WCAG contrast calculation
function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function contrastRatio(c1, c2) {
  const l1 = relativeLuminance(...hexToRgb(c1));
  const l2 = relativeLuminance(...hexToRgb(c2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Dark theme default text color
const TEXT_COLOR = '#e2e8f0';

// Color replacement map (light → dark, keeping semantic meaning)
const LIGHT_TO_DARK = {
  '#e1f5fe': '#0c4a6e',  // sky-100 → sky-900
  '#e3f2fd': '#0c4a6e',  // blue-50  → sky-900
  '#bbdefb': '#1e3a5f',  // blue-100 → blue-900
  '#e0f2fe': '#0c4a6e',  // sky-50   → sky-900
  '#c8e6c9': '#14532d',  // green-100 → green-900
  '#ccffcc': '#14532d',  // light green → green-900
  '#e8f5e9': '#14532d',  // green-50 → green-900
  '#ffcdd2': '#7f1d1d',  // red-100  → red-900
  '#ffcccc': '#7f1d1d',  // light red → red-900
  '#fce4ec': '#881337',  // pink-50  → rose-900
  '#fff3e0': '#7c2d12',  // orange-50 → orange-900
  '#fff9c4': '#713f12',  // yellow-100 → yellow-900
  '#f3e5f5': '#581c87',  // purple-50 → purple-900
  '#e1bee7': '#581c87',  // purple-100 → purple-900
  '#ffe0b2': '#7c2d12',  // orange-100 → orange-900
  '#ffebee': '#7f1d1d',  // red-50   → red-900
  '#a5d6a7': '#14532d',  // green-200 → green-900
  '#fdcb6e': '#92400e',  // amber    → amber-800
  '#95e1d3': '#134e4a',  // teal     → teal-900
};

// Bright colors that need dark text when used as fill
const BRIGHT_NEEDS_DARK_TEXT = {
  '#ff6b6b': null,  // bright red → needs dark text
  '#51cf66': null,  // bright green → needs dark text
  '#339af0': null,  // bright blue → needs dark text
  '#ffd43b': null,  // bright yellow → needs dark text
  '#845ef7': null,  // bright purple → needs dark text
  '#ff922b': null,  // bright orange → needs dark text
  '#4ecdc4': null,  // bright teal → needs dark text
  '#4a9': '#14532d',  // shorthand green → can replace with dark green
  '#bbf': '#1e3a5f',  // shorthand light blue → dark blue
  '#bfb': '#14532d',  // shorthand light green → dark green
  '#dfd': '#14532d',  // shorthand very light green → dark green
  '#f9d': '#7c2d12',  // shorthand light orange → dark orange
  '#f9f': '#581c87',  // shorthand light purple → dark purple
  '#f66': '#7f1d1d',  // shorthand light red → dark red
  '#9f9': '#14532d',  // shorthand light green → dark green
  '#f99': '#7f1d1d',  // shorthand light red → dark red
  '#ff9': '#713f12',  // shorthand light yellow → dark yellow
  '#f88': '#7f1d1d',  // shorthand light red → dark red
  '#8f8': '#14532d',  // shorthand light green → dark green
  '#9f6': '#14532d',  // shorthand light lime → dark green
};

// Material Design colors (medium brightness) - need text color
const MATERIAL_MEDIUM = {
  '#4CAF50': { bg: '#14532d', text: '#f1f5f9' }, // green-500
  '#2196F3': { bg: '#1e3a5f', text: '#f1f5f9' }, // blue-500
  '#FF9800': { bg: '#7c2d12', text: '#f1f5f9' }, // orange-500
  '#F44336': { bg: '#7f1d1d', text: '#f1f5f9' }, // red-500
  '#9C27B0': { bg: '#581c87', text: '#f1f5f9' }, // purple-700
  '#FF5722': { bg: '#7c2d12', text: '#f1f5f9' }, // deep orange-500
};

function getAllFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else if (entry.name.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

const allFiles = getAllFiles(DATA_DIR);

// Analysis
let totalIssues = 0;
const allReplacements = [];

for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(DATA_DIR, filePath);
  let fileChanges = 0;

  // Fix 1: Replace light colors with dark equivalents
  for (const [light, dark] of Object.entries(LIGHT_TO_DARK)) {
    const escapedLight = light.replace('#', '\\#');
    const regex = new RegExp(`fill:${escapedLight}(?![a-z0-9-])`, 'gi');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, `fill:${dark}`);
      fileChanges += matches.length;
      totalIssues += matches.length;
    }
  }

  // Fix 2: Replace shorthand colors with full dark colors
  for (const [short, replacement] of Object.entries(BRIGHT_NEEDS_DARK_TEXT)) {
    if (replacement) {
      const escapedShort = short.replace('#', '\\#');
      const regex = new RegExp(`fill:${escapedShort}(?![a-z0-9-])`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, `fill:${replacement}`);
        fileChanges += matches.length;
        totalIssues += matches.length;
      }
    }
  }

  // Fix 3: Bright colors that can't be replaced need color:#1e293b (dark text)
  const brightNoReplace = {
    '#ff6b6b': '#1e293b',
    '#51cf66': '#1e293b',
    '#339af0': '#1e293b',
    '#ffd43b': '#1e293b',
    '#845ef7': '#1e293b',
    '#ff922b': '#1e293b',
    '#4ecdc4': '#1e293b',
    '#ff6b35': '#1e293b',
    '#45b7d1': '#1e293b',
    '#74c0fc': '#1e293b',
    '#69db7c': '#1e293b',
    '#f59e0b': '#1e293b',  // amber-500 on dark bg needs dark text
    '#10b981': '#1e293b',  // emerald-500
    '#3b82f6': '#1e293b',  // blue-500
    '#8b5cf6': '#1e293b',  // violet-500
    '#ef4444': '#1e293b',  // red-500
    '#6366f1': '#1e293b',  // indigo-500
    '#fbbf24': '#1e293b',  // amber-400
    '#34d399': '#1e293b',  // emerald-400
    '#f87171': '#1e293b',  // red-400
    '#818cf8': '#1e293b',  // indigo-400
    '#4ade80': '#1e293b',  // green-400
    '#60a5fa': '#1e293b',  // blue-400
    '#a3e635': '#1e293b',  // lime-400
    '#eab308': '#1e293b',  // yellow-500
    '#facc15': '#1e293b',  // yellow-400
    '#f97316': '#1e293b',  // orange-500
    '#fb923c': '#1e293b',  // orange-400
    '#f44336': '#1e293b',  // red-500 material
    '#f87171': '#1e293b',  // red-400
    '#991b1b': '#1e293b',  // red-800 - borderline
    '#dc2626': '#1e293b',  // red-600
    '#ef4444': '#1e293b',  // red-500
    '#f87171': '#1e293b',  // red-400
    '#991b1b': '#1e293b',  // red-800
  };

  for (const [color, textColor] of Object.entries(brightNoReplace)) {
    const escapedColor = color.replace('#', '\\#');
    // Only fix if there's no color: directive already
    const regex = new RegExp(`fill:${escapedColor}(?!\\s*,[^,]*color:)([^,]*?)(?:,|$)`, 'g');
    const matches = content.match(regex);
    if (matches) {
      for (const match of matches) {
        const suffix = match.replace(`fill:${color}`, '');
        if (!suffix.includes('color:')) {
          content = content.replace(match, `fill:${color},color:${textColor}`);
          fileChanges++;
          totalIssues++;
        }
      }
    }
  }

  // Fix 4: Medium Material colors → dark equivalents
  for (const [color, { bg, text }] of Object.entries(MATERIAL_MEDIUM)) {
    const escapedColor = color.replace('#', '\\#');
    const regex = new RegExp(`fill:${escapedColor}(?![a-z0-9-])`, 'g');
    const matches = content.match(regex);
    if (matches) {
      // Check if already has color directive
      for (const match of matches) {
        const lineMatch = content.match(new RegExp(`fill:${escapedColor}[^\\n]*`));
        if (lineMatch && lineMatch[0].includes('color:')) continue;
        content = content.replace(match, `fill:${bg},color:${text}`);
        fileChanges++;
        totalIssues++;
      }
    }
  }

  // Fix 5: #eee fill (very light gray) → dark
  const grayRegex = /fill:#eee(?![a-z0-9-])/g;
  const grayMatches = content.match(grayRegex);
  if (grayMatches) {
    content = content.replace(grayRegex, 'fill:#374151');
    fileChanges += grayMatches.length;
    totalIssues += grayMatches.length;
  }

  // Fix 6: #E0E0E0 → dark
  const gray2Regex = /fill:#E0E0E0(?![a-z0-9-])/g;
  const gray2Matches = content.match(gray2Regex);
  if (gray2Matches) {
    content = content.replace(gray2Regex, 'fill:#374151');
    fileChanges += gray2Matches.length;
    totalIssues += gray2Matches.length;
  }

  // Fix 7: #9E9E9E → dark
  const gray3Regex = /fill:#9E9E9E(?![a-z0-9-])/g;
  const gray3Matches = content.match(gray3Regex);
  if (gray3Matches) {
    content = content.replace(gray3Regex, 'fill:#374151');
    fileChanges += gray3Matches.length;
    totalIssues += gray3Matches.length;
  }

  // Fix 8: #90EE90 (light green) → dark
  const lgRegex = /fill:#90EE90(?![a-z0-9-])/g;
  const lgMatches = content.match(lgRegex);
  if (lgMatches) {
    content = content.replace(lgRegex, 'fill:#14532d');
    fileChanges += lgMatches.length;
    totalIssues += lgMatches.length;
  }

  // Fix 9: #FFD700 (gold) → dark text
  const goldRegex = /fill:#FFD700(?![^,]*color:)/g;
  const goldMatches = content.match(goldRegex);
  if (goldMatches) {
    content = content.replace(/fill:#FFD700/g, 'fill:#FFD700,color:#1e293b');
    fileChanges += goldMatches.length;
    totalIssues += goldMatches.length;
  }

  // Fix 10: #ff9900 → dark text
  const foRegex = /fill:#ff9900(?![^,]*color:)/g;
  const foMatches = content.match(foRegex);
  if (foMatches) {
    content = content.replace(/fill:#ff9900/g, 'fill:#ff9900,color:#1e293b');
    fileChanges += foMatches.length;
    totalIssues += foMatches.length;
  }

  // Fix 11: #ffd93d → dark text
  const fdRegex = /fill:#ffd93d(?![^,]*color:)/g;
  const fdMatches = content.match(fdRegex);
  if (fdMatches) {
    content = content.replace(/fill:#ffd93d/g, 'fill:#ffd93d,color:#1e293b');
    fileChanges += fdMatches.length;
    totalIssues += fdMatches.length;
  }

  // Fix 12: #6bcb77 → dark text
  const gcRegex = /fill:#6bcb77(?![^,]*color:)/g;
  const gcMatches = content.match(gcRegex);
  if (gcMatches) {
    content = content.replace(/fill:#6bcb77/g, 'fill:#6bcb77,color:#1e293b');
    fileChanges += gcMatches.length;
    totalIssues += gcMatches.length;
  }

  // Fix 13: #4d96ff → dark text
  const bdRegex = /fill:#4d96ff(?![^,]*color:)/g;
  const bdMatches = content.match(bdRegex);
  if (bdMatches) {
    content = content.replace(/fill:#4d96ff/g, 'fill:#4d96ff,color:#1e293b');
    fileChanges += bdMatches.length;
    totalIssues += bdMatches.length;
  }

  // Fix 14: #ff9999, #99ff99 → dark equivalents
  content = content.replace(/fill:#ff9999(?![a-z0-9-])/g, 'fill:#7f1d1d');
  content = content.replace(/fill:#99ff99(?![a-z0-9-])/g, 'fill:#14532d');

  // Fix 15: #ff6b35 → dark text
  content = content.replace(/fill:#ff6b35(?![^,]*color:)/g, 'fill:#ff6b35,color:#1e293b');

  // Fix 16: #45b7d1 → dark text
  content = content.replace(/fill:#45b7d1(?![^,]*color:)/g, 'fill:#45b7d1,color:#1e293b');

  // Fix 17: #74c0fc → dark text
  content = content.replace(/fill:#74c0fc(?![^,]*color:)/g, 'fill:#74c0fc,color:#1e293b');

  // Fix 18: #69db7c → dark text
  content = content.replace(/fill:#69db7c(?![^,]*color:)/g, 'fill:#69db7c,color:#1e293b');

  // Fix 19: #e1f5ff (almost white blue) → dark
  content = content.replace(/fill:#e1f5ff(?![a-z0-9-])/gi, 'fill:#0c4a6e');

  // Fix 20: #34d399 (emerald-400) → dark text
  content = content.replace(/fill:#34d399(?![^,]*color:)/g, 'fill:#34d399,color:#1e293b');

  // Fix 21: #f87171 (red-400) → dark text
  content = content.replace(/fill:#f87171(?![^,]*color:)/g, 'fill:#f87171,color:#1e293b');

  // Fix 22: #ffa94d (orange) → dark text
  content = content.replace(/fill:#ffa94d(?![^,]*color:)/g, 'fill:#ffa94d,color:#1e293b');

  // Fix 23: #f0ad4e (bootstrap warning) → dark text
  content = content.replace(/fill:#f0ad4e(?![^,]*color:)/g, 'fill:#f0ad4e,color:#1e293b');

  // Fix 24: #5cb85c (bootstrap success) → dark text
  content = content.replace(/fill:#5cb85c(?![^,]*color:)/g, 'fill:#5cb85c,color:#1e293b');

  // Fix 25: #4cae4c → dark text
  content = content.replace(/fill:#4cae4c(?![^,]*color:)/g, 'fill:#4cae4c,color:#1e293b');

  // Fix 26: #ec971f → dark text
  content = content.replace(/fill:#ec971f(?![^,]*color:)/g, 'fill:#ec971f,color:#1e293b');

  // Fix 27: #00b894 → dark text
  content = content.replace(/fill:#00b894(?![^,]*color:)/g, 'fill:#00b894,color:#1e293b');

  // Fix 28: #fd79a8 → dark text
  content = content.replace(/fill:#fd79a8(?![^,]*color:)/g, 'fill:#fd79a8,color:#1e293b');

  // Fix 29: #a8a8a8 (gray) → dark
  content = content.replace(/fill:#a8a8a8(?![a-z0-9-])/g, 'fill:#374151');

  // Fix 30: #ff4444 → dark text
  content = content.replace(/fill:#ff4444(?![^,]*color:)/g, 'fill:#ff4444,color:#1e293b');

  // Fix 31: #ff8800 → dark text
  content = content.replace(/fill:#ff8800(?![^,]*color:)/g, 'fill:#ff8800,color:#1e293b');

  // Fix 32: #ffcc00 → dark text
  content = content.replace(/fill:#ffcc00(?![^,]*color:)/g, 'fill:#ffcc00,color:#1e293b');

  // Fix 33: #44cc44 → dark text
  content = content.replace(/fill:#44cc44(?![^,]*color:)/g, 'fill:#44cc44,color:#1e293b');

  // Fix 34: #fecaca (red-100) → dark red
  content = content.replace(/fill:#fecaca(?![a-z0-9-])/g, 'fill:#7f1d1d');

  // Fix 35: #f90 (orange shorthand) → dark text
  content = content.replace(/fill:#f90(?![^,]*color:)/g, 'fill:#f90,color:#1e293b');

  // Fix 36: #f96 (orange shorthand) → dark equivalent
  content = content.replace(/fill:#f96(?![^,]*color:)/g, 'fill:#c2410c');

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${relPath}: ${fileChanges} 处`);
  }
}

console.log(`\n🎨 共修复 ${totalIssues} 处配色问题`);
