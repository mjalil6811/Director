'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import { SITUACIONES_M2, calcularModulo2 } from '../../../lib/modulo2';
import { storage } from '../../../lib/storage';
import type { Modulo2Resultado } from '../../../types';

const TIPO_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  concentrada: { bg: 'bg-red-100', text: 'text-red-700', dot: '#f87171' },
  parcial: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: '#fbbf24' },
  delegada: { bg: 'bg-green-100', text: 'text-green-700', dot: '#4ade80' },
  gris: { bg: 'bg-gray-200', text: 'text-gray-600', dot: '#9ca3af' },
};

const TIPO_LABEL: Record<string, string> = {
  concentrada: 'Concentrada en el dueño',
  parcial: 'Parcialmente delegada',
  delegada: 'Bien delegada',
  gris: 'Zona gris',
};

// ─── Donut chart SVG ─────────────────────────────────────────────────────────

function DonutChart({ conteos }: { conteos: { concentrada: number; parcial: number; delegada: number; gris: number } }) {
  const total = 10;
  const r = 42;
  const cx = 60;
  const cy = 60;
  const circ = 2 * Math.PI * r;
  const concentracionPct = Math.round(((conteos.concentrada + conteos.gris) / total) * 100);

  const segments = [
    { key: 'concentrada', count: conteos.concentrada, color: '#f87171' },
    { key: 'gris', count: conteos.gris, color: '#9ca3af' },
    { key: 'parcial', count: conteos.parcial, color: '#fbbf24' },
    { key: 'delegada', count: conteos.delegada, color: '#4ade80' },
  ];

  let offset = 0;
  const arcs = segments.filter(s => s.count > 0).map(s => {
    const dash = (s.count / total) * circ;
    const arc = { ...s, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="14" />
        {arcs.map(a => (
          <circle key={a.key} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth="14"
            strokeDasharray={`${a.dash} ${circ}`} strokeDashoffset={-a.offset}
            transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">{concentracionPct}%</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#9ca3af">concentración</text>
      </svg>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {segments.filter(s => s.count > 0).map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-gray-500">{s.count} {TIPO_LABEL[s.key]?.split(' ')[0]?.toLowerCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Distribution bars ───────────────────────────────────────────────────────

function DistributionBars({ conteos }: { conteos: { concentrada: number; parcial: number; delegada: number; gris: number } }) {
  const items = [
    { key: 'concentrada', label: 'Concentrada en el dueño', color: 'bg-red-400' },
    { key: 'parcial', label: 'Parcialmente delegada', color: 'bg-yellow-400' },
    { key: 'delegada', label: 'Bien delegada', color: 'bg-green-400' },
    { key: 'gris', label: 'Zona gris', color: 'bg-gray-300' },
  ] as const;
  return (
    <div className="space-y-2.5">
      {items.map(({ key, label, color }) => {
        const count = conteos[key];
        const pct = Math.round((count / 10) * 100);
        return (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 font-medium">{label}</span>
              <span className="text-gray-400">{count} ({pct}%)</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

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
      if (res) { setResultado(res); setStep('result'); }
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
    const empty = new Array(10).fill(-1);
    setRespuestas(empty);
    setCurrent(0);
    setStep('quiz');
    setResultado(null);
    storage.setModulo2Respuestas(empty);
  }

  const answeredCount = respuestas.filter(v => v >= 0).length;

  // ── Result screen ─────────────────────────────────────────────────────────
  if (step === 'result' && resultado) {
    const problemTensiones = resultado.tensiones;

    return (
      <ModuleLayout moduleNumber={2} title="Mapa de decisiones">
        <div className="space-y-4">

          {/* Score + donut */}
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mapa de tensiones</p>
              <div className="flex items-center gap-6">
                <DonutChart conteos={resultado.conteos} />
                <div className="flex-1">
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mb-2
                    ${resultado.porcentaje! >= 70 ? 'bg-red-100 text-red-700' :
                      resultado.porcentaje! >= 50 ? 'bg-orange-100 text-orange-700' :
                      resultado.porcentaje! >= 30 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-700'}`}>
                    {resultado.perfil}
                  </div>
                  <p className="text-sm text-gray-500 leading-snug">
                    Índice de concentración: <strong className="text-gray-900">{resultado.porcentaje}%</strong>
                  </p>
                  <p className="text-xs text-gray-400 mt-1 leading-snug">{resultado.nivel}</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Distribución de decisiones</p>
              <DistributionBars conteos={resultado.conteos} />
            </div>
          </div>

          {/* Beneficios del directorio */}
          {problemTensiones.length > 0 && (
            <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Qué cambiaría un directorio</p>
                <p className="text-xs text-gray-400">En las {problemTensiones.length} decisiones con problemas detectados</p>
              </div>
              <div className="divide-y divide-gray-100">
                {problemTensiones.map((t) => (
                  <div key={t.pregunta} className="px-5 py-4">
                    <div className="flex items-start gap-3 mb-2">
                      <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5
                        ${t.tipo === 'concentrada' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                        {t.pregunta}
                      </span>
                      <div>
                        <p className="text-xs text-gray-500 leading-snug">{SITUACIONES_M2[t.pregunta - 1].texto}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium
                          ${TIPO_COLORS[t.tipo]?.bg} ${TIPO_COLORS[t.tipo]?.text}`}>
                          {TIPO_LABEL[t.tipo]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-8 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        </svg>
                        <span className="text-xs font-semibold text-[#534AB7]">Con un directorio</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{t.beneficio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {problemTensiones.length === 0 && (
            <div className="border border-green-200 rounded-xl bg-green-50 p-5 text-center">
              <p className="text-sm font-semibold text-green-700 mb-1">Excelente nivel de delegación</p>
              <p className="text-xs text-green-600">Las decisiones de tu empresa están bien distribuidas. Un directorio consolidaría estas buenas prácticas.</p>
            </div>
          )}

          {/* Full review */}
          <details className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <summary className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none">
              Ver revisión completa de respuestas
            </summary>
            <div className="px-4 pb-4 space-y-2">
              {respuestas.map((opIdx, i) => {
                const sit = SITUACIONES_M2[i];
                const tipo = (opIdx >= 0 && opIdx < sit.opciones.length) ? sit.opciones[opIdx].tipo : 'gris';
                const isGood = tipo === 'delegada';
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border text-sm
                    ${isGood ? 'border-green-100 bg-green-50' :
                      tipo === 'concentrada' ? 'border-red-100 bg-red-50' :
                      tipo === 'gris' ? 'border-gray-200 bg-gray-50' :
                      'border-yellow-100 bg-yellow-50'}`}>
                    <span className={`font-bold shrink-0 text-xs mt-0.5
                      ${isGood ? 'text-green-600' : tipo === 'concentrada' ? 'text-red-500' : 'text-gray-500'}`}>
                      {i + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-xs leading-snug mb-1.5">{sit.texto}</p>
                      <p className="text-gray-400 text-xs mb-1.5">{sit.opciones[opIdx]?.label ?? '?'}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_COLORS[tipo]?.bg} ${TIPO_COLORS[tipo]?.text}`}>
                        {TIPO_LABEL[tipo]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </details>

          <div className="flex gap-3">
            <button onClick={handleRetry} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              Rehacer
            </button>
            <button onClick={() => router.push('/modulo/3')} className="flex-1 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold">
              Módulo 3 →
            </button>
          </div>
          <button onClick={() => router.push('/dashboard')} className="w-full py-2.5 border border-[#534AB7] text-[#534AB7] rounded-xl text-sm font-medium hover:bg-purple-50">
            Ver dashboard
          </button>
        </div>
      </ModuleLayout>
    );
  }

  // ── Quiz screen ───────────────────────────────────────────────────────────
  const sit = SITUACIONES_M2[current];
  const selected = respuestas[current];

  return (
    <ModuleLayout moduleNumber={2} title="Mapa de decisiones">
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{answeredCount} de 10 respondidas</span>
          <span>{Math.round((answeredCount / 10) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#534AB7] rounded-full transition-all duration-300" style={{ width: `${(answeredCount / 10) * 100}%` }} />
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden mb-4">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center shrink-0">{current + 1}</span>
            <span className="text-xs text-gray-400">de 10</span>
          </div>
          <p className="text-xs font-semibold text-[#534AB7] uppercase tracking-wider mb-2">¿Quién decide esto HOY en tu empresa?</p>
          <p className="text-sm font-semibold text-gray-900 leading-snug mb-2">{sit.texto}</p>
          {sit.aclaracion && (
            <p className="text-xs text-gray-400 leading-snug">{sit.aclaracion}</p>
          )}
        </div>
        <div className="p-4 space-y-2">
          {sit.opciones.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors
                ${selected === idx
                  ? 'border-[#534AB7] bg-purple-50 text-[#534AB7] font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {current > 0 && (
          <button onClick={handlePrev} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            ← Anterior
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={selected < 0}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors
            ${selected >= 0 ? 'bg-[#534AB7] hover:bg-[#3C3489] text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          {current === 9 ? 'Ver resultado →' : 'Siguiente →'}
        </button>
      </div>
    </ModuleLayout>
  );
}
