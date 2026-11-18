'use client';

import { trackEvent, registrarModuloCompletado } from '../../../lib/analitica';
import Pregunta, { IntroModulo } from '../../../components/Pregunta';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import { TOTAL_PREGUNTAS, IDX, calcularModulo1, resolverPregunta, perfilDeRespuestas } from '../../../lib/modulo1';
import { CATEGORIA_LABEL, INDUSTRIAS } from '../../../lib/pymes';
import { storage } from '../../../lib/storage';

export default function Modulo1() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(TOTAL_PREGUNTAS).fill(-1));
  const finalizando = useRef(false);

  useEffect(() => {
    const saved = storage.getModulo1Respuestas();
    if (saved && saved.length === TOTAL_PREGUNTAS) {
      setRespuestas(saved);
      // Ya completo: directo al M2. Si quedan preguntas sin responder (p. ej. agregadas en una versión
      // nueva), retomar en la primera pendiente.
      if (saved.every(v => v >= 0) && storage.getModulo1Resultado()) {
        router.push('/modulo/2');
      } else if (saved.some(v => v >= 0)) {
        setCurrent(Math.max(0, saved.findIndex(v => v < 0)));
      }
    }
  }, [router]);

  function handleSelect(value: number) {
    if (respuestas.every(v => v < 0)) trackEvent('diagnostico_iniciado');
    const updated = [...respuestas];
    updated[current] = value;
    setRespuestas(updated);
    storage.setModulo1Respuestas(updated);
    const from = current;
    if (current < TOTAL_PREGUNTAS - 1) {
      // Avance automático a la siguiente pregunta
      setTimeout(() => setCurrent(c => (c === from ? c + 1 : c)), 280);
      return;
    }
    // Última pregunta: si está todo respondido, pasa solo al Módulo 2; si no, vuelve a la primera pendiente.
    const pendiente = updated.findIndex(v => v < 0);
    setTimeout(() => {
      if (pendiente >= 0) setCurrent(c => (c === from ? pendiente : c));
      else finalizar(updated);
    }, 280);
  }

  /** Calcula y guarda el resultado del Módulo 1 y sigue directo al Módulo 2. */
  function finalizar(r: number[]) {
    if (finalizando.current) return;
    finalizando.current = true;
    storage.setModulo1Resultado(calcularModulo1(r));
    registrarModuloCompletado(1);
    router.push('/modulo/2');
  }

  function handleNext() {
    if (current < TOTAL_PREGUNTAS - 1) {
      setCurrent(current + 1);
    } else {
      const pendiente = respuestas.findIndex(v => v < 0);
      if (pendiente >= 0) setCurrent(pendiente);
      else finalizar(respuestas);
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
        modulo={1}
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
