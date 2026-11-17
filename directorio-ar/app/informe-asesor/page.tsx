'use client';

import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { calcularIndicePreparacion } from '../../lib/indice';
import { generarInformeAsesor, type InformeAsesor } from '../../lib/informe-asesor';

function Seccion({ titulo, children, className = '' }: { titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white border border-gray-200 rounded-2xl p-5 break-inside-avoid ${className}`}>
      <h2 className="text-xs font-semibold text-brand uppercase tracking-wider mb-3">{titulo}</h2>
      {children}
    </section>
  );
}

export default function InformeAsesorPage() {
  const [informe, setInforme] = useState<InformeAsesor | null>(null);
  const [faltan, setFaltan] = useState<number[]>([]);

  useEffect(() => {
    const m1 = storage.getModulo1Resultado();
    const m2 = storage.getModulo2Resultado();
    const m3 = storage.getModulo3Resultado();
    const m4diag = storage.getModulo4Diagnostico();
    const pendientes = [!m1 && 1, !m2 && 2, !m3 && 3].filter(Boolean) as number[];
    if (!m1 || !m2 || !m3) { setFaltan(pendientes); return; }
    const indice = calcularIndicePreparacion(m1, m2, m3, m4diag, storage.getModulo5Resultado()).total;
    setInforme(generarInformeAsesor({
      empresa: storage.getEmpresaNombre() ?? '',
      m1, m2, m3, m4diag,
      m4frecuencia: storage.getModulo4Frecuencia(),
      respuestasM1: storage.getModulo1Respuestas(),
      respuestasM3: storage.getModulo3Respuestas(),
      indice,
    }));
  }, []);

  if (!informe) {
    return (
      <div className="min-h-screen bg-surface">
        <PageHeader titulo="Informe para el asesor" backHref="/resultado" />
        <main className="max-w-xl mx-auto px-4 py-16 text-center">
          {faltan.length > 0 ? (
            <>
              <p className="text-sm text-gray-700 mb-2">Para generar el informe hacen falta los módulos {faltan.join(', ')} del diagnóstico.</p>
              <Link href={`/modulo/${faltan[0]}`} className="inline-block mt-3 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold">Completar Módulo {faltan[0]} →</Link>
            </>
          ) : <p className="text-sm text-gray-400">Preparando informe…</p>}
        </main>
      </div>
    );
  }

  const fecha = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-surface print:bg-white">
      <PageHeader
        titulo="Informe para el asesor"
        backHref="/resultado"
        right={<button onClick={() => window.print()} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand text-white hover:bg-brand-dark">Descargar PDF</button>}
      />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Portada */}
        <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-light text-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Confidencial · Para quien va a presidir o acompañar el consejo</p>
          <h1 className="text-2xl font-bold mt-1">Cómo armar el consejo de {informe.resumen[0].valor}</h1>
          <p className="text-sm text-white/80 mt-1">Lectura del caso y recomendaciones de consultor, a partir del diagnóstico · {fecha}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Seccion titulo="Resumen del caso">
            <dl className="divide-y divide-gray-100">
              {informe.resumen.map(r => (
                <div key={r.etiqueta} className="flex justify-between gap-4 py-1.5 text-sm">
                  <dt className="text-gray-500">{r.etiqueta}</dt>
                  <dd className="font-semibold text-gray-900 text-right">{r.valor}</dd>
                </div>
              ))}
            </dl>
          </Seccion>

          <Seccion titulo="Riesgos a vigilar">
            <ul className="space-y-3">
              {informe.riesgos.map(r => (
                <li key={r.titulo} className="flex gap-3">
                  <span className={`mt-0.5 shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${r.nivel === 'alto' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>{r.nivel}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.titulo}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{r.detalle}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Seccion>
        </div>

        <Seccion titulo="Lectura del caso">
          <div className="space-y-2.5">
            {informe.lectura.map(p => <p key={p} className="text-sm text-gray-700 leading-relaxed">{p}</p>)}
          </div>
        </Seccion>

        <Seccion titulo="Cómo armar el consejo">
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl bg-brand-50 p-3">
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Formato</p>
              <p className="text-sm font-bold text-brand-dark leading-snug mt-0.5">{informe.consejo.formato}</p>
            </div>
            <div className="rounded-xl bg-brand-50 p-3">
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Tamaño</p>
              <p className="text-sm font-bold text-brand-dark leading-snug mt-0.5">{informe.consejo.tamano}</p>
            </div>
            <div className="rounded-xl bg-brand-50 p-3">
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Reuniones</p>
              <p className="text-sm font-bold text-brand-dark leading-snug mt-0.5">{informe.consejo.frecuencia}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">{informe.consejo.formatoDetalle}</p>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Perfiles a sumar primero</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {informe.consejo.perfiles.map((p, i) => (
              <div key={p.nombre} className="border border-gray-200 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">{i + 1}. {p.nombre}</p>
                  <span className="text-[11px] font-semibold text-gray-500">{p.urgencia}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">Qué buscar: {p.porque}</p>
              </div>
            ))}
          </div>
        </Seccion>

        <div className="grid md:grid-cols-2 gap-4">
          <Seccion titulo="Hoja de ruta · primeros 90 días">
            <ol className="space-y-3">
              {informe.hojaDeRuta.map(p => (
                <li key={p.que} className="grid grid-cols-[84px_1fr] gap-3">
                  <span className="text-[11px] font-semibold text-brand pt-0.5">{p.cuando}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.que}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{p.detalle}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Seccion>

          <Seccion titulo="Agenda de las primeras 3 reuniones">
            <div className="space-y-3">
              {informe.primerasReuniones.map(r => (
                <div key={r.n}>
                  <p className="text-sm font-semibold text-gray-900">Reunión {r.n} · {r.foco}</p>
                  <ul className="mt-1 space-y-0.5">
                    {r.agenda.map(a => <li key={a} className="text-xs text-gray-600 flex gap-2"><span className="text-brand">•</span>{a}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Seccion>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Seccion titulo="Cómo conversarlo">
            <ul className="space-y-2">
              {informe.conversacion.map(c => <li key={c} className="text-sm text-gray-700 leading-relaxed flex gap-2"><span className="text-brand">→</span>{c}</li>)}
            </ul>
          </Seccion>
          <Seccion titulo="Señales de que el consejo funciona">
            <ul className="space-y-2">
              {informe.senales.map(c => <li key={c} className="text-sm text-gray-700 leading-relaxed flex gap-2"><span className="text-green-700">✓</span>{c}</li>)}
            </ul>
          </Seccion>
        </div>

        <p className="text-[11px] text-gray-400 text-center pt-2">
          Informe orientativo generado a partir de las respuestas del diagnóstico. No reemplaza el asesoramiento legal o contable.
        </p>
      </main>
    </div>
  );
}
