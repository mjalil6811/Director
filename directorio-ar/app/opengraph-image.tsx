import { ImageResponse } from 'next/og';
import { LogoMarca } from '../components/og/LogoMarca';
import { TOTAL_MIN_F1 } from '../lib/navegacion';

export const alt = 'Directorio AR — La nueva era de los directorios: asesores que suman y preparan tu empresa para el futuro';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: 'linear-gradient(135deg, #FFFFFF 0%, #EEEDFE 100%)', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <LogoMarca size={72} radio={18} />
          <div style={{ fontSize: 36, fontWeight: 700, color: '#1A1D26' }}>Directorio AR</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 700, color: '#1A1D26', lineHeight: 1.1 }}>La nueva era de los directorios:</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: '#534AB7', lineHeight: 1.1 }}>asesores que suman y preparan tu empresa para el futuro</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, color: '#3C3489' }}>
          <div style={{ display: 'flex', padding: '10px 22px', borderRadius: 999, background: '#534AB7', color: 'white', fontWeight: 700 }}>Diagnóstico gratuito · ~{TOTAL_MIN_F1} min</div>
          <div style={{ display: 'flex' }}>Para PyMEs argentinas</div>
        </div>
      </div>
    ),
    size,
  );
}
