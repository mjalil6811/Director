'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '../../lib/storage';
import { ScoreGauge, GovernanceRadar, RankedBars } from '../../components/charts';
import type {
  Modulo1Resultado,
  Modulo2Resultado,
  Modulo3Resultado,
  Modulo4Diagnostico,
  Modulo5Resultado,
} from '../../types';

// ——— Score engine ————————————————————————————————————————————————————————————

interface DimensionScore {
  id: string;
  label: string;
  descripcion: string;
  score: number;       // 0–100
  nivel: string;
  icono: string;
  fuente: string;
}

interface GovernanceScore {
  total: number;       // 0–100
  nivel: string;
  etiqueta: string;
  color: string;
  colorBg: string;
  dimensiones: DimensionScore[];
  completadas: number; // cuántas dimensiones tienen data
}

function calcularGovernanceScore(
  m1: Modulo1Resultado | null,
  m2: Modulo2Resultado | null,
  m3: Modulo3Resultado | null,
  m4diag: Modulo4Diagnostico | null,
  m5: Modulo5Resultado | null,
): GovernanceScore {
  const dims: DimensionScore[] = [];
  let completadas = 0;

  // D1 — Necesidad de directorio (M1)
  // A mayor necesidad detectada y mayor complejidad, mayor madurez implícita
  const d1score = m1 ? Math.min(100, m1.porcentaje ?? 0) : 0;
  dims.push({
    id: 'necesidad',
    label: 'Complejidad organizacional',
    descripcion: 'Nivel de complejidad y madurez que justifica un directorio formal.',
    score: d1score,
    nivel: d1score >= 75 ? 'Alta' : d1score >= 50 ? 'Media-alta' : d1score >= 30 ? 'Media' : 'Baja',
    icono: '🏛',
    fuente: 'Módulo 1',
  });
  if (m1) completadas++;

  // D2 — Distribución de decisiones (M2)
  // Más delegación = más madurez. Score invertido: menos concentración = mejor.
  const d2raw = m2 ? (m2.porcentaje ?? 0) : 0;
  const d2score = m2 ? Math.max(0, 100 - d2raw) : 0;
  dims.push({
    id: 'decisiones',
    label: 'Distribución de decisiones',
    descripcion: 'Grado en que las decisiones estratégicas están bien delegadas y no concentradas en una sola persona.',
    score: d2score,
    nivel: d2score >= 70 ? 'Saludable' : d2score >= 45 ? 'En desarrollo' : d2score >= 20 ? 'Concentrada' : 'Muy concentrada',
    icono: '⚖',
    fuente: 'Módulo 2',
  });
  if (m2) completadas++;

  // D3 — Composición del directorio (M3)
  // Basado en la urgencia del perfil más crítico (indicador inverso de brechas)
  let d3score = 0;
  if (m3) {
    const topUrgencia = m3.topPerfiles[0]?.urgencia ?? '';
    if (topUrgencia === 'Crítico') d3score = 20;
    else if (topUrgencia === 'Urgente') d3score = 45;
    else d3score = 70;
  }
  dims.push({
    id: 'composicion',
    label: 'Composición y perfiles',
    descripcion: 'Adecuación de los perfiles existentes o planificados para las necesidades estratégicas de la empresa.',
    score: d3score,
    nivel: d3score >= 65 ? 'Adecuada' : d3score >= 40 ? 'Con brechas' : 'Crítica',
    icono: '👥',
    fuente: 'Módulo 3',
  });
  if (m3) completadas++;

  // D4 — Disposición al cambio (M4)
  const d4score = m4diag ? (m4diag.porcentaje ?? 0) : 0;
  dims.push({
    id: 'disposicion',
    label: 'Disposición al gobierno',
    descripcion: 'Voluntad real del CEO y la organización de operar bajo una estructura de gobierno corporativo.',
    score: d4score,
    nivel: d4score >= 80 ? 'Alta' : d4score >= 50 ? 'Moderada' : 'Baja',
    icono: '🎯',
    fuente: 'Módulo 4',
  });
  if (m4diag) completadas++;

  // D5 — Dinámica directorio-gerencia (M5)
  const d5score = m5 ? (m5.porcentaje ?? 0) : 0;
  dims.push({
    id: 'dinamica',
    label: 'Dinámica directorio-gerencia',
    descripcion: 'Calidad de la relación operativa entre el directorio y la gerencia: información, autonomía y evaluación mutua.',
    score: d5score,
    nivel: d5score >= 75 ? 'Sana' : d5score >= 50 ? 'En construcción' : d5score >= 25 ? 'Con tensiones' : 'Crítica',
    icono: '🔄',
    fuente: 'Módulo 5',
  });
  if (m5) completadas++;

  // Score total ponderado
  // Pesos: necesidad 15%, decisiones 25%, composición 20%, disposición 20%, dinámica 20%
  const pesos = [0.15, 0.25, 0.20, 0.20, 0.20];
  const totalPonderado = dims.reduce((acc, d, i) => acc + d.score * pesos[i], 0);
  const ajuste = completadas > 0 ? totalPonderado / (pesos.slice(0, completadas).reduce((a, b) => a + b, 0)) : 0;
  const total = Math.round(Math.min(100, ajuste));

  let nivel: string;
  let etiqueta: string;
  let color: string;
  let colorBg: string;

  if (total >= 75) {
    nivel = 'Avanzado';
    etiqueta = 'Gobierno corporativo maduro';
    color = '#0F6E56';
    colorBg = '#E1F5EE';
  } else if (total >= 55) {
    nivel = 'Intermedio';
    etiqueta = 'Gobierno en desarrollo';
    color = '#534AB7';
    colorBg = '#EEEDFE';
  } else if (total >= 35) {
    nivel = 'Inicial';
    etiqueta = 'Bases de gobierno en construcción';
    color = '#854F0B';
    colorBg = '#FAEEDA';
  } else {
    nivel = 'Incipiente';
    etiqueta = 'Gobierno corporativo por formalizar';
    color = '#A32D2D';
    colorBg = '#FCEBEB';
  }

  return { total, nivel, etiqueta, color, colorBg, dimensiones: dims, completadas };
}

