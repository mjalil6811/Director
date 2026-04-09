import type { TareaGestion, EstadoTarea, SeguimientoResultado } from '../../types/fase3';

export function generarId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function calcularEstado(tarea: TareaGestion): EstadoTarea {
  if (tarea.estado === 'completada') return 'completada';
  if (!tarea.fechaVencimiento) return tarea.estado;
  const hoy = new Date();
  const vence = new Date(tarea.fechaVencimiento);
  if (vence < hoy) return 'vencida';
  return tarea.estado;
}

export const ESTADO_META: Record<EstadoTarea, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: '#185FA5', bg: '#E6F1FB' },
  en_curso: { label: 'En curso', color: '#085041', bg: '#E1F5EE' },
  completada: { label: 'Completada', color: '#3B6D11', bg: '#EAF3DE' },
  vencida: { label: 'Vencida', color: '#A32D2D', bg: '#FCEBEB' },
};

export const PRIORIDAD_META = {
  alta: { label: 'Alta', color: '#A32D2D', bg: '#FCEBEB' },
  media: { label: 'Media', color: '#633806', bg: '#FAEEDA' },
  baja: { label: 'Baja', color: '#5F5E5A', bg: '#F1EFE8' },
};

export function importarTareasDeReuniones(reuniones: { id: string; numero: number; orden: { tareas: { id: string; descripcion: string; responsable: string; fechaVencimiento: string; completada: boolean }[] }[] }[]): TareaGestion[] {
  const tareas: TareaGestion[] = [];
  for (const reunion of reuniones) {
    for (const item of reunion.orden) {
      for (const t of item.tareas) {
        if (t.descripcion.trim()) {
          tareas.push({
            id: t.id,
            descripcion: t.descripcion,
            responsable: t.responsable,
            fechaVencimiento: t.fechaVencimiento,
            prioridad: 'media',
            estado: t.completada ? 'completada' : 'pendiente',
            origenReunionId: reunion.id,
            origenReunionNumero: reunion.numero,
            notas: '',
            etiquetas: [],
          });
        }
      }
    }
  }
  return tareas;
}

export function calcularEstadisticas(tareas: TareaGestion[]): SeguimientoResultado {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const tareasConEstado = tareas.map(t => ({ ...t, estado: calcularEstado(t) }));
  const completadas = tareasConEstado.filter(t => t.estado === 'completada');
  const vencidas = tareasConEstado.filter(t => t.estado === 'vencida');
  const abiertas = tareasConEstado.filter(t => t.estado === 'pendiente' || t.estado === 'en_curso');
  const completadasEsteMes = completadas.filter(t => t.fechaCompletada && new Date(t.fechaCompletada) >= inicioMes).length;
  const cumplimiento = tareas.length > 0 ? Math.round(completadas.length / tareas.length * 100) : 0;
  return { tareas: tareasConEstado, cumplimientoPorcentaje: cumplimiento, tareasVencidas: vencidas.length, tareasAbiertas: abiertas.length, completadasEsteMes };
}

export function diasHastaVencimiento(fecha: string): number {
  if (!fecha) return 999;
  const hoy = new Date();
  const vence = new Date(fecha);
  return Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

export function labelDias(dias: number): { texto: string; color: string } {
  if (dias < 0) return { texto: `Venció hace ${Math.abs(dias)} días`, color: '#A32D2D' };
  if (dias === 0) return { texto: 'Vence hoy', color: '#854F0B' };
  if (dias <= 3) return { texto: `Vence en ${dias} días`, color: '#854F0B' };
  if (dias <= 7) return { texto: `Vence en ${dias} días`, color: '#633806' };
  return { texto: new Date(dias * 86400000 + Date.now()).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }), color: '#5F5E5A' };
}
