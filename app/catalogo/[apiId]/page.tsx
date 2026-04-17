'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import NavBar from '@/app/components/ui/NavBar';
import type { ApiDefinition } from '@/app/lib/catalogo';
import {
  type PeticionPrueba,
  type RespuestaPrueba,
  type SandboxError,
  formatHttpResponse,
  classifySandboxError,
} from '@/app/lib/http-utils';

// --- Mock OpenAPI spec data ---

interface OpenAPIEndpoint {
  path: string;
  method: string;
  summary: string;
  description: string;
  parameters: OpenAPIParameter[];
  requestBody?: { contentType: string; schema: Record<string, unknown> };
  responses: Record<string, { description: string; schema?: Record<string, unknown> }>;
}

interface OpenAPIParameter {
  name: string;
  in: 'query' | 'path' | 'header';
  required: boolean;
  type: string;
  description: string;
}

interface OpenAPISpec {
  title: string;
  version: string;
  description: string;
  baseUrl: string;
  endpoints: OpenAPIEndpoint[];
}

// Mock API catalog (same as catalogo/page.tsx)
const apisData: ApiDefinition[] = [
  { id: 'api-vida-cotizacion', nombre: 'Cotización Vida', descripcionSemantica: 'Genera cotizaciones personalizadas de seguros de vida basadas en perfil del asegurado', lineaSeguro: 'vida', aiCapability: 'quote_life_insurance', specUrl: '/specs/vida-cotizacion.yaml' },
  { id: 'api-vida-beneficiarios', nombre: 'Beneficiarios Vida', descripcionSemantica: 'Gestiona beneficiarios de pólizas de vida, incluyendo alta, baja y modificación', lineaSeguro: 'vida', aiCapability: 'manage_life_beneficiaries', specUrl: '/specs/vida-beneficiarios.yaml' },
  { id: 'api-hogar-poliza', nombre: 'Póliza Hogar', descripcionSemantica: 'Gestiona pólizas de seguros de hogar, consulta coberturas y estado de la póliza', lineaSeguro: 'hogar', aiCapability: 'manage_home_policy', specUrl: '/specs/hogar-poliza.yaml' },
  { id: 'api-hogar-siniestro', nombre: 'Siniestro Hogar', descripcionSemantica: 'Reporta y da seguimiento a siniestros de seguros de hogar', lineaSeguro: 'hogar', aiCapability: 'report_home_claim', specUrl: '/specs/hogar-siniestro.yaml' },
  { id: 'api-autos-cotizacion', nombre: 'Cotización Autos', descripcionSemantica: 'Genera cotizaciones de seguros de autos según modelo, año y perfil del conductor', lineaSeguro: 'autos', aiCapability: 'quote_auto_insurance', specUrl: '/specs/autos-cotizacion.yaml' },
  { id: 'api-autos-siniestro', nombre: 'Siniestro Autos', descripcionSemantica: 'Reporta siniestros de seguros de autos con documentación fotográfica', lineaSeguro: 'autos', aiCapability: 'report_auto_claim', specUrl: '/specs/autos-siniestro.yaml' },
  { id: 'api-salud-autorizacion', nombre: 'Autorización Salud', descripcionSemantica: 'Solicita autorizaciones de servicios de salud y consulta estado de aprobación', lineaSeguro: 'salud', aiCapability: 'request_health_auth', specUrl: '/specs/salud-autorizacion.yaml' },
  { id: 'api-salud-red-medica', nombre: 'Red Médica Salud', descripcionSemantica: 'Consulta la red de prestadores médicos disponibles por ubicación y especialidad', lineaSeguro: 'salud', aiCapability: 'query_health_network', specUrl: '/specs/salud-red-medica.yaml' },
];

