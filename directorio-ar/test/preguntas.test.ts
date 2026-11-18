import { describe, expect, it } from 'vitest';
import { CATALOGO, PREGUNTAS_M1, SITUACIONES_M2, PREGUNTAS_M3, TEMAS_M5, IDX } from '../lib/preguntas';
import { calcularModulo1 } from '../lib/modulo1';
import { precargarDecisiones, reglaDecisiones } from '../lib/modulo5';
import { migrarDatos, ESQUEMA_KEY, ESQUEMA_ACTUAL } from '../lib/migraciones';
import { calcularEjes, cuadranteDe } from '../lib/ejes';

describe('catálogo de preguntas', () => {
  it('cada pregunta tiene un constructo', () => {
    for (const p of CATALOGO) expect(p.construct, `${p.modulo}/${p.id}`).toMatch(/^[a-z_]+$/);
  });

  it('dos preguntas nunca comparten constructo', () => {
    const vistos = new Map<string, string>();
    const repetidos: string[] = [];
    for (const p of CATALOGO) {
      const donde = `M${p.modulo}/${p.id}`;
      if (vistos.has(p.construct)) repetidos.push(`${p.construct}: ${vistos.get(p.construct)} y ${donde}`);
      else vistos.set(p.construct, donde);
    }
    expect(repetidos).toEqual([]);
  });

  it('las aclaraciones no usan frases persuasivas conocidas', () => {
    const PROHIBIDAS = [/error de distancia/i, /destruir/i, /subestimad/i, /principal freno/i, /nadie le dice que no/i, /conflicto de inter[eé]s evidente/i, /si nunca hay desacuerdo/i];
    const aclaraciones = [
      ...PREGUNTAS_M1.flatMap(p => (typeof p.aclaracion === 'string' ? [p.aclaracion] : Object.values(p.aclaracion))),
      ...SITUACIONES_M2.map(s => s.aclaracion),
      ...PREGUNTAS_M3.map(p => p.aclaracion),
      ...TEMAS_M5.map(t => t.aclaracion),
    ];
    for (const a of aclaraciones) for (const re of PROHIBIDAS) expect(a).not.toMatch(re);
  });

  it('la pregunta de decisiones del M1 no menciona reuniones', () => {
    const p = PREGUNTAS_M1[IDX.decisiones];
    expect(p.id).toBe('decisiones');
    const textos = (p.opciones as { texto: string | Record<string, string> }[]).flatMap(o => (typeof o.texto === 'string' ? [o.texto] : Object.values(o.texto)));
    for (const t of textos) expect(t).not.toMatch(/reuni/i);
  });

  it('IDX coincide con el orden de PREGUNTAS_M1', () => {
    for (const [id, i] of Object.entries(IDX)) expect(PREGUNTAS_M1[i].id).toBe(id);
  });
});

