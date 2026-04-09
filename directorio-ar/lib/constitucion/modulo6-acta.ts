import type { ActaConstitutiva, DatosEmpresa, DirectorActa } from '../../types/fase2';

export type Opcion6 = { texto: string; valor: string; ayuda: string };

export const TIPOS_SOCIEDAD: Opcion6[] = [
  { texto: 'SRL', valor: 'SRL', ayuda: 'Sociedad de Responsabilidad Limitada. La más común en pymes. Los socios responden solo hasta el capital aportado.' },
  { texto: 'SA', valor: 'SA', ayuda: 'Sociedad Anónima. Requerida para acceder a mercado de capitales o tener más de 50 accionistas.' },
  { texto: 'SAS', valor: 'SAS', ayuda: 'Sociedad por Acciones Simplificada. Constitución rápida 100% digital. Ideal para startups y empresas jóvenes.' },
  { texto: 'Otro', valor: 'Otro', ayuda: 'Cooperativa, sociedad colectiva u otro tipo societario.' },
];

export const CARGOS_DIRECTOR: { cargo: DirectorActa['cargo']; ayuda: string }[] = [
  { cargo: 'Presidente', ayuda: 'Conduce las reuniones, representa al directorio y es la máxima autoridad del board.' },
  { cargo: 'Vicepresidente', ayuda: 'Reemplaza al Presidente en su ausencia. Recomendado en directorios de 3 o más miembros.' },
  { cargo: 'Secretario', ayuda: 'Redacta y guarda las actas, convoca a las reuniones y lleva el libro de actas.' },
  { cargo: 'Tesorero', ayuda: 'Supervisa las finanzas del directorio, firma cheques y controla el presupuesto.' },
  { cargo: 'Director Titular', ayuda: 'Miembro pleno con voz y voto en todas las decisiones.' },
  { cargo: 'Director Suplente', ayuda: 'Reemplaza a un titular en caso de ausencia o vacante. No tiene voto mientras el titular esté activo.' },
  { cargo: 'Director Independiente', ayuda: 'Sin vínculos con los socios ni la empresa. Aporta objetividad y es requerido por inversores y fondos.' },
];

export const FRECUENCIAS: Opcion6[] = [
  { texto: 'Mensual', valor: 'mensual', ayuda: 'Recomendado para empresas en crecimiento activo o con decisiones frecuentes. 12 reuniones al año.' },
  { texto: 'Bimestral', valor: 'bimestral', ayuda: 'Buen balance para empresas medianas con operación estable. 6 reuniones al año.' },
  { texto: 'Trimestral', valor: 'trimestral', ayuda: 'Para directorios en etapa inicial o empresas con ciclos de negocio largos. 4 reuniones al año.' },
];

export const QUORUMS: Opcion6[] = [
  { texto: '50% de los directores', valor: '50', ayuda: 'Mayoría simple. Fácil de alcanzar, ágil para decidir.' },
  { texto: '67% de los directores', valor: '67', ayuda: 'Dos tercios. Requiere consenso amplio. Recomendado para directorios con independientes.' },
  { texto: 'Todos los directores', valor: '100', ayuda: 'Unanimidad. Muy exigente, puede trabar decisiones si hay ausencias.' },
];

export const MAYORIAS: Opcion6[] = [
  { texto: 'Mayoría simple', valor: 'simple', ayuda: 'Más del 50% de los presentes. Ágil y estándar para la mayoría de las decisiones.' },
  { texto: 'Mayoría calificada (2/3)', valor: 'calificada_2_3', ayuda: 'Dos tercios de los presentes. Recomendado para decisiones estratégicas o irreversibles.' },
  { texto: 'Unanimidad', valor: 'unanimidad', ayuda: 'Todos de acuerdo. Solo para decisiones excepcionales como venta de la empresa o cambio de objeto social.' },
];

export const DIRECTOR_INICIAL: DirectorActa = {
  nombre: '',
  dni: '',
  cargo: 'Director Titular',
  duracionMandato: 2,
  esIndependiente: false,
};

