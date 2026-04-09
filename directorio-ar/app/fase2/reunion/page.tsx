'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  crearReunionDesdePlantilla,
  calcularDuracionEstimada,
  generarActaReunion,
  calcularEstadisticasReuniones,
  TIPO_ITEM_META,
  generarId,
} from '../../../lib/modulo8-reuniones';
import { storageFase2 } from '../../../lib/storage-fase2';
import { storage } from '../../../lib/storage';
import type { Reunion, ItemReunion, TareaReunion, AsistenteReunion } from '../../../types/fase2';

// ——— Helpers ———————————————————————————————————————————————————————————————

function formatFecha(fecha: string): string {
  try {
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return fecha;
  }
}

const ESTADO_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  planificada: { label: 'Planificada', color: '#185FA5', bg: '#E6F1FB' },
  en_curso: { label: 'En curso', color: '#085041', bg: '#E1F5EE' },
  finalizada: { label: 'Finalizada', color: '#5F5E5A', bg: '#F1EFE8' },
  cancelada: { label: 'Cancelada', color: '#991B1B', bg: '#FEE2E2' },
};

const MODALIDAD_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrida: 'Hibrida',
};

// ——— Main Page Component ——————————————————————————————————————————————————

export default function ReunionPage() {
  const router = useRouter();

  const [vista, setVista] = useState<'lista' | 'nueva' | 'detalle'>('lista');
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [reunionActual, setReunionActual] = useState<Reunion | null>(null);
  const [empresaNombre, setEmpresaNombre] = useState('');

  // Nueva reunion form
  const [formFecha, setFormFecha] = useState('');
  const [formHora, setFormHora] = useState('09:00');
  const [formLugar, setFormLugar] = useState('');
  const [formModalidad, setFormModalidad] = useState<Reunion['modalidad']>('presencial');
  const [formTipo, setFormTipo] = useState<Reunion['tipo']>('ordinaria');
  const [formOpcionales, setFormOpcionales] = useState(false);

  // Detalle tabs
  const [tabActiva, setTabActiva] = useState<'orden' | 'asistentes' | 'acta'>('orden');
  const [itemExpandido, setItemExpandido] = useState<string | null>(null);

  // Acta
  const [actaTexto, setActaTexto] = useState('');
  const [actaCopiada, setActaCopiada] = useState(false);

  // Nuevo asistente form
  const [nuevoAsistenteNombre, setNuevoAsistenteNombre] = useState('');
  const [nuevoAsistenteCargo, setNuevoAsistenteCargo] = useState('');

  // Load data
  useEffect(() => {
    setReuniones(storageFase2.getReuniones());
    setEmpresaNombre(storage.getEmpresaNombre() ?? 'Mi Empresa');
  }, []);

  // ——— Auto-save helper ————————————————————————————————————————————————————

  function guardarReunion(updated: Reunion) {
    storageFase2.updateReunion(updated.id, updated);
    setReunionActual(updated);
    setReuniones(prev => prev.map(r => (r.id === updated.id ? updated : r)));
  }

  // ——— Crear reunion ———————————————————————————————————————————————————————

  function handleCrear() {
    if (!formFecha || !formLugar) return;
    const numero = reuniones.length + 1;
    const nueva = crearReunionDesdePlantilla(
      numero,
      formFecha,
      formHora,
      formLugar,
      formModalidad,
      formTipo,
      formOpcionales,
    );
    storageFase2.addReunion(nueva);
    const updated = [...reuniones, nueva];
    setReuniones(updated);
    setReunionActual(nueva);
    setVista('detalle');
    setTabActiva('orden');
    setActaTexto('');
    // Reset form
    setFormFecha('');
    setFormHora('09:00');
    setFormLugar('');
    setFormModalidad('presencial');
    setFormTipo('ordinaria');
    setFormOpcionales(false);
  }

  // ——— Item handlers ——————————————————————————————————————————————————————

  function updateItem(itemId: string, changes: Partial<ItemReunion>) {
    if (!reunionActual) return;
    const updatedOrden = reunionActual.orden.map(item =>
      item.id === itemId ? { ...item, ...changes } : item,
    );
    guardarReunion({ ...reunionActual, orden: updatedOrden });
  }

  function addDecision(itemId: string, decision: string) {
    if (!reunionActual || !decision.trim()) return;
    const item = reunionActual.orden.find(i => i.id === itemId);
    if (!item) return;
    updateItem(itemId, { decisiones: [...item.decisiones, decision.trim()] });
  }

  function removeDecision(itemId: string, index: number) {
    if (!reunionActual) return;
    const item = reunionActual.orden.find(i => i.id === itemId);
    if (!item) return;
    updateItem(itemId, { decisiones: item.decisiones.filter((_, i) => i !== index) });
  }

  function addTarea(itemId: string, descripcion: string, responsable: string, fechaVencimiento: string) {
    if (!reunionActual || !descripcion.trim()) return;
    const item = reunionActual.orden.find(i => i.id === itemId);
    if (!item) return;
    const tarea: TareaReunion = {
      id: generarId(),
      descripcion: descripcion.trim(),
      responsable: responsable.trim(),
      fechaVencimiento,
      completada: false,
    };
    updateItem(itemId, { tareas: [...item.tareas, tarea] });
  }

  function removeTarea(itemId: string, tareaId: string) {
    if (!reunionActual) return;
    const item = reunionActual.orden.find(i => i.id === itemId);
    if (!item) return;
    updateItem(itemId, { tareas: item.tareas.filter(t => t.id !== tareaId) });
  }

  // ——— Asistentes handlers ————————————————————————————————————————————————

  function addAsistente() {
    if (!reunionActual || !nuevoAsistenteNombre.trim()) return;
    const asistente: AsistenteReunion = {
      nombre: nuevoAsistenteNombre.trim(),
      cargo: nuevoAsistenteCargo.trim(),
      presente: true,
    };
    const updated = { ...reunionActual, asistentes: [...reunionActual.asistentes, asistente] };
    guardarReunion(updated);
    setNuevoAsistenteNombre('');
    setNuevoAsistenteCargo('');
  }

  function togglePresente(index: number) {
    if (!reunionActual) return;
    const asistentes = reunionActual.asistentes.map((a, i) =>
      i === index ? { ...a, presente: !a.presente } : a,
    );
    guardarReunion({ ...reunionActual, asistentes });
  }

  function updateExcusa(index: number, excusa: string) {
    if (!reunionActual) return;
    const asistentes = reunionActual.asistentes.map((a, i) =>
      i === index ? { ...a, excusa } : a,
    );
    guardarReunion({ ...reunionActual, asistentes });
  }

  // ——— Acta ———————————————————————————————————————————————————————————————

  function handleGenerarActa() {
    if (!reunionActual) return;
    const texto = generarActaReunion(reunionActual, empresaNombre);
    setActaTexto(texto);
  }

  async function handleCopiarActa() {
    try {
      await navigator.clipboard.writeText(actaTexto);
      setActaCopiada(true);
      setTimeout(() => setActaCopiada(false), 2000);
    } catch {
      // fallback
    }
  }

  // ——— Stats ——————————————————————————————————————————————————————————————

  const stats = calcularEstadisticasReuniones(reuniones);
  const reunionesOrdenadas = [...reuniones].sort((a, b) => b.fecha.localeCompare(a.fecha));

  // ——— Quorum calculation ————————————————————————————————————————————————

  function getQuorumInfo(reunion: Reunion) {
    const total = reunion.asistentes.length;
    const presentes = reunion.asistentes.filter(a => a.presente).length;
    const quorumMinimo = total > 0 ? Math.ceil(total / 2) + (total % 2 === 0 ? 1 : 0) : 0;
    const alcanzado = total > 0 && presentes >= quorumMinimo;
    return { total, presentes, quorumMinimo, alcanzado };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Gradient top bar */}
      <div className="h-2 bg-gradient-to-r from-[#534AB7] via-[#7C6FD0] to-[#534AB7]" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (vista === 'detalle') {
                setVista('lista');
                setReunionActual(null);
                setActaTexto('');
              } else if (vista === 'nueva') {
                setVista('lista');
              } else {
                router.push('/');
              }
            }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#534AB7] transition-colors mb-4"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {vista === 'lista' ? 'Volver al inicio' : 'Volver a reuniones'}
          </button>
          <h1 className="text-2xl font-bold text-[#1A1D26]">
            {vista === 'lista' && 'Reuniones del Directorio'}
            {vista === 'nueva' && 'Nueva reunion'}
            {vista === 'detalle' && reunionActual && `Reunion N.${reunionActual.numero}`}
          </h1>
          {vista === 'detalle' && reunionActual && (
            <p className="text-sm text-gray-500 mt-1">
              {formatFecha(reunionActual.fecha)} - {reunionActual.hora} hs. | {MODALIDAD_LABELS[reunionActual.modalidad]} | {reunionActual.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'}
            </p>
          )}
        </div>

        {/* ═══ VISTA: LISTA ═══════════════════════════════════════════════ */}
        {vista === 'lista' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">Total reuniones</p>
                <p className="text-3xl font-bold text-[#1A1D26]">{stats.totalReuniones}</p>
              </div>
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">Tareas abiertas</p>
                <p className="text-3xl font-bold text-[#1A1D26]">{stats.tareasAbiertas.length}</p>
              </div>
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">Asistencia promedio</p>
                <p className="text-3xl font-bold text-[#1A1D26]">{stats.asistenciaPromedio}%</p>
              </div>
            </div>

            {/* Nueva reunion button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setVista('nueva')}
                className="bg-[#534AB7] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#443E99] transition-colors shadow-sm"
              >
                + Nueva reunion
              </button>
            </div>

            {/* List */}
            {reunionesOrdenadas.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-[#F3F0FF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#534AB7" strokeWidth="1.5" />
                    <path d="M16 2V6M8 2V6M3 10H21" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#1A1D26] mb-2">Sin reuniones todavia</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Crea tu primera reunion de directorio para comenzar a registrar ordenes del dia, asistentes y actas.
                </p>
                <button
                  onClick={() => setVista('nueva')}
                  className="bg-[#534AB7] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#443E99] transition-colors"
                >
                  Crear primera reunion
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {reunionesOrdenadas.map(reunion => {
                  const estado = ESTADO_LABELS[reunion.estado] ?? ESTADO_LABELS.planificada;
                  return (
                    <button
                      key={reunion.id}
                      onClick={() => {
                        setReunionActual(reunion);
                        setVista('detalle');
                        setTabActiva('orden');
                        setActaTexto('');
                      }}
                      className="w-full text-left bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5 hover:border-[#534AB7] hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="font-semibold text-[#1A1D26]">
                              Reunion N.{reunion.numero}
                            </span>
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ color: estado.color, backgroundColor: estado.bg }}
                            >
                              {estado.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span>{formatFecha(reunion.fecha)}</span>
                            <span>{reunion.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'}</span>
                            <span>{MODALIDAD_LABELS[reunion.modalidad]}</span>
                            <span>{reunion.asistentes.length} asistentes</span>
                          </div>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="text-gray-400 mt-1 flex-shrink-0">
                          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ═══ VISTA: NUEVA ═══════════════════════════════════════════════ */}
        {vista === 'nueva' && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6">
            <div className="space-y-5">
              {/* Fecha + Hora */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1D26] mb-1.5">Fecha</label>
                  <input
                    type="date"
                    value={formFecha}
                    onChange={e => setFormFecha(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1D26] focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1D26] mb-1.5">Hora</label>
                  <input
                    type="time"
                    value={formHora}
                    onChange={e => setFormHora(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1D26] focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
                  />
                </div>
              </div>

              {/* Lugar */}
              <div>
                <label className="block text-sm font-medium text-[#1A1D26] mb-1.5">Lugar</label>
                <input
                  type="text"
                  value={formLugar}
                  onChange={e => setFormLugar(e.target.value)}
                  placeholder="Ej: Oficina central, Sala de directorio, Link de Zoom..."
                  className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1D26] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
                />
              </div>

              {/* Modalidad + Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1D26] mb-1.5">Modalidad</label>
                  <select
                    value={formModalidad}
                    onChange={e => setFormModalidad(e.target.value as Reunion['modalidad'])}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1D26] bg-white focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="hibrida">Hibrida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1D26] mb-1.5">Tipo</label>
                  <select
                    value={formTipo}
                    onChange={e => setFormTipo(e.target.value as Reunion['tipo'])}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1D26] bg-white focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
                  >
                    <option value="ordinaria">Ordinaria</option>
                    <option value="extraordinaria">Extraordinaria</option>
                  </select>
                </div>
              </div>

              {/* Opcionales */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formOpcionales}
                  onChange={e => setFormOpcionales(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#534AB7] focus:ring-[#534AB7]"
                />
                <span className="text-sm text-[#1A1D26]">Incluir temas opcionales en el orden del dia</span>
              </label>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleCrear}
                  disabled={!formFecha || !formLugar}
                  className="bg-[#534AB7] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#443E99] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Crear reunion
                </button>
                <button
                  onClick={() => setVista('lista')}
                  className="text-sm text-gray-500 hover:text-[#1A1D26] transition-colors px-4 py-2.5"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ VISTA: DETALLE ═════════════════════════════════════════════ */}
        {vista === 'detalle' && reunionActual && (
          <>
            {/* Estado selector */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-gray-500">Estado:</span>
              <select
                value={reunionActual.estado}
                onChange={e => {
                  const nuevoEstado = e.target.value as Reunion['estado'];
                  guardarReunion({ ...reunionActual, estado: nuevoEstado });
                }}
                className="border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-sm text-[#1A1D26] bg-white focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]"
              >
                <option value="planificada">Planificada</option>
                <option value="en_curso">En curso</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {/* Tabs */}
            <div className="border-b border-[#E5E7EB] mb-6">
              <div className="flex gap-6">
                {([
                  { key: 'orden' as const, label: 'Orden del dia' },
                  { key: 'asistentes' as const, label: 'Asistentes' },
                  { key: 'acta' as const, label: 'Acta' },
                ]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setTabActiva(tab.key)}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                      tabActiva === tab.key
                        ? 'border-[#534AB7] text-[#534AB7]'
                        : 'border-transparent text-gray-500 hover:text-[#1A1D26]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ——— TAB: ORDEN DEL DIA ——————————————————————————————————— */}
            {tabActiva === 'orden' && (
              <div>
                {/* Duration bar */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-4 mb-6 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Duracion estimada total</span>
                  <span className="text-sm font-semibold text-[#1A1D26]">
                    {calcularDuracionEstimada(reunionActual.orden)} minutos
                  </span>
                </div>

                <div className="space-y-3">
                  {reunionActual.orden.map(item => {
                    const meta = TIPO_ITEM_META[item.tipo];
                    const isExpanded = itemExpandido === item.id;
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden transition-all"
                      >
                        {/* Header row */}
                        <button
                          onClick={() => setItemExpandido(isExpanded ? null : item.id)}
                          className="w-full text-left px-5 py-4 flex items-center gap-3"
                        >
                          {/* Completado checkbox */}
                          <input
                            type="checkbox"
                            checked={item.completado}
                            onClick={e => e.stopPropagation()}
                            onChange={e => {
                              e.stopPropagation();
                              updateItem(item.id, { completado: !item.completado });
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-[#534AB7] focus:ring-[#534AB7] flex-shrink-0"
                          />
                          {/* Badge */}
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ color: meta.color, backgroundColor: meta.bg }}
                          >
                            {meta.label}
                          </span>
                          {/* Title + meta */}
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm font-medium ${item.completado ? 'line-through text-gray-400' : 'text-[#1A1D26]'}`}>
                              {item.titulo}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-xs text-gray-400">{item.duracionMinutos} min</span>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            >
                              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="px-5 pb-5 border-t border-[#E5E7EB]">
                            <div className="pt-4 space-y-4">
                              {/* Responsable */}
                              <p className="text-xs text-gray-500">
                                Responsable: <span className="font-medium text-[#1A1D26]">{item.responsable}</span>
                              </p>

                              {/* Descripcion */}
                              {item.descripcion && (
                                <div className="text-sm text-gray-600 whitespace-pre-line bg-[#FAFBFC] rounded-xl p-3">
                                  {item.descripcion}
                                </div>
                              )}

                              {/* Notas */}
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Notas</label>
                                <textarea
                                  value={item.notas}
                                  onChange={e => updateItem(item.id, { notas: e.target.value })}
                                  rows={3}
                                  placeholder="Agregar notas sobre este tema..."
                                  className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1D26] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors resize-none"
                                />
                              </div>

                              {/* Decisiones */}
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Decisiones</label>
                                {item.decisiones.length > 0 && (
                                  <ul className="space-y-1.5 mb-2">
                                    {item.decisiones.map((dec, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm text-[#1A1D26] bg-[#FAFBFC] rounded-lg px-3 py-2">
                                        <span className="text-[#534AB7] mt-0.5 flex-shrink-0">-</span>
                                        <span className="flex-1">{dec}</span>
                                        <button
                                          onClick={() => removeDecision(item.id, idx)}
                                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                          title="Eliminar"
                                        >
                                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                          </svg>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <DecisionInput onAdd={(d) => addDecision(item.id, d)} />
                              </div>

                              {/* Tareas */}
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Tareas</label>
                                {item.tareas.length > 0 && (
                                  <ul className="space-y-2 mb-2">
                                    {item.tareas.map(tarea => (
                                      <li key={tarea.id} className="flex items-start gap-2 text-sm bg-[#FAFBFC] rounded-lg px-3 py-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[#1A1D26] font-medium">{tarea.descripcion}</p>
                                          <p className="text-xs text-gray-500">
                                            {tarea.responsable}{tarea.fechaVencimiento ? ` | Vence: ${formatFecha(tarea.fechaVencimiento)}` : ''}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => removeTarea(item.id, tarea.id)}
                                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                                          title="Eliminar tarea"
                                        >
                                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                          </svg>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <TareaInput onAdd={(d, r, f) => addTarea(item.id, d, r, f)} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ——— TAB: ASISTENTES ————————————————————————————————————— */}
            {tabActiva === 'asistentes' && (
              <div>
                {/* Quorum status */}
                {(() => {
                  const q = getQuorumInfo(reunionActual);
                  return (
                    <div className={`rounded-2xl border p-4 mb-6 ${
                      q.total === 0
                        ? 'bg-[#FAFBFC] border-[#E5E7EB]'
                        : q.alcanzado
                          ? 'bg-[#E1F5EE] border-[#A7E8D0]'
                          : 'bg-[#FEE2E2] border-[#FECACA]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#1A1D26]">
                            {q.total === 0 ? 'Sin asistentes registrados' : q.alcanzado ? 'Quorum alcanzado' : 'Quorum no alcanzado'}
                          </p>
                          {q.total > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {q.presentes} de {q.total} presentes (minimo requerido: {q.quorumMinimo})
                            </p>
                          )}
                        </div>
                        {q.total > 0 && (
                          <span className={`text-2xl font-bold ${q.alcanzado ? 'text-[#085041]' : 'text-[#991B1B]'}`}>
                            {q.presentes}/{q.total}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Asistentes list */}
                {reunionActual.asistentes.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {reunionActual.asistentes.map((asistente, idx) => (
                      <div key={idx} className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={asistente.presente}
                            onChange={() => togglePresente(idx)}
                            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#534AB7] focus:ring-[#534AB7]"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1A1D26]">{asistente.nombre}</p>
                            {asistente.cargo && (
                              <p className="text-xs text-gray-500">{asistente.cargo}</p>
                            )}
                            <span className={`inline-block text-xs mt-1 px-2 py-0.5 rounded-full ${
                              asistente.presente
                                ? 'bg-[#E1F5EE] text-[#085041]'
                                : 'bg-[#FEE2E2] text-[#991B1B]'
                            }`}>
                              {asistente.presente ? 'Presente' : 'Ausente'}
                            </span>
                            {!asistente.presente && (
                              <div className="mt-2">
                                <input
                                  type="text"
                                  value={asistente.excusa ?? ''}
                                  onChange={e => updateExcusa(idx, e.target.value)}
                                  placeholder="Motivo de ausencia..."
                                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs text-[#1A1D26] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add asistente */}
                <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-[#1A1D26] mb-3">Agregar asistente</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={nuevoAsistenteNombre}
                      onChange={e => setNuevoAsistenteNombre(e.target.value)}
                      placeholder="Nombre completo"
                      className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1D26] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
                    />
                    <input
                      type="text"
                      value={nuevoAsistenteCargo}
                      onChange={e => setNuevoAsistenteCargo(e.target.value)}
                      placeholder="Cargo"
                      className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1D26] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
                    />
                  </div>
                  <button
                    onClick={addAsistente}
                    disabled={!nuevoAsistenteNombre.trim()}
                    className="bg-[#534AB7] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#443E99] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {/* ——— TAB: ACTA ——————————————————————————————————————————— */}
            {tabActiva === 'acta' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={handleGenerarActa}
                    className="bg-[#534AB7] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#443E99] transition-colors shadow-sm"
                  >
                    Generar acta
                  </button>
                  {actaTexto && (
                    <button
                      onClick={handleCopiarActa}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                        actaCopiada
                          ? 'bg-[#E1F5EE] border-[#A7E8D0] text-[#085041]'
                          : 'bg-white border-[#E5E7EB] text-[#1A1D26] hover:border-[#534AB7]'
                      }`}
                    >
                      {actaCopiada ? 'Copiado' : 'Copiar al portapapeles'}
                    </button>
                  )}
                </div>

                {actaTexto ? (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6">
                    <pre className="text-sm text-[#1A1D26] font-mono whitespace-pre-wrap leading-relaxed">
                      {actaTexto}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-12 text-center">
                    <p className="text-sm text-gray-500">
                      Presiona &quot;Generar acta&quot; para crear el documento formal de la reunion.
                      <br />
                      <span className="text-xs text-gray-400 mt-1 block">
                        El acta se genera a partir del orden del dia, asistentes y decisiones registradas.
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ——— Sub-components ——————————————————————————————————————————————————————

function DecisionInput({ onAdd }: { onAdd: (decision: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && value.trim()) {
            onAdd(value);
            setValue('');
          }
        }}
        placeholder="Agregar decision..."
        className="flex-1 border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-sm text-[#1A1D26] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
      />
      <button
        onClick={() => {
          if (value.trim()) {
            onAdd(value);
            setValue('');
          }
        }}
        disabled={!value.trim()}
        className="bg-[#534AB7] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#443E99] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Agregar
      </button>
    </div>
  );
}

function TareaInput({ onAdd }: { onAdd: (desc: string, resp: string, fecha: string) => void }) {
  const [desc, setDesc] = useState('');
  const [resp, setResp] = useState('');
  const [fecha, setFecha] = useState('');
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-[#534AB7] hover:text-[#443E99] font-medium transition-colors"
      >
        + Agregar tarea
      </button>
    );
  }

  return (
    <div className="space-y-2 bg-[#FAFBFC] rounded-xl p-3">
      <input
        type="text"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="Descripcion de la tarea"
        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={resp}
          onChange={e => setResp(e.target.value)}
          placeholder="Responsable"
          className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
        />
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-colors"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (desc.trim()) {
              onAdd(desc, resp, fecha);
              setDesc('');
              setResp('');
              setFecha('');
              setOpen(false);
            }
          }}
          disabled={!desc.trim()}
          className="bg-[#534AB7] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#443E99] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Agregar tarea
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setDesc('');
            setResp('');
            setFecha('');
          }}
          className="text-sm text-gray-500 hover:text-[#1A1D26] transition-colors px-3 py-1.5"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
