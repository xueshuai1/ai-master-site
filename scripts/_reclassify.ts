/**
 * 工具分类重新设计器
 *
 * 13 类，互斥，按优先级匹配（先匹配先得）：
 *   learn → coding → multimodal → mcp → workflow → rag → training
 *   → data → mlops → app → agent → model → framework
 *
 * 注意：所有正则用 `u` flag，确保 \b 对 CJK 字符也工作。
 * 中文短语用 `(?:^|[^\p{L}])` 不可靠，索性放宽到 includes 语义。
 */
import { tools } from "../src/data/tools";
import { writeFileSync } from "node:fs";

type Tool = (typeof tools)[number];

function any(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

/**
 * 边角 case 手动 override（regex 难以精准命中的）
 */
const MANUAL: Record<string, string> = {
  // 实际上是 Agent 但 regex 误判
  autoresearch: "agent",
  "zai_org_open_autoglm": "agent",
  "upsonic_upsonic": "agent",
  "mayooear_ai_pdf_chatbot_langchain": "learn", // 是个 example/教程项目
  // 部署栈不是训练
  "llama-stack": "mlops",
  // 实际上是部署/工程化工具，不是 LLM 模型
  "llamafactory": "training",
  "llama-factory": "training",
  // OpenViking 看 desc 是上下文数据库 → RAG
  openviking: "rag",
  // Wechaty 微信 SDK，agent 框架
  wechaty_wechaty: "framework",
  // OpenBB 是金融数据平台 → data
  openbb: "data",
  // PaperWithCode deadlines
  "paperswithcode_ai_deadlines": "learn",
  "wangrongsheng_awesome_llm_resources": "learn",
  "kiloreux_awesome_robotics": "learn",
  "pliang279_awesome_multimodal_ml": "learn",
  "tianxingchen_embodied_ai_guide": "learn",
  "humanlayer_12_factor_agents": "learn",
};

function classify(t: Tool): string {
  if (MANUAL[t.id]) return MANUAL[t.id];

  const id = (t.id || "").toLowerCase();
  const name = (t.name || "").toLowerCase();
  const desc = (t.description || "").toLowerCase();
  const tags = (t.tags || []).join(" ").toLowerCase();
  const text = `${id} | ${name} | ${tags} | ${desc}`;

  // ── 1. LEARN（meta 资源；提早抢，避免被 coding/training 等吞掉） ──
  if (
    any(text, [
      /\bawesome[-_]/iu,
      /\bfor[- ]?beginners\b/iu,
      /教程|课程|教材|入门|实战教程|学习资源|学习指南|资源汇总|cheat ?sheet|handbook|cookbook|tutorial|guide|book|deadline|paperswithcode|动手学|d2l|made-?with-?ml|cs-?video-?courses?|llms?-?from-?scratch|llm-?course|llm-?action|nanogpt-?教程|prompt collection|prompt[- ]?pattern|系统提示词|prompts? engineering|提示词集|提示词集合|haiku|fabric|12.?factor.?agents|embodied-?ai-?guide/iu,
    ])
  )
    return "learn";

  // ── 2. CODING（IDE / 代码 Agent / Claude Code 技能 / 设计辅助） ──
  if (
    any(text, [
      /\b(github-?copilot|cursor|cline|aider|continue|claude-?code|claudeflow|claude-?flow|codex|tabby|tabnine|sourcegraph|cody|sweep|pearai|kilo|career-?ops|archon|gh-?copilot|opencode|opencodes|swe-?agent|forge|spec-?kit|9router|claude-?mem|caveman|seomachine|agent-?skills|antigravity-?skills|android-reverse|skill-kit|nexuio|open-?design|claude-?design)\b/iu,
      /代码补全|代码生成|编程助手|代码助手|code generation|code completion|coding agent|code agent|repo agent|ide 集成|ide integration|代码审查|code review|software engineering agent|spec-?driven|claude code 插件|claude code 技能|claude code token|代码沙箱|安全沙箱|安全运行.*代码|代码运行平台|ai 辅助设计|design ?替代品|编程 agent|多 ?ai ?编码工具|ai 编码工具/iu,
    ])
  )
    return "coding";

  // ── 3. MULTIMODAL（图/音/视/3D/OCR/CV/具身机器人） ──
  if (
    any(text, [
      /stable[-_ ]?diffusion|comfyui|midjourney|dall-?e|sora|flux|whisper|elevenlabs|tts|stt|voice ?clon|图像生成|视频生成|文生图|图生图|文生视频|音频生成|语音合成|语音克隆|语音识别|3d gen|nerf|gaussian splat|animate ?anyone|kohya|inpaint|outpaint|controlnet|image generation|video generation|audio synthesis|speech recognition|computer vision|计算机视觉|object detection|图像识别|图像分割|ocr|deepfake|face ?swap|换脸|超分辨率|upscayl|super ?resolution|tesseract|paddle ?ocr|视觉语言|design ?clone|ui ?generation|figma 转代码|短视频生成|短视频引擎|long-?form video|视频剪辑|video editing|动漫生成|gpt-?sovits|coqui-?tts|chattts|voicebox|voxcpm|ideogram|pika|runway|opencv|kornia|yolo|ultralytics|face ?recognition|deep ?live ?cam|ai ?硬件|随身 ?ai|ai 项链/iu,
      /robotics|robot|ardupilot|arducopter|arduplane|openmower|cartographer|slam|johnny-?five|mujoco|stable[_-]?baselines|pythonrobotics|nasa.+rover|openpilot|自动驾驶|autonomous driving|adas|具身|embodied|物理仿真|isaac ?sim|isaaclab|gobot|bullet physics|bullet ?3|rerun ?io/iu,
    ])
  )
    return "multimodal";

  // ── 4. MCP & 浏览器/桌面自动化 ──
  if (
    any(text, [
      /mcp|model context protocol|browser-?use|playwright-?mcp|puppeteer-?mcp|browser automation|浏览器自动化|web agent|browser agent|claude ?desktop|插件市场|chrome ?extension|浏览器扩展|ui-?tars|桌面自动化|desktop automation|无头浏览器|headless browser|反检测/iu,
    ])
  )
    return "mcp";

  // ── 5. WORKFLOW（可视化工作流编排） ──
  if (
    any(text, [
      /\b(n8n|dify|flowise|langflow|activepieces|node-?red)\b/iu,
      /workflow automation|automation platform|低代码 ?ai|low-?code ?ai|可视化工作流|拖拽式|visual workflow|拖拽编排|可视化构建/iu,
    ])
  )
    return "workflow";

  // ── 6. RAG & 知识库 & 检索 & 搜索 ──
  if (
    any(text, [
      /\brag\b|retrieval-?augmented|vector ?database|vector ?db|向量数据库|chroma|qdrant|milvus|weaviate|pinecone|llamaindex|llama-?index|haystack|deepset.*haystack|markitdown|unstructured|document parsing|文档解析|知识库|knowledge base|knowledge graph|page ?index|second brain|个人知识|第二大脑|notebook ?lm|hkuds.*rag|page-?index|markitup|embedding|flagembedding|text2vec|sentence-?transformer|txtai|all-?in-?one ?ai ?framework|semantic search|混合搜索|搜索引擎|meilisearch|typesense|elasticsearch|perplexica|perplexity|morphic|searxng|ai search|llm search|web search agent|hybrid search|deep ?research|长期记忆|记忆层|memory layer|context retrieval|context ?database|上下文数据库|context engine|文档上下文|增量数据处理|airweave|cocoindex/iu,
    ])
  )
    return "rag";

  // ── 7. TRAINING & 微调 ──
  if (
    any(text, [
      /fine-?tun|finetun|lora|qlora|rlhf|dpo|ppo|deepspeed|colossal|colossalai|unsloth|llama-?factory|llamafactory|ms-?swift|axolotl|trl|peft|微调|训练框架|预训练|训练优化|distillation|蒸馏|gradient checkpoint|从零训练|2 小时从零|llama-?stack|minimind|nanogpt|nano-?gpt|reinforcement learning|强化学习|高效微调|训练加速|大模型训练|训练教程/iu,
      /\b(scikit-?learn|keras|tensorflow|pytorch lightning|jax|flax)\b/iu,
    ])
  )
    return "training";

  // ── 8. DATA（爬虫 / ETL / 数据准备 / 教材数据 / 量化） ──
  if (
    any(text, [
      /crawl4ai|crawler|scraper|scraping|firecrawl|easyspider|web scraper|网页抓取|数据采集|数据爬取|爬虫|抓取|annotation|labelstudio|label-?studio|标注平台|数据标注|数据准备|data extraction|etl|data pipeline|mindsdb|qlib|posthog|product analytics|事件分析|数据分析平台|china-?textbook|教材.*pdf|textbook|openbb|金融交易框架|量化投资|多 ?agent ?金融交易/iu,
    ])
  )
    return "data";

  // ── 9. MLOPS（推理服务 / 评测 / Observability / Security） ──
  if (
    any(text, [
      /\b(vllm|sglang|tgi|tritonserver|lmdeploy|langfuse|helicone|arize|opik|mlflow|gptcache|netdata|daytona|litellm|crabtrap|opensre|ai sre|brex)\b/iu,
      /inference engine|inference server|推理引擎|推理服务|推理优化|llm eval|llm benchmark|\bevals?\b|observability|可观测性|monitoring|tracing|deployment platform|guardrail|guardrails|llm security|prompt injection|red ?team|sandbox runtime|提示词攻击|越狱|jailbreak|安全防护|model ?card|prompt ?bench|对抗性 prompt|鲁棒性评估|多模型对比|speculative decoding|推测解码|gemm|cuda 内核|fp8|加速 ?llm ?推理|推理加速|llm 代理|llm 路由|model gateway|api 统一|llm-?as-?a-?judge/iu,
    ])
  )
    return "mlops";

  // ── 10. APP（终端用户产品：聊天客户端/Web UI/IM 客户端） ──
  if (
    any(text, [
      /\b(open-?webui|chatbox|lobehub|lobe-?chat|cherry-?studio|anythingllm|anything-?llm|jan-?ai|chatgpt-?desktop|tlon|enchanted|reka chat|gpt-?academic|chatall|chatbot ?ui|astrbot|cowagent|nicegui|gradio|streamlit|larksuite|finceptterminal|chainlit|botpress|larksuite-cli)\b/iu,
      /chatgpt clone|聊天客户端|web ?ui|chat client|desktop client|跨平台.*ai|ai assistant 客户端|webui|web interface|个人 ?ai ?助手|ai 第二大脑|微信助理|微信机器人|微信助手|im 平台|im ?机器人|telegram bot|qq 机器人|discord bot|gui 库|web ui 库|飞书 ?(cli|客户端)|金融 ?ai ?终端|terminal app|ai 项链|生产力工作室|跨平台桌面/iu,
    ])
  )
    return "app";

  // ── 11. AGENT（自主 Agent / Agent 框架） ──
  if (
    any(text, [
      /\b(smolagents|crewai|autogen|metagpt|openhands|opendevin|openmanus|openclaw|copaw|nanobot|babyagi|auto-?gpt|reworkd|openharness|composio|copilot ?kit|wechaty|honker|deer-?flow|gpt-?researcher|hermes-?agent|tradingagents|virattt|dexter|adk|google[-_]adk|deep-?tutor|generic-?agent|minimax-m2-7|multica|oh-my-openagent|symphony|openviking|botpress|airweave|taskingai|cocoindex|reworkd|agentgpt|mem0|mem-?ai|personaplex|open-?agents|aaif|goose)\b/iu,
      /agent ?framework|agent ?runtime|agent ?sdk|autonomous agent|自主 ?agent|多 ?agent|multi-?agent|agent orchestration|agent platform|agent harness|harness ?builder|harness ?runtime|agent 框架|agent 协作|agent 编排|agentic|长程 ?agent|社交 ?agent|可成长 ?agent|self-?evolving|个人 ?ai ?助手框架|llm-?powered software|hedge.?fund|ai 对冲基金|grow.?agent|agent skills|llm orchestrator|cloud agent|云 agent|swe[- ]?agent|agent 模板|agent 平台|agent 系统|自进化 agent|自进化 ?agent ?系统|多智能体|agent-native|agent ?native|agent 原生/iu,
    ])
  )
    return "agent";

  // ── 12. MODEL（LLM 权重 / 推理运行时 / 模型分发） ──
  if (
    any(text, [
      /\b(ollama|llama\.?cpp|localai|gpt4all|lm ?studio|text-generation-webui|gpt4free|gpt-?4 ?free|llm-?cli|kronos|chatglm|baichuan|yi-?\d|qwen-?\d|deepseek-?(v|r|coder)|llama-?\d|mistral-?\d|mixtral|phi-?\d|gemma)\b/iu,
      /大语言模型|本地部署|本地推理|local llm|model weights|开源模型|moe model|foundation model|多模型免费|免费访问|api 聚合|开源 llm|本地运行 llm/iu,
    ])
  )
    return "model";

  // ── 13. FRAMEWORK（兜底，通用 SDK / 库） ──
  if (
    any(text, [
      /\b(langchain|llamaindex|haystack|dspy|transformers|llmware|supabase|eino)\b/iu,
      /framework|sdk|library|toolkit|开发框架|开发库|backend|postgres|database|存储|ai 框架/iu,
    ])
  )
    return "framework";

  return "UNKNOWN";
}

const NEW_CATS = [
  "model",
  "app",
  "agent",
  "coding",
  "framework",
  "workflow",
  "multimodal",
  "rag",
  "mcp",
  "training",
  "data",
  "mlops",
  "learn",
];

const counts: Record<string, number> = {};
const unknowns: Tool[] = [];
const moves: Record<string, number> = {};
const byNewCat: Record<string, Tool[]> = {};

for (const t of tools) {
  const newCat = classify(t);
  counts[newCat] = (counts[newCat] || 0) + 1;
  byNewCat[newCat] = byNewCat[newCat] || [];
  byNewCat[newCat].push(t);
  if (newCat === "UNKNOWN") unknowns.push(t);
  if (newCat !== t.category) {
    moves[`${t.category}→${newCat}`] = (moves[`${t.category}→${newCat}`] || 0) + 1;
  }
}

console.log("===== 新分类分布 =====");
for (const c of NEW_CATS) {
  console.log(`  ${c.padEnd(12)} = ${counts[c] || 0}`);
}
console.log(`  UNKNOWN     = ${counts["UNKNOWN"] || 0}`);
console.log(`总数: ${tools.length}`);

if (unknowns.length) {
  console.log("\n===== UNKNOWN（未匹配） =====");
  for (const t of unknowns) {
    console.log(
      `  ${t.id.padEnd(40)} [${t.category}] ${t.name} — ${t.description.slice(0, 70)}`,
    );
  }
}

console.log("\n===== Top 移动 =====");
const sortedMoves = Object.entries(moves)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25);
for (const [pair, cnt] of sortedMoves) {
  console.log(`  ${pair.padEnd(28)} × ${cnt}`);
}

const onlyDump = process.argv[2];
if (onlyDump) {
  for (const cat of onlyDump.split(",")) {
    const items = byNewCat[cat] || [];
    console.log(`\n===== ${cat.toUpperCase()} (${items.length}) =====`);
    for (const t of items) {
      console.log(`  ${t.id.padEnd(40)} [${t.category}→${cat}] ${t.name}`);
    }
  }
}

const mapping: Record<string, string> = {};
for (const t of tools) mapping[t.id] = classify(t);
writeFileSync("scripts/_category-mapping.json", JSON.stringify(mapping, null, 2));
console.log("\n✅ mapping 已写入 scripts/_category-mapping.json");
