import type { ActaConstitutiva, DatosEmpresa, DirectorActa } from '../types/fase2';

// ——— Valores iniciales ————————————————————————————————————————————————————

export const EMPRESA_INICIAL: DatosEmpresa = {
  razonSocial: '',
  cuit: '',
  domicilioLegal: '',
  tipoSociedad: 'SRL',
  capitalSocial: '',
  objetoSocial: '',
};

export const DIRECTOR_INICIAL: DirectorActa = {
  nombre: '',
  dni: '',
  cargo: 'Director Titular',
  duracionMandato: 2,
  esIndependiente: false,
};

export const TIPOS_SOCIEDAD = ['SRL', 'SA', 'SAS', 'Otro'] as const;

export const CARGOS_DIRECTOR: DirectorActa['cargo'][] = [
  'Presidente',
  'Vicepresidente',
  'Secretario',
  'Tesorero',
  'Director Titular',
  'Director Suplente',
  'Director Independiente',
];

// ——— Validación ————————————————————————————————————————————————————————————

export interface ValidacionActa {
  valida: boolean;
  errores: string[];
  advertencias: string[];
}

export function validarActa(acta: Partial<ActaConstitutiva>): ValidacionActa {
  const errores: string[] = [];
  const advertencias: string[] = [];

  if (!acta.empresa?.razonSocial?.trim()) errores.push('Razón social es obligatoria.');
  if (!acta.empresa?.cuit?.trim()) errores.push('CUIT es obligatorio.');
  if (!acta.empresa?.domicilioLegal?.trim()) errores.push('Domicilio legal es obligatorio.');
  if (!acta.empresa?.objetoSocial?.trim()) errores.push('Objeto social es obligatorio.');

  if (!acta.directores || acta.directores.length === 0) {
    errores.push('Debe haber al menos un director.');
  } else {
    const tienePresidente = acta.directores.some(d => d.cargo === 'Presidente');
    if (!tienePresidente) advertencias.push('Se recomienda designar un Presidente del directorio.');

    const independientes = acta.directores.filter(d => d.esIndependiente).length;
    const total = acta.directores.length;
    if (total >= 3 && independientes === 0) {
      advertencias.push('Con 3 o más directores, se recomienda al menos un director independiente.');
    }

    acta.directores.forEach((d, i) => {
      if (!d.nombre.trim()) errores.push(`Director ${i + 1}: el nombre es obligatorio.`);
      if (!d.dni.trim()) errores.push(`Director ${i + 1}: el DNI/CUIT es obligatorio.`);
    });
  }

  if (!acta.fechaConstitucion) errores.push('La fecha de constitución es obligatoria.');
  if (!acta.lugarConstitucion?.trim()) errores.push('El lugar de constitución es obligatorio.');

  return { valida: errores.length === 0, errores, advertencias };
}

// ——— Generación del texto del acta ————————————————————————————————————————

export function generarTextoActa(acta: ActaConstitutiva): string {
  const fecha = new Date(acta.fechaConstitucion).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const listaDirectores = acta.directores
    .map(d => `  - ${d.nombre} (DNI/CUIT: ${d.dni}), designado como ${d.cargo}, con mandato de ${d.duracionMandato} año(s)${d.esIndependiente ? ', carácter independiente' : ''}.`)
    .join('\n');

  const mayoriaTexto: Record<ActaConstitutiva['mayoriaDecisiones'], string> = {
    simple: 'mayoría simple (más del 50% de los presentes)',
    calificada_2_3: 'mayoría calificada de dos tercios (2/3) de los directores',
    unanimidad: 'unanimidad de los directores',
  };

  const frecuenciaTexto: Record<ActaConstitutiva['frecuenciaReuniones'], string> = {
    mensual: 'mensualmente',
    bimestral: 'cada dos meses',
    trimestral: 'trimestralmente',
  };

  return `ACTA DE CONSTITUCIÓN DEL DIRECTORIO
${acta.empresa.razonSocial.toUpperCase()}

En ${acta.lugarConstitucion}, a los ${fecha}, se reúnen los socios/accionistas de ${acta.empresa.razonSocial} (CUIT: ${acta.empresa.cuit}), con domicilio legal en ${acta.empresa.domicilioLegal}, a efectos de constituir formalmente el Directorio de la sociedad.

I. DATOS DE LA SOCIEDAD
Tipo societario: ${acta.empresa.tipoSociedad}
Objeto social: ${acta.empresa.objetoSocial}
Capital social: ${acta.empresa.capitalSocial}

II. DESIGNACIÓN DE DIRECTORES
Se designan los siguientes directores:
${listaDirectores}

III. FUNCIONAMIENTO DEL DIRECTORIO
El Directorio se reunirá ${frecuenciaTexto[acta.frecuenciaReuniones]}, en fecha y lugar a convocarse con al menos 5 días de anticipación.

El quórum mínimo para sesionar será del ${acta.quorum}% de los directores en ejercicio.

Las decisiones se adoptarán por ${mayoriaTexto[acta.mayoriaDecisiones]}.

IV. DISPOSICIONES GENERALES
El Directorio llevará un libro de actas donde se registrarán todas las reuniones, decisiones adoptadas y los votos de cada miembro.

El Presidente del Directorio convocará a las reuniones y presidirá las mismas. En su ausencia, lo reemplazará el Vicepresidente o quien los directores presentes designen.

${acta.observaciones ? `V. OBSERVACIONES\n${acta.observaciones}\n` : ''}

Se firman ${acta.directores.length} ejemplares de igual tenor y a un solo efecto.

${acta.directores.map(d => `_________________________\n${d.nombre}\n${d.cargo}`).join('\n\n')}
`;
}

// ——— Formateo de CUIT ————————————————————————————————————————————————————

export function formatearCuit(valor: string): string {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return nums;
  if (nums.length <= 10) return `${nums.slice(0, 2)}-${nums.slice(2)}`;
  return `${nums.slice(0, 2)}-${nums.slice(2, 10)}-${nums.slice(10)}`;
}
