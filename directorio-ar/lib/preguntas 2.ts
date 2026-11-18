// Todas las preguntas del diagnóstico (Módulos 1 a 5) en un solo lugar.
//
// Reglas (ver test/preguntas.test.ts):
// - Cada pregunta mide UN constructo (`construct`) y sus opciones hablan solo de ese constructo.
// - Dos preguntas nunca comparten constructo: si algo ya se preguntó, se reutiliza la respuesta.
// - Las aclaraciones explican cómo responder; no persuaden. La persuasión va en el resultado.
//
// La lógica de puntaje está en lib/modulo1.ts … lib/modulo5.ts.
import { ROLES, INDUSTRIAS, OPCIONES_EMPLEADOS, NORMA_TOPES, type GrupoRol } from './pymes';
import type { PerfilKey } from './modulo3';

/** Texto fijo, o una variante según quién responde (pregunta 1 del Módulo 1). */
export type Texto = string | Record<GrupoRol, string>;

export function texto(t: Texto, grupo: GrupoRol): string {
  return typeof t === 'string' ? t : t[grupo];
}

// ═══ Módulo 1 · Necesidad ══════════════════════════════════════════════════════

export type DimensionKey = 'tamano' | 'propiedad' | 'gobierno' | 'decisiones' | 'disponibilidad';

export const DIMENSIONES_M1: { key: DimensionKey; nombre: string }[] = [
  { key: 'tamano', nombre: 'Tamaño y complejidad' },
  { key: 'propiedad', nombre: 'Estructura de propiedad' },
  { key: 'gobierno', nombre: 'Concentración de decisiones' },
  { key: 'decisiones', nombre: 'Rutina de reuniones' },
  { key: 'disponibilidad', nombre: 'Recursos para el directorio' },
];

type OpcionM1 = { texto: Texto; puntaje: number | null };

export type PreguntaM1 = {
  id: string;
  construct: string;
  /** Dimensión que puntúa, o null si no suma puntaje (perfil u objetivo). */
  dimension: DimensionKey | null;
  texto: Texto;
  aclaracion: Texto;
  /** Opciones fijas, o 'facturacion' (dependen de la industria elegida). */
  opciones: OpcionM1[] | 'facturacion';
};

/** Objetivo principal del consejo: no puntúa, personaliza el informe. */
export const OBJETIVOS = [
  { key: 'ordenar', texto: 'Ordenar cómo se toman las decisiones' },
  { key: 'conflictos', texto: 'Resolver conflictos entre socios' },
  { key: 'sucesion', texto: 'Preparar la sucesión' },
  { key: 'financiamiento', texto: 'Acceder a crédito o inversión' },
  { key: 'profesionalizar', texto: 'Profesionalizar la gestión' },
] as const;

export type ObjetivoKey = (typeof OBJETIVOS)[number]['key'];

/** Posición de cada pregunta en el array de respuestas guardado (no cambiar sin migrar: lib/migraciones.ts). */
export const IDX = {
  rol: 0, industria: 1, facturacion: 2, empleados: 3, propiedad: 4, sucesion: 5, conflicto: 6,
  decisiones: 7, dependencia: 8, separacion: 9, reuniones: 10, presupuesto: 11, objetivo: 12,
} as const;

