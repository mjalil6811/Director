// Informe interno para quien va a presidir o acompañar el consejo (chairman / asesor).
// Lo escribe "un consultor" a partir de las respuestas del diagnóstico. Función pura: no toca storage.
import type { Modulo1Resultado, Modulo2Resultado, Modulo3Resultado, Modulo4Diagnostico } from '../types';
import { PERFILES, type PerfilKey } from './modulo3';
import { CATEGORIA_LABEL, INDUSTRIAS, ROLES } from './pymes';
import { IDX } from './modulo1';

export type Entradas = {
  empresa: string;
  m1: Modulo1Resultado;
  m2: Modulo2Resultado;
  m3: Modulo3Resultado;
  m4diag: Modulo4Diagnostico | null;
  m4frecuencia: string | null;
  /** Respuestas crudas (índices de opción) para matices que no quedan en los resultados. */
  respuestasM1: number[] | null;
  respuestasM3: number[] | null;
  indice: number;
};

export type Riesgo = { titulo: string; detalle: string; nivel: 'alto' | 'medio' };
export type Paso = { cuando: string; que: string; detalle: string };

export type InformeAsesor = {
  resumen: { etiqueta: string; valor: string }[];
  lectura: string[];
  riesgos: Riesgo[];
  consejo: { formato: string; formatoDetalle: string; tamano: string; perfiles: { nombre: string; urgencia: string; porque: string }[]; frecuencia: string };
  hojaDeRuta: Paso[];
  primerasReuniones: { n: number; foco: string; agenda: string[] }[];
  conversacion: string[];
  senales: string[];
};

const DESAFIOS = [
  'crecer en ventas y llegar a nuevos mercados',
  'ordenar las finanzas y el financiamiento',
  'ganar eficiencia y ordenar la operación para escalar',
  'redefinir el rumbo (nuevos negocios, sucesión o reinvención)',
];

function pctDim(m1: Modulo1Resultado, key: string): number | undefined {
  const d = m1.scoresPorDimension.find(x => x.key === key);
  return d ? Math.round((d.score / Math.max(1, d.max)) * 100) : undefined;
}

