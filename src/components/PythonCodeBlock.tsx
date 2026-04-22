'use client';

import { useState, useRef, useCallback, useMemo } from 'react';

// ── Python syntax highlighter (shared with article page) ──
const PY_KW = new Set(['import','from','def','class','return','if','else','elif','for','while','try','except','with','as','yield','lambda','pass','break','continue','raise','in','not','and','or','is','True','False','None','self','super','global','nonlocal','assert','del','finally','async','await','print']);
const PY_TYPES = new Set(['int','str','float','bool','list','dict','tuple','set','bytes','object','type','Optional','Any','Union','List','Dict','Callable','Iterable','Iterator','Generator','Sequence','Mapping','MutableMapping','Tuple','Set','FrozenSet','Deque','DefaultDict','OrderedDict','Counter','NamedTuple','TypeVar','Generic','Protocol','runtime_checkable','Final','ClassVar','Literal','TypedDict','Annotated','Self','Never','NoReturn']);
const PY_BUILTINS = new Set(['torch','nn','math','os','sys','json','re','typing','collections','functools','itertools','pathlib','datatrove','trl','transformers','tiktoken','datasets']);

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function highlightPy(code: string): string {
  let i = 0; const tokens: string[] = [];
  while (i < code.length) {
    if (code[i] === '#') { let e = code.indexOf('\n', i); if (e === -1) e = code.length; tokens.push(`<span class='token-comment'>${esc(code.slice(i, e))}</span>`); i = e; continue; }
    if (code.slice(i, i+3) === '"""' || code.slice(i, i+3) === "'''") { const q = code.slice(i, i+3); let e = code.indexOf(q, i+3); if (e === -1) e = code.length; else e += 3; tokens.push(`<span class='token-string'>${esc(code.slice(i, e))}</span>`); i = e; continue; }
    if (code[i] === '"' || (code[i] === 'f' && code[i+1] === '"')) { const qi = code[i] === 'f' ? i+1 : i; let j = qi+1; while (j < code.length && code[j] !== '"') { if (code[j] === '\\') j++; j++; } tokens.push(`<span class='token-string'>${esc(code.slice(i, j+1))}</span>`); i = j+1; continue; }
    if (code[i] === "'" || (code[i] === 'f' && code[i+1] === "'")) { const qi = code[i] === 'f' ? i+1 : i; let j = qi+1; while (j < code.length && code[j] !== "'") { if (code[j] === '\\') j++; j++; } tokens.push(`<span class='token-string'>${esc(code.slice(i, j+1))}</span>`); i = j+1; continue; }
    if (/[a-zA-Z_]/.test(code[i])) { let j = i; while (j < code.length && /[\w]/.test(code[j])) j++; const w = code.slice(i, j); let k = j; while (k < code.length && code[k] === ' ') k++; if (code[k] === '(') { tokens.push(esc(code.slice(i, j))); i = j; continue; } if (PY_KW.has(w)) tokens.push(`<span class='token-keyword'>${esc(w)}</span>`); else if (PY_TYPES.has(w)) tokens.push(`<span class='token-type'>${esc(w)}</span>`); else if (PY_BUILTINS.has(w)) tokens.push(`<span class='token-builtin'>${esc(w)}</span>`); else tokens.push(esc(w)); i = j; continue; }
    if (/\d/.test(code[i])) { let j = i; while (j < code.length && /[\d.]/.test(code[j])) j++; tokens.push(`<span class='token-number'>${esc(code.slice(i, j))}</span>`); i = j; continue; }
    if (code[i] === '@') { let j = i+1; while (j < code.length && /\w/.test(code[j])) j++; tokens.push(`<span class='token-decorator'>${esc(code.slice(i, j))}</span>`); i = j; continue; }
    tokens.push(esc(code[i])); i++;
  }
  return tokens.join('');
}

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

/** 从 ModuleNotFoundError 中提取缺失的模块名 */
function extractMissingModule(errorMessage: string): string | null {
  const match = errorMessage.match(/No module named '([^']+)'/);
  return match ? match[1] : null;
}

/** Pyodide 不支持的大型包（有 C 扩展 / WASM 不兼容） */
const UNSUPPORTED_IN_PYODIDE = new Set([
  'torch', 'tensorflow', 'tf', 'tensorflowjs',
  'opencv-python', 'cv2', 'dlib', 'faiss',
  'llama-cpp', 'transformers', 'onnxruntime',
]);

/** 将 import 名映射到 pip 包名（取顶级） */
function importToPipPackage(moduleName: string): string {
  const topLevel = moduleName.split('.')[0];
  const pipMappings: Record<string, string> = {
    'sklearn': 'scikit-learn',
    'PIL': 'pillow',
    'cv2': 'opencv-python',
    'yaml': 'pyyaml',
    'bs4': 'beautifulsoup4',
    'dateutil': 'python-dateutil',
  };
  return pipMappings[topLevel] || topLevel;
}

/** 检查模块是否在 Pyodide 不支持列表中 */
function isUnsupportedInPyodide(moduleName: string): boolean {
  const topLevel = moduleName.split('.')[0];
  return UNSUPPORTED_IN_PYODIDE.has(topLevel) || UNSUPPORTED_IN_PYODIDE.has(moduleName);
}

