import type { Modulo1Resultado } from "../types";
import {
  ROLES, INDUSTRIAS, OPCIONES_EMPLEADOS, opcionesFacturacion, calcularPerfil, grupoDeRol,
  CATEGORIA_LABEL, NORMA_TOPES, type GrupoRol, type SectorOficial, type PerfilEmpresa,
} from "./pymes";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

/** Texto fijo, o una variante por grupo de quien responde. */
type Texto = string | Record<GrupoRol, string>;
type OpcionDef = { texto: Texto; puntaje: number | null };

type PreguntaDef = {
  id: string;
  /** Dimensión que puntúa, o null si es una pregunta de perfil (no suma puntaje). */
  dimension: DimensionKey | null;
  texto: Texto;
  aclaracion: Texto;
  /** Opciones fijas, o 'facturacion' (dependen de la industria elegida). */
  opciones: OpcionDef[] | 'facturacion';
};

export type DimensionKey = "tamano" | "propiedad" | "gobierno" | "decisiones" | "disponibilidad";

export const DIMENSIONES_M1: { key: DimensionKey; nombre: string }[] = [
  { key: "tamano", nombre: "Tamaño y complejidad" },
  { key: "propiedad", nombre: "Estructura de propiedad" },
  { key: "gobierno", nombre: "Gobierno actual" },
  { key: "decisiones", nombre: "Toma de decisiones" },
  { key: "disponibilidad", nombre: "Recursos para el directorio" },
];

/** Pregunta lista para mostrar, ya adaptada a quien responde y a su industria. */
export type PreguntaResuelta = { id: string; texto: string; aclaracion: string; opciones: { texto: string; puntaje: number | null }[] };

// ─── Preguntas ─────────────────────────────────────────────────────────────────
// Índices fijos: 0 rol · 1 industria · 2 facturación · 3 empleados · 4 propiedad · 5 sucesión
//                6 decisiones estratégicas · 7 separación dueño/gerencia · 8 reuniones · 9 presupuesto

export const IDX = { rol: 0, industria: 1, facturacion: 2, empleados: 3 } as const;

