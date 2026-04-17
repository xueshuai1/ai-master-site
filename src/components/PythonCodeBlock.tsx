'use client';

import { useState, useRef, useCallback } from 'react';

declare global {
  interface Window {
    loadPyodide: (options: { indexURL: string }) => Promise<any>;
  }
}

// Pyodide 全局单例缓存
let globalPyodide: any = null;
let loadingPromise: Promise<any> | null = null;

// Pyodide 内置包映射：import 名 → pyodide 包名
const PYODIDE_PACKAGES: Record<string, string> = {
  numpy: 'numpy',
  'numpy.random': 'numpy',
  'numpy.linalg': 'numpy',
  'numpy.fft': 'numpy',
  scipy: 'scipy',
  'scipy.stats': 'scipy',
  'scipy.optimize': 'scipy',
  'scipy.integrate': 'scipy',
  'scipy.linalg': 'scipy',
  pandas: 'pandas',
  matplotlib: 'matplotlib',
  'matplotlib.pyplot': 'matplotlib',
  sklearn: 'scikit-learn',
  'sklearn.linear_model': 'scikit-learn',
  'sklearn.datasets': 'scikit-learn',
  sympy: 'sympy',
  networkx: 'networkx',
  requests: 'requests',
  beautifulsoup4: 'beautifulsoup4',
  bs4: 'beautifulsoup4',
  lxml: 'lxml',
  yaml: 'pyyaml',
  pyyaml: 'pyyaml',
  pillow: 'pillow',
  PIL: 'pillow',
  'PIL.Image': 'pillow',
  sqlite3: 'sqlite3',
  pytest: 'pytest',
  micropip: 'micropip',
  pytz: 'pytz',
  'dateutil': 'python-dateutil',
  'python-dateutil': 'python-dateutil',
  'html.parser': 'html5lib',
  html5lib: 'html5lib',
  xarray: 'xarray',
  packaging: 'packaging',
};

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

/** 从 Python 代码中提取 import 的模块名 */
function extractImports(code: string): string[] {
  const imports = new Set<string>();

  // 匹配 import X, import X.Y, import X as Z
  const importRegex = /^import\s+([a-zA-Z0-9_.]+)/gm;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    imports.add(match[1]);
  }

  // 匹配 from X import Y
  const fromRegex = /^from\s+([a-zA-Z0-9_.]+)\s+import/gm;
  while ((match = fromRegex.exec(code)) !== null) {
    imports.add(match[1]);
  }

  return Array.from(imports);
}

/** 将 import 名映射到 pyodide 包名（去重） */
function resolvePackages(code: string): string[] {
  const importNames = extractImports(code);
  const packages = new Set<string>();

  for (const imp of importNames) {
    // 直接匹配
    if (PYODIDE_PACKAGES[imp]) {
      packages.add(PYODIDE_PACKAGES[imp]);
      continue;
    }

    // 尝试匹配前缀（如 numpy.linalg → numpy）
    let found = false;
    for (const [key, pkg] of Object.entries(PYODIDE_PACKAGES)) {
      if (imp.startsWith(key + '.')) {
        packages.add(pkg);
        found = true;
        break;
      }
    }

    // 如果没找到，尝试包名本身（纯 Python 包，后续用 micropip）
    if (!found && importNames.length > 0) {
      // 取顶级包名（requests, flask 等）
      const topLevel = imp.split('.')[0];
      // 不在内置列表中，稍后可能需要 micropip
      packages.add(topLevel);
    }
  }

  return Array.from(packages);
}

async function getPyodide(): Promise<any> {
  if (globalPyodide) return globalPyodide;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    await loadScript('https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js');

    if (!window.loadPyodide) {
      throw new Error('Pyodide 加载失败：loadPyodide 未定义');
    }

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
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleRun = useCallback(async () => {
    // 已有结果则切换显示/隐藏
    if (showResult && !running && !loading) {
      setShowResult(false);
      return;
    }

    setRunning(true);
    setLoading(false);
    setError(null);
    setOutput([]);
    setStatusMessage('');
    setShowResult(true);

    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    try {
      setLoading(true);
      setStatusMessage('正在加载 Python 环境...');

      const pyodide = await getPyodide();

      // 检测需要预加载的包
      const packages = resolvePackages(code);
      const builtInPackages = packages.filter(
        (p) => PYODIDE_PACKAGES[p] || Object.values(PYODIDE_PACKAGES).includes(p)
      );

      if (builtInPackages.length > 0) {
        setStatusMessage(`正在安装依赖：${builtInPackages.join(', ')}...`);
        try {
          await pyodide.loadPackage(builtInPackages);
        } catch (e: any) {
          // 预加载失败不影响执行，可能在 micropip 中安装
          console.warn('Pyodide package load failed:', e);
        }
      }

      setLoading(false);
      setStatusMessage('正在执行...');

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
      setStatusMessage('');
    } catch (err: any) {
      const errMsg = err.message || String(err);

      // 如果是因为模块未安装，自动尝试用 micropip 安装
      if (errMsg.includes('micropip.install') || errMsg.includes('not installed')) {
        const moduleNameMatch = errMsg.match(/'([^']+)'/);
        if (moduleNameMatch) {
          const missingModule = moduleNameMatch[1];
          setStatusMessage(`正在自动安装 ${missingModule}...`);

          try {
            const pyodide = await getPyodide();
            await pyodide.runPythonAsync(`
              import micropip
              await micropip.install("${missingModule}")
            `);
            setStatusMessage(`${missingModule} 安装完成，正在执行...`);

            // 重新设置 stdout/stderr
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

            // 重新执行
            await pyodide.runPythonAsync(code);
            setStatusMessage('');
            return;
          } catch (retryErr: any) {
            setError(`自动安装 ${missingModule} 失败：${retryErr.message || String(retryErr)}`);
            setStatusMessage('');
          }
        }
      }

      if (!error) {
        setError(errMsg);
      }
      setStatusMessage('');
    } finally {
      setRunning(false);
      setLoading(false);
    }
  }, [code, showResult, running, loading]);

  const handleClear = useCallback(() => {
    setOutput([]);
    setError(null);
    setShowResult(false);
    setStatusMessage('');
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
                    {statusMessage || '加载...'}
                  </>
                ) : running ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {statusMessage || '执行...'}
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
            {loading && statusMessage && (
              <div className="flex items-center gap-2 text-amber-400">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{statusMessage}</span>
              </div>
            )}
            {running && !loading && statusMessage && (
              <div className="flex items-center gap-2 text-brand-400">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{statusMessage}</span>
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
