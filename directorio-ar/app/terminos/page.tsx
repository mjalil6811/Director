import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout, { Pendiente } from '../../components/LegalLayout';
import { SITIO } from '../../lib/sitio';

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Condiciones de uso de Directorio AR, herramienta gratuita y orientativa para PyMEs argentinas.',
  alternates: { canonical: '/terminos' },
};

// TODO(matias): completar datos del titular en lib/sitio.ts y la jurisdicción abajo.
export default function TerminosPage() {
  const { titular, email } = SITIO;
  return (
    <LegalLayout titulo="Términos y condiciones">
      <p>
        Al usar {SITIO.nombre} (la &quot;herramienta&quot;) aceptás estos términos. La herramienta es ofrecida por{' '}
        {titular.razonSocial ?? <Pendiente>nombre o razón social del titular</Pendiente>}, CUIT {titular.cuit ?? <Pendiente>CUIT</Pendiente>},
        con domicilio en {titular.domicilio ?? <Pendiente>domicilio</Pendiente>} (el &quot;titular&quot;).
      </p>

      <h2>1. Qué es la herramienta</h2>
      <p>
        Es un servicio gratuito que ayuda a dueños y directivos de empresas a evaluar si les conviene sumar un consejo asesor
        o directorio, y ofrece plantillas y herramientas para organizarlo. Funciona en tu navegador y no requiere registro.
      </p>

      <h2>2. Naturaleza orientativa</h2>
      <p>
        Los resultados, índices, recomendaciones, informes y plantillas (actas, protocolos, agendas y similares) son
        <strong> orientativos y generales</strong>. Se calculan a partir de tus respuestas y de supuestos simplificados.
        <strong> No constituyen asesoramiento legal, contable, impositivo ni financiero</strong>, ni reemplazan el consejo de
        profesionales que conozcan tu caso. Antes de constituir un órgano societario, firmar un acuerdo o tomar una decisión
        relevante, consultá con un abogado, contador u otro profesional matriculado.
      </p>

      <h2>3. Tus datos y tu responsabilidad</h2>
      <p>
        Tus respuestas y documentos se guardan en tu navegador; sos responsable de resguardarlos (por ejemplo, exportando un
        respaldo). El titular no tiene copia y no puede recuperarlos. El tratamiento de datos se describe en la{' '}
        <Link href="/privacidad">Política de privacidad</Link>. Te comprometés a usar la herramienta de buena fe y a no
        intentar afectar su funcionamiento (por ejemplo, enviando pedidos automatizados al formulario de mail).
      </p>

      <h2>4. Limitación de responsabilidad</h2>
      <p>
        La herramienta se ofrece &quot;tal como está&quot;, sin garantía de que sea exacta, completa o esté siempre disponible.
        En la máxima medida permitida por la ley, el titular no responde por decisiones tomadas en base a los resultados,
        por la pérdida de datos guardados en tu navegador ni por daños indirectos o lucro cesante derivados del uso de la
        herramienta. Nada de lo anterior limita derechos que no puedan renunciarse según las normas de orden público aplicables.
      </p>

      <h2>5. Propiedad intelectual</h2>
      <p>
        La marca {SITIO.nombre}, el diseño, los textos, las preguntas, la metodología de cálculo y el código de la herramienta
        pertenecen al titular y están protegidos por la Ley 11.723 y normas concordantes. Podés usar los informes y documentos
        que generes para tu empresa, incluso compartirlos con asesores, pero no podés copiar ni redistribuir la herramienta o
        su contenido con fines comerciales sin autorización escrita.
      </p>

      <h2>6. Cambios en el servicio y en estos términos</h2>
      <p>
        El titular puede modificar, suspender o discontinuar la herramienta, y actualizar estos términos. La versión vigente es
        la publicada en esta página, con su fecha de actualización.
      </p>

      <h2>7. Ley aplicable y jurisdicción</h2>
      <p>
        Estos términos se rigen por las leyes de la República Argentina. Ante cualquier controversia serán competentes los
        tribunales ordinarios de <Pendiente>ciudad / jurisdicción</Pendiente>, sin perjuicio de los derechos que correspondan a
        quienes sean consumidores según la Ley 24.240.
      </p>

      <h2>8. Contacto</h2>
      <p>Consultas: {email ?? <Pendiente>mail de contacto</Pendiente>}.</p>
    </LegalLayout>
  );
}
