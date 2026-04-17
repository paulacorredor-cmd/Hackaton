'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/app/components/ui/ErrorMessage';
import {
  type RegistroFormData,
  type RegistroErrors,
  validateRegistroForm,
} from '@/app/lib/validation';

export default function RegistroPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<RegistroFormData>({
    nit: '',
    razonSocial: '',
    representanteLegal: '',
    correoElectronico: '',
    documentoCamara: null,
  });
  const [errors, setErrors] = useState<RegistroErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegistroErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof RegistroErrors];
        return next;
      });
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, documentoCamara: file }));
    if (errors.documentoCamara) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.documentoCamara;
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateRegistroForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      // Almacenar un ID de socio temporal para la sesión de onboarding.
      // En producción, esto vendría del backend tras registrar al socio.
      const socioId = `socio_${Date.now()}`;
      sessionStorage.setItem('bolivar_socio_id', socioId);
      router.push('/onboarding/terminos');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-inter font-bold text-gray-900 mb-2">
        Registro de Socio
      </h1>
      <p className="text-gray-600 font-inter mb-6">
        Complete los datos de su empresa para iniciar el proceso de integración con las APIs de Seguros Bolívar.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* NIT */}
        <div>
          <label htmlFor="nit" className="block text-sm font-inter font-medium text-gray-700 mb-1">
            NIT de la empresa
          </label>
          <input
            id="nit"
            name="nit"
            type="text"
            value={formData.nit}
            onChange={handleChange}
            placeholder="123456789-0"
            aria-label="NIT de la empresa, formato 9 dígitos guión 1 dígito de verificación"
            aria-describedby={errors.nit ? 'nit-error' : undefined}
            aria-invalid={!!errors.nit}
            className={`
              w-full px-3 py-2 border rounded font-inter text-sm
              focus:outline-none focus:ring-2 focus:ring-bolivar-green
              ${errors.nit ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.nit && <ErrorMessage message={errors.nit} fieldId="nit" />}
        </div>

        {/* Razón Social */}
        <div>
          <label htmlFor="razonSocial" className="block text-sm font-inter font-medium text-gray-700 mb-1">
            Razón social
          </label>
          <input
            id="razonSocial"
            name="razonSocial"
            type="text"
            value={formData.razonSocial}
            onChange={handleChange}
            aria-label="Razón social de la empresa"
            aria-describedby={errors.razonSocial ? 'razonSocial-error' : undefined}
            aria-invalid={!!errors.razonSocial}
            className={`
              w-full px-3 py-2 border rounded font-inter text-sm
              focus:outline-none focus:ring-2 focus:ring-bolivar-green
              ${errors.razonSocial ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.razonSocial && <ErrorMessage message={errors.razonSocial} fieldId="razonSocial" />}
        </div>

        {/* Representante Legal */}
        <div>
          <label htmlFor="representanteLegal" className="block text-sm font-inter font-medium text-gray-700 mb-1">
            Representante legal
          </label>
          <input
            id="representanteLegal"
            name="representanteLegal"
            type="text"
            value={formData.representanteLegal}
            onChange={handleChange}
            aria-label="Nombre del representante legal"
            aria-describedby={errors.representanteLegal ? 'representanteLegal-error' : undefined}
            aria-invalid={!!errors.representanteLegal}
            className={`
              w-full px-3 py-2 border rounded font-inter text-sm
              focus:outline-none focus:ring-2 focus:ring-bolivar-green
              ${errors.representanteLegal ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.representanteLegal && (
            <ErrorMessage message={errors.representanteLegal} fieldId="representanteLegal" />
          )}
        </div>

        {/* Correo Electrónico */}
        <div>
          <label htmlFor="correoElectronico" className="block text-sm font-inter font-medium text-gray-700 mb-1">
            Correo electrónico corporativo
          </label>
          <input
            id="correoElectronico"
            name="correoElectronico"
            type="email"
            value={formData.correoElectronico}
            onChange={handleChange}
            aria-label="Correo electrónico corporativo"
            aria-describedby={errors.correoElectronico ? 'correoElectronico-error' : undefined}
            aria-invalid={!!errors.correoElectronico}
            className={`
              w-full px-3 py-2 border rounded font-inter text-sm
              focus:outline-none focus:ring-2 focus:ring-bolivar-green
              ${errors.correoElectronico ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.correoElectronico && (
            <ErrorMessage message={errors.correoElectronico} fieldId="correoElectronico" />
          )}
        </div>

        {/* Documento Cámara de Comercio (PDF) */}
        <div>
          <label htmlFor="documentoCamara" className="block text-sm font-inter font-medium text-gray-700 mb-1">
            Documento de Cámara de Comercio (PDF)
          </label>
          <input
            id="documentoCamara"
            name="documentoCamara"
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            aria-label="Cargar documento de Cámara de Comercio en formato PDF, máximo 10 MB"
            aria-describedby={errors.documentoCamara ? 'documentoCamara-error' : undefined}
            aria-invalid={!!errors.documentoCamara}
            className={`
              w-full text-sm font-inter file:mr-3 file:py-2 file:px-4
              file:rounded file:border-0 file:text-sm file:font-medium
              file:bg-bolivar-green file:text-bolivar-white
              hover:file:bg-bolivar-green/90 cursor-pointer
              ${errors.documentoCamara ? 'text-red-500' : 'text-gray-700'}
            `}
          />
          <p className="text-xs text-gray-500 mt-1">Formato PDF, máximo 10 MB</p>
          {errors.documentoCamara && (
            <ErrorMessage message={errors.documentoCamara} fieldId="documentoCamara" />
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="
            w-full py-3 rounded font-inter font-semibold text-sm
            bg-bolivar-green text-bolivar-white
            hover:bg-bolivar-green/90 transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {submitting ? 'Enviando…' : 'Continuar'}
        </button>
      </form>
    </div>
  );
}
