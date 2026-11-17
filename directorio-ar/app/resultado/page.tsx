'use client';

import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '../../lib/storage';
import { calcularIndicePreparacion } from '../../lib/indice';
import { PERFILES, type PerfilKey } from '../../lib/modulo3';
import { CATEGORIA_LABEL, INDUSTRIAS } from '../../lib/pymes';
import { ScoreGauge, StatusDonut, RankedBars, VIZ } from '../../components/charts';
import type { Modulo1Resultado, Modulo2Resultado, Modulo3Resultado, Modulo4Diagnostico, Modulo5Resultado } from '../../types';

// ——— Textos de diagnóstico por nivel ——————————————————————————————————————————

function lecturaNecesidad(pct: number) {
  if (pct >= 75) return { label: 'Altamente recomendado', color: '#B42318', texto: 'Hay una necesidad clara y urgente de sumar un consejo asesor o directorio. Por tamaño, complejidad societaria y forma actual de decidir, seguir sin uno es un riesgo real para el negocio.' };
  if (pct >= 55) return { label: 'Recomendado', color: '#534AB7', texto: 'La empresa está en un momento de transición: un consejo agregaría valor concreto como socio estratégico del dueño, no solo como control.' };
  if (pct >= 30) return { label: 'Recomendado con condiciones', color: '#B7791F', texto: 'Hay señales tempranas. No es urgente, pero en los próximos 12–18 meses conviene empezar a construir las bases.' };
  return { label: 'Todavía no es el momento', color: '#6B7280', texto: 'La necesidad aún no es crítica. Conviene profesionalizar primero la gestión interna y la costumbre de rendir cuentas.' };
}

function lecturaDecisiones(pct: number) {
  if (pct >= 60) return 'La mayoría de las decisiones importantes recaen en una sola persona. Es un riesgo operativo y patrimonial: un consejo reparte esa carga y define qué se decide en la mesa y qué queda en la gerencia.';
  if (pct >= 40) return 'Algunas decisiones ya están delegadas, pero las más importantes siguen dependiendo del dueño. El consejo completa esa transición con reglas claras.';
  return 'Las decisiones ya muestran buena delegación. El consejo consolidaría estas prácticas y sumaría mirada estratégica en las decisiones más complejas.';
}

function lecturaDisposicion(pct: number) {
  if (pct >= 80) return { label: 'Listo para arrancar', color: VIZ.good, texto: 'Hay disposición real al cambio: las condiciones están dadas para armar el consejo en el corto plazo.' };
  if (pct >= 50) return { label: 'Casi listo', color: VIZ.warn, texto: 'Hay disposición, con puntos por resolver: la apertura a rendir cuentas y la separación de roles.' };
  return { label: 'Todavía no', color: VIZ.bad, texto: 'La disposición es baja. Antes de un consejo formal, conviene empezar con reuniones periódicas y uno o dos asesores de confianza.' };
}

// ——— Cuadrante ————————————————————————————————————————————————————————————————

function Cuadrante({ n, titulo, fuente, children }: { n: number; titulo: string; fuente: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col">
      <header className="flex items-center gap-2.5 mb-4">
        <span className="w-7 h-7 rounded-lg bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0">{n}</span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-gray-900 leading-tight">{titulo}</h2>
          <p className="text-[11px] text-gray-400">{fuente}</p>
        </div>
      </header>
      <div className="flex-1 flex flex-col gap-4">{children}</div>
    </section>
  );
}

// ——— Página ———————————————————————————————————————————————————————————————————

