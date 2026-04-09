// ——— Fase 3: Gestión ————————————————————————————————————————————————————————

// —— M10: Dashboard financiero ——————————————————————————————————————————————

export type PeriodoFinanciero = {
  id: string;
  mes: number;
  anio: number;
  ventas: number;
  costoVentas: number;
  gastosOperativos: number;
  ebitda: number;
  resultadoNeto: number;
  caja: number;
  deudaFinanciera: number;
  cuentasCobrar: number;
  cuentasPagar: number;
  notasDirectorio: string;
};

export type PresupuestoAnual = {
  anio: number;
  ventas: number;
  ebitda: number;
  resultadoNeto: number;
  inversionCapex: number;
};

export type AlertaFinanciera = {
  id: string;
  tipo: 'desvio' | 'liquidez' | 'deuda' | 'margen' | 'cobranza';
  severidad: 'info' | 'advertencia' | 'critica';
  titulo: string;
  descripcion: string;
  fecha: string;
  resuelta: boolean;
};

export type DashboardFinancieroResultado = {
  periodos: PeriodoFinanciero[];
  presupuesto: PresupuestoAnual | null;
  alertas: AlertaFinanciera[];
};

// —— M11: Seguimiento entre reuniones ———————————————————————————————————————

export type EstadoTarea = 'pendiente' | 'en_curso' | 'completada' | 'vencida';
export type PrioridadTarea = 'alta' | 'media' | 'baja';

export type TareaGestion = {
  id: string;
  descripcion: string;
  responsable: string;
  fechaVencimiento: string;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  origenReunionId?: string;
  origenReunionNumero?: number;
  fechaCompletada?: string;
  notas: string;
  etiquetas: string[];
};

export type SeguimientoResultado = {
  tareas: TareaGestion[];
  cumplimientoPorcentaje: number;
  tareasVencidas: number;
  tareasAbiertas: number;
  completadasEsteMes: number;
};

// —— M12: Evaluación del CEO ———————————————————————————————————————————————

export type DimensionEvaluacion = {
  id: string;
  nombre: string;
  descripcion: string;
  preguntas: PreguntaEvaluacion[];
};

export type PreguntaEvaluacion = {
  id: string;
  texto: string;
  tipo: 'escala' | 'texto' | 'si_no';
};

export type RespuestaEvaluacion = {
  preguntaId: string;
  valor: number | string | boolean;
};

export type EvaluacionDirector = {
  id: string;
  directorNombre: string;
  respuestas: RespuestaEvaluacion[];
  comentarioGeneral: string;
  completada: boolean;
  fecha: string;
};

export type EvaluacionCEO = {
  id: string;
  anio: number;
  ceoNombre: string;
  evaluaciones: EvaluacionDirector[];
  scorePromedio: number;
  scoresPorDimension: { dimensionId: string; nombre: string; promedio: number }[];
  fortalezas: string[];
  areasDesarrollo: string[];
  estadoProcesoEval: 'no_iniciada' | 'en_curso' | 'finalizada';
  fechaInicio?: string;
  fechaCierre?: string;
};
