'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../../components/ui/ModuleLayout';
import { storage } from '../../../../lib/storage/storage';
import type { Modulo4Diagnostico } from '../../../../types';

type Tab = 'frecuencia' | 'decisiones' | 'relacion' | 'autoevaluacion';

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
          <p className="text-xs text-[#534AB7] mt-1 italic">{nota}</p>
        )}
      </div>
    </div>
  );
}

const PRACTICA_ITEMS = [
  {
    titulo: "Micro-gestión encubierta",
    loQuePasa: "El directorio opina sobre decisiones operativas que corresponden a la gerencia. En Argentina el dueño-director usa el directorio como extensión de su rol ejecutivo.",
    loQueDeberiaPasar: "El directorio aplica el principio de 'stay out' para decisiones operativas: se enfoca en lo estratégico y reservado. La gerencia opera con autonomía real dentro de los límites aprobados.",
    comoLograrlo: "Definir un mapa de decisiones reservadas claro que distinga tres modos: qué lidera el directorio ('take charge'), qué acompaña ('partner') y de qué se mantiene al margen ('stay out'). Todo lo que no está en ese mapa es responsabilidad de la gerencia.",
  },
  {
    titulo: "Información filtrada",
    loQuePasa: "La gerencia filtra qué información llega al directorio. En Argentina la información financiera real solo circula entre los dueños.",
    loQueDeberiaPasar: "El directorio recibe un paquete de información completo y estandarizado antes de cada reunión. La calidad de las decisiones depende de la calidad de la información.",
    comoLograrlo: "Acordar un formato de paquete de información y enviarlo 5 días hábiles antes de cada reunión. Sin excepciones. El directorio debe definir qué información necesita — no esperar que la gerencia decida qué mostrar.",
  },
  {
    titulo: "El CEO que evita al directorio",
    loQuePasa: "El CEO ve al directorio como una carga o pérdida de control. En Argentina cuando el CEO es el fundador, esto se siente como amenaza.",
    loQueDeberiaPasar: "El CEO valora al directorio como socio estratégico que mejora sus decisiones. El directorio no está para controlar al CEO — está para hacerlo mejor.",
    comoLograrlo: "Trabajar la disposición del CEO antes de armar el directorio. Practicar la 'indagación antes que la recomendación': que el CEO sienta que el directorio pregunta para entender, no para juzgar. Empezar con un advisory board informal si es necesario.",
  },
  {
    titulo: "Presidente y CEO en la misma persona",
    loQuePasa: "Elimina el principal mecanismo de control. En Argentina esta figura está tan instalada que parece innecesario separarlos.",
    loQueDeberiaPasar: "Las funciones de presidencia del directorio y gerencia general están separadas, al menos funcionalmente. El directorio funciona como equipo con liderazgo propio.",
    comoLograrlo: "Separar roles progresivamente o designar un lead director independiente que lidere las reuniones. El presidente del directorio fija la agenda y facilita el debate — el CEO presenta y responde.",
  },
  {
    titulo: "Directorio que solo aprueba",
    loQuePasa: "Nunca rechaza ni cuestiona en profundidad. En Argentina el directorio decorativo es la norma.",
    loQueDeberiaPasar: "El directorio debate, cuestiona y a veces rechaza propuestas. La efectividad del directorio como equipo depende de la calidad del debate, no de la rapidez de la aprobación.",
    comoLograrlo: "Practicar la 'indagación antes que la recomendación': antes de votar, hacer rondas de preguntas abiertas. Fomentar que al menos un director haga de 'abogado del diablo'. La diversidad de perspectivas solo agrega valor si hay debate genuino.",
  },
  {
    titulo: "Directores que contactan la gerencia media",
    loQuePasa: "Rompe la cadena de mando y genera confusión. En Argentina la informalidad facilita este error. Es la diferencia entre gobernar y gestionar.",
    loQueDeberiaPasar: "Toda la comunicación entre directorio y empresa pasa a través del CEO. El directorio gobierna — la gerencia gestiona.",
    comoLograrlo: "Establecer un acuerdo explícito desde el día 1: el directorio se mantiene al margen de la operación diaria ('stay out'). La única excepción es la auditoría formal.",
  },
  {
    titulo: "Ausencia de evaluación mutua",
    loQuePasa: "Nadie mide cómo funciona la relación directorio-gerencia. En Argentina la evaluación del CEO por el directorio es prácticamente inexistente.",
    loQueDeberiaPasar: "Hay una evaluación anual del CEO y una autoevaluación del directorio como equipo. No alcanza con evaluar individuos — hay que evaluar cómo funciona el equipo en conjunto.",
    comoLograrlo: "Definir criterios de evaluación en enero. Evaluar en diciembre. Incluir preguntas clave: ¿estamos enfocados en los temas correctos? ¿desafiamos constructivamente? ¿funcionamos como equipo o como grupo de individuos?",
  },
];

