// Textos de la home. Para cambiar un texto de la landing, editar acá (no en app/page.tsx).
import { FASES, MODULOS_F1, TOTAL_MODULOS_F1, TOTAL_MIN_F1 } from './navegacion';
import { PREGUNTAS_POR_MODULO, TOTAL_PREGUNTAS_F1 } from './conteo-diagnostico';
import { TOTAL_HERRAMIENTAS_DISPONIBLES } from './herramientas';
import { NORMA_PYME, VIGENCIA, TIPO_CAMBIO_TEXTO } from './pymes';

// ——— Tiempos y CTA (una sola fuente para toda la landing) ————————————————
const M1 = MODULOS_F1[0];
export const TIEMPO_TOTAL = `~${TOTAL_MIN_F1} min`;
export const TIEMPO_M1 = `${PREGUNTAS_POR_MODULO[1]} preguntas, ~${M1.min} min`;
/** p. ej. "Diagnóstico completo: ~9 min · Empezás por el Módulo 1 (13 preguntas, ~4 min)" */
export const TIEMPO_RESUMEN = `Diagnóstico completo: ${TIEMPO_TOTAL} · Empezás por el Módulo 1 (${TIEMPO_M1})`;
export const PREGUNTAS_RESUMEN = `${TOTAL_PREGUNTAS_F1} preguntas en ${TOTAL_MODULOS_F1} módulos`;

export const CTA = 'Comenzar diagnóstico gratuito';
/** Solo para el header en mobile, donde no entra el texto completo. */
export const CTA_CORTO = 'Empezar gratis';

export const AYUDA_NOMBRE = 'Opcional. Se usa solo para personalizar tu informe y se guarda en tu dispositivo.';
export const AVISO_DATOS = 'Tus respuestas se guardan en este navegador. Si borrás los datos del navegador o cambiás de dispositivo, perdés el progreso. Podés exportar un respaldo en PDF o JSON.';

export const STATS = [
  { valor: TIEMPO_TOTAL, label: 'Dura el diagnóstico completo' },
  { valor: String(TOTAL_PREGUNTAS_F1), label: `Preguntas en ${TOTAL_MODULOS_F1} módulos` },
  { valor: String(TOTAL_HERRAMIENTAS_DISPONIBLES), label: 'Herramientas disponibles' },
  { valor: '100%', label: 'Gratuito, sin registro' },
];

export const PROCESO = [
  {
    paso: 'Diagnosticá',
    titulo: 'Descubrí si es momento de sumar un consejo asesor',
    descripcion: `Respondé ${TOTAL_MODULOS_F1} módulos cortos (${TIEMPO_TOTAL} en total) sobre cómo se decide hoy en tu empresa, qué perfiles te faltan, tu disposición al cambio y la relación con la gerencia.`,
    color: '#534AB7',
    colorBg: '#EEEDFE',
    items: ['Índice de preparación 0-100', 'Perfil en 5 dimensiones', 'Comparación con perfiles de referencia', 'Recomendaciones a tu medida'],
  },
  {
    paso: 'Constituí',
    titulo: 'Armá tu consejo con las herramientas correctas',
    descripcion: 'Dejá por escrito cómo va a funcionar: el acta de constitución, los acuerdos entre socios o familia (resolviendo situaciones reales) y la agenda de las primeras reuniones.',
    color: '#0F6E56',
    colorBg: '#E1F5EE',
    items: ['Acta de constitución guiada', 'Acuerdos entre socios o familia', 'Reuniones con modo en vivo', 'Cronómetro y acta automática'],
  },
  {
    paso: 'Operá',
    titulo: 'Hacé que tu consejo funcione en el día a día',
    descripcion: 'Un tablero con tus números para preparar cada reunión, el seguimiento de lo acordado entre reuniones y una evaluación anual del CEO con informe confidencial.',
    color: '#854F0B',
    colorBg: '#FAEEDA',
    items: ['Tablero financiero e indicadores', 'Seguimiento de compromisos', 'Evaluación del CEO', 'Informe para cada reunión'],
  },
];

