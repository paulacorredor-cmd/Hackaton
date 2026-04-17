import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { BackLink } from '../BackLink';

function renderWithRouter(ui: React.ReactElement, { initialEntries = ['/'] } = {}) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

describe('BackLink', () => {
  it('renderiza el texto "Volver" por defecto', () => {
    renderWithRouter(<BackLink href="/home" />);

    expect(screen.getByText('Volver')).toBeInTheDocument();
  });

  it('renderiza un label personalizado cuando se proporciona', () => {
    renderWithRouter(<BackLink href="/home" label="Atrás" />);

    expect(screen.getByText('Atrás')).toBeInTheDocument();
  });

  it('renderiza el ícono de flecha hacia la izquierda', () => {
    renderWithRouter(<BackLink href="/home" />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('navega a la ruta correcta (href apunta al destino)', () => {
    renderWithRouter(<BackLink href="/home" />);

    const link = screen.getByRole('link', { name: /volver/i });
    expect(link).toHaveAttribute('href', '/home');
  });
});