export const PREGUNTAS_M1: PreguntaM1[] = [
  {
    id: 'rol',
    construct: 'rol_respondente',
    dimension: null,
    texto: '¿Quién está respondiendo este diagnóstico?',
    aclaracion: 'Adaptamos las preguntas siguientes a tu rol en la empresa.',
    opciones: ROLES.map(r => ({ texto: r.label, puntaje: null })),
  },
  {
    id: 'industria',
    construct: 'sector_actividad',
    dimension: null,
    texto: '¿A qué industria pertenece la empresa?',
    aclaracion: 'Elegí la actividad principal. Define los topes de facturación oficiales que usamos en la próxima pregunta.',
    opciones: INDUSTRIAS.map(i => ({ texto: `${i.label} — ${i.ejemplos}`, puntaje: null })),
  },
  {
    id: 'facturacion',
    construct: 'categoria_ventas',
    dimension: 'tamano',
    texto: '¿Cuál fue la facturación anual promedio de los últimos 3 años?',
    aclaracion: `Promedio de los últimos 3 ejercicios, sin IVA. Rangos según los topes oficiales PyME de tu industria (${NORMA_TOPES}).`,
    opciones: 'facturacion',
  },
  {
    id: 'empleados',
    construct: 'cantidad_personas',
    dimension: 'tamano',
    texto: '¿Cuántas personas trabajan en la empresa?',
    aclaracion: 'Incluí empleados en relación de dependencia y colaboradores estables.',
    opciones: OPCIONES_EMPLEADOS.map(o => ({ texto: o.texto, puntaje: o.puntaje })),
  },
  {
    id: 'propiedad',
    construct: 'composicion_accionaria',
    dimension: 'propiedad',
    texto: '¿Cómo está distribuida la propiedad de la empresa?',
    aclaracion: 'Considerá quiénes son hoy los accionistas, trabajen o no en la empresa.',
    opciones: [
      { texto: 'Un solo dueño, sin socios', puntaje: 1 },
      { texto: 'Dos o tres socios fundadores', puntaje: 2 },
      { texto: 'Familia ampliada o segunda generación involucrada', puntaje: 3 },
      { texto: 'Múltiples socios, incluyendo inversores o fondos', puntaje: 3 },
    ],
  },
  {
    id: 'sucesion',
    construct: 'cambio_de_control',
    dimension: 'propiedad',
    texto: '¿Existe o existirá en los próximos 3 años algún proceso de sucesión o cambio de control?',
    aclaracion: 'Venta parcial, incorporación de socios, traspaso generacional, ingreso de inversores.',
    opciones: [
      { texto: 'No está previsto ningún cambio', puntaje: 1 },
      { texto: 'Hay conversaciones, pero nada concreto', puntaje: 2 },
      { texto: 'Está en proceso o muy próximo', puntaje: 3 },
      { texto: 'Ya ocurrió y quedan aspectos sin formalizar (acuerdos, roles o valuación)', puntaje: 3 },
    ],
  },
  {
    id: 'conflicto',
    construct: 'conflicto_actual',
    dimension: 'propiedad',
    texto: {
      propietario: '¿Hay hoy desacuerdos entre socios o en la familia propietaria que afecten a la empresa?',
      gestor: '¿Hay hoy desacuerdos entre los dueños o en la familia propietaria que afecten a la empresa?',
      familiar: '¿Hay hoy desacuerdos entre los dueños o en la familia propietaria que afecten a la empresa?',
    },
    aclaracion: 'Nos referimos a la situación actual, no a cambios futuros de propiedad. Si hay un solo dueño, pensá en su familia.',
    opciones: [
      { texto: 'No hay desacuerdos relevantes', puntaje: 0 },
      { texto: 'Hay diferencias de opinión que se resuelven conversando', puntaje: 1 },
      { texto: 'Hay desacuerdos que se repiten y frenan algunas decisiones', puntaje: 2 },
      { texto: 'Hay un conflicto abierto que afecta la marcha de la empresa', puntaje: 3 },
    ],
  },
  {
    id: 'decisiones',
    construct: 'quien_decide',
    dimension: 'gobierno',
    texto: '¿Quién toma hoy las decisiones estratégicas importantes?',
    aclaracion: 'Pensá en las últimas decisiones relevantes: inversiones, endeudamiento, nuevos mercados.',
    opciones: [
      { texto: { propietario: 'Las tomo yo (o el socio principal), sin consultar a nadie', gestor: 'Las toma el dueño (o el socio principal) solo', familiar: 'Las toma solo quien gestiona' }, puntaje: 3 },
      { texto: { propietario: 'Las tomamos entre los socios', gestor: 'Las toman los dueños entre ellos', familiar: 'Las toman entre ellos los dueños que gestionan' }, puntaje: 2 },
      { texto: { propietario: 'Las toman los socios, a partir de análisis de la gerencia o de asesores', gestor: 'Las toman los dueños, a partir de mis propuestas o las de asesores', familiar: 'Las toman los dueños, a partir de análisis de la gerencia o de asesores' }, puntaje: 1 },
      { texto: { propietario: 'Las aprueba un directorio o consejo con integrantes además de los socios', gestor: 'Las aprueba un directorio o consejo con integrantes además de los dueños', familiar: 'Las aprueba un directorio o consejo con integrantes además de los dueños' }, puntaje: 0 },
    ],
  },
  {
    id: 'dependencia',
    construct: 'dependencia_del_dueno',
    dimension: 'gobierno',
    texto: {
      propietario: 'Si no pudieras estar en la empresa durante 3 meses, ¿qué pasaría con la operación?',
      gestor: 'Si el dueño (o socio principal) no pudiera estar en la empresa durante 3 meses, ¿qué pasaría con la operación?',
      familiar: 'Si el dueño que gestiona no pudiera estar en la empresa durante 3 meses, ¿qué pasaría con la operación?',
    },
    aclaracion: 'Pensá en una ausencia imprevista, sin tiempo para organizar un reemplazo.',
    opciones: [
      { texto: 'Seguiría con normalidad', puntaje: 0 },
      { texto: 'Seguiría, con algunos inconvenientes menores', puntaje: 1 },
      { texto: 'Seguiría, pero con problemas serios con clientes, proveedores o pagos', puntaje: 2 },
      { texto: 'No podría seguir operando con normalidad', puntaje: 3 },
    ],
  },
  {
    id: 'separacion',
    construct: 'separacion_roles',
    dimension: 'gobierno',
    texto: {
      propietario: '¿Qué tan separados están hoy el rol de dueño y el de gerente?',
      gestor: '¿Qué tan separados están hoy el rol de los dueños y el de la gerencia?',
      familiar: '¿Los dueños ocupan también cargos de gestión?',
    },
    aclaracion: 'Nos referimos a los cargos que ocupa cada uno.',
    opciones: [
      { texto: { propietario: 'Soy dueño y gerente general, y llevo el día a día', gestor: 'Los dueños ocupan los cargos de gestión; mi rol es de apoyo', familiar: 'Sí: un dueño es gerente general y lleva el día a día' }, puntaje: 3 },
      { texto: { propietario: 'Soy dueño y gerente general, con gerentes de área que me reportan', gestor: 'Tengo un cargo gerencial, y los dueños también ocupan cargos de gestión', familiar: 'Sí: un dueño es gerente general, con gerentes de área que le reportan' }, puntaje: 2 },
      { texto: { propietario: 'El gerente general no es dueño, pero algún dueño tiene un cargo de gestión', gestor: 'Soy gerente general, y algún dueño mantiene un cargo de gestión', familiar: 'El gerente general no es dueño, pero algún dueño tiene un cargo de gestión' }, puntaje: 1 },
      { texto: { propietario: 'El gerente general no es dueño, y los dueños no tienen cargos de gestión', gestor: 'Soy gerente general, y ningún dueño tiene cargos de gestión', familiar: 'No: la gerencia está a cargo de personas que no son dueñas' }, puntaje: 0 },
    ],
  },
  {
    id: 'reuniones',
    construct: 'cadencia_reuniones',
    dimension: 'decisiones',
    texto: '¿Con qué frecuencia se reúnen formalmente los socios o líderes para revisar el rumbo del negocio?',
    aclaracion: 'Contá solo las reuniones dedicadas a revisar el negocio, no las operativas del día a día.',
    opciones: [
      { texto: 'Casi nunca, o solo cuando surge un problema', puntaje: 3 },
      { texto: 'Una o dos veces al año', puntaje: 2 },
      { texto: 'Cada tres o cuatro meses', puntaje: 1 },
      { texto: 'Todos los meses o cada dos meses', puntaje: 0 },
    ],
  },
  {
    id: 'presupuesto',
    construct: 'disposicion_presupuesto',
    dimension: 'disponibilidad',
    texto: {
      propietario: '¿Estarías dispuesto a destinar un presupuesto real al funcionamiento del directorio?',
      gestor: '¿Los dueños estarían dispuestos a destinar un presupuesto real al funcionamiento del directorio?',
      familiar: '¿Los dueños estarían dispuestos a destinar un presupuesto real al funcionamiento del directorio?',
    },
    aclaracion: 'Incluye honorarios de directores independientes, lugar de reunión y materiales.',
    opciones: [
      { texto: 'No está en el presupuesto y sería difícil incorporarlo', puntaje: 0 },
      { texto: 'Podría destinarse algo pequeño como primera instancia', puntaje: 1 },
      { texto: 'Sí, si el valor aportado lo justifica claramente', puntaje: 2 },
      { texto: 'Ya está contemplado o no sería un obstáculo', puntaje: 3 },
    ],
  },
  {
    id: 'objetivo',
    construct: 'objetivo_consejo',
    dimension: null,
    texto: '¿Qué esperás lograr con un consejo?',
    aclaracion: 'Elegí el objetivo principal. No suma puntaje: lo usamos para orientar tu informe.',
    opciones: OBJETIVOS.map(o => ({ texto: o.texto, puntaje: null })),
  },
];

