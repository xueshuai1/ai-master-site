import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 禁用 TypeScript 类型检查以加快构建
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
