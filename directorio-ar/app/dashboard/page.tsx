'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '../../lib/storage';
import ProgressBar from '../../components/ProgressBar';
import type { Modulo1Resultado, Modulo2Resultado, Modulo3Resultado, Modulo5Resultado } from '../../types';

const PERFIL_LABELS: Record<string, string> = {
  estratega: "Estratega",
  financiero: "Financiero",
  familiar: "Familiar",
  sector: "Experto sectorial",
  legal: "Legal",
  rrhh: "RRHH",
  digital: "Digital",
  inversor: "Inversor",
  control: "Control",
  crisis: "Crisis",
};

export default function DashboardPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [editNombre, setEditNombre] = useState(false);
  const [nombreInput, setNombreInput] = useState('');
  const [m1, setM1] = useState<Modulo1Resultado | null>(null);
  const [m2, setM2] = useState<Modulo2Resultado | null>(null);
  const [m3, setM3] = useState<Modulo3Resultado | null>(null);
  const [m4freq, setM4freq] = useState<string | null>(null);
  const [m5, setM5] = useState<Modulo5Resultado | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const n = storage.getEmpresaNombre() ?? '';
    setNombre(n);
    setNombreInput(n);

    const r1 = storage.getModulo1Resultado();
    if (!r1) {
      router.replace('/modulo/1');
      return;
    }
    setM1(r1);
    setM2(storage.getModulo2Resultado());
    setM3(storage.getModulo3Resultado());
    setM4freq(storage.getModulo4Frecuencia());
    setM5(storage.getModulo5Resultado());
    setReady(true);
  }, [router]);

  function handleSaveNombre() {
    const val = nombreInput.trim();
    setNombre(val);
    storage.setEmpresaNombre(val);
    setEditNombre(false);
  }

  function handleReiniciar() {
    if (confirm('¿Estás seguro que querés reiniciar el diagnóstico? Se borrarán todos los datos.')) {
      storage.clearAll();
      router.push('/');
    }
  }

  async function handleGeneratePDF() {
    setPdfLoading(true);
    try {
      const { generatePDF } = await import('../../components/PDFReport');
      const fecha = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
      const blob = await generatePDF({ empresa: nombre, m1, m2, m3, m4frecuencia: m4freq, m5, fecha });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `directorio-ar-diagnostico${nombre ? `-${nombre.replace(/\s+/g, '-').toLowerCase()}` : ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Error al generar el PDF. Por favor, intentá de nuevo.');
    } finally {
      setPdfLoading(false);
    }
  }

  const completedModules = [!!m1, !!m2, !!m3, !!m4freq, !!m5].filter(Boolean).length;
  const allComplete = completedModules === 5;

  const levelBadge = (nivel: string) => {
    if (!nivel) return 'bg-gray-100 text-gray-600';
    if (nivel === 'Directorio prematuro') return 'bg-gray-100 text-gray-600';
    if (nivel === 'Señales tempranas') return 'bg-yellow-100 text-yellow-800';
    if (nivel === 'Momento de transición') return 'bg-purple-100 text-purple-700';
    if (nivel === 'Necesidad urgente') return 'bg-red-100 text-red-700';
    if (nivel.includes('sana')) return 'bg-green-100 text-green-700';
    if (nivel.includes('construcción')) return 'bg-yellow-100 text-yellow-800';
    if (nivel.includes('serias')) return 'bg-orange-100 text-orange-700';
    if (nivel.includes('crítica')) return 'bg-red-100 text-red-700';
    return 'bg-purple-100 text-purple-700';
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 rounded-xl bg-[#534AB7] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">Dashboard</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-4">
        {/* Company name */}
        <div className="border border-gray-200 rounded-xl bg-white p-4">
          {editNombre ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={nombreInput}
                onChange={e => setNombreInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleSaveNombre(); }}
              />
              <button onClick={handleSaveNombre} className="px-4 py-2 bg-[#534AB7] text-white rounded-xl text-sm font-medium">
                Guardar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Empresa</p>
                <p className="text-base font-bold text-gray-900">{nombre || 'Sin nombre'}</p>
              </div>
              <button onClick={() => setEditNombre(true)} className="text-sm text-[#534AB7] hover:text-[#3C3489] font-medium">
                Editar
              </button>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="border border-gray-200 rounded-xl bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">Progreso del diagnóstico</span>
            <span className="text-sm font-bold text-[#534AB7]">{completedModules}/5</span>
          </div>
          <ProgressBar percentage={(completedModules / 5) * 100} />
        </div>

        {/* Module summaries */}
        {/* M1 */}
        <div className="border border-gray-200 rounded-xl bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center">1</span>
              <span className="text-sm font-semibold text-gray-900">¿Necesitás un directorio?</span>
            </div>
            <button onClick={() => router.push('/modulo/1')} className="text-xs text-[#534AB7] font-medium hover:underline">
              {m1 ? 'Revisar' : 'Completar'}
            </button>
          </div>
          {m1 ? (
            <>
              <ProgressBar percentage={m1.porcentaje ?? 0} label={`${m1.porcentaje}%`} />
              <div className={`inline-flex mt-2 items-center px-2.5 py-1 rounded-full text-xs font-semibold ${levelBadge(m1.nivel)}`}>
                {m1.nivel}
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-400">No completado</p>
          )}
        </div>

        {/* M2 */}
        <div className="border border-gray-200 rounded-xl bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center">2</span>
              <span className="text-sm font-semibold text-gray-900">Clasificador de roles</span>
            </div>
            <button onClick={() => router.push('/modulo/2')} className="text-xs text-[#534AB7] font-medium hover:underline">
              {m2 ? 'Revisar' : 'Completar'}
            </button>
          </div>
          {m2 ? (
            <>
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${levelBadge(m2.perfil)} mb-2`}>
                {m2.perfil}
              </div>
              <p className="text-xs text-gray-500">
                Confusión de roles: {100 - (m2.porcentaje ?? 0)}% de respuestas incorrectas
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-400">No completado</p>
          )}
        </div>

        {/* M3 */}
        <div className="border border-gray-200 rounded-xl bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center">3</span>
              <span className="text-sm font-semibold text-gray-900">Perfiles del directorio</span>
            </div>
            <button onClick={() => router.push('/modulo/3')} className="text-xs text-[#534AB7] font-medium hover:underline">
              {m3 ? 'Revisar' : 'Completar'}
            </button>
          </div>
          {m3 ? (
            <div className="space-y-1">
              {m3.topPerfiles.slice(0, 2).map(p => (
                <div key={p.perfil} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{PERFIL_LABELS[p.perfil] ?? p.perfil}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                    ${p.urgencia === 'Crítico' ? 'bg-red-100 text-red-700' :
                      p.urgencia === 'Urgente' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {p.urgencia}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No completado</p>
          )}
        </div>

        {/* M4 */}
        <div className="border border-gray-200 rounded-xl bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center">4</span>
              <span className="text-sm font-semibold text-gray-900">Dinámica de reuniones</span>
            </div>
            <button onClick={() => router.push('/modulo/4')} className="text-xs text-[#534AB7] font-medium hover:underline">
              {m4freq ? 'Revisar' : 'Completar'}
            </button>
          </div>
          {m4freq ? (
            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700`}>
              {m4freq}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No completado</p>
          )}
        </div>

        {/* M5 */}
        <div className="border border-gray-200 rounded-xl bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center">5</span>
              <span className="text-sm font-semibold text-gray-900">Directorio y gerencia</span>
            </div>
            <button onClick={() => router.push('/modulo/5')} className="text-xs text-[#534AB7] font-medium hover:underline">
              {m5 ? 'Revisar' : 'Completar'}
            </button>
          </div>
          {m5 ? (
            <>
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${levelBadge(m5.nivel)} mb-1`}>
                {m5.nivel}
              </div>
              <p className="text-xs text-gray-500">{m5.porcentaje}% de cumplimiento</p>
            </>
          ) : (
            <p className="text-xs text-gray-400">No completado</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleGeneratePDF}
            disabled={!allComplete || pdfLoading}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2
              ${allComplete && !pdfLoading
                ? 'bg-[#534AB7] hover:bg-[#3C3489] text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {pdfLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Generando PDF...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                {allComplete ? 'Generar reporte PDF' : `Completá todos los módulos para generar el PDF (${completedModules}/5)`}
              </>
            )}
          </button>

          <button
            onClick={handleReiniciar}
            className="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Reiniciar diagnóstico
          </button>
        </div>

        {/* Module navigation */}
        <div className="border border-gray-200 rounded-xl bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Ir a módulo</h3>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => router.push(`/modulo/${n}`)}
                className="flex flex-col items-center py-3 border border-gray-200 rounded-xl hover:border-[#534AB7] hover:bg-purple-50 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-[#534AB7] text-white text-xs font-bold flex items-center justify-center">
                  {n}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
