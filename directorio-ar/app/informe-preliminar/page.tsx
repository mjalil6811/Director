'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '../../lib/storage';
import { NIVELES, calcularNivel } from '../../lib/modulo1';
import type { Modulo1Resultado, Modulo2Resultado } from '../../types';

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ segments, centerText, centerLabel, size = 150 }: {
  segments: { value: number; color: string; label: string }[];
  centerText: string; centerLabel: string; size?: number;
}) {
  const r = size * 0.35;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const strokeW = size * 0.12;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeW} />
        {segments.filter(s => s.value > 0).map((s, i) => {
          const dash = (s.value / total) * circ;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={strokeW}
              strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-currentOffset}
              transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={size * 0.14} fontWeight="700" fill="#1A1D26">{centerText}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={size * 0.065} fill="#6B7280">{centerLabel}</text>
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
        {segments.filter(s => s.value > 0).map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-gray-500">{s.label}: <strong>{s.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Horizontal bar ───────────────────────────────────────────────────────────

function HBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InformePreliminar() {
  const router = useRouter();
  const [m1, setM1] = useState<Modulo1Resultado | null>(null);
  const [m2, setM2] = useState<Modulo2Resultado | null>(null);

  useEffect(() => {
    const r1 = storage.getModulo1Resultado();
    const r2 = storage.getModulo2Resultado();
    if (!r1 || !r2) { router.replace('/'); return; }
    setM1(r1);
    setM2(r2);
  }, [router]);

  if (!m1 || !m2) return null;

  const pct1 = m1.porcentaje ?? 0;
  const nivelKey = calcularNivel(pct1);
  const nivel = NIVELES[nivelKey];
  const concentracion = m2.porcentaje ?? 0;

  // Combined assessment
  let diagnostico: string;
  let diagColor: string;
  let diagBg: string;
  if (pct1 >= 55 && concentracion >= 50) {
    diagnostico = 'Altamente recomendado';
    diagColor = '#991B1B'; diagBg = '#FEE2E2';
  } else if (pct1 >= 30 || concentracion >= 30) {
    diagnostico = 'Recomendado con condiciones';
    diagColor = '#92400E'; diagBg = '#FEF3C7';
  } else {
    diagnostico = 'Evaluar más adelante';
    diagColor = '#166534'; diagBg = '#DCFCE7';
  }

  // Dimension data from M1
  const dims = (m1.scoresPorDimension ?? []).map(d => ({
    nombre: d.nombre,
    pct: Math.round((d.score / d.max) * 100),
  }));

  // M1 nivel color
  const nivelColor = nivelKey === 'prematuro' ? '#6B7280' : nivelKey === 'temprano' ? '#D97706' : nivelKey === 'transicion' ? '#534AB7' : '#DC2626';

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Gradient header bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#534AB7] via-[#7C6FDB] to-[#534AB7]" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-4 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/')} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] flex items-center justify-center shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900 tracking-tight">Informe preliminar</span>
          <span className="text-xs text-gray-400 ml-auto">Módulos 1 y 2 completados</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
            ¿Tu empresa necesita un{' '}
            <span className="bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] bg-clip-text text-transparent">directorio</span>?
          </h1>
          <p className="text-sm text-gray-400">Resultado consolidado de los módulos 1 y 2</p>
        </div>

        {/* Combined verdict */}
        <div className="border-2 rounded-2xl p-8 text-center shadow-sm" style={{ borderColor: diagColor, backgroundColor: diagBg }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: diagColor }}>Diagnóstico preliminar</p>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: diagColor }}>{diagnostico}</p>
        </div>

        {/* Educational box */}
        <div className="border border-[#E5E7EB] rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-[#534AB7] uppercase tracking-wider mb-3">¿Qué es un directorio y por qué importa?</p>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] flex items-center justify-center shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">Socio estratégico, no solo supervisor</p>
                <p className="text-xs text-gray-500 leading-relaxed">Un directorio moderno no se limita a controlar — actúa como socio estratégico del CEO, alternando entre liderar, acompañar y delegar según la situación.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] flex items-center justify-center shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">Preguntar antes de opinar</p>
                <p className="text-xs text-gray-500 leading-relaxed">Los mejores directorios practican la &quot;indagación antes que la recomendación&quot; — hacen las preguntas correctas antes de dar su opinión, lo que genera decisiones más sólidas.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] flex items-center justify-center shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">Equipo, no grupo de individuos</p>
                <p className="text-xs text-gray-500 leading-relaxed">La efectividad del directorio depende de cómo funciona como equipo — la diversidad de perfiles solo agrega valor si hay confianza, debate genuino y decisión colectiva.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two donut charts side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* M1 — Nivel de necesidad */}
          <div className="border border-[#E5E7EB] rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">Nivel de necesidad</p>
            <DonutChart
              segments={[
                { value: pct1, color: nivelColor, label: 'Score' },
                { value: 100 - pct1, color: '#f3f4f6', label: 'Restante' },
              ]}
              centerText={`${pct1}%`}
              centerLabel={nivel.label}
            />
          </div>

          {/* M2 — Concentración de decisiones */}
          <div className="border border-[#E5E7EB] rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">Concentración de decisiones</p>
            <DonutChart
              segments={[
                { value: m2.conteos.concentrada, color: '#f87171', label: 'Concentrada' },
                { value: m2.conteos.gris, color: '#9ca3af', label: 'Zona gris' },
                { value: m2.conteos.parcial, color: '#fbbf24', label: 'Parcial' },
                { value: m2.conteos.delegada, color: '#4ade80', label: 'Delegada' },
              ]}
              centerText={`${concentracion}%`}
              centerLabel="concentración"
            />
          </div>
        </div>

        {/* M1 dimensions as bars */}
        <div className="border border-[#E5E7EB] rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Detalle por dimensión</p>
          <div className="space-y-3">
            {dims.map(d => (
              <HBar
                key={d.nombre}
                label={d.nombre}
                pct={d.pct}
                color={d.pct >= 60 ? '#DC2626' : d.pct >= 40 ? '#D97706' : '#6B7280'}
              />
            ))}
          </div>
        </div>

        {/* M2 decision distribution bars */}
        <div className="border border-[#E5E7EB] rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Distribución de decisiones</p>
          <div className="space-y-3">
            <HBar label="Concentrada en el dueño" pct={Math.round((m2.conteos.concentrada / 10) * 100)} color="#f87171" />
            <HBar label="Parcialmente delegada" pct={Math.round((m2.conteos.parcial / 10) * 100)} color="#fbbf24" />
            <HBar label="Bien delegada" pct={Math.round((m2.conteos.delegada / 10) * 100)} color="#4ade80" />
            <HBar label="Zona gris (sin responsable claro)" pct={Math.round((m2.conteos.gris / 10) * 100)} color="#9ca3af" />
          </div>
        </div>

        {/* Top 3 tensions */}
        {m2.tensiones.length > 0 && (
          <div className="border border-[#E5E7EB] rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Principales tensiones detectadas</p>
            <div className="space-y-3">
              {m2.tensiones.slice(0, 3).map(t => (
                <div key={t.pregunta} className="flex items-start gap-3 p-3 rounded-xl bg-[#EEEDFE] border border-[#DDD9FE]">
                  <span className="w-5 h-5 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {t.pregunta}
                  </span>
                  <p className="text-xs text-gray-600 leading-snug">{t.beneficio}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="border border-[#E5E7EB] rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500 mb-4">
            Ahora que sabés que tu empresa se beneficiaría de un directorio, el siguiente paso es definir <strong>qué perfiles necesitás</strong>.
          </p>
          <button
            onClick={() => router.push('/modulo/3')}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#534AB7] to-[#6359C7] hover:from-[#3C3489] hover:to-[#534AB7] text-white font-semibold rounded-xl shadow-sm hover:shadow-md text-sm"
          >
            Continuar — Definir perfiles del directorio →
          </button>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full py-2 text-gray-400 text-xs hover:text-gray-600"
        >
          Volver al inicio
        </button>

        {/* Powered by footer */}
        <div className="text-center pt-4 pb-2 border-t border-gray-100">
          <p className="text-xs text-gray-300 font-medium tracking-wide">Directorio AR · Gobierno Corporativo</p>
        </div>
      </main>
    </div>
  );
}
