'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import ProgressBar from '../../../components/ProgressBar';
import { PREGUNTAS_M1, DIMENSIONES, calcularModulo1 } from '../../../lib/modulo1';
import { storage } from '../../../lib/storage';
import type { Modulo1Resultado } from '../../../types';

// ─── Live analysis ────────────────────────────────────────────────────────────

function calcularPorcentajeParcial(respuestas: number[]): number {
  const answered = respuestas.filter(v => v >= 0);
  if (answered.length === 0) return 0;
  const sum = answered.reduce((a, b) => a + b, 0);
  return Math.round((sum / (answered.length * 3)) * 100);
}

function generarInformeParcial(respuestas: number[]): string {
  const answered = respuestas.filter(v => v >= 0);
  const n = answered.length;
  if (n === 0) return '';

  const pct = calcularPorcentajeParcial(respuestas);

  // Collect signals from answered questions
  const signals: string[] = [];

  // P1 (tamaño - personas)
  if (respuestas[0] >= 2) signals.push('el tamaño del equipo');
  // P2 (facturación)
  if (respuestas[1] >= 2) signals.push('el volumen de facturación');
  // P3 (propiedad)
  if (respuestas[2] >= 2) signals.push('la complejidad de la estructura societaria');
  // P4 (sucesión)
  if (respuestas[3] >= 2) signals.push('la proximidad de un proceso de sucesión');
  // P5 (decisiones)
  if (respuestas[4] <= 1) signals.push('la informalidad en la toma de decisiones');
  // P6 (dueño vs gerencia)
  if (respuestas[5] <= 1) signals.push('la falta de separación entre dueño y gerencia');
  // P7 (deuda)
  if (respuestas[6] >= 2) signals.push('el nivel de endeudamiento');
  // P8 (crisis)
  if (respuestas[7] >= 2) signals.push('los conflictos o crisis anteriores');
  // P9 (estrategia)
  if (respuestas[8] >= 2) signals.push('la existencia de una estrategia formal');
  // P10 (crecimiento)
  if (respuestas[9] >= 2) signals.push('los planes de crecimiento activos');
  // P11 (dependencia)
  if (respuestas[10] <= 1) signals.push('la dependencia de personas clave');
  // P12 (apertura)
  if (respuestas[11] >= 2) signals.push('la apertura del CEO a perspectivas externas');

  // Compose message
  if (pct < 30) {
    if (signals.length === 0) {
      return 'Con las respuestas hasta ahora, la empresa no muestra señales urgentes que justifiquen un directorio formal. Puede ser temprano.';
    }
    return `Hasta aquí, la empresa muestra un perfil de baja complejidad. ${signals.length > 0 ? `Vale la pena observar ${signals[0]}.` : ''} No hay urgencia inmediata.`;
  }

  if (pct < 55) {
    const factor = signals[0] ?? 'algunos factores relevantes';
    return `Las respuestas muestran señales tempranas. Factores como ${factor} empiezan a justificar una estructura de gobierno más formal, aunque todavía no es urgente.`;
  }

  if (pct < 75) {
    const factoresList = signals.slice(0, 2).join(' y ') || 'varios factores';
    return `La empresa está en un momento de transición. ${factoresList.charAt(0).toUpperCase() + factoresList.slice(1)} indican que un directorio agregaría valor concreto en esta etapa.`;
  }

  // ≥ 75
  const factoresList = signals.slice(0, 3).join(', ') || 'múltiples dimensiones';
  return `Las respuestas apuntan a una necesidad clara. ${factoresList.charAt(0).toUpperCase() + factoresList.slice(1)} son señales sólidas de que operar sin un directorio representa un riesgo real para la empresa.`;
}

function getNivelLabel(pct: number): string {
  if (pct < 30) return 'Directorio prematuro';
  if (pct < 55) return 'Señales tempranas';
  if (pct < 75) return 'Momento de transición';
  return 'Necesidad urgente';
}

