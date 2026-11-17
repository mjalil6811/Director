'use client';

import { useEffect, useRef } from 'react';

// Tarjeta de pregunta compartida por los módulos de diagnóstico (M1, M2, M3, M5).
// Pensada para entrar entera en una pantalla de notebook: progreso dentro de la tarjeta,
// opciones compactas y en 2 columnas cuando son muchas.

interface PreguntaProps {
  numero: number;          // 1-based
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
}

export default function Pregunta({
  numero, total, respondidas, tema, texto, aclaracion, opciones, seleccionada,
  onSelect, onPrev, onNext, nextLabel, nextDisabled, arriba,
}: PreguntaProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Al cambiar de pregunta, llevar la tarjeta a la vista (en pantallas bajas puede quedar abajo).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 120 || top > window.innerHeight * 0.4) {
      window.scrollTo({ top: window.scrollY + top - 140, behavior: 'smooth' });
    }
  }, [numero]);

  const dosColumnas = opciones.length >= 5;
  const pct = Math.round((respondidas / total) * 100);

  return (
    <div className="space-y-3">
      {arriba}

      <div ref={ref} className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        {/* Progreso + pregunta */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-brand transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <div className="px-5 sm:px-6 pt-4 pb-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Pregunta {numero} de {total}{tema ? ` · ${tema}` : ''}
          </p>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">{texto}</h2>
          {aclaracion && <p className="text-xs sm:text-sm text-gray-500 leading-snug mt-1">{aclaracion}</p>}
        </div>

        {/* Opciones */}
        <div className={`px-4 sm:px-5 pb-4 grid gap-2 ${dosColumnas ? 'sm:grid-cols-2' : ''}`}>
          {opciones.map((opt, idx) => {
            const [titulo, detalle] = opt.split(' — ');
            const activa = seleccionada === idx;
            return (
              <button
                key={idx}
                onClick={() => onSelect(idx)}
                className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors flex items-center gap-3
                  ${activa ? 'border-brand bg-brand-50 text-brand-dark' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${activa ? 'border-brand' : 'border-gray-300'}`}>
                  {activa && <span className="w-2 h-2 rounded-full bg-brand" />}
                </span>
                <span className="min-w-0">
                  <span className={`block leading-snug ${activa ? 'font-medium' : ''}`}>{titulo}</span>
                  {detalle && <span className={`block text-xs mt-0.5 ${activa ? 'text-brand/70' : 'text-gray-400'}`}>{detalle}</span>}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navegación dentro de la tarjeta */}
        <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex gap-3">
          {onPrev && (
            <button onClick={onPrev} className="px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              ← Anterior
            </button>
          )}
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors
              ${nextDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand hover:bg-brand-dark text-white'}`}
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Intro corta para la primera pregunta de cada módulo. */
export function IntroModulo({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 leading-relaxed px-1">{children}</p>;
}
