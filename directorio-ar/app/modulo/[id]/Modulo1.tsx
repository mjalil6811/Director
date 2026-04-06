'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import QuestionCard from '../../../components/QuestionCard';
import OptionButton from '../../../components/OptionButton';
import NavButtons from '../../../components/NavButtons';
import ProgressBar from '../../../components/ProgressBar';
import ResultCard from '../../../components/ResultCard';
import { PREGUNTAS_M1, DIMENSIONES, calcularModulo1 } from '../../../lib/modulo1';
import { storage } from '../../../lib/storage';
import type { Modulo1Resultado } from '../../../types';

export default function Modulo1() {
  const router = useRouter();
  const [step, setStep] = useState<'quiz' | 'result'>('quiz');
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(12).fill(-1));
  const [resultado, setResultado] = useState<Modulo1Resultado | null>(null);

  useEffect(() => {
    const saved = storage.getModulo1Respuestas();
    if (saved && saved.length === 12) {
      setRespuestas(saved);
      const allAnswered = saved.every(v => v >= 0);
      if (allAnswered) {
        const res = storage.getModulo1Resultado();
        if (res) {
          setResultado(res);
          setStep('result');
        }
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
    if (current < PREGUNTAS_M1.length - 1) {
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
    setRespuestas(new Array(12).fill(-1));
    setCurrent(0);
    setStep('quiz');
    setResultado(null);
    storage.setModulo1Respuestas(new Array(12).fill(-1));
  }

  const answeredCount = respuestas.filter(v => v >= 0).length;
  const progress = Math.round((answeredCount / 12) * 100);

  const levelColor = (nivel: string) => {
    if (nivel === "Directorio prematuro") return "gray";
    if (nivel === "Señales tempranas") return "yellow";
    if (nivel === "Momento de transición") return "purple";
    return "red";
  };

  if (step === 'result' && resultado) {
    return (
      <ModuleLayout moduleNumber={1} title="¿Necesitás un directorio?">
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Resultado del diagnóstico</h2>
            <p className="text-sm text-gray-500 mb-4">Basado en tus respuestas</p>
            <div className="mb-4">
              <ProgressBar percentage={resultado.porcentaje ?? 0} label={`Puntuación: ${resultado.porcentaje}%`} />
            </div>
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold
              ${resultado.nivel === 'Directorio prematuro' ? 'bg-gray-100 text-gray-700' :
                resultado.nivel === 'Señales tempranas' ? 'bg-yellow-100 text-yellow-800' :
                resultado.nivel === 'Momento de transición' ? 'bg-purple-100 text-purple-700' :
                'bg-red-100 text-red-700'}`}>
              {resultado.nivel}
            </div>
          </div>

          {/* Dimension scores */}
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Puntuación por dimensión</h3>
            <div className="space-y-3">
              {resultado.scoresPorDimension.map(dim => (
                <ProgressBar
                  key={dim.nombre}
                  percentage={Math.round((dim.score / dim.max) * 100)}
                  label={dim.nombre}
                />
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {resultado.recomendaciones.length > 0 && (
            <div className="border border-gray-200 rounded-xl bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recomendaciones</h3>
              <ul className="space-y-2">
                {resultado.recomendaciones.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-[#534AB7] font-bold shrink-0">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Rehacer
            </button>
            <button
              onClick={() => router.push('/modulo/2')}
              className="flex-1 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold"
            >
              Módulo 2 →
            </button>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-2.5 border border-[#534AB7] text-[#534AB7] rounded-xl text-sm font-medium hover:bg-purple-50"
          >
            Ver dashboard
          </button>
        </div>
      </ModuleLayout>
    );
  }

  const pregunta = PREGUNTAS_M1[current];
  const selected = respuestas[current];

  return (
    <ModuleLayout moduleNumber={1} title="¿Necesitás un directorio?">
      <div className="mb-4">
        <ProgressBar percentage={progress} label={`${answeredCount} de 12 preguntas respondidas`} />
      </div>
      <QuestionCard number={current + 1} total={12} question={pregunta.texto}>
        {pregunta.opciones.map(opt => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            selected={selected === opt.value}
            onClick={() => handleSelect(opt.value)}
          />
        ))}
      </QuestionCard>
      <NavButtons
        onPrev={handlePrev}
        onNext={handleNext}
        prevDisabled={current === 0}
        nextDisabled={selected < 0}
        showPrev={current > 0}
        nextLabel={current === 11 ? 'Ver resultado' : 'Siguiente'}
      />
    </ModuleLayout>
  );
}
