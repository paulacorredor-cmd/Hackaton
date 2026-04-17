import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CatalogoPage from '../page';

// Mock next/navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('CatalogoPage', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('renderiza las cuatro secciones de líneas de seguro', () => {
    render(<CatalogoPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'Vida' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Hogar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Autos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Salud' })).toBeInTheDocument();
  });

  it('renderiza tarjetas de API dentro de cada sección', () => {
    render(<CatalogoPage />);
    // Check that API cards are rendered (h3 headings inside cards)
    expect(screen.getByRole('heading', { level: 3, name: /cotización vida/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /póliza hogar/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /cotización autos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /autorización salud/i })).toBeInTheDocument();
  });

  it('muestra pestañas de filtro: Todas, Vida, Hogar, Autos, Salud', () => {
    render(<CatalogoPage />);
    const tablist = screen.getByRole('tablist');
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs).toHaveLength(5);
    expect(tabs.map((t) => t.textContent)).toEqual(['Todas', 'Vida', 'Hogar', 'Autos', 'Salud']);
  });

  it('filtra APIs al seleccionar una pestaña de línea', async () => {
    const user = userEvent.setup();
    render(<CatalogoPage />);

    // Click "Vida" tab
    await user.click(screen.getByRole('tab', { name: 'Vida' }));

    // Only Vida section should be visible
    expect(screen.getByRole('heading', { level: 2, name: 'Vida' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Hogar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Autos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Salud' })).not.toBeInTheDocument();
  });

  it('marca la pestaña activa con aria-selected', async () => {
    const user = userEvent.setup();
    render(<CatalogoPage />);

    const todasTab = screen.getByRole('tab', { name: 'Todas' });
    expect(todasTab).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('tab', { name: 'Autos' }));
    expect(screen.getByRole('tab', { name: 'Autos' })).toHaveAttribute('aria-selected', 'true');
    expect(todasTab).toHaveAttribute('aria-selected', 'false');
  });

  it('navega a /catalogo/{apiId} al hacer clic en una tarjeta', async () => {
    const user = userEvent.setup();
    render(<CatalogoPage />);

    const card = screen.getByRole('button', { name: /cotización vida/i });
    await user.click(card);
    expect(pushMock).toHaveBeenCalledWith('/catalogo/api-vida-cotizacion');
  });

  it('muestra el botón Exportar Manifiesto AI', () => {
    render(<CatalogoPage />);
    expect(screen.getByRole('button', { name: /exportar manifiesto ai/i })).toBeInTheDocument();
  });

  it('usa encabezados semánticos h2 para secciones', () => {
    render(<CatalogoPage />);
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(4);
  });

  it('usa encabezados semánticos h3 para tarjetas de API', () => {
    render(<CatalogoPage />);
    const h3s = screen.getAllByRole('heading', { level: 3 });
    // 8 API cards = 8 h3 headings
    expect(h3s.length).toBe(8);
  });

  it('vuelve a mostrar todas las secciones al seleccionar Todas', async () => {
    const user = userEvent.setup();
    render(<CatalogoPage />);

    // Filter to Vida first
    await user.click(screen.getByRole('tab', { name: 'Vida' }));
    expect(screen.queryByRole('heading', { level: 2, name: 'Hogar' })).not.toBeInTheDocument();

    // Back to Todas
    await user.click(screen.getByRole('tab', { name: 'Todas' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Vida' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Hogar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Autos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Salud' })).toBeInTheDocument();
  });
});
