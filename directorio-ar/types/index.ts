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
  conteos: { A: number; D: number; G: number; M: number };
  perfil: string;
  tensiones: { pregunta: number; elegido: string; correcto: string }[];
}

export interface Modulo3Resultado extends ModuloResultado {
  topPerfiles: { perfil: string; score: number; urgencia: string; descripcion: string; justificacion?: string; ranking?: number }[];
  scoresCompletos?: Record<string, number>;
}

export interface Modulo5Resultado extends ModuloResultado {
  respuestas: (1 | 0.5 | 0)[];
}
