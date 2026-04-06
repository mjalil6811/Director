'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import QuestionCard from '../../../components/QuestionCard';
import OptionButton from '../../../components/OptionButton';
import NavButtons from '../../../components/NavButtons';
import ProgressBar from '../../../components/ProgressBar';
import { PREGUNTAS_M3, calcularModulo3 } from '../../../lib/modulo3';
import { storage } from '../../../lib/storage';
import type { Modulo3Resultado } from '../../../types';

const PERFIL_LABELS: Record<string, string> = {
  estratega: "Estratega",
  financiero: "Financiero",
  familiar: "Familiar",
  sector: "Experto sectorial",
  legal: "Legal",
  rrhh: "RRHH",
  digital: "Digital",
  inversor: "Inversor",
  control: "Control",
  crisis: "Crisis",
};

const URGENCIA_COLORS: Record<string, string> = {
  "Crítico": "bg-red-100 text-red-700",
  "Urgente": "bg-orange-100 text-orange-700",
  "Recomendado": "bg-yellow-100 text-yellow-800",
  "Complementario": "bg-gray-100 text-gray-600",
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
      if (res) {
        setResultado(res);
        setStep('result');
      }
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
    setRespuestas(new Array(15).fill(-1));
    setCurrent(0);
    setStep('quiz');
    setResultado(null);
  }

  const answeredCount = respuestas.filter(v => v >= 0).length;

  if (step === 'result' && resultado) {
    return (
      <ModuleLayout moduleNumber={3} title="¿Qué perfiles necesitás?">
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Perfiles recomendados para tu directorio</h2>
            <div className="space-y-3">
              {resultado.topPerfiles.map((p, i) => (
                <div key={p.perfil} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-gray-900">{PERFIL_LABELS[p.perfil] ?? p.perfil}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${URGENCIA_COLORS[p.urgencia] ?? 'bg-gray-100 text-gray-600'}`}>
                      {p.urgencia}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{p.descripcion}</p>
                  <div className="mt-2">
                    <ProgressBar percentage={Math.min(100, Math.round((p.score / 15) * 100))} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleRetry} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Rehacer</button>
            <button onClick={() => router.push('/modulo/4')} className="flex-1 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold">Módulo 4 →</button>
          </div>
          <button onClick={() => router.push('/dashboard')} className="w-full py-2.5 border border-[#534AB7] text-[#534AB7] rounded-xl text-sm font-medium hover:bg-purple-50">
            Ver dashboard
          </button>
        </div>
      </ModuleLayout>
    );
  }

  const pregunta = PREGUNTAS_M3[current];

  return (
    <ModuleLayout moduleNumber={3} title="¿Qué perfiles necesitás?">
      <div className="mb-4">
        <ProgressBar percentage={Math.round((answeredCount / 15) * 100)} label={`${answeredCount} de 15 preguntas respondidas`} />
      </div>
      <QuestionCard number={current + 1} total={15} question={pregunta.texto}>
        {pregunta.opciones.map((opt, idx) => (
          <OptionButton
            key={idx}
            label={opt}
            selected={respuestas[current] === idx}
            onClick={() => handleSelect(idx)}
          />
        ))}
      </QuestionCard>
      <NavButtons
        onPrev={handlePrev}
        onNext={handleNext}
        prevDisabled={current === 0}
        nextDisabled={respuestas[current] < 0}
        showPrev={current > 0}
        nextLabel={current === 14 ? 'Ver resultado' : 'Siguiente'}
      />
    </ModuleLayout>
  );
}