// ═══ Módulo 2 · Mapa de decisiones ═════════════════════════════════════════════
// Cada escenario mide quién toma UNA decisión concreta. El Módulo 5 reutiliza estas respuestas.

export type DecisionM2 = 'credito' | 'expansion' | 'sueldo_ceo' | 'resultados' | 'familiares' | 'dividendos';

export type SituacionM2 = {
  id: DecisionM2;
  construct: string;
  /** Nombre corto de la decisión (lo reutiliza el Módulo 5). */
  decision: string;
  texto: string;
  aclaracion: string;
  opciones: { label: string; tipo: 'concentrada' | 'parcial' | 'delegada' | 'gris' }[];
  beneficioDirectorio: string;
};

export const SITUACIONES_M2: SituacionM2[] = [
  {
    id: "credito",
    construct: "decision_credito",
    decision: "Tomar deuda importante",
    texto: "El banco ofrece una línea de crédito importante. ¿Quién decide si se toma?",
    aclaracion: "Pensá en la última vez que se evaluó un crédito importante, o en cómo se decidiría hoy.",
    opciones: [
      { label: "El dueño solo, sin consultar", tipo: "concentrada" },
      { label: "El dueño con el CFO o contador", tipo: "parcial" },
      { label: "Se analiza formalmente con datos antes de decidir", tipo: "delegada" },
      { label: "No hay un proceso claro, depende del momento", tipo: "gris" },
    ],
    beneficioDirectorio: "Esta es una decisión donde el directorio debe liderar (modo 'take charge'): evalúa el endeudamiento con análisis independiente, hace las preguntas correctas antes de opinar y protege el patrimonio de todos los socios — no solo del que firma.",
  },
  {
    id: "expansion",
    construct: "decision_expansion",
    decision: "Expandirse a nuevos mercados",
    texto: "Dos socios no se ponen de acuerdo sobre expandir a otra provincia. ¿Qué pasa?",
    aclaracion: "Es una decisión estratégica con impacto en la operación y el capital.",
    opciones: [
      { label: "El socio con más poder decide", tipo: "concentrada" },
      { label: "Negocian entre ellos hasta que uno cede", tipo: "parcial" },
      { label: "Se analizan los números y se decide con criterio objetivo", tipo: "delegada" },
      { label: "Se posterga indefinidamente sin resolución", tipo: "gris" },
    ],
    beneficioDirectorio: "El directorio actúa como socio estratégico (modo 'partner'): facilita el debate con datos, practica la indagación antes que la recomendación, y funciona como árbitro institucional entre socios — sin que gane el que tiene más poder.",
  },
  {
    id: "sueldo_ceo",
    construct: "decision_sueldo_ceo",
    decision: "Sueldo del CEO o dueño-gerente",
    texto: "Hay que definir cuánto cobra el CEO o dueño-gerente este año. ¿Cómo se decide?",
    aclaracion: "Incluye sueldo, bonos y beneficios de quien dirige la empresa.",
    opciones: [
      { label: "El dueño fija su propio sueldo", tipo: "concentrada" },
      { label: "Se conversa informalmente con los socios", tipo: "parcial" },
      { label: "Hay un criterio formal basado en resultados y mercado", tipo: "delegada" },
      { label: "No se revisa nunca, siempre fue igual", tipo: "gris" },
    ],
    beneficioDirectorio: "La compensación del CEO es una decisión donde el directorio debe liderar ('take charge'). Es una de las funciones más importantes del directorio como equipo: elimina el conflicto de interés y alinea incentivos con resultados reales.",
  },
  {
    id: "resultados",
    construct: "decision_resultados_bajos",
    decision: "Qué hacer ante malos resultados",
    texto: "Los resultados del trimestre fueron malos. ¿Qué pasa?",
    aclaracion: "Pensá en lo que pasa después de un período con resultados por debajo de lo esperado.",
    opciones: [
      { label: "El dueño lo absorbe solo y ajusta sobre la marcha", tipo: "concentrada" },
      { label: "Se comenta con el equipo pero no hay rendición de cuentas formal", tipo: "parcial" },
      { label: "La gerencia presenta un informe y explica las causas", tipo: "delegada" },
      { label: "Nadie rinde cuentas formalmente", tipo: "gris" },
    ],
    beneficioDirectorio: "El directorio instala disciplina de rendición de cuentas como socio estratégico: la gerencia presenta, el directorio indaga antes de juzgar, pregunta 'por qué' antes de decir 'qué hacer', y los socios se informan con transparencia.",
  },
  {
    id: "familiares",
    construct: "decision_ingreso_familiares",
    decision: "Ingreso de familiares a la empresa",
    texto: "Un hijo del dueño quiere entrar a trabajar en la empresa. ¿Cómo se decide?",
    aclaracion: "Si no es una empresa familiar, pensá en el ingreso de un pariente o allegado de algún socio.",
    opciones: [
      { label: "El dueño lo incorpora directamente", tipo: "concentrada" },
      { label: "Se habla en familia y se comunica a la empresa", tipo: "parcial" },
      { label: "Hay una política de ingreso de familiares con criterios claros", tipo: "delegada" },
      { label: "Genera incomodidad y nadie quiere tomar la decisión", tipo: "gris" },
    ],
    beneficioDirectorio: "El directorio lidera esta conversación difícil ('take charge'): establece reglas de juego objetivas para familiares. La diversidad de perspectivas del directorio como equipo genera políticas que protegen tanto a la empresa como a la familia.",
  },
  {
    id: "dividendos",
    construct: "decision_dividendos",
    decision: "Reparto de utilidades",
    texto: "Cerró bien el año. ¿Cómo se decide cuánto se reparte entre socios?",
    aclaracion: "Incluye cuánto se reparte, cuándo y cuánto se reinvierte.",
    opciones: [
      { label: "El dueño mayoritario decide cuánto y cuándo", tipo: "concentrada" },
      { label: "Se conversa entre socios informalmente", tipo: "parcial" },
      { label: "Hay una política de dividendos aprobada y se respeta", tipo: "delegada" },
      { label: "Genera conflicto cada vez, no hay reglas claras", tipo: "gris" },
    ],
    beneficioDirectorio: "El directorio lidera la recomendación de dividendos ('take charge') equilibrando reinversión y retorno. Como equipo diverso, aporta perspectivas que ningún socio individual tiene. Los socios aprueban en asamblea con información completa y reglas claras.",
  },
];

