import type { Metadata } from 'next';
import ResultadoCliente from './ResultadoCliente';
import { mailConfigurado } from '../../lib/informe-mail';

export const metadata: Metadata = {
  title: 'Resultado final',
  robots: { index: false },
};

// Se evalúa en cada pedido para que el bloque de mail aparezca apenas se configuren las variables de entorno.
export const dynamic = 'force-dynamic';

export default function ResultadoPage() {
  return <ResultadoCliente mailHabilitado={mailConfigurado()} />;
}
