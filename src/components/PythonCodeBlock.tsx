'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

declare global {
  interface Window {
    loadPyodide: (options: { indexURL: string }) => Promise<any>;
  }
}

// Pyodide 全局单例缓存 —— 只加载一次
let globalPyodide: any = null;
let loadingPromise: Promise<any> | null = null;

/** 动态加载 CDN script 标签 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function getPyodide(): Promise<any> {
  if (globalPyodide) return globalPyodide;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    // 1. 加载 CDN script
    await loadScript('https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js');

    if (!window.loadPyodide) {
      throw new Error('Pyodide 加载失败：loadPyodide 未定义');
    }

    // 2. 初始化 pyodide
    globalPyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
    });
    loadingPromise = null;
    return globalPyodide;
  })();

  return loadingPromise;
}

interface PythonCodeBlockProps {
  code: string;
  lang: string;
  filename?: string;
  CopyButtonComponent?: React.ComponentType<{ text: string }>;
}

export default function PythonCodeBlock({ code, lang, filename, CopyButtonComponent }: PythonCodeBlockProps) {
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleRun = useCallback(async () => {
    // 如果已有结果，切换显示/隐藏
    if (showResult && !running && !loading) {
      setShowResult(false);
      return;
    }

    setRunning(true);
    setLoading(false);
    setError(null);
    setOutput([]);
    setShowResult(true);

    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    try {
      setLoading(true);
      const pyodide = await getPyodide();
      setLoading(false);

      // 捕获 stdout/stderr
      pyodide.setStdout({
        batched: (msg: string) => {
          setOutput((prev) => [...prev, msg]);
        },
      });
      pyodide.setStderr({
        batched: (msg: string) => {
          setOutput((prev) => [...prev, msg]);
        },
      });

      await pyodide.runPythonAsync(code);
    } catch (err: any) {
      const msg = err.message || String(err);
      // 识别不支持的库，给出友好提示
      const unsupportedModules = msg.match(/No module named '(.*?)'/)?.[1];
      if (unsupportedModules) {
        const bigModules = ['torch', 'tensorflow', 'tf', 'keras', 'jax', 'scikit-learn', 'sklearn', 'xgboost', 'lightgbm', 'opencv', 'cv2'];
        if (bigModules.some(m => unsupportedModules.includes(m))) {
          setError(
            `无法加载模块「${unsupportedModules}」\n\n` +
            `📦 Pyodide 是浏览器内运行的 Python 环境，不支持大型 C 扩展库（如 torch/tensorflow/opencv 等）。\n\n` +
            `✅ 支持的常用库：numpy、matplotlib、pandas、scipy、sympy、json、re、os 等标准库和纯 Python 库。\n\n` +
            `💡 如需运行此代码，建议使用本地 Python 环境或云端 Jupyter Notebook。`
          );
        } else {
          setError(`模块「${unsupportedModules}」未安装。\n\nPyodide 环境仅预装了标准库和部分纯 Python 库（numpy、pandas、matplotlib 等）。`);
        }
      } else {
        setError(msg);
      }
    } finally {
      setRunning(false);
      setLoading(false);
    }
  }, [code, showResult, running, loading]);

  const handleClear = useCallback(() => {
    setOutput([]);
    setError(null);
    setShowResult(false);
  }, []);

  const isPython = lang === 'python' || lang === 'py';

  return (
    <>
      <div className="rounded-xl overflow-hidden bg-slate-900/80 border border-white/10">
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 text-sm text-slate-400">
          <span className="font-mono">{lang}</span>
          <div className="flex items-center gap-2">
            {filename && <span>{filename}</span>}
            {CopyButtonComponent && <CopyButtonComponent text={code} />}
            {isPython && (
              <button
                onClick={handleRun}
                disabled={running || loading}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  running || loading
                    ? 'text-amber-400 cursor-wait'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={running || loading ? '执行中...' : '运行 Python 代码'}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    加载中
                  </>
                ) : running ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    运行中
                  </>
                ) : (
                  <>▶ 运行</>
                )}
              </button>
            )}
          </div>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-slate-300 font-mono whitespace-pre">{code}</code>
        </pre>
      </div>

      {/* 结果区域 */}
      {showResult && (
        <div ref={outputRef} className="rounded-xl overflow-hidden border border-white/10 bg-slate-950/90 -mt-4 relative z-10">
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 text-sm text-slate-400 border-b border-white/5">
            <span className="font-medium">🖥️ 运行结果</span>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              title="清除输出"
            >
              🗑️ 清除
            </button>
          </div>
          <div className="p-4 font-mono text-sm min-h-[2rem] max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex items-center gap-2 text-amber-400">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>正在加载 Python 环境（首次约 10MB，请稍候）...</span>
              </div>
            )}
            {running && !loading && (
              <div className="flex items-center gap-2 text-brand-400">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>正在执行...</span>
              </div>
            )}
            {!loading && !running && (
              <>
                {output.length > 0 && output.map((line, i) => (
                  <div key={i} className="text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
                    {line}
                  </div>
                ))}
                {error && (
                  <div className="text-red-400 whitespace-pre-wrap break-words leading-relaxed">
                    ❌ {error}
                  </div>
                )}
                {output.length === 0 && !error && (
                  <div className="text-slate-500 italic">无输出</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
