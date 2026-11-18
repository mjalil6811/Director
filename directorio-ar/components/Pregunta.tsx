'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { progresoGlobal } from '../lib/conteo-diagnostico';
import { storage } from '../lib/storage';

// Tarjeta de pregunta compartida por los módulos de diagnóstico (M1, M2, M3, M5).
// - Opciones en una columna (2 columnas solo si son cortas), tarjetas de al menos 48 px.
// - radiogroup accesible: flechas para moverse, 1–9 para elegir, Enter para seguir.
// - Progreso global ("Pregunta X de N · ~Y min restantes") y del módulo.

interface PreguntaProps {
  /** Módulo al que pertenece (para el progreso global). */
  modulo: 1 | 2 | 3 | 5;
  numero: number;          // 1-based, dentro del módulo
  total: number;
  respondidas: number;
  /** Tema o eyebrow (ej. "¿Quién decide esto hoy?" o la dimensión). */
  tema?: string;
  texto: string;
  aclaracion?: string;
  /** Texto de cada opción. "Título — detalle" se muestra en dos líneas. */
  opciones: string[];
  seleccionada: number;
  onSelect: (idx: number) => void;
  onPrev?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  /** Bloque opcional arriba de la tarjeta (intro corta, aviso de perfil). */
  arriba?: React.ReactNode;
  /** Contenido opcional dentro de la tarjeta, entre la pregunta y las opciones (p. ej. una lista precargada). */
  contenido?: React.ReactNode;
}

/** 2 columnas (tablet y desktop) si hay 4 o más opciones y todas entran: título ≤ 32 y detalle ≤ 24 caracteres. */
function usarDosColumnas(opciones: string[]): boolean {
  return opciones.length >= 4 && opciones.every(o => {
    const [titulo, detalle = ''] = o.split(' — ');
    return titulo.length <= 32 && detalle.length <= 24;
  });
}

