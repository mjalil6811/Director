'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '../../lib/storage';
import type { Modulo1Resultado, Modulo2Resultado, Modulo3Resultado, Modulo4Diagnostico } from '../../types';

const PERFIL_LABELS: Record<string, string> = {
  estratega: "Estratega",
  financiero: "Financiero",
  familiar: "Familiar",
  sector: "Experto sectorial",
  legal: "Legal",
  rrhh: "RRHH",
  digital: "Digital",
  inversor: "Inversor",
  control: "Control",
  crisis: "Crisis",
};

const PERFIL_DESCRIPCIONES: Record<string, string> = {
  estratega: "Aporta visión de largo plazo, analiza tendencias y ayuda a definir el norte de la empresa.",
  financiero: "Supervisa la salud financiera, evalúa inversiones y protege el patrimonio de los accionistas.",
  familiar: "Gestiona la relación familia-empresa, establece reglas de sucesión y previene conflictos.",
  sector: "Trae conocimiento profundo de la industria, contactos clave y comprensión del mercado.",
  legal: "Asegura cumplimiento normativo, gestiona riesgos legales y protege a la empresa institucionalmente.",
  rrhh: "Fortalece el talento, diseña la estructura organizacional y evalúa al equipo ejecutivo.",
  digital: "Impulsa la transformación digital, evalúa tecnologías y moderniza procesos.",
  inversor: "Aporta perspectiva de valor, evalúa oportunidades de crecimiento y disciplina de rentabilidad.",
  control: "Supervisa controles internos, auditoría y transparencia en la gestión.",
  crisis: "Experiencia en reestructuración, gestión de crisis y toma de decisiones bajo presión.",
};

