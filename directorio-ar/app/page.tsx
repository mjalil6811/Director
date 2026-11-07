'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '../lib/storage';
import { progresoF1 } from '../lib/progreso';
import { FASES, MODULOS_F1 } from '../lib/navegacion';

// ——— Data ———————————————————————————————————————————————————————————————————

const STATS = [
  { valor: '~8 min', label: 'Dura el diagnóstico' },
  { valor: '34', label: 'Preguntas en 5 módulos' },
  { valor: '12', label: 'Herramientas integradas' },
  { valor: '100%', label: 'Gratuito y privado' },
];

const PROCESO = [
  {
    paso: 'Diagnosticá',
    titulo: 'Evaluá si tu empresa necesita un directorio',
    descripcion: 'Respondé 5 módulos que analizan la necesidad real, cómo se toman las decisiones, qué perfiles faltan, la disposición al cambio y la relación con la gerencia.',
    color: '#534AB7',
    colorBg: '#EEEDFE',
    items: ['Governance Score 0-100', 'Radar de 5 dimensiones', 'Benchmark vs. mercado', 'Diagnóstico personalizado'],
  },
  {
    paso: 'Constituí',
    titulo: 'Armá tu directorio con las herramientas correctas',
    descripcion: 'Redactá el acta constitutiva, definí el protocolo de familia o socios resolviendo escenarios reales, y planificá las primeras reuniones con agenda profesional.',
    color: '#0F6E56',
    colorBg: '#E1F5EE',
    items: ['Acta constitutiva guiada', 'Protocolo por escenarios', 'Reuniones con modo en vivo', 'Timer y acta automática'],
  },
  {
    paso: 'Operá',
    titulo: 'Hacé funcionar tu directorio en el día a día',
    descripcion: 'Dashboard financiero para preparar cada reunión, seguimiento de compromisos entre sesiones y evaluación anual del CEO con informe confidencial.',
    color: '#854F0B',
    colorBg: '#FAEEDA',
    items: ['Dashboard financiero + KPIs', 'Seguimiento de tareas', 'Evaluación del CEO', 'Informes para el board'],
  },
];

const BENEFICIOS = [
  {
    titulo: 'Diseñado para Argentina',
    descripcion: 'Tipos societarios (SRL, SA, SAS), CUIT, marco legal argentino, y la realidad de las PyMEs familiares.',
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    titulo: 'Sin registro ni servidor',
    descripcion: 'Todo se guarda en tu dispositivo. No necesitás crear una cuenta ni compartir datos con nadie.',
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    titulo: 'De diagnóstico a acción',
    descripcion: 'No te dice solo qué necesitás — te da las herramientas para hacerlo: actas, protocolos, reuniones, evaluaciones.',
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    titulo: 'Basado en mejores prácticas',
    descripcion: 'Metodología basada en IFC, OCDE, IAE e IDEA, adaptada para empresas medianas y familiares.',
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
];

const FAQ = [
  { q: '¿Para qué tipo de empresa es esto?', a: 'Para PyMEs, empresas familiares y empresas medianas argentinas que quieren profesionalizar su gobierno corporativo. No necesitás tener un directorio armado — la herramienta empieza por evaluar si lo necesitás.' },
  { q: '¿Es gratis?', a: 'Sí, 100% gratuito. No hay planes pagos, ni límites de uso, ni funcionalidades bloqueadas.' },
  { q: '¿Mis datos son privados?', a: 'Todo se guarda en el localStorage de tu navegador. No hay servidor, no hay base de datos, no hay registro. Tus datos no salen de tu dispositivo.' },
  { q: '¿Necesito completar todo en una sesión?', a: 'No. Cada módulo guarda tu progreso automáticamente. Podés volver cuando quieras y retomar donde dejaste.' },
  { q: '¿Qué es el Governance Score?', a: 'Es un índice de madurez de gobierno corporativo de 0 a 100 que integra 5 dimensiones: necesidad, decisiones, perfiles, disposición y dinámica. Sirve como referencia ante inversores, fondos y socios estratégicos.' },
];

// Lo que el usuario va a hacer, visible sin scroll
const RECORRIDO = [
  {
    fase: 1, verbo: FASES[0].verbo, color: FASES[0].color, bg: FASES[0].bg, href: FASES[0].href,
    que: 'Respondés 34 preguntas en 5 módulos cortos',
    obtenes: 'Governance Score, nivel de urgencia y perfiles de directores que te faltan',
    tiempo: '~8 min',
  },
  {
    fase: 2, verbo: FASES[1].verbo, color: FASES[1].color, bg: FASES[1].bg, href: FASES[1].href,
    que: 'Completás el acta, el protocolo de socios y la agenda de reuniones',
    obtenes: 'Documentos listos para revisar con tu abogado',
    tiempo: 'Cuando quieras',
  },
  {
    fase: 3, verbo: FASES[2].verbo, color: FASES[2].color, bg: FASES[2].bg, href: FASES[2].href,
    que: 'Cargás tus números y seguís los compromisos del directorio',
    obtenes: 'Dashboard financiero, seguimiento de tareas y evaluación del CEO',
    tiempo: 'Mes a mes',
  },
];

// ——— Components ————————————————————————————————————————————————————————————

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-start justify-between py-4 text-left gap-4">
        <span className="text-sm font-semibold text-gray-900">{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <p className="text-sm text-gray-500 leading-relaxed pb-4 -mt-1">{a}</p>}
    </div>
  );
}

