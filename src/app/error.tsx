'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white flex flex-col items-center justify-center px-4">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-3xl font-bold mb-4">页面加载出错</h1>
      <p className="text-slate-400 mb-2 max-w-md text-center">
        抱歉，加载页面时发生了错误。请稍后重试。
      </p>
      {error.message && (
        <p className="text-sm text-slate-500 mb-6 max-w-lg text-center font-mono">
          {error.message}
        </p>
      )}
      <button
        onClick={reset}
        className="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-medium transition-all"
      >
        🔄 重试
      </button>
    </div>
  );
}
