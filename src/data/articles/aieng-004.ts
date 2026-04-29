import { Article } from '../knowledge';

export const article: Article = {
    id: "aieng-004",
    title: "边缘部署：移动端与 IoT",
    category: "aieng",
    tags: ["边缘计算", "移动端部署", "量化"],
    summary: "从 ONNX 到 TensorRT，掌握 ML 模型在边缘设备的部署技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 边缘计算概述",
            body: `边缘计算是将计算和存储资源从云端下沉到靠近数据源的网络边缘侧的技术范式。在 AI 领域，边缘部署意味着将训练好的模型直接运行在手机、IoT 传感器、摄像头、无人机等终端设备上，而非依赖云端推理。这种架构带来三个核心优势：低延迟，因为数据无需往返云端，推理响应可以控制在毫秒级；隐私保护，敏感数据在本地处理，无需上传到远程服务器；离线可用，即使网络中断设备仍能正常工作。边缘设备的算力远不及云端 GPU 集群，因此模型部署前必须经过优化，包括量化、剪枝和蒸馏等技术。常见的边缘 AI 硬件包括 NVIDIA Jetson 系列、Google Edge TPU、Apple Neural Engine 和高通 Hexagon DSP。选择硬件时需要权衡算力、功耗、成本和开发生态四个维度。边缘部署的完整流程通常包含模型选择、格式转换、量化优化、硬件适配和部署验证五个阶段。`,
            code: [
                {
                    lang: "python",
                    code: `import platform\nimport psutil\nimport subprocess\n\ndef get_device_info() -> dict:\n    """获取边缘设备的基本硬件信息"""\n    info = {\n        "platform": platform.system(),\n        "processor": platform.processor(),\n        "cpu_cores": psutil.cpu_count(logical=False),\n        "total_memory_gb": round(psutil.virtual_memory().total / 1e9, 2),\n    }\n    try:\n        gpu_info = subprocess.run(\n            ["nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader"],\n            capture_output=True, text=True, timeout=5,\n        )\n        if gpu_info.returncode == 0:\n            info["gpu"] = gpu_info.stdout.strip()\n    except (FileNotFoundError, subprocess.TimeoutExpired):\n        info["gpu"] = "N/A (no NVIDIA GPU detected)"\n    return info\n\nprint(get_device_info())`
                },
                {
                    lang: "python",
                    code: `import time\nimport numpy as np\nfrom typing import Callable\n\n\nclass LatencyBenchmark:\n    """边缘设备推理延迟基准测试工具"""\n\n    def __init__(self, name: str, warmup_runs: int = 10, benchmark_runs: int = 100):\n        self.name = name\n        self.warmup_runs = warmup_runs\n        self.benchmark_runs = benchmark_runs\n\n    def run(self, inference_fn: Callable, input_data: np.ndarray) -> dict:\n        for _ in range(self.warmup_runs):\n            _ = inference_fn(input_data)\n\n        latencies = []\n        for _ in range(self.benchmark_runs):\n            start = time.perf_counter()\n            _ = inference_fn(input_data)\n            latencies.append((time.perf_counter() - start) * 1000)\n\n        return {\n            "model": self.name,\n            "avg_latency_ms": np.mean(latencies),\n            "p50_latency_ms": np.percentile(latencies, 50),\n            "p99_latency_ms": np.percentile(latencies, 99),\n            "throughput_fps": 1000 / np.mean(latencies),\n        }`
                }
            ],
            table: {
                headers: ["边缘硬件平台", "峰值算力", "典型功耗", "主要优势"],
                rows: [
                    ["NVIDIA Jetson Orin", "275 TOPS", "15-60W", "GPU 生态完善"],
                    ["Google Edge TPU", "4 TOPS", "2W", "极致能效比"],
                    ["Apple Neural Engine", "35 TOPS", "共享功耗", "iOS 深度集成"],
                    ["Qualcomm Hexagon", "45 TOPS", "3-5W", "手机端广泛可用"],
                    ["Intel NCS2", "4 TOPS", "1W", "USB 即插即用"],
                    ["Kendryte K210", "0.8 TOPS", "0.3W", "超低成本 RISC-V"]
                ]
            },
            mermaid: `graph LR
    A[云端训练] --> B[模型优化]
    B --> C[格式转换]
    C --> D[边缘部署]
    D --> E[手机 NPU]
    D --> F[Jetson GPU]
    D --> G[Edge TPU]
    D --> H[MCU DSP]
    E --> I[本地推理]
    F --> I
    G --> I
    H --> I`,
            tip: "在选择边缘硬件之前，先明确你的延迟目标、功耗预算和模型类型，这三者共同决定了最合适的平台。",
            warning: "不要假设云端模型可以直接部署到边缘设备，边缘设备的内存和算力限制通常需要对模型进行显著的压缩和优化。"
        },
        {
            title: "2. 模型量化：PTQ 与 QAT",
            body: `模型量化是将浮点数模型的权重和激活值从 32 位浮点数转换为低精度整数（如 INT8 或 INT4）的过程。量化可以显著减少模型大小和推理延迟，同时大幅降低功耗。量化分为两类：训练后量化和量化感知训练。PTQ 是最简单的方式，它在模型训练完成后直接对权重和激活进行量化校准，通常只需一个小型校准数据集即可运行。PTQ 的精度损失在图像分类等简单任务中往往可以忽略不计，但在目标检测和语义分割等对精度敏感的任务中可能出现明显的精度下降。QAT 则在训练过程中模拟量化噪声，让模型学会适应低精度表示。QAT 的流程是在浮点模型中插入伪量化节点，进行若干轮微调训练后导出量化模型。QAT 的效果通常优于 PTQ，但需要额外的训练时间和更复杂的工程流程。量化粒度的选择也很关键，逐层量化比逐通道量化更简单，但后者的精度通常更好。`,
            code: [
                {
                    lang: "python",
                    code: `import torch\nimport torch.quantization\nfrom torch.utils.data import DataLoader\n\n\ndef calibrate_model(model: torch.nn.Module, dataloader: DataLoader, device: str = "cpu"):\n    """PTQ 校准流程"""\n    model.eval()\n    model.qconfig = torch.quantization.get_default_qconfig("x86")\n    torch.quantization.prepare(model, inplace=True)\n\n    with torch.no_grad():\n        for images, _ in dataloader:\n            _ = model(images.to(device))\n\n    torch.quantization.convert(model, inplace=True)\n    return model\n\n\ndef export_int8_onnx(model: torch.nn.Module, dummy_input: torch.Tensor, path: str):\n    """导出量化后的 ONNX 模型"""\n    torch.onnx.export(\n        model, dummy_input, path,\n        input_names=["input"], output_names=["output"],\n        opset_version=13,\n    )`
                },
                {
                    lang: "python",
                    code: `import torch\nimport torch.nn as nn\nimport torch.quantization\n\n\nclass QATModel(nn.Module):\n    """量化感知训练的模型封装"""\n\n    def __init__(self, backbone: nn.Module, num_classes: int):\n        super().__init__()\n        self.backbone = backbone\n        self.fc = nn.Linear(backbone.fc.in_features, num_classes)\n\n    def forward(self, x):\n        x = self.backbone(x)\n        return self.fc(x)\n\n\ndef prepare_qat(model: nn.Module, dataloader, epochs=3, lr=1e-4):\n    """执行 QAT 微调"""\n    model.qconfig = torch.quantization.get_default_qat_qconfig("x86")\n    torch.quantization.prepare_qat(model, inplace=True)\n\n    optimizer = torch.optim.Adam(model.parameters(), lr=lr)\n    criterion = nn.CrossEntropyLoss()\n\n    for epoch in range(epochs):\n        model.train()\n        for images, labels in dataloader:\n            optimizer.zero_grad()\n            outputs = model(images)\n            loss = criterion(outputs, labels)\n            loss.backward()\n            optimizer.step()\n\n    model.eval()\n    torch.quantization.convert(model, inplace=True)\n    return model`
                }
            ],
            table: {
                headers: ["量化策略", "精度损失", "实现复杂度", "适用场景"],
                rows: [
                    ["FP32 -> INT8 PTQ", "0.1-1%", "低", "图像分类、简单任务"],
                    ["FP32 -> INT8 QAT", "0.1% 以内", "中", "目标检测、语义分割"],
                    ["FP32 -> INT4 PTQ", "1-5%", "中", "大语言模型推理"],
                    ["FP32 -> INT4 QAT", "0.5-2%", "高", "LLM 边缘部署"],
                    ["FP16 混合精度", "几乎为零", "极低", "GPU 推理加速"],
                    ["动态范围量化", "0.2-1.5%", "低", "激活值量化"]
                ]
            },
            mermaid: `graph TD
    A[FP32 模型] --> B{量化策略}
    B -->|"PTQ"| C[校准数据集]
    B -->|"QAT"| D[插入伪量化节点]
    C --> E[收集激活范围]
    D --> F[微调训练]
    E --> G[生成 INT8 模型]
    F --> G
    G --> H[精度验证]
    H -->|"达标"| I[部署]
    H -->|"不达标"| D`,
            tip: "对于大多数 CV 任务，PTQ 已经足够使用，先用 PTQ 快速验证，只有精度不达标时再考虑 QAT。",
            warning: "量化校准数据集必须与真实推理数据的分布一致，否则量化的激活范围估计会严重偏差。"
        },
        {
            title: "3. ONNX 格式与运行时",
            body: `ONNX 是开放神经网络交换格式的缩写，它提供了一个跨框架的模型表示标准。通过 ONNX，你可以在 PyTorch 中训练模型，然后在 ONNX Runtime 中推理，或者转换为 TensorRT、OpenVINO 等硬件专用格式。ONNX 的核心优势在于解耦训练和推理框架，使得模型可以灵活部署到不同平台。ONNX 模型由计算图构成，图中的每个节点代表一个算子，边代表张量数据流。ONNX 支持的操作集随着版本不断扩展，目前已覆盖了大部分主流算子。当遇到不支持的算子时，可以使用自定义算子机制或寻找替代实现。ONNX Runtime 是一个高性能的推理引擎，支持 CPU、GPU 和 NPU 等多种执行后端。它内置了图优化能力，包括算子融合、常量折叠、布局优化等。动态形状支持是 ONNX Runtime 的一大特色，允许输入张量的某些维度在运行时变化，这对 NLP 中的变长序列处理尤为重要。`,
            code: [
                {
                    lang: "python",
                    code: `import torch\nimport onnx\nimport onnxruntime as ort\nimport numpy as np\n\n\ndef torch_to_onnx(model: torch.nn.Module, dummy_input: torch.Tensor,\n                  onnx_path: str, opset_version: int = 17):\n    """PyTorch 模型导出为 ONNX 格式"""\n    model.eval()\n    torch.onnx.export(\n        model,\n        dummy_input,\n        onnx_path,\n        export_params=True,\n        opset_version=opset_version,\n        do_constant_folding=True,\n        input_names=["input"],\n        output_names=["output"],\n        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},\n    )\n\n    # 验证导出的模型\n    onnx_model = onnx.load(onnx_path)\n    onnx.checker.check_model(onnx_model)\n    print("ONNX model validated successfully")`
                },
                {
                    lang: "python",
                    code: `import onnxruntime as ort\nimport numpy as np\nfrom pathlib import Path\n\n\nclass ONNXInferenceEngine:\n    """ONNX Runtime 推理引擎封装"""\n\n    def __init__(self, model_path: str, providers: list = None):\n        if providers is None:\n            providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]\n        self.session = ort.InferenceSession(\n            model_path,\n            providers=providers,\n        )\n        self.input_name = self.session.get_inputs()[0].name\n        self.output_name = self.session.get_outputs()[0].name\n        self.input_shape = self.session.get_inputs()[0].shape\n\n    def predict(self, input_data: np.ndarray) -> np.ndarray:\n        return self.session.run(\n            [self.output_name],\n            {self.input_name: input_data.astype(np.float32)},\n        )[0]\n\n    def get_model_info(self) -> dict:\n        return {\n            "providers": self.session.get_providers(),\n            "input_shape": self.input_shape,\n            "num_inputs": len(self.session.get_inputs()),\n            "num_outputs": len(self.session.get_outputs()),\n        }\n\nengine = ONNXInferenceEngine("model.onnx")\nprint(engine.get_model_info())`
                }
            ],
            table: {
                headers: ["ONNX 执行后端", "硬件支持", "优化级别", "典型延迟"],
                rows: [
                    ["CPUExecutionProvider", "x86/ARM CPU", "图优化", "中等"],
                    ["CUDAExecutionProvider", "NVIDIA GPU", "CUDA 加速", "极低"],
                    ["TensorRTExecutionProvider", "NVIDIA GPU", "深度优化", "最低"],
                    ["CoreMLExecutionProvider", "Apple Silicon", "ANE 加速", "极低"],
                    ["DnnlExecutionProvider", "Intel CPU", "oneDNN", "低"],
                    ["WebGPU", "浏览器 GPU", "Web 推理", "中等"]
                ]
            },
            mermaid: `graph LR
    A[PyTorch] --> B[ONNX 导出]
    C[TensorFlow] --> B
    D[JAX] --> B
    B --> E[ONNX 模型文件]
    E --> F[ONNX Runtime]
    E --> G[TensorRT 转换]
    E --> H[CoreML 转换]
    E --> I[OpenVINO 转换]
    F --> J[多端推理]`,
            tip: "导出 ONNX 时尽量使用最新支持的 opset 版本，新版本通常包含更多优化和更好的算子覆盖。",
            warning: "PyTorch 中的某些动态控制流（如条件分支中的不同输出形状）在导出 ONNX 时可能被截断，需要用 torch.jit.script 或 torch.onnx.dynamo_export 处理。"
        },
        {
            title: "4. TensorRT 优化",
            body: `TensorRT 是 NVIDIA 开发的高性能深度学习推理优化器和运行时，专门针对 NVIDIA GPU 进行深度优化。TensorRT 的优化分为三个阶段：网络定义、图优化和引擎构建。在网络定义阶段，TensorRT 解析模型并构建内部计算图。图优化阶段执行算子融合、内核自动调优和精度校准，将多个小算子合并为一个大算子以减少内存访问开销。引擎构建阶段为每个计算节点选择最优的 CUDA 内核，并生成可在目标 GPU 上高效执行的序列化引擎。TensorRT 支持 FP32、FP16 和 INT8 三种精度模式，FP16 在大多数情况下可以提供接近 2 倍的加速而几乎不损失精度，INT8 则需要校准数据集来确定动态范围。TRT 还提供多流并发执行和动态形状推理等高级功能。对于生产部署，建议将构建好的引擎序列化保存，避免每次启动都重新构建。`,
            code: [
                {
                    lang: "python",
                    code: `import tensorrt as trt\nimport numpy as np\n\n\ndef build_tensorrt_engine(onnx_path: str, engine_path: str,\n                          max_batch_size: int = 1, fp16_mode: bool = True):\n    """从 ONNX 构建 TensorRT 引擎"""\n    logger = trt.Logger(trt.Logger.WARNING)\n    builder = trt.Builder(logger)\n    network = builder.create_network(\n        1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH)\n    )\n    parser = trt.OnnxParser(network, logger)\n\n    with open(onnx_path, "rb") as f:\n        if not parser.parse(f.read()):\n            for error in range(parser.num_errors):\n                print(f"TRT Error {error}: {parser.get_error(error)}")\n            raise RuntimeError("ONNX parsing failed")\n\n    config = builder.create_builder_config()\n    config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, 1 << 30)\n    if fp16_mode:\n        config.set_flag(trt.BuilderFlag.FP16)\n\n    profile = builder.create_optimization_profile()\n    profile.set_shape("input", (1, 3, 224, 224), (4, 3, 224, 224), (8, 3, 224, 224))\n    config.add_optimization_profile(profile)\n\n    engine_bytes = builder.build_serialized_network(network, config)\n    with open(engine_path, "wb") as f:\n        f.write(engine_bytes)\n    print(f"Engine saved to {engine_path}")`
                },
                {
                    lang: "python",
                    code: `import tensorrt as trt\nimport numpy as np\n\n\nclass TensorRTRunner:\n    """TensorRT 推理运行器"""\n\n    def __init__(self, engine_path: str):\n        self.logger = trt.Logger(trt.Logger.WARNING)\n        with open(engine_path, "rb") as f:\n            self.engine = trt.Runtime(self.logger).deserialize_cuda_engine(f.read())\n        self.context = self.engine.create_execution_context()\n\n    def infer(self, input_data: np.ndarray) -> np.ndarray:\n        output_shape = self.engine.get_tensor_shape(self.engine.get_tensor_name(1))\n        output = np.empty(output_shape, dtype=np.float32)\n\n        self.context.set_input_shape("input", input_data.shape)\n        self.context.set_tensor_address("input", input_data.ctypes.data)\n        self.context.set_tensor_address(self.engine.get_tensor_name(1), output.ctypes.data)\n        self.context.execute_v2([])\n\n        return output\n\n    def benchmark(self, input_data: np.ndarray, iterations: int = 200) -> dict:\n        import time\n        times = []\n        for _ in range(iterations):\n            start = time.perf_counter()\n            _ = self.infer(input_data)\n            times.append((time.perf_counter() - start) * 1000)\n        return {"avg_ms": np.mean(times), "p99_ms": np.percentile(times, 99)}`
                }
            ],
            table: {
                headers: ["TensorRT 优化技术", "原理", "加速效果", "精度影响"],
                rows: [
                    ["算子融合", "合并相邻算子", "1.2-2x", "无"],
                    ["FP16 模式", "半精度计算", "1.5-3x", "极小"],
                    ["INT8 量化", "8 位整数计算", "3-6x", "0.1-1%"],
                    ["内核自动调优", "选择最优 CUDA 内核", "1.2-1.5x", "无"],
                    ["层张量化", "减少显存访问", "1.3-2x", "无"],
                    ["多流并发", "并行执行多个推理", "2-4x 吞吐", "无"]
                ]
            },
            mermaid: `graph LR
    A[ONNX 模型] --> B[TensorRT 解析]
    B --> C[图优化]
    C --> D[内核自动调优]
    D --> E[精度校准 INT8]
    E --> F[构建引擎]
    F --> G[序列化保存]
    G --> H[推理执行]
    H --> I[性能监控]`,
            tip: "FP16 模式是性价比最高的优化选项，在几乎不损失精度的前提下可以获得 1.5-3 倍的加速，建议作为首选开启。",
            warning: "TensorRT 引擎是针对特定 GPU 架构编译的，在 A100 上构建的引擎不能直接在 T4 上运行，需要为每种 GPU 单独构建。"
        },
        {
            title: "5. CoreML 与 NNAPI 移动端部署",
            body: `移动端 AI 部署有两个主要平台：Apple 的 CoreML 和 Android 的 NNAPI。CoreML 是 iOS 和 macOS 的机器学习框架，它将模型转换为 Apple 自定义格式后，可以利用 CPU、GPU 和 Neural Engine 进行推理。CoreML 的 Neural Engine 是 Apple 自研的 AI 加速器，在 M 系列芯片上性能尤为出色。Core ML Tools 提供了从 PyTorch、TensorFlow 和 ONNX 到 CoreML 格式的转换工具链。NNAPI 则是 Android 系统的神经网络 API，它作为硬件抽象层将计算委托给可用的加速器，包括 GPU、DSP 和 NPU。Android 端更常用的方案是 TensorFlow Lite，它内置了对 NNAPI 的委托支持。移动端部署的特殊之处在于需要严格控制模型大小和内存占用，因为移动设备的存储和 RAM 资源远不及服务器。此外，移动端还需要考虑电池消耗和热管理问题。`,
            code: [
                {
                    lang: "python",
                    code: `import coremltools as ct\nimport torch\n\n\ndef convert_to_coreml(model: torch.nn.Module, input_shape: tuple = (1, 3, 224, 224),\n                      output_path: str = "model.mlmodel"):\n    """PyTorch 模型转换为 CoreML 格式"""\n    model.eval()\n    example_input = torch.rand(*input_shape)\n    traced_model = torch.jit.trace(model, example_input)\n\n    mlmodel = ct.convert(\n        traced_model,\n        inputs=[ct.TensorType(shape=input_shape)],\n        convert_to="mlprogram",\n        minimum_deployment_target=ct.target.iOS16,\n    )\n\n    mlmodel.save(output_path)\n    print(f"CoreML model saved to {output_path}")\n\n    # 打印模型信息\n    spec = mlmodel.get_spec()\n    for input_desc in spec.description.input:\n        print(f"Input: {input_desc.name}, shape: {input_desc.type.multiArrayType.shape}")\n    for output_desc in spec.description.output:\n        print(f"Output: {output_desc.name}, shape: {output_desc.type.multiArrayType.shape}")`
                },
                {
                    lang: "python",
                    code: `import tensorflow as tf\nimport numpy as np\n\n\ndef convert_to_tflite(model_path: str, output_path: str,\n                      optimize_for_nnapi: bool = True):\n    """Keras 模型转换为 TFLite 格式"""\n    converter = tf.lite.TFLiteConverter.from_saved_model(model_path)\n    converter.optimizations = [tf.lite.Optimize.DEFAULT]\n    converter.target_spec.supported_types = [tf.float16]\n\n    if optimize_for_nnapi:\n        converter.target_spec.supported_ops = [\n            tf.lite.OpsSet.TFLITE_BUILTINS,\n            tf.lite.OpsSet.SELECT_TF_OPS,\n        ]\n\n    tflite_model = converter.convert()\n    with open(output_path, "wb") as f:\n        f.write(tflite_model)\n    print(f"TFLite model size: {len(tflite_model) / 1e6:.1f} MB")\n\n    # 验证推理\n    interpreter = tf.lite.Interpreter(model_path=output_path)\n    interpreter.allocate_tensors()\n    input_details = interpreter.get_input_details()\n    input_data = np.random.randn(*input_details[0]["shape"]).astype(np.float32)\n    interpreter.set_tensor(input_details[0]["index"], input_data)\n    interpreter.invoke()`
                }
            ],
            table: {
                headers: ["部署平台", "支持硬件", "模型格式", "推理引擎"],
                rows: [
                    ["CoreML iOS", "CPU/GPU/ANE", ".mlmodel / .mlpackage", "Neural Engine"],
                    ["CoreML macOS", "CPU/GPU/ANE", ".mlmodel / .mlpackage", "Neural Engine"],
                    ["TFLite + NNAPI", "CPU/GPU/DSP/NPU", ".tflite", "NNAPI Delegate"],
                    ["TFLite 纯 CPU", "ARM CPU", ".tflite", "TFLite Runtime"],
                    ["MediaPipe", "CPU/GPU", "Task API", "跨平台引擎"],
                    ["PyTorch Mobile", "CPU/GPU", ".ptl", "Lite Interpreter"]
                ]
            },
            mermaid: `graph LR
    A[PyTorch 模型] --> B{目标平台}
    B -->|"iOS"| C[CoreML Tools]
    B -->|"Android"| D[TFLite Converter]
    C --> E[.mlpackage]
    D --> F[.tflite]
    E --> G[Neural Engine]
    F --> H[NNAPI Delegate]
    G --> I[iOS 推理]
    H --> J[Android 推理]`,
            tip: "iOS 部署优先使用 CoreML 的 MLProgram 格式而非旧版 NeuralNetwork 格式，MLProgram 支持更多算子且性能更好。",
            warning: "移动端模型转换后一定要在真实设备上验证精度，模拟器或桌面端转换工具的精度不代表真机推理结果。"
        },
        {
            title: "6. 模型压缩：剪枝、蒸馏与量化",
            body: `模型压缩是边缘部署的核心技术栈，它通过减少模型的参数量、计算量或数值精度来实现更高效的推理。结构化剪枝移除整个通道或卷积核，相比非结构化剪枝（移除单个权重）更容易被硬件加速利用。典型的结构化剪枝流程包括：训练原始模型、评估通道重要性、移除不重要的通道、微调恢复精度。迭代剪枝策略在每次剪枝后重新训练一部分轮次，逐步逼近目标压缩率。知识蒸馏则通过让小型学生模型模仿大型教师模型的行为来实现压缩。蒸馏损失函数通常包含硬标签损失和软标签损失两部分，软标签通过教师模型的 logits 计算 KL 散度，使学生模型学习到类别之间的细粒度关系。模型压缩往往不是单一技术的应用，而是剪枝、蒸馏和量化的组合拳，先通过剪枝减少结构冗余，再用蒸馏恢复精度，最后通过量化减少数值精度。`,
            code: [
                {
                    lang: "python",
                    code: `import torch\nimport torch.nn as nn\nimport torch.nn.utils.prune as prune\n\n\ndef iterative_pruning(model: nn.Module, amount: float = 0.3,\n                      iterations: int = 5) -> nn.Module:\n    """迭代结构化剪枝"""\n    per_iteration = 1.0 - (1.0 - amount) ** (1.0 / iterations)\n\n    for i in range(iterations):\n        for name, module in model.named_modules():\n            if isinstance(module, nn.Conv2d):\n                prune.l1_unstructured(module, name="weight", amount=per_iteration)\n                prune.remove(module, "weight")\n\n        # 微调恢复\n        optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)\n        criterion = nn.CrossEntropyLoss()\n        for epoch in range(3):\n            model.train()\n            for inputs, targets in train_loader:\n                optimizer.zero_grad()\n                outputs = model(inputs)\n                loss = criterion(outputs, targets)\n                loss.backward()\n                optimizer.step()\n\n        remaining = sum(\n            (p == 0).sum().item() for p in model.parameters() if p.dim() > 1\n        )\n        print(f"Iteration {i+1}: pruned {remaining} weights")\n\n    return model`
                },
                {
                    lang: "python",
                    code: `import torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\n\nclass KnowledgeDistillationLoss(nn.Module):\n    """知识蒸馏损失函数"""\n\n    def __init__(self, temperature: float = 5.0, alpha: float = 0.7):\n        super().__init__()\n        self.temperature = temperature\n        self.alpha = alpha\n        self.ce_loss = nn.CrossEntropyLoss()\n        self.kl_loss = nn.KLDivLoss(reduction="batchmean")\n\n    def forward(self, student_logits, teacher_logits, hard_labels):\n        soft_targets = F.softmax(teacher_logits / self.temperature, dim=1)\n        student_log_probs = F.log_softmax(\n            student_logits / self.temperature, dim=1\n        )\n        distillation_loss = self.kl_loss(student_log_probs, soft_targets)\n        distillation_loss *= (self.temperature ** 2)\n        student_loss = self.ce_loss(student_logits, hard_labels)\n        return self.alpha * distillation_loss + (1 - self.alpha) * student_loss\n\n\ndef train_with_distillation(student, teacher, dataloader, epochs=10):\n    criterion = KnowledgeDistillationLoss(temperature=5.0, alpha=0.7)\n    optimizer = torch.optim.Adam(student.parameters(), lr=1e-3)\n    teacher.eval()\n\n    for epoch in range(epochs):\n        for inputs, labels in dataloader:\n            with torch.no_grad():\n                teacher_logits = teacher(inputs)\n            student_logits = student(inputs)\n            loss = criterion(student_logits, teacher_logits, labels)\n            optimizer.zero_grad()\n            loss.backward()\n            optimizer.step()`
                }
            ],
            table: {
                headers: ["压缩方法", "压缩率", "精度损失", "实现难度", "硬件友好"],
                rows: [
                    ["非结构化剪枝", "5-10x", "极小", "低", "差（稀疏计算）"],
                    ["结构化剪枝", "2-4x", "0.5-2%", "中", "好（直接删除）"],
                    ["知识蒸馏", "2-8x", "0.5-3%", "高", "无关"],
                    ["INT8 量化", "4x 缩小", "0.1-1%", "低", "好"],
                    ["INT4 量化", "8x 缩小", "1-5%", "高", "中"],
                    ["剪枝 + 量化组合", "8-16x", "1-3%", "高", "好"]
                ]
            },
            mermaid: `graph TD
    A[大型教师模型] --> B[知识蒸馏]
    C[原始模型] --> D[迭代剪枝]
    D --> E[剪枝后模型]
    E --> B
    B --> F[小型学生模型]
    F --> G[INT8 量化]
    G --> H[边缘部署模型]
    A -.->|"Logits 指导"| B
    H --> I[精度验证]`,
            tip: "组合策略中，建议先做剪枝再做蒸馏最后量化，这个顺序可以最大化压缩效果同时最小化精度损失。",
            warning: "知识蒸馏需要教师模型和学生模型在相同的数据上同时运行，内存开销是单独训练的两倍，注意硬件资源限制。"
        },
        {
            title: "7. 实战：PyTorch 到 ONNX 到 TensorRT 完整流程",
            body: `本节通过一个完整的实战案例，演示从 PyTorch 训练模型到 TensorRT 部署的全流程。我们以 ResNet50 图像分类模型为例，依次完成模型导出、ONNX 验证、TensorRT 构建、精度对比和性能基准测试。第一步是在 PyTorch 中加载预训练模型并切换到评估模式，确保 BatchNorm 等层使用推理逻辑。第二步使用 torch.onnx.export 将模型导出为 ONNX 格式，指定动态轴以支持可变批量大小。第三步使用 ONNX Runtime 验证导出模型的正确性，确保 ONNX 推理结果与 PyTorch 推理结果的误差在可接受范围内。第四步使用 TensorRT 解析 ONNX 模型并构建优化引擎，开启 FP16 模式以获得加速。最后进行端到端的精度和性能对比，验证部署模型是否满足生产要求。整个流程的关键在于每个步骤的验证环节，确保质量不劣化地传递到下一阶段。`,
            code: [
                {
                    lang: "python",
                    code: `import torch\nimport torchvision.models as models\nimport onnx\nimport onnxruntime as ort\nimport numpy as np\n\n\ndef export_and_verify(model_name: str = "resnet50", image_size: int = 224):\n    """完整导出和验证流程"""\n    model = models.get_model(model_name, weights="DEFAULT")\n    model.eval()\n\n    # Step 1: Export to ONNX\n    dummy = torch.randn(1, 3, image_size, image_size)\n    onnx_path = f"{model_name}.onnx"\n    torch.onnx.export(\n        model, dummy, onnx_path,\n        export_params=True, opset_version=17,\n        do_constant_folding=True,\n        input_names=["input"], output_names=["output"],\n        dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},\n    )\n    onnx.checker.check_model(onnx.load(onnx_path))\n    print("ONNX export and validation passed")\n\n    # Step 2: Verify ONNX inference matches PyTorch\n    ort_session = ort.InferenceSession(onnx_path)\n    with torch.no_grad():\n        torch_output = model(dummy).numpy()\n    ort_output = ort_session.run(None, {"input": dummy.numpy()})[0]\n    diff = np.abs(torch_output - ort_output).max()\n    print(f"Max difference (PyTorch vs ONNX): {diff:.6f}")\n    assert diff < 1e-3, "Precision mismatch detected!"\n    return onnx_path`
                },
                {
                    lang: "python",
                    code: `import tensorrt as trt\nimport numpy as np\nimport time\n\n\ndef full_tensorrt_pipeline(onnx_path: str, image_size: int = 224):\n    """从 ONNX 到 TensorRT 的完整部署流程"""\n    logger = trt.Logger(trt.Logger.WARNING)\n\n    # Build engine\n    builder = trt.Builder(logger)\n    network = builder.create_network(\n        1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH)\n    )\n    parser = trt.OnnxParser(network, logger)\n    with open(onnx_path, "rb") as f:\n        parser.parse(f.read())\n\n    config = builder.create_builder_config()\n    config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, 2 << 30)\n    config.set_flag(trt.BuilderFlag.FP16)\n    engine_bytes = builder.build_serialized_network(network, config)\n\n    # Run inference\n    runtime = trt.Runtime(logger)\n    engine = runtime.deserialize_cuda_engine(engine_bytes)\n    context = engine.create_execution_context()\n\n    input_shape = (1, 3, image_size, image_size)\n    input_data = np.random.randn(*input_shape).astype(np.float32)\n\n    # Benchmark\n    latencies = []\n    for _ in range(200):\n        start = time.perf_counter()\n        context.execute_v2([])\n        latencies.append((time.perf_counter() - start) * 1000)\n\n    print(f"TensorRT avg latency: {np.mean(latencies):.2f}ms")\n    print(f"TensorRT p99 latency: {np.percentile(latencies, 99):.2f}ms")\n    print(f"Throughput: {1000/np.mean(latencies):.1f} FPS")`
                }
            ],
            table: {
                headers: ["部署阶段", "输入", "输出", "验证方法", "耗时估计"],
                rows: [
                    ["PyTorch 导出", "训练好的模型", "ONNX 文件", "ONNX checker", "1-5 分钟"],
                    ["ONNX 验证", "ONNX 文件", "精度报告", "对比 PyTorch 输出", "1 分钟"],
                    ["TRT 引擎构建", "ONNX 文件", "序列化引擎", "构建日志", "5-30 分钟"],
                    ["TRT 推理验证", "引擎 + 测试数据", "精度报告", "对比 ONNX 输出", "2 分钟"],
                    ["性能基准", "引擎 + 测试数据", "延迟报告", "200 次推理取均值", "1 分钟"],
                    ["生产部署", "引擎文件 + 应用", "在线服务", "端到端压测", "视需求而定"]
                ]
            },
            mermaid: `graph TD
    A[PyTorch ResNet50] --> B[torch.onnx.export]
    B --> C[model.onnx]
    C --> D{ONNX 验证}
    D -->|"Pass"| E[TensorRT 构建 FP16]
    D -->|"Fail"| F[检查 opset / 算子]
    F --> B
    E --> G[model.engine]
    G --> H[推理精度验证]
    H -->|"OK"| I[性能基准测试]
    H -->|"NG"| J[调整构建参数]
    J --> E
    I --> K[生产部署]`,
            tip: "将 TensorRT 引擎构建步骤从推理服务中分离出来，在部署前离线构建并序列化引擎文件，避免服务启动时的长时间等待。",
            warning: "ONNX 到 TensorRT 的转换可能因为不支持的算子而失败，如果遇到问题可以尝试降低 opset 版本或在 PyTorch 端替换等价算子。"
        },
    ],
};
