import type { Modulo1Resultado } from "../types";
import { INDUSTRIAS, opcionesFacturacion, calcularPerfil, grupoDeRol, CATEGORIA_LABEL, type SectorOficial, type PerfilEmpresa } from "./pymes";
import { PREGUNTAS_M1 as PREGUNTAS, DIMENSIONES_M1, IDX, OBJETIVOS, texto as txt, type DimensionKey, type ObjetivoKey } from "./preguntas";

export { DIMENSIONES_M1, IDX, type DimensionKey } from "./preguntas";

/** Pregunta lista para mostrar, ya adaptada a quien responde y a su industria. */
export type PreguntaResuelta = { id: string; texto: string; aclaracion: string; opciones: { texto: string; puntaje: number | null }[] };

export const TOTAL_PREGUNTAS = PREGUNTAS.length;

/** Recomendación según lo que la persona espera lograr con el consejo (no afecta el puntaje). */
const RECO_OBJETIVO: Record<ObjetivoKey, string> = {
  ordenar: "Buscás ordenar cómo se decide: el primer paso es acordar qué decisiones pasan por el consejo y cuáles quedan en manos de la gerencia.",
  conflictos: "Buscás resolver diferencias entre socios: un consejo con al menos un integrante independiente ofrece un espacio neutral para tratarlas, con reglas acordadas de antemano.",
  sucesion: "Buscás preparar la sucesión: el consejo puede acompañar el traspaso con un plan por etapas y criterios acordados para elegir y evaluar a quien suceda.",
  financiamiento: "Buscás acceder a crédito o inversión: información financiera ordenada y decisiones registradas en actas facilitan la conversación con bancos e inversores.",
  profesionalizar: "Buscás profesionalizar la gestión: conviene empezar por un tablero de indicadores y una reunión mensual de seguimiento con la gerencia.",
};

// ─── Resolución por contexto ───────────────────────────────────────────────────

function sectorDe(respuestas: number[]): SectorOficial {
  return INDUSTRIAS[respuestas[IDX.industria]]?.sector ?? "servicios";
}

/** Devuelve la pregunta `idx` adaptada a lo que ya respondió el usuario (rol e industria). */
export function resolverPregunta(idx: number, respuestas: number[]): PreguntaResuelta {
  const p = PREGUNTAS[idx];
  const grupo = grupoDeRol(respuestas[IDX.rol] >= 0 ? respuestas[IDX.rol] : undefined);
  const opciones = p.opciones === "facturacion"
    ? opcionesFacturacion(sectorDe(respuestas)).map(o => ({ texto: o.texto, puntaje: o.puntaje }))
    : p.opciones.map(o => ({ texto: txt(o.texto, grupo), puntaje: o.puntaje }));
  return { id: p.id, texto: txt(p.texto, grupo), aclaracion: txt(p.aclaracion, grupo), opciones };
}

/** Perfil parcial a partir de las respuestas (null hasta que estén las 4 primeras). */
export function perfilDeRespuestas(respuestas: number[]): PerfilEmpresa | null {
  return calcularPerfil(respuestas[IDX.rol], respuestas[IDX.industria], respuestas[IDX.facturacion], respuestas[IDX.empleados]);
}

// ─── Niveles ───────────────────────────────────────────────────────────────────

export const NIVELES = {
  prematuro:  { label: "Directorio prematuro",  descripcion: "La empresa aún no reúne las condiciones para que un directorio agregue valor real. Hay etapas previas a resolver.", color: "#3B6D11", bgColor: "#EAF3DE" },
  temprano:   { label: "Señales tempranas",     descripcion: "Existen indicadores que justifican pensar en un consejo asesor o directorio, pero el timing depende de cómo evolucionen ciertos factores clave.", color: "#854F0B", bgColor: "#FAEEDA" },
  transicion: { label: "Momento de transición", descripcion: "La empresa está en un punto de inflexión. Armar un directorio en los próximos 12–18 meses sería estratégicamente oportuno.", color: "#185FA5", bgColor: "#E6F1FB" },
  urgente:    { label: "Necesidad urgente",     descripcion: "La empresa tiene múltiples factores que hacen que operar sin un directorio sea un riesgo real. El proceso debería iniciarse cuanto antes.", color: "#993C1D", bgColor: "#FAECE7" },
} as const;

