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

export type ProgresoF1 = {
  completados: number;
  /** Próximo módulo a hacer (1–5), o 6 si ya terminó. */
  siguiente: number;
  terminado: boolean;
};

export function progresoF1(): ProgresoF1 {
  const flags = modulosCompletadosF1();
  const completados = flags.filter(Boolean).length;
  const idx = flags.findIndex(c => !c);
  const siguiente = idx === -1 ? TOTAL_MODULOS_F1 + 1 : idx + 1;
  return { completados, siguiente, terminado: idx === -1 };
}

/** Un módulo se desbloquea cuando el anterior está completo. */
export function moduloDesbloqueado(n: number): boolean {
  if (n === 1) return true;
  return modulosCompletadosF1()[n - 2] ?? false;
}
