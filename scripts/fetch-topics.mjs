#!/usr/bin/env node
// Fetch GitHub repo topics for AI topic discovery
import fs from 'fs';

const ENV_FILE = '.env.local';
const TOPICS_FILE = 'data/ai-topics.json';

const envContent = fs.readFileSync(ENV_FILE, 'utf8');
const GITHUB_TOKEN = envContent.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();

const repos = [
"ollama/ollama","x1xhlol/system-prompts-and-models-of-ai-tools","open-webui/open-webui",
"hiyouga/LLaMA-Factory","binary-husky/gpt_academic","mintplex-labs/anything-llm",
"lencx/ChatGPT","upstash/context7","jingyaogong/minimind","mudler/LocalAI",
"danielmiessler/Fabric","Bin-Huang/ChatBox","shiyu-coder/Kronos","thunderbird/thunderbolt",
"zai-org/GLM-5","openclaw/openclaw","n8n-io/n8n","Significant-Gravitas/AutoGPT",
"langgenius/dify","NousResearch/hermes-agent","browser-use/browser-use",
"karpathy/autoresearch","lobehub/lobe-chat","OpenHands/OpenHands",
"FoundationAgents/MetaGPT","xtekky/gpt4free","bytedance/deer-flow","commaai/openpilot",
"virattt/ai-hedge-fund","code-yeongyu/oh-my-openagent","mem0ai/mem0",
"MemPalace/mempalace","crewAIInc/crewAI","CherryHQ/cherry-studio",
"zhayujie/chatgpt-on-wechat","block/goose","santifer/career-ops","khoj-ai/khoj",
"vercel-labs/agent-browser","AstrBotDevs/AstrBot","langchain-ai/langgraph",
"huggingface/smolagents","assafelovic/gpt-researcher","openai/openai-agents-python",
"multica-ai/multica","HKUDS/DeepTutor","camel-ai/owl","agentscope-ai/CoPaw",
"rowboatlabs/rowboat","lsdefine/GenericAgent","EKKOLearnAI/hermes-web-ui",
"huggingface/transformers","langflow-ai/langflow","langchain-ai/langchain",
"supabase/supabase","vllm-project/vllm","scikit-learn/scikit-learn",
"unclecode/crawl4ai","keras-team/keras","unslothai/unsloth","microsoft/autogen",
"FlowiseAI/Flowise","jeecgboot/jeecg-boot","BerriAI/litellm","gradio-app/gradio",
"microsoft/DeepSpeed","hpcaitech/ColossalAI","CopilotKit/CopilotKit","ComposioHQ/composio",
"coleam00/Archon","google/adk-python","HKUDS/OpenHarness","NVIDIA/personaplex",
"meta-llama/llama-stack","deepseek-ai/DeepGEMM","EvoMap/evolver",
"vercel-labs/open-agents","anthropics/claude-code","google-gemini/gemini-cli",
"forrestchang/andrej-karpathy-skills","openai/codex","gpt-engineer-org/gpt-engineer",
"farion1231/cc-switch","Aider-AI/aider","Alishahryar1/free-claude-code",
"mksglu/context-mode","sigoden/aichat","larksuite/cli","iamzhihuix/skills-manage",
"obra/superpowers","punkpeye/awesome-mcp-servers","thedotmack/claude-mem",
"composiohq/awesome-claude-skills","juliusbrussee/caveman","hesreallyhim/awesome-claude-code",
"sickn33/antigravity-awesome-skills","addyosmani/agent-skills","volcengine/OpenViking",
"hangwin/mcp-chrome","zilliztech/claude-context","TheCraigHewitt/seomachine",
"modelcontextprotocol/registry","wonderwhy-er/DesktopCommanderMCP","executeautomation/mcp-playwright",
"SimoneAvogadro/android-reverse-engineering-skill","mobile-next/mobile-mcp",
"Pimzino/spec-workflow-mcp","microsoft/markitdown","firecrawl/firecrawl",
"TapXWorld/ChinaTextbook","openbb-finance/openbb","docling-project/docling",
"TauricResearch/TradingAgents","milvus-io/milvus","NaiboWang/EasySpider",
"microsoft/qlib","mindsdb/mindsdb","jo-inc/camofox-browser",
"AUTOMATIC1111/stable-diffusion-webui","comfyanonymous/ComfyUI","openai/whisper",
"hacksider/Deep-Live-Cam","PaddlePaddle/PaddleOCR","corentinj/real-time-voice-cloning",
"ultralytics/yolov5","RVC-Boss/GPT-SoVITS","ultralytics/ultralytics",
"harry0703/MoneyPrinterTurbo","ageitgey/face_recognition","deepfakes/faceswap",
"ggml-org/whisper.cpp","coqui-ai/TTS","upscayl/upscayl","2noise/ChatTTS",
"jamiepine/voicebox","OpenBMB/VoxCPM","BasedHardware/omi","Anil-matcha/Open-Generative-AI",
"Open-LLM-VTuber/Open-LLM-VTuber","infiniflow/ragflow","pathwaycom/llm-app",
"meilisearch/meilisearch","run-llama/llama_index","QuivrHQ/quivr",
"promptfoo/promptfoo","leondz/garak","microsoft/promptbench","brexhq/CrabTrap",
"Tracer-Cloud/opensre","affaan-m/everything-claude-code","f/prompts.chat",
"Snailclimb/JavaGuide","microsoft/generative-ai-for-beginners","shubhamsaboo/awesome-llm-apps",
"rasbt/LLMs-from-scratch","microsoft/ML-For-Beginners","developer-y/cs-video-courses",
"mlabonne/llm-course","d2l-ai/d2l-zh","dair-ai/prompt-engineering-guide",
"openai/openai-cookbook","microsoft/ai-agents-for-beginners","shareai-lab/learn-claude-code",
"shanraisshan/claude-code-best-practice","GokuMohandas/Made-With-ML","Lordog/dive-into-llms",
"opencv/opencv","tesseract-ocr/tesseract"
];

