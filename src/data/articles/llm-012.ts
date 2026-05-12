import { Article } from '../knowledge';

export const article: Article = {
  id: "llm-012",
  title: "LLM 部署实践：vLLM, TGI, Ollama",
  category: "llm",
  tags: ["LLM部署", "vLLM", "推理引擎"],
  summary: "从本地到云端，掌握大语言模型的部署方案与性能优化",
  date: "2026-04-12",
  readTime: "20 min",
  level: "进阶",
  content: [
    {
      title: "1. 部署需求分析：延迟、吞吐与成本的三角博弈",
      body: `LLM 部署的核心挑战在于同时满足三个互相矛盾的指标：低延迟（首 token 响应时间）、高吞吐（单位时间处理的 token 数）和低成本（GPU 利用率与显存开销）。实际生产环境中，不同场景的侧重点截然不同——实时对话应用要求首 token 延迟低于 200ms，而离线批量摘要任务则追求吞吐量最大化。选择推理引擎之前，必须先明确你的 SLO（服务等级目标）：QPS 预期多少？并发用户规模？预算上限？此外，模型参数量与量化策略直接影响显存需求，70B 模型即使使用 INT4 量化也需要约 40GB 显存。了解这些约束条件后，才能合理选择推理框架与硬件配置。`,
      code: [
        {
          lang: "python",
          code: `# 估算模型显存需求
def estimate_vram(params_billions: float, dtype: str) -> float:
    dtype_bytes = {"float16": 2, "int8": 1, "int4": 0.5}
    bytes_per_param = dtype_bytes.get(dtype, 2)
    # 模型权重 + KV Cache 预留 (约 20-40%)
    model_vram = params_billions * 1e9 * bytes_per_param / 1e9
    kv_cache_reserve = model_vram * 0.3
    return model_vram + kv_cache_reserve

vram = estimate_vram(70, "int4")
print(f"70B INT4 预估显存: {vram:.1f} GB")  # 约 48.1 GB`
        },
        {
          lang: "yaml",
          code: `# 部署需求清单模板 (infra/requirements.yaml)
serving:
  max_latency_ms: 200        # 首 token 延迟上限
  target_qps: 50             # 预期每秒查询数
  max_concurrent_users: 500  # 最大并发用户
  model_size: "70B"
  quantization: "int4"
  budget_gpu: "A100-80GB x 2"
  availability: "99.9%"`
        }
      ],
      table: {
        headers: ["场景", "首 token 延迟", "吞吐优先", "典型硬件"],
        rows: [
          ["实时对话", "< 200ms", "否", "单卡 A100 / 多卡并行"],
          ["批量摘要", "< 5s 可接受", "是", "A10G / L4"],
          ["RAG 检索增强", "< 500ms", "中等", "A100 40GB"],
          ["代码补全", "< 100ms", "是", "L40S / H100"]
        ]
      },
      mermaid: `graph LR
    A["部署需求"] --> B["延迟敏感"]
    A --> C["吞吐敏感"]
    A --> D["成本敏感"]
    B --> E["vLLM / TGI"]
    C --> F["vLLM 持续批处理"]
    D --> G["Ollama + 量化"]`,
      tip: "先用小模型（7B-13B）验证推理管线，再迁移到大模型，可大幅降低试错成本。",
      warning: "不要忽略 KV Cache 的显存占用——高并发场景下 KV Cache 可能占总显存的 40% 以上。"
    },
    {
      title: "2. vLLM 与 PagedAttention：打破显存碎片化",
      body: `**vLLM** 是由 UC Berkeley 团队开源的高性能推理引擎，其核心技术 PagedAttention 借鉴了操作系统的虚拟内存思想，将 KV Cache 切分为固定大小的「块」（block），通过页表映射实现非连续的显存分配。这一设计彻底消除了传统推理引擎中的显存碎片问题，使显存利用率从 20-30% 提升至 80-90%。**vLLM** 还内置了持续批处理（Continuous Batching）机制，允许不同请求在同一批次中动态进出，而非等待整批请求全部完成才释放资源。这意味着短请求不会被长请求阻塞，系统整体吞吐量可提升 2-4 倍。配合张量并行（Tensor Parallelism），vLLM 可以在多 GPU 环境下线性扩展。`,
      code: [
        {
          lang: "bash",
          code: `# 安装 vLLM 并启动 API 服务
pip install vllm

# 单卡部署 Qwen2.5-7B
vllm serve Qwen/Qwen2.5-7B-Instruct \\
    --host 0.0.0.0 \\
    --port 8000 \\
    --tensor-parallel-size 1 \\
    --max-num-seqs 256 \\
    --gpu-memory-utilization 0.90

# 多卡张量并行（4 卡 A100 部署 70B 模型）
vllm serve Qwen/Qwen2.5-72B-Instruct \\
    --tensor-parallel-size 4 \\
    --quantization awq`
        },
        {
          lang: "python",
          code: `# vLLM Python API：离线批量推理
from vllm import LLM, SamplingParams

llm = LLM(
    model="Qwen/Qwen2.5-7B-Instruct",
    gpu_memory_utilization=0.9,
    max_model_len=8192,
)

prompts = [
    "解释量子计算的基本原理",
    "用 Python 写一个快速排序",
    "分析 2024 年 AI 行业发展趋势",
]
params = SamplingParams(temperature=0.7, max_tokens=512)
outputs = llm.generate(prompts, params)

for o in outputs:
    print(f"Prompt: {o.prompt}")
    print(f"Output: {o.outputs[0].text}\\n")`
        }
      ],
      table: {
        headers: ["特性", "vLLM", "HuggingFace Transformers"],
        rows: [
          ["KV Cache 管理", "PagedAttention（分页）", "连续分配（碎片化）"],
          ["批处理策略", "持续批处理（动态进出）", "静态批处理"],
          ["显存利用率", "80-90%", "20-30%"],
          ["吞吐提升", "2-4x 基准", "1x 基准"]
        ]
      },
      mermaid: `graph TD
    A["请求到达"] --> B["进入等待队列"]
    B --> C["Continuous Batching 调度器"]
    C --> D["分配 KV Block"]
    D --> E["GPU 并行推理"]
    E --> F["生成完成，释放 Block"]
    F --> C`,
      tip: "设置 --gpu-memory-utilization 为 0.90-0.95，留出余量给 CUDA context 和通信开销。",
      warning: "PagedAttention 的 block_size 默认 16，过小会增加页表管理开销，过大会浪费显存，需根据 max_model_len 调整。"
    },
    {
      title: "3. Text Generation Inference (TGI)：Hugging Face 的生产级方案",
      body: `TGI（Text Generation Inference）是 Hugging Face 官方推出的推理框架，用 Rust 和 Python 混合编写，专为生产环境设计。它的核心优势在于与 Hugging Face 生态的无缝集成——支持所有 Hub 上的模型，内置 FlashAttention-2 加速，原生支持 Speculative Decoding（投机解码）和 Token Streaming。TGI 通过 gRPC 协议提供高性能的客户端通信，同时暴露兼容 **OpenAI** 的 REST API 端点。相比 **vLLM**，TGI 在量化支持上更为灵活（支持 GPTQ、AWQ、EETQ 等多种格式），并且提供完善的 Prometheus 指标暴露，方便接入企业级监控系统。Docker 一键部署使其成为团队快速搭建推理服务的理想选择。`,
      code: [
        {
          lang: "bash",
          code: `# TGI Docker 部署
docker run --gpus all \\
    --shm-size 1g \\
    -p 8080:80 \\
    -v /data:/data \\
    ghcr.io/huggingface/text-generation-inference:2.2.0 \\
    --model-id Qwen/Qwen2.5-7B-Instruct \\
    --num-shard 1 \\
    --quantize awq \\
    --max-input-length 4096 \\
    --max-total-tokens 8192 \\
    --max-batch-prefill-tokens 16384

# 测试 API 端点
curl http://localhost:8080/v1/chat/completions \\
    -H "Content-Type: application/json" \\
    -d '{"model":"Qwen/Qwen2.5-7B-Instruct","messages":[{"role":"user","content":"你好"}]}'`
        },
        {
          lang: "python",
          code: `# TGI Python 客户端（openai 兼容模式）
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8080/v1",
    api_key="no-key-needed",
)

# 流式对话
response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[
        {"role": "system", "content": "你是一个专业的 AI 助手。"},
        {"role": "user", "content": "如何优化大模型的推理速度？"},
    ],
    stream=True,
    max_tokens=1024,
    temperature=0.7,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)`
        }
      ],
      table: {
        headers: ["特性", "TGI", "vLLM"],
        rows: [
          ["开发语言", "Rust + Python", "Python + CUDA"],
          ["量化支持", "GPTQ/AWQ/EETQ/FP8", "AWQ/GPTQ/FP8"],
          ["API 协议", "REST + gRPC", "REST (OpenAI 兼容)"],
          ["监控指标", "Prometheus 原生", "需自行配置"],
          ["部署方式", "Docker 官方镜像", "pip / Docker"]
        ]
      },
      mermaid: `graph LR
    A["客户端请求"] --> B["TGI Router (Rust)"]
    B --> C["FlashAttention-2"]
    B --> D["Speculative Decoding"]
    C --> E["GPU 推理"]
    D --> E
    E --> F["流式响应"]
    F --> G["Prometheus 指标"]`,
      tip: "TGI 的 --max-batch-prefill-tokens 参数控制预填充阶段的批处理大小，适当调大可提升吞吐。",
      warning: "TGI 2.x 不再支持旧版 /generate 端点，请迁移到 OpenAI 兼容的 /v1/chat/completions。"
    },
    {
      title: "4. Ollama 本地部署：让大模型跑在你的笔记本上",
      body: `**Ollama** 是目前最流行的本地 LLM 运行方案，主打「零配置」体验。它内置了模型下载、量化、服务和 API 暴露的全流程，用户只需一行命令即可启动。**Ollama** 底层使用 llama.cpp 作为推理引擎，默认采用 GGUF 格式的 INT4 量化，这意味着 7B 模型仅需约 4GB 显存（或内存），Mac 用户甚至可以利用统一内存架构在 Apple Silicon 上流畅运行 70B 模型。Ollama 提供了 Modelfile 机制，允许用户自定义系统提示词、温度参数和上下文窗口，非常适合个人开发者和小型团队快速搭建私有 AI 能力。它还支持多模型并发，可以同时加载不同用途的模型。`,
      code: [
        {
          lang: "bash",
          code: `# 安装 Ollama（macOS / Linux）
curl -fsSL https://ollama.com/install.sh | sh

# 拉取并运行模型
ollama pull qwen2.5:7b
ollama pull qwen2.5:72b  # Apple Silicon M2/M3 推荐

# 启动对话
ollama run qwen2.5:7b "解释 Transformer 架构"

# 查看已加载模型
ollama list
ollama ps

# 创建自定义 Modelfile
cat > Modelfile << 'EOF'
FROM qwen2.5:7b
SYSTEM "你是一个资深程序员，擅长用简洁的代码解决问题。"
PARAMETER temperature 0.3
PARAMETER num_ctx 4096
EOF
ollama create my-coder -f Modelfile`
        },
        {
          lang: "python",
          code: `# Ollama Python SDK
from ollama import chat, ChatResponse

# 简单对话
res: ChatResponse = chat(
    model="qwen2.5:7b",
    messages=[
        {"role": "system", "content": "简洁回答，不要废话。"},
        {"role": "user", "content": "什么是 PagedAttention？"},
    ],
    options={
        "temperature": 0.2,
        "num_predict": 256,
    },
)
print(res.message.content)

# 流式生成
for chunk in chat(
    model="qwen2.5:7b",
    messages=[{"role": "user", "content": "写一首关于 AI 的诗"}],
    stream=True,
):
    print(chunk.message.content, end="", flush=True)`
        }
      ],
      table: {
        headers: ["硬件配置", "推荐模型", "量化", "预估内存/显存"],
        rows: [
          ["Mac M2 16GB", "qwen2.5:7b", "Q4_0 (INT4)", "~4.5 GB"],
          ["Mac M2 Max 32GB", "qwen2.5:14b", "Q4_0 (INT4)", "~9 GB"],
          ["Mac M2 Ultra 64GB", "qwen2.5:72b", "Q4_K_M", "~42 GB"],
          ["NVIDIA RTX 4090 24GB", "qwen2.5:14b", "Q5_K_M", "~10 GB"],
          ["CPU Only 32GB RAM", "qwen2.5:7b", "Q4_0 (INT4)", "~4.5 GB"]
        ]
      },
      mermaid: `graph TD
    A["用户命令"] --> B["Ollama CLI"]
    B --> C["Modelfile 解析"]
    C --> D["下载 GGUF 模型"]
    D --> E["llama.cpp 推理"]
    E --> F["本地 API :11434"]
    F --> G["OpenAI 兼容端点"]`,
      tip: "Mac 用户优先使用统一内存型号运行大模型，M2/M3 Ultra 的 192GB 内存可以容纳 120B+ 模型。",
      warning: "Ollama 默认监听 11434 端口且无鉴权，暴露到公网前务必配置反向代理和 API Key。"
    },
    {
      title: "5. API 服务设计：从推理引擎到生产接口",
      body: `将推理引擎暴露为生产级 API 服务需要考虑多个维度：接口规范、鉴权机制、限流策略、错误处理和可观测性。**OpenAI** 兼容格式已成为事实标准，**vLLM**、TGI 和 **Ollama** 都支持该协议，这意味着客户端代码可以无缝切换底层引擎。但生产环境远不止 "能跑就行"——你需要实现 API Key 鉴权防止滥用，配置速率限制保护服务不被突发流量打垮，设计优雅的重试机制处理临时故障，以及接入日志和指标系统用于故障排查。推荐使用 Nginx 或 Envoy 作为反向代理，配合 LiteLLM 作为统一网关，实现多模型路由、fallback 和负载均衡。`,
      code: [
        {
          lang: "bash",
          code: `# LiteLLM 代理网关：统一管理多个推理后端
pip install litellm[proxy]

# config.yaml：定义多个模型端点
cat > litellm_config.yaml << 'EOF'
model_list:
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/Qwen/Qwen2.5-7B-Instruct
      api_base: http://localhost:8000/v1
      api_key: "sk-internal"
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/Qwen/Qwen2.5-7B-Instruct
      api_base: http://localhost:8080/v1
      api_key: "unused"
  - model_name: ollama-local
    litellm_params:
      model: ollama/qwen2.5:7b
      api_base: http://localhost:11434

litellm_settings:
  drop_params: true
  max_budget: 100
  budget_duration: "30d"
EOF

litellm --config litellm_config.yaml --port 4000`
        },
        {
          lang: "python",
          code: `# FastAPI 封装推理服务（自定义鉴权 + 限流）
from fastapi import FastAPI, HTTPException, Header
from openai import AsyncOpenAI
import asyncio

app = FastAPI()
client = AsyncOpenAI(
    base_url="http://localhost:8000/v1",
    api_key="internal",
)

API_KEYS = {"sk-prod-001": "user-a", "sk-prod-002": "user-b"}
RATE_LIMITS: dict[str, list[float]] = {}

def check_rate_limit(key: str) -> None:
    import time
    now = time.time()
    window = [t for t in RATE_LIMITS.get(key, []) if now - t < 60]
    if len(window) >= 30:  # 30 requests / minute
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    RATE_LIMITS[key] = window + [now]

@app.post("/v1/chat/completions")
async def chat(
    body: dict,
    authorization: str = Header(...),
):
    key = authorization.replace("Bearer ", "")
    if key not in API_KEYS:
        raise HTTPException(status_code=401, detail="Invalid API key")
    check_rate_limit(key)
    return await client.chat.completions.create(**body)`
        }
      ],
      table: {
        headers: ["组件", "职责", "推荐方案"],
        rows: [
          ["API 网关", "路由 / 负载均衡", "LiteLLM / Envoy"],
          ["鉴权", "API Key 验证", "自定义中间件 / Kong"],
          ["限流", "QPS 控制", "Token Bucket / 滑动窗口"],
          ["缓存", "重复请求去重", "Redis / Memcached"],
          ["可观测性", "日志 / 指标 / 链路", "Prometheus + Grafana"]
        ]
      },
      mermaid: `graph LR
    A["客户端"] --> B["Nginx / Envoy"]
    B --> C["LiteLLM 网关"]
    C --> D["鉴权中间件"]
    D --> E["限流器"]
    E --> F["vLLM / TGI / Ollama"]
    F --> G["GPU 推理"]
    G --> F
    F --> E
    E --> D
    D --> C
    C --> B
    B --> A`,
      tip: "使用 LiteLLM 的 fallback 功能：当主推理引擎超时或报错时，自动切换到备用引擎，显著提升可用性。",
      warning: "不要在 API 层暴露原始模型名称，使用抽象别名（如 gpt-4o-mini）以便底层模型无缝替换。"
    },
    {
      title: "6. 性能基准测试：数据驱动选择推理引擎",
      body: `选择推理框架不能仅凭直觉，必须通过基准测试获得量化数据。常用的评测维度包括：首 token 延迟（TTFT, Time To First Token）、端到端延迟、吞吐（tokens/s）、显存占用和并发能力。业界标准的基准测试工具包括 **vLLM** 自带的 benchmark_serving.py、locust 分布式压力测试以及自定义的压测脚本。测试时应模拟真实负载特征——真实的请求并非均匀到达，而是遵循泊松分布的突发模式。同时，输入长度分布（短指令 vs 长文档）和输出长度（短回复 vs 长文章生成）都会显著影响性能表现，务必在你的典型场景下测量。`,
      code: [
        {
          lang: "bash",
          code: `# vLLM 内置基准测试
pip install vllm

# 使用共享数据集测试
python -m vllm.entrypoints.openai.api_server \\
    --model Qwen/Qwen2.5-7B-Instruct &

# 发送基准测试（模拟 100 并发，1000 请求）
python -m vllm.benchmark_serving \\
    --backend openai \\
    --model Qwen/Qwen2.5-7B-Instruct \\
    --dataset-name sharegpt \\
    --dataset-path ShareGPT_V3_unfiltered_cleaned_split.json \\
    --num-prompts 1000 \\
    --request-rate 100 \\
    --save-result

# 输出示例：
# Throughput: 1523.45 requests/s
# Output Token Throughput: 45678.90 tokens/s
# Mean TTFT: 89.12ms
# Median TTFT: 76.45ms`
        },
        {
          lang: "python",
          code: `# 自定义基准测试脚本
import asyncio
import time
from openai import AsyncOpenAI
from dataclasses import dataclass

@dataclass
class BenchResult:
    ttft_ms: float      # Time to first token
    total_ms: float     # End-to-end latency
    output_tokens: int  # Generated tokens
    tokens_per_sec: float

async def benchmark_one(client: AsyncOpenAI, prompt: str) -> BenchResult:
    start = time.perf_counter()
    first_token = None
    total_tokens = 0

    stream = await client.chat.completions.create(
        model="qwen2.5:7b",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        max_tokens=512,
    )
    async for chunk in stream:
        if first_token is None:
            first_token = time.perf_counter()
        if chunk.choices[0].delta.content:
            total_tokens += 1

    elapsed = time.perf_counter() - start
    return BenchResult(
        ttft_ms=(first_token - start) * 1000,
        total_ms=elapsed * 1000,
        output_tokens=total_tokens,
        tokens_per_sec=total_tokens / elapsed,
    )`
        }
      ],
      table: {
        headers: ["推理引擎", "TTFT (ms)", "吞吐 (tok/s)", "显存 (GB)", "并发上限"],
        rows: [
          ["vLLM (7B)", "45", "15,200", "5.2", "256"],
          ["TGI (7B)", "52", "13,800", "5.8", "200"],
          ["Ollama (7B Q4)", "120", "4,500", "4.5", "32"],
          ["Transformers (7B)", "180", "3,200", "14.0", "8"]
        ]
      },
      mermaid: `graph LR
    A["定义测试场景"] --> B["准备测试数据集"]
    B --> C["配置并发参数"]
    C --> D["执行基准测试"]
    D --> E["收集指标"]
    E --> F["TTFT / 吞吐 / 显存"]
    F --> G["生成对比报告"]
    G --> H["选择最优引擎"]`,
      tip: "基准测试前先 warm up GPU（发送 10-20 个预热请求），避免 CUDA kernel 首次编译导致的延迟偏差。",
      warning: "不同量化精度下的性能差异巨大，对比测试时必须保持量化配置一致，否则结果无参考价值。"
    },
    {
      title: "7. 实战演练：从模型下载到 API 上线全流程",
      body: `本节将完整演示从零基础到生产可用 API 的部署全流程。我们选择 Qwen2.5-7B-Instruct 模型，因为它在中文场景表现优异且资源需求适中。整个流程分为五个阶段：环境准备、模型下载、服务启动、性能调优和 API 暴露。生产部署建议使用 Docker Compose 编排服务，包含推理引擎、API 网关、监控和日志组件。所有配置文件纳入版本控制，确保环境可复现。上线后持续监控 GPU 利用率、请求延迟和错误率，设置告警阈值，当 TTFT 超过 200ms 或错误率超过 1% 时自动触发扩容。`,
      code: [
        {
          lang: "yaml",
          code: `# docker-compose.yml：完整生产部署
version: "3.9"
services:
  vllm:
    image: vllm/vllm-openai:latest
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    command: >
      --model Qwen/Qwen2.5-7B-Instruct
      --max-model-len 8192
      --gpu-memory-utilization 0.9
      --enable-prefix-caching
    ports:
      - "8000:8000"
    volumes:
      - hf-cache:/root/.cache/huggingface

  litellm:
    image: ghcr.io/berriai/litellm:latest
    ports:
      - "4000:4000"
    volumes:
      - ./litellm_config.yaml:/app/config.yaml
    command: --config /app/config.yaml --port 4000
    depends_on:
      - vllm

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

volumes:
  hf-cache:`
        },
        {
          lang: "bash",
          code: String.raw`# 上线检查清单脚本
#!/bin/bash
set -euo pipefail

echo "=== LLM 部署上线检查 ==="

# 1. GPU 状态
echo "[1/5] 检查 GPU..."
nvidia-smi --query-gpu=index,name,memory.used,memory.total,utilization.gpu \\
  --format=csv,noheader

# 2. 服务健康
echo "[2/5] 检查 vLLM 服务..."
curl -sf http://localhost:8000/v1/models > /dev/null && echo "  vLLM: OK" || echo "  vLLM: FAIL"

# 3. API 网关
echo "[3/5] 检查 LiteLLM 网关..."
curl -sf http://localhost:4000/health > /dev/null && echo "  LiteLLM: OK" || echo "  LiteLLM: FAIL"

# 4. 端到端测试
echo "[4/5] 端到端推理测试..."
RESPONSE=$(curl -s http://localhost:4000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"1+1="}],"max_tokens":5}')
echo "$RESPONSE" | grep -q "2" && echo "  推理: OK" || echo "  推理: FAIL"

# 5. 延迟测试
echo "[5/5] 延迟测试..."
START=$(date +%s%N)
curl -sf http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model":"Qwen/Qwen2.5-7B-Instruct","messages":[{"role":"user","content":"hi"}]}' \\
  > /dev/null
END=$(date +%s%N)
LATENCY=$(( (END - START) / 1000000 ))
echo "  首请求延迟: \${LATENCY}ms"

echo "=== 检查完成 ==="`
        }
      ],
      table: {
        headers: ["阶段", "操作", "验证标准"],
        rows: [
          ["环境准备", "安装 Docker + NVIDIA Container Toolkit", "nvidia-smi 正常"],
          ["模型下载", "HuggingFace 拉取 / 本地挂载", "模型文件完整"],
          ["服务启动", "docker-compose up -d", "健康检查通过"],
          ["性能调优", "调整 batch size / KV block", "TTFT < 200ms"],
          ["API 暴露", "配置网关 + 鉴权 + 监控", "端到端测试通过"]
        ]
      },
      mermaid: `sequenceDiagram
    participant Dev as 开发者
    participant Docker as Docker Compose
    participant vLLM as vLLM 服务
    participant GW as LiteLLM 网关
    participant User as 最终用户

    Dev->>Docker: docker-compose up -d
    Docker->>vLLM: 启动推理服务
    Docker->>GW: 启动 API 网关
    vLLM-->>Docker: 健康检查 OK
    GW-->>Docker: 健康检查 OK
    User->>GW: POST /v1/chat/completions
    GW->>vLLM: 转发请求
    vLLM-->>GW: 流式响应
    GW-->>User: OpenAI 兼容响应`,
      tip: "启用 prefix caching（--enable-prefix-caching）可以复用相同 system prompt 的 KV Cache，RAG 场景下性能提升 30-50%。",
      warning: "生产环境务必挂载持久化卷缓存 HuggingFace 模型，否则容器重启会重新下载数十 GB 的模型文件。"
    }
  ],
};
