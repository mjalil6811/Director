'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CATEGORIAS_ESCENARIO, getEscenarios, calcularResultado, generarTextoProtocolo,
} from '../../../../lib/constitucion/modulo7-protocolo';
import { storageFase2 } from '../../../../lib/storage/storage-fase2';
import { storage } from '../../../../lib/storage/storage';
import type { TipoProtocolo, CategoriaProtocolo } from '../../../../types/fase2';
import type { RespuestaProtocolo, CategoriaEscenario } from '../../../../lib/constitucion/modulo7-protocolo';

const NIVEL_COLOR = {
  flexible: 'bg-gray-100 text-gray-600',
  moderado: 'bg-blue-50 text-blue-700',
  estricto: 'bg-purple-50 text-purple-700',
};
const NIVEL_LABEL = { flexible: 'Flexible', moderado: 'Moderado', estricto: 'Robusto' };

function SeleccionTipo({ onSelect }: { onSelect: (t: TipoProtocolo) => void }) {
  const tipos: { tipo: TipoProtocolo; titulo: string; desc: string; tag: string }[] = [
    { tipo: 'familia', titulo: 'Empresa familiar', desc: 'Hay familiares como socios, directores o potenciales herederos. Incluye reglas de sucesión y familiares políticos.', tag: '10 escenarios' },
    { tipo: 'socios', titulo: 'Socios no familiares', desc: 'Los socios son principalmente personas que se asociaron por negocio, sin vínculo familiar. Foco en transferencias y conflictos.', tag: '7 escenarios' },
    { tipo: 'mixto', titulo: 'Familia y socios externos', desc: 'Combinación de socios familiares y externos. Se aplican todas las reglas posibles.', tag: '10 escenarios' },
  ];
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-1">¿Cómo es tu empresa?</h2>
      <p className="text-sm text-gray-400 mb-6">Esto determina qué situaciones vas a resolver en el protocolo.</p>
      <div className="space-y-3">
        {tipos.map(t => (
          <button key={t.tipo} onClick={() => onSelect(t.tipo)}
            className="w-full text-left bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#534AB7]/50 hover:bg-[#FAFBFC] transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-[#534AB7] transition-colors">{t.titulo}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xs">{t.desc}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium shrink-0 ml-3">{t.tag}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Resultado({ resultado, empresaNombre, onReiniciar }: {
  resultado: ReturnType<typeof calcularResultado>;
  empresaNombre: string;
  onReiniciar: () => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const nivelConfig = {
    basico: { label: 'Protección básica', color: 'bg-amber-50 text-amber-700 border-amber-200', desc: 'Cubre los mínimos. Considerá completar los escenarios opcionales.' },
    intermedio: { label: 'Protección intermedia', color: 'bg-blue-50 text-blue-700 border-blue-200', desc: 'Buen nivel de cobertura. El protocolo protege los principales riesgos.' },
    robusto: { label: 'Protección robusta', color: 'bg-green-50 text-green-700 border-green-200', desc: 'Cobertura completa. El protocolo está listo para escenarios complejos.' },
  };
  const nc = nivelConfig[resultado.nivelProteccion];

  const copiar = () => {
    navigator.clipboard.writeText(generarTextoProtocolo(resultado, empresaNombre));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div>
      <div className={`rounded-2xl border p-4 mb-5 ${nc.color}`}>
        <p className="font-semibold text-sm">{nc.label}</p>
        <p className="text-xs mt-0.5 opacity-80">{nc.desc}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cobertura</span>
          <span className="text-sm font-bold text-[#534AB7]">{resultado.coberturaPorcentaje}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] rounded-full transition-all" style={{ width: `${resultado.coberturaPorcentaje}%` }} />
        </div>
        <p className="text-xs font-semibold text-gray-600 mb-2">Cláusulas acordadas ({resultado.clausulasGeneradas.length})</p>
        <div className="space-y-1.5">
          {resultado.clausulasGeneradas.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5">
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <p className="text-xs text-gray-600">{c}</p>
            </div>
          ))}
        </div>
      </div>

      {resultado.areasIncompletas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-amber-700 mb-1">Áreas sin cobertura</p>
          {resultado.areasIncompletas.map(a => (
            <p key={a} className="text-xs text-amber-600">• {CATEGORIAS_ESCENARIO[a].label}</p>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={copiar} className="flex-1 py-3 rounded-xl border border-[#534AB7] text-[#534AB7] font-semibold text-sm hover:bg-[#EEEDFE] transition-colors">
          {copiado ? '✓ Copiado' : 'Copiar protocolo'}
        </button>
        <button onClick={onReiniciar} className="flex-1 py-3 rounded-xl bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold text-sm transition-colors">
          Editar respuestas
        </button>
      </div>
    </div>
  );
}

export default function ModuloProtocolo() {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoProtocolo | null>(null);
  const [respuestas, setRespuestas] = useState<RespuestaProtocolo[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaEscenario | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const empresaNombre = storage.getEmpresaNombre() ?? 'Mi Empresa';

  const escenarios = tipo ? getEscenarios(tipo) : [];
  const categorias = tipo ? [...new Set(escenarios.map(e => e.categoria))] as CategoriaEscenario[] : [];
  const escenariosFiltrados = categoriaActiva ? escenarios.filter(e => e.categoria === categoriaActiva) : escenarios;
  const respondidos = respuestas.length;
  const obligatoriosTotal = escenarios.filter(e => e.obligatorio).length;
  const obligatoriosRespondidos = escenarios.filter(e => e.obligatorio && respuestas.some(r => r.escenarioId === e.id)).length;
  const puedeVerResultado = obligatoriosRespondidos >= obligatoriosTotal;

  const responder = (escenarioId: string, opcionId: string) => {
    setRespuestas(prev => {
      const sin = prev.filter(r => r.escenarioId !== escenarioId);
      return [...sin, { escenarioId, opcionId }];
    });
  };

  const getRespuesta = (escenarioId: string) => respuestas.find(r => r.escenarioId === escenarioId);

  const verResultado = () => {
    if (!tipo) return;
    const resultado = calcularResultado(tipo, respuestas);
    storageFase2.setProtocoloResultado({
      tipo,
      clausulasSeleccionadas: [],
      completitudPorcentaje: resultado.coberturaPorcentaje,
      areasConBrechas: resultado.areasIncompletas as unknown as CategoriaProtocolo[],
    });
    setMostrarResultado(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="h-1 w-full bg-gray-100">
        <div className="h-full bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] transition-all" style={{ width: tipo ? `${(respondidos / Math.max(escenarios.length, 1)) * 100}%` : '5%' }} />
      </div>

      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => { if (mostrarResultado) setMostrarResultado(false); else if (tipo) setTipo(null); else router.push('/'); }}
          className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12l7 7M5 12l7-7" /></svg>
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] text-white text-xs font-bold flex items-center justify-center">7</div>
          <span className="text-sm font-semibold text-gray-900">
            {mostrarResultado ? 'Tu protocolo' : tipo ? 'Protocolo de socios' : 'Protocolo'}
          </span>
        </div>
        {tipo && !mostrarResultado && (
          <span className="text-xs text-gray-400">{respondidos}/{escenarios.length} situaciones</span>
        )}
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        {!tipo && <SeleccionTipo onSelect={t => { setTipo(t); setRespuestas([]); }} />}

        {tipo && mostrarResultado && (
          <Resultado
            resultado={calcularResultado(tipo, respuestas)}
            empresaNombre={empresaNombre}
            onReiniciar={() => setMostrarResultado(false)}
          />
        )}

        {tipo && !mostrarResultado && (
          <div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
              <button onClick={() => setCategoriaActiva(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${!categoriaActiva ? 'bg-[#534AB7] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                Todas
              </button>
              {categorias.map(cat => {
                const respondidosEnCat = respuestas.filter(r => escenarios.find(e => e.id === r.escenarioId)?.categoria === cat).length;
                const totalCat = escenarios.filter(e => e.categoria === cat).length;
                return (
                  <button key={cat} onClick={() => setCategoriaActiva(cat === categoriaActiva ? null : cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${cat === categoriaActiva ? 'bg-[#534AB7] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                    {CATEGORIAS_ESCENARIO[cat].label}
                    {respondidosEnCat > 0 && <span className="ml-1 opacity-70">{respondidosEnCat}/{totalCat}</span>}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              {escenariosFiltrados.map(esc => {
                const respuesta = getRespuesta(esc.id);
                return (
                  <div key={esc.id} className={`bg-white rounded-2xl border transition-all ${respuesta ? 'border-[#534AB7]/20' : 'border-gray-200'}`}>
                    <div className="p-4">
                      <div className="flex items-start gap-2 mb-2">
                        {esc.obligatorio
                          ? <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium shrink-0">Obligatorio</span>
                          : <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium shrink-0">Opcional</span>
                        }
                        <span className="text-xs text-gray-400">{CATEGORIAS_ESCENARIO[esc.categoria].label}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{esc.pregunta}</p>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">{esc.contexto}</p>

                      <div className="space-y-2">
                        {esc.opciones.map(op => {
                          const elegida = respuesta?.opcionId === op.id;
                          return (
                            <button key={op.id} onClick={() => responder(esc.id, op.id)}
                              className={`w-full text-left p-3 rounded-xl border transition-all ${elegida ? 'border-[#534AB7] bg-[#EEEDFE]/60' : 'border-gray-100 hover:border-gray-300 bg-gray-50/50'}`}>
                              <div className="flex items-start gap-2.5">
                                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all ${elegida ? 'border-[#534AB7] bg-[#534AB7]' : 'border-gray-300'}`}>
                                  {elegida && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className={`text-xs font-medium ${elegida ? 'text-[#3C3489]' : 'text-gray-700'}`}>{op.texto}</p>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${NIVEL_COLOR[op.nivel]}`}>{NIVEL_LABEL[op.nivel]}</span>
                                  </div>
                                  {op.advertencia && elegida && (
                                    <p className="text-xs text-amber-600 mt-1">⚠ {op.advertencia}</p>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              {!puedeVerResultado && (
                <p className="text-xs text-center text-amber-600 mb-3">
                  Respondé las {obligatoriosTotal - obligatoriosRespondidos} situaciones obligatorias para continuar.
                </p>
              )}
              <button onClick={verResultado} disabled={!puedeVerResultado}
                className="w-full py-3 rounded-xl bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Ver mi protocolo →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
