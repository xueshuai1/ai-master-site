const fs = require('fs');

// === Add mermaid to prac-002.ts ===
let kb = fs.readFileSync('src/data/articles/prac-002.ts', 'utf-8');

// Add mermaid to section 8 (AI 应用场景) - after the body text, before tip
const kbMarker = '元记忆帮助 Agent 管理记忆的**生命周期**，避免检索到**过时或已修正**的信息。';
const kbIdx = kb.indexOf(kbMarker);
if (kbIdx === -1) { console.log('KB marker not found'); process.exit(1); }
const kbEnd = kb.indexOf('`', kbIdx + kbMarker.length);
if (kbEnd === -1) { console.log('KB end not found'); process.exit(1); }

const kbMermaid = `,
    mermaid: \`graph TD
    A[用户提问] --> B[查询向量化]
    B --> C{混合检索}
    C --> D[BM25 关键词召回]
    C --> E[ANN 向量召回]
    D --> F[RRF 融合]
    E --> F
    F --> G[Top-50 候选]
    G --> H[交叉编码器重排序]
    H --> I[Top-10 最终结果]
    I --> J[LLM 生成回答]\`,`;

kb = kb.substring(0, kbEnd) + kbMermaid + kb.substring(kbEnd);

// Add second mermaid to section 2 (倒排索引) 
const kb2Marker = '**BM25 的典型参数设置：k1 = 1.2，b = 0.75**。这两个参数经过大量实验验证，在大多数场景下表现良好。';
const kb2Idx = kb.indexOf(kb2Marker);
if (kb2Idx === -1) { console.log('KB2 marker not found'); process.exit(1); }
const kb2End = kb.indexOf('`', kb2Idx + kb2Marker.length);
if (kb2End === -1) { console.log('KB2 end not found'); process.exit(1); }

const kb2Mermaid = `,
    mermaid: \`graph LR
    A[原始文档] --> B[分词处理]
    B --> C[构建词典]
    C --> D[倒排列表]
    D --> E[词频统计]
    E --> F[BM25 评分]
    F --> G[排序结果]\`,`;

kb = kb.substring(0, kb2End) + kb2Mermaid + kb.substring(kb2End);

fs.writeFileSync('src/data/articles/prac-002.ts', kb);
console.log('Added 2 mermaids to prac-002.ts');

// === Add mermaid to blog-141.ts ===
let blog = fs.readFileSync('src/data/blogs/blog-141.ts', 'utf-8');

// Add a second mermaid to section 8 (趋势预判)
const blogMarker = '定义统一的**模型接入协议、路由策略描述语言、服务质量 SLA 规范**。';
const blogIdx = blog.indexOf(blogMarker);
if (blogIdx === -1) { console.log('Blog marker not found'); process.exit(1); }
const blogEnd = blog.indexOf('`', blogIdx + blogMarker.length);
if (blogEnd === -1) { console.log('Blog end not found'); process.exit(1); }

const blogMermaid = `,
    mermaid: \`graph LR
    A[独占时代] --> B[独占解除]
    B --> C[AWS 接入 GPT]
    B --> D[Google 接入 GPT]
    B --> E[Azure 保持 GPT]
    C --> F[多模型共存]
    D --> F
    E --> F
    F --> G[平台服务竞争]\`,`;

blog = blog.substring(0, blogEnd) + blogMermaid + blog.substring(blogEnd);

fs.writeFileSync('src/data/blogs/blog-141.ts', blog);
console.log('Added mermaid to blog-141.ts');
