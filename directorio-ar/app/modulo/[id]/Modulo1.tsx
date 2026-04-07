'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import { PREGUNTAS_M1, TOTAL_PREGUNTAS, calcularModulo1 } from '../../../lib/modulo1';
import { storage } from '../../../lib/storage';

export default function Modulo1() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(TOTAL_PREGUNTAS).fill(-1));

  useEffect(() => {
    const saved = storage.getModulo1Respuestas();
    if (saved && saved.length === TOTAL_PREGUNTAS) {
      setRespuestas(saved);
      // If already completed, go straight to M2
      if (saved.every(v => v >= 0) && storage.getModulo1Resultado()) {
        router.push('/modulo/2');
      }
    }
  }, [router]);

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
      // Calculate, save, and go directly to M2
      const res = calcularModulo1(respuestas);
      storage.setModulo1Resultado(res);
      router.push('/modulo/2');
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent(current - 1);
  }

  const answeredCount = respuestas.filter(v => v >= 0).length;
  const selected = respuestas[current];
  const pregunta = PREGUNTAS_M1[current];

  return (
    <ModuleLayout moduleNumber={1} title="¿Necesitás un directorio?">
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{answeredCount} de {TOTAL_PREGUNTAS} respondidas</span>
          <span>{Math.round((answeredCount / TOTAL_PREGUNTAS) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#534AB7] rounded-full transition-all duration-300" style={{ width: `${(answeredCount / TOTAL_PREGUNTAS) * 100}%` }} />
        </div>
      </div>

      {current === 0 && (
        <div className="border border-purple-100 bg-purple-50 rounded-xl px-5 py-4 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            En este módulo vamos a evaluar si tu empresa tiene las condiciones para beneficiarse de un directorio formal. Son 15 preguntas sobre tamaño, propiedad, gobierno y disponibilidad.
          </p>
        </div>
      )}

      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden mb-4 shadow-sm">
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
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all hover:shadow-md transition-shadow
                ${selected === idx
                  ? 'border-[#534AB7] border-l-4 border-l-[#534AB7] bg-purple-50 text-[#534AB7] font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {opt.texto}
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
          {current === TOTAL_PREGUNTAS - 1 ? 'Siguiente módulo →' : 'Siguiente →'}
        </button>
      </div>
    </ModuleLayout>
  );
}
