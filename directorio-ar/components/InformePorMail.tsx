'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import type { PedidoInforme } from '../lib/informe-mail';
import { trackEvent } from '../lib/analitica';

type Resumen = Omit<PedidoInforme, 'email' | 'consentimiento' | 'website'>;

/** Bloque opt-in "Recibí tu informe por mail". Solo se renderiza si el servidor tiene el mail configurado. */
export default function InformePorMail({ resumen }: { resumen: Resumen }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [acepta, setAcepta] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle');
  const [mensaje, setMensaje] = useState('');

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!acepta) {
      setEstado('error');
      setMensaje('Tenés que aceptar la Política de privacidad.');
      return;
    }
    setEstado('enviando');
    setMensaje('');
    try {
      const res = await fetch('/api/informe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...resumen, email, consentimiento: acepta, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setEstado('error');
        setMensaje(data.error ?? 'No pudimos enviar el mail. Intentá de nuevo en unos minutos.');
        return;
      }
      trackEvent('informe_mail_solicitado');
      setEstado('ok');
    } catch {
      setEstado('error');
      setMensaje('No hay conexión. Revisá internet e intentá de nuevo.');
    }
  }

  if (estado === 'ok') {
    return (
      <div role="status" className="bg-white border border-emerald-200 rounded-2xl p-5 print:hidden">
        <p className="text-sm font-semibold text-emerald-800">Listo: te enviamos el informe a {email}.</p>
        <p className="text-xs text-gray-600 mt-1">Si no lo ves en unos minutos, revisá la carpeta de spam o promociones.</p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="relative bg-white border border-gray-200 rounded-2xl p-5 print:hidden" aria-labelledby={`${id}-titulo`}>
      <h2 id={`${id}-titulo`} className="text-base font-bold text-gray-900">Recibí tu informe por mail</h2>
      <p className="text-xs text-gray-600 mt-1 mb-4 leading-relaxed">
        Opcional. Te mandamos un resumen (resultado, próximo paso, puntaje por dimensión y recomendaciones). No enviamos tus respuestas una por una.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor={`${id}-email`} className="sr-only">Tu mail</label>
        <input
          id={`${id}-email`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="tu@mail.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          aria-invalid={estado === 'error' && !!mensaje && mensaje.toLowerCase().includes('mail')}
          aria-describedby={mensaje ? `${id}-msg` : undefined}
          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-brand"
        />
        <button
          type="submit"
          disabled={estado === 'enviando'}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand hover:bg-brand-dark text-white disabled:opacity-60"
        >
          {estado === 'enviando' ? 'Enviando…' : 'Enviarme el informe'}
        </button>
      </div>

      {/* Honeypot: oculto para personas, visible para bots */}
      <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor={`${id}-web`}>Sitio web</label>
        <input id={`${id}-web`} type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
      </div>

      <label className="flex items-start gap-2 mt-3 text-xs text-gray-700 leading-relaxed cursor-pointer">
        <input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} className="mt-0.5 w-4 h-4 accent-brand shrink-0" />
        <span>
          Acepto que se use mi mail para enviarme este informe, según la{' '}
          <Link href="/privacidad" target="_blank" className="text-brand font-semibold underline underline-offset-2">Política de privacidad</Link>.
        </span>
      </label>

      {mensaje && (
        <p id={`${id}-msg`} role="alert" className="text-xs text-red-700 mt-3">{mensaje}</p>
      )}
    </form>
  );
}
