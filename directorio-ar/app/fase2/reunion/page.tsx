'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TIPO_ITEM_META,
  crearReunion, calcularDuracion, generarActa, generarId,
} from '../../../lib/modulo8-reuniones';
import { storageFase2 } from '../../../lib/storage-fase2';
import { storage } from '../../../lib/storage';
import type { Reunion, ItemReunion, TareaReunion } from '../../../types/fase2';
import VotacionPanel from '../../../components/VotacionPanel';

const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-all";

function fmtTime(seg: number): string {
  const m = Math.floor(Math.abs(seg) / 60);
  const s = Math.abs(seg) % 60;
  return `${seg < 0 ? '-' : ''}${m}:${String(s).padStart(2, '0')}`;
}

function ModoEnVivo({ reunion, onActualizar, onSalir }: {
  reunion: Reunion;
  onActualizar: (u: Partial<Reunion>) => void;
  onSalir: () => void;
}) {
  const [itemIdx, setItemIdx] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [decision, setDecision] = useState('');
  const [nota, setNota] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const items = reunion.orden;
  const item = items[itemIdx];
  const limiteSeg = (item?.duracionMinutos ?? 0) * 60;
  const excedido = segundos > limiteSeg && limiteSeg > 0;

  useEffect(() => {
    setSegundos(0);
    setCorriendo(false);
    setDecision('');
    setNota('');
  }, [itemIdx]);

  useEffect(() => {
    if (corriendo) {
      intervalRef.current = setInterval(() => setSegundos(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [corriendo]);

  const completarItem = () => {
    const nuevaOrden = items.map((it, i) => {
      if (i !== itemIdx) return it;
      const decisiones = [...it.decisiones, ...(decision.trim() ? [decision.trim()] : [])];
      const notas = nota.trim() || it.notas;
      return { ...it, completado: true, decisiones, notas };
    });
    onActualizar({ orden: nuevaOrden });
    if (itemIdx < items.length - 1) setItemIdx(i => i + 1);
    else {
      onActualizar({ estado: 'finalizada', orden: nuevaOrden });
      onSalir();
    }
  };

  const agregarDecision = () => {
    if (!decision.trim()) return;
    const nuevaOrden = items.map((it, i) =>
      i === itemIdx ? { ...it, decisiones: [...it.decisiones, decision.trim()] } : it
    );
    onActualizar({ orden: nuevaOrden });
    setDecision('');
  };

  if (!item) return null;
  const meta = TIPO_ITEM_META[item.tipo];
  const progreso = limiteSeg > 0 ? Math.min(segundos / limiteSeg * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-white/70">Reunión en vivo · N° {reunion.numero}</span>
        </div>
        <button onClick={onSalir} className="text-xs text-white/50 hover:text-white/80 font-medium">Salir del modo en vivo</button>
      </div>

      <div className="flex gap-1 px-4 pt-4">
        {items.map((it, i) => (
          <div key={it.id} onClick={() => setItemIdx(i)}
            className={`flex-1 h-1 rounded-full cursor-pointer transition-all ${it.completado ? 'bg-green-500' : i === itemIdx ? 'bg-white' : 'bg-white/20'}`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col px-4 py-6">
        <div className="mb-1">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
        </div>
        <h2 className="text-xl font-semibold mt-2 mb-1">{item.titulo}</h2>
        <p className="text-sm text-white/50 mb-6 leading-relaxed">{item.descripcion}</p>
        <p className="text-xs text-white/40 mb-6">Responsable: {item.responsable}</p>

        <div className="bg-white/5 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-3xl font-mono font-bold ${excedido ? 'text-red-400' : 'text-white'}`}>
              {fmtTime(segundos)}
            </span>
            <span className="text-sm text-white/40">/ {item.duracionMinutos} min</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
            <div className={`h-full rounded-full transition-all ${excedido ? 'bg-red-500' : 'bg-[#7C6FDB]'}`} style={{ width: `${progreso}%` }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCorriendo(c => !c)}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition-all">
              {corriendo ? '⏸ Pausar' : '▶ Iniciar timer'}
            </button>
            <button onClick={() => { setSegundos(0); setCorriendo(false); }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm transition-all">↺</button>
          </div>
          {excedido && <p className="text-xs text-red-400 mt-2 text-center">Tiempo excedido por {fmtTime(segundos - limiteSeg)}</p>}
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Agregar decisión</p>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
              value={decision} onChange={e => setDecision(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarDecision()}
              placeholder="Se aprueba..."
            />
            <button onClick={agregarDecision} disabled={!decision.trim()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold disabled:opacity-30 transition-all">+</button>
          </div>
          {item.decisiones.length > 0 && (
            <div className="mt-2 space-y-1">
              {item.decisiones.map((d, i) => (
                <p key={i} className="text-xs text-white/60 bg-white/5 rounded-lg px-3 py-2">→ {d}</p>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Notas</p>
          <textarea
            className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
            rows={2} value={nota} onChange={e => setNota(e.target.value)} placeholder="Puntos tratados..."
          />
        </div>
      </div>

      <div className="px-4 pb-8">
        <button onClick={completarItem}
          className="w-full py-4 rounded-2xl bg-[#534AB7] hover:bg-[#3C3489] text-white font-bold text-sm transition-colors">
          {itemIdx < items.length - 1 ? `Completado → ${items[itemIdx + 1]?.titulo}` : 'Finalizar reunión'}
        </button>
        <p className="text-center text-xs text-white/30 mt-3">
          Ítem {itemIdx + 1} de {items.length} · {items.filter(i => i.completado).length} completados
        </p>
      </div>
    </div>
  );
}

function ListaReuniones({ reuniones, onNueva, onSeleccionar }: {
  reuniones: Reunion[]; onNueva: () => void; onSeleccionar: (id: string) => void;
}) {
  const estadoColor: Record<Reunion['estado'], string> = {
    planificada: 'bg-blue-50 text-blue-700', en_curso: 'bg-green-50 text-green-700',
    finalizada: 'bg-gray-100 text-gray-600', cancelada: 'bg-red-50 text-red-500',
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Reuniones</h2>
          <p className="text-xs text-gray-400 mt-0.5">{reuniones.length} registrada{reuniones.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={onNueva} className="px-4 py-2 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold rounded-xl">+ Nueva</button>
      </div>
      {reuniones.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-500">Sin reuniones</p>
          <p className="text-xs text-gray-400 mt-1">Creá la primera reunión del directorio</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...reuniones].sort((a, b) => b.numero - a.numero).map(r => (
            <button key={r.id} onClick={() => onSeleccionar(r.id)}
              className="w-full text-left bg-white rounded-2xl border border-gray-200 p-4 hover:border-[#534AB7]/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">Reunión N° {r.numero}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColor[r.estado]}`}>{r.estado}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{r.tipo}</span>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(r.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} · {r.hora} hs.</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.lugar} · {r.modalidad}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>{r.orden.filter(i => i.completado).length}/{r.orden.length} ítems</p>
                  <p>{calcularDuracion(r.orden)} min</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NuevaReunion({ numero, onCrear, onCancelar }: { numero: number; onCrear: (r: Reunion) => void; onCancelar: () => void }) {
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], hora: '09:00', lugar: '', modalidad: 'presencial' as Reunion['modalidad'], tipo: 'ordinaria' as Reunion['tipo'], soloObligatorios: false });
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Nueva reunión · N° {numero}</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Fecha</label><input type="date" className={inp} value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} /></div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Hora</label><input type="time" className={inp} value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))} /></div>
      </div>
      <div className="mb-3"><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Lugar</label><input className={inp} value={form.lugar} onChange={e => setForm(p => ({ ...p, lugar: e.target.value }))} placeholder="Oficinas / Zoom" /></div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Modalidad</label>
          <select className={`${inp} cursor-pointer`} value={form.modalidad} onChange={e => setForm(p => ({ ...p, modalidad: e.target.value as Reunion['modalidad'] }))}>
            <option value="presencial">Presencial</option><option value="virtual">Virtual</option><option value="hibrida">Híbrida</option>
          </select>
        </div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tipo</label>
          <select className={`${inp} cursor-pointer`} value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as Reunion['tipo'] }))}>
            <option value="ordinaria">Ordinaria</option><option value="extraordinaria">Extraordinaria</option>
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer mb-5">
        <input type="checkbox" checked={form.soloObligatorios} onChange={e => setForm(p => ({ ...p, soloObligatorios: e.target.checked }))} className="rounded border-gray-300 text-[#534AB7] w-4 h-4" />
        <span className="text-sm text-gray-600">Solo ítems obligatorios (~80 min)</span>
      </label>
      <div className="flex gap-3">
        <button onClick={onCancelar} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
        <button onClick={() => onCrear(crearReunion(numero, form.fecha, form.hora, form.lugar || 'A confirmar', form.modalidad, form.tipo, form.soloObligatorios))}
          className="flex-1 py-2.5 rounded-xl bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold">Crear</button>
      </div>
    </div>
  );
}

function DetalleReunion({ reunion, onActualizar, onVolver, onModoEnVivo, empresaNombre }: {
  reunion: Reunion; onActualizar: (u: Partial<Reunion>) => void;
  onVolver: () => void; onModoEnVivo: () => void; empresaNombre: string;
}) {
  const [tab, setTab] = useState<'orden' | 'asistentes' | 'votaciones' | 'acta'>('orden');
  const [itemAbierto, setItemAbierto] = useState<string | null>(null);
  const [actaModal, setActaModal] = useState(false);

  const actualizarItem = (id: string, u: Partial<ItemReunion>) =>
    onActualizar({ orden: reunion.orden.map(i => i.id === id ? { ...i, ...u } : i) });

  const agregarDecision = (id: string) => {
    const it = reunion.orden.find(i => i.id === id);
    if (it) actualizarItem(id, { decisiones: [...it.decisiones, ''] });
  };
  const updDecision = (id: string, idx: number, v: string) => {
    const it = reunion.orden.find(i => i.id === id);
    if (!it) return;
    const d = [...it.decisiones]; d[idx] = v;
    actualizarItem(id, { decisiones: d });
  };
  const agregarTarea = (id: string) => {
    const it = reunion.orden.find(i => i.id === id);
    if (it) actualizarItem(id, { tareas: [...it.tareas, { id: generarId(), descripcion: '', responsable: '', fechaVencimiento: '', completada: false }] });
  };
  const updTarea = (itemId: string, tareaId: string, u: Partial<TareaReunion>) => {
    const it = reunion.orden.find(i => i.id === itemId);
    if (!it) return;
    actualizarItem(itemId, { tareas: it.tareas.map(t => t.id === tareaId ? { ...t, ...u } : t) });
  };

  const completados = reunion.orden.filter(i => i.completado).length;
  const pct = reunion.orden.length > 0 ? Math.round(completados / reunion.orden.length * 100) : 0;

  return (
    <div>
      <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12l7 7M5 12l7-7" /></svg>
        Reuniones
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Reunión N° {reunion.numero} · {reunion.tipo}</p>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(reunion.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} · {reunion.hora} hs.</p>
            <p className="text-xs text-gray-400">{reunion.lugar} · {reunion.modalidad}</p>
          </div>
          <select className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-600 cursor-pointer" value={reunion.estado}
            onChange={e => onActualizar({ estado: e.target.value as Reunion['estado'] })}>
            <option value="planificada">Planificada</option><option value="en_curso">En curso</option>
            <option value="finalizada">Finalizada</option><option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span>{completados}/{reunion.orden.length} ítems · {pct}%</span>
          <span>{calcularDuracion(reunion.orden)} min est.</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <button onClick={onModoEnVivo}
          className="w-full py-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          Iniciar modo en vivo
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        {(['orden', 'asistentes', 'votaciones', 'acta'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'orden' ? 'Orden del día' : t === 'asistentes' ? 'Asistentes' : t === 'votaciones' ? 'Votaciones' : 'Acta'}
          </button>
        ))}
      </div>

      {tab === 'orden' && (
        <div className="space-y-2">
          {reunion.orden.map((item, idx) => {
            const meta = TIPO_ITEM_META[item.tipo];
            const abierto = itemAbierto === item.id;
            return (
              <div key={item.id} className={`bg-white rounded-2xl border transition-all ${item.completado ? 'border-gray-100 opacity-60' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 p-4">
                  <span className="text-xs text-gray-400 w-5 text-center shrink-0">{idx + 1}</span>
                  <input type="checkbox" checked={item.completado} onChange={e => actualizarItem(item.id, { completado: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-[#534AB7] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                    <p className={`text-sm font-medium mt-1 ${item.completado ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.titulo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.responsable} · {item.duracionMinutos} min</p>
                  </div>
                  <button onClick={() => setItemAbierto(abierto ? null : item.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={abierto ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
                    </svg>
                  </button>
                </div>
                {abierto && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">{item.descripcion}</p>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notas</label>
                      <textarea className={`${inp} resize-none text-xs`} rows={2} value={item.notas} onChange={e => actualizarItem(item.id, { notas: e.target.value })} placeholder="Puntos tratados..." />
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Decisiones</label>
                        <button onClick={() => agregarDecision(item.id)} className="text-xs text-[#534AB7] font-medium">+ Agregar</button>
                      </div>
                      {item.decisiones.map((d, di) => (
                        <input key={di} className={`${inp} text-xs mb-2`} value={d} onChange={e => updDecision(item.id, di, e.target.value)} placeholder={`Decisión ${di + 1}...`} />
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tareas</label>
                        <button onClick={() => agregarTarea(item.id)} className="text-xs text-[#534AB7] font-medium">+ Tarea</button>
                      </div>
                      {item.tareas.map(t => (
                        <div key={t.id} className="bg-gray-50 rounded-xl p-3 mb-2">
                          <input className={`${inp} text-xs mb-2`} value={t.descripcion} onChange={e => updTarea(item.id, t.id, { descripcion: e.target.value })} placeholder="Descripción..." />
                          <div className="grid grid-cols-2 gap-2">
                            <input className={`${inp} text-xs`} value={t.responsable} onChange={e => updTarea(item.id, t.id, { responsable: e.target.value })} placeholder="Responsable" />
                            <input type="date" className={`${inp} text-xs`} value={t.fechaVencimiento} onChange={e => updTarea(item.id, t.id, { fechaVencimiento: e.target.value })} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'asistentes' && (
        <div>
          <div className="flex justify-between mb-4">
            <p className="text-sm text-gray-600">{reunion.asistentes.filter(a => a.presente).length}/{reunion.asistentes.length} presentes</p>
            <button onClick={() => onActualizar({ asistentes: [...reunion.asistentes, { nombre: '', cargo: '', presente: true }] })}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#534AB7] text-[#534AB7] hover:bg-[#EEEDFE] font-medium">+ Agregar</button>
          </div>
          {reunion.asistentes.map((a, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 mb-2">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input className={`${inp} text-xs`} value={a.nombre} onChange={e => { const u = [...reunion.asistentes]; u[i] = { ...a, nombre: e.target.value }; onActualizar({ asistentes: u }); }} placeholder="Nombre" />
                <input className={`${inp} text-xs`} value={a.cargo} onChange={e => { const u = [...reunion.asistentes]; u[i] = { ...a, cargo: e.target.value }; onActualizar({ asistentes: u }); }} placeholder="Cargo" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={a.presente} onChange={e => { const u = [...reunion.asistentes]; u[i] = { ...a, presente: e.target.checked }; onActualizar({ asistentes: u }); }} className="rounded border-gray-300 text-[#534AB7]" />
                <span className="text-xs text-gray-600">Presente</span>
              </label>
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer bg-white rounded-xl border border-gray-200 p-3 mt-3">
            <input type="checkbox" checked={reunion.quorumAlcanzado} onChange={e => onActualizar({ quorumAlcanzado: e.target.checked })} className="rounded border-gray-300 text-[#534AB7]" />
            <span className="text-sm font-medium text-gray-700">Quórum alcanzado</span>
          </label>
        </div>
      )}

      {tab === 'votaciones' && (
        <VotacionPanel
          reunionId={reunion.id}
          directores={reunion.asistentes.filter(a => a.presente).map(a => a.nombre)}
          totalDirectores={reunion.asistentes.length}
        />
      )}

      {tab === 'acta' && (
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Observaciones generales</label>
              <textarea className={`${inp} resize-none`} rows={2} value={reunion.observacionesGenerales} onChange={e => onActualizar({ observacionesGenerales: e.target.value })} placeholder="Puntos adicionales para el acta..." />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Próxima reunión</label>
              <input type="date" className={inp} value={reunion.fechaProximaReunion ?? ''} onChange={e => onActualizar({ fechaProximaReunion: e.target.value })} />
            </div>
            <button onClick={() => setActaModal(true)} className="w-full py-3 rounded-xl bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold">Generar acta</button>
          </div>
        </div>
      )}

      {actaModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Acta N° {reunion.numero}</h3>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(generarActa(reunion, empresaNombre))} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium">Copiar</button>
                <button onClick={() => setActaModal(false)} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-medium">Cerrar</button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto p-5 text-xs font-mono text-gray-700 whitespace-pre-wrap leading-relaxed">{generarActa(reunion, empresaNombre)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ModuloReuniones() {
  const router = useRouter();
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [vista, setVista] = useState<'lista' | 'nueva' | 'detalle' | 'vivo'>('lista');
  const [activa, setActiva] = useState<string | null>(null);
  const empresaNombre = storage.getEmpresaNombre() ?? 'Mi Empresa';

  useEffect(() => { setReuniones(storageFase2.getReuniones()); }, []);

  const guardar = (nuevas: Reunion[]) => { setReuniones(nuevas); storageFase2.setReuniones(nuevas); };
  const agregar = (r: Reunion) => { guardar([...reuniones, r]); setActiva(r.id); setVista('detalle'); };
  const actualizar = useCallback((updates: Partial<Reunion>) => {
    if (!activa) return;
    setReuniones(prev => {
      const nuevas = prev.map(r => r.id === activa ? { ...r, ...updates } : r);
      storageFase2.setReuniones(nuevas);
      return nuevas;
    });
  }, [activa]);

  const reunion = reuniones.find(r => r.id === activa) ?? null;

  if (vista === 'vivo' && reunion) {
    return <ModoEnVivo reunion={reunion} onActualizar={actualizar} onSalir={() => setVista('detalle')} />;
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="h-1 w-full bg-gray-100">
        <div className="h-full bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] w-2/4" />
      </div>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => { if (vista !== 'lista') { setVista('lista'); setActiva(null); } else router.push('/'); }}
          className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12l7 7M5 12l7-7" /></svg>
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] text-white text-xs font-bold flex items-center justify-center">8</div>
          <span className="text-sm font-semibold text-gray-900">Reuniones del directorio</span>
        </div>
        <span className="text-xs text-gray-400">Fase 2</span>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        {vista === 'lista' && <ListaReuniones reuniones={reuniones} onNueva={() => setVista('nueva')} onSeleccionar={id => { setActiva(id); setVista('detalle'); }} />}
        {vista === 'nueva' && <NuevaReunion numero={reuniones.length + 1} onCrear={agregar} onCancelar={() => setVista('lista')} />}
        {vista === 'detalle' && reunion && (
          <DetalleReunion reunion={reunion} onActualizar={actualizar} onVolver={() => { setVista('lista'); setActiva(null); }} onModoEnVivo={() => setVista('vivo')} empresaNombre={empresaNombre} />
        )}
      </main>
    </div>
  );
}
