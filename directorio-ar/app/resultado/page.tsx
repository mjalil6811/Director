'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '../../lib/storage';
import type { Modulo1Resultado, Modulo2Resultado, Modulo3Resultado, Modulo4Diagnostico } from '../../types';

const PERFIL_LABELS: Record<string, string> = {
  estratega: "Estratega de negocio",
  financiero: "Director Financiero",
  comercial: "Director Comercial",
  operaciones: "Director de Operaciones",
  familiar: "Familiar",
  sector: "Experto sectorial",
  legal: "Legal",
  rrhh: "RRHH",
  digital: "Digital",
  inversor: "Inversor",
  control: "Control",
  crisis: "Crisis",
};

const PERFIL_JUSTIFICACIONES: Record<string, string> = {
  estratega: "Aporta vision de largo plazo, lectura del mercado y experiencia en decisiones complejas bajo incertidumbre.",
  financiero: "Aporta rigor en la lectura de los numeros, estructura para decisiones financieras y dialogo con bancos e inversores.",
  comercial: "Aporta vision del mercado desde el lado de los ingresos: como crecer, posicionarse y retener clientes clave.",
  operaciones: "Aporta experiencia en escalar procesos, estructurar la organizacion interna y hacer que la empresa funcione ordenadamente.",
};

// ─── Donut chart for M2 ─────────────────────────────────────────────────────

