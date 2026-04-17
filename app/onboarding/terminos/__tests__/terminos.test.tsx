import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

import TerminosPage from '../page';

describe('TerminosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
  });

  it('renderiza el título y la descripción', () => {
    render(<TerminosPage />);
    expect(screen.getByRole('heading', { level: 1, name: /términos y condiciones/i })).toBeInTheDocument();
    expect(screen.getByText(/revise y acepte los términos/i)).toBeInTheDocument();
  });

  it('muestra el panel desplazable con texto legal', () => {
    render(<TerminosPage />);
    const panel = screen.getByRole('region', { name: /texto legal/i });
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveClass('overflow-y-auto');
    expect(panel.innerHTML).toContain('Circular 005');
  });

  it('muestra la casilla de verificación con el texto exacto requerido', () => {
    render(<TerminosPage />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(
      screen.getByText('Acepto los términos y condiciones de Open Insurance según la Circular 005')
    ).toBeInTheDocument();
  });

  it('el botón Continuar está deshabilitado cuando la casilla no está marcada', () => {
    render(<TerminosPage />);
    const button = screen.getByRole('button', { name: /continuar/i });
    expect(button).toBeDisabled();
  });

  it('el botón Continuar se habilita al marcar la casilla', () => {
    render(<TerminosPage />);
    const checkbox = screen.getByRole('checkbox');
    const button = screen.getByRole('button', { name: /continuar/i });

    fireEvent.click(checkbox);
    expect(button).toBeEnabled();
  });

  it('el botón Continuar se deshabilita al desmarcar la casilla', () => {
    render(<TerminosPage />);
    const checkbox = screen.getByRole('checkbox');
    const button = screen.getByRole('button', { name: /continuar/i });

    fireEvent.click(checkbox); // mark
    expect(button).toBeEnabled();

    fireEvent.click(checkbox); // unmark
    expect(button).toBeDisabled();
  });

  it('registra la aceptación con marca de tiempo y navega a /onboarding/sandbox', async () => {
    render(<TerminosPage />);
    const checkbox = screen.getByRole('checkbox');
    const button = screen.getByRole('button', { name: /continuar/i });

    fireEvent.click(checkbox);
    fireEvent.click(button);

    // Should store timestamp
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'terminosAceptados',
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/)
    );

    // Should navigate
    expect(pushMock).toHaveBeenCalledWith('/onboarding/sandbox');
  });

  it('la casilla tiene aria-label descriptivo', () => {
    render(<TerminosPage />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute(
      'aria-label',
      'Acepto los términos y condiciones de Open Insurance según la Circular 005'
    );
  });
});
