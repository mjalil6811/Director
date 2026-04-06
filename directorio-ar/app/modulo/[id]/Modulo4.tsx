'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../components/ModuleLayout';
import { storage } from '../../../lib/storage';

type Tab = 'frecuencia' | 'agenda' | 'decisiones' | 'acta';

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 bg-white border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

function AgendaBlock({ number, title, time, content, nota }: { number: number; title: string; time: string; content: string; nota?: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="shrink-0 w-6 h-6 rounded-full bg-[#534AB7] bg-opacity-10 text-[#534AB7] text-xs font-bold flex items-center justify-center mt-0.5">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          <span className="text-xs text-gray-400 shrink-0 ml-2">{time}</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{content}</p>
        {nota && (
          <p className="text-xs text-[#534AB7] mt-1 italic">📌 {nota}</p>
        )}
      </div>
    </div>
  );
}

export default function Modulo4() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('frecuencia');
  const [frecuencia, setFrecuencia] = useState<string>('');

  useEffect(() => {
    const m1Result = storage.getModulo1Resultado();
    let freq = '';
    if (m1Result) {
      const pct = m1Result.porcentaje ?? 0;
      if (pct < 30) freq = "No aplica aún";
      else if (pct < 55) freq = "Trimestral (4 reuniones/año)";
      else if (pct < 75) freq = "Bimestral (6 reuniones/año)";
      else freq = "Mensual (12 reuniones/año)";
    } else {
      freq = "Completá el módulo 1 para ver la frecuencia recomendada";
    }
    setFrecuencia(freq);
    storage.setModulo4Frecuencia(freq);
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'frecuencia', label: 'Frecuencia' },
    { key: 'agenda', label: 'Agenda tipo' },
    { key: 'decisiones', label: 'Decisiones' },
    { key: 'acta', label: 'Acta' },
  ];

  return (
    <ModuleLayout moduleNumber={4} title="Dinámica de reuniones">
      {/* Tab navigation */}
      <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors
              ${tab === t.key ? 'bg-[#534AB7] text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Frecuencia */}
      {tab === 'frecuencia' && (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Frecuencia recomendada</h3>
            <p className="text-xl font-bold text-gray-900 mb-3">{frecuencia}</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Esta recomendación se calcula en función del puntaje obtenido en el módulo 1.
              A mayor complejidad y necesidad de gobierno, mayor es la frecuencia recomendada de reuniones del directorio.
            </p>
          </div>
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Referencia de frecuencias</h3>
            <div className="space-y-2">
              {[
                { nivel: "Directorio prematuro", freq: "No aplica aún", color: "bg-gray-100 text-gray-600" },
                { nivel: "Señales tempranas", freq: "Trimestral", color: "bg-yellow-100 text-yellow-800" },
                { nivel: "Momento de transición", freq: "Bimestral", color: "bg-purple-100 text-purple-700" },
                { nivel: "Necesidad urgente", freq: "Mensual", color: "bg-red-100 text-red-700" },
              ].map(item => (
                <div key={item.nivel} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                  <span className="text-sm text-gray-700">{item.nivel}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.color}`}>{item.freq}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => router.push('/modulo/5')}
            className="w-full py-3 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold"
          >
            Continuar al módulo 5 →
          </button>
        </div>
      )}

      {/* Tab: Agenda */}
      {tab === 'agenda' && (
        <div className="space-y-2">
          <Accordion title="Reunión ordinaria">
            <div className="mt-2 space-y-0.5">
              <AgendaBlock number={1} title="Apertura y quórum" time="10 min"
                content="Verificación de quórum, aprobación del acta anterior, revisión de acuerdos pendientes."
                nota="En Argentina el quórum es un requisito legal en SA." />
              <AgendaBlock number={2} title="Informe de gestión" time="30 min"
                content="Resultados financieros vs. presupuesto, KPIs, situación de caja, alertas."
                nota="El CEO presenta, el directorio escucha y pregunta — no es micro-gestión." />
              <AgendaBlock number={3} title="Temas estratégicos" time="45 min"
                content="Un tema estratégico profundo por reunión, análisis de mercado, seguimiento de iniciativas."
                nota="Este bloque es el corazón del directorio — en Argentina se suele saltar por falta de tiempo." />
              <AgendaBlock number={4} title="Decisiones reservadas" time="20 min"
                content="Aprobación formal de lo que está en el mapa de decisiones reservadas." />
              <AgendaBlock number={5} title="Cierre y próxima reunión" time="15 min"
                content="Repaso de acuerdos, responsables, fecha de próxima reunión." />
            </div>
          </Accordion>

          <Accordion title="Reunión estratégica anual">
            <div className="mt-2 space-y-0.5">
              <AgendaBlock number={1} title="Revisión del año" time="60 min"
                content="Balance estratégico, evaluación de decisiones tomadas." />
              <AgendaBlock number={2} title="Análisis de contexto" time="60 min"
                content="Macroeconomía argentina, movimientos de la industria."
                nota="En Argentina el contexto macro cambia rápido — actualizar con info reciente." />
              <AgendaBlock number={3} title="Definición estratégica" time="90 min"
                content="Norte estratégico, prioridades del año, iniciativas." />
              <AgendaBlock number={4} title="Organización y talento" time="45 min"
                content="Evaluación del equipo, plan de sucesión." />
              <AgendaBlock number={5} title="Cierre y compromisos" time="30 min"
                content="Acuerdos estratégicos, responsables, indicadores." />
            </div>
          </Accordion>

          <Accordion title="Reunión extraordinaria">
            <div className="mt-2 space-y-0.5">
              <AgendaBlock number={1} title="Convocatoria y contexto" time="15 min"
                content="Motivo, urgencia, plazo."
                nota="Una reunión mal convocada puede ser impugnable — revisar estatutos." />
              <AgendaBlock number={2} title="Presentación del tema" time="30 min"
                content="Exposición del CEO, alternativas, recomendación." />
              <AgendaBlock number={3} title="Debate del directorio" time="30 min"
                content="Preguntas, debate, análisis de riesgos." />
              <AgendaBlock number={4} title="Resolución formal" time="15 min"
                content="Votación, registro de votos, responsable de ejecución." />
            </div>
          </Accordion>
        </div>
      )}

      {/* Tab: Decisiones reservadas */}
      {tab === 'decisiones' && (
        <div className="space-y-3">
          {[
            {
              categoria: "Financiero",
              decisiones: [
                { nombre: "Endeudamiento significativo", frecuencia: "Siempre" },
                { nombre: "Distribución de utilidades", frecuencia: "Siempre" },
                { nombre: "Aprobación del presupuesto anual", frecuencia: "Anual" },
                { nombre: "Inversiones de capital relevantes", frecuencia: "Siempre" },
              ],
            },
            {
              categoria: "Estratégico",
              decisiones: [
                { nombre: "Ingreso a nuevos mercados", frecuencia: "Siempre" },
                { nombre: "Fusiones y adquisiciones", frecuencia: "Siempre" },
                { nombre: "Apertura o cierre de unidades", frecuencia: "Siempre" },
                { nombre: "Aprobación del plan estratégico", frecuencia: "Anual" },
              ],
            },
            {
              categoria: "Personas",
              decisiones: [
                { nombre: "Designación y remoción del CEO", frecuencia: "Siempre" },
                { nombre: "Compensación del equipo ejecutivo", frecuencia: "Anual" },
                { nombre: "Plan de sucesión de posiciones clave", frecuencia: "Anual" },
              ],
            },
            {
              categoria: "Legal",
              decisiones: [
                { nombre: "Contratos con partes relacionadas", frecuencia: "Siempre" },
                { nombre: "Litigios y acuerdos extrajudiciales", frecuencia: "Siempre" },
                { nombre: "Cambios en la estructura societaria", frecuencia: "Siempre" },
                { nombre: "Política de dividendos", frecuencia: "Anual" },
              ],
            },
          ].map(cat => (
            <div key={cat.categoria} className="border border-gray-200 rounded-xl bg-white p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{cat.categoria}</h3>
              <div className="space-y-2">
                {cat.decisiones.map(d => (
                  <div key={d.nombre} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-700">{d.nombre}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0
                      ${d.frecuencia === 'Siempre' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {d.frecuencia}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Estructura del acta */}
      {tab === 'acta' && (
        <div className="space-y-3">
          {[
            {
              number: 1,
              title: "Encabezado formal",
              content: "Número de acta, fecha/hora/lugar, directores presentes y ausentes, verificación de quórum.",
            },
            {
              number: 2,
              title: "Desarrollo de la reunión",
              content: "Resumen de temas tratados, documentos considerados, posiciones disidentes.",
            },
            {
              number: 3,
              title: "Resoluciones",
              content: "Texto de cada resolución, resultado de votación, responsable y plazo.",
            },
            {
              number: 4,
              title: "Cierre y firmas",
              content: "Hora de cierre, firmas de presentes.",
              nota: "En Argentina el libro de actas debe estar rubricado ante IGJ — un acta en Google Doc no reemplaza el libro societario.",
            },
          ].map(section => (
            <div key={section.number} className="border border-gray-200 rounded-xl bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#534AB7] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {section.number}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
                  {section.nota && (
                    <p className="text-xs text-[#534AB7] mt-2 italic">📌 {section.nota}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom navigation */}
      <div className="mt-6 flex gap-3">
        <button onClick={() => router.push('/modulo/3')} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
          ← Módulo 3
        </button>
        <button onClick={() => router.push('/modulo/5')} className="flex-1 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold">
          Módulo 5 →
        </button>
      </div>
    </ModuleLayout>
  );
}