const PROTOCOLO = [
  { number: 1, title: "Separar presidente del directorio y CEO", detail: "Con plan de transición si hoy son la misma persona." },
  { number: 2, title: "Paquete de información estándar", detail: "Entregado 5 días hábiles antes de cada reunión, formato definido por el directorio." },
  { number: 3, title: "Comunicación solo a través del CEO", detail: "Los directores no contactan gerentes de segunda línea salvo en auditoría formal." },
  { number: 4, title: "Evaluación anual del CEO", detail: "Criterios acordados en enero, evaluación en diciembre." },
  { number: 5, title: "Mapa de decisiones reservadas vigente", detail: "Revisado anualmente, publicado formalmente." },
  { number: 6, title: "Autoevaluación anual del directorio", detail: "El directorio se pregunta si está funcionando bien." },
  { number: 7, title: "Mapa de modos de intervención", detail: "Definir para cada tipo de decisión si el directorio lidera, acompaña o se mantiene al margen. Revisarlo cada semestre." },
];

const DIAG_PREGUNTAS = [
  "¿El CEO o dueño estaría dispuesto a presentar resultados formalmente ante el directorio?",
  "¿Existe o podría existir una separación real entre quién preside el directorio y quién gerencia?",
  "¿La empresa podría comprometerse a enviar información financiera antes de cada reunión?",
  "¿Hay disposición a que el directorio cuestione decisiones del CEO?",
  "¿Se aceptaría una evaluación anual del desempeño del CEO por parte del directorio?",
];

