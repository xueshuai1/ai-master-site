const fs = require('fs');
let blog = fs.readFileSync('src/data/blogs/blog-141.ts', 'utf-8');

const codeBlock = `,
    code: [
      {
        lang: "typescript",
        title: "model-gateway.ts — 多模型网关核心逻辑",
        code: \`interface ModelRoute {
  name: string;
  provider: string;
  maxLatency: number;
  costPerToken: number;
  healthCheck: () => Promise<boolean>;
}

class ModelGateway {
  private routes: Map<string, ModelRoute[]>;

  async route(task: any): Promise<string> {
    const candidates = this.routes.get(task.type) || [];
    const healthy = await Promise.all(
      candidates.map(async (r) => ({ r, ok: await r.healthCheck() }))
    );
    const available = healthy.filter((h) => h.ok).map((h) => h.r);
    if (available.length === 0) throw new Error("No healthy models");
    return this.pickBest(available, task);
  }

  private pickBest(routes: ModelRoute[], task: any): string {
    if (task.priority === "cost") return routes.reduce((a, b) => a.costPerToken < b.costPerToken ? a : b);
    if (task.priority === "latency") return routes.reduce((a, b) => a.maxLatency < b.maxLatency ? a : b);
    return routes[0].name;
  }
}\`,
      }
    ],`;

// Find the end of section 7's body (the closing backtick + comma)
const marker = '才能接入生产环境。';
const idx = blog.indexOf(marker);
if (idx === -1) { console.log('Marker not found'); process.exit(1); }
// Find the end of the body template string
const endBacktick = blog.indexOf('`,', idx);
if (endBacktick === -1) { console.log('End backtick not found'); process.exit(1); }
const insertAt = endBacktick + 1;

const newBlog = blog.substring(0, insertAt) + codeBlock + blog.substring(insertAt);
fs.writeFileSync('src/data/blogs/blog-141.ts', newBlog);
console.log('Added code block to section 7');
