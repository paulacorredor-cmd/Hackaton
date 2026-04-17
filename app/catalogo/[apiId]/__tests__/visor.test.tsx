import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VisorDocumentacionPage from '../page';
import {
  classifySandboxError,
  formatHttpResponse,
  SandboxErrorCode,
  ERROR_MESSAGES,
  type RespuestaPrueba,
} from '@/app/lib/http-utils';

// Mock next/navigation
const pushMock = vi.fn();
const useParamsMock = vi.fn(() => ({ apiId: 'api-vida-cotizacion' }));
vi.mock('next/navigation', () => ({
  useParams: (...args: unknown[]) => useParamsMock(...args),
  useRouter: () => ({ push: pushMock }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('VisorDocumentacionPage — API válida', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('renderiza el título, versión y descripción de la API', () => {
    render(<VisorDocumentacionPage />);
    expect(screen.getByRole('heading', { level: 1, name: /cotización vida/i })).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText(/genera cotizaciones personalizadas/i)).toBeInTheDocument();
  });

  it('renderiza la lista de endpoints con métodos y rutas', () => {
    render(<VisorDocumentacionPage />);
    // The page renders 4 endpoints: GET, POST, PUT, DELETE
    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('PUT')).toBeInTheDocument();
    expect(screen.getByText('DELETE')).toBeInTheDocument();

    // Check paths are rendered
    expect(screen.getByText(/\/vida-cotizacion\/consultar/)).toBeInTheDocument();
    expect(screen.getByText(/\/vida-cotizacion\/crear/)).toBeInTheDocument();
  });

  it('muestra el banner de credenciales sandbox con Client ID precargado', () => {
    render(<VisorDocumentacionPage />);
    const banner = screen.getByRole('status', { name: /credenciales sandbox/i });
    expect(banner).toBeInTheDocument();
    expect(within(banner).getByText(/sandbox-demo-client-id/)).toBeInTheDocument();
  });

  it('las tarjetas de endpoint son expandibles al hacer clic', async () => {
    const user = userEvent.setup();
    render(<VisorDocumentacionPage />);

    // Find the first endpoint button (GET consultar)
    const endpointButton = screen.getByRole('button', {
      name: /GET.*consultar.*Consultar Cotización Vida/i,
    });
    expect(endpointButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(endpointButton);
    expect(endpointButton).toHaveAttribute('aria-expanded', 'true');

    // Expanded content should show description
    expect(screen.getByText(/obtiene información de/i)).toBeInTheDocument();
  });

  it('muestra el botón "Probar endpoint" en un endpoint expandido', async () => {
    const user = userEvent.setup();
    render(<VisorDocumentacionPage />);

    // Expand the first endpoint
    const endpointButton = screen.getByRole('button', {
      name: /GET.*consultar.*Consultar Cotización Vida/i,
    });
    await user.click(endpointButton);

    expect(screen.getByRole('button', { name: /probar endpoint/i })).toBeInTheDocument();
  });

  it('muestra el heading de Endpoints con el conteo correcto', () => {
    render(<VisorDocumentacionPage />);
    expect(screen.getByRole('heading', { level: 2, name: /endpoints \(4\)/i })).toBeInTheDocument();
  });
});


describe('VisorDocumentacionPage — API no encontrada', () => {
  beforeEach(() => {
    pushMock.mockClear();
    useParamsMock.mockReturnValue({ apiId: 'api-inexistente' });
  });

  afterEach(() => {
    useParamsMock.mockReturnValue({ apiId: 'api-vida-cotizacion' });
  });

  it('muestra "API no encontrada" para un apiId inválido', () => {
    render(<VisorDocumentacionPage />);
    expect(screen.getByRole('heading', { name: /api no encontrada/i })).toBeInTheDocument();
    expect(screen.getByText(/no existe en el catálogo/i)).toBeInTheDocument();
  });
});

// --- Utility function tests ---

describe('classifySandboxError', () => {
  it('clasifica error de red', () => {
    const err = classifySandboxError(undefined, false, true);
    expect(err.code).toBe(SandboxErrorCode.NETWORK_ERROR);
    expect(err.message).toBe(ERROR_MESSAGES[SandboxErrorCode.NETWORK_ERROR].message);
    expect(err.retryable).toBe(true);
  });

  it('clasifica timeout', () => {
    const err = classifySandboxError(undefined, true, false);
    expect(err.code).toBe(SandboxErrorCode.TIMEOUT);
    expect(err.message).toBe(ERROR_MESSAGES[SandboxErrorCode.TIMEOUT].message);
    expect(err.retryable).toBe(true);
  });

  it('clasifica unauthorized (401)', () => {
    const err = classifySandboxError(401, false, false);
    expect(err.code).toBe(SandboxErrorCode.UNAUTHORIZED);
    expect(err.retryable).toBe(false);
  });

  it('clasifica rate limited (429)', () => {
    const err = classifySandboxError(429, false, false);
    expect(err.code).toBe(SandboxErrorCode.RATE_LIMITED);
    expect(err.retryable).toBe(true);
  });

  it('clasifica error interno para códigos desconocidos', () => {
    const err = classifySandboxError(500, false, false);
    expect(err.code).toBe(SandboxErrorCode.INTERNAL_ERROR);
    expect(err.retryable).toBe(true);
  });

  it('prioriza error de red sobre timeout', () => {
    const err = classifySandboxError(undefined, true, true);
    expect(err.code).toBe(SandboxErrorCode.NETWORK_ERROR);
  });
});

describe('formatHttpResponse', () => {
  it('incluye código de estado, encabezados y cuerpo', () => {
    const response: RespuestaPrueba = {
      statusCode: 200,
      headers: { 'content-type': 'application/json', 'x-request-id': 'abc-123' },
      body: { id: '1', nombre: 'test' },
      durationMs: 150,
    };

    const output = formatHttpResponse(response);
    expect(output).toContain('HTTP 200');
    expect(output).toContain('content-type: application/json');
    expect(output).toContain('x-request-id: abc-123');
    expect(output).toContain('"id": "1"');
    expect(output).toContain('"nombre": "test"');
  });

  it('maneja cuerpo de tipo string', () => {
    const response: RespuestaPrueba = {
      statusCode: 404,
      headers: {},
      body: 'Not Found',
      durationMs: 50,
    };

    const output = formatHttpResponse(response);
    expect(output).toContain('HTTP 404');
    expect(output).toContain('Not Found');
  });

  it('maneja respuesta sin encabezados', () => {
    const response: RespuestaPrueba = {
      statusCode: 204,
      headers: {},
      body: null,
      durationMs: 10,
    };

    const output = formatHttpResponse(response);
    expect(output).toContain('HTTP 204');
  });
});
