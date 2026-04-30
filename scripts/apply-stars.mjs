#!/usr/bin/env node
// Apply GitHub star updates to tools.ts

import fs from 'fs';
import path from 'path';

const TOOLS_FILE = path.resolve('src/data/tools.ts');
const TOPICS_FILE = path.resolve('data/ai-topics.json');

// GitHub data from API calls
const GH = {
"ollama/ollama":{s:170379,f:15889,d:"2026-04-30",l:"Go"},
"x1xhlol/system-prompts-and-models-of-ai-tools":{s:136422,f:34093,d:"2026-04-29",l:null},
"open-webui/open-webui":{s:134897,f:19177,d:"2026-04-24",l:"Python"},
"hiyouga/LLaMA-Factory":{s:70790,f:8642,d:"2026-04-29",l:"Python"},
"binary-husky/gpt_academic":{s:70557,f:8383,d:"2026-01-25",l:"Python"},
"mintplex-labs/anything-llm":{s:59279,f:6401,d:"2026-04-30",l:"JavaScript"},
"lencx/ChatGPT":{s:54366,f:6173,d:"2024-08-29",l:"Rust"},
"upstash/context7":{s:54163,f:2566,d:"2026-04-30",l:"TypeScript"},
"jingyaogong/minimind":{s:48624,f:6143,d:"2026-04-28",l:"Python"},
"mudler/LocalAI":{s:45939,f:4036,d:"2026-04-30",l:"Go"},
"danielmiessler/Fabric":{s:41133,f:4105,d:"2026-04-23",l:"Go"},
"Bin-Huang/ChatBox":{s:39727,f:4027,d:"2026-04-09",l:"TypeScript"},
"shiyu-coder/Kronos":{s:22151,f:3907,d:"2026-04-13",l:"Python"},
"thunderbird/thunderbolt":{s:4413,f:294,d:"2026-04-30",l:"TypeScript"},
"zai-org/GLM-5":{s:3126,f:332,d:"2026-04-17",l:null},
"openclaw/openclaw":{s:366595,f:75244,d:"2026-04-30",l:"TypeScript"},
"n8n-io/n8n":{s:186195,f:57249,d:"2026-04-30",l:"TypeScript"},
"Significant-Gravitas/AutoGPT":{s:183896,f:46238,d:"2026-04-30",l:"Python"},
"langgenius/dify":{s:139720,f:21915,d:"2026-04-30",l:"TypeScript"},
"NousResearch/hermes-agent":{s:125958,f:18822,d:"2026-04-30",l:"Python"},
"browser-use/browser-use":{s:91330,f:10399,d:"2026-04-26",l:"Python"},
"karpathy/autoresearch":{s:78006,f:11372,d:"2026-03-26",l:"Python"},
"lobehub/lobe-chat":{s:75877,f:15038,d:"2026-04-30",l:"TypeScript"},
"OpenHands/OpenHands":{s:72398,f:9148,d:"2026-04-30",l:"Python"},
"FoundationAgents/MetaGPT":{s:67575,f:8580,d:"2026-01-21",l:"Python"},
"xtekky/gpt4free":{s:66143,f:13599,d:"2026-04-29",l:"Python"},
"bytedance/deer-flow":{s:64332,f:8450,d:"2026-04-30",l:"Python"},
"commaai/openpilot":{s:60753,f:10862,d:"2026-04-30",l:"Python"},
"virattt/ai-hedge-fund":{s:57686,f:10067,d:"2026-04-27",l:"Python"},
"code-yeongyu/oh-my-openagent":{s:55138,f:4459,d:"2026-04-30",l:"TypeScript"},
"mem0ai/mem0":{s:54455,f:6142,d:"2026-04-29",l:"Python"},
"MemPalace/mempalace":{s:50457,f:6632,d:"2026-04-29",l:"Python"},
"crewAIInc/crewAI":{s:50336,f:6932,d:"2026-04-30",l:"Python"},
"CherryHQ/cherry-studio":{s:44795,f:4259,d:"2026-04-30",l:"TypeScript"},
"zhayujie/chatgpt-on-wechat":{s:43899,f:10018,d:"2026-04-28",l:"Python"},
"block/goose":{s:43581,f:4451,d:"2026-04-30",l:"Rust"},
"santifer/career-ops":{s:41066,f:8511,d:"2026-04-27",l:"JavaScript"},
"khoj-ai/khoj":{s:34320,f:2176,d:"2026-03-26",l:"Python"},
"vercel-labs/agent-browser":{s:31128,f:1907,d:"2026-04-29",l:"Rust"},
"AstrBotDevs/AstrBot":{s:31032,f:2132,d:"2026-04-30",l:"Python"},
"langchain-ai/langgraph":{s:30876,f:5274,d:"2026-04-30",l:"Python"},
"huggingface/smolagents":{s:26998,f:2537,d:"2026-04-24",l:"Python"},
"assafelovic/gpt-researcher":{s:26796,f:3586,d:"2026-04-16",l:"Python"},
"openai/openai-agents-python":{s:25588,f:3902,d:"2026-04-30",l:"Python"},
"multica-ai/multica":{s:23084,f:2828,d:"2026-04-30",l:"TypeScript"},
"HKUDS/DeepTutor":{s:22654,f:3024,d:"2026-04-29",l:"Python"},
"camel-ai/owl":{s:19720,f:2274,d:"2026-04-17",l:"Python"},
"agentscope-ai/CoPaw":{s:16137,f:2261,d:"2026-04-30",l:"Python"},
"rowboatlabs/rowboat":{s:13195,f:1296,d:"2026-04-30",l:"TypeScript"},
"lsdefine/GenericAgent":{s:8382,f:955,d:"2026-04-29",l:"Python"},
"EKKOLearnAI/hermes-web-ui":{s:3056,f:383,d:"2026-04-30",l:"TypeScript"},
"nanobot-ai/nanobot":{s:1298,f:187,d:"2026-04-28",l:"Go"},
"russellromney/honker":{s:689,f:21,d:"2026-04-30",l:"Python"},
"mannaandpoem/OpenManus":{s:437,f:112,d:"2025-06-21",l:null},
"unclebob/swarm-forge":{s:428,f:45,d:"2026-04-23",l:"Shell"},
"huggingface/transformers":{s:160113,f:33062,d:"2026-04-30",l:"Python"},
"langflow-ai/langflow":{s:147528,f:8877,d:"2026-04-30",l:"Python"},
"langchain-ai/langchain":{s:135462,f:22385,d:"2026-04-30",l:"Python"},
"supabase/supabase":{s:101644,f:12236,d:"2026-04-30",l:"TypeScript"},
"vllm-project/vllm":{s:78661,f:16278,d:"2026-04-30",l:"Python"},
"scikit-learn/scikit-learn":{s:65952,f:26981,d:"2026-04-30",l:"Python"},
"unclecode/crawl4ai":{s:64796,f:6630,d:"2026-04-24",l:"Python"},
"keras-team/keras":{s:64049,f:19761,d:"2026-04-30",l:"Python"},
"unslothai/unsloth":{s:63314,f:5539,d:"2026-04-30",l:"Python"},
"microsoft/autogen":{s:57601,f:8683,d:"2026-04-15",l:"Python"},
"FlowiseAI/Flowise":{s:52413,f:24235,d:"2026-04-30",l:"TypeScript"},
"jeecgboot/jeecg-boot":{s:46039,f:15957,d:"2026-04-30",l:"Java"},
"BerriAI/litellm":{s:45293,f:7679,d:"2026-04-30",l:"Python"},
"gradio-app/gradio":{s:42466,f:3423,d:"2026-04-30",l:"Python"},
"microsoft/DeepSpeed":{s:42224,f:4809,d:"2026-04-30",l:"Python"},
"hpcaitech/ColossalAI":{s:41372,f:4517,d:"2026-04-27",l:"Python"},
"CopilotKit/CopilotKit":{s:30519,f:3940,d:"2026-04-30",l:"TypeScript"},
"ComposioHQ/composio":{s:27973,f:4540,d:"2026-04-30",l:"TypeScript"},
"coleam00/Archon":{s:20253,f:3094,d:"2026-04-29",l:"TypeScript"},
"google/adk-python":{s:19362,f:3315,d:"2026-04-30",l:"Python"},
"HKUDS/OpenHarness":{s:11626,f:1959,d:"2026-04-29",l:"Python"},
"NVIDIA/personaplex":{s:9710,f:1358,d:"2026-03-02",l:"Python"},
"meta-llama/llama-stack":{s:8365,f:1306,d:"2026-04-30",l:"Python"},
"deepseek-ai/DeepGEMM":{s:7145,f:954,d:"2026-04-24",l:"Cuda"},
"EvoMap/evolver":{s:7118,f:718,d:"2026-04-30",l:"JavaScript"},
"vercel-labs/open-agents":{s:4267,f:492,d:"2026-04-29",l:"TypeScript"},
"z-lab/dflash":{s:2430,f:174,d:"2026-04-26",l:"Python"},
"anthropics/claude-code":{s:119390,f:19802,d:"2026-04-29",l:"Shell"},
"google-gemini/gemini-cli":{s:102784,f:13408,d:"2026-04-30",l:"TypeScript"},
"forrestchang/andrej-karpathy-skills":{s:101527,f:9955,d:"2026-04-20",l:null},
"openai/codex":{s:79053,f:11310,d:"2026-04-30",l:"Rust"},
"gpt-engineer-org/gpt-engineer":{s:55229,f:7322,d:"2025-05-14",l:"Python"},
"farion1231/cc-switch":{s:56223,f:3655,d:"2026-04-30",l:"Rust"},
"Aider-AI/aider":{s:44151,f:4328,d:"2026-04-25",l:"Python"},
"Alishahryar1/free-claude-code":{s:18813,f:2673,d:"2026-04-30",l:"Python"},
"mksglu/context-mode":{s:11352,f:775,d:"2026-04-30",l:"TypeScript"},
"sigoden/aichat":{s:9917,f:692,d:"2026-02-23",l:"Rust"},
"larksuite/cli":{s:9063,f:604,d:"2026-04-30",l:"Go"},
"iamzhihuix/skills-manage":{s:1385,f:121,d:"2026-04-30",l:"TypeScript"},
"obra/superpowers":{s:173920,f:15339,d:"2026-04-28",l:"Shell"},
"punkpeye/awesome-mcp-servers":{s:85980,f:9664,d:"2026-04-27",l:null},
"thedotmack/claude-mem":{s:70005,f:5978,d:"2026-04-30",l:"TypeScript"},
"composiohq/awesome-claude-skills":{s:57187,f:6171,d:"2026-04-28",l:"Python"},
"juliusbrussee/caveman":{s:50840,f:2701,d:"2026-04-18",l:"Python"},
"hesreallyhim/awesome-claude-code":{s:41968,f:3542,d:"2026-04-27",l:"Python"},
"sickn33/antigravity-awesome-skills":{s:35781,f:5869,d:"2026-04-30",l:"Python"},
"addyosmani/agent-skills":{s:26441,f:3280,d:"2026-04-28",l:"Shell"},
"volcengine/OpenViking":{s:23280,f:1714,d:"2026-04-30",l:"Python"},
"hangwin/mcp-chrome":{s:11355,f:1009,d:"2026-01-06",l:"TypeScript"},
"zilliztech/claude-context":{s:10357,f:766,d:"2026-04-29",l:"TypeScript"},
"TheCraigHewitt/seomachine":{s:6802,f:936,d:"2026-04-10",l:"Python"},
"modelcontextprotocol/registry":{s:6752,f:778,d:"2026-04-30",l:"Go"},
"wonderwhy-er/DesktopCommanderMCP":{s:5978,f:701,d:"2026-04-30",l:"TypeScript"},
"executeautomation/mcp-playwright":{s:5478,f:504,d:"2025-12-13",l:"TypeScript"},
"SimoneAvogadro/android-reverse-engineering-skill":{s:5383,f:611,d:"2026-04-27",l:"Shell"},
"mobile-next/mobile-mcp":{s:4755,f:413,d:"2026-04-13",l:"TypeScript"},
"Pimzino/spec-workflow-mcp":{s:4158,f:342,d:"2026-03-07",l:"TypeScript"},
"microsoft/markitdown":{s:118854,f:7849,d:"2026-04-20",l:"Python"},
"firecrawl/firecrawl":{s:113207,f:7201,d:"2026-04-30",l:"TypeScript"},
"TapXWorld/ChinaTextbook":{s:70607,f:15796,d:"2025-10-18",l:"Roff"},
"openbb-finance/openbb":{s:66770,f:6674,d:"2026-04-30",l:"Python"},
"docling-project/docling":{s:58826,f:4030,d:"2026-04-30",l:"Python"},
"TauricResearch/TradingAgents":{s:56437,f:10582,d:"2026-04-25",l:"Python"},
"milvus-io/milvus":{s:44060,f:3986,d:"2026-04-30",l:"Go"},
"NaiboWang/EasySpider":{s:43739,f:5323,d:"2026-04-22",l:"JavaScript"},
"microsoft/qlib":{s:41542,f:6544,d:"2026-04-22",l:"Python"},
"mindsdb/mindsdb":{s:39081,f:6193,d:"2026-04-29",l:"Python"},
"jo-inc/camofox-browser":{s:3518,f:362,d:"2026-04-29",l:"JavaScript"},
"AUTOMATIC1111/stable-diffusion-webui":{s:162669,f:30296,d:"2026-03-02",l:"Python"},
"comfyanonymous/ComfyUI":{s:110745,f:12916,d:"2026-04-30",l:"Python"},
"openai/whisper":{s:98670,f:12124,d:"2026-04-15",l:"Python"},
"hacksider/Deep-Live-Cam":{s:92480,f:13433,d:"2026-04-29",l:"Python"},
"PaddlePaddle/PaddleOCR":{s:76869,f:10344,d:"2026-04-28",l:"Python"},
"corentinj/real-time-voice-cloning":{s:59652,f:9401,d:"2026-03-09",l:"Python"},
"ultralytics/yolov5":{s:57315,f:17486,d:"2026-04-27",l:"Python"},
"RVC-Boss/GPT-SoVITS":{s:57068,f:6228,d:"2026-04-30",l:"Python"},
"ultralytics/ultralytics":{s:56614,f:10891,d:"2026-04-30",l:"Python"},
"harry0703/MoneyPrinterTurbo":{s:56584,f:8139,d:"2026-04-22",l:"Python"},
"ageitgey/face_recognition":{s:56356,f:13720,d:"2024-08-21",l:"Python"},
"deepfakes/faceswap":{s:55196,f:13403,d:"2026-04-28",l:"Python"},
"ggml-org/whisper.cpp":{s:49193,f:5471,d:"2026-04-20",l:"C++"},
"coqui-ai/TTS":{s:45194,f:6063,d:"2024-08-16",l:"Python"},
"upscayl/upscayl":{s:44975,f:2184,d:"2026-03-27",l:"TypeScript"},
"2noise/ChatTTS":{s:39172,f:4247,d:"2026-04-10",l:"Python"},
"jamiepine/voicebox":{s:24112,f:2876,d:"2026-04-26",l:"TypeScript"},
"OpenBMB/VoxCPM":{s:16252,f:1931,d:"2026-04-28",l:"Python"},
"BasedHardware/omi":{s:12332,f:1912,d:"2026-04-30",l:"Dart"},
"Anil-matcha/Open-Generative-AI":{s:10257,f:1796,d:"2026-04-30",l:"JavaScript"},
"Open-LLM-VTuber/Open-LLM-VTuber":{s:7290,f:947,d:"2026-02-11",l:"Python"},
"infiniflow/ragflow":{s:79298,f:8988,d:"2026-04-30",l:"Python"},
"pathwaycom/llm-app":{s:59877,f:1435,d:"2026-01-07",l:"Jupyter Notebook"},
"meilisearch/meilisearch":{s:57366,f:2529,d:"2026-04-29",l:"Rust"},
"run-llama/llama_index":{s:49054,f:7333,d:"2026-04-28",l:"Python"},
"QuivrHQ/quivr":{s:39120,f:3752,d:"2025-07-09",l:"Python"},
"promptfoo/promptfoo":{s:20732,f:1794,d:"2026-04-30",l:"TypeScript"},
"leondz/garak":{s:7692,f:909,d:"2026-04-29",l:"Python"},
"microsoft/promptbench":{s:2801,f:220,d:"2026-02-20",l:"Python"},
"brexhq/CrabTrap":{s:515,f:39,d:"2026-04-29",l:"Go"},
"Tracer-Cloud/opensre":{s:4002,f:452,d:"2026-04-30",l:"Python"},
"affaan-m/everything-claude-code":{s:170577,f:26438,d:"2026-04-30",l:"JavaScript"},
"f/prompts.chat":{s:161205,f:21048,d:"2026-04-30",l:"HTML"},
"Snailclimb/JavaGuide":{s:155350,f:46152,d:"2026-04-25",l:"Java"},
"microsoft/generative-ai-for-beginners":{s:110032,f:59039,d:"2026-04-30",l:"Jupyter Notebook"},
"shubhamsaboo/awesome-llm-apps":{s:108145,f:15937,d:"2026-04-27",l:"Python"},
"rasbt/LLMs-from-scratch":{s:91744,f:14135,d:"2026-04-16",l:"Jupyter Notebook"},
"microsoft/ML-For-Beginners":{s:85555,f:20701,d:"2026-04-26",l:"Jupyter Notebook"},
"developer-y/cs-video-courses":{s:80552,f:11117,d:"2026-04-12",l:null},
"mlabonne/llm-course":{s:78840,f:9169,d:"2026-02-05",l:null},
"d2l-ai/d2l-zh":{s:77531,f:12267,d:"2024-07-30",l:"Python"},
"dair-ai/prompt-engineering-guide":{s:74025,f:7997,d:"2026-03-11",l:"MDX"},
"openai/openai-cookbook":{s:73125,f:12343,d:"2026-04-29",l:"Jupyter Notebook"},
"microsoft/ai-agents-for-beginners":{s:60162,f:20378,d:"2026-04-30",l:"Jupyter Notebook"},
"shareai-lab/learn-claude-code":{s:57553,f:9447,d:"2026-04-14",l:"TypeScript"},
"shanraisshan/claude-code-best-practice":{s:49649,f:4940,d:"2026-04-28",l:"HTML"},
"GokuMohandas/Made-With-ML":{s:47456,f:7465,d:"2026-03-04",l:"Jupyter Notebook"},
"Lordog/dive-into-llms":{s:35298,f:4325,d:"2025-10-10",l:"Jupyter Notebook"},
"opencv/opencv":{s:87297,f:56544,d:"2026-04-30",l:"C++"},
"tesseract-ocr/tesseract":{s:73818,f:10612,d:"2026-04-27",l:"C++"},
};

