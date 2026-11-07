'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { faseDeRuta } from '../lib/navegacion';

interface PageHeaderProps {
  titulo: React.ReactNode;
  /** Acción del botón ← (si no se pasa, usa backHref). */
  onBack?: () => void;
  backHref?: string;
  /** Contenido a la derecha: contador, botón, stepper, etc. */
  right?: React.ReactNode;
}

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M19 12H5M5 12l7 7M5 12l7-7" />
  </svg>
);

/** Barra de título de cada herramienta. Va debajo del AppHeader global (sticky top-14). */
export default function PageHeader({ titulo, onBack, backHref, right }: PageHeaderProps) {
  const fase = faseDeRuta(usePathname() ?? '');
  const backClass = 'flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 shrink-0';

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-14 z-20 print:hidden">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        {onBack ? (
          <button onClick={onBack} className={backClass} aria-label="Volver"><ArrowLeft /></button>
        ) : backHref ? (
          <Link href={backHref} className={backClass} aria-label="Volver"><ArrowLeft /></Link>
        ) : null}
        <div className="min-w-0 flex-1">
          {fase && (
            <p className="text-[11px] font-semibold uppercase tracking-wider leading-none mb-1" style={{ color: fase.color }}>
              Fase {fase.id} · {fase.nombre}
            </p>
          )}
          <h1 className="text-sm font-semibold text-gray-900 tracking-tight truncate">{titulo}</h1>
        </div>
        {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
      </div>
    </div>
  );
}
