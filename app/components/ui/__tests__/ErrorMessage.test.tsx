import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renderiza el mensaje de error', () => {
    render(<ErrorMessage message="Campo requerido" />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });

  it('tiene role="alert" para tecnologías de asistencia', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('tiene aria-live="polite" por defecto', () => {
    render(<ErrorMessage message="Error" />);
    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('acepta aria-live="assertive"', () => {
    render(<ErrorMessage message="Error crítico" ariaLive="assertive" />);
    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });

  it('genera id basado en fieldId para asociación con campo de formulario', () => {
    render(<ErrorMessage message="NIT inválido" fieldId="nit" />);
    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('id', 'nit-error');
  });

  it('no genera id cuando fieldId no se proporciona', () => {
    render(<ErrorMessage message="Error genérico" />);
    const el = screen.getByRole('alert');
    expect(el).not.toHaveAttribute('id');
  });

  it('tiene aria-atomic="true" para lectura completa del mensaje', () => {
    render(<ErrorMessage message="Error" />);
    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('aria-atomic', 'true');
  });
});