// Mock OpenAPI specs per API
function getMockSpec(apiId: string): OpenAPISpec | null {
  const api = apisData.find((a) => a.id === apiId);
  if (!api) return null;

  return {
    title: api.nombre,
    version: '1.0.0',
    description: api.descripcionSemantica,
    baseUrl: `/api/v1/${apiId.replace('api-', '')}`,
    endpoints: [
      {
        path: `/${apiId.replace('api-', '')}/consultar`,
        method: 'GET',
        summary: `Consultar ${api.nombre}`,
        description: `Obtiene información de ${api.nombre.toLowerCase()}`,
        parameters: [
          { name: 'id', in: 'query', required: true, type: 'string', description: 'Identificador del recurso' },
          { name: 'formato', in: 'query', required: false, type: 'string', description: 'Formato de respuesta (json, xml)' },
        ],
        responses: {
          '200': { description: 'Consulta exitosa', schema: { type: 'object', properties: { id: { type: 'string' }, data: { type: 'object' } } } },
          '404': { description: 'Recurso no encontrado' },
        },
      },
      {
        path: `/${apiId.replace('api-', '')}/crear`,
        method: 'POST',
        summary: `Crear ${api.nombre}`,
        description: `Crea un nuevo registro de ${api.nombre.toLowerCase()}`,
        parameters: [],
        requestBody: {
          contentType: 'application/json',
          schema: { type: 'object', properties: { nombre: { type: 'string' }, datos: { type: 'object' } }, required: ['nombre'] },
        },
        responses: {
          '201': { description: 'Recurso creado exitosamente', schema: { type: 'object', properties: { id: { type: 'string' }, createdAt: { type: 'string' } } } },
          '400': { description: 'Datos de entrada inválidos' },
        },
      },
      {
        path: `/${apiId.replace('api-', '')}/{id}`,
        method: 'PUT',
        summary: `Actualizar ${api.nombre}`,
        description: `Actualiza un registro existente de ${api.nombre.toLowerCase()}`,
        parameters: [
          { name: 'id', in: 'path', required: true, type: 'string', description: 'Identificador del recurso a actualizar' },
        ],
        requestBody: {
          contentType: 'application/json',
          schema: { type: 'object', properties: { nombre: { type: 'string' }, datos: { type: 'object' } } },
        },
        responses: {
          '200': { description: 'Recurso actualizado exitosamente' },
          '404': { description: 'Recurso no encontrado' },
        },
      },
      {
        path: `/${apiId.replace('api-', '')}/{id}`,
        method: 'DELETE',
        summary: `Eliminar ${api.nombre}`,
        description: `Elimina un registro de ${api.nombre.toLowerCase()}`,
        parameters: [
          { name: 'id', in: 'path', required: true, type: 'string', description: 'Identificador del recurso a eliminar' },
        ],
        responses: {
          '200': { description: 'Recurso eliminado exitosamente' },
          '404': { description: 'Recurso no encontrado' },
        },
      },
    ],
  };
}

// Mock sandbox credentials (would come from session/cookies in production)
const mockSandboxCredentials = {
  clientId: 'sandbox-demo-client-id',
  clientSecret: 'sandbox-demo-client-secret',
  createdAt: new Date().toISOString(),
};

// --- Method color helpers ---

const methodColors: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800',
  POST: 'bg-green-100 text-green-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
  PATCH: 'bg-purple-100 text-purple-800',
};

// --- Endpoint Detail Component ---

