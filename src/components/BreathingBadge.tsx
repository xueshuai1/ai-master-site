'use client';

import { useState } from 'react';

/**
 * 呼吸灯 Badge — 首页 "AI Master · 精通人工智能"
 *
 * 效果：
 * - 三层呼吸光晕（外慢/中标准/内快），模拟真实呼吸节奏
 * - 中心脉冲点持续 ping 扩散，体现「持续更新」
 * - 悬停时光晕增强 + 旋转光环浮现
 *
 * 修复 v2：
 * - 文字用纯 color 不再做 gradient-clip，避免 hover 变块状
 * - 去掉 useEffect 鼠标追踪，纯 CSS hover，避免首帧卡顿
 * - 动画加 animationDelay 错开启动
 */
export default function BreathingBadge() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full overflow-hidden select-none"
      style={{
        background: hovered
          ? 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.10) 100%)'
          : 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(59,130,246,0.04) 100%)',
        border: hovered ? '1px solid rgba(139,92,246,0.30)' : '1px solid rgba(99,102,241,0.15)',
        transition: 'all 0.4s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── 外圈光晕 · 慢呼吸 4s ── */}
      <div
        className="absolute -inset-6 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          animation: 'breathe-slow 4s ease-in-out infinite',
          animationDelay: '0s',
        }}
      />
      {/* ── 中圈光晕 · 标准呼吸 2.5s ── */}
      <div
        className="absolute -inset-3 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)',
          animation: 'breathe-normal 2.5s ease-in-out infinite',
          animationDelay: '0.5s',
        }}
      />
      {/* ── 内圈光晕 · 快呼吸 1.5s ── */}
      <div
        className="absolute -inset-1 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 50%)',
          animation: 'breathe-fast 1.5s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />

      {/* ── 旋转光环（悬停时浮现） ── */}
      <div
        className="absolute -inset-4 rounded-full pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, rgba(99,102,241,0.20) 10%, transparent 20%, rgba(139,92,246,0.12) 40%, transparent 50%, rgba(59,130,246,0.20) 70%, transparent 80%)',
          animation: 'spin-ring 6s linear infinite',
          animationDelay: '1.5s',
          opacity: hovered ? 0.5 : 0,
          transition: 'opacity 0.4s ease',
          filter: 'blur(5px)',
        }}
      />

      {/* ── 中心脉冲点 ── */}
      <span className="relative flex h-2.5 w-2.5 shrink-0 z-10">
        <span
          className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-40"
          style={{
            animation: 'ping-ring 2s cubic-bezier(0,0,0.2,1) infinite',
            animationDelay: '1.2s',
          }}
        />
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{
            background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
            boxShadow: '0 0 6px rgba(129,140,248,0.6), 0 0 12px rgba(167,139,250,0.3)',
          }}
        />
      </span>

      {/* ── 文字：纯 color，不做 gradient-clip ── */}
      <span
        className="relative z-10 text-sm font-medium transition-colors duration-400"
        style={{
          color: hovered ? '#e0e7ff' : '#c7d2fe',
          letterSpacing: '0.02em',
        }}
      >
        AI Master · 精通人工智能
      </span>

      <style jsx>{`
        @keyframes breathe-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.06); }
        }
        @keyframes breathe-normal {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.03); }
        }
        @keyframes breathe-fast {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.02); }
        }
        @keyframes ping-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
