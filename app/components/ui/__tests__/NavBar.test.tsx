import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renderiza enlaces a los tres módulos en desktop', () => {
    render(<NavBar currentModule="onboarding" />);
    const nav = screen.getByRole('navigation', { name: /navegación principal/i });
    expect(nav).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    // Logo link + 3 desktop module links
    expect(links.length).toBe(4);
  });

  it('marca el módulo activo con aria-current="page"', () => {
    render(<NavBar currentModule="catalogo" />);
    const catalogoLinks = screen.getAllByRole('link', { name: /catálogo/i });
    expect(catalogoLinks[0]).toHaveAttribute('aria-current', 'page');
  });

  it('no marca módulos inactivos con aria-current', () => {
    render(<NavBar currentModule="onboarding" />);
    const catalogoLinks = screen.getAllByRole('link', { name: /catálogo/i });
    expect(catalogoLinks[0]).not.toHaveAttribute('aria-current');
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

  it('tiene un botón de menú hamburguesa para móvil', () => {
    render(<NavBar currentModule="onboarding" />);
    const menuBtn = screen.getByRole('button', { name: /abrir menú/i });
    expect(menuBtn).toBeInTheDocument();
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('abre el menú móvil al hacer click en el hamburguesa', async () => {
    const user = userEvent.setup();
    render(<NavBar currentModule="onboarding" />);

    const menuBtn = screen.getByRole('button', { name: /abrir menú/i });
    await user.click(menuBtn);

    const mobileMenu = document.getElementById('mobile-nav-menu');
    expect(mobileMenu).toBeInTheDocument();

    // Ahora hay links duplicados (desktop + mobile)
    const allLinks = screen.getAllByRole('link');
    expect(allLinks.length).toBe(7); // logo + 3 desktop + 3 mobile
  });
});
