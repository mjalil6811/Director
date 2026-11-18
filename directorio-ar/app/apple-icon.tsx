import { ImageResponse } from 'next/og';
import { LogoMarca } from '../components/og/LogoMarca';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// iOS redondea las esquinas solo: el ícono va a sangre.
export default function AppleIcon() {
  return new ImageResponse(<LogoMarca size={180} radio={0} />, size);
}
