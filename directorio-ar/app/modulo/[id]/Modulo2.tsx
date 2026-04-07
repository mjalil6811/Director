'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import { SITUACIONES_M2, calcularModulo2 } from '../../../lib/modulo2';
import { storage } from '../../../lib/storage';
import type { Modulo2Resultado } from '../../../types';

const ROLE_LABEL: Record<string, string> = {
  A: 'Accionista',
  D: 'Director',
  G: 'Gerente',
  M: 'Los tres mezclados',
};

// How a board would handle each situation
const DIRECTORIO_EXPLICA: string[] = [
  'El directorio es el órgano que debe aprobar deuda significativa porque afecta el patrimonio de todos los accionistas. Es una decisión de gobierno, no operativa ni del CFO solo. Sin directorio, esta decisión queda en manos del dueño sin control ni contrapeso.',
  'Las contrataciones operativas son responsabilidad del gerente del área, dentro del presupuesto aprobado. Un directorio bien formado le da autonomía real a la gerencia para operar. Si el directorio o el dueño intervienen en cada contratación, paralizan la operación.',
  'El directorio es el órgano legitimado para resolver conflictos entre socios sobre decisiones estratégicas. Ni el socio mayoritario ni un consultor externo tienen la autoridad institucional para esto. El directorio delibera con independencia y decide.',
  'Las operaciones del día a día son responsabilidad del gerente — no del dueño ni del directorio. Si el equipo no puede resolver sin consultar arriba, hay un problema de delegación que un directorio detectaría y trabajaría con el CEO para resolverlo.',
  'Fijar la compensación del CEO es una de las funciones centrales del directorio, idealmente con datos de mercado como referencia. Si el CEO se fija su propio sueldo o lo fijan los accionistas directamente, hay un conflicto de interés evidente.',
  'Una adquisición es una decisión estratégica de alto impacto que requiere análisis formal. El directorio evalúa la oportunidad, pide due diligence financiera y legal, debate los riesgos y da la aprobación formal. Es exactamente para esto que existe.',
  'La cadena correcta es: el CEO presenta resultados al directorio, el directorio analiza y cuestiona, y luego informa a los accionistas. El gerente NO le rinde cuentas directamente a los accionistas — eso rompe la estructura de gobierno.',
  'El directorio es el único órgano que puede tomar esta decisión con independencia del dueño-fundador. Debe existir una política formal de ingreso de familiares. Sin directorio, esta decisión queda capturada por la emoción o el poder familiar.',
  'En una SA los directores tienen responsabilidad personal ante conflictos legales. El directorio aprueba la estrategia legal, autoriza acuerdos y protege a la empresa institucionalmente. No se delega únicamente al estudio jurídico.',
  'La distribución de dividendos es una decisión de los accionistas en asamblea, no del directorio ni de la gerencia ni del socio mayoritario solo. El directorio recomienda una política de dividendos; los accionistas la aprueban formalmente.',
];

// ─── Donut chart SVG ─────────────────────────────────────────────────────────

function DonutChart({ correct, total }: { correct: number; total: number }) {
  const incorrect = total - correct;
  const r = 42;
  const cx = 60;
  const cy = 60;
  const circ = 2 * Math.PI * r;
  const correctDash = (correct / total) * circ;
  const correctPct = Math.round((correct / total) * 100);

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="14" />
        {incorrect > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fca5a5" strokeWidth="14"
            strokeDasharray={`${(incorrect / total) * circ} ${circ}`}
            strokeDashoffset={-(correctDash)} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
        )}
        {correct > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4ade80" strokeWidth="14"
            strokeDasharray={`${correctDash} ${circ}`} strokeDashoffset={0}
            transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">{correctPct}%</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#9ca3af">correctas</text>
      </svg>
      <div className="flex gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-xs text-gray-500">{correct} correctas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <span className="text-xs text-gray-500">{incorrect} incorrectas</span>
        </div>
      </div>
    </div>
  );
}

// ─── Role distribution bars ───────────────────────────────────────────────────

