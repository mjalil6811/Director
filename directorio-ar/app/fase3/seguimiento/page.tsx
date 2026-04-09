'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ESTADO_META, PRIORIDAD_META, calcularEstado, calcularEstadisticas,
  diasHastaVencimiento, labelDias, importarTareasDeReuniones, generarId,
} from '../../../lib/gestion/modulo11-seguimiento';
import { storageFase2 } from '../../../lib/storage/storage-fase2';
import { storageFase3 } from '../../../lib/storage/storage-fase3';
import type { TareaGestion, EstadoTarea, PrioridadTarea } from '../../../types/fase3';

const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-all";

function FormTarea({ tareaInicial, onGuardar, onCancelar }: {
  tareaInicial: TareaGestion | null;
  onGuardar: (t: TareaGestion) => void;
  onCancelar: () => void;
}) {
  const vacia: TareaGestion = {
    id: generarId(), descripcion: '', responsable: '', fechaVencimiento: '',
    prioridad: 'media', estado: 'pendiente', notas: '', etiquetas: [],
  };
  const [t, setT] = useState<TareaGestion>(tareaInicial ?? vacia);
  const [etiquetaInput, setEtiquetaInput] = useState('');

  const agregarEtiqueta = () => {
    const e = etiquetaInput.trim();
    if (e && !t.etiquetas.includes(e)) {
      setT(prev => ({ ...prev, etiquetas: [...prev.etiquetas, e] }));
    }
    setEtiquetaInput('');
  };

  const quitarEtiqueta = (idx: number) => {
    setT(prev => ({ ...prev, etiquetas: prev.etiquetas.filter((_, i) => i !== idx) }));
  };

  const valido = t.descripcion.trim().length > 0 && t.responsable.trim().length > 0;

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{tareaInicial ? 'Editar tarea' : 'Nueva tarea'}</h3>
      <p className="text-xs text-gray-400 mb-5">Define que hay que hacer, quien es responsable y cuando vence.</p>

      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descripcion *</label>
        <textarea className={inp + ' resize-none'} rows={2} value={t.descripcion} onChange={e => setT(prev => ({ ...prev, descripcion: e.target.value }))} placeholder="Que hay que hacer..." />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Responsable *</label>
          <input type="text" className={inp} value={t.responsable} onChange={e => setT(prev => ({ ...prev, responsable: e.target.value }))} placeholder="Nombre" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Vencimiento</label>
          <input type="date" className={inp} value={t.fechaVencimiento} onChange={e => setT(prev => ({ ...prev, fechaVencimiento: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Prioridad</label>
          <select className={inp} value={t.prioridad} onChange={e => setT(prev => ({ ...prev, prioridad: e.target.value as PrioridadTarea }))}>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estado</label>
          <select className={inp} value={t.estado} onChange={e => setT(prev => ({ ...prev, estado: e.target.value as EstadoTarea }))}>
            <option value="pendiente">Pendiente</option>
            <option value="en_curso">En curso</option>
            <option value="completada">Completada</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notas</label>
        <textarea className={inp + ' resize-none'} rows={2} value={t.notas} onChange={e => setT(prev => ({ ...prev, notas: e.target.value }))} placeholder="Contexto adicional..." />
      </div>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Etiquetas</label>
        <div className="flex gap-2">
          <input type="text" className={inp} value={etiquetaInput} onChange={e => setEtiquetaInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), agregarEtiqueta())} placeholder="Agregar etiqueta..." />
          <button onClick={agregarEtiqueta} className="px-3 py-2.5 rounded-xl bg-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-all">+</button>
        </div>
        {t.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {t.etiquetas.map((e, i) => (
              <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EEEDFE] text-[#534AB7] flex items-center gap-1">
                {e}
                <button onClick={() => quitarEtiqueta(i)} className="text-[#534AB7]/50 hover:text-[#534AB7]">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={onCancelar} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancelar</button>
        <button onClick={() => valido && onGuardar(t)} disabled={!valido} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-40">Guardar</button>
      </div>
    </div>
  );
}

function TareaCard({ tarea, onEditar, onCambiarEstado, onEliminar }: {
  tarea: TareaGestion;
  onEditar: () => void;
  onCambiarEstado: (e: EstadoTarea) => void;
  onEliminar: () => void;
}) {
  const estadoReal = calcularEstado(tarea);
  const meta = ESTADO_META[estadoReal];
  const prioMeta = PRIORIDAD_META[tarea.prioridad];
  const dias = tarea.fechaVencimiento ? diasHastaVencimiento(tarea.fechaVencimiento) : null;
  const diasInfo = dias !== null ? labelDias(dias) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 leading-snug">{tarea.descripcion}</p>
          <p className="text-xs text-gray-400 mt-0.5">{tarea.responsable}</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: prioMeta.bg, color: prioMeta.color }}>
          {prioMeta.label}
        </span>
        {diasInfo && (
          <span className="text-[10px] font-medium" style={{ color: diasInfo.color }}>{diasInfo.texto}</span>
        )}
        {tarea.origenReunionNumero && (
          <span className="text-[10px] text-gray-400">Reunion #{tarea.origenReunionNumero}</span>
        )}
      </div>

      {tarea.etiquetas.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tarea.etiquetas.map((e, i) => (
            <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{e}</span>
          ))}
        </div>
      )}

      {tarea.notas && <p className="text-xs text-gray-400 mb-2 leading-relaxed">{tarea.notas}</p>}

      <div className="flex items-center gap-1 pt-2 border-t border-gray-50">
        {estadoReal !== 'completada' && (
          <button onClick={() => onCambiarEstado('completada')} className="text-[11px] font-semibold px-2 py-1 rounded-lg text-green-600 hover:bg-green-50 transition-all">Completar</button>
        )}
        {estadoReal === 'completada' && (
          <button onClick={() => onCambiarEstado('pendiente')} className="text-[11px] font-semibold px-2 py-1 rounded-lg text-blue-600 hover:bg-blue-50 transition-all">Reabrir</button>
        )}
        {estadoReal === 'pendiente' && (
          <button onClick={() => onCambiarEstado('en_curso')} className="text-[11px] font-semibold px-2 py-1 rounded-lg text-teal-600 hover:bg-teal-50 transition-all">Iniciar</button>
        )}
        <button onClick={onEditar} className="text-[11px] font-semibold px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-50 transition-all">Editar</button>
        <button onClick={onEliminar} className="text-[11px] font-semibold px-2 py-1 rounded-lg text-red-400 hover:bg-red-50 transition-all ml-auto">Eliminar</button>
      </div>
    </div>
  );
}

