'use client';

import { useRouter } from 'next/navigation';

interface ModuleLayoutProps {
  moduleNumber: number;
  totalModules?: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function ModuleLayout({ moduleNumber, totalModules = 4, title, subtitle, children }: ModuleLayoutProps) {
  const router = useRouter();
  const progress = (moduleNumber / totalModules) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFC]">
      {/* Progress bar at very top */}
      <div className="h-1 w-full bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top nav */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button
          onClick={() => router.push('/')}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <button
            onClick={() => router.push('/')}
            className="text-xs font-medium text-[#534AB7] bg-[#EEEDFE] px-2 py-0.5 rounded-full hover:bg-[#DDD9FE] transition-colors"
          >
            Fase 1
          </button>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] text-white text-xs font-bold flex items-center justify-center shadow-sm">
            {moduleNumber}
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: totalModules }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-1.5 rounded-full ${i < moduleNumber ? 'bg-[#534AB7]' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 font-medium ml-1">
            {moduleNumber}/{totalModules}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-8 pb-20 max-w-2xl mx-auto w-full">
        {subtitle && (
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{subtitle}</p>
        )}
        {children}
      </main>

      {/* Sticky footer — volver al inicio */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-[#E5E7EB] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#534AB7] font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Volver al inicio
          </button>
          <span className="text-xs text-gray-300">Módulo {moduleNumber} de {totalModules}</span>
        </div>
      </div>
    </div>
  );
}