function EndpointCard({
  endpoint,
  isExpanded,
  onToggle,
  onTryIt,
}: {
  endpoint: OpenAPIEndpoint;
  isExpanded: boolean;
  onToggle: () => void;
  onTryIt: (endpoint: OpenAPIEndpoint) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg mb-3" data-testid={`endpoint-${endpoint.method}-${endpoint.path}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow rounded-lg"
        aria-expanded={isExpanded}
        aria-label={`${endpoint.method} ${endpoint.path} — ${endpoint.summary}`}
      >
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-inter font-bold uppercase ${methodColors[endpoint.method] ?? 'bg-gray-100 text-gray-800'}`}>
          {endpoint.method}
        </span>
        <code className="text-sm font-mono text-gray-700 flex-1">{endpoint.path}</code>
        <span className="text-sm font-inter text-gray-500 hidden desktop:inline">{endpoint.summary}</span>
        {isExpanded ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <p className="text-sm font-inter text-gray-600 mt-3 mb-4">{endpoint.description}</p>

          {/* Parameters */}
          {endpoint.parameters.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-inter font-semibold text-gray-800 mb-2">Parámetros</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-inter" role="table" aria-label="Parámetros del endpoint">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 text-gray-600 font-medium">Nombre</th>
                      <th className="text-left py-2 pr-4 text-gray-600 font-medium">Ubicación</th>
                      <th className="text-left py-2 pr-4 text-gray-600 font-medium">Tipo</th>
                      <th className="text-left py-2 pr-4 text-gray-600 font-medium">Requerido</th>
                      <th className="text-left py-2 text-gray-600 font-medium">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.parameters.map((param) => (
                      <tr key={`${param.in}-${param.name}`} className="border-b border-gray-100">
                        <td className="py-2 pr-4"><code className="text-xs bg-gray-100 px-1 rounded">{param.name}</code></td>
                        <td className="py-2 pr-4 text-gray-500">{param.in}</td>
                        <td className="py-2 pr-4 text-gray-500">{param.type}</td>
                        <td className="py-2 pr-4">{param.required ? <span className="text-red-600 font-medium">Sí</span> : <span className="text-gray-400">No</span>}</td>
                        <td className="py-2 text-gray-600">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request Body */}
          {endpoint.requestBody && (
            <div className="mb-4">
              <h4 className="text-sm font-inter font-semibold text-gray-800 mb-2">Cuerpo de la petición</h4>
              <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded overflow-x-auto font-mono">
                {JSON.stringify(endpoint.requestBody.schema, null, 2)}
              </pre>
            </div>
          )}

          {/* Responses */}
          <div className="mb-4">
            <h4 className="text-sm font-inter font-semibold text-gray-800 mb-2">Respuestas</h4>
            {Object.entries(endpoint.responses).map(([code, resp]) => (
              <div key={code} className="flex items-start gap-3 mb-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${code.startsWith('2') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {code}
                </span>
                <div>
                  <span className="text-sm font-inter text-gray-600">{resp.description}</span>
                  {resp.schema && (
                    <pre className="bg-gray-900 text-green-400 text-xs p-2 rounded mt-1 overflow-x-auto font-mono">
                      {JSON.stringify(resp.schema, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onTryIt(endpoint)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded font-inter font-medium text-sm bg-bolivar-green text-bolivar-white hover:bg-bolivar-green/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow"
            aria-label={`Probar endpoint ${endpoint.method} ${endpoint.path}`}
          >
            <Send size={14} aria-hidden="true" />
            Probar endpoint
          </button>
        </div>
      )}
    </div>
  );
}

// --- Try-It Panel Component ---

function TryItPanel({
  endpoint,
  onClose,
}: {
  endpoint: OpenAPIEndpoint;
  onClose: () => void;
}) {
  const [headers, setHeaders] = useState<string>(
    JSON.stringify({ 'Content-Type': 'application/json' }, null, 2),
  );
  const [body, setBody] = useState<string>(
    endpoint.requestBody
      ? JSON.stringify({ nombre: 'ejemplo', datos: {} }, null, 2)
      : '',
  );
  const [response, setResponse] = useState<RespuestaPrueba | null>(null);
  const [error, setError] = useState<SandboxError | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    let parsedHeaders: Record<string, string> = {};
    let parsedBody: unknown = undefined;

    try {
      parsedHeaders = JSON.parse(headers);
    } catch {
      parsedHeaders = {};
    }

    if (body.trim()) {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = body;
      }
    }

    const petition: PeticionPrueba = {
      method: endpoint.method as PeticionPrueba['method'],
      path: endpoint.path,
      headers: parsedHeaders,
      body: parsedBody,
    };

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(petition),
      });

      const data: RespuestaPrueba = await res.json();

      if (!res.ok) {
        const sandboxErr = classifySandboxError(
          data.statusCode,
          data.statusCode === 504,
          data.statusCode === 0,
        );
        setError(sandboxErr);
      } else {
        setResponse(data);
      }
    } catch {
      setError(classifySandboxError(undefined, false, true));
    } finally {
      setLoading(false);
    }
  }, [endpoint, headers, body]);

  return (
    <div
      className="border border-bolivar-green rounded-lg p-4 bg-gray-50 mt-4"
      role="region"
      aria-label={`Panel de prueba para ${endpoint.method} ${endpoint.path}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-inter font-semibold text-gray-900">
          Probar: <span className={`${methodColors[endpoint.method] ?? ''} px-2 py-0.5 rounded text-xs font-bold uppercase`}>{endpoint.method}</span>{' '}
          <code className="text-sm font-mono">{endpoint.path}</code>
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-inter text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow rounded px-2 py-1"
          aria-label="Cerrar panel de prueba"
        >
          Cerrar
        </button>
      </div>

      {/* Credentials info */}
      <div className="bg-bolivar-yellow/10 border border-bolivar-yellow/30 rounded p-3 mb-4">
        <p className="text-xs font-inter text-gray-700">
          <strong>Credenciales sandbox precargadas:</strong> Client ID: <code className="bg-gray-200 px-1 rounded">{mockSandboxCredentials.clientId}</code>
        </p>
      </div>

      {/* Headers */}
      <div className="mb-4">
        <label htmlFor="try-headers" className="block text-sm font-inter font-medium text-gray-700 mb-1">
          Encabezados (JSON)
        </label>
        <textarea
          id="try-headers"
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          rows={3}
          className="w-full font-mono text-xs bg-white border border-gray-300 rounded p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-green"
          aria-label="Encabezados de la petición en formato JSON"
        />
      </div>

      {/* Body (only for non-GET) */}
      {endpoint.method !== 'GET' && (
        <div className="mb-4">
          <label htmlFor="try-body" className="block text-sm font-inter font-medium text-gray-700 mb-1">
            Cuerpo (JSON)
          </label>
          <textarea
            id="try-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="w-full font-mono text-xs bg-white border border-gray-300 rounded p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-green"
            aria-label="Cuerpo de la petición en formato JSON"
          />
        </div>
      )}

      {/* Send button */}
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded font-inter font-medium text-sm bg-bolivar-green text-bolivar-white hover:bg-bolivar-green/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Enviar petición de prueba"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            Enviando…
          </>
        ) : (
          <>
            <Send size={14} aria-hidden="true" />
            Enviar petición
          </>
        )}
      </button>

      {/* Error display */}
      {error && (
        <div
          className="mt-4 border border-red-300 bg-red-50 rounded p-4"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-inter font-semibold text-red-800">{error.message}</p>
              <p className="text-sm font-inter text-red-600 mt-1">{error.suggestion}</p>
              <p className="text-xs font-inter text-red-500 mt-1">Código: {error.code}</p>
              {error.retryable && (
                <button
                  type="button"
                  onClick={handleSend}
                  className="mt-2 text-sm font-inter font-medium text-bolivar-green hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow rounded"
                  aria-label="Reintentar petición"
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Response display */}
      {response && (
        <div className="mt-4" role="region" aria-label="Respuesta del sandbox">
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${response.statusCode < 400 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {response.statusCode}
            </span>
            <span className="text-xs font-inter text-gray-500">{response.durationMs}ms</span>
          </div>

          {/* Response headers */}
          {Object.keys(response.headers).length > 0 && (
            <div className="mb-2">
              <h4 className="text-xs font-inter font-semibold text-gray-600 mb-1">Encabezados de respuesta</h4>
              <pre className="bg-gray-900 text-gray-300 text-xs p-2 rounded overflow-x-auto font-mono">
                {Object.entries(response.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}
              </pre>
            </div>
          )}

          {/* Response body */}
          <div>
            <h4 className="text-xs font-inter font-semibold text-gray-600 mb-1">Cuerpo de la respuesta</h4>
            <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded overflow-x-auto font-mono max-h-80 overflow-y-auto">
              {typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2)}
            </pre>
          </div>

          {/* Formatted output */}
          <details className="mt-2">
            <summary className="text-xs font-inter text-gray-500 cursor-pointer hover:text-gray-700">
              Ver respuesta formateada completa
            </summary>
            <pre className="bg-gray-100 text-gray-800 text-xs p-3 rounded overflow-x-auto font-mono mt-1">
              {formatHttpResponse(response)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

// --- Main Page Component ---

export default function VisorDocumentacionPage() {
  const params = useParams();
  const router = useRouter();
  const apiId = params.apiId as string;

  const api = apisData.find((a) => a.id === apiId);
  const spec = getMockSpec(apiId);

  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
  const [tryItEndpoint, setTryItEndpoint] = useState<OpenAPIEndpoint | null>(null);

  const toggleEndpoint = useCallback((key: string) => {
    setExpandedEndpoints((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleTryIt = useCallback((endpoint: OpenAPIEndpoint) => {
    setTryItEndpoint(endpoint);
  }, []);

  if (!api || !spec) {
    return (
      <>
        <NavBar currentModule="catalogo" />
        <main className="max-w-6xl mx-auto px-4 py-8 desktop:px-8">
          <div className="text-center py-16">
            <h1 className="text-xl font-inter font-bold text-gray-900 mb-2">API no encontrada</h1>
            <p className="text-sm font-inter text-gray-600 mb-4">
              La API solicitada no existe en el catálogo.
            </p>
            <button
              type="button"
              onClick={() => router.push('/catalogo')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded font-inter font-medium text-sm bg-bolivar-green text-bolivar-white hover:bg-bolivar-green/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow"
              aria-label="Volver al catálogo de APIs"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Volver al catálogo
            </button>
          </div>
        </main>
      </>
    );
  }

  const lineaLabels: Record<string, string> = {
    vida: 'Vida', hogar: 'Hogar', autos: 'Autos', salud: 'Salud',
  };

  return (
    <>
      <NavBar currentModule="catalogo" />
      <main className="max-w-6xl mx-auto px-4 py-8 desktop:px-8">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => router.push('/catalogo')}
          className="inline-flex items-center gap-1 text-sm font-inter text-gray-600 hover:text-bolivar-green transition-colors mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow rounded"
          aria-label="Volver al catálogo de APIs"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al catálogo
        </button>

        {/* API Header */}
        <header className="mb-8">
          <div className="flex items-start gap-3 mb-2">
            <h1 className="text-2xl font-inter font-bold text-gray-900">{spec.title}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-inter font-medium bg-gray-100 text-gray-600">
              v{spec.version}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-inter font-medium bg-bolivar-green/10 text-bolivar-green">
              {lineaLabels[api.lineaSeguro] ?? api.lineaSeguro}
            </span>
          </div>
          <p className="text-sm font-inter text-gray-600 mb-2">{spec.description}</p>
          <p className="text-xs font-inter text-gray-400">
            Base URL: <code className="bg-gray-100 px-1 rounded">{spec.baseUrl}</code>
          </p>
        </header>

        {/* Sandbox credentials banner */}
        <div className="bg-bolivar-yellow/10 border border-bolivar-yellow/30 rounded-lg p-4 mb-8" role="status" aria-label="Credenciales sandbox">
          <h2 className="text-sm font-inter font-semibold text-gray-800 mb-1">Credenciales Sandbox Precargadas</h2>
          <p className="text-xs font-inter text-gray-600">
            Client ID: <code className="bg-gray-200 px-1 rounded">{mockSandboxCredentials.clientId}</code>
            {' · '}Las credenciales se incluyen automáticamente en las peticiones de prueba.
          </p>
        </div>

        {/* Endpoints list */}
        <section aria-labelledby="endpoints-heading">
          <h2 id="endpoints-heading" className="text-xl font-inter font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Endpoints ({spec.endpoints.length})
          </h2>

          {spec.endpoints.map((endpoint) => {
            const key = `${endpoint.method}-${endpoint.path}`;
            return (
              <EndpointCard
                key={key}
                endpoint={endpoint}
                isExpanded={expandedEndpoints.has(key)}
                onToggle={() => toggleEndpoint(key)}
                onTryIt={handleTryIt}
              />
            );
          })}
        </section>

        {/* Try-It Panel */}
        {tryItEndpoint && (
          <TryItPanel
            endpoint={tryItEndpoint}
            onClose={() => setTryItEndpoint(null)}
          />
        )}
      </main>
    </>
  );
}