// ═══ Módulo 3 · Perfiles ══════════════════════════════════════════════════════

type PesosRespuesta = Partial<Record<PerfilKey, number>>;
type OpcionM3 = { texto: string; pesos: PesosRespuesta };
export type PreguntaM3 = { numero: number; construct: string; dimension: string; texto: string; aclaracion: string; opciones: [OpcionM3, OpcionM3, OpcionM3, OpcionM3] };

export const PREGUNTAS_M3: PreguntaM3[] = [
  {
    numero: 1, construct: "plan_estrategico", dimension: "Estrategia",
    texto: "¿La empresa tiene una estrategia a 3-5 años documentada y compartida?",
    aclaracion: "Un plan escrito con objetivos y prioridades para los próximos años, conocido por los socios y la gerencia.",
    opciones: [
      { texto: "No existe nada formal ni documentado", pesos: { estratega: 3 } },
      { texto: "Hay ideas compartidas pero nada escrito", pesos: { estratega: 2, operaciones: 1 } },
      { texto: "Existe un documento pero no se actualiza ni se sigue", pesos: { estratega: 2 } },
      { texto: "Hay un plan estratégico vigente con revisión periódica", pesos: { operaciones: 1 } },
    ],
  },
  {
    numero: 2, construct: "formalizacion_societaria", dimension: "Propiedad",
    texto: "¿La estructura de propiedad está formalizada en estatutos y acuerdos de socios?",
    aclaracion: "El acuerdo de socios regula, por ejemplo, la venta de acciones, la salida de un socio y cómo se resuelven las diferencias.",
    opciones: [
      { texto: "No hay estatutos actualizados ni acuerdo de socios", pesos: { financiero: 2, operaciones: 1 } },
      { texto: "Hay estatutos básicos pero desactualizados", pesos: { financiero: 2 } },
      { texto: "Los estatutos están al día pero no hay acuerdo de socios", pesos: { financiero: 1, estratega: 1 } },
      { texto: "Estatutos actualizados y acuerdo de socios vigente", pesos: { estratega: 1 } },
    ],
  },
  {
    numero: 3, construct: "estructura_financiamiento", dimension: "Finanzas",
    texto: "¿Cuál es la situación financiera actual de la empresa?",
    aclaracion: "Tené en cuenta la deuda actual y la que está planificada.",
    opciones: [
      { texto: "Sin deuda estructural, operamos con capital propio",           pesos: { operaciones: 1 } },
      { texto: "Créditos bancarios habituales de corto plazo",                 pesos: { financiero: 2 } },
      { texto: "Deuda de mediano o largo plazo activa o planificada",          pesos: { financiero: 3 } },
      { texto: "Obligaciones negociables, fondos o deuda estructurada",        pesos: { financiero: 3, estratega: 1 } },
    ],
  },
  {
    numero: 4, construct: "estres_financiero", dimension: "Finanzas",
    texto: "¿La empresa ha tenido o tiene dificultades financieras significativas?",
    aclaracion: "Por ejemplo: atrasos con proveedores, bancos o impuestos, o falta de caja para operar.",
    opciones: [
      { texto: "No, la situación financiera siempre fue estable",              pesos: {} },
      { texto: "Tuvimos tensiones puntuales ya superadas",                     pesos: { financiero: 1 } },
      { texto: "Hay problemas activos que impactan la operación",              pesos: { financiero: 3, operaciones: 1 } },
      { texto: "Estamos en reestructuración o proceso concursal",              pesos: { financiero: 3, estratega: 1 } },
    ],
  },
  {
    numero: 5, construct: "internacionalizacion", dimension: "Mercado",
    texto: "¿La empresa exporta o tiene planes serios de expansión internacional?",
    aclaracion: "Considerá exportaciones y operaciones en otros países.",
    opciones: [
      { texto: "No, operamos exclusivamente en Argentina",                     pesos: { comercial: 1 } },
      { texto: "Exportaciones menores o esporádicas",                          pesos: { comercial: 2 } },
      { texto: "Exportación activa o expansión regional en curso",             pesos: { comercial: 3, estratega: 2 } },
      { texto: "Internacionalización como eje estratégico central",            pesos: { estratega: 3, comercial: 3 } },
    ],
  },
  {
    numero: 6, construct: "desafio_negocio", dimension: "Estrategia",
    texto: "¿Cuál es el principal desafío de la empresa para los próximos 3 años?",
    aclaracion: "Elegí el que más te preocupa hoy para el negocio.",
    opciones: [
      { texto: "Crecer en ventas o llegar a nuevos clientes y mercados",          pesos: { comercial: 3, estratega: 1 } },
      { texto: "Ordenar las finanzas, el endeudamiento o conseguir financiamiento", pesos: { financiero: 3, estratega: 1 } },
      { texto: "Ganar eficiencia y ordenar la operación para poder escalar",      pesos: { operaciones: 3, estratega: 1 } },
      { texto: "Redefinir el rumbo: nuevos negocios o cambio de modelo",     pesos: { estratega: 3, financiero: 1 } },
    ]
  },
  {
    numero: 7, construct: "origen_clientes", dimension: "Comercial",
    texto: "¿Cómo llegan hoy los nuevos clientes a la empresa?",
    aclaracion: "Pensá en los clientes nuevos de los últimos 12 meses.",
    opciones: [
      { texto: "Por el dueño y sus contactos personales exclusivamente",       pesos: { comercial: 3 } },
      { texto: "Por boca a boca sin acción comercial activa",                  pesos: { comercial: 2 } },
      { texto: "Hay un equipo comercial pero sin estrategia clara",            pesos: { comercial: 2, estratega: 1 } },
      { texto: "Tenemos canales y procesos comerciales bien definidos",        pesos: { estratega: 1 } },
    ],
  },
  {
    numero: 8, construct: "formalizacion_procesos", dimension: "Operaciones",
    texto: "¿La empresa tiene procesos documentados y sistemas de gestión implementados?",
    aclaracion: "Por ejemplo: procedimientos escritos, sistemas de gestión o indicadores.",
    opciones: [
      { texto: "Todo está en la cabeza de las personas clave",                         pesos: { operaciones: 3 } },
      { texto: "Hay algo documentado pero muy informal",                               pesos: { operaciones: 2 } },
      { texto: "Procesos documentados pero no siempre respetados",                     pesos: { operaciones: 1 } },
      { texto: "Sistemas y procesos funcionando con métricas de seguimiento",          pesos: { estratega: 1 } },
    ],
  },
];

