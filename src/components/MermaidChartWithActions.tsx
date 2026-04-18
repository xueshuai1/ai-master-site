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
    if (!showModal) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.25, Math.min(5, z + delta)));
  }, [showModal]);

  // Pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!showModal) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - panX, y: e.clientY - panY };
  }, [showModal, panX, panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanX(e.clientX - panStart.current.x);
    setPanY(e.clientY - panStart.current.y);
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!svgContent) return;
    setDlStatus('loading');

    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;

    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let pngUrl: string | null = null;
        try {
          pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = 'mermaid-chart.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(pngUrl);
        } catch {
          const a = document.createElement('a');
          a.href = url;
          a.download = 'mermaid-chart.svg';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        setDlStatus('done');
        setTimeout(() => setDlStatus('idle'), 2000);
      };
      img.onerror = () => {
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
      img.src = url;
    } catch {
      setDlStatus('idle');
    }
  }, [svgContent]);

  // Touch events for mobile pinch-to-zoom and pan
  const containerRef = useRef<HTMLDivElement>(null);
  const touchState = useRef({
    initialDistance: 0,
    initialZoom: 1,
    lastTouchX: 0,
    lastTouchY: 0,
    lastTapTime: 0,
    isPinching: false,
  });

  const getTouchDistance = (t1: Touch, t2: Touch) => {
    return Math.sqrt(Math.pow(t2.clientX - t1.clientX, 2) + Math.pow(t2.clientY - t1.clientY, 2));
  };

  // Use native touch events (not React synthetic) to properly handle preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !showModal) return;

    const ts = touchState.current;

    const onTouchStart = (e: TouchEvent) => {
      const touches = e.touches;

      if (touches.length === 2) {
        ts.initialDistance = getTouchDistance(touches[0], touches[1]);
        ts.initialZoom = zoom;
        ts.lastTouchX = (touches[0].clientX + touches[1].clientX) / 2;
        ts.lastTouchY = (touches[0].clientY + touches[1].clientY) / 2;
        ts.isPinching = true;
      } else if (touches.length === 1 && !ts.isPinching) {
        const now = Date.now();
        if (now - ts.lastTapTime < 300) {
          // Double tap — zoom in/out
          if (zoom > 1.2) {
            setZoom(1);
            setPanX(0);
            setPanY(0);
          } else {
            setZoom(2.5);
          }
          ts.lastTapTime = 0;
        } else {
          ts.lastTapTime = now;
          ts.lastTouchX = touches[0].clientX;
          ts.lastTouchY = touches[0].clientY;
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const touches = e.touches;

      if (touches.length === 2) {
        e.preventDefault();
        const dist = getTouchDistance(touches[0], touches[1]);
        const scale = dist / ts.initialDistance;
        const newZoom = Math.max(0.25, Math.min(5, ts.initialZoom * scale));
        setZoom(newZoom);

        const midX = (touches[0].clientX + touches[1].clientX) / 2;
        const midY = (touches[0].clientY + touches[1].clientY) / 2;
        setPanX(p => p + (midX - ts.lastTouchX));
        setPanY(p => p + (midY - ts.lastTouchY));
        ts.lastTouchX = midX;
        ts.lastTouchY = midY;
      } else if (touches.length === 1 && !ts.isPinching) {
        const dx = touches[0].clientX - ts.lastTouchX;
        const dy = touches[0].clientY - ts.lastTouchY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          e.preventDefault();
          setPanX(p => p + dx);
          setPanY(p => p + dy);
          ts.lastTouchX = touches[0].clientX;
          ts.lastTouchY = touches[0].clientY;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const touches = e.touches;
      if (touches.length < 2) {
        ts.isPinching = false;
        if (touches.length === 1) {
          ts.initialZoom = zoom;
          ts.lastTouchX = touches[0].clientX;
          ts.lastTouchY = touches[0].clientY;
        }
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [showModal, zoom]);

  const handleZoom = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setShowModal(true);
  }, []);

  return (
    <>
      <div className="relative group my-6">
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
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/80 shrink-0">
            <span className="text-sm text-slate-400">Mermaid 图表 — PC: 滚轮缩放/拖拽平移 · 手机: 双指缩放/双击放大/单指拖拽</span>
            <div className="flex items-center gap-2">
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
                title="关闭"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div
            ref={containerRef}
            className="flex-1 overflow-hidden flex items-center justify-center"
            style={{ touchAction: 'none' }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              ref={zoomRef}
              style={{ transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})` }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </div>
      )}
    </>
  );
}
