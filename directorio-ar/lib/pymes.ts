// Criterios oficiales de categorización PyME (Argentina) y perfil de quien responde.
//
// ACTUALIZAR UNA VEZ POR AÑO: cuando salga una nueva resolución, cambiar NORMA_TOPES y TOPES_VENTAS.
// Fuente: https://www.argentina.gob.ar/produccion/registrar-una-pyme/que-es-una-pyme
// Ventas = promedio de los últimos 3 ejercicios cerrados, sin IVA ni impuestos internos,
// deduciendo el 75% de las exportaciones.

export const NORMA_TOPES = 'Res. SICYPYME 1/2026, vigente desde el 1/4/2026';

export type SectorOficial = 'construccion' | 'servicios' | 'comercio' | 'industria' | 'agropecuario';

/** Tope superior de ventas totales anuales (en pesos) de cada categoría. */
export const TOPES_VENTAS: Record<SectorOficial, { micro: number; pequena: number; tramo1: number; tramo2: number }> = {
  construccion: { micro: 743_730_000, pequena: 4_412_940_000, tramo1: 24_621_200_000, tramo2: 36_927_730_000 },
  servicios:    { micro: 374_060_000, pequena: 2_255_110_000, tramo1: 18_664_740_000, tramo2: 26_655_990_000 },
  comercio:     { micro: 1_738_060_000, pequena: 12_380_800_000, tramo1: 58_848_790_000, tramo2: 84_070_280_000 },
  // Industria Tramo 2: algunas fuentes publican 129.764.070.000; verificar en el anexo del Boletín Oficial.
  industria:    { micro: 1_207_910_000, pequena: 9_025_610_000, tramo1: 64_238_670_000, tramo2: 129_794_070_000 },
  agropecuario: { micro: 909_260_000, pequena: 3_349_360_000, tramo1: 19_711_080_000, tramo2: 31_263_100_000 },
};

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
export const OPCIONES_EMPLEADOS = [
  { texto: 'Menos de 50 personas', puntaje: 0, masDe50: false },
  { texto: 'Entre 50 y 200 personas', puntaje: 1, masDe50: true },
  { texto: 'Entre 200 y 400 personas', puntaje: 2, masDe50: true },
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