function DonutChart({ conteos }: { conteos: { concentrada: number; parcial: number; delegada: number; gris: number } }) {
  const total = 10;
  const r = 42;
  const cx = 60;
  const cy = 60;
  const circ = 2 * Math.PI * r;
  const concentracionPct = Math.round(((conteos.concentrada + conteos.gris) / total) * 100);

  const segments = [
    { key: 'concentrada', label: 'Concentrada', count: conteos.concentrada, color: '#f87171' },
    { key: 'gris', label: 'Zona gris', count: conteos.gris, color: '#9ca3af' },
    { key: 'parcial', label: 'Parcial', count: conteos.parcial, color: '#fbbf24' },
    { key: 'delegada', label: 'Delegada', count: conteos.delegada, color: '#4ade80' },
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
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#9ca3af">concentracion</text>
      </svg>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {segments.filter(s => s.count > 0).map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-gray-500">{s.count} {s.label.toLowerCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultadoPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [m1, setM1] = useState<Modulo1Resultado | null>(null);
  const [m2, setM2] = useState<Modulo2Resultado | null>(null);
  const [m3, setM3] = useState<Modulo3Resultado | null>(null);
  const [m4freq, setM4freq] = useState<string | null>(null);
  const [m4diag, setM4diag] = useState<Modulo4Diagnostico | null>(null);
  const [nombre, setNombre] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const r1 = storage.getModulo1Resultado();
    const r2 = storage.getModulo2Resultado();
    const r3 = storage.getModulo3Resultado();
    const r4f = storage.getModulo4Frecuencia();
    const r4d = storage.getModulo4Diagnostico();

    if (!r1 || !r2 || !r3 || (!r4f && !r4d)) {
      router.replace('/');
      return;
    }

    setM1(r1);
    setM2(r2);
    setM3(r3);
    setM4freq(r4f);
    setM4diag(r4d);
    setNombre(storage.getEmpresaNombre() ?? '');
    setReady(true);
  }, [router]);

  async function handleGeneratePDF() {
    setPdfLoading(true);
    try {
      const { generatePDF } = await import('../../components/PDFReport');
      const fecha = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
      const blob = await generatePDF({ empresa: nombre, m1, m2, m3, m4frecuencia: m4freq, m4diagnostico: m4diag, fecha });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `directorio-ar-diagnostico${nombre ? `-${nombre.replace(/\s+/g, '-').toLowerCase()}` : ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Error al generar el PDF. Por favor, intenta de nuevo.');
    } finally {
      setPdfLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    );
  }

  // ─── Derive insights ──────────────────────────────────────────────────────

  const m1Pct = m1?.porcentaje ?? 0;
  const m2Conteos = m2?.conteos ?? { concentrada: 0, parcial: 0, delegada: 0, gris: 0 };
  const m2Pct = m2?.porcentaje ?? 0;

  // Section 1: Level labels for resultado page
  let m1Label: string;
  let m1Desc: string;
  if (m1Pct >= 75) {
    m1Label = "Altamente recomendado";
    m1Desc = "Tu empresa tiene una necesidad clara y urgente de instalar un directorio. Las senales son multiples y consistentes.";
  } else if (m1Pct >= 55) {
    m1Label = "Recomendado";
    m1Desc = "Tu empresa esta en un momento de transicion. Es el momento ideal para empezar a armar un directorio.";
  } else if (m1Pct >= 30) {
    m1Label = "Recomendado con condiciones";
    m1Desc = "Hay senales tempranas de que un directorio agregaria valor. Conviene empezar a planificarlo.";
  } else {
    m1Label = "No recomendado en esta etapa";
    m1Desc = "La necesidad aun no es critica, pero las buenas practicas se instalan antes de que sean urgentes.";
  }

  const levelColor = m1Pct >= 75 ? 'text-red-600' : m1Pct >= 55 ? 'text-[#534AB7]' : m1Pct >= 30 ? 'text-yellow-600' : 'text-gray-600';
  const levelBg = m1Pct >= 75 ? 'bg-red-100 text-red-700' : m1Pct >= 55 ? 'bg-purple-100 text-[#534AB7]' : m1Pct >= 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600';

  // Section 2: Top 2 profiles from M3
  const topPerfiles = (m3?.topPerfiles ?? []).slice(0, 2);

  // Section 4: M4 data
  const freqText = m4freq ?? 'Trimestral';
  const diagPct = m4diag?.porcentaje ?? 0;
  const topProfile = topPerfiles[0] ? (PERFIL_LABELS[topPerfiles[0].perfil] ?? topPerfiles[0].perfil) : 'Estratega';

  // M4 readiness
  let m4ReadyMsg: string;
  let m4ReadyColor: string;
  let m4PuntosResolver = 0;
  if (diagPct >= 80) {
    m4ReadyMsg = "Estas listo para arrancar";
    m4ReadyColor = "text-green-700";
  } else if (diagPct >= 50) {
    m4PuntosResolver = Math.round((100 - diagPct) / 20);
    m4ReadyMsg = `Hay ${m4PuntosResolver} punto${m4PuntosResolver !== 1 ? 's' : ''} por resolver antes de arrancar`;
    m4ReadyColor = "text-yellow-700";
  } else {
    m4PuntosResolver = Math.round((100 - diagPct) / 20);
    m4ReadyMsg = `Hay ${m4PuntosResolver} puntos por resolver antes de arrancar`;
    m4ReadyColor = "text-red-700";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 rounded-lg bg-[#534AB7] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">Resultado final</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-6">

        {/* Section 1 — Score M1 */}
        <div className="border border-gray-200 rounded-xl bg-white p-6 text-center">
          {nombre && <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">{nombre}</p>}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Necesidad de directorio</p>
          <p className={`text-5xl font-bold ${levelColor} mb-2`}>{m1Pct}%</p>
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${levelBg} mb-3`}>
            {m1Label}
          </div>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">{m1Desc}</p>
        </div>

        {/* 4 Visual indicators grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Indicator 1: Nivel de necesidad (M1) */}
          <div className="border border-gray-200 rounded-xl bg-white p-4 flex flex-col items-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">Nivel de necesidad</p>
            <svg width="80" height="50" viewBox="0 0 120 70">
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#f3f4f6" strokeWidth="10" strokeLinecap="round" />
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={m1Pct >= 75 ? '#ef4444' : m1Pct >= 55 ? '#534AB7' : m1Pct >= 30 ? '#eab308' : '#9ca3af'} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${(m1Pct / 100) * 157} 157`} />
              <text x="60" y="58" textAnchor="middle" fontSize="16" fontWeight="700" fill="#111827">{m1Pct}%</text>
            </svg>
            <p className="text-xs text-gray-500 mt-1 text-center">Módulo 1</p>
          </div>

          {/* Indicator 2: Concentración de decisiones (M2) */}
          <div className="border border-gray-200 rounded-xl bg-white p-4 flex flex-col items-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">Concentración</p>
            <svg width="80" height="50" viewBox="0 0 120 70">
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#f3f4f6" strokeWidth="10" strokeLinecap="round" />
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={m2Pct >= 60 ? '#ef4444' : m2Pct >= 40 ? '#eab308' : '#22c55e'} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${(m2Pct / 100) * 157} 157`} />
              <text x="60" y="58" textAnchor="middle" fontSize="16" fontWeight="700" fill="#111827">{m2Pct}%</text>
            </svg>
            <p className="text-xs text-gray-500 mt-1 text-center">Módulo 2</p>
          </div>

          {/* Indicator 3: Perfil más crítico (M3) */}
          <div className="border border-gray-200 rounded-xl bg-white p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">Perfil más crítico</p>
            <p className="text-sm font-bold text-[#534AB7] text-center mb-2">{topProfile}</p>
            {topPerfiles[0] && (() => {
              const scores = m3?.scoresCompletos ?? {};
              const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
              const topPct = Math.round((scores[topPerfiles[0].perfil] ?? topPerfiles[0].score) / totalScore * 100);
              return (
                <div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#534AB7] transition-all duration-500" style={{ width: `${topPct}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">{topPct}%</p>
                </div>
              );
            })()}
          </div>

          {/* Indicator 4: Disposición al cambio (M4) */}
          <div className="border border-gray-200 rounded-xl bg-white p-4 flex flex-col items-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">Disposición</p>
            <svg width="80" height="50" viewBox="0 0 120 70">
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#f3f4f6" strokeWidth="10" strokeLinecap="round" />
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={diagPct >= 80 ? '#22c55e' : diagPct >= 50 ? '#eab308' : '#ef4444'} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${(diagPct / 100) * 157} 157`} />
              <text x="60" y="58" textAnchor="middle" fontSize="16" fontWeight="700" fill="#111827">{diagPct}%</text>
            </svg>
            <p className="text-xs text-gray-500 mt-1 text-center">Módulo 4</p>
          </div>
        </div>

        {/* Top 2 perfiles (M3) — right after indicators */}
        {topPerfiles.length > 0 && (
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Los 2 perfiles mas criticos para tu directorio</p>
            </div>
            <div className="p-4 space-y-3">
              {topPerfiles.map((p, i) => {
                const urgColor = p.urgencia === 'Critico' || p.urgencia === 'Cr\u00edtico'
                  ? 'bg-red-100 text-red-700'
                  : p.urgencia === 'Urgente'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-yellow-100 text-yellow-800';
                return (
                  <div key={p.perfil} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="text-sm font-semibold text-gray-900">{PERFIL_LABELS[p.perfil] ?? p.perfil}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgColor}`}>
                        {p.urgencia}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {PERFIL_JUSTIFICACIONES[p.perfil] ?? p.descripcion ?? p.justificacion ?? ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mapa de decisiones (M2) — without tensions */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mapa de decisiones — Como se toman las decisiones hoy</p>
          </div>
          <div className="px-5 py-5">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <DonutChart conteos={m2Conteos} />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Concentradas en el dueno</span>
                  <span className="text-sm font-bold text-red-600">{m2Conteos.concentrada}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Zona gris</span>
                  <span className="text-sm font-bold text-gray-500">{m2Conteos.gris}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Parcialmente delegadas</span>
                  <span className="text-sm font-bold text-yellow-600">{m2Conteos.parcial}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bien delegadas</span>
                  <span className="text-sm font-bold text-green-600">{m2Conteos.delegada}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Indice de concentracion: <strong className="text-gray-900">{m2Pct}%</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dinamica (M4) */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dinamica y funcionamiento</p>
          </div>
          <div className="px-5 py-4 space-y-4">
            {/* Frecuencia */}
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <span className="text-sm text-gray-700">Frecuencia recomendada</span>
              <span className="text-sm font-bold text-[#534AB7]">{freqText}</span>
            </div>

            {/* Autoevaluacion score */}
            {m4diag && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-700">Disposicion</span>
                <span className={`text-sm font-bold ${m4ReadyColor}`}>{m4ReadyMsg}</span>
              </div>
            )}

            {/* Next steps */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">Proximos pasos</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-green-700 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Empeza por el perfil mas urgente</p>
                  <p className="text-xs text-gray-500 mt-0.5">Busca un <strong>{topProfile}</strong> independiente con experiencia real en empresas similares.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-blue-700 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Agenda la primera reunion</p>
                  <p className="text-xs text-gray-500 mt-0.5">Segun tu diagnostico, la frecuencia recomendada es <strong>{freqText}</strong>. Bloquea la primera fecha.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-purple-700 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Prepara el mapa de decisiones reservadas</p>
                  <p className="text-xs text-gray-500 mt-0.5">Define que decide el directorio y que decide la gerencia. Es el documento mas importante para arrancar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnóstico y sugerencias */}
        <div className="border-l-4 border-[#534AB7] bg-white rounded-r-xl p-5">
          <p className="text-xs font-semibold text-[#534AB7] uppercase tracking-wider mb-3">Diagnóstico y sugerencias</p>
          <div className="space-y-3">
            {/* Paragraph 1: M1 assessment */}
            <p className="text-sm text-gray-700 leading-relaxed">
              {m1Pct >= 75
                ? "Tu empresa presenta una necesidad clara y urgente de formalizar un directorio. La combinación de tamaño, complejidad societaria y nivel de gobierno actual hacen que operar sin este órgano represente un riesgo real para el negocio."
                : m1Pct >= 55
                ? "Tu empresa está en un momento de transición donde un directorio agregaría valor concreto. Las señales son claras: hay complejidad suficiente para justificar una estructura de gobierno más formal."
                : m1Pct >= 30
                ? "Tu empresa muestra señales tempranas de necesidad. Si bien no es urgente, hay factores que indican que en los próximos 12-18 meses sería estratégico comenzar a construir las bases de un directorio."
                : "En esta etapa, la empresa aún no reúne las condiciones para que un directorio formal agregue valor. Recomendamos enfocarse primero en profesionalizar la gestión interna."}
            </p>

            {/* Paragraph 2: M2 concentration */}
            <p className="text-sm text-gray-700 leading-relaxed">
              {m2Pct >= 60
                ? "El mapa de decisiones revela una concentración preocupante: la mayoría de las decisiones estratégicas recaen en una sola persona. Esto no solo es un riesgo operativo — es un riesgo patrimonial. Un directorio distribuiría esta carga de forma institucional."
                : m2Pct >= 40
                ? "Hay un nivel de concentración de decisiones que merece atención. Algunas decisiones clave ya están parcialmente delegadas, pero las más importantes siguen dependiendo del dueño. El directorio completaría esta transición."
                : "Las decisiones ya muestran un buen nivel de delegación. El directorio consolidaría estas buenas prácticas y agregaría una capa de supervisión estratégica."}
            </p>

            {/* Paragraph 3: M3 top profile */}
            <p className="text-sm text-gray-700 leading-relaxed">
              {`El primer perfil que recomendamos incorporar es un ${topProfile}. ${(PERFIL_JUSTIFICACIONES[topPerfiles[0]?.perfil] ?? '').split('.')[0]}. Este perfil debería ser la prioridad número uno al momento de conformar el directorio.`}
            </p>

            {/* Paragraph 4: M4 readiness */}
            <p className="text-sm text-gray-700 leading-relaxed">
              {diagPct >= 80
                ? "La buena noticia es que tu empresa ya muestra disposición real al cambio. Las condiciones están dadas para iniciar el proceso de conformación del directorio en el corto plazo."
                : diagPct >= 50
                ? "Hay disposición al cambio, aunque con algunos puntos por resolver. Recomendamos trabajar en la apertura del CEO a la rendición de cuentas y en la separación formal de roles antes de arrancar."
                : "La disposición al cambio todavía es baja. Antes de conformar un directorio, es fundamental trabajar en la cultura de gobierno: reuniones periódicas, rendición de cuentas y apertura a perspectivas externas."}
            </p>
          </div>
        </div>

        {/* PDF download */}
        <button
          onClick={handleGeneratePDF}
          disabled={pdfLoading}
          className="w-full py-4 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {pdfLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Generando PDF...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar reporte PDF completo
            </>
          )}
        </button>

        {/* Navigation */}
        <div className="flex gap-3">
          <button onClick={() => router.push('/dashboard')} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            Ver dashboard
          </button>
          <button onClick={() => router.push('/')} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            Volver al inicio
          </button>
        </div>
      </main>
    </div>
  );
}
