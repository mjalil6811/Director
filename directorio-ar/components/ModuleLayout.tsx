'use client';

import Link from 'next/link';

interface ModuleLayoutProps {
  moduleNumber: number;
  totalModules?: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const MODULOS = ['Necesidad', 'Decisiones', 'Perfiles', 'Dinámica', 'Gerencia'];

export default function ModuleLayout({ moduleNumber, totalModules = 5, title, subtitle, children }: ModuleLayoutProps) {
  const prevHref = moduleNumber > 1 ? `/modulo/${moduleNumber - 1}` : '/';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-[#FAFBFC]">
      {/* Barra del módulo */}
      <div className="bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] sticky top-14 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={prevHref}
            aria-label={moduleNumber > 1 ? `Volver al módulo ${moduleNumber - 1}` : 'Volver al inicio'}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-[#534AB7] uppercase tracking-wider leading-none mb-1">
              Módulo {moduleNumber} de {totalModules}
            </p>
            <h1 className="text-sm font-semibold text-gray-900 tracking-tight truncate">{title}</h1>
          </div>
        </div>
        {/* Stepper de módulos */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-1.5">
          {Array.from({ length: totalModules }).map((_, i) => {
            const n = i + 1;
            const done = n < moduleNumber;
            const here = n === moduleNumber;
            return (
              <Link
                key={n}
                href={`/modulo/${n}`}
                title={`Módulo ${n} · ${MODULOS[i] ?? ''}`}
                className="flex-1 group"
              >
                <div className={`h-1.5 rounded-full transition-colors ${done || here ? 'bg-[#534AB7]' : 'bg-gray-200 group-hover:bg-gray-300'} ${here ? 'opacity-100' : done ? 'opacity-60' : ''}`} />
                <span className={`hidden sm:block mt-1 text-[10px] ${here ? 'text-[#534AB7] font-semibold' : 'text-gray-400'}`}>{MODULOS[i]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        {subtitle && (
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{subtitle}</p>
        )}
        {children}
      </main>
    </div>
  );
}