const ETIQUETA_CORTA: Record<string, string> = {
  necesidad: 'Complejidad',
  decisiones: 'Decisiones',
  composicion: 'Perfiles',
  disposicion: 'Disposición',
  dinamica: 'Dinámica',
};

// ——— Score bar ——————————————————————————————————————————————————————————————

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ——— Benchmark ——————————————————————————————————————————————————————————————

const BENCHMARKS = [
  { key: 'pyme', label: 'PyME familiar sin directorio', score: 18 },
  { key: 'advisory', label: 'PyME con advisory board', score: 38 },
  { key: 'mediana', label: 'Empresa mediana con directorio', score: 62 },
  { key: 'madura', label: 'Empresa con gobierno maduro', score: 84 },
];

// ——— Page ———————————————————————————————————————————————————————————————————

export default function GovernanceScorePage() {
  const router = useRouter();
  const [m1, setM1] = useState<Modulo1Resultado | null>(null);
  const [m2, setM2] = useState<Modulo2Resultado | null>(null);
  const [m3, setM3] = useState<Modulo3Resultado | null>(null);
  const [m4diag, setM4diag] = useState<Modulo4Diagnostico | null>(null);
  const [m5, setM5] = useState<Modulo5Resultado | null>(null);
  const [nombre, setNombre] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const r1 = storage.getModulo1Resultado();
    if (!r1) { router.replace('/'); return; }
    setM1(r1);
    setM2(storage.getModulo2Resultado());
    setM3(storage.getModulo3Resultado());
    setM4diag(storage.getModulo4Diagnostico());
    setM5(storage.getModulo5Resultado());
    setNombre(storage.getEmpresaNombre() ?? '');
    setReady(true);
  }, [router]);

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
      <div className="text-gray-400 text-sm">Calculando score...</div>
    </div>
  );

  const gs = calcularGovernanceScore(m1, m2, m3, m4diag, m5);
  const fecha = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });

  // Próximos pasos personalizados
  const weakDims = gs.dimensiones
    .filter(d => d.score < 50)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-3 flex items-center gap-3 sticky top-14 z-20">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </button>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] flex items-center justify-center shadow-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <span className="text-sm font-bold text-gray-900 tracking-tight">Governance Score</span>
        {nombre && <span className="text-xs text-gray-400 ml-auto font-medium">{nombre}</span>}
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">

        {/* Hero Score */}
        <div
          className="rounded-2xl px-6 pt-6 pb-7 text-center border"
          style={{ backgroundColor: gs.colorBg, borderColor: gs.color + '40' }}
        >
          {nombre && (
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: gs.color }}>
              {nombre}
            </p>
          )}
          <p className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-500">
            Índice de madurez de gobierno corporativo
          </p>
          <ScoreGauge value={gs.total} color={gs.color} />
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-3"
            style={{ backgroundColor: gs.color + '18', color: gs.color }}
          >
            <span>{gs.nivel}</span>
            <span>·</span>
            <span>{gs.etiqueta}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">{fecha} · {gs.completadas}/5 módulos completados</p>
        </div>

        {/* Radar chart */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">
            Perfil de gobierno corporativo
          </p>
          <p className="text-xs text-gray-400 text-center -mt-3 mb-2">Tu empresa en cada dimensión (0–100) vs. una empresa mediana con directorio</p>
          <GovernanceRadar
            data={gs.dimensiones.map(d => ({ label: ETIQUETA_CORTA[d.id] ?? d.label, score: d.score }))}
            referencia={62}
            referenciaLabel="Empresa mediana con directorio"
          />
        </div>

        {/* 5 dimensions */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Las 5 dimensiones</p>
          </div>
          <div className="divide-y divide-gray-100">
            {gs.dimensiones.map(d => {
              const dimColor = d.score >= 70 ? '#0F6E56' : d.score >= 45 ? '#534AB7' : d.score >= 20 ? '#854F0B' : '#A32D2D';
              return (
                <div key={d.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{d.icono}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{d.label}</p>
                        <p className="text-xs text-gray-400">{d.fuente}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold" style={{ color: dimColor }}>{d.score}</p>
                      <p className="text-xs" style={{ color: dimColor }}>{d.nivel}</p>
                    </div>
                  </div>
                  <ScoreBar score={d.score} color={dimColor} />
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{d.descripcion}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benchmark */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Benchmark — ¿Cómo estás vs el mercado?
          </p>
          <RankedBars
            items={[
              ...BENCHMARKS.map(b => ({ key: b.key, label: b.label, value: b.score })),
              { key: 'tu', label: nombre || 'Tu empresa', value: gs.total },
            ]}
            highlightKey="tu"
          />
        </div>

        {/* Próximos pasos priorizados */}
        {weakDims.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Dónde mejorar primero
              </p>
            </div>
            <div className="p-4 space-y-3">
              {weakDims.map((d, i) => (
                <div key={d.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#FAFBFC] border border-[#E5E7EB]">
                  <div
                    className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: '#534AB7' }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {d.icono} {d.label} — {d.score}/100
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{d.descripcion}</p>
                    <button
                      onClick={() => {
                        const modNum = d.fuente.replace('Módulo ', '');
                        router.push(`/modulo/${modNum}`);
                      }}
                      className="mt-2 text-xs text-[#534AB7] font-semibold hover:underline"
                    >
                      Ir a {d.fuente} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnóstico narrativo */}
        <div className="border rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: gs.color + '40' }}>
          <div className="px-5 pt-5 pb-4 border-l-4" style={{ borderLeftColor: gs.color, backgroundColor: gs.colorBg + '80' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: gs.color }}>
              Diagnóstico de madurez
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {gs.total >= 75
                  ? `${nombre || 'Tu empresa'} opera con un nivel de gobierno corporativo avanzado. Las estructuras de decisión, composición del directorio y dinámica con la gerencia muestran madurez real. El foco ahora debe estar en mantener y evolucionar las prácticas, no solo en instalarlas.`
                  : gs.total >= 55
                  ? `${nombre || 'Tu empresa'} tiene las bases del gobierno corporativo en construcción. Hay avances reales, pero quedan brechas que si no se resuelven limitan la escala y el acceso a capital. El momento de actuar es ahora, antes de que la complejidad supere la estructura.`
                  : gs.total >= 35
                  ? `${nombre || 'Tu empresa'} está en una etapa inicial de profesionalización del gobierno. Las condiciones están dadas para avanzar, pero requiere decisiones concretas: definir perfiles, distribuir decisiones y construir la disposición interna al cambio.`
                  : `${nombre || 'Tu empresa'} tiene el gobierno corporativo por formalizar. No es una crítica — la mayoría de las empresas argentinas están en este punto. El primer paso es construir consciencia sobre qué decisiones son estratégicas y cuáles operativas, antes de instalar estructuras formales.`
                }
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {gs.completadas < 5
                  ? `Este score está basado en ${gs.completadas} de 5 dimensiones evaluadas. Al completar todos los módulos, el diagnóstico será más preciso y las recomendaciones más específicas.`
                  : 'El score integra las 5 dimensiones del gobierno corporativo, ponderadas según su impacto real en la efectividad del directorio y la toma de decisiones.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Nota sobre uso del score */}
        <div className="bg-[#EEEDFE] border border-[#DDD9FE] rounded-2xl p-5">
          <p className="text-xs font-semibold text-[#534AB7] uppercase tracking-wider mb-2">
            ¿Para qué sirve este score?
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            El Governance Score es un indicador de madurez de gobierno corporativo diseñado para el contexto de empresas argentinas. Puede usarse como referencia ante inversores, fondos de PE, SGRs o socios estratégicos que evalúan la solidez institucional de una empresa antes de comprometer capital o alianzas.
          </p>
        </div>

        {/* Fase 2: Constitución del directorio */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fase 2 — Constitución del directorio</p>
            <p className="text-xs text-gray-400 mt-1">Herramientas para pasar del diagnóstico a la acción.</p>
          </div>
          <div className="p-4 space-y-2">
            {[
              { href: '/fase2/acta-constitutiva', label: 'Acta constitutiva', desc: 'Redactá el acta de constitución del directorio', icon: '📄' },
              { href: '/fase2/protocolo', label: 'Protocolo de familia / socios', desc: 'Armá el protocolo con las cláusulas que necesitás', icon: '🤝' },
              { href: '/fase2/reunion', label: 'Reuniones del directorio', desc: 'Planificá y documentá las reuniones del board', icon: '📋' },
            ].map(item => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#E5E7EB] hover:border-[#534AB7] hover:bg-[#FDFCFF] transition-colors text-left"
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pb-4">
          <button
            onClick={() => router.push('/resultado')}
            className="flex-1 py-3 border border-[#E5E7EB] rounded-xl text-sm font-medium text-gray-600 hover:bg-white bg-white/50"
          >
            Ver resultado completo
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    </div>
  );
}
