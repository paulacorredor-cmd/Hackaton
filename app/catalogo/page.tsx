'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download } from 'lucide-react';
import NavBar from '@/app/components/ui/NavBar';
import TarjetaApi from '@/app/components/catalogo/TarjetaApi';
import {
  type ApiDefinition,
  type LineaSeguro,
  filtrarApisPorLinea,
  generarManifiestoAI,
} from '@/app/lib/catalogo';

// --- Sample/mock API data for all 4 insurance lines ---
const apisData: ApiDefinition[] = [
  {
    id: 'api-vida-cotizacion',
    nombre: 'Cotización Vida',
    descripcionSemantica: 'Genera cotizaciones personalizadas de seguros de vida basadas en perfil del asegurado',
    lineaSeguro: 'vida',
    aiCapability: 'quote_life_insurance',
    specUrl: '/specs/vida-cotizacion.yaml',
  },
  {
    id: 'api-vida-beneficiarios',
    nombre: 'Beneficiarios Vida',
    descripcionSemantica: 'Gestiona beneficiarios de pólizas de vida, incluyendo alta, baja y modificación',
    lineaSeguro: 'vida',
    aiCapability: 'manage_life_beneficiaries',
    specUrl: '/specs/vida-beneficiarios.yaml',
  },
  {
    id: 'api-hogar-poliza',
    nombre: 'Póliza Hogar',
    descripcionSemantica: 'Gestiona pólizas de seguros de hogar, consulta coberturas y estado de la póliza',
    lineaSeguro: 'hogar',
    aiCapability: 'manage_home_policy',
    specUrl: '/specs/hogar-poliza.yaml',
  },
  {
    id: 'api-hogar-siniestro',
    nombre: 'Siniestro Hogar',
    descripcionSemantica: 'Reporta y da seguimiento a siniestros de seguros de hogar',
    lineaSeguro: 'hogar',
    aiCapability: 'report_home_claim',
    specUrl: '/specs/hogar-siniestro.yaml',
  },
  {
    id: 'api-autos-cotizacion',
    nombre: 'Cotización Autos',
    descripcionSemantica: 'Genera cotizaciones de seguros de autos según modelo, año y perfil del conductor',
    lineaSeguro: 'autos',
    aiCapability: 'quote_auto_insurance',
    specUrl: '/specs/autos-cotizacion.yaml',
  },
  {
    id: 'api-autos-siniestro',
    nombre: 'Siniestro Autos',
    descripcionSemantica: 'Reporta siniestros de seguros de autos con documentación fotográfica',
    lineaSeguro: 'autos',
    aiCapability: 'report_auto_claim',
    specUrl: '/specs/autos-siniestro.yaml',
  },
  {
    id: 'api-salud-autorizacion',
    nombre: 'Autorización Salud',
    descripcionSemantica: 'Solicita autorizaciones de servicios de salud y consulta estado de aprobación',
    lineaSeguro: 'salud',
    aiCapability: 'request_health_auth',
    specUrl: '/specs/salud-autorizacion.yaml',
  },
  {
    id: 'api-salud-red-medica',
    nombre: 'Red Médica Salud',
    descripcionSemantica: 'Consulta la red de prestadores médicos disponibles por ubicación y especialidad',
    lineaSeguro: 'salud',
    aiCapability: 'query_health_network',
    specUrl: '/specs/salud-red-medica.yaml',
  },
];

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
