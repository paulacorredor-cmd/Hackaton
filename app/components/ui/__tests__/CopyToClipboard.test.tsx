import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CopyToClipboard, { maskValue, revealValue } from '../CopyToClipboard';

// Mock clipboard API properly for jsdom
const mockWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  });
  mockWriteText.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CopyToClipboard', () => {
  it('muestra el valor en texto plano cuando masked es false', () => {
    render(<CopyToClipboard value="abc123" ariaLabel="Client ID" />);
    expect(screen.getByText('abc123')).toBeInTheDocument();
  });

  it('muestra el valor enmascarado cuando masked es true', () => {
    render(<CopyToClipboard value="secret" masked ariaLabel="Client Secret" />);
    expect(screen.getByText('••••••')).toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('revela el valor temporalmente al presionar el botón de revelar', async () => {
    render(<CopyToClipboard value="secret" masked revealDuration={5000} ariaLabel="Client Secret" />);

    const revealBtn = screen.getByRole('button', { name: /revelar/i });
    await act(async () => {
      revealBtn.click();
    });

    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('oculta el valor automáticamente después de revealDuration', async () => {
    render(<CopyToClipboard value="secret" masked revealDuration={5000} ariaLabel="Client Secret" />);

    const revealBtn = screen.getByRole('button', { name: /revelar/i });
    await act(async () => {
      revealBtn.click();
    });
    expect(screen.getByText('secret')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(screen.getByText('••••••')).toBeInTheDocument();
  });

  it('copia el valor al portapapeles y muestra confirmación visual', async () => {
    const onCopy = vi.fn();
    render(<CopyToClipboard value="abc123" onCopy={onCopy} ariaLabel="Client ID" />);

    const copyBtn = screen.getByRole('button', { name: /copiar/i });
    await act(async () => {
      copyBtn.click();
    });

    expect(mockWriteText).toHaveBeenCalledWith('abc123');
    expect(onCopy).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /copiado/i })).toBeInTheDocument();
  });

  it('la confirmación visual desaparece después de 2 segundos', async () => {
    render(<CopyToClipboard value="abc123" ariaLabel="Client ID" />);

    const copyBtn = screen.getByRole('button', { name: /copiar/i });
    await act(async () => {
      copyBtn.click();
    });

    expect(screen.getByRole('button', { name: /copiado/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('button', { name: /copiar/i })).toBeInTheDocument();
  });

  it('anuncia la copia al portapapeles con aria-live', async () => {
    render(<CopyToClipboard value="abc123" ariaLabel="Client ID" />);

    const copyBtn = screen.getByRole('button', { name: /copiar/i });
    await act(async () => {
      copyBtn.click();
    });

    const liveRegion = screen.getByText('Valor copiado al portapapeles');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion.closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
  });

  it('no muestra botón de revelar cuando masked es false', () => {
    render(<CopyToClipboard value="abc123" ariaLabel="Client ID" />);
    expect(screen.queryByRole('button', { name: /revelar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ocultar/i })).not.toBeInTheDocument();
  });
});

describe('maskValue', () => {
  it('reemplaza todos los caracteres con el carácter de máscara', () => {
    expect(maskValue('hello')).toBe('•••••');
  });

  it('retorna string vacío para entrada vacía', () => {
    expect(maskValue('')).toBe('');
  });

  it('usa carácter de máscara personalizado', () => {
    expect(maskValue('abc', '*')).toBe('***');
  });
});

describe('revealValue', () => {
  it('retorna el valor original sin modificaciones', () => {
    expect(revealValue('secret123')).toBe('secret123');
  });
});
