// Test specific mm-003 mermaid charts for syntax errors
import * as mermaid from 'mermaid';

// Mock DOM
const mockEl = () => ({ 
  style: {}, setAttribute: () => {}, appendChild: () => {}, 
  remove: () => {}, innerHTML: '', innerText: '', 
  classList: { add: () => {}, remove: () => {} },
  getAttribute: () => null, querySelector: () => null 
});
global.document = {
  createElement: mockEl,
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  body: { ...mockEl(), appendChild: () => {}, removeChild: () => {} },
};
global.window = { document: global.document, getComputedStyle: () => ({}) };

mermaid.initialize({ startOnLoad: false, suppressErrorRendering: true });

const charts = [
  { n: "Section 1", c: `graph LR
    A[输入图像] --> B[视觉 Encoder]
    B --> C[图像特征向量]
    C --> D[语言 Decoder]
    D --> E[BOS]
    E --> F["a dog"]
    F --> G["playing in"]
    G --> H["the snow"]
    H --> I[EOS]` },
  { n: "Section 6", c: `graph TD
    A[基础扩散模型] --> B[冻结权重]
    C[条件输入] --> D[ControlNet 副本]
    B --> E[UNet 零卷积连接]
    D --> E
    A --> F[生成能力保留]
    E --> G[条件控制生成]
    C -.可以是.-. H[边缘图 Canny]
    C -.可以是.-. I[深度图 Depth]
    C -.可以是.-. J[姿态 OpenPose]
    C -.可以是.-. K[分割 Segmentation]` },
];

(async () => {
  for (const { n, c } of charts) {
    try {
      const id = 'test-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      await mermaid.render(id, c);
      console.log(`${n}: OK`);
    } catch (e) {
      console.log(`${n}: ERROR - ${e.message.substring(0, 200)}`);
    }
  }
})();
