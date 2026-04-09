import type {
  ItemReunion,
  TipoReunionItem,
  Reunion,
  TareaReunion,
  ReunionResultado,
} from '../types/fase2';

// ——— Plantilla completa de ítems de reunión —————————————————————————————————

export const PLANTILLA_ITEMS_REUNION: Omit<ItemReunion, 'id' | 'completado' | 'notas' | 'adjuntos' | 'decisiones' | 'tareas'>[] = [
  {
    tipo: 'apertura',
    titulo: 'Apertura y verificación de convocatoria',
    descripcion: 'El presidente declara abierta la sesión, verifica que la convocatoria fue cursada en tiempo y forma, y confirma que se cumplieron los requisitos estatutarios.',
    responsable: 'Presidente del directorio',
    duracionMinutos: 5,
    obligatorio: true,
  },
  {
    tipo: 'quorum',
    titulo: 'Verificación de quórum',
    descripcion: 'Se registra la asistencia de directores y se confirma que se alcanza el quórum mínimo estipulado en el reglamento. Se deja constancia de ausentes y excusas.',
    responsable: 'Secretario del directorio',
    duracionMinutos: 5,
    obligatorio: true,
  },
  {
    tipo: 'aprobacion_acta_anterior',
    titulo: 'Lectura y aprobación del acta anterior',
    descripcion: 'Se presenta el acta de la reunión anterior para su lectura, corrección si corresponde, y aprobación formal por los directores presentes.',
    responsable: 'Secretario del directorio',
    duracionMinutos: 10,
    obligatorio: true,
  },
  {
    tipo: 'informe_presidente',
    titulo: 'Informe del presidente / CEO',
    descripcion: 'El CEO o director general presenta el estado general de la empresa: avances respecto al plan estratégico, eventos relevantes del período, alertas y oportunidades detectadas.',
    responsable: 'CEO / Director General',
    duracionMinutos: 20,
    obligatorio: true,
  },
  {
    tipo: 'informe_financiero',
    titulo: 'Informe financiero y de gestión',
    descripcion: 'El CFO o responsable financiero presenta:\n• Estado de resultados del período vs. presupuesto\n• Posición de caja y proyección de liquidez\n• Principales indicadores: ventas, margen bruto, EBITDA, deuda\n• Desvíos relevantes y causas\n• Aprobación de estados contables si corresponde',
    responsable: 'CFO / Gerente de Administración',
    duracionMinutos: 25,
    obligatorio: true,
  },
  {
    tipo: 'temas_estrategicos',
    titulo: 'Seguimiento del plan estratégico',
    descripcion: 'Revisión del avance de los objetivos estratégicos del año:\n• Iniciativas en curso: estado, hitos cumplidos, próximos pasos\n• Iniciativas demoradas: causas y plan de acción\n• Nuevas oportunidades o amenazas que requieran ajuste estratégico',
    responsable: 'CEO + Directorio',
    duracionMinutos: 30,
    obligatorio: false,
  },
  {
    tipo: 'temas_estrategicos',
    titulo: 'Decisiones estratégicas del período',
    descripcion: 'Aprobación formal de decisiones que requieren aval del directorio:\n• Inversiones por encima del límite delegado al management\n• Contratación o desvinculación de gerentes de primera línea\n• Ingreso a nuevos mercados o líneas de negocio\n• Contratos significativos o deudas financieras relevantes',
    responsable: 'CEO + Directorio',
    duracionMinutos: 30,
    obligatorio: false,
  },
  {
    tipo: 'temas_operativos',
    titulo: 'Temas operativos y funcionales',
    descripcion: 'Temas de gestión que requieren información o validación del directorio:\n• Actualizaciones de RRHH, producción, comercial\n• Indicadores clave de desempeño (KPIs) operativos\n• Problemas de clientes, proveedores o procesos internos relevantes',
    responsable: 'Gerencias funcionales / CEO',
    duracionMinutos: 20,
    obligatorio: false,
  },
  {
    tipo: 'compliance',
    titulo: 'Compliance, legal y regulatorio',
    descripcion: 'Actualización sobre:\n• Obligaciones ante AFIP, ARCA, IGJ, UIF, CNV u otros organismos\n• Juicios y contingencias legales relevantes\n• Cambios normativos que afecten al negocio\n• Estado de auditorías internas o externas en curso\n• Cumplimiento de compromisos contractuales clave',
    responsable: 'Asesor legal / CFO',
    duracionMinutos: 15,
    obligatorio: false,
  },
  {
    tipo: 'riesgos',
    titulo: 'Gestión de riesgos',
    descripcion: 'Revisión del mapa de riesgos de la empresa:\n• Riesgos nuevos identificados en el período\n• Estado de los planes de mitigación existentes\n• Riesgos financieros: tipo de cambio, tasa, liquidez\n• Riesgos operativos: personas clave, procesos críticos\n• Riesgos reputacionales o de mercado',
    responsable: 'CEO / CFO',
    duracionMinutos: 15,
    obligatorio: false,
  },
  {
    tipo: 'rrhh_ceo',
    titulo: 'Capital humano y evaluación del CEO',
    descripcion: 'Temas de personas en la agenda del directorio:\n• Avance del plan de sucesión y talentos críticos\n• Clima organizacional y retención de personas clave\n• Remuneraciones del equipo gerencial (revisión anual)\n• En reuniones designadas: evaluación formal del desempeño del CEO',
    responsable: 'Presidente del directorio',
    duracionMinutos: 20,
    obligatorio: false,
  },
  {
    tipo: 'proxima_reunion',
    titulo: 'Tareas y compromisos del período',
    descripcion: 'Consolidación de las decisiones y tareas surgidas en la reunión:\n• Listado de tareas con responsable y fecha de vencimiento\n• Seguimiento de tareas de reuniones anteriores aún abiertas\n• Compromisos del directorio hacia el management',
    responsable: 'Secretario del directorio',
    duracionMinutos: 10,
    obligatorio: true,
  },
  {
    tipo: 'proxima_reunion',
    titulo: 'Próxima reunión y orden del día tentativo',
    descripcion: 'Se confirma la fecha, hora y lugar de la próxima reunión. Se dejan sentadas las prioridades y temas que deberán prepararse con antelación.',
    responsable: 'Presidente del directorio',
    duracionMinutos: 5,
    obligatorio: true,
  },
  {
    tipo: 'cierre',
    titulo: 'Cierre formal de la sesión',
    descripcion: 'El presidente declara cerrada la sesión. Se instruye al secretario a redactar el acta en el plazo acordado (generalmente 5 días hábiles) para circulación y aprobación.',
    responsable: 'Presidente del directorio',
    duracionMinutos: 5,
    obligatorio: true,
  },
];

