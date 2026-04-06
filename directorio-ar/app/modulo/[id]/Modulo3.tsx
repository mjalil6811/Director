'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import { PREGUNTAS_M3, PERFILES, calcularModulo3, type PerfilKey, type NivelUrgencia } from '../../../lib/modulo3';
import { storage } from '../../../lib/storage';
import type { Modulo3Resultado } from '../../../types';

// ─── Urgency styles ───────────────────────────────────────────────────────────

const URGENCIA_STYLE: Record<NivelUrgencia, { badge: string; bar: string; border: string }> = {
  "Crítico":        { badge: "bg-red-100 text-red-700",        bar: "bg-red-400",      border: "border-red-200" },
  "Urgente":        { badge: "bg-orange-100 text-orange-700",  bar: "bg-orange-400",   border: "border-orange-200" },
  "Recomendado":    { badge: "bg-purple-100 text-[#534AB7]",   bar: "bg-[#534AB7]",    border: "border-purple-200" },
  "Complementario": { badge: "bg-gray-100 text-gray-500",      bar: "bg-gray-300",     border: "border-gray-200" },
};

// ─── Profile card ─────────────────────────────────────────────────────────────

function PerfilCard({ perfilKey, score, urgencia, justificacion, rank }: {
  perfilKey: string; score: number; urgencia: string; justificacion: string; rank: number;
}) {
  const [open, setOpen] = useState(rank === 1);
  const perfil = PERFILES[perfilKey as PerfilKey];
  const urg = urgencia as NivelUrgencia;
  const style = URGENCIA_STYLE[urg] ?? URGENCIA_STYLE["Complementario"];

  if (!perfil) return null;

  return (
    <div className={`border rounded-xl bg-white overflow-hidden ${style.border}`}>

      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
          style={{ backgroundColor: perfil.colorBg, color: perfil.colorTexto }}
        >
          {perfil.icono}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{perfil.nombre}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
              {urgencia}
            </span>
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

      {/* Score bar */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
              style={{ width: `${Math.min(100, Math.round((score / 20) * 100))}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 font-medium shrink-0">Score {score}</span>
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">

          {/* Tags */}
          <div className="px-5 py-3 flex gap-1.5 flex-wrap">
            {perfil.tags.map(t => (
              <span
                key={t}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: perfil.colorBg, color: perfil.colorTexto }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Por qué lo necesitás */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Por qué lo necesitás</p>
            <p className="text-sm text-gray-700 leading-relaxed">{justificacion}</p>
          </div>

          {/* Experiencia */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Experiencia requerida</p>
            <p className="text-sm text-gray-700">{perfil.anosExperiencia}</p>
          </div>

          {/* Formación */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Formación típica</p>
            <p className="text-sm text-gray-700 leading-relaxed">{perfil.formacion}</p>
          </div>

          {/* Roles previos */}
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

          {/* Señal clave */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Señal clave para identificarlo</p>
            <p className="text-sm text-gray-700 leading-relaxed">{perfil.senalClave}</p>
          </div>

          {/* Advertencia argentina */}
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
  const [respuestas, setRespuestas] = useState<number[]>(new Array(15).fill(-1));
  const [resultado, setResultado] = useState<Modulo3Resultado | null>(null);

  useEffect(() => {
    const saved = storage.getModulo3Respuestas();
    if (saved && saved.length === 15 && saved.every(v => v >= 0)) {
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
    if (current < 14) {
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
    const empty = new Array(15).fill(-1);
    setRespuestas(empty);
    setCurrent(0);
    setStep('quiz');
    setResultado(null);
    storage.setModulo3Respuestas(empty);
  }

  const answeredCount = respuestas.filter(v => v >= 0).length;

  // ── Result ────────────────────────────────────────────────────────────────
  if (step === 'result' && resultado) {
    return (
      <ModuleLayout moduleNumber={3} title="¿Qué perfiles necesitás?">
        <div className="space-y-4">

          <div className="border border-gray-200 rounded-xl bg-white px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Perfiles recomendados</p>
            <p className="text-sm text-gray-500">
              Rankeados por prioridad. Expandí cada ficha para ver el perfil completo con formación, cargos y advertencias.
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
      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{answeredCount} de 15 respondidas</span>
          <span>{Math.round((answeredCount / 15) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#534AB7] rounded-full transition-all duration-300" style={{ width: `${(answeredCount / 15) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden mb-4">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {current + 1}
            </span>
            <span className="text-xs text-gray-400">de 15 · {pregunta.dimension}</span>
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
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors
                ${selected === idx
                  ? 'border-[#534AB7] bg-purple-50 text-[#534AB7] font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {opt.texto}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
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
          {current === 14 ? 'Ver perfiles →' : 'Siguiente →'}
        </button>
      </div>
    </ModuleLayout>
  );
}
