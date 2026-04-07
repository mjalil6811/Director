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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center">
            {moduleNumber}
          </div>
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        <span className="text-xs text-gray-400">
          {moduleNumber}/{totalModules}
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {subtitle && (
          <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
        )}
        {children}
      </main>
    </div>
  );
}