export default function ModuloSeguimiento() {
  const router = useRouter();
  const [tareas, setTareas] = useState<TareaGestion[]>([]);
  const [vista, setVista] = useState<'lista' | 'form'>('lista');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoTarea | 'todas'>('todas');
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadTarea | 'todas'>('todas');
  const [importado, setImportado] = useState(false);

  useEffect(() => {
    const guardadas = storageFase3.getTareas();
    setTareas(guardadas);
  }, []);

  const guardarTareas = useCallback((ts: TareaGestion[]) => {
    setTareas(ts);
    storageFase3.setTareas(ts);
  }, []);

  const guardarTarea = (t: TareaGestion) => {
    const existe = tareas.findIndex(x => x.id === t.id);
    const nuevas = existe >= 0 ? tareas.map(x => x.id === t.id ? t : x) : [...tareas, t];
    guardarTareas(nuevas);
    setVista('lista');
    setEditandoId(null);
  };

  const eliminarTarea = (id: string) => {
    guardarTareas(tareas.filter(t => t.id !== id));
  };

  const cambiarEstado = (id: string, estado: EstadoTarea) => {
    const nuevas = tareas.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        estado,
        fechaCompletada: estado === 'completada' ? new Date().toISOString().split('T')[0] : undefined,
      };
    });
    guardarTareas(nuevas);
  };

  const importarDesdeReuniones = () => {
    const reuniones = storageFase2.getReuniones() as { id: string; numero: number; orden: { tareas: { id: string; descripcion: string; responsable: string; fechaVencimiento: string; completada: boolean }[] }[] }[];
    if (!reuniones || reuniones.length === 0) return;
    const importadas = importarTareasDeReuniones(reuniones);
    const idsExistentes = new Set(tareas.map(t => t.id));
    const nuevas = importadas.filter(t => !idsExistentes.has(t.id));
    if (nuevas.length > 0) {
      guardarTareas([...tareas, ...nuevas]);
    }
    setImportado(true);
    setTimeout(() => setImportado(false), 3000);
  };

  const stats = calcularEstadisticas(tareas);

  const tareasFiltradas = tareas
    .map(t => ({ ...t, estado: calcularEstado(t) }))
    .filter(t => filtroEstado === 'todas' || t.estado === filtroEstado)
    .filter(t => filtroPrioridad === 'todas' || t.prioridad === filtroPrioridad);

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.push('/')} className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12l7 7M5 12l7-7" /></svg>
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] text-white text-xs font-bold flex items-center justify-center">11</div>
          <span className="text-sm font-semibold text-gray-900">Seguimiento de tareas</span>
        </div>
        {vista === 'lista' && (
          <button onClick={() => { setEditandoId(null); setVista('form'); }} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#534AB7] text-white hover:bg-[#3C3489] transition-all">+ Nueva</button>
        )}
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 pb-10">
        {vista === 'form' ? (
          <FormTarea
            tareaInicial={editandoId ? tareas.find(t => t.id === editandoId) ?? null : null}
            onGuardar={guardarTarea}
            onCancelar={() => { setVista('lista'); setEditandoId(null); }}
          />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <p className="text-lg font-bold text-gray-900">{stats.cumplimientoPorcentaje}%</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Cumplimiento</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <p className="text-lg font-bold text-gray-900">{stats.tareasAbiertas}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Abiertas</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <p className="text-lg font-bold text-red-500">{stats.tareasVencidas}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Vencidas</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <p className="text-lg font-bold text-green-600">{stats.completadasEsteMes}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Este mes</p>
              </div>
            </div>

            {/* Importar */}
            <button onClick={importarDesdeReuniones} className="w-full mb-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-500 hover:border-[#534AB7] hover:text-[#534AB7] transition-all">
              {importado ? 'Tareas importadas correctamente' : 'Importar tareas desde reuniones'}
            </button>

            {/* Filtros */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              <select className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value as EstadoTarea | 'todas')}>
                <option value="todas">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_curso">En curso</option>
                <option value="completada">Completada</option>
                <option value="vencida">Vencida</option>
              </select>
              <select className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600" value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value as PrioridadTarea | 'todas')}>
                <option value="todas">Todas las prioridades</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            {/* Lista */}
            {tareasFiltradas.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-[#EEEDFE] mx-auto mb-4 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Sin tareas</h3>
                <p className="text-xs text-gray-400 mb-4">{tareas.length === 0 ? 'Crea tu primera tarea o importa desde reuniones.' : 'No hay tareas con los filtros seleccionados.'}</p>
                <button onClick={() => setVista('form')} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] text-white text-sm font-semibold hover:shadow-lg transition-all">
                  Crear tarea
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tareasFiltradas.map(t => (
                  <TareaCard
                    key={t.id}
                    tarea={t}
                    onEditar={() => { setEditandoId(t.id); setVista('form'); }}
                    onCambiarEstado={(e) => cambiarEstado(t.id, e)}
                    onEliminar={() => eliminarTarea(t.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
