'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import { PREGUNTAS_M3, PERFIL_LABELS, calcularModulo3 } from '../../../lib/modulo3';
import { storage } from '../../../lib/storage';
import type { Modulo3Resultado } from '../../../types';

const URGENCIA_STYLE: Record<string, { badge: string; bar: string }> = {
  "Crítico":        { badge: "bg-red-100 text-red-700",       bar: "bg-red-400" },
  "Urgente":        { badge: "bg-orange-100 text-orange-700", bar: "bg-orange-400" },
  "Recomendado":    { badge: "bg-purple-100 text-[#534AB7]",  bar: "bg-[#534AB7]" },
  "Complementario": { badge: "bg-gray-100 text-gray-500",     bar: "bg-gray-300" },
};

export default function Modulo3() {
  const router = useRouter();
  const [step, setStep] = useState<'quiz' | 'result'>('quiz');
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(15).fill(-1));
  const [resultado, setResultado] = useState<Modulo3Resultado | null>(null);

  useEffect(() => {
    const saved = storage.getModulo3Respuestas();
    if (saved && saved.length === 15 && saved.every(v => v >= 0)) {
      setRespuestas(saved);
      const res = storage.getModulo3Resultado();
      if (res) { setResultado(res); setStep('result'); }
    }
  }, []);

  function handleSelect(idx: number) {
    const updated = [...respuestas];
    updated[current] = idx;
    setRespuestas(updated);
    storage.setModulo3Respuestas(updated);
  }

  function handleNext() {
    if (current < 14) {
      setCurrent(current + 1);
    } else {
      const res = calcularModulo3(respuestas);
      storage.setModulo3Resultado(res);
      setResultado(res);
      setStep('result');
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent(current - 1);
  }

  function handleRetry() {
    const empty = new Array(15).fill(-1);
    setRespuestas(empty);
    setCurrent(0);
    setStep('quiz');
    setResultado(null);
    storage.setModulo3Respuestas(empty);
  }

  const answeredCount = respuestas.filter(v => v >= 0).length;

  // ── Result ────────────────────────────────────────────────────────────────
  if (step === 'result' && resultado) {
    return (
      <ModuleLayout moduleNumber={3} title="¿Qué perfiles necesitás?">
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-xl bg-white px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Perfiles recomendados</p>
            <p className="text-sm text-gray-500">Rankeados por prioridad según las características de tu empresa.</p>
          </div>

          <div className="space-y-3">
            {resultado.topPerfiles.map((p, i) => {
              const style = URGENCIA_STYLE[p.urgencia] ?? URGENCIA_STYLE["Complementario"];
              return (
                <div key={p.perfil} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-gray-900 text-sm">
                          {PERFIL_LABELS[p.perfil] ?? p.perfil}
                        </span>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
                        {p.urgencia}
                      </span>
                    </div>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{p.descripcion}</p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${Math.min(100, Math.round((p.score / 15) * 100))}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Score: {p.score}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleRetry} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              Rehacer
            </button>
            <button onClick={() => router.push('/modulo/4')} className="flex-1 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold">
              Módulo 4 →
            </button>
          </div>
          <button onClick={() => router.push('/dashboard')} className="w-full py-2.5 border border-[#534AB7] text-[#534AB7] rounded-xl text-sm font-medium hover:bg-purple-50">
            Ver dashboard
          </button>
        </div>
      </ModuleLayout>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  const pregunta = PREGUNTAS_M3[current];
  const selected = respuestas[current];

  return (
    <ModuleLayout moduleNumber={3} title="¿Qué perfiles necesitás?">
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{answeredCount} de 15 respondidas</span>
          <span>{Math.round((answeredCount / 15) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#534AB7] rounded-full transition-all duration-300" style={{ width: `${(answeredCount / 15) * 100}%` }} />
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden mb-4">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center shrink-0">{current + 1}</span>
            <span className="text-xs text-gray-400">de 15</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{pregunta.texto}</p>
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
              {opt}
            </button>
          ))}
        </div>
      </div>

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
          {current === 14 ? 'Ver perfiles →' : 'Siguiente →'}
        </button>
      </div>
    </ModuleLayout>
  );
}
