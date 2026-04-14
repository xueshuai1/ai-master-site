import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const repoMapping = {
  llamaindex: "run-llama/llama_index",
  langfuse: "langfuse/langfuse",
  langchain: "langchain-ai/langchain",
  langgraph: "langchain-ai/langgraph",
  pytorch: "pytorch/pytorch",
  tensorflow: "tensorflow/tensorflow",
  huggingface: "huggingface/transformers",
  vllm: "vllm-project/vllm",
  pandas: "pandas-dev/pandas",
  polars: "pola-rs/polars",
  "stable-diffusion": "Stability-AI/generative-models",
  dify: "langgenius/dify",
  n8n: "n8n-io/n8n",
  "open-webui": "open-webui/open-webui",
  aider: "Aider-AI/aider",
  firecrawl: "mendableai/firecrawl",
  ragflow: "infiniflow/ragflow",
  khoj: "khoj-ai/khoj",
  "continue-dev": "continuedev/continue",
  bolt: "stackblitz/bolt.new",
  openclaw: "openclaw/openclaw",
  ollama: "ollama/ollama",
  flux: "black-forest-labs/flux",
  "fish-audio": "fishaudio/fish-speech",
  letta: "letta-ai/letta",
  llama: "meta-llama/llama",
  gemma: "google-deepmind/gemma",
  deepseek: "deepseek-ai/DeepSeek-V3",
  "qwen-3-5": "QwenLM/Qwen3",
  mastra: "mastra-ai/mastra",
  agentops: "AgentOps-AI/agentops",
  "claude-mem": "thedotmack/claude-mem",
  "hermes-agent": "NousResearch/hermes-agent",
  archon: "coleam00/Archon",
  deeptutor: "HKUDS/DeepTutor",
  "karpathy-skills": "forrestchang/andrej-karpathy-skills",
  "camofox-browser": "jo-inc/camofox-browser",
  personaplex: "NVIDIA/personaplex",
  gallery: "google-ai-edge/gallery",
  seomachine: "TheCraigHewitt/seomachine",
  multica: "multica-ai/multica",
  langflow: "langflow-ai/langflow",
  comfyui: "comfyanonymous/ComfyUI",
  markitdown: "microsoft/markitdown",
  "glm-5": "THUDM/glm-4",
  whisper: "openai/whisper",
  voxcpm: "OpenBMB/VoxCPM",
  kronos: "shiyu-coder/Kronos",
  "ai-hedge-fund": "virattt/ai-hedge-fund",
  autogen: "microsoft/autogen",
  crewai: "crewAIInc/crewAI",
};

async function fetchBatch(repos, token) {
  const queryParts = repos.map((r, i) =>
    `r${i}: repository(owner: "${r.owner}", name: "${r.repo}") { stargazerCount forkCount updatedAt primaryLanguage { name } }`
  ).join('\n');

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `bearer ${token}`;

  const resp = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: `query { ${queryParts} }` }),
  });

  if (!resp.ok) {
    console.error(`HTTP ${resp.status}: ${await resp.text()}`);
    return null;
  }
  return resp.json();
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) { console.error('No GITHUB_TOKEN'); process.exit(1); }

  const mapping = Object.entries(repoMapping);
  const starData = {};
  const errors = [];
  const batchSize = 25;

  for (let i = 0; i < mapping.length; i += batchSize) {
    const batch = mapping.slice(i, i + batchSize);
    const repos = batch.map(([id, repo]) => {
      const [owner, name] = repo.split('/');
      return { id, owner, repo: name };
    });

    console.log(`\nBatch ${Math.floor(i/batchSize)+1}: ${repos.length} repos`);
    const result = await fetchBatch(repos, token);

    if (!result) {
      errors.push(...repos.map(r => r.id));
      continue;
    }

    if (result.errors) {
      console.log(`  ⚠️ ${result.errors.length} errors in batch (partial data still available)`);
    }

    for (let j = 0; j < repos.length; j++) {
      const d = result.data?.[`r${j}`];
      if (d) {
        starData[repos[j].id] = {
          stars: d.stargazerCount,
          forks: d.forkCount,
          language: d.primaryLanguage?.name || null,
          updatedAt: d.updatedAt,
          fetchedAt: new Date().toISOString(),
        };
        const k = (d.stargazerCount / 1000).toFixed(d.stargazerCount > 10000 ? 0 : 1);
        console.log(`  ✅ ${repos[j].id}: ${k}k ⭐`);
      } else {
        const err = result.errors?.find(e => e.path?.[0] === `r${j}`);
        console.log(`  ❌ ${repos[j].id}: ${err?.message || 'not found'}`);
        errors.push(repos[j].id);
      }
    }

    if (i + batchSize < mapping.length) await new Promise(r => setTimeout(r, 1500));
  }

  // Merge with existing
  const outPath = join(__dirname, '..', 'src', 'data', 'github-stars.json');
  let existing = { stars: {} };
  try { existing = JSON.parse(readFileSync(outPath, 'utf-8')); } catch {}

  const merged = { ...existing.stars, ...starData };
  const output = {
    fetchedAt: new Date().toISOString(),
    totalRepos: mapping.length,
    successCount: Object.keys(merged).length,
    errors: errors.length > 0 ? errors : undefined,
    stars: merged,
  };

  writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Saved ${Object.keys(merged).length} repos to github-stars.json`);
  if (errors.length) console.log(`⚠️ ${errors.length} errors: ${errors.join(', ')}`);
}

main().catch(console.error);
