const fs = require('fs');
let content = fs.readFileSync('src/data/articles/aieng-025.ts', 'utf8');

// Add more content to section 5 (pruning) - find the tip/warning of section 5
const search = `      tip: "对于部署到 CPU/移动端的场景，推荐使用结构化剪枝`;
const extraContent = `### 5.5 NVIDIA 2:4 结构化稀疏

**NVIDIA Ampere 架构**（A100、H100）原生支持一种特殊的结构化稀疏模式——**2:4 稀疏**：每 **4 个连续元素**中，至少有 **2 个为零**。这种稀疏模式可以通过 **Tensor Core** 实现 **2 倍加速**，同时保持**较高的模型精度**。

**2:4 稀疏的实现步骤**：

1. **训练**模型到收敛
2. **分析**每 4 个元素组，找出**绝对值最小的 2 个**
3. **将这两个元素设为零**（masking）
4. **微调**模型恢复精度
5. **导出**为稀疏 TensorRT Engine

**2:4 稀疏的适用场景**：特别适合**大语言模型**的权重压缩。研究表明，Llama-2-7B 在经过 2:4 稀疏后，**精度损失仅 0.3-0.8%%**，而**推理速度提升约 1.8 倍**。

`;

// Find the warning of section 5 and insert before it
const warning5 = `      warning: "剪枝后必须进行微调`;
const idx = content.indexOf(warning5);
if (idx > 0) {
    content = content.slice(0, idx) + extraContent + content.slice(idx);
    fs.writeFileSync('src/data/articles/aieng-025.ts', content);
    console.log('Added content to section 5');
} else {
    console.log('Could not find insertion point');
}

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
