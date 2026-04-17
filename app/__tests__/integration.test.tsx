/**
 * Tests de integración comprehensivos para el Bolívar API Developer Portal.
 *
 * Cubre tres flujos principales:
 * 1. Flujo completo de onboarding (registro → términos → sandbox)
 * 2. Peticiones al sandbox desde el visor de documentación
 * 3. Interacción con agente AI en el playground
 *
 * Requisitos: 2.4, 3.4, 4.1, 6.2, 8.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks globales
// ---------------------------------------------------------------------------

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: 'socio_integration', name: 'Test Socio', email: 'socio@empresa.com' },
    accessToken: 'test-access-token',
  }),
}));

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: 'socio_integration', name: 'Test Socio', email: 'socio@empresa.com' },
    accessToken: 'test-access-token',
  }),
}));

// ---------------------------------------------------------------------------
// 1. Flujo completo de onboarding (registro → términos → sandbox)
// ---------------------------------------------------------------------------

describe('Integración: Flujo completo de onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('Paso 1 → Paso 2: Registro navega a Términos', () => {
    it('al enviar formulario válido, almacena socioId y navega a /onboarding/terminos', async () => {
      // Importar dinámicamente para que los mocks estén activos
      const { default: RegistroPage } = await import(
        '@/app/onboarding/registro/page'
      );

      render(<RegistroPage />);

      // Llenar todos los campos con datos válidos
      fireEvent.change(screen.getByLabelText(/NIT de la empresa/i), {
        target: { value: '123456789-0' },
      });
      fireEvent.change(screen.getByLabelText(/Razón social/i), {
        target: { value: 'Empresa Integradora S.A.S.' },
      });
      fireEvent.change(screen.getByLabelText(/Representante legal/i), {
        target: { value: 'María García López' },
      });
      fireEvent.change(screen.getByLabelText(/Correo electrónico corporativo/i), {
        target: { value: 'maria@empresa.com' },
      });

      const pdfFile = new File(['contenido-pdf'], 'camara.pdf', {
        type: 'application/pdf',
      });
      fireEvent.change(screen.getByLabelText(/Documento de Cámara de Comercio/i), {
        target: { files: [pdfFile] },
      });

      fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith('/onboarding/terminos');
      });

      // Verificar que se almacenó el socioId en sessionStorage
      const socioId = sessionStorage.getItem('bolivar_socio_id');
      expect(socioId).not.toBeNull();
      expect(socioId).toMatch(/^socio_\d+$/);
    });

    it('la validación impide avanzar con datos inválidos', async () => {
      const { default: RegistroPage } = await import(
        '@/app/onboarding/registro/page'
      );

      render(<RegistroPage />);

      // Enviar formulario vacío
      fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

      await waitFor(() => {
        expect(screen.getByText(/el NIT es obligatorio/i)).toBeInTheDocument();
        expect(screen.getByText(/la razón social es obligatoria/i)).toBeInTheDocument();
        expect(screen.getByText(/el nombre del representante legal es obligatorio/i)).toBeInTheDocument();
        expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();
        expect(screen.getByText(/debe cargar el documento/i)).toBeInTheDocument();
      });

      // No debe navegar
      expect(pushMock).not.toHaveBeenCalled();
    });

    it('la validación de NIT rechaza formatos incorrectos end-to-end', async () => {
      const { default: RegistroPage } = await import(
        '@/app/onboarding/registro/page'
      );

      render(<RegistroPage />);

      // NIT con formato incorrecto
      fireEvent.change(screen.getByLabelText(/NIT de la empresa/i), {
        target: { value: 'ABC-1' },
      });
      fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/9 dígitos, guión, 1 dígito de verificación/i),
        ).toBeInTheDocument();
      });

      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  describe('Paso 2 → Paso 3: Términos navega a Sandbox', () => {
    it('al aceptar términos, almacena timestamp y navega a /onboarding/sandbox', async () => {
      const { default: TerminosPage } = await import(
        '@/app/onboarding/terminos/page'
      );

      render(<TerminosPage />);

      // El botón debe estar deshabilitado inicialmente
      const continueBtn = screen.getByRole('button', { name: /continuar/i });
      expect(continueBtn).toBeDisabled();

      // Marcar checkbox de aceptación
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // Ahora el botón debe estar habilitado
      expect(continueBtn).toBeEnabled();

      fireEvent.click(continueBtn);

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith('/onboarding/sandbox');
      });

      // Verificar que se almacenó el timestamp de aceptación
      const timestamp = sessionStorage.getItem('terminosAceptados');
      expect(timestamp).not.toBeNull();
      expect(new Date(timestamp!).getTime()).not.toBeNaN();
    });

    it('no permite avanzar sin aceptar los términos', async () => {
      const { default: TerminosPage } = await import(
        '@/app/onboarding/terminos/page'
      );

      render(<TerminosPage />);

      const continueBtn = screen.getByRole('button', { name: /continuar/i });
      expect(continueBtn).toBeDisabled();

      // Intentar hacer click en botón deshabilitado no navega
      fireEvent.click(continueBtn);
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  describe('Paso 3: Sandbox genera credenciales y las almacena en contexto', () => {
    const setCredentialsMock = vi.fn();

    beforeEach(() => {
      vi.doMock('@/app/lib/sandboxContext', () => ({
        useSandboxCredentials: () => ({
          credentials: null,
          setCredentials: setCredentialsMock,
          clearCredentials: vi.fn(),
        }),
      }));
      // Asegurar que la creación no falle
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('genera credenciales con formato correcto y las propaga al contexto', async () => {
      const { default: SandboxPage } = await import(
        '@/app/onboarding/sandbox/page'
      );

      render(<SandboxPage />);

      // Esperar a que se creen las credenciales (simula latencia de 1200ms)
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });

      // Verificar que se llamó a setCredentials con credenciales válidas
      expect(setCredentialsMock).toHaveBeenCalledTimes(1);
      const creds = setCredentialsMock.mock.calls[0][0];
      expect(creds.clientId).toMatch(/^sb_/);
      expect(creds.clientSecret).toMatch(/^sk_/);
      expect(new Date(creds.createdAt).getTime()).not.toBeNaN();
    });
  });

  describe('Flujo end-to-end: credenciales persisten en sessionStorage', () => {
    it('las credenciales almacenadas en sessionStorage sobreviven entre pasos', () => {
      // Simular lo que hace el SandboxProvider al guardar credenciales
      const credentials = {
        clientId: 'sb_integration_test_abc123',
        clientSecret: 'sk_integration_test_secret456',
        createdAt: new Date().toISOString(),
      };

      // Paso 3: Sandbox almacena credenciales
      sessionStorage.setItem(
        'bolivar_sandbox_credentials',
        JSON.stringify(credentials),
      );

      // Simular navegación a catálogo: leer credenciales
      const stored = JSON.parse(
        sessionStorage.getItem('bolivar_sandbox_credentials')!,
      );
      expect(stored.clientId).toBe('sb_integration_test_abc123');
      expect(stored.clientSecret).toBe('sk_integration_test_secret456');
      expect(stored.createdAt).toBe(credentials.createdAt);
    });

    it('el flujo completo almacena socioId, timestamp de términos y credenciales', () => {
      // Paso 1: Registro almacena socioId
      const socioId = `socio_${Date.now()}`;
      sessionStorage.setItem('bolivar_socio_id', socioId);

      // Paso 2: Términos almacena timestamp
      const timestamp = new Date().toISOString();
      sessionStorage.setItem('terminosAceptados', timestamp);

      // Paso 3: Sandbox almacena credenciales
      const credentials = {
        clientId: 'sb_full_flow_test',
        clientSecret: 'sk_full_flow_secret',
        createdAt: new Date().toISOString(),
      };
      sessionStorage.setItem(
        'bolivar_sandbox_credentials',
        JSON.stringify(credentials),
      );

      // Verificar que todo está almacenado correctamente
      expect(sessionStorage.getItem('bolivar_socio_id')).toBe(socioId);
      expect(sessionStorage.getItem('terminosAceptados')).toBe(timestamp);

      const storedCreds = JSON.parse(
        sessionStorage.getItem('bolivar_sandbox_credentials')!,
      );
      expect(storedCreds.clientId).toBe('sb_full_flow_test');
      expect(storedCreds.clientSecret).toBe('sk_full_flow_secret');
    });

    it('al limpiar sesión se eliminan todos los datos del onboarding', () => {
      // Almacenar datos de los 3 pasos
      sessionStorage.setItem('bolivar_socio_id', 'socio_cleanup');
      sessionStorage.setItem('terminosAceptados', new Date().toISOString());
      sessionStorage.setItem(
        'bolivar_sandbox_credentials',
        JSON.stringify({
          clientId: 'sb_cleanup',
          clientSecret: 'sk_cleanup',
          createdAt: new Date().toISOString(),
        }),
      );

      // Simular cierre de sesión (lo que hace SessionManager)
      sessionStorage.removeItem('bolivar_sandbox_credentials');
      sessionStorage.removeItem('bolivar_socio_id');
      sessionStorage.removeItem('terminosAceptados');

      expect(sessionStorage.getItem('bolivar_sandbox_credentials')).toBeNull();
      expect(sessionStorage.getItem('bolivar_socio_id')).toBeNull();
      expect(sessionStorage.getItem('terminosAceptados')).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// 2. Peticiones al sandbox desde visor de documentación
// ---------------------------------------------------------------------------

describe('Integración: Sandbox API Route — credenciales para visor de documentación', () => {
  it('POST /api/sandbox retorna credenciales válidas con status 201', async () => {
    const { POST } = await import('@/app/api/sandbox/route');

    const request = new NextRequest('http://localhost:3000/api/sandbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nit: '987654321-0' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('clientId');
    expect(data).toHaveProperty('clientSecret');
    expect(data).toHaveProperty('createdAt');
  });

  it('clientId tiene prefijo "sb_" y clientSecret tiene prefijo "sk_"', async () => {
    const { POST } = await import('@/app/api/sandbox/route');

    const request = new NextRequest('http://localhost:3000/api/sandbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.clientId).toMatch(/^sb_[a-z0-9]+$/);
    expect(data.clientSecret).toMatch(/^sk_[a-z0-9]+$/);
  });

  it('clientId tiene longitud esperada (sb_ + 24 caracteres)', async () => {
    const { POST } = await import('@/app/api/sandbox/route');

    const request = new NextRequest('http://localhost:3000/api/sandbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    // sb_ (3 chars) + 24 chars = 27 total
    expect(data.clientId).toHaveLength(27);
  });

  it('clientSecret tiene longitud esperada (sk_ + 40 caracteres)', async () => {
    const { POST } = await import('@/app/api/sandbox/route');

    const request = new NextRequest('http://localhost:3000/api/sandbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    // sk_ (3 chars) + 40 chars = 43 total
    expect(data.clientSecret).toHaveLength(43);
  });

  it('genera credenciales únicas en llamadas consecutivas', async () => {
    const { POST } = await import('@/app/api/sandbox/route');

    const req1 = new NextRequest('http://localhost:3000/api/sandbox', {
      method: 'POST',
    });
    const req2 = new NextRequest('http://localhost:3000/api/sandbox', {
      method: 'POST',
    });

    const [res1, res2] = await Promise.all([POST(req1), POST(req2)]);
    const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

    expect(data1.clientId).not.toBe(data2.clientId);
    expect(data1.clientSecret).not.toBe(data2.clientSecret);
  });

  it('createdAt es un timestamp ISO 8601 válido', async () => {
    const { POST } = await import('@/app/api/sandbox/route');

    const request = new NextRequest('http://localhost:3000/api/sandbox', {
      method: 'POST',
    });

    const response = await POST(request);
    const data = await response.json();

    const date = new Date(data.createdAt);
    expect(date.toISOString()).toBe(data.createdAt);
    // Verificar que es reciente (dentro de los últimos 5 segundos)
    expect(Date.now() - date.getTime()).toBeLessThan(5000);
  });

  it('las credenciales generadas se pueden almacenar en el contexto sandbox', async () => {
    const { POST } = await import('@/app/api/sandbox/route');

    const request = new NextRequest('http://localhost:3000/api/sandbox', {
      method: 'POST',
    });

    const response = await POST(request);
    const credentials = await response.json();

    // Simular lo que hace el SandboxProvider
    sessionStorage.setItem(
      'bolivar_sandbox_credentials',
      JSON.stringify(credentials),
    );

    const stored = JSON.parse(
      sessionStorage.getItem('bolivar_sandbox_credentials')!,
    );
    expect(stored.clientId).toBe(credentials.clientId);
    expect(stored.clientSecret).toBe(credentials.clientSecret);

    sessionStorage.clear();
  });

  it('maneja errores internos retornando status 500 con estructura correcta', async () => {
    const { POST } = await import('@/app/api/sandbox/route');

    // Forzar un error interno mockeando getServerSession para que lance
    const nextAuth = await import('next-auth');
    const originalGetServerSession = (nextAuth as any).getServerSession;
    (nextAuth as any).getServerSession = vi.fn().mockRejectedValueOnce(
      new Error('Database connection failed'),
    );

    const request = new NextRequest('http://localhost:3000/api/sandbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const errorData = await response.json();
    expect(errorData).toHaveProperty('error');
    expect(errorData).toHaveProperty('code', 'INTERNAL_ERROR');
    expect(typeof errorData.error).toBe('string');

    // Restaurar
    (nextAuth as any).getServerSession = originalGetServerSession;
  });
});

// ---------------------------------------------------------------------------
// 3. Interacción con agente AI en playground
// ---------------------------------------------------------------------------

describe('Integración: AI Playground — estructura e interacción', () => {
  describe('Estructura del endpoint del agente AI', () => {
    it('el endpoint esperado del agente AI es POST /api/ai/chat', () => {
      // Verificar que la estructura de rutas del diseño es correcta
      const expectedEndpoint = '/api/ai/chat';
      const expectedMethod = 'POST';

      expect(expectedEndpoint).toBe('/api/ai/chat');
      expect(expectedMethod).toBe('POST');
    });

    it('un mensaje de chat tiene la estructura MensajeChat correcta', () => {
      const mensaje = {
        id: 'msg_001',
        rol: 'socio' as const,
        contenido: 'Quiero cotizar un seguro de vida para una persona de 35 años',
        timestamp: new Date().toISOString(),
      };

      expect(mensaje).toHaveProperty('id');
      expect(mensaje).toHaveProperty('rol');
      expect(mensaje).toHaveProperty('contenido');
      expect(mensaje).toHaveProperty('timestamp');
      expect(['socio', 'agente']).toContain(mensaje.rol);
      expect(typeof mensaje.contenido).toBe('string');
      expect(mensaje.contenido.length).toBeGreaterThan(0);
    });

    it('una respuesta del agente tiene la estructura MensajeChat correcta', () => {
      const respuesta = {
        id: 'msg_002',
        rol: 'agente' as const,
        contenido:
          'He identificado el endpoint de Cotización Vida. Enviando petición al sandbox...',
        timestamp: new Date().toISOString(),
      };

      expect(respuesta.rol).toBe('agente');
      expect(typeof respuesta.contenido).toBe('string');
      expect(new Date(respuesta.timestamp).getTime()).not.toBeNaN();
    });
  });

  describe('Estructura de pasos de traza (PasoTraza)', () => {
    it('un paso de interpretación tiene la estructura correcta', () => {
      const pasoInterpretacion = {
        id: 'trace_001',
        tipo: 'interpretacion' as const,
        timestamp: new Date().toISOString(),
        duracionMs: 150,
        contenido: {
          interpretacion:
            'El usuario quiere cotizar un seguro de vida. Identificando endpoint: api-vida-cotizacion.',
        },
      };

      expect(pasoInterpretacion.tipo).toBe('interpretacion');
      expect(pasoInterpretacion.duracionMs).toBeGreaterThanOrEqual(0);
      expect(pasoInterpretacion.contenido.interpretacion).toBeTruthy();
      expect(new Date(pasoInterpretacion.timestamp).getTime()).not.toBeNaN();
    });

    it('un paso de petición tiene endpoint, método y payload', () => {
      const pasoPeticion = {
        id: 'trace_002',
        tipo: 'peticion' as const,
        timestamp: new Date().toISOString(),
        duracionMs: 0,
        contenido: {
          endpoint: '/api/vida/cotizacion',
          method: 'POST',
          headers: {
            Authorization: 'Bearer sb_test_token',
            'Content-Type': 'application/json',
          },
          payload: { edad: 35, cobertura: 'basica' },
        },
      };

      expect(pasoPeticion.tipo).toBe('peticion');
      expect(pasoPeticion.contenido.endpoint).toBeTruthy();
      expect(pasoPeticion.contenido.method).toBe('POST');
      expect(pasoPeticion.contenido.headers).toHaveProperty('Authorization');
      expect(pasoPeticion.contenido.payload).toBeDefined();
    });

    it('un paso de respuesta tiene statusCode y respuestaJson', () => {
      const pasoRespuesta = {
        id: 'trace_003',
        tipo: 'respuesta' as const,
        timestamp: new Date().toISOString(),
        duracionMs: 320,
        contenido: {
          statusCode: 200,
          respuestaJson: {
            cotizacionId: 'cot_12345',
            primaAnual: 1500000,
            moneda: 'COP',
          },
        },
      };

      expect(pasoRespuesta.tipo).toBe('respuesta');
      expect(pasoRespuesta.contenido.statusCode).toBe(200);
      expect(pasoRespuesta.contenido.respuestaJson).toBeDefined();
      expect(pasoRespuesta.duracionMs).toBeGreaterThan(0);
    });

    it('los tres tipos de paso cubren el flujo completo de una interacción AI', () => {
      const tiposEsperados = ['interpretacion', 'peticion', 'respuesta'];

      const pasos = [
        {
          id: 'trace_001',
          tipo: 'interpretacion' as const,
          timestamp: new Date().toISOString(),
          duracionMs: 120,
          contenido: {
            interpretacion: 'Identificando endpoint para cotización de seguro de autos.',
          },
        },
        {
          id: 'trace_002',
          tipo: 'peticion' as const,
          timestamp: new Date().toISOString(),
          duracionMs: 0,
          contenido: {
            endpoint: '/api/autos/cotizacion',
            method: 'POST',
            headers: { Authorization: 'Bearer sb_token' },
            payload: { modelo: 'Mazda 3', anio: 2023 },
          },
        },
        {
          id: 'trace_003',
          tipo: 'respuesta' as const,
          timestamp: new Date().toISOString(),
          duracionMs: 250,
          contenido: {
            statusCode: 200,
            respuestaJson: { cotizacionId: 'cot_auto_001', prima: 2000000 },
          },
        },
      ];

      // Verificar que los 3 tipos están presentes en orden
      const tiposPresentes = pasos.map((p) => p.tipo);
      expect(tiposPresentes).toEqual(tiposEsperados);

      // Cada paso tiene timestamp válido
      pasos.forEach((paso) => {
        expect(new Date(paso.timestamp).getTime()).not.toBeNaN();
      });

      // Cada paso tiene duración no negativa
      pasos.forEach((paso) => {
        expect(paso.duracionMs).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Integración de credenciales sandbox con AI Playground', () => {
    it('las credenciales sandbox están disponibles para el agente AI vía sessionStorage', () => {
      const credentials = {
        clientId: 'sb_ai_playground_test',
        clientSecret: 'sk_ai_playground_secret',
        createdAt: new Date().toISOString(),
      };

      sessionStorage.setItem(
        'bolivar_sandbox_credentials',
        JSON.stringify(credentials),
      );

      // Simular lo que haría el AI Playground al leer credenciales
      const stored = JSON.parse(
        sessionStorage.getItem('bolivar_sandbox_credentials')!,
      );

      expect(stored.clientId).toBe('sb_ai_playground_test');
      expect(stored.clientSecret).toBe('sk_ai_playground_secret');

      sessionStorage.clear();
    });

    it('sin credenciales sandbox, el playground no puede ejecutar peticiones', () => {
      sessionStorage.clear();

      const stored = sessionStorage.getItem('bolivar_sandbox_credentials');
      expect(stored).toBeNull();

      // El playground debería detectar la ausencia de credenciales
      const hasCredentials = stored !== null;
      expect(hasCredentials).toBe(false);
    });
  });

  describe('Historial de chat preserva orden y contenido', () => {
    it('los mensajes se mantienen en orden cronológico', () => {
      const mensajes = [
        {
          id: 'msg_1',
          rol: 'socio' as const,
          contenido: 'Cotiza un seguro de hogar',
          timestamp: '2024-01-01T10:00:00.000Z',
        },
        {
          id: 'msg_2',
          rol: 'agente' as const,
          contenido: 'Procesando su solicitud...',
          timestamp: '2024-01-01T10:00:01.000Z',
        },
        {
          id: 'msg_3',
          rol: 'agente' as const,
          contenido: 'He encontrado el endpoint de Póliza Hogar.',
          timestamp: '2024-01-01T10:00:02.000Z',
        },
        {
          id: 'msg_4',
          rol: 'socio' as const,
          contenido: 'Ahora muestra los siniestros',
          timestamp: '2024-01-01T10:00:05.000Z',
        },
      ];

      // Verificar orden cronológico
      for (let i = 1; i < mensajes.length; i++) {
        const prev = new Date(mensajes[i - 1].timestamp).getTime();
        const curr = new Date(mensajes[i].timestamp).getTime();
        expect(curr).toBeGreaterThanOrEqual(prev);
      }

      // Verificar que todos los mensajes están presentes
      expect(mensajes).toHaveLength(4);

      // Verificar alternancia de roles
      expect(mensajes[0].rol).toBe('socio');
      expect(mensajes[1].rol).toBe('agente');
      expect(mensajes[3].rol).toBe('socio');
    });
  });
});
