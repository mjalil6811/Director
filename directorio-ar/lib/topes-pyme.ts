// Topes oficiales de ventas anuales para categorizar PyMEs (Argentina). ÚNICO lugar donde se cargan.
//
// ACTUALIZAR UNA VEZ POR AÑO: cuando salga una resolución nueva, cambiar NORMA_PYME y TOPES_VENTAS.
// Ventas = promedio de los últimos 3 ejercicios cerrados, sin IVA ni impuestos internos,
// deduciendo el 75% de las exportaciones.

export const NORMA_PYME = {
  /** Cómo se cita en la interfaz. */
  nombre: 'Res. SICYPYME 1/2026',
  nombreLargo: 'Resolución 1/2026 de la Secretaría de Industria, Comercio y de la Pequeña y Mediana Empresa',
  publicadaEn: 'Boletín Oficial, 1/4/2026',
  /** Fecha desde la que rigen los topes (ISO). */
  vigenteDesde: '2026-04-01',
  fuente: 'https://www.argentina.gob.ar/produccion/registrar-una-pyme/que-es-una-pyme',
} as const;

/**
 * Tipo de cambio para MOSTRAR los topes en dólares. Los topes oficiales son en pesos: la categoría
 * no cambia por esta conversión, solo cómo se lee el rango.
 * Dólar oficial Banco Nación, vendedor, al cierre del 17/11/2026.
 * TODO(matias): confirmar en bna.com.ar y actualizar cuando lo creas necesario (se cambia solo acá).
 */
export const TIPO_CAMBIO = {
  pesosPorDolar: 1575,
  fecha: '2026-11-17',
  referencia: 'dólar oficial Banco Nación, vendedor',
} as const;

export type SectorOficial ='construccion' | 'servicios' | 'comercio' | 'industria' | 'agropecuario';

/** Tope superior de ventas totales anuales (en pesos) de cada categoría. */
export const TOPES_VENTAS: Record<SectorOficial, { micro: number; pequena: number; tramo1: number; tramo2: number }> = {
  construccion: { micro: 743_730_000, pequena: 4_412_940_000, tramo1: 24_621_200_000, tramo2: 36_927_730_000 },
  servicios:    { micro: 374_060_000, pequena: 2_255_110_000, tramo1: 18_664_740_000, tramo2: 26_655_990_000 },
  comercio:     { micro: 1_738_060_000, pequena: 12_380_800_000, tramo1: 58_848_790_000, tramo2: 84_070_280_000 },
  // TODO(matias): Industria Tramo 2 — algunas fuentes publican 129.764.070.000 y otras 129.794.070.000.
  // Verificar contra el anexo de la resolución en el Boletín Oficial.
  industria:    { micro: 1_207_910_000, pequena: 9_025_610_000, tramo1: 64_238_670_000, tramo2: 129_794_070_000 },
  agropecuario: { micro: 909_260_000, pequena: 3_349_360_000, tramo1: 19_711_080_000, tramo2: 31_263_100_000 },
};
