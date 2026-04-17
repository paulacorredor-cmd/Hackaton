import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '../page';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('HomePage', () => {
  it('renderiza el título principal del portal', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /bolívar api developer portal/i }),
    ).toBeInTheDocument();
  });

  it('renderiza la descripción del portal', () => {
    render(<HomePage />);
    expect(
      screen.getByText(/integra las apis de seguros bolívar/i),
    ).toBeInTheDocument();
  });

  it('renderiza el botón CTA que enlaza a /onboarding/registro', () => {
    render(<HomePage />);
    const cta = screen.getByRole('link', { name: /comenzar registro/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/onboarding/registro');
  });

  it('renderiza las tres tarjetas de características', () => {
    render(<HomePage />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    const headingTexts = headings.map((h) => h.textContent);
    expect(headingTexts).toContain('Catálogo de APIs');
    expect(headingTexts).toContain('Sandbox en tiempo real');
    expect(headingTexts).toContain('AI Playground');
  });

  it('renderiza la sección de características con encabezado semántico h2', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { level: 2, name: /qué ofrece el portal/i }),
    ).toBeInTheDocument();
  });

  it('renderiza el NavBar', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('navigation', { name: /navegación principal/i }),
    ).toBeInTheDocument();
  });

  it('renderiza el footer con copyright', () => {
    render(<HomePage />);
    expect(screen.getByText(/seguros bolívar.*developer portal.*derechos reservados/i)).toBeInTheDocument();
  });
});
