import type { Modulo2Resultado } from "../types";

export const SITUACIONES_M2 = [
  "El banco ofrece una línea de crédito importante. ¿Quién debería decidir?",
  "El gerente comercial quiere contratar dos vendedores nuevos. ¿Quién da el visto bueno?",
  "Dos socios no se ponen de acuerdo sobre abrir una sucursal en el interior. ¿Qué órgano resuelve?",
  "Un cliente importante llama con una queja urgente. El equipo no sabe cómo responder sin consultar arriba. ¿Quién resuelve?",
  "Hay que definir el sueldo del CEO para el año que viene. ¿Quién tiene autoridad legítima?",
  "Apareció la oportunidad de comprar una empresa competidora. ¿Quién evalúa, recomienda y aprueba?",
  "Los resultados del trimestre fueron malos. ¿Quién le rinde cuentas a quién?",
  "Un hijo del dueño quiere entrar a trabajar en la empresa. ¿Quién decide si ingresa, en qué rol y con qué sueldo?",
  "La empresa recibió una intimación de un proveedor. ¿Quién tiene la responsabilidad?",
  "Cerró bien el año. Los socios quieren saber cuánto se van a llevar. ¿Quién decide?",
];

export const OPCIONES_M2 = [
  { label: "Accionista", value: "A" },
  { label: "Director", value: "D" },
  { label: "Gerente", value: "G" },
  { label: "Los tres mezclados", value: "M" },
];

export const CORRECTAS_M2: string[] = ["D", "G", "D", "G", "D", "D", "D", "D", "D", "A"];

export function calcularModulo2(respuestas: number[]): Modulo2Resultado {
  const elegidos = respuestas.map(idx => OPCIONES_M2[idx]?.value ?? "M");
  const conteos = { A: 0, D: 0, G: 0, M: 0 };
  elegidos.forEach(v => {
    if (v === "A") conteos.A++;
    else if (v === "D") conteos.D++;
    else if (v === "G") conteos.G++;
    else conteos.M++;
  });

  let perfil: string;
  const mPct = conteos.M / 10;
  if (mPct >= 0.4) {
    perfil = "Rol híbrido no diferenciado";
  } else if (conteos.A >= conteos.D && conteos.A >= conteos.G) {
    perfil = "Perfil accionista dominante";
  } else if (conteos.D >= conteos.A && conteos.D >= conteos.G) {
    perfil = "Perfil director predominante";
  } else {
    perfil = "Perfil gerente ejecutor";
  }

  const tensiones: { pregunta: number; elegido: string; correcto: string }[] = [];
  elegidos.forEach((elegido, idx) => {
    if (elegido !== CORRECTAS_M2[idx] && elegido !== "M" && tensiones.length < 3) {
      tensiones.push({
        pregunta: idx + 1,
        elegido,
        correcto: CORRECTAS_M2[idx],
      });
    }
  });

  const correctCount = elegidos.filter((v, i) => v === CORRECTAS_M2[i]).length;
  const porcentaje = Math.round((correctCount / 10) * 100);

  return {
    score: correctCount,
    nivel: perfil,
    porcentaje,
    conteos,
    perfil,
    tensiones,
  };
}
