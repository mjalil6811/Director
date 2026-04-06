'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '../lib/storage';

const MODULOS = [
  { n: 1, label: '¿Necesitás un directorio?', desc: '12 preguntas · 6 dimensiones' },
  { n: 2, label: 'Clasificador de roles', desc: '10 situaciones concretas' },
  { n: 3, label: '¿Qué perfiles necesitás?', desc: '15 preguntas · 10 perfiles' },
  { n: 4, label: 'Dinámica de reuniones', desc: 'Agenda, decisiones y actas' },
  { n: 5, label: 'Directorio y gerencia', desc: '7 tensiones · diagnóstico' },
];

export default function HomePage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [completados, setCompletados] = useState<boolean[]>([false, false, false, false, false]);

  useEffect(() => {
    const empresaNombre = storage.getEmpresaNombre();
    if (empresaNombre) setNombre(empresaNombre);

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
    // Find the first incomplete module
    const nextIdx = completados.findIndex(c => !c);
    if (nextIdx === -1) {
      router.push('/dashboard');
    } else {
      router.push(`/modulo/${nextIdx + 1}`);
    }
  }

  function handleReiniciar() {
    storage.clearAll();
    setCompletados([false, false, false, false, false]);
    setNombre('');
  }

  function handleModuloClick(n: number) {
    if (nombre.trim()) storage.setEmpresaNombre(nombre.trim());
    // n=1 always accessible; n>1 requires previous completed
    const prevCompleted = n === 1 || completados[n - 2];
    if (!prevCompleted) return;
    router.push(`/modulo/${n}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#534AB7] flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="17" />
              <line x1="9" y1="14.5" x2="15" y2="14.5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">Directorio AR</span>
          <span className="ml-2 text-xs text-gray-400 hidden sm:block">Herramienta de gobierno corporativo para empresas argentinas</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start">

          {/* Left/center — main card */}
          <div className="w-full lg:flex-1 flex flex-col items-center justify-center lg:pt-8">
            <div className="w-full max-w-md">
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Diagnóstico de Gobierno Corporativo</h1>
              <p className="text-sm text-gray-500 mb-8 text-center">
                5 módulos para diagnosticar la necesidad, composición y dinámica de un directorio adaptado al contexto argentino.
              </p>

              <div className="border border-gray-200 rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre de la empresa <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={handleNombreChange}
                    placeholder="Ej: Empresa SRL"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
                  />
                </div>

                {hasData ? (
                  <div className="space-y-3">
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-purple-700 font-medium">
                          {completedCount} de 5 módulos completados
                        </p>
                        {completedCount === 5 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Completo</span>
                        )}
                      </div>
                      {/* mini progress */}
                      <div className="flex gap-1.5">
                        {completados.map((done, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-1.5 rounded-full ${done ? 'bg-[#534AB7]' : 'bg-purple-200'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleContinuar}
                      className="w-full py-3 px-4 bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold rounded-xl transition-colors text-sm"
                    >
                      {completedCount === 5 ? 'Ver resultados' : 'Continuar diagnóstico'}
                    </button>

                    {completedCount < 5 && (
                      <button
                        onClick={handleComenzar}
                        className="w-full py-2.5 px-4 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                      >
                        Ir al módulo 1
                      </button>
                    )}

                    <button
                      onClick={handleReiniciar}
                      className="w-full py-2 px-4 text-red-500 font-medium text-sm hover:text-red-700 transition-colors"
                    >
                      Reiniciar diagnóstico
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleComenzar}
                    className="w-full py-3 px-4 bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Comenzar diagnóstico
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right — modules sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Módulos</h2>
            <div className="flex flex-col gap-2">
              {MODULOS.map(({ n, label, desc }) => {
                const done = completados[n - 1];
                const accessible = n === 1 || completados[n - 2];
                const locked = !accessible;

                return (
                  <button
                    key={n}
                    onClick={() => handleModuloClick(n)}
                    disabled={locked}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3.5 border rounded-xl text-left transition-colors
                      ${locked
                        ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                        : done
                          ? 'border-[#534AB7]/20 bg-purple-50 hover:bg-purple-100 cursor-pointer'
                          : 'border-gray-200 bg-white hover:bg-gray-50 cursor-pointer'
                      }
                    `}
                  >
                    {/* Status icon */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                      ${done ? 'bg-[#534AB7] text-white' : locked ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-500'}
                    `}>
                      {done ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : locked ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      ) : (
                        n
                      )}
                    </div>

                    {/* Text */}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium leading-tight ${locked ? 'text-gray-400' : done ? 'text-[#534AB7]' : 'text-gray-800'}`}>
                        {label}
                      </p>
                      <p className={`text-xs mt-0.5 ${locked ? 'text-gray-300' : 'text-gray-400'}`}>{desc}</p>
                    </div>

                    {/* Arrow for accessible */}
                    {!locked && !done && (
                      <svg className="ml-auto shrink-0 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                    {done && (
                      <span className="ml-auto text-xs text-[#534AB7] font-medium shrink-0">Completado</span>
                    )}
                    {locked && (
                      <span className="ml-auto text-xs text-gray-300 shrink-0">Bloqueado</span>
                    )}
                  </button>
                );
              })}
            </div>

            {completedCount === 5 && (
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 w-full py-3 px-4 bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Ver diagnóstico completo
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