describe('migración v1 → v2', () => {
  // Respuestas del M1 con el formato anterior (10 preguntas, empleados en 4 tramos).
  const v1 = [0, 0, 2, 1, 2, 3, 0, 1, 2, 3];
  const datosV1 = {
    'directorio_ar:modulo1:respuestas_v2': JSON.stringify(v1),
    'directorio_ar:modulo1:resultado': JSON.stringify({ scoresPorDimension: [{ key: 'gobierno', nombre: 'Cómo se decide hoy' }, { key: 'decisiones', nombre: 'Toma de decisiones' }] }),
  };

  it('reubica las respuestas y deja sin responder las preguntas nuevas', () => {
    const out = migrarDatos(datosV1);
    const r = JSON.parse(out['directorio_ar:modulo1:respuestas_v2']) as number[];
    expect(r).toHaveLength(PREGUNTAS_M1.length);
    expect(r).toEqual([0, 0, 2, 2, 2, 3, -1, 0, -1, 1, 2, 3, -1]);
    expect(out[ESQUEMA_KEY]).toBe(String(ESQUEMA_ACTUAL));
  });

  it('conserva el puntaje por dimensión de quien ya respondió', () => {
    // Reglas anteriores: tamaño 3/6, propiedad 6/6, gobierno 5/6, reuniones 1/3, recursos 3/3.
    const r = JSON.parse(migrarDatos(datosV1)['directorio_ar:modulo1:respuestas_v2']) as number[];
    const res = calcularModulo1(r);
    expect(res.scoresPorDimension.map(d => `${d.key}:${d.score}/${d.max}`)).toEqual(['tamano:3/6', 'propiedad:6/6', 'gobierno:5/6', 'decisiones:1/3', 'disponibilidad:3/3']);
    // v3: el porcentaje de necesidad ya no incluye el presupuesto → 15/21.
    expect(res.porcentaje).toBe(71);
  });

  it('v3 recalcula el resultado guardado del Módulo 1', () => {
    const res = JSON.parse(migrarDatos(datosV1)['directorio_ar:modulo1:resultado']);
    expect(res.porcentaje).toBe(71);
    expect(res.scoresPorDimension.find((d: { key: string }) => d.key === 'gobierno').nombre).toBe('Concentración de decisiones');
  });

  it('"Menos de 50" pasa a "De 10 a 49" y conserva puntaje 0', () => {
    const out = migrarDatos({ 'directorio_ar:modulo1:respuestas_v2': JSON.stringify([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) });
    expect(JSON.parse(out['directorio_ar:modulo1:respuestas_v2'])[IDX.empleados]).toBe(1);
  });

  it('renombra las dimensiones de un resultado guardado sin respuestas', () => {
    const solo = { 'directorio_ar:modulo1:resultado': datosV1['directorio_ar:modulo1:resultado'] };
    const res = JSON.parse(migrarDatos(solo)['directorio_ar:modulo1:resultado']);
    expect(res.scoresPorDimension.map((d: { nombre: string }) => d.nombre)).toEqual(['Concentración de decisiones', 'Rutina de reuniones']);
  });

  it('es idempotente', () => {
    const una = migrarDatos(datosV1);
    expect(migrarDatos(una)).toEqual(una);
  });
});

describe('Módulo 5: decisiones precargadas del Módulo 2', () => {
  it('toma las decisiones concentradas o sin proceso claro', () => {
    // opciones del M2: 0 concentrada · 1 parcial · 2 delegada · 3 gris
    const p = precargarDecisiones([0, 2, 3, 1, 2, 0]);
    expect(p).toEqual({ origen: 'm2', ids: ['credito', 'sueldo_ceo', 'dividendos'] });
  });

  it('sin M2 completo, sugiere una lista base', () => {
    expect(precargarDecisiones(null).origen).toBe('sugerencia');
    expect(precargarDecisiones([0, -1, 0, 0, 0, 0]).origen).toBe('sugerencia');
  });

  it('arma la regla con la lista elegida', () => {
    expect(reglaDecisiones(['credito', 'dividendos'])).toBe('Estas decisiones pasan siempre por el consejo: tomar deuda importante y reparto de utilidades. Todo lo demás queda en manos de la gerencia.');
    expect(reglaDecisiones([])).toBeNull();
  });
});

describe('ejes Necesidad × Disposición', () => {
  it('ubica el cuadrante con corte en 50', () => {
    expect(cuadranteDe(50, 50)).toBe('armar');
    expect(cuadranteDe(80, 49)).toBe('sin_acuerdo');
    expect(cuadranteDe(49, 80)).toBe('anticipada');
    expect(cuadranteDe(10, 10)).toBe('todavia_no');
  });

  it('pondera y reescala según los módulos respondidos', () => {
    const m1 = { score: 0, nivel: '', porcentaje: 60, recomendaciones: [], scoresPorDimension: [{ key: 'disponibilidad', nombre: '', score: 3, max: 3 }] };
    const m2 = { score: 0, nivel: '', porcentaje: 40, conteos: { concentrada: 0, parcial: 0, delegada: 0, gris: 0 }, perfil: '', tensiones: [] };
    // Solo M1 + M2: necesidad = (60·0,5 + 40·0,3) / 0,8 = 52,5 → 53; disposición = presupuesto 100 (preliminar)
    const e = calcularEjes(m1, m2, null, null, null);
    expect(e).toEqual({ necesidad: 53, disposicion: 100, cuadrante: 'armar', disposicionPreliminar: true });
    // Con M4 al 20% y M5 al 50%: disposición = 20·0,5 + 50·0,3 + 100·0,2 = 45
    const e2 = calcularEjes(m1, m2, null, { score: 0, porcentaje: 20, nivel: '' }, { score: 0, nivel: '', porcentaje: 50, respuestas: [] });
    expect(e2.disposicion).toBe(45);
    expect(e2.cuadrante).toBe('sin_acuerdo');
  });
});
