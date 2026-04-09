import type { ItemReunion, TipoReunionItem, Reunion, TareaReunion, ReunionResultado } from '../../types/fase2';

export const PLANTILLA_ITEMS: Omit<ItemReunion, 'id' | 'completado' | 'notas' | 'adjuntos' | 'decisiones' | 'tareas'>[] = [
  { tipo: 'apertura', titulo: 'Apertura y convocatoria', descripcion: 'El presidente declara abierta la sesión y confirma que la convocatoria fue cursada en tiempo y forma.', responsable: 'Presidente', duracionMinutos: 5, obligatorio: true },
  { tipo: 'quorum', titulo: 'Verificación de quórum', descripcion: 'Se registra asistencia y se confirma quórum mínimo. Se deja constancia de ausentes y excusas.', responsable: 'Secretario', duracionMinutos: 5, obligatorio: true },
  { tipo: 'aprobacion_acta_anterior', titulo: 'Aprobación del acta anterior', descripcion: 'Lectura, correcciones si corresponde, y aprobación formal del acta de la reunión anterior.', responsable: 'Secretario', duracionMinutos: 10, obligatorio: true },
  { tipo: 'informe_presidente', titulo: 'Informe del CEO', descripcion: 'Estado general: avances del plan estratégico, eventos relevantes, alertas y oportunidades del período.', responsable: 'CEO', duracionMinutos: 20, obligatorio: true },
  { tipo: 'informe_financiero', titulo: 'Informe financiero', descripcion: 'Resultados vs. presupuesto · Posición de caja · KPIs: ventas, margen, EBITDA · Desvíos relevantes.', responsable: 'CFO / Administración', duracionMinutos: 25, obligatorio: true },
  { tipo: 'temas_estrategicos', titulo: 'Seguimiento estratégico', descripcion: 'Avance de iniciativas del plan · Hitos cumplidos · Iniciativas demoradas y causas · Ajustes al plan.', responsable: 'CEO + Directorio', duracionMinutos: 30, obligatorio: false },
  { tipo: 'temas_estrategicos', titulo: 'Decisiones a aprobar', descripcion: 'Inversiones por encima del límite delegado · Contrataciones gerenciales · Nuevos mercados · Contratos significativos.', responsable: 'CEO + Directorio', duracionMinutos: 30, obligatorio: false },
  { tipo: 'temas_operativos', titulo: 'Temas operativos', descripcion: 'Actualizaciones de RRHH, comercial, operaciones · KPIs operativos · Problemas que requieren input del directorio.', responsable: 'Gerencias / CEO', duracionMinutos: 20, obligatorio: false },
  { tipo: 'compliance', titulo: 'Compliance y legal', descripcion: 'AFIP / UIF / IGJ · Juicios y contingencias · Cambios normativos · Estado de auditorías.', responsable: 'Asesor legal / CFO', duracionMinutos: 15, obligatorio: false },
  { tipo: 'riesgos', titulo: 'Gestión de riesgos', descripcion: 'Riesgos nuevos · Planes de mitigación · Riesgos financieros: tipo de cambio, liquidez · Riesgos de personas clave.', responsable: 'CEO / CFO', duracionMinutos: 15, obligatorio: false },
  { tipo: 'rrhh_ceo', titulo: 'Capital humano', descripcion: 'Talentos críticos · Clima y retención · Remuneraciones gerenciales · Evaluación del CEO (en reuniones designadas).', responsable: 'Presidente', duracionMinutos: 20, obligatorio: false },
  { tipo: 'proxima_reunion', titulo: 'Tareas y compromisos', descripcion: 'Lista de tareas con responsable y fecha · Seguimiento de compromisos anteriores abiertos.', responsable: 'Secretario', duracionMinutos: 10, obligatorio: true },
  { tipo: 'proxima_reunion', titulo: 'Próxima reunión', descripcion: 'Confirmar fecha, hora y lugar · Temas a preparar para la próxima sesión.', responsable: 'Presidente', duracionMinutos: 5, obligatorio: true },
  { tipo: 'cierre', titulo: 'Cierre formal', descripcion: 'El presidente declara cerrada la sesión. Secretario redacta el acta en los próximos 5 días hábiles.', responsable: 'Presidente', duracionMinutos: 5, obligatorio: true },
];

