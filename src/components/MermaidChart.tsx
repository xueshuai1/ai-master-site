'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidChartProps {
  chart: string;
  onSvgReady?: (svg: string) => void;
}

export default function MermaidChart({ chart, onSvgReady }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    async function render() {
      try {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          suppressErrorRendering: true,  // 禁止 mermaid 在 DOM 中注入错误图示
          themeVariables: {
            fontSize: '16px',
            primaryTextColor: '#f1f5f9',
            secondaryTextColor: '#f1f5f9',
            tertiaryTextColor: '#f1f5f9',
            primaryColor: '#1e3a5f',
            primaryBorderColor: '#60a5fa',
            mainBkg: '#1e3a5f',
            secondBkg: '#1e3a5f',
            nodeBkg: '#1e3a5f',
            nodeBorder: '#60a5fa',
            lineColor: '#60a5fa',
            secondaryColor: '#1e3a5f',
            secondaryBorderColor: '#60a5fa',
            tertiaryColor: '#1e3a5f',
            tertiaryBorderColor: '#60a5fa',
            clusterBkg: '#0f172a',
            clusterBorder: '#475569',
            titleColor: '#f8fafc',
            edgeLabelBackground: '#1e293b',
            actorBorder: '#60a5fa',
            background: '#0f172a',
            textColor: '#f1f5f9',
          },
          flowchart: {
            curve: 'basis',
            padding: 20,
            nodeSpacing: 50,
            rankSpacing: 70,
            htmlLabels: true,
            useMaxWidth: false,
          },
          sequence: {
            useMaxWidth: false,
            wrap: true,
          },
          gantt: {
            useMaxWidth: false,
          },
        });

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);

        // 清理 mermaid 渲染后遗留的 DOM 元素（包括错误图示）
        const errorEl = document.getElementById(id);
        if (errorEl) errorEl.remove();

        if (mounted) {
          setSvg(svg);
          onSvgReady?.(svg);
        }
      } catch (err: any) {
        // 静默失败：不向用户展示任何错误
        console.error('MermaidChart render failed:', err?.message || err);
        if (mounted) {
          setSvg('');
        }
      }
    }

    render();
    return () => { mounted = false; };
  }, [chart]);

  if (!svg) {
    return null; // 渲染失败或等待中，不展示任何内容
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-chart flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
