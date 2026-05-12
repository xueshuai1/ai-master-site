import { Article } from '../knowledge';

export const article: Article = {
    id: "cv-guide",
    title: "计算机视觉学习导览",
    category: "cv",
    tags: ["CV", "学习导览", "CNN", "目标检测"],
    summary: "让机器看懂图像和视频。从图像分类、目标检测到图像分割，掌握 CNN 和视觉 Transformer 的核心技术。",
    date: "2026-04-16",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 为什么学 CV？",
            body: `自动驾驶、人脸识别、医学影像分析、工业质检——这些都是 CV 的应用。

2026 年，CV 和多模态（视觉+语言）正在融合。**GPT-4**V、**Gemini** Pro 都能"看懂"图片了。`
        },
        {
            title: "1. 学习路线",
            body: `**计算机视觉的学习路线**：

图像分类— LeNet → AlexNet → ResNet

目标检测— YOLO、Faster R-CNN

图像分割— 语义分割、实例分割

数据增强与优化— AutoAugment、CutMix`
        },
        {
            title: "2. 学习建议",
            body: `**重点投入**：
- CNN 核心思想（卷积、池化、感受野）
- ResNet 架构演进
- YOLO 目标检测

**可以用现成工具的**：
- 不需要从头训练模型，用预训练模型微调即可`,
            tip: "💡 用 YOLO 跑一下实时目标检测，看着摄像头里的物体被实时标注，非常有成就感。"
        },
        {
            title: "架构图示 1",
            mermaid: `graph TD
    A["概述"] --> B["原理"]
    B --> C["实现"]
    C --> D["应用"]
    D --> E["总结"]`,
        },
        {
            title: "架构图示 2",
            mermaid: `graph TD
    A["概述"] --> B["原理"]
    B --> C["实现"]
    C --> D["应用"]
    D --> E["总结"]`,
        },
    ]
};
