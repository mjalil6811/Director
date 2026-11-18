// Inventario honesto de herramientas para la sección "Herramientas" de la landing.
// `disponible: true` solo si la herramienta está integrada y se puede usar hoy desde la app.
import { FASES, MODULOS_F1 } from './navegacion';

export interface Herramienta {
  nombre: string;
  descripcion: string;
  href?: string;
  disponible: boolean;
}

export interface GrupoHerramientas {
  fase: number;
  verbo: string;
  color: string;
  bg: string;
  herramientas: Herramienta[];
}

export const HERRAMIENTAS: GrupoHerramientas[] = [
  {
    fase: 1, verbo: FASES[0].verbo, color: FASES[0].color, bg: FASES[0].bg,
    herramientas: [
      { nombre: MODULOS_F1[0].titulo, descripcion: 'Perfil de tu empresa con los criterios oficiales PyME y nivel de necesidad de un consejo.', href: '/modulo/1', disponible: true },
      { nombre: MODULOS_F1[1].titulo, descripcion: 'Quién decide hoy cada tema clave y dónde hay concentración o zonas grises.', href: '/modulo/2', disponible: true },
      { nombre: MODULOS_F1[2].titulo, descripcion: 'Qué perfiles de asesores le sumarían más a tu empresa y con qué urgencia.', href: '/modulo/3', disponible: true },
      { nombre: MODULOS_F1[3].titulo, descripcion: 'Cómo es una reunión en la práctica, frecuencia sugerida y disposición al cambio.', href: '/modulo/4', disponible: true },
      { nombre: MODULOS_F1[4].titulo, descripcion: 'Acuerdo de trabajo entre el consejo y la gerencia: información, decisiones y desacuerdos.', href: '/modulo/5', disponible: true },
    ],
  },
  {
    fase: 2, verbo: FASES[1].verbo, color: FASES[1].color, bg: FASES[1].bg,
    herramientas: [
      { nombre: 'Acta constitutiva', descripcion: 'Acta guiada para dejar por escrito cómo se forma y funciona el consejo.', href: '/fase2/acta-constitutiva', disponible: true },
      { nombre: 'Protocolo de socios o familia', descripcion: 'Acuerdos entre socios o familia a partir de situaciones reales.', href: '/fase2/protocolo', disponible: true },
      { nombre: 'Reuniones del consejo', descripcion: 'Agenda, modo en vivo con cronómetro y acta automática.', href: '/fase2/reunion', disponible: true },
      { nombre: 'Votaciones', descripcion: 'Registro de mociones y votos dentro de cada reunión.', href: '/fase2/reunion', disponible: true },
      { nombre: 'Búsqueda e incorporación de asesores', descripcion: 'Seguimiento de candidatos y checklist para recibir a cada asesor nuevo.', disponible: false },
    ],
  },
  {
    fase: 3, verbo: FASES[2].verbo, color: FASES[2].color, bg: FASES[2].bg,
    herramientas: [
      { nombre: 'Tablero financiero', descripcion: 'Tus números e indicadores, con alertas e informe para cada reunión.', href: '/fase3/dashboard', disponible: true },
      { nombre: 'Seguimiento de compromisos', descripcion: 'Lo que se acordó en cada reunión, con responsables y fechas.', href: '/fase3/seguimiento', disponible: true },
      { nombre: 'Evaluación del CEO', descripcion: 'Evaluación anual con informe confidencial.', href: '/fase3/evaluacion-ceo', disponible: true },
    ],
  },
];

export const TOTAL_HERRAMIENTAS_DISPONIBLES = HERRAMIENTAS.reduce((a, g) => a + g.herramientas.filter(h => h.disponible).length, 0);
