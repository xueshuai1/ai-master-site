import { Article } from '../knowledge';

export const article: Article = {
    id: "mlops-004",
    title: "模型边缘部署：移动端、IoT 与 MLOps Pipeline",
    category: "mlops",
    tags: ["边缘计算", "移动端部署", "量化"],
    summary: "从 ONNX 到 CoreML，掌握 ML 模型在边缘设备的部署技术",
    date: "2026-04-12",
    readTime: "18 min",
    level: "进阶",
    content: [
        {
            title: "1. 边缘计算概述",
            body: `边缘计算将数据推理从云端转移到靠近数据源的设备端执行，这一范式转变正在重塑 AI 应用的部署架构。传统的云端推理模式面临延迟高、带宽消耗大和隐私风险等固有瓶颈，而边缘推理直接在手机、IoT 网关或嵌入式设备上运行模型，可以实现毫秒级响应、离线可用性和数据本地处理。边缘部署的典型场景包括智能手机上的实时图像识别、工业 IoT 设备的异常检测、自动驾驶中的目标感知以及智能家居的语音唤醒。然而，边缘设备在算力、内存和功耗方面存在严格约束，这使得直接将云端训练的模型部署到边缘面临巨大挑战。解决这些约束需要从模型架构设计（如 MobileNet、EfficientNet）、模型压缩（量化、剪枝、知识蒸馏）到推理引擎优化（TensorRT、CoreML、NNAPI）的全栈方案。边缘计算不是简单地搬运模型，而是根据设备能力重新思考整个推理链路。在架构选型上，需要综合考虑目标设备的芯片架构（ARM vs x86 vs RISC-V）、可用的加速器（NPU、GPU、DSP）以及操作系统的生态支持，才能做出最优的部署决策。`,
            code: [
                {
                    lang: "python",
                    code: `from dataclasses import dataclass\nfrom enum import Enum\n\nclass DeviceType(Enum):\n    MOBILE = "mobile"\n    IOT_GATEWAY = "iot_gateway"\n    EMBEDDED = "embedded"\n    AUTOMOTIVE = "automotive"\n\n@dataclass\nclass DeviceConstraint:\n    device_type: DeviceType\n    max_model_size_mb: float\n    max_latency_ms: float\n    max_power_mw: float\n    has_npu: bool\n\n# 典型边缘设备约束参数\nMOBILE_CONSTRAINT = DeviceConstraint(\n    device_type=DeviceType.MOBILE,\n    max_model_size_mb=50.0,\n    max_latency_ms=100.0,\n    max_power_mw=500.0,\n    has_npu=True\n)\n\ndef check_deployment_feasibility(\n    model_size_mb: float,\n    latency_ms: float,\n    constraint: DeviceConstraint\n) -> bool:\n    \"\"\"检查模型是否满足目标设备的部署约束\"\"\"\n    return (\n        model_size_mb <= constraint.max_model_size_mb\n        and latency_ms <= constraint.max_latency_ms\n    )\n\nprint(check_deployment_feasibility(35, 80, MOBILE_CONSTRAINT))`
                },
                {
                    lang: "python",
                    code: `import platform\nimport psutil\nimport subprocess\n\ndef detect_edge_hardware():\n    \"\"\"检测边缘设备的硬件能力，用于推理引擎选型\"\"\"\n    info = {}\n\n    # CPU 信息\n    info["cpu_cores"] = psutil.cpu_count(logical=False)\n    info["cpu_freq_mhz"] = psutil.cpu_freq().current if psutil.cpu_freq() else 0\n\n    # 内存\n    info["ram_mb"] = psutil.virtual_memory().total / (1024 ** 2)\n\n    # GPU 加速（macOS 检查 Metal）\n    if platform.system() == "Darwin":\n        result = subprocess.run(\n            ["system_profiler", "SPDisplaysDataType"],\n            capture_output=True, text=True\n        )\n        info["has_gpu"] = "Apple M" in result.stdout\n\n    # 平台判定\n    if platform.machine() in ("arm64", "aarch64"):\n        info["arch"] = "ARM"\n        info["has_npu"] = platform.system() == "Darwin"  # Apple Neural Engine\n    else:\n        info["arch"] = "x86_64"\n        info["has_npu"] = False\n\n    return info\n\nprint(detect_edge_hardware())`
                }
            ],
            table: {
                headers: ["部署模式", "延迟", "带宽", "隐私", "离线能力", "典型场景"],
                rows: [
                    ["云端推理", "50-500ms", "高", "低", "无", "大规模 LLM"],
                    ["边缘网关", "10-50ms", "中", "中", "部分", "工业 IoT"],
                    ["端侧设备", "1-20ms", "无", "高", "完全", "手机/手表"],
                    ["混合模式", "可变", "低", "高", "部分", "智能音箱"]
                ]
            },
            mermaid: `graph TD
    A[传感器/摄像头] --> B[边缘设备]
    B -->|本地推理| C[实时响应]
    B -->|仅结果上报| D[云端]
    D -->|模型更新| B
    C --> E[用户反馈]
    B -.->|无网络| C`,
            tip: "优先在模型设计阶段就考虑边缘约束，选择 MobileNetV3、EfficientNet-Lite 等专为移动端优化的架构，比后期压缩大模型效果好得多。",
            warning: "不要忽略功耗约束。边缘设备通常由电池供电，高功耗推理会导致设备快速发热和续航骤降，直接影响用户体验。"
        },
        {
            title: "2. 模型量化：PTQ 与 QAT",
            body: `模型量化是边缘部署中最核心的优化技术之一，它通过将模型的权重和激活值从 32 位浮点数（FP32）降低到 8 位整数（INT8）甚至更低精度，实现模型体积缩小 4 倍和推理加速 2-4 倍的效果。量化分为两大类：训练后量化（Post-Training Quantization, PTQ）和量化感知训练（Quantization-Aware Training, QAT）。PTQ 是最简单的量化方式，只需在模型训练完成后使用少量校准数据（通常 100-500 个样本）来统计激活值的分布，然后确定量化的缩放因子和零点。PTQ 的优势是快速且无需重新训练，适用于大多数分类和检测任务。QAT 则在训练过程中模拟量化操作，在 forward 传播时插入伪量化节点（FakeQuantize），让模型在训练时就适应量化带来的精度损失。QAT 的精度通常比 PTQ 高 1-3 个百分点，但需要完整的训练周期和调参。选择 PTQ 还是 QAT 取决于精度要求和可用资源：对于精度要求严格的场景（如医疗图像分析），QAT 是必须的；对于容错率较高的任务（如内容推荐），PTQ 已经足够。在 PyTorch 2.0 之后，torch.ao.quantization 模块提供了统一的量化 API，支持静态量化、动态量化和权重量化三种模式。`,
            code: [
                {
                    lang: "python",
                    code: `import torch\nimport torch.nn as nn\n\n# PTQ: 训练后静态量化（推荐用于边缘部署）\ndef apply_ptq(model: nn.Module, calib_dataloader, num_batches=100):\n    \"\"\"对训练好的模型执行训练后量化\"\"\"\n    model.eval()\n\n    # 融合 Conv + BN 层（量化前必须）\n    model = torch.ao.quantization.fuse_modules(\n        model, [["conv1", "bn1"], ["conv2", "bn2"]], inplace=True\n    )\n\n    # 配置量化参数\n    model.qconfig = torch.ao.quantization.get_default_qconfig("qnnpack")\n    torch.ao.quantization.prepare(model, inplace=True)\n\n    # 校准：用少量数据激活统计信息收集\n    with torch.no_grad():\n        for i, (data, _) in enumerate(calib_dataloader):\n            if i >= num_batches:\n                break\n            model(data)\n\n    # 转换为量化模型\n    torch.ao.quantization.convert(model, inplace=True)\n    return model\n\n# 验证量化效果\nprint(f"Model size reduced: {get_model_size(quantized_model):.1f} MB")`
                },
                {
                    lang: "python",
                    code: `import torch\nimport torch.nn as nn\nimport torch.quantization as tq\n\n# QAT: 量化感知训练\ndef apply_qat(model: nn.Module, train_dataloader, epochs=5):\n    \"\"\"量化感知训练流程\"\"\"\n    model.eval()\n\n    # 先融合模块\n    model = torch.ao.quantization.fuse_modules(\n        model, [["conv1", "bn1"], ["conv2", "bn2"]], inplace=True\n    )\n\n    # 配置 QAT\n    model.qconfig = torch.ao.quantization.get_default_qat_qconfig("qnnpack")\n    torch.ao.quantization.prepare_qat(model, inplace=True)\n\n    # 训练过程中模拟量化\n    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)\n    criterion = nn.CrossEntropyLoss()\n\n    for epoch in range(epochs):\n        model.train()\n        for data, target in train_dataloader:\n            optimizer.zero_grad()\n            output = model(data)\n            loss = criterion(output, target)\n            loss.backward()\n            optimizer.step()\n\n    # 转换为最终量化模型\n    model.eval()\n    torch.ao.quantization.convert(model, inplace=True)\n    return model`
                }
            ],
            table: {
                headers: ["量化方法", "训练需求", "精度保持", "适用场景", "工具支持"],
                rows: [
                    ["动态量化", "无需训练", "较好", "NLP/RNN", "PyTorch 内置"],
                    ["静态量化 PTQ", "校准数据", "好", "CV/分类", "PyTorch/TFLite"],
                    ["权重量化", "无需训练", "最好", "仅权重敏感", "CoreML/TFLite"],
                    ["QAT 量化", "完整训练", "最优", "高精度要求", "PyTorch/TFLite"],
                    ["混合精度", "微调", "接近无损", "大模型部署", "TensorRT/ONNX"]
                ]
            },
            mermaid: `graph LR
    A[FP32 训练模型] --> B{量化策略}
    B -->|简单快速| C[动态量化]
    B -->|推荐方案| D[PTQ 静态量化]
    B -->|最高精度| E[QAT 量化感知]
    C --> F[FP16/INT8]
    D --> F
    E --> F
    F --> G[INT8 边缘模型]`,
            tip: "PTQ 量化前务必先融合 Conv+BN+ReLU 模块，否则量化效果大打折扣。使用 torch.ao.quantization.fuse_modules 一行即可完成。",
            warning: "量化后一定要在验证集上评估精度损失。如果精度下降超过 2%，建议改用 QAT 或尝试混合精度量化策略。"
        },
        {
            title: "3. ONNX 格式与运行时",
            body: `ONNX（Open Neural Network Exchange）是微软和 Meta 联合开发的开放模型格式，已经成为 ML 模型跨框架互操作的事实标准。它解决了深度学习领域最头痛的碎片化问题：你用 PyTorch 训练的模型，可以直接通过 ONNX 在 TensorFlow Serving、TensorRT 或 CoreML 上运行。ONNX 的核心设计理念是将不同深度学习框架的算子映射到一个统一的中层表示（Intermediate Representation, IR），这个 IR 由计算图（Graph）、节点（Node）、张量（Tensor）和属性（Attribute）组成。ONNX Runtime 是官方的高性能推理引擎，支持 CPU、GPU、NPU 等多种执行提供者（Execution Provider），并且内置了图优化功能，包括算子融合、常量折叠和内存优化。在实际的边缘部署工作流中，ONNX 通常作为中间格式：先用 PyTorch 或 TensorFlow 训练模型并导出为 ONNX，再用目标平台的专用工具（如 CoreML Tools 或 TFLite Converter）将 ONNX 转换为目标格式。ONNX 的最新版本（Opset 17+）已经支持了绝大多数主流算子，包括注意力机制和动态形状。对于边缘设备，ONNX Runtime Mobile 提供了精简版的推理引擎，模型大小仅 3-5 MB，非常适合嵌入式环境。`,
            code: [
                {
                    lang: "python",
                    code: `import torch\nimport torch.onnx\n\n# 从 PyTorch 导出 ONNX 模型\ndef export_to_onnx(model, sample_input, output_path, opset_version=17):\n    \"\"\"将 PyTorch 模型导出为 ONNX 格式\"\"\"\n    model.eval()\n\n    torch.onnx.export(\n        model,\n        sample_input,\n        output_path,\n        export_params=True,\n        opset_version=opset_version,\n        do_constant_folding=True,\n        input_names=["input"],\n        output_names=["output"],\n        dynamic_axes={\n            "input": {0: "batch_size"},\n            "output": {0: "batch_size"}\n        }\n    )\n    print(f"Exported to {output_path}")\n\n    # 验证导出模型\n    import onnx\n    onnx_model = onnx.load(output_path)\n    onnx.checker.check_model(onnx_model)\n    print("ONNX model validated")\n\n    # 打印模型信息\n    print(f"Opset version: {onnx_model.opset_import[0].version}")\n    print(f"Num nodes: {len(onnx_model.graph.node)}")`
                },
                {
                    lang: "python",
                    code: `import onnxruntime as ort\nimport numpy as np\n\n# 使用 ONNX Runtime 进行推理\nclass ONNXInferencer:\n    def __init__(self, model_path):\n        # 选择执行提供者（优先级从高到低）\n        providers = [\n            ("CUDAExecutionProvider", {}),\n            ("CoreMLExecutionProvider", {}),\n            ("CPUExecutionProvider", {})\n        ]\n        self.session = ort.InferenceSession(\n            model_path,\n            providers=providers\n        )\n        self.input_name = self.session.get_inputs()[0].name\n        self.output_name = self.session.get_outputs()[0].name\n\n        # 获取输入形状信息\n        shape = self.session.get_inputs()[0].shape\n        print(f"Expected input shape: {shape}")\n\n    def predict(self, input_data: np.ndarray) -> np.ndarray:\n        result = self.session.run(\n            [self.output_name],\n            {self.input_name: input_data}\n        )\n        return result[0]\n\n# 性能测试\ninferencer = ONNXInferencer("model.onnx")\nimport time\nstart = time.perf_counter()\nfor _ in range(100):\n    inferencer.predict(np.random.randn(1, 3, 224, 224).astype(np.float32))\nprint(f"Average latency: {(time.perf_counter() - start) / 100 * 1000:.1f} ms")`
                }
            ],
            table: {
                headers: ["ONNX 执行提供者", "硬件支持", "性能", "适用平台"],
                rows: [
                    ["CPUExecutionProvider", "通用 CPU", "基准", "所有平台"],
                    ["CUDAExecutionProvider", "NVIDIA GPU", "极快", "服务器/工作站"],
                    ["CoreMLExecutionProvider", "Apple Silicon", "快", "macOS/iOS"],
                    ["TensorrtExecutionProvider", "NVIDIA GPU", "最快", "NVIDIA Jetson"],
                    ["QNNExecutionProvider", "Qualcomm DSP/NPU", "快", "Android/骁龙"],
                    ["WebNNExecutionProvider", "浏览器硬件加速", "中", "Web 浏览器"]
                ]
            },
            mermaid: `graph LR
    A[PyTorch] -->|torch.onnx| B[ONNX 模型]
    C[TensorFlow] -->|tf2onnx| B
    D[PaddlePaddle] -->|paddle2onnx| B
    B -->|onnx-coreml| E[CoreML]
    B -->|tflite_convert| F[TFLite]
    B -->|trtexec| G[TensorRT]
    B -->|ORT| H[ONNX Runtime]`,
            tip: "导出 ONNX 时尽量使用最新的 opset 版本（当前推荐 17+），新版本支持更多算子和更好的优化策略。",
            warning: "ONNX 不支持所有 PyTorch 算子，特别是自定义算子和部分动态操作。导出失败时，用 torch.onnx.export 的 custom_opsets 参数注册自定义算子。"
        },
        {
            title: "4. CoreML 与 NNAPI 移动端部署",
            body: `CoreML 和 NNAPI 分别是 Apple 和 Android 平台的官方移动端推理框架，它们提供了将 ML 模型部署到智能手机的标准路径。CoreML 是 Apple 生态中模型部署的首选方案，它可以将模型转换为 .mlmodel 格式，直接利用设备的神经网络引擎（Neural Engine）、GPU 和 CPU 进行推理。CoreML 的优势在于与 Apple 系统深度集成：模型可以作为 Swift 对象直接在 Xcode 项目中使用，无需额外的运行时库。从 iOS 15 开始，CoreML 支持自定义 Metal 算子和灵活的输入形状，大幅扩展了模型兼容性。NNAPI（Android Neural Networks API）则是 Android 平台的对应方案，它提供了一个硬件无关的推理抽象层，可以自动选择 CPU、GPU 或 NPU（如 Qualcomm Hexagon、MediaTek APU）来执行推理。NNAPI 从 Android 8.1 开始引入，在 Android 10 之后得到了显著改进。在实际开发中，推荐使用 TensorFlow Lite 作为中间层，因为 TFLite 的 NNAPI Delegate 封装了底层的复杂性。对于跨平台移动应用，一种常见的架构是：在服务器端将模型转换为 ONNX，然后分别用 coremltools 和 TFLite Converter 转换为 CoreML 和 TFLite 格式。这种双格式方案虽然增加了维护成本，但能确保在两个平台上都获得最佳性能。`,
            code: [
                {
                    lang: "python",
                    code: `import coremltools as ct\nimport torch\n\n# 将 PyTorch 模型转换为 CoreML 格式\ndef convert_to_coreml(model, sample_input, output_path):\n    \"\"\"PyTorch -> TorchScript -> CoreML\"\"\"\n    model.eval()\n\n    # 1. 导出为 TorchScript\n    traced_model = torch.jit.trace(model, sample_input)\n\n    # 2. 转换为 ML Program（CoreML 新格式）\n    mlmodel = ct.convert(\n        traced_model,\n        inputs=[ct.TensorType(shape=sample_input.shape)],\n        convert_to="mlprogram",  # iOS 15+ 推荐格式\n        compute_precision=ct.precision.FLOAT16,\n        minimum_deployment_target=ct.target.iOS15\n    )\n\n    # 3. 添加元数据\n    mlmodel.short_description = "Image classification model"\n    mlmodel.author = "AI Master Site"\n    mlmodel.license = "MIT"\n\n    # 4. 保存\n    mlmodel.save(output_path)\n    print(f"Saved CoreML model to {output_path}")\n\n    # 5. 验证模型\n    import coremltools\n    spec = coremltools.utils.load_spec(output_path)\n    print(f"Input: {spec.description.input}")\n    print(f"Output: {spec.description.output}")`
                },
                {
                    lang: "python",
                    code: `import tensorflow as tf\n\n# 将模型转换为 TFLite 并启用 NNAPI 委托\ndef convert_to_tflite(model, output_path):\n    \"\"\"转换模型为 TFLite 格式并优化移动端部署\"\"\"\n    converter = tf.lite.TFLiteConverter.from_keras_model(model)\n\n    # 启用优化\n    converter.optimizations = [tf.lite.Optimize.DEFAULT]\n    converter.target_spec.supported_types = [tf.float16]\n\n    # 导出 TFLite 模型\n    tflite_model = converter.convert()\n    with open(output_path, "wb") as f:\n        f.write(tflite_model)\n    print(f"Saved TFLite model: {len(tflite_model) / 1024:.1f} KB")\n\n# 在 Android 上运行 TFLite（Java/Kotlin 侧模拟）\ntflite_code = \"\"\"\n// Android 侧加载和运行 TFLite 模型\nval interpreter = Interpreter(loadModelFile(context, "model.tflite"))\n\n// 配置 NNAPI 委托\nval options = Interpreter.Options()\noptions.setUseNNAPI(true)  // 启用 Android NPU 加速\noptions.setNumThreads(4)\n\nval inputBuffer = TensorBuffer.createFixedSize(intArrayOf(1, 224, 224, 3), DataType.FLOAT32)\nval outputBuffer = TensorBuffer.createFixedSize(intArrayOf(1, 1000), DataType.FLOAT32)\n\ninputBuffer.loadImage(image)\ninterpreter.run(inputBuffer.buffer, outputBuffer.buffer)\nval predictions = outputBuffer.floatArray\n\"\"\"\nprint(tflite_code)`
                }
            ],
            table: {
                headers: ["特性", "CoreML (Apple)", "TFLite + NNAPI (Android)"],
                rows: [
                    ["最低系统版本", "iOS 12 / macOS 10.14", "Android 8.1+"],
                    ["硬件加速", "Neural Engine / GPU / CPU", "NPU / GPU / CPU"],
                    ["模型格式", ".mlmodel / .mlpackage", ".tflite"],
                    ["转换工具", "coremltools", "TFLite Converter"],
                    ["量化支持", "INT8 / FP16", "INT8 / FP16 / FLOAT16"],
                    ["自定义算子", "Metal Shading Language", "Custom OP (C++)"],
                    ["开发语言", "Swift / Objective-C", "Kotlin / Java / C++"]
                ]
            },
            mermaid: `graph TD
    A[ONNX 模型] --> B{目标平台}
    B -->|iOS/macOS| C[coremltools]
    B -->|Android| D[TFLite Converter]
    C --> E[.mlpackage]
    D --> F[.tflite]
    E --> G[Swift App]
    F --> H[Kotlin App]
    G --> I[Neural Engine]
    H --> J[NNAPI / NPU]`,
            tip: "CoreML 的 ML Program 格式（iOS 15+）比旧的 NeuralNetwork 格式性能更好且支持更多算子。转换时始终指定 convert_to=mlprogram。",
            warning: "TFLite 对动态形状支持有限。如果模型有变长序列输入，需要使用 TFLite 的 SignatureDef 或固定输入形状。"
        },
        {
            title: "5. TensorRT 推理优化",
            body: `TensorRT 是 NVIDIA 开发的高性能深度学习推理 SDK，专为 NVIDIA GPU（包括 Jetson 系列边缘设备）优化。它的核心价值在于通过一系列编译期优化技术，将训练好的模型转换为高度优化的推理引擎。TensorRT 的优化策略包括：层融合（将 Conv + BN + ReLU 融合为单个内核）、内核自动调优（为特定 GPU 选择最优的 CUDA 内核实现）、精度校准（支持 FP16 和 INT8 推理）以及动态 Tensor 内存管理。TensorRT 的工作流程分为两个阶段：构建阶段和推理阶段。在构建阶段，TensorRT 解析模型（支持 ONNX、PyTorch、TensorFlow），应用图优化和内核选择，然后序列化生成一个 .engine 文件。这个 engine 文件是平台和 GPU 特定的，需要针对每种目标 GPU 单独构建。在推理阶段，加载 engine 文件并执行推理，此时的延迟和吞吐量都经过了极致优化。对于边缘场景，NVIDIA Jetson 系列（Orin Nano、AGX Orin 等）是部署 TensorRT 的理想硬件平台，它们将 GPU、CPU 和内存集成在单一模块中，功耗从 7W 到 60W 不等。在 Jetson 上部署 TensorRT 时，需要注意 CUDA 版本和 TensorRT 版本的兼容性，建议使用 NVIDIA 提供的 JetPack SDK 来管理整个软件栈。`,
            code: [
                {
                    lang: "python",
                    code: `import tensorrt as trt\nimport numpy as np\n\n# 使用 TensorRT Python API 构建推理引擎\ndef build_engine(onnx_path, engine_path):\n    \"\"\"将 ONNX 模型编译为 TensorRT Engine\"\"\"\n    TRT_LOGGER = trt.Logger(trt.Logger.WARNING)\n\n    # 创建 builder 和 network\n    builder = trt.Builder(TRT_LOGGER)\n    network = builder.create_network(\n        1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH)\n    )\n\n    # 解析 ONNX 模型\n    parser = trt.OnnxParser(network, TRT_LOGGER)\n    with open(onnx_path, "rb") as f:\n        parser.parse(f.read())\n    print(f"Parsed ONNX: {network.num_layers} layers")\n\n    # 配置构建参数\n    config = builder.create_builder_config()\n    config.max_workspace_size = 1 << 30  # 1 GB 工作空间\n    config.set_flag(trt.BuilderFlag.FP16)  # 启用 FP16 推理\n\n    # 构建引擎\n    engine = builder.build_serialized_network(network, config)\n    with open(engine_path, "wb") as f:\n        f.write(engine)\n    print(f"Built engine: {len(engine) / 1024:.1f} KB")\n    return engine`
                },
                {
                    lang: "python",
                    code: `import tensorrt as trt\nimport pycuda.driver as cuda\nimport pycuda.autoinit\nimport numpy as np\nimport time\n\nclass TensorRTInferencer:\n    def __init__(self, engine_path):\n        TRT_LOGGER = trt.Logger(trt.Logger.WARNING)\n        with open(engine_path, "rb") as f:\n            self.runtime = trt.Runtime(TRT_LOGGER)\n            self.engine = self.runtime.deserialize_cuda_engine(f.read())\n        self.context = self.engine.create_execution_context()\n        print(f"Engine loaded: {self.engine.num_io_tensors} tensors")\n\n    def infer(self, input_data: np.ndarray) -> np.ndarray:\n        \"\"\"执行单次推理\"\"\"\n        # 分配内存\n        h_input = cuda.pagelocked_empty(\n            trt.volume(self.engine.get_tensor_shape(0)), dtype=np.float32\n        )\n        h_output = cuda.pagelocked_empty(\n            trt.volume(self.engine.get_tensor_shape(1)), dtype=np.float32\n        )\n        d_input = cuda.mem_alloc(h_input.nbytes)\n        d_output = cuda.mem_alloc(h_output.nbytes)\n\n        # 绑定地址\n        self.context.set_tensor_address("input", int(d_input))\n        self.context.set_tensor_address("output", int(d_output))\n\n        # 执行推理\n        np.copyto(h_input, input_data.ravel())\n        stream = cuda.Stream()\n        cuda.memcpy_htod_async(d_input, h_input, stream)\n        self.context.execute_async_v3(stream_handle=stream.handle)\n        cuda.memcpy_dtoh_async(h_output, d_output, stream)\n        stream.synchronize()\n\n        return h_output\n\n# 性能基准测试\ninferencer = TensorRTInferencer("model_fp16.engine")\ntimes = []\nfor _ in range(200):\n    start = time.perf_counter()\n    inferencer.infer(np.random.randn(1, 3, 224, 224).astype(np.float32))\n    times.append((time.perf_counter() - start) * 1000)\nprint(f"P50: {np.percentile(times, 50):.1f}ms, P99: {np.percentile(times, 99):.1f}ms")`
                }
            ],
            table: {
                headers: ["TensorRT 精度模式", "精度", "速度提升", "显存占用", "适用硬件"],
                rows: [
                    ["FP32", "32-bit float", "基准 (1x)", "最高", "所有 NVIDIA GPU"],
                    ["FP16", "16-bit float", "1.5-2x", "减半", "Compute >= 6.0"],
                    ["INT8", "8-bit integer", "2-4x", "1/4", "Compute >= 6.1 + DLSS"],
                    ["FP8", "8-bit float", "3-5x", "1/4", "Hopper/Ada (>= 8.9)"]
                ]
            },
            mermaid: `graph LR
    A[ONNX 模型] -->|trtexec / Python API| B[TensorRT Builder]
    B -->|层融合| C[优化计算图]
    C -->|内核调优| D[选择最优 CUDA 内核]
    D -->|精度校准| E[FP16 / INT8 Engine]
    E -->|序列化| F[.engine 文件]
    F -->|加载运行| G[推理执行]`,
            tip: "使用 trtexec 命令行工具可以快速测试 TensorRT 优化效果：trtexec --onnx=model.onnx --fp16 --saveEngine=model.engine，无需写代码。",
            warning: "TensorRT Engine 文件和 GPU 架构强绑定。在 Jetson Orin 上构建的 engine 不能在 Jetson Nano 上运行，需要分别为每个目标设备构建。"
        },
        {
            title: "6. 模型压缩：剪枝、蒸馏与量化",
            body: `模型压缩是边缘部署的前提条件，它通过减少模型参数数量或降低数值精度，使原本只能在服务器上运行的模型能够适配资源受限的边缘设备。模型压缩有三大核心技术：剪枝（Pruning）、知识蒸馏（Knowledge Distillation）和量化（Quantization）。剪枝通过移除神经网络中不重要的连接或整个通道来减少模型体积。非结构化剪枝会移除单个权重，产生稀疏矩阵；结构化剪枝则移除整个卷积核或通道，产生更小的密集矩阵，后者对边缘部署更友好因为能直接减少计算量。知识蒸馏利用一个大型教师模型来指导一个小型学生模型的训练，使学生模型在保持小体积的同时尽可能模仿教师模型的行为。蒸馏的损失函数通常结合了真实标签的交叉熵损失和学生/教师输出分布的 KL 散度。这三种技术可以组合使用：先对大模型进行剪枝减少参数，再用知识蒸馏恢复精度，最后通过量化进一步压缩体积和加速推理。一个典型的压缩流程可以将 ResNet-50 从 98 MB 压缩到 12 MB（剪枝 + 蒸馏 + INT8 量化），同时保持 95% 以上的原始精度。PyTorch 提供了 torch.ao.pruning 模块支持结构化剪枝，而蒸馏则需要自定义训练循环。`,
            code: [
                {
                    lang: "python",
                    code: `import torch\nimport torch.nn.utils.prune as prune\n\n# 结构化剪枝示例：移除不重要的卷积通道\ndef apply_structured_pruning(model, amount=0.3):\n    \"\"\"对模型中的 Conv2d 层执行 L1 结构化剪枝\"\"\"\n    for name, module in model.named_modules():\n        if isinstance(module, torch.nn.Conv2d):\n            # L1 非结构化剪枝\n            prune.l1_unstructured(module, name="weight", amount=amount)\n            # 将剪枝永久化\n            prune.remove(module, "weight")\n\n    return model\n\n# 计算剪枝后的稀疏度\ndef calc_sparsity(model):\n    total = 0\n    zeros = 0\n    for name, param in model.named_parameters():\n        if "weight" in name:\n            total += param.numel()\n            zeros += (param == 0).sum().item()\n    return zeros / total * 100\n\npruned_model = apply_structured_pruning(model, amount=0.4)\nprint(f"Sparsity after pruning: {calc_sparsity(pruned_model):.1f}%")`
                },
                {
                    lang: "python",
                    code: `import torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass DistillationLoss(nn.Module):\n    \"\"\"知识蒸馏损失：结合硬标签和软标签\"\"\"\n    def __init__(self, temperature=4.0, alpha=0.5):\n        super().__init__()\n        self.temperature = temperature\n        self.alpha = alpha  # 蒸馏损失权重\n        self.hard_loss = nn.CrossEntropyLoss()\n\n    def forward(self, student_logits, teacher_logits, labels):\n        # 硬标签损失\n        hard = self.hard_loss(student_logits, labels)\n\n        # 软标签蒸馏损失 (KL 散度)\n        soft_student = F.log_softmax(\n            student_logits / self.temperature, dim=1\n        )\n        soft_teacher = F.softmax(\n            teacher_logits / self.temperature, dim=1\n        )\n        soft = F.kl_div(\n            soft_student, soft_teacher, reduction="batchmean"\n        ) * (self.temperature ** 2)\n\n        return self.alpha * soft + (1 - self.alpha) * hard\n\n# 蒸馏训练循环\nteacher_model.eval()\nfor data, labels in train_loader:\n    with torch.no_grad():\n        teacher_logits = teacher_model(data)\n    student_logits = student_model(data)\n    loss = distill_loss(student_logits, teacher_logits, labels)\n    loss.backward()\n    optimizer.step()`
                }
            ],
            table: {
                headers: ["压缩技术", "压缩比", "精度影响", "实施难度", "推理加速"],
                rows: [
                    ["非结构化剪枝", "2-5x", "小 (1-2%)", "低", "需要稀疏硬件"],
                    ["结构化剪枝", "2-8x", "中 (2-5%)", "中", "直接减少计算"],
                    ["知识蒸馏", "2-10x", "极小 (<1%)", "高 (需教师模型)", "取决于学生模型"],
                    ["INT8 量化", "4x 体积", "小 (1-3%)", "中", "2-4x 加速"],
                    ["组合策略", "8-20x", "中 (3-8%)", "高", "4-8x 加速"]
                ]
            },
            mermaid: `graph TD
    A[大模型 Teacher] -->|蒸馏| B[小模型 Student]
    A -->|剪枝| C[稀疏 Teacher]
    C -->|蒸馏| B
    B -->|量化| D[压缩模型]
    D -->|INT8| E[边缘部署]
    A -.->|直接量化| E`,
            tip: "知识蒸馏的温度参数 T 很关键：T 越大教师输出越平滑，蒸馏效果通常越好。推荐从 T=4 开始，在 2-8 范围内搜索最佳值。",
            warning: "结构化剪枝的通道选择策略很重要。不要随机剪枝，务必基于 L1/L2 范数选择最不重要的通道，否则精度会严重下降。"
        },
        {
            title: "7. 实战：PyTorch 到 ONNX 到 CoreML 完整流程",
            body: `本节通过一个完整的实战案例，演示如何将一个 PyTorch 训练的图像分类模型部署到 iPhone 上运行。整个流程涵盖四个阶段：模型训练与导出、ONNX 格式转换、CoreML 格式转换和 iOS 应用集成。假设我们训练了一个基于 EfficientNet-B0 的图像分类模型，目标是将模型部署到 iPhone 14 以上的设备上。第一阶段，在 PyTorch 中完成模型训练后，使用 torch.jit.trace 导出 TorchScript 模型，然后转换为 ONNX 格式。这里需要注意动态轴的设置，以支持批处理大小的变化。第二阶段，使用 onnx-simplifier 工具简化 ONNX 图，消除冗余节点和死代码。第三阶段，使用 coremltools 将 ONNX 模型转换为 CoreML ML Program 格式，启用 FP16 量化以适配 Neural Engine。第四阶段，在 iOS 项目中集成 CoreML 模型，编写 Vision 框架的图像预处理管道。整个流程中，精度验证是关键环节：每一步转换后都需要在相同的验证集上测试，确保精度损失不超过 0.5%。如果精度下降过大，需要回退到上一步并检查转换参数。通过这个完整流程，你可以在一天内完成从训练到部署的端到端验证。`,
            code: [
                {
                    lang: "python",
                    code: `import torch\nimport torch.onnx\nimport onnx\nfrom onnxsim import simplify\nimport coremltools as ct\n\ndef pytorch_to_coreml(model, input_shape=(1, 3, 224, 224),\n                      onnx_path="model.onnx",\n                      mlmodel_path="model.mlpackage"):\n    \"\"\"完整转换流程：PyTorch -> ONNX -> CoreML\"\"\"\n    model.eval()\n    dummy_input = torch.randn(*input_shape)\n\n    # Step 1: PyTorch -> ONNX\n    print("Step 1: Exporting to ONNX...")\n    torch.onnx.export(\n        model, dummy_input, onnx_path,\n        opset_version=17,\n        input_names=["image"],\n        output_names=["predictions"],\n        dynamic_axes={\n            "image": {0: "batch"},\n            "predictions": {0: "batch"}\n        }\n    )\n\n    # Step 2: Simplify ONNX\n    print("Step 2: Simplifying ONNX...")\n    onnx_model = onnx.load(onnx_path)\n    simplified, check = simplify(onnx_model)\n    onnx.save(simplified, "model_simplified.onnx")\n    print(f"  Nodes: {len(onnx_model.graph.node)} -> {len(simplified.graph.node)}")\n\n    # Step 3: ONNX -> CoreML\n    print("Step 3: Converting to CoreML...")\n    mlmodel = ct.convert(\n        "model_simplified.onnx",\n        convert_to="mlprogram",\n        compute_precision=ct.precision.FLOAT16,\n        minimum_deployment_target=ct.target.iOS15\n    )\n\n    # 添加图像输入类型\n    mlmodel.input_description["image"] = "Input image (224x224 RGB)"\n    mlmodel.output_description["predictions"] = "Class probabilities"\n    mlmodel.save(mlmodel_path)\n\n    # Step 4: 验证精度\n    print("Step 4: Verifying CoreML model...")\n    coreml_model = ct.models.MLModel(mlmodel_path)\n    coreml_input = {"image": dummy_input.numpy()}\n    coreml_output = coreml_model.predict(coreml_input)\n\n    with torch.no_grad():\n        pytorch_output = model(dummy_input).numpy()\n\n    diff = abs(coreml_output["predictions"] - pytorch_output).max()\n    print(f"  Max difference: {diff:.6f}")\n    print(f"  Model saved to: {mlmodel_path}")\n    return mlmodel_path\n\n# 执行完整流程\n# model = torch.hub.load("NVIDIA/DeepLearningExamples", "efficientnet_b0")\n# pytorch_to_coreml(model)`
                },
                {
                    lang: "text",
                    code: `import UIKit\nimport Vision\nimport CoreML\n\nclass ImageClassifier {\n    private let model: VNCoreMLModel\n    private let request: VNCoreMLRequest\n\n    init() throws {\n        // 加载 CoreML 模型\n        guard let mlModel = try? ImageClassifierModel(\n            configuration: MLModelConfiguration()\n        ) else {\n            fatalError("Failed to load model")\n        }\n        model = try VNCoreMLModel(for: mlModel.model)\n\n        // 配置 Vision 请求\n        request = VNCoreMLRequest(model: model) { [weak self] request, error in\n            guard let results = request.results as? [VNClassificationObservation],\n                  let top = results.first else { return }\n            print("Classification: \\(top.identifier) (\\(top.confidence))")\n        }\n\n        // 预处理配置\n        request.imageCropAndScaleOption = .centerCrop\n    }\n\n    func classify(image: UIImage) {\n        guard let cgImage = image.cgImage else { return }\n        let handler = VNImageRequestHandler(cgImage: cgImage)\n        try? handler.perform([request])\n    }\n\n    func classifyBatch(images: [UIImage]) {\n        // 批量推理：CoreML 支持 batch prediction\n        let requests = images.map { image -> VNCoreMLRequest in\n            let req = VNCoreMLRequest(model: model)\n            req.imageCropAndScaleOption = .centerCrop\n            return req\n        }\n        let handler = VNImageRequestHandler(cgImage: images[0].cgImage!)\n        try? handler.perform(requests)\n    }\n}`
                }
            ],
            table: {
                headers: ["转换步骤", "输入格式", "输出格式", "工具", "精度检查"],
                rows: [
                    ["模型导出", "PyTorch .pt", "ONNX", "torch.onnx.export", "对比推理输出"],
                    ["图简化", "ONNX", "Simplified ONNX", "onnx-simplifier", "无需检查"],
                    ["格式转换", "ONNX", "CoreML ML Program", "coremltools", "最大差值 < 1e-3"],
                    ["量化优化", "FP32 CoreML", "FP16 CoreML", "coremltools", "精度损失 < 0.5%"],
                    ["iOS 集成", "CoreML 文件", "Swift App", "Xcode + Vision", "端到端测试"]
                ]
            },
            mermaid: `graph TD
    A[PyTorch 训练] -->|jit.trace| B[TorchScript]
    B -->|torch.onnx.export| C[ONNX 模型]
    C -->|onnx-simplifier| D[简化 ONNX]
    D -->|coremltools| E[CoreML ML Program]
    E -->|FP16 量化| F[优化 CoreML]
    F -->|Xcode 导入| G[iOS App]
    G -->|Vision 框架| H[实时分类]
    C -.->|"精度验证"| I[对比测试]
    I -.->|"通过"| E`,
            tip: "在 ONNX 到 CoreML 转换时，如果模型包含不支持的算子，可以用 coremltools 的 RegisterCustomOP 注册自定义算子，或者在 PyTorch 端用支持的算子替换。",
            warning: "iOS 应用打包时，CoreML 模型文件会被压缩进 App Bundle。如果模型超过 100 MB，建议使用按需资源（On-Demand Resources）在运行时从 App Store 下载模型。"
        },
    ],
};
