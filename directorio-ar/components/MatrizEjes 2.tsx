import { CORTE, CUADRANTES, type CuadranteKey, type Ejes } from '../lib/ejes';

// Matriz 2×2 Necesidad × Disposición. Arriba = más necesidad; derecha = más disposición.
const CELDAS: { key: CuadranteKey; pos: string }[] = [
  { key: 'sin_acuerdo', pos: 'col-start-1 row-start-1' },
  { key: 'armar', pos: 'col-start-2 row-start-1' },
  { key: 'todavia_no', pos: 'col-start-1 row-start-2' },
  { key: 'anticipada', pos: 'col-start-2 row-start-2' },
];

export default function MatrizEjes({ ejes, compacta = false }: { ejes: Ejes; compacta?: boolean }) {
  const { necesidad, disposicion, cuadrante, disposicionPreliminar } = ejes;
  if (necesidad === null || disposicion === null || !cuadrante) return null;
  const c = CUADRANTES[cuadrante];
  const descripcion = `Necesidad ${necesidad} de 100, disposición ${disposicion} de 100: ${c.titulo}.`;

  return (
    <figure className="m-0">
      <div className={`flex gap-2 ${compacta ? 'max-w-xs' : 'max-w-sm'} mx-auto`}>
        {/* Eje vertical */}
        <div className="flex flex-col justify-between items-center text-[11px] font-medium text-gray-600 py-1" aria-hidden>
          <span>Alta</span>
          <span className="[writing-mode:vertical-rl] rotate-180 font-semibold text-gray-700">Necesidad</span>
          <span>Baja</span>
        </div>

        <div className="flex-1">
          <div className="relative grid grid-cols-2 grid-rows-2 gap-1 aspect-square" role="img" aria-label={descripcion}>
            {CELDAS.map(({ key, pos }) => {
              const activa = key === cuadrante;
              const k = CUADRANTES[key];
              return (
                <div
                  key={key}
                  className={`${pos} rounded-lg p-2 flex items-start text-[11px] sm:text-xs leading-tight font-semibold border-2`}
                  style={{ backgroundColor: activa ? k.bg : '#F9FAFB', borderColor: activa ? k.color : 'transparent', color: activa ? k.color : '#6B7280' }}
                >
                  {k.titulo}
                </div>
              );
            })}
            {/* Punto de la empresa */}
            <span
              className="absolute w-4 h-4 -ml-2 -mb-2 rounded-full border-2 border-white shadow ring-2"
              style={{ left: `${disposicion}%`, bottom: `${necesidad}%`, backgroundColor: c.color, ['--tw-ring-color' as string]: c.color }}
              aria-hidden
            />
          </div>
          {/* Eje horizontal */}
          <div className="flex justify-between text-[11px] font-medium text-gray-600 mt-1" aria-hidden>
            <span>Baja</span>
            <span className="font-semibold text-gray-700">Disposición</span>
            <span>Alta</span>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 text-xs text-gray-600 text-center">
        Necesidad <strong className="text-gray-900 tabular-nums">{necesidad}</strong>/100 · Disposición{' '}
        <strong className="text-gray-900 tabular-nums">{disposicion}</strong>/100
        {disposicionPreliminar && <span className="block mt-0.5">Disposición preliminar: sale solo de la pregunta de presupuesto.</span>}
        <span className="sr-only"> Corte entre alto y bajo: {CORTE}.</span>
      </figcaption>
    </figure>
  );
}
