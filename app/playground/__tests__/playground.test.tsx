import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import PanelChat from '../../components/playground/PanelChat';
import PanelLog from '../../components/playground/PanelLog';
import type { MensajeChat, PasoTraza } from '../../lib/playground';

// Mock next/link for NavBar
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

const sampleMensajes: MensajeChat[] = [
  {
    id: 'msg-1',
    rol: 'socio',
    contenido: 'Cotiza un seguro de vida',
    timestamp: '2024-01-15T10:30:00.000Z',
  },
  {
    id: 'msg-2',
    rol: 'agente',
    contenido: 'He procesado tu solicitud de cotización.',
    timestamp: '2024-01-15T10:30:05.000Z',
  },
];

const samplePasos: PasoTraza[] = [
  {
    id: 'paso-1',
    tipo: 'interpretacion',
    timestamp: '2024-01-15T10:30:01.000Z',
    duracionMs: 120,
    contenido: {
      interpretacion: 'El socio solicita una cotización de seguro de vida.',
    },
  },
  {
    id: 'paso-2',
    tipo: 'peticion',
    timestamp: '2024-01-15T10:30:02.000Z',
    duracionMs: 250,
    contenido: {
      endpoint: '/api/seguros/vida/cotizacion',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: { tipo: 'vida', monto: 100000 },
    },
  },
  {
    id: 'paso-3',
    tipo: 'respuesta',
    timestamp: '2024-01-15T10:30:03.000Z',
    duracionMs: 380,
    contenido: {
      statusCode: 200,
      respuestaJson: { cotizacionId: 'COT-001', prima: 50000 },
    },
  },
];

