'use client';

import { registrarModuloCompletado } from '../../../lib/analitica';
import Pregunta, { IntroModulo } from '../../../components/Pregunta';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ModuleLayout from '../../../components/ModuleLayout';
import { TEMAS_M5, TOTAL_M5, ESTADO_REGLA, calcularModulo5, textoM5, precargarDecisiones, reglaDecisiones, type ValorM5, type Precarga } from '../../../lib/modulo5';
import { SITUACIONES_M2, type DecisionM2 } from '../../../lib/preguntas';
import { storage } from '../../../lib/storage';
import type { GrupoRol } from '../../../lib/pymes';
import type { Modulo5Resultado } from '../../../types';

export default function Modulo5() {
  const [grupo, setGrupo] = useState<GrupoRol>('propietario');
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(TOTAL_M5).fill(-1));
  const [resultado, setResultado] = useState<Modulo5Resultado | null>(null);
  // Decisiones que pasan por el consejo: precargadas desde el Módulo 2, editables.
  const [precarga, setPrecarga] = useState<Precarga>({ ids: [], origen: 'sugerencia' });
  const [decisiones, setDecisiones] = useState<DecisionM2[]>([]);
  const [avisoLista, setAvisoLista] = useState(false);

  useEffect(() => {
    const g = storage.getModulo1Resultado()?.perfil?.grupo;
    if (g) setGrupo(g);
    const p = precargarDecisiones(storage.getModulo2Respuestas());
    setPrecarga(p);
    setDecisiones((storage.getModulo5Decisiones() as DecisionM2[] | null) ?? p.ids);
    const saved = storage.getModulo5Respuestas();
    if (saved && saved.length === TOTAL_M5) {
      setRespuestas(saved);
      if (saved.every(v => v >= 0)) setResultado(storage.getModulo5Resultado());
    }
  }, []);

  const valores = (r: number[]) => r.map((idx, i) => TEMAS_M5[i].opciones[idx]?.valor ?? 0) as ValorM5[];

  function toggleDecision(id: DecisionM2) {
    const next = decisiones.includes(id) ? decisiones.filter(d => d !== id) : [...decisiones, id];
    setDecisiones(next);
    storage.setModulo5Decisiones(next);
    setAvisoLista(false);
    // Si había confirmado la lista y la deja vacía, la confirmación ya no aplica.
    if (next.length === 0 && TEMAS_M5[current].precargaM2 && respuestas[current] === 0) {
      const updated = [...respuestas];
      updated[current] = -1;
      setRespuestas(updated);
      storage.setModulo5Respuestas(updated);
    }
  }

  function handleSelect(idx: number) {
    // "Confirmo la lista" requiere al menos una decisión marcada.
    if (TEMAS_M5[current].precargaM2 && idx === 0 && decisiones.length === 0) {
      setAvisoLista(true);
      return;
    }
    if (TEMAS_M5[current].precargaM2) storage.setModulo5Decisiones(decisiones);
    const updated = [...respuestas];
    updated[current] = idx;
    setRespuestas(updated);
    storage.setModulo5Respuestas(updated);
    const from = current;
    if (current < TOTAL_M5 - 1) {
      setTimeout(() => setCurrent(c => (c === from ? c + 1 : c)), 280);
      return;
    }
    // Última pregunta: si está todo respondido, muestra solo el acuerdo de trabajo; si no, va a la primera pendiente.
    const pendiente = updated.findIndex(v => v < 0);
    setTimeout(() => {
      if (pendiente >= 0) setCurrent(c => (c === from ? pendiente : c));
      else terminar(updated);
    }, 280);
  }

  function terminar(r: number[] = respuestas) {
    window.scrollTo({ top: 0 });
    const res = calcularModulo5(valores(r));
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Acuerdo de trabajo consejo–gerencia</p>
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
                  <p className="text-sm text-gray-700 leading-relaxed">{(t.precargaM2 && vals[i] === 1 && reglaDecisiones(decisiones)) || t.regla}</p>
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
        modulo={5}
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
        contenido={tema.precargaM2 ? (
          <fieldset className="rounded-xl border border-brand-100 bg-brand-50/40 p-3">
            <legend className="sr-only">Decisiones que pasan por el consejo</legend>
            <p className="text-xs text-gray-700 leading-relaxed mb-2">
              {precarga.origen === 'm2'
                ? precarga.ids.length > 0
                  ? 'Marcamos las decisiones que en el Módulo 2 se toman sin un proceso compartido. Sacá o sumá las que quieras.'
                  : 'En el Módulo 2 ninguna de estas decisiones apareció concentrada. Marcá las que quieras llevar al consejo.'
                : 'No respondiste el Módulo 2: te sugerimos estas. Sacá o sumá las que quieras.'}
            </p>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {SITUACIONES_M2.map(s => (
                <label key={s.id} className="flex items-center gap-2.5 min-h-11 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-800 cursor-pointer has-[:checked]:border-brand">
                  <input type="checkbox" checked={decisiones.includes(s.id)} onChange={() => toggleDecision(s.id)} className="w-4 h-4 accent-brand shrink-0" />
                  {s.decision}
                </label>
              ))}
            </div>
            {avisoLista && <p role="alert" className="text-xs text-red-700 mt-2">Marcá al menos una decisión para confirmar la lista.</p>}
          </fieldset>
        ) : undefined}
        arriba={current === 0 ? (
          <IntroModulo>
            <strong>El consejo no gestiona:</strong> la gerencia ejecuta el día a día y el consejo orienta, pregunta y participa en las decisiones grandes. Con estas {TOTAL_M5} preguntas definimos cómo va a ser esa relación, y al final te armamos un <strong>acuerdo de trabajo</strong>.
          </IntroModulo>
        ) : undefined}
      />
    </ModuleLayout>
  );
}
