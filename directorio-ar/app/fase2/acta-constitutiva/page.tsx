'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TIPOS_SOCIEDAD, CARGOS_DIRECTOR, FRECUENCIAS, QUORUMS, MAYORIAS,
  DIRECTOR_INICIAL, validarPaso1, validarPaso2, validarPaso3,
  generarTextoActa, formatearCuit,
} from '../../../lib/modulo6-acta';
import { storageFase2 } from '../../../lib/storage-fase2';
import type { ActaConstitutiva, DatosEmpresa, DirectorActa } from '../../../types/fase2';

function Tooltip({ texto }: { texto: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-block ml-1.5">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold inline-flex items-center justify-center hover:bg-[#534AB7] hover:text-white transition-colors"
      >?</button>
      {visible && (
        <div className="absolute z-50 bottom-6 left-1/2 -translate-x-1/2 w-56 bg-gray-900 text-white text-xs rounded-xl p-3 leading-relaxed shadow-xl">
          {texto}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  );
}

function Campo({ label, ayuda, required, children }: { label: string; ayuda?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        {ayuda && <Tooltip texto={ayuda} />}
      </label>
      {children}
    </div>
  );
}

const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-all";

function SelectorOpciones({ opciones, valor, onChange }: {
  opciones: { texto: string; valor: string; ayuda: string }[];
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {opciones.map(op => (
        <button
          key={op.valor}
          type="button"
          onClick={() => onChange(op.valor)}
          className={`text-left p-3 rounded-xl border transition-all ${valor === op.valor ? 'border-[#534AB7] bg-[#EEEDFE]/60' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all ${valor === op.valor ? 'border-[#534AB7] bg-[#534AB7]' : 'border-gray-300'}`}>
              {valor === op.valor && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div>
              <p className={`text-sm font-semibold ${valor === op.valor ? 'text-[#3C3489]' : 'text-gray-800'}`}>{op.texto}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{op.ayuda}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function VistaPrevia({ texto, onClose }: { texto: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Vista previa del acta</h3>
          <div className="flex gap-2">
            <button onClick={() => navigator.clipboard.writeText(texto)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium">Copiar</button>
            <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200">Cerrar</button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto p-5 text-xs font-mono text-gray-700 whitespace-pre-wrap leading-relaxed">{texto}</pre>
      </div>
    </div>
  );
}

const PASOS = ['Sociedad', 'Directores', 'Funcionamiento'];

export default function ModuloActaConstitutiva() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [empresa, setEmpresa] = useState<DatosEmpresa>({ razonSocial: '', cuit: '', domicilioLegal: '', tipoSociedad: 'SRL', capitalSocial: '', objetoSocial: '' });
  const [directores, setDirectores] = useState<DirectorActa[]>([{ ...DIRECTOR_INICIAL }]);
  const [config, setConfig] = useState({ frecuenciaReuniones: 'trimestral' as ActaConstitutiva['frecuenciaReuniones'], quorum: 50, mayoriaDecisiones: 'simple' as ActaConstitutiva['mayoriaDecisiones'], fechaConstitucion: new Date().toISOString().split('T')[0], lugarConstitucion: '', observaciones: '' });
  const [preview, setPreview] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const v1 = validarPaso1(empresa);
  const v2 = validarPaso2(directores);
  const v3 = validarPaso3(config);
  const validaciones = [v1, v2, v3];
  const pasoActual = validaciones[paso];

  const acta: ActaConstitutiva = { empresa, directores, ...config };

  const avanzar = () => { if (paso < 2) setPaso(p => p + 1); };
  const retroceder = () => { if (paso > 0) setPaso(p => p - 1); };

  const guardar = () => {
    storageFase2.setActaConstitutiva(acta);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const agregarDirector = () => setDirectores(p => [...p, { ...DIRECTOR_INICIAL }]);
  const quitarDirector = (i: number) => setDirectores(p => p.filter((_, idx) => idx !== i));
  const updateDirector = (i: number, k: keyof DirectorActa, v: string | boolean | number) =>
    setDirectores(p => p.map((d, idx) => idx === i ? { ...d, [k]: v } : d));

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="h-1 w-full bg-gray-100">
        <div className="h-full bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] transition-all duration-500" style={{ width: `${((paso + 1) / 3) * 100}%` }} />
      </div>

      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => paso === 0 ? router.push('/') : retroceder()} className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12l7 7M5 12l7-7" /></svg>
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] text-white text-xs font-bold flex items-center justify-center">6</div>
          <span className="text-sm font-semibold text-gray-900">Acta constitutiva</span>
        </div>
        <div className="flex items-center gap-1.5">
          {PASOS.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all ${i < paso ? 'bg-[#534AB7] text-white' : i === paso ? 'bg-[#534AB7] text-white ring-2 ring-[#534AB7]/30' : 'bg-gray-100 text-gray-400'}`}>
                {i < paso ? '✓' : i + 1}
              </div>
              {i < PASOS.length - 1 && <div className={`w-6 h-0.5 ${i < paso ? 'bg-[#534AB7]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900">Paso {paso + 1} de 3 — {PASOS[paso]}</h2>
          <p className="text-xs text-gray-400 mt-1">
            {paso === 0 && 'Los datos básicos de tu empresa para el encabezado del acta.'}
            {paso === 1 && 'Las personas que van a integrar el directorio y su cargo.'}
            {paso === 2 && 'Cómo va a funcionar el directorio: reuniones, quórum y decisiones.'}
          </p>
        </div>

        {paso === 0 && (
          <div className="space-y-1">
            <Campo label="Razón social" required ayuda="El nombre legal completo de la empresa tal como figura en IGJ o el registro provincial.">
              <input className={inp} value={empresa.razonSocial} onChange={e => setEmpresa(p => ({ ...p, razonSocial: e.target.value }))} placeholder="Ej: Acme S.R.L." />
            </Campo>
            <Campo label="CUIT" required>
              <input className={inp} value={empresa.cuit} onChange={e => setEmpresa(p => ({ ...p, cuit: formatearCuit(e.target.value) }))} placeholder="20-12345678-9" />
            </Campo>
            <Campo label="Tipo de sociedad" ayuda="Determina el marco legal aplicable.">
              <SelectorOpciones opciones={TIPOS_SOCIEDAD} valor={empresa.tipoSociedad} onChange={v => setEmpresa(p => ({ ...p, tipoSociedad: v as DatosEmpresa['tipoSociedad'] }))} />
            </Campo>
            <Campo label="Domicilio legal" required>
              <input className={inp} value={empresa.domicilioLegal} onChange={e => setEmpresa(p => ({ ...p, domicilioLegal: e.target.value }))} placeholder="Av. Corrientes 1234, CABA" />
            </Campo>
            <Campo label="Capital social" ayuda="El monto del capital social inscripto. No es obligatorio pero se recomienda incluirlo.">
              <input className={inp} value={empresa.capitalSocial} onChange={e => setEmpresa(p => ({ ...p, capitalSocial: e.target.value }))} placeholder="Ej: $10.000.000" />
            </Campo>
            <Campo label="Objeto social" required ayuda="La actividad principal de la empresa. Debe coincidir con el estatuto.">
              <textarea className={`${inp} resize-none`} rows={3} value={empresa.objetoSocial} onChange={e => setEmpresa(p => ({ ...p, objetoSocial: e.target.value }))} placeholder="Ej: Desarrollar, producir y comercializar software de gestión empresarial..." />
            </Campo>
          </div>
        )}

        {paso === 1 && (
          <div>
            {directores.map((d, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Director {i + 1}</span>
                  {directores.length > 1 && <button onClick={() => quitarDirector(i)} className="text-xs text-red-400 hover:text-red-600 font-medium">Quitar</button>}
                </div>
                <Campo label="Nombre completo" required>
                  <input className={inp} value={d.nombre} onChange={e => updateDirector(i, 'nombre', e.target.value)} placeholder="María García" />
                </Campo>
                <Campo label="DNI" required ayuda="DNI para personas humanas o CUIT para personas jurídicas.">
                  <input className={inp} value={d.dni} onChange={e => updateDirector(i, 'dni', e.target.value)} placeholder="30123456" />
                </Campo>
                <Campo label="Cargo" ayuda="El cargo define las responsabilidades dentro del directorio.">
                  <div className="grid grid-cols-1 gap-1.5">
                    {CARGOS_DIRECTOR.map(({ cargo, ayuda }) => (
                      <button key={cargo} type="button" onClick={() => updateDirector(i, 'cargo', cargo)}
                        className={`text-left px-3 py-2 rounded-xl border text-sm transition-all ${d.cargo === cargo ? 'border-[#534AB7] bg-[#EEEDFE]/60 text-[#3C3489] font-semibold' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                        <span className="font-medium">{cargo}</span>
                        <span className="text-xs text-gray-400 ml-2">— {ayuda}</span>
                      </button>
                    ))}
                  </div>
                </Campo>
                <div className="grid grid-cols-2 gap-3">
                  <Campo label="Mandato" ayuda="Duración del cargo antes de renovación. 2 años es el estándar.">
                    <select className={`${inp} cursor-pointer`} value={d.duracionMandato} onChange={e => updateDirector(i, 'duracionMandato', parseInt(e.target.value))}>
                      <option value={1}>1 año</option>
                      <option value={2}>2 años</option>
                      <option value={3}>3 años</option>
                    </select>
                  </Campo>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={d.esIndependiente} onChange={e => updateDirector(i, 'esIndependiente', e.target.checked)} className="rounded border-gray-300 text-[#534AB7] w-4 h-4" />
                      <span className="text-sm text-gray-600">Independiente</span>
                      <Tooltip texto="Un director independiente no tiene vínculos comerciales ni familiares con los socios. Es requerido por fondos de PE y SGR." />
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={agregarDirector} className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-[#534AB7] hover:text-[#534AB7] transition-all">
              + Agregar otro director
            </button>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">¿Con qué frecuencia se reúne el directorio?</p>
              <SelectorOpciones opciones={FRECUENCIAS} valor={config.frecuenciaReuniones} onChange={v => setConfig(p => ({ ...p, frecuenciaReuniones: v as ActaConstitutiva['frecuenciaReuniones'] }))} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">¿Cuántos directores se necesitan para sesionar?</p>
              <SelectorOpciones opciones={QUORUMS} valor={String(config.quorum)} onChange={v => setConfig(p => ({ ...p, quorum: parseInt(v) }))} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">¿Cómo se aprueban las decisiones?</p>
              <SelectorOpciones opciones={MAYORIAS} valor={config.mayoriaDecisiones} onChange={v => setConfig(p => ({ ...p, mayoriaDecisiones: v as ActaConstitutiva['mayoriaDecisiones'] }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Fecha de constitución" required>
                <input type="date" className={inp} value={config.fechaConstitucion} onChange={e => setConfig(p => ({ ...p, fechaConstitucion: e.target.value }))} />
              </Campo>
              <Campo label="Ciudad" required ayuda="Ciudad donde se realiza el acto de constitución.">
                <input className={inp} value={config.lugarConstitucion} onChange={e => setConfig(p => ({ ...p, lugarConstitucion: e.target.value }))} placeholder="Córdoba" />
              </Campo>
            </div>
            <Campo label="Observaciones adicionales">
              <textarea className={`${inp} resize-none`} rows={2} value={config.observaciones} onChange={e => setConfig(p => ({ ...p, observaciones: e.target.value }))} placeholder="Cualquier cláusula adicional..." />
            </Campo>
          </div>
        )}

        {pasoActual.errores.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
            {pasoActual.errores.map((e, i) => <p key={i} className="text-xs text-red-600">• {e}</p>)}
          </div>
        )}
        {pasoActual.advertencias.length > 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
            {pasoActual.advertencias.map((a, i) => <p key={i} className="text-xs text-amber-600">• {a}</p>)}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {paso < 2 ? (
            <button onClick={avanzar} disabled={!pasoActual.valida}
              className="flex-1 py-3 rounded-xl bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Continuar →
            </button>
          ) : (
            <>
              <button onClick={() => setPreview(true)} disabled={!v3.valida}
                className="flex-1 py-3 rounded-xl border border-[#534AB7] text-[#534AB7] font-semibold text-sm disabled:opacity-40 hover:bg-[#EEEDFE] transition-colors">
                Ver acta
              </button>
              <button onClick={guardar} disabled={!v1.valida || !v2.valida || !v3.valida}
                className="flex-1 py-3 rounded-xl bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold text-sm disabled:opacity-40 transition-colors">
                {guardado ? '✓ Guardado' : 'Guardar'}
              </button>
            </>
          )}
        </div>
      </main>

      {preview && <VistaPrevia texto={generarTextoActa(acta)} onClose={() => setPreview(false)} />}
    </div>
  );
}