export const TIPO_ITEM_META: Record<TipoReunionItem, { label: string; color: string; bg: string }> = {
  apertura: { label: 'Apertura', color: '#5F5E5A', bg: '#F1EFE8' },
  quorum: { label: 'Quórum', color: '#5F5E5A', bg: '#F1EFE8' },
  aprobacion_acta_anterior: { label: 'Acta anterior', color: '#5F5E5A', bg: '#F1EFE8' },
  informe_presidente: { label: 'Informe CEO', color: '#3C3489', bg: '#EEEDFE' },
  informe_financiero: { label: 'Financiero', color: '#3C3489', bg: '#EEEDFE' },
  temas_estrategicos: { label: 'Estrategia', color: '#085041', bg: '#E1F5EE' },
  temas_operativos: { label: 'Operaciones', color: '#085041', bg: '#E1F5EE' },
  compliance: { label: 'Compliance', color: '#633806', bg: '#FAEEDA' },
  riesgos: { label: 'Riesgos', color: '#633806', bg: '#FAEEDA' },
  rrhh_ceo: { label: 'RRHH / CEO', color: '#3C3489', bg: '#EEEDFE' },
  proxima_reunion: { label: 'Compromisos', color: '#185FA5', bg: '#E6F1FB' },
  cierre: { label: 'Cierre', color: '#5F5E5A', bg: '#F1EFE8' },
  tema_libre: { label: 'Tema libre', color: '#888780', bg: '#F1EFE8' },
};

export function generarId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function crearReunion(
  numero: number, fecha: string, hora: string, lugar: string,
  modalidad: Reunion['modalidad'], tipo: Reunion['tipo'],
  soloObligatorios = false,
): Reunion {
  const orden = PLANTILLA_ITEMS
    .filter(i => !soloObligatorios || i.obligatorio)
    .map(i => ({ ...i, id: generarId(), completado: false, notas: '', adjuntos: [] as string[], decisiones: [] as string[], tareas: [] as TareaReunion[] }));
  return {
    id: generarId(), numero, fecha, hora, lugar, modalidad, tipo,
    estado: 'planificada', convocante: '', asistentes: [],
    orden, quorumAlcanzado: false, observacionesGenerales: '',
  };
}

export function calcularDuracion(orden: ItemReunion[]): number {
  return orden.reduce((s, i) => s + i.duracionMinutos, 0);
}

export function generarActa(reunion: Reunion, empresa: string): string {
  const fecha = new Date(reunion.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const presentes = reunion.asistentes.filter(a => a.presente);
  const tareas = reunion.orden.flatMap(i => i.tareas);
  const decisiones = reunion.orden.filter(i => i.decisiones.length > 0 || i.notas.trim());
  return `ACTA DE REUNIÓN N° ${reunion.numero} — ${empresa.toUpperCase()}
Fecha: ${fecha} · ${reunion.hora} hs. · ${reunion.lugar} (${reunion.modalidad})
Quórum: ${reunion.quorumAlcanzado ? 'Alcanzado' : 'No alcanzado'}

PRESENTES (${presentes.length})
${presentes.map(a => `• ${a.nombre} — ${a.cargo}`).join('\n') || 'Sin registro'}

DELIBERACIONES
${decisiones.map((item, i) => `\n${i + 1}. ${item.titulo}\n${item.notas ? `   ${item.notas}` : ''}${item.decisiones.length > 0 ? '\n   DECISIONES:\n' + item.decisiones.map(d => `   → ${d}`).join('\n') : ''}`).join('\n') || 'Sin notas registradas'}

TAREAS Y COMPROMISOS (${tareas.length})
${tareas.map(t => `• ${t.descripcion} | ${t.responsable} | ${t.fechaVencimiento}`).join('\n') || 'Sin tareas asignadas'}

PRÓXIMA REUNIÓN: ${reunion.fechaProximaReunion ? new Date(reunion.fechaProximaReunion).toLocaleDateString('es-AR') : 'A confirmar'}
${reunion.observacionesGenerales ? `\nOBSERVACIONES:\n${reunion.observacionesGenerales}` : ''}

_________________________          _________________________
Presidente                          Secretario
`;
}

export function calcularStats(reuniones: Reunion[]): ReunionResultado {
  const tareasAbiertas = reuniones.flatMap(r => r.orden.flatMap(i => i.tareas)).filter(t => !t.completada);
  const conAsistentes = reuniones.filter(r => r.asistentes.length > 0);
  const asistenciaPromedio = conAsistentes.length === 0 ? 0 : Math.round(
    conAsistentes.reduce((s, r) => s + r.asistentes.filter(a => a.presente).length / r.asistentes.length * 100, 0) / conAsistentes.length
  );
  return { reuniones, totalReuniones: reuniones.length, tareasAbiertas, asistenciaPromedio };
}
