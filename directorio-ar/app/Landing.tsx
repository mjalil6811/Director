'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { storage } from '../lib/storage';
import { progresoF1 } from '../lib/progreso';
import { FASES, MODULOS_F1 } from '../lib/navegacion';
import {
  STATS, PROCESO, BENEFICIOS, FAQ,
  CTA, CTA_CORTO, TIEMPO_TOTAL, TIEMPO_RESUMEN, PREGUNTAS_RESUMEN, AYUDA_NOMBRE, AVISO_DATOS,
  METODOLOGIA,
} from '../lib/contenido-home';
import { HERRAMIENTAS, TOTAL_HERRAMIENTAS_DISPONIBLES } from '../lib/herramientas';
import { SITIO, mailto } from '../lib/sitio';
import { trackEvent } from '../lib/analitica';
import SiteFooter from '../components/SiteFooter';
import EjemploInforme from '../components/EjemploInforme';
import RespaldoDatos from '../components/RespaldoDatos';

type UbicacionCTA = 'header' | 'hero' | 'medio' | 'cierre' | 'recorrido';

const NAV = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#herramientas', label: 'Herramientas' },
  { href: '#faq', label: 'Preguntas frecuentes' },
  { href: '#contacto', label: 'Contacto' },
];

// Íconos de la sección "Por qué Directorio AR" (los textos están en lib/contenido-home.ts)
const ICONOS = {
  globo: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
    </svg>
  ),
  grafico: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" />
    </svg>
  ),
  pulso: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  reloj: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

// ——— Components ————————————————————————————————————————————————————————————

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls={id} className="w-full flex items-start justify-between py-4 text-left gap-4 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
        <span className="text-sm font-semibold text-gray-900">{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <p id={id} hidden={!open} className="text-sm text-gray-600 leading-relaxed pb-4 -mt-1">{a}</p>
    </div>
  );
}

// ——— Page ———————————————————————————————————————————————————————————————————

