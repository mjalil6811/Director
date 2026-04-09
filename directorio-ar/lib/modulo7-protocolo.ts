import type { TipoProtocolo } from '../types/fase2';

// ——— Tipos ————————————————————————————————————————————————————————————————

export type OpcionEscenario = {
  id: string;
  texto: string;
  clausula: string;
  nivel: 'flexible' | 'moderado' | 'estricto';
  advertencia?: string;
};

export type Escenario = {
  id: string;
  categoria: CategoriaEscenario;
  pregunta: string;
  contexto: string;
  opciones: OpcionEscenario[];
  obligatorio: boolean;
};

export type CategoriaEscenario =
  | 'venta_salida'
  | 'conflictos'
  | 'sucesion'
  | 'dividendos'
  | 'gobierno';

export type RespuestaProtocolo = {
  escenarioId: string;
  opcionId: string;
};

export type ResultadoProtocolo = {
  tipo: TipoProtocolo;
  respuestas: RespuestaProtocolo[];
  clausulasGeneradas: string[];
  coberturaPorcentaje: number;
  areasIncompletas: CategoriaEscenario[];
  nivelProteccion: 'basico' | 'intermedio' | 'robusto';
};

// ——— Categorías ——————————————————————————————————————————————————————————

export const CATEGORIAS_ESCENARIO: Record<CategoriaEscenario, { label: string; icono: string; descripcion: string }> = {
  venta_salida: { label: 'Venta y salida', icono: '🚪', descripcion: 'Qué pasa si alguien quiere vender o salir.' },
  conflictos: { label: 'Conflictos entre socios', icono: '⚖️', descripcion: 'Cómo resolver desacuerdos formalmente.' },
  sucesion: { label: 'Sucesión y continuidad', icono: '🌱', descripcion: 'Qué pasa si un socio fallece o se incapacita.' },
  dividendos: { label: 'Dinero y dividendos', icono: '💰', descripcion: 'Cuándo y cuánto se reparte.' },
  gobierno: { label: 'Gobierno y control', icono: '🏛️', descripcion: 'Quién decide qué y cómo.' },
};

// ——— Escenarios ——————————————————————————————————————————————————————————

