// Logo para imágenes generadas con ImageResponse (íconos y og:image). Solo estilos inline (Satori).
export function LogoMarca({ size, radio }: { size: number; radio: number }) {
  const icono = Math.round(size * 0.55);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: radio, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #534AB7 0%, #7C6FDB 100%)',
      }}
    >
      <svg width={icono} height={icono} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    </div>
  );
}
