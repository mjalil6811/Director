import type { ClausulaProtocolo, CategoriaProtocolo, ProtocoloResultado, TipoProtocolo } from '../../types/fase2';

// ——— Cláusulas del protocolo ————————————————————————————————————————————————

export const CLAUSULAS: ClausulaProtocolo[] = [
  // Ingreso y egreso
  {
    id: 'ie_01',
    categoria: 'ingreso_egreso',
    titulo: 'Condiciones para incorporar nuevos socios',
    descripcion: 'Define los requisitos, proceso de aprobación y condiciones económicas para que una nueva persona ingrese como socio o accionista.',
    seleccionada: false,
  },
  {
    id: 'ie_02',
    categoria: 'ingreso_egreso',
    titulo: 'Derecho de preferencia en compraventa de participaciones',
    descripcion: 'Ante la venta de una participación, los socios actuales tienen derecho a comprarla en las mismas condiciones antes que un tercero.',
    seleccionada: false,
  },
  {
    id: 'ie_03',
    categoria: 'ingreso_egreso',
    titulo: 'Mecanismo de salida voluntaria (put option)',
    descripcion: 'Establece el procedimiento y la fórmula de valuación para que un socio pueda vender su participación a los demás.',
    seleccionada: false,
  },
  {
    id: 'ie_04',
    categoria: 'ingreso_egreso',
    titulo: 'Restricción de ingreso a cónyuges y familiares políticos',
    descripcion: 'Define si los cónyuges o parejas de socios pueden o no ingresar como socios o directores de la empresa.',
    seleccionada: false,
  },
  // Transferencia de acciones
  {
    id: 'ta_01',
    categoria: 'transferencia_acciones',
    titulo: 'Lock-up: período de inalienabilidad',
    descripcion: 'Prohíbe la transferencia de participaciones durante un período determinado desde la constitución o ingreso del socio.',
    seleccionada: false,
  },
  {
    id: 'ta_02',
    categoria: 'transferencia_acciones',
    titulo: 'Valuación de participaciones (fórmula)',
    descripcion: 'Establece la metodología para valuar la empresa ante cualquier transacción: múltiplo de EBITDA, valor libro, valuación independiente, etc.',
    seleccionada: false,
  },
  {
    id: 'ta_03',
    categoria: 'transferencia_acciones',
    titulo: 'Tag-along: derecho de adherirse a una venta',
    descripcion: 'Si un socio mayoritario vende, los minoritarios tienen derecho a vender en las mismas condiciones.',
    seleccionada: false,
  },
  {
    id: 'ta_04',
    categoria: 'transferencia_acciones',
    titulo: 'Drag-along: derecho de arrastrar en una venta',
    descripcion: 'Si el mayoría quiere vender el 100% de la empresa, puede obligar a los minoritarios a vender en las mismas condiciones.',
    seleccionada: false,
  },
  // Resolución de conflictos
  {
    id: 'cf_01',
    categoria: 'conflictos',
    titulo: 'Protocolo de negociación directa (etapa 1)',
    descripcion: 'Ante un conflicto, los socios se reúnen en un plazo definido (ej. 15 días) para intentar resolverlo directamente.',
    seleccionada: false,
  },
  {
    id: 'cf_02',
    categoria: 'conflictos',
    titulo: 'Mediación externa (etapa 2)',
    descripcion: 'Si la negociación directa fracasa, se convoca a un mediador externo independiente acordado por las partes.',
    seleccionada: false,
  },
  {
    id: 'cf_03',
    categoria: 'conflictos',
    titulo: 'Árbitro o arbitraje (etapa 3)',
    descripcion: 'Como última instancia antes de la justicia ordinaria, se somete el conflicto a un árbitro cuya decisión es vinculante.',
    seleccionada: false,
  },
  {
    id: 'cf_04',
    categoria: 'conflictos',
    titulo: 'Mecanismo de ruptura societaria (shotgun clause)',
    descripcion: 'En caso de bloqueo irresoluble entre dos socios paritarios, uno ofrece un precio y el otro elige: compra o vende a ese precio.',
    seleccionada: false,
  },
  // Sucesión
  {
    id: 'su_01',
    categoria: 'sucesion',
    titulo: 'Condiciones para herederos como socios',
    descripcion: 'Define si los herederos de un socio fallecido ingresan automáticamente o si hay restricciones, requisitos o derechos de compra preferente.',
    seleccionada: false,
  },
  {
    id: 'su_02',
    categoria: 'sucesion',
    titulo: 'Plan de sucesión en la dirección ejecutiva',
    descripcion: 'Establece el proceso para identificar, preparar y designar al sucesor del CEO o director general.',
    seleccionada: false,
  },
  {
    id: 'su_03',
    categoria: 'sucesion',
    titulo: 'Condiciones de incapacidad o fallecimiento de un director',
    descripcion: 'Define qué ocurre con el directorio y la gestión ante la incapacidad o fallecimiento de un director clave.',
    seleccionada: false,
  },
  // Dividendos
  {
    id: 'dv_01',
    categoria: 'dividendos',
    titulo: 'Política de distribución de dividendos',
    descripcion: 'Establece qué porcentaje mínimo o máximo de las utilidades se distribuye como dividendo y en qué plazos.',
    seleccionada: false,
  },
  {
    id: 'dv_02',
    categoria: 'dividendos',
    titulo: 'Reinversión obligatoria de utilidades',
    descripcion: 'Define un porcentaje de las utilidades que debe destinarse a reinversión en el negocio antes de cualquier distribución.',
    seleccionada: false,
  },
  {
    id: 'dv_03',
    categoria: 'dividendos',
    titulo: 'Reservas mínimas antes de distribuir',
    descripcion: 'Establece que la empresa debe mantener un nivel mínimo de liquidez o capital de trabajo antes de distribuir dividendos.',
    seleccionada: false,
  },
  // Remuneraciones
  {
    id: 're_01',
    categoria: 'remuneraciones',
    titulo: 'Honorarios de directores',
    descripcion: 'Define la política de retribución de los directores: monto, forma, periodicidad y aprobación.',
    seleccionada: false,
  },
  {
    id: 're_02',
    categoria: 'remuneraciones',
    titulo: 'Remuneración de socios que trabajan en la empresa',
    descripcion: 'Establece cómo se fija y revisa el sueldo de los socios que ocupan cargos gerenciales, diferenciando remuneración de dividendos.',
    seleccionada: false,
  },
  {
    id: 're_03',
    categoria: 'remuneraciones',
    titulo: 'Gastos de representación y beneficios',
    descripcion: 'Define qué gastos puede cargar un director o socio a la empresa y cuáles requieren aprobación del directorio.',
    seleccionada: false,
  },
  // Gobierno
  {
    id: 'go_01',
    categoria: 'gobierno',
    titulo: 'Materias reservadas a la asamblea de socios',
    descripcion: 'Lista las decisiones que no puede tomar el directorio solo y requieren aprobación de la asamblea: fusiones, ventas de activos críticos, etc.',
    seleccionada: false,
  },
  {
    id: 'go_02',
    categoria: 'gobierno',
    titulo: 'Evaluación anual del directorio',
    descripcion: 'Establece que el directorio se autoevalúa anualmente con criterios definidos y puede incluir evaluación externa cada dos años.',
    seleccionada: false,
  },
  {
    id: 'go_03',
    categoria: 'gobierno',
    titulo: 'Código de conducta y conflictos de interés',
    descripcion: 'Define el comportamiento esperado de directores y el procedimiento para declarar y gestionar conflictos de interés.',
    seleccionada: false,
  },
];

