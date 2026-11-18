'use client';

import { trackEvent, registrarModuloCompletado } from '../../../lib/analitica';
import Pregunta, { IntroModulo, CierreModulo } from '../../../components/Pregunta';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import { TOTAL_PREGUNTAS, IDX, calcularModulo1, resolverPregunta, perfilDeRespuestas } from '../../../lib/modulo1';
import type { Modulo1Resultado } from '../../../types';
import { CATEGORIA_LABEL, INDUSTRIAS } from '../../../lib/pymes';
import { storage } from '../../../lib/storage';

export default function Modulo1() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(TOTAL_PREGUNTAS).fill(-1));
  const [cierre, setCierre] = useState<Modulo1Resultado | null>(null);

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
      registrarModuloCompletado(1);
      setCierre(res);
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent(current - 1);
  }

  if (cierre) {
    const abreviado = cierre.perfil?.recorrido === 'abreviado';
    return (
      <ModuleLayout moduleNumber={1}>
        <CierreModulo
          modulo={1}
          titulo={cierre.nivel}
          lineas={[
            `Necesidad detectada en este módulo: ${cierre.porcentaje ?? 0}/100.${abreviado ? ' Hacés el diagnóstico abreviado: falta solo el Módulo 2.' : ''}`,
            'Siguiente: el mapa de decisiones (Módulo 2), para ver quién decide hoy cada tema importante.',
          ]}
          siguiente={{ label: 'Seguir con el Módulo 2 →', onClick: () => router.push('/modulo/2') }}
          secundario={{ label: 'Revisar respuestas', onClick: () => { setCierre(null); setCurrent(0); } }}
        />
      </ModuleLayout>
    );
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