/** 从 Python 代码中提取 import 的模块名 */
function extractImports(code: string): string[] {
  const imports = new Set<string>();

  const importRegex = /^import\s+([a-zA-Z0-9_.]+)/gm;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    imports.add(match[1]);
  }

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
    if (PYODIDE_PACKAGES[imp]) {
      packages.add(PYODIDE_PACKAGES[imp]);
      continue;
    }

    let found = false;
    for (const [key, pkg] of Object.entries(PYODIDE_PACKAGES)) {
      if (imp.startsWith(key + '.')) {
        packages.add(pkg);
        found = true;
        break;
      }
    }

    if (!found) {
      const topLevel = imp.split('.')[0];
      packages.add(topLevel);
    }
  }

  return Array.from(packages);
}

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

/** 安装单个包（返回是否成功） */
async function installPackageViaMicropip(
  pyodide: any,
  packageName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await pyodide.runPythonAsync(`
      import micropip
      await micropip.install("${packageName}")
    `);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || String(e) };
  }
}

/**
 * 智能安装依赖：尝试安装缺失模块，最多重试 N 次
 * 每次安装后重新执行代码，可能发现新的缺失依赖
 */
async function installMissingAndRun(
  pyodide: any,
  code: string,
  setOutput: React.Dispatch<React.SetStateAction<string[]>>,
  setStatusMessage: React.Dispatch<React.SetStateAction<string>>,
  maxRetries: number = 5,
): Promise<{ success: boolean; error?: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      setOutput([]);

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

      // 尝试执行
      await pyodide.runPythonAsync(code);
      return { success: true }; // 执行成功！
    } catch (err: any) {
      const errMsg = err.message || String(err);

      // 检查是否是 ModuleNotFoundError
      const missingModule = extractMissingModule(errMsg);
      if (!missingModule) {
        // 不是模块缺失，直接返回错误
        return { success: false, error: errMsg };
      }

      // 检查是否是 Pyodide 不支持的包（如 torch、tensorflow）
      if (isUnsupportedInPyodide(missingModule)) {
        return {
          success: false,
          error: `「${missingModule}」不支持在浏览器中运行。\n\n该包依赖底层 C/C++ 扩展，Pyodide（WASM 环境）无法兼容。\n\n建议在本地 Python 环境中运行此代码。`,
        };
      }

      // 映射到 pip 包名
      const pipPackage = importToPipPackage(missingModule);
      setStatusMessage(`📦 正在安装 ${pipPackage}...（第 ${attempt} 次）`);

      const installResult = await installPackageViaMicropip(pyodide, pipPackage);

      if (!installResult.success) {
        // 如果包安装失败，尝试用缺失的 import 名安装
        if (pipPackage !== missingModule) {
          setStatusMessage(`📦 ${pipPackage} 安装失败，尝试安装 ${missingModule}...`);
          const retryResult = await installPackageViaMicropip(pyodide, missingModule);
          if (!retryResult.success) {
            return {
              success: false,
              error: `无法安装 ${missingModule}\n\n该包可能不支持 Pyodide（WASM）环境。`,
            };
          }
        } else {
          return { success: false, error: `无法安装 ${pipPackage}\n\n该包可能不支持 Pyodide（WASM）环境。` };
        }
      }

      setStatusMessage(`✅ ${pipPackage} 安装完成，正在执行...`);
      // 继续下一轮循环（重新执行代码）
    }
  }

  return { success: false, error: '超过最大重试次数' };
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

      // 先用 pyodide.loadPackage 预加载已知内置包（更快）
      const packages = resolvePackages(code);
      const knownPackages = packages.filter(
        (p) => Object.values(PYODIDE_PACKAGES).includes(p),
      );

      if (knownPackages.length > 0) {
        setStatusMessage(`📦 预加载依赖：${knownPackages.join(', ')}...`);
        try {
          await pyodide.loadPackage(knownPackages);
        } catch (e: any) {
          console.warn('Pyodide package load failed:', e);
        }
      }

      // 智能安装 + 执行：自动检测缺失模块 → micropip 安装 → 重新执行
      setLoading(false);
      const result = await installMissingAndRun(
        pyodide,
        code,
        setOutput,
        setStatusMessage,
      );

      if (!result.success) {
        const cleanError = result.error || '执行失败';
        if (cleanError.includes('No module named')) {
          const missingModule = extractMissingModule(cleanError);
          setError(
            `缺少模块「${missingModule || '未知'}」，无法自动安装。\n\n` +
            `可能原因：\n` +
            `• 该包不包含 Pyodide/WASM 版本\n` +
            `• 包名与 PyPI 名称不一致`,
          );
        } else if (cleanError.includes('micropip') || cleanError.includes('install')) {
          setError(`依赖安装失败：\n${cleanError}\n\n该包可能不支持 Pyodide 环境。`);
        } else {
          setError(cleanError);
        }
      }
      setStatusMessage('');
    } catch (err: any) {
      const errMsg = err.message || String(err);
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
        <pre className="p-4 overflow-x-auto overflow-y-auto max-h-[400px] text-sm">
          <code className="font-mono whitespace-pre" dangerouslySetInnerHTML={{ __html: highlightPy(code) }} />
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
            {(loading || (running && statusMessage)) && (
              <div className="flex items-center gap-2 text-amber-400">
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
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-300 whitespace-pre-wrap break-words leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">⚠️</span>
                      <div className="flex-1">
                        <div className="font-semibold text-red-200 mb-1">运行出错</div>
                        <div className="text-sm text-red-300 whitespace-pre-wrap">{error}</div>
                      </div>
                    </div>
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