export default function Modulo4() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('frecuencia');
  const [frecuencia, setFrecuencia] = useState<string>('');
  const [diagRespuestas, setDiagRespuestas] = useState<(1 | 0.5 | 0 | null)[]>(new Array(5).fill(null));
  const [diagResultado, setDiagResultado] = useState<Modulo4Diagnostico | null>(null);

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

    const savedDiag = storage.getModulo4Diagnostico();
    if (savedDiag) {
      setDiagResultado(savedDiag);
    }
  }, []);

  function handleDiagSelect(idx: number, value: 1 | 0.5 | 0) {
    const updated = [...diagRespuestas];
    updated[idx] = value;
    setDiagRespuestas(updated);

    const answered = updated.filter(v => v !== null);
    if (answered.length === 5) {
      const sum = answered.reduce<number>((s, v) => s + (v ?? 0), 0);
      const porcentaje = Math.round((sum / 5) * 100);
      let nivel: string;
      if (porcentaje >= 80) nivel = "Estas listo para dar el paso";
      else if (porcentaje >= 50) nivel = "Casi listo — hay cosas por resolver";
      else nivel = "Todavia no — trabaja primero en estos puntos";

      const diag: Modulo4Diagnostico = { score: sum, porcentaje, nivel };
      setDiagResultado(diag);
      storage.setModulo4Diagnostico(diag);
    }
  }

  const diagAnswered = diagRespuestas.filter(v => v !== null).length;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'frecuencia', label: 'Frecuencia' },
    { key: 'decisiones', label: 'Decisiones' },
    { key: 'relacion', label: 'En la práctica' },
    { key: 'autoevaluacion', label: '¿Estás listo?' },
  ];

  return (
    <ModuleLayout moduleNumber={4} title="Dinámica y funcionamiento">
      <div className="border border-purple-100 bg-purple-50 rounded-xl px-5 py-4 mb-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          Este módulo te muestra cómo funciona un directorio en la práctica: frecuencia de reuniones, qué decisiones le corresponden, y una autoevaluación para saber si estás listo para dar el paso.
        </p>
      </div>

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

      {/* Tab: Frecuencia y agenda */}
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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipos de reuniones</p>
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
              <AgendaBlock number={1} title="Revisión del año" time="60 min" content="Balance estratégico, evaluación de decisiones tomadas." />
              <AgendaBlock number={2} title="Análisis de contexto" time="60 min" content="Macroeconomía argentina, movimientos de la industria."
                nota="En Argentina el contexto macro cambia rápido — actualizar con info reciente." />
              <AgendaBlock number={3} title="Definición estratégica" time="90 min" content="Norte estratégico, prioridades del año, iniciativas." />
              <AgendaBlock number={4} title="Organización y talento" time="45 min" content="Evaluación del equipo, plan de sucesión." />
              <AgendaBlock number={5} title="Cierre y compromisos" time="30 min" content="Acuerdos estratégicos, responsables, indicadores." />
            </div>
          </Accordion>

          <Accordion title="Reunión extraordinaria">
            <div className="mt-2 space-y-0.5">
              <AgendaBlock number={1} title="Convocatoria y contexto" time="15 min" content="Motivo, urgencia, plazo."
                nota="Una reunión mal convocada puede ser impugnable — revisar estatutos." />
              <AgendaBlock number={2} title="Presentación del tema" time="30 min" content="Exposición del CEO, alternativas, recomendación." />
              <AgendaBlock number={3} title="Debate del directorio" time="30 min" content="Preguntas, debate, análisis de riesgos." />
              <AgendaBlock number={4} title="Resolución formal" time="15 min" content="Votación, registro de votos, responsable de ejecución." />
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

      {/* Tab: Cómo funciona en la práctica */}
      {tab === 'relacion' && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cómo funciona en la práctica</p>
          <p className="text-sm text-gray-500 mb-2">Las 7 situaciones más comunes en la relación directorio-gerencia y cómo resolverlas.</p>
          <div className="space-y-3">
            {PRACTICA_ITEMS.map((item, i) => (
              <details key={i} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                <summary className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 select-none">
                  <span className="text-sm font-semibold text-gray-900">{item.titulo}</span>
                  <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-3">
                  <div className="p-3 bg-red-50 rounded-xl">
                    <p className="text-xs font-semibold text-red-700 mb-1">Lo que suele pasar</p>
                    <p className="text-xs text-red-600 leading-relaxed">{item.loQuePasa}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <p className="text-xs font-semibold text-green-700 mb-1">Lo que deberia pasar</p>
                    <p className="text-xs text-green-600 leading-relaxed">{item.loQueDeberiaPasar}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <p className="text-xs font-semibold text-[#534AB7] mb-1">Como lograrlo</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{item.comoLograrlo}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6">Protocolo de convivencia</p>
          <div className="space-y-2">
            {PROTOCOLO.map(item => (
              <div key={item.number} className="border border-gray-200 rounded-xl bg-white p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#534AB7] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.number}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: ¿Estás listo para dar el paso? */}
      {tab === 'autoevaluacion' && (
        <div className="space-y-4">
          {diagResultado && (() => {
            const pct = diagResultado.porcentaje;
            const noCount = diagRespuestas.filter(v => v === 0).length;
            const parcialCount = diagRespuestas.filter(v => v === 0.5).length;
            let readyLabel: string;
            let readyColor: string;
            let readyBg: string;
            let readyDesc: string;
            if (pct >= 80) {
              readyLabel = "Estas listo";
              readyColor = "text-green-700";
              readyBg = "bg-green-100";
              readyDesc = "Tu empresa tiene la disposicion necesaria para implementar un directorio formal. Las condiciones estan dadas para dar el paso.";
            } else if (pct >= 50) {
              readyLabel = `Casi listo — hay ${noCount + parcialCount} punto${noCount + parcialCount !== 1 ? 's' : ''} por resolver`;
              readyColor = "text-yellow-700";
              readyBg = "bg-yellow-100";
              readyDesc = "Hay buena base pero algunos aspectos necesitan trabajo previo. Resolvellos antes de formalizar el directorio.";
            } else {
              readyLabel = "Todavia no — trabaja primero en estos puntos";
              readyColor = "text-red-700";
              readyBg = "bg-red-100";
              readyDesc = "La disposicion al gobierno corporativo todavia es baja. Antes de armar un directorio, trabaja en la apertura al control externo.";
            }
            return (
              <div className={`border-2 rounded-xl p-5 ${pct >= 80 ? 'border-green-300' : pct >= 50 ? 'border-yellow-300' : 'border-red-300'}`}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Resultado</p>
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold mb-3 ${readyBg} ${readyColor}`}>
                  {readyLabel}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div className="h-2.5 rounded-full bg-[#534AB7] transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-2 mb-3">{pct}% — {diagAnswered} de 5 respondidas</p>
                <p className="text-sm text-gray-700 leading-relaxed">{readyDesc}</p>
              </div>
            );
          })()}

          <div className="space-y-3">
            {DIAG_PREGUNTAS.map((pregunta, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl bg-white p-4">
                <p className="text-sm text-gray-800 mb-3 leading-snug">{idx + 1}. {pregunta}</p>
                <div className="flex gap-2">
                  {[
                    { label: "Sí", value: 1 as const },
                    { label: "Parcial", value: 0.5 as const },
                    { label: "No", value: 0 as const },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => handleDiagSelect(idx, opt.value)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors
                        ${diagRespuestas[idx] === opt.value
                          ? opt.value === 1 ? 'bg-green-500 border-green-500 text-white'
                            : opt.value === 0.5 ? 'bg-yellow-400 border-yellow-400 text-white'
                            : 'bg-red-500 border-red-500 text-white'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="mt-6 flex gap-3">
        <button onClick={() => router.push('/modulo/3')} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
          ← Módulo 3
        </button>
        <button onClick={() => router.push('/dashboard')} className="flex-1 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold">
          Ver dashboard →
        </button>
      </div>
    </ModuleLayout>
  );
}
