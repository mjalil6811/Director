import type { Modulo1Resultado } from "../types";

export const PREGUNTAS_M1 = [
  {
    texto: "¿Cuántas personas trabajan en la empresa?",
    opciones: [
      { label: "Menos de 10", value: 0 },
      { label: "Entre 10 y 30", value: 1 },
      { label: "Entre 30 y 100", value: 2 },
      { label: "Más de 100", value: 3 },
    ],
  },
  {
    texto: "¿Cuál es la facturación anual aproximada?",
    opciones: [
      { label: "Menos de $50M", value: 0 },
      { label: "Entre $50M y $200M", value: 1 },
      { label: "Entre $200M y $1.000M", value: 2 },
      { label: "Más de $1.000M", value: 3 },
    ],
  },
  {
    texto: "¿Cómo está distribuida la propiedad?",
    opciones: [
      { label: "Un solo dueño", value: 0 },
      { label: "Dos o tres socios fundadores", value: 1 },
      { label: "Familia ampliada o segunda generación", value: 2 },
      { label: "Múltiples socios incluyendo inversores", value: 3 },
    ],
  },
  {
    texto: "¿Existe o existirá un proceso de sucesión en los próximos 3 años?",
    opciones: [
      { label: "No previsto", value: 0 },
      { label: "Conversaciones pero nada concreto", value: 1 },
      { label: "En proceso o muy próximo", value: 2 },
      { label: "Ya ocurrió y hay tensiones sin resolver", value: 3 },
    ],
  },
  {
    texto: "¿Cómo se toman las decisiones estratégicas?",
    opciones: [
      { label: "El dueño o CEO solo", value: 0 },
      { label: "Se discuten informalmente entre socios", value: 1 },
      { label: "Reuniones periódicas sin estructura formal", value: 2 },
      { label: "Existe algún órgano de gobierno aunque informal", value: 3 },
    ],
  },
  {
    texto: "¿Existe diferencia real entre quién es dueño y quién gerencia?",
    opciones: [
      { label: "Los dueños operan el día a día completamente", value: 0 },
      { label: "Hay gerentes pero los dueños deciden todo", value: 1 },
      { label: "Hay gerentes con algo de autonomía real", value: 2 },
      { label: "La gerencia opera con independencia clara", value: 3 },
    ],
  },
  {
    texto: "¿La empresa tiene o planea tener deuda significativa?",
    opciones: [
      { label: "Sin deuda estructural relevante", value: 0 },
      { label: "Créditos bancarios de corto plazo", value: 1 },
      { label: "Deuda de mediano/largo plazo", value: 2 },
      { label: "Fondos de inversión, ONs o deuda estructurada", value: 3 },
    ],
  },
  {
    texto: "¿La empresa ha tenido crisis financieras o conflictos que resultaron muy costosos?",
    opciones: [
      { label: "No, camino tranquilo", value: 0 },
      { label: "Tensiones menores ya resueltas", value: 1 },
      { label: "Situaciones complejas con impacto real", value: 2 },
      { label: "Conflictos activos o daños que aún impactan", value: 3 },
    ],
  },
  {
    texto: "¿La empresa tiene una estrategia a 3-5 años documentada?",
    opciones: [
      { label: "No existe nada formal", value: 0 },
      { label: "Ideas compartidas pero sin documentar", value: 1 },
      { label: "Existe algo escrito pero no se aplica", value: 2 },
      { label: "Hay un proceso real de planificación estratégica", value: 3 },
    ],
  },
  {
    texto: "¿La empresa tiene planes concretos de crecimiento o transformación?",
    opciones: [
      { label: "No, foco en mantener lo actual", value: 0 },
      { label: "Hay ideas pero no maduras", value: 1 },
      { label: "Proyectos concretos en desarrollo", value: 2 },
      { label: "En plena expansión o transformación", value: 3 },
    ],
  },
  {
    texto: "¿El CEO o líder principal tiene dependencia de personas clave difícilmente reemplazables?",
    opciones: [
      { label: "La empresa depende fuertemente de 1-2 personas", value: 0 },
      { label: "Hay dependencia pero con algo de redundancia", value: 1 },
      { label: "El equipo tiene profundidad suficiente", value: 2 },
      { label: "La empresa funciona sin depender de nadie clave", value: 3 },
    ],
  },
  {
    texto: "¿Qué tan abierto está el dueño o CEO a recibir perspectivas externas que cuestionen sus decisiones?",
    opciones: [
      { label: "Prefiero decidir solo", value: 0 },
      { label: "Lo considero valioso pero me genera incomodidad", value: 1 },
      { label: "Lo busco activamente aunque informalmente", value: 2 },
      { label: "Lo considero esencial y estoy listo para implementarlo", value: 3 },
    ],
  },
];

export const DIMENSIONES = [
  { nombre: "Tamaño", preguntas: [0, 1] },
  { nombre: "Propiedad", preguntas: [2, 3] },
  { nombre: "Gobierno", preguntas: [4, 5] },
  { nombre: "Financiero", preguntas: [6, 7] },
  { nombre: "Estrategia", preguntas: [8, 9] },
  { nombre: "Liderazgo", preguntas: [10, 11] },
];

export function calcularModulo1(respuestas: number[]): Modulo1Resultado {
  const scoresPorDimension = DIMENSIONES.map(dim => {
    const score = dim.preguntas.reduce((sum, idx) => sum + (respuestas[idx] ?? 0), 0);
    return { nombre: dim.nombre, score, max: 6 };
  });

  const totalScore = respuestas.reduce((sum, v) => sum + v, 0);
  const porcentaje = Math.round((totalScore / 36) * 100);

  let nivel: string;
  if (porcentaje < 30) nivel = "Directorio prematuro";
  else if (porcentaje < 55) nivel = "Señales tempranas";
  else if (porcentaje < 75) nivel = "Momento de transición";
  else nivel = "Necesidad urgente";

  const getPct = (dim: { score: number; max: number }) => dim.score / dim.max;

  const propiedad = scoresPorDimension[1];
  const gobierno = scoresPorDimension[2];
  const financiero = scoresPorDimension[3];
  const estrategia = scoresPorDimension[4];
  const liderazgo = scoresPorDimension[5];
  const complejidad = scoresPorDimension[0]; // Tamaño

  const recomendaciones: string[] = [];
  if (getPct(propiedad) >= 0.6)
    recomendaciones.push("La estructura de propiedad es compleja: formalizar quién decide qué y en qué calidad es una prioridad antes de armar el directorio.");
  if (getPct(gobierno) <= 0.33)
    recomendaciones.push("El gobierno actual es muy informal. Un primer paso puede ser instaurar reuniones mensuales de socios con agenda estructurada.");
  if (getPct(liderazgo) <= 0.33)
    recomendaciones.push("La apertura a perspectivas externas es baja. El éxito de un directorio depende en gran medida de la voluntad del CEO.");
  if (getPct(financiero) >= 0.6)
    recomendaciones.push("El perfil financiero justifica mecanismos de control más sólidos.");
  if (getPct(estrategia) >= 0.6)
    recomendaciones.push("La empresa está en modo de crecimiento. Un directorio agrega valor justamente en estas etapas.");
  if (getPct(complejidad) >= 0.6)
    recomendaciones.push("El tamaño y complejidad operativa ya justifican estructuras de gobierno más sofisticadas.");

  return {
    score: totalScore,
    nivel,
    porcentaje,
    scoresPorDimension,
    recomendaciones,
  };
}
