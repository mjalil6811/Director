// Textos de la home. Para cambiar un texto de la landing, editar acá (no en app/page.tsx).
import { FASES } from './navegacion';

export const STATS = [
  { valor: '~8 min', label: 'Dura el diagnóstico' },
  { valor: '35', label: 'Preguntas en 5 módulos' },
  { valor: '12', label: 'Herramientas integradas' },
  { valor: '100%', label: 'Gratuito y privado' },
];

export const PROCESO = [
  {
    paso: 'Diagnosticá',
    titulo: 'Descubrí si es momento de sumar un consejo asesor',
    descripcion: 'Respondé 5 módulos cortos sobre cómo se decide hoy en tu empresa, qué perfiles te faltan, tu disposición al cambio y la relación con la gerencia.',
    color: '#534AB7',
    colorBg: '#EEEDFE',
    items: ['Índice de preparación 0-100', 'Perfil en 5 dimensiones', 'Comparación con otras empresas', 'Recomendaciones a tu medida'],
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
    titulo: 'Diseñado para Argentina',
    descripcion: 'Tipos societarios (SRL, SA, SAS), CUIT, marco legal argentino, y la realidad de las PyMEs familiares.',
    icono: 'globo' as const,
  },
  {
    titulo: 'Sin registro ni servidor',
    descripcion: 'Todo se guarda en tu dispositivo. No necesitás crear una cuenta ni compartir datos con nadie.',
    icono: 'candado' as const,
  },
  {
    titulo: 'De diagnóstico a acción',
    descripcion: 'No te dice solo qué necesitás — te da las herramientas para hacerlo: actas, protocolos, reuniones, evaluaciones.',
    icono: 'pulso' as const,
  },
  {
    titulo: 'Basado en mejores prácticas',
    descripcion: 'Metodología basada en IFC, OCDE, IAE e IDEA, adaptada para empresas medianas y familiares.',
    icono: 'libro' as const,
  },
];

export const FAQ = [
  { q: '¿Para qué tipo de empresa es esto?', a: 'Para PyMEs, empresas familiares y empresas medianas argentinas que quieren tomar mejores decisiones con el respaldo de un consejo asesor o directorio. No necesitás tener nada armado: la herramienta empieza por evaluar si es tu momento.' },
  { q: '¿Es gratis?', a: 'Sí, 100% gratuito. No hay planes pagos, ni límites de uso, ni funcionalidades bloqueadas.' },
  { q: '¿Mis datos son privados?', a: 'Todo se guarda en el localStorage de tu navegador. No hay servidor, no hay base de datos, no hay registro. Tus datos no salen de tu dispositivo.' },
  { q: '¿Necesito completar todo en una sesión?', a: 'No. Cada módulo guarda tu progreso automáticamente. Podés volver cuando quieras y retomar donde dejaste.' },
  { q: '¿Qué es el Índice de preparación?', a: 'Es un puntaje de 0 a 100 que mide qué tan preparada está tu empresa para decidir con el respaldo de un consejo asesor o directorio. Integra 5 dimensiones: necesidad, decisiones, perfiles, disposición y dinámica. Sirve como referencia ante inversores, fondos y socios estratégicos.' },
];

// Lo que el usuario va a hacer, visible sin scroll
export const RECORRIDO = [
  {
    fase: 1, verbo: FASES[0].verbo, color: FASES[0].color, bg: FASES[0].bg, href: FASES[0].href,
    que: 'Respondés 35 preguntas en 5 módulos cortos, con los criterios oficiales PyME',
    obtenes: 'Índice de preparación, nivel de urgencia y los perfiles de asesores que te faltan',
    tiempo: '~8 min',
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