export function generarInformeAsesor(e: Entradas): InformeAsesor {
  const { m1, m2, m3, m4diag } = e;
  const perfil = m1.perfil;
  const grupo = perfil?.grupo ?? 'propietario';
  const rolLabel = perfil ? ROLES.find(r => r.key === perfil.rol)?.label.replace(/^Soy /, '') : undefined;
  const industria = perfil ? INDUSTRIAS.find(i => i.key === perfil.industria)?.label : undefined;
  const concentracion = m2.porcentaje ?? 0;
  const disposicion = m4diag?.porcentaje;
  const gobierno = pctDim(m1, 'gobierno') ?? 0;
  const recursos = pctDim(m1, 'disponibilidad');
  const propiedadIdx = e.respuestasM1?.[IDX.empleados + 1] ?? -1; // 0 dueño único · 1 socios fundadores · 2 familia ampliada · 3 inversores
  const sucesionIdx = e.respuestasM1?.[IDX.empleados + 2] ?? -1; // 2–3 = en proceso / ya ocurrió con tensiones
  const desafioIdx = e.respuestasM3?.[5] ?? -1;
  const top = m3.topPerfiles.slice(0, 2);
  const nombreDe = (k: string) => PERFILES[k as PerfilKey]?.nombre ?? k;

  // ——— Resumen ———
  const resumen = [
    { etiqueta: 'Empresa', valor: e.empresa || 'Sin nombre' },
    ...(perfil ? [{ etiqueta: 'Categoría', valor: `${CATEGORIA_LABEL[perfil.categoria]} · ${industria}` }] : []),
    ...(rolLabel ? [{ etiqueta: 'Respondió', valor: rolLabel.charAt(0).toUpperCase() + rolLabel.slice(1) }] : []),
    { etiqueta: 'Índice de preparación', valor: `${e.indice}/100` },
    { etiqueta: 'Necesidad (Módulo 1)', valor: `${m1.porcentaje ?? 0}% · ${m1.nivel}` },
    { etiqueta: 'Concentración de decisiones', valor: `${concentracion}%` },
    ...(disposicion !== undefined ? [{ etiqueta: 'Disposición al cambio', valor: `${disposicion}%` }] : []),
  ];

  // ——— Lectura del caso ———
  const lectura: string[] = [];
  if (grupo === 'propietario') {
    lectura.push(concentracion >= 50
      ? 'Respondió el propio dueño y reconoce que muchas decisiones pasan por él. Es una buena señal: hay conciencia del problema. Tu rol inicial es de acompañante que suma criterio, no de auditor que viene a controlar.'
      : 'Respondió el propio dueño y la empresa ya delega bastante. El consejo puede arrancar enfocado en estrategia y crecimiento, sin necesidad de “ordenar” primero.');
  } else if (grupo === 'gestor') {
    lectura.push('Respondió un CEO o directivo que no es socio: probablemente es quien impulsa la idea del consejo. Antes de avanzar, validá el interés directamente con los dueños. El riesgo es que el consejo se perciba como una herramienta del gerente y no de la propiedad.');
  } else {
    lectura.push('Respondió un accionista o familiar que no gestiona. El consejo puede ser su forma de recuperar visibilidad sobre la empresa. Cuidá que no se lea como un ataque a quien gestiona: presentalo como un respaldo para todos.');
  }
  if (gobierno >= 60) lectura.push('La separación entre propiedad y gestión es débil: quien es dueño también decide lo operativo. Una de tus primeras tareas es ayudar a distinguir qué es una decisión de dueño, de consejo y de gerencia.');
  if (propiedadIdx >= 2) lectura.push('La estructura de propiedad es compleja (familia ampliada o inversores). El consejo va a tener que equilibrar intereses distintos: conviene que haya mayoría de miembros independientes.');
  if (desafioIdx >= 0) lectura.push(`El principal desafío declarado para los próximos 3 años es ${DESAFIOS[desafioIdx]}. Ese tema debería ocupar la agenda estratégica del primer año.`);

  // ——— Riesgos ———
  const riesgos: Riesgo[] = [];
  if (concentracion >= 60) riesgos.push({ nivel: 'alto', titulo: 'Decisiones concentradas en una persona', detalle: 'Si esa persona falta o se equivoca, no hay contrapeso. Prioridad: acordar qué decisiones pasan por el consejo.' });
  if (sucesionIdx >= 2) riesgos.push({ nivel: 'alto', titulo: 'Sucesión o cambio de control en curso', detalle: 'Es el momento de mayor riesgo en una empresa familiar. El consejo debe acompañar el proceso con reglas claras y un plan por escrito.' });
  if (disposicion !== undefined && disposicion < 50) riesgos.push({ nivel: 'alto', titulo: 'Baja disposición a rendir cuentas', detalle: 'Un consejo formal impuesto ahora probablemente fracase. Empezá con un formato asesor, sin poder de veto, y ganá confianza.' });
  if (desafioIdx === 1 || top.some(t => t.perfil === 'financiero' && /cr[ií]tico|urgente/i.test(t.urgencia))) riesgos.push({ nivel: 'medio', titulo: 'Frente financiero sensible', detalle: 'Endeudamiento o necesidad de financiamiento. Pedí desde la primera reunión un paquete de información financiera mensual.' });
  if (recursos !== undefined && recursos <= 33) riesgos.push({ nivel: 'medio', titulo: 'Poco presupuesto para el consejo', detalle: 'Sin honorarios para independientes es difícil sumar perfiles de calidad. Proponé arrancar con 2 asesores y revisar al año.' });
  if (propiedadIdx >= 2) riesgos.push({ nivel: 'medio', titulo: 'Intereses de socios o familia no alineados', detalle: 'Antes del consejo conviene un acuerdo de socios o protocolo familiar (Fase 2 de la herramienta).' });
  if (riesgos.length === 0) riesgos.push({ nivel: 'medio', titulo: 'Que el consejo se vuelva una formalidad', detalle: 'Con una empresa ordenada, el riesgo es que las reuniones sean solo informativas. Exigí al menos un tema estratégico a fondo por reunión.' });

  // ——— Cómo armar el consejo ———
  let formato: string, formatoDetalle: string;
  if (disposicion === undefined || disposicion < 50) {
    formato = 'Consejo asesor informal';
    formatoDetalle = 'Sin poder de voto ni actas societarias. Reuniones regulares con 2 o 3 asesores externos durante 6 a 12 meses, para construir el hábito y la confianza.';
  } else if (disposicion < 80) {
    formato = 'Consejo asesor con reglamento';
    formatoDetalle = 'Reglas escritas: qué temas se tratan, qué información llega antes, cómo se registran los acuerdos. Evaluar en un año el paso a directorio formal.';
  } else {
    formato = 'Directorio formal (o consejo con funciones de directorio)';
    formatoDetalle = 'Hay disposición para un órgano con decisiones reservadas, actas y evaluación del CEO. Usá la Fase 2 para el acta y el protocolo.';
  }
  const grande = perfil && (perfil.categoria === 'tramo2' || perfil.categoria === 'grande');
  const tamano = grande || propiedadIdx >= 2
    ? '5 miembros: 2 por la propiedad y 3 independientes'
    : '3 miembros: el dueño (o un representante) y 2 independientes';
  const perfiles = top.map(t => ({
    nombre: nombreDe(t.perfil),
    urgencia: t.urgencia,
    porque: (PERFILES[t.perfil as PerfilKey]?.senalClave ?? '').split('.')[0] + '.',
  }));
  const frecuencia = e.m4frecuencia ?? 'Trimestral (4 reuniones/año)';

  // ——— Hoja de ruta ———
  const hojaDeRuta: Paso[] = [
    { cuando: 'Semanas 1–2', que: 'Conversación uno a uno con el dueño', detalle: 'Entender qué espera del consejo, qué le preocupa y qué temas no quiere delegar. Sin esto, todo lo demás falla.' },
    { cuando: 'Mes 1', que: 'Acordar el mapa de decisiones', detalle: 'Qué decide el consejo, qué acompaña y qué queda en la gerencia. Un documento de una página.' },
    { cuando: 'Mes 1–2', que: `Sumar al primer independiente (${perfiles[0]?.nombre ?? 'perfil prioritario'})`, detalle: 'Buscar por referencias, con experiencia en empresas de tamaño similar. Definir honorarios y compromiso de tiempo.' },
    { cuando: 'Mes 2', que: 'Primera reunión formal', detalle: 'Con agenda enviada una semana antes y un paquete mínimo de números.' },
    { cuando: 'Mes 3', que: 'Revisión de lo aprendido', detalle: 'Qué funcionó, qué ajustar en el formato y en la información que llega. Fijar el calendario del año.' },
  ];

  // ——— Primeras reuniones ———
  const desafio = desafioIdx >= 0 ? DESAFIOS[desafioIdx] : 'el principal desafío del negocio';
  const primerasReuniones = [
    { n: 1, foco: 'Diagnóstico compartido', agenda: ['Presentación de los miembros y expectativas', 'Repaso de este diagnóstico con el dueño', 'Aprobación del mapa de decisiones'] },
    { n: 2, foco: 'Números y prioridades', agenda: ['Resultados del período y situación de caja', `Primer tema estratégico: ${desafio}`, 'Definir el paquete de información mensual'] },
    { n: 3, foco: 'Plan del año', agenda: ['Prioridades estratégicas y responsables', 'Calendario de reuniones del año', 'Mini autoevaluación: ¿está funcionando el consejo?'] },
  ];

  // ——— Cómo conversarlo ———
  const conversacion = grupo === 'gestor'
    ? ['Planteá el consejo como un respaldo para los dueños, no para la gerencia.', 'Pedí que sean los dueños quienes inviten formalmente a los asesores.', 'Acordá con anticipación qué información vas a compartir y con quién.']
    : grupo === 'familiar'
    ? ['Hablá primero con quien gestiona, a solas, antes de proponerlo en familia.', 'Enfocá la conversación en el futuro de la empresa, no en errores pasados.', 'Proponé un período de prueba de 6 meses para bajar resistencias.']
    : ['Hablá de “sumar experiencia”, no de “control”: el dueño sigue al mando.', 'Empezá por los temas que más le preocupan a él, no por los que ves vos.', 'Mostrá resultados rápidos: una decisión mejor tomada en los primeros 90 días vale más que cualquier reglamento.'];

  const senales = [
    'Las reuniones se hacen en fecha y nadie llega sin haber leído el material.',
    'Al menos una decisión importante del año cambió (o mejoró) por el aporte del consejo.',
    'El dueño consulta al consejo antes de decidir, no después.',
  ];

  return { resumen, lectura, riesgos: riesgos.slice(0, 4), consejo: { formato, formatoDetalle, tamano, perfiles, frecuencia }, hojaDeRuta, primerasReuniones, conversacion, senales };
}
