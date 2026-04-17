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

const lineaColors: Record<LineaSeguro, string> = {
  vida: 'bg-purple-100 text-purple-800',
  hogar: 'bg-blue-100 text-blue-800',
  autos: 'bg-orange-100 text-orange-800',
  salud: 'bg-emerald-100 text-emerald-800',
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
      className="
        border border-gray-200 rounded-lg p-4 cursor-pointer
        hover:border-bolivar-green hover:shadow-md transition-all
        focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow
        bg-bolivar-white
      "
      aria-label={`API ${api.nombre}, línea ${lineaLabels[api.lineaSeguro]}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-inter font-semibold text-gray-900">
          {api.nombre}
        </h3>
        <span
          className={`
            inline-flex items-center px-2 py-0.5 rounded text-xs font-inter font-medium whitespace-nowrap
            ${lineaColors[api.lineaSeguro]}
          `}
        >
          {lineaLabels[api.lineaSeguro]}
        </span>
      </div>
      <p className="text-sm font-inter text-gray-600 leading-relaxed">
        {api.descripcionSemantica}
      </p>
    </article>
  );
}
