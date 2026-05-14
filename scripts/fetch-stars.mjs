import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = '/Users/xueshuai/.openclaw/workspace/ai-master-site';
const TOKEN = process.env.GITHUB_TOKEN;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchRepo(owner, repo, retries = 2) {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  for (let i = 0; i <= retries; i++) {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ai-master-site/1.0'
      }
    });
    if (resp.status === 200) return await resp.json();
    if (resp.status === 403) {
      const reset = parseInt(resp.headers.get('x-ratelimit-reset') || '0');
      const wait = Math.max((reset - Math.floor(Date.now()/1000) + 2) * 1000, 5000);
      console.error(`  ⏳ Rate limited, waiting ${Math.round(wait/1000)}s`);
      await sleep(wait);
      continue;
    }
    if (resp.status === 404) return null;
    if (i < retries) { await sleep(2000); continue; }
    console.error(`  ❌ HTTP ${resp.status}`);
    return null;
  }
  return null;
}

// Parse tools.ts to extract tool objects with GitHub URLs
function parseTools(content) {
  const tools = [];
  // Match: { ... id: "...", ... url: "https://github.com/owner/repo", ... }
  // We need to find each tool block and extract id + url
  const lines = content.split('\n');
  let inTools = false;
  let currentTool = {};
  let braceDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('export const tools: Tool[] = [')) {
      inTools = true;
      continue;
    }
    if (!inTools) continue;
    
    // Count braces to detect tool boundaries
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') {
        braceDepth--;
        if (braceDepth === 0 && currentTool.id) {
          // End of tool block
          if (currentTool.url && currentTool.url.includes('github.com')) {
            const parts = currentTool.url.replace('https://github.com/', '').split('/');
            if (parts.length >= 2) {
              let repo = parts.slice(1).join('/');
              // Remove trailing ", or other chars
              repo = repo.replace(/["',\s]+$/, '');
              tools.push({
                id: currentTool.id,
                owner: parts[0],
                repo: repo,
                lineStart: currentTool.lineStart,
                lineEnd: i,
              });
            }
          }
          currentTool = {};
        }
      }
    }
    
    const idMatch = line.match(/id:\s*"([^"]+)"/);
    if (idMatch) { currentTool.id = idMatch[1]; currentTool.lineStart = i; }
    
    const urlMatch = line.match(/url:\s*"([^"]+)"/);
    if (urlMatch) currentTool.url = urlMatch[1];
  }
  
  return tools;
}

// Check AI relevance of topic
const AI_KEYWORDS = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robotics','vision','language',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models','large-language-models',
  'retrieval-augmented','instruction-tuning','rlhf','alignment','deep','genai','agi',
  'tts','stt','ocr','gpu','tensor','quantization','search','retrieval','memory',
  'context','orchestrat','workflow','automation','framework','pipeline','dataset',
  'training','fine-tun','evaluation','benchmark','serving','deployment','multi-agent',
  'multiagent','harness','skill','evolution','evolving','self-','intelligent','cognitive',
  'computer-use','gui','deepseek','claude','llama','openai','anthropic','huggingface',
  'pytorch','tensorflow','keras','jax','onnx','coreml','vector','embed','semantic',
  'graph','diffusion','gan','vae','attention','bert','gemini','mistral','codex',
  'stable-diffusion','comfyui','webui','llamacpp','vllm','unsloth','gradio','streamlit',
  'langchain','langgraph','smolagents','autogen','crewai','metagpt','dify','n8n',
  'langflow','flowise','localai','ollama','anythingllm','chatbox','lobehub',
  'cherry-studio','khoj','mem0','fabric','browser-use','creative','art','image',
  'video','audio','voice','face','deepfake','restoration','super-resolution','upscale',
  'segmentation','detection','classification','recognition','pose','densepose','yolo',
  'mobilenet','imagenet','pretrain','hyperparam','distributed','parallel','quant',
  'fp8','gemm','cuda','tensorrt','on-device','edge','mobile','plugin','extension',
  'sdk','library','runtime','cloud','devops','observability','monitoring','security',
  'safety','governance','privacy','audit','responsible','ethics','bias','fairness',
  'transparency','explainable','interpretable','causal','reinforcement','few-shot',
  'zero-shot','in-context','chain-of-thought','reasoning','planning','tool-use',
  'function-calling','browse','crawl','scrape','extract','parse','summarize',
  'translate','generate','synthesize','compose','prototype','optimize','accelerate',
  'lightweight','minimal','open','community','collaborative','knowledge','data',
  'stream','real-time','hybrid','federated','decentralized','virtual','augmented',
  'spatial','3d','4d'
];

