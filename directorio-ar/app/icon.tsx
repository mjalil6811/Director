import { ImageResponse } from 'next/og';
import { LogoMarca } from '../components/og/LogoMarca';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<LogoMarca size={32} radio={7} />, size);
}
