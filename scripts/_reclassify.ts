import { tools } from '../src/data/tools';

/**
 * 13 个互斥分类。priority 从上到下：
 *   coding → multimodal → workflow → mcp → rag → search → training → data
 *   → mlops → app → agent → model → framework → learn
 */
function classify(t) {
  const id = (t.id || '').toLowerCase();
  const name = (t.name || '').toLowerCase();
  const desc = (t.description || '').toLowerCase();
  const tags = (t.tags || []).join(' ').toLowerCase();
  const text = id + ' | ' + name + ' | ' + tags + ' | ' + desc;
  const has = (re) => re.test(text);
  const hasTag = (re) => re.test(tags);

  // ==== 1. CODING（IDE 集成、代码 Agent、Claude Code 技能）====
  if (has(/\b(github-?copilot|cursor|cline|aider|continue|claude-?code|claudeflow|claude-?flow|codex|tabby|tabnine|sourcegraph|cody|sweep|pearai|kilo|career-?ops|archon|gh-?copilot|opencode|opencodes|swe-?agent|forge|fine|spec-?kit|9router|decolua-9router|claude-?mem|caveman|seomachine|agent-?skills|android-reverse|skill-kit)\b/)) return 'coding';
  if (has(/(代码补全|代码生成|编程助手|代码助手|code generation|code completion|coding agent|code agent|repo agent|ide 集成|ide integration|代码审查|code review|software engineering agent|spec-?driven|claude code 插件|claude code 技能|claude code token|sandbox.*code|代码沙箱|安全沙箱|安全运行|代码运行平台|claude design|design ?替代品|ai 辅助设计)/)) return 'coding';

  // ==== 2. MULTIMODAL（图/音/视/3D/OCR/具身）====
  if (has(/(stable diffusion|comfyui|midjourney|dall-?e|sora|flux|whisper|elevenlabs|tts|stt|voice clon|图像生成|视频生成|文生图|图生图|文生视频|音频生成|3d gen|nerf|gaussian splat|animate ?anyone|kohya|inpaint|outpaint|controlnet|多模态|multimodal|image generation|video generation|audio synthesis|speech recognition|computer vision|计算机视觉|object detection|图像识别|图像分割|ocr|deepfake|face ?swap|超分辨率|upscayl|super resolution|纯英文|tesseract|paddle ?ocr|视觉语言|vlm|design ?clone|ui generation|ui clone|figma)/)) return 'multimodal';
  // 机器人 / 物理仿真 / 具身智能 / SLAM / 自动驾驶（cv 邻域）
  if (has(/\b(robotics|robot|ardupilot|arducopter|arduplane|openmower|cartographer|slam|johnny-?five|mujoco|stable-?baselines|stable_baselines|pythonrobotics|nasa.+rover|openpilot|自动驾驶|autonomous driving|adas|具身|embodied|物理仿真)\b/)) return 'multimodal';

  // ==== 3. WORKFLOW（可视化工作流编排）====
  if (has(/\b(n8n|dify|flowise|langflow|activepieces|node-?red|workflow automation|automation platform|低代码 ?ai|low-?code ?ai|可视化工作流|拖拽式|visual workflow|visual ?builder|拖拽编排)\b/)) return 'workflow';

  // ==== 4. MCP & 浏览器/桌面自动化 ====
  if (has(/\b(mcp|model context protocol|browser-?use|playwright-?mcp|puppeteer|browser automation|浏览器自动化|web agent|browser agent|claude ?desktop|插件市场|chrome ?extension|浏览器扩展)\b/)) return 'mcp';

  // ==== 5. RAG & 知识库 & 向量 ====
  if (has(/\b(rag|retrieval-?augmented|vector ?database|vector ?db|向量数据库|chroma|qdrant|milvus|weaviate|pinecone|llamaindex|llama-?index|haystack|deepset.*haystack|markitdown|unstructured|document parsing|文档解析|知识库|knowledge base|knowledge graph|page ?index|second brain|个人知识|第二大脑|notebook ?lm|hkuds.*rag|page-?index|markitup)\b/)) return 'rag';
  if (has(/\b(embedding|flagembedding|text2vec|sentence-?transformer)\b/)) return 'rag';

  // ==== 6. SEARCH（搜索引擎产品 / AI 搜索）====
  if (has(/\b(perplexica|perplexity|morphic|searxng|meilisearch|typesense|typesense-?ai|ai search|llm search|web search agent|hybrid search|混合搜索|elasticsearch.*ai)\b/)) return 'search';

  // ==== 7. TRAINING & 微调 ====
  if (has(/\b(fine-?tun|finetun|lora|qlora|rlhf|dpo|ppo|deepspeed|colossal|colossalai|unsloth|llama-?factory|llamafactory|ms-?swift|axolotl|trl|peft|微调|训练框架|预训练|训练优化|distillation|蒸馏|gradient checkpoint|从零训练|预训练教程|2 小时从零|llama-?stack|minimind|nanogpt|nano-?gpt|reinforcement learning|强化学习|stable[-_]?baselines)\b/)) return 'training';
  if (has(/\b(scikit-?learn|keras|tensorflow|pytorch lightning|jax|flax)\b/)) return 'training';

  // ==== 8. DATA（爬虫 / ETL / 数据准备 / 量化数据）====
  if (has(/\b(crawl4ai|crawler|scraper|scraping|firecrawl|easyspider|web scraper|网页抓取|数据采集|数据爬取|爬虫|抓取|annotation|labelstudio|label-?studio|标注平台|数据标注|数据准备|data extraction|etl|data pipeline|mindsdb|qlib|posthog|product analytics|事件分析|数据分析平台|教材.*pdf|textbook|china-?textbook|教材资源)\b/)) return 'data';

  // ==== 9. MLOPS / 推理服务 / 评测 / Observability / Security ====
  if (has(/\b(vllm|sglang|tgi|tritonserver|lmdeploy|inference engine|inference server|推理引擎|推理服务|推理优化|llm eval|llm benchmark|evals?|langfuse|helicone|arize|opik|observability|可观测性|monitoring|tracing|deployment platform|guardrail|guardrails|llm security|prompt injection|red ?team|sandbox runtime|daytona|netdata|mlflow|gptcache|提示词攻击|越狱|jailbreak|安全防护|model ?card|prompt ?bench|对抗性 prompt|鲁棒性评估|多模型对比|speculative decoding|推测解码|gemm|cuda 内核|fp8|加速 ?llm 推理|推理加速)\b/)) return 'mlops';

  // ==== 10. APP / 客户端产品 ====
  if (has(/\b(open-?webui|chatbox|lobehub|lobe-?chat|cherry-?studio|anythingllm|anything-?llm|jan-?ai|chatgpt clone|chatgpt-?desktop|tlon|enchanted|reka chat|gpt-?academic|chatall|chatbot ?ui|聊天客户端|web ?ui|chat client|desktop client|跨平台.*ai|ai assistant 客户端|webui|web interface|个人 ?ai ?助手|ai 第二大脑|微信助理|微信机器人|im 平台|im ?机器人|telegram bot|qq 机器人|discord bot|astrbot|cowagent|openclaw|copaw|nanobot|nicegui|gui 库|web ui 库|gradio|streamlit|larksuite|飞书 cli|飞书 ?客户端|finceptterminal|金融 ?ai ?终端|terminal app)\b/)) return 'app';

  // ==== 11. AGENT ====
  if (has(/\b(agent ?framework|agent ?runtime|agent ?sdk|autonomous agent|多 ?agent|multi-?agent|agent orchestration|agent platform|swarm|smolagents|crewai|autogen|metagpt|openhands|opendevin|gpt-?researcher|deer-?flow|hermes-?agent|copilot ?kit|composio|agent harness|agent 框架|agent 协作|agentic|adk|google adk|babyagi|auto-?gpt|reworkd|agent gpt|openharness|harness builder|harness runtime|agent 编排|google_adk|hedge.?fund|dexter|virattt|grow.?agent|可成长agent|self-?evolving|evolver|llm-?powered software|12.factor.agents)\b/)) return 'agent';
  if (hasTag(/\b(agent|多智能体|自主agent|agentic-?ai|agent 框架|个人ai助手框架|agent 协作)\b/) && !has(/code agent|coding agent|browser agent/)) return 'agent';

  // ==== 12. MODEL ====
  if (has(/\b(ollama|llama\.?cpp|localai|gpt4all|lm ?studio|text-generation-webui|大语言模型|本地部署|本地推理|local llm|model weights|开源模型|chatglm|baichuan|yi-?\d|qwen-?\d|deepseek-?(v|r|coder)|llama-?\d|mistral-?\d|mixtral|phi-?\d|gemma|moe model|foundation model|gpt-?4 ?free|gpt4free|free api|free ?gpt|多模型免费|免费访问|api 聚合)\b/)) return 'model';

  // ==== 13. LEARN / 资源 / 教程 ====
  if (has(/\b(awesome-?|tutorial|course|教程|课程|learn|guide|cookbook|book|资源汇总|prompt collection|system prompt|prompt engineering|提示词|prompt pattern|llm 学习|入门|fundamentals|实战教程|学习资源|for beginners|cs course|video course|conference deadline|deadline countdown|paperswithcode|cs-video|d2l|made-with-ml|fabric|llm-?for-?beginners|机器学习入门|动手学|nanochat-?教程|llm-from-scratch|llm-action|systems for ml)\b/)) return 'learn';

  // ==== 14. FRAMEWORK（最后兜底通用 SDK）====
  if (has(/\b(langchain|llamaindex|haystack|dspy|framework|sdk|library|toolkit|开发框架|开发库|transformers|copilot ?kit|composio|llmware|txtai|api 统一|llm 代理|liteapi|litellm|llm 路由|model router|model gateway|supabase|backend|postgres|database|存储)\b/)) return 'framework';

  return 'UNKNOWN';
}

