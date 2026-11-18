'use client';

import { useRef, useState } from 'react';
import { descargarRespaldo, hayDatosGuardados, restaurarRespaldo, validarRespaldo } from '../lib/respaldo';
import { trackEvent } from '../lib/analitica';

interface Props {
  /** 'completo': exportar + importar. 'importar': solo restaurar (p. ej. en otro dispositivo). */
  modo?: 'completo' | 'importar';
  className?: string;
  /** Se llama después de restaurar con éxito. Por defecto recarga la página. */
  onRestaurado?: () => void;
}

export default function RespaldoDatos({ modo = 'completo', className = '', onRestaurado }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  function exportar() {
    descargarRespaldo();
    trackEvent('resultado_exportado', { formato: 'json' });
    setMensaje({ tipo: 'ok', texto: 'Respaldo descargado. Guardalo para recuperar tu progreso en otro navegador.' });
  }

  async function importar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2_000_000) {
      setMensaje({ tipo: 'error', texto: 'El archivo es demasiado grande para ser un respaldo de Directorio AR.' });
      return;
    }
    const v = validarRespaldo(await file.text());
    if (!v.ok) {
      setMensaje({ tipo: 'error', texto: v.error });
      return;
    }
    if (hayDatosGuardados() && !confirm('Ya tenés progreso guardado en este navegador. ¿Querés reemplazarlo por el del respaldo? Esta acción no se puede deshacer.')) {
      return;
    }
    restaurarRespaldo(v.respaldo);
    setMensaje({ tipo: 'ok', texto: 'Progreso restaurado.' });
    if (onRestaurado) onRestaurado();
    else window.location.reload();
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        {modo === 'completo' && (
          <button type="button" onClick={exportar} className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            Exportar respaldo (JSON)
          </button>
        )}
        <button type="button" onClick={() => inputRef.current?.click()} className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          Importar respaldo
        </button>
        <input ref={inputRef} type="file" accept="application/json,.json" onChange={importar} className="sr-only" tabIndex={-1} aria-label="Elegir archivo de respaldo" />
      </div>
      {mensaje && (
        <p role={mensaje.tipo === 'error' ? 'alert' : 'status'} className={`text-xs mt-2 ${mensaje.tipo === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}
