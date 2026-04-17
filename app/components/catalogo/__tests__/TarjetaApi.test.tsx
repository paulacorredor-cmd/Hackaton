import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TarjetaApi from '../TarjetaApi';
import type { ApiDefinition } from '@/app/lib/catalogo';

const sampleApi: ApiDefinition = {
  id: 'api-vida-1',
  nombre: 'Cotización Vida',
  descripcionSemantica: 'Genera cotizaciones de seguros de vida',
  lineaSeguro: 'vida',
  aiCapability: 'quote_life_insurance',
  specUrl: '/specs/vida-cotizacion.yaml',
};

describe('TarjetaApi', () => {
  it('muestra el nombre de la API', () => {
    render(<TarjetaApi api={sampleApi} onClick={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 3, name: /cotización vida/i })).toBeInTheDocument();
  });

  it('muestra la descripción semántica (x-ai-description)', () => {
    render(<TarjetaApi api={sampleApi} onClick={vi.fn()} />);
    expect(screen.getByText('Genera cotizaciones de seguros de vida')).toBeInTheDocument();
  });

  it('muestra el indicador de línea de seguro', () => {
    render(<TarjetaApi api={sampleApi} onClick={vi.fn()} />);
    expect(screen.getByText('Vida')).toBeInTheDocument();
  });

  it('llama onClick con el apiId al hacer clic', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TarjetaApi api={sampleApi} onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith('api-vida-1');
  });

  it('llama onClick con Enter', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TarjetaApi api={sampleApi} onClick={onClick} />);
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledWith('api-vida-1');
  });

  it('tiene aria-label descriptivo', () => {
    render(<TarjetaApi api={sampleApi} onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Cotización Vida'),
    );
  });

  it('muestra indicador correcto para cada línea de seguro', () => {
    const lineas = [
      { linea: 'hogar' as const, label: 'Hogar' },
      { linea: 'autos' as const, label: 'Autos' },
      { linea: 'salud' as const, label: 'Salud' },
    ];
    for (const { linea, label } of lineas) {
      const api = { ...sampleApi, lineaSeguro: linea };
      const { unmount } = render(<TarjetaApi api={api} onClick={vi.fn()} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });
});