const NEW_CATS = ['model','app','agent','coding','framework','workflow','multimodal','rag','mcp','training','data','mlops','search','learn'];

const counts = {};
const unknowns = [];
const moves = {};

for (const t of tools) {
  const newCat = classify(t);
  counts[newCat] = (counts[newCat] || 0) + 1;
  if (newCat === 'UNKNOWN') unknowns.push(t);
  if (newCat !== t.category) {
    moves[`${t.category}→${newCat}`] = (moves[`${t.category}→${newCat}`] || 0) + 1;
  }
}

console.log('===== 新分类分布 =====');
for (const c of NEW_CATS) {
  console.log('  ' + c.padEnd(12) + ' = ' + (counts[c] || 0));
}
console.log('  UNKNOWN     = ' + (counts['UNKNOWN'] || 0));
console.log('总数:', tools.length);

if (unknowns.length) {
  console.log('\n===== UNKNOWN（未匹配，需要补规则） =====');
  for (const t of unknowns) {
    console.log('  ' + t.id.padEnd(40) + ' [' + t.category + '] ' + t.name + ' — ' + t.description.slice(0, 70));
  }
}

console.log('\n===== Top 移动 (old→new × count) =====');
const sortedMoves = Object.entries(moves).sort((a,b) => b[1]-a[1]).slice(0,20);
for (const [pair, cnt] of sortedMoves) {
  console.log('  ' + pair.padEnd(28) + ' × ' + cnt);
}

// 详细列出每个新类的成员（便于人工抽查）
const byNewCat: Record<string, any[]> = {};
for (const t of tools) {
  const c = classify(t);
  byNewCat[c] = byNewCat[c] || [];
  byNewCat[c].push(t);
}
const dumpCat = (cat: string) => {
  const items = byNewCat[cat] || [];
  console.log('\n===== ' + cat.toUpperCase() + ' (' + items.length + ') =====');
  for (const t of items) {
    console.log('  ' + t.id.padEnd(40) + ' [' + t.category + '→' + cat + '] ' + t.name);
  }
};
const onlyDump = process.argv[2];
if (onlyDump) {
  for (const c of onlyDump.split(',')) dumpCat(c);
}
