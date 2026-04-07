export interface ModuloResultado {
  score: number;
  nivel: string;
  porcentaje?: number;
}

export interface Modulo1Resultado extends ModuloResultado {
  scoresPorDimension: { nombre: string; score: number; max: number }[];
  recomendaciones: string[];
}

export interface Modulo2Resultado extends ModuloResultado {
  conteos: { concentrada: number; parcial: number; delegada: number; gris: number };
  perfil: string;
  tensiones: { pregunta: number; tipo: string; beneficio: string }[];
}

export interface Modulo3Resultado extends ModuloResultado {
  topPerfiles: { perfil: string; score: number; urgencia: string; descripcion: string; justificacion?: string; ranking?: number }[];
  scoresCompletos?: Record<string, number>;
}

export interface Modulo4Diagnostico {
  score: number;
  porcentaje: number;
  nivel: string;
}

export interface Modulo5Resultado extends ModuloResultado {
  respuestas: (1 | 0.5 | 0)[];
}
