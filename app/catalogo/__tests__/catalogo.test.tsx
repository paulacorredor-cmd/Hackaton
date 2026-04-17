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
