/**
 * Definiciones de APIs del catálogo de Seguros Bolívar.
 * Datos compartidos entre el catálogo y el agente AI del playground.
 *
 * Requisitos: 5.1, 8.4
 */

import type { ApiDefinition } from './catalogo';

export const apiDefinitions: ApiDefinition[] = [
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