// ═══ Módulo 4 · Disposición ("¿Estás listo?") ═════════════════════════════════
// Se responde Sí / Parcial / No. Lo que ya pregunta el Módulo 5 (información previa, desacuerdos y
// evaluación) no se repite acá.

export type PreguntaM4 = { id: string; construct: string; texto: Record<GrupoRol, string> };

export const PREGUNTAS_M4: PreguntaM4[] = [
  {
    id: 'rendir_cuentas',
    construct: 'disposicion_rendir_cuentas',
    texto: {
      propietario: '¿Estarías dispuesto a presentar resultados formalmente ante un directorio?',
      gestor: '¿Estarías dispuesto a rendir cuentas formalmente ante un directorio?',
      familiar: '¿Quien gestiona estaría dispuesto a presentar resultados formalmente ante un directorio?',
    },
  },
  {
    id: 'separar_presidencia',
    construct: 'disposicion_separar_presidencia',
    texto: {
      propietario: '¿Podrías separar quién preside el directorio de quién gerencia la empresa?',
      gestor: '¿Los dueños aceptarían que la presidencia del directorio y la gerencia estén separadas?',
      familiar: '¿Existe o podría existir una separación real entre quién preside el directorio y quién gerencia?',
    },
  },
  {
    id: 'tiempo',
    construct: 'disposicion_tiempo',
    texto: {
      propietario: '¿Podrías reservar 2 horas por mes, sin postergarlas, para reunirte con el directorio?',
      gestor: '¿Los dueños podrían reservar 2 horas por mes, sin postergarlas, para reunirse con el directorio?',
      familiar: '¿Los dueños podrían reservar 2 horas por mes, sin postergarlas, para reunirse con el directorio?',
    },
  },
  {
    id: 'externos',
    construct: 'apertura_directores_externos',
    texto: {
      propietario: '¿Sumarías al directorio personas externas, sin vínculo familiar ni societario con los dueños?',
      gestor: '¿Los dueños sumarían al directorio personas externas, sin vínculo familiar ni societario con ellos?',
      familiar: '¿Los dueños sumarían al directorio personas externas, sin vínculo familiar ni societario con ellos?',
    },
  },
];

