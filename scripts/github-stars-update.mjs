/**
 * 批量更新所有工具的 GitHub stars
 * 用法: GITHUB_TOKEN=xxx node scripts/github-stars-update.mjs
 * 无 token 也可运行（REST API，较慢但能用）
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 工具 ID -> GitHub repo 映射（url 是官网的也需要查）
const repoMapping = {
  // 已有 GitHub url 的工具
  markitdown: 'microsoft/markitdown',
  'glm-5': 'THUDM/GLM-5',
  whisper: 'openai/whisper',
  voxcpm: 'OpenBMB/VoxCPM',
  kronos: 'shiyu-coder/Kronos',
  'ai-hedge-fund': 'virattt/ai-hedge-fund',
  'claude-mem': 'thedotmack/claude-mem',
  'hermes-agent': 'NousResearch/hermes-agent',
  archon: 'coleam00/Archon',
  deeptutor: 'HKUDS/DeepTutor',
  'karpathy-skills': 'forrestchang/andrej-karpathy-skills',
  'camofox-browser': 'jo-inc/camofox-browser',
  personaplex: 'NVIDIA/personaplex',
  gallery: 'google-ai-edge/gallery',
  seomachine: 'TheCraigHewitt/seomachine',
  multica: 'multica-ai/multica',
  langflow: 'logspace-ai/langflow',
  comfyui: 'comfyanonymous/ComfyUI',
  // 官网 url 但实际有 GitHub 仓库的
  llamaindex: 'run-llama/llama_index',
  langfuse: 'langfuse/langfuse',
  langchain: 'langchain-ai/langchain',
  langgraph: 'langchain-ai/langgraph',
  pytorch: 'pytorch/pytorch',
  tensorflow: 'tensorflow/tensorflow',
  huggingface: 'huggingface/transformers',
  vllm: 'vllm-project/vllm',
  pandas: 'pandas-dev/pandas',
  polars: 'pola-rs/polars',
  'stable-diffusion': 'Stability-AI/StableDiffusion',
  crewai: 'crewAIInc/crewAI',
  autogen: 'microsoft/autogen',
  dify: 'langgenius/dify',
  n8n: 'n8n-io/n8n',
  'open-webui': 'open-webui/open-webui',
  aider: 'aider-ai/aider',
  'openrouter': 'OpenRouterTeam/openrouter',
  'openai-agents-sdk': 'openai/openai-agents-python',
  firecrawl: 'mendableai/firecrawl',
  ragflow: 'infiniflow/ragflow',
  khoj: 'khoj-ai/khoj',
  'continue-dev': 'continuedev/continue',
  bolt: 'stackblitz/bolt.new',
  openclaw: 'openmule/openclaw',
  ollama: 'ollama/ollama',
  flux: 'black-forest-labs/FLUX.1',
  'fish-audio': 'fishaudio/fish-speech',
  letta: 'cpacker/MemGPT',
  llama: 'meta-llama/llama',
  gemma: 'google-deepmind/gemma',
  deepseek: 'deepseek-ai/DeepSeek-V3',
  'qwen-3-5': 'QwenLM/Qwen3.5',
  mastra: 'mastra-ai/mastra',
  agentops: 'AgentOps-AI/agentops',
  // 以下是纯商业产品/无开源仓库的，标记为 null
  // chatgpt, claude, gemini, midjourney, elevenlabs, suno, synthesia, runway 等
  // cursor, cline, windsurf, devin, v0, lovable, manus, notebooklm, mem, reclaim, hume 等
};

// 商业产品/无开源仓库 - 不需要 stars
const noGithub = new Set([
  'chatgpt', 'claude', 'gemini', 'grok', 'midjourney', 'higgsfield',
  'google-veo', 'elevenlabs', 'notebooklm', 'google-notebooklm',
  'google-colab-learn', 'colab-learn', 'gemini-notebooks',
  'nvidia-agent-toolkit', 'manus', 'lovable', 'replit', 'claude-code',
  'claude-cowork', 'cursor', 'google-eloquent', 'windsurf', 'devin',
  'coze', 'v0', 'perplexity-search', 'synthesia', 'runway',
  'adobe-firefly', 'zapier-ai', 'suno', 'lm-studio', 'jetbrains-air',
  'google-veo31-lite', 'mem-ai', 'reclaim-ai', 'hume-ai', 'muse-spark',
  'claude-sonnet-4-5', 'claude-opus-4-6', 'github-copilot',
  'openai-codex', 'cursor-ide', 'mcp',
]);

async function fetchBatchGraphQL(repos, token) {
  const queryParts = repos.map((r, i) => {
    return `r${i}: repository(owner: "${r.owner}", name: "${r.repo}") {
      stargazerCount forkCount updatedAt primaryLanguage { name }
    }`;
  }).join('\n');

  const query = `query { ${queryParts} }`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `bearer ${token}`;

  const resp = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });

  if (!resp.ok) {
    console.error(`GraphQL ${resp.status}: ${await resp.text()}`);
    return null;
  }
  return resp.json();
}

async function fetchREST(owner, repo) {
  const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!resp.ok) return null;
  const d = await resp.json();
  return {
    stargazerCount: d.stargazers_count,
    forkCount: d.forks_count,
    updatedAt: d.updated_at,
    primaryLanguage: { name: d.language },
  };
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const mapping = Object.entries(repoMapping).filter(([id, repo]) => repo !== null);

  console.log(`Total mapped repos: ${mapping.length}`);
  console.log(`No-GitHub tools: ${noGithub.size}`);

  const starData = {};
  const errors = [];

  if (token) {
    console.log('Using GraphQL (batch mode)');
    const batchSize = 25;
    for (let i = 0; i < mapping.length; i += batchSize) {
      const batch = mapping.slice(i, i + batchSize);
      console.log(`\nBatch ${Math.floor(i / batchSize) + 1}: ${batch.length} repos`);

      const repos = batch.map(([id, repo]) => {
        const parts = repo.split('/');
        return { id, owner: parts[0], repo: parts[1] };
      });

      const result = await fetchBatchGraphQL(repos, token);
      if (!result || result.errors) {
        console.error('Batch failed:', result?.errors);
        errors.push(...batch.map(([id]) => id));
        continue;
      }

      for (let j = 0; j < repos.length; j++) {
        const key = `r${j}`;
        const d = result.data?.[key];
        if (d) {
          starData[repos[j].id] = {
            stars: d.stargazerCount,
            forks: d.forkCount,
            language: d.primaryLanguage?.name || null,
            updatedAt: d.updatedAt,
            fetchedAt: new Date().toISOString(),
          };
          console.log(`  ✅ ${repos[j].id}: ${(d.stargazerCount/1000).toFixed(0)}k ⭐`);
        } else {
          console.log(`  ⚠️ ${repos[j].id}: not found`);
          errors.push(repos[j].id);
        }
      }
      if (i + batchSize < mapping.length) await new Promise(r => setTimeout(r, 1000));
    }
  } else {
    console.log('No GITHUB_TOKEN — using REST API (60 req/hr limit, 65s between requests)');
    console.log('For faster results, set GITHUB_TOKEN environment variable');
    for (const [id, repo] of mapping) {
      const [owner, name] = repo.split('/');
      console.log(`Fetching ${id} (${repo})...`);
      const d = await fetchREST(owner, name);
      if (d) {
        starData[id] = {
          stars: d.stargazerCount,
          forks: d.forkCount,
          language: d.primaryLanguage?.name || null,
          updatedAt: d.updatedAt,
          fetchedAt: new Date().toISOString(),
        };
        console.log(`  ✅ ${id}: ${(d.stargazerCount/1000).toFixed(0)}k ⭐`);
      } else {
        console.log(`  ⚠️ ${id}: failed`);
        errors.push(id);
      }
      await new Promise(r => setTimeout(r, 65000));
    }
  }

  // Merge with existing data (preserve any manually added entries)
  const existingPath = join(__dirname, '..', 'src', 'data', 'github-stars.json');
  let existing = { fetchedAt: '', totalRepos: 0, successCount: 0, errors: [], stars: {} };
  try {
    existing = JSON.parse(readFileSync(existingPath, 'utf-8'));
  } catch {}

  const merged = { ...existing.stars, ...starData };

  const output = {
    fetchedAt: new Date().toISOString(),
    totalRepos: Object.keys(repoMapping).filter(k => repoMapping[k] !== null).length,
    noGithubCount: noGithub.size,
    successCount: Object.keys(merged).length,
    errors: errors.length > 0 ? errors : undefined,
    stars: merged,
  };

  writeFileSync(existingPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n✅ Saved ${Object.keys(merged).length} repos to github-stars.json`);
  if (errors.length > 0) console.log(`⚠️ ${errors.length} errors: ${errors.join(', ')}`);
}

main().catch(console.error);
