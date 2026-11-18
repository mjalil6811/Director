import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout, { Pendiente } from '../../components/LegalLayout';
import { SITIO } from '../../lib/sitio';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Cómo trata Directorio AR tus datos: el diagnóstico corre en tu navegador, la analítica es anónima y el mail es opcional.',
  alternates: { canonical: '/privacidad' },
};

// TODO(matias): completar titular, CUIT, domicilio, mail y plazo de conservación en lib/sitio.ts / abajo.
export default function PrivacidadPage() {
  const { titular, email } = SITIO;
  return (
    <LegalLayout titulo="Política de privacidad">
      <p>
        Esta política explica qué datos trata {SITIO.nombre} (la &quot;herramienta&quot;), para qué y cuáles son tus derechos,
        según la Ley 25.326 de Protección de los Datos Personales de la República Argentina y su normativa complementaria.
      </p>

      <h2>1. Responsable</h2>
      <p>
        Responsable del tratamiento: {titular.razonSocial ?? <Pendiente>nombre o razón social del titular</Pendiente>}
        {' '}· CUIT {titular.cuit ?? <Pendiente>CUIT</Pendiente>}
        {' '}· Domicilio: {titular.domicilio ?? <Pendiente>domicilio</Pendiente>}
        {' '}· Contacto: {email ?? <Pendiente>mail de contacto</Pendiente>}.
      </p>

      <h2>2. El diagnóstico funciona en tu navegador</h2>
      <p>
        Las respuestas de los módulos, el nombre de tu empresa (si lo cargás) y los documentos que completás en la herramienta
        (actas, protocolos, reuniones, tablero, tareas, evaluaciones) se guardan <strong>solo en el almacenamiento local
        (localStorage) de tu navegador</strong>. No se envían a ningún servidor, no creamos cuentas de usuario y no tenemos
        una copia: no podemos verlos ni recuperarlos.
      </p>
      <ul>
        <li>Si borrás los datos del navegador, usás una ventana privada o cambiás de dispositivo, perdés el progreso.</li>
        <li>Podés exportar un respaldo en JSON o un informe en PDF. Esos archivos quedan en tu dispositivo y vos decidís qué hacer con ellos.</li>
        <li>Cualquier persona con acceso a tu navegador puede ver esos datos. Si usás una computadora compartida, borrá el progreso al terminar.</li>
      </ul>

      <h2>3. Analítica anónima</h2>
      <p>
        Usamos <strong>Vercel Web Analytics</strong> para saber cuántas personas visitan la herramienta y en qué paso abandonan.
        No usa cookies ni identificadores persistentes y no nos permite identificarte. Registra páginas visitadas, país,
        tipo de dispositivo, navegador y sitio de origen, y estos eventos:
      </p>
      <ul>
        <li>clic en el botón para comenzar el diagnóstico (y en qué parte de la página);</li>
        <li>inicio del diagnóstico, módulo completado (solo el número de módulo) y diagnóstico completado (completo o abreviado);</li>
        <li>exportación del resultado (si fue PDF o JSON);</li>
        <li>solicitud del informe por mail (sin el mail).</li>
      </ul>
      <p>
        <strong>Nunca</strong> enviamos en la analítica tus respuestas, el nombre de tu empresa, tu mail ni ningún texto que escribas.
      </p>

      <h2>4. Si pedís el informe por mail (opcional)</h2>
      <p>
        Solo si lo pedís expresamente y aceptás esta política, enviamos a nuestro servidor: tu dirección de mail, el nombre de
        tu empresa (si lo cargaste) y un resumen del resultado (Índice de preparación, puntaje por dimensión y recomendaciones).
        No enviamos tus respuestas una por una.
      </p>
      <ul>
        <li><strong>Finalidad:</strong> mandarte el informe y, si respondés, contactarte sobre el resultado. No vendemos ni cedemos tus datos.</li>
        <li><strong>Proveedor:</strong> el envío lo hace Resend (servicio de mails). La herramienta está alojada en Vercel. Ambos operan servidores fuera de la Argentina, por lo que el mail implica una transferencia internacional de datos.</li>
        <li><strong>Conservación:</strong> guardamos una copia del pedido (mail y resumen) en nuestra casilla de contacto hasta que pidas la baja y, como máximo, <Pendiente>plazo de conservación, p. ej. 24 meses</Pendiente>.</li>
        <li><strong>Baja:</strong> podés pedir que borremos tus datos en cualquier momento escribiendo a {email ?? <Pendiente>mail de contacto</Pendiente>} o respondiendo el mail recibido.</li>
      </ul>

      <h2>5. Tus derechos</h2>
      <p>
        Podés pedir acceso, rectificación, actualización y supresión de tus datos personales escribiendo a {email ?? <Pendiente>mail de contacto</Pendiente>}.
        Respondemos los pedidos de acceso dentro de los 10 días corridos y los de rectificación o supresión dentro de los 5 días hábiles (arts. 14 y 16, Ley 25.326).
      </p>
      <p className="text-[13px] bg-gray-50 border border-gray-200 rounded-lg p-3">
        El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a
        intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el
        artículo 14, inciso 3 de la Ley N° 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de
        Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten
        afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
      </p>

      <h2>6. Seguridad</h2>
      <p>
        La conexión es cifrada (HTTPS). Para el envío por mail aplicamos validación de datos y límites de uso para prevenir abusos.
      </p>

      <h2>7. Cambios</h2>
      <p>
        Si cambiamos esta política, actualizamos la fecha de arriba. Ver también los <Link href="/terminos">Términos y condiciones</Link>.
      </p>
    </LegalLayout>
  );
}
