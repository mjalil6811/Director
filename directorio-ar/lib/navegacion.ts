// Fuente única de verdad para fases, módulos y herramientas.
// La usan AppHeader, ModuleLayout, la home y la página de módulos.

export type FaseId = 1 | 2 | 3;

export type ItemNav = { href: string; label: string };

export type Fase = {
  id: FaseId;
  nombre: string;
  verbo: string;
  color: string;
  bg: string;
  href: string;
  /** Rutas que pertenecen a la fase (para marcarla activa). */
  prefixes: string[];
  items: ItemNav[];
};

/** Módulos del diagnóstico (Fase 1). `min` = minutos estimados (~15 s por pregunta). */
export const MODULOS_F1 = [
  { n: 1, titulo: '¿Necesitás un directorio?', corto: 'Necesidad', min: 3 },
  { n: 2, titulo: 'Mapa de decisiones', corto: 'Decisiones', min: 2 },
  { n: 3, titulo: '¿Qué perfiles necesitás?', corto: 'Perfiles', min: 2 },
  { n: 4, titulo: 'Dinámica y funcionamiento', corto: 'Dinámica', min: 1 },
  { n: 5, titulo: 'Directorio y gerencia', corto: 'Gerencia', min: 1 },
] as const;

export const TOTAL_MODULOS_F1 = MODULOS_F1.length;

export const FASES: Fase[] = [
  {
    id: 1, nombre: 'Diagnóstico', verbo: 'Diagnosticá', color: '#534AB7', bg: '#EEEDFE', href: '/modulo/1',
    prefixes: ['/modulo', '/informe-preliminar', '/dashboard', '/resultado'],
    items: [
      { href: '/modulo/1', label: `1 · ${MODULOS_F1[0].titulo}` },
      { href: '/modulo/2', label: `2 · ${MODULOS_F1[1].titulo}` },
      { href: '/informe-preliminar', label: 'Informe preliminar' },
      { href: '/modulo/3', label: `3 · ${MODULOS_F1[2].titulo}` },
      { href: '/modulo/4', label: `4 · ${MODULOS_F1[3].titulo}` },
      { href: '/modulo/5', label: `5 · ${MODULOS_F1[4].titulo}` },
      { href: '/dashboard', label: 'Governance Score' },
      { href: '/resultado', label: 'Resultado final' },
    ],
  },
  {
    id: 2, nombre: 'Constitución', verbo: 'Constituí', color: '#0F6E56', bg: '#E1F5EE', href: '/fase2/acta-constitutiva',
    prefixes: ['/fase2'],
    items: [
      { href: '/fase2/acta-constitutiva', label: 'Acta constitutiva' },
      { href: '/fase2/protocolo', label: 'Protocolo de socios / familia' },
      { href: '/fase2/reunion', label: 'Reuniones del directorio' },
    ],
  },
  {
    id: 3, nombre: 'Operación', verbo: 'Operá', color: '#854F0B', bg: '#FAEEDA', href: '/fase3/dashboard',
    prefixes: ['/fase3'],
    items: [
      { href: '/fase3/dashboard', label: 'Dashboard financiero' },
      { href: '/fase3/seguimiento', label: 'Seguimiento de tareas' },
      { href: '/fase3/evaluacion-ceo', label: 'Evaluación del CEO' },
    ],
  },
];

export function faseDeRuta(pathname: string): Fase | undefined {
  return FASES.find(f => f.prefixes.some(p => pathname === p || pathname.startsWith(p + '/')));
}
