'use client';

import type { ApiDefinition, LineaSeguro } from '@/app/lib/catalogo';

export interface TarjetaApiProps {
  api: ApiDefinition;
  onClick: (apiId: string) => void;
}

const lineaLabels: Record<LineaSeguro, string> = {
  vida: 'Vida',
  hogar: 'Hogar',
  autos: 'Autos',
  salud: 'Salud',
};

const lineaBadgeClass: Record<LineaSeguro, string> = {
  vida: 'sb-badge--vida',
  hogar: 'sb-badge--hogar',
  autos: 'sb-badge--autos',
  salud: 'sb-badge--salud',
};

export default function TarjetaApi({ api, onClick }: TarjetaApiProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick(api.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(api.id);
        }
      }}
      className="sb-card cursor-pointer"
      aria-label={`API ${api.nombre}, línea ${lineaLabels[api.lineaSeguro]}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-inter font-semibold text-bolivar-gray-900 leading-snug">
          {api.nombre}
        </h3>
        <span className={`sb-badge ${lineaBadgeClass[api.lineaSeguro]}`}>
          {lineaLabels[api.lineaSeguro]}
        </span>
      </div>
      <p className="text-sm font-inter text-bolivar-gray-500 leading-relaxed">
        {api.descripcionSemantica}
      </p>
    </article>
  );
}
