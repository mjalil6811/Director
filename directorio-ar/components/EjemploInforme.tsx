'use client';

import { ScoreGauge, GovernanceRadar } from './charts';
import { REFERENCIA_RADAR } from '../lib/indice';

// Datos FICTICIOS, solo para mostrar cómo se ve un informe. No corresponden a ninguna empresa real.
const EJEMPLO = {
  empresa: 'Empresa ejemplo S.A.',
  perfil: 'Mediana tramo 1 · Industria · 120 empleados',
  indice: 54,
  nivel: 'Intermedio',
  dimensiones: [
    { label: 'Complejidad', score: 70 },
    { label: 'Decisiones', score: 35 },
    { label: 'Perfiles', score: 60 },
    { label: 'Disposición', score: 67 },
    { label: 'Gerencia', score: 50 },
  ],
  lectura: [
    'Las decisiones de inversión y precios dependen casi solo del dueño: es el punto más urgente.',
    'Conviene sumar primero un asesor financiero independiente.',
    'Hay disposición al cambio: se puede arrancar con reuniones bimestrales.',
  ],
};

export default function EjemploInforme() {
  return (
    <figure className="relative bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden" aria-label="Ejemplo ilustrativo de informe con datos ficticios">
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs font-semibold text-amber-900">
        Ejemplo ilustrativo con datos ficticios
      </div>
      <div className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-36 shrink-0"><ScoreGauge value={EJEMPLO.indice} color="#534AB7" /></div>
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-900">Índice {EJEMPLO.indice}/100 · {EJEMPLO.nivel}</p>
            <p className="text-xs text-gray-600 mt-0.5">{EJEMPLO.empresa}</p>
            <p className="text-xs text-gray-500">{EJEMPLO.perfil}</p>
          </div>
        </div>
        <div className="min-w-0 mt-2">
          <GovernanceRadar data={EJEMPLO.dimensiones} referencia={REFERENCIA_RADAR.valor} referenciaLabel={`Referencia: ${REFERENCIA_RADAR.label.toLowerCase()}`} />
        </div>
      </div>
      <figcaption className="border-t border-gray-100 px-5 py-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lectura del resultado</p>
        <ul className="space-y-1.5">
          {EJEMPLO.lectura.map(t => (
            <li key={t} className="text-sm text-gray-700 leading-relaxed flex gap-2">
              <span className="text-brand" aria-hidden>•</span>{t}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
