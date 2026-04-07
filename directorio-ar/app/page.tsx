'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '../lib/storage';

const MODULOS = [
  {
    n: 1,
    label: '¿Necesitás un directorio?',
    desc: '15 preguntas · 6 dimensiones',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    n: 2,
    label: 'Mapa de decisiones',
    desc: '10 situaciones · tensiones',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    n: 3,
    label: 'Perfiles del directorio',
    desc: '13 preguntas · 4 perfiles',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    n: 4,
    label: 'Dinámica y funcionamiento',
    desc: 'Agenda, tensiones y autoevaluación',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    title: 'Evaluamos la necesidad',
    desc: 'Analizamos si tu empresa necesita un directorio hoy.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: 'Mapeamos las decisiones',
    desc: 'Identificamos cómo se toman las decisiones clave.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: 'Definimos perfiles',
    desc: 'Recomendamos los perfiles ideales para tu directorio.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Generamos tu plan',
    desc: 'Armamos un informe con diagnóstico y próximos pasos.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [completados, setCompletados] = useState<boolean[]>([false, false, false, false]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const n = storage.getEmpresaNombre();
    if (n) setNombre(n);
    setCompletados([
      !!storage.getModulo1Resultado(),
      !!storage.getModulo2Resultado(),
      !!storage.getModulo3Resultado(),
      !!(storage.getModulo4Diagnostico() || storage.getModulo4Frecuencia()),
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
    if (completedCount === 4) {
      router.push('/resultado');
    } else {
      router.push(nextModulo ? `/modulo/${nextModulo}` : '/dashboard');
    }
  }

  function handleReiniciar() {
    storage.clearAll();
    setCompletados([false, false, false, false]);
    setNombre('');
  }

  function handleModuloClick(n: number) {
    if (nombre.trim()) storage.setEmpresaNombre(nombre.trim());
    const accessible = n === 1 || completados[n - 2];
    if (!accessible) return;
    router.push(`/modulo/${n}`);
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-[#E5E7EB] w-64 shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100 bg-gradient-to-b from-white to-[#FAFAFE]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] flex items-center justify-center shrink-0 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="17" />
              <line x1="9" y1="14.5" x2="15" y2="14.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none tracking-tight">Directorio AR</p>
            <p className="text-xs text-gray-400 mt-0.5">Gobierno corporativo</p>
          </div>
        </div>
      </div>

      {/* Progress summary */}
      {hasData && (
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Progreso</span>
            <span className="text-xs font-bold text-[#534AB7]">{completedCount}/4</span>
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
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm relative
                  ${locked
                    ? 'opacity-40 cursor-not-allowed text-gray-400'
                    : done
                      ? 'text-green-700 bg-green-50 hover:bg-green-100 border-l-4 border-green-500 pl-2'
                      : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-[#534AB7] hover:pl-2'
                  }
                `}
              >
                <span className={`shrink-0 ${done ? 'text-green-600' : locked ? 'text-gray-300' : 'text-gray-400'}`}>
                  {done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
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

        {completedCount === 4 && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2 mt-5">Resultados</p>
            <button
              onClick={() => router.push('/resultado')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-[#534AB7] bg-purple-50 hover:bg-purple-100 font-medium border-l-4 border-[#534AB7] pl-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#534AB7]">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Resultado final</span>
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-[#534AB7] hover:pl-2 mt-0.5"
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
    <div className="min-h-screen flex bg-[#FAFBFC]">
      {/* Sidebar — desktop */}
      <div className="hidden lg:flex lg:flex-col lg:h-screen lg:sticky lg:top-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full shadow-2xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-4 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] flex items-center justify-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900 tracking-tight">Directorio AR</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-white via-[#FAFBFC] to-[#F5F3FF]">
          <div className="w-full max-w-lg">

            {/* Hero badge */}
            <div className="flex justify-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEEDFE] border border-[#DDD9FE]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#534AB7]" />
                <span className="text-xs font-medium text-[#534AB7]">Diagnóstico de gobierno corporativo</span>
              </div>
            </div>

            {/* Hero title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center leading-tight tracking-tight mb-4">
              ¿Tu empresa necesita{' '}
              <span className="bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] bg-clip-text text-transparent">
                profesionalizar
              </span>{' '}
              su gobierno?
            </h1>

            {/* Subtitle */}
            <p className="text-center text-gray-500 text-sm sm:text-base leading-relaxed mb-5 max-w-md mx-auto">
              Herramienta de diagnóstico para empresas que quieren profesionalizar su estructura de gobierno.
            </p>

            {/* Feature pills */}
            <div className="flex justify-center gap-2 mb-8">
              {['4 módulos', '15 minutos', 'Resultado personalizado'].map(pill => (
                <span key={pill} className="px-3 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-gray-600 shadow-sm">
                  {pill}
                </span>
              ))}
            </div>

            {/* Stats row — only when has data */}
            {hasData && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-2xl font-bold text-[#534AB7]">{completedCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Módulos completados</p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-2xl font-bold text-gray-900">{Math.round((completedCount / 4) * 100)}%</p>
                  <p className="text-xs text-gray-400 mt-0.5">Progreso total</p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-2xl font-bold text-gray-900">{4 - completedCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Módulos restantes</p>
                </div>
              </div>
            )}

            {/* Main card */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="px-6 pt-6 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EEEDFE] to-[#DDD9FE] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Diagnóstico de Gobierno Corporativo</h2>
                    <p className="text-sm text-gray-500">
                      4 módulos para diagnosticar la necesidad, composición y dinámica de un directorio.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre de la empresa <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={nombre}
                      onChange={handleNombreChange}
                      placeholder="Ej: Empresa SRL"
                      className="w-full pl-10 pr-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] bg-[#FAFBFC]"
                    />
                  </div>
                </div>

                {hasData ? (
                  <div className="space-y-2.5">
                    <button
                      onClick={handleContinuar}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-[#534AB7] to-[#6359C7] hover:from-[#3C3489] hover:to-[#534AB7] text-white font-semibold rounded-xl shadow-sm hover:shadow-md text-sm"
                    >
                      {completedCount === 4 ? 'Ver resultado final' : `Continuar — Módulo ${nextModulo}`}
                    </button>
                    {completedCount < 4 && (
                      <button
                        onClick={handleComenzar}
                        className="w-full py-2.5 px-4 border border-[#E5E7EB] text-gray-600 font-medium rounded-xl hover:bg-gray-50 text-sm"
                      >
                        Ir al inicio (Módulo 1)
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleComenzar}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#534AB7] to-[#6359C7] hover:from-[#3C3489] hover:to-[#534AB7] text-white font-semibold rounded-xl shadow-sm hover:shadow-md text-sm"
                  >
                    Comenzar diagnóstico →
                  </button>
                )}
              </div>
            </div>

            {/* "Cómo funciona" section — only when no data */}
            {!hasData && (
              <div className="mt-12">
                <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">Cómo funciona</p>
                <div className="grid grid-cols-2 gap-3">
                  {STEPS.map((step, i) => (
                    <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="w-9 h-9 rounded-lg bg-[#EEEDFE] flex items-center justify-center text-[#534AB7] mb-3 group-hover:bg-[#534AB7] group-hover:text-white transition-colors">
                        {step.icon}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1 tracking-tight">{step.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Methodology section */}
            <div className="mt-8 border border-[#E5E7EB] rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Metodología</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Este diagnóstico integra principios de gobierno corporativo moderno basados en los marcos de referencia más reconocidos internacionalmente, adaptados a la realidad de las empresas argentinas.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">Gobierno corporativo</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">Board effectiveness</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">Mejores prácticas PyME</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">Contexto argentino</span>
              </div>
              <p className="text-xs text-gray-300 mt-3">
                Todo el diagnóstico se guarda localmente en tu dispositivo. Sin registro, sin servidor.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
