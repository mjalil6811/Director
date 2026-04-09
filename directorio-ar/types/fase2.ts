// ——— Fase 2: Constitución del Directorio ————————————————————————————————————

// —— M6: Acta Constitutiva ——————————————————————————————————————————————————

export interface DatosEmpresa {
  razonSocial: string;
  cuit: string;
  domicilioLegal: string;
  tipoSociedad: 'SRL' | 'SA' | 'SAS' | 'Otro';
  capitalSocial: string;
  objetoSocial: string;
}

export interface DirectorActa {
  nombre: string;
  dni: string;
  cargo: 'Presidente' | 'Vicepresidente' | 'Secretario' | 'Tesorero' | 'Director Titular' | 'Director Suplente' | 'Director Independiente';
  duracionMandato: 1 | 2 | 3;
  esIndependiente: boolean;
}

export interface ActaConstitutiva {
  empresa: DatosEmpresa;
  directores: DirectorActa[];
  frecuenciaReuniones: 'mensual' | 'bimestral' | 'trimestral';
  quorum: number;
  mayoriaDecisiones: 'simple' | 'calificada_2_3' | 'unanimidad';
  fechaConstitucion: string;
  lugarConstitucion: string;
  observaciones: string;
}

// —— M7: Protocolo de Familia / Socios ——————————————————————————————————————

export type TipoProtocolo = 'familia' | 'socios' | 'mixto';

export interface ClausulaProtocolo {
  id: string;
  categoria: CategoriaProtocolo;
  titulo: string;
  descripcion: string;
  seleccionada: boolean;
  valorPersonalizado?: string;
}

export type CategoriaProtocolo =
  | 'ingreso_egreso'
  | 'transferencia_acciones'
  | 'conflictos'
  | 'sucesion'
  | 'dividendos'
  | 'remuneraciones'
  | 'gobierno';

export interface ProtocoloResultado {
  tipo: TipoProtocolo;
  clausulasSeleccionadas: ClausulaProtocolo[];
  completitudPorcentaje: number;
  areasConBrechas: CategoriaProtocolo[];
}

// —— M8: Reuniones del Directorio ———————————————————————————————————————————

export type EstadoReunion = 'planificada' | 'en_curso' | 'finalizada' | 'cancelada';
export type TipoReunionItem =
  | 'apertura'
  | 'quorum'
  | 'aprobacion_acta_anterior'
  | 'informe_presidente'
  | 'informe_financiero'
  | 'temas_estrategicos'
  | 'temas_operativos'
  | 'compliance'
  | 'riesgos'
  | 'rrhh_ceo'
  | 'proxima_reunion'
  | 'cierre'
  | 'tema_libre';

export interface ItemReunion {
  id: string;
  tipo: TipoReunionItem;
  titulo: string;
  descripcion: string;
  responsable: string;
  duracionMinutos: number;
  obligatorio: boolean;
  completado: boolean;
  notas: string;
  adjuntos: string[];
  decisiones: string[];
  tareas: TareaReunion[];
}

export interface TareaReunion {
  id: string;
  descripcion: string;
  responsable: string;
  fechaVencimiento: string;
  completada: boolean;
}

export interface Reunion {
  id: string;
  numero: number;
  fecha: string;
  hora: string;
  lugar: string;
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  tipo: 'ordinaria' | 'extraordinaria';
  estado: EstadoReunion;
  convocante: string;
  asistentes: AsistenteReunion[];
  orden: ItemReunion[];
  quorumAlcanzado: boolean;
  duracionReal?: number;
  observacionesGenerales: string;
  fechaProximaReunion?: string;
}

export interface AsistenteReunion {
  nombre: string;
  cargo: string;
  presente: boolean;
  excusa?: string;
}

export interface ReunionResultado {
  reuniones: Reunion[];
  totalReuniones: number;
  tareasAbiertas: TareaReunion[];
  asistenciaPromedio: number;
}

// —— M9: Búsqueda y Onboarding de Directores ———————————————————————————————

export type EstadoCandidato = 'prospecto' | 'contactado' | 'entrevistado' | 'seleccionado' | 'descartado';

export interface CandidatoDirector {
  id: string;
  nombre: string;
  perfil: 'estratega' | 'financiero' | 'comercial' | 'operaciones' | 'legal' | 'sector' | 'digital';
  linkedin?: string;
  experienciaSectorial: string[];
  disponibilidad: string;
  honorariosExpectativa: string;
  estado: EstadoCandidato;
  notas: string;
  fechaContacto?: string;
  puntuacion: number;
}

export interface ChecklistOnboarding {
  id: string;
  categoria: 'legal' | 'informacion' | 'relaciones' | 'operativo';
  tarea: string;
  responsable: 'empresa' | 'director';
  completada: boolean;
  fechaLimite?: string;
}

export interface BusquedaDirectoresResultado {
  candidatos: CandidatoDirector[];
  checklistOnboarding: ChecklistOnboarding[];
  perfilesCompletos: number;
  perfilesFaltantes: string[];
}

// —— Votación ———————————————————————————————————————————————————————————————

export type TipoVoto = 'a_favor' | 'en_contra' | 'abstencion' | 'ausente';
export type EstadoVotacion = 'pendiente' | 'abierta' | 'cerrada';
export type TipoMayoria = 'simple' | 'calificada_2_3' | 'unanimidad';

export interface VotoDirector {
  directorNombre: string;
  voto: TipoVoto;
  comentario?: string;
  fechaHora: string;
}

export interface Votacion {
  id: string;
  reunionId: string;
  itemReunionId?: string;
  titulo: string;
  descripcion: string;
  tipoMayoria: TipoMayoria;
  estado: EstadoVotacion;
  votos: VotoDirector[];
  resultado?: ResultadoVotacion;
  fechaApertura?: string;
  fechaCierre?: string;
  requiereQuorum: boolean;
  quorumMinimo: number;
}

export interface ResultadoVotacion {
  aprobada: boolean;
  aFavor: number;
  enContra: number;
  abstenciones: number;
  ausentes: number;
  totalVotantes: number;
  porcentajeAFavor: number;
  quorumAlcanzado: boolean;
  resumen: string;
}
