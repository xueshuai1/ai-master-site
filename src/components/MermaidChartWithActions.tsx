'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import MermaidChart from './MermaidChart';

interface MermaidChartWithActionsProps {
  chart: string;
}

export default function MermaidChartWithActions({ chart }: MermaidChartWithActionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [dlStatus, setDlStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const zoomRef = useRef<HTMLDivElement>(null);

  const handleSvgReady = useCallback((svg: string) => {
    setSvgContent(svg);
  }, []);

  // Reset zoom when modal opens
  useEffect(() => {
    if (showModal) {
      setZoom(1);
      setPanX(0);
      setPanY(0);
    }
  }, [showModal]);

  // Keyboard: ESC to close, +/- to zoom
  useEffect(() => {
    if (!showModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
      if (e.key === '=' || e.key === '+') setZoom(z => Math.min(z + 0.25, 5));
      if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.25));
      if (e.key === '0') { setZoom(1); setPanX(0); setPanY(0); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showModal]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(z => Math.min(Math.max(z + delta, 0.25), 5));
  }, []);

  // Pan with mouse drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - panX, y: e.clientY - panY };
    }
  }, [panX, panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanX(e.clientX - panStart.current.x);
      setPanY(e.clientY - panStart.current.y);
    }
  }, [isPanning]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  // Download as PNG via canvas
  const handleDownload = useCallback(async () => {
    if (!svgContent) return;
    setDlStatus('loading');

    // Safety timeout — reset status after 8 seconds no matter what
    const safetyTimer = setTimeout(() => {
      setDlStatus('idle');
    }, 8000);

    try {
      // Ensure xmlns for Image to parse correctly
      const cleanSvg = svgContent.includes('xmlns')
        ? svgContent
        : svgContent.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');

      // Parse SVG to get dimensions
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanSvg, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      const vb = svgEl?.getAttribute('viewBox');
      let width = 1200, height = 800;

      if (vb) {
        const [, , vw, vh] = vb.split(/\s+/).map(Number);
        if (vw && vh) { width = vw; height = vh; }
      }

      // Scale up for better quality
      const scale = 2;
      const w = width * scale;
      const h = height * scale;

      const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      const finish = () => {
        clearTimeout(safetyTimer);
        URL.revokeObjectURL(url);
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('No 2d context');
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              const pngUrl = URL.createObjectURL(pngBlob);
              const a = document.createElement('a');
              a.href = pngUrl;
              a.download = 'mermaid-chart.png';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(pngUrl);
            }
            setDlStatus('done');
            setTimeout(() => setDlStatus('idle'), 2000);
            finish();
          }, 'image/png');
        } catch {
          // Canvas failed — fallback to SVG download
          fallbackDownload(url);
        }
      };
      img.onerror = () => {
        fallbackDownload(url);
      };
      img.src = url;
    } catch {
      clearTimeout(safetyTimer);
      setDlStatus('idle');
    }
  }, [svgContent]);

  const fallbackDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mermaid-chart.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDlStatus('done');
    setTimeout(() => setDlStatus('idle'), 2000);
  };

  const handleZoom = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setShowModal(true);
  }, []);

  return (
    <>
      {/* Chart container with action buttons */}
      <div className="relative group">
        <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleDownload}
            disabled={!svgContent || dlStatus === 'loading'}
            className="p-1.5 rounded-md bg-slate-800/80 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="下载 PNG"
          >
            {dlStatus === 'loading' ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : dlStatus === 'done' ? (
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
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

      {/* Zoom Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col"
          onClick={() => setShowModal(false)}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/80 shrink-0">
            <span className="text-sm text-slate-400">Mermaid 图表 — 滚轮缩放 · 拖拽平移 · +/- 键缩放 · 0 重置 · ESC 关闭</span>
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <button
                onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))}
                className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                title="缩小"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <span className="text-sm text-white font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(z + 0.25, 5))}
                className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                title="放大"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              <button
                onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}
                className="px-2.5 py-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs"
                title="重置缩放 (按 0)"
              >
                重置
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all ml-2"
                title="关闭 (ESC)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content — zoomable & pannable */}
          <div
            ref={zoomRef}
            className="flex-1 overflow-hidden p-4 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="flex justify-center items-center min-h-full transition-transform duration-100"
              style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: 'center center' }}
            >
              <div
                className="[&>svg]:block [&>svg]:max-w-none [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
