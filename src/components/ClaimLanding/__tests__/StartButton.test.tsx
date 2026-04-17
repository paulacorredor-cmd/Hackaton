import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { StartButton } from '../StartButton';

const defaultProps = {
  isEnabled: false,
  onClick: vi.fn(),
};

describe('StartButton', () => {
  it('renderiza el texto "Iniciar proceso" por defecto', () => {
    render(<StartButton {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Iniciar proceso' })).toBeInTheDocument();
  });

  it('renderiza un label personalizado cuando se proporciona', () => {
    render(<StartButton {...defaultProps} label="Comenzar" />);
    expect(screen.getByRole('button', { name: 'Comenzar' })).toBeInTheDocument();
  });

  it('tiene aria-disabled="true" cuando isEnabled es false', () => {
    render(<StartButton {...defaultProps} isEnabled={false} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('tiene aria-disabled="false" cuando isEnabled es true', () => {
    render(<StartButton {...defaultProps} isEnabled={true} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'false');
  });

  it('no invoca onClick cuando está deshabilitado', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<StartButton isEnabled={false} onClick={onClick} />);
    await user.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('invoca onClick cuando está habilitado', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<StartButton isEnabled={true} onClick={onClick} />);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('aplica clase de deshabilitado cuando isEnabled es false', () => {
    render(<StartButton {...defaultProps} isEnabled={false} />);
    expect(screen.getByRole('button').className).toContain('buttonDisabled');
  });

  it('no aplica clase de deshabilitado cuando isEnabled es true', () => {
    render(<StartButton {...defaultProps} isEnabled={true} />);
    expect(screen.getByRole('button').className).not.toContain('buttonDisabled');
  });
});
