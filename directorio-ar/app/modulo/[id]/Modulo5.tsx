'use client';

import { registrarModuloCompletado } from '../../../lib/analitica';
import Pregunta, { IntroModulo } from '../../../components/Pregunta';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ModuleLayout from '../../../components/ModuleLayout';
import { TEMAS_M5, TOTAL_M5, ESTADO_REGLA, calcularModulo5, textoM5, type ValorM5 } from '../../../lib/modulo5';
import { storage } from '../../../lib/storage';
import type { GrupoRol } from '../../../lib/pymes';
import type { Modulo5Resultado } from '../../../types';

export default function Modulo5() {
  const [grupo, setGrupo] = useState<GrupoRol>('propietario');
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(TOTAL_M5).fill(-1));
  const [resultado, setResultado] = useState<Modulo5Resultado | null>(null);

  useEffect(() => {
    const g = storage.getModulo1Resultado()?.perfil?.grupo;
    if (g) setGrupo(g);
    const saved = storage.getModulo5Respuestas();
    if (saved && saved.length === TOTAL_M5) {
      setRespuestas(saved);
      if (saved.every(v => v >= 0)) setResultado(storage.getModulo5Resultado());
    }
  }, []);

  const valores = (r: number[]) => r.map((idx, i) => TEMAS_M5[i].opciones[idx]?.valor ?? 0) as ValorM5[];

  function handleSelect(idx: number) {
    const updated = [...respuestas];
    updated[current] = idx;
    setRespuestas(updated);
    storage.setModulo5Respuestas(updated);
    if (current < TOTAL_M5 - 1) {
      const from = current;
      setTimeout(() => setCurrent(c => (c === from ? c + 1 : c)), 280);
    }
  }

  function terminar() {
    const res = calcularModulo5(valores(respuestas));
    storage.setModulo5Resultado(res);
    registrarModuloCompletado(5);
    setResultado(res);
  }

  function reiniciar() {
    const vacio = new Array(TOTAL_M5).fill(-1);
    setRespuestas(vacio);
    storage.setModulo5Respuestas(vacio);
    setResultado(null);
    setCurrent(0);
  }

  // ——— Resultado: acuerdo de trabajo ————————————————————————————————————
  if (resultado) {
    const vals = valores(respuestas);
    const pct = resultado.porcentaje ?? 0;
    return (
      <ModuleLayout moduleNumber={5}>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-2xl bg-white p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Acuerdo de trabajo consejo–gerencia</p>
            <p className="text-lg font-bold text-gray-900">{resultado.nivel}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-sm font-semibold text-gray-700 tabular-nums">{pct}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              Estas son las 5 reglas que conviene dejar por escrito antes de la primera reunión. Te marcamos cuáles ya tenés claras y cuáles hay que acordar.
            </p>
          </div>

          <ol className="space-y-3">
            {TEMAS_M5.map((t, i) => {
              const estado = ESTADO_REGLA[vals[i]];
              return (
                <li key={t.id} className="border border-gray-200 rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <p className="text-sm font-semibold text-gray-900">{i + 1}. {t.tema}</p>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ color: estado.color, backgroundColor: estado.bg }}>
                      {estado.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{t.regla}</p>
                  {vals[i] < 1 && <p className="text-xs text-gray-500 mt-2 leading-relaxed"><strong className="text-gray-700">Cómo arrancar:</strong> {t.consejo}</p>}
                </li>
              );
            })}
          </ol>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={reiniciar} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50">
              Volver a responder
            </button>
            <Link href="/resultado" className="flex-1 text-center py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-semibold">
              Ver resultado final →
            </Link>
          </div>
        </div>
      </ModuleLayout>
    );
  }

  // ——— Preguntas ————————————————————————————————————————————————————————
  const tema = TEMAS_M5[current];
  const selected = respuestas[current];
  const answered = respuestas.filter(v => v >= 0).length;

  return (
    <ModuleLayout moduleNumber={5}>
      <Pregunta
        numero={current + 1}
        total={TOTAL_M5}
        respondidas={answered}
        tema={tema.tema}
        texto={textoM5(tema.pregunta, grupo)}
        aclaracion={tema.aclaracion}
        opciones={tema.opciones.map(o => textoM5(o.texto, grupo))}
        seleccionada={selected}
        onSelect={handleSelect}
        onPrev={current > 0 ? () => setCurrent(current - 1) : undefined}
        onNext={() => (current < TOTAL_M5 - 1 ? setCurrent(current + 1) : terminar())}
        nextDisabled={selected < 0 || (current === TOTAL_M5 - 1 && answered < TOTAL_M5)}
        nextLabel={current === TOTAL_M5 - 1 ? 'Ver mi acuerdo de trabajo →' : 'Siguiente →'}
        arriba={current === 0 ? (
          <IntroModulo>
            <strong>El consejo no gestiona:</strong> la gerencia ejecuta el día a día y el consejo orienta, pregunta y participa en las decisiones grandes. Con estas {TOTAL_M5} preguntas definimos cómo va a ser esa relación, y al final te armamos un <strong>acuerdo de trabajo</strong>.
          </IntroModulo>
        ) : undefined}
      />
    </ModuleLayout>
  );
}
