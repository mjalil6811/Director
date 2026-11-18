// Criterios oficiales de categorización PyME (Argentina) y perfil de quien responde.
// Los topes y la norma vigente están en lib/topes-pyme.ts (único lugar a actualizar).
import { NORMA_PYME, TOPES_VENTAS, type SectorOficial } from './topes-pyme';

export { NORMA_PYME, TOPES_VENTAS, type SectorOficial };

export const VIGENCIA = NORMA_PYME.vigenteDesde.split('-').reverse().map(Number).join('/');
export const NORMA_TOPES = `${NORMA_PYME.nombre}, vigente desde el ${VIGENCIA}`;

// ——— Industrias (6 opciones, cada una mapeada a su sector oficial) ———————————————

export type IndustriaKey = 'industria' | 'comercio' | 'servicios' | 'tecnologia' | 'construccion' | 'agro';

export const INDUSTRIAS: { key: IndustriaKey; label: string; ejemplos: string; sector: SectorOficial }[] = [
  { key: 'industria', label: 'Industria y minería', ejemplos: 'Alimentos, metalmecánica, textil, química, plásticos', sector: 'industria' },
  { key: 'comercio', label: 'Comercio', ejemplos: 'Mayorista, minorista, distribución, concesionarias', sector: 'comercio' },
  { key: 'servicios', label: 'Servicios', ejemplos: 'Salud, logística, educación, profesionales, inmobiliarios', sector: 'servicios' },
  { key: 'tecnologia', label: 'Tecnología y software', ejemplos: 'Desarrollo de software, servicios digitales, IT', sector: 'servicios' },
  { key: 'construccion', label: 'Construcción', ejemplos: 'Obras civiles, viviendas, instalaciones', sector: 'construccion' },
  { key: 'agro', label: 'Agropecuario', ejemplos: 'Producción agrícola, ganadera, frutícola', sector: 'agropecuario' },
];

// ——— Categorías ———————————————————————————————————————————————————————————

export type CategoriaPyme = 'micro' | 'pequena' | 'tramo1' | 'tramo2' | 'grande' | 'desconocida';

export const CATEGORIA_LABEL: Record<CategoriaPyme, string> = {
  micro: 'Microempresa',
  pequena: 'Pequeña empresa',
  tramo1: 'Mediana Tramo 1',
  tramo2: 'Mediana Tramo 2',
  grande: 'Gran empresa',
  desconocida: 'Sin datos de facturación',
};

/**
 * Monto redondeado y fácil de leer:
 * - menos de 10.000 millones → "$2.300 millones" (redondeado a 100 millones)
 * - desde 10.000 millones    → "$18,7 mil millones" (un decimal)
 * Solo cambia cómo se MUESTRA el corte; la categoría sale del índice de la opción elegida.
 */
function monto(pesos: number): string {
  const m = pesos / 1_000_000;
  if (m < 10_000) return `$${(Math.round(m / 100) * 100).toLocaleString('es-AR')} millones`;
  return `$${(Math.round(m / 100) / 10).toLocaleString('es-AR', { maximumFractionDigits: 1 })} mil millones`;
}

/**
 * Opciones de facturación para un sector. El ORDEN de categorías es el mismo para todos los
 * sectores, así el índice guardado sigue siendo válido si el usuario cambia de industria.
 */
export function opcionesFacturacion(sector: SectorOficial): { texto: string; categoria: CategoriaPyme; puntaje: number | null }[] {
  const t = TOPES_VENTAS[sector];
  return [
    { texto: `Hasta ${monto(t.micro)} — Microempresa`, categoria: 'micro', puntaje: 0 },
    { texto: `De ${monto(t.micro)} a ${monto(t.pequena)} — Pequeña empresa`, categoria: 'pequena', puntaje: 1 },
    { texto: `De ${monto(t.pequena)} a ${monto(t.tramo1)} — Mediana Tramo 1`, categoria: 'tramo1', puntaje: 2 },
    { texto: `De ${monto(t.tramo1)} a ${monto(t.tramo2)} — Mediana Tramo 2`, categoria: 'tramo2', puntaje: 3 },
    { texto: `Más de ${monto(t.tramo2)} — Gran empresa`, categoria: 'grande', puntaje: 3 },
    { texto: 'No lo sé', categoria: 'desconocida', puntaje: null },
  ];
}

