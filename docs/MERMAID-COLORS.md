# 🎨 Mermaid 图表配色规范

> 所有 Mermaid 图表必须遵守此规范，否则 CI 检查会拦截提交。

## 规则

所有 `style` 指令的填充色和文字颜色对比度必须 **≥ 4.5:1**（WCAG AA 标准）。

## ✅ 安全配色（直接使用）

使用 Tailwind 800-900 色阶，天然满足对比度要求：

| 用途 | 色值 | Tailwind |
|------|------|----------|
| 蓝色/信息 | `#0c4a6e` | sky-900 |
| 绿色/成功 | `#14532d` | green-900 |
| 红色/警告 | `#7f1d1d` | red-900 |
| 橙色/注意 | `#7c2d12` | orange-900 |
| 黄色/提示 | `#713f12` | yellow-900 |
| 紫色/特殊 | `#581c87` | purple-900 |
| 粉色/危险 | `#881337` | rose-900 |
| 青色/辅助 | `#134e4a` | teal-900 |
| 靛蓝/科技 | `#3730a3` | indigo-800 |
| 石板灰/中性 | `#374151` | gray-700 |
| 深蓝/节点 | `#1e3a5f` | blue-900 |
| 深紫/强调 | `#5b21b6` | violet-800 |
| 深蓝/强调 | `#4338ca` | indigo-700 |

## ❌ 禁止使用的颜色

- Material Design 浅色（如 `#e1f5fe`, `#ffcdd2`, `#c8e6c9`）
- Tailwind 100-300 色阶（如 `#bfdbfe`, `#bbf7d0`）
- 快捷色简写（如 `#ff0`, `#f99`, `#bbf`）
- 中等亮度颜色配白色文字（如 `#3b82f6` + `color:#fff`）

## 正确写法示例

```mermaid
graph LR
    A[输入] --> B[处理]
    B --> C[输出]
    
    style A fill:#0c4a6e,stroke:#38bdf8,stroke-width:2px
    style B fill:#14532d,stroke:#4ade80,stroke-width:2px
    style C fill:#7f1d1d,stroke:#f87171,stroke-width:2px
```

## 验证

提交前自动检查：

```bash
npm run lint:mermaid
```

或使用 pre-commit hook（已配置）。
