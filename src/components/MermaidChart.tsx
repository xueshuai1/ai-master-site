'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidChartProps {
  chart: string;
  onSvgReady?: (svg: string) => void;
}

export default function MermaidChart({ chart, onSvgReady }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

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
          themeVariables: {
            fontSize: '18px',
            primaryColor: '#1e3a5f',
            primaryTextColor: '#e2e8f0',
            primaryBorderColor: '#3b82f6',
            lineColor: '#60a5fa',
            secondaryColor: '#1a2744',
            tertiaryColor: '#0f172a',
          },
          flowchart: {
            curve: 'basis',
            padding: 20,
            nodeSpacing: 30,
            rankSpacing: 50,
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

        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (mounted) {
          setSvg(svg);
          onSvgReady?.(svg);
        }
      } catch (e) {
        if (mounted) setError('图表渲染失败');
      }
    }

    render();
    return () => { mounted = false; };
  }, [chart]);

  if (error) {
    return <div className="text-slate-500 text-sm italic">{error}</div>;
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-chart flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
