'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../../components/ui/ModuleLayout';
import { PREGUNTAS_M3, PERFILES, calcularModulo3, TOTAL_PREGUNTAS_M3, type PerfilKey, type NivelUrgencia } from '../../../../lib/diagnostico/modulo3';
import { storage } from '../../../../lib/storage/storage';
import type { Modulo3Resultado } from '../../../../types';

// ─── Urgency styles ───────────────────────────────────────────────────────────

const URGENCIA_STYLE: Record<NivelUrgencia, { badge: string; bar: string; border: string }> = {
  "Crítico":        { badge: "bg-red-100 text-red-700",        bar: "bg-red-400",      border: "border-red-200" },
  "Urgente":        { badge: "bg-orange-100 text-orange-700",  bar: "bg-orange-400",   border: "border-orange-200" },
  "Recomendado":    { badge: "bg-purple-100 text-[#534AB7]",   bar: "bg-[#534AB7]",    border: "border-purple-200" },
  "Complementario": { badge: "bg-gray-100 text-gray-500",      bar: "bg-gray-300",     border: "border-gray-200" },
};

const PERFIL_COLORS: Record<PerfilKey, string> = {
  estratega:   "#534AB7",
  financiero:  "#10B981",
  comercial:   "#F97316",
  operaciones: "#6BBF3B",
};

// ─── Horizontal bar chart ──────────────────────────────────────────────────────