// Known URL → ownerRepo mappings for non-standard URLs
const urlMap = {
  'https://github.com/features/copilot': 'features/copilot',
};

let content = fs.readFileSync(TOOLS_FILE, 'utf8');

// Build URL→ownerRepo map from file
const urlRegex = /url:\s*"(https:\/\/github\.com\/[^"]+)"/g;
const urlToRepo = {};
let m;
while ((m = urlRegex.exec(content)) !== null) {
  const fullUrl = m[1];
  const path = fullUrl.replace('https://github.com/', '');
  const ownerRepo = path.split('/').slice(0, 2).join('/');
  urlToRepo[fullUrl] = urlMap[fullUrl] || ownerRepo;
}

// Parse tool blocks: id → {start, end, fields}
// Find each tool's block boundaries
const idRegex = /id:\s*"([^"]+)"/g;
const tools = [];
while ((m = idRegex.exec(content)) !== null) {
  const id = m[1];
  const start = m.index;
  // Find the end of this object (next closing brace at same indentation)
  // Look for the next tool's id or end of array
  let end = content.indexOf('\n  },', start);
  if (end === -1) end = content.indexOf('\n},', start);
  if (end === -1) end = content.length;
  tools.push({ id, start, end });
}

console.log(`Found ${tools.length} tools`);

