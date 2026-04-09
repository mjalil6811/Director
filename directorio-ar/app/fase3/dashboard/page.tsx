'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MESES, periodoVacio, calcularDerivados, calcularKPIs,
  calcularVariacion, generarAlertas, generarInformePreReunion, generarId,
} from '../../../lib/gestion/modulo10-dashboard';
import { storageFase3 } from '../../../lib/storage/storage-fase3';
import { storage } from '../../../lib/storage/storage';
import type { PeriodoFinanciero, PresupuestoAnual, AlertaFinanciera } from '../../../types/fase3';

const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7] transition-all";

function fmtMoney(n: number): string {
  return '$' + n.toLocaleString('es-AR');
}

function KpiCard({ label, valor, variacion, prefix }: {
  label: string; valor: string | number; variacion?: { valor: number; positivo: boolean }; prefix?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{prefix}{typeof valor === 'number' ? valor.toLocaleString('es-AR') : valor}</p>
      {variacion && (
        <p className={`text-xs font-semibold mt-1 ${variacion.positivo ? 'text-green-600' : 'text-red-500'}`}>
          {variacion.positivo ? '+' : ''}{variacion.valor}% vs. mes ant.
        </p>
      )}
    </div>
  );
}

function MiniBar({ label, valor, max, color }: { label: string; valor: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(Math.round(valor / max * 100), 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function CargaDatos({ periodoInicial, onGuardar, onCancelar }: {
  periodoInicial: PeriodoFinanciero;
  onGuardar: (p: PeriodoFinanciero) => void;
  onCancelar: () => void;
}) {
  const [p, setP] = useState<PeriodoFinanciero>(periodoInicial);

  const set = (campo: keyof PeriodoFinanciero, valor: string) => {
    const n = parseFloat(valor) || 0;
    setP(prev => calcularDerivados({ ...prev, [campo]: n }));
  };

  const campos: { label: string; key: keyof PeriodoFinanciero; prefix?: string }[] = [
    { label: 'Ventas', key: 'ventas', prefix: '$' },
    { label: 'Costo de ventas', key: 'costoVentas', prefix: '$' },
    { label: 'Gastos operativos', key: 'gastosOperativos', prefix: '$' },
    { label: 'Resultado neto', key: 'resultadoNeto', prefix: '$' },
    { label: 'Caja', key: 'caja', prefix: '$' },
    { label: 'Deuda financiera', key: 'deudaFinanciera', prefix: '$' },
    { label: 'Cuentas a cobrar', key: 'cuentasCobrar', prefix: '$' },
    { label: 'Cuentas a pagar', key: 'cuentasPagar', prefix: '$' },
  ];

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">Carga de datos — {MESES[p.mes - 1]} {p.anio}</h3>
      <p className="text-xs text-gray-400 mb-5">Ingresá los datos financieros del período. El EBITDA se calcula automáticamente.</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="col-span-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Mes</label>
          <select className={inp} value={p.mes} onChange={e => setP(prev => ({ ...prev, mes: parseInt(e.target.value) }))}>
            {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ano</label>
          <input type="number" className={inp} value={p.anio} onChange={e => setP(prev => ({ ...prev, anio: parseInt(e.target.value) || 2024 }))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {campos.map(c => (
          <div key={c.key}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.label}</label>
            <input type="number" className={inp} value={p[c.key] as number || ''} onChange={e => set(c.key, e.target.value)} placeholder="0" />
          </div>
        ))}
      </div>

      <div className="bg-[#EEEDFE]/60 rounded-xl p-4 mb-4 border border-[#DDD9FE]">
        <p className="text-xs font-semibold text-[#3C3489] uppercase tracking-wide mb-1">EBITDA calculado</p>
        <p className="text-lg font-bold text-[#534AB7]">{fmtMoney(p.ebitda)}</p>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notas para el directorio</label>
        <textarea className={inp + ' resize-none'} rows={3} value={p.notasDirectorio} onChange={e => setP(prev => ({ ...prev, notasDirectorio: e.target.value }))} placeholder="Observaciones relevantes para la reunion..." />
      </div>

      <div className="flex gap-2">
        <button onClick={onCancelar} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancelar</button>
        <button onClick={() => onGuardar(p)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] text-white text-sm font-semibold hover:shadow-lg transition-all">Guardar periodo</button>
      </div>
    </div>
  );
}

function PresupuestoForm({ presupuestoInicial, onGuardar, onCancelar }: {
  presupuestoInicial: PresupuestoAnual | null;
  onGuardar: (p: PresupuestoAnual) => void;
  onCancelar: () => void;
}) {
  const [p, setP] = useState<PresupuestoAnual>(presupuestoInicial ?? { anio: new Date().getFullYear(), ventas: 0, ebitda: 0, resultadoNeto: 0, inversionCapex: 0 });

  const campos: { label: string; key: keyof PresupuestoAnual }[] = [
    { label: 'Ventas anuales esperadas', key: 'ventas' },
    { label: 'EBITDA anual esperado', key: 'ebitda' },
    { label: 'Resultado neto esperado', key: 'resultadoNeto' },
    { label: 'Inversion CAPEX', key: 'inversionCapex' },
  ];

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">Presupuesto anual</h3>
      <p className="text-xs text-gray-400 mb-5">Carga el presupuesto del ano para comparar contra la ejecucion real.</p>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ano</label>
        <input type="number" className={inp} value={p.anio} onChange={e => setP(prev => ({ ...prev, anio: parseInt(e.target.value) || 2024 }))} />
      </div>

      {campos.map(c => (
        <div key={c.key} className="mb-3">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.label}</label>
          <input type="number" className={inp} value={p[c.key] || ''} onChange={e => setP(prev => ({ ...prev, [c.key]: parseFloat(e.target.value) || 0 }))} placeholder="0" />
        </div>
      ))}

      <div className="flex gap-2 mt-5">
        <button onClick={onCancelar} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancelar</button>
        <button onClick={() => onGuardar(p)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] text-white text-sm font-semibold hover:shadow-lg transition-all">Guardar presupuesto</button>
      </div>
    </div>
  );
}

export default function ModuloDashboard() {
  const router = useRouter();
  const [vista, setVista] = useState<'panel' | 'carga' | 'presupuesto' | 'informe'>('panel');
  const [periodos, setPeriodos] = useState<PeriodoFinanciero[]>([]);
  const [presupuesto, setPresupuesto] = useState<PresupuestoAnual | null>(null);
  const [alertas, setAlertas] = useState<AlertaFinanciera[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [informe, setInforme] = useState('');

  useEffect(() => {
    const data = storageFase3.getDashboard();
    if (data) {
      setPeriodos(data.periodos);
      setPresupuesto(data.presupuesto);
      setAlertas(data.alertas);
    }
  }, []);

  const guardarTodo = useCallback((ps: PeriodoFinanciero[], pres: PresupuestoAnual | null) => {
    const als = generarAlertas(ps, pres);
    setAlertas(als);
    storageFase3.setDashboard({ periodos: ps, presupuesto: pres, alertas: als });
  }, []);

  const guardarPeriodo = (p: PeriodoFinanciero) => {
    const existe = periodos.findIndex(x => x.id === p.id);
    const nuevos = existe >= 0 ? periodos.map(x => x.id === p.id ? p : x) : [...periodos, p];
    nuevos.sort((a, b) => a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes);
    setPeriodos(nuevos);
    guardarTodo(nuevos, presupuesto);
    setVista('panel');
    setEditandoId(null);
  };

  const eliminarPeriodo = (id: string) => {
    const nuevos = periodos.filter(p => p.id !== id);
    setPeriodos(nuevos);
    guardarTodo(nuevos, presupuesto);
  };

  const guardarPresupuesto = (p: PresupuestoAnual) => {
    setPresupuesto(p);
    guardarTodo(periodos, p);
    setVista('panel');
  };

  const generarInforme = () => {
    const empresa = storage.getEmpresaNombre() || 'Mi Empresa';
    const texto = generarInformePreReunion(periodos, presupuesto, empresa, periodos.length);
    setInforme(texto);
    setVista('informe');
  };

  const ultimo = periodos.length > 0 ? periodos[periodos.length - 1] : null;
  const anterior = periodos.length >= 2 ? periodos[periodos.length - 2] : null;
  const kpis = ultimo ? calcularKPIs(ultimo) : null;
  const variVentas = ultimo && anterior ? calcularVariacion(ultimo.ventas, anterior.ventas) : undefined;
  const variEbitda = ultimo && anterior ? calcularVariacion(ultimo.ebitda, anterior.ebitda) : undefined;

  const alertasCriticas = alertas.filter(a => !a.resuelta && a.severidad === 'critica');
  const alertasAdvertencia = alertas.filter(a => !a.resuelta && a.severidad === 'advertencia');

  const tabs = [
    { id: 'panel' as const, label: 'Panel' },
    { id: 'carga' as const, label: 'Cargar datos' },
    { id: 'presupuesto' as const, label: 'Presupuesto' },
    { id: 'informe' as const, label: 'Informe' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.push('/')} className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12l7 7M5 12l7-7" /></svg>
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#534AB7] to-[#7C6FDB] text-white text-xs font-bold flex items-center justify-center">10</div>
          <span className="text-sm font-semibold text-gray-900">Dashboard financiero</span>
        </div>
      </header>

      <div className="flex gap-1 px-4 pt-4 mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { if (t.id === 'informe') generarInforme(); else if (t.id === 'carga') { setEditandoId(null); setVista('carga'); } else setVista(t.id); }}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${vista === t.id ? 'bg-[#534AB7] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <main className="max-w-xl mx-auto px-4 pb-10">
        {vista === 'panel' && (
          <div>
            {periodos.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-[#EEEDFE] mx-auto mb-4 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Sin datos financieros</h3>
                <p className="text-xs text-gray-400 mb-4">Carga tu primer periodo para ver el dashboard.</p>
                <button onClick={() => setVista('carga')} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#534AB7] to-[#7C6FDB] text-white text-sm font-semibold hover:shadow-lg transition-all">
                  Cargar primer periodo
                </button>
              </div>
            ) : (
              <>
                {/* Alertas */}
                {alertasCriticas.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {alertasCriticas.map(a => (
                      <div key={a.id} className="bg-red-50 border border-red-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-red-700">{a.titulo}</p>
                        <p className="text-xs text-red-500 mt-0.5">{a.descripcion}</p>
                      </div>
                    ))}
                  </div>
                )}
                {alertasAdvertencia.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {alertasAdvertencia.map(a => (
                      <div key={a.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-amber-700">{a.titulo}</p>
                        <p className="text-xs text-amber-500 mt-0.5">{a.descripcion}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* KPI Cards */}
                {ultimo && kpis && (
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <KpiCard label="Ventas" valor={ultimo.ventas} prefix="$" variacion={variVentas} />
                    <KpiCard label="EBITDA" valor={ultimo.ebitda} prefix="$" variacion={variEbitda} />
                    <KpiCard label="Margen bruto" valor={`${kpis.margenBruto}%`} />
                    <KpiCard label="Margen neto" valor={`${kpis.margenNeto}%`} />
                    <KpiCard label="Caja" valor={ultimo.caja} prefix="$" />
                    <KpiCard label="Deuda" valor={ultimo.deudaFinanciera} prefix="$" />
                  </div>
                )}

                {/* Barras */}
                {ultimo && kpis && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Indicadores operativos</p>
                    <MiniBar label="Margen EBITDA" valor={kpis.margenEbitda} max={100} color="#534AB7" />
                    <MiniBar label={`Dias de cobranza: ${kpis.rotacionCobrar}`} valor={kpis.rotacionCobrar} max={90} color={kpis.rotacionCobrar > 60 ? '#DC2626' : '#0F6E56'} />
                    <MiniBar label={`Dias de pago: ${kpis.rotacionPagar}`} valor={kpis.rotacionPagar} max={90} color="#854F0B" />
                    <MiniBar label="Endeudamiento / Ventas" valor={kpis.endeudamiento} max={100} color={kpis.endeudamiento > 50 ? '#DC2626' : '#534AB7'} />
                  </div>
                )}

                {/* Presupuesto resumen */}
                {presupuesto && (
                  <div className="bg-[#EEEDFE]/60 border border-[#DDD9FE] rounded-2xl p-4 mb-5">
                    <p className="text-xs font-semibold text-[#3C3489] uppercase tracking-wide mb-2">Presupuesto {presupuesto.anio}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-500">Ventas plan:</span> <span className="font-semibold text-gray-900">{fmtMoney(presupuesto.ventas)}</span></div>
                      <div><span className="text-gray-500">EBITDA plan:</span> <span className="font-semibold text-gray-900">{fmtMoney(presupuesto.ebitda)}</span></div>
                    </div>
                  </div>
                )}

                {/* Lista periodos */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Periodos cargados ({periodos.length})</p>
                    <button onClick={() => { setEditandoId(null); setVista('carga'); }} className="text-xs font-semibold text-[#534AB7] hover:underline">+ Nuevo periodo</button>
                  </div>
                  <div className="space-y-2">
                    {periodos.map(p => (
                      <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{MESES[p.mes - 1]} {p.anio}</p>
                          <p className="text-xs text-gray-400">Ventas: {fmtMoney(p.ventas)} | EBITDA: {fmtMoney(p.ebitda)}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditandoId(p.id); setVista('carga'); }} className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">Editar</button>
                          <button onClick={() => eliminarPeriodo(p.id)} className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-400 hover:bg-red-50">Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {vista === 'carga' && (
          <CargaDatos
            periodoInicial={editandoId ? periodos.find(p => p.id === editandoId) ?? periodoVacio(new Date().getMonth() + 1, new Date().getFullYear()) : periodoVacio(new Date().getMonth() + 1, new Date().getFullYear())}
            onGuardar={guardarPeriodo}
            onCancelar={() => { setVista('panel'); setEditandoId(null); }}
          />
        )}

        {vista === 'presupuesto' && (
          <PresupuestoForm
            presupuestoInicial={presupuesto}
            onGuardar={guardarPresupuesto}
            onCancelar={() => setVista('panel')}
          />
        )}

        {vista === 'informe' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Informe pre-reunion</h3>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(informe)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium">Copiar</button>
                <button onClick={() => setVista('panel')} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200">Cerrar</button>
              </div>
            </div>
            <pre className="bg-white border border-gray-100 rounded-2xl p-5 text-xs font-mono text-gray-700 whitespace-pre-wrap leading-relaxed shadow-sm overflow-auto max-h-[70vh]">{informe}</pre>
          </div>
        )}
      </main>
    </div>
  );
}