export const ESCENARIOS_FAMILIA: Escenario[] = [
  // —— Venta y salida
  {
    id: 'vs_01',
    categoria: 'venta_salida',
    pregunta: 'Un socio quiere vender su parte. ¿Los demás tienen prioridad para comprarla?',
    contexto: 'Sin una regla clara, un socio puede vender a cualquier tercero sin consultarte. Esto puede introducir personas ajenas a la empresa familiar.',
    obligatorio: true,
    opciones: [
      { id: 'vs_01_a', texto: 'Sí, los socios actuales tienen 30 días para igualar la oferta', clausula: 'Derecho de preferencia (30 días)', nivel: 'moderado' },
      { id: 'vs_01_b', texto: 'Sí, con 60 días y necesitan aprobación de la asamblea', clausula: 'Derecho de preferencia reforzado (60 días + asamblea)', nivel: 'estricto' },
      { id: 'vs_01_c', texto: 'No, cada socio puede vender libremente', clausula: 'Sin restricción de transferencia', nivel: 'flexible', advertencia: 'Puede ingresar cualquier tercero sin control del grupo familiar.' },
    ],
  },
  {
    id: 'vs_02',
    categoria: 'venta_salida',
    pregunta: 'Si alguien quiere salir y no hay comprador, ¿cómo se valúa su parte?',
    contexto: 'La valuación es el punto más conflictivo en la salida de un socio. Sin una fórmula acordada, se termina peleando en la Justicia.',
    obligatorio: true,
    opciones: [
      { id: 'vs_02_a', texto: 'Valuador independiente designado de común acuerdo', clausula: 'Valuación por perito independiente', nivel: 'moderado' },
      { id: 'vs_02_b', texto: 'Múltiplo del EBITDA de los últimos 3 años', clausula: 'Valuación por múltiplo de EBITDA (3 años)', nivel: 'moderado' },
      { id: 'vs_02_c', texto: 'Valor libro según último balance auditado', clausula: 'Valuación a valor libro', nivel: 'flexible', advertencia: 'El valor libro suele ser menor al valor real del negocio.' },
      { id: 'vs_02_d', texto: 'Dos valuadores (uno por parte) y un árbitro si no coinciden', clausula: 'Valuación con árbitro dirimente', nivel: 'estricto' },
    ],
  },
  {
    id: 'vs_03',
    categoria: 'venta_salida',
    pregunta: 'Si el socio mayoritario recibe una oferta para vender toda la empresa, ¿qué pasa con los minoritarios?',
    contexto: 'Sin protección, los minoritarios pueden quedarse "atrapados" con nuevos dueños que no eligieron.',
    obligatorio: false,
    opciones: [
      { id: 'vs_03_a', texto: 'Pueden sumarse a la venta en las mismas condiciones (tag-along)', clausula: 'Tag-along: derecho de adhesión a la venta', nivel: 'moderado' },
      { id: 'vs_03_b', texto: 'El mayoritario puede obligarlos a vender en las mismas condiciones (drag-along)', clausula: 'Drag-along: arrastre en venta total', nivel: 'flexible' },
      { id: 'vs_03_c', texto: 'Ambos derechos: tag-along para minoritarios y drag-along para el mayoritario', clausula: 'Tag-along + drag-along combinados', nivel: 'estricto' },
    ],
  },
  // —— Conflictos
  {
    id: 'cf_01',
    categoria: 'conflictos',
    pregunta: 'Dos socios no se ponen de acuerdo en una decisión importante. ¿Cómo se resuelve?',
    contexto: 'El bloqueo entre socios es la principal causa de destrucción de valor en empresas familiares. Tener el proceso definido antes del conflicto es clave.',
    obligatorio: true,
    opciones: [
      { id: 'cf_01_a', texto: 'Primero negociación directa (15 días) y si falla, mediador externo', clausula: 'Protocolo de conflictos: negociación + mediación', nivel: 'moderado' },
      { id: 'cf_01_b', texto: 'Directamente a árbitro independiente cuya decisión es vinculante', clausula: 'Arbitraje directo como mecanismo de conflictos', nivel: 'estricto' },
      { id: 'cf_01_c', texto: 'Negociación (15d) → mediación (30d) → árbitro (60d)', clausula: 'Protocolo de conflictos en 3 etapas', nivel: 'estricto' },
    ],
  },
  {
    id: 'cf_02',
    categoria: 'conflictos',
    pregunta: 'Si dos socios con partes iguales están en desacuerdo total y no hay salida, ¿qué mecanismo usás?',
    contexto: 'El bloqueo 50/50 puede paralizar una empresa por años. La "cláusula escopeta" es el último recurso pero funciona como disuasor.',
    obligatorio: false,
    opciones: [
      { id: 'cf_02_a', texto: 'Uno ofrece un precio, el otro elige: compra o vende (cláusula escopeta)', clausula: 'Cláusula escopeta (shotgun clause)', nivel: 'estricto' },
      { id: 'cf_02_b', texto: 'Se convoca a un director independiente con voto de desempate', clausula: 'Director independiente con voto de desempate', nivel: 'moderado' },
      { id: 'cf_02_c', texto: 'No incluir este mecanismo por ahora', clausula: '', nivel: 'flexible', advertencia: 'Sin mecanismo de desempate, un bloqueo 50/50 puede requerir disolución judicial.' },
    ],
  },
  // —— Sucesión
  {
    id: 'su_01',
    categoria: 'sucesion',
    pregunta: 'Si un socio fallece, ¿sus herederos entran automáticamente a la empresa?',
    contexto: 'Sin una regla clara, los herederos pueden tener derechos sobre la empresa aunque no tengan interés ni capacidad de gestionarla.',
    obligatorio: true,
    opciones: [
      { id: 'su_01_a', texto: 'Sí, los herederos entran como socios con los mismos derechos', clausula: 'Ingreso automático de herederos', nivel: 'flexible' },
      { id: 'su_01_b', texto: 'Los socios actuales tienen preferencia para comprar la parte antes que los herederos', clausula: 'Derecho de compra preferente ante sucesión', nivel: 'moderado' },
      { id: 'su_01_c', texto: 'Los herederos entran pero solo como socios financieros, sin voto en la gestión', clausula: 'Herederos con participación financiera sin voto', nivel: 'estricto' },
    ],
  },
  {
    id: 'su_02',
    categoria: 'sucesion',
    pregunta: '¿Existe un plan de sucesión para el CEO o director general de la familia?',
    contexto: 'La falta de plan de sucesión es la principal causa de crisis en empresas familiares de segunda generación.',
    obligatorio: false,
    opciones: [
      { id: 'su_02_a', texto: 'Sí, el directorio revisa y aprueba el plan de sucesión cada 2 años', clausula: 'Plan de sucesión gerencial revisado bianualmente', nivel: 'estricto' },
      { id: 'su_02_b', texto: 'El directorio lo definirá cuando corresponda', clausula: 'Plan de sucesión a definir por el directorio', nivel: 'flexible' },
      { id: 'su_02_c', texto: 'No incluir este punto en el protocolo por ahora', clausula: '', nivel: 'flexible', advertencia: 'La ausencia de plan de sucesión es el principal riesgo de continuidad.' },
    ],
  },
  // —— Dividendos
  {
    id: 'dv_01',
    categoria: 'dividendos',
    pregunta: '¿Cómo se decide cuánto se reparte de las ganancias cada año?',
    contexto: 'Sin una política definida, la distribución de dividendos genera conflictos entre socios que quieren retirar y socios que quieren reinvertir.',
    obligatorio: true,
    opciones: [
      { id: 'dv_01_a', texto: 'Se distribuye el 30% de la utilidad neta anual como mínimo', clausula: 'Política de dividendos: mínimo 30% utilidad neta', nivel: 'moderado' },
      { id: 'dv_01_b', texto: 'El directorio propone y la asamblea aprueba caso por caso', clausula: 'Dividendos por decisión de directorio y asamblea', nivel: 'flexible' },
      { id: 'dv_01_c', texto: 'No se distribuye nada los primeros 3 años; después mínimo 20%', clausula: 'Reinversión total año 1-3, luego mínimo 20%', nivel: 'estricto' },
    ],
  },
  {
    id: 'dv_02',
    categoria: 'dividendos',
    pregunta: 'Los socios que trabajan en la empresa cobran sueldo. ¿Es diferente de los dividendos?',
    contexto: 'Mezclar sueldo con dividendos es una fuente de conflicto permanente. Los socios que no trabajan sienten que los que trabajan se pagan de más.',
    obligatorio: false,
    opciones: [
      { id: 'dv_02_a', texto: 'Sí, el sueldo lo fija el directorio en base a mercado y es independiente de los dividendos', clausula: 'Remuneración de socios-gerentes a valor de mercado', nivel: 'estricto' },
      { id: 'dv_02_b', texto: 'Los socios que trabajan pueden retirar un anticipo mensual que se descuenta de su dividendo', clausula: 'Anticipo a cuenta de dividendos para socios-gerentes', nivel: 'moderado' },
      { id: 'dv_02_c', texto: 'No incluir esta diferenciación por ahora', clausula: '', nivel: 'flexible', advertencia: 'Sin esta distinción, los conflictos por remuneración son difíciles de resolver.' },
    ],
  },
  // —— Gobierno
  {
    id: 'go_01',
    categoria: 'gobierno',
    pregunta: '¿Qué decisiones no puede tomar el directorio solo y necesitan aprobación de todos los socios?',
    contexto: 'Sin esta lista, el directorio puede tomar decisiones que afectan a todos los socios sin consultarlos.',
    obligatorio: true,
    opciones: [
      { id: 'go_01_a', texto: 'Venta de activos críticos, fusiones, nuevas deudas mayores al 20% del patrimonio', clausula: 'Materias reservadas: activos, fusiones y deuda significativa', nivel: 'moderado' },
      { id: 'go_01_b', texto: 'Solo decisiones de venta total de la empresa', clausula: 'Materia reservada: venta total de la empresa', nivel: 'flexible' },
      { id: 'go_01_c', texto: 'Lista amplia: inversiones +USD 50k, deuda +20% patrimonio, nuevos socios, cambio de objeto social', clausula: 'Materias reservadas ampliadas (lista detallada)', nivel: 'estricto' },
    ],
  },
  {
    id: 'go_02',
    categoria: 'gobierno',
    pregunta: '¿Puede un familiar político (cónyuge, cuñado) ser director o socio?',
    contexto: 'Esta restricción es común en protocolos familiares para evitar que conflictos personales se trasladen a la empresa.',
    obligatorio: false,
    opciones: [
      { id: 'go_02_a', texto: 'No, los familiares políticos no pueden ser directores ni socios', clausula: 'Restricción de ingreso a familiares políticos', nivel: 'estricto' },
      { id: 'go_02_b', texto: 'Pueden ser socios pasivos pero no directores', clausula: 'Familiares políticos: socios pasivos sin cargo directivo', nivel: 'moderado' },
      { id: 'go_02_c', texto: 'Pueden ingresar con aprobación unánime de todos los socios', clausula: 'Ingreso de familiares políticos con unanimidad', nivel: 'moderado' },
    ],
  },
];

