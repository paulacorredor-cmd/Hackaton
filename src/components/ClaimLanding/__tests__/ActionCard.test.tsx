import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ActionCard } from '../ActionCard';

const defaultProps = {
  title: 'Retome su solicitud',
  description: '¿Dejó algo pendiente? Finalice aquí el envío de su información.',
  iconSrc: '/icons/resume.svg',
  iconAlt: 'Ícono retomar',
  onClick: vi.fn(),
};

describe('ActionCard', () => {
  it('renderiza el título y la descripción', () => {
    render(<ActionCard {...defaultProps} />);
    expect(screen.getByText('Retome su solicitud')).toBeInTheDocument();
    expect(screen.getByText('¿Dejó algo pendiente? Finalice aquí el envío de su información.')).toBeInTheDocument();
  });

  it('renderiza el ícono con el alt correcto', () => {
    render(<ActionCard {...defaultProps} />);
    const icon = screen.getByRole('img', { name: 'Ícono retomar' });
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/icons/resume.svg');
  });

  it('renderiza la flecha de navegación como decorativa (aria-hidden)', () => {
    const { container } = render(<ActionCard {...defaultProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('tiene role="button" y tabIndex=0 para accesibilidad', () => {
    render(<ActionCard {...defaultProps} />);
    const card = screen.getByRole('button', { name: /Retome su solicitud/i });
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('invoca onClick al hacer click', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<ActionCard {...defaultProps} onClick={onClick} />);
    await user.click(screen.getByRole('button', { name: /Retome su solicitud/i }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('invoca onClick al presionar Enter', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<ActionCard {...defaultProps} onClick={onClick} />);
    const card = screen.getByRole('button', { name: /Retome su solicitud/i });
    card.focus();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('invoca onClick al presionar Space', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<ActionCard {...defaultProps} onClick={onClick} />);
    const card = screen.getByRole('button', { name: /Retome su solicitud/i });
    card.focus();
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledOnce();
  });
});