const PREGUNTAS: PreguntaDef[] = [
  {
    id: "rol",
    dimension: null,
    texto: "¿Quién está respondiendo este diagnóstico?",
    aclaracion: "Adaptamos las preguntas siguientes a tu rol en la empresa.",
    opciones: ROLES.map(r => ({ texto: r.label, puntaje: null })),
  },
  {
    id: "industria",
    dimension: null,
    texto: "¿A qué industria pertenece la empresa?",
    aclaracion: "Elegí la actividad principal. Define los topes de facturación oficiales que usamos en la próxima pregunta.",
    opciones: INDUSTRIAS.map(i => ({ texto: `${i.label} — ${i.ejemplos}`, puntaje: null })),
  },
  {
    id: "facturacion",
    dimension: "tamano",
    texto: "¿Cuál fue la facturación anual promedio de los últimos 3 años?",
    aclaracion: `Promedio de los últimos 3 ejercicios cerrados, sin IVA y descontando el 75% de lo exportado. Los rangos son los topes oficiales PyME para tu industria (${NORMA_TOPES}).`,
    opciones: "facturacion",
  },
  {
    id: "empleados",
    dimension: "tamano",
    texto: "¿Cuántas personas trabajan en la empresa?",
    aclaracion: "Incluí empleados en relación de dependencia y colaboradores estables.",
    opciones: OPCIONES_EMPLEADOS.map(o => ({ texto: o.texto, puntaje: o.puntaje })),
  },
  {
    id: "propiedad",
    dimension: "propiedad",
    texto: "¿Cómo está distribuida la propiedad de la empresa?",
    aclaracion: "La composición accionaria es uno de los factores que más define la necesidad de un directorio.",
    opciones: [
      { texto: "Un solo dueño, sin socios", puntaje: 1 },
      { texto: "Dos o tres socios fundadores", puntaje: 2 },
      { texto: "Familia ampliada o segunda generación involucrada", puntaje: 3 },
      { texto: "Múltiples socios, incluyendo inversores o fondos", puntaje: 3 },
    ],
  },
  {
    id: "sucesion",
    dimension: "propiedad",
    texto: "¿Existe o existirá en los próximos 3 años algún proceso de sucesión o cambio de control?",
    aclaracion: "Venta parcial, incorporación de socios, traspaso generacional, ingreso de inversores.",
    opciones: [
      { texto: "No está previsto ningún cambio", puntaje: 1 },
      { texto: "Hay conversaciones pero nada concreto", puntaje: 2 },
      { texto: "Está en proceso o muy próximo", puntaje: 3 },
      { texto: "Ya ocurrió y hay tensiones no resueltas", puntaje: 3 },
    ],
  },
  {
    id: "decisiones",
    dimension: "gobierno",
    texto: "¿Cómo se toman hoy las decisiones estratégicas importantes?",
    aclaracion: {
      propietario: "Si una sola persona decide todo lo estratégico, la empresa está a un error de distancia de una crisis.",
      gestor: "Pensá en las últimas decisiones relevantes: inversiones, endeudamiento, nuevos mercados.",
      familiar: "Pensá en las últimas decisiones relevantes: inversiones, endeudamiento, nuevos mercados.",
    },
    opciones: [
      { texto: { propietario: "Las tomo yo (o el socio principal) solo, sin consulta ni contrapeso", gestor: "Las define el dueño solo; yo ejecuto", familiar: "Las toma quien gestiona, sin consultar al resto de los dueños" }, puntaje: 3 },
      { texto: { propietario: "Se discuten entre socios de manera informal, sin registro", gestor: "Los dueños deciden entre ellos de manera informal y me lo comunican", familiar: "Se conversan en familia, de manera informal" }, puntaje: 2 },
      { texto: { propietario: "Hay reuniones periódicas, pero sin estructura formal", gestor: "Las propongo y las validamos en reuniones, sin estructura formal", familiar: "Hay reuniones de socios periódicas, pero sin estructura formal" }, puntaje: 1 },
      { texto: { propietario: "Existe un órgano de gobierno, aunque sea informal", gestor: "Las aprueba un órgano de gobierno con el que trabajo formalmente", familiar: "Existe un órgano donde los dueños participan formalmente" }, puntaje: 0 },
    ],
  },
  {
    id: "separacion",
    dimension: "gobierno",
    texto: {
      propietario: "¿Qué tan separado está hoy tu rol de dueño del de gestión?",
      gestor: "¿Qué autonomía real tenés frente a los dueños?",
      familiar: "Los dueños que gestionan, ¿separan su rol de dueño del de gerente?",
    },
    aclaracion: {
      propietario: "Cuando el dueño es también el gerente, nadie le dice que no. El directorio rompe esa concentración y protege el patrimonio de todos.",
      gestor: "Si los dueños intervienen en todo, el cargo de gerente es solo nominal. El directorio ordena qué decide cada uno.",
      familiar: "Cuando quien gestiona actúa como único dueño, el resto de los accionistas pierde visibilidad. El directorio la recupera.",
    },
    opciones: [
      { texto: { propietario: "Opero el día a día completamente: no hay separación", gestor: "Ninguna: los dueños deciden incluso lo operativo", familiar: "No: manejan el día a día como si la empresa fuera solo suya" }, puntaje: 3 },
      { texto: { propietario: "Hay gerentes, pero decido todo yo: la separación es cosmética", gestor: "Poca: tengo el cargo, pero los dueños deciden casi todo", familiar: "Hay gerentes, pero los dueños que gestionan deciden todo" }, puntaje: 2 },
      { texto: { propietario: "Hay gerentes con algo de autonomía real", gestor: "Bastante en lo operativo; lo estratégico lo deciden los dueños", familiar: "Hay gerentes con algo de autonomía real" }, puntaje: 1 },
      { texto: { propietario: "La gerencia opera con independencia clara de los dueños", gestor: "Plena, dentro de un presupuesto y objetivos acordados", familiar: "La gerencia opera con independencia clara de la propiedad" }, puntaje: 0 },
    ],
  },
  {
    id: "reuniones",
    dimension: "decisiones",
    texto: "¿Con qué frecuencia los socios o líderes se reúnen formalmente para revisar el rumbo del negocio?",
    aclaracion: "Si nadie se junta a pensar el futuro, nadie lo está haciendo. El directorio fuerza esa conversación.",
    opciones: [
      { texto: "Casi nunca, o solo cuando hay una crisis", puntaje: 3 },
      { texto: "Una o dos veces al año, sin agenda estructurada", puntaje: 2 },
      { texto: "Trimestralmente, con algún orden pero sin formato fijo", puntaje: 1 },
      { texto: "Mensual o bimestralmente, con agenda y seguimiento de acuerdos", puntaje: 0 },
    ],
  },
  {
    id: "presupuesto",
    dimension: "disponibilidad",
    texto: {
      propietario: "¿Estarías dispuesto a destinar un presupuesto real al funcionamiento del directorio?",
      gestor: "¿Los dueños estarían dispuestos a destinar un presupuesto real al funcionamiento del directorio?",
      familiar: "¿Los dueños estarían dispuestos a destinar un presupuesto real al funcionamiento del directorio?",
    },
    aclaracion: "Incluye honorarios de directores independientes, lugar de reunión y materiales.",
    opciones: [
      { texto: "No está en el presupuesto y sería difícil incorporarlo", puntaje: 0 },
      { texto: "Podría destinarse algo pequeño como primera instancia", puntaje: 1 },
      { texto: "Sí, si el valor aportado lo justifica claramente", puntaje: 2 },
      { texto: "Ya está contemplado o no sería un obstáculo", puntaje: 3 },
    ],
  },
];

