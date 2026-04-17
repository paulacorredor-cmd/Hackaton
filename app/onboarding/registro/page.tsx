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
      setErrors((prev) => { const next = { ...prev }; delete next[name as keyof RegistroErrors]; return next; });
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, documentoCamara: file }));
    if (errors.documentoCamara) {
      setErrors((prev) => { const next = { ...prev }; delete next.documentoCamara; return next; });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateRegistroForm(formData);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setSubmitting(true);
    try { router.push('/onboarding/terminos'); } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-inter font-bold text-bolivar-gray-900 mb-2 tracking-tight">
        Registro de Socio
      </h1>
      <p className="text-bolivar-gray-500 font-inter mb-8">
        Complete los datos de su empresa para iniciar el proceso de integración con las APIs de Seguros Bolívar.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <label htmlFor="nit" className="block text-sm font-inter font-medium text-bolivar-gray-700 mb-1.5">
            NIT de la empresa
          </label>
          <input id="nit" name="nit" type="text" value={formData.nit} onChange={handleChange}
            placeholder="123456789-0"
            aria-label="NIT de la empresa, formato 9 dígitos guión 1 dígito de verificación"
            aria-describedby={errors.nit ? 'nit-error' : undefined} aria-invalid={!!errors.nit}
            className={`sb-input ${errors.nit ? 'sb-input--error' : ''}`} />
          {errors.nit && <ErrorMessage message={errors.nit} fieldId="nit" />}
        </div>

        <div>
          <label htmlFor="razonSocial" className="block text-sm font-inter font-medium text-bolivar-gray-700 mb-1.5">
            Razón social
          </label>
          <input id="razonSocial" name="razonSocial" type="text" value={formData.razonSocial} onChange={handleChange}
            aria-label="Razón social de la empresa"
            aria-describedby={errors.razonSocial ? 'razonSocial-error' : undefined} aria-invalid={!!errors.razonSocial}
            className={`sb-input ${errors.razonSocial ? 'sb-input--error' : ''}`} />
          {errors.razonSocial && <ErrorMessage message={errors.razonSocial} fieldId="razonSocial" />}
        </div>

        <div>
          <label htmlFor="representanteLegal" className="block text-sm font-inter font-medium text-bolivar-gray-700 mb-1.5">
            Representante legal
          </label>
          <input id="representanteLegal" name="representanteLegal" type="text" value={formData.representanteLegal} onChange={handleChange}
            aria-label="Nombre del representante legal"
            aria-describedby={errors.representanteLegal ? 'representanteLegal-error' : undefined} aria-invalid={!!errors.representanteLegal}
            className={`sb-input ${errors.representanteLegal ? 'sb-input--error' : ''}`} />
          {errors.representanteLegal && <ErrorMessage message={errors.representanteLegal} fieldId="representanteLegal" />}
        </div>

        <div>
          <label htmlFor="correoElectronico" className="block text-sm font-inter font-medium text-bolivar-gray-700 mb-1.5">
            Correo electrónico corporativo
          </label>
          <input id="correoElectronico" name="correoElectronico" type="email" value={formData.correoElectronico} onChange={handleChange}
            aria-label="Correo electrónico corporativo"
            aria-describedby={errors.correoElectronico ? 'correoElectronico-error' : undefined} aria-invalid={!!errors.correoElectronico}
            className={`sb-input ${errors.correoElectronico ? 'sb-input--error' : ''}`} />
          {errors.correoElectronico && <ErrorMessage message={errors.correoElectronico} fieldId="correoElectronico" />}
        </div>

        <div>
          <label htmlFor="documentoCamara" className="block text-sm font-inter font-medium text-bolivar-gray-700 mb-1.5">
            Documento de Cámara de Comercio (PDF)
          </label>
          <input id="documentoCamara" name="documentoCamara" type="file" accept="application/pdf"
            ref={fileInputRef} onChange={handleFileChange}
            aria-label="Cargar documento de Cámara de Comercio en formato PDF, máximo 10 MB"
            aria-describedby={errors.documentoCamara ? 'documentoCamara-error' : undefined} aria-invalid={!!errors.documentoCamara}
            className={`w-full text-sm font-inter file:mr-3 file:py-2.5 file:px-5 file:rounded-sb file:border-0 file:text-sm file:font-semibold file:bg-bolivar-green file:text-white hover:file:bg-bolivar-green-dark cursor-pointer ${errors.documentoCamara ? 'text-red-500' : 'text-bolivar-gray-700'}`} />
          <p className="text-xs text-bolivar-gray-500 mt-1.5">Formato PDF, máximo 10 MB</p>
          {errors.documentoCamara && <ErrorMessage message={errors.documentoCamara} fieldId="documentoCamara" />}
        </div>

        <button type="submit" disabled={submitting} className="sb-btn sb-btn--primary w-full py-3">
          {submitting ? 'Enviando…' : 'Continuar'}
        </button>
      </form>
    </div>
  );
}