export const BENEFICIOS = [
  {
    titulo: 'Pensado para PyMEs argentinas',
    descripcion: 'Usa los criterios oficiales PyME y contempla la realidad de las empresas familiares y de socios.',
    icono: 'globo' as const,
  },
  {
    titulo: 'Del diagnóstico a la acción',
    descripcion: 'No solo te dice qué necesitás: te acompaña a armar tu consejo asesor, con acta, acuerdos entre socios y agenda de reuniones.',
    icono: 'pulso' as const,
  },
  {
    titulo: 'Decisiones con información',
    descripcion: 'Tus números, los compromisos pendientes y la evaluación del CEO en un solo lugar, para llegar preparado a cada reunión.',
    icono: 'grafico' as const,
  },
  {
    titulo: 'Simple y a tu ritmo',
    descripcion: 'Preguntas claras y sin jerga técnica. Guardás tu avance y retomás cuando quieras.',
    icono: 'reloj' as const,
  },
];

export const FAQ = [
  { q: '¿Para qué tipo de empresa es esto?', a: 'Para PyMEs, empresas familiares y empresas medianas argentinas que quieren tomar mejores decisiones con el respaldo de un consejo asesor. No necesitás tener nada armado: la herramienta empieza por evaluar si es tu momento.' },
  { q: '¿Qué diferencia hay entre un consejo asesor y un directorio?', a: 'El directorio es el órgano legal que administra una sociedad anónima: lo elige la asamblea de accionistas y sus miembros tienen responsabilidad legal por lo que deciden. Un consejo asesor no es un órgano legal: es un grupo de personas con experiencia que se reúne con los dueños para orientar las decisiones importantes, pero no decide ni firma por la empresa. Es más flexible y suele ser el primer paso antes de un directorio profesional.' },
  { q: '¿Quién debería responder?', a: 'Quien toma o comparte las decisiones importantes: el dueño, un socio, el fundador o el CEO. Al principio te preguntamos tu rol y adaptamos la forma de las preguntas. Si hay varios socios, es útil que cada uno lo haga por separado y después comparen los resultados.' },
  { q: '¿Cuánto tiempo lleva? ¿Tengo que hacerlo todo de una vez?', a: `${TIEMPO_RESUMEN}. No hace falta hacerlo de una vez: cada módulo guarda tu progreso y podés retomar donde dejaste, desde el mismo navegador.` },
  { q: '¿Es gratis?', a: 'Sí, 100% gratuito. No hay planes pagos, ni límites de uso, ni funcionalidades bloqueadas.' },
  { q: '¿Dónde se guardan mis respuestas?', a: 'En este navegador (localStorage). Tus respuestas no se envían a ningún servidor y no hace falta registrarse. Medimos visitas de forma anónima y sin cookies, sin incluir respuestas ni el nombre de tu empresa. Solo si pedís el informe por mail se envía tu mail y un resumen del resultado. El detalle está en la Política de privacidad.' },
  { q: '¿Qué pasa si borro los datos del navegador?', a: 'Se borra tu progreso, porque solo existe en este navegador: nosotros no tenemos una copia. Lo mismo pasa si cambiás de dispositivo o usás una ventana privada. Para no perderlo, exportá un respaldo (JSON) desde la pantalla de resultados o desde tu progreso en esta página, y después lo importás donde quieras.' },
  { q: '¿Cómo se calcula el resultado?', a: 'Cada módulo puntúa tus respuestas. Con eso calculamos dos ejes, necesidad y disposición, que ubican a tu empresa en una de cuatro situaciones con un próximo paso concreto. El Índice de preparación los complementa con un puntaje único. El tamaño de la empresa se ubica con los criterios oficiales PyME. La comparación es contra perfiles de referencia definidos por Directorio AR, no contra una muestra estadística. Lo explicamos en detalle en la sección "Cómo se calcula tu resultado".' },
  { q: '¿Qué es el Índice de preparación?', a: 'Es un puntaje orientativo de 0 a 100 que resume qué tan preparada está tu empresa para decidir con el respaldo de un consejo asesor. Integra 5 dimensiones: complejidad, decisiones, perfiles, disposición al cambio y relación con la gerencia. Es un dato complementario: el resultado principal es la matriz de necesidad y disposición. Sirve para ordenar la conversación interna, no es una certificación.' },
  { q: '¿Esto reemplaza a un asesor profesional?', a: 'No. Es una herramienta orientativa para ordenar ideas y empezar la conversación. No constituye asesoramiento legal, contable ni financiero. Para constituir un directorio, redactar estatutos o protocolos, consultá con profesionales (abogado, contador) que conozcan tu caso.' },
];

