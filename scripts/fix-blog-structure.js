const fs = require('fs');
let content = fs.readFileSync('src/data/blogs/blog-141.ts', 'utf-8');

// Remove mermaid and charts from BlogPost level
// First find the end of content: content, line and remove everything after until the closing };
const contentMatch = content.match(/(content:\s*content,)\s*\n\s*mermaid:[\s\S]*?charts:[\s\S]*?\n\s*}\s*;\s*$/);
if (!contentMatch) {
  console.log('Pattern not found');
  process.exit(1);
}

const prefix = content.substring(0, contentMatch.index + contentMatch[1].length);
const closing = '\n};\n';

const newContent = prefix + closing;
fs.writeFileSync('src/data/blogs/blog-141.ts', newContent);
console.log('Removed mermaid/charts from BlogPost level');

// Now add mermaid to section 3 and table to section 4
let blog = fs.readFileSync('src/data/blogs/blog-141.ts', 'utf-8');

// Add mermaid to section 3 (格局重构) - find the warning line in section 3
const section3Warning = '竞争的本质从「模型独占」转向了「平台综合竞争力」';
const idx3 = blog.indexOf(section3Warning);
if (idx3 === -1) { console.log('Section 3 not found'); process.exit(1); }
// Find end of this line (next backtick-comma or end of body template)
const end3 = blog.indexOf('`', idx3);
if (end3 === -1) { console.log('End of section 3 body not found'); process.exit(1); }

const mermaidBlock = `,
    mermaid: \`graph LR
    A["OpenAI 模型开放"] --> B["AWS Bedrock"]
    A --> C["Azure OpenAI"]
    A --> D["Google Vertex AI"]
    A --> E["Oracle/IBM Cloud"]
    B --> F["多模型共存格局"]
    C --> F
    D --> F
    E --> F
    F --> G["竞争焦点转移:模型独占→平台服务"]\``;

blog = blog.substring(0, end3) + mermaidBlock + blog.substring(end3);

// Add table to section 4 (对比分析) - find the warning line
const section4Warning = '定价对比不能只看「每百万 token 的价格」';
const idx4 = blog.indexOf(section4Warning);
if (idx4 === -1) { console.log('Section 4 not found'); process.exit(1); }
const end4 = blog.indexOf('`', idx4);

const tableBlock = `,
    table: {
      headers: ["维度", "AWS Bedrock", "Azure OpenAI", "Google Vertex AI"],
      rows: [
        ["GPT 系列", "接入", "原独家", "接入"],
        ["Claude", "已接入", "已接入", "已接入"],
        ["Gemini", "无", "无", "自研旗舰"],
        ["自研模型", "Nova 系列", "无旗舰", "Gemini 系列"],
        ["Llama", "已接入", "已接入", "已接入"],
        ["定价策略", "按量付费", "承诺折扣", "激进定价"],
        ["生态整合", "全云服务", "Microsoft 365", "数据+AI"],
      ]
    }`;

blog = blog.substring(0, end4) + tableBlock + blog.substring(end4);

fs.writeFileSync('src/data/blogs/blog-141.ts', blog);
console.log('Added mermaid to section 3 and table to section 4');