export interface ValidacionPaso {
  valida: boolean;
  errores: string[];
  advertencias: string[];
}

export function validarPaso1(empresa: Partial<DatosEmpresa>): ValidacionPaso {
  const errores: string[] = [];
  if (!empresa.razonSocial?.trim()) errores.push('Razón social requerida.');
  if (!empresa.cuit?.trim()) errores.push('CUIT requerido.');
  if (!empresa.domicilioLegal?.trim()) errores.push('Domicilio legal requerido.');
  if (!empresa.objetoSocial?.trim()) errores.push('Objeto social requerido.');
  return { valida: errores.length === 0, errores, advertencias: [] };
}

export function validarPaso2(directores: DirectorActa[]): ValidacionPaso {
  const errores: string[] = [];
  const advertencias: string[] = [];
  if (directores.length === 0) { errores.push('Agregá al menos un director.'); return { valida: false, errores, advertencias }; }
  directores.forEach((d, i) => {
    if (!d.nombre.trim()) errores.push(`Director ${i + 1}: nombre requerido.`);
    if (!d.dni.trim()) errores.push(`Director ${i + 1}: DNI requerido.`);
  });
  if (!directores.some(d => d.cargo === 'Presidente')) advertencias.push('Recomendamos designar un Presidente.');
  if (directores.length >= 3 && !directores.some(d => d.esIndependiente)) advertencias.push('Con 3+ directores, un independiente mejora la gobernanza.');
  return { valida: errores.length === 0, errores, advertencias };
}

export function validarPaso3(config: Partial<ActaConstitutiva>): ValidacionPaso {
  const errores: string[] = [];
  if (!config.fechaConstitucion) errores.push('Fecha de constitución requerida.');
  if (!config.lugarConstitucion?.trim()) errores.push('Lugar de constitución requerido.');
  return { valida: errores.length === 0, errores, advertencias: [] };
}

export function generarTextoActa(acta: ActaConstitutiva): string {
  const fecha = new Date(acta.fechaConstitucion).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  const mayoriaTexto: Record<string, string> = {
    simple: 'mayoría simple (más del 50% de los presentes)',
    calificada_2_3: 'mayoría calificada de dos tercios (2/3)',
    unanimidad: 'unanimidad de los directores',
  };
  const frecuenciaTexto: Record<string, string> = {
    mensual: 'mensualmente', bimestral: 'cada dos meses', trimestral: 'trimestralmente',
  };
  return `ACTA DE CONSTITUCIÓN DEL DIRECTORIO
${acta.empresa.razonSocial.toUpperCase()}

En ${acta.lugarConstitucion}, a los ${fecha}, se constituye formalmente el Directorio de ${acta.empresa.razonSocial} (CUIT: ${acta.empresa.cuit}), con domicilio en ${acta.empresa.domicilioLegal}.

I. DATOS DE LA SOCIEDAD
Tipo: ${acta.empresa.tipoSociedad} · Capital: ${acta.empresa.capitalSocial}
Objeto: ${acta.empresa.objetoSocial}

II. DIRECTORES DESIGNADOS
${acta.directores.map(d => `• ${d.nombre} (DNI: ${d.dni}) — ${d.cargo}, mandato ${d.duracionMandato} año(s)${d.esIndependiente ? ', independiente' : ''}`).join('\n')}

III. FUNCIONAMIENTO
Reuniones: ${frecuenciaTexto[acta.frecuenciaReuniones]}
Quórum mínimo: ${acta.quorum}% de los directores
Decisiones: por ${mayoriaTexto[acta.mayoriaDecisiones]}
${acta.observaciones ? `\nIV. OBSERVACIONES\n${acta.observaciones}` : ''}

${acta.directores.map(d => `_________________________\n${d.nombre} — ${d.cargo}`).join('\n\n')}
`;
}

export function formatearCuit(v: string): string {
  const n = v.replace(/\D/g, '').slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 10) return `${n.slice(0, 2)}-${n.slice(2)}`;
  return `${n.slice(0, 2)}-${n.slice(2, 10)}-${n.slice(10)}`;
}