function CompositionChart({ data }: { data: { key: PerfilKey; nombre: string; pct: number }[] }) {
  return (
    <div className="space-y-4">
      {/* Stacked horizontal bar */}
      <div className="w-full h-8 rounded-lg overflow-hidden flex">
        {data.map(({ key, nombre, pct }) => {
          if (pct === 0) return null;
          return (
            <div
              key={key}
              className="h-full flex items-center justify-center overflow-hidden"
              style={{ width: `${pct}%`, backgroundColor: PERFIL_COLORS[key] }}
            >
              {pct >= 15 && (
                <span className="text-xs font-semibold text-white truncate px-1">
                  {nombre.split(' ')[nombre.split(' ').length > 2 ? 2 : 0]} {pct}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Individual bars */}
      <div className="space-y-3">
        {data.map(({ key, nombre, pct }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PERFIL_COLORS[key] }} />
                <span className="text-sm text-gray-700 font-medium">{nombre}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: PERFIL_COLORS[key] }}>{pct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: PERFIL_COLORS[key] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile card ─────────────────────────────────────────────────────────────

function PerfilCard({ perfilKey, score, urgencia, justificacion, rank, pct }: {
  perfilKey: string; score: number; urgencia: string; justificacion: string; rank: number; pct: number;
}) {
  const [open, setOpen] = useState(rank === 1);
  const perfil = PERFILES[perfilKey as PerfilKey];
  const urg = urgencia as NivelUrgencia;
  const style = URGENCIA_STYLE[urg] ?? URGENCIA_STYLE["Complementario"];

  if (!perfil) return null;

  return (
    <div className={`border rounded-xl bg-white overflow-hidden ${style.border}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
          style={{ backgroundColor: perfil.colorBg, color: perfil.colorTexto }}
        >
          {perfil.icono}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{perfil.nombre}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>{urgencia}</span>
            <span className="text-xs font-bold" style={{ color: PERFIL_COLORS[perfilKey as PerfilKey] }}>{pct}%</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{perfil.independencia}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-gray-300">#{rank}</span>
          <svg
            className={`text-gray-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      <div className="px-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
              style={{ width: `${Math.min(100, Math.round((score / 20) * 100))}%` }} />
          </div>
          <span className="text-xs text-gray-400 font-medium shrink-0">Score {score}</span>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          <div className="px-5 py-3 flex gap-1.5 flex-wrap">
            {perfil.tags.map(t => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: perfil.colorBg, color: perfil.colorTexto }}>{t}</span>
            ))}
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Por qué lo necesitás</p>
            <p className="text-sm text-gray-700 leading-relaxed">{justificacion}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Experiencia requerida</p>
            <p className="text-sm text-gray-700">{perfil.anosExperiencia}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Formación típica</p>
            <p className="text-sm text-gray-700 leading-relaxed">{perfil.formacion}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Roles y cargos previos</p>
            <ul className="space-y-1.5">
              {perfil.rolesPrevios.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg className="shrink-0 mt-0.5" style={{ color: perfil.colorTexto }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Señal clave para identificarlo</p>
            <p className="text-sm text-gray-700 leading-relaxed">{perfil.senalClave}</p>
          </div>
          <div className="px-5 py-4" style={{ backgroundColor: perfil.colorBg }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: perfil.colorTexto }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: perfil.colorTexto }}>Advertencia — contexto argentino</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: perfil.colorTexto }}>{perfil.advertenciaArgentina}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Modulo3() {
  const router = useRouter();
  const [step, setStep] = useState<'quiz' | 'result'>('quiz');
  const [current, setCurrent] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(TOTAL_PREGUNTAS_M3).fill(-1));
  const [resultado, setResultado] = useState<Modulo3Resultado | null>(null);

  useEffect(() => {
    const saved = storage.getModulo3Respuestas();
    if (saved && saved.length === TOTAL_PREGUNTAS_M3 && saved.every(v => v >= 0)) {
      setRespuestas(saved);
      const res = storage.getModulo3Resultado();
      if (res) { setResultado(res); setStep('result'); }
    }
  }, []);

  function handleSelect(idx: number) {
    const updated = [...respuestas];
    updated[current] = idx;
    setRespuestas(updated);
    storage.setModulo3Respuestas(updated);
  }

  function handleNext() {
    if (current < TOTAL_PREGUNTAS_M3 - 1) {
      setCurrent(current + 1);
    } else {
      const res = calcularModulo3(respuestas);
      storage.setModulo3Resultado(res);
      setResultado(res);
      setStep('result');
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent(current - 1);
  }

  function handleRetry() {
    const empty = new Array(TOTAL_PREGUNTAS_M3).fill(-1);
    setRespuestas(empty);
    setCurrent(0);
    setStep('quiz');
    setResultado(null);
    storage.setModulo3Respuestas(empty);
  }

  const answeredCount = respuestas.filter(v => v >= 0).length;

  // ── Result ────────────────────────────────────────────────────────────────
  if (step === 'result' && resultado) {
    // Calculate percentages for pie chart
    const scores = resultado.scoresCompletos ?? {};
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    const pieData = resultado.topPerfiles.map(p => ({
      key: p.perfil as PerfilKey,
      nombre: PERFILES[p.perfil as PerfilKey]?.nombre ?? p.perfil,
      pct: Math.round((scores[p.perfil] ?? p.score) / totalScore * 100),
    }));

    return (
      <ModuleLayout moduleNumber={3} title="¿Qué perfiles necesitás?">
        <div className="space-y-4">

          {/* Composition chart */}
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Composición recomendada del directorio</p>
              <p className="text-sm text-gray-500">Porcentaje de relevancia de cada perfil según tu empresa.</p>
            </div>
            <div className="px-5 py-6">
              <CompositionChart data={pieData} />
            </div>
          </div>

          {/* Intro */}
          <div className="border border-gray-200 rounded-xl bg-white px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Perfiles detallados</p>
            <p className="text-sm text-gray-500">
              Expandí cada ficha para ver formación, cargos, experiencia y advertencias para el contexto argentino.
            </p>
          </div>

          {resultado.topPerfiles.map((p) => (
            <PerfilCard
              key={p.perfil}
              perfilKey={p.perfil}
              score={p.score}
              urgencia={p.urgencia}
              justificacion={p.justificacion ?? p.descripcion}
              rank={p.ranking ?? 1}
              pct={pieData.find(d => d.key === p.perfil)?.pct ?? 0}
            />
          ))}

          <div className="flex gap-3 pt-2">
            <button onClick={handleRetry} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              Rehacer
            </button>
            <button onClick={() => router.push('/modulo/4')} className="flex-1 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold">
              Módulo 4 →
            </button>
          </div>
          <button onClick={() => router.push('/dashboard')} className="w-full py-2.5 border border-[#534AB7] text-[#534AB7] rounded-xl text-sm font-medium hover:bg-purple-50">
            Ver dashboard
          </button>
        </div>
      </ModuleLayout>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  const pregunta = PREGUNTAS_M3[current];
  const selected = respuestas[current];

  return (
    <ModuleLayout moduleNumber={3} title="¿Qué perfiles necesitás?">
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{answeredCount} de {TOTAL_PREGUNTAS_M3} respondidas</span>
          <span>{Math.round((answeredCount / TOTAL_PREGUNTAS_M3) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#534AB7] rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / TOTAL_PREGUNTAS_M3) * 100}%` }} />
        </div>
      </div>

      {current === 0 && (
        <div className="border border-purple-100 bg-purple-50 rounded-xl px-5 py-4 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            Ya sabemos que tu empresa necesita un directorio. Ahora vamos a definir qué perfiles de directores serían más valiosos según las características de tu negocio. Son 15 preguntas.
          </p>
        </div>
      )}

      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden mb-4 shadow-sm">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {current + 1}
            </span>
            <span className="text-xs text-gray-400">de {TOTAL_PREGUNTAS_M3} · {pregunta.dimension}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-snug mb-2">{pregunta.texto}</p>
          {pregunta.aclaracion && (
            <p className="text-xs text-gray-400 leading-snug">{pregunta.aclaracion}</p>
          )}
        </div>
        <div className="p-4 space-y-2">
          {pregunta.opciones.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all hover:shadow-md transition-shadow
                ${selected === idx
                  ? 'border-[#534AB7] border-l-4 border-l-[#534AB7] bg-purple-50 text-[#534AB7] font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {opt.texto}
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
          {current === TOTAL_PREGUNTAS_M3 - 1 ? 'Ver perfiles →' : 'Siguiente →'}
        </button>
      </div>
    </ModuleLayout>
  );
}
