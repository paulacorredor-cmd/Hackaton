import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ModeSelector } from '../ModeSelector';
import type { RadioOptionConfig } from '../types';

const options: RadioOptionConfig[] = [
  {
    id: 'assisted',
    title: 'Con ayuda de un asistente IA',
    description: 'Un par de preguntas para entender lo ocurrido.',
    badge: 'Inteligencia artificial',
  },
  {
    id: 'self-service',
    title: 'Continuar sin ayuda',
    description: 'Prefiero completar el reporte por mi cuenta.',
  },
];

const defaultProps = {
  selectedMode: null as null,
  onSelectMode: vi.fn(),
  options,
};

describe('ModeSelector', () => {
  it('renderiza ambas opciones con títulos y descripciones', () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByText('Con ayuda de un asistente IA')).toBeInTheDocument();
    expect(screen.getByText('Un par de preguntas para entender lo ocurrido.')).toBeInTheDocument();
    expect(screen.getByText('Continuar sin ayuda')).toBeInTheDocument();
    expect(screen.getByText('Prefiero completar el reporte por mi cuenta.')).toBeInTheDocument();
  });

  it('muestra la insignia "Inteligencia artificial" en la primera opción', () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByText('Inteligencia artificial')).toBeInTheDocument();
  });

  it('no muestra insignia en la segunda opción', () => {
    render(<ModeSelector {...defaultProps} />);

    const radios = screen.getAllByRole('radio');
    // Second radio should not contain a badge
    expect(radios[1].querySelector('.badge')).toBeNull();
  });

  it('tiene role="radiogroup" en el contenedor', () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('tiene role="radio" en cada opción', () => {
    render(<ModeSelector {...defaultProps} />);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  it('tiene aria-labelledby en el radiogroup', () => {
    render(<ModeSelector {...defaultProps} />);

    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toHaveAttribute('aria-labelledby');
  });

  it('marca aria-checked="true" solo en la opción seleccionada', () => {
    render(<ModeSelector {...defaultProps} selectedMode="assisted" />);

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('marca aria-checked="false" en ambas cuando no hay selección', () => {
    render(<ModeSelector {...defaultProps} />);

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('invoca onSelectMode al hacer click en una opción', async () => {
    const onSelectMode = vi.fn();
    const user = userEvent.setup();

    render(<ModeSelector {...defaultProps} onSelectMode={onSelectMode} />);

    await user.click(screen.getAllByRole('radio')[0]);
    expect(onSelectMode).toHaveBeenCalledWith('assisted');
  });

  it('invoca onSelectMode al hacer click en la segunda opción', async () => {
    const onSelectMode = vi.fn();
    const user = userEvent.setup();

    render(<ModeSelector {...defaultProps} onSelectMode={onSelectMode} />);

    await user.click(screen.getAllByRole('radio')[1]);
    expect(onSelectMode).toHaveBeenCalledWith('self-service');
  });

  it('resalta visualmente la opción seleccionada', () => {
    render(<ModeSelector {...defaultProps} selectedMode="assisted" />);

    const radios = screen.getAllByRole('radio');
    expect(radios[0].className).toContain('optionSelected');
    expect(radios[1].className).not.toContain('optionSelected');
  });

  it('navega con ArrowDown y selecciona la siguiente opción', async () => {
    const onSelectMode = vi.fn();
    const user = userEvent.setup();

    render(
      <ModeSelector
        {...defaultProps}
        selectedMode="assisted"
        onSelectMode={onSelectMode}
      />
    );

    const radios = screen.getAllByRole('radio');
    radios[0].focus();
    await user.keyboard('{ArrowDown}');

    expect(onSelectMode).toHaveBeenCalledWith('self-service');
  });

  it('navega con ArrowUp y selecciona la opción anterior (wrap)', async () => {
    const onSelectMode = vi.fn();
    const user = userEvent.setup();

    render(
      <ModeSelector
        {...defaultProps}
        selectedMode="assisted"
        onSelectMode={onSelectMode}
      />
    );

    const radios = screen.getAllByRole('radio');
    radios[0].focus();
    await user.keyboard('{ArrowUp}');

    expect(onSelectMode).toHaveBeenCalledWith('self-service');
  });

  it('selecciona la opción enfocada con Enter', async () => {
    const onSelectMode = vi.fn();
    const user = userEvent.setup();

    render(
      <ModeSelector
        {...defaultProps}
        selectedMode="assisted"
        onSelectMode={onSelectMode}
      />
    );

    const radios = screen.getAllByRole('radio');
    radios[0].focus();
    await user.keyboard('{Enter}');

    expect(onSelectMode).toHaveBeenCalledWith('assisted');
  });

  it('selecciona la opción enfocada con Space', async () => {
    const onSelectMode = vi.fn();
    const user = userEvent.setup();

    render(
      <ModeSelector
        {...defaultProps}
        selectedMode="assisted"
        onSelectMode={onSelectMode}
      />
    );

    const radios = screen.getAllByRole('radio');
    radios[0].focus();
    await user.keyboard(' ');

    expect(onSelectMode).toHaveBeenCalledWith('assisted');
  });

  it('Tab mueve el foco al primer radio cuando no hay selección', async () => {
    const user = userEvent.setup();

    render(<ModeSelector {...defaultProps} />);

    const radios = screen.getAllByRole('radio');
    // First radio should have tabIndex 0, second -1
    expect(radios[0]).toHaveAttribute('tabindex', '0');
    expect(radios[1]).toHaveAttribute('tabindex', '-1');
  });

  it('Tab mueve el foco al radio seleccionado', () => {
    render(<ModeSelector {...defaultProps} selectedMode="self-service" />);

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('tabindex', '-1');
    expect(radios[1]).toHaveAttribute('tabindex', '0');
  });
});
