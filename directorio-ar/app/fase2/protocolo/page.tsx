'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CLAUSULAS, CATEGORIAS, calcularCompletitudProtocolo } from '../../../lib/modulo7-protocolo';
import { storageFase2 } from '../../../lib/storage-fase2';
import type { TipoProtocolo, ClausulaProtocolo, CategoriaProtocolo } from '../../../types/fase2';

const TIPO_OPTIONS: { value: TipoProtocolo; titulo: string; descripcion: string; icono: string }[] = [
  {
    value: 'familia',
    titulo: 'Protocolo familiar',
    descripcion: 'Para empresas donde los socios son familia',
    icono: '👨‍👩‍👧‍👦',
  },
  {
    value: 'socios',
    titulo: 'Acuerdo de socios',
    descripcion: 'Para socios sin vínculo familiar',
    icono: '🤝',
  },
  {
    value: 'mixto',
    titulo: 'Protocolo mixto',
    descripcion: 'Combinación de ambos',
    icono: '🔀',
  },
];

const CATEGORIA_ICONOS: Record<string, string> = {
  door: '🚪',
  transfer: '🔄',
  scale: '⚖️',
  tree: '🌳',
  money: '💰',
  salary: '💼',
  governance: '🏛️',
};

export default function ProtocoloPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoProtocolo | null>(null);
  const [clausulas, setClausulas] = useState<ClausulaProtocolo[]>([]);
  const [guardado, setGuardado] = useState(false);

  // Load existing data on mount
  useEffect(() => {
    const tipoGuardado = storageFase2.getProtocoloTipo();
    const clausulasGuardadas = storageFase2.getProtocoloClausulas();

    if (tipoGuardado) setTipo(tipoGuardado);
    if (clausulasGuardadas && clausulasGuardadas.length > 0) {
      setClausulas(clausulasGuardadas);
    } else {
      setClausulas(CLAUSULAS.map(c => ({ ...c })));
    }
  }, []);

  const resultado = tipo ? calcularCompletitudProtocolo(tipo, clausulas) : null;

  const toggleClausula = (id: string) => {
    setGuardado(false);
    setClausulas(prev =>
      prev.map(c => (c.id === id ? { ...c, seleccionada: !c.seleccionada } : c))
    );
  };

  const handleGuardar = () => {
    if (!tipo || !resultado) return;
    storageFase2.setProtocoloTipo(tipo);
    storageFase2.setProtocoloClausulas(clausulas);
    storageFase2.setProtocoloResultado(resultado);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  const handleCambiarTipo = () => {
    setTipo(null);
  };

  const handleSeleccionarTipo = (t: TipoProtocolo) => {
    setTipo(t);
    storageFase2.setProtocoloTipo(t);
    if (clausulas.length === 0) {
      setClausulas(CLAUSULAS.map(c => ({ ...c })));
    }
  };

  const categoriasOrdenadas = Object.keys(CATEGORIAS) as CategoriaProtocolo[];

  // ——— Step 1: Type selection ——————————————————————————————————————————————

  if (!tipo) {
    return (
      <div className="min-h-screen bg-[#FAFBFC]">
        {/* Gradient top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#534AB7] via-[#7B6FE0] to-[#534AB7]" />

        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-8"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Módulo 7 — Fase 2
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Protocolo de Familia / Socios
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Seleccioná el tipo de protocolo que mejor se ajusta a la composición societaria de tu empresa.
            </p>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-4">
            {TIPO_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSeleccionarTipo(opt.value)}
                className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 text-left hover:border-[#534AB7] hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{opt.icono}</div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#534AB7] transition">
                      {opt.titulo}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{opt.descripcion}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ——— Step 2: Clause selection ————————————————————————————————————————————

  const seleccionadasCount = clausulas.filter(c => c.seleccionada).length;

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Gradient top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#534AB7] via-[#7B6FE0] to-[#534AB7]" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-8"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Módulo 7 — Fase 2
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Protocolo de Familia / Socios
          </h1>
          <p className="text-sm text-gray-500">
            Tipo seleccionado:{' '}
            <span className="font-medium text-[#534AB7]">
              {TIPO_OPTIONS.find(o => o.value === tipo)?.titulo}
            </span>
          </p>
        </div>

        {/* Progress card */}
        {resultado && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Cobertura del protocolo</span>
              <span className="text-sm font-bold text-[#534AB7]">{resultado.completitudPorcentaje}%</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-[#534AB7] rounded-full transition-all duration-500"
                style={{ width: `${resultado.completitudPorcentaje}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{seleccionadasCount} de {clausulas.length} cláusulas seleccionadas</span>
              <span>{7 - resultado.areasConBrechas.length} de 7 áreas cubiertas</span>
            </div>

            {/* Gaps */}
            {resultado.areasConBrechas.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-amber-600 mb-2">
                  Áreas obligatorias sin cobertura:
                </p>
                <div className="flex flex-wrap gap-2">
                  {resultado.areasConBrechas.map(cat => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg border border-amber-200"
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {CATEGORIAS[cat].label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clauses by category */}
        <div className="flex flex-col gap-6 mb-32">
          {categoriasOrdenadas.map(cat => {
            const catInfo = CATEGORIAS[cat];
            const clausulasCat = clausulas.filter(c => c.categoria === cat);
            const seleccionadasCat = clausulasCat.filter(c => c.seleccionada).length;
            const esBrechaObligatoria = resultado?.areasConBrechas.includes(cat);

            return (
              <div key={cat}>
                {/* Category header */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{CATEGORIA_ICONOS[catInfo.icono] || '📋'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-gray-900">{catInfo.label}</h2>
                      <span className="text-xs text-gray-400">
                        {seleccionadasCat}/{clausulasCat.length}
                      </span>
                      {esBrechaObligatoria && (
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-semibold rounded border border-red-200">
                          Sin cobertura
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{catInfo.descripcion}</p>
                  </div>
                </div>

                {/* Clauses */}
                <div className="flex flex-col gap-2">
                  {clausulasCat.map(cl => (
                    <label
                      key={cl.id}
                      className={`bg-white border rounded-2xl shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                        cl.seleccionada
                          ? 'border-[#534AB7] bg-[#F8F7FE]'
                          : 'border-[#E5E7EB]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={cl.seleccionada}
                          onChange={() => toggleClausula(cl.id)}
                          className="mt-1 w-4 h-4 accent-[#534AB7] rounded cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-gray-800 leading-snug">
                            {cl.titulo}
                          </span>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            {cl.descripcion}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom actions — fixed */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 py-4 z-50">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={handleCambiarTipo}
              className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              Cambiar tipo
            </button>
            <button
              onClick={handleGuardar}
              className="flex-[2] py-3 text-sm font-semibold text-white bg-[#534AB7] hover:bg-[#443CA0] rounded-xl transition shadow-sm relative overflow-hidden"
            >
              {guardado ? (
                <span className="flex items-center justify-center gap-1.5">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Guardado
                </span>
              ) : (
                'Guardar protocolo'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
