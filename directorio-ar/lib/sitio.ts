import { TOTAL_MIN_F1 } from './navegacion';

// Datos del sitio y del titular. Todo lo marcado TODO(matias) se muestra como "pendiente" en la web
// hasta que se complete acá: no hace falta tocar ningún otro archivo.

/** URL pública. En Vercel se puede definir NEXT_PUBLIC_SITE_URL (p. ej. cuando haya dominio propio). */
// TODO(matias): reemplazar por el dominio propio cuando exista.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://director-rai8.vercel.app').replace(/\/$/, '');

export const SITIO = {
  nombre: 'Directorio AR',
  titulo: 'Directorio AR — Consejo asesor para PyMEs argentinas',
  descripcion: `Diagnóstico gratuito de ~${TOTAL_MIN_F1} minutos para PyMEs argentinas: descubrí si es momento de sumar un consejo asesor y cómo armarlo.`,

  // TODO(matias): mail de contacto (p. ej. contacto@tudominio.com.ar). Mientras sea null se muestra "pendiente".
  email: null as string | null,

  // TODO(matias): datos del titular para Privacidad y Términos.
  titular: {
    razonSocial: null as string | null, // nombre o razón social del responsable
    cuit: null as string | null,
    domicilio: null as string | null,
  },

};

/** Fecha de última actualización de Privacidad y Términos. */
export const LEGALES_ACTUALIZADO = '18 de noviembre de 2026';

/** Mientras Privacidad y Términos no tengan revisión legal, se muestra el aviso de borrador. */
export const FLAGS = {
  legalesEnBorrador: true,
};


export function mailto(asunto?: string): string | null {
  if (!SITIO.email) return null;
  return `mailto:${SITIO.email}${asunto ? `?subject=${encodeURIComponent(asunto)}` : ''}`;
}
