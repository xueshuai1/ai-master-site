const fs = require('fs');
const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) { console.error('GITHUB_TOKEN missing'); process.exit(1); }

const toolsContent = fs.readFileSync('src/data/tools.ts', 'utf8');
const aiTopics = JSON.parse(fs.readFileSync('data/ai-topics.json', 'utf8'));
const existingTopicsSet = new Set(aiTopics.topics.map(t => t.topic.toLowerCase()));

// Extract repos
const repoRegex = /https:\/\/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/g;
const repos = new Set();
let m;
while ((m = repoRegex.exec(toolsContent)) !== null) repos.add(m[1]);
const repoList = [...repos];

// AI keywords for topic matching
const aiKw = [
  'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision',
  'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
  'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
  'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
  'speech','text-to-speech','image-generation','video-generation','code-generation',
  'autonomous','embodied-ai','world-models','foundation-models','large-language-models',
  'retrieval-augmented','instruction-tuning','rlhf','alignment','agentic','genai',
  'llm-framework','coding-agent','self-evolving','mcp','deep-research','context-engineering',
  'vector-database','knowledge-base','llm-eval','llm-ops','prompt-engineering',
  'foundation-model','instruction-tuning','generative-ai','llm-app','llm-apps',
  'llm-tool','llm-tools','ai-agent','ai-agents','multi-agent','multiagent',
  'agentic-ai','ai-coding','ai-assistant','ai-tutor','ai-companion',
  'conversational-ai','agent-framework','agent-development','agent-infrastructure',
  'ai-native','ai-workflow','ai-sre','ai-safety','ai-governance','ai-transparency',
  'ai-observability','ai-monitoring','on-device-ai','edge-ai','ai-chip',
  'brain-computer-interface','autonomous-driving','autonomous-agent','autonomous-agents',
  'embodied','computer-vision','vision-language','speech-recognition','speech-synthesis',
  'text-to-video','image-to-video','audio-generation','voice-ai','voice-clone',
  'code-interpreter','code-search','code-generation','codegen','code-execution',
  'coding-agents','coding-assistant','agentic-coding','agentic-code','agentic-engineering',
  'agentic-retrieval','agentic-search','agentic-rag','agentic-skills','agentic-workflow',
  'llm-agent','llm-evaluation','llm-inference','llm-local','llm-memory','llm-prompting',
  'llm-security','llm-serving','llm-ui','llm-webui','offline-llm','local-llm',
  'multi-modal-rag','llama-index','llamaindex','langchain','langgraph','llamacpp',
  'vllm','deepseek','whisper','tts','openclaw','ollama','open-webui',
  'superagent','agentops','mem0','crewai','autogen','smolagents','langflow',
  'flowise','dify','browser-use','gpt-researcher','openmanus','metagpt',
  'hermes-agent','lobehub','openhands','deer-flow','deepagents','open-agents',
  'llm-course','d2l-ai','made-with-ml','awesome-llm','ai-deadlines','llm-universe',
  'rag-anything','lightrag','haystack','ragflow','txtai','milvus','quivr',
  'langchain-chatchat','chatchat','promptfoo','prompt-management','system-prompt',
  'system-prompts','prompt-testing','prompt-governance','claude-code','claude-agent',
  'claude-agents','claude-ai','anthropic-claude','claude-skills','codex-skills',
  'gemini','gemini-api','google-gemini','openai-api','openai-chatgpt','openai-codex',
  'chatgpt','gpt-4','gpt-4o','gpt-3','chatgpt-on-wechat','wechaty','wechat',
  'huggingface','transformers','pytorch','tensorflow','keras','scikit-learn',
  'deeplearning','deep-neural-networks','neural-network','neural-networks','neural-nets',
  'gan','reinforcement-learning','federated-learning','distributed-training','model-parallelism',
  'self-supervised','pretrained-models','fine-tune','fine-tuned','model-hub','model-serving',
  'model-serving','model-context-protocol','model-parallelism','hyperparameter-search',
  'normalization-free-training','pretrained-weights','mobile-deep-learning',
  'image-classification','image-processing','image-recognition','image-search',
  'image-generation','image-restoration','image-upscaling','image2image','image-to-video',
  'object-detection','pose-estimation','instance-segmentation','super-resolution',
  'face-restoration','face-recognition','deepface','deepfake','deep-fake',
  'ocr','paddleocr','vision-transformer','yolo','comfyui','stable-diffusion',
  'text-to-image','text-generation','text-classification','text-semantic-similarity',
  'natural-language-processing','natural-language-understanding','natural-language-inference',
  'semantic-parsing','sentence-embeddings','embedding-database','embedding-store',
  'embedding-similarity','vector-index','vector-store','vector-similarity',
  'nearest-neighbor-search','hybrid-search','full-text-search','fuzzy-search',
  'search-api','web-search','site-search','enterprise-search','app-search',
  'ai-search','agentic-search','deep-search','code-search','ai-gateway','llm-gateway',
  'model-router','ai-runtime','ai-infrastructure','ai-tooling','ai-tools','ai-framework',
  'ai-frameworks','ai-application','ai-engineering','aiengineering',
  'developer-tools','automation','workflow-automation','task-automation','terminal-automation',
  'browser-automation','desktop-automation','terminal-ai','no-code','low-code',
  'chat-ui','chatbots','ai-chatbot','genai-chatbot','ai-art','ai-art-generator',
  'ai-image-generation','ai-video-generation','ai-vtuber','ai-waifu',
  'creative-tools','text2image','video-processing','video-analytics','video-deepfake',
  'real-time-deepfake','realtime-deepfake','deepfake-webcam','deep-face-swap',
  'speech-processing','multi-speaker-tts','zero-shot-tts','speaker-encodings',
  'memory','memory-agent','memory-system','memory-engine','memory-management',
  'memory-retrieval','agent-memory','llm-memory','long-term-memory','supermemory',
  'openmemory','knowledge-curation','knowledge-management','knowledge-management-graph',
  'knowledgebase','knowledge-base','graphrag','information-retrieval','retrieval-systems',
  'context','context-mode','context-retrieval','context-engine','context-management',
  'context-database','context-engineering','context-management',
  'orchestration','workflow-orchestration','data-orchestrator',
  'multi-agent-system','multi-agent-systems','multiagent-systems',
  'background-agents','agency-agents','custom-ai-agents','ai-agents-framework',
  'ai-agents-automation','multi-agents-collaboration','agents-sdk','agentscope',
  'agentscope-runtime','computer-use-agent','gui-agents','agent-computer-interface',
  'agent-collaboration','agent-evolution','agent-native','agent-protocol',
  'agent-skills','autonomous-agents','autonomous-agent','autonomous-navigation',
  'robot-learning','robotic','robotics','embodied-ai','world-model','world-models',
  'foundation-models','large-language-model','large-language-models',
  'retrieval-augmented-generation','instruction-tuning','rlhf','alignment',
  'llm-observability','llm-ops','mlops','llmops','distributed-ml',
  'gpu','cuda','quantization','quant-models','auto-quant','fp8','gemm',
  'model-serving','inference-engine','speculative-decoding','flash-attention',
  'tensorrt','mlx','coreml','edge-ai','on-device-ai','ai-chip',
  'agent-harness','agent-gpt','agent-browser','agent-skills','superagent',
  'vibe-coding','agentic-agi'
];

