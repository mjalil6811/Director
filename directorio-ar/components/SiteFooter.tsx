import Link from 'next/link';
import { SITIO, mailto } from '../lib/sitio';

export default function SiteFooter() {
  const mail = mailto('Consulta sobre Directorio AR');
  return (
    <footer className="bg-white border-t border-gray-200 px-4 py-10 print:hidden">
      <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand to-brand-light flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">{SITIO.nombre}</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
            Herramienta gratuita y orientativa para PyMEs argentinas que quieren decidir con el respaldo de un consejo asesor.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
            <span>Consejo asesor y directorio</span>
            <span>Empresas argentinas</span>
            <span>100% gratuito</span>
          </div>
        </div>

        <nav aria-label="Legales">
          <p className="text-xs font-semibold text-gray-900 mb-2">Legales</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/privacidad" className="text-gray-600 hover:text-brand underline-offset-2 hover:underline">Política de privacidad</Link></li>
            <li><Link href="/terminos" className="text-gray-600 hover:text-brand underline-offset-2 hover:underline">Términos y condiciones</Link></li>
          </ul>
        </nav>

        <div>
          <p className="text-xs font-semibold text-gray-900 mb-2">Contacto</p>
          {mail ? (
            <a href={mail} className="text-sm text-gray-600 hover:text-brand underline-offset-2 hover:underline break-all">{SITIO.email}</a>
          ) : (
            // TODO(matias): completar SITIO.email en lib/sitio.ts
            <span className="inline-block text-sm text-amber-800 bg-amber-50 border border-dashed border-amber-300 rounded px-2 py-0.5">contacto@… (pendiente)</span>
          )}
        </div>
      </div>
      <p className="max-w-5xl mx-auto text-[11px] text-gray-500 mt-8">
        © {new Date().getFullYear()} {SITIO.nombre}. El diagnóstico es orientativo y no constituye asesoramiento legal, contable ni financiero.
      </p>
    </footer>
  );
}
