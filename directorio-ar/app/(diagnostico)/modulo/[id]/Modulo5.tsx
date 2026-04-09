'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleLayout from '../../../../components/ui/ModuleLayout';
import ProgressBar from '../../../../components/ui/ProgressBar';
import { AFIRMACIONES_M5, OPCIONES_M5, calcularModulo5 } from '../../../../lib/diagnostico/modulo5';
import { storage } from '../../../../lib/storage/storage';
import type { Modulo5Resultado } from '../../../../types';

type Tab = 'tensiones' | 'diagnostico' | 'protocolo';

const TENSIONES = [
  {
    titulo: "Micro-gestión encubierta",
    frecuencia: "Muy frecuente",
    descripcion: "El directorio opina sobre decisiones operativas que corresponden a la gerencia.",
    contexto: "En Argentina el dueño-director usa el directorio como extensión de su rol ejecutivo.",
    solucion: "Mapa de decisiones reservadas.",
  },
  {
    titulo: "Información filtrada",
    frecuencia: "Frecuente",
    descripcion: "La gerencia filtra qué información llega al directorio.",
    contexto: "En Argentina la información financiera real solo circula entre los dueños.",
    solucion: "Paquete de información estándar 5 días antes de cada reunión.",
  },
  {
    titulo: "El CEO que evita al directorio",
    frecuencia: "Frecuente",
    descripcion: "Ve al directorio como una carga.",
    contexto: "En Argentina cuando el CEO es el fundador esto se siente como pérdida de control.",
    solucion: "Trabajar la disposición del CEO antes de armar el directorio.",
  },
  {
    titulo: "Presidente y CEO en la misma persona",
    frecuencia: "Muy frecuente",
    descripcion: "Elimina el principal mecanismo de control.",
    contexto: "En Argentina esta figura está tan instalada que parece innecesario separarlos.",
    solucion: "Separar roles o designar un lead director independiente.",
  },
  {
    titulo: "Directorio que solo aprueba",
    frecuencia: "Frecuente",
    descripcion: "Nunca rechaza ni cuestiona en profundidad.",
    contexto: "En Argentina el directorio decorativo es la norma.",
    solucion: "Debate estructurado antes de cualquier votación.",
  },
  {
    titulo: "Directores que contactan la gerencia media",
    frecuencia: "Moderado",
    descripcion: "Rompe la cadena de mando.",
    contexto: "En Argentina la informalidad facilita este error.",
    solucion: "Acuerdo explícito de comunicación solo a través del CEO.",
  },
  {
    titulo: "Ausencia de evaluación mutua",
    frecuencia: "Moderado",
    descripcion: "Nadie mide cómo funciona la relación.",
    contexto: "En Argentina la evaluación del CEO por el directorio es prácticamente inexistente.",
    solucion: "Evaluación anual del CEO con criterios acordados de antemano.",
  },
];

const PROTOCOLO = [
  {
    number: 1,
    title: "Separar presidente del directorio y CEO",
    detail: "Con plan de transición si hoy son la misma persona.",
  },
  {
    number: 2,
    title: "Paquete de información estándar",
    detail: "Entregado 5 días hábiles antes de cada reunión, formato definido por el directorio.",
  },
  {
    number: 3,
    title: "Comunicación solo a través del CEO",
    detail: "Los directores no contactan gerentes de segunda línea salvo en auditoría formal.",
  },
  {
    number: 4,
    title: "Evaluación anual del CEO",
    detail: "Criterios acordados en enero, evaluación en diciembre.",
  },
  {
    number: 5,
    title: "Mapa de decisiones reservadas vigente",
    detail: "Revisado anualmente, publicado formalmente.",
  },
  {
    number: 6,
    title: "Autoevaluación anual del directorio",
    detail: "El directorio se pregunta si está funcionando bien.",
  },
];

const FRECUENCIA_COLORS: Record<string, string> = {
  "Muy frecuente": "bg-red-100 text-red-700",
  "Frecuente": "bg-orange-100 text-orange-700",
  "Moderado": "bg-yellow-100 text-yellow-800",
};

