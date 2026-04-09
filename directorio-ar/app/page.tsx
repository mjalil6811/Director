'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '../lib/storage/storage';

const FASES = [
  {
    numero: 1,
    titulo: 'Diagnóstico',
    subtitulo: 'Evaluá si tu empresa necesita un directorio',
    descripcion: '5 módulos que analizan la necesidad, las decisiones, los perfiles ideales, la disposición al cambio y la dinámica con la gerencia.',
    color: '#534AB7',
    colorBg: '#EEEDFE',
    colorBorder: '#DDD9FE',
    href: '/fase1',
    modulos: ['Necesidad de directorio', 'Mapa de decisiones', 'Perfiles del directorio', 'Dinámica y funcionamiento', 'Directorio y gerencia'],
    estado: 'activa' as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    numero: 2,
    titulo: 'Constitución',
    subtitulo: 'Armá tu directorio paso a paso',
    descripcion: 'Herramientas para redactar el acta constitutiva, armar el protocolo de familia/socios y planificar las primeras reuniones.',
    color: '#0F6E56',
    colorBg: '#E1F5EE',
    colorBorder: '#B5E8D5',
    href: '/fase2',
    modulos: ['Acta constitutiva', 'Protocolo de familia/socios', 'Reuniones del directorio'],
    estado: 'activa' as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    numero: 3,
    titulo: 'Operación',
    subtitulo: 'Hacé funcionar tu directorio',
    descripcion: 'Gestión de reuniones, seguimiento de decisiones, evaluación del board y métricas de efectividad del directorio.',
    color: '#854F0B',
    colorBg: '#FAEEDA',
    colorBorder: '#F0D9A8',
    href: '/fase3',
    modulos: ['Próximamente'],
    estado: 'proximamente' as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    numero: 4,
    titulo: 'Fase 4',
    subtitulo: 'En desarrollo',
    descripcion: 'Estamos trabajando en esta fase. Pronto vas a poder acceder a nuevas herramientas para potenciar tu gobierno corporativo.',
    color: '#6B7280',
    colorBg: '#F3F4F6',
    colorBorder: '#E5E7EB',
    href: '/fase4',
    modulos: ['Próximamente'],
    estado: 'proximamente' as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [completadosFase1, setCompletadosFase1] = useState(0);

  useEffect(() => {
    const n = storage.getEmpresaNombre();
    if (n) setNombre(n);
    const count = [
      !!storage.getModulo1Resultado(),
      !!storage.getModulo2Resultado(),
      !!storage.getModulo3Resultado(),
      !!(storage.getModulo4Diagnostico() || storage.getModulo4Frecuencia()),
      !!storage.getModulo5Resultado(),
    ].filter(Boolean).length;
    setCompletadosFase1(count);
  }, []);

  function handleNombreChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNombre(e.target.value);
    storage.setEmpresaNombre(e.target.value);
  }

  function handleFaseClick(fase: typeof FASES[number]) {
    if (fase.estado === 'proximamente') return;
    if (nombre.trim()) storage.setEmpresaNombre(nombre.trim());

    if (fase.numero === 1) {
      if (completadosFase1 === 5) {
        router.push('/resultado');
      } else {
        const next = [
          !!storage.getModulo1Resultado(),
          !!storage.getModulo2Resultado(),
          !!storage.getModulo3Resultado(),
          !!(storage.getModulo4Diagnostico() || storage.getModulo4Frecuencia()),
          !!storage.getModulo5Resultado(),
        ].findIndex(c => !c) + 1;
        router.push(`/modulo/${next || 1}`);
      }
    } else if (fase.numero === 2) {
      router.push('/fase2/acta-constitutiva');
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* Top gradient */}
      <div className="h-1 w-full bg-gradient-to-r from-[#534AB7] via-[#0F6E56] to-[#854F0B]" />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-4 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="17" />
              <line x1="9" y1="14.5" x2="15" y2="14.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 tracking-tight leading-none">Directorio AR</p>
            <p className="text-xs text-gray-400 mt-0.5">Gobierno corporativo para empresas argentinas</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 space-y-8">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEEDFE] border border-[#DDD9FE] mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#534AB7]" />
            <span className="text-xs font-medium text-[#534AB7]">Plataforma de gobierno corporativo</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
            Profesionalizá el gobierno{' '}
            <span className="bg-gradient-to-r from-[#534AB7] to-[#0F6E56] bg-clip-text text-transparent">
              de tu empresa
            </span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Desde el diagnóstico inicial hasta la operación del directorio.
            4 fases para construir un gobierno corporativo sólido, paso a paso.
          </p>
        </div>

        {/* Empresa input */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm max-w-md mx-auto">
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
              className="w-full pl-10 pr-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] bg-[#FAFBFC]"
            />
          </div>
        </div>

        {/* 4 Fases */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Las 4 fases</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {FASES.map(fase => {
              const isActive = fase.estado === 'activa';
              const isFase1 = fase.numero === 1;

              return (
                <button
                  key={fase.numero}
                  onClick={() => handleFaseClick(fase)}
                  disabled={!isActive}
                  className={`
                    text-left rounded-2xl border-2 p-5 transition-all group relative overflow-hidden
                    ${isActive
                      ? 'bg-white shadow-sm hover:shadow-lg cursor-pointer'
                      : 'bg-gray-50 cursor-not-allowed opacity-70'
                    }
                  `}
                  style={{
                    borderColor: isActive ? fase.colorBorder : '#E5E7EB',
                  }}
                >
                  {/* Fase number badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                      style={{ backgroundColor: fase.colorBg, color: fase.color }}
                    >
                      {fase.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      {isFase1 && completadosFase1 > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: fase.colorBg, color: fase.color }}>
                          {completadosFase1}/5
                        </span>
                      )}
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: isActive ? fase.colorBg : '#F3F4F6',
                          color: isActive ? fase.color : '#9CA3AF',
                        }}
                      >
                        Fase {fase.numero}
                      </span>
                    </div>
                  </div>

                  {/* Title & subtitle */}
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">
                    {fase.titulo}
                  </h3>
                  <p className="text-xs font-medium mb-2" style={{ color: isActive ? fase.color : '#9CA3AF' }}>
                    {fase.subtitulo}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    {fase.descripcion}
                  </p>

                  {/* Module pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {fase.modulos.map(mod => (
                      <span
                        key={mod}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isActive ? fase.colorBg : '#F3F4F6',
                          color: isActive ? fase.color : '#9CA3AF',
                        }}
                      >
                        {mod}
                      </span>
                    ))}
                  </div>

                  {/* Arrow for active */}
                  {isActive && (
                    <div
                      className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: fase.color }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}

                  {/* Coming soon overlay */}
                  {!isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                      <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold border border-gray-200">
                        Próximamente
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick access if has data */}
        {completadosFase1 > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Acceso rápido</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Governance Score
              </button>
              {completadosFase1 >= 4 && (
                <button
                  onClick={() => router.push('/resultado')}
                  className="px-4 py-2 border border-[#E5E7EB] text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Resultado final
                </button>
              )}
              <button
                onClick={() => router.push('/fase2/acta-constitutiva')}
                className="px-4 py-2 border border-[#B5E8D5] text-[#0F6E56] text-sm font-medium rounded-xl hover:bg-[#E1F5EE] transition-colors"
              >
                Acta constitutiva
              </button>
              <button
                onClick={() => router.push('/fase2/reunion')}
                className="px-4 py-2 border border-[#B5E8D5] text-[#0F6E56] text-sm font-medium rounded-xl hover:bg-[#E1F5EE] transition-colors"
              >
                Reuniones
              </button>
            </div>
          </div>
        )}

        {/* Methodology */}
        <div className="border border-[#E5E7EB] rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Metodología</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            Directorio AR integra principios de gobierno corporativo moderno basados en los marcos de referencia más reconocidos internacionalmente, adaptados a la realidad de las empresas argentinas.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Gobierno corporativo', 'Board effectiveness', 'Mejores prácticas PyME', 'Contexto argentino'].map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">{tag}</span>
            ))}
          </div>
          <p className="text-xs text-gray-300 mt-3">
            Todo se guarda localmente en tu dispositivo. Sin registro, sin servidor.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-400 tracking-wide">Directorio AR</span>
          </div>
          <p className="text-xs text-gray-300">Gobierno Corporativo</p>
        </div>
      </main>
    </div>
  );
}