export default function ResultadoPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [m1, setM1] = useState<Modulo1Resultado | null>(null);
  const [m2, setM2] = useState<Modulo2Resultado | null>(null);
  const [m3, setM3] = useState<Modulo3Resultado | null>(null);
  const [m4freq, setM4freq] = useState<string | null>(null);
  const [m4diag, setM4diag] = useState<Modulo4Diagnostico | null>(null);
  const [m5, setM5] = useState<Modulo5Resultado | null>(null);
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
    setM1(r1); setM2(r2); setM3(r3); setM4freq(r4f); setM4diag(r4d);
    setM5(storage.getModulo5Resultado());
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

  if (!ready || !m1 || !m2 || !m3) {
    return <div className="min-h-screen flex items-center justify-center bg-surface text-gray-400 text-sm">Cargando...</div>;
  }

  // ——— Datos derivados ——————————————————————————————————————————————————————
  const m1Pct = m1.porcentaje ?? 0;
  const necesidad = lecturaNecesidad(m1Pct);
  const perfil = m1.perfil;
  const industria = perfil ? INDUSTRIAS.find(i => i.key === perfil.industria)?.label : undefined;

  const conteos = m2.conteos ?? { concentrada: 0, parcial: 0, delegada: 0, gris: 0 };
  const m2Pct = m2.porcentaje ?? 0;

  const scores = m3.scoresCompletos ?? {};
  const totalScores = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const perfilesPct = (Object.keys(PERFILES) as PerfilKey[]).map(k => ({
    key: k, label: PERFILES[k].nombre, value: Math.round(((scores[k] ?? 0) / totalScores) * 100),
  }));
  const top = m3.topPerfiles?.[0];
  const topNombre = top ? PERFILES[top.perfil as PerfilKey]?.nombre ?? top.perfil : 'Asesor estratégico';

  const diagPct = m4diag?.porcentaje ?? 0;
  const disposicion = lecturaDisposicion(diagPct);
  const freqText = m4freq ?? 'Trimestral';

  const indice = calcularIndicePreparacion(m1, m2, m3, m4diag, m5);
  const fecha = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <PageHeader
        titulo="Resultado final"
        backHref="/dashboard"
        right={nombre ? <span className="text-xs text-gray-400 font-medium">{nombre}</span> : undefined}
      />

      <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full space-y-4">

        {/* Resumen + acciones */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: indice.colorBg }}>
              <span className="text-2xl font-bold tabular-nums leading-none" style={{ color: indice.color }}>{indice.total}</span>
              <span className="text-[10px] text-gray-500">de 100</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Diagnóstico {nombre ? `· ${nombre}` : ''}</p>
              <p className="text-base font-bold text-gray-900">Índice de preparación: {indice.nivel}</p>
              <p className="text-xs text-gray-500">
                {perfil ? `${CATEGORIA_LABEL[perfil.categoria]} · ${industria} · ` : ''}{fecha}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Link href="/informe-asesor" className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand hover:bg-brand-dark text-white">
              Informe para el asesor →
            </Link>
            <button onClick={handleGeneratePDF} disabled={pdfLoading} className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50">
              {pdfLoading ? 'Generando PDF…' : 'Descargar PDF'}
            </button>
          </div>
        </div>

        {/* 4 cuadrantes */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* 1 — Necesidad y urgencia */}
          <Cuadrante n={1} titulo="Necesidad y urgencia" fuente="Módulo 1">
            <div className="flex items-center gap-4">
              <div className="w-40 shrink-0"><ScoreGauge value={m1Pct} color={necesidad.color} thresholds={[30, 55, 75]} /></div>
              <div>
                <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2" style={{ color: necesidad.color, backgroundColor: `${necesidad.color}14` }}>
                  {necesidad.label}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{necesidad.texto}</p>
              </div>
            </div>
            {m1.recomendaciones.length > 0 && (
              <ul className="space-y-1.5 border-t border-gray-100 pt-3">
                {m1.recomendaciones.slice(0, 3).map(r => (
                  <li key={r} className="text-xs text-gray-600 leading-relaxed flex gap-2"><span className="text-brand">•</span>{r}</li>
                ))}
              </ul>
            )}
          </Cuadrante>

          {/* 2 — Cómo se decide hoy */}
          <Cuadrante n={2} titulo="Cómo se decide hoy" fuente="Módulo 2 · mapa de decisiones">
            <StatusDonut
              centerLabel="decisiones"
              items={[
                { key: 'concentrada', label: 'Concentradas en el dueño', value: conteos.concentrada, color: VIZ.bad },
                { key: 'gris', label: 'Sin responsable claro', value: conteos.gris, color: '#C4C8CF' },
                { key: 'parcial', label: 'Parcialmente delegadas', value: conteos.parcial, color: VIZ.warn },
                { key: 'delegada', label: 'Bien delegadas', value: conteos.delegada, color: VIZ.good },
              ]}
            />
            <p className="text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3">
              <strong className="text-gray-900">{m2Pct}% de concentración.</strong> {lecturaDecisiones(m2Pct)}
            </p>
          </Cuadrante>

          {/* 3 — Perfiles a sumar */}
          <Cuadrante n={3} titulo="Perfiles a sumar al consejo" fuente="Módulo 3">
            <RankedBars items={perfilesPct} highlightKey={top?.perfil} unit="%" />
            <p className="text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3">
              El primer perfil a sumar es un <strong className="text-gray-900">{topNombre}</strong>
              {top?.urgencia ? <> (urgencia: {top.urgencia.toLowerCase()})</> : null}.{' '}
              {top ? PERFILES[top.perfil as PerfilKey]?.descripcion.split('.')[0] + '.' : ''}
            </p>
          </Cuadrante>

          {/* 4 — Disposición y próximos pasos */}
          <Cuadrante n={4} titulo="Disposición y próximos pasos" fuente="Módulo 4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 p-3">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Disposición</p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: disposicion.color }}>{m4diag ? `${diagPct}%` : '—'}</p>
                <p className="text-xs font-semibold" style={{ color: disposicion.color }}>{m4diag ? disposicion.label : 'Sin datos'}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Reuniones</p>
                <p className="text-sm font-bold text-brand mt-1 leading-snug">{freqText}</p>
              </div>
            </div>
            {m4diag && <p className="text-sm text-gray-700 leading-relaxed">{disposicion.texto}</p>}
            <ol className="space-y-2 border-t border-gray-100 pt-3">
              {[
                { t: 'Sumá el perfil más urgente', d: `Buscá un ${topNombre.toLowerCase()} independiente, con experiencia real en empresas como la tuya.` },
                { t: 'Agendá la primera reunión', d: `Frecuencia recomendada: ${freqText.toLowerCase()}. Bloqueá la fecha ya.` },
                { t: 'Definí qué se decide en la mesa', d: 'Qué decide el consejo y qué la gerencia. Es el documento más importante para arrancar.' },
              ].map((p, i) => (
                <li key={p.t} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.t}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Cuadrante>
        </div>

        {/* Primeros 100 días */}
        <div className="border-l-4 border-brand bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">Los primeros 100 días</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {m1Pct >= 55
              ? 'Después de armar el consejo, enfocate en tres cosas: (1) definir qué decisiones lidera el consejo, cuáles acompaña y de cuáles se mantiene al margen; (2) acordar qué información entrega la gerencia antes de cada reunión; y (3) construir confianza en el grupo, con al menos una sesión para conocerse y alinear expectativas.'
              : 'Todavía no es momento de un consejo formal, pero podés construir las bases: separar decisiones estratégicas de operativas, instalar reuniones periódicas de rendición de cuentas y sumar una o dos personas de confianza con experiencia que te den otra mirada.'}
          </p>
        </div>

        <div className="flex gap-3 print:hidden">
          <Link href="/dashboard" className="flex-1 text-center py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50">
            Ver Índice de preparación
          </Link>
          <Link href="/" className="flex-1 text-center py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50">
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
