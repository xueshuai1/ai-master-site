import { Article } from '../knowledge';

export const article: Article = {
    id: "aieng-003",
    title: "模型部署：REST API 与微服务",
    category: "aieng",
    tags: ["模型部署", "REST API", "微服务"],
    summary: "从模型导出到生产服务，掌握 ML 模型的部署策略",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 部署模式概述：批处理、在线与流式",
            body: `模型部署不是把训练好的文件丢到服务器上就完事了。生产环境中的推理服务有三种基本模式，选择哪种取决于业务对延迟、吞吐量和成本的综合要求。

批处理模式适合离线场景，比如每天凌晨跑一次用户画像更新或推荐系统召回。它的优势在于可以最大化 GPU 利用率，一次加载模型处理整批数据，单位推理成本最低。在线推理则要求实时响应，用户发一个请求，系统必须在几百毫秒内返回结果，这对服务的可用性和延迟稳定性提出了极高要求。流式推理介于两者之间，适用于连续数据源，比如传感器数据流或日志分析管道，模型需要持续消费数据并输出结果。

选择部署模式时，关键指标是 P99 延迟和吞吐量。在线服务通常要求 P99 低于 200ms，批处理则关注每小时能处理多少条记录。流式场景需要同时考虑端到端延迟和背压处理能力。`,
            code: [
                {
                    lang: "python",
                    code: `# 批处理推理：最大化 GPU 利用率
import torch
from torch.utils.data import DataLoader

def batch_inference(model, dataset, batch_size=256, device="cuda"):
    model.eval()
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)
    predictions = []

    with torch.no_grad():
        for batch in loader:
            batch = batch.to(device)
            preds = model(batch)
            predictions.append(preds.cpu().numpy())

    return np.concatenate(predictions, axis=0)`
                },
                {
                    lang: "python",
                    code: `# 在线推理：低延迟单条处理
class OnlineInferenceService:
    def __init__(self, model_path):
        self.model = torch.jit.load(model_path)
        self.model.eval()
        self.model.to("cuda")
        self._warmup()

    def _warmup(self):
        dummy = torch.randn(1, 768, device="cuda")
        for _ in range(10):
            _ = self.model(dummy)

    def predict(self, input_tensor):
        with torch.no_grad():
            return self.model(input_tensor.to("cuda"))`
                }
            ],
            table: {
                headers: ["模式", "延迟要求", "吞吐量", "典型场景"],
                rows: [
                    ["批处理", "无实时要求", "极高", "离线推荐、报表"],
                    ["在线推理", "P99 < 200ms", "中等", "搜索、对话"],
                    ["流式推理", "P99 < 50ms", "持续", "监控、异常检测"],
                ],
            },
            mermaid: `graph LR
    A["数据源"] --> B{部署模式选择}
    B -->|"批量数据"| C[批处理管道]
    B -->|"用户请求"| D[在线 API 服务]
    B -->|"持续数据流"| E[流式处理引擎]
    C --> F["结果存储"]
    D --> G["实时响应"]
    E --> H["实时告警"]`,
            tip: "在线服务一定要做模型预热，GPU 冷启动的前几次推理延迟可能高达正常值的 5 倍以上。",
            warning: "批处理看似简单，但数据量增长时容易遭遇内存瓶颈，务必使用 DataLoader 分批加载而非一次性读入。"
        },
        {
            title: "2. 模型格式：ONNX、TorchScript 与 SavedModel",
            body: `训练框架的 checkpoint 不能直接用于生产。PyTorch 的 pth 文件依赖完整的 Python 环境和源代码，TensorFlow 的 SavedModel 虽然自包含但体积庞大。生产部署需要将模型转换为优化后的通用格式。

ONNX 是目前最通用的中间表示格式，支持 PyTorch、TensorFlow、scikit-learn 等多种框架的模型导出。它的核心价值在于跨框架互操作性和推理引擎兼容性。TorchScript 则是 PyTorch 生态内的序列化方案，通过 trace 或 script 将模型转换为独立于 Python 的格式。TensorFlow SavedModel 是 TF 的原生部署格式，与 TensorFlow Serving 深度集成。

选择格式时主要考虑三个因素：目标推理引擎、是否需要跨框架迁移、以及对动态图特性的依赖程度。如果只用 PyTorch 生态，TorchScript 最方便；如果需要部署到多平台，ONNX 是首选；如果是 TensorFlow 项目，SavedModel 配合 TF Serving 是标准方案。`,
            code: [
                {
                    lang: "python",
                    code: `# PyTorch 导出 ONNX
import torch

model = MyModel()
model.load_state_dict(torch.load("model.pth"))
model.eval()

dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    model,
    dummy_input,
    "model.onnx",
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={
        "input": {0: "batch_size"},
        "output": {0: "batch_size"},
    },
    opset_version=17,
)`
                },
                {
                    lang: "python",
                    code: `# PyTorch 导出 TorchScript
import torch

# 方式一：trace（适合无控制流的模型）
model = MyModel().eval()
traced = torch.jit.trace(model, torch.randn(1, 768))
traced.save("model_traced.pt")

# 方式二：script（支持控制流）
class ScriptableModel(torch.nn.Module):
    def forward(self, x):
        if x.dim() > 2:
            return self.encoder(x)
        return self.decoder(x)

scripted = torch.jit.script(ScriptableModel())
scripted.save("model_scripted.pt")`
                }
            ],
            table: {
                headers: ["格式", "框架支持", "推理引擎", "动态图"],
                rows: [
                    ["ONNX", "多框架", "ONNX Runtime", "有限支持"],
                    ["TorchScript", "PyTorch", "LibTorch / C++", "Script 支持"],
                    ["SavedModel", "TensorFlow", "TF Serving", "完整支持"],
                    ["GGUF", "LLM 专用", "llama.cpp", "不支持"],
                ],
            },
            mermaid: `graph TD
    A["PyTorch Checkpoint"] --> B{导出格式}
    A --> C["TorchScript .pt"]
    A --> D["ONNX .onnx"]
    E["TensorFlow Checkpoint"] --> F["SavedModel"]
    B -->|"跨平台需求"| D
    B -->|"纯 PyTorch"| C
    D --> G["ONNX Runtime"]
    D --> H["TensorRT"]
    C --> I["LibTorch C++"]
    F --> J["TensorFlow Serving"]`,
            tip: "导出 ONNX 后务必用 onnx.checker.check_model() 验证格式正确性，再用 onnxruntime 做一次推理对比，确保精度无损。",
            warning: "TorchScript 的 trace 模式无法捕获控制流（if/for），如果你的模型有动态逻辑，必须使用 script 模式或重构模型。"
        },
        {
            title: "3. FastAPI 构建推理 API",
            body: `FastAPI 已经成为 Python 领域构建 ML 推理 API 的事实标准。它基于 ASGI 异步架构，天然支持高并发请求处理，同时自动生成 OpenAPI 文档，让前后端协作变得极其简单。

构建推理 API 的核心挑战不是写路由函数，而是管理模型生命周期。模型加载是重量级操作，必须在应用启动时完成一次，而不是每个请求都加载。此外，输入验证、批量推理、异步处理和错误处理都是生产级服务必须考虑的要素。

FastAPI 的依赖注入系统非常适合管理模型实例，通过 lifespan 上下文管理器可以优雅地处理启动和关闭逻辑。配合 Pydantic 模型做输入验证，可以在请求到达推理代码之前就拦截格式错误的数据，避免模型报错。`,
            code: [
                {
                    lang: "python",
                    code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
import onnxruntime as ort
import numpy as np

class InferenceRequest(BaseModel):
    features: list
    request_id: str | None = None

class InferenceResponse(BaseModel):
    prediction: list
    request_id: str | None = None
    latency_ms: float

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.session = ort.InferenceSession("model.onnx")
    yield
    app.state.session = None

app = FastAPI(lifespan=lifespan)

@app.post("/predict", response_model=InferenceResponse)
async def predict(req: InferenceRequest):
    import time
    t0 = time.time()
    try:
        input_data = np.array([req.features], dtype=np.float32)
        result = app.state.session.run(
            None, {"input": input_data}
        )
        return InferenceResponse(
            prediction=result[0].tolist(),
            request_id=req.request_id,
            latency_ms=(time.time() - t0) * 1000,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))`
                },
                {
                    lang: "bash",
                    code: `# 启动服务并配置 Workers
# Uvicorn 多 worker 模式适合 CPU 推理
uvicorn main:app \\
    --host 0.0.0.0 \\
    --port 8000 \\
    --workers 4 \\
    --log-level info

# 测试 API
curl -X POST http://localhost:8000/predict \\
    -H "Content-Type: application/json" \\
    -d '{"features": [0.5, 1.2, -0.3], "request_id": "test-001"}'

# 查看自动生成的文档
# 浏览器打开 http://localhost:8000/docs`
                }
            ],
            table: {
                headers: ["组件", "作用", "关键配置"],
                rows: [
                    ["lifespan", "模型生命周期管理", "启动加载、关闭释放"],
                    ["Pydantic Model", "请求/响应验证", "类型检查、默认值"],
                    ["Uvicorn Workers", "并发处理", "CPU 推理用多 worker"],
                    ["Middleware", "请求日志/鉴权", "计时、限流、认证"],
                ],
            },
            mermaid: `graph LR
    A["客户端请求"] --> B["FastAPI Gateway"]
    B --> C["Pydantic 验证"]
    C -->|失败| D["400 Bad Request"]
    C -->|通过| E["推理服务"]
    E --> F["ONNX Runtime"]
    F --> G["返回预测结果"]
    G --> B
    B --> H["JSON 响应"]`,
            tip: "对于 GPU 推理服务，不要用多 worker 模式，一个 worker 独占 GPU 即可，多 worker 会导致显存竞争和 OOM。",
            warning: "不要在路由函数中加载模型！每次请求都加载模型会导致延迟从几毫秒飙升到数秒，并且迅速耗尽内存。"
        },
        {
            title: "4. Docker 容器化部署",
            body: `Docker 容器化是 ML 服务从开发环境走向生产环境的关键一步。它解决了在我机器上能跑这个经典问题，确保开发、测试和生产环境的一致性。

ML 服务的 Docker 镜像有几个特殊考量：基础镜像的选择、GPU 驱动的支持、模型文件的打包策略。NVIDIA 提供的 CUDA 基础镜像是 GPU 推理的首选，它预装了 CUDA Toolkit 和 cuDNN，省去了大量环境配置工作。对于 CPU 推理，使用 slim 版本的 Python 镜像可以显著减小镜像体积。

模型文件通常很大，不应该直接打包进镜像。更优雅的方案是在容器启动时从对象存储（S3、OSS）下载模型，或者挂载外部存储卷。这样更新模型时只需要替换文件而不用重新构建镜像。`,
            code: [
                {
                    lang: "dockerfile",
                    code: `# GPU 推理服务的 Dockerfile
FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

WORKDIR /app

# 安装 Python 和依赖
RUN apt-get update && apt-get install -y \\
    python3.11 python3.11-venv && \\
    rm -rf /var/lib/apt/lists/*

RUN python3.11 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
# 模型文件不打包进镜像，启动时从 S3 下载
COPY scripts/download_model.sh ./

EXPOSE 8000

CMD ["sh", "download_model.sh", "&&", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`
                },
                {
                    lang: "bash",
                    code: `# 构建和运行
docker build -t inference-service:v1 .

# CPU 模式运行
docker run -d --name inference \\
    -p 8000:8000 \\
    -e MODEL_URL=s3://bucket/model.onnx \\
    inference-service:v1

# GPU 模式运行（需要 nvidia-container-toolkit）
docker run -d --gpus all --name inference-gpu \\
    -p 8000:8000 \\
    -e MODEL_URL=s3://bucket/model.onnx \\
    -e CUDA_VISIBLE_DEVICES=0 \\
    inference-service:v1

# 查看容器日志
docker logs -f inference-gpu`
                }
            ],
            table: {
                headers: ["镜像类型", "大小", "适用场景", "GPU 支持"],
                rows: [
                    ["nvidia/cuda:runtime", "~3GB", "GPU 推理", "原生支持"],
                    ["python:3.11-slim", "~200MB", "CPU 推理", "不支持"],
                    ["nvidia/cuda:devel", "~10GB", "训练+推理", "完整 CUDA"],
                    ["onnxruntime:latest", "~500MB", "ONNX 推理", "可选"],
                ],
            },
            mermaid: `graph TD
    A["Dockerfile"] --> B["docker build"]
    B --> C["镜像 Registry"]
    C --> D["docker pull"]
    D --> E["容器启动"]
    E --> F["下载模型"]
    F --> G["启动 FastAPI"]
    G --> H["服务就绪"]
    class F s1
    class C s0
    classDef s0 fill:#581c87,stroke:#333
    classDef s1 fill:#713f12,stroke:#333`,
            tip: "使用多阶段构建可以大幅减小镜像体积，把编译工具和依赖安装放在第一阶段，只拷贝最终产物到第二阶段的生产镜像。",
            warning: "容器内不要用 root 用户运行服务，创建专用用户并设置最小权限，这是生产环境的基本安全要求。"
        },
        {
            title: "5. Kubernetes 部署",
            body: `当单一容器无法应对流量规模时，Kubernetes 成为了事实上的容器编排标准。它提供了服务发现、自动重启、滚动更新、配置管理等核心能力，让 ML 服务能够以集群规模可靠运行。

在 K8s 上部署 ML 服务有几个关键资源对象需要理解：Deployment 管理 Pod 的生命周期和副本数，Service 提供稳定的网络入口和负载均衡，ConfigMap 和 Secret 管理配置和敏感信息，HorizontalPodAutoscaler 实现自动扩缩容。

GPU 节点的管理是 K8s ML 部署中最复杂的部分。需要配置 NVIDIA Device Plugin 让 K8s 能够感知和调度 GPU 资源，通过 resource requests 和 limits 精确控制每个 Pod 的 GPU 分配。对于多 GPU 服务器，还可以使用 MIG 技术将一张物理 GPU 切分为多个逻辑实例。`,
            code: [
                {
                    lang: "yaml",
                    code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: inference-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: inference
  template:
    metadata:
      labels:
        app: inference
    spec:
      containers:
        - name: inference
          image: registry.example.com/inference:v1
          ports:
            - containerPort: 8000
          resources:
            requests:
              cpu: "2"
              memory: "4Gi"
              nvidia.com/gpu: 1
            limits:
              cpu: "4"
              memory: "8Gi"
              nvidia.com/gpu: 1
          env:
            - name: MODEL_URL
              value: "s3://bucket/model.onnx"
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10`
                },
                {
                    lang: "yaml",
                    code: `apiVersion: v1
kind: Service
metadata:
  name: inference-service
spec:
  selector:
    app: inference
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: inference-ingress
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /predict
            pathType: Prefix
            backend:
              service:
                name: inference-service
                port:
                  number: 80`
                }
            ],
            table: {
                headers: ["资源对象", "作用", "关键配置"],
                rows: [
                    ["Deployment", "管理 Pod 副本", "replicas、strategy"],
                    ["Service", "网络入口+LB", "type: ClusterIP/LoadBalancer"],
                    ["Ingress", "外部路由", "host、path、TLS"],
                    ["HPA", "自动扩缩容", "min/max replicas、metrics"],
                ],
            },
            mermaid: `graph TD
    A["用户请求"] --> B["Ingress Controller"]
    B --> C["Service (ClusterIP)"]
    C --> D["Pod 1"]
    C --> E["Pod 2"]
    C --> F["Pod 3"]
    D --> G["GPU:0"]
    E --> G
    F --> H["GPU:1"]
    I["HPA"] -.监控指标.-> D
    I -.扩缩容.-> J["Deployment"]
    J -.管理.-> D
    J -.管理.-> E
    J -.管理.-> F`,
            tip: "使用 readinessProbe 而不是 livenessProbe 来检测服务是否就绪，避免模型加载期间被误杀。livenessProbe 的超时时间要设置得足够长。",
            warning: "GPU 资源请求和限制必须一致（requests = limits），否则 K8s 调度器可能将多个 Pod 调度到同一 GPU 上导致 OOM。"
        },
        {
            title: "6. 自动扩缩容与负载均衡",
            body: `生产环境的流量从来不是均匀的。早高峰、营销活动、突发事件都可能导致流量激增。自动扩缩容确保服务在流量峰值时不会崩溃，在低谷时不会浪费资源。

Kubernetes HPA 基于 CPU、内存或自定义指标自动调整 Pod 副本数。对于 ML 服务，CPU 使用率往往不是最好的扩缩容指标，更合理的是使用请求队列长度、P99 延迟或 GPU 利用率。Kubernetes 的自定义指标 API 配合 Prometheus 可以实现基于业务指标的扩缩容。

负载均衡方面，除了 K8s Service 自带的轮询策略，生产环境通常需要更智能的策略：最少连接数可以避免某些 Pod 因为处理慢请求而积压，一致性哈希可以确保同一个用户的请求路由到同一个 Pod，利用模型缓存提高响应速度。`,
            code: [
                {
                    lang: "yaml",
                    code: `# 基于自定义指标的 HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: inference-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: inference-service
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Pods
      pods:
        metric:
          name: inference_queue_depth
        target:
          type: AverageValue
          averageValue: "10"
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 4
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 120`
                },
                {
                    lang: "python",
                    code: `# Prometheus 自定义指标导出器
from prometheus_client import Histogram, Counter, Gauge
import time

# 推理延迟直方图
INFERENCE_LATENCY = Histogram(
    "inference_latency_seconds",
    "Inference latency",
    buckets=[0.01, 0.05, 0.1, 0.2, 0.5, 1.0],
)

# 请求队列深度
QUEUE_DEPTH = Gauge(
    "inference_queue_depth",
    "Number of pending requests",
)

# 请求计数器
REQUEST_COUNT = Counter(
    "inference_requests_total",
    "Total inference requests",
    ["status"],
)

@INFERENCE_LATENCY.time()
def run_inference(input_data):
    REQUEST_COUNT.labels(status="success").inc()
    return model.predict(input_data)`
                }
            ],
            table: {
                headers: ["扩缩容指标", "优点", "缺点", "适用场景"],
                rows: [
                    ["CPU 使用率", "简单、原生支持", "不反映 ML 负载", "CPU 推理"],
                    ["请求队列深度", "直接反映压力", "需自定义指标", "在线推理"],
                    ["P99 延迟", "面向用户体验", "指标波动大", "SLA 严格的服务"],
                    ["GPU 利用率", "GPU 推理最佳", "需 GPU 监控插件", "GPU 推理服务"],
                ],
            },
            mermaid: `graph LR
    A["Prometheus"] --> B["队列深度指标"]
    A --> C["P99 延迟指标"]
    B --> D["HPA Controller"]
    C --> D
    D -->|"扩容"| E["增加 Pod"]
    D -->|"缩容"| F["减少 Pod"]
    E --> G["Service 自动发现"]
    F --> G
    G --> H["负载均衡分发"]`,
            tip: "缩容策略的 stabilizationWindowSeconds 要设置得比扩容长（建议 300s 以上），避免流量波动导致频繁的扩缩容震荡。",
            warning: "HPA 的扩缩容不是即时的，新 Pod 从创建到就绪通常需要 30-60 秒。如果流量突增非常剧烈，需要配合 KEDA 的预测性扩缩容或使用保底副本数。"
        },
        {
            title: "7. 实战：完整部署流水线",
            body: `理论讲完了，现在把所有环节串起来，构建一条从模型训练完成到生产服务上线的完整部署流水线。这条流水线涵盖模型导出、镜像构建、自动化测试、灰度发布和回滚机制。

一条成熟的 ML 部署流水线应该包含以下阶段：首先是 CI 阶段，在代码提交时自动运行单元测试和模型精度验证，确保新代码没有破坏推理逻辑。然后是构建阶段，将模型和代码打包为 Docker 镜像，推送到容器镜像仓库。接下来是 CD 阶段，通过 GitOps 工具（如 ArgoCD）将新镜像部署到 K8s 集群。最后是验证阶段，运行集成测试和金丝雀分析，确认服务指标正常后完成全量发布。

灰度发布是 ML 服务上线的关键安全措施。先用 5% 的流量测试新版本，对比新旧版本的延迟和准确率指标，如果一切正常再逐步提升比例到 50%、100%。整个过程可以完全自动化，一旦检测到异常立即回滚。`,
            code: [
                {
                    lang: "yaml",
                    code: `# GitHub Actions CI/CD Pipeline
name: ML Deploy Pipeline
on:
  push:
    branches: [main]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run model tests
        run: |
          pip install -r requirements.txt
          pytest tests/ -v
          python scripts/validate_model.py

      - name: Build and push
        run: |
          docker build -t registry/inference:\${{ github.sha }} .
          docker push registry/inference:\${{ github.sha }}

  deploy:
    needs: test-and-build
    runs-on: ubuntu-latest
    steps:
      - name: Update K8s manifest
        run: |
          sed -i "s|image:.*|image: registry/inference:\${{ github.sha }}|" k8s/deployment.yaml
          kubectl apply -f k8s/

      - name: Wait and verify
        run: |
          kubectl rollout status deployment/inference-service --timeout=300s
          python scripts/smoke_test.py`
                },
                {
                    lang: "yaml",
                    code: `# Argo Rollouts 金丝雀发布配置
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: inference-rollout
spec:
  replicas: 5
  strategy:
    canary:
      steps:
        - setWeight: 5
        - pause: { duration: 5m }
        - setWeight: 25
        - pause: { duration: 5m }
        - setWeight: 50
        - pause: { duration: 10m }
        - setWeight: 100
      analysis:
        templates:
          - templateName: inference-analysis
        startingStep: 1
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: inference-analysis
spec:
  metrics:
    - name: error-rate
      interval: 1m
      successCondition: result[0] < 0.01
      provider:
        prometheus:
          query: |
            sum(rate(inference_requests_total{status="error"}[1m]))
            /
            sum(rate(inference_requests_total[1m]))`
                }
            ],
            table: {
                headers: ["流水线阶段", "工具", "产出物", "关键检查点"],
                rows: [
                    ["CI 测试", "pytest", "测试报告", "单元测试 + 精度验证"],
                    ["镜像构建", "Docker", "容器镜像", "镜像扫描、大小检查"],
                    ["CD 部署", "ArgoCD", "K8s 资源", "滚动更新策略"],
                    ["金丝雀验证", "Argo Rollouts", "分析报告", "错误率 < 1%"],
                ],
            },
            mermaid: `graph LR
    A["代码推送"] --> B["CI: 测试"]
    B -->|通过| C["构建镜像"]
    C --> D["推送 Registry"]
    D --> E["ArgoCD 检测"]
    E --> F["金丝雀 5％"]
    F --> G{"指标正常?"}
    G -->|是| H["逐步放量"]
    G -->|否| I["自动回滚"]
    H --> J["全量发布"]
    class J s1
    class I s0
    classDef s0 fill:#7f1d1d,stroke:#333
    classDef s1 fill:#14532d,stroke:#333`,
            tip: "每次模型更新前保留旧版本镜像至少 7 天，这样即使新版本上线后发现问题，回滚只需要切回旧镜像，几秒钟就能完成。",
            warning: "不要在金丝雀阶段使用有状态的服务实例，灰度流量可能不均匀导致部分用户的数据状态不一致。确保推理服务是无状态的。"
        },
    ],
};
