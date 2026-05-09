#!/usr/bin/env node
// Update GitHub stars, forks, language + discover new AI topics
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// --- Config ---
const TOOLS_PATH = './src/data/tools.ts';
const TOPICS_PATH = './data/ai-topics.json';

// --- Load GITHUB_TOKEN ---
const envContent = readFileSync('.env.local', 'utf-8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();
if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN not found in .env.local');
  process.exit(1);
}

// --- Load existing topics ---
const topicsData = JSON.parse(readFileSync(TOPICS_PATH, 'utf-8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

// --- AI keyword list ---
const AI_KEYWORDS = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models','large-language-models',
  'retrieval-augmented','instruction-tuning','rlhf','alignment'
];

function isAITopic(topic) {
  const t = topic.toLowerCase();
  return AI_KEYWORDS.some(kw => t.includes(kw) || kw.includes(t));
}

function describeTopic(topic) {
  // Simple heuristic descriptions
  const descriptions = {
    'fp8': 'FP8 精度计算',
    'cuda': 'CUDA GPU 计算',
    'gpu': 'GPU 加速计算',
    'speculative-decoding': '推测解码加速',
    'speculative-execution': '推测执行',
    'block-diffusion': '块扩散模型',
    'fast-inference': '快速推理',
    'quantization': '模型量化',
    'model-compression': '模型压缩',
    'knowledge-distillation': '知识蒸馏',
    'sparse-attention': '稀疏注意力机制',
    'mixture-of-experts': '混合专家模型',
    'moe': '混合专家架构',
    'chain-of-thought': '思维链推理',
    'reasoning': 'AI 推理能力',
    'tool-use': 'AI 工具使用',
    'function-calling': '函数调用',
    'structured-output': '结构化输出',
    'agentic-coding': 'Agentic 编程',
    'agentic-search': 'Agentic 搜索',
    'agentic-retrieval': 'Agentic 检索',
    'coding-agents': '编码智能体',
    'ai-coding': 'AI 编程辅助',
    'code-assistant': 'AI 代码助手',
    'agentic-framework': 'Agentic 框架',
    'agentic-workflow': 'Agentic 工作流',
    'agentic-engineering': 'Agentic 工程',
    'agentic-skills': 'Agentic 技能',
    'agentic-rag': 'Agentic RAG',
    'agentic-code': 'Agentic 代码',
    'agentic-agi': 'Agentic AGI',
    'agentic': 'Agentic AI',
    'local-ai': '本地 AI 部署',
    'local-first': '本地优先架构',
    'on-device': '端侧推理',
    'edge-inference': '边缘推理',
    'tiny-llm': '轻量级 LLM',
    'small-language-model': '小语言模型',
    'open-weight': '开放权重模型',
    'open-weights': '开放权重',
    'oss-llm': '开源 LLM',
    'ai-compiler': 'AI 编译器',
    'compiler-optimization': '编译器优化',
    'tensor-parallel': '张量并行',
    'pipeline-parallel': '流水线并行',
    'data-parallel': '数据并行',
    'distributed-inference': '分布式推理',
    'distributed-llm': '分布式 LLM',
    'serving': '模型服务化',
    'model-registry': '模型注册表',
    'feature-store': '特征存储',
    'data-versioning': '数据版本管理',
    'experiment-tracking': '实验追踪',
    'hyperparameter-optimization': '超参数优化',
    'neural-architecture-search': '神经网络架构搜索',
    'nas': '神经网络架构搜索',
    'automl': '自动机器学习',
    'auto-training': '自动训练',
    'self-supervised': '自监督学习',
    'contrastive-learning': '对比学习',
    'simclr': 'SimCLR 对比学习',
    'clip': 'CLIP 多模态模型',
    'multimodal-llm': '多模态 LLM',
    'visual-llm': '视觉语言模型',
    'vlm': '视觉语言模型',
    'image-understanding': '图像理解',
    'object-recognition': '物体识别',
    'scene-understanding': '场景理解',
    '3d-vision': '3D 视觉',
    'point-cloud': '点云处理',
    'neural-rendering': '神经渲染',
    'nerf': 'NeRF 神经辐射场',
    'gaussian-splatting': '高斯散射',
    'text-to-3d': '文生 3D',
    '3d-generation': '3D 生成',
    'avatar': '虚拟形象',
    'digital-human': '数字人',
    'tts': '文本转语音',
    'voice-conversion': '语音转换',
    'speaker-diarization': '说话人分离',
    'audio-classification': '音频分类',
    'music-generation': '音乐生成',
    'sound-synthesis': '声音合成',
    'audio-llm': '音频 LLM',
    'video-understanding': '视频理解',
    'video-captioning': '视频字幕生成',
    'action-recognition': '动作识别',
    'video-summarization': '视频摘要',
    'temporal-action-localization': '时序动作定位',
    'document-understanding': '文档理解',
    'layout-analysis': '版面分析',
    'table-extraction': '表格提取',
    'chart-understanding': '图表理解',
    'scientific-paper': '科学论文处理',
    'math-solver': '数学求解',
    'theorem-proving': '定理证明',
    'code-understanding': '代码理解',
    'code-search': '语义代码搜索',
    'code-completion': '代码补全',
    'code-review': '代码审查',
    'bug-detection': 'Bug 检测',
    'test-generation': '测试用例生成',
    'api-generation': 'API 生成',
    'low-code': '低代码平台',
    'no-code': '无代码平台',
    'prompt-optimization': 'Prompt 优化',
    'prompt-compression': 'Prompt 压缩',
    'context-window': '上下文窗口优化',
    'long-context': '长上下文处理',
    'infinite-context': '无限上下文',
    'context-compression': '上下文压缩',
    'memory-augmented': '记忆增强',
    'external-memory': '外部记忆',
    'retrieval-augmented': '检索增强',
    'hybrid-search': '混合搜索',
    'dense-retrieval': '稠密检索',
    'sparse-retrieval': '稀疏检索',
    'cross-encoder': 'Cross-Encoder 模型',
    'bi-encoder': 'Bi-Encoder 模型',
    'vector-database': '向量数据库',
    'vector-embedding': '向量嵌入',
    'semantic-similarity': '语义相似度',
    'similarity-search': '相似度搜索',
    'approximate-nearest-neighbor': '近似最近邻搜索',
    'graph-database': '图数据库',
    'graph-ml': '图机器学习',
    'graph-llm': '图 LLM',
    'reasoning-graph': '推理图',
    'causal-reasoning': '因果推理',
    'planning': 'AI 规划',
    'task-planning': '任务规划',
    'hierarchical-planning': '分层规划',
    'world-model': '世界模型',
    'simulation': 'AI 模拟环境',
    'synthetic-data': '合成数据',
    'data-augmentation': '数据增强',
    'active-learning': '主动学习',
    'few-shot-learning': '少样本学习',
    'zero-shot': '零样本学习',
    'meta-learning': '元学习',
    'continual-learning': '持续学习',
    'lifelong-learning': '终身学习',
    'curriculum-learning': '课程学习',
    'reward-modeling': '奖励建模',
    'preference-optimization': '偏好优化',
    'dpo': '直接偏好优化',
    'ppo': '近端策略优化',
    'grpo': 'GRPO 强化学习',
    'sft': '监督微调',
    'orpo': 'ORPO 偏好优化',
    'constitutional-ai': '宪法 AI',
    'ai-safety': 'AI 安全',
    'ai-alignment': 'AI 对齐',
    'interpretability': '可解释性',
    'mechanistic-interpretability': '机械可解释性',
    'activation-steering': '激活引导',
    'steering-vector': '引导向量',
    'red-teaming': '红队测试',
    'jailbreak': '越狱防护',
    'prompt-injection': 'Prompt 注入防护',
    'guardrails': 'AI 护栏',
    'content-moderation': '内容审核',
    'deepfake-detection': 'Deepfake 检测',
    'ai-watermark': 'AI 水印',
    'provenance': '内容溯源',
    'federated-ai': '联邦 AI',
    'privacy-preserving': '隐私保护 ML',
    'differential-privacy': '差分隐私',
    'homomorphic-encryption': '同态加密',
    'secure-computation': '安全计算',
    'ai-hardware': 'AI 硬件加速',
    'neuromorphic': '神经形态计算',
    'quantum-ml': '量子机器学习',
    'bio-inspired': '生物启发 AI',
    'swarm-intelligence': '群体智能',
    'evolutionary-algorithm': '进化算法',
    'genetic-algorithm': '遗传算法',
    'neuroevolution': '神经进化',
    'brain-computer-interface': '脑机接口',
    'ai-for-science': 'AI for Science',
    'drug-discovery': '药物发现',
    'protein-folding': '蛋白质折叠',
    'molecular-design': '分子设计',
    'materials-science': '材料科学 AI',
    'climate-ai': '气候 AI',
    'agriculture-ai': '农业 AI',
    'healthcare-ai': '医疗 AI',
    'legal-ai': '法律 AI',
    'financial-ai': '金融 AI',
    'edu-ai': '教育 AI',
    'retail-ai': '零售 AI',
    'logistics-ai': '物流 AI',
    'supply-chain-ai': '供应链 AI',
    'manufacturing-ai': '制造 AI',
    'energy-ai': '能源 AI',
  };
  
  if (descriptions[topic]) return descriptions[topic];
  // Fallback: translate hyphenated name
  return topic.split('-').map(w => {
    const map = {ai:'AI',llm:'LLM',ml:'ML',dl:'DL',nlp:'NLP',cv:'CV',gpt:'GPT',rag:'RAG',mcp:'MCP',tts:'TTS',gpu:'GPU',api:'API',cli:'CLI',moe:'MoE',rlhf:'RLHF',dpo:'DPO',ppo:'PPO',sft:'SFT',oss:'开源',local:'本地',open:'开放',model:'模型',agent:'智能体',coding:'编码',search:'搜索',generation:'生成',inference:'推理',fine:'精细',tuning:'调优',training:'训练',serving:'服务化',embedding:'嵌入',vision:'视觉',speech:'语音',audio:'音频',video:'视频',image:'图像',text:'文本',code:'代码',data:'数据',knowledge:'知识',graph:'图',memory:'记忆',context:'上下文',prompt:'提示词',workflow:'工作流',framework:'框架',tool:'工具',tools:'工具链',engine:'引擎',system:'系统',platform:'平台',assistant:'助手',chat:'对话',bot:'机器人',robot:'机器人',multi:'多',single:'单',deep:'深度',self:'自',auto:'自动',enhanced:'增强',optimized:'优化',efficient:'高效',fast:'快速',lightweight:'轻量',heavy:'重量级',small:'小型',large:'大型',tiny:'微型',open:'开源',source:'源码',free:'免费',enterprise:'企业级',production:'生产级',research:'研究',academic:'学术',community:'社区',popular:'流行',trending:'热门',new:'新',next:'下一代',advanced:'高级',basic:'基础',core:'核心',main:'主要',top:'顶级',best:'最佳',state':'SOTA',art:'艺术',of':'的',the':'',for:'用于',with:'带',by:'由',and':'与',or':'或',not':'非',no':'无'};
    return map[w.toLowerCase()] || w;
  }).join(' ');
}

// --- Parse tools.ts ---
const toolsContent = readFileSync(TOOLS_PATH, 'utf-8');

// Extract all GitHub URLs from the file
const githubUrlRegex = /https:\/\/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/g;
const urlMatches = [...toolsContent.matchAll(githubUrlRegex)];
const uniqueRepos = [...new Map(urlMatches.map(m => [m[1], m[0]])).keys()];

console.log(`Found ${uniqueRepos.length} unique GitHub repos`);

// --- Build current stars map ---
const starsRegex = /githubStars:\s*(\d+)/g;
const currentStars = [...toolsContent.matchAll(starsRegex)].map(m => parseInt(m[1]));

// --- Fetch GitHub API data ---
const results = {};
let fetched = 0;
let skipped = 0;

for (const repo of uniqueRepos) {
  try {
    const url = `https://api.github.com/repos/${repo}?access_token=${GITHUB_TOKEN}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ai-master-cc-bot' }
    });
    
    if (response.status === 404) {
      console.log(`  ⚠️ 404: ${repo}`);
      skipped++;
      continue;
    }
    if (response.status === 403) {
      console.log(`  ⏳ Rate limited, waiting 60s...`);
      await new Promise(r => setTimeout(r, 60000));
      continue;
    }
    if (!response.ok) {
      console.log(`  ⚠️ HTTP ${response.status}: ${repo}`);
      continue;
    }
    
    const data = await response.json();
    results[repo] = {
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      topics: data.topics || [],
      pushed_at: data.pushed_at,
      archived: data.archived
    };
    fetched++;
    
    if (fetched % 10 === 0) {
      console.log(`  Fetched ${fetched}/${uniqueRepos.length}...`);
    }
    
    // Rate limit protection: 1s between requests
    if (fetched < uniqueRepos.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch (e) {
    console.error(`  ❌ Error fetching ${repo}: ${e.message}`);
  }
}

console.log(`\nFetched ${fetched} repos, skipped ${skipped}`);

// --- Update tools.ts ---
let changes = { stars: 0, forks: 0, language: 0 };

// Build a mapping from repo to new data
const repoUpdates = {};
for (const repo of uniqueRepos) {
  if (results[repo]) {
    repoUpdates[repo] = results[repo];
  }
}

// Update githubStars values
let updatedContent = toolsContent;

// Find each tool block and update its fields
for (const [repo, data] of Object.entries(repoUpdates)) {
  // Find githubStars near this repo's URL
  const urlInFile = `https://github.com/${repo}`;
  const urlIndex = updatedContent.indexOf(urlInFile);
  if (urlIndex === -1) continue;
  
  // Look backwards to find the tool object start, then find fields within this object
  // Simpler: replace githubStars value that appears near this URL
  // Find the githubStars line near this URL occurrence
  const beforeUrl = updatedContent.substring(0, urlIndex);
  const afterUrl = updatedContent.substring(urlIndex);
  
  // Find githubStars before the URL (within same object)
  const starsBeforeRegex = /githubStars:\s*\d+/g;
  const starsMatches = [...beforeUrl.matchAll(starsBeforeRegex)];
  if (starsMatches.length === 0) continue;
  
  // The last githubStars before this URL is likely the one for this tool
  const lastStarsMatch = starsMatches[starsMatches.length - 1];
  const starsStart = lastStarsMatch.index + beforeUrl.substring(0, lastStarsMatch.index).length;
  const actualStarsStart = starsStart + beforeUrl.length - beforeUrl.length;
  
  // Actually let me recalculate: the index in lastStarsMatch is relative to beforeUrl
  const globalStarsStart = lastStarsMatch.index;
  const starsLine = lastStarsMatch[0];
  const oldStars = parseInt(starsLine.match(/\d+/)[0]);
  
  if (oldStars !== data.stars) {
    const newStarsLine = `githubStars: ${data.stars}`;
    updatedContent = updatedContent.substring(0, globalStarsStart) + newStarsLine + updatedContent.substring(globalStarsStart + starsLine.length);
    changes.stars++;
    console.log(`  ⭐ ${repo}: ${oldStars} → ${data.stars} (${data.stars > oldStars ? '+' : ''}${data.stars - oldStars})`);
  }
  
  // Update forks
  // Look for forks field near this URL
  const forksRegex = /forks:\s*\d+/g;
  const forksMatches = [...updatedContent.matchAll(forksRegex)];
  
  // Find forks that appears after our URL or before it (within same object)
  for (const fm of forksMatches) {
    // Check if this forks is near our URL (within ~500 chars)
    const dist = Math.abs(fm.index - urlIndex);
    if (dist < 500) {
      const oldForks = parseInt(fm[0].match(/\d+/)[0]);
      if (oldForks !== data.forks && data.forks > 0) {
        const newForksLine = `forks: ${data.forks}`;
        updatedContent = updatedContent.substring(0, fm.index) + newForksLine + updatedContent.substring(fm.index + fm[0].length);
        changes.forks++;
      }
      break;
    }
  }
  
  // Update language
  const langRegex = /language:\s*"[^"]*"/g;
  const langMatches = [...updatedContent.matchAll(langRegex)];
  
  for (const lm of langMatches) {
    const dist = Math.abs(lm.index - urlIndex);
    if (dist < 500) {
      const oldLang = lm[0].match(/"([^"]*)"/)[1];
      if (oldLang !== data.language && data.language) {
        const newLangLine = `language: "${data.language}"`;
        updatedContent = updatedContent.substring(0, lm.index) + newLangLine + updatedContent.substring(lm.index + lm[0].length);
        changes.language++;
      }
      break;
    }
  }
  
  // Add missing forks and language if not present
  // Check if forks exists near this URL
  const hasForks = forksMatches.some(fm => Math.abs(fm.index - urlIndex) < 500);
  const hasLanguage = langMatches.some(lm => Math.abs(lm.index - urlIndex) < 500);
  
  if (!hasForks && data.forks > 0) {
    // Add forks before createdAt or after githubStars
    const insertPoint = updatedContent.indexOf('createdAt:', urlIndex);
    if (insertPoint === -1) {
      // Try to find the end of the object
      const nextBrace = updatedContent.indexOf('},', urlIndex);
      if (nextBrace !== -1) {
        updatedContent = updatedContent.substring(0, nextBrace) + `\n    forks: ${data.forks},` + updatedContent.substring(nextBrace);
        changes.forks++;
      }
    } else {
      updatedContent = updatedContent.substring(0, insertPoint) + `forks: ${data.forks},\n    ` + updatedContent.substring(insertPoint);
      changes.forks++;
    }
  }
  
  if (!hasLanguage && data.language && data.language !== 'None') {
    const insertPoint = updatedContent.indexOf('createdAt:', urlIndex);
    if (insertPoint === -1) {
      const nextBrace = updatedContent.indexOf('},', urlIndex);
      if (nextBrace !== -1) {
        updatedContent = updatedContent.substring(0, nextBrace) + `\n    language: "${data.language}",` + updatedContent.substring(nextBrace);
        changes.language++;
      }
    } else {
      updatedContent = updatedContent.substring(0, insertPoint) + `language: "${data.language}",\n    ` + updatedContent.substring(insertPoint);
      changes.language++;
    }
  }
}

// Update updatedAt for each tool based on pushed_at
const now = new Date();
for (const [repo, data] of Object.entries(repoUpdates)) {
  if (!data.pushed_at) continue;
  const urlInFile = `https://github.com/${repo}`;
  const urlIndex = updatedContent.indexOf(urlInFile);
  if (urlIndex === -1) continue;
  
  const pushedDate = new Date(data.pushed_at);
  const daysSincePush = Math.floor((now - pushedDate) / (1000 * 60 * 60 * 24));
  
  if (daysSincePush > 30) {
    // Find updatedAt near this URL
    const updatedAtRegex = /updatedAt:\s*"\d{4}-\d{2}-\d{2}"/g;
    const beforeUrl = updatedContent.substring(0, urlIndex);
    const updatedAtMatches = [...beforeUrl.matchAll(updatedAtRegex)];
    if (updatedAtMatches.length > 0) {
      const lastMatch = updatedAtMatches[updatedAtMatches.length - 1];
      const globalIndex = lastMatch.index;
      const oldUpdatedAt = lastMatch[0];
      const newUpdatedAt = `updatedAt: "${data.pushed_at.split('T')[0]}"`;
      if (oldUpdatedAt !== newUpdatedAt) {
        updatedContent = updatedContent.substring(0, globalIndex) + newUpdatedAt + updatedContent.substring(globalIndex + oldUpdatedAt.length);
      }
    }
  }
}

if (updatedContent !== toolsContent) {
  writeFileSync(TOOLS_PATH, updatedContent);
  console.log(`\nUpdated tools.ts: ${changes.stars} stars, ${changes.forks} forks, ${changes.language} languages`);
} else {
  console.log('\nNo changes to tools.ts');
}

// --- Discover new AI Topics ---
const allTopics = new Map(); // topic -> count
for (const [repo, data] of Object.entries(repoUpdates)) {
  for (const topic of data.topics) {
    const normalized = topic.toLowerCase().replace(/\s+/g, '-');
    allTopics.set(normalized, (allTopics.get(normalized) || 0) + 1);
  }
}

// Filter: AI-related + not already in our list + meets star threshold
const newTopics = [];
for (const [topic, count] of allTopics.entries()) {
  if (existingTopics.has(topic)) continue;
  if (!isAITopic(topic)) continue;
  
  // Check if any repo using this topic has enough stars
  const maxRepoStars = Math.max(...Object.entries(repoUpdates)
    .filter(([r, d]) => d.topics.some(t => t.toLowerCase().replace(/\s+/g, '-') === topic))
    .map(([r, d]) => d.stars));
  
  if (count === 1 && maxRepoStars < 1000) continue;
  
  const minStars = count >= 3 ? 2000 : count >= 2 ? 3000 : 5000;
  newTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${describeTopic(topic)}`
  });
}

console.log(`\nDiscovered ${newTopics.length} new AI topics`);

if (newTopics.length > 0) {
  topicsData.topics.push(...newTopics);
  topicsData.lastUpdated = new Date().toISOString();
  writeFileSync(TOPICS_PATH, JSON.stringify(topicsData, null, 2));
  console.log(`Updated ai-topics.json: ${topicsData.topics.length} total topics`);
}

// --- Output summary JSON for the report ---
const summary = {
  totalRepos: uniqueRepos.length,
  fetched,
  skipped,
  changes,
  newTopicsCount: newTopics.length,
  newTopics: newTopics.slice(0, 10), // top 10
  totalTopics: topicsData.topics.length,
  updatedContentChanged: updatedContent !== toolsContent
};

writeFileSync('/tmp/github-update-summary.json', JSON.stringify(summary, null, 2));
console.log('\nDone! Summary written to /tmp/github-update-summary.json');