function getNivelStyle(pct: number) {
  if (pct < 30) return { bar: 'bg-gray-300', badge: 'bg-gray-100 text-gray-600', text: 'text-gray-600' };
  if (pct < 55) return { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700', text: 'text-yellow-700' };
  if (pct < 75) return { bar: 'bg-[#534AB7]', badge: 'bg-purple-100 text-[#534AB7]', text: 'text-[#534AB7]' };
  return { bar: 'bg-red-500', badge: 'bg-red-100 text-red-700', text: 'text-red-700' };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Modulo1() {
  const router = useRouter();
  const [step, setStep] = useState<'quiz' | 'result'>('quiz');
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(12).fill(-1));
  const [resultado, setResultado] = useState<Modulo1Resultado | null>(null);
  const [justAnswered, setJustAnswered] = useState(false);

  useEffect(() => {
    const saved = storage.getModulo1Respuestas();
    if (saved && saved.length === 12) {
      setRespuestas(saved);
      const allAnswered = saved.every(v => v >= 0);
      if (allAnswered) {
        const res = storage.getModulo1Resultado();
        if (res) { setResultado(res); setStep('result'); }
      }
    }
  }, []);

  function handleSelect(value: number) {
    const updated = [...respuestas];
    updated[current] = value;
    setRespuestas(updated);
    storage.setModulo1Respuestas(updated);
    setJustAnswered(true);
  }

  function handleNext() {
    setJustAnswered(false);
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
    setJustAnswered(false);
    if (current > 0) setCurrent(current - 1);
  }

  function handleRetry() {
    const empty = new Array(12).fill(-1);
    setRespuestas(empty);
    setCurrent(0);
    setStep('quiz');
    setResultado(null);
    setJustAnswered(false);
    storage.setModulo1Respuestas(empty);
  }

  const answeredCount = respuestas.filter(v => v >= 0).length;
  const selected = respuestas[current];
  const pregunta = PREGUNTAS_M1[current];

  // Live stats
  const livePct = calcularPorcentajeParcial(respuestas);
  const liveNivel = getNivelLabel(livePct);
  const liveStyle = getNivelStyle(livePct);
  const liveInforme = generarInformeParcial(respuestas);
  const showLive = answeredCount > 0;

  // ── Final result screen ───────────────────────────────────────────────────
  if (step === 'result' && resultado) {
    const style = getNivelStyle(resultado.porcentaje ?? 0);
    return (
      <ModuleLayout moduleNumber={1} title="¿Necesitás un directorio?">
        <div className="space-y-4">
          {/* Main score */}
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Resultado final</p>
              <div className="flex items-end gap-3 mb-4">
                <span className={`text-5xl font-bold ${style.text}`}>{resultado.porcentaje}%</span>
                <span className={`mb-1.5 text-sm font-semibold px-3 py-1 rounded-full ${style.badge}`}>
                  {resultado.nivel}
                </span>
              </div>
              {/* Big bar */}
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${style.bar}`}
                  style={{ width: `${resultado.porcentaje}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>No urgente</span>
                <span>Necesidad urgente</span>
              </div>
            </div>

            {/* Informe */}
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Por qué lo necesitás</p>
              <p className="text-sm text-gray-700 leading-relaxed">{generarInformeParcial(resultado.scoresPorDimension ? respuestas : respuestas)}</p>
            </div>
          </div>

          {/* Dimension scores */}
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Por dimensión</p>
            <div className="space-y-3">
              {resultado.scoresPorDimension.map(dim => {
                const dimPct = Math.round((dim.score / dim.max) * 100);
                const ds = getNivelStyle(dimPct);
                return (
                  <div key={dim.nombre}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700 font-medium">{dim.nombre}</span>
                      <span className={`text-sm font-bold ${ds.text}`}>{dimPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${ds.bar}`} style={{ width: `${dimPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          {resultado.recomendaciones.length > 0 && (
            <div className="border border-gray-200 rounded-xl bg-white p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recomendaciones</p>
              <ul className="space-y-3">
                {resultado.recomendaciones.map((rec, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                    <span className="text-[#534AB7] font-bold shrink-0 mt-0.5">→</span>
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

  // ── Quiz screen ───────────────────────────────────────────────────────────
  return (
    <ModuleLayout moduleNumber={1} title="¿Necesitás un directorio?">
      {/* Overall progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{answeredCount} de 12 respondidas</span>
          <span>{Math.round((answeredCount / 12) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#534AB7] rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / 12) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden mb-4">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {current + 1}
            </span>
            <span className="text-xs text-gray-400">de 12</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{pregunta.texto}</p>
        </div>
        <div className="p-4 space-y-2">
          {pregunta.opciones.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors
                ${selected === opt.value
                  ? 'border-[#534AB7] bg-purple-50 text-[#534AB7] font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live result panel — shows after selecting an answer */}
      {showLive && (
        <div className={`border rounded-xl bg-white overflow-hidden mb-4 transition-all duration-300 ${justAnswered ? 'border-[#534AB7]/40 shadow-sm' : 'border-gray-200'}`}>
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Indicador en tiempo real</p>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${liveStyle.badge}`}>
                {liveNivel}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${liveStyle.text}`}>{livePct}%</span>
              <div className="flex-1">
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${liveStyle.bar}`}
                    style={{ width: `${livePct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                  <span>No urgente</span>
                  <span>Urgente</span>
                </div>
              </div>
            </div>
          </div>
          {liveInforme && (
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Análisis parcial</p>
              <p className="text-sm text-gray-600 leading-relaxed">{liveInforme}</p>
            </div>
          )}
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-300 italic">
              Basado en {answeredCount} de 12 respuestas · se actualiza con cada pregunta
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {current > 0 && (
          <button
            onClick={handlePrev}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ← Anterior
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={selected < 0}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors
            ${selected >= 0
              ? 'bg-[#534AB7] hover:bg-[#3C3489] text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          {current === 11 ? 'Ver resultado final →' : 'Siguiente →'}
        </button>
      </div>
    </ModuleLayout>
  );
}