// ——— Metodología ("Cómo se calcula tu resultado") ——————————————————————————
export const METODOLOGIA = [
  {
    titulo: 'Tamaño de tu empresa: criterios oficiales PyME',
    texto: `Ubicamos a tu empresa como micro, pequeña, mediana (tramo 1 o 2) o grande según su industria y sus ventas anuales promedio de los últimos 3 ejercicios, con los topes de la ${NORMA_PYME.nombreLargo} (vigente desde el ${VIGENCIA}). Los topes son en pesos; en la pregunta los mostramos en dólares, al ${TIPO_CAMBIO_TEXTO}, solo como referencia. Además consideramos si tiene más de 50 empleados: ese corte es un criterio propio de Directorio AR, no de la norma. Si la empresa es más chica, te ofrecemos un diagnóstico abreviado.`,
  },
  {
    titulo: 'Resultado principal: necesidad y disposición',
    texto: 'Tu resultado se ubica en una matriz de dos ejes, cada uno de 0 a 100. Necesidad: cuánto necesita tu empresa un consejo (Módulo 1 sin la pregunta de presupuesto 50%, concentración de decisiones del Módulo 2 30%, perfiles que faltan del Módulo 3 20%). Disposición: cuánta voluntad hay de trabajar con él (Módulo 4 50%, acuerdo con la gerencia del Módulo 5 30%, presupuesto 20%). Con un corte en 50 quedan cuatro situaciones (momento de armarlo, necesidad sin acuerdo, preparación anticipada o todavía no), cada una con un próximo paso. Si falta un módulo, el eje se calcula con los que tenés.',
  },
  {
    titulo: 'Índice de preparación (0 a 100)',
    texto: 'Resume 5 dimensiones, cada una calculada en su módulo: complejidad de la empresa (15%), cómo se reparten las decisiones (25%), perfiles que necesitás (20%), disposición al cambio (20%) y reglas entre consejo y gerencia (20%). Si todavía no completaste un módulo, el índice se calcula solo con los que tenés. Las respuestas "No lo sé" no suman ni restan.',
  },
  {
    titulo: 'Comparación con otras empresas',
    texto: 'Compará tu perfil con arquetipos de empresas argentinas definidos por Directorio AR a partir de criterios de gobierno corporativo. No es una muestra estadística.',
  },
  {
    titulo: 'Límites',
    texto: 'El resultado es orientativo: depende de cómo respondas y de supuestos simplificados. No es una auditoría, una certificación ni asesoramiento legal, contable o financiero.',
  },
];


// Lo que el usuario va a hacer, visible sin scroll
export const RECORRIDO = [
  {
    fase: 1, verbo: FASES[0].verbo, color: FASES[0].color, bg: FASES[0].bg, href: FASES[0].href,
    que: `Respondés ${PREGUNTAS_RESUMEN} cortos, con los criterios oficiales PyME`,
    obtenes: 'Índice de preparación, nivel de urgencia y los perfiles de asesores que te faltan',
    tiempo: TIEMPO_TOTAL,
  },
  {
    fase: 2, verbo: FASES[1].verbo, color: FASES[1].color, bg: FASES[1].bg, href: FASES[1].href,
    que: 'Completás el acta, el protocolo de socios y la agenda de reuniones',
    obtenes: 'Documentos listos para revisar con tu abogado',
    tiempo: 'Cuando quieras',
  },
  {
    fase: 3, verbo: FASES[2].verbo, color: FASES[2].color, bg: FASES[2].bg, href: FASES[2].href,
    que: 'Cargás tus números y seguís lo acordado en cada reunión',
    obtenes: 'Tablero financiero, seguimiento de compromisos y evaluación del CEO',
    tiempo: 'Mes a mes',
  },
];