// ——— Tipos de ítems con metadata ———————————————————————————————————————————

export const TIPO_ITEM_META: Record<TipoReunionItem, { label: string; color: string; bg: string }> = {
  apertura: { label: 'Apertura', color: '#5F5E5A', bg: '#F1EFE8' },
  quorum: { label: 'Quórum', color: '#5F5E5A', bg: '#F1EFE8' },
  aprobacion_acta_anterior: { label: 'Acta anterior', color: '#5F5E5A', bg: '#F1EFE8' },
  informe_presidente: { label: 'Informe CEO', color: '#3C3489', bg: '#EEEDFE' },
  informe_financiero: { label: 'Informe financiero', color: '#3C3489', bg: '#EEEDFE' },
  temas_estrategicos: { label: 'Estrategia', color: '#085041', bg: '#E1F5EE' },
  temas_operativos: { label: 'Operaciones', color: '#085041', bg: '#E1F5EE' },
  compliance: { label: 'Compliance', color: '#633806', bg: '#FAEEDA' },
  riesgos: { label: 'Riesgos', color: '#633806', bg: '#FAEEDA' },
  rrhh_ceo: { label: 'RRHH / CEO', color: '#3C3489', bg: '#EEEDFE' },
  proxima_reunion: { label: 'Compromisos', color: '#185FA5', bg: '#E6F1FB' },
  cierre: { label: 'Cierre', color: '#5F5E5A', bg: '#F1EFE8' },
  tema_libre: { label: 'Tema libre', color: '#888780', bg: '#F1EFE8' },
};

// ——— Generación de ID único ———————————————————————————————————————————————

export function generarId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ——— Crear reunión desde plantilla ————————————————————————————————————————

