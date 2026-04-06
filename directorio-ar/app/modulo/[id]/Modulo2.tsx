'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import QuestionCard from '../../../components/QuestionCard';
import OptionButton from '../../../components/OptionButton';
import NavButtons from '../../../components/NavButtons';
import ProgressBar from '../../../components/ProgressBar';
import { SITUACIONES_M2, OPCIONES_M2, CORRECTAS_M2, calcularModulo2 } from '../../../lib/modulo2';
import { storage } from '../../../lib/storage';
import type { Modulo2Resultado } from '../../../types';

const ROLE_LABEL: Record<string, string> = {
  A: "Accionista",
  D: "Director",
  G: "Gerente",
  M: "Los tres mezclados",
};

export default function Modulo2() {
  const router = useRouter();
  const [step, setStep] = useState<'quiz' | 'result'>('quiz');
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(10).fill(-1));
  const [resultado, setResultado] = useState<Modulo2Resultado | null>(null);

  useEffect(() => {
    const saved = storage.getModulo2Respuestas();
    if (saved && saved.length === 10 && saved.every(v => v >= 0)) {
      setRespuestas(saved);
      const res = storage.getModulo2Resultado();
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
    storage.setModulo2Respuestas(updated);
  }

  function handleNext() {
    if (current < 9) {
      setCurrent(current + 1);
    } else {
      const res = calcularModulo2(respuestas);
      storage.setModulo2Resultado(res);
      setResultado(res);
      setStep('result');
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent(current - 1);
  }

  function handleRetry() {
    setRespuestas(new Array(10).fill(-1));
    setCurrent(0);
    setStep('quiz');
    setResultado(null);
  }

  const answeredCount = respuestas.filter(v => v >= 0).length;

  if (step === 'result' && resultado) {
    return (
      <ModuleLayout moduleNumber={2} title="Clasificador de roles">
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Tu perfil de roles</h2>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 mt-2 mb-4">
              {resultado.perfil}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(['A', 'D', 'G', 'M'] as const).map(key => (
                <div key={key} className="text-center border border-gray-100 rounded-xl p-3">
                  <div className="text-xl font-bold text-gray-900">{resultado.conteos[key]}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{ROLE_LABEL[key]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Answer review */}
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Revisión de respuestas</h3>
            <div className="space-y-2">
              {respuestas.map((rIdx, i) => {
                const elegido = OPCIONES_M2[rIdx]?.value ?? 'M';
                const correcto = CORRECTAS_M2[i];
                const isCorrect = elegido === correcto;
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border text-sm
                    ${isCorrect ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                    <span className={`font-bold shrink-0 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                      {i + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-xs leading-snug mb-1">{SITUACIONES_M2[i]}</p>
                      <div className="flex gap-2 flex-wrap text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          Tu resp: {ROLE_LABEL[elegido]}
                        </span>
                        {!isCorrect && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                            Correcto: {ROLE_LABEL[correcto]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {resultado.tensiones.length > 0 && (
            <div className="border border-orange-100 rounded-xl bg-orange-50 p-5">
              <h3 className="text-sm font-semibold text-orange-800 mb-2">Tensiones principales</h3>
              {resultado.tensiones.map((t, i) => (
                <p key={i} className="text-sm text-orange-700 mb-1">
                  Pregunta {t.pregunta}: elegiste <strong>{ROLE_LABEL[t.elegido]}</strong>, debería ser <strong>{ROLE_LABEL[t.correcto]}</strong>
                </p>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleRetry} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Rehacer</button>
            <button onClick={() => router.push('/modulo/3')} className="flex-1 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold">Módulo 3 →</button>
          </div>
          <button onClick={() => router.push('/dashboard')} className="w-full py-2.5 border border-[#534AB7] text-[#534AB7] rounded-xl text-sm font-medium hover:bg-purple-50">
            Ver dashboard
          </button>
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout moduleNumber={2} title="Clasificador de roles">
      <div className="mb-4">
        <ProgressBar percentage={Math.round((answeredCount / 10) * 100)} label={`${answeredCount} de 10 situaciones respondidas`} />
      </div>
      <QuestionCard number={current + 1} total={10} question={SITUACIONES_M2[current]}>
        {OPCIONES_M2.map((opt, idx) => (
          <OptionButton
            key={opt.value}
            label={opt.label}
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
        nextLabel={current === 9 ? 'Ver resultado' : 'Siguiente'}
      />
    </ModuleLayout>
  );
}
