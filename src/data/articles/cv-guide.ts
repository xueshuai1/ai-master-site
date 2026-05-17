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

2026 年，CV 和多模态（视觉+语言）正在融合。GPT-4V、Gemini Pro 都能"看懂"图片了。`
        },
        {
            title: "1. 学习路线",
            body: `计算机视觉的学习路线：

图像分类— LeNet → AlexNet → ResNet

目标检测— YOLO、Faster R-CNN

图像分割— 语义分割、实例分割

数据增强与优化— AutoAugment、CutMix`
        },
        {
            title: "2. 学习建议",
            body: `重点投入：
- CNN 核心思想（卷积、池化、感受野）
- ResNet 架构演进
- YOLO 目标检测

可以用现成工具的：
- 不需要从头训练模型，用预训练模型微调即可`,
            tip: "💡 用 YOLO 跑一下实时目标检测，看着摄像头里的物体被实时标注，非常有成就感。"
        },
        {
            title: "架构图示 1",
            mermaid: `graph LR
    A["基础理论<br/>2-3周"] --> B["CNN 实战<br/>2-3周"]
    B --> C["Transformer<br/>2-3周"]
    C --> D["多模态+生成<br/>3-4周"]
    
    A --> P1["Python+OpenCV"]
    B --> P2["PyTorch+ResNet"]
    C --> P3["ViT+DETR"]
    D --> P4["CLIP+Diffusion"]
    
    style B fill:#1e3a5f,stroke:#2563eb,color:#fff
    style D fill:#1e3a5f,stroke:#2563eb,color:#fff`,
        },
        {
            title: "架构图示 2",
            mermaid: `graph TD
    subgraph "CV 技术演进"
        C1["经典 CV<br/>OpenCV"] --> C2["CNN 时代<br/>ResNet/YOLO"]
        C2 --> C3["Transformer 时代<br/>ViT/DETR"]
        C3 --> C4["多模态时代<br/>CLIP/SAM"]
        C4 --> C5["生成式视觉<br/>Diffusion/FLUX"]
    end
    
    subgraph "核心任务"
        T1["图像分类"]
        T2["目标检测"]
        T3["图像分割"]
        T4["图像生成"]
    end
    
    C2 --> T1
    C2 --> T2
    C3 --> T3
    C5 --> T4
    
    style C3 fill:#1e3a5f,stroke:#2563eb,color:#fff
    style C5 fill:#b91c1c,stroke:#dc2626,color:#fff`,
        },
    ]
};
