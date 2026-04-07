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
              transform={`rotate(-90 ${cx} ${cy})`} />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={size * 0.14} fontWeight="700" fill="#111827">{centerText}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={size * 0.065} fill="#9ca3af">{centerLabel}</text>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-1 rounded-lg hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="w-7 h-7 rounded-lg bg-[#534AB7] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900">Informe preliminar</span>
          <span className="text-xs text-gray-400 ml-auto">Módulos 1 y 2 completados</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="text-xl font-bold text-gray-900 mb-1">¿Tu empresa necesita un directorio?</h1>
          <p className="text-sm text-gray-400">Resultado consolidado de los módulos 1 y 2</p>
        </div>

        {/* Combined verdict */}
        <div className="border-2 rounded-xl p-6 text-center" style={{ borderColor: diagColor, backgroundColor: diagBg }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: diagColor }}>Diagnóstico preliminar</p>
          <p className="text-2xl font-bold" style={{ color: diagColor }}>{diagnostico}</p>
        </div>

        {/* Two donut charts side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* M1 — Nivel de necesidad */}
          <div className="border border-gray-200 rounded-xl bg-white p-5">
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
          <div className="border border-gray-200 rounded-xl bg-white p-5">
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
        <div className="border border-gray-200 rounded-xl bg-white p-5">
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
        <div className="border border-gray-200 rounded-xl bg-white p-5">
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
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Principales tensiones detectadas</p>
            <div className="space-y-3">
              {m2.tensiones.slice(0, 3).map(t => (
                <div key={t.pregunta} className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
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
        <div className="border border-gray-200 rounded-xl bg-white p-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Ahora que sabés que tu empresa se beneficiaría de un directorio, el siguiente paso es definir <strong>qué perfiles necesitás</strong>.
          </p>
          <button
            onClick={() => router.push('/modulo/3')}
            className="w-full py-3 px-4 bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Continuar — Definir perfiles del directorio →
          </button>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full py-2 text-gray-400 text-xs hover:text-gray-600 transition-colors"
        >
          Volver al inicio
        </button>
      </main>
    </div>
  );
}