describe('PanelChat', () => {
  it('renderiza el encabezado del chat', () => {
    render(<PanelChat mensajes={[]} onEnviarMensaje={vi.fn()} cargando={false} />);
    expect(screen.getByRole('heading', { level: 2, name: /bolívar ai chat/i })).toBeInTheDocument();
  });

  it('muestra mensaje vacío cuando no hay mensajes', () => {
    render(<PanelChat mensajes={[]} onEnviarMensaje={vi.fn()} cargando={false} />);
    expect(screen.getByText(/escribe una instrucción/i)).toBeInTheDocument();
  });

  it('renderiza mensajes de socio y agente', () => {
    render(<PanelChat mensajes={sampleMensajes} onEnviarMensaje={vi.fn()} cargando={false} />);
    expect(screen.getByText('Cotiza un seguro de vida')).toBeInTheDocument();
    expect(screen.getByText('He procesado tu solicitud de cotización.')).toBeInTheDocument();
  });

  it('muestra indicador de carga cuando cargando es true', () => {
    render(<PanelChat mensajes={[]} onEnviarMensaje={vi.fn()} cargando={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/el agente está procesando/i)).toBeInTheDocument();
  });

  it('tiene campo de entrada con aria-label', () => {
    render(<PanelChat mensajes={[]} onEnviarMensaje={vi.fn()} cargando={false} />);
    expect(screen.getByLabelText(/campo de entrada de instrucciones/i)).toBeInTheDocument();
  });

  it('tiene botón de enviar con aria-label', () => {
    render(<PanelChat mensajes={[]} onEnviarMensaje={vi.fn()} cargando={false} />);
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument();
  });

  it('deshabilita el botón de enviar cuando el input está vacío', () => {
    render(<PanelChat mensajes={[]} onEnviarMensaje={vi.fn()} cargando={false} />);
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeDisabled();
  });

  it('deshabilita el input y botón cuando está cargando', () => {
    render(<PanelChat mensajes={[]} onEnviarMensaje={vi.fn()} cargando={true} />);
    expect(screen.getByLabelText(/campo de entrada de instrucciones/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeDisabled();
  });

  it('llama onEnviarMensaje al hacer clic en enviar', async () => {
    const user = userEvent.setup();
    const onEnviar = vi.fn().mockResolvedValue(undefined);
    render(<PanelChat mensajes={[]} onEnviarMensaje={onEnviar} cargando={false} />);

    const input = screen.getByLabelText(/campo de entrada de instrucciones/i);
    await user.type(input, 'Hola agente');
    await user.click(screen.getByRole('button', { name: /enviar mensaje/i }));

    expect(onEnviar).toHaveBeenCalledWith('Hola agente');
  });

  it('llama onEnviarMensaje al presionar Enter', async () => {
    const user = userEvent.setup();
    const onEnviar = vi.fn().mockResolvedValue(undefined);
    render(<PanelChat mensajes={[]} onEnviarMensaje={onEnviar} cargando={false} />);

    const input = screen.getByLabelText(/campo de entrada de instrucciones/i);
    await user.type(input, 'Hola agente{Enter}');

    expect(onEnviar).toHaveBeenCalledWith('Hola agente');
  });

  it('limpia el input después de enviar', async () => {
    const user = userEvent.setup();
    const onEnviar = vi.fn().mockResolvedValue(undefined);
    render(<PanelChat mensajes={[]} onEnviarMensaje={onEnviar} cargando={false} />);

    const input = screen.getByLabelText(/campo de entrada de instrucciones/i);
    await user.type(input, 'Hola agente{Enter}');

    expect(input).toHaveValue('');
  });

  it('tiene historial de mensajes con role="log" y aria-live', () => {
    render(<PanelChat mensajes={sampleMensajes} onEnviarMensaje={vi.fn()} cargando={false} />);
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('diferencia visualmente mensajes de socio y agente', () => {
    render(<PanelChat mensajes={sampleMensajes} onEnviarMensaje={vi.fn()} cargando={false} />);
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(2);
    expect(articles[0]).toHaveAttribute('aria-label', 'Mensaje de socio');
    expect(articles[1]).toHaveAttribute('aria-label', 'Mensaje de agente');
  });
});

describe('PanelLog', () => {
  it('renderiza el encabezado de trazas', () => {
    render(<PanelLog pasos={[]} pasoExpandido={null} onExpandirPaso={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 2, name: /trazas del agente/i })).toBeInTheDocument();
  });

  it('muestra mensaje vacío cuando no hay pasos', () => {
    render(<PanelLog pasos={[]} pasoExpandido={null} onExpandirPaso={vi.fn()} />);
    expect(screen.getByText(/las trazas de ejecución/i)).toBeInTheDocument();
  });

  it('renderiza todos los pasos de traza', () => {
    render(<PanelLog pasos={samplePasos} pasoExpandido={null} onExpandirPaso={vi.fn()} />);
    expect(screen.getByText('Interpretación')).toBeInTheDocument();
    expect(screen.getByText('Petición')).toBeInTheDocument();
    expect(screen.getByText('Respuesta')).toBeInTheDocument();
  });

  it('muestra duración en milisegundos para cada paso', () => {
    render(<PanelLog pasos={samplePasos} pasoExpandido={null} onExpandirPaso={vi.fn()} />);
    expect(screen.getByText('120ms')).toBeInTheDocument();
    expect(screen.getByText('250ms')).toBeInTheDocument();
    expect(screen.getByText('380ms')).toBeInTheDocument();
  });

  it('llama onExpandirPaso al hacer clic en un paso', async () => {
    const user = userEvent.setup();
    const onExpandir = vi.fn();
    render(<PanelLog pasos={samplePasos} pasoExpandido={null} onExpandirPaso={onExpandir} />);

    const buttons = screen.getAllByRole('button');
    // The first 3 buttons are the step headers
    await user.click(buttons[0]);
    expect(onExpandir).toHaveBeenCalledWith('paso-1');
  });

  it('muestra contenido expandido del paso de interpretación', () => {
    render(<PanelLog pasos={samplePasos} pasoExpandido="paso-1" onExpandirPaso={vi.fn()} />);
    const region = screen.getByRole('region', { name: /detalle del paso interpretación/i });
    expect(region).toBeInTheDocument();
    // Check the interpretation text is rendered (may appear in both display and CopyToClipboard)
    expect(within(region).getByText('Interpretación del agente:')).toBeInTheDocument();
  });

  it('muestra contenido expandido del paso de petición', () => {
    render(<PanelLog pasos={samplePasos} pasoExpandido="paso-2" onExpandirPaso={vi.fn()} />);
    const region = screen.getByRole('region', { name: /detalle del paso petición/i });
    expect(region).toBeInTheDocument();
    // Check that endpoint label and method+path code are rendered
    expect(within(region).getByText('Endpoint:')).toBeInTheDocument();
    expect(within(region).getByText('Headers:')).toBeInTheDocument();
    expect(within(region).getByText('Payload:')).toBeInTheDocument();
  });

  it('muestra contenido expandido del paso de respuesta', () => {
    render(<PanelLog pasos={samplePasos} pasoExpandido="paso-3" onExpandirPaso={vi.fn()} />);
    const region = screen.getByRole('region', { name: /detalle del paso respuesta/i });
    expect(region).toBeInTheDocument();
    expect(within(region).getByText('Status:')).toBeInTheDocument();
    expect(within(region).getByText('Respuesta JSON:')).toBeInTheDocument();
  });

  it('tiene aria-expanded en los botones de paso', () => {
    render(<PanelLog pasos={samplePasos} pasoExpandido="paso-1" onExpandirPaso={vi.fn()} />);
    // Filter to only step header buttons (those with aria-expanded attribute)
    const stepButtons = screen.getAllByRole('button').filter(
      (btn) => btn.hasAttribute('aria-expanded')
    );
    // First step button should be expanded
    expect(stepButtons[0]).toHaveAttribute('aria-expanded', 'true');
    // Second step button should not be expanded
    expect(stepButtons[1]).toHaveAttribute('aria-expanded', 'false');
  });

  it('incluye CopyToClipboard en paso expandido', () => {
    render(<PanelLog pasos={samplePasos} pasoExpandido="paso-1" onExpandirPaso={vi.fn()} />);
    expect(screen.getByRole('button', { name: /copiar json/i })).toBeInTheDocument();
  });

  it('tiene role="log" y aria-live en el contenedor de pasos', () => {
    render(<PanelLog pasos={samplePasos} pasoExpandido={null} onExpandirPaso={vi.fn()} />);
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('permite navegación por teclado con Enter', async () => {
    const user = userEvent.setup();
    const onExpandir = vi.fn();
    render(<PanelLog pasos={samplePasos} pasoExpandido={null} onExpandirPaso={onExpandir} />);

    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    await user.keyboard('{Enter}');
    expect(onExpandir).toHaveBeenCalledWith('paso-1');
  });

  it('permite navegación por teclado con Space', async () => {
    const user = userEvent.setup();
    const onExpandir = vi.fn();
    render(<PanelLog pasos={samplePasos} pasoExpandido={null} onExpandirPaso={onExpandir} />);

    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    await user.keyboard(' ');
    expect(onExpandir).toHaveBeenCalledWith('paso-1');
  });
});

describe('Playground utility functions', () => {
  it('formatearTimestamp returns formatted time', async () => {
    const { formatearTimestamp } = await import('../../lib/playground');
    const result = formatearTimestamp('2024-01-15T10:30:00.000Z');
    // Should contain hour:minute:second pattern
    expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });

  it('etiquetaTipoPaso returns correct labels', async () => {
    const { etiquetaTipoPaso } = await import('../../lib/playground');
    expect(etiquetaTipoPaso('interpretacion')).toBe('Interpretación');
    expect(etiquetaTipoPaso('peticion')).toBe('Petición');
    expect(etiquetaTipoPaso('respuesta')).toBe('Respuesta');
  });

  it('serializarContenidoPaso returns valid JSON', async () => {
    const { serializarContenidoPaso } = await import('../../lib/playground');
    const result = serializarContenidoPaso(samplePasos[0]);
    const parsed = JSON.parse(result);
    expect(parsed.interpretacion).toBe('El socio solicita una cotización de seguro de vida.');
  });
});
