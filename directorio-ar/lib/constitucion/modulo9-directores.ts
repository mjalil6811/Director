import type { CandidatoDirector, ChecklistOnboarding, BusquedaDirectoresResultado } from '../../types/fase2';

// ——— Checklist de onboarding ————————————————————————————————————————————————

export const CHECKLIST_ONBOARDING: Omit<ChecklistOnboarding, 'id' | 'completada'>[] = [
  // Legal
  { categoria: 'legal', tarea: 'Carta de designación formal firmada', responsable: 'empresa' },
  { categoria: 'legal', tarea: 'Inscripción en el Registro Público de Comercio (si aplica)', responsable: 'empresa' },
  { categoria: 'legal', tarea: 'Firma del reglamento interno del directorio', responsable: 'director' },
  { categoria: 'legal', tarea: 'Acuerdo de confidencialidad (NDA) firmado', responsable: 'director' },
  { categoria: 'legal', tarea: 'Declaración jurada de ausencia de incompatibilidades', responsable: 'director' },
  { categoria: 'legal', tarea: 'Seguro de responsabilidad civil de directores (D&O)', responsable: 'empresa' },
  // Información
  { categoria: 'informacion', tarea: 'Entrega del dossier de la empresa (historia, estrategia, organigrama)', responsable: 'empresa' },
  { categoria: 'informacion', tarea: 'Acceso a estados financieros de los últimos 3 años', responsable: 'empresa' },
  { categoria: 'informacion', tarea: 'Entrega del plan estratégico y presupuesto vigente', responsable: 'empresa' },
  { categoria: 'informacion', tarea: 'Revisión de actas de reuniones anteriores (últimos 12 meses)', responsable: 'director' },
  { categoria: 'informacion', tarea: 'Revisión del protocolo de familia o acuerdo de socios', responsable: 'director' },
  { categoria: 'informacion', tarea: 'Briefing sobre contingencias legales o financieras relevantes', responsable: 'empresa' },
  // Relaciones
  { categoria: 'relaciones', tarea: 'Reunión de presentación con el CEO y equipo gerencial', responsable: 'empresa' },
  { categoria: 'relaciones', tarea: 'Reunión individual con cada director del board', responsable: 'director' },
  { categoria: 'relaciones', tarea: 'Recorrida por las instalaciones / operación de la empresa', responsable: 'empresa' },
  { categoria: 'relaciones', tarea: 'Reunión con el asesor legal y el contador externo', responsable: 'empresa' },
  // Operativo
  { categoria: 'operativo', tarea: 'Acceso al portal / herramienta de gestión del directorio', responsable: 'empresa' },
  { categoria: 'operativo', tarea: 'Incorporación al calendario de reuniones del año', responsable: 'empresa' },
  { categoria: 'operativo', tarea: 'Acuerdo sobre canales de comunicación y frecuencia de reportes', responsable: 'director' },
  { categoria: 'operativo', tarea: 'Definición de comités en los que participará', responsable: 'empresa' },
];

// ——— Categorías del checklist ——————————————————————————————————————————————

export const CATEGORIA_META: Record<ChecklistOnboarding['categoria'], { label: string; descripcion: string }> = {
  legal: {
    label: 'Legal y formal',
    descripcion: 'Documentación y registros formales de la designación.',
  },
  informacion: {
    label: 'Paquete de información',
    descripcion: 'Todo lo que el director necesita saber sobre la empresa.',
  },
  relaciones: {
    label: 'Relaciones y presentaciones',
    descripcion: 'Reuniones clave para integrar al director al equipo.',
  },
  operativo: {
    label: 'Operativo y logístico',
    descripcion: 'Accesos, herramientas y calendario.',
  },
};

// ——— Perfiles con descripción expandida ——————————————————————————————————

export const PERFILES_DESCRIPCION: Record<CandidatoDirector['perfil'], { label: string; descripcion: string; buscarEn: string[] }> = {
  estratega: {
    label: 'Estratega de negocio',
    descripcion: 'Ex CEO o director de empresas de industria similar o complementaria. Aporta visión de mercado, experiencia en decisiones complejas y red de contactos.',
    buscarEn: ['Cámaras industriales', 'Redes de ex CEOs', 'IDEA', 'IAE alumni'],
  },
  financiero: {
    label: 'Director financiero / CFO',
    descripcion: 'Experto en finanzas corporativas, M&A o banca. Puede leer los números con rigor, estructurar financiamiento y dialogar con bancos e inversores.',
    buscarEn: ['IAEF', 'CPC Argentina', 'Redes de CFOs', 'Fondos de PE'],
  },
  comercial: {
    label: 'Director comercial / marketing',
    descripcion: 'Experiencia en crecimiento de ingresos, posicionamiento de marca y canales de distribución. Complementa al equipo cuando el negocio necesita escalar ventas.',
    buscarEn: ['AAM', 'Cámaras de comercio', 'Redes de gerentes comerciales'],
  },
  operaciones: {
    label: 'Director de operaciones',
    descripcion: 'Experto en escalar procesos, estructurar organizaciones y mejorar eficiencia operativa. Clave cuando la empresa crece en complejidad operativa.',
    buscarEn: ['IAPCO', 'Redes de COOs', 'Consultoras de supply chain'],
  },
  legal: {
    label: 'Director legal / compliance',
    descripcion: 'Abogado o experto en cumplimiento normativo, contratos y gobierno corporativo. Fundamental cuando la empresa tiene exposición regulatoria relevante.',
    buscarEn: ['Colegios de abogados', 'CAF', 'Firmas legales especializadas'],
  },
  sector: {
    label: 'Experto sectorial',
    descripcion: 'Conocimiento profundo del sector de la empresa: agro, tech, retail, salud, etc. Aporta contexto específico del mercado y relaciones con actores clave.',
    buscarEn: ['Cámaras sectoriales', 'Asociaciones profesionales', 'Redes del sector'],
  },
  digital: {
    label: 'Director digital / tecnología',
    descripcion: 'Experiencia en transformación digital, tecnología aplicada al negocio y ciberseguridad. Clave en empresas en proceso de digitalización.',
    buscarEn: ['CESSI', 'Comunidades tech', 'Redes de CTOs y CDOs'],
  },
};

// ——— Cálculo de completitud del board ——————————————————————————————————————

export function calcularEstadoBusqueda(
  candidatos: CandidatoDirector[],
  perfilesNecesarios: CandidatoDirector['perfil'][],
  checklist: ChecklistOnboarding[],
): BusquedaDirectoresResultado {
  const seleccionados = candidatos.filter(c => c.estado === 'seleccionado');
  const perfilesCompletos = new Set(seleccionados.map(c => c.perfil)).size;
  const perfilesFaltantes = perfilesNecesarios
    .filter(p => !seleccionados.some(s => s.perfil === p))
    .map(p => PERFILES_DESCRIPCION[p].label);

  return {
    candidatos,
    checklistOnboarding: checklist,
    perfilesCompletos,
    perfilesFaltantes,
  };
}

// ——— ID único ——————————————————————————————————————————————————————————————

export function generarId(): string {
  return Math.random().toString(36).slice(2, 10);
}