let starsChanged = 0;
let forksChanged = 0;
let langChanged = 0;
let dateChanged = 0;
let changes = [];
let noChangeCount = 0;

for (const tool of tools) {
  const block = content.substring(tool.start, tool.end);
  
  // Find URL
  const urlMatch = block.match(/url:\s*"(https:\/\/github\.com\/[^"]+)"/);
  if (!urlMatch) continue;
  const url = urlMatch[1];
  const ownerRepo = urlToRepo[url] || url.replace('https://github.com/', '').split('/').slice(0, 2).join('/');
  
  const gh = GH[ownerRepo];
  if (!gh) continue;
  
  let modified = false;
  
  // Update githubStars
  const oldStarsMatch = block.match(/githubStars:\s*(\d+)/);
  if (oldStarsMatch) {
    const oldStars = parseInt(oldStarsMatch[1]);
    if (oldStars !== gh.s) {
      const absStart = tool.start + oldStarsMatch.index;
      const absEnd = absStart + oldStarsMatch[0].length;
      const indent = oldStarsMatch[1].match(/^\s*/)?.[0] || '';
      content = content.substring(0, absStart) + `githubStars: ${gh.s}` + content.substring(absEnd);
      starsChanged++;
      changes.push(`${tool.id}: ⭐${oldStars}→${gh.s} (${gh.s > oldStars ? '+' : ''}${gh.s - oldStars})`);
      modified = true;
    }
  }
  
  // Update forks
  const oldForksMatch = block.match(/forks:\s*(\d+)/);
  if (oldForksMatch && gh.f !== null) {
    const oldForks = parseInt(oldForksMatch[1]);
    if (oldForks !== gh.f) {
      const absStart = tool.start + oldForksMatch.index;
      const absEnd = absStart + oldForksMatch[0].length;
      content = content.substring(0, absStart) + `forks: ${gh.f}` + content.substring(absEnd);
      forksChanged++;
      modified = true;
    }
  }
  
  // Update language
  const oldLangMatch = block.match(/language:\s*("([^"]*)"|null)/);
  if (oldLangMatch) {
    const oldLang = oldLangMatch[2] || oldLangMatch[1]; // quoted or null
    const newLang = gh.l ? `"${gh.l}"` : 'null';
    if (oldLang !== gh.l && (oldLang !== 'null' || gh.l !== null)) {
      const absStart = tool.start + oldLangMatch.index;
      const absEnd = absStart + oldLangMatch[0].length;
      content = content.substring(0, absStart) + `language: ${newLang}` + content.substring(absEnd);
      langChanged++;
      modified = true;
    }
  }
  
  // Update updatedAt (pushed_at date)
  const oldDateMatch = block.match(/updatedAt:\s*"([^"]+)"/);
  if (oldDateMatch && gh.d) {
    const oldDate = oldDateMatch[1];
    if (oldDate !== gh.d) {
      const absStart = tool.start + oldDateMatch.index;
      const absEnd = absStart + oldDateMatch[0].length;
      content = content.substring(0, absStart) + `updatedAt: "${gh.d}"` + content.substring(absEnd);
      dateChanged++;
      modified = true;
    }
  }
  
  if (!modified) noChangeCount++;
}

