import MatrizEjes from './MatrizEjes';
import { CUADRANTES, cuadranteDe, type Ejes } from '../lib/ejes';

// Datos FICTICIOS, solo para mostrar cómo se ve un informe. No corresponden a ninguna empresa real.
const NECESIDAD = 68;
const DISPOSICION = 42;
const EJES: Ejes = { necesidad: NECESIDAD, disposicion: DISPOSICION, cuadrante: cuadranteDe(NECESIDAD, DISPOSICION), disposicionPreliminar: false };

const EJEMPLO = {
  empresa: 'Empresa ejemplo S.A.',
  perfil: 'Mediana tramo 1 · Industria · 120 empleados',
  lectura: [
    'Las decisiones de inversión y precios dependen casi solo del dueño: es el punto más urgente.',
    'El primer perfil a sumar es un asesor financiero independiente.',
  ],
};

/** `compacto`: versión para el hero (sin la lista de lectura). */
export default function EjemploInforme({ compacto = false }: { compacto?: boolean }) {
  const c = CUADRANTES[EJES.cuadrante!];
  return (
    <figure className="relative bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden m-0" aria-label="Ejemplo ilustrativo de informe con datos ficticios">
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs font-semibold text-amber-900">
        Ejemplo ilustrativo con datos ficticios
      </div>
      <div className="p-5">
        <p className="text-xs text-gray-600">{EJEMPLO.empresa} · {EJEMPLO.perfil}</p>
        <p className="text-lg font-bold mt-1" style={{ color: c.color }}>{c.titulo}</p>
        <p className="text-sm text-gray-700 leading-relaxed mt-0.5">{c.resumen}</p>
        <div className={compacto ? 'mt-3' : 'mt-4'}>
          <MatrizEjes ejes={EJES} compacta />
        </div>
      </div>
      <figcaption className="border-t border-gray-100 px-5 py-4">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Lectura del resultado</p>
        <ul className="space-y-1.5">
          <li className="text-sm text-gray-900 leading-relaxed flex gap-2">
            <span className="text-brand" aria-hidden>→</span><span><strong>Próximo paso:</strong> {c.proximoPaso}</span>
          </li>
          {!compacto && EJEMPLO.lectura.map(t => (
            <li key={t} className="text-sm text-gray-700 leading-relaxed flex gap-2">
              <span className="text-brand" aria-hidden>•</span>{t}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