function TensionCard({ tension }: { tension: typeof TENSIONES[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between px-4 py-3.5 text-left bg-white hover:bg-gray-50 transition-colors gap-3"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{tension.titulo}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FRECUENCIA_COLORS[tension.frecuencia] ?? 'bg-gray-100 text-gray-600'}`}>
              {tension.frecuencia}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{tension.descripcion}</p>
        </div>
        <svg className={`w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 bg-white border-t border-gray-100 space-y-2">
          <div className="p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-700"><strong>Contexto AR:</strong> {tension.contexto}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl">
            <p className="text-xs text-green-700"><strong>Solución:</strong> {tension.solucion}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Modulo5() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('tensiones');
  const [respuestas, setRespuestas] = useState<(1 | 0.5 | 0 | null)[]>(new Array(10).fill(null));
  const [resultado, setResultado] = useState<Modulo5Resultado | null>(null);

  useEffect(() => {
    const saved = storage.getModulo5Respuestas();
    if (saved && saved.length === 10) {
      setRespuestas(saved as (1 | 0.5 | 0 | null)[]);
      const res = storage.getModulo5Resultado();
      if (res) setResultado(res);
    }
  }, []);

  function handleSelect(preguntaIdx: number, value: 1 | 0.5 | 0) {
    const updated = [...respuestas];
    updated[preguntaIdx] = value;
    setRespuestas(updated);
    const filtered = updated.map(v => v ?? 0) as (1 | 0.5 | 0)[];
    storage.setModulo5Respuestas(filtered);
    const res = calcularModulo5(filtered.filter((_, i) => updated[i] !== null) as (1 | 0.5 | 0)[]);
    const fullRes: Modulo5Resultado = { ...res, respuestas: filtered };
    storage.setModulo5Resultado(fullRes);
    setResultado(fullRes);
  }

  const answeredCount = respuestas.filter(v => v !== null).length;
  const allAnswered = answeredCount === 10;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tensiones', label: '7 Tensiones' },
    { key: 'diagnostico', label: 'Diagnóstico' },
    { key: 'protocolo', label: 'Protocolo' },
  ];

  const levelColor = (nivel: string) => {
    if (nivel?.includes('sana')) return 'bg-green-100 text-green-700';
    if (nivel?.includes('construcción')) return 'bg-yellow-100 text-yellow-800';
    if (nivel?.includes('serias')) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <ModuleLayout moduleNumber={5} title="Directorio y gerencia">
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

      {/* Tab: Las 7 tensiones */}
      {tab === 'tensiones' && (
        <div className="space-y-2">
          {TENSIONES.map((t, i) => <TensionCard key={i} tension={t} />)}
        </div>
      )}

      {/* Tab: Diagnóstico */}
      {tab === 'diagnostico' && (
        <div className="space-y-4">
          {resultado && (
            <div className="border border-gray-200 rounded-xl bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Estado de la relación</h3>
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold mb-3 ${levelColor(resultado.nivel)}`}>
                {resultado.nivel}
              </div>
              <ProgressBar percentage={resultado.porcentaje ?? 0} label={`${resultado.porcentaje}%`} />
              <p className="text-xs text-gray-500 mt-2">{answeredCount} de 10 afirmaciones evaluadas</p>
            </div>
          )}

          <div className="space-y-3">
            {AFIRMACIONES_M5.map((afirmacion, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl bg-white p-4">
                <p className="text-sm text-gray-800 mb-3 leading-snug">{idx + 1}. {afirmacion}</p>
                <div className="flex gap-2">
                  {OPCIONES_M5.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => handleSelect(idx, opt.value)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors
                        ${respuestas[idx] === opt.value
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

          {allAnswered && resultado && (
            <div className="border border-gray-200 rounded-xl bg-white p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Diagnóstico completo</p>
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${levelColor(resultado.nivel)}`}>
                {resultado.nivel}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Protocolo */}
      {tab === 'protocolo' && (
        <div className="space-y-3">
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
      )}

      {/* Bottom navigation */}
      <div className="mt-6 flex gap-3">
        <button onClick={() => router.push('/modulo/4')} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
          ← Módulo 4
        </button>
        <button onClick={() => router.push('/dashboard')} className="flex-1 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-xl text-sm font-semibold">
          Ver dashboard →
        </button>
      </div>
    </ModuleLayout>
  );
}
