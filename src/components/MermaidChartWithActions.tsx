'use client';

import { useState, useCallback } from 'react';
import MermaidChart from './MermaidChart';

interface MermaidChartWithActionsProps {
  chart: string;
}

export default function MermaidChartWithActions({ chart }: MermaidChartWithActionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');

  // Capture SVG content after Mermaid renders
  const handleSvgReady = useCallback((svg: string) => {
    setSvgContent(svg);
  }, []);

  // Download as PNG with dark background
  const handleDownload = useCallback(() => {
    if (!svgContent) return;
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgEl = svgDoc.querySelector('svg');
    if (!svgEl) return;

    // 获取 SVG 尺寸
    const viewBox = svgEl.getAttribute('viewBox')?.split(/\s+/).map(Number);
    const width = viewBox ? viewBox[2] : 800;
    const height = viewBox ? viewBox[3] : 600;
    // 2x 高清
    const scale = 2;

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(scale, scale);

    // 深色背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'mermaid-chart.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }, 'image/png');
    };
    img.onerror = () => {
      // 降级：直接下载 SVG
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mermaid-chart.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = url;
  }, [svgContent]);

  // Open in modal
  const handleZoom = useCallback(() => {
    setShowModal(true);
  }, []);

  return (
    <>
      {/* Chart container with action buttons */}
      <div className="relative group">
        {/* Action buttons - top right, visible on hover */}
        <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleDownload}
            disabled={!svgContent}
            className="p-1.5 rounded-md bg-slate-800/80 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="下载 SVG"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={handleZoom}
            disabled={!svgContent}
            className="p-1.5 rounded-md bg-slate-800/80 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="放大查看"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>

        <MermaidChart chart={chart} onSvgReady={handleSvgReady} />
      </div>

      {/* Zoom Modal — 全屏展示，支持双向滚动 */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col"
          onClick={() => setShowModal(false)}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/50 shrink-0">
            <span className="text-sm text-slate-400">Mermaid 图表 — 可滚动查看</span>
            <button
              onClick={() => setShowModal(false)}
              className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              title="关闭"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal content — 完整 SVG，双向滚动，不被截断 */}
          <div
            className="flex-1 overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="min-w-min [&>svg]:block [&>svg]:max-w-none [&>svg]:h-auto [&>svg]:w-auto"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </div>
      )}
    </>
  );
}