/** Compatibilidad con la pantalla del Módulo 4: textos por grupo. */
export const DIAG_PREGUNTAS: Record<GrupoRol, string[]> = {
  propietario: PREGUNTAS_M4.map(p => p.texto.propietario),
  gestor: PREGUNTAS_M4.map(p => p.texto.gestor),
  familiar: PREGUNTAS_M4.map(p => p.texto.familiar),
};

export const TOTAL_DIAG = PREGUNTAS_M4.length;

// ═══ Módulo 5 · Consejo y gerencia ════════════════════════════════════════════

export type ValorM5 = 1 | 0.5 | 0;


export type TemaM5 = {
  id: string;
  construct: string;
  tema: string;
  pregunta: Texto;
  aclaracion: string;
  opciones: { texto: Texto; valor: ValorM5 }[];
  /** La regla recomendada que va al acuerdo de trabajo. */
  regla: string;
  /** Consejo práctico si la respuesta no fue la ideal. */
  consejo: string;
  /** La pregunta se precarga con las decisiones del Módulo 2 y solo pide confirmar o ajustar. */
  precargaM2?: true;
};

export const TEMAS_M5: TemaM5[] = [
  {
    id: "informacion",
    construct: "regla_informacion",
    tema: "Información",
    pregunta: "¿Cómo va a recibir el consejo la información antes de cada reunión?",
    aclaracion: "Respondé cómo te gustaría que funcione, aunque el consejo todavía no exista.",
    opciones: [
      { texto: "Un informe breve con números y temas, una semana antes", valor: 1 },
      { texto: "Lo que haya disponible, unos días antes", valor: 0.5 },
      { texto: "Se presenta en la misma reunión", valor: 0 },
    ],
    regla: "La gerencia envía un informe breve (números del período + temas a decidir) una semana antes de cada reunión.",
    consejo: "Empezá con una sola hoja: ventas, margen, caja, deuda y los 2 temas a decidir. Con eso alcanza para arrancar.",
  },
  {
    id: "decisiones",
    construct: "regla_decisiones_reservadas",
    tema: "Qué se decide en la mesa",
    pregunta: "¿Qué decisiones van a pasar por el consejo?",
    aclaracion: "Precargamos la lista con lo que respondiste en el Módulo 2. Confirmala o ajustala.",
    precargaM2: true,
    opciones: [
      { texto: "Confirmo la lista: estas decisiones pasan siempre por el consejo", valor: 1 },
      { texto: "Prefiero decidir en cada caso qué se lleva al consejo", valor: 0.5 },
      { texto: "Ninguna en particular: el consejo es solo para opinar", valor: 0 },
    ],
    regla: "Hay una lista escrita de decisiones que siempre pasan por el consejo (endeudamiento, inversiones grandes, ingreso de socios, sueldo del CEO).",
    consejo: "Armá la lista en la primera reunión: 5 a 8 decisiones. Todo lo demás queda en manos de la gerencia.",
  },
  {
    id: "contacto",
    construct: "regla_contacto_equipo",
    tema: "Contacto con el equipo",
    pregunta: "Si un asesor necesita información de un gerente, ¿cómo lo hace?",
    aclaracion: "Por ejemplo, si necesita datos de ventas, de producción o de cobranzas.",
    opciones: [
      { texto: "La pide a través del CEO o de quien preside el consejo", valor: 1 },
      { texto: "Habla directo con el gerente, avisando al CEO", valor: 0.5 },
      { texto: "Habla directo con quien quiera, cuando quiera", valor: 0 },
    ],
    regla: "Los asesores piden información a través del CEO o de quien preside el consejo, nunca dan instrucciones al equipo.",
    consejo: "Dejalo por escrito desde el inicio: evita el problema más común entre consejo y gerencia.",
  },
  {
    id: "desacuerdo",
    construct: "regla_desacuerdos",
    tema: "Desacuerdos",
    pregunta: {
      propietario: "Si el consejo no está de acuerdo con una decisión importante tuya, ¿qué pasa?",
      gestor: "Si el consejo no está de acuerdo con una decisión importante tuya o de los dueños, ¿qué pasa?",
      familiar: "Si el consejo no está de acuerdo con una decisión importante de quien gestiona, ¿qué pasa?",
    },
    aclaracion: "Pensá en una decisión importante sobre la que el consejo opine distinto.",
    opciones: [
      { texto: "Se debate, se pide más información y se decide en la próxima reunión", valor: 1 },
      { texto: { propietario: "Escucho la opinión, pero decido igual", gestor: "Se escucha la opinión, pero se decide igual", familiar: "Se escucha la opinión, pero se decide igual" }, valor: 0.5 },
      { texto: { propietario: "Prefiero que el consejo no cuestione mis decisiones", gestor: "Preferimos que el consejo no cuestione las decisiones", familiar: "Se prefiere que el consejo no cuestione las decisiones" }, valor: 0 },
    ],
    regla: "Ante un desacuerdo importante, se pide más información y la decisión se toma en la reunión siguiente, con todos los datos.",
    consejo: "Probá con una regla simple: ninguna decisión grande se toma en la misma reunión en que se presenta.",
  },
  {
    id: "evaluacion",
    construct: "regla_evaluacion",
    tema: "Evaluación",
    pregunta: "¿Cómo se va a medir si el consejo y la gerencia funcionan bien?",
    aclaracion: "Se refiere al desempeño del CEO y al funcionamiento del propio consejo.",
    opciones: [
      { texto: "Una evaluación anual del CEO y del propio consejo", valor: 1 },
      { texto: "Una charla informal a fin de año", valor: 0.5 },
      { texto: "No hace falta evaluarlo", valor: 0 },
    ],
    regla: "Una vez por año se evalúa el desempeño del CEO y el funcionamiento del propio consejo.",
    consejo: "La herramienta de Evaluación del CEO (Fase 3) te deja hacerlo en 15 minutos por persona.",
  },
];

// ═══ Catálogo (para tests y auditoría) ═════════════════════════════════════════

export type EntradaCatalogo = { modulo: 1 | 2 | 3 | 4 | 5; id: string; construct: string };

export const CATALOGO: EntradaCatalogo[] = [
  ...PREGUNTAS_M1.map(p => ({ modulo: 1 as const, id: p.id, construct: p.construct })),
  ...SITUACIONES_M2.map(p => ({ modulo: 2 as const, id: p.id, construct: p.construct })),
  ...PREGUNTAS_M3.map(p => ({ modulo: 3 as const, id: `m3_${p.numero}`, construct: p.construct })),
  ...PREGUNTAS_M4.map(p => ({ modulo: 4 as const, id: p.id, construct: p.construct })),
  ...TEMAS_M5.map(p => ({ modulo: 5 as const, id: p.id, construct: p.construct })),
];
