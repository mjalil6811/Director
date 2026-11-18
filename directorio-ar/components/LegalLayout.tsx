import Link from 'next/link';
import SiteFooter from './SiteFooter';
import { FLAGS, LEGALES_ACTUALIZADO } from '../lib/sitio';

export default function LegalLayout({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface flex flex-col">
      <main className="flex-1 px-4 py-10">
        <article className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 sm:p-10">
          {FLAGS.legalesEnBorrador && (
            <p role="note" className="mb-6 text-sm font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
              Borrador pendiente de revisión legal.
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{titulo}</h1>
          <p className="text-xs text-gray-500 mt-1 mb-8">Última actualización: {LEGALES_ACTUALIZADO}</p>
          <div className="legal space-y-4 text-sm text-gray-700 leading-relaxed">{children}</div>
          <p className="mt-10 text-sm">
            <Link href="/" className="text-brand font-semibold hover:underline">← Volver al inicio</Link>
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

/** Marca visible para datos que todavía faltan completar. */
export function Pendiente({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-amber-50 border border-dashed border-amber-300 text-amber-900 rounded px-1.5 py-0.5 text-[13px]">
      [{children} — pendiente]
    </span>
  );
}
