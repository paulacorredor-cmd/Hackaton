import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NavBar from '../NavBar';

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('NavBar', () => {
  it('renderiza el logotipo de Seguros Bolívar', () => {
    render(<NavBar currentModule="onboarding" />);
    expect(screen.getByText('Seguros Bolívar')).toBeInTheDocument();
  });

  it('renderiza enlaces a los tres módulos', () => {
    render(<NavBar currentModule="onboarding" />);
    const nav = screen.getByRole('navigation', { name: /navegación principal/i });
    expect(nav).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    // Logo link + 3 module links
    expect(links.length).toBe(4);
  });

  it('marca el módulo activo con aria-current="page"', () => {
    render(<NavBar currentModule="catalogo" />);
    const catalogoLink = screen.getByRole('link', { name: /catálogo/i });
    expect(catalogoLink).toHaveAttribute('aria-current', 'page');
  });

  it('no marca módulos inactivos con aria-current', () => {
    render(<NavBar currentModule="onboarding" />);
    const catalogoLink = screen.getByRole('link', { name: /catálogo/i });
    expect(catalogoLink).not.toHaveAttribute('aria-current');
  });

  it('tiene aria-label en el enlace del logotipo', () => {
    render(<NavBar currentModule="onboarding" />);
    const logoLink = screen.getByRole('link', { name: /seguros bolívar.*inicio/i });
    expect(logoLink).toBeInTheDocument();
  });

  it('tiene el elemento nav con aria-label descriptivo', () => {
    render(<NavBar currentModule="playground" />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Navegación principal');
  });
});