function isAITopic(topic) {
  const t = topic.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
  return aiKw.some(kw => {
    const k = kw.replace(/_/g, '-');
    return t === k || t.includes(k) || k.includes(t);
  });
}

function fetchRepo(repo) {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${repo}`;
    const opts = {
      headers: {
        'User-Agent': 'ai-master-site',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    };
    https.get(url, opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const updates = [];
  const topicMap = new Map();
  const errors = [];
  
  for (let i = 0; i < repoList.length; i++) {
    const repo = repoList[i];
    try {
      const data = await fetchRepo(repo);
      if (data.message && data.message.includes('rate limit')) {
        errors.push(`${repo}: rate limited`);
        await sleep(5000);
        continue;
      }
      
      const info = {
        repo,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        pushedAt: data.pushed_at ? data.pushed_at.split('T')[0] : null,
        topics: data.topics || []
      };
      updates.push(info);
      
      // Collect topics
      for (const topic of (data.topics || [])) {
        const norm = topic.toLowerCase().replace(/\s+/g, '-');
        if (!topicMap.has(norm)) topicMap.set(norm, { count: 0, repos: [] });
        topicMap.get(norm).count++;
        topicMap.get(norm).repos.push(repo);
      }
      
      if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${repoList.length} done`);
      await sleep(400); // ~2.5 req/s, well within 5000/hr
    } catch (e) {
      errors.push(`${repo}: ${e.message}`);
      await sleep(1000);
    }
  }
  
  // Find new AI topics
  const newAITopics = [];
  for (const [topic, info] of topicMap) {
    if (existingTopicsSet.has(topic)) continue;
    if (!isAITopic(topic)) continue;
    // Skip if only 1 repo and stars < 1000
    if (info.count === 1) {
      // Check max stars of repos using this topic
      const maxStars = Math.max(...info.repos.map(r => {
        const u = updates.find(u => u.repo === r);
        return u ? u.stars : 0;
      }));
      if (maxStars < 1000) continue;
    }
    
    let minStars = 5000;
    if (info.count >= 3) minStars = 2000;
    else if (info.count >= 2) minStars = 3000;
    
    newAITopics.push({
      topic,
      url: `https://github.com/topics/${topic}`,
      minStars,
      description: `（自动发现）${topic}`
    });
  }
  
  fs.writeFileSync('github-fetch-results.json', JSON.stringify({
    updates,
    newAITopics,
    errors,
    totalRepos: repoList.length,
    totalTopics: topicMap.size,
    existingTopicsCount: existingTopicsSet.size
  }, null, 2));
  
  console.log(`\n=== Summary ===`);
  console.log(`Repos processed: ${updates.length}/${repoList.length}`);
  console.log(`Unique topics found: ${topicMap.size}`);
  console.log(`New AI topics: ${newAITopics.length}`);
  if (errors.length) console.log(`Errors: ${errors.length}`);
}

main().catch(console.error);