function PieChart({ perfiles }: { perfiles: { perfil: string; score: number }[] }) {
  const total = perfiles.reduce((s, p) => s + p.score, 0);
  if (total === 0) return null;
  const colors = ['#534AB7', '#7C6FD0', '#A89DE8', '#D0C9F5'];
  const r = 50;
  const cx = 60;
  const cy = 60;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const arcs = perfiles.map((p, i) => {
    const dash = (p.score / total) * circ;
    const arc = { ...p, dash, offset, color: colors[i % colors.length] };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="16" />
        {arcs.map((a, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth="16"
            strokeDasharray={`${a.dash} ${circ}`} strokeDashoffset={-a.offset}
            transform={`rotate(-90 ${cx} ${cy})`} />
        ))}
      </svg>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {arcs.map((a, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
            <span className="text-xs text-gray-500">{PERFIL_LABELS[a.perfil] ?? a.perfil} ({Math.round((a.score / total) * 100)}%)</span>
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
      alert('Error al generar el PDF. Por favor, intentá de nuevo.');
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
  const m2Pct = m2?.porcentaje ?? 0;
  const m2Conteos = m2?.conteos ?? { concentrada: 0, parcial: 0, delegada: 0, gris: 0 };

  // Dimension scores as percentages
  const dimScores: Record<string, number> = {};
  m1?.scoresPorDimension.forEach(d => {
    dimScores[d.nombre.toLowerCase()] = d.max > 0 ? Math.round((d.score / d.max) * 100) : 0;
  });

  // Section 2: Why reasons
  const porQueReasons: string[] = [];
  const propiedadScore = dimScores['propiedad'] ?? dimScores['estructura de propiedad'] ?? 0;
  const gobiernoScore = dimScores['gobierno'] ?? dimScores['gobierno y decisiones'] ?? dimScores['decisiones'] ?? 0;
  const sucesionScore = dimScores['sucesión'] ?? dimScores['sucesion'] ?? dimScores['familia y sucesión'] ?? 0;
  const complejidadScore = dimScores['complejidad'] ?? dimScores['complejidad del negocio'] ?? 0;

  // Find closest dimension name matches
  const findDimScore = (keywords: string[]) => {
    for (const dim of m1?.scoresPorDimension ?? []) {
      const lower = dim.nombre.toLowerCase();
      if (keywords.some(k => lower.includes(k))) {
        return dim.max > 0 ? Math.round((dim.score / dim.max) * 100) : 0;
      }
    }
    return 0;
  };

  const propScore = findDimScore(['propiedad']);
  const gobScore = findDimScore(['gobierno', 'decisio']);
  const sucScore = findDimScore(['sucesi', 'familia']);
  const compScore = findDimScore(['complejidad', 'crecimiento']);

  if (propScore >= 50) {
    porQueReasons.push("La estructura de propiedad es compleja — un directorio formaliza quién decide qué y protege a todos los socios.");
  }
  if (m2Pct >= 40) {
    porQueReasons.push(`El ${m2Pct}% de las decisiones están concentradas en una persona o en zona gris. Un directorio distribuye el poder de forma sana.`);
  }
  if (gobScore >= 50) {
    porQueReasons.push("Las decisiones estratégicas se toman sin proceso formal. El directorio instala disciplina y rendición de cuentas.");
  }
  if (m2Conteos.gris >= 2) {
    porQueReasons.push(`Hay ${m2Conteos.gris} decisiones donde nadie tiene la responsabilidad clara. El directorio asigna roles y elimina zonas grises.`);
  }
  if (sucScore >= 40) {
    porQueReasons.push("La sucesión o la relación familia-empresa necesitan reglas claras. El directorio es el espacio para definirlas.");
  }
  if (compScore >= 60) {
    porQueReasons.push("El negocio tiene un nivel de complejidad que demanda visión externa y profesionalización del gobierno.");
  }

  // Ensure at least 3 reasons
  if (porQueReasons.length < 3) {
    if (m1Pct >= 30) porQueReasons.push("El diagnóstico muestra señales claras de que la empresa se beneficiaría de un órgano de gobierno formal.");
    if (porQueReasons.length < 3) porQueReasons.push("Un directorio aporta perspectiva externa, disciplina de rendición de cuentas y mejor toma de decisiones estratégicas.");
  }

  // Section 3: Benefits
  type Benefit = { title: string; desc: string; relevance: number };
  const benefitCandidates: Benefit[] = [
    { title: "Control y contrapeso", desc: "Un órgano independiente que cuestiona, evalúa y aprueba las decisiones más importantes.", relevance: m2Pct >= 40 ? 3 : 1 },
    { title: "Visión estratégica externa", desc: "Directores con experiencia que aportan perspectiva que la operación diaria no permite ver.", relevance: compScore >= 40 ? 3 : m1Pct >= 50 ? 2 : 1 },
    { title: "Resolución de conflictos entre socios", desc: "El directorio es el árbitro natural entre socios. Decide con datos, no con emociones.", relevance: propScore >= 50 ? 3 : 1 },
    { title: "Profesionalización de la gestión", desc: "Instala rendición de cuentas, presupuestos formales y evaluación de resultados.", relevance: gobScore >= 50 ? 3 : m2Conteos.concentrada >= 3 ? 2 : 1 },
    { title: "Protección del patrimonio familiar", desc: "Define reglas de sucesión, ingreso de familiares y separación de roles familia-empresa.", relevance: sucScore >= 40 ? 3 : 0 },
    { title: "Disciplina de rendición de cuentas", desc: "La gerencia presenta, el directorio cuestiona, los socios se informan. Cadena clara.", relevance: m2Conteos.gris >= 2 || m2Conteos.concentrada >= 3 ? 3 : 1 },
  ];
  const topBenefits = benefitCandidates.sort((a, b) => b.relevance - a.relevance).slice(0, 4);

  // Section 4: Profiles from M3
  const topPerfiles = m3?.topPerfiles ?? [];

  // Section 5: Next steps
  const recommendedSize = m1Pct >= 60 ? 5 : 3;
  const topProfile = topPerfiles[0] ? (PERFIL_LABELS[topPerfiles[0].perfil] ?? topPerfiles[0].perfil) : 'Estratega';
  const freqText = m4freq ?? 'Trimestral';

  // Level info
  const levelColor = m1Pct >= 75 ? 'text-red-600' : m1Pct >= 55 ? 'text-purple-600' : m1Pct >= 30 ? 'text-yellow-600' : 'text-gray-600';
  const levelBg = m1Pct >= 75 ? 'bg-red-100 text-red-700' : m1Pct >= 55 ? 'bg-purple-100 text-purple-700' : m1Pct >= 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600';
  const m1Nivel = m1?.nivel ?? '';

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

        {/* Section 1 — Score general */}
        <div className="border border-gray-200 rounded-xl bg-white p-6 text-center">
          {nombre && <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">{nombre}</p>}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Necesidad de directorio</p>
          <p className={`text-5xl font-bold ${levelColor} mb-2`}>{m1Pct}%</p>
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${levelBg} mb-3`}>
            {m1Nivel}
          </div>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            {m1Pct >= 75 ? 'Tu empresa tiene una necesidad urgente de instalar un directorio. Las señales son claras en múltiples dimensiones.' :
             m1Pct >= 55 ? 'Tu empresa está en un momento de transición. Es el momento ideal para empezar a armar un directorio.' :
             m1Pct >= 30 ? 'Hay señales tempranas de que un directorio agregaría valor. Conviene empezar a planificarlo.' :
             'La necesidad aún no es crítica, pero las buenas prácticas se instalan antes de que sean urgentes.'}
          </p>
        </div>

        {/* Section 2 — Por qué necesitás un directorio */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">¿Por qué tu empresa necesita un directorio?</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {porQueReasons.slice(0, 5).map((reason, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3 — Beneficios concretos */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Beneficios concretos para tu empresa</p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topBenefits.map((b, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{b.title}</h4>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4 — Composición recomendada */}
        {topPerfiles.length > 0 && (
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Composición recomendada del directorio</p>
            </div>
            <div className="px-5 py-4">
              <div className="flex justify-center mb-4">
                <PieChart perfiles={topPerfiles.slice(0, 4)} />
              </div>
              <div className="space-y-2">
                {topPerfiles.slice(0, 4).map((p, i) => (
                  <details key={p.perfil} className="border border-gray-200 rounded-xl overflow-hidden">
                    <summary className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 select-none">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <span className="text-sm font-semibold text-gray-900">{PERFIL_LABELS[p.perfil] ?? p.perfil}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${p.urgencia === 'Crítico' ? 'bg-red-100 text-red-700' :
                          p.urgencia === 'Urgente' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {p.urgencia}
                      </span>
                    </summary>
                    <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                      <p className="text-xs text-gray-600 leading-relaxed">{p.descripcion || PERFIL_DESCRIPCIONES[p.perfil] || ''}</p>
                      {p.justificacion && (
                        <p className="text-xs text-[#534AB7] mt-2 italic">{p.justificacion}</p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 5 — Próximos pasos */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Próximos pasos</p>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-green-700 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Definí el tamaño del directorio</p>
                <p className="text-xs text-gray-500 mt-0.5">Para tu empresa recomendamos <strong>{recommendedSize} miembros</strong> como punto de partida.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-700 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Empezá por el perfil más urgente</p>
                <p className="text-xs text-gray-500 mt-0.5">El perfil <strong>{topProfile}</strong> es el que más valor agregaría hoy a tu empresa.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-purple-700 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Establecé una frecuencia de reunión</p>
                <p className="text-xs text-gray-500 mt-0.5">Según tu diagnóstico, la frecuencia recomendada es <strong>{freqText}</strong>.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6 — Download PDF */}
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
