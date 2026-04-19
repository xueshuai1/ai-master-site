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
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomElRef = useRef<HTMLDivElement>(null);
  const touchData = useRef({ zoom: 1, panX: 0, panY: 0 });

  const handleSvgReady = useCallback((svg: string) => setSvgContent(svg), []);

  useEffect(() => {
    if (showModal) {
      touchData.current = { zoom: 1, panX: 0, panY: 0 };
      setZoom(1); setPanX(0); setPanY(0);
    }
  }, [showModal]);

  // Keyboard
  useEffect(() => {
    if (!showModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
      if (e.key === '=' || e.key === '+') doZoom(Math.min(5, touchData.current.zoom + 0.25));
      if (e.key === '-') doZoom(Math.max(0.25, touchData.current.zoom - 0.25));
      if (e.key === '0') doZoom(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showModal]);

  // Mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!showModal) return;
    e.preventDefault();
    doZoom(touchData.current.zoom + (e.deltaY > 0 ? -0.1 : 0.1));
  }, [showModal]);

  // Mouse pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!showModal) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - touchData.current.panX, y: e.clientY - touchData.current.panY };
  }, [showModal]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    doPan(e.clientX - panStart.current.x, e.clientY - panStart.current.y);
  }, [isPanning]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const doZoom = (newZoom: number) => {
    const z = Math.max(0.25, Math.min(5, newZoom));
    touchData.current.zoom = z;
    if (zoomElRef.current) zoomElRef.current.style.transform = `translate3d(${touchData.current.panX}px, ${touchData.current.panY}px, 0) scale(${z})`;
    setZoom(z);
  };

  const doPan = (x: number, y: number) => {
    touchData.current.panX = x;
    touchData.current.panY = y;
    if (zoomElRef.current) zoomElRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${touchData.current.zoom})`;
    setPanX(x);
    setPanY(y);
  };

  // Touch — DIRECT DOM, no React state lag
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !showModal) return;
    const td = touchData.current;
    let initDist = 0, lastX = 0, lastY = 0, lastTap = 0, pinching = false;

    const dist = (a: Touch, b: Touch) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

    const onStart = (e: TouchEvent) => {
      const t = e.touches;
      if (t.length === 2) {
        e.preventDefault();
        initDist = dist(t[0], t[1]);
        lastX = (t[0].clientX + t[1].clientX) / 2;
        lastY = (t[0].clientY + t[1].clientY) / 2;
        pinching = true;
      } else if (t.length === 1 && !pinching) {
        const now = Date.now();
        if (now - lastTap < 300) {
          doZoom(td.zoom > 1.2 ? 1 : 2.5);
          lastTap = 0;
        } else {
          lastTap = now;
          lastX = t[0].clientX;
          lastY = t[0].clientY;
        }
      }
    };

    const onMove = (e: TouchEvent) => {
      const t = e.touches;
      if (t.length === 2) {
        e.preventDefault();
        const d = dist(t[0], t[1]);
        doZoom(Math.max(0.25, Math.min(5, td.zoom * (d / initDist))));
        const mx = (t[0].clientX + t[1].clientX) / 2;
        const my = (t[0].clientY + t[1].clientY) / 2;
        doPan(td.panX + (mx - lastX), td.panY + (my - lastY));
        initDist = d; lastX = mx; lastY = my;
      } else if (t.length === 1 && !pinching) {
        const dx = t[0].clientX - lastX;
        const dy = t[0].clientY - lastY;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          e.preventDefault();
          doPan(td.panX + dx, td.panY + dy);
          lastX = t[0].clientX; lastY = t[0].clientY;
        }
      }
    };

    const onEnd = (e: TouchEvent) => {
      pinching = false;
      if (e.touches.length === 1) {
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    };

    el.addEventListener('touchstart', onStart, { passive: false });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd); };
  }, [showModal]);

  const handleDownload = useCallback(async () => {
    if (!svgContent) return;
    setDlStatus('loading');
    
    try {
      // Use SVG directly with proper high-DPI rendering
      const SCALE = 4;
      
      // Parse the SVG to get dimensions and inject explicit width/height
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      if (!svgEl) {
        // Fallback to SVG download
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'chart.svg';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        setDlStatus('done'); setTimeout(() => setDlStatus('idle'), 2000);
        return;
      }
      
      // Extract viewBox
      const vb = svgEl.getAttribute('viewBox');
      let w = parseFloat(svgEl.getAttribute('width') || '0');
      let h = parseFloat(svgEl.getAttribute('height') || '0');
      
      if (vb && (w === 0 || h === 0)) {
        const parts = vb.split(/[\s,]+/).filter(Boolean).map(Number);
        if (parts.length >= 4) {
          w = parts[2];
          h = parts[3];
          // Inject explicit width/height so Image renders at correct size
          svgEl.setAttribute('width', String(w));
          svgEl.setAttribute('height', String(h));
        }
      }
      
      // Ensure minimum resolution
      if (w < 600) w = 600;
      if (h < 400) h = 400;
      
      // Serialize the modified SVG
      const serializer = new XMLSerializer();
      const modifiedSvg = serializer.serializeToString(svgEl);
      
      const canvasW = Math.round(w * SCALE);
      const canvasH = Math.round(h * SCALE);
      
      // Create blob from modified SVG
      const svgBlob = new Blob([modifiedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d', { alpha: false })!;
        
        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Fill background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvasW, canvasH);
        
        // Draw at high resolution
        ctx.drawImage(img, 0, 0, canvasW, canvasH);
        URL.revokeObjectURL(url);
        
        // Export as high-quality PNG
        canvas.toBlob((blob) => {
          if (!blob) {
            // Fallback
            const a = document.createElement('a'); a.href = url; a.download = 'chart.svg';
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            setDlStatus('done'); setTimeout(() => setDlStatus('idle'), 2000);
            return;
          }
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = pngUrl; a.download = `chart-${canvasW}x${canvasH}.png`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
          setDlStatus('done'); setTimeout(() => setDlStatus('idle'), 2000);
        }, 'image/png', 1.0);
      };
      
      img.onerror = () => {
        // Fallback to SVG download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chart.svg';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDlStatus('done'); setTimeout(() => setDlStatus('idle'), 2000);
      };
      
      img.src = url;
    } catch {
      setDlStatus('idle');
    }
  }, [svgContent]);

  const handleZoom = useCallback(() => {
    touchData.current = { zoom: 1, panX: 0, panY: 0 };
    setZoom(1); setPanX(0); setPanY(0); setShowModal(true);
  }, []);

  return (
    <>
      <div className="relative group my-6">
        <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={handleDownload} disabled={!svgContent || dlStatus === 'loading'}
            className="p-1.5 rounded-md bg-slate-800/80 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="下载 PNG">
            {dlStatus === 'loading' ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              : dlStatus === 'done' ? <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
          </button>
          <button onClick={handleZoom} disabled={!svgContent}
            className="p-1.5 rounded-md bg-slate-800/80 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden md:flex" title="放大查看">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
          </button>
        </div>
        <MermaidChart chart={chart} onSvgReady={handleSvgReady} />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col overflow-hidden" style={{ overscrollBehavior: 'none' }} onClick={() => setShowModal(false)}>
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/80 shrink-0">
            <span className="text-sm text-slate-400">双指缩放 · 双击放大 · 单指拖拽</span>
            <div className="flex items-center gap-2">
              <button onClick={() => doZoom(Math.max(0.25, touchData.current.zoom - 0.25))} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all" title="缩小">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
              </button>
              <span className="text-sm text-white font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => doZoom(Math.min(5, touchData.current.zoom + 0.25))} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all" title="放大">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
              </button>
              <button onClick={() => doZoom(1)} className="px-2.5 py-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs" title="重置">重置</button>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all ml-2" title="关闭">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div ref={containerRef} className="flex-1 overflow-hidden flex items-center justify-center" style={{ touchAction: 'none' }}
            onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div ref={zoomElRef} style={{ transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})` }} dangerouslySetInnerHTML={{ __html: svgContent }} />
          </div>
        </div>
      )}
    </>
  );
}