export type NivelKey = keyof typeof NIVELES;

export function calcularNivel(porcentaje: number): NivelKey {
  if (porcentaje < 30) return "prematuro";
  if (porcentaje < 55) return "temprano";
  if (porcentaje < 75) return "transicion";
  return "urgente";
}

// ─── Puntaje ───────────────────────────────────────────────────────────────────
// El "empuje" hacia la necesidad sale solo de las respuestas: cada pregunta puntuable suma 0–3
// a su dimensión. Las preguntas sin dato (p. ej. facturación "No lo sé") no cuentan en el máximo.

export function calcularModulo1(respuestas: number[]): Modulo1Resultado {
  const acc = Object.fromEntries(DIMENSIONES_M1.map(d => [d.key, { score: 0, max: 0 }])) as Record<DimensionKey, { score: number; max: number }>;

  PREGUNTAS.forEach((p, idx) => {
    if (!p.dimension) return;
    const opcion = resolverPregunta(idx, respuestas).opciones[respuestas[idx]];
    if (!opcion || opcion.puntaje === null) return;
    acc[p.dimension].score += opcion.puntaje;
    acc[p.dimension].max += 3;
  });

  const scoresDim = DIMENSIONES_M1
    .filter(d => acc[d.key].max > 0)
    .map(d => ({ key: d.key, nombre: d.nombre, score: acc[d.key].score, max: acc[d.key].max, porcentaje: Math.round((acc[d.key].score / acc[d.key].max) * 100) }));

  // El porcentaje mide NECESIDAD: el presupuesto (disposición) se muestra como dimensión pero no suma acá.
  // Va al eje de Disposición (lib/ejes.ts).
  const deNecesidad = scoresDim.filter(d => d.key !== "disponibilidad");
  const scoreTotal = deNecesidad.reduce((a, d) => a + d.score, 0);
  const maxTotal = deNecesidad.reduce((a, d) => a + d.max, 0);
  const porcentaje = maxTotal > 0 ? Math.round((scoreTotal / maxTotal) * 100) : 0;
  const nivel = NIVELES[calcularNivel(porcentaje)].label;
  const perfil = perfilDeRespuestas(respuestas) ?? undefined;

  const get = (key: DimensionKey) => scoresDim.find(s => s.key === key)?.porcentaje;
  const recs: string[] = [];
  const objetivo = OBJETIVOS[respuestas[IDX.objetivo]]?.key;
  if (objetivo) recs.push(RECO_OBJETIVO[objetivo]);
  if (perfil && (perfil.categoria === "tramo2" || perfil.categoria === "grande"))
    recs.push(`Por facturación tu empresa es ${CATEGORIA_LABEL[perfil.categoria]}: a esta escala, decidir sin un consejo asesor o directorio expone el patrimonio de todos los socios.`);
  if ((get("propiedad") ?? 0) >= 60)
    recs.push("La propiedad es compleja o hay temas abiertos entre socios: formalizar quién decide qué, y en qué calidad, es prioritario antes de armar el consejo.");
  if ((get("gobierno") ?? 0) >= 60)
    recs.push("Las decisiones y la operación dependen mucho de pocas personas. Un consejo asesor aporta un contrapeso real en lo estratégico y reduce ese riesgo.");
  if ((get("decisiones") ?? 0) >= 60)
    recs.push("No hay un espacio regular para pensar el rumbo del negocio. Un consejo con agenda fija lo resuelve.");
  if ((get("disponibilidad") ?? 100) <= 33)
    recs.push("El presupuesto disponible es limitado. Un consejo sin recursos se convierte rápido en una formalidad vacía: conviene empezar por un consejo asesor.");
  if ((get("tamano") ?? 0) >= 60 && !recs.some(r => r.startsWith("Por facturación")))
    recs.push("El tamaño y la complejidad operativa ya justifican una estructura más formal para decidir.");

  return {
    score: scoreTotal,
    nivel,
    porcentaje,
    scoresPorDimension: scoresDim.map(d => ({ nombre: d.nombre, score: d.score, max: d.max, porcentaje: d.porcentaje, key: d.key })),
    recomendaciones: recs,
    perfil,
    objetivo,
  };
}
