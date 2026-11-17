'use client';

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
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{answered} de {TOTAL_M5} respondidas</span>
          <span>{Math.round((answered / TOTAL_M5) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${(answered / TOTAL_M5) * 100}%` }} />
        </div>
      </div>

      {current === 0 && (
        <div className="border border-brand-100 bg-brand-50/60 rounded-xl px-5 py-4 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>El consejo no gestiona:</strong> la gerencia ejecuta el día a día y el consejo orienta, pregunta y participa en las decisiones grandes.
            Con estas {TOTAL_M5} preguntas definimos cómo va a ser esa relación en tu empresa, y al final te armamos un <strong>acuerdo de trabajo</strong> para dejar por escrito.
          </p>
        </div>
      )}

      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden mb-4 shadow-sm">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0">{current + 1}</span>
            <span className="text-xs text-gray-400">de {TOTAL_M5} · {tema.tema}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-snug mb-2">{textoM5(tema.pregunta, grupo)}</p>
          <p className="text-xs text-gray-400 leading-snug">{tema.aclaracion}</p>
        </div>
        <div className="p-4 space-y-2">
          {tema.opciones.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all
                ${selected === idx
                  ? 'border-brand border-l-4 border-l-brand bg-brand-50 text-brand font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
            >
              {textoM5(opt.texto, grupo)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {current > 0 && (
          <button onClick={() => setCurrent(current - 1)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            ← Anterior
          </button>
        )}
        <button
          onClick={() => (current < TOTAL_M5 - 1 ? setCurrent(current + 1) : terminar())}
          disabled={selected < 0 || (current === TOTAL_M5 - 1 && answered < TOTAL_M5)}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors
            ${selected >= 0 ? 'bg-brand hover:bg-brand-dark text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          {current === TOTAL_M5 - 1 ? 'Ver mi acuerdo de trabajo →' : 'Siguiente →'}
        </button>
      </div>
    </ModuleLayout>
  );
}
