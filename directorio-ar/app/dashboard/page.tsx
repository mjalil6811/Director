'use client';

import PageHeader from '../../components/PageHeader';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '../../lib/storage';
import { ScoreGauge, GovernanceRadar, RankedBars } from '../../components/charts';
import { calcularIndicePreparacion, ETIQUETA_CORTA, BENCHMARKS, REFERENCIA_RADAR } from '../../lib/indice';
import type {
  Modulo1Resultado,
  Modulo2Resultado,
  Modulo3Resultado,
  Modulo4Diagnostico,
  Modulo5Resultado,
} from '../../types';

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

// ——— Page ———————————————————————————————————————————————————————————————————

export default function IndicePreparacionPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-gray-400 text-sm">Calculando índice...</div>
    </div>
  );

  const gs = calcularIndicePreparacion(m1, m2, m3, m4diag, m5);
  const fecha = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });

  // Próximos pasos personalizados
  const weakDims = gs.dimensiones
    .filter(d => d.tieneDatos && d.score < 50)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  const dimsConDatos = gs.dimensiones.filter(d => d.tieneDatos);
  const pendientes = gs.dimensiones.filter(d => !d.tieneDatos);

  return (
    <div className="min-h-screen bg-surface flex flex-col">

      {/* Header */}
      <PageHeader
        titulo="Índice de preparación"
        onBack={() => router.back()}
        right={<>
{nombre && <span className="text-xs text-gray-400 font-medium">{nombre}</span>}
        </>}
      />

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
            Qué tan preparada está tu empresa para decidir con respaldo
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
          {pendientes.length > 0 && (
            <p className="text-xs text-gray-600 mt-3 bg-white/70 rounded-lg px-3 py-2 inline-block">
              Índice parcial: calculado con {gs.completadas} de 5 dimensiones.{' '}
              <button onClick={() => router.push(`/modulo/${pendientes[0].modulo}`)} className="font-semibold text-brand hover:underline">
                Completar {pendientes[0].fuente} →
              </button>
            </p>
          )}
        </div>

        {/* Radar chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">
            Perfil de tu empresa
          </p>
          <p className="text-xs text-gray-400 text-center -mt-3 mb-2">Tu empresa en cada dimensión (0–100) vs. una empresa mediana con directorio</p>
          {dimsConDatos.length >= 3 ? (
            <GovernanceRadar
              data={dimsConDatos.map(d => ({ label: ETIQUETA_CORTA[d.id] ?? d.label, score: d.score }))}
              referencia={REFERENCIA_RADAR.valor}
              referenciaLabel={REFERENCIA_RADAR.label}
            />
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-500">El perfil se dibuja con al menos 3 dimensiones evaluadas.</p>
              <p className="text-xs text-gray-400 mt-1">Llevás {dimsConDatos.length} de 5. Te faltan: {pendientes.map(d => ETIQUETA_CORTA[d.id]).join(', ')}.</p>
            </div>
          )}
        </div>

        {/* 5 dimensions */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Las 5 dimensiones</p>
          </div>
          <div className="divide-y divide-gray-100">
            {gs.dimensiones.map(d => {
              if (!d.tieneDatos) {
                return (
                  <div key={d.id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 opacity-60">
                      <span className="text-base">{d.icono}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{d.label}</p>
                        <p className="text-xs text-gray-400">{d.fuente} · sin datos todavía</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/modulo/${d.modulo}`)}
                      className="text-xs font-semibold text-brand border border-brand-100 bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100 shrink-0"
                    >
                      Completar →
                    </button>
                  </div>
                );
              }
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
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            ¿Cómo estás frente a otras empresas?
          </p>
          <p className="text-xs text-gray-500 -mt-2 mb-4 leading-relaxed">
            Referencias: arquetipos de empresas argentinas definidos por Directorio AR a partir de criterios de gobierno corporativo. No es una muestra estadística.
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
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Dónde mejorar primero
              </p>
            </div>
            <div className="p-4 space-y-3">
              {weakDims.map((d, i) => (
                <div key={d.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-gray-200">
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
                        router.push(`/modulo/${d.modulo}`);
                      }}
                      className="mt-2 text-xs text-brand font-semibold hover:underline"
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
                  ? `${nombre || 'Tu empresa'} ya decide con un respaldo sólido. Las estructuras de decisión, composición del directorio y dinámica con la gerencia muestran madurez real. El foco ahora debe estar en mantener y evolucionar las prácticas, no solo en instalarlas.`
                  : gs.total >= 55
                  ? `${nombre || 'Tu empresa'} está construyendo una forma más ordenada de decidir. Hay avances reales, pero quedan brechas que si no se resuelven limitan la escala y el acceso a capital. El momento de actuar es ahora, antes de que la complejidad supere la estructura.`
                  : gs.total >= 35
                  ? `${nombre || 'Tu empresa'} está en una etapa inicial de profesionalización de sus decisiones. Las condiciones están dadas para avanzar, pero requiere decisiones concretas: definir perfiles, distribuir decisiones y construir la disposición interna al cambio.`
                  : `${nombre || 'Tu empresa'} todavía concentra las decisiones en pocas personas. No es una crítica — la mayoría de las empresas argentinas están en este punto. El primer paso es construir consciencia sobre qué decisiones son estratégicas y cuáles operativas, antes de instalar estructuras formales.`
                }
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {gs.completadas < 5
                  ? `Este índice está basado en ${gs.completadas} de 5 dimensiones evaluadas. Al completar todos los módulos, el diagnóstico será más preciso y las recomendaciones más específicas.`
                  : 'El índice integra 5 dimensiones, ponderadas según su impacto real en la efectividad del directorio y la toma de decisiones.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Nota sobre uso del score */}
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">
            ¿Para qué sirve este índice?
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            El Índice de preparación muestra qué tan lista está tu empresa para decidir con el respaldo de un consejo asesor o directorio, pensado para empresas argentinas. Puede usarse como referencia ante inversores, fondos de PE, SGRs o socios estratégicos que evalúan la solidez institucional de una empresa antes de comprometer capital o alianzas.
          </p>
        </div>

        {/* Fase 2: Constitución del directorio */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fase 2 — Constitución del directorio</p>
            <p className="text-xs text-gray-400 mt-1">Herramientas para pasar del diagnóstico a la acción.</p>
          </div>
          <div className="p-4 space-y-2">
            {[
              { href: '/fase2/acta-constitutiva', label: 'Acta constitutiva', desc: 'Redactá el acta de constitución del directorio', icon: '📄' },
              { href: '/fase2/protocolo', label: 'Protocolo de familia / socios', desc: 'Armá el protocolo con las cláusulas que necesitás', icon: '🤝' },
              { href: '/fase2/reunion', label: 'Reuniones del directorio', desc: 'Planificá y documentá las reuniones del directorio', icon: '📋' },
            ].map(item => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-brand hover:bg-[#FDFCFF] transition-colors text-left"
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
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-white bg-white/50"
          >
            Ver resultado completo
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-semibold"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    </div>
  );
}
