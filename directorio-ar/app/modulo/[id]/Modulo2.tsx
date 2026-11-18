'use client';

import { registrarModuloCompletado } from '../../../lib/analitica';
import Pregunta, { IntroModulo, CierreModulo } from '../../../components/Pregunta';
import type { Modulo2Resultado } from '../../../types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import { SITUACIONES_M2, calcularModulo2 } from '../../../lib/modulo2';

const TOTAL = SITUACIONES_M2.length;
import { storage } from '../../../lib/storage';

export default function Modulo2() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(TOTAL).fill(-1));
  const [cierre, setCierre] = useState<Modulo2Resultado | null>(null);

  useEffect(() => {
    const saved = storage.getModulo2Respuestas();
    if (saved && saved.length === TOTAL && saved.every(v => v >= 0)) {
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
    // Avance automático a la siguiente pregunta
    if (current < TOTAL - 1) {
      const from = current;
      setTimeout(() => setCurrent(c => (c === from ? c + 1 : c)), 280);
    }
  }

  function handleNext() {
    if (current < TOTAL - 1) {
      setCurrent(current + 1);
    } else {
      // Calculate, save, and go to preliminary report
      const res = calcularModulo2(respuestas);
      storage.setModulo2Resultado(res);
      registrarModuloCompletado(2);
      setCierre(res);
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent(current - 1);
  }

  if (cierre) {
    return (
      <ModuleLayout moduleNumber={2}>
        <CierreModulo
          modulo={2}
          titulo={cierre.perfil}
          lineas={[
            `${cierre.porcentaje ?? 0}% de las decisiones que repasaste están concentradas en una persona o no tienen un responsable claro.`,
            'Siguiente: tu informe preliminar, con la ubicación de tu empresa en la matriz de necesidad y disposición.',
          ]}
          siguiente={{ label: 'Ver informe preliminar →', onClick: () => router.push('/informe-preliminar') }}
          secundario={{ label: 'Revisar respuestas', onClick: () => { setCierre(null); setCurrent(0); } }}
        />
      </ModuleLayout>
    );
  }

  const answeredCount = respuestas.filter(v => v >= 0).length;
  const sit = SITUACIONES_M2[current];
  const selected = respuestas[current];

  return (
    <ModuleLayout moduleNumber={2}>
      <Pregunta
        modulo={2}
        numero={current + 1}
        total={TOTAL}
        respondidas={answeredCount}
        tema="¿Quién decide esto hoy?"
        texto={sit.texto}
        aclaracion={sit.aclaracion}
        opciones={sit.opciones.map(o => o.label)}
        seleccionada={selected}
        onSelect={handleSelect}
        onPrev={current > 0 ? handlePrev : undefined}
        onNext={handleNext}
        nextDisabled={selected < 0}
        nextLabel={current === TOTAL - 1 ? 'Ver informe preliminar →' : 'Siguiente →'}
        arriba={current === 0 ? (
          <IntroModulo>
            Ahora mapeamos cómo se toman las decisiones hoy. No hay respuestas correctas: buscamos dónde hay concentración o zonas grises.
          </IntroModulo>
        ) : undefined}
      />
    </ModuleLayout>
  );
}
