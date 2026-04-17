'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download } from 'lucide-react';
import NavBar from '@/app/components/ui/NavBar';
import TarjetaApi from '@/app/components/catalogo/TarjetaApi';
import {
  type LineaSeguro,
  filtrarApisPorLinea,
  generarManifiestoAI,
} from '@/app/lib/catalogo';
import { apiDefinitions } from '@/app/lib/api-definitions';

const apisData = apiDefinitions;

const filtroTabs: { value: LineaSeguro | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'vida', label: 'Vida' },
  { value: 'hogar', label: 'Hogar' },
  { value: 'autos', label: 'Autos' },
  { value: 'salud', label: 'Salud' },
];

const lineaTitles: Record<LineaSeguro, string> = {
  vida: 'Vida',
  hogar: 'Hogar',
  autos: 'Autos',
  salud: 'Salud',
};

export default function CatalogoPage() {
  const router = useRouter();
  const [filtroActivo, setFiltroActivo] = useState<LineaSeguro | 'todas'>('todas');

  const apisFiltradas = filtrarApisPorLinea(apisData, filtroActivo);

  function handleCardClick(apiId: string) {
    router.push(`/catalogo/${apiId}`);
  }

  function handleExportManifiesto() {
    const manifiesto = generarManifiestoAI(apisData, filtroActivo);
    const blob = new Blob([JSON.stringify(manifiesto, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bolivar-ai-manifest.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Group filtered APIs by linea for section rendering
  const lineas: LineaSeguro[] = ['vida', 'hogar', 'autos', 'salud'];
  const apisPorLinea = lineas
    .map((linea) => ({
      linea,
      apis: apisFiltradas.filter((api) => api.lineaSeguro === linea),
    }))
    .filter((group) => group.apis.length > 0);

  return (
    <>
      <NavBar currentModule="catalogo" />
      <main className="max-w-6xl mx-auto px-4 py-8 desktop:px-8">
        <div className="flex flex-col desktop:flex-row desktop:items-center desktop:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-inter font-bold text-gray-900">
              Catálogo de APIs
            </h1>
            <p className="text-sm font-inter text-gray-600 mt-1">
              Explora las APIs disponibles organizadas por línea de seguro
            </p>
          </div>
          <button
            onClick={handleExportManifiesto}
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded font-inter font-medium text-sm
              bg-bolivar-green text-bolivar-white
              hover:bg-bolivar-green/90 transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow
            "
            aria-label="Exportar Manifiesto AI"
          >
            <Download size={18} aria-hidden="true" />
            Exportar Manifiesto AI
          </button>
        </div>

        {/* Filter tabs */}
        <div
          className="flex flex-wrap gap-2 mb-8"
          role="tablist"
          aria-label="Filtrar APIs por línea de seguro"
        >
          {filtroTabs.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={filtroActivo === tab.value}
              onClick={() => setFiltroActivo(tab.value)}
              className={`
                px-4 py-2 rounded font-inter font-medium text-sm transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow
                ${
                  filtroActivo === tab.value
                    ? 'bg-bolivar-green text-bolivar-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* API sections by linea */}
        {apisPorLinea.length === 0 ? (
          <p className="text-center text-gray-500 font-inter py-12">
            No se encontraron APIs para el filtro seleccionado.
          </p>
        ) : (
          apisPorLinea.map(({ linea, apis }) => (
            <section key={linea} className="mb-10" aria-labelledby={`section-${linea}`}>
              <h2
                id={`section-${linea}`}
                className="text-xl font-inter font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2"
              >
                {lineaTitles[linea]}
              </h2>
              <div className="grid grid-cols-1 desktop:grid-cols-2 gap-4">
                {apis.map((api) => (
                  <TarjetaApi key={api.id} api={api} onClick={handleCardClick} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </>
  );
}
