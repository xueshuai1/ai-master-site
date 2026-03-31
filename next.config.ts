import type { NextConfig } from "next";
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  // 支持 MDX 和 TypeScript 文件
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  
  // 禁用 TypeScript 类型检查以加快构建
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 确保 data 目录在构建时被包含到 serverless 函数中
  outputFileTracingIncludes: {
    '/api/questions': ['./data/**/*'],
    '/api/knowledge': ['./data/**/*'],
  },
};

// 配置 MDX
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