const existingTopics = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
const existingTopicNames = new Set(existingTopics.topics.map(t => t.topic.toLowerCase()));

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const allTopics = {};
const aiKeywords = ['ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language','neural','learning','generative','prompt','chatbot','deep-learning','machine-learning','transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops','mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal','speech','text-to-speech','image-generation','video-generation','code-generation','autonomous','embodied-ai','world-models','foundation-models','large-language-models','retrieval-augmented','instruction-tuning','rlhf','alignment'];

function isAiRelated(topic) {
  const t = topic.toLowerCase().replace(/\s+/g, '-');
  return aiKeywords.some(kw => {
    const tParts = t.split(/[-_\s]+/);
    const kwParts = kw.split(/[-_\s]+/);
    return tParts.some(tp => kwParts.some(kp => tp.includes(kp) || kp.includes(tp)));
  });
}

console.log(`Fetching topics for ${repos.length} repos...`);
let fetched = 0;

for (const repo of repos) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`
      }
    });
    if (!res.ok) {
      if (res.status === 403) { await sleep(60000); continue; }
      continue;
    }
    const data = await res.json();
    const topics = (data.topics || []).map(t => t.toLowerCase());
    const stars = data.stargazers_count || 0;
    
    for (const t of topics) {
      if (!allTopics[t]) allTopics[t] = { count: 0, maxStars: 0 };
      allTopics[t].count++;
      allTopics[t].maxStars = Math.max(allTopics[t].maxStars, stars);
    }
    
    fetched++;
    if (fetched % 10 === 0) console.log(`  Fetched ${fetched}/${repos.length}`);
  } catch (e) { /* skip */ }
  await sleep(500);
}

console.log(`\n✅ Fetched topics from ${fetched} repos`);
console.log(`Total unique topics: ${Object.keys(allTopics).length}`);

// Find new AI topics not yet in ai-topics.json
const newAiTopics = [];
for (const [topic, info] of Object.entries(allTopics)) {
  if (existingTopicNames.has(topic)) continue;
  if (info.count === 1 && info.maxStars < 1000) continue;
  if (!isAiRelated(topic)) continue;
  
  let minStars;
  if (info.count >= 3) minStars = 2000;
  else if (info.count >= 2) minStars = 3000;
  else minStars = 5000;
  
  newAiTopics.push({
    topic,
    url: `https://github.com/topics/${topic}`,
    minStars,
    description: `（自动发现）${topic.replace(/-/g, ' ')}`,
    count: info.count,
    maxStars: info.maxStars
  });
}

newAiTopics.sort((a, b) => b.count - a.count);

console.log(`\n🔍 New AI topics found: ${newAiTopics.length}`);
for (const t of newAiTopics.slice(0, 30)) {
  console.log(`  ${t.topic} — ${t.description} (${t.count} repos, max⭐${t.maxStars})`);
}

// Save results
fs.writeFileSync('scripts/_new-topics.json', JSON.stringify(newAiTopics, null, 2));
console.log('\nSaved to scripts/_new-topics.json');