export function crearReunionDesdePlantilla(
  numero: number,
  fecha: string,
  hora: string,
  lugar: string,
  modalidad: Reunion['modalidad'],
  tipo: Reunion['tipo'],
  incluirOpcionales: boolean = false,
): Reunion {
  const items = PLANTILLA_ITEMS_REUNION
    .filter(item => item.obligatorio || incluirOpcionales)
    .map(item => ({
      ...item,
      id: generarId(),
      completado: false,
      notas: '',
      adjuntos: [] as string[],
      decisiones: [] as string[],
      tareas: [] as import('../types/fase2').TareaReunion[],
    }));

  return {
    id: generarId(),
    numero,
    fecha,
    hora,
    lugar,
    modalidad,
    tipo,
    estado: 'planificada',
    convocante: '',
    asistentes: [],
    orden: items,
    quorumAlcanzado: false,
    observacionesGenerales: '',
  };
}

// ——— Calcular duración estimada ——————————————————————————————————————————

export function calcularDuracionEstimada(orden: ItemReunion[]): number {
  return orden.reduce((total, item) => total + item.duracionMinutos, 0);
}

// ——— Generar texto del acta de reunión ———————————————————————————————————

export function generarActaReunion(reunion: Reunion, empresaNombre: string): string {
  const fecha = new Date(reunion.fecha).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const presentes = reunion.asistentes.filter(a => a.presente);
  const ausentes = reunion.asistentes.filter(a => !a.presente);

  const todasLasTareas = reunion.orden.flatMap(item => item.tareas);

  const itemsConDecisiones = reunion.orden.filter(
    item => item.decisiones.length > 0 || item.notas.trim()
  );

  return `ACTA DE REUNIÓN DE DIRECTORIO N° ${reunion.numero}
${empresaNombre.toUpperCase()}

Fecha: ${fecha}
Hora de inicio: ${reunion.hora} hs.
Lugar: ${reunion.lugar} (${reunion.modalidad})
Tipo: Reunión ${reunion.tipo}

———————————————————————————————————————
ASISTENTES
———————————————————————————————————————
Presentes (${presentes.length}):
${presentes.map(a => `  • ${a.nombre} — ${a.cargo}`).join('\n')}
${ausentes.length > 0 ? `\nAusentes (${ausentes.length}):\n${ausentes.map(a => `  • ${a.nombre} — ${a.cargo}${a.excusa ? ` (excusa: ${a.excusa})` : ''}`).join('\n')}` : ''}

Quórum: ${reunion.quorumAlcanzado ? 'ALCANZADO' : 'NO ALCANZADO'}

———————————————————————————————————————
ORDEN DEL DÍA Y DELIBERACIONES
———————————————————————————————————————
${itemsConDecisiones.map((item, i) => `
${i + 1}. ${item.titulo.toUpperCase()}
${item.notas ? `   ${item.notas}` : ''}
${item.decisiones.length > 0 ? `\n   DECISIONES ADOPTADAS:\n${item.decisiones.map(d => `   → ${d}`).join('\n')}` : ''}
`).join('\n')}

———————————————————————————————————————
TAREAS Y COMPROMISOS
———————————————————————————————————————
${todasLasTareas.length > 0
  ? todasLasTareas.map(t => `  • ${t.descripcion}\n    Responsable: ${t.responsable} | Vencimiento: ${t.fechaVencimiento}`).join('\n')
  : '  Sin tareas asignadas en esta reunión.'}

———————————————————————————————————————
PRÓXIMA REUNIÓN
———————————————————————————————————————
${reunion.fechaProximaReunion ? `Fecha estimada: ${new Date(reunion.fechaProximaReunion).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` : 'A confirmar.'}

${reunion.observacionesGenerales ? `OBSERVACIONES GENERALES\n${reunion.observacionesGenerales}\n` : ''}

Siendo las _____ hs., el Presidente declara cerrada la sesión.

Firmas:

_________________________          _________________________
Presidente del Directorio           Secretario del Directorio
`;
}

// ——— Estadísticas de reuniones ———————————————————————————————————————————

export function calcularEstadisticasReuniones(reuniones: Reunion[]): ReunionResultado {
  const tareasAbiertas: TareaReunion[] = reuniones
    .flatMap(r => r.orden.flatMap(i => i.tareas))
    .filter(t => !t.completada);

  const reunionesConAsistentes = reuniones.filter(r => r.asistentes.length > 0);
  const asistenciaPromedio = reunionesConAsistentes.length === 0 ? 0 : Math.round(
    reunionesConAsistentes.reduce((sum, r) => {
      const pct = r.asistentes.filter(a => a.presente).length / r.asistentes.length * 100;
      return sum + pct;
    }, 0) / reunionesConAsistentes.length
  );

  return {
    reuniones,
    totalReuniones: reuniones.length,
    tareasAbiertas,
    asistenciaPromedio,
  };
}
