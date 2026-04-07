'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import { SITUACIONES_M2, calcularModulo2 } from '../../../lib/modulo2';
import { storage } from '../../../lib/storage';

export default function Modulo2() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(10).fill(-1));

  useEffect(() => {
    const saved = storage.getModulo2Respuestas();
    if (saved && saved.length === 10 && saved.every(v => v >= 0)) {
      setRespuestas(saved);
      if (storage.getModulo2Resultado()) {
        // Already completed, go to preliminary report
        router.push('/informe-preliminar');
      }
    }
  }, [router]);

  function handleSelect(idx: number) {
    const updated = [...respuestas];
    updated[current] = idx;
    setRespuestas(updated);
    storage.setModulo2Respuestas(updated);
  }

  function handleNext() {
    if (current < 9) {
      setCurrent(current + 1);
    } else {
      // Calculate, save, and go to preliminary report
      const res = calcularModulo2(respuestas);
      storage.setModulo2Resultado(res);
      router.push('/informe-preliminar');
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent(current - 1);
  }

  const answeredCount = respuestas.filter(v => v >= 0).length;
  const sit = SITUACIONES_M2[current];
  const selected = respuestas[current];

  return (
    <ModuleLayout moduleNumber={2} title="Mapa de decisiones">
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{answeredCount} de 10 respondidas</span>
          <span>{Math.round((answeredCount / 10) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#534AB7] rounded-full transition-all duration-300" style={{ width: `${(answeredCount / 10) * 100}%` }} />
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden mb-4">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center shrink-0">{current + 1}</span>
            <span className="text-xs text-gray-400">de 10</span>
          </div>
          <p className="text-xs font-semibold text-[#534AB7] uppercase tracking-wider mb-2">¿Quién decide esto HOY en tu empresa?</p>
          <p className="text-sm font-semibold text-gray-900 leading-snug mb-2">{sit.texto}</p>
          {sit.aclaracion && (
            <p className="text-xs text-gray-400 leading-snug">{sit.aclaracion}</p>
          )}
        </div>
        <div className="p-4 space-y-2">
          {sit.opciones.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors
                ${selected === idx
                  ? 'border-[#534AB7] bg-purple-50 text-[#534AB7] font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {opt.label}
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
          {current === 9 ? 'Ver informe preliminar →' : 'Siguiente →'}
        </button>
      </div>
    </ModuleLayout>
  );
}
