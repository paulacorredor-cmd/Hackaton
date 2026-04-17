'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LEGAL_TEXT = `
<h2>Términos y Condiciones de Open Insurance</h2>
<h3>Circular 005 — Superintendencia Financiera de Colombia</h3>

<p>El presente acuerdo establece los términos y condiciones bajo los cuales el Socio podrá acceder y utilizar las APIs de Seguros Bolívar en el marco del estándar de Open Insurance colombiano, conforme a lo dispuesto en la Circular 005 de la Superintendencia Financiera de Colombia.</p>

<h3>1. Definiciones</h3>
<p><strong>Socio:</strong> Persona jurídica que ha completado el proceso de registro en el Portal de Desarrolladores de Seguros Bolívar y ha sido autorizada para acceder a las APIs.</p>
<p><strong>APIs:</strong> Interfaces de programación de aplicaciones proporcionadas por Seguros Bolívar para la consulta y operación de productos de seguros.</p>
<p><strong>Sandbox:</strong> Entorno de pruebas proporcionado al Socio para validar integraciones antes de pasar a producción.</p>
<p><strong>Datos Personales:</strong> Cualquier información relativa a una persona natural identificada o identificable, conforme a la Ley 1581 de 2012.</p>

<h3>2. Objeto del Acuerdo</h3>
<p>El presente acuerdo tiene por objeto regular el acceso, uso y responsabilidades asociadas a la utilización de las APIs de Seguros Bolívar por parte del Socio, en cumplimiento de la normativa de Open Insurance establecida por la Superintendencia Financiera de Colombia.</p>

<h3>3. Obligaciones del Socio</h3>
<p>El Socio se compromete a:</p>
<ul>
  <li>Utilizar las APIs exclusivamente para los fines autorizados en este acuerdo.</li>
  <li>Proteger las credenciales de acceso (Client_ID y Client_Secret) y no compartirlas con terceros no autorizados.</li>
  <li>Cumplir con la Ley 1581 de 2012 de Protección de Datos Personales y demás normativa aplicable.</li>
  <li>Notificar de manera inmediata cualquier incidente de seguridad o uso no autorizado de las credenciales.</li>
  <li>Mantener actualizados los datos de registro proporcionados en el Portal.</li>
</ul>

<h3>4. Protección de Datos</h3>
<p>El tratamiento de datos personales se realizará conforme a la Ley 1581 de 2012 y sus decretos reglamentarios. El Socio actuará como Responsable del Tratamiento respecto a los datos que obtenga a través de las APIs y deberá contar con la autorización previa, expresa e informada de los titulares.</p>

<h3>5. Niveles de Servicio</h3>
<p>Seguros Bolívar se compromete a mantener una disponibilidad del 99.5% en el entorno de producción. El entorno Sandbox se proporciona "tal cual" sin garantías de disponibilidad.</p>

<h3>6. Limitación de Responsabilidad</h3>
<p>Seguros Bolívar no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de las APIs. La responsabilidad total de Seguros Bolívar no excederá el monto de las tarifas pagadas por el Socio en los últimos 12 meses.</p>

<h3>7. Propiedad Intelectual</h3>
<p>Las APIs, documentación, especificaciones y demás materiales proporcionados por Seguros Bolívar son propiedad exclusiva de Seguros Bolívar. El Socio no adquiere ningún derecho de propiedad intelectual sobre los mismos.</p>

<h3>8. Vigencia y Terminación</h3>
<p>Este acuerdo entrará en vigencia a partir de la aceptación por parte del Socio y tendrá una duración indefinida. Cualquiera de las partes podrá terminarlo con un preaviso de 30 días calendario.</p>

<h3>9. Ley Aplicable</h3>
<p>Este acuerdo se regirá por las leyes de la República de Colombia. Cualquier controversia será resuelta por los tribunales competentes de la ciudad de Bogotá D.C.</p>
`.trim();

export default function TerminosPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleContinue() {
    if (!accepted) return;

    setSubmitting(true);
    try {
      const timestamp = new Date().toISOString();
      // In a real app, this would POST the acceptance to an API endpoint.
      // Store acceptance timestamp in sessionStorage for downstream use.
      sessionStorage.setItem('terminosAceptados', timestamp);
      router.push('/onboarding/sandbox');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-inter font-bold text-gray-900 mb-2">
        Términos y Condiciones
      </h1>
      <p className="text-gray-600 font-inter mb-6">
        Revise y acepte los términos de Open Insurance para continuar con el proceso de registro.
      </p>

      {/* Scrollable legal text panel */}
      <div
        className="border border-gray-300 rounded bg-gray-50 p-4 overflow-y-auto max-h-96 mb-6 font-inter text-sm text-gray-700 prose prose-sm prose-headings:text-gray-900 prose-headings:font-inter"
        role="region"
        aria-label="Texto legal de términos y condiciones"
        tabIndex={0}
        dangerouslySetInnerHTML={{ __html: LEGAL_TEXT }}
      />

      {/* Checkbox */}
      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-gray-300 text-bolivar-green focus:ring-2 focus:ring-bolivar-green accent-bolivar-green"
          aria-label="Acepto los términos y condiciones de Open Insurance según la Circular 005"
        />
        <span className="text-sm font-inter text-gray-700">
          Acepto los términos y condiciones de Open Insurance según la Circular 005
        </span>
      </label>

      {/* Continue button */}
      <button
        type="button"
        disabled={!accepted || submitting}
        onClick={handleContinue}
        className="
          w-full py-3 rounded font-inter font-semibold text-sm
          bg-bolivar-green text-bolivar-white
          hover:bg-bolivar-green/90 transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {submitting ? 'Procesando…' : 'Continuar'}
      </button>
    </div>
  );
}
