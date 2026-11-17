'use client';

import Pregunta, { IntroModulo } from '../../../components/Pregunta';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import { TOTAL_PREGUNTAS, IDX, calcularModulo1, resolverPregunta, perfilDeRespuestas } from '../../../lib/modulo1';
import { CATEGORIA_LABEL, INDUSTRIAS } from '../../../lib/pymes';
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
    // Avance automático a la siguiente pregunta
    if (current < TOTAL_PREGUNTAS - 1) {
      const from = current;
      setTimeout(() => setCurrent(c => (c === from ? c + 1 : c)), 280);
    }
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
  const pregunta = resolverPregunta(current, respuestas);
  const perfil = current > IDX.empleados ? perfilDeRespuestas(respuestas) : null;

  return (
    <ModuleLayout moduleNumber={1}>
      <Pregunta
        numero={current + 1}
        total={TOTAL_PREGUNTAS}
        respondidas={answeredCount}
        texto={pregunta.texto}
        aclaracion={pregunta.aclaracion}
        opciones={pregunta.opciones.map(o => o.texto)}
        seleccionada={selected}
        onSelect={handleSelect}
        onPrev={current > 0 ? handlePrev : undefined}
        onNext={handleNext}
        nextDisabled={selected < 0}
        nextLabel={current === TOTAL_PREGUNTAS - 1 ? 'Siguiente módulo →' : 'Siguiente →'}
        arriba={<>
          {current === 0 && (
            <IntroModulo>
              Son {TOTAL_PREGUNTAS} preguntas: primero sobre vos y tu empresa (industria, facturación y empleados, con los criterios oficiales PyME) y después sobre cómo se decide hoy.
            </IntroModulo>
          )}
      {perfil && (
            <div className={`rounded-xl px-4 py-3 mb-4 text-xs leading-relaxed border ${perfil.enObjetivo ? 'bg-white border-gray-200 text-gray-600' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
              <span className="font-semibold text-gray-900">Tu empresa:</span>{' '}
              {CATEGORIA_LABEL[perfil.categoria]} · {INDUSTRIAS.find(i => i.key === perfil.industria)?.label}
              {perfil.masDe50Empleados && ' · más de 50 empleados'}
              {!perfil.enObjetivo && (
                <span className="block mt-1">
                  Directorio AR está pensado para medianas empresas (Tramo 1 y 2) o con más de 50 empleados. Vas a hacer un <strong>diagnóstico abreviado</strong> (Módulos 1 y 2), y podés seguir con el completo si querés.
                </span>
              )}
            </div>
          )}
        </>}
      />
    </ModuleLayout>
  );
}
