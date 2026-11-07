'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FASES, faseDeRuta } from '../lib/navegacion';

function Logo() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-sm">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    </div>
  );
}

export default function AppHeader() {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const activa = faseDeRuta(pathname);

  // Cerrar el menú al navegar o con Escape / click afuera
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onClick = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [open]);

  // La landing tiene su propia navegación
  if (pathname === '/') return null;

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-md border-b border-gray-200 print:hidden">
      <div ref={panelRef} className="relative max-w-6xl mx-auto h-full px-4 flex items-center gap-3">
        {/* Logo → inicio */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-brand" aria-label="Ir al inicio">
          <Logo />
          <span className="hidden sm:block text-sm font-bold text-gray-900 tracking-tight">Directorio AR</span>
        </Link>

        {/* Stepper de fases */}
        <nav className="flex-1 flex items-center justify-center gap-1 sm:gap-2" aria-label="Fases">
          {FASES.map((f, i) => {
            const isActive = activa?.id === f.id;
            return (
              <div key={f.id} className="flex items-center gap-1 sm:gap-2">
                <Link
                  href={f.href}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${isActive ? '' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                  style={isActive ? { color: f.color, backgroundColor: f.bg } : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={isActive ? { backgroundColor: f.color, color: 'white' } : { backgroundColor: '#F3F4F6', color: '#6B7280' }}
                  >
                    {f.id}
                  </span>
                  <span className="hidden md:inline">{f.nombre}</span>
                </Link>
                {i < FASES.length - 1 && <span className="hidden sm:block w-4 h-px bg-gray-200" aria-hidden />}
              </div>
            );
          })}
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-brand hover:bg-brand-50 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <button
            onClick={() => setOpen(o => !o)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${open ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
            aria-expanded={open}
            aria-label="Abrir menú de herramientas"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
            <span className="hidden sm:inline">Menú</span>
          </button>
        </div>

        {/* Panel de herramientas */}
        {open && (
          <div className="absolute right-4 left-4 sm:left-auto top-[calc(100%+8px)] sm:w-[660px] bg-white border border-gray-200 rounded-2xl shadow-xl p-4 grid sm:grid-cols-3 gap-4">
            {FASES.map(f => (
              <div key={f.id}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: f.color }}>
                  Fase {f.id} · {f.verbo}
                </p>
                <ul className="space-y-0.5">
                  {f.items.map(it => {
                    const isHere = pathname === it.href;
                    return (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          className={`block px-2 py-1.5 rounded-lg text-[13px] leading-snug transition-colors ${isHere ? 'font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                          style={isHere ? { color: f.color, backgroundColor: f.bg } : undefined}
                        >
                          {it.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
