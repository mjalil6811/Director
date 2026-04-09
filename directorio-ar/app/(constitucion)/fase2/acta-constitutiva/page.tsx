'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  EMPRESA_INICIAL,
  DIRECTOR_INICIAL,
  TIPOS_SOCIEDAD,
  CARGOS_DIRECTOR,
  validarActa,
  generarTextoActa,
  formatearCuit,
} from '../../../../lib/constitucion/modulo6-acta';
import { storageFase2 } from '../../../../lib/storage/storage-fase2';
import type { DatosEmpresa, DirectorActa, ActaConstitutiva } from '../../../../types/fase2';

export default function ActaConstitutivaPage() {
  const router = useRouter();

  // --- State ---
  const [empresa, setEmpresa] = useState<DatosEmpresa>({ ...EMPRESA_INICIAL });
  const [directores, setDirectores] = useState<DirectorActa[]>([{ ...DIRECTOR_INICIAL }]);
  const [frecuenciaReuniones, setFrecuenciaReuniones] = useState<ActaConstitutiva['frecuenciaReuniones']>('mensual');
  const [quorum, setQuorum] = useState(51);
  const [mayoriaDecisiones, setMayoriaDecisiones] = useState<ActaConstitutiva['mayoriaDecisiones']>('simple');
  const [fechaConstitucion, setFechaConstitucion] = useState('');
  const [lugarConstitucion, setLugarConstitucion] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [errores, setErrores] = useState<string[]>([]);
  const [advertencias, setAdvertencias] = useState<string[]>([]);
  const [guardado, setGuardado] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // --- Load existing data on mount ---
  useEffect(() => {
    const saved = storageFase2.getActaConstitutiva();
    if (saved) {
      setEmpresa(saved.empresa);
      setDirectores(saved.directores.length > 0 ? saved.directores : [{ ...DIRECTOR_INICIAL }]);
      setFrecuenciaReuniones(saved.frecuenciaReuniones);
      setQuorum(saved.quorum);
      setMayoriaDecisiones(saved.mayoriaDecisiones);
      setFechaConstitucion(saved.fechaConstitucion);
      setLugarConstitucion(saved.lugarConstitucion);
      setObservaciones(saved.observaciones);
    }
  }, []);

  // --- Helpers ---
  function buildActa(): ActaConstitutiva {
    return {
      empresa,
      directores,
      frecuenciaReuniones,
      quorum,
      mayoriaDecisiones,
      fechaConstitucion,
      lugarConstitucion,
      observaciones,
    };
  }

  function updateEmpresa(field: keyof DatosEmpresa, value: string) {
    setEmpresa(prev => ({ ...prev, [field]: value }));
  }

  function updateDirector(index: number, field: keyof DirectorActa, value: string | number | boolean) {
    setDirectores(prev =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  }

  function addDirector() {
    setDirectores(prev => [...prev, { ...DIRECTOR_INICIAL }]);
  }

  function removeDirector(index: number) {
    if (directores.length <= 1) return;
    setDirectores(prev => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    setGuardado(false);
    const acta = buildActa();
    const result = validarActa(acta);
    setErrores(result.errores);
    setAdvertencias(result.advertencias);
    if (result.valida) {
      storageFase2.setActaConstitutiva(acta);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    }
  }

  function togglePreview() {
    setShowPreview(prev => !prev);
  }

  // --- Input classes ---
  const inputCls =
    'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent transition';
  const selectCls =
    'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent transition appearance-none';
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1';
  const sectionTitleCls = 'text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4';

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Gradient top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#534AB7] via-[#7C6FDB] to-[#534AB7]" />

      {/* Sticky header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-4 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] flex items-center justify-center shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 tracking-tight">Acta Constitutiva</span>
            <span className="text-[10px] text-gray-400">Fase 2 — Constitución del Directorio</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ── Section 1: Datos de la empresa ── */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <p className={sectionTitleCls}>Datos de la empresa</p>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Razón social</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Ej. Acme Argentina S.A."
                value={empresa.razonSocial}
                onChange={e => updateEmpresa('razonSocial', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>CUIT</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="30-12345678-9"
                  value={empresa.cuit}
                  onChange={e => updateEmpresa('cuit', formatearCuit(e.target.value))}
                />
              </div>
              <div>
                <label className={labelCls}>Tipo de sociedad</label>
                <select
                  className={selectCls}
                  value={empresa.tipoSociedad}
                  onChange={e => updateEmpresa('tipoSociedad', e.target.value)}
                >
                  {TIPOS_SOCIEDAD.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Domicilio legal</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Av. Corrientes 1234, CABA"
                value={empresa.domicilioLegal}
                onChange={e => updateEmpresa('domicilioLegal', e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>Capital social</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Ej. $10.000.000"
                value={empresa.capitalSocial}
                onChange={e => updateEmpresa('capitalSocial', e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>Objeto social</label>
              <textarea
                className={inputCls + ' min-h-[80px] resize-y'}
                placeholder="Descripción del objeto social de la sociedad..."
                value={empresa.objetoSocial}
                onChange={e => updateEmpresa('objetoSocial', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Directores ── */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <p className={sectionTitleCls}>Directores</p>
          <div className="space-y-4">
            {directores.map((dir, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-xl p-4 bg-[#FAFBFC] space-y-3 relative"
              >
                {/* Director header */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#534AB7]">
                    Director {idx + 1}
                  </span>
                  {directores.length > 1 && (
                    <button
                      onClick={() => removeDirector(idx)}
                      className="text-xs text-red-400 hover:text-red-600 transition font-medium"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Nombre completo</label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="Juan Perez"
                      value={dir.nombre}
                      onChange={e => updateDirector(idx, 'nombre', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>DNI / CUIT</label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="12345678"
                      value={dir.dni}
                      onChange={e => updateDirector(idx, 'dni', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Cargo</label>
                    <select
                      className={selectCls}
                      value={dir.cargo}
                      onChange={e => updateDirector(idx, 'cargo', e.target.value)}
                    >
                      {CARGOS_DIRECTOR.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Duración del mandato</label>
                    <select
                      className={selectCls}
                      value={dir.duracionMandato}
                      onChange={e => updateDirector(idx, 'duracionMandato', Number(e.target.value))}
                    >
                      <option value={1}>1 año</option>
                      <option value={2}>2 años</option>
                      <option value={3}>3 años</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dir.esIndependiente}
                    onChange={e => updateDirector(idx, 'esIndependiente', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#534AB7] focus:ring-[#534AB7]"
                  />
                  <span className="text-xs text-gray-600">Director independiente</span>
                </label>
              </div>
            ))}

            <button
              onClick={addDirector}
              className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#534AB7] hover:text-[#534AB7] transition font-medium"
            >
              + Agregar director
            </button>
          </div>
        </div>

        {/* ── Section 3: Configuración del directorio ── */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <p className={sectionTitleCls}>Configuración del directorio</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Frecuencia de reuniones</label>
                <select
                  className={selectCls}
                  value={frecuenciaReuniones}
                  onChange={e => setFrecuenciaReuniones(e.target.value as ActaConstitutiva['frecuenciaReuniones'])}
                >
                  <option value="mensual">Mensual</option>
                  <option value="bimestral">Bimestral</option>
                  <option value="trimestral">Trimestral</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Quórum mínimo (%)</label>
                <input
                  type="number"
                  className={inputCls}
                  min={1}
                  max={100}
                  value={quorum}
                  onChange={e => setQuorum(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Mayoría para decisiones</label>
              <select
                className={selectCls}
                value={mayoriaDecisiones}
                onChange={e => setMayoriaDecisiones(e.target.value as ActaConstitutiva['mayoriaDecisiones'])}
              >
                <option value="simple">Mayoría simple (más del 50%)</option>
                <option value="calificada_2_3">Mayoría calificada (2/3)</option>
                <option value="unanimidad">Unanimidad</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Fecha de constitución</label>
                <input
                  type="date"
                  className={inputCls}
                  value={fechaConstitucion}
                  onChange={e => setFechaConstitucion(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Lugar de constitución</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Ciudad Autónoma de Buenos Aires"
                  value={lugarConstitucion}
                  onChange={e => setLugarConstitucion(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Observaciones (opcional)</label>
              <textarea
                className={inputCls + ' min-h-[60px] resize-y'}
                placeholder="Notas adicionales o cláusulas especiales..."
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* ── Validation messages ── */}
        {errores.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">Errores de validación</p>
            <ul className="space-y-1">
              {errores.map((e, i) => (
                <li key={i} className="text-xs text-red-600 flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">&#x2717;</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {advertencias.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Advertencias</p>
            <ul className="space-y-1">
              {advertencias.map((a, i) => (
                <li key={i} className="text-xs text-amber-600 flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">&#x26A0;</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Success message ── */}
        {guardado && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-green-700">Acta guardada correctamente</p>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={togglePreview}
            className="flex-1 py-3 px-4 border border-[#E5E7EB] text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
          >
            {showPreview ? 'Ocultar vista previa' : 'Vista previa del acta'}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#534AB7] to-[#6359C7] hover:from-[#3C3489] hover:to-[#534AB7] text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition text-sm"
          >
            Guardar acta
          </button>
        </div>

        {/* ── Preview ── */}
        {showPreview && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
            <p className={sectionTitleCls}>Vista previa del acta</p>
            <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700 leading-relaxed bg-[#FAFBFC] border border-gray-100 rounded-xl p-4 overflow-x-auto">
              {generarTextoActa(buildActa())}
            </pre>
          </div>
        )}

        {/* ── Back link ── */}
        <button
          onClick={() => router.push('/')}
          className="w-full py-2 text-gray-400 text-xs hover:text-gray-600 transition"
        >
          Volver al inicio
        </button>

        {/* Footer */}
        <div className="text-center pt-4 pb-2 border-t border-gray-100">
          <p className="text-xs text-gray-300 font-medium tracking-wide">Directorio AR · Gobierno Corporativo</p>
        </div>
      </main>
    </div>
  );
}
