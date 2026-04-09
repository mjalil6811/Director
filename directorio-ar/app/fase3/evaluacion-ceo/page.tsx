'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DIMENSIONES_EVALUACION, ESCALA_LABELS, ESCALA_COLORES,
  calcularEvaluacion, generarInformeEvaluacion, generarId,
} from '../../../lib/modulo12-evaluacion';
import { storageFase3 } from '../../../lib/storage-fase3';
import { storageFase2 } from '../../../lib/storage-fase2';
import { storage } from '../../../lib/storage';
import type { EvaluacionCEO, EvaluacionDirector, RespuestaEvaluacion } from '../../../types/fase3';

const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-all";

function EscalaSelector({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${valor === n ? 'text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
          style={valor === n ? { backgroundColor: ESCALA_COLORES[n] } : {}}
          title={ESCALA_LABELS[n]}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function FormDirector({ evaluacion, directorIdx, onActualizar, onVolver }: {
  evaluacion: EvaluacionCEO;
  directorIdx: number;
  onActualizar: (e: EvaluacionCEO) => void;
  onVolver: () => void;
}) {
  const director = evaluacion.evaluaciones[directorIdx];
  if (!director) return null;

  const setRespuesta = (preguntaId: string, valor: number | string | boolean) => {
    const nuevasRespuestas = director.respuestas.some(r => r.preguntaId === preguntaId)
      ? director.respuestas.map(r => r.preguntaId === preguntaId ? { ...r, valor } : r)
      : [...director.respuestas, { preguntaId, valor }];

    const nuevasEvaluaciones = evaluacion.evaluaciones.map((ev, i) =>
      i === directorIdx ? { ...ev, respuestas: nuevasRespuestas } : ev
    );
    onActualizar({ ...evaluacion, evaluaciones: nuevasEvaluaciones });
  };

  const getRespuesta = (preguntaId: string): number | string | boolean => {
    const r = director.respuestas.find(r => r.preguntaId === preguntaId);
    return r?.valor ?? 0;
  };

  const setComentario = (comentario: string) => {
    const nuevasEvaluaciones = evaluacion.evaluaciones.map((ev, i) =>
      i === directorIdx ? { ...ev, comentarioGeneral: comentario } : ev
    );
    onActualizar({ ...evaluacion, evaluaciones: nuevasEvaluaciones });
  };

  const marcarCompletada = () => {
    const nuevasEvaluaciones = evaluacion.evaluaciones.map((ev, i) =>
      i === directorIdx ? { ...ev, completada: true, fecha: new Date().toISOString().split('T')[0] } : ev
    );
    const nuevaEval = { ...evaluacion, evaluaciones: nuevasEvaluaciones };
    onActualizar(calcularEvaluacion(nuevaEval));
    onVolver();
  };

  const totalPreguntas = DIMENSIONES_EVALUACION.reduce((s, d) => s + d.preguntas.length, 0);
  const respondidas = director.respuestas.filter(r => r.valor !== 0 && r.valor !== '').length;
  const progreso = totalPreguntas > 0 ? Math.round(respondidas / totalPreguntas * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Evaluacion de {director.directorNombre}</h3>
          <p className="text-xs text-gray-400">Progreso: {progreso}% ({respondidas}/{totalPreguntas} preguntas)</p>
        </div>
        <button onClick={onVolver} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Volver</button>
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] rounded-full transition-all duration-500" style={{ width: `${progreso}%` }} />
      </div>

      {DIMENSIONES_EVALUACION.map(dim => (
        <div key={dim.id} className="mb-6">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900">{dim.nombre}</h4>
            <p className="text-xs text-gray-400">{dim.descripcion}</p>
          </div>
          <div className="space-y-3">
            {dim.preguntas.map(preg => (
              <div key={preg.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{preg.texto}</p>
                {preg.tipo === 'escala' && (
                  <div>
                    <EscalaSelector valor={getRespuesta(preg.id) as number} onChange={v => setRespuesta(preg.id, v)} />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-400">Deficiente</span>
                      <span className="text-[10px] text-gray-400">Excelente</span>
                    </div>
                  </div>
                )}
                {preg.tipo === 'texto' && (
                  <textarea className={inp + ' resize-none'} rows={2} value={getRespuesta(preg.id) as string || ''} onChange={e => setRespuesta(preg.id, e.target.value)} placeholder="Tu respuesta..." />
                )}
                {preg.tipo === 'si_no' && (
                  <div className="flex gap-2">
                    {[true, false].map(v => (
                      <button key={String(v)} onClick={() => setRespuesta(preg.id, v)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${getRespuesta(preg.id) === v ? 'bg-[#534AB7] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {v ? 'Si' : 'No'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Comentario general</label>
        <textarea className={inp + ' resize-none'} rows={3} value={director.comentarioGeneral} onChange={e => setComentario(e.target.value)} placeholder="Observaciones generales sobre el desempeno del CEO..." />
      </div>

      <button onClick={marcarCompletada} disabled={progreso < 80} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-40">
        {director.completada ? 'Actualizar evaluacion' : 'Finalizar evaluacion'}
      </button>
    </div>
  );
}

function Resultados({ evaluacion }: { evaluacion: EvaluacionCEO }) {
  const [informe, setInforme] = useState('');

  const generarInforme = () => {
    const empresa = storage.getEmpresaNombre() || 'Mi Empresa';
    const texto = generarInformeEvaluacion(evaluacion, empresa);
    setInforme(texto);
  };

  const completadas = evaluacion.evaluaciones.filter(e => e.completada).length;
  const total = evaluacion.evaluaciones.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Resultados de la evaluacion</h3>
          <p className="text-xs text-gray-400">{completadas} de {total} evaluaciones completadas</p>
        </div>
      </div>

      {/* Score promedio */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5 text-center">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Score promedio</p>
        <p className="text-4xl font-bold" style={{ color: ESCALA_COLORES[Math.round(evaluacion.scorePromedio)] || '#534AB7' }}>
          {evaluacion.scorePromedio.toFixed(1)}
        </p>
        <p className="text-xs text-gray-400 mt-1">de 5.0</p>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-3 mx-auto max-w-xs">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${evaluacion.scorePromedio / 5 * 100}%`, backgroundColor: ESCALA_COLORES[Math.round(evaluacion.scorePromedio)] || '#534AB7' }} />
        </div>
      </div>

      {/* Scores por dimension */}
      {evaluacion.scoresPorDimension.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Por dimension</p>
          <div className="space-y-3">
            {evaluacion.scoresPorDimension.map(d => (
              <div key={d.dimensionId}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{d.nombre}</span>
                  <span className="font-bold" style={{ color: ESCALA_COLORES[Math.round(d.promedio)] || '#534AB7' }}>{d.promedio.toFixed(1)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.promedio / 5 * 100}%`, backgroundColor: ESCALA_COLORES[Math.round(d.promedio)] || '#534AB7' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fortalezas y areas de desarrollo */}
      {evaluacion.fortalezas.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Fortalezas</p>
          <ul className="space-y-1">
            {evaluacion.fortalezas.map((f, i) => (
              <li key={i} className="text-xs text-green-600">{f}</li>
            ))}
          </ul>
        </div>
      )}

      {evaluacion.areasDesarrollo.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Areas de desarrollo</p>
          <ul className="space-y-1">
            {evaluacion.areasDesarrollo.map((a, i) => (
              <li key={i} className="text-xs text-amber-600">{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Informe */}
      {!informe ? (
        <button onClick={generarInforme} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] text-white text-sm font-semibold hover:shadow-lg transition-all">
          Generar informe completo
        </button>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Informe de evaluacion</p>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(informe)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium">Copiar</button>
              <button onClick={() => setInforme('')} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200">Cerrar</button>
            </div>
          </div>
          <pre className="bg-white border border-gray-100 rounded-2xl p-5 text-xs font-mono text-gray-700 whitespace-pre-wrap leading-relaxed shadow-sm overflow-auto max-h-[60vh]">{informe}</pre>
        </div>
      )}
    </div>
  );
}

export default function ModuloEvaluacionCEO() {
  const router = useRouter();
  const [evaluacion, setEvaluacion] = useState<EvaluacionCEO | null>(null);
  const [vista, setVista] = useState<'inicio' | 'evaluar' | 'resultados'>('inicio');
  const [directorIdx, setDirectorIdx] = useState(0);
  const [ceoNombre, setCeoNombre] = useState('');
  const [directoresNombres, setDirectoresNombres] = useState<string[]>(['']);

  useEffect(() => {
    const guardada = storageFase3.getEvaluacionCEO();
    if (guardada) {
      setEvaluacion(guardada);
      setVista(guardada.estadoProcesoEval === 'finalizada' ? 'resultados' : 'inicio');
    }
  }, []);

  const guardarEvaluacion = useCallback((e: EvaluacionCEO) => {
    setEvaluacion(e);
    storageFase3.setEvaluacionCEO(e);
  }, []);

  const iniciarEvaluacion = () => {
    if (!ceoNombre.trim()) return;
    const nombres = directoresNombres.filter(n => n.trim());
    if (nombres.length === 0) return;

    const eval0: EvaluacionCEO = {
      id: generarId(),
      anio: new Date().getFullYear(),
      ceoNombre: ceoNombre.trim(),
      evaluaciones: nombres.map(n => ({
        id: generarId(),
        directorNombre: n.trim(),
        respuestas: [],
        comentarioGeneral: '',
        completada: false,
        fecha: '',
      })),
      scorePromedio: 0,
      scoresPorDimension: [],
      fortalezas: [],
      areasDesarrollo: [],
      estadoProcesoEval: 'en_curso',
      fechaInicio: new Date().toISOString().split('T')[0],
    };
    guardarEvaluacion(eval0);
    setEvaluacion(eval0);
    setVista('inicio');
  };

  const agregarDirector = () => setDirectoresNombres(p => [...p, '']);
  const quitarDirector = (i: number) => setDirectoresNombres(p => p.filter((_, idx) => idx !== i));
  const updateDirectorNombre = (i: number, v: string) => setDirectoresNombres(p => p.map((n, idx) => idx === i ? v : n));

  const finalizarProceso = () => {
    if (!evaluacion) return;
    const finalizada = calcularEvaluacion({
      ...evaluacion,
      estadoProcesoEval: 'finalizada',
      fechaCierre: new Date().toISOString().split('T')[0],
    });
    guardarEvaluacion(finalizada);
    setVista('resultados');
  };

  const reiniciar = () => {
    storageFase3.setEvaluacionCEO(null as unknown as EvaluacionCEO);
    setEvaluacion(null);
    setCeoNombre('');
    setDirectoresNombres(['']);
    setVista('inicio');
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => vista === 'evaluar' ? setVista('inicio') : router.push('/')} className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12l7 7M5 12l7-7" /></svg>
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] text-white text-xs font-bold flex items-center justify-center">12</div>
          <span className="text-sm font-semibold text-gray-900">Evaluacion del CEO</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 pb-10">
        {vista === 'evaluar' && evaluacion ? (
          <FormDirector
            evaluacion={evaluacion}
            directorIdx={directorIdx}
            onActualizar={guardarEvaluacion}
            onVolver={() => setVista('inicio')}
          />
        ) : vista === 'resultados' && evaluacion ? (
          <div>
            <Resultados evaluacion={evaluacion} />
            <button onClick={reiniciar} className="w-full mt-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all">
              Reiniciar proceso
            </button>
          </div>
        ) : !evaluacion ? (
          /* Setup form */
          <div>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#EEEDFE] mx-auto mb-4 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Evaluacion del CEO</h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">Cada director evalua al CEO en distintas dimensiones. Los resultados se consolidan en un informe confidencial.</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nombre del CEO *</label>
              <input type="text" className={inp} value={ceoNombre} onChange={e => setCeoNombre(e.target.value)} placeholder="Nombre completo" />
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Directores evaluadores *</label>
                <button onClick={agregarDirector} className="text-xs font-semibold text-[#534AB7] hover:underline">+ Agregar</button>
              </div>
              <div className="space-y-2">
                {directoresNombres.map((n, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" className={inp} value={n} onChange={e => updateDirectorNombre(i, e.target.value)} placeholder={`Director ${i + 1}`} />
                    {directoresNombres.length > 1 && (
                      <button onClick={() => quitarDirector(i)} className="px-2 text-red-400 hover:text-red-600 text-sm">&times;</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={iniciarEvaluacion} disabled={!ceoNombre.trim() || directoresNombres.filter(n => n.trim()).length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-40">
              Iniciar proceso de evaluacion
            </button>
          </div>
        ) : evaluacion ? (
          /* Director list */
          <div>
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-900 mb-1">Evaluacion de {evaluacion.ceoNombre}</h3>
              <p className="text-xs text-gray-400">Ano {evaluacion.anio} — {evaluacion.evaluaciones.filter(e => e.completada).length} de {evaluacion.evaluaciones.length} evaluaciones completadas</p>
            </div>

            <div className="space-y-2 mb-5">
              {evaluacion.evaluaciones.map((ev, i) => (
                <button key={ev.id} onClick={() => { setDirectorIdx(i); setVista('evaluar'); }}
                  className="w-full text-left bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:border-[#534AB7]/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{ev.directorNombre}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ev.completada ? `Completada el ${ev.fecha}` : 'Pendiente'}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${ev.completada ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {ev.completada ? '\u2713' : (i + 1)}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setVista('resultados')} disabled={evaluacion.evaluaciones.filter(e => e.completada).length === 0}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-40">
                Ver resultados parciales
              </button>
              <button onClick={finalizarProceso} disabled={evaluacion.evaluaciones.some(e => !e.completada)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-40">
                Finalizar proceso
              </button>
            </div>

            <button onClick={reiniciar} className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-red-500 transition-all">
              Reiniciar proceso completo
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