// ——— Categorías ————————————————————————————————————————————————————————————

export const CATEGORIAS: Record<CategoriaProtocolo, { label: string; descripcion: string; icono: string }> = {
  ingreso_egreso: {
    label: 'Ingreso y egreso de socios',
    descripcion: 'Quién puede entrar, cómo y bajo qué condiciones puede salir.',
    icono: 'door',
  },
  transferencia_acciones: {
    label: 'Transferencia de participaciones',
    descripcion: 'Cómo se valúa y transfiere la empresa o partes de ella.',
    icono: 'transfer',
  },
  conflictos: {
    label: 'Resolución de conflictos',
    descripcion: 'Qué hacer cuando los socios no se ponen de acuerdo.',
    icono: 'scale',
  },
  sucesion: {
    label: 'Sucesión y continuidad',
    descripcion: 'Qué pasa con la empresa ante fallecimiento, incapacidad o retiro.',
    icono: 'tree',
  },
  dividendos: {
    label: 'Distribución de dividendos',
    descripcion: 'Cuándo y cuánto se reparte de las utilidades.',
    icono: 'money',
  },
  remuneraciones: {
    label: 'Remuneraciones y gastos',
    descripcion: 'Cómo se paga a directores y socios que trabajan en la empresa.',
    icono: 'salary',
  },
  gobierno: {
    label: 'Gobierno y control',
    descripcion: 'Materias reservadas, evaluaciones y conducta esperada.',
    icono: 'governance',
  },
};

// ——— Cálculo de completitud ————————————————————————————————————————————————

export function calcularCompletitudProtocolo(
  tipo: TipoProtocolo,
  clausulas: ClausulaProtocolo[]
): ProtocoloResultado {
  const seleccionadas = clausulas.filter(c => c.seleccionada);

  const categoriasConCobertura = new Set(seleccionadas.map(c => c.categoria));
  const todasCategorias = Object.keys(CATEGORIAS) as CategoriaProtocolo[];

  const categoriasObligatorias: CategoriaProtocolo[] = tipo === 'familia'
    ? ['sucesion', 'conflictos', 'ingreso_egreso', 'dividendos']
    : ['conflictos', 'transferencia_acciones', 'dividendos'];

  const areasConBrechas = categoriasObligatorias.filter(c => !categoriasConCobertura.has(c));
  const cobertura = categoriasConCobertura.size / todasCategorias.length;
  const completitudPorcentaje = Math.round(cobertura * 100);

  return {
    tipo,
    clausulasSeleccionadas: seleccionadas,
    completitudPorcentaje,
    areasConBrechas,
  };
}
