'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import {
  PREGUNTAS_M1, TOTAL_PREGUNTAS, PUNTAJE_MAXIMO, NIVELES, calcularNivel,
  calcularModulo1, generarInformeParcial,
} from '../../../lib/modulo1';
import { storage } from '../../../lib/storage';
import type { Modulo1Resultado } from '../../../types';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getNivelStyle(pct: number) {
  const k = calcularNivel(pct);
  const map = {
    prematuro:  { bar: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-600',       text: 'text-gray-600' },
    temprano:   { bar: 'bg-yellow-400',  badge: 'bg-yellow-100 text-yellow-700',   text: 'text-yellow-700' },
    transicion: { bar: 'bg-[#534AB7]',   badge: 'bg-purple-100 text-[#534AB7]',    text: 'text-[#534AB7]' },
    urgente:    { bar: 'bg-red-500',     badge: 'bg-red-100 text-red-700',         text: 'text-red-700' },
  };
  return map[k];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Modulo1() {
  const router = useRouter();
  const [step, setStep] = useState<'quiz' | 'result'>('quiz');
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(TOTAL_PREGUNTAS).fill(-1));
  const [resultado, setResultado] = useState<Modulo1Resultado | null>(null);

  useEffect(() => {
    const saved = storage.getModulo1Respuestas();
    // If saved data is from old 12-question version, discard it
    if (saved && saved.length === TOTAL_PREGUNTAS) {
      setRespuestas(saved);
      if (saved.every(v => v >= 0)) {
        const res = storage.getModulo1Resultado();
        if (res) { setResultado(res); setStep('result'); }
      }
    }
  }, []);

  function handleSelect(value: number) {
    const updated = [...respuestas];
    updated[current] = value;
    setRespuestas(updated);
    storage.setModulo1Respuestas(updated);
  }

  function handleNext() {
    if (current < TOTAL_PREGUNTAS - 1) {
      setCurrent(current + 1);
    } else {
      const res = calcularModulo1(respuestas);
      storage.setModulo1Resultado(res);
      setResultado(res);
      setStep('result');
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent(current - 1);
  }

  function handleRetry() {
    const empty = new Array(TOTAL_PREGUNTAS).fill(-1);
    setRespuestas(empty);
    setCurrent(0);
    setStep('quiz');
    setResultado(null);
    storage.setModulo1Respuestas(empty);
  }

  const answeredCount = respuestas.filter(v => v >= 0).length;
  const selected = respuestas[current];
  const pregunta = PREGUNTAS_M1[current];

  // ── Result screen ─────────────────────────────────────────────────────────
  if (step === 'result' && resultado) {
    const pct = resultado.porcentaje ?? 0;
    const nivelKey = calcularNivel(pct);
    const nivel = NIVELES[nivelKey];
    const style = getNivelStyle(pct);

    return (
      <ModuleLayout moduleNumber={1} title="¿Necesitás un directorio?">
        <div className="space-y-4">

          {/* Score principal */}
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Resultado final</p>
              <div className="flex items-end gap-3 mb-4">
                <span className={`text-5xl font-bold ${style.text}`}>{pct}%</span>
                <span className={`mb-1.5 text-sm font-semibold px-3 py-1 rounded-full ${style.badge}`}>
                  {nivel.label}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${style.bar}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>No urgente</span><span>Necesidad urgente</span>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Diagnóstico</p>
              <p className="text-sm text-gray-700 leading-relaxed">{nivel.descripcion}</p>
            </div>
          </div>

          {/* Por qué lo necesitás */}
          <div className="border border-gray-200 rounded-xl bg-white px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Por qué lo necesitás</p>
            <p className="text-sm text-gray-700 leading-relaxed">{generarInformeParcial(respuestas)}</p>
          </div>

          {/* Scores por dimensión */}
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Por dimensión</p>
            <div className="space-y-3">
              {resultado.scoresPorDimension.map((dim) => {
                const dp = (dim as typeof dim & { porcentaje?: number }).porcentaje ?? Math.round((dim.score / dim.max) * 100);
                const ds = getNivelStyle(dp);
                return (
                  <div key={dim.nombre}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700 font-medium">{dim.nombre}</span>
                      <span className={`text-sm font-bold ${ds.text}`}>{dp}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${ds.bar}`} style={{ width: `${dp}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recomendaciones */}
          {resultado.recomendaciones.length > 0 && (
            <div className="border border-gray-200 rounded-xl bg-white p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recomendaciones</p>
              <ul className="space-y-3">
                {resultado.recomendaciones.map((rec, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                    <span className="text-[#534AB7] font-bold shrink-0 mt-0.5">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleRetry} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              Rehacer
            </button>
            <button onClick={() => router.push('/modulo/2')} className="flex-1 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold">
              Módulo 2 →
            </button>
          </div>
          <button onClick={() => router.push('/dashboard')} className="w-full py-2.5 border border-[#534AB7] text-[#534AB7] rounded-xl text-sm font-medium hover:bg-purple-50">
            Ver dashboard
          </button>
        </div>
      </ModuleLayout>
    );
  }

  // ── Quiz screen ───────────────────────────────────────────────────────────
  return (
    <ModuleLayout moduleNumber={1} title="¿Necesitás un directorio?">
      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{answeredCount} de {TOTAL_PREGUNTAS} respondidas</span>
          <span>{Math.round((answeredCount / TOTAL_PREGUNTAS) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#534AB7] rounded-full transition-all duration-300" style={{ width: `${(answeredCount / TOTAL_PREGUNTAS) * 100}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden mb-4">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {current + 1}
            </span>
            <span className="text-xs text-gray-400">de {TOTAL_PREGUNTAS}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-snug mb-2">{pregunta.texto}</p>
          {pregunta.aclaracion && (
            <p className="text-xs text-gray-400 leading-snug">{pregunta.aclaracion}</p>
          )}
        </div>
        <div className="p-4 space-y-2">
          {pregunta.opciones.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors
                ${selected === idx
                  ? 'border-[#534AB7] bg-purple-50 text-[#534AB7] font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {opt.texto}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {current > 0 && (
          <button onClick={handlePrev} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            ← Anterior
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={selected < 0}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors
            ${selected >= 0 ? 'bg-[#534AB7] hover:bg-[#3C3489] text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          {current === TOTAL_PREGUNTAS - 1 ? 'Ver resultado final →' : 'Siguiente →'}
        </button>
      </div>
    </ModuleLayout>
  );
}