// ——— Empleados ——————————————————————————————————————————————————————————————

// Criterio propio de Directorio AR (no oficial): más de 50 empleados entra al público objetivo (masDe50).
// Los tramos de menos de 50 valen 0 los dos: el puntaje de quien respondió "Menos de 50" no cambia.
export const OPCIONES_EMPLEADOS = [
  { texto: 'Menos de 10 personas', puntaje: 0, masDe50: false },
  { texto: 'De 10 a 49 personas', puntaje: 0, masDe50: false },
  { texto: 'De 50 a 200 personas', puntaje: 1, masDe50: true },
  { texto: 'De 201 a 400 personas', puntaje: 2, masDe50: true },
  { texto: 'Más de 400 personas', puntaje: 3, masDe50: true },
];

// ——— Quién responde ———————————————————————————————————————————————————————

/** Agrupa los roles según su relación con la empresa: cambia cómo se formulan las preguntas. */
export type GrupoRol = 'propietario' | 'gestor' | 'familiar';

export type RolKey = 'dueno' | 'fundador' | 'socio' | 'ceo' | 'familiar' | 'directivo';

export const ROLES: { key: RolKey; label: string; grupo: GrupoRol }[] = [
  { key: 'dueno', label: 'Soy el dueño (único accionista)', grupo: 'propietario' },
  { key: 'fundador', label: 'Soy socio fundador', grupo: 'propietario' },
  { key: 'socio', label: 'Soy socio (no fundador)', grupo: 'propietario' },
  { key: 'ceo', label: 'Soy CEO o gerente general, sin ser socio', grupo: 'gestor' },
  { key: 'familiar', label: 'Soy accionista o familiar de los dueños, sin cargo de gestión', grupo: 'familiar' },
  { key: 'directivo', label: 'Otro directivo o asesor (CFO, gerente de área, contador)', grupo: 'gestor' },
];

// ——— Perfil resultante ——————————————————————————————————————————————————————

export type PerfilEmpresa = {
  rol: RolKey;
  grupo: GrupoRol;
  industria: IndustriaKey;
  sector: SectorOficial;
  categoria: CategoriaPyme;
  masDe50Empleados: boolean;
  /** Mediana Tramo 1/2 por facturación, o más de 50 empleados. Sin datos de facturación: se asume que sí. */
  enObjetivo: boolean;
  /** 'abreviado' = termina en el informe preliminar (M1 + M2). */
  recorrido: 'completo' | 'abreviado';
};

export function calcularPerfil(rolIdx: number, industriaIdx: number, facturacionIdx: number, empleadosIdx: number): PerfilEmpresa | null {
  const rol = ROLES[rolIdx];
  const ind = INDUSTRIAS[industriaIdx];
  const fact = ind ? opcionesFacturacion(ind.sector)[facturacionIdx] : undefined;
  const emp = OPCIONES_EMPLEADOS[empleadosIdx];
  if (!rol || !ind || !fact || !emp) return null;
  const porFacturacion = fact.categoria === 'tramo1' || fact.categoria === 'tramo2' || fact.categoria === 'grande';
  const enObjetivo = porFacturacion || emp.masDe50 || fact.categoria === 'desconocida';
  return {
    rol: rol.key,
    grupo: rol.grupo,
    industria: ind.key,
    sector: ind.sector,
    categoria: fact.categoria,
    masDe50Empleados: emp.masDe50,
    enObjetivo,
    recorrido: enObjetivo ? 'completo' : 'abreviado',
  };
}

/** Grupo por defecto mientras no se respondió la pregunta 1. */
export function grupoDeRol(rolIdx: number | undefined): GrupoRol {
  return (rolIdx !== undefined && ROLES[rolIdx]?.grupo) || 'propietario';
}
