const fs = require('fs');
let content = fs.readFileSync('src/data/articles/aieng-025.ts', 'utf8');

// Fix section 8 - move the edge deployment content inside the body
const old8 = `**Step 6**：部署到生产环境 → 持续监控**线上性能指标**。`,

### 8.4 边缘设备部署的特殊考虑

**边缘设备**（如手机、IoT 设备、嵌入式系统）对模型优化有**独特要求**：

**内存限制**：大多数边缘设备只有 **1-4GB RAM**，而 FP32 的大模型可能需要 **8-16GB**。必须使用 **INT8 或 INT4 量化**才能部署。

**功耗限制**：边缘设备通常由**电池供电**，推理功耗直接影响**续航时间**。量化后的模型不仅运行更快，**功耗也更低**——因为低精度运算消耗的能量更少。

**硬件加速器**：现代移动芯片（如 **Apple A17/M3、高通 Snapdragon**）都内置了 **NPU（Neural Processing Unit）**，专门加速 INT8 量化模型的推理。通过 **CoreML**（Apple）或 **QNN**（高通）导出模型，可以获得 **5-10 倍**的加速效果。

      tip: "对于生产部署`;

const new8 = `**Step 6**：部署到生产环境 → 持续监控**线上性能指标**。

### 8.4 边缘设备部署的特殊考虑

**边缘设备**（如手机、IoT 设备、嵌入式系统）对模型优化有**独特要求**：

**内存限制**：大多数边缘设备只有 **1-4GB RAM**，而 FP32 的大模型可能需要 **8-16GB**。必须使用 **INT8 或 INT4 量化**才能部署。

**功耗限制**：边缘设备通常由**电池供电**，推理功耗直接影响**续航时间**。量化后的模型不仅运行更快，**功耗也更低**——因为低精度运算消耗的能量更少。

**硬件加速器**：现代移动芯片（如 **Apple A17/M3、高通 Snapdragon**）都内置了 **NPU（Neural Processing Unit）**，专门加速 INT8 量化模型的推理。通过 **CoreML**（Apple）或 **QNN**（高通）导出模型，可以获得 **5-10 倍**的加速效果。\`,
      tip: "对于生产部署`;

content = content.replace(old8, new8);
fs.writeFileSync('src/data/articles/aieng-025.ts', content);

// Count Chinese chars
const bodyMatches = content.match(/body: `([\s\S]*?)`/g);
let chineseCount = 0;
if (bodyMatches) {
    bodyMatches.forEach(m => {
        const body = m.replace(/body: `/, '').replace(/`$/, '');
        const chars = body.match(/[\u4e00-\u9fff]/g);
        if (chars) chineseCount += chars.length;
    });
}
console.log('KB body Chinese chars:', chineseCount);