export const ESCENARIOS_SOCIOS: Escenario[] = ESCENARIOS_FAMILIA.filter(e =>
  ['vs_01', 'vs_02', 'vs_03', 'cf_01', 'cf_02', 'dv_01', 'go_01'].includes(e.id)
);

export function getEscenarios(tipo: TipoProtocolo): Escenario[] {
  if (tipo === 'socios') return ESCENARIOS_SOCIOS;
  return ESCENARIOS_FAMILIA;
}

// ——— Calcular resultado ——————————————————————————————————————————————————

export function calcularResultado(
  tipo: TipoProtocolo,
  respuestas: RespuestaProtocolo[],
): ResultadoProtocolo {
  const escenarios = getEscenarios(tipo);
  const respondidos = respuestas.map(r => r.escenarioId);

  const clausulasGeneradas: string[] = [];
  for (const r of respuestas) {
    const esc = escenarios.find(e => e.id === r.escenarioId);
    const op = esc?.opciones.find(o => o.id === r.opcionId);
    if (op?.clausula) clausulasGeneradas.push(op.clausula);
  }

  const categoriasCubiertas = new Set(
    respuestas.map(r => escenarios.find(e => e.id === r.escenarioId)?.categoria).filter(Boolean)
  );
  const todasCategorias = Object.keys(CATEGORIAS_ESCENARIO) as CategoriaEscenario[];
  const areasIncompletas = todasCategorias.filter(c => !categoriasCubiertas.has(c));

  const cobertura = respondidos.length / escenarios.length;
  const coberturaPorcentaje = Math.round(cobertura * 100);

  const nivelesElegidos = respuestas.map(r => {
    const esc = escenarios.find(e => e.id === r.escenarioId);
    return esc?.opciones.find(o => o.id === r.opcionId)?.nivel ?? 'flexible';
  });
  const estrictos = nivelesElegidos.filter(n => n === 'estricto').length;
  const moderados = nivelesElegidos.filter(n => n === 'moderado').length;
  const nivelProteccion = estrictos >= 3 ? 'robusto' : moderados >= 3 ? 'intermedio' : 'basico';

  return { tipo, respuestas, clausulasGeneradas, coberturaPorcentaje, areasIncompletas, nivelProteccion };
}

// ——— Generar texto del protocolo —————————————————————————————————————————

export function generarTextoProtocolo(resultado: ResultadoProtocolo, empresaNombre: string): string {
  const nivelLabel = { basico: 'Básico', intermedio: 'Intermedio', robusto: 'Robusto' };
  return `PROTOCOLO DE ${resultado.tipo === 'familia' ? 'FAMILIA' : 'SOCIOS'}
${empresaNombre.toUpperCase()}

Nivel de protección: ${nivelLabel[resultado.nivelProteccion]}
Cobertura: ${resultado.coberturaPorcentaje}%

———————————————————————————————
CLÁUSULAS ACORDADAS
———————————————————————————————
${resultado.clausulasGeneradas.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Este protocolo fue elaborado mediante el proceso de decisiones asistido de Directorio AR.
Se recomienda la revisión por un asesor legal antes de su firma.
`;
}
