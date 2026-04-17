import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Provide deterministic UUIDs
let uuidCounter = 0;
const mockUUID = vi.fn(() => {
  uuidCounter++;
  return `00000000-0000-0000-0000-${String(uuidCounter).padStart(12, '0')}`;
});
Object.defineProperty(globalThis, 'crypto', {
  value: { ...globalThis.crypto, randomUUID: mockUUID },
  writable: true,
});

import SandboxPage from '../page';

describe('SandboxPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    uuidCounter = 0;
    // Default: never trigger simulated failure
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function advanceToLoaded() {
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
  }

  it('muestra estado de carga al iniciar', () => {
    render(<SandboxPage />);
    expect(screen.getByText(/creando su aplicación sandbox/i)).toBeInTheDocument();
  });

  it('muestra credenciales tras creación exitosa', async () => {
    render(<SandboxPage />);
    await advanceToLoaded();
    expect(screen.getByText(/aplicación sandbox creada/i)).toBeInTheDocument();
    expect(screen.getByText('Client ID')).toBeInTheDocument();
    expect(screen.getByText('Client Secret')).toBeInTheDocument();
  });

  it('muestra Client_ID en texto plano con botón de copiar', async () => {
    render(<SandboxPage />);
    await advanceToLoaded();

    const clientIdDisplay = screen.getByLabelText('Client ID');
    expect(clientIdDisplay).toBeInTheDocument();
    expect(clientIdDisplay.textContent).toMatch(/^sb_/);
    expect(screen.getByLabelText('Copiar Client ID')).toBeInTheDocument();
  });

  it('muestra Client_Secret enmascarado por defecto', async () => {
    render(<SandboxPage />);
    await advanceToLoaded();

    const secretDisplay = screen.getByLabelText('Client Secret');
    expect(secretDisplay).toBeInTheDocument();
    expect(secretDisplay.textContent).toMatch(/^•+$/);
  });

  it('tiene botón de revelar para Client_Secret', async () => {
    render(<SandboxPage />);
    await advanceToLoaded();

    expect(screen.getByLabelText('Revelar valor temporalmente')).toBeInTheDocument();
  });

  it('muestra error cuando la creación falla', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    render(<SandboxPage />);
    await advanceToLoaded();

    expect(screen.getByText(/no se pudo crear la aplicación sandbox/i)).toBeInTheDocument();
  });

  it('muestra botón de reintento con intentos restantes cuando falla', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    render(<SandboxPage />);
    await advanceToLoaded();

    expect(screen.getByText(/reintentar/i)).toBeInTheDocument();
    expect(screen.getByText(/3 intentos restantes/i)).toBeInTheDocument();
  });

  it('decrementa intentos restantes al reintentar', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    render(<SandboxPage />);
    await advanceToLoaded();

    fireEvent.click(screen.getByText(/reintentar/i));
    await advanceToLoaded();

    expect(screen.getByText(/2 intentos restantes/i)).toBeInTheDocument();
  });

  it('muestra mensaje de reintentos agotados tras 3 reintentos', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    render(<SandboxPage />);
    await advanceToLoaded();

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText(/reintentar/i));
      await advanceToLoaded();
    }

    expect(screen.getByText(/se agotaron los reintentos/i)).toBeInTheDocument();
  });

  it('muestra botón para ir al catálogo tras creación exitosa', async () => {
    render(<SandboxPage />);
    await advanceToLoaded();

    const catalogButton = screen.getByRole('button', { name: /ir al catálogo de apis/i });
    expect(catalogButton).toBeInTheDocument();
    fireEvent.click(catalogButton);
    expect(pushMock).toHaveBeenCalledWith('/catalogo');
  });

  it('muestra advertencia sobre guardar el secreto', async () => {
    render(<SandboxPage />);
    await advanceToLoaded();

    expect(screen.getByText(/el client secret no se mostrará de nuevo/i)).toBeInTheDocument();
  });

  it('usa aria-live para comunicar estados a tecnologías de asistencia', () => {
    render(<SandboxPage />);
    const loadingMessage = screen.getByText(/creando su aplicación sandbox/i);
    expect(loadingMessage).toHaveAttribute('aria-live', 'polite');
  });
});