function isAiRelated(topic) {
  const t = topic.toLowerCase().replace(/_/g, '-');
  return AI_KEYWORDS.some(kw => {
    const normalizedKw = kw.toLowerCase().replace(/_/g, '-');
    // For very short keywords, do word-boundary matching
    if (normalizedKw.length <= 2) {
      return t === normalizedKw || t.startsWith(normalizedKw + '-') || t.endsWith('-' + normalizedKw);
    }
    return t.includes(normalizedKw);
  });
}

function genDesc(topic) {
  const t = topic.replace(/-/g, ' ');
  // Capitalize first letters
  return t.charAt(0).toUpperCase() + t.slice(1);
}

async function main() {
  const toolsTs = readFileSync(join(ROOT, 'src/data/tools.ts'), 'utf-8');
  const topicsJson = JSON.parse(readFileSync(join(ROOT, 'data/ai-topics.json'), 'utf-8'));
  
  const existingTopics = new Set(topicsJson.topics.map(t => t.topic.toLowerCase()));
  const tools = parseTools(toolsTs);
  
  console.log(`Found ${tools.length} tools with GitHub URLs`);
  
  // Fetch data for each repo
  const results = [];
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    console.log(`[${i+1}/${tools.length}] ${tool.owner}/${tool.repo}`);
    const data = await fetchRepo(tool.owner, tool.repo);
    
    if (!data) {
      console.log(`  ⚠️ Not found or error, skipping`);
      results.push({ ...tool, error: true });
      await sleep(1100);
      continue;
    }
    
    results.push({
      ...tool,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      pushedAt: data.pushed_at,
      topics: (data.topics || []).map(t => t.toLowerCase()),
    });
    
    console.log(`  ⭐ ${data.stargazers_count} 🍴 ${data.forks_count} 📝 ${data.language || 'N/A'} 🕐 ${data.pushed_at?.split('T')[0]}`);
    
    await sleep(1100);
  }
  
  // Now process updates
  const starsChanges = [];
  const forksChanges = [];
  const langChanges = [];
  const topicUpdates = [];
  const allCollectedTopics = new Set();
  
  // We need to parse the actual current values from tools.ts to compare
  // Extract current githubStars, forks, language values
  const toolBlocks = [];
  for (const tool of tools) {
    // Extract the tool's block from tools.ts
    const idEscaped = tool.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Find the block for this tool
    const blockRegex = new RegExp(
      `\\{\\s*id:\\s*"${idEscaped}"[\\s\\S]*?(?=\\n\\s*\\{\\s*id:|\\n\\];)`,
      'g'
    );
    const match = blockRegex.exec(toolsTs);
    if (match) {
      const block = match[0];
      const starsMatch = block.match(/githubStars:\s*(\d+)/);
      const forksMatch = block.match(/forks:\s*(\d+)/);
      const langMatch = block.match(/language:\s*"([^"]+)"/);
      const updatedMatch = block.match(/updatedAt:\s*"([^"]+)"/);
      
      toolBlocks.push({
        id: tool.id,
        currentStars: starsMatch ? parseInt(starsMatch[1]) : null,
        currentForks: forksMatch ? parseInt(forksMatch[1]) : null,
        currentLang: langMatch ? langMatch[1] : null,
        currentUpdated: updatedMatch ? updatedMatch[1] : null,
        block,
        blockStart: match.index,
      });
    }
  }
  
  // Match results with toolBlocks and determine updates
  const fileEdits = [];
  let starsUpdated = 0;
  let forksUpdated = 0;
  let langUpdated = 0;
  let updatedUpdated = 0;
  
  for (const result of results) {
    if (result.error) continue;
    const tb = toolBlocks.find(t => t.id === result.id);
    if (!tb) continue;
    
    // Collect topics
    if (result.topics) {
      for (const t of result.topics) allCollectedTopics.add(t);
    }
    
    // Check stars change
    if (tb.currentStars !== null && result.stars !== tb.currentStars) {
      starsChanges.push({
        id: result.id,
        old: tb.currentStars,
        new: result.stars,
        delta: result.stars - tb.currentStars
      });
      starsUpdated++;
    }
    
    // Check forks
    if (result.forks !== undefined) {
      if (tb.currentForks === null || result.forks !== tb.currentForks) {
        forksChanges.push({ id: result.id, new: result.forks });
        forksUpdated++;
      }
    }
    
    // Check language
    if (result.language && result.language !== tb.currentLang) {
      langChanges.push({ id: result.id, old: tb.currentLang, new: result.language });
      langUpdated++;
    }
    
    // Check pushed_at -> updatedAt
    if (result.pushedAt) {
      const newDate = result.pushedAt.split('T')[0];
      if (newDate !== tb.currentUpdated) {
        updatedUpdated++;
      }
    }
  }
  
  // New topics
  const newTopics = [];
  const topicRepoCount = {};
  for (const t of allCollectedTopics) {
    topicRepoCount[t] = (topicRepoCount[t] || 0) + 1;
  }
  
  for (const [topic, count] of Object.entries(topicRepoCount)) {
    if (existingTopics.has(topic)) continue;
    // Skip single-repo topics with < 1000 stars (too niche)
    if (count === 1) {
      const repo = results.find(r => r.topics?.includes(topic));
      if (repo && repo.stars < 1000) continue;
    }
    if (isAiRelated(topic)) {
      const minStars = count >= 3 ? 2000 : count >= 2 ? 3000 : 5000;
      newTopics.push({
        topic,
        url: `https://github.com/topics/${topic}`,
        minStars,
        description: genDesc(topic),
        repoCount: count,
      });
    }
  }
  
  // Now we need to actually edit tools.ts
  // Since the file is huge, let's build a Node script that does the edits
  // and write it to disk for the next step
  
  const updateData = {
    starsChanges,
    forksChanges,
    langChanges,
    newTopics,
    updatedUpdated,
    stats: {
      totalScanned: tools.length,
      starsUpdated,
      forksUpdated,
      langUpdated,
      updatedUpdated,
      topicsCollected: allCollectedTopics.size,
      newTopicsCount: newTopics.length,
      existingTopicsCount: topicsJson.topics.length,
    },
    // For file editing: map tool id -> new values
    toolUpdates: results.filter(r => !r.error).map(r => ({
      id: r.id,
      stars: r.stars,
      forks: r.forks,
      language: r.language,
      pushedAt: r.pushedAt,
      topics: r.topics,
    })),
  };
  
  writeFileSync(join(ROOT, 'scripts/.update-result.json'), JSON.stringify(updateData, null, 2));
  
  console.log('\n=== Summary ===');
  console.log(`Scanned: ${tools.length} repos`);
  console.log(`Stars changes: ${starsUpdated}`);
  console.log(`Forks changes: ${forksUpdated}`);
  console.log(`Language changes: ${langUpdated}`);
  console.log(`Date changes: ${updatedUpdated}`);
  console.log(`Topics collected: ${allCollectedTopics.size}`);
  console.log(`New AI topics: ${newTopics.length}`);
  
  if (starsChanges.length > 0) {
    console.log('\nBiggest star changes:');
    starsChanges.sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 10).forEach(c => {
      console.log(`  ${c.id}: ${c.old} → ${c.new} (${c.delta > 0 ? '+' : ''}${c.delta})`);
    });
  }
  
  if (newTopics.length > 0) {
    console.log('\nNew topics:');
    newTopics.slice(0, 20).forEach(t => {
      console.log(`  ${t.topic} (${t.repoCount} repos, minStars=${t.minStars})`);
    });
  }
}

main().catch(e => { console.error(e); process.exit(1); });
