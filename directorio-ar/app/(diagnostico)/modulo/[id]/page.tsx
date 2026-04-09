'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { storage } from '../../../../lib/storage/storage';
import Modulo1 from './Modulo1';
import Modulo2 from './Modulo2';
import Modulo3 from './Modulo3';
import Modulo4 from './Modulo4';
import Modulo5 from './Modulo5';

function isModuloUnlocked(id: number): boolean {
  if (id === 1) return true;
  if (id === 2) return !!storage.getModulo1Resultado();
  if (id === 3) return !!storage.getModulo2Resultado();
  if (id === 4) return !!storage.getModulo3Resultado();
  if (id === 5) return !!(storage.getModulo4Diagnostico() || storage.getModulo4Frecuencia());
  return false;
}

const MODULO_LABELS: Record<number, string> = {
  1: '¿Necesitás un directorio?',
  2: 'Mapa de decisiones',
  3: '¿Qué perfiles necesitás?',
  4: 'Dinámica y funcionamiento',
  5: 'Directorio y gerencia',
};

export default function ModuloPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params?.id as string, 10);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (isNaN(id) || id < 1 || id > 5) {
      router.replace('/');
      return;
    }
    if (!isModuloUnlocked(id)) {
      setBlocked(true);
    }
    setReady(true);
  }, [id, router]);

  if (!ready) return null;

  if (blocked) {
    const prevId = id - 1;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm border border-gray-200 rounded-xl bg-white p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-2">Módulo bloqueado</h2>
          <p className="text-sm text-gray-500 mb-6">
            Para acceder al <strong>Módulo {id} — {MODULO_LABELS[id]}</strong>, primero tenés que completar el Módulo {prevId}.
          </p>
          <button
            onClick={() => router.push(`/modulo/${prevId}`)}
            className="w-full py-3 px-4 bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold rounded-xl transition-colors text-sm mb-3"
          >
            Ir al Módulo {prevId}
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2 px-4 text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (id === 1) return <Modulo1 />;
  if (id === 2) return <Modulo2 />;
  if (id === 3) return <Modulo3 />;
  if (id === 4) return <Modulo4 />;
  if (id === 5) return <Modulo5 />;

  return null;
}
