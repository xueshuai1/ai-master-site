const fs = require('fs');
let content = fs.readFileSync('src/data/articles/aieng-025.ts', 'utf8');

// Add mermaid diagram to knowledge base article
const search1 = '### 9.3 优化决策树';
const insert1 = `### 9.3 优化决策树

**面对一个新模型时，按以下顺序考虑优化**：

1. **FP16 推理** → 如果硬件支持 BF16/FP16，零成本获得 1.5-2x 加速
2. **INT8 PTQ** → 如果需要进一步加速，且精度损失 < 2% 可接受
3. **知识蒸馏** → 如果需要大幅缩小模型体积（4-8x），且有时间做蒸馏训练
4. **INT4 量化** → 如果部署在内存受限环境（如边缘设备），且 3-5% 精度损失可接受
5. **剪枝** → 如果需要极致的稀疏度，且目标硬件支持稀疏计算`;

const replace1 = search1;

if (content.includes(replace1)) {
    // Add mermaid before the last section's tip
    // Find the last tip/warning block
    const mermaidDiagram = `
### 9.4 推理优化全流程图

\`\`\`mermaid
graph TD
    A["原始 FP32 模型"] --> B["基线性能评估"]
    B --> C{"部署目标"}
    C -->|"GPU 服务器"| D["FP16/BF16 转换"]
    C -->|"CPU/边缘"| E["INT8 PTQ 量化"]
    C -->|"极致压缩"| F["蒸馏+INT4"]
    D --> G["TensorRT"]
    E --> H["ONNX Runtime"]
    F --> I["llama.cpp"]
    G --> J{"精度达标?"}
    H --> J
    I --> J
    J -->|"是"| K["部署生产"]
    J -->|"否"| L["回退: QAT/降压缩"]
    L --> B
    style A fill:#1a365d,stroke:#63b3ed
    style B fill:#2d3748,stroke:#f6ad55
    style K fill:#1a365d,stroke:#68d391
    style L fill:#742a2a,stroke:#fc8181
\`\`\``;

    // Find the position right before the last tip in section 9
    const lastTipIndex = content.lastIndexOf('tip: "保留每个优化步骤');
    if (lastTipIndex > 0) {
        content = content.slice(0, lastTipIndex) + mermaidDiagram + ',\n      ' + content.slice(lastTipIndex);
        fs.writeFileSync('src/data/articles/aieng-025.ts', content);
        console.log('Added mermaid to aieng-025.ts');
    }
}

// Add second mermaid diagram to blog article
let blogContent = fs.readFileSync('src/data/blogs/blog-119.ts', 'utf8');

const blogMermaid = `
### 4.4 AI 芯片技术路线对比图

\`\`\`mermaid
graph TD
    A["AI 芯片技术路线"] --> B["GPU 通用路线\nNVIDIA H100/B200"]
    A --> C["晶圆级芯片\nCerebras WSE-3"]
    A --> D["LPU 推理芯片\nGroq"]
    A --> E["TPU 定制芯片\nGoogle"]

    B --> B1["优势: CUDA 生态, 全场景"]
    B --> B2["劣势: 通信延迟, 价格"]

    C --> C1["优势: 极低通信延迟"]
    C --> C2["劣势: 良率, 生态弱"]

    D --> D1["优势: 推理延迟最低"]
    D --> D2["劣势: 仅推理, 无训练"]

    E --> E1["优势: Google 生态整合"]
    E --> E2["劣势: 仅 Cloud 可用"]

    style A fill:#1a365d,stroke:#63b3ed
    style B fill:#1a365d,stroke:#63b3ed
    style C fill:#2d3748,stroke:#68d391
    style D fill:#2d3748,stroke:#f6ad55
    style E fill:#2d3748,stroke:#fc8181
\`\`\``;

// Find a good insertion point in section 4
const section4End = blogContent.indexOf('### 关键洞察');
if (section4End > 0) {
    // Insert before 关键洞察
    blogContent = blogContent.slice(0, section4End) + blogMermaid + '\n' + blogContent.slice(section4End);
    fs.writeFileSync('src/data/blogs/blog-119.ts', blogContent);
    console.log('Added mermaid to blog-119.ts');
}
