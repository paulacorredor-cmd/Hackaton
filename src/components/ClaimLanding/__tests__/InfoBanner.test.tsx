import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InfoBanner } from '../InfoBanner';

const defaultProps = {
  isVisible: true,
  onClose: vi.fn(),
  onViewRequirements: vi.fn(),
  title: 'Consejos para hacer su reporte más rápido',
  requirementsLinkText: 'Ver requisitos',
};

describe('InfoBanner', () => {
  it('renderiza el texto del título', () => {
    render(<InfoBanner {...defaultProps} />);

    expect(
      screen.getByText('Consejos para hacer su reporte más rápido')
    ).toBeInTheDocument();
  });

  it('renderiza el enlace "Ver requisitos"', () => {
    render(<InfoBanner {...defaultProps} />);

    const link = screen.getByRole('button', { name: 'Ver requisitos' });
    expect(link).toBeInTheDocument();
  });

  it('invoca onViewRequirements al hacer click en "Ver requisitos"', async () => {
    const onViewRequirements = vi.fn();
    const user = userEvent.setup();

    render(
      <InfoBanner {...defaultProps} onViewRequirements={onViewRequirements} />
    );

    await user.click(screen.getByRole('button', { name: 'Ver requisitos' }));
    expect(onViewRequirements).toHaveBeenCalledOnce();
  });

  it('renderiza el botón de cierre', () => {
    render(<InfoBanner {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Cerrar banner' })
    ).toBeInTheDocument();
  });

  it('invoca onClose al presionar el botón de cierre', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<InfoBanner {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cerrar banner' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('se oculta cuando isVisible es false', () => {
    const { container } = render(
      <InfoBanner {...defaultProps} isVisible={false} />
    );

    expect(container.innerHTML).toBe('');
  });

  it('tiene role="status" para accesibilidad', () => {
    render(<InfoBanner {...defaultProps} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