export default function Landing() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [completadosFase1, setCompletadosFase1] = useState(0);
  const [siguiente, setSiguiente] = useState(1);
  const [totalF1, setTotalF1] = useState(5);
  const [terminado, setTerminado] = useState(false);
  const [abreviado, setAbreviado] = useState(false);

  useEffect(() => {
    const n = storage.getEmpresaNombre();
    if (n) setNombre(n);
    const p = progresoF1();
    setCompletadosFase1(p.completados);
    setSiguiente(p.siguiente);
    setTotalF1(p.total);
    setTerminado(p.terminado);
    setAbreviado(p.abreviado);
  }, []);

  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    if (!menuAbierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuAbierto(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuAbierto]);

  function handleStart(ubicacion: UbicacionCTA) {
    trackEvent('landing_cta_click', { ubicacion });
    if (nombre.trim()) storage.setEmpresaNombre(nombre.trim());
    const p = progresoF1();
    router.push(p.terminado ? p.destinoFinal : `/modulo/${p.siguiente}`);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ——— Nav ——— */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <a href="#inicio" className="flex items-center gap-2.5 shrink-0 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900 tracking-tight">Directorio AR</span>
          </a>

          <nav aria-label="Secciones" className="hidden lg:flex items-center gap-1">
            {NAV.map(n => (
              <a key={n.href} href={n.href} className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50">{n.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {completadosFase1 > 0 && (
              <Link href="/dashboard" className="hidden xl:block px-2 py-2 text-xs text-gray-600 hover:text-brand font-medium">
                Mi diagnóstico
              </Link>
            )}
            {/* CTA fijo de mobile (el header es sticky). En desktop el CTA aparece solo en hero, medio y cierre. */}
            <button
              onClick={() => handleStart('header')}
              className="sm:hidden px-4 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-lg"
            >
              {completadosFase1 > 0 ? 'Continuar' : CTA_CORTO}
            </button>
            <button
              type="button"
              onClick={() => setMenuAbierto(o => !o)}
              aria-expanded={menuAbierto}
              aria-controls="menu-landing"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                {menuAbierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuAbierto && (
          <nav id="menu-landing" aria-label="Secciones" className="lg:hidden max-w-6xl mx-auto mt-3 pt-3 border-t border-gray-100 grid gap-1">
            {NAV.map(n => (
              <a key={n.href} href={n.href} onClick={() => setMenuAbierto(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{n.label}</a>
            ))}
            {completadosFase1 > 0 && (
              <>
                <Link href="/dashboard" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Mi diagnóstico</Link>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Reiniciar el diagnóstico? Se borran todos los datos de la Fase 1.')) {
                      storage.clearAll();
                      setCompletadosFase1(0);
                      setNombre('');
                      router.push('/modulo/1');
                    }
                  }}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Nuevo diagnóstico
                </button>
              </>
            )}
          </nav>
        )}
      </header>

      {/* ——— Hero ——— */}
      <section id="inicio" className="scroll-mt-20 bg-gradient-to-b from-white via-surface to-white px-4 pt-10 sm:pt-14 pb-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-center">

          {/* Columna izquierda: propuesta + CTA */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand" />
              <span className="text-xs font-medium text-brand">Gratuito · Sin registro · Tus respuestas quedan en tu navegador</span>
            </div>

            <h1 className="text-4xl sm:text-[2.75rem] lg:text-[2.4rem] font-bold text-gray-900 tracking-tight leading-[1.1] mb-5">
              La nueva era de los directorios:{' '}
              <br className="hidden lg:block" />
              <span className="bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                asesores que suman y preparan tu empresa para el futuro
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-7">
              Un <strong className="font-semibold text-gray-700">consejo asesor</strong> que aporta experiencia y mirada estratégica, y acompaña a los dueños en las decisiones importantes.
            </p>

            {/* CTA group */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center lg:justify-start gap-3 mb-3">
              <div className="w-full sm:w-auto">
              <label htmlFor="nombre-empresa" className="sr-only">Nombre de tu empresa (opcional)</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <input
                  id="nombre-empresa"
                  type="text"
                  autoComplete="organization"
                  aria-describedby="nombre-empresa-ayuda"
                  value={nombre}
                  onChange={e => { setNombre(e.target.value); storage.setEmpresaNombre(e.target.value); }}
                  placeholder="Nombre de tu empresa"
                  className="w-full sm:w-60 pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus:border-brand bg-white"
                />
              </div>
              <p id="nombre-empresa-ayuda" className="text-xs text-gray-500 mt-1.5 text-left sm:max-w-60 leading-snug">{AYUDA_NOMBRE}</p>
              </div>
              <button
                onClick={() => handleStart('hero')}
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-brand to-[#6359C7] hover:from-brand-dark hover:to-brand text-white font-semibold rounded-xl shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 transition-all text-sm"
              >
                {terminado ? (abreviado ? 'Ver mi informe' : 'Ver mi resultado') : completadosFase1 > 0 ? `Continuar diagnóstico (${completadosFase1}/${totalF1})` : CTA}
              </button>
            </div>

            {/* Qué pasa al hacer clic */}
            <p className="text-sm text-gray-600 mb-1">
              {terminado
                ? abreviado
                  ? <>Completaste el diagnóstico abreviado. Vas a ver tu <strong className="font-semibold text-gray-900">informe</strong>, y desde ahí podés seguir con el completo.</>
                  : <>Ya completaste el diagnóstico. Vas a ver tu <strong className="font-semibold text-gray-900">resultado final</strong> y el siguiente paso: armar tu consejo asesor.</>
                : completadosFase1 > 0
                ? <>Próximo paso: <strong className="font-semibold text-gray-900">Módulo {siguiente} · {MODULOS_F1[siguiente - 1]?.titulo}</strong> <span className="text-gray-500">(~{MODULOS_F1[siguiente - 1]?.min} min)</span></>
                : <>{TIEMPO_RESUMEN}</>}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xl mx-auto lg:mx-0">{AVISO_DATOS}</p>

            {completadosFase1 > 0 && !terminado && (
              <div className="mt-5 max-w-sm mx-auto lg:mx-0">
                <div className="flex gap-1.5">
                  {MODULOS_F1.slice(0, totalF1).map(m => (
                    <div key={m.n} title={`Módulo ${m.n} · ${m.titulo}`} className={`flex-1 h-1.5 rounded-full ${m.n < siguiente ? 'bg-brand' : m.n === siguiente ? 'bg-brand/35' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5 text-left">{completadosFase1} de {totalF1} módulos completados{abreviado ? ' · diagnóstico abreviado' : ''}</p>
              </div>
            )}
          </div>

          {/* Columna derecha: vista previa del informe (datos ficticios) */}
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            <EjemploInforme compacto />
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
      <section id="como-funciona" className="scroll-mt-20 px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">Cómo funciona</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Tres etapas para decidir mejor y con respaldo
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
            Empezá el diagnóstico: {TIEMPO_TOTAL} en total
          </h2>
          <p className="text-sm text-white/85 mb-6">
            {PREGUNTAS_RESUMEN} cortos para saber si es momento de sumar un consejo asesor. Resultado inmediato.
          </p>
          <button
            onClick={() => handleStart('medio')}
            className="px-8 py-3 bg-white text-brand font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-lg"
          >
            {completadosFase1 > 0 ? 'Continuar donde dejé' : CTA}
          </button>
        </div>
      </section>

      {/* ——— Herramientas ——— */}
      <section id="herramientas" className="scroll-mt-20 px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">Herramientas</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {TOTAL_HERRAMIENTAS_DISPONIBLES} herramientas disponibles, en tres etapas
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-xl mx-auto">Todas gratuitas y dentro de la misma herramienta. Te indicamos cuáles están listas hoy y cuáles vienen después.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {HERRAMIENTAS.map(g => (
              <div key={g.fase} className="bg-white border border-gray-200 rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: g.color }}>Etapa {g.fase} · {g.verbo}</p>
                <ul className="space-y-3">
                  {g.herramientas.map(h => (
                    <li key={h.nombre}>
                      <div className="flex items-start justify-between gap-2">
                        {h.href && h.disponible ? (
                          <Link href={h.href} className="text-sm font-semibold text-gray-900 hover:text-brand hover:underline underline-offset-2">{h.nombre}</Link>
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">{h.nombre}</span>
                        )}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${h.disponible ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                          {h.disponible ? 'Disponible' : 'Próximamente'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{h.descripcion}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Metodología ——— */}
      <section id="metodologia" className="scroll-mt-20 px-4 py-16 bg-surface border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">Metodología</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Cómo se calcula tu resultado</h2>
            <p className="text-sm text-gray-600 mt-2">Tocá cada punto para ver el detalle.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            {METODOLOGIA.map(m => <FAQItem key={m.titulo} q={m.titulo} a={m.texto} />)}
          </div>
        </div>
      </section>

      {/* ——— Beneficios ——— */}
      <section className="px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">Por qué Directorio AR</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Una herramienta pensada para tu empresa
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BENEFICIOS.map(b => (
              <div key={b.titulo} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand shrink-0" aria-hidden>
                  {ICONOS[b.icono]}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">{b.titulo}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{b.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Quick access (returning users) ——— */}
      {completadosFase1 > 0 && (
        <section className="px-4 py-10 border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Tu progreso</p>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">Fase 1 — Diagnóstico</span>
                <span className="text-sm font-bold text-brand">{completadosFase1}/{totalF1}</span>
              </div>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: totalF1 }, (_, k) => k + 1).map(i => (
                  <div key={i} className={`flex-1 h-2 rounded-full ${i <= completadosFase1 ? 'bg-brand' : 'bg-gray-100'}`} />
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => handleStart('hero')} className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-xl">
                  {terminado ? (abreviado ? 'Ver informe' : 'Ver resultado') : 'Continuar'}
                </button>
                <button onClick={() => router.push('/dashboard')} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50">
                  Índice de preparación
                </button>
                <button onClick={() => router.push(FASES[1].href)} className="px-4 py-2 border border-[#B5E8D5] text-[#0F6E56] text-sm font-medium rounded-xl hover:bg-[#E1F5EE]">
                  Fase 2
                </button>
                <button onClick={() => router.push(FASES[2].href)} className="px-4 py-2 border border-[#F0D9A8] text-[#854F0B] text-sm font-medium rounded-xl hover:bg-[#FAEEDA]">
                  Fase 3
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-2">
                  Respaldo de tu progreso: descargalo para no perderlo si borrás el navegador o cambiás de dispositivo.
                  {terminado && !abreviado && <> El informe en PDF está en el <Link href="/resultado" className="text-brand font-semibold hover:underline">resultado final</Link>.</>}
                </p>
                <RespaldoDatos />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ——— FAQ ——— */}
      <section id="faq" className="scroll-mt-20 px-4 py-16">
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
            Tu empresa merece decisiones con respaldo
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-lg mx-auto">
            No importa si ya tenés asesores o si recién lo estás pensando. Empezá por el diagnóstico y dejá que la herramienta te guíe.
          </p>
          <button
            onClick={() => handleStart('cierre')}
            className="px-10 py-4 bg-gradient-to-r from-brand to-[#6359C7] hover:from-brand-dark hover:to-brand text-white font-semibold rounded-xl shadow-lg shadow-brand/20 text-sm transition-all"
          >
            {completadosFase1 > 0 ? 'Continuar donde dejé' : CTA}
          </button>
          <p className="text-xs text-gray-500 mt-3">Sin registro. Sin tarjeta. Tus respuestas quedan en tu navegador.</p>
        </div>
      </section>

      {/* ——— Contacto ——— */}
      <section id="contacto" className="scroll-mt-20 px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">Contacto</p>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">¿Tenés dudas o querés comentarnos tu caso?</h2>
          <p className="text-sm text-gray-600 mb-5">Escribinos y te respondemos.</p>
          {mailto() ? (
            <a href={mailto('Consulta sobre Directorio AR')!} className="inline-block px-6 py-3 rounded-xl text-sm font-semibold border border-gray-300 text-gray-800 hover:bg-gray-50">
              {SITIO.email}
            </a>
          ) : (
            // TODO(matias): completar SITIO.email en lib/sitio.ts (activa el enlace mailto:)
            <span className="inline-block px-6 py-3 rounded-xl text-sm font-semibold text-amber-900 bg-amber-50 border border-dashed border-amber-300">
              contacto@… (mail pendiente)
            </span>
          )}
          {completadosFase1 === 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-600 mb-2">¿Hiciste el diagnóstico en otro navegador y tenés el respaldo?</p>
              <RespaldoDatos modo="importar" className="flex flex-col items-center" />
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
