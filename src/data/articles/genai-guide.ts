import { Article } from '../knowledge';

export const article: Article = {
    id: "genai-guide",
    title: "生成式 AI 学习导览",
    category: "genai",
    tags: ["生成式 AI", "学习导览", "Diffusion", "GAN"],
    summary: "从 Diffusion 模型到 GAN，掌握 AI 图像、音频、视频生成技术。理解 Stable Diffusion 的原理，学会用 ControlNet 精确控制生成结果。",
    date: "2026-04-16",
    readTime: "15 min",
    level: "入门",
    content: [
        {
            title: "0. 什么是生成式 AI？",
            body: `判别式 AI：判断一张图是猫还是狗。
生成式 AI：给你画一只猫。

2022 年 Stable Diffusion 开源，2023 年 DALL·E 和 Midjourney 爆发，2026 年 AI 视频（Sora、Veo）成为现实。生成式 AI 已经从"好玩"变成"好用"。`
        },
        {
            title: "1. 技术全景",
            body: `生成式 AI 的技术全景：

VAE（变分自编码器） — 编码、隐空间、解码

GAN（生成对抗网络） — 生成器 vs 判别器

Diffusion Model — 加噪、去噪、生成

ControlNet — 精确控制生成结果`
        },
        {
            title: "2. 学习建议",
            body: `重点： Diffusion 模型——这是当前最主流、最实用的生成技术。

实战： 用 Stable Diffusion + ControlNet 生成一张你指定构图和姿势的图片。`,
            tip: "💡 先学会用 Midjourney 或 Stable Diffusion WebUI，再深入理解背后的数学原理。"
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