fs.writeFileSync(TOOLS_FILE, content);

console.log(`\n✅ Results:`);
console.log(`  Stars changed: ${starsChanged}`);
console.log(`  Forks changed: ${forksChanged}`);
console.log(`  Language changed: ${langChanged}`);
console.log(`  Date changed: ${dateChanged}`);
console.log(`  No change: ${noChangeCount}`);

if (changes.length > 0) {
  console.log(`\n📊 Notable changes:`);
  changes.slice(-10).forEach(c => console.log(`  ${c}`));
}

// Now handle topics
console.log('\n\n📋 Processing topics...');
const topicsData = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
const existingTopics = new Set(topicsData.topics.map(t => t.topic.toLowerCase()));

console.log(`Existing topics: ${existingTopics.size}`);
console.log(`GitHub repos processed: ${Object.keys(GH).length}`);

// AI keywords
const aiKeywords = [
  'ai', 'ml', 'dl', 'llm', 'nlp', 'cv', 'agent', 'robot', 'robots', 'robotics',
  'vision', 'language', 'neural', 'learning', 'generative', 'prompt', 'chatbot',
  'deep-learning', 'machine-learning', 'transformer', 'gpt', 'diffusion', 'rag',
  'embedding', 'inference', 'fine-tuning', 'llmops', 'mlops', 'model-serving',
  'vector-search', 'semantic-search', 'knowledge-graph', 'multimodal', 'speech',
  'text-to-speech', 'image-generation', 'video-generation', 'code-generation',
  'autonomous', 'embodied-ai', 'world-models', 'foundation-models',
  'large-language-models', 'retrieval-augmented', 'instruction-tuning', 'rlhf',
  'alignment'
];

function isAiTopic(topic) {
  const t = topic.toLowerCase().replace(/\s+/g, '-');
  return aiKeywords.some(kw => {
    const tParts = t.split(/[-_\s]+/);
    const kwParts = kw.split(/[-_\s]+/);
    return tParts.some(tp => kwParts.some(kp => tp.includes(kp) || kp.includes(tp)));
  });
}

console.log('Topics analysis complete. New topic discovery requires fetching repo topics from GitHub API separately.');
console.log('Skipping topic updates for this run (requires separate API calls for repo topics).');
