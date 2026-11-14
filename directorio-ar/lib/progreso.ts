import { storage } from './storage';
import { TOTAL_MODULOS_F1 } from './navegacion';

/** Qué módulos de la Fase 1 están completos (índice 0 = módulo 1). Solo en el cliente. */
export function modulosCompletadosF1(): boolean[] {
  return [
    !!storage.getModulo1Resultado(),
    !!storage.getModulo2Resultado(),
    !!storage.getModulo3Resultado(),
    !!(storage.getModulo4Diagnostico() || storage.getModulo4Frecuencia()),
    !!storage.getModulo5Resultado(),
  ];
}

/** Empresas fuera del público objetivo hacen solo M1 + M2 y terminan en el informe preliminar. */
export const MODULOS_ABREVIADO = 2;

export type ProgresoF1 = {
  completados: number;
  /** Módulos que componen SU recorrido: 5, o 2 si es abreviado. */
  total: number;
  abreviado: boolean;
  /** Próximo módulo a hacer (1–5), o total + 1 si ya terminó. */
  siguiente: number;
  terminado: boolean;
  /** A dónde ir al terminar el recorrido. */
  destinoFinal: '/resultado' | '/informe-preliminar';
};

export function progresoF1(): ProgresoF1 {
  const abreviado = storage.getModulo1Resultado()?.perfil?.recorrido === 'abreviado';
  const total = abreviado ? MODULOS_ABREVIADO : TOTAL_MODULOS_F1;
  const flags = modulosCompletadosF1().slice(0, total);
  const completados = flags.filter(Boolean).length;
  const idx = flags.findIndex(c => !c);
  return {
    completados,
    total,
    abreviado,
    siguiente: idx === -1 ? total + 1 : idx + 1,
    terminado: idx === -1,
    destinoFinal: abreviado ? '/informe-preliminar' : '/resultado',
  };
}

/** Pasa un diagnóstico abreviado a completo (el usuario eligió seguir con M3–M5). */
export function pasarARecorridoCompleto(): void {
  const r = storage.getModulo1Resultado();
  if (r?.perfil) storage.setModulo1Resultado({ ...r, perfil: { ...r.perfil, recorrido: 'completo' } });
}

/** Un módulo se desbloquea cuando el anterior está completo. */
export function moduloDesbloqueado(n: number): boolean {
  if (n === 1) return true;
  return modulosCompletadosF1()[n - 2] ?? false;
}