function esCampoDeTexto(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

export default function Pregunta({
  modulo, numero, total, respondidas, tema, texto, aclaracion, opciones, seleccionada,
  onSelect, onPrev, onNext, nextLabel, nextDisabled, arriba, contenido,
}: PreguntaProps) {
  const id = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const opcionesRef = useRef<(HTMLButtonElement | null)[]>([]);
  const montado = useRef(false);
  const [abreviado, setAbreviado] = useState(false);

  useEffect(() => {
    setAbreviado(storage.getModulo1Resultado()?.perfil?.recorrido === 'abreviado');
  }, []);

  // Al cambiar de pregunta: llevar la tarjeta a la vista y mover el foco al enunciado (lectores de pantalla).
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 120 || top > window.innerHeight * 0.4) {
      window.scrollTo({ top: window.scrollY + top - 140, behavior: 'smooth' });
    }
    if (montado.current) tituloRef.current?.focus({ preventScroll: true });
    montado.current = true;
  }, [numero]);

  // Teclado: 1–9 eligen, Enter avanza (si la pregunta ya tiene respuesta).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey || esCampoDeTexto(e.target)) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= opciones.length) {
        e.preventDefault();
        onSelect(n - 1);
        opcionesRef.current[n - 1]?.focus({ preventScroll: true });
        return;
      }
      if (e.key === 'Enter') {
        const t = e.target as HTMLElement | null;
        const enRadio = t?.getAttribute('role') === 'radio';
        // Enter sobre otro botón o enlace: que haga lo suyo.
        if (!enRadio && t && (t.tagName === 'BUTTON' || t.tagName === 'A')) return;
        if (nextDisabled) return;
        e.preventDefault();
        onNext();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [opciones.length, onSelect, onNext, nextDisabled]);

  function onKeyOpcion(e: React.KeyboardEvent, idx: number) {
    const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (idx + delta + opciones.length) % opciones.length;
    onSelect(next);
    opcionesRef.current[next]?.focus();
  }

  const dosColumnas = usarDosColumnas(opciones);
  const pctModulo = Math.round((respondidas / total) * 100);
  const global = progresoGlobal(modulo, numero, abreviado);
  const pctGlobal = Math.round(((global.actual - 1) / global.total) * 100);
  const foco = seleccionada >= 0 ? seleccionada : 0;

  return (
    <div className="space-y-3">
      {arriba}

      {/* Progreso global */}
      <div className="px-1" aria-live="polite">
        <div className="flex items-center justify-between gap-3 text-xs text-gray-600 mb-1.5">
          <span className="font-semibold text-gray-800 tabular-nums">Pregunta {global.actual} de {global.total}</span>
          <span className="tabular-nums">~{global.minRestantes} min restantes</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-label="Avance del diagnóstico" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pctGlobal}>
          <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${pctGlobal}%` }} />
        </div>
      </div>

      <div ref={cardRef} className="border border-gray-200 rounded-card bg-white shadow-sm overflow-hidden">
        {/* Avance del módulo */}
        <div className="h-1 bg-gray-100" aria-hidden>
          <div className="h-full bg-brand-light transition-all duration-300" style={{ width: `${pctModulo}%` }} />
        </div>
        <div className="px-5 sm:px-6 pt-4 pb-3">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            Módulo {modulo} · {numero} de {total}{tema ? ` · ${tema}` : ''}
          </p>
          <h2 id={`${id}-q`} ref={tituloRef} tabIndex={-1} className="text-lg sm:text-pregunta font-semibold text-gray-900 outline-none">
            {texto}
          </h2>
          {aclaracion && <p id={`${id}-a`} className="text-sm text-gray-600 leading-snug mt-1.5">{aclaracion}</p>}
        </div>

        {contenido && <div className="px-4 sm:px-5 pb-3">{contenido}</div>}

        {/* Opciones */}
        <div
          role="radiogroup"
          aria-labelledby={`${id}-q`}
          aria-describedby={aclaracion ? `${id}-a` : undefined}
          className={`px-4 sm:px-5 pb-4 grid gap-2 ${dosColumnas ? 'sm:grid-cols-2' : ''}`}
        >
          {opciones.map((opt, idx) => {
            const [titulo, detalle] = opt.split(' — ');
            const activa = seleccionada === idx;
            return (
              <button
                key={idx}
                ref={el => { opcionesRef.current[idx] = el; }}
                type="button"
                role="radio"
                aria-checked={activa}
                tabIndex={idx === foco ? 0 : -1}
                onClick={() => onSelect(idx)}
                onKeyDown={e => onKeyOpcion(e, idx)}
                className={`w-full min-h-12 text-left px-4 py-3 rounded-control border-2 text-sm sm:text-[15px] flex items-center gap-3
                  ${activa ? 'border-brand bg-brand-50 text-gray-900' : 'border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <span className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${activa ? 'border-brand bg-brand' : 'border-gray-400 bg-white'}`} aria-hidden>
                  {activa && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block leading-snug ${activa ? 'font-semibold' : ''}`}>{titulo}</span>
                  {detalle && <span className="block text-xs mt-0.5 text-gray-600">{detalle}</span>}
                </span>
                {opciones.length <= 9 && (
                  <kbd className="hidden sm:inline-flex w-6 h-6 items-center justify-center rounded-md border border-gray-300 text-[11px] font-medium text-gray-600 font-sans shrink-0" aria-hidden>{idx + 1}</kbd>
                )}
              </button>
            );
          })}
        </div>

        {/* Navegación dentro de la tarjeta */}
        <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50 space-y-2">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onPrev}
              disabled={!onPrev}
              className="min-h-11 px-4 border border-gray-300 bg-white rounded-xl text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:text-gray-500 disabled:bg-gray-100 disabled:border-gray-200 disabled:cursor-not-allowed"
            >
              ← Atrás
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={nextDisabled}
              className="flex-1 min-h-11 rounded-xl text-sm font-semibold bg-brand hover:bg-brand-dark text-white disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
            >
              {nextLabel}
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs text-gray-600 min-h-4">
            <span role="status">
              {seleccionada >= 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg>
                  Guardado en este dispositivo
                </span>
              )}
            </span>
            <span className="hidden sm:inline">Teclas 1–{Math.min(9, opciones.length)} para elegir · Enter para seguir</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Intro corta para la primera pregunta de cada módulo. */
export function IntroModulo({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-700 leading-relaxed px-1">{children}</p>;
}

/** Pantalla de cierre de un módulo: mini-resultado de 1–2 líneas y el siguiente paso. */
export function CierreModulo({ modulo, titulo, lineas, siguiente, secundario }: {
  modulo: number;
  titulo: string;
  lineas: string[];
  siguiente: { label: string; onClick: () => void };
  secundario?: { label: string; onClick: () => void };
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <section className="border border-gray-200 rounded-card bg-white shadow-sm p-5 sm:p-6" aria-labelledby="cierre-modulo">
      <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg>
        Módulo {modulo} completo
      </p>
      <h2 id="cierre-modulo" ref={ref} tabIndex={-1} className="text-xl font-bold text-gray-900 mt-1 outline-none">{titulo}</h2>
      <div className="mt-2 space-y-1">
        {lineas.slice(0, 2).map(l => <p key={l} className="text-sm text-gray-700 leading-relaxed">{l}</p>)}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-5">
        <button type="button" onClick={siguiente.onClick} className="flex-1 min-h-12 px-5 rounded-xl text-sm font-semibold bg-brand hover:bg-brand-dark text-white">
          {siguiente.label}
        </button>
        {secundario && (
          <button type="button" onClick={secundario.onClick} className="min-h-12 px-5 rounded-xl text-sm font-medium border border-gray-300 text-gray-800 bg-white hover:bg-gray-50">
            {secundario.label}
          </button>
        )}
      </div>
    </section>
  );
}