export const TOTAL_PREGUNTAS = PREGUNTAS.length; // 10

// ─── Resolución por contexto ───────────────────────────────────────────────────

function txt(t: Texto, grupo: GrupoRol): string {
  return typeof t === "string" ? t : t[grupo];
}

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
  temprano:   { label: "Señales tempranas",     descripcion: "Existen indicadores que justifican pensar en gobierno formal, pero el timing depende de cómo evolucionen ciertos factores clave.", color: "#854F0B", bgColor: "#FAEEDA" },
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

  const scoreTotal = scoresDim.reduce((a, d) => a + d.score, 0);
  const maxTotal = scoresDim.reduce((a, d) => a + d.max, 0);
  const porcentaje = maxTotal > 0 ? Math.round((scoreTotal / maxTotal) * 100) : 0;
  const nivel = NIVELES[calcularNivel(porcentaje)].label;
  const perfil = perfilDeRespuestas(respuestas) ?? undefined;

  const get = (key: DimensionKey) => scoresDim.find(s => s.key === key)?.porcentaje;
  const recs: string[] = [];
  if (perfil && (perfil.categoria === "tramo2" || perfil.categoria === "grande"))
    recs.push(`Por facturación tu empresa es ${CATEGORIA_LABEL[perfil.categoria]}: a esta escala, operar sin un órgano de gobierno formal expone el patrimonio de todos los socios.`);
  if ((get("propiedad") ?? 0) >= 60)
    recs.push("La estructura de propiedad es compleja: formalizar quién decide qué, y en qué calidad, es prioritario antes de armar el directorio.");
  if ((get("gobierno") ?? 0) >= 60)
    recs.push("El gobierno actual está muy concentrado. El directorio es urgente para instalar un contrapeso real en las decisiones estratégicas.");
  if ((get("decisiones") ?? 0) >= 60)
    recs.push("No hay un espacio regular para pensar el rumbo del negocio. Un directorio con agenda fija lo resuelve.");
  if ((get("disponibilidad") ?? 100) <= 33)
    recs.push("El presupuesto disponible es limitado. Un directorio sin recursos se convierte rápido en una formalidad vacía: conviene empezar por un consejo asesor.");
  if ((get("tamano") ?? 0) >= 60 && !recs.some(r => r.startsWith("Por facturación")))
    recs.push("El tamaño y la complejidad operativa ya justifican estructuras de gobierno más sofisticadas.");

  return {
    score: scoreTotal,
    nivel,
    porcentaje,
    scoresPorDimension: scoresDim.map(d => ({ nombre: d.nombre, score: d.score, max: d.max, porcentaje: d.porcentaje, key: d.key })),
    recomendaciones: recs,
    perfil,
  };
}