function RoleBars({ conteos }: { conteos: Record<string, number> }) {
  const roles = [
    { key: 'D', label: 'Director', color: 'bg-[#534AB7]' },
    { key: 'G', label: 'Gerente', color: 'bg-blue-400' },
    { key: 'A', label: 'Accionista', color: 'bg-amber-400' },
    { key: 'M', label: 'Mezclados', color: 'bg-gray-300' },
  ];
  return (
    <div className="space-y-2.5">
      {roles.map(({ key, label, color }) => {
        const count = conteos[key] ?? 0;
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
    // Build review data from new structure
    const reviewData = respuestas.map((opIdx, i) => {
      const sit = SITUACIONES_M2[i];
      const elegidoRol = (opIdx >= 0 && opIdx < sit.opciones.length) ? sit.opciones[opIdx].rol : 'M';
      const correctoRol = sit.correcta;
      return { i, elegidoRol, correctoRol, isCorrect: elegidoRol === correctoRol, elegidoLabel: sit.opciones[opIdx]?.label ?? '?' };
    });
    const incorrectas = reviewData.filter(r => !r.isCorrect);

    return (
      <ModuleLayout moduleNumber={2} title="Clasificador de roles">
        <div className="space-y-4">

          {/* Score + donut */}
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Resultado</p>
              <div className="flex items-center gap-6">
                <DonutChart correct={resultado.score} total={10} />
                <div className="flex-1">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 mb-2">
                    {resultado.perfil}
                  </div>
                  <p className="text-sm text-gray-500 leading-snug">
                    Acertaste <strong className="text-gray-900">{resultado.score} de 10</strong> situaciones. El resto revela zonas donde los roles no están bien diferenciados.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Distribución de tus respuestas</p>
              <RoleBars conteos={resultado.conteos} />
            </div>
          </div>

          {/* Cómo el directorio te ayudaría */}
          {incorrectas.length > 0 && (
            <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Cómo un directorio resolvería esto</p>
                <p className="text-xs text-gray-400">Las {incorrectas.length} situaciones que no asignaste correctamente</p>
              </div>
              <div className="divide-y divide-gray-100">
                {incorrectas.map(({ i, elegidoRol, correctoRol, elegidoLabel }) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-500 leading-snug">{SITUACIONES_M2[i].texto}</p>
                    </div>
                    <div className="flex gap-2 mb-2.5 ml-8 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                        Dijiste: {elegidoLabel}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                        Correcto: {ROLE_LABEL[correctoRol]}
                      </span>
                    </div>
                    <div className="ml-8 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        </svg>
                        <span className="text-xs font-semibold text-[#534AB7]">El directorio</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{DIRECTORIO_EXPLICA[i]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {incorrectas.length === 0 && (
            <div className="border border-green-200 rounded-xl bg-green-50 p-5 text-center">
              <p className="text-sm font-semibold text-green-700 mb-1">¡Puntaje perfecto!</p>
              <p className="text-xs text-green-600">Tenés una comprensión clara de cómo se distribuyen los roles en un gobierno corporativo.</p>
            </div>
          )}

          {/* Full review */}
          <details className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <summary className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none">
              Ver revisión completa de respuestas
            </summary>
            <div className="px-4 pb-4 space-y-2">
              {reviewData.map(({ i, elegidoRol, correctoRol, isCorrect, elegidoLabel }) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border text-sm
                  ${isCorrect ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                  <span className={`font-bold shrink-0 text-xs mt-0.5 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                    {i + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 text-xs leading-snug mb-1.5">{SITUACIONES_M2[i].texto}</p>
                    <p className="text-gray-400 text-xs mb-1.5">{elegidoLabel}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {ROLE_LABEL[elegidoRol]}
                      </span>
                      {!isCorrect && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                          → {ROLE_LABEL[correctoRol]}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 mt-0.5 ${isCorrect ? 'text-green-500' : 'text-red-400'}`}>
                    {isCorrect ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    )}
                  </span>
                </div>
              ))}
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
    <ModuleLayout moduleNumber={2} title="Clasificador de roles">
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
