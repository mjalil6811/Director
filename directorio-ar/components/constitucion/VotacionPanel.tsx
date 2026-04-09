'use client';

import { useState, useEffect } from 'react';
import {
  VOTO_META, MAYORIA_META,
  crearVotacion, abrirVotacion, cerrarVotacion,
  registrarVoto, generarTextoVotacion, calcularResultado,
  storageVotaciones, generarId,
} from '../../lib/constitucion/modulo-votacion';
import type { Votacion, TipoVoto, TipoMayoria } from '../../types/fase2';

// ——— Props ——————————————————————————————————————————————————————————————————

interface VotacionPanelProps {
  reunionId: string;
  directores: string[];
  totalDirectores: number;
}

const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-all";

// ——— Formulario nueva votación ——————————————————————————————————————————————

function FormVotacion({ reunionId, onCrear, onCancelar }: {
  reunionId: string; onCrear: (v: Votacion) => void; onCancelar: () => void;
}) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoMayoria, setTipoMayoria] = useState<TipoMayoria>('simple');
  const [quorum, setQuorum] = useState(50);

  const valida = titulo.trim().length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-4">Nueva votación</h4>

      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Qué se vota *</label>
        <input className={inp} value={titulo} onChange={e => setTitulo(e.target.value)}
          placeholder="Ej: Aprobación del presupuesto 2026" />
      </div>

      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Descripción</label>
        <textarea className={`${inp} resize-none`} rows={2} value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Detalle de la propuesta o moción a votar..." />
      </div>

      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Mayoría requerida</label>
        <div className="space-y-2">
          {(Object.keys(MAYORIA_META) as TipoMayoria[]).map(tipo => (
            <button key={tipo} type="button" onClick={() => setTipoMayoria(tipo)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${tipoMayoria === tipo ? 'border-[#534AB7] bg-[#EEEDFE]/60' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all ${tipoMayoria === tipo ? 'border-[#534AB7] bg-[#534AB7]' : 'border-gray-300'}`}>
                  {tipoMayoria === tipo && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${tipoMayoria === tipo ? 'text-[#3C3489]' : 'text-gray-700'}`}>{MAYORIA_META[tipo].label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{MAYORIA_META[tipo].descripcion}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Quórum mínimo para validez</label>
        <select className={`${inp} cursor-pointer`} value={quorum} onChange={e => setQuorum(parseInt(e.target.value))}>
          <option value={50}>50% de los directores</option>
          <option value={67}>67% de los directores</option>
          <option value={75}>75% de los directores</option>
          <option value={100}>Todos los directores</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancelar} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
        <button onClick={() => onCrear(crearVotacion(reunionId, titulo.trim(), descripcion.trim(), tipoMayoria, undefined, quorum))}
          disabled={!valida}
          className="flex-1 py-2.5 rounded-xl bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold disabled:opacity-40">
          Crear votación
        </button>
      </div>
    </div>
  );
}

// ——— Tarjeta de votación activa / abierta ————————————————————————————————————

function VotacionActiva({ votacion, directores, totalDirectores, onActualizar }: {
  votacion: Votacion;
  directores: string[];
  totalDirectores: number;
  onActualizar: (v: Votacion) => void;
}) {
  const [directorActivo, setDirectorActivo] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');

  const votar = (director: string, voto: TipoVoto) => {
    const actualizada = registrarVoto(votacion, director, voto, comentario.trim() || undefined);
    onActualizar(actualizada);
    setComentario('');
    setDirectorActivo(null);
  };

  const getVotoDirector = (nombre: string) => votacion.votos.find(v => v.directorNombre === nombre);
  const votosRegistrados = votacion.votos.length;
  const pct = totalDirectores > 0 ? Math.round(votosRegistrados / totalDirectores * 100) : 0;

  const aFavor = votacion.votos.filter(v => v.voto === 'a_favor').length;
  const enContra = votacion.votos.filter(v => v.voto === 'en_contra').length;
  const abstenciones = votacion.votos.filter(v => v.voto === 'abstencion').length;

  return (
    <div className="bg-white rounded-2xl border-2 border-[#534AB7]/30 p-5 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Votación abierta</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{votacion.titulo}</p>
          {votacion.descripcion && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{votacion.descripcion}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { tipo: 'a_favor' as TipoVoto, count: aFavor },
          { tipo: 'en_contra' as TipoVoto, count: enContra },
          { tipo: 'abstencion' as TipoVoto, count: abstenciones },
        ].map(({ tipo, count }) => (
          <div key={tipo} className="rounded-xl p-2.5 text-center" style={{ background: VOTO_META[tipo].bg }}>
            <p className="text-lg font-bold" style={{ color: VOTO_META[tipo].color }}>{count}</p>
            <p className="text-xs font-medium" style={{ color: VOTO_META[tipo].color }}>{VOTO_META[tipo].label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#534AB7] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-gray-400 shrink-0">{votosRegistrados}/{totalDirectores} votos</span>
      </div>

      <div className="space-y-2 mb-4">
        {directores.map(nombre => {
          const votoExistente = getVotoDirector(nombre);
          const estaVotando = directorActivo === nombre;

          return (
            <div key={nombre}>
              <button onClick={() => setDirectorActivo(estaVotando ? null : nombre)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${estaVotando ? 'border-[#534AB7] bg-[#EEEDFE]/40' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                    {nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{nombre}</span>
                </div>
                {votoExistente ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: VOTO_META[votoExistente.voto].bg, color: VOTO_META[votoExistente.voto].color }}>
                    {VOTO_META[votoExistente.voto].icono} {VOTO_META[votoExistente.voto].label}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Sin votar</span>
                )}
              </button>

              {estaVotando && (
                <div className="mt-1 p-3 bg-[#EEEDFE]/30 rounded-xl border border-[#534AB7]/20">
                  <p className="text-xs text-gray-500 mb-2">Voto de {nombre}:</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {(['a_favor', 'en_contra', 'abstencion', 'ausente'] as TipoVoto[]).map(tipo => (
                      <button key={tipo} onClick={() => votar(nombre, tipo)}
                        className="py-2 rounded-xl text-xs font-bold border transition-all hover:opacity-90 active:scale-95"
                        style={{ background: VOTO_META[tipo].bg, color: VOTO_META[tipo].color, borderColor: VOTO_META[tipo].color + '40' }}>
                        {VOTO_META[tipo].icono} {VOTO_META[tipo].label}
                      </button>
                    ))}
                  </div>
                  <input className={`${inp} text-xs`} value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    placeholder="Comentario opcional..." />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={() => onActualizar(cerrarVotacion(votacion, totalDirectores))}
        className="w-full py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
        Cerrar votación y registrar resultado
      </button>
    </div>
  );
}

// ——— Tarjeta de votación cerrada ————————————————————————————————————————————

function VotacionCerrada({ votacion, totalDirectores }: {
  votacion: Votacion; totalDirectores: number;
}) {
  const [expandida, setExpandida] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const r = votacion.resultado;
  if (!r) return null;

  const copiar = () => {
    navigator.clipboard.writeText(generarTextoVotacion(votacion));
    setCopiado(true); setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className={`rounded-2xl border p-4 mb-3 ${r.aprobada ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${r.aprobada ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {r.aprobada ? '✓ Aprobada' : '✗ Rechazada'}
            </span>
            <span className="text-xs text-gray-400">{MAYORIA_META[votacion.tipoMayoria].label}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{votacion.titulo}</p>
          <p className={`text-xs mt-1 ${r.aprobada ? 'text-green-700' : 'text-red-700'}`}>{r.resumen}</p>
        </div>
        <button onClick={() => setExpandida(!expandida)} className="text-gray-400 hover:text-gray-600 ml-3 shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={expandida ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
          </svg>
        </button>
      </div>

      {expandida && (
        <div className="mt-3 pt-3 border-t border-white/50">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: 'A favor', val: r.aFavor, tipo: 'a_favor' as TipoVoto },
              { label: 'En contra', val: r.enContra, tipo: 'en_contra' as TipoVoto },
              { label: 'Abstención', val: r.abstenciones, tipo: 'abstencion' as TipoVoto },
              { label: 'Ausente', val: r.ausentes, tipo: 'ausente' as TipoVoto },
            ].map(item => (
              <div key={item.label} className="text-center rounded-lg p-2"
                style={{ background: VOTO_META[item.tipo].bg }}>
                <p className="text-lg font-bold" style={{ color: VOTO_META[item.tipo].color }}>{item.val}</p>
                <p className="text-[10px]" style={{ color: VOTO_META[item.tipo].color }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1 mb-3">
            {votacion.votos.map(v => (
              <div key={v.directorNombre} className="flex items-center justify-between text-xs py-1">
                <span className="text-gray-600">{v.directorNombre}</span>
                <div className="flex items-center gap-2">
                  {v.comentario && <span className="text-gray-400 italic">&quot;{v.comentario}&quot;</span>}
                  <span className="font-bold px-2 py-0.5 rounded-full"
                    style={{ background: VOTO_META[v.voto].bg, color: VOTO_META[v.voto].color }}>
                    {VOTO_META[v.voto].icono} {VOTO_META[v.voto].label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!r.quorumAlcanzado && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
              Quórum insuficiente — la votación no tiene validez formal
            </p>
          )}

          <button onClick={copiar}
            className="w-full py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-600 hover:bg-white/60 transition-colors">
            {copiado ? '✓ Copiado para el acta' : 'Copiar texto para el acta'}
          </button>
        </div>
      )}
    </div>
  );
}

// ——— Panel principal ————————————————————————————————————————————————————————

export default function VotacionPanel({ reunionId, directores, totalDirectores }: VotacionPanelProps) {
  const [votaciones, setVotaciones] = useState<Votacion[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    setVotaciones(storageVotaciones.getVotacionesPorReunion(reunionId));
  }, [reunionId]);

  const guardar = (vs: Votacion[]) => {
    setVotaciones(vs);
    storageVotaciones.setVotaciones([
      ...storageVotaciones.getVotaciones().filter(v => v.reunionId !== reunionId),
      ...vs,
    ]);
  };

  const agregarVotacion = (v: Votacion) => {
    guardar([...votaciones, v]);
    setMostrarForm(false);
  };

  const actualizarVotacion = (actualizada: Votacion) => {
    guardar(votaciones.map(v => v.id === actualizada.id ? actualizada : v));
  };

  const abrir = (v: Votacion) => actualizarVotacion(abrirVotacion(v));

  const abiertas = votaciones.filter(v => v.estado === 'abierta');
  const pendientes = votaciones.filter(v => v.estado === 'pendiente');
  const cerradas = votaciones.filter(v => v.estado === 'cerrada');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Votaciones</p>
          <p className="text-xs text-gray-400 mt-0.5">{votaciones.length} en esta reunión</p>
        </div>
        <button onClick={() => setMostrarForm(true)}
          className="px-3 py-1.5 rounded-lg bg-[#534AB7] hover:bg-[#3C3489] text-white text-xs font-semibold transition-colors">
          + Nueva votación
        </button>
      </div>

      {mostrarForm && (
        <FormVotacion reunionId={reunionId} onCrear={agregarVotacion} onCancelar={() => setMostrarForm(false)} />
      )}

      {votaciones.length === 0 && !mostrarForm && (
        <div className="text-center py-8 text-gray-400">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="text-xs font-medium text-gray-500">Sin votaciones en esta reunión</p>
          <p className="text-xs text-gray-400 mt-1">Creá una para registrar decisiones formales</p>
        </div>
      )}

      {abiertas.map(v => (
        <VotacionActiva key={v.id} votacion={v} directores={directores}
          totalDirectores={totalDirectores} onActualizar={actualizarVotacion} />
      ))}

      {pendientes.map(v => (
        <div key={v.id} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Pendiente</span>
              <p className="text-sm font-semibold text-gray-900 mt-1">{v.titulo}</p>
              <p className="text-xs text-gray-400 mt-0.5">{MAYORIA_META[v.tipoMayoria].label}</p>
            </div>
            <button onClick={() => abrir(v)}
              className="px-3 py-2 rounded-xl bg-[#534AB7] hover:bg-[#3C3489] text-white text-xs font-semibold transition-colors">
              Abrir votación
            </button>
          </div>
        </div>
      ))}

      {cerradas.length > 0 && (
        <>
          {pendientes.length + abiertas.length > 0 && (
            <div className="border-t border-gray-100 my-4" />
          )}
          <p className="text-xs text-gray-400 font-medium mb-2">Votaciones cerradas ({cerradas.length})</p>
          {cerradas.map(v => (
            <VotacionCerrada key={v.id} votacion={v} totalDirectores={totalDirectores} />
          ))}
        </>
      )}
    </div>
  );
}