// ——— Page ———————————————————————————————————————————————————————————————————

export default function HomePage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [completadosFase1, setCompletadosFase1] = useState(0);
  const [siguiente, setSiguiente] = useState(1);

  useEffect(() => {
    const n = storage.getEmpresaNombre();
    if (n) setNombre(n);
    const p = progresoF1();
    setCompletadosFase1(p.completados);
    setSiguiente(p.siguiente);
  }, []);

  function handleStart() {
    if (nombre.trim()) storage.setEmpresaNombre(nombre.trim());
    const p = progresoF1();
    router.push(p.terminado ? '/resultado' : `/modulo/${p.siguiente}`);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ——— Nav ——— */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900 tracking-tight">Directorio AR</span>
          </div>
          <div className="flex items-center gap-3">
            {completadosFase1 > 0 && (
              <>
                <button onClick={() => router.push('/dashboard')} className="text-xs text-gray-500 hover:text-brand font-medium hidden sm:block">
                  Mi diagnóstico
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Reiniciar el diagnóstico? Se borran todos los datos de la Fase 1.')) {
                      storage.clearAll();
                      setCompletadosFase1(0);
                      setNombre('');
                      router.push('/modulo/1');
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium hidden sm:block"
                >
                  Nuevo diagnóstico
                </button>
              </>
            )}
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {completadosFase1 > 0 ? 'Continuar' : 'Empezar gratis'}
            </button>
          </div>
        </div>
      </header>

      {/* ——— Hero ——— */}
      <section className="bg-gradient-to-b from-white via-surface to-white px-4 pt-10 sm:pt-14 pb-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">

          {/* Columna izquierda: propuesta + CTA */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand" />
              <span className="text-xs font-medium text-brand">Gratuito · Sin registro · 100% privado</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.08] mb-5">
              Profesionalizá el{' '}
              <span className="bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                gobierno corporativo
              </span>{' '}
              de tu empresa
            </h1>

            <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-7">
              En 8 minutos sabés si tu empresa necesita un directorio, qué perfiles sumar y por dónde empezar. Después, te acompañamos a armarlo y operarlo.
            </p>

            {/* CTA group */}
            <div className="flex flex-col sm:flex-row items-center lg:items-stretch justify-center lg:justify-start gap-3 mb-3">
              <div className="relative w-full sm:w-auto">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => { setNombre(e.target.value); storage.setEmpresaNombre(e.target.value); }}
                  placeholder="Nombre de tu empresa"
                  className="w-full sm:w-60 pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
                />
              </div>
              <button
                onClick={handleStart}
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-brand to-[#6359C7] hover:from-brand-dark hover:to-brand text-white font-semibold rounded-xl shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 transition-all text-sm"
              >
                {completadosFase1 === 5 ? 'Ver mi resultado' : completadosFase1 > 0 ? `Continuar diagnóstico (${completadosFase1}/5)` : 'Comenzar diagnóstico gratuito'}
              </button>
            </div>

            {/* Qué pasa al hacer clic */}
            <p className="text-sm text-gray-600 mb-1">
              {completadosFase1 === 5
                ? <>Ya completaste el diagnóstico. Vas a ver tu <strong className="font-semibold text-gray-900">resultado final</strong> y el siguiente paso: constituir el directorio.</>
                : completadosFase1 > 0
                ? <>Próximo paso: <strong className="font-semibold text-gray-900">Módulo {siguiente} · {MODULOS_F1[siguiente - 1]?.titulo}</strong> <span className="text-gray-400">(~{MODULOS_F1[siguiente - 1]?.min} min)</span></>
                : <>Empezás por el <strong className="font-semibold text-gray-900">Módulo 1 · ¿Necesitás un directorio?</strong> <span className="text-gray-400">(10 preguntas, ~3 min)</span></>}
            </p>
            <p className="text-xs text-gray-400">Se guarda solo en tu dispositivo. Podés pausar y retomar cuando quieras.</p>

            {completadosFase1 > 0 && completadosFase1 < 5 && (
              <div className="mt-5 max-w-sm mx-auto lg:mx-0">
                <div className="flex gap-1.5">
                  {MODULOS_F1.map(m => (
                    <div key={m.n} title={`Módulo ${m.n} · ${m.titulo}`} className={`flex-1 h-1.5 rounded-full ${m.n < siguiente ? 'bg-brand' : m.n === siguiente ? 'bg-brand/35' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5 text-left">{completadosFase1} de 5 módulos completados</p>
              </div>
            )}
          </div>

          {/* Columna derecha: qué vas a hacer */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/60 p-5 sm:p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-900">Qué vas a hacer</p>
              <span className="text-[11px] text-gray-400">3 etapas</span>
            </div>
            <ol className="space-y-3">
              {RECORRIDO.map(r => {
                const done = r.fase === 1 && completadosFase1 === 5;
                const enCurso = r.fase === 1 && completadosFase1 > 0 && completadosFase1 < 5;
                return (
                  <li key={r.fase}>
                    <button
                      onClick={() => (r.fase === 1 ? handleStart() : router.push(r.href))}
                      className="w-full flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50/60 transition-colors text-left group"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: r.color }}>
                        {done ? '✓' : r.fase}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-sm font-bold" style={{ color: r.color }}>{r.verbo}</span>
                          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md" style={{ color: r.color, backgroundColor: r.bg }}>{r.tiempo}</span>
                          {enCurso && <span className="text-[11px] font-semibold text-gray-500">· {completadosFase1}/5 hecho</span>}
                          {r.fase === 1 && completadosFase1 === 0 && <span className="text-[11px] font-semibold text-gray-500">· Empezás acá</span>}
                        </div>
                        <p className="text-[13px] text-gray-700 leading-snug">{r.que}</p>
                        <p className="text-xs text-gray-400 leading-snug mt-1">
                          <span className="font-semibold text-gray-500">Obtenés:</span> {r.obtenes}
                        </p>
                      </div>
                      <svg className="self-center shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ——— Stats ——— */}
      <section className="border-y border-gray-100 bg-surface px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-gray-900">{s.valor}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ——— Proceso: Diagnosticá / Constituí / Operá ——— */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">Cómo funciona</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Tres etapas para un gobierno corporativo sólido
            </h2>
          </div>

          <div className="space-y-8">
            {PROCESO.map((etapa, idx) => (
              <div key={etapa.paso} className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10">
                {/* Left: number + line */}
                <div className="flex lg:flex-col items-center gap-3 lg:gap-0 shrink-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
                    style={{ backgroundColor: etapa.color }}
                  >
                    {idx + 1}
                  </div>
                  {idx < PROCESO.length - 1 && (
                    <div className="hidden lg:block w-0.5 h-16 bg-gray-200 mx-auto mt-2" />
                  )}
                </div>

                {/* Right: content */}
                <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: etapa.color }}>{etapa.paso}</p>
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-2">{etapa.titulo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{etapa.descripcion}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {etapa.items.map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: etapa.colorBg }}>
                          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke={etapa.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Mid CTA ——— */}
      <section className="px-4 py-12 bg-gradient-to-r from-brand to-brand-light">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3">
            Empezá el diagnóstico en 8 minutos
          </h2>
          <p className="text-sm text-white/70 mb-6">
            34 preguntas en 5 módulos cortos para saber si tu empresa necesita un directorio. Resultado inmediato.
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-white text-brand font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-lg"
          >
            {completadosFase1 > 0 ? 'Continuar donde dejé' : 'Comenzar ahora'}
          </button>
        </div>
      </section>

      {/* ——— Beneficios ——— */}
      <section className="px-4 py-16 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">Por qué Directorio AR</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Hecho para la realidad de las empresas argentinas
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFICIOS.map(b => (
              <div key={b.titulo} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand mb-3">
                  {b.icono}
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{b.titulo}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{b.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Quick access (returning users) ——— */}
      {completadosFase1 > 0 && (
        <section className="px-4 py-10 border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">Tu progreso</p>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">Fase 1 — Diagnóstico</span>
                <span className="text-sm font-bold text-brand">{completadosFase1}/5</span>
              </div>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`flex-1 h-2 rounded-full ${i <= completadosFase1 ? 'bg-brand' : 'bg-gray-100'}`} />
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleStart} className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-xl">
                  {completadosFase1 === 5 ? 'Ver resultado' : 'Continuar'}
                </button>
                <button onClick={() => router.push('/dashboard')} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50">
                  Governance Score
                </button>
                <button onClick={() => router.push(FASES[1].href)} className="px-4 py-2 border border-[#B5E8D5] text-[#0F6E56] text-sm font-medium rounded-xl hover:bg-[#E1F5EE]">
                  Fase 2
                </button>
                <button onClick={() => router.push(FASES[2].href)} className="px-4 py-2 border border-[#F0D9A8] text-[#854F0B] text-sm font-medium rounded-xl hover:bg-[#FAEEDA]">
                  Fase 3
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ——— FAQ ——— */}
      <section className="px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Preguntas frecuentes</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            {FAQ.map(item => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ——— Final CTA ——— */}
      <section className="px-4 py-16 bg-surface border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
            Tu empresa merece un gobierno corporativo profesional
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-lg mx-auto">
            No importa si ya tenés un directorio o si estás pensando en armar uno. Empezá por el diagnóstico y dejá que la herramienta te guíe.
          </p>
          <button
            onClick={handleStart}
            className="px-10 py-4 bg-gradient-to-r from-brand to-[#6359C7] hover:from-brand-dark hover:to-brand text-white font-semibold rounded-xl shadow-lg shadow-brand/20 text-sm transition-all"
          >
            Comenzar diagnóstico gratuito
          </button>
          <p className="text-xs text-gray-400 mt-3">Sin registro. Sin tarjeta. 100% privado.</p>
        </div>
      </section>

      {/* ——— Footer ——— */}
      <footer className="bg-white border-t border-gray-100 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand to-brand-light flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-900">Directorio AR</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <span>Gobierno corporativo</span>
              <span>Empresas argentinas</span>
              <span>100% gratuito</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
