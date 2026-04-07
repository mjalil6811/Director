'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '../lib/storage';

const MODULOS = [
  {
    n: 1,
    label: '¿Necesitás un directorio?',
    desc: '12 preguntas · 6 dimensiones',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    n: 2,
    label: 'Clasificador de roles',
    desc: '10 situaciones concretas',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    n: 3,
    label: 'Perfiles del directorio',
    desc: '15 preguntas · 10 perfiles',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    n: 4,
    label: 'Dinámica de reuniones',
    desc: 'Agenda, decisiones y actas',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    n: 5,
    label: 'Directorio y gerencia',
    desc: '7 tensiones · diagnóstico',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [completados, setCompletados] = useState<boolean[]>([false, false, false, false, false]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const n = storage.getEmpresaNombre();
    if (n) setNombre(n);
    setCompletados([
      !!storage.getModulo1Resultado(),
      !!storage.getModulo2Resultado(),
      !!storage.getModulo3Resultado(),
      !!storage.getModulo4Frecuencia(),
      !!storage.getModulo5Resultado(),
    ]);
  }, []);

  const completedCount = completados.filter(Boolean).length;
  const hasData = completedCount > 0;
  const nextModulo = completados.findIndex(c => !c) + 1 || null;

  function handleNombreChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNombre(e.target.value);
    storage.setEmpresaNombre(e.target.value);
  }

  function handleComenzar() {
    if (nombre.trim()) storage.setEmpresaNombre(nombre.trim());
    router.push('/modulo/1');
  }

  function handleContinuar() {
    if (nombre.trim()) storage.setEmpresaNombre(nombre.trim());
    router.push(nextModulo ? `/modulo/${nextModulo}` : '/dashboard');
  }

  function handleReiniciar() {
    storage.clearAll();
    setCompletados([false, false, false, false, false]);
    setNombre('');
  }

  function handleModuloClick(n: number) {
    if (nombre.trim()) storage.setEmpresaNombre(nombre.trim());
    const accessible = n === 1 || completados[n - 2];
    if (!accessible) return;
    router.push(`/modulo/${n}`);
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200 w-64 shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#534AB7] flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="17" />
              <line x1="9" y1="14.5" x2="15" y2="14.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">Directorio AR</p>
            <p className="text-xs text-gray-400 mt-0.5">Gobierno corporativo</p>
          </div>
        </div>
      </div>

      {/* Progress summary */}
      {hasData && (
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Progreso</span>
            <span className="text-xs font-bold text-[#534AB7]">{completedCount}/5</span>
          </div>
          <div className="flex gap-1">
            {completados.map((done, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${done ? 'bg-[#534AB7]' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Módulos</p>
        <div className="space-y-0.5">
          {MODULOS.map(({ n, label, icon }) => {
            const done = completados[n - 1];
            const accessible = n === 1 || completados[n - 2];
            const locked = !accessible;

            return (
              <button
                key={n}
                onClick={() => handleModuloClick(n)}
                disabled={locked}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm
                  ${locked
                    ? 'opacity-40 cursor-not-allowed text-gray-400'
                    : done
                      ? 'text-[#534AB7] bg-purple-50 hover:bg-purple-100'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className={`shrink-0 ${done ? 'text-[#534AB7]' : locked ? 'text-gray-300' : 'text-gray-400'}`}>
                  {done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
                    </svg>
                  ) : locked ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ) : icon}
                </span>
                <span className="truncate font-medium">{label}</span>
                {!locked && !done && (
                  <svg className="ml-auto shrink-0 text-gray-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {completedCount === 5 && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2 mt-5">Resultados</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm text-gray-700 hover:bg-gray-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </button>
          </>
        )}
      </nav>

      {/* Bottom */}
      {hasData && (
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={handleReiniciar}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            </svg>
            Reiniciar diagnóstico
          </button>
        </div>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar — desktop */}
      <div className="hidden lg:flex lg:flex-col lg:h-screen lg:sticky lg:top-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#534AB7] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">Directorio AR</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">

            {/* Hero title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center leading-tight mb-8">
              ¿Tu empresa necesita empezar<br className="hidden sm:block" /> a armar un directorio?
            </h1>

            {/* Stats row — only when has data */}
            {hasData && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#534AB7]">{completedCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Módulos completados</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{Math.round((completedCount / 5) * 100)}%</p>
                  <p className="text-xs text-gray-400 mt-0.5">Progreso total</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{5 - completedCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Módulos restantes</p>
                </div>
              </div>
            )}

            {/* Main card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Diagnóstico de Gobierno Corporativo</h2>
                <p className="text-sm text-gray-500">
                  5 módulos para diagnosticar la necesidad, composición y dinámica de un directorio.
                </p>
              </div>

              <div className="px-6 py-5">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre de la empresa <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={handleNombreChange}
                    placeholder="Ej: Empresa SRL"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
                  />
                </div>

                {hasData ? (
                  <div className="space-y-2.5">
                    <button
                      onClick={handleContinuar}
                      className="w-full py-3 px-4 bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      {completedCount === 5 ? 'Ver diagnóstico completo' : `Continuar — Módulo ${nextModulo}`}
                    </button>
                    {completedCount < 5 && (
                      <button
                        onClick={handleComenzar}
                        className="w-full py-2.5 px-4 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Ir al inicio (Módulo 1)
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleComenzar}
                    className="w-full py-3 px-4 bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    Comenzar diagnóstico →
                  </button>
                )}
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-gray-400 mt-6">
              Todo el diagnóstico se guarda localmente en tu dispositivo. Sin registro, sin servidor.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
