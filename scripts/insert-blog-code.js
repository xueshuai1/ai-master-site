const fs = require('fs');
let content = fs.readFileSync('src/data/blogs/blog-141.ts', 'utf-8');

const codeBlock = `
    code: [
      {
        lang: "yaml",
        title: "litellm-config.yaml — 多模型智能路由配置",
        code: \`model_list:
  - model_name: "cost-effective"
    litellm_params:
      model: "gemini/gemini-2.0-flash"
  - model_name: "high-quality"
    litellm_params:
      model: "openai/gpt-4o"
  - model_name: "fallback"
    litellm_params:
      model: "anthropic/claude-3-5-sonnet"
router_settings:
  routing_strategy: "simple-shuffle"
  fallbacks: ["cost-effective", "high-quality", "fallback"]\`,
      },
      {
        lang: "python",
        title: "cost_optimizer.py — 多模型成本优化路由",
        code: \`def route_by_complexity(user_input: str) -> str:
    """根据输入复杂度自动选择最经济的模型"""
    words = len(user_input.split())
    if words < 50:
        return "gemini/gemini-2.0-flash"
    elif words < 500:
        return "openai/gpt-4o"
    else:
        return "anthropic/claude-3-5-sonnet"\`,
      }
    ],`;

// Insert after the warning line in section 5
const marker = '多模型架构的最大挑战是';
const idx = content.indexOf(marker);
// Find the end of this warning string (closing quote + newline)
const endQuote = content.indexOf('"', idx + marker.length);
const insertAt = endQuote + 1;

const newContent = content.substring(0, insertAt) + codeBlock + content.substring(insertAt);
fs.writeFileSync('src/data/blogs/blog-141.ts', newContent);
console.log('Inserted code blocks');
