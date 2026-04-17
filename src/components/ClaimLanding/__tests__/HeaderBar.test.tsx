import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeaderBar } from '../HeaderBar';

describe('HeaderBar', () => {
  it('renderiza el logotipo con el atributo alt correcto', () => {
    render(<HeaderBar logoSrc="/logo.png" logoAlt="Logo Davivienda" />);

    const logo = screen.getByAltText('Logo Davivienda');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');
  });

  it('aplica franja roja y franja blanca con logo', () => {
    const { container } = render(
      <HeaderBar logoSrc="/logo.png" logoAlt="Logo Davivienda" />
    );

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('header');

    const redStripe = container.querySelector('.redStripe');
    expect(redStripe).toBeInTheDocument();

    const logoBar = container.querySelector('.logoBar');
    expect(logoBar).toBeInTheDocument();
  });

  it('renderiza como elemento <header> semántico', () => {
    render(<HeaderBar logoSrc="/logo.png" logoAlt="Logo Davivienda" />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});
